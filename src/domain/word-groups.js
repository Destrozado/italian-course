// src/domain/word-groups.js — quick-260715-hf5
//
// Taxonomía de categorías sintácticas (POS) y agrupación PURA del banco de
// palabras para el "modo decoradores agrupados" de las canciones.
//
// Pure — sin DOM, sin localStorage, sin fetch (estilo D-08). Importable desde
// Node (`node --test`) y desde el navegador (ES module, igual que session.js).
//
// El modo agrupado NO cambia el banco plano (wordButtonsBank) ni el grading:
// `groupTokens` es una VISTA de solo-lectura que reparte las entradas del
// banco (answer ∪ decoys) en grupos etiquetados, preservando cada entrada tal
// cual (índice/placed/tecla). El orden DENTRO de cada grupo se respeta como
// venga (el caller ya baraja el banco plano); solo se ORDENAN los grupos según
// POS_GROUPS.

/**
 * Categorías sintácticas soportadas, en el ORDEN canónico de render.
 * `key` es el valor que usa `decoyBank.pos[token]`; `label` es el rótulo ES.
 * @type {ReadonlyArray<{key: string, label: string}>}
 */
export const POS_GROUPS = Object.freeze([
  { key: 'articulo', label: 'Artículos' },
  { key: 'determinante', label: 'Determinantes' },
  { key: 'pronombre', label: 'Pronombres' },
  { key: 'preposicion', label: 'Preposiciones' },
  { key: 'conjuncion', label: 'Conjunciones' },
  { key: 'verbo', label: 'Verbos' },
  { key: 'sustantivo', label: 'Sustantivos' },
  { key: 'adjetivo', label: 'Adjetivos' },
  { key: 'adverbio', label: 'Adverbios' },
  { key: 'otros', label: 'Otras palabras' },
]);

/** Set de claves POS válidas (incluye el cajón de sastre `otros`). */
export const POS_KEYS = new Set(POS_GROUPS.map((g) => g.key));

const LABEL_BY_KEY = new Map(POS_GROUPS.map((g) => [g.key, g.label]));
const ORDER_BY_KEY = new Map(POS_GROUPS.map((g, i) => [g.key, i]));

/** @param {string} key */
export function isValidPos(key) {
  return POS_KEYS.has(key);
}

/**
 * Extrae el texto-token de una entrada de banco. Acepta:
 *   - string plano
 *   - objeto con `.word` (forma de `bankWithKeys`) o `.token`
 * @param {any} entry
 * @returns {string}
 */
function tokenOf(entry) {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object') {
    if (typeof entry.word === 'string') return entry.word;
    if (typeof entry.token === 'string') return entry.token;
  }
  return '';
}

/**
 * Agrupa las entradas del banco por categoría sintáctica.
 *
 * Defensivo: un token sin POS mapeado (o con POS desconocido) cae en `otros`
 * — nunca se pierde una entrada, así el banco agrupado siempre contiene TODAS
 * las palabras del banco plano (invariante crítico: si una palabra correcta se
 * perdiera, el ejercicio sería irresoluble).
 *
 * @param {Array<any>} entries  Entradas del banco (strings u objetos bankWithKeys).
 * @param {Record<string,string>} posMap  token -> clave POS.
 * @returns {Array<{key: string, label: string, items: Array<any>}>}
 *   Grupos NO vacíos, en orden canónico POS_GROUPS.
 */
export function groupTokens(entries, posMap) {
  const list = Array.isArray(entries) ? entries : [];
  const map = posMap && typeof posMap === 'object' ? posMap : {};

  // Buckets por clave POS, preservando el orden de llegada dentro de cada uno.
  const buckets = new Map();
  for (const entry of list) {
    const token = tokenOf(entry);
    let key = map[token];
    if (typeof key !== 'string' || !POS_KEYS.has(key)) key = 'otros';
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(entry);
  }

  // Emitir en orden canónico, solo grupos con items.
  const out = [];
  for (const { key, label } of POS_GROUPS) {
    const items = buckets.get(key);
    if (items && items.length) out.push({ key, label, items });
  }
  // Salvaguarda: cualquier clave no listada en POS_GROUPS (no debería ocurrir
  // porque normalizamos a `otros`) se emite al final para no perder entradas.
  for (const [key, items] of buckets) {
    if (!ORDER_BY_KEY.has(key) && items.length) {
      out.push({ key, label: LABEL_BY_KEY.get(key) ?? key, items });
    }
  }
  return out;
}
