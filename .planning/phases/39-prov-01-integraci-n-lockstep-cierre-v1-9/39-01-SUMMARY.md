---
phase: 39-prov-01-integraci-n-lockstep-cierre-v1-9
plan: 01
subsystem: database
tags: [schema-validator, json-content, enum, provenance, tdd, zero-deps]

# Dependency graph
requires:
  - phase: 38-verbi-riflessivi
    provides: "las 4 cats nuevas (dimostrativi/possessivi/modali/riflessivi) ya registradas en categories.json order 11-14"
provides:
  - "Campo OPCIONAL `origen` (enum ia-quorum|apuntes-profesora) validado a nivel categoría en schema-validator.js"
  - "Las 4 cats nuevas estampadas con origen:\"ia-quorum\"; las 10 legacy quedan ausentes (procedencia mixta = honesta)"
  - "Test unitario dedicado del enum origen (tests/schema-validator-origen.test.js)"
affects: [milestone-v1.9-cierre, provenance-tracking, futuras-cats]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Enum opcional a nivel categoría clonando el idiom de validateValidationShape (guard !== undefined + .includes() + mensaje ES)"

key-files:
  created:
    - tests/schema-validator-origen.test.js
  modified:
    - src/data/schema-validator.js
    - content/categories.json

key-decisions:
  - "Campo se llama `origen` (NO `source`): ARCHITECTURE.md decía source pero está superseded por REQUIREMENTS/ROADMAP → origen"
  - "origen es OPCIONAL: ausencia = aceptada (retrocompat con las 10 cats legacy sin provenance)"
  - "Legacy queda AUSENTE (no null, no \"\"): procedencia mixta → ausente es la elección honesta (REQUIREMENTS line 88)"
  - "VALID_ORIGEN declarado dentro del guard (local al bloque), no como constante de módulo — clon exacto del idiom VALID_STATUS"

patterns-established:
  - "Enum opcional de categoría: `if (cat.campo !== undefined) { if (!VALID.includes(...)) push(...) }` con mensaje ES esperado: a|b"

requirements-completed: [PROV-01, PROV-02, INT-01]

# Metrics
duration: ~8min
completed: 2026-07-01
---

# Phase 39 Plan 01: PROV-01 + integración lockstep (cierre v1.9) Summary

**Campo opcional `origen` (enum ia-quorum|apuntes-profesora) validado a nivel categoría vía TDD, con las 4 cats nuevas estampadas y las 10 legacy honestamente ausentes.**

## Performance

- **Duration:** ~8 min
- **Completed:** 2026-07-01
- **Tasks:** 2
- **Files modified:** 3 (1 creado, 2 modificados)

## Accomplishments
- PROV-01: schema-validator.js valida el enum `origen` OPCIONAL a nivel categoría — acepta `ia-quorum` / `apuntes-profesora`, acepta la ausencia (retrocompat), rechaza typos con mensaje en español.
- PROV-02: exactamente las 4 cats nuevas (dimostrativi/possessivi/modali/riflessivi) llevan `origen:"ia-quorum"`; las 10 legacy quedan sin la clave (ausente, no null).
- INT-01 (verify-only): confirmado que las 4 entradas order 11-14 ya existen, JSON parsea, 14 orders únicos, no rompe el display del home.
- Test unitario dedicado con los 5 casos del contrato (2 acepta enum + 1 ausencia + 2 rechaza typo).

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): test enum origen** - `078e82a` (test)
2. **Task 1 (GREEN): validar enum origen opcional** - `a0312ab` (feat)
3. **Task 2: estampar origen en 4 cats + verificar INT-01** - `d1f1373` (feat)

_Task 1 es TDD: RED (test falla) → GREEN (impl pasa). No fue necesario REFACTOR (el idiom clonado ya es mínimo y canónico)._

## Files Created/Modified
- `tests/schema-validator-origen.test.js` - Test unitario del enum origen (5 casos: acepta ia-quorum/apuntes-profesora/ausencia, rechaza 2 typos; asserta mensaje ES).
- `src/data/schema-validator.js` - Check de enum opcional `origen` dentro del loop `for (const cat of categories)`, tras el check de `name` y antes de `knownCategoryIds.add`. Clon del idiom de validateValidationShape.
- `content/categories.json` - `origen:"ia-quorum"` añadido a las 4 cats order 11-14; las 10 legacy intactas.

## Decisions Made
- Nombre del campo `origen` (no `source`): ARCHITECTURE.md está superseded por REQUIREMENTS/ROADMAP (RESEARCH §Anti-Patterns).
- Campo opcional, ausencia = aceptada por construcción (guard `!== undefined`).
- Legacy queda ausente en vez de null/"" (procedencia mixta = honesta; REQUIREMENTS line 88).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. La suite completa arroja 603 pass / 1 fail, pero el único fallo (`not ok 58 - Categorías con explanation coverage (Phase 7.1+)`, genero-numero) es preexistente y ajeno a este cambio (documentado en STATE.md Quick Tasks y múltiples SUMMARIES previos). No lo toqué (out-of-scope, SCOPE BOUNDARY). Los tests dirigidos de este plan y el script de verificación de Task 2 pasan en verde.

## Zero-deps
Intacto: `git diff` no toca package.json/lock. Motor (engine) sin cambios. Sin nuevos packages.

## Next Phase Readiness
- v1.9 provenance cerrado a nivel schema + contenido. Listo para Plan 02 del phase 39.
- El enum `origen` está disponible para estampar futuras cats según su procedencia.

## Self-Check: PASSED

- FOUND: tests/schema-validator-origen.test.js
- FOUND: src/data/schema-validator.js (VALID_ORIGEN presente x2)
- FOUND: content/categories.json (4 estampadas, 10 ausentes, 14 orders únicos)
- FOUND commit 078e82a (test RED)
- FOUND commit a0312ab (feat GREEN)
- FOUND commit d1f1373 (feat Task 2)

---
*Phase: 39-prov-01-integraci-n-lockstep-cierre-v1-9*
*Completed: 2026-07-01*
