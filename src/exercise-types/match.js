// src/exercise-types/match.js
//
// Handler para el tipo de ejercicio "match" (Phase 3 plan 02).
//
// El usuario empareja items de dos columnas (izquierda ↔ derecha). El handler
// recibe UNA pareja propuesta y devuelve `{correct, pairIdx?}`:
//   - `correct: true` Y `pairIdx: N` cuando la pareja coincide textualmente
//     (case-insensitive) con `payload.pairs[N]` y N NO está en `consumedPairIdx`.
//   - `correct: false` (sin `pairIdx`) cuando no se encuentra ningún pair libre
//     que coincida — ya sea por tokens incorrectos o porque todos los matches
//     posibles están ya consumidos.
//
// El caller (`matchPickRight` en `src/screens/app.js`) usa `pairIdx` para
// marcar el pair como consumido — D-66 duplicados textuales en columna derecha
// se resuelven por índice interno, no por texto.
//
// El render vive vía template Alpine en `index.html` (Plan 03-02 Task 2).
// `grade()` aquí es puro — sin DOM, sin storage, sin fetch.
//
// Decisiones aplicadas:
//   - D-65: payload shape `{prompt: string, pairs: Array<[string, string]>}`
//     con 2 ≤ pairs.length ≤ 10. La validación del shape vive en
//     `src/data/schema-validator.js` (Phase 3 plan 02 reemplaza el stub del
//     plan 01 con la impl real); aquí `grade()` asume que el payload está
//     bien-formado (los ejercicios cuyo schema falla NUNCA llegan a `grade`).
//   - D-66: duplicados textuales en columna derecha permitidos. Tracking por
//     índice del payload — `consumedPairIdx[]` señala qué pares han sido ya
//     emparejados en el ejercicio actual. El handler busca el PRIMER pair
//     libre que coincide AMBOS lados textualmente.
//   - D-67: grading case-insensitive — `pair[0].toLowerCase()` se compara con
//     `response.leftWord.toLowerCase()`, idem para `pair[1]`/`rightWord`.
//   - CONT-06: strings ya NFC-normalised al cargar el JSON; aquí NO se
//     renormaliza (sería trabajo redundante).
//   - Layer purity D-02: sin DOM, sin storage, sin fetch. Módulo importable
//     desde Node (`node --test`) y desde el navegador.
//   - Anti-pattern evitado: "UI grades the answer". `grade()` vive aquí,
//     no en el x-data ni en un atributo HTML. La UI solo construye el
//     `response` (`{leftWord, rightWord, consumedPairIdx}`) y llama al handler
//     vía `registry[ex.type].grade(...)`.
//
// Nota sobre la asimetría con `multiple-choice` y `word-buttons`:
//   Ambos retornan un `boolean` directo. `match` retorna `{correct, pairIdx?}`
//   por NECESIDAD funcional (D-66) — el caller necesita el índice del pair
//   consumido para añadirlo a `matchPairsConsumed`. No es por inconsistencia
//   con el contrato del registry; es la única forma de soportar duplicados
//   textuales en columna derecha sin que la UI inspeccione el payload.

/**
 * Handler de match.
 *
 * `grade(exercise, response)` recibe el ejercicio + UNA pareja propuesta por
 * el usuario y devuelve `{correct, pairIdx?}` (D-66 enriquecido).
 */
export const match = {
  /**
   * @param {{payload: {pairs: Array<[string, string]>}}} exercise
   * @param {{leftWord: string, rightWord: string, consumedPairIdx?: number[]}} response
   * @returns {{correct: boolean, pairIdx?: number}}
   */
  grade(exercise, response) {
    const { pairs } = exercise.payload;
    const consumed = new Set(response.consumedPairIdx ?? []);
    const lwLower = (response.leftWord ?? '').toLowerCase();
    const rwLower = (response.rightWord ?? '').toLowerCase();
    for (let i = 0; i < pairs.length; i++) {
      if (consumed.has(i)) continue;
      const [pl, pr] = pairs[i];
      if (pl.toLowerCase() === lwLower && pr.toLowerCase() === rwLower) {
        return { correct: true, pairIdx: i };
      }
    }
    return { correct: false };
  }
};
