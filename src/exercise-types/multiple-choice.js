// src/exercise-types/multiple-choice.js
//
// Handler para el tipo de ejercicio "multiple-choice".
//
// Phase 1 expone únicamente `grade()`. El render se hace vía template Alpine
// en `index.html` (Plan 02), siguiendo el patrón de "UI declarativa,
// dominio puro".
//
// Decisiones aplicadas:
//   - EXTYPE-01: tipo multiple-choice (frase con hueco + 3-4 botones).
//   - Anti-pattern evitado: "UI grades the answer". `grade()` vive aquí,
//     no en el x-data ni en un atributo HTML.

/**
 * Handler de multiple-choice.
 *
 * `grade(exercise, response)` recibe el ejercicio + la respuesta del usuario
 * y devuelve un boolean indicando si es correcta.
 */
export const multipleChoice = {
  /**
   * @param {{payload: {correctIndex: number}}} exercise
   * @param {{index: number}} response
   * @returns {boolean}
   */
  grade(exercise, response) {
    return response.index === exercise.payload.correctIndex;
  }
};
