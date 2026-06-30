// tests/screen-responsive.test.js
//
// Phase 28 — Capa responsive móvil (breakpoint único 640px).
//
// AVISO: el grueso de esta fase es validación VISUAL (auditoría manual a
// 320/360/390px en móvil y a 1024px en escritorio). Un test unitario NO puede
// afirmar que "Examen" se ve o que la match-grid lee bien con 2 columnas; eso
// es inspección de aspecto. Estos asserts SÓLO blindan las invariantes
// estructurales source-assert (coherente con tests/screen-context-label.test.js):
//   - el breakpoint existe,
//   - el patrón tabla->tarjetas y el wrap de button-row están presentes,
//   - las celdas clave llevan data-label,
//   - DESKTOP INTACTO: ningún @media nuevo apunta a >=641px.
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const cssSrc = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// Ventana del cuerpo del media query: desde la primera aparición de `@media`
// hasta fin de archivo (el bloque responsive es el último de styles.css).
const mqIdx = cssSrc.indexOf('@media');
const mqBody = mqIdx > -1 ? cssSrc.slice(mqIdx) : '';

describe('Phase 28 — breakpoint responsive existe', () => {
  test('styles.css contiene @media (max-width: 640px)', () => {
    assert.ok(
      cssSrc.includes('@media (max-width: 640px)'),
      'debe existir la capa responsive detrás de @media (max-width: 640px)'
    );
  });
});

describe('Phase 28 — patrones del contrato dentro del media query', () => {
  test('tabla->tarjetas: el cuerpo del media query usa attr(data-label)', () => {
    assert.ok(
      mqBody.includes('attr(data-label)'),
      'el patrón tabla->tarjetas inyecta el label de celda vía content: attr(data-label)'
    );
  });

  test('button-row envuelve: el cuerpo del media query usa flex-wrap: wrap', () => {
    assert.ok(
      mqBody.includes('flex-wrap: wrap'),
      '.button-row debe envolver en móvil (LOCKED #2: Backup visible)'
    );
  });

  test('match mantiene 2 columnas: NO se redefine grid-template-columns a 1fr única', () => {
    // La regla desktop .match-grid { grid-template-columns: 1fr 1fr } NO debe
    // ser anulada a una sola columna dentro del media query. Afirmamos la
    // ausencia del literal de una sola columna en el bloque responsive.
    assert.ok(
      !mqBody.includes('grid-template-columns: 1fr;'),
      'match debe conservar 2 columnas en móvil (Claude\'s Discretion DECIDIDO): no apilar a 1fr'
    );
  });
});

describe('Phase 28 — data-label en las celdas clave (index.html)', () => {
  // Phase 34 (SRP-01): la pantalla CANCIONES se repintó al lenguaje Editoriale
  // y dejó de usar <table> → desaparecen sus 3 celdas data-label
  // (Estado/Frases/Jugar). La tabla del HOME (5 celdas) se conserva intacta.
  // v1.8 es desktop-only; el responsive de las pantallas Phase 34 está diferido
  // (CONTEXT 34 §deferred). Por eso ahora hay 5 data-label, no 8.
  test('index.html tiene exactamente 5 atributos data-label (tabla home; canciones ya no usa tabla)', () => {
    const matches = html.match(/data-label=/g) || [];
    assert.equal(
      matches.length,
      5,
      'esperados 5 data-label de la tabla home [Estado/Racha/Ejercicios/Última vez/Examen]; canciones se repintó Editoriale sin tabla (Phase 34 SRP-01)'
    );
  });

  test('el botón LOCKED del home queda etiquetado: data-label="Examen"', () => {
    assert.ok(html.includes('data-label="Examen"'), 'la celda del botón Examen (home) debe llevar data-label="Examen"');
  });
});

describe('Phase 28 — DESKTOP INTACTO (ningún @media afecta a >=641px)', () => {
  test('todas las apariciones de @media son (max-width: 640px)', () => {
    // Extrae cada media query y comprueba que ninguna es min-width ni
    // max-width con un valor mayor que 640 (eso afectaría a escritorio).
    const mediaQueries = cssSrc.match(/@media[^{]*/g) || [];
    assert.ok(mediaQueries.length > 0, 'debe existir al menos un @media (la capa responsive)');
    for (const mq of mediaQueries) {
      const normalized = mq.replace(/\s+/g, ' ').trim();
      assert.ok(
        normalized === '@media (max-width: 640px)',
        `media query inesperada que podría afectar a escritorio: "${normalized}" (sólo se permite @media (max-width: 640px))`
      );
    }
  });

  test('no se introdujo ningún min-width media query', () => {
    assert.ok(
      !/@media[^{]*min-width/.test(cssSrc),
      'min-width afectaría a escritorio: prohibido en esta fase'
    );
  });
});
