// tests/data-storage.test.js
//
// Tests de las funciones puras de migración expuestas por `src/data/storage.js`.
// NO tocamos `loadState`/`saveState` (esos llaman a `localStorage`, que no
// existe en el runtime de `node --test`). Cubrimos:
//
//   - `blankState()` produce el shape v2 esperado.
//   - `migrate1to2(v1)` preserva `exerciseStats` íntegro y añade los campos
//     nuevos (`categoryProgress`, `dailyLog`) vacíos.
//   - `migrate1to2` es defensivo ante `exerciseStats` malformado.
//   - `hydrateV2(parsed)` preserva los 4 sub-objetos de un estado v2 válido.
//   - `hydrateV2` es defensivo ante sub-objetos malformados (null, no-object).
//   - `blankState()` codifica `schemaVersion: 2`.
//
// Estos tests verifican la decisión D-46 (migración 1→2) y D-47
// (inicialización lazy — `categoryProgress` arranca `{}`).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { blankState, migrate1to2, hydrateV2 } from '../src/data/storage.js';

describe('data/storage — blankState v2', () => {
  test('blankState() devuelve shape v2 completo con campos esperados', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 2);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    // `inFlightTest` debe estar omitido (undefined), no presente como key.
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false,
      'blankState() no debería incluir la clave `inFlightTest` (debe ser omitida)');
  });

  test('blankState() codifica schemaVersion: 2 (no v1)', () => {
    assert.equal(blankState().schemaVersion, 2);
  });
});

describe('data/storage — migrate1to2', () => {
  test('migra v1 preservando exerciseStats íntegro', () => {
    const v1 = {
      schemaVersion: 1,
      exerciseStats: {
        a1: { timesShown: 5, timesCorrect: 3, timesFailed: 2 },
        a2: { timesShown: 1, timesCorrect: 0, timesFailed: 1 }
      }
    };
    const v2 = migrate1to2(v1);
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, v1.exerciseStats);
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });

  test('migra v1 con exerciseStats null defensivamente (sin crashear)', () => {
    const v2 = migrate1to2({ schemaVersion: 1, exerciseStats: null });
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, {});
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });

  test('migra v1 con exerciseStats ausente (campo undefined) sin crashear', () => {
    const v2 = migrate1to2({ schemaVersion: 1 });
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, {});
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });
});

describe('data/storage — hydrateV2', () => {
  test('preserva los 4 sub-objetos íntegros sin reset', () => {
    const input = {
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {
        avere: {
          status: 'hecha',
          clearedExerciseIds: ['a1'],
          streakDays: 3,
          lastSuccessDate: '2026-05-23'
        }
      },
      dailyLog: {
        '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] }
      },
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1', 'a2'],
        cursor: 1,
        answers: [{ exerciseId: 'a1', correct: true }],
        startedAt: 1716480000000
      }
    };
    const out = hydrateV2(input);
    assert.equal(out.schemaVersion, 2);
    assert.deepEqual(out.exerciseStats, input.exerciseStats);
    assert.deepEqual(out.categoryProgress, input.categoryProgress);
    assert.deepEqual(out.dailyLog, input.dailyLog);
    assert.deepEqual(out.inFlightTest, input.inFlightTest);
  });

  test('campos malformados (null) defaults a objeto vacío', () => {
    const out = hydrateV2({
      schemaVersion: 2,
      exerciseStats: null,
      categoryProgress: null,
      dailyLog: null,
      inFlightTest: undefined
    });
    assert.equal(out.schemaVersion, 2);
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.equal(out.inFlightTest, undefined);
  });

  test('inFlightTest=undefined se preserva (no se materializa una clave)', () => {
    const out = hydrateV2({
      schemaVersion: 2,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {}
      // sin inFlightTest
    });
    assert.equal(out.inFlightTest, undefined);
  });
});
