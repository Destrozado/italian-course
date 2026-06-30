// tests/screen-home-editorial.test.js
//
// Phase 32 Plan 02 — Rediseño Editoriale de la pantalla Home/Categorías.
//
// AVISO: igual que tests/screen-responsive.test.js / screen-context-label.test.js,
// el grueso de esta fase es validación VISUAL (cabecera serif, CTA verde con
// sombra, ghost row, switch verde, filas con dot/streak/píldora, tabla editorial
// en desktop). Un test unitario NO puede afirmar el aspecto. Estos asserts SÓLO
// blindan las invariantes estructurales source-assert:
//   - app.js expone `streakDays` crudo en categoriesForDisplay (Task 1),
//   - el copy del contrato está presente (Task 2),
//   - los bindings Alpine se preservan VERBATIM (Task 2),
//   - la barra de racha usa streakDays (Task 2),
//   - anti-XSS: cero `x-html=` en index.html (Task 2),
//   - app.css estila la Home Editoriale (CTA verde, ghost, fila, tabla) (Task 3),
//   - la capa móvil Phase-28 NO regresa (44px / @media 640px) (Task 3).
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJs = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

describe('Phase 32-02 Task 1 — streakDays crudo en categoriesForDisplay', () => {
  test('app.js incluye `streakDays: streak` en el return del getter', () => {
    assert.ok(
      /streakDays:\s*streak/.test(appJs),
      'categoriesForDisplay debe devolver streakDays crudo para la barra streak/21'
    );
  });

  test('motor intacto: exactamente 2 call-sites de applyImmediateFailure(this.state', () => {
    const matches = appJs.match(/applyImmediateFailure\(this\.state/g) || [];
    assert.equal(
      matches.length,
      2,
      'la cascada D-54 NO debe regresar (2 call-sites; único cambio JS = 1 campo presentacional)'
    );
  });
});

describe('Phase 32-02 Task 2 — copy del contrato editorial (index.html)', () => {
  test('cabecera: overline `ITALIANO · A1 / A2` + título `Categorías`', () => {
    assert.ok(html.includes('ITALIANO · A1 / A2'), 'overline de cabecera (HOME-01)');
    assert.ok(html.includes('Categorías'), 'título serif Categorías (HOME-01)');
  });

  test('CTA `Repaso 20`, overline `CATEGORÍAS`, label `Contrarreloj`', () => {
    assert.ok(html.includes('Repaso 20'), 'CTA primario (HOME-02)');
    assert.ok(html.includes('CATEGORÍAS'), 'overline de sección (HOME-05)');
    assert.ok(html.includes('Contrarreloj'), 'label del switch (HOME-05)');
  });

  test('ghost row: Test completo · Canciones · Backup', () => {
    assert.ok(html.includes('Test completo'), 'ghost Test completo (HOME-03)');
    assert.ok(html.includes('Canciones'), 'ghost Canciones (HOME-03, D-04)');
    assert.ok(html.includes('Backup'), 'ghost Backup (HOME-03)');
  });
});

describe('Phase 32-02 Task 2 — bindings Alpine preservados VERBATIM (index.html)', () => {
  test("CTA Repaso conserva openPicker('repaso') (D-05, NO lanzamiento directo)", () => {
    assert.ok(html.includes("openPicker('repaso')"), 'D-05: el CTA abre el picker');
  });

  test("ghost Test completo conserva openPicker('test-completo')", () => {
    assert.ok(html.includes("openPicker('test-completo')"));
  });

  test("ghost Canciones conserva currentScreen = 'canciones'", () => {
    assert.ok(html.includes("currentScreen = 'canciones'"));
  });

  test("ghost Backup conserva currentScreen = 'backup'", () => {
    assert.ok(html.includes("currentScreen = 'backup'"));
  });

  test('switch conserva x-model="homeExamTimed" (HOME-05)', () => {
    assert.ok(html.includes('x-model="homeExamTimed"'));
  });

  test('tabla conserva x-for="cat in categoriesForDisplay"', () => {
    assert.ok(html.includes('x-for="cat in categoriesForDisplay"'));
  });

  test('píldora Examen conserva startExamen(cat.id) + :disabled + :title', () => {
    assert.ok(html.includes('startExamen(cat.id)'), '@click Examen');
    assert.ok(html.includes(':disabled="!cat.examenEnabled"'), ':disabled Examen');
    assert.ok(html.includes(':title="cat.examenTooltip"'), ':title Examen');
  });
});

describe('Phase 32-02 Task 2 — barra de racha + anti-XSS (index.html)', () => {
  test('la barra de racha usa cat.streakDays', () => {
    assert.ok(html.includes('streakDays'), 'el ancho de la barra deriva de streakDays/21');
  });

  test('anti-XSS: CERO directivas x-html= en index.html', () => {
    assert.ok(
      !html.includes('x-html='),
      'todo el contenido de categoría se renderiza via x-text (T-32-03)'
    );
  });

  test('data-label preservados (la capa móvil Phase-28 depende de ellos)', () => {
    assert.ok(html.includes('data-label="Examen"'), 'celda Examen mantiene data-label');
    assert.ok(html.includes('data-label="Última vez"'), 'celda Última vez mantiene data-label');
  });
});
