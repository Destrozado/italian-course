---
phase: 13-bloque-canciones-modelo-de-datos-playthrough-end-to-end
reviewed: 2026-06-02T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - src/main.js
  - src/screens/app.js
  - src/data/schema-validator.js
  - src/data/storage.js
  - src/data/content-loader.js
  - src/data/backup.js
  - content/songs.json
  - content/songs/mini-prueba.json
  - index.html
  - tests/song-validator.test.js
  - tests/screen-canciones.test.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 0
  warning: 4
  info: 5
  total: 9
status: issues_found
---

# Phase 13: Code Review Report

**Reviewed:** 2026-06-02
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 13 adds the "canciones" block: a standalone song playthrough (it→es
word-buttons) that reuses the `session*` sub-state and the single D-54 cascade
call-site, plus a new `songProgress` sub-tree behind a v4→v5 migration. I
adversarially traced the cursor cursor/cascade/snapshot flow, the migration
chain, the validator divergences, and every Alpine binding against the project's
stated invariants.

The intentional invariants held up under scrutiny and are NOT bugs:

- **D-54 single call-site:** `applyImmediateFailure` remains at exactly 2 code
  call-sites (`applyResultToSession` line 1462, `matchPickRight` line 1687). The
  song path reuses `applyResultToSession` via `songCheck` — no new duplicate.
- **LINK-04 standalone:** songs are loaded on a separate path, attached as
  `content.songsById` (sibling of `exerciseById`), resolved through
  `songPhraseById`, and never enter `buildSession`/`buildFullTest`/`exerciseById`.
- **Migration deep-clone:** `migrate4to5`/`hydrateV5` mirror `migrate3to4`'s
  `JSON.parse(JSON.stringify(...))` per-subdict defense; prototype-pollution
  test passes.
- **Summary "before" timing:** `songBefore` is correctly captured at song START
  in `startSong` (line 558) because the cascade is incremental — not at the end.
- **Song status semantics:** write-once-at-end in `completeSong`, three
  redeemable values (`no-hecha|pasada|fallada`), no streak/dominada.
- **Anti-XSS T-02-01:** all song content rendered via `x-text`; no `x-html`.
- **Reversed word-buttons grading:** `wordButtons.grade` compares `tokens`
  against `payload.answer` in order — correct for the it→es phrasing.

No BLOCKER-tier defects found. The issues below are robustness/edge-case
(WARNING) and content/maintainability (INFO) concerns.

## Warnings

### WR-01: Song with zero phrases produces an unrecoverable dead-end screen

**File:** `src/data/schema-validator.js:210-213`, `src/screens/app.js:500-568`
**Issue:** `validateSongs` accepts `phrases: []` (it only requires
`Array.isArray(song.phrases)`, never `length >= 1`). If such a song is authored,
`startSong` sets `currentScreen = 'cancion'` with `sessionExerciseIds = []` and
`sessionCursor = 0`. The getter `songCurrentPhrase` then returns `null`
(`0 >= 0`), so the template `x-if="currentScreen === 'cancion' && songCurrentPhrase"`
never mounts. The user lands on a blank screen — `completeSong` is never reached
because no phrase can be checked/advanced. Only "Volver a Canciones" escapes, and
`songProgress` is never written. By contrast, exercise pools that come up empty
are funnelled through `completeSession`. The song path has no equivalent.
**Fix:** Require at least one phrase in the validator:
```js
if (!Array.isArray(song?.phrases)) {
  push(file, songId, '"phrases" debe ser array');
  continue;
}
if (song.phrases.length === 0) {
  push(file, songId, '"phrases" debe contener al menos 1 frase');
  continue;
}
```
Optionally add a defensive guard in `startSong`:
`if (!song || !Array.isArray(song.phrases) || song.phrases.length === 0) return;`

### WR-02: `commitImport` reaps orphans in exerciseStats/categoryProgress but NOT songProgress

**File:** `src/screens/app.js:1304-1318`
**Issue:** The ME-04 orphan-reaping logic builds `reapedExerciseStats` and
`reapedCategoryProgress` against the current content, then spreads them back over
`imported`. `songProgress` is silently passed through untouched. A backup that
references a song id no longer present in `content.songsById` (author renamed or
deleted a song JSON between exports) keeps an orphan `songProgress[oldId]` entry
forever — the exact unbounded-growth scenario the ME-04 fix was written to
prevent, just for the new sub-tree. It is never surfaced (`songsForDisplay`
iterates `songsById`, not `songProgress`), so it accumulates invisibly.
**Fix:** Reap `songProgress` against `content.songsById` in the same block:
```js
const validSongIds = new Set(Object.keys(this.content.songsById ?? {}));
const reapedSongProgress = {};
for (const [sid, prog] of Object.entries(imported.songProgress ?? {})) {
  if (validSongIds.has(sid)) reapedSongProgress[sid] = prog;
}
imported = {
  ...imported,
  exerciseStats: reapedExerciseStats,
  categoryProgress: reapedCategoryProgress,
  songProgress: reapedSongProgress
};
```

### WR-03: `songCurrentPhrase` getter lacks the `!this.content` first-line guard used by its sibling

**File:** `src/screens/app.js:2240-2245`
**Issue:** The JSDoc claims this is a "espejo defensivo de `sessionCurrentExercise`"
and promises "double-defense Alpine". But `sessionCurrentExercise` (line 2217)
guards `if (!this.content) return null;` as its first statement, whereas
`songCurrentPhrase` omits it and instead guards only on cursor + `songPhraseById?.`.
It does not crash today only because `songPhraseById` is an instance prop
defaulting to `{}`. The asymmetry is a latent trap: any future refactor that
moves phrase storage onto `this.content` (the natural place — phrases live in
`content.songsById`) would reintroduce the pre-init TypeError the comment claims
to defend against. The defense the comment promises is not actually present.
**Fix:** Add the symmetric guard so the getter matches its documented contract:
```js
get songCurrentPhrase() {
  if (!this.content) return null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
  const id = this.sessionExerciseIds[this.sessionCursor];
  if (!id) return null;
  return this.songPhraseById?.[id] ?? null;
}
```

### WR-04: `handleSongKey` digit branch omits the `idx < 9` bound that `handleSessionKey` enforces

**File:** `src/screens/app.js:646-650` vs `src/screens/app.js:1990-1995`
**Issue:** In `handleSessionKey`, the word-buttons digit branch guards
`if (idx < this.wordButtonsBank.length && idx < 9)`. The song analog
`handleSongKey` only checks `if (idx < this.wordButtonsBank.length)`. Today the
regex `/^[1-9]$/` caps `key` at '9' so `idx` maxes at 8 and the two are
equivalent — but the invariant is now expressed inconsistently between the two
near-identical handlers. The `bankWithKeys` getter only renders keyboard hints
for `idx < 9`, so a 10th+ bank word is intentionally click-only; the song handler
silently diverges from that contract. A future change to the digit regex (e.g.
adding '0' for the 10th item) would behave differently in the two screens.
**Fix:** Mirror the session handler for parity and to keep the `< 9` invariant
explicit:
```js
if (/^[1-9]$/.test(key)) {
  if (this.sessionFeedback !== null) return;
  const idx = Number(key) - 1;
  if (idx < this.wordButtonsBank.length && idx < 9) this.wordButtonsAddWord(idx);
}
```

## Info

### IN-01: Mini-prueba song phrases ship without distractors — trivially solvable, undercuts core value

**File:** `content/songs/mini-prueba.json:5-22`
**Issue:** None of the three phrases define `distractors`. The word bank is
therefore `fisherYates(answer)` only — the exact set of correct tokens, merely
reordered. The learner cannot pick a wrong word; the only "difficulty" is
ordering. This contradicts the project core value ("que el sistema te obligue a
no olvidar") which elsewhere drives non-deterministic option/bank shuffling
specifically to force re-reading. As a real authored exercise this would be
near-useless. Schema-legal (distractors optional) but low pedagogical value.
**Fix:** Add 1-3 plausible Spanish distractors per phrase, e.g.
`"distractors": ["tuyo", "casas"]` for `mini-prueba-002`. If this file is only a
boot/smoke fixture, rename or comment it as such to avoid it being mistaken for a
real-content template.

### IN-02: `phraseCount` in songs.json index is hand-maintained and can silently desync

**File:** `content/songs.json:3` and `src/screens/app.js:2551`
**Issue:** `songs.json` declares `"phraseCount": 3`, but `songsForDisplay`
ignores it and derives the count from `song.phrases.length` of the loaded
document. The index field is dead data that can drift from reality with no
validator check. A maintainer editing the song file but not the index gets a
stale-but-harmless number that no longer matches anything rendered.
**Fix:** Either drop `phraseCount` from the index schema, or have `validateSongs`
(or `loadSongs`) assert `index.phraseCount === doc.phrases.length` and surface a
mismatch.

### IN-03: Italian source lines in mini-prueba omit accents (`musica`, `e`)

**File:** `content/songs/mini-prueba.json:19`
**Issue:** `"La musica e bella stasera."` should be `"La música è bella stasera."`
(`musica` → `música`, copula `e` → `è`). The MEMORY note explicitly flags accent
correctness as a recurring defect class ("DeepSeek estricto en acentos"). The
`prompt` is display-only (not graded), so this is not a correctness bug, but it
teaches the learner an incorrect Italian spelling. NFC normalization at load does
not add missing accents.
**Fix:** Correct the prompt to `"La música è bella stasera."` (and audit the
other prompts for the same omission before this becomes a real-content template).

### IN-04: Dead/duplicate fetch of songs.json across main.js and loadSongs

**File:** `src/main.js:88-94` and `src/data/content-loader.js:96`
**Issue:** `main.js` fetches `content/songs.json` to derive `songIds`, then calls
`loadSongs(songIds, ...)`, which fetches `content/songs.json` again internally to
build the lightweight `index`. The index file is fetched twice per boot. This
mirrors the already-acknowledged double-fetch of `categories.json` (commented at
main.js:64-66), so it is a known pattern, but the song duplication is undocumented
here and was avoidable since `loadSongs` already returns `{ songs: index }`.
**Fix:** Have `main.js` derive `knownCategoryIds` and pass `undefined` for
`songIds` (letting `loadSongs` derive them from its single fetch), or have
`loadSongs` accept/return the already-fetched index to eliminate the second round
trip. Performance is explicitly out of v1 scope; flagged only as a maintainability
/ clarity duplication.

### IN-05: `completeSong` builds `catNameById` and reads `this.state.categoryProgress` — logic duplicated from `computeSummaryDelta`

**File:** `src/screens/app.js:2136-2168` vs `src/screens/app.js:2684-2752`
**Issue:** The Block B regression computation in `completeSong` reimplements the
status-before/after + `catNameById` + regression-detection + alphabetical-sort
logic that already lives in `computeSummaryDelta`. The two diverge subtly (song
version only emits regressions; session version emits all touched cats), so they
cannot be merged trivially — but the shared core (`statusBefore/statusAfter`
derivation with `?? 'no-hecha'`, the `isRegression` predicate, the
`localeCompare` sort) is copy-pasted. Any future change to regression semantics
must be made in two places.
**Fix:** Extract a shared helper such as
`detectRegressions(failedCategoryIds, before, after, catNameById)` and call it
from both `completeSong` and `computeSummaryDelta`. Low priority; documented
"duplicación aceptable v1" pattern applies, but this is now a 2nd call-site of the
regression-detection shape.

---

_Reviewed: 2026-06-02_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
