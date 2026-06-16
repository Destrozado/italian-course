---
phase: 22-avere-a-slots-contenido
plan: 03
subsystem: tests-validacion
tags: [avere, slots, sync-count, TOTAL_EXPECTED, AVE-01, D-17-04, D-19-09]
requires:
  - 22-01 (avere.json reagrupado a 19 slots)
  - 22-02 (avere.json en 20 slots final: +1 slot nuevo avere-ragione)
provides:
  - "los 3 hardcodes de count de Avere sincronizados al conteo REAL de slots (23 -> 20, leido del JSON)"
  - "TOTAL_EXPECTED recalculado 323 -> 320 (= 323 - 23 + 20)"
  - "comentario del historial del total en run-validation-271.mjs documentando la conversion de Avere a slots"
  - "AVE-01 cerrado (gate final de Phase 22): suite completa + reporter + smoke estricto verdes"
affects:
  - "Phase 23 (Essere) replicara el mismo patron de sync de count tras su conversion"
tech-stack:
  added: []
  patterns:
    - "sync de los 3 hardcodes de count contra data.exercises.length REAL del JSON (D-17-04 / leccion 19-03/20-03: leer, nunca estimar)"
    - "TOTAL_EXPECTED = total_anterior - count_legacy + count_slots; comentario del historial narra cada cambio"
    - "smoke parametrico shape-agnostic (Array.isArray(ex.variants)) heredado del piloto: convertir a slots solo cambia el count, no la logica"
key-files:
  modified:
    - tests/exercise-types.test.js (count de avere en CATEGORIES_WITH_EXPLANATIONS 23->20)
    - tests/fixtures/slot-variants-integration.test.js (REAL_CATEGORIES avere expected 23->20)
    - scripts/run-validation-271.mjs (avere expected 23->20; TOTAL_EXPECTED 323->320; comentario del historial)
decisions:
  - "count real leido del JSON = 20 slots (NO estimacion); los 3 hardcodes coinciden en el mismo numero"
  - "TOTAL_EXPECTED = 323 - 23 + 20 = 320 (articoli=34 y partitivos=19 intactos)"
  - "logica del smoke (getExplanation/getPrompts/bifurcacion por shape) NO tocada; validator y loader NO tocados; blindaje D-88 NO tocado (solo verificado)"
metrics:
  duration: "~10 min"
  completed: "2026-06-05"
  tasks_completed: 2
  files_modified: 3
  total_expected: 320
---

# Phase 22 Plan 03: Sync de counts de Avere (cierre AVE-01) Summary

Re-sincronizados los **3 hardcodes de count de Avere** (`expected: 23 -> 20`) + `TOTAL_EXPECTED` (`323 -> 320`) contra el conteo **REAL** de slots leido del JSON (`data.exercises.length = 20`, NO una estimacion), cerrando AVE-01 — el gate final de la primera conversion de verbos de v1.6. Suite completa (374 tests), VAL_07_STRICT (383 tests) y reporter de validacion (320/320 PASS) verdes; logica del smoke, validator, loader y blindaje D-88 sin tocar.

## Que se hizo

### Task 1 (commit 0236743) — exercise-types.test.js

Leido el conteo real de slots de avere.json (`node -e ".../avere.json').exercises.length"` -> **20**). Actualizado SOLO el `expected` de la entry avere en `CATEGORIES_WITH_EXPLANATIONS` (linea 1268): `23 -> 20`. NO tocadas las entries de articoli (34) ni partitivos (19) ni las otras 6 categorias. La logica `getExplanation`/`getPrompts` (bifurcada por `Array.isArray(ex.variants)`, heredada del piloto/Articoli/Partitivi) sin tocar — `grep -c "Array.isArray(ex.variants)"` = 2 sin cambios. El bloque VAL_07_STRICT hereda el count sincronizado del array compartido. Verde: `node --test` 128 pass; `VAL_07_STRICT=1` 137 pass; 0 fail.

### Task 2 (commit 23998c2) — slot-variants-integration.test.js + run-validation-271.mjs

(1) `slot-variants-integration.test.js:167`: REAL_CATEGORIES avere `expected: 23 -> 20`. (2) `run-validation-271.mjs:95`: avere `expected: 23 -> 20`; `TOTAL_EXPECTED: 323 -> 320` (= 323 − 23 + 20); comentario del historial del total actualizado con una linea analoga a la de Partitivi documentando la conversion de Avere ("→ 320 (v1.6 Phase 22, AVE-01): ... TOTAL = 323 − 23 + 20 = 320"). Los 3 hardcodes coinciden en 20. Verde: integration 26 pass; reporter exit 0 (VAL-06 320/320 PASS, VAL-08 cero disputed, VAL-04 PASS).

## Deviations from Plan

None — plan ejecutado exactamente como fue escrito. El conteo real (20) coincidio con el documentado en 22-02-SUMMARY (era 19 tras 22-01, +1 por avere-ragione en 22-02); no hubo sorpresas que requirieran auto-fix.

## Verification

- `node --test tests/*.test.js` -> exit 0 (374 tests pass, 0 fail — suite COMPLETA: storage/backup v9 Phase 21, integration, exercise-types, articoli/partitivos)
- `VAL_07_STRICT=1 node --test tests/*.test.js` -> exit 0 (383 tests pass, 0 fail)
- `node scripts/run-validation-271.mjs` -> exit 0 (Milestone gate PASS; VAL-06 320/320 validated)
- `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` -> exit 0 ("OK validación: 20 ejercicio(s)")
- `node scripts/assert-avere-prefix-unchanged.mjs` -> exit 0 (D-88 APPEND-ONLY preservado; 17 originales intactos en CORE — no tocado por este plan)
- Los 3 hardcodes + TOTAL_EXPECTED coinciden con `data.exercises.length` real (20): exercise-types=20, slot-variants-integration=20, run-validation-271=20, TOTAL_EXPECTED=320
- articoli=34 y partitivos=19 intactos en los 3 archivos

## Known Stubs

None — solo se sincronizaron counts numericos contra el conteo real del JSON; no se introdujo codigo nuevo, datos placeholder ni UI sin wirear.

## Self-Check: PASSED

- Archivos verificados: 22-03-SUMMARY.md, exercise-types.test.js, slot-variants-integration.test.js, run-validation-271.mjs (todos FOUND)
- Commits verificados: 0236743 (Task 1), 23998c2 (Task 2) (ambos FOUND)
