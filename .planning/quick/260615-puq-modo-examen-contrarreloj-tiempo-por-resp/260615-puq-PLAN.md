---
phase: quick-260615-puq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/app.js
  - index.html
  - styles.css
  - tests/screen-timer-mode.test.js
autonomous: true
requirements:
  - TODO-04  # Modo examen contrarreloj — tiempo por respuesta (feature todo #4)

must_haves:
  truths:
    - "El picker de Repaso y de Test completo muestra un checkbox 'Contrarreloj' ligado a pickerTimed (boolean), desmarcado al abrir el picker."
    - "Al pulsar Empezar con el checkbox marcado, la sesión arranca cronometrada (sessionTimed=true); sin marcar, arranca normal."
    - "El examen 1-clic desde la tabla de home (_launchExamen) NUNCA se cronometra (sessionTimed=false)."
    - "Mientras corre el tiempo de respuesta (sessionTimed && sessionFeedback===null) se ve una barra que se vacía + el número de segundos restantes; al responder o agotarse, desaparece."
    - "Si se agota el tiempo, el ejercicio cuenta como FALLO exactamente igual que una respuesta incorrecta (mismo bloque de feedback 'incorrect', misma cascada D-54), y el usuario avanza con 'Siguiente' cuando quiera (no auto-avanza)."
    - "Los límites son 5000ms multiple-choice, 10000ms match, 2000ms × nº de palabras (payload.answer.length) word-buttons, vía un helper PURO sessionTimeLimitMs(ex) con constantes nombradas."
    - "El cronómetro se cancela al responder, al avanzar, al salir al home, al reiniciar repaso, al lanzar examen/canción, y al desmontar la pantalla — cero setInterval/setTimeout huérfano."
    - "El flag de sesión es simétrico: sessionTimed=false tras volver al home (resetSession lo resetea junto al cancel del timer)."
    - "El modo canción nunca activa el cronómetro."
    - "node --test tests/*.test.js sigue pasando (sin fallos nuevos; el único fallo preexistente genero-numero 12→13 permanece)."
  artifacts:
    - path: "src/screens/app.js"
      provides: "Helper PURO sessionTimeLimitMs(ex), constantes de límite, estado runtime sessionTimed/pickerTimed/handles/remaining, startSessionTimer/onSessionTimeout/cancelSessionTimer, enganches en initSubStateForExercise + todas las transiciones."
      contains: "sessionTimeLimitMs"
    - path: "index.html"
      provides: "Checkbox Contrarreloj en el picker (x-model pickerTimed) + barra/número del cronómetro en el header de session (x-show sessionTimed && sessionFeedback===null)."
      contains: "pickerTimed"
    - path: "styles.css"
      provides: "Estilo de la barra del cronómetro de respuesta."
      contains: "session-timer"
    - path: "tests/screen-timer-mode.test.js"
      provides: "Tests del helper PURO sessionTimeLimitMs (5000/10000/2000×nwords) — creados en Task 1 — + source-asserts del cableado de cancelación/enganche y del markup — añadidos en Task 3."
      contains: "sessionTimeLimitMs"
  key_links:
    - from: "index.html picker"
      to: "pickerTimed"
      via: "x-model en el checkbox Contrarreloj"
      pattern: "x-model=\"pickerTimed\""
    - from: "startSession"
      to: "sessionTimed"
      via: "this.sessionTimed = this.pickerTimed"
      pattern: "sessionTimed\\s*=\\s*this\\.pickerTimed"
    - from: "initSubStateForExercise"
      to: "startSessionTimer"
      via: "llamada al final del init por-ejercicio, guardada por sessionTimed"
      pattern: "startSessionTimer\\(\\)"
    - from: "onSessionTimeout"
      to: "applyResultToSession"
      via: "applyResultToSession(ex, false, null) al expirar"
      pattern: "applyResultToSession\\(this\\.sessionCurrentExercise,\\s*false,\\s*null\\)"
    - from: "applyResultToSession"
      to: "cancelSessionTimer"
      via: "cancelSessionTimer() al inicio (responder detiene el cronómetro)"
      pattern: "cancelSessionTimer\\(\\)"
---

<objective>
Añadir un modo de examen contrarreloj OPCIONAL con límite de tiempo POR pregunta a la pantalla `session` (modos `repaso` y `test-completo`). Si el tiempo se agota → cuenta como fallo (reusa el call-site único de resultado). Temporizador visible (barra que se vacía + segundos). Tiempos por tipo afinables por constante. Feature todo #4.

Purpose: forzar "reacción" — el alumno debe responder rápido o pierde el progreso de la categoría (en línea con el core value "que el sistema te obligue a no olvidar").

Output: estado runtime + helper PURO de límite + mecánica handle/cancel del cronómetro en `app.js`; checkbox en el picker + barra/número en el header de session en `index.html`; estilo en `styles.css`; tests del helper puro + source-asserts del cableado.

Es PURA UI/interacción + un flag de runtime. NO añade campos al estado persistido. NO migración de schemaVersion. NO toca scoring/racha más allá de reusar `applyResultToSession`. `sessionTimed` es runtime-only: NO se persiste en `inFlightTest` (consecuencia aceptada v1: reanudar un test interrumpido lo reanuda SIN cronómetro — documentar en el SUMMARY).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260615-puq-modo-examen-contrarreloj-tiempo-por-resp/260615-puq-CONTEXT.md
@CLAUDE.md
@.planning/STATE.md

<interfaces>
<!-- Hechos verificados contra el código real (2026-06-15). El executor DEBE re-confirmarlos antes de editar; NO inventar líneas. -->

Estado runtime y constantes ya existentes (patrón a imitar) en src/screens/app.js:
- Constantes nombradas al top del módulo (~L72-73):
    const SESSION_AUTO_ADVANCE_MS = 600;
    const SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS = 1500;
  → Añadir aquí TIMED_LIMIT_MS_MULTIPLE_CHOICE/MATCH/PER_WORD (nombres exactos a discreción).
- Props de sesión declaradas en el factory return (~L107-138): pickerMode, pickerCheckedCategoryIds,
  sessionMode, sessionFeedback, sessionAutoAdvanceHandle, etc.
  → Añadir pickerTimed, sessionTimed, y los handles/remaining del cronómetro junto a estas.

Patrón handle + cancel a IMITAR (idempotente) — cancelAutoAdvance() ~L1620:
    cancelAutoAdvance() {
      if (this.sessionAutoAdvanceHandle !== null) {
        clearTimeout(this.sessionAutoAdvanceHandle);
        this.sessionAutoAdvanceHandle = null;
      }
    }
cancelMatchFlash() ~L1994 sigue la misma forma (clearTimeout + null + reset de su idx).

Call-site único de resultado — applyResultToSession(ex, correct, userAnswer) ~L1520:
  fija sessionFeedback; pushea a sessionResults; en fallo corre applyImmediateFailure+saveState (D-54);
  persiste inFlightTest si sessionMode==='test-completo'. El path match YA pasa objetos/null como userAnswer.

Punto único por ejercicio — initSubStateForExercise(exercise) ~L1924:
  limpia sub-estados, llama this.cancelMatchFlash() (~L1943), y dispatcha por exercise.type.
  Invocado desde: _launchExamen (~L484), startSession (~L870), restartRepaso (~L1036),
  sessionAdvance (~L1606), y los flujos de canción songAdvance/startSong (~L594/638).

Sitios con cancelAutoAdvance()/cancelMatchFlash() (donde añadir cancelSessionTimer()):
  destroy (~L313), _launchExamen (~L438), startSong (~L532), resetSession (~L734),
  restartRepaso (~L956), sessionAdvance (~L1589), songAdvance (~L628), e initSubStateForExercise (~L1943).
  NOTA: resetSession() es el chokepoint de "volver al home" (requestReturnToHome ~L701 lo llama en AMBAS ramas).
  NOTA: startSession (~L855) llama cancelAutoAdvance() pero NO cancelMatchFlash() (hueco preexistente S-2).

Payload por tipo (verificado en src/exercise-types/ y src/data/content-loader.js):
  - multiple-choice: payload.options (array), payload.correctIndex
  - match:           payload.pairs (array de [left,right])
  - word-buttons:    payload.answer (array de tokens) → nº de palabras = payload.answer.length
                     (+ payload.distractors opcional, NO cuenta para el límite)

Picker (index.html ~L280-302): fieldset de checkboxes por categoría + botón Empezar (@click=startSession)
  + aviso test-completo. requestReturnToHome cableado en "← Volver al home".
Session header (index.html ~L324-329): <h2 class="session-context"> + <header x-text="sessionProgressLabel">.
  El bloque feedback 'incorrect' multiple-choice está ~L364-378 (hay equivalentes para los otros tipos más abajo).
openPicker(mode) ~L335: resetea pickerMode + pickerCheckedCategoryIds=[] (D-34) en sus 3 salidas (rama
  confirm + rama directa) → añadir pickerTimed=false en cada reset.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Helper PURO sessionTimeLimitMs + estado runtime + mecánica del cronómetro (RED→GREEN: crea el test)</name>
  <files>src/screens/app.js, tests/screen-timer-mode.test.js</files>
  <behavior>
    - sessionTimeLimitMs({type:'multiple-choice'}) === 5000 (TIMED_LIMIT_MS_MULTIPLE_CHOICE).
    - sessionTimeLimitMs({type:'match'}) === 10000 (TIMED_LIMIT_MS_MATCH).
    - sessionTimeLimitMs({type:'word-buttons', payload:{answer:['a','b','c']}}) === 6000 (2000×3).
    - sessionTimeLimitMs word-buttons de 6 palabras === 12000; de 1 palabra === 2000.
    - sessionTimeLimitMs es PURO: no lee this.*, no toca timers, sólo ex.type/ex.payload.answer.length.
  </behavior>
  <action>
    Esta es una tarea TDD: PRIMERO crea el test del helper puro (RED), LUEGO implementa app.js para que pase (GREEN). El test de esta tarea cubre SOLO el helper PURO; los source-asserts del cableado/markup se añaden a este MISMO archivo en la Task 3.

    A) Crear tests/screen-timer-mode.test.js (RED) siguiendo el patrón de tests/screen-context-label.test.js: tests BEHAVIORALES del helper PURO sessionTimeLimitMs.
       - Instanciar el factory appShell (o llamar el helper como función de módulo si se exporta) y assertear: multiple-choice → 5000; match → 10000; word-buttons con payload.answer de 3 tokens → 6000, de 6 → 12000, de 1 → 2000.
       - Si el helper es método del factory, construir un objeto mínimo o llamar el método sobre un `this` mínimo; preferible que el helper NO dependa de this para poder llamarlo directo. Verificar que devuelve los ms esperados por tipo.
       - Correr con `node --test tests/screen-timer-mode.test.js`: DEBE fallar inicialmente (el helper aún no existe) → confirma RED.

    Luego implementar el modo contrarreloj como interacción runtime, reusando estrictamente el patrón handle+cancel existente (GREEN):

    1) Constantes: al top del módulo (junto a SESSION_AUTO_ADVANCE_MS ~L72) declarar TIMED_LIMIT_MS_MULTIPLE_CHOICE=5000, TIMED_LIMIT_MS_MATCH=10000, TIMED_LIMIT_MS_PER_WORD=2000 (nombres exactos a discreción, pero nombrados y fáciles de ajustar, per CONTEXT decisión 4).

    2) Helper PURO sessionTimeLimitMs(ex): método (o función de módulo) que devuelve ms según ex.type — multiple-choice→constante MC, match→constante MATCH, word-buttons→PER_WORD × (ex.payload.answer?.length ?? 0). Verificar el shape EXACTO contra src/exercise-types/word-buttons.js: nº de palabras = longitud de payload.answer (NO incluir distractors). Default defensivo (p.ej. devolver la constante MC o 0) para type desconocido. DEBE ser puro (testeable sin Alpine): no leer this.* ni tocar timers. Si se declara como método del factory, que su cuerpo no dependa de estado de instancia para que el test pueda llamarlo sobre un objeto factory mínimo.

    3) Estado runtime (declarar en el factory return junto a sessionFeedback/sessionAutoAdvanceHandle ~L130): pickerTimed=false (flag del picker), sessionTimed=false (flag activo de la sesión), el/los handle(s) del cronómetro a null, y sessionTimeRemainingMs=0 (reactivo, para el display). NINGUNO se persiste — runtime-only.

    4) startSessionTimer(): guard estricto — solo arranca si this.sessionTimed && this.sessionFeedback===null && this.sessionCurrentExercise && this.sessionMode!=='cancion'. Computa el límite con sessionTimeLimitMs(this.sessionCurrentExercise), fija sessionTimeRemainingMs al límite, y arranca un tick (mecanismo a discreción; recomendado: un único setInterval ~100-250ms que decrementa sessionTimeRemainingMs y, al llegar a ≤0, llama cancelSessionTimer() seguido de onSessionTimeout() — un solo handle evita drift display-vs-expiry). Antes de arrancar, llamar cancelSessionTimer() para idempotencia (nunca dejar dos intervals).

    5) onSessionTimeout(): guard (sigue this.sessionTimed && this.sessionFeedback===null); cancelSessionTimer(); luego applyResultToSession(this.sessionCurrentExercise, false, null). El timeout NO debe disparar si ya hay feedback. NO auto-avanza (el flujo de fallo deja el botón "Siguiente" manual — per CONTEXT decisión 2).

    6) cancelSessionTimer(): idempotente — limpia el/los handle(s) (clearInterval/clearTimeout) y los pone a null; opcional poner sessionTimeRemainingMs=0. Forma EXACTA del patrón cancelAutoAdvance (~L1620): guard de null antes de clear. Llamable múltiples veces sin error (incluido el self-call desde onSessionTimeout y el responder).

    7) Enganche por-ejercicio: al FINAL de initSubStateForExercise(ex) (~L1986, tras el dispatch por tipo) añadir this.startSessionTimer(). El guard interno de startSessionTimer (sessionTimed + canción excluida) garantiza que no arranca cuando no toca. Verificar que initSubStateForExercise es el ÚNICO punto por el que pasa cada ejercicio nuevo en session (también lo usan los flujos de canción, pero el guard sessionMode!=='cancion' / sessionTimed=false los excluye).

    8) cancelSessionTimer() en TODAS las transiciones donde ya se llama cancelAutoAdvance()/cancelMatchFlash(): destroy (~L313), _launchExamen (~L438), startSong (~L532), resetSession (~L734), restartRepaso (~L956), sessionAdvance (~L1589), songAdvance (~L628). CRÍTICO: añadir cancelSessionTimer() AL INICIO de applyResultToSession (~L1521, antes de fijar sessionFeedback) — responder detiene el cronómetro; es idempotente con el self-call del timeout. Recomendado (CONTEXT discrecional): cancelar el cronómetro también al abrir un confirmDialog que abandona la sesión — requestReturnToHome ya delega en resetSession en su rama directa, y la rama 'repaso' muestra confirm; añadir cancelSessionTimer() en el onConfirm de esa rama o confiar en que resetSession (llamado en el onConfirm) lo limpia — verificar requestReturnToHome ~L701 y dejarlo cubierto.

    9) Fijar el flag activo: en startSession (~L834) añadir this.sessionTimed = this.pickerTimed; en _launchExamen (~L434) añadir this.sessionTimed = false (examen 1-clic NUNCA cronometrado, per CONTEXT decisión 1). NO persistir sessionTimed en inFlightTest (no tocar persistInFlightTest).

    10) Reset del flag del picker: en openPicker(mode) (~L335) poner this.pickerTimed = false en CADA punto donde ya se resetea pickerCheckedCategoryIds=[] (la rama del confirm onConfirm y la rama directa final).

    11) Reset SIMÉTRICO del flag de sesión (WARNING 1): en resetSession() (~L734) añadir this.sessionTimed = false; JUNTO al cancelSessionTimer() y a los otros resets de flags de sesión. resetSession es el chokepoint de "volver al home" (requestReturnToHome lo llama en ambas ramas); sin este reset, sessionTimed quedaría true tras una sesión cronometrada (riesgo latente). El lifecycle del flag debe ser explícito y simétrico: se enciende en startSession (=pickerTimed) / se fuerza false en _launchExamen / se apaga en resetSession.

    12) Cerrar hueco preexistente S-2 (WARNING 2): en startSession (~L855), donde ya se llama cancelAutoAdvance() pero NO cancelMatchFlash(), añadir AMBOS: cancelMatchFlash() (cierra el hueco preexistente de match-flash huérfano al arrancar sesión) Y cancelSessionTimer() (el nuevo). Aprovechamos que el plan ya toca este call-site.

    Pureza de capa (D-02): setInterval/clearInterval/setTimeout/clearTimeout son globales permitidos (igual que cancelAutoAdvance). NO tocar document/window/innerHTML.
  </action>
  <verify>
    <automated>node --test tests/screen-timer-mode.test.js</automated>
  </verify>
  <done>tests/screen-timer-mode.test.js existe y sus tests del helper puro PASAN (5000/10000/2000×nwords); sessionTimeLimitMs es puro; existen startSessionTimer/onSessionTimeout/cancelSessionTimer con guards correctos; cancelSessionTimer aparece en todas las transiciones listadas + al inicio de applyResultToSession; startSessionTimer al final de initSubStateForExercise; sessionTimed se fija en startSession (=pickerTimed), se fuerza false en _launchExamen, y se resetea a false en resetSession; startSession llama cancelMatchFlash() Y cancelSessionTimer(); pickerTimed se resetea en openPicker. Sin fallos nuevos en la suite.</done>
</task>

<task type="auto">
  <name>Task 2: UI — checkbox Contrarreloj en el picker + barra/número del cronómetro en session</name>
  <files>index.html, styles.css</files>
  <action>
    Cablear la UI del modo contrarreloj contra el estado del Task 1. NO añadir lógica de grading ni timers en el HTML (la mecánica vive en app.js).

    1) Checkbox en el picker (index.html, dentro del <article> del picker, antes del botón Empezar ~L293-297, después del fieldset de categorías ~L291): añadir un <label> con <input type="checkbox" x-model="pickerTimed"> y texto "Contrarreloj" (más una breve aclaración opcional tipo "(tiempo por respuesta)"). Aplica tanto a repaso como a test-completo (el mismo picker sirve ambos modos vía pickerMode). Estilo Pico nativo (label+checkbox como el resto del fieldset).

    2) Display en el header de session (index.html ~L327-329, junto a <h2 class="session-context"> y <header x-text="sessionProgressLabel">): añadir un bloque con x-show="sessionTimed && sessionFeedback === null" que muestre (a) una barra que se vacía y (b) el número de segundos restantes. Para la barra usar <progress> nativo de Pico (max = sessionTimeLimitMs del ejercicio actual o un valor reactivo; value = sessionTimeRemainingMs) O un <div class="session-timer-bar"> con :style width %; a discreción. Para el número, x-text con Math.ceil(sessionTimeRemainingMs/1000) y sufijo "s". Marcarlo con una clase (p.ej. class="session-timer") para el CSS y para el source-assert del test. El bloque NO debe romper cuando sessionTimed=false (x-show lo oculta; cero coste de render del progress fuera de tiempo).

    3) (Opcional, CONTEXT decisión 2 discrecional) Texto "Tiempo agotado" en el feedback de timeout: dado que el timeout reusa applyResultToSession(ex,false,null), el bloque incorrect existente (~L364-378 MC y equivalentes) ya se muestra. Si se añade el texto, hacerlo SIN romper el bloque incorrect existente (p.ej. una línea condicionada a un marcador de timeout o simplemente reusar el bloque tal cual). Mantenerlo mínimo; no es bloqueante.

    4) styles.css: estilo de la barra del cronómetro (clase session-timer / session-timer-bar) usando vars de Pico, con sensación de urgencia (p.ej. color que vira con poco tiempo es opcional/discrecional). Coherente con el tono de .session-context / .session-explanation (~L431-471). No introducir clases globales que afecten a otras pantallas.

    Verificar contra el código real: el header de session está bajo el x-if "currentScreen === 'session' && sessionCurrentExercise", así que sessionCurrentExercise existe cuando el bloque del cronómetro renderiza.
  </action>
  <verify>
    <automated>node --check src/screens/app.js && grep -c 'x-model="pickerTimed"' index.html</automated>
  </verify>
  <done>El picker tiene un checkbox x-model="pickerTimed"; el header de session tiene la barra + número con x-show="sessionTimed && sessionFeedback === null" y clase session-timer; styles.css define el estilo de la barra. La página carga sin errores de consola (verificación visual diferida — no bloqueante para tests). (El test completo que cubre este markup se corre en Task 3.)</done>
</task>

<task type="auto">
  <name>Task 3: Extender tests/screen-timer-mode.test.js con source-asserts del cableado y del markup</name>
  <files>tests/screen-timer-mode.test.js</files>
  <action>
    EXTENDER el archivo tests/screen-timer-mode.test.js ya creado en Task 1 (que ya contiene los tests behaviorales del helper puro) añadiendo los source-asserts del cableado de app.js y del markup de index.html. NO recrear el archivo; añadir nuevos test() / describe() al existente. Seguir el patrón de tests/screen-context-label.test.js (windowed source-assert con readFileSync). Correr con `node --test tests/*.test.js` (glob obligatorio en Node 22.20).

    A) (YA presente desde Task 1 — verificar que sigue verde, no duplicar) Tests BEHAVIORALES del helper PURO sessionTimeLimitMs: multiple-choice→5000, match→10000, word-buttons 3/6/1 tokens → 6000/12000/2000.

    B) Source-asserts NUEVOS (presence-check con windowed slicing sobre src/screens/app.js, leyendo el archivo con readFileSync como hace screen-context-label.test.js):
       - cancelSessionTimer es idempotente con guard de null (forma del patrón cancelAutoAdvance): ventana del cuerpo de cancelSessionTimer contiene un guard de null y clearInterval/clearTimeout.
       - startSessionTimer tiene el guard completo: contiene sessionTimed, sessionFeedback === null y sessionMode !== 'cancion'.
       - onSessionTimeout llama applyResultToSession(this.sessionCurrentExercise, false, null).
       - applyResultToSession llama cancelSessionTimer() (responder detiene el cronómetro) — assertear que aparece dentro de su cuerpo.
       - initSubStateForExercise llama startSessionTimer() (enganche por-ejercicio).
       - startSession contiene `sessionTimed` ligado a `pickerTimed`; _launchExamen pone sessionTimed=false; resetSession pone sessionTimed=false (reset simétrico — WARNING 1); openPicker resetea pickerTimed.
       - startSession llama cancelMatchFlash() Y cancelSessionTimer() (cierre del hueco S-2 — WARNING 2): assertear ambas dentro de la ventana de startSession.
       - Cobertura de cancelación: assertear que cancelSessionTimer() aparece dentro de las ventanas de destroy, resetSession, sessionAdvance, restartRepaso, _launchExamen, startSong, songAdvance y applyResultToSession (windowed por método como hace ctxWindow). Esto blinda el invariante "cero timers huérfanos".

    C) Source-asserts NUEVOS sobre index.html (readFileSync de index.html):
       - El picker contiene x-model="pickerTimed" en un input checkbox.
       - El header de session contiene un bloque con x-show que incluye `sessionTimed` y `sessionFeedback === null`, y la clase session-timer (o el nombre elegido).

    Mantener los asserts robustos a espacios (usar includes de subcadenas clave o regex tolerantes), igual que screen-context-label.test.js.
  </action>
  <verify>
    <automated>node --test tests/*.test.js 2>&1 | grep -E "^# (tests|pass|fail)"</automated>
  </verify>
  <done>tests/screen-timer-mode.test.js (helper puro + source-asserts) pasa completo; el conteo global de la suite no introduce fallos nuevos (solo persiste el preexistente genero-numero 12→13); los source-asserts incluyen el reset simétrico de sessionTimed en resetSession y el cancelMatchFlash()+cancelSessionTimer() en startSession.</done>
</task>

</tasks>

<verification>
- `node --test tests/screen-timer-mode.test.js` pasa (helper puro 5000/10000/2000×nwords + source-asserts).
- `node --test tests/*.test.js` → solo el fallo PREEXISTENTE ajeno (genero-numero 12→13) permanece; CERO fallos nuevos.
- Grep de invariante anti-fugas: `grep -n "cancelSessionTimer\|startSessionTimer\|sessionTimed\|pickerTimed\|cancelMatchFlash" src/screens/app.js` muestra cancelSessionTimer en todas las transiciones + al inicio de applyResultToSession, startSessionTimer al final de initSubStateForExercise, sessionTimed=false en resetSession, y cancelMatchFlash()+cancelSessionTimer() en startSession.
- Inspección de timers: NO debe quedar ningún setInterval/setTimeout cuyo handle no se limpie en cancelSessionTimer/cancel paths.
</verification>

<success_criteria>
- Picker (repaso y test-completo): checkbox "Contrarreloj" → pickerTimed, desmarcado al abrir.
- startSession fija sessionTimed=pickerTimed; _launchExamen fija sessionTimed=false; resetSession resetea sessionTimed=false (lifecycle simétrico).
- startSession cancela también cancelMatchFlash() (hueco S-2 cerrado) además de cancelSessionTimer().
- Barra + segundos visibles solo mientras sessionTimed && sessionFeedback===null.
- Límites: 5000 MC / 10000 match / 2000×nwords word-buttons vía helper puro sessionTimeLimitMs.
- Timeout = fallo vía applyResultToSession(ex,false,null); "Siguiente" manual; bloque incorrect intacto en los 3 tipos.
- Cronómetro cancelado en: responder, avanzar, salir a home, reiniciar repaso, lanzar examen/canción, desmontar pantalla. Cancelación idempotente; el timeout no dispara si ya hay feedback; canción nunca lo activa.
- Sin campos persistidos nuevos, sin migración de schemaVersion, sin tocar scoring/racha.
- Suite verde salvo el fallo preexistente ajeno.
</success_criteria>

<output>
Create `.planning/quick/260615-puq-modo-examen-contrarreloj-tiempo-por-resp/260615-puq-SUMMARY.md` when done.

Documentar en el SUMMARY (consecuencia aceptada v1): sessionTimed es runtime-only y NO se persiste en inFlightTest → reanudar un test-completo interrumpido lo reanuda SIN cronómetro.
</output>
</content>
</invoke>
