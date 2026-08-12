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
//     node --test tests/*.test.js tests/fixtures/*.test.js
//     (los DOS globs son obligatorios en Node 22.20 — DEUDA-01 / D-45-01)
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

// ─────────────────────────────────────────────────────────────────────────────
// Source-asserts (Task 3) — cableado en app.js (windowed slicing) + markup
// ─────────────────────────────────────────────────────────────────────────────

const appJsPath = new URL('../src/screens/app.js', import.meta.url);
const appSrc = readFileSync(appJsPath, 'utf8');

const indexPath = new URL('../index.html', import.meta.url);
const indexSrc = readFileSync(indexPath, 'utf8');

// Devuelve la ventana del cuerpo de un método `name(` hasta el siguiente
// `\n    <ident>(` o `\n    get ` (heurística coherente con ctxWindow de
// screen-context-label.test.js). Acota el assert al método y evita capturar
// vecinos.
function methodWindow(name) {
  const re = new RegExp(`\\n    ${name}\\s*\\(`);
  const m = appSrc.match(re);
  if (!m) return '';
  const start = m.index;
  const rest = appSrc.slice(start + 6);
  const nextMatch = rest.search(/\n    [A-Za-z_$][\w$]*\s*\(|\n    get /);
  const end = nextMatch > -1 ? start + 6 + nextMatch : start + 2500;
  return appSrc.slice(start, end);
}

describe('cronómetro contrarreloj — mecánica (source app.js)', () => {
  test('constantes nombradas de límite existen', () => {
    assert.ok(appSrc.includes('TIMED_LIMIT_MS_MULTIPLE_CHOICE'),
      'debe declarar TIMED_LIMIT_MS_MULTIPLE_CHOICE');
    assert.ok(appSrc.includes('TIMED_LIMIT_MS_MATCH'),
      'debe declarar TIMED_LIMIT_MS_MATCH');
    assert.ok(appSrc.includes('TIMED_LIMIT_MS_PER_WORD'),
      'debe declarar TIMED_LIMIT_MS_PER_WORD');
  });

  test('cancelSessionTimer es idempotente con guard de null + clearInterval', () => {
    const w = methodWindow('cancelSessionTimer');
    assert.ok(w, 'cancelSessionTimer debe existir');
    assert.ok(/!==\s*null/.test(w), 'debe tener guard de null antes de clear');
    assert.ok(w.includes('clearInterval') || w.includes('clearTimeout'),
      'debe limpiar el handle del cronómetro');
    assert.ok(/=\s*null/.test(w), 'debe poner el handle a null');
  });

  test('startSessionTimer tiene el guard completo', () => {
    const w = methodWindow('startSessionTimer');
    assert.ok(w, 'startSessionTimer debe existir');
    assert.ok(w.includes('this.sessionTimed'), 'guard: sessionTimed');
    assert.ok(w.includes('this.sessionFeedback !== null'),
      'guard: sessionFeedback === null');
    assert.ok(w.includes("this.sessionMode === 'cancion'"),
      "guard: excluir sessionMode 'cancion'");
    assert.ok(w.includes('this.cancelSessionTimer()'),
      'debe cancelar antes de arrancar (idempotencia)');
  });

  test('onSessionTimeout llama applyResultToSession(ex, false, null) y tiene guard', () => {
    const w = methodWindow('onSessionTimeout');
    assert.ok(w, 'onSessionTimeout debe existir');
    assert.ok(/this\.sessionFeedback !== null/.test(w),
      'guard: no dispara si ya hay feedback');
    assert.ok(/applyResultToSession\(this\.sessionCurrentExercise,\s*false,\s*null\)/.test(w),
      'timeout = fallo via call-site único con userAnswer null');
  });

  test('applyResultToSession cancela el cronómetro (responder lo detiene)', () => {
    const w = methodWindow('applyResultToSession');
    assert.ok(w, 'applyResultToSession debe existir');
    assert.ok(w.includes('this.cancelSessionTimer()'),
      'cancelSessionTimer() debe aparecer al responder');
  });

  test('initSubStateForExercise engancha startSessionTimer() (por-ejercicio)', () => {
    const w = methodWindow('initSubStateForExercise');
    assert.ok(w, 'initSubStateForExercise debe existir');
    assert.ok(w.includes('this.startSessionTimer()'),
      'el enganche por-ejercicio del cronómetro');
  });

  test('startSession liga sessionTimed=pickerTimed y cierra hueco S-2 (cancelMatchFlash + cancelSessionTimer)', () => {
    const w = methodWindow('startSession');
    assert.ok(w, 'startSession debe existir');
    assert.ok(/sessionTimed\s*=\s*this\.pickerTimed/.test(w),
      'sessionTimed = this.pickerTimed');
    assert.ok(w.includes('this.cancelMatchFlash()'),
      'WARNING 2: startSession debe llamar cancelMatchFlash() (hueco S-2)');
    assert.ok(w.includes('this.cancelSessionTimer()'),
      'startSession debe llamar cancelSessionTimer()');
  });

  test('_launchExamen respeta el toggle homeExamTimed (examen 1-clic cronometrado solo si el toggle está activo)', () => {
    const w = methodWindow('_launchExamen');
    assert.ok(w, '_launchExamen debe existir');
    // quick-260615-r3b (CAMBIO 2): el examen 1-clic ahora hereda el toggle
    // "Contrarreloj" de home en vez de forzar sessionTimed=false.
    assert.ok(/this\.sessionTimed\s*=\s*this\.homeExamTimed/.test(w),
      'CAMBIO 2: sessionTimed = this.homeExamTimed en examen 1-clic');
    assert.ok(w.includes('this.cancelSessionTimer()'),
      'cancelación defensiva del cronómetro');
  });

  test('resetSession resetea sessionTimed=false (WARNING 1 — reset simétrico)', () => {
    const w = methodWindow('resetSession');
    assert.ok(w, 'resetSession debe existir');
    assert.ok(/this\.sessionTimed\s*=\s*false/.test(w),
      'lifecycle simétrico: sessionTimed=false al volver a home');
    assert.ok(w.includes('this.cancelSessionTimer()'),
      'cancelSessionTimer() en el chokepoint de volver a home');
  });

  test('openPicker resetea pickerTimed=false (desmarcado al abrir)', () => {
    const w = methodWindow('openPicker');
    assert.ok(w, 'openPicker debe existir');
    assert.ok(/this\.pickerTimed\s*=\s*false/.test(w),
      'pickerTimed se resetea al abrir el picker');
  });

  test('cobertura anti-fugas: cancelSessionTimer() en todas las transiciones', () => {
    for (const m of [
      'destroy', 'resetSession', 'sessionAdvance', 'restartRepaso',
      '_launchExamen', 'startSong', 'songAdvance', 'applyResultToSession',
      'startSession'
    ]) {
      const w = methodWindow(m);
      assert.ok(w.includes('this.cancelSessionTimer()'),
        `${m} debe llamar cancelSessionTimer() (cero timers huérfanos)`);
    }
  });
});

describe('cronómetro contrarreloj — markup (source index.html)', () => {
  test('el picker contiene un checkbox x-model="pickerTimed"', () => {
    assert.ok(/<input[^>]*type="checkbox"[^>]*x-model="pickerTimed"/.test(indexSrc)
      || /x-model="pickerTimed"[^>]*type="checkbox"/.test(indexSrc)
      || (indexSrc.includes('x-model="pickerTimed"') && indexSrc.includes('type="checkbox"')),
      'debe haber un checkbox Contrarreloj ligado a pickerTimed');
  });

  test('el header de session tiene el bloque del cronómetro con x-show + clase session-timer', () => {
    assert.ok(indexSrc.includes('class="session-timer"'),
      'debe existir el bloque con clase session-timer');
    assert.ok(/x-show="sessionTimed\s*&&\s*sessionFeedback\s*===\s*null"/.test(indexSrc),
      'el bloque debe mostrarse solo con sessionTimed && sessionFeedback === null');
    assert.ok(indexSrc.includes('sessionTimeRemainingMs'),
      'debe leer sessionTimeRemainingMs (barra + número)');
  });
});
