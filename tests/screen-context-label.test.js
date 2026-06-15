// tests/screen-context-label.test.js
//
// Quick 260615-hhp — Título de ubicación/contexto (`sessionContextLabel`)
// mostrado encima del progreso en las pantallas session, cancion, summary y
// cancion-summary.
//
// Estrategia (coherente con tests/screen-canciones.test.js): el factory
// `appShell` SÍ es instanciable bajo node para getters puramente derivados
// (sin Alpine ni Promise-handoff en el camino), así que aquí combinamos:
//   - aserciones de presencia textual / windowed slicing sobre
//     `src/screens/app.js` (la forma del getter y sus guards), y
//   - aserciones behaviorales instanciando el factory y fijando estado mínimo.
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

// Ventana del cuerpo del getter sessionContextLabel (desde su definición hasta
// el siguiente `get ` o cierre del objeto), para acotar las aserciones de
// presencia textual al getter y no contaminarse con vecinos.
const ctxIdx = appSrc.search(/get sessionContextLabel\s*\(\)\s*\{/);
let ctxEnd = ctxIdx + 2000;
if (ctxIdx > -1) {
  const nextGetter = appSrc.indexOf('\n    get ', ctxIdx + 30);
  if (nextGetter > -1) ctxEnd = nextGetter;
}
const ctxWindow = ctxIdx > -1 ? appSrc.slice(ctxIdx, ctxEnd) : '';

// ─────────────────────────────────────────────────────────────────────────────
// Presence-check sobre el source (forma del getter + guards)
// ─────────────────────────────────────────────────────────────────────────────

describe('sessionContextLabel — forma del getter (source)', () => {
  test('src/screens/app.js define get sessionContextLabel()', () => {
    assert.ok(ctxIdx > -1,
      'sessionContextLabel debe estar definido como getter sin argumentos');
  });

  test('el getter referencia el estado real (sessionMode, pickerCheckedCategoryIds, sessionExerciseIds, content.categories, content.songsById)', () => {
    assert.ok(ctxWindow.includes('this.sessionMode'),
      'debe leer this.sessionMode (switch por modo)');
    assert.ok(ctxWindow.includes('pickerCheckedCategoryIds'),
      'debe leer pickerCheckedCategoryIds (categorías de la sesión)');
    assert.ok(ctxWindow.includes('sessionExerciseIds'),
      'debe usar sessionExerciseIds (N real de ejercicios)');
    assert.ok(ctxWindow.includes('content.categories'),
      'debe resolver el nombre contra content.categories');
    assert.ok(ctxWindow.includes('content.songsById'),
      'debe resolver el título de canción contra content.songsById');
    assert.ok(ctxWindow.includes('songActiveId'),
      'debe usar songActiveId para la canción activa');
  });

  test('el getter contiene los literales de los 3 modos con prefijo', () => {
    assert.ok(ctxWindow.includes("'Examen'") || ctxWindow.includes('Examen'),
      "debe contener el literal 'Examen'");
    assert.ok(ctxWindow.includes('Repaso ('),
      "debe contener el literal 'Repaso (' (formato Repaso)");
    assert.ok(ctxWindow.includes('Canción:'),
      "debe contener el literal 'Canción:'");
  });

  test('NO hardcodea el número 20 dentro del getter (usa .length real)', () => {
    assert.ok(!/\b20\b/.test(ctxWindow),
      'el formato Repaso debe usar sessionExerciseIds.length, NUNCA 20 hardcodeado (CONTEXT §2)');
    assert.ok(ctxWindow.includes('sessionExerciseIds.length'),
      'el N de Repaso debe ser sessionExerciseIds.length');
  });

  test('tiene guard defensivo return "" para el tick de unmount', () => {
    assert.ok(/if\s*\(\s*!this\.content\s*\)\s*return\s*''/.test(ctxWindow),
      'debe tener guard inicial if (!this.content) return "" (double-defense Alpine)');
    assert.ok(ctxWindow.includes("return ''"),
      'debe devolver "" en el caso por defecto (sessionMode null / no soportado)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Behavioral — instanciando el factory (getter puramente derivado, read-only)
// ─────────────────────────────────────────────────────────────────────────────

describe('sessionContextLabel — comportamiento por modo', () => {
  function makeApp() {
    const app = appShell(Promise.resolve());
    app.content = {
      categories: [
        { id: 'preposiciones', name: 'Preposizioni', order: 3 },
        { id: 'avere', name: 'Avere (presente indicativo)', order: 1 }
      ],
      songsById: {
        solo: { id: 'solo', title: 'Solo — Ultimo' }
      }
    };
    return app;
  }

  test('Examen de 1 categoría → "Examen: <nombre>"', () => {
    const app = makeApp();
    app.sessionMode = 'test-completo';
    app.pickerCheckedCategoryIds = ['preposiciones'];
    assert.equal(app.sessionContextLabel, 'Examen: Preposizioni');
  });

  test('Examen single-cat con id desconocido → fallback al id', () => {
    const app = makeApp();
    app.sessionMode = 'test-completo';
    app.pickerCheckedCategoryIds = ['categoria-fantasma'];
    assert.equal(app.sessionContextLabel, 'Examen: categoria-fantasma');
  });

  test('Examen multi-categoría → "Examen" genérico (sin listar nombres)', () => {
    const app = makeApp();
    app.sessionMode = 'test-completo';
    app.pickerCheckedCategoryIds = ['preposiciones', 'avere'];
    assert.equal(app.sessionContextLabel, 'Examen');
  });

  test('Examen sin categorías (vacío) → "Examen" genérico', () => {
    const app = makeApp();
    app.sessionMode = 'test-completo';
    app.pickerCheckedCategoryIds = [];
    assert.equal(app.sessionContextLabel, 'Examen');
  });

  test('Repaso → "Repaso (<N> ejercicios)" con N real (no 20)', () => {
    const app = makeApp();
    app.sessionMode = 'repaso';
    app.sessionExerciseIds = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    assert.equal(app.sessionContextLabel, 'Repaso (7 ejercicios)');
  });

  test('Canción → "Canción: <title>"', () => {
    const app = makeApp();
    app.sessionMode = 'cancion';
    app.songActiveId = 'solo';
    assert.equal(app.sessionContextLabel, 'Canción: Solo — Ultimo');
  });

  test('sessionMode null → "" (caso vacío)', () => {
    const app = makeApp();
    app.sessionMode = null;
    assert.equal(app.sessionContextLabel, '');
  });

  test('content no cargado → "" (defensa anti-TypeError del unmount)', () => {
    const app = appShell(Promise.resolve());
    app.content = null;
    app.sessionMode = 'test-completo';
    app.pickerCheckedCategoryIds = ['preposiciones'];
    assert.equal(app.sessionContextLabel, '');
  });
});
