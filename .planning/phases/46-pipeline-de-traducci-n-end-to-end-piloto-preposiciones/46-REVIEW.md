---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
reviewed: 2026-08-14T00:00:00Z
depth: deep
files_reviewed: 12
files_reviewed_list:
  - src/data/schema-validator.js
  - index.html
  - app.css
  - scripts/validate-translation-pass.mjs
  - scripts/run-validation-271.mjs
  - tests/count-arrays-lockstep.test.js
  - tests/schema-translation.test.js
  - tests/screen-translation.test.js
  - tests/translation-validator.test.js
  - tests/fixtures/translation-pilot.json
  - docs/TRANSLATION-VALIDATION-PROMPT.md
  - content/exercises/preposiciones.json
findings:
  critical: 3
  warning: 6
  info: 4
  total: 13
status: fixed
fixed_at: 2026-08-14
fixed_scope: critical_warning
fixed_count: 9
deferred_count: 4
fix_report: se arreglaron los 3 CR y los 6 WR, cada uno con su commit atómico y
  verificado con la MISMA mutación del hallazgo. Los 4 Info quedan abiertos en
  .planning/WINDOWS.md (ids 26-29). La mitad no ejecutable de WR-05 (la mecánica de
  x-show en un DOM real) queda declarada como no verificada en WINDOWS.md id 30.
---

# Phase 46: Code Review Report

**Reviewed:** 2026-08-14
**Depth:** deep (cross-file + mutación ejecutada)
**Files Reviewed:** 12
**Status:** fixed (2026-08-14 — los 3 CR y los 6 WR arreglados dentro de la fase; los 4 Info abiertos
en `.planning/WINDOWS.md` ids 26-29. Ver §Resolución al final.)

## Summary

Los invariantes duros de la fase se sostienen, y varios los he verificado EJECUTANDO, no leyendo:

| Invariante | Cómo lo comprobé | Resultado |
|---|---|---|
| **1. Motor byte-intacto (D-46-01)** | `git diff --stat 19f41a9..HEAD` | `src/domain/**` y `src/screens/app.js` **ausentes del diff** ✔ |
| **8. Re-estrechado de `writePass`** (el ítem de más riesgo) | barrido de `applyPassToText` sobre **las 96 direcciones reales** de `preposiciones.json`, comparando slot-a-slot y variante-a-variante contra el original | **cero contaminación**: ni un `validation` de slot alterado, ni una variante hermana tocada, ni un JSON roto ✔ |
| **4/5. GATE-01 muerde y no es tautológico** | mutación 1 (quitar un pase → `pending`) y mutación 2 (borrar un `translationES`) | `TRAD-COV FAIL (95/96)` + exit 1 en las dos ✔ |
| **GATE-02 anti-ceguera** | traducir `avere.json` sin engancharlo al array; y renombrar `TRANSLATION_COVERAGE` | **rojo en los dos casos** (la cláusula de no-vacuidad delata el rename) ✔ |
| **No-leak V5** | inyectar un `<div x-text="…translationES?.text">` sin guard | **rojo antes y después de committear** ✔ |
| **2. `x-text` exclusivo** | los 2 nodos nuevos usan `x-text`; las 9 menciones de `x-html` son prosa de comentario | ✔ (pero ver **WR-01**) |
| **3. Cero cifras transcritas** | grep de `96/50/250/722/758` en todo el código nuevo | el único literal es `expected: 50` de `CATEGORIES`, **pre-existente** y con su guard de coherencia contra disco ✔ |
| **6. `deriveStatus` importado** | 1 solo import, cero reimplementaciones (el propio test lo congela) | ✔ |
| **7. `by` = el que respondió** | test T-46-10 con `caller` inyectado; lo re-corrí | ✔ |
| **9. Secretos** | clave en header, nunca en query, nunca en un `console.*`, nunca en un pase | ✔ (no leí `.env`) |
| **10. Zero-deps** | los 4 imports son `node:*`, `../src/data/`, `./lib/` | ✔ |
| **11. Acentos RAE (PRES-05)** | escaneo de strings de cara al autor en los dos scripts | ✔ (salvo **WR-06**, que es concordancia, no tilde) |
| **Forma del contenido** | escaneo de las 96: claves, NFC, bordes, puntuación, 2 pases, `by` distintos | **uniforme**: `deepseek-chat`×96 + `gemini-3.5-flash-lite`×96, cero anomalías ✔ |
| Baseline de la suite | `node --test tests/*.test.js` | 1245 tests, **4 fail** = los 4 de `requirements-traceability` de la baseline. Cero regresiones ✔ |

Los 13 hallazgos se concentran en **tres huecos que el propio proyecto ya tiene doctrina escrita para
cerrar** y que esta fase dejó abiertos: un sub-gate que calcula un diagnóstico y lo tira (CR-01), un
escritor sobre el corpus sin post-condición de validez (CR-02), y un pase que se persiste sin
validarlo contra el contrato que el propio script acaba de enviar (CR-03). Los tres los reproduje
ejecutando. Además, **tres gates de la fase ya no muerden** porque comparan contra `HEAD` en vez de
contra el pre-fase (WR-01) — y eso también lo verifiqué por mutación + commit.

**Todo `Fix:` de este documento es HIPÓTESIS**, no evidencia: 2 de 4 arreglos de revisor de la Phase
44 eran incorrectos y uno era peor que el bug. Si un fix toca un gate, verifícalo con la MISMA
mutación que aparece citada en su hallazgo (D-46-18).

---

## Critical Issues

### CR-01: TRAD-COV calcula la desincronía `status` escrito vs derivado, la imprime… y la deja FUERA del veredicto

**File:** `scripts/run-validation-271.mjs:898-902` (composición de `tradPass`) · diagnóstico
computado en `:643-646`, impreso en `:781-785` y `:944-948`

**Issue:** `tradPass` es

```js
const tradPass =
  tradAusenciaDeDatos.length === 0 &&
  !anyTranslationLoadError &&
  totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED &&
  totalTranslationActual === TOTAL_TRANSLATION_EXPECTED;
```

`allTranslationInconsistencyAddrs` **no aparece**. Es exactamente el defecto que la cabecera de este
mismo fichero declara arreglado para los slots en su ítem 4: *«Era un warning meramente impreso, y
mientras lo fue el reporter podía cerrar el milestone contradiciendo el fichero que acababa de
leer.»* La fase reintroduce esa forma para la unidad nueva. El comentario de `:643` incluso dice
«Misma desincronía que vigila VAL-09, a nivel de traducción» — pero VAL-09 **sí** entra en
`val09Pass` y esta no entra en `tradPass`.

**VERIFICADO EJECUTANDO** (clon aislado del repo, `preposiciones-col#1`, `status` escrito → `"pending"`
con los `passes` intactos, que derivan `validated`):

```
preposiciones            | 96       | 96         | 0         | 0        | 0
        → Traducción con status escrito ≠ derivado: preposiciones-col#1 (escrito="pending", derivado="validated")
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
        → Status escrito ≠ derivado: preposiciones-col#1 (escrito="pending", derivado="validated")
Milestone gate PASS.
$ echo $?
0
```

`Milestone gate PASS` y exit **0** dos líneas después de imprimir que el fichero se contradice. Y la
suite se queda en su baseline de 4 fallos: **nada lo caza.** La única aserción del árbol que compara
`status` con `deriveStatus` sobre una traducción es
`tests/screen-translation.test.js:256-271`, y solo cubre **la variante canónica** — por eso elegí a
propósito la última traducción del fichero y no la primera.

La dirección que sí se caza es la contraria (escrito `validated`, derivado `pending`/`disputed`),
porque entonces baja el conteo de `validated`. La que se cuela es la que **subestima**, y con ella el
invariante `status === deriveStatus(passes)` — el mismo que `src/data/validation-state.js:20-27`
documenta roto en silencio **3 veces** antes de la Phase 42.

**Fix (HIPÓTESIS):**
```js
// 1. en run-validation-271.mjs — la desincronía es parte del veredicto, no un adorno
const tradPass =
  tradAusenciaDeDatos.length === 0 &&
  !anyTranslationLoadError &&
  allTranslationInconsistencyAddrs.length === 0 &&   // ← espejo de val09Pass
  totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED &&
  totalTranslationActual === TOTAL_TRANSLATION_EXPECTED;
```
Y el gate de contenido correspondiente, que hoy no existe: una aserción sobre **TODAS** las
traducciones del corpus (no solo la canónica), con su cláusula de no-vacuidad delante, del molde de
`tests/content-fare-indicativo.test.js:735-741`.

**Verificación exigida al fix:** re-correr la mutación de arriba (`status` de la ÚLTIMA traducción a
`"pending"`) y observar `TRAD-COV FAIL` + exit 1. Un fix que solo se lee no está verificado.

---

### CR-02: el escritor puede dejar el corpus con JSON inválido, y lo escribe sin comprobarlo

**File:** `scripts/validate-translation-pass.mjs:504-516` (rama INSERT) y `:524-534`
(`writeTranslationPass`)

**Issue:** `writeTranslationPass` hace `fs.writeFileSync(file, out.text)` **sin verificar que
`out.text` siga siendo JSON parseable**. El splice quirúrgico de `applyPassToText` es una
transformación de texto, no una serialización: puede producir texto inválido, y cuando lo hace, el
fichero de contenido queda roto en disco.

**VERIFICADO EJECUTANDO** — `translationES` sin campos (`{}`) produce una coma huérfana:

```
          "correctIndex": 0,
          "translationES": {,
            "validation": {
...
NO PARSEA: Expected property name or '}' in JSON at position 269
```

La causa es que la rama INSERT asume que hay un campo previo del que colgar la coma:
`headTrimmed` termina en `{` y `insertion` empieza en `,`.

Por la CLI ese caso es hoy inalcanzable (`resolveTarget:173-176` exige `translationES.text` no vacío
y sale con exit 2). Lo que lo convierte en real es que **`applyPassToText` y `writeTranslationPass`
son exports públicos** y ya se invocan directamente desde `tests/translation-validator.test.js:343`,
saltándose `resolveTarget`. Cualquier futuro llamador —o un refactor del entrypoint— escribe la
corrupción en `content/exercises/*.json` sin que nada lo detenga.

Dos agravantes del mismo punto:
1. **La escritura no es atómica.** `writeFileSync` sobre el fichero original: si el proceso muere a
   mitad (y sí muere sin capturar — ver WR-02), el corpus queda truncado. El `withFileLock` protege
   del *lost update* entre procesos, no de esto.
2. La rama INSERT es la que se va a ejecutar **cientos de veces** en las Phases 47-53, sobre 722
   traducciones. La post-condición cuesta una línea.

**Fix (HIPÓTESIS):**
```js
export async function writeTranslationPass(file, slotId, k, pass) {
  return withFileLock(file, () => {
    const text = fs.readFileSync(file, 'utf8');
    const out = applyPassToText(text, slotId, k, pass);
    // POST-CONDICIÓN: un splice de texto no garantiza JSON. Fail-loud ANTES de tocar el disco.
    try { JSON.parse(out.text); }
    catch (e) { throw new Error(`el pase de ${slotId}#${k} habría dejado ${file} con JSON inválido (${e.message}); no se escribió nada`); }
    // ATÓMICO: temp + rename, para que un crash a mitad no trunque el corpus.
    const tmp = `${file}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, out.text);
    fs.renameSync(tmp, file);
    ...
```
Y en `applyPassToText`, rechazar explícitamente el `translationES` sin campos antes de componer la
inserción (hoy `resolveTarget` lo hace, pero el escritor no se defiende solo).

**Verificación exigida al fix:** re-ejecutar
`applyPassToText(text, slot, k, pass)` sobre una variante con `translationES: {}` y observar el
throw; y re-correr el barrido de las 96 direcciones reales para confirmar que la post-condición no
introduce falsos rojos.

---

### CR-03: el `verdict` del modelo se persiste en el corpus SIN validarlo contra el contrato §4 — y un negativo mal escrito se pierde

**File:** `scripts/validate-translation-pass.mjs:313-318`

**Issue:** `run()` solo comprueba que existan las claves (`if (!verdict || !verdict.verdict ||
!verdict.criteria)`), y luego escribe `verdict.verdict` **tal cual** en `passes[]`.
`docs/TRANSLATION-VALIDATION-PROMPT.md:279` declara el enum cerrado
(`"correcta" | "incorrecta"`), y `deriveStatus` compara por igualdad exacta
(`p?.verdict === 'incorrecta'`, case-sensitive). Consecuencia: cualquier desviación del contrato
**se traga en silencio**.

**VERIFICADO EJECUTANDO** (caller simulado que devuelve `"verdict":"PASS"` y `"concerns"` como
string):

```
✔ actualizado pase m1 → pilot-tr-gemelas#1.translationES (status: pending)
en disco: {"status":"pending","passes":[{"by":"m1","date":"2026-08-13","verdict":"PASS","concerns":[]}]}
deriveStatus: pending
```

El pase basura entra en el audit trail y **ocupa el slot de ese `by`**. La consecuencia grave se
deriva de ahí: un `verdict` negativo con una mayúscula o una letra de más (`"Incorrecta"`,
`"incorrecto"`, `"incorrecta."`) **NO** dispara el sticky-disputed de `deriveStatus`; se ignora como
si no existiera, y la traducción puede alcanzar `validated` a costa de otros dos `correcta`. Es
`incorrecta` perdida fabricando un quórum falso — el mismo daño que el invariante del `by` real
existe para impedir, por la otra puerta.

Segundo efecto del mismo hueco: el `.filter((c) => typeof c === 'string')` de `:317` convierte
`concerns` no-array en `[]` **en silencio**. El contrato §4 exige que un criterio en `false` traiga
al menos un concern; si el modelo emite los concerns como string, el motivo escrito desaparece y
queda un `incorrecta` con `concerns: []` — indistinguible de un bug de registro. Y el proyecto ya
tiene doctrina de que la disidencia se resuelve con motivo escrito, nunca con atajo.

**Fix (HIPÓTESIS):**
```js
const VERDICTS = new Set(['correcta', 'incorrecta']);
const CRITERIA = ['s1_natural', 's2_fidelidad', 's4_acentos', 's5_italiano', 's6_naturalidad'];
// … tras extractJsonBlock, ANTES de construir el pase:
if (!VERDICTS.has(verdict.verdict)) {
  console.error(`[${model}] verdict fuera del contrato §4: ${JSON.stringify(verdict.verdict)} (intento ${attempt}). Reintentando…`);
  if (attempt === maxRetries) break;
  continue;
}
if (!Array.isArray(verdict.concerns)) { /* mismo trato: reintento, no coerción silenciosa */ }
const faltan = CRITERIA.filter((c) => typeof verdict.criteria?.[c] !== 'boolean');
if (faltan.length) { /* reintento nombrando las keys que faltan */ }
if (verdict.verdict === 'incorrecta' && verdict.concerns.length === 0) { /* reintento: §4 lo prohíbe */ }
```
Reutilizar el camino de reintento que ya existe para «sin bloque JSON válido» mantiene el
comportamiento coherente y no inventa una rama nueva.

**Verificación exigida al fix:** re-ejecutar `run()` con un caller que devuelva `"PASS"`, luego
`"Incorrecta"`, luego `concerns` como string, y observar que **ninguno** de los tres llega al disco.

---

## Warnings

### WR-01: tres gates de la fase dejaron de morder al committear — comparan contra `HEAD`, no contra el pre-fase

**File:** `tests/screen-translation.test.js:409` (`@media`), `:484` (`x-html`, T-02-01), `:504`
(`fetch`/`await`/`skeleton`/`spinner`)

**Issue:** los tres usan `readHead(rel)`. Con la fase **ya committeada** —el estado actual del
repo— `readHead` y el working tree leen exactamente el mismo contenido, así que la aserción compara
dos lecturas de la misma fuente: es la tautología que el invariante 5 del proyecto prohíbe
(`tests/exercise-types.test.js:1328-1334`). El fichero **ya contiene el helper correcto** y explica
el problema en su propio docstring (`:62-67`): *«comparar el working tree contra HEAD deja de morder
en cuanto la fase committea, porque HEAD pasa a contener el cambio que el gate vigila»*.
`readPreFase46` se aplicó a V3, V8 y V9 — y no a estos tres.

**VERIFICADO EJECUTANDO** (clon aislado). Inyecté un `x-html` en un nodo de `index.html` **fuera** de
los nodos de traducción:

| Estado | `tests/screen-translation.test.js` |
|---|---|
| `x-html` en el working tree, **sin** committear | `not ok 1 - el recuento de la directiva de HTML crudo … es IDÉNTICO al de HEAD` → **fail 1** |
| el **mismo** `x-html`, committeado como `feat(46-06): …` | **pass 50 / fail 0** |

El fichero sigue teniendo el `x-html` en disco y el gate anti-XSS está verde. Repetí el experimento
con `@media` en `app.css`: idéntico (rojo sin committear, verde committeado).

Alcance real: el segundo subtest de V4 (`:493-501`) hace un `!nodo.includes('x-html')` que **no**
depende de git, así que un `x-html` **en los nodos de traducción** sí se caza siempre. El agujero es
para cualquier otro nodo de `index.html` y para el recuento de `@media` de `app.css`.

**Fix (HIPÓTESIS):** sustituir `readHead(rel)` por `readPreFase46(rel)` en las tres, que es
literalmente el helper que el fichero ya declara y usa tres líneas más abajo. Ojo: `readPreFase46`
tiene su propia cláusula de no-vacuidad (`assert.ok(sha, …)`), así que el cambio no puede volverlos
vacuos.

**Verificación exigida al fix:** repetir la tabla de arriba — inyectar el `x-html`, committearlo bajo
un asunto `(46-NN)`, y observar que **sigue rojo**.

---

### WR-02: excepción no capturada DESPUÉS de la llamada pagada — el pase se pierde y el exit code miente

**File:** `scripts/validate-translation-pass.mjs:319` (el `await writeTranslationPass` sin try),
`:537-562` (`main` sin `.catch`)

**Issue:** el doc-block promete *«Exit codes: 0 ok · 1 la cola de modelos se agotó sin pase · 2
dirección o target inválidos»*. Pero cualquier throw del escritor sale de `run`, sale de `main`, y
como `main(process.argv.slice(2))` se invoca **sin `.catch()`**, Node lo trata como unhandled
rejection: stack crudo en stderr y **exit 1** — el mismo código que «la cola se agotó». El autor no
puede distinguir «ningún modelo contestó» de «un modelo contestó, pagaste los tokens y el pase se
perdió al escribir».

**VERIFICADO EJECUTANDO, por dos caminos:**

1. Escritor que lanza (ancla ausente): `Error: anchor de id no encontrado: …`, stack de 4 frames,
   `EXIT=1`. El `pass` **nunca se imprime en stdout**; solo sobrevive dentro del volcado
   `── Razonamiento (m1) ──`.
2. **Camino plenamente alcanzable: timeout del lock.** Con un `<file>.lock` de un pid vivo y
   reciente, `acquire` espera los 30 s de `DEFAULT_TIMEOUT_MS` y lanza. Reproducido:
   `Error: No se pudo bloquear '…' tras 30000ms … pid 1 …`, `EXIT=1`, pase perdido. Un lockfile
   huérfano de una corrida anterior basta para quemar una llamada por cada invocación.

**Fix (HIPÓTESIS):** capturar alrededor de la escritura, imprimir el pase en stdout **antes** de
propagar (para que sea recuperable a mano), y reservar un exit code propio:

```js
if (WRITE) {
  try { await writeTranslationPass(target.file, target.slot.id, target.k, pass); }
  catch (e) {
    console.log(JSON.stringify(pass, null, 2));   // recuperable: el veredicto ya está pagado
    console.error(`El pase NO se pudo escribir (${e.message}). Está impreso arriba: aplícalo a mano o re-corre.`);
    throw Object.assign(e, { exitCode: 3 });
  }
}
// y en el arranque:  main(process.argv.slice(2)).catch((e) => { console.error(e.message); process.exit(e.exitCode ?? 1); });
```

---

### WR-03: `--avoid` puede vaciar la cola y el script informa «rate-limit» sin haber llamado a nadie

**File:** `scripts/validate-translation-pass.mjs:92` (construcción de `MODEL_QUEUE`), `:345`

**Issue:** `MODEL_QUEUE` filtra los modelos evitados **incluido el primario por defecto**. El flujo
documentado del segundo pase es `--model=gemini-2.5-flash --avoid=deepseek-chat`; si se olvida
`--model`, el primario sigue siendo `deepseek-chat`, `--avoid` lo elimina y la cola queda vacía.
`run()` no itera ni una vez y sale por el mensaje final.

**VERIFICADO EJECUTANDO:**
```
$ node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' --avoid=deepseek-chat --write
Agotados todos los modelos de la cola (rate-limit/errores). Pase no emitido.
EXIT=1
```
Cero llamadas intentadas (lo confirmé con un `caller` que lanza si se le invoca: no se invocó). El
diagnóstico atribuye a un rate-limit lo que es un error de invocación, y sobre 722 traducciones es
un desperdicio de sesión difícil de diagnosticar.

**Fix (HIPÓTESIS):** fail-fast en `main`, antes de componer el prompt:
```js
if (cfg.MODEL_QUEUE.length === 0) {
  console.error(`Error: la cola de modelos quedó VACÍA: --avoid=${[...cfg.AVOID].join(',')} elimina el primario '${cfg.PRIMARY}' y no hay --fallback. Pasa --model=<otro>.\n${USAGE}`);
  process.exit(2);
}
```

---

### WR-04: el guard de schema se queda a medias — `translationES.validation` se acepta con cualquier forma

**File:** `src/data/schema-validator.js:472-479`

**Issue:** el guard valida `translationES.text` (string no vacío, sin `___`) y **nada más**. D-46-03
excluyó deliberadamente los criterios de **calidad** (acentos, longitud, comparación con el gloss)
porque son del quórum — pero el guard contra `___` demuestra que los criterios **estructurales** sí
estaban en alcance, y ahí es donde se queda corto.

**VERIFICADO EJECUTANDO** `validateContent` con seis payloads adversariales (slot MC por lo demás
válido):

| Payload | Resultado |
|---|---|
| `validation: "basura"` | **ACEPTA** |
| `validation: { status: 'validated', passes: 7 }` | **ACEPTA** |
| `validation: { status: 'validated', passes: [] }` (status forjado) | **ACEPTA** |
| `{ text, traduccion: 'Dos.' }` (clave desconocida hermana) | **ACEPTA** |
| `text: "Uno.\nDos."` (salto de línea) | **ACEPTA** |
| `text: "<b>Uno.</b>"` | **ACEPTA** |
| `translationES: []` / `translationES: "Uno."` | rechaza ✔ |

El `<b>` es inocuo (el render va por `x-text`, T-02-01, verificado). Los otros no: un `validation`
malformado hace que TRAD-COV lo cuente como `missing` y el rojo diga **«Sin traducir o sin
passes[]»** sobre una traducción que **sí** está escrita — diagnóstico que manda al autor a
re-traducir en vez de a arreglar el bloque. Y la clave hermana desconocida es la puerta por la que un
`traduccion:` mal escrito (el nombre que el autor **rechazó**) vive en el corpus sin que nada chille.

**Fix (HIPÓTESIS):** extender el guard existente sin salirse de lo estructural:
```js
if (surface.translationES !== undefined) {
  const t = surface.translationES;
  if (typeof t !== 'object' || t === null || Array.isArray(t)) { push(...); }
  else {
    const desconocidas = Object.keys(t).filter((k) => k !== 'text' && k !== 'validation');
    if (desconocidas.length) push(file, exId, `"${label}.translationES" declara claves desconocidas: ${desconocidas.join(', ')}`);
    if (t.validation !== undefined) {
      const v = t.validation;
      if (typeof v !== 'object' || v === null || Array.isArray(v) || !Array.isArray(v.passes))
        push(file, exId, `"${label}.translationES.validation" debe ser objeto con "passes" array`);
    }
    // … el chequeo de `text` que ya existe, más /\r|\n/ como error estructural
  }
}
```
**Cuidado:** el corpus real tiene que seguir verde. Lo comprobé — las 96 traducciones tienen
exactamente `["text","validation"]` y `passes` array de 2, así que el guard propuesto no las rompe;
verifícalo igualmente corriendo `tests/schema-translation.test.js` y el bloque de retrocompat sobre
disco.

---

### WR-05: el registro afirma que la traducción «no puede existir en el DOM pre-respuesta», y `x-show` no da esa garantía

**File:** `index.html:637-644` (el comentario) · `index.html:645-647` (el nodo) ·
`.planning/…/46-CONTEXT.md:108` (D-46-06)

**Issue — NO VERIFICADO EJECUTANDO, es lectura de mecanismo.** No pude cargar la app: Alpine se
sirve desde CDN (`index.html:32`) y las llamadas de red están prohibidas en esta revisión. Lo que
sigue se apoya en la semántica documentada de Alpine, no en una observación mía.

`x-show` alterna `style.display`; `x-text` fija `textContent` en un efecto **independiente**. Con
`<p x-show="…" x-text="…">`, el texto español está en el DOM desde el primer render y solo queda
oculto por CSS. Sin embargo D-46-06 afirma: *«la traducción revela la palabra correcta y **no puede
existir en el DOM pre-respuesta**»*, y el comentario del nodo lo repite. Lo que el código garantiza
es **invisibilidad**, no ausencia. La presencia estructural en este proyecto se consigue con
`<template x-if>` — que es justo lo que `index.html:547` usa para el sub-template.

Evidencia interna que lo respalda sin depender de mi lectura de Alpine: la `explanation` usa el mismo
`x-show` y su affordance «¿Por qué?» se describe siempre como *revelar*, no como *insertar*.

**Esto NO reabre D-46-11**, que decidió por escrito y con razón técnica no esconder el campo del
payload (el payload ya lleva `correctIndex` y `options`, así que la postura de seguridad no cambia
un ápice). Lo que falla es el REGISTRO: afirma una garantía más fuerte que la que existe, y este
proyecto trata «un registro que miente certifica en verde» como defecto de primera clase (CR-01 de la
Phase 44). Una fase futura que lea D-46-06 puede creer que R1 está cerrado estructuralmente cuando
solo lo está visualmente. Nótese que el test V5 está bien redactado (verifica que **ningún template
pinta sin guard**, no la ausencia en el DOM): es la prosa la que se pasa de frenada.

**Fix (HIPÓTESIS, el barato y el que este proyecto ya usa):** enmendar por escrito, con fecha, en
D-46-06 y en el comentario del nodo — «el doble guard impide que la traducción sea **visible** antes
de responder; el nodo existe oculto, igual que la `explanation`, y eso es aceptable por la razón de
D-46-11: el payload ya expone `correctIndex`».
**NO recomiendo envolver el `<p>` en un `<template x-if>` sin medir**: metería un `<template>` entre
la traducción y el CTA y el test `:574-586` («entre los dos no se cuela ningún otro elemento») exige
que ese tramo esté vacío tras quitar comentarios. Ese camino habría que verificarlo con el DOM
delante, y yo no pude.

---

### WR-06: «1 categorías» — el banner nuevo no concuerda en número

**File:** `scripts/run-validation-271.mjs:738-742`

**Issue:** la interpolación es fija en plural, así que con una sola categoría declarada el reporter
imprime hoy, literalmente:

```
Cobertura de traducción — unidad: VARIANTE multiple-choice (1 categorías declaradas cubiertas, 96 variantes)
```

Es un mensaje de cara al autor, en español, en el mismo bloque que PRES-05 gobierna. Lo verifiqué
corriendo el reporter sobre el repo real (`TRAD-COV PASS (96/96)`, exit 0) — el texto sale así. El
escaneo de tildes de los dos scripts nuevos, en cambio, salió limpio.

**Fix (HIPÓTESIS):**
```js
const n = TRANSLATION_COVERAGE.length;
`(${n} ${n === 1 ? 'categoría declarada cubierta' : 'categorías declaradas cubiertas'}, ${TOTAL_TRANSLATION_EXPECTED} variantes)`
```
La segunda cifra no necesita el mismo trato: `1 variantes` es inalcanzable mientras haya una
categoría con al menos una variante… pero si se quiere simetría, el mismo patrón sirve.

---

## Info

### IN-01: 14 de los 20 exports del script no tienen ningún consumidor

**File:** `scripts/validate-translation-pass.mjs` (varias)

Exportados y nunca importados desde ningún sitio del árbol: `PROMPT_PATH`, `SCAN_DIRS`,
`buildDataBlock`, `childObjectRanges`, `composePrompt`, `extractJsonBlock`,
`findEnclosingBraceStart`, `findSlot`, `indentAtOffset`, `locateVariantTranslation`,
`matchBraceEnd`, `matchBracketEnd`, `parseArgs`, `providerFor`. El único importador del módulo es
`tests/translation-validator.test.js:24-31`, que consume 6: `applyPassToText`, `fillGap`,
`parseAddress`, `resolveTarget`, `run`, `writeTranslationPass`.

Exportar por testabilidad es un patrón legítimo, pero 14 símbolos sin consumidor son superficie de
API que hay que mantener sin nadie que la ejercite —y en particular `locateVariantTranslation` y
`childObjectRanges`, que son el corazón del re-estrechado (invariante 8), **solo se prueban de forma
indirecta** a través de `applyPassToText`. **Fix:** o quitarles el `export` a las que no lo necesitan,
o darles cobertura directa a las dos del re-estrechado. Lo segundo tiene más valor que lo primero.

### IN-02: tres asperezas menores en el bucle de `run()`

**File:** `scripts/validate-translation-pass.mjs:324` · `:303`/`:341` · `:88`

1. `:324` — `const wait = r.retryAfter ?? Math.min(45, 5 * attempt);` se calcula **antes** del
   `if (hasFallback)`, que hace `break`. Con fallback disponible, `wait` es un valor muerto.
2. `:303`/`:341` — la guarda es `if (r.text)`. Una respuesta con contenido vacío (`{ text: '' }`, que
   es exactamente lo que produce `j.choices?.[0]?.message?.content || ''` en `:269`) es falsy, así
   que cae al fondo del bucle y se imprime **`[modelo] error: undefined`**. Diagnóstico engañoso para
   una respuesta vacía. **Fix:** `if (typeof r.text === 'string')` y tratar la cadena vacía como el
   caso «sin bloque JSON válido», que ya tiene su reintento.
3. `:88` — `parseFloat(getOpt('temp','0.2'))` con `--temp=abc` da `NaN`, que `JSON.stringify` serializa
   como `"temperature": null`. **Fix:** `Number.isFinite(TEMP)` o caer al default con un aviso.

### IN-03: `loadEnv` conserva el `\r` final si `.env` tiene finales de línea CRLF

**File:** `scripts/validate-translation-pass.mjs:112-121`

`split('\n')` deja el `\r`, y la regex `^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$` lo captura dentro de `(.*)`
porque el `\s*` posterior es codicioso-vacío; el `replace` de comillas no lo quita. Una clave con
`\r` se rechaza en la validación de cabeceras HTTP de Node (`ERR_INVALID_CHAR`), así que **falla
ruidosamente**, no en silencio — de ahí el Info y no más. No leí `.env`: es lectura de código. El
bloque es verbatim de `scripts/validate-song-pass.mjs:75-84`, así que el arreglo (`.split(/\r?\n/)` o
un `.trim()` sobre `m[2]`) le conviene a los dos, y el repo tiene un `.planning/WINDOWS.md` que
sugiere que el entorno lo justifica.

### IN-04: un texto que contenga ``` puede cerrar el bloque fenced del prompt compuesto

**File:** `scripts/validate-translation-pass.mjs:207-215`

`composePrompt` envuelve `JSON.stringify(...)` en una valla ```` ```json ````. `JSON.stringify` no
escapa los backticks, así que un `text` o un `prompt` con ``` partiría la valla y dejaría parte del
payload fuera del bloque de datos. Riesgo bajo y contenido: el §6 del doc de criterios ordena tratar
**todo** el payload como datos con independencia de dónde aparezca, y `extractJsonBlock` toma el
ÚLTIMO bloque, que es el del evaluador. Ninguna de las 96 traducciones actuales contiene backticks
(verificado en el escaneo de forma). **Fix:** una valla más larga (`` ````json ``) o rechazar
``` en `buildDataBlock`.

---

## Nota de método

- **Ejecutado:** `node --test tests/*.test.js` (baseline 1245/4-fail reproducida en el repo y en un
  clon limpio) · `node scripts/run-validation-271.mjs` (exit 0, `TRAD-COV PASS 96/96`) · 6 mutaciones
  de contenido · 3 mutaciones de gate con y sin commit · barrido de `applyPassToText` sobre las 96
  direcciones reales · 6 sondas adversariales de los anclajes `indexOf` (todas seguras: el escapado
  JSON de `\"` impide la colisión) · 10 sondas del schema-validator · sondas de cola vacía, timeout de
  lock y verdict fuera de contrato.
- **No ejecutado:** nada que necesitara red (cero llamadas a DeepSeek/Gemini) y nada que necesitara
  el DOM real (Alpine se sirve por CDN). WR-05 es el único hallazgo apoyado solo en lectura, y va
  marcado como tal.
- **Cero ficheros de producción modificados.** Todas las mutaciones corrieron en un clon aislado
  (`git clone --no-hardlinks`) o sobre copias en el scratchpad; `git status` del repo real quedó como
  al empezar, y no hay lockfiles huérfanos.
- Los 4 subtests rojos de `tests/requirements-traceability.test.js` son deuda de la baseline
  `19f41a9`, tal como se indicó, y **no** se reportan como regresión.

---

_Reviewed: 2026-08-14_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_

---

## Resolución (2026-08-14)

El autor decidió arreglar los hallazgos **dentro de la fase 46** en vez de diferirlos: las Phases
47-53 se apoyan en estos mismos gates 17 veces más, y un gate vacuo arrastrado es literalmente el
«gate ciego descubierto en la variante 500» que esta fase existía para comprar.

**Alcance aplicado:** los 3 Critical y los 6 Warning. Los 4 Info quedan abiertos y registrados en
`.planning/WINDOWS.md` (ids 26-29). Un commit atómico por hallazgo, y **cada arreglo verificado con
la MISMA mutación que aparece citada en el hallazgo** (D-46-18): antes ROJO con el arreglo puesto,
VERDE con el gate viejo — que es lo que prueba que el gate estaba ciego.

| Hallazgo | Commit | Mutación de verificación | Antes | Después |
|---|---|---|---|---|
| CR-01 | `1b13465` | `preposiciones-col#1` con `status:"pending"` mentiroso, `passes` intactos | reporter exit **0**, `Milestone gate PASS`, suite 1308/4-fail | reporter exit **1**, `TRAD-COV FAIL`, suite con 1 rojo nuevo |
| CR-02 | `d524e8d` | `applyPassToText` sobre `translationES: {}` | texto que **NO parsea**, escrito en disco | lanza y no compone; con el guard deshabilitado, la post-condición lanza y el fichero queda **intacto** |
| CR-03 | `8e4d3e0` | caller que devuelve `"PASS"`, `"Incorrecta"` y `concerns` string | los tres **se persisten** | los tres rechazados, `passes: []` |
| WR-01 | `44dcc78` + `add89fc` | `@media` + `x-html` + motor, **committeados** | fail **0** | fail 1-4 según el asunto, con diagnóstico |
| WR-02 | `deacb64` | lockfile huérfano de un pid vivo | throw tras 30 s, pase **perdido**, exit 1 | pase en stdout, exit code **3** propio |
| WR-03 | `fab1d48` | `--avoid=deepseek-chat` sin `--model` | «Agotados todos los modelos… (rate-limit)», exit 1 | exit **2** nombrando la causa real |
| WR-04 | `300b494` | 6 payloads adversariales a `validateContent` | 4 **ACEPTADOS** | 4 rechazados; corpus real verde (18 ficheros, 0 errores) |
| WR-05 | `9b043cd` | — (no ejecutable sin red) | D-46-06 afirmaba «no puede existir en el DOM» | registro enmendado: **invisibilidad, no ausencia** |
| WR-06 | `96f51de` | array de cobertura con 2 categorías | «1 categorías declaradas cubiertas» | «1 categoría declarada cubierta» / «2 categorías…» |

**Dos hallazgos NUEVOS, encontrados verificando los arreglos** (no estaban en este documento):

1. **La referencia pre-fase se podía COLAPSAR.** `refPreFase46` filtra por el scope del asunto, así
   que un commit hecho durante la fase con un asunto sin `(46-NN)` se convertía él mismo en el
   «pre-fase» y el gate volvía a compararse consigo mismo. Cerrado con un guard que exige que la
   referencia sea ANTEPASADO del arranque de la fase, derivado de la historia (padre del commit de
   fase más antiguo) — cero shas transcritos.
2. **El clasificador no reconocía el scope `(46)`.** Los commits de arreglo de esta ronda usan
   `fix(46):`, que no casa con `(46-NN)`, así que quedaban clasificados como PRE-fase y pusieron V4,
   V8 y V9 en rojo. Lo delató el guard del punto 1 — exactamente su razón de ser. Ampliar el
   reconocedor **endurece** los dos gates que lo consumen, no los ablanda.

**Un fix del review DESCARTADO por no ser de su capa:** WR-04 listaba
`{status:'validated', passes:[]}` como problema del schema, pero su propio snippet no lo arreglaba.
Que el `status` escrito sea el DERIVADO es un invariante de la capa de validación, no de la forma del
documento, y lo cazan el sub-gate TRAD-COV y el gate de contenido de CR-01 — los dos verificados por
mutación aquí. Duplicarlo en el schema lo pondría a envejecer en dos sitios.

**Cero re-validación de contenido.** Los 192 pases de traducción ya en disco cumplen el contrato del
§4 que CR-03 empieza a exigir (0 violaciones, congelado en un test). No se tocó ningún `passes`, ni
las 16 glosas duplicadas, ni los 3 `backstop` abstenidos, ni `schemaVersion`.

**Estado final:** suite `1329 tests / 1325 pass / 4 fail` — los 4 son los pre-existentes de
`requirements-traceability` (rojos desde `19f41a9`), sin parchear. Reporter exit **0** (96/96).
`git diff --stat 19f41a9..HEAD -- src/domain/ src/screens/app.js` **vacío**.

_Fixed: 2026-08-14 · Claude (gsd-code-fixer)_
