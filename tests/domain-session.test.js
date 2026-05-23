// tests/domain-session.test.js
//
// Tests del sampler (Phase 2). Cubre D-53.4:
//
//   D-53.4a — GUARANTEE phase del `buildSession` (set-cover greedy + multi-cat
//             coverage + oversubscription silent + statistical ratio del weight cap).
//   D-53.4b — `buildFullTest` (Fisher-Yates determinista sin tope ni weighted).
//
// Ejecutar:
//
//     node --test tests/domain-session.test.js
//
// Determinismo: todos los tests usan `seededLcg(seed)` como RNG. Ninguno mocked
// global ni depende de `Math.random` real.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { buildSession, buildFullTest, exerciseWeight } from '../src/domain/session.js';
import { seededLcg } from './util/seeded-rng.js';

// ────────────────────────────────────────────────────────────────────────────
// D-53.4a — GUARANTEE phase del `buildSession`
// ────────────────────────────────────────────────────────────────────────────

describe('domain/session — D-53.4a GUARANTEE phase', () => {
  test('multi-cat: 2 categorías + 1 ejercicio que cubre ambas → se elige UNA vez (alreadyCovered skip)', () => {
    // 2 categorías marcadas, 1 solo ejercicio que pertenece a ambas. La GUARANTEE
    // para `avere` lo elige; la GUARANTEE para `genero` ve alreadyCovered=true y skip.
    const exercises = [
      { id: 'm1', type: 'multiple-choice', categoryIds: ['avere', 'genero'], payload: {} }
    ];
    const state = { exerciseStats: {} };
    const result = buildSession(['avere', 'genero'], exercises, state, 10, 'repaso', seededLcg(42));

    assert.equal(result.actualSize, 1);
    assert.deepEqual(result.exerciseIds, ['m1']);
  });

  test('GUARANTEE cubre cada categoría con ≥1 ejercicio cuando hay candidates (3 cats, 3 exs, target=20)', () => {
    // 3 categorías, 1 ejercicio por categoría — la GUARANTEE llena 3, la FILL
    // no tiene nada que añadir (pool exhausto). actualSize=3.
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'g1', type: 'multiple-choice', categoryIds: ['genero'], payload: {} },
      { id: 'v1', type: 'multiple-choice', categoryIds: ['verbos'], payload: {} }
    ];
    const state = { exerciseStats: {} };
    const result = buildSession(['avere', 'genero', 'verbos'], exercises, state, 20, 'repaso', seededLcg(7));

    assert.equal(result.actualSize, 3);
    // Todos los IDs únicos y los 3 esperados (verificamos por SET, no orden — Fisher-Yates final randomiza).
    assert.deepEqual([...result.exerciseIds].sort(), ['a1', 'g1', 'v1']);
  });

  test('oversubscription: 25 categorías con 1 ej cada una + target=20 → actualSize=20 (drop silente D-51)', () => {
    // GUARANTEE phase se autoprotege con `if (session.length >= targetSize) break`.
    // 5 categorías quedan sin cubrir, sin warning (D-51 explícito).
    const categoryIds = Array.from({ length: 25 }, (_, i) => `cat${i}`);
    const exercises = Array.from({ length: 25 }, (_, i) => ({
      id: `e${i}`,
      type: 'multiple-choice',
      categoryIds: [`cat${i}`],
      payload: {}
    }));
    const state = { exerciseStats: {} };
    const result = buildSession(categoryIds, exercises, state, 20, 'repaso', seededLcg(99));

    assert.equal(result.actualSize, 20, 'GUARANTEE phase cortó al alcanzar target');
    assert.equal(result.exerciseIds.length, 20);
    // Unicidad — sin reemplazo.
    assert.equal(new Set(result.exerciseIds).size, 20);
  });

  test('weighted statistical ratio: cold (timesShown=0) vs hot (timesShown=100) → ratio ≈ 11 sobre 1000 iters', () => {
    // weight cap=10 → cold weight=1, hot weight=1/11. Prob ratio teórico 11:1.
    // (cold prob ≈ 11/12 ≈ 0.917, hot prob ≈ 1/12 ≈ 0.083 → ratio teórico 11.)
    //
    // NOTA importante sobre el RNG: usamos UN solo `seededLcg(seed)` para las
    // 1000 iteraciones, NO `seededLcg(seed + i)` por iteración. Una LCG con
    // semillas consecutivas produce un *primer* output altamente correlacionado
    // (el step en [0,1) es ~1664525/2^32 ≈ 0.000387), lo que genera una
    // distribución agrupada en una franja estrecha del intervalo y falsea el
    // ratio. Compartiendo el estado del LCG a lo largo de las 1000 iteraciones
    // obtenemos una distribución pseudo-uniforme y un ratio observado dentro
    // de la tolerancia esperada (~10..11).
    //
    // Tolerancia: ratio ∈ (8, 14). No es métrica científica — defensive check
    // del weight cap.
    const exercises = [
      { id: 'cold', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'hot', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
    ];
    const state = {
      exerciseStats: {
        cold: { timesShown: 0, timesCorrect: 0, timesFailed: 0 },
        hot: { timesShown: 100, timesCorrect: 50, timesFailed: 50 }
      }
    };

    const rng = seededLcg(42);
    const counts = { cold: 0, hot: 0 };
    for (let i = 0; i < 1000; i++) {
      const result = buildSession(['avere'], exercises, state, 1, 'repaso', rng);
      counts[result.exerciseIds[0]]++;
    }

    // Sanity: el ratio total cuenta 1000.
    assert.equal(counts.cold + counts.hot, 1000);
    assert.ok(counts.hot > 0, `hot debería tener al menos algunas selecciones: ${counts.hot}`);
    const ratio = counts.cold / counts.hot;
    assert.ok(
      ratio > 8 && ratio < 14,
      `ratio fuera de tolerancia [8,14]: ${ratio} (cold=${counts.cold}, hot=${counts.hot})`
    );
  });

  test('categoryIds=[] (lista vacía) → pool vacío por filtrado, actualSize=0 (defensivo)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
    ];
    const state = { exerciseStats: {} };
    const result = buildSession([], exercises, state, 20, 'repaso', seededLcg(1));

    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// D-53.4b — `buildFullTest`
// ────────────────────────────────────────────────────────────────────────────

describe('domain/session — D-53.4b buildFullTest', () => {
  test('pool de 12 ejercicios en 2 categorías → devuelve los 12, todos únicos, determinista por seed', () => {
    const exercises = [
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `a${i + 1}`,
        type: 'multiple-choice',
        categoryIds: ['avere'],
        payload: {}
      })),
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `g${i + 1}`,
        type: 'multiple-choice',
        categoryIds: ['genero'],
        payload: {}
      }))
    ];

    const result = buildFullTest(['avere', 'genero'], exercises, seededLcg(42));
    assert.equal(result.actualSize, 12);
    assert.equal(result.exerciseIds.length, 12);
    assert.equal(new Set(result.exerciseIds).size, 12, 'todos los IDs únicos');

    // Determinismo: mismo seed → mismo orden, exactamente.
    const result2 = buildFullTest(['avere', 'genero'], exercises, seededLcg(42));
    assert.deepEqual(result2.exerciseIds, result.exerciseIds);
  });

  test('pool vacío (categoría sin ejercicios) → devuelve {exerciseIds:[], actualSize:0} sin throw', () => {
    const result = buildFullTest(['avere'], [], seededLcg(1));
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });

  test('buildFullTest filtra por categoryIds (excluye ejercicios de categorías ajenas)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'g1', type: 'multiple-choice', categoryIds: ['genero'], payload: {} },
      { id: 'v1', type: 'multiple-choice', categoryIds: ['verbos'], payload: {} }
    ];
    const result = buildFullTest(['avere'], exercises, seededLcg(123));

    assert.equal(result.actualSize, 2);
    assert.deepEqual([...result.exerciseIds].sort(), ['a1', 'a2']);
  });
});
