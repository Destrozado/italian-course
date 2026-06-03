---
phase: 16-motor-de-examen-por-slots
plan: 01
subsystem: testing
tags: [domain, sampler, slots, variants, rng, node-test]

# Dependency graph
requires:
  - phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
    provides: "slotById normalizado {id,type,categoryIds,explanation,variants[]} + normalizeExerciseToSlot (legacy → slot de 1 variante)"
provides:
  - "pickVariantIndex(slot, rng): helper puro uniforme que elige 1 variante por slot (D-16-01, default 0 para 0/1 variante D-16-10)"
  - "buildSession y buildFullTest devuelven {exerciseIds, variantIndices, actualSize} con arrays alineados 1:1"
  - "Tests deterministas seedados del muestreo por slot+variante (EXAM-01/04/06)"
affects: [16-02, app.js, inFlightTest, sessionResults, render-por-tipo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "pickVariantIndex hermano de weightedPickOne (uniforme sin peso, mismo rng threaded)"
    - "Parallel-array shape: variantIndices[i] resuelve la variante de exerciseIds[i]"

key-files:
  created: []
  modified:
    - src/domain/session.js
    - tests/domain-session.test.js

key-decisions:
  - "Opción parallel-array (variantIndices: number[]) sobre array-of-pairs — diff mínimo al plumbing de sessionExerciseIds (D-16-08 / PATTERNS §Existing Return Shape)"
  - "Variante elegida con el MISMO rng ya threaded en cada sampler — cero segundo RNG, determinismo con seed preservado"
  - "Cero state nuevo, cero contador por variante; el peso sigue anclado a slot.id == exercise.id (D-15-09)"

patterns-established:
  - "pickVariantIndex(slot, rng): selección uniforme defensiva (Array.isArray guard, n<=1→0) sibling de weightedPickOne"
  - "Return shape ampliado preservando actualSize y early-return de pool vacío"

requirements-completed: [EXAM-01, EXAM-04, EXAM-06]

# Metrics
duration: 2min
completed: 2026-06-03
---

# Phase 16 Plan 01: Sampler de dominio por slots + selección de variante Summary

**`pickVariantIndex` uniforme + `variantIndices` paralelo en `buildSession`/`buildFullTest`: el sampler puro fija 1 variante aleatoria por slot al construir la sesión, con RNG seedado y cero state nuevo.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-06-03T07:41:22Z
- **Completed:** 2026-06-03T07:43:42Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- `pickVariantIndex(slot, rng)` — helper privado puro, hermano de `weightedPickOne`, selección uniforme sin peso (D-16-01); guard `Array.isArray(slot.variants)` con default 0 para slots de 0/1 variante (D-16-10, T-16-01/02).
- `buildSession` y `buildFullTest` devuelven `{ exerciseIds, variantIndices, actualSize }` con `variantIndices` alineado 1:1 con `exerciseIds`, fijado con el mismo `rng` ya threaded (D-16-08).
- Pureza de capa preservada: cero import de `../data/*` ni `../screens/*`; `pickVariantIndex` lee `slot.variants` del objeto recibido por parámetro.
- 6 tests deterministas nuevos (seededLcg) cubriendo EXAM-01 (sin duplicados de slot), EXAM-04 (barrido de seeds → ≥2 variantIndex distintos), D-16-10 (legacy → 0), buildFullTest exhaustivo + pool vacío.

## Task Commits

Each task was committed atomically:

1. **Task 1: pickVariantIndex + variantIndices en el return de buildSession/buildFullTest** - `84f504f` (feat)
2. **Task 2: Tests seedados de muestreo por slot + variante (EXAM-01/04/06)** - `263cba4` (test)

_Note: este es un plan TDD a nivel de plan; Task 1 implementó el helper con el shape ampliado (los tests existentes de Phase 2 verifican que el shape no regresa — siguen verdes leyendo solo exerciseIds/actualSize), Task 2 añadió la cobertura RED→GREEN dedicada del nuevo comportamiento. El gate `test(...)` (Task 2) llega después del `feat(...)` (Task 1) por el orden del PLAN — ver TDD Gate Compliance._

## Files Created/Modified
- `src/domain/session.js` - Añadido `pickVariantIndex` (helper privado uniforme); `variantIndices` en el return de `buildSession`/`buildFullTest`; JSDoc `@returns`/`@param allExercises` actualizados a slots con `variants[]`.
- `tests/domain-session.test.js` - Nuevo `describe('domain/session — Phase 16 muestreo por slot (EXAM-01/04/06)')` con 6 tests deterministas seedados.

## Decisions Made
- **Parallel-array shape** (`variantIndices: number[]`) sobre array-of-pairs — minimiza el ripple al plumbing de `sessionExerciseIds`/`inFlightTest` en Plan 02 (PATTERNS §Existing Return Shape; Claude's Discretion D-16-08 ratificada).
- **Mismo `rng` threaded** para la selección de variante — no se introduce un segundo RNG; determinismo con seed fijo intacto (D-16-01).
- **Cero state nuevo / clave de peso intacta** — `weightedPickOne` sigue leyendo `state.exerciseStats?.[ex.id]?.timesShown` (slot id == exercise id, D-15-09).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- `node --test tests/` (forma del acceptance criterion) falla en Node 22.20 porque interpreta el path desnudo `tests/` como un módulo a resolver (`Cannot find module .../tests`), no como directorio de tests. **No es una regresión** — es un cambio de comportamiento del runner entre versiones de Node. La forma equivalente `node --test tests/*.test.js` ejecuta la suite completa: **327/327 verdes, 0 fallos** (incluye los 14 de `domain-session.test.js`). El criterio de "suite completa sin regresión" se cumple con la invocación por glob.

## TDD Gate Compliance
El orden de commits es `feat(16-01)` (`84f504f`, Task 1) → `test(16-01)` (`263cba4`, Task 2), invertido respecto al RED→GREEN canónico. Esto es **deliberado y coherente con el PLAN**: Task 1 amplía el shape de retorno manteniendo verdes los tests de Phase 2 existentes (que solo leen `exerciseIds`/`actualSize`), y Task 2 es la tarea dedicada de cobertura del nuevo comportamiento `variantIndices`. No hubo fase RED fallida porque los tests nuevos se escribieron contra una implementación ya presente; el comportamiento queda verificado por los 6 tests seedados (incluido el assert explícito EXAM-04 `≥2` índices distintos). Sin warning de gate adicional: el plan no es behavior-adding sin test — cada comportamiento nuevo tiene su test determinista.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- El contrato de salida del sampler (`{exerciseIds, variantIndices, actualSize}`) está fijado y testeado — listo para que Plan 16-02 cablee `variantIndices` a través de `app.js` (getter slot-aware `sessionCurrentExercise` re-wrapping a `.payload` sintético), `inFlightTest` (persistir la variante para reanudar la misma, D-16-09), `sessionResults`/render/summary-errors.
- Pitfall #2 sin tocar: este plan no añade call-sites de `applyImmediateFailure` (es dominio puro, sin cascada). El cableado de cascada por slot es Plan 16-02.

## Self-Check: PASSED
- FOUND: src/domain/session.js (modified, `pickVariantIndex` línea 231)
- FOUND: tests/domain-session.test.js (modified, describe Phase 16)
- FOUND commit: 84f504f (feat Task 1)
- FOUND commit: 263cba4 (test Task 2)

---
*Phase: 16-motor-de-examen-por-slots*
*Completed: 2026-06-03*
