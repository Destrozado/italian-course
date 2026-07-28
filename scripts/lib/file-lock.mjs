// scripts/lib/file-lock.mjs — quick-260728-8pg
//
// Exclusión mutua ENTRE PROCESOS para el read-modify-write de un archivo JSON.
//
// Los tres scripts de pase (`validate-ai-pass`, `validate-song-pass`,
// `validate-decoy-pass`) leen el archivo entero, insertan un pase y lo reescriben.
// Dos corridas simultáneas sobre frases del MISMO archivo se pisan: el último en
// escribir borra el pase del otro (lost update) o deja el JSON a medias.
// `withFileLock(file, fn)` serializa esa región crítica completa.
//
// Zero-deps: sólo módulos nativos (node:fs, node:os, node:process). No hay
// package.json ni node_modules en este repo y este módulo no los introduce.
//
// Garantías de diseño:
//   T-8PG-01  adquisición atómica: fs.openSync(path, 'wx') crea-o-falla en una
//             sola syscall. Prohibido existsSync + writeFileSync (ventana TOCTOU).
//   T-8PG-02  reclamación segura: antes de borrar un lock obsoleto se RE-LEE y se
//             confirma que el contenido no cambió; `EPERM` de process.kill(pid,0)
//             cuenta como VIVO; release() sólo borra si el pid del lockfile es
//             el propio.
//   T-8PG-03  sin huérfanos: liberación en `finally` + handlers de exit/SIGINT/
//             SIGTERM/uncaughtException + red de seguridad por antigüedad (staleMs).
//   T-8PG-04  sin tormenta de reintentos: backoff exponencial con jitter y
//             timeout duro con error explícito (nunca un fallo mudo).

import fs from 'node:fs';
import os from 'node:os';
import process from 'node:process';

/** Tiempo máximo esperando el lock antes de abortar con error. */
export const DEFAULT_TIMEOUT_MS = 30000;
/** Antigüedad a partir de la cual un lock se considera obsoleto y reclamable. */
export const DEFAULT_STALE_MS = 60000;

const DEFAULT_RETRY_MIN_MS = 25;
const DEFAULT_RETRY_MAX_MS = 500;
const BACKOFF_FACTOR = 1.7;
const JITTER_RATIO = 0.25;

/** Ruta del lockfile que custodia `file`. */
export function lockPathFor(file) {
  return `${file}.lock`;
}

/**
 * ¿Existe todavía el proceso `pid`?
 * `ESRCH` = no existe. `EPERM` = existe pero es de otro usuario → VIVO
 * (nunca reclamamos el lock de un proceso que sigue en pie).
 */
export function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code !== 'ESRCH';
  }
}

// ── registro de locks tomados por ESTE proceso ──────────────────────────────
// Los handlers se instalan de forma perezosa en la primera adquisición y se
// retiran al soltar el último lock: en una corrida normal sin concurrencia sólo
// existen durante los pocos ms de la escritura, así que no alteran el
// comportamiento observable de los scripts.
const HELD = new Set();
let handlersInstalled = false;

function releaseAllSync() {
  for (const lockPath of [...HELD]) releaseSync(lockPath);
}

const onExit = () => releaseAllSync(); // no toca el exit code
const onSigint = () => { releaseAllSync(); process.exit(130); };
const onSigterm = () => { releaseAllSync(); process.exit(143); };
const onUncaught = (err) => {
  releaseAllSync();
  // Replica el comportamiento por defecto de Node (stack en stderr, exit 1).
  console.error(err?.stack ?? String(err));
  process.exit(1);
};

function installHandlers() {
  if (handlersInstalled) return;
  process.on('exit', onExit);
  process.on('SIGINT', onSigint);
  process.on('SIGTERM', onSigterm);
  process.on('uncaughtException', onUncaught);
  handlersInstalled = true;
}

function uninstallHandlers() {
  if (!handlersInstalled || HELD.size > 0) return;
  process.off('exit', onExit);
  process.off('SIGINT', onSigint);
  process.off('SIGTERM', onSigterm);
  process.off('uncaughtException', onUncaught);
  handlersInstalled = false;
}

// ── lectura del lockfile ────────────────────────────────────────────────────
// Devuelve `{ raw, info }`; `raw` es null si el lockfile no existe, e `info` es
// null si no parsea o no lleva un pid utilizable.
function readLock(lockPath) {
  let raw;
  try {
    raw = fs.readFileSync(lockPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return { raw: null, info: null };
    throw err;
  }
  let info = null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && Number.isInteger(parsed.pid)) info = parsed;
  } catch {
    info = null;
  }
  return { raw, info };
}

function isReclaimable(info, staleMs) {
  if (!info) return true; // no existe, no parsea, o le falta pid
  if (!isProcessAlive(info.pid)) return true;
  const ts = Date.parse(info.acquiredAt);
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > staleMs;
}

function describeOwner(info) {
  if (!info) return 'propietario desconocido (lockfile ilegible o ya borrado)';
  return `pid ${info.pid} en ${info.hostname ?? 'host desconocido'} desde ${info.acquiredAt ?? 'fecha desconocida'}`;
}

function timeoutError(file, lockPath, timeoutMs, info) {
  return new Error(
    `No se pudo bloquear '${file}' tras ${timeoutMs}ms: el lockfile '${lockPath}' ` +
      `sigue tomado por ${describeOwner(info)}. ` +
      `Si ese proceso ya no existe, borra el lockfile a mano: rm '${lockPath}'.`
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function jittered(delay) {
  const spread = delay * JITTER_RATIO;
  return Math.max(1, Math.round(delay + (Math.random() * 2 - 1) * spread));
}

async function acquire(file, lockPath, { timeoutMs, staleMs, retryMinMs, retryMaxMs }) {
  const deadline = Date.now() + timeoutMs;
  let delay = retryMinMs;
  let owner = null;

  for (;;) {
    // (1) crear-o-fallar atómico
    try {
      const fd = fs.openSync(lockPath, 'wx');
      try {
        fs.writeSync(
          fd,
          JSON.stringify({
            pid: process.pid,
            hostname: os.hostname(),
            acquiredAt: new Date().toISOString(),
          })
        );
      } finally {
        fs.closeSync(fd);
      }
      HELD.add(lockPath);
      installHandlers();
      return;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }

    // (2) ya existe: ¿es reclamable?
    const first = readLock(lockPath);
    owner = first.info;
    if (isReclaimable(first.info, staleMs)) {
      // Re-leer y confirmar que NADIE lo cambió entretanto (T-8PG-02).
      const second = readLock(lockPath);
      if (second.raw === first.raw) {
        try {
          fs.unlinkSync(lockPath);
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
        }
        if (Date.now() >= deadline) throw timeoutError(file, lockPath, timeoutMs, owner);
        continue; // reintentar la creación inmediatamente
      }
      // cambió: otro proceso ya lo reclamó → esperar, nunca borrar el suyo
    }

    // (3) lock de un proceso vivo y reciente: esperar con backoff + jitter
    if (Date.now() >= deadline) throw timeoutError(file, lockPath, timeoutMs, owner);
    await sleep(jittered(delay));
    delay = Math.min(retryMaxMs, delay * BACKOFF_FACTOR);
  }
}

function releaseSync(lockPath) {
  try {
    const { raw, info } = readLock(lockPath);
    // Sólo borramos lo nuestro: si otro proceso reclamó el lockfile mientras
    // corríamos, borrarlo aquí destruiría SU exclusión mutua.
    if (raw !== null && info && info.pid !== process.pid) return;
    if (raw !== null) fs.unlinkSync(lockPath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  } finally {
    HELD.delete(lockPath);
    uninstallHandlers();
  }
}

/**
 * Ejecuta `fn` con exclusión mutua sobre `file`, usando `<file>.lock` como árbitro.
 *
 * @param {string}   file  archivo a proteger (el lockfile es `<file>.lock`)
 * @param {Function} fn    callback síncrono o async; su valor de retorno se propaga
 * @param {{timeoutMs?:number, staleMs?:number, retryMinMs?:number, retryMaxMs?:number}} opts
 * @returns {Promise<*>} lo que devuelva `fn`
 */
export async function withFileLock(file, fn, opts = {}) {
  const lockPath = lockPathFor(file);
  const settings = {
    timeoutMs: opts.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    staleMs: opts.staleMs ?? DEFAULT_STALE_MS,
    retryMinMs: opts.retryMinMs ?? DEFAULT_RETRY_MIN_MS,
    retryMaxMs: opts.retryMaxMs ?? DEFAULT_RETRY_MAX_MS,
  };

  await acquire(file, lockPath, settings);
  try {
    return await fn();
  } finally {
    releaseSync(lockPath);
  }
}
