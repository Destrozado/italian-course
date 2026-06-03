---
phase: 17-piloto-preposiciones-contenido
plan: 04
status: complete
completed: 2026-06-03
requirements: [PILOT-05]
subsystem: testing/content-validation
tags: [slot-variants, smoke-test, count-sync, shape-bifurcation, pilot-gate]
dependency_graph:
  requires: ["17-02 (reagrupación a slots)", "17-03 (variantes + locativos, 49 slots)"]
  provides: "smoke paramétrico shape-agnostic (slot/legacy) + 3 hardcodes de count sincronizados a 49"
  affects: "CONV-01 (futuras categorías a slots reutilizan la bifurcación sin reescribir el test)"
tech_stack:
  added: []
  patterns: ["bifurcación por shape Array.isArray(ex.variants)", "accessor shape-agnostic getExplanation/getPrompts"]
key_files:
  created: []
  modified:
    - tests/exercise-types.test.js
    - tests/fixtures/slot-variants-integration.test.js
    - scripts/run-validation-271.mjs
    - content/exercises/preposiciones.json
decisions:
  - "D-17-04-A: count expected de Preposiciones = data.exercises.length = 49 slots reales (47 reagrupados + 2 locativos), NO 52 ni la estimación previa"
  - "D-17-04-B: TOTAL_EXPECTED = 373 − 52 + 49 = 370 (recalculado aritméticamente, no adivinado)"
  - "D-17-04-C: bifurcación shape-agnostic sin hardcodear 'preposiciones' — la rama slot dispara con cualquier ex.variants[] (listo para CONV-01)"
metrics:
  duration: ~30min
  completed: 2026-06-03
  tasks: 2
  files: 4
---

# Phase 17 Plan 04: Sincronización del smoke paramétrico al shape slot (PILOT-05) Summary

Smoke paramétrico bifurcado por shape (slot vs legacy) y los 3 hardcodes de count (`52`) + `TOTAL_EXPECTED` sincronizados al conteo REAL de 49 slots leído del JSON — gate final del piloto Preposiciones verde (suite completa + reporter + smoke estricto).

## Resultado

PILOT-05 cerrado: convertir Preposiciones a `slot+variantes` rompía 4 checks que asumían `ex.payload.*` y `expected: 52` replicado en 4 sitios. Este plan (1) hizo el smoke paramétrico **shape-agnostic** mediante bifurcación `Array.isArray(ex.variants)` — slots leen `ex.explanation` (top-level) + `ex.variants[].prompt`, las 8 categorías legacy siguen por `ex.payload.*` sin tocar — y (2) sincronizó los 3 hardcodes de count y `TOTAL_EXPECTED` contra el conteo real (`data.exercises.length === 49`), no una estimación.

Conteo real verificado en disco: **49 slots** (todos con `variants[]`, 0 con `payload`). `TOTAL_EXPECTED` recalculado: 373 − 52 + 49 = **370**.

## Tareas completadas

| Task | Nombre | Commit | Archivos |
| ---- | ------ | ------ | -------- |
| 1 | Bifurcar CATEGORIES_WITH_EXPLANATIONS por shape + sync count | d4ea624 | tests/exercise-types.test.js, content/exercises/preposiciones.json |
| 2 | Sincronizar counts en slot-variants-integration + run-validation-271 | 38718fd | tests/fixtures/slot-variants-integration.test.js, scripts/run-validation-271.mjs |

## Cómo se implementó

**Task 1 — bifurcación shape-agnostic (tests/exercise-types.test.js):**
- `expected` de preposiciones en `CATEGORIES_WITH_EXPLANATIONS`: 52 → 49.
- Dos accessors helper definidos una sola vez, sin hardcodear slug:
  - `getExplanation(ex)` → `Array.isArray(ex.variants) ? ex.explanation : ex.payload?.explanation`
  - `getPrompts(ex)` → slot: `ex.variants.map(v => v.prompt)`; legacy: `[ex.payload?.prompt]`
- coverage / smart-quotes (CONT-06) / markdown (D-126) / R2 cross-refs (#NNN) ahora leen `getExplanation(ex)` → top-level para slots, payload para legacy.
- R1 leak (prompt) usa `flatMap` sobre `getPrompts(ex)`: en slots escanea **cada** variante; en legacy el único prompt. Cobertura de seguridad preservada para todas las superficies.
- El bloque `VAL_07_STRICT` lee `ex.validation?.status` (top-level) → sobrevive sin cambio salvo heredar el count sincronizado.

**Task 2 — sync de counts (los otros 2 archivos):**
- `slot-variants-integration.test.js`: `REAL_CATEGORIES` preposiciones 52 → 49.
- `run-validation-271.mjs`: `CATEGORIES` preposiciones 52 → 49; `TOTAL_EXPECTED` 373 → 370; comentario explicativo actualizado narrando la conversión PILOT-05 (precedente: el comentario narra cada movimiento histórico del total).

## Verificación

Las 5 comprobaciones del plan exit 0:

| Comando | Exit |
| ------- | ---- |
| `node --test tests/*.test.js` | 0 |
| `VAL_07_STRICT=1 node --test tests/*.test.js` | 0 |
| `node scripts/run-validation-271.mjs` (Milestone gate PASS) | 0 |
| `node scripts/validate-content-fixture.mjs preposiciones ...` | 0 |
| `node scripts/assert-avere-prefix-unchanged.mjs` | 0 |

`grep -c "Array.isArray(ex.variants)" tests/exercise-types.test.js` → 2 (bifurcación presente). Las 8 categorías legacy conservan sus counts originales (40/23/31/37/39/51/56/44) intactos.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Persistido el bloque `validation` de los 2 slots locativos nuevos**
- **Found during:** Task 1 — `VAL_07_STRICT=1` y `run-validation-271.mjs` fallaban porque `preposiciones-in-locativo` y `preposiciones-al-mare` (creados en 17-03, PILOT-03) no tenían el campo `validation` persistido en el JSON. Ambos comandos son acceptance criteria del plan y exigían exit 0.
- **Por qué no es una decisión editorial nueva (no Rule 4):** el quórum cross-vendor R1-R7 de las 4 variantes locativas (`nv-in-spiaggia`, `nv-in-montagna`, `nv-in-campagna`, `nv-al-mare`) YA se ejecutó y aprobó en 17-03 — la tabla de audit del 17-03-SUMMARY las marca `INTEGRADA` con DeepSeek=C, Opus=C, Sonnet=C (3 IAs distintas, 2 vendors). El quórum vivía sólo en el SUMMARY, no persistido como `passes[]`. Esto es **registrar** un verdicto ya tomado, no tomar uno nuevo.
- **Fix:** añadido `validation: { status: "validated", passes: [opus-4-8 correcta, sonnet-4-6 correcta, 2026-05-29] }` a ambos slots, siguiendo la convención persistida existente (los bloques en disco sólo registran pases Claude; la verificación cross-vendor externa queda en el audit del SUMMARY). `deriveStatus` confirma `validated` (≥2 `correcta` con `by` distintos, 0 `incorrecta`).
- **Files modified:** content/exercises/preposiciones.json
- **Commit:** d4ea624

## Self-Check: PASSED
- FOUND: tests/exercise-types.test.js (modificado, bifurcación presente x2)
- FOUND: tests/fixtures/slot-variants-integration.test.js (expected 49)
- FOUND: scripts/run-validation-271.mjs (expected 49, TOTAL_EXPECTED 370)
- FOUND: content/exercises/preposiciones.json (49 slots, 2 locativos validated)
- FOUND: commit d4ea624
- FOUND: commit 38718fd
- FOUND: .planning/phases/17-piloto-preposiciones-contenido/17-04-SUMMARY.md
