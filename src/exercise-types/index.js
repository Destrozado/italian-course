// src/exercise-types/index.js
//
// Registry de tipos de ejercicio. Cada tipo expone (al menos) `grade()`.
//
// Phase 1 solo registra `multiple-choice`. Phase 3 añadirá `word-buttons` y
// `match` SIN tocar este archivo más que para añadir entradas al registry.
//
// El consumidor (Alpine session screen en Plan 02) hace:
//   const handler = registry[exercise.type];
//   const correct = handler.grade(exercise, response);

import { multipleChoice } from './multiple-choice.js';

/**
 * Registry de exercise-type handlers indexado por `exercise.type`.
 */
export const registry = {
  'multiple-choice': multipleChoice
};
