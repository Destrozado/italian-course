// src/domain/progress.js
//
// Pure domain module — actualización de contadores de progreso.
// Sin DOM, sin storage, sin fetch.
//
// Decisiones aplicadas:
//   - DOMAIN-09: contadores monotónicos. `timesShown`, `timesCorrect` y
//     `timesFailed` SOLO suben — nunca se decrementan. Esta función no expone
//     ninguna API para resetearlos.
//   - D-19: Phase 1 solo gestiona `exerciseStats`. Phase 2 extenderá esta
//     función para añadir `categoryProgress` (estados hecha/dominada),
//     `dailyLog` (racha 21 días) y la cascada de fallo multi-categoría.

/**
 * Aplica el resultado de una sesión al estado. PURA: devuelve un estado nuevo,
 * no muta el input.
 *
 * Phase 1 reducida: solo actualiza `exerciseStats[id]`. Phase 2 añadirá
 * cascada de fallo, promoción de categorías y registro diario.
 *
 * @param {{schemaVersion: number, exerciseStats: Record<string, {timesShown:number,timesCorrect:number,timesFailed:number}>}} state
 * @param {{answers: Array<{exerciseId: string, correct: boolean}>}} sessionResult
 * @returns {object} Nuevo estado con `exerciseStats` actualizado.
 */
export function applySessionResult(state, sessionResult) {
  // Spread-clone del estado y del subobjeto que mutamos
  const next = {
    ...state,
    exerciseStats: { ...(state.exerciseStats ?? {}) }
  };

  for (const ans of sessionResult.answers ?? []) {
    const prev = next.exerciseStats[ans.exerciseId] ?? {
      timesShown: 0,
      timesCorrect: 0,
      timesFailed: 0
    };
    // DOMAIN-09: contadores monotónicos — solo suben.
    next.exerciseStats[ans.exerciseId] = {
      timesShown: prev.timesShown + 1,
      timesCorrect: prev.timesCorrect + (ans.correct ? 1 : 0),
      timesFailed: prev.timesFailed + (ans.correct ? 0 : 1)
    };
  }

  return next;
}
