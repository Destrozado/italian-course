// tests/screen-canciones.test.js
//
// Phase 13 (Plan 13-02) — Smoke / presence-check tests para el bloque
// Canciones: botón protagonista en el home, pantalla de listado, playthrough
// secuencial it->es con cascada D-54, y resumen post-canción.
//
// Estrategia (coherente con tests/screen-examen.test.js): verificación textual
// de presencia + windowed slicing sobre `src/screens/app.js`, `index.html` y
// `src/main.js`. El factory `appShell` no es trivialmente instanciable bajo
// node sin Alpine (getters reactivos + Promise-handoff), así que los tests
// behaviorales mid-playthrough los cubre UAT humano post-merge (coherente con
// el patrón documentado en Phase 3+).
//
// Se ejecuta con:
//     node --test tests/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appJsPath = new URL('../src/screens/app.js', import.meta.url);
const indexHtmlPath = new URL('../index.html', import.meta.url);
const mainJsPath = new URL('../src/main.js', import.meta.url);
const appSrc = readFileSync(appJsPath, 'utf8');
const indexSrc = readFileSync(indexHtmlPath, 'utf8');
const mainSrc = readFileSync(mainJsPath, 'utf8');

// ─────────────────────────────────────────────────────────────────────────────
// Task 1 — Boot wiring + botón Canciones + pantalla listado (SONG-01/02/03)
// ─────────────────────────────────────────────────────────────────────────────

describe('Canciones — Task 1: boot wiring + home button + listado', () => {
  test('src/main.js cablea loadSongs y adjunta songsById SEPARADO de exerciseById (LINK-04)', () => {
    assert.ok(/\bloadSongs\b/.test(mainSrc),
      'main.js debe invocar loadSongs (carga standalone Phase 13)');
    assert.ok(mainSrc.includes('content.songsById'),
      'main.js debe adjuntar songsById al objeto content (campo hermano de exerciseById)');
    // songsById NO debe escribirse dentro de exerciseById.
    assert.ok(!/exerciseById\s*\[[^\]]*\]\s*=\s*song/i.test(mainSrc),
      'songsById NUNCA debe mezclarse en exerciseById — standalone LINK-04');
  });

  test('index.html tiene el botón Canciones PROTAGONISTA (no class="secondary") en la fila prominente (D-01)', () => {
    const rowIdx = indexSrc.indexOf('button-row button-row-prominent');
    assert.ok(rowIdx > -1, 'debe existir la fila prominente .button-row button-row-prominent');
    // Ventana de la fila prominente (hasta el cierre del div).
    const rowWindow = indexSrc.slice(rowIdx, rowIdx + 900);
    assert.ok(rowWindow.includes("currentScreen = 'canciones'"),
      'el botón Canciones debe abrir currentScreen = \'canciones\'');
    // Aislar el <button ...>Canciones</button> y verificar que NO lleva secondary.
    const m = rowWindow.match(/<button[^>]*>Canciones<\/button>/);
    assert.ok(m, 'debe existir un <button>...Canciones</button> en la fila prominente');
    assert.ok(!/class\s*=\s*"[^"]*secondary[^"]*"/.test(m[0]),
      'el botón Canciones NO debe llevar class="secondary" — es protagonista (D-01)');
  });

  test('index.html tiene el template del listado currentScreen === \'canciones\'', () => {
    assert.ok(indexSrc.includes("currentScreen === 'canciones'"),
      'debe existir el template x-if del listado de canciones');
    assert.ok(indexSrc.includes('songsForDisplay'),
      'el listado debe iterar songsForDisplay (x-for)');
  });

  test('index.html: botón Jugar de 1 clic enlaza startSong(song.id) (SONG-03)', () => {
    assert.ok(indexSrc.includes('startSong(song.id)'),
      'el botón Jugar debe enlazar @click="startSong(song.id)" — inicio 1-clic SONG-03');
  });

  test('src/screens/app.js: getter songsForDisplay definido con guarda double-defense', () => {
    const idx = appSrc.search(/get songsForDisplay\s*\(\)\s*\{/);
    assert.ok(idx > -1, 'songsForDisplay debe estar definido como getter');
    const window = appSrc.slice(idx, idx + 800);
    assert.ok(window.includes('if (!this.content'),
      'songsForDisplay debe tener la guarda double-defense if (!this.content...)');
    assert.ok(window.includes('songProgress'),
      'songsForDisplay debe leer state.songProgress para el status por canción');
  });

  test('src/screens/app.js: currentScreen documenta el valor canciones', () => {
    assert.ok(appSrc.includes("'canciones'"),
      'app.js debe referenciar el valor de pantalla \'canciones\'');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Task 2 — Playthrough secuencial it->es + cascada D-54 (PLAY-01/02/03/05, LINK)
// ─────────────────────────────────────────────────────────────────────────────

describe('Canciones — Task 2: playthrough secuencial + cascada D-54', () => {
  // Ventana de inspección del CUERPO de startSong: desde su definición hasta
  // el `/**` del siguiente método (JSDoc de songCheck) para no contaminarse
  // con métodos vecinos ni con sus comentarios.
  const startSongIdx = appSrc.search(/^\s+startSong\(songId\)\s*\{/m);
  let startSongEnd = startSongIdx + 3000;
  if (startSongIdx > -1) {
    const nextDoc = appSrc.indexOf('\n    /**', startSongIdx + 50);
    if (nextDoc > -1) startSongEnd = nextDoc;
  }
  const startSongWindow = startSongIdx > -1
    ? appSrc.slice(startSongIdx, startSongEnd)
    : '';

  test('startSong(songId) está definido en src/screens/app.js (SONG-03 / PLAY-01)', () => {
    assert.ok(startSongIdx > -1,
      'startSong(songId) debe estar definido — entry point del playthrough');
  });

  test('startSong NO usa buildFullTest / buildSession / fisherYates sobre el orden de frases (PLAY-01, LINK-04)', () => {
    assert.ok(!startSongWindow.includes('buildFullTest'),
      'startSong NO debe llamar buildFullTest — recorre phrases EN ORDEN (PLAY-01)');
    assert.ok(!startSongWindow.includes('buildSession'),
      'startSong NO debe llamar buildSession — standalone (LINK-04)');
    // El shuffle del orden de frases está prohibido; el banco de cada frase SÍ
    // puede usar fisherYates pero eso ocurre en initSubStateForExercise, no en
    // el cuerpo de startSong directamente sobre el orderedIds.
    assert.ok(!/fisherYates\([^)]*orderedIds/.test(startSongWindow),
      'startSong NO debe hacer fisherYates sobre el orden de frases (PLAY-01)');
  });

  test('startSong NO persiste inFlightTest (PLAY-05 — sin slot de reanudación)', () => {
    // Chequeamos la INVOCACIÓN (this.persistInFlightTest()), no la mención en
    // comentarios — el cuerpo documenta explícitamente "NO persistInFlightTest".
    assert.ok(!/this\.persistInFlightTest\(/.test(startSongWindow),
      'startSong NO debe llamar persistInFlightTest — abandonar descarta, re-entra de cero (PLAY-05)');
  });

  test('startSong resuelve frases contra songPhraseById, NO contra exerciseById (LINK-04)', () => {
    assert.ok(startSongWindow.includes('songPhraseById'),
      'el playthrough debe usar el mapa dedicado songPhraseById (LINK-04)');
    // Chequeamos el ACCESO de código a exerciseById (lookup), no menciones en
    // comentarios.
    assert.ok(!/\.exerciseById\b/.test(startSongWindow),
      'startSong NO debe leer .exerciseById — las frases no existen ahí (LINK-04)');
  });

  test('startSong captura el snapshot before AL INICIO (cascada incremental)', () => {
    assert.ok(startSongWindow.includes('songBefore') && startSongWindow.includes('categoryProgress'),
      'startSong debe capturar songBefore = deep-clone de categoryProgress al inicio (cascada incremental)');
    assert.ok(startSongWindow.includes("this.currentScreen = 'cancion'"),
      "startSong debe transicionar a currentScreen='cancion'");
  });

  test('el path de canción NO añade un call-site de cascada (Pitfall #2, D-54)', () => {
    // Baseline pre-Phase-13: 2 invocaciones de applyImmediateFailure ya
    // existentes — applyResultToSession (path unificado word-buttons/multi-choice
    // + completado match) y matchPickRight (cascada per-pareja del match, D-61).
    // El playthrough de canción REUSA applyResultToSession (vía songCheck) y NO
    // debe añadir un tercer call-site (Pitfall #2). Verificamos que el total se
    // mantiene en 2 invocaciones de código.
    const invocations = (appSrc.match(/=\s*applyImmediateFailure\(/g) || []).length;
    assert.equal(invocations, 2,
      `applyImmediateFailure debe mantenerse en 2 call-sites preexistentes (applyResultToSession + matchPickRight); el path de canción NO añade otro; encontrados: ${invocations}`);
    // Y el cuerpo de startSong NO debe INVOCAR applyImmediateFailure directamente
    // (chequeamos la llamada `applyImmediateFailure(`, no menciones en comentarios).
    assert.ok(!/applyImmediateFailure\(/.test(startSongWindow),
      'startSong NO debe llamar applyImmediateFailure directamente (reusa applyResultToSession — Pitfall #2)');
  });

  test('songCheck delega en applyResultToSession (single call-site D-54)', () => {
    const idx = appSrc.search(/^\s+songCheck\(\)\s*\{/m);
    assert.ok(idx > -1, 'songCheck debe estar definido');
    const window = appSrc.slice(idx, idx + 800);
    assert.ok(window.includes('applyResultToSession'),
      'songCheck debe delegar en applyResultToSession (único call-site de cascada)');
    assert.ok(window.includes('songCurrentPhrase'),
      'songCheck debe resolver la frase contra songCurrentPhrase (LINK-04)');
  });

  test('songAdvance dispara completeSong al final, sin persistInFlightTest (PLAY-05)', () => {
    const idx = appSrc.search(/^\s+songAdvance\(\)\s*\{/m);
    assert.ok(idx > -1, 'songAdvance debe estar definido');
    const window = appSrc.slice(idx, idx + 800);
    assert.ok(window.includes('completeSong'),
      'songAdvance debe llamar completeSong al pasar el final');
    assert.ok(!window.includes('persistInFlightTest'),
      'songAdvance NO debe persistir inFlightTest (PLAY-05)');
  });

  test('index.html: render del playthrough usa x-text para el prompt italiano (T-02-01, NO x-html)', () => {
    const idx = indexSrc.indexOf("currentScreen === 'cancion' && songCurrentPhrase");
    assert.ok(idx > -1, 'debe existir el template del playthrough cancion');
    // Ventana del template de canción hasta el cierre.
    const window = indexSrc.slice(idx, idx + 3500);
    assert.ok(window.includes('x-text="songCurrentPhrase.payload.prompt"'),
      'el prompt italiano debe renderizarse con x-text (T-02-01)');
    assert.ok(!window.includes('x-html'),
      'el bloque del playthrough NO debe usar x-html (T-02-01 anti-XSS)');
    assert.ok(window.includes('handleSongKey($event)'),
      'el playthrough debe enlazar @keydown.window="handleSongKey($event)" (D-72)');
    assert.ok(window.includes('songCheck') && window.includes('songAdvance'),
      'el playthrough debe enlazar songCheck (Comprobar) y songAdvance (Siguiente)');
  });
});
