// src/domain/progress.js
//
// Pure domain module — máquina de estados completa de re-verificación.
// Sin DOM, sin storage, sin fetch (D-02 layer-purity heredado de Phase 1).
//
// Decisiones aplicadas:
//   - DOMAIN-09 (Phase 1): contadores monotónicos. `timesShown`,
//     `timesCorrect` y `timesFailed` SOLO suben — nunca se decrementan.
//   - D-38: la racha cuenta solo cuando la categoría está (o se promociona) a
//     `hecha` y no hubo fallo en la sesión; guard `lastSuccessDate !== today`
//     impide doble incremento el mismo día.
//   - D-39: cascada fail-wins absoluto. Un solo ejercicio fallado de la
//     categoría borra TODOS los aciertos previos (esta sesión + acumulados).
//     Promociones `no-hecha → hecha → dominada` a los 21 días.
//   - D-47: `categoryProgress[id]` se inicializa lazy con
//     `blankCategoryProgress()` la primera vez que la categoría es tocada.
//   - D-48: `dailyLog[isoDate] = {date, categoriesPracticed[], categoriesWithFailure[]}`.
//   - D-52: `today` se inyecta como string ISO 'YYYY-MM-DD'. El caller
//     (`src/screens/app.js`, Plan 02-03) suministra `todayLocal()`; los tests
//     inyectan strings deterministas. La firma rompe Phase 1
//     intencionalmente: `applySessionResult(state, sessionResult, content, today)`
//     ahora exige 4 argumentos (Pitfall #2 de RESEARCH).
//
// IMPORTANTE — `applyNewExerciseRegression` (DOMAIN-06): NO vive aquí. Se
// implementará en Plan 02-02 como export separada para invocarse SOLO en el
// boot de `main.js` (no en cada `applySessionResult`). Esto evita falsos
// positivos de regresión durante la sesión (Pitfall #10).

/**
 * Aplica el resultado de una sesión al estado. PURA: devuelve un estado nuevo,
 * no muta el input.
 *
 * Pasos del algoritmo (D-39):
 *   0. Pre-cómputo: índice `exercisesByCategory` derivado del content.
 *   1. Spread-clone defensivo del state y sub-objetos a mutar.
 *   2. Conjuntos auxiliares: `failedExerciseIds`, `correctExerciseIds`,
 *      `failedCategoryIds`, `practicedCategoryIds`.
 *   3. `exerciseStats` monotónico — corre SIEMPRE, al margen de fail/correct.
 *   4. Bucle por `practicedCategoryIds` con dos ramas:
 *        - FAIL-WINS: reset total de la categoría (clearedExerciseIds=[],
 *          status='no-hecha', streakDays=0, becameHechaAt/becameDominadaAt
 *          undefined). `lastSuccessDate` se preserva como huella histórica.
 *        - PROMOTION: acumula aciertos en clearedExerciseIds; promociona a
 *          `hecha`/`dominada` según D-38; incrementa racha con guard de día.
 *      `lastPracticedDate = today` SIEMPRE (rama fail o no).
 *   5. `dailyLog[today]` se popula/acumula con `categoriesPracticed` y
 *      `categoriesWithFailure` (idempotente con `uniqueStrings`).
 *   6. `inFlightTest` se borra (Pitfall #9): el caller asume idempotencia y
 *      no debería relanzar la cascada con el blob viejo de Test completo.
 *
 * @param {{schemaVersion:2, exerciseStats:object, categoryProgress:object, dailyLog:object, inFlightTest?:object}} state
 * @param {{answers: Array<{exerciseId: string, correct: boolean}>}} sessionResult
 * @param {{categories: Array<{id:string,name:string}>, exerciseById: Record<string, {id:string, categoryIds:string[]}>}} content
 * @param {string} today - Fecha local en formato `YYYY-MM-DD` (D-52). Obligatoria.
 * @returns {object} Nuevo estado (shape v2) con todas las mutaciones aplicadas.
 */
export function applySessionResult(state, sessionResult, content, today) {
  // 0. Pre-cómputo: índice de ejercicios por categoría desde el content.
  const exercisesByCategory = buildExercisesByCategory(content);

  // 1. Spread-clone defensivo del estado y de los sub-objetos que mutamos.
  const next = {
    ...state,
    exerciseStats: { ...(state.exerciseStats ?? {}) },
    categoryProgress: { ...(state.categoryProgress ?? {}) },
    dailyLog: { ...(state.dailyLog ?? {}) }
  };

  const answers = sessionResult.answers ?? [];

  // 2. Conjuntos auxiliares (paso 1 de D-39).
  const failedExerciseIds = answers.filter(a => !a.correct).map(a => a.exerciseId);
  const correctExerciseIds = answers.filter(a => a.correct).map(a => a.exerciseId);

  const failedCategoryIds = new Set(
    failedExerciseIds.flatMap(eid => content.exerciseById[eid]?.categoryIds ?? [])
  );
  const practicedCategoryIds = new Set(
    answers.flatMap(a => content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );

  // 3. exerciseStats monotónico (DOMAIN-09 — invariante crítico).
  //    Corre SIEMPRE, antes y al margen del branch fail/correct de la
  //    categoría. Un fallo nunca decrementa `timesCorrect`.
  for (const ans of answers) {
    const prev = next.exerciseStats[ans.exerciseId] ?? blankStat();
    next.exerciseStats[ans.exerciseId] = {
      timesShown: prev.timesShown + 1,
      timesCorrect: prev.timesCorrect + (ans.correct ? 1 : 0),
      timesFailed: prev.timesFailed + (ans.correct ? 0 : 1)
    };
  }

  // 4. Bucle por categorías tocadas con ramas FAIL-WINS / PROMOTION.
  for (const catId of practicedCategoryIds) {
    // Inicialización lazy (D-47).
    const prev = next.categoryProgress[catId] ?? blankCategoryProgress();
    const cat = { ...prev, clearedExerciseIds: [...prev.clearedExerciseIds] };
    next.categoryProgress[catId] = cat;

    if (failedCategoryIds.has(catId)) {
      // ─── FAIL-WINS: cascada de fallo (D-39 paso 2).
      cat.status = 'no-hecha';
      cat.clearedExerciseIds = [];        // descarta aciertos previos (sesión y acumulados)
      cat.streakDays = 0;
      cat.becameHechaAt = undefined;
      cat.becameDominadaAt = undefined;
      // `lastSuccessDate` se preserva (huella histórica; la sesión actual no
      // fue exitosa para esta categoría, así que no se actualiza).
    } else {
      // ─── Sin fallo en esta categoría (D-39 paso 3).

      // 4a. Añadir aciertos al clearedExerciseIds (idempotente con uniqueStrings).
      const correctIdsForCat = correctExerciseIds.filter(eid =>
        (content.exerciseById[eid]?.categoryIds ?? []).includes(catId)
      );
      cat.clearedExerciseIds = uniqueStrings([...cat.clearedExerciseIds, ...correctIdsForCat]);

      // 4b. Cobertura: ¿están todos los ejercicios de la categoría en cleared?
      const allInCat = exercisesByCategory[catId] ?? [];
      const isCovered = allInCat.length > 0 && allInCat.every(id => cat.clearedExerciseIds.includes(id));

      // 4c. Promoción + streak según D-38.
      if (cat.status === 'no-hecha' && isCovered) {
        // Case A: `no-hecha` que cubre todo en esta sesión → promociona a `hecha`.
        // El día de promoción cuenta como día 1 de racha.
        cat.status = 'hecha';
        cat.becameHechaAt = today;
        cat.streakDays = 1;
        cat.lastSuccessDate = today;
      } else if (cat.status === 'hecha' || cat.status === 'dominada') {
        // Case B: categoría ya en `hecha` o `dominada`, posible incremento de
        // racha con guard de día (D-38, D-53.3).
        if (cat.lastSuccessDate !== today) {
          cat.streakDays = (cat.streakDays ?? 0) + 1;
          cat.lastSuccessDate = today;
        }
        // Case C: promoción a `dominada` al cruzar 21 días.
        if (cat.streakDays >= 21 && cat.status !== 'dominada') {
          cat.status = 'dominada';
          cat.becameDominadaAt = today;
        }
      }
      // Edge case: `no-hecha` sin fallo pero sin cubrir todo → solo se han
      // acumulado aciertos en clearedExerciseIds (paso 4a). NO se promociona,
      // NO se incrementa racha (D-38 línea 1).
    }

    // 4d. lastPracticedDate SIEMPRE para todas las tocadas (fail o no).
    cat.lastPracticedDate = today;
  }

  // 5. dailyLog[today] — merge con la entrada previa del mismo día si existe.
  //    Acumular categoriesPracticed y categoriesWithFailure con uniqueStrings
  //    para garantizar idempotencia ante llamadas múltiples el mismo día.
  const prevEntry = next.dailyLog[today] ?? {
    date: today,
    categoriesPracticed: [],
    categoriesWithFailure: []
  };
  next.dailyLog[today] = {
    date: today,
    categoriesPracticed: uniqueStrings([...prevEntry.categoriesPracticed, ...practicedCategoryIds]),
    categoriesWithFailure: uniqueStrings([...prevEntry.categoriesWithFailure, ...failedCategoryIds])
  };

  // 6. Limpiar inFlightTest (Pitfall #9). El caller asume idempotencia.
  if (next.inFlightTest !== undefined) {
    delete next.inFlightTest;
  }

  return next;
}

// ─── Helpers privados ───────────────────────────────────────────────────────

/** Estructura inicial de un ejercicio recién visto. */
function blankStat() {
  return { timesShown: 0, timesCorrect: 0, timesFailed: 0 };
}

/** Estructura inicial de una categoría recién tocada (D-47). */
function blankCategoryProgress() {
  return {
    status: 'no-hecha',
    clearedExerciseIds: [],
    streakDays: 0,
    lastPracticedDate: undefined,
    lastSuccessDate: undefined,
    becameHechaAt: undefined,
    becameDominadaAt: undefined
  };
}

/**
 * Deriva del content un índice `Record<categoryId, exerciseId[]>` para
 * comprobar cobertura en O(1) por categoría dentro del bucle de
 * `applySessionResult`.
 */
function buildExercisesByCategory(content) {
  const out = {};
  for (const ex of Object.values(content.exerciseById ?? {})) {
    for (const cid of ex.categoryIds ?? []) {
      (out[cid] ??= []).push(ex.id);
    }
  }
  return out;
}

/** Devuelve un array nuevo con los strings únicos preservando orden de primera aparición. */
function uniqueStrings(arr) {
  return [...new Set(arr)];
}
