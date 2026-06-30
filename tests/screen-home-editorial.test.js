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
