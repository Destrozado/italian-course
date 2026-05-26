---
phase: 10-ejecuci-n-validaci-n-271-ejercicios-escalada-disputed
plan: 02
subsystem: testing
tags: [validation, reporter, zero-deps, ansi, gate, milestone, post-processing]

# Dependency graph
requires:
  - phase: 09-infraestructura-de-validaci-n
    provides: deriveStatus (sticky D-VAL-07) + validateValidationShape + scripts/run-validation-pilot.mjs pattern (POST-processing puro)
provides:
  - scripts/run-validation-271.mjs (reporter zero-deps que verifica los 3 sub-gates VAL-04 + VAL-06 + VAL-08 sobre los 7 archivos content/exercises/*.json)
  - effectiveStatus(passes) helper (relax path-B D-VAL-25cb — RESEARCH Open Q #1 opcion c) — generaliza deriveStatus para ejercicios con override del autor
  - Convención exit code: 0 = milestone gate PASS (autor procede al smoke test estricto), 1 = al menos un sub-gate FAIL (itera /gsd-validate-batch)
  - Mensaje literal "VAL_07_STRICT=1 node --test tests/*.test.js" como siguiente paso manual al PASS (gesto consciente del autor — Phase 10 NO auto-flippea)
affects: [10-04-PLAN, 10-05-PLAN, complete-milestone-v1.1]

# Tech tracking
tech-stack:
  added: []  # zero-deps invariant preserved — solo node builtins + import de validation-state.js
  patterns:
    - "Reporter POST-processing puro (NO Task, NO mutaciones, NO shell-out a node --test) — clon estructural de run-validation-pilot.mjs con scope diferente"
    - "Helper effectiveStatus(passes) que relaja deriveStatus sticky ante override del autor — pattern reutilizable para futuros validators que necesiten distinguir disputed-real vs override-validado"
    - "Defensive load (no throws) sobre los 7 JSONs — JSON corrupto reporta error y sigue con el resto (mitiga T-10-02-02 del threat model)"

key-files:
  created:
    - scripts/run-validation-271.mjs (357 líneas, zero-deps, ANSI colorizado)
  modified: []

key-decisions:
  - "Reporter NO shellea node --test (RESEARCH Q5 #2 + TL;DR #4): mantiene separación de responsabilidades — el reporter verifica el ESTADO de los JSONs (3 sub-gates), el smoke test VAL-07 ejecuta como paso separado manual al cierre del milestone. Auto-correr tests confunde exit-code semantics y acopla responsabilidades."
  - "effectiveStatus(passes) helper local en el reporter (NO mover a validation-state.js): semánticamente es regla del reporter, no del motor de derivación. validation-state.js mantiene su contrato sticky D-VAL-07 puro; el relax path-B vive donde se consume (RESEARCH Open Q #1 opcion c)."
  - "Tabla con 6 columnas (Categoria/Total/Validated/Disputed/Pending/Missing) + lista flat de disputed IDs si los hay + warning de inconsistencia status escrito vs derivado: surface exhaustivo al autor para decidir qué iteración del batch necesita."
  - "Suma expected = 271 hardcoded como constante TOTAL_EXPECTED y verificación adicional `total !== expected` por categoría como warning: protege contra archivos JSON con ejercicios borrados/duplicados sin requerir comparación con un snapshot externo."

patterns-established:
  - "Reporter Phase 10 = clon estructural de Phase 9 piloto: mismo ANSI helpers, mismo defensive loader, misma tabla padded, mismo aggregation. Cambio: 7 categorías vs 3 IDs hardcoded, 3 sub-gates vs 4, suma 271 vs 3."
  - "effectiveStatus(passes) consume deriveStatus(passes) + chequeo de override del autor: pattern aplicable a cualquier reporter futuro que necesite distinguir disputed-real (sin override) vs disputed-papel (con override consciente del autor)."
  - "Path-B audit trail preservation: el override del autor escribe directamente `validation.status = 'validated'` SIN mutar passes[] (las 2 entries 'incorrecta' originales siguen presentes). El relax del reporter detecta el `by:'autor'` entry adicional con `verdict:'correcta'` para tratarlo como validated. Audit eterno en el JSON + commit message."

requirements-completed:
  - VAL-04
  - VAL-06

# Metrics
duration: ~12min
completed: 2026-05-26
---

# Phase 10 Plan 10-02: Reporter milestone gate v1.1 (VAL-04 + VAL-06 + VAL-08) Summary

**Reporter `scripts/run-validation-271.mjs` zero-deps que aplica deriveStatus + effectiveStatus sobre los 7 archivos `content/exercises/*.json` en orden D-VAL-22, computa 3 sub-gates VAL-04/VAL-06/VAL-08, y exit 0 = milestone gate PASS con mensaje literal `VAL_07_STRICT=1 node --test tests/*.test.js` como siguiente paso manual.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-26T16:00:00Z (aprox.)
- **Completed:** 2026-05-26T16:12:00Z (aprox.)
- **Tasks:** 1
- **Files modified:** 1 (nuevo)
- **LOC:** 357 (supera el `min_lines: 120` del plan must-haves por 3×)

## Accomplishments

- Reporter zero-deps que cierra los criterios verificables del milestone v1.1 (VAL-04 + VAL-06 — VAL-08 era requirement de Plan 10-01 pero el reporter también lo verifica como sub-gate aggregado).
- Helper `effectiveStatus(passes)` implementa el relax path-B D-VAL-25 cb (RESEARCH Open Q #1 opción c) — el override consciente del autor (`{by:'autor', verdict:'correcta'}`) hace que un ejercicio con dos `incorrecta` históricas se trate como `validated` efectivo, sin requerir whitelist externa ni mutar el sticky D-VAL-07 del módulo `validation-state.js`.
- Defensive load (no throws) sobre los 7 JSONs — un JSON corrupto reporta error y sigue con el resto, mitiga T-10-02-02 del threat model.
- Mensajes en español (FOUND-04) — tabla en castellano, sub-gates etiquetados, acciones sugeridas según qué falla.
- Cero deps añadidas — solo `node:fs` + `node:url` + `node:path` + import del módulo puro `validation-state.js`. NO `child_process`, NO `writeFileSync`, NO shell-out a `node --test`.
- Estado verificado del run pre-batch: el reporter sale exit 1 con `Validated 2/271 (preposiciones-040 + avere-001 del piloto Phase 9)`, `disputed 0`, `pending 0`, `missing 269` — la rama defensive funciona como diseñada y NO crashea.

## Task Commits

Each task was committed atomically:

1. **Task 1: Crear `scripts/run-validation-271.mjs` con 7 categorías y 3 sub-gates** — `8372d10` (feat)

**Plan metadata:** (será commit final con SUMMARY.md + STATE.md + ROADMAP.md)

## Files Created/Modified

- `scripts/run-validation-271.mjs` (NUEVO, 357 líneas) — reporter milestone gate v1.1 (VAL-04 + VAL-06 + VAL-08). Header comment con justificación arquitectónica (POST-processing puro, NO shellea `node --test`). Imports zero-deps. ANSI helpers (GREEN/RED/YELLOW/BOLD/RESET + ok/fail/warn). Constante `CATEGORIES` (7 entries en orden D-VAL-22 con slug/file/expected; suma 271 verificada). `TOTAL_EXPECTED = 271` hardcoded como constante. Helper `effectiveStatus(passes)` (relax path-B). Helper `loadCategory(file)` defensive (no throws). Loop por categoría acumulando contadores validated/disputed/pending/missing + listas `disputedIds`/`missingMultiPassIds`/`inconsistencyIds`. Tabla padded con 6 columnas en español. Sub-gates VAL-06 → VAL-08 → VAL-04 con mensajes acción-orientados. Exit gate con mensaje literal `VAL_07_STRICT=1 node --test tests/*.test.js` en PASS / acciones sugeridas en FAIL según qué sub-gate falle.

## Decisions Made

1. **`effectiveStatus(passes)` vive en el reporter, NO en `validation-state.js`** (key-decision #2 arriba).
   - **Por qué:** semánticamente es regla del reporter, no del motor de derivación. `validation-state.js::deriveStatus` mantiene su contrato sticky D-VAL-07 puro (tested en bloque paramétrico VAL-07 con 7 sub-tests Phase 9). El relax path-B vive donde se consume — el reporter sabe sobre el override del autor, el motor de derivación no debe.
   - **Alternativa descartada:** añadir parámetro `{allowAuthorOverride: true}` a `deriveStatus` — contamina el contrato sticky, requiere actualizar todos los call-sites Phase 9, viola el "Phase 10 NO modifica los archivos Phase 9".

2. **Reporter NO shellea `node --test`** (key-decision #1 arriba, RESEARCH Q5 #2).
   - **Por qué:** confunde exit-code semantics (test failure ≠ gate failure), acopla responsabilidades, mayor latencia (~5-15s extra correr 254+ tests baseline + 7 VAL-07). El autor flippea `VAL_07_STRICT=1` conscientemente al cierre como gesto de milestone-close — debe ser acción separada y explícita, NO efecto secundario de correr el reporter.
   - **Alternativa descartada:** auto-correr el smoke test al final del reporter — descartado por RESEARCH §TL;DR #4.

3. **Tabla con 6 columnas explícitas + 4 tipos de warning inline** (key-decision #3 arriba).
   - Columnas: Categoría/Total/Validated/Disputed/Pending/Missing.
   - Warnings inline (en amarillo, NO FAIL): "Disputed IDs: ..." si `disputed > 0`, "Missing validation: N ejercicios" si `missing > 0`, "Inconsistencia status escrito vs derivado: ID (escrito='...', derivado='...')" si el `status` del JSON no coincide con `effectiveStatus`, "Total N ≠ esperado M" si el conteo difiere.
   - **Por qué:** surface exhaustivo al autor para decidir qué iteración del batch necesita; el FAIL del reporter es informativo, no críptico.

4. **`TOTAL_EXPECTED = 271` como constante module-level + verificación per-categoría de `total !== expected`** (key-decision #4 arriba).
   - **Por qué:** protege contra archivos JSON con ejercicios borrados/duplicados (regresión silenciosa) sin requerir comparación con un snapshot externo (e.g. evitar el patrón de `scripts/assert-avere-prefix-unchanged.mjs` para los 7 archivos — sería over-engineered).

## Deviations from Plan

None - plan executed exactly as written.

El plan especificaba todos los detalles concretos (CATEGORIES con expected counts, helper `effectiveStatus`, mensajes literales, exit codes, threat model). El reporter clona estructura de `run-validation-pilot.mjs` (template designado en RESEARCH Q5 + PATTERNS) adaptando scope (7 categorías vs 3 IDs hardcoded) y sub-gates (3 vs 4). Cero auto-fixes Rules 1-3, cero blockers Rule 4.

**Single ajuste táctico (NO deviation — es elección dentro del Claude's Discretion del plan):**

- El helper `effectiveStatus(passes)` se implementó como función local en el reporter (NO en `validation-state.js`), respetando el "Phase 10 NO modifica archivos Phase 9" (críticos constraint heredado del CONTEXT.md + RESEARCH §canonical_refs). El plan dejaba abierto si vivía en el reporter o en el módulo puro; la decisión fue clara: módulo puro mantiene contrato sticky D-VAL-07 testeado, reporter aplica el relax solo donde se consume.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Wave 1 lado B (Plan 10-02) cerrado.** El reporter está listo para usarse como gate del milestone al cierre del run real (Plan 10-04). Para que `node scripts/run-validation-271.mjs` salga exit 0:

1. Ejecutar Plan 10-04 (`/gsd-validate-batch --all-pending`) sobre los 269 pendientes.
2. Procesar la cola disputed según D-VAL-25 (4 caminos: accept-fix / reject+override / rewrite / skip).
3. Re-correr el reporter hasta exit 0.
4. Ejecutar Plan 10-05 (close gate): flip manual `VAL_07_STRICT=1 node --test tests/*.test.js` + `/gsd:complete-milestone v1.1`.

**Plan 10-03 (docs README VAL_07_STRICT=1)** es paralelo a este Plan 10-02 — puede ejecutarse antes/después/durante Plan 10-04 sin dependencia.

**Plan 09-03 (piloto Phase 9 + checkpoint:human-verify)** sigue pendiente; no bloquea Plan 10-02 (las decisiones D-VAL-19..26 están lockeadas) pero conviene cerrarlo antes de Plan 10-04 para validar la maquinaria end-to-end con checkpoint:human-verify sobre 3 ejercicios antes de gastar tokens sobre 269.

## Self-Check

**1. Created files exist:**

- `scripts/run-validation-271.mjs` — FOUND (verified via `test -f`)

**2. Commits exist:**

- `8372d10` — FOUND (verified via `git log --oneline`)

**3. Verify automated PASS (todos los grep checks del plan):**

- `test -f scripts/run-validation-271.mjs` — PASS
- `head -5 scripts/run-validation-271.mjs | grep -q "node"` — PASS (shebang `#!/usr/bin/env node`)
- `grep -q "deriveStatus"` — PASS
- `grep -q "effectiveStatus"` — PASS
- `grep -q "VAL-04"` `grep -q "VAL-06"` `grep -q "VAL-08"` — PASS
- 7 slugs categoría (preposiciones, avere, essere, genero-numero, profesiones, sustantivos-irregulares, verbos-movimiento) — PASS
- `grep -q "VAL_07_STRICT"` — PASS (literal en mensaje PASS)
- `grep -q "by === 'autor'"` — PASS (en helper effectiveStatus)
- `! grep -q "child_process"` — PASS (cero deps externos)
- `! grep -q "npm install"` — PASS
- `! grep -q "writeFileSync"` — PASS (mitiga T-10-02-01)
- `node --check scripts/run-validation-271.mjs` — PASS (sintaxis válida)
- `node scripts/run-validation-271.mjs` → exit 1 con tabla colorizada renderizada, 2/271 validated, sin crash — PASS (acceptance_criteria del plan satisfecho)

## Self-Check: PASSED

---
*Phase: 10-ejecuci-n-validaci-n-271-ejercicios-escalada-disputed*
*Completed: 2026-05-26*
