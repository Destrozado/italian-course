// tests/fixtures/slot-variants-integration.test.js
//
// Phase 15 plan 03 — test de INTEGRACIÓN del pipeline slot+variantes.
//
// A diferencia de tests/fixtures/slot-variants.test.js (unitario del validator
// y de normalizeExerciseToSlot por separado), este test recorre el pipeline
// completo END-TO-END que ejecuta `loadContent` SIN el fetch:
//
//   1) lee content/exercises/_fixtures/slot-demo.json del disco,
//   2) lo pasa por validateContent con categorías reales -> ok true,
//   3) lo normaliza con la MISMA función pura que usa loadContent
//      (normalizeExerciseToSlot) y afirma el shape de slotById,
//   4) afirma back-compat (SLOT-06): las 9 categorías reales del registry siguen
//      validando con el validator extendido, y el conteo por categoría no cambia.
//
// El snapshot append-only de avere se verifica vía
//   scripts/assert-avere-prefix-unchanged.mjs (no se duplica en JS).
//
// Se ejecuta con:
//     node --test tests/fixtures/slot-variants-integration.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { validateContent } from '../../src/data/schema-validator.js';
import { normalizeExerciseToSlot } from '../../src/data/content-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..', '..');

/** Lee y parsea un JSON del repo desde una ruta relativa a la raíz del proyecto. */
function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(projectRoot, relPath), 'utf8'));
}

// Categorías reales (espejo de content/categories.json) — usadas por el
// validador para resolver `categoryIds` tanto del fixture como de los archivos
// reales. El fixture referencia "preposiciones", que existe aquí.
const realCategories = readJson('content/categories.json').categories;

// ────────────────────────────────────────────────────────────────────────────
// Pipeline end-to-end sobre el fixture slot+variantes (Task 1)
// ────────────────────────────────────────────────────────────────────────────

describe('integración slot+variantes — pipeline sobre slot-demo.json', () => {
  const fixturePath = 'content/exercises/_fixtures/slot-demo.json';
  const fixture = readJson(fixturePath);
  const fixtureExercises = fixture.exercises;

  test('el fixture existe y declara exercises[] (slot multi-variante + slot de 1)', () => {
    assert.ok(Array.isArray(fixtureExercises), 'el fixture debe tener un array "exercises"');
    assert.equal(fixtureExercises.length, 2, 'el fixture canónico tiene 2 slots');

    const multi = fixtureExercises.find(e => e.id === 'slot-demo-001');
    const single = fixtureExercises.find(e => e.id === 'slot-demo-spiaggia');
    assert.ok(multi, 'falta el slot multi-variante slot-demo-001');
    assert.ok(single, 'falta el slot de 1 variante slot-demo-spiaggia');
    assert.equal(multi.variants.length, 2, 'el slot multi-variante tiene 2 variantes');
    assert.equal(single.variants.length, 1, 'el slot de 1 variante (SLOT-03) tiene 1 variante');
  });

  test('(a) validateContent acepta el fixture tal cual (ok true, sin errores)', () => {
    const result = validateContent({
      categories: realCategories,
      exercisesByFile: { [fixturePath]: fixtureExercises }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('el fixture no contiene HTML en ningún string (T-15-XSS)', () => {
    const htmlLike = /<[^>]+>/;
    const offenders = [];
    const walk = node => {
      if (typeof node === 'string') {
        if (htmlLike.test(node)) offenders.push(node);
      } else if (Array.isArray(node)) {
        node.forEach(walk);
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach(walk);
      }
    };
    walk(fixtureExercises);
    assert.deepEqual(offenders, [], `Strings con apariencia de HTML en el fixture: ${JSON.stringify(offenders)}`);
  });

  test('(b) normalizeExerciseToSlot — el slot multi-variante preserva sus 2 variantes', () => {
    const multi = fixtureExercises.find(e => e.id === 'slot-demo-001');
    const slot = normalizeExerciseToSlot(multi);

    assert.equal(slot.id, 'slot-demo-001');
    assert.equal(slot.type, 'multiple-choice');
    assert.deepEqual(slot.categoryIds, ['preposiciones']);
    assert.equal(slot.explanation, multi.explanation, 'la explanation vive a nivel de slot (SLOT-02)');
    assert.equal(slot.variants.length, 2);
    assert.deepEqual(slot.variants, multi.variants, 'passthrough de las variantes a la shape canónica');
  });

  test('(b) normalizeExerciseToSlot — el slot de 1 variante (SLOT-03) normaliza con 1 variante', () => {
    const single = fixtureExercises.find(e => e.id === 'slot-demo-spiaggia');
    const slot = normalizeExerciseToSlot(single);

    assert.equal(slot.id, 'slot-demo-spiaggia');
    assert.equal(slot.variants.length, 1);
    assert.equal(slot.explanation, single.explanation);
    assert.equal(slot.variants[0].prompt, single.variants[0].prompt);
    assert.deepEqual(slot.variants[0].options, single.variants[0].options);
    assert.equal(slot.variants[0].correctIndex, single.variants[0].correctIndex);
  });

  test('(c) un ejercicio legacy (payload, sin variants[]) normaliza a slot de 1 con explanation desde payload.explanation', () => {
    const legacy = {
      id: 'legacy-mc-001',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      payload: {
        prompt: 'Vado ___ Roma domani.',
        options: ['a', 'in', 'da'],
        correctIndex: 0,
        explanation: 'Con ciudades se usa "a".'
      }
    };
    const slot = normalizeExerciseToSlot(legacy);

    assert.equal(slot.id, 'legacy-mc-001');
    assert.equal(slot.explanation, 'Con ciudades se usa "a".', 'la explanation del slot sale de payload.explanation (D-15-04)');
    assert.equal(slot.variants.length, 1, 'legacy = slot de 1 variante');
    assert.deepEqual(slot.variants[0].options, ['a', 'in', 'da']);
    assert.equal(slot.variants[0].correctIndex, 0);
    // La variante NO lleva explanation propia (sube a nivel de slot, D-15-02).
    assert.equal(slot.variants[0].explanation, undefined);
  });

  test('(c) normalizeExerciseToSlot NO muta el ejercicio legacy original (espejo de exerciseById)', () => {
    const legacy = {
      id: 'legacy-mc-002',
      type: 'multiple-choice',
      categoryIds: ['preposiciones'],
      payload: { prompt: 'Vivo ___ Italia.', options: ['in', 'a', 'da'], correctIndex: 0, explanation: 'Regla.' }
    };
    const snapshot = JSON.stringify(legacy);
    const payloadRef = legacy.payload;

    const slot = normalizeExerciseToSlot(legacy);

    assert.equal(JSON.stringify(legacy), snapshot, 'el ejercicio original no debe mutarse');
    assert.equal(legacy.payload, payloadRef, 'la referencia al payload original se conserva intacta (exerciseById byte-idéntico)');
    // El slot derivado es un objeto distinto (no comparte la ref del payload).
    assert.notEqual(slot.variants[0], legacy.payload);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Back-compat gate SLOT-06 (Task 2): las 9 categorías reales + conteo intacto
// ────────────────────────────────────────────────────────────────────────────

describe('back-compat SLOT-06 — las 9 categorías reales validan con el validator extendido', () => {
  // Conteos esperados (espejo del registry actual). Si una alta de contenido
  // futura cambia un conteo, este test obliga a actualizarlo conscientemente.
  const REAL_CATEGORIES = [
    { slug: 'avere', expected: 20 },
    { slug: 'essere', expected: 26 },
    { slug: 'preposiciones', expected: 49 },
    { slug: 'verbos-movimiento', expected: 7 },
    { slug: 'sustantivos-irregulares', expected: 5 },
    { slug: 'genero-numero', expected: 12 },
    { slug: 'profesiones', expected: 11 },
    { slug: 'articoli', expected: 34 },
    { slug: 'partitivos', expected: 19 }
  ];

  for (const { slug, expected } of REAL_CATEGORIES) {
    const file = `content/exercises/${slug}.json`;

    test(`${slug}: validateContent acepta el archivo legacy tal cual (ruta XOR "solo payload")`, () => {
      const exercises = readJson(file).exercises;
      const result = validateContent({
        categories: realCategories,
        exercisesByFile: { [file]: exercises }
      });
      assert.equal(
        result.ok,
        true,
        `El validator extendido rechaza contenido legacy en ${file}: ${JSON.stringify(result.errors)}`
      );
    });

    test(`${slug}: el conteo de ejercicios no cambia (${expected})`, () => {
      const exercises = readJson(file).exercises;
      assert.equal(
        exercises.length,
        expected,
        `Conteo inesperado en ${file}: esperaba ${expected}, encontré ${exercises.length}`
      );
    });
  }

  test('las 9 categorías reales validan TODAS juntas en un solo bundle (ids únicos globales)', () => {
    const exercisesByFile = {};
    for (const { slug } of REAL_CATEGORIES) {
      const file = `content/exercises/${slug}.json`;
      exercisesByFile[file] = readJson(file).exercises;
    }
    const result = validateContent({ categories: realCategories, exercisesByFile });
    assert.equal(result.ok, true, `Bundle completo inválido: ${JSON.stringify(result.errors)}`);
  });
});
