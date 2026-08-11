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
// PARTICION BASE / CRUCE (v2.0 Phase 44, INT-03 — leer antes de tocar un gate):
// desde Phase 44 el array `exercises` de esta categoria contiene DOS clases de
// slot: los 8 del PARADIGMA (48 casillas persona x tiempo) y los cruces
// multi-categoria `-300`+ (`categoryIds` de 2, key en la categoria VECINA y la
// forma de `fare` escrita en el enunciado como contexto). Los gates de paradigma
// —conteo de 48, igualdad de ids con `IDS`, un solo pronombre sujeto, 0-gloss—
// gobiernan la BASE y solo la base, asi que iteran `BASE_SLOTS` a traves de
// `allVariants()`. Los cruces NO quedan fuera de cobertura: tienen su propio
// bloque al final del fichero, que RE-ASERTA los gates que siguen rigiendo sobre
// ellos y añade los predicados G1/G2. Re-apuntar un gate a la particion que de
// verdad gobierna es legitimo; bajarle la barra no lo es.
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

// v2.0 Phase 44 (INT-03, D-44-01, D-44-02): los cruces multi-categoria de la
// categoria, alojados en el espacio `-300`+ que D-41-14 reservo. La lista queda
// CERRADA (D-44-05) y el id va SIEMPRE con el slug COMPLETO: `fare-ind` es
// prefijo ambiguo entre `fare-indicativo` y `fare-indefiniti` (D-40-03), asi que
// ninguna comprobacion de este fichero se apoya en la forma truncada.
const CROSS_IDS = ['fare-indicativo-300'];

// La pareja de `categoryIds` que le toca a CADA cruce, congelada por id: el
// segundo slug es el de la categoria VECINA donde vive la key. Un mapa y no una
// pareja unica, porque los dos cruces de esta categoria apuntan a vecinas
// DISTINTAS (`avere` y `presente-regolare`).
const CROSS_PAIRS = {
  'fare-indicativo-300': ['fare-indicativo', 'avere'],
};

const BASE_SLOTS = SLOTS.filter((s) => !CROSS_IDS.includes(s.id));
const CROSS_SLOTS = SLOTS.filter((s) => CROSS_IDS.includes(s.id));

// G1 (D-44-04): en `fare-indicativo-300` el participio `fatto` va ESCRITO en el
// enunciado y es SIEMPRE invariable, asi que ningun prompt puede llevar un
// pronombre objeto antepuesto: con `lo`/`la`/`li`/`le` delante del auxiliar la
// concordancia del participio seria obligatoria (`li ho fatti`) y la frase
// abriria una segunda lectura defendible. Es D-43-16 aplicado al reves.
const OBJECT_PRONOUN_RE = /(^|[^\p{L}])(lo|la|li|le)([^\p{L}]|$)/iu;

// G1/G2/G3 (D-44-04): en los cruces el hueco NO es una forma de `fare` — la key
// vive en la categoria vecina—, asi que ninguna opcion puede contener una. Se
// prohibe la INICIAL entera y no una lista de formas, por el mismo motivo por el
// que el 0-gloss se guarda exigiendo la ausencia de parentesis: toda forma de
// `fare` empieza por f-, y una lista enumerada se queda corta en cuanto la
// autoria inventa una forma nueva. En los pools de los cruces (auxiliares de
// `avere`/`essere`, personas de un verbo regular, modales conjugados) no hay
// ninguna palabra legitima con inicial f-, asi que la sobre-cobertura no cuesta
// nada y cierra el agujero de raiz.
const FARE_INITIAL_RE = /^(f|fa|fe)/i;

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
// `allVariants()` itera la BASE y no `SLOTS`: es UNA edicion que acota de golpe
// los 14 call-sites de los gates de paradigma a los 8 slots que de verdad
// gobiernan (ver PARTICION BASE / CRUCE en la cabecera). Los cruces se recorren
// con `crossVariants()`, su gemelo, en el bloque 13.
const allVariants = () => BASE_SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));
const crossVariants = () => CROSS_SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));

// ───────────────────────────────────────────────────────────────────────────
// 1. Estructura y conteos (D-41-01, D-41-13, D-41-14)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — estructura y conteos (D-41-01, D-41-13, D-41-14)', () => {
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });

  test('8 slots de PARADIGMA con los ids exactos de D-41-14, en el orden en que viven en disco', () => {
    assert.deepEqual(BASE_SLOTS.map((s) => s.id), IDS, 'D-41-14: los 8 ids de slot del paradigma');
  });

  test('los 8 slots son multiple-choice: 0 match y 0 word-buttons (D-41-13)', () => {
    const otros = SLOTS.filter((s) => s.type !== 'multiple-choice').map((s) => `${s.id}(${s.type})`);
    assert.deepEqual(otros, [], 'D-41-13: MC-only, el 0-match y el 0-wb son decision razonada');
  });

  test('6 variantes por slot y 48 en total (D-41-01)', () => {
    for (const id of IDS) {
      assert.equal(byId(id).variants.length, 6, `D-41-01: ${id} debe tener 6 variantes (una por persona)`);
    }
    assert.equal(BASE_SLOTS.reduce((a, s) => a + s.variants.length, 0), 48, 'D-41-01: 48 casillas persona x tiempo');
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

  test('los unicos ids con sufijo numerico de 3 cifras son los cruces declarados (D-41-14, D-40-07, INT-03)', () => {
    // Hasta Phase 43 este gate exigia que NINGUN id llevara sufijo de 3 cifras,
    // porque el espacio -300+ estaba RESERVADO para los cruces multi-categoria
    // de Phase 44 / INT-03. Phase 44 los aterriza, asi que el gate se INVIERTE y
    // no se borra: sigue mordiendo con la misma fuerza, ahora en la direccion
    // util. Es rojo si alguien apende un `-302` no declarado, que es el escenario
    // que de verdad hay que impedir ahora que el espacio esta abierto.
    // D-40-07: el espacio -300+ aloja EXACTAMENTE los cruces declarados. El
    // assert va sin mensaje a proposito: el diff de arrays que imprime `assert`
    // ya nombra el id intruso o el que falta, que es toda la diagnosis que hace
    // falta aqui, y el porque vive en el comentario de arriba.
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, CROSS_IDS);
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

  test('todas las explanations (paradigma y cruces) estan en espanol acentuado y no estan vacias (D-41-17)', () => {
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
  test('todos los slots (paradigma y cruces) tienen validation con status y passes array', () => {
    for (const s of SLOTS) {
      assert.ok(s.validation && typeof s.validation === 'object', `${s.id}: falta validation`);
      assert.equal(typeof s.validation.status, 'string', `${s.id}: validation.status debe ser string`);
      assert.ok(Array.isArray(s.validation.passes), `${s.id}: validation.passes debe ser array`);
    }
  });

  test('status coincide con deriveStatus(passes) en TODOS los slots, base y cruces: no se puede forjar un validated', () => {
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

  test('todos los slots, base y cruces, referencian el slug de la categoria en categoryIds (SC-5)', () => {
    for (const s of SLOTS) {
      assert.ok(
        Array.isArray(s.categoryIds) && s.categoryIds.includes('fare-indicativo'),
        `SC-5: ${s.id} no referencia la categoria fare-indicativo`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 13. Cruces multi-categoria -300+ (INT-03, D-44-01..D-44-04) — G1 y G2
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indicativo — invariantes de los cruces multi-categoria -300+ (INT-03, D-44-04)', () => {
  // POR QUE ESTE BLOQUE EXISTE: los cruces salen de `allVariants()` porque los
  // gates de PARADIGMA no les aplican (no son casillas persona x tiempo, no
  // llevan 6 variantes y su hueco no es una forma de `fare`). Pero salir de la
  // base NO es salir de cobertura: aqui se RE-ASERTAN uno a uno los gates que
  // siguen rigiendo sobre ellos — hueco, 4 opciones sin duplicados,
  // `correctIndex` variable, SCOPE-GATE de perifrasis, objeto del conjunto
  // cerrado, blacklist de atestiguadas, participio no concordado — y se añaden
  // los predicados propios G1 y G2. Si un cruce nuevo se apende sin pasar por
  // aqui, el gate invertido del sufijo de 3 cifras del bloque 1 se pone rojo.

  test('los cruces en disco son EXACTAMENTE los declarados en CROSS_IDS', () => {
    assert.deepEqual(CROSS_SLOTS.map((s) => s.id), CROSS_IDS, 'D-44-05: la lista de cruces esta CERRADA');
    for (const id of CROSS_IDS) {
      assert.ok(byId(id), `INT-03: el cruce declarado ${id} no esta en disco`);
    }
  });

  test('cada cruce tiene EXACTAMENTE 3 variantes y el eje es la persona: 3 personas distintas (D-44-03)', () => {
    for (const s of CROSS_SLOTS) {
      assert.equal(s.variants.length, 3, `D-44-03: ${s.id} debe tener 3 variantes, el volumen medio de los cruces del proyecto`);
      const personas = s.variants.map((v) => (v.prompt.match(PRONOUN_RE) || [''])[0].toLowerCase());
      assert.ok(personas.every((p) => p.length > 0), `D-44-04: ${s.id} tiene una variante sin sujeto pronominal explicito`);
      assert.equal(new Set(personas).size, 3, `D-44-03: ${s.id} repite persona entre sus variantes: ${personas.join(', ')}`);
    }
  });

  test('categoryIds de longitud EXACTAMENTE 2 con la pareja congelada de cada cruce (D-44-01)', () => {
    // La cascada D-54 resetea TODAS las categorias que nombra `categoryIds`, asi
    // que la pareja no es metadato: es el radio de daño del ejercicio. Va
    // congelada por id y con el slug de la vecina byte a byte — `modali` y nunca
    // `verbi-modali`, que no existe y haria rechazar el fichero entero.
    for (const s of CROSS_SLOTS) {
      assert.deepEqual(s.categoryIds, CROSS_PAIRS[s.id], `D-44-01: la pareja de categoryIds de ${s.id}`);
      assert.equal(s.categoryIds.length, 2, `D-44-01: ${s.id} debe cruzar EXACTAMENTE 2 categorias`);
      const registradas = CATEGORIES.categories.map((c) => c.id);
      for (const cid of s.categoryIds) {
        assert.ok(registradas.includes(cid), `D-44-01: ${s.id} referencia la categoria ${cid}, que NO esta registrada en content/categories.json`);
      }
    }
  });

  test('los prompts de los cruces llevan el hueco literal ___', () => {
    for (const { slot, v, k } of crossVariants()) {
      assert.ok(v.prompt.includes('___'), `${slot.id}#${k}: falta el hueco ___`);
    }
  });

  test('4 opciones sin duplicados, correctIndex en rango y NO constante dentro del cruce (D-41-13)', () => {
    for (const { slot, v, k } of crossVariants()) {
      assert.equal(v.options.length, 4, `${slot.id}#${k}: 4 opciones`);
      assert.equal(new Set(v.options).size, 4, `${slot.id}#${k}: opciones sin duplicados`);
      assert.ok(Number.isInteger(v.correctIndex) && v.correctIndex >= 0 && v.correctIndex < 4, `${slot.id}#${k}: correctIndex fuera de [0,4)`);
    }
    for (const s of CROSS_SLOTS) {
      assert.ok(
        new Set(s.variants.map((v) => v.correctIndex)).size > 1,
        `D-44-03: ${s.id} tiene el correctIndex constante — el autor aprenderia la posicion y no la forma`
      );
    }
  });

  test('SCOPE-GATE de perifrasis por campo: los cruces no tienen excepcion (D-41-06)', () => {
    for (const { slot, v, k } of crossVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('cada prompt de cruce lleva un objeto del conjunto CERRADO de 7 (D-41-06)', () => {
    for (const { slot, v, k } of crossVariants()) {
      assert.ok(
        OBJECTS.some((o) => v.prompt.includes(o)),
        `D-41-06: ${slot.id}#${k} no usa ningun objeto del conjunto cerrado: "${v.prompt}"`
      );
    }
  });

  test('ninguna opcion de cruce es una forma atestiguada de la blacklist ni de otro modo (D-41-08)', () => {
    for (const { slot, v, k } of crossVariants()) {
      for (const o of v.options) {
        const sucio = o.split(' ').filter((p) => ATESTIGUADAS.has(p) || OTHER_MOODS.includes(p) || BLACKLIST.includes(p));
        assert.deepEqual(sucio, [], `D-41-08: ${slot.id}#${k} ofrece la opcion "${o}", que contiene la forma atestiguada ${sucio.join(', ')}`);
      }
    }
  });

  test('ninguna opcion de cruce lleva el participio concordado (MAGNET de Phase 43)', () => {
    for (const { slot, v, k } of crossVariants()) {
      const sucio = v.options.filter((o) => /\bfatt[aie]\b/.test(o));
      assert.deepEqual(sucio, [], `D-43-16: ${slot.id}#${k} ofrece el participio concordado: ${sucio.join(', ')}`);
    }
  });

  test('G1/G2 — ninguna opcion de ningun cruce contiene una forma de fare: la key vive en la vecina (D-44-02)', () => {
    for (const { slot, v, k } of crossVariants()) {
      const sucio = v.options.filter((o) => o.split(/\s+/).some((w) => FARE_INITIAL_RE.test(w)));
      assert.deepEqual(sucio, [], `D-44-02: ${slot.id}#${k} mete una forma de fare en options: ${sucio.join(' | ')} — el hueco es de la categoria VECINA`);
    }
  });

  test('G1 — fare-indicativo-300: el participio fatto va ESCRITO en los 3 prompts (D-44-04)', () => {
    for (const v of byId('fare-indicativo-300').variants) {
      assert.match(v.prompt, /(^|\W)fatto(\W|$)/, `G1: el prompt no trae escrito el participio fatto: "${v.prompt}"`);
    }
  });

  test('G1 — fare-indicativo-300: ningun prompt lleva un pronombre objeto antepuesto (D-44-04)', () => {
    // Con `lo`/`la`/`li`/`le` delante del auxiliar el participio concordaria
    // obligatoriamente (`li ho fatti`) y la frase abriria una segunda lectura
    // defendible: el hueco dejaria de examinar SOLO el auxiliar.
    for (const v of byId('fare-indicativo-300').variants) {
      assert.ok(
        !OBJECT_PRONOUN_RE.test(v.prompt),
        `G1: el prompt lleva un pronombre objeto antepuesto y el participio fatto tendria que concordar: "${v.prompt}"`
      );
    }
  });

  test('G1 — fare-indicativo-300: las 4 opciones son auxiliares (avere + essere como distractora), nunca compuestos (D-44-04)', () => {
    // El hueco es SOLO el auxiliar: una opcion con participio dentro convertiria
    // el ejercicio en otro. Y la distractora de auxiliar es una forma de essere,
    // que es lo que hace que el ejercicio examine la eleccion de auxiliar.
    const AVERE = new Set(Object.values(AVERE_BY_TENSE).flat());
    const ESSERE = new Set(ESSERE_FORMS);
    for (const [k, v] of byId('fare-indicativo-300').variants.entries()) {
      for (const o of v.options) {
        assert.equal(o.split(/\s+/).length, 1, `G1: la opcion "${o}" de #${k} no es una sola palabra: el hueco es solo el auxiliar`);
        assert.ok(AVERE.has(o) || ESSERE.has(o), `G1: la opcion "${o}" de #${k} no es una forma conjugada de avere ni de essere`);
      }
      assert.ok(AVERE.has(v.options[v.correctIndex]), `G1: la key de #${k} no es una forma de avere`);
      assert.ok(
        v.options.some((o) => ESSERE.has(o)),
        `G1: #${k} no ofrece ninguna forma de essere como distractora de auxiliar`
      );
    }
  });
});
