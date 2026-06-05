---
phase: 18-migraci-n-7-8-reset-selectivo-articoli-partitivos
reviewed: 2026-06-04T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/data/storage.js
  - src/data/backup.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 18: Informe de Code Review

**Revisado:** 2026-06-04
**Profundidad:** standard
**Archivos revisados:** 4
**Estado:** issues_found

## Resumen

Revisión adversarial de los cambios de la Phase 18: migración `migrate7to8` /
`hydrateV8`, el cableado del dispatcher `migrate()`, los bumps de
`CURRENT_SCHEMA_VERSION` (storage.js + backup.js), el camino round-trip v8 e
import v7→v8 en backup.js, y los tests nuevos/actualizados.

Veredicto: la implementación es **funcionalmente correcta** para el set de
categorías actual. `migrate7to8` es un clon fiel de `migrate6to7` con la única
desviación esperada (reset de DOS prefijos en vez de uno). Verifiqué
directamente contra `content/categories.json` (9 ids) y los ids de ejercicio
reales de cada `content/exercises/*.json` que **no existe colisión de prefijo
actual**: ninguna de las 7 categorías preservadas empieza por `articoli` ni
`partitivos`, y los ids de ejercicio siguen exactamente el prefijo de su
categoría. La cadena del dispatcher (v7→v8→hydrateV8), la frontera
forward-compat (`> 8`) y la paridad de constantes entre los dos módulos están
correctas. Los 96 tests pasan (`node --test`).

Las 5 observaciones son de robustez/mantenibilidad y consistencia documental —
ningún BLOCKER. Las dos WARNING tratan fragilidades latentes que NO afectan al
estado actual pero que la propia Phase 19/20 (renumeración de ids articoli /
partitivos) podría activar, y un gap de cobertura de tests en la frontera de
prefijo.

## Warnings

### WR-01: El filtro `startsWith` es una fragilidad latente para futuras categorías con prefijo solapado

**Archivo:** `src/data/storage.js:723-733, 740`
**Issue:** La poda usa `k.startsWith('articoli')` / `k.startsWith('partitivos')`
sobre las claves de `exerciseStats` y sobre `inFlightTest.exerciseIds`. Esto es
seguro HOY (lo verifiqué contra el contenido real), pero el contrato es frágil:
cualquier categoría futura cuyo id empiece por la subcadena `articoli` o
`partitivos` (p.ej. un hipotético `articoli-determinativi` como categoría
SEPARADA, o `partitivos-avanzado`) sería reseteada silenciosamente por esta
migración aunque no se quiera. El `delete categoryProgress.articoli` (línea 723)
es seguro porque usa igualdad exacta de clave, pero la poda de `exerciseStats`
(prefijo) y la invalidación de `inFlightTest` (prefijo) divergen de esa
semántica exacta. El comentario en `storage.js:700-707` documenta la suposición,
pero una suposición documentada sigue siendo una bomba de relojería: una
migración es código que corre UNA vez y de forma irreversible sobre datos del
autor; un reset accidental por colisión de prefijo es pérdida de progreso
silenciosa.

Nota: este es el mismo patrón heredado de `migrate6to7` (Phase 17), así que no
es una regresión introducida aquí — pero al duplicar el patrón y AÑADIR un
segundo prefijo se duplica también la superficie de colisión.

**Fix:** Anclar el match al separador de id para que `articoli` solo capture
`articoli` exacto o `articoli-*` (no `articolixyz`):
```js
const RESET_PREFIXES = ['articoli', 'partitivos'];
const isReset = (id) =>
  RESET_PREFIXES.some(p => id === p || id.startsWith(p + '-'));
// ...
for (const k of Object.keys(exerciseStatsAll)) {
  if (!isReset(k)) exerciseStats[k] = exerciseStatsAll[k];
}
// y en inFlightTest:
inFlightTest.exerciseIds.some(id => typeof id === 'string' && isReset(id))
```
Esto estrecha el match al delimitador real (`-`) de los ids de slot/ejercicio,
preservando el comportamiento actual y eliminando la colisión latente.

### WR-02: Falta cobertura de test para la frontera de prefijo (no-colisión negativa)

**Archivo:** `tests/data-storage.test.js:862-1106`
**Issue:** El bloque de tests de `migrate7to8` cubre exhaustivamente el camino
feliz (reset de articoli/partitivos, preservación de las otras 7, idempotencia,
pureza, anti-prototype-pollution, cadena completa). Pero NO hay ningún test que
fije la frontera del prefijo: que una clave que CONTIENE pero no EMPIEZA por
`articoli`/`partitivos` se preserve (p.ej. `avere-articoli-mix` o un
`xpartitivos`), ni un test negativo que documente el comportamiento ante una
clave hipotética tipo `articolista-001`. Sin ese test, el fix de WR-01 (o
cualquier refactor del predicado de match) podría romper la semántica sin que
ningún test rojo lo avise, y queda sin codificar la garantía exacta de "solo
estos dos prefijos, anclados".

**Fix:** Añadir un test de frontera al bloque `migrate7to8`:
```js
test('migrate7to8 NO resetea claves que solo contienen el prefijo sin anclar', () => {
  const v7 = {
    schemaVersion: 7,
    exerciseStats: {
      'articoli-001': { timesShown: 1, timesCorrect: 1, timesFailed: 0 }, // reset
      'avere-001':    { timesShown: 1, timesCorrect: 1, timesFailed: 0 }, // preservado
      // clave-frontera: empieza por la subcadena pero NO es la categoría
      'partitivosX-001': { timesShown: 9, timesCorrect: 9, timesFailed: 0 }
    },
    categoryProgress: {}, dailyLog: {}, songProgress: {},
    lastBackupAt: null, firstUsedAt: null
  };
  const v8 = migrate7to8(v7);
  assert.equal(v8.exerciseStats['articoli-001'], undefined);
  assert.ok(v8.exerciseStats['avere-001']);
  // Documenta la decisión: con el fix anclado, partitivosX-001 SE PRESERVA.
  // (Con el startsWith actual, este test fallaría — revela la fragilidad.)
  assert.ok(v8.exerciseStats['partitivosX-001'],
    'una clave que solo contiene el prefijo sin delimitador no debe resetearse');
});
```
Este test es deliberadamente "rojo" contra el `startsWith` actual: sirve como
prueba ejecutable de WR-01. Si se decide NO arreglar WR-01, el test debe
invertir el assert y documentar explícitamente que las colisiones de prefijo
SE resetean por diseño.

## Info

### IN-01: Constante `CURRENT_SCHEMA_VERSION` duplicada entre módulos sin guard de consistencia

**Archivo:** `src/data/storage.js:35` y `src/data/backup.js:42`
**Issue:** El valor `8` está hardcodeado en ambos archivos. Hoy coinciden
(verificado), y `backup.js:28-29` documenta deliberadamente el inline para no
acoplar al import de storage. Pero nada en código ni en tests falla si en un
futuro bump uno se actualiza y el otro no: un backup del estado actual se
rechazaría con "versión más nueva" o un import migraría a una versión incorrecta.
La divergencia sería silenciosa hasta que el autor intente un round-trip.

**Fix:** O bien `backup.js` importa la constante desde `storage.js` (rompe el
"testeable independiente" pero elimina la divergencia), o se añade un test de
paridad barato que importe ambos y haga `assert.equal`. Dado que la
independencia del módulo es una decisión explícita (D-02), la opción menos
invasiva es un test:
```js
// tests/backup.test.js — guard de paridad de constantes
import { blankState } from '../src/data/storage.js';
test('CURRENT_SCHEMA_VERSION de backup espeja el de storage (blankState)', () => {
  const wrapper = buildBackupWrapper(blankState());
  const r = parseBackupFile(JSON.stringify(wrapper));
  assert.equal(r.ok, true,
    'un export del blankState actual debe re-importarse sin rechazo de versión');
});
```
Este test cazaría una divergencia futura sin acoplar los módulos.

### IN-02: JSDoc de `parseBackupFile` desactualizado tras el bump a v8

**Archivo:** `src/data/backup.js:20, 13`
**Issue:** El docstring de cabecera dice "state ya migrado a v7" (línea 20) y el
comentario de decisiones menciona la cadena `migrate1to2 → migrate2to3 →
migrate3to4 → hydrateV4` (línea 13), ambos obsoletos: la cadena real ahora
termina en `migrate7to8 → hydrateV8` y el state sale como v8. El cuerpo del
pipeline (líneas 119-128) y el comentario de la constante (líneas 28-41) sí
están actualizados, así que es solo deriva documental, pero induce a error a un
lector futuro.

**Fix:** Actualizar línea 20 a "state ya migrado a v8" y línea 13 a la cadena
vigente (o, mejor, evitar enumerar la cadena completa en el comentario y
referenciar el dispatcher para no volver a quedar obsoleto en el próximo bump).

### IN-03: Comentarios de cabecera de tests describen una versión de schema antigua

**Archivo:** `tests/data-storage.test.js:7, 16-18` y `tests/backup.test.js:9`
**Issue:** El bloque de comentarios de `data-storage.test.js` (líneas 7, 16-18)
todavía afirma que "`blankState()` produce el shape v4" y "`blankState()`
codifica `schemaVersion: 4`", reliquia de la Phase 6. Los asserts reales (líneas
39, 53, 639) ya verifican `schemaVersion: 8`. Igualmente `backup.test.js:9`
("blankState v3"). No afecta a la ejecución (son comentarios), pero contradice
directamente el código de test que lo sigue, lo que erosiona la confianza en los
comentarios como documentación.

**Fix:** Actualizar los comentarios de cabecera a v8, o reemplazarlos por una
nota genérica ("verifica el shape de blankState en la versión actual del
schema") que no requiera mantenimiento por cada bump.

---

_Revisado: 2026-06-04_
_Reviewer: Claude (gsd-code-reviewer)_
_Profundidad: standard_
