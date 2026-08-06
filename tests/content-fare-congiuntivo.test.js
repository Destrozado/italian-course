// tests/content-fare-congiuntivo.test.js
//
// v2.0 Phase 42 (CONG-01..CONG-04) — invariantes PERMANENTES de la categoria
// `fare-congiuntivo`: 4 slots del paradigma del subjuntivo de `fare` (presente,
// imperfetto, passato, trapassato) x 6 personas, mas un 5o slot cuyo eje de
// variante es el DISPARADOR y no la persona. 5 x 6 = 30 variantes. Se ejecuta:
//
//     node --test tests/content-fare-congiuntivo.test.js
//
// y entra tambien en el glob de la suite completa:
//
//     node --test tests/*.test.js
//
// ADVERTENCIA DE ESCANEO (heredada de 41-01 y de 42-01, no negociable): todos
// los escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]`, sobre el JSON parseado — y
// NUNCA sobre el fichero completo ni sobre `notes`. El `notes` de la categoria
// NOMBRA a proposito cada forma de la blacklist y cada perifrasis excluida, con
// su audit trail, asi que un grep de fichero entero se auto-invalidaria:
// fallaria justo por el texto que D-42-11 exige que exista. Y SIEMPRE por
// coincidencia EXACTA, nunca por subcadena: la forma corta atestiguada de 3a
// persona del singular del passato remoto es prefijo de tres formas LEGITIMAS
// de esta categoria (`facesse`, `faceste`, `faceva`).
//
// LAS TRES DESVIACIONES DELIBERADAS respecto del analogo
// `tests/content-fare-indicativo.test.js`, declaradas aqui para que quien
// compare los dos ficheros no las lea como descuidos:
//
//   1. D-42-05 — el assert de UNICIDAD de keys dentro de un slot
//      (`new Set(keys).size === 6`) NO se clona: aqui hay 10 repeticiones
//      DELIBERADAS (`faccia` x3, `facessi` x2, `abbia fatto` x3,
//      `avessi fatto` x2) y la unicidad de la respuesta la da el pronombre
//      sujeto explicito. Se sustituye por igualdad ORDENADA con la tabla CANON.
//   2. D-42-13 — el assert de «ningun prompt lleva parentesis» se reescribe a
//      un set CERRADO de glosas de conjuncion. El 0-gloss del VERBO sigue
//      siendo absoluto; lo que se admite es el gloss lexico de una conjuncion
//      por encima del nivel A1.
//   3. D-42-06 — el assert de «exactamente un pronombre por prompt» se
//      reescribe: el gate HARD de no-correferencia obliga a DOS sujetos
//      explicitos en varias variantes, asi que contar pronombres seria falso
//      por diseno. Se sustituye por la tabla declarativa VARIANT_TABLE.
//
// Este fichero NO duplica lo que ya cubren otros tests: la validacion de schema
// del bundle auto-descubierto vive en tests/domain.test.js, y el coverage de
// explanations, los apostrofes ASCII, el no-markdown, el leak R1, los cross-refs
// R2 y el gate VAL_07_STRICT viven en el smoke parametrico de
// tests/exercise-types.test.js.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { deriveStatus } from '../src/data/validation-state.js';

const CONTENT = JSON.parse(
  readFileSync(new URL('../content/exercises/fare-congiuntivo.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];
const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));
const allVariants = () => SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));

// Matcher con frontera de PALABRA UNICODE. `\b` de JS es ASCII-only y aqui hay
// disparadores que empiezan por `È` y por `B`+`enché`, asi que se construye a
// mano con \p{L}. Es lo que impide que `so che` haga match dentro de
// `penso che`, que es una colision real entre dos disparadores de este fichero.
const wordish = (s) =>
  new RegExp(`(^|[^\\p{L}])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u');

// ───────────────────────────────────────────────────────────────────────────
// Constantes de datos: la especificacion EJECUTABLE de la categoria.
// ───────────────────────────────────────────────────────────────────────────

// CANON — los 5 ids de slot en el orden en que viven en disco, cada uno con sus
// 6 keys EN ORDEN y CON LAS REPETICIONES. Las repeticiones son parte de la
// especificacion (D-42-05), no un accidente: ver la desviacion 1 de la cabecera.
const CANON = {
  'fare-congiuntivo-presente': ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'],
  'fare-congiuntivo-imperfetto': ['facessi', 'facessi', 'facesse', 'facessimo', 'faceste', 'facessero'],
  'fare-congiuntivo-passato': ['abbia fatto', 'abbia fatto', 'abbia fatto', 'abbiamo fatto', 'abbiate fatto', 'abbiano fatto'],
  'fare-congiuntivo-trapassato': ['avessi fatto', 'avessi fatto', 'avesse fatto', 'avessimo fatto', 'aveste fatto', 'avessero fatto'],
  'fare-congiuntivo-disparador': ['faccia', 'faccia', 'facciate', 'facciano', 'facessi', 'fa'],
};
const IDS = Object.keys(CANON);

// Los tres grupos de slot: el patron de distractoras es DISTINTO en cada uno
// (D-42-10 frente a D-42-09 frente a D-42-12), asi que van en 3 bloques.
const SIMPLE_SLOTS = ['fare-congiuntivo-presente', 'fare-congiuntivo-imperfetto'];
const COMPOUND_SLOTS = ['fare-congiuntivo-passato', 'fare-congiuntivo-trapassato'];
const TRIGGER_SLOT = 'fare-congiuntivo-disparador';
const PARADIGM_SLOTS = [...SIMPLE_SLOTS, ...COMPOUND_SLOTS];

// Los 4 paradigmas de SUBJUNTIVO por persona (io, tu, lui/lei, noi, voi, loro).
const CONG_PRES = ['faccia', 'faccia', 'faccia', 'facciamo', 'facciate', 'facciano'];
const CONG_IMPF = ['facessi', 'facessi', 'facesse', 'facessimo', 'faceste', 'facessero'];
const CONG_PASS = ['abbia fatto', 'abbia fatto', 'abbia fatto', 'abbiamo fatto', 'abbiate fatto', 'abbiano fatto'];
const CONG_TRAP = ['avessi fatto', 'avessi fatto', 'avesse fatto', 'avessimo fatto', 'aveste fatto', 'avessero fatto'];

// Los 2 paradigmas de INDICATIVO que el slot del disparador ofrece como
// opciones legitimas (D-42-12) y que en los 2 simples son la distractora de
// interferencia (D-42-10).
const IND_PRES = ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'];
const IND_IMPF = ['facevo', 'facevi', 'faceva', 'facevamo', 'facevate', 'facevano'];

// IND_COMPOUND — los compuestos de INDICATIVO, prohibidos como distractora en
// COMPOUND_SLOTS (SC-3). Se acota A PROPOSITO al passato prossimo y al
// trapassato prossimo, y dentro del passato prossimo se EXCLUYE `abbiamo fatto`:
// es la MISMA cadena que la key de `noi` del congiuntivo passato (homografia
// declarada en el `notes`), asi que incluirla haria el gate insatisfacible. El
// trapassato remoto queda fuera por la misma razon: `aveste fatto` es a la vez
// congiuntivo trapassato de voi y trapassato remoto de indicativo de voi.
const IND_COMPOUND = [
  'ho fatto', 'hai fatto', 'ha fatto', 'avete fatto', 'hanno fatto',
  'avevo fatto', 'avevi fatto', 'aveva fatto', 'avevamo fatto', 'avevate fatto', 'avevano fatto',
];

// REAL_FORMS — TODAS las formas reales de `fare` en cualquier modo y tiempo,
// incluidos el passato remoto, el futuro, el condizionale y el imperativo.
// Contra este set se comprueba que una distractora «inexistente» lo sea DE
// VERDAD: sin el, una forma atestiguada de otro modo contaria como inventada.
const REAL_FORMS = new Set([
  ...CONG_PRES, ...CONG_IMPF, ...CONG_PASS, ...CONG_TRAP,
  ...IND_PRES, ...IND_IMPF,
  'farò', 'farai', 'farà', 'faremo', 'farete', 'faranno',
  'feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero',
  'ho fatto', 'hai fatto', 'ha fatto', 'abbiamo fatto', 'avete fatto', 'hanno fatto',
  'avevo fatto', 'avevi fatto', 'aveva fatto', 'avevamo fatto', 'avevate fatto', 'avevano fatto',
  'avrò fatto', 'avrai fatto', 'avrà fatto', 'avremo fatto', 'avrete fatto', 'avranno fatto',
  'ebbi fatto', 'avesti fatto', 'ebbe fatto', 'avemmo fatto', 'aveste fatto', 'ebbero fatto',
  'farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero',
  "fa'",
]);

// BLACKLIST (D-42-11) — las 18 formas atestiguadas heredadas de Phase 41 mas
// las 3 trampas NUEVAS de esta categoria. El `notes` las nombra una a una entre
// apostrofes ASCII, y el bloque 6 exige ese audit trail EN POSITIVO.
const BLACKLIST = [
  'fo', 'fé', 'fenno', 'facea', 'fan', 'face', 'faci',
  'fei', 'festi', 'femmo', 'feste', 'fero', 'feciono',
  'fici', 'facisti', 'facette', 'facettero', 'facero',
  'facci', 'facciam', 'facce',
];

// PHASE43_FORMS — casillas declaradas de Phase 43. No son errores, pero no
// entran en `options` para no adelantar el magnet de esa fase (D-42-15, D-42-16).
const PHASE43_FORMS = ['farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero', "fa'"];
const PARTICIPIO_CONCORDADO = /\bfatt[aie]\b/;

// SCOPE-GATE lexico HARD heredado de D-41-06 por D-42-18.
const PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel', 'far fare'];
const OBJECTS = ['i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto'];

// D-42-13 — el conjunto CERRADO de 4 glosas lexicas y las conjunciones que las
// admiten. Ver la desviacion 2 de la cabecera.
const GLOSSES = ['aunque', 'siempre que', 'antes de que', 'a pesar de que'];
const GLOSSABLE = ['Benché', 'benché', 'Purché', 'purché', 'Prima che', 'prima che', 'Nonostante', 'nonostante'];

// D-42-07 / D-42-18 — el pronombre sujeto por persona. 3a singular admite las dos.
const PRONOUNS = [['io'], ['tu'], ['lui', 'lei'], ['noi'], ['voi'], ['loro']];
const PERSON_CODES = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];

// VARIANT_TABLE — la tabla declarativa por variante que SUSTITUYE al conteo de
// pronombres del analogo (desviacion 3, D-42-06). Por variante:
//   trigger      — el disparador literal, unico dentro de su slot
//   mainSubject  — el sujeto EXPLICITO de la oracion principal, o null si el
//                  disparador es impersonal o el sujeto es desinencial
//   mainPerson   — la persona del verbo de la principal, o 'impersonal'
//   blankSubject — el pronombre sujeto del hueco
//   blankPerson  — su persona; en los 4 slots del paradigma tiene que ser la
//                  persona del indice de variante
//   object       — el objeto literal del conjunto cerrado de 7
//   frame        — el marco de concordancia (solo en COMPOUND_SLOTS)
//
// El gate HARD de D-42-06 es la ultima columna util: mainPerson impersonal, o
// mainPerson distinto de blankPerson. Cuando el sujeto de la principal coincide
// con el del subordinado, el italiano estandar exige `di` mas infinitivo y la
// construccion con `che` mas subjuntivo queda defectuosa.
const VARIANT_TABLE = {
  'fare-congiuntivo-presente': [
    { trigger: 'Bisogna che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'io', blankPerson: '1sg', object: 'i compiti', frame: null },
    { trigger: 'È necessario che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'tu', blankPerson: '2sg', object: 'il letto', frame: null },
    { trigger: 'Sembra che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'lui', blankPerson: '3sg', object: 'una foto', frame: null },
    { trigger: 'Benché', mainSubject: 'il professore', mainPerson: '3sg', blankSubject: 'noi', blankPerson: '1pl', object: 'tutto', frame: null },
    { trigger: 'Mia madre vuole che', mainSubject: 'Mia madre', mainPerson: '3sg', blankSubject: 'voi', blankPerson: '2pl', object: 'una torta', frame: null },
    { trigger: 'È importante che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'loro', blankPerson: '3pl', object: 'un errore', frame: null },
  ],
  'fare-congiuntivo-imperfetto': [
    { trigger: 'Il professore voleva che', mainSubject: 'Il professore', mainPerson: '3sg', blankSubject: 'io', blankPerson: '1sg', object: 'i compiti', frame: null },
    { trigger: 'Mia madre sperava che', mainSubject: 'Mia madre', mainPerson: '3sg', blankSubject: 'tu', blankPerson: '2sg', object: 'il letto', frame: null },
    { trigger: 'Non credevo che', mainSubject: null, mainPerson: '1sg', blankSubject: 'lui', blankPerson: '3sg', object: 'il lavoro', frame: null },
    { trigger: 'Nonostante', mainSubject: 'nessuno', mainPerson: '3sg', blankSubject: 'noi', blankPerson: '1pl', object: 'una torta', frame: null },
    { trigger: 'Era necessario che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'voi', blankPerson: '2pl', object: 'una foto', frame: null },
    { trigger: 'Bisognava che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'loro', blankPerson: '3pl', object: 'un errore', frame: null },
  ],
  'fare-congiuntivo-passato': [
    { trigger: 'Mia madre non crede che', mainSubject: 'Mia madre', mainPerson: '3sg', blankSubject: 'io', blankPerson: '1sg', object: 'i compiti', frame: 'ieri sera' },
    { trigger: 'Il professore dubita che', mainSubject: 'Il professore', mainPerson: '3sg', blankSubject: 'tu', blankPerson: '2sg', object: 'il lavoro', frame: 'stamattina' },
    { trigger: 'Mi sembra che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'lui', blankPerson: '3sg', object: 'una foto', frame: 'la settimana scorsa' },
    { trigger: 'È strano che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'noi', blankPerson: '1pl', object: 'un errore', frame: 'domenica scorsa' },
    { trigger: 'Mio fratello spera che', mainSubject: 'Mio fratello', mainPerson: '3sg', blankSubject: 'voi', blankPerson: '2pl', object: 'una torta', frame: 'sabato scorso' },
    { trigger: 'Benché', mainSubject: 'il capo', mainPerson: '3sg', blankSubject: 'loro', blankPerson: '3pl', object: 'il lavoro', frame: 'il mese scorso' },
  ],
  'fare-congiuntivo-trapassato': [
    { trigger: 'Il professore non sapeva che', mainSubject: 'Il professore', mainPerson: '3sg', blankSubject: 'io', blankPerson: '1sg', object: 'il lavoro', frame: 'il giorno prima' },
    { trigger: 'Mia madre credeva che', mainSubject: 'Mia madre', mainPerson: '3sg', blankSubject: 'tu', blankPerson: '2sg', object: 'i compiti', frame: 'la settimana precedente' },
    { trigger: 'Sembrava che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'lui', blankPerson: '3sg', object: 'tutto', frame: 'molto tempo prima' },
    { trigger: 'Era strano che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'noi', blankPerson: '1pl', object: 'una torta', frame: "l'anno prima" },
    { trigger: 'Non credevo che', mainSubject: null, mainPerson: '1sg', blankSubject: 'voi', blankPerson: '2pl', object: 'una foto', frame: 'il mese precedente' },
    { trigger: 'Nonostante', mainSubject: 'il capo', mainPerson: '3sg', blankSubject: 'loro', blankPerson: '3pl', object: 'un errore', frame: 'la sera prima' },
  ],
  // El 5o slot: el eje de variante es el DISPARADOR, asi que `blankPerson` NO
  // sigue el indice — es la persona cuyas 4 casillas forman las `options`.
  'fare-congiuntivo-disparador': [
    { trigger: 'penso che', mainSubject: 'Io', mainPerson: '1sg', blankSubject: 'lui', blankPerson: '3sg', object: 'il lavoro', frame: null },
    { trigger: 'Benché', mainSubject: 'il professore', mainPerson: '3sg', blankSubject: 'tu', blankPerson: '2sg', object: 'i compiti', frame: null },
    { trigger: 'È necessario che', mainSubject: null, mainPerson: 'impersonal', blankSubject: 'voi', blankPerson: '2pl', object: 'il letto', frame: null },
    { trigger: 'Prima che', mainSubject: 'il capo', mainPerson: '3sg', blankSubject: 'loro', blankPerson: '3pl', object: 'un errore', frame: null },
    { trigger: 'Se io', mainSubject: 'mia madre', mainPerson: '3sg', blankSubject: 'io', blankPerson: '1sg', object: 'i compiti', frame: null },
    { trigger: 'so che', mainSubject: 'Io', mainPerson: '1sg', blankSubject: 'lui', blankPerson: '3sg', object: 'il lavoro', frame: null },
  ],
};

// D-42-10, excepcion declarada en el `notes` con su fecha: en la variante de
// `noi` del presente, `facciamo` es la MISMA cadena en indicativo y en
// congiuntivo, asi que el eje de la distractora de interferencia duplicaria la
// key. Se sustituye por una 2a forma real de congiuntivo de otra persona.
const SIMPLE_EXCEPTION = { slot: 'fare-congiuntivo-presente', k: 3 };

// D-42-08 — la ronda EXTRA de deepseek sobre las 10 variantes homografas se
// agrega a nivel de SLOT, asi que se materializa como un `by` deepseek-* en los
// 4 slots del PARADIGMA. El slot del disparador NO lleva ronda extra.
const EXTRA_ROUND_SLOTS = [...PARADIGM_SLOTS];

// ───────────────────────────────────────────────────────────────────────────
// 1. Estructura y conteos (D-42-01, D-42-03, D-42-18)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — estructura y conteos (D-42-01, D-42-03, D-42-18)', () => {
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });

  test('5 slots con los ids exactos de D-42-01, en el orden en que viven en disco', () => {
    assert.deepEqual(SLOTS.map((s) => s.id), IDS, 'D-42-01: los 5 ids de slot, 4 del paradigma + el disparador');
  });

  test('los 5 slots son multiple-choice: 0 match y 0 word-buttons (D-42-18)', () => {
    const otros = SLOTS.filter((s) => s.type !== 'multiple-choice').map((s) => `${s.id}(${s.type})`);
    assert.deepEqual(otros, [], 'D-42-18: MC-only, el 0-match y el 0-wb son decision razonada');
  });

  test('6 variantes por slot y 30 en total (D-42-01)', () => {
    for (const id of IDS) {
      assert.equal(byId(id).variants.length, 6, `D-42-01: ${id} debe tener 6 variantes`);
    }
    assert.equal(SLOTS.reduce((a, s) => a + s.variants.length, 0), 30, 'D-42-01: 5 slots x 6 = 30 variantes');
  });

  test('categoryIds de longitud 1 en los 5: la de contraste NO es un cruce (D-42-03)', () => {
    // La variante de contraste del disparador tiene el indicativo como
    // respuesta, pero eso no la convierte en un cruce multi-categoria: es un
    // test de reconocimiento de disparador DENTRO del congiuntivo. Si esto se
    // relajase, fallar el disparador arrastraria `fare-indicativo` en la
    // cascada de fallo inmediato y la categoria dejaria de ser unidad de reset.
    const sucio = SLOTS
      .filter((s) => !Array.isArray(s.categoryIds) || s.categoryIds.length !== 1 || s.categoryIds[0] !== 'fare-congiuntivo')
      .map((s) => `${s.id}(${JSON.stringify(s.categoryIds)})`);
    assert.deepEqual(sucio, [], 'D-42-03: categoryIds debe ser exactamente ["fare-congiuntivo"]');
  });

  test('el key set de cada slot y de cada variante es el del schema (T-42-02)', () => {
    for (const s of SLOTS) {
      assert.deepEqual(
        Object.keys(s).sort(),
        ['categoryIds', 'explanation', 'id', 'type', 'validation', 'variants'],
        `key set del slot ${s.id}`
      );
      s.variants.forEach((v, k) => {
        assert.deepEqual(Object.keys(v).sort(), ['correctIndex', 'options', 'prompt'], `key set de ${s.id}#${k}`);
      });
    }
  });

  test('options de 4 sin duplicados y correctIndex entero en rango y no constante', () => {
    for (const s of SLOTS) {
      s.variants.forEach((v, k) => {
        assert.equal(v.options.length, 4, `${s.id}#${k}: 4 opciones`);
        assert.equal(new Set(v.options).size, 4, `${s.id}#${k}: opciones sin duplicados internos`);
        assert.ok(
          Number.isInteger(v.correctIndex) && v.correctIndex >= 0 && v.correctIndex < 4,
          `${s.id}#${k}: correctIndex fuera de rango: ${v.correctIndex}`
        );
      });
      assert.ok(
        new Set(s.variants.map((v) => v.correctIndex)).size > 1,
        `${s.id}: correctIndex constante en las 6 variantes — el autor aprenderia la posicion`
      );
    }
  });

  test('ningun id lleva sufijo numerico de 3 cifras: el espacio -300+ queda libre (D-42-18)', () => {
    // Los cruces multi-categoria son de Phase 44 / INT-03 y viven en -300+.
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, [], 'D-42-18: fare-congiuntivo-300+ es espacio reservado para Phase 44');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Paradigma completo, 30 keys con homografia deliberada (CONG-01..CONG-04)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — paradigma completo, 30 keys con homografia deliberada (D-42-05)', () => {
  // DESVIACION 1 respecto del analogo: el `new Set(keys).size === 6` de
  // tests/content-fare-indicativo.test.js NO se clona aqui, porque seria FALSO
  // por diseno. D-42-05 declara 10 variantes homografas — `faccia` en io/tu/
  // lui-lei, `facessi` en io/tu, `abbia fatto` en io/tu/lui-lei y `avessi fatto`
  // en io/tu — en las que la unicidad de la respuesta la da EXCLUSIVAMENTE el
  // pronombre sujeto explicito del hueco. La igualdad con CANON es ORDENADA
  // justamente para que las repeticiones sean parte de la especificacion.
  for (const id of IDS) {
    test(`${id}: las 6 keys son las de CANON, en orden y con sus repeticiones`, () => {
      assert.deepEqual(byId(id).variants.map(keyOf), CANON[id], `paradigma de ${id}`);
    });
  }

  test('las 10 variantes homografas de la fase estan donde D-42-05 dice', () => {
    // D-42-05 cuenta homografas SOLO en los 4 slots del paradigma, y con razon:
    // ahi el eje es la persona, asi que dos variantes con la misma key son la
    // misma cadena para dos personas distintas y la unicidad de la respuesta la
    // da EXCLUSIVAMENTE el pronombre. Ese mecanismo no existe en el slot del
    // disparador, cuyo eje es otro — ver el test siguiente.
    const repetidas = {};
    for (const id of PARADIGM_SLOTS) {
      const keys = CANON[id];
      const dup = keys.filter((k, i) => keys.indexOf(k) !== i || keys.lastIndexOf(k) !== i);
      if (dup.length) repetidas[id] = dup.length;
    }
    assert.deepEqual(repetidas, {
      'fare-congiuntivo-presente': 3,
      'fare-congiuntivo-imperfetto': 2,
      'fare-congiuntivo-passato': 3,
      'fare-congiuntivo-trapassato': 2,
    }, 'D-42-05: 10 variantes homografas, 3+2+3+2, en los 4 slots del paradigma');
  });

  test('la key `faccia` repetida del slot del disparador NO es una homografa D-42-05', () => {
    // Hallazgo de autoria del 2026-08-06, declarado en el `notes`: en el slot del
    // disparador `faccia` es key en dos variantes, la de `penso che` con el hueco
    // en 3a singular y la de `benché` con el hueco en 2a singular, porque el
    // congiuntivo presente sincretiza las tres personas del singular. NO es el
    // fenomeno de D-42-05 y no necesita la red del pronombre: los CUARTETOS de
    // opciones son distintos (3a singular trae `fa`/`faceva`, 2a singular trae
    // `fai`/`facevi`), asi que ninguna de las dos respuestas es ambigua ni las
    // dos variantes son el mismo ejercicio. Se congela para que el quorum y una
    // pasada futura no lo lean como duplicado.
    const D = byId(TRIGGER_SLOT);
    const idx = D.variants.map((v, k) => (keyOf(v) === 'faccia' ? k : -1)).filter((k) => k >= 0);
    assert.deepEqual(idx, [0, 1], 'D-42-12: `faccia` debe ser key en las variantes 0 y 1 del disparador');
    const sets = idx.map((k) => [...D.variants[k].options].sort().join('|'));
    assert.equal(new Set(sets).size, 2, 'D-42-12: los cuartetos de las dos variantes de `faccia` tienen que ser DISTINTOS');
    const personas = idx.map((k) => VARIANT_TABLE[TRIGGER_SLOT][k].blankPerson);
    assert.deepEqual(personas, ['3sg', '2sg'], 'D-42-12: y las dos personas del hueco tambien');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Sujeto explicito y NO-CORREFERENCIA (D-42-06, D-42-18)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — sujeto explicito y no-correferencia (D-42-06, D-42-18)', () => {
  // DESVIACION 3 respecto del analogo: «exactamente un pronombre por prompt» es
  // FALSO por diseno aqui. El gate HARD de D-42-06 obliga a que el sujeto de la
  // principal no coincida con el del hueco, y en las variantes con verbo de
  // opinion o de certeza eso significa DOS sujetos explicitos distintos en el
  // mismo prompt (`Io penso che lui ___`). Contar pronombres pondria en rojo
  // contenido correcto, asi que el gate correcto es la tabla declarativa.
  test('los 30 prompts contienen el hueco literal ___', () => {
    const sucio = allVariants().filter(({ v }) => !v.prompt.includes('___')).map(({ slot, k }) => `${slot.id}#${k}`);
    assert.deepEqual(sucio, [], 'D-42-18: falta el hueco ___');
  });

  test('el disparador declarado aparece en el prompt y es el UNICO de su slot', () => {
    for (const id of IDS) {
      const triggers = VARIANT_TABLE[id].map((r) => r.trigger);
      eachVariant(id, (v, k) => {
        const hits = triggers.filter((t) => wordish(t).test(v.prompt));
        assert.deepEqual(
          hits,
          [triggers[k]],
          `D-42-07: ${id}#${k} deberia llevar solo el disparador "${triggers[k]}" y lleva [${hits.join(' | ')}]: "${v.prompt}"`
        );
      });
    }
  });

  test('el sujeto del hueco es un pronombre explicito y, en el paradigma, el de su persona', () => {
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const row = VARIANT_TABLE[id][k];
        assert.match(
          v.prompt.toLowerCase(),
          new RegExp(`\\b${row.blankSubject}\\b`),
          `D-42-18: ${id}#${k} no lleva el pronombre sujeto "${row.blankSubject}": "${v.prompt}"`
        );
        if (PARADIGM_SLOTS.includes(id)) {
          assert.equal(row.blankPerson, PERSON_CODES[k], `D-42-02: ${id}#${k} el eje es la persona, y la ${k} es ${PERSON_CODES[k]}`);
          assert.ok(
            PRONOUNS[k].includes(row.blankSubject),
            `D-42-18: ${id}#${k} deberia llevar ${PRONOUNS[k].join('/')} y declara "${row.blankSubject}"`
          );
        }
      });
    }
  });

  test('GATE HARD: el sujeto de la principal NUNCA coincide con el del hueco en las 30', () => {
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const row = VARIANT_TABLE[id][k];
        if (row.mainPerson !== 'impersonal' && row.mainPerson === row.blankPerson) {
          sucio.push(`${id}#${k} (${row.mainPerson} == ${row.blankPerson}): "${v.prompt}"`);
        }
      });
    }
    assert.deepEqual(sucio, [], 'D-42-06: con sujetos coincidentes el italiano exige `di` mas infinitivo, no `che` mas subjuntivo');
  });

  test('cuando la principal tiene sujeto explicito declarado, aparece literalmente en el prompt', () => {
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const row = VARIANT_TABLE[id][k];
        if (row.mainSubject !== null && !v.prompt.includes(row.mainSubject)) {
          sucio.push(`${id}#${k}: falta "${row.mainSubject}" en "${v.prompt}"`);
        }
      });
    }
    assert.deepEqual(sucio, [], 'D-42-06: la tabla declara un sujeto de principal que el prompt no contiene');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. 0-gloss del VERBO con la excepcion lexica de conjuncion (D-42-13)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — 0-gloss del verbo con gloss lexico de conjuncion (D-42-13)', () => {
  // POR QUE ESTE TEST NO ES EL DEL ANALOGO, para quien venga a "arreglarlo"
  // (DESVIACION 2): en `fare-indicativo` el gate era «ningun prompt lleva
  // parentesis», porque cualquier gloss filtraba el tiempo. Aqui hay que
  // distinguir dos cosas que no son la misma:
  //   - Gloss sobre el VERBO: PROHIBIDO y absoluto. El castellano tambien tiene
  //     subjuntivo, asi que un gloss del verbo regala MODO Y TIEMPO a la vez, y
  //     elegir modo y tiempo es exactamente el ejercicio. Doble leak R1.
  //   - Gloss lexico sobre la CONJUNCION: PERMITIDO y acotado a 4. No filtra
  //     nada, porque «aunque» rige los dos modos en castellano y saber la
  //     traduccion no dice que rige el italiano. Es el canon R7 aplicado al
  //     lexico y no a la respuesta.
  // AVISO: el quorum multi-vendor marcara este gloss como leak C5. Es un FALSO
  // POSITIVO DE POLITICA en este proyecto y no se arregla en ninguna de las dos
  // direcciones; la base de aprobacion es Claude Opus mas Sonnet.
  test('ningun prompt menciona el espanol en ninguna capitalizacion', () => {
    const sucio = allVariants()
      .filter(({ v }) => /espa/i.test(v.prompt))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-42-13: gloss explicito de traduccion en un prompt');
  });

  test('todo parentesis de un prompt contiene una de las 4 glosas del conjunto cerrado', () => {
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      for (const m of v.prompt.matchAll(/\(([^)]*)\)/g)) {
        if (!GLOSSES.includes(m[1])) sucio.push(`${slot.id}#${k}: (${m[1]})`);
      }
    }
    assert.deepEqual(sucio, [], 'D-42-13: gloss fuera del conjunto cerrado de 4');
  });

  test('el gloss va pegado a una conjuncion glosable y NUNCA junto a una forma verbal', () => {
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      for (const m of v.prompt.matchAll(/\(([^)]*)\)/g)) {
        const antes = v.prompt.slice(0, m.index);
        if (!GLOSSABLE.some((c) => antes.trimEnd().endsWith(c))) {
          sucio.push(`${slot.id}#${k}: el gloss (${m[1]}) no sigue a una conjuncion glosable`);
        }
        // Cinturon contra el leak del verbo: raices de `fare` y de `avere` en
        // los 12 caracteres previos al parentesis.
        if (/facc|face|abbia|aves/.test(antes.slice(-12))) {
          sucio.push(`${slot.id}#${k}: el gloss (${m[1]}) va junto a una forma verbal`);
        }
      }
    }
    assert.deepEqual(sucio, [], 'D-42-13: el gloss lexico solo es admisible sobre la conjuncion');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. SCOPE-GATE lexico del objeto literal (D-42-18, heredado de D-41-06)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — SCOPE-GATE lexico del objeto literal (D-42-18)', () => {
  test('ningun prompt ni opcion contiene un marcador de perifrasis o de causativo', () => {
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-42-18: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('cada prompt lleva el objeto literal que declara la tabla, del conjunto CERRADO de 7', () => {
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const obj = VARIANT_TABLE[id][k].object;
        if (!OBJECTS.includes(obj)) sucio.push(`${id}#${k}: "${obj}" no esta en el conjunto cerrado`);
        else if (!v.prompt.includes(obj)) sucio.push(`${id}#${k}: el prompt no lleva "${obj}"`);
      });
    }
    assert.deepEqual(sucio, [], 'D-42-18: el objeto de `fare` es SIEMPRE literal y del conjunto cerrado de 7');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Blacklist de formas atestiguadas y defendibles (D-42-11, D-42-15)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — blacklist de formas atestiguadas y defendibles (D-42-11)', () => {
  // ESCANEO POR CAMPO Y POR COINCIDENCIA EXACTA. Ver la ADVERTENCIA DE ESCANEO
  // de la cabecera: el `notes` nombra a proposito cada una de estas formas.
  test('ninguna opcion de las 30 variantes coincide EXACTAMENTE con una forma de la blacklist', () => {
    // El riesgo real no es que el autor escriba `facci`: es que la AUTORIA la
    // genere como distractora "obviamente mala" de `faccia` siendo la forma
    // corta de 2a persona con `ci` aglutinado, atestiguada y corriente.
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => BLACKLIST.includes(o));
      assert.deepEqual(sucio, [], `D-42-11: ${slot.id}#${k} ofrece una forma atestiguada: ${sucio.join(', ')}`);
    }
  });

  test('ninguna opcion es una casilla declarada de Phase 43 (condizionale o imperativo apostrofado)', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => PHASE43_FORMS.includes(o));
      assert.deepEqual(sucio, [], `D-42-16: ${slot.id}#${k} adelanta una casilla de Phase 43: ${sucio.join(', ')}`);
    }
  });

  test('ninguna opcion lleva el participio concordado: es el MAGNET de Phase 43', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => PARTICIPIO_CONCORDADO.test(o));
      assert.deepEqual(sucio, [], `D-42-15: ${slot.id}#${k} adelanta la concordancia del participio: ${sucio.join(', ')}`);
    }
  });

  test('EN POSITIVO: el notes documenta cada forma de la blacklist entre apostrofes ASCII', () => {
    // La ausencia sin audit trail no vale: si el `notes` deja de nombrar una
    // forma, una pasada futura no sabra por que no puede usarla.
    const faltan = BLACKLIST.filter((f) => !CONTENT.notes.includes(`'${f}'`));
    assert.deepEqual(faltan, [], 'D-42-11: el notes no documenta estas formas de la blacklist');
  });

  test('EN POSITIVO: el notes declara las homografias vistas y deliberadas', () => {
    for (const marca of ['HOMOGRAFÍAS VISTAS Y DELIBERADAS', 'QUINTA homografía']) {
      assert.ok(CONTENT.notes.includes(marca), `D-42-11: el notes no declara "${marca}"`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Distractoras de los 2 SIMPLES: 3 ejes de error (D-42-10, D-42-07)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — distractoras de presente e imperfetto (D-42-10)', () => {
  const TENSE_OF = {
    'fare-congiuntivo-presente': { cong: CONG_PRES, ind: IND_PRES },
    'fare-congiuntivo-imperfetto': { cong: CONG_IMPF, ind: IND_IMPF },
  };

  for (const id of SIMPLE_SLOTS) {
    test(`${id}: 1 key + 1 indicativo de SU persona + 1 congiuntivo real de OTRA + 1 inexistente`, () => {
      const { cong, ind } = TENSE_OF[id];
      eachVariant(id, (v, k) => {
        const key = keyOf(v);
        assert.equal(v.options.filter((o) => o === key).length, 1, `${id}#${k}: la key aparece una sola vez`);
        const resto = v.options.filter((o) => o !== key);
        const interferencia = resto.filter((o) => o === ind[k]);
        const otraPersona = resto.filter((o) => o !== ind[k] && cong.includes(o));
        const inexistentes = resto.filter((o) => !REAL_FORMS.has(o));
        const esExcepcion = SIMPLE_EXCEPTION.slot === id && SIMPLE_EXCEPTION.k === k;
        // Excepcion declarada en el `notes` con su fecha: en `noi` del presente
        // `facciamo` es la MISMA cadena en los dos modos, asi que el eje de
        // interferencia duplicaria la key. Se cambia el EJE, no la letra de
        // D-42-10, que fija tres ejes de error y no tres cadenas.
        assert.equal(interferencia.length, esExcepcion ? 0 : 1,
          `D-42-10: ${id}#${k} deberia ofrecer ${esExcepcion ? 0 : 1} indicativo de su persona, ofrece ${interferencia.length} (${resto.join(', ')})`);
        assert.equal(otraPersona.length, esExcepcion ? 2 : 1,
          `D-42-10: ${id}#${k} deberia ofrecer ${esExcepcion ? 2 : 1} congiuntivo real de otra persona, ofrece ${otraPersona.length} (${resto.join(', ')})`);
        assert.equal(inexistentes.length, 1,
          `D-42-10: ${id}#${k} deberia ofrecer 1 forma inexistente, ofrece ${inexistentes.length} (${resto.join(', ')})`);
      });
    });
  }

  test('en los 2 simples, las variantes que comparten key tienen conjuntos de options DISTINTOS (D-42-07)', () => {
    // Solo en los SIMPLES: la distractora de interferencia es especifica de la
    // persona, asi que los conjuntos divergen. En los compuestos NO se aplica
    // — ver el comentario del bloque 8.
    for (const id of SIMPLE_SLOTS) {
      const porKey = {};
      byId(id).variants.forEach((v, k) => { (porKey[keyOf(v)] ||= []).push({ k, set: [...v.options].sort().join('|') }); });
      for (const [key, grupo] of Object.entries(porKey)) {
        if (grupo.length < 2) continue;
        const sets = grupo.map((g) => g.set);
        assert.equal(new Set(sets).size, sets.length,
          `D-42-07: ${id} repite el conjunto de options entre las variantes de "${key}" (${grupo.map((g) => g.k).join(', ')})`);
      }
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Distractoras de los 2 COMPUESTOS: cero indicativo (D-42-09, SC-3)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — distractoras de passato y trapassato, cero indicativo (D-42-09)', () => {
  // POR QUE EL GATE VA EN POSITIVO Y SOBRE LAS DISTRACTORAS, y no como ausencia
  // de indicativo sobre `options`: la key de la variante de `noi` del passato es
  // `abbiamo fatto`, que es LA MISMA CADENA que el passato prossimo de
  // indicativo de `noi`. Un gate de «ninguna opcion es indicativo» seria por
  // tanto insatisfacible. La formulacion correcta, y ademas mas fuerte, es que
  // cada una de las 3 distractoras pertenezca al conjunto CERRADO de 3 formas de
  // congiuntivo de la persona de esa variante: eso implica cero indicativo por
  // construccion y comprueba el patron completo de D-42-09 en una sola asercion.
  //
  // Y POR QUE EL GATE DEL BLOQUE 7 NO SE APLICA AQUI: como D-42-09 determina las
  // 3 distractoras por completo a partir de la persona, y io y tu comparten las
  // cuatro formas implicadas, las variantes de io y de tu tienen NECESARIAMENTE
  // el mismo conjunto de `options` en estos dos slots. Es construccion, no
  // descuido, y esta declarado en el `notes` con su fecha: los diferenciadores
  // son el disparador, el objeto literal y el pronombre sujeto explicito.
  const OTHER_COMPOUND = {
    'fare-congiuntivo-passato': CONG_TRAP,
    'fare-congiuntivo-trapassato': CONG_PASS,
  };

  for (const id of COMPOUND_SLOTS) {
    test(`${id}: las 3 distractoras son el conjunto CERRADO de congiuntivo de esa persona`, () => {
      eachVariant(id, (v, k) => {
        const key = keyOf(v);
        const distractoras = v.options.filter((o) => o !== key);
        assert.equal(distractoras.length, 3, `${id}#${k}: deberia haber 3 distractoras y hay ${distractoras.length}`);
        const esperado = [OTHER_COMPOUND[id][k], CONG_PRES[k], CONG_IMPF[k]].sort();
        assert.deepEqual(
          [...distractoras].sort(),
          esperado,
          `D-42-09 / SC-3: ${id}#${k} las 3 distractoras deben ser el otro compuesto mas los 2 simples de la persona ${PERSON_CODES[k]}`
        );
      });
    });
  }

  test('RED de seguridad: ninguna distractora de los compuestos es un compuesto de INDICATIVO', () => {
    for (const id of COMPOUND_SLOTS) {
      eachVariant(id, (v, k) => {
        const key = keyOf(v);
        const sucio = v.options.filter((o) => o !== key && IND_COMPOUND.includes(o));
        assert.deepEqual(sucio, [], `SC-3: ${id}#${k} ofrece un compuesto de indicativo como distractora: ${sucio.join(', ')}`);
      });
    }
  });

  test('el marco de concordancia de cada variante compuesta esta en el prompt y los 6 son distintos', () => {
    // Es el UNICO mecanismo que hace que `faccia` y `facessi` no sean
    // defendibles. Si el marco no fija el punto temporal de la principal y la
    // anterioridad del subordinado, la variante tiene dos respuestas correctas.
    for (const id of COMPOUND_SLOTS) {
      const marcos = VARIANT_TABLE[id].map((r) => r.frame);
      assert.equal(new Set(marcos).size, 6, `D-42-02: los 6 marcos de ${id} deben ser distintos entre si`);
      eachVariant(id, (v, k) => {
        assert.ok(v.prompt.includes(marcos[k]), `D-42-09: ${id}#${k} no lleva su marco "${marcos[k]}": "${v.prompt}"`);
      });
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 9. El slot del DISPARADOR: 4 casillas modo x tiempo (D-42-12, D-42-16, SC-4)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — slot del disparador, 4 casillas modo x tiempo (D-42-12, SC-4)', () => {
  const D = () => byId(TRIGGER_SLOT);
  const PERSON_INDEX = { '1sg': 0, '2sg': 1, '3sg': 2, '1pl': 3, '2pl': 4, '3pl': 5 };
  const CONGIUNTIVO = new Set([...CONG_PRES, ...CONG_IMPF]);
  const INDICATIVO = new Set([...IND_PRES, ...IND_IMPF]);

  test('las 24 opciones del slot son formas REALES de fare: 0 formas inventadas', () => {
    for (const [k, v] of D().variants.entries()) {
      const sucio = v.options.filter((o) => !REAL_FORMS.has(o));
      assert.deepEqual(sucio, [], `D-42-12: ${TRIGGER_SLOT}#${k} ofrece una forma inventada: ${sucio.join(', ')}`);
    }
  });

  test('las 4 opciones de cada variante son el cuarteto COMPLETO de la persona del hueco', () => {
    // Congiuntivo presente / indicativo presente / congiuntivo imperfetto /
    // indicativo imperfetto de UNA misma persona: el autor decide modo Y tiempo
    // y solo el disparador mas el marco determinan la casilla.
    D().variants.forEach((v, k) => {
      const p = PERSON_INDEX[VARIANT_TABLE[TRIGGER_SLOT][k].blankPerson];
      const cuarteto = [CONG_PRES[p], IND_PRES[p], CONG_IMPF[p], IND_IMPF[p]].sort();
      assert.deepEqual([...v.options].sort(), cuarteto, `D-42-12: ${TRIGGER_SLOT}#${k} no es el cuarteto de la persona del hueco`);
    });
  });

  test('EXACTAMENTE 1 de las 6 keys es indicativo y las otras 5 congiuntivo (SC-4)', () => {
    const keys = D().variants.map(keyOf);
    const ind = keys.filter((x) => INDICATIVO.has(x) && !CONGIUNTIVO.has(x));
    const cong = keys.filter((x) => CONGIUNTIVO.has(x) && !INDICATIVO.has(x));
    assert.deepEqual(ind, ['fa'], 'SC-4: exactamente una variante de contraste, y su key es el indicativo `fa`');
    assert.equal(cong.length, 5, `SC-4: las otras 5 keys deben ser congiuntivo, hay ${cong.length}`);
  });

  test('los 6 disparadores cubren los 4 que SC-4 nombra, mas necesidad y certeza', () => {
    const triggers = VARIANT_TABLE[TRIGGER_SLOT].map((r) => r.trigger);
    assert.equal(new Set(triggers).size, 6, 'CONG-04: los 6 disparadores deben ser distintos entre si');
    const faltan = ['penso che', 'Benché', 'Prima che', 'Se io', 'È necessario che', 'so che']
      .filter((t) => !triggers.includes(t));
    assert.deepEqual(faltan, [], 'SC-4: opinion, benché, prima che, se hipotetico, necesidad y certeza');
  });

  test('el par pedagogico: la variante de opinion y la de contraste comparten conjunto de options', () => {
    // Mismo conjunto de 4 opciones, disparador distinto, respuesta distinta. La
    // colision es deliberada y es lo que aisla el disparador como unica variable.
    const opinion = D().variants[0];
    const contraste = D().variants[5];
    assert.deepEqual([...opinion.options].sort(), [...contraste.options].sort(), 'D-42-12: el par opinion/certeza debe compartir options');
    assert.notEqual(keyOf(opinion), keyOf(contraste), 'SC-4: el par debe tener respuestas distintas');
  });

  test('el `se` hipotetico lleva la principal en condizionale de un verbo que NO es fare (D-42-16)', () => {
    const k = VARIANT_TABLE[TRIGGER_SLOT].findIndex((r) => r.trigger === 'Se io');
    const v = D().variants[k];
    assert.match(v.prompt, /\bsarebbe\b/, 'D-42-16: la principal debe ir en condizionale de `essere`');
    const sucio = PHASE43_FORMS.filter((f) => wordish(f).test(v.prompt));
    assert.deepEqual(sucio, [], 'D-42-16: ninguna casilla de Phase 43 puede entrar en el fichero, ni en el prompt');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 10. Disparadores y marcos distintos por variante (D-42-02, D-42-07)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — disparadores, marcos y objetos por variante (D-42-02, D-42-07)', () => {
  test('los 6 disparadores de cada uno de los 5 slots son distintos entre si', () => {
    for (const id of IDS) {
      const triggers = VARIANT_TABLE[id].map((r) => r.trigger);
      assert.equal(new Set(triggers).size, 6, `D-42-07: ${id} repite disparador: ${triggers.join(' | ')}`);
    }
  });

  test('en los 4 slots del paradigma, el objeto literal es DISTINTO entre las variantes que comparten key', () => {
    // Es lo que impide que tres variantes con la misma key sean el mismo
    // ejercicio tres veces.
    for (const id of PARADIGM_SLOTS) {
      const porKey = {};
      byId(id).variants.forEach((v, k) => { (porKey[keyOf(v)] ||= []).push(VARIANT_TABLE[id][k].object); });
      for (const [key, objs] of Object.entries(porKey)) {
        if (objs.length < 2) continue;
        assert.equal(new Set(objs).size, objs.length, `D-42-07: ${id} repite el objeto entre las variantes de "${key}": ${objs.join(', ')}`);
      }
    }
  });

  test('solo COMPOUND_SLOTS declara marco de concordancia; los otros 3 slots lo dejan en null', () => {
    for (const id of IDS) {
      const conMarco = VARIANT_TABLE[id].filter((r) => r.frame !== null).length;
      assert.equal(conMarco, COMPOUND_SLOTS.includes(id) ? 6 : 0, `D-42-02: ${id} declara ${conMarco} marcos`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 11. Canon editorial e higiene del JSON (D-42-17, D-42-14, T-42-01, T-42-02)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — canon editorial e higiene del JSON (D-42-17, T-42-01)', () => {
  const strings = [];
  const claves = [];
  (function walk(node) {
    if (typeof node === 'string') { strings.push(node); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) { claves.push(k); walk(node[k]); }
    }
  })(CONTENT);

  test('ningun string del fichero lleva corchetes angulares, entidades, javascript: ni backticks', () => {
    // T-42-01: la invariante x-text-only del proyecto (T-02-01) significa que el
    // contenido se renderiza SIEMPRE como texto. Este escaneo es el cinturon.
    for (const marca of ['<', '>', '&#', 'javascript:', '`']) {
      const sucio = strings.filter((s) => s.includes(marca)).map((s) => s.slice(0, 60));
      assert.deepEqual(sucio, [], `T-42-01: aparece ${marca} en el contenido`);
    }
  });

  test('ningun string lleva comillas tipograficas: apostrofes ASCII U+0027 (D-42-17)', () => {
    const sucio = strings.filter((s) => /[‘’“”]/.test(s)).map((s) => s.slice(0, 60));
    assert.deepEqual(sucio, [], 'D-42-17: smart quotes en el contenido');
  });

  test('ninguna clave propia del objeto parseado se llama __proto__, constructor ni prototype', () => {
    // T-42-02: JSON.parse crea `__proto__` como own-property si el literal la
    // declara. El fichero declara UNICAMENTE el key set del schema.
    const sucias = claves.filter((k) => ['__proto__', 'constructor', 'prototype'].includes(k));
    assert.deepEqual(sucias, [], 'T-42-02: clave peligrosa en el JSON de contenido');
    assert.equal(({}).polluted, undefined, 'T-42-02: prototype pollution tras el parse');
  });

  test('las 5 explanations estan en espanol acentuado, no estan vacias y no adelantan Phase 43', () => {
    for (const s of SLOTS) {
      assert.ok(s.explanation.trim().length > 0, `D-42-17: ${s.id} sin explanation`);
      assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/, `D-42-17: la explanation de ${s.id} no lleva ningun acento RAE`);
      assert.ok(!s.explanation.includes('imperativo'), `D-42-15: la explanation de ${s.id} menciona el imperativo, que es de Phase 43`);
    }
  });

  test('la dosificacion del error de interferencia es la que D-42-14 declara', () => {
    // DOSIFICACION DELIBERADA, no inconsistencia editorial: el slot del
    // disparador lo DESARROLLA con el par explicito, y passato y trapassato NO
    // lo repiten, porque ahi el eje es la ANTERIORIDAD y no el modo.
    const d = byId(TRIGGER_SLOT).explanation;
    for (const marca of ['pienso que', 'penso che', 'certeza', 'condicional']) {
      assert.ok(d.includes(marca), `D-42-14: la explanation del disparador no desarrolla "${marca}"`);
    }
    assert.ok(d.length > 600, `D-42-14: la explanation del disparador es la mas desarrollada de la fase (${d.length} caracteres)`);
    const sucio = COMPOUND_SLOTS.filter((id) => byId(id).explanation.includes('pienso que'));
    assert.deepEqual(sucio, [], 'D-42-14: passato y trapassato NO repiten la linea de interferencia');
  });

  test('las explanations de los compuestos citan su paradigma y nombran la anterioridad', () => {
    const p = byId('fare-congiuntivo-passato').explanation;
    const t = byId('fare-congiuntivo-trapassato').explanation;
    for (const f of ['abbia fatto', 'abbiamo fatto', 'abbiate fatto', 'abbiano fatto']) {
      assert.ok(p.includes(f), `CONG-03: la explanation del passato no cita ${f}`);
    }
    for (const f of ['avessi fatto', 'avesse fatto', 'avessimo fatto', 'aveste fatto', 'avessero fatto']) {
      assert.ok(t.includes(f), `CONG-03: la explanation del trapassato no cita ${f}`);
    }
    assert.ok(p.includes('anterior') && t.includes('anterior'), 'CONG-03: el eje de los compuestos es la anterioridad y las explanations tienen que decirlo');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 12. Audit trail de validacion y ronda EXTRA condicionada (D-42-08, T-42-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — audit trail de validacion y ronda EXTRA (D-42-08, T-42-03)', () => {
  // ESTOS ASSERTS SON VERDES CON passes: [] — deriveStatus([]) devuelve
  // 'pending', asi que la igualdad se cumple ANTES de que corra el quorum. Su
  // funcion NO es exigir que la categoria este validada (eso lo hace el gate
  // VAL_07_STRICT del smoke parametrico, que al cerrar Phase 42 esta en rojo a
  // proposito): es impedir que un `validated` escrito a mano, sin pases reales,
  // pase por bueno. El audit trail es la unica evidencia que el autor tiene de
  // que una variante fue revisada, y falsificarlo es indetectable a ojo.
  test('los 5 slots tienen validation con status string y passes array', () => {
    for (const s of SLOTS) {
      assert.ok(s.validation && typeof s.validation === 'object', `${s.id}: falta validation`);
      assert.equal(typeof s.validation.status, 'string', `${s.id}: validation.status debe ser string`);
      assert.ok(Array.isArray(s.validation.passes), `${s.id}: validation.passes debe ser array`);
    }
  });

  test('status coincide con deriveStatus(passes) en los 5 slots: no se puede forjar un validated', () => {
    for (const s of SLOTS) {
      assert.equal(
        s.validation.status,
        deriveStatus(s.validation.passes),
        `T-42-03: ${s.id} declara "${s.validation.status}" pero sus ${s.validation.passes.length} pases derivan "${deriveStatus(s.validation.passes)}"`
      );
    }
  });

  test('si un slot esta validated, sus pases cumplen el quorum: >=2 correcta, >=2 by distintos, 0 incorrecta', () => {
    for (const s of SLOTS.filter((x) => x.validation.status === 'validated')) {
      const passes = s.validation.passes;
      const correctas = passes.filter((p) => p.verdict === 'correcta');
      assert.ok(correctas.length >= 2, `${s.id}: validated con ${correctas.length} pases correcta`);
      assert.ok(new Set(correctas.map((p) => p.by)).size >= 2, `${s.id}: validated sin 2 by distintos`);
      assert.equal(passes.filter((p) => p.verdict === 'incorrecta').length, 0, `${s.id}: validated con un pase incorrecta`);
    }
  });

  test('los 4 slots del paradigma llevan un pase deepseek cuando pasan a validated (D-42-08)', () => {
    // La ronda EXTRA cubre las 10 variantes homografas, que viven en los 4 slots
    // del paradigma. El slot del disparador NO la lleva: no tiene homografas.
    for (const id of EXTRA_ROUND_SLOTS) {
      const s = byId(id);
      if (s.validation.status !== 'validated') continue;
      const bys = s.validation.passes.map((p) => String(p.by || '').toLowerCase());
      assert.ok(
        bys.some((b) => b.startsWith('deepseek')),
        `D-42-08: ${id} esta validated sin la ronda EXTRA obligatoria (ningun by empieza por deepseek): ${bys.join(', ')}`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 13. Registro de la categoria (D-42-18, SC-5)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-congiuntivo — registro de la categoria (D-42-18, SC-5)', () => {
  // Red de regresion del registro: la entrada de content/categories.json no es
  // cosmetica. Es prerequisito de schema (categoryIds debe referenciar una
  // categoria conocida) Y es lo que hace que la fila aparezca en home, picker,
  // Repaso y Examen, porque categoriesForDisplay itera content.categories.
  const entradas = CATEGORIES.categories;

  test('existe la entrada fare-congiuntivo con las 4 claves exactas, order 16 y origen ia-quorum', () => {
    const cat = entradas.find((c) => c.id === 'fare-congiuntivo');
    assert.ok(cat, 'D-42-18: no existe la entrada fare-congiuntivo');
    assert.deepEqual(Object.keys(cat).sort(), ['id', 'name', 'order', 'origen'], 'D-42-18: key set de la entrada');
    assert.equal(cat.order, 16, 'D-42-18: order documental');
    assert.equal(cat.origen, 'ia-quorum', 'D-42-18: origen (PROV-01)');
    assert.ok(cat.name.trim().length > 0, 'D-42-18: name no vacio');
  });

  test('ocupa en el array la posicion que dice su order, que es el orden de display', () => {
    // Este assert es correcto HOY y se pondra rojo cuando Phase 43 apende la 17a
    // entrada solo si alguien la inserta antes. Es el patron heredado del
    // analogo (indice = order - 1) y se mantiene a proposito: es la red de
    // regresion del registro.
    const idx = entradas.findIndex((c) => c.id === 'fare-congiuntivo');
    assert.equal(idx, 15, 'D-42-18: el array define el display (order 16 -> indice 15)');
  });

  test('los 5 slots referencian el slug de la categoria en categoryIds (SC-5)', () => {
    for (const s of SLOTS) {
      assert.ok(
        Array.isArray(s.categoryIds) && s.categoryIds.includes('fare-congiuntivo'),
        `SC-5: ${s.id} no referencia la categoria fare-congiuntivo`
      );
    }
  });
});
