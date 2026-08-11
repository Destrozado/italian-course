// tests/count-arrays-lockstep.test.js
//
// v2.0 Phase 44 (INT-02, D-44-06/07) — EL GATE ANTI-CEGUERA.
//
// Invariante que congela: ninguna categoria registrada en content/categories.json
// puede quedar FUERA de los arrays de conteo. Se ejecuta con:
//
//     node --test tests/count-arrays-lockstep.test.js
//
// y entra en el glob de la suite completa:
//
//     node --test tests/*.test.js
//
// POR QUE EXISTE ESTE FICHERO. El reporter de cierre de milestone
// (scripts/run-validation-271.mjs) no lee content/categories.json: construye su
// PROPIA lista de categorias. Una categoria registrada y no enganchada desaparece
// del total sin que nada se ponga rojo, asi que el reporter emite
// `Milestone gate PASS` sobre un conteo que ignora esos slots. Eso paso durante
// TRES fases seguidas (41, 42 y 43): 225/225 PASS mientras 22 slots de `fare`
// estaban en disco, validados, y sin contar. Y no es la primera vez: v1.7 ya lo
// documento con `presente-regolare`, que estuvo ausente de los arrays desde
// Phase 30 hasta Phase 31. Este gate es lo UNICO que impide la cuarta repeticion.
//
// POR QUE VA POR SOURCE-ASSERT Y NO POR IMPORT (D-44-07). Ninguna de las dos
// fuentes es importable:
//   - scripts/run-validation-271.mjs ejecuta un guard de coherencia AL CARGAR el
//     modulo y llama a process.exit(1) si el conteo no cuadra. Importarlo desde un
//     test es una bomba: mata el runner sin mensaje util.
//   - tests/fixtures/slot-variants-integration.test.js declara REAL_CATEGORIES como
//     un `const` DENTRO del callback de su describe, asi que no hay nada que
//     exportar.
// Por eso se lee el TEXTO FUENTE de las dos y se aserta sobre el, igual que
// tests/exercise-types.test.js hace con APP_SRC (`readFileSync(new URL(...))`).
//
// POR QUE LA LISTA DE REFERENCIA SE LEE DEL DISCO. Comparar los arrays contra una
// lista de slugs escrita a mano AQUI seria un gate vacuo: verde para siempre y
// ciego al alta de la categoria 19. La referencia es content/categories.json, la
// misma fuente que el schema y que categoriesForDisplay.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Las DOS fuentes de conteo, leidas como TEXTO (nunca importadas — ver cabecera).
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
];

const readSrc = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

// TRACER (Tarea 1 de 44-01): el gate se estrena con UNA sola categoria, la del
// prefijo ambiguo. La Tarea 2 sustituye esta constante por la lista REAL leida de
// content/categories.json.
const TRACER_SLUGS = ['fare-indicativo'];

// ───────────────────────────────────────────────────────────────────────────
// 1. El helper puro
// ───────────────────────────────────────────────────────────────────────────

/** Escapa los metacaracteres de regex de un slug antes de interpolarlo. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Devuelve la sublista de `slugs` que NO aparece ANCLADA en el texto fuente `src`.
 *
 * El ancla es el slug COMPLETO dentro de una cadena entrecomillada precedida de la
 * clave `slug:` — es decir la forma en que las dos fuentes declaran sus entradas.
 * NUNCA `src.includes(slug)` a pelo: `fare-ind` es prefijo de `fare-indicativo` y
 * de `fare-indefiniti` (D-40-03), asi que un includes daria verde a una de las dos
 * con solo la otra presente.
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @param {string[]} slugs slugs de categoria registrados
 * @returns {string[]} los slugs CIEGOS, en el orden de entrada
 */
export function slugsCiegos(src, slugs) {
  return slugs.filter((slug) => {
    const anclado = new RegExp(`slug:\\s*(['"\`])${escapeRe(slug)}\\1`);
    return !anclado.test(src);
  });
}

// ───────────────────────────────────────────────────────────────────────────
// 2. Los TRES goldens — la prueba mecanica de que el gate SABE ponerse rojo
// ───────────────────────────────────────────────────────────────────────────
//
// Operan sobre cadenas literales de este propio fichero, no sobre el disco: es lo
// que los hace deterministas y lo que los convierte en fail-first committeado. Un
// gate probado solo en verde es una afirmacion, no una garantia.

describe('gate anti-ceguera — goldens del helper slugsCiegos (fail-first, D-44-06)', () => {
  const SRC_VACIO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'essere', expected: 26 },
    ];
  `;

  const SRC_SOLO_HERMANO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indefiniti', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
    ];
  `;

  const SRC_SOLO_EL_OTRO_HERMANO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
    ];
  `;

  const SRC_COMPLETO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
      { slug: 'fare-indefiniti', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
    ];
  `;

  test('golden-NEGATIVO simple: una categoria ausente del array se devuelve como ciega', () => {
    assert.deepEqual(
      slugsCiegos(SRC_VACIO, ['fare-indicativo']),
      ['fare-indicativo'],
      'D-44-06: el helper debe delatar la categoria que no esta enganchada'
    );
  });

  test('golden-NEGATIVO de COLISION DE PREFIJO: fare-ind no vale como ancla en NINGUN sentido', () => {
    // Con solo `fare-indefiniti` presente, `fare-indicativo` sigue ciega...
    assert.deepEqual(
      slugsCiegos(SRC_SOLO_HERMANO, ['fare-indicativo']),
      ['fare-indicativo'],
      'D-40-03: fare-indefiniti NO puede hacer pasar por enganchada a fare-indicativo'
    );
    // ...y al reves tambien (el prefijo compartido `fare-ind` no ancla nada).
    assert.deepEqual(
      slugsCiegos(SRC_SOLO_EL_OTRO_HERMANO, ['fare-indefiniti']),
      ['fare-indefiniti'],
      'D-40-03: fare-indicativo NO puede hacer pasar por enganchada a fare-indefiniti'
    );
    // Y con solo un hermano, la pareja completa delata exactamente al que falta.
    assert.deepEqual(
      slugsCiegos(SRC_SOLO_HERMANO, ['fare-indefiniti', 'fare-indicativo']),
      ['fare-indicativo'],
      'D-40-03: el helper distingue los dos slugs del prefijo ambiguo'
    );
  });

  test('golden-POSITIVO: con las dos ancladas por slug completo, no hay ninguna ciega', () => {
    assert.deepEqual(
      slugsCiegos(SRC_COMPLETO, ['avere', 'fare-indicativo', 'fare-indefiniti']),
      [],
      'D-44-06: el helper no debe inventar ceguera donde el ancla existe'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. El gate real sobre las dos fuentes (source-assert, D-44-07)
// ───────────────────────────────────────────────────────────────────────────

describe('gate anti-ceguera — las dos fuentes de conteo enganchan las categorias registradas (INT-02)', () => {
  for (const rel of COUNT_ARRAY_SOURCES) {
    const SRC = readSrc(rel);

    test(`${rel}: ninguna categoria registrada queda fuera del array de conteo`, () => {
      const ciegas = slugsCiegos(SRC, TRACER_SLUGS);
      assert.deepEqual(
        ciegas,
        [],
        `INT-02 / D-44-06: ${rel} quedaria CIEGO a estas categorias: ${ciegas.join(', ')}`
      );
    });
  }
});
