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

// ────────────────────────────────────────────────────────────────────────────
// Phase 16 — muestreo por slot + variante (EXAM-01/04/06)
//
// El sampler recorre SLOTS y fija 1 variante aleatoria uniforme por slot
// (D-16-01), devolviendo `variantIndices` alineado 1:1 con `exerciseIds`.
//   - EXAM-01: 1 variante por slot, nunca dos del mismo slot en una sesión.
//   - EXAM-04: re-roll con seeds distintos PUEDE tocar variantes distintas
//              (probabilístico, no "siempre distinta" — D-16-02).
//   - D-16-10: slot legacy de 1 variante → variantIndex 0 con cualquier seed.
//
// Shape de slot: `{ id, type, categoryIds, variants: [...] }`. El sampler solo
// lee `.id`/`.categoryIds`/`.variants.length` — las superficies pueden ser `{}`.
// Todos los tests inyectan un `seededLcg` (cero `Math.random` global).
// ────────────────────────────────────────────────────────────────────────────

describe('domain/session — Phase 16 muestreo por slot (EXAM-01/04/06)', () => {
  // Helper local: crea un slot con N variantes vacías (el sampler solo lee length).
  const slot = (id, categoryIds, nVariants) => ({
    id,
    type: 'multiple-choice',
    categoryIds,
    variants: Array.from({ length: nVariants }, () => ({}))
  });

  test('buildSession: variantIndices alineado con exerciseIds y cada índice en rango del slot', () => {
    // Pool mixto: slots de 1 variante (legacy) + slots multi-variante.
    const slots = [
      slot('s1', ['avere'], 1),
      slot('s2', ['avere'], 3),
      slot('s3', ['genero'], 5),
      slot('s4', ['genero'], 1),
      slot('s5', ['verbos'], 4)
    ];
    const byId = Object.fromEntries(slots.map(s => [s.id, s]));
    const state = { exerciseStats: {} };
    const result = buildSession(['avere', 'genero', 'verbos'], slots, state, 20, 'repaso', seededLcg(1234));

    // Arrays alineados 1:1.
    assert.equal(result.variantIndices.length, result.exerciseIds.length);
    assert.equal(result.variantIndices.length, result.actualSize);

    // Cada índice resuelto está dentro del rango del slot correspondiente.
    result.exerciseIds.forEach((id, i) => {
      const vIdx = result.variantIndices[i];
      assert.ok(Number.isInteger(vIdx), `variantIndex debe ser entero: ${vIdx}`);
      assert.ok(
        vIdx >= 0 && vIdx < byId[id].variants.length,
        `variantIndex ${vIdx} fuera de rango [0,${byId[id].variants.length}) para ${id}`
      );
    });
  });

  test('EXAM-01: sin duplicados de exerciseId en una sesión que incluye un slot multi-variante', () => {
    const slots = [
      slot('multi', ['avere', 'genero'], 4), // multi-cat + multi-variante
      slot('s2', ['avere'], 2),
      slot('s3', ['genero'], 3),
      slot('s4', ['verbos'], 1)
    ];
    const state = { exerciseStats: {} };
    const result = buildSession(['avere', 'genero', 'verbos'], slots, state, 20, 'repaso', seededLcg(55));

    // Un slot = una unidad: cada exerciseId aparece UNA sola vez (de-dup por slot).
    assert.equal(
      new Set(result.exerciseIds).size,
      result.exerciseIds.length,
      'ningún slot aparece dos veces en la sesión'
    );
    // ...y con un solo variantIndex por aparición.
    assert.equal(result.variantIndices.length, result.exerciseIds.length);
  });

  test('D-16-10: slot de 1 variante → variantIndex 0 con cualquier seed', () => {
    const slots = [slot('only', ['avere'], 1)];
    const state = { exerciseStats: {} };

    for (const seed of [1, 999, 424242]) {
      const result = buildSession(['avere'], slots, state, 20, 'repaso', seededLcg(seed));
      assert.deepEqual(result.exerciseIds, ['only']);
      assert.deepEqual(result.variantIndices, [0], `seed ${seed}: legacy slot resuelve a 0`);
    }
  });

  test('EXAM-04: un slot multi-variante produce ≥2 variantIndex distintos a lo largo de un barrido de seeds', () => {
    // Slot único con 5 variantes; barriendo seeds, la selección uniforme debe
    // observar al menos 2 índices distintos (re-roll PUEDE tocar variantes
    // distintas — probabilístico, D-16-02). 5 variantes × 60 seeds hace el
    // colapso a un único índice estadísticamente imposible con una LCG.
    const slots = [slot('multi', ['avere'], 5)];
    const state = { exerciseStats: {} };

    const observed = new Set();
    for (let seed = 1; seed <= 60; seed++) {
      const result = buildSession(['avere'], slots, state, 20, 'repaso', seededLcg(seed));
      assert.equal(result.exerciseIds.length, 1);
      observed.add(result.variantIndices[0]);
    }

    assert.ok(
      observed.size >= 2,
      `EXAM-04: se esperaban ≥2 variantIndex distintos sobre el slot multi-variante, observados: ${[...observed].join(',')}`
    );
  });

  test('buildFullTest: cubre todos los slots una vez, cada uno con variantIndex válido', () => {
    const slots = [
      slot('a1', ['avere'], 1),
      slot('a2', ['avere'], 3),
      slot('a3', ['avere'], 2),
      slot('a4', ['avere'], 4)
    ];
    const byId = Object.fromEntries(slots.map(s => [s.id, s]));
    const result = buildFullTest(['avere'], slots, seededLcg(77));

    assert.equal(result.actualSize, 4);
    assert.equal(result.variantIndices.length, 4);
    // Sin duplicados de slot (EXAM-01 en Test completo).
    assert.equal(new Set(result.exerciseIds).size, 4);
    // Cada índice válido para su slot.
    result.exerciseIds.forEach((id, i) => {
      const vIdx = result.variantIndices[i];
      assert.ok(
        vIdx >= 0 && vIdx < byId[id].variants.length,
        `variantIndex ${vIdx} fuera de rango para ${id}`
      );
    });
  });

  test('buildFullTest: pool vacío → {exerciseIds:[], variantIndices:[], actualSize:0}', () => {
    const result = buildFullTest(['avere'], [], seededLcg(3));
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
    assert.deepEqual(result.variantIndices, []);
  });
});
