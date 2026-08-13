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
 * Phase 15 (SLOT-04): dispatch table tipo → validador de SUPERFICIE plana.
 *
 * Espejo de `PAYLOAD_VALIDATORS`, pero los targets validan un objeto plano
 * (`{prompt, options, ...}` sin el wrapper `.payload`) con prefijo de mensajes
 * configurable. Se usa para validar cada entrada de `variants[]` de un slot —
 * una variante es una superficie aplanada, idéntico premise que una frase de
 * canción (ver `validateSongPhrasePayload`).
 */
const SURFACE_VALIDATORS = {
  'multiple-choice': validateMultipleChoiceSurface,
  'word-buttons': validateWordButtonsSurface,
  'match': validateMatchSurface
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
    // PROV-01: campo OPCIONAL `origen` — enum whitelist. Ausencia = aceptada
    // (retrocompat: las 10 cats legacy no lo tienen). Idiom clonado de
    // validateValidationShape (VALID_STATUS): enum vía .includes(), mensaje ES.
    if (cat.origen !== undefined) {
      const VALID_ORIGEN = ['ia-quorum', 'apuntes-profesora'];
      if (!VALID_ORIGEN.includes(cat.origen)) {
        push('categories.json', cat.id, `"origen" inválido: ${JSON.stringify(cat.origen)} (esperado: ia-quorum|apuntes-profesora)`);
      }
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

      // Phase 15 (SLOT-04, D-15-02/04/06): regla `payload` XOR `variants[]`.
      // Un ejercicio-slot describe O un payload legacy (slot de 1 variante,
      // back-compat de los 8 archivos) O un array `variants[]` con la
      // explanation a nivel de slot. Nunca ambos, nunca ninguno. D-08: se
      // acumulan todos los errores, jamás se lanza mid-walk.
      const hasVariants = Array.isArray(ex.variants);
      const hasPayload = ex.payload && typeof ex.payload === 'object';

      if (hasPayload && hasVariants) {
        // (a) ambos presentes → ambiguo, se rechaza.
        push(file, ex.id, 'un ejercicio no puede tener "payload" y "variants" a la vez');
        continue;
      }
      if (!hasPayload && !hasVariants) {
        // (b) ninguno → falta la superficie jugable.
        push(file, ex.id, 'falta "payload" o "variants" (un ejercicio-slot necesita uno de los dos)');
        continue;
      }

      if (hasPayload) {
        // (c) ruta legacy — sin cambios respecto a fases anteriores. El
        // validador de payload empuja errores adicionales y NO retorna early.
        validator(ex, file, push);
      } else {
        // (d) ruta nueva slot+variants (SLOT-01/02/03).
        validateVariants(ex, file, push);
      }

      // Phase 9 (D-VAL-08, VAL-01): campo opcional top-level `validation`.
      // NO entra en PAYLOAD_VALIDATORS (no es payload — es metadata del
      // ejercicio como unidad). Backward-compat trivial: ausencia = aceptado.
      validateValidationShape(ex, file, push);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Phase 15 (SLOT-01/02/03/04): valida la rama `variants[]` de un ejercicio-slot.
 *
 * Premisas (D-15-02):
 *   - `explanation` vive a NIVEL de slot (top-level del ejercicio) y es
 *     OBLIGATORIA cuando hay `variants[]` — la regla es compartida por todas
 *     las variantes (SLOT-02). Cada variante NO lleva explanation propia.
 *   - cada entrada de `variants[]` es un objeto PLANO con SOLO la superficie del
 *     payload según el `type` del slot (`type` vive a nivel de slot, D-15-05).
 *
 * Reglas (rechazos):
 *   - `variants[]` vacío `[]`.
 *   - falta `explanation` a nivel de slot (no string no vacío).
 *   - una variante con superficie inválida para el `type` del slot — el mensaje
 *     ubica la variante por índice (`variants[k]...`).
 *
 * D-08: acumula TODOS los errores en un solo recorrido, nunca lanza mid-walk.
 * El llamador ya garantizó `Array.isArray(ex.variants)`; aun así, este helper es
 * defensivo y no traversa si la longitud es 0.
 *
 * @param {object} ex - el ejercicio-slot (con `ex.variants` array).
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateVariants(ex, file, push) {
  // SLOT-02: explanation obligatoria a nivel de slot cuando hay variantes.
  if (typeof ex.explanation !== 'string' || !ex.explanation.trim()) {
    push(file, ex.id, 'los slots con "variants" requieren "explanation" a nivel de slot (string no vacío)');
  }

  if (ex.variants.length === 0) {
    push(file, ex.id, '"variants" no puede estar vacío');
    return; // sin variantes no hay superficies que validar
  }

  // El `type` ya fue verificado soportado por el llamador (dispatch lookup).
  const surfaceValidator = SURFACE_VALIDATORS[ex.type];

  ex.variants.forEach((variant, k) => {
    if (!variant || typeof variant !== 'object' || Array.isArray(variant)) {
      push(file, ex.id, `"variants[${k}]" debe ser un objeto con la superficie del tipo "${ex.type}"`);
      return; // skip esta variante — no traversar campos de un valor malformado
    }
    surfaceValidator(variant, ex.id, file, push, `variants[${k}]`);
  });
}

/**
 * Valida una colección de documentos de canción (Phase 13, DATA-01/DATA-02).
 *
 * Export SEPARADO de `validateContent` y de `PAYLOAD_VALIDATORS` (patrón (a)
 * del PATTERNS.md surface 3): las canciones NO entran en el pool de ejercicios
 * (LINK-04), así que tienen su propio path de validación y de carga.
 *
 * Estrategia idéntica a `validateContent`: acumula TODOS los errores en un solo
 * recorrido (D-08), nunca lanza mid-walk, devuelve `{ok, errors}`, mensajes en
 * español (FOUND-04).
 *
 * Shape de un documento de canción:
 *   {
 *     id: slug,
 *     title: string no vacío,
 *     phrases: [
 *       { id: string, prompt: string (línea italiana), answer: string[] (tokens es),
 *         distractors?: string[], categoryIds?: string[] }
 *     ]
 *   }
 *
 * DIVERGENCIA CLAVE vs ejercicios (LINK-03): `categoryIds` de una frase es
 * OPCIONAL y puede ser `[]`. NO se copia el check "categoryIds no vacío" de
 * `validateContent` (línea 110). Si está presente, cada entrada debe ser string
 * que referencia una categoría conocida; ausente/vacío es VÁLIDO.
 *
 * @param {object} input
 * @param {Array<object>} input.songs - Documentos de canción (uno por archivo).
 * @param {Set<string>} input.knownCategoryIds - Ids de categoría válidos.
 * @returns {{ok: boolean, errors: Array<{file: string, exerciseId?: string, reason: string}>}}
 */
export function validateSongs({ songs, knownCategoryIds }) {
  const errors = [];
  const push = (file, id, reason) => errors.push({ file, exerciseId: id, reason });
  const known = knownCategoryIds instanceof Set
    ? knownCategoryIds
    : new Set(Array.isArray(knownCategoryIds) ? knownCategoryIds : []);

  if (!Array.isArray(songs)) {
    push('songs.json', undefined, 'campo "songs" debe ser array');
    return { ok: false, errors };
  }

  const seenSongIds = new Set();

  for (const song of songs) {
    // id de canción: slug ASCII, único entre archivos
    const songId = song?.id;
    const file = typeof songId === 'string' ? `content/songs/${songId}.json` : 'content/songs/?.json';

    if (typeof songId !== 'string' || !ID_SLUG_RE.test(songId)) {
      push(file, songId, `id de canción inválido: "${songId}" (debe ser slug ASCII en minúsculas)`);
      // sin id válido no podemos seguir reportando con contexto, pero igual
      // intentamos validar el resto del documento si phrases es array.
    } else {
      if (seenSongIds.has(songId)) {
        push(file, songId, `id de canción duplicado: "${songId}"`);
      }
      seenSongIds.add(songId);
    }

    if (typeof song?.title !== 'string' || !song.title.trim()) {
      push(file, songId, 'falta campo "title" o está vacío');
    }

    if (!Array.isArray(song?.phrases)) {
      push(file, songId, '"phrases" debe ser array');
      continue; // sin array no podemos traversar las frases
    }

    if (song.phrases.length === 0) {
      // WR-01: una canción con 0 frases es un callejón sin salida — la pantalla
      // 'cancion' nunca monta (songCurrentPhrase es null), completeSong no corre
      // y songProgress jamás se escribe. Rechazar en validación (banner DATA-02).
      push(file, songId, '"phrases" debe contener al menos 1 frase');
      continue; // sin frases no hay nada que traversar
    }

    const seenPhraseIds = new Set();
    for (const phrase of song.phrases) {
      // id de frase presente y único dentro de la canción
      if (typeof phrase?.id !== 'string' || !phrase.id.trim()) {
        push(file, phrase?.id, 'frase sin "id" o id vacío');
        continue; // sin id no podemos seguir reportando errores de esta frase
      }
      if (seenPhraseIds.has(phrase.id)) {
        push(file, phrase.id, `id de frase duplicado: "${phrase.id}"`);
      }
      seenPhraseIds.add(phrase.id);

      // payload de la frase (prompt / answer / distractors)
      validateSongPhrasePayload(phrase, file, push);

      // validation OPCIONAL por frase (espejo de ejercicios). validateValidationShape
      // lee solo .id/.validation y es back-compat: ausencia = OK.
      validateValidationShape(phrase, file, push);

      // categoryIds: OPCIONAL (LINK-03). Ausente o [] es válido. Si está
      // presente, cada entrada debe ser string que referencia categoría
      // conocida — NO se exige que sea no vacío (divergencia vs ejercicios).
      if (phrase.categoryIds !== undefined) {
        if (!Array.isArray(phrase.categoryIds)) {
          push(file, phrase.id, '"categoryIds" debe ser array si está presente');
        } else {
          for (const cid of phrase.categoryIds) {
            if (typeof cid !== 'string') {
              push(file, phrase.id, `"categoryIds" contiene una entrada no-string: ${JSON.stringify(cid)}`);
              continue;
            }
            if (!known.has(cid)) {
              push(file, phrase.id, `referencia a categoría desconocida: "${cid}"`);
            }
          }
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Validador del payload de una frase de canción (Phase 13).
 *
 * Adaptado de `validateWordButtonsPayload` — el payload está APLANADO sobre la
 * frase (prompt/answer/distractors directos, no bajo `.payload`), porque una
 * frase de canción no lleva campo `type` (siempre es word-buttons inverso).
 *
 * Reglas:
 *   - `prompt` (línea italiana) string no vacío.
 *   - `answer` (tokens españoles) array de ≥1 strings no vacíos.
 *   - `distractors` (opcional) array de strings no vacíos.
 *
 * D-08: acumula errores sin early-return.
 *
 * @param {object} phrase
 * @param {string} file
 * @param {(file:string, id:string, reason:string) => void} push
 */
function validateSongPhrasePayload(phrase, file, push) {
  const { prompt, answer, distractors } = phrase;

  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, phrase.id, '"prompt" debe ser string no vacío');
  }

  if (!Array.isArray(answer) || answer.length === 0) {
    push(file, phrase.id, `"answer" debe ser array de al menos 1 token (encontrado: ${Array.isArray(answer) ? answer.length : typeof answer})`);
  } else if (answer.some(t => typeof t !== 'string' || !t.trim())) {
    push(file, phrase.id, '"answer" contiene tokens vacíos o no-string');
  }

  if (distractors !== undefined) {
    if (!Array.isArray(distractors)) {
      push(file, phrase.id, `"distractors" debe ser array si está presente (encontrado: ${typeof distractors})`);
    } else if (distractors.some(t => typeof t !== 'string' || !t.trim())) {
      push(file, phrase.id, '"distractors" contiene tokens vacíos o no-string');
    }
  }
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
  // Phase 15 (SLOT-04): la lógica de superficie vive en el helper plano; este
  // wrapper la aplica al `payload` legacy (prefijo de mensajes "payload").
  validateMultipleChoiceSurface(ex.payload, ex.id, file, push, 'payload');

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Si está presente, debe ser string no vacío (rechaza `null`, number, array,
  // object, `""`, `"   "`). Si está ausente, back-compat con los 271 ejercicios
  // pre-Phase-7. Sin enforce de longitud (D-128 es recomendación editorial).
  // Solo aplica al payload legacy — los slots con variantes llevan la
  // explanation a nivel de slot (validada en `validateContent`, SLOT-02).
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}

/**
 * Phase 15 (SLOT-04): valida la SUPERFICIE de `multiple-choice` sobre un objeto
 * plano (un `payload` legacy o una variante de slot), con prefijo de mensajes
 * configurable. Adaptado de la lógica original de `validateMultipleChoicePayload`
 * — mismo premise que `validateSongPhrasePayload` (payload APLANADO).
 *
 * @param {object} surface - `{prompt, options, correctIndex}`.
 * @param {string} exId
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 * @param {string} label - prefijo de campo: `"payload"` (legacy) o `"variants[k]"`.
 */
function validateMultipleChoiceSurface(surface, exId, file, push, label) {
  const { prompt, options, correctIndex } = surface;

  if (typeof prompt !== 'string' || !prompt.includes('___')) {
    push(file, exId, `"${label}.prompt" debe ser string y contener el hueco "___"`);
  }

  if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
    push(file, exId, `"${label}.options" debe ser array de 3 o 4 strings (encontrado: ${Array.isArray(options) ? options.length : typeof options})`);
  } else if (options.some(o => typeof o !== 'string' || !o.trim())) {
    push(file, exId, `"${label}.options" contiene entradas vacías o no-string`);
  }

  const optsLen = Array.isArray(options) ? options.length : 0;
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= optsLen) {
    push(file, exId, `"${label}.correctIndex" inválido: ${correctIndex} (debe ser entero en rango [0, ${optsLen}))`);
  }

  // Phase 46 plan 01 (SCH-01, D-46-02/D-46-03): campo OPCIONAL `translationES`
  // — la traducción española de la frase YA RESUELTA, por VARIANTE. Molde del
  // campo opcional retrocompatible clonado de `payload.explanation` (:419):
  // guard `!== undefined` (ausencia = aceptada, las 250 slots del corpus siguen
  // verdes), `typeof !== 'string' || !trim()` (rechaza null, number, array,
  // `""`, `"   "`) y `push()` SIN early-return (D-08 acumula todos los errores).
  //
  // Guard estructural extra (D-46-03): el texto no puede contener el hueco
  // `___`. La traducción es de la frase ya resuelta, así que un hueco dentro
  // solo puede significar que se copió el `prompt` sin rellenar — error
  // mecánico baratísimo aquí y carísimo de cazar a ojo en 722 frases.
  //
  // Lo que este guard deliberadamente NO hace (D-46-03): no normaliza (NFC y
  // NFD pasan igual), no recorta el dato, no exige unicidad entre variantes
  // hermanas y no exige un mínimo de palabras. Toda la calidad —acentos RAE
  // incluidos— la juzga el QUÓRUM, autoridad única sobre calidad.
  if (surface.translationES !== undefined) {
    const text = surface.translationES?.text;
    if (typeof text !== 'string' || !text.trim()) {
      push(file, exId, `"${label}.translationES.text" debe ser string no vacío si translationES está presente`);
    } else if (text.includes('___')) {
      push(file, exId, `"${label}.translationES.text" no puede contener "___" — la traducción es de la frase YA RESUELTA`);
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
  // Phase 15 (SLOT-04): superficie en el helper plano; wrapper sobre el payload.
  validateWordButtonsSurface(ex.payload, ex.id, file, push, 'payload');

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Misma semántica que en multi-choice — uniforme cross-types (D-113). Solo
  // aplica al payload legacy (slots con variantes → explanation a nivel slot).
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}

/**
 * Phase 15 (SLOT-04): valida la SUPERFICIE de `word-buttons` sobre un objeto
 * plano (payload legacy o variante de slot). Espejo de `validateSongPhrasePayload`
 * (también una superficie word-buttons aplanada).
 *
 * @param {object} surface - `{prompt, answer, distractors?}`.
 * @param {string} exId
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 * @param {string} label - prefijo de campo: `"payload"` o `"variants[k]"`.
 */
function validateWordButtonsSurface(surface, exId, file, push, label) {
  const { prompt, answer, distractors } = surface;

  // Phase 46 plan 01 (SCH-02, D-46-04): `translationES` NO tiene sitio aquí. Un
  // ejercicio de armar-la-frase ya SE resuelve produciendo la frase, así que una
  // traducción española post-respuesta no añade nada que la propia mecánica no
  // enseñe. El rechazo es por PRESENCIA de la clave y NUNCA por su contenido: no
  // se inspecciona `text`, así que ninguna forma de acento, escape o codificación
  // puede esquivarlo. Sin early-return (D-08): conviven con los demás errores.
  if (surface.translationES !== undefined) {
    push(file, exId, `"${label}.translationES" no está permitido en variantes de tipo "match" / "word-buttons"`);
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, exId, `"${label}.prompt" debe ser string no vacío`);
  }

  if (!Array.isArray(answer) || answer.length === 0) {
    push(file, exId, `"${label}.answer" debe ser array de al menos 1 token (encontrado: ${Array.isArray(answer) ? answer.length : typeof answer})`);
  } else if (answer.some(t => typeof t !== 'string' || !t.trim())) {
    push(file, exId, `"${label}.answer" contiene tokens vacíos o no-string`);
  }

  if (distractors !== undefined) {
    if (!Array.isArray(distractors)) {
      push(file, exId, `"${label}.distractors" debe ser array si está presente (encontrado: ${typeof distractors})`);
    } else if (distractors.some(t => typeof t !== 'string' || !t.trim())) {
      push(file, exId, `"${label}.distractors" contiene tokens vacíos o no-string`);
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
  // Phase 15 (SLOT-04): superficie en el helper plano; wrapper sobre el payload.
  validateMatchSurface(ex.payload, ex.id, file, push, 'payload');

  // Phase 7 plan 01 (D-116, EXPL-01): regla opcional `payload.explanation`.
  // Misma semántica que en multi-choice y word-buttons — uniforme cross-types
  // (D-113). En match, la explicación se renderiza tras el grid antes de
  // "Siguiente" porque no existe línea "Respuesta correcta:" en este tipo. Solo
  // aplica al payload legacy (slots con variantes → explanation a nivel slot).
  if (ex.payload.explanation !== undefined) {
    if (typeof ex.payload.explanation !== 'string' || !ex.payload.explanation.trim()) {
      push(file, ex.id, '"payload.explanation" debe ser string no vacío si está presente');
    }
  }
}

/**
 * Phase 15 (SLOT-04): valida la SUPERFICIE de `match` sobre un objeto plano
 * (payload legacy o variante de slot). Conserva el early-return DENTRO del
 * forEach cuando una pair no es array (evita `TypeError: p[0]` al traversar
 * un valor malformado) — D-08 a nivel local, sin early-return global.
 *
 * @param {object} surface - `{prompt, pairs}`.
 * @param {string} exId
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 * @param {string} label - prefijo de campo: `"payload"` o `"variants[k]"`.
 */
function validateMatchSurface(surface, exId, file, push, label) {
  const { prompt, pairs } = surface;

  // Phase 46 plan 01 (SCH-02, D-46-04): nota gemela de la de
  // `validateWordButtonsSurface`. Va ANTES del early-return de `pairs`: el
  // rechazo no depende de nada más de la superficie, así que una variante con
  // `pairs` malformado Y `translationES` debe reportar los DOS errores.
  if (surface.translationES !== undefined) {
    push(file, exId, `"${label}.translationES" no está permitido en variantes de tipo "match" / "word-buttons"`);
  }

  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, exId, `"${label}.prompt" debe ser string no vacío`);
  }

  if (!Array.isArray(pairs)) {
    push(file, exId, `"${label}.pairs" debe ser array de tuples [izq, der] (encontrado: ${typeof pairs})`);
    return; // sin array no podemos traversar
  }

  if (pairs.length < 2 || pairs.length > 10) {
    push(file, exId, `"${label}.pairs" debe tener entre 2 y 10 entradas (encontrado: ${pairs.length})`);
  }

  pairs.forEach((p, idx) => {
    if (!Array.isArray(p) || p.length !== 2) {
      push(file, exId, `"${label}.pairs[${idx}]" debe ser tuple de exactamente 2 strings`);
      return; // skip esta iteración del forEach — no traversar p[0]/p[1]
    }
    if (typeof p[0] !== 'string' || !p[0].trim()) {
      push(file, exId, `"${label}.pairs[${idx}][0]" debe ser string no vacío`);
    }
    if (typeof p[1] !== 'string' || !p[1].trim()) {
      push(file, exId, `"${label}.pairs[${idx}][1]" debe ser string no vacío`);
    }
  });
}

// ─── Top-level field validators ──────────────────────────────────────────────

/**
 * Phase 9 (VAL-01, D-VAL-06, D-VAL-08): valida el campo top-level opcional
 * `validation` del ejercicio (no es payload — es metadata del ejercicio como
 * unidad). Acumula errores estilo D-08; cero throws.
 *
 * Shape esperado (D-VAL-06):
 *   {
 *     "status": "pending" | "validated" | "disputed",
 *     "passes": [
 *       { "by": string, "date": "YYYY-MM-DD", "verdict": "correcta"|"incorrecta", "concerns"?: string[] }
 *     ]
 *   }
 *
 * Backward-compat (D-VAL-08): ausencia del campo = aceptado sin warning. Los
 * 271 ejercicios actuales no lo tienen y NO se rompen (cero migración).
 *
 * Mensajes en español (FOUND-04).
 *
 * @param {object} ex
 * @param {string} file
 * @param {(file:string, exerciseId:string, reason:string) => void} push
 */
function validateValidationShape(ex, file, push) {
  if (!('validation' in ex)) return; // back-compat: campo opcional

  const v = ex.validation;
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    push(file, ex.id, '"validation" debe ser objeto si está presente');
    return;
  }

  const VALID_STATUS = ['pending', 'validated', 'disputed'];
  const VALID_VERDICT = ['correcta', 'incorrecta'];
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

  if (!VALID_STATUS.includes(v.status)) {
    push(file, ex.id, `"validation.status" inválido: ${JSON.stringify(v.status)} (esperado: pending|validated|disputed)`);
  }

  if (!Array.isArray(v.passes)) {
    push(file, ex.id, `"validation.passes" debe ser array (encontrado: ${typeof v.passes})`);
    return; // sin array no podemos traversar
  }

  v.passes.forEach((p, idx) => {
    if (!p || typeof p !== 'object' || Array.isArray(p)) {
      push(file, ex.id, `"validation.passes[${idx}]" debe ser objeto`);
      return; // skip esta iteración — no traversar campos de p
    }

    if (typeof p.by !== 'string' || !p.by.trim()) {
      push(file, ex.id, `"validation.passes[${idx}].by" debe ser string no vacío`);
    }

    if (typeof p.date !== 'string' || !ISO_DATE.test(p.date)) {
      push(file, ex.id, `"validation.passes[${idx}].date" debe ser string en formato ISO YYYY-MM-DD`);
    }

    if (!VALID_VERDICT.includes(p.verdict)) {
      push(file, ex.id, `"validation.passes[${idx}].verdict" inválido (esperado: correcta|incorrecta)`);
    }

    if (p.concerns !== undefined) {
      if (!Array.isArray(p.concerns) || p.concerns.some(c => typeof c !== 'string')) {
        push(file, ex.id, `"validation.passes[${idx}].concerns" debe ser array de strings si está presente`);
      }
    }
  });
}
