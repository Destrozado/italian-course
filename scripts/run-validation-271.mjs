#!/usr/bin/env node
// scripts/run-validation-271.mjs
//
// Reporter de CIERRE DE MILESTONE — gate VAL-04 + VAL-06 + VAL-08 + VAL-09.
//
// QUÉ milestone está cerrando NO se transcribe en este fichero: se DERIVA en runtime
// del frontmatter de `.planning/STATE.md` (ver `milestoneActivo` más abajo, D-45-08).
// El encabezado impreso transcribía un milestone y una fase concretos, y así se quedó
// durante CUATRO milestones: nada podía ponerse rojo, porque no existía ni un solo test
// que cubriera la salida impresa de este fichero (v2.0 Phase 45, DEUDA-03). La cita
// verbatim de aquel banner, fechada, vive en 45-03-SUMMARY.md — aquí no, para que este
// fichero no vuelva a contener ninguna versión escrita a mano. Quien lo congela ahora es
// el bloque 7 de tests/count-arrays-lockstep.test.js, no esta prosa.
//
// EL `271` DEL NOMBRE DEL FICHERO ES HISTÓRICO (D-45-09). Codifica el conteo de v1.0.
// El conteo REAL lo computa este mismo fichero: `TOTAL_EXPECTED` (Σ de los `expected`
// de `CATEGORIES`), confrontado contra el disco por el guard de coherencia. El rename
// queda como DEUDA ACEPTADA y escrita, no como olvido: arrastra 17 call-sites
// load-bearing —dos de ellos DENTRO del gate anti-ceguera: la cadena de
// `COUNT_ARRAY_SOURCES` y la constante `REPORTER` de
// tests/count-arrays-lockstep.test.js— más cinco en un SKILL.md ejecutable, y dejaría
// de ser grepeable el historial de `.planning/`. El nombre no engaña sobre QUÉ gate
// corre; el que engañaba era el banner.
//
// Lee las categorías declaradas en `CATEGORIES`, un archivo `content/exercises/*.json`
// por categoría (orden lockeado D-VAL-22), aplica `deriveStatus` de Plan 09-01 sobre
// cada `validation.passes[]`, y verifica los sub-gates de abajo. Cuántas categorías y
// cuántos slots son NO se escribe aquí: los imprime el banner, interpolados.
//
// SUB-GATES (RESEARCH §Q5 + PATTERNS.md §run-validation-271):
//   1. VAL-04 — todos los validated tienen passes con ≥2 entries `correcta`
//      con `by` DISTINTOS (Set size ≥2). El override del autor en path-B
//      D-VAL-25 cuenta como una entry `by:"autor"` válida.
//   2. VAL-06 — TODOS los slots declarados en `CATEGORIES` con
//      `validation.status === "validated"` derivado por `deriveStatus` (fuente
//      única). Cuántos son lo dicta `TOTAL_EXPECTED`, nunca una cifra escrita aquí.
//      El relax local que vivía aquí se borró en CR-03: era estrictamente MÁS
//      PERMISIVO que la fuente única.
//   3. VAL-08 — cero ejercicios con `effectiveStatus === "disputed"`. La
//      cola D-VAL-25/26 procesa cada disputed hasta uno de los 3 caminos
//      cerrados (accept-fix / reject+override / rewrite manual).
//   4. VAL-09 (CR-03) — cero desincronías entre el `status` ESCRITO en el JSON y
//      el que deriva la fuente única. Era un warning meramente impreso, y
//      mientras lo fue el reporter podía cerrar el milestone contradiciendo el
//      fichero que acababa de leer.
//
// CONSTRAINT (arquitectónica): este script es POST-processing PURO. NO invoca
// Task(), NO orquesta subagents, NO muta JSONs, NO corre `node --test` (el
// smoke test estricto VAL-07 se activa como paso MANUAL separado tras el
// PASS — gesto consciente del autor al cierre del milestone, RESEARCH §Q5
// + §Q6). El reporter solo lee y reporta.
//
// JUSTIFICACIÓN de NO shellear `node --test` (RESEARCH §Q5 #2 + §TL;DR #4):
//   (a) Confunde exit-code semantics (test failure ≠ gate failure).
//   (b) Acopla dos responsabilidades (estado JSONs vs comportamiento código).
//   (c) El autor flippea VAL_07_STRICT=1 conscientemente como gesto de
//       milestone-close — debe ser acción separada y explícita, no efecto
//       secundario de correr el reporter.
//
// Uso:
//   node scripts/run-validation-271.mjs
//
// Exit codes:
//   0 — los sub-gates VAL-04 + VAL-06 + VAL-08 + VAL-09 PASS. Milestone gate PASS.
//       Autor procede al paso manual:
//       `VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js`
//       y luego `/gsd-complete-milestone <el milestone que el pie imprime>`. Qué
//       milestone es lo dice la salida, derivado del disco — nunca este comentario.
//   1 — al menos 1 sub-gate FAIL. Itera `/gsd-validate-batch` antes de cerrar.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Ruta del fichero de estado del proyecto. CONSTANTE: ningún componente procede de
// input, así que no hay superficie de path-traversal que modelar (T-45-03-02). Se
// resuelve con `resolve(projectRoot, …)`, que es la convención de `scripts/` — NO con
// `new URL('../…', import.meta.url)`, que es la de `tests/`. Son dos convenciones
// distintas y cada tier mantiene la suya.
const STATE_PATH = '.planning/STATE.md';

// El milestone que este gate está cerrando se DERIVA del disco, por el mismo principio
// que gobierna los counts (D-31-06: nunca número mágico). Transcrito estuvo CUATRO
// milestones desfasado —el banner nombraba una versión de hace cuatro— y nada podía
// ponerse rojo. Fuente: el frontmatter de STATE.md (D-45-08), que es YAML plano de una
// clave por línea y está trackeado en git, así que viaja con el código y no depende de
// tooling GSD ni de red. NO se deriva de `.planning/MILESTONES.md`: ese fichero solo
// registra los milestones YA ENTREGADOS, así que cambiaría un desfase de cuatro por uno
// de uno, con aire de estar arreglado.
//
// FAIL-SOFT DELIBERADO, y la razón va escrita porque leído junto al guard de coherencia
// de más abajo —que sí hace `process.exit(1)`— parece una inconsistencia y no lo es.
// Aquel guard protege el VEREDICTO del gate: si el conteo no cuadra, el veredicto no
// vale y el reporter no debe emitirlo. Esto de aquí es una ETIQUETA COSMÉTICA. Un
// `throw` (o un `exit`) a nivel de módulo por no poder leer un fichero de planning mata
// el proceso sin imprimir UNA SOLA FILA y convierte la etiqueta en un blocker del gate
// —lección WR-09, y por eso es `try/catch` con `?? null` y no una lectura desnuda.
//
// La regex captura UN SOLO TOKEN no-blanco, y las tres propiedades son deliberadas:
// (1) `[^\S\n]` es whitespace HORIZONTAL —la misma clase que el ancla del gate
// anti-ceguera—, así que no cruza saltos de línea; (2) no anida cuantificadores
// (T-44-03-03), así que no hay retroceso catastrófico sobre un fichero arbitrario;
// (3) `\S` excluye el retorno de carro, así que un STATE.md con terminación CRLF no
// arrastra el `\r` al banner, y el `.trim()` es cinturón y tirantes sobre esa misma
// propiedad. Capturar el resto de la línea en vez de un token dejaría que un fichero de
// estado malformado inyectase varias líneas —un banner arbitrario— en la salida que el
// autor lee para decidir un cierre de milestone (T-45-03-03).
// Y no lleva NINGUNA comilla, a propósito: `sinComentarios` —el escáner del gate
// anti-ceguera, que lee ESTE fichero— no reconoce literales de expresión regular, y una
// comilla suelta aquí desalinearía su escaneo de esta línea. Por lo mismo vive en su
// propia línea y lejos de `CATEGORIES`: ninguna línea de entrada del array puede
// compartir línea con un literal regex (T-45-03-05).
//
// LA SEGUNDA LECTURA ES DIAGNOSTICO, NO DATO (WR-04). El regex de arriba exige un token
// único, así que una edición benigna del frontmatter —`milestone: v2.0 final`— degrada el
// banner sin que nada diga por qué. Medido: el reporter imprimía «no se pudo derivar» y el
// pie afirmaba «las dos causas son reales: o falta el fichero, o no declara la clave
// milestone», con la clave delante y declarada. Un diagnóstico FALSO en un mensaje de
// error es del mismo tipo que un banner desfasado: le hace perder el tiempo al lector
// justo donde el fichero promete no hacerlo. Así que se distinguen las TRES causas reales,
// y la única que hacía falta añadir se detecta con una segunda lectura que solo mira si la
// clave está ahí. `[^\n]*` no cruza saltos de línea y no anida cuantificadores, las dos
// propiedades por las que el de arriba está escrito así.
//
// Y la línea se SANEA antes de salir a pantalla. El comentario de arriba razona que
// capturar el resto de la línea permitiría inyectar un banner arbitrario en la salida que
// el autor lee para decidir un cierre de milestone; esa cautela vale igual para el
// diagnóstico, que es el único sitio donde ese resto de línea llega a imprimirse. Se
// quitan los caracteres de control (una secuencia ANSI en STATE.md repintaría el banner) y
// se acota la longitud.
const saneada = (s) => s.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 80);

const derivacionDelMilestone = (() => {
  let raw;
  try {
    raw = readFileSync(resolve(projectRoot, STATE_PATH), 'utf8');
  } catch {
    return { valor: null, causa: `falta el fichero ${STATE_PATH}` };
  }
  const conToken = raw.match(/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m);
  if (conToken) return { valor: conToken[1].trim(), causa: null };
  const conClave = raw.match(/^milestone:[^\n]*$/m);
  if (conClave) {
    return {
      valor: null,
      causa: `${STATE_PATH} declara \`${saneada(conClave[0].trim())}\`, que no es un token único`,
    };
  }
  return { valor: null, causa: `${STATE_PATH} existe pero no declara ninguna clave milestone` };
})();

const milestoneActivo = derivacionDelMilestone.valor;

// Cuando no se puede derivar, la etiqueta dice QUE es desconocido y POR QUÉ, nombrando
// el fichero. Una etiqueta muda («milestone ?») sería un tercer modo de mentir: el autor
// no sabría si está leyendo un gate sobre el milestone que cree o sobre ninguno.
const etiquetaMilestone =
  milestoneActivo ?? `milestone desconocido (no se pudo derivar de ${STATE_PATH})`;

// ANSI colors zero-deps (clonar literal de run-validation-pilot.mjs).
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const ok = (txt) => `${GREEN}${txt}${RESET}`;
const fail = (txt) => `${RED}${txt}${RESET}`;
const warn = (txt) => `${YELLOW}${txt}${RESET}`;

// D-VAL-22 orden lockeado: riesgo-first (preposiciones) + alfabético resto.
// La suma de `expected` la COMPUTA `TOTAL_EXPECTED` unas líneas más abajo; aquí no se
// escribe ninguna cifra que pretenda decir cuánto vale hoy. Lo que sigue es HISTORIAL
// CONTABLE — audit trail deliberado que reconstruye la procedencia del total a lo largo
// de los milestones. Cada cifra de aquí abajo va fechada por su milestone y su fase y
// se lee como HISTORIA, no como descripción del comportamiento actual; el guard de
// coherencia no la consume. Historial del total:
//   373 = 272 (271 originales v1.0 + 1 ejercicio preposiciones-051 creado durante
//   la validación editorial de Phase 10) + 56 de la 8ª categoría `articoli`
//   (v1.2 Phase 11: 48 base + 2 match + 6 bridges) + 44 de la 9ª categoría
//   `partitivos` (v1.2 Phase 12: 37 base + 2 match + 5 clasificación PART-05) +
//   1 ejercicio preposiciones-052 (quick 260529-c35: 'da' = 'en casa de').
//   → 370 (v1.4 Phase 17, PILOT-05): Preposiciones se convirtió al shape
//   slot+variantes. La reagrupación dejó 47 slots reagrupados + 2 slots locativos
//   nuevos (PILOT-03: in-locativo, al-mare) = 49 slots reales (antes 52 ejercicios
//   payload). TOTAL = 373 − 52 + 49 = 370. El conteo `expected` de preposiciones
//   se mide como data.exercises.length (nº de slots), no nº de variantes.
//   → 348 (v1.5 Phase 19, ART-04): Articoli se convirtió al shape slot+variantes.
//   La reagrupación fundió 56 ejercicios payload por forma/disparador → 32 slots
//   (19-01) + 2 slots nuevos semiconsonánticos y/i+vocal por quórum cross-vendor
//   (19-02: articoli-lo-yi, articoli-gli-yi) = 34 slots reales. Las 56 superficies
//   fuente se preservaron 1:1 como variantes. TOTAL = 370 − 56 + 34 = 348. El
//   conteo `expected` de articoli se mide como data.exercises.length (nº de slots).
//   → 323 (v1.5 Phase 20, PART-03): Partitivos se convirtió al shape slot+variantes.
//   La reagrupación fundió 44 ejercicios payload por del-forma/disparador → 17 slots
//   (20-01) + 2 slots nuevos de suoni speciali plural por quórum cross-vendor
//   (20-02: partitivos-degli-gn, partitivos-degli-ps) = 19 slots reales. Las 44
//   superficies fuente se preservaron 1:1 como variantes (+6 superficies nuevas:
//   4 engordes de celdas pobres + 2 de los slots nuevos). TOTAL = 348 − 44 + 19 = 323.
//   El conteo `expected` de partitivos se mide como data.exercises.length (nº de slots).
//   → 320 (v1.6 Phase 22, AVE-01): Avere se convirtió al shape slot+variantes.
//   La reagrupación fundió 23 ejercicios payload por regla → 19 slots (22-01) +
//   1 slot nuevo `avere-ragione` por quórum cross-vendor (22-02) = 20 slots reales.
//   Las 23 superficies fuente se preservaron 1:1 como variantes (+14 superficies
//   nuevas: 6 engordes de presente + 3 sensaciones + 1 ragione + 4 passato).
//   TOTAL = 323 − 23 + 20 = 320. El conteo `expected` de avere se mide como
//   data.exercises.length (nº de slots).
//   → 307 (v1.6 Phase 23, ESS-01): Essere se convirtió al shape slot+variantes.
//   La reagrupación fundió 39 ejercicios payload por regla → 25 slots (23-01;
//   incluye el passato prossimo partido en 4 slots SEPARADOS por concordancia,
//   D-23-03: stato/stata/stati/state) + 1 slot nuevo `essere-ser-estar`
//   (D-23-07, calco español ser/estar) por quórum cross-vendor (23-02) = 26
//   slots reales. Las 39 superficies fuente se preservaron como variantes
//   (+14 superficies nuevas: 5 engordes de presente + 3 de nacionalidad + 2 de
//   localización absorbidas + 4 del slot ser/estar). TOTAL = 320 − 39 + 26 = 307.
//   El conteo `expected` de essere se mide como data.exercises.length (nº de slots).
//   → 277 (v1.6 Phase 24, MOV-01): Verbi di movimento se convirtió al shape
//   slot+variantes. La reagrupación fundió 37 ejercicios payload por REGLA DE
//   AUXILIAR (D-24-01); la concordancia quedó en 1 SOLO slot (D-24-03, divergencia
//   deliberada vs Essere, que la partió en 4) + correre como slot propio (D-24-04,
//   alterna essere/avere por destino) + slot excepcioni→avere + 3 word-buttons = 7
//   slots reales. Las 37 superficies fuente se preservaron como variantes (+N
//   superficies nuevas de los 4 ejes D-24-06: más verbos essere + más excepciones
//   avere + más test-de-destino + matriz de concordancia — variantes, NO slots, así
//   que NO suben el count). A diferencia de Essere (que SUBIÓ por el passato en 4
//   slots + ser/estar), aquí la concordancia es 1 solo slot y NO hay cruces, así que
//   el net BAJÓ. TOTAL = 307 − 37 + 7 = 277. El conteo `expected` de verbos-movimiento
//   se mide como data.exercises.length (nº de slots).
//   → 249 (v1.6 Phase 25, GEN-01): Genere e numero se convirtió al shape
//   slot+variantes. La reagrupación fundió 40 ejercicios payload a 1 SLOT POR
//   MICRO-REGLA (D-25-01, granularidad fina): plural -o/-i, -a/-e, -e/-i, sonido
//   duro -co/-go, invariables, femenino -o/-a, -tore/-trice, -e/-essa, articulo
//   por sonido + los 3 match preservados (D-25-03/D-04) = 12 slots reales (6 pares
//   de duplicados literales colapsados a variantes). Las 40 superficies fuente se
//   preservaron como variantes (+20 superficies nuevas de los 4 ejes D-25-04:
//   invariables + sonido duro con excepción amico→amici + género -trice/-essa +
//   plural base — variantes, NO slots, así que NO suben el count). A diferencia de
//   Verbi di movimento (granularidad por auxiliar), aquí la granularidad es FINA
//   (más slots por micro-regla) pero los 6 duplicados colapsados hacen que el net
//   BAJE: 40 payload → 12 slots. TOTAL = 277 − 40 + 12 = 249. El conteo `expected`
//   de genero-numero se mide como data.exercises.length (nº de slots).
//   → 209 (v1.6 Phase 26, PROF-01): Professioni se convirtió al shape slot+variantes
//   HIBRIDO. La reagrupación fundió 51 ejercicios payload a 11 slots reales: bloque
//   REGLA por sub-regla de feminización (D-26-03: -o/-a, -iere/-iera, -tore/-trice,
//   -e/-essa, invariabili) + bloque LEXICO PURO sin variantes (comprensión + 3 match
//   preservados D-26-02/D-04) + articolo-suono + word-buttons preservados (D-26-06).
//   Las 51 superficies fuente se preservaron como variantes (+12 superficies nuevas
//   SOLO de feminización D-26-04: contraste -trice/-essa + invariables -ista/-ante +
//   -o/-a y -iere/-iera — variantes, NO slots, así que NO suben el count; el bloque
//   léxico no recibió variantes, PROF-01). El net BAJÓ por la fusión a slot+variantes:
//   51 payload → 11 slots. TOTAL = 249 − 51 + 11 = 209. El conteo `expected`
//   de profesiones se mide como data.exercises.length (nº de slots).
//   → 183 (v1.6 Phase 27, SOST-01, CIERRE CONV-01): Sostantivi irregolari se
//   convirtió al shape slot+variantes HIBRIDO. La reagrupación fundió 31 ejercicios
//   payload (100% MC) a 5 slots reales: bloque REGLA por sub-regla (D-27-02:
//   sovrabbondanti -o→-a, invariabili-accentate, invariabili-straniere) + bloque
//   LEXICO PURO cambio-radice sin variantes (uomo/dio/bue/tempio, duplicado
//   #008==#025 como 2 variantes) + bloque CONTRASTE plurali-regolari sin engorde
//   (D-27-05). Las 31 superficies fuente se preservaron como variantes (+N
//   superficies nuevas SOLO del bloque regla D-27-03: sovrabbondanti + invariabili
//   acentuadas/extranjeras — variantes, NO slots, así que NO suben el count; el
//   bloque léxico y el contraste no recibieron variantes, SOST-01). El net BAJÓ por
//   la fusión a slot+variantes: 31 payload → 5 slots. TOTAL = 209 − 31 + 5 = 183.
//   Con esta conversión CONV-01 queda cerrado: 9/9 categorías de gramática en
//   slot+variantes → fin de v1.6. El conteo `expected` de sustantivos-irregulares
//   se mide como data.exercises.length (nº de slots).
//   → 195 (v1.7 Phase 31, PRES-07/INT-01): presente-regolare engancha al motor.
//   La 10ª categoría nació directamente en slot+variantes (Phase 30): 8 slots base
//   de regla (-are/-ere/-ire/-isc-/velar/palatal) + 4 cruces multi-cat con
//   avere/essere (Plan 31-01: presente-regolare-300..303, compuesto/presente-contraste
//   × avere/essere) = 12 slots reales. presente-regolare estaba AUSENTE de los 3
//   count arrays Y de TOTAL_EXPECTED hasta aquí (lockstep diferido por diseño); este
//   plan la AÑADE (no bumpea). TOTAL = 183 + 12 = 195. El conteo `expected` de
//   presente-regolare se DERIVA del JSON real en disco (D-31-06 dynamic-count, NO
//   número mágico), igual que el resto: data.exercises.length (nº de slots).
// `articoli` es alfabéticamente primero del resto, así que va justo tras
// preposiciones; `partitivos` ordena entre genero-numero y profesiones. El
// reporter falla si la suma encontrada en disco no coincide con el expected —
// protege contra archivos JSON con ejercicios borrados/duplicados.
// D-31-06 (dynamic-count): el expected de presente-regolare se DERIVA del JSON real
// en disco (8 slots base + 4 cruces = 12 hoy), NUNCA un número mágico. Si el JSON
// crece/encoge, el expected y TOTAL_EXPECTED se mueven con él automáticamente.
const slotCountOf = (file) =>
  JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8')).exercises.length;

const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
  { slug: 'articoli',                 file: 'content/exercises/articoli.json',                 expected: 34 },
  { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 20 },
  { slug: 'dimostrativi',             file: 'content/exercises/dimostrativi.json',             expected: slotCountOf('content/exercises/dimostrativi.json') },
  { slug: 'essere',                   file: 'content/exercises/essere.json',                   expected: 26 },
  // v2.0 Phase 44 (INT-02, D-44-06): las categorías de `fare` estaban registradas en
  // content/categories.json desde las Phases 41/42/43 pero AUSENTES de este array, así
  // que el reporter emitía `Milestone gate PASS` ciego a sus slots. expected DINÁMICO
  // (D-31-06) = exercises.length real en disco, NUNCA número mágico. Slug COMPLETO byte
  // a byte: `fare-ind` es prefijo ambiguo (D-40-03) y no se trunca jamás.
  { slug: 'fare-cond-imperativo',     file: 'content/exercises/fare-cond-imperativo.json',     expected: slotCountOf('content/exercises/fare-cond-imperativo.json') },
  { slug: 'fare-congiuntivo',         file: 'content/exercises/fare-congiuntivo.json',         expected: slotCountOf('content/exercises/fare-congiuntivo.json') },
  { slug: 'fare-indefiniti',          file: 'content/exercises/fare-indefiniti.json',          expected: slotCountOf('content/exercises/fare-indefiniti.json') },
  { slug: 'fare-indicativo',          file: 'content/exercises/fare-indicativo.json',          expected: slotCountOf('content/exercises/fare-indicativo.json') },
  { slug: 'genero-numero',            file: 'content/exercises/genero-numero.json',            expected: 13 },
  { slug: 'modali',                   file: 'content/exercises/modali.json',                   expected: slotCountOf('content/exercises/modali.json') },
  { slug: 'partitivos',               file: 'content/exercises/partitivos.json',               expected: 19 },
  { slug: 'possessivi',               file: 'content/exercises/possessivi.json',               expected: slotCountOf('content/exercises/possessivi.json') },
  { slug: 'presente-regolare',        file: 'content/exercises/presente-regolare.json',        expected: slotCountOf('content/exercises/presente-regolare.json') },
  { slug: 'profesiones',              file: 'content/exercises/profesiones.json',              expected: 11 },
  { slug: 'riflessivi',               file: 'content/exercises/riflessivi.json',               expected: slotCountOf('content/exercises/riflessivi.json') },
  { slug: 'sustantivos-irregulares',  file: 'content/exercises/sustantivos-irregulares.json',  expected: 5 },
  { slug: 'verbos-movimiento',        file: 'content/exercises/verbos-movimiento.json',        expected: 7 },
];

// TOTAL_EXPECTED = suma de los `expected` literales de CATEGORIES. Computado para que
// NUNCA divirja de la suma escrita a mano; el guard de abajo lo confronta con el disco.
const TOTAL_EXPECTED = CATEGORIES.reduce((s, c) => s + c.expected, 0);

// Guard de coherencia (D-31-06, reframeado v1.9 Phase 39 / INT-02): baseline DINÁMICO
// = Σ slotCountOf(c.file) sobre TODAS las categorías (lo que hay en disco AHORA); se
// confronta con TOTAL_EXPECTED (Σ de los `expected` literales). Si divergen, algún
// literal de CATEGORIES quedó desincronizado del JSON real. Sin número mágico: el
// baseline sigue automáticamente a cualquier alta/cambio de contenido (D-31-06).
// PROCEDENCIA (historial contable auditado, NO usado en el guard — solo memoria):
//   v1.6 Phase 27 (SOST-01, CIERRE CONV-01): baseline llegó a 183 slots (9 cats).
//   v1.7 Phase 31 (PRES-07/INT-01): 183 + presente-regolare(12) = 195 (10 cats).
//   v1.9 Phase 39 (INT-02): + dimostrativi/possessivi/modali/riflessivi + genero-numero
//   12→13 → el guard dinámico ya no cita 183; el total lo dicta el disco.
{
  const TOTAL_EXPECTED_BASELINE = CATEGORIES.reduce((s, c) => s + slotCountOf(c.file), 0);
  if (TOTAL_EXPECTED !== TOTAL_EXPECTED_BASELINE) {
    console.error(
      `Incoherencia de conteo: TOTAL_EXPECTED (Σ literales)=${TOTAL_EXPECTED} != ` +
      `Σ slotCountOf(disco)=${TOTAL_EXPECTED_BASELINE}. ` +
      `Revisa los expected literales de CATEGORIES vs el JSON real.`
    );
    process.exit(1);
  }
}

/**
 * El status efectivo de un ejercicio ES el que dicta `deriveStatus`. Sin relax
 * local, sin segunda opinión: `src/data/validation-state.js` es la fuente ÚNICA
 * (WR-01) que consumen el gate VAL-07, los scripts de pase y los tests de
 * contenido, y este reporter es el ÚLTIMO gate antes de `/gsd-complete-milestone`.
 *
 * POR QUÉ SE BORRÓ EL RELAX QUE VIVÍA AQUÍ (CR-03, code review de Phase 44).
 * Había una reimplementación local del override del autor: si `deriveStatus` daba
 * `disputed` pero existía una entry `{by:"autor", verdict:"correcta"}`, este
 * fichero la promovía a `validated`. Dejaba caer las TRES guardas que la fuente
 * única exige:
 *   1. el flag `override: true`, que es OBLIGATORIO y explícito precisamente
 *      «para que el override nunca ocurra por accidente ni por lectura de un
 *      prefijo en `concerns`»;
 *   2. el quórum (>=2 `correcta` con `by` distintos) — un override resuelve una
 *      disidencia, NO fabrica quórum;
 *   3. al menos una `correcta` de un MODELO, que es la propiedad
 *      anti-falsificación de T-42-03.
 * Era por tanto redundante Y estrictamente MÁS PERMISIVO que la función que
 * envolvía, y con la desincronía escrito-vs-derivado degradada a warning
 * impreso, el resultado era `Milestone gate PASS` sobre un ejercicio que la
 * fuente única llama `disputed`.
 *
 * La justificación que llevaba («D-VAL-25 camino b escribe
 * `validation.status = "validated"` directo en el JSON sin tocar `passes[]`»)
 * describía el mundo PRE-G-42-3. Ese mundo ya no existe: desde Phase 42
 * `deriveStatus` implementa el override del autor nativamente, con el flag
 * explícito y sin fabricar quórum.
 */
const effectiveStatus = (passes) => deriveStatus(passes);

/**
 * Carga defensiva de una categoría completa. Devuelve `{ok, exercises}` o
 * `{ok:false, error}`. NUNCA throws — el batch debe poder continuar reportando
 * el resto de categorías aunque una esté corrupta (defensa en profundidad
 * frente a T-10-02-02 del threat model).
 */
function loadCategory(file) {
  const absPath = resolve(projectRoot, file);
  let data;
  try {
    data = JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (err) {
    return { ok: false, error: `Error al leer ${file}: ${err.message}` };
  }
  if (!data || !Array.isArray(data.exercises)) {
    return { ok: false, error: `${file}: falta el campo "exercises" o no es array` };
  }
  return { ok: true, exercises: data.exercises };
}

// ─── Iteración por categoría ──────────────────────────────────────────────
const perCategory = [];
let anyLoadError = false;

for (const { slug, file, expected } of CATEGORIES) {
  const loaded = loadCategory(file);
  if (!loaded.ok) {
    anyLoadError = true;
    perCategory.push({
      slug,
      file,
      expected,
      total: 0,
      validated: 0,
      disputed: 0,
      pending: 0,
      missing: 0,
      disputedIds: [],
      missingMultiPassIds: [],
      inconsistencyIds: [],
      loadError: loaded.error,
    });
    continue;
  }

  const exercises = loaded.exercises;
  let validated = 0;
  let disputed = 0;
  let pending = 0;
  let missing = 0;
  const disputedIds = [];
  const missingMultiPassIds = [];
  const inconsistencyIds = [];

  for (const ex of exercises) {
    const v = ex?.validation;
    // Rama defensive: ejercicio sin `validation` field o sin `passes` array.
    // Esto cubre el estado pre-batch (la mayoría de los 269 pendientes hoy)
    // y NO crashea el reporter — solo lo cuenta como missing.
    if (!v || typeof v !== 'object' || !Array.isArray(v.passes)) {
      missing++;
      continue;
    }

    const passes = v.passes;
    const eff = effectiveStatus(passes);

    if (eff === 'validated') {
      validated++;
      // VAL-04 enforcement: entre los validated, contar entries `correcta`
      // con `by` DISTINTOS. El override del autor (`by:"autor"`) cuenta
      // como una de las ≥2 distinct (D-VAL-25 camino b lo prevé).
      const distinctBy = new Set(
        passes
          .filter(p => p?.verdict === 'correcta')
          .map(p => p?.by)
          .filter(Boolean)
      );
      if (distinctBy.size < 2) {
        missingMultiPassIds.push(ex.id);
      }
    } else if (eff === 'disputed') {
      disputed++;
      disputedIds.push(ex.id);
    } else {
      pending++;
    }

    // Sub-gate de consistencia (CR-03): si el `status` escrito en el JSON difiere
    // del derivado por la fuente única, hay desincronía (edición manual descuidada,
    // override legacy sin el flag `override: true`, race condition). Esto ERA un
    // warning meramente impreso que ningún gate consumía, y eso es lo que permitía
    // que el reporter imprimiera PASS mientras contradecía el JSON que acababa de
    // leer. Ahora entra en VAL-09 y el gate no puede cerrar por encima de él.
    if (typeof v.status === 'string' && v.status !== eff) {
      inconsistencyIds.push(`${ex.id} (escrito="${v.status}", derivado="${eff}")`);
    }
  }

  perCategory.push({
    slug,
    file,
    expected,
    total: exercises.length,
    validated,
    disputed,
    pending,
    missing,
    disputedIds,
    missingMultiPassIds,
    inconsistencyIds,
  });
}

// ─── Imprimir tabla colorizada ────────────────────────────────────────────
console.log('');
// El banner no transcribe NADA: el milestone viene del disco y las dos cifras son las
// que este mismo fichero ya computa. La fase desapareció a propósito (D-45-10): lo que
// se está gateando es el CIERRE DEL MILESTONE, no una fase, y «gate Phase 10» no
// significaba nada desde hacía cuatro milestones. La enumeración de sub-gates se queda:
// es verdad y no es una cifra.
console.log(
  `${BOLD}Gate de cierre de ${etiquetaMilestone} — VAL-04 + VAL-06 + VAL-08 + VAL-09 ` +
  `(${CATEGORIES.length} categorías, ${TOTAL_EXPECTED} slots)${RESET}`
);
console.log('');

const colWidths = {
  categoria: 24,
  total: 8,
  validated: 10,
  disputed: 9,
  pending: 8,
  missing: 8,
};

const headerRow =
  'Categoría'.padEnd(colWidths.categoria) +
  ' | ' +
  'Total'.padEnd(colWidths.total) +
  ' | ' +
  'Validated'.padEnd(colWidths.validated) +
  ' | ' +
  'Disputed'.padEnd(colWidths.disputed) +
  ' | ' +
  'Pending'.padEnd(colWidths.pending) +
  ' | ' +
  'Missing'.padEnd(colWidths.missing);

console.log(headerRow);
console.log('-'.repeat(headerRow.length));

for (const r of perCategory) {
  if (r.loadError) {
    console.log(
      r.slug.padEnd(colWidths.categoria) +
        ' | ' +
        fail('ERROR DE CARGA — el archivo no se pudo leer/parsear'),
    );
    console.log(`        ${warn('→ ' + r.loadError)}`);
    continue;
  }

  console.log(
    r.slug.padEnd(colWidths.categoria) +
      ' | ' +
      String(r.total).padEnd(colWidths.total) +
      ' | ' +
      String(r.validated).padEnd(colWidths.validated) +
      ' | ' +
      String(r.disputed).padEnd(colWidths.disputed) +
      ' | ' +
      String(r.pending).padEnd(colWidths.pending) +
      ' | ' +
      String(r.missing).padEnd(colWidths.missing),
  );

  if (r.disputed > 0) {
    console.log(`        ${warn('→ Disputed IDs: ' + r.disputedIds.join(', '))}`);
  }
  if (r.missing > 0) {
    console.log(`        ${warn('→ Missing validation: ' + r.missing + ' ejercicios sin campo validation o passes[]')}`);
  }
  if (r.inconsistencyIds.length > 0) {
    console.log(`        ${warn('→ Inconsistencia status escrito vs derivado: ' + r.inconsistencyIds.join('; '))}`);
  }
  if (r.total !== r.expected) {
    console.log(`        ${warn(`→ Total ${r.total} ≠ esperado ${r.expected} para ${r.slug}`)}`);
  }
}

// ─── Sub-gates VAL-04 + VAL-06 + VAL-08 ───────────────────────────────────
const totalValidated = perCategory.reduce((s, r) => s + r.validated, 0);
const totalDisputed  = perCategory.reduce((s, r) => s + r.disputed, 0);
const totalPending   = perCategory.reduce((s, r) => s + r.pending, 0);
const totalMissing   = perCategory.reduce((s, r) => s + r.missing, 0);
const totalActual    = perCategory.reduce((s, r) => s + r.total, 0);

console.log('');
console.log(`${BOLD}Sub-gates:${RESET}`);

// VAL-06: los TOTAL_EXPECTED slots con effectiveStatus === "validated" Y total real en
// disco == TOTAL_EXPECTED. La cifra la interpola el propio mensaje impreso; escribirla
// aquí sería plantar la siguiente CR-01 (una prosa que envejece sola).
const val06Pass =
  totalValidated === TOTAL_EXPECTED &&
  totalActual === TOTAL_EXPECTED &&
  !anyLoadError;
console.log(
  `  VAL-06 (${TOTAL_EXPECTED}/${TOTAL_EXPECTED} validated): ${
    val06Pass
      ? ok(`PASS (${totalValidated}/${TOTAL_EXPECTED})`)
      : fail(`FAIL (${totalValidated}/${TOTAL_EXPECTED} — pending=${totalPending}, missing=${totalMissing}, disputed=${totalDisputed})`)
  }`
);

// VAL-08: cero disputed (todos los disputed resueltos por la cola D-VAL-25/26).
const allDisputedIds = perCategory.flatMap(r => r.disputedIds);
const val08Pass = totalDisputed === 0;
console.log(
  `  VAL-08 (cero disputed): ${
    val08Pass
      ? ok(`PASS`)
      : fail(`FAIL (${totalDisputed} disputed: ${allDisputedIds.join(', ')})`)
  }`
);

// VAL-04: entre los validated, todos con ≥2 entries `correcta` con `by` distintos.
const allMissingMultiPassIds = perCategory.flatMap(r => r.missingMultiPassIds);
const val04Pass = allMissingMultiPassIds.length === 0;
console.log(
  `  VAL-04 (≥2 distinct AIs por validated): ${
    val04Pass
      ? ok(`PASS`)
      : fail(`FAIL (${allMissingMultiPassIds.length} IDs sin ≥2 distinct by: ${allMissingMultiPassIds.join(', ')})`)
  }`
);

// VAL-09 (CR-03): cero desincronías entre el `status` ESCRITO en el JSON y el
// derivado por la fuente única. Era un warning impreso que ningún gate consumía;
// mientras lo fue, el reporter podía imprimir `Milestone gate PASS` discrepando del
// fichero que acababa de leer, que es la mitad de CR-03 que no arregla el borrado
// del relax local.
const allInconsistencyIds = perCategory.flatMap(r => r.inconsistencyIds);
const val09Pass = allInconsistencyIds.length === 0;
console.log(
  `  VAL-09 (status escrito == derivado): ${
    val09Pass
      ? ok(`PASS`)
      : fail(`FAIL (${allInconsistencyIds.length} desincronizados: ${allInconsistencyIds.join('; ')})`)
  }`
);

const gatePass = val06Pass && val08Pass && val04Pass && val09Pass;

// ─── Exit gate ────────────────────────────────────────────────────────────
console.log('');
if (gatePass) {
  console.log(ok(`${BOLD}Milestone gate PASS.${RESET}`));
  console.log('');
  console.log(`${BOLD}Siguiente paso (manual, gesto consciente del autor):${RESET}`);
  console.log('  VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js');
  console.log('  → verifica smoke test paramétrico exit 0.');
  // Forma con GUION (D-45-11): la de dos puntos era la vieja y el resto del repo usa
  // esta. Y si el milestone no se pudo derivar, la línea NO deja un comando roto
  // pegado — dice que falta el dato y de dónde sale, que es accionable; recomendar
  // `/gsd-complete-milestone milestone desconocido (…)` no lo sería.
  console.log(
    milestoneActivo
      ? `  → si OK: /gsd-complete-milestone ${milestoneActivo}`
      : `  → si OK: /gsd-complete-milestone <milestone>, con el que declare ${STATE_PATH}. ` +
        `No se pudo derivar: ${derivacionDelMilestone.causa}. Por eso el banner de arriba ` +
        `tampoco lo nombra.`
  );
  console.log('');
  process.exit(0);
} else {
  console.log(fail(`${BOLD}Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.${RESET}`));
  console.log('');
  console.log('Acciones sugeridas según qué sub-gate falla:');
  if (!val06Pass) {
    console.log('  - VAL-06: ejecuta /gsd-validate-batch --all-pending para procesar los pendientes/missing.');
  }
  if (!val08Pass) {
    console.log('  - VAL-08: ejecuta /gsd-validate-batch <id1,id2,...> sobre los IDs disputed listados arriba.');
  }
  if (!val04Pass) {
    console.log('  - VAL-04: investiga manualmente los IDs sin ≥2 distinct by (probable corrupción del JSON o passes[] con by duplicado).');
  }
  if (!val09Pass) {
    console.log('  - VAL-09: el `status` escrito discrepa del que deriva src/data/validation-state.js.');
    console.log('    Causa típica: un override del autor ANTERIOR a G-42-3 (Phase 42), escrito como');
    console.log('    `[override]` dentro de `concerns` pero SIN el flag `override: true` en la entry.');
    console.log('    La fuente única se niega deliberadamente a inferir el override desde el prefijo');
    console.log('    de `concerns`, así que la migración es explícita: añade `"override": true` a la');
    console.log('    entry `by:"autor"` de cada ID listado, o retira el `status` escrito a mano.');
  }
  if (anyLoadError) {
    console.log('  - Carga: uno o más JSONs no se pudieron leer/parsear (ver warnings arriba). Repara el JSON corrupto antes de re-correr.');
  }
  console.log('');
  process.exit(1);
}
