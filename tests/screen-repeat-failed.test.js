// tests/screen-repeat-failed.test.js
//
// Quick 260713-ng7 — "Repetir las falladas": reintento REVIEW-ONLY que relanza
// una sesión conteniendo SOLO los ejercicios fallados en la ronda recién
// terminada, reusando la pantalla de sesión existente, SIN tocar racha,
// contadores de progreso, motor de repetición ni localStorage.
//
// Estrategia MIXTA (coherente con tests/screen-context-label.test.js):
//   - behavioral: instanciando el factory `appShell` y fijando estado mínimo,
//   - source-presence: aserciones textuales acotadas por ventana sobre
//     `src/screens/app.js` e `index.html` (los guards del invariante).
//
// El invariante CENTRAL bajo test: el flujo review-only NO reasigna `this.state`
// (identidad preservada → cero escritura a localStorage).
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { appShell } from '../src/screens/app.js';

const appJsPath = new URL('../src/screens/app.js', import.meta.url);
const appSrc = readFileSync(appJsPath, 'utf8');

const indexHtmlPath = new URL('../index.html', import.meta.url);
const indexHtml = readFileSync(indexHtmlPath, 'utf8');

// Slot mínimo válido para que sessionCurrentExercise + initSubStateForExercise
// no rompan bajo node (multiple-choice lee payload.options.length).
function slot(id) {
  return {
    id,
    type: 'multiple-choice',
    categoryIds: [],
    variants: [{ prompt: '', options: ['x'], correctIndex: 0 }],
    explanation: ''
  };
}

// Ventana de código entre `marker` y el siguiente `marker` de método (para
// acotar aserciones de presencia y no contaminar con vecinos).
function windowFrom(src, startRe, span = 2500) {
  const idx = src.search(startRe);
  if (idx < 0) return '';
  return src.slice(idx, idx + span);
}

// ─────────────────────────────────────────────────────────────────────────────
// Behavioral — startFailedReview() deriva las falladas y NO muta this.state
// ─────────────────────────────────────────────────────────────────────────────

describe('startFailedReview — comportamiento review-only', () => {
  test('deriva SOLO falladas con slot vivo (excluye correctas y sin slot), preserva variante y no reasigna this.state', () => {
    const app = appShell(Promise.resolve());
    app.content = { slotById: { a: slot('a'), c: slot('c') }, categories: [] };
    app.summarySessionResults = [
      { exerciseId: 'a', correct: false, variantIndex: 2 },
      { exerciseId: 'b', correct: true },              // correcta → excluir
      { exerciseId: 'c', correct: false, variantIndex: 0 },
      { exerciseId: 'x', correct: false }              // sin slot → excluir
    ];
    const stateRef = (app.state = { marker: true });

    app.startFailedReview();

    assert.deepEqual(app.sessionExerciseIds, ['a', 'c'],
      'sessionExerciseIds debe contener SOLO las falladas con slot vivo, en orden');
    assert.deepEqual(app.sessionVariantIndices, [2, 0],
      'sessionVariantIndices paralelo (r.variantIndex ?? 0) → misma variante fallada');
    assert.equal(app.sessionReviewOnly, true,
      'sessionReviewOnly debe encenderse');
    assert.equal(app.sessionMode, 'repaso-fallidas',
      'sessionMode distinto de repaso/test-completo → persistInFlightTest nunca dispara');
    assert.equal(app.currentScreen, 'session',
      'reusa la pantalla de sesión existente');
    assert.equal(app.state, stateRef,
      'this.state NO se reasigna (identidad preservada → cero escritura a localStorage)');
  });

  test('sin falladas → no-op (no cambia de pantalla, sessionExerciseIds vacío)', () => {
    const app = appShell(Promise.resolve());
    app.content = { slotById: { a: slot('a') }, categories: [] };
    app.summarySessionResults = [{ exerciseId: 'a', correct: true }];
    app.currentScreen = 'summary';

    app.startFailedReview();

    assert.equal(app.sessionExerciseIds.length, 0,
      'sin falladas → sessionExerciseIds queda vacío');
    assert.notEqual(app.currentScreen, 'session',
      'sin falladas → NO transiciona a la pantalla de sesión (no-op)');
  });

  test('variantIndex ausente en una fallada → default 0', () => {
    const app = appShell(Promise.resolve());
    app.content = { slotById: { a: slot('a') }, categories: [] };
    app.summarySessionResults = [{ exerciseId: 'a', correct: false }];
    app.state = { marker: true };

    app.startFailedReview();

    assert.deepEqual(app.sessionVariantIndices, [0],
      'variantIndex undefined → 0 (r.variantIndex ?? 0)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Source-presence — los guards del invariante review-only
// ─────────────────────────────────────────────────────────────────────────────

describe('startFailedReview — guards de persistencia (source)', () => {
  test('sessionReviewOnly está declarado en el sub-estado de sesión', () => {
    assert.ok(/sessionReviewOnly:\s*false/.test(appSrc),
      'debe declararse el flag runtime sessionReviewOnly: false');
  });

  test('resetSession() resetea sessionReviewOnly = false', () => {
    const w = windowFrom(appSrc, /resetSession\s*\(\)\s*\{/);
    assert.ok(w.includes('this.sessionReviewOnly = false'),
      'resetSession (chokepoint volver-al-home) debe resetear el flag');
  });

  test('applyResultToSession envuelve applyImmediateFailure/saveState en !this.sessionReviewOnly', () => {
    const w = windowFrom(appSrc, /applyResultToSession\s*\(ex, correct, userAnswer\)\s*\{/);
    assert.ok(w.includes('if (!this.sessionReviewOnly)'),
      'la rama else de fallo debe estar gated por !this.sessionReviewOnly');
    // el applyImmediateFailure debe caer DESPUÉS del guard.
    const guardIdx = w.indexOf('if (!this.sessionReviewOnly)');
    const failIdx = w.indexOf('applyImmediateFailure');
    assert.ok(guardIdx > -1 && failIdx > guardIdx,
      'applyImmediateFailure debe estar dentro del bloque gated');
  });

  test('matchPickRight envuelve applyImmediateFailure/saveState en !this.sessionReviewOnly', () => {
    const w = windowFrom(appSrc, /matchPickRight\s*\(/, 4000);
    assert.ok(w.includes('if (!this.sessionReviewOnly)'),
      'el primer fallo del match debe estar gated por !this.sessionReviewOnly');
    const guardIdx = w.indexOf('if (!this.sessionReviewOnly)');
    const failIdx = w.indexOf('applyImmediateFailure');
    assert.ok(guardIdx > -1 && failIdx > guardIdx,
      'applyImmediateFailure del match debe estar dentro del bloque gated');
  });

  test('sessionAdvance NO llama completeSession en review-only (vuelve a summary)', () => {
    const w = windowFrom(appSrc, /sessionAdvance\s*\(\)\s*\{/);
    assert.ok(w.includes('this.sessionReviewOnly'),
      'sessionAdvance debe ramificar por sessionReviewOnly');
    assert.ok(/if\s*\(this\.sessionReviewOnly\)[\s\S]*this\.currentScreen = 'summary'/.test(w),
      'la rama review-only debe volver a la pantalla summary sin recomputar');
    // en esa rama la palabra completeSession solo debe aparecer en el else.
    const reviewBranch = w.slice(w.indexOf('if (this.sessionReviewOnly)'), w.indexOf('} else {', w.indexOf('if (this.sessionReviewOnly)')));
    assert.ok(!reviewBranch.includes('completeSession'),
      'la rama review-only NO debe invocar completeSession()');
  });

  test('sessionContextLabel cubre el case repaso-fallidas', () => {
    const w = windowFrom(appSrc, /get sessionContextLabel\s*\(\)\s*\{/);
    assert.ok(w.includes("'repaso-fallidas'"),
      "el getter debe tener case 'repaso-fallidas'");
  });
});

describe('index.html — botón "Repetir las falladas" (source)', () => {
  test('contiene el botón con @click=startFailedReview() y texto en español', () => {
    assert.ok(indexHtml.includes('startFailedReview()'),
      'el botón debe enganchar startFailedReview()');
    assert.ok(indexHtml.includes('Repetir las falladas'),
      'texto literal en español "Repetir las falladas"');
  });

  test('el x-show usa el predicado canónico de falladas-con-slot', () => {
    assert.ok(indexHtml.includes('summarySessionResults.some(r => !r.correct && content.slotById[r.exerciseId])'),
      'el botón debe aparecer si y solo si hay falladas con slot vivo (predicado canónico)');
  });
});
