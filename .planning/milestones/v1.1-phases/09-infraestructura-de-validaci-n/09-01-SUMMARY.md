---
phase: 09-infraestructura-de-validaci-n
plan: 01
subsystem: testing
tags: [validation, schema, node-test, hand-written-validator, pure-helper, sticky-disputed, env-var-feature-flag, italian-course]

# Dependency graph
requires:
  - phase: 07.2
    provides: CATEGORIES_WITH_EXPLANATIONS array (patrón D-144) — reutilizado por el bloque paramétrico VAL-07
  - phase: 01
    provides: schema-validator hand-written D-08 + dispatch table PAYLOAD_VALIDATORS
provides:
  - validateValidationShape — validador top-level del campo opcional `validation` (back-compat con los 271 actuales)
  - deriveStatus(passes) — pure helper para D-VAL-07 sticky disputed (importable desde Node y browser)
  - Suite de tests "data/schema-validator — validation field (Phase 9 D-VAL-08)" — 13 tests cubriendo back-compat + whitelist + shape
  - Suite de tests "validation-state — deriveStatus (Phase 9 D-VAL-07)" — 11 tests cubriendo defensive + quórum + sticky
  - Bloque paramétrico "VAL-07 — todos los ejercicios validated (Phase 10 close gate)" — SKIP por defecto, activable con `VAL_07_STRICT=1`
affects: [09-02, 09-03, 10-*]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Top-level field validator (D-VAL-08): if (!('campo' in ex)) return — back-compat trivial sin schemaVersion migration"
    - "Pure helper module estilo D-08: cabecera 'Pure — sin DOM, sin localStorage, sin fetch' + JSDoc completo + defensive null reads"
    - "Feature flag via env var (D-VAL-17): const FLAG = process.env.NAME === '1' + describe con {skip: condition} option — idiomático node:test 2026"

key-files:
  created:
    - src/data/validation-state.js
  modified:
    - src/data/schema-validator.js
    - tests/exercise-types.test.js

key-decisions:
  - "validateValidationShape NO entra al PAYLOAD_VALIDATORS dispatch — es metadata top-level del ejercicio, no payload (D-VAL-05). Se invoca directamente en el loop tras validator(ex, file, push)."
  - "Back-compat trivial con `if (!('validation' in ex)) return` como primera línea — los 271 ejercicios actuales pasan sin tocar el JSON, cero migración schemaVersion (D-VAL-08 / D-176)."
  - "Whitelist enforced via Array.includes (status: pending|validated|disputed; verdict: correcta|incorrecta) + ISO_DATE regex /^\\d{4}-\\d{2}-\\d{2}$/ — coherente con CONT-06/FOUND-04 estilo (D-VAL-06)."
  - "deriveStatus es pure module 0-deps importable desde Node Y browser — re-utilizable por el smoke test, el SKILL.md (Plan 09-02) y el script piloto (Plan 09-03) sin duplicar la lógica."
  - "VAL-07 implementado como env var `VAL_07_STRICT=1` + `{skip: condition}` option (no `t.skip()` runtime) — pattern idiomático node:test 2026 con DX más declarativo (D-VAL-17)."

patterns-established:
  - "Top-level field validator hand-written D-08: misma forma que validateMatchPayload (early-return en forEach + acumulador push) — extensible para futuros campos top-level opcionales."
  - "Pure helper en src/data/: cabecera explícita de pureza + JSDoc + defensive null reads — patrón replicable para futuros helpers de dominio (D-08 invariante)."
  - "Smoke test paramétrico con feature flag OFF por defecto (D-VAL-17): bloquea el ship hasta que la población alcance el invariante, sin romper el baseline durante desarrollo."

requirements-completed: [VAL-01, VAL-05, VAL-07]

# Metrics
duration: 4min
completed: 2026-05-26
---

# Phase 9 Plan 01: Infraestructura de validación schema + deriveStatus + smoke gate VAL-07 Summary

**Schema validator extendido con validateValidationShape (back-compat 271 ejercicios) + pure helper deriveStatus (sticky disputed D-VAL-07) + smoke gate paramétrico VAL_07_STRICT (off durante Phase 9, on al cierre de Phase 10).**

## Performance

- **Duration:** 4 min (248s)
- **Started:** 2026-05-25T23:33:10Z
- **Completed:** 2026-05-25T23:37:18Z
- **Tasks:** 3 (todos TDD)
- **Files modified:** 3 (2 modify + 1 create)
- **Tests:** 230 → 254 verdes (+24 nuevos: 13 schema + 11 deriveStatus)

## Accomplishments

- `validateValidationShape` añadido a `src/data/schema-validator.js` con back-compat trivial (campo ausente = aceptado) y enforce estricto cuando presente: status whitelist `pending|validated|disputed`, passes[] array de objetos `{by, date, verdict, concerns?}`, ISO date format, mensajes en español (FOUND-04). Los 7 archivos `content/exercises/*.json` (271 ejercicios) validan limpio sin tocar el JSON.
- `src/data/validation-state.js` creado como pure helper de 42 líneas exportando `deriveStatus(passes)` que aplica D-VAL-07 estricto: cualquier `incorrecta` → `disputed` sticky (no se limpia con correctas posteriores), ≥2 correctas con `by` distintos (Set size ≥2) AND cero incorrectas → `validated`, resto → `pending`. Defensive null reads (`p?.verdict`, `p?.by`) contra JSON parcial.
- Bloque paramétrico `VAL-07 — todos los ejercicios validated (Phase 10 close gate)` añadido al final de `tests/exercise-types.test.js`. SKIP por defecto con mensaje `feature flag VAL_07_STRICT=1 no activado (esperado durante Phase 9)`. Activable con `VAL_07_STRICT=1` — verificado: produce 7 fails (1 por categoría) cuando los 271 no tienen `validation` aún. Reutiliza `CATEGORIES_WITH_EXPLANATIONS` array existente (D-VAL-18).

## Task Commits

Cada tarea fue commiteada atomicamente con ciclo TDD RED → GREEN:

1. **Task 1 RED: failing tests for validateValidationShape** — `64d3dae` (test)
2. **Task 1 GREEN: validateValidationShape implementation** — `338667c` (feat)
3. **Task 2 RED: failing tests for deriveStatus** — `8917ffb` (test)
4. **Task 2 GREEN: deriveStatus pure helper** — `7ee1b33` (feat)
5. **Task 3: VAL-07 parametric smoke gate** — `259a341` (test)

_Tarea 3 sin RED separado porque es un bloque paramétrico nuevo cuyo comportamiento SKIP-por-defecto se verifica directamente en el commit GREEN (la oposición ON con env var también se verifica en el mismo paso)._

**Plan metadata:** (pendiente — commit final con SUMMARY + STATE + ROADMAP)

## Files Created/Modified

- `src/data/validation-state.js` (CREATE, 42 líneas) — Pure helper `deriveStatus(passes)` para D-VAL-07 sticky disputed. Cabecera D-08, JSDoc completo, defensive null reads. Importable desde Node y browser sin side-effects.
- `src/data/schema-validator.js` (MODIFY, +77 líneas) — Añadida función `validateValidationShape(ex, file, push)` tras los 3 PAYLOAD_VALIDATORS. NO entra al dispatch table (no es payload). Invocada en el loop `validateContent()` tras `validator(ex, file, push)`. Whitelists `VALID_STATUS`/`VALID_VERDICT` + `ISO_DATE` regex.
- `tests/exercise-types.test.js` (MODIFY, +341 líneas) — 3 bloques nuevos: `data/schema-validator — validation field (Phase 9 D-VAL-08)` (13 tests), `validation-state — deriveStatus (Phase 9 D-VAL-07)` (11 tests), `VAL-07 — todos los ejercicios validated (Phase 10 close gate)` (7 tests SKIP por defecto). Import nuevo de `deriveStatus`.

## Decisions Made

- **Test count:** 13 tests para validateValidationShape (excede los 11 minimum del plan) — los 2 extra cubren `passes[0]` no-objeto (defensive) y `concerns` con array de strings happy-path (asegura que el caso opcional positivo está cubierto, no solo los negativos).
- **Test count:** 11 tests para deriveStatus (excede los 10 minimum del plan) — el extra cubre "3 correctas con by distintos → validated" para demostrar que ≥2 es suficiente y que un 3er pase no fuerza otra cosa, refuerzo del invariante del quórum.
- **Patrón `validatePayload(ex)` helper inline en el suite de schema** — reduce boilerplate y hace cada test legible (1 llamada en lugar de 4 líneas de setup repetido). Patrón análogo al `validPayloadByType` de la suite Phase 7 D-116.

## Deviations from Plan

None — plan executed exactly as written. Cero auto-fixes Rule 1/2/3, cero Rule 4 architectural. El plan estaba muy preciso (literales copy-paste-ready desde RESEARCH.md §Example 1/2/4) y los 2 tests extra son refinements menores dentro del scope.

## Issues Encountered

- **Test baseline reportaba 230/230** (no 209/209 como decía STATE.md). Esto es porque tras la sesión previa de plan-phase + commits intermedios el baseline ya había crecido (probablemente smoke tests añadidos durante Phase 7.2 / Phase 8). NO afecta correctness — el invariante del plan es "los baseline tests + los nuevos pasan", verificado: 254/254 verdes con los 24 nuevos. STATE.md se actualiza con el nuevo baseline al cierre del plan.

## User Setup Required

None — Phase 9 Plan 01 no requiere configuración externa. El env var `VAL_07_STRICT=1` es informational (Phase 10 close), no necesario durante Phase 9.

## Cómo activar el smoke test estricto al cierre de Phase 10

```bash
VAL_07_STRICT=1 node --test tests/*.test.js
```

Sin la env var: 254/254 verdes (el bloque VAL-07 está SKIP).
Con la env var: 7 tests FAIL hoy (1 por categoría) porque los 271 ejercicios no tienen `validation` aún. Phase 10 los va a llevar a `validated` 1-por-1 con quórum Opus+Sonnet; cuando los 271 estén `validated`, este test pasará y será el gate de cierre del milestone v1.1.

## Next Phase Readiness

- **Plan 09-02 ready to start:** `validateValidationShape` y `deriveStatus` están en place — el SKILL.md de 09-02 puede importar `deriveStatus` directamente (cero duplicación), y el `run-validation-pilot.mjs` de 09-03 también.
- **Wave 1 unblocking 09-02:** este plan completa Wave 1 lado A (09-01 schema/state). Lado B (09-02 VALIDATION-PROMPT + SKILL.md + fixture E3) puede correr en paralelo SIN dependencia inversa — los files_modified no solapan.
- **Plan 09-03 (Wave 2) blocked:** depende de ambos 09-01 + 09-02 + el snapshot relax stripAdditive en 09-02 (no en este plan). 09-03 corre serial tras Wave 1.
- **Cero blockers** introducidos por este plan.

## Self-Check: PASSED

Files exist: `src/data/validation-state.js`, `src/data/schema-validator.js`, `tests/exercise-types.test.js`, `.planning/phases/09-infraestructura-de-validaci-n/09-01-SUMMARY.md` — all FOUND.
Commit hashes exist in git log: `64d3dae`, `338667c`, `8917ffb`, `7ee1b33`, `259a341` — all FOUND.
Test suite: 254/254 pass (OFF baseline); 7 fail (1/category) with `VAL_07_STRICT=1` (expected — flag works).

---
*Phase: 09-infraestructura-de-validaci-n*
*Completed: 2026-05-26*
