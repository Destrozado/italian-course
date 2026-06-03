---
phase: 17-piloto-preposiciones-contenido
plan: 01
subsystem: database
tags: [migration, schema-version, localStorage, backup, prototype-pollution, tdd]

# Dependency graph
requires:
  - phase: 15-modelo-datos-slot-variantes
    provides: "migrate5to6 + hydrateV6 + backup v6 (cadena de migración a clonar, schemaVersion 6)"
  - phase: 16-motor-examen-slots
    provides: "inFlightTest con variantIndices (el blob que migrate6to7 invalida si toca Preposiciones)"
provides:
  - "migrate6to7: reset selectivo de Preposiciones (categoryProgress + exerciseStats prefijo + inFlightTest)"
  - "hydrateV7: espejo literal de hydrateV6 sin poda, schemaVersion 7"
  - "CURRENT_SCHEMA_VERSION = 7 en storage.js + backup.js (espejo) + blankState v7"
  - "backup.js round-trip v7 (export v7 reimportable; import v6 migra a v7 reseteando Preposiciones)"
affects: [17-02, 17-03, 17-04, "reagrupacion contenido preposiciones a slots"]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Migración con poda quirúrgica: clona el patrón deep-clone de migrate5to6 + 3 desviaciones (delete clave, filtro por prefijo, invalidación condicional de inFlightTest)"
    - "hydrateVN espejo sin poda: la poda es responsabilidad del migrateN-1toN durante la cadena; hydrate solo garantiza shape"

key-files:
  created: []
  modified:
    - src/data/storage.js
    - src/data/backup.js
    - tests/data-storage.test.js
    - tests/backup.test.js

key-decisions:
  - "migrate6to7 reset de Preposiciones vía delete categoryProgress.preposiciones + filtro exerciseStats por prefijo 'preposiciones' (cubre ids legacy y futuros ids de slot) — D-17-08"
  - "inFlightTest se invalida en la MIGRACIÓN (no en el guard de UI) si algún exerciseId empieza por 'preposiciones' — evita crash al reanudar un Test tras la reagrupación"
  - "hydrateV7 NO repite la poda (precedente hydrateV6 vs migrate5to6)"
  - "Las assertions de versión en los tests existentes (6→7) se sincronizaron como parte del bump; future-reject test 7→8"

patterns-established:
  - "Eslabón de migración con reset selectivo: clona el deep-clone defensivo por sub-dict + reconstruye exerciseStats filtrando claves + invalida inFlightTest condicionalmente sin mutar el input"

requirements-completed: [PILOT-04]

# Metrics
duration: 6min
completed: 2026-06-03
---

# Phase 17 Plan 01: Migración 6→7 con reset selectivo de Preposiciones Summary

**`migrate6to7`/`hydrateV7` resetean SOLO el progreso de Preposiciones (categoryProgress + exerciseStats por prefijo + inFlightTest) vía un bump nominal de schemaVersion 6→7, con `backup.js` extendido a round-trip v7; las otras 8 categorías quedan byte-intactas.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-03T13:53:28Z
- **Completed:** 2026-06-03T13:59:44Z
- **Tasks:** 2 (ambas TDD)
- **Files modified:** 4

## Accomplishments
- `migrate6to7` en `storage.js`: reset quirúrgico de Preposiciones clonando el patrón deep-clone anti-prototype-pollution de `migrate5to6`, con 3 desviaciones D-17-08 (delete `categoryProgress.preposiciones`, filtro de `exerciseStats` por prefijo `preposiciones`, invalidación condicional de `inFlightTest`). Idempotente y puro.
- `hydrateV7`: espejo literal de `hydrateV6` con versión 7, SIN poda (la poda es responsabilidad de `migrate6to7` durante la cadena).
- `CURRENT_SCHEMA_VERSION` bumpeado a 7 en `storage.js` + dispatcher con el eslabón `v6→migrate6to7→v7→hydrateV7`; `blankState` y su JSDoc a v7.
- `backup.js` extendido a v7: import de `migrate6to7`/`hydrateV7`, constante espejo a 7, cadena de parse con el eslabón v6→v7. Round-trip v7 verde; import de backup v6 migra a v7 reseteando Preposiciones.
- Suite completa verde: 342/342 tests (`node --test tests/*.test.js`); avere snapshot intacto (`assert-avere-prefix-unchanged.mjs` exit 0).

## Task Commits

Cada task se ejecutó en TDD (RED → GREEN):

1. **Task 1 (RED): tests migrate6to7/hydrateV7** - `5353d25` (test)
2. **Task 1 (GREEN): migrate6to7 + hydrateV7 + bump 7** - `d6a8d40` (feat)
3. **Task 2 (RED): tests backup.js v7 round-trip** - `f3da8c6` (test)
4. **Task 2 (GREEN): backup.js cadena v7** - `d1dc4c9` (feat)

_No hubo fase REFACTOR: el código ya espeja el patrón existente limpiamente._

## Files Created/Modified
- `src/data/storage.js` - `migrate6to7` (reset selectivo de Preposiciones), `hydrateV7` (espejo sin poda), `CURRENT_SCHEMA_VERSION=7`, dispatcher con el eslabón v6→v7, `blankState`/JSDoc a v7.
- `src/data/backup.js` - import `migrate6to7`/`hydrateV7`, constante espejo a 7, cadena de parse con eslabón v6→v7 (`hydrateV7` final).
- `tests/data-storage.test.js` - bloque v7 (reset selectivo, idempotencia, pureza, anti-prototype-pollution, sub-dict corrupto, inFlightTest toca/no-toca Preposiciones, hydrateV7 sin poda, cadena v6→v7) + sync de asserts de versión `blankState` 6→7.
- `tests/backup.test.js` - bloque v7 (round-trip export→import, preservación de avere/essere/partitivos, import v6→v7 con reset de Preposiciones) + sync de asserts de cadena 6→7 + future-reject 7→8.

## Decisions Made
- **Filtro por prefijo `preposiciones` (no `preposiciones-`):** cubre tanto los ids legacy (`preposiciones-001..052`) como los futuros ids de slot (`preposiciones-al`, etc.) que aparecerán cuando el autor re-haga la categoría. Verificado: ninguna de las 9 categorías reales empieza por `preposiciones` salvo Preposiciones, así que el match es seguro (RESEARCH A4).
- **inFlightTest invalidado en la migración:** la condición es `Array.isArray(exerciseIds)` + algún id `.startsWith('preposiciones')` → `undefined`. Reconstrucción condicional sin mutar el input, estilo `migrate3to4`. No se confía del guard de UI (no valida existencia de ids en `slotById`).
- **hydrateV7 sin poda:** un state que llega a `hydrateV7` ya viene v7-shaped (poda ya hecha por `migrate6to7` en la cadena) o es un import directo v7 que debe preservarse íntegro. Precedente: `hydrateV6` no re-ejecuta `migrate5to6`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Sincronización de assertions de versión en tests existentes (6→7)**
- **Found during:** Task 1 y Task 2 (durante la fase RED de cada uno)
- **Issue:** El bump de `CURRENT_SCHEMA_VERSION` a 7 hace que toda la cadena de migración (`blankState`, `parseBackupFile`, dispatcher) produzca `schemaVersion: 7`. Varios tests existentes en `data-storage.test.js` (3 asserts de `blankState`) y `backup.test.js` (5 asserts de cadena + 1 test de future-reject que usaba `7` como "futuro") asumían `6` y habrían fallado.
- **Fix:** Actualizadas las assertions de versión a 7 en ambos archivos; el test de future-reject pasó de `schemaVersion: 7` a `8` (uno por encima del nuevo current). Comentarios de los tests actualizados a Phase 17.
- **Files modified:** tests/data-storage.test.js, tests/backup.test.js
- **Verification:** Suite completa 342/342 verde.
- **Committed in:** `5353d25` (Task 1 RED), `f3da8c6` (Task 2 RED) — parte de los commits de test de cada task.

---

**Total deviations:** 1 auto-fixed (1 blocking — sync de assertions consecuencia directa del bump).
**Impact on plan:** El sync de assertions es inherente a cualquier bump de `CURRENT_SCHEMA_VERSION` y ya estaba previsto implícitamente en la spec (mismo precedente que el bump 5→6 de Plan 15-02). Sin scope creep — solo se tocaron assertions de número de versión, no la lógica de los tests existentes.

## Issues Encountered
- El `old_string` del deep-clone tail (`songProgress`/`lastBackupAt`/`firstUsedAt`/`inFlightTest`) era idéntico en `hydrateV5` y `hydrateV6`, lo que rompió un Edit por ambigüedad. Resuelto anclando la edición al JSDoc único de `hydrateV6` (`@returns {object} Estado v6...`). Sin impacto en el resultado.

## Stub / Threat notes
- **Stubs:** Ninguno. Todo el código está cableado y testado.
- **Threat surface:** Sin superficie nueva fuera del `<threat_model>` del plan. T-17-01 (anti-prototype-pollution) mitigado con el deep-clone defensivo + test `__proto__` own-property; T-17-02 (poda no sobre-amplia) mitigado con tests que asertan las otras categorías intactas + idempotencia; T-17-03 (inFlightTest stale) mitigado con la invalidación en `migrate6to7` + test. T-17-SC (installs) N/A (zero-deps).

## User Setup Required
None - no external service configuration required. El reset de Preposiciones se aplicará automáticamente la próxima vez que el autor abra la app (o importe un backup v6) — coherente con el piloto.

## Next Phase Readiness
- La cadena de migración llega a v7 con reset de Preposiciones listo para cuando la reagrupación de contenido (Plans 17-02/03/04) cambie los ids de los ejercicios.
- **Nota para Plan 17-04 (smoke + sync de counts):** la suite sigue verde con los 52 ejercicios legacy de Preposiciones en disco; los 4 hardcodes de count (`exercise-types.test.js`, `slot-variants-integration.test.js`, `run-validation-271.mjs`) NO se tocaron en este plan (out-of-scope — este plan solo toca código de state). Se sincronizarán cuando el contenido se reagrupe a slots.

## Self-Check: PASSED

- FOUND: src/data/storage.js (`migrate6to7` + `hydrateV7` + `CURRENT_SCHEMA_VERSION = 7`)
- FOUND: src/data/backup.js (`migrate6to7` + `hydrateV7` + `CURRENT_SCHEMA_VERSION = 7`)
- FOUND commit 5353d25 (Task 1 RED)
- FOUND commit d6a8d40 (Task 1 GREEN)
- FOUND commit f3da8c6 (Task 2 RED)
- FOUND commit d1dc4c9 (Task 2 GREEN)
- TDD gate: test commit precede a feat commit en ambas tasks.

---
*Phase: 17-piloto-preposiciones-contenido*
*Completed: 2026-06-03*
