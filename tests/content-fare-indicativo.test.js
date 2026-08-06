// tests/content-fare-indicativo.test.js
//
// v2.0 Phase 41 (IND-01..IND-06) — invariantes PERMANENTES de la categoria
// `fare-indicativo`: 8 slots x 6 personas = 48 casillas del paradigma del
// indicativo de `fare`. Se ejecuta con:
//
//     node --test tests/content-fare-indicativo.test.js
//
// y entra tambien en el glob de la suite completa:
//
//     node --test tests/*.test.js
//
// ADVERTENCIA DE ESCANEO (heredada de 41-01, no negociable): todos los
// escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]` — y NUNCA sobre el fichero
// completo ni sobre `notes`. El `notes` de la categoria NOMBRA a proposito
// cada forma de la blacklist y cada perifrasis excluida, con su audit trail,
// asi que un grep de fichero entero se auto-invalidaria: fallaria justo por
// el texto que las decisiones D-41-06 y D-41-08 exigen que exista.
//
// Este fichero NO duplica lo que ya cubren otros tests: la validacion de
// schema del bundle auto-descubierto vive en tests/domain.test.js, y el
// coverage de explanations, los apostrofes ASCII, el no-markdown, el leak R1,
// los cross-refs R2 y el gate VAL_07_STRICT viven en el smoke parametrico de
// tests/exercise-types.test.js. Aqui vive solo lo que es especifico de
// `fare-indicativo` y que ningun test existente mira.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { deriveStatus } from '../src/data/validation-state.js';

const CONTENT = JSON.parse(
  readFileSync(new URL('../content/exercises/fare-indicativo.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];

// ───────────────────────────────────────────────────────────────────────────
// Constantes de datos: la especificacion EJECUTABLE de la categoria.
// ───────────────────────────────────────────────────────────────────────────

// CANON — los 8 ids de slot en el orden en que viven en disco, cada uno con
// sus 6 formas correctas en orden de persona (io, tu, lui/lei, noi, voi, loro).
// Es la tabla completa del paradigma: si falta una casilla persona x tiempo,
// el bloque 2 se pone rojo.
const CANON = {
  'fare-indicativo-presente': ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'],
  'fare-indicativo-imperfetto': ['facevo', 'facevi', 'faceva', 'facevamo', 'facevate', 'facevano'],
  'fare-indicativo-futuro-semplice': ['farò', 'farai', 'farà', 'faremo', 'farete', 'faranno'],
  'fare-indicativo-passato-remoto': ['feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero'],
  'fare-indicativo-passato-prossimo': ['ho fatto', 'hai fatto', 'ha fatto', 'abbiamo fatto', 'avete fatto', 'hanno fatto'],
  'fare-indicativo-trapassato-prossimo': ['avevo fatto', 'avevi fatto', 'aveva fatto', 'avevamo fatto', 'avevate fatto', 'avevano fatto'],
  'fare-indicativo-futuro-anteriore': ['avrò fatto', 'avrai fatto', 'avrà fatto', 'avremo fatto', 'avrete fatto', 'avranno fatto'],
  'fare-indicativo-trapassato-remoto': ['ebbi fatto', 'avesti fatto', 'ebbe fatto', 'avemmo fatto', 'aveste fatto', 'ebbero fatto'],
};
const IDS = Object.keys(CANON);
const ALL_CANON_FORMS = new Set(Object.values(CANON).flat());

// D-41-14: los 4 simples son de 41-01 y los 4 compuestos de 41-02. El patron
// de distractoras es DISTINTO en cada grupo (D-41-09 frente a D-41-10), asi
// que el bloque 7 los recorre por separado.
const SIMPLE_SLOTS = IDS.slice(0, 4);
const COMPOUND_SLOTS = IDS.slice(4);

// D-41-07: el eje de variante es la persona, y el pronombre sujeto explicito
// es lo que la hace inequivoca. Tercera singular admite las dos formas.
const PRONOUNS = [['io'], ['tu'], ['lui', 'lei'], ['noi'], ['voi'], ['loro']];
const PRONOUN_RE = /\b(io|tu|lui|lei|noi|voi|loro)\b/gi;

// D-41-08: las 5 formas ATESTIGUADAS (arcaicas, poeticas, dialectales) que no
// entran ni como key ni como distractora. La blacklist real del `notes` es mas
// larga (16 formas tras 41-01); aqui viven las 5 canonicas de la decision.
const BLACKLIST = ['fo', 'fé', 'fenno', 'facea', 'fan'];

// D-41-08 (segunda mitad): formas REALES de otros modos de `fare` — que son
// casillas de las Phases 42 y 43 — mas palabras italianas homografas que una
// autoria podria producir por descuido.
const OTHER_MOODS = [
  'faccia', 'facciate', 'facciano', 'facessi', 'facesse', 'farei', 'farebbe',
  "fa'", 'facci', 'facce', 'fava', 'faro',
];

// D-41-08 (blacklist COMPLETA, el audit trail del `notes` hecho ejecutable).
// POR QUE ESTE SET EXISTE aunque ya haya un conteo de "inexistentes" en el
// bloque 7: ese conteo decide que una opcion es inexistente por AUSENCIA de la
// tabla CANON de este fichero, es decir por no ser una de las 48 keys, y no
// tiene ninguna vista del italiano que hay fuera del fichero. Por esa via una
// forma ATESTIGUADA que el autor descarto una a una — `festi`, `fero`,
// `facette`, la faccia del congiuntivo — contaria como distractora "inexistente"
// legitima y la suite seguiria verde, que es exactamente la clase de bug injusto
// que D-41-08 existe para prevenir. Este set la nombra y la prohibe.
//
// SE ESCANEA SOLO SOBRE `variants[].options[]`, NUNCA sobre el fichero
// completo: el `notes` NOMBRA a proposito cada una de estas formas con su audit
// trail, asi que un grep de fichero entero se auto-invalidaria (ver la
// ADVERTENCIA DE ESCANEO de la cabecera).
const ATESTIGUADAS = new Set([
  // Las 5 canonicas de D-41-08.
  'fo', 'fé', 'fenno', 'facea', 'fan',
  // Anadidas por la autoria de 41-01: poetica de `fa` y su plural nominal.
  'face', 'faci',
  // Homografas italianas: existen con otro significado o son otra forma real.
  'faro', 'fava', 'facce', 'facci',
  // Passato remoto arcaico / poetico / dialectal, descartado una a una.
  'fei', 'festi', 'femmo', 'feste', 'fero', 'feciono',
  'fici', 'facisti', 'facette', 'facettero', 'facero',
  // Otros modos, que son casillas de las Phases 42 y 43: congiuntivo,
  // imperativo apostrofado y condizionale.
  'faccia', 'facciate', 'facciano',
  "fa'",
  'farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero',
]);

// D-41-06 (SCOPE-GATE HARD): marcadores lexicos de las perifrasis y modismos
// que quedan fuera de la fase, y el conjunto CERRADO de objetos permitidos.
const PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel'];
const OBJECTS = ['i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto'];

// D-41-11: los dos repertorios de marco, disjuntos en las DOS direcciones.
const REMOTE_FRAMES = ['nel 19', "quell'", 'anni fa', 'molti anni', 'tanti anni'];
const RECENT_FRAMES = ['stamattina', 'ieri', 'questa settimana', 'oggi', 'poco fa', 'questo mese'];
const PASSATO_REMOTO_SIMPLE = CANON['fare-indicativo-passato-remoto'];

// D-41-02: el marco temporal propio de cada una de las 48 variantes. Los 6 de
// un mismo slot son distintos entre si; en los 4 compuestos el marco es lo que
// fija el tiempo del auxiliar.
const FRAMES = {
  'fare-indicativo-presente': ['ogni giorno', 'Di solito', 'Adesso', 'sempre', 'Ogni mattina', 'In questo momento'],
  'fare-indicativo-imperfetto': ['Da bambino', 'Ogni estate', 'A quei tempi', 'Quando abitavamo a Roma', "L'anno scorso", 'Da piccoli'],
  'fare-indicativo-futuro-semplice': ['Domani', 'Stasera', 'La settimana prossima', 'Il mese prossimo', "L'anno prossimo", 'Dopodomani'],
  'fare-indicativo-passato-remoto': ['Nel 1990', "Quell'estate", 'Molti anni fa', 'Nel 1985', "Quell'inverno", 'Tanti anni fa'],
  'fare-indicativo-passato-prossimo': ['Stamattina', 'Ieri', 'Questa settimana', 'Oggi', 'Poco fa', 'Questo mese'],
  'fare-indicativo-trapassato-prossimo': [
    'Quando i miei amici sono arrivati', 'quando tua madre è tornata', 'Quando la riunione è cominciata',
    'quando gli ospiti sono entrati', 'Quando il treno è partito', 'quando il professore è entrato',
  ],
  'fare-indicativo-futuro-anteriore': [
    'quando il treno partirà', 'Appena arriverà tua sorella', 'Quando comincerà la riunione',
    'Quando arriveranno gli ospiti', 'Appena finirà la lezione', 'Quando tornerà il professore',
  ],
  'fare-indicativo-trapassato-remoto': [
    'uscii di casa', 'tua madre tornò', 'telefonò a suo padre',
    'arrivarono gli ospiti', 'il treno partì', "uscirono dall'aula",
  ],
};

// D-41-10: el auxiliar `avere` por tiempo y por persona. Sirve para clasificar
// las distractoras de los compuestos: 2 llevan el auxiliar en OTRO tiempo pero
// en la MISMA persona que la key, asi que lo unico que las distingue es el
// tiempo del auxiliar — que es exactamente lo que IND-05 examina.
const AVERE_BY_TENSE = {
  presente: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'],
  imperfetto: ['avevo', 'avevi', 'aveva', 'avevamo', 'avevate', 'avevano'],
  futuro: ['avrò', 'avrai', 'avrà', 'avremo', 'avrete', 'avranno'],
  remoto: ['ebbi', 'avesti', 'ebbe', 'avemmo', 'aveste', 'ebbero'],
};
const AVERE_IMPERFETTO = AVERE_BY_TENSE.imperfetto;
const ESSERE_FORMS = [
  'sono', 'sei', 'è', 'siamo', 'siete',
  'ero', 'eri', 'era', 'eravamo', 'eravate', 'erano',
  'sarò', 'sarai', 'sarà', 'saremo', 'sarete', 'saranno',
  'fui', 'fosti', 'fu', 'fummo', 'foste', 'furono',
];

// D-41-03: los 3 conectores del trapassato remoto y su reparto 2+2+2 por
// persona (indice de variante).
const CONNECTORS = { 'dopo che': [0, 3], quando: [1, 4], appena: [2, 5] };

// D-41-12: los 2 slots con ronda EXTRA deepseek obligatoria ademas del quorum
// base. El bloque 11 la exige mecanicamente en cuanto pasen a `validated`.
const EXTRA_ROUND_SLOTS = ['fare-indicativo-passato-remoto', 'fare-indicativo-trapassato-remoto'];

const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));
const allVariants = () => SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));

// ───────────────────────────────────────────────────────────────────────────
// 1. Estructura y conteos (D-41-01, D-41-13, D-41-14)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — estructura y conteos (D-41-01, D-41-13, D-41-14)', () => {
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });

  test('8 slots con los ids exactos de D-41-14, en el orden en que viven en disco', () => {
    assert.deepEqual(SLOTS.map((s) => s.id), IDS, 'D-41-14: los 8 ids de slot');
  });

  test('los 8 slots son multiple-choice: 0 match y 0 word-buttons (D-41-13)', () => {
    const otros = SLOTS.filter((s) => s.type !== 'multiple-choice').map((s) => `${s.id}(${s.type})`);
    assert.deepEqual(otros, [], 'D-41-13: MC-only, el 0-match y el 0-wb son decision razonada');
  });

  test('6 variantes por slot y 48 en total (D-41-01)', () => {
    for (const id of IDS) {
      assert.equal(byId(id).variants.length, 6, `D-41-01: ${id} debe tener 6 variantes (una por persona)`);
    }
    assert.equal(SLOTS.reduce((a, s) => a + s.variants.length, 0), 48, 'D-41-01: 48 casillas persona x tiempo');
  });

  test('el key set de cada slot y de cada variante es el del schema (T-41-02)', () => {
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

  test('ningun id lleva sufijo numerico de 3 cifras: el espacio -300+ queda libre (D-41-14)', () => {
    // Los cruces multi-categoria son de Phase 44 / INT-03 y viven en -300+.
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, [], 'D-41-14: fare-indicativo-300+ es espacio reservado para Phase 44');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. El paradigma completo (IND-01..IND-06)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — paradigma completo, 48 keys (IND-01..IND-06)', () => {
  for (const id of IDS) {
    test(`${id}: las 6 keys son el paradigma de la casilla, en orden de persona`, () => {
      const keys = byId(id).variants.map(keyOf);
      assert.deepEqual(keys, CANON[id], `paradigma de ${id}`);
      assert.equal(new Set(keys).size, 6, `${id}: ninguna key repetida entre las 6 variantes`);
    });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Eje de persona (D-41-07)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — eje de persona con pronombre explicito (D-41-07)', () => {
  test('los 48 prompts contienen el hueco literal ___', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.ok(v.prompt.includes('___'), `${slot.id}#${k}: falta el hueco ___`);
    }
  });

  test('cada prompt contiene EXACTAMENTE un pronombre sujeto de los 6', () => {
    for (const { slot, v, k } of allVariants()) {
      const hits = v.prompt.match(PRONOUN_RE) || [];
      assert.equal(hits.length, 1, `D-41-07: ${slot.id}#${k} tiene ${hits.length} pronombres (${hits.join(', ')}): "${v.prompt}"`);
    }
  });

  test('el pronombre de la variante k es el de la persona k de su paradigma', () => {
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const hit = (v.prompt.match(PRONOUN_RE) || [''])[0].toLowerCase();
        assert.ok(
          PRONOUNS[k].includes(hit),
          `D-41-07: ${id}#${k} deberia llevar ${PRONOUNS[k].join('/')} y lleva "${hit}" para la key "${keyOf(v)}"`
        );
      });
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. 0-gloss (D-41-05)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — 0-gloss en los 48 prompts (D-41-05)', () => {
  // POR QUE ESTE TEST EXISTE, para quien venga a "arreglarlo": el canon R7 del
  // proyecto pone un gloss "(en espanol: ...)" en los prompts porque ahi
  // DESAMBIGUA. En esta categoria no desambigua: FILTRA. El castellano mapea
  // casi 1:1 en 7 de las 8 casillas (hacia / hice / hare / he hecho / habia
  // hecho / habre hecho), asi que un gloss sobre el verbo REGALA el tiempo, y
  // el ejercicio de esta categoria ES elegir el tiempo — leak R1 directo.
  // El 0-gloss aqui es DECISION razonada, no omision, y esta declarado en el
  // `notes` del fichero de contenido con su porque. Exigir la ausencia de
  // parentesis es la forma mas robusta de mantenerlo: cualquier gloss, en
  // cualquier redaccion, necesita parentesis. Si algun dia hace falta un gloss
  // en una variante concreta, hay que cambiar la decision en el `notes` y
  // re-pasar el quorum de esa variante, no relajar este test.
  test('ningun prompt contiene parentesis', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.ok(!/[()]/.test(v.prompt), `D-41-05: ${slot.id}#${k} lleva parentesis: "${v.prompt}"`);
    }
  });

  test('ningun prompt menciona el espanol en ninguna capitalizacion', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.ok(!/espa/i.test(v.prompt), `D-41-05: ${slot.id}#${k} menciona el espanol: "${v.prompt}"`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. SCOPE-GATE lexico (D-41-06)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — SCOPE-GATE lexico de perifrasis (D-41-06)', () => {
  test('ningun prompt ni opcion contiene un marcador de perifrasis', () => {
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('cada prompt lleva un objeto del conjunto CERRADO de 7', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.ok(
        OBJECTS.some((o) => v.prompt.includes(o)),
        `D-41-06: ${slot.id}#${k} no usa ningun objeto del conjunto cerrado: "${v.prompt}"`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Blacklist de formas atestiguadas y formas de otros modos (D-41-08)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — blacklist de formas atestiguadas (D-41-08)', () => {
  test('ninguna opcion coincide con una forma atestiguada de la blacklist', () => {
    // El riesgo real no es que el autor escriba `fo`: es que la AUTORIA la
    // genere como distractora "obviamente mala" siendo forma valida, lo que
    // produciria un ejercicio injusto.
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => BLACKLIST.includes(o));
      assert.deepEqual(sucio, [], `D-41-08: ${slot.id}#${k} ofrece una forma atestiguada: ${sucio.join(', ')}`);
    }
  });

  test('ninguna palabra de ninguna opcion de las 48 variantes es una forma italiana atestiguada de la blacklist completa (D-41-08)', () => {
    // Garantiza lo que el conteo de "inexistentes" del bloque 7 NO puede
    // garantizar: que ninguna distractora sea una forma que exista de verdad en
    // italiano — arcaica, poetica, dialectal, homografa o de otro modo. Una
    // opcion compuesta son dos palabras, asi que se miran las DOS.
    for (const { slot, v, k } of allVariants()) {
      for (const o of v.options) {
        const sucio = o.split(' ').filter((p) => ATESTIGUADAS.has(p));
        assert.deepEqual(
          sucio,
          [],
          `D-41-08: ${slot.id}#${k} ofrece la opcion "${o}", que contiene la forma atestiguada ${sucio.join(', ')} — no puede ser distractora, va a la blacklist del notes`
        );
      }
    }
  });

  test('ninguna opcion es una forma real de otro modo ni una homografa italiana', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => OTHER_MOODS.includes(o));
      assert.deepEqual(sucio, [], `D-41-08: ${slot.id}#${k} ofrece forma de otro modo u homografa: ${sucio.join(', ')}`);
    }
  });

  test('ninguna opcion lleva el participio concordado: es el MAGNET de Phase 43', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => /\bfatt[aie]\b/.test(o));
      assert.deepEqual(sucio, [], `D-41-10: ${slot.id}#${k} adelanta la concordancia de Phase 43: ${sucio.join(', ')}`);
    }
  });

  test('el notes nombra las 5 formas de la blacklist y las 2 explanations las citan', () => {
    // En POSITIVO: el audit trail tiene que existir, no solo la ausencia.
    for (const f of BLACKLIST) {
      assert.ok(CONTENT.notes.includes(`'${f}'`), `D-41-08: el notes no documenta la forma ${f}`);
    }
    for (const f of ["'fo'", "'fan'"]) {
      assert.ok(byId('fare-indicativo-presente').explanation.includes(f), `D-41-08: la explanation del presente no cita ${f}`);
    }
    for (const f of ["'fé'", "'fenno'"]) {
      assert.ok(byId('fare-indicativo-passato-remoto').explanation.includes(f), `D-41-08: la explanation del passato remoto no cita ${f}`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Patron de distractoras por familia de slot (D-41-09, D-41-10)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — patron de distractoras de los 4 simples (D-41-09)', () => {
  for (const id of SIMPLE_SLOTS) {
    test(`${id}: 1 key + 1 forma real de otra persona + 2 formas inexistentes`, () => {
      eachVariant(id, (v, k) => {
        assert.equal(v.options.length, 4, `${id}#${k}: 4 opciones`);
        assert.equal(new Set(v.options).size, 4, `${id}#${k}: opciones sin duplicados`);
        const key = keyOf(v);
        assert.equal(v.options.filter((o) => o === key).length, 1, `${id}#${k}: la key aparece una sola vez`);
        const resto = v.options.filter((o) => o !== key);
        const otraPersona = resto.filter((o) => CANON[id].includes(o));
        const inexistentes = resto.filter((o) => !ALL_CANON_FORMS.has(o));
        assert.equal(otraPersona.length, 1, `D-41-09: ${id}#${k} debe ofrecer 1 forma real de otra persona, ofrece ${otraPersona.length}`);
        assert.equal(inexistentes.length, 2, `D-41-09: ${id}#${k} debe ofrecer 2 formas inexistentes, ofrece ${inexistentes.length} (${resto.join(', ')})`);
      });
    });
  }
});

describe('fare-indicativo — patron de distractoras de los 4 compuestos (D-41-10)', () => {
  const tenseOf = (aux, persona) =>
    Object.entries(AVERE_BY_TENSE).find(([, formas]) => formas[persona] === aux)?.[0];

  for (const id of COMPOUND_SLOTS) {
    test(`${id}: 2 palabras por opcion, 2 distractoras de auxiliar en la misma persona y 1 malformada`, () => {
      eachVariant(id, (v, k) => {
        assert.equal(v.options.length, 4, `${id}#${k}: 4 opciones`);
        assert.equal(new Set(v.options).size, 4, `${id}#${k}: opciones sin duplicados`);
        // LA invariante estructural: dos palabras y la segunda es `fatto` o
        // `fare`. Excluye a la vez la distractora de tiempo SIMPLE (rechazada
        // explicitamente por D-41-10) y el participio concordado (MAGNET de
        // Phase 43). Si se relaja, las dos prohibiciones se caen juntas.
        for (const o of v.options) {
          const palabras = o.split(' ');
          assert.equal(palabras.length, 2, `D-41-10: ${id}#${k} la opcion "${o}" no es de dos palabras`);
          assert.ok(['fatto', 'fare'].includes(palabras[1]), `D-41-10: ${id}#${k} la segunda palabra de "${o}" no es fatto ni fare`);
        }
        const key = keyOf(v);
        const keyTense = tenseOf(key.split(' ')[0], k);
        assert.ok(keyTense, `${id}#${k}: la key "${key}" no lleva un auxiliar avere reconocible en la persona ${k}`);
        const resto = v.options.filter((o) => o !== key);
        const malformadas = resto.filter((o) => ESSERE_FORMS.includes(o.split(' ')[0]) || o.split(' ')[1] === 'fare');
        const auxSwap = resto.filter((o) => {
          const [aux, part] = o.split(' ');
          if (part !== 'fatto') return false;
          const t = tenseOf(aux, k);
          return Boolean(t) && t !== keyTense;
        });
        assert.equal(auxSwap.length, 2, `D-41-10: ${id}#${k} debe ofrecer 2 auxiliares en otro tiempo y MISMA persona, ofrece ${auxSwap.length} (${resto.join(', ')})`);
        assert.equal(malformadas.length, 1, `D-41-10: ${id}#${k} debe ofrecer 1 construccion malformada, ofrece ${malformadas.length} (${resto.join(', ')})`);
      });
    });
  }

  test('trapassato remoto: NINGUNA opcion lleva el auxiliar en imperfetto (desviacion declarada de D-41-10)', () => {
    // El trapassato prossimo es el competidor casi sinonimo tras `quando` y
    // tras `dopo che`; ofrecerlo abriria exactamente la segunda lectura del
    // marco que SC-2 prohibe. Es el mecanismo (ii) de la unicidad de lectura.
    eachVariant('fare-indicativo-trapassato-remoto', (v, k) => {
      const sucio = v.options.filter((o) => AVERE_IMPERFETTO.includes(o.split(' ')[0]));
      assert.deepEqual(sucio, [], `D-41-03: trapassato remoto #${k} ofrece el auxiliar en imperfetto: ${sucio.join(', ')}`);
    });
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Marcos disjuntos, en las DOS direcciones (D-41-11) + marco propio (D-41-02)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — marcos disjuntos passato remoto / passato prossimo (D-41-11)', () => {
  test('direccion remoto -> reciente: el passato remoto no lleva ningun marco reciente', () => {
    eachVariant('fare-indicativo-passato-remoto', (v, k) => {
      const sucio = RECENT_FRAMES.filter((m) => v.prompt.toLowerCase().includes(m));
      assert.deepEqual(sucio, [], `D-41-11: passato remoto #${k} lleva marco reciente: ${sucio.join(', ')}`);
    });
  });

  test('direccion remoto -> reciente: ninguna opcion del passato remoto es un compuesto', () => {
    eachVariant('fare-indicativo-passato-remoto', (v, k) => {
      const sucio = v.options.filter((o) => o.includes('fatt'));
      assert.deepEqual(sucio, [], `D-41-11: passato remoto #${k} ofrece un compuesto: ${sucio.join(', ')}`);
    });
  });

  test('direccion reciente -> remoto: el passato prossimo no lleva ningun marco remoto', () => {
    eachVariant('fare-indicativo-passato-prossimo', (v, k) => {
      const sucio = REMOTE_FRAMES.filter((m) => v.prompt.toLowerCase().includes(m));
      assert.deepEqual(sucio, [], `D-41-11: passato prossimo #${k} lleva marco remoto: ${sucio.join(', ')}`);
    });
  });

  test('direccion reciente -> remoto: ninguna opcion del passato prossimo es una forma simple de passato remoto', () => {
    // En el italiano real del norte el passato prossimo cubre lo que el sur
    // expresa con passato remoto: una distractora cruzada seria valida para
    // media Italia, en cualquiera de las dos direcciones.
    eachVariant('fare-indicativo-passato-prossimo', (v, k) => {
      const sucio = v.options.filter((o) => PASSATO_REMOTO_SIMPLE.includes(o));
      assert.deepEqual(sucio, [], `D-41-11: passato prossimo #${k} ofrece passato remoto simple: ${sucio.join(', ')}`);
    });
  });
});

describe('fare-indicativo — marco temporal propio por variante (D-41-02)', () => {
  for (const id of IDS) {
    test(`${id}: cada variante lleva su marco y los 6 son distintos`, () => {
      const marcos = FRAMES[id];
      assert.equal(new Set(marcos).size, 6, `D-41-02: los 6 marcos de ${id} deben ser distintos`);
      eachVariant(id, (v, k) => {
        assert.ok(v.prompt.includes(marcos[k]), `D-41-02: ${id}#${k} deberia llevar el marco "${marcos[k]}": "${v.prompt}"`);
      });
    });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// 9. El marco del trapassato remoto (D-41-03, D-41-04, SC-3)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — marco sintactico del trapassato remoto (D-41-03, D-41-04)', () => {
  test('cada prompt lleva EXACTAMENTE uno de los 3 conectores', () => {
    eachVariant('fare-indicativo-trapassato-remoto', (v, k) => {
      const hits = Object.keys(CONNECTORS).filter((c) => v.prompt.toLowerCase().includes(c));
      assert.equal(hits.length, 1, `D-41-03: trapassato remoto #${k} lleva ${hits.length} conectores (${hits.join('/')}): "${v.prompt}"`);
    });
  });

  test('el reparto de los 3 conectores es 2 + 2 + 2 y cada uno cae en sus personas', () => {
    const real = {};
    eachVariant('fare-indicativo-trapassato-remoto', (v, k) => {
      const c = Object.keys(CONNECTORS).find((x) => v.prompt.toLowerCase().includes(x));
      (real[c] ||= []).push(k);
    });
    for (const [c, personas] of Object.entries(CONNECTORS)) {
      assert.deepEqual(real[c], personas, `D-41-03: "${c}" debe caer en las variantes ${personas.join(' y ')}`);
    }
  });

  test('la principal va en passato remoto y su verbo no es una forma de fare', () => {
    eachVariant('fare-indicativo-trapassato-remoto', (v, k) => {
      assert.ok(
        v.prompt.includes(FRAMES['fare-indicativo-trapassato-remoto'][k]),
        `D-41-03: trapassato remoto #${k} no lleva su oracion principal en passato remoto`
      );
      const sucio = PASSATO_REMOTO_SIMPLE.filter((f) => v.prompt.includes(f));
      assert.deepEqual(sucio, [], `D-41-03: trapassato remoto #${k} duplica el verbo examinado en la principal: ${sucio.join(', ')}`);
    });
  });

  test('la explanation dice EXPLICITAMENTE que fuera del marco la forma no se usa (D-41-04, SC-3)', () => {
    const expl = byId('fare-indicativo-trapassato-remoto').explanation;
    for (const f of CANON['fare-indicativo-trapassato-remoto']) {
      assert.ok(expl.includes(f), `D-41-04: la explanation no cita la forma ${f}`);
    }
    for (const c of Object.keys(CONNECTORS)) {
      assert.ok(expl.toLowerCase().includes(c), `D-41-04: la explanation no nombra el conector ${c}`);
    }
    assert.ok(expl.includes('passato remoto'), 'D-41-04: la explanation no nombra el passato remoto de la principal');
    assert.match(expl, /fuera de/i, 'SC-3: la explanation no acota el marco con una frase localizable');
    assert.match(expl, /no se usa/i, 'SC-3: la explanation no dice que fuera del marco la forma NO SE USA');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 10. Canon editorial e higiene del contenido (D-41-17, T-41-01, T-41-02)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — canon editorial e higiene del JSON (D-41-17, T-41-01)', () => {
  const strings = [];
  const claves = [];
  (function walk(node) {
    if (typeof node === 'string') { strings.push(node); return; }
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (node && typeof node === 'object') {
      for (const k of Object.keys(node)) { claves.push(k); walk(node[k]); }
    }
  })(CONTENT);

  test('ningun string del fichero lleva corchetes angulares, entidades ni javascript:', () => {
    // T-41-01: la invariante x-text-only del proyecto (T-02-01) significa que
    // el contenido se renderiza SIEMPRE como texto. Este escaneo es el cinturon.
    for (const marca of ['<', '>', '&#', 'javascript:']) {
      const sucio = strings.filter((s) => s.includes(marca));
      assert.deepEqual(sucio.map((s) => s.slice(0, 60)), [], `T-41-01: aparece ${marca} en el contenido`);
    }
  });

  test('ningun string lleva comillas tipograficas: apostrofes ASCII U+0027 (D-41-17)', () => {
    const sucio = strings.filter((s) => /[‘’“”]/.test(s));
    assert.deepEqual(sucio.map((s) => s.slice(0, 60)), [], 'D-41-17: smart quotes en el contenido');
  });

  test('ninguna clave propia del objeto parseado se llama __proto__, constructor ni prototype', () => {
    // T-41-02: JSON.parse crea `__proto__` como own-property si el literal la
    // declara. El fichero declara UNICAMENTE el key set del schema.
    const sucias = claves.filter((k) => ['__proto__', 'constructor', 'prototype'].includes(k));
    assert.deepEqual(sucias, [], 'T-41-02: clave peligrosa en el JSON de contenido');
  });

  test('las 8 explanations estan en espanol acentuado y no estan vacias (D-41-17)', () => {
    for (const s of SLOTS) {
      assert.ok(s.explanation.trim().length > 0, `D-41-17: ${s.id} sin explanation`);
      assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/, `D-41-17: la explanation de ${s.id} no lleva ningun acento RAE`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 11. Coherencia del audit trail de validacion (D-41-12, D-41-15, T-41-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — coherencia del audit trail de validacion (D-41-15, T-41-03)', () => {
  // ESTOS ASSERTS SON VERDES CON passes: [] — deriveStatus([]) devuelve
  // 'pending', asi que la igualdad se cumple antes de que corra el quorum. Su
  // funcion NO es exigir que la categoria este validada (eso lo hace el gate
  // VAL_07_STRICT del smoke parametrico): es impedir que un `validated`
  // escrito a mano, sin pases reales, pase por bueno. El audit trail es la
  // unica evidencia que el autor tiene de que una variante fue revisada, y
  // falsificarlo es indetectable a ojo.
  test('los 8 slots tienen validation con status y passes array', () => {
    for (const s of SLOTS) {
      assert.ok(s.validation && typeof s.validation === 'object', `${s.id}: falta validation`);
      assert.equal(typeof s.validation.status, 'string', `${s.id}: validation.status debe ser string`);
      assert.ok(Array.isArray(s.validation.passes), `${s.id}: validation.passes debe ser array`);
    }
  });

  test('status coincide con deriveStatus(passes) en los 8 slots: no se puede forjar un validated', () => {
    for (const s of SLOTS) {
      assert.equal(
        s.validation.status,
        deriveStatus(s.validation.passes),
        `T-41-03: ${s.id} declara "${s.validation.status}" pero sus ${s.validation.passes.length} pases derivan "${deriveStatus(s.validation.passes)}"`
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

  test('los 2 slots con ronda EXTRA llevan un pase deepseek cuando pasan a validated (D-41-12)', () => {
    for (const id of EXTRA_ROUND_SLOTS) {
      const s = byId(id);
      if (s.validation.status !== 'validated') continue;
      const bys = s.validation.passes.map((p) => String(p.by || '').toLowerCase());
      assert.ok(
        bys.some((b) => b.startsWith('deepseek')),
        `D-41-12: ${id} esta validated sin la ronda EXTRA obligatoria (ningun by empieza por deepseek): ${bys.join(', ')}`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 12. Registro de la categoria (D-41-16, SC-5)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — registro de la categoria (D-41-16, SC-5)', () => {
  // Red de regresion del registro: la entrada de content/categories.json no es
  // cosmetica. Es prerequisito de schema (categoryIds debe referenciar una
  // categoria conocida) Y es lo que hace que la fila aparezca en home, picker,
  // Repaso y Examen, porque categoriesForDisplay itera content.categories.
  const entradas = CATEGORIES.categories;

  test('existe la entrada fare-indicativo con las 4 claves exactas, order 15 y origen ia-quorum', () => {
    const cat = entradas.find((c) => c.id === 'fare-indicativo');
    assert.ok(cat, 'D-41-16: no existe la entrada fare-indicativo');
    assert.deepEqual(Object.keys(cat).sort(), ['id', 'name', 'order', 'origen'], 'D-41-16: key set de la entrada');
    assert.equal(cat.order, 15, 'D-41-16: order documental');
    assert.equal(cat.origen, 'ia-quorum', 'D-41-16: origen (PROV-01)');
    assert.ok(cat.name.trim().length > 0, 'D-41-16: name no vacio');
  });

  // v2.0 Phase 42: este assert exigia que fare-indicativo fuese la ULTIMA
  // entrada del array. Era cierto mientras fuese la categoria mas reciente, pero
  // no es el invariante: el invariante es que el ARRAY define el display y que su
  // posicion es coherente con el order documental. Phase 42 apende
  // fare-congiuntivo (order 16) y Phase 43 apendera la 17a, asi que la version
  // "ultima" caduca cada fase. Se reescribe a la forma estable: indice = order-1.
  // WR-05 (revision de codigo del 2026-08-06): el comentario de arriba promete
  // «la forma estable: indice = order-1» y el codigo asertaba `idx === 14`, una
  // constante independiente que hoy coincide con `order - 1` por casualidad y no
  // por gate. El invariante enunciado no estaba codificado en ninguna parte y el
  // mensaje ('order 15 -> indice 14') reforzaba una lectura falsa. Ahora se
  // deriva de verdad: el numero magico desaparece y el assert dice lo que el
  // comentario dice.
  test('ocupa en el array la posicion que dice su order, que es el orden de display', () => {
    const cat = entradas.find((c) => c.id === 'fare-indicativo');
    assert.equal(
      entradas.indexOf(cat),
      cat.order - 1,
      `D-41-16: el array define el display (indice = order - 1); order ${cat.order} pide indice ${cat.order - 1}`
    );
  });

  test('los 8 slots referencian el slug de la categoria en categoryIds (SC-5)', () => {
    for (const s of SLOTS) {
      assert.ok(
        Array.isArray(s.categoryIds) && s.categoryIds.includes('fare-indicativo'),
        `SC-5: ${s.id} no referencia la categoria fare-indicativo`
      );
    }
  });
});
