---
phase: 20-partitivi-a-slots-contenido
plan: 03
subsystem: tests
tags: [partitivos, slots, count-sync, smoke-parametrico, gate-final, milestone-v1.5]
requires:
  - "20-01 (partitivos.json en shape slot+variantes, 17 slots)"
  - "20-02 (4 celdas pobres engordadas + 2 slots nuevos suoni speciali -> 19 slots)"
provides:
  - "los 3 hardcodes de count de Partitivi (exercise-types + slot-variants-integration + run-validation-271) sincronizados al conteo REAL = 19 slots leido del JSON"
  - "TOTAL_EXPECTED recalculado a 323 (= 348 - 44 + 19); comentario del historial del total actualizado con la conversion de Partitivi"
  - "suite completa + reporter + smoke estricto verdes; PART-03 cerrado; milestone v1.5 con los 9/9 requisitos completos"
affects:
  - "ningun otro plan abierto — gate final de Phase 20 y del milestone v1.5"
tech-stack:
  added: []
  patterns:
    - "sync de los 3 hardcodes de count contra data.exercises.length REAL (no estimacion; leccion 19-03)"
    - "smoke parametrico shape-agnostic (Array.isArray(ex.variants)) heredado del piloto/Articoli — solo cambian los counts, nunca la logica"
    - "comentario del historial del total como audit trail incremental (espejo del registro de Articoli 19-03)"
key-files:
  created: []
  modified:
    - "tests/exercise-types.test.js (expected partitivos 44 -> 19)"
    - "tests/fixtures/slot-variants-integration.test.js (expected partitivos 44 -> 19)"
    - "scripts/run-validation-271.mjs (expected partitivos 44 -> 19; TOTAL_EXPECTED 348 -> 323; comentario del historial)"
decisions:
  - "conteo REAL leido del JSON = 19 slots (NO estimacion; leccion 19-03: estimo ~25, real 34)"
  - "TOTAL_EXPECTED = 348 - 44 + 19 = 323 (articoli=34 intacto, partitivos de 44 a 19)"
  - "validator, loader y logica del smoke NO tocados (ya aceptan variants[] / ya bifurcan por shape); solo counts"
metrics:
  duration: "~6 min"
  completed: "2026-06-05"
  tasks: 2
  files: 3
---

# Phase 20 Plan 03: Sincronizacion de counts de Partitivi (PART-03, gate final v1.5) Summary

Re-sincronizados los 3 hardcodes de count de Partitivi (`expected: 44`) + `TOTAL_EXPECTED` contra el conteo REAL final de slots de `partitivos.json` leido del JSON (`data.exercises.length` = **19**, NO una estimacion) tras la conversion a slots de 20-01/20-02. El smoke parametrico ya era shape-agnostic (bifurcacion `Array.isArray(ex.variants)` heredada del piloto/Articoli), asi que solo cambiaron los counts: validator, loader y logica del test intactos. Suite completa, reporter de validacion y smoke estricto verdes. Cierra PART-03 y completa el milestone v1.5 (9/9 requisitos).

## What Was Built

- **Task 1 (commit `b5c05bc`):** `tests/exercise-types.test.js` — `expected` de partitivos en `CATEGORIES_WITH_EXPLANATIONS` (linea 1274) sincronizado `44 -> 19`. Solo esa linea: los accessors `getExplanation`/`getPrompts` ya bifurcan por shape (verificado: `grep -c "Array.isArray(ex.variants)"` == 2, sin cambios). La gate `VAL_07_STRICT` hereda el count corregido y pasa (toda superficie nueva de 20-02 tiene `validation` top-level validated, D-19-09). Las 8 cats no-partitivos intactas (articoli sigue en 34).
- **Task 2 (commit `eceae09`):** los otros 2 hardcodes + el total:
  - `tests/fixtures/slot-variants-integration.test.js:175` — partitivos `44 -> 19` en `REAL_CATEGORIES`.
  - `scripts/run-validation-271.mjs:91` — partitivos `44 -> 19`; `TOTAL_EXPECTED` (linea 97) `348 -> 323` (= 348 − 44 + 19); comentario del historial del total (lineas 63-80+) actualizado con una entrada nueva que narra la conversion de Partitivi (espejo del registro de Articoli de 19-03: "TOTAL = 348 − 44 + 19 = 323").

Los 3 hardcodes coinciden en el MISMO numero (19) = `data.exercises.length` real de partitivos.json.

## Verification

- `node --test tests/exercise-types.test.js` -> **128/128** (Task 1)
- `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` -> **137/137** (Task 1)
- `node --test tests/fixtures/slot-variants-integration.test.js` -> **26/26** (Task 2)
- `node scripts/run-validation-271.mjs` -> **exit 0**, VAL-06 PASS (323/323), VAL-08 PASS (cero disputed), VAL-04 PASS (>=2 IAs por validated)
- `node --test tests/*.test.js` (suite COMPLETA) -> **358/358 verde** (el rojo del count hardcoded de 20-01/20-02 resuelto)
- `VAL_07_STRICT=1 node --test tests/*.test.js` -> **367/367 verde**
- `node scripts/validate-content-fixture.mjs partitivos content/exercises/partitivos.json` -> **exit 0** (19 slots)
- Los 3 hardcodes == `node -e "require('./content/exercises/partitivos.json').exercises.length"` == **19** (coinciden)
- `TOTAL_EXPECTED` == 348 − 44 + 19 == 323 (verificable aritmeticamente; articoli sigue contribuyendo 34)
- Logica del smoke (bifurcacion shape), validator y loader NO modificados — solo counts

## Deviations from Plan

None — plan ejecutado exactamente como escrito. Conteo leido del JSON (19), NO estimado; los 3 hardcodes + TOTAL_EXPECTED sincronizados al MISMO numero; articoli=34 intacto; logica del test sin tocar.

## Known Stubs

None — cambio de counts puro sobre tests/script ya existentes; no hay datos sin wirear.

## Self-Check: PASSED

- FOUND: tests/exercise-types.test.js (expected partitivos = 19)
- FOUND: tests/fixtures/slot-variants-integration.test.js (expected partitivos = 19)
- FOUND: scripts/run-validation-271.mjs (expected partitivos = 19, TOTAL_EXPECTED = 323)
- FOUND commit b5c05bc (Task 1)
- FOUND commit eceae09 (Task 2)
