// tests/screen-multi-choice-shuffle.test.js
//
// Phase quick-260525-pwq — Sub-tests sobre las invariantes del shuffle visual de
// las opciones multi-choice. El test opera sobre el helper `fisherYates` de
// `src/domain/session.js` — exactamente el mismo helper que `initSubStateForExercise`
// invoca en la rama 'multiple-choice' del screen (`src/screens/app.js`). El
// invariante validado aquí es el contrato del shuffle visual:
//
//   1. Permutation validity: el array salida es una permutación del input
//      `[0..N-1]` — ningún índice se pierde ni se duplica. Cubre los tamaños
//      típicos del schema multi-choice del corpus (N ∈ {2,3,4,5}).
//   2. Correctness preservation: la opción correcta sigue existiendo en la
//      permutación, su texto recuperado vía `options[perm.find(...)]` coincide
//      con el texto original `options[correctIndex]`. Cubre el caso flagrante
//      avere-302..305 (4 ejercicios con MISMAS options + correctIndex=2): tras
//      shuffle, la respuesta sigue siendo "ha" sea cual sea la posición visual.
//   3. Determinismo con seededLcg: dos invocaciones con la misma seed producen
//      la misma permutación. Justifica el uso de `seededLcg` para tests
//      reproducibles aunque el screen use `Math.random` en producción (D-57 /
//      D-62 — mismo patrón intencional non-deterministic por carga).
//
// Estos tests viven en su propio archivo (no entremezclados con
// `exercise-types.test.js` que cubre grade) porque capturan el invariante de
// la integración shuffle screen-level, aunque el test mismo opere sobre el
// helper de dominio (D-62 — un único algoritmo reusable).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { fisherYates } from '../src/domain/session.js';
import { seededLcg } from './util/seeded-rng.js';

describe('screen multi-choice — shuffle invariants (Phase quick-260525-pwq)', () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Test 1 — Permutation validity
  // ──────────────────────────────────────────────────────────────────────────

  test('fisherYates([0..N-1]) returns a valid permutation for N in {2,3,4,5}', () => {
    for (const n of [2, 3, 4, 5]) {
      // Seed variada por N para que cada tamaño ejercite una permutación
      // distinta (sin depender de un seed mágico).
      const rng = seededLcg(100 + n);
      const input = Array.from({ length: n }, (_, i) => i);
      const out = fisherYates(input, rng);

      // Output sigue siendo de longitud N.
      assert.equal(out.length, n, `length should be ${n} for N=${n}`);
      // Output ordenado ascendentemente reproduce `[0..N-1]` — ningún índice
      // se perdió ni se duplicó.
      const sorted = [...out].sort((a, b) => a - b);
      assert.deepStrictEqual(sorted, input, `sorted output should equal [0..${n - 1}] for N=${n}`);
      // Defensa explícita: TODOS los índices originales aparecen al menos una vez.
      for (const i of input) {
        assert.ok(out.includes(i), `output should include original index ${i} for N=${n}`);
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 2 — Correctness preservation (caso flagrante avere-302..305)
  // ──────────────────────────────────────────────────────────────────────────

  test('correct option text preserved through permutation (caso avere-302..305)', () => {
    // Reproducir el caso flagrante avere-302..305: 4 opciones idénticas con
    // correctIndex=2 ('ha'). Tras shuffle, la opción correcta sigue siendo 'ha'
    // independientemente de la posición visual.
    const options = ['ho', 'hai', 'ha', 'hanno'];
    const correctIndex = 2;
    const perm = fisherYates([0, 1, 2, 3], seededLcg(7));

    // El índice original `correctIndex=2` aparece en la permutación.
    assert.ok(perm.includes(correctIndex), 'perm must include the original correctIndex');

    // La posición VISUAL del índice correcto en el shuffled array.
    const visualPos = perm.indexOf(correctIndex);
    assert.ok(visualPos >= 0 && visualPos < options.length, 'visualPos must be in range');

    // El texto recuperado vía indirección `options[perm[visualPos]]` (el patrón
    // que usa el template HTML tras el fix) coincide con el texto original.
    assert.equal(
      options[perm[visualPos]],
      options[correctIndex],
      'text recovered via shuffled perm must equal text at original correctIndex'
    );
    assert.equal(options[perm[visualPos]], 'ha', 'recovered text must be "ha"');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Test 3 — Determinismo con seededLcg (reproducibilidad)
  // ──────────────────────────────────────────────────────────────────────────

  test('two fisherYates calls with the same seeded RNG produce identical permutations', () => {
    // Cada invocación a seededLcg(42) crea una NUEVA closure con state propio
    // — dos closures con la misma seed producen la misma secuencia de floats,
    // así que dos shuffles deben dar arrays idénticos. Esto valida el patrón
    // que usaría un test integration-level para reproducir el orden visual
    // exacto del screen layer (aunque producción use Math.random).
    const input = [0, 1, 2, 3];
    const out1 = fisherYates(input, seededLcg(42));
    const out2 = fisherYates(input, seededLcg(42));

    assert.deepStrictEqual(out1, out2, 'identical seeds must produce identical permutations');
    // Sanity: la permutación con seed=42 NO es la identidad — si lo fuera,
    // este test pasaría trivialmente y no probaría nada del shuffle.
    assert.notDeepStrictEqual(out1, input, 'permutation should not be the identity for seed=42');
  });
});
