// src/data/storage.js
//
// Wrapper sobre `localStorage` para el estado del progreso. Esta es la ÚNICA
// puerta de contacto del proyecto con `localStorage` — todo el resto del
// código pasa por aquí.
//
// IMPORTANTE: este módulo NO es importable directamente desde
// `tests/domain.test.js`, porque `localStorage` no existe en el runtime de
// `node --test`. Los tests del dominio cubren funciones puras; las
// integraciones con localStorage se verifican manualmente vía `npx serve`
// (Plan 02).
//
// Decisiones aplicadas:
//   - D-19 / BACK-01: clave única `italianCourse.v1`, shape con
//     `schemaVersion: 1` y `exerciseStats: {}`.
//   - D-20 / BACK-02: escritura única al final de la sesión. Phase 2 puede
//     añadir más writes con `categoryProgress` y `dailyLog`.
//   - BACK-03: campo `schemaVersion` en el estado para futuras migraciones.
//   - Defensivo: localStorage indisponible → blankState; JSON corrupto →
//     backup a `italianCourse.v1.corrupt.<ts>` + blankState.

const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Devuelve un estado "en blanco" (sin progreso) — el estado inicial canónico.
 * @returns {{schemaVersion: 1, exerciseStats: object}}
 */
export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {}
  };
}

/**
 * Carga el estado desde localStorage. Si no hay nada, devuelve `blankState()`.
 * Si el contenido está corrupto (JSON inválido o shape inesperada), hace
 * backup defensivo bajo `italianCourse.v1.corrupt.<timestamp>` y arranca
 * limpio.
 *
 * @returns {{schemaVersion: number, exerciseStats: object}}
 */
export function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch (e) {
    // localStorage deshabilitado (incógnito + algunas configs, file://, etc.)
    console.warn('localStorage no disponible; iniciando estado en blanco', e);
    return blankState();
  }

  if (!raw) return blankState();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.warn('Estado de localStorage corrupto; haciendo backup y arrancando limpio.', e);
    try {
      localStorage.setItem(KEY + '.corrupt.' + Date.now(), raw);
    } catch (_) {
      // Si esto también falla (quota), no hay nada que podamos hacer
    }
    return blankState();
  }

  return migrate(parsed);
}

/**
 * Persiste el estado en localStorage. Llamado UNA SOLA VEZ al final de la
 * sesión (D-20). Errores de quota se loguean a consola; un banner UI para
 * quota es polish de Phase 5.
 *
 * @param {object} state - Estado a persistir.
 */
export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error al escribir estado en localStorage (¿quota?)', e);
  }
}

/**
 * Migración defensiva del estado parseado. En Phase 1 solo existe
 * `schemaVersion: 1`; Phase 2+ añadirá ramas para versiones nuevas.
 *
 * @param {*} parsed - Resultado de JSON.parse del raw localStorage.
 * @returns {{schemaVersion: number, exerciseStats: object}}
 */
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();

  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
    // Defensivo: garantizamos que exerciseStats es un objeto plano.
    if (typeof parsed.exerciseStats !== 'object' || parsed.exerciseStats === null) {
      parsed.exerciseStats = {};
    }
    return parsed;
  }

  // Versión desconocida (probablemente futura) → no perdemos datos del autor:
  // logueamos warning y arrancamos limpio. Phase 1 solo conoce v1.
  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}
