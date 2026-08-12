---
phase: quick-260713-ng7
plan: 01
subsystem: screens/session
tags: [repaso, review-only, summary, invariante-persistencia]
status: complete
prior_status: shipped
requires:
  - summarySessionResults (snapshot de la ronda terminada)
  - sessionCurrentExercise getter slot-aware (Phase 16)
provides:
  - startFailedReview() — reintento review-only de las falladas
  - flag sessionReviewOnly — guard único de supresión de escritura
affects:
  - src/screens/app.js
  - index.html
tech-stack:
  added: []
  patterns:
    - review-only session (mode 'repaso-fallidas', flag runtime no persistido)
    - reuso de la pantalla de sesión existente (no pantalla paralela)
key-files:
  created:
    - tests/screen-repeat-failed.test.js
  modified:
    - src/screens/app.js
    - index.html
decisions:
  - "Un único flag sessionReviewOnly gobierna los 3 sinks de persistencia; se resetea en resetSession (chokepoint volver-al-home)."
  - "sessionMode='repaso-fallidas' (mode distinto) hace que restartRepaso/persistInFlightTest/requestReturnToHome no disparen — cero cambios en esos métodos."
  - "El completado review-only vuelve al summary ORIGINAL sin recomputar summaryDelta/summarySessionResults → el botón sigue disponible para repetir de nuevo."
metrics:
  duration: ~15min
  completed: 2026-07-13
  tasks: 3
  files: 3
---

# Quick 260713-ng7: Repetir las falladas (reintento review-only) Summary

Botón "Repetir las falladas" en el resumen que relanza una sesión con SOLO los
ejercicios fallados en la ronda recién terminada (misma variante), reusando la
pantalla de sesión existente, sin tocar racha, contadores, motor de repetición
ni localStorage — porque esos fallos ya se contaron.

## Qué se hizo

- **Task 1 (`src/screens/app.js`, commit f38e07c):**
  - Nuevo flag runtime `sessionReviewOnly` (no persistido, no en inFlightTest),
    reseteado simétricamente en `resetSession()`.
  - Nuevo método `startFailedReview()`: deriva las falladas del snapshot
    `summarySessionResults` con el predicado canónico
    `!r.correct && content.slotById[r.exerciseId]`, construye los arrays
    paralelos `sessionExerciseIds`/`sessionVariantIndices` (variante fallada vía
    `r.variantIndex ?? 0`), espeja el reset de sub-estado de `restartRepaso()`,
    pone `sessionMode='repaso-fallidas'` y `currentScreen='session'`. No-op si
    no hay falladas. NO llama saveState, NO reasigna this.state.
  - Guards `!this.sessionReviewOnly` alrededor del bloque
    `applyImmediateFailure`+`saveState`+`this.state=newState` en los dos
    call-sites de fallo (`applyResultToSession` rama else, `matchPickRight`
    primer fallo). El feedback visual y el push a `sessionResults` (runtime-only)
    quedan fuera del guard. En match, la captura de `matchFirstWrongPair` y el
    flip de `matchHadFailure` también quedan fuera (alimentan el flash visual).
  - `sessionAdvance`: al terminar en review-only NO llama `completeSession()`;
    vuelve al summary (`sessionReviewOnly=false; sessionMode=null;
    currentScreen='summary'`) sin recomputar.
  - `sessionContextLabel`: nuevo case `'repaso-fallidas'` →
    "Repaso de falladas (N ejercicios)".

- **Task 2 (`index.html`, commit deb8256):** botón secundario "Repetir las
  falladas" dentro de un `.button-row` junto a "Volver al home" en la pantalla
  summary, con `x-show` gated por el predicado canónico de falladas-con-slot
  (idéntico al de "ERRORES COMETIDOS") y `@click="startFailedReview()"`. Texto
  hardcoded en español (sin x-html, T-02-01).

- **Task 3 (`tests/screen-repeat-failed.test.js`, commit a537d4c):** 11 tests
  (behavioral + source-presence) que fijan el invariante review-only, incluido
  el central: `app.state` mantiene identidad tras `startFailedReview()` (cero
  escritura a localStorage).

## Verificación

- `node --test tests/*.test.js` → **649 pass / 0 fail** (el fail preexistente de
  genero-numero mencionado en el plan no aparece en el estado actual del corpus).
- Task 2 grep-checks: `startFailedReview()` + "Repetir las falladas" presentes;
  predicado canónico aparece 3× en index.html.

## Deviations from Plan

None - plan executed exactly as written.

## Manual (opcional, no bloqueante)

Servir con `npx serve`/Live Server, terminar una sesión con ≥1 fallo → aparece
"Repetir las falladas" → pulsarlo re-corre solo las falladas → fallar de nuevo
NO cambia racha/contadores en el home.

## Self-Check: PASSED

- Archivos: src/screens/app.js, index.html, tests/screen-repeat-failed.test.js — FOUND
- Commits: f38e07c, deb8256, a537d4c — FOUND
