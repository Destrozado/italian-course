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
//   - Phase 3: dispatch table `PAYLOAD_VALIDATORS` con los 3 tipos
//     soportados (cerrada). Los 3 son full impls:
//       `multiple-choice` (D-07), `word-buttons` (D-64), `match` (D-65).
//     El stub previo de `match` (plan 03-01) ha sido reemplazado por la
//     impl real en este plan; el dispatch table es la ÚNICA fuente de verdad
//     de los tipos soportados.

/** Slug ASCII: minúsculas, dígitos, guiones; primer char no puede ser `-`. */
const ID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Dispatch table: tipo de ejercicio → función validadora del payload.
 *
 * Phase 3: cerrada con los 3 tipos del catálogo, todos en impl real. La
 * tabla es la ÚNICA fuente de verdad de los tipos soportados.
 */
const PAYLOAD_VALIDATORS = {
  'multiple-choice': validateMultipleChoicePayload,
  'word-buttons': validateWordButtonsPayload,
  'match': validateMatchPayload
};

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

      // type soportado: dispatch table lookup (Phase 3 plan 01).
      // Si el type no está en el dispatch, emitimos error con la lista de tipos
      // soportados y NO seguimos con el resto de checks de ESTE ejercicio
      // (el payload check no aplica si el tipo no se reconoce).
      const validator = PAYLOAD_VALIDATORS[ex.type];
      if (!validator) {
        push(file, ex.id, `type "${ex.type}" no soportado (esperado: ${Object.keys(PAYLOAD_VALIDATORS).join(', ')})`);
        continue;
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

      // payload shape — dispatched por tipo. El validador específico empuja
      // errores adicionales y NO retorna early; D-08 invariante (acumular
      // todos los errores en un solo pase).
      validator(ex, file, push);
    }
  }

  return { ok: errors.length === 0, errors };
}

// ─── Payload validators (dispatch table targets) ─────────────────────────────

/**
 * Validador del payload de `multiple-choice` (D-07).
 *
 * Reglas:
 *   - `prompt` string con el hueco `___`.
 *   - `options` array de 3 o 4 strings no vacíos.
 *   - `correctIndex` entero en rango [0, options.length).
 *
 * @param {object} ex
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateMultipleChoicePayload(ex, file, push) {
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

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Si está presente, debe ser string no vacío (rechaza `null`, number, array,
  // object, `""`, `"   "`). Si está ausente, back-compat con los 271 ejercicios
  // pre-Phase-7. Sin enforce de longitud (D-128 es recomendación editorial).
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}

/**
 * Validador del payload de `word-buttons` (D-64).
 *
 * Reglas:
 *   - `prompt` string no vacío.
 *   - `answer` array de ≥1 strings no vacíos.
 *   - `distractors` (opcional) array de strings no vacíos.
 *
 * D-08: acumula errores sin early-return. Cada rama empuja como mucho UN
 * error sobre el mismo campo (no doble-pusheo).
 *
 * @param {object} ex
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateWordButtonsPayload(ex, file, push) {
  const { prompt, answer, distractors } = ex.payload;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, ex.id, '"payload.prompt" debe ser string no vacío');
  }

  if (!Array.isArray(answer) || answer.length === 0) {
    push(file, ex.id, `"payload.answer" debe ser array de al menos 1 token (encontrado: ${Array.isArray(answer) ? answer.length : typeof answer})`);
  } else if (answer.some(t => typeof t !== 'string' || !t.trim())) {
    push(file, ex.id, '"payload.answer" contiene tokens vacíos o no-string');
  }

  if (distractors !== undefined) {
    if (!Array.isArray(distractors)) {
      push(file, ex.id, `"payload.distractors" debe ser array si está presente (encontrado: ${typeof distractors})`);
    } else if (distractors.some(t => typeof t !== 'string' || !t.trim())) {
      push(file, ex.id, '"payload.distractors" contiene tokens vacíos o no-string');
    }
  }

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Misma semántica que en multi-choice — uniforme cross-types (D-113).
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}

/**
 * Validador del payload de `match` (D-65).
 *
 * Reglas:
 *   - `prompt` string no vacío.
 *   - `pairs` array de tuples [izq, der]; longitud entre 2 y 10.
 *   - Cada `pair` es array de exactamente 2 strings no vacíos.
 *
 * D-08: acumula errores sin early-return GLOBAL. SÍ early-return dentro del
 * `forEach` cuando una pair no es array (para evitar `TypeError: p[0]` al
 * traversar `p = null` o `p = string`).
 *
 * @param {object} ex
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateMatchPayload(ex, file, push) {
  const { prompt, pairs } = ex.payload;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, ex.id, '"payload.prompt" debe ser string no vacío');
  }

  if (!Array.isArray(pairs)) {
    push(file, ex.id, `"payload.pairs" debe ser array de tuples [izq, der] (encontrado: ${typeof pairs})`);
    return; // sin array no podemos traversar
  }

  if (pairs.length < 2 || pairs.length > 10) {
    push(file, ex.id, `"payload.pairs" debe tener entre 2 y 10 entradas (encontrado: ${pairs.length})`);
  }

  pairs.forEach((p, idx) => {
    if (!Array.isArray(p) || p.length !== 2) {
      push(file, ex.id, `"payload.pairs[${idx}]" debe ser tuple de exactamente 2 strings`);
      return; // skip esta iteración del forEach — no traversar p[0]/p[1]
    }
    if (typeof p[0] !== 'string' || !p[0].trim()) {
      push(file, ex.id, `"payload.pairs[${idx}][0]" debe ser string no vacío`);
    }
    if (typeof p[1] !== 'string' || !p[1].trim()) {
      push(file, ex.id, `"payload.pairs[${idx}][1]" debe ser string no vacío`);
    }
  });

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Misma semántica que en multi-choice y word-buttons — uniforme cross-types
  // (D-113). En match, la explicación se renderiza tras el grid antes de
  // "Siguiente" porque no existe línea "Respuesta correcta:" en este tipo.
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}
