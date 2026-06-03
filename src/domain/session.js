// src/domain/session.js
//
// Pure domain module — sampler de sesión. Sin DOM, sin storage, sin fetch
// (D-02 layer-purity).
//
// Decisiones aplicadas:
//   - DOMAIN-02 (Phase 1): `buildSession(...)` con weighted random + sin reemplazo.
//   - D-13 (Phase 1): si `#pool < requestedSize`, reducimos al disponible (NO repetir).
//   - D-14 (Phase 1): ejercicios dentro de una sesión son únicos (sin reemplazo).
//   - Weight cap = 10: `weight = 1 / (1 + min(timesShown, 10))` — evita que
//     ejercicios nuevos (timesShown=0) monopolicen el muestreo durante semanas.
//   - D-49 (Phase 2): `buildSession` añade GUARANTEE phase **antes** del FILL.
//     Para cada categoría seleccionada, garantiza ≥1 ejercicio si hay candidates;
//     un ejercicio multi-cat picked una sola vez puede cubrir N categorías
//     (chequeo `alreadyCovered`).
//   - D-50 (Phase 2): `buildFullTest(categoryIds, allExercises, rng)` nueva export.
//     Modo "Test completo" del picker — Fisher-Yates determinista sobre el pool
//     entero. Sin tope, sin weighted, sin guarantee phase (todos los ejercicios
//     entran, orden random determinista).
//   - D-51 (Phase 2): oversubscription silente — si `categoryIds.length >
//     requestedSize`, la GUARANTEE phase corta cuando `|session| >= target`;
//     las categorías sobrantes se ignoran sin warning (diferido a Phase 5).
//   - D-62 (Phase 3): `fisherYates(arr, rng)` se exporta como helper público
//     reusable para shuffles deterministas — usado por `buildFullTest` aquí
//     y por el banco word-buttons / las columnas match en el screen layer.
//
// Layer purity: este módulo no importa de `../data/*` ni de `../screens/*`.

/** Cap de timesShown a la hora de computar el peso. */
const WEIGHT_CAP = 10;

/**
 * Fisher-Yates shuffle seedable. Copia defensiva — NO muta `arr`.
 *
 * D-62 (Phase 3): se exporta como helper público para reusar el mismo
 * algoritmo determinista (mismo RNG → mismo orden) en tres sitios:
 *   1. `buildFullTest` aquí (paso 2 — shuffle del pool entero).
 *   2. Banco de palabras del tipo word-buttons (init sub-state al cargar
 *      ejercicio, mezcla `answer ∪ distractors`).
 *   3. Las dos columnas del tipo match (init sub-state — shuffle
 *      independiente de `pairs.map(p => p[0])` y `pairs.map(p => p[1])`).
 *
 * Pure: el RNG es inyectable; con seed fijo el orden es reproducible.
 *
 * @template T
 * @param {T[]} arr - Array de entrada (NO se muta).
 * @param {() => number} [rng=Math.random] - RNG inyectable; debe devolver float en [0,1).
 * @returns {T[]} Array nuevo con los mismos elementos en orden barajado.
 */
export function fisherYates(arr, rng = Math.random) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Peso de un ejercicio en función de cuántas veces se ha mostrado.
 *
 *   weight(0)   = 1
 *   weight(1)   = 1/2
 *   weight(10)  = 1/11
 *   weight(100) = 1/11  (capped)
 *
 * @param {number} timesShown - Veces que se ha mostrado (monotónico, >= 0).
 * @returns {number} Peso en (0, 1].
 */
export function exerciseWeight(timesShown) {
  return 1 / (1 + Math.min(timesShown ?? 0, WEIGHT_CAP));
}

/**
 * Construye una sesión de práctica.
 *
 * Algoritmo (4 pasos):
 *
 *   1. **Pool**: ejercicios cuyo `categoryIds` solape con `categoryIds`.
 *   2. **GUARANTEE phase** (D-49): para cada `cat` en `categoryIds`, si nadie en
 *      `session` la cubre todavía, pickear un candidate ponderado por
 *      `exerciseWeight`. Skip silencioso si no hay candidates (D-51). Break si
 *      `session.length >= targetSize` (oversubscription protection).
 *   3. **FILL phase** (Phase 1, refactorizado para reusar `weightedPickOne`):
 *      mientras `session.length < targetSize` y queden ejercicios, pickear
 *      del `remaining` (= `pool \ session`) ponderado.
 *   4. **Fisher-Yates final** con el mismo `rng` — los picks de GUARANTEE NO se
 *      quedan al inicio (orden randomizado).
 *
 * Pure: no muta `state` ni `allExercises`.
 *
 * @param {string[]} categoryIds   - Categorías seleccionadas.
 * @param {Array<{id: string, categoryIds: string[], variants?: object[]}>} allExercises
 *   - Pool completo de SLOTS normalizados (Phase 16); legacy = slot de 1 variante.
 * @param {{exerciseStats?: Record<string, {timesShown: number}>}} state - Estado.
 * @param {number} requestedSize   - Tamaño deseado de la sesión (p.ej. 20).
 * @param {'repaso'} [mode='repaso'] - Phase 1 solo soporta 'repaso'.
 * @param {() => number} [rng=Math.random] - RNG inyectable para tests.
 * @returns {{ exerciseIds: string[], variantIndices: number[], actualSize: number }}
 *   `variantIndices[i]` es la variante elegida para `exerciseIds[i]`
 *   (EXAM-01/04, D-16-08): 1 variante fijada por slot al construir la sesión.
 */
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) {
  // 1. Pool por solapamiento de categoryIds.
  //    Nota (Phase 16): `allExercises` ahora recibe objetos SLOT normalizados
  //    (`{id, type, categoryIds, explanation, variants[]}`) en lugar de
  //    ejercicios legacy con `.payload`. El filtro por `categoryIds` es idéntico
  //    porque el slot lleva `{id, categoryIds}`; legacy = slot de 1 variante.
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  if (pool.length === 0) return { exerciseIds: [], variantIndices: [], actualSize: 0 };

  const targetSize = Math.min(requestedSize, pool.length);
  const session = []; // ejercicios elegidos (referencias del pool)

  // 2. GUARANTEE phase (D-49) — set-cover greedy.
  //    Para cada categoría seleccionada, asegurar ≥1 ejercicio en session si
  //    hay candidates disponibles. Multi-cat: un solo pick puede cubrir varias.
  for (const cat of categoryIds) {
    // 2a. alreadyCovered: ¿algún ejercicio ya en session pertenece a `cat`?
    //     Funciona para multi-cat: un pick `[avere, genero]` cubre ambas.
    const alreadyCovered = session.some(ex => (ex.categoryIds ?? []).includes(cat));
    if (alreadyCovered) continue;

    // 2b. Oversubscription protection (D-51): si ya llenamos, paramos sin
    //     warning. Las categorías restantes quedan silenciosamente sin cubrir.
    if (session.length >= targetSize) break;

    // 2c. Candidates: pool ∩ ejercicios que incluyen `cat`, menos los ya en session.
    const candidates = pool.filter(ex =>
      (ex.categoryIds ?? []).includes(cat) && !session.includes(ex)
    );
    if (candidates.length === 0) continue; // D-51: skip silente

    // 2d. Pick ponderado.
    const picked = weightedPickOne(candidates, state, rng);
    session.push(picked);
  }

  // 3. FILL phase (Phase 1, sin cambios estructurales — D-49 paso 3).
  //    `remaining` = pool sin los ya picked en GUARANTEE.
  const remaining = pool.filter(ex => !session.includes(ex));
  while (session.length < targetSize && remaining.length > 0) {
    const picked = weightedPickOne(remaining, state, rng);
    session.push(picked);
    const idx = remaining.indexOf(picked);
    remaining.splice(idx, 1); // D-14: sin reemplazo
  }

  // 4. Fisher-Yates final con el mismo rng — los picks de GUARANTEE no quedan
  //    todos al inicio del array. Mantiene determinismo dado un RNG fijo.
  //    D-62: usamos el helper exportable `fisherYates` para consolidar el
  //    algoritmo en un único sitio. `fisherYates` devuelve copia; sobreescribimos
  //    `session` con el resultado para mantener la semántica del bucle inline
  //    original (no muta el array compartido fuera de scope).
  const shuffledSession = fisherYates(session, rng);

  // 5. Selección de variante por slot (Phase 16, EXAM-01/04 / D-16-08).
  //    Cada slot elegido fija UNA variante aleatoria uniforme con el MISMO `rng`
  //    ya threaded. `variantIndices` queda alineado 1:1 con `exerciseIds`.
  return {
    exerciseIds: shuffledSession.map(ex => ex.id),
    variantIndices: shuffledSession.map(slot => pickVariantIndex(slot, rng)),
    actualSize: shuffledSession.length
  };
}

/**
 * Modo "Test completo" del picker (D-50).
 *
 * Devuelve TODOS los ejercicios del pool filtrado por las categorías, ordenados
 * con Fisher-Yates usando el RNG inyectado. Sin tope, sin weighted sampling,
 * sin guarantee phase (todos los ejercicios entran exactamente una vez).
 *
 * Pure: no muta `allExercises`. Determinista con seed (mismo seed → mismo orden).
 *
 * @param {string[]} categoryIds - Categorías seleccionadas.
 * @param {Array<{id: string, categoryIds: string[], variants?: object[]}>} allExercises
 *   - Pool completo de SLOTS normalizados (Phase 16); legacy = slot de 1 variante.
 * @param {() => number} [rng=Math.random] - RNG inyectable para tests.
 * @returns {{ exerciseIds: string[], variantIndices: number[], actualSize: number }}
 *   `variantIndices[i]` es la variante elegida para `exerciseIds[i]` (D-16-08).
 */
export function buildFullTest(categoryIds, allExercises, rng = Math.random) {
  // 1. Pool por solapamiento de categoryIds (mismo filtro que buildSession).
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  // 2. Fisher-Yates sobre el pool entero. Sin tope, sin weighted, sin guarantee.
  //    D-62: usamos el helper exportable `fisherYates` (mismo algoritmo,
  //    mismo determinismo dado RNG fijo — un único call-site para el shuffle).
  const shuffled = fisherYates(pool, rng);

  // 3. Selección de variante por slot (Phase 16, D-16-08) — idéntico a buildSession.
  //    Pool vacío → `shuffled` vacío → ambos arrays vacíos, actualSize 0.
  return {
    exerciseIds: shuffled.map(ex => ex.id),
    variantIndices: shuffled.map(slot => pickVariantIndex(slot, rng)),
    actualSize: shuffled.length
  };
}

// ─── Helpers privados ───────────────────────────────────────────────────────

/**
 * Elige el índice de UNA variante dentro de un slot (Phase 16, EXAM-01/04).
 *
 * Hermano de `weightedPickOne` pero SIN peso: la selección es UNIFORME
 * aleatoria entre las variantes del slot (D-16-01 — cada variante con igual
 * probabilidad, cero state nuevo, cero contador por variante). Usa el MISMO
 * `rng` ya threaded en el sampler — no introduce un segundo RNG.
 *
 *   - slot con N>1 variantes → entero uniforme en [0, N).
 *   - slot con 0 o 1 variante → 0 (D-16-10, default backward-compat: los slots
 *     legacy de 1 variante siempre resuelven a su única variante, índice 0).
 *
 * Defensivo (T-16-01): si `slot.variants` está ausente o no es array, n=1 → 0;
 * jamás indexa fuera de rango. `Math.floor(rng()*n)` con n<=1→0 cubre el borde
 * patológico rng()→1.0 (T-16-02) igual que el patrón de `weightedPickOne`.
 *
 * Pure: no lee de `../data/*` (preserva la pureza de capa, session.js:27);
 * lee `slot.variants` del objeto slot recibido por parámetro.
 *
 * @param {{variants?: object[]}} slot - Slot normalizado (con `variants[]`).
 * @param {() => number} rng - RNG inyectable; debe devolver float en [0,1).
 * @returns {number} Índice de variante en [0, N).
 */
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  return n <= 1 ? 0 : Math.floor(rng() * n);
}

/**
 * Muestreo ponderado de UN ejercicio entre `candidates`, ponderado por
 * `exerciseWeight(timesShown)`. Helper privado factorizado para que GUARANTEE
 * phase y FILL phase usen el mismo algoritmo.
 *
 * Safety por float-rounding: si el accumulator nunca cae por debajo de 0
 * (caso patológico con totalWeight cercano a Number.EPSILON o rng()→1.0),
 * devuelve el último candidato.
 *
 * @param {Array<{id:string}>} candidates
 * @param {{exerciseStats?: Record<string, {timesShown: number}>}} state
 * @param {() => number} rng
 * @returns {object} El ejercicio elegido (referencia del array de input).
 */
function weightedPickOne(candidates, state, rng) {
  const weights = candidates.map(ex =>
    exerciseWeight(state.exerciseStats?.[ex.id]?.timesShown ?? 0)
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = rng() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  // Safety por float-rounding.
  return candidates[candidates.length - 1];
}
