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
import { fileURLToPath } from 'node:url';
// LA LIB COMPARTIDA, y se importa a proposito (D-44-07 prohibe importar el REPORTER,
// que ejecuta un guard y llama a process.exit al cargarse; una lib pura no tiene ese
// problema). Las tres funciones las consumen DOS superficies -- este GATE-03 y el
// sub-gate ANCLA-RATCHET del reporter --: dos copias de la misma doctrina divergen.
import {
  suelosNoEnteros,
  anclaCommiteadaEnHead as anclaEnHead,
  suelosQueBajaronRespectoDeHead,
} from '../scripts/lib/ancla-ratchet.mjs';

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
 * Y EL PRECIO DE ESE RESET, que hasta CR-02 este comentario no nombraba y presentaba
 * solo como virtud. Que el estado de cadena muera en el salto de linea significa que las
 * lineas de CONTINUACION de un template literal multilinea se escanean como CODIGO. Un
 * `//` en una de ellas —una URL, que es el caso mas plausible que hay— blanquea el resto
 * de esa linea aunque sea texto que el reporter IMPRIME; y si la continuacion llevase un
 * `/*`, se abre bloque y el dano deja de estar acotado a una linea: llega hasta el
 * siguiente `*\/` o hasta el final del fichero. Las dos cosas estan MEDIDAS. Los dos
 * limites —el literal de regex y la continuacion de template— los vigila ahora el guard
 * diferencial del bloque 7, que contrasta este escaner contra `sinComentariosNaive`.
 * La limitacion sigue siendo deliberada; lo que ya no es, es silenciosa.
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

/**
 * La REGION de texto que ocupa la declaracion de un array de conteo con nombre, YA
 * LIMPIA de comentarios: desde la linea `const <nombre> = [` hasta su `];`.
 *
 * POR QUE EXISTE (v2.1 Phase 46, D-46-17). Hasta la Phase 46 el reporter tenia UN solo
 * array que declaraba pares `slug` ↔ `file`, asi que contar sobre el fuente ENTERO era
 * lo mismo que contar sobre su region y no habia nada que acotar. Con el array de
 * cobertura de traduccion al lado ya no lo es, y las dos consecuencias son reales:
 *   1. La clausula de no-vacuidad del bloque 3-bis contaba 18 pares contra las 18
 *      categorias registradas, y con el array nuevo cuenta 19. Ese rojo es CORRECTO —la
 *      clausula muerde—, y la forma que admite un segundo array vigilado NO es sumarle
 *      un margen (eso la dejaria comparando una cifra que ya no describe nada, que es
 *      CR-01 verbatim) sino medir cada array en SU region.
 *   2. Sin acotar, un slug borrado de `CATEGORIES` pero vivo en el array de traduccion
 *      seguiria APARECIENDO anclado en el fuente entero: el gate del bloque 3 lo daria
 *      por enganchado estando ciego. Canal de ceguera NUEVO, abierto por el propio
 *      array que la Phase 46 añade, y cerrado por el acotado.
 *
 * DEVUELVE CADENA VACIA cuando la declaracion no aparece, y eso es deliberado: la
 * alternativa —devolver el fuente completo como «fallback»— volveria a mezclar los dos
 * arrays en silencio el dia que el reconocedor deje de casar. Una region vacia produce
 * cero pares, y cero pares ponen ROJA la clausula de no-vacuidad de quien la consuma,
 * que es el comportamiento correcto: renombrar el array no puede pasar desapercibido.
 *
 * El texto se pasa por `sinComentarios` ANTES de acotar, por la misma razon que
 * `slugsCiegos` y `paresSlugFile` (CR-01): un array entero envuelto en `/* *\/` no debe
 * declarar region. Y como `sinComentarios` PRESERVA la longitud de cada linea, la region
 * limpia sigue siendo comparable por posicion con el fichero crudo.
 *
 * @param {string} src texto fuente completo del fichero de conteo
 * @param {string} nombre identificador del array (`CATEGORIES`, …)
 * @returns {string} la region limpia, o `''` si el array no se declara
 */
export function regionDeArray(src, nombre) {
  const lineas = sinComentarios(src).split('\n');
  // Whitespace HORIZONTAL en los tres huecos, como todas las anclas de este fichero:
  // `\s*` cruzaria el salto de linea y fue un bug real (WR-07). Y la linea de apertura
  // tiene que ACABAR en el `[`, que es la forma en que este proyecto declara sus arrays
  // de conteo — un `[` seguido de la primera entrada en la misma linea no la declara.
  const apertura = new RegExp(
    `^[^\\S\\n]*const[^\\S\\n]+${escapeRe(nombre)}[^\\S\\n]*=[^\\S\\n]*\\[[^\\S\\n]*$`
  );
  const cierre = /^[^\S\n]*\];/;
  const i = lineas.findIndex((l) => apertura.test(l));
  if (i === -1) return '';
  for (let j = i + 1; j < lineas.length; j += 1) {
    if (cierre.test(lineas[j])) return lineas.slice(i, j + 1).join('\n');
  }
  return '';
}

// El directorio del contenido, del que se DERIVA que una categoria este cubierta de
// traduccion. Declarado como cadena para que el `grep` que lo busca lo encuentre.
const DIR_EJERCICIOS = 'content/exercises';

/**
 * Las categorias DECLARADAS CUBIERTAS de traduccion, DERIVADAS DEL DISCO: aquellas cuyo
 * fichero de contenido tiene al menos una variante `multiple-choice` con la clave
 * `translationES` presente.
 *
 * POR QUE NO `content/categories.json` (que es la referencia del bloque 3). Alli TODAS
 * las categorias registradas tienen que estar enganchadas; aqui solo las que YA estan
 * cubiertas, porque el milestone traduce por fases y exigir las 18 hoy seria un rojo
 * permanente e inservible — y un rojo inservible invita a relajar el gate.
 *
 * POR QUE NO UNA LISTA ESCRITA EN ESTE FICHERO. Es la doctrina literal de la cabecera:
 * seria un gate vacuo, verde para siempre, ciego al alta de la traduccion 97. La
 * consecuencia de derivarla es deliberada y es justo lo que se quiere: en cuanto una
 * categoria recibe su PRIMERA traduccion, el gate EXIGE que este enganchada. No hay
 * ventana en la que traducir sin enganchar salga verde.
 *
 * FAIL-LOUD, igual que `milestoneEnDisco`: un test que no puede leer su referencia no
 * puede pasar en VERDE, porque su veredicto seria sobre nada. Un `catch { continue }`
 * aqui convertiria un JSON corrupto en «esta categoria no esta cubierta» — silenciar la
 * referencia es exactamente la forma de gate vacuo que este fichero persigue. Se llama
 * DENTRO de los tests y no a nivel de modulo por ATRIBUCION (leccion de la Phase 45-02):
 * a nivel de modulo, un fichero corrupto tumbaria los demas tests con un fallo de CARGA,
 * que no se lee como «este gate se puso rojo» sino como «este fichero esta roto».
 *
 * @returns {string[]} los slugs cubiertos, en orden alfabetico de fichero
 */
export function categoriasDeclaradasCubiertas() {
  const dir = new URL(`../${DIR_EJERCICIOS}/`, import.meta.url);
  const ficheros = readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  if (ficheros.length === 0) {
    throw new Error(
      `D-46-17: ${DIR_EJERCICIOS} no contiene ningun .json, asi que no hay REFERENCIA de disco ` +
        `contra la que medir la ceguera del array de cobertura de traduccion.`
    );
  }
  const cubiertas = [];
  for (const f of ficheros) {
    let data;
    try {
      data = JSON.parse(readFileSync(new URL(f, dir), 'utf-8'));
    } catch (e) {
      throw new Error(
        `D-46-17: ${DIR_EJERCICIOS}/${f} no parsea (${e.message}), asi que no se puede saber si ` +
          `declara traducciones. Tratarlo como «no cubierta» convertiria un JSON corrupto en un ` +
          `gate verde, que es el modo de fallo que este fichero existe para cerrar.`
      );
    }
    if (!Array.isArray(data?.exercises)) continue;
    const declara = data.exercises.some(
      (ex) =>
        ex?.type === 'multiple-choice' &&
        Array.isArray(ex.variants) &&
        ex.variants.some(
          (v) => v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'translationES')
        )
    );
    if (declara) cubiertas.push(f.replace(/\.json$/, ''));
  }
  return cubiertas;
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
    console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');  // FORMA-PROHIBIDA: dato del golden
  `;
    // La marca de la linea de arriba vive DENTRO del golden a proposito. La forma corta
    // esta ahi como DATO —es el `/*` que tiene que sobrevivir dentro de una cadena—, no
    // como instruccion, y desde que este fichero es call-site del lockstep (WR-05) hace
    // falta declararlo. Va como comentario de linea del pseudo-fuente, asi que
    // `sinComentarios` lo blanquea y ninguna de las dos aserciones de abajo lo ve.
    assert.deepEqual(
      slugsCiegos(SRC_TRAMPA, ['fare-indefiniti']),
      [],
      'CR-01: el `/*` de `exercises/*.json` esta dentro de un comentario de linea y no abre bloque'
    );
    // Y el `/*` de dentro de la cadena del console.log tampoco.
    assert.equal(
      sinComentarios(SRC_TRAMPA).includes("node --test tests/*.test.js"), // FORMA-PROHIBIDA: dato
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

// Los NOMBRES de los dos arrays parametricos del reporter, la unica transcripcion de cada
// uno en todo el arbol de tests: el de SLOTS (desde v1.0) y el de cobertura de TRADUCCION
// (v2.1 Phase 46, GATE-01). Van aqui arriba y no junto a su bloque porque el acotado por
// region los necesita en los DOS gates, el de slots y el de traduccion.
const ARRAY_DE_SLOTS = 'CATEGORIES';
const ARRAY_DE_TRADUCCION = 'TRANSLATION_COVERAGE';

// La expresion de plantilla con la que una fuente DERIVA la ruta del slug en su bucle
// de consumo. Declararla asi (cadena en comillas simples, sin interpolar) es lo que
// permite buscarla como TEXTO en la fuente.
const DERIVA_LA_RUTA = 'content/exercises/${slug}.json';

describe('gate anti-ceguera — el par slug ↔ file de cada entrada apunta a su PROPIO fichero (INT-02, D-40-03)', () => {
  test(`${REPORTER}: declara un par slug↔file por categoria registrada y ninguno esta cruzado`, () => {
    const SRC = readSrc(REPORTER);
    // ACOTADO POR REGION (v2.1 Phase 46, D-46-17). Hasta la Phase 46 el reporter tenia UN
    // solo array que declaraba pares, asi que contar sobre el fuente entero era lo mismo
    // que contar sobre esta region. Con el array de cobertura de traduccion al lado, el
    // recuento subio a 19 contra las 18 categorias registradas y esta clausula se puso
    // ROJA — correctamente: dejaba de contar lo que dice contar. La forma que admite un
    // segundo array vigilado es medir cada uno en SU region, no sumarle un margen; un
    // margen la habria dejado comparando una cifra que ya no describe nada (CR-01).
    const region = regionDeArray(SRC, ARRAY_DE_SLOTS);
    const pares = paresSlugFile(region);

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

    // Y las 18 registradas tienen que estar ancladas DENTRO de esta region, no en
    // cualquier parte del fichero. Es un canal de ceguera NUEVO, abierto por el propio
    // array que la Phase 46 añade: el gate del bloque 3 escanea el fuente ENTERO, asi que
    // una categoria BORRADA de `CATEGORIES` y viva en el array de cobertura de traduccion
    // seguiria apareciendo anclada y el bloque 3 la daria por enganchada estando ciega
    // para el conteo de slots. El acotado por region es lo que lo cierra, y sin esta
    // asercion el cierre no estaria comprobado.
    const ciegasEnLaRegion = slugsCiegos(region, SLUGS_REGISTRADOS);
    assert.deepEqual(
      ciegasEnLaRegion,
      [],
      `INT-02 / D-46-17: estas categorias registradas NO estan ancladas dentro de la region de ` +
        `\`${ARRAY_DE_SLOTS}\` de ${REPORTER}. Que el bloque 3 las vea ancladas en el fichero no ` +
        `basta desde que hay un segundo array que declara los mismos slugs: el conteo de SLOTS ` +
        `sale de este array y solo de este: ${ciegasEnLaRegion.join(', ')}`
    );

    const cruzados = paresCruzados(region);
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

  test('las lineas de entrada del array de cobertura de TRADUCCION tambien sobreviven byte a byte (D-46-17)', () => {
    // La extension de DEUDA-02 al array nuevo. El bloque de arriba recorre las fuentes
    // ENTERAS, asi que una linea de entrada del array de traduccion ya entra en su
    // recuento; lo que le falta es una clausula de no-vacuidad PROPIA. Sin ella, el dia
    // que el array se renombre o el acotado deje de casar, la comprobacion de arriba
    // seguiria verde con las lineas del array de SLOTS y nadie sabria que las del de
    // traduccion dejaron de mirarse. La referencia se DERIVA del disco, como todo aqui.
    const declaradas = categoriasDeclaradasCubiertas();
    const crudo = readSrc(REPORTER);
    const regionCruda = regionDeArray(crudo, ARRAY_DE_TRADUCCION).split('\n');
    const lineasDeEntrada = regionCruda.filter((l) => LINEA_DE_ENTRADA.test(l));

    assert.ok(
      lineasDeEntrada.length >= declaradas.length,
      `D-46-17 / DEUDA-02: el reconocimiento de lineas de entrada ve ${lineasDeEntrada.length} ` +
        `lineas en la region de \`${ARRAY_DE_TRADUCCION}\` de ${REPORTER} y el disco declara ` +
        `${declaradas.length} categorias cubiertas: o el reporter dejo de declararlas, o el ` +
        `acotado por region dejo de encontrar el array — y con cero lineas la comprobacion de ` +
        `abajo pasaria en verde sin haber mirado ninguna`
    );

    // `regionDeArray` devuelve el texto YA LIMPIO de comentarios, y `sinComentarios`
    // preserva la longitud de cada linea, asi que las dos vistas son comparables por
    // posicion: la region limpia y las mismas lineas leidas del fichero crudo.
    const lineasCrudas = crudo.split('\n');
    const alteradas = lineasDeEntrada.filter((linea) => !lineasCrudas.includes(linea));
    assert.deepEqual(
      alteradas,
      [],
      `D-46-17 / DEUDA-02: estas lineas de entrada del array de cobertura de traduccion NO ` +
        `sobreviven identicas al escaner, asi que el ancla del gate no las ve como el fichero las ` +
        `escribe. O estan envueltas en un comentario de bloque —y entonces la ceguera ya existe—, ` +
        `o un literal de expresion regular con comilla desparejada desalineo el escaner en esa ` +
        `linea:\n  ${alteradas.join('\n  ')}`
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
// 3-quater. GATE-02 — el array de cobertura de TRADUCCION (v2.1 Phase 46, D-46-17)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE, Y POR QUE AQUI Y NO DENTRO DEL REPORTER. El reporter gana en la
// Phase 46 un SEGUNDO array parametrico, el de cobertura de traduccion, con la misma
// forma que `CATEGORIES` y expuesto al MISMO modo de fallo: una categoria que ya
// tiene traducciones en disco y no esta enganchada al array desaparece del total sin
// que nada se ponga rojo, y el reporter emite un PASS de cobertura ciego a esas
// variantes. Es literalmente el `225/225 PASS` de las Phases 41/42/43 trasladado de
// los slots a las variantes. El anti-ceguera necesita MUTAR el array y comprobar que
// aparece el rojo: eso es un test, y meterlo dentro del reporter significaria que el
// reporter se testea a si mismo (D-46-17).
//
// LA REFERENCIA SE DERIVA DEL DISCO, y no de una lista escrita aqui. Es la doctrina
// literal de la cabecera de este fichero: una lista a mano seria un gate vacuo, verde
// para siempre. Pero la referencia NO puede ser `content/categories.json` como en el
// bloque 3: alli TODAS las categorias registradas tienen que estar enganchadas, y aqui
// solo las que ya estan CUBIERTAS de traduccion — el milestone traduce por fases, asi
// que exigir las 18 hoy seria un rojo permanente e inservible. La referencia correcta
// es la que el DISCO declara: una categoria esta declarada cubierta cuando su fichero
// de contenido tiene al menos una variante `multiple-choice` con la clave
// `translationES`. Consecuencia deliberada: en cuanto una categoria recibe su PRIMERA
// traduccion, este gate EXIGE que este enganchada. No hay ventana en la que traducir
// sin enganchar salga verde.
//
// POR QUE HACE FALTA ACOTAR POR REGION. Con DOS arrays que declaran pares en el mismo
// fichero, `paresSlugFile(SRC)` sobre el fuente ENTERO mezcla los de los dos: la
// clausula de no-vacuidad del bloque 3-bis contaba 18 pares contra 18 categorias
// registradas y con el array nuevo cuenta 19. Ese rojo es CORRECTO —la clausula
// muerde—, y la forma que admite un segundo array vigilado no es relajar el recuento
// sino medir cada array en SU region. Sumar un margen habria dejado la clausula
// contando una cifra que ya no describe nada.

describe('GATE-02 — goldens del array de cobertura de traduccion: ausencia, prefijo, un byte, comentario, dos lineas y cruce (fail-first, D-46-17)', () => {
  // Los DOS arrays en el mismo pseudo-fuente, que es la forma REAL del reporter desde
  // la Phase 46. Sin el hermano de slots delante, ningun golden probaria el acotado por
  // region — y el acotado es justo lo que este bloque introduce.
  const SRC_TRAD_VACIO = `
    const CATEGORIES = [
      { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 20 },
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
    ];

    const TRANSLATION_COVERAGE = [
    ];
  `;

  const SRC_TRAD_SOLO_HERMANO = `
    const CATEGORIES = [
      { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 20 },
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
    ];

    const TRANSLATION_COVERAGE = [
      { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: mcVariantCountOf('content/exercises/avere.json') },
    ];
  `;

  // La colision de prefijo (D-40-03) sobre el array nuevo: `fare-ind` es prefijo de
  // `fare-indicativo` y de `fare-indefiniti`, asi que un `includes` daria verde a una
  // de las dos con solo la otra presente. El slug se exige COMPLETO byte a byte.
  const SRC_TRAD_PREFIJO = `
    const TRANSLATION_COVERAGE = [
      { slug: 'fare-ind',                 file: 'content/exercises/fare-ind.json',                 expected: mcVariantCountOf('content/exercises/fare-ind.json') },
    ];
  `;

  // UN SOLO BYTE de diferencia (la `s` final). El copia-pega con un dedo torcido es el
  // gesto plausible, y sin identidad byte a byte pasaria por enganche.
  const SRC_TRAD_UN_BYTE = `
    const TRANSLATION_COVERAGE = [
      { slug: 'preposicione',             file: 'content/exercises/preposicione.json',             expected: mcVariantCountOf('content/exercises/preposicione.json') },
    ];
  `;

  const SRC_TRAD_COMENTADO_LINEA = `
    const TRANSLATION_COVERAGE = [
      // { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: mcVariantCountOf('content/exercises/preposiciones.json') },
    ];
  `;

  // El gesto del «toggle block comment» del editor, que es el que CR-01 encontro
  // abierto: el `/* */` deja las lineas envueltas byte a byte identicas.
  const SRC_TRAD_COMENTADO_BLOQUE = `
    const TRANSLATION_COVERAGE = [
      /*
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: mcVariantCountOf('content/exercises/preposiciones.json') },
      */
    ];
  `;

  // WR-07 sobre el array nuevo: la clave al final de una linea y el valor en la
  // siguiente. Con `\\s*` en el hueco esto CASABA; con whitespace horizontal no.
  const SRC_TRAD_DOS_LINEAS = `
    const TRANSLATION_COVERAGE = [
      { slug:
        'preposiciones', file: 'content/exercises/preposiciones.json', expected: 96 },
    ];
  `;

  const SRC_TRAD_CRUZADO = `
    const TRANSLATION_COVERAGE = [
      { slug: 'preposiciones',            file: 'content/exercises/avere.json',                    expected: mcVariantCountOf('content/exercises/avere.json') },
    ];
  `;

  const SRC_TRAD_COMPLETO = `
    const CATEGORIES = [
      { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 20 },
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
    ];

    const TRANSLATION_COVERAGE = [
      { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: mcVariantCountOf('content/exercises/preposiciones.json') },
      { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: mcVariantCountOf('content/exercises/avere.json') },
    ];
  `;

  test('golden de ACOTADO POR REGION: la region del array de traduccion NO ve las entradas del array de slots', () => {
    // Es la aserción que hace que todos los demas goldens de este bloque signifiquen
    // algo. Sin acotado, `preposiciones` sale enganchada por la entrada del array de
    // SLOTS y la ceguera del array de TRADUCCION se certifica en verde: el bug exacto
    // que este bloque existe para cazar, con la forma de un gate que mira el fichero
    // entero en vez del array que le toca.
    const regionSlots = regionDeArray(SRC_TRAD_VACIO, ARRAY_DE_SLOTS);
    const regionTrad = regionDeArray(SRC_TRAD_VACIO, ARRAY_DE_TRADUCCION);

    assert.deepEqual(
      slugsCiegos(regionSlots, ['preposiciones']),
      [],
      'D-46-17: el array de SLOTS si engancha preposiciones, y la region tiene que verlo'
    );
    assert.deepEqual(
      slugsCiegos(regionTrad, ['preposiciones']),
      ['preposiciones'],
      'D-46-17: la region del array de TRADUCCION esta vacia; la entrada del hermano no la salva'
    );
    assert.deepEqual(
      paresSlugFile(regionTrad),
      [],
      'D-46-17: cero pares en la region vacia — y son los pares del hermano los que los inventarian'
    );
  });

  test('golden de REGION AUSENTE: un array que no se declara devuelve region vacia, no el fichero entero', () => {
    // El modo de fallo del propio acotador: si el reconocedor de la declaracion deja de
    // casar y el helper devolviese el fuente completo, el gate volveria a mezclar los dos
    // arrays en silencio. Y si devolviese algo no vacio, la clausula de no-vacuidad de
    // mas abajo no podria delatar la desaparicion del array.
    assert.equal(
      regionDeArray(SRC_TRAD_PREFIJO, ARRAY_DE_SLOTS),
      '',
      'D-46-17: el pseudo-fuente no declara el array de slots, asi que su region no existe'
    );
    assert.equal(
      regionDeArray('const OTRA_COSA = 1;\n', ARRAY_DE_TRADUCCION),
      '',
      'D-46-17: sin declaracion no hay region, y una region vacia pone rojo la no-vacuidad'
    );
  });

  test('golden-NEGATIVO de ARRAY VACIO: la categoria declarada cubierta sale CIEGA', () => {
    const region = regionDeArray(SRC_TRAD_VACIO, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones']),
      ['preposiciones'],
      'D-46-17: es la MUTACION 3 de D-46-18 en miniatura — declarada cubierta y sin enganchar'
    );
  });

  test('golden-NEGATIVO de SOLO EL HERMANO: ciega la ausente y solo la ausente', () => {
    const region = regionDeArray(SRC_TRAD_SOLO_HERMANO, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['avere', 'preposiciones']),
      ['preposiciones'],
      'D-46-17: la entrada viva de avere no puede hacer pasar por enganchada a preposiciones'
    );
  });

  test('golden-NEGATIVO de COLISION DE PREFIJO: un slug que es prefijo del declarado NO engancha (D-40-03)', () => {
    const region = regionDeArray(SRC_TRAD_PREFIJO, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['fare-indicativo', 'fare-indefiniti']),
      ['fare-indicativo', 'fare-indefiniti'],
      'D-40-03: `fare-ind` no ancla a ninguno de los dos hermanos del prefijo ambiguo'
    );
  });

  test('golden-NEGATIVO de UN SOLO BYTE: un slug que difiere en un byte deja la categoria CIEGA', () => {
    const region = regionDeArray(SRC_TRAD_UN_BYTE, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones']),
      ['preposiciones'],
      'D-46-17: la identidad del ancla es byte a byte; `preposicione` no es `preposiciones`'
    );
  });

  test('golden-NEGATIVO de ENTRADA COMENTADA CON //: no ancla nada (sinComentarios va PRIMERO)', () => {
    const region = regionDeArray(SRC_TRAD_COMENTADO_LINEA, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones']),
      ['preposiciones'],
      'G-44-3-WR01: comentar la entrada «temporalmente» la saca del array de cobertura'
    );
    assert.deepEqual(paresSlugFile(region), [], 'la entrada comentada no declara par');
  });

  test('golden-NEGATIVO de ENTRADA EN BLOQUE: envuelta en /* */ no ancla nada (CR-01)', () => {
    const region = regionDeArray(SRC_TRAD_COMENTADO_BLOQUE, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones']),
      ['preposiciones'],
      'CR-01: el /* */ deja la linea abriendo con `{`; sin quitar comentarios el ancla la aceptaba'
    );
    assert.deepEqual(paresSlugFile(region), [], 'CR-01: cero pares fantasma dentro del bloque');
  });

  test('golden-NEGATIVO de SLUG A DOS LINEAS: la clave y su valor en lineas distintas NO forman par (WR-07)', () => {
    const region = regionDeArray(SRC_TRAD_DOS_LINEAS, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      paresSlugFile(region),
      [],
      'WR-07: el hueco tras `slug:` es whitespace HORIZONTAL; esta forma no declara par'
    );
    // Y es la mutacion que hace VACUO el gate sin dejar ninguna categoria «ausente» a la
    // vista: la entrada esta ahi, escrita, y el extractor no la ve. Por eso la clausula de
    // no-vacuidad tiene que ir ANTES del deepEqual de ciegas.
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones']),
      ['preposiciones'],
      'WR-07: los dos helpers comparten ancla de verdad, no solo en el comentario'
    );
  });

  test('golden-NEGATIVO de PAR CRUZADO: el slug de una categoria con el fichero de otra se delata (D-40-03)', () => {
    const region = regionDeArray(SRC_TRAD_CRUZADO, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      paresCruzados(region),
      ['preposiciones -> content/exercises/avere.json'],
      'D-40-03: con el fichero cruzado, el expected derivado leeria las variantes de OTRA categoria'
    );
  });

  test('golden-POSITIVO: con las declaradas enganchadas a su propio fichero, cero ciegas y cero cruzadas', () => {
    const region = regionDeArray(SRC_TRAD_COMPLETO, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(region, ['preposiciones', 'avere']),
      [],
      'D-46-17: el gate no debe inventar ceguera donde el enganche existe'
    );
    assert.deepEqual(paresCruzados(region), []);
    assert.equal(paresSlugFile(region).length, 2);
  });

  test('ORDERING: permutar las entradas del array no cambia el conjunto de ciegas ni de cruzadas', () => {
    // El veredicto agrega y compara CONJUNTOS; no cortocircuita en la primera entrada ni
    // depende del orden de recorrido. Un gate sensible al orden se pondria verde o rojo
    // por reordenar columnas, que es una edicion cosmetica.
    const permutado = SRC_TRAD_COMPLETO.replace(
      /(\{ slug: 'preposiciones',[^\n]*\n)(\s*\{ slug: 'avere',[^\n]*\n)/,
      '$2$1'
    );
    assert.notEqual(permutado, SRC_TRAD_COMPLETO, 'la permutacion tiene que haber ocurrido de verdad');

    const region = regionDeArray(SRC_TRAD_COMPLETO, ARRAY_DE_TRADUCCION);
    const regionPermutada = regionDeArray(permutado, ARRAY_DE_TRADUCCION);
    assert.deepEqual(
      slugsCiegos(regionPermutada, ['preposiciones', 'avere']),
      slugsCiegos(region, ['preposiciones', 'avere'])
    );
    assert.deepEqual(paresCruzados(regionPermutada), paresCruzados(region));
    assert.deepEqual(
      [...paresSlugFile(regionPermutada)].map((p) => p.slug).sort(),
      [...paresSlugFile(region)].map((p) => p.slug).sort(),
      'el gate compara CONJUNTOS de slugs, no secuencias'
    );
  });
});

describe('GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)', () => {
  test(`${REPORTER}: ninguna categoria con traduccion en disco queda fuera del array de cobertura de traduccion`, () => {
    const declaradas = categoriasDeclaradasCubiertas();
    const region = regionDeArray(readSrc(REPORTER), ARRAY_DE_TRADUCCION);
    const pares = paresSlugFile(region);
    const ciegas = slugsCiegos(region, declaradas);
    const cruzados = paresCruzados(region);

    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO, por el mismo motivo que en el bloque 3-bis:
    // un extractor por regex que deja de casar devuelve [] y `deepEqual([], [])` pasa en
    // VERDE certificando NADA. La referencia se DERIVA del disco y las dos causas reales
    // se nombran las dos, porque el diagnostico no puede elegir una.
    assert.ok(
      declaradas.length > 0,
      `D-46-17: ningun fichero de content/exercises declara una variante multiple-choice con ` +
        `translationES, asi que este gate no tiene referencia contra la que medir la ceguera ` +
        `del array de cobertura de traduccion. O el corpus perdio todas sus traducciones, o el ` +
        `recorrido del disco dejo de reconocer el campo`
    );
    assert.equal(
      pares.length,
      declaradas.length,
      `D-46-17: el extractor ve ${pares.length} pares en la region de \`${ARRAY_DE_TRADUCCION}\` ` +
        `de ${REPORTER} y el disco declara ${declaradas.length} categorias cubiertas de traduccion ` +
        `(${declaradas.join(', ')}). Las dos causas son reales: o el reporter dejo de declarar una ` +
        `entrada —y entonces la ceguera ya existe, y quedarian CIEGAS: ${ciegas.join(', ') || 'ninguna'}—, ` +
        `o el extractor dejo de ver su array (una entrada partida en dos lineas, un slug detras del ` +
        `file, la declaracion renombrada). Con lista vacia esta comprobacion pasaria en verde`
    );

    assert.deepEqual(
      ciegas,
      [],
      `D-46-17 / GATE-02: estas categorias tienen traducciones en disco y NO estan enganchadas al ` +
        `array de cobertura de traduccion de ${REPORTER}, asi que sus variantes desaparecen del ` +
        `total y el sub-gate de cobertura emite un PASS ciego a ellas — el \`225/225 PASS\` de las ` +
        `Phases 41/42/43 trasladado a las variantes: ${ciegas.join(', ')}`
    );
    assert.deepEqual(
      cruzados,
      [],
      `D-40-03 / GATE-02: una entrada del array de cobertura de traduccion declara el fichero de ` +
        `OTRA categoria, asi que su expected derivado cuenta las variantes equivocadas: ` +
        `${cruzados.join(', ')}`
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
// teclea. Y ese argumento estuvo TRES fases diciendo `node --test tests/*.test.js`, // FORMA-PROHIBIDA
// que NO casa tests/fixtures/*.test.js. Los dos ficheros de ahi —63 aserciones, una
// de ellas el back-compat gate de las 18 categorias reales— llevaban desde la Phase 15
// y la Phase 39 sin correr NUNCA en la suite. Desincronizar un `expected` de
// REAL_CATEGORIES dejaba la suite en `# pass 1101 / # fail 0 / exit 0`: verde sobre
// una asercion que nadie ejecutaba.
//
// POR QUE ESTA FORMA Y NO OTRA (D-45-01, las cuatro medidas en v22.20.0). Cada linea de
// este catalogo lleva la marca FORMA-PROHIBIDA: es lo que la exime del gate de lockstep,
// que desde WR-05 tambien mira ESTE fichero. La marca dice «aqui la forma mala es el
// SUJETO, no la instruccion»; sin ella, documentar una prohibicion se pondria rojo.
//   - `node --test tests/`            → exit 1, `Cannot find module '…/tests'`. Node   // FORMA-PROHIBIDA
//                                        resuelve el path como MODULO. No funciona.
//   - `node --test --recursive tests/` → `node: bad option: --recursive`. La opcion NO  // FORMA-PROHIBIDA
//                                        EXISTE en v22.20.0. Es el fix que proponia el
//                                        code review de la Phase 44: hipotesis de
//                                        revisor, no evidencia.
//   - `node --test tests/**/*.test.js` → sin `globstar` (el estado por defecto de este   // FORMA-PROHIBIDA
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
// suite. Los ficheros de tests/ NO van aqui —los cubre la regla de forma, que no hay que
// mantener a mano cuando nace la suite numero 30— con UNA excepcion, este mismo fichero.
//
// POR QUE ESTA ESTE FICHERO AQUI (WR-05). El comentario de la exencion de la regla de
// forma afirmaba: «la exencion no es un pase libre: el test de arriba ya exige que este
// fichero declare INVOCACION_CANONICA». NINGUN test exigia eso — esta lista no lo
// contenia. Medido: degradar la cabecera de ESTE fichero a la forma corta dejaba la suite
// en `# pass 36 / # fail 0`. Era una justificacion falsa sosteniendo una exencion de 1448
// lineas, y la exencion cubria tambien la cabecera, que no es un golden. Ahora la
// afirmacion es cierta porque el fichero esta en la lista, y la exencion global sobra: lo
// que legitimamente escribe formas malas (los goldens SRC_TRAMPA y el catalogo de
// :1008-1026) lo declara linea a linea con la marca FORMA-PROHIBIDA.
const CALL_SITES_INVOCACION = [
  'README.md',
  '.claude/skills/gsd-validate-batch/SKILL.md',
  '.claude/skills/it-add-song/SKILL.md',
  'scripts/run-validation-271.mjs',
  'tests/count-arrays-lockstep.test.js',
];

// POR QUE SE RECONOCE LO QUE HAY Y NO UNA FORMA MALA CONCRETA (CR-01 del review de esta
// misma fase). La version anterior contaba ocurrencias de UNA sola forma degradada
// —`node --test tests/*.test.js`— y deducia las malas por aritmetica:   // FORMA-PROHIBIDA
// `cortas = cuenta(prefijo) - cuenta(canonica)`. Cualquier OTRA manera de escribirlo mal
// aportaba CERO ocurrencias de prefijo, salia `cortas = 0` y el gate pasaba en VERDE.
// Medido sobre una copia del arbol: revertir UNA de las dos invocaciones de README.md a
// `node --test tests/` dejaba `# fail 0`; una cabecera de test nueva con   // FORMA-PROHIBIDA
// `node --test tests/` o con `node --test --recursive tests/`, tambien. Es decir: el gate // FORMA-PROHIBIDA
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
// de README.md:33, los avisos «NO `node --test tests/`» de tres cabeceras, el catalogo de // FORMA-PROHIBIDA
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
    // YA NO HAY EXENCION DE FICHERO (WR-05). La habia para este mismo fichero, de 1448
    // lineas, justificada por dos goldens de las lineas 518 y 527 y por una afirmacion
    // falsa («el test de arriba ya exige que este fichero declare INVOCACION_CANONICA»:
    // no estaba en CALL_SITES_INVOCACION, y degradar su cabecera salia VERDE). Lo que
    // legitimamente escribe una forma mala se declara ahora linea a linea con la marca,
    // que es una exencion del tamano del motivo en vez del tamano del fichero.
    const enFormaCorta = TESTS_EN_DISCO.flatMap((rel) =>
      menciones(readSrc(rel)).cortas.map((c) => `${rel}:${c}`)
    );
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
 * Un SEGUNDO reconocedor de comentarios, deliberadamente INGENUO e independiente.
 *
 * No entiende cadenas: decide linea a linea mirando solo como empieza. Por eso NO puede
 * desalinearse DENTRO de una cadena — que es el unico modo de fallo de `sinComentarios`.
 * El sesgo es el contrario, y esa oposicion es todo el valor: los dos se equivocan en
 * sitios distintos, asi que un desacuerdo entre ellos es la firma de que uno se
 * desalineo. No sustituye al escaner (seria peor: blanquearia el `/*` de
 * `content/exercises/*.json` de un comentario de linea, el falso rojo que el bloque 3-ter
 * congela); solo lo contrasta.
 *
 * @param {string} src texto fuente
 * @returns {string[]} las lineas, con las que son comentario ENTERO vaciadas
 */
const sinComentariosNaive = (src) => {
  let bloque = false;
  return src.split('\n').map((l) => {
    const t = l.trim();
    if (bloque) {
      if (t.includes('*/')) bloque = false;
      return '';
    }
    if (t.startsWith('/*')) {
      if (!t.includes('*/')) bloque = true;
      return '';
    }
    if (t.startsWith('//') || t.startsWith('*')) return '';
    return l;
  });
};

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
  if (encontrado) return encontrado[1].trim();
  // TRES causas, no dos (WR-04). Este throw decia «no declara ninguna clave milestone» tanto
  // cuando la clave faltaba como cuando estaba y su valor no era un token unico. Medido con
  // `milestone: v2.0 final`: el rojo mandaba al autor a buscar una clave que estaba delante
  // de el. Un diagnostico falso en un mensaje de error es del mismo tipo de defecto que un
  // banner desfasado, y este fichero no puede permitirselo. Misma distincion que hace
  // `derivacionDelMilestone` en el reporter, por simetria deliberada.
  const conClave = raw.match(/^milestone:[^\n]*$/m);
  throw new Error(
    conClave
      ? `DEUDA-03: ${STATE_MD} declara \`${conClave[0].trim().replace(/[\x00-\x1F\x7F]/g, '').slice(0, 80)}\`, ` +
          `y eso no es un token unico: el valor de \`milestone:\` tiene que ser UNA sola palabra ` +
          `sin espacios, que es lo que ${REPORTER} sabe derivar. Con este valor el banner del ` +
          `reporter se degrada a «milestone desconocido» y este gate se queda sin REFERENCIA.`
      : `DEUDA-03: ${STATE_MD} existe pero no declara ninguna clave \`milestone:\` en una linea ` +
          `propia, asi que no hay REFERENCIA contra la que comprobar la derivacion del banner del ` +
          `reporter. Es la misma clave de la que ${REPORTER} deriva su etiqueta.`
  );
};

describe('DEUDA-03 — el reporter DERIVA el milestone de su banner y su pie, y no lo transcribe', () => {
  // GUARD DIFERENCIAL, y va PRIMERO porque es lo que hace que los dos veredictos de abajo
  // valgan algo (CR-02 del review de esta fase).
  //
  // EL AGUJERO QUE TAPA. Los dos tests de abajo escanean sobre `sinComentarios(REPORTER)`.
  // Si ese escaner se desalinea, blanquea CODIGO real y el escaneo de versiones se queda
  // ciego justo ahi — en verde. La clausula de no-vacuidad de abajo NO puede verlo, y lo
  // dice su propio comentario: solo detecta el blanqueo TOTAL. El blanqueo PARCIAL, que es
  // el realista, pasa. Las dos formas, MEDIDAS sobre el arbol antes de este guard:
  //   - un literal de expresion regular con un `/*` dentro (`/tests\/*.test.js/`) abre
  //     bloque, no encuentra `*/`, y blanquea DESDE AHI HASTA EL FINAL DEL FICHERO. Con la
  //     inyeccion despues del primer `console.log`, los emisores de antes sobreviven, la
  //     no-vacuidad no dispara, y un `v1.1` escrito a mano en la COLA del reporter salia
  //     `# pass 36 / # fail 0`.
  //   - un template literal MULTILINEA cuya linea de continuacion lleve un `//` (una URL,
  //     el caso mas plausible que existe): como el estado de cadena se resetea en cada
  //     salto de linea, esa continuacion se escanea como CODIGO y el `//` blanquea el
  //     resto de la linea. Un `v1.1` detras salia igualmente `# pass 36 / # fail 0`.
  //
  // POR QUE ASI Y NO DE OTRA MANERA. El primer candidato que se probo —un guard byte a
  // byte sobre las lineas que contienen `console.`— cazaba el primer caso y NO el segundo,
  // y por eso se descarto: un guard que tapa la mitad de un agujero certifica la otra
  // mitad. Contrastar el veredicto de DOS reconocedores con sesgos opuestos los caza a los
  // dos, porque no existe desalineamiento que enganie a la vez al que entiende cadenas y
  // al que las ignora.
  //
  // ALCANCE, escrito para no prometer de mas: el guard compara lo que los dos reconocedores
  // dicen sobre las lineas QUE ESCRIBEN UNA VERSION, no el fichero entero. Si el escaner
  // blanquease una cola sin ninguna version, esto callaria — y es correcto que calle: no
  // hay nada escondido. Dispara el dia que aparezca una version en la parte blanqueada,
  // que es exactamente el dia en que importa.
  test(`${REPORTER}: los dos reconocedores de comentario ven las MISMAS versiones (CR-02)`, () => {
    const src = readSrc(REPORTER);
    assert.deepEqual(
      versionesEscritasAMano(sinComentarios(src).split('\n')),
      versionesEscritasAMano(sinComentariosNaive(src)),
      `DEUDA-03 / CR-02: el escaner de comentarios y el reconocedor naive DISCREPAN sobre ` +
        `${REPORTER}. O un literal de expresion regular con un \`/*\` abrio bloque y blanqueo ` +
        `la cola del fichero, o un template literal multilinea trae un \`//\` en una linea de ` +
        `continuacion. En los dos casos el escaneo de versiones de los tests de abajo dejo de ` +
        `mirar parte del reporter, y su clausula de no-vacuidad no puede verlo porque solo ` +
        `detecta el blanqueo TOTAL. Hasta que los dos coincidan, su verde no significa nada`
    );
  });

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

// ───────────────────────────────────────────────────────────────────────────
// 8. La forma DEPRECADA del comando de cierre (WR-02, D-45-11)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE ESTE BLOQUE, y por que es TAN estrecho. El review de la Phase 45 (WR-02)
// encontro que `.claude/skills/gsd-validate-batch/SKILL.md` —un artefacto que un AGENTE LEE
// PARA ACTUAR, y que esta misma fase edito— seguia instruyendo `/gsd:complete-milestone
// v1.1`: milestone equivocado por cuatro versiones Y la forma con DOS PUNTOS, que D-45-11
// acababa de declarar vieja y sustituir por la de guion en el pie del reporter. La fase
// aplico su estandar al reporter y no al documento que instruye SOBRE el reporter.
//
// POR QUE NO SE GATEA TAMBIEN LA VERSION DE MILESTONE EN ESOS FICHEROS, que es lo que WR-02
// sugeria de paso. Se midio y se descarto: tras limpiar las instrucciones, los `v1.1` que
// quedan en `gsd-validate-batch/SKILL.md` son (a) parte de una RUTA real del disco
// (`.planning/milestones/v1.1-phases/…/09-VALIDATION-PROMPT.md`), que tiene que quedarse
// verbatim o el documento manda a leer un fichero que no existe, y (b) prosa historica
// FECHADA sobre por que se decidio algo en su momento. Un gate como el del bloque 7 sobre
// estos ficheros exigiria una exencion por cada una, y una exencion por caso es un gate que
// no vigila: acabaria siendo verde por construccion. Un falso rojo es un defecto igual que
// un falso verde, y ademas invita a relajar el gate. Asi que la version se arregla por
// escrito y NO se congela, y esta decision queda aqui para que nadie la lea como un olvido.
//
// Lo que SI se congela es esto: la forma deprecada del comando. Es una prohibicion pura —no
// una cifra, no una version—, no tiene ninguna excepcion legitima en un artefacto
// ejecutable, y es exactamente el gesto que un agente COPIA Y EJECUTA. `.planning/` queda
// fuera a proposito: alli la forma vieja aparece en decenas de registros historicos que
// describen lo que se hizo, y reescribir el pasado seria el defecto contrario.
const COMANDO_DEPRECADO = '/gsd:complete-milestone';

// Los artefactos EJECUTABLES: los que alguien (autor o agente) lee para hacer algo ahora.
// Es la misma lista de contrato del bloque 6 menos los ficheros de test, que no instruyen.
const ARTEFACTOS_EJECUTABLES = [
  'README.md',
  '.claude/skills/gsd-validate-batch/SKILL.md',
  '.claude/skills/it-add-song/SKILL.md',
  'scripts/run-validation-271.mjs',
];

describe('ningun artefacto ejecutable instruye la forma deprecada del cierre (WR-02, D-45-11)', () => {
  test(`ningun call-site escribe \`${COMANDO_DEPRECADO}\``, () => {
    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO: si un fichero se renombrase, `readSrc`
    // lanzaria o la lista quedaria corta y el deepEqual de [] contra [] pasaria en verde
    // sin haber leido nada — el modo de fallo que este arnes lleva toda la fase cerrando.
    const ausentes = ARTEFACTOS_EJECUTABLES.filter(
      (rel) => !existsSync(new URL(`../${rel}`, import.meta.url))
    );
    assert.deepEqual(
      ausentes,
      [],
      `WR-02: estos artefactos ejecutables no existen donde este gate los busca, asi que la ` +
        `comprobacion de abajo no estaria mirando nada: ${ausentes.join(', ')}`
    );

    const infracciones = ARTEFACTOS_EJECUTABLES.flatMap((rel) =>
      readSrc(rel)
        .split('\n')
        .map((linea, i) => ({ linea, n: i + 1 }))
        .filter(({ linea }) => linea.includes(COMANDO_DEPRECADO))
        .map(({ n }) => `${rel}:${n}`)
    );

    assert.deepEqual(
      infracciones,
      [],
      `WR-02 / D-45-11: estos artefactos EJECUTABLES instruyen \`${COMANDO_DEPRECADO}\`, la ` +
        `forma con DOS PUNTOS que D-45-11 declaro vieja. La forma viva lleva GUION, y en el ` +
        `caso del cierre de milestone el comando entero —con el milestone ya interpolado— lo ` +
        `imprime el pie de ${REPORTER}, derivado del disco: se copia de esa salida, no se ` +
        `escribe de memoria. ${infracciones.join(', ')}`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 9. La DUREZA DEL VEREDICTO de los sub-gates (T-46-14, v2.1 Phase 46)
// ───────────────────────────────────────────────────────────────────────────
//
// POR QUE EXISTE, Y POR QUE LLEGA TARDE. El registro STRIDE de la Phase 46 declara
// T-46-14 —«umbral ablandado silenciosamente», severidad high, disposicion mitigate— con
// la mitigacion partida en DOS mitades: (1) que el veredicto del sub-gate sea IGUALDAD DE
// ENTEROS, y (2) una «asercion de fuente sobre la region del sub-gate» que congele esa
// forma. La primera mitad se implemento y muerde. La segunda NO EXISTIA: `grep` de
// `toFixed`, `Math.round` y `0.99` sobre tests/ devolvia CERO. Y el SUMMARY del plan 46-03
// la afirmaba como hecha, verbatim, en su tabla de mitigaciones.
//
// EL GATE DE SEGURIDAD DE LA FASE LO MIDIO POR MUTACION, no leyendo: debilitando
// `allTranslationInconsistencyAddrs.length === 0` a `>= 0` en el reporter, la suite se
// quedo en su baseline exacta —ni un subtest nuevo en rojo—. Un registro que afirma una
// verificacion que nadie hizo certifica en verde, que es el CR-01 de la Phase 44 con otro
// disfraz; la afirmacion queda RETRACTADA por escrito en 46-03-SUMMARY.md y este bloque es
// la mitad que faltaba.
//
// LAS DOS FORMAS DE ABLANDAMIENTO, y la declarada NO es la que se colaba.
//   (a) Aritmetica de ratio dentro del veredicto: `toFixed`, `Math.round`, una division,
//       un umbral flotante tipo `>= 0.99`. Es la unica que el registro nombraba. Un
//       `>= 0.99` formatea a 99% una variante suelta sin traducir y la deja pasar.
//   (b) Debilitar una comparacion: un `===` que pasa a `>=` o a `>`. Es la que la
//       mutacion demostro que se colaba, y no la nombraba nadie. Lleva su PROPIA
//       asercion porque (a) no la ve: `>= 0` no tiene decimal, ni redondeo, ni division.
//
// POR QUE NO SE ANCLA CONTRA EL PRE-FASE, y no es un olvido. `readPreFase46` es un helper
// con fecha de caducidad: deriva la referencia buscando el ultimo commit SIN scope
// `(46-NN)`, asi que en la Phase 47 la referencia se mueve al primer commit de la 47 y su
// guard anti-colapso la anula. Un candado de REGRESION que tiene que seguir mordiendo en
// las Phases 47-53 no puede colgar de ese ancla. Y el invariante de aqui es ABSOLUTO
// —cero patrones de ablandamiento en la region—, o sea estrictamente mas fuerte que
// cualquier delta contra un «antes»: no hay cifra que anclar. Medido de paso: `tradPass`
// no existe en el arbol pre-fase, asi que un diff contra el pre-fase sobre esta region no
// tendria con que comparar. Lo que NO se hace, y por lo mismo, es comparar contra `HEAD`:
// sobre un arbol limpio eso es vacio POR CONSTRUCCION y no prueba nada (WR-01).

// El sub-gate que T-46-14 nombra. Se declara por NOMBRE y la region se DERIVA del
// fichero: cero numeros de linea transcritos (D-31-06).
const VEREDICTO_DEL_SUBGATE = 'tradPass';

// El reconocedor de declaraciones de veredicto, DERIVADO del fuente: todo
// `const <algo>Pass =` es el veredicto de un sub-gate y entra en el candado. Enumerarlos
// a mano dejaria el sexto fuera en silencio el dia que se escriba, que es el mismo modo
// de fallo que el bloque 6 cierra para los ficheros de test.
const DECLARACION_DE_VEREDICTO = /^[^\S\n]*const[^\S\n]+([A-Za-z_$][\w$]*Pass)[^\S\n]*=/;

/** Los nombres de los veredictos que un fuente declara, en orden de aparicion. */
export const veredictosDeclarados = (src) =>
  sinComentarios(src)
    .split('\n')
    .map((linea) => linea.match(DECLARACION_DE_VEREDICTO))
    .filter(Boolean)
    .map((m) => m[1]);

/**
 * La REGION de texto que ocupa la expresion de un veredicto con nombre, YA LIMPIA de
 * comentarios: desde la linea `const <nombre> =` hasta la primera que acaba en `;`.
 *
 * POR QUE ES UNA REGION Y NO EL FICHERO. El reporter esta LLENO de aritmetica legitima
 * —porcentajes de progreso, divisiones para formatear, redondeos en la cabecera—, asi que
 * un gate que prohibiese `Math.round` en el fuente ENTERO seria rojo permanente y falso, y
 * un falso rojo invita a relajar el gate hasta que deja de vigilar. Lo que no tiene
 * NINGUNA excepcion legitima es un decimal o una division DENTRO de la expresion que
 * decide un sub-gate. Es el mismo acotado, y por la misma razon, que `regionDeArray`.
 *
 * DEVUELVE CADENA VACIA cuando la declaracion no aparece o cuando no se le encuentra
 * terminador, y es deliberado: el «fallback» de devolver el fuente completo volveria a
 * mezclar prosa y veredicto en silencio el dia que el ancla deje de casar. Una region
 * vacia pone ROJA la clausula de no-vacuidad de quien la consuma, que es el
 * comportamiento correcto — renombrar el veredicto NO puede pasar desapercibido.
 *
 * @param {string} src texto fuente completo del reporter
 * @param {string} nombre identificador del veredicto (`tradPass`, …)
 * @returns {string} la region limpia, o `''` si no se localiza
 */
export function regionDelVeredicto(src, nombre) {
  const lineas = sinComentarios(src).split('\n');
  // Whitespace HORIZONTAL en los huecos, como todas las anclas de este fichero: `\s*`
  // cruzaria el salto de linea y fue un bug real (WR-07). La apertura NO exige que la
  // linea acabe en `=`, porque un veredicto de una sola linea (`const val08Pass =
  // totalDisputed === 0;`) es tan legitimo como uno de cinco.
  const apertura = new RegExp(
    `^[^\\S\\n]*const[^\\S\\n]+${escapeRe(nombre)}[^\\S\\n]*=`
  );
  const i = lineas.findIndex((l) => apertura.test(l));
  if (i === -1) return '';
  const cierre = /;[^\S\n]*$/;
  for (let j = i; j < lineas.length; j += 1) {
    if (cierre.test(lineas[j])) return lineas.slice(i, j + 1).join('\n');
  }
  return '';
}

// Los patrones de la forma (a). Cada uno con su razon escrita, porque un gate cuyo
// mensaje no dice POR QUE muerde acaba desactivado por quien no sabe que protege.
const PATRONES_DE_ABLANDAMIENTO = [
  {
    nombre: 'toFixed',
    re: /\btoFixed\b/,
    razon: 'formatea un ratio a texto y convierte el veredicto en comparacion de cadenas',
  },
  {
    nombre: 'toPrecision',
    re: /\btoPrecision\b/,
    razon: 'misma forma que toFixed, con otro nombre',
  },
  {
    nombre: 'Math.round',
    re: /\bMath[^\S\n]*\.[^\S\n]*round\b/,
    razon: 'un redondeo hace que 95.5 de 96 sea 96 y deja pasar la variante que falta',
  },
  {
    nombre: 'Math.floor',
    re: /\bMath[^\S\n]*\.[^\S\n]*floor\b/,
    razon: 'trunca la parte que delata la cobertura incompleta',
  },
  {
    nombre: 'Math.ceil',
    re: /\bMath[^\S\n]*\.[^\S\n]*ceil\b/,
    razon: 'redondea al alza: 95 de 96 pasa a valer 96',
  },
  {
    nombre: 'parseFloat',
    re: /\bparseFloat\b/,
    razon: 'introduce coma flotante donde el veredicto cuenta enteros',
  },
  {
    nombre: 'literal decimal (`0.99` y parientes)',
    re: /\d*\.\d+/,
    razon:
      'un umbral flotante es el ablandamiento canonico: `>= 0.99` formatea a 99% una ' +
      'variante suelta sin traducir y la deja pasar',
  },
  {
    nombre: 'division',
    re: /\//,
    razon: 'un cociente es un ratio, y un ratio pide un umbral; el veredicto cuenta enteros',
  },
  {
    nombre: 'porcentaje (%)',
    re: /%/,
    razon: 'ni porcentaje ni modulo tienen nada que decidir en una igualdad de enteros',
  },
];

/** Los nombres de los patrones de ablandamiento presentes en una region. */
export const ablandamientos = (region) =>
  PATRONES_DE_ABLANDAMIENTO.filter(({ re }) => new RegExp(re.source).test(region)).map(
    ({ nombre }) => nombre
  );

// La forma (b). El `=>` se blanquea ANTES de buscar: una funcion flecha lleva un `>` que
// no compara nada, y un falso rojo es un defecto igual que un falso verde.
const COMPARACION_LAXA = /(?:>=|<=|>|<)/g;
const IGUALDAD_ESTRICTA = /(?:===|!==)/g;

/** Las comparaciones LAXAS de una region (las que admiten «mas de lo esperado»). */
export const comparacionesLaxas = (region) =>
  (region.replace(/=>/g, '  ').match(COMPARACION_LAXA) || []);

/** Las igualdades ESTRICTAS de una region — la forma que T-46-14 exige. */
export const igualdadesEstrictas = (region) => region.match(IGUALDAD_ESTRICTA) || [];

describe('T-46-14 — goldens del candado de dureza del veredicto (fail-first: la prueba de que SABE ponerse rojo)', () => {
  // El veredicto DURO, con un cociente legitimo DESPUES del `;`. Ese cociente es el
  // control de acotado: si la region desbordase su terminador, `ablandamientos` lo
  // marcaria y el gate real seria rojo permanente sobre un reporter correcto.
  const SRC_VEREDICTO_DURO = `
const totalEsperado = 96;
const tradPass =
  ausencia.length === 0 &&
  !cargaFallida &&
  desincronizados.length === 0 &&
  validadas === totalEsperado;

const porcentajeSoloParaImprimir = validadas / totalEsperado;
`;

  const SRC_VEREDICTO_UNA_LINEA = `
const val08Pass = totalDisputed === 0;
`;

  const SRC_VEREDICTO_CON_UMBRAL = `
const tradPass = (validadas / totalEsperado).toFixed(2) >= 0.99;
`;

  const SRC_VEREDICTO_REDONDEADO = `
const tradPass =
  Math.round((validadas / totalEsperado) * 100) === 100;
`;

  const SRC_VEREDICTO_LAXO = `
const tradPass =
  desincronizados.length >= 0 &&
  validadas === totalEsperado;
`;

  const SRC_VEREDICTO_CON_FLECHA = `
const tradPass =
  entradas.every((r) => r.validated === r.expected) &&
  fallos.length === 0;
`;

  const SRC_SIN_VEREDICTO = `
const otraCosa = 1;
`;

  test('golden-POSITIVO: la region acaba en su `;` y NO se lleva el cociente de la linea siguiente', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_DURO, 'tradPass');
    assert.ok(region.includes('validadas === totalEsperado;'), 'la region tiene que llegar hasta su terminador');
    assert.ok(
      !region.includes('porcentajeSoloParaImprimir'),
      'T-46-14: la region DESBORDA su `;` y se lleva aritmetica legitima de despues: el gate ' +
        'real seria rojo permanente sobre un reporter correcto'
    );
    assert.deepEqual(ablandamientos(region), []);
    assert.deepEqual(comparacionesLaxas(region), []);
    assert.equal(igualdadesEstrictas(region).length, 3);
  });

  test('golden-POSITIVO de UNA LINEA: un veredicto que abre y cierra en la misma linea se acota igual', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_UNA_LINEA, 'val08Pass');
    assert.equal(region.trim(), 'const val08Pass = totalDisputed === 0;');
    assert.deepEqual(ablandamientos(region), []);
    assert.deepEqual(comparacionesLaxas(region), []);
  });

  test('golden-NEGATIVO de UMBRAL FLOTANTE: `toFixed` + `>= 0.99` se delatan por las DOS aserciones', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_CON_UMBRAL, 'tradPass');
    assert.deepEqual(ablandamientos(region), [
      'toFixed',
      'literal decimal (`0.99` y parientes)',
      'division',
    ]);
    assert.deepEqual(comparacionesLaxas(region), ['>=']);
  });

  test('golden-NEGATIVO de REDONDEO: `Math.round` y la division se delatan aunque la comparacion siga siendo `===`', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_REDONDEADO, 'tradPass');
    assert.deepEqual(ablandamientos(region), ['Math.round', 'division']);
    // Y esta es la razon de que la asercion (b) no baste sola: aqui NO hay comparacion
    // laxa ninguna, y el gate esta igual de ablandado.
    assert.deepEqual(comparacionesLaxas(region), []);
  });

  test('golden-NEGATIVO de COMPARACION LAXA: el `=== 0` debilitado a `>= 0` se delata (la mutacion que se colaba)', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_LAXO, 'tradPass');
    assert.deepEqual(comparacionesLaxas(region), ['>=']);
    // Y esta es la razon de que la asercion (a) no baste sola: `>= 0` no lleva decimal,
    // ni redondeo, ni division. Es EXACTAMENTE la mutacion que el gate de seguridad
    // corrio sobre el reporter y que la suite entera dejo pasar en verde.
    assert.deepEqual(ablandamientos(region), []);
  });

  test('golden de FALSO POSITIVO EVITADO: el `>` de una funcion flecha NO cuenta como comparacion laxa', () => {
    const region = regionDelVeredicto(SRC_VEREDICTO_CON_FLECHA, 'tradPass');
    assert.deepEqual(
      comparacionesLaxas(region),
      [],
      'T-46-14: un `=>` marcado como comparacion laxa seria un falso rojo, y un falso rojo ' +
        'invita a relajar el gate hasta que deja de vigilar'
    );
    assert.deepEqual(ablandamientos(region), []);
    assert.equal(igualdadesEstrictas(region).length, 2);
  });

  test('golden-NEGATIVO de AUSENCIA: sin la declaracion no hay region, y la region vacia es lo que pone ROJA la no-vacuidad', () => {
    assert.equal(regionDelVeredicto(SRC_SIN_VEREDICTO, 'tradPass'), '');
    assert.deepEqual(veredictosDeclarados(SRC_SIN_VEREDICTO), []);
    // La forma del bug: sobre una region vacia las dos aserciones del gate real pasan en
    // VERDE sin haber leido nada (`deepEqual([], [])`). Por eso la no-vacuidad va PRIMERO.
    assert.deepEqual(ablandamientos(''), []);
    assert.deepEqual(comparacionesLaxas(''), []);
  });

  test('golden-NEGATIVO de VEREDICTO SIN TERMINADOR: no se devuelve media expresion como region', () => {
    assert.equal(regionDelVeredicto('const tradPass =\n  a === b &&\n', 'tradPass'), '');
  });

  test('golden de RECONOCEDOR: los veredictos se derivan del fuente, y una entrada comentada no declara ninguno', () => {
    assert.deepEqual(veredictosDeclarados(SRC_VEREDICTO_DURO), ['tradPass']);
    assert.deepEqual(veredictosDeclarados('// const tradPass = a === b;\n'), []);
    assert.deepEqual(veredictosDeclarados('/* const tradPass = a === b; */\n'), []);
  });
});

describe('T-46-14 — el veredicto de cada sub-gate del reporter es igualdad de enteros y no se puede ablandar en silencio', () => {
  test('NO-VACUIDAD: cada veredicto se localiza, su region esta ACOTADA, y la del sub-gate de la fase contiene comparaciones reales', () => {
    // VA PRIMERO Y NO ES CEREMONIA. Las dos aserciones de abajo son `deepEqual(x, [])`
    // sobre lo que un escaner encuentra en una region: si la region sale vacia —ancla
    // renombrada, terminador perdido, fichero movido— salen VERDES sin haber leido nada.
    // Es el modo de fallo que esta fase ya pago dos veces (CR-01 y WR-01), y este es el
    // tercer sitio donde se cierra ANTES de decidir nada.
    const SRC = readSrc(REPORTER);
    const nombres = veredictosDeclarados(SRC);

    assert.ok(
      nombres.includes(VEREDICTO_DEL_SUBGATE),
      `T-46-14: el reconocedor de veredictos NO encuentra \`${VEREDICTO_DEL_SUBGATE}\` en ` +
        `${REPORTER}; ve estos: ${nombres.join(', ') || '(ninguno)'}. O el sub-gate se ` +
        `renombro —y entonces este candado hay que REAPUNTARLO a mano, no dejarlo pasar— o el ` +
        `ancla dejo de casar. En los dos casos las aserciones de abajo mirarian una region ` +
        `VACIA y pasarian en verde sobre un reporter que nadie ha comprobado`
    );

    const sinRegion = nombres.filter((n) => regionDelVeredicto(SRC, n) === '');
    assert.deepEqual(
      sinRegion,
      [],
      `T-46-14: estos veredictos se declaran en ${REPORTER} pero el acotado no les encuentra ` +
        `region (ningun terminador \`;\` ni en su linea ni en las siguientes): ` +
        `${sinRegion.join(', ')}. Sin region no hay nada que congelar`
    );

    // Acotamiento REAL: una region que se comiese el fichero entero convertiria el gate
    // en una prohibicion sobre todo el reporter —que esta lleno de aritmetica legitima—
    // y el rojo seria constante y falso.
    const desbordadas = nombres.filter(
      (n) => regionDelVeredicto(SRC, n).length >= sinComentarios(SRC).length
    );
    assert.deepEqual(
      desbordadas,
      [],
      `T-46-14: la region de estos veredictos abarca el fuente entero, asi que el acotado no ` +
        `esta acotando: ${desbordadas.join(', ')}`
    );

    // Y la clausula que hace que la asercion de comparaciones SIGNIFIQUE algo: si en la
    // region del sub-gate no queda ninguna igualdad, prohibir `>=` es prohibir algo que
    // no hay. El dia que el veredicto se mueva a otro sitio esto sale ROJO y obliga a
    // reapuntar el candado — que es exactamente lo que debe pasar.
    const igualdades = igualdadesEstrictas(regionDelVeredicto(SRC, VEREDICTO_DEL_SUBGATE));
    assert.ok(
      igualdades.length > 0,
      `T-46-14: la region de \`${VEREDICTO_DEL_SUBGATE}\` no contiene NINGUNA igualdad ` +
        `estricta (\`===\`/\`!==\`). O el veredicto dejo de decidir por igualdad de enteros ` +
        `—que es la mitigacion entera de T-46-14— o el acotado ya no lo esta viendo; en ambos ` +
        `casos la prohibicion de comparaciones laxas de abajo no estaria vigilando nada`
    );
  });

  test('(a) ningun veredicto lleva aritmetica de ratio: cero `toFixed`, `Math.round`, literal decimal (`0.99`), division ni `%`', () => {
    const SRC = readSrc(REPORTER);
    const infracciones = veredictosDeclarados(SRC).flatMap((nombre) =>
      ablandamientos(regionDelVeredicto(SRC, nombre)).map((p) => `${nombre}: ${p}`)
    );
    assert.deepEqual(
      infracciones,
      [],
      `T-46-14: la expresion que decide estos sub-gates de ${REPORTER} contiene aritmetica de ` +
        `ratio: ${infracciones.join(' | ')}. El veredicto es IGUALDAD DE ENTEROS a proposito: ` +
        `un umbral flotante formatea a 99% una variante suelta sin traducir y la deja pasar. Las ` +
        `razones de cada patron estan escritas en PATRONES_DE_ABLANDAMIENTO, y ninguna admite ` +
        `excepcion dentro de un veredicto — si hace falta un porcentaje, se IMPRIME fuera del ` +
        `\`;\` y no decide nada`
    );
  });

  test('(b) ninguna comparacion de un veredicto es LAXA: cero `>=`, `<=`, `>` y `<` (la forma que se colaba)', () => {
    const SRC = readSrc(REPORTER);
    const infracciones = veredictosDeclarados(SRC).flatMap((nombre) => {
      const laxas = comparacionesLaxas(regionDelVeredicto(SRC, nombre));
      return laxas.length === 0 ? [] : [`${nombre}: ${laxas.join(' ')}`];
    });
    assert.deepEqual(
      infracciones,
      [],
      `T-46-14: estos veredictos de ${REPORTER} comparan con un operador LAXO: ` +
        `${infracciones.join(' | ')}. Un \`.length === 0\` debilitado a \`.length >= 0\` es ` +
        `verdadero SIEMPRE y desactiva su termino sin borrar ni una linea — la mutacion que el ` +
        `gate de seguridad de la fase 46 corrio y que la suite entera dejo pasar en verde. Si ` +
        `un veredicto necesita de verdad un umbral en vez de una igualdad, eso es un cambio de ` +
        `diseño del gate: se decide por escrito y se verifica por mutacion, no se cuela ` +
        `cambiando dos caracteres`
    );
  });
});

// ---------------------------------------------------------------------------
// GATE-03 - el DENOMINADOR de la cobertura de traduccion no puede encoger en
// silencio (CR-02 del code review de la Phase 47 / T-47-27)
//
// GATE-02, arriba, protege la CATEGORIA: deriva del disco el conjunto de
// categorias con >=1 variante traducida y exige que cada una este enganchada al
// array del reporter. Lo que NO protege es la VARIANTE. Si desaparece una
// variante multiple-choice ya traducida y validada, `expected`, `surfaces` y
// `validated` bajan a la vez -- se derivan del MISMO fichero en la MISMA corrida
// -- y las dos igualdades del veredicto siguen cuadrando: `PASS (205/205)`,
// exit 0, y la suite entera sin morder. Verificado por mutacion en el review.
//
// El ancla no puede derivarse del corpus, o volveria a moverse con el borrado.
// Es la marca de agua congelada de content/translation-coverage.lock.json.
//
// ES UN SUELO, NO UNA IGUALDAD: crecer no enrojece aqui. El rojo de una variante
// nueva sin traducir lo pone TRAD-COV por cobertura, que es su causa propia; si
// las dos causas se fundieran, el diagnostico dejaria de distinguir «falta
// traducir» de «falta una variante».
// ---------------------------------------------------------------------------

const LOCK_COBERTURA = 'content/translation-coverage.lock.json';

// La raiz del repo se deriva de la ubicacion de ESTE fichero, nunca de process.cwd():
// el runner puede invocarse desde cualquier directorio y `git show` necesita un cwd
// dentro del repo para resolver HEAD.
const RAIZ_REPO = fileURLToPath(new URL('../', import.meta.url));
const anclaCommiteadaEnHead = (ruta = LOCK_COBERTURA) => anclaEnHead(ruta, RAIZ_REPO);

/** Conteo de variantes multiple-choice por categoria CUBIERTA, derivado del disco. */
function conteoMcDeCategoriasCubiertas() {
  const dir = new URL(`../${DIR_EJERCICIOS}/`, import.meta.url);
  const out = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    let data;
    try {
      data = JSON.parse(readFileSync(new URL(f, dir), 'utf-8'));
    } catch (e) {
      throw new Error(
        `GATE-03: ${DIR_EJERCICIOS}/${f} no se puede parsear (${e.message}), asi que el conteo de ` +
          `variantes de referencia no existe. Un gate que no puede leer su referencia no pasa en verde.`
      );
    }
    const mc = (data.exercises || []).filter((ex) => ex?.type === 'multiple-choice');
    if (!mc.some((ex) => (ex.variants || []).some((v) => v && v.translationES))) continue;
    out[f.replace(/\.json$/, '')] = mc.reduce((s, ex) => s + (Array.isArray(ex.variants) ? ex.variants.length : 0), 0);
  }
  return out;
}

describe('GATE-03 - el denominador de cobertura de traduccion no encoge en silencio (CR-02)', () => {
  test(`${LOCK_COBERTURA} ancla TODAS las categorias cubiertas, y ninguna cayo por debajo de su suelo`, () => {
    assert.ok(
      existsSync(new URL(`../${LOCK_COBERTURA}`, import.meta.url)),
      `GATE-03: falta ${LOCK_COBERTURA}. Sin ancla, borrar una variante traducida sale VERDE en el ` +
        `reporter y en esta suite. Emitela con: node scripts/bump-translation-lock.mjs --write`
    );
    const lock = JSON.parse(readFileSync(new URL(`../${LOCK_COBERTURA}`, import.meta.url), 'utf-8'));
    const ancladas = lock && typeof lock.categorias === 'object' && lock.categorias !== null ? lock.categorias : {};
    const disco = conteoMcDeCategoriasCubiertas();

    // NO-VACUIDAD, y va primero: un ancla vacia o un recorrido de disco que dejo de
    // reconocer `translationES` haria pasar en verde las dos comparaciones de abajo
    // certificando NADA. Es la forma de gate vacuo que este fichero entero persigue.
    assert.ok(
      Object.keys(ancladas).length > 0,
      `GATE-03: ${LOCK_COBERTURA} no ancla ninguna categoria, asi que no vigila nada`
    );
    assert.ok(
      Object.keys(disco).length > 0,
      `GATE-03: ningun fichero de ${DIR_EJERCICIOS} declara una variante multiple-choice con ` +
        `translationES, asi que no hay disco contra el que confrontar el ancla`
    );

    // TIPO DE CADA SUELO (CR-02), y va ANTES de las comparaciones: un suelo no numerico
    // hace `false` la comparacion `<` contra CUALQUIER conteo, asi que deja la categoria
    // sin anclar sin borrar una sola clave. La no-vacuidad de arriba no lo ve porque
    // mira el mapa, no la entrada.
    const noEnteros = suelosNoEnteros(ancladas);
    assert.deepEqual(
      noEnteros,
      [],
      `GATE-03 / CR-02: estos suelos del ancla no son enteros no negativos: ` +
        `${noEnteros.join('; ')}. La comparacion \`disco < suelo\` es FALSE contra cualquier ` +
        `no-numero, asi que esas categorias NO estan ancladas aunque su clave siga ahi. ` +
        `Re-emite el ancla con: node scripts/bump-translation-lock.mjs --write`
    );

    const hundidas = Object.entries(ancladas)
      .filter(([slug, suelo]) => (disco[slug] ?? 0) < suelo)
      .map(([slug, suelo]) => `${slug}: ancla ${suelo}, disco ${disco[slug] ?? 0}`);
    assert.deepEqual(
      hundidas,
      [],
      `GATE-03 / CR-02: el numero de variantes multiple-choice cayo por debajo del ancla. La cifra ` +
        `de TRAD-COV seguira CUADRANDO (expected, surfaces y validated se derivan del mismo fichero ` +
        `y bajan juntos), asi que este es el unico sitio donde se ve: ${hundidas.join('; ')}. ` +
        `Si el borrado no era deliberado, restaura la variante; si lo era, re-emite el ancla con ` +
        `node scripts/bump-translation-lock.mjs --write`
    );

    const sinAnclar = Object.keys(disco).filter((slug) => !(slug in ancladas));
    assert.deepEqual(
      sinAnclar,
      [],
      `GATE-03: estas categorias tienen traducciones en disco y NO estan ancladas, asi que su ` +
        `denominador puede encoger sin que nada lo vea: ${sinAnclar.join(', ')}. ` +
        `Ejecuta: node scripts/bump-translation-lock.mjs --write`
    );

    // RATCHET HISTORICO (CR-01). Los tres terminos de arriba confrontan el ancla con el
    // DISCO, y el disco es justo lo que el borrado mueve consigo. El ancla en si no se
    // confrontaba con nada: bajar un suelo a mano era un no-op silencioso, y con el
    // suelo bajado el borrado de la variante volvia a salir verde en los DOS gates.
    // Su valor COMMITEADO es la unica referencia que la edicion del arbol de trabajo no
    // puede mover. Sigue siendo un SUELO: crecer no enrojece; solo enrojece BAJAR.
    const commiteada = anclaCommiteadaEnHead();
    if (commiteada.estado === 'ausente') {
      // BOOTSTRAP, dicho en voz alta y nunca en silencio: el commit que da de alta el
      // ancla no tiene con que compararse. Los tres terminos de arriba SI se han
      // ejecutado, asi que este gate no pasa vacuo; lo que falta es solo este cuarto.
      console.warn(
        `GATE-03 / CR-01: el ratchet historico NO se ha podido ejecutar en esta corrida porque ` +
          `${commiteada.motivo}. Es el bootstrap legitimo (el ancla aun no esta commiteada en HEAD) ` +
          `y por eso no enrojece, pero queda dicho: en esta corrida NADIE ha comprobado que los ` +
          `suelos no hayan bajado a mano.`
      );
    } else {
      const bajadas = suelosQueBajaronRespectoDeHead(commiteada.categorias, ancladas);
      assert.deepEqual(
        bajadas,
        [],
        `GATE-03 / CR-01: un suelo del ancla BAJO respecto de su valor commiteado en HEAD: ` +
          `${bajadas.join('; ')}. Bajar un suelo desarma el ancla de esa categoria, y con el suelo ` +
          `bajado borrar una variante traducida y validada vuelve a salir VERDE en este gate y en ` +
          `el reporter (exit 0, con la cifra mas baja). El ancla es un SUELO, no una igualdad: ` +
          `crecer sigue siendo verde. Si de verdad hay que bajarlo, re-emitelo con ` +
          `node scripts/bump-translation-lock.mjs --write y COMMITEA ese diff, que es el gesto ` +
          `deliberado que el ancla exige.`
      );
    }
  });
});

// Goldens de los tres reconocedores de arriba. Van aqui y no en su propio fichero por lo
// mismo que los del reconocedor de veredictos: el gate real solo puede mirar UN estado
// del disco, y estas son las entradas que ese estado nunca produce.
describe('GATE-03 - goldens de los reconocedores del ancla (CR-01 y CR-02)', () => {
  test('CR-02: un suelo no entero se nombra con su clave y su valor; un entero no negativo no', () => {
    assert.deepEqual(suelosNoEnteros({ a: 0, b: 54, c: 96 }), []);
    assert.deepEqual(suelosNoEnteros({ a: null }), ['a: null']);
    assert.deepEqual(suelosNoEnteros({ a: 'cincuenta y cuatro' }), ['a: "cincuenta y cuatro"']);
    assert.deepEqual(suelosNoEnteros({ a: true }), ['a: true']);
    assert.deepEqual(suelosNoEnteros({ a: 54.5 }), ['a: 54.5']);
    assert.deepEqual(suelosNoEnteros({ a: -1 }), ['a: -1']);
    assert.deepEqual(suelosNoEnteros({ a: undefined }), ['a: undefined']);
  });

  test('CR-01: BAJAR un suelo respecto de HEAD es rojo, y RETIRAR la clave tambien', () => {
    assert.equal(suelosQueBajaronRespectoDeHead({ a: 96 }, { a: 95 }).length, 1);
    assert.match(suelosQueBajaronRespectoDeHead({ a: 96 }, { a: 95 })[0], /HEAD ancla 96 .* declara 95/);
    assert.equal(suelosQueBajaronRespectoDeHead({ a: 96 }, {}).length, 1);
    assert.match(suelosQueBajaronRespectoDeHead({ a: 96 }, {})[0], /RETIRO la clave entera/);
  });

  test('CR-01 / BOOTSTRAP: crecer es VERDE y una clave NUEVA ausente de HEAD tambien', () => {
    // Es la mitad que separa este ratchet de la variante por IGUALDAD que se descarto:
    // la doctrina escrita dice que el ancla es un suelo, y crecer no puede enrojecer.
    assert.deepEqual(suelosQueBajaronRespectoDeHead({ a: 96 }, { a: 96 }), []);
    assert.deepEqual(suelosQueBajaronRespectoDeHead({ a: 96 }, { a: 97 }), []);
    assert.deepEqual(suelosQueBajaronRespectoDeHead({ a: 96 }, { a: 96, b: 17 }), []);
    assert.deepEqual(suelosQueBajaronRespectoDeHead({}, { b: 17 }), []);
  });

  test('CR-01 / BOOTSTRAP: un ancla que no existe en HEAD devuelve `ausente` con motivo, no lanza', () => {
    const r = anclaCommiteadaEnHead('content/no-existe-este-ancla.lock.json');
    assert.equal(r.estado, 'ausente');
    assert.match(r.motivo, /no devolvio nada/);
  });

  test('CR-01: el ancla REAL de HEAD se lee y declara un objeto de categorias', () => {
    // NO-VACUIDAD del ratchet: si esto se pusiera `ausente` en el repo de verdad, la
    // rama de bootstrap se tragaria el gate entero sin que nadie lo notara.
    const r = anclaCommiteadaEnHead();
    assert.equal(r.estado, 'leida');
    assert.ok(Object.keys(r.categorias).length > 0);
  });
});

// ---------------------------------------------------------------------------
// GATE-05 - el ratchet historico tambien muerde en la SUPERFICIE QUE MIRA EL
// HUMANO (CR-01, decision del autor tras el code review de la Phase 48)
//
// POR QUE HACE FALTA UN GATE PARA ESTO. GATE-03, arriba, pone en rojo la SUITE
// cuando alguien baja un suelo del ancla. Pero el comando que el autor corre A
// MANO antes de /gsd-complete-milestone es scripts/run-validation-271.mjs, y ese
// salia exit 0 bajo el mismo exploit: `PASS (327/327)`, `Milestone gate PASS`.
// Un gate que muerde en la suite pero no en la superficie que el humano mira deja
// la decision de milestone tomandose sobre un verde falso.
//
// SE ASERTA SOBRE EL TEXTO FUENTE, por la razon de D-44-07 que la cabecera de
// este fichero ya explica: el reporter NO es importable — ejecuta su guard de
// coherencia AL CARGAR el modulo y llama a process.exit(1). La lib pura SI lo es,
// y por eso sus tres funciones se prueban arriba por golden y aqui solo se
// verifica el CABLEADO, que es lo unico que el fuente puede decir.
//
// LO QUE ESTE GATE CAZA, y es un modo de fallo con historia en este fichero: que
// alguien compute el termino, lo IMPRIMA, y se olvide de meterlo en el veredicto.
// El propio reporter lo dice de su termino del ancla: dejarlo fuera, meramente
// impreso, seria reproducir por tercera vez la forma que el CR-03 de la Phase 44
// arreglo para VAL-09.
describe('GATE-05 - el sub-gate ANCLA-RATCHET existe en el reporter y ENTRA en el veredicto', () => {
  const SRC_REPORTER = () => readSrc(REPORTER);

  test('el reporter DECLARA el veredicto `anclaRatchetPass` y su region esta acotada', () => {
    const src = SRC_REPORTER();
    assert.ok(
      veredictosDeclarados(src).includes('anclaRatchetPass'),
      `GATE-05: ${REPORTER} no declara \`anclaRatchetPass\`. Sin el, bajar un suelo del ancla a ` +
        `mano vuelve a salir exit 0 en el comando que el autor corre antes de cerrar milestone, ` +
        `aunque la suite se ponga roja`
    );
    assert.notEqual(
      regionDelVeredicto(src, 'anclaRatchetPass'),
      '',
      'GATE-05: el veredicto se declara pero no se le encuentra region; sin region no hay nada que congelar'
    );
  });

  test('`anclaRatchetPass` ENTRA en `gatePass`: computarlo e imprimirlo sin usarlo no es un gate', () => {
    const region = regionDelVeredicto(SRC_REPORTER(), 'gatePass');
    assert.notEqual(region, '', 'GATE-05: no se localiza la region de `gatePass`');
    assert.ok(
      /\banclaRatchetPass\b/.test(region),
      `GATE-05: \`gatePass\` de ${REPORTER} NO incluye \`anclaRatchetPass\`, asi que el sub-gate ` +
        `se IMPRIME pero no decide el exit code. Es exactamente la forma que el CR-03 de la Phase ` +
        `44 arreglo para VAL-09 y que esta fase arreglo para la desincronia de traduccion. ` +
        `Region leida: ${region}`
    );
  });

  test('el reporter CONSUME la lib compartida del ratchet, no una copia propia', () => {
    // Dos copias de la misma doctrina divergen: la del reporter y la de GATE-03 tienen
    // que ser la MISMA funcion, o el dia que una se arregle la otra se queda atras.
    const src = SRC_REPORTER();
    assert.ok(
      /from\s+'\.\/lib\/ancla-ratchet\.mjs'/.test(src),
      `GATE-05: ${REPORTER} no importa scripts/lib/ancla-ratchet.mjs`
    );
    assert.ok(
      /\bsuelosQueBajaronRespectoDeHead\b/.test(src),
      `GATE-05: ${REPORTER} no usa suelosQueBajaronRespectoDeHead`
    );
  });

  test('el sub-gate IMPRIME su linea con nombre propio, para que el autor la vea entre las demas', () => {
    assert.ok(
      /ANCLA-RATCHET/.test(SRC_REPORTER()),
      `GATE-05: ${REPORTER} no imprime ninguna linea ANCLA-RATCHET; un sub-gate que no se ve no ` +
        `informa la decision de milestone`
    );
  });
});

// ---------------------------------------------------------------------------
// GATE-04 - los `expected` LITERALES de CATEGORIES cuadran con el disco, uno a
// uno (WR-03 del code review de la Phase 47)
//
// 9 de las 18 entradas de CATEGORIES llevan una cifra escrita a mano y las
// otras 9 la derivan. El guard de coherencia del reporter confronta
// SIGMA-literales contra SIGMA-disco, asi que un drift en UNA categoria si se
// caza pero DOS QUE SE COMPENSAN pasan: mover un slot de avere.json a
// essere.json (20->19 y 26->27) imprimia los dos avisos y cerraba el milestone
// con `VAL-06 PASS (250/250)`.
//
// EL REPORTER YA LO CONSUME EN SU VEREDICTO desde esta fase, pero eso solo
// muerde cuando alguien corre el reporter. La suite tambien tiene que morder,
// que es la mitad que el review midio ausente.
//
// POR QUE ESTE GATE MIRA SOLO LOS LITERALES, y no es una omision: para una
// entrada `expected: slotCountOf(file)` la comparacion contra el disco es
// TAUTOLOGICA -- los dos lados leen el mismo fichero en la misma corrida. Un
// gate que las incluyera pareceria cubrir 18 categorias y solo cubriria 9, que
// es exactamente la forma de gate vacuo que este fichero persigue. La cifra de
// literales NO se transcribe: se cuenta de la region.
// ---------------------------------------------------------------------------

describe('GATE-04 - los expected literales de CATEGORIES cuadran con el disco uno a uno (WR-03)', () => {
  test(`${REPORTER}: ninguna categoria con \`expected\` escrito a mano diverge de su JSON`, () => {
    const src = readSrc(REPORTER);
    const inicio = src.indexOf('const CATEGORIES = [');
    assert.ok(inicio !== -1, `GATE-04: no se encontro la declaracion de CATEGORIES en ${REPORTER}`);
    const region = src.slice(inicio, src.indexOf('];', inicio));

    const entradas = [...region.matchAll(/\{ slug: '([^']+)',\s*file: '([^']+)',\s*expected: ([^}]+)\}/g)];
    // NO-VACUIDAD, y va primero: si el extractor deja de casar (una entrada partida en
    // dos lineas, un renombrado), `entradas` queda vacia y las comprobaciones de abajo
    // pasarian en VERDE certificando nada.
    assert.ok(
      entradas.length > 0,
      `GATE-04: el extractor no ve ni una entrada en la region de CATEGORIES de ${REPORTER}. ` +
        `O el array cambio de forma, o este gate se quedo ciego`
    );

    const literales = entradas.filter(([, , , exp]) => /^\s*\d+\s*$/.test(exp));
    assert.ok(
      literales.length > 0,
      `GATE-04: ninguna entrada de CATEGORIES lleva ya un \`expected\` literal, asi que este gate ` +
        `no tiene sujeto. Si la uniformacion a slotCountOf() fue deliberada, RETIRA este gate por ` +
        `escrito: dejarlo verde y vacuo es peor que no tenerlo. Ojo -- derivar las 18 vuelve la ` +
        `comparacion tautologica y el drift COMPENSADO deja de cazarse (medido en la Phase 47)`
    );

    const divergentes = [];
    for (const [, slug, file, exp] of literales) {
      const enDisco = JSON.parse(readFileSync(new URL(`../${file}`, import.meta.url), 'utf-8')).exercises.length;
      const escrito = Number(exp.trim());
      if (escrito !== enDisco) divergentes.push(`${slug}: escrito ${escrito}, disco ${enDisco}`);
    }
    assert.deepEqual(
      divergentes,
      [],
      `GATE-04 / WR-03: el \`expected\` escrito a mano no cuadra con el JSON real. La SUMA puede ` +
        `seguir cuadrando -- dos drifts que se compensan dejan el guard de coherencia del reporter ` +
        `en verde --, asi que este es el sitio donde se ve: ${divergentes.join('; ')}`
    );
  });
});
