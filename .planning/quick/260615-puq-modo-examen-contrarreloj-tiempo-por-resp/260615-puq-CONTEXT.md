# Quick Task 260615-puq: Modo examen contrarreloj (tiempo por respuesta) - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Modalidad OPCIONAL con límite de tiempo POR pregunta, para forzar "reacción". Si se agota el tiempo → cuenta como fallo. Temporizador visible. Tiempos por tipo de ejercicio, afinables por constante.

Aplica a la pantalla `session` (modos `repaso` y `test-completo`). NO a canciones. El examen normal (sin tiempo) sigue existiendo. Es UI/interacción + un flag de runtime; NO añade campos al estado persistido (no migración de schemaVersion).
</domain>

<decisions>
## Implementation Decisions

### 1. Activación: checkbox "Contrarreloj" en el picker
- Un checkbox en la pantalla `picker` (index.html ~L284 zona de checkboxes / antes del botón Empezar) ligado a un nuevo flag de runtime `pickerTimed` (boolean).
- Aplica al modo que se elija en el picker: `repaso` Y `test-completo`.
- El examen 1-clic de 1 categoría desde la tabla de home (`_launchExamen`) NO se cronometra (de momento).
- `startSession()` fija `this.sessionTimed = this.pickerTimed` al arrancar. `_launchExamen` fija `this.sessionTimed = false`. Reset de `pickerTimed` al abrir el picker (junto con el reset de categorías marcadas).

### 2. Timeout = fallo (reusa el call-site único)
- Al agotarse el tiempo: cuenta como FALLO igual que una respuesta incorrecta. Reutilizar `applyResultToSession(ex, false, userAnswer)` (call-site único, ~L1538): marca `sessionFeedback='incorrect'`, dispara `applyImmediateFailure` + `saveState`, persiste inFlightTest en test-completo, y muestra la respuesta correcta + explicación.
- Tras el timeout: el usuario pulsa "Siguiente" cuando quiera (flujo idéntico al de fallar). NO auto-avanza.
- `userAnswer` para el timeout: `null` (sin respuesta) o un marcador; verificar que el summary "Errores cometidos" lo renderiza sin romper (el path match ya pasa `null`). Mostrar un texto tipo "Tiempo agotado" en el feedback de timeout (discrecional, sin romper el bloque incorrect existente).

### 3. Display: barra que se vacía + número de segundos
- En la cabecera de `session` (junto al título de contexto `sessionContextLabel` y el progreso): una barra de progreso que se vacía + los segundos restantes (número).
- Visible SOLO cuando `sessionTimed && sessionFeedback === null` (mientras corre el tiempo de respuesta). Al responder o agotarse, se detiene/oculta.

### 4. Tiempos por tipo (constantes nombradas)
- multiple-choice: 5000 ms.
- match: 10000 ms.
- word-buttons: 2000 ms × nº de palabras de la frase (verificar el shape: nº = longitud del array de respuesta del payload word-buttons). Ej.: frase de 6 palabras → 12000 ms.
- Helper `sessionTimeLimitMs(ex)` que devuelve los ms según `ex.type`. Constantes nombradas (p.ej. `TIMED_LIMIT_MS_MULTIPLE_CHOICE`, `TIMED_LIMIT_MS_MATCH`, `TIMED_LIMIT_MS_PER_WORD`) fáciles de ajustar.

### Mecánica del temporizador (reusar el patrón handle + cancel existente)
- Nuevo estado: `sessionTimed` (boolean), `sessionTimerHandle` / `sessionTimerIntervalHandle` (o un único setInterval que decrementa y dispara el timeout a 0), `sessionTimeRemainingMs` (reactivo, para el display).
- `startSessionTimer()`: guard `sessionTimed && sessionFeedback === null && sessionCurrentExercise && sessionMode !== 'cancion'`; computa el límite con `sessionTimeLimitMs`, fija el remaining, y arranca el tick (interval ~100-250ms que actualiza `sessionTimeRemainingMs`; al llegar a 0 → `cancelSessionTimer()` + `onSessionTimeout()`).
- `onSessionTimeout()`: guard (sigue en feedback null y timed); `applyResultToSession(this.sessionCurrentExercise, false, null)`.
- `cancelSessionTimer()`: idempotente, limpia handle(s) e interval. Llamarlo: (a) al INICIO de `applyResultToSession` (responder detiene el cronómetro — idempotente con el self-call del timeout), y (b) en TODAS las transiciones donde ya se llama `cancelAutoAdvance()`/`cancelMatchFlash()` (sessionAdvance, restartRepaso, _launchExamen, startSession, startSong, returnToHome, etc.).
- `startSessionTimer()` se engancha al final de `initSubStateForExercise(ex)` (punto único por el que pasa cada ejercicio nuevo; ~L484/594/638/870 y en sessionAdvance), guardado por `sessionTimed` (los modos canción nunca lo activan).

### Claude's Discretion
- Nombres exactos de estado/constantes/métodos.
- Mecanismo de tick (un solo setInterval que decrementa y dispara timeout a 0 es lo más simple y evita drift display-vs-expiry; alternativamente setTimeout para expiry + interval para display).
- Estilo de la barra (Pico CSS; puede usar `<progress>` nativo de Pico o un div con width %). Texto "Tiempo agotado" en el feedback de timeout.
- Si conviene pausar/cancelar el timer cuando se abre un `confirmDialog` (p.ej. confirmación de abandono de repaso) — recomendado cancelarlo.
- `sessionTimed` es runtime-only: NO se persiste en `inFlightTest`. Consecuencia aceptada v1: reanudar un test-completo interrumpido lo reanuda SIN cronómetro. Documentarlo en el SUMMARY.
</decisions>

<specifics>
## Specific Ideas

- `src/screens/app.js`:
  - `applyResultToSession` (~L1538) — call-site único de resultado; reusar para timeout; añadir `cancelSessionTimer()` al inicio.
  - `initSubStateForExercise` — enganche de `startSessionTimer()`.
  - `startSession` (~L834), `_launchExamen` (~L434), `restartRepaso`, `returnToHome`, `startSong` — fijar `sessionTimed` y añadir `cancelSessionTimer()` donde van los otros cancel.
  - Patrón `cancelAutoAdvance`/`sessionAutoAdvanceHandle` (~L1620) como plantilla del handle+cancel.
  - Estado del picker: `pickerCheckedCategoryIds`, `pickerMode` — añadir `pickerTimed`; resetear al abrir picker.
- `index.html`:
  - picker (~L254-300): checkbox "Contrarreloj" antes del botón Empezar (`x-model="pickerTimed"`).
  - session header (~L316-319, donde están `sessionContextLabel` y `sessionProgressLabel`): barra + número (`x-show="sessionTimed && sessionFeedback === null"`).
  - bloque de feedback incorrect (~L355-374 MC y equivalentes) — opcional: texto "Tiempo agotado".
- `styles.css`: estilo de la barra del cronómetro (urgencia; Pico vars).
- Tests: factorizar `sessionTimeLimitMs(ex)` como helper PURO y testearlo (5000/10000/2000×nwords por tipo). El resto (timers) es difícil de unit-test sin Alpine → tests source-assert del markup/handlers como hacen los tests de screen. Correr con `node --test tests/*.test.js` (glob obligatorio Node 22.20). Hay 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) — NO tocar; no introducir fallos nuevos.
</specifics>

<canonical_refs>
## Canonical References

Todo `.planning/todos/pending/2026-06-15-modo-examen-contrarreloj-tiempo-por-respuesta.md`. Sin specs externas.
</canonical_refs>
