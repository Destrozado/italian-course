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
//   - D-40 (Phase 2): DOMAIN-06 boot regression. Cuando el autor añade un
//     ejercicio nuevo al content, las categorías `hecha`/`dominada` cuyo
//     `clearedExerciseIds` no cubre algún ejercicio actual del content regresan
//     a `no-hecha`. CRÍTICO: `clearedExerciseIds` se PRESERVA — los aciertos
//     previos siguen contando para futuras sesiones. Implementado como export
//     SEPARADA `applyNewExerciseRegression(state, content)` invocada UNA VEZ
//     al boot por `main.js` (Pitfall #10): NO va dentro de `applySessionResult`.
//   - D-47: `categoryProgress[id]` se inicializa lazy con
//     `blankCategoryProgress()` la primera vez que la categoría es tocada.
//   - D-48: `dailyLog[isoDate] = {date, categoriesPracticed[], categoriesWithFailure[]}`.
//   - D-52: `today` se inyecta como string ISO 'YYYY-MM-DD'. El caller
//     (`src/screens/app.js`, Plan 02-03) suministra `todayLocal()`; los tests
//     inyectan strings deterministas. La firma rompe Phase 1
//     intencionalmente: `applySessionResult(state, sessionResult, content, today)`
//     ahora exige 4 argumentos (Pitfall #2 de RESEARCH).
//   - D-54 (Plan 02-03 UAT round 2): fail-cascade INMEDIATA. Refinement de
//     D-39: la combinación "cascada al final de sesión" + SESSION-08
//     ("abandono descarta") creaba un exploit (fallas → cierras pestaña →
//     fallo no se registra) que violaba el core value "te obliga a no
//     olvidar". Solución: el helper `applyImmediateFailure(state, exercise,
//     content, today)` aplica la cascada de UN solo ejercicio fallado en el
//     instante del click. `applySessionResult` SIGUE corriendo al final de
//     sesión SIN CAMBIOS — la cascada es idempotente respecto al state ya
//     reseteado, y los `exerciseStats` se bumpean UNA SOLA VEZ ahí
//     (preservando D-09 monotonicidad sin doble conteo).

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

/**
 * DOMAIN-06 (D-40) — Regresión por ejercicio nuevo añadido al content.
 *
 * Para cada categoría con `status ∈ {'hecha', 'dominada'}`, si existe algún
 * ejercicio en el content cuyo `id` NO está en `clearedExerciseIds`: la
 * categoría regresa a `no-hecha` con `streakDays=0`, `becameHechaAt=undefined`,
 * `becameDominadaAt=undefined`. **`clearedExerciseIds` se PRESERVA (D-40
 * explícito y crítico)** — los aciertos previos siguen contando para futuras
 * sesiones que cubran el ejercicio nuevo. Sin este invariante el autor
 * perdería todo su trabajo al añadir un solo ejercicio al JSON.
 *
 * Las categorías `no-hecha` no se tocan; las categorías cuyo content no
 * cambió tampoco (idempotente). `dailyLog` y `exerciseStats` no se tocan.
 *
 * **IMPORTANTE — esta función NO va dentro de `applySessionResult` (Pitfall
 * #10).** Se invoca UNA VEZ al boot de la app (`src/main.js`, Plan 02-03), tras
 * `loadState + loadContent` y antes de resolver `appDataReady`. Si se llamase
 * en cada sesión generaría falsos positivos de regresión.
 *
 * Pure: no muta `state` ni `content`.
 *
 * @param {{schemaVersion:2, categoryProgress: Record<string, object>}} state
 * @param {{exerciseById: Record<string, {id:string, categoryIds:string[]}>}} content
 * @returns {object} Nuevo estado con las regresiones aplicadas (mismo shape v2).
 */
export function applyNewExerciseRegression(state, content) {
  // 1. Índice ejercicios por categoría (reusa el helper privado del módulo).
  const exercisesByCategory = buildExercisesByCategory(content);

  // 2. Spread-clone defensivo (state + categoryProgress).
  const next = {
    ...state,
    categoryProgress: { ...(state.categoryProgress ?? {}) }
  };

  // 3. Bucle por categorías existentes en categoryProgress.
  for (const [catId, cat] of Object.entries(next.categoryProgress)) {
    // Solo regresan estados promocionados; las `no-hecha` se dejan tal cual.
    if (cat.status !== 'hecha' && cat.status !== 'dominada') continue;

    const allInCat = exercisesByCategory[catId] ?? [];
    const cleared = cat.clearedExerciseIds ?? [];
    const hasNewExercise = allInCat.some(eid => !cleared.includes(eid));

    if (hasNewExercise) {
      next.categoryProgress[catId] = {
        ...cat,
        status: 'no-hecha',
        streakDays: 0,
        becameHechaAt: undefined,
        becameDominadaAt: undefined
        // D-40 explícito: clearedExerciseIds NO se vacía — preservado del input.
        // lastPracticedDate y lastSuccessDate preservados (huella histórica).
      };
    }
    // else: categoría intacta (idempotente cuando no hay regresión).
  }

  return next;
}

/**
 * D-54 (Plan 02-03 UAT round 2) — Aplica la cascada INMEDIATA de un solo
 * ejercicio fallado, sin esperar al final de sesión.
 *
 * Motivación (cita del autor): "Si a mitad de sesión de ejercicios, fallas,
 * y te sales del ejercicio y vuelves a la home, no te cambia el estado ni la
 * racha, como si no hubieras fallado, eso debería ser inmediato, en cuanto
 * fallas, lección no hecha y racha perdida."
 *
 * Combinada con SESSION-08 (Repaso abandonado se descarta), la cascada-al-
 * final-de-sesión de D-39 creaba un exploit que violaba el core value "te
 * obliga a no olvidar". Este helper se invoca desde `app.js > selectOption`
 * en el instante en que `feedback === 'incorrect'`, ANTES de cualquier
 * posibilidad de abandono de sesión.
 *
 * Qué hace:
 *   - Para cada categoría en `exercise.categoryIds`: reset cascade idéntico a
 *     la rama FAIL-WINS de `applySessionResult` (status='no-hecha',
 *     clearedExerciseIds=[], streakDays=0, becameHechaAt/becameDominadaAt
 *     undefined). `lastSuccessDate` se preserva (huella histórica).
 *   - `lastPracticedDate = today` para las categorías tocadas (alinea con el
 *     paso 4d de D-39).
 *   - Añade las categorías a `dailyLog[today].categoriesPracticed` Y
 *     `.categoriesWithFailure` (idempotente con uniqueStrings).
 *   - **NO toca `exerciseStats`**: el bump monotónico (DOMAIN-09) ocurre
 *     EXCLUSIVAMENTE en `applySessionResult` al final de sesión. Sin esta
 *     separación habría doble conteo: el ejercicio se contaría 2 veces
 *     (1 vez aquí + 1 vez en applySessionResult). Una sesión abandonada tras
 *     un fallo NO bumpea exerciseStats — pero SÍ persiste la regresión de
 *     categoría, que es lo crítico para el core value.
 *
 * Idempotencia:
 *   - Re-invocar `applyImmediateFailure` con el MISMO ejercicio devuelve un
 *     state funcionalmente idéntico (las categorías ya están a 'no-hecha',
 *     re-resetar es no-op; uniqueStrings dedupea el dailyLog).
 *   - `applyImmediateFailure(state, ex, ...)` seguido de `applySessionResult`
 *     con el mismo fail incluido en `answers` produce el MISMO state final que
 *     llamar solo a `applySessionResult` (la rama FAIL-WINS reaplica el
 *     reset sobre state ya reseteado = no-op).
 *
 * Pure: no muta `state` ni `exercise` ni `content`.
 *
 * @param {{schemaVersion:2, exerciseStats:object, categoryProgress:object, dailyLog:object}} state
 * @param {{id:string, categoryIds:string[]}} exercise - El ejercicio que se acaba de fallar.
 * @param {{exerciseById: Record<string, object>}} content - Necesario para la firma simétrica con applySessionResult (aunque este helper no lo lee directamente, lo recibimos para coherencia y para futuros usos).
 * @param {string} today - Fecha local en formato `YYYY-MM-DD`.
 * @returns {object} Nuevo estado (shape v2) con la cascada inmediata aplicada.
 */
export function applyImmediateFailure(state, exercise, content, today) {
  // 1. Spread-clone defensivo (state + categoryProgress + dailyLog).
  const next = {
    ...state,
    categoryProgress: { ...(state.categoryProgress ?? {}) },
    dailyLog: { ...(state.dailyLog ?? {}) }
  };

  const catIds = exercise?.categoryIds ?? [];

  // 2. Reset cascada por categoría (rama FAIL-WINS de D-39, paso 2).
  for (const catId of catIds) {
    const prev = next.categoryProgress[catId] ?? blankCategoryProgress();
    next.categoryProgress[catId] = {
      ...prev,
      status: 'no-hecha',
      clearedExerciseIds: [],
      streakDays: 0,
      becameHechaAt: undefined,
      becameDominadaAt: undefined,
      lastPracticedDate: today
      // lastSuccessDate se preserva (huella histórica; esta sesión no fue éxito).
    };
  }

  // 3. dailyLog[today] — categoría fallada se añade a AMBOS arrays (idempotente).
  const prevEntry = next.dailyLog[today] ?? {
    date: today,
    categoriesPracticed: [],
    categoriesWithFailure: []
  };
  next.dailyLog[today] = {
    date: today,
    categoriesPracticed: uniqueStrings([...prevEntry.categoriesPracticed, ...catIds]),
    categoriesWithFailure: uniqueStrings([...prevEntry.categoriesWithFailure, ...catIds])
  };

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
