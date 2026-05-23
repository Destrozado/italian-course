// tests/exercise-types.test.js
//
// Tests del registry + handlers de exercise-types + payload validators extendidos.
// Cobertura específica para Phase 3 plan 01: word-buttons.grade (case-insensitive
// D-67, distractoras, orden, longitud), registry shape con word-buttons + match
// stub, y validador dispatch-table con stub estable para match (B3 revisión
// iteración 1 — wording SIN referencia a plan ID).
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { wordButtons } from '../src/exercise-types/word-buttons.js';
import { registry } from '../src/exercise-types/index.js';
import { validateContent } from '../src/data/schema-validator.js';

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/word-buttons — grade() (D-64 payload, D-67 case-insensitive)
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/word-buttons', () => {
  test('grade returns true when tokens match answer exactly', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: ['io', 'ho'] }), true);
  });

  test('grade is case-insensitive on both sides (D-67)', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: ['IO', 'Ho'] }), true);
    assert.equal(wordButtons.grade(ex, { tokens: ['Io', 'HO'] }), true);
    // Y al revés: expected con mayúsculas y actual con minúsculas también funciona.
    const exMixed = { payload: { answer: ['Io', 'Ho'] } };
    assert.equal(wordButtons.grade(exMixed, { tokens: ['io', 'ho'] }), true);
  });

  test('grade returns false when order differs', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: ['ho', 'io'] }), false);
  });

  test('grade returns false when length differs (shorter)', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: ['io'] }), false);
  });

  test('grade returns false when length differs (longer)', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: ['io', 'ho', 'una'] }), false);
  });

  test('grade returns false when tokens is empty array', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    assert.equal(wordButtons.grade(ex, { tokens: [] }), false);
  });

  test('grade defensively handles missing response.tokens (defaults to [])', () => {
    const ex = { payload: { answer: ['io', 'ho'] } };
    // response.tokens === undefined → tratado como []. answer.length > 0 → false.
    assert.equal(wordButtons.grade(ex, {}), false);
  });

  test('grade returns true on exact 4-token match with NFC-normalised content', () => {
    // CONT-06: ambos lados ya están NFC-normalised al cargar. Aquí solo verificamos
    // la comparación case-insensitive sobre tokens de longitud 4.
    const ex = { payload: { answer: ['io', 'ho', 'una', 'macchina'] } };
    assert.equal(
      wordButtons.grade(ex, { tokens: ['io', 'ho', 'una', 'macchina'] }),
      true
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/index — registry (Phase 3 plan 01 añade word-buttons)
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/index — registry', () => {
  test('registry exposes word-buttons handler with grade()', () => {
    assert.ok(registry['word-buttons'], 'registry debería tener una entrada "word-buttons"');
    assert.equal(typeof registry['word-buttons'].grade, 'function');
    // Misma identidad que el módulo (registry agnóstico D-01).
    assert.equal(registry['word-buttons'], wordButtons);
  });

  test('registry preserves multiple-choice entry from Phase 1', () => {
    assert.ok(registry['multiple-choice'], 'multiple-choice no debería eliminarse');
    assert.equal(typeof registry['multiple-choice'].grade, 'function');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator — word-buttons payload (D-64)
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator — word-buttons payload', () => {
  const validCategories = [{ id: 'avere', name: 'Avere', order: 1 }];

  test('accepts a well-formed word-buttons exercise (happy path)', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-001',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: {
              prompt: 'Yo tengo.',
              answer: ['io', 'ho']
            }
          }
        ]
      }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('accepts a well-formed word-buttons exercise with distractors', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-002',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: {
              prompt: 'Yo tengo un coche.',
              answer: ['io', 'ho', 'una', 'macchina'],
              distractors: ['hai', 'sono']
            }
          }
        ]
      }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('rejects empty prompt', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-bad-prompt-empty',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: '', answer: ['io', 'ho'] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /prompt/.test(e.reason) && e.file === 'avere.json' && e.exerciseId === 'wb-bad-prompt-empty'),
      `Esperaba error con prompt en file/exerciseId; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects non-string prompt', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-bad-prompt-num',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: 42, answer: ['io', 'ho'] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /prompt/.test(e.reason) && e.exerciseId === 'wb-bad-prompt-num'),
      `Esperaba error sobre prompt no-string; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects non-array answer', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-answer-not-array',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: 'Yo tengo.', answer: 'io ho' }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /answer/.test(e.reason) && e.exerciseId === 'wb-answer-not-array'),
      `Esperaba error sobre answer no-array; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects empty answer array', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-answer-empty',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: 'Yo tengo.', answer: [] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /answer/.test(e.reason) && e.exerciseId === 'wb-answer-empty'),
      `Esperaba error sobre answer vacío; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects answer with empty token', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-answer-empty-token',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: 'Yo tengo.', answer: ['io', ''] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /answer/.test(e.reason) && e.exerciseId === 'wb-answer-empty-token'),
      `Esperaba error sobre token vacío en answer; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects answer with non-string token', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-answer-num-token',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: { prompt: 'Yo tengo.', answer: ['io', 42] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /answer/.test(e.reason) && e.exerciseId === 'wb-answer-num-token'),
      `Esperaba error sobre token no-string en answer; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects distractors with empty entry', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-distractors-empty',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: {
              prompt: 'Yo tengo.',
              answer: ['io', 'ho'],
              distractors: ['hai', '']
            }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /distractors/.test(e.reason) && e.exerciseId === 'wb-distractors-empty'),
      `Esperaba error sobre distractors con entrada vacía; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects non-array distractors when present', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-distractors-not-array',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: {
              prompt: 'Yo tengo.',
              answer: ['io', 'ho'],
              distractors: 'hai sono'
            }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /distractors/.test(e.reason) && e.exerciseId === 'wb-distractors-not-array'),
      `Esperaba error sobre distractors no-array; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('accumulates multiple errors in a single pass (D-08 invariante)', () => {
    // Un único ejercicio con varios errores en su payload — el validator NO debe
    // hacer early-return tras el primero. Debe acumular TODOS y devolverlos.
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'wb-multi-bad',
            type: 'word-buttons',
            categoryIds: ['avere'],
            payload: {
              prompt: '', // bad
              answer: [], // bad
              distractors: ['ok', ''] // bad
            }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/prompt/.test(reasons), `falta error de prompt: ${reasons}`);
    assert.ok(/answer/.test(reasons), `falta error de answer: ${reasons}`);
    assert.ok(/distractors/.test(reasons), `falta error de distractors: ${reasons}`);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator — dispatch table behaviour (type desconocido / match stub)
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator — type unknown dispatch', () => {
  test('rejects unknown type with message that lists supported types', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'avere.json': [
          {
            id: 'foo-ex',
            type: 'foo',
            categoryIds: ['avere'],
            payload: {}
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    // El mensaje debe citar los 3 tipos soportados (esperado: ...).
    const err = result.errors.find(e => e.exerciseId === 'foo-ex' && /no soportado/.test(e.reason));
    assert.ok(err, `Esperaba error sobre type desconocido; errores: ${JSON.stringify(result.errors)}`);
    assert.ok(/multiple-choice/.test(err.reason), `mensaje debe citar multiple-choice: "${err.reason}"`);
    assert.ok(/word-buttons/.test(err.reason), `mensaje debe citar word-buttons: "${err.reason}"`);
    assert.ok(/match/.test(err.reason), `mensaje debe citar match: "${err.reason}"`);
  });
});

describe('data/schema-validator — match stub', () => {
  test('match type emits stable stub message without plan ID reference (B3 revisión iteración 1)', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'avere.json': [
          {
            id: 'match-stub',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'Empareja.', pairs: [['casa', 'la']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    // B3 revisión iteración 1: el wording es LITERAL, estable, SIN sufijo de planificación.
    const stubErr = result.errors.find(e => e.exerciseId === 'match-stub');
    assert.ok(stubErr, `Esperaba un error para el match stub; errores: ${JSON.stringify(result.errors)}`);
    assert.equal(
      stubErr.reason,
      'type "match" aún no soportado',
      `Mensaje stub debe ser exactamente 'type "match" aún no soportado' (sin "en este plan", sin "03-02"). Actual: "${stubErr.reason}"`
    );
    // Y no debe contener referencias a plan ID en el mensaje.
    assert.equal(/03-02|en este plan/.test(stubErr.reason), false,
      `Mensaje stub NO debe mencionar plan ID. Actual: "${stubErr.reason}"`);
  });
});
