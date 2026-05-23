// src/data/storage.js
//
// Wrapper sobre `localStorage` para el estado del progreso. Esta es la ÚNICA
// puerta de contacto del proyecto con `localStorage` — todo el resto del
// código pasa por aquí.
//
// IMPORTANTE: este módulo NO es importable directamente desde
// `tests/domain*.test.js` ejecutados por `node --test`, porque `localStorage`
// no existe en ese runtime. Las funciones puras de migración (`migrate1to2`,
// `hydrateV2`, `blankState`) están exportadas para poder testearse en
// aislamiento sin tocar la API de `localStorage`. El test-helper
// `tests/util/test-helpers.js` ofrece además una copia literal del shape v2
// (`blankStateV2()`) que NO depende de este módulo.
//
// Decisiones aplicadas:
//   - D-19 / BACK-01: clave única `italianCourse.v1`. La constante KEY NO
//     cambia entre Phase 1 y Phase 2 (deliberado, para no perder estado v1).
//   - D-20 / BACK-02: escritura única al final de la sesión (Phase 2 amplía
//     a escritura por respuesta del Test completo via `inFlightTest`).
//   - BACK-03: campo `schemaVersion` en el estado para migraciones en cadena.
//   - D-41: `inFlightTest` vive en el mismo blob que el resto del state, NO
//     en una key separada de localStorage. Atómico vía JSON.stringify.
//   - D-46: migración schemaVersion 1 → 2 transparente: añade
//     `categoryProgress: {}` y `dailyLog: {}`, conserva `exerciseStats`.
//   - D-47: `categoryProgress[id]` se inicializa lazy en `applySessionResult`.
//     `migrate1to2` deja `categoryProgress: {}` sin hidratar retroactivamente
//     (v1 no guardaba racha — no se puede inferir).
//   - Defensivo: localStorage indisponible → blankState; JSON corrupto →
//     backup a `italianCourse.v1.corrupt.<ts>` + blankState; schemaVersion
//     desconocido (futuro) → warn + blankState.

const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 2;

/**
 * Devuelve un estado "en blanco" (sin progreso) — el estado inicial canónico
 * con shape v2 (D-46/D-47).
 *
 * Nota: `inFlightTest` se omite (undefined) deliberadamente; `JSON.stringify`
 * lo elide al persistir y el resto del código trata `state.inFlightTest`
 * como opcional.
 *
 * @returns {{schemaVersion: 2, exerciseStats: object, categoryProgress: object, dailyLog: object}}
 */
export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {}
    // inFlightTest omitido (undefined) — saveState/JSON.stringify lo elide.
  };
}

/**
 * Carga el estado desde localStorage. Si no hay nada, devuelve `blankState()`.
 * Si el contenido está corrupto (JSON inválido o shape inesperada), hace
 * backup defensivo bajo `italianCourse.v1.corrupt.<timestamp>` y arranca
 * limpio.
 *
 * El estado devuelto SIEMPRE está en el shape v2 (la migración 1→2 corre
 * transparente).
 *
 * @returns {{schemaVersion: 2, exerciseStats: object, categoryProgress: object, dailyLog: object, inFlightTest?: object}}
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
 * Persiste el estado en localStorage. Llamado al final de la sesión (Repaso —
 * D-20) o tras cada respuesta (Test completo — D-42). Errores de quota se
 * loguean a consola; un banner UI para quota es polish de Phase 5.
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
 * Enruta el `parsed` por su `schemaVersion` a la migración o hidratación
 * apropiada. Patrón "schemaVersion-based migrate(parsed) en cadena".
 *
 * @param {*} parsed - Resultado de JSON.parse del raw localStorage.
 * @returns {object} Estado normalizado en el shape v2.
 */
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  if (parsed.schemaVersion === 2) return hydrateV2(parsed);
  if (parsed.schemaVersion === 1) return migrate1to2(parsed);

  // Versión desconocida (probablemente futura) → no perdemos datos del autor:
  // logueamos warning y arrancamos limpio.
  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}

/**
 * Migra un estado v1 a v2 (D-46). Conserva `exerciseStats` íntegro; inicializa
 * los campos nuevos (`categoryProgress`, `dailyLog`) vacíos.
 *
 * Nota: NO se intenta "reconstruir" `categoryProgress` retroactivamente. v1
 * no guardaba racha ni `clearedExerciseIds`, así que es imposible inferir si
 * una categoría estaba `hecha` o no. Tras la primera `applySessionResult`
 * de v2, las categorías tocadas pasan por la inicialización lazy (D-47).
 *
 * Exportada para testabilidad — NO se usa fuera de `storage.js` en producción.
 *
 * @param {object} v1 - Estado parseado con `schemaVersion: 1`.
 * @returns {object} Estado normalizado v2.
 */
export function migrate1to2(v1) {
  return {
    schemaVersion: 2,
    exerciseStats: (typeof v1.exerciseStats === 'object' && v1.exerciseStats !== null)
      ? v1.exerciseStats
      : {},
    categoryProgress: {},   // hidrata lazy on first applySessionResult (D-47)
    dailyLog: {}
    // inFlightTest omitido (undefined)
  };
}

/**
 * Hidrata un estado v2 ya en disco con type-guards defensivos en cada
 * sub-objeto. Útil cuando el usuario edita manualmente localStorage o cuando
 * una migración futura se queda a medias.
 *
 * Exportada para testabilidad — NO se usa fuera de `storage.js` en producción.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 2`.
 * @returns {object} Estado v2 con campos garantizados.
 */
export function hydrateV2(parsed) {
  return {
    schemaVersion: 2,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? parsed.exerciseStats
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? parsed.categoryProgress
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? parsed.dailyLog
      : {},
    inFlightTest: parsed.inFlightTest   // permitido undefined u objeto; validación profunda es del consumidor
  };
}
