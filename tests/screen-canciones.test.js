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

  test('index.html: indicador "fallada xN" en categorías y canciones con x-show N>0', () => {
    // Categoría: el indicador usa cat.vecesFallada con x-show > 0.
    assert.ok(/x-show="cat\.vecesFallada > 0"/.test(indexSrc),
      'la fila de categoría debe mostrar el indicador solo si vecesFallada > 0');
    assert.ok(/`fallada x\$\{cat\.vecesFallada\}`/.test(indexSrc),
      'el indicador de categoría debe renderizar "fallada xN" vía x-text');
    // Canción: idem con song.vecesFallada.
    assert.ok(/x-show="song\.vecesFallada > 0"/.test(indexSrc),
      'la fila de canción debe mostrar el indicador solo si vecesFallada > 0');
    assert.ok(/`fallada x\$\{song\.vecesFallada\}`/.test(indexSrc),
      'el indicador de canción debe renderizar "fallada xN" vía x-text');
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
