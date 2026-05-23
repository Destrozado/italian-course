// src/domain/session.js
//
// Pure domain module — sampler de sesión. Sin DOM, sin storage, sin fetch.
//
// Decisiones aplicadas:
//   - DOMAIN-02: `buildSession(...)` con weighted random + sin reemplazo.
//   - D-13: si `#pool < requestedSize`, reducimos al disponible (NO repetir).
//   - D-14: ejercicios dentro de una sesión son únicos (sin reemplazo).
//   - Weight cap = 10: `weight = 1 / (1 + min(timesShown, 10))` — evita que
//     ejercicios nuevos (timesShown=0) monopolicen el muestreo durante semanas.
//
// Phase 1 scope (per Assumption A5 del RESEARCH.md): solo FILL phase con
// weighted random. La GUARANTEE phase (set-cover greedy para multi-categoría)
// llega en Phase 2 cuando haya >1 categoría. En Phase 1 hay una sola categoría
// ("avere") así que el set-cover es trivial / no-op.

/** Cap de timesShown a la hora de computar el peso. */
const WEIGHT_CAP = 10;

/**
 * Peso de un ejercicio en función de cuántas veces se ha mostrado.
 *
 *   weight(0)   = 1
 *   weight(1)   = 1/2
 *   weight(10)  = 1/11
 *   weight(100) = 1/11  (capped)
 *
 * @param {number} timesShown - Veces que se ha mostrado (monotónico, >= 0).
 * @returns {number} Peso en (0, 1].
 */
export function exerciseWeight(timesShown) {
  return 1 / (1 + Math.min(timesShown ?? 0, WEIGHT_CAP));
}

/**
 * Construye una sesión de práctica.
 *
 * - Filtra el pool a ejercicios cuyo `categoryIds` solape con `categoryIds`.
 * - Muestrea sin reemplazo con probabilidad proporcional a `exerciseWeight`.
 * - Si el pool es menor que `requestedSize`, devuelve el pool entero (D-13).
 * - Reordena la lista final con Fisher-Yates usando el mismo `rng`.
 *
 * Pure: no muta `state` ni `allExercises`.
 *
 * @param {string[]} categoryIds   - Categorías seleccionadas.
 * @param {Array<{id: string, categoryIds: string[]}>} allExercises - Pool completo.
 * @param {{exerciseStats?: Record<string, {timesShown: number}>}} state - Estado.
 * @param {number} requestedSize   - Tamaño deseado de la sesión (p.ej. 20).
 * @param {'repaso'} [mode='repaso'] - Phase 1 solo soporta 'repaso'.
 * @param {() => number} [rng=Math.random] - RNG inyectable para tests.
 * @returns {{ exerciseIds: string[], actualSize: number }}
 */
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) {
  // 1. Filtrar el pool a ejercicios elegibles
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  if (pool.length === 0) return { exerciseIds: [], actualSize: 0 };

  // 2. Reducir al disponible (D-13)
  const targetSize = Math.min(requestedSize, pool.length);
  const remaining = [...pool];
  const picked = [];

  // 3. Loop de weighted sampling sin reemplazo
  while (picked.length < targetSize && remaining.length > 0) {
    const weights = remaining.map(ex =>
      exerciseWeight(state.exerciseStats?.[ex.id]?.timesShown ?? 0)
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let r = rng() * totalWeight;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    // Safety por float-rounding: si nada salió debajo de 0, el último índice
    if (idx >= remaining.length) idx = remaining.length - 1;

    picked.push(remaining[idx]);
    remaining.splice(idx, 1); // D-14: sin reemplazo
  }

  // 4. Fisher-Yates final con el mismo rng
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return {
    exerciseIds: picked.map(ex => ex.id),
    actualSize: picked.length
  };
}
