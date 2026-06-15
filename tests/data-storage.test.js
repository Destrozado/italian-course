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

import { blankState, migrate1to2, hydrateV2, migrate2to3, hydrateV3, migrate3to4, hydrateV4, migrate4to5, hydrateV5, migrate5to6, hydrateV6, migrate6to7, hydrateV7, migrate7to8, hydrateV8, migrate8to9, hydrateV9, migrate9to10, hydrateV10 } from '../src/data/storage.js';

// Phase 4 (D-77/D-78): bumped schemaVersion from 2 → 3 con dos campos
// nuevos (lastBackupAt, firstUsedAt). El "blankState v2" describe-name
// se conserva por estabilidad histórica, pero los asserts apuntan a v3
// (la realidad actual). Tests adicionales de la cadena v1→v2→v3 viven
// en `tests/backup.test.js` (co-located con backup.js Phase 4).

describe('data/storage — blankState v10 (quick-260615-nzi nominal bump)', () => {
  test('blankState() devuelve shape v10 completo con el mismo set de sub-dicts + lastBackupAt/firstUsedAt null', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 10);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    assert.deepEqual(s.songProgress, {});   // mismo set de sub-dicts que v5 (D-15-09)
    assert.equal(s.lastBackupAt, null);
    assert.equal(s.firstUsedAt, null);
    // `inFlightTest` debe estar omitido (undefined), no presente como key.
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false,
      'blankState() no debería incluir la clave `inFlightTest` (debe ser omitida)');
  });

  test('blankState() codifica schemaVersion: 10 (quick-260615-nzi bump nominal)', () => {
    assert.equal(blankState().schemaVersion, 10);
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

// ────────────────────────────────────────────────────────────────────────────
// Phase 15 (D-15-08/D-15-09 / SLOT-05) — migrate5to6 + hydrateV6 chain
//
// Bump v5 → v6 NOMINAL a nivel del state root (D-15-09): el modelo
// slot+variantes vive en content/, NO en el state. exerciseStats sigue keyed
// por id de ejercicio-slot; el set de sub-dicts NO cambia (mismo que v5, sin
// sub-árbol nuevo). Espejo literal de migrate4to5/hydrateV5 (Phase 13) con la
// versión a 6 y SIN la línea "NEW sub-árbol" (songProgress ya no es nuevo).
// Deep-clone defensivo por sub-dict (CR-03 / T-04-02 anti-prototype-pollution),
// precedente de bump nominal 3→4 (D-110/D-111). Sin reset de progreso
// (Preposiciones reset es Phase 17).
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v6 — migrate5to6 chain + hydrateV6 (Phase 15)', () => {
  test('migrate5to6 sobre v5 fresh produce v6 con el mismo set de sub-dicts íntegros', () => {
    const v5 = {
      schemaVersion: 5,
      exerciseStats: { a1: { timesShown: 2, timesCorrect: 1, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 3, clearedExerciseIds: ['a1'], lastSuccessDate: '2026-05-20' } },
      dailyLog: { '2026-05-20': { date: '2026-05-20', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const v6 = migrate5to6(v5);
    assert.equal(v6.schemaVersion, 6);
    assert.deepEqual(v6.exerciseStats, v5.exerciseStats);
    assert.deepEqual(v6.categoryProgress, v5.categoryProgress);
    assert.deepEqual(v6.dailyLog, v5.dailyLog);
    assert.deepEqual(v6.songProgress, v5.songProgress);
    assert.equal(v6.lastBackupAt, v5.lastBackupAt);
    assert.equal(v6.firstUsedAt, v5.firstUsedAt);
    assert.equal(v6.inFlightTest, undefined,
      'inFlightTest undefined del v5 se preserva como undefined en v6');
  });

  test('migrate5to6 preserva un sub-dict existente con deep-clone (no comparte referencia)', () => {
    const v5 = {
      schemaVersion: 5,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 4, timesFailed: 1 } },
      categoryProgress: {},
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: null
    };
    const v6 = migrate5to6(v5);
    assert.deepEqual(v6.exerciseStats, { a1: { timesShown: 5, timesCorrect: 4, timesFailed: 1 } });
    assert.notEqual(v6.exerciseStats, v5.exerciseStats, 'deep-clone: no comparte la referencia del sub-dict (CR-03)');
    assert.notEqual(v6.exerciseStats['a1'], v5.exerciseStats['a1'],
      'deep-clone: las entradas anidadas tampoco comparten referencia (CR-03)');
  });

  test('migrate5to6 con sub-dict no-objeto (corrupto) cae a {}', () => {
    for (const bad of [null, 'x', 42]) {
      const v5 = { schemaVersion: 5, exerciseStats: bad, categoryProgress: bad, dailyLog: bad, songProgress: bad, lastBackupAt: null, firstUsedAt: null };
      const v6 = migrate5to6(v5);
      // null/string/number → {}; el contrato es: cada sub-dict siempre es un objeto navegable.
      for (const key of ['exerciseStats', 'categoryProgress', 'dailyLog', 'songProgress']) {
        assert.equal(typeof v6[key], 'object');
        assert.notEqual(v6[key], null);
      }
    }
  });

  test('migrate5to6 anti-prototype-pollution: __proto__ como own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":5,"exerciseStats":{"__proto__":{"polluted":true}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
    const v6 = migrate5to6(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(v6.schemaVersion, 6);
  });

  test('migrate5to6 es idempotente (re-ejecutar produce shape idéntica)', () => {
    const v5 = {
      schemaVersion: 5,
      exerciseStats: { a1: { timesShown: 2, timesCorrect: 1, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 3, clearedExerciseIds: ['a1'] } },
      dailyLog: {},
      songProgress: { 'mini-prueba': { status: 'pasada' } },
      lastBackupAt: null,
      firstUsedAt: null
    };
    const once = migrate5to6(v5);
    const twice = migrate5to6(once);
    assert.deepEqual(twice, once, 'migrate5to6(migrate5to6(x)) === migrate5to6(x) en shape');
  });

  test('hydrateV6 sobre v6 válido preserva todos los campos con deep-clone defensivo', () => {
    const v6In = {
      schemaVersion: 6,
      exerciseStats: { x: { timesShown: 2, timesCorrect: 2, timesFailed: 0 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['x'], lastSuccessDate: '2026-05-23' } },
      dailyLog: { '2026-05-23': { date: '2026-05-23', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-05-01T08:00:00.000Z',
      inFlightTest: { categoryIds: ['avere'], exerciseIds: ['x'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const out = hydrateV6(v6In);
    assert.equal(out.schemaVersion, 6);
    assert.deepEqual(out.exerciseStats, v6In.exerciseStats);
    assert.notEqual(out.exerciseStats, v6In.exerciseStats, 'deep-clone defensivo');
    assert.deepEqual(out.categoryProgress, v6In.categoryProgress);
    assert.deepEqual(out.dailyLog, v6In.dailyLog);
    assert.deepEqual(out.songProgress, v6In.songProgress);
    assert.notEqual(out.songProgress, v6In.songProgress, 'deep-clone defensivo');
    assert.equal(out.lastBackupAt, v6In.lastBackupAt);
    assert.equal(out.firstUsedAt, v6In.firstUsedAt);
    assert.deepEqual(out.inFlightTest, v6In.inFlightTest);
  });

  test('hydrateV6 sobre v6 con sub-dicts ausentes los normaliza a {}', () => {
    const out = hydrateV6({ schemaVersion: 6, lastBackupAt: null, firstUsedAt: null });
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.deepEqual(out.songProgress, {});
  });

  test('blankState() ahora schemaVersion 10 con el mismo set de sub-dicts', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 10);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    assert.deepEqual(s.songProgress, {});
    assert.equal(s.lastBackupAt, null);
    assert.equal(s.firstUsedAt, null);
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false);
  });

  // Cadena completa: un blob v5 antiguo pasado por migrate5to6 + hydrateV6 sale
  // v6, mismo set de sub-dicts, y categoryProgress/exerciseStats preservados.
  test('cadena v5 → v6: un blob v5 con datos preserva categoryProgress/exerciseStats y bumpea a 6', () => {
    const v5 = {
      schemaVersion: 5,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 4, timesFailed: 1 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 7, clearedExerciseIds: ['a1'] } },
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada' } },
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const v6 = hydrateV6(migrate5to6(v5));
    assert.equal(v6.schemaVersion, 6);
    assert.deepEqual(v6.categoryProgress.avere, v5.categoryProgress.avere,
      'categoryProgress preservado a través de la migración v5 → v6');
    assert.deepEqual(v6.exerciseStats, v5.exerciseStats);
    assert.deepEqual(v6.songProgress, v5.songProgress);
    assert.equal(v6.firstUsedAt, v5.firstUsedAt);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 17 (D-17-08 / PILOT-04) — migrate6to7 + hydrateV7 chain (RESET Preposiciones)
//
// Bump v6 → v7 NOMINAL a nivel del state root, PERO con una poda quirúrgica:
// migrate6to7 resetea SOLO el progreso de Preposiciones —
//   (1) delete categoryProgress.preposiciones,
//   (2) poda exerciseStats con prefijo 'preposiciones',
//   (3) invalida inFlightTest si referencia ids de Preposiciones —
// dejando las otras 8 categorías (+ dailyLog + songProgress + timestamps)
// byte-intactas. hydrateV7 es espejo LITERAL de hydrateV6 con versión 7, SIN
// poda (un state que llega a hydrateV7 ya viene v7-shaped). Deep-clone
// defensivo anti-prototype-pollution preservado (CR-03 / T-04-02 / T-17-01),
// idempotente + puro (T-17-02).
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v7 — migrate6to7 reset selectivo de Preposiciones (Phase 17)', () => {
  // Helper: un v6 con progreso en Preposiciones + otras categorías.
  function v6WithPreposiciones() {
    return {
      schemaVersion: 6,
      exerciseStats: {
        'preposiciones-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'preposiciones-052': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
        'partitivos-001': { timesShown: 2, timesCorrect: 1, timesFailed: 1 }
      },
      categoryProgress: {
        preposiciones: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-05-30' },
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' }
      },
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['preposiciones', 'avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('migrate6to7 borra categoryProgress.preposiciones y deja avere intacto', () => {
    const v6 = v6WithPreposiciones();
    const v7 = migrate6to7(v6);
    assert.equal(v7.schemaVersion, 7);
    assert.equal(v7.categoryProgress.preposiciones, undefined,
      'categoryProgress.preposiciones debe quedar ausente tras el reset');
    assert.equal(Object.prototype.hasOwnProperty.call(v7.categoryProgress, 'preposiciones'), false,
      'la clave preposiciones no debe existir como own-property');
    assert.deepEqual(v7.categoryProgress.avere, v6.categoryProgress.avere,
      'avere conserva su progreso byte-intacto');
  });

  test('migrate6to7 poda exerciseStats con prefijo preposiciones y preserva avere/partitivos', () => {
    const v6 = v6WithPreposiciones();
    const v7 = migrate6to7(v6);
    assert.equal(v7.exerciseStats['preposiciones-001'], undefined);
    assert.equal(v7.exerciseStats['preposiciones-052'], undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(v7.exerciseStats, 'preposiciones-001'), false);
    assert.deepEqual(v7.exerciseStats['avere-001'], v6.exerciseStats['avere-001']);
    assert.deepEqual(v7.exerciseStats['partitivos-001'], v6.exerciseStats['partitivos-001']);
  });

  test('migrate6to7 invalida inFlightTest que referencia ids de Preposiciones', () => {
    const v6 = v6WithPreposiciones();
    v6.inFlightTest = {
      categoryIds: ['preposiciones'],
      exerciseIds: ['preposiciones-006', 'avere-001'],
      variantIndices: [0, 0],
      cursor: 0,
      answers: [],
      startedAt: 1716480000000
    };
    const v7 = migrate6to7(v6);
    assert.equal(v7.inFlightTest, undefined,
      'un Test en vuelo que toca Preposiciones se invalida al migrar');
  });

  test('migrate6to7 preserva inFlightTest que NO toca Preposiciones', () => {
    const v6 = v6WithPreposiciones();
    v6.inFlightTest = {
      categoryIds: ['avere'],
      exerciseIds: ['avere-001', 'partitivos-001'],
      variantIndices: [0, 0],
      cursor: 1,
      answers: [],
      startedAt: 1716480000000
    };
    const v7 = migrate6to7(v6);
    assert.deepEqual(v7.inFlightTest, v6.inFlightTest,
      'un Test en vuelo ajeno a Preposiciones se preserva');
  });

  test('migrate6to7 sin inFlightTest no crashea y preserva undefined', () => {
    const v6 = v6WithPreposiciones();
    const v7 = migrate6to7(v6);
    assert.equal(v7.inFlightTest, undefined);
  });

  test('migrate6to7 es idempotente (re-ejecutar sobre un v7 ya migrado da la misma shape)', () => {
    const v6 = v6WithPreposiciones();
    const once = migrate6to7(v6);
    const twice = migrate6to7(once);
    assert.deepEqual(twice, once,
      'migrate6to7(migrate6to7(x)) deep-equals migrate6to7(x) — delete de clave ausente es no-op');
  });

  test('migrate6to7 es puro (no muta el input — preposiciones sigue presente en el v6 original)', () => {
    const v6 = v6WithPreposiciones();
    migrate6to7(v6);
    assert.ok(v6.categoryProgress.preposiciones,
      'el input v6 NO debe mutarse: categoryProgress.preposiciones sigue presente');
    assert.ok(v6.exerciseStats['preposiciones-001'],
      'el input v6 NO debe mutarse: exerciseStats[preposiciones-001] sigue presente');
  });

  test('migrate6to7 anti-prototype-pollution: __proto__ own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":6,"exerciseStats":{"__proto__":{"polluted":true},"avere-001":{"timesShown":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
    const v7 = migrate6to7(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(v7.schemaVersion, 7);
  });

  test('migrate6to7 con sub-dict no-objeto (corrupto) cae a {}', () => {
    for (const bad of [null, 'x', 42]) {
      const v6 = { schemaVersion: 6, exerciseStats: bad, categoryProgress: bad, dailyLog: bad, songProgress: bad, lastBackupAt: null, firstUsedAt: null };
      const v7 = migrate6to7(v6);
      for (const key of ['exerciseStats', 'categoryProgress', 'dailyLog', 'songProgress']) {
        assert.equal(typeof v7[key], 'object');
        assert.notEqual(v7[key], null);
      }
    }
  });

  test('hydrateV7 es espejo de hydrateV6 (versión 7) SIN poda — preserva preposiciones si está presente', () => {
    const v7In = {
      schemaVersion: 7,
      exerciseStats: { 'preposiciones-al': { timesShown: 2, timesCorrect: 2, timesFailed: 0 }, 'avere-001': { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: { preposiciones: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['preposiciones-al'] } },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: { categoryIds: ['avere'], exerciseIds: ['avere-001'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const out = hydrateV7(v7In);
    assert.equal(out.schemaVersion, 7);
    // hydrateV7 NO poda: un state v7-shaped llega íntegro.
    assert.deepEqual(out.categoryProgress, v7In.categoryProgress,
      'hydrateV7 NO repite la poda — preserva lo que llega');
    assert.deepEqual(out.exerciseStats, v7In.exerciseStats);
    assert.notEqual(out.exerciseStats, v7In.exerciseStats, 'deep-clone defensivo');
    assert.deepEqual(out.inFlightTest, v7In.inFlightTest);
  });

  test('hydrateV7 sobre v7 con sub-dicts ausentes los normaliza a {}', () => {
    const out = hydrateV7({ schemaVersion: 7, lastBackupAt: null, firstUsedAt: null });
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.deepEqual(out.songProgress, {});
  });

  // Cadena completa: un blob v6 con progreso en Preposiciones pasado por la
  // cadena de migración (migrate6to7 → hydrateV7) sale v7 con Preposiciones
  // reseteada y las otras categorías intactas. Verifica el dispatcher vía
  // hydrateV7(migrate6to7(...)) (migrate() es privado).
  test('cadena v6 → v7: Preposiciones reseteada, avere/partitivos preservados, schemaVersion 7', () => {
    const v6 = v6WithPreposiciones();
    const v7 = hydrateV7(migrate6to7(v6));
    assert.equal(v7.schemaVersion, 7);
    assert.equal(v7.categoryProgress.preposiciones, undefined,
      'Preposiciones reseteada a través de la cadena v6 → v7');
    assert.deepEqual(v7.categoryProgress.avere, v6.categoryProgress.avere,
      'avere preservado a través de la cadena');
    assert.equal(v7.exerciseStats['preposiciones-001'], undefined);
    assert.deepEqual(v7.exerciseStats['avere-001'], v6.exerciseStats['avere-001']);
    assert.deepEqual(v7.exerciseStats['partitivos-001'], v6.exerciseStats['partitivos-001']);
    assert.deepEqual(v7.songProgress, v6.songProgress);
    assert.equal(v7.firstUsedAt, v6.firstUsedAt);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/storage v8 — migrate7to8 reset selectivo de articoli + partitivos (Phase 18)
//
// Clon literal del bloque v7 (migrate6to7) con UNA desviación funcional: el
// reset opera sobre DOS prefijos de id de categoría (articoli + partitivos) en
// vez de uno (preposiciones). El reset prepara la renumeración de ids de las
// Phases 19/20 (no se puede renumerar con progreso vivo). Las otras 7
// categorías (avere, essere, preposiciones, verbos-movimiento,
// sustantivos-irregulares, genero-numero, profesiones) quedan byte-intactas.
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v8 — migrate7to8 reset selectivo de articoli + partitivos (Phase 18)', () => {
  // Helper: un v7 con progreso en articoli + partitivos (los DOS reseteados) +
  // avere/essere como categorías preservadas. OJO (vs el analog v7): partitivos
  // ya NO es "preservado" — en v8 se resetea junto a articoli.
  function v7WithArticoliPartitivos() {
    return {
      schemaVersion: 7,
      exerciseStats: {
        'articoli-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'articoli-052': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
        'partitivos-001': { timesShown: 2, timesCorrect: 1, timesFailed: 1 },
        'partitivos-010': { timesShown: 6, timesCorrect: 5, timesFailed: 1 },
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
        'essere-001': { timesShown: 4, timesCorrect: 3, timesFailed: 1 }
      },
      categoryProgress: {
        articoli: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['articoli-001'], lastSuccessDate: '2026-05-30' },
        partitivos: { status: 'dominada', streakDays: 11, clearedExerciseIds: ['partitivos-001'], lastSuccessDate: '2026-05-30' },
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' },
        essere: { status: 'hecha', streakDays: 4, clearedExerciseIds: ['essere-001'], lastSuccessDate: '2026-05-29' }
      },
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['articoli', 'partitivos', 'avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('migrate7to8 borra categoryProgress.articoli y partitivos y deja avere/essere intactos', () => {
    const v7 = v7WithArticoliPartitivos();
    const v8 = migrate7to8(v7);
    assert.equal(v8.schemaVersion, 8);
    assert.equal(v8.categoryProgress.articoli, undefined,
      'categoryProgress.articoli debe quedar ausente tras el reset');
    assert.equal(v8.categoryProgress.partitivos, undefined,
      'categoryProgress.partitivos debe quedar ausente tras el reset');
    assert.equal(Object.prototype.hasOwnProperty.call(v8.categoryProgress, 'articoli'), false,
      'la clave articoli no debe existir como own-property');
    assert.equal(Object.prototype.hasOwnProperty.call(v8.categoryProgress, 'partitivos'), false,
      'la clave partitivos no debe existir como own-property');
    assert.deepEqual(v8.categoryProgress.avere, v7.categoryProgress.avere,
      'avere conserva su progreso byte-intacto');
    assert.deepEqual(v8.categoryProgress.essere, v7.categoryProgress.essere,
      'essere conserva su progreso byte-intacto');
  });

  test('migrate7to8 poda exerciseStats con prefijo articoli y partitivos y preserva avere/essere', () => {
    const v7 = v7WithArticoliPartitivos();
    const v8 = migrate7to8(v7);
    assert.equal(v8.exerciseStats['articoli-001'], undefined);
    assert.equal(v8.exerciseStats['articoli-052'], undefined);
    assert.equal(v8.exerciseStats['partitivos-001'], undefined);
    assert.equal(v8.exerciseStats['partitivos-010'], undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(v8.exerciseStats, 'articoli-001'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(v8.exerciseStats, 'partitivos-001'), false);
    assert.deepEqual(v8.exerciseStats['avere-001'], v7.exerciseStats['avere-001']);
    assert.deepEqual(v8.exerciseStats['essere-001'], v7.exerciseStats['essere-001']);
  });

  test('migrate7to8 invalida inFlightTest que referencia ids de articoli o partitivos', () => {
    const v7a = v7WithArticoliPartitivos();
    v7a.inFlightTest = {
      categoryIds: ['articoli'],
      exerciseIds: ['articoli-006', 'avere-001'],
      variantIndices: [0, 0],
      cursor: 0,
      answers: [],
      startedAt: 1716480000000
    };
    assert.equal(migrate7to8(v7a).inFlightTest, undefined,
      'un Test en vuelo que toca articoli se invalida al migrar');

    const v7b = v7WithArticoliPartitivos();
    v7b.inFlightTest = {
      categoryIds: ['partitivos'],
      exerciseIds: ['avere-001', 'partitivos-003'],
      variantIndices: [0, 0],
      cursor: 0,
      answers: [],
      startedAt: 1716480000000
    };
    assert.equal(migrate7to8(v7b).inFlightTest, undefined,
      'un Test en vuelo que toca partitivos se invalida al migrar');
  });

  test('migrate7to8 preserva inFlightTest que NO toca articoli ni partitivos', () => {
    const v7 = v7WithArticoliPartitivos();
    v7.inFlightTest = {
      categoryIds: ['avere', 'essere'],
      exerciseIds: ['avere-001', 'essere-001'],
      variantIndices: [0, 0],
      cursor: 1,
      answers: [],
      startedAt: 1716480000000
    };
    const v8 = migrate7to8(v7);
    assert.deepEqual(v8.inFlightTest, v7.inFlightTest,
      'un Test en vuelo ajeno a articoli/partitivos se preserva');
  });

  test('migrate7to8 sin inFlightTest no crashea y preserva undefined', () => {
    const v7 = v7WithArticoliPartitivos();
    const v8 = migrate7to8(v7);
    assert.equal(v8.inFlightTest, undefined);
  });

  test('migrate7to8 es idempotente (re-ejecutar sobre un v8 ya migrado da la misma shape)', () => {
    const v7 = v7WithArticoliPartitivos();
    const once = migrate7to8(v7);
    const twice = migrate7to8(once);
    assert.deepEqual(twice, once,
      'migrate7to8(migrate7to8(x)) deep-equals migrate7to8(x) — delete de clave ausente es no-op');
  });

  test('migrate7to8 es puro (no muta el input — articoli/partitivos siguen presentes en el v7 original)', () => {
    const v7 = v7WithArticoliPartitivos();
    migrate7to8(v7);
    assert.ok(v7.categoryProgress.articoli,
      'el input v7 NO debe mutarse: categoryProgress.articoli sigue presente');
    assert.ok(v7.categoryProgress.partitivos,
      'el input v7 NO debe mutarse: categoryProgress.partitivos sigue presente');
    assert.ok(v7.exerciseStats['articoli-001'],
      'el input v7 NO debe mutarse: exerciseStats[articoli-001] sigue presente');
    assert.ok(v7.exerciseStats['partitivos-001'],
      'el input v7 NO debe mutarse: exerciseStats[partitivos-001] sigue presente');
  });

  test('migrate7to8 anti-prototype-pollution: __proto__ own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":7,"exerciseStats":{"__proto__":{"polluted":true},"avere-001":{"timesShown":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
    const v8 = migrate7to8(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(v8.schemaVersion, 8);
  });

  test('migrate7to8 con sub-dict no-objeto (corrupto) cae a {}', () => {
    for (const bad of [null, 'x', 42]) {
      const v7 = { schemaVersion: 7, exerciseStats: bad, categoryProgress: bad, dailyLog: bad, songProgress: bad, lastBackupAt: null, firstUsedAt: null };
      const v8 = migrate7to8(v7);
      for (const key of ['exerciseStats', 'categoryProgress', 'dailyLog', 'songProgress']) {
        assert.equal(typeof v8[key], 'object');
        assert.notEqual(v8[key], null);
      }
    }
  });

  test('hydrateV8 es espejo de hydrateV7 (versión 8) SIN poda — preserva articoli/partitivos si están presentes', () => {
    const v8In = {
      schemaVersion: 8,
      exerciseStats: { 'articoli-uno': { timesShown: 2, timesCorrect: 2, timesFailed: 0 }, 'partitivos-del': { timesShown: 1, timesCorrect: 1, timesFailed: 0 }, 'avere-001': { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: { articoli: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['articoli-uno'] }, partitivos: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['partitivos-del'] } },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: { categoryIds: ['avere'], exerciseIds: ['avere-001'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const out = hydrateV8(v8In);
    assert.equal(out.schemaVersion, 8);
    // hydrateV8 NO poda: un state v8-shaped llega íntegro.
    assert.deepEqual(out.categoryProgress, v8In.categoryProgress,
      'hydrateV8 NO repite la poda — preserva lo que llega');
    assert.deepEqual(out.exerciseStats, v8In.exerciseStats);
    assert.notEqual(out.exerciseStats, v8In.exerciseStats, 'deep-clone defensivo');
    assert.deepEqual(out.inFlightTest, v8In.inFlightTest);
  });

  test('hydrateV8 sobre v8 con sub-dicts ausentes los normaliza a {}', () => {
    const out = hydrateV8({ schemaVersion: 8, lastBackupAt: null, firstUsedAt: null });
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.deepEqual(out.songProgress, {});
  });

  // Cadena completa: un blob v7 con progreso en articoli/partitivos pasado por
  // la cadena de migración (migrate7to8 → hydrateV8) sale v8 con ambas
  // categorías reseteadas y las otras intactas.
  test('cadena v7 → v8: articoli/partitivos reseteados, avere/essere preservados, schemaVersion 8', () => {
    const v7 = v7WithArticoliPartitivos();
    const v8 = hydrateV8(migrate7to8(v7));
    assert.equal(v8.schemaVersion, 8);
    assert.equal(v8.categoryProgress.articoli, undefined,
      'articoli reseteada a través de la cadena v7 → v8');
    assert.equal(v8.categoryProgress.partitivos, undefined,
      'partitivos reseteada a través de la cadena v7 → v8');
    assert.deepEqual(v8.categoryProgress.avere, v7.categoryProgress.avere,
      'avere preservado a través de la cadena');
    assert.deepEqual(v8.categoryProgress.essere, v7.categoryProgress.essere,
      'essere preservado a través de la cadena');
    assert.equal(v8.exerciseStats['articoli-001'], undefined);
    assert.equal(v8.exerciseStats['partitivos-001'], undefined);
    assert.deepEqual(v8.exerciseStats['avere-001'], v7.exerciseStats['avere-001']);
    assert.deepEqual(v8.songProgress, v7.songProgress);
    assert.equal(v8.firstUsedAt, v7.firstUsedAt);
  });

  // Test REFORZADO (D-04): fixture con progreso en las 9 categorías → migrate7to8
  // → (a) articoli + partitivos ausentes de ambos dicts; (b) las 7 restantes
  // deep-equal byte a byte pre/post. Más riguroso que el analog v7 (1 categoría).
  test('no-regresión D-04: las 7 categorías no-reseteadas quedan byte-idénticas, articoli/partitivos ausentes', () => {
    const SIETE = ['avere', 'essere', 'preposiciones', 'verbos-movimiento', 'sustantivos-irregulares', 'genero-numero', 'profesiones'];
    const RESET = ['articoli', 'partitivos'];

    const categoryProgress = {};
    const exerciseStats = {};
    let n = 1;
    for (const cat of [...SIETE, ...RESET]) {
      categoryProgress[cat] = { status: 'hecha', streakDays: n, clearedExerciseIds: [`${cat}-001`], lastSuccessDate: '2026-05-30' };
      exerciseStats[`${cat}-001`] = { timesShown: n, timesCorrect: n, timesFailed: 0 };
      exerciseStats[`${cat}-002`] = { timesShown: n + 1, timesCorrect: n, timesFailed: 1 };
      n++;
    }
    const v7 = {
      schemaVersion: 7,
      exerciseStats,
      categoryProgress,
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: [...SIETE, ...RESET], categoriesWithFailure: [] } },
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };

    // Snapshot byte a byte de las 7 preservadas ANTES de migrar.
    const beforeCP = JSON.parse(JSON.stringify(categoryProgress));
    const beforeES = JSON.parse(JSON.stringify(exerciseStats));

    const v8 = migrate7to8(v7);

    // (a) articoli + partitivos ausentes de ambos dicts.
    for (const cat of RESET) {
      assert.equal(v8.categoryProgress[cat], undefined, `categoryProgress.${cat} debe estar ausente`);
      assert.equal(v8.exerciseStats[`${cat}-001`], undefined, `exerciseStats.${cat}-001 debe estar podado`);
      assert.equal(v8.exerciseStats[`${cat}-002`], undefined, `exerciseStats.${cat}-002 debe estar podado`);
    }

    // (b) las 7 restantes byte a byte deep-equal pre/post (por categoría).
    for (const cat of SIETE) {
      assert.deepEqual(v8.categoryProgress[cat], beforeCP[cat],
        `categoryProgress.${cat} debe quedar byte-idéntico`);
      assert.deepEqual(v8.exerciseStats[`${cat}-001`], beforeES[`${cat}-001`],
        `exerciseStats.${cat}-001 debe quedar byte-idéntico`);
      assert.deepEqual(v8.exerciseStats[`${cat}-002`], beforeES[`${cat}-002`],
        `exerciseStats.${cat}-002 debe quedar byte-idéntico`);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/storage v9 — migrate8to9 reset selectivo de las 6 categorías (Phase 21)
//
// Clon literal del bloque v8 (migrate7to8) con UNA desviación funcional: el
// reset opera sobre SEIS prefijos de id de categoría (avere, essere,
// verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) en
// vez de dos (articoli + partitivos). El reset prepara la renumeración de ids
// de las Phases 22-27 (no se puede renumerar con progreso vivo). Las 3
// categorías ya convertidas (preposiciones, articoli, partitivos) quedan
// byte-intactas.
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v9 — migrate8to9 reset selectivo de las 6 categorías (Phase 21)', () => {
  // Helper: un v8 con progreso en las 6 categorías reseteadas (avere, essere,
  // verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) +
  // las 3 preservadas (preposiciones, articoli, partitivos). OJO (vs el analog
  // v8): avere/essere ya NO son "preservados" — en v9 se resetean.
  function v8WithSixCategories() {
    return {
      schemaVersion: 8,
      exerciseStats: {
        'avere-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'essere-001': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
        'verbos-movimiento-001': { timesShown: 2, timesCorrect: 1, timesFailed: 1 },
        'genero-numero-001': { timesShown: 6, timesCorrect: 5, timesFailed: 1 },
        'profesiones-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
        'sustantivos-irregulares-001': { timesShown: 4, timesCorrect: 3, timesFailed: 1 },
        'preposiciones-001': { timesShown: 8, timesCorrect: 8, timesFailed: 0 },
        'articoli-001': { timesShown: 9, timesCorrect: 8, timesFailed: 1 },
        'partitivos-001': { timesShown: 2, timesCorrect: 2, timesFailed: 0 }
      },
      categoryProgress: {
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' },
        essere: { status: 'hecha', streakDays: 4, clearedExerciseIds: ['essere-001'], lastSuccessDate: '2026-05-29' },
        'verbos-movimiento': { status: 'hecha', streakDays: 3, clearedExerciseIds: ['verbos-movimiento-001'], lastSuccessDate: '2026-05-30' },
        'genero-numero': { status: 'dominada', streakDays: 11, clearedExerciseIds: ['genero-numero-001'], lastSuccessDate: '2026-05-30' },
        profesiones: { status: 'hecha', streakDays: 2, clearedExerciseIds: ['profesiones-001'], lastSuccessDate: '2026-05-28' },
        'sustantivos-irregulares': { status: 'hecha', streakDays: 5, clearedExerciseIds: ['sustantivos-irregulares-001'], lastSuccessDate: '2026-05-29' },
        preposiciones: { status: 'dominada', streakDays: 21, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-06-01' },
        articoli: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['articoli-001'], lastSuccessDate: '2026-05-30' },
        partitivos: { status: 'dominada', streakDays: 11, clearedExerciseIds: ['partitivos-001'], lastSuccessDate: '2026-05-30' }
      },
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: ['avere', 'essere', 'articoli'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('migrate8to9 borra categoryProgress de las 6 y deja preposiciones/articoli/partitivos intactos', () => {
    const v8 = v8WithSixCategories();
    const v9 = migrate8to9(v8);
    assert.equal(v9.schemaVersion, 9);
    for (const cat of ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares']) {
      assert.equal(v9.categoryProgress[cat], undefined,
        `categoryProgress.${cat} debe quedar ausente tras el reset`);
      assert.equal(Object.prototype.hasOwnProperty.call(v9.categoryProgress, cat), false,
        `la clave ${cat} no debe existir como own-property`);
    }
    assert.deepEqual(v9.categoryProgress.preposiciones, v8.categoryProgress.preposiciones,
      'preposiciones conserva su progreso byte-intacto');
    assert.deepEqual(v9.categoryProgress.articoli, v8.categoryProgress.articoli,
      'articoli conserva su progreso byte-intacto');
    assert.deepEqual(v9.categoryProgress.partitivos, v8.categoryProgress.partitivos,
      'partitivos conserva su progreso byte-intacto');
  });

  test('migrate8to9 poda exerciseStats con los 6 prefijos y preserva preposiciones/articoli/partitivos', () => {
    const v8 = v8WithSixCategories();
    const v9 = migrate8to9(v8);
    for (const cat of ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares']) {
      assert.equal(v9.exerciseStats[`${cat}-001`], undefined, `exerciseStats.${cat}-001 debe estar podado`);
      assert.equal(Object.prototype.hasOwnProperty.call(v9.exerciseStats, `${cat}-001`), false);
    }
    assert.deepEqual(v9.exerciseStats['preposiciones-001'], v8.exerciseStats['preposiciones-001']);
    assert.deepEqual(v9.exerciseStats['articoli-001'], v8.exerciseStats['articoli-001']);
    assert.deepEqual(v9.exerciseStats['partitivos-001'], v8.exerciseStats['partitivos-001']);
  });

  test('migrate8to9 invalida inFlightTest que referencia ids de cualquiera de las 6', () => {
    const v8a = v8WithSixCategories();
    v8a.inFlightTest = {
      categoryIds: ['avere'],
      exerciseIds: ['avere-006', 'preposiciones-001'],
      variantIndices: [0, 0],
      cursor: 0,
      answers: [],
      startedAt: 1716480000000
    };
    assert.equal(migrate8to9(v8a).inFlightTest, undefined,
      'un Test en vuelo que toca avere se invalida al migrar');

    const v8b = v8WithSixCategories();
    v8b.inFlightTest = {
      categoryIds: ['profesiones'],
      exerciseIds: ['articoli-001', 'profesiones-003'],
      variantIndices: [0, 0],
      cursor: 0,
      answers: [],
      startedAt: 1716480000000
    };
    assert.equal(migrate8to9(v8b).inFlightTest, undefined,
      'un Test en vuelo que toca profesiones se invalida al migrar');
  });

  test('migrate8to9 preserva inFlightTest que SOLO toca preposiciones/articoli/partitivos', () => {
    const v8 = v8WithSixCategories();
    v8.inFlightTest = {
      categoryIds: ['preposiciones', 'articoli'],
      exerciseIds: ['preposiciones-001', 'articoli-001', 'partitivos-001'],
      variantIndices: [0, 0, 0],
      cursor: 1,
      answers: [],
      startedAt: 1716480000000
    };
    const v9 = migrate8to9(v8);
    assert.deepEqual(v9.inFlightTest, v8.inFlightTest,
      'un Test en vuelo ajeno a las 6 reseteadas se preserva');
  });

  test('migrate8to9 sin inFlightTest no crashea y preserva undefined', () => {
    const v8 = v8WithSixCategories();
    const v9 = migrate8to9(v8);
    assert.equal(v9.inFlightTest, undefined);
  });

  test('migrate8to9 es idempotente (re-ejecutar sobre un v9 ya migrado da la misma shape)', () => {
    const v8 = v8WithSixCategories();
    const once = migrate8to9(v8);
    const twice = migrate8to9(once);
    assert.deepEqual(twice, once,
      'migrate8to9(migrate8to9(x)) deep-equals migrate8to9(x) — delete de clave ausente es no-op');
  });

  test('migrate8to9 es puro (no muta el input — las 6 categorías siguen presentes en el v8 original)', () => {
    const v8 = v8WithSixCategories();
    migrate8to9(v8);
    for (const cat of ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares']) {
      assert.ok(v8.categoryProgress[cat],
        `el input v8 NO debe mutarse: categoryProgress.${cat} sigue presente`);
      assert.ok(v8.exerciseStats[`${cat}-001`],
        `el input v8 NO debe mutarse: exerciseStats[${cat}-001] sigue presente`);
    }
  });

  test('migrate8to9 anti-prototype-pollution: __proto__ own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":8,"exerciseStats":{"__proto__":{"polluted":true},"preposiciones-001":{"timesShown":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
    const v9 = migrate8to9(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(v9.schemaVersion, 9);
  });

  test('migrate8to9 con sub-dict no-objeto (corrupto) cae a {}', () => {
    for (const bad of [null, 'x', 42]) {
      const v8 = { schemaVersion: 8, exerciseStats: bad, categoryProgress: bad, dailyLog: bad, songProgress: bad, lastBackupAt: null, firstUsedAt: null };
      const v9 = migrate8to9(v8);
      for (const key of ['exerciseStats', 'categoryProgress', 'dailyLog', 'songProgress']) {
        assert.equal(typeof v9[key], 'object');
        assert.notEqual(v9[key], null);
      }
    }
  });

  test('hydrateV9 es espejo de hydrateV8 (versión 9) SIN poda — preserva avere/essere si están presentes', () => {
    const v9In = {
      schemaVersion: 9,
      exerciseStats: { 'avere-001': { timesShown: 2, timesCorrect: 2, timesFailed: 0 }, 'essere-001': { timesShown: 1, timesCorrect: 1, timesFailed: 0 }, 'preposiciones-001': { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['avere-001'] }, essere: { status: 'hecha', streakDays: 1, clearedExerciseIds: ['essere-001'] } },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: { categoryIds: ['preposiciones'], exerciseIds: ['preposiciones-001'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const out = hydrateV9(v9In);
    assert.equal(out.schemaVersion, 9);
    // hydrateV9 NO poda: un state v9-shaped llega íntegro.
    assert.deepEqual(out.categoryProgress, v9In.categoryProgress,
      'hydrateV9 NO repite la poda — preserva lo que llega');
    assert.deepEqual(out.exerciseStats, v9In.exerciseStats);
    assert.notEqual(out.exerciseStats, v9In.exerciseStats, 'deep-clone defensivo');
    assert.deepEqual(out.inFlightTest, v9In.inFlightTest);
  });

  test('hydrateV9 sobre v9 con sub-dicts ausentes los normaliza a {}', () => {
    const out = hydrateV9({ schemaVersion: 9, lastBackupAt: null, firstUsedAt: null });
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.deepEqual(out.songProgress, {});
  });

  // Cadena completa: un blob v8 con progreso en las 6 reseteadas pasado por la
  // cadena de migración (migrate8to9 → hydrateV9) sale v9 con las 6 reseteadas
  // y las 3 preservadas intactas.
  test('cadena v8 → v9: las 6 reseteadas, preposiciones/articoli/partitivos preservadas, schemaVersion 9', () => {
    const v8 = v8WithSixCategories();
    const v9 = hydrateV9(migrate8to9(v8));
    assert.equal(v9.schemaVersion, 9);
    for (const cat of ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares']) {
      assert.equal(v9.categoryProgress[cat], undefined,
        `${cat} reseteada a través de la cadena v8 → v9`);
      assert.equal(v9.exerciseStats[`${cat}-001`], undefined);
    }
    assert.deepEqual(v9.categoryProgress.preposiciones, v8.categoryProgress.preposiciones,
      'preposiciones preservada a través de la cadena');
    assert.deepEqual(v9.categoryProgress.articoli, v8.categoryProgress.articoli,
      'articoli preservada a través de la cadena');
    assert.deepEqual(v9.categoryProgress.partitivos, v8.categoryProgress.partitivos,
      'partitivos preservada a través de la cadena');
    assert.deepEqual(v9.exerciseStats['preposiciones-001'], v8.exerciseStats['preposiciones-001']);
    assert.deepEqual(v9.exerciseStats['articoli-001'], v8.exerciseStats['articoli-001']);
    assert.deepEqual(v9.exerciseStats['partitivos-001'], v8.exerciseStats['partitivos-001']);
    assert.deepEqual(v9.songProgress, v8.songProgress);
    assert.equal(v9.firstUsedAt, v8.firstUsedAt);
  });

  // Test REFORZADO (espejo del D-04 de Phase 18): fixture con progreso en las 9
  // categorías → migrate8to9 → (a) las 6 ausentes de ambos dicts; (b) las 3
  // preservadas (preposiciones, articoli, partitivos) deep-equal byte a byte.
  test('no-regresión: las 3 preservadas quedan byte-idénticas, las 6 reseteadas ausentes', () => {
    const RESET = ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares'];
    const PRESERVAR = ['preposiciones', 'articoli', 'partitivos'];

    const categoryProgress = {};
    const exerciseStats = {};
    let n = 1;
    for (const cat of [...RESET, ...PRESERVAR]) {
      categoryProgress[cat] = { status: 'hecha', streakDays: n, clearedExerciseIds: [`${cat}-001`], lastSuccessDate: '2026-05-30' };
      exerciseStats[`${cat}-001`] = { timesShown: n, timesCorrect: n, timesFailed: 0 };
      exerciseStats[`${cat}-002`] = { timesShown: n + 1, timesCorrect: n, timesFailed: 1 };
      n++;
    }
    const v8 = {
      schemaVersion: 8,
      exerciseStats,
      categoryProgress,
      dailyLog: { '2026-05-30': { date: '2026-05-30', categoriesPracticed: [...RESET, ...PRESERVAR], categoriesWithFailure: [] } },
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };

    // Snapshot byte a byte de las 3 preservadas ANTES de migrar.
    const beforeCP = JSON.parse(JSON.stringify(categoryProgress));
    const beforeES = JSON.parse(JSON.stringify(exerciseStats));

    const v9 = migrate8to9(v8);

    // (a) las 6 ausentes de ambos dicts.
    for (const cat of RESET) {
      assert.equal(v9.categoryProgress[cat], undefined, `categoryProgress.${cat} debe estar ausente`);
      assert.equal(v9.exerciseStats[`${cat}-001`], undefined, `exerciseStats.${cat}-001 debe estar podado`);
      assert.equal(v9.exerciseStats[`${cat}-002`], undefined, `exerciseStats.${cat}-002 debe estar podado`);
    }

    // (b) las 3 preservadas byte a byte deep-equal pre/post (por categoría).
    for (const cat of PRESERVAR) {
      assert.deepEqual(v9.categoryProgress[cat], beforeCP[cat],
        `categoryProgress.${cat} debe quedar byte-idéntico`);
      assert.deepEqual(v9.exerciseStats[`${cat}-001`], beforeES[`${cat}-001`],
        `exerciseStats.${cat}-001 debe quedar byte-idéntico`);
      assert.deepEqual(v9.exerciseStats[`${cat}-002`], beforeES[`${cat}-002`],
        `exerciseStats.${cat}-002 debe quedar byte-idéntico`);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/storage v10 — migrate9to10 NOMINAL (quick-260615-nzi)
//
// A DIFERENCIA de migrate8to9 (reset selectivo), el bump 9 → 10 es NOMINAL PURO:
// preserva TODO el estado byte a byte salvo schemaVersion (10). Añade el campo
// `vecesFallada` por categoría y por canción — lazy-init a 0 al leer/incrementar,
// NO retroactivamente (no se puede reconstruir el histórico de fallos). El
// deep-clone JSON conserva los sub-campos `vecesFallada` que ya existieran.
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v10 — migrate9to10 nominal (quick-260615-nzi)', () => {
  // Fixture NUEVO (NO reusar el reset de v8WithSixCategories): un v9 con progreso
  // en varias categorías, una con vecesFallada ya presente, y un songProgress con
  // vecesFallada presente, para verificar que el bump nominal lo preserva tal cual.
  function v9WithFailureCounters() {
    return {
      schemaVersion: 9,
      exerciseStats: {
        'preposiciones-001': { timesShown: 8, timesCorrect: 8, timesFailed: 0 },
        'articoli-001': { timesShown: 9, timesCorrect: 8, timesFailed: 1 }
      },
      categoryProgress: {
        preposiciones: { status: 'dominada', streakDays: 21, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-06-01', vecesFallada: 3 },
        articoli: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['articoli-001'], lastSuccessDate: '2026-05-30' }
      },
      dailyLog: { '2026-06-01': { date: '2026-06-01', categoriesPracticed: ['preposiciones'], categoriesWithFailure: [] } },
      songProgress: {
        'equilibrio-mentale': { status: 'fallada', lastPlayedAt: '2026-06-02', vecesFallada: 2 },
        'solo': { status: 'pasada', lastPlayedAt: '2026-06-03' }
      },
      lastBackupAt: '2026-05-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('migrate9to10 bumpea schemaVersion a 10 y deep-equals el v9 salvo la versión (preserva vecesFallada)', () => {
    const v9 = v9WithFailureCounters();
    const v10 = migrate9to10(v9);
    assert.equal(v10.schemaVersion, 10);
    // Todo el resto del estado preservado byte a byte.
    assert.deepEqual(v10.exerciseStats, v9.exerciseStats);
    assert.deepEqual(v10.categoryProgress, v9.categoryProgress);
    assert.deepEqual(v10.dailyLog, v9.dailyLog);
    assert.deepEqual(v10.songProgress, v9.songProgress);
    assert.equal(v10.lastBackupAt, v9.lastBackupAt);
    assert.equal(v10.firstUsedAt, v9.firstUsedAt);
    // vecesFallada existente preservado.
    assert.equal(v10.categoryProgress.preposiciones.vecesFallada, 3);
    assert.equal(v10.songProgress['equilibrio-mentale'].vecesFallada, 2);
    // Construir el "esperado" = v9 con schemaVersion bumpeado prueba la equivalencia total.
    const expected = { ...JSON.parse(JSON.stringify(v9)), schemaVersion: 10, inFlightTest: undefined };
    assert.deepEqual(v10, expected);
  });

  test('migrate9to10 es puro (no muta el input)', () => {
    const v9 = v9WithFailureCounters();
    const snapshot = JSON.parse(JSON.stringify(v9));
    migrate9to10(v9);
    assert.deepEqual(v9, snapshot, 'el input v9 NO debe mutarse');
  });

  test('migrate9to10 es idempotente sobre la shape (re-ejecutar vía hydrate da misma shape)', () => {
    const v9 = v9WithFailureCounters();
    const once = hydrateV10(migrate9to10(v9));
    const twice = hydrateV10(migrate9to10({ ...v9, schemaVersion: 9 }));
    assert.deepEqual(twice, once);
  });

  test('migrate9to10 preserva inFlightTest tal cual', () => {
    const v9 = v9WithFailureCounters();
    v9.inFlightTest = { categoryIds: ['preposiciones'], exerciseIds: ['preposiciones-001'], variantIndices: [0], cursor: 0, answers: [], startedAt: 1716480000000 };
    const v10 = migrate9to10(v9);
    assert.deepEqual(v10.inFlightTest, v9.inFlightTest);
  });

  test('hydrateV10 garantiza shape con sub-dicts malformados → {}', () => {
    for (const bad of [null, 'x', 42, undefined]) {
      const out = hydrateV10({ schemaVersion: 10, exerciseStats: bad, categoryProgress: bad, dailyLog: bad, songProgress: bad, lastBackupAt: null, firstUsedAt: null });
      for (const key of ['exerciseStats', 'categoryProgress', 'dailyLog', 'songProgress']) {
        assert.equal(typeof out[key], 'object');
        assert.notEqual(out[key], null);
      }
      assert.equal(out.schemaVersion, 10);
    }
  });

  test('hydrateV10 anti-prototype-pollution: __proto__ own-property no contamina el global', () => {
    const malicious = JSON.parse('{"schemaVersion":10,"exerciseStats":{"__proto__":{"polluted":true},"preposiciones-001":{"timesShown":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
    const out = hydrateV10(malicious);
    assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
    assert.equal(out.schemaVersion, 10);
  });

  test('cadena end-to-end v8 → v10: las 6 reseteadas por migrate8to9, schemaVersion 10', () => {
    const v8 = {
      schemaVersion: 8,
      exerciseStats: {
        'avere-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'preposiciones-001': { timesShown: 8, timesCorrect: 8, timesFailed: 0 }
      },
      categoryProgress: {
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' },
        preposiciones: { status: 'dominada', streakDays: 21, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-06-01' }
      },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const v10 = hydrateV10(migrate9to10(migrate8to9(v8)));
    assert.equal(v10.schemaVersion, 10);
    assert.equal(v10.categoryProgress.avere, undefined, 'avere reseteada por migrate8to9 a través de la cadena');
    assert.equal(v10.exerciseStats['avere-001'], undefined);
    assert.deepEqual(v10.categoryProgress.preposiciones, v8.categoryProgress.preposiciones,
      'preposiciones preservada a través de la cadena');
  });

  test('blankState() devuelve schemaVersion 10', () => {
    assert.equal(blankState().schemaVersion, 10);
  });
});
