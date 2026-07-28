---
phase: 39-prov-01-integraci-n-lockstep-cierre-v1-9
plan: 02
subsystem: testing
tags: [count-sync, lockstep, reporter, val-07-strict, zero-deps, dynamic-count]

# Dependency graph
requires:
  - phase: 39-01
    provides: "origen enum + 4 cats nuevas (dimostrativi/possessivi/modali/riflessivi) stamped + presente-regolare wiring"
provides:
  - "Los 3 arrays de conteo hardcoded incluyen las 4 cats nuevas con expected DINÁMICO (slotCountOf/.exercises.length)"
  - "baseline-guard reframeado a suma dinámica (Σ slotCountOf disco vs Σ expected literales) — magic 183 eliminado del código ejecutable"
  - "genero-numero 12→13 y preposiciones 49→50 sincronizados vs disco en todos los arrays afectados"
  - "Suite completa (624) + VAL_07_STRICT=1 (638) + run-validation-271.mjs todos verdes sobre las 14 categorías"
  - "D-54 invariante confirmado (2 call-sites); motor byte-intacto (git diff vacío)"
affects: [cierre-v1.9, futuras altas de contenido, count-sync]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Baseline-guard dinámico: Σ slotCountOf(c.file) vs Σ expected — inmune a futuros adds, sin número mágico (D-31-06 extendido)"
    - "Lockstep de los N arrays de conteo en un solo pase atómico para evitar reds intermedios (RESEARCH Pitfall 2)"

key-files:
  created:
    - .planning/phases/39-prov-01-integraci-n-lockstep-cierre-v1-9/39-02-SUMMARY.md
  modified:
    - tests/exercise-types.test.js
    - scripts/run-validation-271.mjs
    - tests/fixtures/slot-variants-integration.test.js

key-decisions:
  - "baseline-guard reframeado a suma dinámica en vez de mantener el literal 183 + offset (RESEARCH Pitfall 1 opción b): baseline = Σ slotCountOf sobre TODAS las cats vs TOTAL_EXPECTED = Σ .expected"
  - "Procedencia contable auditada (183 en comentarios v1.6/v1.7) preservada como historial; el 183 solo se eliminó del código ejecutable (fórmula + mensaje de error)"
  - "preposiciones 49→50 corregido también en slot-variants-integration.test.js REAL_CATEGORIES (skew preexistente, no listado en el touchpoint pero requerido por SC-5 suite-verde)"

patterns-established:
  - "Guard de coherencia de conteo derivado 100% del disco: TOTAL_EXPECTED (literales) confrontado con Σ slotCountOf (disco); cualquier desincronización literal-vs-disco throwea"

requirements-completed: [INT-02, INT-03, INT-04]

# Metrics
duration: 8min
completed: 2026-07-01
---

# Phase 39 Plan 02: Count lockstep + close gate Summary

**Los 3 arrays hardcoded de conteo re-sincronizados en lockstep con las 4 cats nuevas (expected dinámico), baseline-guard reframeado sin magic 183, y las 14 categorías verdes en suite + VAL_07_STRICT + reporter con el motor byte-intacto.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-07-01T20:08:31Z
- **Completed:** 2026-07-01T20:15:49Z
- **Tasks:** 2 (Task 1 edita 3 archivos; Task 2 verify-only)
- **Files modified:** 3

## Accomplishments
- INT-02: `CATEGORIES_WITH_EXPLANATIONS` (exercise-types), `CATEGORIES` (run-validation-271), `REAL_CATEGORIES` (slot-variants) incluyen dimostrativi/possessivi/modali/riflessivi con `expected` DINÁMICO (`slotCountOf` / `.exercises.length`) — cero números mágicos para las nuevas.
- genero-numero 12→13 corregido en los 3 arrays (red preexistente de la suite); preposiciones 49→50 corregido en run-validation y en slot-variants (skew reporter/test).
- baseline-guard reframeado: baseline = Σ `slotCountOf(c.file)` sobre TODAS las categorías, confrontado con `TOTAL_EXPECTED` (Σ literales). El magic 183 desapareció del código EJECUTABLE (fórmula + mensaje); la procedencia contable auditada (v1.6/v1.7) se conserva en comentarios `//` (6 menciones).
- INT-03 (verify-only): `applyImmediateFailure(this.state` sigue en EXACTAMENTE 2 call-sites (app.js:1642, :1969); `git diff src/screens/app.js src/domain/progress.js` VACÍO — motor intacto.
- INT-04 (confirm-only): las 4 cats nuevas + los 3 magnets siguen `validated` — `VAL_07_STRICT=1` verde (638 tests) reutilizando el array ya sincronizado.
- SC-5 close gate: los 5 sub-gates imprimen "ALL 5 GATES PASS".

## Task Commits

1. **Task 1: Lockstep de los 3 arrays (+4 dinámicas, genero-numero 12→13, preposiciones 49→50, baseline reframe)** — `0dfdc7b` (test)
2. **Task 2: Gate de cierre (INT-03 motor intacto + INT-04 quórum + SC-5 suite verde)** — verify-only, sin commit (no modifica archivos)

**Plan metadata:** (final docs commit)

## Files Created/Modified
- `tests/exercise-types.test.js` — `CATEGORIES_WITH_EXPLANATIONS` +4 dinámicas + genero-numero 13 (reutilizado por coverage loop y VAL_07_STRICT gate, D-VAL-18)
- `scripts/run-validation-271.mjs` — `CATEGORIES` +4 dinámicas + genero-numero 13 + preposiciones 50; baseline-guard reframeado (magic 183 fuera del código ejecutable, procedencia preservada); `TOTAL_EXPECTED` se re-suma solo
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES` +4 dinámicas + genero-numero 13 + preposiciones 50

## Decisions Made
- **Baseline dinámico (RESEARCH Pitfall 1 opción b):** en vez de rebasar el literal 183, el guard suma `slotCountOf` sobre todas las cats. Esto lo hace inmune a futuros adds y honesto respecto a genero-numero=13 y las 4 nuevas.
- **Procedencia > grep:** los 3 comentarios de historial contable (140/150/160) NO se tocaron; añadí un bloque de procedencia en el guard reframeado documentando la cadena 183→195→(disco) sin re-introducir 183 en código ejecutable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] preposiciones 49→50 stale en slot-variants-integration.test.js**
- **Found during:** Task 1 (verify tras el lockstep)
- **Issue:** `REAL_CATEGORIES` tenía `{ slug: 'preposiciones', expected: 49 }` pero el disco es 50 (alta `preposiciones-col` de v1.6). El test guard `preposiciones: el conteo de ejercicios no cambia` falló (50 !== 49). El touchpoint 3 solo mencionaba genero-numero, pero SC-5 exige la suite entera verde.
- **Fix:** `expected: 49 → 50` en `REAL_CATEGORIES` (mismo array que ya editaba para el lockstep).
- **Files modified:** tests/fixtures/slot-variants-integration.test.js
- **Verification:** `node --test tests/exercise-types.test.js tests/fixtures/slot-variants-integration.test.js` exit 0; suite completa 624/624.
- **Committed in:** `0dfdc7b` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — count skew preexistente)
**Impact on plan:** Necesario para SC-5 (suite verde). Mismo tipo de skew que el genero-numero que el plan sí flag; disk es la fuente de verdad. Sin scope creep.

## Issues Encountered
- Al reframear el guard, mi primera edición redujo las menciones de 183 en comentarios de 5 a 3 (reescribí los comentarios de TOTAL_EXPECTED/guard que describían la vieja fórmula). Resuelto añadiendo un bloque de PROCEDENCIA que registra el historial 183→195→disco correctamente (sin re-introducir 183 en código ejecutable): comentarios 183 = 6, ejecutable 183 = 0.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cierre honesto del milestone v1.9: 14 categorías, todos los gates verdes, motor sin tocar.
- Listo para verificación de fase (SC-5) y cierre de milestone.

## Self-Check: PASSED

- FOUND: `.planning/phases/39-prov-01-integraci-n-lockstep-cierre-v1-9/39-02-SUMMARY.md`
- FOUND: commit `0dfdc7b` (Task 1)

---
*Phase: 39-prov-01-integraci-n-lockstep-cierre-v1-9*
*Completed: 2026-07-01*
