// tests/screen-timer-mode.test.js
//
// Quick 260615-puq — Modo examen contrarreloj (tiempo POR respuesta) en las
// pantallas `session` (modos `repaso` y `test-completo`). NO canciones.
//
// Estrategia (coherente con tests/screen-context-label.test.js):
//   - Tests BEHAVIORALES del helper PURO `sessionTimeLimitMs(ex)` (Task 1):
//     llamado como función de módulo, sin Alpine ni `this`. Verifica los
//     límites por tipo (5000 MC / 10000 match / 2000×nº-palabras word-buttons).
//   - Source-asserts (windowed slicing con readFileSync) del cableado de
//     app.js y del markup de index.html (Task 3): blindan el invariante
//     "cero timers huérfanos" y la presencia del checkbox + display.
//
// Se ejecuta con:
//     node --test tests/*.test.js   (glob obligatorio en Node 22.20)
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { sessionTimeLimitMs } from '../src/screens/app.js';

// ─────────────────────────────────────────────────────────────────────────────
// Behavioral — helper PURO sessionTimeLimitMs(ex) (Task 1, RED→GREEN)
// ─────────────────────────────────────────────────────────────────────────────

describe('sessionTimeLimitMs — helper puro de límite por tipo', () => {
  test('multiple-choice → 5000 ms', () => {
    assert.equal(sessionTimeLimitMs({ type: 'multiple-choice' }), 5000);
  });

  test('match → 10000 ms', () => {
    assert.equal(sessionTimeLimitMs({ type: 'match' }), 10000);
  });

  test('word-buttons de 3 palabras → 6000 ms (2000×3)', () => {
    assert.equal(
      sessionTimeLimitMs({ type: 'word-buttons', payload: { answer: ['a', 'b', 'c'] } }),
      6000
    );
  });

  test('word-buttons de 6 palabras → 12000 ms (2000×6)', () => {
    assert.equal(
      sessionTimeLimitMs({
        type: 'word-buttons',
        payload: { answer: ['a', 'b', 'c', 'd', 'e', 'f'] }
      }),
      12000
    );
  });

  test('word-buttons de 1 palabra → 2000 ms (2000×1)', () => {
    assert.equal(
      sessionTimeLimitMs({ type: 'word-buttons', payload: { answer: ['unica'] } }),
      2000
    );
  });

  test('word-buttons NO cuenta distractors (solo payload.answer.length)', () => {
    assert.equal(
      sessionTimeLimitMs({
        type: 'word-buttons',
        payload: { answer: ['a', 'b'], distractors: ['x', 'y', 'z'] }
      }),
      4000
    );
  });

  test('es puro: no depende de this — invocado como función libre', () => {
    // Si dependiera de this.*, lanzaría al llamarlo desligado del objeto.
    const fn = sessionTimeLimitMs;
    assert.equal(fn({ type: 'match' }), 10000);
  });
});
