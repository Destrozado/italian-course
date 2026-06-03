---
phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
plan: 03
subsystem: integration
tags: [integration-test, slot-variants, back-compat, fixture, human-verify, node-test]

# Dependency graph
requires:
  - phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
    provides: "Plan 01 — validateContent payload XOR variants[] + normalizeExerciseToSlot + slotById"
  - phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
    provides: "Plan 02 — migrate5to6 + hydrateV6 + backup round-trip v6 (schemaVersion 6)"
provides:
  - "Fixture canónico de autoría slot+variantes (content/exercises/_fixtures/slot-demo.json) — contrato de shape para Phase 16/17"
  - "Test de integración end-to-end del pipeline (validateContent -> normalizeExerciseToSlot -> shape slotById) + no-mutación del legacy"
  - "Back-compat gate SLOT-06: las 9 categorías reales validan con el validator extendido sin re-autoría"
  - "Confirmación humana (ASVS L1, block-on-high): la app arranca con las 9 categorías como hoy, state persiste en v6 sin reset, backup round-trip v6 funciona"
affects: [16-motor-de-examen-por-slots, 17-piloto-preposiciones]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fixture de autoría en content/exercises/_fixtures/ — fuera del categoryRegistry, sirve de contrato vivo del shape slot+variantes para fases posteriores"
    - "Test de integración del pipeline completo (no de unidad): lee el fixture del disco, lo pasa por validateContent y normalizeExerciseToSlot, afirma shape + no-mutación"
    - "Back-compat gate paramétrico que recorre las 9 categorías reales del registry y afirma ok true + conteo intacto"

key-files:
  created:
    - content/exercises/_fixtures/slot-demo.json
    - tests/fixtures/slot-variants-integration.test.js
  modified: []

key-decisions:
  - "El fixture vive en content/exercises/_fixtures/ y NO entra en categoryRegistry (no es contenido de producción) — demuestra el shape de autoría slot+variantes sin tocar las 9 categorías reales (D-15-06)."
  - "El test de integración importa la función pura normalizeExerciseToSlot de Plan 01 (sin fetch) y afirma la no-mutación del ejercicio legacy original (espejo de exerciseById intacto)."
  - "El checkpoint de seguridad (ASVS L1, block-on-high) se cierra con la aprobación humana del autor tras verificar booteo de las 9 categorías + state v6 sin reset + backup round-trip — sin código de producción nuevo."

patterns-established:
  - "Fixture canónico en _fixtures/ como contrato de shape para fases consumidoras (Phase 16/17)."
  - "Gate de back-compat que valida las 9 categorías reales con el validator extendido — atrapa regresiones de la rama XOR payload."

requirements-completed: [SLOT-01, SLOT-03, SLOT-06]

# Metrics
duration: ~5min
completed: 2026-06-03
---

# Phase 15 Plan 03: Verificación end-to-end del modelo slot+variantes Summary

**El pipeline completo (validateContent -> normalizeExerciseToSlot -> slotById) acepta un fixture real slot+variantes sin mutar el legacy, las 9 categorías reales siguen validando intactas con el validator extendido (SLOT-06), y el autor confirmó en navegador que la app arranca con las 9 categorías como hoy, el state persiste en schemaVersion 6 sin reset y el backup round-trip v6 funciona.**

## Performance

- **Duration:** ~5 min (continuación tras la aprobación humana del checkpoint)
- **Tasks:** 3 (Tasks 1-2 autónomos commiteados en `f022c4d`; Task 3 checkpoint humano APPROVED)
- **Files created:** 2 (fixture + test de integración)

## What Was Built

- **content/exercises/_fixtures/slot-demo.json**: fixture canónico de autoría con (1) un slot multi-variante (type multiple-choice, categoryIds válidas, explanation a nivel de slot, `variants[]` con 2 variantes {prompt con hueco, options, correctIndex en rango}) y (2) un slot de 1 variante (SLOT-03, caso `in spiaggia`). Contenido en español acentuado correcto, plain text sin markdown, apóstrofes ASCII (D-129/D-135/D-137), sin HTML (T-15-XSS). Vive en `_fixtures/`, fuera del categoryRegistry — no es contenido de producción.
- **tests/fixtures/slot-variants-integration.test.js** (26 tests): pipeline end-to-end — (a) lee el fixture del disco y lo pasa por `validateContent` con categorías sintéticas → ok true; (b) importa la función pura `normalizeExerciseToSlot` de Plan 01 y afirma que el slot multi-variante preserva sus 2 variantes y el slot de 1 normaliza; (c) afirma que un ejercicio legacy con payload normaliza a slot de 1 con explanation desde `payload.explanation` SIN mutar el objeto original (espejo de exerciseById); más el bloque de back-compat SLOT-06 que carga las 9 categorías reales del registry, las valida con el validator extendido (ok true) y afirma conteo de ejercicios intacto.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Fixture canónico slot+variantes + test de integración del pipeline | f022c4d | content/exercises/_fixtures/slot-demo.json, tests/fixtures/slot-variants-integration.test.js |
| 2 | Back-compat gate — 9 categorías reales + Canciones + avere snapshot intactos | f022c4d | tests/fixtures/slot-variants-integration.test.js |
| 3 | Checkpoint human-verify (ASVS L1, block-on-high) — booteo 9 categorías + state v6 + backup round-trip | — (APPROVED) | n/a (verificación humana, sin código) |

_Nota: Tasks 1-2 se commiteron juntos en `f022c4d` (test de integración + fixture). Task 3 es el gate de seguridad bloqueante; no produce código de producción — el autor lo aprobó tras verificar los 6 pasos de how-to-verify._

## Checkpoint Resolution (Task 3 — human-verify, blocking-human)

El autor ejecutó la verificación manual en navegador y respondió **"approved"**:

- Las 9 categorías gramaticales + el bloque Canciones arrancan exactamente como hoy, sin banner de error de validación (T-15-REGR mitigado).
- El state persiste con `"schemaVersion":6` tras una sesión, sin reset ni pérdida del progreso previo (T-15-DATALOSS mitigado — bump nominal D-15-09).
- El backup round-trip funciona: export + re-import del `.json` v6 sin error de "versión más nueva".
- Los banners de validación salen como texto plano en español sin inyección de HTML (T-15-XSS mitigado).

Cierre del gate de seguridad de la fase (ASVS L1, block-on-high): sin discrepancias.

## Verification

- `node --test` — 367/367 verde (332 baseline Plan 01 + 9 Plan 02 + 26 integración Plan 03; sin regresión).
- `node scripts/validate-content-fixture.mjs slot-demo content/exercises/_fixtures/slot-demo.json` — exit 0 (2 ejercicios válidos).
- `node scripts/assert-avere-prefix-unchanged.mjs` — exit 0 (back-compat append-only D-88/D-178, los 8 archivos legacy intactos).
- Checkpoint humano — APPROVED (9 categorías como hoy, state v6 sin reset, backup round-trip ok).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Ningún archivo de `content/exercises/` real fue modificado (D-15-06). El fixture vive aislado en `_fixtures/`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Fase 15 cerrada: el modelo slot+variantes (validator + slotById, Plan 01), la migración a schemaVersion 6 (Plan 02) y la verificación de back-compat end-to-end (Plan 03) están completos y verificados por humano.
- `slot-demo.json` queda como contrato vivo del shape de autoría para Phase 16 (motor de examen por slots) y Phase 17 (piloto Preposiciones).
- Las 9 categorías reales + el snapshot de avere quedan intactos; el engine es exercisable end-to-end con slots de 1 variante (SLOT-06) antes de la rework de contenido de Phase 17.

## Self-Check: PASSED

- FOUND: content/exercises/_fixtures/slot-demo.json
- FOUND: tests/fixtures/slot-variants-integration.test.js
- FOUND commit: f022c4d (test — fixture + integración + back-compat)

---
*Phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n*
*Completed: 2026-06-03*
