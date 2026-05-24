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

    // ─── Navegación (D-24, D-84 Phase 4) ────────────────────────────────────
    /** 'home' | 'picker' | 'session' | 'summary' | 'backup'. */
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
    sessionCursor: 0,
    /** Array<{exerciseId: string, correct: boolean}>. */
    sessionResults: [],
    sessionSelectedIndex: null,
    /** null | 'correct' | 'incorrect'. */
    sessionFeedback: null,
    sessionAutoAdvanceHandle: null,

    // ─── Sub-estado word-buttons (Phase 3 plan 01; D-56, D-57, D-64) ────────
    /** Palabras VISIBLES del banco en orden actual (se vacía al colocar). */
    wordButtonsBank: [],
    /** Tokens colocados en el área respuesta, en orden cronológico. */
    wordButtonsAnswer: [],

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
     * null | {left: number, right: number} — par de índices con animación
     * `.match-flash` activa durante 300ms tras un intento incorrecto (D-60).
     */
    matchFlashIdx: null,
    /** Handle del setTimeout del flash rojo (Pitfall #5 cleanup). */
    matchFlashHandle: null,

    // ─── Sub-estado summary (stub; Plan 02-04 lo poblará) ───────────────────
    summaryDelta: null,
    summaryHeaderLabel: '',

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
            this.currentScreen = 'picker';
          }
        });
        return;
      }
      this.pickerMode = mode;
      this.pickerCheckedCategoryIds = []; // D-34
      this.currentScreen = 'picker';
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
      this.sessionMode = null;
      this.sessionExerciseIds = [];
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      // Phase 3 plan 01: limpiar también los sub-estados de los tipos nuevos.
      // Match queda con sus placeholders (plan 02 los activará); aquí solo
      // reset uniforme. Si en el futuro emergen más sub-estados por tipo,
      // este helper sigue siendo el único sitio donde se resetean.
      this.wordButtonsBank = [];
      this.wordButtonsAnswer = [];
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
    },

    // ════════════════════════════════════════════════════════════════════════
    // Helper de confirmación inline (D-27 / D-43 / D-44)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Pone `this.confirmDialog` con el shape requerido. El template HTML
     * (index.html) renderiza un panel discreto con `x-show` y dos botones.
     *
     * Patrón único para los tres puntos de descarte de trabajo:
     *   - D-27 (Plan 02-03): abandono mid-Repaso.
     *   - D-43 (Plan 02-04): descarte de Test completo in-flight desde banner.
     *   - D-44 (Plan 02-04): lanzar Test completo nuevo con uno in-flight.
     *
     * @param {{message:string, confirmLabel:string, cancelLabel?:string, onConfirm:()=>void}} opts
     */
    requestConfirm(opts) {
      this.confirmDialog = {
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel ?? 'Cancelar',
        onConfirm: opts.onConfirm
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
      const allExercises = Object.values(this.content.exerciseById);
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
      this.sessionMode = this.pickerMode;
      this.sessionExerciseIds = result.exerciseIds;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      // Phase 3 plan 01: inicializar sub-estado del PRIMER ejercicio (si
      // hay alguno). En pool vacío `result.exerciseIds = []` y el getter
      // sessionCurrentExercise devuelve null defensivamente.
      if (result.exerciseIds.length > 0) {
        const firstEx = this.content.exerciseById[result.exerciseIds[0]];
        this.initSubStateForExercise(firstEx);
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
      this.sessionCursor = ift.cursor;
      this.sessionResults = [...ift.answers];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
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
        const ex = this.content.exerciseById[this.sessionExerciseIds[this.sessionCursor]];
        this.initSubStateForExercise(ex);
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

        // Actualiza lastBackupAt (D-77) — spread inmutable, mismo patrón
        // que persistInFlightTest (Alpine reactivity).
        this.state = { ...this.state, lastBackupAt: new Date().toISOString() };
        // Phase 4 D-78: primer-export-guard. Si nunca se había marcado
        // firstUsedAt (porque el usuario nunca completó una sesión), el
        // export también lo marca — el banner debería respetar este instant
        // como "comencé a usar la app".
        if (this.state.firstUsedAt === null) {
          this.state = { ...this.state, firstUsedAt: new Date().toISOString() };
        }
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
     *   5. Confirmación → `commitImport()`. Cancelación → no-op (el helper
     *      `requestConfirm` no admite `onCancel`; el `backupPendingImport`
     *      queda cargado pero inerte hasta el próximo import).
     *   6. `input.value = ''` SIEMPRE al final (Pitfall #2).
     *
     * Nota sobre `requestConfirm`: la firma actual (líneas 289-296) sólo
     * lee `message`, `confirmLabel`, `cancelLabel`, `onConfirm`. NO admite
     * `onCancel`. Aceptamos que cancelar deja `backupPendingImport` cargado
     * pero inerte — se sobreescribe en el siguiente import.
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
      // requestConfirm no admite onCancel; cancelar deja backupPendingImport
      // cargado pero inerte (se sobreescribe en el próximo import).
      this.requestConfirm({
        message: this.buildImportConfirmMessage(result.summary),
        confirmLabel: 'Continuar',
        cancelLabel: 'Cancelar',
        onConfirm: () => this.commitImport()
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
      const imported = applyNewExerciseRegression(this.backupPendingImport.state, this.content);
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
      // para Test completo) se delega en `applyResultToSession(ex, correct)`.
      // Esto centraliza el call-site de `applyImmediateFailure` para los 3
      // tipos en su "decisión final" (multi-choice aquí, word-buttons en
      // wordButtonsCheck, match en matchPickRight al completar todas las
      // parejas). Pitfall #2 (decisión final duplicada) evitado
      // arquitectónicamente. matchPickRight tiene ADEMÁS un segundo
      // call-site directo de applyImmediateFailure en el primer fallo,
      // protegido por `matchHadFailure` (D-61).
      this.applyResultToSession(ex, correct);
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
     * @param {object} ex - El ejercicio actual (sessionCurrentExercise).
     * @param {boolean} correct - Resultado del grading.
     */
    applyResultToSession(ex, correct) {
      this.sessionFeedback = correct ? 'correct' : 'incorrect';
      this.sessionResults.push({ exerciseId: ex.id, correct });

      if (correct) {
        // SESSION-05 verde: auto-avance tras ~600ms. Guardar handle para
        // poder cancelar (Pitfall #5).
        this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
      } else {
        // D-54: cascada inmediata + persist (single call-site para todos
        // los tipos). Plan 02-03 UAT round 2 confirmó que este es el
        // único patrón que cierra el exploit "fallo + cierra pestaña".
        const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
        // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
        newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
        saveState(newState);
        this.state = newState;
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

      this.sessionCursor += 1;
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      if (this.sessionCursor >= this.sessionExerciseIds.length) {
        this.completeSession();
      } else {
        // Phase 3 plan 01: inicializar sub-estado del NUEVO ejercicio antes
        // de que Alpine reactive bindings lean el x-data (Pitfall #3: el
        // wordButtonsBank del ejercicio anterior arrastra basura si no
        // limpiamos antes del render del siguiente).
        const nextEx = this.content.exerciseById[this.sessionExerciseIds[this.sessionCursor]];
        this.initSubStateForExercise(nextEx);

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
    // Word-buttons handlers (Phase 3 plan 01; D-56, D-58, D-69)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Mueve la palabra en posición `idx` del banco al final del área respuesta.
     * Inmutable: asigna arrays NUEVOS para que la reactividad de Alpine los
     * detecte (in-place `splice`/`push` no triggerea reactividad fiable).
     *
     * Guard: si ya hay feedback (acertó/falló), no hacer nada. Esto cubre
     * tanto el click de ratón como las teclas 1-9 después del Comprobar.
     *
     * @param {number} idx - Índice de la palabra en `wordButtonsBank`.
     */
    wordButtonsAddWord(idx) {
      if (this.sessionFeedback !== null) return;
      if (idx < 0 || idx >= this.wordButtonsBank.length) return;
      const word = this.wordButtonsBank[idx];
      this.wordButtonsBank = this.wordButtonsBank.filter((_, i) => i !== idx);
      this.wordButtonsAnswer = [...this.wordButtonsAnswer, word];
    },

    /**
     * Inverso simétrico: mueve la palabra en posición `idx` del área respuesta
     * de vuelta al final del banco. D-56: la palabra que regresa NO preserva
     * su posición original en el banco — se append-ea al final. Esto es
     * coherente con la mecánica "vuelve al banco" sin estado de "huecos".
     *
     * @param {number} idx - Índice en `wordButtonsAnswer`.
     */
    wordButtonsRemoveWord(idx) {
      if (this.sessionFeedback !== null) return;
      if (idx < 0 || idx >= this.wordButtonsAnswer.length) return;
      const word = this.wordButtonsAnswer[idx];
      this.wordButtonsAnswer = this.wordButtonsAnswer.filter((_, i) => i !== idx);
      this.wordButtonsBank = [...this.wordButtonsBank, word];
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
      this.applyResultToSession(ex, correct);
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
          this.applyResultToSession(ex, !this.matchHadFailure);
        }
      } else {
        // Pareja incorrecta — D-61 cascada inmediata SOLO en el primer fallo.
        // Pitfall #2 idempotencia: el guard `matchHadFailure` evita writes
        // redundantes a localStorage en fallos consecutivos del MISMO ejercicio.
        if (!this.matchHadFailure) {
          const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
          // Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).
          newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
          saveState(newState);
          this.state = newState;
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
      this.wordButtonsAnswer = [];
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      this.cancelMatchFlash();

      if (!exercise) return;

      if (exercise.type === 'word-buttons') {
        // D-57: banco = shuffle(answer ∪ distractors). El shuffle usa
        // Math.random (no seedable aquí — el sampler ya usa seed determinista
        // para los IDs, pero el banco visual es non-deterministic intentional:
        // queremos que el autor vea órdenes distintos en cada session reload).
        const all = [
          ...(exercise.payload.answer ?? []),
          ...(exercise.payload.distractors ?? [])
        ];
        this.wordButtonsBank = fisherYates(all);
        this.wordButtonsAnswer = [];
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
      }
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
          if (idx < (ex.payload.options?.length ?? 0)) {
            this.sessionSelectOption(idx);
          }
          return;
        }
        if (ex.type === 'word-buttons') {
          // D-69: 1..9 dinámicos sobre las palabras visibles del banco.
          if (idx < this.wordButtonsBank.length && idx < 9) {
            this.wordButtonsAddWord(idx);
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
      this.currentScreen = 'home';
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
      return this.content.exerciseById?.[id] ?? null;
    },

    /** SESSION-04: indicador "Ejercicio X / N" visible toda la sesión. */
    get sessionProgressLabel() {
      return `Ejercicio ${this.sessionCursor + 1} / ${this.sessionExerciseIds.length}`;
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
     * @returns {Array<{word: string, key: string}>}
     */
    get bankWithKeys() {
      if (!this.sessionCurrentExercise) return [];
      return this.wordButtonsBank.map((word, idx) => ({
        word,
        key: idx < 9 ? String(idx + 1) : ''
      }));
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
     * totalCount, lastPracticedLabel}`. `status` se deriva del
     * `categoryProgress[id]` con default `'no-hecha'` (D-47 lazy init).
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
        return {
          id: cat.id,
          name: cat.name,
          status,
          badgeGlyph: badgeGlyphFor(status),
          statusLabel: statusLabelFor(status),
          // D-55 (UAT round 2): formato `N / 21 d` para no-dominada (visualiza
          // el objetivo 21 días), `N d` para dominada (ya superó el objetivo).
          streakLabel: formatStreak(streak, status),
          totalCount: (exercisesByCat[cat.id] ?? []).length,
          lastPracticedLabel: formatRelativeDate(lastPracticedDate, today)
        };
      });
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
