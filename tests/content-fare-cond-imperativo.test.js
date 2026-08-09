// tests/content-fare-cond-imperativo.test.js
//
// v2.0 Phase 43 (CI-01..CI-03) — invariantes PERMANENTES de la categoria
// `fare-cond-imperativo`: 2 slots de condizionale (presente y passato) x 6
// personas, mas un 3er slot de imperativo presente cuyo paradigma tiene CINCO
// casillas y no seis. 6 + 6 + 5 = 17 variantes. Se ejecuta:
//
//     node --test tests/content-fare-cond-imperativo.test.js
//
// y entra tambien en el glob de la suite completa:
//
//     node --test tests/*.test.js
//
// ADVERTENCIA DE ESCANEO (heredada de 41-01 y de 42-01, no negociable): todos
// los escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]`, sobre el JSON parseado — y
// NUNCA sobre el fichero completo, ni sobre `notes`, ni sobre `explanation`. El
// `notes` de la categoria NOMBRA a proposito cada forma de la blacklist y cada
// perifrasis excluida, con su audit trail, y las explanations TIENEN que nombrar
// los dos imperativos vivos vetados y las formas con clitico porque D-43-07 y
// D-43-19 lo exigen; un grep de fichero entero se auto-invalidaria y un escaneo
// que incluyera `explanation` pondria rojo justo el texto que el requisito pide.
// En `options` la coincidencia base es EXACTA; en `prompt` va por palabra
// Unicode.
//
// LAS CUATRO DESVIACIONES DELIBERADAS respecto del analogo
// `tests/content-fare-congiuntivo.test.js`, declaradas aqui para que quien
// compare los dos ficheros no las lea como descuidos:
//
//   1. D-43-03 / D-43-08 — el conteo de variantes por slot es DESIGUAL, asi que
//      el `for (const id of IDS) equal(byId(id).variants.length, 6)` del analogo
//      NO se clona: se sustituye por la tabla EXPECTED_VARIANTS con 6, 6 y 5. Y
//      el 5 del slot de imperativo se congela como invariante PERMANENTE de la
//      lengua (el italiano no tiene 1a persona del singular en ese modo, porque
//      no se dan ordenes a uno mismo), NO como dato de conteo ajustable: si
//      algun dia el total del milestone no cuadra, el numero que se revisa es el
//      de otro slot, nunca este cinco.
//   2. D-43-04 — la entrada corta de la BLACKLIST usa un MATCHER PROPIO con
//      lookahead negativo del apostrofe ASCII. El `wordish` heredado trata el
//      apostrofe como caracter no-letra, asi que hace match DENTRO de la key
//      apostrofada de la 2a persona del singular y pondria ROJA la variante
//      CORRECTA. `matcherDe` resuelve la trampa en vez de evitarla, y el bloque 6
//      lo sustancia con tres asserts: que la trampa existe con el matcher
//      heredado, que el hermano no cae en ella, y que el hermano SIGUE mordiendo
//      la forma corta suelta (o sea, que no esta simplemente desactivado).
//   3. D-43-04 — el escaneo EN POSITIVO del `notes` no clona ciegamente el
//      idioma heredado de envolver la forma entre apostrofes. La key apostrofada
//      NO es elemento de BLACKLIST (es la key, no una forma prohibida), y su
//      presencia documentada en el `notes` se comprueba con el literal
//      distintivo `la forma fa'`: envolver entre comillas simples una forma que
//      ya termina en apostrofe es ilegible y fragil.
//   4. D-43-07 / D-43-19 — el escaneo de blacklist NO TOCA `explanation`. La
//      explanation del imperativo tiene que NOMBRAR los dos imperativos vivos
//      vetados y las formas con clitico: sobre ella hay un escaneo en POSITIVO
//      que exige justo lo contrario que el de ausencia. Declarado para que un
//      re-pase futuro no "arregle" el escaneo ampliandolo.
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
  readFileSync(new URL('../content/exercises/fare-cond-imperativo.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLUG = 'fare-cond-imperativo';
const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];
const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));
const allVariants = () => SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));

// Matcher con frontera de PALABRA UNICODE. `\b` de JS es ASCII-only y aqui hay
// prompts con `è` y con vocativos que empiezan oracion, asi que se construye a
// mano con \p{L}. Lleva `iu` y no solo `u` por WR-10: sin la `i`, la posicion
// donde una forma prohibida aparece de verdad —INICIO DE ORACION— era justo la
// que no se veia.
const wordish = (s) =>
  new RegExp(`(^|[^\\p{L}])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu');

// DESVIACION 2 — EL MATCHER HERMANO, y por que existe.
//
// El apostrofe ASCII es `[^\p{L}]`, asi que `wordish('fa')` cierra palabra
// CONTRA el apostrofe y hace match dentro de la key de la 2a persona del
// singular. Con el matcher heredado, el gate de blacklist pondria roja la unica
// variante cuya respuesta es la forma canonica — es decir, le diria al autor que
// su respuesta correcta es un error, que es el dano exacto que esta categoria
// existe para evitar. El hermano anade un lookahead negativo del apostrofe y se
// usa SOLO para esa entrada; para el resto de la blacklist delega en `wordish`,
// porque ninguna otra forma de la lista termina en apostrofe.
const APOSTROFE = String.fromCharCode(39);
const matcherDe = (f) =>
  f === 'fa'
    ? new RegExp(`(^|[^\\p{L}])fa(?!${APOSTROFE})([^\\p{L}]|$)`, 'iu')
    : wordish(f);

// WR-07 / WR-08 / WR-11, clonados del analogo — LA CLAUSULA QUE GOBIERNA EL
// HUECO. Dos cortes toscos, no analisis sintactico, y los dos fallan cerrado.
// CORTE_FUERTE es solo puntuacion y es la unidad para contar OBJETOS (el objeto
// de la principal es legitimo tras la coma); CORTE_DE_CLAUSULA anade coordinante
// y `che` subordinante, las dos formas de abrir predicacion sin puntuacion de
// por medio. Aqui `gobiernaElHueco` es lo que blinda D-43-11: el ancla de
// futuro-nel-passato tiene que GOBERNAR la clausula del hueco, no solo aparecer
// en algun punto del prompt.
const CORTE_FUERTE = /[,;.:—–]+/u;
const CORTE_DE_CLAUSULA = /[,;.:—–]+|(?:^|[^\p{L}])(?:e|ed|o|od|ma|però|mentre|che)(?=[^\p{L}]|$)/u;
const segmentoDelHueco = (p, corte) => p.split(corte).find((s) => s.includes('___')) || '';

const gobiernaElHueco = (p, lit) => {
  const segs = p.split(CORTE_DE_CLAUSULA);
  const i = segs.findIndex((s) => s.includes('___'));
  if (i < 0) return false;
  if (segs[i].includes(lit)) return true;
  return [segs[i - 1], segs[i + 1]].some(
    (s) => s !== undefined && s.includes(lit) && s.replace(lit, '').trim() === ''
  );
};

// ───────────────────────────────────────────────────────────────────────────
// Constantes de datos: la especificacion EJECUTABLE de la categoria.
// ───────────────────────────────────────────────────────────────────────────

const PRESENTE = 'fare-cond-imperativo-cond-presente';
const PASSATO = 'fare-cond-imperativo-cond-passato';
const IMPERATIVO = 'fare-cond-imperativo-imperativo';

// Los 3 paradigmas. Los dos de condizionale por persona (io, tu, lui/lei, noi,
// voi, loro); el del imperativo por DESTINATARIO (tu, Lei, noi, voi, Loro), que
// son cinco y no seis.
const COND_PRES = ['farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero'];
const COND_PASS = ['avrei fatto', 'avresti fatto', 'avrebbe fatto', 'avremmo fatto', 'avreste fatto', 'avrebbero fatto'];
const IMPERATIVO_5 = ["fa'", 'faccia', 'facciamo', 'fate', 'facciano'];

const CANON = {
  [PRESENTE]: COND_PRES,
  [PASSATO]: COND_PASS,
  [IMPERATIVO]: IMPERATIVO_5,
};
const IDS = Object.keys(CANON);
const COND_SLOTS = [PRESENTE, PASSATO];

// DESVIACION 1 — el conteo es DESIGUAL. El 5 del imperativo es D-43-08 y es
// PERMANENTE; los dos 6 son el eje de persona completo.
const EXPECTED_VARIANTS = {
  [PRESENTE]: 6,
  [PASSATO]: 6,
  [IMPERATIVO]: 5,
};
const TOTAL_VARIANTES = 17;

// FUTURO — la familia de distractoras del slot 1 (D-43-09). Comparte con el
// condizionale la raiz contracta, asi que es el error real y no ruido.
const FUTURO = ['farò', 'farai', 'farà', 'faremo', 'farete', 'faranno'];

// AUX_SWAP — la familia del slot 2: el mismo participio con el auxiliar en otro
// tiempo. Futuro anteriore y trapassato prossimo, verbatim de fare-indicativo.
const AUX_SWAP = [
  'avrò fatto', 'avrai fatto', 'avrà fatto', 'avremo fatto', 'avrete fatto', 'avranno fatto',
  'avevo fatto', 'avevi fatto', 'aveva fatto', 'avevamo fatto', 'avevate fatto', 'avevano fatto',
];

// REAL_FORMS — TODAS las formas reales de `fare` en cualquier modo y tiempo.
// Contra este set se comprueba que una distractora «inexistente» lo sea DE
// VERDAD: sin el, una forma atestiguada de otro modo contaria como inventada.
const REAL_FORMS = new Set([
  ...COND_PRES, ...COND_PASS, ...IMPERATIVO_5, ...FUTURO, ...AUX_SWAP,
  'faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno',
  'facevo', 'facevi', 'faceva', 'facevamo', 'facevate', 'facevano',
  'feci', 'facesti', 'fece', 'facemmo', 'faceste', 'fecero',
  'ho fatto', 'hai fatto', 'ha fatto', 'abbiamo fatto', 'avete fatto', 'hanno fatto',
  'ebbi fatto', 'avesti fatto', 'ebbe fatto', 'avemmo fatto', 'aveste fatto', 'ebbero fatto',
  'faccia', 'facciate', 'facciano', 'facessi', 'facesse', 'facessimo', 'facessero',
  'abbia fatto', 'abbiate fatto', 'abbiano fatto',
  'avessi fatto', 'avesse fatto', 'avessimo fatto', 'avessero fatto',
  'fare', 'aver fatto', 'avere fatto', 'facendo', 'avendo fatto', 'facente',
  'fatto', 'fatta', 'fatti', 'fatte',
]);

// BLACKLIST (D-43-04, D-43-07, heredada de D-41-08 y D-42-11). Ojo: la key
// apostrofada NO esta aqui — es la key, no una forma prohibida (desviacion 3).
// Las dos primeras son los imperativos vivos vetados; las cuatro siguientes las
// formas con clitico; el resto, las arcaicas heredadas.
const BLACKLIST = [
  'fai', 'fa',
  'fallo', 'fammi', 'fatelo', 'facci',
  'facciam', 'facce',
  'fo', 'fé', 'fenno', 'facea', 'fan', 'face', 'faci',
  'fei', 'festi', 'femmo', 'feste', 'fero', 'feciono',
  'fici', 'facisti', 'facette', 'facettero', 'facero',
];

// NO_PERSONALI — las formas no personales de `fare`. En esta categoria son
// AUSENCIA: son las keys del plan 43-02, y este gate es la frontera entre las
// dos categorias. Coincidencia EXACTA en `options` y nada mas: `avrei fare` es
// una distractora legitima de esta categoria y no la forma no personal suelta.
const NO_PERSONALI = [
  'fare', 'aver fatto', 'avere fatto', 'facendo', 'avendo fatto',
  'facente', 'facenti', 'fatta', 'fatti', 'fatte',
];

// DEITTICI_FUTURO — el conjunto CERRADO prohibido en los prompts del slot 1. Con
// el futuro semplice como distractora en las 6, un marcador de futuro lo haria
// defendible y abriria la doble respuesta.
const DEITTICI_FUTURO = [
  'domani', 'dopodomani', 'stasera', 'presto',
  'fra poco', 'la prossima settimana', "l'anno prossimo", 'il mese prossimo',
];

// WR-03 (revision de codigo del 2026-08-07): la lista de literales de arriba
// dejaba fuera FAMILIAS ENTERAS que apuntan al futuro con la misma fuerza y que
// harian igual de defendible la distractora de futuro — el complemento de
// termino (`entro venerdi`), el de distancia (`tra due giorni`), el comparativo
// (`piu tardi`) y el adjetivo pospuesto (`la settimana prossima`, que la lista
// solo cubria en DOS de sus combinaciones). Son abiertos por naturaleza, asi que
// van como PATRONES y no como literales: enumerar complementos no termina nunca.
//
// SIMETRIA QUE CONVIENE VER, porque es el mismo fenomeno con signo opuesto: en el
// slot 1 el adverbial prospectivo esta PROHIBIDO, porque haria defendible el
// futuro; en el slot 2 es OBLIGATORIO en las variantes con trapassato, porque es
// lo unico que excluye la lectura anterior (ver CR-01, bloque 8).
const DEITTICI_FUTURO_RE = [
  /(^|[^\p{L}])entro(?=[^\p{L}])/iu,
  /(^|[^\p{L}])(?:tra|fra)\s+\p{L}/iu,
  /(^|[^\p{L}])più\s+tardi(?=[^\p{L}]|$)/iu,
  /(^|[^\p{L}])prossim[oa](?=[^\p{L}]|$)/iu,
  /(^|[^\p{L}])(?:il\s+giorno|la\s+settimana|la\s+volta|il\s+mese|l'anno)\s+(?:dopo|seguente|successiv[ao])(?=[^\p{L}]|$)/iu,
];

// CR-01 (revision de codigo del 2026-08-07) — LA FAMILIA DE AUX-SWAP Y SU
// EXCLUSOR. El gate de ausencia de protasis del slot 2 neutraliza la distractora
// de condizionale PRESENTE, que es la que mira, y NINGUNA otra: con el trapassato
// prossimo de la misma persona en las 6 variantes, solo quedaban blindadas las 2
// que llevan cola adversativa. En las otras 4 la lectura anterior era defendible
// —y en dos de ellas era la lectura por defecto—, o sea DOS respuestas correctas
// y, por la cascada D-54, el reset de las 17 variantes.
//
// LA LECCION, para que nadie la repita: un gate de doble validez cubre la familia
// de distractoras que mira y ninguna otra. Cada familia necesita su exclusor.
const TRAPASSATO = [
  'avevo fatto', 'avevi fatto', 'aveva fatto', 'avevamo fatto', 'avevate fatto', 'avevano fatto',
];
// Los DOS exclusores admitidos, conjunto CERRADO. El adverbial prospectivo hace
// INCOHERENTE el trapassato (nada puede haberse hecho ya en un momento posterior
// al punto de referencia); la cola de no realizacion lo CONTRADICE (la accion no
// llego a ocurrir). El primero se exige por AMBITO, el segundo por presencia:
// una cola adversativa vive por definicion en otra clausula.
const AVVERBIALI_PROSPETTIVI = [
  'il giorno dopo', 'il giorno seguente', 'la settimana successiva', 'la settimana dopo',
  'la volta dopo', 'più tardi', 'poco dopo',
];
// QUORUM 2026-08-09 (Opus) — SEGUNDA CORRECCION DE ESTA MISMA FAMILIA. El conjunto
// admitia dos cosas que no son la misma: la cola que declara el evento CERRADO
// (`ma alla fine non è successo`) y la que enuncia un IMPEDIMENTO abierto
// (`ma non ho avuto tempo`, `ma non ho potuto`). Una cola de impedimento en
// pretérito perfecto se lee como presente perfecto —el asunto sigue pendiente— y
// bajo esa lectura la distractora de condizionale PRESENTE vuelve a ser
// defendible: `Io farei il lavoro volentieri, ma non ho avuto tempo` es italiano
// corriente. Solo el evento cerrado excluye la hipotesis en presente, porque un
// hecho que ya no puede ocurrir no admite hipotetizarlo ahora.
//
// NOTA DE HONESTIDAD, porque es el mismo error dos veces: CR-01 reviso la familia
// del aux-swap sobre estas dos variantes y las dio por buenas «porque ya tenian
// cola adversativa», sin revisar la OTRA familia sobre ellas — que es EXACTAMENTE
// la leccion que CR-01 declaraba. Un gate cubre la familia que mira y ninguna
// otra, y eso vale tambien para el gate que uno acaba de escribir.
const CODE_DI_NON_REALIZZAZIONE = ['ma alla fine non è successo'];

// Disparadores de condizionale del slot 1: conjunto CERRADO, uno por prompt.
//
// QUORUM 2026-08-09 (Sonnet) — las LOCUCIONES quedan RETIRADAS del conjunto. La de
// sustitucion (`Al posto tuo`) es DOBLEMENTE valida: ademas del sentido hipotetico
// de consejo, que es el que exige condizionale, tiene el de sustitucion LITERAL
// —ocupar el puesto de otro, como en `vado io al posto tuo`— y en esa lectura el
// futuro entra sin ninguna anomalia. Era la unica de las 6 variantes sin protasis
// explicita y la unica que dependia de que el lector eligiera la lectura
// idiomatica; las otras 5 excluyen el futuro por GRAMATICA.
//
// LA LECCION, que es la misma que la de CR-01 por otra puerta: un marco que
// excluye la distractora por IDIOMATISMO no es un gate, porque el idiomatismo
// admite excepciones y la gramatica no. Los 6 disparadores son ahora protasis con
// congiuntivo imperfetto — uniformidad DECLARADA, no falta de imaginacion: lo que
// tiene que variar entre las 6 es la PERSONA, que es el eje del slot.
const DISPARADORI = [
  'Se fosse necessario,', 'Se ci fosse più tempo,', 'Se non fosse così tardi,',
  'Se avessimo un forno,', 'Se ne avessi voglia,', 'Se potessi,', 'Se avessi tempo,',
  'Se fossi in te,',
];

// ANCLE_PASSATO — conjunto CERRADO de anclas del slot 2, en 3 grupos. El primero
// es el de futuro-nel-passato (D-43-11) y es el unico que ademas se comprueba
// por AMBITO. Se declara con su `head`, el ancla sin el `che` subordinante,
// porque CORTE_DE_CLAUSULA consume ese `che` al partir y `gobiernaElHueco`
// nunca veria el literal completo.
const ANCLE_FUTURO_NEL_PASSATO = [
  { lit: 'Ha detto che', head: 'Ha detto' },
  { lit: 'Mi ha promesso che', head: 'Mi ha promesso' },
  { lit: 'Sapevo che', head: 'Sapevo' },
  { lit: 'Era sicuro che', head: 'Era sicuro' },
  { lit: 'Aveva giurato che', head: 'Aveva giurato' },
];
// CR-01: el conjunto cerrado tenia un TERCER grupo, el de rumor o atenuacion en
// pasado (`Secondo il giornale`, `A quanto pare`), y se RETIRA. Es la unica de
// las tres familias de marco que no puede excluir la lectura anterior por ningun
// medio: la diceria lee igual de bien en condizionale passato y en trapassato,
// por naturaleza. Dejarlo con una nota de cuidado habria sido una invitacion a
// reintroducir el fallo, asi que sale del conjunto y un gate del bloque 8 congela
// que no vuelva un tercer grupo.
const ANCLE_PASSATO = [
  ...ANCLE_FUTURO_NEL_PASSATO.map((a) => a.lit),
  ...CODE_DI_NON_REALIZZAZIONE,
];

// MARCADORES — el conjunto CERRADO de los cinco marcadores de destinatario del
// slot 3 (D-43-05), en el orden de las variantes. Es el analogo funcional del
// pronombre sujeto explicito de D-41-07: con los dos imperativos vivos vetados,
// el UNICO desambiguador entre las cinco formas es a quien se le habla.
const MARCADORES = ['Marco,', 'Signor Rossi,', 'Dai, noi due', 'Bambini,', 'Signori,'];

// WR-10 (revision de codigo del 2026-08-07, adjudicado por el autor en el UAT) —
// EL REFUERZO DE REGISTRO, y la ASIMETRIA DELIBERADA entre las dos singulares.
//
// EL DEFECTO QUE ESTO ARREGLA: el gate de MARCADORES comprueba PRESENCIA de un
// vocativo del conjunto cerrado, no que ese vocativo DESAMBIGUE el registro. Las
// dos variantes PLURALES si recibieron refuerzo explicito (`noi due`, `Loro`);
// las dos SINGULARES no. Y no corren el mismo riesgo:
//
//   - `Signor Rossi,` — NO lleva refuerzo, y es DECISION ADJUDICADA, no olvido.
//     El titulo de cortesia mas apellido selecciona `Lei` de forma inequivoca en
//     italiano estandar moderno. El `voi` de cortesia hacia un solo destinatario
//     es meridional o arcaico y esta cubierto por RECONOCER, NO PRODUCIR;
//     `facciano` hacia una sola persona no es lectura. El titulo ES el refuerzo.
//   - `Marco,` — SI lo lleva. Un vocativo de NOMBRE PROPIO no fija nada por si
//     solo: en un entorno profesional italiano es corriente tratarse por el
//     nombre de pila y seguir usando el usted, asi que `Marco, faccia pure una
//     foto` es italiano real y la variante admitia DOS respuestas defendibles.
//     Es el modo de fallo de CR-01 en menor grado, y se cierra igual.
//
// El refuerzo fija el registro por CONCORDANCIA y nunca por glosa: el posesivo de
// 2a singular seria el de cortesia con mayuscula en el trato formal, asi que su
// presencia excluye esa lectura sin nombrar la persona ni la desinencia (R1). Es
// el pronombre sujeto explicito de D-41-07 aplicado al posesivo.
//
// SI SE IGUALA LA ASIMETRIA POR INERCIA, se pierde la adjudicacion: por eso la
// tabla declara la VIA de cada variante y no solo el literal.
// QUORUM 2026-08-09 (Opus Y Sonnet, por separado, mismo diagnostico) — EL SEGUNDO
// EJE DE AMBIGUEDAD DE ESTE SLOT, y el que reencuadra WR-10 entero.
//
// El vocativo y el refuerzo de registro cierran QUIEN es el destinatario y con que
// trato. Eso NO cierra el exhortativo de 1a plural, porque el exhortativo es
// INCLUSIVO: mete al hablante DENTRO del grupo del destinatario en vez de
// contraponerlo a el. Por construccion ningun vocativo puede excluirlo, por
// inequivoco que sea. Hay por tanto DOS ejes —el del TRATO y el de la INCLUSION—
// y hasta esta correccion solo estaba cerrado el primero:
//   `Signor Rossi, facciamo il lavoro con calma`  = invitacion normal
//   `Bambini, facciamo i compiti prima di cena!`  = la formula parental de siempre
//
// Lo unico que mata al inclusivo es EXCLUIR AL HABLANTE DE LA ACCION: una clausula
// posterior que lo muestra haciendo otra cosa mientras el destinatario hace la del
// hueco. Usa siempre otro verbo y un complemento ajeno a OBJECTS, para no meter un
// segundo objeto en la casilla ni un segundo uso del verbo examinado.
//
// La tabla declara `null` donde NO hace falta, y por que, para que la exencion sea
// visible en vez de estar escondida en la ausencia de un assert:
//   - variante de tu: no ofrece siquiera la forma de nosotros entre sus opciones
//   - variante de nosotros: la forma de nosotros ES su respuesta correcta
//   - variante de ustedes: se apoya en un mecanismo DISTINTO, la concordancia
//     verbal en 3a plural que ata el imperativo a ese destinatario. Es la unica de
//     las tres que descansa en un cierre y no en la ausencia del problema, asi que
//     queda marcada como EL PUNTO A VIGILAR si el quorum vuelve a senalar el slot.
const ESCLUSORE_DELL_INCLUSIVO = [
  null,                       // 0 tu     — `facciamo` no esta en sus options
  'io intanto',               // 1 Lei
  null,                       // 2 noi    — `facciamo` es la key
  'io intanto',               // 3 voi
  'come preferiscono Loro',   // 4 Loro   — cierre por concordancia verbal
];

const RINFORZO_DI_REGISTRO = [
  { lit: 'il tuo', via: 'possessivo di 2a singolare (WR-10: cierra el nombre propio)' },
  { lit: 'Signor Rossi', via: 'titolo di cortesia (adjudicado: NO lleva refuerzo anadido)' },
  { lit: 'noi due', via: 'soggetto inclusivo esplicito' },
  { lit: 'Bambini', via: 'vocativo di plurale informale' },
  { lit: 'Loro', via: 'pronome di cortesia con maiuscola' },
];

// SCOPE-GATE lexico HARD heredado de D-41-06 por D-43-22.
//
// WR-04 (revision de codigo del 2026-08-07): esta lista llevaba ademas el literal
// `causativo`, anadido «para cubrir fare + infinito mas alla de far fare», y se
// RETIRA. Es una palabra ESPANOLA de metalenguaje: no puede aparecer dentro de
// una frase italiana en ningun caso, asi que su cobertura real era CERO y el
// comentario prometia un gate que no existia. Un gate que promete mas de lo que
// da es peor que uno honesto.
//
// En su lugar se detecta el PATRON, que aqui si es detectable y con precision:
// en esta categoria la forma de `fare` ES el hueco, asi que un causativo se
// materializaria como el hueco seguido de un INFINITIVO (`___ fare i compiti`,
// `___ riparare il lavoro`). `far fare` se queda en PERIPHRASIS porque es el
// causativo ya lexicalizado, que si aparece como cadena literal.
const PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel', 'far fare'];
const CAUSATIVO_TRAS_HUECO = /___\s+\p{L}+(?:are|ere|ire)(?=[^\p{L}]|$)/u;
const OBJECTS = ['i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto'];

// D-41-07 / D-43-22 — el pronombre sujeto por persona en los 12 prompts de
// condizionale. La 3a del singular admite las dos formas.
const PRONOUNS = [['io'], ['tu'], ['lui', 'lei'], ['noi'], ['voi'], ['loro']];
const PERSON_CODES = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'];

// D-43-20 — la ronda EXTRA de deepseek cubre las 5 variantes del imperativo, que
// es el bloque de doble validez de esta categoria, y se agrega a nivel de SLOT.
// El condizionale passato NO la lleva: su riesgo es de redaccion de marco, no de
// doble validez de forma, y se controla con el gate de ausencia de protasis.
const EXTRA_ROUND_SLOTS = [IMPERATIVO];

// VARIANT_TABLE — la tabla declarativa por variante. Por variante:
//   who     — la persona (slots de condizionale) o el destinatario (imperativo)
//   marca   — el disparador, el ancla o el marcador de destinatario, unico en su slot
//   object  — el objeto literal del conjunto cerrado de 7
// Es el bloque que hace legible para un lector futuro que examina cada casilla,
// y el gate NO se la cree: contrasta lo declarado contra el `prompt` del JSON, de
// modo que una divergencia entre contenido e intencion se pone roja.
const VARIANT_TABLE = {
  [PRESENTE]: [
    // QUORUM 2026-08-09: era la locucion `Al posto tuo,`, doblemente valida.
    { who: '1sg', marca: 'Se fossi in te,', object: 'tutto' },
    { who: '2sg', marca: 'Se potessi,', object: 'il lavoro' },
    { who: '3sg', marca: 'Se non fosse così tardi,', object: 'una foto' },
    { who: '1pl', marca: 'Se avessimo un forno,', object: 'una torta' },
    { who: '2pl', marca: 'Se fosse necessario,', object: 'i compiti' },
    { who: '3pl', marca: 'Se ci fosse più tempo,', object: 'il letto' },
  ],
  [PASSATO]: [
    // QUORUM 2026-08-09: era la cola de IMPEDIMENTO `ma non ho avuto tempo`, que
    // no cierra el evento y dejaba defendible el calco de condizionale presente.
    { who: '1sg', marca: 'Aveva giurato che', object: 'il lavoro' },
    { who: '2sg', marca: 'Sapevo che', object: 'i compiti' },
    { who: '3sg', marca: 'Ha detto che', object: 'tutto' },
    // CR-01: 1pl y 3pl usaban el marco de diceria (`A quanto pare`,
    // `Secondo il giornale`), que lee igual de bien en trapassato. Pasan a
    // futuro-nel-passato con adverbial prospectivo.
    { who: '1pl', marca: 'Era sicuro che', object: 'un errore' },
    { who: '2pl', marca: 'ma alla fine non è successo', object: 'una torta' },
    { who: '3pl', marca: 'Mi ha promesso che', object: 'una foto' },
  ],
  [IMPERATIVO]: [
    { who: 'tu-informal', marca: 'Marco,', object: 'una foto' },
    { who: 'Lei-formal', marca: 'Signor Rossi,', object: 'il lavoro' },
    { who: 'noi-exhortativo', marca: 'Dai, noi due', object: 'una torta' },
    { who: 'voi-informal', marca: 'Bambini,', object: 'i compiti' },
    { who: 'Loro-formal', marca: 'Signori,', object: 'tutto' },
  ],
};

// ───────────────────────────────────────────────────────────────────────────
// 1. Estructura y conteos (D-43-01, D-43-03, D-43-08)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — estructura y conteos (D-43-01, D-43-03, D-43-08)', () => {
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });

  test('3 slots con los ids exactos de D-43-01, en el orden en que viven en disco', () => {
    assert.deepEqual(SLOTS.map((s) => s.id), IDS, 'D-43-01: condizionale presente, condizionale passato e imperativo');
  });

  test('los 3 slots son multiple-choice: 0 match y 0 word-buttons (D-43-22)', () => {
    const otros = SLOTS.filter((s) => s.type !== 'multiple-choice').map((s) => `${s.id}(${s.type})`);
    assert.deepEqual(otros, [], 'D-43-22: MC-only, el 0-match y el 0-wb son decision razonada (DESIGN RULE D-04)');
  });

  test('CONTEO DESIGUAL 6/6/5 y 17 en total: el 5 del imperativo es INVARIANTE, no un dato ajustable', () => {
    // DESVIACION 1: el analogo asume N constante por slot. Aqui NO, y el cinco
    // del imperativo es un hecho del italiano —no se dan ordenes a uno mismo—,
    // congelado como invariante PERMANENTE por D-43-08 y por SC-2.
    // El 5 va PRIMERO y con su propio mensaje: es el invariante permanente, y si
    // alguien lo cambia lo que tiene que leer en el diff es D-43-08, no un aviso
    // generico de conteo.
    assert.equal(
      byId(IMPERATIVO).variants.length,
      5,
      'D-43-08 / SC-2: el imperativo italiano no tiene 1a persona del singular; son EXACTAMENTE 5 casillas, ni 4 ni 6'
    );
    for (const id of IDS) {
      assert.equal(
        byId(id).variants.length,
        EXPECTED_VARIANTS[id],
        `D-43-03: ${id} debe tener ${EXPECTED_VARIANTS[id]} variantes`
      );
    }
    assert.equal(
      SLOTS.reduce((a, s) => a + s.variants.length, 0),
      TOTAL_VARIANTES,
      'D-43-01: 6 + 6 + 5 = 17 variantes'
    );
  });

  test('categoryIds de longitud 1 con el slug COMPLETO en los 3 (D-43-22, D-40-03)', () => {
    // El slug completo y nunca truncado: `fare-indicativo` y `fare-indefiniti`
    // comparten el prefijo `fare-ind`, asi que una comprobacion corta daria
    // falsos positivos entre categorias.
    const sucio = SLOTS
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
        `${s.id}: correctIndex constante — el autor aprenderia la posicion y no la forma`
      );
    }
  });

  test('ningun id lleva sufijo numerico de 3 cifras: el espacio -300+ queda libre (D-43-22)', () => {
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, [], 'D-43-22: fare-cond-imperativo-300+ es espacio reservado para Phase 44 / INT-03');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 2. Paradigma completo, 17 keys sin repeticion (CI-01, CI-02, CI-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — paradigma completo, 17 keys sin repeticion (CI-01, CI-02, CI-03)', () => {
  for (const id of IDS) {
    test(`${id}: las keys son las de CANON, en orden`, () => {
      assert.deepEqual(byId(id).variants.map(keyOf), CANON[id], `paradigma de ${id}`);
    });
  }

  test('en los 3 slots las keys son UNICAS: aqui no hay homografia deliberada', () => {
    // Se RECUPERA el `new Set(keys).size === n` que el molde de Phase 41 tenia y
    // que Phase 42 tuvo que soltar por sus 10 homografas: en esta categoria
    // ninguna casilla comparte cadena con otra del mismo slot, asi que la
    // unicidad de la respuesta no depende solo del pronombre.
    for (const id of IDS) {
      const keys = byId(id).variants.map(keyOf);
      assert.equal(new Set(keys).size, keys.length, `${id}: keys repetidas: ${keys.join(', ')}`);
    }
  });

  test('el apostrofe de la key de la 2a singular es U+0027 y ninguna key lleva U+2019 (D-43-21)', () => {
    // D-43-21: aqui el apostrofe deja de ser canon cosmetico, porque es parte de
    // la cadena que el autor tiene que elegir.
    const fa = CANON[IMPERATIVO][0];
    assert.equal(fa.charCodeAt(fa.length - 1), 39, `D-43-04: el ultimo caracter de "${fa}" debe ser el apostrofe ASCII U+0027`);
    const sucio = allVariants()
      .filter(({ v }) => keyOf(v).includes(String.fromCharCode(8217)))
      .map(({ slot, k }) => `${slot.id}#${k}`);
    assert.deepEqual(sucio, [], 'D-43-21: ninguna key puede llevar el apostrofe tipografico U+2019');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 3. Pronombre explicito y vocativo inequivoco (D-41-07, D-43-05)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — pronombre explicito y vocativo inequivoco (D-41-07, D-43-05)', () => {
  test('los 17 prompts contienen EXACTAMENTE un hueco literal ___', () => {
    // Conteo y no presencia (IN-05): el motor sustituye UN hueco, asi que dos
    // rompen el render, y ademas `segmentoDelHueco` se quedaria con el primero.
    const sucio = allVariants()
      .filter(({ v }) => v.prompt.split('___').length !== 2)
      .map(({ slot, k, v }) => `${slot.id}#${k}: ${v.prompt.split('___').length - 1} huecos`);
    assert.deepEqual(sucio, [], 'D-43-22: cada prompt lleva exactamente un hueco ___');
  });

  test('las 12 variantes de condizionale llevan el pronombre sujeto de SU persona (D-41-07)', () => {
    // Es lo que hace resoluble la casilla cuando la distractora es una forma real
    // de otra persona: sin el pronombre, dos opciones serian defendibles.
    const sucio = [];
    for (const id of COND_SLOTS) {
      eachVariant(id, (v, k) => {
        assert.equal(VARIANT_TABLE[id][k].who, PERSON_CODES[k], `D-43-22: ${id}#${k} el eje es la persona, y la ${k} es ${PERSON_CODES[k]}`);
        if (!PRONOUNS[k].some((p) => wordish(p).test(v.prompt))) {
          sucio.push(`${id}#${k} deberia llevar ${PRONOUNS[k].join('/')}: "${v.prompt}"`);
        }
      });
    }
    assert.deepEqual(sucio, [], 'D-41-07: pronombre sujeto explicito en las 12 variantes de condizionale');
  });

  test('las 5 del imperativo llevan EXACTAMENTE un marcador de destinatario, el suyo (D-43-05)', () => {
    // El analogo funcional del pronombre explicito. Con los dos imperativos vivos
    // vetados, el unico desambiguador entre las cinco formas es el REGISTRO, o
    // sea a quien se le habla; un prompt sin vocativo inequivoco convierte la
    // variante en irresoluble y, por la cascada D-54, en un reset de la categoria.
    const sucio = [];
    eachVariant(IMPERATIVO, (v, k) => {
      const hits = MARCADORES.filter((m) => v.prompt.includes(m));
      if (hits.length !== 1 || hits[0] !== MARCADORES[k]) {
        sucio.push(`${IMPERATIVO}#${k} deberia llevar solo "${MARCADORES[k]}" y lleva [${hits.join(' | ')}]: "${v.prompt}"`);
      }
    });
    assert.deepEqual(sucio, [], 'D-43-05: gate HARD de vocativo inequivoco');
  });

  test('las 5 del imperativo llevan su REFUERZO DE REGISTRO declarado, tambien las singulares (WR-10)', () => {
    // El gate que el review pedia: hoy MARCADORES comprueba PRESENCIA de un
    // vocativo, no que el vocativo DESAMBIGUE. Esto congela, variante a variante,
    // el elemento lexico que cierra el registro — y con el, la asimetria
    // adjudicada entre las dos singulares. Ver el comentario de
    // RINFORZO_DI_REGISTRO: `Signor Rossi` no lleva refuerzo anadido a proposito.
    const sucio = [];
    eachVariant(IMPERATIVO, (v, k) => {
      const { lit, via } = RINFORZO_DI_REGISTRO[k];
      if (!v.prompt.includes(lit)) {
        sucio.push(`${IMPERATIVO}#${k} (${CANON[IMPERATIVO][k]}) pierde su refuerzo "${lit}" [${via}]: "${v.prompt}"`);
      }
    });
    assert.deepEqual(
      sucio,
      [],
      'WR-10 / D-43-05: sin su refuerzo de registro la variante admite una segunda lectura defendible; la del nombre propio es la que lo necesita porque un vocativo de nombre de pila convive con el trato de cortesia'
    );
  });

  test('GATE HARD (quorum 2026-08-09): toda variante que OFREZCA el exhortativo excluye al hablante', () => {
    // El segundo eje de ambiguedad del slot. Ver el comentario de
    // ESCLUSORE_DELL_INCLUSIVO: un vocativo fija el destinatario y NO puede
    // excluir el inclusivo, porque el inclusivo se lo traga. El gate se aplica
    // exactamente donde el problema existe — la forma de nosotros esta entre las
    // opciones y NO es la respuesta — y la tabla declara `null` con su razon donde
    // no aplica, para que la exencion sea legible.
    const sucio = [];
    eachVariant(IMPERATIVO, (v, k) => {
      const ofreceInclusivo = v.options.includes('facciamo') && keyOf(v) !== 'facciamo';
      const declarado = ESCLUSORE_DELL_INCLUSIVO[k];
      if (!ofreceInclusivo) {
        // Simetria: donde no hace falta, la tabla tiene que decirlo con null. Si
        // alguien anade `facciamo` a las options de la variante de tu, esta rama
        // deja de aplicarse y la de abajo lo caza.
        return;
      }
      if (!declarado) {
        sucio.push(`${IMPERATIVO}#${k} ofrece el exhortativo y la tabla no declara ningun exclusor`);
        return;
      }
      if (!v.prompt.includes(declarado)) {
        sucio.push(`${IMPERATIVO}#${k} (${CANON[IMPERATIVO][k]}) pierde su exclusor "${declarado}": "${v.prompt}"`);
      }
    });
    assert.deepEqual(
      sucio,
      [],
      'QUORUM 2026-08-09: `facciamo` es el exhortativo INCLUSIVO y ningun vocativo lo excluye; sin una clausula que deje al hablante FUERA de la accion, la variante tiene dos respuestas defendibles'
    );
  });

  test('los DOS plurales del imperativo llevan su desambiguador extra, que es el gate y no un adorno', () => {
    // Sin estos dos literales las variantes tendrian DOS respuestas defendibles:
    // en italiano moderno un vocativo de cortesia en plural admite tambien la
    // forma de vosotros, y el exhortativo sin sujeto inclusivo tambien.
    const loro = byId(IMPERATIVO).variants[4];
    assert.ok(
      loro.prompt.includes('Loro'),
      `D-43-05: la variante de ${CANON[IMPERATIVO][4]} necesita el pronombre de cortesia Loro con mayuscula o "fate" seria defendible: "${loro.prompt}"`
    );
    const noi = byId(IMPERATIVO).variants[2];
    assert.ok(
      noi.prompt.includes('noi due'),
      `D-43-05: la variante de ${CANON[IMPERATIVO][2]} necesita el sujeto inclusivo explicito o "fate" seria defendible: "${noi.prompt}"`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 4. 0-gloss del VERBO (D-41-05, D-43-22)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — 0-gloss del verbo (D-41-05, D-43-22)', () => {
  // AQUI EL GATE ES ESTRICTO Y SIN LA EXCEPCION LEXICA DEL ANALOGO. Phase 42
  // admitia gloss sobre la CONJUNCION porque no filtraba nada; en esta categoria
  // no hay ninguna conjuncion por encima de A1 que glosar, y el candidato
  // legitimo de gloss lexico seria el vocativo o el marco, NUNCA la forma verbal:
  // el castellano tambien tiene condicional, asi que un gloss sobre el verbo
  // regalaria modo y tiempo a la vez, que es exactamente lo que se pregunta.
  test('ningun prompt menciona el espanol en ninguna capitalizacion', () => {
    const sucio = allVariants()
      .filter(({ v }) => /espa/i.test(v.prompt))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-41-05: gloss explicito de traduccion en un prompt');
  });

  test('ningun prompt lleva parentesis: en esta categoria no hay ningun gloss admitido', () => {
    const sucio = allVariants()
      .filter(({ v }) => v.prompt.includes('(') || v.prompt.includes(')'))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-43-22: 0-gloss estricto, sin la excepcion de conjuncion de Phase 42');
  });

  test('ninguna forma castellana de `hacer` aparece en un prompt, ESTE DONDE ESTE', () => {
    // IN-08 heredado: se escanea la FORMA y no el delimitador, por palabra
    // porque `hace` es prefijo de varias.
    const HACER_ES = [
      'hacer', 'hago', 'haces', 'hace', 'hacemos', 'haceis', 'hacéis', 'hacen',
      'haga', 'hagas', 'hagamos', 'hagais', 'hagáis', 'hagan',
      'haria', 'haría', 'harias', 'harías', 'hariamos', 'haríamos', 'harian', 'harían',
      'hacia', 'hacía', 'hice', 'hiciste', 'hizo', 'hicimos', 'hicieron', 'hecho',
    ];
    const sucio = [];
    for (const { slot, v, k } of allVariants()) {
      const hits = HACER_ES.filter((f) => wordish(f).test(v.prompt));
      if (hits.length) sucio.push(`${slot.id}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    }
    assert.deepEqual(sucio, [], 'D-41-05: gloss del VERBO; regala MODO y TIEMPO a la vez, que es exactamente el ejercicio');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 5. SCOPE-GATE lexico del objeto literal (D-41-06 heredado por D-43-22)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — SCOPE-GATE lexico del objeto literal (D-41-06 heredado)', () => {
  // SIN EXCEPCIONES. La excepcion acotada de `facente funzione` es del plan
  // 43-02 y esta limitada a su slot de participio presente; aqui el gate lexico
  // muerde entero, en las 17.
  test('ningun prompt ni opcion contiene un marcador de perifrasis o de causativo', () => {
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });

  test('ningun hueco va seguido de un infinitivo: el causativo fare + infinito no entra (WR-04)', () => {
    // El gate REAL que sustituye al literal `causativo`, que no cubria nada. Ver
    // el comentario de PERIPHRASIS: la forma de `fare` es el hueco, asi que un
    // causativo solo puede materializarse aqui como hueco mas infinitivo.
    const sucio = allVariants()
      .filter(({ v }) => CAUSATIVO_TRAS_HUECO.test(v.prompt))
      .map(({ slot, k, v }) => `${slot.id}#${k}: "${v.prompt}"`);
    assert.deepEqual(sucio, [], 'D-41-06 / WR-04: el causativo fare + infinito esta fuera de scope del milestone');
  });

  test('cada prompt lleva el objeto de la tabla, del conjunto CERRADO de 7, y es el UNICO de su clausula', () => {
    // Se cuenta en la clausula del hueco y por CORTE_FUERTE, no por
    // CORTE_DE_CLAUSULA: el objeto de la principal es legitimo tras la coma y dos
    // objetos coordinados no, porque le darian dos complementos al mismo verbo.
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const obj = VARIANT_TABLE[id][k].object;
        if (!OBJECTS.includes(obj)) { sucio.push(`${id}#${k}: "${obj}" no esta en el conjunto cerrado`); return; }
        if (!v.prompt.includes(obj)) { sucio.push(`${id}#${k}: el prompt no lleva "${obj}"`); return; }
        const clausula = segmentoDelHueco(v.prompt, CORTE_FUERTE);
        const enClausula = OBJECTS.filter((o) => clausula.includes(o));
        if (enClausula.length !== 1) {
          sucio.push(`${id}#${k}: ${enClausula.length} objetos en la clausula del hueco (${enClausula.join(', ')})`);
        }
      });
    }
    assert.deepEqual(sucio, [], 'D-41-06: el objeto de `fare` es SIEMPRE literal, del conjunto cerrado de 7, y uno solo por clausula');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 6. Blacklist de formas atestiguadas y defendibles (D-43-04, D-43-07)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — blacklist de formas atestiguadas y defendibles (D-43-04, D-43-07)', () => {
  // ESCANEO POR CAMPO. Ver la advertencia de escaneo de la cabecera, que es la
  // unica declaracion del invariante y por eso no se repite en mayusculas aqui:
  // el `notes`
  // nombra a proposito cada una de estas formas y las explanations tienen que
  // nombrar dos de ellas (desviacion 4), asi que nunca se escanea el fichero
  // entero ni `explanation`.
  const camposDe = (v) => [
    { campo: 'prompt', texto: v.prompt },
    ...v.options.map((o) => ({ campo: 'option', texto: o })),
  ];

  test('LA TRAMPA DEL APOSTROFE existe, esta resuelta, y el matcher hermano no esta desactivado', () => {
    // DESVIACION 2, sustanciada. Los tres asserts juntos son lo que distingue
    // «resolver la trampa» de «evitarla apagando el gate».
    assert.ok(
      wordish('fa').test(CANON[IMPERATIVO][0]),
      'la trampa tiene que EXISTIR con el matcher heredado: si deja de existir, este fichero sobra'
    );
    assert.ok(
      !matcherDe('fa').test(CANON[IMPERATIVO][0]),
      `D-43-04: el matcher hermano NO puede morder la key "${CANON[IMPERATIVO][0]}" — pondria roja la variante correcta`
    );
    assert.ok(
      matcherDe('fa').test('Marco, fa i compiti prima di cena.'),
      'D-43-04: el matcher hermano tiene que SEGUIR mordiendo la forma corta suelta; si no, esta desactivado'
    );
  });

  test('ni una opcion ni un prompt de las 17 variantes lleva una forma de la blacklist', () => {
    // El riesgo real no es que el autor escriba una arcaica: es que la AUTORIA
    // genere el imperativo vivo vetado como distractora "obviamente mala" de la
    // key apostrofada, siendo una forma atestiguada y corriente. Ofrecerla como
    // incorrecta le ensenaria al autor que una respuesta correcta es un error.
    for (const { slot, v, k } of allVariants()) {
      const sucio = [];
      for (const { campo, texto } of camposDe(v)) {
        for (const f of BLACKLIST) {
          const hit = campo === 'option'
            ? texto === f || matcherDe(f).test(texto)
            : matcherDe(f).test(texto);
          if (hit) sucio.push(`${f} (${campo}: "${texto}")`);
        }
      }
      assert.deepEqual(sucio, [], `D-43-04 / D-43-07: ${slot.id}#${k} ofrece o menciona una forma atestiguada: ${sucio.join(', ')}`);
    }
  });

  test('ninguna opcion es una forma NO PERSONAL de fare: frontera con el plan 43-02', () => {
    // Coincidencia EXACTA y nada mas: `avrei fare` es una distractora legitima de
    // esta categoria, no la forma no personal suelta, que es casilla de
    // `fare-indefiniti`.
    for (const { slot, v, k } of allVariants()) {
      const sucio = v.options.filter((o) => NO_PERSONALI.includes(o));
      assert.deepEqual(sucio, [], `D-43-01: ${slot.id}#${k} invade el paradigma no personal de fare-indefiniti: ${sucio.join(', ')}`);
    }
  });

  test('EN POSITIVO: el notes documenta cada forma de la blacklist entre apostrofes ASCII', () => {
    // La ausencia sin audit trail no vale: si el `notes` deja de nombrar una
    // forma, una pasada futura no sabra por que no puede usarla.
    const faltan = BLACKLIST.filter((f) => !CONTENT.notes.includes(`${APOSTROFE}${f}${APOSTROFE}`));
    assert.deepEqual(faltan, [], 'D-43-04 / D-43-07: el notes no documenta estas formas de la blacklist');
  });

  test('EN POSITIVO: el notes declara la key apostrofada con su literal distintivo (desviacion 3)', () => {
    // DESVIACION 3: NO se clona el idioma heredado de envolver la forma entre
    // apostrofes, porque para una forma que ya termina en apostrofe es ilegible.
    assert.ok(
      CONTENT.notes.includes(`la forma ${CANON[IMPERATIVO][0]}`),
      `D-43-04: el notes no declara "la forma ${CANON[IMPERATIVO][0]}" con su audit trail`
    );
  });

  test('EN POSITIVO: el notes declara los marcadores en MAYUSCULAS de esta fase', () => {
    for (const marca of [
      'RECONOCER, NO PRODUCIR', 'AUSENCIA DE io', 'MAGNET', 'HOMOGRAFÍA',
      'GATE DE VOCATIVO', 'SCOPE-GATE', 'HARD',
    ]) {
      assert.ok(CONTENT.notes.includes(marca), `D-43-22: el notes no declara "${marca}"`);
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 7. Distractoras del condizionale presente: el futuro en las 6 (D-43-09, SC-1)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — distractoras del condizionale presente, el futuro en las 6 (D-43-09, SC-1)', () => {
  test('en cada una de las 6: 1 futuro de SU persona + 1 condizionale real de OTRA + 1 inexistente', () => {
    // SC-1 pide «al menos una variante» que obligue a distinguir futuro de
    // condizionale; con este patron lo hacen las 6, y el par minimo de la 1a
    // plural (una sola consonante doble de diferencia) es el caso extremo.
    eachVariant(PRESENTE, (v, k) => {
      const key = keyOf(v);
      assert.equal(v.options.filter((o) => o === key).length, 1, `${PRESENTE}#${k}: la key aparece una sola vez`);
      const resto = v.options.filter((o) => o !== key);
      const futuro = resto.filter((o) => o === FUTURO[k]);
      const otraPersona = resto.filter((o) => o !== FUTURO[k] && COND_PRES.includes(o));
      const inexistentes = resto.filter((o) => !REAL_FORMS.has(o));
      assert.equal(futuro.length, 1, `D-43-09: ${PRESENTE}#${k} deberia ofrecer el futuro "${FUTURO[k]}" de su persona, ofrece (${resto.join(', ')})`);
      assert.equal(otraPersona.length, 1, `D-43-09: ${PRESENTE}#${k} deberia ofrecer 1 condizionale real de otra persona, ofrece ${otraPersona.length} (${resto.join(', ')})`);
      assert.equal(inexistentes.length, 1, `D-43-09: ${PRESENTE}#${k} deberia ofrecer 1 forma inexistente, ofrece ${inexistentes.length} (${resto.join(', ')})`);
    });
  });

  test('GATE HARD: ningun prompt del presente lleva un deictico de futuro', () => {
    // Con la distractora de futuro en las 6, un marcador temporal de futuro la
    // haria DEFENDIBLE y la variante tendria dos respuestas correctas: es el
    // mismo modo de fallo que D-43-10 declara del otro slot, por la puerta de al
    // lado, y por la cascada D-54 cuesta el reset de las 17 variantes.
    // WR-03: se escanean los literales Y las familias abiertas (complemento de
    // termino, de distancia, comparativo y adjetivo pospuesto). La prueba de que
    // los patrones hacen falta esta en el propio contenido: la redaccion original
    // del slot 2 usaba `entro venerdi`, que la lista de literales no habria visto.
    const sucio = [];
    eachVariant(PRESENTE, (v, k) => {
      const hits = [
        ...DEITTICI_FUTURO.filter((x) => wordish(x).test(v.prompt)),
        ...DEITTICI_FUTURO_RE.filter((re) => re.test(v.prompt)).map((re) => String(re)),
      ];
      if (hits.length) sucio.push(`${PRESENTE}#${k}: ${hits.join(', ')} en "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'D-43-09: un deictico de futuro hace defendible la distractora de futuro');
  });

  test('GATE HARD (quorum 2026-08-09): los 6 excluyen el futuro por GRAMATICA, con protasis explicita', () => {
    // Ver el comentario de DISPARADORI: la locucion de sustitucion excluia el
    // futuro solo por IDIOMATISMO, y admitia una segunda lectura —la de ocupar el
    // puesto de otro— en la que el futuro entra sin anomalia. Una protasis con
    // congiuntivo imperfetto lo excluye gramaticalmente, que es lo que un gate
    // necesita. Los 6 disparadores del conjunto cerrado son ahora protasis.
    const noProtasi = DISPARADORI.filter((t) => !/^Se\s/.test(t));
    assert.deepEqual(
      noProtasi,
      [],
      'QUORUM 2026-08-09: el conjunto cerrado de disparadores solo admite protasis con congiuntivo imperfetto; una locucion excluye el futuro por idiomatismo y el idiomatismo se rompe'
    );
    const sucio = [];
    eachVariant(PRESENTE, (v, k) => {
      const hits = DISPARADORI.filter((t) => v.prompt.includes(t));
      if (hits.length !== 1) sucio.push(`${PRESENTE}#${k} lleva ${hits.length} disparadores [${hits.join(' | ')}]: "${v.prompt}"`);
    });
    assert.deepEqual(
      sucio,
      [],
      'QUORUM 2026-08-09 / D-43-09: cada prompt necesita EXACTAMENTE una protasis del conjunto cerrado; sin ella el futuro solo queda excluido por idiomatismo y una locucion de sustitucion admite la lectura literal, en la que el futuro entra sin anomalia'
    );
  });

  test('los 6 conjuntos de options del presente son distintos dos a dos', () => {
    const sets = byId(PRESENTE).variants.map((v) => [...v.options].sort().join('|'));
    assert.equal(new Set(sets).size, 6, `D-43-09: el condizionale de OTRA persona se elige distinto en cada variante: ${sets.join(' // ')}`);
  });

  test('el par minimo de la 1a plural esta en options: futuro y condizionale a una consonante', () => {
    const noi = byId(PRESENTE).variants[3];
    assert.ok(noi.options.includes('faremmo') && noi.options.includes('faremo'),
      `D-43-09: la variante de noi tiene que enfrentar faremmo y faremo: ${noi.options.join(', ')}`);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 8. Distractoras del condizionale passato: el calco espanol (D-43-10, SC-1)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — distractoras del condizionale passato, el calco espanol (D-43-10, SC-1)', () => {
  test('en cada una de las 6: 1 condizionale PRESENTE de SU persona + 1 aux-swap + 1 mal construida', () => {
    // La primera es la distractora mas valiosa de la fase: el espanol dice «dijo
    // que haria» con condicional SIMPLE donde el italiano exige el COMPUESTO.
    eachVariant(PASSATO, (v, k) => {
      const key = keyOf(v);
      assert.equal(v.options.filter((o) => o === key).length, 1, `${PASSATO}#${k}: la key aparece una sola vez`);
      const resto = v.options.filter((o) => o !== key);
      const calco = resto.filter((o) => o === COND_PRES[k]);
      const auxSwap = resto.filter((o) => AUX_SWAP.includes(o));
      const malConstruidas = resto.filter((o) => !REAL_FORMS.has(o));
      assert.equal(calco.length, 1, `D-43-10: ${PASSATO}#${k} deberia ofrecer el calco "${COND_PRES[k]}", ofrece (${resto.join(', ')})`);
      assert.equal(auxSwap.length, 1, `D-43-10: ${PASSATO}#${k} deberia ofrecer 1 aux-swap, ofrece ${auxSwap.length} (${resto.join(', ')})`);
      assert.equal(malConstruidas.length, 1, `D-43-10: ${PASSATO}#${k} deberia ofrecer 1 forma mal construida, ofrece ${malConstruidas.length} (${resto.join(', ')})`);
    });
  });

  test('los 6 aux-swap son distintos entre si: ninguna variante repite el error de marco de otra', () => {
    const swaps = byId(PASSATO).variants.map((v) => v.options.find((o) => AUX_SWAP.includes(o)));
    assert.equal(new Set(swaps).size, 6, `D-43-10: aux-swap repetido: ${swaps.join(', ')}`);
  });

  test('GATE HARD: ningun prompt del passato lleva la protasis condicional como palabra suelta', () => {
    // El trabajo fino que D-43-10 deja abierto, resuelto como gate y no como red
    // de quorum: bajo una protasis hipotetica con congiuntivo imperfetto la
    // distractora de condizionale presente pasa a ser DEFENDIBLE como lectura
    // presente y la variante tiene dos respuestas correctas. Este slot no usa
    // protasis; sus tres grupos de anclas cubren lo que CI-02 y SC-1 piden.
    const sucio = [];
    eachVariant(PASSATO, (v, k) => {
      if (wordish('se').test(v.prompt)) sucio.push(`${PASSATO}#${k}: "${v.prompt}"`);
    });
    assert.deepEqual(sucio, [], 'D-43-10: una protasis condicional reabre la lectura hipotetica presente');
  });

  test('GATE HARD (CR-01): toda variante con trapassato en options lleva su EXCLUSOR de la lectura anterior', () => {
    // EL DEFECTO QUE ESTO ARREGLA, para que nadie lo reintroduzca: el gate de
    // ausencia de protasis de aqui arriba neutraliza la distractora de
    // condizionale PRESENTE, que es la que mira, y NINGUNA otra. Con el trapassato
    // de la misma persona en las 6 variantes, solo estaban blindadas las 2 con
    // cola adversativa; en las otras 4 la lectura anterior era defendible y en
    // dos era la lectura POR DEFECTO (`Sapevo che tu avevi fatto i compiti da
    // solo` es italiano perfecto y significa otra cosa). Dos respuestas
    // defendibles es `disputed` sticky, y por la cascada D-54 el reset de las 17.
    //
    // El exclusor es uno de dos, y el gate acepta cualquiera de los dos:
    //   - adverbial PROSPECTIVO que GOBIERNE la clausula del hueco: hace
    //     INCOHERENTE el trapassato, porque nada puede haberse hecho ya en un
    //     momento posterior al punto de referencia. Va por ambito y no por
    //     presencia, por la misma razon que el marco de D-43-11: desplazado a
    //     otra clausula modifica al verbo de esa clausula.
    //   - cola de NO REALIZACION: contradice que la accion ocurriera. Va por
    //     presencia, porque una cola adversativa vive por definicion en otra
    //     clausula y exigirle ambito seria insatisfacible.
    const sucio = [];
    eachVariant(PASSATO, (v, k) => {
      const trapassati = v.options.filter((o) => TRAPASSATO.includes(o));
      if (trapassati.length === 0) return;
      const prospettivo = AVVERBIALI_PROSPETTIVI.filter((a) => gobiernaElHueco(v.prompt, a));
      const coda = CODE_DI_NON_REALIZZAZIONE.filter((c) => v.prompt.includes(c));
      if (prospettivo.length === 0 && coda.length === 0) {
        sucio.push(`${PASSATO}#${k} ofrece "${trapassati.join(', ')}" sin exclusor: "${v.prompt}"`);
      }
    });
    assert.deepEqual(
      sucio,
      [],
      'CR-01 / D-43-10: con el trapassato en options y sin adverbial prospectivo ni cola de no realizacion, la lectura anterior es DEFENDIBLE y la variante tiene dos respuestas correctas'
    );
  });

  test('GATE HARD (quorum 2026-08-09): toda variante del passato excluye la lectura de condizionale PRESENTE', () => {
    // El GEMELO del gate de CR-01, para la OTRA familia de distractoras. CR-01
    // blindo el trapassato y dio por buenas las 2 variantes con cola adversativa
    // sin mirar el calco de condizionale presente sobre ellas — el mismo error que
    // CR-01 declaraba como leccion. Aqui esta cerrado por los dos lados:
    //   - un ancla de futuro-nel-passato que GOBIERNE la clausula del hueco pone
    //     la principal en pasado, y despues de una principal en pasado el
    //     condizionale presente es AGRAMATICAL. Cierre por gramatica.
    //   - una cola que declara el EVENTO CERRADO en el pasado: un hecho que ya no
    //     puede ocurrir no admite hipotetizarlo en presente. Cierre por semantica.
    // Una cola de IMPEDIMENTO no vale y por eso salio del conjunto: se lee como
    // presente perfecto, el asunto sigue pendiente, y el calco vuelve a entrar.
    const sucio = [];
    eachVariant(PASSATO, (v, k) => {
      const ancla = ANCLE_FUTURO_NEL_PASSATO.find((a) => v.prompt.includes(a.lit) && gobiernaElHueco(v.prompt, a.head));
      const coda = CODE_DI_NON_REALIZZAZIONE.filter((c) => v.prompt.includes(c));
      if (!ancla && coda.length === 0) {
        sucio.push(`${PASSATO}#${k} ofrece "${COND_PRES[k]}" sin cierre de la lectura presente: "${v.prompt}"`);
      }
    });
    assert.deepEqual(
      sucio,
      [],
      'QUORUM 2026-08-09 / D-43-10: sin principal en pasado que gobierne el hueco ni evento cerrado, el condizionale PRESENTE sigue siendo defendible y la variante tiene dos respuestas correctas'
    );
  });

  test('CR-01: el conjunto cerrado de anclas NO admite un tercer grupo, y menos el de diceria', () => {
    // Self-check de constantes a proposito, como los de WR-03/IN-09 del analogo:
    // no lee el JSON y no puede ponerse rojo por contenido. Su funcion es impedir
    // que una pasada futura reintroduzca el marco de rumor o atenuacion en pasado
    // —`Secondo il giornale`, `A quanto pare`—, que es la UNICA familia que no
    // puede excluir la lectura anterior por ningun medio, porque la diceria lee
    // igual de bien en condizionale passato y en trapassato. Se retiro en CR-01.
    const huerfanas = ANCLE_PASSATO.filter(
      (a) => !ANCLE_FUTURO_NEL_PASSATO.some((x) => x.lit === a) && !CODE_DI_NON_REALIZZAZIONE.includes(a)
    );
    assert.deepEqual(
      huerfanas,
      [],
      'CR-01: las anclas de este slot solo pueden ser de futuro-nel-passato o de no realizacion; cualquier otra familia reabre la doble lectura'
    );
  });

  test('cada prompt del passato lleva EXACTAMENTE un ancla del conjunto cerrado, y las 6 son distintas', () => {
    const usadas = [];
    eachVariant(PASSATO, (v, k) => {
      const hits = ANCLE_PASSATO.filter((a) => v.prompt.includes(a));
      assert.equal(hits.length, 1, `D-43-10: ${PASSATO}#${k} lleva ${hits.length} anclas [${hits.join(' | ')}]: "${v.prompt}"`);
      usadas.push(hits[0]);
    });
    assert.equal(new Set(usadas).size, 6, `D-43-10: los 6 marcos deben ser distintos entre si: ${usadas.join(' | ')}`);
  });

  test('AL MENOS 2 de las 6 usan un marco de futuro-nel-passato que GOBIERNA la clausula del hueco (D-43-11)', () => {
    // AMBITO y no presencia: un ancla desplazada a otra clausula del mismo prompt
    // modifica al verbo de esa clausula y deja al hueco sin marcador, que es
    // exactamente como vuelve la doble respuesta. El literal se comprueba con su
    // `head` porque CORTE_DE_CLAUSULA consume el `che` subordinante al partir.
    let cuantas = 0;
    eachVariant(PASSATO, (v, k) => {
      const a = ANCLE_FUTURO_NEL_PASSATO.find((x) => v.prompt.includes(x.lit));
      if (!a) return;
      cuantas += 1;
      assert.ok(
        gobiernaElHueco(v.prompt, a.head),
        `D-43-11: ${PASSATO}#${k} lleva el marco "${a.lit}" FUERA de la clausula del hueco: "${v.prompt}"`
      );
    });
    assert.ok(
      cuantas >= 2,
      `D-43-11 / SC-1: al menos 2 de las 6 tienen que usar el marco de futuro-nel-passato, hay ${cuantas}`
    );
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 9. El slot del IMPERATIVO: 5 variantes y registro (D-43-04, D-43-05, D-43-08, SC-2)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — slot del imperativo, 5 variantes y registro (D-43-04, D-43-05, D-43-08, SC-2)', () => {
  const I = () => byId(IMPERATIVO);
  const PARADIGMA = new Set(IMPERATIVO_5);

  test('EXACTAMENTE 5 variantes, como invariante permanente y no como dato de conteo (D-43-08, SC-2)', () => {
    assert.equal(
      I().variants.length,
      5,
      'D-43-08 / SC-2: el imperativo italiano no tiene 1a persona del singular porque no se dan ordenes a uno mismo; la ausencia esta DOCUMENTADA en el notes y en la explanation, y este gate la congela'
    );
  });

  test('las 20 opciones del slot salen del paradigma de 5 y de ningun otro sitio (D-43-05)', () => {
    // Cerrar el universo de opciones al propio paradigma es lo que desplaza el
    // eje examinado de la MORFOLOGIA al REGISTRO: ninguna distractora es
    // inventada y ninguna es de otro modo, asi que lo unico que decide es a quien
    // se le habla.
    for (const [k, v] of I().variants.entries()) {
      const sucio = v.options.filter((o) => !PARADIGMA.has(o));
      assert.deepEqual(sucio, [], `D-43-05: ${IMPERATIVO}#${k} ofrece algo que no es del paradigma: ${sucio.join(', ')}`);
    }
  });

  test('la key apostrofada aparece en options en EXACTAMENTE 1 variante, y alli es la key (SC-2)', () => {
    // SC-2 al pie de la letra: ninguna de las tres formas atestiguadas de la 2a
    // singular puede aparecer como distractora «incorrecta». Las otras dos estan
    // en la blacklist (bloque 6); la apostrofada solo aparece donde es correcta.
    const fa = IMPERATIVO_5[0];
    const idx = I().variants.map((v, k) => (v.options.includes(fa) ? k : -1)).filter((k) => k >= 0);
    assert.deepEqual(idx, [0], `SC-2: "${fa}" solo puede aparecer en la variante de tu, y aparece en [${idx.join(', ')}]`);
    assert.equal(keyOf(I().variants[0]), fa, `SC-2: en esa variante "${fa}" tiene que ser la KEY, nunca una distractora`);
  });

  test('las 3 distractoras de cada variante son formas reales de OTRO destinatario, y nunca la apostrofada', () => {
    const fa = IMPERATIVO_5[0];
    I().variants.forEach((v, k) => {
      const key = keyOf(v);
      const distractoras = v.options.filter((o) => o !== key);
      assert.equal(distractoras.length, 3, `${IMPERATIVO}#${k}: deberia haber 3 distractoras y hay ${distractoras.length}`);
      const sucio = distractoras.filter((o) => !PARADIGMA.has(o) || o === key || o === fa);
      assert.deepEqual(sucio, [], `D-43-05: ${IMPERATIVO}#${k} distractora invalida: ${sucio.join(', ')}`);
    });
  });

  test('las 4 variantes que no son la de tu tienen el conjunto de options DETERMINADO por el paradigma menos la apostrofada', () => {
    // Con la apostrofada vetada como distractora quedan exactamente 4 candidatas
    // para 4 casillas, asi que el cuarteto de esas variantes es unico.
    const cuarteto = IMPERATIVO_5.slice(1).sort();
    for (let k = 1; k < 5; k += 1) {
      assert.deepEqual(
        [...I().variants[k].options].sort(),
        cuarteto,
        `D-43-05: ${IMPERATIVO}#${k} no es el cuarteto del paradigma sin la forma apostrofada`
      );
    }
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 10. Marcos, objetos y destinatarios por variante (D-43-10, D-43-11)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — marcos, objetos y destinatarios por variante (D-43-10, D-43-11)', () => {
  test('la tabla declara las 17 filas, una por variante en disco', () => {
    for (const id of IDS) {
      assert.equal(VARIANT_TABLE[id].length, EXPECTED_VARIANTS[id], `${id}: la tabla y el disco tienen que declarar el mismo numero de variantes`);
    }
  });

  test('la marca declarada de cada variante esta LITERALMENTE en su prompt', () => {
    // La tabla declara la INTENCION y el gate NO se la cree: la contrasta contra
    // el `prompt` del JSON, de modo que una divergencia entre el contenido y lo
    // que este fichero dice que examina cada casilla se pone roja.
    const sucio = [];
    for (const id of IDS) {
      eachVariant(id, (v, k) => {
        const { marca } = VARIANT_TABLE[id][k];
        if (!v.prompt.includes(marca)) sucio.push(`${id}#${k}: falta "${marca}" en "${v.prompt}"`);
      });
    }
    assert.deepEqual(sucio, [], 'D-43-10: la tabla declara una marca que el prompt no contiene');
  });

  test('las marcas son distintas dentro de cada slot: ninguna variante es otra repetida', () => {
    for (const id of IDS) {
      const marcas = VARIANT_TABLE[id].map((r) => r.marca);
      assert.equal(new Set(marcas).size, marcas.length, `D-43-10: ${id} repite marca: ${marcas.join(' | ')}`);
    }
  });

  test('los disparadores del presente salen del conjunto CERRADO declarado', () => {
    const sucio = VARIANT_TABLE[PRESENTE].map((r) => r.marca).filter((m) => !DISPARADORI.includes(m));
    assert.deepEqual(sucio, [], 'D-43-09: disparador fuera del conjunto cerrado');
  });

  test('las anclas del passato salen del conjunto CERRADO declarado', () => {
    const sucio = VARIANT_TABLE[PASSATO].map((r) => r.marca).filter((m) => !ANCLE_PASSATO.includes(m));
    assert.deepEqual(sucio, [], 'D-43-10: ancla fuera del conjunto cerrado');
  });

  test('los marcadores del imperativo son los cinco del conjunto CERRADO, en su orden', () => {
    assert.deepEqual(VARIANT_TABLE[IMPERATIVO].map((r) => r.marca), MARCADORES, 'D-43-05: los 5 marcadores de destinatario');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 11. Canon editorial e higiene del JSON (D-43-21, T-43-01, T-43-02)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — canon editorial e higiene del JSON (D-43-21, T-43-01, T-43-02)', () => {
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
    // T-43-01: la invariante x-text-only del proyecto (T-02-01) significa que el
    // contenido se renderiza SIEMPRE como texto. Este escaneo es el cinturon, y
    // el `notes` se redacto sin corchetes angulares a proposito para que no
    // necesite excepciones.
    for (const marca of ['<', '>', '&#', 'javascript:', '`']) {
      const sucio = strings.filter((s) => s.includes(marca)).map((s) => s.slice(0, 60));
      assert.deepEqual(sucio, [], `T-43-01: aparece ${marca} en el contenido`);
    }
  });

  test('ningun string lleva comillas tipograficas: apostrofes ASCII U+0027 (D-43-21)', () => {
    // En esta categoria el gate deja de ser cosmetico: el apostrofe de la key de
    // la 2a singular es parte de la cadena que el autor tiene que elegir.
    const sucio = strings.filter((s) => /[‘’“”]/.test(s)).map((s) => s.slice(0, 60));
    assert.deepEqual(sucio, [], 'D-43-21: smart quotes en el contenido');
  });

  test('ninguna clave propia del objeto parseado se llama __proto__, constructor ni prototype', () => {
    // T-43-02: el riesgo real no es que este `JSON.parse` contamine —no puede—
    // sino que un consumidor haga un deep-merge ingenuo del contenido parseado, y
    // para eso lo que hay que impedir es que la clave peligrosa EXISTA.
    const sucias = claves.filter((k) => ['__proto__', 'constructor', 'prototype'].includes(k));
    assert.deepEqual(sucias, [], 'T-43-02: clave peligrosa en el JSON de contenido');
  });

  test('las 3 explanations estan en espanol acentuado RAE y no estan vacias', () => {
    // Un flag C4-accent del quorum sobre espanol sin tildes es bug REAL: se
    // arreglan los acentos, NUNCA se hace override.
    for (const s of SLOTS) {
      assert.ok(s.explanation.trim().length > 0, `D-43-21: ${s.id} sin explanation`);
      assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/, `D-43-21: la explanation de ${s.id} no lleva ningun acento RAE`);
    }
  });

  test('la explanation del presente cita el paradigma y lleva la linea del par minimo de la 1a plural', () => {
    const e = byId(PRESENTE).explanation;
    for (const f of COND_PRES) assert.ok(e.includes(f), `CI-01: la explanation del presente no cita ${f}`);
    assert.ok(e.includes('faremo') && e.includes('faremmo'), 'D-43-09: falta el par minimo futuro / condizionale de la 1a plural');
    assert.ok(!e.includes('imperativo'), 'D-43-22: la explanation del presente no adelanta el slot de imperativo');
  });

  test('la explanation del passato desarrolla el par explicito del futuro en el pasado (D-43-11, SC-1)', () => {
    // La advertencia va donde el error muerde, no solo donde se explica: el motor
    // sirve un slot por sesion, asi que la interferencia se desarrolla en el slot
    // que la examina.
    const e = byId(PASSATO).explanation;
    for (const f of COND_PASS) assert.ok(e.includes(f), `CI-02: la explanation del passato no cita ${f}`);
    assert.ok(e.includes('ha detto che avrebbe fatto'), 'D-43-11: falta el par italiano explicito');
    assert.ok(e.includes('haría'), 'D-43-11 / SC-1: falta el contraste con el condicional SIMPLE del espanol');
    assert.ok(e.length > 600, `D-43-11: la explanation del passato desarrolla la interferencia (${e.length} caracteres)`);
    assert.ok(!e.includes('imperativo'), 'D-43-22: la explanation del passato no adelanta el slot de imperativo');
  });

  test('la explanation del imperativo hace las CUATRO cosas que SC-2, D-43-06, D-43-07 y D-43-19 exigen', () => {
    // DESVIACION 4: aqui el escaneo va en POSITIVO y es lo contrario del gate de
    // ausencia del bloque 6. Los dos imperativos vivos vetados TIENEN que estar
    // nombrados; lo que no pueden es estar en `options`.
    const e = byId(IMPERATIVO).explanation;
    // (a) el paradigma de 5, con su casilla ausente explicada.
    for (const f of IMPERATIVO_5) assert.ok(e.includes(f), `D-43-08: la explanation del imperativo no cita ${f}`);
    // (b) el MAGNET resuelto a la vista del autor (RECONOCER, NO PRODUCIR).
    assert.ok(wordish('fai').test(e), 'D-43-19: la explanation tiene que NOMBRAR el imperativo vivo de 2a singular en -i');
    assert.ok(matcherDe('fa').test(e), 'D-43-19: la explanation tiene que NOMBRAR la forma corta, y como palabra suelta, no dentro de la key apostrofada');
    // (c) las formas con clitico, nombradas como lo que son.
    const cliticos = ['fallo', 'fammi', 'fatelo', 'facci'].filter((f) => wordish(f).test(e));
    assert.ok(cliticos.length >= 2, `D-43-07: la explanation debe nombrar al menos 2 formas con clitico, nombra ${cliticos.length}`);
    // (d) la homografia, ENSENADA y no contrastada.
    assert.ok(e.includes('congiuntivo') && e.includes('indicativo'), 'D-43-06: la explanation tiene que ENSENAR la homografia con los dos modos');
    assert.ok(e.length > 900, `D-43-08 / SC-2: la explanation del imperativo es la mas cargada del fichero (${e.length} caracteres)`);
  });
});

// ───────────────────────────────────────────────────────────────────────────
// 12. Audit trail de validacion y ronda EXTRA condicionada (D-43-20, T-43-03)
// ───────────────────────────────────────────────────────────────────────────

describe('fare-cond-imperativo — audit trail de validacion y ronda EXTRA (D-43-20, T-43-03)', () => {
  // ESTOS ASSERTS SON VERDES CON passes: [] — deriveStatus([]) devuelve
  // 'pending', asi que la igualdad se cumple ANTES de que corra el quorum. Su
  // funcion NO es exigir que la categoria este validada (eso lo hace el gate
  // VAL_07_STRICT del smoke parametrico, que al cerrar Phase 43 esta en rojo a
  // proposito, nombrando los 3 slots): es impedir que un `validated` escrito a
  // mano, sin pases reales, pase por bueno. El audit trail es la unica evidencia
  // que el autor tiene de que una variante fue revisada, y falsificarlo es
  // indetectable a ojo. Es tambien lo que permite que `execute-phase` cierre en
  // verde y que el quorum base Opus+Sonnet vaya despues, en pasada TOP-LEVEL.
  test('los 3 slots tienen validation con status string y passes array', () => {
    for (const s of SLOTS) {
      assert.ok(s.validation && typeof s.validation === 'object', `${s.id}: falta validation`);
      assert.equal(typeof s.validation.status, 'string', `${s.id}: validation.status debe ser string`);
      assert.ok(Array.isArray(s.validation.passes), `${s.id}: validation.passes debe ser array`);
    }
  });

  test('status coincide con deriveStatus(passes) en los 3 slots: no se puede forjar un validated', () => {
    // `deriveStatus` se importa del codigo real (WR-01: fuente unica) y NUNCA se
    // reimplementa aqui, para que este gate no pueda divergir de lo que el motor
    // y el reporter consideran validado.
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
        // Un override sin motivo escrito es indistinguible de un descuido.
        assert.ok(
          Array.isArray(override.concerns) && override.concerns.some((c) => c.trim().length > 0),
          `${s.id}: el override del autor no documenta por que se resolvio el disenso`
        );
        // Y tiene que apoyarse en al menos un pase de MODELO: si las 2 correctas
        // fuesen del autor, seria un validated forjado.
        assert.ok(correctas.some((p) => p.by !== 'autor'), `${s.id}: validated por override sin ningun pase correcta de un modelo`);
      }
    }
  });

  test('el slot de imperativo lleva un pase deepseek cuando pasa a validated (D-43-20)', () => {
    // La ronda EXTRA cubre las 5 variantes del imperativo, que es el bloque de
    // doble validez de esta categoria. EXTRA_ROUND_SLOTS tiene UN solo elemento a
    // proposito: el condizionale passato NO lleva ronda extra, porque su riesgo
    // es de redaccion de marco y se controla con el gate del bloque 8, no con
    // presupuesto de quorum.
    assert.deepEqual(EXTRA_ROUND_SLOTS, [IMPERATIVO], 'D-43-20: solo el slot de imperativo lleva ronda EXTRA');
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

describe('fare-cond-imperativo — registro de la categoria (D-43-22, SC-5)', () => {
  // Red de regresion del registro: la entrada de content/categories.json no es
  // cosmetica. Es prerequisito de SCHEMA (schema-validator.js exige que todo
  // categoryIds referencie una categoria conocida) Y es lo que hace que la fila
  // aparezca en home, picker, Repaso y Examen, porque categoriesForDisplay itera
  // content.categories. Sin ella el fichero de contenido queda invalido en disco.
  const entradas = CATEGORIES.categories;

  test('existe la entrada fare-cond-imperativo con las 4 claves exactas, order 17 y origen ia-quorum', () => {
    const cat = entradas.find((c) => c.id === SLUG);
    assert.ok(cat, `D-43-22: no existe la entrada ${SLUG}`);
    assert.deepEqual(Object.keys(cat).sort(), ['id', 'name', 'order', 'origen'], 'D-43-22: key set de la entrada');
    assert.equal(cat.order, 17, 'D-43-22: order documental');
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

  test('los 3 slots referencian el slug COMPLETO de la categoria, nunca una version truncada (D-40-03)', () => {
    // `fare-indicativo` y `fare-indefiniti` comparten `fare-ind`, asi que un
    // prefijo truncado daria falsos positivos entre categorias; y una divergencia
    // de una letra respecto a RESET_PREFIXES_V13 dejaria la categoria fuera del
    // reset selectivo sin que ningun test lo dijera.
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
