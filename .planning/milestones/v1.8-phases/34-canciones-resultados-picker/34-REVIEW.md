---
phase: 34-canciones-resultados-picker
reviewed: 2026-06-30T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - index.html
  - app.css
  - src/screens/app.js
  - tests/screen-canciones.test.js
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 34: Code Review Report

**Reviewed:** 2026-06-30
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This phase delivers a brownfield visual restyle on four screens (canciones, cancion, summary, picker) plus new presentational getters (`songsForDisplay` extension, `summaryScore`, `pickerSelectedCount`). The engine invariants — cascada D-54, `applyImmediateFailure`, sampler, `localStorage` writes, `startSong`/`completeSession`/`completeSong`/`pickerToggleCategory` — are untouched. T-02-01 (anti-XSS, `x-text` only) is respected throughout all four templates; no `x-html` usage was found.

Three warnings and two info items were identified, all in the new presentational code. No critical/blocker issues.

## Structural Findings (fallow)

No structural findings were provided for this review.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: `songsForDisplay` title split does not guard against an empty left-hand part

**File:** `src/screens/app.js:3102–3115`

**Issue:** The split `(song.title ?? song.id).split('—').map(s => s.trim())` destructures into `[titlePart, artistPart]`. If a title starts with the em-dash (e.g. `"— Caparezza"`) the `titlePart` becomes the empty string `""`. Downstream, `song-cover` renders `titleDisplay.charAt(0)` — which resolves to `""`, producing a blank tile initial. `metaLabel` also becomes `"Caparezza · N huecos"` without a real display title, so the featured card's title and the list row title both render as empty strings. This is a data-authoring bug waiting to happen; a one-line guard would prevent silent breakage.

**Fix:**
```js
const titlePart = parts[0] || (song.title ?? song.id);
```
Or more explicitly:
```js
const [rawTitle, artistPart] = (song.title ?? song.id).split('—').map(s => s.trim());
const titleDisplay = rawTitle || (song.title ?? song.id);
```

---

### WR-02: Progress bar in `cancion` screen divides unconditionally when `sessionExerciseIds.length === 0`

**File:** `index.html:958–961`

**Issue:** The inline `:style` for the progress fill in the `cancion` screen uses:
```js
`width: ${sessionExerciseIds.length ? Math.round(((sessionCursor + 1) / sessionExerciseIds.length) * 100) : 0}%`
```
This is correctly guarded. However, the outer `<template x-if="currentScreen === 'cancion' && songCurrentPhrase">` ensures `songCurrentPhrase` is non-null before the template mounts, which implies `sessionExerciseIds` is non-empty at mount time. But the inline expression is evaluated in Alpine's reactive context for every render tick, including the unmount tick where `sessionExerciseIds` gets reset to `[]` by `returnToSongList → resetSession`. With a zero-length array and `sessionCursor = 0`, the ternary correctly returns 0, so there is no divide-by-zero crash here. However, this differs from the analogous `session` screen, which uses the dedicated getter `sessionProgressPercent` (which has the same guard). The inconsistency means the logic is duplicated inline with a slightly different expression shape: `sessionCursor + 1` vs `Math.round(...)`. If a future phase modifies one, the other may drift.

More concretely: during the mount tick, if `startSong` has populated `sessionExerciseIds` but `songCurrentPhrase` is momentarily null (edge-case of async content load), the outer `x-if` guard prevents the bind from evaluating, so this is not a crash risk. The warning is about the code duplication pattern rather than an immediate bug.

**Fix:** Extract a getter `songProgressPercent` (read-only, parallel to `sessionProgressPercent`) and use it here, or use `sessionProgressPercent` directly since the formula is identical. This removes the duplicated inline math and makes future regressions traceable.

---

### WR-03: `summaryScore` returns `pct: 0` for an empty snapshot, but the conic-gradient ring always renders

**File:** `src/screens/app.js:3135–3139` and `index.html:1070–1072`

**Issue:** `summaryScore` correctly guards against division by zero when `summarySessionResults` is empty, returning `{ correct: 0, total: 0, pct: 0 }`. The `summary` screen is gated by `x-if="currentScreen === 'summary' && summaryDelta"`, so `summaryDelta` being truthy is the mount condition. However, `summaryDelta` is set in `completeSession()` independently of `summarySessionResults` — there is no guard that prevents `completeSession` from being called with an empty `sessionResults` (e.g., if `buildSession` returns an empty pool and the user somehow advances past a zero-exercise session). In that edge case, `summaryDelta` would be a non-null empty array `[]`, the template would mount, and the ring would display `0%` with `0/0 correctos`. While this is a cosmetically degraded state rather than a crash, the `0/0 correctos` text is misleading and the display is visually broken (the ring renders but the denominator reads `0`).

The real protection is that `buildSession`/`buildFullTest` with an empty pool returns `exerciseIds = []`, and `startSession` transitions to `session` — the session advances immediately to `completeSession` the moment `sessionAdvance` is called, which shouldn't happen if there are zero exercises (the session screen has the guard `sessionCurrentExercise` which would be `null`). In practice this path is not reachable in normal use. However, the absence of an explicit guard in `completeSession` or in the template is worth documenting.

**Fix:** Add a guard in the `summary` template or in `summaryScore` to handle `total === 0` distinctly from a real session:
```js
// In summaryScore getter or in the template:
// if total is 0, show "—/—" instead of "0/0"
```
Or alternatively gate the score hero on `summaryScore.total > 0`.

---

## Info

### IN-01: `metaLabel` for a single phrase uses grammatically incorrect "1 huecos"

**File:** `src/screens/app.js:3117`

**Issue:** The `metaLabel` is computed as:
```js
metaLabel: artist ? `${artist} · ${phraseCount} huecos` : `${phraseCount} huecos`
```
When a song has exactly one phrase, this renders as `"1 huecos"` (grammatically incorrect in Spanish — should be `"1 hueco"`). The test at line 488 of the test file explicitly asserts `assert.equal(row.metaLabel, '1 huecos', ...)`, enshrining the grammatically wrong string as correct behavior. This is a single-author personal tool so the impact is minimal, but it is a defect.

**Fix:**
```js
const huecoLabel = phraseCount === 1 ? 'hueco' : 'huecos';
metaLabel: artist ? `${artist} · ${phraseCount} ${huecoLabel}` : `${phraseCount} ${huecoLabel}`
```
Update the test assertion accordingly.

---

### IN-02: Test at line 488 asserts grammatically incorrect Spanish as correct behavior

**File:** `tests/screen-canciones.test.js:488`

**Issue:** The test `assert.equal(row.metaLabel, '1 huecos', 'sin artista → solo "{N} huecos"')` asserts that the meta label for a single-phrase song with no artist is `"1 huecos"`. This locks in the grammatically incorrect behavior described in IN-01. If IN-01 is fixed, this test must be updated simultaneously or it will fail.

**Fix:** Update the assertion to `'1 hueco'` when fixing IN-01.

---

_Reviewed: 2026-06-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
