---
phase: quick-260615-puq
plan: 01
subsystem: screens/session
tags: [feature, ui, interaction, runtime-state, timer, todo-4]
requires:
  - applyResultToSession (call-site único D-54)
  - initSubStateForExercise (punto único por-ejercicio)
  - patrón cancelAutoAdvance/cancelMatchFlash (handle+cancel idempotente)
provides:
  - sessionTimeLimitMs(ex) — helper PURO de módulo (export) + proxy de instancia
  - modo contrarreloj runtime (pickerTimed/sessionTimed + cronómetro de respuesta)
affects:
  - src/screens/app.js
  - index.html
  - styles.css
  - tests/screen-timer-mode.test.js
tech-stack:
  added: []
  patterns:
    - "handle+cancel idempotente (espejo de cancelAutoAdvance) para un setInterval de tick"
    - "helper PURO de módulo exportado + proxy de instancia para el template Alpine"
    - "estado runtime-only (NO persistido en inFlightTest)"
key-files:
  created:
    - tests/screen-timer-mode.test.js
  modified:
    - src/screens/app.js
    - index.html
    - styles.css
decisions:
  - "Un único setInterval (~100ms) que decrementa y dispara timeout a 0 — evita drift display-vs-expiry"
  - "sessionTimed runtime-only: NO se persiste en inFlightTest (consecuencia aceptada v1)"
  - "Timeout = fallo reusando applyResultToSession(ex,false,null); Siguiente manual (sin auto-avance)"
  - "Examen 1-clic de home NUNCA cronometrado; checkbox solo en picker repaso/test-completo"
metrics:
  duration: ~15 min
  completed: 2026-06-15
  tasks: 3
  files: 4
  commits: 3
  tests_delta: "+20 (411→431 total; 410→430 pass; 1 fail preexistente ajeno)"
status: complete
---

# Quick Task 260615-puq: Modo examen contrarreloj (tiempo por respuesta) Summary

Modo contrarreloj OPCIONAL con límite de tiempo POR pregunta en la pantalla `session` (repaso y test-completo): un checkbox "Contrarreloj" en el picker arranca la sesión cronometrada, una barra que se vacía + segundos cuentan atrás, y agotar el tiempo cuenta como fallo reusando el call-site único de resultado — con cero fugas de timers.

## Qué se construyó

- **Helper PURO `sessionTimeLimitMs(ex)`** (export de módulo + proxy de instancia para el template): 5000ms multiple-choice, 10000ms match, 2000ms × `payload.answer.length` word-buttons (distractors NO cuentan), default defensivo para tipo desconocido. Constantes nombradas `TIMED_LIMIT_MS_MULTIPLE_CHOICE/MATCH/PER_WORD` ajustables.
- **Mecánica del cronómetro** (espejo del patrón `cancelAutoAdvance`):
  - `startSessionTimer()` — guard estricto (`sessionTimed && sessionFeedback===null && sessionCurrentExercise && sessionMode!=='cancion'`); un único `setInterval(~100ms)` que decrementa `sessionTimeRemainingMs` y al llegar a ≤0 cancela + dispara `onSessionTimeout()`. Llama `cancelSessionTimer()` antes de arrancar (idempotencia).
  - `onSessionTimeout()` — guard (no dispara si ya hay feedback); `applyResultToSession(ex, false, null)` → misma cascada D-54 que un fallo; "Siguiente" manual.
  - `cancelSessionTimer()` — idempotente, `clearInterval` + handle a null + remaining a 0.
- **Lifecycle del flag** simétrico: `sessionTimed = this.pickerTimed` en `startSession`; `= false` en `_launchExamen` (examen 1-clic nunca cronometrado); `= false` en `resetSession` (chokepoint de volver a home). `pickerTimed` se resetea a false en `openPicker`.
- **Enganche por-ejercicio**: `startSessionTimer()` al final de `initSubStateForExercise` (punto único por el que pasa cada ejercicio nuevo).
- **Cero fugas**: `cancelSessionTimer()` al inicio de `applyResultToSession` (responder detiene el cronómetro) + en `destroy`, `_launchExamen`, `startSong`, `resetSession`, `restartRepaso`, `sessionAdvance`, `songAdvance`, `startSession`.
- **Cierre del hueco S-2 (WARNING 2)**: `startSession` ahora llama `cancelMatchFlash()` Y `cancelSessionTimer()` (antes solo `cancelAutoAdvance()`).
- **UI**: checkbox `x-model="pickerTimed"` en el picker (desmarcado al abrir); en el header de session, `<progress class="session-timer-bar">` que se vacía + segundos (`Math.ceil(sessionTimeRemainingMs/1000)+'s'`) bajo `x-show="sessionTimed && sessionFeedback === null"`. Estilo en `styles.css` con vars de Pico (tono de urgencia).

## Decisiones de diseño

- **Un único `setInterval`** que decrementa y dispara el timeout al llegar a 0 — el mecanismo más simple, sin drift display-vs-expiry.
- **`sessionTimed` runtime-only**: NO se persiste en `inFlightTest` (no se tocó `persistInFlightTest`). Ver "Consecuencia aceptada v1" abajo.
- **Timeout = fallo** vía el call-site único `applyResultToSession(ex, false, null)` — reusa la cascada D-54, el bloque de feedback `incorrect` y la persistencia, sin un segundo call-site. No auto-avanza (botón "Siguiente" manual).
- **`sessionTimeLimitMs` puro + proxy de instancia**: el helper de módulo es testeable sin Alpine; un método-proxy en el factory lo expone al template para el `:max` del `<progress>`. La llamada interna en `startSessionTimer` resuelve a la función de módulo (scope léxico) — sin conflicto.

## Consecuencia aceptada v1 (documentada)

`sessionTimed` es **runtime-only** y NO se persiste en `inFlightTest`. Reanudar un test-completo interrumpido (recargar pestaña a medias) lo reanuda **SIN cronómetro**, aunque se hubiera iniciado en modo contrarreloj. Aceptado para v1 (sin migración de schemaVersion, sin campos persistidos nuevos).

## Deviations from Plan

None — plan ejecutado exactamente como fue escrito. (El proxy de instancia `sessionTimeLimitMs` ya estaba contemplado en Task 2 del plan como "valor reactivo a discreción" para el `:max` del `<progress>`.)

## Verification

- `node --test tests/screen-timer-mode.test.js` → 20/20 pass (7 behaviorales del helper puro + 13 source-asserts del cableado/markup).
- `node --test tests/*.test.js` → **431 tests / 430 pass / 1 fail**. El único fallo es el PREEXISTENTE ajeno (`genero-numero` 12→13 explanation coverage), confirmado no introducido por este trabajo. Baseline era 411/410/1 → **+20 tests, +20 pass, 0 fallos nuevos**.
- `node --check src/screens/app.js` → OK.
- Invariante anti-fugas: el único timer nuevo es el `setInterval` de `sessionTimerIntervalHandle` (app.js L1750), limpiado en `cancelSessionTimer` (L1783). Cero `setInterval`/`setTimeout` huérfano.

## Self-Check: PASSED

- FOUND: tests/screen-timer-mode.test.js
- FOUND: commit 2e15653 (Task 1)
- FOUND: commit f974c1c (Task 2)
- FOUND: commit 106e4f3 (Task 3)
