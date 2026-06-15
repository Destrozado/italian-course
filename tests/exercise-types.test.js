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

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { wordButtons } from '../src/exercise-types/word-buttons.js';
import { match } from '../src/exercise-types/match.js';
import { registry } from '../src/exercise-types/index.js';
import { validateContent } from '../src/data/schema-validator.js';
import { deriveStatus } from '../src/data/validation-state.js';

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

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/match — grade() (D-65 payload, D-66 duplicados, D-67 case-insensitive)
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/match', () => {
  test('grade returns {correct: true, pairIdx: 0} when matched pair is first', () => {
    const ex = { payload: { pairs: [['casa', 'la'], ['libro', 'il']] } };
    const result = match.grade(ex, { leftWord: 'casa', rightWord: 'la', consumedPairIdx: [] });
    assert.deepEqual(result, { correct: true, pairIdx: 0 });
  });

  test('grade returns {correct: false} when pair is wrong (no pairIdx field)', () => {
    const ex = { payload: { pairs: [['casa', 'la'], ['libro', 'il']] } };
    const result = match.grade(ex, { leftWord: 'casa', rightWord: 'il', consumedPairIdx: [] });
    assert.equal(result.correct, false);
    // El campo `pairIdx` NO debe aparecer cuando es incorrecto (coherente con
    // RESEARCH.md Pattern 7 — la ausencia del campo es la señal de "no match").
    assert.equal('pairIdx' in result, false,
      `correct:false NO debe incluir pairIdx; recibido: ${JSON.stringify(result)}`);
  });

  test('grade is case-insensitive on both sides (D-67)', () => {
    const ex = { payload: { pairs: [['CASA', 'LA']] } };
    const result = match.grade(ex, { leftWord: 'casa', rightWord: 'la', consumedPairIdx: [] });
    assert.deepEqual(result, { correct: true, pairIdx: 0 });
    // Y al revés: payload minúsculas y response mayúsculas.
    const ex2 = { payload: { pairs: [['casa', 'la']] } };
    assert.deepEqual(
      match.grade(ex2, { leftWord: 'CASA', rightWord: 'LA', consumedPairIdx: [] }),
      { correct: true, pairIdx: 0 }
    );
  });

  test('D-66 duplicados — consumedPairIdx skip primer pair y matchea el segundo', () => {
    // Dos pares con derecha 'la' duplicada. El primer match consume idx 0.
    // El segundo intento con consumedPairIdx:[0] debe matchear pair 1 (porta-la).
    const ex = { payload: { pairs: [['casa', 'la'], ['porta', 'la']] } };
    const first = match.grade(ex, { leftWord: 'casa', rightWord: 'la', consumedPairIdx: [] });
    assert.deepEqual(first, { correct: true, pairIdx: 0 });
    const second = match.grade(ex, { leftWord: 'porta', rightWord: 'la', consumedPairIdx: [0] });
    assert.deepEqual(second, { correct: true, pairIdx: 1 });
  });

  test('D-66 orden inverso — porta con la matchea pair[1] (no pair[0])', () => {
    // El grading busca el PRIMER pair libre que coincide AMBOS lados textualmente
    // (NO solo la derecha). 'porta'+'la' no matchea pair 0 (izq es 'casa'), pero
    // sí matchea pair 1.
    const ex = { payload: { pairs: [['casa', 'la'], ['porta', 'la']] } };
    const result = match.grade(ex, { leftWord: 'porta', rightWord: 'la', consumedPairIdx: [] });
    assert.deepEqual(result, { correct: true, pairIdx: 1 });
  });

  test('índice consumido se ignora (no quedan pairs libres → correct false)', () => {
    const ex = { payload: { pairs: [['casa', 'la']] } };
    const result = match.grade(ex, { leftWord: 'casa', rightWord: 'la', consumedPairIdx: [0] });
    assert.equal(result.correct, false);
    assert.equal('pairIdx' in result, false);
  });

  test('response sin consumedPairIdx → tratado como [] (defensivo)', () => {
    const ex = { payload: { pairs: [['casa', 'la']] } };
    const result = match.grade(ex, { leftWord: 'casa', rightWord: 'la' });
    assert.deepEqual(result, { correct: true, pairIdx: 0 });
  });

  test('match.grade puro — invocaciones repetidas con mismos args son deterministas', () => {
    // La idempotencia de applyImmediateFailure NO está aquí (vive en el caller
    // `matchPickRight` con el guard `matchHadFailure`). Aquí solo verificamos
    // que el handler puro es referentially transparent.
    const ex = { payload: { pairs: [['a', 'b'], ['c', 'd']] } };
    const result1 = match.grade(ex, { leftWord: 'a', rightWord: 'd', consumedPairIdx: [] });
    const result2 = match.grade(ex, { leftWord: 'a', rightWord: 'd', consumedPairIdx: [] });
    assert.deepEqual(result1, { correct: false });
    assert.deepEqual(result2, { correct: false });
    assert.deepEqual(result1, result2);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/index — registry final con 3 entradas (Phase 3 plan 02)
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/index — registry final con 3 entradas', () => {
  test('registry expone los 3 tipos finales con identidades correctas', () => {
    assert.ok(registry['multiple-choice'], 'registry debería tener "multiple-choice"');
    assert.ok(registry['word-buttons'], 'registry debería tener "word-buttons"');
    assert.ok(registry['match'], 'registry debería tener "match"');
    assert.equal(registry['word-buttons'], wordButtons);
    assert.equal(registry['match'], match);
    assert.equal(typeof registry['match'].grade, 'function');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator — match payload (D-65 schema)
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator — match payload', () => {
  const validCategories = [{ id: 'avere', name: 'Avere', order: 1 }];

  test('accepts a well-formed match exercise (happy path)', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-001',
            type: 'match',
            categoryIds: ['avere'],
            payload: {
              prompt: 'Empareja sustantivo con artículo.',
              pairs: [['a', 'b'], ['c', 'd']]
            }
          }
        ]
      }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('rejects empty prompt', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-bad-prompt',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: '', pairs: [['a', 'b'], ['c', 'd']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /prompt/.test(e.reason) && e.exerciseId === 'm-bad-prompt'),
      `Esperaba error sobre prompt; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects non-string prompt', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-prompt-num',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 42, pairs: [['a', 'b'], ['c', 'd']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /prompt/.test(e.reason) && e.exerciseId === 'm-prompt-num'),
      `Esperaba error sobre prompt; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects non-array pairs', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-pairs-not-array',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: 'not-array' }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-pairs-not-array'),
      `Esperaba error sobre pairs no-array; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pairs with length < 2', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-pairs-too-few',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-pairs-too-few'),
      `Esperaba error sobre length < 2; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pairs with length > 10', () => {
    const tooMany = [];
    for (let i = 0; i < 11; i++) tooMany.push([`l${i}`, `r${i}`]);
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-pairs-too-many',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: tooMany }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-pairs-too-many'),
      `Esperaba error sobre length > 10; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pair that is not an array', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-pair-not-array',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b'], 'oops'] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-pair-not-array'),
      `Esperaba error sobre pair no-array; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pair with length !== 2', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-pair-len-1',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b'], ['c']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-pair-len-1'),
      `Esperaba error sobre pair length 1; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pair with empty string at [0]', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-empty-left',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b'], ['', 'd']] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-empty-left'),
      `Esperaba error sobre [0] vacío; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('rejects pair with non-string at [1]', () => {
    const result = validateContent({
      categories: validCategories,
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-num-right',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b'], ['c', 42]] }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /pairs/.test(e.reason) && e.exerciseId === 'm-num-right'),
      `Esperaba error sobre [1] no-string; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('el mensaje stub previo "aún no soportado" ya NO aparece para match (impl real reemplaza al stub)', () => {
    // Acceptance criterion explícito del plan 03-02: el stub de 03-01 ya
    // NO debe estar presente. Un payload match válido pasa sin error;
    // un payload match malformado emite errores ESPECÍFICOS (no el genérico
    // "type \"match\" aún no soportado").
    const validResult = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-now-works',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: [['a', 'b'], ['c', 'd']] }
          }
        ]
      }
    });
    assert.equal(validResult.ok, true,
      `match válido no debería emitir errores; errores: ${JSON.stringify(validResult.errors)}`);
    // Y un match malformado no emite el stub message:
    const badResult = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'avere.json': [
          {
            id: 'm-bad',
            type: 'match',
            categoryIds: ['avere'],
            payload: { prompt: 'p', pairs: 'oops' }
          }
        ]
      }
    });
    assert.equal(badResult.ok, false);
    const stubMessage = badResult.errors.find(e => /aún no soportado/.test(e.reason));
    assert.equal(stubMessage, undefined,
      `El mensaje stub no debe estar presente; errores: ${JSON.stringify(badResult.errors)}`);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// appShell.matchPickRight — D-61 idempotencia (W3 revisión iteración 1)
// ────────────────────────────────────────────────────────────────────────────

describe('appShell.matchPickRight — D-61 idempotencia (W3)', () => {
  // W3 revisión iteración 1: el factory `appShell` no es trivialmente
  // instanciable bajo node sin Alpine (depende de getters reactivos y
  // referencias al `content`/`state` ya cargados via Promise-handoff).
  // Estrategia adoptada (documentada en plan 03-02): PROXY canónico por
  // inspección textual del código fuente — verifica que el guard
  // `if (!this.matchHadFailure)` está presente en `matchPickRight` antes
  // del call-site de `applyImmediateFailure`. Robusto a refactors: si
  // alguien quitase el guard, los tests fallan. Cumple T-03-02-03 mitigate
  // del threat model; UAT humano paso 8 (03-03) cierra el gap residual de
  // verificación behavioural mid-sesión.
  //
  // Estos tests se SKIPpean condicionalmente cuando `matchPickRight` aún
  // no existe en `src/screens/app.js` (Task 1 → Task 2 transición). En
  // cuanto Task 2 añade el método y su guard, los tests se activan
  // automáticamente sin tener que editar el archivo de tests.

  function matchPickRightExists() {
    try {
      const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
      return src.includes('matchPickRight(');
    } catch {
      return false;
    }
  }

  const skipReason = matchPickRightExists()
    ? false
    : 'matchPickRight aún no existe en src/screens/app.js — los tests W3 se activan cuando Task 2 del plan 03-02 añade el método (presence-of-source check, no behavioural).';

  test('guard `if (!this.matchHadFailure)` está presente antes del call-site de applyImmediateFailure en matchPickRight', { skip: skipReason }, () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    const mprIdx = src.indexOf('matchPickRight(');
    assert.ok(mprIdx > -1, 'matchPickRight debe existir en app.js');
    const tail = src.slice(mprIdx);
    // El guard `if (!this.matchHadFailure)` debe aparecer entre la declaración
    // del método y el siguiente método. Buscamos hasta 4000 chars (margen).
    const window = tail.slice(0, 4000);
    assert.match(window, /if \(!this\.matchHadFailure\)\s*\{/,
      `Guard 'if (!this.matchHadFailure) {' debe estar en matchPickRight (Pitfall #2 D-61).`);
    // Y el call-site de applyImmediateFailure debe vivir dentro de ese mismo guard.
    assert.match(window, /applyImmediateFailure\(this\.state/,
      'applyImmediateFailure(this.state, ...) debe estar dentro de matchPickRight');
  });

  test('el archivo src/screens/app.js contiene EXACTAMENTE 2 call-sites de applyImmediateFailure (decisión final + primer-fallo-match)', { skip: skipReason }, () => {
    // Acceptance criterion del plan 03-02: arquitectura clara, 2 call-sites
    // (uno en applyResultToSession Phase 3 plan 01 + otro en matchPickRight
    // con guard). Cualquier desviación de 2 indica una regresión.
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    const matches = src.match(/applyImmediateFailure\(this\.state/g) || [];
    assert.equal(matches.length, 2,
      `Se esperan EXACTAMENTE 2 call-sites de applyImmediateFailure(this.state, ...); encontrados: ${matches.length}.`);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// appShell match handlers — smoke (W5 revisión iteración 1)
// ────────────────────────────────────────────────────────────────────────────

describe('appShell match handlers — smoke (W5)', () => {
  // W5 revisión iteración 1: el factory `appShell` toma una Promise
  // `appDataReady` y depende de `await` en `init()`; aunque se podría
  // instanciar sin Alpine pasándole una Promise resuelta mock, los getters
  // reactivos (`sessionCurrentExercise`, `bankWithKeys`) y handlers acceden
  // a `this.content`/`this.state` que tendrían que estar populados con
  // shapes precisos. Setup pesado y frágil — aceptado como gap en el plan
  // (UAT humano paso 4-8 del 03-03 valida UI behaviors mid-sesión).
  //
  // Estrategia adoptada: verificación textual de presencia de los métodos
  // clave en `src/screens/app.js`. Si alguien quitase/renombrase un método
  // o introdujese una regresión a la rama match de `handleSessionKey`, este
  // test falla. Es la garantía estructural mínima que el plan exige (W5
  // skip + grep es aceptable y documentado).

  test('matchSelectLeft, matchPickRight, flashMatchPair, helpers de consumed están presentes en app.js', () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    assert.ok(src.includes('matchSelectLeft('),
      'matchSelectLeft debe estar definido en app.js');
    assert.ok(src.includes('matchPickRight('),
      'matchPickRight debe estar definido en app.js');
    assert.ok(src.includes('flashMatchPair('),
      'flashMatchPair debe estar definido en app.js');
    assert.ok(src.includes('matchLeftIsConsumed('),
      'matchLeftIsConsumed debe estar definido en app.js');
    assert.ok(src.includes('matchRightIsConsumed('),
      'matchRightIsConsumed debe estar definido en app.js');
    assert.ok(src.includes('letterFor('),
      'letterFor debe estar definido en app.js');
  });

  test('rama match en handleSessionKey cubre dígitos 1-9 (matchSelectLeft) Y letras a-i (matchPickRight)', () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    // Localiza el bloque handleSessionKey y verifica que tiene ambas ramas.
    const handlerIdx = src.indexOf('handleSessionKey(event)');
    assert.ok(handlerIdx > -1, 'handleSessionKey debe existir en app.js');
    const handlerBody = src.slice(handlerIdx, handlerIdx + 8000); // margen generoso
    // Rama dígitos para match (matchSelectLeft via dígito).
    assert.match(handlerBody, /matchSelectLeft\(idx\)/,
      'handleSessionKey debe invocar matchSelectLeft(idx) en la rama dígitos para match');
    // Rama letras a-i.
    assert.match(handlerBody, /key >= 'a' && key <= 'i'/,
      'handleSessionKey debe tener una rama de letras a-i');
    assert.match(handlerBody, /matchPickRight\(idx\)/,
      'handleSessionKey debe invocar matchPickRight(idx) en la rama letras');
  });

  test('initSubStateForExercise tiene rama match con shuffle de ambas columnas (D-62)', () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    const initIdx = src.indexOf('initSubStateForExercise(exercise)');
    assert.ok(initIdx > -1, 'initSubStateForExercise debe existir en app.js');
    const initBody = src.slice(initIdx, initIdx + 3000);
    assert.match(initBody, /exercise\.type === 'match'/,
      'initSubStateForExercise debe tener una rama para exercise.type === "match"');
    assert.match(initBody, /this\.matchLeft\s*=\s*fisherYates/,
      'initSubStateForExercise debe barajar matchLeft con fisherYates (D-62)');
    assert.match(initBody, /this\.matchRight\s*=\s*fisherYates/,
      'initSubStateForExercise debe barajar matchRight con fisherYates (D-62)');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator — payload.explanation (Phase 7 plan 01, D-116 / EXPL-01)
//
// Regla uniforme cross-3-types: `payload.explanation` es opcional; si está
// presente, debe ser string no vacío. Si está ausente, back-compat con los 271
// ejercicios pre-Phase-7.
//
// Cubre 4 sub-cases × 3 tipos = 12 tests:
//   - accepts sin explanation (back-compat)
//   - accepts string válido
//   - rejects no-string (number)
//   - rejects string vacío (whitespace puro)
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator — payload.explanation (Phase 7 D-116)', () => {
  const validCategories = [{ id: 'avere', name: 'Avere', order: 1 }];
  const validPayloadByType = {
    'multiple-choice': { prompt: 'Hello ___ world', options: ['a', 'b', 'c'], correctIndex: 0 },
    'word-buttons':    { prompt: 'Hello world', answer: ['a', 'b'] },
    'match':           { prompt: 'Match', pairs: [['a', 'x'], ['b', 'y']] }
  };

  for (const type of ['multiple-choice', 'word-buttons', 'match']) {
    test(`${type}: accepts exercise WITHOUT explanation (back-compat)`, () => {
      const result = validateContent({
        categories: validCategories,
        exercisesByFile: {
          'avere.json': [{
            id: `expl-${type}-omitted`,
            type,
            categoryIds: ['avere'],
            payload: validPayloadByType[type]
          }]
        }
      });
      assert.equal(result.ok, true, JSON.stringify(result.errors));
    });

    test(`${type}: accepts exercise WITH explanation string`, () => {
      const result = validateContent({
        categories: validCategories,
        exercisesByFile: {
          'avere.json': [{
            id: `expl-${type}-string`,
            type,
            categoryIds: ['avere'],
            payload: { ...validPayloadByType[type], explanation: 'Esta es una regla didactica.' }
          }]
        }
      });
      assert.equal(result.ok, true, JSON.stringify(result.errors));
    });

    test(`${type}: rejects explanation non-string (number)`, () => {
      const result = validateContent({
        categories: validCategories,
        exercisesByFile: {
          'avere.json': [{
            id: `expl-${type}-num`,
            type,
            categoryIds: ['avere'],
            payload: { ...validPayloadByType[type], explanation: 42 }
          }]
        }
      });
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some(e => /explanation/.test(e.reason) && e.exerciseId === `expl-${type}-num`),
        `Esperaba error sobre explanation; errores: ${JSON.stringify(result.errors)}`
      );
    });

    test(`${type}: rejects explanation empty string`, () => {
      const result = validateContent({
        categories: validCategories,
        exercisesByFile: {
          'avere.json': [{
            id: `expl-${type}-empty`,
            type,
            categoryIds: ['avere'],
            payload: { ...validPayloadByType[type], explanation: '   ' }
          }]
        }
      });
      assert.equal(result.ok, false);
      assert.ok(
        result.errors.some(e => /explanation/.test(e.reason) && e.exerciseId === `expl-${type}-empty`),
        `Esperaba error sobre explanation vacío; errores: ${JSON.stringify(result.errors)}`
      );
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 9 D-VAL-08 — Validation field (top-level opcional)
// ────────────────────────────────────────────────────────────────────────────
//
// Cobertura del nuevo validator `validateValidationShape` (top-level del
// ejercicio, NO payload). Reglas:
//   - Campo ausente = aceptado (back-compat con los 271 ejercicios actuales)
//   - status whitelist: pending | validated | disputed
//   - passes[] array con entries {by, date, verdict, concerns?}
//   - by string no vacío; date ISO YYYY-MM-DD; verdict whitelist correcta|incorrecta;
//     concerns (si presente) array de strings
//
// Mensajes en español (FOUND-04).

describe('data/schema-validator — validation field (Phase 9 D-VAL-08)', () => {
  const validCategories = [{ id: 'avere', name: 'Avere', order: 1 }];
  const baseExercise = {
    id: 'val-test-001',
    type: 'multiple-choice',
    categoryIds: ['avere'],
    payload: { prompt: 'Io ___ una macchina.', options: ['ho', 'hai', 'ha', 'abbiamo'], correctIndex: 0 }
  };
  const validatePayload = (ex) => validateContent({
    categories: validCategories,
    exercisesByFile: { 'avere.json': [ex] }
  });

  test('1. ejercicio SIN campo validation → ok (back-compat 271 actuales)', () => {
    const result = validatePayload({ ...baseExercise });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('2. validation no-objeto (string / array / null) → error', () => {
    for (const bad of ['not-an-object', ['array'], null]) {
      const result = validatePayload({ ...baseExercise, validation: bad });
      assert.equal(result.ok, false, `Esperaba fail con validation=${JSON.stringify(bad)}`);
      assert.ok(
        result.errors.some(e => /validation/.test(e.reason) && /objeto/.test(e.reason)),
        `Esperaba error sobre validation no-objeto; errores: ${JSON.stringify(result.errors)}`
      );
    }
  });

  test('3. validation.status fuera de whitelist → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: { status: 'invalid-status', passes: [] }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /validation\.status/.test(e.reason) && /pending|validated|disputed/.test(e.reason)),
      `Esperaba error sobre validation.status con whitelist; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('4. validation.status faltante → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: { passes: [] }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /validation\.status/.test(e.reason)),
      `Esperaba error sobre validation.status faltante; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('5. validation.passes no-array → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: { status: 'pending', passes: 'not-an-array' }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /validation\.passes/.test(e.reason) && /array/.test(e.reason)),
      `Esperaba error sobre validation.passes no-array; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('6. passes[0].by no-string o vacío → error', () => {
    for (const badBy of [42, '', '   ', null, undefined]) {
      const result = validatePayload({
        ...baseExercise,
        validation: {
          status: 'pending',
          passes: [{ by: badBy, date: '2026-05-26', verdict: 'correcta' }]
        }
      });
      assert.equal(result.ok, false, `Esperaba fail con by=${JSON.stringify(badBy)}`);
      assert.ok(
        result.errors.some(e => /passes\[0\]\.by/.test(e.reason)),
        `Esperaba error sobre passes[0].by; errores: ${JSON.stringify(result.errors)}`
      );
    }
  });

  test('7. passes[0].date sin formato ISO YYYY-MM-DD → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'pending',
        passes: [{ by: 'claude-opus-4-7', date: '26/05/2026', verdict: 'correcta' }]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /passes\[0\]\.date/.test(e.reason) && /ISO|YYYY-MM-DD/.test(e.reason)),
      `Esperaba error sobre passes[0].date formato ISO; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('8. passes[0].verdict fuera de whitelist → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'pending',
        passes: [{ by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'tal-vez' }]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /passes\[0\]\.verdict/.test(e.reason) && /correcta|incorrecta/.test(e.reason)),
      `Esperaba error sobre passes[0].verdict con whitelist; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('9. passes[0].concerns no-array o con non-string → error', () => {
    // No-array
    let result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'pending',
        passes: [{ by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta', concerns: 'not-array' }]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /passes\[0\]\.concerns/.test(e.reason)),
      `Esperaba error sobre passes[0].concerns no-array; errores: ${JSON.stringify(result.errors)}`
    );
    // Array con elemento non-string
    result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'pending',
        passes: [{ by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta', concerns: ['ok', 42] }]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /passes\[0\]\.concerns/.test(e.reason)),
      `Esperaba error sobre passes[0].concerns con non-string; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('10. happy-path: status validated + 2 passes correctas distintas → ok', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'validated',
        passes: [
          { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
          { by: 'claude-sonnet-4-6', date: '2026-05-26', verdict: 'correcta' }
        ]
      }
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('11. passes[] vacío con status pending → ok (estado inicial legítimo)', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: { status: 'pending', passes: [] }
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('12. passes[0] no-objeto → error', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: { status: 'pending', passes: ['not-an-object'] }
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.errors.some(e => /passes\[0\]/.test(e.reason) && /objeto/.test(e.reason)),
      `Esperaba error sobre passes[0] no-objeto; errores: ${JSON.stringify(result.errors)}`
    );
  });

  test('13. concerns con array de strings válidos (happy-path opcional) → ok', () => {
    const result = validatePayload({
      ...baseExercise,
      validation: {
        status: 'disputed',
        passes: [
          { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'incorrecta', concerns: ['[C5-leak] el prompt filtra la regla'] }
        ]
      }
    });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 9 D-VAL-07 — deriveStatus(passes[]) sticky disputed
// ────────────────────────────────────────────────────────────────────────────
//
// Reglas estrictas D-VAL-07:
//   - CUALQUIER verdict === 'incorrecta' → 'disputed' (sticky, no self-heal)
//   - ≥2 correctas con `by` distintos (Set size ≥2) → 'validated'
//   - Otro caso (defensive null, array vacío, 1 pase, mismo by) → 'pending'

describe('validation-state — deriveStatus (Phase 9 D-VAL-07)', () => {
  test('1. undefined → pending (defensive — passes ausente)', () => {
    assert.equal(deriveStatus(undefined), 'pending');
  });

  test('2. null → pending (defensive)', () => {
    assert.equal(deriveStatus(null), 'pending');
  });

  test('3. [] → pending (estado inicial legítimo)', () => {
    assert.equal(deriveStatus([]), 'pending');
  });

  test('4. 1 pase correcta → pending (1 < 2 quórum)', () => {
    assert.equal(
      deriveStatus([{ by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' }]),
      'pending'
    );
  });

  test('5. 2 pases correctas con MISMO by → pending (Set size 1 < 2)', () => {
    assert.equal(
      deriveStatus([
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' }
      ]),
      'pending'
    );
  });

  test('6. happy-path: 2 pases correctas con by DISTINTOS → validated', () => {
    assert.equal(
      deriveStatus([
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
        { by: 'claude-sonnet-4-6', date: '2026-05-26', verdict: 'correcta' }
      ]),
      'validated'
    );
  });

  test('7. 1 pase incorrecta → disputed (cualquier incorrecta gana)', () => {
    assert.equal(
      deriveStatus([{ by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'incorrecta' }]),
      'disputed'
    );
  });

  test('8. sticky disputed: 2 correctas + 1 incorrecta → disputed (no self-heal)', () => {
    assert.equal(
      deriveStatus([
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
        { by: 'claude-sonnet-4-6', date: '2026-05-26', verdict: 'correcta' },
        { by: 'gemini-2.5-pro', date: '2026-05-26', verdict: 'incorrecta' }
      ]),
      'disputed'
    );
  });

  test('9. defensive: entry sin by con verdict incorrecta → disputed (verdict gana)', () => {
    assert.equal(
      deriveStatus([
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
        { verdict: 'incorrecta' } // sin by, pero verdict dispara disputed
      ]),
      'disputed'
    );
  });

  test('10. input no-array (string, number, object) → pending', () => {
    assert.equal(deriveStatus('not-an-array'), 'pending');
    assert.equal(deriveStatus(42), 'pending');
    assert.equal(deriveStatus({ passes: [] }), 'pending');
  });

  test('11. 3 correctas con by distintos → validated (≥2 suficiente)', () => {
    assert.equal(
      deriveStatus([
        { by: 'claude-opus-4-7', date: '2026-05-26', verdict: 'correcta' },
        { by: 'claude-sonnet-4-6', date: '2026-05-26', verdict: 'correcta' },
        { by: 'autor', date: '2026-05-26', verdict: 'correcta' }
      ]),
      'validated'
    );
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 7.1 EXPL-08 — Smoke test parametrizado para coverage por categoría
// ────────────────────────────────────────────────────────────────────────────
// Array extensible: añadir 1 entry por categoría que tenga explanations
// completas. Plan 7.1-02 añadirá genero-numero. Phases 7.2..7.6 añadirán
// las restantes 5 categorías (Avere, Essere, Verbos-movimiento, Profesiones,
// Sustantivos-irregulares) si emerge dolor adicional.
//
// Cada categoría se verifica contra 3 invariantes editoriales (D-135/D-136/D-126):
//   1. coverage exacto (todos los ejercicios del archivo tienen explanation no vacía)
//   2. apóstrofes ASCII U+0027 (CONT-06 — anti smart-quote contamination)
//   3. plain text sin markdown markers (T-02-01 anti-XSS — los tokens **/__/##/` no se interpretan)

const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 50 },
  { file: 'content/exercises/genero-numero.json', expected: 12 },
  { file: 'content/exercises/avere.json', expected: 20 },
  { file: 'content/exercises/sustantivos-irregulares.json', expected: 5 },
  { file: 'content/exercises/verbos-movimiento.json', expected: 7 },
  { file: 'content/exercises/essere.json', expected: 26 },
  { file: 'content/exercises/profesiones.json', expected: 11 },
  { file: 'content/exercises/articoli.json', expected: 34 },
  { file: 'content/exercises/partitivos.json', expected: 19 },
  // Cobertura editorial: 370 con explanation curada tras el piloto v1.4 (Phase 17): Preposiciones pasó de 52 ejercicios a 49 slots (explanation a nivel de slot); las otras 8 categorías por ejercicio.
];

// Bifurcación por shape (PILOT-05 — listo para CONV-01, NO hardcodea slug):
//   slot   → ex.variants es Array. La explanation vive top-level (ex.explanation),
//            y cada variante aporta su propio prompt (ex.variants[].prompt).
//   legacy → ruta clásica payload (ex.payload.explanation / ex.payload.prompt).
// Estos accessors mantienen los escaneos de seguridad (R1/R2/smart-quotes/markdown)
// shape-agnostic: la cobertura editorial NO se pierde al convertir un shape.
const getExplanation = (ex) =>
  Array.isArray(ex.variants) ? ex.explanation : ex.payload?.explanation;
// Devuelve TODOS los prompts del ejercicio (1 en legacy, N en slot):
const getPrompts = (ex) =>
  Array.isArray(ex.variants)
    ? ex.variants.map(v => v?.prompt || '')
    : [ex.payload?.prompt || ''];

describe('Categorías con explanation coverage (Phase 7.1+)', () => {
  for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS) {
    describe(file, () => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const path = resolve(__dirname, '..', file);
      const data = JSON.parse(readFileSync(path, 'utf-8'));

      test(`${expected}/${expected} ejercicios con explanation válida`, () => {
        assert.equal(
          data.exercises.length,
          expected,
          `Esperaba ${expected} ejercicios en ${file}, encontré ${data.exercises.length}`
        );

        const missing = data.exercises.filter(ex => {
          const explanation = getExplanation(ex);
          return typeof explanation !== 'string' || !explanation.trim();
        });

        assert.equal(
          missing.length,
          0,
          `Ejercicios sin explanation válida en ${file}: ${missing.map(ex => ex.id).join(', ')}`
        );
      });

      test('apóstrofes ASCII (CONT-06 / D-129)', () => {
        const smartQuotePattern = /[‘’“”]/;
        const violations = data.exercises
          .filter(ex => smartQuotePattern.test(getExplanation(ex) || ''))
          .map(ex => ex.id);

        assert.equal(
          violations.length,
          0,
          `Smart quotes encontradas en ${file}: ${violations.join(', ')}`
        );
      });

      test('plain text (no markdown markers — D-126)', () => {
        // Tokens de markdown que romperían el render plain-text: ** (bold), __ (bold),
        // ## (header), backticks (inline code). Asteriscos sueltos en prosa son OK
        // (pueden aparecer como puntuación). Solo doblados o headers prefijo.
        const mdPattern = /(\*\*|__|##|`)/;
        const violations = data.exercises
          .filter(ex => mdPattern.test(getExplanation(ex) || ''))
          .map(ex => ex.id);

        assert.equal(
          violations.length,
          0,
          `Markdown markers encontradas en ${file}: ${violations.join(', ')}`
        );
      });

      // Authoring rule R1 — prompt nunca contiene la regla ni la solución (memory/exercise_authoring_rules.md)
      // Capturado post-v1.0 tras el bug "Una casa, due ___ (refuerzo regla §1 fem -a→-e)" — el alumno leía la respuesta.
      test('prompt sin leak de regla/solución (R1)', () => {
        // Patrones prohibidos en payload.prompt:
        //   §N        — refs a secciones del PDF
        //   (refuerzo / (regla / (combina / (grupo / (familia / (cuerpo / (animales / (lugares / (locución
        //   (D-NN     — refs a decisiones internas
        //   — regla / — atención / — sustantivo invariable / — artículo definido / — forma fem / — forma masc / — inserción / — concordancia / — patrón / — excepción
        const leakPattern = /§\d+|\((refuerzo|regla|combina|grupo|familia|cuerpo|animales|lugares|locución|D-\d+)\b|—\s*(regla|atención|sustantivo\s+invariable|artículo\s+definido|forma\s+(fem|masc)|inserción|concordancia|patrón|excepción)/i;
        const violations = data.exercises
          .flatMap(ex => getPrompts(ex).map(prompt => ({ ex, prompt })))
          .filter(({ prompt }) => leakPattern.test(prompt))
          .map(({ ex, prompt }) => `${ex.id}: "${prompt}"`);

        assert.equal(
          violations.length,
          0,
          `Prompts con leak de regla/solución en ${file}:\n  ${violations.join('\n  ')}\n\nVer memory/exercise_authoring_rules.md §R1.`
        );
      });

      // Authoring rule R2 — explanations nunca referencian otros ejercicios por ID interno (memory/exercise_authoring_rules.md)
      // Capturado post-v1.0 tras 19 explanations con "(#022/#028)" — jerga interna sin utilidad pedagógica.
      test('explanation sin cross-refs técnicos (R2)', () => {
        // Patrones prohibidos en payload.explanation:
        //   #NNN, (#NNN), (#NNN/#MMM)   — refs a ejercicios por ID interno
        //   mc-NNN, preposiciones-NNN   — IDs literales
        //   — ver #NNN, del #NNN        — frases con ref
        const xrefPattern = /#\d{3}\b|#[a-z]+-\d+|\bmc-\d+\b/i;
        const violations = data.exercises
          .filter(ex => xrefPattern.test(getExplanation(ex) || ''))
          .map(ex => `${ex.id}: ...${((getExplanation(ex) || '').match(/[^.]*#\S*[^.]*/) || [''])[0].trim()}...`);

        assert.equal(
          violations.length,
          0,
          `Explanations con cross-refs técnicos en ${file}:\n  ${violations.join('\n  ')}\n\nVer memory/exercise_authoring_rules.md §R2.`
        );
      });
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 9 VAL-07 — Smoke test paramétrico tras feature flag (Phase 10 close gate)
// ────────────────────────────────────────────────────────────────────────────
//
// D-VAL-17: durante Phase 9 el flag está OFF — los 271 ejercicios actuales NO
// tienen el campo `validation` aún, así que activar el test estricto los
// rompería y bloquearía el desarrollo de Phase 10.
//
// Al cierre de Phase 10 (los 271 validados 1-por-1 con quórum Opus+Sonnet) el
// autor invoca:
//
//   VAL_07_STRICT=1 node --test tests/*.test.js
//
// y este bloque pasa con 271/271 `validation.status === "validated"`.
//
// Patrón idiomático node:test 2026: lectura top-level de env var + describe
// con `{skip: condition}` option (NO `t.skip()` runtime — más imperativo,
// peor DX).
//
// D-VAL-18: reutiliza el array `CATEGORIES_WITH_EXPLANATIONS` (patrón D-144)
// — cero infra paralela.

const VAL_07_STRICT = process.env.VAL_07_STRICT === '1';

describe('VAL-07 — todos los ejercicios validated (Phase 10 close gate)', {
  skip: VAL_07_STRICT ? false : 'feature flag VAL_07_STRICT=1 no activado (esperado durante Phase 9)'
}, () => {
  for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS) {
    test(`${file} — todos los ejercicios con validation.status === "validated"`, () => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const data = JSON.parse(readFileSync(resolve(__dirname, '..', file), 'utf-8'));
      const notValidated = data.exercises.filter(ex => ex.validation?.status !== 'validated');
      assert.equal(
        notValidated.length,
        0,
        `${notValidated.length} ejercicios sin status "validated" en ${file}: ${notValidated.map(ex => `${ex.id}(${ex.validation?.status ?? 'absent'})`).join(', ')}`
      );
    });
  }
});

// ────────────────────────────────────────────────────────────────────────────
// quick-260615-hr0 — ver explicación al ACERTAR (feature todo #3)
//
// Patrón source-assert (mismo que W3/W5 arriba): leemos el TEXTO FUENTE de
// app.js y verificamos presencia/proximidad de los símbolos clave. NO se
// instancia Alpine (factory async + getters reactivos = setup frágil, gap
// aceptado y documentado en los tests existentes). El UAT humano valida el
// comportamiento visual mid-sesión.
// ────────────────────────────────────────────────────────────────────────────

describe('quick-260615-hr0: ver explicación al acertar', () => {
  const APP_SRC = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');

  test('la acción reveal cancela el auto-avance y pone sessionExplanationRevealed = true', () => {
    // Localiza el método reveal y verifica que en su cuerpo cancela el
    // auto-avance y setea el flag (revelar = parar el avance + mostrar).
    const idx = APP_SRC.indexOf('revealSessionExplanation(');
    assert.ok(idx > -1, 'revealSessionExplanation debe existir en app.js');
    const body = APP_SRC.slice(idx, idx + 600);
    assert.match(body, /this\.cancelAutoAdvance\(\)/,
      'revealSessionExplanation debe llamar a this.cancelAutoAdvance()');
    assert.match(body, /this\.sessionExplanationRevealed\s*=\s*true/,
      'revealSessionExplanation debe poner this.sessionExplanationRevealed = true');
    // Guard defensivo: solo en acierto.
    assert.match(body, /this\.sessionFeedback\s*!==\s*'correct'/,
      "revealSessionExplanation debe estar gated a sessionFeedback === 'correct'");
  });

  test('sessionAdvance resetea sessionExplanationRevealed a false (no se arrastra entre ejercicios)', () => {
    const idx = APP_SRC.indexOf('sessionAdvance() {');
    assert.ok(idx > -1, 'sessionAdvance debe existir en app.js');
    const body = APP_SRC.slice(idx, idx + 800);
    assert.match(body, /this\.sessionExplanationRevealed\s*=\s*false/,
      'sessionAdvance debe resetear this.sessionExplanationRevealed = false');
  });

  test('quick-260615-r3b (CAMBIO 1): el auto-avance al acertar está gated a cancion; ejercicios no programan auto-avance; el atajo `e` sigue gated a correct + explanation', () => {
    // Constante de canción conservada; la de explanation eliminada.
    assert.match(APP_SRC, /const\s+SESSION_AUTO_ADVANCE_MS\s*=\s*600/,
      'Debe existir la constante SESSION_AUTO_ADVANCE_MS = 600 (canción)');
    assert.doesNotMatch(APP_SRC, /SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS/,
      'La constante SESSION_AUTO_ADVANCE_WITH_EXPLANATION_MS debe estar eliminada (sin uso)');

    // En la rama de acierto de applyResultToSession el setTimeout/songAdvance
    // está gated a sessionMode === 'cancion'. Los ejercicios no programan avance.
    const idx = APP_SRC.indexOf('applyResultToSession(ex, correct, userAnswer) {');
    assert.ok(idx > -1, 'applyResultToSession debe existir como método en app.js');
    const body = APP_SRC.slice(idx, idx + 2000);
    const correctIdx = body.indexOf('if (correct) {');
    assert.ok(correctIdx > -1, 'applyResultToSession debe tener la rama if (correct)');
    const correctBlock = body.slice(correctIdx, body.indexOf('} else {', correctIdx));
    assert.match(correctBlock, /sessionMode === 'cancion'/,
      'la rama de acierto debe gatear el auto-avance a sessionMode === cancion');
    assert.match(correctBlock, /setTimeout\(\(\)\s*=>\s*this\.songAdvance\(\)\s*,\s*SESSION_AUTO_ADVANCE_MS\)/,
      'la canción conserva el auto-avance vía songAdvance + SESSION_AUTO_ADVANCE_MS');
    // No debe quedar ningún setTimeout hacia sessionAdvance en la rama de acierto
    // (los ejercicios avanzan manualmente con "Siguiente").
    assert.doesNotMatch(correctBlock, /setTimeout\([^)]*sessionAdvance/,
      'los ejercicios NO programan auto-avance hacia sessionAdvance en acierto');

    // El atajo de teclado / acción reveal está gated a acierto + explanation.
    const handlerIdx = APP_SRC.indexOf('handleSessionKey(event)');
    assert.ok(handlerIdx > -1, 'handleSessionKey debe existir en app.js');
    const handlerBody = APP_SRC.slice(handlerIdx, handlerIdx + 8000);
    assert.match(handlerBody, /key === 'e'/,
      'handleSessionKey debe tener el atajo de tecla `e`');
    assert.match(handlerBody, /this\.revealSessionExplanation\(\)/,
      'el atajo `e` debe invocar this.revealSessionExplanation()');
    // El gate `=== 'correct'` debe aparecer junto al atajo de la tecla `e`.
    const eIdx = handlerBody.indexOf("key === 'e'");
    const eBlock = handlerBody.slice(eIdx, eIdx + 400);
    assert.match(eBlock, /this\.sessionFeedback\s*===\s*'correct'/,
      "el atajo `e` debe estar gated a sessionFeedback === 'correct'");
    assert.match(eBlock, /explanation/,
      'el atajo `e` debe requerir que el ejercicio tenga explanation');
  });

  test('quick-260615-r3b (CAMBIO 1): el botón Siguiente de los 3 tipos usa x-show="sessionFeedback !== null"; la canción conserva incorrect + songAdvance', () => {
    const INDEX_SRC = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

    // Los 3 botones Siguiente de ejercicio (multi-choice, word-buttons, match)
    // se muestran SIEMPRE que haya feedback (acierto o fallo).
    const siguienteNull = (INDEX_SRC.match(/x-show="sessionFeedback !== null"/g) ?? []).length;
    assert.equal(siguienteNull, 3,
      'los 3 botones Siguiente de ejercicio usan x-show="sessionFeedback !== null"');

    // La pantalla canción conserva su Siguiente (solo en fallo) + songAdvance.
    assert.match(INDEX_SRC, /x-show="sessionFeedback === 'incorrect'"[\s\S]{0,80}@click="songAdvance">Siguiente/,
      'la canción conserva el Siguiente con sessionFeedback === incorrect + songAdvance');
  });

  test('quick-260615-r3b (CAMBIO 2): el toggle Contrarreloj con x-model="homeExamTimed" existe en home', () => {
    const INDEX_SRC = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const matches = (INDEX_SRC.match(/x-model="homeExamTimed"/g) ?? []).length;
    assert.equal(matches, 1, 'debe existir exactamente un toggle con x-model="homeExamTimed"');
    assert.match(INDEX_SRC, /Contrarreloj/,
      'el toggle debe llevar el texto Contrarreloj');
  });
});
