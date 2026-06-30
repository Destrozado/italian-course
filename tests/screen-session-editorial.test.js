// tests/screen-session-editorial.test.js
//
// Phase 33 Plan 01 (EX-01 / EX-02) — Cimientos Editoriale de las pantallas de
// ejercicio: los getters presentacionales nuevos para la barra superior
// (progreso % + contador NN/NN) y el troceado del prompt sobre el hueco `___`,
// más los tokens de tinte post-corrección en app.css.
//
// Estrategia (espejo de tests/screen-context-label.test.js): el factory
// `appShell` es instanciable bajo node para getters puramente derivados, así
// que combinamos:
//   - aserciones de presencia sobre app.css (tokens) y app.js (forma+guards), y
//   - aserciones behaviorales instanciando el factory y fijando estado mínimo.
//
// Se ejecuta con:  node --test tests/*.test.js   (Node 22 LTS o superior)
//
// BROWNFIELD UI-ONLY: estos getters son lecturas derivadas read-only; NO tocan
// el motor (cascada D-54, applyResultToSession, sampler, persistencia).

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { appShell } from '../src/screens/app.js';

const appJsPath = new URL('../src/screens/app.js', import.meta.url);
const appSrc = readFileSync(appJsPath, 'utf8');
const cssPath = new URL('../app.css', import.meta.url);
const cssSrc = readFileSync(cssPath, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// app.css — tokens de tinte post-corrección (UI-SPEC §Color)
// ─────────────────────────────────────────────────────────────────────────────

describe('app.css — tokens de tinte post-corrección (Phase 33)', () => {
  test('define los seis tokens --ed-*-tint con los hex exactos del UI-SPEC', () => {
    assert.ok(cssSrc.includes('--ed-green-tint: #e8f1ea'), 'green-tint');
    assert.ok(cssSrc.includes('--ed-green-tint-border: #cfe3d6'), 'green-tint-border');
    assert.ok(cssSrc.includes('--ed-green-on-tint: #23603f'), 'green-on-tint');
    assert.ok(cssSrc.includes('--ed-red-tint: #f6e9e6'), 'red-tint');
    assert.ok(cssSrc.includes('--ed-red-tint-border: #ecd3cc'), 'red-tint-border');
    assert.ok(cssSrc.includes('--ed-red-text: #8f3322'), 'red-text');
  });

  test('NO redefine los tokens de paleta base Phase 32 (siguen 1 vez)', () => {
    // --ed-green se define una sola vez (la base de Phase 32); el tinte usa
    // nombres nuevos (--ed-green-tint*) y no re-declara --ed-green.
    const greenDefs = (cssSrc.match(/^\s*--ed-green:\s/gm) || []).length;
    assert.equal(greenDefs, 1, '--ed-green base no debe redefinirse');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// app.js — forma de los getters nuevos (source) + guards
// ─────────────────────────────────────────────────────────────────────────────

describe('app.js — getters presentacionales nuevos (forma)', () => {
  test('define get sessionProgressPercent(), sessionProgressCounter(), sessionPromptParts()', () => {
    assert.ok(/get sessionProgressPercent\s*\(\)/.test(appSrc), 'sessionProgressPercent');
    assert.ok(/get sessionProgressCounter\s*\(\)/.test(appSrc), 'sessionProgressCounter');
    assert.ok(/get sessionPromptParts\s*\(\)/.test(appSrc), 'sessionPromptParts');
  });

  test('sessionPromptParts arranca con el guard double-defense del unmount', () => {
    const idx = appSrc.search(/get sessionPromptParts\s*\(\)\s*\{/);
    assert.ok(idx > -1);
    let end = appSrc.indexOf('\n    get ', idx + 30);
    if (end === -1) end = idx + 600;
    const win = appSrc.slice(idx, end);
    assert.ok(/if\s*\(\s*!this\.sessionCurrentExercise\s*\)\s*return\s*\[\]/.test(win),
      'debe tener if (!this.sessionCurrentExercise) return []');
    assert.ok(win.includes("split('___')"), 'debe trocear sobre el literal ___');
  });

  test('NO introduce x-html en app.js (anti-XSS T-02-01)', () => {
    assert.ok(!/x-html/.test(appSrc), 'app.js no debe contener x-html');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Behavioral — instanciando el factory (getters read-only derivados)
// ─────────────────────────────────────────────────────────────────────────────

describe('sessionProgressPercent / sessionProgressCounter — comportamiento', () => {
  function makeApp() {
    return appShell(Promise.resolve());
  }

  test('cursor 0 / length 20 → percent 5', () => {
    const app = makeApp();
    app.sessionExerciseIds = Array.from({ length: 20 }, (_, i) => 'e' + i);
    app.sessionCursor = 0;
    assert.equal(app.sessionProgressPercent, 5);
  });

  test('cursor 19 / length 20 → percent 100', () => {
    const app = makeApp();
    app.sessionExerciseIds = Array.from({ length: 20 }, (_, i) => 'e' + i);
    app.sessionCursor = 19;
    assert.equal(app.sessionProgressPercent, 100);
  });

  test('length 0 → percent 0 (sin divide-by-zero)', () => {
    const app = makeApp();
    app.sessionExerciseIds = [];
    app.sessionCursor = 0;
    assert.equal(app.sessionProgressPercent, 0);
  });

  test('cursor 0 / length 20 → counter "1/20"', () => {
    const app = makeApp();
    app.sessionExerciseIds = Array.from({ length: 20 }, (_, i) => 'e' + i);
    app.sessionCursor = 0;
    assert.equal(app.sessionProgressCounter, '1/20');
  });

  test('cursor 19 / length 20 → counter "20/20"', () => {
    const app = makeApp();
    app.sessionExerciseIds = Array.from({ length: 20 }, (_, i) => 'e' + i);
    app.sessionCursor = 19;
    assert.equal(app.sessionProgressCounter, '20/20');
  });
});

describe('sessionPromptParts — troceado del prompt sobre ___', () => {
  function makeAppWithPrompt(prompt) {
    const app = appShell(Promise.resolve());
    app.content = {
      slotById: {
        ex1: {
          id: 'ex1',
          type: 'multiple-choice',
          categoryIds: ['avere'],
          explanation: '',
          variants: [{ prompt, options: ['a', 'b'], correctIndex: 0 }]
        }
      }
    };
    app.sessionExerciseIds = ['ex1'];
    app.sessionVariantIndices = [0];
    app.sessionCursor = 0;
    return app;
  }

  test('prompt con ___ → dos partes (texto antes / texto después)', () => {
    const app = makeAppWithPrompt('Lui ___ ventidue anni.');
    assert.deepEqual(app.sessionPromptParts, ['Lui ', ' ventidue anni.']);
  });

  test('prompt sin ___ → array de un solo elemento (no lanza)', () => {
    const app = makeAppWithPrompt('Frase sin hueco.');
    assert.deepEqual(app.sessionPromptParts, ['Frase sin hueco.']);
  });

  test('sin ejercicio actual (unmount tick) → [] (guard defensivo)', () => {
    const app = appShell(Promise.resolve());
    app.content = null;
    app.sessionExerciseIds = [];
    app.sessionCursor = 0;
    assert.deepEqual(app.sessionPromptParts, []);
  });

  test('prompt undefined → [""] (coerción defensiva, no lanza)', () => {
    const app = appShell(Promise.resolve());
    app.content = {
      slotById: {
        ex1: { id: 'ex1', type: 'multiple-choice', categoryIds: [], explanation: '', variants: [{ options: ['a'], correctIndex: 0 }] }
      }
    };
    app.sessionExerciseIds = ['ex1'];
    app.sessionVariantIndices = [0];
    app.sessionCursor = 0;
    assert.deepEqual(app.sessionPromptParts, ['']);
  });
});
