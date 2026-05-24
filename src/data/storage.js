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
//   - D-77 / D-78 (Phase 4): migración schemaVersion 2 → 3 transparente: añade
//     `lastBackupAt: null` y `firstUsedAt: null`, preserva el resto.
//   - Defensivo: localStorage indisponible → blankState; JSON corrupto →
//     backup a `italianCourse.v1.corrupt.<ts>` + blankState; schemaVersion
//     desconocido (futuro) → warn + blankState.

const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 4;

/**
 * Devuelve un estado "en blanco" (sin progreso) — el estado inicial canónico
 * con shape v4 (D-46/D-47 + D-77/D-78 Phase 4 + D-111 Phase 6).
 *
 * Phase 6 (D-111): el bump 3 → 4 es nominal a nivel del state principal — no
 * añade campos nuevos al root. La diferencia v3 vs v4 sólo es relevante para
 * el sub-objeto `inFlightTest.answers[]`, donde post-Phase 6 cada answer
 * lleva `userAnswer` (string | string[] | {left,right} | null) para soportar
 * la sección "Errores cometidos" en el summary (UX-02). `blankState()` ya
 * omite `inFlightTest` (undefined), así que el shape root es idéntico a v3 —
 * solo cambia el número de versión.
 *
 * Nota: `inFlightTest` se omite (undefined) deliberadamente; `JSON.stringify`
 * lo elide al persistir y el resto del código trata `state.inFlightTest`
 * como opcional.
 *
 * @returns {{schemaVersion: 4, exerciseStats: object, categoryProgress: object, dailyLog: object, lastBackupAt: null, firstUsedAt: null}}
 */
export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {},
    lastBackupAt: null,    // NEW (D-77 Phase 4)
    firstUsedAt: null      // NEW (D-78 Phase 4)
    // inFlightTest omitido (undefined) — saveState/JSON.stringify lo elide.
  };
}

/**
 * Carga el estado desde localStorage. Si no hay nada, devuelve `blankState()`.
 * Si el contenido está corrupto (JSON inválido o shape inesperada), hace
 * backup defensivo bajo `italianCourse.v1.corrupt.<timestamp>` y arranca
 * limpio.
 *
 * El estado devuelto SIEMPRE está en el shape v4 (las migraciones 1→2→3→4
 * corren transparente vía el dispatcher).
 *
 * @returns {{schemaVersion: 4, exerciseStats: object, categoryProgress: object, dailyLog: object, lastBackupAt: ?string, firstUsedAt: ?string, inFlightTest?: object}}
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
 * Phase 6 (D-111): cadena 1 → 2 → 3 → 4 → hydrateV4 (migrate1to2,
 * migrate2to3, migrate3to4, hydrateV4 encadenados con fall-through sobre
 * `s.schemaVersion`). `hydrateV2` y `hydrateV3` se conservan como export
 * por backward-compat de tests existentes; el dispatcher actual NO los
 * llama (encadena migrate1to2 → migrate2to3 → migrate3to4 → hydrateV4
 * directo).
 *
 * @param {*} parsed - Resultado de JSON.parse del raw blob persistido.
 * @returns {object} Estado normalizado en el shape v4.
 */
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) s = migrate3to4(s);
  if (s.schemaVersion === 4) return hydrateV4(s);

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
 * Phase 4: el dispatcher `migrate()` ya no llama `hydrateV2` directamente
 * (encadena 1→2→3 a hydrateV3). Este export se conserva por backward-compat
 * de tests existentes (`tests/data-storage.test.js`).
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

/**
 * Migra un estado v2 a v3 (D-77 / D-78, Phase 4). Añade `lastBackupAt: null`
 * y `firstUsedAt: null`; preserva el resto (exerciseStats, categoryProgress,
 * dailyLog, inFlightTest).
 *
 * Idempotencia sobre valores existentes: si el v2 ya tenía `lastBackupAt` o
 * `firstUsedAt` (por ejemplo porque migra2to3 corre dos veces sobre el mismo
 * blob, o porque `parseBackupFile` recibe un wrapper con state v2 que el
 * autor editó a mano), preservamos los valores tipo string; cualquier otra
 * cosa cae a `null` (defensivo).
 *
 * @param {object} v2 - Estado parseado con `schemaVersion: 2`.
 * @returns {object} Estado normalizado v3.
 */
export function migrate2to3(v2) {
  return {
    schemaVersion: 3,
    exerciseStats: (typeof v2.exerciseStats === 'object' && v2.exerciseStats !== null)
      ? v2.exerciseStats
      : {},
    categoryProgress: (typeof v2.categoryProgress === 'object' && v2.categoryProgress !== null)
      ? v2.categoryProgress
      : {},
    dailyLog: (typeof v2.dailyLog === 'object' && v2.dailyLog !== null)
      ? v2.dailyLog
      : {},
    lastBackupAt: typeof v2.lastBackupAt === 'string' ? v2.lastBackupAt : null,
    firstUsedAt: typeof v2.firstUsedAt === 'string' ? v2.firstUsedAt : null,
    inFlightTest: v2.inFlightTest
  };
}

/**
 * Hidrata un estado v3 ya en disco con type-guards defensivos en cada
 * sub-objeto. Útil cuando el usuario edita manualmente localStorage o cuando
 * el backup importado viene de una shape v3 con campos malformados.
 *
 * Defensa contra prototype pollution (T-04-02): la reconstrucción literal
 * del objeto `{schemaVersion: 3, exerciseStats: ..., ...}` produce un nuevo
 * objeto con prototipo `Object.prototype` limpio. Cualquier `__proto__` que
 * V8 ya hubiera materializado como property propia del input cae como
 * property propia del output (no contamina el prototipo global; verificable
 * con `({}).polluted === undefined` tras un parse con `"__proto__": {...}`).
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 3`.
 * @returns {object} Estado v3 con campos garantizados.
 */
export function hydrateV3(parsed) {
  return {
    schemaVersion: 3,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? parsed.exerciseStats
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? parsed.categoryProgress
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? parsed.dailyLog
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}

/**
 * Migra un estado v3 a v4 (D-110/D-111, Phase 6). El bump es NOMINAL a nivel
 * del state principal — el shape root es idéntico a v3. La única diferencia
 * es el shape de las entradas de `inFlightTest.answers[]`, que post-Phase 6
 * llevan un campo `userAnswer` (string | string[] | {left,right} | null) para
 * que el summary post-sesión pueda renderizar la sección "Errores cometidos"
 * (UX-02). Sin este backfill, un Test completo pre-Phase 6 reanudado tras la
 * migración tendría `answers[i].userAnswer === undefined`, que el template
 * trataría como ausencia silenciosa (preferible al placeholder, pero
 * `null` es el sentinel canónico — más explícito).
 *
 * Idempotencia:
 *   - Si el campo `userAnswer` YA existe en una answer (porque el usuario
 *     editó el localStorage a mano o porque la migración corre dos veces
 *     sobre el mismo blob), su valor se preserva tal cual. Sólo entries que
 *     NO tienen la clave `userAnswer` reciben el backfill a `null`.
 *
 * Pureza (T-06-02-03):
 *   - NO muta el input. Devuelve un nuevo objeto raíz con literal
 *     `{ schemaVersion: 4, ... }` (defensa estructural contra prototype
 *     pollution, igual que `migrate2to3` y `hydrateV3`). El `inFlightTest`
 *     también se reconstruye con spread + map de answers (cada answer es
 *     un objeto nuevo).
 *
 * Preserva todos los sub-objetos v3 con guards defensivos idénticos a
 * `migrate2to3` (typeof X === 'object' && X !== null para dicts; typeof X
 * === 'string' para timestamps ISO).
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v3 → v4.
 *
 * @param {object} v3 - Estado parseado con `schemaVersion: 3`.
 * @returns {object} Estado normalizado v4.
 */
export function migrate3to4(v3) {
  // Reconstruir inFlightTest con backfill defensivo de userAnswer en answers.
  //
  // WR-03 fix: el guard previo era
  //   `Array.isArray(v3.inFlightTest.answers)` — si la edición manual del
  // localStorage había corrompido `answers` a null, undefined, string "[]",
  // o cualquier no-array, el branch entero se saltaba y `newInFlightTest`
  // quedaba con el shape malformado. Más tarde `resumeInFlightTest()` hacía
  // `[...ift.answers]` y crasheaba con `TypeError: not iterable`.
  //
  // Fix: si `inFlightTest` existe como objeto, normalizamos `answers` a `[]`
  // cuando no sea array antes del backfill. Combinado con CR-03 (deep-clone
  // de sub-dicts), garantiza que el state v4 post-migración siempre tenga
  // `answers` array iterable.
  let newInFlightTest = v3.inFlightTest;
  if (typeof v3.inFlightTest === 'object' && v3.inFlightTest !== null) {
    const answers = Array.isArray(v3.inFlightTest.answers) ? v3.inFlightTest.answers : [];
    const backfilled = answers.map(a => {
      if (a && typeof a === 'object' && !('userAnswer' in a)) {
        return { ...a, userAnswer: null };
      }
      return a;
    });
    newInFlightTest = { ...v3.inFlightTest, answers: backfilled };
  }

  // CR-03 fix: deep-clone defensivo de los sub-dicts vía JSON round-trip.
  // El comment de T-04-02 prometía "reconstrucción literal produce Object.prototype
  // limpio" — true para el OBJETO ROOT, pero las entradas anidadas (e.g.
  // `exerciseStats[id]`) compartían referencia con el input parseado. Un sub-objeto
  // con `__proto__` como own-property o con un getter ejecutable podía colarse al
  // live state. JSON.parse(JSON.stringify(...)) elimina funciones, getters y
  // cadenas de prototipo no-Object.prototype porque la serialización JSON
  // ignora todo eso (consistente con el patrón ya en uso en `completeSession()`
  // línea 1521 para el snapshot de categoryProgress antes del delta).
  return {
    schemaVersion: 4,
    exerciseStats: (typeof v3.exerciseStats === 'object' && v3.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(v3.exerciseStats))
      : {},
    categoryProgress: (typeof v3.categoryProgress === 'object' && v3.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(v3.categoryProgress))
      : {},
    dailyLog: (typeof v3.dailyLog === 'object' && v3.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v3.dailyLog))
      : {},
    lastBackupAt: typeof v3.lastBackupAt === 'string' ? v3.lastBackupAt : null,
    firstUsedAt: typeof v3.firstUsedAt === 'string' ? v3.firstUsedAt : null,
    inFlightTest: newInFlightTest
  };
}

/**
 * Hidrata un estado v4 ya en disco con type-guards defensivos en cada
 * sub-objeto. Útil cuando el usuario edita manualmente localStorage o cuando
 * el backup importado viene de una shape v4 con campos malformados.
 *
 * Phase 6 (D-111): el shape v4 root es idéntico a v3 (el bump 3→4 es nominal
 * a nivel del state principal). hydrateV4 reconstruye literal con
 * `{ schemaVersion: 4, ... }` (defensa estructural contra prototype
 * pollution, T-04-02). NO ejecuta el backfill de userAnswer en
 * inFlightTest.answers — eso ya lo hizo `migrate3to4` durante la cadena, o
 * el state v4 que llega aquí ya viene v4-shaped por construcción.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 4`.
 * @returns {object} Estado v4 con campos garantizados.
 */
export function hydrateV4(parsed) {
  // CR-03 fix: deep-clone defensivo de los sub-dicts (consistente con
  // migrate3to4 — ver comentario allí). T-04-02 prometía "Object.prototype
  // limpio" para el root, pero entradas anidadas con getters / __proto__
  // como own-property podían persistir si se copiaban por referencia.
  // JSON round-trip las neutraliza.
  return {
    schemaVersion: 4,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}
