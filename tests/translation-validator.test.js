// tests/translation-validator.test.js
//
// Tests del validador de TRADUCCIONES (`scripts/validate-translation-pass.mjs` +
// `docs/TRANSLATION-VALIDATION-PROMPT.md`). Se ejecutan con:
//
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// FORMA-PROHIBIDA (NO `node --test tests/`: en Node 22.20 eso sale con exit 1 y
// `Cannot find module`, porque Node resuelve el path como MODULO. Los DOS globs,
// siempre — DEUDA-01 / D-45-01.)
//
// Cero red: los tests de CLI usan `--dry-run` o rutas de fail-fast que salen ANTES
// de la primera llamada HTTP; los tests de escritura invocan el escritor con un
// objeto `pass` construido a mano.

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

import { deriveStatus } from '../src/data/validation-state.js';
import {
  applyPassToText,
  writeTranslationPass,
  resolveTarget,
  parseAddress,
  fillGap,
  run,
  contratoVigente,
  parseContrato,
  motivosNoRegistrable,
  sanearParaCorpus,
  sanearPase,
} from '../scripts/validate-translation-pass.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const SCRIPT = 'scripts/validate-translation-pass.mjs';
const PROMPT_DOC = 'docs/TRANSLATION-VALIDATION-PROMPT.md';
const PREPOS = 'content/exercises/preposiciones.json';
const FIXTURE = 'tests/fixtures/translation-pilot.json';

const abs = (rel) => path.join(ROOT, rel);
const readAbs = (rel) => fs.readFileSync(abs(rel), 'utf8');

/** Corre el script como proceso hijo desde la raíz del repo. Nunca llama a la red. */
function runCli(args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env: { ...process.env, GEMINI_API_KEY: '', DEEPSEEK_API_KEY: '' },
  });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

// La dirección compuesta del corpus real. Se deriva del DISCO, no se transcribe
// (D-31-06).
const PREPOS_DOC = JSON.parse(readAbs(PREPOS));
const SLOT_CANONICO = PREPOS_DOC.exercises[0];
const IDX_TRADUCIDA = SLOT_CANONICO.variants.findIndex((v) => v && v.translationES);

// Los anclajes del FIXTURE adversarial. Se declaran AQUÍ arriba (y no junto a los
// tests de escritura, que es donde vivían) porque los cuerpos de `describe` se
// ejecutan al registrarse: una referencia desde el primer bloque a un `const`
// declarado más abajo caería en su TDZ.
const FIX = JSON.parse(readAbs(FIXTURE));
const slotFix = (id) => FIX.exercises.find((e) => e.id === id);
const GEMELAS = slotFix('pilot-tr-gemelas');
const MIXTA = slotFix('pilot-tr-mixta');
const VAL_PRIMERO = slotFix('pilot-tr-validation-primero');

// EL CASO «VARIANTE SIN translationES» VIVE EN EL FIXTURE, NO EN EL CORPUS REAL.
// La primera redacción lo derivaba del slot canónico de Preposiciones, cuya
// variante 0 estaba sin traducir durante el piloto del plan 46-01. Desde el 46-04
// las 96 variantes multiple-choice de Preposiciones están traducidas, así que ese
// `findIndex` devuelve -1 y el test dejaba de tener sujeto. La reparación correcta
// NO es reintroducir una variante sin traducir en el contenido de producción para
// que un test tenga con qué trabajar — un test no dicta la forma del corpus —, sino
// direccionar el fixture adversarial, que existe precisamente para esto (su slot
// `pilot-tr-mixta` declara la variante 0 sin traducir y la 1 traducida).
const IDX_SIN_TRADUCIR = (MIXTA?.variants ?? []).findIndex((v) => v && !v.translationES);

describe('validate-translation-pass — dirección compuesta <slot-id>#<k> (TVAL-02)', () => {
  test('el punto de partida en disco tiene lo que estos tests necesitan (no-vacuidad)', () => {
    assert.equal(SLOT_CANONICO.type, 'multiple-choice', 'el slot canónico debe ser multiple-choice');
    assert.ok(IDX_TRADUCIDA >= 0, 'el slot canónico debe tener AL MENOS una variante con translationES');
    assert.ok(
      SLOT_CANONICO.variants.length >= 2,
      `el slot canónico debe tener >=2 variantes para probar el aislamiento; tiene ${SLOT_CANONICO.variants.length}`
    );
    // El sujeto del caso «sin traducir» sale del FIXTURE, no del corpus real.
    assert.ok(MIXTA, `falta el slot "pilot-tr-mixta" en ${FIXTURE}`);
    assert.equal(MIXTA.type, 'multiple-choice', 'el slot mixto del fixture debe ser multiple-choice');
    assert.ok(
      IDX_SIN_TRADUCIR >= 0,
      `el slot "pilot-tr-mixta" de ${FIXTURE} debe tener AL MENOS una variante SIN translationES: ` +
        `es el único sujeto del test de fail-fast, y sin él ese test no probaría nada`
    );
    assert.ok(
      MIXTA.variants.some((v) => v && v.translationES),
      'y AL MENOS una traducida, o el slot no sería mixto y el aislamiento no se probaría'
    );
  });

  test('--dry-run imprime el prompt compuesto con la frase italiana YA RELLENA', () => {
    const v = SLOT_CANONICO.variants[IDX_TRADUCIDA];
    const rellena = v.prompt.replace('___', v.options[v.correctIndex]);
    const r = runCli([`${SLOT_CANONICO.id}#${IDX_TRADUCIDA}`, '--dry-run']);

    assert.equal(r.status, 0, `--dry-run debe salir 0. stderr: ${r.stderr}`);
    assert.ok(
      r.stdout.includes(rellena),
      `el prompt compuesto debe contener la frase rellena "${rellena}"; stdout(300): ${r.stdout.slice(0, 300)}`
    );
    assert.ok(
      r.stdout.includes(v.translationES.text),
      'el prompt compuesto debe contener el texto de la traducción bajo evaluación'
    );
    // El doc de criterios va delante del bloque DATA, no una copia parcial.
    assert.ok(
      r.stdout.includes('## 4. Contrato de output (parseable obligatorio)'),
      'el prompt compuesto debe incluir el doc de criterios leído de disco'
    );
    // Ojo: la sección 1 del doc CITA el nombre del bloque DATA, así que un
    // `indexOf` casaría esa mención y no el encabezado adjuntado. Se busca el
    // encabezado real (`\n## …`), y se asserta que existe antes de comparar.
    const idxData = r.stdout.indexOf('\n## Traducción bajo evaluación (DATA)');
    const idxGuard = r.stdout.indexOf('\n## 6. Guard anti prompt-injection');
    assert.ok(idxData > 0, 'no-vacuidad: el encabezado del bloque DATA debe existir en el prompt compuesto');
    assert.ok(idxGuard > 0, 'no-vacuidad: la sección 6 del doc debe existir en el prompt compuesto');
    assert.ok(
      idxData > idxGuard,
      'el bloque DATA se adjunta DESPUÉS del doc entero, nunca antes (el guard debe leerse primero)'
    );
  });

  test('--dry-run no escribe NADA en disco', () => {
    const antes = readAbs(PREPOS);
    const r = runCli([`${SLOT_CANONICO.id}#${IDX_TRADUCIDA}`, '--dry-run']);
    assert.equal(r.status, 0);
    assert.equal(readAbs(PREPOS), antes, '--dry-run no puede modificar el contenido');
  });

  test('índice de variante fuera de rango → exit 2 nombrando slot e índice', () => {
    const r = runCli([`${SLOT_CANONICO.id}#99`, '--dry-run']);
    assert.equal(r.status, 2, `esperaba exit 2; stderr: ${r.stderr}`);
    assert.ok(r.stderr.includes(SLOT_CANONICO.id), `el error debe nombrar el slot; stderr: ${r.stderr}`);
    assert.ok(/\b99\b/.test(r.stderr), `el error debe nombrar el índice 99; stderr: ${r.stderr}`);
  });

  test('slot inexistente → exit 2 nombrando el slot', () => {
    const r = runCli(['slot-que-no-existe-jamas#0', '--dry-run']);
    assert.equal(r.status, 2, `esperaba exit 2; stderr: ${r.stderr}`);
    assert.ok(r.stderr.includes('slot-que-no-existe-jamas'), `stderr: ${r.stderr}`);
  });

  test('slot cuyo type NO es multiple-choice → exit 2 (fail-fast por tipo)', () => {
    const r = runCli(['avere-wb-posesion#0', '--dry-run']);
    assert.equal(r.status, 2, `esperaba exit 2; stderr: ${r.stderr}`);
    assert.ok(/word-buttons/.test(r.stderr), `el error debe nombrar el tipo real; stderr: ${r.stderr}`);
  });

  test('variante SIN translationES → se SALTA con exit 2, y no crea bloque validation vacío', () => {
    // Se fotografían los DOS ficheros que el escáner del script recorre: el fixture
    // (donde vive el sujeto) y el corpus real (que no tiene nada que ver y debe
    // quedar igual). Un `--write` que se desviara al fichero equivocado se vería.
    const anteFixture = readAbs(FIXTURE);
    const antePrepos = readAbs(PREPOS);
    const r = runCli([`${MIXTA.id}#${IDX_SIN_TRADUCIR}`, '--write']);
    assert.notEqual(r.status, 0, 'una variante sin traducción no puede terminar en éxito');
    assert.equal(r.status, 2, `esperaba exit 2; stderr: ${r.stderr}`);
    assert.ok(/translationES/.test(r.stderr), `el error debe nombrar translationES; stderr: ${r.stderr}`);
    assert.ok(r.stderr.includes(MIXTA.id), `el error debe nombrar el slot; stderr: ${r.stderr}`);
    assert.equal(readAbs(FIXTURE), anteFixture, 'no puede tocar el fixture: cero bloques validation vacíos');
    assert.equal(readAbs(PREPOS), antePrepos, 'y tampoco el corpus real');
  });

  test('dirección ausente o mal formada → exit 2 con el uso', () => {
    const sinArg = runCli(['--dry-run']);
    assert.equal(sinArg.status, 2, `stderr: ${sinArg.stderr}`);
    assert.ok(/#/.test(sinArg.stderr), 'el mensaje de uso debe mostrar la forma <slot-id>#<k>');

    const sinIndice = runCli([SLOT_CANONICO.id, '--dry-run']);
    assert.equal(sinIndice.status, 2, `una dirección sin #<k> debe fallar; stderr: ${sinIndice.stderr}`);

    const indiceNoNumerico = runCli([`${SLOT_CANONICO.id}#x`, '--dry-run']);
    assert.equal(indiceNoNumerico.status, 2, `un índice no numérico debe fallar; stderr: ${indiceNoNumerico.stderr}`);
  });
});

describe('validate-translation-pass — invariantes de fuente (TVAL-03 / T-46-07)', () => {
  const SRC = readAbs(SCRIPT);

  test('importa deriveStatus de la fuente única y NO reimplementa la derivación (WR-01)', () => {
    assert.equal(
      (SRC.match(/import \{ deriveStatus \}/g) || []).length,
      1,
      'debe haber exactamente 1 import de deriveStatus'
    );
    const sinComentarios = SRC.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
    assert.equal(
      (sinComentarios.match(/(export )?function deriveStatus|const deriveStatus\s*=/g) || []).length,
      0,
      'el script no puede declarar su propia derivación de status'
    );
  });

  test('el read-modify-write completo vive dentro de withFileLock', () => {
    assert.ok((SRC.match(/withFileLock/g) || []).length >= 2, 'import + uso de withFileLock');
    const lockIdx = SRC.indexOf('withFileLock(file');
    assert.ok(lockIdx > 0, 'el escritor debe llamar a withFileLock(file, …)');
    const readIdx = SRC.indexOf('readFileSync(file', lockIdx);
    assert.ok(readIdx > lockIdx, 'el readFileSync del target debe estar DENTRO del callback del lock');
  });

  test('zero-deps: solo node:*, ../src/data/ y ./lib/', () => {
    const imports = [...SRC.matchAll(/^import .*? from '([^']+)';/gm)].map((m) => m[1]);
    assert.ok(imports.length >= 4, `no-vacuidad: el extractor debe ver imports; vio ${imports.length}`);
    for (const spec of imports) {
      assert.ok(
        spec.startsWith('node:') || spec.startsWith('../src/data/') || spec.startsWith('./lib/'),
        `import no permitido (introduciría una dependencia): ${spec}`
      );
    }
    assert.equal(fs.existsSync(abs('package.json')), false, 'el repo sigue sin package.json por diseño');
  });

  test('la indentación se DERIVA del disco, nunca se transcribe del analog de canciones', () => {
    assert.equal(
      (SRC.match(/'      '/g) || []).length,
      0,
      'el literal de seis espacios del script de canciones no vale aquí (translationES está más profundo)'
    );
    assert.ok(/match\(\/\^\\s\*\/\)/.test(SRC), 'la indentación debe derivarse con match(/^\\s*/)');
  });

  test('la API key nunca se imprime (T-46-07)', () => {
    const fugas = SRC.split('\n').filter((l) => /console\.(log|error)/.test(l) && /API_KEY|apiKey|keyFor\(/.test(l));
    assert.deepEqual(fugas, [], `líneas que podrían filtrar la clave: ${fugas.join(' | ')}`);
    // La clave viaja en header, nunca en la URL/query (WR-02).
    assert.equal((SRC.match(/[?&]key=/g) || []).length, 0, 'la clave no puede ir en la query string');
  });

  test('lee el doc de criterios de disco, no una copia inline', () => {
    assert.ok(SRC.includes(PROMPT_DOC), `el script debe apuntar a ${PROMPT_DOC}`);
    assert.ok(fs.existsSync(abs(PROMPT_DOC)), 'el doc de criterios debe existir en disco');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// Escritura quirúrgica: se prueba POR ESCRITURA REAL Y DIFF DE LÍNEAS sobre una
// COPIA temporal del fixture, nunca leyendo el código ni tocando el committeado
// (§Delta de 46-PATTERNS.md: aquí es donde el branch por substring del script de
// canciones corrompe el corpus).
// ══════════════════════════════════════════════════════════════════════════

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'translation-pilot-'));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

let seq = 0;
/** Copia temporal del fixture: los tests que escriben JAMÁS tocan el committeado. */
function copiaFixture() {
  const p = path.join(TMP, `pilot-${seq++}.json`);
  fs.copyFileSync(abs(FIXTURE), p);
  return p;
}
const pase = (by, verdict = 'correcta', extra = {}) => ({
  by, date: '2026-08-13', verdict, concerns: [], ...extra,
});

/**
 * Ventana de líneas del objeto-variante que contiene `promptTexto`, acotada de
 * forma INDEPENDIENTE del código bajo prueba: desde la línea del prompt hasta la
 * primera línea posterior que cierra el objeto-variante a su indentación (8).
 * Devuelve null si el ancla no casa (la cláusula de no-vacuidad lo comprueba).
 */
function ventanaDeVariante(lineas, promptTexto) {
  const inicio = lineas.findIndex((l) => l.includes(promptTexto));
  if (inicio === -1) return null;
  let fin = inicio + 1;
  while (fin < lineas.length && !/^ {8}\},?$/.test(lineas[fin])) fin++;
  if (fin >= lineas.length) return null;
  return { inicio, fin };
}

/** Región de líneas realmente cambiada entre dos fotos del fichero. */
function regionCambiada(antes, despues) {
  const a = antes.split('\n');
  const b = despues.split('\n');
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  return { a, b, inicio: p, finA: a.length - s, finB: b.length - s };
}

/** Asserta que TODO lo cambiado cae dentro de la variante que se quería tocar. */
function assertCambioContenidoEn(antes, despues, promptTexto, etiqueta) {
  const r = regionCambiada(antes, despues);
  const ventana = ventanaDeVariante(r.a, promptTexto);
  // No-vacuidad PRIMERO: un extractor que deja de casar devuelve null/vacío y una
  // comparación contra vacío pasaría en VERDE (el modo de fallo real de este repo).
  assert.ok(ventana, `no-vacuidad (${etiqueta}): el acotador no encontró la variante con prompt "${promptTexto}"`);
  assert.ok(r.finB > r.inicio, `no-vacuidad (${etiqueta}): la escritura no cambió NINGUNA línea`);
  assert.ok(
    r.inicio > ventana.inicio,
    `${etiqueta}: la primera línea cambiada (${r.inicio}) está FUERA de la variante objetivo ` +
      `(empieza en ${ventana.inicio}) — el escritor apuntó al bloque equivocado`
  );
  assert.ok(
    r.finA <= ventana.fin,
    `${etiqueta}: el cambio se extiende hasta la línea ${r.finA}, más allá del cierre de la ` +
      `variante objetivo (${ventana.fin}) — el escritor desbordó su objetivo`
  );
  return r;
}

describe('validate-translation-pass — escritura quirúrgica en variants[k].translationES (TVAL-02)', () => {
  test('el fixture declara los cuatro slots adversariales que estos tests necesitan (no-vacuidad)', () => {
    assert.equal(FIX.exercises.length, 4, 'el fixture debe declarar 4 slots');
    assert.ok(GEMELAS && MIXTA && VAL_PRIMERO, 'los tres slots multiple-choice del fixture deben existir');
    assert.equal(
      GEMELAS.variants[0].translationES.text,
      GEMELAS.variants[1].translationES.text,
      'las dos variantes gemelas deben tener translationES.text IDÉNTICO'
    );
    assert.notEqual(GEMELAS.variants[0].prompt, GEMELAS.variants[1].prompt, 'sus prompts deben diferir');
    assert.equal(GEMELAS.validation.passes.length, 2, 'el slot gemelas debe llevar 2 pases a nivel de SLOT');
    assert.equal(MIXTA.variants[0].translationES, undefined, 'la variante 0 del slot mixto NO debe estar traducida');
    assert.ok(MIXTA.variants[1].translationES, 'la variante 1 del slot mixto SÍ debe estar traducida');
    assert.equal(VAL_PRIMERO.variants[0].translationES.validation, undefined,
      'la variante del slot validation-primero debe nacer SIN bloque validation (prueba la rama INSERT)');
    // El orden de claves importa: es la disposición adversarial del test de no-falso-UPDATE.
    const claves = Object.keys(VAL_PRIMERO);
    assert.ok(
      claves.indexOf('validation') < claves.indexOf('variants'),
      'en pilot-tr-validation-primero el validation del SLOT debe ir ANTES de variants'
    );
    assert.equal(slotFix('pilot-tr-word-buttons').type, 'word-buttons', 'el cuarto slot prueba el fail-fast por tipo');
  });

  test('idempotencia: dos pasadas con el mismo `by` dejan UN ÚNICO pase para ese `by`', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8');
    const slotAntes = JSON.stringify(JSON.parse(antes).exercises[0].validation);

    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-x'));
    const tras1 = fs.readFileSync(file, 'utf8');
    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-x'));
    const tras2 = fs.readFileSync(file, 'utf8');

    const doc = JSON.parse(tras2);
    const passes = doc.exercises[0].variants[1].translationES.validation.passes;
    assert.equal(passes.length, 1, `la segunda pasada NO puede duplicar el pase; passes: ${JSON.stringify(passes)}`);
    assert.equal(passes[0].by, 'modelo-x');
    assert.equal(passes.filter((p) => p.by === 'modelo-x').length, 1, 'un solo pase por `by`');
    assert.equal(doc.exercises[0].variants[1].translationES.validation.status, deriveStatus(passes));

    // El validation del SLOT queda byte-idéntico tras las dos pasadas.
    assert.equal(JSON.stringify(JSON.parse(tras2).exercises[0].validation), slotAntes,
      'el validation del SLOT no puede cambiar');
    assert.equal(tras1, tras2, 'la segunda pasada idéntica debe dejar el fichero byte-idéntico');
    // La primera pasada ya tenía que estar contenida en la variante objetivo: si se
    // hubiera desbordado, la segunda pasada "idéntica" lo sería sobre un fichero ya
    // corrupto y el byte-a-byte de arriba pasaría en verde igualmente.
    assertCambioContenidoEn(antes, tras1, GEMELAS.variants[1].prompt, 'idempotencia/1ª pasada');
  });

  test('aislamiento entre hermanas de texto IDÉNTICO: escribir en la 1 deja la 0 con passes: []', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8');

    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-x'));
    const despues = fs.readFileSync(file, 'utf8');

    const doc = JSON.parse(despues);
    assert.deepEqual(
      doc.exercises[0].variants[0].translationES.validation.passes,
      [],
      'la hermana de texto idéntico NO puede recibir el pase'
    );
    assert.equal(doc.exercises[0].variants[0].translationES.validation.status, 'pending');
    assert.equal(doc.exercises[0].variants[1].translationES.validation.passes.length, 1);
    assertCambioContenidoEn(antes, despues, GEMELAS.variants[1].prompt, 'aislamiento');
  });

  test('no-falso-UPDATE: el validation del SLOT (declarado ANTES de variants) queda intacto', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8');
    const slotAntes = JSON.parse(antes).exercises[3].validation;

    await writeTranslationPass(file, 'pilot-tr-validation-primero', 0, pase('modelo-x'));
    const despues = fs.readFileSync(file, 'utf8');
    const doc = JSON.parse(despues);

    assert.deepEqual(doc.exercises[3].validation, slotAntes,
      'el bloque validation del SLOT no puede tocarse (ni sus passes ni su status)');
    assert.equal(doc.exercises[3].variants[0].translationES.validation.passes.length, 1,
      'el pase debe aterrizar DENTRO de translationES');
    assert.equal(doc.exercises[3].variants[0].translationES.validation.passes[0].by, 'modelo-x');
    assertCambioContenidoEn(antes, despues, VAL_PRIMERO.variants[0].prompt, 'no-falso-UPDATE');
  });

  test('round-trip UTF-8: los acentos siguen literales y el resto del fichero es byte-idéntico', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8'); // foto 1, ANTES de escribir
    assert.ok(antes.includes('Nápoles'), 'no-vacuidad: el fixture debe traer un acento literal que preservar');

    await writeTranslationPass(file, 'pilot-tr-mixta', 1, pase('modelo-x', 'correcta', {
      concerns: [],
    }));
    const despues = fs.readFileSync(file, 'utf8'); // foto 2, DESPUÉS de escribir

    assert.ok(despues.includes('Nápoles'), 'el acento del slot vecino debe seguir en UTF-8 literal');
    assert.ok(despues.includes('Vivo en Italia desde hace tres años.'), 'la ñ y el acento del target intactos');
    assert.equal((despues.match(/\\u00/g) || []).length, 0, 'ningún carácter puede quedar como escape \\uXXXX');
    assertCambioContenidoEn(antes, despues, MIXTA.variants[1].prompt, 'round-trip');
  });

  test('el índice es solo la dirección de ENTRADA: reordenar variants mueve el pase CON su frase', async () => {
    const file = copiaFixture();
    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-x'));

    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    const slot = doc.exercises[0];
    const promptConPase = slot.variants
      .filter((v) => v.translationES?.validation?.passes?.length)
      .map((v) => v.prompt);
    assert.deepEqual(promptConPase, [GEMELAS.variants[1].prompt],
      'no-vacuidad: exactamente UNA variante debe llevar el pase antes de reordenar');

    // Reordenar el array y re-serializar: el pase viaja DENTRO de su variante.
    slot.variants.reverse();
    const reordenado = path.join(TMP, `pilot-reordenado-${seq++}.json`);
    fs.writeFileSync(reordenado, JSON.stringify(doc, null, 2) + '\n');

    const releido = JSON.parse(fs.readFileSync(reordenado, 'utf8')).exercises[0];
    assert.equal(releido.variants[0].prompt, GEMELAS.variants[1].prompt, 'el reverse debe haber ocurrido');
    assert.equal(releido.variants[0].translationES.validation.passes.length, 1,
      'el pase sigue con SU frase tras el reordenado');
    assert.deepEqual(releido.variants[1].translationES.validation.passes, [],
      'la otra frase sigue sin pase: ninguno se reasignó por posición');
  });

  test('variante sin translationES: el escritor no escribe nada ni crea un bloque validation vacío', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8');

    assert.throws(
      () => applyPassToText(antes, 'pilot-tr-mixta', 0, pase('modelo-x')),
      /translationES/,
      'el escritor debe negarse explícitamente sobre una variante sin traducción'
    );
    assert.equal(fs.readFileSync(file, 'utf8'), antes, 'el fichero no puede haberse tocado');

    // Y la resolución del target lo salta ANTES de llegar al escritor.
    const r = resolveTarget('pilot-tr-mixta', 0, [abs('tests/fixtures')]);
    assert.ok(r.error, 'resolveTarget debe devolver error para una variante sin traducción');
    assert.ok(/translationES/.test(r.error), `el mensaje debe nombrar translationES: ${r.error}`);
    assert.equal((antes.match(/"validation"/g) || []).length,
      (fs.readFileSync(file, 'utf8').match(/"validation"/g) || []).length,
      'cero bloques validation nuevos');
  });

  test('concurrencia: dos escrituras simultáneas sobre variantes distintas conservan ambos pases', async () => {
    const file = copiaFixture();
    await Promise.all([
      writeTranslationPass(file, 'pilot-tr-gemelas', 0, pase('modelo-a')),
      writeTranslationPass(file, 'pilot-tr-mixta', 1, pase('modelo-b')),
    ]);

    const raw = fs.readFileSync(file, 'utf8');
    const doc = JSON.parse(raw); // si el JSON se corrompió, esto lanza
    assert.equal(doc.exercises[0].variants[0].translationES.validation.passes.length, 1,
      `el pase de modelo-a debe sobrevivir (lost update). Fichero: ${raw.slice(0, 200)}`);
    assert.equal(doc.exercises[0].variants[0].translationES.validation.passes[0].by, 'modelo-a');
    assert.equal(doc.exercises[1].variants[1].translationES.validation.passes.length, 1,
      'el pase de modelo-b debe sobrevivir');
    assert.equal(doc.exercises[1].variants[1].translationES.validation.passes[0].by, 'modelo-b');
    assert.equal(fs.existsSync(`${file}.lock`), false, 'el lockfile debe quedar liberado');
  });

  test('un segundo `by` DISTINTO forma quórum, y el status escrito sale de deriveStatus', async () => {
    const file = copiaFixture();
    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-x'));
    await writeTranslationPass(file, 'pilot-tr-gemelas', 1, pase('modelo-y'));

    const bloque = JSON.parse(fs.readFileSync(file, 'utf8')).exercises[0].variants[1].translationES.validation;
    assert.equal(bloque.passes.length, 2, 'dos `by` distintos son DOS pases');
    assert.equal(bloque.status, deriveStatus(bloque.passes), 'el status escrito debe ser el derivado');
    assert.equal(bloque.status, 'validated', 'dos `by` distintos con verdict correcta = validated');
  });

  test('el `by` escrito es el modelo que DE VERDAD respondió, no el primero de la cola (T-46-10)', async () => {
    const file = copiaFixture();
    const target = { file, slot: { id: 'pilot-tr-gemelas' }, k: 1 };
    const llamados = [];
    // Simula el auto-fallback: el primario rate-limitea (429) y contesta el segundo.
    const caller = async (model) => {
      llamados.push(model);
      if (model === 'modelo-primario') return { rateLimited: true, retryAfter: 0 };
      return {
        text: '```json\n' + JSON.stringify({
          verdict: 'correcta',
          criteria: { s1_natural: true, s2_fidelidad: true, s4_acentos: true, s5_italiano: true, s6_naturalidad: true },
          concerns: [],
        }) + '\n```',
      };
    };

    const pass = await run(
      { MODEL_QUEUE: ['modelo-primario', 'modelo-de-fallback'], TEMP: 0.2, WRITE: true },
      target,
      'prompt-compuesto-irrelevante-para-este-test',
      caller
    );

    // No-vacuidad: el fallback tiene que haberse ejercitado de verdad.
    assert.deepEqual(llamados, ['modelo-primario', 'modelo-de-fallback'],
      'el 429 del primario debe provocar UN salto al fallback');
    assert.equal(pass.by, 'modelo-de-fallback', 'el `by` no puede ser el modelo pinneado de la cola');

    const bloque = JSON.parse(fs.readFileSync(file, 'utf8')).exercises[0].variants[1].translationES.validation;
    assert.equal(bloque.passes.length, 1);
    assert.equal(bloque.passes[0].by, 'modelo-de-fallback',
      'un `by` que miente fabricaría un quórum de dos entradas del mismo modelo real');
    assert.deepEqual(bloque.passes[0].concerns, []);
  });

  test('la cola agotada devuelve null en vez de matar el proceso (y no escribe nada)', async () => {
    const file = copiaFixture();
    const antes = fs.readFileSync(file, 'utf8');
    const pass = await run(
      { MODEL_QUEUE: ['modelo-caido'], TEMP: 0.2, WRITE: true },
      { file, slot: { id: 'pilot-tr-gemelas' }, k: 1 },
      'prompt',
      async () => ({ rateLimited: false, error: 'falta API key para deepseek (.env)' })
    );
    assert.equal(pass, null, 'sin pase emitido, run devuelve null y el entrypoint decide el exit code');
    assert.equal(fs.readFileSync(file, 'utf8'), antes, 'un fallo de red no puede tocar el corpus');
  });

  test('la dirección compuesta y el relleno del hueco son funciones puras y verificables', () => {
    assert.deepEqual(parseAddress('preposiciones-di-origen#1'), { slotId: 'preposiciones-di-origen', k: 1 });
    assert.equal(parseAddress('preposiciones-di-origen'), null, 'el índice es OBLIGATORIO');
    assert.equal(parseAddress('preposiciones-di-origen#'), null);
    assert.equal(parseAddress('preposiciones-di-origen#x'), null);
    assert.equal(parseAddress('#0'), null);
    const v = GEMELAS.variants[0];
    assert.equal(fillGap(v.prompt, v.options, v.correctIndex), 'Marco è di Napoli di nascita.');
    assert.equal(fillGap('sin hueco', ['di'], 0), null, 'un prompt sin "___" no se puede rellenar');
    assert.equal(fillGap(v.prompt, v.options, 99), null, 'un correctIndex fuera de rango no se puede rellenar');
  });

  // Phase 47, plan 47-02. Una `option` con el símbolo ∅ NOTA la ausencia de palabra; no
  // es una palabra. Sustituir el hueco por ella fabricaba `Non compro ∅ / sin partitivo
  // pane.`, que no es la frase que el ejercicio resuelve y que un evaluador marca —con
  // razón— bajo S5. Estas aserciones fallan contra la versión anterior de `fillGap`
  // (devolvía la cadena con el marcador incrustado), así que el arreglo queda verificado
  // por MUTACIÓN y no sólo afirmado.
  test('un marcador nulo ∅ se resuelve como la frase SIN el hueco, no incrustándolo', () => {
    const NULO = ['∅ / sin partitivo', 'del', 'dei', 'dello'];
    assert.equal(fillGap('Non compro ___ pane.', NULO, 0), 'Non compro pane.');
    assert.equal(fillGap('Non ho ___ amici a Roma.', NULO, 0), 'Non ho amici a Roma.');
    // ESTA ASERCIÓN CAMBIÓ EN LA PHASE 47 (WR-01), y el cambio es deliberado, no un
    // «hacer que pase». Lo que comprobaba —y sigue comprobando— es que el hueco inicial
    // no deja un espacio suelto delante; su valor esperado congelaba ADEMÁS, de
    // colateral, una `p` minúscula abriendo la frase, que es el defecto que WR-01
    // reporta. La propiedad que este test existe para vigilar se conserva intacta (no
    // hay espacio inicial); lo que se corrige es la parte del literal que nunca fue su
    // sujeto y que, congelada, certificaba en verde una cadena que no es italiano.
    assert.equal(fillGap('___ pane è buono.', NULO, 0), 'Pane è buono.', 'hueco inicial: sin espacio suelto delante, y la palabra que pasa a abrir la frase va en mayúscula');
    assert.equal(fillGap('Non ne compro ___.', NULO, 0), 'Non ne compro.', 'la puntuación no queda separada del verbo');
    // Direccionalidad: el marcador nulo NO puede absolver a una opción normal. Cuando la
    // correcta es una palabra de verdad, el relleno sigue siendo el de siempre.
    assert.equal(fillGap('Compro ___ pane.', NULO, 1), 'Compro del pane.');
  });

  // Phase 47, plan 47-02. Una opción ELIDIDA se suelda a la palabra siguiente. El
  // discriminador es la letra que precede al apóstrofo —consonante = elisión, vocal =
  // apócope del imperativo—, NO "la siguiente empieza por vocal": el único caso de
  // apócope del corpus (`fa' una foto`) va seguido de vocal y ese criterio lo habría
  // soldado en `fa'una`. La última aserción es justamente ese contraejemplo.
  test('una opción elidida se suelda a la palabra siguiente, y la apócope NO', () => {
    assert.equal(fillGap("Metti ___ aceto nell'insalata.", ["dell'"], 0), "Metti dell'aceto nell'insalata.");
    assert.equal(fillGap('Ho ___ amica che parla cinque lingue.', ["un'"], 0), "Ho un'amica che parla cinque lingue.");
    assert.equal(fillGap('Aspetto ___ amico.', ["l'"], 0), "Aspetto l'amico.");
    assert.equal(
      fillGap('Marco, ___ una foto con il tuo telefono!', ["fa'"], 0),
      "Marco, fa' una foto con il tuo telefono!",
      "apócope: `fa'` NO se suelda, aunque le siga una vocal"
    );
    assert.equal(fillGap('Compro ___ pane.', ['del'], 0), 'Compro del pane.', 'una opción sin apóstrofo no cambia');
  });

  // Phase 47, WR-01 del code review. Las `options` se autoran en minúscula porque casi
  // siempre caen a media frase, pero cuando el `prompt` EMPIEZA por `___` la opción pasa
  // a ser la primera palabra y el `italianoResuelto` deja de ser italiano
  // ortográficamente válido. 13 de las 206 traducciones del corpus se enviaron así al
  // quórum de pago (12 en articoli, 1 en preposiciones), medido en disco.
  //
  // Las cuatro primeras aserciones FALLAN contra la versión anterior de `fillGap`
  // (devolvía la frase con minúscula inicial), así que el arreglo queda verificado por
  // mutación y no sólo afirmado.
  test('cuando el hueco ABRE la frase, la palabra que pasa a primera va en mayúscula', () => {
    // Rama normal.
    assert.equal(fillGap('___ casa di mia nonna è grande.', ['la'], 0), 'La casa di mia nonna è grande.');
    assert.equal(fillGap('___ uova sono nel frigorifero.', ['le'], 0), 'Le uova sono nel frigorifero.');
    // Rama elidida: la mayúscula cae sobre la elisión, no sobre la palabra soldada.
    assert.equal(fillGap('___ amica di Sofia è spagnola.', ["l'"], 0), "L'amica di Sofia è spagnola.");
    // Rama del marcador nulo: el marcador ya no está en la cadena, así que la mayúscula
    // cae sobre la palabra que pasa a abrir la frase — que es justo lo que pide.
    assert.equal(fillGap('___ pane è buono.', ['∅ / sin partitivo'], 0), 'Pane è buono.');

    // DIRECCIONALIDAD: un hueco a MEDIA frase no toca nada. Sin esta mitad, un
    // `toLocaleUpperCase` mal anclado capitalizaría las 193 restantes y el test no lo
    // vería.
    assert.equal(fillGap('Compro ___ pane.', ['del'], 0), 'Compro del pane.');
    assert.equal(fillGap("Metti ___ aceto nell'insalata.", ["dell'"], 0), "Metti dell'aceto nell'insalata.");
    assert.equal(fillGap('Non compro ___ pane.', ['∅ / sin partitivo'], 0), 'Non compro pane.');
  });

  test('BARRIDO EN DISCO: ninguna traducción del corpus produce un italiano con minúscula inicial', () => {
    // Derivado del corpus, no una lista escrita: las 13 direcciones que WR-01 midió
    // están arregladas Y ninguna futura puede colarse. Sin esta aserción, el arreglo
    // valdría sólo para los tres casos sintéticos de arriba.
    const dir = path.join(ROOT, 'content/exercises');
    const infractoras = [];
    let sujetos = 0;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const ex of data.exercises || []) {
        if (ex.type !== 'multiple-choice') continue;
        (ex.variants || []).forEach((v, k) => {
          if (!v?.translationES?.text) return;
          sujetos++;
          const it = fillGap(v.prompt, v.options, v.correctIndex);
          if (it && /^[a-zàèéìòùáíóú]/.test(it)) infractoras.push(`${ex.id}#${k} → ${JSON.stringify(it)}`);
        });
      }
    }
    assert.ok(sujetos > 0, 'no-vacuidad: el barrido no encontró ni una traducción en disco');
    assert.deepEqual(
      infractoras,
      [],
      `el italiano que viaja al quórum de pago no es ortográficamente válido en:\n  ${infractoras.join('\n  ')}`
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// deriveStatus — fuente única de status (TVAL-03). Se IMPORTA de
// src/data/validation-state.js: ni el script ni estos tests lo reimplementan.
// Es puro (sin disco ni estado compartido), así que no tiene modo de fallo
// concurrente: toda la serialización vive en withFileLock, del lado del escritor.
// ══════════════════════════════════════════════════════════════════════════

describe('deriveStatus — fuente única de status de las traducciones (TVAL-03)', () => {
  test('dos pases `correcta` del MISMO `by` NO forman quórum', () => {
    const passes = [pase('modelo-x'), { ...pase('modelo-x'), date: '2026-08-14' }];
    assert.equal(deriveStatus(passes), 'pending',
      'el quórum exige dos `by` DISTINTOS: de ahí que la CLI ofrezca --avoid');
    assert.notEqual(deriveStatus(passes), 'validated');
  });

  test('passes vacío, ausente o no-array → pending, jamás validated', () => {
    for (const entrada of [[], undefined, null, 'no-un-array', {}]) {
      assert.equal(deriveStatus(entrada), 'pending', `entrada: ${JSON.stringify(entrada)}`);
    }
  });

  test('el status no depende del ORDEN de passes[] (incluido el override de autor)', () => {
    const casos = [
      [pase('modelo-x'), pase('modelo-y')],
      [pase('modelo-x'), pase('modelo-y', 'incorrecta')],
      [pase('modelo-x'), pase('modelo-y'), pase('autor', 'correcta', { override: true }), pase('modelo-z', 'incorrecta')],
    ];
    assert.ok(casos.length >= 3, 'no-vacuidad: debe haber casos que permutar');
    for (const passes of casos) {
      const esperado = deriveStatus(passes);
      const permutaciones = [
        [...passes].reverse(),
        [passes[passes.length - 1], ...passes.slice(0, -1)],
        [...passes.slice(1), passes[0]],
      ];
      for (const perm of permutaciones) {
        assert.equal(deriveStatus(perm), esperado,
          `permutar no puede cambiar el status (${esperado}) — passes: ${JSON.stringify(perm.map((p) => [p.by, p.verdict]))}`);
      }
    }
  });

  test('deriveStatus es puro: re-derivar sobre el mismo passes[] da el mismo status', () => {
    const passes = [pase('modelo-x'), pase('modelo-y'), pase('modelo-z', 'incorrecta')];
    const copia = JSON.parse(JSON.stringify(passes));
    const a = deriveStatus(passes);
    const b = deriveStatus(passes);
    assert.equal(a, b, 'dos derivaciones consecutivas deben coincidir');
    assert.deepEqual(passes, copia, 'deriveStatus no puede mutar su entrada');
  });

  test('el override de autor NO fabrica quórum por sí solo, y el `incorrecta` se queda en passes[]', () => {
    const soloAutor = [pase('autor', 'correcta', { override: true }), pase('modelo-x', 'incorrecta')];
    assert.equal(deriveStatus(soloAutor), 'disputed',
      'un override sin quórum de modelos sigue siendo disputed: se resuelve con trabajo y motivo escrito, no con atajo');

    const conQuorum = [
      pase('modelo-x'),
      pase('modelo-y'),
      pase('modelo-z', 'incorrecta'),
      pase('autor', 'correcta', { override: true }),
    ];
    assert.equal(deriveStatus(conQuorum), 'validated', 'con quórum de modelos el override sí promueve');
    assert.equal(conQuorum.filter((p) => p.verdict === 'incorrecta').length, 1,
      'el `incorrecta` permanece en el audit trail');

    const sinFlag = [pase('modelo-x'), pase('modelo-y'), pase('modelo-z', 'incorrecta'), pase('autor')];
    assert.equal(deriveStatus(sinFlag), 'disputed', 'un pase del autor SIN override:true es un voto normal');
  });
});

// ══════════════════════════════════════════════════════════════════════════
// CR-03 · el veredicto se valida contra el contrato del §4 ANTES de registrarlo
//
// El agujero, reproducido ejecutando en el code review de la fase: `run()` solo
// comprobaba que las claves EXISTIERAN y escribía `verdict.verdict` tal cual.
// `deriveStatus` compara por igualdad exacta y case-sensitive, así que un negativo
// mal escrito (`"Incorrecta"`) no dispara el sticky-disputed y se ignora como si no
// existiera — con dos `correcta` al lado, la traducción alcanza `validated`. Es una
// `incorrecta` PERDIDA fabricando un quórum falso.
//
// El contrato NO se transcribe aquí: se DERIVA del mismo doc que el script envía en
// el prompt, y estos tests congelan esa derivación para que un reformateo del §4
// salga rojo en la suite y no solo en tiempo de ejecución.
// ══════════════════════════════════════════════════════════════════════════

describe('CR-03 — el contrato del §4 se deriva del doc y el veredicto se valida contra él', () => {
  const contrato = contratoVigente(abs(PROMPT_DOC));

  test('CLÁUSULA DE NO-VACUIDAD (va primero): el contrato se deriva y no sale vacío', () => {
    // Con `VERDICTS` vacío se rechazaría TODO y con `CRITERIA` vacío no se
    // comprobaría NADA. Las dos degradaciones pasan desapercibidas leyendo la salida.
    assert.ok(contrato.VERDICTS.size >= 2, `el §4 declara ${contrato.VERDICTS.size} verdict(s)`);
    assert.ok(contrato.CRITERIA.length > 0, 'el §4 no declara ninguna key de criteria');
  });

  test('el enum y las keys derivadas son las que el doc declara (una sola fuente)', () => {
    // Los valores se comparan contra el DOC, no contra una lista escrita aquí: se
    // vuelven a extraer del texto por un camino distinto del que usa el script.
    const doc = readAbs(PROMPT_DOC);
    const SRC = readAbs(SCRIPT);
    for (const v of contrato.VERDICTS) {
      assert.ok(doc.includes(`"${v}"`), `el doc no menciona el verdict derivado "${v}"`);
    }
    for (const c of contrato.CRITERIA) {
      assert.ok(doc.includes(c), `el doc no menciona la key de criteria derivada "${c}"`);
    }
    // Y el script NO puede llevar el enum escrito a mano en paralelo al doc.
    assert.ok(
      !/\bnew Set\(\s*\[\s*'correcta'\s*,\s*'incorrecta'\s*\]\s*\)/.test(SRC),
      'el enum de verdict está transcrito en el script: tiene que derivarse del doc de criterios'
    );
  });

  test('un shape del §4 ilegible NO degrada a permisivo: lanza', () => {
    // Fail-loud, nunca fallback silencioso. Un contrato desconocido no puede validar
    // nada, y gastar una llamada de pago contra él es el agujero que esto cierra.
    assert.throws(() => parseContrato('# doc sin seccion 4'), /secci[oó]n "## 4\."/i);
    assert.throws(() => parseContrato('## 4. Contrato\n\nsin bloque\n'), /bloque/i);
  });

  const criteriaOk = Object.fromEntries(contrato.CRITERIA.map((c) => [c, true]));

  test('los tres veredictos del hallazgo son NO registrables, y el motivo lo dice', () => {
    const fuera = motivosNoRegistrable({ verdict: 'PASS', criteria: criteriaOk, concerns: [] }, contrato);
    assert.ok(fuera.length > 0, 'un verdict fuera del enum tiene que ser rechazado');
    assert.match(fuera.join(' '), /fuera del enum/);

    // EL CASO GRAVE: el negativo mal escrito. Sin este rechazo se pierde y el quórum
    // se fabrica — comprobado abajo con `deriveStatus`.
    const mayuscula = motivosNoRegistrable(
      { verdict: 'Incorrecta', criteria: criteriaOk, concerns: ['[S1-natural] mal'] },
      contrato
    );
    assert.ok(mayuscula.length > 0, '"Incorrecta" con mayúscula tiene que ser rechazado');

    const concernsString = motivosNoRegistrable(
      { verdict: 'incorrecta', criteria: criteriaOk, concerns: 'motivo en string' },
      contrato
    );
    assert.ok(concernsString.length > 0, 'concerns no-array tiene que ser rechazado, no coercionado');
    assert.match(concernsString.join(' '), /ARRAY/);
  });

  test('POR QUÉ IMPORTA: el negativo mal escrito fabrica un quórum falso', () => {
    // No es una preferencia de formato — es la propiedad que se pierde.
    const conErrata = [
      { by: 'm1', verdict: 'Incorrecta', concerns: ['mal'] },
      { by: 'm2', verdict: 'correcta', concerns: [] },
      { by: 'm3', verdict: 'correcta', concerns: [] },
    ];
    const bienEscrito = conErrata.map((p) => ({ ...p, verdict: p.verdict.toLowerCase() }));
    assert.equal(deriveStatus(conErrata), 'validated', 'control: con la errata el negativo se pierde');
    assert.equal(deriveStatus(bienEscrito), 'disputed', 'control: bien escrito, el negativo es sticky');
    // Y por eso la errata no puede llegar al disco.
    assert.ok(motivosNoRegistrable(conErrata[0], contrato).length > 0);
  });

  test('un negativo SIN motivo escrito no es registrable (§4 exige al menos un concern)', () => {
    const sinMotivo = motivosNoRegistrable(
      { verdict: 'incorrecta', criteria: { ...criteriaOk, [contrato.CRITERIA[0]]: false }, concerns: [] },
      contrato
    );
    assert.ok(sinMotivo.length > 0, 'un `incorrecta` con concerns: [] es indistinguible de un bug de registro');
  });

  test('los veredictos LEGÍTIMOS siguen siendo registrables (cero falsos rojos)', () => {
    // Incluida la `correcta` CON concerns declarativas: es un caso real del corpus
    // (precedente riflessivi.json), no una anomalía.
    const legitimos = [
      { verdict: 'correcta', criteria: criteriaOk, concerns: [] },
      { verdict: 'correcta', criteria: criteriaOk, concerns: ['[S6-naturalidad] matiz declarativo'] },
      {
        verdict: 'incorrecta',
        criteria: { ...criteriaOk, [contrato.CRITERIA[0]]: false },
        concerns: ['[S1-natural] con su motivo escrito'],
      },
    ];
    for (const v of legitimos) {
      assert.deepEqual(
        motivosNoRegistrable(v, contrato),
        [],
        `un veredicto legítimo fue rechazado: ${JSON.stringify(v)}`
      );
    }
  });

  test('los pases de traducción YA EN DISCO cumplen el contrato (cero re-validación)', () => {
    // Si el arreglo de CR-03 implicara re-validar contenido ya pagado, esto saldría
    // rojo — y re-validar es decisión del autor, no del arreglo. Sale verde: el
    // contrato que se empieza a exigir es el que el corpus ya cumplía.
    //
    // OJO A LA FRONTERA, que la primera redacción de este test se saltó: un pase
    // PERSISTIDO no es una RESPUESTA de modelo. La respuesta trae `criteria` (las 5
    // booleanas) y el pase NO las guarda — solo `by`, `date`, `verdict` y `concerns`.
    // Aplicarle `motivosNoRegistrable` entero marcaría las 192 entradas legítimas por
    // «faltan las keys de criteria». Aquí se comprueba el SUBCONJUNTO del contrato que
    // sí sobrevive a la persistencia.
    const doc = JSON.parse(readAbs(PREPOS));
    const pases = [];
    for (const slot of doc.exercises) {
      if (slot.type !== 'multiple-choice') continue;
      for (const [k, v] of (slot.variants || []).entries()) {
        const ps = v?.translationES?.validation?.passes;
        if (Array.isArray(ps)) ps.forEach((p, i) => pases.push([`${slot.id}#${k}[${i}]`, p]));
      }
    }
    assert.ok(pases.length > 0, 'no-vacuidad: no se localizó ni un pase de traducción en disco');

    const infractores = [];
    for (const [addr, p] of pases) {
      if (!contrato.VERDICTS.has(p.verdict)) {
        infractores.push(`${addr}: verdict ${JSON.stringify(p.verdict)} fuera del enum`);
      }
      if (!Array.isArray(p.concerns)) {
        infractores.push(`${addr}: concerns no es array`);
      } else {
        if (p.concerns.some((c) => typeof c !== 'string')) infractores.push(`${addr}: concerns con entradas no-string`);
        if (p.verdict === 'incorrecta' && p.concerns.length === 0) infractores.push(`${addr}: incorrecta sin motivo escrito`);
      }
    }
    assert.deepEqual(infractores, [], `pases en disco que el contrato rechazaría:\n  ${infractores.join('\n  ')}`);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// CR-01 del code review de la Phase 47 (T-47-05 / T-47-11 / T-47-18) —
// EL ESCRITOR NO PUEDE BORRAR UN `incorrecta` EN SILENCIO.
//
// La rama UPDATE deduplicaba por `by` ANTES de derivar el status, así que
// re-correr un modelo que ya había objetado eliminaba su pase del array y
// `deriveStatus` —que sólo aplica el sticky sobre un `incorrecta` que sigue
// presente— devolvía `validated`. Sin override, sin motivo y sin rastro en
// el JSON. Con `--temp=0.2` el veredicto del mismo modelo no es determinista,
// o sea que era una ruta para re-tirar el dado hasta el verde, y más
// silenciosa que el mecanismo `by:"autor"` + `override:true` + motivo que el
// proyecto tiene justo para esto.
//
// Las cuatro primeras aserciones FALLAN contra el código anterior al guard:
// hoy la primera devolvía `status: 'validated'` en vez de lanzar.
// ══════════════════════════════════════════════════════════════════════════

describe('el disenso no se borra en silencio (CR-01)', () => {
  /** Documento sintético: un `translationES` con un bloque validation ya poblado. */
  const docCon = (passes) =>
    JSON.stringify(
      {
        exercises: [
          {
            id: 'sint-cr01',
            type: 'multiple-choice',
            variants: [
              {
                prompt: 'Compro ___ pane.',
                options: ['del'],
                correctIndex: 0,
                translationES: { text: 'Compro pan.', validation: { status: 'x', passes } },
              },
            ],
          },
        ],
      },
      null,
      2
    );

  test('re-correr un modelo que ya objetó NO puede limpiar el disputed: lanza y no compone nada', () => {
    const texto = docCon([pase('gemini-x'), pase('deepseek-y', 'incorrecta', { concerns: ['[S2] objeción'] })]);
    // Punto de partida: el disenso está en pie.
    assert.equal(
      deriveStatus(JSON.parse(texto).exercises[0].variants[0].translationES.validation.passes),
      'disputed',
      'no-vacuidad: sin un disputed de partida este test no probaría nada'
    );

    assert.throws(
      () => applyPassToText(texto, 'sint-cr01', 0, pase('deepseek-y', 'correcta')),
      /ya emitió un `incorrecta`/,
      'el escritor debe negarse: sustituir el propio incorrecta limpiaría el disputed sin adjudicación'
    );
  });

  test('el mensaje nombra la dirección compuesta, el modelo y las dos salidas legítimas', () => {
    const texto = docCon([pase('gemini-x'), pase('deepseek-y', 'incorrecta', { concerns: ['[S2] objeción'] })]);
    try {
      applyPassToText(texto, 'sint-cr01', 0, pase('deepseek-y', 'correcta'));
      assert.fail('debía lanzar');
    } catch (e) {
      assert.match(e.message, /sint-cr01#0/, 'sin la dirección, el autor no sabe sobre qué se estaba escribiendo');
      assert.match(e.message, /deepseek-y/, 'debe nombrar al modelo que objetó');
      assert.match(e.message, /--adjudicar=/, 'debe decir cuál es el camino deliberado');
      assert.match(e.message, /impreso en stdout/, 'el pase está PAGADO: no puede perderse en silencio');
    }
  });

  test('un `incorrecta` sustituido por otro `incorrecta` del mismo modelo SÍ pasa (el disenso no se borra)', () => {
    const texto = docCon([pase('gemini-x'), pase('deepseek-y', 'incorrecta', { concerns: ['[S2] vieja'] })]);
    const out = applyPassToText(texto, 'sint-cr01', 0, pase('deepseek-y', 'incorrecta', { concerns: ['[S4] nueva'] }));
    assert.equal(out.status, 'disputed');
    assert.deepEqual(out.passesEscritos.at(-1).concerns, ['[S4] nueva']);
  });

  test('CONTROL DE NO-REGRESIÓN: re-correr un modelo cuyo pase previo era `correcta` sigue sustituyendo', () => {
    // Sin esto, la re-validación completa de 47-02 (las 32 + las 4 bajo el doc
    // amendado) dejaría de ser posible, y el guard sería peor que el bug.
    const texto = docCon([pase('gemini-x'), pase('deepseek-y', 'correcta')]);
    const out = applyPassToText(texto, 'sint-cr01', 0, { ...pase('deepseek-y', 'correcta'), date: '2026-08-15' });
    assert.equal(out.status, 'validated');
    assert.equal(out.passesEscritos.length, 2, 'sigue deduplicando por `by`: no se acumulan pases del mismo modelo');
    assert.equal(out.passesEscritos.at(-1).date, '2026-08-15');
  });

  test('la RETIRADA DELIBERADA sigue siendo posible, pero deja su motivo escrito DENTRO del JSON', () => {
    // El precedente real: los 62 pases `deepseek-chat` retirados de `articoli` en
    // 264dd19 al cambiar de juez sobre la categoría entera (WINDOWS id 38), 8 de
    // ellos `incorrecta`. Esa decisión estaba adjudicada y registrada — pero el
    // código no la distinguía de un borrado accidental. Ahora sí: el camino existe
    // y cuesta un motivo escrito que acaba en disco.
    const texto = docCon([pase('gemini-x'), pase('deepseek-y', 'incorrecta', { concerns: ['[S2] objeción'] })]);
    const motivo = 'cambio de juez sobre la categoría entera, decidido por el autor (WINDOWS id 38)';
    const out = applyPassToText(texto, 'sint-cr01', 0, pase('deepseek-y', 'correcta', { adjudicacion: motivo }));

    assert.equal(out.status, 'validated');
    const enDisco = JSON.parse(out.text).exercises[0].variants[0].translationES.validation;
    assert.equal(
      enDisco.passes.at(-1).adjudicacion,
      motivo,
      'el motivo TIENE que quedar en el fichero: si sólo vive en la CLI, la retirada vuelve a ser invisible'
    );
    assert.ok(
      !enDisco.passes.some((p) => p.by === 'deepseek-y' && p.verdict === 'incorrecta'),
      'la retirada es real (el pase viejo se va); lo que cambia es que ahora deja constancia'
    );
  });

  test('el guard está en TODOS los escritores de pase, y la lista se DERIVA del disco', () => {
    // Anti-ceguera: los otros tres escritores no tienen tests unitarios, así que la
    // única forma de que un quinto escritor futuro no nazca sin guard es derivar el
    // conjunto del directorio en vez de transcribir cuatro nombres aquí.
    const dir = path.join(ROOT, 'scripts');
    const escritores = fs
      .readdirSync(dir)
      .filter((f) => /^validate-.*-pass\.mjs$/.test(f))
      .map((f) => [f, fs.readFileSync(path.join(dir, f), 'utf8')])
      .filter(([, src]) => /\.filter\(\(p\) => p\.by !== pass\.by\)/.test(src));

    assert.ok(escritores.length >= 4, `no-vacuidad: se esperaban >=4 escritores que deduplican por \`by\`, hay ${escritores.length}`);

    const sinGuard = escritores
      .filter(([, src]) => !/assertNoBorraIncorrectaEnSilencio\(/.test(src))
      .map(([f]) => f);
    assert.deepEqual(
      sinGuard,
      [],
      `escritores que deduplican por \`by\` SIN el guard de CR-01: ${sinGuard.join(', ')} — ` +
        `cada uno de ellos puede limpiar un disputed sin dejar rastro`
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// WR-05 del code review de la Phase 47 — la `option` es un VALOR, no un patrón.
//
// `String.prototype.replace` interpreta su segundo argumento como patrón de
// SUSTITUCIÓN cuando es una cadena, así que `$&`, `$'`, `` $` `` y `$n` no
// llegan literales a la frase. Contra el código anterior estas aserciones
// fallan: devolvía `"Compro ___del pane."` y `"Compro d pane. pane."`.
//
// Inalcanzable hoy (cero `options` con `$` en el corpus, barrido en disco),
// así que es robustez. Pero la rama afectada es la de las opciones con
// apóstrofo, `$'` son dos caracteres, y el fallo sería silencioso: una frase
// malformada enviada al evaluador de pago que ningún gate cazaría.
// ══════════════════════════════════════════════════════════════════════════

describe('la option se incrusta como VALOR, no como patrón de sustitución (WR-05)', () => {
  test('los patrones de String.replace no se interpretan en la rama normal', () => {
    assert.equal(fillGap('Compro ___ pane.', ['$&del'], 0), 'Compro $&del pane.', '`$&` reinsertaba el hueco');
    assert.equal(fillGap('Compro ___ pane.', ["d$'"], 0), "Compro d$' pane.", '`$\'` duplicaba la cola');
    assert.equal(fillGap('Compro ___ pane.', ['d$`'], 0), 'Compro d$` pane.', '`$`` reinsertaba la cabeza');
    assert.equal(fillGap('Compro ___ pane.', ['$1x'], 0), 'Compro $1x pane.');
    assert.equal(fillGap('Compro ___ pane.', ['$$'], 0), 'Compro $$ pane.', '`$$` se colapsaba a un solo `$`');
  });

  test('tampoco en la rama de las opciones ELIDIDAS, que es la que come el espacio', () => {
    // El sujeto tiene que acabar en consonante + apóstrofo para caer en la rama elidida
    // (`d$'` NO vale: lo que precede al apóstrofo es `$`, no una consonante — lo cazó
    // este mismo test en su primera redacción). Con `$&` delante, la rama elidida es la
    // que más daño hacía: su regex captura `___ ` CON el espacio, así que `$&` lo
    // reinsertaba entero.
    assert.equal(fillGap('Metti ___ aceto.', ["$&dell'"], 0), "Metti $&dell'aceto.");
  });

  test('BARRIDO EN DISCO: hoy ninguna option del corpus contiene `$` (por eso es robustez)', () => {
    const dir = path.join(ROOT, 'content/exercises');
    const conDolar = [];
    let opciones = 0;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const ex of data.exercises || []) {
        for (const v of ex.variants || []) {
          for (const o of v?.options || []) {
            opciones++;
            if (typeof o === 'string' && o.includes('$')) conDolar.push(`${ex.id}: ${JSON.stringify(o)}`);
          }
        }
      }
    }
    assert.ok(opciones > 0, 'no-vacuidad: el barrido no encontró ni una option en disco');
    // NO es una aserción de que nunca pueda haberla: es la que documenta por qué el
    // defecto estaba latente. Si algún día aparece una, este test se pone rojo y el
    // lector va derecho al bloque de arriba, que ya cubre el comportamiento.
    assert.deepEqual(conDolar, [], `options con \`$\`: ${conDolar.join('; ')}`);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// WR-02 del code review de la Phase 47 — los invariantes de corpus en que se
// apoyan las ramas de `fillGap` se DERIVAN DEL DISCO, no viven en prosa.
//
// Las dos ramas nuevas descansan sobre afirmaciones fechadas escritas en
// comentario: «hoy sólo existe UNA notación de marcador nulo en todo el
// corpus» y «el único caso de apócope del corpus es `fa' una foto`». Las dos
// son ciertas hoy — pero nada las deriva del disco. Si una fase futura da de
// alta un segundo marcador con otra notación (`—`, `Ø` U+00D8, `(nada)`) o una
// apócope nueva, `MARCADOR_NULO` / `OPCION_ELIDIDA` dejan de casar, la frase
// malformada vuelve al evaluador de pago y ningún test se pone rojo.
//
// Es la lección que este repo ya congeló: un gate que assertea una cifra
// escrita sin derivarla del disco certifica en verde un número obsoleto. Aquí
// la cifra es «una notación / una apócope», y el riesgo es idéntico.
// ══════════════════════════════════════════════════════════════════════════

describe('los invariantes de corpus de fillGap se derivan del disco (WR-02)', () => {
  /** Todas las `options` del corpus, con su dirección, derivadas del disco. */
  function todasLasOpciones() {
    const dir = path.join(ROOT, 'content/exercises');
    const out = [];
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      for (const ex of data.exercises || []) {
        (ex.variants || []).forEach((v, k) => {
          for (const o of v?.options || []) if (typeof o === 'string') out.push([`${ex.id}#${k}`, o]);
        });
      }
    }
    return out;
  }

  test('no-vacuidad: el barrido de opciones ve corpus, y ve los dos sujetos que vigila', () => {
    const opciones = todasLasOpciones();
    assert.ok(opciones.length > 0, 'sin opciones en disco, los dos gates de abajo pasarían certificando nada');
    // Los sujetos ACTUALES, derivados y no transcritos: si el corpus perdiera su único
    // marcador nulo o su única apócope, los gates de abajo se volverían vacuos en
    // silencio y este test lo dice antes.
    assert.ok(
      opciones.some(([, o]) => /∅/.test(o)),
      'el corpus ya no declara ningún marcador nulo: la rama del marcador de fillGap se quedó sin sujeto'
    );
    assert.ok(
      opciones.some(([, o]) => /[aeiou]'$/i.test(o)),
      "el corpus ya no declara ninguna apócope: el contraejemplo de OPCION_ELIDIDA (`fa'`) se quedó sin sujeto"
    );
  });

  test('ninguna NOTACIÓN DE AUSENCIA del corpus se le escapa a MARCADOR_NULO', () => {
    // El barrido es DELIBERADAMENTE más ancho que `MARCADOR_NULO`: busca cualquier
    // forma plausible de notar «aquí no va nada» y exige que el discriminador la
    // reconozca. Una notación que el barrido ve y `MARCADOR_NULO` no, es una cadena que
    // `fillGap` incrustaría dentro de la frase italiana.
    const NOTACION_DE_AUSENCIA = /(^|\s)(∅|Ø|—|–|\(nada\)|\(niente\)|\(nulla\)|sin\s|senza\s)/i;
    const sospechosas = todasLasOpciones()
      .filter(([, o]) => NOTACION_DE_AUSENCIA.test(o))
      .filter(([, o]) => !/∅/.test(o))
      .map(([addr, o]) => `${addr}: ${JSON.stringify(o)}`);
    assert.deepEqual(
      sospechosas,
      [],
      `notación de ausencia que MARCADOR_NULO no reconoce — fillGap la incrustaría literalmente ` +
        `en la frase italiana y la mandaría así al evaluador de pago:\n  ${sospechosas.join('\n  ')}`
    );
  });

  test('toda opción que TERMINA en apóstrofo cae del lado correcto del discriminador', () => {
    // El discriminador es la letra que precede al apóstrofo FINAL: consonante = elisión
    // (se suelda a la palabra siguiente), vocal = apócope del imperativo (no se suelda).
    // Sólo gobierna el apóstrofo final, que es donde se decide la soldadura: un
    // apóstrofo a media opción (`un po' di`, 5 ocurrencias en partitivos) cae en la rama
    // normal y se incrusta tal cual, que es lo correcto. La primera redacción de este
    // test barría TODO apóstrofo y las marcó como infracción — la premisa equivocada era
    // la del test, no el código.
    //
    // Lo que sí vigila: que no aparezca una TERCERA forma fuera de los dos lados, p. ej.
    // un apóstrofo tipográfico `’` (hoy 0 ocurrencias), que haría que `OPCION_ELIDIDA`
    // dejara de casar sin que nada se pusiera rojo.
    const inclasificables = todasLasOpciones()
      .filter(([, o]) => /['’]$/.test(o))
      .filter(([, o]) => !/[bcdfghjklmnpqrstvwxyz]'$/i.test(o) && !/[aeiou]'$/i.test(o))
      .map(([addr, o]) => `${addr}: ${JSON.stringify(o)}`);
    assert.deepEqual(
      inclasificables,
      [],
      `opción con apóstrofo que NO cae ni en elisión ni en apócope, así que el discriminador ` +
        `ortográfico de fillGap no la gobierna:\n  ${inclasificables.join('\n  ')}`
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// WR-06 del code review de la Phase 47 — el temporal de la escritura atómica
// está IGNORADO por git.
//
// El escritor crea `${file}.tmp-${process.pid}` en el MISMO directorio que el
// corpus y lo renombra sobre el original. El doc-block razona que `findSlot` no
// puede verlo porque filtra por `.json` —cierto—, pero no cubre al otro
// consumidor: un `git add -A` tras una corrida muerta commitearía una copia
// COMPLETA y desfasada del corpus. `.gitignore` ya ignora los `.lock` de
// file-lock.mjs por el razonamiento equivalente; la misma frase valía aquí y no
// se había escrito.
//
// Este gate corre `git check-ignore` de verdad en vez de grepear `.gitignore`:
// lo que importa no es que exista una línea sino que la regla CASE, y las
// precedencias de git (negaciones, reglas por directorio) no se leen a ojo.
// ══════════════════════════════════════════════════════════════════════════

describe('el temporal de la escritura atómica no puede colarse en un commit (WR-06)', () => {
  test('git ignora `<corpus>.json.tmp-<pid>`, y NO ignora el .json de al lado', () => {
    // El sufijo se DERIVA del escritor, no se transcribe: si algún día deja de ser
    // `.tmp-<pid>`, este gate se pone rojo en vez de seguir vigilando un patrón muerto.
    const escritor = readAbs(SCRIPT);
    assert.match(
      escritor,
      /\$\{file\}\.tmp-\$\{process\.pid\}/,
      'el escritor ya no construye su temporal como `${file}.tmp-${process.pid}`: ' +
        'revisa que la regla de .gitignore siga cubriendo la forma nueva'
    );

    // `--no-index` es LOAD-BEARING, no un adorno: sin él, git se niega a declarar
    // ignorado un fichero ya TRACKEADO, así que la mitad de direccionalidad de abajo
    // pasaba en verde aunque la regla fuese `*.json*` y se estuviera tragando el corpus
    // entero. Con `--no-index` la pregunta es sobre el PATRÓN, que es lo que este gate
    // dice comprobar. Medido: `*.json*` da exit 1 sin la bandera y exit 0 con ella.
    const checkIgnore = (rel) =>
      spawnSync('git', ['check-ignore', '-q', '--no-index', rel], { cwd: ROOT, encoding: 'utf8' }).status;

    // Sujeto derivado del corpus real, con un pid sintético: no se crea ningún fichero.
    const objetivo = `content/exercises/articoli.json.tmp-${process.pid}`;
    assert.equal(
      checkIgnore(objetivo),
      0,
      `${objetivo} NO está ignorado: un \`git add -A\` tras una corrida muerta commitearía una ` +
        `copia completa y desfasada del corpus`
    );

    // DIRECCIONALIDAD, y no es decorativa: una regla demasiado ancha (p. ej. `*.json*`)
    // ignoraría el corpus ENTERO y dejaría de commitearse el contenido sin que nada lo
    // dijera. Eso sería mucho peor que el defecto que se está arreglando.
    assert.notEqual(
      checkIgnore('content/exercises/articoli.json'),
      0,
      'la regla es DEMASIADO ancha: está ignorando el propio corpus'
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════
// La prosa que escriben LOS MODELOS no puede romper el gate de higiene del
// contenido (`WINDOWS` id 43) — y `--adjudicar` no puede fabricar un registro
// que se lea como adjudicado sin estarlo (`WINDOWS` id 45)
// ══════════════════════════════════════════════════════════════════════════

describe('saneo de la prosa de los modelos antes de que toque el corpus (WINDOWS id 43)', () => {
  // LA REFERENCIA SE DERIVA DEL GATE, no se transcribe: son las marcas que
  // tests/content-*.test.js prohibe en CUALQUIER string del fichero (T-41-01 y
  // D-41-17). Si el gate añade una marca y el saneador no, este bloque no lo
  // veria — asi que la lista se lee del fichero del gate.
  const SRC_GATE = fs.readFileSync(path.join(ROOT, 'tests/content-fare-indicativo.test.js'), 'utf8');

  test('el gate que motiva el saneo SIGUE prohibiendo las marcas que el saneador quita (no-vacuidad)', () => {
    // Sin esto, un gate relajado dejaria este bloque entero certificando NADA.
    assert.match(
      SRC_GATE,
      /for \(const marca of \['<', '>', '&#', 'javascript:'\]\)/,
      'T-41-01 dejo de prohibir las cuatro marcas, o cambio de forma: revisa sanearParaCorpus'
    );
    assert.match(
      SRC_GATE,
      /\[‘’“”\]/,
      'D-41-17 dejo de prohibir las comillas tipograficas: revisa sanearParaCorpus'
    );
  });

  test('las sustituciones preservan el significado y no pierden ni un caracter de informacion', () => {
    assert.equal(sanearParaCorpus('hacia -> yo hacia'), 'hacia → yo hacia');
    assert.equal(sanearParaCorpus('A => B'), 'A ⇒ B');
    assert.equal(sanearParaCorpus('la entidad &#233; sobra'), 'la entidad & #233; sobra');
    assert.equal(sanearParaCorpus('un javascript:alert(1)'), 'un javascript :alert(1)');
    assert.equal(sanearParaCorpus('5 < 7 y 9 > 3'), '5 ‹ 7 y 9 › 3');
    assert.equal(sanearParaCorpus('dice “hacia” y ‘eso’'), 'dice "hacia" y \'eso\'');
  });

  test('un string limpio sale IDENTICO: el saneador no toca lo que no tiene que tocar', () => {
    const limpio = '[S4-acentos] falta la tilde en "psicologos": debe ser psicologos con tilde';
    assert.equal(sanearParaCorpus(limpio), limpio);
    const acentuado = '[S2-fidelidad] la traduccion omite el adverbial « a merenda »; él/ella';
    assert.equal(sanearParaCorpus(acentuado), acentuado, 'el espanol acentuado y las comillas latinas se quedan');
  });

  test('NINGUNA marca prohibida sobrevive al saneador, ni combinada ni repetida', () => {
    const sucio = 'X -> Y, A => B, <b>, &#39;, javascript:void, “q”, ‘r’, a>b, c<d';
    const limpio = sanearParaCorpus(sucio);
    for (const marca of ['<', '>', '&#', 'javascript:', '‘', '’', '“', '”']) {
      assert.ok(!limpio.includes(marca), `sobrevive la marca ${marca} en: ${limpio}`);
    }
  });

  test('el saneo ocurre en applyPassToText, que es el UNICO paso obligatorio hacia el disco', () => {
    const doc = JSON.stringify(
      {
        exercises: [
          {
            id: 'sint-saneo',
            type: 'multiple-choice',
            variants: [
              {
                prompt: 'Io ___ i compiti.',
                options: ['faccio'],
                correctIndex: 0,
                translationES: { text: 'Yo hago los deberes.' },
              },
            ],
          },
        ],
      },
      null,
      2
    );
    // El verdict es `correcta` y NO `incorrecta` desde el arreglo de WR-02: un pase
    // `incorrecta` con `adjudicacion` es el artefacto de WINDOWS id 45 y el escritor
    // ahora lo rechaza. Lo que este test verifica —que los DOS campos de prosa
    // (`concerns` y `adjudicacion`) se sanean— no depende del veredicto, y `correcta`
    // con `adjudicacion` es ademas el shape LEGITIMO (el camino de la id 38).
    const out = applyPassToText(doc, 'sint-saneo', 0, {
      by: 'modelo-sucio',
      date: '2026-08-16',
      verdict: 'correcta',
      concerns: ['[S2] hacia -> yo hacia, y “eso”'],
      adjudicacion: 'el autor refuta: a -> b',
    });
    const enDisco = JSON.parse(out.text).exercises[0].variants[0].translationES.validation;
    assert.deepEqual(enDisco.passes[0].concerns, ['[S2] hacia → yo hacia, y "eso"']);
    assert.equal(enDisco.passes[0].adjudicacion, 'el autor refuta: a → b');
    assert.deepEqual(
      out.passesEscritos[0].concerns,
      enDisco.passes[0].concerns,
      'passesEscritos tiene que reflejar lo que quedo en el fichero, no lo que llego'
    );
  });

  test('el verdict, el by y la date NO los toca el saneo', () => {
    const pass = { by: 'deepseek-reasoner', date: '2026-08-16', verdict: 'incorrecta', concerns: ['a -> b'] };
    const saneado = sanearPase(pass);
    assert.equal(saneado.by, pass.by);
    assert.equal(saneado.date, pass.date);
    assert.equal(saneado.verdict, pass.verdict);
    assert.notEqual(saneado.concerns[0], pass.concerns[0], 'el concern SI se sanea');
    assert.deepEqual(pass.concerns, ['a -> b'], 'sanearPase no muta su argumento');
  });
});

describe('el ESCRITOR tambien rechaza el artefacto de WINDOWS id 45 (WR-02 del code review de la Phase 48)', () => {
  // POR QUE HACE FALTA ESTE BLOQUE Y NO BASTABA EL DE MAS ABAJO. Los tres tests de
  // `--adjudicar` invocan `run()` con `target.file` = 'no-se-toca.json', y hoy pasan
  // porque `run` corta ANTES de llamar al escritor. El guard del escritor no lo alcanza,
  // asi que esos tests siguen VERDES con o sin este arreglo: no lo verifican. La
  // cobertura tiene que estar al nivel de `applyPassToText`, que es donde estaba el
  // agujero.
  const docConIncorrectaPrevio = (by) =>
    JSON.stringify(
      {
        exercises: [
          {
            id: 'sint-wr02',
            type: 'multiple-choice',
            variants: [
              {
                prompt: 'Io ___ i compiti.',
                options: ['faccio'],
                correctIndex: 0,
                translationES: {
                  text: 'Yo hago los deberes.',
                  validation: {
                    status: 'disputed',
                    passes: [{ by, date: '2026-08-01', verdict: 'incorrecta', concerns: ['[S2] no lo veo'] }],
                  },
                },
              },
            ],
          },
        ],
      },
      null,
      2
    );

  test('un pase `incorrecta` con `adjudicacion` NO se escribe: applyPassToText lanza', () => {
    assert.throws(
      () =>
        applyPassToText(docConIncorrectaPrevio('m2'), 'sint-wr02', 0, {
          by: 'm2',
          date: '2026-08-16',
          verdict: 'incorrecta',
          concerns: ['[S2] sigo sin verlo'],
          adjudicacion: 'el autor refuta el concern en cuatro puntos',
        }),
      /sint-wr02#0: un pase `incorrecta` NO puede llevar `adjudicacion`/
    );
  });

  test('tampoco cuando no hay `incorrecta` previo: la prohibicion es sobre la FORMA del pase', () => {
    // La rama INSERT y la rama UPDATE-sin-disenso-previo tambien quedan cubiertas: el
    // guard va fuera de las dos, porque el artefacto es ilegible en el corpus se llegue
    // por donde se llegue.
    const virgen = JSON.stringify(
      {
        exercises: [
          {
            id: 'sint-wr02',
            type: 'multiple-choice',
            variants: [
              { prompt: 'Io ___ i compiti.', options: ['faccio'], correctIndex: 0, translationES: { text: 'Yo hago los deberes.' } },
            ],
          },
        ],
      },
      null,
      2
    );
    assert.throws(
      () =>
        applyPassToText(virgen, 'sint-wr02', 0, {
          by: 'm9',
          date: '2026-08-16',
          verdict: 'incorrecta',
          concerns: ['[S2] no'],
          adjudicacion: 'motivo',
        }),
      /NO puede llevar `adjudicacion`/
    );
  });

  test('lo LEGITIMO sigue abierto: `correcta` con `adjudicacion` se escribe (el camino de la id 38)', () => {
    const out = applyPassToText(docConIncorrectaPrevio('m2'), 'sint-wr02', 0, {
      by: 'm2',
      date: '2026-08-16',
      verdict: 'correcta',
      concerns: [],
      adjudicacion: 'cambio de juez sobre la categoria entera, decidido por el autor',
    });
    const enDisco = JSON.parse(out.text).exercises[0].variants[0].translationES.validation;
    assert.equal(enDisco.passes.at(-1).verdict, 'correcta');
    assert.equal(enDisco.passes.at(-1).adjudicacion, 'cambio de juez sobre la categoria entera, decidido por el autor');
  });

  test('y un `incorrecta` NORMAL, sin adjudicacion, se sigue escribiendo: el disenso se registra', () => {
    const out = applyPassToText(docConIncorrectaPrevio('otro'), 'sint-wr02', 0, {
      by: 'm2',
      date: '2026-08-16',
      verdict: 'incorrecta',
      concerns: ['[S4-acentos] falta una tilde'],
    });
    const enDisco = JSON.parse(out.text).exercises[0].variants[0].translationES.validation;
    assert.equal(enDisco.passes.at(-1).verdict, 'incorrecta');
    assert.ok(!('adjudicacion' in enDisco.passes.at(-1)));
  });

  test('una `adjudicacion` en blanco no cuenta como motivo y no bloquea nada', () => {
    const out = applyPassToText(docConIncorrectaPrevio('otro'), 'sint-wr02', 0, {
      by: 'm2',
      date: '2026-08-16',
      verdict: 'incorrecta',
      concerns: ['[S4-acentos] falta una tilde'],
      adjudicacion: '   ',
    });
    assert.equal(JSON.parse(out.text).exercises[0].variants[0].translationES.validation.passes.at(-1).verdict, 'incorrecta');
  });
});

describe('el pase que se IMPRIME es el pase que se ESCRIBE (WR-01 del code review de la Phase 48)', () => {
  // POR QUE ESTE BLOQUE EXISTE. El saneo se puso en `applyPassToText` a proposito, y ahi
  // se queda. La consecuencia NO declarada era que `run` componia el pase, se lo pasaba
  // al escritor, IGNORABA el `out` que este devuelve y retornaba el pase ORIGINAL: lo
  // que `main` imprime en las TRES salidas —exito, exit 3 y exit 4— llevaba las marcas
  // sin sanear. Y las tres son caminos de recuperacion A MANO: el mensaje del exit 3
  // dice literalmente «aplicalo a mano», asi que lo que el autor pega en el JSON es
  // exactamente lo que el saneo existe para impedir.
  const MARCAS = ['->', '=>', '&#', '<', '>', '‘', '’', '“', '”'];
  const SUCIO = '[S1-natural] “hacia” -> “hacía”; ver <b>';
  const target = () => ({ file: 'no-se-toca.json', slot: { id: 'sint-wr01' }, k: 0 });
  const respuesta = (verdict, concerns) => ({
    text:
      '```json\n' +
      JSON.stringify({
        verdict,
        criteria: {
          s1_natural: verdict === 'correcta',
          s2_fidelidad: true,
          s4_acentos: true,
          s5_italiano: true,
          s6_naturalidad: true,
        },
        concerns,
      }) +
      '\n```',
  });
  const sinMarcas = (pass) => {
    const texto = JSON.stringify([pass.concerns ?? [], pass.adjudicacion ?? '']);
    return MARCAS.filter((m) => texto.includes(m));
  };

  test('el pase DEVUELTO por run() en el camino de exito no lleva marcas prohibidas', async () => {
    const cfg = { MODEL_QUEUE: ['m'], TEMP: 0.2, WRITE: false, ADJUDICAR: '' };
    const pass = await run(cfg, target(), 'prompt', async () => respuesta('incorrecta', [SUCIO]), contratoVigente());
    assert.deepEqual(sinMarcas(pass), [], `el pase devuelto lleva marcas: ${JSON.stringify(pass.concerns)}`);
    assert.ok(pass.concerns[0].includes('→'), 'el saneo SUSTITUYE preservando el significado, no borra');
  });

  test('el pase DEVUELTO por el camino del exit 4 (--adjudicar rechazado) tampoco', async () => {
    const cfg = { MODEL_QUEUE: ['m'], TEMP: 0.2, WRITE: true, ADJUDICAR: 'el autor refuta: a -> b' };
    const pass = await run(cfg, target(), 'prompt', async () => respuesta('incorrecta', [SUCIO]), contratoVigente());
    assert.equal(pass.noEscrito, 'adjudicacion_sobre_incorrecta');
    assert.deepEqual(sinMarcas(pass), [], 'el motivo del autor tambien viaja saneado por stdout');
  });

  test('NO se ha movido el saneo: applyPassToText sigue saneando por su cuenta (idempotencia)', () => {
    // La mitad que impide que este arreglo REINTRODUZCA el agujero que 48-05 cerro: si
    // alguien decidiese que «ya se sanea en run» y quitase el saneo del escritor, el
    // camino que los tests usan —llamar a applyPassToText directamente— quedaria abierto.
    const doc = JSON.stringify(
      {
        exercises: [
          {
            id: 'sint-wr01',
            type: 'multiple-choice',
            variants: [
              { prompt: 'Io ___ i compiti.', options: ['faccio'], correctIndex: 0, translationES: { text: 'Yo hago los deberes.' } },
            ],
          },
        ],
      },
      null,
      2
    );
    const out = applyPassToText(doc, 'sint-wr01', 0, {
      by: 'modelo-sucio',
      date: '2026-08-16',
      verdict: 'incorrecta',
      concerns: [SUCIO],
    });
    const escrito = JSON.parse(out.text).exercises[0].variants[0].translationES.validation.passes[0];
    assert.deepEqual(sinMarcas(escrito), []);
    // Y el saneo es IDEMPOTENTE, que es lo que permite que viva en los DOS sitios.
    assert.deepEqual(sanearPase(sanearPase({ concerns: [SUCIO] })), sanearPase({ concerns: [SUCIO] }));
  });
});

describe('--adjudicar rechaza escribir cuando el modelo NO se ha dejado adjudicar (WINDOWS id 45)', () => {
  const target = () => ({ file: 'no-se-toca.json', slot: { id: 'sint-adj' }, k: 0 });
  const respuesta = (verdict, concerns) => ({
    text:
      '```json\n' +
      JSON.stringify({
        verdict,
        criteria: {
          s1_natural: verdict === 'correcta',
          s2_fidelidad: true,
          s4_acentos: true,
          s5_italiano: true,
          s6_naturalidad: true,
        },
        concerns,
      }) +
      '\n```',
  });

  test('verdict `incorrecta` con --adjudicar: NO se escribe nada y el pase se devuelve marcado', async () => {
    let escrituras = 0;
    const cfg = { MODEL_QUEUE: ['modelo-terco'], TEMP: 0.2, WRITE: true, ADJUDICAR: 'refutacion de cuatro puntos' };
    const caller = async () => { escrituras++; return respuesta('incorrecta', ['[S2] sigo sin verlo']); };
    const pass = await run(cfg, target(), 'prompt', caller, contratoVigente());
    assert.equal(pass.verdict, 'incorrecta');
    assert.equal(pass.noEscrito, 'adjudicacion_sobre_incorrecta');
    assert.equal(escrituras, 1, 'se invoco UNA vez: rechazar no puede convertirse en re-tirar el dado');
  });

  test('verdict `correcta` con --adjudicar: el camino legitimo sigue abierto y el motivo viaja en el pase', async () => {
    const cfg = { MODEL_QUEUE: ['modelo-persuadido'], TEMP: 0.2, WRITE: false, ADJUDICAR: 'motivo real escrito' };
    const caller = async () => respuesta('correcta', []);
    const pass = await run(cfg, target(), 'prompt', caller, contratoVigente());
    assert.equal(pass.verdict, 'correcta');
    assert.equal(pass.adjudicacion, 'motivo real escrito');
    assert.ok(!pass.noEscrito, 'una adjudicacion que SI adjudica no se rechaza');
  });

  test('verdict `incorrecta` SIN --adjudicar: se escribe como siempre (el rechazo no se ha comido el caso normal)', async () => {
    const cfg = { MODEL_QUEUE: ['modelo-objetor'], TEMP: 0.2, WRITE: false, ADJUDICAR: '' };
    const caller = async () => respuesta('incorrecta', ['[S4-acentos] falta una tilde']);
    const pass = await run(cfg, target(), 'prompt', caller, contratoVigente());
    assert.equal(pass.verdict, 'incorrecta');
    assert.ok(!pass.noEscrito, 'un incorrecta normal NO se rechaza: el disenso se registra');
    assert.ok(!('adjudicacion' in pass));
  });
});
