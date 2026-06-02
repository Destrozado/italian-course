// tests/song-validator.test.js
//
// Tests del validador de canciones (`validateSongs`). Se ejecutan con:
//
//     node --test tests/
//
// Patrón espejo de los tests de `validateContent` en tests/domain.test.js:
// acumula TODOS los errores en un solo recorrido (D-08), nunca lanza
// mid-walk, mensajes en español (FOUND-04). DIVERGENCIA CLAVE (LINK-03): una
// frase de canción admite `categoryIds` ausente o vacío `[]` sin error.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { validateSongs } from '../src/data/schema-validator.js';

const knownCategoryIds = new Set(['avere', 'preposiciones', 'essere']);

describe('data/schema-validator — validateSongs', () => {
  test('acepta un documento de canción bien formado', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [
            { id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo', 'hambre'], categoryIds: ['avere'] },
            { id: 'c1-002', prompt: 'Vado a casa.', answer: ['voy', 'a', 'casa'], categoryIds: [] }
          ]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.errors, []);
  });

  test('rechaza prompt vacío / no-string', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ id: 'c1-001', prompt: '   ', answer: ['x'], categoryIds: [] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /prompt/.test(e.reason)),
      `Esperaba error de prompt; errores: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza answer vacío o no-array', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [
            { id: 'c1-001', prompt: 'Ho fame.', answer: [], categoryIds: [] },
            { id: 'c1-002', prompt: 'Sto bene.', answer: 'estoy bien', categoryIds: [] }
          ]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/answer/.test(reasons), `falta error de answer: ${reasons}`);
  });

  test('rechaza tokens vacíos / no-string en answer', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo', '  ', 5], categoryIds: [] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /answer/.test(e.reason)));
  });

  test('rechaza distractors no-array o con tokens vacíos cuando está presente', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [
            { id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo', 'hambre'], distractors: 'no', categoryIds: [] },
            { id: 'c1-002', prompt: 'Sto bene.', answer: ['estoy', 'bien'], distractors: ['ok', '  '], categoryIds: [] }
          ]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/distractors/.test(reasons), `falta error de distractors: ${reasons}`);
  });

  test('frase con categoryIds ausente es VÁLIDA (LINK-03)', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo', 'hambre'] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('frase con categoryIds vacío [] es VÁLIDA (LINK-03)', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo', 'hambre'], categoryIds: [] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza categoryIds que referencia una categoría desconocida', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo'], categoryIds: ['ghost'] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /desconocida/.test(e.reason) && /ghost/.test(e.reason)),
      `Esperaba error de categoría desconocida "ghost"; errores: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza id de frase duplicado dentro de una canción', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [
            { id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo'], categoryIds: [] },
            { id: 'c1-001', prompt: 'Sto bene.', answer: ['bien'], categoryIds: [] }
          ]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /duplicado/.test(e.reason)),
      `Esperaba error de id de frase duplicado; errores: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza id de canción duplicado entre archivos', () => {
    const result = validateSongs({
      songs: [
        { id: 'cancion-1', title: 'Uno', phrases: [{ id: 'c1-001', prompt: 'Ho fame.', answer: ['tengo'], categoryIds: [] }] },
        { id: 'cancion-1', title: 'Dos', phrases: [{ id: 'c2-001', prompt: 'Sto bene.', answer: ['bien'], categoryIds: [] }] }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /duplicado/.test(e.reason)),
      `Esperaba error de id de canción duplicado; errores: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza canción sin id slug / sin title / phrases no-array', () => {
    const result = validateSongs({
      songs: [
        { id: 'Mal Id', title: '', phrases: 'nope' }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    const reasons = result.errors.map(e => e.reason).join('|');
    assert.ok(/id de canción/.test(reasons), `falta error de id de canción: ${reasons}`);
    assert.ok(/title/.test(reasons), `falta error de title: ${reasons}`);
    assert.ok(/phrases/.test(reasons), `falta error de phrases: ${reasons}`);
  });

  test('rechaza canción con phrases vacío [] (WR-01: callejón sin salida)', () => {
    const result = validateSongs({
      songs: [
        { id: 'cancion-1', title: 'Canción uno', phrases: [] }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /al menos 1 frase/.test(e.reason)),
      `Esperaba error de phrases vacío; errores: ${JSON.stringify(result.errors)}`);
  });

  test('rechaza frase sin id', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [{ prompt: 'Ho fame.', answer: ['tengo'], categoryIds: [] }]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /id/.test(e.reason)));
  });

  test('acumula MÚLTIPLES errores en un solo recorrido (D-08), sin lanzar', () => {
    const result = validateSongs({
      songs: [
        {
          id: 'cancion-1',
          title: 'Canción uno',
          phrases: [
            { id: 'c1-001', prompt: '', answer: [], categoryIds: ['ghost'] },
            { id: 'c1-001', prompt: 'Sto bene.', answer: ['bien'], distractors: ['  '], categoryIds: [] }
          ]
        }
      ],
      knownCategoryIds
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.length >= 4,
      `Esperaba >=4 errores acumulados; got ${result.errors.length}: ${JSON.stringify(result.errors)}`);
  });

  test('la mini-canción real del repo pasa validateSongs', () => {
    const songsIndex = JSON.parse(readFileSync(new URL('../content/songs.json', import.meta.url), 'utf8'));
    const cats = JSON.parse(readFileSync(new URL('../content/categories.json', import.meta.url), 'utf8'));
    const known = new Set(cats.categories.map(c => c.id));
    const songs = songsIndex.songs.map(s =>
      JSON.parse(readFileSync(new URL(`../content/songs/${s.id}.json`, import.meta.url), 'utf8'))
    );
    const result = validateSongs({ songs, knownCategoryIds: known });
    assert.equal(result.ok, true, `mini-canción debería validar. Errores: ${JSON.stringify(result.errors, null, 2)}`);
  });
});
