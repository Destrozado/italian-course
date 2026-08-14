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
    assert.equal(fillGap('___ pane è buono.', NULO, 0), 'pane è buono.', 'hueco inicial: sin espacio suelto delante');
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
