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

import { applySessionResult, applyNewExerciseRegression } from '../src/domain/progress.js';
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
