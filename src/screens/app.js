// src/screens/app.js
//
// Factory ÚNICO de componente Alpine: `appShell(appDataReady)`.
//
// Phase 2 reemplaza el `sessionScreen` de Phase 1 por un factory plano que
// gestiona LAS CUATRO PANTALLAS de la app (`home`, `picker`, `session`,
// `summary`) con un único `x-data` raíz en `index.html`. La navegación entre
// pantallas es un switch del campo `currentScreen` (D-24): mutuamente
// excluyentes, sin router de URL.
//
// Responsabilidades del factory:
//   - Pantalla HOME: render de la tabla densa de categorías (D-29, D-30) +
//     dos botones grandes `Repaso 20` / `Test completo` (D-32).
//   - Pantalla PICKER: checkboxes de categorías + label dinámico del botón
//     `Empezar` (D-33, D-34, D-35) + aviso inline para Test completo (D-36).
//   - Pantalla SESSION: lógica migrada íntegra de Phase 1 con prefijo
//     `session*` (D-25). Click → grade → feedback → auto-avance 600ms en
//     verde / espera "Siguiente" en rojo (T-02-02 double-click guard).
//   - Pantalla SUMMARY: stub en este plan; Plan 02-04 la poblará con `summaryDelta`.
//   - Helper compartido `requestConfirm(...)` para confirmaciones inline (D-27,
//     D-43, D-44). En Plan 02-03 solo se usa para abandono mid-Repaso.
//
// Decisiones aplicadas (CONTEXT.md referencias):
//   - D-24: switch `currentScreen` con 4 valores ('home'|'picker'|'session'|'summary').
//   - D-25: factory PLANO — todas las props y métodos en el mismo objeto, sin
//     composición por spread. Prefijo de área (`picker*`, `session*`, `summary*`)
//     para legibilidad en `$data` de DevTools. Helpers privados fuera del objeto.
//   - D-26: Promise-handoff de Phase 1 preservado (UAT 01-02 lo validó como
//     único patrón que evita la race condition de Alpine).
//   - D-27: confirmación inline para abandono mid-Repaso (Test completo nunca
//     necesita confirmación porque siempre persiste vía inFlightTest — esa
//     feature llega en Plan 02-04).
//   - D-29: tabla con 5 columnas: Estado | Categoría | Racha | Ejercicios | Última vez.
//   - D-30: badges Unicode (●/✓/★) con CSS classes (color vía CSS vars Pico).
//   - D-32: dos botones grandes `Repaso 20` y `Test completo` lado a lado.
//   - D-33: picker único compartido entre los dos modos; cabecera dinámica.
//   - D-34: checkboxes desmarcados al entrar al picker (cada vez).
//   - D-35: label del botón `Empezar` incluye el contador en vivo.
//   - D-36: aviso inline para Test completo (NO modal).
//   - D-49: `buildSession` con GUARANTEE + FILL phase (transparente al caller).
//   - D-50: `buildFullTest` para Test completo (Fisher-Yates sobre pool entero).
//   - D-52: `applySessionResult` con 4 args; `today` se inyecta desde el screen layer.
//   - D-54 (UAT round 2): `applyImmediateFailure` invocado desde
//     `sessionSelectOption` cuando feedback === 'incorrect'. Persiste la
//     regresión de categoría INMEDIATAMENTE (saveState mid-session) para
//     cerrar el exploit "fallo + abandono" que violaba el core value.
//   - D-55 (UAT round 2): `formatStreak(streak, status)` formatea la celda
//     de Racha de la home como `N / 21 d` cuando status != 'dominada'
//     (visualiza el objetivo 21 días) y `N d` cuando dominada (ya superó
//     el objetivo).
//
// Reglas de pureza del módulo:
//   - NO toca `document`, `window`, ni `innerHTML`. La manipulación del DOM
//     vive en los `x-` directives de `index.html` (Alpine se encarga).
//   - `setTimeout`/`clearTimeout` SÍ se usan: son globales, no DOM. Necesarios
//     para el auto-advance cancelable (Pitfall #5).
//   - Imports solo de capas inferiores: `domain/`, `data/storage.js`,
//     `exercise-types/`. NUNCA imports cross-screen (solo hay un screen).

import { buildSession, buildFullTest, fisherYates } from '../domain/session.js';
import { applySessionResult, applyImmediateFailure, applyNewExerciseRegression } from '../domain/progress.js';
import { todayLocal, daysSinceISO } from '../domain/dates.js';
import { saveState } from '../data/storage.js';
import { parseBackupFile, buildBackupWrapper } from '../data/backup.js';
import { registry } from '../exercise-types/index.js';
import { groupTokens } from '../domain/word-groups.js';

// ─── Auto-avance al acertar ──────────────────────────────────────────────────
// quick-260615-r3b (CAMBIO 1): el auto-avance al ACERTAR aplica SOLO a modo
// canción (las frases avanzan solas con este delay). En ejercicios
// (repaso/test-completo/examen) NO hay auto-avance: el usuario avanza manualmente
// con "Siguiente", lo que deja pulsar "¿Por qué?" sin carrera.
const SESSION_AUTO_ADVANCE_MS = 600;

// ─── Modo contrarreloj (quick-260615-puq, feature todo #4) ──────────────────
// Límite de tiempo POR respuesta cuando la sesión arranca cronometrada
// (sessionTimed=true). Constantes nombradas y fáciles de ajustar (CONTEXT
// decisión 4). word-buttons escala con el nº de palabras de la frase.
const TIMED_LIMIT_MS_MULTIPLE_CHOICE = 5000;
const TIMED_LIMIT_MS_MATCH = 10000;
const TIMED_LIMIT_MS_PER_WORD = 2000;
// Intervalo del tick del cronómetro (decremento del display + chequeo de
// expiry). Un único setInterval evita drift display-vs-expiry (CONTEXT §tick).
const SESSION_TIMER_TICK_MS = 100;

/**
 * Helper PURO del límite de tiempo (ms) por ejercicio cronometrado
 * (quick-260615-puq). Función de MÓDULO — no lee `this`, no toca timers, solo
 * `ex.type` y `ex.payload.answer.length`. Testeable sin Alpine.
 *
 *   - multiple-choice → TIMED_LIMIT_MS_MULTIPLE_CHOICE (5000).
 *   - match           → TIMED_LIMIT_MS_MATCH (10000).
 *   - word-buttons    → TIMED_LIMIT_MS_PER_WORD × nº de palabras
 *                       (payload.answer.length — verificado contra
 *                       src/exercise-types/word-buttons.js; los distractors
 *                       NO cuentan).
 *   - tipo desconocido → default defensivo = TIMED_LIMIT_MS_MULTIPLE_CHOICE.
 *
 * @param {{type:string, payload?:{answer?:string[]}}} ex
 * @returns {number} milisegundos del límite de respuesta para `ex`.
 */
export function sessionTimeLimitMs(ex) {
  if (!ex) return TIMED_LIMIT_MS_MULTIPLE_CHOICE;
  if (ex.type === 'match') return TIMED_LIMIT_MS_MATCH;
  if (ex.type === 'word-buttons') {
    return TIMED_LIMIT_MS_PER_WORD * (ex.payload?.answer?.length ?? 0);
  }
  // multiple-choice + default defensivo para type desconocido.
  return TIMED_LIMIT_MS_MULTIPLE_CHOICE;
}

/**
 * Construye el objeto Alpine `appShell` con las cuatro pantallas y sus
 * sub-estados aplastados (D-25 factory plano).
 *
 * Registro en `main.js`:
 *   Alpine.data('appShell', () => appShell(appDataReady));
 *
 * Luego el HTML hace `<div x-data="appShell" x-init="init()">` con cuatro
 * templates `x-if` mutuamente excluyentes sobre `currentScreen`.
 *
 * @param {Promise<{content: object, state: object}>} appDataReady
 *   Promise resuelta por `main.js` cuando JSON cargado + validado + boot
 *   regression aplicada (DOMAIN-06 / D-40).
 * @returns {object} Objeto Alpine data con métodos y reactive props.
 */
export function appShell(appDataReady) {
  return {
    // ─── Referencias inyectadas (llenadas en init() tras await) ─────────────
    content: null,
    state: null,

    // ─── Bootstrap ──────────────────────────────────────────────────────────
    ready: false,

    // ─── Navegación (D-24, D-84 Phase 4; Phase 13 canciones) ────────────────
    /** 'home' | 'picker' | 'session' | 'summary' | 'backup' |
     *  'canciones' (listado Phase 13) | 'cancion' (playthrough) |
     *  'cancion-summary' (resumen post-canción). */
    currentScreen: 'home',

    // ─── Sub-estado picker (D-33/D-34/D-35) ─────────────────────────────────
    /** 'repaso' | 'test-completo' | null (sin picker abierto). */
    pickerMode: null,
    /** Array (no Set) por reactividad Alpine. D-34: vacío al entrar. */
    pickerCheckedCategoryIds: [],

    // ─── Sub-estado session (migrado de Phase 1 con prefijo `session*`) ─────
    /** 'repaso' | 'test-completo' | null. */
    sessionMode: null,
    sessionExerciseIds: [],
    /**
     * Phase 16 (EXAM-01/D-16-08): array paralelo a `sessionExerciseIds` con el
     * `variantIndex` fijado por slot al construir la sesión (devuelto por
     * `buildSession`/`buildFullTest`). El getter `sessionCurrentExercise`
     * resuelve `slotById[id].variants[variantIndex]`. Default 0 cuando falta
     * (slot legacy de 1 variante, o resume de un inFlightTest pre-existente
     * sin variantIndices — D-16-10).
     */
    sessionVariantIndices: [],
    sessionCursor: 0,
    /** Array<{exerciseId: string, correct: boolean}>. */
    sessionResults: [],
    sessionSelectedIndex: null,
    /** null | 'correct' | 'incorrect'. */
    sessionFeedback: null,
    sessionAutoAdvanceHandle: null,
    /**
     * quick-260615-puq (feature todo #4): modo contrarreloj. Estado RUNTIME-ONLY
     * (NO persistido — no se escribe en inFlightTest; reanudar un test
     * interrumpido lo reanuda SIN cronómetro, consecuencia aceptada v1).
     *   - pickerTimed: flag del checkbox "Contrarreloj" del picker (se resetea
     *     al abrir el picker, D-34 análogo).
     *   - sessionTimed: flag ACTIVO de la sesión; se enciende en startSession
     *     (=pickerTimed), se fuerza false en _launchExamen (examen 1-clic nunca
     *     cronometrado), y se apaga en resetSession (lifecycle simétrico).
     *   - sessionTimerIntervalHandle: handle del único setInterval del tick.
     *   - sessionTimeRemainingMs: reactivo, alimenta la barra + el número.
     */
    pickerTimed: false,
    sessionTimed: false,
    // quick-260615-r3b (CAMBIO 2): toggle "Contrarreloj" de home para el examen
    // de 1 clic. Runtime-only, NO persistido (espejo de pickerTimed).
    homeExamTimed: false,
    sessionTimerIntervalHandle: null,
    sessionTimeRemainingMs: 0,
    /**
     * quick-260615-hr0 (feature todo #3): UI derivada por-ejercicio (NO
     * persistida). Al acertar un ejercicio CON explanation, el affordance
     * "¿Por qué?" (botón + tecla `e`) revela la explicación bajo demanda y
     * cancela el auto-avance. Se resetea al avanzar y al iniciar sesión para no
     * arrastrar el revelado entre ejercicios.
     */
    sessionExplanationRevealed: false,

    /**
     * quick-260713-ng7 (Repetir las falladas): guard ÚNICO que suprime TODA
     * escritura a localStorage durante el reintento review-only de las falladas
     * de la ronda recién terminada. Runtime-only (NO persistido, NO en
     * inFlightTest). Cuando es `true`: los dos call-sites de
     * `applyImmediateFailure`+`saveState` (applyResultToSession y matchPickRight)
     * y el `completeSession()` de sessionAdvance quedan bypassados — esos fallos
     * ya se contaron en la ronda original, este loop es puro repaso visual.
     */
    sessionReviewOnly: false,

    // ─── Sub-estado multi-choice (Phase quick-260525-pwq — D-181) ───────────
    /**
     * Permutación de índices `[0..N-1]` aplicada al `payload.options` del
     * multi-choice actual. El JSON sigue inmutable (D-132); el template HTML
     * itera `multiChoiceOrder` y resuelve cada posición visual con
     * `payload.options[perm]` para texto/click/clases. El click pasa el
     * índice ORIGINAL (perm) a `sessionSelectOption`, así `multipleChoice.grade`
     * sigue operando sobre el `correctIndex` canónico del JSON sin cambios.
     *
     * Math.random intencional (no seedable) — paralelo arquitectónico con
     * `wordButtonsBank` (D-57) y `matchLeft/matchRight` (D-62): el orden
     * visual non-deterministic por carga es lo que fuerza al alumno a
     * re-leer cada opción cada vez, en línea con el core value del proyecto
     * "que el sistema te obligue a no olvidar". Caso flagrante resuelto:
     * avere-302..305 (4 ejercicios con MISMAS options + correctIndex=2) ya
     * no entrena "tercera columna".
     */
    multiChoiceOrder: [],

    // ─── Sub-estado word-buttons (Phase 3 plan 01; D-56, D-57, D-64) ────────
    /**
     * Banco barajado de palabras (`answer ∪ distractors`), ESTABLE tras init.
     * Ya NO se muta al colocar/quitar (quick-260615-str): los huecos se
     * mantienen con un placeholder invisible para evitar reflow.
     */
    wordButtonsBank: [],
    /**
     * Índices del banco colocados en el área respuesta, en orden de click.
     * NUEVA fuente de verdad de la respuesta (quick-260615-str). Maneja
     * palabras repetidas por índice. `wordButtonsAnswer` se deriva de aquí.
     */
    wordButtonsPlacedIdx: [],

    // ─── Sub-estado match (Phase 3 plan 02 — D-60/D-61/D-62/D-63/D-66/D-70) ─
    matchLeft: [],
    matchRight: [],
    /** null | number — índice del item izq actualmente seleccionado. */
    matchSelectedLeftIdx: null,
    /** Array<{leftIdx, rightIdx, pairIdx}> — parejas correctas ya formadas. */
    matchPairsConsumed: [],
    /** True si el usuario falló al menos UNA pareja en este ejercicio (D-60). */
    matchHadFailure: false,
    /**
     * Phase 6 plan 02 (UX-02) — D-107: captura del PRIMER pareo erróneo de un
     * ejercicio match, bajo el guard `!this.matchHadFailure` en matchPickRight
     * (simetría arquitectónica con la cascada D-61). Shape:
     *   - `null` cuando el ejercicio aún no tuvo fallos (o se completó sin
     *     ningún fallo — pareja correcta no afecta este prop).
     *   - `{ left: string, right: string, leftIdx: number }` con los textos
     *     literales del par erróneo MÁS el índice de `left` en
     *     `payload.pairs[]` (NO en `matchLeft` shuffled — es el índice canónico
     *     del par original, usable directamente para lookup).
     *
     * WR-01 fix: añadimos `leftIdx` para resolver el lookup "Respuesta correcta"
     * del summary cuando dos parejas comparten el mismo texto `left` (homónimos
     * permitidos por D-66 Phase 3). Sin el índice canónico, `pairs.find(p =>
     * p[0] === left)` devolvía siempre el primer match, mostrando una respuesta
     * "correcta" potencialmente incorrecta. El índice se calcula buscando el
     * par cuyo texto coincida con el `leftWord` clickado — defensivo: si por
     * cualquier razón no se encuentra (no debería pasar), cae a -1 y el summary
     * lo trata como "(?)" igual que antes.
     *
     * Lectura: applyResultToSession en la rama de completado del match lo pasa
     * como el 3er arg `userAnswer` (D-106). El summary post-sesión lo lee desde
     * sessionResults para renderizar la fila "Errores cometidos" del match.
     *
     * Reset: idéntico patrón a matchHadFailure — en resetSession,
     * initSubStateForExercise y restartRepaso (cierre del loop iniciado en
     * plan 06-01: D-112).
     */
    matchFirstWrongPair: null,
    /**
     * null | {left: number, right: number} — par de índices con animación
     * `.match-flash` activa durante 300ms tras un intento incorrecto (D-60).
     */
    matchFlashIdx: null,
    /** Handle del setTimeout del flash rojo (Pitfall #5 cleanup). */
    matchFlashHandle: null,

    // ─── Sub-estado summary (stub; Plan 02-04 lo poblará) ───────────────────
    summaryDelta: null,
    summaryHeaderLabel: '',
    /**
     * Phase 6 (CR-02 fix) — snapshot de `sessionResults` tomado al final de
     * `completeSession()`, idéntico patrón al de `summaryDelta`
     * (snapshot-on-completion → render → clear-on-return). El summary lee
     * `summarySessionResults` en lugar del live `sessionResults` para que
     * cualquier evaluación reactiva durante el tick de unmount en
     * `returnToHomeFromSummary()` (que llama `resetSession()` ANTES de cambiar
     * `currentScreen` a `'home'`) no vea un array vacío y oculte silenciosamente
     * los errores que el autor acababa de ver.
     *
     * Lifecycle:
     *   - Inicializado a `[]` (no `null`) para que el `.some()`/`.filter()` del
     *     template no necesite guards extra.
     *   - Set por `completeSession()` con `[...this.sessionResults]` (clon shallow
     *     — los items ya son plain objects de shape D-105 que el inFlightTest
     *     persiste por separado; sin getters / setters / prototipos custom).
     *   - Limpiado por `returnToHomeFromSummary()` junto con `summaryDelta`
     *     (mismo paso, mismo trigger). NO se toca en `restartRepaso()` (path
     *     ortogonal — no involucra `completeSession` ni `returnToHomeFromSummary`).
     */
    summarySessionResults: [],

    // ─── Sub-estado canción (Phase 13 — playthrough standalone) ─────────────
    /**
     * Id de la canción actualmente en curso (null fuera del playthrough). El
     * playthrough REUTILIZA el sub-estado `session*` (cursor, results, feedback,
     * wordButtonsBank/Answer) pero resuelve la frase activa contra el mapa
     * DEDICADO `songPhraseById` — NO contra `content.exerciseById`, donde las
     * frases de canción NO existen (standalone, LINK-04). El getter
     * `songCurrentPhrase` hace ese lookup; mantenerlo separado evita volver
     * song-aware a `sessionCurrentExercise`.
     */
    songActiveId: null,
    /**
     * Mapa frase-id → objeto frase GRADUABLE (`{ id, type:'word-buttons',
     * payload:{prompt, answer, distractors}, categoryIds }`). Poblado por
     * `startSong` normalizando `songsById[songId].phrases`. La cascada D-54 lee
     * `phrase.categoryIds` (vacío = no-op, LINK-03); el resumen Block A/B
     * resuelve el lookup aquí (no en exerciseById).
     */
    songPhraseById: {},
    /**
     * quick-260715-hf5 — Modo del banco de palabras en canciones:
     *   - 'classic': banco = solo `answer` barajado (comportamiento histórico).
     *   - 'grouped': banco = `answer ∪ decoyBank.distractors`, agrupado por
     *     categoría sintáctica (POS) con etiqueta visible y grupos colapsables.
     * `startSong` lo fija a 'grouped' si la canción tiene decoyBank (piloto),
     * o 'classic' si no. El checkbox de la barra superior lo conmuta en vivo.
     */
    songBankMode: 'classic',
    /**
     * quick-260715-hf5 — Estado de colapso del acordeón de grupos, por clave
     * POS: `{ [posKey]: true }` = grupo plegado. Solo presentacional.
     */
    songCollapsedGroups: {},
    /**
     * Deep-clone de `state.categoryProgress` capturado AL INICIO de la canción
     * (en `startSong`), ANTES del primer fallo. La cascada de canción es
     * INCREMENTAL (cada frase fallada muta categoryProgress vía
     * `applyImmediateFailure` + saveState), así que el snapshot "antes" para el
     * bloque de impacto del resumen NO se puede tomar al final (como
     * `completeSession`) — debe capturarse al lanzar.
     */
    songBefore: null,
    /**
     * Phase 13 — Block B del resumen: lista de categorías que REGRESARON de
     * estado por las frases falladas de esta canción (antes hecha/dominada →
     * ahora no-hecha). Set por `completeSong()` reusando el CONCEPTO de
     * `computeSummaryDelta` (factual antes→después, SIN gamificación). Limpiado
     * en `returnToSongList()`. `null` fuera del resumen (guard del template).
     */
    songSummaryDelta: null,

    // ─── Sub-estado backup (Phase 4 D-84) ───────────────────────────────────
    /** null | { kind: 'success' | 'error', text: string }. Limpiado al salir
     *  de la pantalla backup vía requestReturnToHome (W-2 fix). */
    backupLastMessage: null,
    /** null | { state: object, summary: { exportedAt, categories, exercises } }.
     *  Payload validado, pendiente de confirmación inline (D-76). El
     *  `backupFileInputRef` de CONTEXT D-84 NO es propiedad — se accede vía
     *  Alpine `$refs.backupFileInput` directamente. */
    backupPendingImport: null,

    // ─── Helper compartido confirmación inline (D-27 / D-43 / D-44 / D-76) ──
    /** null | {message, confirmLabel, cancelLabel, onConfirm}. */
    confirmDialog: null,

    // ════════════════════════════════════════════════════════════════════════
    // Lifecycle
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Alpine invoca `init()` cuando monta el x-data (en este HTML lo
     * disparamos explícitamente con `x-init="init()"`). El patrón
     * Promise-handoff (Phase 1 UAT 01-02 validó que es el ÚNICO que evita
     * race conditions) sigue intacto: esperamos `appDataReady` antes de
     * marcar `ready`. NO construimos sesión aquí — eso ocurre en
     * `startSession()` al pulsar `Empezar`.
     */
    async init() {
      const { content, state } = await appDataReady;
      this.content = content;
      this.state = state;
      this.ready = true;
      // Defensivo: aunque el default ya es 'home', explicitar tras boot.
      this.currentScreen = 'home';
    },

    /**
     * Hook que Alpine invoca cuando el x-data se desmonta (cambio de pantalla,
     * navegación, hot-reload). Safety net contra timers vivos (Pitfall #5).
     */
    destroy() {
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer(); // quick-260615-puq
    },

    // ════════════════════════════════════════════════════════════════════════
    // Navegación entre pantallas (D-24, D-27)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Lanza el picker desde uno de los dos botones grandes de home.
     * D-34: checkboxes DESMARCADOS al entrar (cada vez, no recuerda última
     * selección — decisión deliberada para forzar elección consciente).
     *
     * D-44 (Plan 02-04): si el usuario pulsa `Test completo` cuando ya hay un
     * `inFlightTest` pendiente, mostramos confirmación antes de abrir el
     * picker. Esto previene que el usuario pierda accidentalmente el progreso
     * del test en curso sin haber visto el banner del home (caso típico: el
     * usuario olvidó que tenía un test a medias). Para `Repaso` no aplica
     * (Repaso no persiste por diseño SESSION-08).
     *
     * @param {'repaso'|'test-completo'} mode
     */
    openPicker(mode) {
      // D-44: conflicto si pulsa Test completo con uno in-flight pendiente.
      if (mode === 'test-completo' && this.state.inFlightTest) {
        this.requestConfirm({
          message: 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?',
          confirmLabel: 'Descartar y empezar',
          cancelLabel: 'Cancelar',
          onConfirm: () => {
            this.clearInFlightTest();
            this.pickerMode = mode;
            this.pickerCheckedCategoryIds = [];
            this.pickerTimed = false; // quick-260615-puq (desmarcado al abrir)
            this.currentScreen = 'picker';
          }
        });
        return;
      }
      this.pickerMode = mode;
      this.pickerCheckedCategoryIds = []; // D-34
      this.pickerTimed = false; // quick-260615-puq (desmarcado al abrir)
      this.currentScreen = 'picker';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Modo Examen por categoría (Phase 8 — D-181..D-192)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Phase 8 (D-181..D-192) — Lanza un Test completo de SOLO la categoría
     * pasada como parámetro, con 1 click directo desde la tabla home (salta
     * el picker). Resuelve el dolor canónico "5-6 Repasos para validar dominio
     * de una sola categoría".
     *
     * Semánticas (D-181 / D-186 / D-189):
     *   - D-181: lanzamiento directo a session sin pasar por picker ni
     *     "Empezar". Examen es semánticamente Test completo de 1 cat.
     *   - D-186: sin confirmación previa cuando no hay conflict (el autor
     *     sabe lo que clickea — el botón está justo en la fila de su cat).
     *   - D-189: sessionMode = 'test-completo' literal (NO modo nuevo).
     *
     * D-44 conflict (6ª call-site del helper requestConfirm):
     *   - Si state.inFlightTest !== null → requestConfirm con copy literal
     *     IDÉNTICA al openPicker D-44 línea 275 (D-183 hereda copy genérica
     *     del banner reanudar — el usuario no necesita saber si el inFlightTest
     *     activo era Examen o Test regular; semánticamente son lo mismo).
     *   - confirmLabel: 'Descartar y empezar' (coherente con openPicker — el
     *     análogo más directo: mismo message + mismo intent).
     *   - onConfirm: clearInFlightTest() + _launchExamen(categoryId).
     *   - Cancelar → confirmDialog se cierra sin tocar state (helper estándar).
     *
     * El cuerpo del lanzamiento está extraído al helper privado
     * `_launchExamen(catId)` para evitar duplicación entre el path directo
     * (sin conflict) y el path post-confirm (tras clearInFlightTest).
     *
     * @param {string} categoryId
     */
    startExamen(categoryId) {
      // D-44 conflict (6ª call-site): chequeo ANTES de cualquier mutación.
      if (this.state.inFlightTest) {
        this.requestConfirm({
          message: 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?',
          confirmLabel: 'Descartar y empezar',
          cancelLabel: 'Cancelar',
          onConfirm: () => {
            this.clearInFlightTest();
            this._launchExamen(categoryId);
          }
        });
        return;
      }
      // Path normal sin conflict: lanzamiento directo (D-181 + D-186).
      this._launchExamen(categoryId);
    },

    /**
     * Phase 8 — helper privado del lanzamiento de Examen. Invocado por
     * `startExamen` (path directo) y por `requestConfirm.onConfirm` tras
     * `clearInFlightTest` (path post-conflict D-44).
     *
     * Cuerpo del lanzamiento puro: buildFullTest + reset de sub-estados +
     * persistInFlightTest (D-182 slot único, SIEMPRE persiste) + transición
     * a `currentScreen='session'`.
     *
     * Pattern S-2 cancelaciones defensivas (Phase 3 + Phase 6 D-104):
     *   - Examen puede venir de mid-match si el path conflict D-44 cancela
     *     un Test previo a medias. Reset SUPERSET completo de restartRepaso
     *     (NO el subset corto de startSession) para garantizar que ningún
     *     setTimeout pendiente ni sub-estado match residual sobreviva.
     *
     * Pitfall sutil (PATTERNS.md §1 Analog 2):
     *   - `persistInFlightTest()` lee `this.pickerCheckedCategoryIds` con
     *     fallback a `prev?.categoryIds`. DEBE setearse `[catId]` ANTES de
     *     invocarlo; de lo contrario, el reanudar usaría las cats del Test
     *     anterior (regresión silenciosa).
     *
     * Cero migración schemaVersion (D-192): el shape de inFlightTest es
     * IDÉNTICO al de un Test completo regular. El banner reanudar no
     * distingue (D-183 copy genérica).
     *
     * @param {string} catId
     */
    _launchExamen(catId) {
      // Pattern S-2: cancelaciones defensivas antes de cualquier reset.
      // Set completo de restartRepaso (Phase 6 D-104) — Examen puede venir
      // de mid-match si el path conflict canceló un Test previo a medias.
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer(); // quick-260615-puq

      // quick-260615-r3b (CAMBIO 2): el examen 1-clic desde la tabla de home
      // respeta el toggle "Contrarreloj" (homeExamTimed). Runtime-only.
      this.sessionTimed = this.homeExamTimed;

      // Construir el pool completo de la categoría (Examen es 1-cat — D-181).
      // Phase 16: el sampler opera sobre SLOTS (slot id == exercise id para
      // legacy de 1 variante); `buildFullTest` devuelve `variantIndices` paralelo.
      const allExercises = Object.values(this.content.slotById);
      const result = buildFullTest([catId], allExercises);

      // D-189: sessionMode literal 'test-completo' (NO this.pickerMode —
      // Examen salta el picker).
      this.sessionMode = 'test-completo';

      // CRÍTICO — setear pickerCheckedCategoryIds ANTES de persistInFlightTest
      // (pitfall PATTERNS.md §1 Analog 2). Si no se setea, el fallback
      // prev?.categoryIds capturaría las cats del Test previo.
      this.pickerCheckedCategoryIds = [catId];

      // Reset sub-estado de sesión (idéntico al patrón de startSession +
      // restartRepaso — superset completo).
      this.sessionExerciseIds = result.exerciseIds;
      // Phase 16 (D-16-08): la variante fijada por slot viaja paralela.
      this.sessionVariantIndices = result.variantIndices;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false; // quick-260615-hr0
      // Sub-estados word-buttons (Phase 3).
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      // Sub-estados match (Phase 3 + Phase 6 D-107/D-112).
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      this.matchFirstWrongPair = null;
      // WR-02 defensa explícita (heredada de restartRepaso) — los reset
      // inline mantienen la garantía aunque cancelMatchFlash cambie.
      this.matchFlashIdx = null;
      this.matchFlashHandle = null;

      // Inicializar sub-estado del PRIMER ejercicio si hay pool.
      // Phase 16: el getter slot-aware re-envuelve la variante fijada (cursor=0).
      if (result.exerciseIds.length > 0) {
        this.initSubStateForExercise(this.sessionCurrentExercise);
      }

      // D-182 slot único — Examen SIEMPRE persiste (no condicional como
      // startSession que solo persiste cuando pickerMode === 'test-completo').
      this.persistInFlightTest();

      // Transición final a session.
      this.currentScreen = 'session';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Playthrough de canción (Phase 13 — PLAY-01/02/03/05, LINK-02/04)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Phase 13 — Lanza el playthrough de una canción. Copia la FORMA de
     * `_launchExamen` (build lista ordenada → reset sub-estado → init primera →
     * transición) PERO con divergencias standalone:
     *
     *   - PLAY-01 / LINK-04: recorre `songsById[songId].phrases` EN ORDEN
     *     DECLARADO. NO usa `buildFullTest`/`buildSession` ni `fisherYates`
     *     sobre el orden de frases (el shuffle del BANCO de cada frase SÍ está
     *     permitido — D-05, vía `initSubStateForExercise`).
     *   - LINK-04: las frases se resuelven contra el mapa DEDICADO
     *     `songPhraseById`, NUNCA contra `content.exerciseById` (donde no
     *     existen). El getter `songCurrentPhrase` hace ese lookup, evitando
     *     volver song-aware a `sessionCurrentExercise`.
     *   - PLAY-05: NO escribe `inFlightTest` (sin slot de reanudación;
     *     abandonar descarta lo no comprometido, re-entrar empieza de cero).
     *     Como `sessionMode = 'cancion'` (no 'test-completo'), el branch de
     *     persistInFlightTest de `applyResultToSession`/`sessionAdvance` se omite.
     *
     * Normaliza cada frase a un objeto graduable word-buttons (las frases del
     * JSON no llevan `type`): `{ id, type:'word-buttons', payload:{prompt,
     * answer, distractors}, categoryIds }`. Así `wordButtons.grade()` y la
     * cascada `applyImmediateFailure` (que lee `categoryIds`) se reutilizan tal
     * cual.
     *
     * Captura el snapshot `songBefore` (deep-clone de categoryProgress) AL
     * INICIO: la cascada de canción es INCREMENTAL (cada frase fallada muta
     * categoryProgress), así que el "antes" del bloque de impacto del resumen
     * debe tomarse aquí, no al final.
     *
     * @param {string} songId
     */
    startSong(songId) {
      // Pattern S-2: cancelaciones defensivas antes de cualquier reset.
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer(); // quick-260615-puq (canción nunca cronometra)

      const song = this.content?.songsById?.[songId];
      if (!song || !Array.isArray(song.phrases)) return;

      // Normalizar cada frase a un objeto graduable word-buttons (las frases
      // NO llevan `type` en el JSON; son word-buttons inverso it->es).
      // PLAY-01: el ORDEN es el declarado (Array.map preserva el orden, sin
      // fisherYates sobre las frases).
      const phraseById = {};
      const orderedIds = [];
      for (const phrase of song.phrases) {
        const graded = {
          id: phrase.id,
          type: 'word-buttons',
          payload: {
            prompt: phrase.prompt,
            answer: phrase.answer ?? [],
            distractors: phrase.distractors ?? [],
            // quick-260715-hf5: decoyBank opcional (decoys + POS) para el modo
            // agrupado. Se preserva a nivel de payload (no como `distractors`
            // sueltos) para que el modo clásico NUNCA lo use.
            decoyBank: phrase.decoyBank ?? null
          },
          categoryIds: phrase.categoryIds ?? []
        };
        phraseById[phrase.id] = graded;
        orderedIds.push(phrase.id);
      }

      this.songActiveId = songId;
      this.songPhraseById = phraseById;

      // sessionMode 'cancion' — distinto de 'test-completo' para que
      // applyResultToSession/sessionAdvance NO persistan inFlightTest (PLAY-05)
      // y el render/teclado dispatchen al path de canción.
      this.sessionMode = 'cancion';

      // Reuso del sub-estado session* para cursor/results/feedback/word-buttons.
      this.sessionExerciseIds = orderedIds;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false; // quick-260615-hr0
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      // Reset match (defensivo, idéntico a _launchExamen).
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      this.matchFirstWrongPair = null;
      this.matchFlashIdx = null;
      this.matchFlashHandle = null;

      // Snapshot `before` de categoryProgress AL INICIO (la cascada es
      // incremental — debe capturarse antes del primer fallo). Deep-clone
      // defensivo igual que completeSession.
      this.songBefore = JSON.parse(JSON.stringify(this.state.categoryProgress ?? {}));

      // quick-260715-hf5: modo del banco. Si la canción trae decoyBank, entra
      // por defecto en 'grouped' (la forma que se está pilotando); si no, solo
      // existe el modo 'classic'. El checkbox de la barra superior lo conmuta.
      const hasDecoys = song.phrases.some((p) => p && p.decoyBank && p.decoyBank.pos);
      this.songBankMode = hasDecoys ? 'grouped' : 'classic';
      this.songCollapsedGroups = {};

      // Init sub-estado de la PRIMERA frase (rama word-buttons:
      // bank = fisherYates(answer ∪ distractors) — shuffle del banco permitido D-05).
      if (orderedIds.length > 0) {
        this.initSubStateForExercise(phraseById[orderedIds[0]]);
      }

      // PLAY-05: NO persistInFlightTest. Transición a la pantalla de canción.
      this.currentScreen = 'cancion';
    },

    /**
     * Phase 13 — Comprobar la frase actual (analog de `wordButtonsCheck`, D-58)
     * pero resolviendo contra `songPhraseById` (NO `sessionCurrentExercise`,
     * que lee de exerciseById donde la frase NO existe — LINK-04).
     *
     * Delega en `applyResultToSession` (ÚNICO call-site de la cascada D-54,
     * Pitfall #2 — NO añade un segundo). `applyResultToSession` ya dispatcha
     * por `sessionMode === 'cancion'`: en acierto programa `songAdvance` (600ms,
     * PLAY-03); en fallo aplica `applyImmediateFailure` + saveState SÍNCRONO
     * (LINK-02; categoryIds vacío = no-op, LINK-03) y omite inFlightTest (PLAY-05).
     */
    songCheck() {
      if (this.sessionFeedback !== null) return;
      if (!this.wordButtonsCanCheck) return;
      const phrase = this.songCurrentPhrase;
      if (!phrase) return;
      const correct = registry[phrase.type].grade(phrase, { tokens: this.wordButtonsAnswer });
      this.applyResultToSession(phrase, correct, [...this.wordButtonsAnswer]);
    },

    /**
     * Phase 13 — Avanza a la siguiente frase (analog de `sessionAdvance`) pero
     * resolviendo la siguiente frase contra `songPhraseById` y disparando
     * `completeSong()` (no `completeSession`) al pasar el final. NO persiste
     * inFlightTest (PLAY-05).
     */
    songAdvance() {
      this.cancelAutoAdvance();
      this.cancelSessionTimer(); // quick-260615-puq

      this.sessionCursor += 1;
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      if (this.sessionCursor >= this.sessionExerciseIds.length) {
        this.completeSong();
      } else {
        const nextId = this.sessionExerciseIds[this.sessionCursor];
        this.initSubStateForExercise(this.songPhraseById[nextId]);
      }
    },

    /**
     * Phase 13 — Handler de teclado del playthrough de canción (analog de
     * `handleSessionKey`, D-71/D-72) resolviendo la frase contra
     * `songCurrentPhrase` y avanzando con `songAdvance`/comprobando con
     * `songCheck`. Bound vía `@keydown.window` en la pantalla 'cancion';
     * auto-unmount al cambiar `currentScreen` (D-72).
     */
    handleSongKey(event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const phrase = this.songCurrentPhrase;
      if (!phrase) return;
      const key = event.key;

      if (key === 'Enter' || key === ' ') {
        if (key === ' ') event.preventDefault();
        if (this.sessionFeedback === 'incorrect') {
          this.songAdvance();
          return;
        }
        if (this.sessionFeedback === null && this.wordButtonsCanCheck) {
          this.songCheck();
          return;
        }
        return;
      }

      if (key === 'Backspace') {
        if (this.sessionFeedback !== null) return;
        event.preventDefault();
        const last = this.wordButtonsAnswer.length - 1;
        if (last >= 0) this.wordButtonsRemoveWord(last);
        return;
      }

      // Dígitos 1-9: colocar la N-ésima palabra VISIBLE del banco (mismo que
      // word-buttons). quick-260615-str: con huecos estables, la tecla N ya
      // NO mapea al slot crudo N — `visibleSlotIdx` traduce N→slotIdx de la
      // N-ésima visible (saltando colocadas). El bound `idx < 9` mantiene
      // explícito el invariante D-69 (solo se numeran 9 visibles).
      if (/^[1-9]$/.test(key)) {
        if (this.sessionFeedback !== null) return;
        const idx = Number(key) - 1;
        const slot = this.visibleSlotIdx(idx);
        if (idx < 9 && slot !== -1) this.wordButtonsAddWord(slot);
      }
    },

    /**
     * Handler unificado del botón "← Volver al home" presente en picker y
     * session.
     *
     * Semánticas:
     *   - Desde session en modo 'repaso': D-27 — confirmación inline antes de
     *     descartar la sesión.
     *   - Desde session en modo 'test-completo': directo a home. La razón es
     *     que Test completo siempre persiste vía `inFlightTest` (D-41), así
     *     que "volver al home" no es destructivo — se puede reanudar. La
     *     persistencia in-flight llega en Plan 02-04; en Plan 02-03 el Test
     *     completo aún NO persiste, pero el comportamiento "directo a home"
     *     es el correcto a futuro.
     *   - Desde picker o summary: directo a home (no hay nada que descartar).
     */
    requestReturnToHome() {
      if (this.currentScreen === 'session' && this.sessionMode === 'repaso') {
        this.requestConfirm({
          message: '¿Descartar esta sesión de repaso? Tus respuestas no se guardarán.',
          confirmLabel: 'Descartar',
          cancelLabel: 'Continuar',
          onConfirm: () => {
            this.resetSession();
            this.currentScreen = 'home';
          }
        });
        return;
      }
      // Phase 4 D-76 / W-2 fix: salir de pantalla Backup limpia el último
      // mensaje (verde/rojo) para que no aparezca stale al volver a entrar.
      // UI-SPEC línea 206: "It is cleared automatically when the user leaves
      // the backup screen".
      if (this.currentScreen === 'backup') {
        this.backupLastMessage = null;
      }
      // Picker, summary, backup o session en modo 'test-completo': directo.
      this.resetSession();
      this.currentScreen = 'home';
    },

    /**
     * Resetea todo el sub-estado de sesión a sus defaults. Cancela cualquier
     * setTimeout pendiente antes (Pitfall #5).
     *
     * Llamado al volver a home, al arrancar nueva sesión, o como parte de
     * `completeSession()`. Idempotente.
     */
    resetSession() {
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer(); // quick-260615-puq
      // quick-260615-puq (WARNING 1): reset SIMÉTRICO del flag de sesión.
      // resetSession es el chokepoint de "volver al home" (requestReturnToHome
      // lo llama en ambas ramas); sin esto sessionTimed quedaría true tras una
      // sesión cronometrada (riesgo latente).
      this.sessionTimed = false;
      this.sessionMode = null;
      this.sessionExerciseIds = [];
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false; // quick-260615-hr0
      // quick-260713-ng7: reset simétrico del flag review-only. resetSession es
      // el chokepoint de "volver al home"; sin esto el flag podría arrastrarse a
      // la siguiente sesión REAL y suprimir su persistencia (bug de contabilidad).
      this.sessionReviewOnly = false;
      // Phase 3 plan 01: limpiar también los sub-estados de los tipos nuevos.
      // Match queda con sus placeholders (plan 02 los activará); aquí solo
      // reset uniforme. Si en el futuro emergen más sub-estados por tipo,
      // este helper sigue siendo el único sitio donde se resetean.
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      // Phase 6 (D-107): el sub-estado de captura del primer pareo erróneo
      // sigue el mismo lifecycle que matchHadFailure — se resetea por sesión.
      this.matchFirstWrongPair = null;
    },

    // ════════════════════════════════════════════════════════════════════════
    // Helper de confirmación inline (D-27 / D-43 / D-44)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Pone `this.confirmDialog` con el shape requerido. El template HTML
     * (index.html) renderiza un panel discreto con `x-show` y dos botones.
     *
     * Patrón único para los puntos de descarte / confirmación de trabajo:
     *   - D-27 (Plan 02-03): abandono mid-Repaso.
     *   - D-43 (Plan 02-04): descarte de Test completo in-flight desde banner.
     *   - D-44 (Plan 02-04): lanzar Test completo nuevo con uno in-flight.
     *   - D-76 (Phase 4): confirmar import de backup (5ª call-site).
     *
     * ME-01 fix: `onCancel` opcional. Cuando el usuario pulsa el botón
     * Cancelar del dialog, el template HTML invoca `onCancel` (si está
     * definido) tras nulear `confirmDialog`. Esto permite a la call-site
     * limpiar estado scratch (e.g. `backupPendingImport`) sin que el helper
     * conozca dominios específicos. Las 4 call-sites previas (D-27/D-43/D-44/
     * conflict-Test-completo) NO suministran `onCancel` y siguen funcionando
     * igual (opcional).
     *
     * @param {{message:string, confirmLabel:string, cancelLabel?:string, onConfirm:()=>void, onCancel?:()=>void}} opts
     */
    requestConfirm(opts) {
      this.confirmDialog = {
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel ?? 'Cancelar',
        onConfirm: opts.onConfirm,
        onCancel: opts.onCancel ?? null
      };
    },

    // ════════════════════════════════════════════════════════════════════════
    // Picker — D-33, D-34, D-35
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Toggle de checkbox. Si la categoría está marcada, se desmarca; si no, se
     * añade. La reactividad de Alpine necesita asignación nueva del array
     * (no `push`/`splice` in-place), así que devolvemos un array nuevo.
     *
     * @param {string} catId
     */
    pickerToggleCategory(catId) {
      const idx = this.pickerCheckedCategoryIds.indexOf(catId);
      if (idx === -1) {
        this.pickerCheckedCategoryIds = [...this.pickerCheckedCategoryIds, catId];
      } else {
        this.pickerCheckedCategoryIds = this.pickerCheckedCategoryIds.filter(c => c !== catId);
      }
    },

    /** Marca todas las categorías disponibles en `content.categories`. */
    pickerSelectAll() {
      this.pickerCheckedCategoryIds = this.content.categories.map(c => c.id);
    },

    /** Desmarca todas. Botón `Empezar` quedará disabled. */
    pickerClearAll() {
      this.pickerCheckedCategoryIds = [];
    },

    /**
     * Arranca la sesión según `pickerMode`. Computa los `exerciseIds`
     * llamando al sampler de dominio (`buildSession` para Repaso 20,
     * `buildFullTest` para Test completo) y transiciona a la pantalla
     * `session` con todos los sub-estados de sesión a default.
     *
     * Para `test-completo`: escribe `inFlightTest` inicial (cursor=0,
     * answers=[]) ANTES de transicionar a session, así si el usuario cierra
     * la pestaña antes de responder el primer ejercicio, el banner aparecerá
     * con `0/N ejercicios` (D-41/D-42).
     */
    startSession() {
      // Phase 16: el sampler opera sobre SLOTS (slot id == exercise id para
      // legacy de 1 variante); el return lleva `variantIndices` paralelo.
      const allExercises = Object.values(this.content.slotById);
      let result;
      if (this.pickerMode === 'repaso') {
        result = buildSession(
          this.pickerCheckedCategoryIds,
          allExercises,
          this.state,
          20,
          'repaso'
        );
      } else if (this.pickerMode === 'test-completo') {
        result = buildFullTest(this.pickerCheckedCategoryIds, allExercises);
      } else {
        // Defensivo: pickerMode inválido — no arrancamos.
        return;
      }

      // Reset session sub-estado.
      this.cancelAutoAdvance();
      // quick-260615-puq (WARNING 2 / hueco S-2): startSession llamaba
      // cancelAutoAdvance() pero NO cancelMatchFlash(); añadimos ambos +
      // cancelSessionTimer() (el nuevo) aprovechando que ya tocamos el site.
      this.cancelMatchFlash();
      this.cancelSessionTimer();
      // quick-260615-puq (CONTEXT decisión 1): enciende el cronómetro según el
      // checkbox del picker. Repaso Y test-completo lo respetan.
      this.sessionTimed = this.pickerTimed;
      this.sessionMode = this.pickerMode;
      this.sessionExerciseIds = result.exerciseIds;
      // Phase 16 (D-16-08): la variante fijada por slot viaja paralela.
      this.sessionVariantIndices = result.variantIndices;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      // Phase 3 plan 01: inicializar sub-estado del PRIMER ejercicio (si
      // hay alguno). En pool vacío `result.exerciseIds = []` y el getter
      // sessionCurrentExercise devuelve null defensivamente. Phase 16: el
      // getter slot-aware re-envuelve la variante fijada (cursor=0).
      if (result.exerciseIds.length > 0) {
        this.initSubStateForExercise(this.sessionCurrentExercise);
      }

      // D-41 / D-42 (Plan 02-04): primer write de inFlightTest para Test
      // completo. A partir de aquí cada respuesta y cada advance lo
      // re-escribirán. Se preserva startedAt si por alguna razón ya existía
      // (no debería en el path normal de Test nuevo — el conflict de D-44
      // lo limpia primero — pero defensivo).
      if (this.pickerMode === 'test-completo') {
        this.persistInFlightTest();
      }

      this.currentScreen = 'session';
    },

    /**
     * Phase 6 plan 01 (UX-01) — D-100/D-101/D-102/D-103/D-104.
     * Phase 8.y (quick 260525-vvj) — dual-mode extension: el handler ahora
     * dispatcha INTERNAMENTE según `sessionMode`. El nombre se preserva
     * (sigue siendo `restartRepaso`) para no romper el binding `@click` en
     * index.html ni los presence-checks Phase 6; el JSDoc + comentarios
     * inline cubren la semántica dual.
     *
     * Reinicia la sesión actual en 1 clic desde la pantalla session,
     * manteniendo las MISMAS categorías seleccionadas y descartando los
     * aciertos no comprometidos (rama Repaso). Los fallos D-54 ya
     * persistidos vía applyImmediateFailure NO se deshacen — el invariante
     * "te obliga a no olvidar" prevalece.
     *
     * Semántica (D-101 + Phase 8.y):
     *   - Pickeable cuando `sessionMode === 'repaso'` (D-100) O cuando
     *     `sessionMode === 'test-completo'` (Phase 8.y backlog item ROADMAP
     *     línea 327-329). Guard defensivo de entrada — el botón ya está
     *     condicionado por `x-show` en index.html, pero el guard hace que
     *     un click accidental por teclado/script sea no-op si el modo no
     *     es uno de los dos.
     *   - Rama Repaso: re-llama `buildSession` con `pickerCheckedCategoryIds`
     *     preservadas y el state actual (post-D-54 cascada si aplica). Los
     *     20 nuevos ejercicios pueden diferir de los previos por
     *     aleatoriedad del sampler — comportamiento deseable. NO se invoca
     *     `persistInFlightTest` (Repaso nunca persiste in-flight,
     *     SESSION-08 intacto).
     *   - Rama Examen (test-completo): re-llama `buildFullTest([catId])`
     *     con la única categoría del Examen activo (pickerCheckedCategoryIds
     *     contiene `[catId]` desde el `_launchExamen` original — Examen es
     *     1-cat por D-181/D-189) + invoca `persistInFlightTest()` al final
     *     (D-182 slot único, coherente con `_launchExamen` línea 420 — el
     *     nuevo orden se re-persiste, sobreescribiendo el inFlightTest
     *     anterior). Cero migración schemaVersion (D-192 — el shape es
     *     idéntico).
     *   - Resetea sub-estado de sesión idéntico a startSession/_launchExamen
     *     (cursor, sessionResults, sub-templates word-buttons/match)
     *     preservando `sessionMode`, `pickerCheckedCategoryIds`,
     *     `currentScreen`, y el `this.state` mismo en rama Repaso.
     *
     * Por qué NO se llama `saveState` ni se reasigna `this.state` en
     * NINGUNA rama:
     *   - Los aciertos no-comprometidos se descartan por diseño (SESSION-08).
     *   - Los fallos D-54 YA están persistidos por `applyImmediateFailure`
     *     en `sessionSelectOption` / `matchPickRight` — no requiere acción.
     *   - `exerciseStats` NO se bumpean en restart (D-09 monotonicidad
     *     preservada — coherente con SESSION-08 abandono Repaso; en Examen
     *     la cascada multi-cat se mantiene intacta).
     *
     * Cancelaciones defensivas (Pattern S-2 — Phase 3):
     *   - `cancelAutoAdvance()` antes del reset evita que un setTimeout
     *     pendiente dispare `sessionAdvance()` sobre state ya reseteado.
     *   - `cancelMatchFlash()` idem para el flash rojo de match.
     *
     * NO confirmación inline (D-102 + Phase 8.y coherencia): reset directo
     * en 1 clic en AMBAS ramas. El dolor del UAT Phase 4 era "4 clicks vs
     * 1 click"; añadir confirmación devolvería a 2 clicks + modal y
     * contradiría el espíritu del feature.
     *
     * Pattern reuse: el bloque de reset replica el patrón de
     * startSession/_launchExamen SIN tocar `sessionMode`/`currentScreen`/
     * `pickerCheckedCategoryIds`. El refactor a helper común se difiere
     * (CONTEXT D-104 "duplicación aceptable v1; refactor solo si emerge
     * 3er call-site"; Phase 8.y sigue en 2 call-sites del patrón).
     */
    restartRepaso() {
      // D-100 / D-104 / Phase 8.y: guard defensivo — solo aplica a Repaso 20
      // (rama buildSession) o a Examen (rama buildFullTest).
      if (this.sessionMode !== 'repaso' && this.sessionMode !== 'test-completo') return;

      // Pattern S-2: cancelar timeouts antes de cualquier reset.
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer(); // quick-260615-puq

      // Pool completo del contenido — compartido por ambas ramas.
      // Phase 16: el sampler opera sobre SLOTS; el re-roll puede fijar
      // variantIndices distintos (EXAM-04 — la memorización por palabras muere
      // porque la superficie cambia entre pasadas).
      const allExercises = Object.values(this.content.slotById);

      // Dispatch dual-mode: buildSession (Repaso 20) vs buildFullTest (Examen).
      let result;
      if (this.sessionMode === 'test-completo') {
        // Phase 8.y rama Examen — coherente con _launchExamen línea 379.
        // Defensa: pickerCheckedCategoryIds debe contener [catId] desde el
        // _launchExamen original. Un array vacío indicaría state corrupto
        // → no-op temprano (evita pasar [undefined] a buildFullTest).
        if (this.pickerCheckedCategoryIds.length === 0) return;
        const catId = this.pickerCheckedCategoryIds[0];
        // Sin rng explícito — usa default Math.random (coherente con
        // _launchExamen línea 379).
        result = buildFullTest([catId], allExercises);
      } else {
        // Rama Repaso 20 — comportamiento Phase 6 D-100 intacto.
        result = buildSession(
          this.pickerCheckedCategoryIds,
          allExercises,
          this.state,
          20,
          'repaso'
        );
      }

      // Reset sub-estado de sesión (idéntico al patrón de startSession y
      // _launchExamen — superset completo reusable por ambas ramas dual-mode).
      // NO tocamos sessionMode (preservado en 'repaso' o 'test-completo'
      // según la rama tomada arriba) ni pickerCheckedCategoryIds (preservado
      // para futuros restarts; en rama Examen ya contiene [catId]) ni
      // currentScreen (ya estamos en 'session'). NO se llama saveState ni
      // se reasigna this.state — los aciertos no-comprometidos se descartan
      // sin tocar localStorage (D-101 + SESSION-08); los fallos D-54 ya
      // persistidos por sessionSelectOption/matchPickRight quedan intactos.
      this.sessionExerciseIds = result.exerciseIds;
      // Phase 16 (D-16-08 / EXAM-04): la variante re-rolleada viaja paralela.
      this.sessionVariantIndices = result.variantIndices;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false; // quick-260615-hr0
      // Sub-estados word-buttons (Phase 3).
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      // Sub-estados match (Phase 3).
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      // Phase 6 plan 02 (D-107 + D-112): cierre del loop iniciado en plan
      // 06-01 — el prop matchFirstWrongPair se resetea aquí también para que
      // el restart no arrastre la captura del pareo erróneo de una sesión
      // previa que tuviera fallos match.
      this.matchFirstWrongPair = null;
      // WR-02 defensa explícita: el reset del flash state ya lo hace
      // `cancelMatchFlash()` (línea 487 de este método) pero lo replicamos
      // aquí inline para que el invariante "post-restartRepaso, ningún
      // sub-estado de match queda residual" sea legible en bloque, sin
      // tener que cruzar a la implementación de cancelMatchFlash. Si en
      // el futuro cancelMatchFlash se refactoriza y deja de limpiar
      // `matchFlashIdx` incondicionalmente, este reset inline mantiene la
      // garantía.
      this.matchFlashIdx = null;
      this.matchFlashHandle = null;

      // Inicializar sub-estado del PRIMER ejercicio del nuevo sample.
      // Si el pool quedó vacío (edge improbable post-cascada masiva),
      // initSubStateForExercise no se invoca; el getter sessionCurrentExercise
      // devuelve null y el <template x-if> de index.html evita render.
      // Phase 16: el getter slot-aware re-envuelve la variante re-rolleada (cursor=0).
      if (result.exerciseIds.length > 0) {
        this.initSubStateForExercise(this.sessionCurrentExercise);
      }

      // Phase 8.y — re-persistir inFlightTest SOLO en rama Examen (D-182
      // slot único, coherente con _launchExamen línea 420). El nuevo orden
      // de exerciseIds sobreescribe el inFlightTest anterior; sessionMode
      // y pickerCheckedCategoryIds siguen siendo [catId] así el banner
      // reanudar (D-183 copy genérica) lo recupera correctamente si el
      // autor recarga la pestaña antes de terminar.
      //
      // Rama Repaso NO persiste (SESSION-08 intacto — Repaso es desechable).
      if (this.sessionMode === 'test-completo') {
        this.persistInFlightTest();
      }
    },

    // ════════════════════════════════════════════════════════════════════════
    // Repetir las falladas — reintento REVIEW-ONLY (quick-260713-ng7)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * quick-260713-ng7: relanza una sesión IN-PLACE (reusa la pantalla de
     * sesión existente) conteniendo SOLO los ejercicios fallados en la ronda
     * recién terminada, con la MISMA variante fallada (D-16-09). Espeja el
     * patrón de reset de `restartRepaso()`.
     *
     * REVIEW-ONLY: NO llama `saveState`, NO reasigna `this.state`, NO toca
     * `summarySessionResults`/`summaryDelta` (para poder re-mostrar el resumen
     * original al terminar). El flag `sessionReviewOnly=true` suprime la
     * cascada D-54 en los dos call-sites de fallo y el `completeSession()` de
     * `sessionAdvance` — esos fallos ya se contaron en la ronda original.
     *
     * Deriva las falladas del snapshot `summarySessionResults` con el predicado
     * CANÓNICO usado en el HTML y en la sección "ERRORES COMETIDOS":
     * `!r.correct && content.slotById[r.exerciseId]` (fallada con slot vivo).
     * Si no hay falladas → no-op.
     */
    startFailedReview() {
      // Derivar las falladas de la ronda terminada (predicado canónico).
      const failed = this.summarySessionResults.filter(
        r => !r.correct && this.content.slotById[r.exerciseId]
      );
      const ids = failed.map(r => r.exerciseId);
      const vIdx = failed.map(r => r.variantIndex ?? 0);

      // Guard de entrada: sin falladas con slot vivo → no-op.
      if (ids.length === 0) return;

      // Pattern S-2: cancelar timeouts antes de cualquier reset (espejo restartRepaso).
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
      this.cancelSessionTimer();

      // Encender el modo review-only. sessionMode='repaso-fallidas' es distinto
      // de 'repaso'/'test-completo' → restartRepaso sale temprano,
      // persistInFlightTest nunca dispara, requestReturnToHome va directo a home.
      this.sessionReviewOnly = true;
      this.sessionMode = 'repaso-fallidas';

      // Repoblar los arrays paralelos slot/variante (misma variante fallada).
      this.sessionExerciseIds = ids;
      this.sessionVariantIndices = vIdx;

      // Reset de sub-estado de sesión (VERBATIM del bloque de restartRepaso).
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false;
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      this.matchFirstWrongPair = null;
      this.matchFlashIdx = null;
      this.matchFlashHandle = null;

      // Inicializar sub-estado del PRIMER ejercicio (ids.length > 0 garantizado).
      this.initSubStateForExercise(this.sessionCurrentExercise);

      // Reusar la pantalla de sesión existente. NO saveState, NO this.state,
      // NO tocar summary* (el resumen original sigue disponible al terminar).
      this.currentScreen = 'session';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Persistencia in-flight Test completo (D-41/D-42/D-43/D-44/D-45)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * D-41/D-42 (Plan 02-04): persiste el state actual del Test completo en
     * curso como `state.inFlightTest`. Invocado desde:
     *   - `startSession` cuando mode='test-completo' (initial write).
     *   - `sessionSelectOption` tras cada push a sessionResults.
     *   - `sessionAdvance` cuando NO termina (cursor avanzado).
     *
     * Shape del inFlightTest (D-41):
     *   {
     *     categoryIds: string[],   // las cats elegidas en el picker; preservadas
     *                              // del valor previo cuando el usuario reanuda
     *                              // un test (no toca picker)
     *     exerciseIds: string[],   // orden generado por buildFullTest
     *     cursor: number,          // 0..length
     *     answers: Array<{exerciseId, correct}>,
     *     startedAt: number        // epoch ms; preservado si ya existe
     *   }
     *
     * Notas:
     *   - `pickerCheckedCategoryIds` puede estar vacío si el usuario reanudó
     *     (el picker no se tocó); por eso si está vacío preservamos el
     *     `inFlightTest.categoryIds` previo.
     *   - `startedAt` se setea sólo la primera vez (initial write); luego
     *     se preserva. Informativo — no usado para staleness en v1.
     */
    persistInFlightTest() {
      const prev = this.state.inFlightTest;
      const categoryIds = this.pickerCheckedCategoryIds.length > 0
        ? [...this.pickerCheckedCategoryIds]
        : (prev?.categoryIds ?? []);
      // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
      // Combina el firstUsedAt-set con el inFlightTest-set en un único spread
      // para que `this.state` cambie de una sola vez (Alpine reactivity +
      // inmutabilidad consistente).
      this.state = {
        ...this.state,
        firstUsedAt: this.state.firstUsedAt ?? new Date().toISOString(),
        inFlightTest: {
          categoryIds,
          exerciseIds: [...this.sessionExerciseIds],
          // Phase 16 (D-16-09): la variante fijada por slot viaja en el blob
          // para que reanudar muestre la MISMA variante (no se re-sortea).
          // Array paralelo a exerciseIds — sin bump de schemaVersion (sigue v6).
          variantIndices: [...this.sessionVariantIndices],
          cursor: this.sessionCursor,
          answers: [...this.sessionResults],
          startedAt: prev?.startedAt ?? Date.now()
        }
      };
      saveState(this.state);
    },

    /**
     * D-43 (Plan 02-04): click sobre `Reanudar` en el banner in-flight del
     * home. Restaura el sub-estado de sesión desde `state.inFlightTest` y
     * navega a `session`.
     *
     * Pitfall #5 (RESEARCH): validación de IDs stale. Si el autor editó el
     * JSON entre sesiones y borró ejercicios del test, los IDs en
     * `inFlightTest.exerciseIds` pueden no existir ya en `content.exerciseById`.
     * Comportamiento: si NO hay ejercicios válidos restantes (todos los que
     * faltan por responder son stale), pedimos confirmación para descartar el
     * test en lugar de crashear al intentar renderizar `null.payload.prompt`.
     */
    resumeInFlightTest() {
      const ift = this.state.inFlightTest;
      if (!ift) return; // defensivo — no debería pasar si el banner está visible
      // Validación stale: ¿algún exerciseId restante (>= cursor) ya no existe?
      const remainingIds = ift.exerciseIds.slice(ift.cursor);
      const allRemainingExist = remainingIds.every(eid => this.content.exerciseById[eid] !== undefined);
      if (!allRemainingExist) {
        this.requestConfirm({
          message: 'El test que tenías a medias ya no es válido (algún ejercicio fue eliminado del contenido). ¿Descartarlo?',
          confirmLabel: 'Descartar',
          cancelLabel: 'Cancelar',
          onConfirm: () => this.clearInFlightTest()
        });
        return;
      }
      // Restaurar sub-estado session desde el inFlightTest.
      this.sessionMode = 'test-completo';
      this.sessionExerciseIds = [...ift.exerciseIds];
      // Phase 16 (D-16-09 / D-16-10): restaurar la variante fijada por slot.
      // Back-compat: un inFlightTest pre-existente (escrito antes de esta fase)
      // NO lleva `variantIndices` → rellenar con 0 por id restante (los slots
      // legacy son de 1 variante, índice 0 correcto). Sin migración de schemaVersion.
      // WR-02: si el autor editó el JSON entre sesiones y un slot encogió su
      // `variants[]`, un índice persistido fuera de rango debe clamparse a 0
      // (D-16-09: reanudar muestra la MISMA variante salvo que ya no exista).
      this.sessionVariantIndices = Array.isArray(ift.variantIndices)
        ? ift.exerciseIds.map((id, i) => {
            const n = this.content.slotById[id]?.variants?.length ?? 1;
            const v = ift.variantIndices[i] ?? 0;
            return v < n ? v : 0; // clamp stale/shrunk index to 0
          })
        : ift.exerciseIds.map(() => 0);
      this.sessionCursor = ift.cursor;
      this.sessionResults = [...ift.answers];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      this.sessionExplanationRevealed = false; // quick-260615-hr0
      // Preservar categoryIds en pickerCheckedCategoryIds para que un futuro
      // persistInFlightTest mid-resume capture las mismas categorías (no es
      // crítico — persistInFlightTest cae al fallback `prev?.categoryIds`).
      this.pickerCheckedCategoryIds = [...ift.categoryIds];
      // Phase 3 plan 01: inicializar sub-estado del ejercicio en el cursor
      // restaurado. Si el ejercicio actual es word-buttons, el banco se
      // re-baraja (D-57); no preservamos el banco previo entre sesiones
      // porque inFlightTest no guarda sub-estado de tipo (sólo cursor +
      // answers). Trade-off aceptable — la frase a construir es la misma.
      if (this.sessionExerciseIds[this.sessionCursor]) {
        // Phase 16: el getter slot-aware resuelve la variante en el cursor
        // restaurado. Si `sessionVariantIndices` está vacío (resume legacy),
        // el getter cae a índice 0 (D-16-10).
        this.initSubStateForExercise(this.sessionCurrentExercise);
      }
      this.currentScreen = 'session';
    },

    /**
     * D-45 (Plan 02-04): limpia `state.inFlightTest` (lo pone undefined) y
     * persiste. No requiere confirmación porque las rutas que llaman aquí
     * ya pasaron por un `requestConfirm` (D-43 botón Descartar; D-44 conflict
     * en openPicker; futuro: completar el Test completo lo borra vía
     * applySessionResult paso 6 — ese path NO pasa por aquí).
     *
     * `JSON.stringify` elide `undefined`, así que tras saveState el blob
     * persistido en localStorage NO contiene la clave `inFlightTest`.
     */
    clearInFlightTest() {
      this.state = { ...this.state, inFlightTest: undefined };
      saveState(this.state);
    },

    /**
     * D-43 (Plan 02-04): click sobre `Descartar` en el banner in-flight del
     * home. Confirmación inline con el helper estándar; al confirmar, limpia.
     */
    discardInFlightTestWithConfirm() {
      this.requestConfirm({
        message: '¿Descartar el test? Los aciertos hasta ahora no se guardarán.',
        confirmLabel: 'Descartar',
        cancelLabel: 'Cancelar',
        onConfirm: () => this.clearInFlightTest()
      });
    },

    // ════════════════════════════════════════════════════════════════════════
    // Backup — handlers Phase 4 (D-73 ... D-84)
    //
    // Handlers expuestos al template:
    //   - `exportBackup()`        — binding `@click` botón "Exportar progreso".
    //   - `onFileSelected(event)` — binding `@change` del `<input type="file">`.
    //   - `commitImport()`        — invocado en el onConfirm del requestConfirm
    //                               de onFileSelected.
    //   - `buildImportConfirmMessage(summary)` — helper interno usado por
    //                               onFileSelected para construir el cuerpo
    //                               del confirm inline (D-76).
    // ════════════════════════════════════════════════════════════════════════

    /**
     * D-83: `exportBackup()` exporta el state actual como JSON descargado por
     * el navegador.
     *
     * Pipeline (RESEARCH §1 + PATTERNS líneas 335-366):
     *   1. Build wrapper vía `buildBackupWrapper` (D-73, módulo puro).
     *   2. `JSON.stringify` + Blob + URL.createObjectURL.
     *   3. `<a download>` programático con nombre `italian-course-backup-
     *      ${todayLocal()}.json` (D-75).
     *   4. `revokeObjectURL` diferido a tick siguiente (Pitfall #1 — evita
     *      free memory leaks por blobs no revocados).
     *   5. Actualiza `state.lastBackupAt` con ISO actual (D-77) vía spread
     *      inmutable (Alpine reactivity sobre el banner getter).
     *   6. Guard primer-export: si `firstUsedAt` aún era null, también se
     *      setea ahora (defensa contra usuarios que importan/exportan antes
     *      de completar una sesión).
     *   7. `saveState` persiste a localStorage.
     *   8. Mensaje verde en `backupLastMessage` (D-83).
     *
     * Error path: cualquier throw cae al catch → mensaje rojo en
     * `backupLastMessage`. No bloquea la UI.
     */
    exportBackup() {
      try {
        const wrapper = buildBackupWrapper(this.state);
        const jsonStr = JSON.stringify(wrapper, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `italian-course-backup-${todayLocal()}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 0); // Pitfall #1 + #7

        // ME-03 fix: timestamp único compartido. Antes se llamaba a
        // `new Date().toISOString()` dos veces (lastBackupAt + firstUsedAt
        // en sus respectivos spreads), produciendo ISOs que podían diferir
        // por microsegundos y disparando dos updates reactivos de Alpine en
        // lugar de uno. Ahora computamos el ISO una vez y hacemos UN solo
        // spread.
        const now = new Date().toISOString();
        // D-77 actualiza lastBackupAt. D-78 primer-export-guard: si nunca se
        // había marcado firstUsedAt (porque el usuario nunca completó una
        // sesión), el export también lo marca — el banner respeta este
        // instant como "comencé a usar la app". `firstUsedAt ?? now` mantiene
        // el valor previo cuando ya estaba seteado.
        this.state = {
          ...this.state,
          lastBackupAt: now,
          firstUsedAt: this.state.firstUsedAt ?? now
        };
        saveState(this.state);

        this.backupLastMessage = {
          kind: 'success',
          text: 'Progreso exportado. Guarda el archivo en lugar seguro.'
        };
      } catch (err) {
        this.backupLastMessage = {
          kind: 'error',
          text: `Error al exportar: ${String(err?.message ?? err)}`
        };
      }
    },

    /**
     * D-76: handler async del `<input type="file" @change>` de import.
     *
     * Pipeline (PATTERNS líneas 377-405 + RESEARCH §2):
     *   1. Lee el File via `Blob.text()` (Promise-based desde 2021).
     *   2. Llama `parseBackupFile` (módulo puro src/data/backup.js).
     *   3. Si ok=false → mensaje rojo + reset input.value (Pitfall #2: el
     *      mismo archivo debe poder re-seleccionarse para re-intentar).
     *   4. Si ok=true → guarda en `backupPendingImport` + dispara
     *      `requestConfirm()` inline (4ª call-site D-76) con summary.
     *   5. Confirmación → `commitImport()`. Cancelación → onCancel limpia
     *      `backupPendingImport` (ME-01 fix; antes quedaba inerte hasta el
     *      siguiente import — defensa contra estado fantasma).
     *   6. `input.value = ''` SIEMPRE al final (Pitfall #2).
     *
     * Nota sobre `requestConfirm`: la firma admite `onCancel` opcional
     * desde ME-01 fix. Sin `onCancel`, el comportamiento es no-op tras
     * pulsar Cancelar (compatibilidad con las 4 call-sites previas).
     *
     * @param {Event} event - El change event del file input.
     */
    async onFileSelected(event) {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) return; // cancelar el file picker → no-op

      let rawText;
      try {
        rawText = await file.text();
      } catch (err) {
        this.backupLastMessage = {
          kind: 'error',
          text: `No se pudo leer el archivo: ${String(err?.message ?? err)}`
        };
        input.value = '';
        return;
      }

      const result = parseBackupFile(rawText);
      if (!result.ok) {
        this.backupLastMessage = { kind: 'error', text: result.reason };
        input.value = '';
        return;
      }

      // Guardar payload validado, pendiente de confirmación inline (D-76).
      this.backupPendingImport = { state: result.state, summary: result.summary };
      // ME-01 fix: `onCancel` limpia `backupPendingImport` para que no quede
      // estado fantasma si el usuario pulsa Cancelar (antes lingueaba hasta
      // el siguiente import o reload).
      this.requestConfirm({
        message: this.buildImportConfirmMessage(result.summary),
        confirmLabel: 'Continuar',
        cancelLabel: 'Cancelar',
        onConfirm: () => this.commitImport(),
        onCancel: () => { this.backupPendingImport = null; }
      });
      input.value = ''; // Pitfall #2 — siempre reset al final.
    },

    /**
     * D-76: aplica el import previamente confirmado por el usuario.
     *
     * Pitfall #10: `resetSession()` ANTES de reemplazar `this.state` — si
     * había una sesión in-flight, se descarta limpiamente antes de que
     * cualquier getter dependiente del state importado evalue. El listener
     * `@keydown.window` del session sub-template se desmonta automáticamente
     * al cambiar `currentScreen` (D-72).
     */
    commitImport() {
      if (!this.backupPendingImport) return;
      this.resetSession();
      // HI-01 fix (D-40 / DOMAIN-06): re-run boot regression sobre el state
      // importado ANTES de que la tabla home renderice. Sin esto, un backup
      // de una versión del content con menos ejercicios por categoría
      // mantendría categorías marcadas 'hecha'/'dominada' aunque el
      // clearedExerciseIds no cubra los ejercicios actuales — el home table
      // mentiría sobre el progreso hasta que el usuario re-practicara la
      // categoría. La regresión es idempotente cuando el backup ya cubre todo.
      let imported = applyNewExerciseRegression(this.backupPendingImport.state, this.content);

      // ME-04 fix: reap orphan entries en exerciseStats y categoryProgress.
      // Un backup viejo puede contener stats / progress de ejercicios o
      // categorías que ya no existen en el content actual (ej. el autor
      // renombró o eliminó un ejercicio entre exports). Estas entradas son
      // huérfanas — nunca se referencian y van acumulando localStorage
      // bytes import tras import. Coste de cleanup: O(N) sobre keys, una
      // sola vez por import. Idempotente cuando no hay huérfanos.
      const validExerciseIds = new Set(Object.keys(this.content.exerciseById ?? {}));
      const validCategoryIds = new Set((this.content.categories ?? []).map(c => c.id));
      const reapedExerciseStats = {};
      for (const [eid, stat] of Object.entries(imported.exerciseStats ?? {})) {
        if (validExerciseIds.has(eid)) reapedExerciseStats[eid] = stat;
      }
      const reapedCategoryProgress = {};
      for (const [cid, prog] of Object.entries(imported.categoryProgress ?? {})) {
        if (validCategoryIds.has(cid)) reapedCategoryProgress[cid] = prog;
      }
      // WR-02: el mismo reaping ME-04 aplica al sub-árbol songProgress. Un
      // backup que referencia un song id ya ausente de content.songsById (el
      // autor renombró/eliminó un JSON de canción entre exports) acumularía
      // huérfanos invisibles (songsForDisplay itera songsById, no songProgress).
      // LINK-04: el set válido son las keys de songsById, sin mezclar pools.
      const validSongIds = new Set(Object.keys(this.content.songsById ?? {}));
      const reapedSongProgress = {};
      for (const [sid, prog] of Object.entries(imported.songProgress ?? {})) {
        if (validSongIds.has(sid)) reapedSongProgress[sid] = prog;
      }
      imported = {
        ...imported,
        exerciseStats: reapedExerciseStats,
        categoryProgress: reapedCategoryProgress,
        songProgress: reapedSongProgress
      };

      this.state = imported;
      saveState(this.state);
      this.backupPendingImport = null;
      this.backupLastMessage = {
        kind: 'success',
        text: 'Progreso importado correctamente.'
      };
      this.currentScreen = 'home';
    },

    /**
     * D-76 + UI-SPEC líneas 211-224: construye el cuerpo multi-párrafo del
     * confirm dialog inline. Newlines (`\n\n`) renderizan como gaps visuales
     * gracias a `white-space: pre-line` en `#confirm-message` (styles.css).
     *
     * @param {{exportedAt: string, categories: number, exercises: number}} summary
     * @returns {string}
     */
    buildImportConfirmMessage(summary) {
      const exportedDate = summary.exportedAt === 'desconocido'
        ? 'fecha desconocida'
        : new Date(summary.exportedAt).toLocaleString('es-ES');
      return (
        `Vas a importar un backup del ${exportedDate}.\n\n` +
        `Categorías con progreso: ${summary.categories}\n` +
        `Ejercicios con stats: ${summary.exercises}\n\n` +
        `Esto REEMPLAZARÁ tu progreso actual y no se puede deshacer.`
      );
    },

    // ════════════════════════════════════════════════════════════════════════
    // Sesión — migrada íntegra de Phase 1 con prefijo `session*` (D-25)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Click sobre una de las opciones. Califica via registry, marca feedback,
     * y schedule auto-advance ÚNICAMENTE si la respuesta fue correcta.
     *
     * Migrado de Phase 1 sin cambios estructurales — solo prefijo de nombres.
     * T-02-02: guard contra double-clicks (si ya hay feedback, ignora).
     *
     * D-54 (UAT round 2): cuando la respuesta es INCORRECTA, aplicamos
     * `applyImmediateFailure` Y persistimos con `saveState` ANTES de exponer
     * el botón "Siguiente". Esto cierra el exploit "fallo + cierra pestaña":
     * la regresión de categoría queda persistida en el instante del click,
     * independientemente de si el usuario completa la sesión, descarta el
     * Repaso, o cierra la pestaña. Para aciertos, mantenemos el patrón
     * write-once-on-done de D-20 (acumulan en sessionResults y se persisten
     * al final via applySessionResult).
     *
     * @param {number} idx - Índice de la opción clicada (0-based).
     */
    sessionSelectOption(idx) {
      // T-02-02: ignora double-clicks o clicks tras ya haber respondido.
      if (this.sessionFeedback !== null) return;

      this.sessionSelectedIndex = idx;
      const ex = this.sessionCurrentExercise;
      const handler = registry[ex.type];
      const correct = handler.grade(ex, { index: idx });

      // Phase 3: la lógica común (feedback + push a sessionResults +
      // autoAdvance verde + cascada D-54 inmediata roja + persist inFlightTest
      // para Test completo) se delega en `applyResultToSession(ex, correct,
      // userAnswer)`. Esto centraliza el call-site de `applyImmediateFailure`
      // para los 3 tipos en su "decisión final" (multi-choice aquí,
      // word-buttons en wordButtonsCheck, match en matchPickRight al
      // completar todas las parejas). Pitfall #2 (decisión final duplicada)
      // evitado arquitectónicamente. matchPickRight tiene ADEMÁS un segundo
      // call-site directo de applyImmediateFailure en el primer fallo,
      // protegido por `matchHadFailure` (D-61).
      //
      // Phase 6 (D-105/D-106): pasamos el TEXTO LITERAL de la opción clickada
      // como userAnswer (no el índice — robusto frente a futuros refactors de
      // `options[]`). El summary post-sesión lo renderiza tal cual.
      this.applyResultToSession(ex, correct, ex.payload.options[idx]);
    },

    /**
     * Helper compartido que aplica el resultado del grading a la sesión.
     *
     * Single call-site de `applyImmediateFailure` para los 3 tipos de
     * ejercicio (multi-choice / word-buttons / match). Garantiza que la
     * cascada D-54 inmediata se ejecuta EXACTAMENTE UNA VEZ por ejercicio
     * fallado, idéntico para todos los tipos:
     *   1. Marca el feedback (`'correct'` o `'incorrect'`).
     *   2. Pushea el resultado a `sessionResults` para el resumen final.
     *   3. Si correcto → auto-avance 600ms (SESSION-05 verde, Pitfall #5
     *      handle cancelable).
     *   4. Si incorrecto → cascada D-54 inmediata: `applyImmediateFailure`
     *      sobre state + `saveState` síncrono. El estado refleja la regresión
     *      ANTES de que el usuario pueda abandonar la sesión.
     *      `applySessionResult` al final es idempotente respecto a este
     *      reset (FAIL-WINS aplicado sobre state ya reseteado = no-op);
     *      `exerciseStats` se bumpean una sola vez ahí, preservando D-09.
     *   5. Si modo Test completo → persistir inFlightTest con cursor +
     *      answers actualizados (D-42).
     *
     * Phase 3 plan 02 añadirá un segundo CALL-SITE de `applyImmediateFailure`
     * en `matchPickRight` con guard `matchHadFailure` (D-61: cascada en el
     * PRIMER intento erróneo del ejercicio, NO al final). Ese call-site usa
     * `applyImmediateFailure` directamente, NO este helper — porque la
     * semántica es distinta: el ejercicio CONTINÚA tras el primer fallo y
     * este helper se invocará al final con `correct: false` (idempotente
     * sobre la cascada ya aplicada).
     *
     * Phase 6 plan 02 (UX-02 / D-105 / D-106): firma extendida con un 3er arg
     * `userAnswer` que captura la respuesta literal del autor por tipo:
     *   - multi-choice: string (texto literal de la opción clickada).
     *   - word-buttons: string[] (clon defensivo del array formado).
     *   - match: { left, right } del primer pareo erróneo, o `null` si correcto.
     * El push extendido propaga `userAnswer` a `sessionResults`, que luego
     * Test completo persiste vía spread en `persistInFlightTest` (D-110) y
     * el summary lee para renderizar la sección "Errores cometidos" (D-108).
     *
     * @param {object} ex - El ejercicio actual (sessionCurrentExercise).
     * @param {boolean} correct - Resultado del grading.
     * @param {string|string[]|{left:string,right:string}|null} [userAnswer] -
     *   Respuesta literal del autor según tipo (D-105). El campo se serializa
     *   uniformemente para los 3 tipos; el dispatch por tipo lo decide cada
     *   call-site. `undefined` (cuando se omite el arg) llega al push como
     *   `undefined` — los call-sites Phase 6 SIEMPRE lo pasan; el default
     *   `undefined` defiende contra invocaciones legacy.
     */
    applyResultToSession(ex, correct, userAnswer) {
      // quick-260615-puq: responder detiene el cronómetro de respuesta ANTES de
      // fijar feedback. Idempotente con el self-call de onSessionTimeout.
      this.cancelSessionTimer();
      this.sessionFeedback = correct ? 'correct' : 'incorrect';
      // Phase 16 (D-16-09): registrar qué VARIANTE concreta se mostró, para que
      // el review de errores del summary resuelva la variante exacta fallada.
      // `ex` ya es el objeto re-envuelto por el getter slot-aware (lleva
      // `.id`/`.categoryIds`) — la cascada D-54 dispara por `slotId` sin cambio.
      this.sessionResults.push({
        exerciseId: ex.id,
        correct,
        userAnswer,
        variantIndex: this.sessionCurrentVariantIndex
      });

      if (correct) {
        // quick-260615-r3b (CAMBIO 1): el auto-avance al ACERTAR queda gated a
        // modo canción. En canción (Phase 13, PLAY-03) la siguiente frase se
        // resuelve contra `songPhraseById` vía `songAdvance` (NO `sessionAdvance`,
        // que lee de exerciseById donde la frase no existe — LINK-04), con el
        // avance rápido de 600ms. En ejercicios (repaso/test-completo/examen) NO
        // se programa ningún auto-avance: el HTML expone "Siguiente" que llamará
        // a sessionAdvance() cuando el usuario decida (espejo de la rama de fallo).
        if (this.sessionMode === 'cancion') {
          this.sessionAutoAdvanceHandle = setTimeout(() => this.songAdvance(), SESSION_AUTO_ADVANCE_MS);
        }
      } else {
        // quick-260713-ng7: en el reintento REVIEW-ONLY el usuario ve la
        // corrección roja/verde (sessionFeedback + push a sessionResults, ambos
        // runtime-only, ya aplicados arriba SIN guard) pero NO se persiste la
        // regresión — esos fallos ya se contaron en la ronda original.
        if (!this.sessionReviewOnly) {
          // D-54: cascada inmediata + persist (single call-site para todos
          // los tipos). Plan 02-03 UAT round 2 confirmó que este es el
          // único patrón que cierra el exploit "fallo + cierra pestaña".
          const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
          // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
          newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
          saveState(newState);
          this.state = newState;
        }
        // No schedule: el HTML expone "Siguiente" que llamará sessionAdvance()
        // cuando el usuario decida.
      }

      // D-42 (Plan 02-04): Test completo per-answer write. Tras pushear la
      // respuesta al sessionResults, persistir el inFlightTest con cursor +
      // answers actualizados. Esto cubre el caso de cerrar la pestaña entre
      // selectOption y advance (el botón Siguiente aún no fue pulsado).
      // Para Repaso: NO escribimos inFlightTest (SESSION-08: abandono
      // descarta — aciertos no se persisten mid-sesión, sólo fallos vía D-54).
      if (this.sessionMode === 'test-completo') {
        this.persistInFlightTest();
      }
    },

    /**
     * Avanza al siguiente ejercicio. Cancela cualquier setTimeout pendiente
     * antes (Pitfall #5).
     *
     * Si tras incrementar el cursor la sesión está terminada, dispara
     * `completeSession()` para aplicar la cascada/promociones y persistir.
     *
     * D-42 (Plan 02-04): para Test completo no-terminado, re-persistir el
     * inFlightTest con el cursor actualizado (captura el avance correcto post-
     * advance). Si la sesión está terminada, completeSession() correrá y
     * applySessionResult borrará inFlightTest (paso 6, D-45) — NO escribimos
     * aquí en ese caso para evitar un write redundante.
     */
    sessionAdvance() {
      this.cancelAutoAdvance();
      this.cancelSessionTimer(); // quick-260615-puq

      this.sessionCursor += 1;
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      // quick-260615-hr0: no arrastrar el revelado al siguiente ejercicio.
      this.sessionExplanationRevealed = false;

      if (this.sessionCursor >= this.sessionExerciseIds.length) {
        // quick-260713-ng7: en el reintento review-only NO se recomputa nada —
        // NO completeSession (que aplicaría applySessionResult + saveState +
        // computeSummaryDelta). Volvemos al resumen ORIGINAL sin tocar
        // summaryDelta/summarySessionResults, así el botón "Repetir las falladas"
        // vuelve a estar disponible. La racha, contadores y motor de repetición
        // quedan intactos.
        if (this.sessionReviewOnly) {
          this.sessionReviewOnly = false;
          this.sessionMode = null;
          this.currentScreen = 'summary';
        } else {
          this.completeSession();
        }
      } else {
        // Phase 3 plan 01: inicializar sub-estado del NUEVO ejercicio antes
        // de que Alpine reactive bindings lean el x-data (Pitfall #3: el
        // wordButtonsBank del ejercicio anterior arrastra basura si no
        // limpiamos antes del render del siguiente).
        // Phase 16: el cursor ya está avanzado; el getter slot-aware resuelve
        // la variante FIJADA del nuevo slot (NO se re-sortea aquí — EXAM-01).
        this.initSubStateForExercise(this.sessionCurrentExercise);

        if (this.sessionMode === 'test-completo') {
          // D-42: persistir cursor avanzado (captura el avance post-advance
          // ya aplicado).
          this.persistInFlightTest();
        }
      }
    },

    /**
     * Cancela el setTimeout pendiente (si lo hay). Idempotente — llamable
     * desde `sessionAdvance()`, `resetSession()`, `destroy()` sin error.
     */
    cancelAutoAdvance() {
      if (this.sessionAutoAdvanceHandle !== null) {
        clearTimeout(this.sessionAutoAdvanceHandle);
        this.sessionAutoAdvanceHandle = null;
      }
    },

    // ════════════════════════════════════════════════════════════════════════
    // Modo contrarreloj (quick-260615-puq — feature todo #4)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Arranca el cronómetro de respuesta del ejercicio actual. Enganchado al
     * FINAL de initSubStateForExercise (punto único por el que pasa cada
     * ejercicio nuevo). Guard estricto: solo arranca cuando la sesión está
     * cronometrada, aún no hay feedback, hay ejercicio actual y NO es canción.
     *
     * Mecanismo: un único setInterval (~100ms) que decrementa
     * sessionTimeRemainingMs; al llegar a ≤0 cancela y dispara onSessionTimeout.
     * Antes de arrancar llama cancelSessionTimer() (idempotencia — nunca dos
     * intervals vivos). Pureza de capa D-02: setInterval/clearInterval son
     * globales permitidos (igual que cancelAutoAdvance).
     */
    /**
     * Proxy de instancia del helper PURO de módulo `sessionTimeLimitMs`, para
     * que el template Alpine pueda computar el `:max` del <progress> del
     * cronómetro (el helper de módulo no está en el scope del x-data).
     * @param {object} ex
     * @returns {number}
     */
    sessionTimeLimitMs(ex) {
      return sessionTimeLimitMs(ex);
    },

    startSessionTimer() {
      // Idempotencia: nunca dejar dos intervals.
      this.cancelSessionTimer();
      if (
        !this.sessionTimed ||
        this.sessionFeedback !== null ||
        !this.sessionCurrentExercise ||
        this.sessionMode === 'cancion'
      ) {
        return;
      }
      const limit = sessionTimeLimitMs(this.sessionCurrentExercise);
      this.sessionTimeRemainingMs = limit;
      // Límite 0 (defensivo: word-buttons sin answer) → expira de inmediato.
      this.sessionTimerIntervalHandle = setInterval(() => {
        this.sessionTimeRemainingMs -= SESSION_TIMER_TICK_MS;
        if (this.sessionTimeRemainingMs <= 0) {
          this.sessionTimeRemainingMs = 0;
          this.cancelSessionTimer();
          this.onSessionTimeout();
        }
      }, SESSION_TIMER_TICK_MS);
    },

    /**
     * Disparado al agotarse el tiempo de respuesta. Guard: no actúa si la
     * sesión dejó de estar cronometrada o ya hay feedback (evita doble disparo
     * con un responder simultáneo). El timeout cuenta como FALLO reusando el
     * call-site único applyResultToSession(ex, false, null) — misma cascada
     * D-54 que una respuesta incorrecta. NO auto-avanza: el botón "Siguiente"
     * queda manual (CONTEXT decisión 2).
     */
    onSessionTimeout() {
      if (!this.sessionTimed || this.sessionFeedback !== null) return;
      this.cancelSessionTimer();
      this.applyResultToSession(this.sessionCurrentExercise, false, null);
    },

    /**
     * Cancela el cronómetro de respuesta (si lo hay). Idempotente —
     * llamable múltiples veces sin error (incluido el self-call desde
     * startSessionTimer/onSessionTimeout y desde applyResultToSession al
     * responder). Forma EXACTA del patrón cancelAutoAdvance: guard de null
     * antes de clear.
     */
    cancelSessionTimer() {
      if (this.sessionTimerIntervalHandle !== null) {
        clearInterval(this.sessionTimerIntervalHandle);
        this.sessionTimerIntervalHandle = null;
      }
      this.sessionTimeRemainingMs = 0;
    },

    /**
     * quick-260615-hr0 (feature todo #3): revela la explanation TRAS acertar,
     * bajo demanda (botón "¿Por qué?" o tecla `e`). Cancela el auto-avance y
     * deja la explicación + botón "Siguiente" para continuar manualmente.
     *
     * Guard defensivo: solo actúa en acierto con explanation real (evita
     * revelar sin sentido y mantener el flujo de fallo/canción intacto).
     */
    revealSessionExplanation() {
      if (this.sessionFeedback !== 'correct') return;
      if (!this.sessionCurrentExercise?.payload?.explanation) return;
      this.cancelAutoAdvance();
      this.sessionExplanationRevealed = true;
    },

    // ════════════════════════════════════════════════════════════════════════
    // Word-buttons handlers (Phase 3 plan 01; D-56, D-58, D-69)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Coloca el slot `slotIdx` del banco en el área respuesta (quick-260615-str).
     * El banco YA NO se muta: solo se registra el índice del slot en
     * `wordButtonsPlacedIdx`. El hueco se mantiene visualmente con un
     * placeholder invisible (visibility:hidden), evitando el reflow que
     * causaba mis-clicks.
     *
     * Inmutable: asigna un array NUEVO para que la reactividad de Alpine lo
     * detecte (in-place `push` no triggerea reactividad fiable).
     *
     * Guards: feedback activo (acertó/falló) → no-op; slot fuera de rango →
     * no-op; slot YA colocado → no-op (no duplica).
     *
     * @param {number} slotIdx - Índice del slot en `wordButtonsBank`.
     */
    wordButtonsAddWord(slotIdx) {
      if (this.sessionFeedback !== null) return;
      if (slotIdx < 0 || slotIdx >= this.wordButtonsBank.length) return;
      if (this.wordButtonsPlacedIdx.includes(slotIdx)) return;
      this.wordButtonsPlacedIdx = [...this.wordButtonsPlacedIdx, slotIdx];
    },

    /**
     * Inverso simétrico: quita la palabra en posición `answerPos` del área
     * respuesta. El slot liberado vuelve a su posición visual ORIGINAL en el
     * banco (quick-260615-str), porque el banco es estable y solo eliminamos
     * su índice de `wordButtonsPlacedIdx`.
     *
     * @param {number} answerPos - Posición en la respuesta (índice en
     *   `wordButtonsPlacedIdx` / `wordButtonsAnswer`).
     */
    wordButtonsRemoveWord(answerPos) {
      if (this.sessionFeedback !== null) return;
      if (answerPos < 0 || answerPos >= this.wordButtonsPlacedIdx.length) return;
      this.wordButtonsPlacedIdx = this.wordButtonsPlacedIdx.filter((_, i) => i !== answerPos);
    },

    /**
     * D-58: handler del botón "Comprobar" (también Enter cuando word-buttons
     * está en sessionFeedback === null). Llama al grader del registry y
     * delega en `applyResultToSession` (single call-site D-54).
     *
     * Guards: si ya hay feedback o el área respuesta está vacía (D-58
     * "deshabilitado"), no hacer nada.
     */
    wordButtonsCheck() {
      if (this.sessionFeedback !== null) return;
      if (!this.wordButtonsCanCheck) return;
      const ex = this.sessionCurrentExercise;
      const handler = registry[ex.type];
      const correct = handler.grade(ex, { tokens: this.wordButtonsAnswer });
      // Phase 6 (D-105/D-106 + Pattern S-1 inmutabilidad reactivity):
      // pasamos un CLON defensivo del array `wordButtonsAnswer` como userAnswer
      // — Alpine podría mutarlo en el reset post-sesión si lo pasáramos por
      // referencia. El spread garantiza que sessionResults guarda una snapshot
      // estable de la frase formada por el autor para renderizar luego en
      // summary "Errores cometidos".
      this.applyResultToSession(ex, correct, [...this.wordButtonsAnswer]);
    },

    // ════════════════════════════════════════════════════════════════════════
    // Match handlers (Phase 3 plan 02; D-60/D-61/D-66/D-70)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Selecciona un item de la columna izquierda. Sustituye cualquier
     * selección previa (D-70: pulsar otro número antes de letra reemplaza).
     *
     * Guards:
     *   - Si ya hay feedback → ignorado (final del ejercicio, no más selección).
     *   - Si el item izq ya está consumed (parte de una pareja correcta
     *     fijada) → ignorado.
     *
     * @param {number} idx - Índice en `matchLeft`.
     */
    matchSelectLeft(idx) {
      if (this.sessionFeedback !== null) return;
      if (this.matchLeftIsConsumed(idx)) return;
      this.matchSelectedLeftIdx = idx;
    },

    /**
     * Click sobre un item de la columna derecha. Evalúa la pareja formada
     * por `{matchLeft[matchSelectedLeftIdx], matchRight[rightIdx]}` invocando
     * el handler `match.grade()` del registry.
     *
     * Rama CORRECTA:
     *   - Añade la pareja a `matchPairsConsumed` (inmutable, asignación nueva
     *     para Alpine reactivity).
     *   - Limpia `matchSelectedLeftIdx`.
     *   - Si `matchPairsConsumed.length === pairs.length` (completado el
     *     ejercicio), invoca `applyResultToSession(ex, !matchHadFailure)`.
     *     Nota: `applyResultToSession` SIEMPRE se llama UNA vez al completar
     *     match — con `correct = false` si hubo cualquier intento erróneo.
     *     La cascada D-54 al final es idempotente (state.categoryProgress ya
     *     reseteado por el primer fallo); el bumpeo de exerciseStats vía
     *     applySessionResult al final preserva D-09 monotonicidad.
     *
     * Rama INCORRECTA (D-61 + Pitfall #2 idempotencia):
     *   - Guard `if (!this.matchHadFailure)`: SOLO el primer intento erróneo
     *     del ejercicio dispara `applyImmediateFailure(...)` + `saveState`.
     *     Intentos erróneos posteriores son no-op respecto a localStorage —
     *     state.categoryProgress ya reseteado, escribir de nuevo sería ruido.
     *   - Dispara el parpadeo rojo de ambos items durante 300ms
     *     (`flashMatchPair`).
     *   - Limpia `matchSelectedLeftIdx` (D-60: la selección se deshace tras
     *     fallo, ambos items vuelven a clickeables).
     *
     * @param {number} rightIdx - Índice en `matchRight`.
     */
    matchPickRight(rightIdx) {
      if (this.sessionFeedback !== null) return;
      if (this.matchSelectedLeftIdx === null) return; // letra sin número previo
      if (this.matchRightIsConsumed(rightIdx)) return;

      const ex = this.sessionCurrentExercise;
      const leftIdx = this.matchSelectedLeftIdx;
      const leftWord = this.matchLeft[leftIdx];
      const rightWord = this.matchRight[rightIdx];

      const handler = registry['match'];
      const result = handler.grade(ex, {
        leftWord,
        rightWord,
        consumedPairIdx: this.matchPairsConsumed.map(p => p.pairIdx)
      });

      if (result.correct === true) {
        // Pareja válida: fijar como consumed, deselecccionar izq.
        this.matchPairsConsumed = [
          ...this.matchPairsConsumed,
          { leftIdx, rightIdx, pairIdx: result.pairIdx }
        ];
        this.matchSelectedLeftIdx = null;

        // ¿Completado el ejercicio? (todas las parejas consumidas)
        if (this.matchPairsConsumed.length === ex.payload.pairs.length) {
          // D-60: el ejercicio se considera fallado si hubo cualquier fallo
          // previo, AUNQUE el usuario completó todas las parejas correctamente.
          // applyResultToSession con correct=false aplica la cascada D-54
          // idempotentemente (state ya reseteado por el primer fallo); el
          // bump de exerciseStats al final vía applySessionResult preserva
          // D-09 monotonicidad.
          //
          // Phase 6 (D-105/D-106/D-107): el 3er arg `userAnswer` es
          // `matchFirstWrongPair` — `null` si el ejercicio se completó sin
          // ningún fallo (correct=true ahí), o `{left, right}` del primer
          // pareo erróneo capturado bajo guard en el branch incorrecto.
          this.applyResultToSession(ex, !this.matchHadFailure, this.matchFirstWrongPair);
        }
      } else {
        // Pareja incorrecta — D-61 cascada inmediata SOLO en el primer fallo.
        // Pitfall #2 idempotencia: el guard `matchHadFailure` evita writes
        // redundantes a localStorage en fallos consecutivos del MISMO ejercicio.
        if (!this.matchHadFailure) {
          // quick-260713-ng7: en review-only NO persistimos la regresión (esos
          // fallos ya se contaron en la ronda original). La captura de
          // matchFirstWrongPair y el flip de matchHadFailure (runtime-only) SÍ
          // se mantienen fuera de este guard — alimentan el feedback visual.
          if (!this.sessionReviewOnly) {
            const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
            // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
            newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
            saveState(newState);
            this.state = newState;
          }
          // Phase 6 (D-107): capturar el primer pareo erróneo ANTES de flip
          // el guard `matchHadFailure`. Textos LITERALES (no índices) — robusto
          // frente a refactors de matchLeft/Right y muestra exactamente lo
          // que el autor clickó. Set UNA SOLA VEZ por ejercicio (mismo guard
          // que la cascada D-61 — simetría arquitectónica).
          //
          // WR-01 fix: añadimos `leftIdx` (índice CANÓNICO en `payload.pairs`,
          // NO en `matchLeft` shuffled). El lookup `pairs.find(p => p[0] ===
          // leftWord)` falla silenciosamente cuando dos parejas comparten el
          // mismo texto `left` (D-66 permite duplicados). Buscamos el índice
          // del par cuyo texto coincida con `leftWord` para que el summary
          // pueda hacer `pairs[leftIdx][1]` (lookup determinista). Si por
          // cualquier razón no se encuentra (defensivo, no debería pasar),
          // queda -1 — el summary lo trata como "(?)" igual que el path previo.
          //
          // Caveat: si hay duplicados de `left`, este findIndex sigue
          // devolviendo el PRIMER match (limitación del shape `{left, right}`
          // capturado — el grading consume por `pairIdx` pero esa info la
          // tenemos en `result.pairIdx` del handler.grade del match cuando es
          // correcto, NO cuando es incorrecto. Para WR-01 v1: aceptamos que
          // dos `left` idénticos con un click incorrecto muestren la correcta
          // del primer match — mismo comportamiento que antes pero ahora con
          // el índice EXPLÍCITO en el shape, así un fix futuro puede mejorar
          // `handler.grade` para devolver el pairIdx también en incorrect).
          const leftIdx = ex.payload.pairs.findIndex(p => p[0] === leftWord);
          this.matchFirstWrongPair = { left: leftWord, right: rightWord, leftIdx };
          this.matchHadFailure = true;
          if (this.sessionMode === 'test-completo') {
            // D-42: el inFlightTest no traquea sub-estado match, pero sí el
            // cursor/answers. La cascada D-61 ya persistió categoryProgress;
            // aquí re-grabamos el snapshot de inFlightTest por consistencia
            // (mismo patrón que applyResultToSession).
            this.persistInFlightTest();
          }
        }
        // Disparar el parpadeo + deshacer la selección (los dos items vuelven
        // a clickeables tras 300ms).
        this.flashMatchPair(leftIdx, rightIdx);
        this.matchSelectedLeftIdx = null;
      }
    },

    /**
     * Programa el parpadeo rojo (animation `.match-flash`) durante 300ms en
     * los items izq/der involucrados en un intento incorrecto (D-60).
     *
     * Cleanup defensivo: invoca `cancelMatchFlash()` ANTES de schedule por si
     * había un flash previo activo (raro en uso normal, pero posible si el
     * usuario hace click muy rápido entre dos fallos consecutivos).
     *
     * @param {number} leftIdx
     * @param {number} rightIdx
     */
    flashMatchPair(leftIdx, rightIdx) {
      this.cancelMatchFlash();
      this.matchFlashIdx = { left: leftIdx, right: rightIdx };
      this.matchFlashHandle = setTimeout(() => {
        this.matchFlashIdx = null;
        this.matchFlashHandle = null;
      }, 300);
    },

    /**
     * D-66/D-60: ¿el item izq en posición `idx` ya forma parte de una pareja
     * correcta consumida? Defensivo: si `matchPairsConsumed` no es array,
     * trata como vacío.
     *
     * @param {number} idx
     * @returns {boolean}
     */
    matchLeftIsConsumed(idx) {
      if (!Array.isArray(this.matchPairsConsumed)) return false;
      return this.matchPairsConsumed.some(p => p.leftIdx === idx);
    },

    /**
     * Simétrico a `matchLeftIsConsumed`.
     *
     * @param {number} idx
     * @returns {boolean}
     */
    matchRightIsConsumed(idx) {
      if (!Array.isArray(this.matchPairsConsumed)) return false;
      return this.matchPairsConsumed.some(p => p.rightIdx === idx);
    },

    /**
     * D-70: mapea índice 0..8 a letra 'a'..'i'. Para idx >= 9 devuelve string
     * vacío (no es alcanzable por teclado, pero el item sigue clickeable —
     * cap natural del schema 2 ≤ pairs ≤ 10 deja en raro el caso de >9).
     *
     * @param {number} idx
     * @returns {string}
     */
    letterFor(idx) {
      return idx < 9 ? String.fromCharCode(97 + idx) : '';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Sub-state init por tipo de ejercicio (Phase 3 plan 01; D-56/D-57/D-62)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Inicializa los sub-estados específicos del tipo de ejercicio que se va
     * a mostrar. SIEMPRE limpia primero TODOS los sub-estados (word-buttons +
     * match) — uniformidad: el estado al entrar a un ejercicio nunca arrastra
     * residuo del anterior. Después rellena los del tipo actual.
     *
     * Invocado desde:
     *   - `startSession()` tras computar `sessionExerciseIds[0]`.
     *   - `sessionAdvance()` tras incrementar el cursor (si no terminó).
     *   - `resumeInFlightTest()` tras restaurar el cursor.
     *
     * Match (D-62 shuffle ambas columnas; D-66 duplicados
     * permiten que `matchRight` contenga textos repetidos; el grading los
     * consume por índice via `matchPairsConsumed`). La limpieza universal
     * arriba ya cubre el reset del flag `matchHadFailure` por ejercicio
     * (D-60: el flag es por ejercicio, NO por sesión).
     *
     * @param {object|null} exercise - El ejercicio a inicializar; null = solo limpieza.
     */
    initSubStateForExercise(exercise) {
      // Limpieza universal de TODOS los sub-estados de tipos nuevos.
      this.wordButtonsBank = [];
      this.wordButtonsPlacedIdx = [];
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      // Phase 6 (D-107): el flag de captura del primer pareo erróneo es POR
      // EJERCICIO (igual que matchHadFailure) — se resetea al cambiar de
      // ejercicio dentro de la misma sesión.
      this.matchFirstWrongPair = null;
      // Phase quick-260525-pwq (D-181): la permutación visual de las options
      // multi-choice también se resetea por ejercicio. Default `[]` para que
      // el template HTML no rompa durante el tick de unmount o cuando el
      // tipo actual NO es multi-choice (el `<template x-if>` ya cubre el
      // render, pero el array vacío es la garantía más defensiva).
      this.multiChoiceOrder = [];
      this.cancelMatchFlash();

      if (!exercise) return;

      if (exercise.type === 'word-buttons') {
        // D-57: banco = shuffle(answer ∪ distractors). El shuffle usa
        // Math.random (no seedable aquí — el sampler ya usa seed determinista
        // para los IDs, pero el banco visual es non-deterministic intentional:
        // queremos que el autor vea órdenes distintos en cada session reload).
        // quick-260715-hf5: en modo canción AGRUPADO los decoradores vienen de
        // decoyBank.distractors (no de payload.distractors, que en canciones es
        // []). En clásico o ejercicios normales, se mantiene payload.distractors.
        const grouped = this.sessionMode === 'cancion'
          && this.songBankMode === 'grouped'
          && exercise.payload.decoyBank
          && Array.isArray(exercise.payload.decoyBank.distractors);
        const distractors = grouped
          ? exercise.payload.decoyBank.distractors
          : (exercise.payload.distractors ?? []);
        const all = [
          ...(exercise.payload.answer ?? []),
          ...distractors
        ];
        this.wordButtonsBank = fisherYates(all);
        this.wordButtonsPlacedIdx = [];
      } else if (exercise.type === 'match') {
        // D-62: shuffle independiente de cada columna con `fisherYates`.
        // Mismo helper que el sampler de session — un único algoritmo de
        // shuffle determinista (Math.random aquí también, coherente con el
        // banco word-buttons: el orden visual es intencional non-deterministic
        // por carga). D-66: si hay duplicados textuales en `pairs[i][1]`,
        // `matchRight` los preserva como entradas separadas — el grading los
        // consume por índice via `matchPairsConsumed`.
        this.matchLeft = fisherYates(exercise.payload.pairs.map(p => p[0]));
        this.matchRight = fisherYates(exercise.payload.pairs.map(p => p[1]));
        // matchSelectedLeftIdx, matchPairsConsumed, matchHadFailure ya están
        // a default por la limpieza universal arriba.
      } else if (exercise.type === 'multiple-choice') {
        // Phase quick-260525-pwq (D-181): shuffle visual de las opciones via
        // permutación de índices. El JSON sigue inmutable (D-132); el template
        // HTML iterará `multiChoiceOrder` con indirección `payload.options[perm]`
        // y el click pasará `perm` (índice ORIGINAL) a `sessionSelectOption`
        // — `multipleChoice.grade` opera sobre el `correctIndex` canónico del
        // JSON, cero diff en src/exercise-types/multiple-choice.js.
        //
        // Math.random intencional (no seedable): mismo patrón que el banco
        // word-buttons (D-57) y las columnas match (D-62). El orden visual
        // non-deterministic por carga es lo que fuerza al alumno a re-leer
        // cada opción y neutraliza el sesgo de correctIndex (pos 1 = 41%,
        // pos 3 = 9% en el corpus actual) + el caso flagrante avere-302..305.
        const n = exercise.payload.options.length;
        this.multiChoiceOrder = fisherYates(Array.from({ length: n }, (_, i) => i));
      }

      // quick-260615-puq: enganche del cronómetro de respuesta. Punto único por
      // el que pasa CADA ejercicio nuevo en session/cancion. El guard interno
      // de startSessionTimer (sessionTimed + canción excluida + feedback null)
      // garantiza que no arranca cuando no toca.
      this.startSessionTimer();
    },

    /**
     * Cancela el setTimeout del flash rojo de match (D-60). Idempotente.
     * Stub en plan 01 — match no llega hasta plan 02, pero se declara aquí
     * para que `destroy()` y `resetSession()` puedan invocarlo uniformemente
     * sin necesitar guard de existencia.
     */
    cancelMatchFlash() {
      if (this.matchFlashHandle !== null) {
        clearTimeout(this.matchFlashHandle);
        this.matchFlashHandle = null;
      }
      this.matchFlashIdx = null;
    },

    // ════════════════════════════════════════════════════════════════════════
    // Handler global de teclado (Phase 3 plan 01; D-68/D-69/D-71/D-72)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Handler global del session screen registrado vía `@keydown.window` en
     * `index.html`. Cubre la ergonomía SESSION-06 + D-68 + D-69 + D-71.
     *
     * Cleanup: `@keydown.window` se desmonta automáticamente cuando el outer
     * `<template x-if="currentScreen === 'session'">` se desmonta (D-72).
     * Defensa adicional: guard `!sessionCurrentExercise` al inicio descarta
     * eventos durante el "tick de unmount" de Alpine.
     *
     * Ramas (en orden de evaluación):
     *   1. Modificadores Ctrl/Meta/Alt → return (no consumir; deja pasar
     *      combos de navegador).
     *   2. `!sessionCurrentExercise` → return (defensivo).
     *   3. `Enter` / `Space`:
     *      - Space: preventDefault() para evitar scroll de página.
     *      - Si sessionFeedback === 'incorrect' → sessionAdvance (D-71).
     *      - Si word-buttons + sin feedback + canCheck → wordButtonsCheck.
     *      - En cualquier otro caso (acierto reciente, banco vacío, etc.):
     *        return (D-71: tras acierto, deja correr el auto-avance 600ms).
     *   4. `Backspace`: si word-buttons + sin feedback + área respuesta no
     *      vacía → wordButtonsRemoveWord(last). preventDefault para evitar
     *      navegación al historial.
     *   5. Dígitos '1'..'9': si feedback != null → return. Si no:
     *      - multiple-choice: si idx < options.length → sessionSelectOption.
     *      - word-buttons: si idx < bank.length AND idx < 9 → wordButtonsAddWord.
     *      - match: si idx < matchLeft.length AND no consumed → matchSelectLeft (D-70).
     *   6. Letras 'a'..'i' (match):
     *      - Si feedback != null → return.
     *      - Si no es match → return.
     *      - Si matchSelectedLeftIdx === null → return (letra sin número
     *        previo: ignorada silenciosamente, D-70).
     *      - Si idx < matchRight.length AND no consumed → matchPickRight.
     *   7. Cualquier otra tecla: noop, no preventDefault.
     *
     * @param {KeyboardEvent} event
     */
    handleSessionKey(event) {
      // 1. Combos modificados — no interceptar.
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      // 2. Defensivo: durante el tick de unmount o si no hay ejercicio.
      const ex = this.sessionCurrentExercise;
      if (!ex) return;

      const key = event.key;

      // 3. Enter / Space — Comprobar o Siguiente según contexto (D-71).
      if (key === 'Enter' || key === ' ') {
        if (key === ' ') event.preventDefault(); // evitar scroll
        if (this.sessionFeedback === 'incorrect') {
          // D-71: tras fallo, Enter/Space avanza (= click Siguiente).
          this.sessionAdvance();
          return;
        }
        if (ex.type === 'word-buttons' && this.sessionFeedback === null && this.wordButtonsCanCheck) {
          // D-58: Enter dispara Comprobar (mismo handler que el botón).
          this.wordButtonsCheck();
          return;
        }
        // Acierto reciente o área respuesta vacía: no hacer nada.
        // D-71: el auto-avance 600ms gestiona el avance tras acierto.
        return;
      }

      // 3b. quick-260615-hr0 (feature todo #3): tecla `e` revela la explanation
      // TRAS acertar (botón "¿Por qué?" / atajo). DEBE ir antes del bloque de
      // letras a..i (que retorna temprano cuando sessionFeedback !== null y solo
      // actúa en match), porque `e` ∈ [a..i]. Solo dispara en acierto, con
      // explanation real, y aún no revelado. En estado 'correct' la tecla `e`
      // está libre (1-9 y a..i retornan, Enter/Space es noop).
      if (key === 'e'
        && this.sessionFeedback === 'correct'
        && !this.sessionExplanationRevealed
        && this.sessionCurrentExercise?.payload?.explanation) {
        event.preventDefault();
        this.revealSessionExplanation();
        return;
      }

      // 4. Backspace — quita última palabra colocada (word-buttons, D-69).
      if (key === 'Backspace') {
        if (ex.type === 'word-buttons' && this.sessionFeedback === null && this.wordButtonsAnswer.length > 0) {
          event.preventDefault(); // evitar navegación back en algunos navegadores
          this.wordButtonsRemoveWord(this.wordButtonsAnswer.length - 1);
        }
        return;
      }

      // 5. Dígitos 1..9 — selección según tipo (D-68 + D-69).
      if (/^[1-9]$/.test(key)) {
        if (this.sessionFeedback !== null) return;
        const idx = parseInt(key, 10) - 1;
        if (ex.type === 'multiple-choice') {
          // D-68: 1..4 selecciona opción N-1; teclas que excedan se ignoran.
          // Phase quick-260525-pwq (D-181): la tecla N selecciona la opción
          // VISUAL en posición N-1; `multiChoiceOrder[idx]` traduce a índice
          // ORIGINAL del JSON para que `sessionSelectOption` + `multipleChoice.grade`
          // sigan operando sobre el `correctIndex` canónico. Sin esta traducción,
          // tras shuffle la tecla 3 dispararía el `correctIndex=2` literal del
          // JSON aunque la 3ª opción visual fuera otra — convirtiendo el atajo
          // de teclado en un cheat code para los 4 ejercicios avere-302..305
          // donde correctIndex siempre es 2. La longitud-guard usa
          // `multiChoiceOrder.length` (en lugar de `payload.options.length`)
          // por simetría con el shuffled state — son iguales por construcción,
          // pero leer de la fuente que el click usa hace el invariante explícito.
          if (idx < this.multiChoiceOrder.length) {
            this.sessionSelectOption(this.multiChoiceOrder[idx]);
          }
          return;
        }
        if (ex.type === 'word-buttons') {
          // D-69: 1..9 dinámicos sobre las palabras VISIBLES del banco.
          // quick-260615-str: con huecos estables, la tecla N mapea a la
          // N-ésima visible via `visibleSlotIdx` (no al slot crudo N).
          const slot = this.visibleSlotIdx(idx);
          if (idx < 9 && slot !== -1) {
            this.wordButtonsAddWord(slot);
          }
          return;
        }
        if (ex.type === 'match') {
          // D-70: 1..9 sobre matchLeft. Ignora si idx >= length o consumed.
          if (idx < this.matchLeft.length && idx < 9 && !this.matchLeftIsConsumed(idx)) {
            this.matchSelectLeft(idx);
          }
          return;
        }
        return;
      }

      // 6. Letras a..i — match columna derecha (D-70).
      if (key >= 'a' && key <= 'i') {
        if (this.sessionFeedback !== null) return;
        if (ex.type !== 'match') return;
        if (this.matchSelectedLeftIdx === null) return; // letra sin número previo
        const idx = key.charCodeAt(0) - 97;
        if (idx < this.matchRight.length && idx < 9 && !this.matchRightIsConsumed(idx)) {
          this.matchPickRight(idx);
        }
        return;
      }
      // Sin preventDefault — deja al navegador procesar normalmente.
    },

    /**
     * Cierra la sesión: aplica la cascada/promociones (D-39), persiste el
     * nuevo estado (D-20 write-once-on-done para Repaso) y navega al
     * resumen pantalla-completa con el delta factústico por categoría tocada.
     *
     * Plan 02-04 (D-37, SESSION-07): tras applySessionResult, computa
     * `summaryDelta` comparando `categoryProgress` antes vs después, deriva
     * `summaryHeaderLabel` (`Sesión terminada · X/N correctos`) y transiciona
     * `currentScreen = 'summary'`. El template summary renderiza la lista
     * `antes → después` con flechas sutiles de color (regresión rojo,
     * promoción verde) — sin emojis decorativos ni fanfare.
     *
     * Importante: el snapshot ANTES de aplicar usa `JSON.parse(JSON.stringify)`
     * (deep clone) — necesitamos identidad por categoría para el delta y los
     * shapes son pequeños (categoryProgress es un dict con ~10 categorías x
     * pocos campos). El `categoryProgress` ya `next.categoryProgress = {...}`
     * spread-clone en applySessionResult, pero las sub-categorías comparten
     * referencia con el input — por eso necesitamos la copia profunda aquí.
     *
     * NO usar getter para summaryDelta: el getter se re-evaluaría en cada
     * render de Alpine (research D-37 explícito) y necesitamos preservar el
     * snapshot de `before` que NO está disponible tras applySessionResult.
     */
    completeSession() {
      const sessionResult = { answers: this.sessionResults };
      const today = todayLocal();
      // Snapshot deep clone del categoryProgress ANTES de aplicar (D-37 + research).
      // JSON.parse(JSON.stringify) elide undefined — está OK aquí porque
      // categoryProgress no usa undefined como valor significativo (sólo en
      // campos opcionales que se cuelan via `?? defaults`).
      const before = JSON.parse(JSON.stringify(this.state.categoryProgress ?? {}));

      const newState = applySessionResult(this.state, sessionResult, this.content, today);
      // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
      newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
      saveState(newState);
      this.state = newState;

      // Computar el delta + header label.
      const { delta, headerLabel } = computeSummaryDelta(before, newState, sessionResult, this.content);
      this.summaryDelta = delta;
      this.summaryHeaderLabel = headerLabel;

      // CR-02 fix: snapshot de sessionResults para que la sección
      // "Errores cometidos" lea de una propiedad estable que NO se ve afectada
      // por el `resetSession()` que dispara `returnToHomeFromSummary()`.
      // Mismo patrón que `summaryDelta` (línea 1531). Clon shallow del array
      // — los items son plain objects shape D-105 (`{exerciseId, correct, userAnswer}`);
      // mutarlos en este punto no es posible porque `sessionResults` se vacía
      // al `resetSession()` y no se vuelve a tocar hasta `startSession()`.
      this.summarySessionResults = [...this.sessionResults];

      // NO llamar resetSession aún — el usuario puede mirar el resumen. Al
      // pulsar "Volver al home" se llama returnToHomeFromSummary() que sí
      // resetea. Sin embargo, sí cancelamos cualquier setTimeout pendiente
      // (Pitfall #5) — el usuario podría haber abandonado vía botón "Volver"
      // mientras estaba en feedback verde con auto-advance scheduled.
      this.cancelAutoAdvance();

      this.currentScreen = 'summary';
    },

    /**
     * Vuelve al home desde la pantalla de resumen. Limpia el sub-estado de
     * sesión y de summary (no necesitamos preservar el delta una vez que el
     * usuario ya lo vio). El template del summary engancha esto al botón
     * único "Volver al home".
     */
    returnToHomeFromSummary() {
      this.resetSession();
      this.summaryDelta = null;
      this.summaryHeaderLabel = '';
      // CR-02 fix: el snapshot del summary se limpia con el mismo trigger que
      // `summaryDelta` (el usuario ya vio los errores; pueden descartarse).
      this.summarySessionResults = [];
      this.currentScreen = 'home';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Completado + resumen de canción (Phase 13 — PLAY-04, SONG-02/04, D-02/D-04)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Phase 13 — Rutina de completado del playthrough (analog de
     * `completeSession`). DIVERGE del Test completo:
     *
     *   - NO llama `applySessionResult` (standalone — LINK-04): la cascada D-54
     *     ya ocurrió per-frase vía `applyImmediateFailure` (categoryProgress se
     *     mutó incrementalmente durante el recorrido). El status pasada/fallada
     *     de la canción se escribe AQUÍ, write-once-at-end (D-02).
     *   - El bloque de impacto (Block B) se computa del set
     *     `failedCategoryIds` de las frases falladas (resuelto contra
     *     `songPhraseById`) usando el snapshot `songBefore` (capturado al INICIO
     *     en `startSong`) vs el `categoryProgress` actual — solo lista las
     *     categorías que regresaron (hecha/dominada → no-hecha).
     *
     * `songProgress[songId] = { status, lastPlayedAt }` es redimible/bidireccional
     * (D-03): completar limpio → 'pasada'; con ≥1 fallo → 'fallada'.
     */
    completeSong() {
      const songId = this.songActiveId;
      const results = this.sessionResults;
      const today = todayLocal();

      // Write-once-at-end (D-02): status reflejando el último recorrido completo.
      const huboFallo = results.some(r => !r.correct);
      const status = huboFallo ? 'fallada' : 'pasada';
      const newState = {
        ...this.state,
        songProgress: { ...(this.state.songProgress ?? {}) }
      };
      // quick-260615-nzi: contador vecesFallada por canción — +1 por playthrough
      // con >=1 frase fallada (reusa el MISMO huboFallo que alimenta status para
      // una sola fuente de verdad). Una vez por playthrough: completeSong se
      // invoca una sola vez al pasar el final; returnToSongList NO re-llama
      // completeSong → no hay recuento al reentrar al resumen. Lee el previo de
      // this.state (?? 0, lazy-init) y escribe en newState.
      const prevVF = this.state.songProgress?.[songId]?.vecesFallada ?? 0;
      newState.songProgress[songId] = {
        status,
        lastPlayedAt: today,
        vecesFallada: prevVF + (huboFallo ? 1 : 0)
      };
      newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
      saveState(newState);
      this.state = newState;

      // Block B — categorías que bajaron de estado por las frases falladas de
      // ESTA canción. Reusa el CONCEPTO de computeSummaryDelta (set auxiliar +
      // status antes→después), pero el lookup es songPhraseById (NO exerciseById)
      // y el "antes" es el snapshot de inicio (cascada incremental).
      const failedCategoryIds = new Set(
        results
          .filter(r => !r.correct)
          .flatMap(r => this.songPhraseById[r.exerciseId]?.categoryIds ?? [])
      );
      const before = this.songBefore ?? {};
      const after = this.state.categoryProgress ?? {};
      const catNameById = {};
      for (const cat of this.content.categories ?? []) catNameById[cat.id] = cat.name;

      const regressed = [];
      for (const catId of failedCategoryIds) {
        const statusBefore = before[catId]?.status ?? 'no-hecha';
        const statusAfter = after[catId]?.status ?? 'no-hecha';
        const isRegression =
          (statusBefore === 'hecha' || statusBefore === 'dominada') &&
          statusAfter === 'no-hecha';
        if (isRegression) {
          regressed.push({
            categoryId: catId,
            categoryName: catNameById[catId] ?? catId,
            statusBefore,
            statusAfter,
            isRegression: true
          });
        }
      }
      regressed.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      this.songSummaryDelta = regressed;

      // Block A — snapshot de resultados (CR-02: sobrevive al unmount/reset).
      this.summarySessionResults = [...results];

      this.cancelAutoAdvance();
      this.currentScreen = 'cancion-summary';
    },

    /**
     * Phase 13 — Vuelve al listado de canciones desde el resumen (analog de
     * `returnToHomeFromSummary`). Limpia el sub-estado de canción + summary,
     * resetea la sesión, y vuelve a `currentScreen='canciones'` para que el
     * listado refleje el nuevo estado pasada/fallada (SONG-02/SONG-04).
     */
    returnToSongList() {
      this.resetSession();
      this.songActiveId = null;
      this.songPhraseById = {};
      this.songBefore = null;
      this.songSummaryDelta = null;
      this.summarySessionResults = [];
      this.currentScreen = 'canciones';
    },

    // ════════════════════════════════════════════════════════════════════════
    // Getters reactivos (Alpine los recomputa por dependencias granulares)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Ejercicio actualmente mostrado en la sesión.
     *
     * Devuelve `null` (NO `undefined`) cuando:
     *   - El cursor ya pasó del último ejercicio (`sessionDone`).
     *   - `content` aún no cargó (pre-init).
     *   - El id no existe en `exerciseById` (no debería pasar; defensivo).
     *
     * Importante: este getter se evalúa también durante el "tick de unmount"
     * de Alpine cuando `currentScreen` cambia de `'session'` a otra pantalla
     * (UAT 02-03 finding 2). Sin esta guard explícita, los bindings del
     * template — `payload.prompt`, `payload.options`, `payload.correctIndex` —
     * intentan leer `.payload` de `undefined` y lanzan
     * `TypeError: Cannot read properties of undefined`. El patrón es el mismo
     * que Phase 1 usó en `<template x-if="ready && !done">` (UAT 01-02), pero
     * aquí lo aplicamos también en el getter para que la guard sea doblemente
     * segura (Phase 1 SUMMARY: defensa en profundidad).
     *
     * @returns {object|null}
     */
    get sessionCurrentExercise() {
      if (!this.content) return null;
      if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
      const id = this.sessionExerciseIds[this.sessionCursor];
      if (!id) return null;
      // Phase 16 (EXAM-01 / D-16-08) — resolución slot-aware. Espejo del patrón
      // `songCurrentPhrase` + el synthetic-payload de `songStart`: resolvemos la
      // VARIANTE fijada al construir la sesión y la re-envolvemos en un objeto
      // con shape legacy `{id, type, categoryIds, payload:{...}}` para que TODOS
      // los bindings `.payload.*` del template, `initSubStateForExercise`,
      // `applyResultToSession` y la cascada D-54 (que lee `.id`/`.categoryIds`)
      // sobrevivan SIN tocar. Guards defensivos espejo del getter legacy.
      const slot = this.content.slotById?.[id];
      if (!slot) return null;
      const vIdx = this.sessionCurrentVariantIndex;
      // Surface fallback a variants[0] / {} (D-16-10 + defensa anti-TypeError).
      const surface = slot.variants?.[vIdx] ?? slot.variants?.[0] ?? {};
      return {
        id: slot.id,
        type: slot.type,
        categoryIds: slot.categoryIds,
        payload: { ...surface, explanation: slot.explanation }
      };
    },

    /**
     * Phase 16 (D-16-10): `variantIndex` de la variante mostrada en el cursor
     * actual. Default 0 cuando el array paralelo no tiene entrada (slot legacy
     * de 1 variante, resume de inFlightTest legacy sin variantIndices, o índice
     * defensivo fuera de rango). Consumido por `sessionCurrentExercise` y por el
     * push de `sessionResults` (registra qué variante se mostró — D-16-09).
     */
    get sessionCurrentVariantIndex() {
      return this.sessionVariantIndices[this.sessionCursor] ?? 0;
    },

    /**
     * Phase 16 (D-16-09): resuelve la VARIANTE concreta fallada de un resultado
     * de sesión a la superficie re-envuelta con shape legacy `{type, payload}`,
     * para que el bloque "Errores cometidos" del summary muestre el prompt /
     * respuesta correcta / explicación de la variante EXACTA que se falló (no la
     * variante 0 por defecto). Mismo truco synthetic-payload que
     * `sessionCurrentExercise`, pero resolviendo por `result.exerciseId` +
     * `result.variantIndex` en lugar del cursor vivo.
     *
     * Defensivo: si el slot ya no existe (autor editó el JSON entre arranque y
     * fin de sesión) devuelve `null` — el filter del template ya excluye esos
     * resultados, pero el `null` añade defensa-en-profundidad. `variantIndex`
     * ausente (resultado legacy pre-fase) cae a 0 (D-16-10).
     *
     * @param {{exerciseId:string, variantIndex?:number}} result
     * @returns {{type:string, payload:object}|null}
     */
    summaryVariantSurface(result) {
      const slot = this.content?.slotById?.[result.exerciseId];
      if (!slot) return null;
      const vIdx = result.variantIndex ?? 0;
      const surface = slot.variants?.[vIdx] ?? slot.variants?.[0] ?? {};
      return {
        type: slot.type,
        payload: { ...surface, explanation: slot.explanation }
      };
    },

    /** SESSION-04: indicador "Ejercicio X / N" visible toda la sesión. */
    get sessionProgressLabel() {
      return `Ejercicio ${this.sessionCursor + 1} / ${this.sessionExerciseIds.length}`;
    },

    /**
     * Phase 33 (EX-01) — Porcentaje de avance del set para el ancho de la barra
     * de progreso verde de la barra superior. Entero 0..100 derivado del estado
     * existente (sessionCursor + sessionExerciseIds.length), espejo de
     * `sessionProgressLabel`. Pura lectura derivada (read-only): NO toca el
     * motor (sampler, cascada D-54, persistencia).
     *
     * Double-defense Alpine: con length 0 devuelve 0 (sin divide-by-zero),
     * coherente con el tick de unmount donde sessionExerciseIds queda vacío.
     *
     * @returns {number} entero 0..100
     */
    get sessionProgressPercent() {
      const total = this.sessionExerciseIds.length;
      if (total === 0) return 0;
      return Math.round(((this.sessionCursor + 1) / total) * 100);
    },

    /**
     * Phase 33 (EX-01) — Contador "NN/NN" (Space Grotesk) de la barra superior.
     * Misma derivación que `sessionProgressLabel` pero en formato compacto
     * numérico. Pura lectura derivada (read-only).
     *
     * @returns {string} p.ej. "1/20"
     */
    get sessionProgressCounter() {
      return `${this.sessionCursor + 1}/${this.sessionExerciseIds.length}`;
    },

    /**
     * Phase 33 (EX-02 / D-08) — Trocea el prompt del ejercicio actual sobre el
     * literal `___` para renderizar el hueco como un slot inline estilizado
     * (vacío pre-corrección; relleno con la respuesta post-corrección: subrayado
     * verde si correcto / tachado rojo si incorrecto). El split es presentacional
     * puro — NO altera el prompt ni el motor.
     *
     * Cada parte se renderiza con `x-text` (T-02-01 anti-XSS), nunca con la
     * directiva de HTML crudo de Alpine.
     *
     * Casos:
     *   - "Lui ___ ventidue anni." → ["Lui ", " ventidue anni."] (hueco = junta).
     *   - prompt sin `___`          → [prompt] (un solo elemento, sin hueco).
     *   - prompt undefined          → [''] (coerción defensiva, no lanza).
     *
     * Double-defense Alpine: si no hay ejercicio actual (tick de unmount,
     * cursor pasado del final), devuelve [] — espejo del guard de `bankWithKeys`.
     *
     * @returns {string[]}
     */
    get sessionPromptParts() {
      if (!this.sessionCurrentExercise) return [];
      return String(this.sessionCurrentExercise.payload.prompt ?? '').split('___');
    },

    /**
     * Phase 13 — Frase actualmente mostrada en el playthrough de canción.
     * Espejo defensivo de `sessionCurrentExercise` PERO resolviendo contra el
     * mapa DEDICADO `songPhraseById` (LINK-04: las frases de canción NO existen
     * en `content.exerciseById`). Devuelve `null` cuando el cursor pasó del
     * final, no hay canción activa, o el id no existe (defensivo — double-defense
     * Alpine, evita TypeError durante el tick de unmount).
     *
     * @returns {object|null}
     */
    get songCurrentPhrase() {
      if (!this.content) return null;
      if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
      const id = this.sessionExerciseIds[this.sessionCursor];
      if (!id) return null;
      return this.songPhraseById?.[id] ?? null;
    },

    /**
     * quick-260715-hf5 — ¿la canción activa soporta el modo agrupado? (alguna
     * frase tiene decoyBank con mapa POS). Gobierna la visibilidad del checkbox.
     * @returns {boolean}
     */
    get songSupportsGrouped() {
      const map = this.songPhraseById;
      if (!map) return false;
      for (const p of Object.values(map)) {
        if (p?.payload?.decoyBank?.pos) return true;
      }
      return false;
    },

    /**
     * quick-260715-hf5 — Vista AGRUPADA del banco por categoría sintáctica.
     * Devuelve `null` fuera del modo canción-agrupado (el template cae al banco
     * plano). Cada grupo: `{ key, label, items:[...bankWithKeys], collapsed }`.
     * Es una VISTA de solo-lectura: reparte las MISMAS entradas de bankWithKeys
     * (preserva idx/placed/key), así el grading y la colocación no cambian.
     * @returns {Array<{key:string,label:string,items:Array,collapsed:boolean}>|null}
     */
    get bankGroups() {
      if (this.sessionMode !== 'cancion' || this.songBankMode !== 'grouped') return null;
      const pos = this.songCurrentPhrase?.payload?.decoyBank?.pos;
      if (!pos) return null;
      const groups = groupTokens(this.bankWithKeys, pos);
      return groups.map((g) => ({ ...g, collapsed: !!this.songCollapsedGroups[g.key] }));
    },

    /**
     * quick-260715-hf5 — Conmuta el modo del banco de la canción y re-inicializa
     * el banco de la frase actual con el nuevo modo. No-op durante feedback
     * (verde/rojo bloquean) para no alterar el banco a mitad de comprobación.
     * @param {'classic'|'grouped'} mode
     */
    setSongBankMode(mode) {
      if (mode !== 'classic' && mode !== 'grouped') return;
      if (this.sessionFeedback !== null) return;
      if (mode === this.songBankMode) return;
      this.songBankMode = mode;
      this.songCollapsedGroups = {};
      this.initSubStateForExercise(this.songCurrentPhrase);
    },

    /**
     * quick-260715-hf5 — Pliega/despliega un grupo del acordeón por clave POS.
     * @param {string} key
     */
    toggleGroupCollapsed(key) {
      this.songCollapsedGroups = {
        ...this.songCollapsedGroups,
        [key]: !this.songCollapsedGroups[key],
      };
    },

    /** Phase 13 — indicador "Frase X / N" del playthrough de canción. */
    get songProgressLabel() {
      return `Frase ${this.sessionCursor + 1} / ${this.sessionExerciseIds.length}`;
    },

    /**
     * Quick 260615-hhp — Título de UBICACIÓN/contexto mostrado ENCIMA del
     * progreso mientras el alumno está dentro de una sesión o canción, y
     * también en los resúmenes. Pura UI derivada (read-only): NO toca estado
     * persistido ni lógica de scoring/racha.
     *
     * Reutilizable para las 4 pantallas (session, cancion, summary,
     * cancion-summary) porque el estado del que deriva SOBREVIVE al pasar a
     * resumen (verificado en lifecycles): `completeSession()` NO llama
     * `resetSession()` (solo `returnToHomeFromSummary()` lo hace), así que
     * `sessionMode`/`pickerCheckedCategoryIds`/`sessionExerciseIds` siguen vivos
     * en `summary`; `completeSong()` no limpia `songActiveId` (solo
     * `returnToSongList()`), así que sigue vivo en `cancion-summary`.
     *
     * Formato (CONTEXT §2/§3):
     *   - test-completo con 1 categoría: "Examen: <nombre categoría>".
     *   - test-completo multi-cat (o vacío): "Examen" (sin listar nombres).
     *   - repaso: "Repaso (<N> ejercicios)" con N real = sessionExerciseIds.length
     *     (NUNCA hardcodear 20).
     *   - cancion: "Canción: <title>".
     *
     * Double-defense Alpine: devuelve '' cuando falta `content`, `sessionMode`
     * o la entrada esperada (se evalúa durante el tick de unmount). Nunca accede
     * a `.name`/`.title` sin encadenamiento opcional.
     *
     * @returns {string}
     */
    get sessionContextLabel() {
      if (!this.content) return '';
      switch (this.sessionMode) {
        case 'test-completo': {
          if (this.pickerCheckedCategoryIds.length === 1) {
            const id = this.pickerCheckedCategoryIds[0];
            const name = this.content.categories?.find(c => c.id === id)?.name ?? id;
            return `Examen: ${name}`;
          }
          return 'Examen';
        }
        case 'repaso':
          return `Repaso (${this.sessionExerciseIds.length} ejercicios)`;
        case 'repaso-fallidas': // quick-260713-ng7
          return `Repaso de falladas (${this.sessionExerciseIds.length} ejercicios)`;
        case 'cancion': {
          const title = this.content.songsById?.[this.songActiveId]?.title ?? this.songActiveId;
          return `Canción: ${title}`;
        }
        default:
          return '';
      }
    },

    /**
     * D-69: vista derivada del banco con sufijos numéricos visibles para
     * teclas 1..9. Re-numeración DINÁMICA: el bind `1` siempre apunta a la
     * primera palabra VISIBLE actual; al colocar una palabra, la posición
     * 2 se convierte en 1, etc.
     *
     * Para palabras en posiciones >=9 (raro en A1/A2 pero defendible), la
     * key es string vacío — el sufijo simplemente no se renderiza y la
     * palabra solo es alcanzable por click. UI-SPEC `.kbd-hint` se oculta
     * por string vacío en el HTML via `x-text="entry.key"` (Alpine renderea
     * "" como nada).
     *
     * Double-defense Alpine: si no hay ejercicio actual, retornar []
     * (evita TypeError durante el tick de unmount).
     *
     * quick-260615-str: devuelve UNA entrada por CADA slot del banco
     * (incluidos los colocados), con `{ word, idx, placed, key }`:
     *   - `idx`: índice del slot en `wordButtonsBank` (estable).
     *   - `placed`: si el slot está colocado en la respuesta.
     *   - `key`: numeración DINÁMICA sobre las palabras VISIBLES (salta las
     *     colocadas; D-69 preservado: 1 = primera visible, renumera al
     *     colocar — pero el botón NO se mueve, solo cambia su superíndice).
     *     String(n) si n<=9, si no '' (no alcanzable por teclado).
     * El render usa `placed` para pintar el slot como placeholder invisible
     * (visibility:hidden), manteniendo el hueco y evitando reflow.
     *
     * @returns {Array<{word: string, idx: number, placed: boolean, key: string}>}
     */
    get bankWithKeys() {
      // En modo canción la frase activa vive en `songPhraseById` (LINK-04), NO
      // en `exerciseById`, así que `sessionCurrentExercise` es null y dejaría el
      // banco vacío aunque `wordButtonsBank` esté poblado. Aceptar también
      // `songCurrentPhrase` arregla el render del banco en canciones y mantiene
      // la defensa anti-TypeError del tick de unmount (ambos null = []).
      if (!this.sessionCurrentExercise && !this.songCurrentPhrase) return [];
      let n = 0; // contador de palabras VISIBLES (no colocadas) para la key.
      return this.wordButtonsBank.map((word, idx) => {
        const placed = this.wordButtonsPlacedIdx.includes(idx);
        let key = '';
        if (!placed) {
          n += 1;
          key = n <= 9 ? String(n) : '';
        }
        return { word, idx, placed, key };
      });
    },

    /**
     * quick-260615-str: traduce la N-ésima palabra VISIBLE (0-based) a su
     * slotIdx en el banco, saltando las colocadas. Usado por el atajo de
     * teclado dígito N → coloca la N-ésima visible (no el slot crudo N).
     * Devuelve -1 si no hay una N-ésima visible.
     *
     * @param {number} n - índice 0-based dentro de las palabras visibles.
     * @returns {number} slotIdx en `wordButtonsBank`, o -1.
     */
    visibleSlotIdx(n) {
      const visibles = this.bankWithKeys.filter(e => !e.placed);
      return n >= 0 && n < visibles.length ? visibles[n].idx : -1;
    },

    /**
     * D-58: condición de habilitación del botón "Comprobar". Requiere que
     * el área respuesta NO esté vacía (al menos 1 token colocado) Y que no
     * haya ya un feedback (verde/rojo bloquea la segunda comprobación).
     *
     * @returns {boolean}
     */
    get wordButtonsCanCheck() {
      return this.wordButtonsAnswer.length > 0 && this.sessionFeedback === null;
    },

    /**
     * quick-260615-str: respuesta DERIVADA de `wordButtonsPlacedIdx` (la nueva
     * fuente de verdad). Mapea cada índice de slot colocado a su palabra del
     * banco — maneja palabras repetidas correctamente (mapeo por índice, no
     * por valor). Satisface a TODOS los lectores actuales (grading via
     * `{ tokens }`, `applyResultToSession([...])`, `x-for word in
     * wordButtonsAnswer`, `.length`) sin tocarlos. NO es asignable: los
     * antiguos resets de `wordButtonsAnswer` se migraron a resetear
     * `wordButtonsPlacedIdx` en su lugar.
     *
     * @returns {string[]} tokens colocados en orden de respuesta.
     */
    get wordButtonsAnswer() {
      return this.wordButtonsPlacedIdx.map(i => this.wordButtonsBank[i]);
    },

    /**
     * D-41/D-43 + UAT 02-04 round 1 fix: getter defensivo del estado del banner
     * in-flight Test completo.
     *
     * Devuelve `true` SÓLO cuando el state está cargado Y hay un inFlightTest
     * con ejercicios pendientes (`cursor < length`). Se evalúa también durante
     * el "tick de unmount" de Alpine y durante el boot ANTES de que `init()`
     * resuelva `appDataReady` — en ambos casos `this.state` es `null`. La
     * expresión `this.state && this.state.inFlightTest && ...` corta el acceso
     * a `.inFlightTest` de un null, evitando el TypeError visible en consola.
     *
     * Patrón canónico (Plan 02-03 SUMMARY lessons learned #1): cualquier
     * binding Alpine que traverse propiedades anidadas de un recurso nullable
     * (`state`, `content`, ...) DEBE protegerse con doble defensa:
     *   1. Getter defensivo que devuelva un sentinel (false/null) cuando el
     *      recurso no está listo.
     *   2. `<template x-if="<getter>">` en el HTML que evite que los bindings
     *      internos se evalúen cuando el getter es false/null.
     *
     * El optional chaining `?.` por sí solo NO basta: `this.state?.inFlightTest`
     * funciona, pero la sintaxis `state.inFlightTest?.cursor` en una expresión
     * Alpine se evalúa como `(state.inFlightTest)?.cursor` — el `?.` protege
     * el SEGUNDO acceso, no el primero. Por eso un `state` null sigue
     * lanzando TypeError sobre `.inFlightTest`.
     *
     * @returns {boolean}
     */
    get inFlightTestActive() {
      return !!(
        this.state &&
        this.state.inFlightTest &&
        Array.isArray(this.state.inFlightTest.exerciseIds) &&
        this.state.inFlightTest.cursor < this.state.inFlightTest.exerciseIds.length
      );
    },

    /**
     * D-41 + UAT 02-04 round 1 fix: contadores `{cursor, total}` del banner
     * in-flight. Devuelve `null` cuando no hay test in-flight activo (idéntica
     * lógica de guard que `inFlightTestActive`). El template usa
     * `<template x-if="inFlightTestActive">` como gate de monte, y SÓLO
     * DENTRO del template se accede a `inFlightTestProgress.cursor /
     * inFlightTestProgress.total` con acceso directo (sin `?.`) — porque el
     * x-if garantiza que el sub-árbol no se evalúa cuando este getter es null.
     *
     * @returns {{cursor:number, total:number}|null}
     */
    get inFlightTestProgress() {
      if (!this.inFlightTestActive) return null;
      const ift = this.state.inFlightTest;
      return { cursor: ift.cursor, total: ift.exerciseIds.length };
    },

    /**
     * Banner de backup en la home (D-78 / D-80, Phase 4). Mismo patrón
     * double-defense Alpine que `inFlightTestActive` (líneas 1244-1251): si
     * `state` aún no cargó (boot pre-init), devolvemos `false`.
     *
     * Lógica D-78:
     *   - Si `lastBackupAt` es string → ¿pasaron > 7 días desde entonces?
     *   - Si `lastBackupAt` es null pero `firstUsedAt` es string → ¿pasaron
     *     > 7 días desde el primer uso? (banner aparece pidiendo "haz tu
     *     primer backup").
     *   - Si ambos son null → app recién instalada sin sesión, no banner.
     *
     * Pitfall #5: si `lastBackupAt` es futuro (clock skew o edición manual),
     * `daysSinceISO` devuelve negativo → `> 7` es false → no mostramos
     * banner. Defensa cero-coste.
     *
     * @returns {boolean}
     */
    get shouldShowBackupBanner() {
      if (!this.state) return false;
      const today = todayLocal();
      const last = this.state.lastBackupAt;
      const first = this.state.firstUsedAt;
      if (last !== null && typeof last === 'string') {
        return daysSinceISO(last, today) > 7;
      }
      if (first !== null && typeof first === 'string') {
        return daysSinceISO(first, today) > 7;
      }
      return false;
    },

    /**
     * Texto del banner home (UI-SPEC líneas 129-132). Dos variantes según
     * `lastBackupAt`:
     *   - null → "Aún no has exportado tu progreso."
     *   - string → "Han pasado N días desde tu último backup."
     *
     * Defensivo: pre-init state → '' (banner template no se monta porque
     * shouldShowBackupBanner ya devolvió false, pero double-defense).
     *
     * @returns {string}
     */
    get backupBannerText() {
      if (!this.state) return '';
      const last = this.state.lastBackupAt;
      if (last === null) {
        return 'Aún no has exportado tu progreso.';
      }
      const days = daysSinceISO(last, todayLocal());
      return `Han pasado ${days} días desde tu último backup.`;
    },

    /**
     * Línea de estado de la pantalla Backup (UI-SPEC líneas 181-187).
     * Casos especiales:
     *   - `lastBackupAt === null` → "Aún no has exportado tu progreso."
     *   - `days === 0` → "Último backup: 24 de mayo de 2026 (hoy)."
     *   - `days < 0` (futuro / clock skew) → "Último backup: ... (fecha futura)."
     *   - `days > 0` → "Último backup: 12 de mayo de 2026 (hace 12 días)."
     *
     * @returns {string}
     */
    get backupStatusLine() {
      if (!this.state) return '';
      const last = this.state.lastBackupAt;
      if (last === null) {
        return 'Aún no has exportado tu progreso.';
      }
      const today = todayLocal();
      const days = daysSinceISO(last, today);
      const date = new Date(last).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      if (days < 0) return `Último backup: ${date} (fecha futura).`;
      if (days === 0) return `Último backup: ${date} (hoy).`;
      return `Último backup: ${date} (hace ${days} días).`;
    },

    /** True cuando el cursor ha pasado del último ejercicio. */
    get sessionDone() {
      return this.sessionCursor >= this.sessionExerciseIds.length;
    },

    /**
     * Cabecera dinámica del picker según el modo seleccionado (D-33).
     *
     * @returns {string}
     */
    get pickerHeaderLabel() {
      if (this.pickerMode === 'repaso') return 'Repaso de 20 ejercicios';
      if (this.pickerMode === 'test-completo') return 'Test completo';
      return '';
    },

    /**
     * Tamaño del pool de ejercicios para el modo + categorías seleccionadas
     * (D-35).
     *
     * Para `'repaso'`: `min(20, |pool|)` — el sampler reducirá si el pool es
     * menor que 20 (D-13).
     * Para `'test-completo'`: `|pool|` — sin tope.
     *
     * @returns {number}
     */
    get pickerPoolSize() {
      if (!this.content || this.pickerCheckedCategoryIds.length === 0) return 0;
      const poolFiltered = Object.values(this.content.exerciseById).filter(ex =>
        Array.isArray(ex.categoryIds) &&
        ex.categoryIds.some(c => this.pickerCheckedCategoryIds.includes(c))
      );
      if (this.pickerMode === 'repaso') return Math.min(20, poolFiltered.length);
      return poolFiltered.length; // 'test-completo'
    },

    /**
     * Label del botón `Empezar` con contador en vivo (D-35).
     *
     * @returns {string}
     */
    get pickerStartLabel() {
      const pool = this.pickerPoolSize;
      if (pool === 0) return 'Empezar'; // botón estará disabled
      if (this.pickerMode === 'repaso') {
        if (pool >= 20) return 'Empezar repaso (20 ejercicios)';
        return `Empezar repaso (${pool} ejercicios — todos los disponibles)`;
      }
      // 'test-completo'
      return `Empezar test completo (${pool} ejercicios)`;
    },

    /**
     * Genera la lista derivada que la tabla de home renderiza (D-29).
     *
     * Cada fila: `{id, name, status, badgeGlyph, statusLabel, streakLabel,
     * totalCount, lastPracticedLabel, examenEnabled, examenTooltip}`. `status`
     * se deriva del `categoryProgress[id]` con default `'no-hecha'` (D-47
     * lazy init).
     *
     * Phase 8 (D-184 / D-187): los campos `examenEnabled` y `examenTooltip`
     * alimentan los bindings `:disabled` y `:title` del botón Examen en la
     * 6ª columna nueva. `examenEnabled` se deriva de `totalCount > 0` (NO de
     * `cat.status` — cats `hecha`/`dominada` siguen enabled normal). El
     * tooltip solo se renderiza cuando disabled (string vacío en idle).
     *
     * @returns {Array<object>}
     */
    get categoriesForDisplay() {
      if (!this.content || !this.state) return [];
      const today = todayLocal();
      const exercisesByCat = {};
      for (const ex of Object.values(this.content.exerciseById ?? {})) {
        for (const cid of ex.categoryIds ?? []) {
          (exercisesByCat[cid] ??= []).push(ex.id);
        }
      }

      return this.content.categories.map(cat => {
        const progress = this.state.categoryProgress?.[cat.id];
        const status = progress?.status ?? 'no-hecha';
        const streak = progress?.streakDays ?? 0;
        const lastPracticedDate = progress?.lastPracticedDate;
        // Phase 8 D-184/D-187: examenEnabled binding para botón Examen
        // disabled state. Reusa exercisesByCat ya construido — no recomputar.
        const totalCount = (exercisesByCat[cat.id] ?? []).length;
        const examenEnabled = totalCount > 0;
        return {
          id: cat.id,
          name: cat.name,
          status,
          badgeGlyph: badgeGlyphFor(status),
          statusLabel: statusLabelFor(status),
          // D-55 (UAT round 2): formato `N / 21 d` para no-dominada (visualiza
          // el objetivo 21 días), `N d` para dominada (ya superó el objetivo).
          streakLabel: formatStreak(streak, status),
          totalCount,
          lastPracticedLabel: formatRelativeDate(lastPracticedDate, today),
          // Phase 8 (D-184/D-187): tooltip nativo solo cuando disabled.
          examenEnabled,
          examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría',
          // quick-260615-nzi: contador de veces fallada (lazy-init ?? 0, D-47).
          vecesFallada: progress?.vecesFallada ?? 0,
          // Phase 32 (HOME-04): valor crudo de racha para el ancho de la barra
          // streak/21 (presentacional; `streak` ya computado arriba). NO toca lógica.
          streakDays: streak
        };
      });
    },

    /**
     * Phase 13 (SONG-01/SONG-02/SONG-04) — espejo de `categoriesForDisplay`
     * para el listado de la pantalla Canciones. Mapea `content.songsById`
     * (cargado standalone por `loadSongs`, LINK-04) + `state.songProgress` a
     * filas `{ id, title, phraseCount, status, statusLabel }`.
     *
     * Status por defecto `'no-hecha'` cuando no hay entrada en `songProgress`
     * (canción nunca terminada — D-02). `songProgress[id]` es plano
     * `{ status, lastPlayedAt? }` (sin streak/dominada — D-03).
     *
     * Double-defense Alpine (house pattern): guard `if (!this.content)` antes
     * de leer `songsById` — los bindings se evalúan antes de que `init()`
     * resuelva (igual que `bankWithKeys` línea ~1920 y `categoriesForDisplay`).
     *
     * @returns {Array<{id:string, title:string, phraseCount:number, status:string, statusLabel:string}>}
     */
    get songsForDisplay() {
      if (!this.content || !this.state) return [];
      const byId = this.content.songsById ?? {};
      // Phase 34 (D-01): la fila destacada "Continuar/Empezar" es la PRIMERA
      // canción pendiente (no-hecha|fallada) en orden de lista. Pre-computamos
      // su id recorriendo el orden de iteración (mismo que el map de abajo) para
      // que solo UNA fila lleve `featured: true`; cuando todas son `pasada`
      // (D-04, empty state) ningún id queda elegido → ninguna featured.
      // Presentacional puro — NO toca songProgress ni el motor.
      const songList = Object.values(byId);
      const featuredId = songList
        .map(song => ({
          id: song.id,
          status: this.state.songProgress?.[song.id]?.status ?? 'no-hecha'
        }))
        .find(s => s.status === 'no-hecha' || s.status === 'fallada')?.id ?? null;
      return songList.map(song => {
        const status = this.state.songProgress?.[song.id]?.status ?? 'no-hecha';
        const phraseCount = Array.isArray(song.phrases) ? song.phrases.length : 0;
        // Phase 34 (D-05/D-06): partir `title` por el em-dash "—" — izquierda =
        // título serif, derecha = artista cursiva (mismo idiom presentacional que
        // categoriesForDisplay con el paréntesis). Sin "—" → artista vacío y
        // titleDisplay = título completo. Meta = "{artista} · {N} huecos" (sin
        // campo "Nivel" — D-06). NO se toca el JSON ni el motor.
        const [titlePart, artistPart] = (song.title ?? song.id)
          .split('—')
          .map(s => s.trim());
        const artist = artistPart ?? '';
        return {
          id: song.id,
          title: song.title ?? song.id,
          phraseCount,
          status,
          statusLabel: songStatusLabelFor(status),
          // quick-260615-nzi: contador de veces fallada (lazy-init ?? 0, D-47).
          vecesFallada: this.state.songProgress?.[song.id]?.vecesFallada ?? 0,
          // Phase 34 (D-05/D-06): campos presentacionales título/artista/meta.
          titleDisplay: titlePart,
          artist,
          metaLabel: artist ? `${artist} · ${phraseCount} huecos` : `${phraseCount} huecos`,
          // Phase 34 (D-01/D-04): destacada = primera pendiente en orden de lista.
          featured: featuredId !== null && song.id === featuredId
        };
      });
    },

    /**
     * Phase 34 (SRP-03 / D-09 / D-10) — Score X/Y del anillo de la pantalla de
     * Resultados. Deriva read-only del SNAPSHOT `summarySessionResults` (fijado
     * en `completeSession`, NO el live `sessionResults` — mismo guard que
     * `summaryDelta`), de modo que el denominador Y = ejercicios RESPONDIDOS
     * (no el total del set lanzado): la cascada D-54 puede cortar la sesión
     * antes del final (D-10). Espejo del idiom read-only de
     * `sessionProgressPercent` — NO toca el motor (sampler, cascada, grading).
     *
     * @returns {{correct:number, total:number, pct:number}} pct entero 0..100
     */
    get summaryScore() {
      const results = this.summarySessionResults ?? [];
      const total = results.length;
      const correct = results.filter(r => r.correct).length;
      return { correct, total, pct: total ? Math.round((correct / total) * 100) : 0 };
    },

    /**
     * Phase 34 (SRP-04 / D-12) — Contador "{N} categorías seleccionadas" del
     * picker de Repaso/Examen. Lectura derivada de `pickerCheckedCategoryIds`
     * (estado existente del picker). El conteo de EJERCICIOS ya lo muestran
     * `pickerStartLabel` / el aviso test-completo, así que este contador solo
     * refleja categorías marcadas (no duplica). Presentacional puro.
     *
     * @returns {number}
     */
    get pickerSelectedCount() {
      return this.pickerCheckedCategoryIds.length;
    }
  };
}

// ─── Helpers privados (módulo-level, no en el factory) ──────────────────────

/**
 * Mapa de status → glifo Unicode (D-30). El color real lo aplica `styles.css`
 * via clases CSS `.badge-no-hecha`, `.badge-hecha`, `.badge-dominada`.
 *
 * @param {string} status
 * @returns {string}
 */
function badgeGlyphFor(status) {
  if (status === 'hecha') return '✓';
  if (status === 'dominada') return '★';
  return '●'; // no-hecha o desconocido
}

/**
 * Mapa de status → texto humano para `aria-label` (accesibilidad D-30).
 *
 * @param {string} status
 * @returns {string}
 */
function statusLabelFor(status) {
  if (status === 'hecha') return 'hecha';
  if (status === 'dominada') return 'dominada';
  return 'no hecha';
}

/**
 * Phase 13 (D-02) — texto humano del status de una canción para el badge
 * `aria-label` del listado. Tres valores redimibles (NO sticky, NO dominada):
 *   - 'pasada'   → último recorrido completo SIN fallos
 *   - 'fallada'  → último recorrido completo con ≥1 fallo
 *   - 'no-hecha' → nunca terminada (default)
 *
 * @param {string} status
 * @returns {string}
 */
function songStatusLabelFor(status) {
  if (status === 'pasada') return 'pasada';
  if (status === 'fallada') return 'fallada';
  return 'no hecha';
}

/**
 * Formato del label de racha en la home (D-29 + D-55).
 *
 * D-55 (UAT round 2): el formato comunica el objetivo de 21 días.
 *   - status != 'dominada': `{N} / 21 d` (ej. `0 / 21 d`, `5 / 21 d`).
 *     Visualiza al usuario CUÁNTO le falta para alcanzar el objetivo.
 *   - status === 'dominada': `{N} d` solo (ej. `25 d`). Ya superó el objetivo,
 *     el `/ 21 d` ya no aporta — y la columna Estado tiene el ★ que indica
 *     dominada. Si se prefiere visual minimalista, el contador acumulado
 *     sigue siendo informativo (cuántos días llevas dominada).
 *
 * Defensivo con valores inválidos: streak=null/undefined/NaN/negativo → trata
 * como 0.
 *
 * @param {number} streak
 * @param {string} [status='no-hecha'] - Status de la categoría para decidir formato.
 * @returns {string}
 */
function formatStreak(streak, status = 'no-hecha') {
  let safeStreak;
  if (typeof streak !== 'number' || streak < 0 || Number.isNaN(streak)) {
    safeStreak = 0;
  } else {
    safeStreak = streak;
  }
  // D-55: dominada → sin tope visual, mostrar contador acumulado limpio.
  if (status === 'dominada') return `${safeStreak} d`;
  // D-55: el resto → mostrar progreso hacia el objetivo 21 días.
  return `${safeStreak} / 21 d`;
}

/**
 * Formato relativo de la fecha de última práctica (D-29).
 *
 * Devuelve `'—'` si nunca, `'hoy'` si coincide, `'ayer'` si diff=1,
 * `'hace N d'` si diff>1. Defensivo con undefined/string vacío.
 *
 * @param {string|undefined} isoDate - Fecha en formato `YYYY-MM-DD`.
 * @param {string} today - Fecha de hoy en formato `YYYY-MM-DD`.
 * @returns {string}
 */
function formatRelativeDate(isoDate, today) {
  if (!isoDate || typeof isoDate !== 'string') return '—';
  if (isoDate === today) return 'hoy';
  const a = parseIsoLocal(isoDate);
  const b = parseIsoLocal(today);
  if (!a || !b) return '—';
  const diffMs = b.getTime() - a.getTime();
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 1) return 'ayer';
  if (diffDays > 1) return `hace ${diffDays} d`;
  // diffDays < 0: fecha futura (clock skew, edición manual). Fallback defensivo.
  return isoDate;
}

/**
 * Computa el delta del resumen (D-37, SESSION-07) comparando `before` y
 * `newState.categoryProgress` para todas las categorías tocadas en la sesión.
 *
 * Devuelve un objeto con dos campos:
 *   - `delta`: array de entradas por categoría tocada, con:
 *       categoryId, categoryName, statusBefore, statusAfter, streakBefore,
 *       streakAfter, totalInCat, pendingForHecha (sólo si statusAfter='no-hecha'),
 *       failed (bool), failureReason (string | null), isPromotion (bool),
 *       isRegression (bool).
 *   - `headerLabel`: string formato `Sesión terminada · X/N correctos`.
 *
 * Orden del delta: regresiones primero (más relevante para el autor),
 * promociones después, neutrales al final. Sub-orden alfabético por
 * `categoryName` para determinismo.
 *
 * NO es un método del factory — vive como función módulo-level para
 * legibilidad y para no contaminar el `$data` de DevTools con un helper
 * que sólo se invoca desde `completeSession`.
 *
 * @param {object} before - Deep clone del categoryProgress antes de applySessionResult.
 * @param {object} newState - Estado tras applySessionResult.
 * @param {{answers: Array<{exerciseId:string, correct:boolean}>}} sessionResult
 * @param {{categories: Array<{id:string,name:string}>, exerciseById: object}} content
 * @returns {{delta: Array<object>, headerLabel: string}}
 */
function computeSummaryDelta(before, newState, sessionResult, content) {
  const answers = sessionResult.answers ?? [];

  // Conjuntos auxiliares (mismo patrón que applySessionResult).
  const practicedCategoryIds = new Set(
    answers.flatMap(a => content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );
  const failedCategoryIds = new Set(
    answers.filter(a => !a.correct).flatMap(a => content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );

  // Índice ejercicios por categoría para computar totalInCat / pendingForHecha.
  const exercisesByCategory = {};
  for (const ex of Object.values(content.exerciseById ?? {})) {
    for (const cid of ex.categoryIds ?? []) {
      (exercisesByCategory[cid] ??= []).push(ex.id);
    }
  }

  // Mapa id → name para el render del template.
  const catNameById = {};
  for (const cat of content.categories ?? []) {
    catNameById[cat.id] = cat.name;
  }

  const delta = [];
  const failedCatList = [...failedCategoryIds];

  for (const catId of practicedCategoryIds) {
    const beforeCat = before[catId];
    const afterCat = newState.categoryProgress?.[catId] ?? {};

    const statusBefore = beforeCat?.status ?? 'no-hecha';
    const statusAfter = afterCat.status ?? 'no-hecha';
    const streakBefore = beforeCat?.streakDays ?? 0;
    const streakAfter = afterCat.streakDays ?? 0;

    const totalInCat = (exercisesByCategory[catId] ?? []).length;
    const clearedCount = (afterCat.clearedExerciseIds ?? []).length;
    const pendingForHecha = statusAfter === 'no-hecha' ? Math.max(0, totalInCat - clearedCount) : 0;

    const failed = failedCategoryIds.has(catId);
    let failureReason = null;
    if (failed) {
      if (failedCatList.length > 1) {
        // Cascada multi-cat: indicar las categorías que cascadearon juntas.
        failureReason = `falló (cascada multi: ${failedCatList.join(' + ')})`;
      } else {
        failureReason = 'falló';
      }
    }

    const isPromotion = statusBefore === 'no-hecha' && (statusAfter === 'hecha' || statusAfter === 'dominada');
    const isRegression = (statusBefore === 'hecha' || statusBefore === 'dominada') && statusAfter === 'no-hecha';

    delta.push({
      categoryId: catId,
      categoryName: catNameById[catId] ?? catId,
      statusBefore,
      statusAfter,
      streakBefore,
      streakAfter,
      totalInCat,
      pendingForHecha,
      failed,
      failureReason,
      isPromotion,
      isRegression
    });
  }

  // Orden: regresiones → promociones → neutrales. Sub-orden alfabético.
  delta.sort((a, b) => {
    const orderA = a.isRegression ? 0 : (a.isPromotion ? 1 : 2);
    const orderB = b.isRegression ? 0 : (b.isPromotion ? 1 : 2);
    if (orderA !== orderB) return orderA - orderB;
    return a.categoryName.localeCompare(b.categoryName);
  });

  const correctCount = answers.filter(a => a.correct).length;
  const total = answers.length;
  const headerLabel = `Sesión terminada · ${correctCount}/${total} correctos`;

  return { delta, headerLabel };
}

/**
 * Parse de `YYYY-MM-DD` a `Date` local (mediodía para evitar DST shifts).
 *
 * @param {string} isoDate
 * @returns {Date|null}
 */
function parseIsoLocal(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d, 12, 0, 0, 0);
}
