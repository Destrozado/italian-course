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

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const SCRIPT = 'scripts/validate-translation-pass.mjs';
const PROMPT_DOC = 'docs/TRANSLATION-VALIDATION-PROMPT.md';
const PREPOS = 'content/exercises/preposiciones.json';

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

// La dirección compuesta del corpus real: slot con 2 variantes, la #1 traducida y
// la #0 sin traducir. Se derivan del DISCO, no se transcriben (D-31-06).
const PREPOS_DOC = JSON.parse(readAbs(PREPOS));
const SLOT_CANONICO = PREPOS_DOC.exercises[0];
const IDX_TRADUCIDA = SLOT_CANONICO.variants.findIndex((v) => v && v.translationES);
const IDX_SIN_TRADUCIR = SLOT_CANONICO.variants.findIndex((v) => v && !v.translationES);

describe('validate-translation-pass — dirección compuesta <slot-id>#<k> (TVAL-02)', () => {
  test('el fixture de partida del corpus tiene lo que estos tests necesitan (no-vacuidad)', () => {
    assert.equal(SLOT_CANONICO.type, 'multiple-choice', 'el slot canónico debe ser multiple-choice');
    assert.ok(IDX_TRADUCIDA >= 0, 'el slot canónico debe tener AL MENOS una variante con translationES');
    assert.ok(IDX_SIN_TRADUCIR >= 0, 'el slot canónico debe tener AL MENOS una variante SIN translationES');
    assert.ok(
      SLOT_CANONICO.variants.length >= 2,
      `el slot canónico debe tener >=2 variantes para probar el aislamiento; tiene ${SLOT_CANONICO.variants.length}`
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
    assert.ok(
      r.stdout.indexOf('Traducción bajo evaluación (DATA)') > r.stdout.indexOf('## 6. Guard anti prompt-injection'),
      'el bloque DATA se adjunta DESPUÉS del doc, nunca antes (el guard debe leerse primero)'
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
    const antes = readAbs(PREPOS);
    const r = runCli([`${SLOT_CANONICO.id}#${IDX_SIN_TRADUCIR}`, '--write']);
    assert.notEqual(r.status, 0, 'una variante sin traducción no puede terminar en éxito');
    assert.equal(r.status, 2, `esperaba exit 2; stderr: ${r.stderr}`);
    assert.ok(/translationES/.test(r.stderr), `el error debe nombrar translationES; stderr: ${r.stderr}`);
    assert.equal(readAbs(PREPOS), antes, 'no puede tocar el disco: cero bloques validation vacíos');
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
