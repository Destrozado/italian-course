// tests/screen-wordbuttons-slots.test.js
//
// quick-260615-str — Word-buttons con HUECOS ESTABLES (sin reflow).
//
// El banco (`wordButtonsBank`) es INMUTABLE tras init; colocar una palabra no la
// elimina, solo marca su slot como `placed` (placeholder invisible en la UI), de
// modo que las posiciones de las demás NO cambian. La respuesta se DERIVA por
// índice (`wordButtonsPlacedIdx` → getter `wordButtonsAnswer`), lo que además
// maneja correctamente palabras repetidas.
//
// Se ejecuta con:  node --test tests/*.test.js tests/fixtures/*.test.js   (Node 22 LTS+)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { appShell } from '../src/screens/app.js';

// Helper: app con un word-buttons activo en modo canción (songCurrentPhrase
// resuelve via songPhraseById, igual patrón que screen-canciones.test.js), con
// un banco controlado y placedIdx vacío.
function wbApp(bank) {
  const app = appShell(Promise.resolve());
  app.content = { exerciseById: {}, songsById: {} };
  app.sessionMode = 'cancion';
  app.sessionExerciseIds = ['p1'];
  app.sessionCursor = 0;
  app.songPhraseById = {
    p1: {
      id: 'p1',
      type: 'word-buttons',
      payload: { prompt: '...', answer: bank.slice(), distractors: [] },
      categoryIds: []
    }
  };
  app.wordButtonsBank = bank;
  app.wordButtonsPlacedIdx = [];
  return app;
}

const fakeKey = (key) => ({ key, ctrlKey: false, metaKey: false, altKey: false, preventDefault() {} });

describe('word-buttons huecos estables (quick-260615-str)', () => {
  test('colocar una palabra MANTIENE el nº de slots (sin reflow) + marca placed + deriva respuesta', () => {
    const app = wbApp(['como', 'me', 'siento']);
    assert.equal(app.bankWithKeys.length, 3, 'precondición: 3 slots');

    app.wordButtonsAddWord(0); // coloca 'como' (slot 0)

    assert.equal(app.bankWithKeys.length, 3, 'el banco conserva sus 3 slots tras colocar (hueco estable)');
    assert.equal(app.bankWithKeys[0].placed, true, 'slot 0 marcado placed');
    assert.equal(app.bankWithKeys[1].placed, false);
    assert.equal(app.bankWithKeys[2].placed, false);
    assert.deepEqual(app.wordButtonsAnswer, ['como'], 'respuesta derivada del índice colocado');
    // Las keys renumeran sobre VISIBLES pero los slots NO se mueven.
    assert.equal(app.bankWithKeys[0].key, '', 'el slot colocado no muestra tecla');
    assert.equal(app.bankWithKeys[1].key, '1', 'la 1ª visible toma la tecla 1');
    assert.equal(app.bankWithKeys[2].key, '2');
  });

  test('quitar una palabra RESTAURA su slot en su posición original', () => {
    const app = wbApp(['como', 'me', 'siento']);
    app.wordButtonsAddWord(1); // coloca 'me' (slot 1)
    assert.equal(app.bankWithKeys[1].placed, true);
    assert.deepEqual(app.wordButtonsAnswer, ['me']);

    app.wordButtonsRemoveWord(0); // quita de la respuesta (answerPos 0)

    assert.equal(app.bankWithKeys[1].placed, false, 'el slot 1 vuelve a estar disponible');
    assert.deepEqual(app.wordButtonsAnswer, []);
    assert.deepEqual(
      app.bankWithKeys.map(e => e.word), ['como', 'me', 'siento'],
      'el orden/posiciones del banco no cambian'
    );
  });

  test('palabras REPETIDAS se manejan por índice (no por valor)', () => {
    const app = wbApp(['io', 'muoio', 'io', 'muoio']);
    app.wordButtonsAddWord(0); // primer 'io'
    app.wordButtonsAddWord(2); // segundo 'io'

    assert.deepEqual(app.wordButtonsAnswer, ['io', 'io']);
    assert.deepEqual(
      app.bankWithKeys.filter(e => e.placed).map(e => e.idx), [0, 2],
      'colocados exactamente los slots 0 y 2'
    );
    assert.equal(app.bankWithKeys[1].placed, false);
    assert.equal(app.bankWithKeys[3].placed, false);

    app.wordButtonsRemoveWord(0); // quita el PRIMER 'io' (answerPos 0)
    assert.equal(app.bankWithKeys[0].placed, false, 'libera el slot 0 (primer io)');
    assert.equal(app.bankWithKeys[2].placed, true, 'el slot 2 (segundo io) sigue colocado');
    assert.deepEqual(app.wordButtonsAnswer, ['io']);
  });

  test('visibleSlotIdx mapea la N-ésima VISIBLE saltando las colocadas', () => {
    const app = wbApp(['a', 'b', 'c', 'd']);
    app.wordButtonsAddWord(1); // coloca slot 1 (b) → visibles: a(0), c(2), d(3)
    assert.equal(app.visibleSlotIdx(0), 0);
    assert.equal(app.visibleSlotIdx(1), 2, 'la 2ª visible es el slot 2 (c), no el slot crudo 1');
    assert.equal(app.visibleSlotIdx(2), 3);
    assert.equal(app.visibleSlotIdx(3), -1, 'no hay 4ª visible');
  });

  test('handleSongKey dígito coloca la N-ésima VISIBLE (no el slot crudo) con un slot ya colocado', () => {
    const app = wbApp(['a', 'b', 'c']);
    app.wordButtonsAddWord(0); // coloca 'a' (slot 0) → visibles: b(1), c(2)

    app.handleSongKey(fakeKey('1')); // tecla 1 → 1ª visible → slot 1 (b)

    assert.deepEqual(app.wordButtonsAnswer, ['a', 'b'],
      'la tecla 1 coloca la 1ª palabra VISIBLE (b), no el slot crudo 1');
    assert.equal(app.bankWithKeys[1].placed, true);
  });
});
