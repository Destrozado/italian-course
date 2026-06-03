// src/data/backup.js
//
// Pure backup parser/builder — modulo puro sin DOM ni capa de storage.
// Importable desde Node (`node --test`) y desde el navegador.
//
// Decisiones aplicadas:
//   - D-02 (layer purity): este módulo NO toca la capa de persistencia ni
//     el DOM. Recibe string raw, devuelve objeto. La persistencia es
//     responsabilidad de `src/data/storage.js` (la ÚNICA puerta a la API
//     de almacenamiento del navegador).
//   - D-73: wrapper de export con kind/exportedAt/schemaVersion/state.
//   - D-74: validación estricta + migración automática vía la cadena
//     existente (migrate1to2 → migrate2to3 → migrate3to4 → hydrateV4).
//   - FOUND-04: mensajes de error en español (literales de
//     `04-UI-SPEC.md` "Message area copy").
//
// Patrón discriminado del retorno (espejo de `validateContent` en
// `schema-validator.js` que retorna `{ok, errors}`):
//   - `{ok: true, state, summary}` cuando todo va bien (state ya migrado a v7).
//   - `{ok: false, reason}` con un mensaje único en español si algo falla.
//
// El backup tiene UNA sola razón de fallo a la vez (no acumula como
// schema-validator) — la primera guard que dispara aborta el parse y
// devuelve el reason específico.

import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7, migrate7to8, hydrateV8 } from './storage.js';

/** Espejo de la constante en storage.js — mantener inline para que el
 *  módulo sea testeable independiente sin importar storage.CURRENT_SCHEMA_VERSION.
 *  Phase 6 (D-111): bump nominal 3 → 4. Phase 13: bump 4 → 5 — añade el
 *  sub-árbol `songProgress` (estado por canción). Phase 15 (D-15-09): bump
 *  NOMINAL 5 → 6 — el modelo slot+variantes del milestone v1.4 vive en
 *  `content/` (validator + loader), NO en el state; el set de sub-dicts no
 *  cambia. Phase 17 (D-17-08): bump 6 → 7 — `migrate6to7` resetea SOLO el
 *  progreso de Preposiciones (reagrupada a slots+variantes en el piloto); el
 *  set de sub-dicts sigue sin cambiar. Phase 18 (D-18 / MIG-02): bump 7 → 8 —
 *  `migrate7to8` resetea el progreso de DOS categorías (articoli + partitivos),
 *  reagrupadas a slots en las Phases 19/20; el set de sub-dicts sigue sin
 *  cambiar. El backup debe migrar hasta v8 para que un export del estado actual
 *  se reimporte sin "versión más nueva"; un import de un backup v7 migra a v8
 *  reseteando articoli+partitivos (coherente con el reset, D-06). */
const CURRENT_SCHEMA_VERSION = 8;

/**
 * Parse + valida + migra un string JSON proveniente de un archivo backup.
 *
 * Pipeline:
 *   1. `JSON.parse` con try/catch (Pitfall #3 RESEARCH).
 *   2. Type guards: wrapper objeto, `kind === 'italian-course-backup'`,
 *      `state` objeto, `state.schemaVersion` número.
 *   3. Coherencia: `wrapper.schemaVersion === state.schemaVersion`
 *      (Pitfall #6 RESEARCH — defensa contra wrapper editado a mano).
 *   4. Compatibilidad: `state.schemaVersion <= CURRENT_SCHEMA_VERSION`.
 *      Rechaza versiones futuras (D-74).
 *   5. Cadena de migración: migrate1to2 → … → migrate6to7 → migrate7to8 →
 *      hydrateV8. Sale siempre como v8 normalizada (hydrateV8 neutraliza
 *      prototype pollution per T-04-02 / T-18-01).
 *   6. Summary derivado del state migrado: número de categorías con
 *      progreso, número de ejercicios con stats, fecha de export para
 *      el confirm inline (D-76).
 *
 * @param {string} rawStr - Contenido raw del archivo `.json` importado.
 * @returns {{ok: true, state: object, summary: {exportedAt: string, categories: number, exercises: number}}
 *         | {ok: false, reason: string}}
 */
export function parseBackupFile(rawStr) {
  // 1. JSON parse defensivo (Pitfall #3).
  let wrapper;
  try {
    wrapper = JSON.parse(rawStr);
  } catch (err) {
    return { ok: false, reason: `JSON inválido: ${err.message}` };
  }

  // 2. Guards de shape.
  if (!wrapper || typeof wrapper !== 'object') {
    return { ok: false, reason: 'El archivo no contiene un objeto JSON.' };
  }
  if (wrapper.kind !== 'italian-course-backup') {
    return { ok: false, reason: 'Este archivo no es un backup de Italian Course (falta o difiere el campo "kind").' };
  }
  const state = wrapper.state;
  if (!state || typeof state !== 'object') {
    return { ok: false, reason: 'El archivo no contiene el campo "state" o no es un objeto.' };
  }
  if (typeof state.schemaVersion !== 'number') {
    return { ok: false, reason: 'El campo "state.schemaVersion" falta o no es número.' };
  }

  // ME-02 fix: lower-bound + integer guard. Sin esto, schemaVersion=0,
  // -1, NaN o 1.5 pasarían silenciosamente por el dispatcher de migración
  // (que no matchea ninguna rama) y hydrateV3 normalizaría a v3 con
  // defaults — equivalente a aceptar un backup malformado sin error.
  // Rechazamos explícitamente: el rango soportado es [1..CURRENT].
  if (!Number.isInteger(state.schemaVersion) || state.schemaVersion < 1) {
    return {
      ok: false,
      reason: `schemaVersion inválido (esperado entero ≥1; recibido ${state.schemaVersion}).`
    };
  }

  // 3. Coherencia wrapper ↔ state (Pitfall #6 — defensa contra edición
  //    manual del archivo).
  if (wrapper.schemaVersion !== state.schemaVersion) {
    return {
      ok: false,
      reason: `Versión inconsistente en el archivo (wrapper.schemaVersion=${wrapper.schemaVersion}, state.schemaVersion=${state.schemaVersion}).`
    };
  }

  // 4. Forward-compat: rechaza versiones futuras (D-74).
  if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `Este backup viene de una versión más nueva de la app (schemaVersion=${state.schemaVersion}; esta app soporta hasta ${CURRENT_SCHEMA_VERSION}).`
    };
  }

  // 5. Cadena de migración — idéntica al pipeline de loadState().
  let migrated = state;
  if (migrated.schemaVersion === 1) migrated = migrate1to2(migrated);
  if (migrated.schemaVersion === 2) migrated = migrate2to3(migrated);
  if (migrated.schemaVersion === 3) migrated = migrate3to4(migrated);
  if (migrated.schemaVersion === 4) migrated = migrate4to5(migrated);
  if (migrated.schemaVersion === 5) migrated = migrate5to6(migrated);
  if (migrated.schemaVersion === 6) migrated = migrate6to7(migrated);
  if (migrated.schemaVersion === 7) migrated = migrate7to8(migrated);
  migrated = hydrateV8(migrated);

  // 6. Summary para el confirm inline (D-76).
  const summary = {
    exportedAt: typeof wrapper.exportedAt === 'string' ? wrapper.exportedAt : 'desconocido',
    categories: Object.keys(migrated.categoryProgress ?? {}).length,
    exercises: Object.keys(migrated.exerciseStats ?? {}).length
  };

  return { ok: true, state: migrated, summary };
}

/**
 * Construye el wrapper de export (D-73). La screen layer hace
 * `JSON.stringify(wrapper)` + Blob + URL.createObjectURL + a.click() +
 * revokeObjectURL — `backup.js` queda puro.
 *
 * `exportedAt` por defecto es `new Date().toISOString()`; inyectable para
 * tests deterministas.
 *
 * @param {object} state - state actual de la app (debe tener schemaVersion).
 * @param {string} [exportedAt] - ISO 8601 UTC. Default: ahora.
 * @returns {{kind: string, exportedAt: string, schemaVersion: number, state: object}}
 */
export function buildBackupWrapper(state, exportedAt = new Date().toISOString()) {
  return {
    kind: 'italian-course-backup',
    exportedAt,
    schemaVersion: state.schemaVersion,
    state
  };
}
