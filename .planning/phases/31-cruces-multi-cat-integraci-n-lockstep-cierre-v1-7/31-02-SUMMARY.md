---
phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7
plan: 02
subsystem: test-harness
tags: [presente-regolare, INT-01, INT-02, lockstep, dynamic-count, VAL-06, smoke-parametrico]

# Dependency graph
requires:
  - phase: 31-01
    provides: "content/exercises/presente-regolare.json con exercises.length FINAL = 12 (8 slots base + 4 cruces, todos validated)"
  - phase: 30-alta-presente-regolare
    provides: "8 slots base + categoria order:10 registrada"
provides:
  - "presente-regolare integrada en los 3 count arrays (CATEGORIES_WITH_EXPLANATIONS, REAL_CATEGORIES, CATEGORIES)"
  - "TOTAL_EXPECTED = 195 (183 + 12) computado dinamicamente + guard de coherencia"
  - "smoke parametrico cubre presente-regolare (count/explanation/ASCII/no-markdown/R1-no-leak/R2-no-xref) + gate D-VAL-18 status=validated"
  - "10ª categoria bajo el gate de regresion end-to-end — v1.7 cerrado"
affects: [INT-01, INT-02, v1.7-cierre]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "D-31-06 dynamic-count: el expected de presente-regolare se DERIVA del JSON real en disco (helper slotCountOf / readJson(...).exercises.length), NUNCA un literal magico"
    - "TOTAL_EXPECTED computado como CATEGORIES.reduce(sum) + guard runtime que pinea 183 + presente-regolare(N) = 195"

key-files:
  created:
    - ".planning/phases/31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7/31-02-SUMMARY.md"
  modified:
    - "tests/exercise-types.test.js"
    - "tests/fixtures/slot-variants-integration.test.js"
    - "scripts/run-validation-271.mjs"

key-decisions:
  - "expected de presente-regolare derivado del JSON real (12) en los 3 sitios per D-31-06, no hardcode"
  - "TOTAL_EXPECTED computado (no literal) + guard de coherencia que falla si el JSON cambia de slot count sin revisar historial"
  - "NO tocar genero-numero (fail preexistente AJENO, prohibido por plan) ni preposiciones (2º discrepante preexistente AJENO descubierto, fuera de scope)"

requirements-completed: [INT-01, INT-02]

# Metrics
duration: ~15min
completed: 2026-06-17
---

# Phase 31 Plan 02: Integracion lockstep de presente-regolare Summary

**presente-regolare (10ª categoria) enganchada al harness de regresion: aparece como entrada NUEVA en los 3 count arrays y en TOTAL_EXPECTED (183->195), con el expected derivado DINAMICAMENTE del JSON real (12 = 8 slots base + 4 cruces, D-31-06, nunca un numero magico); el smoke parametrico y el gate estricto D-VAL-18 corren y pasan sobre la categoria; suite verde salvo el unico fail preexistente AJENO (genero-numero 12->13). v1.7 cerrado end-to-end.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-06-17
- **Tasks:** 2 (Task 1 edicion + Task 2 verificacion read-only)
- **Files modified:** 3 (test/script) + 1 SUMMARY

## Accomplishments

- **INT-01 — 3 count arrays + TOTAL_EXPECTED sincronizados (entrada NUEVA, no bumpeo):** presente-regolare estaba AUSENTE de los tres arrays Y de TOTAL_EXPECTED (descubrimiento PATTERNS.md). Añadida como 10ª entrada en:
  - `tests/exercise-types.test.js` -> `CATEGORIES_WITH_EXPLANATIONS` (con helper `slotCountOf` que lee `exercises.length` del JSON real).
  - `tests/fixtures/slot-variants-integration.test.js` -> `REAL_CATEGORIES` (con `readJson(...).exercises.length`); comentarios "9 categorias" -> "10 categorias" (lineas 13, header del describe, titulo del bundle test).
  - `scripts/run-validation-271.mjs` -> `CATEGORIES` (con `slotCountOf`); `TOTAL_EXPECTED` ahora computado como `CATEGORIES.reduce(sum)` = 183 + 12 = **195** + guard de coherencia; linea de historial Phase 31 añadida al bloque de comentarios.
- **D-31-06 dynamic-count honrado en los 3 sitios:** ningun literal `12` hardcodeado como expected — los tres derivan de `exercises.length` del JSON real. Si Plan 01 hubiera dejado otro N, los tres se mueven solos.
- **INT-02 — smoke parametrico + gate validated + suite verde estricta:**
  - El smoke (loop sobre `CATEGORIES_WITH_EXPLANATIONS`) corre automaticamente sobre `content/exercises/presente-regolare.json`: subtest `ok 10 - content/exercises/presente-regolare.json` (count 12, explanation presente, ASCII, no-markdown, R1-no-leak, R2-no-xref) — todos PASS.
  - El gate D-VAL-18 estricto (`VAL_07_STRICT=1`): subtest `ok 10 - content/exercises/presente-regolare.json — todos los ejercicios con validation.status === "validated"` — PASS (los 12 validated por Plan 01).
- **Cascada D-54 intacta:** `grep -c "applyImmediateFailure(this.state" src/screens/app.js` === 2 (motor NO tocado, brownfield puro sobre test/script).

## Conteo exacto de la suite (verificado)

| Run | Total | Pass | Fail |
|-----|-------|------|------|
| `node --test tests/*.test.js` | 474 | 473 | **1** (preexistente AJENO genero-numero) |
| `VAL_07_STRICT=1 node --test tests/*.test.js` | 484 | 483 | **1** (preexistente AJENO genero-numero) |

El UNICO fail en ambos runs es el preexistente AJENO: `tests/exercise-types.test.js` smoke de genero-numero — "Esperaba 12 ejercicios en content/exercises/genero-numero.json, encontre 13" (quick task `260614-hxn`, fuera de scope Phase 31). **CERO fails NUEVOS ligados a presente-regolare.** El mensaje de fallo menciona genero-numero, NO presente-regolare.

La suite subio de 469 (baseline Plan 01) a 474 normal / 484 estricto: la 10ª categoria añade sus subtests de smoke (count/explanation/ASCII/no-markdown/R1/R2), el bundle de slot-variants y el gate estricto VAL-07 — todos verdes.

## Task Commits

1. **Task 1: Sincronizar los 3 count arrays + TOTAL_EXPECTED (INT-01)** - `9653e8d` (feat)
2. **Task 2: Verificar smoke + reporter VAL-06 + suite verde estricta (INT-02)** - read-only (sin cambios de archivo; verificacion documentada en este SUMMARY); commit docs final.

## Files Created/Modified

- `tests/exercise-types.test.js` - 10ª entrada en `CATEGORIES_WITH_EXPLANATIONS` (expected dinamico via `slotCountOf`); helper de lectura añadido.
- `tests/fixtures/slot-variants-integration.test.js` - 10ª entrada en `REAL_CATEGORIES` (expected dinamico via `readJson`); comentarios y titulos 9->10.
- `scripts/run-validation-271.mjs` - 10ª entrada en `CATEGORIES` (expected dinamico); `TOTAL_EXPECTED` computado (=195) + guard; historial Phase 31.
- `.planning/phases/31-.../31-02-SUMMARY.md` - este documento.

## Decisions Made

- **expected DINAMICO en los 3 sitios (D-31-06):** lectura de `exercises.length` del JSON real, nunca el literal 12. Verificado: `node -e "...presente-regolare.json').exercises.length"` = 12.
- **TOTAL_EXPECTED computado (no literal):** `CATEGORIES.reduce((s,c)=>s+c.expected,0)` + guard runtime `183 + presente-regolare(N) === TOTAL_EXPECTED` para que nunca divirja de la suma. El comentario y el guard contienen literalmente "TOTAL_EXPECTED = 195".

## Deviations from Plan

### Hallazgo de verificacion (NO auto-fix — Rule 4 / fuera de scope)

**1. [Out-of-scope] El reporter VAL-06 NO alcanza PASS por un SEGUNDO discrepante preexistente AJENO (preposiciones), ademas del genero-numero documentado**

- **Found during:** Task 2 (`node scripts/run-validation-271.mjs`).
- **Issue:** El reporter da `VAL-06 (195/195): FAIL (197/195 — pending=0, missing=0, disputed=0)`. El gap es +2, NO +0. Desglose verificado de `exercises.length` por categoria vs su `expected` en `CATEGORIES`:
  - **genero-numero:** actual 13 vs expected 12 (+1) — el preexistente AJENO documentado (quick `260614-hxn`).
  - **preposiciones:** actual 50 vs expected 49 (+1) — un SEGUNDO discrepante preexistente AJENO, NO documentado en el plan ni en STATE.md (que solo registra el genero-numero).
  - **presente-regolare:** actual 12 vs expected 12 (+0) — la integracion de este plan es CORRECTA, cero discrepancia.
- **Evidencia de que es preexistente (NO regresion):** corrido el `scripts/run-validation-271.mjs` de `HEAD` (antes de este plan, TOTAL_EXPECTED literal=183) da `VAL-06 (183/183): FAIL (185/183)` — ya fallaba con el MISMO gap +2 (genero-numero +1 y preposiciones +1). Mi cambio mantiene el gap en exactamente +2 y suma presente-regolare con 0 discrepancia.
- **Por que NO se arregla:** el plan prohibe tocar genero-numero (lineas 70/109) y NO autoriza tocar preposiciones (fuera de scope, no figura en `<files>` ni en ninguna instruccion). "Fixing" cualquiera de los dos seria scope creep sobre contenido/arrays AJENOS al milestone presente-regolare. Reconciliar el expected:49 vs el JSON de 50 slots (o viceversa) es trabajo de un quick task separado. NO se silencio ningun assert ni se toco el motor.
- **Impacto sobre el objetivo del plan:** INT-01/INT-02 estan CERRADOS respecto a presente-regolare: la categoria entra en los 3 arrays, su expected es dinamico, su smoke + gate validated pasan, y aporta 12=12 al reporter sin discrepancia propia. El reporter no marca disputed/pending/missing para presente-regolare (VAL-08 PASS, VAL-04 PASS). El unico motivo de que VAL-06 no llegue a verde es la deuda de conteo preexistente AJENA (genero-numero + preposiciones), que el plan asumio inexistente salvo el genero-numero.

---

**Total deviations:** 1 hallazgo out-of-scope (documentado, NO auto-fix). 0 auto-fixes de Rule 1-3 (la integracion no introdujo bugs).
**Impact on plan:** presente-regolare integrada correctamente y verde. La unica desviacion del resultado esperado (VAL-06 PASS) es atribuible a deuda preexistente AJENA fuera del scope de este milestone.

## Issues Encountered

- **VAL-06 baseline ya rojo:** la asuncion del plan ("unico fail tolerado = genero-numero") era parcial — hay DOS discrepantes de conteo preexistentes (genero-numero + preposiciones) que mantienen el reporter en FAIL 197/195. presente-regolare no contribuye a ese gap. Recomendado: quick task de reconciliacion de los expected de genero-numero (sincronizar a 13 tras `260614-hxn`) y preposiciones (49 vs 50) — ambos AJENOS a v1.7.

## Known Stubs

None - los 3 arrays apuntan a contenido real y validado; cero placeholders.

## Threat Flags

None - este plan solo edita test/script (harness de regresion). No introduce superficie de red/auth/endpoint nueva. El boundary content->schema-validator->engine se EJERCITA (no se modifica) al correr el smoke/validateContent sobre presente-regolare. T-31-04/05/06 mitigados: dynamic-count en los 3 sitios (T-31-04), gate validated + reporter cuentan la categoria (T-31-05), R1-no-leak corre sobre el contenido nuevo y pasa (T-31-06).

## Next Phase Readiness

- **v1.7 cerrado end-to-end:** presente-regolare es la 10ª categoria usable (motor v1.4 la incluye en home/picker/Repaso/Examen desde Phase 30) y ahora esta bajo el gate de regresion (3 count arrays + smoke + gate validated estricto). INT-01/INT-02 done -> 11/11 requirements v1.7 completos.
- **Deuda preexistente AJENA pendiente (fuera de v1.7):** reconciliar el reporter VAL-06 requiere sincronizar los expected de genero-numero (12->13) y preposiciones (49<->50) — quick task separado, no de scope presente-regolare.
- Cascada D-54 verificada en 2 call-sites (motor intacto).

## Self-Check: PASSED

- SUMMARY.md creado y presente.
- Commit Task 1 `9653e8d` verificado en git log.
- Los 3 archivos modificados contienen "presente-regolare" (3 / 2 / 11 matches respectivamente).
- `TOTAL_EXPECTED = 195` presente en run-validation-271.mjs; cascada = 2.

---
*Phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7*
*Completed: 2026-06-17*
