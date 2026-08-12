// tests/count-arrays-lockstep.test.js
//
// v2.0 Phase 44 (INT-02, D-44-06/07) — EL GATE ANTI-CEGUERA.
//
// Invariante que congela: ninguna categoria registrada en content/categories.json
// puede quedar FUERA de los arrays de conteo. Se ejecuta con:
//
//     node --test tests/count-arrays-lockstep.test.js
//
// y entra en la INVOCACION CANONICA de la suite completa:
//
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// (los DOS globs, siempre. Ver el bloque 6 al pie de este fichero: es el gate
// que congela esa forma y la razon por la que no es `tests/`, ni `--recursive`,
// ni `tests/**/*.test.js`.)
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
// POR QUE VA POR SOURCE-ASSERT Y NO POR IMPORT (D-44-07). Ninguna de las fuentes
// declaradas en COUNT_ARRAY_SOURCES es importable, y cada una por SU razon:
//   - scripts/run-validation-271.mjs ejecuta un guard de coherencia AL CARGAR el
//     modulo y llama a process.exit(1) si el conteo no cuadra. Importarlo desde un
//     test es una bomba: mata el runner sin mensaje util.
//   - tests/fixtures/slot-variants-integration.test.js declara REAL_CATEGORIES como
//     un `const` DENTRO del callback de su describe, asi que no hay nada que
//     exportar.
//   - tests/exercise-types.test.js declara CATEGORIES_WITH_EXPLANATIONS como un
//     `const` a nivel de MODULO y NO lo exporta; y aunque lo exportase, importar un
//     fichero de test re-registra sus describe/test en este runner y falsearia el
//     conteo de la suite. (v2.0 Phase 45, DEUDA-02.)
// Por eso se lee el TEXTO FUENTE de todas y se aserta sobre el, igual que
// tests/exercise-types.test.js hace con APP_SRC (`readFileSync(new URL(...))`).
//
// POR QUE LA LISTA DE REFERENCIA SE LEE DEL DISCO. Comparar los arrays contra una
// lista de slugs escrita a mano AQUI seria un gate vacuo: verde para siempre y
// ciego al alta de la categoria 19. La referencia es content/categories.json, la
// misma fuente que el schema y que categoriesForDisplay.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

// Las fuentes de conteo, leidas como TEXTO (nunca importadas — ver cabecera). Esta
// lista es la que gobierna el gate: todo lo que dice este fichero sobre «las fuentes»
// se redacta en terminos de ella, y no enumerando un numero, para que dar de alta la
// cuarta no exija reescribir la prosa.
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
  // v2.0 Phase 45 (DEUDA-02): la tercera. Borrarle una entrada ENCOGIA la suite en
  // silencio con exit 0 — la misma forma del olvido que corrio tres fases.
  'tests/exercise-types.test.js',
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
 * Blanquea el CONTENIDO de los comentarios de JS —`//` de linea y de bloque—
 * PRESERVANDO los saltos de linea y la longitud del fichero, para que el flag `m`
 * de los anclas siga significando «inicio de LINEA» y los numeros de linea no se
 * desplacen.
 *
 * POR QUE EXISTE (CR-01, code review de Phase 44). El endurecimiento G-44-3-WR01
 * intento codificar «esto no es un comentario» DENTRO del ancla: la linea tiene que
 * abrir con whitespace horizontal y `{`, y el razonamiento escrito era que «el `//`
 * no es whitespace y por tanto la linea no abre con `{`». Ese razonamiento solo vale
 * para el comentario de LINEA. Un `/* … *\/` de bloque deja las lineas que envuelve
 * BYTE A BYTE IDENTICAS: siguen abriendo con whitespace y `{`, asi que el ancla
 * casaba y la categoria se reportaba enganchada mientras el reporter habia dejado de
 * contarla. Reproducido end-to-end: envolviendo las 4 entradas de `fare` de
 * scripts/run-validation-271.mjs en `/* *\/`, el reporter imprimia
 * `VAL-06 (225/225 validated): PASS` —la cifra VERBATIM del bug que corrio tres
 * fases— y este fichero se quedaba en `# fail 0`. Y el `/* *\/` es el gesto MAS
 * plausible de los dos, porque es lo que produce el «toggle block comment» de un
 * editor sobre una seleccion de varias lineas.
 *
 * La leccion de forma: la ausencia de comentario NO se codifica en el ancla, se
 * garantiza ANTES quitando los comentarios. Asi el ancla vuelve a hablar solo de lo
 * que sabe (identidad + posicion) y no de lexico de JS.
 *
 * POR QUE NO EL `String.replace` DE DOS PASADAS. La forma corta y tentadora
 * —`src.replace(/\/\*[\s\S]*?\*\//g, …)` primero y los `//` despues— produce un
 * FALSO ROJO CATASTROFICO sobre el fichero real, y un falso rojo es un defecto igual
 * que un falso verde. scripts/run-validation-271.mjs:5 dice
 * `los 7 archivos \`content/exercises/*.json\`` DENTRO de un comentario de linea, y
 * ese `s/*` es un `/*` literal: el regex de bloque abre ahi y cierra en el primer
 * `*\/` del fichero, que esta en la linea 237, asi que blanquea las lineas 5-237 —
 * el array CATEGORIES entero incluido— y las 18 categorias salen ciegas de golpe.
 * Verificado: tras esa limpieza, la linea 174 queda en blanco. De ahi que esto sea
 * un escaner y no un `replace`: hay que saber si un `/*` esta dentro de una cadena o
 * de otro comentario ANTES de tratarlo como apertura.
 *
 * ALCANCE DELIBERADO, y su razon. El escaner reconoce cadenas (`'`, `"`, backtick)
 * para no confundir un `//` o un `/*` de dentro de una cadena con un comentario —que
 * es exactamente el caso de la linea de `run-validation-271.mjs` que imprime
 * `'  VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js'` (hoy la
 * 511; el numero se relocaliza por el contenido, no se hereda). NO reconoce literales
 * de expresion regular: un
 * `/…/` que contuviera una comilla suelta desalinearia el escaneo. El dano esta
 * ACOTADO A UNA LINEA por construccion, porque el estado de cadena se resetea en cada
 * salto de linea (`comilla` se declara dentro del map) y solo el estado de bloque
 * cruza lineas — que es lo que tiene que cruzarlas.
 *
 * EL INVENTARIO REAL de literales regex, contado hoy sobre las fuentes declaradas en
 * COUNT_ARRAY_SOURCES (v2.0 Phase 45, DEUDA-02). Ya NO es «uno solo y sin comillas»:
 *   - scripts/run-validation-271.mjs: CERO literales de expresion regular.
 *   - tests/fixtures/slot-variants-integration.test.js: uno (`htmlLike`), sin comillas.
 *   - tests/exercise-types.test.js: una veintena. Varios LLEVAN comillas, casi todos
 *     EMPAREJADAS dentro de la misma linea (`'a'` y `'i'` del handler de teclado, las
 *     dos dobles de un atributo `x-show`), asi que el escaner entra y sale de cadena
 *     antes del salto de linea y no se desalinea nada. Hay UNO con la comilla
 *     DESPAREJADA: el `mdPattern` que caza tokens de markdown, que termina en una
 *     comilla invertida suelta. De esa comilla al final de SU linea el escaneo va
 *     desalineado — y ahi se acaba, porque el estado de cadena muere en el salto.
 * Por eso el dano sigue acotado, y la clausula que lo acota es esta: ninguna linea de
 * ENTRADA de un array de conteo comparte linea con un literal de expresion regular.
 * Esa clausula NO se queda en esta prosa —es justo la clase de cosa que deja de ser
 * cierta sin que nadie se entere—: la congela el guard de integridad del escaner del
 * bloque 3-ter, que exige que toda linea de entrada sobreviva BYTE A BYTE a esta
 * funcion. La limitacion de alcance sigue siendo deliberada; lo que ya no es, es
 * silenciosa.
 *
 * @param {string} src texto fuente de un fichero JS/MJS
 * @returns {string} el mismo texto con los comentarios blanqueados a espacios
 */
export function sinComentarios(src) {
  let enBloque = false;
  return src
    .split('\n')
    .map((linea) => {
      const out = linea.split('');
      // `comilla` se declara AQUI, por linea: una cadena sin cerrar no puede
      // arrastrar el escaneo a las lineas siguientes (dano acotado a una linea).
      let comilla = '';
      let i = 0;
      while (i < linea.length) {
        const c = linea[i];
        if (enBloque) {
          if (c === '*' && linea[i + 1] === '/') {
            out[i] = ' ';
            out[i + 1] = ' ';
            i += 2;
            enBloque = false;
            continue;
          }
          out[i] = ' ';
          i += 1;
          continue;
        }
        if (comilla) {
          if (c === '\\') { i += 2; continue; }
          if (c === comilla) comilla = '';
          i += 1;
          continue;
        }
        if (c === "'" || c === '"' || c === '`') { comilla = c; i += 1; continue; }
        if (c === '/' && linea[i + 1] === '/') {
          for (let k = i; k < linea.length; k += 1) out[k] = ' ';
          break;
        }
        if (c === '/' && linea[i + 1] === '*') {
          out[i] = ' ';
          out[i + 1] = ' ';
          i += 2;
          enBloque = true;
          continue;
        }
        i += 1;
      }
      return out.join('');
    })
    .join('\n');
}

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
 *     El flag `m` es lo que hace que `^` signifique inicio de LINEA y no inicio de
 *     FICHERO: sin el, el ancla solo miraria la primera linea del fichero y el gate
 *     seria vacuo.
 *
 *  3. AUSENCIA DE COMENTARIO (CR-01), y NO la codifica el ancla. El texto se pasa
 *     por `sinComentarios` ANTES de anclar. La version anterior confiaba en que «el
 *     `//` no es whitespace y por tanto la linea no abre con `{`», que solo cierra el
 *     comentario de LINEA: un `/* … *\/` de bloque deja las lineas envueltas byte a
 *     byte identicas y el ancla las aceptaba. Ver la cabecera de `sinComentarios`
 *     para la reproduccion completa del `225/225 PASS`.
 *
 * El endurecimiento es de la POSICION, jamas de la IDENTIDAD: el slug se sigue
 * exigiendo completo, que es lo que resuelve la colision `fare-ind`.
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @param {string[]} slugs slugs de categoria registrados
 * @returns {string[]} los slugs CIEGOS, en el orden de entrada
 */
export function slugsCiegos(src, slugs) {
  // Va PRIMERO: sin esto, el ancla de abajo acepta una entrada envuelta en `/* *\/`
  // (CR-01). Los goldens de bloque de mas abajo lo prueban en las dos formas.
  const limpio = sinComentarios(src);
  return slugs.filter((slug) => {
    // `[^\S\n]*` = whitespace HORIZONTAL en los DOS huecos, el de la indentacion y el
    // de despues de `slug:`: el ancla que gobierna las fuentes declaradas en
    // COUNT_ARRAY_SOURCES ES horizontal, no cruza saltos de linea, y no anida
    // cuantificadores (T-44-03-03). El hueco de despues de `slug:` usaba `\s*` —que SI
    // cruza el salto— hasta el fix de WR-07 (v2.0 Phase 45), a dos lineas de este mismo
    // comentario que ya lo prohibia; quien lo congela ahora es el golden de WR-07 de
    // mas abajo, no esta prosa. Es tambien el ancla EXACTA de `paresSlugFile`.
    const anclado = new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:[^\\S\\n]*(['"\`])${escapeRe(slug)}\\1`, 'm');
    return !anclado.test(limpio);
  });
}

/**
 * Extrae los pares `{ slug, file }` que el texto fuente DECLARA por entrada.
 *
 * Comparte el ancla de entrada de `slugsCiegos` (linea que abre con `{`, flag `m`) Y
 * su paso previo por `sinComentarios`, asi que una entrada comentada no declara ningun
 * par — ni con `//` ni con `/* *\/` (CR-01: los dos helpers comparten el ancla, asi que
 * el agujero de bloque estaba en LOS DOS y habia que cerrarlo en los dos a la vez; con
 * `paresSlugFile` ciego al bloque, los pares fantasma seguian contando para la clausula
 * de no-vacuidad de mas abajo y ese gate tambien se quedaba verde). Tolera:
 *   - varios espacios de ALINEACION entre `slug: '...',` y `file:` — que es la forma
 *     REAL del reporter, con las columnas cuadradas. Un extractor que no la tolerase
 *     devolveria lista vacia y el gate seria vacuo sobre la unica fuente que gobierna
 *     el conteo del milestone (T-44-03-01).
 *   - las tres formas de entrecomillado del proyecto (`'`, `"`, backtick), con la
 *     comilla de cierre forzada a ser la misma que la de apertura (backreference).
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @returns {{slug: string, file: string}[]} los pares declarados, en orden de aparicion
 */
export function paresSlugFile(src) {
  const ENTRADA_CON_FILE =
    /^[^\S\n]*\{[^\n]*?slug:[^\S\n]*(['"`])([^'"`\n]+)\1[^\S\n]*,[^\S\n]*file:[^\S\n]*(['"`])([^'"`\n]+)\3/gm;
  // El MISMO `sinComentarios` que `slugsCiegos`, y por la misma razon (CR-01).
  const limpio = sinComentarios(src);
  return [...limpio.matchAll(ENTRADA_CON_FILE)].map((m) => ({ slug: m[2], file: m[4] }));
}

/**
 * Los pares en los que `file` NO es el fichero del propio `slug` (D-40-03),
 * formateados como `slug -> file` para que el diagnostico del rojo sea verdadero.
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @returns {string[]} los pares CRUZADOS, vacio si todos cuadran
 */
export const paresCruzados = (src) =>
  paresSlugFile(src)
    .filter(({ slug, file }) => file !== `content/exercises/${slug}.json`)
    .map(({ slug, file }) => `${slug} -> ${file}`);

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

  // CR-01 (code review de Phase 44). Los dos goldens de BLOQUE son la via que quedo
  // abierta cuando G-44-3-WR01 cerro la de `//`: un `/* */` deja las lineas envueltas
  // BYTE A BYTE IDENTICAS —siguen abriendo con whitespace y `{`— asi que el ancla las
  // aceptaba y la categoria salia enganchada estando ciega. Y es el gesto MAS plausible
  // de los dos, porque es lo que produce el «toggle block comment» de un editor sobre
  // una seleccion de varias lineas. El set de goldens anterior, que solo probaba `//`,
  // es lo que hizo que este agujero PARECIERA cerrado.

  const SRC_BLOQUE_UNA = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
      /* { slug: 'fare-indefiniti', expected: slotCountOf('content/exercises/fare-indefiniti.json') }, */
    ];
  `;

  // La forma REAL del gesto del editor: el `/*` y el `*/` en lineas propias y las
  // entradas envueltas SIN TOCAR — es esta la que el ancla vieja aceptaba entera.
  const SRC_BLOQUE_VARIAS = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      /*
      { slug: 'fare-cond-imperativo', expected: slotCountOf('content/exercises/fare-cond-imperativo.json') },
      { slug: 'fare-congiuntivo', expected: slotCountOf('content/exercises/fare-congiuntivo.json') },
      { slug: 'fare-indefiniti', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
      { slug: 'fare-indicativo', expected: slotCountOf('content/exercises/fare-indicativo.json') },
      */
    ];
  `;

  // WR-07 (v2.0 Phase 45, DEUDA-02). El hueco entre `slug:` y la comilla de apertura
  // usaba `\s*`, que casa TAMBIEN el salto de linea, a dos lineas del comentario que
  // prohibia justo eso. Esta forma —la clave al final de una linea y el valor
  // entrecomillado en la SIGUIENTE— CASABA antes del fix: el slug se reportaba
  // enganchado sin que ninguna linea de entrada lo declarase. Con la Opcion A de
  // DEUDA-02 ese ancla gobierna TRES fuentes, asi que el agujero valia por tres.
  const SRC_SLUG_A_DOS_LINEAS = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug:
        'fare-indefiniti', expected: 25 },
    ];
  `;

  test('golden-NEGATIVO de ANCLA A DOS LINEAS: la clave y su valor en lineas distintas NO anclan (WR-07)', () => {
    assert.deepEqual(
      slugsCiegos(SRC_SLUG_A_DOS_LINEAS, ['fare-indefiniti']),
      ['fare-indefiniti'],
      'WR-07: el hueco tras `slug:` es whitespace HORIZONTAL; con `\\s*` esta forma pasaba por enganchada'
    );
    // Y la entrada sana de al lado no se contagia: el fix es mas ESTRICTO, no mas ruidoso.
    assert.deepEqual(
      slugsCiegos(SRC_SLUG_A_DOS_LINEAS, ['avere']),
      [],
      'WR-07: acotar el ancla a una linea no puede inventar ceguera en la entrada bien formada'
    );
    // La forma del ancla es la MISMA que la de `paresSlugFile`, que ya la usaba bien:
    // una entrada partida tampoco declara par, y las dos funciones coinciden.
    assert.deepEqual(
      paresSlugFile(SRC_SLUG_A_DOS_LINEAS).map((p) => p.slug),
      [],
      'WR-07: slugsCiegos y paresSlugFile comparten ancla de verdad, no solo en el comentario'
    );
  });

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

  test('golden-NEGATIVO de ENTRADA EN BLOQUE: una entrada envuelta en /* */ en UNA linea NO ancla nada (CR-01)', () => {
    assert.deepEqual(
      slugsCiegos(SRC_BLOQUE_UNA, ['fare-indefiniti']),
      ['fare-indefiniti'],
      'CR-01: el /* */ deja la linea abriendo con `{`; sin quitar comentarios el ancla la aceptaba'
    );
    // Y el hermano vivo NO se contagia: la ceguera es de la entrada envuelta.
    assert.deepEqual(
      slugsCiegos(SRC_BLOQUE_UNA, ['fare-indicativo', 'fare-indefiniti']),
      ['fare-indefiniti'],
      'CR-01: quitar comentarios no puede inventar ceguera en la entrada viva de al lado'
    );
  });

  test('golden-NEGATIVO de BLOQUE MULTILINEA: las 4 entradas envueltas por un toggle de editor salen TODAS ciegas (CR-01)', () => {
    assert.deepEqual(
      slugsCiegos(SRC_BLOQUE_VARIAS, [
        'fare-cond-imperativo',
        'fare-congiuntivo',
        'fare-indefiniti',
        'fare-indicativo',
      ]),
      ['fare-cond-imperativo', 'fare-congiuntivo', 'fare-indefiniti', 'fare-indicativo'],
      'CR-01: es la reproduccion exacta del `VAL-06 (225/225 validated): PASS`, la cifra ' +
        'verbatim del bug que corrio durante las Phases 41, 42 y 43'
    );
    assert.deepEqual(
      slugsCiegos(SRC_BLOQUE_VARIAS, ['avere']),
      [],
      'CR-01: la entrada de fuera del bloque sigue anclada'
    );
  });

  test('golden de NO-FALSO-ROJO: un `/*` dentro de un comentario de LINEA o de una CADENA no abre bloque (CR-01)', () => {
    // Esta es la trampa del fichero real. scripts/run-validation-271.mjs:5 nombra
    // `content/exercises/*.json` DENTRO de un comentario de linea, y ese `s/*` es un
    // `/*` literal. Un limpiador por `String.replace` de dos pasadas abre bloque ahi y
    // cierra en el primer `*/` del fichero (linea 237), blanqueando el array CATEGORIES
    // entero: las 18 categorias saldrian ciegas de golpe. Un falso rojo es un defecto
    // igual que un falso verde, y ademas invita a relajar el gate.
    const SRC_TRAMPA = `
    // Lee los ejercicios de los archivos content/exercises/*.json (orden lockeado).
    const CATEGORIES = [
      { slug: 'fare-indefiniti', expected: 25 },
    ];
    /** Un bloque de verdad, mucho despues. */
    console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');
  `;
    assert.deepEqual(
      slugsCiegos(SRC_TRAMPA, ['fare-indefiniti']),
      [],
      'CR-01: el `/*` de `exercises/*.json` esta dentro de un comentario de linea y no abre bloque'
    );
    // Y el `/*` de dentro de la cadena del console.log tampoco.
    assert.equal(
      sinComentarios(SRC_TRAMPA).includes("node --test tests/*.test.js"),
      true,
      'CR-01: el `/*` de `tests/*.test.js` vive en una CADENA y el escaner no lo trata como comentario'
    );
  });

  test('golden de FORMA de sinComentarios: preserva saltos de linea y longitud (los numeros de linea y el flag `m` siguen valiendo)', () => {
    const SRC = 'a\n/* b\n   c */\nd // e\n';
    const limpio = sinComentarios(SRC);
    assert.equal(limpio.length, SRC.length, 'la longitud se conserva: solo se sustituye por espacios');
    assert.deepEqual(
      limpio.split('\n').map((l) => l.length),
      SRC.split('\n').map((l) => l.length),
      'cada linea conserva su longitud, asi que los numeros de linea no se desplazan'
    );
    assert.deepEqual(
      limpio.split('\n').map((l) => (l.trim() === '' ? '<blanca>' : l.trim())),
      ['a', '<blanca>', '<blanca>', 'd', '<blanca>'],
      'las 2 lineas del bloque quedan blancas enteras y de la de `//` solo sobrevive el codigo'
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
// 2-bis. Los goldens del par slug ↔ file (G-44-3-WR01 via 2, D-40-03)
// ───────────────────────────────────────────────────────────────────────────
//
// La segunda via que el code review encontro abierta. Una entrada con
// `slug: 'fare-indefiniti'` y el `file` de `fare-indicativo` —el copia-pega entre
// los dos slugs que comparten el prefijo `fare-ind`— hace que `expected` y el
// baseline dinamico lean el MISMO fichero: el guard de coherencia del reporter
// cuadra, el gate anti-ceguera del bloque 3 esta VERDE porque el slug si aparece
// anclado, `fare-indicativo` se cuenta DOS veces y los slots de `fare-indefiniti`
// desaparecen del total. El bloque 4 comprueba que content/exercises/<slug>.json
// existe, pero nunca que la entrada del array apunte a ese fichero.

describe('gate anti-ceguera — goldens de paresSlugFile / paresCruzados: par coherente, par cruzado, columnas alineadas y fuente sin file (fail-first, D-44-06)', () => {
  const SRC_PAR_COHERENTE = `
    const CATEGORIES = [
      { slug: 'avere', file: 'content/exercises/avere.json', expected: 20 },
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indefiniti.json', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
    ];
  `;

  // El copia-pega de D-40-03: el slug de un hermano con el fichero del otro.
  const SRC_PAR_CRUZADO = `
    const CATEGORIES = [
      { slug: 'avere', file: 'content/exercises/avere.json', expected: 20 },
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indicativo.json', expected: slotCountOf('content/exercises/fare-indicativo.json') },
    ];
  `;

  // La forma REAL del reporter: columnas ALINEADAS con varios espacios. Si el
  // extractor no la tolera devuelve lista vacia y el gate seria vacuo sobre la
  // unica fuente que gobierna el conteo del milestone (T-44-03-01).
  const SRC_ALINEADO = `
    const CATEGORIES = [
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
      { slug: 'fare-indefiniti',          file: 'content/exercises/fare-indefiniti.json',          expected: slotCountOf('content/exercises/fare-indefiniti.json') },
    ];
  `;

  // La forma de la SEGUNDA fuente: no declara `file` por entrada, lo DERIVA del slug.
  const SRC_SIN_FILE = `
    const REAL_CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'fare-indefiniti', expected: readJson('content/exercises/fare-indefiniti.json').exercises.length },
    ];
    for (const { slug, expected } of REAL_CATEGORIES) {
      const file = \`content/exercises/\${slug}.json\`;
    }
  `;

  test('golden-POSITIVO: extrae los pares tal cual los declara el texto y ninguno esta cruzado', () => {
    assert.deepEqual(paresSlugFile(SRC_PAR_COHERENTE), [
      { slug: 'avere', file: 'content/exercises/avere.json' },
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indefiniti.json' },
    ]);
    assert.deepEqual(
      paresCruzados(SRC_PAR_COHERENTE),
      [],
      'D-40-03: el gate no debe inventar cruces donde el par cuadra'
    );
  });

  test('golden-NEGATIVO de PAR CRUZADO: el slug de un hermano con el fichero del otro se delata (D-40-03)', () => {
    assert.deepEqual(paresSlugFile(SRC_PAR_CRUZADO), [
      { slug: 'avere', file: 'content/exercises/avere.json' },
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indicativo.json' },
    ]);
    assert.deepEqual(
      paresCruzados(SRC_PAR_CRUZADO),
      ['fare-indefiniti -> content/exercises/fare-indicativo.json'],
      'D-40-03: la entrada declara el fichero de OTRA categoria y el gate tiene que nombrar el par'
    );
  });

  test('golden de COLUMNAS ALINEADAS: la forma real del reporter (varios espacios) se parsea, o el gate seria vacuo', () => {
    assert.deepEqual(paresSlugFile(SRC_ALINEADO), [
      { slug: 'preposiciones', file: 'content/exercises/preposiciones.json' },
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indefiniti.json' },
    ]);
    assert.deepEqual(paresCruzados(SRC_ALINEADO), []);
  });

  test('golden de FUENTE SIN file: la que DERIVA la ruta del slug no declara pares (0), y no es un cruce', () => {
    assert.deepEqual(
      paresSlugFile(SRC_SIN_FILE),
      [],
      'la segunda fuente no declara `file` por entrada: su inmunidad viene de la derivacion, no del par'
    );
    assert.deepEqual(paresCruzados(SRC_SIN_FILE), []);
  });

  test('golden de ENTRADA COMENTADA: un par dentro de una entrada comentada no se extrae', () => {
    const SRC_PAR_COMENTADO = `
    const CATEGORIES = [
      // { slug: 'fare-indefiniti', file: 'content/exercises/fare-indicativo.json', expected: 7 },
    ];
  `;
    assert.deepEqual(
      paresSlugFile(SRC_PAR_COMENTADO),
      [],
      'el extractor comparte el ancla de entrada con slugsCiegos: una entrada comentada no declara nada'
    );
  });

  test('golden de ENTRADA EN BLOQUE: los pares de dentro de un /* */ no se extraen, ni cuentan como PARES FANTASMA (CR-01)', () => {
    // La segunda mitad de CR-01, y es la que mantenia verde la clausula de NO-VACUIDAD
    // de mas abajo: los dos helpers COMPARTEN el ancla de entrada, asi que el agujero de
    // bloque estaba en los dos. Con `paresSlugFile` ciego al bloque, las entradas
    // envueltas seguian declarando pares, `pares.length` seguia cuadrando con las 18
    // categorias registradas y el gate que existe para delatar la ceguera la certificaba.
    const SRC_PARES_EN_BLOQUE = `
    const CATEGORIES = [
      { slug: 'avere', file: 'content/exercises/avere.json', expected: 20 },
      /*
      { slug: 'fare-indefiniti', file: 'content/exercises/fare-indefiniti.json', expected: 25 },
      { slug: 'fare-indicativo', file: 'content/exercises/fare-indicativo.json', expected: 30 },
      */
    ];
  `;
    assert.deepEqual(
      paresSlugFile(SRC_PARES_EN_BLOQUE),
      [{ slug: 'avere', file: 'content/exercises/avere.json' }],
      'CR-01: solo la entrada VIVA declara par; las dos envueltas en /* */ eran pares fantasma'
    );
    assert.deepEqual(paresCruzados(SRC_PARES_EN_BLOQUE), []);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. El gate real sobre las fuentes de COUNT_ARRAY_SOURCES (source-assert, D-44-07)
// ───────────────────────────────────────────────────────────────────────────

describe('gate anti-ceguera — las fuentes de conteo declaradas enganchan las categorias registradas (INT-02)', () => {
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
// 3-bis. El par slug ↔ file de cada entrada (G-44-3-WR01 via 2, D-40-03)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EL GUARD DINAMICO DEL REPORTER NO PUEDE VER ESTO. El guard de coherencia de
// scripts/run-validation-271.mjs resta Σ(expected) − Σ(slotCountOf(disco)); y con el
// `expected` DERIVADO del propio `file` de la entrada (D-31-06), un `file` cruzado
// desplaza LOS DOS lados de la resta a la vez, asi que la resta cuadra. El reporter
// imprime `Milestone gate PASS`, el gate del bloque 3 esta verde porque el slug SI
// aparece anclado, el fichero del hermano se cuenta DOS veces y los slots de la
// categoria cruzada desaparecen del total. El bloque 4 comprueba que
// content/exercises/<slug>.json existe, pero nunca que la entrada APUNTE a el. El rojo
// con mensaje verdadero solo puede venir de aqui.

const REPORTER = 'scripts/run-validation-271.mjs';

// La expresion de plantilla con la que una fuente DERIVA la ruta del slug en su bucle
// de consumo. Declararla asi (cadena en comillas simples, sin interpolar) es lo que
// permite buscarla como TEXTO en la fuente.
const DERIVA_LA_RUTA = 'content/exercises/${slug}.json';

describe('gate anti-ceguera — el par slug ↔ file de cada entrada apunta a su PROPIO fichero (INT-02, D-40-03)', () => {
  test(`${REPORTER}: declara un par slug↔file por categoria registrada y ninguno esta cruzado`, () => {
    const SRC = readSrc(REPORTER);
    const pares = paresSlugFile(SRC);

    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO. Un extractor por regex que deja de casar
    // devuelve lista vacia, y un deepEqual de [] contra [] pasa en VERDE: es la especie
    // exacta de CR-01 de esta misma fase, un gate verde certificando nada. El numero de
    // referencia se DERIVA del disco (content/categories.json via SLUGS_REGISTRADOS) y
    // no se escribe a mano aqui, porque una cifra escrita aqui se compararia consigo
    // misma y seria verde para siempre.
    assert.equal(
      pares.length,
      SLUGS_REGISTRADOS.length,
      `T-44-03-01: el extractor ve ${pares.length} pares y content/categories.json registra ` +
        `${SLUGS_REGISTRADOS.length} categorias: o ${REPORTER} dejo de declarar una entrada, ` +
        `o el extractor dejo de ver su array de conteo`
    );

    const cruzados = paresCruzados(SRC);
    assert.deepEqual(
      cruzados,
      [],
      `D-40-03 / INT-02: una entrada de ${REPORTER} declara el fichero de OTRA categoria ` +
        `(el copia-pega del prefijo ambiguo \`fare-ind\`): ${cruzados.join(', ')}`
    );
  });

  test('toda fuente de COUNT_ARRAY_SOURCES esta cubierta: la que declara el fichero, por su par; la que lo deriva, por su derivacion', () => {
    // La disyuntiva, explicita para que ninguna fuente se quede fuera de cobertura EN
    // SILENCIO: o una fuente declara el fichero por entrada (y entonces el par tiene que
    // cuadrar), o lo DERIVA del slug (y entonces es inmune por construccion). Una fuente
    // que no haga ninguna de las dos cosas es un canal de ceguera NUEVO, y eso es
    // exactamente lo que este gate existe para nombrar.
    const sinCobertura = [];
    for (const rel of COUNT_ARRAY_SOURCES) {
      const SRC = readSrc(rel);
      const pares = paresSlugFile(SRC);
      if (pares.length > 0) {
        const cruzados = paresCruzados(SRC);
        if (cruzados.length > 0) {
          sinCobertura.push(`${rel}: declara el fichero por entrada y hay pares CRUZADOS: ${cruzados.join(', ')}`);
        }
      } else if (!SRC.includes(DERIVA_LA_RUTA)) {
        sinCobertura.push(
          `${rel}: NO declara \`file\` por entrada y tampoco DERIVA la ruta del slug ` +
            `(no contiene \`${DERIVA_LA_RUTA}\`): canal de ceguera nuevo, sin cobertura por ninguna de las dos vias`
        );
      }
    }
    assert.deepEqual(
      sinCobertura,
      [],
      `INT-02 / D-40-03: fuentes de conteo sin cobertura del par:\n  ${sinCobertura.join('\n  ')}`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3-ter. Integridad del escaner sobre las lineas de entrada (DEUDA-02)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE. Todo el gate de los bloques 3 y 3-bis mira el texto DESPUES de
// pasarlo por `sinComentarios`. Si el escaner altera una linea de entrada que en el
// fichero real esta viva, esa entrada desaparece del ancla y la categoria sale
// «ciega» sin estarlo (falso rojo); y al reves, una linea alterada en el sentido
// contrario la haria pasar por enganchada. La tercera fuente —tests/exercise-types.test.js,
// dada de alta en la Phase 45— es la primera que trae ese riesgo de verdad: contiene
// una veintena de literales de expresion regular, y `sinComentarios` DECLARA que no
// los reconoce (ver su cabecera). Uno de ellos, el `mdPattern` que caza tokens de
// markdown, termina en una comilla invertida DESPAREJADA, asi que el escaneo de esa
// linea va desalineado de ahi al final de la linea.
//
// Hoy el dano esta acotado —el estado de cadena muere en el salto de linea, y ninguna
// linea de entrada comparte linea con un literal regex—, y esa acotacion es
// exactamente la clase de clausula que se escribe en un comentario y deja de ser
// cierta sin que nadie se entere. Lo que faltaba no era la acotacion: era que algo se
// pusiera ROJO el dia que deje de valer. El peor caso no es hipotetico: un literal que
// contuviera la apertura de un comentario de bloque SI cruza lineas (es el unico
// estado que las cruza) y blanquearia entradas enteras — CR-01 de la Phase 44,
// reproducido.

// La MITAD POSICIONAL del ancla que ya comparten `slugsCiegos` y `paresSlugFile`:
// whitespace horizontal, `{`, y la clave `slug:` con su comilla de apertura en ESA
// MISMA linea. Sin la mitad de IDENTIDAD, porque aqui no importa QUE slug declara la
// linea sino que la linea sea una entrada. No es un tercer extractor: es el mismo
// ancla sin el trozo interpolado.
const LINEA_DE_ENTRADA = /^[^\S\n]*\{[^\n]*slug:[^\S\n]*['"`]/;

describe('integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)', () => {
  test('las lineas de entrada de las fuentes declaradas sobreviven BYTE A BYTE al escaner', () => {
    const infracciones = [];
    let lineasDeEntrada = 0;
    for (const rel of COUNT_ARRAY_SOURCES) {
      const crudo = readSrc(rel).split('\n');
      const limpio = sinComentarios(readSrc(rel)).split('\n');
      crudo.forEach((linea, i) => {
        if (!LINEA_DE_ENTRADA.test(linea)) return;
        lineasDeEntrada += 1;
        if (limpio[i] !== linea) infracciones.push(`${rel}:${i + 1}: ${linea.trim()}`);
      });
    }

    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO (mismo razonamiento que el bloque 3-bis).
    // Si el reconocimiento de lineas de entrada deja de casar —regex retocada, forma
    // del array cambiada, fuente renombrada— este test recorre CERO lineas, el
    // `deepEqual` de abajo compara [] contra [] y pasa en VERDE certificando NADA, que
    // es CR-01 verbatim. La referencia se DERIVA del disco (content/categories.json):
    // cada fuente engancha las categorias registradas (bloque 3), asi que el conjunto
    // tiene que traer al menos tantas lineas de entrada como categorias hay.
    assert.ok(
      lineasDeEntrada >= SLUGS_REGISTRADOS.length,
      `DEUDA-02 / T-45-02-03: el reconocimiento de lineas de entrada ve ${lineasDeEntrada} ` +
        `lineas en las ${COUNT_ARRAY_SOURCES.length} fuentes declaradas y content/categories.json ` +
        `registra ${SLUGS_REGISTRADOS.length} categorias: o las fuentes dejaron de declarar sus ` +
        `entradas, o el ancla dejo de reconocerlas — y con lista vacia esta comprobacion pasaria ` +
        `en verde sin haber mirado ni una linea`
    );

    assert.deepEqual(
      infracciones,
      [],
      `DEUDA-02: estas lineas de entrada NO sobreviven identicas a sinComentarios, asi que el ` +
        `ancla del gate no las ve como el fichero las escribe. Las dos causas son reales y el ` +
        `diagnostico no puede elegir una: o estas entradas estan envueltas en un comentario de ` +
        `bloque —deliberado o accidental, y entonces la ceguera ya existe—, o un literal de ` +
        `expresion regular con comilla desparejada desalineo el escaner en esa linea:\n  ` +
        `${infracciones.join('\n  ')}`
    );
  });

  test('los slugs registrados son ASCII puro, asi que la comparacion byte a byte del ancla ES la igualdad correcta', () => {
    // Dos lineas y su razon: el ancla compara el slug BYTE A BYTE (interpolado y
    // escapado, con la comilla de cierre forzada por backreference). Si un `id`
    // llevase un acento, habria dos codificaciones Unicode equivalentes de la misma
    // cadena (precompuesta y descompuesta) y «igual» dejaria de ser «mismos bytes».
    // Con los 18 ids en ASCII puro esa ambiguedad no existe y no hace falta normalizar.
    assert.ok(SLUGS_REGISTRADOS.length > 0, 'INT-01: content/categories.json no registra ninguna categoria');
    const noAscii = SLUGS_REGISTRADOS.filter((s) => !/^[a-z0-9-]+$/.test(s));
    assert.deepEqual(
      noAscii,
      [],
      `DEUDA-02: estos id de content/categories.json no son ASCII puro, asi que la identidad ` +
        `byte a byte del ancla podria fallar por composicion Unicode: ${noAscii.join(', ')}`
    );
  });
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

// ───────────────────────────────────────────────────────────────────────────
// 6. La INVOCACION CANONICA de la suite (DEUDA-01, D-45-01)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE ESTE BLOQUE. Este proyecto no tiene package.json, asi que no hay
// `npm test` que canonice nada: «la suite» es literalmente el argumento que el autor
// teclea. Y ese argumento estuvo TRES fases diciendo `node --test tests/*.test.js`,
// que NO casa tests/fixtures/*.test.js. Los dos ficheros de ahi —63 aserciones, una
// de ellas el back-compat gate de las 18 categorias reales— llevaban desde la Phase 15
// y la Phase 39 sin correr NUNCA en la suite. Desincronizar un `expected` de
// REAL_CATEGORIES dejaba la suite en `# pass 1101 / # fail 0 / exit 0`: verde sobre
// una asercion que nadie ejecutaba.
//
// POR QUE ESTA FORMA Y NO OTRA (D-45-01, las cuatro medidas en v22.20.0):
//   - `node --test tests/`            → exit 1, `Cannot find module '…/tests'`. Node
//                                        resuelve el path como MODULO. No funciona.
//   - `node --test --recursive tests/` → `node: bad option: --recursive`. La opcion NO
//                                        EXISTE en v22.20.0. Es el fix que proponia el
//                                        code review de la Phase 44: hipotesis de
//                                        revisor, no evidencia.
//   - `node --test tests/**/*.test.js` → sin `globstar` (el estado por defecto de este
//                                        shell) y bajo sh/dash, `**` degrada a `*` y
//                                        expande SOLO a tests/fixtures/: corre 63 de
//                                        1164 tests, todo verde, exit 0. Un verde
//                                        silencioso NUEVO dentro de la fase que existe
//                                        para eliminarlos. Prohibida por escrito.
//   - `node --test` a pelo             → barre tests/util/test-helpers.js, que no es un
//                                        test, y lo cuenta como 1 test que pasa.
// Los dos globs explicitos dan el mismo total bajo los cuatro regimenes medidos (bash
// con comillas, bash sin comillas, bash con globstar, sh) porque no usan ningun
// metacaracter cuyo significado dependa del shell.
//
// POR QUE NO SE MUEVEN LOS FICHEROS A tests/ (D-45-02). Los dos hacen
// `resolve(__dirname, '..', '..')` e importan `'../../src/data/…'`: moverlos rompe la
// raiz del proyecto y ~6 rutas, ademas de la cadena literal de COUNT_ARRAY_SOURCES. Y
// tests/fixtures/ seguiria existiendo (guarda song-golden.json y
// validation-pilot-disputed.json). Ampliar el glob es 1 linea de contrato contra ~6
// ediciones fragiles.
//
// POR QUE NINGUN CONTEO SE ASSERTA AQUI. La leccion CR-01 de la Phase 44: la suite
// firmaba 247 con el reporter en 250 porque un test asserto una cifra transcrita de la
// prosa de al lado. Escribir aqui «deben correr 1164 tests» seria una cifra
// comparandose consigo misma. Lo que se congela es la FORMA (que ningun fichero de test
// quede fuera de los globs) y el LOCKSTEP (que los ficheros de contrato documenten esa
// forma), los dos DERIVADOS del disco.

// La UNICA transcripcion de la forma en todo el arbol de tests. Todo lo demas de este
// bloque se DERIVA de esta cadena; cambiar la forma es editar esta linea y nada mas.
const INVOCACION_CANONICA = 'node --test tests/*.test.js tests/fixtures/*.test.js';

// DERIVADOS, no transcritos: los tokens que son globs, y la firma de «este texto
// documenta una corrida de la suite entera» (los tres primeros tokens = la forma corta
// historica, que es prefijo de la canonica).
const GLOBS_CANONICOS = INVOCACION_CANONICA.split(/\s+/).filter((t) => t.endsWith('.test.js'));
// La CABECERA del comando (`node --test`), derivada. Se usa para construir el reconocedor
// de invocaciones de abajo SIN volver a transcribirla: si la forma cambiara de binario,
// se edita INVOCACION_CANONICA y nada mas (Pattern B).
const CABECERA_COMANDO = INVOCACION_CANONICA.split(/\s+/).slice(0, 2).join(' ');

// Los ficheros de CONTRATO: los que le dicen al autor (o a un agente) como se corre la
// suite. Los ficheros de tests/ NO van aqui — los cubre la regla de prefijo, que no hay
// que mantener a mano cuando nace la suite numero 30.
const CALL_SITES_INVOCACION = [
  'README.md',
  '.claude/skills/gsd-validate-batch/SKILL.md',
  '.claude/skills/it-add-song/SKILL.md',
  'scripts/run-validation-271.mjs',
];

// POR QUE SE RECONOCE LO QUE HAY Y NO UNA FORMA MALA CONCRETA (CR-01 del review de esta
// misma fase). La version anterior contaba ocurrencias de UNA sola forma degradada
// —`node --test tests/*.test.js`— y deducia las malas por aritmetica:
// `cortas = cuenta(prefijo) - cuenta(canonica)`. Cualquier OTRA manera de escribirlo mal
// aportaba CERO ocurrencias de prefijo, salia `cortas = 0` y el gate pasaba en VERDE.
// Medido sobre una copia del arbol: revertir UNA de las dos invocaciones de README.md a
// `node --test tests/` dejaba `# fail 0`; una cabecera de test nueva con
// `node --test tests/` o con `node --test --recursive tests/`, tambien. Es decir: el gate
// era ciego a la forma exacta que este repositorio TENIA antes de la fase, y a la que
// propuso el code review de la Phase 44. El titulo del test («en TODAS sus menciones»)
// afirmaba una cobertura que el codigo no tenia.
//
// Ahora se extraen las invocaciones REALES y se comparan contra la canonica: la forma
// numero 5 de escribirlo mal nace delatada en vez de invisible.
//
// Los argumentos se cortan en el primer caracter que no puede formar parte de uno:
// espacio en blanco (fin de token), backtick/comillas/parentesis (delimitadores de la
// prosa que envuelve el comando en Markdown y en comentarios) y `#` (comentario de shell,
// que es como `.claude/skills/it-add-song/SKILL.md:263` anota su invocacion canonica).
const RE_INVOCACION = new RegExp(`${escapeRe(CABECERA_COMANDO)}(?:[^\\S\\n]+[^\\s\`'"()#]+)*`, 'g');

// ALCANCE DECLARADO, con su limitacion escrita porque es REAL y no vale fingir que no.
// Una mencion A PELO (la cabecera sin ningun argumento) NO se juzga. En este arbol hay 7 y
// las 7 son referencias EN PROSA al runner («commitImport en si no es testeable bajo
// node --test», «localStorage no existe en el runtime de node --test»), no invocaciones de
// la suite. Pero `node --test` a pelo es TAMBIEN una de las cuatro formas prohibidas por
// D-45-01 (barre tests/util/test-helpers.js y lo cuenta como test), asi que esa forma
// concreta queda FUERA de la vigilancia de este gate: separarla de la referencia en prosa
// exigiria una heuristica SOBRE LA PROSA, que es exactamente el defecto que esta fase
// existe para pagar. Queda prohibida por escrito en el catalogo de arriba; lo que no
// queda es vigilada. Se prefiere una garantia mas estrecha y honesta a una mas ancha y
// falsa — que es la leccion entera de CR-01.
const esAPelo = (inv) => inv === CABECERA_COMANDO;

// Una invocacion de FICHERO SUELTO es legitima: documenta como correr ESE fichero (11
// cabeceras lo hacen), no la suite entera, y no compite con la canonica. Se reconoce por
// no llevar ningun glob y terminar en un unico `.test.js`.
const RE_FICHERO_SUELTO = new RegExp(`^${escapeRe(CABECERA_COMANDO)} [^ *]+\\.test\\.js$`);

// LA MARCA DE CATALOGO, y por que existe una marca en vez de una heuristica. Hay lineas
// que escriben una forma no canonica LEGITIMAMENTE: la nombran para PROHIBIRLA (el parrafo
// de README.md:33, los avisos «NO `node --test tests/`» de tres cabeceras, el catalogo de
// las cuatro formas medidas de :1004-1017) o la usan como DATO (los goldens SRC_TRAMPA).
// Adivinar esa intencion de la prosa —buscar «NO», «falla», «prohibida»— seria la misma
// clase de heuristica fragil que este bloque existe para eliminar, y ademas convertiria
// cualquier reescritura del parrafo en un falso verde. Asi que no se adivina: se DECLARA,
// con esta marca literal, y la marca es lo UNICO que exime. Un agente que escriba una
// forma mala sin marcarla no tiene donde esconderse; uno que la marque deja constancia.
const MARCA_CATALOGO = 'FORMA-PROHIBIDA';

/**
 * Las invocaciones de un texto, clasificadas.
 *
 * @param {string} texto contenido de un fichero
 * @returns {{canonicas: number, cortas: string[]}} las canonicas se cuentan (la
 *   no-vacuidad necesita saber si hay alguna); las NO canonicas se devuelven `<n>: <inv>`
 *   para que el rojo diga DONDE y QUE, y no solo cuantas.
 */
const menciones = (texto) => {
  let canonicas = 0;
  const cortas = [];
  texto.split('\n').forEach((linea, i) => {
    if (linea.includes(MARCA_CATALOGO)) return;
    for (const m of linea.matchAll(RE_INVOCACION)) {
      const inv = m[0].trimEnd();
      if (inv === INVOCACION_CANONICA) canonicas += 1;
      else if (!esAPelo(inv) && !RE_FICHERO_SUELTO.test(inv)) cortas.push(`${i + 1}: ${inv}`);
    }
  });
  return { canonicas, cortas };
};

// `*` NO cruza `/` — es justo la propiedad que hace DISJUNTOS a los dos globs (ningun
// fichero se ejecuta dos veces) y la que hace que un fichero un nivel mas hondo
// (tests/fixtures/sub/x.test.js) quede FUERA y este gate lo delate.
const globARegex = (glob) => new RegExp(`^${escapeRe(glob).replace(/\\\*/g, '[^/]*')}$`);

// Enumeracion RECURSIVA del disco. La referencia nunca se escribe a mano (Pattern B):
// una lista de ficheros transcrita aqui seria verde para siempre y ciega a la suite 30.
const TESTS_EN_DISCO = readdirSync(new URL('../tests', import.meta.url), { recursive: true })
  .map((f) => String(f).replace(/\\/g, '/'))
  .filter((f) => f.endsWith('.test.js'))
  .map((f) => `tests/${f}`)
  .sort();

// Una ancla POR GLOB: un fichero que sabemos que existe y que solo puede casar ese
// glob. Si la enumeracion se rompe (ruta mal, API cambiada, cwd distinto) devuelve
// lista vacia y un deepEqual de [] contra [] pasa en VERDE certificando nada — el modo
// de fallo exacto de CR-01. Las anclas son lo que impide ese verde.
const ANCLAS_DE_ENUMERACION = [
  'tests/count-arrays-lockstep.test.js',
  'tests/fixtures/slot-variants-integration.test.js',
];

describe('invocacion canonica — ningun fichero de test queda fuera de la suite, y el contrato la documenta entera (DEUDA-01)', () => {
  test('cobertura: todo *.test.js del disco lo casa alguno de los globs canonicos', () => {
    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO (mismo razonamiento que :657-669).
    const anclasAusentes = ANCLAS_DE_ENUMERACION.filter((a) => !TESTS_EN_DISCO.includes(a));
    assert.deepEqual(
      anclasAusentes,
      [],
      `DEUDA-01 / T-45-01-03: la enumeracion del disco no ve ${anclasAusentes.join(', ')}, ` +
        `asi que la lista de ${TESTS_EN_DISCO.length} ficheros no es de fiar y la comprobacion ` +
        `de cobertura de abajo pasaria en verde sin haber mirado nada`
    );

    const regex = GLOBS_CANONICOS.map(globARegex);
    const fuera = TESTS_EN_DISCO.filter((rel) => !regex.some((re) => re.test(rel)));
    assert.deepEqual(
      fuera,
      [],
      `DEUDA-01: estos ficheros de test existen en disco y \`${INVOCACION_CANONICA}\` NO los ` +
        `corre, asi que sus aserciones no vigilan nada: ${fuera.join(', ')}. ` +
        `O se mueven a un directorio que los globs cubran, o se anade su glob a INVOCACION_CANONICA`
    );
  });

  // «con argumentos» no es un matiz de estilo: es el alcance real del reconocedor, y va en
  // el TITULO porque el titulo de un test es una afirmacion. La cabecera a pelo no se
  // juzga (ver `esAPelo`), y prometer aqui «todas» volveria a ser prosa mas ancha que el
  // codigo — que es el defecto que CR-01 encontro en este mismo titulo.
  test('lockstep: los ficheros de contrato documentan la invocacion canonica COMPLETA, en TODAS sus invocaciones con argumentos', () => {
    const desincronizados = [];
    for (const rel of CALL_SITES_INVOCACION) {
      // Un call-site RENOMBRADO vaciaria este gate en silencio (readSrc lanzaria, o
      // peor: la lista quedaria corta). Se acumula como infraccion explicita.
      if (!existsSync(new URL(`../${rel}`, import.meta.url))) {
        desincronizados.push(`${rel}: NO EXISTE`);
        continue;
      }
      const { canonicas, cortas } = menciones(readSrc(rel));
      // NO-VACUIDAD por fichero: un fichero de contrato que dejo de nombrar la suite no
      // esta «en lockstep», esta mudo, y el gate no puede darlo por bueno.
      if (canonicas === 0) {
        desincronizados.push(`${rel}: no documenta la invocacion canonica en ningun sitio`);
      }
      if (cortas.length > 0) {
        desincronizados.push(`${rel}: invocacion(es) NO canonicas sin marcar → ${cortas.join(' | ')}`);
      }
    }
    assert.deepEqual(
      desincronizados,
      [],
      `DEUDA-01: estos ficheros de contrato le dicen al autor una forma de correr la suite que ` +
        `no es \`${INVOCACION_CANONICA}\`: ${desincronizados.join(', ')}`
    );
  });

  test('regla de forma: ninguna cabecera de tests/ documenta la suite en una forma NO canonica', () => {
    // Las cabeceras de tests/ que documentan como se corre la suite entera no pueden
    // decir la forma ciega: seria «la prosa es mas cuidadosa que el codigo» AL REVES — el
    // patron exacto que esta fase existe para pagar. Esta regla es lo que las mantiene en
    // lockstep SIN una lista que mantener a mano: la cabecera numero 30 nace correcta, o
    // marca su forma mala como catalogo, o el gate la nombra.
    const enFormaCorta = TESTS_EN_DISCO.flatMap((rel) => {
      // EXENCION, unica y con motivo escrito: este propio fichero. Sus goldens
      // SRC_TRAMPA contienen la forma corta como DATO —reproducen el `/*` de
      // `tests/*.test.js` viviendo dentro de una CADENA, que es lo que prueba que
      // `sinComentarios` no lo trata como comentario—. Cambiarlos destruiria el caso
      // que congelan. La exencion no es un pase libre: el test de arriba ya exige que
      // este fichero declare INVOCACION_CANONICA, y su cabecera la lleva completa.
      if (rel === 'tests/count-arrays-lockstep.test.js') return [];
      return menciones(readSrc(rel)).cortas.map((c) => `${rel}:${c}`);
    });
    assert.deepEqual(
      enFormaCorta,
      [],
      `DEUDA-01: estas suites documentan una corrida de la suite en una forma que NO corre ` +
        `\`${INVOCACION_CANONICA}\` entera. O se corrigen, o —si la nombran para prohibirla— ` +
        `la linea declara la marca \`${MARCA_CATALOGO}\`: ${enFormaCorta.join(', ')}`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 7. La derivacion del banner del reporter (DEUDA-03, D-45-08)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE ESTE BLOQUE. El encabezado y el pie que scripts/run-validation-271.mjs
// IMPRIME transcribian un milestone y una fase concretos, y asi se quedaron durante
// CUATRO milestones: el banner anunciaba el gate de una version de hace cuatro mientras
// el proyecto cerraba la actual, en el fichero cuyo trabajo es precisamente que los
// numeros no enganen. Y la razon de que durase tanto NO es que nadie mirase: es que no
// existia NI UN SOLO TEST que cubriera la salida impresa de ese fichero
// (`grep -rn "Milestone v1.1" tests/` daba CERO resultados). Los counts del reporter
// llevan desde D-31-06 sin poder ser un numero magico; su banner podia ser cualquier
// cosa. Este bloque es lo UNICO que impide la quinta repeticion.
//
// QUE CONGELA, Y QUE NO. No congela QUE milestone es: escribir aqui la version de hoy
// seria un literal que envejece EXACTAMENTE IGUAL que el que se acaba de quitar, y el
// gate se limitaria a certificar su propia copia. Congela que el reporter NO LO
// TRANSCRIBE — ni siquiera el correcto de hoy. Que el valor salga del disco en runtime
// es cosa de la derivacion (`milestoneActivo`); que no vuelva a escribirse a mano, de
// este bloque.
//
// POR QUE SOURCE-ASSERT Y NO EJECUTAR EL REPORTER. La razon general de este fichero
// (D-44-07) y una propia: el reporter corre un guard con `process.exit(1)` AL CARGAR y
// declara en su cabecera que no se le shellea. Se lee su TEXTO, como a las demas fuentes.
//
// POR QUE SE MIRAN TODAS LAS LINEAS NO-COMENTARIO Y NO SOLO LAS QUE DICEN `console.log`.
// El esqueleto del research proponia quedarse con las lineas que contienen el token
// `console.log` y buscar la version ahi. Se MIDIO antes de adoptarlo —era hipotesis no
// ejecutada— y tiene un agujero: las llamadas MULTILINEA emiten salida en lineas que no
// contienen ese token. Con el literal de version viviendo en una linea de continuacion,
// la forma del research se queda VERDE. No es hipotetico: el pie que la Tarea 1 escribio
// es exactamente esa forma (un `console.log(` y el template literal en las lineas de
// abajo), asi que ese gate habria nacido vacuo sobre el codigo que existe para vigilar.
// La forma de aqui es mas ancha y no tiene el hueco: en un fichero que ya no debe nombrar
// ninguna version a mano, CUALQUIER version fuera de un comentario es la infraccion.
// Los comentarios quedan fuera A PROPOSITO, via `sinComentarios`: el bloque de historial
// contable del reporter es audit trail deliberado y TIENE derecho a nombrar milestones
// viejos, fechados y leidos como historia.

const STATE_MD = '.planning/STATE.md';

// El patron de una version de milestone escrita a mano: `v` minuscula pegada a
// digito-punto-digito, con limite de palabra delante. El research avisaba de que podia
// dar falsos positivos sobre otras cadenas impresas, asi que se MIDIO sobre el reporter
// real antes de aceptarlo: las cadenas impresas legitimas que mas se le parecen son
// `VAL_07_STRICT=1`, la enumeracion `VAL-04 + VAL-06 + VAL-08 + VAL-09` y la ruta
// `src/data/validation-state.js`, y NINGUNA dispara — las dos primeras van en mayuscula
// y sin punto decimal, la tercera no lleva digitos tras la `v`. No hubo que acotar nada.
// Lo que si es deliberado es que sea CASE-SENSITIVE: con el flag `i`, `VAL_07_STRICT=1`
// pasaria a ser candidato a falso rojo en cuanto alguien le pusiera un decimal al lado,
// y un falso rojo es un defecto igual que un falso verde — ademas invita a relajar el gate.
const VERSION_DE_MILESTONE = /\bv\d+\.\d+/;

/**
 * Las lineas de un texto YA LIMPIO de comentarios que escriben una version a mano,
 * numeradas para que el rojo diga DONDE y no solo QUE.
 *
 * @param {string[]} lineasLimpias texto pasado por `sinComentarios` y partido por lineas
 * @returns {string[]} `<n>: <linea>` por cada infraccion, en orden de aparicion
 */
const versionesEscritasAMano = (lineasLimpias) =>
  lineasLimpias
    .map((linea, i) => ({ linea, n: i + 1 }))
    .filter(({ linea }) => VERSION_DE_MILESTONE.test(linea))
    .map(({ linea, n }) => `${n}: ${linea.trim()}`);

/**
 * Las lineas que EMITEN salida. Se usa solo para la clausula de no-vacuidad: si tras
 * `sinComentarios` no queda ninguna, lo que se esta escaneando ya no es un reporter.
 */
const lineasQueEmiten = (lineasLimpias) =>
  lineasLimpias.filter((l) => /console\.(log|error)/.test(l));

/**
 * El milestone que declara el frontmatter de STATE.md, leido del DISCO.
 *
 * FAIL-LOUD, y es la POLARIDAD OPUESTA a la del reporter — la diferencia es deliberada y
 * por eso va escrita. El reporter tiene que poder imprimir su tabla entera aunque este
 * fichero falte: una etiqueta cosmetica no puede convertirse en un blocker del gate
 * (WR-09), asi que alli es `try/catch` con `?? null`. Aqui no: un TEST que no puede leer
 * su referencia no puede pasar en VERDE, porque su veredicto seria sobre nada. Misma
 * silueta que tests/content-fare-indefiniti.test.js, el unico precedente del repo de leer
 * un `.planning/*.md` desde el arnes.
 *
 * Se llama DENTRO del test y no a nivel de modulo (que es donde vive el precedente) por
 * ATRIBUCION: a nivel de modulo, mover STATE.md tumbaria los otros 31 tests de este
 * fichero con un fallo de CARGA, y un fallo de carga no se lee como «este gate se puso
 * rojo» sino como «este fichero esta roto» — la leccion de la Phase 45-02. Aqui la
 * referencia solo la necesita este bloque, asi que el rojo se queda donde se origina.
 */
const milestoneEnDisco = () => {
  const url = new URL(`../${STATE_MD}`, import.meta.url);
  let raw;
  try {
    raw = readFileSync(url, 'utf-8');
  } catch (e) {
    throw new Error(
      `DEUDA-03: no se puede leer ${STATE_MD} (${url.pathname}), que es la REFERENCIA de disco ` +
        `contra la que se comprueba que el banner del reporter DERIVA el milestone en vez de ` +
        `transcribirlo. Sin ella este gate no puede emitir ningun veredicto, asi que no puede ` +
        `pasar en verde. Causa: ${e.message}`
    );
  }
  const encontrado = raw.match(/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m);
  if (!encontrado) {
    throw new Error(
      `DEUDA-03: ${STATE_MD} existe pero no declara ninguna clave \`milestone:\` en una linea ` +
        `propia, asi que no hay REFERENCIA contra la que comprobar la derivacion del banner del ` +
        `reporter. Es la misma clave de la que ${REPORTER} deriva su etiqueta.`
    );
  }
  return encontrado[1].trim();
};

describe('DEUDA-03 — el reporter DERIVA el milestone de su banner y su pie, y no lo transcribe', () => {
  test(`${REPORTER}: ninguna linea fuera de comentario escribe una version de milestone a mano`, () => {
    const limpio = sinComentarios(readSrc(REPORTER)).split('\n');

    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO (mismo razonamiento que los bloques 3-bis y
    // 3-ter). Si `sinComentarios` blanquease el fichero ENTERO —el modo de fallo
    // catastrofico que CR-01 reprodujo: un `/*` mal reconocido abre bloque y se come
    // doscientas lineas— no quedaria ninguna version que encontrar y este test pasaria en
    // VERDE certificando NADA. Que sobrevivan lineas que emiten salida es la prueba de que
    // lo que se ha escaneado sigue siendo el reporter y no un fichero en blanco.
    const emiten = lineasQueEmiten(limpio);
    assert.ok(
      emiten.length > 0,
      `DEUDA-03 / T-45-03-06: tras pasar ${REPORTER} por sinComentarios no queda NI UNA linea ` +
        `que emita salida. O el reporter dejo de imprimir, o el escaner blanqueo el fichero ` +
        `entero (CR-01) — y con cero lineas la comprobacion de abajo pasaria en verde sin ` +
        `haber mirado nada`
    );

    const transcritas = versionesEscritasAMano(limpio);
    assert.deepEqual(
      transcritas,
      [],
      `DEUDA-03: estas lineas de ${REPORTER} escriben una version de milestone A MANO en vez ` +
        `de derivarla de ${STATE_MD}. Es exactamente la forma en que el banner acabo cuatro ` +
        `milestones desfasado sin que nada se pusiera rojo:\n  ${transcritas.join('\n  ')}`
    );
  });

  test(`${REPORTER}: ni siquiera el milestone CORRECTO de hoy aparece transcrito`, () => {
    const deDisco = milestoneEnDisco();
    const limpio = sinComentarios(readSrc(REPORTER)).split('\n');

    // La misma clausula de no-vacuidad, y por la misma razon: sin lineas que emitan, el
    // filtro de abajo devolveria [] y el gate certificaria nada.
    const emiten = lineasQueEmiten(limpio);
    assert.ok(
      emiten.length > 0,
      `DEUDA-03 / T-45-03-06: tras sinComentarios no queda ninguna linea que emita salida en ` +
        `${REPORTER}, asi que buscar en ellas el valor \`${deDisco}\` no demostraria nada`
    );

    const conElValorDeHoy = limpio
      .map((linea, i) => ({ linea, n: i + 1 }))
      .filter(({ linea }) => linea.includes(deDisco))
      .map(({ linea, n }) => `${n}: ${linea.trim()}`);

    assert.deepEqual(
      conElValorDeHoy,
      [],
      `DEUDA-03: ${REPORTER} contiene el valor \`${deDisco}\` escrito a mano. Que hoy sea el ` +
        `milestone CORRECTO no lo salva: es un literal, y envejecera exactamente igual que el ` +
        `que esta fase acaba de quitar. Tiene que derivarse de ${STATE_MD} en runtime:\n  ` +
        `${conElValorDeHoy.join('\n  ')}`
    );
  });
});

// Los goldens de este bloque. Como los demas del fichero, operan sobre cadenas literales
// de aqui mismo y no sobre el disco: es lo que los hace deterministas y lo que los
// convierte en fail-first COMMITTEADO. Un gate probado solo en verde es una afirmacion,
// no una garantia.

describe('DEUDA-03 — goldens del gate del banner: reporter que transcribe, reporter que deriva y salida legitima (fail-first)', () => {
  // El reporter ANTES de esta fase, en miniatura. Las dos formas del pecado a la vez:
  // el banner en UNA linea y el pie en una linea de CONTINUACION de un console.log
  // multilinea — que es la que el esqueleto del research dejaba pasar en verde.
  const SRC_REPORTER_QUE_TRANSCRIBE = [
    '    // Reporter del milestone v1.1 Phase 10 — historia, y por eso NO cuenta.',
    '    console.log(`${BOLD}Milestone v1.1 — gate Phase 10${RESET}`);',
    '    console.log(',
    '      `  → si OK: /gsd-complete-milestone v1.1`',
    '    );',
  ].join('\n');

  // El reporter DESPUES: mismas dos salidas, interpoladas. Y con un comentario de
  // historial contable que nombra milestones viejos, que es lo que el bloque de
  // procedencia del reporter real hace y tiene derecho a seguir haciendo.
  const SRC_REPORTER_QUE_DERIVA = [
    '    //   → 195 (v1.7 Phase 31): historial contable, audit trail deliberado.',
    '    //   → 183 (v1.6 Phase 27): idem, fechado y leido como historia.',
    '    console.log(`${BOLD}Gate de cierre de ${etiquetaMilestone}${RESET}`);',
    '    console.log(',
    '      `  → si OK: /gsd-complete-milestone ${milestoneActivo}`',
    '    );',
  ].join('\n');

  // Las cadenas impresas LEGITIMAS que mas se parecen a una version. Si alguna de estas
  // disparase, el gate daria un falso rojo sobre el reporter sano.
  const SRC_SALIDA_LEGITIMA = [
    "    console.log('  VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js');",
    '    console.log(`  VAL-06 (${TOTAL_EXPECTED}/${TOTAL_EXPECTED} validated)`);',
    '    console.log(`${BOLD}Gate de cierre — VAL-04 + VAL-06 + VAL-08 + VAL-09${RESET}`);',
    "    console.log('  - VAL-09: discrepa del que deriva src/data/validation-state.js.');",
    "    console.log('  - VAL-04: investiga los IDs sin 2 distinct by.');",
  ].join('\n');

  test('golden-NEGATIVO: un reporter que transcribe el milestone en su salida sale en la lista, banner Y pie', () => {
    const transcritas = versionesEscritasAMano(sinComentarios(SRC_REPORTER_QUE_TRANSCRIBE).split('\n'));
    assert.equal(
      transcritas.length,
      2,
      `DEUDA-03: las DOS lineas de salida transcriben y las dos tienen que salir; ` +
        `se encontraron ${transcritas.length}: ${transcritas.join(' | ')}`
    );
    // El banner, que vive en la MISMA linea que su console.log.
    assert.ok(
      transcritas.some((l) => l.includes('Milestone v1.1 — gate Phase 10')),
      'DEUDA-03: el banner transcrito tiene que salir en la lista de infracciones'
    );
    // Y el pie, que vive en una linea de CONTINUACION. Este es el que el esqueleto del
    // research dejaba pasar: su filtro se quedaba con las lineas que contienen el token
    // `console.log`, y esta no lo contiene. Es ademas la forma EXACTA del pie que escribe
    // la Tarea 1, asi que ese gate habria nacido vacuo sobre el codigo que vigila.
    assert.ok(
      transcritas.some((l) => l.includes('/gsd-complete-milestone v1.1')),
      'DEUDA-03: la linea de CONTINUACION de un console.log multilinea tambien emite salida; ' +
        'un gate que solo mira las lineas con el token console.log no la ve'
    );
    // Y el comentario de la primera linea NO cuenta: es historia y tiene derecho a nombrar
    // milestones viejos.
    assert.ok(
      !transcritas.some((l) => l.includes('historia, y por eso NO cuenta')),
      'DEUDA-03: sinComentarios va antes que el patron; un comentario que nombra un milestone ' +
        'viejo es audit trail, no una transcripcion'
    );
  });

  test('golden-POSITIVO: un reporter que DERIVA no infringe, y su historial contable puede nombrar milestones viejos', () => {
    assert.deepEqual(
      versionesEscritasAMano(sinComentarios(SRC_REPORTER_QUE_DERIVA).split('\n')),
      [],
      'DEUDA-03: interpolar el milestone es justo lo que el gate pide; y las dos lineas de ' +
        'historial contable que nombran v1.7 y v1.6 son comentarios, asi que no pueden ' +
        'convertirse en un falso rojo sobre el audit trail'
    );
  });

  test('golden de NO-FALSO-ROJO: las cadenas impresas legitimas del reporter no disparan el patron', () => {
    assert.deepEqual(
      versionesEscritasAMano(sinComentarios(SRC_SALIDA_LEGITIMA).split('\n')),
      [],
      'DEUDA-03: `VAL_07_STRICT=1`, la enumeracion de sub-gates, las acciones sugeridas y la ' +
        'ruta src/data/validation-state.js son salida legitima; un falso rojo aqui invitaria a ' +
        'relajar el gate igual que un falso verde invitaria a confiar en el'
    );
    // Y la no-vacuidad de este propio golden: si el reconocimiento de salida no viera
    // ninguna de estas lineas, el [] de arriba no probaria nada.
    assert.ok(
      lineasQueEmiten(sinComentarios(SRC_SALIDA_LEGITIMA).split('\n')).length === 5,
      'DEUDA-03: las 5 lineas de salida legitima tienen que reconocerse como salida, o el ' +
        'golden de arriba pasaria en verde sin haber mirado ninguna'
    );
  });
});
