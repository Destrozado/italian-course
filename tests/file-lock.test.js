// tests/file-lock.test.js — quick-260728-8pg
//
// Tests del módulo de exclusión mutua entre procesos vía lockfile.
//     node --test tests/*.test.js
//
// Invariante crítico: la región crítica read-modify-write de los scripts de pase
// no puede solaparse. Si dos titulares entran a la vez, uno pisa el pase del otro
// (lost update) y el corpus pierde validaciones silenciosamente.

import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { withFileLock } from '../scripts/lib/file-lock.mjs';

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'file-lock-'));
after(() => fs.rmSync(TMP, { recursive: true, force: true }));

let seq = 0;
function tmpFile(initial = '0') {
  const p = path.join(TMP, `data-${seq++}.json`);
  fs.writeFileSync(p, initial);
  return p;
}

// opts cortos: la suite entera debe correr en menos de 3s
const FAST = { timeoutMs: 2000, staleMs: 5000, retryMinMs: 2, retryMaxMs: 15 };

describe('scripts/lib/file-lock', () => {
  test('exclusión real: dos titulares concurrentes no pierden escrituras', async () => {
    const file = tmpFile('0');
    let dentro = 0;
    let maxDentro = 0;

    const incrementar = () =>
      withFileLock(
        file,
        async () => {
          dentro++;
          maxDentro = Math.max(maxDentro, dentro);
          const n = parseInt(fs.readFileSync(file, 'utf8'), 10);
          await new Promise((r) => setTimeout(r, 20)); // cede el event loop
          fs.writeFileSync(file, String(n + 1));
          dentro--;
        },
        FAST
      );

    await Promise.all([incrementar(), incrementar()]);

    assert.equal(fs.readFileSync(file, 'utf8'), '2', 'ambas escrituras deben sobrevivir (cero lost updates)');
    assert.equal(maxDentro, 1, 'nunca puede haber dos titulares dentro de la sección crítica');
    assert.equal(fs.existsSync(file + '.lock'), false, 'el lockfile debe quedar liberado al terminar');
  });

  test('golden-negative: sin lock ese mismo patrón PIERDE una escritura', async () => {
    const file = tmpFile('0');

    const incrementarSinLock = async () => {
      const n = parseInt(fs.readFileSync(file, 'utf8'), 10);
      await new Promise((r) => setTimeout(r, 20));
      fs.writeFileSync(file, String(n + 1));
    };

    await Promise.all([incrementarSinLock(), incrementarSinLock()]);

    assert.equal(
      fs.readFileSync(file, 'utf8'),
      '1',
      'sin exclusión mutua el segundo escritor pisa al primero — el test detecta el bug'
    );
  });
});
