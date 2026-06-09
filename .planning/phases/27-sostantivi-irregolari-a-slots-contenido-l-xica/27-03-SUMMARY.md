---
phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica
plan: 03
subsystem: tooling-tests
tags: [count-sync, slots, conv-01-cierre, milestone-v1.6]
requires:
  - "27-01: reagrupación a slots de sustantivos-irregulares.json"
  - "27-02: 13 variantes nuevas validadas por quórum e integradas"
provides:
  - "3 hardcodes de count de Sostantivi irregolari sincronizados al n real de slots (5)"
  - "TOTAL_EXPECTED recalculado a 183"
  - "CONV-01 cerrado: 9/9 categorías de gramática en slot+variantes (fin v1.6)"
affects:
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - scripts/run-validation-271.mjs
tech-stack:
  added: []
  patterns:
    - "Leer el count real del JSON (data.exercises.length), nunca estimar — lección 19-03..26-03"
key-files:
  created:
    - .planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-03-SUMMARY.md
  modified:
    - tests/exercise-types.test.js
    - tests/fixtures/slot-variants-integration.test.js
    - scripts/run-validation-271.mjs
    - .planning/REQUIREMENTS.md
decisions:
  - "Count real derivado del JSON = 5 slots (no la cuenta de 44 variantes); TOTAL_EXPECTED = 209 − 31 + 5 = 183"
metrics:
  duration: "~6 min"
  completed: "2026-06-09"
  tasks: 2
  files: 4
---

# Phase 27 Plan 03: Sync de count de Sostantivi irregolari + cierre CONV-01 Summary

Re-sincronización de los 3 hardcodes de count de Sostantivi irregolari (31→5) y `TOTAL_EXPECTED` (209→183) contra el conteo REAL de slots leído del JSON, cerrando SOST-01 y con ello CONV-01 (9/9 categorías de gramática en slot+variantes) — fin del milestone v1.6.

## What Was Built

- **Count real derivado del JSON, no estimado:** `node -e "...exercises.length"` = **5 slots** (NO 44 variantes). Verificado antes de cualquier edición. Coincide con la expectativa del plan (5); no hubo discrepancia que obligara a STOP.
- **3 hardcodes sincronizados 31→5:**
  - `tests/exercise-types.test.js` — entry de `CATEGORIES_WITH_EXPLANATIONS` (línea ~1269).
  - `tests/fixtures/slot-variants-integration.test.js` — entry de `REAL_CATEGORIES` (línea ~171).
  - `scripts/run-validation-271.mjs` — entry de `CATEGORIES` (línea ~152).
- **`TOTAL_EXPECTED` recalculado 209→183** (= 209 − 31 + 5). Cabecera "La suma de `expected` es 183" actualizada y línea de historial añadida tras la de Professioni (Phase 26) documentando la conversión HÍBRIDA de Sostantivi irregolari, el duplicado #008==#025 como 2 variantes, el net que BAJA (31 payload → 5 slots) y el CIERRE de CONV-01.
- **Las 8 categorías restantes intactas** (preposiciones 49, articoli 34, avere 20, essere 26, genero-numero 12, partitivos 19, profesiones 11, verbos-movimiento 7).
- **Lógica del smoke NO tocada:** `getExplanation`/`getPrompts` ya bifurcan por `Array.isArray(ex.variants)`; solo cambiaron counts.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Sync count en exercise-types.test.js | 41886cf | tests/exercise-types.test.js |
| 2 | Sync counts en slot-variants-integration + run-validation-271 (TOTAL_EXPECTED) + cierre CONV-01 | 041fb05 | tests/fixtures/slot-variants-integration.test.js, scripts/run-validation-271.mjs |

## Verification

- `node --test tests/*.test.js` → **374/374 PASS**, 0 fail.
- `VAL_07_STRICT=1 node --test tests/*.test.js` → **383/383 PASS**, 0 fail.
- `node scripts/run-validation-271.mjs` → exit 0; VAL-06 **PASS (183/183)**; `sustantivos-irregulares | 5 | 5 validated | 0 disputed/pending/missing`.
- `node scripts/validate-content-fixture.mjs sustantivos-irregulares ...` → exit 0.
- Los 3 hardcodes + TOTAL_EXPECTED coinciden con `data.exercises.length` real (5).

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito. El count real (5) coincidió con la expectativa del task_spec; no se requirió STOP por discrepancia.

## Requirements Closed

- **SOST-01** → Done (27-03): cierre del count, estructura final pasa validator + smoke con counts re-sincronizados.
- **SOST-02** ya estaba Done (27-02).
- Con SOST-01/02 cerrados, **CONV-01 queda cerrado**: 9/9 categorías de gramática en formato slot+variantes unificado → **fin del milestone v1.6**.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: tests/exercise-types.test.js (commit 41886cf en historial)
- FOUND: tests/fixtures/slot-variants-integration.test.js + scripts/run-validation-271.mjs (commit 041fb05 en historial)
- FOUND: .planning/phases/27-sostantivi-irregolari-a-slots-contenido-l-xica/27-03-SUMMARY.md
