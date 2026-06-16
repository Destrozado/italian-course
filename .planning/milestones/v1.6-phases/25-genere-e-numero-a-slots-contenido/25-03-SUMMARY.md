---
phase: 25-genere-e-numero-a-slots-contenido
plan: 03
subsystem: tooling-tests
tags: [genero-numero, count-sync, smoke-shape-agnostic, reporter, gate-final]
requires:
  - "25-01 (genero-numero.json en shape slot+variantes, 12 slots, 40 superficies)"
  - "25-02 (60 variantes totales; 20 nuevas validadas; count estable 12)"
provides:
  - "los 3 hardcodes de count de genero-numero (40 -> 12) sincronizados contra data.exercises.length real"
  - "TOTAL_EXPECTED recalculado (277 -> 249 = 277 - 40 + 12)"
  - "suite completa + reporter + smoke estricto verdes (cierre GEN-01)"
affects:
  - "Phase 25 COMPLETA (3/3 plans) — primera de las 3 conversiones morfología/léxico de v1.6"
tech-stack:
  added: []
  patterns:
    - "sync de count contra el JSON real (data.exercises.length), NO estimación (D-17-04/D-19-09, lección 19-03/20-03/22-03/23-03/24-03)"
    - "smoke paramétrico shape-agnostic (Array.isArray(ex.variants)) — la rama match cubre los 3 match preservados sin tocar lógica"
    - "TOTAL_EXPECTED recalculado = total previo - count_legacy + n_slots_real"
key-files:
  created:
    - ".planning/phases/25-genere-e-numero-a-slots-contenido/25-03-SUMMARY.md"
  modified:
    - "tests/exercise-types.test.js (CATEGORIES_WITH_EXPLANATIONS genero-numero 40 -> 12)"
    - "tests/fixtures/slot-variants-integration.test.js (REAL_CATEGORIES genero-numero 40 -> 12)"
    - "scripts/run-validation-271.mjs (expected 40 -> 12, TOTAL_EXPECTED 277 -> 249, comentario del historial)"
decisions:
  - "Count real = 12 slots leído del JSON (data.exercises.length tras 25-01+25-02), NO estimado; net BAJÓ (40 payload -> 12 slots, 6 duplicados colapsados; las 20 variantes nuevas de 25-02 NO suben el count)"
  - "TOTAL_EXPECTED = 277 - 40 + 12 = 249 (avere=20, articoli=34, partitivos=19, essere=26, verbos-movimiento=7 intactos)"
  - "Lógica del smoke (getExplanation/getPrompts/bifurcación/rama match) NO tocada — ya shape-agnostic; solo cambian los counts"
metrics:
  duration: "~5 min"
  completed: "2026-06-08"
  tasks: 2
  files: 3
---

# Phase 25 Plan 03: Sync de counts de Genere e numero (cierre GEN-01) Summary

Re-sincronizados los **3 hardcodes de count de Genere e numero** (`expected: 40 → 12`) + `TOTAL_EXPECTED` (`277 → 249` = 277 − 40 + 12) contra el conteo **REAL** de slots leído del JSON (`data.exercises.length = 12`, NO estimación), cerrando GEN-01 (cierre del count) y la **Phase 25 completa (3/3)**. El smoke paramétrico ya era shape-agnostic (los 3 match preservados pasan por la rama match): solo cambiaron los counts; validator/loader/lógica del smoke NO tocados.

## What Was Built

**Task 1 (commit `e0c413d`):** `tests/exercise-types.test.js` — entry `genero-numero` de `CATEGORIES_WITH_EXPLANATIONS` (línea 1267): `expected: 40 → 12`. La lógica `getExplanation`/`getPrompts` (bifurcación `Array.isArray(ex.variants)` + rama match) NO se tocó (grep `Array.isArray(ex.variants)` = 2, sin cambios). El bloque VAL_07_STRICT hereda el count sincronizado del array compartido. Las otras 8 categorías intactas (avere 20, articoli 34, partitivos 19, essere 26, verbos-movimiento 7, preposiciones 49, sustantivos-irregulares 31, profesiones 51).

**Task 2 (commit `20433e9`):**
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES` genero-numero (línea 172): `expected: 40 → 12`.
- `scripts/run-validation-271.mjs` — entry genero-numero (línea 125): `expected: 40 → 12`; `TOTAL_EXPECTED` (línea 132): `277 → 249`; primera línea del comentario del historial (`La suma de expected es 277 → 249`); añadida la línea analoga del historial DESPUÉS de Verbi di movimento (Phase 24): conversión de Genere e numero a slots (granularidad fina D-25-01, 1 slot por micro-regla, 3 match preservados D-25-03/D-04, 6 duplicados colapsados, las 20 variantes nuevas no suben el count, net BAJÓ 40→12, TOTAL = 277 − 40 + 12 = 249).

Los 3 hardcodes coinciden en el mismo número (12 = `data.exercises.length` real).

## Verification Evidence

- `node --test tests/*.test.js` → **374 pass / 0 fail** (suite COMPLETA verde; el rojo esperado de 25-01/25-02 cerrado)
- `VAL_07_STRICT=1 node --test tests/*.test.js` → **383 pass / 0 fail**
- `node scripts/run-validation-271.mjs` → **exit 0**: VAL-06 PASS **249/249 validated**, genero-numero **12/12 validated** (0 disputed, 0 pending, 0 missing); VAL-08 PASS (cero disputed); VAL-04 PASS
- `node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json` → **exit 0, 12 ejercicios**
- `node --test tests/exercise-types.test.js` → 128 pass / 0 fail; `VAL_07_STRICT=1` → 137 pass / 0 fail
- `node --test tests/fixtures/slot-variants-integration.test.js` → 26 pass / 0 fail
- `grep -c "Array.isArray(ex.variants)" tests/exercise-types.test.js` = **2** (lógica del smoke sin tocar)
- Conteo real verificado: `require('./content/exercises/genero-numero.json').exercises.length` = **12**; los 3 hardcodes coinciden
- Aritmética del total: 277 − 40 + 12 = **249** (avere 20, articoli 34, partitivos 19, essere 26, verbos-movimiento 7, preposiciones 49, sustantivos-irregulares 31, profesiones 51, genero-numero 12 = 249)
- Categorías vecinas intactas: el reporter muestra cada categoría con su count original; ninguna otra modificada
- NO snapshot (avere-only, D-25-10) — no se ejecutó ningún script de snapshot/assert

## Aritmética del net (por qué BAJÓ)

A diferencia de Essere (que SUBIÓ: passato en 4 slots + ser/estar), Genere e numero **BAJÓ**: la granularidad es FINA (1 slot por micro-regla) pero los **6 pares de duplicados literales** del set legacy se colapsaron a variantes del mismo slot, dejando 12 slots reales. Las **20 variantes nuevas de 25-02** (los 4 ejes D-25-04: invariables, sonido duro con excepción amico→amici, género -trice/-essa, plural base) son VARIANTES, no slots → NO suben `data.exercises.length`. Net de fase = 40 payload → 12 slots = **−28**.

## Deviations from Plan

None — plan ejecutado exactamente como escrito. El count real leído del JSON (12) coincidió con el valor que el dependency_context anticipaba; se leyó del JSON, no se asumió. Sin auto-fixes (Rules 1-3) necesarios.

## Known Stubs

None — este plan solo sincroniza hardcodes de count en tooling/tests. No introduce contenido ni stubs. Las celdas pobres documentadas en 25-01/25-02 (articolo-suono 2 vars, articolo-plurale-logo 1 var, match-plurale 1 var) son decisiones de scope del autor, no stubs.

## Threat Flags

None — edita hardcodes de count en tests/scripts de tooling de una app local single-user offline sin backend; no introduce superficie de seguridad nueva. T-25-09 (count desincronizado) MITIGADO: los 3 hardcodes + TOTAL_EXPECTED se sincronizaron contra el MISMO conteo real del JSON, el acceptance assertó coincidencia y el reporter PASS. T-25-03 (HTML/markdown/smart-quotes en slot) MITIGADO: el smoke shape-agnostic escanea explanation + variants[].prompt + la rama match sin perder cobertura. T-25-08 (slot/variante no validated en VAL_07) MITIGADO: VAL_07_STRICT 383/383 verde.

## Self-Check: PASSED

- FOUND: tests/exercise-types.test.js (genero-numero expected 12, suite + VAL_07 verdes)
- FOUND: tests/fixtures/slot-variants-integration.test.js (genero-numero expected 12, 26 pass)
- FOUND: scripts/run-validation-271.mjs (expected 12, TOTAL_EXPECTED 249, reporter PASS 249/249)
- FOUND: .planning/phases/25-genere-e-numero-a-slots-contenido/25-03-SUMMARY.md
- FOUND commit e0c413d (Task 1) · FOUND commit 20433e9 (Task 2)
