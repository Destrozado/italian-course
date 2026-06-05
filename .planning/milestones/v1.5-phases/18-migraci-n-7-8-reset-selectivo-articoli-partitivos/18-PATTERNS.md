# Phase 18: Migración `7→8` (reset selectivo articoli + partitivos) - Mapa de Patrones

**Mapeado:** 2026-06-04
**Archivos a tocar:** 3 modificados (`storage.js`, `backup.js`, `tests/data-storage.test.js`) + 1 modificado opcional (`tests/backup.test.js`)
**Analogs encontrados:** 4 / 4 (todos clon literal del precedente Phase 17)

> Fase de **migración de datos pura** que CLONA un patrón ya validado (`migrate6to7` / `hydrateV7`, plan 17-01). No hay diseño nuevo: el planner especifica un clon literal renombrado `7→8`/`V8` con UNA desviación funcional — el filtro de reset opera sobre **DOS** prefijos (`articoli` + `partitivos`) en vez de uno (`preposiciones`).

---

## File Classification

| Archivo a modificar | Rol | Data Flow | Analog más cercano | Calidad del match |
|---------------------|-----|-----------|--------------------|-------------------|
| `src/data/storage.js` (añadir `migrate7to8` + `hydrateV8`, bump `CURRENT_SCHEMA_VERSION`, extender cadena `migrate()`) | model / migration | transform (state in → state out) | `migrate6to7` / `hydrateV7` en el mismo archivo | exacto (clon literal con 2 prefijos) |
| `src/data/backup.js` (bump `CURRENT_SCHEMA_VERSION` espejo, añadir eslabón a la cadena, actualizar import) | model / migration | transform / request-response (parse→migrate→summary) | `parseBackupFile` / `buildBackupWrapper` actuales (v7) | exacto |
| `tests/data-storage.test.js` (clonar bloque `describe` v7 → v8) | test | transform-assertion | `describe('… migrate6to7 reset selectivo de Preposiciones (Phase 17)')` (líneas 687-849) | exacto |
| `tests/backup.test.js` (clonar bloque round-trip v7 → v8) | test | transform-assertion | `describe('data/backup v7 — round-trip + import v6→v7 (Phase 17)')` (líneas 212-286) | exacto |

**Nota de corrección sobre CONTEXT.md:** el canonical_ref menciona `src/data/schema-validator.js` para `normalizeExerciseToSlot`. La función vive en realidad en **`src/data/content-loader.js` (línea 43)**, no en `schema-validator.js`. Solo es contexto de por qué articoli/partitivos siguen cargando tras el reset (ver sección "Contexto del modelo de datos"); NO se modifica en esta fase.

---

## Pattern Assignments

### `src/data/storage.js` — `migrate7to8` (model / migration, transform)

**Analog:** `migrate6to7` (`src/data/storage.js` líneas 604-643).

**El clon literal con la ÚNICA desviación** — donde Phase 17 filtra 1 prefijo, Phase 18 filtra 2. Patrón actual a copiar (líneas 604-643):

```javascript
export function migrate6to7(v6) {
  // (1) Reset de categoryProgress.preposiciones tras deep-clone defensivo.
  const categoryProgress = (typeof v6.categoryProgress === 'object' && v6.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v6.categoryProgress))
    : {};
  delete categoryProgress.preposiciones;

  // (2) Poda por prefijo de exerciseStats['preposiciones*'] tras deep-clone.
  const exerciseStatsAll = (typeof v6.exerciseStats === 'object' && v6.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v6.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!k.startsWith('preposiciones')) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de Preposiciones (Pitfall 3).
  let inFlightTest = v6.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && id.startsWith('preposiciones'))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 7,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v6.dailyLog === 'object' && v6.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v6.dailyLog))
      : {},
    songProgress: (typeof v6.songProgress === 'object' && v6.songProgress !== null)
      ? JSON.parse(JSON.stringify(v6.songProgress))
      : {},
    lastBackupAt: typeof v6.lastBackupAt === 'string' ? v6.lastBackupAt : null,
    firstUsedAt: typeof v6.firstUsedAt === 'string' ? v6.firstUsedAt : null,
    inFlightTest
  };
}
```

**Transformación exacta a aplicar en `migrate7to8(v7)`:**
- `schemaVersion: 7` → `schemaVersion: 8`; firma `(v6)` → `(v7)`, referencias `v6.X` → `v7.X`.
- (1) `delete categoryProgress.preposiciones;` → **dos deletes**: `delete categoryProgress.articoli;` + `delete categoryProgress.partitivos;`
- (2) Filtro: `if (!k.startsWith('preposiciones'))` → `if (!k.startsWith('articoli') && !k.startsWith('partitivos'))`
- (3) Guard de inFlightTest: `id.startsWith('preposiciones')` → `(id.startsWith('articoli') || id.startsWith('partitivos'))`
- Devolver `schemaVersion: 8`. Todo lo demás (deep-clone defensivo por sub-dict, timestamps, songProgress, dailyLog) **idéntico byte a byte**.

**Por qué el filtro por prefijo es seguro (D-03):** las otras 7 categorías (`avere`, `essere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`) NO empiezan por `articoli` ni `partitivos`. (El id de partitivos es `partitivos` en español aunque el display sea "Partitivi".) El comentario JSDoc del analog ya enumera las 9 categorías — actualizar el texto del comentario a "2 prefijos: articoli + partitivos" y citar D-18 en vez de D-17-08.

---

### `src/data/storage.js` — `hydrateV8` (model / migration, transform)

**Analog:** `hydrateV7` (`src/data/storage.js` líneas 666-685).

`hydrateV8` es espejo LITERAL de `hydrateV7` con la versión a 8 y **SIN poda** (solo garantiza shape — la poda es responsabilidad de `migrate7to8` durante la cadena, igual que `hydrateV7` vs `migrate6to7`). Patrón actual a copiar (líneas 666-685):

```javascript
export function hydrateV7(parsed) {
  return {
    schemaVersion: 7,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}
```

**Transformación:** `schemaVersion: 7` → `8`. Nada más cambia (sin poda, sin filtros).

---

### `src/data/storage.js` — `CURRENT_SCHEMA_VERSION`, `blankState()`, cadena `migrate()`

**Tres integration points concretos (mismo molde que el bump 6→7):**

**1. Constante (línea 35):**
```javascript
const CURRENT_SCHEMA_VERSION = 7;   // → cambiar a 8
```

**2. `blankState()` (líneas 57-68):** el bump es NOMINAL — `blankState` no tiene progreso que resetear, así que su shape root es idéntico salvo el número de versión (que ya sale de `CURRENT_SCHEMA_VERSION`, por lo que **no hay edición de código** en `blankState`, solo en la constante; actualizar el JSDoc de `blankState` líneas 37-55 si se documenta la fase). El JSDoc actual cita "D-17-08 Phase 17 … resetea SOLO el progreso de Preposiciones" — añadir Phase 18 (articoli + partitivos).

**3. Cadena `migrate()` (líneas 138-153)** — patrón fall-through sobre `s.schemaVersion`:
```javascript
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) s = migrate3to4(s);
  if (s.schemaVersion === 4) s = migrate4to5(s);
  if (s.schemaVersion === 5) s = migrate5to6(s);
  if (s.schemaVersion === 6) s = migrate6to7(s);
  if (s.schemaVersion === 7) return hydrateV7(s);   // ← cambiar este eslabón
  // ...
}
```
Insertar **antes** del eslabón hydrate actual:
```javascript
  if (s.schemaVersion === 7) s = migrate7to8(s);
  if (s.schemaVersion === 8) return hydrateV8(s);
```
(la línea `if (s.schemaVersion === 7) return hydrateV7(s);` deja de ser terminal — pasa a `migrate7to8`. Mantener `hydrateV7` exportado por backward-compat de tests, igual que `hydrateV2`/`hydrateV3` se conservan.)

---

### `src/data/backup.js` — espejo de la constante + cadena (model / migration)

**Analog:** el propio `backup.js` actual (v7).

**1. Import (línea 26):**
```javascript
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7 } from './storage.js';
```
→ añadir `migrate7to8, hydrateV8` (mantener `hydrateV7` si el código aún lo referencia; tras el cambio la cadena terminará en `hydrateV8`).

**2. Constante espejo (línea 39):**
```javascript
const CURRENT_SCHEMA_VERSION = 7;   // → 8 (espejo de storage.js, mantener inline)
```
Actualizar el JSDoc de la constante (líneas 28-38) añadiendo el eslabón Phase 18.

**3. Cadena de migración dentro de `parseBackupFile` (líneas 116-124):**
```javascript
  let migrated = state;
  if (migrated.schemaVersion === 1) migrated = migrate1to2(migrated);
  if (migrated.schemaVersion === 2) migrated = migrate2to3(migrated);
  if (migrated.schemaVersion === 3) migrated = migrate3to4(migrated);
  if (migrated.schemaVersion === 4) migrated = migrate4to5(migrated);
  if (migrated.schemaVersion === 5) migrated = migrate5to6(migrated);
  if (migrated.schemaVersion === 6) migrated = migrate6to7(migrated);
  migrated = hydrateV7(migrated);
```
→ insertar `if (migrated.schemaVersion === 7) migrated = migrate7to8(migrated);` antes del hydrate final, y cambiar el hydrate final a `migrated = hydrateV8(migrated);`.

**4. Forward-compat (líneas 108-114):** sin cambios de código — el rechazo `state.schemaVersion > CURRENT_SCHEMA_VERSION` ya cubre `> 8` automáticamente al bumpear la constante. (Cubre D-05: backups con `schemaVersion > 8` se rechazan.)

**`buildBackupWrapper` (líneas 148-155):** sin cambios — espeja `state.schemaVersion` dinámicamente, ya devuelve 8 cuando el state es v8.

---

### `tests/data-storage.test.js` — clon del bloque `describe` de migración (test)

**Analog:** `describe('data/storage v7 — migrate6to7 reset selectivo de Preposiciones (Phase 17)')` (líneas 687-849).

**Import (línea 28)** — añadir `migrate7to8, hydrateV8`:
```javascript
import { blankState, migrate1to2, hydrateV2, migrate2to3, hydrateV3, migrate3to4, hydrateV4, migrate4to5, hydrateV5, migrate5to6, hydrateV6, migrate6to7, hydrateV7 } from '../src/data/storage.js';
```

**Set de tests a clonar (cada uno renombrado 6to7→7to8, v6→v7, v7→v8):**

| Test del analog (línea) | Qué afirma | Cambio en el clon v8 |
|-------------------------|------------|----------------------|
| `borra categoryProgress.preposiciones y deja avere intacto` (709) | delete del prefijo + preserva otra categoría | borra `articoli` **y** `partitivos`; preserva `avere` |
| `poda exerciseStats con prefijo preposiciones y preserva avere/partitivos` (721) | filtro por prefijo | poda `articoli-*` **y** `partitivos-*`; preserva `avere` (¡el helper ya no debe usar partitivos como "preservado"!) |
| `invalida inFlightTest que referencia ids de Preposiciones` (731) | reset de inFlightTest | ids `articoli-*` o `partitivos-*` invalidan |
| `preserva inFlightTest que NO toca Preposiciones` (746) | inFlightTest ajeno intacto | usar ids de `avere`/`essere` |
| `sin inFlightTest no crashea y preserva undefined` (761) | sin cambio funcional | renombrar |
| `es idempotente` (767) | `migrate7to8(migrate7to8(x))` deep-equals | renombrar |
| `es puro (no muta el input)` (775) | input v7 conserva articoli/partitivos | renombrar |
| `anti-prototype-pollution: __proto__ own-property no contamina` (784) | `({}).polluted === undefined` | renombrar; fixture `schemaVersion:7` |
| `con sub-dict no-objeto (corrupto) cae a {}` (791) | type-guards defensivos | renombrar |
| `hydrateV7 es espejo … SIN poda` (802) | `hydrateV8` no poda | renombrar; preserva articoli/partitivos si presentes |
| `hydrateV7 sobre v7 con sub-dicts ausentes los normaliza a {}` (823) | normalización | renombrar |
| `cadena v6 → v7: … reseteada, … preservados` (835) | `hydrateV8(migrate7to8(...))` | renombrar |

**Helper fixture a clonar (líneas 688-707)** — adaptar `v6WithPreposiciones()` → `v7WithArticoliPartitivos()`:
```javascript
function v6WithPreposiciones() {
  return {
    schemaVersion: 6,
    exerciseStats: {
      'preposiciones-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
      'preposiciones-052': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
      'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
      'partitivos-001': { timesShown: 2, timesCorrect: 1, timesFailed: 1 }
    },
    categoryProgress: {
      preposiciones: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-05-30' },
      avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' }
    },
    dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['preposiciones', 'avere'], categoriesWithFailure: [] } },
    songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
    lastBackupAt: '2026-05-22T10:00:00.000Z',
    firstUsedAt: '2026-04-01T08:00:00.000Z'
  };
}
```
**Adaptación para v8:** `schemaVersion: 7`; el fixture debe tener progreso en **articoli Y partitivos** (los DOS reseteados) más al menos `avere`/`essere` como "preservados". OJO: en el analog `partitivos-001` se usaba como ASSERT-preservado (línea 728) — en v8 partitivos pasa a ser RESETEADO, así que el clon debe cambiar ese assert a `avere`/`essere`.

**Test de no-regresión REFORZADO (D-04, más fuerte que el analog):** además de los clones, añadir UN test con fixture que tenga progreso en **las 9 categorías** (`avere`, `essere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`, `articoli`, `partitivos`) en `categoryProgress` y `exerciseStats`, y afirmar:
- (a) `articoli` + `partitivos` ausentes de `categoryProgress` y `exerciseStats` tras `migrate7to8`;
- (b) las **7 restantes** deep-equal byte a byte pre/post (`assert.deepEqual` de cada categoría preservada). El analog solo cubría 1 categoría preservada (`avere`, línea 717); D-04 exige las 7.

---

### `tests/backup.test.js` — clon del bloque round-trip (test)

**Analog:** `describe('data/backup v7 — round-trip + import v6→v7 (Phase 17)')` (líneas 212-286).

**Tres tests a clonar (líneas 234, 243, 253):**
- `round-trip v8: export → import sin "versión más nueva"` (espeja `wrapper.schemaVersion === 8`, `r.state.schemaVersion === 8`).
- `round-trip v8 preserva avere/essere progreso intacto`.
- `import de backup v7 → state v8 con articoli/partitivos reseteados` (clon de "import v6 → v7"): fixture v7 con progreso en articoli + partitivos + avere; afirmar que tras `parseBackupFile` articoli/partitivos quedan podados y avere se preserva (cubre D-06: progreso de articoli/partitivos en un backup viejo se pierde por diseño).

Helper `stateV7()` (líneas 215-232) → `stateV8()` con `schemaVersion: 8`. Los tests existentes que afirman `r.state.schemaVersion === 7` (líneas 121, 155, 175, 196, 240, 277) deben actualizarse a **8** porque la cadena ahora termina en v8.

---

## Shared Patterns

### Deep-clone defensivo anti-prototype-pollution (CR-03 / T-04-02)
**Source:** presente en toda la cadena de migración, p.ej. `migrate6to7` (`src/data/storage.js` líneas 606-614).
**Apply to:** `migrate7to8` y `hydrateV8` — TODOS los sub-dicts.
```javascript
const categoryProgress = (typeof v7.categoryProgress === 'object' && v7.categoryProgress !== null)
  ? JSON.parse(JSON.stringify(v7.categoryProgress))
  : {};
```
Crítico: la poda (`delete` + filtro de claves) DEBE operar sobre el clon, nunca sobre el input — garantiza pureza (no muta el input del autor) y neutraliza getters / `__proto__` como own-property.

### Reconstrucción literal del root (sin asignar `__proto__` como prototipo)
**Source:** todos los `migrateNtoM` (return `{ schemaVersion: N, ... }`).
**Apply to:** `migrate7to8` / `hydrateV8` — devolver objeto literal fresco con `schemaVersion: 8`.

### `migrateNtoM` poda; `hydrateVN` NO poda (solo shape)
**Source:** `migrate6to7` (poda Preposiciones) vs `hydrateV7` (espejo sin poda).
**Apply to:** `migrate7to8` hace los 2 deletes + filtro + invalidación de inFlightTest; `hydrateV8` solo garantiza shape con type-guards. (Confirmado por D-33 de CONTEXT: "`hydrateV8` NO repite la poda".)

### Reset = racha 0 + dominada perdida + veces-hechas 0 (PILOT-04 / D-02)
**Source:** efecto combinado de `delete categoryProgress.<cat>` (la categoría re-lazy-inicializa como no-hecha, racha 0 vía D-47) + poda de `exerciseStats.<cat>*` (veces-hechas 0).
**Apply to:** ambos prefijos articoli + partitivos.

### Reset por prefijo de id cubre ids legacy Y futuros de slot
**Source:** comentario de `migrate6to7` líneas 576-579 ("cubre tanto los ids legacy … como los nuevos ids de slot").
**Apply to:** clave para Phase 18 — tras las Phases 19/20 los ids de articoli/partitivos seguirán empezando por esos prefijos, así que el filtro `startsWith` resiste la renumeración futura.

---

## Contexto del modelo de datos (no se modifica)

### `normalizeExerciseToSlot` — por qué articoli/partitivos siguen cargando tras el reset
**Source:** `src/data/content-loader.js` línea 43 (NO `schema-validator.js` — corrección al CONTEXT.md).
Un ejercicio legacy (solo `payload`, sin `variants[]`) se normaliza a un **slot de 1 variante** (líneas 55-63). Por eso, tras Phase 18, articoli/partitivos quedan con progreso reseteado pero contenido VIEJO que sigue cargando como slots-de-1 (re-verificación inofensiva, D-01) hasta que las Phases 19/20 reagrupen el contenido a slots reales. Esta fase NO toca contenido ni este archivo.

---

## No Analog Found

Ninguno. Los 3 archivos productivos y los 2 de test tienen un analog exacto en el precedente Phase 17 (mismo repositorio, mismo archivo en la mayoría de casos). Es un clon literal con una desviación de 1→2 prefijos.

---

## Metadata

**Scope de búsqueda de analogs:** `src/data/` (storage.js, backup.js, content-loader.js, schema-validator.js), `tests/` (data-storage.test.js, backup.test.js).
**Archivos escaneados:** 6.
**Comando de test del proyecto:** `node --test tests/*.test.js` (per MEMORY — el path desnudo falla en Node 22.20).
**Fecha de extracción:** 2026-06-04.
