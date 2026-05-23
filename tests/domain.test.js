// tests/domain.test.js
//
// Tests del dominio puro + validator. Se ejecutan con:
//
//     node --test tests/
//
// Requiere Node 22 LTS o superior (por `t.mock.timers.enable({apis:['Date']})`).
//
// NOTA sobre TZ: el test "todayLocal handles end-of-month boundary" usa
// `new Date(2026, 11, 31, 23, 59, 59)` que se interpreta en huso LOCAL. Bajo
// TZ=UTC el tick(2000) también cruza medianoche local. En CI/runners con
// TZ exótico podría dar resultados distintos — documentado en README.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { todayLocal } from '../src/domain/dates.js';
import { buildSession, exerciseWeight } from '../src/domain/session.js';
import { applySessionResult } from '../src/domain/progress.js';
import { validateContent } from '../src/data/schema-validator.js';
import { multipleChoice } from '../src/exercise-types/multiple-choice.js';
import { registry } from '../src/exercise-types/index.js';
import { seededLcg } from './util/seeded-rng.js';

// ────────────────────────────────────────────────────────────────────────────
// domain/dates
// ────────────────────────────────────────────────────────────────────────────

describe('domain/dates', () => {
  test('todayLocal returns YYYY-MM-DD using local clock (2026-05-23)', (t) => {
    // Mes 0-indexed: 4 = Mayo
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 4, 23, 10, 0, 0).getTime() });
    assert.equal(todayLocal(), '2026-05-23');
  });

  test('todayLocal crosses local midnight boundary (2026-12-31 → 2027-01-01)', (t) => {
    // Mes 0-indexed: 11 = Diciembre. Hora local 23:59:58.
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 11, 31, 23, 59, 58).getTime() });
    assert.equal(todayLocal(), '2026-12-31');
    // Avanzar 3 segundos: cruzamos medianoche local
    t.mock.timers.tick(3000);
    assert.equal(todayLocal(), '2027-01-01');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/session
// ────────────────────────────────────────────────────────────────────────────

describe('domain/session', () => {
  test('exerciseWeight respects WEIGHT_CAP at timesShown=10', () => {
    assert.equal(exerciseWeight(0), 1);
    assert.equal(exerciseWeight(1), 1 / 2);
    assert.equal(exerciseWeight(10), 1 / 11);
    assert.equal(exerciseWeight(100), 1 / 11); // capped
    assert.equal(exerciseWeight(undefined), 1); // null-safe
  });

  test('buildSession reduces actualSize to pool length when pool < requested (D-13)', () => {
    // 8 ejercicios, pedimos 20 → debe devolver 8 sin repetidos.
    const exercises = Array.from({ length: 8 }, (_, i) => ({
      id: `a${i + 1}`,
      type: 'multiple-choice',
      categoryIds: ['avere'],
      payload: {}
    }));
    const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso', seededLcg(1234));
    assert.equal(result.actualSize, 8);
    assert.equal(result.exerciseIds.length, 8);
    // Sin repetidos (D-14)
    assert.equal(new Set(result.exerciseIds).size, 8);
  });

  test('buildSession with empty pool returns zero-length session (no throw)', () => {
    const result = buildSession(['avere'], [], { exerciseStats: {} }, 20, 'repaso');
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });

  test('buildSession filters by categoryIds (ejercicios de otra categoría se excluyen)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'g1', type: 'multiple-choice', categoryIds: ['genero'], payload: {} }
    ];
    const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso', seededLcg(42));
    assert.equal(result.actualSize, 2);
    assert.ok(!result.exerciseIds.includes('g1'));
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/progress
// ────────────────────────────────────────────────────────────────────────────

describe('domain/progress', () => {
  test('applySessionResult increments counters monotonically and does not mutate input', () => {
    const before = { schemaVersion: 1, exerciseStats: {} };
    const after = applySessionResult(before, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'a2', correct: true }
      ]
    });
    assert.deepEqual(after.exerciseStats['a1'], { timesShown: 2, timesCorrect: 1, timesFailed: 1 });
    assert.deepEqual(after.exerciseStats['a2'], { timesShown: 1, timesCorrect: 1, timesFailed: 0 });
    // Input no se muta — `before.exerciseStats` sigue vacío
    assert.deepEqual(before.exerciseStats, {});
    // Es un objeto distinto
    assert.notEqual(after.exerciseStats, before.exerciseStats);
  });

  test('applySessionResult acumula sobre estado preexistente', () => {
    const before = {
      schemaVersion: 1,
      exerciseStats: {
        a1: { timesShown: 5, timesCorrect: 3, timesFailed: 2 }
      }
    };
    const after = applySessionResult(before, {
      answers: [{ exerciseId: 'a1', correct: true }]
    });
    assert.deepEqual(after.exerciseStats['a1'], { timesShown: 6, timesCorrect: 4, timesFailed: 2 });
    // Sin mutar
    assert.deepEqual(before.exerciseStats['a1'], { timesShown: 5, timesCorrect: 3, timesFailed: 2 });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator', () => {
  test('rejects unknown categoryId reference', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'a1',
            type: 'multiple-choice',
            categoryIds: ['ghost'],
            payload: { prompt: 'Io ___ fame.', options: ['ho', 'hai', 'ha'], correctIndex: 0 }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /ghost/.test(e.reason)),
      `Esperaba un error mencionando "ghost"; errores: ${JSON.stringify(result.errors)}`);
  });

  test('accumulates multiple errors in single pass (id duplicado + options=2 + prompt sin hueco)', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'dup',
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'sin hueco', options: ['ho', 'hai'], correctIndex: 0 }
          },
          {
            id: 'dup', // duplicado
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'Io ___ una macchina.', options: ['ho', 'hai', 'ha'], correctIndex: 5 }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    // Deberíamos ver: prompt sin "___", options.length=2, id duplicado, correctIndex fuera de rango.
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/___/.test(reasons), `falta error de prompt sin "___": ${reasons}`);
    assert.ok(/options/.test(reasons), `falta error de options inválido: ${reasons}`);
    assert.ok(/duplicado/.test(reasons), `falta error de id duplicado: ${reasons}`);
    assert.ok(/correctIndex/.test(reasons), `falta error de correctIndex fuera de rango: ${reasons}`);
  });

  test('accepts a well-formed content bundle', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere (auxiliar)', order: 1 }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'avere-001',
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'Io ___ una macchina nuova.', options: ['ho', 'hai', 'ha', 'abbiamo'], correctIndex: 0 }
          }
        ]
      }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/multiple-choice
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/multiple-choice', () => {
  test('grade returns true when response.index matches correctIndex', () => {
    const ex = { payload: { correctIndex: 2 } };
    assert.equal(multipleChoice.grade(ex, { index: 2 }), true);
  });

  test('grade returns false when response.index does not match', () => {
    const ex = { payload: { correctIndex: 2 } };
    assert.equal(multipleChoice.grade(ex, { index: 0 }), false);
    assert.equal(multipleChoice.grade(ex, { index: 1 }), false);
    assert.equal(multipleChoice.grade(ex, { index: 3 }), false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/index — registry
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/index', () => {
  test('registry exposes multiple-choice handler with grade()', () => {
    assert.ok(registry['multiple-choice'], 'registry debería tener una entrada "multiple-choice"');
    assert.equal(typeof registry['multiple-choice'].grade, 'function');
    // Misma identidad que el módulo (Test 9 del plan)
    assert.equal(registry['multiple-choice'], multipleChoice);
  });
});
