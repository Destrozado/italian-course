// src/exercise-types/index.js
//
// Registry de tipos de ejercicio. Cada tipo expone (al menos) `grade()`.
//
// Phase 3 completo: registry expone los 3 tipos finales (multiple-choice +
// word-buttons + match). El consumidor (Alpine session screen en
// `src/screens/app.js`) hace:
//   const handler = registry[exercise.type];
//   const result = handler.grade(exercise, response);
//
// Nota sobre el contrato de `grade()`:
//   - `multiple-choice` y `word-buttons` retornan `boolean`.
//   - `match` retorna `{correct: boolean, pairIdx?: number}` por necesidad
//     funcional D-66 (duplicados textuales en columna derecha — el caller
//     necesita el `pairIdx` consumido). La asimetría se justifica en el
//     JSDoc de `match.js`; no es una inconsistencia del registry.
//
// Registry agnóstico (D-01): el switch por tipo se hace AQUÍ (lookup en este
// objeto), nunca dentro de un `grade()` concreto.

import { multipleChoice } from './multiple-choice.js';
import { wordButtons } from './word-buttons.js';
import { match } from './match.js';

/**
 * Registry de exercise-type handlers indexado por `exercise.type`.
 */
export const registry = {
  'multiple-choice': multipleChoice,
  'word-buttons': wordButtons,
  'match': match
};
