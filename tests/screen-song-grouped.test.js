// tests/screen-song-grouped.test.js — quick-260715-hf5
//
// Modo "decoradores agrupados" de canciones: doble modo (clásico/agrupado),
// getter bankGroups (vista sobre el banco plano), toggle setSongBankMode,
// colapso de grupos, y la regresión clave: el modo CLÁSICO nunca inyecta
// decoys (invariante que protege las 10 canciones existentes).
//     node --test tests/*.test.js

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { appShell } from '../src/screens/app.js';

// App en modo canción con UNA frase que trae decoyBank.
function songApp({ withDecoys = true } = {}) {
  const app = appShell(Promise.resolve());
  app.state = { categoryProgress: {} };
  app.content = { exerciseById: {}, songsById: {} };
  const phrase = {
    id: 'p1',
    prompt: 'Ti regalo questo vuoto',
    answer: ['te', 'regalo', 'este', 'vacío'],
    categoryIds: [],
  };
  if (withDecoys) {
    phrase.decoyBank = {
      distractors: ['me', 'hueco', 'guardo'],
      pos: {
        te: 'pronombre', regalo: 'verbo', este: 'determinante', 'vacío': 'sustantivo',
        me: 'pronombre', hueco: 'sustantivo', guardo: 'verbo',
      },
    };
  }
  app.content.songsById.s1 = { id: 's1', title: 'Test', phrases: [phrase] };
  return { app, phrase };
}

describe('canción — modo decoradores agrupados (quick-260715-hf5)', () => {
  test('startSong con decoyBank entra en modo agrupado e incluye decoys en el banco', () => {
    const { app } = songApp();
    app.startSong('s1');
    assert.equal(app.songBankMode, 'grouped');
    assert.equal(app.songSupportsGrouped, true);
    // banco = answer (4) ∪ distractors (3) = 7
    assert.equal(app.wordButtonsBank.length, 7);
    for (const w of ['me', 'hueco', 'guardo']) {
      assert.ok(app.wordButtonsBank.includes(w), `decoy ${w} en el banco`);
    }
  });

  test('modo CLÁSICO nunca inyecta decoys (invariante de regresión)', () => {
    const { app } = songApp();
    app.startSong('s1');
    app.setSongBankMode('classic');
    assert.equal(app.songBankMode, 'classic');
    assert.equal(app.wordButtonsBank.length, 4, 'solo answer, sin decoys');
    for (const w of ['me', 'hueco', 'guardo']) {
      assert.ok(!app.wordButtonsBank.includes(w), `decoy ${w} NO está en clásico`);
    }
    assert.equal(app.bankGroups, null, 'sin agrupación en clásico');
  });

  test('canción SIN decoyBank solo ofrece clásico (sin checkbox)', () => {
    const { app } = songApp({ withDecoys: false });
    app.startSong('s1');
    assert.equal(app.songSupportsGrouped, false);
    assert.equal(app.songBankMode, 'classic');
    assert.equal(app.bankGroups, null);
    assert.equal(app.wordButtonsBank.length, 4);
  });

  test('bankGroups agrupa por POS y preserva TODAS las entradas del banco plano', () => {
    const { app } = songApp();
    app.startSong('s1');
    const groups = app.bankGroups;
    assert.ok(Array.isArray(groups));
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    assert.equal(total, app.bankWithKeys.length, 'ninguna entrada se pierde al agrupar');
    // Los items son las MISMAS entradas de bankWithKeys (con idx/placed/key).
    const keys = groups.map((g) => g.key);
    // Orden canónico: determinante < pronombre < verbo < sustantivo
    assert.deepEqual(keys, ['determinante', 'pronombre', 'verbo', 'sustantivo']);
    // cada item tiene la forma de bankWithKeys
    assert.ok('idx' in groups[0].items[0] && 'placed' in groups[0].items[0]);
  });

  test('colocar una palabra en modo agrupado sigue funcionando (grading intacto)', () => {
    const { app } = songApp();
    app.startSong('s1');
    // encontrar el idx de 'te' en el banco y colocarlo
    const idxTe = app.wordButtonsBank.indexOf('te');
    app.wordButtonsAddWord(idxTe);
    assert.deepEqual(app.wordButtonsAnswer, ['te']);
    // la vista agrupada refleja el placed sin perder el slot
    const total = app.bankGroups.reduce((n, g) => n + g.items.length, 0);
    assert.equal(total, 7);
    const placed = app.bankGroups.flatMap((g) => g.items).filter((e) => e.placed);
    assert.equal(placed.length, 1);
  });

  test('toggleGroupCollapsed pliega/despliega y bankGroups expone `collapsed`', () => {
    const { app } = songApp();
    app.startSong('s1');
    const firstKey = app.bankGroups[0].key;
    assert.equal(app.bankGroups[0].collapsed, false);
    app.toggleGroupCollapsed(firstKey);
    assert.equal(app.bankGroups.find((g) => g.key === firstKey).collapsed, true);
    app.toggleGroupCollapsed(firstKey);
    assert.equal(app.bankGroups.find((g) => g.key === firstKey).collapsed, false);
  });

  test('setSongBankMode es no-op durante feedback (no rebaraja a mitad)', () => {
    const { app } = songApp();
    app.startSong('s1');
    const before = app.wordButtonsBank.slice();
    app.sessionFeedback = 'incorrect';
    app.setSongBankMode('classic');
    assert.equal(app.songBankMode, 'grouped', 'modo intacto durante feedback');
    assert.deepEqual(app.wordButtonsBank, before, 'banco intacto durante feedback');
  });
});
