---
phase: 13-bloque-canciones-modelo-de-datos-playthrough-end-to-end
verified: 2026-06-02T00:00:00Z
status: human_needed
score: 14/14 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Abrir Canciones desde el home, jugar la mini-cancion completa respondiendo correctamente las 3 frases"
    expected: "Las 3 frases avanzan en orden; la frase 3 (sin categoria) concluye la cancion; el resumen muestra 0 frases falladas; el estado de la cancion cambia a 'pasada'; al volver al listado aparece el badge 'Pasada'"
    why_human: "El playthrough mid-sesion requiere Alpine instanciado en navegador; el orden secuencial, el auto-avance 600ms y el render x-for del banco no son instanciables bajo node"
  - test: "Jugar la mini-cancion fallando la frase 1 (mini-prueba-001, categoryIds=['avere'])"
    expected: "La frase muestra feedback rojo con la traduccion correcta; el boton Siguiente aparece; al pulsar Siguiente la frase 2 carga; al terminar el resumen lista la frase 1 en 'Frases falladas' y la categoria 'avere' en 'Categorias que bajaron de estado'; el estado de la cancion en el listado es 'Fallada'"
    why_human: "Cascada D-54 (applyImmediateFailure + saveState sincrono) requiere verificacion visual del estado localStorage en DevTools; feedback verde/rojo requiere DOM Alpine"
  - test: "Jugar la mini-cancion, fallar la frase 3 (mini-prueba-003, categoryIds=[])"
    expected: "La frase muestra feedback rojo con la traduccion correcta; el resumen lista la frase 3 en Frases falladas; el bloque 'Categorias que bajaron de estado' esta VACIO (sin cascada por categoryIds vacio)"
    why_human: "El bloque B vacio requiere verificacion visual en el resumen renderizado con Alpine"
  - test: "Abandonar la cancion a mitad (pulsar 'Volver a Canciones' durante el playthrough)"
    expected: "El progreso no comprometido (frases aun no respondidas) se descarta; al re-entrar la cancion empieza desde la frase 1; los fallos ya cascadeados antes de abandonar quedan persistidos en categoryProgress"
    why_human: "Comportamiento PLAY-05 requiere interaccion: fallar una frase, verificar persistencia en localStorage, luego abandonar y re-entrar; no instanciable bajo node"
  - test: "Verificar que las canciones NO aparecen en el sampler Repaso 20 ni en la tabla de categorias del home"
    expected: "El home muestra la tabla de categorias de gramatica sin canciones; iniciar una sesion de Repaso o Test completo no incluye frases de mini-prueba"
    why_human: "Requiere verificacion visual del DOM renderizado; el aislamiento LINK-04 se verifica en codigo pero el resultado en UI necesita confirmacion humana"
---

# Phase 13: Bloque Canciones — Modelo de datos + Playthrough end-to-end — Verification Report

**Phase Goal:** El usuario puede abrir un bloque "Canciones" separado del home, ver el listado con estado por cancion, y jugar una cancion completa traduciendola frase a frase (italiano->espanol) con feedback, resumen de errores y cascada D-54 a las categorias enganchadas — reutilizando el engine, word-buttons, schema-validator y patron Test-completo existentes, SIN reconstruir el motor.
**Verified:** 2026-06-02
**Status:** human_needed (14/14 truths verified automaticamente; 5 items requieren verificacion human en navegador)
**Re-verification:** No — verificacion inicial

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Una cancion vive en JSON editado a mano con schema definido (cancion -> frases ordenadas con metadatos) | VERIFIED | `content/songs.json` y `content/songs/mini-prueba.json` existen, parsean como JSON valido, shape `{id, title, phrases:[{id, prompt, answer[], categoryIds[]}]}` confirmado |
| 2 | El validator rechaza JSON de cancion malformado acumulando todos los errores (mensajes en espanol), coherente con validateContent | VERIFIED | `grep -c "export function validateSongs" schema-validator.js` = 1; 15 tests en song-validator.test.js todos green; comentario LINK-03 y divergencia categoryIds documentados en el codigo |
| 3 | Una frase de cancion puede declarar categoryIds[] (LINK-01) o llevarlo vacio/ausente sin error (LINK-03) | VERIFIED | Lineas 238-249 schema-validator.js: `if (phrase.categoryIds !== undefined)` — ausente/vacio no produce error; test "categoryIds vacio -> ok" verde; mini-prueba-003 usa `categoryIds: []` y pasa |
| 4 | El loader normaliza a NFC en el borde y devuelve un mapa songsById SEPARADO de exerciseById (LINK-04) | VERIFIED | `grep -c "export async function loadSongs" content-loader.js` = 1; linea 120: `validateSongs` llamado despues de NFC; linea 96 main.js: `content.songsById = songsById` (campo hermano, NO en exerciseById); session.js no contiene referencias a canciones |
| 5 | El state arranca/migra a schemaVersion 5 con sub-arbol songProgress vacio, con deep-clone defensivo | VERIFIED | `CURRENT_SCHEMA_VERSION = 5` x1; `export function migrate4to5` x1, `export function hydrateV5` x1; blankState() incluye `songProgress: {}`; deep-clone JSON.parse(JSON.stringify(...)) por sub-dict (lineas 418-437, 452-470); 9 referencias no-comentario a songProgress en storage.js |
| 6 | Existe una mini-cancion de prueba con >=1 frase enganchada a categoria existente y >=1 frase sin categoria | VERIFIED | mini-prueba.json: 3 frases; phrase[0].categoryIds=['avere'], phrase[1].categoryIds=['preposiciones'], phrase[2].categoryIds=[]; test "la mini-cancion real del repo pasa validateSongs" verde |
| 7 | El home tiene un boton protagonista 'Canciones' (no muted) en la fila prominente que abre currentScreen='canciones' | VERIFIED | index.html linea 152: `<button type="button" @click="currentScreen = 'canciones'">Canciones</button>` sin `class="secondary"`; Backup linea 153 tiene `class="secondary"`, Canciones no |
| 8 | El listado muestra cada cancion con su estado (no-hecha/pasada/fallada) y numero de frases, persistido en localStorage | VERIFIED | `songsForDisplay` getter en app.js (linea 2557): mapea `songsById + state.songProgress`, default 'no-hecha'; `song.phraseCount` derivado de `song.phrases.length`; `song.statusLabel` via `songStatusLabelFor`; index.html linea 232-235: x-text para ambos |
| 9 | Con 1 clic se inicia una cancion y se recorren sus N frases EN ORDEN hasta el final, sin reinicio a mitad (PLAY-01) | VERIFIED | `startSong(songId)` definido en app.js linea 500; usa `Array.map` preservando el orden declarado (lineas 514-527); NO llama `buildFullTest`/`buildSession`/`fisherYates` sobre el orden de frases; comentario explicito PLAY-01 linea 510-511 |
| 10 | Cada frase muestra la linea italiana y se construye la traduccion espanola con word-buttons (it->es), feedback verde/rojo, al fallar muestra la correcta | VERIFIED | index.html lineas 586-648: template `currentScreen === 'cancion' && songCurrentPhrase`; prompt via `x-text="songCurrentPhrase.payload.prompt"` (linea 592); correcta via `x-text="songCurrentPhrase.payload.answer.join(' ')"` (linea 625); feedback `sessionFeedback === 'incorrect'` (linea 623) |
| 11 | Fallar una frase con categoryIds dispara applyImmediateFailure inmediato (UN call-site); frases sin categoria no cascadean | VERIFIED | `songCheck` (linea 581) delega en `applyResultToSession`; linea 1475 unico call-site de `applyImmediateFailure` en `applyResultToSession`; progress.js linea 304: `catIds = exercise?.categoryIds ?? []` — array vacio = bucle no ejecuta (LINK-03); total call-sites en app.js = 2 (preexistentes, no aumentados) |
| 12 | Al terminar, el resumen lista frases falladas (tu respuesta vs correcta) + bloque de categorias que bajaron de estado | VERIFIED | `completeSong` (linea 2133): escribe `songSummaryDelta` con regresiones; index.html lineas 832-870: template `cancion-summary`: Block A (lineas 836-848, lookup songPhraseById), Block B (lineas 854-866, songSummaryDelta); todo x-text (T-02-01) |
| 13 | El estado pasada/fallada se escribe write-once-at-end y persiste; abandonar a mitad descarta el progreso no comprometido (los fallos cascadeados quedan), re-entrar empieza de cero | VERIFIED | `completeSong` linea 2144: `newState.songProgress[songId] = { status, lastPlayedAt }` + `saveState` + `this.state = newState`; NO llama `applySessionResult`; `returnToSongList` linea 2196: `resetSession()` + `currentScreen = 'canciones'`; PLAY-05 documentado y botón "Volver a Canciones" en mid-playthrough |
| 14 | Las canciones NO entran en buildSession/buildFullTest ni en la tabla de categorias del home | VERIFIED | `session.js`: 0 referencias a song/cancion; `content-loader.js` linea 77: comentario explicit "NUNCA se mezclan en exerciseById"; `main.js` linea 95-96: `content.songsById = songsById` campo hermano; home muestra `categoriesForDisplay` (ejercicios gramaticales), listado canciones usa `songsForDisplay` (separado) |

**Score:** 14/14 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/songs.json` | Indice ligero de canciones (id, title, phraseCount) | VERIFIED | 102 bytes; `{ "songs": [{ "id": "mini-prueba", "title": "Mini-cancion de prueba", "phraseCount": 3 }] }` |
| `content/songs/mini-prueba.json` | Mini-cancion de prueba jugable end-to-end (frases con y sin categoria) | VERIFIED | 596 bytes; 3 frases: 2 con categoryIds reales (avere, preposiciones), 1 con categoryIds:[] |
| `src/data/schema-validator.js` | validateSongs export — valida estructura de cancion + payload por frase | VERIFIED | `export function validateSongs` x1; export separado de PAYLOAD_VALIDATORS; LINK-03 divergencia documentada y codificada (lineas 166-170, 238-249) |
| `src/data/content-loader.js` | loadSongs — fetch + NFC + validate, devuelve songsById sibling | VERIFIED | `export async function loadSongs` x1; validateSongs llamado linea 120 tras NFC; devuelve `{ songs, songsById }` separado |
| `src/data/storage.js` | migrate4to5 + hydrateV5 + songProgress en blankState, CURRENT_SCHEMA_VERSION=5 | VERIFIED | Todos los exports presentes; deep-clone defensivo confirmado; dispatcher linea 142-143 encadena correctamente |
| `src/main.js` | boot: loadSongs tras loadContent, songsById en el handoff de content | VERIFIED | `loadSongs` x3 (import+fetch-index+call); `content.songsById = songsById` linea 96 |
| `src/screens/app.js` | songsForDisplay getter, startSong, completeSong con songProgress write-once + category-impact block | VERIFIED | Todos presentes y sustantivos: startSong (500), songCheck (581), songAdvance (596), handleSongKey (618), completeSong (2133), songsForDisplay (2557), returnToSongList (2196) |
| `index.html` | Boton protagonista Canciones + screen 'canciones' (listado x-for) + render playthrough word-buttons + bloques resumen | VERIFIED | Todas las secciones presentes; templates x-if mutuamente excluyentes (D-24); todo x-text (T-02-01) |
| `tests/screen-canciones.test.js` | Presence/smoke tests para el bloque canciones | VERIFIED | 15660 bytes; 19 tests, 19 pass; 3 suites (Task 1, Task 2, Task 3) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/data/content-loader.js` | `src/data/schema-validator.js` | validateSongs call antes de retornar songsById | VERIFIED | Linea 120: `const { ok, errors } = validateSongs({ songs: songDocs, knownCategoryIds: known })` |
| `src/data/storage.js` migrate dispatcher | migrate4to5 / hydrateV5 | schemaVersion 4->5 chain link | VERIFIED | Lineas 142-143: `if (s.schemaVersion === 4) s = migrate4to5(s); if (s.schemaVersion === 5) return hydrateV5(s);` |
| `index.html` boton Canciones | `currentScreen = 'canciones'` | @click protagonista (sin class secondary) | VERIFIED | Linea 152: boton sin secondary; linea 153: Backup tiene secondary — distincion correcta |
| `src/screens/app.js` startSong | `song.phrases` en orden (NO buildFullTest) | playthrough secuencial sin shuffle de frases | VERIFIED | startSong lineas 514-527: `Array.map` sobre `song.phrases` preserva orden; 0 referencias a buildFullTest/buildSession en el cuerpo |
| `src/screens/app.js` completion routine | `applyImmediateFailure` (per frase fallada) + `songProgress[songId].status` | cascada inmediata (un call-site) + write-once-at-end | VERIFIED | songCheck -> applyResultToSession -> applyImmediateFailure (linea 1475); completeSong -> `songProgress[songId] = {status, lastPlayedAt}` (linea 2144); total call-sites = 2 (preexistentes, no aumentados por Phase 13) |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `index.html` (listado canciones) | `songsForDisplay` | `this.content.songsById` (de loadSongs) + `this.state.songProgress` (de storage) | Si — loadSongs hace fetch real de content/songs.json + content/songs/mini-prueba.json | FLOWING |
| `index.html` (playthrough) | `songCurrentPhrase` | `this.songPhraseById` (poblado en startSong desde song.phrases) | Si — startSong itera phrases reales del JSON | FLOWING |
| `index.html` (resumen) | `songSummaryDelta`, `summarySessionResults` | `completeSong` computa regresiones desde sessionResults + songBefore vs categoryProgress actual | Si — computacion real sobre datos de sesion; no hardcodeado | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| songs.json parses | `node -e "require('./content/songs.json')"` | 1 song entry | PASS |
| mini-prueba.json parses y tiene 3 frases con/sin categoria | `node -e "const m=require('./content/songs/mini-prueba.json'); console.log(m.phrases.length)"` | 3; phrase[2].categoryIds=[] | PASS |
| Full test suite | `node --test tests/*.test.js` | 307 pass / 0 fail | PASS |
| screen-canciones.test.js | `node --test tests/screen-canciones.test.js` | 19 pass / 0 fail | PASS |
| song-validator.test.js | `node --test tests/song-validator.test.js` | 15 pass / 0 fail | PASS |
| JS syntax check all modified files | `node --check src/{main,screens/app,data/schema-validator,data/content-loader,data/storage}.js` | todos OK | PASS |
| LINK-03 logica: categoryIds=[] no ejecuta cascada | node inline proof | correct: false | PASS |

### Probe Execution

No probes declarados para esta fase. Step 7c: SKIPPED (no probe-*.sh files).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SONG-01 | 13-01, 13-02 | Abrir bloque Canciones desde home con listado | SATISFIED | Boton protagonista en index.html linea 152; template canciones con x-for songsForDisplay |
| SONG-02 | 13-02 | Listado muestra estado (no hecha/pasada/fallada) y numero de frases | SATISFIED | songsForDisplay getter mapea status + phraseCount; index.html lineas 231-235 renderizan ambos |
| SONG-03 | 13-02 | Iniciar cancion con 1 clic desde el listado | SATISFIED | `startSong(song.id)` en boton "Jugar" del listado (index.html linea 238 area); 1 clic sin pantalla intermedia |
| SONG-04 | 13-02 | Estado pasada/fallada persiste en localStorage entre sesiones | SATISFIED | completeSong -> saveState(newState) con songProgress[songId]; hydrateV5 restaura el sub-arbol al cargar |
| PLAY-01 | 13-02 | N frases en orden secuencial hasta el final, sin reinicio a mitad | SATISFIED | startSong usa Array.map preservando orden; NO buildFullTest/buildSession; cursor secuencial en songAdvance |
| PLAY-02 | 13-02 | Linea italiana, traduccion espanola con word-buttons | SATISFIED | Prompt italiano en x-text; banco de tokens espanoles via bankWithKeys; wordButtons.grade reutilizado |
| PLAY-03 | 13-02 | Feedback verde/rojo; traduccion correcta al fallar | SATISFIED | sessionFeedback='correct'/'incorrect'; x-show incorrect muestra `answer.join(' ')` (linea 623-626) |
| PLAY-04 | 13-02 | Resumen con frases falladas (respuesta vs correcta) | SATISFIED | Block A en cancion-summary: summarySessionResults filtrado por !correct, lookup songPhraseById (D-04: incluyendo frases sin categoria) |
| PLAY-05 | 13-02 | Abandonar descarta progreso no comprometido; re-entrar empieza de cero | SATISFIED | returnToSongList -> resetSession; boton "Volver a Canciones" mid-playthrough; songMode='cancion' en applyResultToSession no llama persistInFlightTest |
| LINK-01 | 13-01 | Frases pueden declarar categoryIds[] | SATISFIED | Shape de frase en schema incluye categoryIds[]; mini-prueba-001 y -002 lo usan |
| LINK-02 | 13-02 | Fallar frase enganchada dispara cascada D-54 inmediata | SATISFIED | songCheck -> applyResultToSession -> applyImmediateFailure (linea 1475) + saveState sincrono; mismo call-site que ejercicios normales |
| LINK-03 | 13-01 | Modelo soporta frases sin categoria (sin cascada) | SATISFIED | validateSongs acepta categoryIds ausente/[]; progress.js linea 304: catIds=[] -> bucle no-op |
| LINK-04 | 13-01, 13-02 | Frases de canciones NO entran en sampler Repaso/Test ni tabla de categorias | SATISFIED | songsById campo hermano; session.js sin referencias a canciones; categoriesForDisplay separado de songsForDisplay; home muestra solo categorias gramaticales |
| DATA-01 | 13-01 | Contenido en JSON editado a mano con schema definido | SATISFIED | content/songs.json + content/songs/mini-prueba.json; schema documentado en validateSongs JSDoc |
| DATA-02 | 13-01 | Schema-validator rechaza JSON malformado con banner visible | SATISFIED | validateSongs acumula errores; loadSongs lanza Error con .errors si !ok (igual que loadContent linea 54-58); fluye al catch -> renderValidationBanner |
| DATA-03 | 13-01 | Migracion schemaVersion con patron migrateNtoM | SATISFIED | CURRENT_SCHEMA_VERSION=5; migrate4to5/hydrateV5 con deep-clone defensivo; dispatcher encadena correctamente; backup.js tambien extendido a v5 |

**CONT-01, CONT-02, CONT-03:** Mappeados a Phase 14 (Pending) — correctamente diferidos, no aplican a Phase 13.

**Orphaned requirements:** 0. Todos los 16 requisitos de Phase 13 cubiertos.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/main.js` | 45, 115-119, 146-147 | "placeholder" | Info | Referencias al elemento DOM `#app-placeholder` — es un placeholder de carga HTML, no una implementacion stub; no afecta funcionalidad |
| `src/screens/app.js` | 712 | "placeholders" | Info | Comentario sobre sub-estado de match — contexto historico, no stub activo |
| `src/data/storage.js` | 281 | "placeholder" | Info | Comentario sobre comportamiento del engine — no stub |

**TBD/FIXME/XXX:** 0 encontrados en ningun archivo modificado por Phase 13.
**Implementaciones vacias/return null:** songCurrentPhrase devuelve null como sentinela cuando no hay frase activa — comportamiento correcto, no stub (Alpine guard `&& songCurrentPhrase` impide el montaje).

### Code Review Fixes Applied (4/4 WR warnings from 13-REVIEW.md)

| Warning | Fix | Evidence |
|---------|-----|----------|
| WR-01: zero-phrase song dead-end | `phrases.length === 0` requiere al menos 1 frase en validateSongs | schema-validator.js lineas 215-220: `"phrases" debe contener al menos 1 frase`; + guard defensive en startSong linea 506 |
| WR-02: commitImport no reaps songProgress | Reap songProgress against content.songsById | app.js lineas 1321-1330: `reapedSongProgress` filtrado por validSongIds |
| WR-03: songCurrentPhrase falta `!this.content` guard | Guard anadido como primera linea del getter | app.js linea 2254: `if (!this.content) return null;` |
| WR-04: handleSongKey omite bound idx < 9 | Bound anadido para paridad con handleSessionKey | app.js linea 651: `if (idx < this.wordButtonsBank.length && idx < 9)` |

### Human Verification Required

#### 1. Playthrough completo sin errores

**Test:** Abrir el home, pulsar Canciones, pulsar Jugar en mini-prueba, responder correctamente las 3 frases en orden.
**Expected:** Frases avanzan secuencialmente (1->2->3); cada respuesta correcta dispara auto-avance 600ms; al terminar aparece el resumen con 0 frases falladas; bloque B vacio; boton "Volver a Canciones"; al volver el badge muestra "Pasada".
**Why human:** Alpine reactivo, auto-avance 600ms, render x-for del banco y DOM mid-sesion no son instanciables bajo node.

#### 2. Cascada D-54 con categoria enganchada

**Test:** Jugar la mini-prueba, fallar la frase 1 (mini-prueba-001, categoryIds=['avere']).
**Expected:** Feedback rojo con "Respuesta correcta: tengo un coche nuevo"; boton Siguiente visible; al terminar: Block A lista mini-prueba-001 con tu respuesta vs correcta; Block B lista "avere: hecha -> no-hecha" (o equivalente segun estado actual); localStorage muestra categoryProgress.avere.status='no-hecha'.
**Why human:** Verificacion de localStorage en DevTools + render de ambos bloques del resumen requiere navegador.

#### 3. Frase sin categoria no cascadea

**Test:** Jugar la mini-prueba, fallar solo la frase 3 (mini-prueba-003, categoryIds=[]).
**Expected:** Feedback rojo; resumen Block A lista frase 3; Block B VACIO (ningun texto de categorias que bajaron); localStorage: songProgress.mini-prueba.status='fallada', categoryProgress sin cambios.
**Why human:** Ausencia de Block B requiere confirmacion visual en el DOM renderizado.

#### 4. Abandono a mitad y re-inicio de cero

**Test:** Iniciar mini-prueba, fallar frase 1 (cascada persiste), pulsar "Volver a Canciones" antes de terminar, re-entrar a la misma cancion.
**Expected:** Al volver al listado la cancion NO aparece como pasada/fallada (progreso descartado); al re-entrar la cancion empieza desde frase 1; en localStorage: la cascada D-54 de frase 1 (categoryProgress.avere reseteada) SIGUE aplicada.
**Why human:** PLAY-05 requiere secuencia de acciones y lectura de localStorage en DevTools.

#### 5. Aislamiento LINK-04 en UI

**Test:** Desde el home, verificar la tabla de categorias gramaticales; iniciar una sesion de Repaso 20 y completarla.
**Expected:** La tabla de categorias muestra categorias gramaticales (avere, preposiciones, etc.) pero NO mini-prueba ni ninguna cancion; la sesion de Repaso solo contiene ejercicios de categorias gramaticales.
**Why human:** Requires visual confirmation of DOM rendered by Alpine; grep confirms code isolation but UI rendering needs human verification.

---

## Gaps Summary

No gaps. Las 14 truths verificables automaticamente estan TODAS verificadas. Los 5 items de verificacion human son comportamientos mid-sesion que requieren Alpine instanciado en navegador — el codigo que los implementa esta completamente presente, sustantivo y cableado. Este patron es consistente con las fases 3-12 de este proyecto.

---

_Verified: 2026-06-02_
_Verifier: Claude (gsd-verifier)_
