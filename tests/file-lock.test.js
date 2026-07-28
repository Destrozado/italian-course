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
import { spawnSync } from 'node:child_process';

import { withFileLock, lockPathFor, isProcessAlive } from '../scripts/lib/file-lock.mjs';

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

// Escribe un lockfile "a mano" para simular el estado dejado por otro proceso.
function plantLock(file, info) {
  const lp = lockPathFor(file);
  fs.writeFileSync(lp, JSON.stringify(info));
  return lp;
}

describe('scripts/lib/file-lock', () => {
  // ── (a) adquisición y liberación ──────────────────────────────────────────
  test('adquisición/liberación: propaga el retorno y deja el lockfile limpio', async () => {
    const file = tmpFile('{}');
    const lockPath = lockPathFor(file);
    let contenidoDurante = null;

    const resultado = await withFileLock(
      file,
      () => {
        assert.equal(fs.existsSync(lockPath), true, 'el lockfile debe existir mientras corre fn');
        contenidoDurante = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
        return 'valor-de-fn';
      },
      FAST
    );

    assert.equal(resultado, 'valor-de-fn', 'withFileLock debe propagar el retorno de fn');
    assert.equal(fs.existsSync(lockPath), false, 'el lockfile debe borrarse al resolver');
    assert.equal(contenidoDurante.pid, process.pid, 'el lockfile debe registrar nuestro pid');
    assert.ok(contenidoDurante.hostname, 'el lockfile debe registrar el hostname');
    assert.ok(
      Number.isFinite(Date.parse(contenidoDurante.acquiredAt)),
      'acquiredAt debe ser una fecha parseable'
    );
  });

  test('si fn lanza, el error se propaga y el lock se libera igualmente', async () => {
    const file = tmpFile('{}');
    const lockPath = lockPathFor(file);

    await assert.rejects(
      () => withFileLock(file, () => { throw new Error('boom'); }, FAST),
      /boom/,
      'el error de fn debe propagarse tal cual'
    );
    assert.equal(fs.existsSync(lockPath), false, 'liberación en finally: nada de locks huérfanos tras un fallo');
  });

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

  // ── (c) reclamación de locks obsoletos ────────────────────────────────────
  test('reclama el lock de un PID muerto sin agotar el timeout', async () => {
    const file = tmpFile('{}');
    // El hijo ya salió y fue reaped: su pid no corresponde a ningún proceso vivo.
    const muerto = spawnSync('node', ['-e', '']).pid;
    assert.equal(isProcessAlive(muerto), false, 'el pid del hijo terminado debe leerse como muerto');

    const lockPath = plantLock(file, {
      pid: muerto,
      hostname: os.hostname(),
      acquiredAt: new Date().toISOString(), // reciente: sólo el PID muerto lo hace reclamable
    });

    const ok = await withFileLock(file, () => 'reclamado', { ...FAST, timeoutMs: 400 });
    assert.equal(ok, 'reclamado', 'el lock huérfano debe reclamarse y fn ejecutarse');
    assert.equal(fs.existsSync(lockPath), false, 'tras la corrida no queda lockfile');
  });

  test('reclama un lock demasiado antiguo aunque su PID siga vivo', async () => {
    const file = tmpFile('{}');
    const lockPath = plantLock(file, {
      pid: process.pid, // vivo, pero rancio
      hostname: os.hostname(),
      acquiredAt: new Date(Date.now() - 60000).toISOString(),
    });

    const ok = await withFileLock(file, () => 'reclamado', { ...FAST, staleMs: 50, timeoutMs: 400 });
    assert.equal(ok, 'reclamado', 'un lock más viejo que staleMs debe reclamarse');
    assert.equal(fs.existsSync(lockPath), false, 'tras la corrida no queda lockfile');
  });

  test('NUNCA borra el lock de un proceso vivo y reciente (guarda de seguridad)', async () => {
    const file = tmpFile('{}');
    const info = {
      pid: process.pid, // vivo
      hostname: os.hostname(),
      acquiredAt: new Date().toISOString(), // reciente
    };
    const lockPath = plantLock(file, info);
    let ejecutada = false;

    // (d) el timeout tiene que nombrar el archivo y el PID dueño — nada de fallos mudos.
    await assert.rejects(
      () => withFileLock(file, () => { ejecutada = true; }, { timeoutMs: 150, staleMs: 60000, retryMinMs: 2, retryMaxMs: 15 }),
      (err) => {
        assert.match(err.message, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'el error debe nombrar el archivo bloqueado');
        assert.match(err.message, new RegExp(String(process.pid)), 'el error debe nombrar el PID del dueño');
        return true;
      }
    );

    assert.equal(ejecutada, false, 'fn no debe ejecutarse si no se consiguió el lock');
    assert.equal(fs.existsSync(lockPath), true, 'el lock ajeno vivo debe seguir en disco');
    assert.deepEqual(
      JSON.parse(fs.readFileSync(lockPath, 'utf8')),
      info,
      'el contenido del lock ajeno debe quedar intacto'
    );
    fs.unlinkSync(lockPath);
  });
});
