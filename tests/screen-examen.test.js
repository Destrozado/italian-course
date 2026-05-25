// tests/screen-examen.test.js
//
// Phase 8 (D-181..D-192) — Smoke tests presence-check para el handler
// `startExamen(categoryId)` + helper privado `_launchExamen(catId)` + 6ª
// columna `Examen` en la tabla home (`index.html`).
//
// Estrategia: verificación textual de presencia + ordenamiento de
// identificadores y copy literales sobre `src/screens/app.js` e `index.html`.
// Coherente con el patrón documentado en `tests/exercise-types.test.js:739-754`
// — el factory `appShell` no es trivialmente instanciable bajo node sin Alpine
// (depende de getters reactivos y Promise-handoff). Los tests behaviorales
// mid-sesión los cubre UAT humano post-merge (coherente con Phase 3+).
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

describe('appShell.startExamen — Phase 8 D-181..D-192', () => {
  // Setup: lectura textual de source para presence-check + windowed slicing.
  const appJsPath = new URL('../src/screens/app.js', import.meta.url);
  const indexHtmlPath = new URL('../index.html', import.meta.url);
  const appSrc = readFileSync(appJsPath, 'utf8');
  const indexSrc = readFileSync(indexHtmlPath, 'utf8');

  // Localizar la DEFINICIÓN del método (firma con paréntesis abierto) — NO
  // las referencias en comentarios JSDoc o call-sites. El método se define
  // como `methodName(...) {` dentro del object literal del factory; los
  // pattern matches son específicos para evitar matchear JSDoc comments
  // (`* methodName(...)` o `methodName(...)` dentro de comentarios) o
  // call-sites (`this.methodName(...)`).
  const startExamenIdx = appSrc.search(/^\s+startExamen\(categoryId\)\s*\{/m);
  const launchExamenIdx = appSrc.search(/^\s+_launchExamen\(catId\)\s*\{/m);

  // Window de inspección: 3000 chars desde la definición del método.
  // Suficiente para cubrir el cuerpo + sus call-sites locales sin
  // contaminarse con otros métodos del factory.
  const startExamenWindow = startExamenIdx > -1
    ? appSrc.slice(startExamenIdx, startExamenIdx + 3000)
    : '';
  const launchExamenWindow = launchExamenIdx > -1
    ? appSrc.slice(launchExamenIdx, launchExamenIdx + 3000)
    : '';

  test('startExamen está definido en src/screens/app.js (Phase 8 D-181)', () => {
    assert.ok(startExamenIdx > -1,
      'startExamen debe estar definido en src/screens/app.js — Phase 8 D-181/EXAM-02 entry point');
    assert.match(startExamenWindow, /startExamen\(categoryId\)/,
      'startExamen debe tener firma startExamen(categoryId) — UI-SPEC línea 596-606 lockea el naming + 1-cat por diseño D-181');
  });

  test('_launchExamen helper privado existe y es invocado al menos 2 veces (path directo + onConfirm)', () => {
    assert.ok(launchExamenIdx > -1,
      '_launchExamen debe existir como helper privado — PATTERNS.md §1 Analog 1 + 2');
    // Contamos call-sites reales (this._launchExamen( o ._launchExamen( en general).
    // Excluye la definición misma del método (que matchea con `_launchExamen(catId) {`).
    const callsToLaunchExamen = (appSrc.match(/this\._launchExamen\(/g) || []).length;
    assert.ok(callsToLaunchExamen >= 2,
      `_launchExamen debe tener >=2 call-sites (directo + onConfirm post-clearInFlightTest) — PATTERNS.md §1 Analog 1; encontrados: ${callsToLaunchExamen}`);
  });

  test('startExamen chequea state.inFlightTest ANTES de buildFullTest (D-44 conflict)', () => {
    const inFlightIdx = startExamenWindow.indexOf('this.state.inFlightTest');
    const launchInWindow = startExamenWindow.indexOf('this._launchExamen(');
    assert.ok(inFlightIdx > -1,
      'startExamen debe chequear this.state.inFlightTest — D-44 conflict pattern, 6ª call-site de requestConfirm');
    assert.ok(launchInWindow > -1,
      'startExamen debe invocar this._launchExamen(...) — al menos el path directo (no-conflict)');
    assert.ok(inFlightIdx < launchInWindow,
      'el chequeo de this.state.inFlightTest debe aparecer ANTES de cualquier invocación a _launchExamen — D-44 conflict pattern requiere guard primero');
  });

  test('startExamen invoca requestConfirm con copy literal D-44 6ª call-site (D-183 + UI-SPEC línea 221)', () => {
    assert.match(startExamenWindow, /requestConfirm\(\{/,
      'startExamen debe invocar requestConfirm (6ª call-site) — patrón D-44');
    assert.ok(
      startExamenWindow.includes('Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?'),
      'el message del requestConfirm debe ser literal idéntico al openPicker D-44 línea 275 (D-183 hereda copy genérica)');
    assert.ok(
      startExamenWindow.includes("'Descartar y empezar'") || startExamenWindow.includes('"Descartar y empezar"'),
      "confirmLabel debe ser 'Descartar y empezar' — planner lockea coherencia con openPicker D-44 línea 276 (UI-SPEC sugería 'Continuar' originalmente — opción deferida, ver 08-UI-SPEC.md commit d7a0e4b)");
  });

  test('_launchExamen invoca buildFullTest con un array de 1 categoryId (D-181 + D-189)', () => {
    assert.match(launchExamenWindow, /buildFullTest\(\[/,
      '_launchExamen debe invocar buildFullTest con array literal — Examen es 1-cat por diseño D-181');
    assert.match(launchExamenWindow, /this\.sessionMode\s*=\s*['"]test-completo['"]/,
      "sessionMode debe setearse a 'test-completo' literal — D-189 (NO this.pickerMode, NO modo nuevo 'examen')");
  });

  test('_launchExamen setea pickerCheckedCategoryIds ANTES de persistInFlightTest (pitfall PATTERNS.md §1 Analog 2)', () => {
    const pickerCheckedIdx = launchExamenWindow.indexOf('this.pickerCheckedCategoryIds = [');
    const persistIdx = launchExamenWindow.indexOf('this.persistInFlightTest()');
    assert.ok(pickerCheckedIdx > -1,
      '_launchExamen debe setear this.pickerCheckedCategoryIds = [catId] — pitfall del fallback prev?.categoryIds en persistInFlightTest');
    assert.ok(persistIdx > -1,
      '_launchExamen debe invocar this.persistInFlightTest() — D-182 slot único compartido, SIEMPRE persiste (no condicional)');
    assert.ok(pickerCheckedIdx < persistIdx,
      'pickerCheckedCategoryIds debe setearse ANTES de persistInFlightTest — si se setea después, el fallback prev?.categoryIds capturaría las cats del Test anterior (regresión silenciosa)');
  });

  test('index.html tiene 6ª columna Examen con botón secondary outline y binding al handler (D-184 + UI-SPEC línea 115)', () => {
    assert.ok(
      indexSrc.includes('<th scope="col">Examen</th>'),
      'index.html debe tener <th scope="col">Examen</th> nuevo — UI-SPEC línea 184 (6ª columna nueva D-184)');
    assert.ok(
      indexSrc.includes('class="secondary outline"'),
      "botón Examen debe tener class='secondary outline' — UI-SPEC línea 115 (nivel 3 jerarquía visual; cero CSS nuevo prescrito)");
    assert.ok(
      indexSrc.includes('startExamen(cat.id)'),
      "index.html debe tener @click='startExamen(cat.id)' binding al handler Task 1");
    assert.ok(
      indexSrc.includes(':disabled="!cat.examenEnabled"'),
      'el botón Examen debe enlazar :disabled a cat.examenEnabled (D-187 disabled cuando totalCount === 0)');
    assert.ok(
      indexSrc.includes(':title="cat.examenTooltip"'),
      'el botón Examen debe enlazar :title a cat.examenTooltip (D-187 tooltip nativo cuando disabled, escape automático por la spec HTML — T-02-01 invariante)');
  });
});
