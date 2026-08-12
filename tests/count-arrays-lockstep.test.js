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
import { existsSync, readFileSync } from 'node:fs';

// Las DOS fuentes de conteo, leidas como TEXTO (nunca importadas — ver cabecera).
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
];

const readSrc = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

// La lista de REFERENCIA se lee del DISCO, de content/categories.json — la misma
// fuente que consume el schema (categoryIds) y categoriesForDisplay. Escribirla a
// mano aqui haria el gate vacuo: se compararia consigo mismo y seria verde para
// siempre, incluida el alta de la categoria 19.
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);
const ENTRADAS = CATEGORIES.categories;
const SLUGS_REGISTRADOS = CATEGORIES.categories.map((c) => c.id);

// ───────────────────────────────────────────────────────────────────────────
// 1. El helper puro
// ───────────────────────────────────────────────────────────────────────────

/** Escapa los metacaracteres de regex de un slug antes de interpolarlo. */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Devuelve la sublista de `slugs` que NO aparece ANCLADA en el texto fuente `src`.
 *
 * El ancla tiene DOS mitades y las dos son necesarias:
 *
 *  1. IDENTIDAD (D-40-03): el slug COMPLETO byte a byte dentro de una cadena
 *     entrecomillada precedida de la clave `slug:`. NUNCA `src.includes(slug)` a
 *     pelo: `fare-ind` es prefijo de `fare-indicativo` y de `fare-indefiniti`, asi
 *     que un includes daria verde a una de las dos con solo la otra presente.
 *
 *  2. POSICION (G-44-3-WR01): el slug tiene que estar en una linea que ABRE UNA
 *     ENTRADA del array — indentacion horizontal, `{`, y el resto de la entrada en
 *     esa misma linea. Antes bastaba con que el TEXTO `slug: '<slug>'` existiera en
 *     CUALQUIER posicion del fichero, y eso deja dos vias abiertas al bug historico:
 *       - `// { slug: 'fare-indefiniti', ... }` — comentar una entrada
 *         «temporalmente» es el gesto MAS PLAUSIBLE de todos los que producen la
 *         ceguera, y satisfacia el ancla vieja tal cual.
 *       - un comentario de prosa que nombra la clave (`// ... slug: 'x' ...`)
 *         tampoco engancha nada, y tambien la satisfacia.
 *     Una entrada comentada NO satisface el ancla nueva porque el `//` no es
 *     whitespace y por tanto la linea no abre con `{`. El flag `m` es lo que hace
 *     que `^` signifique inicio de LINEA y no inicio de FICHERO: sin el, el ancla
 *     solo miraria la primera linea del fichero y el gate seria vacuo.
 *
 * El endurecimiento es de la POSICION, jamas de la IDENTIDAD: el slug se sigue
 * exigiendo completo, que es lo que resuelve la colision `fare-ind`.
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @param {string[]} slugs slugs de categoria registrados
 * @returns {string[]} los slugs CIEGOS, en el orden de entrada
 */
export function slugsCiegos(src, slugs) {
  return slugs.filter((slug) => {
    // `[^\S\n]*` = whitespace HORIZONTAL: acota el ancla a una sola linea (un `\s*`
    // podria cruzar saltos de linea) y no anida cuantificadores (T-44-03-03).
    const anclado = new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:\\s*(['"\`])${escapeRe(slug)}\\1`, 'm');
    return !anclado.test(src);
  });
}

// ───────────────────────────────────────────────────────────────────────────
// 2. Los goldens del helper — la prueba mecanica de que el gate SABE ponerse rojo
// ───────────────────────────────────────────────────────────────────────────
//
// Operan sobre cadenas literales de este propio fichero, no sobre el disco: es lo
// que los hace deterministas y lo que los convierte en fail-first committeado. Un
// gate probado solo en verde es una afirmacion, no una garantia.

describe('gate anti-ceguera — goldens de slugsCiegos: ausencia, colision de prefijo y entrada comentada (fail-first, D-44-06)', () => {
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

  // v2.0 Phase 44 plan 03 (G-44-3-WR01, via 1). Los dos goldens de abajo son la vía
  // que el code review encontró ABIERTA: el ancla vieja solo exigía que el TEXTO
  // `slug: '<slug>'` existiera en ALGUN sitio del fichero, así que una entrada
  // comentada —el gesto más plausible de todos los que producen el bug histórico— la
  // seguía satisfaciendo y la categoría salía como enganchada estando ciega.

  const SRC_COMENTADO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
      // { slug: 'fare-indefiniti', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
    ];
  `;

  const SRC_SLUG_EN_PROSA = `
    // TODO(v2.1): cuando se engancha una categoria nueva, la entrada se escribe con
    // slug: 'fare-indefiniti' y su expected DINAMICO. Esta prosa NO es una entrada:
    // hoy fare-indefiniti sigue fuera del array y el gate tiene que decirlo.
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
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

  test('golden-NEGATIVO de ENTRADA COMENTADA: una entrada comentada con // NO ancla nada (G-44-3-WR01)', () => {
    assert.deepEqual(
      slugsCiegos(SRC_COMENTADO, ['fare-indefiniti']),
      ['fare-indefiniti'],
      'G-44-3-WR01: comentar una entrada «temporalmente» la saca del array; el gate tiene que verla CIEGA'
    );
    // Y el hermano que sigue sano NO se contagia: la ceguera es de la entrada comentada.
    assert.deepEqual(
      slugsCiegos(SRC_COMENTADO, ['fare-indicativo', 'fare-indefiniti']),
      ['fare-indefiniti'],
      'G-44-3-WR01: el ancla endurecida sigue distinguiendo la entrada viva de la comentada'
    );
  });

  test('golden-NEGATIVO de SLUG EN PROSA: la clave dentro de un comentario de prosa no ancla (G-44-3-WR01)', () => {
    assert.deepEqual(
      slugsCiegos(SRC_SLUG_EN_PROSA, ['fare-indefiniti']),
      ['fare-indefiniti'],
      'G-44-3-WR01: nombrar el slug en un comentario no es engancharlo en el array de conteo'
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
      const ciegas = slugsCiegos(SRC, SLUGS_REGISTRADOS);
      assert.deepEqual(
        ciegas,
        [],
        `INT-02 / D-44-06: ${rel} quedaria CIEGO a estas categorias: ${ciegas.join(', ')}`
      );
    });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// 4. Los casos VACIOS que el guard dinamico del reporter NO puede ver
// ───────────────────────────────────────────────────────────────────────────
//
// El guard de coherencia de scripts/run-validation-271.mjs compara Σ de los
// `expected` con Σ de slotCountOf(disco). Con `expected` DINAMICO los dos lados de
// la resta leen el MISMO fichero en el MISMO arranque, asi que un JSON con cero
// ejercicios da cero en los dos lados y la resta cuadra: el guard no distingue un
// fichero vaciado de un cero legitimo. Y un fichero AUSENTE no da un error de
// nombre sino un ENOENT en runtime, porque la ruta se DERIVA del slug. El rojo con
// mensaje tiene que venir de aqui.

describe('gate anti-ceguera — el fichero de cada categoria registrada existe y no esta vacio (D-44-06)', () => {
  test('cada categoria registrada tiene content/exercises/<slug>.json presente, parseable y con exercises no vacio', () => {
    const roto = [];
    for (const slug of SLUGS_REGISTRADOS) {
      const rel = `content/exercises/${slug}.json`;
      const url = new URL(`../${rel}`, import.meta.url);
      if (!existsSync(url)) {
        roto.push(`${slug}: FALTA el fichero ${rel}`);
        continue;
      }
      let data;
      try {
        data = JSON.parse(readFileSync(url, 'utf-8'));
      } catch (e) {
        roto.push(`${slug}: ${rel} no parsea (${e.message})`);
        continue;
      }
      if (!Array.isArray(data.exercises)) {
        roto.push(`${slug}: ${rel} no declara un array exercises`);
      } else if (data.exercises.length === 0) {
        roto.push(`${slug}: ${rel} tiene exercises de longitud 0`);
      }
    }
    assert.deepEqual(
      roto,
      [],
      `D-44-06: con expected DINAMICO el guard del reporter no puede ver esto:\n  ${roto.join('\n  ')}`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. Orden de display y key set del registro (INT-01, generalizado desde WR-05)
// ───────────────────────────────────────────────────────────────────────────
//
// El ARRAY de content/categories.json es lo que categoriesForDisplay recorre para
// pintar home, picker, Repaso y Examen; `order` es DOCUMENTAL. Si los dos divergen,
// el display deja de coincidir con el numero escrito. Es la forma estable que WR-05
// fijo en tests/content-fare-indicativo.test.js para UNA categoria, aqui
// generalizada a las 18 para que INT-01 quede congelado como invariante permanente
// y no como observacion de una vez.

describe('gate anti-ceguera — registro de categorias: orden de display y key set (INT-01)', () => {
  test('los order son unicos y contiguos de 1 a N', () => {
    const orders = ENTRADAS.map((c) => c.order);
    assert.deepEqual(
      [...new Set(orders)].length === orders.length,
      true,
      `INT-01: hay order duplicados: ${orders.join(', ')}`
    );
    assert.deepEqual(
      [...orders].sort((a, b) => a - b),
      ENTRADAS.map((_, i) => i + 1),
      `INT-01: los order deben cubrir 1..${ENTRADAS.length} sin huecos`
    );
  });

  test('cada entrada ocupa en el array la posicion que dice su order, que es el orden de display (indice = order - 1)', () => {
    const desalineadas = ENTRADAS
      .filter((c) => ENTRADAS.indexOf(c) !== c.order - 1)
      .map((c) => `${c.id}(order ${c.order} pide indice ${c.order - 1}, esta en ${ENTRADAS.indexOf(c)})`);
    assert.deepEqual(
      desalineadas,
      [],
      'INT-01 / WR-05: el ARRAY define el display y el order es documental; si divergen, el display miente'
    );
  });

  test('el key set de cada entrada es exacto y las de origen ia-quorum lo declaran asi (PROV-01)', () => {
    const sucio = [];
    for (const c of ENTRADAS) {
      const keys = Object.keys(c).sort();
      const conOrigen = Object.prototype.hasOwnProperty.call(c, 'origen');
      const esperado = conOrigen
        ? ['id', 'name', 'order', 'origen']
        : ['id', 'name', 'order'];
      if (JSON.stringify(keys) !== JSON.stringify(esperado)) {
        sucio.push(`${c.id}: key set ${JSON.stringify(keys)} != ${JSON.stringify(esperado)}`);
      }
      if (conOrigen && c.origen !== 'ia-quorum') {
        sucio.push(`${c.id}: origen "${c.origen}" != "ia-quorum"`);
      }
      if (typeof c.name !== 'string' || c.name.trim().length === 0) {
        sucio.push(`${c.id}: name vacio`);
      }
    }
    assert.deepEqual(sucio, [], `INT-01 / PROV-01: registro con forma inesperada:\n  ${sucio.join('\n  ')}`);
  });

  test('las 4 categorias de fare estan registradas con origen ia-quorum (INT-01, PROV-01)', () => {
    const fare = ENTRADAS.filter((c) => c.id.startsWith('fare-'));
    assert.deepEqual(
      fare.map((c) => `${c.id}:${c.order}`),
      ['fare-indicativo:15', 'fare-congiuntivo:16', 'fare-cond-imperativo:17', 'fare-indefiniti:18'],
      'INT-01: las 4 categorias de fare, en el orden y con el order documental de las Phases 41/42/43'
    );
    assert.deepEqual(
      fare.map((c) => c.origen),
      ['ia-quorum', 'ia-quorum', 'ia-quorum', 'ia-quorum'],
      'PROV-01: las 4 nacen de quorum de IA y lo declaran'
    );
  });
});
