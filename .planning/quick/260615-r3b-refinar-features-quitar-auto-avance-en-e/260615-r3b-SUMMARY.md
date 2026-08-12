---
phase: quick-260615-r3b
plan: 01
subsystem: motor de sesión + dominio de progreso + UI home
tags: [auto-avance, contrarreloj, contador-vecesFallada, UAT-refinements]
status: complete
prior_status: shipped
requires:
  - applySessionResult / applyImmediateFailure (src/domain/progress.js)
  - applyResultToSession / _launchExamen (src/screens/app.js)
  - pantalla home + session (index.html)
provides:
  - "Contador vecesFallada por-sesión (no por-ejercicio)"
  - "Auto-avance al acertar gated a modo canción"
  - "Flag runtime homeExamTimed + toggle Contrarreloj en home"
affects:
  - src/domain/progress.js
  - src/screens/app.js
  - index.html
tech-stack:
  added: []
  patterns:
    - "Contador de fallos materializado al cerrar la sesión (applySessionResult FAIL-WINS), una vez por categoría por sesión"
    - "Auto-avance dispatchado por sessionMode (solo canción)"
    - "Toggle runtime-only no persistido (espejo de pickerTimed/sessionTimed)"
key-files:
  created: []
  modified:
    - src/domain/progress.js
    - src/screens/app.js
    - index.html
    - tests/domain-progress.test.js
    - tests/exercise-types.test.js
    - tests/screen-timer-mode.test.js
decisions:
  - "vecesFallada cuenta por sesión/examen fallado (no por ejercicio); el +1 vive en applySessionResult FAIL-WINS"
  - "applyImmediateFailure deja de tocar vecesFallada; helper hadProgress eliminado por quedar sin uso"
  - "Auto-avance al acertar SOLO en canción (songAdvance 600ms); ejercicios avanzan manualmente con Siguiente"
  - "Siguiente visible en los 3 tipos de ejercicio siempre que sessionFeedback !== null"
  - "homeExamTimed runtime-only (no persistido); _launchExamen hereda el toggle"
metrics:
  duration: ~25min
  tasks: 3
  files-changed: 6
  tests-net: +2 (430 → 432 pass)
  completed: 2026-06-15
---

# Quick Task 260615-r3b: Refinamientos (auto-avance, contrarreloj en tabla, contador por examen) Summary

Tres refinamientos de UAT honrados verbatim del CONTEXT: el contador `vecesFallada` de categoría pasa a contar por sesión/examen fallado (una vez por categoría por sesión) en `applySessionResult`; el auto-avance al acertar queda gated a modo canción (los ejercicios avanzan manualmente con "Siguiente"); y un toggle "Contrarreloj ⏱" runtime en home hace que el examen de 1 clic respete el cronómetro.

## What Was Built

### CAMBIO 1 — Quitar auto-avance al acertar (solo ejercicios)
- `applyResultToSession` (rama acierto): el `setTimeout` de auto-avance se programa SOLO cuando `this.sessionMode === 'cancion'` (vía `songAdvance`, `SESSION_AUTO_ADVANCE_MS` = 600ms — LINK-04). En ejercicios no se programa nada.
- Constante `SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS` (1500ms) eliminada (sin uso). `SESSION_AUTO_ADVANCE_MS` (600ms) conservada para canción.
- `index.html`: el botón "Siguiente" de los 3 tipos (multi-choice, word-buttons, match) pasa a `x-show="sessionFeedback !== null"` (visible en acierto o fallo). "¿Por qué?" sin cambios; el "Siguiente" de canción (`sessionFeedback === 'incorrect'` + `songAdvance`) intacto.

### CAMBIO 2 — Toggle "Contrarreloj" en home
- Flag runtime `homeExamTimed: false` añadido junto a `pickerTimed`/`sessionTimed` (NO persistido).
- `_launchExamen`: `this.sessionTimed = false;` → `this.sessionTimed = this.homeExamTimed;`. `startExamen`/`startSession`/`resetSession` sin cambios.
- `index.html`: toggle `<label>` Pico (`role="switch"`, `x-model="homeExamTimed"`, texto "Contrarreloj ⏱") entre la button-row y la `<figure>` de la tabla.

### CAMBIO 3 — Contador vecesFallada por-sesión
- `applySessionResult` rama FAIL-WINS: `cat.vecesFallada = (cat.vecesFallada ?? 0) + 1;`. El bucle corre una vez por categoría tocada y `failedCategoryIds` es por-sesión → +1 una vez por categoría por sesión (2 ejercicios fallados de la misma cat → +1, no +2).
- `applyImmediateFailure`: retirado el incremento (`wasProgress`/`nextVecesFallada`/`vecesFallada: nextVecesFallada`); el reset cascada (status/clearedExerciseIds/streakDays/becameHechaAt/becameDominadaAt/lastPracticedDate) intacto.
- Helper privado `hadProgress` eliminado (0 usos). JSDoc de `applyImmediateFailure` actualizado a la nueva semántica.
- `completeSong` (contador de canción) SIN cambios.

## Tests
- `tests/domain-progress.test.js`: suite del contador re-escrita a semántica por-sesión (sube a 1, +1 no +2 con 2 fallos de la misma cat, sesión limpia no cambia, acumulación 2→3, dos sesiones = +2, applyImmediateFailure preserva sin +1, immediate+session = 1). Test `idempotencia integral` invertido: Path A y Path B convergen íntegros con `vecesFallada=1` (eliminada la lógica `stripVF`/divergencia).
- `tests/exercise-types.test.js`: test hr0 re-escrito (auto-avance gated a canción, constante 1500 eliminada, atajo `e` intacto); tests source-assert nuevos (3 Siguiente con `sessionFeedback !== null` + canción intacta; toggle `homeExamTimed`).
- `tests/screen-timer-mode.test.js`: test de `_launchExamen` actualizado a `sessionTimed = this.homeExamTimed`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Test stale en screen-timer-mode.test.js**
- **Found during:** Tarea 2 / verificación de Tarea 3.
- **Issue:** `tests/screen-timer-mode.test.js:169` asertaba `_launchExamen fuerza sessionTimed=false` (semántica puq), contradicho directamente por CAMBIO 2. No estaba en la lista explícita de tests a tocar del plan, pero asertaba la línea exacta que CAMBIO 2 modifica → habría sido un fallo nuevo.
- **Fix:** Actualizado el test a `sessionTimed = this.homeExamTimed` (CAMBIO 2). Es la actualización mínima exigida por el cambio canónico.
- **Files modified:** tests/screen-timer-mode.test.js
- **Commit:** 36fd61c

## Verification

- `node --test tests/*.test.js` → **432 pass / 1 fail**. El único fallo es el PREEXISTENTE ajeno (`content/exercises/genero-numero.json` "12/12 ejercicios con explanation válida" → es 12→13; cuenta también en "Categorías con explanation coverage Phase 7.1+"). **0 fallos nuevos.** Baseline previo: 430 pass / 1 fail → +2 tests netos.
- `grep -c "hadProgress" src/domain/progress.js` → 0
- `grep -c "SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS" src/screens/app.js` → 0
- `grep -c 'x-show="sessionFeedback !== null"' index.html` → 3
- `grep -c 'x-model="homeExamTimed"' index.html` → 1
- Contador de canción (`completeSong`) y migración/roundtrip v10 sin tocar (tests screen-canciones/backup/data-storage verdes).

## Commits

- `6acc69c` refactor(quick-260615-r3b-01): contador vecesFallada por-sesión en applySessionResult
- `08805fa` feat(quick-260615-r3b-02): quitar auto-avance en ejercicios + flag homeExamTimed
- `36fd61c` feat(quick-260615-r3b-03): toggle Contrarreloj + Siguiente siempre con feedback + tests

## Known Stubs

Ninguno.

## Self-Check: PASSED

- SUMMARY.md presente.
- Commits 6acc69c, 08805fa, 36fd61c verificados en git log.
