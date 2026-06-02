// tests/fixtures/slot-variants.test.js
//
// Phase 15 plan 01 — modelo slot+variantes.
//
// Suite del soporte slot+variantes en el data-layer:
//   - validateContent: rama `payload` XOR `variants[]` (Task 1, schema-validator.js).
//   - normalizeExerciseToSlot: función pura legacy→slot-de-1 / passthrough de
//     variants[] (Task 2, content-loader.js) — importada DIRECTAMENTE (sin fetch).
//
// Decisiones cubiertas: D-15-02 (explanation a nivel de slot + variantes planas),
// D-15-03 (slot de 1 variante sin caso especial), D-15-04 (legacy = slot de 1),
// D-15-06 (back-compat de los 8 archivos), D-08 (acumular errores, sin throw).
//
// Se ejecuta con:
//     node --test tests/fixtures/slot-variants.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { validateContent } from '../../src/data/schema-validator.js';
import { normalizeExerciseToSlot } from '../../src/data/content-loader.js';

const cats = [{ id: 'preposiciones', name: 'Preposiciones', order: 1 }];

// Helper: envuelve un solo ejercicio en el shape esperado por validateContent.
function validateOne(ex, categories = cats) {
  return validateContent({
    categories,
    exercisesByFile: { 'preposiciones.json': [ex] }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator — slot+variants
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator — slot+variants', () => {
  // ── ACEPTA ──────────────────────────────────────────────────────────────

  test('acepta un slot con explanation top-level + 2 variantes multiple-choice válidas', () => {
    const result = validateOne({
      id: 'preposiciones-001',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'La preposición "in" se contrae con el artículo.',
      variants: [
        { prompt: 'Vado ___ Italia.', options: ['in', 'a', 'da'], correctIndex: 0 },
        { prompt: 'Vivo ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 0 }
      ]
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('acepta un slot con exactamente 1 variante (SLOT-03)', () => {
    const result = validateOne({
      id: 'preposiciones-spiaggia',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Locución fija "in spiaggia".',
      variants: [
        { prompt: 'Andiamo ___ spiaggia.', options: ['in', 'a', 'su'], correctIndex: 0 }
      ]
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('acepta variantes word-buttons válidas (con y sin distractors)', () => {
    const result = validateOne({
      id: 'preposiciones-wb',
      type: 'word-buttons',
      categoryIds: ['preposiciones'],
      explanation: 'Orden de la frase con preposición.',
      variants: [
        { prompt: 'Voy a casa.', answer: ['vado', 'a', 'casa'] },
        { prompt: 'Voy a Roma.', answer: ['vado', 'a', 'Roma'], distractors: ['in', 'da'] }
      ]
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('acepta variantes match válidas', () => {
    const result = validateOne({
      id: 'preposiciones-match',
      type: 'match',
      categoryIds: ['preposiciones'],
      explanation: 'Empareja preposición con su contracción.',
      variants: [
        { prompt: 'Empareja.', pairs: [['a + il', 'al'], ['in + la', 'nella']] }
      ]
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  // ── BACK-COMPAT (D-15-06) ─────────────────────────────────────────────────

  test('acepta un ejercicio legacy con payload word-buttons SIN variants[] (back-compat)', () => {
    const result = validateOne({
      id: 'preposiciones-legacy',
      type: 'word-buttons',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Voy a casa.', answer: ['vado', 'a', 'casa'] }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('back-compat: legacy con payload.explanation ausente sigue válido (D-15-04)', () => {
    const result = validateOne({
      id: 'preposiciones-legacy-noexpl',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Vado ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 0 }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  // ── RECHAZA ────────────────────────────────────────────────────────────────

  test('rechaza variants[] vacío []', () => {
    const result = validateOne({
      id: 'preposiciones-empty',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Regla.',
      variants: []
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /variants/.test(e.reason)),
      `Se esperaba un error mencionando "variants": ${JSON.stringify(result.errors)}`
    );
  });

  test('rechaza una variante con superficie inválida (correctIndex fuera de rango) ubicando el índice', () => {
    const result = validateOne({
      id: 'preposiciones-badidx',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Regla.',
      variants: [
        { prompt: 'Vado ___ Italia.', options: ['in', 'a'], correctIndex: 0 },
        { prompt: 'Vivo ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 9 }
      ]
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /variants\[1\]/.test(e.reason)),
      `Se esperaba un error ubicando variants[1]: ${JSON.stringify(result.errors)}`
    );
  });

  test('rechaza una variante match con pair no-tuple ubicando el índice', () => {
    const result = validateOne({
      id: 'preposiciones-badpair',
      type: 'match',
      categoryIds: ['preposiciones'],
      explanation: 'Regla.',
      variants: [
        { prompt: 'Empareja.', pairs: [['a + il', 'al'], 'no-soy-tuple'] }
      ]
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /variants\[0\]/.test(e.reason)),
      `Se esperaba un error ubicando variants[0]: ${JSON.stringify(result.errors)}`
    );
  });

  test('rechaza payload Y variants[] simultáneos', () => {
    const result = validateOne({
      id: 'preposiciones-both',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Regla.',
      payload: { prompt: 'Vado ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 0 },
      variants: [
        { prompt: 'Vado ___ Italia.', options: ['in', 'a', 'da'], correctIndex: 0 }
      ]
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /payload/.test(e.reason) && /variants/.test(e.reason)),
      `Se esperaba un error mencionando "payload" y "variants": ${JSON.stringify(result.errors)}`
    );
  });

  test('rechaza variants[] presente pero sin explanation top-level (SLOT-02)', () => {
    const result = validateOne({
      id: 'preposiciones-noexpl',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      variants: [
        { prompt: 'Vado ___ Italia.', options: ['in', 'a', 'da'], correctIndex: 0 }
      ]
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /explanation/.test(e.reason)),
      `Se esperaba un error sobre explanation a nivel de slot: ${JSON.stringify(result.errors)}`
    );
  });

  test('rechaza un ejercicio sin payload NI variants[]', () => {
    const result = validateOne({
      id: 'preposiciones-neither',
      type: 'multiple-choice',
      categoryIds: ['preposiciones']
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /payload/.test(e.reason) && /variants/.test(e.reason)),
      `Se esperaba un error mencionando "payload" o "variants": ${JSON.stringify(result.errors)}`
    );
  });

  // ── D-08: acumula errores sin early-return ──────────────────────────────────

  test('D-08: dos variantes inválidas acumulan AMBOS errores (no early-return)', () => {
    const result = validateOne({
      id: 'preposiciones-twoerrors',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Regla.',
      variants: [
        { prompt: 'sin hueco', options: ['in', 'a', 'da'], correctIndex: 99 },
        { prompt: 'Vivo ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 88 }
      ]
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /variants\[0\]/.test(e.reason)),
      `Falta error de variants[0]: ${JSON.stringify(result.errors)}`
    );
    assert.ok(
      result.errors.some(e => /variants\[1\]/.test(e.reason)),
      `Falta error de variants[1]: ${JSON.stringify(result.errors)}`
    );
  });

  test('no lanza nunca con un slot malformado (variants no-array)', () => {
    assert.doesNotThrow(() => {
      const result = validateOne({
        id: 'preposiciones-notarray',
        type: 'multiple-choice',
        categoryIds: ['preposiciones'],
        explanation: 'Regla.',
        variants: 'no-soy-array'
      });
      assert.equal(result.ok, false);
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/content-loader — normalizeExerciseToSlot (función pura)
// ────────────────────────────────────────────────────────────────────────────

describe('data/content-loader — normalizeExerciseToSlot', () => {
  test('normaliza un legacy word-buttons a slot de 1 con explanation desde payload.explanation', () => {
    const ex = {
      id: 'preposiciones-legacy',
      type: 'word-buttons',
      categoryIds: ['preposiciones'],
      payload: {
        prompt: 'Voy a casa.',
        answer: ['vado', 'a', 'casa'],
        distractors: ['in'],
        explanation: 'Regla legacy.'
      }
    };
    const slot = normalizeExerciseToSlot(ex);
    assert.equal(slot.id, 'preposiciones-legacy');
    assert.equal(slot.type, 'word-buttons');
    assert.deepEqual(slot.categoryIds, ['preposiciones']);
    assert.equal(slot.explanation, 'Regla legacy.');
    assert.equal(slot.variants.length, 1);
    assert.equal(slot.variants[0].prompt, 'Voy a casa.');
    assert.deepEqual(slot.variants[0].answer, ['vado', 'a', 'casa']);
    assert.deepEqual(slot.variants[0].distractors, ['in']);
    // La variante NO lleva explanation propia (vive a nivel de slot, D-15-02).
    assert.equal(slot.variants[0].explanation, undefined);
  });

  test('legacy sin payload.explanation produce slot.explanation === null', () => {
    const ex = {
      id: 'preposiciones-legacy-noexpl',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Vado ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 0 }
    };
    const slot = normalizeExerciseToSlot(ex);
    assert.equal(slot.explanation, null);
    assert.equal(slot.variants.length, 1);
    assert.deepEqual(slot.variants[0].options, ['a', 'in', 'da']);
    assert.equal(slot.variants[0].correctIndex, 0);
  });

  test('legacy match normaliza pairs a la variante plana', () => {
    const ex = {
      id: 'preposiciones-legacy-match',
      type: 'match',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Empareja.', pairs: [['a + il', 'al']] }
    };
    const slot = normalizeExerciseToSlot(ex);
    assert.equal(slot.variants.length, 1);
    assert.equal(slot.variants[0].prompt, 'Empareja.');
    assert.deepEqual(slot.variants[0].pairs, [['a + il', 'al']]);
  });

  test('un ejercicio con variants[] preserva sus variantes (passthrough a shape canónica)', () => {
    const ex = {
      id: 'preposiciones-001',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      explanation: 'Regla del slot.',
      variants: [
        { prompt: 'Vado ___ Italia.', options: ['in', 'a', 'da'], correctIndex: 0 },
        { prompt: 'Vivo ___ Roma.', options: ['a', 'in', 'da'], correctIndex: 0 }
      ]
    };
    const slot = normalizeExerciseToSlot(ex);
    assert.equal(slot.id, 'preposiciones-001');
    assert.equal(slot.explanation, 'Regla del slot.');
    assert.equal(slot.variants.length, 2);
    assert.deepEqual(slot.variants, ex.variants);
  });

  test('es PURA: no muta el ejercicio original ni su payload', () => {
    const ex = {
      id: 'preposiciones-legacy',
      type: 'word-buttons',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Voy a casa.', answer: ['vado', 'a', 'casa'], explanation: 'Regla.' }
    };
    const snapshot = JSON.stringify(ex);
    normalizeExerciseToSlot(ex);
    assert.equal(JSON.stringify(ex), snapshot, 'normalizeExerciseToSlot NO debe mutar el argumento');
  });
});
