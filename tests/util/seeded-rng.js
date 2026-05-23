// tests/util/seeded-rng.js
//
// RNG determinista (LCG con constantes de Numerical Recipes) para tests
// que necesitan reproducibilidad. Devuelve floats en [0, 1).
//
// No es criptográfico — solo para hacer tests deterministas.

/**
 * @param {number} seed - Semilla entera (uint32).
 * @returns {() => number} Función rng() compatible con `Math.random`.
 */
export function seededLcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
