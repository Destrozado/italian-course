---
phase: 19-articoli-a-slots-contenido
plan: 03
subsystem: testing
tags: [slots, articoli, smoke-test, count-sync, validation-gate, cross-vendor]

requires:
  - phase: 19-articoli-a-slots-contenido (19-01)
    provides: Articoli reescrito de 56 ejercicios payload → 32 slots slot+variantes
  - phase: 19-articoli-a-slots-contenido (19-02)
    provides: 5 celdas pobres engordadas + 2 slots nuevos semiconsonánticos (lo-yi/gli-yi) por quórum cross-vendor → 34 slots
provides:
  - Los 3 hardcodes de count de Articoli (exercise-types, slot-variants-integration, run-validation-271) sincronizados a 34 slots reales
  - TOTAL_EXPECTED recalculado 370 → 348 (= 370 − 56 + 34)
  - validation.status top-level añadida a articoli-lo-yi y articoli-gli-yi (cierre del gate VAL_07_STRICT)
  - Phase 19 (Articoli a slots) completa — ART-01..04 cerrados
affects: [20-partitivi-a-slots, complete-milestone-v1.5]

tech-stack:
  added: []
  patterns:
    - "Sync de count contra data.exercises.length REAL del JSON (nunca estimación) en los 3 hardcodes + TOTAL_EXPECTED"
    - "Comentario del historial del total narra cada conversión que mueve el total (precedente piloto Preposiciones)"

key-files:
  created:
    - .planning/phases/19-articoli-a-slots-contenido/19-03-SUMMARY.md
  modified:
    - tests/exercise-types.test.js
    - tests/fixtures/slot-variants-integration.test.js
    - scripts/run-validation-271.mjs
    - content/exercises/articoli.json

key-decisions:
  - "Conteo real de slots leído del JSON = 34 (NO la estimación ~25 del plan): 32 slots de 19-01 + 2 slots nuevos y/i+vocal de 19-02"
  - "TOTAL_EXPECTED = 348 (= 370 − 56 + 34); los 3 hardcodes coinciden en 34"
  - "D-19-09: validation.status top-level añadida a los 2 slots nuevos de 19-02 (Rule 2) — el gate VAL_07 lee status top-level; 19-02 solo dejó validation por variante. Los passes top-level reflejan el quórum cross-vendor R1-R7 compartido (gemini-2.5-flash + deepseek-chat + claude-opus-4-7 + claude-sonnet-4-6, 4× correcta, 2026-06-04), espejando el shape de los 32 slots de 19-01"

patterns-established:
  - "Cada slot debe portar validation.status top-level === validated (no solo por variante) para pasar el gate VAL_07_STRICT"

requirements-completed: [ART-04]

duration: 12min
completed: 2026-06-04
---

# Phase 19 Plan 03: Sincronización de counts de Articoli (ART-04) Summary

**Los 3 hardcodes de count de Articoli + TOTAL_EXPECTED sincronizados al conteo real de 34 slots (370→348), cerrando el gate final de la conversión a slots; smoke shape-agnostic y reporter verdes con cobertura de explanations por slot preservada.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-04T10:43:00Z
- **Completed:** 2026-06-04T10:55:09Z
- **Tasks:** 2
- **Files modified:** 4 (3 en scope del plan + articoli.json por Rule 2)

## Accomplishments
- Conteo REAL leído del JSON: `data.exercises.length === 34` (NO la estimación ~25 del plan) — fusión 56→32 (19-01) + 2 slots nuevos y/i+vocal (19-02).
- Los 3 hardcodes (`exercise-types.test.js:1273`, `slot-variants-integration.test.js:174`, `run-validation-271.mjs:81`) sincronizados a 34, coincidentes entre sí.
- `TOTAL_EXPECTED` recalculado 370 → 348 (= 370 − 56 + 34); comentario del historial actualizado con la conversión de Articoli.
- Suite completa verde: `node --test tests/*.test.js` 358/358; `VAL_07_STRICT=1` 367/367; reporter `run-validation-271.mjs` VAL-06 PASS (348/348), VAL-08/VAL-04 PASS.
- Lógica del smoke (bifurcación `Array.isArray(ex.variants)`), validator y loader NO tocados — solo counts.

## Task Commits

Each task was committed atomically:

1. **Task 1: Sincronizar count en exercise-types.test.js (+ Rule 2 validation slots)** - `a146a74` (test)
2. **Task 2: Sincronizar slot-variants-integration + run-validation-271 (TOTAL_EXPECTED)** - `7927135` (test)

## Files Created/Modified
- `tests/exercise-types.test.js` - CATEGORIES_WITH_EXPLANATIONS: articoli `expected` 56→34. Lógica/accessors intactos.
- `content/exercises/articoli.json` - Añadida `validation.status: validated` + `passes[]` top-level a `articoli-lo-yi` y `articoli-gli-yi` (Rule 2). Count sigue 34 (sin nuevos slots).
- `tests/fixtures/slot-variants-integration.test.js` - REAL_CATEGORIES: articoli `expected` 56→34.
- `scripts/run-validation-271.mjs` - CATEGORIES articoli 56→34; TOTAL_EXPECTED 370→348; comentario del historial del total narra la conversión de Articoli.

## Decisions Made
- **Conteo = 34 leído del JSON, no estimación.** El plan estimaba ~25; el real es 34 (32 de 19-01 + 2 de 19-02). Se usó `data.exercises.length` en los 3 sitios.
- **D-19-09 (Rule 2):** validation.status top-level en los 2 slots nuevos de 19-02. Rationale abajo en Deviations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] validation.status top-level ausente en los 2 slots nuevos de 19-02**
- **Found during:** Task 1 (al correr `VAL_07_STRICT=1`)
- **Issue:** El gate VAL_07_STRICT lee `ex.validation?.status === 'validated'` a nivel de slot (top-level). Los 2 slots nuevos creados en 19-02 (`articoli-lo-yi`, `articoli-gli-yi`) solo tenían validation por VARIANTE (cada `variants[].validation.status === 'validated'`), sin bloque `validation` a nivel de slot. Resultado: con el count sincronizado a 34, la gate veía `status: absent` en esos 2 → fallo `2 !== 0`. Los otros 32 slots de 19-01 sí portan el bloque top-level. Sin este fix el gate final de la fase no podía cerrarse.
- **Fix:** Añadido el bloque `validation` top-level (`status: validated` + `passes[]`) a los 2 slots, espejando el shape de los 32 slots de 19-01. Los `passes[]` reflejan el quórum cross-vendor R1-R7 compartido por sus variantes (gemini-2.5-flash + deepseek-chat + claude-opus-4-7 + claude-sonnet-4-6, los 4 `correcta`, fecha 2026-06-04) — NO se inventó validación: se elevó la validación ya existente y aprobada por el quórum del nivel variante al nivel slot, que es donde la gate la lee.
- **Files modified:** content/exercises/articoli.json
- **Verification:** `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` 137/137; suite completa `VAL_07_STRICT=1 node --test tests/*.test.js` 367/367; `node -e "...exercises.every(e=>e.validation?.status==='validated')"` → true; count sigue 34; `validate-content-fixture articoli` exit 0.
- **Committed in:** a146a74 (parte del commit de Task 1)

---

**Total deviations:** 1 auto-fixed (1 missing critical — Rule 2)
**Impact on plan:** El fix es necesario para cerrar el gate final de la fase (VAL_07_STRICT). No es scope creep: la validación ya existía y estaba aprobada por el quórum a nivel variante; solo se elevó al nivel slot donde la gate la consulta, alineando los 2 slots de 19-02 con el shape de los 32 slots de 19-01. Sin contenido editorial nuevo (count intacto en 34).

## Issues Encountered
- El plan estimaba el count final de Articoli en ~25 slots; el conteo real del JSON es 34. Se siguió el critical_rule del prompt (leer programáticamente, nunca asumir) → 34 usado en los 3 sitios.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 19 (Articoli a slots) COMPLETA: ART-01 (reagrupación) + ART-02 (variantes nuevas por quórum) + ART-03 (indeterminativi como slots) + ART-04 (sync de counts) cerrados. 6/9 requisitos v1.5.
- Articoli.json estabilizado en 34 slots, todos con `validation.status: validated` top-level; suite/reporter/smoke verdes.
- Listo para Phase 20 (Partitivi a slots), independiente de Articoli tras la migración Phase 18. Mismo patrón replicable (reagrupar → quórum → sync de counts).

## Self-Check: PASSED

- FOUND: .planning/phases/19-articoli-a-slots-contenido/19-03-SUMMARY.md
- FOUND commit a146a74 (Task 1)
- FOUND commit 7927135 (Task 2)
- articoli.json count = 34; all slots validation.status === validated
- Full suite 358/358; VAL_07_STRICT 367/367; reporter VAL-06 PASS (348/348)

---
*Phase: 19-articoli-a-slots-contenido*
*Completed: 2026-06-04*
