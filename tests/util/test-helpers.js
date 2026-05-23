// tests/util/test-helpers.js
//
// Helpers compartidos por las suites del dominio v2 (Phase 2). NO importan
// nada de `src/data/storage.js` (que toca `localStorage`, no disponible bajo
// `node --test`). Todo lo que aquí vive es puro y trivialmente serializable.
//
// Decisiones aplicadas:
//   - D-19/D-46: shape v2 fijado en `blankStateV2`.
//   - D-47: el helper `setupHechaState` materializa el estado "hecha" sin
//     pasar por toda la cadena de promociones — útil para tests que parten de
//     "ya está hecha" y solo verifican una transición.

/**
 * Devuelve un clon literal del shape v2 esperado de `blankState`. Coincide
 * con `src/data/storage.js → blankState()` por construcción.
 *
 * @returns {{schemaVersion: 2, exerciseStats: object, categoryProgress: object, dailyLog: object}}
 */
export function blankStateV2() {
  return {
    schemaVersion: 2,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {}
  };
}

/**
 * Construye un objeto `content` (shape `{categories, exerciseById}`) listo
 * para inyectar a `applySessionResult` desde una lista corta de specs.
 *
 * `categories` se deriva del set único de `categoryIds` vistos en los specs
 * (orden de primera aparición). Defaults razonables para campos opcionales.
 *
 * @param {Array<{id: string, categoryIds: string[], type?: string, payload?: object}>} exerciseSpecs
 * @returns {{categories: Array<{id:string,name:string,order:number}>, exerciseById: Record<string, object>}}
 */
export function makeContent(exerciseSpecs) {
  const exerciseById = {};
  const seen = [];
  for (const spec of exerciseSpecs) {
    exerciseById[spec.id] = {
      id: spec.id,
      type: spec.type ?? 'multiple-choice',
      categoryIds: spec.categoryIds,
      payload: spec.payload ?? {}
    };
    for (const cid of spec.categoryIds ?? []) {
      if (!seen.includes(cid)) seen.push(cid);
    }
  }
  const categories = seen.map((id, idx) => ({ id, name: id, order: idx + 1 }));
  return { categories, exerciseById };
}

/**
 * Construye un estado v2 partiendo de blank y poniendo una categoría en
 * estado `hecha` con `clearedExerciseIds` y `streakDays` arbitrarios.
 *
 * Útil para tests que prueban transiciones desde `hecha` (incremento de
 * racha, promoción a `dominada`, regresión por fallo) sin tener que simular
 * la cadena de aciertos previos.
 *
 * @param {string} catId - ID de la categoría a marcar como `hecha`.
 * @param {string[]} exerciseIds - IDs que se consideran "cleared" para la categoría.
 * @param {object} [opts]
 * @param {number} [opts.streakDays=5] - Días de racha a setear.
 * @param {string} [opts.lastSuccessDate] - Fecha ISO del último éxito (default: undefined).
 * @param {string} [opts.becameHechaAt='2026-01-01'] - Fecha ISO de promoción a `hecha`.
 * @returns {object} Estado v2.
 */
export function setupHechaState(catId, exerciseIds, opts = {}) {
  const state = blankStateV2();
  state.categoryProgress[catId] = {
    status: 'hecha',
    clearedExerciseIds: [...exerciseIds],
    streakDays: opts.streakDays ?? 5,
    lastPracticedDate: opts.lastPracticedDate,
    lastSuccessDate: opts.lastSuccessDate,
    becameHechaAt: opts.becameHechaAt ?? '2026-01-01',
    becameDominadaAt: undefined
  };
  return state;
}

/**
 * Construye un estado v2 con una categoría en estado `dominada`. Útil para
 * probar la regresión total tras un fallo desde `dominada`.
 *
 * @param {string} catId
 * @param {string[]} exerciseIds
 * @param {object} [opts]
 * @param {number} [opts.streakDays=25]
 * @param {string} [opts.becameDominadaAt='2026-05-01']
 * @returns {object} Estado v2.
 */
export function setupDominadaState(catId, exerciseIds, opts = {}) {
  const state = blankStateV2();
  state.categoryProgress[catId] = {
    status: 'dominada',
    clearedExerciseIds: [...exerciseIds],
    streakDays: opts.streakDays ?? 25,
    lastPracticedDate: opts.lastPracticedDate,
    lastSuccessDate: opts.lastSuccessDate,
    becameHechaAt: opts.becameHechaAt ?? '2026-04-10',
    becameDominadaAt: opts.becameDominadaAt ?? '2026-05-01'
  };
  return state;
}
