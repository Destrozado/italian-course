---
phase: 13-bloque-canciones-modelo-de-datos-playthrough-end-to-end
plan: 02
subsystem: ui-playthrough
tags: [songs, playthrough, word-buttons, cascade-d54, standalone, screen, summary, brownfield]
requires:
  - "Plan 13-01: loadSongs → { songs, songsById }, state.songProgress {status,lastPlayedAt}, schemaVersion 5"
  - "engine v1.0: applyResultToSession (single cascade call-site), applyImmediateFailure (D-54), wordButtons.grade(), currentScreen switch (D-24), summary-errors/summaryDelta concept"
provides:
  - "Botón protagonista Canciones + pantalla listado currentScreen='canciones' (SONG-01/02/03/04)"
  - "Playthrough secuencial it->es currentScreen='cancion' (startSong/songCheck/songAdvance/handleSongKey, PLAY-01/02/03/05, LINK-02/04)"
  - "Resumen post-canción currentScreen='cancion-summary' (Block A errores + Block B impacto categorías, PLAY-04, D-04)"
  - "songProgress write-once-at-end (completeSong, D-02) + returnToSongList"
affects:
  - "src/main.js (boot: loadSongs tras loadContent, songsById en handoff de content)"
tech-stack:
  added: []
  patterns:
    - "screen dedicado por estado (canciones/cancion/cancion-summary) con templates x-if mutuamente excluyentes (D-24)"
    - "mapa dedicado songPhraseById para resolver la frase activa (NO sessionCurrentExercise/exerciseById — LINK-04)"
    - "reuso de applyResultToSession como ÚNICO punto de cascada D-54; dispatch del auto-avance por sessionMode='cancion' (Pitfall #2)"
    - "snapshot before AL INICIO (cascada incremental) vs al final como completeSession"
    - "double-defense Alpine (getter null-safe + outer x-if guard) en songsForDisplay/songCurrentPhrase/songSummaryDelta"
key-files:
  created:
    - tests/screen-canciones.test.js
  modified:
    - src/main.js
    - src/screens/app.js
    - index.html
decisions:
  - "Screens DEDICADAS 'cancion'/'cancion-summary' (no reuso de 'session'/'summary') — evita volver song-aware a sessionCurrentExercise; templates x-if mutuamente excluyentes (D-24)"
  - "sessionMode='cancion' reutiliza el sub-estado session* (cursor/results/feedback/wordButtons*) pero resuelve la frase contra songPhraseById; el branch inFlightTest de applyResultToSession ('test-completo') se omite naturalmente (PLAY-05)"
  - "Frases normalizadas a objeto graduable word-buttons en startSong (las frases del JSON no llevan type)"
  - "Listado muestra status como texto (badge color via clase + texto) — glyph no aplica al modelo no-hecha/pasada/fallada de canción"
metrics:
  duration: ~12 min
  completed: 2026-06-02
  tasks: 3
  tests_total: 306
---

# Phase 13 Plan 02: Bloque Canciones — playthrough end-to-end Summary

Slice VERTICAL jugable del bloque Canciones reutilizando el engine: botón protagonista en el home, pantalla de listado con estado por canción, playthrough secuencial it->es con feedback y cascada D-54 inmediata (un solo call-site), y resumen post-canción (frases falladas + impacto factual en categorías). Brownfield puro — cada pieza copia un analog de `app.js`/`index.html`.

## What Was Built

**Task 1 — Boot wiring + botón Canciones + pantalla listado (`1b80210`)**
- `src/main.js`: tras `loadContent`, fetch del índice `content/songs.json` → `loadSongs(songIds, knownCategoryIds)` → `content.songsById` adjuntado como campo HERMANO de `exerciseById` (NUNCA mezclado — LINK-04). Errores de canción fluyen al mismo `catch` → banner (DATA-02). `applyNewExerciseRegression` no corre sobre canciones.
- `src/screens/app.js`: getter `songsForDisplay` (espejo de `categoriesForDisplay`, double-defense `if (!this.content)`), mapea `songsById` + `state.songProgress` a filas `{id, title, phraseCount, status, statusLabel}` (default `'no-hecha'`). Helper `songStatusLabelFor`. Sub-estado `songActiveId`/`songPhraseById`/`songBefore`. Comentario de `currentScreen` ampliado con `canciones`/`cancion`/`cancion-summary`.
- `index.html`: 4º botón PROTAGONISTA `Canciones` (sin `class="secondary"` — D-01) en la fila prominente; template `currentScreen === 'canciones'` con tabla `x-for songsForDisplay` (badge+texto de estado, `phraseCount`, botón "Jugar" 1-clic `startSong(song.id)`, "Volver al home").

**Task 2 — Playthrough secuencial + cascada D-54 (`10fe9c8`)**
- `startSong(songId)`: recorre `songsById[songId].phrases` EN ORDEN DECLARADO (PLAY-01 — sin `buildFullTest`/`buildSession`/`fisherYates` sobre el orden); normaliza cada frase a `{id, type:'word-buttons', payload:{prompt, answer, distractors}, categoryIds}`; puebla el mapa DEDICADO `songPhraseById` (LINK-04); `sessionMode='cancion'`; captura `songBefore` (deep-clone de categoryProgress AL INICIO — cascada incremental); `initSubStateForExercise` de la primera frase (banco con `fisherYates` permitido, D-05); NO `persistInFlightTest` (PLAY-05); transición a `currentScreen='cancion'`.
- `songCheck`/`songAdvance`/`handleSongKey`: analogs de `wordButtonsCheck`/`sessionAdvance`/`handleSessionKey` resolviendo contra `songCurrentPhrase`. `songCheck` delega en `applyResultToSession` (ÚNICO call-site de cascada, Pitfall #2). `applyResultToSession` dispatcha el auto-avance 600ms por `sessionMode==='cancion'` → `songAdvance` (PLAY-03); en fallo, `applyImmediateFailure` + saveState SÍNCRONO (LINK-02; categoryIds vacío = no-op, LINK-03) e inFlightTest omitido (PLAY-05).
- Getters `songCurrentPhrase` (lookup contra `songPhraseById`) y `songProgressLabel`.
- `index.html`: template `currentScreen === 'cancion' && songCurrentPhrase` (word-buttons it->es, `x-text` para prompt italiano — T-02-01, `@keydown.window="handleSongKey($event)"` — D-72, "Volver a Canciones" que descarta lo no comprometido — PLAY-05).

**Task 3 — Resumen post-canción + write-once status (`db69f8e`)**
- `completeSong` (añadido en Task 2, render en Task 3): status `fallada` si ≥1 fallo si no `pasada`; escribe `state.songProgress[songId] = {status, lastPlayedAt}` write-once-at-end (D-02) + `saveState`; NO llama `applySessionResult` (standalone); computa `failedCategoryIds` (resuelto contra `songPhraseById`) y, usando `songBefore` vs `categoryProgress` actual, lista solo las categorías que regresaron (hecha/dominada → no-hecha) en `songSummaryDelta`; snapshot `summarySessionResults` (CR-02); transición a `cancion-summary`.
- `returnToSongList`: limpia sub-estado canción+summary, `resetSession`, vuelve a `currentScreen='canciones'` (el listado refleja el nuevo estado — SONG-02/04).
- `index.html`: template `currentScreen === 'cancion-summary' && songSummaryDelta` — Block A frases falladas (lookup `songPhraseById`, incluye frases sin categoría — D-04) + Block B "Categorías que bajaron de estado" (factual `antes → después`, `delta-regression`, sin gamificación). Todo con `x-text` (T-02-01).

## Verification Results

- `node --test tests/*.test.js`: **306 pass / 0 fail** (era 287 tras 13-01; +19 en `tests/screen-canciones.test.js`).
- `node --check src/screens/app.js && node --check src/main.js`: sintaxis OK.
- Acceptance criteria por task verificados (grep counts): `currentScreen = 'canciones'`×1 (botón sin `secondary`), `currentScreen === 'canciones'`×1, `songsForDisplay`×1 con guarda `if (!this.content)`, `loadSongs` en main.js×3 (import+fetch index+call), `startSong(song.id)`×1, `startSong(songId)`×1, `songProgress[`×3, `returnToSongList`×2.
- Invariantes clave verificados por test: `startSong` sin `buildFullTest`/`buildSession`/`persistInFlightTest`; `applyImmediateFailure` se mantiene en sus 2 call-sites preexistentes (`applyResultToSession` + `matchPickRight`) — el path de canción NO añade un tercero; `completeSong` sin `applySessionResult`; resumen y playthrough sin `x-html`.
- Manual (UAT post-merge, coherente con Phase 3+ para lógica mid-sesión no instanciable bajo node sin Alpine): abrir Canciones, jugar la mini-canción, fallar una frase enganchada y comprobar el resumen + reset de categoría al volver.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test correctness] El invariante "single call-site" de `applyImmediateFailure` son 2 invocaciones preexistentes, no 1**
- **Found during:** Task 2 (test del Pitfall #2).
- **Issue:** El plan describe `applyImmediateFailure` como "único call-site" (D-54). El test inicial asertaba exactamente 1 invocación de código, pero el codebase ya tenía 2 desde Phase 3: `applyResultToSession` (path unificado word-buttons/multi-choice + completado match) y `matchPickRight` (cascada per-pareja del match, D-61). Ambas son `= applyImmediateFailure(...)`.
- **Fix:** El test asierta que el total se MANTIENE en 2 (baseline pre-Phase-13 verificado con `git show HEAD:src/screens/app.js`) y que el cuerpo de `startSong` no invoca `applyImmediateFailure` directamente. El espíritu del invariante (Pitfall #2: el path de canción REUSA el call-site, no añade otro) se respeta — la canción enruta su cascada por `applyResultToSession`, añadiendo 0 call-sites nuevos.
- **Files modified:** `tests/screen-canciones.test.js`.
- **Commit:** `10fe9c8`.

### Claude's Discretion ejercida (según `<decisions>` del CONTEXT)

- **Reuso de pantalla:** pantallas DEDICADAS `'cancion'`/`'cancion-summary'` (no reuso de `'session'`/`'summary'`). Razón: `sessionCurrentExercise` resuelve contra `content.exerciseById` donde las frases de canción NO existen (LINK-04). Pantallas dedicadas + getter `songCurrentPhrase` evitan volver song-aware a un getter central del engine. Templates x-if mutuamente excluyentes (D-24) y `@keydown.window` con auto-unmount (D-72) preservados.
- **Tipo de ejercicio:** las frases usan `word-buttons` tal cual (normalizadas en `startSong`), sin registrar un tipo nuevo. `wordButtons.grade()` se reutiliza verbatim.
- **Listado:** status renderizado como texto (`statusLabel`) junto al badge de color por clase — el glyph del badge de categorías (✓/★/●) no aplica al modelo `no-hecha/pasada/fallada` de canción.

Sin desviaciones arquitectónicas (Rule 4). Sin auth gates. Sin stubs (todos los datos están cableados: songsById desde loadSongs, songProgress persistido, resumen computado).

## Threat Surface

Sin superficie de amenaza nueva fuera del `<threat_model>` del plan.
- **T-13-04** (XSS render de prompt/answer/title): mitigado — TODO el contenido de canción se renderiza con `x-text` (listado, playthrough, resumen). Verificado por grep: 0 `x-html` reales (las 2 coincidencias son comentarios "NUNCA x-html").
- **T-13-05** (fallo + abandono): mitigado — `applyImmediateFailure` + `saveState` síncrono en el instante de fallar (vía `applyResultToSession`, heredado); abandonar después no revierte el fallo persistido. `returnToSongList`/cambio de pantalla descarta solo lo no comprometido (PLAY-05).
- **T-13-06** (songProgress editado a mano): accept — app local single-user; `hydrateV5` (13-01) deep-clona defensivamente.

## Notes for Next Plan (Phase 14)

- El slice end-to-end está cerrado: `loadSongs` → listado → `startSong` → playthrough → `completeSong` → resumen → listado actualizado. Phase 14 solo añade CONTENIDO (`content/songs/equilibrio-mentale.json` + entrada en `songs.json`) sobre la maquinaria ya verificada.
- Cada frase del JSON: `{ id, prompt (italiano), answer[] (español, NFC, sin puntuación), distractors?[], categoryIds[] }`. `categoryIds` vacío/ausente = frase sin cascada (LINK-03).
- El status redimible/bidireccional (D-03) ya funciona: re-jugar una `fallada` limpia → `pasada`; re-jugar una `pasada` con fallo → `fallada`.

## Self-Check: PASSED

`tests/screen-canciones.test.js` existe; `src/main.js`/`src/screens/app.js`/`index.html` modificados en disco. Los tres commits (`1b80210`, `10fe9c8`, `db69f8e`) presentes en el historial git. Suite completa 306/306 pass.
