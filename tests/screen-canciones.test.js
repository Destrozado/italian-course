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
