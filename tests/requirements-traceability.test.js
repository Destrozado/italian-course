// tests/requirements-traceability.test.js
//
// v2.0 Phase 45 (DEUDA / D-45-12) — EL GATE DE TRAZABILIDAD DE REQUISITOS.
//
// Invariante que congela, sobre .planning/REQUIREMENTS.md:
//   1. La cifra de la linea de Coverage cuadra con el numero de filas de la
//      tabla de trazabilidad CONTADAS DEL DISCO.
//   2. El conjunto de IDs definidos como requisito y el conjunto de IDs
//      mapeados en la tabla coinciden EXACTAMENTE, en las dos direcciones.
//   3. La forma del documento sigue donde este gate la busca — porque si deja
//      de estarlo, las dos comprobaciones de arriba se quedarian sin nada que
//      mirar y pasarian en verde certificando nada.
//
// Se ejecuta de forma individual con:
//
//     node --test tests/requirements-traceability.test.js
//
// y entra en la INVOCACION CANONICA de la suite completa:
//
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// (los DOS globs, siempre. Este fichero no se declara en ningun sitio para
// entrar en la suite: lo engancha el glob, y que ningun *.test.js quede fuera
// de esos globs lo congela el bloque 6 de tests/count-arrays-lockstep.test.js.)
//
// ─────────────────────────────────────────────────────────────────────────
// POR QUE EXISTE ESTE FICHERO
// ─────────────────────────────────────────────────────────────────────────
//
// Por dos hechos, los dos medidos, no supuestos.
//
// PRIMERO: la linea `**Coverage: N/N requisitos mapeados …**` era una cifra
// ESCRITA A MANO al lado de una tabla que nadie derivaba. Decia `23/23` y
// nadie la comparaba con nada. Es la forma exacta del CR-01 de la Phase 44 —
// un test que asserto una cifra transcrita de la prosa de al lado y firmo en
// verde `247` con el reporter emitiendo `250`. Anadir filas a la tabla y
// actualizar esa cifra a mano habria dejado el documento mintiendo en la
// linea siguiente a las mentiras que la Phase 45 existe para pagar.
//
// SEGUNDO: DEUDA-01, DEUDA-02 y DEUDA-03 estuvieron declarados en
// .planning/ROADMAP.md y en NADA MAS. No existian en este documento
// (`grep -c DEUDA .planning/REQUIREMENTS.md` daba 0) mientras su Coverage
// seguia afirmando «0 huerfanos». Nadie se dio cuenta hasta que una persona
// los busco a mano en el research de la fase.
//
// LO QUE ESTE GATE SI CAZA Y LO QUE NO — medido contra el estado real previo,
// y escrito aqui para que nadie le atribuya una garantia que no da. Un
// requisito AUSENTE DE LAS DOS MITADES (ni definido ni mapeado, que es como
// estaban los tres DEUDA) deja el documento internamente CONSISTENTE, y este
// gate lo da por verde: no puede echar de menos lo que no aparece por ningun
// lado. Contra ese caso la unica defensa es el cruce con ROADMAP.md, que no
// se hace aqui. Lo que este gate SI caza es la edicion A MEDIAS —definir sin
// mapear, o mapear sin definir, o anadir filas sin tocar la cifra—, que es el
// modo de fallo realista de quien edita este documento con prisa, y es el que
// convierte un olvido en una cifra que miente.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const REQUIREMENTS_REL = '.planning/REQUIREMENTS.md';
const REQUIREMENTS_URL = new URL('../.planning/REQUIREMENTS.md', import.meta.url);

// LECTURA FAIL-LOUD, y a nivel de modulo. Un test que no puede leer su
// REFERENCIA no puede pasar en verde: sin el documento no hay veredicto
// posible, solo silencio. Es la polaridad OPUESTA a la del reporter
// (scripts/run-validation-271.mjs deriva su etiqueta de milestone fail-SOFT,
// porque alli una lectura que lanza mata el proceso sin imprimir una sola
// fila y convierte una etiqueta cosmetica en un blocker — leccion WR-09).
// Leidas juntas parecen inconsistentes, y por eso la razon va escrita en los
// dos sitios: alli la lectura decora, aqui la lectura ES el objeto del test.
//
// Y va a nivel de MODULO —no dentro de un test— a diferencia del bloque 7 de
// tests/count-arrays-lockstep.test.js, que la invoca dentro. Alli la
// referencia la necesitaba UN bloque de 36 tests y un fallo de carga se lee
// como «este fichero esta roto», no como «este gate se puso rojo». Aqui la
// necesitan LOS TRES tests del fichero: no hay nada que salvar tumbando solo
// uno. Silueta copiada de tests/content-fare-indefiniti.test.js.
// EXCEPCION MEDIDA, no supuesta (2026-08-13, cierre de v2.0): ENTRE MILESTONES
// el fichero NO EXISTE, y es un estado LEGITIMO del proyecto, no una averia.
// `/gsd-complete-milestone` lo archiva a `.planning/milestones/vX.Y-REQUIREMENTS.md`
// y lo retira con `git rm`; `/gsd-new-milestone` lo recrea. Se descubrio al cerrar
// v2.0: el borrado dejo la suite canonica en 1178/1179 con `# tests 1 / exit 1`
// — es decir, un fallo de CARGA, que el SUMMARY del plan 45-02 documenta
// explicitamente como «no es un gate poniendose rojo, es un fichero roto».
//
// Por eso la AUSENCIA se distingue de la CORRUPCION:
//   - fichero ausente (ENOENT)  -> los tres tests se SALTAN con motivo VISIBLE
//   - fichero presente pero ilegible/deforme -> fail-loud, como estaba
// Saltar en verde y en silencio seria justo el pase mudo que esta fase pago;
// `t.skip(motivo)` deja el motivo impreso en el TAP, asi que el hueco se ve.
const AUSENCIA = { ausente: true };
const SRC = (() => {
  try {
    return readFileSync(REQUIREMENTS_URL, 'utf-8');
  } catch (e) {
    if (e && e.code === 'ENOENT') return AUSENCIA;
    throw new Error(
      `No se puede leer ${REQUIREMENTS_REL} (${REQUIREMENTS_URL.pathname}), que es la ` +
        `REFERENCIA de disco contra la que se comprueba que la cobertura de requisitos se ` +
        `DERIVA en vez de transcribirse. El fichero EXISTE pero no se puede leer, asi que ` +
        `esto no es el hueco legitimo de entre-milestones: es una averia. Causa: ${e.message}`
    );
  }
})();

const ENTRE_MILESTONES = SRC === AUSENCIA;
const MOTIVO_SKIP =
  `${REQUIREMENTS_REL} no existe: el proyecto esta ENTRE MILESTONES (el fichero se archiva ` +
  `en .planning/milestones/ al cerrar y se recrea con /gsd-new-milestone). No hay documento ` +
  `que gatear; este gate vuelve solo en cuanto exista.`;

const LINEAS = ENTRE_MILESTONES ? [] : SRC.split('\n');

// ─────────────────────────────────────────────────────────────────────────
// Las anclas de forma del documento. Todas sin cuantificadores anidados
// (T-45-04-03) y con whitespace HORIZONTAL explicito ([^\S\n]) alli donde el
// hueco no debe cruzar una linea — la misma clase que WR-07 obligo a adoptar
// en el gate anti-ceguera, donde un `\s*` goloso daba por enganchado un valor
// que vivia en la linea siguiente.
// ─────────────────────────────────────────────────────────────────────────

const CABECERA_TRAZABILIDAD = /^##[^\S\n]+Traceability[^\S\n]*$/;

// La linea de Coverage: los DOS numeros, capturados por separado a proposito.
// Que el documento afirme `26/26` y no `26/24` es parte de lo que se congela.
const LINEA_COVERAGE = /^\*\*Coverage:[^\S\n]*([0-9]+)\/([0-9]+)\b/;

// Apertura y cierre de la seccion de requisitos. La apertura NO nombra el
// milestone (`## v2.0 Requirements` hoy, `## v2.1 Requirements` manana): se
// reconoce la PRIMERA cabecera de nivel 2 que termina en `Requirements`, para
// que abrir el milestone siguiente no exija editar este fichero.
const INICIO_REQUISITOS = /^##[^\S\n]+\S[^\n]*Requirements[^\S\n]*$/;
const FIN_REQUISITOS = /^##[^\S\n]+Future Requirements[^\S\n]*$/;

// Un ID de requisito, COMPLETO: prefijo en mayusculas y numero. Es la MISMA
// expresion en las dos extracciones a proposito — comparar dos conjuntos
// reconocidos con formas distintas produciria huerfanos fantasma.
const ID = '[A-Z][A-Z0-9]*-[0-9]+';

// Una FILA DE DATOS de la tabla: abre con `|`, y su primera celda es un ID
// completo. La fila de cabecera (`| Requirement | …`) y el separador de
// guiones (`|---…`) no casan, y no hay que enumerarlos para excluirlos.
const FILA_DE_DATOS = new RegExp(`^\\|[^\\S\\n]*(${ID})[^\\S\\n]*\\|`);

// Una DEFINICION de requisito: bullet con casilla, ID en negrita, dos puntos.
const DEFINICION = new RegExp(`^-[^\\S\\n]*\\[[ xX]\\][^\\S\\n]*\\*\\*(${ID})\\*\\*[^\\S\\n]*:`);

// ─────────────────────────────────────────────────────────────────────────
// Las tres extracciones. Ninguna lanza cuando no encuentra su ancla: devuelven
// lista vacia o null, y de eso se encargan las clausulas de no-vacuidad, que
// van PRIMERO en cada test. Un throw aqui convertiria un cambio de forma del
// documento en un fallo de CARGA, y la Phase 45 ya dejo escrito (45-02,
// desviacion 2) que un fallo de carga no se lee como «este gate se puso rojo».
// ─────────────────────────────────────────────────────────────────────────

const indiceDe = (re, desde = 0) => LINEAS.findIndex((l, i) => i >= desde && re.test(l));

const IDX_TRAZABILIDAD = indiceDe(CABECERA_TRAZABILIDAD);
const IDX_COVERAGE = IDX_TRAZABILIDAD === -1 ? -1 : indiceDe(LINEA_COVERAGE, IDX_TRAZABILIDAD);
const IDX_INICIO_REQUISITOS = indiceDe(INICIO_REQUISITOS);
const IDX_FIN_REQUISITOS = indiceDe(FIN_REQUISITOS);

// 1. FILAS DE TRAZABILIDAD, acotadas al tramo que va de la cabecera de la
//    seccion a la linea de Coverage. Acotar importa: sin el tramo, una tabla
//    de ejemplo en cualquier otra parte del documento entraria en el conteo.
const idsMapeados = (() => {
  if (IDX_TRAZABILIDAD === -1 || IDX_COVERAGE === -1) return [];
  return LINEAS.slice(IDX_TRAZABILIDAD + 1, IDX_COVERAGE)
    .map((l) => l.match(FILA_DE_DATOS))
    .filter(Boolean)
    .map((m) => m[1]);
})();

// 2. DEFINICIONES, acotadas a la seccion de requisitos. Los bullets de
//    `## Future Requirements` y `## Out of Scope` no llevan casilla ni ID, asi
//    que hoy no casarian igualmente — pero el tramo se acota de todas formas,
//    porque «hoy no casa» es una propiedad del texto de hoy y no un contrato.
const idsDefinidos = (() => {
  if (IDX_INICIO_REQUISITOS === -1 || IDX_FIN_REQUISITOS === -1) return [];
  return LINEAS.slice(IDX_INICIO_REQUISITOS + 1, IDX_FIN_REQUISITOS)
    .map((l) => l.match(DEFINICION))
    .filter(Boolean)
    .map((m) => m[1]);
})();

// 3. LA CIFRA ESCRITA. Es lo UNICO de este fichero que no se deriva: es
//    precisamente el dato bajo sospecha.
const cifraEscrita = (() => {
  if (IDX_COVERAGE === -1) return null;
  const m = LINEAS[IDX_COVERAGE].match(LINEA_COVERAGE);
  return m ? { mapeados: Number(m[1]), total: Number(m[2]) } : null;
})();

describe('trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)', () => {
  test('la forma del documento sigue donde este gate la busca', (t) => {
    if (ENTRE_MILESTONES) return t.skip(MOTIVO_SKIP);
    // Este test es el diagnostico que separa «un requisito esta huerfano» de
    // «el documento cambio de forma y el gate dejo de ver nada». Sin el, lo
    // segundo se manifestaria como lo primero, o peor: como verde.
    const anclasAusentes = [
      IDX_INICIO_REQUISITOS === -1 && 'la cabecera de la seccion de requisitos (`## … Requirements`)',
      IDX_FIN_REQUISITOS === -1 && 'la cabecera `## Future Requirements`, que la cierra',
      IDX_TRAZABILIDAD === -1 && 'la cabecera `## Traceability`',
      IDX_COVERAGE === -1 && 'la linea `**Coverage: N/N …**`',
    ].filter(Boolean);

    assert.deepEqual(
      anclasAusentes,
      [],
      `DEUDA / T-45-04-01: ${REQUIREMENTS_REL} ya no tiene la forma que este gate reconoce, ` +
        `asi que sus comprobaciones de cobertura no estarian mirando nada: falta ${anclasAusentes.join('; ')}. ` +
        `Si la forma cambio A PROPOSITO (milestone nuevo, plantilla nueva), la decision es ` +
        `consciente y toca actualizar las anclas de este fichero — que es exactamente para lo ` +
        `que existe este rojo: que la cobertura no deje de verificarse en silencio`
    );
  });

  test('la cifra escrita en la linea de Coverage cuadra con el conteo real de filas', (t) => {
    if (ENTRE_MILESTONES) return t.skip(MOTIVO_SKIP);
    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO. Un extractor por regex que deja
    // de casar devuelve lista vacia; comparar 0 contra 0 pasaria en VERDE
    // certificando nada, que es CR-01 verbatim. La referencia de esta clausula
    // NO es un numero escrito aqui —eso seria la misma cifra a mano que este
    // fichero existe para eliminar, comparandose consigo misma y verde para
    // siempre—: es la simple existencia de filas reconocidas.
    assert.ok(
      idsMapeados.length > 0,
      `DEUDA / T-45-04-01: el reconocimiento de filas ve 0 filas de trazabilidad en ` +
        `${REQUIREMENTS_REL}. O la tabla se quedo vacia, o el ancla dejo de reconocer sus ` +
        `filas — y con 0 filas la comprobacion de abajo compararia la cifra escrita contra ` +
        `la nada y pasaria en verde sin haber contado ni una fila`
    );

    assert.ok(
      cifraEscrita !== null,
      `DEUDA: ${REQUIREMENTS_REL} no declara ninguna linea \`**Coverage: N/N …**\`, asi que ` +
        `no hay cifra escrita que confrontar con las ${idsMapeados.length} filas contadas del disco`
    );

    assert.equal(
      cifraEscrita.mapeados,
      cifraEscrita.total,
      `DEUDA: la linea de Coverage se contradice a si misma — afirma ${cifraEscrita.mapeados} ` +
        `mapeados sobre ${cifraEscrita.total} requisitos, y a la vez «0 huerfanos»`
    );

    assert.equal(
      cifraEscrita.total,
      idsMapeados.length,
      `DEUDA / D-45-12: la linea de Coverage de ${REQUIREMENTS_REL} dice ` +
        `${cifraEscrita.mapeados}/${cifraEscrita.total} y la tabla de trazabilidad tiene ` +
        `${idsMapeados.length} filas contadas DEL DISCO. El numero bueno es ${idsMapeados.length}: ` +
        `se corrige LA CIFRA, no la tabla. Esta divergencia es la razon exacta por la que este ` +
        `gate existe — la cifra estuvo escrita a mano al lado de una tabla que nadie derivaba`
    );
  });

  test('cero DUPLICADOS en las dos mitades, que es lo que la linea de Coverage afirma (WR-01)', (t) => {
    if (ENTRE_MILESTONES) return t.skip(MOTIVO_SKIP);
    // POR QUE EXISTE ESTE TEST. La linea que este fichero congela dice, literalmente,
    // «0 huerfanos, 0 duplicados, 0 gaps». De las tres, la unicidad era la unica que
    // NADIE comprobaba: `idsMapeados.length` cuenta FILAS, no IDs distintos, y el cruce
    // de huerfanos usa `Array.prototype.includes`, que es ciego a las repeticiones.
    // Medido antes de este test: duplicar la fila de `DEUDA-03` y escribir
    // `Coverage: 27/27` dejaba la suite en `# pass 39 / # fail 0`. O sea, el documento
    // podia afirmar 27 requisitos teniendo 26 —con la propia linea diciendo «0
    // duplicados»— y el gate lo firmaba. Es la misma especie de cifra que miente que este
    // fichero existe para eliminar, un peldano mas abajo.
    assert.ok(
      idsMapeados.length > 0 && idsDefinidos.length > 0,
      `DEUDA / WR-01: la comprobacion de unicidad veria ${idsDefinidos.length} definiciones y ` +
        `${idsMapeados.length} filas en ${REQUIREMENTS_REL}, y sobre una lista vacia no hay ` +
        `duplicado posible: pasaria en verde sin haber mirado un solo ID`
    );

    const repetidos = (xs) => [...new Set(xs.filter((x, i) => xs.indexOf(x) !== i))];
    const duplicados = [
      ...repetidos(idsMapeados).map((id) => `${id}: fila de trazabilidad DUPLICADA`),
      ...repetidos(idsDefinidos).map((id) => `${id}: definido como requisito DOS veces`),
    ];

    assert.deepEqual(
      duplicados,
      [],
      `DEUDA / WR-01: la linea de Coverage de ${REQUIREMENTS_REL} afirma «0 duplicados» y hasta ` +
        `ahora nadie lo comprobaba. Una fila repetida infla el conteo de filas y deja pasar una ` +
        `cifra inflada EN VERDE, porque la cifra se compara contra el numero de filas y no ` +
        `contra el de requisitos distintos: ${duplicados.join('; ')}`
    );
  });

  test('cero huerfanos en las DOS direcciones: lo definido esta mapeado y lo mapeado esta definido', (t) => {
    if (ENTRE_MILESTONES) return t.skip(MOTIVO_SKIP);
    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO, por las dos extracciones: un
    // deepEqual de [] contra [] con los dos conjuntos vacios pasa en verde
    // habiendo cruzado exactamente nada.
    assert.ok(
      idsMapeados.length > 0 && idsDefinidos.length > 0,
      `DEUDA / T-45-04-01: el cruce veria ${idsDefinidos.length} definiciones contra ` +
        `${idsMapeados.length} filas en ${REQUIREMENTS_REL}, y con cualquiera de los dos ` +
        `conjuntos vacio no hay nada que cruzar: la comprobacion de abajo pasaria en verde ` +
        `sin haber comparado un solo ID. O el documento se vacio, o un ancla dejo de casar`
    );

    // IGUALDAD EXACTA DE CADENA, nunca inclusion de subcadena (T-45-04-02).
    // `Array.prototype.includes` compara ELEMENTOS por SameValueZero — no es
    // `String.prototype.includes`, que compara subcadenas y daria `DEUDA-0`
    // por mapeado en cuanto existiera `DEUDA-01`. Es la misma trampa que el
    // prefijo ambiguo `fare-ind` puso en el gate anti-ceguera. Quien edite
    // esto: no lo cambies por un `.some(m => m.includes(id))`.
    const huerfanos = [
      ...idsDefinidos
        .filter((id) => !idsMapeados.includes(id))
        .map((id) => `${id}: definido como requisito y SIN fila de trazabilidad`),
      ...idsMapeados
        .filter((id) => !idsDefinidos.includes(id))
        .map((id) => `${id}: con fila de trazabilidad y SIN definir como requisito`),
    ];

    assert.deepEqual(
      huerfanos,
      [],
      `DEUDA: ${REQUIREMENTS_REL} tiene requisitos huerfanos, y un requisito que vive en una ` +
        `sola mitad del documento es trabajo que ninguna auditoria posterior puede cruzar: ` +
        `${huerfanos.join('; ')}`
    );
  });
});
