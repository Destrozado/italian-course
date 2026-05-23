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
//
// Reglas de pureza del módulo:
//   - NO toca `document`, `window`, ni `innerHTML`. La manipulación del DOM
//     vive en los `x-` directives de `index.html` (Alpine se encarga).
//   - `setTimeout`/`clearTimeout` SÍ se usan: son globales, no DOM. Necesarios
//     para el auto-advance cancelable (Pitfall #5).
//   - Imports solo de capas inferiores: `domain/`, `data/storage.js`,
//     `exercise-types/`. NUNCA imports cross-screen (solo hay un screen).

import { buildSession, buildFullTest } from '../domain/session.js';
import { applySessionResult, applyImmediateFailure } from '../domain/progress.js';
import { todayLocal } from '../domain/dates.js';
import { saveState } from '../data/storage.js';
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

    // ─── Navegación (D-24) ──────────────────────────────────────────────────
    /** 'home' | 'picker' | 'session' | 'summary'. */
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

    // ─── Sub-estado summary (stub; Plan 02-04 lo poblará) ───────────────────
    summaryDelta: null,
    summaryHeaderLabel: '',

    // ─── Helper compartido confirmación inline (D-27 / D-43 / D-44) ─────────
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
    },

    // ════════════════════════════════════════════════════════════════════════
    // Navegación entre pantallas (D-24, D-27)
    // ════════════════════════════════════════════════════════════════════════

    /**
     * Lanza el picker desde uno de los dos botones grandes de home.
     * D-34: checkboxes DESMARCADOS al entrar (cada vez, no recuerda última
     * selección — decisión deliberada para forzar elección consciente).
     *
     * @param {'repaso'|'test-completo'} mode
     */
    openPicker(mode) {
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
      // Picker, summary, o session en modo 'test-completo': directo.
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
      this.sessionMode = null;
      this.sessionExerciseIds = [];
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
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
     * NO escribe `inFlightTest` aún (eso es Plan 02-04, persistencia per-answer
     * de Test completo).
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
      this.currentScreen = 'session';
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

      this.sessionFeedback = correct ? 'correct' : 'incorrect';
      this.sessionResults.push({ exerciseId: ex.id, correct });

      if (correct) {
        // SESSION-05 verde: auto-avance tras ~600ms. Guardar handle para
        // poder cancelar (Pitfall #5).
        this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
      } else {
        // D-54: cascada inmediata + persist. El estado refleja la regresión
        // ANTES de que el usuario pueda abandonar la sesión. applySessionResult
        // al final es idempotente respecto a este reset (rama FAIL-WINS aplicada
        // sobre state ya reseteado = no-op para la cascada). Los exerciseStats
        // SE BUMPEAN una sola vez ahí al final, preservando D-09 monotonicidad.
        const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
        saveState(newState);
        this.state = newState;
        // No schedule: el HTML expone "Siguiente" que llamará sessionAdvance()
        // cuando el usuario decida.
      }
    },

    /**
     * Avanza al siguiente ejercicio. Cancela cualquier setTimeout pendiente
     * antes (Pitfall #5).
     *
     * Si tras incrementar el cursor la sesión está terminada, dispara
     * `completeSession()` para aplicar la cascada/promociones y persistir.
     */
    sessionAdvance() {
      this.cancelAutoAdvance();

      this.sessionCursor += 1;
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      if (this.sessionCursor >= this.sessionExerciseIds.length) {
        this.completeSession();
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

    /**
     * Cierra la sesión: aplica la cascada/promociones (D-39) y persiste el
     * nuevo estado (D-20 write-once-on-done para Repaso).
     *
     * Plan 02-03 (versión simple): tras persistir, vuelve directamente a
     * home — sin pantalla de resumen aún. La tabla de home muestra el state
     * actualizado al volver.
     *
     * Plan 02-04 REEMPLAZARÁ este final por: computar `summaryDelta` con
     * categoryProgress antes/después, `currentScreen = 'summary'`, etc.
     */
    completeSession() {
      const sessionResult = { answers: this.sessionResults };
      const today = todayLocal();
      const newState = applySessionResult(this.state, sessionResult, this.content, today);
      saveState(newState);
      this.state = newState;
      this.resetSession();
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
          streakLabel: formatStreak(streak),
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
 * Formato del label de racha (D-29): siempre con sufijo " d", cap visual a
 * "21+ d" cuando alcanza 21 (para no llenar la celda con cifras grandes).
 *
 * @param {number} streak
 * @returns {string}
 */
function formatStreak(streak) {
  if (typeof streak !== 'number' || streak < 0 || Number.isNaN(streak)) return '0 d';
  if (streak >= 21) return '21+ d';
  return `${streak} d`;
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
