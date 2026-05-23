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
//     soportados. `multiple-choice` y `word-buttons` (D-64) son full impls;
//     `match` es un stub temporal con mensaje estable (B3 — wording SIN
//     referencia a plan ID; un plan posterior reemplaza el stub por la
//     impl real). El stub mantiene la promesa "dispatch table cerrada" — los
//     3 tipos del catálogo Phase 3 están listados aquí.

/** Slug ASCII: minúsculas, dígitos, guiones; primer char no puede ser `-`. */
const ID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Dispatch table: tipo de ejercicio → función validadora del payload.
 *
 * Phase 3: cerrada con los 3 tipos del catálogo. `match` es un stub
 * (mensaje estable sin referencia a plan ID — B3) hasta que un plan posterior
 * lo reemplace por la impl real. El stub se mantiene en la tabla en lugar
 * de ser un caso especial fuera, para que el dispatch table sea la ÚNICA
 * fuente de verdad de los tipos soportados Phase 3.
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
}

/**
 * Validador stub del payload de `match` (Phase 3).
 *
 * B3: el mensaje es LITERAL, estable y NO referencia planning artifacts (sin
 * "en este plan", sin sufijo de plan ID). Un plan posterior reemplaza esta
 * función por la impl real cuando active el tipo `match`.
 *
 * El stub vive en `PAYLOAD_VALIDATORS` (no como caso especial) para que la
 * dispatch table sea la única fuente de verdad de los tipos soportados.
 *
 * @param {object} ex
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateMatchPayload(ex, file, push) {
  push(file, ex.id, 'type "match" aún no soportado');
}
