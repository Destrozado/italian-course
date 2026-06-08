---
phase: 23-essere-a-slots-contenido
plan: 03
subsystem: tooling-tests
tags: [essere, slots, sync-count, TOTAL_EXPECTED, reporter, smoke-shape-agnostic]

# Dependency graph
requires:
  - phase: 23-01
    provides: "essere.json reagrupado a 25 slots+variantes"
  - phase: 23-02
    provides: "14 superficies nuevas + slot nuevo essere-ser-estar -> conteo final REAL 26 slots"
provides:
  - "3 hardcodes de count de Essere (exercise-types.test.js, slot-variants-integration.test.js, run-validation-271.mjs) sincronizados 39 -> 26 contra data.exercises.length REAL"
  - "TOTAL_EXPECTED recalculado 320 -> 307 (= 320 - 39 + 26)"
  - "ESS-01 cerrado (cierre del count de la conversión de Essere)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sync de los 3 hardcodes de count contra el conteo REAL leido del JSON (no estimacion) — espejo de 19-03/20-03/22-03"
    - "Smoke paramétrico shape-agnostic (Array.isArray(ex.variants)) reutilizado SIN tocar la logica — solo el count"

key-files:
  created:
    - .planning/phases/23-essere-a-slots-contenido/23-03-SUMMARY.md
  modified:
    - tests/exercise-types.test.js
    - tests/fixtures/slot-variants-integration.test.js
    - scripts/run-validation-271.mjs

key-decisions:
  - "Conteo REAL leido del JSON = 26 slots (NO estimacion). Net SUBIO respecto a 39 -> 26: la fusion por regla bajo de 39 a 25, pero el passato en 4 slots (D-23-03) ya estaba contado en los 25, y el slot nuevo ser/estar (D-23-07) sumo 1 -> 26."
  - "TOTAL_EXPECTED = 320 - 39 + 26 = 307. avere=20, articoli=34, partitivos=19 intactos."
  - "Validator y loader NO tocados (ya aceptan variants[]); logica del smoke NO tocada (ya shape-agnostic, grep Array.isArray=2)."

requirements-completed: [ESS-01]

# Metrics
duration: ~5min
completed: 2026-06-08
---

# Phase 23 Plan 03: Sync de counts de Essere (cierre ESS-01) Summary

**Los 3 hardcodes de count de Essere (`expected: 39`) + `TOTAL_EXPECTED` re-sincronizados contra el conteo REAL de slots leido del JSON (`data.exercises.length = 26`, NO estimacion): 39 -> 26 en los 3 archivos + TOTAL_EXPECTED 320 -> 307. Suite completa 374/374, strict 383/383, reporter PASS (307/307), fixture essere exit 0 (26). Validator/loader/logica del smoke NO tocados. ESS-01 cerrado.**

## Performance

- **Duration:** ~5 min
- **Completed:** 2026-06-08
- **Tasks:** 2 (ambos auto)
- **Files modified:** 3

## Conteo REAL (no estimacion)

`node -e "console.log(require('./content/exercises/essere.json').exercises.length)"` → **26**.

El net SUBIO respecto al hardcode previo (39 → 26 no es solo una bajada lineal por fusion): la reagrupacion por regla de 23-01 fundio 39 ejercicios payload → 25 slots (incluido el passato prossimo partido en 4 slots SEPARADOS por concordancia, D-23-03), y 23-02 anadio 1 slot nuevo `essere-ser-estar` (D-23-07) = **26 slots reales**. Las 14 superficies nuevas de 23-02 (engordes de presente/nacionalidad/localizacion) son VARIANTES → NO suben el count; solo el slot nuevo lo sube. Leccion 19-03/20-03/22-03 honrada: leer del JSON, nunca estimar.

## Qué se hizo

**Task 1 (commit `ba60417`)** — `tests/exercise-types.test.js`: `expected` de essere en `CATEGORIES_WITH_EXPLANATIONS` (linea 1271) 39 → 26. Logica `getExplanation`/`getPrompts` shape-agnostic sin tocar (`grep -c "Array.isArray(ex.variants)"` = 2, sin cambios). Las otras 8 categorias intactas (avere 20, articoli 34, partitivos 19, preposiciones 49, genero-numero 40, sustantivos-irregulares 31, verbos-movimiento 37, profesiones 51). Bloque VAL_07_STRICT hereda el count sincronizado (lee `ex.validation?.status` top-level).

**Task 2 (commit `9180215`)** — (1) `tests/fixtures/slot-variants-integration.test.js`: `REAL_CATEGORIES` essere (linea 168) 39 → 26. (2) `scripts/run-validation-271.mjs`: `expected` essere (linea 103) 39 → 26; `TOTAL_EXPECTED` 320 → 307 (= 320 − 39 + 26); comentario del historial del total ampliado con la linea ESS-01 (analoga a la de Avere) documentando la conversion de Essere a slots (passato en 4 slots D-23-03 + slot nuevo ser/estar D-23-07). avere/articoli/partitivos intactos.

## Verificación (gate final — TODO VERDE)

- `node --test tests/*.test.js` → **374 pass / 0 fail** (suite completa).
- `VAL_07_STRICT=1 node --test tests/*.test.js` → **383 pass / 0 fail**.
- `node scripts/run-validation-271.mjs` → exit 0. **VAL-06 307/307 PASS**, VAL-08 cero disputed PASS, VAL-04 PASS. Sin warning de count para essere.
- `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` → exit 0 (**26 ejercicios**).
- Los 3 hardcodes + TOTAL_EXPECTED coinciden con `data.exercises.length` real (26 / 26 / 26 / 307=320−39+26).
- (NO se corrio ningun assert de snapshot — avere-only, no existe para Essere.)
- `git diff --name-only` del plan: solo los 3 archivos intencionados. Validator (`schema-validator.js`) y loader NO tocados.

## Threat mitigations aplicadas

- **T-23-07** (count desincronizado → gate falso): los 3 hardcodes + TOTAL_EXPECTED se sincronizaron contra el MISMO `data.exercises.length` real (26), no estimaciones. Reporter VAL-06 307/307 PASS lo asserta. Net SUBIO (39→26 incluye el slot nuevo) — se leyo, no se asumio.
- **T-23-03** (HTML/markdown/smart-quotes de slot sin escanear): el smoke YA bifurca por shape; los escaneos R1/R2/smart-quotes/markdown corren sobre `ex.explanation` + `ex.variants[].prompt` para slots — cobertura preservada (137/137 strict del solo exercise-types, 383/383 strict global).
- **T-23-08** (slot/variante no validated cuela en VAL_07_STRICT): el gate strict paso 383/383 → todo slot/variante de Essere lleva validation top-level validated (slot ser/estar D-19-09 cubierto por 23-02).

## Deviations from Plan

None — plan ejecutado exactamente como escrito. El conteo real (26) se leyo del JSON y se aplico identico en los 3 sitios; TOTAL_EXPECTED recalculado aritmeticamente. Sin scope creep, sin auto-fixes necesarios, sin checkpoints.

## Known Stubs

Ninguno.

## Self-Check: PASSED

- `.planning/phases/23-essere-a-slots-contenido/23-03-SUMMARY.md` → FOUND
- commit `ba60417` (Task 1) → presente en git
- commit `9180215` (Task 2) → presente en git
- `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs` → FOUND (modificados)

---
*Phase: 23-essere-a-slots-contenido*
*Completed: 2026-06-08*
