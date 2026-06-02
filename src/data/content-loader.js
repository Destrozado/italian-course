// src/data/content-loader.js
//
// Carga `content/categories.json` + cada `content/exercises/<id>.json` desde
// el servidor estático (`npx serve`), normaliza todas las strings a NFC, y
// valida el bundle con el schema-validator.
//
// IMPORTANTE: este módulo NO es importable directamente desde
// `tests/domain.test.js`, porque `fetch` no se puede mockear de forma trivial
// en el runtime de `node --test` sin dependencias. La validación de Pattern 2
// (schema-validator) es la que sí está testada en domain.test.js.
//
// Decisiones aplicadas:
//   - D-09 / CONT-06: NFC normalize ANTES de validar. Las strings que entran
//     al validador (y luego al UI) son siempre NFC.
//   - D-10: si la validación falla, lanzamos Error con `.errors = errors[]` —
//     `main.js` captura, esconde el app placeholder y renderiza el banner.
//   - Mensajes en español (FOUND-04).

import { validateContent, validateSongs } from './schema-validator.js';

/**
 * Carga + valida el contenido. Llamado UNA VEZ en bootstrap.
 *
 * @param {string[]} categoryRegistry - IDs de categorías a cargar (Phase 1: ['avere']).
 * @returns {Promise<{categories: Array, exerciseById: Record<string, object>}>}
 * @throws {Error & {errors: Array<{file:string, exerciseId?:string, reason:string}>}}
 *   Si la validación falla, el Error lleva `.errors` con TODOS los problemas.
 */
export async function loadContent(categoryRegistry) {
  // 1. Cargar categories.json
  const categoriesRaw = await fetchJson('content/categories.json');

  // 2. Cargar cada archivo de ejercicios
  /** @type {Record<string, Array<object>>} */
  const exercisesByFile = {};
  for (const cid of categoryRegistry) {
    const path = `content/exercises/${cid}.json`;
    const raw = await fetchJson(path);
    exercisesByFile[path] = Array.isArray(raw?.exercises) ? raw.exercises : [];
  }

  // 3. NFC normalize EN EL BORDE (D-09): después de JSON.parse, antes de validar.
  //    El validador y el resto del código asumen NFC.
  normalizeNfcInPlace(categoriesRaw);
  for (const arr of Object.values(exercisesByFile)) {
    normalizeNfcInPlace(arr);
  }

  // 4. Validar (D-08)
  const { ok, errors } = validateContent({
    categories: categoriesRaw?.categories ?? [],
    exercisesByFile
  });
  if (!ok) {
    const err = new Error('Validación del contenido fallida');
    /** @type {any} */ (err).errors = errors;
    throw err;
  }

  // 5. Construir índice por id para el consumidor (Plan 02)
  /** @type {Record<string, object>} */
  const exerciseById = {};
  for (const arr of Object.values(exercisesByFile)) {
    for (const ex of arr) exerciseById[ex.id] = ex;
  }

  return {
    categories: categoriesRaw.categories,
    exerciseById
  };
}

/**
 * Carga + valida las canciones (Phase 13, DATA-01/DATA-02, LINK-04).
 *
 * Path de carga SEPARADO de `loadContent` (standalone, LINK-04): las canciones
 * NUNCA se mezclan en `exerciseById` ni entran en `buildSession`/`buildFullTest`.
 * Devuelve un mapa `songsById` HERMANO (id de canción → documento) más el
 * índice ligero `songs[]` para el listado.
 *
 * Secuencia espejo de `loadContent`: fetch del índice `songs.json`, fetch de
 * cada `content/songs/<id>.json`, NFC normalize EN EL BORDE (D-09) ANTES de
 * validar, y `validateSongs` con las categorías conocidas. Si la validación
 * falla, lanza Error con `.errors` (DATA-02) — fluye al mismo banner que el
 * contenido de ejercicios.
 *
 * @param {string[]} songIds - IDs de canciones a cargar. Si se omite, se
 *   derivan del índice `content/songs.json`.
 * @param {Iterable<string>} knownCategoryIds - IDs de categoría válidos
 *   (para validar el enganche `categoryIds[]` de cada frase).
 * @returns {Promise<{songs: Array<{id:string,title:string,phraseCount?:number}>, songsById: Record<string, object>}>}
 * @throws {Error & {errors: Array<{file:string, exerciseId?:string, reason:string}>}}
 */
export async function loadSongs(songIds, knownCategoryIds) {
  // 1. Cargar el índice ligero (songs.json)
  const indexRaw = await fetchJson('content/songs.json');
  const index = Array.isArray(indexRaw?.songs) ? indexRaw.songs : [];

  // 2. Derivar el set de ids a cargar (param explícito o índice)
  const ids = Array.isArray(songIds) && songIds.length > 0
    ? songIds
    : index.map(s => s?.id).filter(id => typeof id === 'string');

  // 3. Cargar cada documento de canción
  /** @type {Array<object>} */
  const songDocs = [];
  for (const sid of ids) {
    const raw = await fetchJson(`content/songs/${sid}.json`);
    songDocs.push(raw);
  }

  // 4. NFC normalize EN EL BORDE (D-09) — antes de validar. `wordButtons.grade()`
  //    asume NFC y NO renormaliza, igual que con los ejercicios.
  for (const doc of songDocs) {
    normalizeNfcInPlace(doc);
  }

  // 5. Validar (D-08 / DATA-02)
  const known = knownCategoryIds instanceof Set ? knownCategoryIds : new Set(knownCategoryIds ?? []);
  const { ok, errors } = validateSongs({ songs: songDocs, knownCategoryIds: known });
  if (!ok) {
    const err = new Error('Validación de canciones fallida');
    /** @type {any} */ (err).errors = errors;
    throw err;
  }

  // 6. Construir el mapa songsById HERMANO (LINK-04 — NUNCA en exerciseById)
  /** @type {Record<string, object>} */
  const songsById = {};
  for (const doc of songDocs) songsById[doc.id] = doc;

  return { songs: index, songsById };
}

/**
 * Fetch + parse JSON con manejo explícito de error (mensajes en español).
 *
 * @param {string} path
 * @returns {Promise<any>}
 */
async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`No se pudo cargar ${path}: HTTP ${res.status}`);
  }
  return await res.json();
}

/**
 * Normaliza recursivamente todas las strings de un nodo a NFC, in-place.
 *
 * Recorre arrays por índice y objetos por `Object.keys`, sustituyendo cada
 * string por `s.normalize('NFC')`. No exportado — es interno al loader.
 *
 * @param {any} node
 */
function normalizeNfcInPlace(node) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const v = node[i];
      if (typeof v === 'string') node[i] = v.normalize('NFC');
      else if (v && typeof v === 'object') normalizeNfcInPlace(v);
    }
  } else if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const v = node[key];
      if (typeof v === 'string') node[key] = v.normalize('NFC');
      else if (v && typeof v === 'object') normalizeNfcInPlace(v);
    }
  }
}
