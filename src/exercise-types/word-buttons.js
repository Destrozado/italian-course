// src/exercise-types/word-buttons.js
//
// Handler para el tipo de ejercicio "word-buttons" (Phase 3 plan 01).
//
// El usuario construye una frase italiana arrastrando/clickeando palabras de
// un banco hacia un área respuesta. La secuencia colocada se compara con
// `payload.answer[]` en orden.
//
// El render vive vía template Alpine en `index.html` (Task 2b del plan).
// `grade()` aquí es puro — sin DOM, sin storage, sin fetch.
//
// Decisiones aplicadas:
//   - D-64: payload shape `{prompt: string, answer: string[], distractors?: string[]}`.
//     `prompt` es la frase en español a traducir; `answer` es la secuencia
//     exacta de tokens italianos en orden; `distractors` son tokens extra
//     opcionales que se muestran en el banco pero no aparecen en la respuesta.
//   - D-67: grading case-insensitive — comparación de `actual[i].toLowerCase()`
//     contra `expected[i].toLowerCase()`. Ambas listas ya están NFC-normalised
//     desde CONT-06 (al cargar el JSON); aquí NO se renormaliza.
//   - CONT-06: NFC ya aplicado al cargar; no renormalizar.
//   - Layer purity D-02: sin DOM/storage/fetch. Módulo importable desde Node
//     (`node --test`) y desde el navegador.
//   - Anti-pattern evitado: "UI grades the answer". `grade()` vive aquí,
//     no en el x-data ni en un atributo HTML. La UI solo construye el
//     `response.tokens` y llama al handler vía `registry[ex.type].grade(...)`.

/**
 * Handler de word-buttons.
 *
 * `grade(exercise, response)` recibe el ejercicio + la respuesta del usuario
 * y devuelve un boolean indicando si la secuencia colocada coincide exactamente
 * con `payload.answer` (case-insensitive).
 */
export const wordButtons = {
  /**
   * @param {{payload: {answer: string[]}}} exercise
   * @param {{tokens?: string[]}} response
   * @returns {boolean}
   */
  grade(exercise, response) {
    const expected = exercise.payload.answer;
    const actual = response.tokens ?? [];
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (actual[i].toLowerCase() !== expected[i].toLowerCase()) return false;
    }
    return true;
  }
};
