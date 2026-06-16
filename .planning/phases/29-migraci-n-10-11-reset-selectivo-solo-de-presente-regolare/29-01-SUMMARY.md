---
phase: 29-migraci-n-10-11-reset-selectivo-solo-de-presente-regolare
plan: 01
subsystem: database
tags: [localstorage, migration, schema-version, backup, json, prototype-pollution]

# Dependency graph
requires:
  - phase: 21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as
    provides: "patrón migrate8to9/hydrateV9 + RESET_PREFIXES_V9 (espejo directo, reset selectivo por prefijo)"
  - phase: quick-260615-nzi
    provides: "CURRENT_SCHEMA_VERSION=10 + migrate9to10/hydrateV10 (eslabón inmediatamente anterior; bump nominal puro)"
provides:
  - "migrate10to11 (reset selectivo del prefijo presente-regolare) + hydrateV11 + RESET_PREFIXES_V11 en storage.js"
  - "CURRENT_SCHEMA_VERSION=11 + cadena 10->11->hydrateV11 en el dispatcher de storage.js"
  - "backup.js bumpeado a 11: cadena migrate10to11 + hydrateV11, reject >11 genérico, round-trip v11"
  - "state listo para que la 10ª categoría (presente-regolare) nazca limpia en Phase 30; forward-compat de backup"
affects: [Phase 30 alta de presente-regolare, Phase 31 cruces multi-cat + sync de counts]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reset selectivo por prefijo (startsWith) con UN solo elemento manteniendo la forma .some() (D-29-04)"
    - "hydrateVN NO repite la poda de migrateN-1toN (solo garantiza shape)"
    - "Bump espejo storage.js <-> backup.js manteniendo independencia (no import compartido)"

key-files:
  created: []
  modified:
    - src/data/storage.js
    - src/data/backup.js
    - tests/data-storage.test.js
    - tests/backup.test.js

key-decisions:
  - "Reset es no-op hoy (ningún state tiene presente-regolare); se hace por simetría v1.5/v1.6 + forward-compat (D-29-01)"
  - "Target real 10->11 verificado en código antes de hardcodear (NO 9->10 como dicen los IDs MIG-05/06)"
  - "migrate10to11 espeja migrate8to9 (analog funcional), NO migrate9to10 (bump nominal puro, solo se imita su posición)"
  - "hydrateV11 espeja hydrateV10 (tiene el guard root), NO hydrateV9"

patterns-established:
  - "RESET_PREFIXES_V11 = ['presente-regolare']: array de 1 elemento + .some() preservando simetría del patrón"
  - "Trap de tests resuelta en contexto: asserts del output aislado de migrate9to10/hydrateV10 se quedan en 10; asserts de cadena-a-final-state pasan a 11"

requirements-completed: [MIG-05, MIG-06]

# Metrics
duration: 18min
completed: 2026-06-16
---

# Phase 29 Plan 01: Migración 10→11 (reset selectivo de presente-regolare) Summary

**Eslabón 10→11 de la cadena de migración del state: `migrate10to11` resetea selectivamente por prefijo SOLO la categoría nueva `presente-regolare` (espejo de `migrate8to9` con 1 prefijo en vez de 6), `hydrateV11` garantiza shape sin re-podar, y `backup.js` bumpea a 11 con round-trip v11 + import v10→v11 + reject >11.**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-06-16
- **Completed:** 2026-06-16
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- `migrate10to11` + `hydrateV11` + `RESET_PREFIXES_V11` añadidos a `storage.js` espejando el patrón probado de Phase 21 (`migrate8to9`/`hydrateV9`) con la única desviación de UN solo prefijo (`presente-regolare`); deep-clone defensivo anti-prototype-pollution, idempotente y puro.
- `CURRENT_SCHEMA_VERSION` bumpeado a 11 en `storage.js` Y `backup.js` (espejo independiente); dispatcher de `storage.js` encadena `10→11→hydrateV11`; cadena de `backup.js` encadena `migrate10to11` + termina en `hydrateV11`; reject `>11` automático (genérico contra la constante).
- Bloques de tests v11 nuevos en ambos test files (reset, byte-intacto de las 9 reales + songProgress, idempotencia, pureza, anti-prototype-pollution, sub-dict corrupto, cadena v10→v11, cadena end-to-end v8→v11, round-trip v11, import v10→v11 con reset, reject >11) + asserts existentes corregidos en contexto sin reemplazo ciego.
- Suite completa verde salvo el único fail preexistente y ajeno (`genero-numero` content count 12→13). Cero regresiones nuevas del bump.

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate10to11 + hydrateV11 + RESET_PREFIXES_V11 + dispatcher en storage.js** - `7291eee` (feat)
2. **Task 2: bump espejo + cadena + import en backup.js + tests round-trip v11** - `8564761` (feat)
3. **Task 3: verificación de suite completa + no-regresión global** - (verificación; sin cambios de código — todos los asserts residuales en 10 son legítimos)

**Plan metadata:** (docs commit — este SUMMARY + STATE + ROADMAP + REQUIREMENTS)

_Nota: ambas tasks TDD se entregaron como un commit feat cada una (código exacto especificado en 29-PATTERNS.md §§1-5; tests clonados del bloque análogo v9), no como ciclo test→feat separado, por ser replicación literal de un patrón ya probado con su suite._

## Files Created/Modified
- `src/data/storage.js` — añadidos `RESET_PREFIXES_V11`, `migrate10to11`, `hydrateV11`; `CURRENT_SCHEMA_VERSION` 10→11; eslabón `10→11` + `hydrateV11` en el dispatcher.
- `src/data/backup.js` — import de `migrate10to11`/`hydrateV11` (retirado `hydrateV10` ya no usado); `CURRENT_SCHEMA_VERSION` 10→11 + frase de docblock; eslabón `10→11` en la cadena + final `hydrateV11`.
- `tests/data-storage.test.js` — import ampliado; bloque `describe('… v11 — migrate10to11 …')` nuevo (16 tests); 3 asserts de `blankState` a 11.
- `tests/backup.test.js` — bloque `describe('… backup v11 — round-trip + import v10→v11 …')` nuevo (3 tests); 11 asserts de `r.state.schemaVersion` (cadena de backup) a 11; assert de `blankState` a 11; reject-future actualizado a `>11` (schemaVersion 12).

## Decisions Made
- **Target 10→11 verificado en código (no en docs):** `grep` confirmó `CURRENT_SCHEMA_VERSION = 10` en ambos archivos antes de hardcodear; la migración real de v1.7 es 10→11 (los IDs MIG-05/06 dicen 9→10, son stale).
- **Analog funcional = `migrate8to9`, NO `migrate9to10`:** `migrate9to10` (eslabón anterior) es bump nominal puro sin reset; solo se imitó su POSICIÓN en el archivo. `hydrateV11` espeja `hydrateV10` (que ya trae el guard root `const p = ...`), NO `hydrateV9`.
- **`.some()` con array de 1 elemento:** mantenido por simetría del patrón (D-29-04), equivale a `startsWith('presente-regolare')`.
- **Trap de tests resuelta leyendo cada assert en contexto:** los asserts del output aislado de `migrate9to10`/`hydrateV10` (que siguen devolviendo 10) se quedaron en 10; solo los de cadena-a-final-state y `blankState` (que ahora sale 11) pasaron a 11. Cero reemplazos ciegos.

## Deviations from Plan

None - plan executed exactly as written. El código exacto estaba especificado en 29-PATTERNS.md §§1-5; los tests se clonaron del bloque análogo v9/v10. No hubo bugs, funcionalidad faltante ni bloqueos que requirieran las reglas de desviación 1-3, ni decisiones arquitectónicas (regla 4).

## Issues Encountered
- **`hydrateV10` quedaba sin usar en backup.js** tras cambiar el final de la cadena a `hydrateV11`: verificado con `grep` que su única referencia era el eslabón final, retirado del import limpiamente (instrucción explícita del plan). Sin impacto: `hydrateV10` sigue exportado desde `storage.js` para los tests aislados que lo usan directamente.

## Known Stubs
None — la migración es una transformación pura completa; no introduce datos hardcodeados ni placeholders que fluyan a la UI.

## User Setup Required
None - no external service configuration required. Web estática, sin backend, sin nuevas dependencias (tests con `node --test` nativo).

## Test Delta (Task 3 — no-regresión global)
- **Pre-fase (baseline, último commit 077ec83):** 448 tests / 1 fail (preexistente ajeno: `genero-numero` content count 12→13).
- **Post-fase:** 468 tests / 467 pass / **1 fail** — el MISMO fail preexistente y ajeno (`content/exercises/genero-numero.json` "12/12 ejercicios con explanation válida", `tests/exercise-types.test.js:1300`). Es contenido, NO migración; fuera de scope (Phase 31 lo abordará en el sync de counts).
- **Delta:** +20 tests netos (bloque v11 de storage + bloque v11 de backup). **Cero fails nuevos atribuibles al bump 10→11.**
- `node --test tests/data-storage.test.js` → 96/96 verde. `node --test tests/backup.test.js` → 44/44 verde.
- Ningún assert de cadena-completa quedó en `schemaVersion === 10`; los residuales son output aislado de `migrate9to10`/`hydrateV10`, fixtures de input v10 deliberados, comentarios, o `app.state` fixtures ajenos a la cadena de migración.

## Next Phase Readiness
- **Phase 30 (alta de `presente-regolare`)** desbloqueada: el state ya soporta `schemaVersion 11`; la categoría nueva nacerá limpia (sin progreso heredado) y un backup futuro que la contenga se reseteará al re-importar (forward-compat).
- El motor de re-verificación (cascada D-54, sampler, slot-engine) NO se tocó — brownfield puro sobre la cadena de migración existente.
- Sin blockers. El único fail abierto (`genero-numero`) es preexistente y de contenido, ya documentado en STATE.md.

## Self-Check: PASSED

- `src/data/storage.js` — migrate10to11 + hydrateV11 + RESET_PREFIXES_V11 presentes (grep gates OK).
- `src/data/backup.js` — CURRENT_SCHEMA_VERSION=11 + cadena migrate10to11/hydrateV11 + reject >11 (grep gates OK).
- 29-01-SUMMARY.md existe.
- Commits `7291eee` (Task 1) y `8564761` (Task 2) existen en git log.

---
*Phase: 29-migraci-n-10-11-reset-selectivo-solo-de-presente-regolare*
*Completed: 2026-06-16*
