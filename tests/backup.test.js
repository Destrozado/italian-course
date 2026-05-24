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

  // Test 4
  test('blankState() devuelve shape v3 con lastBackupAt/firstUsedAt null', () => {
    const s = blankState();
    assert.equal(s.schemaVersion, 3);
    assert.deepEqual(s.exerciseStats, {});
    assert.deepEqual(s.categoryProgress, {});
    assert.deepEqual(s.dailyLog, {});
    assert.equal(s.lastBackupAt, null);
    assert.equal(s.firstUsedAt, null);
    // inFlightTest sigue omitido (undefined)
    assert.equal(s.inFlightTest, undefined);
    assert.equal(Object.prototype.hasOwnProperty.call(s, 'inFlightTest'), false,
      'blankState() v3 NO debe materializar inFlightTest como key explícita');
  });

  // Test 5 — usamos parseBackupFile como wrapper indirecto del dispatcher
  // porque `migrate()` es privado. Construimos un wrapper válido v1 y
  // verificamos que sale por la cadena 1→2→3.
  test('migración cadena v1 → v3 hidratada (via parseBackupFile)', () => {
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
    assert.equal(result.state.schemaVersion, 3);
    assert.deepEqual(result.state.exerciseStats, v1Wrapper.state.exerciseStats);
    assert.deepEqual(result.state.categoryProgress, {});
    assert.deepEqual(result.state.dailyLog, {});
    assert.equal(result.state.lastBackupAt, null);
    assert.equal(result.state.firstUsedAt, null);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// data/backup — parseBackupFile happy paths
// ────────────────────────────────────────────────────────────────────────────

describe('data/backup — parseBackupFile happy path', () => {
  // Test 6
  test('happy path v3: wrapper válido + state v3 preserva todos los campos', () => {
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
    assert.equal(r.state.schemaVersion, 3);
    assert.equal(r.summary.exportedAt, '2026-05-24T14:32:11.000Z');
    assert.equal(r.summary.categories, 0);
    assert.equal(r.summary.exercises, 0);
  });

  // Test 13 — migración explícita v1→v3 (duplicado de Test 5 pero desde el
  // describe block correspondiente para legibilidad del runner).
  test('migración v1 → v3 OK (state.schemaVersion=1 + wrapper.schemaVersion=1)', () => {
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
    assert.equal(r.state.schemaVersion, 3);
    assert.equal(r.state.lastBackupAt, null);
    assert.equal(r.state.firstUsedAt, null);
    assert.deepEqual(r.state.exerciseStats, wrapper.state.exerciseStats);
  });

  // Test 14
  test('migración v2 → v3 OK', () => {
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
    assert.equal(r.state.schemaVersion, 3);
    assert.equal(r.state.lastBackupAt, null);
    assert.equal(r.summary.categories, 1);
    assert.equal(r.summary.exercises, 1);
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

  // Test 11
  test('rejects future schemaVersion > 3 (menciona "versión más nueva")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 99,
      state: { schemaVersion: 99 }
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
          avere: {
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
    const content = {
      categories: [{ id: 'avere', name: 'avere', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['avere'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['avere'], type: 'multiple-choice', payload: {} },
        a3: { id: 'a3', categoryIds: ['avere'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);
    // Simula commitImport: parseBackupFile → applyNewExerciseRegression.
    const finalState = applyNewExerciseRegression(parsed.state, content);
    const cat = finalState.categoryProgress.avere;

    assert.equal(cat.status, 'no-hecha', 'avere debe demote tras detectar a3 nuevo en content');
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
          avere: {
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
    const content = {
      categories: [{ id: 'avere', name: 'avere', order: 1 }],
      exerciseById: {
        a1: { id: 'a1', categoryIds: ['avere'], type: 'multiple-choice', payload: {} },
        a2: { id: 'a2', categoryIds: ['avere'], type: 'multiple-choice', payload: {} }
      }
    };

    const parsed = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(parsed.ok, true);
    const finalState = applyNewExerciseRegression(parsed.state, content);
    const cat = finalState.categoryProgress.avere;

    assert.equal(cat.status, 'hecha');
    assert.equal(cat.streakDays, 7);
    assert.equal(cat.becameHechaAt, '2026-05-13');
    assert.deepEqual([...cat.clearedExerciseIds].sort(), ['a1', 'a2']);
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
