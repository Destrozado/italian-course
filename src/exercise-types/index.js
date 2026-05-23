// src/exercise-types/index.js
//
// Registry de tipos de ejercicio. Cada tipo expone (al menos) `grade()`.
//
// Phase 3 plan 01 añade `word-buttons`. Plan 02 añadirá `match`. El consumidor
// (Alpine session screen en `src/screens/app.js`) hace:
//   const handler = registry[exercise.type];
//   const correct = handler.grade(exercise, response);
//
// Registry agnóstico (D-01): el switch por tipo se hace AQUÍ (lookup en este
// objeto), nunca dentro de un `grade()` concreto.

import { multipleChoice } from './multiple-choice.js';
import { wordButtons } from './word-buttons.js';

/**
 * Registry de exercise-type handlers indexado por `exercise.type`.
 */
export const registry = {
  'multiple-choice': multipleChoice,
  'word-buttons': wordButtons
};
