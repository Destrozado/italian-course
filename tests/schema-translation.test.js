// tests/schema-translation.test.js
//
// Phase 46 plan 01 — la matriz de SCHEMA del campo `translationES` (SCH-01/02/03).
//
//   SCH-01  `translationES` se ACEPTA en variantes `multiple-choice`, con `text`
//           string no vacío y sin el hueco `___` (D-46-03).
//   SCH-02  `translationES` se RECHAZA en variantes `match` y `word-buttons`,
//           por PRESENCIA de la clave y nunca por su contenido (D-46-04).
//   SCH-03  `schemaVersion` sigue en 13: NO hay migración 13→14, y un state
//           pre-existente sobrevive al boot con su progreso intacto (D-46-05).
//
// Molde: `validateContent` con documentos inline mínimos por la rama `variants[]`
// (tests/exercise-types.test.js:104-126) y, para la retrocompatibilidad, el
// `content/exercises/preposiciones.json` REAL leído de disco.
//
// D-31-06 / CR-01 de la Phase 44: toda cifra que un gate congela se DERIVA del
// disco. Aquí eso significa que el número de slots del corpus se cuenta y que el
// `13` de SCH-03 se lee del módulo que lo gobierna — no se escribe dos veces.
//
// Se ejecuta con:  node --test tests/*.test.js tests/fixtures/*.test.js   (Node 22 LTS o superior)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { validateContent } from '../src/data/schema-validator.js';
import { blankState, loadState } from '../src/data/storage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const readRepo = (rel) => readFileSync(resolve(projectRoot, rel), 'utf8');
const readJson = (rel) => JSON.parse(readRepo(rel));

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de documento mínimo
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIAS = [{ id: 'preposiciones', name: 'Preposiciones', order: 1 }];

/** Construye un doc de un solo slot con la rama `variants[]` y lo valida. */
function validarSlot({ type, variants, explanation = 'Regla de prueba a nivel de slot.' }) {
  return validateContent({
    categories: CATEGORIAS,
    exercisesByFile: {
      'prueba.json': [
        { id: 'slot-prueba', type, categoryIds: ['preposiciones'], explanation, variants }
      ]
    }
  });
}

/** Superficie válida de `multiple-choice` (el hueco `___` es obligatorio). */
const mc = (extra = {}) => ({
  prompt: 'Paolo è ___ Napoli di nascita.',
  options: ['di', 'a', 'da'],
  correctIndex: 0,
  ...extra
});

/** Superficie válida de `word-buttons`. */
const wb = (extra = {}) => ({ prompt: 'Paolo es de Nápoles.', answer: ['Paolo', 'è', 'di', 'Napoli'], ...extra });

/** Superficie válida de `match`. */
const mt = (extra = {}) => ({
  prompt: 'Empareja preposición y uso.',
  pairs: [['di', 'origen'], ['a', 'ubicación']],
  ...extra
});

/** Concatena las razones de los errores para buscar mensajes y labels. */
const razones = (result) => result.errors.map((e) => e.reason);

/** ¿Hay algún error cuya razón contenga TODOS los fragmentos dados? */
const hayError = (result, ...fragmentos) =>
  razones(result).some((r) => fragmentos.every((f) => r.includes(f)));

// Los dos mensajes de SCH-01 y el de SCH-02, tal como los fija el
// `46-UI-SPEC.md §Copywriting Contract` (el prefijo de `label` lo añaden las
// reglas hermanas del validator, ver src/data/schema-validator.js:441).
const MSG_TEXT_VACIO = 'debe ser string no vacío si translationES está presente';
const MSG_HUECO = 'no puede contener "___" — la traducción es de la frase YA RESUELTA';
const MSG_NO_PERMITIDO = 'no está permitido en variantes de tipo "match" / "word-buttons"';

// ═════════════════════════════════════════════════════════════════════════════
// SCH-01 · aceptación en multiple-choice
// ═════════════════════════════════════════════════════════════════════════════

describe('SCH-01 — translationES se acepta en variantes multiple-choice', () => {
  test('variante con translationES bien formado → válido', () => {
    const r = validarSlot({
      type: 'multiple-choice',
      variants: [mc({ translationES: { text: 'Paolo es de Nápoles de nacimiento.', validation: { status: 'pending', passes: [] } } })]
    });
    assert.equal(r.ok, true, `Errores inesperados: ${JSON.stringify(r.errors)}`);
  });

  test('translationES AUSENTE → válido (retrocompat, el campo es opcional)', () => {
    const r = validarSlot({ type: 'multiple-choice', variants: [mc(), mc()] });
    assert.equal(r.ok, true, `Errores inesperados: ${JSON.stringify(r.errors)}`);
  });

  test('text = "" → RECHAZA con el mensaje del contrato', () => {
    const r = validarSlot({ type: 'multiple-choice', variants: [mc({ translationES: { text: '' } })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_TEXT_VACIO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('text solo con espacios → RECHAZA', () => {
    const r = validarSlot({ type: 'multiple-choice', variants: [mc({ translationES: { text: '   ' } })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_TEXT_VACIO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('text ausente dentro del sub-objeto → RECHAZA', () => {
    const r = validarSlot({ type: 'multiple-choice', variants: [mc({ translationES: {} })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_TEXT_VACIO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('text con el hueco de tres guiones bajos → RECHAZA con el segundo mensaje (D-46-03)', () => {
    const r = validarSlot({
      type: 'multiple-choice',
      variants: [mc({ translationES: { text: 'Paolo es ___ Nápoles de nacimiento.' } })]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_HUECO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('el mensaje ubica la variante por su label (variants[k])', () => {
    const r = validarSlot({
      type: 'multiple-choice',
      variants: [mc(), mc({ translationES: { text: '' } })]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, 'variants[1].translationES.text', MSG_TEXT_VACIO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('dos variantes hermanas con text IDÉNTICO → válidas (el schema no exige unicidad)', () => {
    const gemela = { text: 'Paolo es de Nápoles de nacimiento.' };
    const r = validarSlot({
      type: 'multiple-choice',
      variants: [mc({ translationES: { ...gemela } }), mc({ translationES: { ...gemela } })]
    });
    assert.equal(r.ok, true, `Errores inesperados: ${JSON.stringify(r.errors)}`);
  });

  test('el schema NO normaliza ni recorta: NFC y NFD son ambos válidos', () => {
    const nfc = 'Paolo es de Nápoles de nacimiento.'.normalize('NFC');
    const nfd = 'Paolo es de Nápoles de nacimiento.'.normalize('NFD');
    // No-vacuidad: las dos formas tienen que ser DE VERDAD distintas byte a byte,
    // o este test compararía el mismo string consigo mismo dos veces.
    assert.notEqual(nfc, nfd, 'NFC y NFD deben diferir para que la prueba valga algo');

    for (const [forma, texto] of [['NFC', nfc], ['NFD', nfd]]) {
      const r = validarSlot({ type: 'multiple-choice', variants: [mc({ translationES: { text: texto } })] });
      assert.equal(r.ok, true, `${forma} rechazado: ${JSON.stringify(r.errors)}`);
    }
  });

  test('la validación NO depende del orden del array variants (D-46-02)', () => {
    const conTrad = mc({ translationES: { text: 'Paolo es de Nápoles de nacimiento.' } });
    const sinTrad = mc({ prompt: 'Maria viene da Pisa, ma è ___ Roma di nascita.' });

    const directo = validarSlot({ type: 'multiple-choice', variants: [conTrad, sinTrad] });
    const invertido = validarSlot({ type: 'multiple-choice', variants: [sinTrad, conTrad] });

    assert.equal(directo.ok, true, `orden directo: ${JSON.stringify(directo.errors)}`);
    assert.equal(invertido.ok, true, `orden invertido: ${JSON.stringify(invertido.errors)}`);
    assert.deepEqual(razones(directo), razones(invertido), 'reordenar variantes cambió el veredicto');
  });

  test('reordenar variantes con un error tampoco mueve la traducción de frase (veredicto estable)', () => {
    const malo = mc({ translationES: { text: '' } });
    const bueno = mc({ translationES: { text: 'Paolo es de Nápoles de nacimiento.' } });

    const a = validarSlot({ type: 'multiple-choice', variants: [malo, bueno] });
    const b = validarSlot({ type: 'multiple-choice', variants: [bueno, malo] });

    assert.equal(a.ok, false);
    assert.equal(b.ok, false);
    // El error viaja CON su variante: en `a` es la 0, en `b` es la 1. El índice
    // sigue a la frase, no a una posición fija — que es exactamente por lo que se
    // descartó la validación indexada a nivel de slot (D-46-02).
    assert.ok(hayError(a, 'variants[0].translationES.text'), `a: ${JSON.stringify(razones(a))}`);
    assert.ok(hayError(b, 'variants[1].translationES.text'), `b: ${JSON.stringify(razones(b))}`);
    assert.equal(razones(a).length, razones(b).length, 'el número de errores debe ser el mismo');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCH-02 · rechazo estructural en word-buttons y match (D-46-04)
// ═════════════════════════════════════════════════════════════════════════════

describe('SCH-02 — translationES se rechaza en word-buttons y match (D-46-04)', () => {
  test('word-buttons con translationES en la PRIMERA variante → rechaza con label variants[0]', () => {
    const r = validarSlot({
      type: 'word-buttons',
      variants: [wb({ translationES: { text: 'Paolo es de Nápoles.' } }), wb()]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, 'variants[0].translationES', MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('word-buttons con translationES en la ÚLTIMA variante → rechaza con el label de esa variante', () => {
    const r = validarSlot({
      type: 'word-buttons',
      variants: [wb(), wb(), wb({ translationES: { text: 'Paolo es de Nápoles.' } })]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, 'variants[2].translationES', MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('match de 3 variantes con translationES en la SEGUNDA → rechaza con label variants[1]', () => {
    const r = validarSlot({
      type: 'match',
      variants: [mt(), mt({ translationES: { text: 'Paolo es de Nápoles.' } }), mt()]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, 'variants[1].translationES', MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('el rechazo es ESTRUCTURAL: translationES = {} en match → rechaza igual', () => {
    const r = validarSlot({ type: 'match', variants: [mt({ translationES: {} })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('el rechazo es ESTRUCTURAL: text = "" en word-buttons → rechaza igual', () => {
    const r = validarSlot({ type: 'word-buttons', variants: [wb({ translationES: { text: '' } })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
  });

  test('el rechazo NO inspecciona el texto: acentuado en match → rechaza igual', () => {
    const r = validarSlot({ type: 'match', variants: [mt({ translationES: { text: 'Él está en Nápoles' } })] });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_NO_PERMITIDO), `razones: ${JSON.stringify(razones(r))}`);
    // Ninguna forma de acento o escape puede esquivar un rechazo por presencia:
    // el validador nunca mira `text` en estos dos tipos.
    assert.ok(!hayError(r, MSG_TEXT_VACIO), 'el rechazo no debe pasar por la validación de contenido');
  });

  test('word-buttons y match SIN translationES siguen validando (el rechazo no daña la retrocompat)', () => {
    assert.equal(validarSlot({ type: 'word-buttons', variants: [wb(), wb()] }).ok, true);
    assert.equal(validarSlot({ type: 'match', variants: [mt(), mt()] }).ok, true);
  });

  test('el rechazo se evalúa por variante: dos variantes infractoras → dos errores distintos', () => {
    const r = validarSlot({
      type: 'word-buttons',
      variants: [wb({ translationES: { text: 'uno' } }), wb(), wb({ translationES: { text: 'dos' } })]
    });
    assert.equal(r.ok, false);
    const infractoras = razones(r).filter((x) => x.includes(MSG_NO_PERMITIDO));
    assert.equal(infractoras.length, 2, `esperaba 2 rechazos independientes: ${JSON.stringify(razones(r))}`);
    assert.ok(hayError(r, 'variants[0].translationES', MSG_NO_PERMITIDO));
    assert.ok(hayError(r, 'variants[2].translationES', MSG_NO_PERMITIDO));
  });

  test('el rechazo acumula sin early-return: conviven con otros errores de la superficie (D-08)', () => {
    const r = validarSlot({
      type: 'word-buttons',
      variants: [{ prompt: '', answer: [], translationES: { text: 'Paolo es de Nápoles.' } }]
    });
    assert.equal(r.ok, false);
    assert.ok(hayError(r, MSG_NO_PERMITIDO), 'falta el rechazo de translationES');
    assert.ok(hayError(r, 'variants[0].prompt'), 'falta el error de prompt vacío');
    assert.ok(hayError(r, 'variants[0].answer'), 'falta el error de answer vacío');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Retrocompatibilidad sobre el CORPUS REAL (no sobre un fixture)
// ═════════════════════════════════════════════════════════════════════════════

describe('retrocompat — el corpus v2.0 real valida con el campo nuevo presente', () => {
  // Todas las cifras de este bloque se DERIVAN del disco (D-31-06). Un literal
  // aquí certificaría en verde el corpus de ayer.
  //
  // POR QUÉ ESTE BLOQUE SE REESCRIBIÓ EN EL PLAN 46-04. Su primera redacción
  // congelaba la POBLACIÓN del tracer: «exactamente UNA variante lleva
  // translationES» y «las sin traducir son variantesTotales - 1». Las dos cifras
  // eran el estado TRANSITORIO del piloto de una frase (plan 46-01) y caducaron
  // en cuanto el 46-04 autoró las 95 restantes — el propio mensaje del test lo
  // anticipaba. Cambiar el `1` por un `96` habría repetido exactamente el error
  // que D-31-06 prohíbe (y que el CR-01 de la Phase 44 ya pagó: una suite
  // firmando 247 con el reporter en 250). Lo que este bloque vigila NO es cuántas
  // traducciones hay — eso lo mide el sub-gate TRAD-COV del reporter, derivado
  // del disco — sino el INVARIANTE que la población no cambia:
  //   · el bundle completo sigue validando con el campo presente,
  //   · toda traducción presente está bien formada (no vacía, sin el hueco),
  //   · SÓLO las variantes multiple-choice lo llevan (SCH-02),
  //   · y siguen existiendo variantes SIN el campo, que es lo que hace que la
  //     palabra «retrocompat» signifique algo.
  const categoriasReales = readJson('content/categories.json').categories;
  const ficheros = categoriasReales.map((c) => `content/exercises/${c.id}.json`);

  const exercisesByFile = {};
  for (const rel of ficheros) exercisesByFile[rel] = readJson(rel).exercises;

  const slots = Object.values(exercisesByFile).flat();
  const slotsTotales = slots.length;

  // Cada variante ACOMPAÑADA del tipo de su slot: el tipo es lo que gobierna
  // SCH-02, y sin él las aserciones de abajo no podrían distinguir una infracción
  // de un caso legítimo.
  const variantes = slots.flatMap((ex) =>
    (Array.isArray(ex.variants) ? ex.variants : []).map((v) => ({ tipo: ex.type, id: ex.id, v }))
  );
  const variantesTotales = variantes.length;
  const conTraduccion = variantes.filter(({ v }) => v?.translationES !== undefined);
  const sinTraduccion = variantes.filter(({ v }) => v?.translationES === undefined);
  const noMultipleChoice = variantes.filter(({ tipo }) => tipo !== 'multiple-choice');

  test('no-vacuidad: el corpus leído del disco tiene categorías, slots y variantes', () => {
    assert.ok(categoriasReales.length > 0, 'content/categories.json no declara ninguna categoría');
    assert.ok(slotsTotales > 0, 'el corpus leído no tiene ni un slot: el escáner dejó de ver el disco');
    assert.ok(variantesTotales >= slotsTotales, 'cada slot aporta al menos una variante');
  });

  test('el corpus COMPLETO valida en un solo bundle (ok true, cero errores)', () => {
    const r = validateContent({ categories: categoriasReales, exercisesByFile });
    assert.equal(r.ok, true, `El corpus real deja de validar: ${JSON.stringify(r.errors)}`);
    assert.deepEqual(r.errors, []);
  });

  test('el corpus SÍ lleva traducciones y TODAS están bien formadas (no vacías, sin el hueco)', () => {
    // NO-VACUIDAD PRIMERO: con cero traducciones el «todas bien formadas» de abajo
    // pasaría en VERDE sin haber mirado ninguna (deepEqual([], []) pasa — precedente
    // tests/count-arrays-lockstep.test.js:747-759). Y ese verde es justo el que hay
    // que impedir: describiría un corpus que perdió el campo entero.
    assert.ok(
      conTraduccion.length > 0,
      'ninguna variante del corpus lleva translationES: o el corpus perdió las traducciones, ' +
        'o el extractor dejó de reconocer el campo'
    );
    const malformadas = conTraduccion
      .filter(({ v }) => {
        const t = v.translationES?.text;
        return typeof t !== 'string' || !t.trim() || t.includes('___');
      })
      .map(({ id, v }) => `${id}: ${JSON.stringify(v.translationES?.text)}`);
    assert.deepEqual(
      malformadas,
      [],
      `hay traducciones vacías o que arrastran el hueco "___" (D-46-03): ${malformadas.join(' | ')}`
    );
  });

  test('SCH-02 sobre el corpus REAL: cero variantes match / word-buttons llevan translationES', () => {
    // No-vacuidad: sin variantes de esos dos tipos en el corpus, el «cero
    // infractoras» de abajo sería verde por ausencia de población.
    assert.ok(
      noMultipleChoice.length > 0,
      'no-vacuidad: el corpus no tiene ni una variante que NO sea multiple-choice, ' +
        'así que este gate no tendría dónde buscar una infracción de SCH-02'
    );
    const infractoras = noMultipleChoice
      .filter(({ v }) => v?.translationES !== undefined)
      .map(({ id, tipo }) => `${id} (${tipo})`);
    assert.deepEqual(
      infractoras,
      [],
      `translationES sólo existe en variantes multiple-choice (SCH-02 / D-46-04): ${infractoras.join(' | ')}`
    );
  });

  test('la retrocompat sigue probada sobre el disco: quedan variantes SIN el campo', () => {
    assert.ok(
      sinTraduccion.length > 0,
      'no-vacuidad: si NINGUNA variante quedara sin translationES, este bloque dejaría de probar retrocompat'
    );
    // Las dos mitades son una PARTICIÓN del total: si un extractor dejara de casar,
    // sumarían menos que `variantesTotales` y el resto del bloque estaría midiendo
    // un subconjunto silencioso del corpus.
    assert.equal(
      conTraduccion.length + sinTraduccion.length,
      variantesTotales,
      'las variantes con y sin traducción no suman el total: el extractor perdió variantes'
    );
    // Cota inferior DERIVADA (no transcrita): toda variante que no es
    // multiple-choice tiene PROHIBIDO el campo, así que esta mitad no puede bajar
    // de ese suelo mientras el corpus tenga match o word-buttons.
    assert.ok(
      sinTraduccion.length >= noMultipleChoice.length,
      `las variantes sin traducción (${sinTraduccion.length}) no pueden ser menos que las que ` +
        `no son multiple-choice (${noMultipleChoice.length}): SCH-02 les prohíbe el campo`
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// SCH-03 · schemaVersion sigue en 13, sin migración 13→14 (D-46-05)
// ═════════════════════════════════════════════════════════════════════════════

describe('SCH-03 — el campo es contenido, no state: cero migración (D-46-05)', () => {
  const storageSrc = readRepo('src/data/storage.js');
  const backupSrc = readRepo('src/data/backup.js');

  // La versión se DERIVA del módulo que la gobierna, no se transcribe aquí.
  const VERSION_VIGENTE = blankState().schemaVersion;

  test('no-vacuidad: blankState() declara una schemaVersion numérica', () => {
    assert.equal(typeof VERSION_VIGENTE, 'number');
    assert.ok(Number.isInteger(VERSION_VIGENTE) && VERSION_VIGENTE > 0);
  });

  test('storage.js y backup.js declaran la MISMA versión vigente (dos fuentes, no una)', () => {
    const deStorage = storageSrc.match(/CURRENT_SCHEMA_VERSION\s*=\s*(\d+)/);
    const deBackup = backupSrc.match(/CURRENT_SCHEMA_VERSION\s*=\s*(\d+)/);
    assert.ok(deStorage, 'no-vacuidad: el extractor no ve CURRENT_SCHEMA_VERSION en storage.js');
    assert.ok(deBackup, 'no-vacuidad: el extractor no ve CURRENT_SCHEMA_VERSION en backup.js');
    assert.equal(Number(deStorage[1]), VERSION_VIGENTE);
    assert.equal(Number(deBackup[1]), VERSION_VIGENTE);
  });

  test('NO existe ninguna migración cuyo destino sea la versión siguiente', () => {
    const siguiente = VERSION_VIGENTE + 1;
    const nombreProhibido = new RegExp(`migrate${VERSION_VIGENTE}to${siguiente}\\b`);
    for (const [rel, src] of [['src/data/storage.js', storageSrc], ['src/data/backup.js', backupSrc]]) {
      assert.ok(
        !nombreProhibido.test(src),
        `${rel} declara migrate${VERSION_VIGENTE}to${siguiente}: esta fase NO introduce migración de state`
      );
    }
  });

  test('la cadena de migración termina hidratando la versión vigente, sin eslabón nuevo', () => {
    // No-vacuidad: la cadena tiene que ser reconocible antes de afirmar dónde acaba.
    const eslabones = [...storageSrc.matchAll(/schemaVersion === (\d+)\) s = migrate\1to(\d+)\(s\)/g)];
    assert.ok(eslabones.length > 0, 'el extractor no reconoce ni un eslabón de la cadena de migración');

    const destinos = eslabones.map((m) => Number(m[2]));
    assert.equal(
      Math.max(...destinos),
      VERSION_VIGENTE,
      `el destino más alto de la cadena debe ser la versión vigente (${VERSION_VIGENTE})`
    );
    assert.match(storageSrc, new RegExp(`schemaVersion === ${VERSION_VIGENTE}\\) return hydrateV${VERSION_VIGENTE}\\(s\\)`));
  });

  test('un state pre-existente sobrevive al boot con su progreso INTACTO', () => {
    // El boot real: loadState() → migrate(parsed) → hydrateV13. Se instala un
    // localStorage mínimo para ejercitar el camino de producción, no un atajo.
    const previo = {
      ...blankState(),
      exerciseStats: { 'preposiciones-di-origen': { vecesRealizadas: 7, aciertos: 5 } },
      categoryProgress: { preposiciones: { racha: 3 } },
      dailyLog: { '2026-08-12': 12 },
      firstUsedAt: '2026-05-01T00:00:00.000Z'
    };
    const almacen = new Map([['italianCourse.v1', JSON.stringify(previo)]]);
    const original = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: (k) => (almacen.has(k) ? almacen.get(k) : null),
      setItem: (k, v) => almacen.set(k, String(v)),
      removeItem: (k) => almacen.delete(k)
    };
    try {
      const cargado = loadState();
      assert.equal(cargado.schemaVersion, VERSION_VIGENTE, 'el boot cambió la schemaVersion');
      assert.deepEqual(cargado.exerciseStats, previo.exerciseStats, 'el boot alteró exerciseStats');
      assert.deepEqual(cargado.categoryProgress, previo.categoryProgress, 'el boot alteró categoryProgress');
      assert.deepEqual(cargado.dailyLog, previo.dailyLog, 'el boot alteró dailyLog');
      assert.equal(cargado.firstUsedAt, previo.firstUsedAt);
      // Ni una escritura: el boot de un state ya vigente no persiste nada.
      assert.equal(almacen.size, 1, 'el boot escribió claves nuevas en localStorage');
    } finally {
      if (original === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = original;
    }
  });

  test('ningún commit de la fase 46 toca las rutas de state ni de migración', () => {
    // Gate NO vacuo: `git diff` sobre un árbol limpio pasaría siempre. Se mira
    // QUIÉN tocó el fichero por última vez; si fue un commit de esta fase, su
    // asunto lleva el scope `(46-NN)` y este test se pone rojo.
    for (const rel of ['src/data/storage.js', 'src/data/backup.js']) {
      const asunto = execFileSync('git', ['log', '-1', '--format=%s', '--', rel], {
        cwd: projectRoot,
        encoding: 'utf8'
      }).trim();
      assert.ok(asunto.length > 0, `no-vacuidad: git no devuelve historia para ${rel}`);
      assert.ok(
        !/\(46-\d+\)/.test(asunto),
        `${rel} fue modificado por un commit de la fase 46 ("${asunto}"): SCH-03 exige cero cambios de state`
      );
    }
  });
});
