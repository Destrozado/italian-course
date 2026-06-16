---
phase: 26-professioni-a-slots-contenido-l-xica
plan: 03
subsystem: tooling-tests
tags: [slots, profesiones, sync-counts, gate-final, TOTAL_EXPECTED]
requires:
  - "26-01 (profesiones.json en shape slot+variantes HIBRIDO, 11 slots)"
  - "26-02 (12 variantes nuevas integradas; count estable 11)"
provides:
  - "los 3 hardcodes de count de profesiones + TOTAL_EXPECTED sincronizados contra el conteo REAL de slots (11)"
  - "suite completa + reporter + smoke estricto verdes (cierre PROF-01)"
affects:
  - "cierre del rojo esperado de 26-01/26-02 (Esperaba 51, encontre 11)"
tech-stack:
  added: []
  patterns:
    - "sync de los 3 hardcodes + TOTAL_EXPECTED contra data.exercises.length REAL del JSON, NO estimacion (leccion 19-03/20-03/22-03/23-03/24-03/25-03)"
    - "smoke parametrico shape-agnostic (Array.isArray(ex.variants)) — solo el count cambia, NO la logica"
key-files:
  created:
    - ".planning/phases/26-professioni-a-slots-contenido-l-xica/26-03-SUMMARY.md"
  modified:
    - "tests/exercise-types.test.js (CATEGORIES_WITH_EXPLANATIONS profesiones 51->11)"
    - "tests/fixtures/slot-variants-integration.test.js (REAL_CATEGORIES profesiones 51->11)"
    - "scripts/run-validation-271.mjs (expected 51->11 + TOTAL_EXPECTED 249->209 + comentario del historial)"
decisions:
  - "count real de profesiones = 11 slots (leido del JSON con data.exercises.length, NO estimado); las 12 variantes nuevas de 26-02 NO suben el count"
  - "TOTAL_EXPECTED = 249 - 51 + 11 = 209 (el net BAJO por la fusion a slot+variantes)"
  - "validator/loader/logica del smoke NO tocados — solo los counts (ya shape-agnostic desde v1.4)"
metrics:
  duration: "~6 min"
  completed: "2026-06-09"
  tasks: 2
  files: 3
---

# Phase 26 Plan 03: Sync de counts de Professioni (cierre PROF-01) Summary

Re-sincronizados los **3 hardcodes de count de Professioni** (`expected: 51 -> 11`) + `TOTAL_EXPECTED` (`249 -> 209` = 249 - 51 + 11) contra el conteo **REAL** de slots leido del JSON (`data.exercises.length = 11`, NO estimacion), cerrando el rojo esperado de 26-01/26-02. Gate final TODO VERDE.

## Que se hizo

**Task 1 (commit `ae516ff`)** — `tests/exercise-types.test.js`: el `expected` de profesiones en `CATEGORIES_WITH_EXPLANATIONS` (linea 1272) cambiado de 51 a **11**. Las otras 8 categorias intactas (preposiciones 49, articoli 34, avere 20, essere 26, genero-numero 12, partitivos 19, sustantivos-irregulares 31, verbos-movimiento 7). La logica del smoke (`getExplanation`/`getPrompts`/bifurcacion por `Array.isArray(ex.variants)`/rama match/rama word-buttons) NO se toco (grep `Array.isArray(ex.variants)` = 2, sin cambios). Professioni convertido a slots (MC + los 3 match + el slot word-buttons) pasa coverage/R1/R2/smart-quotes/markdown/VAL_07 automaticamente.

**Task 2 (commit `7e4b0ad`)** — los otros 2 hardcodes + TOTAL_EXPECTED:
- `tests/fixtures/slot-variants-integration.test.js`: `REAL_CATEGORIES` profesiones (linea 173) 51 -> **11**.
- `scripts/run-validation-271.mjs`: `expected` profesiones (linea 140) 51 -> **11**; `TOTAL_EXPECTED` (linea 145) 249 -> **209** (= 249 - 51 + 11); primera linea del comentario ("La suma de `expected` es 209"); anadida la linea del historial del total DESPUES de la de Genere e numero (Phase 25) que registra la conversion HIBRIDA de Professioni a 11 slots (bloque regla por sub-regla de feminizacion + bloque lexico puro sin variantes con 3 match preservados D-26-02/D-04 + articolo-suono + word-buttons D-26-06; las 12 variantes nuevas de 26-02 NO suben el count; el net BAJO de 51 payload a 11 slots).

Los 3 hardcodes coinciden en el MISMO numero (11), leido del JSON.

## Decisiones tomadas

- **Count real = 11 slots**, leido del JSON (`node -e "...exercises.length"` = 11), NO estimado (leccion 19-03/20-03/22-03/23-03/24-03/25-03). Las 12 variantes nuevas de 26-02 son variantes, NO slots -> no suben `data.exercises.length`.
- **TOTAL_EXPECTED = 209** = 249 - 51 + 11. El net BAJO por la fusion a slot+variantes (51 ejercicios payload -> 11 slots reales). Las demas contribuciones intactas: preposiciones 49, articoli 34, avere 20, essere 26, genero-numero 12, partitivos 19, sustantivos-irregulares 31, verbos-movimiento 7.
- **Validator y loader NO tocados** (ya aceptan variants[]); **logica del smoke NO tocada** (ya shape-agnostic desde v1.4). Solo cambiaron los counts.

## Verificacion

- `node --test tests/*.test.js` -> **374 pass / 0 fail** (rojo esperado de 26-01/26-02 cerrado).
- `VAL_07_STRICT=1 node --test tests/*.test.js` -> **383 pass / 0 fail**.
- `node scripts/run-validation-271.mjs` -> **exit 0** (VAL-06 209/209 PASS, profesiones 11/11 validated, VAL-08 cero disputed, VAL-04 PASS; sin warning de count para profesiones).
- `node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json` -> **exit 0** (11 ejercicios).
- Los 3 hardcodes + TOTAL_EXPECTED == conteo real: `data.exercises.length = 11`; `249 - 51 + 11 = 209` verificado aritmeticamente.
- Smoke shape-agnostic intacto: `grep -c "Array.isArray(ex.variants)" tests/exercise-types.test.js` = 2 (sin cambios).
- **NO snapshot**: Professioni no tiene snapshot/assert APPEND-ONLY (avere-only, D-26-12). No se corrio ningun script de snapshot.

## Deviations from Plan

None - plan ejecutado exactamente como escrito. El conteo real (11 slots) se leyo del JSON, NO se asumio; coincidio con lo anticipado en 26-01/26-02 (las 12 variantes nuevas no suben el count). Validator/loader/logica del smoke sin tocar; las 8 cats no-profesiones intactas.

## Self-Check: PASSED

- FOUND: tests/exercise-types.test.js (profesiones expected: 11)
- FOUND: tests/fixtures/slot-variants-integration.test.js (profesiones expected: 11)
- FOUND: scripts/run-validation-271.mjs (profesiones expected: 11, TOTAL_EXPECTED: 209)
- FOUND commit ae516ff (Task 1)
- FOUND commit 7e4b0ad (Task 2)
- Gate final verde: 374/374 suite, 383/383 VAL_07_STRICT, reporter exit 0, validator exit 0
