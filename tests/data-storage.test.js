// tests/data-storage.test.js
//
// Tests de las funciones puras de migración expuestas por `src/data/storage.js`.
// NO tocamos `loadState`/`saveState` (esos llaman a `localStorage`, que no
// existe en el runtime de `node --test`). Cubrimos:
//
//   - `blankState()` produce el shape v4 esperado (Phase 6 bump nominal).
//   - `migrate1to2(v1)` preserva `exerciseStats` íntegro y añade los campos
//     nuevos (`categoryProgress`, `dailyLog`) vacíos.
//   - `migrate1to2` es defensivo ante `exerciseStats` malformado.
//   - `hydrateV2(parsed)` preserva los 4 sub-objetos de un estado v2 válido.
//   - `hydrateV2` es defensivo ante sub-objetos malformados (null, no-object).
//   - `migrate2to3` / `hydrateV3` (Phase 4) y `migrate3to4` / `hydrateV4`
//     (Phase 6) preservan sub-objetos íntegros y aplican backfill defensivo
//     en `inFlightTest.answers` (D-111 + WR-03).
//   - `blankState()` codifica `schemaVersion: 4` (Phase 6 bump nominal — el
//     shape root es idéntico a v3; sólo cambia el shape interno de
//     `inFlightTest.answers[]` que añade `userAnswer`).
//
// Estos tests verifican las decisiones D-46 (migración 1→2), D-47
// (inicialización lazy — `categoryProgress` arranca `{}`), D-77/D-78
// (Phase 4 lastBackupAt/firstUsedAt), y D-111 (Phase 6 v4 nominal bump
// + backfill userAnswer).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { blankState, migrate1to2, hydrateV2, migrate2to3, hydrateV3, migrate3to4, hydrateV4, migrate4to5, hydrateV5 } from '../src/data/storage.js';

// Phase 4 (D-77/D-78): bumped schemaVersion from 2 → 3 con dos campos
// nuevos (lastBackupAt, firstUsedAt). El "blankState v2" describe-name
// se conserva por estabilidad histórica, pero los asserts apuntan a v3
// (la realidad actual). Tests adicionales de la cadena v1→v2→v3 viven
// en `tests/backup.test.js` (co-located con backup.js Phase 4).

describe('data/storage — blankState v5 (Phase 13 bump)', () => {
  test('blankState() devuelve shape v5 completo con songProgress {} + lastBackupAt/firstUsedAt null', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 5);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    assert.deepEqual(s.songProgress, {});   // NEW Phase 13
    assert.equal(s.lastBackupAt, null);
    assert.equal(s.firstUsedAt, null);
    // `inFlightTest` debe estar omitido (undefined), no presente como key.
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false,
      'blankState() no debería incluir la clave `inFlightTest` (debe ser omitida)');
  });

  test('blankState() codifica schemaVersion: 5 (Phase 13 bump)', () => {
    assert.equal(blankState().schemaVersion, 5);
  });
});

describe('data/storage v3 — migrate2to3 chain + hydrateV3 (Phase 4)', () => {
  test('migrate2to3 sobre v2 fresh produce v3 con campos nuevos null + sub-objetos preservados', () => {
    const v2 = {
      schemaVersion: 2,
      exerciseStats: { a: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {},
      dailyLog: {}
    };
    const v3 = migrate2to3(v2);
    assert.equal(v3.schemaVersion, 3);
    assert.deepEqual(v3.exerciseStats, v2.exerciseStats);
    assert.equal(v3.lastBackupAt, null);
    assert.equal(v3.firstUsedAt, null);
  });

  test('hydrateV3 sobre v3 válido preserva todos los campos', () => {
    const v3In = {
      schemaVersion: 3,
      exerciseStats: { x: { timesShown: 2, timesCorrect: 2, timesFailed: 0 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['x'], lastSuccessDate: '2026-05-23' } },
      dailyLog: { '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-05-01T08:00:00.000Z'
    };
    const out = hydrateV3(v3In);
    assert.equal(out.schemaVersion, 3);
    assert.deepEqual(out.exerciseStats, v3In.exerciseStats);
    assert.deepEqual(out.categoryProgress, v3In.categoryProgress);
    assert.deepEqual(out.dailyLog, v3In.dailyLog);
    assert.equal(out.lastBackupAt, v3In.lastBackupAt);
    assert.equal(out.firstUsedAt, v3In.firstUsedAt);
  });
});

describe('data/storage — migrate1to2', () => {
  test('migra v1 preservando exerciseStats íntegro', () => {
    const v1 = {
      schemaVersion: 1,
      exerciseStats: {
        a1: { timesShown: 5, timesCorrect: 3, timesFailed: 2 },
        a2: { timesShown: 1, timesCorrect: 0, timesFailed: 1 }
      }
    };
    const v2 = migrate1to2(v1);
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, v1.exerciseStats);
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });

  test('migra v1 con exerciseStats null defensivamente (sin crashear)', () => {
    const v2 = migrate1to2({ schemaVersion: 1, exerciseStats: null });
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, {});
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });

  test('migra v1 con exerciseStats ausente (campo undefined) sin crashear', () => {
    const v2 = migrate1to2({ schemaVersion: 1 });
    assert.equal(v2.schemaVersion, 2);
    assert.deepEqual(v2.exerciseStats, {});
    assert.deepEqual(v2.categoryProgress, {});
    assert.deepEqual(v2.dailyLog, {});
  });
});

describe('data/storage — hydrateV2', () => {
  test('preserva los 4 sub-objetos íntegros sin reset', () => {
    const input = {
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {
        avere: {
          status: 'hecha',
          clearedExerciseIds: ['a1'],
          streakDays: 3,
          lastSuccessDate: '2026-05-23'
        }
      },
      dailyLog: {
        '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] }
      },
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1', 'a2'],
        cursor: 1,
        answers: [{ exerciseId: 'a1', correct: true }],
        startedAt: 1716480000000
      }
    };
    const out = hydrateV2(input);
    assert.equal(out.schemaVersion, 2);
    assert.deepEqual(out.exerciseStats, input.exerciseStats);
    assert.deepEqual(out.categoryProgress, input.categoryProgress);
    assert.deepEqual(out.dailyLog, input.dailyLog);
    assert.deepEqual(out.inFlightTest, input.inFlightTest);
  });

  test('campos malformados (null) defaults a objeto vacío', () => {
    const out = hydrateV2({
      schemaVersion: 2,
      exerciseStats: null,
      categoryProgress: null,
      dailyLog: null,
      inFlightTest: undefined
    });
    assert.equal(out.schemaVersion, 2);
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.equal(out.inFlightTest, undefined);
  });

  test('inFlightTest=undefined se preserva (no se materializa una clave)', () => {
    const out = hydrateV2({
      schemaVersion: 2,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {}
      // sin inFlightTest
    });
    assert.equal(out.inFlightTest, undefined);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 6 (D-111) — migrate3to4 + hydrateV4 chain
//
// Bump nominal v3 → v4 — el shape root es idéntico; la diferencia es el
// backfill defensivo de `userAnswer: null` en cada entry de
// `inFlightTest.answers[]` pre-Phase 6. Idempotente sobre valores existentes
// (un userAnswer ya presente se preserva).
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v4 — migrate3to4 chain + hydrateV4 (Phase 6)', () => {
  test('migrate3to4 sobre v3 fresh produce v4 preservando sub-objetos íntegros', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: { a1: { timesShown: 2, timesCorrect: 1, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 3, clearedExerciseIds: ['a1'], lastSuccessDate: '2026-05-20' } },
      dailyLog: { '2026-05-20': { date: '2026-05-20', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
      // sin inFlightTest
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.deepEqual(v4.exerciseStats, v3.exerciseStats);
    assert.deepEqual(v4.categoryProgress, v3.categoryProgress);
    assert.deepEqual(v4.dailyLog, v3.dailyLog);
    assert.equal(v4.lastBackupAt, v3.lastBackupAt);
    assert.equal(v4.firstUsedAt, v3.firstUsedAt);
    assert.equal(v4.inFlightTest, undefined,
      'inFlightTest undefined del v3 se preserva como undefined en v4 (sin materializar la clave)');
  });

  test('migrate3to4 backfillea userAnswer:null en inFlightTest.answers pre-Phase 6', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1', 'a2', 'a3'],
        cursor: 2,
        answers: [
          { exerciseId: 'a1', correct: true },          // sin userAnswer pre-Phase 6
          { exerciseId: 'a2', correct: false }          // sin userAnswer pre-Phase 6
        ],
        startedAt: 1716480000000
      }
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    // Verificar backfill defensivo: cada answer post-migración tiene userAnswer === null.
    assert.equal(v4.inFlightTest.answers.length, 2);
    assert.equal(v4.inFlightTest.answers[0].userAnswer, null);
    assert.equal(v4.inFlightTest.answers[1].userAnswer, null);
    // El resto de los campos de cada answer y del inFlightTest se preservan.
    assert.equal(v4.inFlightTest.answers[0].exerciseId, 'a1');
    assert.equal(v4.inFlightTest.answers[0].correct, true);
    assert.equal(v4.inFlightTest.answers[1].exerciseId, 'a2');
    assert.equal(v4.inFlightTest.answers[1].correct, false);
    assert.deepEqual(v4.inFlightTest.exerciseIds, ['a1', 'a2', 'a3']);
    assert.equal(v4.inFlightTest.cursor, 2);
    assert.equal(v4.inFlightTest.startedAt, 1716480000000);
    assert.deepEqual(v4.inFlightTest.categoryIds, ['avere']);
  });

  test('migrate3to4 idempotente sobre userAnswer ya presente (preserva el valor)', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1'],
        cursor: 1,
        answers: [
          // userAnswer YA presente (e.g. backup editado a mano o doble-migración) — debe preservarse.
          { exerciseId: 'a1', correct: false, userAnswer: 'hai' }
        ],
        startedAt: 1716480000000
      }
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.equal(v4.inFlightTest.answers[0].userAnswer, 'hai',
      'userAnswer string existente se preserva tal cual (no se sobreescribe con null)');
    assert.equal(v4.inFlightTest.answers[0].exerciseId, 'a1');
    assert.equal(v4.inFlightTest.answers[0].correct, false);
  });

  test('migrate3to4 sin inFlightTest (state limpio) no crashea + preserva undefined', () => {
    const v3 = {
      ...blankState(),
      schemaVersion: 3  // forzar schemaVersion=3 sobre el shape blank v4 (en el ejecutor real
                       // este input sólo aparecería tras un loadState de un state pre-Phase 6).
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.equal(v4.inFlightTest, undefined,
      'state limpio sin inFlightTest → migración no añade la clave artificialmente');
    assert.deepEqual(v4.exerciseStats, {});
    assert.deepEqual(v4.categoryProgress, {});
    assert.deepEqual(v4.dailyLog, {});
  });

  // WR-03 fix — defensa contra inFlightTest.answers corrupto (no-array).
  //
  // Antes del fix: si `v3.inFlightTest.answers` era null/undefined/string/etc
  // (corrupción por edición manual del localStorage), `migrate3to4` saltaba
  // el branch del backfill y dejaba `newInFlightTest = v3.inFlightTest` con
  // el shape corrupto. Luego `resumeInFlightTest()` hacía `[...ift.answers]`
  // y lanzaba `TypeError: not iterable`.
  //
  // Tras el fix: si `inFlightTest` existe como objeto, `answers` se normaliza
  // a `[]` cuando no es array antes del backfill. El state v4 post-migración
  // siempre tiene `answers` array iterable.
  test('WR-03: migrate3to4 normaliza inFlightTest.answers = null → []', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1', 'a2'],
        cursor: 0,
        answers: null,            // ← corrupción simulada
        startedAt: 1716480000000
      }
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.ok(Array.isArray(v4.inFlightTest.answers),
      'WR-03: answers normalizado a array iterable tras la migración (no era array en input)');
    assert.equal(v4.inFlightTest.answers.length, 0);
    // El resto del shape se preserva.
    assert.deepEqual(v4.inFlightTest.exerciseIds, ['a1', 'a2']);
    assert.equal(v4.inFlightTest.cursor, 0);
  });

  test('WR-03: migrate3to4 normaliza inFlightTest.answers = string → []', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['essere'],
        exerciseIds: ['e1'],
        cursor: 0,
        answers: '[]',           // ← string, no array (edición manual mal-formada)
        startedAt: 1716480000000
      }
    };
    const v4 = migrate3to4(v3);
    assert.ok(Array.isArray(v4.inFlightTest.answers),
      'WR-03: answers string-JSON se normaliza a array vacío (no parsea — guard estricto)');
    assert.equal(v4.inFlightTest.answers.length, 0);
  });

  test('WR-03: migrate3to4 normaliza inFlightTest.answers ausente → []', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1'],
        cursor: 0
        // answers ausente totalmente (edición manual incompleta)
      }
    };
    const v4 = migrate3to4(v3);
    assert.ok(Array.isArray(v4.inFlightTest.answers),
      'WR-03: answers ausente se normaliza a array vacío');
    assert.equal(v4.inFlightTest.answers.length, 0);
  });

  test('hydrateV4 sobre v4 válido preserva todos los campos + reconstruye con literal anti-pollution', () => {
    const v4In = {
      schemaVersion: 4,
      exerciseStats: { x: { timesShown: 2, timesCorrect: 2, timesFailed: 0 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['x'], lastSuccessDate: '2026-05-23' } },
      dailyLog: { '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-05-01T08:00:00.000Z',
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['x'],
        cursor: 0,
        answers: [],
        startedAt: 1716480000000
      }
    };
    const out = hydrateV4(v4In);
    assert.equal(out.schemaVersion, 4);
    assert.deepEqual(out.exerciseStats, v4In.exerciseStats);
    assert.deepEqual(out.categoryProgress, v4In.categoryProgress);
    assert.deepEqual(out.dailyLog, v4In.dailyLog);
    assert.equal(out.lastBackupAt, v4In.lastBackupAt);
    assert.equal(out.firstUsedAt, v4In.firstUsedAt);
    assert.deepEqual(out.inFlightTest, v4In.inFlightTest);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 13 (D-02/D-03) — migrate4to5 + hydrateV5 chain + songProgress sub-árbol
//
// Bump v4 → v5: añade el sub-árbol `songProgress` (estado por canción, plano:
// { status, lastPlayedAt? }). Deep-clone defensivo por sub-dict (CR-03 /
// T-13-01). El estado de canción NO es sticky (no streak / no dominada).
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v5 — migrate4to5 chain + hydrateV5 (Phase 13)', () => {
  test('migrate4to5 sobre v4 fresh produce v5 con songProgress {} + sub-objetos íntegros', () => {
    const v4 = {
      schemaVersion: 4,
      exerciseStats: { a1: { timesShown: 2, timesCorrect: 1, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 3, clearedExerciseIds: ['a1'], lastSuccessDate: '2026-05-20' } },
      dailyLog: { '2026-05-20': { date: '2026-05-20', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
      // sin songProgress (state pre-Phase 13) — debe arrancar {}
    };
    const v5 = migrate4to5(v4);
    assert.equal(v5.schemaVersion, 5);
    assert.deepEqual(v5.exerciseStats, v4.exerciseStats);
    assert.deepEqual(v5.categoryProgress, v4.categoryProgress);
    assert.deepEqual(v5.dailyLog, v4.dailyLog);
    assert.deepEqual(v5.songProgress, {}, 'songProgress arranca {} cuando no existe en v4');
    assert.equal(v5.lastBackupAt, v4.lastBackupAt);
    assert.equal(v5.firstUsedAt, v4.firstUsedAt);
    assert.equal(v5.inFlightTest, undefined,
      'inFlightTest undefined del v4 se preserva como undefined en v5');
  });

  test('migrate4to5 preserva songProgress existente con deep-clone (no comparte referencia)', () => {
    const v4 = {
      schemaVersion: 4,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      songProgress: { 'mini-prueba': { status: 'fallada', lastPlayedAt: '2026-06-01' } },
      lastBackupAt: null,
      firstUsedAt: null
    };
    const v5 = migrate4to5(v4);
    assert.deepEqual(v5.songProgress, { 'mini-prueba': { status: 'fallada', lastPlayedAt: '2026-06-01' } });
    assert.notEqual(v5.songProgress, v4.songProgress, 'deep-clone: no comparte la referencia del sub-dict');
    assert.notEqual(v5.songProgress['mini-prueba'], v4.songProgress['mini-prueba'],
      'deep-clone: las entradas anidadas tampoco comparten referencia (CR-03)');
  });

  test('migrate4to5 con songProgress no-objeto (corrupto) cae a {}', () => {
    for (const bad of [null, 'x', 42, []]) {
      const v4 = { schemaVersion: 4, exerciseStats: {}, categoryProgress: {}, dailyLog: {}, songProgress: bad, lastBackupAt: null, firstUsedAt: null };
      const v5 = migrate4to5(v4);
      // Arrays son typeof 'object' → se clonan tal cual; null/string/number → {}.
      // El contrato es: songProgress siempre es un objeto navegable.
      assert.equal(typeof v5.songProgress, 'object');
      assert.notEqual(v5.songProgress, null);
    }
  });

  test('migrate4to5 anti-prototype-pollution: __proto__ como own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":4,"exerciseStats":{},"categoryProgress":{},"dailyLog":{},"songProgress":{"__proto__":{"polluted":true}},"lastBackupAt":null,"firstUsedAt":null}');
    const v5 = migrate4to5(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(v5.schemaVersion, 5);
  });

  test('hydrateV5 sobre v5 válido preserva todos los campos incluido songProgress', () => {
    const v5In = {
      schemaVersion: 5,
      exerciseStats: { x: { timesShown: 2, timesCorrect: 2, timesFailed: 0 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['x'], lastSuccessDate: '2026-05-23' } },
      dailyLog: { '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-05-01T08:00:00.000Z',
      inFlightTest: { categoryIds: ['avere'], exerciseIds: ['x'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const out = hydrateV5(v5In);
    assert.equal(out.schemaVersion, 5);
    assert.deepEqual(out.exerciseStats, v5In.exerciseStats);
    assert.deepEqual(out.categoryProgress, v5In.categoryProgress);
    assert.deepEqual(out.dailyLog, v5In.dailyLog);
    assert.deepEqual(out.songProgress, v5In.songProgress);
    assert.notEqual(out.songProgress, v5In.songProgress, 'deep-clone defensivo');
    assert.equal(out.lastBackupAt, v5In.lastBackupAt);
    assert.equal(out.firstUsedAt, v5In.firstUsedAt);
    assert.deepEqual(out.inFlightTest, v5In.inFlightTest);
  });

  test('hydrateV5 sobre v5 con songProgress ausente lo normaliza a {}', () => {
    const out = hydrateV5({ schemaVersion: 5, exerciseStats: {}, categoryProgress: {}, dailyLog: {}, lastBackupAt: null, firstUsedAt: null });
    assert.deepEqual(out.songProgress, {});
  });

  // Cadena completa: un blob v4 antiguo (con datos) pasado por migrate4to5 +
  // hydrateV5 sale v5, songProgress:{}, y categoryProgress preservado — el
  // criterio de aceptación del Task 2 (loadState de un v4 antiguo no pierde
  // datos previos). Aquí ejercemos la composición de los dos eslabones (el
  // dispatcher `migrate()` es privado; backup.test.js cubre la cadena 1→5 vía
  // parseBackupFile).
  test('cadena v4 → v5: un blob v4 con datos preserva categoryProgress y añade songProgress {}', () => {
    const v4 = {
      schemaVersion: 4,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 4, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 7, clearedExerciseIds: ['a1'] } },
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const v5 = hydrateV5(migrate4to5(v4));
    assert.equal(v5.schemaVersion, 5);
    assert.deepEqual(v5.songProgress, {});
    assert.deepEqual(v5.categoryProgress.avere, v4.categoryProgress.avere,
      'categoryProgress preservado a través de la migración v4 → v5');
    assert.deepEqual(v5.exerciseStats, v4.exerciseStats);
    assert.equal(v5.firstUsedAt, v4.firstUsedAt);
  });
});
