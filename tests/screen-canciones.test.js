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

import { appShell } from '../src/screens/app.js';

const appJsPath = new URL('../src/screens/app.js', import.meta.url);
const indexHtmlPath = new URL('../index.html', import.meta.url);
const mainJsPath = new URL('../src/main.js', import.meta.url);
const appSrc = readFileSync(appJsPath, 'utf8');
const indexSrc = readFileSync(indexHtmlPath, 'utf8');
const mainSrc = readFileSync(mainJsPath, 'utf8');

const appCssPath = new URL('../app.css', import.meta.url);
const stylesCssPath = new URL('../styles.css', import.meta.url);
const appCssSrc = readFileSync(appCssPath, 'utf8');
const stylesCssSrc = readFileSync(stylesCssPath, 'utf8');

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

  test('index.html: botón Canciones en la fila ghost editorial (Phase 32 D-04 supersede D-01)', () => {
    // Phase 32 D-04: Canciones BAJA de protagonista a la fila ghost de 3
    // (Test completo · Canciones · Backup). El comportamiento se preserva
    // (abre currentScreen = 'canciones'); solo cambia su nivel visual.
    const rowIdx = indexSrc.indexOf('home-ghost-row');
    assert.ok(rowIdx > -1, 'debe existir la fila ghost editorial .home-ghost-row (Phase 32)');
    const rowWindow = indexSrc.slice(rowIdx, rowIdx + 900);
    const m = rowWindow.match(/<button[^>]*>Canciones<\/button>/);
    assert.ok(m, 'debe existir un <button>...Canciones</button> en la fila ghost');
    assert.ok(/@click="currentScreen = 'canciones'"/.test(m[0]),
      'el botón Canciones ghost debe abrir currentScreen = \'canciones\' (comportamiento preservado)');
    assert.ok(/class\s*=\s*"[^"]*home-ghost[^"]*"/.test(m[0]),
      'el botón Canciones debe llevar la clase home-ghost (nivel ghost, D-04)');
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
    // Ventana del template de canción hasta el banner SUMMARY (acotada por
    // marcador, no por offset fijo: Phase 34-04 añadió la barra superior
    // Editoriale y un offset fijo dejaría songCheck/songAdvance fuera).
    const summaryBanner = indexSrc.indexOf('Pantalla SUMMARY', idx);
    const window = indexSrc.slice(idx, summaryBanner > -1 ? summaryBanner : idx + 4000);
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

// ─────────────────────────────────────────────────────────────────────────────
// Task 3 — Resumen post-canción + songProgress write-once + retorno (PLAY-04, D-02/D-04)
// ─────────────────────────────────────────────────────────────────────────────

describe('Canciones — Task 3: resumen post-canción + write-once + retorno', () => {
  // Ventana del cuerpo de completeSong (hasta el siguiente JSDoc).
  const completeSongIdx = appSrc.search(/^\s+completeSong\(\)\s*\{/m);
  let completeSongEnd = completeSongIdx + 3500;
  if (completeSongIdx > -1) {
    const nextDoc = appSrc.indexOf('\n    /**', completeSongIdx + 50);
    if (nextDoc > -1) completeSongEnd = nextDoc;
  }
  const completeSongWindow = completeSongIdx > -1
    ? appSrc.slice(completeSongIdx, completeSongEnd)
    : '';

  test('completeSong escribe songProgress write-once-at-end (D-02) y NO llama applySessionResult (standalone)', () => {
    assert.ok(completeSongIdx > -1, 'completeSong debe estar definido');
    assert.ok(/songProgress\[/.test(completeSongWindow),
      'completeSong debe escribir en songProgress[songId] (write-once-at-end, D-02)');
    assert.ok(completeSongWindow.includes("'pasada'") && completeSongWindow.includes("'fallada'"),
      'completeSong debe derivar status pasada/fallada del recorrido');
    // NO debe llamar applySessionResult (standalone — la cascada ya ocurrió per-frase).
    assert.ok(!/applySessionResult\(/.test(completeSongWindow),
      'completeSong NO debe llamar applySessionResult — standalone, la cascada D-54 ya ocurrió per-frase (LINK-04)');
  });

  test('completeSong computa el set failedCategoryIds contra songPhraseById (Block B, D-04)', () => {
    assert.ok(completeSongWindow.includes('failedCategoryIds') && completeSongWindow.includes('songPhraseById'),
      'completeSong debe computar failedCategoryIds resolviendo categoryIds contra songPhraseById');
    assert.ok(completeSongWindow.includes('songBefore'),
      'completeSong debe usar el snapshot songBefore (capturado al inicio) para el antes→después');
    assert.ok(completeSongWindow.includes("this.currentScreen = 'cancion-summary'"),
      "completeSong debe transicionar a currentScreen='cancion-summary'");
  });

  test('returnToSongList vuelve a currentScreen = canciones (SONG-02/04)', () => {
    const idx = appSrc.search(/^\s+returnToSongList\(\)\s*\{/m);
    assert.ok(idx > -1, 'returnToSongList debe estar definido');
    const window = appSrc.slice(idx, idx + 600);
    assert.ok(window.includes("this.currentScreen = 'canciones'"),
      "returnToSongList debe setear currentScreen='canciones' (el listado refleja el nuevo estado)");
    assert.ok(window.includes('resetSession'),
      'returnToSongList debe llamar resetSession (limpia sub-estado)');
  });

  test('index.html: resumen de canción usa x-text (NO x-html) y lookup contra songPhraseById (T-02-01, D-04)', () => {
    const idx = indexSrc.indexOf("currentScreen === 'cancion-summary' && songSummaryDelta");
    assert.ok(idx > -1, 'debe existir el template del resumen cancion-summary');
    const window = indexSrc.slice(idx, idx + 3000);
    assert.ok(!window.includes('x-html'),
      'el resumen de canción NO debe usar x-html (T-02-01 anti-XSS)');
    assert.ok(window.includes('songPhraseById[result.exerciseId]'),
      'Block A debe resolver las frases falladas contra songPhraseById (LINK-04 / D-04)');
    assert.ok(window.includes('songSummaryDelta'),
      'Block B debe iterar songSummaryDelta (categorías que bajaron de estado)');
    assert.ok(window.includes('delta-regression'),
      'Block B debe usar la flecha delta-regression (render factual antes→después, sin gamificación)');
    assert.ok(window.includes('returnToSongList'),
      'el resumen debe enlazar returnToSongList para volver al listado');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regresión — bankWithKeys debe pintar el banco en modo canción (WR bug fix)
//
// En modo canción la frase activa vive en songPhraseById (LINK-04), NO en
// exerciseById, así que sessionCurrentExercise es null. El getter bankWithKeys
// guardaba SOLO contra sessionCurrentExercise → devolvía [] y el banco de
// palabras nunca se pintaba (afectaba a TODAS las canciones). El fix acepta
// también songCurrentPhrase, manteniendo la defensa anti-TypeError del unmount.
// ─────────────────────────────────────────────────────────────────────────────
describe('Canciones — regresión: bankWithKeys pinta el banco en modo canción', () => {
  function songApp(bank) {
    const app = appShell(Promise.resolve());
    // Frase activa SOLO en songPhraseById (LINK-04) — exerciseById vacío.
    app.content = { exerciseById: {}, songsById: {} };
    app.sessionMode = 'cancion';
    app.sessionExerciseIds = ['equilibrio-mentale-001'];
    app.sessionCursor = 0;
    app.songPhraseById = {
      'equilibrio-mentale-001': {
        id: 'equilibrio-mentale-001',
        type: 'word-buttons',
        payload: { prompt: 'Mi sento come...', answer: ['me', 'siento', 'como'], distractors: [] },
        categoryIds: []
      }
    };
    app.wordButtonsBank = bank;
    return app;
  }

  test('bankWithKeys NO está vacío en modo canción aunque sessionCurrentExercise sea null (LINK-04)', () => {
    const app = songApp(['como', 'me', 'siento']);
    assert.equal(app.sessionCurrentExercise, null,
      'precondición: la frase de canción no existe en exerciseById (LINK-04)');
    assert.ok(app.songCurrentPhrase, 'precondición: songCurrentPhrase resuelve la frase activa');
    assert.equal(app.bankWithKeys.length, 3,
      'el banco debe pintar las 3 palabras en modo canción (no [])');
    assert.deepEqual(app.bankWithKeys.map(e => e.word), ['como', 'me', 'siento'],
      'bankWithKeys debe derivar de wordButtonsBank preservando el orden barajado');
  });

  test('bankWithKeys numera las teclas 1..9 y deja key vacía a partir del índice 9 (D-69)', () => {
    const app = songApp(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    const keys = app.bankWithKeys.map(e => e.key);
    assert.deepEqual(keys.slice(0, 9), ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    assert.equal(keys[9], '', 'la palabra en índice 9 (10ª) no debe numerarse (D-69)');
  });

  test('bankWithKeys devuelve [] cuando no hay frase activa (defensa anti-TypeError del unmount)', () => {
    const app = appShell(Promise.resolve());
    app.content = { exerciseById: {}, songsById: {} };
    app.sessionExerciseIds = [];
    app.sessionCursor = 0;
    assert.equal(app.sessionCurrentExercise, null);
    assert.equal(app.songCurrentPhrase, null);
    assert.equal(app.bankWithKeys.length, 0,
      'sin frase activa en ningún modo, bankWithKeys debe ser [] (unmount tick)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// quick-260615-nzi — contador vecesFallada por canción (completeSong) + getter
//
// completeSong incrementa songProgress[songId].vecesFallada +1 por playthrough
// con >=1 frase fallada (una sola vez); 0 frases falladas → +0. El getter
// songsForDisplay expone vecesFallada (?? 0). index.html lo muestra solo si N>0.
// ─────────────────────────────────────────────────────────────────────────────
describe('Canciones — quick-260615-nzi: contador vecesFallada por canción', () => {
  // Arma un app con un playthrough listo para cerrar con completeSong.
  function completedSongApp(results, prevVecesFallada) {
    const app = appShell(Promise.resolve());
    app.content = { categories: [], songsById: {} };
    app.songActiveId = 'equilibrio-mentale';
    app.sessionResults = results;
    app.songPhraseById = {};
    app.songBefore = {};
    const songProgress = {};
    if (prevVecesFallada !== undefined) {
      songProgress['equilibrio-mentale'] = { status: 'fallada', lastPlayedAt: '2026-06-01', vecesFallada: prevVecesFallada };
    }
    app.state = {
      schemaVersion: 10,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      songProgress,
      lastBackupAt: null,
      firstUsedAt: null
    };
    return app;
  }

  test('completeSong con >=1 frase fallada → vecesFallada = 1 (desde 0)', () => {
    const app = completedSongApp([
      { exerciseId: 'equilibrio-mentale-001', correct: true },
      { exerciseId: 'equilibrio-mentale-002', correct: false }
    ]);
    app.completeSong();
    assert.equal(app.state.songProgress['equilibrio-mentale'].status, 'fallada');
    assert.equal(app.state.songProgress['equilibrio-mentale'].vecesFallada, 1,
      'playthrough con fallo incrementa vecesFallada a 1');
  });

  test('completeSong sin fallos → +0 (preserva el previo, status pasada)', () => {
    const app = completedSongApp([
      { exerciseId: 'equilibrio-mentale-001', correct: true },
      { exerciseId: 'equilibrio-mentale-002', correct: true }
    ], 2);
    app.completeSong();
    assert.equal(app.state.songProgress['equilibrio-mentale'].status, 'pasada');
    assert.equal(app.state.songProgress['equilibrio-mentale'].vecesFallada, 2,
      'playthrough sin fallos NO incrementa — preserva el previo (2)');
  });

  test('completeSong acumula: previo 2 + playthrough con fallo → 3', () => {
    const app = completedSongApp([
      { exerciseId: 'equilibrio-mentale-001', correct: false }
    ], 2);
    app.completeSong();
    assert.equal(app.state.songProgress['equilibrio-mentale'].vecesFallada, 3);
  });

  test('songsForDisplay expone vecesFallada (?? 0) por canción', () => {
    const app = appShell(Promise.resolve());
    app.content = {
      songsById: {
        'equilibrio-mentale': { id: 'equilibrio-mentale', title: 'Equilibrio mentale', phrases: [{}, {}] },
        'solo': { id: 'solo', title: 'Solo', phrases: [{}] }
      }
    };
    app.state = {
      schemaVersion: 10,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      songProgress: {
        'equilibrio-mentale': { status: 'fallada', lastPlayedAt: '2026-06-02', vecesFallada: 4 }
        // 'solo' sin entrada → lazy-init 0
      },
      lastBackupAt: null,
      firstUsedAt: null
    };
    const rows = app.songsForDisplay;
    const eq = rows.find(r => r.id === 'equilibrio-mentale');
    const solo = rows.find(r => r.id === 'solo');
    assert.equal(eq.vecesFallada, 4, 'expone el contador persistido');
    assert.equal(solo.vecesFallada, 0, 'canción sin entrada → lazy-init 0');
  });

  test('index.html: indicador "fallada xN" en categorías con x-show N>0', () => {
    // Categoría: el indicador usa cat.vecesFallada con x-show > 0.
    assert.ok(/x-show="cat\.vecesFallada > 0"/.test(indexSrc),
      'la fila de categoría debe mostrar el indicador solo si vecesFallada > 0');
    assert.ok(/`fallada x\$\{cat\.vecesFallada\}`/.test(indexSrc),
      'el indicador de categoría debe renderizar "fallada xN" vía x-text');
    // El indicador de canción (song.vecesFallada) vive ahora en las filas
    // Editoriale repintadas — se verifica en el bloque Phase 34-02 Task 2.
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-01) — Getters presentacionales compartidos:
//   · songsForDisplay extendido (titleDisplay/artist/metaLabel/featured) D-01/D-05/D-06
//   · summaryScore {correct,total,pct} desde el snapshot summarySessionResults D-09/D-10
//   · pickerSelectedCount = pickerCheckedCategoryIds.length D-12
//   · guarda cascada D-54 (applyImmediateFailure(this.state intacto)
//
// Presentación pura — el motor NO se toca. Mezcla source-asserts (estilo
// screen-home-editorial) + asserts behaviorales sobre el factory instanciado
// (igual que la regresión vecesFallada de songsForDisplay).
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-01 — songsForDisplay: title/artist split + featured (D-01/D-05/D-06)', () => {
  test('songsForDisplay deriva el artista partiendo title por el em-dash "—" (source-assert D-05)', () => {
    const idx = appSrc.search(/get songsForDisplay\s*\(\)\s*\{/);
    assert.ok(idx > -1, 'songsForDisplay debe estar definido');
    // Ventana amplia: el getter pre-computa featuredId (D-01) antes del map, así
    // que el split por "—" vive más abajo en el cuerpo.
    const window = appSrc.slice(idx, idx + 2400);
    assert.ok(window.includes("split('—')"),
      "songsForDisplay debe partir el title por el em-dash '—' (idiom de categoriesForDisplay, D-05)");
    assert.ok(/titleDisplay/.test(window) && /artist/.test(window) && /metaLabel/.test(window),
      'songsForDisplay debe exponer titleDisplay / artist / metaLabel (D-05/D-06)');
    assert.ok(/featured/.test(window),
      'songsForDisplay debe etiquetar la fila destacada con un flag featured (D-01)');
  });

  function songApp(songs, progress) {
    const app = appShell(Promise.resolve());
    app.content = { songsById: songs };
    app.state = {
      schemaVersion: 10,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      songProgress: progress ?? {},
      lastBackupAt: null,
      firstUsedAt: null
    };
    return app;
  }

  test('titleDisplay/artist/metaLabel derivan del split por "—" (artista presente)', () => {
    const app = songApp({
      'eq': { id: 'eq', title: 'Equilibrio mentale — Caparezza', phrases: [{}, {}, {}] }
    });
    const row = app.songsForDisplay.find(r => r.id === 'eq');
    assert.equal(row.titleDisplay, 'Equilibrio mentale', 'título = parte izquierda trim');
    assert.equal(row.artist, 'Caparezza', 'artista = parte derecha trim');
    assert.equal(row.metaLabel, 'Caparezza · 3 huecos', 'meta = {artista} · {N} huecos');
  });

  test('sin "—": titleDisplay = título completo, artist = "", meta = "{N} huecos"', () => {
    const app = songApp({
      'solo': { id: 'solo', title: 'Solo', phrases: [{}] }
    });
    const row = app.songsForDisplay.find(r => r.id === 'solo');
    assert.equal(row.titleDisplay, 'Solo');
    assert.equal(row.artist, '', 'sin em-dash → artist vacío');
    assert.equal(row.metaLabel, '1 huecos', 'sin artista → solo "{N} huecos"');
  });

  test('featured = primera no-hecha|fallada en orden de lista (D-01)', () => {
    const app = songApp(
      {
        a: { id: 'a', title: 'A', phrases: [{}] },
        b: { id: 'b', title: 'B', phrases: [{}] },
        c: { id: 'c', title: 'C', phrases: [{}] }
      },
      {
        a: { status: 'pasada' },
        b: { status: 'fallada' }
        // c → no-hecha (sin entrada)
      }
    );
    const rows = app.songsForDisplay;
    assert.equal(rows.find(r => r.id === 'a').featured, false, 'pasada nunca es featured');
    assert.equal(rows.find(r => r.id === 'b').featured, true, 'primera fallada/no-hecha = featured');
    assert.equal(rows.find(r => r.id === 'c').featured, false, 'solo una featured');
    assert.equal(rows.filter(r => r.featured).length, 1, 'exactamente una featured');
  });

  test('todas pasada → ninguna featured (D-04 empty state)', () => {
    const app = songApp(
      { a: { id: 'a', title: 'A', phrases: [{}] }, b: { id: 'b', title: 'B', phrases: [{}] } },
      { a: { status: 'pasada' }, b: { status: 'pasada' } }
    );
    assert.equal(app.songsForDisplay.filter(r => r.featured).length, 0,
      'cuando todas son pasada, ninguna fila es featured');
  });

  test('preserva los campos existentes (id/title/phraseCount/status/statusLabel/vecesFallada)', () => {
    const app = songApp(
      { a: { id: 'a', title: 'A — Artista', phrases: [{}, {}] } },
      { a: { status: 'fallada', vecesFallada: 3 } }
    );
    const row = app.songsForDisplay.find(r => r.id === 'a');
    assert.equal(row.id, 'a');
    assert.equal(row.title, 'A — Artista', 'title crudo se preserva verbatim');
    assert.equal(row.phraseCount, 2);
    assert.equal(row.status, 'fallada');
    assert.equal(row.vecesFallada, 3);
    assert.ok(typeof row.statusLabel === 'string' && row.statusLabel.length > 0);
  });
});

describe('Phase 34-01 — summaryScore desde el snapshot (D-09/D-10)', () => {
  test('summaryScore lee summarySessionResults y computa pct (source-assert)', () => {
    const idx = appSrc.search(/get summaryScore\s*\(\)\s*\{/);
    assert.ok(idx > -1, 'summaryScore debe estar definido como getter');
    const window = appSrc.slice(idx, idx + 500);
    assert.ok(window.includes('summarySessionResults'),
      'summaryScore debe derivar del SNAPSHOT summarySessionResults (D-10), no de sessionResults live');
    assert.ok(window.includes('pct'),
      'summaryScore debe computar el porcentaje pct');
  });

  test('summaryScore = {correct,total,pct} desde el snapshot', () => {
    const app = appShell(Promise.resolve());
    app.summarySessionResults = [
      { exerciseId: 'x1', correct: true },
      { exerciseId: 'x2', correct: false },
      { exerciseId: 'x3', correct: true },
      { exerciseId: 'x4', correct: true }
    ];
    const s = app.summaryScore;
    assert.equal(s.total, 4, 'total = answered count (D-10)');
    assert.equal(s.correct, 3, 'correct = conteo de r.correct truthy');
    assert.equal(s.pct, 75, 'pct = round(correct/total*100)');
  });

  test('summaryScore con snapshot vacío → {0,0,0} (sin divide-by-zero)', () => {
    const app = appShell(Promise.resolve());
    app.summarySessionResults = [];
    assert.deepEqual(app.summaryScore, { correct: 0, total: 0, pct: 0 });
  });
});

describe('Phase 34-01 — pickerSelectedCount (D-12)', () => {
  test('pickerSelectedCount lee pickerCheckedCategoryIds.length (source-assert)', () => {
    const idx = appSrc.search(/get pickerSelectedCount\s*\(\)\s*\{/);
    assert.ok(idx > -1, 'pickerSelectedCount debe estar definido como getter');
    const window = appSrc.slice(idx, idx + 300);
    assert.ok(window.includes('pickerCheckedCategoryIds') && window.includes('length'),
      'pickerSelectedCount debe devolver pickerCheckedCategoryIds.length (D-12)');
  });

  test('pickerSelectedCount = número de categorías marcadas', () => {
    const app = appShell(Promise.resolve());
    app.pickerCheckedCategoryIds = ['a', 'b', 'c'];
    assert.equal(app.pickerSelectedCount, 3);
    app.pickerCheckedCategoryIds = [];
    assert.equal(app.pickerSelectedCount, 0);
  });
});

describe('Phase 34-01 — guarda motor intacto (cascada D-54)', () => {
  test('applyImmediateFailure(this.state se mantiene en 2 call-sites (D-54 no regresa)', () => {
    const invocations = (appSrc.match(/applyImmediateFailure\(this\.state/g) || []).length;
    assert.equal(invocations, 2,
      `applyImmediateFailure(this.state debe mantenerse en 2 call-sites; encontrados: ${invocations}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34-01 (Task 2) — tokens net-new + clases badge de la tríada de canción
//   · app.css :root: --ed-green-dark / --ed-placeholder / --ed-ring-track
//   · app.css (fondo): .badge-pasada (verde) / .badge-fallada (rojo) — tríada
//     de CANCIÓN, junto a (no reemplazando) la tríada de categoría en styles.css
//   · sin --pico-* nuevo, sin prefers-color-scheme (D-32-03, dark-mode off)
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-01 — Task 2: tokens net-new + badge de canción (D-07)', () => {
  test('app.css :root define --ed-green-dark / --ed-placeholder / --ed-ring-track', () => {
    assert.ok(/--ed-green-dark\s*:\s*#296c4a/.test(appCssSrc),
      'app.css debe definir --ed-green-dark: #296c4a (stripe portada, UI-SPEC §Color)');
    assert.ok(/--ed-placeholder\s*:/.test(appCssSrc),
      'app.css debe definir --ed-placeholder (color muted del "/Y" del hero de score)');
    assert.ok(/--ed-ring-track\s*:\s*#e6ddcd/.test(appCssSrc),
      'app.css debe definir --ed-ring-track: #e6ddcd (handoff §5, distinto de --ed-streak-track)');
  });

  test('app.css define .badge-pasada (verde) y .badge-fallada (rojo) — tríada de canción (D-07)', () => {
    assert.ok(/\.badge-pasada\s*\{[^}]*var\(--ed-green\)/.test(appCssSrc),
      '.badge-pasada debe usar color var(--ed-green) (pasada → verde)');
    assert.ok(/\.badge-fallada\s*\{[^}]*var\(--ed-red\)/.test(appCssSrc),
      '.badge-fallada debe usar color var(--ed-red) (fallada → rojo)');
  });

  test('la tríada de categoría en styles.css NO se toca (badge-no-hecha/hecha/dominada)', () => {
    assert.ok(/\.badge-no-hecha\s*\{/.test(stylesCssSrc),
      'styles.css conserva .badge-no-hecha (neutro, reusado por la canción)');
    assert.ok(/\.badge-hecha\s*\{/.test(stylesCssSrc) && /\.badge-dominada\s*\{/.test(stylesCssSrc),
      'styles.css conserva la tríada de categoría hecha/dominada intacta');
    // app.css NO debe redefinir badge-pasada/fallada como tríada de CATEGORÍA
    // (no introduce badge-hecha/badge-dominada nuevos).
    assert.ok(!/\.badge-dominada\s*\{/.test(appCssSrc),
      'app.css NO debe redefinir .badge-dominada (la tríada de categoría vive en styles.css)');
  });

  test('regresión: el bloque badge/token nuevo NO introduce --pico-* ni prefers-color-scheme', () => {
    // app.css ya tiene un compat-shim --pico-* INTENCIONADO (FND-03/GAP-01) que
    // mapea las vars de Pico a tokens --ed-* para que styles.css legacy resuelva
    // (Pico fue eliminado en Phase 32). Ese shim vive SOLO en el bloque
    // `:root[data-pico-shim]`-style del top del archivo. El bloque badge/token
    // NUEVO del fondo NO debe añadir más referencias --pico-*: verificamos que
    // todas las ocurrencias --pico-* siguen ANTES del banner del bloque Phase 34.
    const banner = appCssSrc.indexOf('Tríada de estado de CANCIÓN');
    assert.ok(banner > -1, 'debe existir el banner del bloque badge de canción al fondo de app.css');
    const tail = appCssSrc.slice(banner);
    // Una referencia REAL es `var(--pico-...)` o una definición `--pico-...:`.
    // Las menciones en PROSA de comentarios ("cero --pico-*") no son referencias
    // y no deben disparar el guard (mismo criterio que la deviation 34-01 #1).
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque badge/token nuevo (Phase 34, fondo) NO debe introducir referencias --pico-*');
    // Dark-mode forzado OFF (D-32-03): ninguna regla prefers-color-scheme en app.css.
    assert.ok(!/prefers-color-scheme/.test(appCssSrc),
      'app.css NO debe añadir reglas prefers-color-scheme (dark-mode off, D-32-03)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-02, Task 1) — Tarjeta DESTACADA Continuar/Empezar (SRP-01)
//   · render gated por song.featured (D-01); oculta cuando todas pasada (D-04)
//   · overline CONTINUAR (fallada) / EMPEZAR (no-hecha) hardcoded por rama (D-03)
//   · superficie --ed-paper-elevated + --ed-radius-card (NO el verde del CTA)
//   · barra por ESTADO, sin fracción numérica (D-02)
//   · @click reusa startSong(song.id) verbatim; T-02-01: x-text only, no x-html
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-02 — Task 1: tarjeta destacada Continuar/Empezar (D-01..D-04)', () => {
  test('index.html: la tarjeta destacada se renderiza gated por song.featured (D-01/D-04)', () => {
    const idx = indexSrc.indexOf("currentScreen === 'canciones'");
    assert.ok(idx > -1, 'debe existir el template del listado de canciones');
    const window = indexSrc.slice(idx, idx + 3500);
    assert.ok(/class="song-featured"/.test(window),
      'debe existir la tarjeta .song-featured');
    assert.ok(/x-show="song\.featured"/.test(window),
      'la tarjeta destacada debe estar gated por x-show="song.featured" (D-01); sin featured no se renderiza (D-04)');
  });

  test('index.html: overline CONTINUAR/EMPEZAR hardcoded por rama de estado (D-03, T-02-01)', () => {
    const idx = indexSrc.indexOf("currentScreen === 'canciones'");
    const window = indexSrc.slice(idx, idx + 3500);
    assert.ok(window.includes('>CONTINUAR<'),
      'el overline debe llevar el literal CONTINUAR hardcoded (D-03)');
    assert.ok(window.includes('>EMPEZAR<'),
      'el overline debe llevar el literal EMPEZAR hardcoded (D-03)');
    assert.ok(/x-show="song\.status === 'fallada'"/.test(window),
      'CONTINUAR debe mostrarse cuando status === fallada (D-03)');
    assert.ok(/x-show="song\.status === 'no-hecha'"/.test(window),
      'EMPEZAR debe mostrarse cuando status === no-hecha (D-03)');
  });

  test('index.html: la tarjeta destacada reusa startSong(song.id) y x-text (T-02-01)', () => {
    const idx = indexSrc.indexOf('class="song-featured"');
    assert.ok(idx > -1, 'la tarjeta destacada debe existir');
    const window = indexSrc.slice(idx, idx + 1200);
    assert.ok(window.includes('startSong(song.id)'),
      'la tarjeta destacada debe reusar @click="startSong(song.id)" verbatim');
    assert.ok(window.includes('x-text="song.titleDisplay"'),
      'el título destacado debe renderizarse con x-text="song.titleDisplay"');
    assert.ok(window.includes('x-text="song.artist"'),
      'el artista destacado debe renderizarse con x-text="song.artist"');
  });

  test('index.html: la barra destacada NO lleva fracción numérica (D-02)', () => {
    const idx = indexSrc.indexOf('class="song-featured"');
    const window = indexSrc.slice(idx, idx + 1200);
    assert.ok(/song-featured-bar/.test(window),
      'debe existir la barra de estado .song-featured-bar');
    // No debe haber binding de fracción/porcentaje numérico en la barra (D-02).
    assert.ok(!/phraseCount|huecos|\/\s*\$\{|\bpct\b/.test(window),
      'la barra destacada NO debe mostrar fracción "9/14" ni N huecos (D-02, estado-only)');
  });

  test('index.html: NO se usa el atributo x-html= en el bloque canciones (T-02-01 anti-XSS)', () => {
    // Ventana acotada al template de canciones (hasta el banner del PICKER).
    const start = indexSrc.indexOf("currentScreen === 'canciones'");
    const pickerBanner = indexSrc.indexOf('Pantalla PICKER', start);
    const window = indexSrc.slice(start, pickerBanner > -1 ? pickerBanner : start + 3500);
    // El binding peligroso es el ATRIBUTO `x-html=`; las menciones en prosa de
    // comentarios ("nunca x-html") son documentación, no uso.
    assert.ok(!/x-html\s*=/.test(window),
      'el bloque canciones NO debe usar el atributo x-html= (T-02-01)');
  });

  test('app.css: .song-featured usa --ed-paper-elevated + --ed-radius-card (NO el verde del CTA)', () => {
    const idx = appCssSrc.indexOf('.song-featured {');
    assert.ok(idx > -1, 'debe existir la regla .song-featured');
    const window = appCssSrc.slice(idx, idx + 500);
    assert.ok(window.includes('var(--ed-paper-elevated)'),
      '.song-featured debe usar superficie --ed-paper-elevated (no el relleno verde del home-cta)');
    assert.ok(window.includes('var(--ed-radius-card)'),
      '.song-featured debe usar --ed-radius-card (radio 18)');
    assert.ok(window.includes('var(--ed-shadow-card)'),
      '.song-featured debe usar --ed-shadow-card');
  });

  test('app.css: la barra destacada clona la técnica currentColor de .streak-bar (D-02)', () => {
    const idx = appCssSrc.indexOf('.song-featured-bar-fill');
    assert.ok(idx > -1, 'debe existir .song-featured-bar-fill');
    const window = appCssSrc.slice(idx, idx + 300);
    assert.ok(window.includes('currentColor'),
      'el relleno de la barra debe usar currentColor (del badge-${status}, D-02)');
  });

  test('app.css: el bloque canciones cita SRP-01/D-01..D-04 y no introduce --pico-*', () => {
    const banner = appCssSrc.indexOf('Pantalla CANCIONES');
    assert.ok(banner > -1, 'debe existir el banner del bloque canciones (SRP-01)');
    const tail = appCssSrc.slice(banner);
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque canciones NO debe introducir referencias --pico-* reales (var() o definición)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-02, Task 2) — Filas Editoriale + tiles de portada (SRP-01)
//   · sección TODAS LAS CANCIONES; filas hairline x-for songsForDisplay
//   · tile de portada 46px (LOCKED D-16) repeating-linear-gradient + inicial serif
//   · status-dot REUSE VERBATIM con :class badge-${song.status} (D-07)
//   · título serif (titleDisplay) + meta cursiva (metaLabel) (D-05/D-06)
//   · fallada xN preservado; startSong(song.id) verbatim; x-text only (T-02-01)
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-02 — Task 2: filas Editoriale + tiles de portada (D-05/D-06/D-07)', () => {
  // Ventana acotada al template de canciones (hasta el banner del PICKER).
  function cancionesWindow() {
    const start = indexSrc.indexOf("currentScreen === 'canciones'");
    const pickerBanner = indexSrc.indexOf('Pantalla PICKER', start);
    return indexSrc.slice(start, pickerBanner > -1 ? pickerBanner : start + 4500);
  }

  test('index.html: sección TODAS LAS CANCIONES + filas x-for songsForDisplay', () => {
    const window = cancionesWindow();
    assert.ok(window.includes('TODAS LAS CANCIONES'),
      'debe existir el overline de sección TODAS LAS CANCIONES');
    assert.ok(/x-for="song in songsForDisplay"/.test(window),
      'la lista debe iterar x-for="song in songsForDisplay"');
    assert.ok(/class="song-row"/.test(window),
      'debe existir la fila Editoriale .song-row');
  });

  test('index.html: status-dot con :class badge-${song.status} REUSE VERBATIM (D-07)', () => {
    const window = cancionesWindow();
    assert.ok(/class="status-dot"\s+:class="`badge-\$\{song\.status\}`"/.test(window),
      'la fila debe reusar el status-dot con :class="`badge-${song.status}`" (D-07)');
    assert.ok(window.includes(':aria-label="song.statusLabel"'),
      'el status-dot debe llevar :aria-label="song.statusLabel"');
  });

  test('index.html: título serif (titleDisplay) + meta cursiva (metaLabel) vía x-text (D-05/D-06)', () => {
    const window = cancionesWindow();
    assert.ok(/cat-name[^"]*"\s+x-text="song\.titleDisplay"/.test(window),
      'el título de la fila debe usar .cat-name con x-text="song.titleDisplay"');
    assert.ok(/cat-topic[^"]*"\s+x-text="song\.metaLabel"/.test(window),
      'la meta de la fila debe usar .cat-topic con x-text="song.metaLabel" (D-05/D-06)');
  });

  test('index.html: la inicial del tile deriva de song.titleDisplay.charAt(0) vía x-text', () => {
    const window = cancionesWindow();
    assert.ok(/class="song-cover"[^>]*x-text="song\.titleDisplay\.charAt\(0\)"/.test(window),
      'el tile .song-cover debe pintar la inicial con x-text="song.titleDisplay.charAt(0)"');
  });

  test('index.html: la fila reusa startSong(song.id) y preserva "fallada xN"', () => {
    const window = cancionesWindow();
    assert.ok(/class="song-row"\s+@click="startSong\(song\.id\)"/.test(window),
      'la fila debe reusar @click="startSong(song.id)" verbatim');
    assert.ok(/x-show="song\.vecesFallada > 0"/.test(window),
      'la fila debe preservar el indicador con x-show="song.vecesFallada > 0"');
    assert.ok(/`fallada x\$\{song\.vecesFallada\}`/.test(window),
      'el indicador de canción debe renderizar "fallada xN" vía x-text');
  });

  test('app.css: .song-cover es 46px (LOCKED D-16) + radio 11 + repeating-linear-gradient', () => {
    const idx = appCssSrc.indexOf('.song-cover {');
    assert.ok(idx > -1, 'debe existir la regla .song-cover');
    const window = appCssSrc.slice(idx, idx + 600);
    assert.ok(/width:\s*46px/.test(window) && /height:\s*46px/.test(window),
      '.song-cover debe ser 46px (tile de lista LOCKED, D-16)');
    assert.ok(/border-radius:\s*11px/.test(window),
      '.song-cover debe usar radio literal 11 (handoff §4)');
    assert.ok(window.includes('repeating-linear-gradient'),
      '.song-cover debe rellenarse con repeating-linear-gradient (stripes)');
    assert.ok(window.includes('var(--ed-green-dark)'),
      '.song-cover debe usar --ed-green-dark como stripe por defecto');
    // Anotación de excepción LOCKED (handoff §4).
    assert.ok(/46px;\s*\/\* exception verbatim — handoff §4/.test(window),
      '46px debe llevar la anotación /* exception verbatim — handoff §4 */');
  });

  test('app.css: .song-row es hairline (border-bottom, sin fondo)', () => {
    const idx = appCssSrc.indexOf('.song-row {');
    assert.ok(idx > -1, 'debe existir la regla .song-row');
    const window = appCssSrc.slice(idx, idx + 400);
    assert.ok(window.includes('border-bottom'),
      '.song-row debe llevar un hairline border-bottom');
    assert.ok(window.includes('background: transparent'),
      '.song-row no debe tener fondo (fila hairline, no tarjeta)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-03, Task 1) — Picker: filas Editoriale + tick + contador
//   · filas hairline x-for content.categories; nombre serif (.cat-name, split
//     por paréntesis D-14/D-32-02) + sub-título cursiva (.cat-topic) del paréntesis
//   · check verde ✓ cuando pickerCheckedCategoryIds.includes(cat.id) (D-13)
//   · @change="pickerToggleCategory(cat.id)" + :checked VERBATIM (motor intacto)
//   · contador "{N} categorías seleccionadas" vía pickerSelectedCount (D-12),
//     NO pickerPoolSize (conteo de ejercicios vive en pickerStartLabel)
//   · pickerTimed / pickerSelectAll / pickerClearAll preservados; x-text only (T-02-01)
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-03 — Task 1: picker filas Editoriale + tick + contador (D-12/D-13/D-14)', () => {
  // Ventana acotada al template del picker (desde el banner PICKER hasta SESSION).
  function pickerWindow() {
    const start = indexSrc.indexOf('Pantalla PICKER');
    const sessionBanner = indexSrc.indexOf('Pantalla SESSION', start);
    return indexSrc.slice(start, sessionBanner > -1 ? sessionBanner : start + 4000);
  }

  test('index.html: filas x-for content.categories con nombre serif split por paréntesis (D-14)', () => {
    const window = pickerWindow();
    assert.ok(/x-for="cat in content\.categories"/.test(window),
      'el picker debe iterar x-for="cat in content.categories"');
    assert.ok(/class="picker-row"/.test(window),
      'debe existir la fila Editoriale .picker-row (fila completa clicable)');
    assert.ok(/cat-name[^"]*"\s+x-text="cat\.name\.split\('\('\)\[0\]\.trim\(\)"/.test(window),
      'el nombre debe usar .cat-name con x-text="cat.name.split(\'(\')[0].trim()" (D-14/D-32-02)');
    assert.ok(/cat-topic[^"]*"\s+x-show="cat\.name\.includes\('\('\)"/.test(window),
      'el sub-título .cat-topic debe mostrarse con x-show="cat.name.includes(\'(\')" (D-14)');
  });

  test('index.html: check verde ✓ gated por pickerCheckedCategoryIds.includes(cat.id) (D-13)', () => {
    const window = pickerWindow();
    assert.ok(/class="picker-row-tick"/.test(window),
      'debe existir el tick .picker-row-tick');
    assert.ok(/x-show="pickerCheckedCategoryIds\.includes\(cat\.id\)"[^>]*>✓</.test(window),
      'el ✓ debe mostrarse con x-show="pickerCheckedCategoryIds.includes(cat.id)" (D-13)');
  });

  test('index.html: @change="pickerToggleCategory(cat.id)" y :checked preservados VERBATIM', () => {
    const window = pickerWindow();
    assert.ok(window.includes('@change="pickerToggleCategory(cat.id)"'),
      'el checkbox debe conservar @change="pickerToggleCategory(cat.id)" verbatim (motor intacto)');
    assert.ok(window.includes(':checked="pickerCheckedCategoryIds.includes(cat.id)"'),
      'el checkbox debe conservar :checked="pickerCheckedCategoryIds.includes(cat.id)" verbatim');
  });

  test('index.html: contador usa pickerSelectedCount (D-12), NO pickerPoolSize', () => {
    const window = pickerWindow();
    assert.ok(/class="picker-count"/.test(window),
      'debe existir el contador .picker-count');
    assert.ok(window.includes('x-text="pickerSelectedCount"'),
      'el contador debe bindear x-text="pickerSelectedCount" (D-12)');
    assert.ok(window.includes('categorías seleccionadas'),
      'el contador debe llevar el literal "categorías seleccionadas" (plural)');
    assert.ok(window.includes('categoría seleccionada'),
      'el contador debe llevar el literal singular "categoría seleccionada"');
    // El contador NO duplica el conteo de EJERCICIOS (pickerPoolSize vive en
    // pickerStartLabel / aviso test-completo, D-12).
    const countIdx = window.indexOf('class="picker-count"');
    const countBlock = window.slice(countIdx, countIdx + 350);
    assert.ok(!/pickerPoolSize/.test(countBlock),
      'el contador NO debe usar pickerPoolSize (D-12: cuenta categorías, no ejercicios)');
  });

  test('index.html: pickerTimed / pickerSelectAll / pickerClearAll preservados', () => {
    const window = pickerWindow();
    assert.ok(window.includes('@click="pickerSelectAll"') && window.includes('@click="pickerClearAll"'),
      'las acciones masivas pickerSelectAll/pickerClearAll deben preservarse');
    assert.ok(window.includes('x-model="pickerTimed"'),
      'el toggle Contrarreloj x-model="pickerTimed" debe preservarse');
    assert.ok(window.includes('x-text="pickerHeaderLabel"'),
      'el header pickerHeaderLabel debe preservarse');
  });

  test('index.html: el picker NO usa el atributo x-html= (T-02-01 anti-XSS)', () => {
    const window = pickerWindow();
    assert.ok(!/x-html\s*=/.test(window),
      'el bloque picker NO debe usar el atributo x-html= (T-02-01)');
  });

  test('app.css: .picker-row es hairline (border-bottom) y el tick es verde (D-13)', () => {
    const idx = appCssSrc.indexOf('.picker-row {');
    assert.ok(idx > -1, 'debe existir la regla .picker-row');
    const rowWin = appCssSrc.slice(idx, idx + 400);
    assert.ok(rowWin.includes('border-bottom'),
      '.picker-row debe llevar un hairline border-bottom');
    const tickIdx = appCssSrc.indexOf('.picker-row-tick {');
    assert.ok(tickIdx > -1, 'debe existir la regla .picker-row-tick');
    const tickWin = appCssSrc.slice(tickIdx, tickIdx + 300);
    assert.ok(tickWin.includes('var(--ed-green)'),
      'el tick .picker-row-tick debe ser verde var(--ed-green) (D-13)');
  });

  test('app.css: el bloque picker cita SRP-04 + literal contador y no introduce --pico-*', () => {
    const banner = appCssSrc.indexOf('Pantalla PICKER de Repaso/Examen');
    assert.ok(banner > -1, 'debe existir el banner del bloque picker (SRP-04)');
    const tail = appCssSrc.slice(banner);
    assert.ok(tail.includes('SRP-04'),
      'el banner del bloque picker debe citar SRP-04');
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque picker NO debe introducir referencias --pico-* reales');
    assert.ok(!/prefers-color-scheme/.test(appCssSrc),
      'app.css NO debe añadir reglas prefers-color-scheme (dark-mode off, D-32-03)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-03, Task 2) — Picker: CTA Empezar repintada a .session-cta
//   · botón Empezar lleva class="session-cta" (verde + sombra + disabled reusados)
//   · @click="startSession" / :disabled="pickerPoolSize === 0" / x-text="pickerStartLabel" VERBATIM
//   · aviso test-completo (.picker-warning) intacto; sin x-html
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-03 — Task 2: CTA Empezar = .session-cta (SRP-04)', () => {
  function pickerWindow() {
    const start = indexSrc.indexOf('Pantalla PICKER');
    const sessionBanner = indexSrc.indexOf('Pantalla SESSION', start);
    return indexSrc.slice(start, sessionBanner > -1 ? sessionBanner : start + 4000);
  }

  test('index.html: Empezar lleva class="session-cta" y conserva startSession/pickerStartLabel/:disabled', () => {
    const window = pickerWindow();
    // El botón con x-text="pickerStartLabel" es el Empezar; debe llevar session-cta.
    const ctaIdx = window.indexOf('x-text="pickerStartLabel"');
    assert.ok(ctaIdx > -1, 'debe existir el botón Empezar (x-text="pickerStartLabel")');
    // El <button> que abre justo antes del binding pickerStartLabel.
    const btnStart = window.lastIndexOf('<button', ctaIdx);
    const btnBlock = window.slice(btnStart, ctaIdx + 30);
    assert.ok(/class="session-cta(\s|")/.test(btnBlock) || /class="session-cta /.test(btnBlock),
      'el botón Empezar debe llevar la clase session-cta');
    assert.ok(btnBlock.includes('@click="startSession"'),
      'Empezar debe conservar @click="startSession" verbatim');
    assert.ok(btnBlock.includes(':disabled="pickerPoolSize === 0"'),
      'Empezar debe conservar :disabled="pickerPoolSize === 0" verbatim');
  });

  test('index.html: el aviso test-completo (.picker-warning) sigue intacto', () => {
    const window = pickerWindow();
    assert.ok(/class="picker-warning"/.test(window),
      'el aviso .picker-warning debe seguir presente');
    assert.ok(/x-show="pickerMode === 'test-completo' && pickerPoolSize > 0"/.test(window),
      'el aviso debe conservar su x-show sobre pickerMode/pickerPoolSize verbatim');
  });

  test('app.css: .session-cta NO se redefine en el bloque picker (solo .picker-cta de layout)', () => {
    const banner = appCssSrc.indexOf('Pantalla PICKER de Repaso/Examen');
    const tail = appCssSrc.slice(banner);
    assert.ok(!/\.session-cta\s*\{/.test(tail),
      'el bloque picker NO debe redefinir .session-cta (se reusa la regla existente)');
    assert.ok(/\.picker-cta\s*\{/.test(tail),
      'el bloque picker debe definir .picker-cta (layout/espaciado de contexto)');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-04, Task 1) — Pantalla CANCION: barra superior Editoriale
//   · REEMPLAZA el <header> pelado por el scaffold .session-topbar heredado:
//     atrás circular ‹ (.session-back, aria-label="Volver", reusa
//     returnToSongList) + barra verde .session-progress(-fill) + contador
//     .session-counter (songProgressLabel "Frase X/N") (D-08)
//   · SIN .session-timer* — las canciones NUNCA usan Contrarreloj (D-08)
//   · la frase usa .session-prompt; el botón inferior "← Volver" se elimina
//     (afordancia única en el atrás circular)
//   · word-buttons + songCheck/songAdvance + handleSongKey INTACTOS; x-text only
// ─────────────────────────────────────────────────────────────────────────────
describe('Phase 34-04 — Task 1: barra superior Editoriale de la pantalla cancion (D-08)', () => {
  // Ventana acotada al template de canción (desde su guard hasta el banner SUMMARY).
  function cancionWindow() {
    const start = indexSrc.indexOf("currentScreen === 'cancion' && songCurrentPhrase");
    const summaryBanner = indexSrc.indexOf('Pantalla SUMMARY', start);
    return indexSrc.slice(start, summaryBanner > -1 ? summaryBanner : start + 4000);
  }

  test('index.html: el <header> pelado se reemplaza por el scaffold .session-topbar', () => {
    const window = cancionWindow();
    assert.ok(/class="session-topbar"/.test(window),
      'la pantalla cancion debe llevar el scaffold .session-topbar (D-08)');
    // El antiguo <header x-text="songProgressLabel"> ya no debe existir en el bloque.
    assert.ok(!/<header[^>]*x-text="songProgressLabel"/.test(window),
      'el <header> pelado con x-text="songProgressLabel" debe eliminarse (reemplazado por la barra)');
  });

  test('index.html: el atrás circular ‹ reusa returnToSongList y lleva aria-label="Volver"', () => {
    const window = cancionWindow();
    const backIdx = window.indexOf('class="session-back"');
    assert.ok(backIdx > -1, 'debe existir el botón .session-back');
    const backBlock = window.slice(backIdx, backIdx + 200);
    assert.ok(backBlock.includes('aria-label="Volver"'),
      '.session-back debe llevar aria-label="Volver" (convención heredada Phase 33)');
    assert.ok(backBlock.includes('@click="returnToSongList"'),
      '.session-back debe reusar @click="returnToSongList" VERBATIM (acción del antiguo botón inferior)');
    assert.ok(/>‹<\/button>/.test(backBlock),
      '.session-back debe llevar el glyph ‹ hardcoded (T-02-01)');
  });

  test('index.html: la barra de progreso deriva el ancho del cursor (espeja sessionProgressPercent, no campo de motor)', () => {
    const window = cancionWindow();
    assert.ok(/class="session-progress"/.test(window) && /class="session-progress-fill"/.test(window),
      'debe existir la barra .session-progress + .session-progress-fill');
    const fillIdx = window.indexOf('class="session-progress-fill"');
    const fillBlock = window.slice(fillIdx, fillIdx + 300);
    assert.ok(fillBlock.includes('sessionCursor') && fillBlock.includes('sessionExerciseIds.length'),
      'el ancho debe derivar de (sessionCursor + 1) / sessionExerciseIds.length (espejo de sessionProgressPercent, presentacional)');
    assert.ok(/:style=/.test(fillBlock),
      'el ancho debe fijarse vía :style (presentacional, sin campo de motor nuevo)');
  });

  test('index.html: el contador .session-counter bindea songProgressLabel ("Frase X/N")', () => {
    const window = cancionWindow();
    assert.ok(/class="session-counter"\s+x-text="songProgressLabel"/.test(window),
      'el contador debe ser .session-counter con x-text="songProgressLabel" (Frase X/N, D-08)');
  });

  test('index.html: NO se añade ningún chip de cronómetro .session-timer en la pantalla cancion (D-08)', () => {
    const window = cancionWindow();
    assert.ok(!/session-timer/.test(window),
      'la pantalla cancion NO debe contener ningún token session-timer — los songs nunca usan Contrarreloj (D-08)');
  });

  test('index.html: la frase de la letra usa .session-prompt (x-text — T-02-01)', () => {
    const window = cancionWindow();
    assert.ok(/class="session-prompt"\s+x-text="songCurrentPhrase\.payload\.prompt"/.test(window),
      'la frase italiana debe llevar .session-prompt con x-text="songCurrentPhrase.payload.prompt"');
  });

  test('index.html: el botón inferior "← Volver a Canciones" se elimina (afordancia única en el atrás)', () => {
    const window = cancionWindow();
    assert.ok(!/Volver a Canciones/.test(window),
      'el botón inferior "← Volver a Canciones" debe eliminarse (la acción vive en el atrás circular)');
    // El binding de acción @click="returnToSongList" aparece EXACTAMENTE una vez
    // (en el atrás circular) — la acción no se duplica entre barra y pie.
    const clickBindings = window.match(/@click="returnToSongList"/g) || [];
    assert.equal(clickBindings.length, 1,
      '@click="returnToSongList" debe aparecer exactamente una vez en el bloque cancion (atrás circular, sin duplicar)');
  });

  test('index.html: word-buttons + songCheck/songAdvance + handleSongKey INTACTOS; sin x-html', () => {
    const window = cancionWindow();
    assert.ok(window.includes('@keydown.window="handleSongKey($event)"'),
      'el @keydown.window="handleSongKey($event)" debe preservarse (D-72)');
    assert.ok(window.includes('@click="songCheck"') && window.includes('@click="songAdvance"'),
      'los bindings songCheck (Comprobar) y songAdvance (Siguiente) deben preservarse');
    assert.ok(/class="wb-bank"/.test(window) && /class="wb-answer"/.test(window),
      'los word-buttons (.wb-bank / .wb-answer) deben preservarse');
    assert.ok(!/x-html\s*=/.test(window),
      'la pantalla cancion NO debe usar el atributo x-html= (T-02-01 anti-XSS)');
  });

  test('app.css: el bloque cancion cita SRP-02/D-08, NO redefine .session-topbar/.session-back y no introduce --pico-*', () => {
    const banner = appCssSrc.indexOf('Pantalla CANCION · reproducción');
    assert.ok(banner > -1, 'debe existir el banner del bloque cancion (SRP-02/D-08)');
    const tail = appCssSrc.slice(banner);
    assert.ok(tail.includes('SRP-02') && tail.includes('D-08'),
      'el banner del bloque cancion debe citar SRP-02 y D-08');
    // No redefine las clases base heredadas de Phase 33.
    assert.ok(!/\.session-back\s*\{/.test(tail),
      'el bloque cancion NO debe redefinir .session-back (se reusa la regla de Phase 33)');
    assert.ok(!/\.session-topbar\s*\{/.test(tail),
      'el bloque cancion NO debe redefinir .session-topbar (se reusa la regla de Phase 33)');
    // No introduce timer ni --pico-* ni dark-mode.
    assert.ok(!/\.session-timer/.test(tail),
      'el bloque cancion NO debe definir reglas .session-timer (D-08)');
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque cancion NO debe introducir referencias --pico-* reales');
    assert.ok(!/prefers-color-scheme/.test(appCssSrc),
      'app.css NO debe añadir reglas prefers-color-scheme (dark-mode off, D-32-03)');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-05, Task 1) — Pantalla SUMMARY: anillo de score + X/Y hero
//   · D-09: el anillo aparece en TODAS las sesiones (sin rama por sessionMode)
//   · D-10: Y = summaryScore.total (respondidas, snapshot)
//   · D-11: <header> reusa summaryHeaderLabel VERBATIM, repintado serif
// ───────────────────────────────────────────────────────────────────────────
describe('Phase 34-05 — Task 1: anillo de score + X/Y hero en summary (D-09/D-10/D-11)', () => {
  // Ventana acotada al template summary (desde su guard hasta el banner CANCION-SUMMARY).
  function summaryWindow() {
    const start = indexSrc.indexOf("currentScreen === 'summary' && summaryDelta");
    const nextBanner = indexSrc.indexOf('Pantalla CANCION-SUMMARY', start);
    return indexSrc.slice(start, nextBanner > -1 ? nextBanner : start + 6000);
  }

  test('index.html: el hero bindea summaryScore (pct/correct/total) vía x-text', () => {
    const window = summaryWindow();
    assert.ok(/class="summary-score-hero"/.test(window),
      'debe existir el bloque .summary-score-hero');
    assert.ok(/x-text="summaryScore\.pct"/.test(window),
      'el % del anillo debe bindear x-text="summaryScore.pct"');
    assert.ok(/x-text="summaryScore\.correct"/.test(window),
      'el X debe bindear x-text="summaryScore.correct"');
    assert.ok(/x-text="summaryScore\.total"/.test(window),
      'el Y debe bindear x-text="summaryScore.total" (D-10, respondidas)');
  });

  test('index.html: el anillo fija --pct inline desde summaryScore.pct (sin campo de motor)', () => {
    const window = summaryWindow();
    const ringIdx = window.indexOf('class="summary-score-ring"');
    assert.ok(ringIdx > -1, 'debe existir el anillo .summary-score-ring');
    const ringBlock = window.slice(ringIdx, ringIdx + 200);
    assert.ok(/:style="`--pct:\$\{summaryScore\.pct\}`"/.test(ringBlock),
      'el anillo debe fijar la custom property --pct inline desde summaryScore.pct');
  });

  test('index.html: el anillo NO se bifurca por sessionMode (D-09) y NO usa x-html', () => {
    const window = summaryWindow();
    const heroIdx = window.indexOf('class="summary-score-hero"');
    // No hay x-if/x-show sobre sessionMode en el hero (aparece en todas las sesiones).
    assert.ok(!/sessionMode/.test(window),
      'el template summary NO debe bifurcar el hero por sessionMode (D-09)');
    assert.ok(!/x-html\s*=/.test(window),
      'el template summary NO debe usar x-html (T-02-01 anti-XSS)');
    assert.ok(heroIdx > -1, 'el hero debe renderizarse incondicionalmente (D-09)');
  });

  test('index.html: "correctos" + "Sesión terminada" son literales hardcoded', () => {
    const window = summaryWindow();
    assert.ok(/>correctos</.test(window),
      'el literal "correctos" debe estar hardcoded (T-02-01)');
    assert.ok(/>Sesión terminada</.test(window),
      'el literal "Sesión terminada" debe estar hardcoded (T-02-01)');
  });

  test('index.html: el <header> conserva summaryHeaderLabel VERBATIM repintado serif (D-11)', () => {
    const window = summaryWindow();
    assert.ok(/class="summary-title"\s+x-text="summaryHeaderLabel"/.test(window),
      'el título debe reusar x-text="summaryHeaderLabel" con la clase serif .summary-title (D-11)');
  });

  test('app.css: el bloque summary cita SRP-03/D-09/D-10, usa conic-gradient + --ed-ring-track, sin --pico-*', () => {
    const banner = appCssSrc.indexOf('Pantalla SUMMARY · hero de score');
    assert.ok(banner > -1, 'debe existir el banner del bloque summary hero (SRP-03)');
    // El tail arranca en la línea del banner (que YA lleva las citas SRP-03/D-09/D-10/D-11).
    const tail = appCssSrc.slice(appCssSrc.lastIndexOf('Phase 34 (SRP-03', banner));
    assert.ok(tail.includes('SRP-03') && tail.includes('D-09') && tail.includes('D-10'),
      'el banner debe citar SRP-03/D-09/D-10');
    assert.ok(/conic-gradient\(/.test(tail),
      'el anillo debe usar conic-gradient (técnica net-new)');
    assert.ok(/var\(--ed-green\)\s+calc\(var\(--pct[^)]*\)\s*\*\s*3\.6deg\)/.test(tail),
      'el arco verde debe derivar del ángulo calc(--pct * 3.6deg)');
    assert.ok(/var\(--ed-ring-track\)/.test(tail),
      'la pista vacía del anillo debe usar var(--ed-ring-track) (#e6ddcd, handoff §5)');
    assert.ok(/72px/.test(tail) && /exception verbatim — handoff §5/.test(tail),
      'el anillo 72px debe anotarse como exception verbatim — handoff §5');
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque summary NO debe introducir referencias --pico-* reales');
  });

  test('app.css: el título de Resultados se repinta serif (.summary-title 24/600)', () => {
    const idx = appCssSrc.indexOf('.summary-title {');
    assert.ok(idx > -1, 'debe existir .summary-title');
    const window = appCssSrc.slice(idx, idx + 240);
    assert.ok(/var\(--ed-font-serif\)/.test(window) && /font-size:\s*24px/.test(window) && /font-weight:\s*600/.test(window),
      '.summary-title debe ser serif 24/600 (espejo de .home-title escalado, D-11)');
  });
});

// ───────────────────────────────────────────────────────────────────────────
// Phase 34 (Plan 34-05, Task 2) — SUMMARY: cascada FALLÓ + Errores cometidos
//   · D-11: FALLÓ ↔ entry.failed; summaryDelta/summaryVariantSurface VERBATIM
//   · legacy --pico-* (.delta-*/.user-answer) sobrescrito por orden de fuente
// ───────────────────────────────────────────────────────────────────────────
describe('Phase 34-05 — Task 2: cascada FALLÓ + errores Editoriale (D-11/D-46)', () => {
  function summaryWindow() {
    const start = indexSrc.indexOf("currentScreen === 'summary' && summaryDelta");
    const nextBanner = indexSrc.indexOf('Pantalla CANCION-SUMMARY', start);
    return indexSrc.slice(start, nextBanner > -1 ? nextBanner : start + 6000);
  }

  test('index.html: overline CATEGORÍAS AFECTADAS + píldora FALLÓ gated por entry.failed', () => {
    const window = summaryWindow();
    assert.ok(/>CATEGORÍAS AFECTADAS</.test(window),
      'la cascada debe llevar el overline literal "CATEGORÍAS AFECTADAS" (T-02-01)');
    const pillIdx = window.indexOf('summary-fallo-pill');
    assert.ok(pillIdx > -1, 'debe existir la píldora .summary-fallo-pill');
    const pillBlock = window.slice(window.lastIndexOf('<span', pillIdx) - 60, pillIdx + 80);
    assert.ok(/x-show="entry\.failed"/.test(pillBlock),
      'la píldora FALLÓ debe estar gated por x-show="entry.failed" (D-11)');
    assert.ok(/>FALLÓ</.test(window),
      'el literal "FALLÓ" debe estar hardcoded (T-02-01)');
  });

  test('index.html: la columna FALLÓ es fija (.summary-delta-flag); cuerpo en .summary-delta-body', () => {
    const window = summaryWindow();
    assert.ok(/class="summary-delta-flag"/.test(window) && /class="summary-delta-body"/.test(window),
      'la cascada debe partir cuerpo (.summary-delta-body) + columna (.summary-delta-flag, 54px LOCKED)');
  });

  test('index.html: los bindings de summaryDelta se preservan VERBATIM (cero lógica)', () => {
    const window = summaryWindow();
    assert.ok(/x-for="entry in summaryDelta"/.test(window),
      'el x-for sobre summaryDelta debe preservarse');
    assert.ok(/:class="\{ 'delta-regression': entry\.isRegression, 'delta-promotion': entry\.isPromotion \}"/.test(window),
      '.delta-arrow debe conservar el binding regression/promotion VERBATIM');
    assert.ok(/x-text="entry\.statusBefore"/.test(window) && /x-text="entry\.statusAfter"/.test(window),
      'statusBefore/statusAfter deben preservarse');
    assert.ok(/x-text="' · racha ' \+ entry\.streakBefore/.test(window),
      'el sub-span de racha debe preservarse VERBATIM');
  });

  test('index.html: overline ERRORES COMETIDOS · N (N vía x-text del filter); sub-templates intactos', () => {
    const window = summaryWindow();
    assert.ok(/ERRORES COMETIDOS ·/.test(window),
      'la sección de errores debe llevar el overline "ERRORES COMETIDOS ·" (T-02-01)');
    // N derivado del mismo filter que el x-for (presentacional, no campo nuevo).
    assert.ok(/x-text="summarySessionResults\.filter\(r => !r\.correct && content\.slotById\[r\.exerciseId\]\)\.length"/.test(window),
      'N debe derivarse del filter de errores con slot (mismo guard que el x-for)');
    // Los tres sub-templates de summaryVariantSurface se preservan.
    assert.ok(/summaryVariantSurface\(result\)\.type === 'multiple-choice'/.test(window) &&
              /summaryVariantSurface\(result\)\.type === 'word-buttons'/.test(window) &&
              /summaryVariantSurface\(result\)\.type === 'match'/.test(window),
      'los tres sub-templates de summaryVariantSurface deben preservarse (repaint only)');
    assert.ok(/class="user-answer"/.test(window) && /class="summary-error-explanation"/.test(window),
      'las clases .user-answer y .summary-error-explanation se conservan (repaint vía CSS)');
  });

  test('index.html: el bloque summary completo NO usa x-html (T-02-01)', () => {
    const window = summaryWindow();
    assert.ok(!/x-html\s*=/.test(window),
      'el template summary NO debe usar x-html');
  });

  test('app.css: .delta-regression/.delta-promotion se re-declaran con --ed-red/--ed-green (override pico)', () => {
    assert.ok(/\.summary-delta \.delta-regression\s*\{\s*color:\s*var\(--ed-red\)/.test(appCssSrc),
      '.delta-regression debe re-declararse con var(--ed-red) en app.css (override del --pico legacy)');
    assert.ok(/\.summary-delta \.delta-promotion\s*\{\s*color:\s*var\(--ed-green\)/.test(appCssSrc),
      '.delta-promotion debe re-declararse con var(--ed-green) en app.css (override del --pico legacy)');
    // El legacy --pico- de styles.css NO se borra (override por orden de fuente).
    assert.ok(/\.delta-regression\s*\{\s*color:\s*var\(--pico-color-red-500/.test(stylesCssSrc),
      'la regla legacy --pico- de .delta-regression debe seguir en styles.css (no se borra)');
  });

  test('app.css: .user-answer repintada (line-through + --ed-red-text); FALLÓ pill de --ed-red-tint', () => {
    const uaIdx = appCssSrc.indexOf('.summary-errors .user-answer {');
    assert.ok(uaIdx > -1, 'debe existir el override de .summary-errors .user-answer');
    const ua = appCssSrc.slice(uaIdx, uaIdx + 200);
    assert.ok(/text-decoration:\s*line-through/.test(ua) && /color:\s*var\(--ed-red-text\)/.test(ua),
      '.user-answer debe ser --ed-red-text + line-through (struck "Tu")');
    const pillIdx = appCssSrc.indexOf('.summary-fallo-pill {');
    assert.ok(pillIdx > -1, 'debe existir .summary-fallo-pill');
    const pill = appCssSrc.slice(pillIdx, pillIdx + 400);
    assert.ok(/var\(--ed-red-tint\)/.test(pill) && /var\(--ed-red-text\)/.test(pill) && /font-size:\s*10px/.test(pill),
      '.summary-fallo-pill debe ser --ed-red-tint/--ed-red-text Hanken 10/700');
  });

  test('app.css: el bloque cascada/errores cita SRP-03/D-11, anota 54px verbatim, sin nuevos --pico-*', () => {
    const banner = appCssSrc.indexOf('cascada FALLÓ + Errores cometidos');
    assert.ok(banner > -1, 'debe existir el banner del bloque cascada/errores');
    const tail = appCssSrc.slice(appCssSrc.lastIndexOf('Phase 34 (SRP-03', banner));
    assert.ok(tail.includes('SRP-03') && tail.includes('D-11'),
      'el banner debe citar SRP-03 y D-11');
    assert.ok(/54px/.test(tail) && /exception verbatim — handoff §5/.test(tail),
      'la columna 54px debe anotarse como exception verbatim — handoff §5');
    assert.ok(!/var\(\s*--pico-|--pico-[\w-]+\s*:/.test(tail),
      'el bloque cascada/errores NO debe introducir referencias --pico-* nuevas');
  });
});
