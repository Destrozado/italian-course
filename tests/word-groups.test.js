// tests/word-groups.test.js — quick-260715-hf5
//
// Tests del módulo puro de agrupación por categoría sintáctica.
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// (NO `node --test tests/`: en Node 22.20 eso sale con exit 1 y `Cannot find
// module`, porque Node resuelve el path como MODULO. Ni `--recursive`, que no
// existe. Los DOS globs, siempre — DEUDA-01 / D-45-01.)
//
// Invariante crítico: groupTokens NUNCA pierde una entrada (si una palabra
// correcta desapareciera, el ejercicio sería irresoluble). Todo token sin POS
// válido cae en `otros`.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  POS_GROUPS,
  POS_KEYS,
  isValidPos,
  groupTokens,
} from '../src/domain/word-groups.js';

describe('domain/word-groups', () => {
  test('POS_GROUPS incluye las categorías clave y `otros`', () => {
    const keys = POS_GROUPS.map((g) => g.key);
    for (const k of ['articulo', 'preposicion', 'verbo', 'sustantivo', 'adjetivo', 'adverbio', 'pronombre', 'conjuncion', 'otros']) {
      assert.ok(keys.includes(k), `falta la categoría ${k}`);
    }
    // labels no vacíos
    for (const g of POS_GROUPS) assert.ok(g.label && typeof g.label === 'string');
  });

  test('isValidPos / POS_KEYS', () => {
    assert.equal(isValidPos('verbo'), true);
    assert.equal(isValidPos('otros'), true);
    assert.equal(isValidPos('inventado'), false);
    assert.equal(POS_KEYS.has('preposicion'), true);
  });

  test('groupTokens agrupa strings por POS y respeta el orden canónico', () => {
    const entries = ['dentro', 'el', 'tengo', 'de'];
    const pos = { el: 'articulo', de: 'preposicion', tengo: 'verbo', dentro: 'adverbio' };
    const groups = groupTokens(entries, pos);
    // Orden canónico: articulo < preposicion < verbo < adverbio
    assert.deepEqual(groups.map((g) => g.key), ['articulo', 'preposicion', 'verbo', 'adverbio']);
    assert.deepEqual(groups.map((g) => g.label), ['Artículos', 'Preposiciones', 'Verbos', 'Adverbios']);
    assert.deepEqual(groups[0].items, ['el']);
  });

  test('preserva el orden de llegada dentro de cada grupo', () => {
    const entries = ['los', 'el', 'la']; // todos articulo, en este orden
    const pos = { el: 'articulo', la: 'articulo', los: 'articulo' };
    const groups = groupTokens(entries, pos);
    assert.equal(groups.length, 1);
    assert.deepEqual(groups[0].items, ['los', 'el', 'la']);
  });

  test('token sin POS o con POS desconocido cae en `otros` (nunca se pierde)', () => {
    const entries = ['xyz', 'el', 'zzz'];
    const pos = { el: 'articulo', zzz: 'inventadisimo' };
    const groups = groupTokens(entries, pos);
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    assert.equal(total, 3, 'no se pierde ninguna entrada');
    const otros = groups.find((g) => g.key === 'otros');
    assert.ok(otros, 'existe grupo otros');
    assert.deepEqual(otros.items.sort(), ['xyz', 'zzz']);
  });

  test('acepta entradas objeto tipo bankWithKeys (.word) y preserva el objeto', () => {
    const entries = [
      { word: 'de', idx: 0, placed: false, key: 1 },
      { word: 'tengo', idx: 1, placed: false, key: 2 },
    ];
    const pos = { de: 'preposicion', tengo: 'verbo' };
    const groups = groupTokens(entries, pos);
    assert.deepEqual(groups.map((g) => g.key), ['preposicion', 'verbo']);
    // El objeto original se preserva (mismo referencia), clave para índice/placed.
    assert.equal(groups[0].items[0], entries[0]);
    assert.equal(groups[1].items[0].idx, 1);
  });

  test('defensivo: entries no-array o posMap ausente', () => {
    assert.deepEqual(groupTokens(null, null), []);
    assert.deepEqual(groupTokens(undefined, {}), []);
    // sin posMap → todo a otros
    const g = groupTokens(['a', 'b'], undefined);
    assert.equal(g.length, 1);
    assert.equal(g[0].key, 'otros');
    assert.equal(g[0].items.length, 2);
  });

  test('duplicados textuales se mantienen como entradas separadas', () => {
    const entries = ['que', 'que']; // "que" aparece 2x en la respuesta
    const pos = { que: 'conjuncion' };
    const groups = groupTokens(entries, pos);
    assert.equal(groups.length, 1);
    assert.equal(groups[0].items.length, 2);
  });
});
