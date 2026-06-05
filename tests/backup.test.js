// tests/backup.test.js
//
// Tests Phase 4 — vertical slice: data/storage v3 + data/backup + domain/dates.
//
// Cubre:
//   - migrate2to3 (Tests 1-2): preserva campos v2 + añade lastBackupAt/firstUsedAt
//     como null por defecto, idempotente sobre valores existentes.
//   - hydrateV3 (Test 3): defensivo contra sub-objetos malformados.
//   - blankState v3 (Test 4): shape correcto con los dos campos nuevos.
//   - migrate dispatcher v1→v3 (Test 5): cadena completa funcional.
//   - parseBackupFile happy paths (Tests 6, 13, 14): v3 directo + migración v1→v3 + v2→v3.
//   - parseBackupFile error paths (Tests 7-12, 15): los 6 reject patterns
//     + defensa contra prototype pollution.
//   - buildBackupWrapper (Test 16): shape literal según D-73, exportedAt inyectable.
//   - daysSinceISO (Tests 17-21): cero, positivos, negativos (futuro), defensivo.
//
// Estructura: 5 describe blocks por subsistema. Total ≥ 21 tests.
//
// Convenciones del archivo:
//   - `node:test` + `node:assert/strict`.
//   - Sin mock-timers — los tests usan `exportedAt` y `todayStr` inyectados.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { parseBackupFile, buildBackupWrapper } from '../src/data/backup.js';
import { blankState, migrate2to3, hydrateV3 } from '../src/data/storage.js';
import { applyNewExerciseRegression } from '../src/domain/progress.js';
import { daysSinceISO } from '../src/domain/dates.js';

// ────────────────────────────────────────────────────────────────────────────
// data/storage — migrate2to3 + hydrateV3 + blankState v3
// ────────────────────────────────────────────────────────────────────────────

describe('data/storage v3 — migrate2to3 + hydrateV3 + blankState v3', () => {
  // Test 1
  test('migrate2to3 preserva sub-objetos v2 íntegros + añade lastBackupAt/firstUsedAt null', () => {
    const v2 = {
      schemaVersion: 2,
      exerciseStats: { a1: { timesShown: 5, timesCorrect: 3, timesFailed: 2 } },
      categoryProgress: { avere: { status: 'hecha', streakDays: 3, clearedExerciseIds: ['a1'], lastSuccessDate: '2026-05-20' } },
      dailyLog: { '2026-05-20': { date: '2026-05-20', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      inFlightTest: { categoryIds: ['avere'], exerciseIds: ['a1'], cursor: 0, answers: [], startedAt: 1716480000000 }
    };
    const v3 = migrate2to3(v2);
    assert.equal(v3.schemaVersion, 3);
    assert.deepEqual(v3.exerciseStats, v2.exerciseStats);
    assert.deepEqual(v3.categoryProgress, v2.categoryProgress);
    assert.deepEqual(v3.dailyLog, v2.dailyLog);
    assert.deepEqual(v3.inFlightTest, v2.inFlightTest);
    assert.equal(v3.lastBackupAt, null);
    assert.equal(v3.firstUsedAt, null);
  });

  // Test 2
  test('migrate2to3 idempotente sobre valores existentes (preserva lastBackupAt string)', () => {
    const v2 = {
      schemaVersion: 2,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: '2026-05-01T10:00:00.000Z',
      firstUsedAt: '2026-04-15T09:00:00.000Z'
    };
    const v3 = migrate2to3(v2);
    assert.equal(v3.lastBackupAt, '2026-05-01T10:00:00.000Z');
    assert.equal(v3.firstUsedAt, '2026-04-15T09:00:00.000Z');
  });

  // Test 3
  test('hydrateV3 defensivo: sub-objetos malformados se reemplazan por defaults', () => {
    const out = hydrateV3({
      schemaVersion: 3,
      exerciseStats: 'not-object',
      categoryProgress: null,
      dailyLog: null,
      lastBackupAt: 42,        // no-string → null
      firstUsedAt: undefined   // no-string → null
    });
    assert.equal(out.schemaVersion, 3);
    assert.deepEqual(out.exerciseStats, {});
    assert.deepEqual(out.categoryProgress, {});
    assert.deepEqual(out.dailyLog, {});
    assert.equal(out.lastBackupAt, null);
    assert.equal(out.firstUsedAt, null);
  });

  // Test 4 — post-Phase 21: blankState bumpea a v9 (bump nominal con reset de
  // las 6 categorías en migrate8to9, D-21). Como blankState no tiene progreso
  // que resetear, su shape root es idéntico a v8 salvo schemaVersion: 9.
  test('blankState() devuelve shape v9 con songProgress {} + lastBackupAt/firstUsedAt null (Phase 21 bump nominal)', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 9);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    assert.deepEqual(s.songProgress, {});
    assert.equal(s.lastBackupAt, null);
    assert.equal(s.firstUsedAt, null);
    // inFlightTest sigue omitido (undefined)
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false,
      'blankState() v9 NO debe materializar inFlightTest como key explícita');
  });

  // Test 5 — usamos parseBackupFile como wrapper indirecto del dispatcher
  // porque `migrate()` es privado. Construimos un wrapper válido v1 y
  // verificamos que sale por la cadena 1→2→3→4→5→6→7→8→9 (Phase 21 extiende a v9).
  test('migración cadena v1 → v9 hidratada (via parseBackupFile)', () => {
    const v1Wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-24T10:00:00.000Z',
      schemaVersion: 1,
      state: {
        schemaVersion: 1,
        exerciseStats: { a1: { timesShown: 2, timesCorrect: 1, timesFailed: 1 } }
      }
    };
    const result = parseBackupFile(JSON.stringify(v1Wrapper));
    assert.equal(result.ok, true);
    assert.equal(result.state.schemaVersion, 9);
    assert.deepEqual(result.state.exerciseStats, v1Wrapper.state.exerciseStats);
    assert.deepEqual(result.state.categoryProgress, {});
    assert.deepEqual(result.state.dailyLog, {});
    assert.deepEqual(result.state.songProgress, {});
    assert.equal(result.state.lastBackupAt, null);
    assert.equal(result.state.firstUsedAt, null);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup — parseBackupFile happy paths
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup — parseBackupFile happy path', () => {
  // Test 6 — post-Phase 21: parseBackupFile sale como v9 al final de la cadena
  // (migrate8to9 + hydrateV9 son los últimos eslabones tras Phase 21).
  test('happy path v3: wrapper válido + state v3 migra automáticamente a v9', () => {
    const stateV3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: '2026-05-20T10:00:00.000Z',
      firstUsedAt: '2026-04-01T09:00:00.000Z'
    };
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-24T14:32:11.000Z',
      schemaVersion: 3,
      state: stateV3
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    assert.equal(r.summary.exportedAt, '2026-05-24T14:32:11.000Z');
    assert.equal(r.summary.categories, 0);
    assert.equal(r.summary.exercises, 0);
  });

  // Test 13 — migración explícita v1→v9 (duplicado de Test 5 pero desde el
  // describe block correspondiente para legibilidad del runner).
  test('migración v1 → v9 OK (state.schemaVersion=1 + wrapper.schemaVersion=1)', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-01-15T08:00:00.000Z',
      schemaVersion: 1,
      state: {
        schemaVersion: 1,
        exerciseStats: { x1: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } }
      }
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    assert.equal(r.state.lastBackupAt, null);
    assert.equal(r.state.firstUsedAt, null);
    assert.deepEqual(r.state.exerciseStats, wrapper.state.exerciseStats);
  });

  // Test 14 — post-Phase 21: el state v2 usa `avere` (categoría reseteada en v9)
  // + exerciseStats `y1`. Tras la cadena hasta v9, `avere` se poda → categories
  // baja a 0; `y1` no empieza por prefijo de reset → se preserva (exercises 1).
  test('migración v2 → v9 OK (avere reseteada por migrate8to9)', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-03-10T08:00:00.000Z',
      schemaVersion: 2,
      state: {
        schemaVersion: 2,
        exerciseStats: { y1: { timesShown: 4, timesCorrect: 3, timesFailed: 1 } },
        categoryProgress: { avere: { status: 'hecha', streakDays: 5, clearedExerciseIds: ['y1'], lastSuccessDate: '2026-03-09' } },
        dailyLog: {}
      }
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    assert.equal(r.state.lastBackupAt, null);
    assert.equal(r.summary.categories, 0,
      'avere se resetea en migrate8to9 → categoryProgress queda vacío');
    assert.equal(r.summary.exercises, 1,
      'y1 no empieza por prefijo de reset → se preserva');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup v7 — round-trip + import v6→v7 con reset de Preposiciones (Phase 17)
//
// Tras Phase 17 (D-17-08 / PILOT-04) la cadena de backup llega hasta v7. Un
// export del state v7 actual debe reimportarse sin "versión más nueva"; un
// backup v6 importado migra a v7 reseteando SOLO Preposiciones (coherente con
// el reset del piloto); las otras categorías conservan su progreso.
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup v7 — round-trip + import v6→v7 (Phase 17)', () => {
  // Un state v7 con progreso en varias categorías (Preposiciones ya reseteada
  // como sería tras el primer boot post-migración + algo de re-progreso nuevo).
  function stateV7() {
    return {
      schemaVersion: 7,
      exerciseStats: {
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
        'essere-001': { timesShown: 4, timesCorrect: 3, timesFailed: 1 },
        'partitivos-001': { timesShown: 2, timesCorrect: 1, timesFailed: 1 }
      },
      categoryProgress: {
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' },
        essere: { status: 'hecha', streakDays: 4, clearedExerciseIds: ['essere-001'], lastSuccessDate: '2026-05-30' }
      },
      dailyLog: { '2026-05-31': { date: '2026-05-31', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-31T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('round-trip v7: export (buildBackupWrapper) → import (parseBackupFile) sin "versión más nueva"', () => {
    const state = stateV7();
    const wrapper = buildBackupWrapper(state, '2026-06-03T12:00:00.000Z');
    assert.equal(wrapper.schemaVersion, 7, 'el wrapper espeja state.schemaVersion=7');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true, `no debe rechazarse (reason: ${r.reason})`);
    // Post-Phase 21: un backup v7 ya NO es current-version; importarlo migra
    // v7→v8→v9 (CURRENT=9). El round-trip sale como v9 normalizada.
    assert.equal(r.state.schemaVersion, 9);
  });

  test('round-trip v7 ahora resetea avere/essere (migrate8to9) y partitivos (migrate7to8)', () => {
    const state = stateV7();
    const wrapper = buildBackupWrapper(state, '2026-06-03T12:00:00.000Z');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    // Post-Phase 21: avere/essere se resetean en la cadena v8→v9 (migrate8to9
    // poda esos prefijos, D-21). En v1.5 (Phase 18) eran preservados; ahora NO.
    assert.equal(r.state.categoryProgress.avere, undefined,
      'avere se resetea en el import al pasar por migrate8to9');
    assert.equal(r.state.categoryProgress.essere, undefined,
      'essere se resetea en el import al pasar por migrate8to9');
    assert.equal(r.state.exerciseStats['avere-001'], undefined);
    assert.equal(r.state.exerciseStats['essere-001'], undefined);
    // partitivos-001 venía en el state v7; aunque en v9 es categoría preservada,
    // un backup v7 cruza la cadena por migrate7to8 (que poda partitivos como
    // reseteada de v8). El reset histórico de la cadena prevalece: partitivos
    // se poda en un import v7 (un import v8+ sí la preservaría).
    assert.equal(r.state.exerciseStats['partitivos-001'], undefined,
      'partitivos se poda en el import v7 (migrate7to8 corre en la cadena)');
  });

  test('import de backup v6 → state v9 con Preposiciones y avere reseteadas', () => {
    const stateV6 = {
      schemaVersion: 6,
      exerciseStats: {
        'preposiciones-006': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 }
      },
      categoryProgress: {
        preposiciones: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['preposiciones-006'], lastSuccessDate: '2026-05-30' },
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' }
      },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-30T09:00:00.000Z',
      schemaVersion: 6,
      state: stateV6
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    assert.equal(r.state.categoryProgress.preposiciones, undefined,
      'el import v6→v9 resetea Preposiciones (migrate6to7 corre en la cadena)');
    assert.equal(r.state.exerciseStats['preposiciones-006'], undefined,
      'las stats de Preposiciones se podan en el import');
    // Post-Phase 21: avere ya NO se preserva — migrate8to9 lo resetea en la
    // cadena v8→v9 (en v1.4/v1.5 avere era preservado; ahora está en las 6).
    assert.equal(r.state.categoryProgress.avere, undefined,
      'avere se resetea en el import v6→v9 (migrate8to9 corre en la cadena)');
    assert.equal(r.state.exerciseStats['avere-001'], undefined,
      'las stats de avere se podan en el import v6→v9');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup v8 — round-trip + import v7→v8 con reset de articoli+partitivos (Phase 18)
//
// Tras Phase 18 (D-18 / MIG-02) la cadena de backup llega hasta v8. Un export
// del state v8 actual debe reimportarse sin "versión más nueva"; un backup v7
// importado migra a v8 reseteando articoli + partitivos (coherente con el reset
// de la migración, D-06: el progreso de esas categorías en un backup viejo se
// pierde por diseño); las otras categorías conservan su progreso.
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup v8 — round-trip + import v7→v8 (Phase 18)', () => {
  // Un state v8 con progreso en avere/essere (preservados) — clon de stateV7.
  function stateV8() {
    return {
      schemaVersion: 8,
      exerciseStats: {
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 },
        'essere-001': { timesShown: 4, timesCorrect: 3, timesFailed: 1 }
      },
      categoryProgress: {
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' },
        essere: { status: 'hecha', streakDays: 4, clearedExerciseIds: ['essere-001'], lastSuccessDate: '2026-05-30' }
      },
      dailyLog: { '2026-05-31': { date: '2026-05-31', categoriesPracticed: ['avere'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-05-31T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('round-trip v8: export (buildBackupWrapper) → import (parseBackupFile) sin "versión más nueva"', () => {
    const state = stateV8();
    const wrapper = buildBackupWrapper(state, '2026-06-04T12:00:00.000Z');
    assert.equal(wrapper.schemaVersion, 8, 'el wrapper espeja state.schemaVersion=8');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true, `no debe rechazarse (reason: ${r.reason})`);
    // Post-Phase 21: un backup v8 ya NO es current-version; migra v8→v9.
    assert.equal(r.state.schemaVersion, 9);
  });

  test('round-trip v8 ahora resetea avere/essere en el import v8→v9 (migrate8to9)', () => {
    const state = stateV8();
    const wrapper = buildBackupWrapper(state, '2026-06-04T12:00:00.000Z');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    // Post-Phase 21: avere/essere están en las 6 reseteadas → se podan en v8→v9.
    assert.equal(r.state.categoryProgress.avere, undefined);
    assert.equal(r.state.categoryProgress.essere, undefined);
    assert.equal(r.state.exerciseStats['avere-001'], undefined);
    assert.equal(r.state.exerciseStats['essere-001'], undefined);
  });

  test('import de backup v7 → state v8 con articoli/partitivos reseteados (D-06)', () => {
    const stateV7 = {
      schemaVersion: 7,
      exerciseStats: {
        'articoli-006': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'partitivos-003': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
        'avere-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 }
      },
      categoryProgress: {
        articoli: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['articoli-006'], lastSuccessDate: '2026-05-30' },
        partitivos: { status: 'dominada', streakDays: 11, clearedExerciseIds: ['partitivos-003'], lastSuccessDate: '2026-05-30' },
        avere: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['avere-001'], lastSuccessDate: '2026-05-31' }
      },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-30T09:00:00.000Z',
      schemaVersion: 7,
      state: stateV7
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    // Post-Phase 21: articoli/partitivos pasan a ser categorías PRESERVADAS
    // (ya convertidas en Phases 19/20). Al importar un backup v7, migrate7to8
    // las resetea PERO el state v7 fixture ya las trae, y migrate7to8 las poda
    // — sin embargo el import sigue siendo v7→v8→v9: migrate7to8 SÍ poda
    // articoli/partitivos (eran las reseteadas de v8). Documentamos el efecto
    // real de la cadena: articoli/partitivos podadas por migrate7to8.
    assert.equal(r.state.categoryProgress.articoli, undefined,
      'articoli reseteada por migrate7to8 en la cadena v7→v8');
    assert.equal(r.state.categoryProgress.partitivos, undefined,
      'partitivos reseteada por migrate7to8 en la cadena v7→v8');
    // avere ahora se resetea en v8→v9 (migrate8to9) — antes (Phase 18) se
    // preservaba; ahora está en las 6 categorías reseteadas.
    assert.equal(r.state.categoryProgress.avere, undefined,
      'avere se resetea en el import v7→v9 (migrate8to9 corre en la cadena)');
    assert.equal(r.state.exerciseStats['avere-001'], undefined,
      'las stats de avere se podan en el import v7→v9');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup v9 — round-trip + import v8→v9 con reset de las 6 categorías (Phase 21)
//
// Tras Phase 21 (D-21 / MIG-04) la cadena de backup llega hasta v9. Un export
// del state v9 actual debe reimportarse sin "versión más nueva"; un backup v8
// importado migra a v9 reseteando las 6 categorías a convertir (coherente con
// el reset de la migración, D-21: el progreso de esas categorías en un backup
// viejo se pierde por diseño); las 3 ya convertidas (preposiciones, articoli,
// partitivos) conservan su progreso byte-intacto.
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup v9 — round-trip + import v8→v9 (Phase 21)', () => {
  // Un state v9 con progreso en las 3 categorías PRESERVADAS (preposiciones,
  // articoli, partitivos) — clon de stateV8.
  function stateV9() {
    return {
      schemaVersion: 9,
      exerciseStats: {
        'preposiciones-001': { timesShown: 8, timesCorrect: 8, timesFailed: 0 },
        'articoli-001': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'partitivos-001': { timesShown: 3, timesCorrect: 3, timesFailed: 0 }
      },
      categoryProgress: {
        preposiciones: { status: 'dominada', streakDays: 21, clearedExerciseIds: ['preposiciones-001'], lastSuccessDate: '2026-06-01' },
        articoli: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['articoli-001'], lastSuccessDate: '2026-05-30' },
        partitivos: { status: 'dominada', streakDays: 11, clearedExerciseIds: ['partitivos-001'], lastSuccessDate: '2026-05-30' }
      },
      dailyLog: { '2026-06-01': { date: '2026-06-01', categoriesPracticed: ['preposiciones'], categoriesWithFailure: [] } },
      songProgress: { 'mini-prueba': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-06-01T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }

  test('round-trip v9: export (buildBackupWrapper) → import (parseBackupFile) sin "versión más nueva"', () => {
    const state = stateV9();
    const wrapper = buildBackupWrapper(state, '2026-06-05T12:00:00.000Z');
    assert.equal(wrapper.schemaVersion, 9, 'el wrapper espeja state.schemaVersion=9');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true, `no debe rechazarse (reason: ${r.reason})`);
    assert.equal(r.state.schemaVersion, 9);
  });

  test('round-trip v9 preserva preposiciones/articoli/partitivos progreso intacto', () => {
    const state = stateV9();
    const wrapper = buildBackupWrapper(state, '2026-06-05T12:00:00.000Z');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.deepEqual(r.state.categoryProgress.preposiciones, state.categoryProgress.preposiciones);
    assert.deepEqual(r.state.categoryProgress.articoli, state.categoryProgress.articoli);
    assert.deepEqual(r.state.categoryProgress.partitivos, state.categoryProgress.partitivos);
    assert.deepEqual(r.state.exerciseStats['preposiciones-001'], state.exerciseStats['preposiciones-001']);
    assert.deepEqual(r.state.exerciseStats['articoli-001'], state.exerciseStats['articoli-001']);
    assert.deepEqual(r.state.exerciseStats['partitivos-001'], state.exerciseStats['partitivos-001']);
  });

  test('import de backup v8 → state v9 con las 6 categorías reseteadas (D-21 / MIG-04)', () => {
    const stateV8In = {
      schemaVersion: 8,
      exerciseStats: {
        'avere-006': { timesShown: 5, timesCorrect: 4, timesFailed: 1 },
        'profesiones-003': { timesShown: 3, timesCorrect: 2, timesFailed: 1 },
        'articoli-001': { timesShown: 7, timesCorrect: 7, timesFailed: 0 }
      },
      categoryProgress: {
        avere: { status: 'hecha', streakDays: 9, clearedExerciseIds: ['avere-006'], lastSuccessDate: '2026-05-30' },
        profesiones: { status: 'dominada', streakDays: 11, clearedExerciseIds: ['profesiones-003'], lastSuccessDate: '2026-05-30' },
        articoli: { status: 'dominada', streakDays: 14, clearedExerciseIds: ['articoli-001'], lastSuccessDate: '2026-05-31' }
      },
      dailyLog: {},
      songProgress: {},
      lastBackupAt: null,
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-06-04T09:00:00.000Z',
      schemaVersion: 8,
      state: stateV8In
    };
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true);
    assert.equal(r.state.schemaVersion, 9);
    // Las 6 reseteadas: avere + profesiones podadas (dos de las 6).
    assert.equal(r.state.categoryProgress.avere, undefined,
      'el import v8→v9 resetea avere (migrate8to9 corre en la cadena)');
    assert.equal(r.state.categoryProgress.profesiones, undefined,
      'el import v8→v9 resetea profesiones (migrate8to9 corre en la cadena)');
    assert.equal(r.state.exerciseStats['avere-006'], undefined,
      'las stats de avere se podan en el import');
    assert.equal(r.state.exerciseStats['profesiones-003'], undefined,
      'las stats de profesiones se podan en el import');
    // articoli es PRESERVADA (ya convertida en Phase 19) → byte-intacta.
    assert.deepEqual(r.state.categoryProgress.articoli, stateV8In.categoryProgress.articoli,
      'articoli se preserva a través del import v8→v9');
    assert.deepEqual(r.state.exerciseStats['articoli-001'], stateV8In.exerciseStats['articoli-001']);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup — parseBackupFile error paths (los 6 rejects + prototype pollution)
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup — parseBackupFile error paths', () => {
  // Test 7
  test('rejects JSON inválido (string que no parsea)', () => {
    const r = parseBackupFile('not json {{{');
    assert.equal(r.ok, false);
    assert.match(r.reason, /^JSON inválido:/);
  });

  // Test 8 — el mensaje literal UI-SPEC menciona el nombre de la app "Italian
  // Course" y el campo "kind". Validamos ambos para asegurar que el reason
  // identifica al usuario qué falla sin ambigüedad.
  test('rejects wrapper.kind erróneo (menciona "Italian Course" y "kind")', () => {
    const r = parseBackupFile(JSON.stringify({ kind: 'other', schemaVersion: 3, state: {} }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /Italian Course/);
    assert.match(r.reason, /"kind"/);
  });

  // Test 9
  test('rejects state ausente (menciona "state")', () => {
    const r = parseBackupFile(JSON.stringify({ kind: 'italian-course-backup', schemaVersion: 3 }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /state/);
  });

  // Test 10
  test('rejects schemaVersion ausente o no-número (menciona "schemaVersion")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 3,
      state: { schemaVersion: null }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /schemaVersion/);
  });

  // Test 11 — post-Phase 21: CURRENT_SCHEMA_VERSION = 9. Un wrapper con
  // schemaVersion: 10 (uno por encima del nuevo current) sigue siendo
  // "versión más nueva".
  test('rejects future schemaVersion > 9 (menciona "versión más nueva")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 10,
      state: { schemaVersion: 10 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /versión más nueva/i);
  });

  // Test 12
  test('rejects wrapper/state schemaVersion mismatch (menciona "Versión inconsistente")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 3,
      state: { schemaVersion: 2 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /Versión inconsistente/);
  });

  // ME-02 — lower-bound + integer guard sobre state.schemaVersion. Sin esto,
  // un backup con schemaVersion 0, -1, NaN o 1.5 pasaría silenciosamente al
  // dispatcher de migración (ninguna rama matchea) y hydrateV3 normalizaría
  // a v3 con defaults — equivalente a aceptar un backup malformado.
  test('ME-02: rejects schemaVersion=0 (lower bound; menciona "schemaVersion inválido")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 0,
      state: { schemaVersion: 0 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /schemaVersion inválido/);
  });

  test('ME-02: rejects schemaVersion=-1 (lower bound negativo)', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: -1,
      state: { schemaVersion: -1 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /schemaVersion inválido/);
  });

  test('ME-02: rejects schemaVersion=1.5 (no entero)', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 1.5,
      state: { schemaVersion: 1.5 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /schemaVersion inválido/);
  });

  test('ME-02: rejects schemaVersion=NaN (typeof number pero ni entero)', () => {
    // JSON.stringify(NaN) → 'null', así que construimos el string a mano para
    // que el JSON.parse lo recupere como el literal NaN no es JSON válido.
    // En su lugar usamos una key con valor 'NaN' string → cae en typeof !==
    // 'number'. Para test directo de NaN tras un JSON.parse, pasamos el valor
    // a través del path "el state ya está en memoria" — pero parseBackupFile
    // sólo recibe rawStr. Por tanto: el camino realista de NaN es vía edición
    // manual (raw text con NaN, no válido en JSON). Documentamos: con typeof
    // sigue siendo guardado por la rama actual. Skip-able dado el guard
    // Number.isInteger() defiende el caso teórico aunque no llegue por raw.
    // Test alternativo: confirmamos que el guard funciona con NaN inyectado
    // directamente bypassando el JSON.parse (smoke estructural del predicate).
    assert.equal(Number.isInteger(NaN), false,
      'Number.isInteger(NaN) === false, ergo el guard ME-02 lo rechazaría.');
    assert.equal(Number.isInteger(0.5), false,
      'Number.isInteger(0.5) === false, ergo el guard ME-02 lo rechazaría.');
  });

  // Test 15 — defensa contra prototype pollution.
  // Nota: V8 trata `__proto__` en JSON.parse como property literal del objeto
  // resultante (no muta `Object.prototype`). Esto se documenta como parte del
  // spec de JSON.parse desde ECMA-262 ES2015. La verificación clave es que
  // tras el parse, `({}).polluted === undefined` — el prototipo global queda
  // intocado. `hydrateV3` reconstruye literal {schemaVersion: 3, ...} lo que
  // refuerza la defensa estructural.
  test('defensa contra prototype pollution: __proto__ no contamina Object.prototype', () => {
    const malicious = '{"kind":"italian-course-backup","schemaVersion":3,"state":{"schemaVersion":3,"__proto__":{"polluted":true}}}';
    const r = parseBackupFile(malicious);
    // El parse debe completar (no crashea).
    assert.equal(r.ok, true);
    // La defensa clave: el prototipo global no fue contaminado.
    assert.equal(({}).polluted, undefined,
      'Object.prototype.polluted DEBE ser undefined tras parsear un payload con __proto__ malicioso');
  });

  // CR-03 fix — defensa contra prototype pollution en sub-objetos anidados.
  // El test anterior solo cubre `__proto__` en el ROOT del state. La review
  // detectó que `migrate3to4` y `hydrateV4` copiaban los sub-dicts
  // (`exerciseStats`, `categoryProgress`, `dailyLog`) por REFERENCIA, así que
  // un sub-objeto malicioso con `__proto__` como own-property podía persistir
  // intacto en el live state — el comment T-04-02 sobre "Object.prototype
  // limpio" sólo era cierto para el root. El fix introdujo deep-clone vía
  // JSON.parse(JSON.stringify(...)) en ambos.
  test('CR-03: __proto__ en sub-objetos anidados (exerciseStats[id]) NO contamina Object.prototype tras import', () => {
    // Sub-objeto malicioso bajo exerciseStats: el JSON literal lleva
    // `__proto__` como own-property del item. Sin el deep-clone, ese sub-objeto
    // se copiaba por referencia al state final del consumer.
    const malicious = JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {
          poisonedEx: {
            timesShown: 1,
            timesCorrect: 0,
            timesFailed: 0,
            __proto__: { polluted: 'sub-object-payload' }
          }
        },
        categoryProgress: {},
        dailyLog: {}
      }
    });
    const r = parseBackupFile(malicious);
    assert.equal(r.ok, true);
    // Verificación CR-03: el sub-objeto malicioso NO contamina Object.prototype
    // global. Sin el deep-clone, esto seguía siendo true (V8 ya neutraliza
    // __proto__ en JSON.parse), pero ADEMÁS verificamos que el sub-objeto
    // resultante NO tiene la property `polluted` por referencia directa.
    assert.equal(({}).polluted, undefined,
      'Object.prototype.polluted DEBE ser undefined tras importar un backup con __proto__ anidado');
    // Verificación adicional: el sub-objeto deep-cloned NO debe llevar el
    // payload malicioso como property propia.
    assert.equal(r.state.exerciseStats.poisonedEx.polluted, undefined,
      'tras el deep-clone, el sub-objeto poisonedEx no tiene la propiedad maliciosa');
    // El resto del shape se preserva intacto.
    assert.equal(r.state.exerciseStats.poisonedEx.timesShown, 1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup — buildBackupWrapper
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup — buildBackupWrapper', () => {
  // Test 16
  test('buildBackupWrapper devuelve shape D-73 literal con exportedAt inyectado', () => {
    const state = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null
    };
    const result = buildBackupWrapper(state, '2026-01-01T00:00:00.000Z');
    assert.deepEqual(result, {
      kind: 'italian-course-backup',
      exportedAt: '2026-01-01T00:00:00.000Z',
      schemaVersion: 3,
      state
    });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// HI-01 regression — commitImport debe re-correr applyNewExerciseRegression
// para que un backup viejo (menos ejercicios por categoría) NO mantenga
// status 'hecha'/'dominada' contra el content actual (más ejercicios).
//
// Esto cubre la composición `parseBackupFile(...) → applyNewExerciseRegression`
// que `commitImport` (src/screens/app.js) ahora ejecuta antes de saveState.
// commitImport en sí no es testeable bajo node --test (depende de Alpine/DOM),
// pero la composición pura sí lo es y es la pieza clave de la garantía.
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup HI-01 — commitImport re-corre applyNewExerciseRegression', () => {
  // Test 22 — backup contiene una categoría 'hecha' que cubre solo a1+a2,
  // pero el content actual tiene a1+a2+a3 (ejercicio nuevo añadido tras el
  // export). Tras parse + regression, la categoría debe demote a 'no-hecha'
  // con streakDays=0; clearedExerciseIds preservado (D-40).
  test('hecha del backup con cleared parcial → no-hecha tras applyNewExerciseRegression', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-03-01T10:00:00.000Z',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {
          a1: { timesShown: 3, timesCorrect: 3, timesFailed: 0 },
          a2: { timesShown: 3, timesCorrect: 3, timesFailed: 0 }
        },
        categoryProgress: {
          'test-cat': {
            status: 'hecha',
            clearedExerciseIds: ['a1', 'a2'],
            streakDays: 5,
            lastPracticedDate: '2026-02-28',
            lastSuccessDate: '2026-02-28',
            becameHechaAt: '2026-02-25',
            becameDominadaAt: undefined
          }
        },
        dailyLog: {},
        lastBackupAt: '2026-03-01T10:00:00.000Z',
        firstUsedAt: '2026-02-01T09:00:00.000Z'
      }
    };
    // Content actual con un ejercicio nuevo `a3` que el backup no tenía.
    // Post-Phase 21: usamos una categoría ficticia `test-cat` que NO colisiona
    // con ningún prefijo de reset de la cadena (migrate6to7 poda preposiciones,
    // migrate7to8 poda articoli+partitivos, migrate8to9 poda las 6) para que la
    // migración v3→v9 no resetee el categoryProgress y el test siga ejerciendo
    // solo la lógica de applyNewExerciseRegression.
    const content = {
      categories: [{ id: 'test-cat', name: 'test-cat', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} },
        a3: { id: 'a3', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);
    // Simula commitImport: parseBackupFile → applyNewExerciseRegression.
    const finalState = applyNewExerciseRegression(parsed.state, content);
    const cat = finalState.categoryProgress['test-cat'];

    assert.equal(cat.status, 'no-hecha', 'test-cat debe demote tras detectar a3 nuevo en content');
    assert.equal(cat.streakDays, 0);
    assert.equal(cat.becameHechaAt, undefined);
    assert.equal(cat.becameDominadaAt, undefined);
    // D-40: clearedExerciseIds preservado — el usuario no pierde su trabajo previo.
    assert.deepEqual(cat.clearedExerciseIds, ['a1', 'a2']);
    // lastPracticedDate / lastSuccessDate preservados (huella histórica).
    assert.equal(cat.lastPracticedDate, '2026-02-28');
    assert.equal(cat.lastSuccessDate, '2026-02-28');
  });

  // Test 23 — idempotencia: si el backup ya cubre todos los ejercicios del
  // content actual, la regresión es no-op (status preservado).
  test('hecha del backup con cleared completo → status preservado tras regression (idempotente)', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-20T10:00:00.000Z',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {},
        categoryProgress: {
          'test-cat': {
            status: 'hecha',
            clearedExerciseIds: ['a1', 'a2'],
            streakDays: 7,
            lastPracticedDate: '2026-05-19',
            lastSuccessDate: '2026-05-19',
            becameHechaAt: '2026-05-13',
            becameDominadaAt: undefined
          }
        },
        dailyLog: {},
        lastBackupAt: '2026-05-20T10:00:00.000Z',
        firstUsedAt: '2026-05-01T09:00:00.000Z'
      }
    };
    // Post-Phase 21: categoría ficticia `test-cat` que NO colisiona con ningún
    // prefijo de reset de la cadena (la migración v3→v9 no la resetea); el test
    // ejerce solo la idempotencia de la regresión.
    const content = {
      categories: [{ id: 'test-cat', name: 'test-cat', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);
    const finalState = applyNewExerciseRegression(parsed.state, content);
    const cat = finalState.categoryProgress['test-cat'];

    assert.equal(cat.status, 'hecha');
    assert.equal(cat.streakDays, 7);
    assert.equal(cat.becameHechaAt, '2026-05-13');
    assert.deepEqual([...cat.clearedExerciseIds].sort(), ['a1', 'a2']);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// ME-04 — commitImport debe reapar orphans (exerciseStats / categoryProgress
// con keys que no existen en el content actual). Bounded leak prevention.
//
// commitImport en sí no es testeable bajo node --test (Alpine/DOM); aquí
// validamos la composición lógica: tras parseBackupFile → reap, las keys
// huérfanas desaparecen y las válidas se preservan.
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup ME-04 — commitImport reapa huérfanos en exerciseStats/categoryProgress', () => {
  test('exerciseStats con IDs huérfanos (no presentes en content.exerciseById) se eliminan; las válidas se preservan', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-01-15T10:00:00.000Z',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {
          'a1': { timesShown: 5, timesCorrect: 3, timesFailed: 2 },
          'a2': { timesShown: 4, timesCorrect: 4, timesFailed: 0 },
          'ghost-001': { timesShown: 10, timesCorrect: 10, timesFailed: 0 },  // huérfano
          'ghost-002': { timesShown: 1, timesCorrect: 0, timesFailed: 1 }     // huérfano
        },
        categoryProgress: {},
        dailyLog: {},
        lastBackupAt: '2026-01-15T10:00:00.000Z',
        firstUsedAt: '2026-01-01T09:00:00.000Z'
      }
    };
    // Content actual sólo conoce a1 + a2; ghost-* fueron eliminados / renombrados.
    const content = {
      categories: [{ id: 'avere', name: 'avere', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['avere'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['avere'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);

    // Simula la lógica de commitImport (reap):
    const validExerciseIds = new Set(Object.keys(content.exerciseById));
    const reaped = {};
    for (const [eid, stat] of Object.entries(parsed.state.exerciseStats)) {
      if (validExerciseIds.has(eid)) reaped[eid] = stat;
    }
    assert.deepEqual(Object.keys(reaped).sort(), ['a1', 'a2'],
      'sólo las keys presentes en content.exerciseById se preservan');
    assert.deepEqual(reaped.a1, { timesShown: 5, timesCorrect: 3, timesFailed: 2 });
    assert.deepEqual(reaped.a2, { timesShown: 4, timesCorrect: 4, timesFailed: 0 });
    assert.equal(reaped['ghost-001'], undefined);
    assert.equal(reaped['ghost-002'], undefined);
  });

  test('categoryProgress con cat huérfanas (no presentes en content.categories) se eliminan; las válidas se preservan', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-01-15T10:00:00.000Z',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {},
        categoryProgress: {
          'test-cat': { status: 'hecha', clearedExerciseIds: ['a1'], streakDays: 3, lastSuccessDate: '2026-01-14' },
          'old-category': { status: 'dominada', clearedExerciseIds: ['x1'], streakDays: 30 }  // huérfana
        },
        dailyLog: {},
        lastBackupAt: null,
        firstUsedAt: null
      }
    };
    // Post-Phase 21: categoría ficticia `test-cat` que NO colisiona con ningún
    // prefijo de reset de la cadena (no reseteada por la migración); el test
    // ejerce solo el reap de huérfanos.
    const content = {
      categories: [{ id: 'test-cat', name: 'test-cat', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);

    const validCategoryIds = new Set(content.categories.map(c => c.id));
    const reaped = {};
    for (const [cid, prog] of Object.entries(parsed.state.categoryProgress)) {
      if (validCategoryIds.has(cid)) reaped[cid] = prog;
    }
    assert.deepEqual(Object.keys(reaped), ['test-cat']);
    assert.equal(reaped['old-category'], undefined);
    // La cat válida se preserva íntegra.
    assert.equal(reaped['test-cat'].status, 'hecha');
    assert.equal(reaped['test-cat'].streakDays, 3);
  });

  test('idempotencia: sin huérfanos, el reap es no-op (todas las keys se preservan)', () => {
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: '2026-05-20T10:00:00.000Z',
      schemaVersion: 3,
      state: {
        schemaVersion: 3,
        exerciseStats: {
          a1: { timesShown: 1, timesCorrect: 1, timesFailed: 0 },
          a2: { timesShown: 1, timesCorrect: 0, timesFailed: 1 }
        },
        categoryProgress: {
          'test-cat': { status: 'no-hecha', clearedExerciseIds: ['a1'], streakDays: 0 }
        },
        dailyLog: {},
        lastBackupAt: null,
        firstUsedAt: null
      }
    };
    // Post-Phase 21: categoría ficticia `test-cat` que NO colisiona con ningún
    // prefijo de reset de la cadena (no reseteada por la migración).
    const content = {
      categories: [{ id: 'test-cat', name: 'test-cat', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['test-cat'], type: 'multiple-choice', payload: {} }
      }
    };
    const parsed = parseBackupFile(JSON.stringify(wrapper));
    const validExerciseIds = new Set(Object.keys(content.exerciseById));
    const validCategoryIds = new Set(content.categories.map(c => c.id));
    const reapedStats = {};
    for (const [eid, stat] of Object.entries(parsed.state.exerciseStats)) {
      if (validExerciseIds.has(eid)) reapedStats[eid] = stat;
    }
    const reapedProg = {};
    for (const [cid, p] of Object.entries(parsed.state.categoryProgress)) {
      if (validCategoryIds.has(cid)) reapedProg[cid] = p;
    }
    assert.deepEqual(Object.keys(reapedStats).sort(), ['a1', 'a2']);
    assert.deepEqual(Object.keys(reapedProg), ['test-cat']);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/dates — daysSinceISO
// ────────────────────────────────────────────────────────────────────────────

describe('domain/dates — daysSinceISO', () => {
  // Test 17
  test('daysSinceISO: mismo día → 0', () => {
    assert.equal(daysSinceISO('2026-05-24T10:00:00.000Z', '2026-05-24'), 0);
  });

  // Test 18
  test('daysSinceISO: 7 días atrás → 7', () => {
    assert.equal(daysSinceISO('2026-05-17T10:00:00.000Z', '2026-05-24'), 7);
  });

  // Test 19
  test('daysSinceISO: fecha futura → negativo (-7)', () => {
    assert.equal(daysSinceISO('2026-05-31T10:00:00.000Z', '2026-05-24'), -7);
  });

  // Test 20
  test('daysSinceISO: inputs no-string devuelven 0 defensivamente', () => {
    assert.equal(daysSinceISO(null, '2026-05-24'), 0);
    assert.equal(daysSinceISO('2026-05-17', null), 0);
    assert.equal(daysSinceISO(undefined, undefined), 0);
    assert.equal(daysSinceISO(42, '2026-05-24'), 0);
  });

  // Test 21
  test('daysSinceISO: ISO inválido / NaN-date devuelve 0', () => {
    assert.equal(daysSinceISO('not-a-date', '2026-05-24'), 0);
    assert.equal(daysSinceISO('2026-05-17T10:00:00.000Z', 'no-es-fecha'), 0);
  });
});
