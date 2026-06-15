// tests/domain-progress.test.js
//
// Suite del motor de re-verificación (Phase 2). Cubre la firma extendida
// `applySessionResult(state, sessionResult, content, today)` por D-52 y los
// 3 grupos de D-53:
//
//   D-53.1 — Cascada multi-categoría (fail-wins absoluto)
//   D-53.2 — Promoción no-hecha→hecha→dominada y regresión total
//   D-53.3 — Racha guard por `lastSuccessDate` + dailyLog + edge cases
//
// Ejecutar:
//
//     node --test tests/domain-progress.test.js
//
// Patrón canónico de tests del dominio puro (RESEARCH §"Testing strategy"):
// `today` se inyecta como string ISO 'YYYY-MM-DD' (no mock global de Date).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { applySessionResult, applyNewExerciseRegression, applyImmediateFailure } from '../src/domain/progress.js';
import {
  blankStateV2,
  makeContent,
  setupHechaState,
  setupDominadaState
} from './util/test-helpers.js';

// ────────────────────────────────────────────────────────────────────────────
// Tests heredados de Phase 1 (movidos desde tests/domain.test.js), actualizados
// a la nueva firma de 4 argumentos (D-52).
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress — contadores monotónicos (heredado de Phase 1)', () => {
  test('applySessionResult incrementa contadores y no muta el input (firma v2)', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const before = blankStateV2();
    const beforeSnapshot = JSON.parse(JSON.stringify(before));
    const after = applySessionResult(before, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'a2', correct: true }
      ]
    }, content, '2026-05-23');
    assert.deepEqual(after.exerciseStats['a1'], { timesShown: 2, timesCorrect: 1, timesFailed: 1 });
    assert.deepEqual(after.exerciseStats['a2'], { timesShown: 1, timesCorrect: 1, timesFailed: 0 });
    // Input no se muta (pureza).
    assert.deepEqual(before, beforeSnapshot);
    assert.notEqual(after.exerciseStats, before.exerciseStats);
  });

  test('applySessionResult acumula sobre estado preexistente', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    const before = {
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 3, timesFailed: 2 } },
      categoryProgress: {},
      dailyLog: {}
    };
    const after = applySessionResult(before, {
      answers: [{ exerciseId: 'a1', correct: true }]
    }, content, '2026-05-23');
    assert.deepEqual(after.exerciseStats['a1'], { timesShown: 6, timesCorrect: 4, timesFailed: 2 });
    // Sin mutar.
    assert.deepEqual(before.exerciseStats['a1'], { timesShown: 5, timesCorrect: 3, timesFailed: 2 });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-53.1 — Cascada multi-categoría (fail-wins absoluto)
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress — D-53.1 cascada multi-categoría', () => {
  test('ejercicio multi-cat [avere, genero] fallado tras acierto previo de [avere] resetea AMBAS', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'mix', categoryIds: ['avere', 'genero'] }
    ]);
    const state = blankStateV2();
    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: true },           // acierta en avere primero
        { exerciseId: 'mix', correct: false }          // falla en multi-cat
      ]
    }, content, '2026-05-23');

    // Ambas categorías deben quedar reseteadas a no-hecha + cleared=[] + streak=0.
    assert.equal(after.categoryProgress['avere'].status, 'no-hecha');
    assert.deepEqual(after.categoryProgress['avere'].clearedExerciseIds, []);
    assert.equal(after.categoryProgress['avere'].streakDays, 0);
    assert.equal(after.categoryProgress['avere'].becameHechaAt, undefined);
    assert.equal(after.categoryProgress['avere'].becameDominadaAt, undefined);

    assert.equal(after.categoryProgress['genero'].status, 'no-hecha');
    assert.deepEqual(after.categoryProgress['genero'].clearedExerciseIds, []);
    assert.equal(after.categoryProgress['genero'].streakDays, 0);
  });

  test('sesión con 1 fallo + 5 aciertos en avere resetea avere (fail-wins absoluto)', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] },
      { id: 'a4', categoryIds: ['avere'] },
      { id: 'a5', categoryIds: ['avere'] },
      { id: 'a6', categoryIds: ['avere'] }
    ]);
    const state = blankStateV2();
    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a2', correct: true },
        { exerciseId: 'a3', correct: true },
        { exerciseId: 'a4', correct: false },     // 1 solo fallo basta
        { exerciseId: 'a5', correct: true },
        { exerciseId: 'a6', correct: true }
      ]
    }, content, '2026-05-23');

    assert.equal(after.categoryProgress['avere'].status, 'no-hecha');
    assert.deepEqual(after.categoryProgress['avere'].clearedExerciseIds, []);
    assert.equal(after.categoryProgress['avere'].streakDays, 0);
  });

  test('ejercicio fallado en [avere] NO afecta a [genero] ajena que se acertó', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'g1', categoryIds: ['genero'] }
    ]);
    const state = blankStateV2();
    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'g1', correct: true }
      ]
    }, content, '2026-05-23');

    // avere → reset
    assert.equal(after.categoryProgress['avere'].status, 'no-hecha');
    assert.deepEqual(after.categoryProgress['avere'].clearedExerciseIds, []);

    // genero → preserva el acierto; con 1 ejercicio total y 1 cleared, isCovered=true → promociona a hecha.
    assert.equal(after.categoryProgress['genero'].status, 'hecha');
    assert.deepEqual(after.categoryProgress['genero'].clearedExerciseIds, ['g1']);
    assert.equal(after.categoryProgress['genero'].streakDays, 1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-53.2 — Promoción y regresión completas
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress — D-53.2 promoción y regresión', () => {
  test('categoría no-hecha que cubre los 3 ejercicios en una sesión promociona a hecha con streak=1', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }
    ]);
    const state = blankStateV2();
    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a2', correct: true },
        { exerciseId: 'a3', correct: true }
      ]
    }, content, '2026-05-23');

    const cat = after.categoryProgress['avere'];
    assert.equal(cat.status, 'hecha');
    assert.equal(cat.becameHechaAt, '2026-05-23');
    assert.equal(cat.streakDays, 1);
    assert.equal(cat.lastSuccessDate, '2026-05-23');
    assert.equal(cat.lastPracticedDate, '2026-05-23');
    // clearedExerciseIds NO se vacía tras promocionar (D-39 paso 4c, comentario).
    assert.equal(cat.clearedExerciseIds.length, 3);
    assert.deepEqual([...cat.clearedExerciseIds].sort(), ['a1', 'a2', 'a3']);
  });

  test('3 sesiones acumulando aciertos progresivamente promocionan a hecha SOLO al cubrir el último', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }
    ]);
    let state = blankStateV2();

    // Sesión 1: acertar a1
    state = applySessionResult(state, { answers: [{ exerciseId: 'a1', correct: true }] }, content, '2026-05-21');
    assert.equal(state.categoryProgress['avere'].status, 'no-hecha');
    assert.deepEqual(state.categoryProgress['avere'].clearedExerciseIds, ['a1']);
    assert.equal(state.categoryProgress['avere'].streakDays, 0);

    // Sesión 2: acertar a2
    state = applySessionResult(state, { answers: [{ exerciseId: 'a2', correct: true }] }, content, '2026-05-22');
    assert.equal(state.categoryProgress['avere'].status, 'no-hecha');
    assert.deepEqual([...state.categoryProgress['avere'].clearedExerciseIds].sort(), ['a1', 'a2']);
    assert.equal(state.categoryProgress['avere'].streakDays, 0);

    // Sesión 3: acertar a3 (último que faltaba) → promoción
    state = applySessionResult(state, { answers: [{ exerciseId: 'a3', correct: true }] }, content, '2026-05-23');
    const cat = state.categoryProgress['avere'];
    assert.equal(cat.status, 'hecha');
    assert.equal(cat.becameHechaAt, '2026-05-23');
    assert.equal(cat.streakDays, 1);
    assert.equal(cat.clearedExerciseIds.length, 3);
  });

  test('simulación 21 días consecutivos promociona a dominada el día 21', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    let state = blankStateV2();

    for (let day = 0; day < 21; day++) {
      const isoDate = `2026-06-${String(day + 1).padStart(2, '0')}`; // 2026-06-01..2026-06-21
      state = applySessionResult(state, {
        answers: [
          { exerciseId: 'a1', correct: true },
          { exerciseId: 'a2', correct: true }
        ]
      }, content, isoDate);
    }

    const cat = state.categoryProgress['avere'];
    assert.equal(cat.status, 'dominada', `expected dominada, got ${cat.status}`);
    assert.equal(cat.streakDays, 21);
    assert.equal(cat.becameHechaAt, '2026-06-01', 'promoción a hecha en día 1');
    assert.equal(cat.becameDominadaAt, '2026-06-21', 'promoción a dominada en día 21');
    assert.equal(cat.lastSuccessDate, '2026-06-21');
    // Cobertura preservada: ambos ejercicios cleared.
    assert.equal(cat.clearedExerciseIds.length, 2);
  });

  test('fallo desde dominada regresa total a no-hecha (streak=0, becameDominadaAt=undefined)', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const state = setupDominadaState('avere', ['a1', 'a2'], {
      streakDays: 25,
      lastSuccessDate: '2026-05-22',
      becameDominadaAt: '2026-05-01'
    });

    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'a2', correct: true }
      ]
    }, content, '2026-05-23');

    const cat = after.categoryProgress['avere'];
    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.equal(cat.becameDominadaAt, undefined);
    assert.equal(cat.becameHechaAt, undefined);
    assert.deepEqual(cat.clearedExerciseIds, []);
    assert.equal(cat.lastPracticedDate, '2026-05-23');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-53.3 — Racha guard + dailyLog + edge cases
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress — D-53.3 racha guard + edge cases', () => {
  test('5 sesiones el MISMO día tocando categoría hecha solo incrementan streak UNA vez', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    let state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22'   // ayer
    });
    const prevStreak = state.categoryProgress['avere'].streakDays;
    const today = '2026-05-23';

    for (let i = 0; i < 5; i++) {
      state = applySessionResult(state, {
        answers: [{ exerciseId: 'a1', correct: true }]
      }, content, today);
    }

    // 5 sesiones el mismo día → racha debe haber crecido SOLO una vez.
    assert.equal(state.categoryProgress['avere'].streakDays, prevStreak + 1);
    assert.equal(state.categoryProgress['avere'].lastSuccessDate, today);
  });

  test('sesión vacía (answers=[]) no muta funcionalmente el estado', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    const before = blankStateV2();
    const beforeSnapshot = JSON.parse(JSON.stringify(before));
    const after = applySessionResult(before, { answers: [] }, content, '2026-05-23');

    // Input no se muta (pureza).
    assert.deepEqual(before, beforeSnapshot);
    // Output preserva counters/progress vacíos.
    assert.deepEqual(after.exerciseStats, {});
    assert.deepEqual(after.categoryProgress, {});
    // dailyLog[today] se popula con arrays vacíos (no era una sesión vacía categórica — entró al paso 5).
    assert.deepEqual(after.dailyLog['2026-05-23'], {
      date: '2026-05-23',
      categoriesPracticed: [],
      categoriesWithFailure: []
    });
  });

  test('ejercicio con categoryIds=[] vacío: exerciseStats se actualiza pero no toca categoryProgress', () => {
    const content = makeContent([{ id: 'orphan', categoryIds: [] }]);
    const before = blankStateV2();
    const after = applySessionResult(before, {
      answers: [{ exerciseId: 'orphan', correct: true }]
    }, content, '2026-05-23');

    // exerciseStats sí se actualiza.
    assert.deepEqual(after.exerciseStats['orphan'], { timesShown: 1, timesCorrect: 1, timesFailed: 0 });
    // categoryProgress vacío — ninguna categoría tocada.
    assert.deepEqual(after.categoryProgress, {});
  });

  test('dailyLog[today] se popula con shape D-48 ({date, categoriesPracticed, categoriesWithFailure})', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'g1', categoryIds: ['genero'] }
    ]);
    const after = applySessionResult(blankStateV2(), {
      answers: [
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'g1', correct: true }
      ]
    }, content, '2026-05-23');

    assert.deepEqual(after.dailyLog['2026-05-23'], {
      date: '2026-05-23',
      categoriesPracticed: ['avere', 'genero'],
      categoriesWithFailure: ['avere']
    });
  });

  test('invocaciones múltiples el mismo día acumulan dailyLog idempotente (sin duplicados)', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'g1', categoryIds: ['genero'] }
    ]);
    let state = blankStateV2();
    const today = '2026-05-23';

    // 1ª invocación: tocar avere acertando.
    state = applySessionResult(state, {
      answers: [{ exerciseId: 'a1', correct: true }]
    }, content, today);
    // 2ª invocación mismo día: tocar avere otra vez (mismo cat) + genero.
    state = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'g1', correct: false }
      ]
    }, content, today);

    const log = state.dailyLog[today];
    // categoriesPracticed contiene avere y genero, sin duplicar avere.
    assert.deepEqual([...log.categoriesPracticed].sort(), ['avere', 'genero']);
    // categoriesWithFailure solo tiene genero (la 2ª invocación añadió el fallo).
    assert.deepEqual(log.categoriesWithFailure, ['genero']);
    assert.equal(log.date, today);
  });

  test('pureza: input state no se muta después de applySessionResult', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    // Construcción doble: `before` se pasa a la función; `snapshot` es una
    // copia estructural separada. Si `applySessionResult` mutara `before`,
    // la comparación final fallaría. Evitamos JSON.parse(JSON.stringify(...))
    // porque ese round-trip pierde claves con valor `undefined` y dispara
    // falsos positivos en strict deep-equal.
    const makeFixture = () => ({
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {
        avere: {
          status: 'hecha',
          clearedExerciseIds: ['a1'],
          streakDays: 3,
          lastPracticedDate: '2026-05-22',
          lastSuccessDate: '2026-05-22',
          becameHechaAt: '2026-05-20',
          becameDominadaAt: undefined
        }
      },
      dailyLog: {}
    });
    const before = makeFixture();
    const snapshot = makeFixture();

    applySessionResult(before, {
      answers: [{ exerciseId: 'a1', correct: true }]
    }, content, '2026-05-23');

    // Después de la llamada el input sigue idéntico (deep equal estricto).
    assert.deepEqual(before, snapshot);
  });

  test('exerciseStats monotónico: un fallo NO decrementa timesCorrect (DOMAIN-09)', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    const before = {
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 10, timesCorrect: 7, timesFailed: 3 } },
      categoryProgress: {},
      dailyLog: {}
    };
    const after = applySessionResult(before, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-23');

    assert.equal(after.exerciseStats['a1'].timesShown, 11);
    assert.equal(after.exerciseStats['a1'].timesCorrect, 7, 'timesCorrect NO debe decrementar al fallar');
    assert.equal(after.exerciseStats['a1'].timesFailed, 4);
  });

  test('inFlightTest se limpia tras applySessionResult (Pitfall #9)', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    const before = {
      schemaVersion: 2,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1'],
        cursor: 1,
        answers: [{ exerciseId: 'a1', correct: true }],
        startedAt: 1716480000000
      }
    };
    const after = applySessionResult(before, {
      answers: [{ exerciseId: 'a1', correct: true }]
    }, content, '2026-05-23');

    assert.equal(after.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(after, 'inFlightTest'), false,
      'la clave inFlightTest debe haber sido borrada del objeto, no solo seteada a undefined');
    // Input no se muta — inFlightTest sigue ahí en el input.
    assert.ok(before.inFlightTest, 'input inFlightTest se preserva (pureza)');
  });

  test('categoría hecha tocada sin fallo en una sesión: incrementa racha aunque no cubra todo', () => {
    // Caso límite #1 de RESEARCH.md: categoría hecha que toca 1/2 ejercicios sin fallar
    // y lastSuccessDate !== today → streak++.
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 4,
      lastSuccessDate: '2026-05-22'  // ayer
    });
    const after = applySessionResult(state, {
      answers: [{ exerciseId: 'a1', correct: true }]   // solo 1, no cubre los 2
    }, content, '2026-05-23');

    const cat = after.categoryProgress['avere'];
    assert.equal(cat.status, 'hecha');
    assert.equal(cat.streakDays, 5);                    // 4 + 1
    assert.equal(cat.lastSuccessDate, '2026-05-23');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-53.3b — DOMAIN-06 applyNewExerciseRegression (boot regression)
// ────────────────────────────────────────────────────────────────────────────
//
// Invariante crítico (D-40): al añadir un ejercicio nuevo al content, las
// categorías 'hecha' o 'dominada' cuyo `clearedExerciseIds` no cubre el nuevo
// ejercicio regresan a 'no-hecha' con `streakDays=0` y
// `becameHechaAt`/`becameDominadaAt=undefined`. PERO `clearedExerciseIds` se
// PRESERVA — los aciertos previos siguen contando para futuras sesiones que
// cubran el ejercicio nuevo. Sin este invariante el autor perdería todo su
// trabajo al añadir un solo ejercicio.
//
// Esta función NO va dentro de `applySessionResult` (Pitfall #10): se invoca
// UNA vez al boot de `main.js` tras `loadState + loadContent`.

describe('domain/progress — D-53.3b applyNewExerciseRegression (DOMAIN-06)', () => {
  test('hecha → no-hecha cuando content añade ejercicio nuevo; clearedExerciseIds PRESERVADO (D-40)', () => {
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      lastPracticedDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }  // ← ejercicio nuevo añadido por el autor
    ]);

    const result = applyNewExerciseRegression(state, content);
    const cat = result.categoryProgress['avere'];

    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.equal(cat.becameHechaAt, undefined);
    assert.equal(cat.becameDominadaAt, undefined);
    // D-40 explícito: cleared se PRESERVA, no se vacía.
    assert.deepEqual(cat.clearedExerciseIds, ['a1', 'a2']);
    // lastPracticedDate / lastSuccessDate preservados (huella histórica).
    assert.equal(cat.lastPracticedDate, '2026-05-22');
    assert.equal(cat.lastSuccessDate, '2026-05-22');
  });

  test('dominada → no-hecha cuando content añade ejercicio nuevo; becameDominadaAt borrado, cleared PRESERVADO', () => {
    const state = setupDominadaState('avere', ['a1', 'a2'], {
      streakDays: 25,
      lastSuccessDate: '2026-05-22',
      lastPracticedDate: '2026-05-22',
      becameHechaAt: '2026-04-10',
      becameDominadaAt: '2026-05-01'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }  // ← ejercicio nuevo
    ]);

    const result = applyNewExerciseRegression(state, content);
    const cat = result.categoryProgress['avere'];

    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.equal(cat.becameDominadaAt, undefined);
    assert.equal(cat.becameHechaAt, undefined);
    // D-40: cleared preservado.
    assert.deepEqual(cat.clearedExerciseIds, ['a1', 'a2']);
  });

  test('categoría no-hecha con cleared parcial NO se toca (la regresión solo aplica a hecha/dominada)', () => {
    const state = blankStateV2();
    state.categoryProgress['avere'] = {
      status: 'no-hecha',
      clearedExerciseIds: ['a1'],
      streakDays: 0,
      lastPracticedDate: '2026-05-22',
      lastSuccessDate: '2026-05-22',
      becameHechaAt: undefined,
      becameDominadaAt: undefined
    };
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }  // ejercicio "nuevo" presente
    ]);

    const result = applyNewExerciseRegression(state, content);
    const catAfter = result.categoryProgress['avere'];

    // Sin cambios funcionales: la categoría sigue no-hecha con los mismos campos.
    assert.equal(catAfter.status, 'no-hecha');
    assert.deepEqual(catAfter.clearedExerciseIds, ['a1']);
    assert.equal(catAfter.streakDays, 0);
    assert.equal(catAfter.lastPracticedDate, '2026-05-22');
  });

  test('idempotencia: categoría hecha cuyo cleared cubre TODOS los ejercicios → no se regresa', () => {
    const state = setupHechaState('avere', ['a1', 'a2', 'a3'], {
      streakDays: 7,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-15'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }
    ]);

    const result = applyNewExerciseRegression(state, content);
    const cat = result.categoryProgress['avere'];

    // Sin ejercicios nuevos → la categoría queda igual.
    assert.equal(cat.status, 'hecha');
    assert.equal(cat.streakDays, 7);
    assert.equal(cat.becameHechaAt, '2026-05-15');
    assert.deepEqual([...cat.clearedExerciseIds].sort(), ['a1', 'a2', 'a3']);
  });

  test('pureza: input state NO se muta tras applyNewExerciseRegression', () => {
    // Doble fixture builder — evitamos JSON.parse(JSON.stringify) porque ese
    // round-trip pierde claves con valor `undefined` y dispara falsos positivos
    // en strict deep-equal (lección aprendida en Plan 02-01).
    const makeFixture = () => {
      const s = blankStateV2();
      s.categoryProgress['avere'] = {
        status: 'hecha',
        clearedExerciseIds: ['a1', 'a2'],
        streakDays: 5,
        lastPracticedDate: '2026-05-22',
        lastSuccessDate: '2026-05-22',
        becameHechaAt: '2026-05-18',
        becameDominadaAt: undefined
      };
      return s;
    };
    const before = makeFixture();
    const snapshot = makeFixture();
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] }  // ← provocará regresión en el output
    ]);

    applyNewExerciseRegression(before, content);

    // Tras la llamada el input sigue idéntico (no fue mutado).
    assert.deepEqual(before, snapshot);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-54 — applyImmediateFailure (fail-cascade INMEDIATA, UAT round 2)
// ────────────────────────────────────────────────────────────────────────────
//
// Refinement de D-39 tras UAT round 2 del Plan 02-03. Combinación
// "cascada-al-final" + SESSION-08 ("abandono descarta") creaba un exploit:
// fallas → cierras pestaña → fallo no se registra → core value violado.
//
// applyImmediateFailure se invoca desde `app.js > sessionSelectOption` cuando
// `feedback === 'incorrect'`, ANTES de cualquier posibilidad de abandono.
//
// Invariantes:
//   - Cascada por categoría idéntica a la rama FAIL-WINS de applySessionResult.
//   - NO toca exerciseStats (eso se hace UNA SOLA VEZ en applySessionResult al
//     final, para preservar DOMAIN-09 monotonicidad sin doble conteo).
//   - Idempotente respecto a applySessionResult: la combinación
//     `applyImmediateFailure + applySessionResult con mismo fail` produce el
//     MISMO state final que solo `applySessionResult` (re-aplicar la cascada
//     sobre state ya reseteado es no-op).

describe('domain/progress — D-54 applyImmediateFailure (cascada inmediata)', () => {
  test('resetea cascada de una categoría sin tocar exerciseStats (idempotencia + monotonicidad)', () => {
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    // Sembrar exerciseStats previos para verificar que NO se tocan.
    state.exerciseStats = {
      a1: { timesShown: 10, timesCorrect: 7, timesFailed: 3 },
      a2: { timesShown: 8, timesCorrect: 6, timesFailed: 2 }
    };

    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const exercise = content.exerciseById['a1'];

    const after = applyImmediateFailure(state, exercise, content, '2026-05-23');

    // Cascada aplicada.
    const cat = after.categoryProgress['avere'];
    assert.equal(cat.status, 'no-hecha');
    assert.deepEqual(cat.clearedExerciseIds, []);
    assert.equal(cat.streakDays, 0);
    assert.equal(cat.becameHechaAt, undefined);
    assert.equal(cat.becameDominadaAt, undefined);
    assert.equal(cat.lastPracticedDate, '2026-05-23');
    // lastSuccessDate preservado (huella histórica).
    assert.equal(cat.lastSuccessDate, '2026-05-22');

    // CRÍTICO: exerciseStats NO se han tocado (eso es responsabilidad de
    // applySessionResult al final de sesión). DOMAIN-09 monotonicidad
    // preservada sin doble conteo.
    assert.deepEqual(after.exerciseStats.a1, { timesShown: 10, timesCorrect: 7, timesFailed: 3 });
    assert.deepEqual(after.exerciseStats.a2, { timesShown: 8, timesCorrect: 6, timesFailed: 2 });
  });

  test('añade categoría a dailyLog.categoriesPracticed y dailyLog.categoriesWithFailure', () => {
    const state = blankStateV2();
    const content = makeContent([
      { id: 'mix', categoryIds: ['avere', 'genero'] }
    ]);
    const exercise = content.exerciseById['mix'];

    const after = applyImmediateFailure(state, exercise, content, '2026-05-23');

    assert.deepEqual(after.dailyLog['2026-05-23'], {
      date: '2026-05-23',
      categoriesPracticed: ['avere', 'genero'],
      categoriesWithFailure: ['avere', 'genero']
    });
  });

  test('idempotencia integral: applyImmediateFailure + applySessionResult con mismo fail = solo applySessionResult', () => {
    // E2E: el state final tras ejecutar "fallo inmediato + cierre normal de
    // sesión con ese mismo fail" debe ser IDÉNTICO al state final tras
    // ejecutar solo "applySessionResult con ese fail" (sin paso intermedio).
    // Esto garantiza que el nuevo helper no introduce desviaciones del modelo
    // canónico — solo acelera el momento en que el efecto es observable.
    //
    // quick-260615-r3b (CAMBIO 3): el contador `vecesFallada` ahora vive en
    // applySessionResult (rama FAIL-WINS, por-sesión). applyImmediateFailure ya
    // NO lo toca. Por tanto Path A (immediate + session) y Path B (solo session)
    // CONVERGEN íntegros, incluido vecesFallada=1 — ya no es una "EXCEPCIÓN".
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const initialState = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });

    // Path A: el flujo nuevo — fail inmediato + cierre de sesión completo.
    const afterImmediate = applyImmediateFailure(
      initialState,
      content.exerciseById['a1'],
      content,
      '2026-05-23'
    );
    const finalA = applySessionResult(afterImmediate, {
      answers: [
        { exerciseId: 'a1', correct: false }
      ]
    }, content, '2026-05-23');

    // Path B: el flujo canónico — solo applySessionResult.
    const finalB = applySessionResult(initialState, {
      answers: [
        { exerciseId: 'a1', correct: false }
      ]
    }, content, '2026-05-23');

    // Los estados finales son íntegramente idénticos, incluido vecesFallada
    // (el +1 lo aporta applySessionResult en AMBOS paths → convergen en 1).
    assert.deepEqual(finalA.categoryProgress, finalB.categoryProgress,
      'el categoryProgress completo (incl. vecesFallada) es idéntico entre ambos paths');
    assert.deepEqual(finalA.exerciseStats, finalB.exerciseStats);
    assert.deepEqual(finalA.dailyLog, finalB.dailyLog);

    // Convergencia de vecesFallada: ambos paths terminan en applySessionResult
    // sobre avere fallada → exactamente 1.
    assert.equal(finalA.categoryProgress['avere'].vecesFallada, 1,
      'Path A: el +1 de la sesión cuenta el fallo exactamente una vez');
    assert.equal(finalB.categoryProgress['avere'].vecesFallada, 1,
      'Path B: applySessionResult aporta el mismo +1 → convergencia');
  });

  test('caso E2E exploit: cat hecha → fail inmediato → abandono sin applySessionResult = regresión persiste', () => {
    // El test que justifica D-54. Sin applyImmediateFailure, el state nunca
    // se persistiría con la regresión si el usuario abandona tras fallar.
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);

    // Fallo inmediato en a1. Usuario abandona aquí (NO se llama applySessionResult).
    const after = applyImmediateFailure(state, content.exerciseById['a1'], content, '2026-05-23');

    // La regresión es observable en el state que app.js persiste con saveState.
    const cat = after.categoryProgress['avere'];
    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.deepEqual(cat.clearedExerciseIds, []);
    assert.equal(cat.becameHechaAt, undefined);

    // exerciseStats SIGUE vacío (el bump monotónico no ocurre porque la sesión
    // no se completó — esto es coherente con SESSION-08 para los aciertos:
    // solo se cuenta lo que termina con applySessionResult). PERO la regresión
    // de categoría SÍ se persiste, que es lo crítico para el core value.
    assert.deepEqual(after.exerciseStats, {});

    // dailyLog refleja el fallo del día.
    assert.deepEqual(after.dailyLog['2026-05-23'], {
      date: '2026-05-23',
      categoriesPracticed: ['avere'],
      categoriesWithFailure: ['avere']
    });
  });

  test('ejercicio multi-cat: cascada inmediata afecta TODAS las categorías del ejercicio', () => {
    const state = setupHechaState('avere', ['a1'], {
      streakDays: 3,
      lastSuccessDate: '2026-05-22'
    });
    // genero también en hecha.
    state.categoryProgress['genero'] = {
      status: 'hecha',
      clearedExerciseIds: ['g1'],
      streakDays: 7,
      lastPracticedDate: '2026-05-22',
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-15',
      becameDominadaAt: undefined
    };

    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'g1', categoryIds: ['genero'] },
      { id: 'mix', categoryIds: ['avere', 'genero'] }
    ]);

    const after = applyImmediateFailure(state, content.exerciseById['mix'], content, '2026-05-23');

    // Ambas categorías reseteadas.
    assert.equal(after.categoryProgress['avere'].status, 'no-hecha');
    assert.equal(after.categoryProgress['avere'].streakDays, 0);
    assert.deepEqual(after.categoryProgress['avere'].clearedExerciseIds, []);

    assert.equal(after.categoryProgress['genero'].status, 'no-hecha');
    assert.equal(after.categoryProgress['genero'].streakDays, 0);
    assert.deepEqual(after.categoryProgress['genero'].clearedExerciseIds, []);

    // dailyLog refleja AMBAS categorías como practicadas + falladas.
    assert.deepEqual([...after.dailyLog['2026-05-23'].categoriesPracticed].sort(), ['avere', 'genero']);
    assert.deepEqual([...after.dailyLog['2026-05-23'].categoriesWithFailure].sort(), ['avere', 'genero']);
  });

  test('pureza: input state NO se muta tras applyImmediateFailure', () => {
    const makeFixture = () => ({
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 4, timesFailed: 1 } },
      categoryProgress: {
        avere: {
          status: 'hecha',
          clearedExerciseIds: ['a1'],
          streakDays: 3,
          lastPracticedDate: '2026-05-22',
          lastSuccessDate: '2026-05-22',
          becameHechaAt: '2026-05-20',
          becameDominadaAt: undefined
        }
      },
      dailyLog: {}
    });
    const before = makeFixture();
    const snapshot = makeFixture();
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);

    applyImmediateFailure(before, content.exerciseById['a1'], content, '2026-05-23');

    assert.deepEqual(before, snapshot);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/progress — contador vecesFallada de categoría
// (quick-260615-nzi, re-escrito por quick-260615-r3b CAMBIO 3)
//
// Nueva semántica POR-SESIÓN: vecesFallada sube +1 una vez por categoría fallada
// por sesión/examen, materializado al CERRAR la sesión en applySessionResult
// (rama FAIL-WINS). El bucle corre una vez por categoría tocada y failedCategoryIds
// es por-sesión → fallar 2 ejercicios de la misma categoría en una sesión = +1.
// applyImmediateFailure YA NO toca vecesFallada (solo el reset cascada inmediato).
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress — contador vecesFallada de categoría (por-sesión, quick-260615-r3b)', () => {
  test('sesión con un fallo en categoría con progreso → vecesFallada sube a 1 y aplica el reset', () => {
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);

    const after = applySessionResult(state, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-23');
    const cat = after.categoryProgress['avere'];

    assert.equal(cat.vecesFallada, 1, 'sube a 1 al fallar la categoría en la sesión');
    // El reset cascada (FAIL-WINS) sigue intacto.
    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.deepEqual(cat.clearedExerciseIds, []);
  });

  test('fallar 2 ejercicios de la MISMA categoría en una sesión → vecesFallada +1 (no +2)', () => {
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);

    const after = applySessionResult(state, {
      answers: [
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'a2', correct: false }
      ]
    }, content, '2026-05-23');

    assert.equal(after.categoryProgress['avere'].vecesFallada, 1,
      'el bucle corre una vez por categoría → dos fallos de avere cuentan +1, no +2');
  });

  test('categoría sin fallo en la sesión (rama PROMOTION) → vecesFallada no cambia', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const after = applySessionResult(blankStateV2(), {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a2', correct: true }
      ]
    }, content, '2026-05-23');

    assert.equal(after.categoryProgress['avere'].vecesFallada ?? 0, 0,
      'una sesión limpia (sin fallo) NO incrementa vecesFallada');
    assert.equal(after.categoryProgress['avere'].status, 'hecha');
  });

  test('vecesFallada previo se acumula: cat con vecesFallada=2 → sesión fallada → 3', () => {
    const state = setupHechaState('avere', ['a1'], { streakDays: 5, lastSuccessDate: '2026-05-22' });
    state.categoryProgress['avere'].vecesFallada = 2;
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);

    const after = applySessionResult(state, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-23');

    assert.equal(after.categoryProgress['avere'].vecesFallada, 3);
  });

  test('dos sesiones falladas seguidas → +1 cada una (semántica por-sesión = +2 total)', () => {
    const content = makeContent([{ id: 'a1', categoryIds: ['avere'] }]);
    const state = setupHechaState('avere', ['a1'], { streakDays: 5, lastSuccessDate: '2026-05-22' });

    const afterFirst = applySessionResult(state, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-23');
    const afterSecond = applySessionResult(afterFirst, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-24');

    assert.equal(afterFirst.categoryProgress['avere'].vecesFallada, 1);
    assert.equal(afterSecond.categoryProgress['avere'].vecesFallada, 2,
      'cada sesión fallada cuenta una vez — dos sesiones = +2');
  });

  test('applyImmediateFailure NO toca vecesFallada (preserva el previo)', () => {
    const state = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });
    state.categoryProgress['avere'].vecesFallada = 4;
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);

    const after = applyImmediateFailure(state, content.exerciseById['a1'], content, '2026-05-23');
    const cat = after.categoryProgress['avere'];

    assert.equal(cat.vecesFallada, 4, 'el helper inmediato preserva vecesFallada sin +1');
    // El reset cascada inmediato SÍ se aplica (lo crítico para el core value).
    assert.equal(cat.status, 'no-hecha');
    assert.equal(cat.streakDays, 0);
    assert.deepEqual(cat.clearedExerciseIds, []);
  });

  test('immediate + session con el mismo fail → vecesFallada exactamente 1 (el +1 lo aporta la sesión)', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);
    const initialState = setupHechaState('avere', ['a1', 'a2'], {
      streakDays: 5,
      lastSuccessDate: '2026-05-22',
      becameHechaAt: '2026-05-18'
    });

    const afterImmediate = applyImmediateFailure(initialState, content.exerciseById['a1'], content, '2026-05-23');
    const final = applySessionResult(afterImmediate, {
      answers: [{ exerciseId: 'a1', correct: false }]
    }, content, '2026-05-23');

    assert.equal(final.categoryProgress['avere'].vecesFallada, 1,
      'immediate no cuenta; applySessionResult aporta el único +1 de la sesión');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// DOMAIN-10 — smoke test integrado 30 días (D-53 combinado)
//
// El plan 02-01/02 ya splitea los aspectos del dominio en suites unitarias
// (D-53.1 cascada, D-53.2 promoción, D-53.3 racha guard). Este test integrado
// combina los tres en una sola simulación de 30+ días con un escenario
// realista de uso: el autor practica varias categorías, falla, recupera, se
// promociona, vuelve a fallar, prueba la racha guard del mismo día. Es la
// red de seguridad final contra regresiones que pasen las suites unitarias
// pero rompan combinaciones específicas.
// ────────────────────────────────────────────────────────────────────────────

describe('domain — smoke test integrado 30 días (DOMAIN-10)', () => {
  test('escenario completo: cascada multi-cat + promoción + dominada + regresión + racha guard', () => {
    // Helpers locales scoped al test.
    const isoDay = n => `2026-06-${String(n).padStart(2, '0')}`;
    /**
     * Construye `sessionResult.answers` desde una lista de exerciseIds.
     * `correctMap`: opcional, valor `false` para un id marca el answer
     * como incorrecto. Defecto: todos correctos.
     */
    const sessionAnswers = (exerciseIds, correctMap = {}) =>
      exerciseIds.map(id => ({ exerciseId: id, correct: correctMap[id] !== false }));

    // Setup: 2 categorías (avere, genero) con 1 ejercicio multi-cat.
    // avere tiene 4 ejercicios (a1, a2, a3, m1); genero tiene 3 (g1, g2, m1).
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] },
      { id: 'a3', categoryIds: ['avere'] },
      { id: 'g1', categoryIds: ['genero'] },
      { id: 'g2', categoryIds: ['genero'] },
      { id: 'm1', categoryIds: ['avere', 'genero'] }
    ]);

    let state = blankStateV2();

    // ─── Días 1-7: promoción + 7 días racha continua sobre avere Y genero ───
    // Cada día el autor responde TODOS los ejercicios de ambas categorías sin fallar.
    // Día 1: ambas promocionan no-hecha → hecha con streak=1.
    // Día 2-7: streak incrementa 1 por día.
    for (let day = 1; day <= 7; day++) {
      state = applySessionResult(
        state,
        { answers: sessionAnswers(['a1', 'a2', 'a3', 'm1', 'g1', 'g2']) },
        content,
        isoDay(day)
      );
    }
    assert.equal(state.categoryProgress.avere.status, 'hecha', 'avere debe ser hecha tras 7 días sin fallar');
    assert.equal(state.categoryProgress.avere.streakDays, 7, 'avere.streak debe ser 7 tras 7 días');
    assert.equal(state.categoryProgress.avere.becameHechaAt, isoDay(1), 'avere se promocionó el día 1');
    assert.equal(state.categoryProgress.genero.status, 'hecha', 'genero debe ser hecha tras 7 días sin fallar');
    assert.equal(state.categoryProgress.genero.streakDays, 7, 'genero.streak debe ser 7 tras 7 días');

    // ─── Día 8: cascada multi-cat por fallo en m1 ───
    // Tras aciertos previos en a1/g1 en la MISMA sesión, m1 falla. La cascada
    // borra TODO para ambas categorías (D-39 fail-wins absoluto).
    state = applySessionResult(
      state,
      {
        answers: [
          { exerciseId: 'a1', correct: true },
          { exerciseId: 'g1', correct: true },
          { exerciseId: 'm1', correct: false }
        ]
      },
      content,
      isoDay(8)
    );
    assert.equal(state.categoryProgress.avere.status, 'no-hecha', 'cascada multi-cat avere → no-hecha');
    assert.equal(state.categoryProgress.avere.streakDays, 0, 'avere.streak reseteada a 0');
    assert.deepEqual(state.categoryProgress.avere.clearedExerciseIds, [], 'avere.cleared vaciado');
    assert.equal(state.categoryProgress.avere.becameHechaAt, undefined, 'becameHechaAt limpiado en cascada');
    assert.equal(state.categoryProgress.genero.status, 'no-hecha', 'cascada multi-cat genero → no-hecha');
    assert.equal(state.categoryProgress.genero.streakDays, 0, 'genero.streak reseteada a 0');
    assert.deepEqual(state.categoryProgress.genero.clearedExerciseIds, [], 'genero.cleared vaciado');

    // exerciseStats monotónico: timesShown sigue creciendo (DOMAIN-09).
    // m1 ha sido visto 7 veces (días 1-7) + 1 vez (día 8) = 8. timesFailed=1.
    assert.ok(state.exerciseStats.m1.timesShown >= 8, `m1.timesShown debe ser ≥8, fue ${state.exerciseStats.m1.timesShown}`);
    assert.ok(state.exerciseStats.m1.timesFailed >= 1, 'm1.timesFailed debe haber crecido por el fallo del día 8');

    // ─── Días 9-29: recuperación + 21 días racha continua sobre avere ───
    // El autor SOLO toca avere (sin genero) durante 21 días consecutivos.
    // Día 9: avere promociona a hecha (streak=1).
    // Día 9+20=29: avere debería ser dominada (al cruzar 21 días).
    for (let day = 9; day <= 29; day++) {
      state = applySessionResult(
        state,
        { answers: sessionAnswers(['a1', 'a2', 'a3', 'm1']) },
        content,
        isoDay(day)
      );
    }
    assert.equal(state.categoryProgress.avere.status, 'dominada', 'avere debe ser dominada tras 21 días continuos');
    assert.equal(state.categoryProgress.avere.streakDays, 21, 'avere.streak debe ser 21');
    assert.equal(state.categoryProgress.avere.becameDominadaAt, isoDay(29), 'becameDominadaAt en el día de cruce');
    // genero NO se tocó: sigue no-hecha desde el día 8.
    assert.equal(state.categoryProgress.genero.status, 'no-hecha', 'genero sigue no-hecha (sin tocar 21 días)');
    assert.equal(state.categoryProgress.genero.streakDays, 0, 'genero.streak intacto');

    // ─── Día 30 (sesión 1): regresión desde dominada por fallo ───
    state = applySessionResult(
      state,
      { answers: [{ exerciseId: 'a1', correct: false }] },
      content,
      isoDay(30)
    );
    assert.equal(state.categoryProgress.avere.status, 'no-hecha', 'avere regresa desde dominada a no-hecha por fallo');
    assert.equal(state.categoryProgress.avere.streakDays, 0, 'avere.streak reseteada a 0');
    assert.deepEqual(state.categoryProgress.avere.clearedExerciseIds, [], 'avere.cleared vaciado');
    assert.equal(state.categoryProgress.avere.becameDominadaAt, undefined, 'becameDominadaAt limpiado');
    assert.equal(state.categoryProgress.avere.becameHechaAt, undefined, 'becameHechaAt limpiado');

    // ─── Día 30 (sesión 2): completa avere → promociona de nuevo a hecha ───
    state = applySessionResult(
      state,
      { answers: sessionAnswers(['a1', 'a2', 'a3', 'm1']) },
      content,
      isoDay(30)
    );
    assert.equal(state.categoryProgress.avere.status, 'hecha', 'avere vuelve a hecha en la sesión 2 del día 30');
    assert.equal(state.categoryProgress.avere.streakDays, 1, 'streak=1 tras promoción');
    assert.equal(state.categoryProgress.avere.lastSuccessDate, isoDay(30), 'lastSuccessDate registrado');

    // ─── Día 30 (sesiones 3-7): racha guard `lastSuccessDate === today` ───
    // 5 sesiones más el MISMO día con aciertos. streak NO debe incrementar
    // (D-53.3 racha guard) — sigue siendo 1.
    for (let i = 0; i < 5; i++) {
      state = applySessionResult(
        state,
        { answers: [{ exerciseId: 'a1', correct: true }] },
        content,
        isoDay(30)
      );
    }
    assert.equal(state.categoryProgress.avere.streakDays, 1, 'racha guard: streak sigue siendo 1 tras 5 sesiones más el mismo día');
    assert.equal(state.categoryProgress.avere.lastSuccessDate, isoDay(30), 'lastSuccessDate sigue siendo día 30');
    assert.equal(state.categoryProgress.avere.status, 'hecha', 'avere sigue hecha');

    // ─── Aserciones finales: monotonicidad + dailyLog ───
    // exerciseStats.a1: visto en días 1-7 (7) + sesiones del 9-29 (21) +
    // día 30 sesión 1 fallo (1) + día 30 sesión 2 (1) + día 30 sesiones 3-7 (5) = 35.
    assert.ok(state.exerciseStats.a1.timesShown >= 30, `a1.timesShown=${state.exerciseStats.a1.timesShown}, esperado ≥30`);
    // dailyLog tiene entradas para días distintos (idempotente por día — múltiples
    // sesiones el mismo día = una sola entrada).
    // Días tocados distintos: 1-7 (7), 8 (1), 9-29 (21), 30 (1) = 30 entradas.
    const dailyLogKeys = Object.keys(state.dailyLog);
    assert.ok(dailyLogKeys.length >= 30, `dailyLog debe tener ≥30 días distintos, tenía ${dailyLogKeys.length}`);
    assert.ok(dailyLogKeys.includes(isoDay(30)), 'dailyLog debe contener el día 30');
    assert.ok(state.dailyLog[isoDay(30)].categoriesWithFailure.includes('avere'), 'día 30 marca avere como falló');

    // ─── Pureza del content: no se mutó ni añadió campos sorpresa ───
    assert.equal(typeof content.exerciseById, 'object', 'content.exerciseById sigue siendo objeto');
    assert.equal(Object.keys(content.exerciseById).length, 6, 'content.exerciseById sigue teniendo 6 ejercicios');
    assert.equal(content.exerciseById.a1.id, 'a1', 'a1 intacto');
    assert.deepEqual(content.exerciseById.m1.categoryIds, ['avere', 'genero'], 'm1.categoryIds intacto');
  });
});
