---
phase: 13-bloque-canciones-modelo-de-datos-playthrough-end-to-end
plan: 01
subsystem: data
tags: [songs, schema-validator, migration, content-loader, storage, brownfield]
requires:
  - "engine v1.0 (validateContent accumulator, normalizeNfcInPlace, migration chain, deep-clone CR-03)"
provides:
  - "validateSongs (validador de canciones, export separado de PAYLOAD_VALIDATORS)"
  - "loadSongs (carga standalone NFC, devuelve songsById hermano de exerciseById)"
  - "migrate4to5 / hydrateV5 + songProgress sub-árbol (schemaVersion 5)"
  - "content/songs.json + content/songs/mini-prueba.json (mini-canción jugable)"
affects:
  - "src/data/backup.js (cadena de migración extendida a v5)"
tech-stack:
  added: []
  patterns:
    - "validador acumulador hand-written (D-08) para canciones, espejo de validateContent"
    - "deep-clone defensivo JSON.parse(JSON.stringify(...)) por sub-dict (CR-03 / T-13-01)"
    - "carga standalone: songsById NUNCA en exerciseById (LINK-04)"
key-files:
  created:
    - content/songs.json
    - content/songs/mini-prueba.json
    - tests/song-validator.test.js
  modified:
    - src/data/schema-validator.js
    - src/data/content-loader.js
    - src/data/storage.js
    - src/data/backup.js
    - tests/data-storage.test.js
    - tests/backup.test.js
decisions:
  - "validateSongs es export separado (patrón (a)), NO extiende PAYLOAD_VALIDATORS — coherente con LINK-04 standalone"
  - "songProgress plano { status, lastPlayedAt? } — sin streak/dominada (D-03)"
  - "[Rule 2] backup.js extendido a v5 para preservar el round-trip export/import del estado actual"
metrics:
  duration: ~5 min
  completed: 2026-06-02
  tasks: 2
  files: 9
  tests_total: 287
---

# Phase 13 Plan 01: Modelo de datos del bloque Canciones Summary

Capa de datos del bloque Canciones — schema de canción + `validateSongs` + carga standalone `loadSongs` + sub-árbol de estado `songProgress` con migración 4→5, todo replicando analogs del engine v1.0 con extensión quirúrgica y cubierto por tests `node --test`.

## What Was Built

**Task 1 — Schema de canción + mini-canción + validateSongs (`ae81bd7`)**
- `content/songs.json`: índice ligero `{ songs: [{ id, title, phraseCount }] }` (analog de `categories.json`).
- `content/songs/mini-prueba.json`: 3 frases — 2 enganchadas a categorías reales (`avere`, `preposiciones`), 1 sin categoría (`categoryIds: []`). `prompt` = línea italiana, `answer[]` = tokens españoles (word-buttons invertido).
- `validateSongs({ songs, knownCategoryIds })` + helper `validateSongPhrasePayload`: export SEPARADO (no toca `PAYLOAD_VALIDATORS`). Acumula todos los errores (D-08), mensajes en español, nunca lanza mid-walk. DIVERGENCIA LINK-03: `categoryIds` ausente o `[]` es válido; si está presente valida referencia conocida. Valida id de canción/frase duplicados.
- 14 tests unitarios en `tests/song-validator.test.js`.

**Task 2 — loadSongs standalone + migrate4to5/hydrateV5/songProgress (`6d1e5e1`)**
- `storage.js`: `CURRENT_SCHEMA_VERSION` 4→5; `blankState()` + `songProgress: {}`; dispatcher extendido (`migrate4to5` → `hydrateV5`); `migrate4to5`/`hydrateV5` copiando la forma de `migrate3to4`/`hydrateV4` con deep-clone defensivo por sub-dict (CR-03) y la línea `songProgress`. `hydrateV4` preservado por backward-compat.
- `content-loader.js`: `loadSongs(songIds, knownCategoryIds)` — fetch del índice + cada canción, `normalizeNfcInPlace` ANTES de `validateSongs`, lanza `Error` con `.errors` si falla (DATA-02), devuelve `{ songs, songsById }` HERMANO — NUNCA escribe en `exerciseById` (LINK-04).
- Tests de `migrate4to5`/`hydrateV5`/cadena v4→v5/anti-prototype-pollution/songProgress corrupto en `tests/data-storage.test.js`.

## Verification Results

- `node --test tests/*.test.js`: **287 pass / 0 fail** (era 275; +14 song-validator, +más migración v5).
- `content/songs.json` y `content/songs/mini-prueba.json` parsean como JSON válido.
- mini-canción: 3 frases, 2 con categoría real, 1 sin categoría — verificado por el test "la mini-canción real del repo pasa validateSongs".
- Acceptance criteria de ambas tasks verificados (grep counts: `validateSongs`×1, `CURRENT_SCHEMA_VERSION = 5`×1, `migrate4to5`×1, `hydrateV5`×1, `songProgress` non-comment ≥3, `loadSongs`×1).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Extender la cadena de migración de `src/data/backup.js` a v5**
- **Found during:** Task 2 (al bumpear `CURRENT_SCHEMA_VERSION` 4→5 en storage).
- **Issue:** `src/data/backup.js` tiene su PROPIA `CURRENT_SCHEMA_VERSION = 4` y su cadena de migración (`migrate1to2`…`hydrateV4`). Al bumpear storage a v5, un backup exportado del estado actual llevaría `state.schemaVersion: 5`, que `parseBackupFile` rechazaría con "versión más nueva" (guard `state.schemaVersion > CURRENT_SCHEMA_VERSION`). El round-trip export/import — funcionalidad crítica de backup BACK-01 heredada — quedaría roto para todo estado v5.
- **Fix:** `backup.js` ahora importa `migrate4to5`/`hydrateV5`, bumpea su constante a 5 y extiende la cadena con `if (migrated.schemaVersion === 4) migrated = migrate4to5(...)` + `migrated = hydrateV5(...)`.
- **Files modified:** `src/data/backup.js`, `tests/backup.test.js` (5 asserts `schemaVersion 4`→`5` + nombres de test + comentarios; +1 assert `songProgress {}` en la cadena v1→v5).
- **Commit:** `6d1e5e1`
- **Why in-scope:** `backup.js` consume directamente las migraciones de `storage.js` que esta task modifica; sin el ajuste el bump deja la app en un estado donde sus propios backups no re-importan. Mitiga implícitamente el mismo deep-clone defensivo (T-13-01) en el path de import.

Sin desviaciones arquitectónicas (Rule 4). Sin auth gates. Sin stubs.

## Threat Surface

Sin superficie de amenaza nueva fuera del `<threat_model>` del plan. T-13-01 (deep-clone defensivo) cubierto en `migrate4to5`/`hydrateV5` (y, por la desviación Rule 2, también en el path de import de `backup.js`). T-13-02 (JSON malformado → banner) cubierto: `loadSongs` lanza `Error` con `.errors`.

## Notes for Next Plan (13-02)

- `loadSongs(songIds, knownCategoryIds)` devuelve `{ songs, songsById }` — el playthrough lee `songsById[songId].phrases` en orden declarado (PLAY-01), nunca de `exerciseById`.
- Las frases NO llevan `type`; son word-buttons inverso (`prompt` italiano, `answer[]` español). El handler `wordButtons.grade()` se reutiliza tal cual.
- `state.songProgress[songId]` = `{ status: 'no-hecha'|'pasada'|'fallada', lastPlayedAt? }` — write-once-at-end (D-02). La cascada por frase fallada usa `applyImmediateFailure` (categoryProgress, write inmediato).
- `mini-prueba` tiene 1 frase sin categoría (no cascadea) y 2 con categoría (cascadean) — slice verificable end-to-end sin Phase 14.

## Self-Check: PASSED

Todos los archivos creados/modificados existen en disco; ambos commits (`ae81bd7`, `6d1e5e1`) presentes en el historial git.
