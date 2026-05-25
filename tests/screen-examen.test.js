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

// ─────────────────────────────────────────────────────────────────────────────
// Phase 8.y (quick 260525-vvj) — dual-mode extension de restartRepaso
// ─────────────────────────────────────────────────────────────────────────────
//
// El botón "Reiniciar ejercicios" de la pantalla session ahora aparece TAMBIÉN
// en modo Examen (sessionMode === 'test-completo'), no solo en Repaso
// (Phase 6 D-100). El handler `restartRepaso` dispatcha internamente:
//   - rama repaso → buildSession(...) sin tocar localStorage (SESSION-08).
//   - rama test-completo → buildFullTest([catId]) + persistInFlightTest()
//     (D-182 slot único, coherente con _launchExamen).
//
// Backlog item Phase 8.y del ROADMAP línea 327-329. Cierre quick 260525-vvj.

describe('appShell.restartRepaso — Phase 8.y dual-mode extension', () => {
  const appJsPath = new URL('../src/screens/app.js', import.meta.url);
  const indexHtmlPath = new URL('../index.html', import.meta.url);
  const appSrc = readFileSync(appJsPath, 'utf8');
  const indexSrc = readFileSync(indexHtmlPath, 'utf8');

  // Localizar la DEFINICIÓN del método (no JSDoc ni call-sites).
  // El método extendido Phase 8.y es largo (~100 líneas con JSDoc inline +
  // dispatch dual-mode + reset SUPERSET + persistInFlightTest); ventana de
  // 8000 chars cubre con margen el cuerpo entero sin contaminarse con el
  // método siguiente `persistInFlightTest` (que está justo después).
  const restartIdx = appSrc.search(/^\s+restartRepaso\(\)\s*\{/m);
  // Limitamos por el cierre del método siguiente para evitar matchear
  // call-sites de otros métodos. Buscamos el siguiente `^    /**` (JSDoc
  // de otro método al mismo nivel de indent) tras la definición.
  let restartEndIdx = -1;
  if (restartIdx > -1) {
    const afterStart = appSrc.indexOf('\n    /**', restartIdx + 50);
    restartEndIdx = afterStart > -1 ? afterStart : restartIdx + 8000;
  }
  const restartWindow = restartIdx > -1
    ? appSrc.slice(restartIdx, restartEndIdx)
    : '';

  test('A — restartRepaso definido en src/screens/app.js (Phase 8.y baseline)', () => {
    assert.ok(restartIdx > -1,
      'restartRepaso debe estar definido en src/screens/app.js — handler base Phase 6 D-100 extendido Phase 8.y');
  });

  test("B — guard acepta sessionMode 'test-completo' además de 'repaso' (Phase 8.y dual-mode)", () => {
    // Aceptar cualquier variante del guard que mencione literal 'test-completo'
    // dentro del cuerpo del método (la regex acepta orden y espaciado libres).
    assert.match(restartWindow, /['"]test-completo['"]/,
      "el cuerpo de restartRepaso debe referenciar literal 'test-completo' — guard dual-mode Phase 8.y");
    assert.match(restartWindow, /['"]repaso['"]/,
      "el cuerpo de restartRepaso debe seguir referenciando 'repaso' — regresión-guard del comportamiento Phase 6 D-100");
  });

  test("C — dispatch a buildFullTest (rama test-completo) + buildSession (rama repaso)", () => {
    assert.match(restartWindow, /buildFullTest\(\[/,
      'el cuerpo de restartRepaso debe invocar buildFullTest([...]) — rama nueva test-completo Phase 8.y, coherente con _launchExamen línea 379');
    assert.match(restartWindow, /buildSession\(/,
      'el cuerpo de restartRepaso debe seguir invocando buildSession(...) — rama existente repaso, regresión-guard Phase 6 D-100');
  });

  test("D — persistInFlightTest invocado en restartRepaso (rama test-completo, D-182 slot único)", () => {
    assert.match(restartWindow, /this\.persistInFlightTest\(\)/,
      'el cuerpo de restartRepaso debe invocar this.persistInFlightTest() — rama test-completo Phase 8.y, D-182 slot único compartido con _launchExamen');
  });

  test("E — x-show del botón Reiniciar extendido a repaso || test-completo en index.html", () => {
    assert.ok(
      indexSrc.includes("sessionMode === 'repaso' || sessionMode === 'test-completo'"),
      "index.html debe tener x-show=\"sessionMode === 'repaso' || sessionMode === 'test-completo'\" en el botón Reiniciar — Phase 8.y exposición dual-mode");
  });

  test("F — copy del botón sigue hardcoded 'Reiniciar ejercicios' (T-02-01 invariante anti-XSS)", () => {
    assert.ok(
      indexSrc.includes('>Reiniciar ejercicios<'),
      'el texto del botón debe ser literal hardcoded \"Reiniciar ejercicios\" — T-02-01 anti-XSS invariante (NO x-text dinámico)');
  });

  test("G — buildFullTest tiene >=2 call-sites en src/screens/app.js (Phase 8.y consolidación)", () => {
    const callsToBuildFullTest = (appSrc.match(/buildFullTest\(/g) || []).length;
    // Excluimos comentarios y JSDoc del conteo — pero contar literales en código.
    // El conteo total incluye 1 en _launchExamen, 1 en startSession (rama
    // pickerMode==='test-completo') y 1 nuevo en restartRepaso. Aceptamos
    // >=2 como umbral mínimo defensivo (refleja la extensión Phase 8.y).
    assert.ok(callsToBuildFullTest >= 2,
      `buildFullTest debe tener >=2 call-sites en src/screens/app.js — Phase 8.y añade el call-site en restartRepaso; encontrados: ${callsToBuildFullTest}`);
  });
});
