// tests/domain.test.js
//
// Tests del dominio puro + validator. Se ejecutan con:
//
//     node --test tests/
//
// Requiere Node 22 LTS o superior (por `t.mock.timers.enable({apis:['Date']})`).
//
// NOTA sobre TZ: el test "todayLocal handles end-of-month boundary" usa
// `new Date(2026, 11, 31, 23, 59, 59)` que se interpreta en huso LOCAL. Bajo
// TZ=UTC el tick(2000) también cruza medianoche local. En CI/runners con
// TZ exótico podría dar resultados distintos — documentado en README.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import { todayLocal } from '../src/domain/dates.js';
import { buildSession, exerciseWeight } from '../src/domain/session.js';
import { validateContent } from '../src/data/schema-validator.js';
import { applyImmediateFailure } from '../src/domain/progress.js';
import { multipleChoice } from '../src/exercise-types/multiple-choice.js';
import { registry } from '../src/exercise-types/index.js';
import { seededLcg } from './util/seeded-rng.js';

// ────────────────────────────────────────────────────────────────────────────
// domain/dates
// ────────────────────────────────────────────────────────────────────────────

describe('domain/dates', () => {
  test('todayLocal returns YYYY-MM-DD using local clock (2026-05-23)', (t) => {
    // Mes 0-indexed: 4 = Mayo
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 4, 23, 10, 0, 0).getTime() });
    assert.equal(todayLocal(), '2026-05-23');
  });

  test('todayLocal crosses local midnight boundary (2026-12-31 → 2027-01-01)', (t) => {
    // Mes 0-indexed: 11 = Diciembre. Hora local 23:59:58.
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 11, 31, 23, 59, 58).getTime() });
    assert.equal(todayLocal(), '2026-12-31');
    // Avanzar 3 segundos: cruzamos medianoche local
    t.mock.timers.tick(3000);
    assert.equal(todayLocal(), '2027-01-01');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/session
// ────────────────────────────────────────────────────────────────────────────

describe('domain/session', () => {
  test('exerciseWeight respects WEIGHT_CAP at timesShown=10', () => {
    assert.equal(exerciseWeight(0), 1);
    assert.equal(exerciseWeight(1), 1 / 2);
    assert.equal(exerciseWeight(10), 1 / 11);
    assert.equal(exerciseWeight(100), 1 / 11); // capped
    assert.equal(exerciseWeight(undefined), 1); // null-safe
  });

  test('buildSession reduces actualSize to pool length when pool < requested (D-13)', () => {
    // 8 ejercicios, pedimos 20 → debe devolver 8 sin repetidos.
    const exercises = Array.from({ length: 8 }, (_, i) => ({
      id: `a${i + 1}`,
      type: 'multiple-choice',
      categoryIds: ['avere'],
      payload: {}
    }));
    const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso', seededLcg(1234));
    assert.equal(result.actualSize, 8);
    assert.equal(result.exerciseIds.length, 8);
    // Sin repetidos (D-14)
    assert.equal(new Set(result.exerciseIds).size, 8);
  });

  test('buildSession with empty pool returns zero-length session (no throw)', () => {
    const result = buildSession(['avere'], [], { exerciseStats: {} }, 20, 'repaso');
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });

  test('buildSession filters by categoryIds (ejercicios de otra categoría se excluyen)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'g1', type: 'multiple-choice', categoryIds: ['genero'], payload: {} }
    ];
    const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso', seededLcg(42));
    assert.equal(result.actualSize, 2);
    assert.ok(!result.exerciseIds.includes('g1'));
  });
});

// ────────────────────────────────────────────────────────────────────────────
// domain/progress — split a tests/domain-progress.test.js en Phase 2 (D-52).
// La firma del export se extendió (state, sessionResult, content, today) y la
// suite creció a ≥12 tests, así que vive en archivo aparte.
// ────────────────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────────────────
// data/schema-validator
// ────────────────────────────────────────────────────────────────────────────

describe('data/schema-validator', () => {
  test('rejects unknown categoryId reference', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'a1',
            type: 'multiple-choice',
            categoryIds: ['ghost'],
            payload: { prompt: 'Io ___ fame.', options: ['ho', 'hai', 'ha'], correctIndex: 0 }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /ghost/.test(e.reason)),
      `Esperaba un error mencionando "ghost"; errores: ${JSON.stringify(result.errors)}`);
  });

  test('accumulates multiple errors in single pass (id duplicado + options=2 + prompt sin hueco)', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'dup',
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'sin hueco', options: ['ho', 'hai'], correctIndex: 0 }
          },
          {
            id: 'dup', // duplicado
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'Io ___ una macchina.', options: ['ho', 'hai', 'ha'], correctIndex: 5 }
          }
        ]
      }
    });
    assert.equal(result.ok, false);
    // Deberíamos ver: prompt sin "___", options.length=2, id duplicado, correctIndex fuera de rango.
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/___/.test(reasons), `falta error de prompt sin "___": ${reasons}`);
    assert.ok(/options/.test(reasons), `falta error de options inválido: ${reasons}`);
    assert.ok(/duplicado/.test(reasons), `falta error de id duplicado: ${reasons}`);
    assert.ok(/correctIndex/.test(reasons), `falta error de correctIndex fuera de rango: ${reasons}`);
  });

  test('accepts a well-formed content bundle', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere (auxiliar)', order: 1 }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          {
            id: 'avere-001',
            type: 'multiple-choice',
            categoryIds: ['avere'],
            payload: { prompt: 'Io ___ una macchina nuova.', options: ['ho', 'hai', 'ha', 'abbiamo'], correctIndex: 0 }
          }
        ]
      }
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/multiple-choice
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/multiple-choice', () => {
  test('grade returns true when response.index matches correctIndex', () => {
    const ex = { payload: { correctIndex: 2 } };
    assert.equal(multipleChoice.grade(ex, { index: 2 }), true);
  });

  test('grade returns false when response.index does not match', () => {
    const ex = { payload: { correctIndex: 2 } };
    assert.equal(multipleChoice.grade(ex, { index: 0 }), false);
    assert.equal(multipleChoice.grade(ex, { index: 1 }), false);
    assert.equal(multipleChoice.grade(ex, { index: 3 }), false);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// exercise-types/index — registry
// ────────────────────────────────────────────────────────────────────────────

describe('exercise-types/index', () => {
  test('registry exposes multiple-choice handler with grade()', () => {
    assert.ok(registry['multiple-choice'], 'registry debería tener una entrada "multiple-choice"');
    assert.equal(typeof registry['multiple-choice'].grade, 'function');
    // Misma identidad que el módulo (Test 9 del plan)
    assert.equal(registry['multiple-choice'], multipleChoice);
  });
});

// daysSinceISO tests live en tests/backup.test.js (co-located con los otros tests Phase 4).

// ────────────────────────────────────────────────────────────────────────────
// multi-cat real cascade — Phase 4 SEED-02 + Phase 5 SEED-03 integration
//
// Estos tests cierran SEED-02 (Phase 4) y SEED-03 (Phase 5) ejercitando la
// cascada D-54 sobre el contenido REAL committeado en TODOS los archivos de
// content/exercises/ (no solo avere.json). Iteración paramétrica: añadir un
// nuevo archivo con ejercicios multi-cat hace que esos cruces se prueben
// automáticamente sin tocar este test (cubre essere-300..305 al instante y
// cualquier categoría futura del mismo modo).
//
//   Iteración 1: para CADA archivo de content/exercises/, fallar el primer
//                ejercicio multi-cat propaga cascada inmediata a TODAS sus
//                categoryIds (status='no-hecha', racha=0, clearedExerciseIds=[]).
//   Iteración 2: el bundle completo (categories.json + todos los archivos de
//                exercises/) pasa validateContent sin errores — roundtrip de
//                schema sobre el contenido tal como vive en el repo.
// ────────────────────────────────────────────────────────────────────────────

const EXERCISES_DIR = new URL('../content/exercises/', import.meta.url);

function loadAllExerciseFiles() {
  const files = readdirSync(EXERCISES_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();
  return files.map(name => ({
    name,
    slug: name.replace(/\.json$/, ''),
    data: JSON.parse(readFileSync(new URL(name, EXERCISES_DIR), 'utf8'))
  }));
}

describe('multi-cat real cascade — SEED-02 (Phase 4) + SEED-03 (Phase 5) integration', () => {
  const files = loadAllExerciseFiles();

  for (const file of files) {
    test(`applyImmediateFailure on a real multi-cat exercise from ${file.name} propagates cascade to all its categoryIds`, () => {
      const multiCat = file.data.exercises.find(
        ex => Array.isArray(ex.categoryIds) && ex.categoryIds.length >= 2
      );

      // Skip files without multi-cat exercises (e.g., placeholder, single-cat
      // content). The cascade test is meaningful only when ≥2 categoryIds.
      if (!multiCat) {
        return;
      }

      assert.ok(
        multiCat.categoryIds.length >= 2,
        `multi-cat exercise ${multiCat.id} debe tener >=2 categoryIds (got ${multiCat.categoryIds.length})`
      );

      // Construir contentArg con la firma documentada en progress.js:290-296:
      //   content = {exerciseById: Record<string, {id, categoryIds, ...}>}.
      const contentArg = {
        exerciseById: Object.fromEntries(file.data.exercises.map(e => [e.id, e]))
      };

      // Estado v3 realista (Phase 4 schema): todas las categorías del cruce
      // DEMOTABLES desde 'hecha' con racha y clearedExerciseIds populados —
      // queremos verificar que la cascada las RESETEA.
      const state = {
        schemaVersion: 3,
        exerciseStats: {
          [multiCat.id]: { timesShown: 3, timesCorrect: 2, timesFailed: 1 }
        },
        categoryProgress: {},
        dailyLog: {},
        lastBackupAt: null,
        firstUsedAt: '2026-05-01T08:00:00.000Z'
      };
      for (const catId of multiCat.categoryIds) {
        state.categoryProgress[catId] = {
          status: 'hecha',
          clearedExerciseIds: [multiCat.id, 'some-other-id'],
          streakDays: 5,
          lastPracticedDate: '2026-05-20',
          lastSuccessDate: '2026-05-20',
          becameHechaAt: '2026-05-15',
          becameDominadaAt: undefined
        };
      }

      const today = '2026-05-24';
      const result = applyImmediateFailure(state, multiCat, contentArg, today);

      for (const catId of multiCat.categoryIds) {
        const cat = result.categoryProgress[catId];
        assert.equal(
          cat.status, 'no-hecha',
          `${file.slug}: ${catId} debe quedar 'no-hecha' tras fallo multi-cat (got ${cat.status})`
        );
        assert.equal(
          cat.streakDays, 0,
          `${file.slug}: ${catId} debe quedar con racha 0 (got ${cat.streakDays})`
        );
        assert.deepEqual(
          cat.clearedExerciseIds, [],
          `${file.slug}: ${catId} debe quedar con clearedExerciseIds=[] (got ${JSON.stringify(cat.clearedExerciseIds)})`
        );
        assert.equal(
          cat.lastPracticedDate, today,
          `${file.slug}: ${catId} debe actualizar lastPracticedDate a hoy (got ${cat.lastPracticedDate})`
        );
      }

      assert.ok(
        result.dailyLog[today],
        `${file.slug}: dailyLog[today] debe existir tras la cascada inmediata`
      );
      for (const catId of multiCat.categoryIds) {
        assert.ok(
          result.dailyLog[today].categoriesWithFailure.includes(catId),
          `${file.slug}: dailyLog[today].categoriesWithFailure debe incluir "${catId}"`
        );
      }
    });
  }

  test('whole content bundle (categories.json + all content/exercises/*.json) passes validateContent', () => {
    const categoriesRaw = JSON.parse(
      readFileSync(new URL('../content/categories.json', import.meta.url), 'utf8')
    );

    const exercisesByFile = {};
    for (const file of files) {
      exercisesByFile[`content/exercises/${file.name}`] = file.data.exercises;
    }

    const result = validateContent({
      categories: categoriesRaw.categories,
      exercisesByFile
    });

    assert.equal(
      result.ok, true,
      `validateContent debería aceptar el bundle completo del repo. Errores: ${JSON.stringify(result.errors, null, 2)}`
    );
    assert.deepEqual(result.errors, []);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 6 plan 01 (UX-01) — restartRepaso smoke
//
// Estos tests validan los invariantes dominio que sostienen el handler
// `restartRepaso()` añadido en src/screens/app.js. El handler vive en el
// screen layer (acoplado a Alpine/DOM) y NO se importa aquí — cubrimos los
// helpers PUROS que llama (`buildSession`) con escenarios que reproducen las
// condiciones del restart: state post-cascada D-54, determinismo del sampler
// para re-llamadas con misma seed, edge cuando el pool queda reducido.
//
// Cobertura D-101: la preservación de los fallos D-54 ya persistidos se ejerce
// indirectamente — restartRepaso() NO toca this.state ni saveState (ver Task 1
// commit), por lo que la PRESERVACIÓN se garantiza por inspección del helper
// (no por tests dominio). Lo que estos tests garantizan es que buildSession
// OPERA CORRECTAMENTE sobre un state que ya tiene una cascada aplicada (el
// sampler no crashea, sigue pickeando ejercicios del pool, devuelve un
// resultado válido).
// ────────────────────────────────────────────────────────────────────────────

describe('Phase 6 — restartRepaso smoke (UX-01)', () => {
  test('buildSession con state post-cascada D-54 preserva categoryIds y produce sample válido (restart escenario UX-01)', () => {
    // Fixture: 4 ejercicios en 2 categorías ('avere', 'prep'), 2 por categoría.
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'p1', type: 'multiple-choice', categoryIds: ['prep'], payload: {} },
      { id: 'p2', type: 'multiple-choice', categoryIds: ['prep'], payload: {} }
    ];

    // State simulado post-cascada D-54: el ejercicio p1 ya fue fallado (los
    // contadores monotónicos reflejan timesFailed > 0) y la categoría 'prep'
    // quedó reseteada a 'no-hecha' con racha 0 y clearedExerciseIds vacío.
    const stateAfterCascade = {
      exerciseStats: { p1: { timesShown: 1, timesCorrect: 0, timesFailed: 1 } },
      categoryProgress: {
        prep: { status: 'no-hecha', streakDays: 0, clearedExerciseIds: [] }
      }
    };

    // Restart: re-llamar buildSession con MISMAS categoryIds del picker.
    const result = buildSession(['avere', 'prep'], exercises, stateAfterCascade, 20, 'repaso', seededLcg(42));

    assert.ok(result.exerciseIds.length > 0, 'el sampler devuelve ≥1 ejercicio tras restart');
    assert.equal(
      new Set(result.exerciseIds).size, result.exerciseIds.length,
      'sin duplicados en el sample post-restart'
    );
    // Las 2 categorías presentes — buildSession con MISMAS categoryIds cubre
    // ambas tras el restart (GUARANTEE phase D-49).
    const sampledCats = new Set(
      result.exerciseIds.map(id => exercises.find(e => e.id === id).categoryIds[0])
    );
    assert.ok(sampledCats.has('avere'), 'avere presente tras restart');
    assert.ok(sampledCats.has('prep'), 'prep presente tras restart');
  });

  test('buildSession llamado dos veces con misma seed produce el mismo sample (smoke determinismo del re-sampling post-restart)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a3', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a4', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
    ];
    const state = { exerciseStats: {} };

    const result1 = buildSession(['avere'], exercises, state, 20, 'repaso', seededLcg(1234));
    const result2 = buildSession(['avere'], exercises, state, 20, 'repaso', seededLcg(1234));

    assert.deepEqual(
      result1.exerciseIds, result2.exerciseIds,
      'mismo orden con misma seed (sampler determinista)'
    );
    assert.equal(
      result1.actualSize, result2.actualSize,
      'mismo actualSize con misma seed'
    );
  });

  test('buildSession con pool reducido a 1 ejercicio devuelve actualSize 1 (edge restart cuando categoría tiene 1 sólo ejercicio)', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
    ];
    const state = { exerciseStats: {} };

    const result = buildSession(['avere'], exercises, state, 20, 'repaso', seededLcg(99));

    assert.equal(result.exerciseIds.length, 1, 'pool de 1 → sample de 1');
    assert.equal(result.actualSize, 1, 'actualSize refleja el pool reducido (D-13)');
    assert.equal(result.exerciseIds[0], 'a1');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 6 plan 02 (UX-02) — sessionResults shape extendido
//
// Estos tests validan el shape D-105 de cada item en `sessionResults` tras el
// push extendido de `applyResultToSession(ex, correct, userAnswer)` (D-106).
// El helper vive en el screen layer (acoplado a Alpine) y NO se importa aquí
// — testeamos el CONTRATO del array (los plain objects que el screen pushea
// son lo que el summary y el inFlightTest leen).
//
// Los 4 casos del shape uniforme (D-105):
//   - userAnswer: string (multi-choice — texto literal de la opción clickada)
//   - userAnswer: string[] (word-buttons — clon defensivo del array formado)
//   - userAnswer: {left, right} (match — primer pareo erróneo)
//   - userAnswer: null (match completado sin fallos, o backfill v4 pre-Phase 6)
//
// Y el filter que la sección "Errores cometidos" usa para renderizar:
// `sessionResults.filter(r => !r.correct)` debe seleccionar sólo los items
// con correct=false (independientemente del shape de userAnswer).
// ────────────────────────────────────────────────────────────────────────────

describe('Phase 6 — sessionResults shape extendido (UX-02)', () => {
  test('sessionResults push acepta userAnswer string (multi-choice)', () => {
    // Mock del push de applyResultToSession para multi-choice — el screen
    // hace exactamente esto cuando el autor falla un multi-choice clickando
    // la opción equivocada (texto literal).
    const sessionResults = [];
    sessionResults.push({ exerciseId: 'avere-001', correct: false, userAnswer: 'hai' });

    assert.equal(sessionResults.length, 1);
    assert.equal(sessionResults[0].exerciseId, 'avere-001');
    assert.equal(sessionResults[0].correct, false);
    assert.equal(typeof sessionResults[0].userAnswer, 'string');
    assert.equal(sessionResults[0].userAnswer, 'hai');
  });

  test('sessionResults push acepta userAnswer array (word-buttons)', () => {
    // Mock del push para word-buttons — el screen pasa [...this.wordButtonsAnswer]
    // (clon defensivo). El summary renderiza con .join(' ').
    const sessionResults = [];
    sessionResults.push({
      exerciseId: 'profesiones-100',
      correct: false,
      userAnswer: ['io', 'ha', 'un', 'libro']
    });

    assert.equal(sessionResults.length, 1);
    assert.equal(sessionResults[0].correct, false);
    assert.ok(Array.isArray(sessionResults[0].userAnswer),
      'userAnswer en word-buttons debe ser un array');
    assert.equal(sessionResults[0].userAnswer.join(' '), 'io ha un libro',
      '.join(\' \') produce la frase original que el autor construyó');
    assert.equal(sessionResults[0].userAnswer.length, 4);
  });

  test('sessionResults push acepta userAnswer object (match firstWrongPair)', () => {
    // Mock del push para match con fallo — el screen pasa el matchFirstWrongPair
    // capturado bajo guard `!matchHadFailure` (D-107).
    const sessionResults = [];
    sessionResults.push({
      exerciseId: 'avere-200',
      correct: false,
      userAnswer: { left: 'casa', right: 'il' }
    });

    assert.equal(sessionResults.length, 1);
    assert.equal(sessionResults[0].correct, false);
    assert.equal(typeof sessionResults[0].userAnswer, 'object');
    assert.ok(sessionResults[0].userAnswer !== null, 'userAnswer no es null en match con fallo');
    assert.equal(sessionResults[0].userAnswer.left, 'casa');
    assert.equal(sessionResults[0].userAnswer.right, 'il');
  });

  test('sessionResults push acepta userAnswer null (match completado sin fallos o backfill v4)', () => {
    // Mock del push para 2 casos donde userAnswer es null:
    //   1. Match correcto (matchFirstWrongPair sigue siendo null al completar).
    //   2. Backfill de migrate3to4 — entries pre-Phase 6 sin userAnswer.
    const sessionResults = [];
    sessionResults.push({ exerciseId: 'avere-202', correct: true, userAnswer: null });
    sessionResults.push({ exerciseId: 'old-failure', correct: false, userAnswer: null });

    assert.equal(sessionResults.length, 2);
    assert.equal(sessionResults[0].userAnswer, null,
      'match correcto: userAnswer=null porque matchFirstWrongPair nunca se setteó');
    assert.equal(sessionResults[1].userAnswer, null,
      'pre-Phase 6 backfill: userAnswer=null para entries sin captura previa');
    // El filter de la sección Errores aún debe respetar correct=false.
    const failed = sessionResults.filter(r => !r.correct);
    assert.equal(failed.length, 1);
    assert.equal(failed[0].exerciseId, 'old-failure');
  });

  test('sessionResults.filter(!correct) filtra correctamente para renderizar la sección', () => {
    // Mock de un mix realista post-sesión: 1 acierto multi-choice + 1 fallo
    // word-buttons + 1 acierto match + 1 fallo match. El filter del template
    // selecciona los 2 errores.
    const sessionResults = [
      { exerciseId: 'a1', correct: true,  userAnswer: 'ho' },
      { exerciseId: 'a2', correct: false, userAnswer: ['io', 'ha', 'un'] },
      { exerciseId: 'm1', correct: true,  userAnswer: null },
      { exerciseId: 'm2', correct: false, userAnswer: { left: 'casa', right: 'il' } }
    ];

    const errors = sessionResults.filter(r => !r.correct);
    assert.equal(errors.length, 2, 'filter !correct selecciona sólo los 2 errores');
    assert.deepEqual(errors.map(e => e.exerciseId), ['a2', 'm2']);
    // El shape de userAnswer se preserva tal cual en el filtrado.
    assert.ok(Array.isArray(errors[0].userAnswer));
    assert.equal(typeof errors[1].userAnswer, 'object');
    assert.equal(errors[1].userAnswer.left, 'casa');
  });
});
