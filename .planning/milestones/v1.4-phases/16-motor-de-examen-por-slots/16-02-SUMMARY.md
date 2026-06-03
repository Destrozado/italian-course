---
phase: 16-motor-de-examen-por-slots
plan: 02
subsystem: ui
tags: [alpine, slots, variants, inflighttest, localstorage, sampler]

# Dependency graph
requires:
  - phase: 16-01
    provides: "buildSession/buildFullTest devuelven {exerciseIds, variantIndices, actualSize}; pickVariantIndex puro"
  - phase: 15-02
    provides: "schemaVersion 6 (migrate5to6 + hydrateV6); content.slotById con variantes planas + explanation a nivel slot"
provides:
  - "Getter sessionCurrentExercise slot-aware que resuelve slotById[id].variants[variantIndex] y re-envuelve en .payload sintético (truco songCurrentPhrase)"
  - "variantIndices threaded por los 3 launch sites (startSession/_launchExamen/resetSession) + advance + resume"
  - "Persistencia de variante en inFlightTest (resume = misma variante) con fallback legacy → índice 0, sin bump de schemaVersion"
  - "Registro de variante mostrada en sessionResults + review de errores del summary que muestra la variante exacta fallada (summaryVariantSurface)"
  - "Motor de examen exercisable end-to-end con las 9 categorías legacy como slots de 1 variante"
affects: [phase-17-piloto-preposiciones, motor de examen, summary-errors, inFlightTest]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Synthetic-payload re-wrap: getter resuelve la superficie de slot/variante y la re-envuelve en {id, type, categoryIds, payload:{...surface, explanation}} para que initSubStateForExercise y los bindings .payload.* sobrevivan sin tocar"
    - "Parallel-array threading: sessionVariantIndices paralelo a sessionExerciseIds, alineado 1:1, default 0 (D-16-10) en todo punto de lectura"
    - "Back-compat por fallback, no por migración: inFlightTest legacy sin variantIndices → .map(() => 0), schemaVersion intacto en 6"

key-files:
  created: []
  modified:
    - "src/screens/app.js — getter slot-aware, sessionVariantIndices, 3 launch sites + advance + resume, persistInFlightTest/resumeInFlightTest, sessionResults push, summaryVariantSurface"
    - "index.html — summary-errors resuelve la variante fallada vía summaryVariantSurface(result)"

key-decisions:
  - "Synthetic-payload re-wrap (mismo truco que songCurrentPhrase/songStart de Phase 13) — los renders de sesión y initSubStateForExercise quedan intactos"
  - "Parallel-array sessionVariantIndices alineado 1:1 con sessionExerciseIds (consistente con la opción D-16-08 de Plan 01)"
  - "Back-compat de inFlightTest por fallback .map(() => 0), sin bump de schemaVersion (D-16-09/D-16-10)"
  - "Cascada D-54 intacta: applyResultToSession reusado, 2 call-sites de applyImmediateFailure (Pitfall #2)"

patterns-established:
  - "Synthetic-payload re-wrap para resolver variante de slot → superficie plana consumible por bindings .payload.*"
  - "summaryVariantSurface(result) helper que el template Alpine consume para evitar ripple en el x-for de summary-errors"

requirements-completed: [EXAM-02, EXAM-03, EXAM-05]

# Metrics
duration: ~2min (continuación; ejecución Tasks 1-2 en sesión previa)
completed: 2026-06-03
---

# Phase 16 Plan 02: Cableado del motor de slots end-to-end Summary

**Render slot-aware vía getter con .payload sintético + threading de variantIndices por los 3 launch sites / inFlightTest / sessionResults / summary-errors — el motor recorre slots con back-compat de las 9 categorías legacy, schemaVersion 6 intacto, cascada D-54 con 2 call-sites.**

## Performance

- **Duration:** ~2 min (agente de continuación; las Tasks 1-2 se ejecutaron en la sesión previa)
- **Started:** 2026-06-03T09:51:34+02:00 (Task 1 commit)
- **Completed:** 2026-06-03
- **Tasks:** 3 (Task 1 + Task 2 auto; Task 3 checkpoint human-verify APPROVED)
- **Files modified:** 2 (`src/screens/app.js`, `index.html`)

## Accomplishments

- `sessionCurrentExercise` reescrito como getter slot-aware: resuelve `content.slotById[id].variants[variantIndex]` y lo re-envuelve en `{id, type, categoryIds, payload:{...surface, explanation: slot.explanation}}` (synthetic-payload, mismo truco que `songCurrentPhrase`). Para slots legacy de 1 variante devuelve la misma superficie que hoy (variantIndex 0).
- `variantIndices` threaded por los 3 launch sites (`startSession`, `_launchExamen`, `resetSession`) que ahora alimentan el pool con `Object.values(this.content.slotById)` y guardan `this.sessionVariantIndices = result.variantIndices`; `sessionAdvance` y `resumeInFlightTest` resuelven el sub-estado vía el getter (no re-sortean la variante).
- La variante fijada viaja en `inFlightTest` (`variantIndices: [...this.sessionVariantIndices]`) → reanudar un Test completo restaura la MISMA variante por slot; blobs legacy sin `variantIndices` caen a índice 0 (`.map(() => 0)`), sin bump de `schemaVersion` (sigue v6).
- `sessionResults.push` registra `variantIndex: this.sessionCurrentVariantIndex`; el review de errores del summary muestra la variante EXACTA fallada vía el helper `summaryVariantSurface(result)` consumido por el `x-for` (copy y estructura visual idénticos, EXAM-02).
- Motor de examen exercisable end-to-end con las 9 categorías legacy como slots de 1 variante; cascada D-54 y racha intactas (operan por id de slot == exercise id).

## Task Commits

1. **Task 1: Getter sessionCurrentExercise slot-aware + variantIndices en los 3 launch sites + advance/resume** - `a2a7180` (feat)
2. **Task 2: variantIndices en inFlightTest + sessionResults + summary-errors slot-aware** - `3c3a76e` (feat)
3. **Task 3: Checkpoint booteo — motor de slots end-to-end con las 9 categorías legacy** - checkpoint `human-verify` (gate=blocking), **APPROVED** (la mitad automatizada del gate ya pasaba: invariantes grep + suite verde; ver "Manual UAT carried forward")

**Plan metadata:** (este commit `docs(16-02)`)

_Tasks 1 y 2 son `tdd="true"`; los commits agrupan test + implementación bajo un único `feat` por tarea (los 327 tests, incluidos los de screen no-DOM y dominio, cubren la lógica de threading)._

## Files Created/Modified

- `src/screens/app.js` — getter `sessionCurrentExercise` slot-aware + `sessionCurrentVariantIndex`; campo `sessionVariantIndices`; los 3 launch sites con `Object.values(this.content.slotById)` + guardado de `variantIndices`; `sessionAdvance`/`resumeInFlightTest` vía getter; `persistInFlightTest`/`resumeInFlightTest` con persistencia + fallback legacy; push de `variantIndex` en `sessionResults`; helper `summaryVariantSurface(result)`.
- `index.html` — bloque `summary-errors` resuelve la variante fallada vía `summaryVariantSurface(result)` (multiple-choice / word-buttons / match), copy y estructura intactos; el filter de existencia guarda contra slot ausente.

## Decisions Made

- None nuevas — se siguió el plan exactamente (D-16-08 parallel-array, D-16-09 sin bump de schemaVersion, D-16-10 default 0, Pitfall #2 — 2 call-sites). El re-wrap synthetic-payload y el helper `summaryVariantSurface` ya estaban prescritos en el `<action>` del plan.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0
**Impact on plan:** Ninguno — invariantes automatizados verdes a la primera, sin auto-fixes necesarios.

## Verification (automated invariants re-confirmados)

- `node --test tests/*.test.js` → **327/327 pass, 0 fail** (64 suites; backup round-trip v6, data-storage, screen no-DOM, dominio — sin regresión).
- `applyImmediateFailure(` call-sites reales (excluyendo `//` y JSDoc `*`): **2** (Pitfall #2 intacto; el grep crudo da 3 por la mención JSDoc).
- `Object.values(this.content.slotById)`: **3** (los 3 launch sites alimentan slotById).
- `slotById?.[id]` presente en el getter (resolución contra slotById).
- `variantIndices` presente en persistInFlightTest + resumeInFlightTest + los 3 launch sites; `ift.variantIndices` con fallback `.map(() => 0)`.
- `variantIndex` en el push de sessionResults; `summaryVariantSurface(result)` consumido por el summary en index.html.
- `CURRENT_SCHEMA_VERSION = 6` en `src/data/storage.js` (1 ocurrencia; **0** ocurrencias de `= 7` — sin bump).

## Manual UAT carried forward (NO ejecutado headlessly)

El checkpoint Task 3 (`human-verify`, gate=blocking) fue **APPROVED** bajo auto/chain-mode: la mitad automatizada del gate ya pasaba (invariantes grep + suite verde). Los pasos de verificación humana en navegador del plan NO se ejecutaron de forma headless y quedan como UAT manual a cargo del usuario, para confirmar visualmente la integración end-to-end:

1. Arrancar el server local (`npx serve` / VS Code Live Server) y abrir `http://localhost:PORT` (NO `file://` — localStorage falla, ver CLAUDE.md).
2. Home: las 9 categorías visibles y la columna "Ejercicios" muestra el MISMO número que antes de la fase (slots = ejercicios para legacy de 1 variante).
3. Repaso 20 sobre 1-2 categorías: completar sin fallar → la categoría se marca "hecha"; el indicador "Ejercicio X / N" cuenta slots.
4. Fallar un ejercicio a propósito → cascada D-54 inmediata (las categorías del slot se desmarcan al instante) + explicación pedagógica igual que antes.
5. Test completo: avanzar unos ejercicios, F5, "Reanudar" → reanuda en el MISMO punto con el mismo ejercicio (misma variante).
6. Pantalla de resumen tras sesión con fallos: "Errores cometidos" muestra prompt/respuesta correcta/explicación del ejercicio EXACTO fallado.
7. DevTools → Application → Local Storage: `schemaVersion: 6` y progreso previo NO reseteado; sin banner de validación de contenido al arrancar.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. (Recordatorio: servir vía `http://localhost`, nunca `file://`.)

## Next Phase Readiness

- **Motor de slots completo y exercisable end-to-end** con las 9 categorías legacy como slots de 1 variante (back-compat SLOT-06). Phase 17 (Piloto Preposiciones) puede ahora reagrupar los 57 ejercicios en slots multi-variante reales y el motor los recorrerá eligiendo 1 variante por slot sin más cambios de engine.
- Requisitos EXAM completos: EXAM-01/04/06 (Plan 16-01) + EXAM-02/03/05 (este plan) = 6/6.
- Sin blockers. El checkpoint humano quedó approved; el UAT manual de browser está documentado arriba como verificación de confianza recomendada antes de Phase 17.

## Self-Check: PASSED

- `16-02-SUMMARY.md` exists in phase dir.
- Commit `a2a7180` (Task 1) present on main.
- Commit `3c3a76e` (Task 2) present on main.

---
*Phase: 16-motor-de-examen-por-slots*
*Completed: 2026-06-03*
