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
import { readFileSync } from 'node:fs';

import { todayLocal } from '../src/domain/dates.js';
import { buildSession, exerciseWeight } from '../src/domain/session.js';
import { validateContent } from '../src/data/schema-validator.js';
import { applyImmediateFailure } from '../src/domain/progress.js';
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
// domain/progress — split a tests/domain-progress.test.js en Phase 2 (D-52).
// La firma del export se extendió (state, sessionResult, content, today) y la
// suite creció a ≥12 tests, así que vive en archivo aparte.
// ────────────────────────────────────────────────────────────────────────────

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

// daysSinceISO tests live en tests/backup.test.js (co-located con los otros tests Phase 4).

// ────────────────────────────────────────────────────────────────────────────
// multi-cat real cascade — Phase 4 SEED-02 integration
//
// Estos dos tests cierran SEED-02 ejercitando la cascada D-54 sobre el
// contenido REAL committeado (avere.json con ejercicios avere-3XX multi-cat).
// No usan content sintético — leen los archivos del disco para garantizar que
// si el autor edita avere.json sin pensarlo dos veces y mete un cruce roto,
// los smoke tests pinchan inmediatamente.
//
//   Test 1: fallar el primer ejercicio multi-cat real propaga cascada
//           inmediata a TODAS sus categorías (status='no-hecha', racha=0,
//           clearedExerciseIds=[]). Verifica D-54 sobre N≥2 cats con
//           datos reales del disco.
//   Test 2: avere.json (extendido con multi-cat) + categories.json pasan
//           validateContent sin errores — roundtrip de schema sobre el
//           contenido tal como vive en el repo.
// ────────────────────────────────────────────────────────────────────────────

describe('multi-cat real cascade — Phase 4 SEED-02 integration', () => {
  test('applyImmediateFailure on a real multi-cat exercise from avere.json propagates cascade to all its categoryIds', () => {
    // Cargar el contenido real del disco (no sintético).
    const avere = JSON.parse(
      readFileSync(new URL('../content/exercises/avere.json', import.meta.url), 'utf8')
    );

    // Encontrar el primer ejercicio multi-cat — auto-actualizable si el orden cambia.
    const multiCat = avere.exercises.find(
      ex => Array.isArray(ex.categoryIds) && ex.categoryIds.length >= 2
    );
    assert.ok(multiCat, 'expected at least one multi-cat exercise in avere.json (SEED-02 cierre)');
    assert.ok(
      multiCat.categoryIds.length >= 2,
      `multi-cat exercise ${multiCat.id} debe tener >=2 categoryIds (got ${multiCat.categoryIds.length})`
    );

    // Construir contentArg con la firma documentada en progress.js:290-296:
    //   content = {exerciseById: Record<string, {id, categoryIds, ...}>}.
    const contentArg = {
      exerciseById: Object.fromEntries(avere.exercises.map(e => [e.id, e]))
    };

    // Estado v3 realista (Phase 4 schema): ambas categorías DEMOTABLES desde
    // 'hecha' con racha y clearedExerciseIds populados — queremos verificar
    // que la cascada las RESETEA.
    const state = {
      schemaVersion: 3,
      exerciseStats: {
        [multiCat.id]: { timesShown: 3, timesCorrect: 2, timesFailed: 1 }
      },
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: '2026-05-01T08:00:00.000Z'
    };
    for (const catId of multiCat.categoryIds) {
      state.categoryProgress[catId] = {
        status: 'hecha',
        clearedExerciseIds: [multiCat.id, 'some-other-id'],
        streakDays: 5,
        lastPracticedDate: '2026-05-20',
        lastSuccessDate: '2026-05-20',
        becameHechaAt: '2026-05-15',
        becameDominadaAt: undefined
      };
    }

    const today = '2026-05-24';
    const result = applyImmediateFailure(state, multiCat, contentArg, today);

    // Asertar cascada D-54 sobre TODAS las categoryIds del ejercicio (≥2).
    for (const catId of multiCat.categoryIds) {
      const cat = result.categoryProgress[catId];
      assert.equal(
        cat.status, 'no-hecha',
        `${catId} debe quedar 'no-hecha' tras fallo multi-cat (got ${cat.status})`
      );
      assert.equal(
        cat.streakDays, 0,
        `${catId} debe quedar con racha 0 (got ${cat.streakDays})`
      );
      assert.deepEqual(
        cat.clearedExerciseIds, [],
        `${catId} debe quedar con clearedExerciseIds=[] (got ${JSON.stringify(cat.clearedExerciseIds)})`
      );
      assert.equal(
        cat.lastPracticedDate, today,
        `${catId} debe actualizar lastPracticedDate a hoy (got ${cat.lastPracticedDate})`
      );
    }

    // Bonus: dailyLog también queda registrado (D-54 paso 3).
    assert.ok(result.dailyLog[today], 'dailyLog[today] debe existir tras la cascada inmediata');
    for (const catId of multiCat.categoryIds) {
      assert.ok(
        result.dailyLog[today].categoriesWithFailure.includes(catId),
        `dailyLog[today].categoriesWithFailure debe incluir "${catId}"`
      );
    }
  });

  test('avere.json + categories.json pass validateContent after multi-cat extension', () => {
    const avere = JSON.parse(
      readFileSync(new URL('../content/exercises/avere.json', import.meta.url), 'utf8')
    );
    const categoriesRaw = JSON.parse(
      readFileSync(new URL('../content/categories.json', import.meta.url), 'utf8')
    );

    const result = validateContent({
      categories: categoriesRaw.categories,
      exercisesByFile: {
        'content/exercises/avere.json': avere.exercises
      }
    });

    assert.equal(
      result.ok, true,
      `validateContent debería aceptar avere.json + categories.json del repo. Errores: ${JSON.stringify(result.errors, null, 2)}`
    );
    assert.deepEqual(result.errors, []);
  });
});
