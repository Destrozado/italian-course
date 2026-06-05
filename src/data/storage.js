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
const CURRENT_SCHEMA_VERSION = 9;

/**
 * Devuelve un estado "en blanco" (sin progreso) — el estado inicial canónico
 * con shape v9 (D-46/D-47 + D-77/D-78 Phase 4 + D-111 Phase 6 + D-02/D-03
 * Phase 13 + D-15-08/D-15-09 Phase 15 + D-17-08 Phase 17 + D-18 Phase 18 +
 * D-21 Phase 21).
 *
 * Phase 21 (D-21 / MIG-03): el bump 8 → 9 es NOMINAL a nivel del state root —
 * no añade campos nuevos ni sub-árboles. El set de sub-dicts es IDÉNTICO a v8.
 * La diferencia efectiva del bump vive en `migrate8to9`, que resetea SOLO el
 * progreso de SEIS categorías (avere, essere, verbos-movimiento, genero-numero,
 * profesiones, sustantivos-irregulares), reagrupadas a slots+variantes en las
 * Phases 22-27; un estado en blanco no tiene progreso que resetear, así que
 * `blankState()` solo cambia el número de versión.
 *
 * Phase 18 (D-18 / MIG-01): el bump 7 → 8 es NOMINAL a nivel del state root —
 * no añade campos nuevos ni sub-árboles. El set de sub-dicts es IDÉNTICO a v7.
 * La diferencia efectiva del bump vive en `migrate7to8`, que resetea SOLO el
 * progreso de DOS categorías (articoli + partitivos), reagrupadas a
 * slots+variantes en las Phases 19/20; un estado en blanco no tiene progreso
 * que resetear, así que `blankState()` solo cambia el número de versión.
 *
 * Phase 17 (D-17-08): el bump 6 → 7 fue NOMINAL — `migrate6to7` resetea SOLO el
 * progreso de Preposiciones (reagrupada a slots+variantes en el piloto).
 * Precedente de bump nominal: 5 → 6 (D-15-09) y 3 → 4 (D-110/D-111).
 *
 * Nota: `inFlightTest` se omite (undefined) deliberadamente; `JSON.stringify`
 * lo elide al persistir y el resto del código trata `state.inFlightTest`
 * como opcional.
 *
 * @returns {{schemaVersion: 8, exerciseStats: object, categoryProgress: object, dailyLog: object, songProgress: object, lastBackupAt: null, firstUsedAt: null}}
 */
export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {},
    songProgress: {},      // NEW (D-02/D-03 Phase 13) — estado por canción, plano
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
 * El estado devuelto SIEMPRE está en el shape v8 (las migraciones 1→…→8
 * corren transparente vía el dispatcher).
 *
 * @returns {{schemaVersion: 8, exerciseStats: object, categoryProgress: object, dailyLog: object, songProgress: object, lastBackupAt: ?string, firstUsedAt: ?string, inFlightTest?: object}}
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
 * @returns {object} Estado normalizado en el shape v8.
 */
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) s = migrate3to4(s);
  if (s.schemaVersion === 4) s = migrate4to5(s);
  if (s.schemaVersion === 5) s = migrate5to6(s);
  if (s.schemaVersion === 6) s = migrate6to7(s);
  if (s.schemaVersion === 7) s = migrate7to8(s);
  if (s.schemaVersion === 8) s = migrate8to9(s);
  if (s.schemaVersion === 9) return hydrateV9(s);

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

/**
 * Migra un estado v4 a v5 (D-02/D-03, Phase 13). Añade el sub-árbol nuevo
 * `songProgress` (estado por canción: `{ status, lastPlayedAt? }` plano) y
 * preserva el resto íntegro con deep-clone defensivo.
 *
 * `songProgress` es PLANO (D-03): NO copia la maquinaria de promoción de
 * `categoryProgress` (streakDays / becameHechaAt / becameDominadaAt /
 * dominada). El estado de una canción es redimible/bidireccional y refleja el
 * último recorrido completo (no-hecha | pasada | fallada).
 *
 * Deep-clone defensivo (CR-03): el `JSON.parse(JSON.stringify(...))` por
 * sub-dict neutraliza getters / `__proto__` como own-property — mismo patrón
 * anti-prototype-pollution que `migrate3to4` (T-13-01). Si `v4.songProgress`
 * existe como objeto se clona; si no, arranca `{}`.
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v4 → v5.
 *
 * @param {object} v4 - Estado parseado con `schemaVersion: 4`.
 * @returns {object} Estado normalizado v5.
 */
export function migrate4to5(v4) {
  return {
    schemaVersion: 5,
    exerciseStats: (typeof v4.exerciseStats === 'object' && v4.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(v4.exerciseStats))
      : {},
    categoryProgress: (typeof v4.categoryProgress === 'object' && v4.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(v4.categoryProgress))
      : {},
    dailyLog: (typeof v4.dailyLog === 'object' && v4.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v4.dailyLog))
      : {},
    songProgress: (typeof v4.songProgress === 'object' && v4.songProgress !== null)
      ? JSON.parse(JSON.stringify(v4.songProgress))
      : {},   // NEW sub-árbol (Phase 13)
    lastBackupAt: typeof v4.lastBackupAt === 'string' ? v4.lastBackupAt : null,
    firstUsedAt: typeof v4.firstUsedAt === 'string' ? v4.firstUsedAt : null,
    inFlightTest: v4.inFlightTest
  };
}

/**
 * Hidrata un estado v5 ya en disco con type-guards defensivos en cada
 * sub-objeto. Espejo de `hydrateV4` con la línea `songProgress` añadida.
 *
 * Deep-clone defensivo (CR-03 / T-13-01): igual que `migrate4to5` y
 * `hydrateV4`. Útil cuando el usuario edita manualmente localStorage o cuando
 * el backup importado viene de una shape v5 con sub-objetos malformados.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 5`.
 * @returns {object} Estado v5 con campos garantizados.
 */
export function hydrateV5(parsed) {
  return {
    schemaVersion: 5,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}

/**
 * Migra un estado v5 a v6 (D-15-08/D-15-09, Phase 15). El bump es NOMINAL a
 * nivel del state root — el shape es IDÉNTICO a v5 (mismo set de sub-dicts:
 * exerciseStats, categoryProgress, dailyLog, songProgress; sin sub-árbol
 * nuevo). El modelo slot+variantes del milestone v1.4 vive en `content/`
 * (schema-validator + content-loader), NO en el state; `exerciseStats` sigue
 * keyed por id de ejercicio-slot. Precedente de bump nominal: 3 → 4
 * (D-110/D-111). Sin reset de progreso (Preposiciones reset es Phase 17).
 *
 * Espejo LITERAL de `migrate4to5` (Phase 13) con la versión a 6 y SIN la línea
 * "NEW sub-árbol" — `songProgress` ya no es nuevo, se mantiene como sub-dict
 * normal.
 *
 * Deep-clone defensivo (CR-03 / T-04-02 / T-15-PP): el
 * `JSON.parse(JSON.stringify(...))` por sub-dict neutraliza getters /
 * `__proto__` como own-property — reconstruye un root literal fresco, nunca
 * asigna `__proto__` como prototipo (verificable con `({}).polluted ===
 * undefined` tras un parse con `"__proto__": {...}`). Si `v5.X` existe como
 * objeto se clona; si no, arranca `{}`.
 *
 * Pureza + idempotencia (T-15-INT): NO muta el input; re-ejecutar sobre el
 * resultado produce la misma shape.
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v5 → v6.
 *
 * @param {object} v5 - Estado parseado con `schemaVersion: 5`.
 * @returns {object} Estado normalizado v6.
 */
export function migrate5to6(v5) {
  return {
    schemaVersion: 6,
    exerciseStats: (typeof v5.exerciseStats === 'object' && v5.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(v5.exerciseStats))
      : {},
    categoryProgress: (typeof v5.categoryProgress === 'object' && v5.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(v5.categoryProgress))
      : {},
    dailyLog: (typeof v5.dailyLog === 'object' && v5.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v5.dailyLog))
      : {},
    songProgress: (typeof v5.songProgress === 'object' && v5.songProgress !== null)
      ? JSON.parse(JSON.stringify(v5.songProgress))
      : {},
    lastBackupAt: typeof v5.lastBackupAt === 'string' ? v5.lastBackupAt : null,
    firstUsedAt: typeof v5.firstUsedAt === 'string' ? v5.firstUsedAt : null,
    inFlightTest: v5.inFlightTest
  };
}

/**
 * Hidrata un estado v6 ya en disco con type-guards defensivos en cada
 * sub-objeto. Espejo LITERAL de `hydrateV5` (Phase 13) con la versión a 6 —
 * el shape v6 root es idéntico a v5 (el bump 5 → 6 es nominal, D-15-09).
 *
 * Deep-clone defensivo (CR-03 / T-15-PP): igual que `migrate5to6` y
 * `hydrateV5`. Útil cuando el usuario edita manualmente localStorage o cuando
 * el backup importado viene de una shape v6 con sub-objetos malformados.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 6`.
 * @returns {object} Estado v6 con campos garantizados.
 */
export function hydrateV6(parsed) {
  return {
    schemaVersion: 6,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}

/**
 * Migra un estado v6 a v7 (D-17-08 / PILOT-04, Phase 17). El bump es NOMINAL a
 * nivel del shape root (mismo set de sub-dicts que v6), PERO aplica una poda
 * QUIRÚRGICA: resetea SOLO el progreso de la categoría Preposiciones, que en
 * el piloto v1.4 se reagrupa de 52 ejercicios planos a slots+variantes. Mapear
 * el estado ejercicio→slot legacy sería frágil; el reset es coherente con el
 * Core Value (re-verificar desde cero) y mucho más simple (D-17-08). Las otras
 * 8 categorías conservan su progreso byte-intacto.
 *
 * Espejo de `migrate5to6` (Phase 15) con la versión a 7 y TRES desviaciones
 * (D-17-08):
 *   (1) tras el deep-clone de `categoryProgress`, `delete clone.preposiciones`
 *       → la categoría re-lazy-inicializa como no-hecha, racha 0 (D-47);
 *   (2) `exerciseStats` se reconstruye filtrando las claves con prefijo
 *       `preposiciones` (cubre tanto los ids legacy `preposiciones-001..052`
 *       como los nuevos ids de slot `preposiciones-al`, etc.). Ninguna otra de
 *       las 9 categorías reales empieza por `preposiciones`, así que el match
 *       de prefijo es seguro (avere/essere/preposiciones/verbos-movimiento/
 *       sustantivos-irregulares/genero-numero/profesiones/articoli/partitivos);
 *   (3) `inFlightTest` se invalida a `undefined` si referencia algún id de
 *       Preposiciones — tras la reagrupación esos ids ya no existen en
 *       `slotById`, y reanudar el Test crashearía el render (`slotById[id]`
 *       undefined). La invalidación pasa en la MIGRACIÓN, no se confía del
 *       guard de UI (que no valida existencia de ids). Estilo de reconstrucción
 *       condicional clonado de `migrate3to4` (no muta el input).
 *
 * Deep-clone defensivo (CR-03 / T-04-02 / T-17-01): el
 * `JSON.parse(JSON.stringify(...))` por sub-dict neutraliza getters /
 * `__proto__` como own-property; reconstruye un root literal fresco
 * `{ schemaVersion: 7, ... }`, nunca asigna `__proto__` como prototipo. Crítico
 * aquí: la poda (`delete` + filtro de claves) opera sobre dicts derivados del
 * input parseado del autor — sin el clone, una clave maliciosa o un getter del
 * state importado se colaría al live state.
 *
 * Idempotencia + pureza (T-17-02): NO muta el input. Re-ejecutar sobre un v7 ya
 * migrado produce la misma shape (Preposiciones ya ausente → `delete` y filtro
 * son no-op; `inFlightTest` ya invalidado o ajeno → se preserva).
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v6 → v7.
 *
 * @param {object} v6 - Estado parseado con `schemaVersion: 6`.
 * @returns {object} Estado normalizado v7 con Preposiciones reseteada.
 */
export function migrate6to7(v6) {
  // (1) Reset de categoryProgress.preposiciones tras deep-clone defensivo.
  const categoryProgress = (typeof v6.categoryProgress === 'object' && v6.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v6.categoryProgress))
    : {};
  delete categoryProgress.preposiciones;

  // (2) Poda por prefijo de exerciseStats['preposiciones*'] tras deep-clone.
  const exerciseStatsAll = (typeof v6.exerciseStats === 'object' && v6.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v6.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!k.startsWith('preposiciones')) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de Preposiciones (Pitfall 3).
  //     Reconstrucción condicional sin mutar el input (estilo migrate3to4).
  let inFlightTest = v6.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && id.startsWith('preposiciones'))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 7,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v6.dailyLog === 'object' && v6.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v6.dailyLog))
      : {},
    songProgress: (typeof v6.songProgress === 'object' && v6.songProgress !== null)
      ? JSON.parse(JSON.stringify(v6.songProgress))
      : {},
    lastBackupAt: typeof v6.lastBackupAt === 'string' ? v6.lastBackupAt : null,
    firstUsedAt: typeof v6.firstUsedAt === 'string' ? v6.firstUsedAt : null,
    inFlightTest
  };
}

/**
 * Hidrata un estado v7 ya en disco con type-guards defensivos en cada
 * sub-objeto. Espejo LITERAL de `hydrateV6` (Phase 15) con la versión a 7 —
 * el shape v7 root es idéntico a v6 (el bump 6 → 7 es nominal a nivel del
 * shape; la diferencia efectiva, el reset de Preposiciones, la hace
 * `migrate6to7` durante la cadena).
 *
 * NO repite la poda de `migrate6to7`: un state que llega a `hydrateV7` ya viene
 * v7-shaped (Preposiciones ya reseteada durante la cadena) o es un import
 * directo v7 que debe preservarse íntegro. Precedente: `hydrateV6` no
 * re-ejecuta la lógica de `migrate5to6`, solo garantiza shape.
 *
 * Deep-clone defensivo (CR-03 / T-04-02 / T-17-01): igual que `migrate6to7` y
 * `hydrateV6`. Útil cuando el usuario edita manualmente localStorage o cuando
 * el backup importado viene de una shape v7 con sub-objetos malformados.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 7`.
 * @returns {object} Estado v7 con campos garantizados.
 */
export function hydrateV7(parsed) {
  return {
    schemaVersion: 7,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}

/**
 * Migra un estado v7 a v8 (D-18 / MIG-01). Espejo LITERAL de `migrate6to7`
 * (Phase 17) con UNA desviación funcional: el reset selectivo opera sobre DOS
 * prefijos de id de categoría (`articoli` + `partitivos`) en vez de uno
 * (`preposiciones`). Deja libre la renumeración de ids que harán las Phases
 * 19/20 — no se puede renumerar con progreso vivo. El progreso de
 * articoli+partitivos se resetea por diseño (Core Value: re-verificación).
 *
 * Seguridad de prefijo (D-03): las otras 7 categorías (`avere`, `essere`,
 * `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`,
 * `genero-numero`, `profesiones`) NO empiezan por `articoli` ni `partitivos`,
 * así que el filtro `startsWith` no tiene colisiones y las preserva byte a
 * byte. (El id de la categoría partitivos es `partitivos` en español aunque el
 * display sea "Partitivi".)
 *
 * Reset por prefijo (no por igualdad exacta) cubre tanto los ids legacy como
 * los nuevos ids de slot que producirán las Phases 19/20 (seguirán empezando
 * por `articoli`/`partitivos`).
 *
 * Idempotencia + pureza (T-18-02): NO muta el input. Re-ejecutar sobre un v8 ya
 * migrado produce la misma shape (articoli/partitivos ya ausentes → `delete` y
 * filtro son no-op; `inFlightTest` ya invalidado o ajeno → se preserva).
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v7 → v8.
 *
 * @param {object} v7 - Estado parseado con `schemaVersion: 7`.
 * @returns {object} Estado normalizado v8 con articoli + partitivos reseteados.
 */
export function migrate7to8(v7) {
  // (1) Reset de categoryProgress.articoli + .partitivos tras deep-clone defensivo.
  const categoryProgress = (typeof v7.categoryProgress === 'object' && v7.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v7.categoryProgress))
    : {};
  delete categoryProgress.articoli;
  delete categoryProgress.partitivos;

  // (2) Poda por prefijo de exerciseStats['articoli*' | 'partitivos*'] tras deep-clone.
  const exerciseStatsAll = (typeof v7.exerciseStats === 'object' && v7.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v7.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!k.startsWith('articoli') && !k.startsWith('partitivos')) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de articoli o partitivos (Pitfall 3).
  //     Reconstrucción condicional sin mutar el input (estilo migrate3to4).
  let inFlightTest = v7.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && (id.startsWith('articoli') || id.startsWith('partitivos')))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 8,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v7.dailyLog === 'object' && v7.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v7.dailyLog))
      : {},
    songProgress: (typeof v7.songProgress === 'object' && v7.songProgress !== null)
      ? JSON.parse(JSON.stringify(v7.songProgress))
      : {},
    lastBackupAt: typeof v7.lastBackupAt === 'string' ? v7.lastBackupAt : null,
    firstUsedAt: typeof v7.firstUsedAt === 'string' ? v7.firstUsedAt : null,
    inFlightTest
  };
}

/**
 * Hidrata un estado v8 ya en disco con type-guards defensivos en cada
 * sub-objeto. Espejo LITERAL de `hydrateV7` (Phase 17) con la versión a 8 — el
 * shape v8 root es idéntico a v7 (el bump 7 → 8 es nominal a nivel del shape;
 * la diferencia efectiva, el reset de articoli+partitivos, la hace
 * `migrate7to8` durante la cadena).
 *
 * NO repite la poda de `migrate7to8`: un state que llega a `hydrateV8` ya viene
 * v8-shaped (articoli/partitivos ya reseteados durante la cadena) o es un
 * import directo v8 que debe preservarse íntegro. Precedente: `hydrateV7` no
 * re-ejecuta la lógica de `migrate6to7`, solo garantiza shape.
 *
 * Deep-clone defensivo (CR-03 / T-18-01): igual que `migrate7to8` y `hydrateV7`.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 8`.
 * @returns {object} Estado v8 con campos garantizados.
 */
export function hydrateV8(parsed) {
  return {
    schemaVersion: 8,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}

/**
 * Prefijos de id de categoría que `migrate8to9` resetea (D-21 / MIG-03). Son
 * las SEIS categorías que se reagrupan a slots+variantes en las Phases 22-27:
 * avere, essere, verbos-movimiento, genero-numero, profesiones,
 * sustantivos-irregulares.
 *
 * Gate de colisión de prefijo (verificado contra content/categories.json,
 * 2026-06-05): las 3 categorías ya convertidas (`preposiciones`, `articoli`,
 * `partitivos`) NO empiezan por ninguno de estos 6 prefijos, y ningún prefijo
 * de reset es prefijo de otro slug. El filtro `startsWith` no tiene colisiones
 * y preserva las 3 byte a byte. (Espejo de D-03 en Phase 18, ahora con 6.)
 */
const RESET_PREFIXES_V9 = ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares'];

/**
 * Migra un estado v8 a v9 (D-21 / MIG-03). Espejo LITERAL de `migrate7to8`
 * (Phase 18) con UNA desviación funcional: el reset selectivo opera sobre SEIS
 * prefijos de id de categoría (`RESET_PREFIXES_V9`) en vez de dos (`articoli` +
 * `partitivos`). Deja libre la renumeración de ids que harán las Phases 22-27 —
 * no se puede renumerar con progreso vivo. El progreso de las 6 categorías a
 * convertir se resetea por diseño (Core Value: re-verificación).
 *
 * Seguridad de prefijo (gate de colisión): las 3 categorías ya convertidas
 * (`preposiciones`, `articoli`, `partitivos`) NO empiezan por ninguno de los 6
 * prefijos de `RESET_PREFIXES_V9`, así que el filtro `startsWith` no tiene
 * colisiones y las preserva byte a byte.
 *
 * Reset por prefijo (no por igualdad exacta) cubre tanto los ids legacy como
 * los nuevos ids de slot que producirán las Phases 22-27 (seguirán empezando
 * por su prefijo de categoría).
 *
 * Idempotencia + pureza (T-21-02): NO muta el input. Re-ejecutar sobre un v9 ya
 * migrado produce la misma shape (las 6 ya ausentes → `delete` y filtro son
 * no-op; `inFlightTest` ya invalidado o ajeno → se preserva).
 *
 * Exportada para testabilidad — el dispatcher la usa como eslabón v8 → v9.
 *
 * @param {object} v8 - Estado parseado con `schemaVersion: 8`.
 * @returns {object} Estado normalizado v9 con las 6 categorías reseteadas.
 */
export function migrate8to9(v8) {
  // (1) Reset de categoryProgress de las 6 categorías tras deep-clone defensivo.
  const categoryProgress = (typeof v8.categoryProgress === 'object' && v8.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v8.categoryProgress))
    : {};
  delete categoryProgress.avere;
  delete categoryProgress.essere;
  delete categoryProgress['verbos-movimiento'];
  delete categoryProgress['genero-numero'];
  delete categoryProgress.profesiones;
  delete categoryProgress['sustantivos-irregulares'];

  // (2) Poda por prefijo de exerciseStats (cualquiera de los 6) tras deep-clone.
  const exerciseStatsAll = (typeof v8.exerciseStats === 'object' && v8.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v8.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!RESET_PREFIXES_V9.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de cualquiera de las 6 (Pitfall 3).
  //     Reconstrucción condicional sin mutar el input (estilo migrate3to4).
  let inFlightTest = v8.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && RESET_PREFIXES_V9.some(p => id.startsWith(p)))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 9,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v8.dailyLog === 'object' && v8.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v8.dailyLog))
      : {},
    songProgress: (typeof v8.songProgress === 'object' && v8.songProgress !== null)
      ? JSON.parse(JSON.stringify(v8.songProgress))
      : {},
    lastBackupAt: typeof v8.lastBackupAt === 'string' ? v8.lastBackupAt : null,
    firstUsedAt: typeof v8.firstUsedAt === 'string' ? v8.firstUsedAt : null,
    inFlightTest
  };
}

/**
 * Hidrata un estado v9 ya en disco con type-guards defensivos en cada
 * sub-objeto. Espejo LITERAL de `hydrateV8` (Phase 18) con la versión a 9 — el
 * shape v9 root es idéntico a v8 (el bump 8 → 9 es nominal a nivel del shape;
 * la diferencia efectiva, el reset de las 6 categorías, la hace `migrate8to9`
 * durante la cadena).
 *
 * NO repite la poda de `migrate8to9`: un state que llega a `hydrateV9` ya viene
 * v9-shaped (las 6 ya reseteadas durante la cadena) o es un import directo v9
 * que debe preservarse íntegro. Precedente: `hydrateV8` no re-ejecuta la lógica
 * de `migrate7to8`, solo garantiza shape.
 *
 * Deep-clone defensivo (T-21-01): igual que `migrate8to9` y `hydrateV8`.
 *
 * Exportada para testabilidad — invocada al final de la cadena de migración.
 *
 * @param {object} parsed - Estado parseado con `schemaVersion: 9`.
 * @returns {object} Estado v9 con campos garantizados.
 */
export function hydrateV9(parsed) {
  return {
    schemaVersion: 9,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(parsed.exerciseStats))
      : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.categoryProgress))
      : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null)
      ? JSON.parse(JSON.stringify(parsed.dailyLog))
      : {},
    songProgress: (typeof parsed.songProgress === 'object' && parsed.songProgress !== null)
      ? JSON.parse(JSON.stringify(parsed.songProgress))
      : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  };
}
