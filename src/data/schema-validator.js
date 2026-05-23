// src/data/schema-validator.js
//
// Pure validator — sin DOM, sin localStorage, sin fetch.
// Importable desde Node (`node --test`) y desde el navegador.
//
// Decisiones aplicadas:
//   - D-08: validator hand-written (~40 líneas) que acumula TODOS los errores
//     en un solo recorrido — nunca lanza mid-walk. Devuelve `{ok, errors}`.
//   - D-06/D-07: campos obligatorios por ejercicio (id, type, categoryIds,
//     payload) + payload shape de multiple-choice (prompt con `___`, options
//     3-4 strings, correctIndex en rango).
//   - D-04: `id` de categoría es slug ASCII (`[a-z0-9][a-z0-9-]*`).
//   - FOUND-04: mensajes de error en español.
//   - Phase 1: solo `type === 'multiple-choice'` se considera válido. Otros
//     tipos llegan en Phase 3 (word-buttons, match).

/** Slug ASCII: minúsculas, dígitos, guiones; primer char no puede ser `-`. */
const ID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Valida el contenido cargado (`categories.json` + cada `exercises/*.json`).
 *
 * Estrategia: acumula errores en un array y los devuelve TODOS al final. El
 * autor edita JSON a mano y necesita ver de un golpe todos los typos, no uno
 * a uno con N reloads.
 *
 * @param {object} input
 * @param {Array<{id: string, name: string, order?: number}>} input.categories
 *   Array de categorías (procedente de `categories.json` → `.categories`).
 * @param {Record<string, Array<object>>} input.exercisesByFile
 *   Map de ruta-de-archivo → array de ejercicios cargados.
 * @returns {{ok: boolean, errors: Array<{file: string, exerciseId?: string, reason: string}>}}
 */
export function validateContent({ categories, exercisesByFile }) {
  const errors = [];
  const push = (file, exerciseId, reason) => errors.push({ file, exerciseId, reason });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. categories.json — shape + slug + name + unicidad
  // ──────────────────────────────────────────────────────────────────────────
  if (!Array.isArray(categories)) {
    push('categories.json', undefined, 'campo "categories" debe ser array');
    return { ok: false, errors };
  }

  const knownCategoryIds = new Set();
  for (const cat of categories) {
    if (typeof cat?.id !== 'string' || !ID_SLUG_RE.test(cat.id)) {
      push('categories.json', cat?.id, `id de categoría inválido: "${cat?.id}" (debe ser slug ASCII en minúsculas)`);
      continue;
    }
    if (knownCategoryIds.has(cat.id)) {
      push('categories.json', cat.id, `id de categoría duplicado: "${cat.id}"`);
    }
    if (typeof cat.name !== 'string' || !cat.name.trim()) {
      push('categories.json', cat.id, `falta campo "name" o está vacío en categoría "${cat.id}"`);
    }
    knownCategoryIds.add(cat.id);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. exercises/*.json — por archivo y por ejercicio
  // ──────────────────────────────────────────────────────────────────────────
  const seenExerciseIds = new Set();

  for (const [file, exercises] of Object.entries(exercisesByFile)) {
    if (!Array.isArray(exercises)) {
      push(file, undefined, 'campo "exercises" debe ser array');
      continue;
    }

    for (const ex of exercises) {
      // id presente y único globalmente
      if (typeof ex?.id !== 'string' || !ex.id.trim()) {
        push(file, ex?.id, 'ejercicio sin "id" o id vacío');
        continue; // sin id no podemos seguir reportando errores de este ejercicio
      }
      if (seenExerciseIds.has(ex.id)) {
        push(file, ex.id, `id de ejercicio duplicado: "${ex.id}"`);
      }
      seenExerciseIds.add(ex.id);

      // type soportado en Phase 1
      if (ex.type !== 'multiple-choice') {
        push(file, ex.id, `type "${ex.type}" no soportado en esta fase (esperado: "multiple-choice")`);
      }

      // categoryIds: array no vacío, referencias conocidas
      if (!Array.isArray(ex.categoryIds) || ex.categoryIds.length === 0) {
        push(file, ex.id, '"categoryIds" debe ser array no vacío');
      } else {
        for (const cid of ex.categoryIds) {
          if (typeof cid !== 'string') {
            push(file, ex.id, `"categoryIds" contiene una entrada no-string: ${JSON.stringify(cid)}`);
            continue;
          }
          if (!knownCategoryIds.has(cid)) {
            push(file, ex.id, `referencia a categoría desconocida: "${cid}"`);
          }
        }
      }

      // payload presente
      if (!ex.payload || typeof ex.payload !== 'object') {
        push(file, ex.id, 'falta "payload" o no es un objeto');
        continue;
      }

      // payload shape para multiple-choice (D-07)
      if (ex.type === 'multiple-choice') {
        const { prompt, options, correctIndex } = ex.payload;

        if (typeof prompt !== 'string' || !prompt.includes('___')) {
          push(file, ex.id, '"payload.prompt" debe ser string y contener el hueco "___"');
        }

        if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
          push(file, ex.id, `"payload.options" debe ser array de 3 o 4 strings (encontrado: ${Array.isArray(options) ? options.length : typeof options})`);
        } else if (options.some(o => typeof o !== 'string' || !o.trim())) {
          push(file, ex.id, '"payload.options" contiene entradas vacías o no-string');
        }

        const optsLen = Array.isArray(options) ? options.length : 0;
        if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= optsLen) {
          push(file, ex.id, `"payload.correctIndex" inválido: ${correctIndex} (debe ser entero en rango [0, ${optsLen}))`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
