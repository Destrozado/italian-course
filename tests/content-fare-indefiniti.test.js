// tests/content-fare-indefiniti.test.js
//
// v2.0 Phase 43 (INDEF-01..INDEF-04) — invariantes PERMANENTES de la categoria
// `fare-indefiniti`: los 6 slots del paradigma NO PERSONAL de `fare` (infinito
// presente, infinito passato, participio passato, participio presente, gerundio
// presente y gerundio passato) con 3, 3, 4, 2, 3 y 3 variantes = 18. Se ejecuta:
//
//     node --test tests/content-fare-indefiniti.test.js
//
// y entra tambien en el glob de la suite completa:
//
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// ADVERTENCIA DE ESCANEO (heredada de 41-01, 42-01 y 43-01, no negociable):
// todos los escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]`, sobre el JSON parseado — y NUNCA
// sobre el fichero completo, ni sobre `notes`, ni sobre `explanation`. El `notes`
// de la categoria NOMBRA a proposito la grafia no elidida del infinito compuesto,
// los cinco pronombres prohibidos y las perifrasis excluidas, con su audit trail,
// y las explanations TIENEN que nombrar la no elidida (D-43-17) y el registro
// burocratico del participio presente (INDEF-03); un grep de fichero entero se
// auto-invalidaria y un escaneo que incluyera `explanation` pondria rojo justo el
// texto que el requisito pide. En `options` la coincidencia es EXACTA; en
// `prompt` va por palabra Unicode. Ojo particular de esta categoria: `ne` y `ci`
// son subcadenas de decenas de palabras italianas, asi que su escaneo va por
// palabra suelta y ACOTADO al slot del participio passato.
//
// COROLARIO DE LA ADVERTENCIA (CR-02, code review de la fase): la frontera de
// palabra no es solo para los escaneos de AUSENCIA. Vale igual para los de
// PRESENCIA y para los de ADYACENCIA, y por el mismo motivo: en italiano los
// cues de este fichero son subcadenas de palabras corrientes (`Michele` acaba en
// `le`, `Martha` en `ha`, `questa` y `basta` en `sta`, `Purché` empieza por
// `Pur`, `partenza` por `parte`). Un gate de presencia matcheado por subcadena
// no se pone rojo: deja de morder, que es peor, porque aprueba en silencio la
// variante futura que existia para cazar. Por eso en este fichero NINGUN cue se
// compara con `includes`, `endsWith` ni `startsWith` a pelo — la presencia va por
// `wordish` y la adyacencia por `terminaEnPalabra` / `empiezaPorPalabra`. La
// unica excepcion legitima es `Array.prototype.includes` sobre un array de
// strings, que es pertenencia a un conjunto y no escaneo de texto.
//
// LAS CINCO DESVIACIONES DELIBERADAS respecto del analogo
// `tests/content-fare-congiuntivo.test.js` y del hermano
// `tests/content-fare-cond-imperativo.test.js`, declaradas aqui para que quien
// compare los tres ficheros no las lea como descuidos:
//
//   1. D-43-03 — el conteo de variantes por slot es DESIGUAL: 3, 3, 4, 2, 3 y 3.
//      El `equal(variants.length, N)` uniforme del analogo NO se clona; se
//      sustituye por la tabla EXPECTED_VARIANTS. El 2 del participio presente NO
//      es un recorte: la forma es fosilizada y sus contextos reales estan
//      contados, y forzar un tercero seria inventarlo, que es literalmente lo que
//      INDEF-03 prohibe. El minimo del motor son 2 variantes por slot.
//   2. INDEF-01..INDEF-04 — las keys se REPITEN por diseno. El
//      `new Set(keys).size === n` del molde de Phase 41 NO se clona: en estos
//      slots las formas son FIJAS, asi que cinco de los seis repiten su key en
//      todas sus variantes. El sustituto de la unicidad es el gate de TIPO DE
//      CONTEXTO distinto por variante (bloque 3), no un pronombre.
//   3. D-41-07 — NO hay gate de pronombre sujeto explicito, y la ausencia es
//      deliberada. El eje de variante de esta categoria es el CONTEXTO y no la
//      persona (nota de cabecera del bloque INDEF de REQUIREMENTS.md), asi que el
//      pronombre no desambigua nada aqui. Declarado para que un re-pase futuro no
//      lo eche en falta como omision.
//   4. D-43-18 — EXCEPCION ENUMERADA POR ID DE SLOT al gate del objeto literal.
//      El gate del analogo es global sobre todas las variantes; aqui las 2 de
//      `fare-indefiniti-participio-presente` quedan exentas y a cambio DEBEN
//      llevar el sustantivo de su compuesto declarado inmediatamente despues del
//      hueco. La exencion va por id, nunca como relajacion global, y el gate de
//      PERIPHRASIS sigue mordiendo en las 18.
//   5. D-43-16 — EXCEPCION ENUMERADA al gate de tipos de contexto distintos.
//      `fare-indefiniti-participio-passato` repite dos veces cada uno de sus dos
//      tipos porque su eje es la TERMINACION y no el encaje; es la unica
//      excepcion, va por id, y se comprueba como patron 2 + 2.
//
// PRECISION DE PLAN-TIME sobre el conjunto de objetos (Correcciones 4 del plan
// 43-02): el conjunto cerrado heredado de D-41-06 tiene siete miembros y NINGUN
// femenino plural, pero la variante de concordancia femenina plural necesita un
// antecedente femenino plural. Se amplia con las INFLEXIONES EN PLURAL de dos de
// sus propios miembros (`le foto` y `le torte`): no se anade ningun objeto lexico
// nuevo, es el mismo conjunto flexionado donde la sintaxis lo exige.
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
  readFileSync(new URL('../content/exercises/fare-indefiniti.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLUG = 'fare-indefiniti';
const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];
const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));

// PARTICION BASE / CRUCE (v2.0 Phase 44, INT-03 — leer antes de tocar un gate).
// Desde Phase 44 el array `exercises` contiene DOS clases de slot: los 6 del
// PARADIGMA NO PERSONAL (18 variantes) y el cruce multi-categoria `-300`
// (`categoryIds` de 2, key en `modali` y el infinitivo `fare` escrito en el
// enunciado como contexto, D-44-02). El cruce viola POR DISENO los gates de esta
// categoria que son especificos del paradigma no personal —el POOL CERRADO de
// las 10 formas, el conteo desigual, `categoryIds` de longitud 1—, porque su key
// es un MODAL CONJUGADO y no una forma no personal de `fare`. Por eso los gates
// de paradigma iteran `BASE_SLOTS` a traves de `allVariants()`, y el cruce tiene
// su propio bloque al final del fichero que RE-ASERTA lo que sigue rigiendo
// sobre el mas los predicados de G3. Re-apuntar un gate a la particion que de
// verdad gobierna es legitimo; bajarle la barra no lo es.
//
// El id va SIEMPRE con el slug COMPLETO: `fare-ind` es prefijo ambiguo entre
// `fare-indefiniti` y `fare-indicativo` (D-40-03).
const CROSS_IDS = ['fare-indefiniti-300'];

// La pareja de `categoryIds` del cruce, congelada por id. El segundo slug es
// `modali` byte a byte y NUNCA la version con prefijo, que no esta registrada en
// `content/categories.json` y haria rechazar el fichero ENTERO por
// `src/data/schema-validator.js`.
const CROSS_PAIRS = {
  'fare-indefiniti-300': ['fare-indefiniti', 'modali'],
};

const BASE_SLOTS = SLOTS.filter((s) => !CROSS_IDS.includes(s.id));
const CROSS_SLOTS = SLOTS.filter((s) => CROSS_IDS.includes(s.id));

// `allVariants()` itera la BASE y no `SLOTS`: es UNA edicion que acota de golpe
// los 13 call-sites de los gates de paradigma a las 18 variantes que de verdad
// gobiernan. El cruce se recorre con `crossVariants()`, su gemelo.
const allVariants = () => BASE_SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));
const crossVariants = () => CROSS_SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));

// Matcher con frontera de PALABRA UNICODE. `\b` de JS es ASCII-only y aqui hay
// prompts con `è` y con `già`. Lleva `iu` y no solo `u` por WR-10: sin la `i`, la
// posicion donde una forma prohibida aparece de verdad —INICIO DE ORACION— era
// justo la que no se veia.
const wordish = (s) =>
  new RegExp(`(^|[^\\p{L}])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu');

// ADYACENCIA CON FRONTERA DE PALABRA (CR-02, code review de la fase).
//
// `endsWith` / `startsWith` / `includes` crudos casan el cue como SUFIJO o
// PREFIJO de otra palabra, y en italiano eso NO es una posibilidad teorica:
// `Questa` y `basta` terminan en `sta`, `Michele` termina en `le`, `Martha`
// termina en `ha`, `partenza` empieza por `parte` y `Purché` empieza por `Pur`.
// Con el matcher crudo, un prompt futuro del tipo `Michele ha ___ i compiti`
// contaria como «lleva clitico antepuesto» SIN llevarlo, y el gate de D-43-16
// aprobaria una concordancia injustificada. El gate seguiria verde: solo dejaria
// de morder. Es el modo de fallo que las pruebas por mutacion existen para
// descartar, y ademas contradice la disciplina de frontera de palabra que la
// cabecera de este fichero declara en mayusculas.
//
// Por eso NINGUN cue de este fichero se compara con `includes`, `endsWith` ni
// `startsWith` a pelo: la presencia va por `wordish` y la adyacencia por estos
// dos helpers, que exigen ademas que el caracter contiguo por el lado interior
// no sea letra.
const esLetra = (c) => c !== '' && /\p{L}/u.test(c);
const terminaEnPalabra = (texto, cue) =>
  texto.endsWith(cue) && !esLetra(texto.slice(0, texto.length - cue.length).slice(-1));
const empiezaPorPalabra = (texto, cue) =>
  texto.startsWith(cue) && !esLetra(texto.slice(cue.length, cue.length + 1));

const APOSTROFE = String.fromCharCode(39);

// WR-07 / WR-08, clonados del analogo — LA CLAUSULA QUE GOBIERNA EL HUECO. Corte
// tosco por puntuacion, no analisis sintactico, y falla cerrado. Es la unidad
// para contar OBJETOS: el objeto de la otra clausula es legitimo tras la coma,
// pero dos objetos coordinados en la MISMA clausula le darian dos complementos al
// mismo verbo y enturbiarian lo que se examina.
const CORTE_FUERTE = /[,;.:—–]+/u;
const segmentoDelHueco = (p) => p.split(CORTE_FUERTE).find((s) => s.includes('___')) || '';
const antesDelHueco = (p) => p.split('___')[0].trimEnd();
const despuesDelHueco = (p) => p.split('___')[1].trimStart();

// ───────────────────────────────────────────────────────────────────────────
// Constantes de datos: la especificacion EJECUTABLE de la categoria.
// ───────────────────────────────────────────────────────────────────────────

const INF_PRES = 'fare-indefiniti-infinito-presente';
const INF_PASS = 'fare-indefiniti-infinito-passato';
const PART_PASS = 'fare-indefiniti-participio-passato';
const PART_PRES = 'fare-indefiniti-participio-presente';
const GER_PRES = 'fare-indefiniti-gerundio-presente';
const GER_PASS = 'fare-indefiniti-gerundio-passato';

// DESVIACION 2 — las keys se REPITEN a proposito: la forma es fija y el eje es el
// contexto. La unica excepcion es el participio passato, cuyo eje SI es la forma.
const CANON = {
  [INF_PRES]: ['fare', 'fare', 'fare'],
  [INF_PASS]: ['aver fatto', 'aver fatto', 'aver fatto'],
  [PART_PASS]: ['fatto', 'fatto', 'fatti', 'fatte'],
  [PART_PRES]: ['facente', 'facenti'],
  [GER_PRES]: ['facendo', 'facendo', 'facendo'],
  [GER_PASS]: ['avendo fatto', 'avendo fatto', 'avendo fatto'],
};
const IDS = Object.keys(CANON);

// DESVIACION 1 — el conteo es DESIGUAL y cada desviacion del reparto uniforme
// esta justificada en el `notes` por su nombre (D-43-03).
const EXPECTED_VARIANTS = {
  [INF_PRES]: 3,
  [INF_PASS]: 3,
  [PART_PASS]: 4,
  [PART_PRES]: 2,
  [GER_PRES]: 3,
  [GER_PASS]: 3,
};
const TOTAL_VARIANTES = 18;

// POOL — el universo CERRADO de todas las options de la categoria (D-43-13). Son
// las 10 formas del paradigma NO PERSONAL y nada mas. Es el gate mas barato de la
// fase y el que impide que casillas de las otras tres categorias de `fare` entren
// en el examen de esta.
const POOL = [
  'fare', 'aver fatto',
  'fatto', 'fatta', 'fatti', 'fatte',
  'facendo', 'avendo fatto',
  'facente', 'facenti',
];

// LAS CUATRO TERMINACIONES — el pool fijo del slot de participio passato, el
// mismo conjunto en sus 4 variantes con el orden variado (D-43-16).
const TERMINAZIONI = ['fatta', 'fatte', 'fatti', 'fatto'];

// CONJUGATE — la union de las formas conjugadas de `fare` que viven en las OTRAS
// TRES categorias, leida de sus JSON reales y no declarada a mano, para que siga
// al contenido. Se usa como gate de AUSENCIA: ninguna de ellas puede entrar en
// las options de esta categoria. Verificado en plan-time que la interseccion con
// POOL es vacia, asi que no hace falta restarlo (si algun dia dejara de serlo,
// este gate se pondria rojo y habria que revisar la frontera, no relajarlo).
//
// v2.0 Phase 44 (INT-03): se leen SOLO los slots de PARADIGMA de esas tres
// categorias, excluyendo sus cruces multi-categoria `-300`+. Motivo: en un cruce
// la key vive en la categoria VECINA y la forma de `fare` va ESCRITA en el
// enunciado (D-44-02), asi que sus `options` NO son formas de `fare` sino
// auxiliares de `avere`/`essere`, personas de un verbo regular o modales
// conjugados — G1/G2/G3 lo prohiben explicitamente por el otro lado. Meterlas
// aqui no reforzaba el gate: lo CONTAMINABA con palabras ajenas a `fare`, y con
// ellas dentro el gate empezaba a prohibir en esta categoria un `sono` que ya
// vivia legitimamente en el prompt de `fare-indefiniti-infinito-passato` desde
// Phase 43. La exclusion no le baja la barra: CONJUGATE sigue conteniendo TODAS
// las formas conjugadas de `fare` de las tres categorias, que es lo unico que
// este gate dice gobernar. El sub-gate `CRUCES_AJENOS` de mas abajo demuestra
// mecanicamente que lo excluido no contenia ninguna forma de `fare`.
const esCruce = (id) => /-\d{3}$/.test(id);
const OTRAS_TRES = ['fare-indicativo', 'fare-congiuntivo', 'fare-cond-imperativo'].map((f) => ({
  slug: f,
  data: JSON.parse(readFileSync(new URL(`../content/exercises/${f}.json`, import.meta.url), 'utf-8')),
}));
const CONJUGATE = (() => {
  const set = new Set();
  for (const { data } of OTRAS_TRES) {
    for (const s of data.exercises) {
      if (esCruce(s.id)) continue;
      for (const v of s.variants) for (const o of v.options) set.add(o);
    }
  }
  return set;
})();

// Las options de los cruces de las otras tres categorias, es decir EXACTAMENTE lo
// que CONJUGATE deja fuera. Existe para que la exclusion sea auditable y no un
// acto de fe: el gate de mas abajo exige que ninguna de ellas sea una forma de
// `fare`, que es la razon por la que quedan fuera.
const CRUCES_AJENOS = OTRAS_TRES.flatMap(({ slug, data }) =>
  data.exercises
    .filter((s) => esCruce(s.id))
    .flatMap((s) => s.variants.flatMap((v, k) => v.options.map((o) => ({ slug, id: s.id, k, o }))))
);

// El predicado «esto parece una forma de `fare`» aplicado a los cruces AJENOS
// (G-44-3-WR02, code review de Phase 44).
//
// La version anterior prohibia la inicial f- A CIEGAS, apoyandose en la premisa
// «en los pools de los cruces (auxiliares, personas de un verbo regular,
// modales) no hay ninguna palabra legitima con esa inicial». Es FALSA, y la
// contraprueba vive en el fichero HERMANO: la whitelist de auxiliares de
// `tests/content-fare-indicativo.test.js` incluye el passato remoto de `essere`
// —`fui, fosti, fu, fummo, foste, furono`— y su gate G1 autoriza
// EXPLICITAMENTE cualquier miembro de esa whitelist como distractora de auxiliar
// de `fare-indicativo-300`, que es uno de los cruces que este gate recorre. Con
// la prohibicion ciega, el dia que la autoria use una de esas seis formas este
// fichero se pondria rojo con el mensaje igualmente FALSO «la exclusion de
// CONJUGATE dejaria de ser inocua», que no es lo que estaria pasando.
//
// La lista se escribe aqui porque importar el fichero hermano haria correr sus
// `describe` una segunda vez bajo
// `node --test tests/*.test.js tests/fixtures/*.test.js` y falsearia el
// conteo de la suite. Para que no derive en SILENCIO —que seria la misma clase de
// duplicado que produjo el falso rojo— el bloque de gates de mas abajo lleva un
// source-assert que lee el TEXTO del hermano, extrae su whitelist y exige
// igualdad de conjunto con esta.
const FORMAS_CON_F_AUTORIZADAS = new Set(['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono']);
const pareceFare = (w) => /^f/i.test(w) && !FORMAS_CON_F_AUTORIZADAS.has(w.toLowerCase());

// Las formas con inicial f- de la whitelist de auxiliares del fichero HERMANO,
// extraidas de su TEXTO. Es el ancla que impide que la lista de arriba derive.
// Devuelve `null` si la extraccion no encuentra el literal: un `[]` silencioso
// haria que el source-assert comparara dos conjuntos vacios y pasara en verde
// habiendo perdido su fuente de verdad (la especie de CR-01).
const formasConFDelHermano = () => {
  const src = readFileSync(new URL('./content-fare-indicativo.test.js', import.meta.url), 'utf-8');
  const m = src.match(/const ESSERE_FORMS = \[([\s\S]*?)\];/);
  if (!m) return null;
  const formas = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
  if (formas.length === 0) return null;
  const conF = formas.filter((f) => /^f/i.test(f)).map((f) => f.toLowerCase());
  return conF.length === 0 ? null : conF;
};

// BLACKLIST (D-43-17, D-43-07, heredada de D-41-08 y D-42-11). La primera es la
// grafia NO ELIDIDA del infinito compuesto, que es el CUARTO MAGNET: es correcta
// y atestiguada, asi que ofrecerla como distractora incorrecta daria por erroneo
// un italiano bueno. Las cuatro siguientes son las formas con clitico; el resto,
// las arcaicas heredadas.
const BLACKLIST = [
  'avere fatto',
  'fallo', 'fammi', 'fatelo', 'facci',
  'facciam', 'facce',
  'fo', 'fé', 'fenno', 'facea', 'fan', 'face', 'faci',
  'fei', 'festi', 'femmo', 'feste', 'fero', 'feciono',
  'fici', 'facisti', 'facette', 'facettero', 'facero',
];

// CONTEXT_TYPES — la lista CERRADA de tipos de encaje sintactico (D-43-12). El
// eje de variante de esta categoria es el contexto, asi que este conjunto es el
// analogo funcional del paradigma de personas de las otras tres categorias.
const CONTEXT_TYPES = [
  'tras-preposicion',
  'tras-regente-de-infinitivo',
  'sujeto-o-nominal',
  'imperativo-negativo-2sg',
  'implicita-causal',
  'implicita-temporal',
  // 3a ronda: los dos tipos REALES del gerundio passato. El absoluto desnudo no
  // se subdivide en temporal y causal, porque formalmente es el mismo encaje.
  'absoluta-con-adverbial-de-anterioridad',
  'concesiva-con-pur',
  'implicita-modal',
  'implicita-concesiva',
  'marco-progresivo',
  'compuesto-lexicalizado-singular',
  'compuesto-lexicalizado-plural',
  'objeto-pospuesto-auxiliar-posesion',
  'pronombre-antepuesto-concordancia',
];

// PRONOMBRES_PROHIBIDOS — los cuatro de 1a y 2a persona (concordancia OPCIONAL en
// italiano estandar) y el partitivo (reglas propias). Cualquiera de ellos en un
// prompt del participio passato abriria DOS respuestas defendibles y, por la
// cascada D-54, costaria el reset de las 18 variantes (D-43-16).
const PRONOMBRES_PROHIBIDOS = ['mi', 'ti', 'ci', 'vi', 'ne'];

// CONCORD_CUES — los bigramas ADMITIDOS: pronombre de 3a PLURAL antepuesto mas
// una forma del auxiliar de posesion. Solo el plural, porque con el singular el
// auxiliar se elide y la vocal elidida no dice el genero (Correcciones 5).
//
// SE COMPARAN SIEMPRE CON `wordish`, NUNCA CON `includes` (CR-02). El bigrama
// empieza por un clitico de DOS LETRAS, asi que como subcadena lo satisface
// cualquier palabra acabada en `-li` / `-le` seguida del auxiliar:
// `Michele ha fatto` contiene literalmente `le ha`. Quien lea `'le ha'` aqui y
// piense en compararlo como string tiene que saber que eso convierte el gate en
// decorativo: aceptaria como «con clitico antepuesto» una variante que solo
// tiene un nombre propio delante del auxiliar.
const CONCORD_CUES = [
  'li ha', 'le ha', 'li ho', 'le ho', 'li hai', 'le hai',
  'li abbiamo', 'le abbiamo', 'li avete', 'le avete', 'li hanno', 'le hanno',
];
// CONCORD_PROHIBIDOS — los bigramas de 3a SINGULAR antepuesto, elididos o no.
// Mismo tratamiento que CONCORD_CUES y por el mismo motivo (CR-02), aunque aqui
// el dano del matcher crudo es el contrario: como es un gate de PROHIBICION, la
// subcadena lo vuelve SOBRE-estricto y pondria roja una variante legitima cuyo
// sujeto fuera `Michela` o `Paolo` (`Michela ha` contiene `la ha`).
const CONCORD_PROHIBIDOS = [
  'lo ha', 'la ha', 'lo ho', 'la ho',
  `l${APOSTROFE}ho`, `l${APOSTROFE}ha`, `l${APOSTROFE}hai`,
  `l${APOSTROFE}abbiamo`, `l${APOSTROFE}avete`, `l${APOSTROFE}hanno`,
];

// CONCORDANCIA_POSPUESTA_ATESTIGUADA (WR-01, adjudicado por el autor en el UAT).
// En las 2 variantes de objeto POSPUESTO, una de las tres distractoras es la
// forma concordada con ese objeto, y esa concordancia esta ATESTIGUADA en
// italiano literario y antiguo (`ho fatti i compiti`, `ha fatta una torta`). El
// mapa dice, por objeto, cual es esa forma: las otras dos distractoras de cada
// variante no concuerdan con nada y no son defendibles en ningun registro.
//
// La resolucion es DOCUMENTAL y no la blacklist, por dos razones que el gate de
// mas abajo congela para que un re-pase futuro no las «arregle»:
//   1. ESTRUCTURAL — D-43-16 fija el pool de las 4 variantes en las cuatro
//      terminaciones como EJE UNICO. Blacklistear la concordada en las 2
//      invariables deja el slot SIN distractoras y lo destruye.
//   2. DE REGISTRO — no es el caso del cuarto magnet. Alli las dos grafias del
//      infinito compuesto compiten en el MISMO registro contemporaneo, asi que la
//      no elegida se veta. Aqui la concordancia pospuesta es de otro registro
//      HISTORICO y en la norma moderna la invariable es la unica corriente, asi
//      que aplica D-43-19 (RECONOCER, NO PRODUCIR): se nombra, se explica y se
//      puede seguir ofreciendo, porque hoy es la respuesta incorrecta sin
//      discusion.
// CONCORDANCIA_DEL_OBJETO — para cada objeto del conjunto cerrado, la forma del
// participio que concordaria con el. Se declara COMPLETO (los 9) porque lo usan
// dos gates de signo CONTRARIO: el de WR-01, que exige que la concordada este
// entre las options del participio passato, y el del gerundio passato, que exige
// que NO este.
const CONCORDANCIA_DEL_OBJETO = {
  'i compiti': 'fatti', // m. pl.
  'un errore': 'fatto', // m. sg.
  'il lavoro': 'fatto', // m. sg.
  'una torta': 'fatta', // f. sg.
  'il letto': 'fatto', // m. sg.
  tutto: 'fatto', // m. sg.
  'una foto': 'fatta', // f. sg.
  'le foto': 'fatte', // f. pl.
  'le torte': 'fatte', // f. pl.
};
const CONCORDANCIA_POSPUESTA_ATESTIGUADA = {
  'i compiti': CONCORDANCIA_DEL_OBJETO['i compiti'],
  'una torta': CONCORDANCIA_DEL_OBJETO['una torta'],
};

// Ruta del prompt de validacion por quorum. Se lee desde aqui porque el subagent
// NO ve el `notes` del fichero de contenido: una excepcion que viva solo en el
// `notes` produce un disputed FALSO y, por la cascada D-54, el reset de las 18
// variantes. Es la ruta REAL tras el archivado del milestone v1.1.
const VALIDATION_PROMPT = (() => {
  const url = new URL(
    '../.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md',
    import.meta.url
  );
  try {
    return readFileSync(url, 'utf-8');
  } catch (e) {
    throw new Error(
      `No se puede leer el prompt de validacion por quorum (${url.pathname}): es la UNICA fuente de reglas que ve el subagent, asi que su ausencia no puede pasar en silencio. Causa: ${e.message}`
    );
  }
})();

// DEITTICI_PASSATO — conjunto CERRADO de adverbiales de pasado admitidos en el
// infinito passato. Con la preposicion de posterioridad que gobierna el hueco son
// las dos UNICAS maneras de forzar la anterioridad; sin una de las dos, el
// infinito simple seria igualmente defendible (INDEF-01).
const DEITTICI_PASSATO = [
  'ieri', 'la settimana scorsa', `l${APOSTROFE}anno scorso`, 'stamattina', 'il mese scorso',
];
const PREP_POSTERIORIDAD = 'Dopo';

// MARCADORES_GERUNDIO_PASSATO — conjunto CERRADO del slot de gerundio passato:
// tres adverbiales de anterioridad mas la particula concesiva.
const ADVERBIALI_ANTERIORITA = ['la sera prima', 'il giorno prima', 'poco prima'];
const PARTICELLA_CONCESSIVA = 'Pur';
const MARCADORES_GERUNDIO_PASSATO = [...ADVERBIALI_ANTERIORITA, PARTICELLA_CONCESSIVA];

// STARE — las formas del verbo de estado admitidas como cabeza del marco
// progresivo (D-43-15). Se comprueban con `terminaEnPalabra` y nunca con
// `endsWith` a pelo (CR-02): `sta` es sufijo de palabras italianas corrientisimas
// —`questa`, `basta`, `vista`— asi que con el matcher crudo un prompt como
// `Questa ___ i compiti` pasaria por marco progresivo sin llevar el auxiliar.
const STARE = ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'];

// COMPUESTOS_FACENTE — los DOS sustantivos de los dos compuestos fosilizados que
// D-43-18 admite, y ninguno mas. Su presencia es OBLIGATORIA en las 2 variantes
// del participio presente y PROHIBIDA en las otras 16: la excepcion esta
// enumerada por id de slot, no es una relajacion global.
const COMPUESTOS_FACENTE = ['funzione', 'parte'];

// SCOPE-GATE lexico HARD heredado de D-41-06 por D-43-22.
const PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel', 'far fare', 'causativo'];
// DESVIACION 4 / Correcciones 4: los 7 heredados mas las 2 inflexiones en plural.
const OBJECTS = [
  'i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto',
  'le foto', 'le torte',
];

// D-43-20 — la ronda EXTRA de deepseek cubre los DOS slots de doble validez de
// esta categoria: el participio passato completo (4 variantes, el par
// invariable-frente-a-concordado que SC-4 exige literalmente) y el infinito
// passato completo (3 variantes, por el CUARTO MAGNET). Son 7 de las 18.
const EXTRA_ROUND_SLOTS = [PART_PASS, INF_PASS];

// Indices DECLARADOS de las dos variantes que rompen la simetria de options de su
// slot. Se declaran por indice y no se descubren por conteo ciego, para que el
// gate compare intencion contra contenido y no contenido contra si mismo.
const GER_PRES_CON_COMPUESTO = 0; // la del marco progresivo

// PREMISA CORREGIDA DEL GERUNDIO PASSATO (hallazgo de Sonnet en el quorum base,
// criterio de opcion unica, adjudicado en el UAT).
//
// La primera version de este fichero declaraba `GER_PASS_CON_SIMPLE = 0`: el
// gerundio simple entraba en las options de la variante temporal porque el
// adverbial de anterioridad lo haria agramatical. Es FALSO. El italiano ADMITE
// el gerundio simple en las subordinadas implicitas —tambien en la concesiva con
// `pur` y tambien con la accion ya concluida—, y el imperfecto de la principal de
// la causal es ademas el tiempo que empareja canonicamente con el simple para la
// simultaneidad. La constante desaparece a proposito: ya no hay ninguna variante
// de este slot que ofrezca el gerundio simple, y la razon es la INVERSA de la que
// se escribio — no es agramatical, es DEFENDIBLE, y una distractora defendible es
// justo lo que el criterio operativo de la blacklist prohibe.
//
// A cambio, la distractora plausible de las 3 variantes pasa a ser el INFINITO
// compuesto, que es el calco espanol real (a pesar de HABER HECHO, por HABER
// TERMINADO) y que si es agramatical en una subordinada implicita de este tipo.
const CALCO_GERUNDIO_PASSATO = 'aver fatto';

// ABSOLUTOS_DESNUDOS — tripwire contra el defecto mas repetido de esta fase.
//
// Se han corregido TRES explanations que afirmaban que una forma italiana era
// imposible cuando no lo era, y dos de las tres las introdujo el arreglo de la
// anterior: se sustituyo una afirmacion falsa por otra. En este fichero paso dos
// veces (el gerundio simple en las subordinadas implicitas, y despues el infinito
// compuesto «agramatical» cuando lo agramatical es el infinito compuesto SIN
// INTRODUCTOR — `dopo aver fatto` y `per aver fatto` son A2 corriente).
//
// La regla de autoria es: no escribir que algo es imposible sin haberlo
// comprobado forma por forma y contexto por contexto, y si la regla real lleva
// una CONDICION, escribir la condicion en vez de la prohibicion. Sale mas corto
// que la excepcion que evita.
//
// LIMITE HONESTO DE ESTE GATE, y va escrito para que nadie lo tome por lo que no
// es: es un TRIPWIRE, no una demostracion. Caza la predicacion DESNUDA de
// imposibilidad, que es la forma que tomaron los tres defectos, y NO puede cazar
// una condicional falsa. Por eso la lista es corta y solo lleva formulas que
// ninguna frase condicional correcta necesita: `deja de ser posible` NO esta en
// ella, porque en el infinito passato aparece dentro de una condicional
// verificada («con cualquiera de los dos, ...») y banearla seria cargo-culting
// sobre prosa correcta.
//
// Y se aplica SOLO a las explanations, nunca al `notes`, por la misma razon que
// el escaneo de blacklist: el `notes` tiene que NOMBRAR las afirmaciones falsas
// que se corrigieron, con su audit trail, asi que un gate de ausencia sobre el
// `notes` pondria rojo precisamente el texto que documenta la correccion.
const ABSOLUTOS_DESNUDOS = [
  'es agramatical',
  'nunca se usa',
  'no se usa nunca',
  'no existe en italiano',
  'es imposible en italiano',
];

// VARIANT_TABLE — la tabla declarativa por variante. Por variante:
//   tipo   — el tipo de contexto sintactico, del conjunto CERRADO CONTEXT_TYPES
//   object — el objeto literal del conjunto cerrado, o null en las 2 EXENTAS
//   cue    — el literal que materializa el tipo en el prompt
//   pos    — 'antes' / 'despues' / 'libre': donde tiene que estar el cue respecto
//            al hueco. `antes` y `despues` son ADYACENCIA, no presencia: es lo que
//            distingue un encaje real de un literal suelto en otra clausula.
const VARIANT_TABLE = {
  [INF_PRES]: [
    { tipo: 'imperativo-negativo-2sg', object: 'un errore', cue: 'non', pos: 'antes' },
    { tipo: 'tras-preposicion', object: 'i compiti', cue: 'Prima di', pos: 'antes' },
    { tipo: 'tras-regente-de-infinitivo', object: 'il letto', cue: 'devo', pos: 'antes' },
  ],
  [INF_PASS]: [
    { tipo: 'tras-preposicion', object: 'i compiti', cue: 'Dopo', pos: 'antes' },
    { tipo: 'tras-regente-de-infinitivo', object: 'il lavoro', cue: 'contenta di', pos: 'antes' },
    { tipo: 'implicita-causal', object: 'un errore', cue: 'Per', pos: 'antes' },
  ],
  [PART_PASS]: [
    { tipo: 'objeto-pospuesto-auxiliar-posesion', object: 'i compiti', cue: 'ho', pos: 'antes' },
    { tipo: 'objeto-pospuesto-auxiliar-posesion', object: 'una torta', cue: 'ha', pos: 'antes' },
    { tipo: 'pronombre-antepuesto-concordancia', object: 'i compiti', cue: 'li ha', pos: 'antes' },
    { tipo: 'pronombre-antepuesto-concordancia', object: 'le foto', cue: 'le abbiamo', pos: 'antes' },
  ],
  [PART_PRES]: [
    { tipo: 'compuesto-lexicalizado-singular', object: null, cue: 'funzione', pos: 'despues' },
    { tipo: 'compuesto-lexicalizado-plural', object: null, cue: 'parte', pos: 'despues' },
  ],
  [GER_PRES]: [
    { tipo: 'marco-progresivo', object: 'i compiti', cue: 'sto', pos: 'antes' },
    { tipo: 'implicita-modal', object: 'un errore', cue: 'Si impara', pos: 'libre' },
    { tipo: 'implicita-causal', object: 'tutto', cue: 'in fretta', pos: 'libre' },
  ],
  [GER_PASS]: [
    // 3a ronda de quorum (Opus Y Sonnet, de forma independiente): estas dos
    // variantes se declaraban `implicita-temporal` e `implicita-causal`, y esa
    // distincion NO EXISTE en el contenido. Las dos son estructuralmente
    // identicas: gerundio + objeto + adverbial de anterioridad, sin ningun
    // conector. Un gerundio absoluto desnudo no viene formalmente diferenciado en
    // temporal o causal —la lectura es inferencial—, asi que etiquetarlas distinto
    // era inventar un patron. El eje REAL de este slot es la presencia de la
    // particula concesiva, y con esa etiqueta el reparto es 2 + 1.
    { tipo: 'absoluta-con-adverbial-de-anterioridad', object: 'i compiti', cue: 'la sera prima', pos: 'libre' },
    { tipo: 'absoluta-con-adverbial-de-anterioridad', object: 'il lavoro', cue: 'il giorno prima', pos: 'libre' },
    { tipo: 'concesiva-con-pur', object: 'una torta', cue: 'Pur', pos: 'antes' },
  ],
};

const filaDe = (slotId, k) => VARIANT_TABLE[slotId][k];
const esExento = (slotId) => slotId === PART_PRES;

// ───────────────────────────────────────────────────────────────────────────
// 1. Estructura y conteos (D-43-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — estructura y conteos (D-43-03)', () => {
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });

  test('6 slots de PARADIGMA con los ids exactos, en el orden en que viven en disco', () => {
    assert.deepEqual(BASE_SLOTS.map((s) => s.id), IDS, 'D-43-22: los 6 ids del paradigma no personal');
  });

  test('los 6 slots son multiple-choice: 0 match y 0 word-buttons (D-43-22)', () => {
    const otros = SLOTS.filter((s) => s.type !== 'multiple-choice').map((s) => `${s.id}(${s.type})`);
    assert.deepEqual(otros, [], 'D-43-22: MC-only, el 0-match y el 0-wb son decision razonada (DESIGN RULE D-04)');
  });

  test('CONTEO DESIGUAL 3/3/4/2/3/3 y 18 en total, con el 2 y el 4 justificados (D-43-03)', () => {
    // DESVIACION 1. El 2 del participio presente va PRIMERO y con mensaje propio:
    // es la desviacion que un re-pase futuro podria leer como recorte, y lo que
    // tiene que ver en el diff es INDEF-03, no un aviso generico de conteo.
    assert.equal(
      byId(PART_PRES).variants.length,
      2,
      'INDEF-03 / D-43-03: el participio presente lleva EXACTAMENTE 2 variantes porque la forma es fosilizada y sus contextos reales estan contados; forzar un tercero seria inventarlo, que es literalmente lo que el requisito prohibe. El minimo del motor son 2, asi que es legal.'
    );
    assert.equal(
      byId(PART_PASS).variants.length,
      4,
      'INDEF-02 / SC-4 / D-43-03: el participio passato lleva EXACTAMENTE 4 porque tiene que alojar 2 invariables + 2 concordadas; con menos no hay contraste'
    );
    for (const id of IDS) {
      assert.equal(
        byId(id).variants.length,
        EXPECTED_VARIANTS[id],
        `D-43-03: ${id} debe tener ${EXPECTED_VARIANTS[id]} variantes`
      );
    }
    assert.equal(
      BASE_SLOTS.reduce((a, s) => a + s.variants.length, 0),
      TOTAL_VARIANTES,
      'D-43-03: 3 + 3 + 4 + 2 + 3 + 3 = 18 variantes'
    );
  });

  test('categoryIds de longitud 1 con el slug COMPLETO en los 6 slots de PARADIGMA (D-43-22, D-40-03)', () => {
    // El cruce `-300` tiene su espejo en el bloque 14: longitud EXACTAMENTE 2 con
    // la pareja congelada. Un cruce es por definicion de longitud 2, asi que este
    // gate gobierna la base; no se relaja, se re-apunta y gana su contraparte.
    const sucio = BASE_SLOTS
      .filter((s) => !Array.isArray(s.categoryIds) || s.categoryIds.length !== 1 || s.categoryIds[0] !== SLUG)
      .map((s) => `${s.id}(${JSON.stringify(s.categoryIds)})`);
    assert.deepEqual(sucio, [], `D-43-22: categoryIds debe ser exactamente ["${SLUG}"]`);
  });

  test('el key set de cada slot y de cada variante es el del schema (T-43-02)', () => {
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

  test('options de 4 sin duplicados y correctIndex entero en rango y no constante por slot', () => {
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
        `${s.id}: correctIndex constante — el autor aprenderia la posicion y no la forma`
      );
    }
  });

  test('los unicos ids con sufijo numerico de 3 cifras son los cruces declarados (D-41-14, D-40-07, INT-03)', () => {
    // Hasta Phase 43 este gate exigia que NINGUN id llevara sufijo de 3 cifras,
    // porque el espacio -300+ estaba RESERVADO para el cruce multi-categoria de
    // Phase 44 / INT-03. Phase 44 lo aterriza, asi que el gate se INVIERTE y no se
    // borra: sigue mordiendo, ahora en la direccion util. Es rojo si alguien
    // apende un `-301` no declarado, que es el escenario que de verdad hay que
    // impedir ahora que el espacio esta abierto. El diff de arrays que imprime
    // `assert` ya nombra el id intruso, que es toda la diagnosis que hace falta.
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, CROSS_IDS);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Paradigma no personal, 18 keys con repeticion deliberada (INDEF-01..04)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — paradigma no personal, 18 keys con repeticion deliberada (INDEF-01..INDEF-04)', () => {
  for (const id of IDS) {
    test(`${id}: las keys son las de CANON, en orden`, () => {
      assert.deepEqual(byId(id).variants.map(keyOf), CANON[id], `paradigma de ${id}`);
    });
  }

  test('DESVIACION 2: cinco de los seis slots REPITEN su key, y eso es correcto', () => {
    // NO se clona el `new Set(keys).size === n` del molde de Phase 41. En estos
    // slots la forma es FIJA, asi que la unicidad de la respuesta NO puede
    // apoyarse en que las keys sean distintas: se apoya en el encaje sintactico,
    // que es lo que congela el bloque 3. Este assert existe para que la
    // repeticion sea INTENCIONAL y comprobada, no un efecto colateral.
    const conRepeticion = IDS.filter((id) => new Set(CANON[id]).size < CANON[id].length);
    assert.equal(
      conRepeticion.length,
      5,
      `INDEF-01..INDEF-04: cinco de los seis slots repiten alguna key por diseno, y repiten ${conRepeticion.length}: ${conRepeticion.join(', ')}`
    );
    const todasIguales = IDS.filter((id) => new Set(CANON[id]).size === 1 && CANON[id].length > 1);
    assert.equal(
      todasIguales.length,
      4,
      `INDEF-01..INDEF-04: cuatro slots tienen la MISMA key en todas sus variantes porque la forma no cambia nunca, y son ${todasIguales.length}: ${todasIguales.join(', ')}`
    );
    assert.ok(
      !todasIguales.includes(PART_PASS),
      'D-43-16: el participio passato es el UNICO cuyo eje es la forma, asi que sus keys no pueden ser todas iguales; repite `fatto` dos veces por el reparto 2 + 2'
    );
    assert.equal(
      new Set(CANON[PART_PRES]).size,
      2,
      'INDEF-03: el participio presente es el unico slot SIN repeticion: sus 2 variantes contrastan singular y plural'
    );
  });

  test('las 18 keys salen del POOL no personal y ninguna es una forma conjugada', () => {
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      const key = keyOf(v);
      if (!POOL.includes(key)) sucio.push(`${slot.id}#${k}: "${key}"`);
      if (CONJUGATE.has(key)) sucio.push(`${slot.id}#${k}: "${key}" es forma conjugada de otra categoria`);
    }
    assert.deepEqual(sucio, [], 'D-43-13: la key de cada variante es una forma NO PERSONAL de fare');
  });

  test('la key de cada variante aparece EXACTAMENTE una vez en sus options', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.equal(
        v.options.filter((o) => o === keyOf(v)).length,
        1,
        `${slot.id}#${k}: la key aparece una sola vez`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Tipos de contexto sintactico, conjunto cerrado y distintos por slot (D-43-12)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — tipos de contexto sintactico, conjunto cerrado y distintos por slot (D-43-12)', () => {
  test('la tabla declara las 18 filas, una por variante en disco', () => {
    for (const id of IDS) {
      assert.equal(
        VARIANT_TABLE[id].length,
        EXPECTED_VARIANTS[id],
        `${id}: la tabla y el disco tienen que declarar el mismo numero de variantes`
      );
    }
  });

  test('cada variante declara un tipo del conjunto CERRADO CONTEXT_TYPES', () => {
    const sucio = [];
    for (const id of IDS) {
      VARIANT_TABLE[id].forEach((f, k) => {
        if (!CONTEXT_TYPES.includes(f.tipo)) sucio.push(`${id}#${k}: "${f.tipo}"`);
      });
    }
    assert.deepEqual(sucio, [], 'D-43-12: tipo de contexto fuera del conjunto cerrado');
  });

  test('el cue declarado de cada variante esta en su prompt Y en la POSICION que la tabla dice', () => {
    // La tabla declara la INTENCION y el gate NO se la cree: `antes` y `despues`
    // son ADYACENCIA al hueco, no presencia en cualquier punto del prompt. Es lo
    // que distingue un encaje sintactico real de un literal suelto en otra
    // clausula, que es exactamente como vuelve la doble respuesta.
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const { cue, pos } = filaDe(id, k);
        if (!wordish(cue).test(v.prompt)) { sucio.push(`${id}#${k}: falta el cue "${cue}" en "${v.prompt}"`); return; }
        if (pos === 'antes' && !terminaEnPalabra(antesDelHueco(v.prompt), cue)) {
          sucio.push(`${id}#${k}: "${cue}" no es la palabra inmediatamente ANTERIOR al hueco: "${v.prompt}"`);
        }
        if (pos === 'despues' && !empiezaPorPalabra(despuesDelHueco(v.prompt), cue)) {
          sucio.push(`${id}#${k}: "${cue}" no es la palabra inmediatamente POSTERIOR al hueco: "${v.prompt}"`);
        }
      });
    }
    assert.deepEqual(sucio, [], 'D-43-12: el cue declarado no materializa el tipo en la posicion declarada');
  });

  test('dentro de cada slot los tipos son TODOS DISTINTOS, salvo la excepcion enumerada del participio passato', () => {
    // DESVIACION 5. En un slot de forma fija, tres frases que no examinan tres
    // encajes distintos son el mismo ejercicio tres veces, y con 18 variantes
    // dejarlo al quorum se paga dieciocho veces.
    for (const id of IDS) {
      if (id === PART_PASS || id === GER_PASS) continue;
      const tipos = VARIANT_TABLE[id].map((f) => f.tipo);
      assert.equal(
        new Set(tipos).size,
        tipos.length,
        `D-43-12: ${id} repite tipo de contexto: ${tipos.join(' | ')}`
      );
    }
  });

  test('EXCEPCION ENUMERADA 2: el gerundio passato reparte 2 + 1 porque el absoluto desnudo no se subdivide', () => {
    // 3a ronda de quorum, el unico hallazgo que las DOS IAs alcanzaron por
    // separado. Este gate estaba VERDE sobre una etiqueta falsa: la tabla
    // declaraba `implicita-temporal` e `implicita-causal` para dos variantes
    // estructuralmente identicas (gerundio + objeto + adverbial de anterioridad,
    // sin conector), asi que la distincion existia en la tabla y no en el
    // contenido. Es el patron de CR-02 otra vez: un gate que no muerde porque el
    // dato que compara ya venia falseado.
    //
    // La correccion es declarar el eje REAL —la particula concesiva— y enumerar la
    // excepcion, en vez de mantener una etiqueta inventada para que el gate de
    // tipos distintos siguiera pasando.
    const tipos = VARIANT_TABLE[GER_PASS].map((f) => f.tipo);
    const cuenta = tipos.reduce((a, t) => ({ ...a, [t]: (a[t] || 0) + 1 }), {});
    assert.deepEqual(
      Object.values(cuenta).sort(),
      [1, 2],
      `3a ronda: el patron declarado de ${GER_PASS} es 2 absolutos + 1 concesiva, y es: ${tipos.join(' | ')}`
    );
    assert.equal(
      cuenta['concesiva-con-pur'],
      1,
      'el eje de este slot es la presencia de la particula concesiva; si deja de haber exactamente una, el reparto declarado ya no describe el contenido'
    );
    assert.ok(
      !tipos.includes('implicita-causal'),
      '3a ronda: ninguna de las tres variantes es causal — no hay conector ni marca causal en el slot, y etiquetarla asi le enseña al autor un patron que el ejercicio no tiene'
    );
  });

  test('EXCEPCION ENUMERADA: el participio passato repite 2 + 2 porque su eje es la TERMINACION (D-43-16)', () => {
    const tipos = VARIANT_TABLE[PART_PASS].map((f) => f.tipo);
    const cuenta = tipos.reduce((a, t) => ({ ...a, [t]: (a[t] || 0) + 1 }), {});
    assert.deepEqual(
      Object.values(cuenta).sort(),
      [2, 2],
      `D-43-16: el patron declarado de ${PART_PASS} es 2 invariables + 2 concordadas, y es: ${tipos.join(' | ')}`
    );
    assert.equal(new Set(tipos).size, 2, 'D-43-16: exactamente dos tipos, no tres');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. 0-gloss del VERBO (D-41-05, D-43-22)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — 0-gloss del verbo (D-41-05, D-43-22)', () => {
  // GATE ESTRICTO Y SIN LA EXCEPCION LEXICA DE PHASE 42: aqui no hay ninguna
  // conjuncion por encima de A1 que glosar, y el unico candidato de gloss habria
  // sido la forma del verbo, que es exactamente lo que se pregunta.
  test('ningun prompt menciona el espanol en ninguna capitalizacion', () => {
    const sucio = allVariants()
      .filter(({ v }) => /espa/i.test(v.prompt))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-41-05: gloss explicito de traduccion en un prompt');
  });

  test('ningun prompt lleva parentesis: en esta categoria no hay ningun gloss admitido', () => {
    // UNICO `includes` crudo sobre un prompt que sobrevive a CR-02, y es correcto:
    // se busca un CARACTER, no una palabra. Una frontera de palabra aqui seria
    // absurda —el parentesis es por definicion un no-letra— y ademas apagaria el
    // gate, porque `(` pegado a una palabra es justamente el caso a cazar.
    const sucio = allVariants()
      .filter(({ v }) => v.prompt.includes('(') || v.prompt.includes(')'))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-43-22: 0-gloss estricto, sin la excepcion de conjuncion de Phase 42');
  });

  test('ninguna forma castellana de `hacer` aparece en un prompt, ESTE DONDE ESTE', () => {
    const HACER_ES = [
      'hacer', 'hago', 'haces', 'hace', 'hacemos', 'haceis', 'hacéis', 'hacen',
      'haciendo', 'haga', 'hagas', 'hagamos', 'hagais', 'hagáis', 'hagan',
      'haria', 'haría', 'harias', 'harías', 'hariamos', 'haríamos', 'harian', 'harían',
      'hacia', 'hacía', 'hice', 'hiciste', 'hizo', 'hicimos', 'hicieron', 'hecho', 'hechos',
    ];
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      const hits = HACER_ES.filter((f) => wordish(f).test(v.prompt));
      if (hits.length) sucio.push(`${slot.id}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    }
    assert.deepEqual(sucio, [], 'D-41-05: gloss del VERBO; en este bloque regalaria la casilla entera del paradigma');
  });

  test('los 18 prompts contienen EXACTAMENTE un hueco literal ___', () => {
    // Conteo y no presencia (IN-05): el motor sustituye UN hueco, asi que dos
    // rompen el render, y ademas `segmentoDelHueco` se quedaria con el primero.
    const sucio = allVariants()
      .filter(({ v }) => v.prompt.split('___').length !== 2)
      .map(({ slot, k, v }) => `${slot.id}#${k}: ${v.prompt.split('___').length - 1} huecos`);
    assert.deepEqual(sucio, [], 'D-43-22: cada prompt lleva exactamente un hueco ___');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. SCOPE-GATE lexico con la excepcion acotada del participio presente
//    (D-41-06, D-43-18)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — SCOPE-GATE lexico con la excepcion acotada del participio presente (D-41-06, D-43-18)', () => {
  test('ninguna de las 18 variantes cruza una perifrasis o el causativo, tampoco las 2 EXENTAS', () => {
    // La exencion de D-43-18 es del OBJETO LITERAL, no de este gate: el escaneo
    // de perifrasis muerde igual en las 18. Declarado aqui para que un re-pase
    // futuro no ensanche la excepcion por inercia.
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('golden CR-04: `soprattutto` NO cuenta como el objeto `tutto`, en las DOS direcciones', () => {
    // El agujero que este golden congela. La cabecera de este fichero declara en
    // mayusculas que «NINGUN cue se compara con `includes`, `endsWith` ni `startsWith`
    // a pelo … Un gate de presencia matcheado por subcadena no se pone rojo: deja de
    // morder, que es peor, porque aprueba en silencio la variante futura que existia
    // para cazar». Cuatro gates de objeto rompian esa regla, y `tutto` —miembro de
    // OBJECTS— es subcadena de `soprattutto` y de `tuttora`.
    //
    // DIRECCION 1, el falso VERDE: una variante cuyo objeto se sustituye por una
    // palabra que meramente lo CONTIENE se queda sin objeto directo, y el gate que
    // existe para garantizarlo la certificaba.
    assert.equal('___ soprattutto in fretta'.includes('tutto'), true, 'asi es como `includes` se dejaba enganar');
    assert.equal(wordish('tutto').test('___ soprattutto in fretta'), false, 'CR-04: `soprattutto` no lleva el objeto `tutto`');
    assert.equal(wordish('tutto').test('___ tuttora in fretta'), false, 'CR-04: `tuttora` tampoco');
    // Y sigue mordiendo donde el objeto SI esta.
    assert.equal(wordish('tutto').test('___ tutto in fretta'), true, 'CR-04: el objeto real se sigue viendo');
    assert.equal(wordish('tutto').test('Lui ha fatto tutto.'), true, 'CR-04: tambien a final de frase con puntuacion');

    // DIRECCION 2, el falso ROJO: un prompt legitimo que ABRIERA por `Soprattutto`
    // contaba DOS objetos en la clausula del hueco y se ponia rojo con el mensaje
    // «2 objetos en la clausula del hueco», cuyo arreglo plausible es relajar el gate.
    const CLAUSULA = 'Soprattutto io ___ i compiti in fretta';
    assert.deepEqual(
      OBJECTS.filter((o) => CLAUSULA.includes(o)),
      ['i compiti', 'tutto'],
      'asi contaba 2 objetos el gate viejo, y el segundo no existe'
    );
    assert.deepEqual(
      OBJECTS.filter((o) => wordish(o).test(CLAUSULA)),
      ['i compiti'],
      'CR-04: con frontera de palabra hay UN objeto, que es la verdad'
    );
  });

  test('las 16 variantes NO exentas llevan el objeto de la tabla, del conjunto cerrado ampliado, y UNO solo por clausula', () => {
    const sucio = [];
    let contadas = 0;
    for (const id of IDS) {
      if (esExento(id)) continue;
      eachVariant(id, (v, k) => {
        contadas += 1;
        const obj = filaDe(id, k).object;
        if (!OBJECTS.includes(obj)) { sucio.push(`${id}#${k}: "${obj}" no esta en el conjunto cerrado`); return; }
        const clausula = segmentoDelHueco(v.prompt);
        // CR-04: por `wordish` y NO por `includes` a pelo. `tutto` es miembro de
        // OBJECTS y es SUBCADENA de `soprattutto` y de `tuttora`, dos palabras
        // italianas corrientes. Con `includes`, este gate de PRESENCIA deja de morder
        // —aprueba en silencio una variante SIN objeto directo— y ademas produce
        // falsos rojos: un prompt que abriera por `Soprattutto` contaria 2 objetos en
        // la clausula. Las dos direcciones estan congeladas por los goldens de abajo.
        if (!wordish(obj).test(clausula)) { sucio.push(`${id}#${k}: la clausula del hueco no lleva "${obj}"`); return; }
        const enClausula = OBJECTS.filter((o) => wordish(o).test(clausula));
        if (enClausula.length !== 1) {
          sucio.push(`${id}#${k}: ${enClausula.length} objetos en la clausula del hueco (${enClausula.join(', ')})`);
        }
      });
    }
    assert.equal(contadas, 16, 'D-43-18: son 16 las variantes NO exentas (18 menos las 2 del participio presente)');
    assert.deepEqual(sucio, [], 'D-41-06: el objeto de `fare` es literal, del conjunto cerrado ampliado, y uno solo por clausula');
  });

  test('EXCEPCION ACOTADA (D-43-18): las 2 variantes exentas NO declaran objeto y SI llevan su compuesto', () => {
    // La exencion va enumerada POR ID DE SLOT y a cambio de una obligacion: el
    // sustantivo del compuesto declarado, inmediatamente despues del hueco. No es
    // una relajacion, es un cambio de gate.
    VARIANT_TABLE[PART_PRES].forEach((f, k) => {
      assert.equal(f.object, null, `D-43-18: ${PART_PRES}#${k} esta EXENTO del objeto literal y no debe declarar ninguno`);
      assert.equal(
        f.cue,
        COMPUESTOS_FACENTE[k],
        `D-43-18: ${PART_PRES}#${k} tiene que usar el compuesto declarado "${COMPUESTOS_FACENTE[k]}"`
      );
      assert.ok(
        empiezaPorPalabra(despuesDelHueco(byId(PART_PRES).variants[k].prompt), COMPUESTOS_FACENTE[k]),
        `D-43-18 / INDEF-03: el sustantivo del compuesto va inmediatamente DESPUES del hueco: "${byId(PART_PRES).variants[k].prompt}"`
      );
    });
  });

  test('los dos sustantivos del compuesto NO aparecen en ninguna de las otras 16 variantes', () => {
    // Es la mitad que hace que la excepcion sea ACOTADA: si el literal pudiera
    // aparecer en cualquier sitio, la exencion seria global de facto.
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      if (esExento(slot.id)) continue;
      const hits = COMPUESTOS_FACENTE.filter((c) => wordish(c).test(v.prompt));
      if (hits.length) sucio.push(`${slot.id}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    }
    assert.deepEqual(sucio, [], `D-43-18: la excepcion esta enumerada por id de slot; fuera de ${PART_PRES} el compuesto no entra`);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Blacklist de formas atestiguadas y defendibles (D-43-16, D-43-17, D-43-07)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — blacklist de formas atestiguadas y defendibles (D-43-16, D-43-17, D-43-07)', () => {
  // ESCANEO POR CAMPO. Ver la advertencia de escaneo de la cabecera, que es la
  // unica declaracion en mayusculas del invariante: el `notes` nombra a proposito
  // cada una de estas formas y las explanations tienen que nombrar la primera,
  // asi que nunca se escanea el fichero entero ni `explanation`.
  const camposDe = (v) => [
    { campo: 'prompt', texto: v.prompt },
    ...v.options.map((o) => ({ campo: 'option', texto: o })),
  ];

  test('ni una opcion ni un prompt de las 18 variantes lleva una forma de la blacklist', () => {
    // El riesgo real no es que el autor escriba una arcaica: es que la AUTORIA
    // genere la grafia NO ELIDIDA del infinito compuesto como distractora
    // "obviamente mala" de la elidida, siendo las dos correctas y atestiguadas.
    for (const { slot, v, k } of allVariants()) {
      const sucio = [];
      for (const { campo, texto } of camposDe(v)) {
        for (const f of BLACKLIST) {
          const hit = campo === 'option' ? texto === f || wordish(f).test(texto) : wordish(f).test(texto);
          if (hit) sucio.push(`${f} (${campo}: "${texto}")`);
        }
      }
      assert.deepEqual(sucio, [], `D-43-17 / D-43-07: ${slot.id}#${k} ofrece o menciona una forma atestiguada: ${sucio.join(', ')}`);
    }
  });

  test('ninguna opcion ni prompt lleva una forma CONJUGADA de las otras tres categorias de fare', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => CONJUGATE.has(o));
      assert.deepEqual(sucio, [], `D-43-13: ${slot.id}#${k} invade el paradigma personal de otra categoria: ${sucio.join(', ')}`);
      const enPrompt = [...CONJUGATE].filter((f) => wordish(f).test(v.prompt));
      assert.deepEqual(enPrompt, [], `D-43-13: ${slot.id}#${k} menciona una forma conjugada en el prompt: ${enPrompt.join(', ')}`);
    }
  });

  test('goldens de pareceFare: muerde las formas de fare y NO el passato remoto de essere (G-44-3-WR02)', () => {
    for (const w of ['fatto', 'faccio', 'farò']) {
      assert.ok(pareceFare(w), `G-44-3-WR02: "${w}" es forma de fare y el predicado tiene que morderla`);
    }
    for (const w of ['fui', 'fosti', 'fu', 'fummo', 'foste', 'furono']) {
      assert.ok(
        !pareceFare(w),
        `G-44-3-WR02: "${w}" es una forma de essere que el gate G1 del fichero hermano autoriza EXPLICITAMENTE como distractora de auxiliar, y el predicado la esta llamando forma de fare`
      );
    }
    assert.ok(!pareceFare('Fu'), 'G-44-3-WR02: la resta se compara en minusculas por los dos lados');
    for (const w of ['ho', 'abbiamo', 'devo']) {
      assert.ok(!pareceFare(w), `"${w}" no empieza por f- y el predicado no deberia mirarlo`);
    }
  });

  test('ANCLA: la whitelist con inicial f- de este fichero es EXACTAMENTE la del hermano, leida de su TEXTO (G-44-3-WR02)', () => {
    // Va por LECTURA de texto y NUNCA por import: bajo la invocacion canonica
    // `node --test tests/*.test.js tests/fixtures/*.test.js`,
    // importar un fichero de test desde otro registraria y correria sus `describe`
    // una segunda vez y falsearia el conteo de la suite.
    const delHermano = formasConFDelHermano();
    assert.ok(
      delHermano !== null,
      'G-44-3-WR02: la extraccion de ESSERE_FORMS de tests/content-fare-indicativo.test.js devolvio nada — esta whitelist local acaba de perder su fuente de verdad y hay que re-anclarla, no comparar dos conjuntos vacios'
    );
    assert.deepEqual(
      [...FORMAS_CON_F_AUTORIZADAS].sort(),
      [...delHermano].sort(),
      'G-44-3-WR02: la whitelist local DERIVO de la del hermano — es la misma clase de duplicado que produjo el falso rojo'
    );
  });

  test('EN POSITIVO: lo que CONJUGATE excluye —las options de los cruces ajenos— no contiene ninguna forma de fare (D-44-02)', () => {
    // Es la contrapartida auditable de la exclusion de los cruces `-300`+ al
    // construir CONJUGATE: si alguna de esas options fuera una forma de `fare`,
    // la exclusion SI le estaria bajando la barra al gate de arriba y habria que
    // revisar la frontera en vez de mantenerla.
    //
    // Toda forma de `fare` empieza por f-, pero la reciproca es FALSA y por eso el
    // gate resta: el passato remoto de `essere` (`fui`..`furono`) tambien empieza
    // por f- y el gate G1 del fichero hermano lo autoriza EXPLICITAMENTE como
    // distractora de auxiliar de `fare-indicativo-300`, que es uno de los cruces
    // que este bucle recorre. Con la prohibicion ciega el rojo llegaria con este
    // mismo mensaje sin que la exclusion de CONJUGATE hubiera dejado de ser
    // inocua (G-44-3-WR02).
    //
    // CLAUSULA DE NO-VACUIDAD primero: si un refactor dejara de recolectar las
    // options de los cruces ajenos, el `deepEqual([], [])` de abajo pasaria en
    // verde sin haber mirado nada. Hoy son las 24 options de los 2 cruces de
    // `fare-indicativo`, pero la cifra NO se transcribe: solo se exige que la
    // lista tenga contenido y que los cruces que la alimentan existan.
    assert.ok(
      CRUCES_AJENOS.length > 0,
      'D-44-02: la lista de options de los cruces ajenos esta VACIA — o las otras tres categorias perdieron sus cruces, o el recolector dejo de verlos, y este gate estaria pasando sin mirar nada'
    );
    const idsAjenos = [...new Set(CRUCES_AJENOS.map(({ slug, id }) => `${slug}/${id}`))];
    assert.ok(
      idsAjenos.length > 0,
      'D-44-02: ningun cruce ajeno identificado, asi que la auditoria de la exclusion no vale en ninguna direccion'
    );

    const sucio = CRUCES_AJENOS
      .filter(({ o }) => o.split(/\s+/).some((w) => pareceFare(w)))
      .map(({ slug, id, k, o }) => `${slug}/${id}#${k}: "${o}"`);
    assert.deepEqual(sucio, [], `D-44-02: un cruce ajeno mete una forma de fare en options —descontadas las formas de essere que la whitelist de auxiliares autoriza— y la exclusion de CONJUGATE dejaria de ser inocua: ${sucio.join(' | ')}`);
  });

  test('EN POSITIVO: el notes documenta cada forma de la blacklist entre apostrofes ASCII', () => {
    const faltan = BLACKLIST.filter((f) => !CONTENT.notes.includes(`${APOSTROFE}${f}${APOSTROFE}`));
    assert.deepEqual(faltan, [], 'D-43-17 / D-43-07: el notes no documenta estas formas de la blacklist');
  });

  test('EN POSITIVO: el notes declara los marcadores en MAYUSCULAS de esta categoria', () => {
    for (const marca of [
      'EJE = CONTEXTO', 'REPARTO DESIGUAL', 'CONJUNTO CERRADO DE TIPOS DE CONTEXTO',
      'POOL CERRADO', 'CUARTO MAGNET', 'GATE HARD DE PRONOMBRE',
      'EXCEPCIÓN ACOTADA AL SCOPE-GATE', 'RECONOCER, NO PRODUCIR', 'NOTA DE REGISTRO',
    ]) {
      assert.ok(CONTENT.notes.includes(marca), `D-43-22: el notes no declara "${marca}"`);
    }
  });

  test('EN POSITIVO: el notes declara las DOS adjudicaciones post-quorum con su audit trail', () => {
    // Ninguna de las dos vive solo en `passes[]`. Un veredicto en `passes[]` dice
    // QUE se adjudico; el `notes` es lo unico que dice POR QUE, y es lo que lee
    // un re-pase futuro que se plantee «arreglar» cualquiera de las dos.
    assert.ok(
      CONTENT.notes.includes('PREMISA CORREGIDA DEL GERUNDIO PASSATO'),
      'el notes no declara la premisa corregida del gerundio passato (hallazgo C2 del quorum base)'
    );
    assert.ok(
      CONTENT.notes.includes('OVERRIDE DE AUTOR SOBRE EL PARTICIPIO PASSATO'),
      'el notes no declara el override del autor sobre el atajo de la vocal (desempate cross-vendor)'
    );
    // El override no puede quedar como una afirmacion desnuda: tiene que llevar
    // escrito que el riesgo se ASUME y cual es la mitigacion, porque es lo unico
    // que distingue una adjudicacion razonada de un descarte.
    // 2a ronda: el propio bloque de la premisa corregida repetia la afirmacion
    // falsa por otra via (decia que el infinitivo compuesto era agramatical en una
    // subordinada implicita). El notes tiene que llevar la CONDICION escrita,
    // porque es lo que lee un re-pase futuro.
    assert.ok(
      CONTENT.notes.includes('SIN INTRODUCTOR'),
      'el notes tiene que declarar que lo agramatical es el infinitivo compuesto SIN INTRODUCTOR, no el infinitivo compuesto'
    );
    assert.ok(
      CONTENT.notes.includes('dopo aver fatto'),
      'y tiene que citar el introductor correcto y corriente que la version anterior invitaba a evitar'
    );
    // 7a ronda: el porque del BORRADO de la frase de cierre del infinito presente.
    // Una supresion no deja rastro en el contenido —ese es el punto—, asi que si el
    // motivo no vive en el `notes`, dentro de seis meses alguien la repone para
    // redondear el parrafo y el ciclo de cuatro rondas empieza otra vez.
    assert.ok(
      CONTENT.notes.includes('LA FRASE DE RESUMEN SE BORRÓ, NO SE ARREGLÓ'),
      '7a ronda: el notes no declara por que se borro la frase de cierre del infinito presente'
    );
    assert.ok(
      /NO DISCRIMINA NADA/.test(CONTENT.notes),
      '7a ronda: falta la razon que decide y que sobrevive a cualquier acotacion — el predicado eliminaba 0 de 4 opciones, porque las 4 ya son formas no personales por el POOL CERRADO'
    );
    assert.ok(
      /MITIGACIÓN/.test(CONTENT.notes),
      'el override tiene que declarar su MITIGACION: las 2 variantes de objeto pospuesto exigen la invariable, asi que copiar terminaciones por sistema falla la mitad del slot'
    );
  });

  test('EN POSITIVO: el notes declara la aritmetica VIGENTE (Phase 44) y no solo la de Phase 43', () => {
    // CR-01 (code review de Phase 44). Este gate congelaba SOLO los literales de
    // Phase 43 — '22 slots', '113' y '247' — y por tanto certificaba en verde un
    // TOTAL_EXPECTED de 247 mientras el reporter ya imprimia 250. Un test que
    // firma un numero obsoleto es peor que no tener test: es exactamente la
    // mentira de lockstep que esta fase existio para matar, con la suite de parte
    // de la mentira. Ahora se exigen los DOS estados, cada uno fechado en el
    // notes, y ademas se comprueba contra el DISCO para que el literal no pueda
    // divergir otra vez sin ponerse rojo.
    for (const n of ['22 slots', '113', '247']) {
      assert.ok(CONTENT.notes.includes(n), `INT-02: el notes no declara el estado de Phase 43 "${n}"`);
    }
    for (const n of ['25 slots', '122', '250']) {
      assert.ok(CONTENT.notes.includes(n), `INT-02: el notes no declara el estado VIGENTE de Phase 44 "${n}"`);
    }

    // Ancla contra el disco: los 4 ficheros del paradigma de `fare` mas sus
    // cruces. Si alguien anade un slot y no toca el notes, este assert cae.
    const FARE_FILES = [
      'fare-indicativo',
      'fare-congiuntivo',
      'fare-cond-imperativo',
      'fare-indefiniti',
    ];
    let slots = 0;
    let variantes = 0;
    for (const f of FARE_FILES) {
      const data = JSON.parse(
        readFileSync(new URL(`../content/exercises/${f}.json`, import.meta.url), 'utf-8')
      );
      slots += data.exercises.length;
      variantes += data.exercises.reduce((a, e) => a + e.variants.length, 0);
    }
    assert.ok(
      CONTENT.notes.includes(`${slots} slots`),
      `INT-02: el disco tiene ${slots} slots de fare y el notes no lo declara — el literal quedo obsoleto`
    );
    assert.ok(
      CONTENT.notes.includes(String(variantes)),
      `INT-02: el disco tiene ${variantes} variantes de fare y el notes no lo declara`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Pool CERRADO de options, cero formas conjugadas (D-43-13, SC-3)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — pool CERRADO de options, cero formas conjugadas (D-43-13, SC-3)', () => {
  test('la union de las options de las 18 variantes esta contenida en el POOL no personal', () => {
    // El gate mas barato de la fase: mientras ninguna conjugada entre en options,
    // este fichero no puede meter casillas de fare-indicativo, fare-congiuntivo ni
    // fare-cond-imperativo en el examen, que es lo que las tres fases anteriores
    // evitaron entre si.
    const union = [...new Set(allVariants().flatMap(({ v }) => v.options))].sort();
    const ofensoras = union.filter((o) => !POOL.includes(o));
    assert.deepEqual(ofensoras, [], `D-43-13: options fuera del paradigma no personal: ${ofensoras.join(', ')}`);
  });

  test('la interseccion de las options con las formas conjugadas de las otras 3 categorias es VACIA', () => {
    const union = [...new Set(allVariants().flatMap(({ v }) => v.options))];
    const cruce = union.filter((o) => CONJUGATE.has(o));
    assert.deepEqual(cruce, [], `SC-3: una conjugada en options bajaria el poder discriminante y cruzaria categorias: ${cruce.join(', ')}`);
  });

  test('el POOL y el conjunto de formas conjugadas son disjuntos: el gate anterior es satisfacible', () => {
    // Sin este assert el gate de arriba podria ser verde por vacuidad o rojo por
    // construccion sin que nadie supiera cual de las dos cosas pasa.
    const solape = POOL.filter((p) => CONJUGATE.has(p));
    assert.deepEqual(solape, [], 'D-43-13: si una forma no personal apareciera como option de otra categoria, la frontera habria que revisarla, no relajar el gate');
  });

  test('el infinito simple esta entre las options de las 3 variantes del infinito passato (INDEF-01)', () => {
    // Es la distractora del CALCO: el espanol dice despues de hacer con infinitivo
    // SIMPLE donde el italiano exige el COMPUESTO.
    const sucio = [];
    eachVariant(INF_PASS, (v, k) => {
      if (!v.options.includes('fare')) sucio.push(`${INF_PASS}#${k}: ${v.options.join(', ')}`);
    });
    assert.deepEqual(sucio, [], 'INDEF-01: la distractora del calco espanol es obligatoria en las 3');
  });

  test('la variante de tipo modal NO ofrece el infinito compuesto: seria una segunda respuesta (D-43-13)', () => {
    // La forma modal con el infinito compuesto es gramatical en italiano con
    // lectura epistemica, asi que ahi la distractora seria defendible.
    const modal = VARIANT_TABLE[INF_PRES].findIndex((f) => f.tipo === 'tras-regente-de-infinitivo');
    assert.ok(modal >= 0, 'la tabla tiene que declarar la variante de tipo modal del infinito presente');
    assert.ok(
      !byId(INF_PRES).variants[modal].options.includes('aver fatto'),
      `D-43-13: ${INF_PRES}#${modal} no puede ofrecer el infinito compuesto tras la forma modal`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Participio passato: las 4 terminaciones y el gate HARD de pronombre
//    (D-43-16, SC-4)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — participio passato, las 4 terminaciones y el gate HARD de pronombre (D-43-16, SC-4)', () => {
  const P = () => byId(PART_PASS);
  // CR-02: `wordish` y NUNCA `includes`. Con el matcher crudo, `Michele ha ___`
  // contaria como clitico antepuesto y el gate aprobaria una concordancia
  // injustificada. `wordish` ya lleva la `i`, asi que no hace falta lowercasear.
  const conCue = () => P().variants.map((v) => CONCORD_CUES.some((c) => wordish(c).test(v.prompt)));

  test('las 4 variantes ofrecen SIEMPRE el mismo conjunto de las cuatro terminaciones', () => {
    P().variants.forEach((v, k) => {
      assert.deepEqual(
        [...v.options].sort(),
        TERMINAZIONI,
        `D-43-16: ${PART_PASS}#${k} tiene que ofrecer las cuatro terminaciones y nada mas`
      );
    });
  });

  test('las 4 keys son invariable, invariable, masculino plural y femenino plural, en ese orden', () => {
    assert.deepEqual(P().variants.map(keyOf), CANON[PART_PASS], 'INDEF-02 / SC-4: el reparto 2 + 2 se lee en las keys');
  });

  test('GATE HARD: 0 apariciones como palabra suelta de los pronombres de concordancia OPCIONAL o partitiva', () => {
    // Con los de 1a y 2a persona la concordancia es OPCIONAL en italiano estandar
    // y con el partitivo tiene reglas propias: cualquiera de ellos abriria DOS
    // respuestas defendibles, y por la cascada D-54 eso resetea las 18 variantes.
    // El escaneo va por PALABRA SUELTA y acotado a este slot, porque `ne` y `ci`
    // son subcadenas de decenas de palabras italianas.
    const sucio = [];
    eachVariant(PART_PASS, (v, k) => {
      const hits = PRONOMBRES_PROHIBIDOS.filter((p) => wordish(p).test(v.prompt));
      if (hits.length) sucio.push(`${PART_PASS}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'D-43-16: pronombre de concordancia opcional o partitiva en el slot del participio passato');
  });

  test('GATE HARD: 0 bigramas de pronombre SINGULAR antepuesto, elididos o no (Correcciones 5)', () => {
    // Con el singular el auxiliar se elide y la vocal elidida no dice el genero:
    // el autor tendria que deducirlo solo del antecedente y la forma invariable
    // volveria a ser defendible. No es una reduccion del gate de D-43-16: es su
    // forma satisfacible.
    const sucio = [];
    eachVariant(PART_PASS, (v, k) => {
      const hits = CONCORD_PROHIBIDOS.filter((b) => wordish(b).test(v.prompt));
      if (hits.length) sucio.push(`${PART_PASS}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'D-43-16: el pronombre singular antepuesto esconde el genero tras el auxiliar elidido');
  });

  test('EXACTAMENTE 2 prompts llevan un cue de concordancia y EXACTAMENTE 2 no llevan ninguno', () => {
    const flags = conCue();
    assert.equal(flags.filter(Boolean).length, 2, `D-43-16 / SC-4: el reparto es 2 + 2, y hay ${flags.filter(Boolean).length} con cue: ${flags}`);
  });

  test('el reparto 2 + 2 es COHERENTE con las keys, no solo con la tabla', () => {
    // Las 2 con cue de concordancia son exactamente las 2 cuya key no es la forma
    // invariable, y al reves. Sin este assert, un prompt y su key podrian
    // divergir sin que nada se pusiera rojo.
    const flags = conCue();
    const sucio = [];
    P().variants.forEach((v, k) => {
      const invariable = keyOf(v) === 'fatto';
      if (invariable === flags[k]) {
        sucio.push(`${PART_PASS}#${k}: key "${keyOf(v)}" con cue de concordancia = ${flags[k]}`);
      }
    });
    assert.deepEqual(sucio, [], 'D-43-16: la key y el cue del prompt tienen que decir lo mismo');
  });

  test('las 2 variantes de concordancia usan el cue declarado en la tabla, adyacente al hueco', () => {
    // `CONCORD_CUES.includes(f.cue)` es pertenencia a un array de strings, no un
    // escaneo de texto: ahi `includes` es exactamente lo que se quiere y CR-02 no
    // aplica. Lo que SI faltaba era la ADYACENCIA que el nombre del test promete;
    // vivia solo en el bloque 3, asi que este nombre describia algo que este test
    // no comprobaba. Se anade aqui, con frontera de palabra.
    let comprobadas = 0;
    VARIANT_TABLE[PART_PASS].forEach((f, k) => {
      if (f.tipo !== 'pronombre-antepuesto-concordancia') return;
      comprobadas += 1;
      assert.ok(
        CONCORD_CUES.includes(f.cue),
        `D-43-16: "${f.cue}" no esta en el conjunto cerrado de bigramas de concordancia admitidos`
      );
      assert.ok(
        terminaEnPalabra(antesDelHueco(P().variants[k].prompt), f.cue),
        `D-43-16: el clitico antepuesto tiene que ser adyacente al hueco, y como PALABRA: "${P().variants[k].prompt}"`
      );
    });
    assert.equal(comprobadas, 2, 'D-43-16 / SC-4: son exactamente 2 las variantes de concordancia');
  });

  test('WR-01: las 2 variantes de objeto POSPUESTO SIGUEN ofreciendo la concordada, que es forma atestiguada', () => {
    // Gate a la CONTRA, y por eso existe: lo normal en esta categoria es prohibir
    // la forma atestiguada en `options` (el cuarto magnet, las arcaicas, las
    // formas con clitico). Aqui se congela lo OPUESTO — que la concordada SIGA
    // ofreciendose — porque el pool cerrado de D-43-16 no deja alternativa:
    // retirarla dejaria las 2 variantes invariables sin distractoras y destruiria
    // el slot. Un re-pase futuro que lea el criterio operativo de la blacklist y
    // «arregle» esto romperia el eje entero.
    let comprobadas = 0;
    VARIANT_TABLE[PART_PASS].forEach((f, k) => {
      if (f.tipo !== 'objeto-pospuesto-auxiliar-posesion') return;
      comprobadas += 1;
      const v = P().variants[k];
      const concordada = CONCORDANCIA_POSPUESTA_ATESTIGUADA[f.object];
      assert.ok(
        concordada,
        `WR-01: el objeto pospuesto "${f.object}" no declara cual es su forma concordada atestiguada`
      );
      assert.equal(
        keyOf(v),
        'fatto',
        `WR-01: con el objeto POSPUESTO la respuesta en italiano moderno es la INVARIABLE, no "${keyOf(v)}"`
      );
      assert.ok(
        v.options.includes(concordada),
        `WR-01: ${PART_PASS}#${k} tiene que SEGUIR ofreciendo "${concordada}" — es la concordada atestiguada con "${f.object}", y retirarla dejaria el slot sin distractoras (D-43-16 fija el pool en las cuatro terminaciones)`
      );
      assert.notEqual(
        concordada,
        keyOf(v),
        'WR-01: la concordada atestiguada es DISTRACTORA, nunca la key'
      );
    });
    assert.equal(comprobadas, 2, 'WR-01 / D-43-16: son exactamente 2 las variantes de objeto pospuesto');
  });

  test('WR-01: la decision esta declarada en el notes Y en el prompt del quorum, no solo en uno', () => {
    // Las dos mitades son necesarias y ninguna sustituye a la otra: el `notes` es
    // el audit trail para un lector futuro del repo, y la seccion 7.4 del prompt
    // es lo unico que ve el subagent. Sin la segunda, Opus y Sonnet reconocerian
    // la concordancia pospuesta como italiano real, marcarian C2 violado y
    // produciran un disputed FALSO que resetea la categoria entera por D-54.
    assert.ok(
      CONTENT.notes.includes('CONCORDANCIA CON OBJETO POSPUESTO'),
      'WR-01: el notes no declara la decision con su marcador en MAYUSCULAS'
    );
    assert.ok(
      CONTENT.notes.includes('WR-01'),
      'WR-01: el notes no lleva el audit trail del hallazgo'
    );
    const cierre = VALIDATION_PROMPT.indexOf('Fin del prompt');
    const s74 = VALIDATION_PROMPT.indexOf('### 7.4');
    assert.ok(s74 !== -1, 'WR-01: falta la subseccion 7.4 en el prompt de validacion por quorum');
    assert.ok(
      s74 < cierre,
      'WR-01: la 7.4 esta DESPUES de la linea de cierre; el subagent la leeria como parte del ejercicio y no como regla'
    );
    const s74Texto = VALIDATION_PROMPT.slice(s74, cierre);
    assert.ok(
      /FALSO POSITIVO de C2/.test(s74Texto),
      'WR-01: la 7.4 tiene que decir explicitamente que marcarlo bajo C2 es un falso positivo'
    );
    assert.ok(
      s74Texto.includes('ANTEPUESTO') && s74Texto.includes('OBLIGATORIA'),
      'WR-01: la 7.4 tiene que declarar la FRONTERA: con pronombre antepuesto la concordancia es obligatoria y C2 sigue mordiendo'
    );
    // La explanation del slot es la mitad que ve el AUTOR (el notes no se muestra
    // en la interfaz): D-43-19 exige que la forma se nombre y se explique.
    const e = byId(PART_PASS).explanation;
    assert.ok(
      e.includes('literario'),
      'D-43-19 / WR-01: la explanation tiene que avisar de que la concordancia pospuesta es de otro registro'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 9. Infinito passato, el cuarto magnet, e imperativo negativo `non fare`
//    (D-43-17, D-43-14)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — infinito passato, el cuarto magnet, e imperativo negativo non fare (D-43-17, D-43-14)', () => {
  test('CUARTO MAGNET: la grafia NO ELIDIDA no aparece en NINGUN campo de las 18 variantes', () => {
    // Las dos grafias son correctas y atestiguadas. Ofrecer la no elidida como
    // distractora "incorrecta" produciria un ejercicio injusto, un disputed
    // STICKY y el reset de la categoria entera por la cascada D-54.
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      if (wordish('avere fatto').test(v.prompt)) sucio.push(`${slot.id}#${k} (prompt)`);
      if (v.options.includes('avere fatto')) sucio.push(`${slot.id}#${k} (option)`);
    }
    assert.deepEqual(sucio, [], 'D-43-17: la grafia no elidida es correcta; su sitio es la explanation y la blacklist, nunca options');
  });

  test('la key de las 3 variantes del infinito passato es la forma ELIDIDA', () => {
    assert.deepEqual(byId(INF_PASS).variants.map(keyOf), CANON[INF_PASS], 'INDEF-01 / D-43-17: key elidida en las 3');
  });

  test('GATE de ANTERIORIDAD: cada prompt del infinito passato la fuerza de forma comprobable (INDEF-01)', () => {
    // O la preposicion de posterioridad gobierna la clausula del hueco, o esa
    // clausula lleva un deictico del conjunto CERRADO. Sin una de las dos, el
    // infinito SIMPLE seria igualmente defendible y la variante tendria dos
    // respuestas: la diferencia entre las dos formas es exactamente la
    // anterioridad.
    const sucio = [];
    eachVariant(INF_PASS, (v, k) => {
      const clausula = segmentoDelHueco(v.prompt);
      const prep = wordish(PREP_POSTERIORIDAD).test(clausula.split('___')[0] || '');
      const deittico = DEITTICI_PASSATO.some((d) => clausula.toLowerCase().includes(d));
      if (!prep && !deittico) sucio.push(`${INF_PASS}#${k}: "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'INDEF-01: sin marcador de anterioridad, el infinito simple es defendible');
  });

  test('IMPERATIVO NEGATIVO (D-43-14): la variante declarada lleva la negacion inmediatamente antes del hueco', () => {
    // El imperativo negativo de 2a singular no es la forma apostrofada negada
    // sino la negacion mas INFINITIVO, y no cabia en el slot de imperativo de la
    // categoria hermana porque SC-2 fija exactamente 5 variantes. Es cruce
    // CONCEPTUAL y no tecnico: categoryIds sigue siendo de longitud 1.
    const k = VARIANT_TABLE[INF_PRES].findIndex((f) => f.tipo === 'imperativo-negativo-2sg');
    assert.ok(k >= 0, 'D-43-14: el slot de infinito presente tiene que declarar la variante de imperativo negativo');
    const v = byId(INF_PRES).variants[k];
    assert.ok(
      terminaEnPalabra(antesDelHueco(v.prompt), 'non'),
      `D-43-14: la negacion tiene que ir inmediatamente antes del hueco: "${v.prompt}"`
    );
    assert.equal(keyOf(v), 'fare', 'D-43-14: la respuesta del imperativo negativo es el INFINITIVO');
    assert.equal(
      byId(INF_PRES).categoryIds.length,
      1,
      'D-43-14: el cruce con el imperativo es conceptual; categoryIds sigue siendo de longitud 1'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 10. Contextos, objetos y marco progresivo por variante (D-43-12, D-43-15)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — contextos, objetos y marco progresivo por variante (D-43-12, D-43-15)', () => {
  test('MARCO PROGRESIVO: la variante declarada lleva una forma del verbo de estado antes del hueco (D-43-15)', () => {
    const k = VARIANT_TABLE[GER_PRES].findIndex((f) => f.tipo === 'marco-progresivo');
    assert.equal(k, GER_PRES_CON_COMPUESTO, 'D-43-15: la variante progresiva es la declarada por indice');
    const v = byId(GER_PRES).variants[k];
    assert.ok(
      STARE.some((x) => terminaEnPalabra(antesDelHueco(v.prompt), x)),
      `D-43-15 / INDEF-04: stare + gerundio se EXAMINA, no solo se menciona: "${v.prompt}"`
    );
  });

  test('el gerundio COMPUESTO solo entra en las options de la variante progresiva del gerundio presente', () => {
    // En una subordinada implicita modal o causal el gerundio compuesto es
    // igualmente gramatical con lectura de anterioridad, asi que alli seria una
    // segunda respuesta defendible. Se identifica por INDICE DECLARADO y no por
    // conteo ciego.
    const flags = byId(GER_PRES).variants.map((v) => v.options.includes('avendo fatto'));
    assert.equal(flags.filter(Boolean).length, 1, `D-43-15: exactamente 1 variante, y hay ${flags.filter(Boolean).length}: ${flags}`);
    assert.ok(flags[GER_PRES_CON_COMPUESTO], `D-43-15: tiene que ser la del marco progresivo (#${GER_PRES_CON_COMPUESTO})`);
  });

  test('PREMISA CORREGIDA: el gerundio SIMPLE no entra en NINGUNA variante del gerundio passato', () => {
    // Gate invertido respecto a la primera version, y por eso lleva su porque.
    // Antes se exigia que la variante temporal SI lo ofreciera, con el argumento
    // de que el adverbial de anterioridad lo hacia agramatical. El quorum base
    // tumbo esa premisa: el italiano admite el gerundio simple en las
    // subordinadas implicitas aunque la accion sea anterior y este concluida, asi
    // que ofrecerlo en cualquiera de las tres seria una SEGUNDA RESPUESTA
    // DEFENDIBLE, no una distractora. Si alguien vuelve a meterlo, lo que tiene
    // que leer en el diff es esto y no un aviso de conteo.
    const sucio = [];
    eachVariant(GER_PASS, (v, k) => {
      if (v.options.includes('facendo')) sucio.push(`${GER_PASS}#${k}: ${v.options.join(', ')}`);
    });
    assert.deepEqual(
      sucio,
      [],
      'PREMISA CORREGIDA (quorum base, C2): el gerundio simple es DEFENDIBLE en una subordinada implicita concesiva o causal, tambien con la accion ya concluida; ofrecerlo abre dos respuestas'
    );
  });

  test('PREMISA CORREGIDA: las 3 variantes del gerundio passato ofrecen el CALCO, que es el infinito compuesto', () => {
    // La contrapartida del gate anterior: al quitar el gerundio simple, el slot
    // se quedaria sin ninguna distractora plausible y el criterio de distractoras
    // se resentiria. La que entra en su lugar es la interferencia REAL del
    // hispanohablante —el espanol dice a pesar de haber hecho con INFINITIVO— y
    // esa si es agramatical en una subordinada implicita de este tipo.
    const sucio = [];
    eachVariant(GER_PASS, (v, k) => {
      if (!v.options.includes(CALCO_GERUNDIO_PASSATO)) sucio.push(`${GER_PASS}#${k}: ${v.options.join(', ')}`);
    });
    assert.deepEqual(
      sucio,
      [],
      `INDEF-04 / C3: sin "${CALCO_GERUNDIO_PASSATO}" el slot se queda sin distractora plausible y solo ofrece formas descartables de un vistazo`
    );
  });

  test('el contraste mecanico simple-frente-a-compuesto se examina en el marco PROGRESIVO, no en el gerundio passato', () => {
    // Consecuencia declarada de la premisa corregida, congelada para que no se
    // lea como perdida: el par se sigue examinando de forma dura, pero donde el
    // contraste NO es interpretable — tras el verbo de estado, donde el compuesto
    // es categoricamente agramatical.
    const k = VARIANT_TABLE[GER_PRES].findIndex((f) => f.tipo === 'marco-progresivo');
    assert.ok(
      byId(GER_PRES).variants[k].options.includes('avendo fatto'),
      'INDEF-04: si el marco progresivo deja de ofrecer el gerundio compuesto, el contraste simple/compuesto no se examina en NINGUN sitio del fichero'
    );
    assert.equal(
      keyOf(byId(GER_PRES).variants[k]),
      'facendo',
      'D-43-15: y la respuesta ahi es el simple, que es lo que hace el contraste'
    );
  });

  test('los 3 prompts del gerundio passato llevan EXACTAMENTE un marcador del conjunto cerrado', () => {
    const sucio = [];
    eachVariant(GER_PASS, (v, k) => {
      // CR-02: `Pur` es prefijo de `Purché`, `Purtroppo` y `puro`, asi que con
      // `includes` el conteo de marcadores seria falseable por cualquiera de las
      // tres. Va por `wordish` como todo lo demas.
      const hits = MARCADORES_GERUNDIO_PASSATO.filter((m) => wordish(m).test(v.prompt));
      if (hits.length !== 1) sucio.push(`${GER_PASS}#${k}: ${hits.length} marcadores [${hits.join(' | ')}]: "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'INDEF-04: un marcador de anterioridad o de concesion por prompt, del conjunto cerrado');
  });

  test('los deicticos del infinito passato y los adverbiales del gerundio passato son conjuntos CERRADOS y no se mezclan', () => {
    // Cada slot tiene el suyo: si un adverbial del gerundio passato apareciera en
    // el infinito passato, el gate de anterioridad del bloque 9 no lo veria.
    const sucio = [];
    eachVariant(INF_PASS, (v, k) => {
      const hits = ADVERBIALI_ANTERIORITA.filter((a) => wordish(a).test(v.prompt));
      if (hits.length) sucio.push(`${INF_PASS}#${k}: ${hits.join(', ')}`);
    });
    eachVariant(GER_PASS, (v, k) => {
      const hits = DEITTICI_PASSATO.filter((d) => wordish(d).test(v.prompt));
      if (hits.length) sucio.push(`${GER_PASS}#${k}: ${hits.join(', ')}`);
    });
    assert.deepEqual(sucio, [], 'D-43-12: cada slot usa SU conjunto cerrado de marcadores');
  });

  test('los objetos declarados en la tabla se reparten sin que ninguna clausula lleve dos', () => {
    // Complemento del bloque 5: alli se comprueba que el objeto DECLARADO esta;
    // aqui, que el conjunto de objetos usados sale entero del conjunto cerrado y
    // que ninguno esta declarado fuera de el.
    const usados = [...new Set(
      IDS.filter((id) => !esExento(id)).flatMap((id) => VARIANT_TABLE[id].map((f) => f.object))
    )];
    const fuera = usados.filter((o) => !OBJECTS.includes(o));
    assert.deepEqual(fuera, [], `D-41-06: objeto declarado fuera del conjunto cerrado ampliado: ${fuera.join(', ')}`);
    assert.ok(
      usados.includes('le foto'),
      'Correcciones 4: la variante de concordancia femenina plural necesita la inflexion en plural declarada; sin ella el gate seria insatisfacible'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 11. Canon editorial e higiene del JSON (D-43-21, T-43-01, T-43-02)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — canon editorial e higiene del JSON (D-43-21, T-43-01, T-43-02)', () => {
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
    for (const marca of ['<', '>', '&#', 'javascript:', '`']) {
      const sucio = strings.filter((s) => s.includes(marca)).map((s) => s.slice(0, 60));
      assert.deepEqual(sucio, [], `T-43-01: aparece ${marca} en el contenido`);
    }
  });

  test('ningun string lleva comillas ni apostrofes tipograficos: solo ASCII U+0027 (D-43-21)', () => {
    const sucio = strings.filter((s) => /[‘’“”]/.test(s)).map((s) => s.slice(0, 60));
    assert.deepEqual(sucio, [], 'D-43-21: smart quotes en el contenido');
  });

  test('ninguna clave propia del objeto parseado se llama __proto__, constructor ni prototype', () => {
    const sucias = claves.filter((k) => ['__proto__', 'constructor', 'prototype'].includes(k));
    assert.deepEqual(sucias, [], 'T-43-02: clave peligrosa en el JSON de contenido');
    assert.equal(({}).polluted, undefined, 'T-43-02: el parse no puede contaminar Object.prototype');
  });

  test('todas las explanations, paradigma y cruce, estan en espanol acentuado RAE, no vacias y sin cross-ref R2', () => {
    // Un flag C4-accent del quorum sobre espanol sin tildes es bug REAL: se
    // arreglan los acentos, NUNCA se hace override.
    for (const s of SLOTS) {
      assert.ok(s.explanation.trim().length > 0, `D-43-21: ${s.id} sin explanation`);
      assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/, `D-43-21: la explanation de ${s.id} no lleva ningun acento RAE`);
      assert.ok(!/#\d{3}|mc-\d+/.test(s.explanation), `R2: la explanation de ${s.id} referencia un ejercicio por id`);
    }
  });

  test('EN POSITIVO: la explanation del infinito presente desarrolla el imperativo negativo (D-43-14)', () => {
    const e = byId(INF_PRES).explanation;
    assert.ok(e.includes('infinitivo'), 'D-43-14: la explanation tiene que nombrar el infinitivo');
    assert.ok(e.includes('negativ') && e.includes('orden'), 'D-43-14: falta el desarrollo de la orden negativa');
    // 5a ronda: el PAR de la interferencia, explicitamente. Estaba exigido por el
    // requisito y confirmado por los dos evaluadores desde la primera ronda, pero
    // NO estaba gateado: una mutacion que borraba `no hagas` dejaba la suite verde,
    // porque los tres literales de arriba sobrevivian. Es el punto pedagogico del
    // slot —lo unico que las cinco rondas nunca discutieron— y las tres
    // prohibiciones preservan expresamente la interferencia real con la L1.
    assert.ok(
      e.includes('non fare') && e.includes('no hagas'),
      'D-43-14: la interferencia tiene que estar con LAS DOS FORMAS citadas (`non fare` frente a `no hagas`); sin el par, el alumno no ve donde calca el espanol'
    );
    // 7a ronda: la ACOTACION DE PERSONA, que es lo que hace verdadera la frase que
    // queda. El italiano usa el infinitivo en la orden negativa SOLO en la 2a del
    // singular: con las formas de cortesia, la de vosotros y la exhortativa
    // conserva forma conjugada (`non faccia`, `non fate`, `non facciamo`), que es el
    // paradigma de cinco casillas que enseña la categoria hermana. Sin esta
    // acotacion, la explanation afirma sin querer lo mismo que acaba de borrarse:
    // una mutacion que la quitaba dejaba la suite verde.
    assert.ok(
      e.includes('segunda persona del singular'),
      'D-43-14 / 7a ronda: sin la acotacion de persona la regla del imperativo negativo es FALSA para Lei, voi y noi, que conservan forma conjugada'
    );
    // 4a ronda: el mensaje decia «enumera los tres encajes», y enumerarlos es
    // justo lo que la prohibicion 2 veta. El suelo sigue, porque una explanation
    // que baje de ahi ya no desarrolla la interferencia del imperativo negativo,
    // que es lo unico que este slot tiene que dejar claro.
    assert.ok(e.length > 500, `D-43-14: la explanation del infinito presente desarrolla la interferencia del imperativo negativo (${e.length} caracteres)`);
    // TOPE por slot (4a ronda). El mecanismo del defecto en esta fase no ha sido
    // una frase concreta sino el CRECIMIENTO del texto: cada ronda anadia precision
    // y con ella una excepcion. El tope es el unico gate que ataca eso, y va por
    // SLOT y no global porque cada uno tiene su propio margen legitimo.
    assert.ok(e.length < 1100, `4a ronda: la explanation del infinito presente tiene ${e.length} caracteres y el tope es 1100. Antes de la reescritura pasaba de 1300 y en ese margen vivian los tres absolutos falsos`);
  });

  test('EN POSITIVO: la explanation del infinito passato NOMBRA la grafia no elidida (D-43-17, D-43-19)', () => {
    // Escaneo en POSITIVO y es lo CONTRARIO del gate de ausencia del bloque 9:
    // la forma tiene que estar NOMBRADA aqui; lo que no puede es estar en options.
    // Es la linea concreta del principio RECONOCER, NO PRODUCIR.
    const e = byId(INF_PASS).explanation;
    assert.ok(e.includes('avere fatto'), 'D-43-17 / D-43-19: la explanation tiene que decir que la no elidida tambien es correcta');
    assert.ok(e.includes('anterioridad'), 'INDEF-01: falta la decision que el slot examina');
    assert.ok(e.length > 600, `D-43-17: la explanation del infinito passato desarrolla el magnet (${e.length} caracteres)`);
  });

  test('EN POSITIVO: la explanation del participio passato lleva el par de la interferencia (D-43-16, SC-4)', () => {
    const e = byId(PART_PASS).explanation;
    for (const t of TERMINAZIONI) assert.ok(e.includes(t), `INDEF-02: la explanation no cita la terminacion ${t}`);
    assert.ok(e.includes('las he hecho'), 'SC-4: falta la forma espanola INVARIABLE del par');
    assert.ok(e.includes('le ho fatte'), 'SC-4: falta la forma italiana CONCORDADA del par');
    assert.ok(e.length > 700, `D-43-16: es la explanation mas cargada del fichero (${e.length} caracteres)`);
  });

  test('EN POSITIVO: la explanation del participio presente lleva la NOTA DE REGISTRO (INDEF-03, SC-4)', () => {
    const e = byId(PART_PRES).explanation;
    assert.ok(e.includes('burocrátic'), 'INDEF-03: la explanation tiene que avisar de que la forma es burocratica');
    assert.ok(e.includes('fosiliz'), 'INDEF-03: la explanation tiene que avisar de que la forma esta fosilizada');
    for (const c of COMPUESTOS_FACENTE) assert.ok(e.includes(c), `INDEF-03: la explanation no cita el compuesto con "${c}"`);
    assert.ok(e.length > 500, `INDEF-03: la nota de registro necesita desarrollo (${e.length} caracteres)`);
  });

  test('EN POSITIVO: la explanation del gerundio presente dice que el error es usarlo DE MAS (D-43-15)', () => {
    const e = byId(GER_PRES).explanation;
    assert.ok(e.includes('progresiv'), 'INDEF-04: la explanation tiene que nombrar el progresivo');
    assert.ok(
      e.includes('de más') || e.includes('en exceso'),
      'D-43-15: la interferencia real es de USO y no de formacion; falta la formulacion del uso excesivo'
    );
    assert.ok(e.length > 600, `D-43-15: la explanation del gerundio presente desarrolla la interferencia (${e.length} caracteres)`);
  });

  test('EN POSITIVO: la explanation del gerundio passato opone anterioridad y contemporaneidad (INDEF-04)', () => {
    const e = byId(GER_PASS).explanation;
    assert.ok(e.includes('anterioridad'), 'INDEF-04: falta el valor del gerundio compuesto');
    assert.ok(e.includes('contemporane'), 'INDEF-04: falta el contraste con el gerundio simple');
    // 4a ronda: mismo caso que el mensaje del infinito presente — «enumera los tres
    // encajes» describia contenido que la prohibicion 2 veta. El suelo se mantiene.
    assert.ok(e.length > 500, `INDEF-04: la explanation del gerundio passato desarrolla el contraste entre el compuesto y el simple (${e.length} caracteres)`);
  });

  test('ninguna explanation, paradigma o cruce, predica imposibilidad DESNUDA sobre una forma italiana', () => {
    // Tripwire de la regla de fondo. Ver el comentario de ABSOLUTOS_DESNUDOS: caza
    // la formula, no la falsedad, asi que su valor es recordar la disciplina en el
    // diff — no certifica que las explanations sean verdaderas.
    const sucio = [];
    for (const s of SLOTS) {
      for (const a of ABSOLUTOS_DESNUDOS) {
        if (s.explanation.includes(a)) sucio.push(`${s.id}: "${a}"`);
      }
    }
    assert.deepEqual(
      sucio,
      [],
      'si la regla real lleva una CONDICION, escribe la condicion en vez de la prohibicion: en esta fase tres explanations afirmaron imposibilidad en falso, y dos las introdujo el arreglo de la anterior'
    );
  });

  test('DI MENOS: la explanation del gerundio passato esta ACOTADA a las tres frases del slot', () => {
    // Gate ESTRUCTURAL de la decision de recorte, tras TRES rondas de quorum con
    // tres motivos distintos y dos de los tres introducidos al arreglar el
    // anterior. El diagnostico no era «esta frase esta mal» sino que el texto
    // intentaba enunciar la gramatica general de la subordinacion implicita
    // italiana, que tiene excepciones en cada casilla: cada vez que se completaba
    // un poco mas, entraba una falsedad. Todo lo que afirme sobre casos que el slot
    // NO presenta es superficie de error sin valor pedagogico.
    //
    // El tope de longitud es el gate porque el mecanismo del defecto era el
    // CRECIMIENTO del texto, no una frase concreta. No impide escribir una
    // falsedad; impide que el texto vuelva a crecer hacia la regla general.
    const e = byId(GER_PASS).explanation;
    assert.ok(
      e.length < 1200,
      `DI MENOS (3a ronda): la explanation del gerundio passato tiene ${e.length} caracteres y el tope es 1200. Antes del recorte pasaba de 2000, y en ese margen caben las cuatro afirmaciones falsas que se retiraron`
    );
  });

  test('DI MENOS: la explanation del gerundio passato NO enuncia una taxonomia de encajes', () => {
    // El hallazgo que las DOS IAs alcanzaron por separado: el texto declaraba
    // temporal / causal / concesiva y el slot contiene absoluta / absoluta /
    // concesiva. Le ensenaba al autor un patron que el ejercicio no tiene, y de
    // paso dejaba la key de una variante justificada bajo una etiqueta equivocada.
    // La taxonomia se retira entera: no hace falta para resolver estas tres frases.
    const e = byId(GER_PASS).explanation;
    const sucio = ['causal', 'concesiva', 'temporal'].filter((t) => e.includes(t));
    assert.deepEqual(
      sucio,
      [],
      `3a ronda: la explanation vuelve a etiquetar los encajes (${sucio.join(', ')}). El slot es absoluta + absoluta + concesiva, no temporal + causal + concesiva, y la taxonomia no hace falta para elegir la respuesta`
    );
  });

  test('DI MENOS: la explanation del gerundio passato NO compara con el espanol', () => {
    // La comparacion con el espanol de ESTE slot fallo dos veces seguidas: primero
    // afirmando que el infinitivo compuesto era agramatical, y despues que su calco
    // con preposicion seria «igualmente correcto» (falso para la concesiva:
    // `nonostante aver fatto` no es norma moderna). Se retira entera. El contraste
    // con el espanol sigue vivo donde es exacto y verificado, como el par
    // «las he hecho» / «le ho fatte» del participio passato.
    const e = byId(GER_PASS).explanation;
    assert.ok(
      !/espa/i.test(e),
      '3a ronda: la comparacion con el espanol de este slot ha producido dos afirmaciones falsas; no se repone'
    );
  });

  test('DI MENOS: los participios ofrecidos estan DESCORDADOS con el objeto de su frase (lo que blinda el slot)', () => {
    // Gate estructural, y el mas valioso de esta ronda: es lo que Opus identifico
    // como el blindaje real del slot. Si el participio distractor CONCORDARA con el
    // objeto, `Fatti i compiti la sera prima, ho potuto dormire` seria un participio
    // absoluto perfectamente valido en italiano y habria doble validez. La
    // discordancia era deliberada pero NO estaba declarada en ningun sitio, asi que
    // un re-pase futuro podia «arreglar» la concordancia y romper el slot sin que
    // nada se pusiera rojo.
    const sucio = [];
    VARIANT_TABLE[GER_PASS].forEach((f, k) => {
      const concordada = CONCORDANCIA_DEL_OBJETO[f.object];
      assert.ok(concordada, `el objeto "${f.object}" no declara su forma concordada`);
      const v = byId(GER_PASS).variants[k];
      if (v.options.includes(concordada)) {
        sucio.push(`${GER_PASS}#${k}: ofrece "${concordada}", que CONCUERDA con "${f.object}"`);
      }
    });
    assert.deepEqual(
      sucio,
      [],
      '3a ronda: un participio concordado con el objeto abre la lectura de participio absoluto y con ella una segunda respuesta defendible'
    );
  });

  test('las afirmaciones falsas retiradas no vuelven, POR SLOT (rondas 1 a 7)', () => {
    // Guardia de regresion acumulada, y va POR SLOT y no global a proposito: lo que
    // un slot no examina, otro si. `participio invariable` es falso en el gerundio
    // passato y correcto de decir en el participio passato con objeto pospuesto;
    // una lista global prohibiria la verdad en el slot de al lado.
    //
    // Cada literal estuvo en la explanation de su slot y fue retirado por una ronda
    // de quorum. El patron —sustituir una afirmacion falsa por otra— se repitio en
    // TRES de las cuatro rondas, y dos de los defectos los introdujo el arreglo del
    // anterior; por eso se listan juntos.
    const AFIRMACIONES_RETIRADAS = {
      [GER_PASS]: [
        'exige el compuesto', // 1a: el simple SI es posible en estos encajes
        'deja de ser posible', // 1a, misma familia
        'queda descartado', // 1a, misma familia
        'es agramatical', // 2a: lo agramatical era el infinitivo SIN introductor
        'introductor', // 3a: la regla general sobra y licenciaba `pur aver fatto`
        'igualmente correcto', // 3a: falso para la concesiva (`nonostante aver fatto`)
        'participio invariable', // 3a: la invariabilidad solo se sostiene con objeto pospuesto
        'solo admite gerundio', // 4a: `pur` admite infinitivo regido por `di` (`pur di vincere`), adjetivo, participio y verbo finito
        'ningún elemento', // 4a: `fatta` CONCUERDA con `lei` en la variante 1; lo que cierra el absoluto es que la concordancia va con el OBJETO
      ],
      [INF_PRES]: [
        'ninguna de las demás formas', // 4a: tras un modal encaja `aver fatto` (`deve aver fatto`) y tras `non` encaja el gerundio
        'nunca otra forma no personal', // 4a: `dopo mangiato`, `dopo finito` son italiano corriente
        'igual que el español', // 4a: amplificaba el absoluto, y el espanol SI excluye el participio ahi
        'una forma no personal y no una conjugada', // 7a: BORRADA, no acotada. Falsa (la orden negativa usa infinitivo solo en 2a sg; `non faccia`/`non fate`/`non facciamo` son conjugadas) y ademas VACIA, porque las 4 options de cada variante ya son no personales por el gate del POOL: el predicado eliminaba 0 de 4
        'una preposición o un verbo modal delante', // 6a: enumeracion INCOMPLETA — dejaba fuera la orden negativa, que es la variante estrella del slot; bajo lectura exhaustiva («siempre», articulo determinado) la frase era falsa en V0, donde lo que precede al hueco es `non`
        'ya aporta esa información', // 5a: el infinitivo aparece nominalizado (`Fumare fa male`) y en instruccion impersonal (`Vietato fumare`) sin ningun elemento que aporte persona ni numero; y en el imperativo negativo la persona la da la CONSTRUCCION, no otro elemento — el vocativo es prescindible (`Non fare rumore!`)
      ],
    };
    const sucio = [];
    for (const [id, retiradas] of Object.entries(AFIRMACIONES_RETIRADAS)) {
      const e = byId(id).explanation;
      for (const f of retiradas) if (e.includes(f)) sucio.push(`${id}: "${f}"`);
    }
    assert.deepEqual(
      sucio,
      [],
      `cada uno de estos literales fue una afirmacion FALSA retirada por una ronda de quorum: ${sucio.join(', ')}. Antes de reponer cualquiera, comprobar la afirmacion contexto por contexto`
    );
  });

  // PODA DECLARADA (4a ronda), para que no parezca perdida de cobertura: aqui vivia
  // el gate `la explanation del gerundio passato nombra las dos familias de opciones
  // que hay que descartar`, que exigia nombrar `aver fatto`, `fare`, `concuerdan` y
  // `pur`. Se retira porque MANDABA escribir contenido que la prohibicion 3 veta: la
  // explicacion de por que falla cada distractora. Ahi murieron exactamente los dos
  // hallazgos de esta ronda —el absoluto de `pur` y el «no concuerdan con ningun
  // elemento»—, asi que el gate no solo permitia el defecto: lo exigia. Lo que
  // cubria de verdad (que las opciones ofrecidas sean descartables) lo cubren los
  // gates estructurales de options y el de discordancia del participio, que siguen
  // vivos y son mas fuertes porque miran el CONTENIDO y no la prosa.

  test('P1: ninguna de las 2 explanations reescritas afirma nada fuera de lo que su slot examina', () => {
    // Cierre estructural de la prohibicion 1, por slot. No se puede comprobar
    // mecanicamente «no afirma nada de mas», asi que se comprueba lo que si es
    // mecanizable: que no reaparezcan las familias de afirmacion general que el
    // quorum tumbo cuatro veces —inventarios de que forma cabe tras que palabra, y
    // reglas sobre la sintaxis de una particula que el slot no examina.
    const INVENTARIOS = ['formas no personales del verbo encaja', 'solo admite', 'nunca otra forma'];
    const sucio = [];
    for (const id of [GER_PASS, INF_PRES]) {
      const e = byId(id).explanation;
      for (const f of INVENTARIOS) if (e.includes(f)) sucio.push(`${id}: "${f}"`);
    }
    assert.deepEqual(
      sucio,
      [],
      'P1: cada regla general compra una excepcion y el quorum la encuentra. El slot examina su forma frente a su alternativa, no el inventario de la subordinacion italiana'
    );
  });

  test('P1 por TEMA: ninguna explanation enuncia una CONDICION GENERAL DE APARICION de su forma', () => {
    // 5a ronda, el ultimo hallazgo de la fase, y es tematico y no de literal: la
    // frase retirada («aparece cuando otro elemento de la frase ya aporta esa
    // informacion») no usaba ninguna formula absoluta de las que ya se vigilan.
    // Su defecto era de TIPO: enunciaba en que CONDICIONES aparece la forma, que es
    // una afirmacion sobre toda la lengua y no sobre lo que el slot examina.
    //
    // Falla dos veces. Primero en el italiano real —el infinitivo aparece
    // nominalizado (`Fumare fa male`) y en instruccion impersonal (`Vietato
    // fumare`) sin ningun elemento que aporte persona ni numero—. Y segundo, peor,
    // en la variante que el propio texto declara la mas importante: en el
    // imperativo negativo la persona la aporta la CONSTRUCCION, no otro elemento,
    // porque el vocativo es prescindible (`Non fare rumore!` funciona solo).
    //
    // El gate va POR TEMA: caza la familia de aperturas que enuncian condicion de
    // aparicion, no una frase concreta. Y va por slot, como todas las de este
    // fichero: si algun dia una explanation necesita decir cuando aparece su forma
    // porque ESO es lo que su slot examina, se le declara la excepcion aqui.
    // AMPLIACION DE LA 6a RONDA, y la razon importa mas que la lista. La version
    // anterior de este gate solo cubria la familia de APERTURAS (`Aparece
    // cuando`...), es decir la superficie con la que el defecto se habia
    // manifestado la ultima vez. La frase que Sonnet marco a continuacion decia
    // «es la señal de que...», que es el MISMO tipo de generalizacion con otra
    // superficie, y el gate no la habria cazado. Ese es el patron que toda la fase
    // ha estado cerrando: el gate mira la forma del ultimo defecto, no el defecto.
    //
    // Se anade por tanto la segunda familia: los PREDICADOS CON ARTICULO
    // DETERMINADO tras una enumeracion de disparadores, que son los que la
    // convierten en lista COMPLETA a ojos del lector (`es la señal de`, `es la
    // pista`, `es lo que indica`, `basta con que haya`). Con `una señal` o con un
    // verbo pleno la enumeracion se lee como suficiente y no como exhaustiva, que
    // es la lectura que el italiano sostiene.
    //
    // Verificado que las 6 explanations pasan sin falsos positivos, asi que la
    // lista puede ir global; si alguna la necesitara, se acota por slot como P1 y
    // P2.
    const CONDICIONES_DE_APARICION = [
      // familia 1: aperturas que enuncian condicion de aparicion (5a ronda)
      'Aparece cuando',
      'aparece cuando',
      'Aparece siempre que',
      'aparece siempre que',
      'Se usa cuando',
      'se usa cuando',
      'solo aparece',
      'Solo aparece',
      // familia 2: predicados con articulo determinado que cierran una
      // enumeracion de disparadores como si fuera completa (6a ronda)
      'es la señal',
      'son la señal',
      'es la pista',
      'son la pista',
      'es la marca de',
      'es lo que indica',
      'es lo que decide',
      'basta con que haya',
    ];
    // Comparacion INSENSIBLE A MAYUSCULAS: la primera version de este gate
    // comparaba con `includes` a secas y la mutacion `Basta con que haya un modal
    // delante.` —con la B inicial de comienzo de frase— pasaba limpia. Es el mismo
    // agujero que WR-10 documento para `wordish`: la posicion donde la formula
    // aparece de verdad es el INICIO DE ORACION, que era justo la que no se veia.
    const sucio = [];
    for (const s of SLOTS) {
      const e = s.explanation.toLowerCase();
      for (const f of CONDICIONES_DE_APARICION) {
        if (e.includes(f.toLowerCase())) sucio.push(`${s.id}: "${f}"`);
      }
    }
    assert.deepEqual(
      sucio,
      [],
      'P1 (5a y 6a ronda): decir en que condiciones aparece una forma, o cerrar una enumeracion de disparadores con un predicado de articulo determinado, es una afirmacion sobre toda la lengua'
    );
  });

  // PODA DECLARADA (7a ronda), y es la SEGUNDA vez que un gate mio exige contenido
  // que despues hubo que borrar. Aqui vivia `P1 en POSITIVO: la enumeracion de
  // disparadores cubre los tres encajes del slot`, que obligaba a que la
  // explanation del infinito presente cerrara con una enumeracion completa de
  // disparadores. Lo escribi en la 6a ronda para impedir que la lista se quedara
  // corta — y la respuesta correcta resulto ser que la lista NO DEBIA EXISTIR:
  //
  //   - era FALSA al nivel de generalidad que intentaba: la orden negativa usa
  //     infinitivo solo en la 2a del singular, y con `Lei`, `voi` y `noi` conserva
  //     forma conjugada (`non faccia`, `non fate`, `non facciamo`), que es
  //     justamente el paradigma de cinco casillas que enseña la categoria hermana
  //   - y su predicado NO DISCRIMINABA NADA: las 4 options de cada variante de esta
  //     categoria son formas no personales por el gate del POOL (D-43-13), asi que
  //     decir que lo que va ahi es una forma no personal elimina 0 de 4 opciones.
  //     Ni siquiera acotada a la 2a del singular aportaria algo — seria una frase
  //     verdadera y vacia, con superficie de error a cambio de nada
  //
  // La leccion, que es la misma que la poda de la 4a ronda: un gate de PRESENCIA
  // sobre prosa fija la forma que el texto tenia el dia que se escribio, y si esa
  // forma era el defecto, el gate lo perpetua. Los gates que miran el CONTENIDO
  // (POOL, options, concordancia) no tienen ese problema. Lo que este cubria de
  // verdad —que el alumno sepa donde mirar— ya lo cubre el desarrollo acotado de la
  // interferencia, que sigue exigido por el gate de D-43-14.

  test('la explanation del infinito presente usa el pronombre preposicional correcto (C4, errata de espanol)', () => {
    // Errata real de gramatica espanola que marco Sonnet: tras la preposicion `a`
    // el espanol normativo pide `ti`, no `tu`. Resuelto con la formula
    // metalinguistica que el propio parrafo ya usaba dos lineas mas abajo.
    //
    // OJO, y va escrito porque la primera version de ESTE MISMO gate cayo en la
    // trampa: se escribio con `\b`, que en JS es ASCII-only. La `u` acentuada no
    // es un word-char para `\b`, asi que `/\ba tú\b/` NO casa nunca y el gate
    // nacio muerto — la mutacion que lo probaba daba fail 0. Es exactamente el
    // defecto de CR-02, cometido otra vez. Por eso va con `wordish`, que es
    // Unicode-aware, como todo lo demas de este fichero.
    //
    // Se comprueba solo la forma ACENTUADA: `a tú` es inequivocamente el error,
    // mientras que `a tu` sin tilde es el posesivo y es espanol correcto (`a tu
    // casa`), asi que gatearlo produciria un falso positivo.
    const e = byId(INF_PRES).explanation;
    assert.ok(
      !wordish('a tú').test(e),
      'C4: tras la preposicion `a` el espanol pide el pronombre preposicional `ti`, no `tú`. Usar `a ti` o la formula metalinguistica `de tú` que el propio parrafo ya emplea'
    );
    // 2a ronda de quorum (Opus, C4): el cierre del parrafo remitia con `de ellas`
    // a la coordinacion «la negacion, la preposicion o el modal», que es de genero
    // MIXTO con un masculino dentro, asi que el plural va en masculino. Tampoco lo
    // salvaba la concordancia por proximidad, porque el elemento contiguo (`el
    // modal`) es masculino tambien. En este texto no hay ningun antecedente
    // femenino plural —`la palabra` y `la pista` son singulares—, asi que el
    // literal se puede gatear sin falsos positivos.
    assert.ok(
      !wordish('de ellas').test(e),
      'C4: `de ellas` no tiene antecedente femenino plural en esta explanation; la coordinacion es de genero mixto y pide `de ellos`'
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 12. Audit trail de validacion y ronda EXTRA condicionada (D-43-20, T-43-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — audit trail de validacion y ronda EXTRA (D-43-20, T-43-03)', () => {
  // ESTOS ASSERTS SON VERDES CON passes: [] — deriveStatus([]) devuelve 'pending',
  // asi que la igualdad se cumple ANTES de que corra el quorum. Su funcion NO es
  // exigir que la categoria este validada (eso lo hace el gate VAL_07_STRICT del
  // smoke parametrico, que al cerrar Phase 43 esta en rojo a proposito, nombrando
  // los 9 slots de las dos categorias nuevas): es impedir que un `validated`
  // escrito a mano, sin pases reales, pase por bueno. El audit trail es la unica
  // evidencia que el autor tiene de que una variante fue revisada, y falsificarlo
  // es indetectable a ojo. Es tambien lo que permite que `execute-phase` cierre en
  // verde y que el quorum base Opus+Sonnet vaya despues, en pasada TOP-LEVEL.
  test('todos los slots, paradigma y cruce, tienen validation con status string y passes array', () => {
    for (const s of SLOTS) {
      assert.ok(s.validation && typeof s.validation === 'object', `${s.id}: falta validation`);
      assert.equal(typeof s.validation.status, 'string', `${s.id}: validation.status debe ser string`);
      assert.ok(Array.isArray(s.validation.passes), `${s.id}: validation.passes debe ser array`);
    }
  });

  test('status coincide con deriveStatus(passes) en TODOS los slots, paradigma y cruce: no se puede forjar un validated', () => {
    // `deriveStatus` se importa del codigo real (WR-01: fuente unica) y NUNCA se
    // reimplementa aqui, para que este gate no pueda divergir de lo que el motor y
    // el reporter consideran validado.
    for (const s of SLOTS) {
      assert.equal(
        s.validation.status,
        deriveStatus(s.validation.passes),
        `T-43-03: ${s.id} declara "${s.validation.status}" pero sus ${s.validation.passes.length} pases derivan "${deriveStatus(s.validation.passes)}"`
      );
    }
  });

  test('si un slot esta validated, sus pases cumplen el quorum: >=2 correcta, >=2 by distintos, 0 incorrecta salvo override del autor', () => {
    for (const s of SLOTS.filter((x) => x.validation.status === 'validated')) {
      const passes = s.validation.passes;
      const correctas = passes.filter((p) => p.verdict === 'correcta');
      assert.ok(correctas.length >= 2, `${s.id}: validated con ${correctas.length} pases correcta`);
      assert.ok(new Set(correctas.map((p) => p.by)).size >= 2, `${s.id}: validated sin 2 by distintos`);

      const override = passes.find((p) => p.by === 'autor' && p.verdict === 'correcta' && p.override === true);
      const incorrectas = passes.filter((p) => p.verdict === 'incorrecta');
      if (incorrectas.length > 0) {
        assert.ok(override, `${s.id}: validated con ${incorrectas.length} pase(s) incorrecta y SIN entry de override del autor`);
        assert.ok(
          Array.isArray(override.concerns) && override.concerns.some((c) => c.trim().length > 0),
          `${s.id}: el override del autor no documenta por que se resolvio el disenso`
        );
        assert.ok(correctas.some((p) => p.by !== 'autor'), `${s.id}: validated por override sin ningun pase correcta de un modelo`);
      }
    }
  });

  test('los DOS slots de ronda EXTRA llevan un pase deepseek cuando pasan a validated (D-43-20)', () => {
    // La ronda EXTRA cubre 7 de las 18 variantes: el participio passato completo
    // (el par invariable-frente-a-concordado que SC-4 exige literalmente) y el
    // infinito passato completo (el CUARTO MAGNET). Los otros cuatro slots NO la
    // llevan: su riesgo es de redaccion de encaje y se controla con los gates de
    // los bloques 3, 5 y 10, no con presupuesto de quorum.
    assert.deepEqual(
      [...EXTRA_ROUND_SLOTS].sort(),
      [INF_PASS, PART_PASS].sort(),
      'D-43-20: la ronda EXTRA cubre exactamente el participio passato y el infinito passato, ni uno mas ni uno menos'
    );
    for (const id of EXTRA_ROUND_SLOTS) {
      const s = byId(id);
      if (s.validation.status !== 'validated') continue;
      const bys = s.validation.passes.map((p) => String(p.by || '').toLowerCase());
      assert.ok(
        bys.some((b) => b.startsWith('deepseek')),
        `D-43-20: ${id} esta validated sin la ronda EXTRA obligatoria (ningun by empieza por deepseek): ${bys.join(', ')}`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 13. Registro de la categoria (D-43-22, SC-5)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — registro de la categoria (D-43-22, SC-5)', () => {
  // Red de regresion del registro: la entrada de content/categories.json no es
  // cosmetica. Es prerequisito de SCHEMA (schema-validator.js exige que todo
  // categoryIds referencie una categoria conocida) Y es lo que hace que la fila
  // aparezca en home, picker, Repaso y Examen, porque categoriesForDisplay itera
  // content.categories. Sin ella el fichero de contenido queda invalido en disco.
  const entradas = CATEGORIES.categories;

  test('existe la entrada fare-indefiniti con las 4 claves exactas, order 18 y origen ia-quorum', () => {
    const cat = entradas.find((c) => c.id === SLUG);
    assert.ok(cat, `D-43-22: no existe la entrada ${SLUG}`);
    assert.deepEqual(Object.keys(cat).sort(), ['id', 'name', 'order', 'origen'], 'D-43-22: key set de la entrada');
    assert.equal(cat.order, 18, 'D-43-22: order documental');
    assert.equal(cat.origen, 'ia-quorum', 'D-43-22: origen (PROV-01)');
    assert.ok(cat.name.trim().length > 0, 'D-43-22: name no vacio');
  });

  test('ocupa en el array la posicion que dice su order, que es el orden de display', () => {
    // WR-05: se DERIVA en vez de codificar el indice a mano.
    const cat = entradas.find((c) => c.id === SLUG);
    assert.equal(
      entradas.indexOf(cat),
      cat.order - 1,
      `D-43-22: el array define el display (indice = order - 1); order ${cat.order} pide indice ${cat.order - 1}`
    );
  });

  test('categories.json: orders unicos, contiguos desde 1, y array ordenado por order', () => {
    assert.deepEqual(
      entradas.map((c) => c.order),
      entradas.map((_, i) => i + 1),
      'SC-5: content/categories.json define el display por posicion de array; order tiene que ir 1..n en ese mismo orden'
    );
  });

  test('fare-indicativo y fare-indefiniti son DOS entradas distintas pese a compartir el prefijo fare-ind (D-40-03)', () => {
    // SC-5: son dos unidades de reset SEPARADAS, no una fusion. Y el agravante de
    // esta categoria: una comprobacion de prefijo truncada a la parte compartida
    // cruzaria las dos y dejaria el progreso del autor huerfano en silencio.
    const conPrefijo = entradas.filter((c) => c.id.startsWith('fare-ind')).map((c) => c.id);
    assert.deepEqual(
      conPrefijo.sort(),
      ['fare-indefiniti', 'fare-indicativo'],
      'D-40-03: el prefijo fare-ind es COMPARTIDO; toda comprobacion declara el slug COMPLETO'
    );
  });

  test('todos los slots, paradigma y cruce, referencian el slug COMPLETO de la categoria, nunca una version truncada (D-40-03)', () => {
    for (const s of SLOTS) {
      assert.ok(
        Array.isArray(s.categoryIds) && s.categoryIds.includes(SLUG),
        `SC-5: ${s.id} no referencia la categoria ${SLUG}`
      );
      assert.ok(
        s.id.startsWith(`${SLUG}-`),
        `D-40-03: el id ${s.id} tiene que empezar por el slug COMPLETO "${SLUG}-"`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 14. Cruce multi-categoria -300 hacia `modali` (INT-03, D-44-01..D-44-04) — G3
// ───────────────────────────────────────────────────────────────────────────

describe('fare-indefiniti — invariantes del cruce multi-categoria -300 (INT-03, G3, D-44-04)', () => {
  // POR QUE ESTE BLOQUE EXISTE: el cruce sale de `allVariants()` porque los gates
  // de esta categoria son especificos del PARADIGMA NO PERSONAL — el POOL CERRADO
  // de las 10 formas, el conteo desigual 3/3/4/2/3/3, los tipos de contexto
  // sintactico, el 0-gloss del verbo—, y el cruce los viola por diseno: su key es
  // un MODAL CONJUGADO y no una forma no personal de `fare`. Salir de la base NO
  // es salir de cobertura: aqui se re-asertan los gates que siguen rigiendo sobre
  // el y se añaden los predicados de G3, que es el mas delicado de la fase.

  // El conjunto CERRADO de marcadores de complemento desambiguador de G3. `devo`,
  // `posso` y `voglio` son INTERCAMBIABLES en una frase generica, asi que cada
  // prompt necesita un complemento explicito que EXCLUYA dos de los tres dejando
  // solo obligacion, permiso o voluntad. Es el analogo exacto del vocativo de
  // D-43-05, que desambigua el destinatario. Se declara como constante para que
  // el gate sea MECANICO y no un juicio a ojo: sin lista cerrada, «el complemento
  // esta ahi» es una opinion, y lo que hay en juego es que el marco flojo no
  // produce un ejercicio mediocre sino tres respuestas defendibles, `disputed`
  // sticky y el reset de `fare-indefiniti` y `modali` a la vez por la cascada D-54.
  const COMPLEMENTOS_QUE_EXCLUYEN = [
    'altrimenti',  // consecuencia negativa -> obligacion; excluye permiso y voluntad
    'permesso',    // autorizacion explicita -> permiso; excluye obligacion y voluntad
    'desiderio',   // deseo explicito -> voluntad; excluye obligacion y permiso
  ];

  // Los 3 modales del paradigma de `modali`, por raiz. El pool de un cruce hacia
  // `modali` son formas conjugadas de estos y nada mas.
  const MODAL_STEM_RE = /^(dev|dov|dobb|poss|pu|pot|vogl|vuo|vol)/i;

  // El eje de variante de ESTA categoria es el contexto sintactico y no la
  // persona, asi que el fichero no tenia matcher de pronombre sujeto. El cruce si
  // lo necesita: su key es un modal CONJUGADO, asi que la persona tiene que
  // quedar fijada por un sujeto explicito (D-44-04) y las 3 variantes muestrean
  // 3 personas distintas (D-44-03). Vive dentro de este bloque a proposito: no es
  // una constante de la categoria, es una del cruce.
  const PRONOUN_RE = /\b(io|tu|lui|lei|noi|voi|loro)\b/gi;

  // EL SUJETO DEL HUECO ES EL ULTIMO PRONOMBRE ANTES DEL HUECO, NUNCA EL PRIMERO
  // DEL PROMPT (CR-02, code review de Phase 44). Clonado del hermano
  // `tests/content-fare-indicativo.test.js`, donde este mismo defecto se cerro y
  // aqui no. Tomar el primer pronombre del prompt entero mide el sujeto de la
  // clausula de CONTEXTO en cuanto una variante lleve dos pronombres: hoy los 3
  // prompts del cruce llevan exactamente uno, asi que el resultado es identico y el
  // gate estaba verde POR CASUALIDAD, no por construccion. La casualidad no es una
  // garantia, y el molde de este cruce invita a la segunda clausula (`perché il
  // museo dà il permesso`, `nessuno ce lo ha chiesto`).
  const personaDelHueco = (prompt) => {
    const antes = prompt.split('___')[0];
    const hits = antes.match(PRONOUN_RE) || [];
    return hits.length ? hits[hits.length - 1].toLowerCase() : '';
  };

  // LA FRONTERA DEL GLOSS DE ESTE CRUCE (G-44-3-WR03, R1, G3, D-44-04).
  //
  // El `notes` del fichero la declara: **el gloss NO traduce el modal**; glosa el
  // COMPLEMENTO que desambigua la intencion. Lo que faltaba no era la decision,
  // era el predicado mecanico que la hace incumplible — el 0-gloss de la categoria
  // itera los slots BASE y este cruce no esta ahi. Aqui el hueco es el MODAL
  // CONJUGADO, asi que un gloss con `tengo que`, `puedo` o `quiero` entrega
  // exactamente la casilla que el cruce pregunta: leak R1, tres respuestas
  // defendibles, `disputed` sticky y por la cascada D-54 el reset de
  // `fare-indefiniti` Y `modali` a la vez.
  //
  // POR QUE ESTA LISTA NEGRA NO ES LA DE `fare-indicativo-300`, que gobierna el
  // auxiliar castellano `haber`: alli el hueco ES el auxiliar y un `he hecho` en el
  // gloss es el leak; AQUI el hueco es el modal y un compuesto con `haber` en el
  // gloss es LEGITIMO — el gloss real de la tercera variante contiene `nadie nos lo
  // ha pedido`. Aplicarle la lista del vecino pondria rojo contenido ya validado
  // por quorum, que es la misma clase de error que G-44-3-WR02 cierra en este
  // mismo plan. Cada cruce mira su propio espejo y no el del vecino.
  //
  // Se enumeran las formas conjugadas de los TRES modales que el cruce examina
  // —obligacion, permiso y voluntad— en su ortografia acentuada RAE y tambien sin
  // tilde por defensa, mas la perifrasis de obligacion. La perifrasis va como
  // BIGRAMA COMPLETO y NUNCA por su primera palabra suelta: el gloss real de la
  // primera variante contiene `no tengo elección`, que NO es la perifrasis, y
  // compararlo por `tengo` a secas pondria rojo contenido validado.
  const MODALES_ES = [
    // deber — obligacion
    'debo', 'debes', 'debe', 'debemos', 'debéis', 'debeis', 'deben',
    // poder — permiso
    'puedo', 'puedes', 'puede', 'podemos', 'podéis', 'podeis', 'pueden',
    // querer — voluntad
    'quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quereis', 'quieren',
    // la perifrasis de obligacion, SIEMPRE como bigrama
    'tengo que', 'tienes que', 'tiene que', 'tenemos que', 'tenéis que', 'teneis que', 'tienen que',
  ];
  const modalesEsEn = (gloss) => MODALES_ES.filter((f) => wordish(f).test(gloss));

  test('goldens de modalesEsEn: muerde los tres modales castellanos y la perifrasis (G-44-3-WR03)', () => {
    assert.deepEqual(modalesEsEn('tengo que hacer los deberes'), ['tengo que']);
    assert.deepEqual(modalesEsEn('puedo hacer una foto'), ['puedo']);
    assert.deepEqual(modalesEsEn('queremos hacer un pastel'), ['queremos']);
    assert.deepEqual(modalesEsEn('debemos hacer los deberes'), ['debemos']);
  });

  test('goldens de modalesEsEn: guardia de FALSO POSITIVO del contenido REAL — `no tengo elección` NO es la perifrasis de obligacion', () => {
    // Es el gloss de la primera variante del cruce, ya validado por quorum. La
    // perifrasis se compara como bigrama por esto exactamente: con `tengo` suelto
    // en la lista negra, esta linea seria roja y el arreglo siguiente seria
    // relajar el gate o —peor— tocar contenido validado.
    assert.deepEqual(
      modalesEsEn('es una obligación del colegio, no tengo elección; si no, saco mala nota'),
      []
    );
  });

  test('goldens de modalesEsEn: segundo guardia del contenido REAL — el compuesto con `haber` es LEGITIMO en este cruce', () => {
    // Es el gloss de la tercera variante. La frontera de ESTE cruce es el MODAL y
    // no el auxiliar: la lista negra de `haber` que gobierna
    // `fare-indicativo-300` NO se reutiliza aqui.
    assert.deepEqual(modalesEsEn('es un deseo nuestro, nadie nos lo ha pedido'), []);
  });

  test('WR-03 — el gloss del cruce CONSERVA su contenido y NO traduce el modal examinado (R1, G3)', () => {
    const variantes = byId('fare-indefiniti-300').variants;
    // NO-VACUIDAD primero, derivada del disco: sin esto un slot sin variantes
    // dejaria el bucle sin iteraciones y el gate pasaria en verde sin haber
    // mirado un solo prompt (T-44-04-01).
    assert.ok(
      variantes.length > 0,
      'G-44-3-WR03: fare-indefiniti-300 no tiene variantes que inspeccionar, asi que este gate estaria pasando sin mirar nada'
    );
    for (const [k, v] of variantes.entries()) {
      // PRIMERA CLAUSULA y en este orden: que el gloss EXISTE. Sin ella, borrar
      // el gloss dejaria la lista negra corriendo sobre una cadena vacia y el
      // gate certificaria en verde lo contrario de lo que dice (T-44-04-01).
      const abre = (v.prompt.match(/\(/g) || []).length;
      assert.equal(
        abre,
        1,
        `G-44-3-WR03: fare-indefiniti-300#${k} tiene ${abre} parentesis de apertura y necesita EXACTAMENTE 1 — el gloss de este cruce glosa el COMPLEMENTO y es legitimo: "${v.prompt}"`
      );
      const gloss = (v.prompt.match(/\(([^)]*)\)/) || [null, null])[1];
      assert.ok(
        gloss !== null && gloss.trim().length > 0,
        `G-44-3-WR03: fare-indefiniti-300#${k} se quedo sin contenido de gloss, asi que la lista negra de abajo estaria pasando sobre una cadena vacia: "${v.prompt}"`
      );
      // SEGUNDA CLAUSULA: la frontera del `notes`.
      const sucio = modalesEsEn(gloss);
      assert.deepEqual(
        sucio,
        [],
        `R1 / G3: fare-indefiniti-300#${k} traduce en el gloss el modal EXAMINADO (${sucio.join(', ')}) — es la casilla que el cruce pregunta, y por la cascada D-54 el fallo resetea fare-indefiniti Y modali a la vez: "${gloss}"`
      );
    }
  });

  test('el cruce en disco es EXACTAMENTE el declarado en CROSS_IDS', () => {
    assert.deepEqual(CROSS_SLOTS.map((s) => s.id), CROSS_IDS, 'D-44-05: la lista de cruces esta CERRADA');
    assert.ok(byId('fare-indefiniti-300'), 'INT-03: el cruce declarado no esta en disco');
  });

  test('3 variantes y 3 personas DISTINTAS con sujeto pronominal explicito (D-44-03)', () => {
    const s = byId('fare-indefiniti-300');
    assert.equal(s.variants.length, 3, 'D-44-03: 3 variantes, el volumen medio de los cruces del proyecto');
    // CR-02: por `personaDelHueco` y NO por el primer pronombre del prompt.
    const personas = s.variants.map((v) => personaDelHueco(v.prompt));
    assert.ok(personas.every((p) => p.length > 0), `D-44-04: una variante no lleva sujeto pronominal explicito ANTES del hueco: ${personas.join(', ')}`);
    assert.equal(new Set(personas).size, 3, `D-44-03: el cruce repite persona: ${personas.join(', ')}`);
  });

  test('categoryIds de longitud EXACTAMENTE 2 con la pareja congelada, y el slug vecino registrado (D-44-01)', () => {
    // La cascada D-54 resetea TODAS las categorias que nombra `categoryIds`, asi
    // que la pareja no es metadato: es el radio de daño del ejercicio. Y el slug
    // vecino tiene que estar REGISTRADO, porque `schema-validator.js` rechaza el
    // fichero entero si `categoryIds` referencia una categoria desconocida.
    const registradas = CATEGORIES.categories.map((c) => c.id);
    for (const s of CROSS_SLOTS) {
      assert.deepEqual(s.categoryIds, CROSS_PAIRS[s.id], `D-44-01: la pareja de categoryIds de ${s.id}`);
      assert.equal(s.categoryIds.length, 2, `D-44-01: ${s.id} debe cruzar EXACTAMENTE 2 categorias`);
      for (const cid of s.categoryIds) {
        assert.ok(registradas.includes(cid), `D-44-01: ${s.id} referencia la categoria ${cid}, que NO esta registrada en content/categories.json`);
      }
    }
  });

  test('el hueco ___ esta en los 3 prompts, con 4 options sin duplicados y correctIndex variable', () => {
    for (const { slot, v, k } of crossVariants()) {
      assert.ok(v.prompt.includes('___'), `${slot.id}#${k}: falta el hueco ___`);
      assert.equal(v.options.length, 4, `${slot.id}#${k}: 4 opciones`);
      assert.equal(new Set(v.options).size, 4, `${slot.id}#${k}: opciones sin duplicados internos`);
      assert.ok(
        Number.isInteger(v.correctIndex) && v.correctIndex >= 0 && v.correctIndex < 4,
        `${slot.id}#${k}: correctIndex fuera de rango: ${v.correctIndex}`
      );
    }
    for (const s of CROSS_SLOTS) {
      assert.ok(
        new Set(s.variants.map((v) => v.correctIndex)).size > 1,
        `${s.id}: correctIndex constante — el autor aprenderia la posicion y no la forma`
      );
    }
  });

  test('SCOPE-GATE de perifrasis por campo: el cruce no tiene excepcion, ni far fare ni causativo (D-41-06)', () => {
    for (const { slot, v, k } of crossVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('cada prompt del cruce lleva un objeto del conjunto CERRADO (D-41-06)', () => {
    // La excepcion enumerada de D-43-18 (`facente funzione`) es LOCAL al slot de
    // participio presente y NO se extiende al cruce.
    for (const { slot, v, k } of crossVariants()) {
      assert.ok(
        // CR-04: `wordish` y no `includes` — `soprattutto` contiene `tutto`.
        OBJECTS.some((o) => wordish(o).test(v.prompt)),
        `D-41-06: ${slot.id}#${k} no usa ningun objeto del conjunto cerrado: "${v.prompt}"`
      );
    }
  });

  test('ninguna option ni prompt del cruce lleva una forma de la blacklist de atestiguadas (D-43-17)', () => {
    for (const { slot, v, k } of crossVariants()) {
      const sucio = [];
      for (const texto of [v.prompt, ...v.options]) {
        for (const f of BLACKLIST) if (wordish(f).test(texto)) sucio.push(`${f} en "${texto}"`);
      }
      assert.deepEqual(sucio, [], `D-43-17: ${slot.id}#${k} ofrece o menciona una forma atestiguada: ${sucio.join(', ')}`);
    }
  });

  test('G3 — el infinitivo fare va ESCRITO en los 3 prompts y ninguna option contiene una forma de fare (D-44-02)', () => {
    // Es la DIVERGENCIA OBLIGATORIA respecto al molde `modali-300`, que si mete la
    // forma conjugada del verbo GOBERNADO (`parlo`, `prendiamo`, `dormi`) como
    // distractora: clonarlo literalmente pondria un `fare` en `options`, y aqui el
    // hueco es el MODAL. Se prohibe la inicial f- entera y no una lista de formas,
    // porque toda forma de `fare` empieza por f- y en un pool de modales
    // conjugados no hay ninguna palabra legitima con esa inicial.
    for (const [k, v] of byId('fare-indefiniti-300').variants.entries()) {
      assert.match(v.prompt, /(^|\W)fare(\W|$)/, `G3: #${k} no trae escrito el infinitivo fare como contexto: "${v.prompt}"`);
      const sucio = v.options.filter((o) => o.split(/\s+/).some((w) => /^f/i.test(w)));
      assert.deepEqual(sucio, [], `G3: #${k} mete una forma de fare en options: ${sucio.join(' | ')} — el hueco es el modal`);
    }
  });

  test('G3 — las 4 options de cada variante son formas conjugadas de un MODAL y nada mas (D-44-04)', () => {
    for (const [k, v] of byId('fare-indefiniti-300').variants.entries()) {
      const sucio = v.options.filter((o) => !MODAL_STEM_RE.test(o) || o.includes(' '));
      assert.deepEqual(sucio, [], `G3: #${k} ofrece una option que no es un modal conjugado de una palabra: ${sucio.join(' | ')}`);
    }
  });

  test('G3 — cada prompt lleva un COMPLEMENTO del conjunto cerrado que EXCLUYE dos de los tres modales (D-44-04)', () => {
    // El gate mas importante del cruce. Sin complemento explicito, `devo`, `posso`
    // y `voglio` son las tres defendibles en la misma frase, la variante tiene tres
    // respuestas correctas, el quorum la marca `disputed`, `disputed` es STICKY y
    // por la cascada D-54 el fallo resetea `fare-indefiniti` Y `modali` enteras. El
    // gloss ES por si solo NO basta como red: es exactamente el punto donde el
    // molde `modali-300` se queda corto, porque usa marcos genericos.
    for (const [k, v] of byId('fare-indefiniti-300').variants.entries()) {
      const hits = COMPLEMENTOS_QUE_EXCLUYEN.filter((m) => v.prompt.toLowerCase().includes(m));
      assert.equal(
        hits.length,
        1,
        `G3: #${k} lleva ${hits.length} marcadores de complemento desambiguador (${hits.join(', ')}) y necesita EXACTAMENTE 1: "${v.prompt}"`
      );
    }
    const usados = byId('fare-indefiniti-300').variants.map(
      (v) => COMPLEMENTOS_QUE_EXCLUYEN.find((m) => v.prompt.toLowerCase().includes(m))
    );
    assert.equal(
      new Set(usados).size,
      3,
      `G3: las 3 variantes tienen que apuntar a los TRES modales distintos, y apuntan a ${usados.join(', ')}`
    );
  });

  // CR-02 (code review de Phase 44) — EL GATE QUE FALTABA, Y ES EL MAS IMPORTANTE
  // DEL CRUCE.
  //
  // El hermano `tests/content-fare-indicativo.test.js` cerro exactamente este
  // agujero para SUS cruces y dejo escrito que «es el gate mas importante de los
  // cruces». El bloque 14 de este fichero nunca recibio la contraparte: sus doce
  // gates comprueban que las options son modales conjugados, que hay 4 distintas,
  // que `correctIndex` esta en rango y no es constante, y que hay exactamente un
  // complemento desambiguador — pero NADA ataba la KEY ni al sujeto ni al
  // complemento. Reproducido: mover la variante 1 de `correctIndex: 2` (`puoi`) a
  // `correctIndex: 3` (`possono`) —persona equivocada Y, por tanto, un ejercicio que
  // ensena `tu … possono`— dejaba la suite entera en verde.
  //
  // TIENE QUE MIRAR LOS DOS EJES A LA VEZ, porque ninguno de los dos aisla la
  // respuesta: en la variante 0 el sujeto es `io` y `devo` y `posso` son las dos de
  // 1sg, asi que la persona sola no basta; y el complemento solo fija el LEMA, no la
  // persona. La conjuncion de los dos es lo que hace la key unica, y la tercera
  // clausula lo comprueba por el otro lado: ninguna distractora puede satisfacer las
  // dos cosas, o habria dos respuestas defendibles y el quorum la marcaria
  // `disputed` —sticky— arrastrando por la cascada D-54 el reset de
  // `fare-indefiniti` Y `modali` a la vez.
  //
  // POR QUE UNA TABLA CERRADA DE FORMAS Y NO UN PREFIJO DE RAIZ. La forma tentadora
  // —mapear cada complemento a una raiz (`permesso` -> `poss-`) y pedir
  // `key.startsWith(raiz)`— es un FALSO ROJO sobre el contenido REAL, y un falso rojo
  // es un defecto igual que un falso verde: la key de la variante 1 es `puoi`, que NO
  // empieza por `poss-`. Los tres modales italianos son IRREGULARES y alternan raiz
  // dentro del propio paradigma (`posso`/`puoi`/`può`/`potete`,
  // `devo`/`dobbiamo`/`dovete`, `voglio`/`vuoi`/`volete`), asi que ningun prefijo
  // identifica el lema. De las 18 formas legitimas, el prefijo se equivoca en 4
  // (`dobbiamo`, `potete`, `volete`, `può`) mas la `puoi` que ya esta en disco. Por
  // eso el mapeo es una tabla EXHAUSTIVA forma -> {persona, lema}: 18 entradas, cero
  // inferencia morfologica.
  const MODAL_FORMS = {
    // dovere — obligacion
    devo: { persona: 'io', lema: 'dovere' },
    devi: { persona: 'tu', lema: 'dovere' },
    deve: { persona: 'lui', lema: 'dovere' },
    dobbiamo: { persona: 'noi', lema: 'dovere' },
    dovete: { persona: 'voi', lema: 'dovere' },
    devono: { persona: 'loro', lema: 'dovere' },
    // potere — permiso
    posso: { persona: 'io', lema: 'potere' },
    puoi: { persona: 'tu', lema: 'potere' },
    può: { persona: 'lui', lema: 'potere' },
    possiamo: { persona: 'noi', lema: 'potere' },
    potete: { persona: 'voi', lema: 'potere' },
    possono: { persona: 'loro', lema: 'potere' },
    // volere — voluntad
    voglio: { persona: 'io', lema: 'volere' },
    vuoi: { persona: 'tu', lema: 'volere' },
    vuole: { persona: 'lui', lema: 'volere' },
    vogliamo: { persona: 'noi', lema: 'volere' },
    volete: { persona: 'voi', lema: 'volere' },
    vogliono: { persona: 'loro', lema: 'volere' },
  };

  // `lui` y `lei` son la MISMA persona gramatical: la 3ª singular.
  const mismaPersona = (a, b) => (a === 'lei' ? 'lui' : a) === (b === 'lei' ? 'lui' : b);

  // Que lema EXIGE cada complemento del conjunto cerrado. Es la otra mitad del
  // contrato que `COMPLEMENTOS_QUE_EXCLUYEN` ya declara en prosa: si `altrimenti`
  // «excluye permiso y voluntad», entonces exige `dovere`.
  const LEMA_DEL_COMPLEMENTO = {
    altrimenti: 'dovere',
    permesso: 'potere',
    desiderio: 'volere',
  };

  test('goldens de MODAL_FORMS: la tabla cubre las 18 formas de los 3 modales y el prefijo de raiz NO habria servido (CR-02)', () => {
    assert.equal(Object.keys(MODAL_FORMS).length, 18, 'CR-02: 3 modales x 6 personas, tabla CERRADA');
    // Las 3 raices por lema, para que se vea que la irregularidad no es teorica.
    assert.deepEqual(
      ['devo', 'dobbiamo', 'dovete'].map((f) => MODAL_FORMS[f].lema),
      ['dovere', 'dovere', 'dovere']
    );
    assert.deepEqual(
      ['posso', 'puoi', 'può', 'potete'].map((f) => MODAL_FORMS[f].lema),
      ['potere', 'potere', 'potere', 'potere']
    );
    assert.deepEqual(
      ['voglio', 'vuoi', 'volete'].map((f) => MODAL_FORMS[f].lema),
      ['volere', 'volere', 'volere']
    );
    // Y el golden que congela por que la tabla existe: `puoi` es la key REAL de la
    // variante 1 y no empieza por la raiz `poss-` que un mapeo por prefijo pediria.
    assert.equal('puoi'.startsWith('poss'), false, 'CR-02: por esto el mapeo NO puede ser por prefijo de raiz');
    assert.equal(MODAL_FORMS.puoi.lema, 'potere');
    // Cada lema aparece 6 veces y cada persona 3, o la tabla tiene un hueco.
    for (const lema of ['dovere', 'potere', 'volere']) {
      assert.equal(Object.values(MODAL_FORMS).filter((m) => m.lema === lema).length, 6, `CR-02: faltan formas de ${lema}`);
    }
    for (const persona of ['io', 'tu', 'lui', 'noi', 'voi', 'loro']) {
      assert.equal(Object.values(MODAL_FORMS).filter((m) => m.persona === persona).length, 3, `CR-02: falta una persona ${persona}`);
    }
  });

  test('CR-02 — la KEY concuerda con la persona del sujeto DEL HUECO y con el modal que el complemento EXIGE (D-44-02, D-44-04)', () => {
    const variantes = byId('fare-indefiniti-300').variants;
    // NO-VACUIDAD primero: sin variantes este gate no mira nada y pasaria en verde
    // sin haber comprobado una sola key (T-44-04-01).
    assert.ok(
      variantes.length > 0,
      'CR-02: fare-indefiniti-300 no tiene variantes, asi que este gate estaria pasando sin mirar ninguna key'
    );
    for (const [k, v] of variantes.entries()) {
      const key = v.options[v.correctIndex];
      const info = MODAL_FORMS[key];
      assert.ok(
        info,
        `CR-02: #${k} tiene la key "${key}", que no es ninguna de las 18 formas de dovere/potere/volere: "${v.prompt}"`
      );

      // EJE 1 — la persona del sujeto del hueco.
      const p = personaDelHueco(v.prompt);
      assert.ok(
        mismaPersona(info.persona, p),
        `CR-02: #${k} tiene sujeto "${p}" y su key "${key}" es de la persona "${info.persona}": "${v.prompt}"`
      );

      // EJE 2 — el lema que exige el complemento desambiguador. Por `wordish`, que es
      // el matcher que la cabecera de este fichero manda usar para la presencia.
      const compl = COMPLEMENTOS_QUE_EXCLUYEN.find((m) => wordish(m).test(v.prompt));
      assert.ok(compl, `CR-02: #${k} no lleva complemento desambiguador, asi que el eje del modal no se puede medir: "${v.prompt}"`);
      assert.equal(
        info.lema,
        LEMA_DEL_COMPLEMENTO[compl],
        `CR-02: #${k} lleva el complemento "${compl}", que exige ${LEMA_DEL_COMPLEMENTO[compl]}, y su key "${key}" es de ${info.lema}: "${v.prompt}"`
      );

      // EJE 3 — y ninguna DISTRACTORA satisface los dos ejes a la vez, o habria dos
      // respuestas defendibles y el quorum marcaria la variante `disputed`.
      const tambienDefendibles = v.options.filter(
        (o) =>
          o !== key &&
          MODAL_FORMS[o] &&
          mismaPersona(MODAL_FORMS[o].persona, p) &&
          MODAL_FORMS[o].lema === LEMA_DEL_COMPLEMENTO[compl]
      );
      assert.deepEqual(
        tambienDefendibles,
        [],
        `CR-02: #${k} tiene una segunda respuesta defendible (misma persona Y mismo modal que la key): ${tambienDefendibles.join(', ')}`
      );
    }
  });
});
