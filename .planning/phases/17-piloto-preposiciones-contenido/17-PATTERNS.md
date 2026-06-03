# Phase 17: Piloto Preposiciones (contenido) - Pattern Map

**Mapped:** 2026-06-03
**Files analyzed:** 6 (1 content rewrite, 2 código storage/backup, 3 test/script sync) + 2 test files de cobertura
**Analogs found:** 6 / 6 (todos con analog exacto en el repo)

> Esta fase es 90% contenido + sincronización de tests, 10% código nuevo. TODOS los archivos a tocar tienen un analog literal ya en disco. La consigna del planner: **copiar el patrón existente verbatim** y aplicar la poda/extensión mínima. No inventar mecanismos nuevos (el validator, loader, cadena de migración y quórum ya existen).

## File Classification

| Archivo a crear/modificar | Role | Data Flow | Analog más cercano | Match |
|---------------------------|------|-----------|--------------------|-------|
| `content/exercises/preposiciones.json` (rewrite legacy→slot+variantes) | content/data | transform | `tests/fixtures/slot-variants-integration.test.js` shape slot + `normalizeExerciseToSlot` passthrough + §Slot+Variantes JSON Shape del RESEARCH | exact |
| `src/data/storage.js` (`migrate6to7` + `hydrateV7` + bump 7) | model/migration | transform (state migration) | `migrate5to6` + `hydrateV6` (mismo archivo, líneas 503-557); poda = `migrate3to4` inFlightTest reconstruction (líneas 322-357) | exact |
| `src/data/backup.js` (extender cadena a v7) | model/serialization | request-response (parse/build) | el propio `parseBackupFile` líneas 26/36/113-120 (cada bump previo siguió el mismo diff de 3 puntos) | exact |
| `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS` bifurcado por shape + count) | test | batch/param | el propio bloque líneas 1265-1373 (legacy `payload.*`) | role-match (extender) |
| `tests/fixtures/slot-variants-integration.test.js` (`REAL_CATEGORIES` count) | test | batch/param | el propio array líneas 166-202 | role-match (sync) |
| `scripts/run-validation-271.mjs` (`expected` preposiciones + `TOTAL_EXPECTED`) | script/gate | batch/param | el propio array `CATEGORIES` líneas 74-86 | role-match (sync) |

**Archivos NO tocados (verificado en RESEARCH):** `schema-validator.js` (`validateVariants` ya acepta el shape), `content-loader.js` (`normalizeExerciseToSlot` ya hace passthrough), `validate-ai-pass.mjs` y skill `gsd-validate-exercise` (se invocan, no se editan).

---

## Pattern Assignments

### `content/exercises/preposiciones.json` (content, transform)

**Analog del shape final:** el slot que produce `normalizeExerciseToSlot` para `variants[]` (`src/data/content-loader.js:44-52`) + reglas enforçadas por `validateVariants` (`src/data/schema-validator.js:201-222`).

**Shape de un slot con variantes (copiar EXACTO; lo que valida el código):**
```jsonc
{
  "id": "preposiciones-al",           // id de slot = exercise id (esquema = Claude's Discretion del planner; ver Open Q #3)
  "type": "multiple-choice",          // a NIVEL de slot (D-15-05), NO por variante
  "categoryIds": ["preposiciones"],   // a nivel de slot, array no vacío
  "explanation": "Cuando A precede a un sustantivo masculino singular...",  // OBLIGATORIA top-level (schema-validator.js:203), string no vacío
  "variants": [                        // array NO vacío (schema-validator.js:207)
    { "prompt": "Andiamo ___ cinema.", "options": ["a","al","nel","in"], "correctIndex": 1 },
    { "prompt": "Parlo ___ telefono.", "options": ["a","al","nel","con"], "correctIndex": 1 }
  ],
  "validation": { "status": "validated", "passes": [ /* ... */ ] }  // top-level opcional (schema-validator.js:170 validateValidationShape)
}
```

**Reglas hard del validator (verificadas en `schema-validator.js`):**
- `payload` XOR `variants[]` — nunca ambos (línea 147-149), nunca ninguno (152-154). Al convertir, **se ELIMINA `payload`** y aparece `variants[]` + `explanation` top-level.
- `explanation` top-level string no vacío cuando hay `variants[]` (línea 203).
- `variants[]` no vacío (línea 207); cada variante objeto plano con la superficie del `type` (`SURFACE_VALIDATORS[ex.type]`, línea 213/220).
- La variante NO lleva `explanation` propia (sube a slot — confirmado en integration test línea 137: `slot.variants[0].explanation === undefined`).

**Before/After de una fusión real (S-AL = 011 + 015), patrón a replicar por cada slot:**
- ANTES: 2 ejercicios legacy, cada uno `{id, type, categoryIds, payload:{prompt,options,correctIndex,explanation}}` (ver `preposiciones.json` líneas 1-30 para el shape legacy exacto, ej. `preposiciones-001`).
- DESPUÉS: 1 slot `{id, type, categoryIds, explanation(merge D-17-05), variants:[{prompt,options,correctIndex}×2]}`.
- **Mover superficie intacta a `variants[]` NO requiere re-validación** (Claude's Discretion: "solo cambia de contenedor"). Solo superficies nuevas/reformuladas pasan quórum (D-17-07).

**Mapa de reagrupación completo:** ver RESEARCH §Reagrupación Mapping (Bloques A/B/C). Fusiones confirmadas: SUL 006/013/043 (3→1), AL 011/015 (2→1), DI-posesso 010/012 (2→1); slots nuevos S-LOC-IN (3 variantes) + S-AL-MARE (1). Conteo final ≈ 49-50 slots (no 52) — **driver de los 3 sync points de abajo**.

---

### `src/data/storage.js` (model/migration, transform)

**Analog literal:** `migrate5to6` (líneas 503-522) + `hydrateV6` (líneas 538-557). `migrate6to7` = espejo de `migrate5to6` + la poda quirúrgica; `hydrateV7` = espejo LITERAL de `hydrateV6` con versión 7, SIN poda.

**Constante + dispatcher (3 ediciones puntuales):**
```js
const CURRENT_SCHEMA_VERSION = 7;   // storage.js:35 — sube 6→7
// blankState() storage.js:56-66 — schemaVersion sube a 7 (su JSDoc también)
```
Dispatcher `migrate()` (storage.js:144-145) pasa de:
```js
if (s.schemaVersion === 5) s = migrate5to6(s);
if (s.schemaVersion === 6) return hydrateV6(s);
```
a (insertar el nuevo eslabón ANTES del hydrate final):
```js
if (s.schemaVersion === 5) s = migrate5to6(s);
if (s.schemaVersion === 6) s = migrate6to7(s);   // NUEVO eslabón
if (s.schemaVersion === 7) return hydrateV7(s);   // NUEVO hydrate final
```

**Patrón de deep-clone defensivo a copiar (de `migrate5to6` líneas 504-521):** cada sub-dict reconstruido vía `JSON.parse(JSON.stringify(...))` con guard `typeof X === 'object' && X !== null ? clone : {}`; timestamps via `typeof X === 'string' ? X : null`; root literal fresco `{ schemaVersion: 7, ... }` (anti-prototype-pollution CR-03/T-04-02/T-15-PP).

**`migrate6to7` = el patrón base + 3 desviaciones (D-17-08):** (1) tras clonar `categoryProgress`, `delete clone.preposiciones`; (2) reconstruir `exerciseStats` filtrando claves que empiecen por `preposiciones` (helper de poda por prefijo = Claude's Discretion); (3) invalidar `inFlightTest` si algún `exerciseIds[i]` empieza por `preposiciones`. El patrón de reconstrucción condicional de `inFlightTest` ya existe en `migrate3to4` (storage.js:322-332) — clonar ESE estilo (test `typeof === 'object' && !== null`, reconstruir, no mutar input). Forma exacta = Claude's Discretion (ver RESEARCH §Code Examples para una implementación ilustrativa).

**`hydrateV7` = `hydrateV6` literal con `7`:** mismo deep-clone por sub-dict (líneas 539-556), NO repite la poda (precedente: `hydrateV6` no re-ejecuta lógica de `migrate5to6`). Un state que llega a `hydrateV7` ya viene v7-shaped.

**Idempotencia + pureza (verificado como invariante en toda la cadena):** re-ejecutar `migrate6to7` sobre un v7 ya migrado da el mismo resultado (Preposiciones ya ausente → `delete` no-op). NO muta el input.

---

### `src/data/backup.js` (model/serialization, request-response)

**Analog:** el propio `parseBackupFile`; cada bump previo siguió este diff de 3 puntos exactos.

**Import (línea 26):** añadir `migrate6to7, hydrateV7`:
```js
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, hydrateV5, migrate5to6, hydrateV6, migrate6to7, hydrateV7 } from './storage.js';
```

**Constante espejo (línea 36):**
```js
const CURRENT_SCHEMA_VERSION = 7;   // sube 6→7 — espejo de storage.js
```

**Cadena de migración del parse (líneas 113-120):** añadir el eslabón v6 y cambiar el hydrate final:
```js
if (migrated.schemaVersion === 5) migrated = migrate5to6(migrated);
if (migrated.schemaVersion === 6) migrated = migrate6to7(migrated);   // NUEVO
migrated = hydrateV7(migrated);                                        // era hydrateV6
```

**Lo que se ajusta solo al subir la constante:** el guard forward-compat (`state.schemaVersion > CURRENT_SCHEMA_VERSION`, línea 106-111) y la coherencia wrapper↔state (línea 98). `buildBackupWrapper` (línea 144-151) no cambia (lee `state.schemaVersion` dinámicamente).

**Invariante a verificar (round-trip):** un export del state v7 actual debe reimportarse sin error "versión más nueva"; un import de un backup v6 migra a v7 (reseteando Preposiciones en el import — coherente con el reset).

---

### `tests/exercise-types.test.js` (test, param) — bifurcar `CATEGORIES_WITH_EXPLANATIONS` por shape

**Analog:** el propio bloque (líneas 1265-1373). Hoy todo asume shape legacy `ex.payload.*` y `expected: 52`.

**Lo que rompe al convertir Preposiciones:**
- `expected: 52` (línea 1266) → el count baja a ~49-50 (nº de slots).
- `ex.payload?.explanation` (coverage línea 1294; smart-quotes 1307; markdown 1323; R2 1362) → da `undefined` para slots → coverage 0, R2 no escanea.
- `ex.payload?.prompt` (R1 línea 1343) → `undefined` para slots → R1 no escanea.

**Patrón de extensión (Claude's Discretion — bifurcar por shape DENTRO del loop, shape-agnostic para CONV-01 futuro):**
- Si `Array.isArray(ex.variants)` → coverage sobre `ex.explanation` (top-level); R1 sobre cada `ex.variants[].prompt`; R2/smart-quotes/markdown sobre `ex.explanation`.
- Si `ex.payload` → ruta legacy actual sin cambios (las otras 8 cats).
- Count `expected` de preposiciones → nº de SLOTS final (sincronizar con el JSON real, NO con la estimación 49-50).

**`VAL_07_STRICT` (líneas 1399-1415):** lee `ex.validation?.status` que es top-level → **sobrevive a la conversión sin cambios** (verificado A5). Solo hereda el `expected` del array compartido → se sincroniza solo al arreglar el count arriba.

**Comando:** `node --test tests/*.test.js` (glob obligatorio, path desnudo `tests/` falla en Node 22.20 — MEMORY). Estricto: `VAL_07_STRICT=1 node --test tests/*.test.js`.

---

### `tests/fixtures/slot-variants-integration.test.js` (test, param) — sync count

**Analog:** el array `REAL_CATEGORIES` (líneas 166-176) + el assert de conteo (líneas 194-201).

**Único cambio:** la entry `{ slug: 'preposiciones', expected: 52 }` (línea 169) → `expected` = nº de slots final. El test `${slug}: validateContent acepta el archivo` (línea 181) y el bundle global (línea 204) NO cambian — `validateContent` ya acepta `variants[]`. El comentario del array (líneas 164-165) dice literalmente "Si una alta de contenido futura cambia un conteo, este test obliga a actualizarlo conscientemente" → es exactamente este caso.

---

### `scripts/run-validation-271.mjs` (script/gate, param) — sync count + total

**Analog:** el array `CATEGORIES` (líneas 74-84) + `TOTAL_EXPECTED` (línea 86).

**Cambios:**
- Línea 75: `{ slug: 'preposiciones', ..., expected: 52 }` → `expected` = nº de slots final.
- Línea 86: `TOTAL_EXPECTED = 373` → `373 - 52 + nº_slots_final`.
- Actualizar el comentario explicativo (líneas 63-73) para registrar la conversión a slots (precedente: el comentario ya narra cada alta histórica que movió el total).

El gate VAL-06 (`totalActual !== TOTAL_EXPECTED` → FAIL) y el reporter por categoría (`total !== expected` → warning) se satisfacen solos al sincronizar ambos números con el disco.

---

## Shared Patterns

### Deep-clone defensivo anti-prototype-pollution
**Source:** `src/data/storage.js:504-521` (`migrate5to6`) — patrón presente en TODA migración desde `migrate3to4`.
**Apply to:** `migrate6to7` + `hydrateV7`.
```js
exerciseStats: (typeof v6.exerciseStats === 'object' && v6.exerciseStats !== null)
  ? JSON.parse(JSON.stringify(v6.exerciseStats))
  : {},
// ...idem categoryProgress, dailyLog, songProgress
// timestamps: typeof v6.lastBackupAt === 'string' ? v6.lastBackupAt : null
// root literal fresco { schemaVersion: 7, ... } → nunca asigna __proto__ como prototipo
```
**Por qué:** `migrate6to7` introduce poda (delete + filter de claves) sobre sub-dicts que vienen del input parseado del autor. Sin el deep-clone, una clave `__proto__` own-property o un getter del state importado se colaría al live state (CR-03/T-04-02). Confirmado como invariante en `hydrateV3`..`hydrateV6`.

### Idempotencia + pureza de migración
**Source:** `src/data/storage.js` (toda la cadena; comentario explícito en `migrate5to6` líneas 495-496, `migrate3to4` líneas 285-298).
**Apply to:** `migrate6to7`.
**Regla:** no mutar el input; re-ejecutar produce la misma shape. Para la poda: `delete` de una clave ausente es no-op (idempotente por construcción); el filter de `exerciseStats` es idempotente.

### Bifurcación por shape slot/legacy en tests paramétricos
**Source:** `tests/fixtures/slot-variants-integration.test.js:120-156` (legacy vs slot via `normalizeExerciseToSlot`) + `schema-validator.js:144-165` (`hasVariants`/`hasPayload` dispatch).
**Apply to:** `tests/exercise-types.test.js` `CATEGORIES_WITH_EXPLANATIONS`.
```js
const hasVariants = Array.isArray(ex.variants);
// hasVariants → leer ex.explanation + ex.variants[].prompt
// else        → leer ex.payload.explanation + ex.payload.prompt (legacy, sin cambios)
```
**Por qué:** hace el smoke shape-agnostic; deja el camino abierto para CONV-01 (futuras categorías convertidas) sin reescribir el test.

### Conteo expected = nº de slots, sincronizado con disco (NO estimación)
**Source:** 3 lugares con `expected: 52` para preposiciones.
**Apply to:** los 3 sync points. El número final lo determina el JSON real tras la reagrupación + variantes autoradas, no la estimación 49-50. **Tarea explícita del plan** (Pitfall 1): correr `node --test tests/*.test.js` + `node scripts/run-validation-271.mjs` tras la conversión para verificar los 3 alineados.

---

## No Analog Found

Ninguno. Los 6 archivos tienen analog directo en el repo. La única "novedad" es contenido (las variantes autoradas nuevas), que no es código sino superficie JSON validada por el quórum cross-vendor existente (`scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise`).

**Nota sobre el quórum (no es un archivo a crear, es un pipeline a invocar):** cada variante nueva (PILOT-02/PILOT-03) pasa 4 pases — `node scripts/validate-ai-pass.mjs <id> --model=gemini-2.5-flash --fallback=deepseek-chat --write` + `--model=deepseek-chat --avoid=gemini-2.5-flash --write` + skill Claude (Opus+Sonnet, 1-por-1, NUNCA batched). Gate D-17-07: `passes[]` con 4× "correcta" (by distintos), CERO "incorrecta". Pitfall 2: validar cada variante nueva como ejercicio legacy aislado (con `payload`) ANTES de moverla al slot, para que el VALIDATION-PROMPT legacy-payload-céntrico no confunda a los vendors (A2 — verificar con dry-run).

---

## Metadata

**Analog search scope:** `src/data/` (storage, backup, schema-validator, content-loader), `tests/`, `tests/fixtures/`, `scripts/`, `content/exercises/preposiciones.json`.
**Files scanned/read:** storage.js (íntegro 1-557), backup.js (íntegro), schema-validator.js (140-222), content-loader.js (40-70), exercise-types.test.js (1255-1416), slot-variants-integration.test.js (120-202), run-validation-271.mjs (60-104), preposiciones.json (head).
**Pattern extraction date:** 2026-06-03
