---
phase: 24-verbi-di-movimento-a-slots-contenido
plan: 03
subsystem: tooling-counts
tags: [slots, count-sync, validation, MOV-01]
requires:
  - "24-01 (reagrupación a slots de verbos-movimiento)"
  - "24-02 (variantes nuevas por quórum)"
provides:
  - "Los 3 hardcodes de count de Verbi di movimento + TOTAL_EXPECTED sincronizados contra data.exercises.length real (7 slots)"
affects:
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - scripts/run-validation-271.mjs
tech-stack:
  added: []
  patterns:
    - "Sync de count derivado del JSON real (data.exercises.length), nunca estimación — lección 19-03/20-03/22-03/23-03"
    - "Smoke paramétrico shape-agnostic (Array.isArray(ex.variants)) — solo cambia el count, no la lógica"
key-files:
  created:
    - .planning/phases/24-verbi-di-movimento-a-slots-contenido/24-03-SUMMARY.md
  modified:
    - tests/exercise-types.test.js
    - tests/fixtures/slot-variants-integration.test.js
    - scripts/run-validation-271.mjs
decisions:
  - "Count REAL leído del JSON = 7 slots (essere + concordanza + excepcioni-avere + correre + 3 word-buttons). NO estimación."
  - "TOTAL_EXPECTED = 307 - 37 + 7 = 277. El net BAJÓ (concordancia en 1 solo slot D-24-03, sin cruces) — divergencia vs Essere que SUBIÓ."
  - "Las variantes nuevas de los 4 ejes (24-02) NO suben el count: solo los slots lo hacen."
metrics:
  duration: "~4 min"
  completed: "2026-06-08"
  tasks: 2
  files: 3
---

# Phase 24 Plan 03: Sync de counts de Verbi di movimento (cierre MOV-01) Summary

Re-sincronizados los 3 hardcodes de count de Verbi di movimento (`expected: 37 → 7`) + `TOTAL_EXPECTED` (`307 → 277` = 307 − 37 + 7) contra el conteo REAL de slots leído del JSON (`data.exercises.length = 7`, NO estimación), cerrando MOV-01.

## What Was Built

Tercera y última de las 3 conversiones de verbos de v1.6. Tras 24-01 (reagrupación a slots) + 24-02 (variantes nuevas por quórum), `verbos-movimiento.json` quedó en **7 slots reales**:

1. `verbos-movimiento-essere` (passato prossimo con auxiliar essere)
2. `verbos-movimiento-concordanza` (concordancia de participio en 1 SOLO slot, D-24-03)
3. `verbos-movimiento-excepcioni-avere` (excepciones sin destino → avere)
4. `verbos-movimiento-correre` (correre como slot propio, alterna por destino, D-24-04)
5. `verbos-movimiento-wb-andare` (word-buttons)
6. `verbos-movimiento-wb-viaggiare` (word-buttons)
7. `verbos-movimiento-wb-uscire` (word-buttons)

Las 37 superficies fuente + las variantes nuevas de los 4 ejes (24-02) viven dentro de los `variants[]` de estos slots — las variantes NO suben el count, solo los slots. El net BAJÓ respecto a 37 (la concordancia quedó en 1 solo slot y no hay cruces multi-cat), divergencia deliberada vs Essere que SUBIÓ por el passato en 4 slots + ser/estar.

### Task 1 — exercise-types.test.js (commit a24cf29)
`CATEGORIES_WITH_EXPLANATIONS` verbos-movimiento `expected: 37 → 7`. La lógica `getExplanation`/`getPrompts` shape-agnostic (`Array.isArray(ex.variants)`) NO se tocó (grep `Array.isArray(ex.variants)` = 2, sin cambios). El bloque VAL_07_STRICT hereda el count sincronizado del array compartido. avere 20 / articoli 34 / partitivos 19 / essere 26 intactos.

### Task 2 — slot-variants-integration.test.js + run-validation-271.mjs (commit 6464f80)
- `slot-variants-integration` REAL_CATEGORIES verbos-movimiento `37 → 7`.
- `run-validation-271` verbos-movimiento `expected: 37 → 7` + `TOTAL_EXPECTED 307 → 277` + frase "La suma de `expected` es 277" + línea MOV-01 añadida al comentario del historial del total (concordancia 1 slot D-24-03, correre propio D-24-04, net bajó).

Los 3 hardcodes coinciden en el mismo número (7).

## Verification

| Gate | Resultado |
|------|-----------|
| `node --test tests/*.test.js` | **374 pass / 0 fail** |
| `VAL_07_STRICT=1 node --test tests/*.test.js` | **383 pass / 0 fail** |
| `node scripts/run-validation-271.mjs` | **exit 0 — VAL-06 277/277 PASS, VAL-08 cero disputed, VAL-04 PASS** |
| `node scripts/validate-content-fixture.mjs verbos-movimiento ...` | **exit 0 (7 ejercicios)** |
| `grep -c "Array.isArray(ex.variants)" tests/exercise-types.test.js` | 2 (lógica sin tocar) |
| reporter verbos-movimiento row | 7 / 7 validated, 0 disputed |

Las 8 categorías no-verbos-movimiento siguen verdes con sus counts originales (avere 20, articoli 34, partitivos 19, essere 26, preposiciones 49, genero-numero 40, sustantivos-irregulares 31, profesiones 51). No se corrió ningún assert de snapshot (avere-only, no existe para Verbi di movimento).

## Deviations from Plan

None - plan executed exactly as written. Count leído del JSON real (7), no estimado.

## Self-Check: PASSED
- FOUND: tests/exercise-types.test.js (expected: 7)
- FOUND: tests/fixtures/slot-variants-integration.test.js (expected: 7)
- FOUND: scripts/run-validation-271.mjs (expected: 7, TOTAL_EXPECTED: 277)
- FOUND: commit a24cf29 (Task 1)
- FOUND: commit 6464f80 (Task 2)
- FOUND: .planning/phases/24-verbi-di-movimento-a-slots-contenido/24-03-SUMMARY.md
