// src/screens/session.js
//
// Factory de componente Alpine `sessionScreen(content, state)`.
//
// Responsabilidad: gestionar el estado de una sesión de práctica.
//   - Construye la sesión llamando a `buildSession()` con el pool de Avere.
//   - Sirve el ejercicio actual al template HTML vía getters.
//   - Recibe clicks de opción y los califica con el handler del registry.
//   - Aplica feedback verde/rojo (SESSION-05) y auto-avanza ~600ms en verde.
//   - Al final de la sesión, llama UNA SOLA VEZ `applySessionResult` + `saveState`
//     (D-20: write-once-at-session-end).
//
// Reglas de pureza del módulo:
//   - NO toca `document`, `window`, ni `innerHTML`. La manipulación del DOM
//     vive en los `x-` directives de `index.html` (Alpine se encarga).
//   - `setTimeout`/`clearTimeout` SÍ se usan: son globales, no DOM. Necesarios
//     para el auto-advance cancelable (anti pitfall #5).
//   - Imports solo de capas inferiores: domain/, data/, exercise-types/.
//     Nunca importa de otros screens/, y nunca de main.js.
//
// Decisiones aplicadas (referencias a CONTEXT.md / RESEARCH.md):
//   - D-20: `advance()` solo dispara `saveState` cuando `this.done === true`,
//     que sucede una sola vez por sesión completada.
//   - SESSION-04: `progressLabel` getter expone "Ejercicio X / N".
//   - SESSION-05: verde → setTimeout(600ms) → advance(); rojo → no schedule
//     (espera click manual en "Siguiente").
//   - RESEARCH.md Pattern 4: forma del x-data shape.
//   - RESEARCH.md Pitfall #5: cancelar setTimeout en cada `advance()` y en
//     `destroy()` para evitar saltos de ejercicio.
//   - T-02-02: guard `if (this.feedback !== null) return` ignora double-clicks.
//   - T-02-01: el HTML usa exclusivamente `x-text` (nunca `x-html`).
//   - D-13 edge case: si `actualSize === 0`, `ready = false` y el template
//     "no hay ejercicios" del HTML aparece. Defensivo: con el seed Phase 1
//     (12 ejercicios) este branch es inalcanzable.

import { buildSession } from '../domain/session.js';
import { applySessionResult } from '../domain/progress.js';
import { saveState } from '../data/storage.js';
import { registry } from '../exercise-types/index.js';

/**
 * Construye el objeto Alpine para la pantalla de sesión.
 *
 * El registro con Alpine se hace en `main.js`:
 *   Alpine.data('sessionScreen', () => sessionScreen(appDataReady));
 *
 * Luego el HTML hace `<div x-data="sessionScreen" x-init="init()">`.
 *
 * Patrón: el factory acepta una Promise (no content/state directos) para
 * desacoplar el ciclo de vida de Alpine (que arranca síncrono con su defer
 * script) del fetch async del contenido. Alpine puede montar el componente
 * en cuanto evalúa `x-data`; el `init()` espera la promise antes de
 * construir la sesión.
 *
 * @param {Promise<{content: object, state: object}>} appDataReady
 *   Promise resuelta por main.js cuando el JSON está cargado y validado.
 *   Si nunca resuelve (caso error de validación), `init()` queda en `await`
 *   indefinidamente y `ready` permanece false — el banner de error de
 *   main.js es entonces el único output (D-10: all-or-nothing).
 * @returns {object} Objeto Alpine data con métodos y reactive props.
 */
export function sessionScreen(appDataReady) {
  return {
    // ---- referencias inyectadas (llenadas en init() tras await) ----
    content: null,
    state: null,

    // ---- bootstrap ----
    ready: false,

    // ---- estado de la sesión ----
    exerciseIds: [],
    cursor: 0,
    results: [],           // Array<{exerciseId, correct}>
    autoAdvanceHandle: null,

    // ---- estado UI per-ejercicio ----
    selectedIndex: null,
    feedback: null,        // null | 'correct' | 'incorrect'

    /**
     * Lifecycle: Alpine llama `init()` cuando monta el x-data
     * (en este HTML lo invocamos explícitamente con `x-init="init()"`).
     *
     * Esperamos la promise `appDataReady` ANTES de construir la sesión.
     * Mientras tanto Alpine muestra el template "no ready" (el de "no hay
     * ejercicios"). Una vez cumplida, llamamos a buildSession y ponemos
     * `ready = true`, lo que cambia al template activo de sesión.
     */
    async init() {
      const { content, state } = await appDataReady;
      this.content = content;
      this.state = state;

      const allExercises = Object.values(this.content.exerciseById);
      const { exerciseIds, actualSize } = buildSession(
        ['avere'],
        allExercises,
        this.state,
        20,
        'repaso'
      );
      this.exerciseIds = exerciseIds;

      if (actualSize === 0) {
        // D-13 edge case defensivo. Con el seed Phase 1 (12 ejercicios) esto
        // no debería pasar; si pasa, el HTML muestra el template "no hay
        // ejercicios" gracias a `ready === false`.
        this.ready = false;
        return;
      }

      this.ready = true;
    },

    /** Ejercicio actualmente mostrado. */
    get currentExercise() {
      return this.content.exerciseById[this.exerciseIds[this.cursor]];
    },

    /** SESSION-04: indicador "Ejercicio X / N" visible toda la sesión. */
    get progressLabel() {
      return `Ejercicio ${this.cursor + 1} / ${this.exerciseIds.length}`;
    },

    /** True cuando el cursor ha pasado del último ejercicio (sesión terminada). */
    get done() {
      return this.cursor >= this.exerciseIds.length;
    },

    /**
     * Click sobre una de las opciones. Califica, marca feedback, y schedule
     * auto-advance solo si fue correcto.
     *
     * @param {number} idx - índice de la opción clicada (0-based).
     */
    selectOption(idx) {
      // T-02-02: ignora double-clicks o clicks tras ya haber respondido.
      if (this.feedback !== null) return;

      this.selectedIndex = idx;
      const ex = this.currentExercise;
      const handler = registry[ex.type];
      const correct = handler.grade(ex, { index: idx });

      this.feedback = correct ? 'correct' : 'incorrect';
      this.results.push({ exerciseId: ex.id, correct });

      if (correct) {
        // SESSION-05 verde: auto-avance tras ~600ms.
        // Guardamos el handle para poder cancelarlo (Pitfall #5).
        this.autoAdvanceHandle = setTimeout(() => this.advance(), 600);
      }
      // Si !correct, no scheduulamos nada: el HTML expone botón "Siguiente"
      // que llamará `advance()` cuando el usuario decida continuar.
    },

    /**
     * Avanza al siguiente ejercicio. Cancela cualquier setTimeout pendiente
     * para evitar dobles avances (pitfall #5).
     *
     * Si tras incrementar el cursor la sesión está terminada, aplica los
     * resultados al state y persiste UNA SOLA VEZ (D-20).
     */
    advance() {
      // Pitfall #5 mitigation — cancelar antes de cualquier cosa que pueda
      // mutar `cursor`, para que el setTimeout pendiente no dispare con el
      // siguiente ejercicio ya visible.
      this.cancelAutoAdvance();

      this.cursor += 1;
      this.selectedIndex = null;
      this.feedback = null;

      if (this.done) {
        // D-20: escritura única al final de sesión.
        // `applySessionResult` es pura — devuelve un nuevo estado.
        const newState = applySessionResult(this.state, { answers: this.results });
        saveState(newState);
        this.state = newState;
      }
    },

    /**
     * Cancela el setTimeout pendiente (si lo hay). Idempotente — llamable
     * desde `advance()` y desde `destroy()` sin riesgo de error.
     */
    cancelAutoAdvance() {
      if (this.autoAdvanceHandle !== null) {
        clearTimeout(this.autoAdvanceHandle);
        this.autoAdvanceHandle = null;
      }
    },

    /**
     * Hook que Alpine invoca cuando el x-data se desmonta (cambio de pantalla,
     * navegación, hot-reload). Safety net: aseguramos que no quedan timers
     * vivos que podrían disparar tras la destrucción.
     */
    destroy() {
      this.cancelAutoAdvance();
    }
  };
}
