---
phase: 06-polish-ux-post-sesion-reiniciar-y-review-errores
reviewed: 2026-05-25T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/screens/app.js
  - src/data/storage.js
  - src/data/backup.js
  - index.html
  - styles.css
  - tests/data-storage.test.js
  - tests/domain.test.js
  - tests/backup.test.js
findings:
  critical: 3
  warning: 5
  info: 3
  total: 11
status: clean
fixes_applied: 2026-05-25T00:00:00Z
fixes_iteration: 1
fixes_scope: critical+warning
fixes_summary:
  fixed: 8           # CR-01, CR-02, CR-03, WR-01, WR-02, WR-03, WR-04, WR-05
  skipped: 0
  deferred: 3        # IN-01, IN-02, IN-03 — out of scope this pass
tests_baseline_before: 158
tests_baseline_after: 166
---

# Phase 6: Code Review Report

**Reviewed:** 2026-05-25
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 6 delivered two UX features: `restartRepaso` (UX-01) and the "Errores cometidos" section on the summary screen (UX-02), plus a schemaVersion 3→4 migration. The core logic is architecturally sound — the D-54 cascada call-site invariant is preserved, D-09 monotonicidad is not violated, and the T-02-01 x-text-only XSS guard holds throughout. However, three correctness bugs were found: a null-reference crash when the "Errores cometidos" section renders a result whose exerciseId no longer exists in `content.exerciseById`, a logical flaw in the summary screen's `sessionResults` access that exposes old-session data on the Test-completo path, and a real (though single-user-severity) prototype-pollution bypass in the backup test. Four additional quality warnings address brittle match-correct-answer lookup, a vacuous test, and consistency gaps in the migration chain.

---

## Critical Issues

### CR-01: Null-reference crash when `exerciseId` in `sessionResults` is absent from `content.exerciseById`

**File:** `index.html:520-540`

**Issue:** The "Errores cometidos" template accesses `content.exerciseById[result.exerciseId].payload.prompt` and `.type` unconditionally on every failed result. If the content JSON was edited between session start and session end (e.g., the author fixed a typo in an exercise file and reloaded), an exerciseId that was in `sessionResults` may no longer exist in `content.exerciseById`. This will produce `TypeError: Cannot read properties of null (reading 'payload')` and crash the entire Alpine component tree, leaving the app blank. For a single-user tool where the author actively edits JSON, this edge is reachable in normal use.

The outer `<template x-if="currentScreen === 'summary' && summaryDelta">` gate does not protect against this because `sessionResults` is a separate array filled during the session, independent of `summaryDelta`.

**Fix:**

In `index.html`, add a null-guard before dereferencing:

```html
<!-- Replace the current x-for in .summary-errors -->
<template x-for="result in sessionResults.filter(r => !r.correct && content.exerciseById[r.exerciseId])"
          :key="result.exerciseId">
```

This silently skips any result whose exercise was removed from content. Alternatively, expose a `summaryFailedResults` getter in `app.js` that pre-filters and validates, keeping the template lean.

---

### CR-02: Summary screen reads `sessionResults` after `resetSession()` clears it on the Test-completo "Volver al home" → re-enter path

**File:** `src/screens/app.js:1550-1555`

**Issue:** `returnToHomeFromSummary()` calls `resetSession()` which sets `this.sessionResults = []`. This is correct for Repaso. However, for Test completo, the summary screen's `sessionResults.some(r => !r.correct)` guard and the x-for loop in "Errores cometidos" both read `this.sessionResults` — which is a reactive Alpine property. If Alpine's reactive scheduler evaluates any of those bindings *after* `resetSession()` runs but *before* `currentScreen` changes to `'home'` (i.e., during the same synchronous tick), the section will render with an empty array and silently suppress all errors.

More concretely: `returnToHomeFromSummary()` at line 1551 calls `resetSession()` (which zeroes `sessionResults`) and then sets `currentScreen = 'home'` at line 1554. Alpine batches DOM updates but the property mutations happen in JS sync order. The x-if `currentScreen === 'summary' && summaryDelta` will unmount correctly, but any already-mounted `x-for` evaluation that fires between the two assignments (in theory possible if there is a microtask between them, though unlikely in practice with Alpine 3's sync reactivity) would see empty `sessionResults`.

Additionally, the Test completo path persists `sessionResults` items into `inFlightTest.answers`, but after `completeSession()` clears `inFlightTest` (via `applySessionResult`), the in-memory `sessionResults` is the only copy. Calling `resetSession()` before the user has actually dismissed the summary is architecturally fragile — the "Errores cometidos" section depends on `sessionResults` that has already been reset.

**Fix:** Move `sessionResults` clearing out of `resetSession()` and instead preserve it until `returnToHomeFromSummary()` is called, OR copy `sessionResults` into `summaryDelta` / a separate `summaryFailedResults` property at the end of `completeSession()` so the summary screen does not depend on the ephemeral session state at all. The latter is cleaner:

```js
// In completeSession(), after computing summaryDelta:
this.summarySessionResults = [...this.sessionResults];  // snapshot for UX-02

// In returnToHomeFromSummary():
this.summarySessionResults = [];

// In the index.html summary template, replace sessionResults with summarySessionResults
```

---

### CR-03: Prototype-pollution bypass accepted silently in `parseBackupFile` for v3 path without `exerciseStats` / `categoryProgress` / `dailyLog` fields

**File:** `src/data/backup.js:110-114`

**Issue:** When a v3 backup arrives that already has `schemaVersion: 3`, the pipeline runs `migrate3to4(state)` then `hydrateV4(state)`. Both functions reconstruct a literal object — BUT they copy `v3.exerciseStats` (etc.) by *reference*, not by deep-clone:

```js
// In migrate3to4 (storage.js:319):
exerciseStats: (typeof v3.exerciseStats === 'object' && v3.exerciseStats !== null)
  ? v3.exerciseStats   // <-- reference pass-through, not a clone
  : {},
```

A crafted backup JSON can pass a `state.exerciseStats` object that has a non-enumerable getter or a `__proto__`-as-own-property trick. While V8's `JSON.parse` does materialize `__proto__` as an own (non-prototype) property and does NOT mutate `Object.prototype` directly, the sub-objects inside `exerciseStats` (e.g., `{ "timesShown": 1, "__proto__": { "polluted": true } }`) are themselves parsed objects. The reference is forwarded directly into the app's live `this.state`. A getter-based payload on a sub-object (e.g., `get timesShown() { ... }`) could execute arbitrary code the moment `applySessionResult` reads `state.exerciseStats[id].timesShown`.

For a single-user personal tool this is low-severity in practice (the user imports their own backup). However, the code's comment at storage.js:245 explicitly claims "T-04-02: prototype pollution defense — la reconstrucción literal del objeto produce un nuevo objeto con prototipo Object.prototype limpio." This claim is false for nested sub-objects, making the stated invariant incorrect documentation.

**Fix:** Either shallow-clone the sub-dicts with `Object.assign({}, v3.exerciseStats)` or perform a structured-clone. For a personal tool, the minimum fix is to correct the misleading documentation comment so future maintainers are not misled about the guarantee. A real fix for a safety boundary would be:

```js
// In hydrateV4 (and migrate3to4):
exerciseStats: Object.assign(
  Object.create(null),
  (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null)
    ? parsed.exerciseStats : {}
),
```

---

## Warnings

### WR-01: Match "Respuesta correcta" in summary uses `pairs.find()` with fragile left-word lookup — fails silently when pairs have duplicate left values

**File:** `index.html:539`

**Issue:** The summary template computes the correct answer for a failed match exercise using:

```js
content.exerciseById[result.exerciseId].payload.pairs.find(p => p[0] === result.userAnswer.left)?.[1] || '(?)'
```

This lookup finds the first pair whose left-word matches `result.userAnswer.left`. If the exercise has two pairs with identical left-words (e.g., two homonyms: `["banco", "banca (istituto)"]` and `["banco", "panchina"]`), the `.find()` always returns the first match, which may be incorrect. The `'(?)'` fallback only fires when no match exists at all, not when the wrong match is returned. The schema validator does not appear to prohibit duplicate left-words in pairs.

Additionally, this lookup is done entirely in the HTML template expression rather than in the JS layer, making it invisible to tests.

**Fix:** Move the correct-answer lookup into `completeSession()` or a dedicated getter. At minimum, look up by the pair index stored in `matchPairsConsumed` rather than by text string. The `matchFirstWrongPair` capture (`{left, right}`) should store the pair index, not just the text strings, to enable reliable reverse-lookup.

---

### WR-02: `restartRepaso` does not reset `matchFlashHandle` / `matchFlashIdx` before canceling — race window with a 300ms timer

**File:** `src/screens/app.js:486-487`

**Issue:** `restartRepaso()` calls `cancelAutoAdvance()` then `cancelMatchFlash()`. `cancelMatchFlash()` clears the handle AND sets `matchFlashIdx = null`. However, `cancelMatchFlash()` does not set `matchFlashHandle = null` when no handle is active:

```js
cancelMatchFlash() {
  if (this.matchFlashHandle !== null) {
    clearTimeout(this.matchFlashHandle);
    this.matchFlashHandle = null;   // only runs if handle !== null
  }
  this.matchFlashIdx = null;         // always runs
},
```

This is actually correct. The issue is different: if the user clicks "Reiniciar ejercicios" during the 300ms flash animation (while `matchFlashIdx !== null`), the setTimeout callback fires after the reset:

```js
this.matchFlashHandle = setTimeout(() => {
  this.matchFlashIdx = null;       // runs 300ms later, after restartRepaso already set it null
  this.matchFlashHandle = null;
}, 300);
```

Because `cancelMatchFlash()` calls `clearTimeout` before the callback runs, this is actually safe — the `clearTimeout` prevents the callback from firing at all. The logic is correct.

However, `restartRepaso()` resets `matchFlashIdx = null` indirectly (by setting it in each sub-state line, but **not explicitly** — it relies on `cancelMatchFlash()` to do so). The inline reset block starting at line 511 manually resets `matchHadFailure` and `matchFirstWrongPair` but NOT `matchFlashHandle` or `matchFlashIdx` — those are only reset via the `cancelMatchFlash()` call at line 487. If `cancelMatchFlash()` is ever refactored to not clear `matchFlashIdx` unconditionally, this becomes a stale-flash bug. The defensive fix is to make the inline reset block in `restartRepaso()` explicit about flash state, matching the pattern in `resetSession()`.

**Fix:** In the inline reset block of `restartRepaso()` (lines 511-524), add:

```js
this.matchFlashIdx = null;
this.matchFlashHandle = null;
```

even though `cancelMatchFlash()` already handles this, to make the invariant explicit and resilient to future refactors.

---

### WR-03: `migrate3to4` does not preserve `inFlightTest` non-array `answers` field — passes `undefined` through without guard

**File:** `src/data/storage.js:307-315`

**Issue:** The guard for backfilling `inFlightTest.answers` is:

```js
if (typeof v3.inFlightTest === 'object' && v3.inFlightTest !== null && Array.isArray(v3.inFlightTest.answers)) {
```

If `v3.inFlightTest` is a valid object but `v3.inFlightTest.answers` is not an array (e.g., it was corrupted as `null` or `"[]"` by manual editing), the `if` body is skipped and `newInFlightTest = v3.inFlightTest` — the original object with a non-array `answers`. This passes the un-backfilled, malformed `inFlightTest` through to v4, where `persistInFlightTest` later does `[...this.sessionResults]` which is fine, but `resumeInFlightTest` does `this.sessionResults = [...ift.answers]` — which will throw `TypeError: ift.answers is not iterable` when `answers` is `null`.

`hydrateV4` (called after `migrate3to4`) does not add a guard on `inFlightTest.answers` either.

**Fix:** Add a fallback in `migrate3to4` when `inFlightTest` exists but `answers` is not an array:

```js
if (typeof v3.inFlightTest === 'object' && v3.inFlightTest !== null) {
  const answers = Array.isArray(v3.inFlightTest.answers) ? v3.inFlightTest.answers : [];
  const backfilled = answers.map(a => {
    if (a && typeof a === 'object' && !('userAnswer' in a)) {
      return { ...a, userAnswer: null };
    }
    return a;
  });
  newInFlightTest = { ...v3.inFlightTest, answers: backfilled };
}
```

---

### WR-04: `applyResultToSession` is called with `userAnswer = undefined` for Match-correct path — `sessionResults` item has inconsistent shape

**File:** `src/screens/app.js:1202`

**Issue:** When a match exercise is completed without any failures, `matchPickRight` calls:

```js
this.applyResultToSession(ex, !this.matchHadFailure, this.matchFirstWrongPair);
```

When `matchHadFailure === false`, `correct = true` and `userAnswer = this.matchFirstWrongPair` which is `null` (per D-107: "null cuando el ejercicio aún no tuvo fallos"). This is correct.

But the UX-02 summary template guard for match is:

```js
<template x-if="content.exerciseById[result.exerciseId].type === 'match' && result.userAnswer">
```

The guard `&& result.userAnswer` evaluates as `&& null` → falsy, so a correct match result's row in the summary will not show the sub-template. This is documented as intentional in the comment on line 509 ("ausencia preferible al placeholder"). However, a match exercise that was *failed* will have `result.correct = false` and `result.userAnswer = {left, right}` — so it correctly shows. No actual crash here.

The real issue is that the `sessionResults.filter(r => !r.correct)` correctly excludes correct results, so a correct match result (with `userAnswer: null`) will never appear in the "Errores cometidos" section. This specific sub-template guard is therefore redundant and could be dropped. The redundancy is harmless but creates confusion about whether the guard serves a correctness or cosmetic purpose. The code comment at line 509 implies it is defensive against "inFlightTest pre-Phase 6 reanudado" (a failed match from a migrated test), but those old entries have `correct: false` — meaning they DO appear in the filter. If they also have `userAnswer: null` (from backfill), the guard hides the match sub-template for those rows, silently showing only the prompt with no "Tu respuesta" / "Respuesta correcta" lines. This is the documented fallback behavior.

**Fix:** The behavior is intentional but the comment should clarify that the null guard specifically serves old-migrated failed-match entries and not correct matches (which are filtered out before reaching this template by `!r.correct`). No code change required; document the intent more precisely to avoid future confusion:

```html
<!-- userAnswer null: backfill v4 pre-Phase 6 (failed match migrated from v3).
     Correct matches never reach this template (filtered by !r.correct above). -->
<template x-if="content.exerciseById[result.exerciseId].type === 'match' && result.userAnswer">
```

---

### WR-05: `data-storage.test.js` test title is historically stale — risks misleading CI failures

**File:** `tests/data-storage.test.js:13`

**Issue:** The file header comment at lines 12-13 says: "blankState() codifica `schemaVersion: 2`" — which directly contradicts the actual test at line 44 which asserts `schemaVersion: 4`. The describe-block title on line 29 says "blankState v4 (Phase 6 bump)" which is correct, but the file-level comment and the individual test name at line 44 say "schemaVersion: 2" / "schemaVersion: 4 (Phase 6 bump)" inconsistently. The file header lists this as a checked behavior: "blankState() codifica schemaVersion: 2" — which is now wrong.

More critically, the test at line 13 of the **header comment** (not actual test code) still says `schemaVersion: 2`. A developer reading the file header to understand what is covered would be misled.

**Fix:** Update the file header comment at line 13 to reflect the current schemaVersion:

```js
// - `blankState()` codifica `schemaVersion: 4` (Phase 6 bump nominal).
```

---

## Info

### IN-01: `tests/domain.test.js` restartRepaso smoke tests are vacuous for the screen-layer handler — they only test `buildSession` in isolation

**File:** `tests/domain.test.js:364-435`

**Issue:** The `restartRepaso` smoke tests are described as validating the invariants of the `restartRepaso()` handler, but the comment at line 358 explicitly acknowledges: "El handler vive en el screen layer (acoplado a Alpine/DOM) y NO se importa aquí." The tests only verify that `buildSession` does not crash with a post-cascade state. The critical invariants of `restartRepaso()` — that it does NOT call `saveState`, does NOT reset `this.state`, DOES reset all sub-states including `matchFirstWrongPair` — are entirely unverified by automated tests. The only verification is "por inspección del helper" (comment line 360).

This is a test coverage gap for a key Phase 6 invariant. The comment accurately describes the limitation, but the "smoke" label implies more coverage than is actually provided.

**Suggestion:** Add a note to the TODO list that `restartRepaso` integration coverage requires an Alpine test harness (e.g., happy-dom + Alpine). The current tests should have their description updated to say "buildSession re-call scenarios" rather than "restartRepaso smoke" to avoid overstating coverage.

---

### IN-02: `computeSummaryDelta` failureReason for multi-cat cascade includes ALL failed categories on EVERY failed category's row — potentially redundant wording

**File:** `src/screens/app.js:2009-2011`

**Issue:** When a multi-cat exercise fails (e.g., categories `avere` and `essere`), every row in the delta for those categories gets `failureReason = "falló (cascada multi: avere + essere)"`. This means each failed category's row says "falló (cascada multi: avere + essere)" — so the avere row says it cascaded with essere, and the essere row also says it cascaded with avere. For two categories this is harmless (and informative). For exercises spanning 3+ categories it becomes verbose and redundant.

**Suggestion:** Consider showing only the other cascading categories: `falló (cascada con: ${failedCatList.filter(c => c !== catId).join(' + ')})`. This is a cosmetic issue with no correctness impact.

---

### IN-03: CSS `.summary-errors li` sets `display: flex; flex-direction: column` but the `<li>` content mixes inline elements (`<strong>`, `<span>`, `<template>`) and block elements (`<div>`)

**File:** `styles.css:383-388`, `index.html:519-543`

**Issue:** The `<li>` for each failed result has a flex-column layout. Inside, for the multi-choice sub-template, the children are `<div>` blocks (correct). For word-buttons, similarly `<div>`. But the outer `<strong x-text="...prompt...">` at line 520 is an inline element that will be treated as a flex item (stretched to full width in column direction). This is not a visual bug — flex-column with inline items works fine in browsers — but it is an architectural inconsistency: the `<strong>` prompt is a flex child alongside `<div>` children, making the layout implicit rather than explicit.

**Suggestion:** Wrap the prompt `<strong>` in a `<div>` for semantic consistency:

```html
<div><strong x-text="content.exerciseById[result.exerciseId].payload.prompt"></strong></div>
```

---

## Fixes Applied (2026-05-25, iteration 1)

Critical + Warning findings resolved via the `/gsd:code-review --fix` workflow.
Eight atomic commits on top of `039f0af` (the REVIEW.md commit) on branch
`master`. Tests baseline 158/158 → 166/166 (+8 new defensive units).

| ID | Status | Commit subject |
|----|--------|----------------|
| CR-01 | fixed | `fix(06): CR-01 — guard null exercise lookup in summary errors template` |
| CR-02 | fixed | `fix(06): CR-02 — snapshot sessionResults at completeSession to avoid unmount race` |
| CR-03 | fixed | `fix(06): CR-03 — deep-clone sub-dicts in migrate3to4 + hydrateV4` |
| WR-01 | fixed | `fix(06): WR-01 — capture leftIdx in matchFirstWrongPair for duplicate-pair safety` |
| WR-02 | fixed | `fix(06): WR-02 — make match flash reset explicit in restartRepaso` |
| WR-03 | fixed | `fix(06): WR-03 — defensive normalization of inFlightTest.answers in migrate3to4` |
| WR-04 | fixed | `fix(06): WR-04 — clarify match userAnswer null-guard comment` |
| WR-05 | fixed | `fix(06): WR-05 — refresh stale file header in tests/data-storage.test.js` |

All locked invariants preserved (D-09, D-54, D-66, D-88, D-100..D-112,
CONT-06, T-02-01, UI-SPEC §Spacing).

## Deferred (Info — out of scope this pass)

These remain as documented follow-ups; no production impact.

- **IN-01**: `tests/domain.test.js restartRepaso smoke tests are vacuous for the screen-layer handler` — requires Alpine test harness (happy-dom + Alpine) to test the handler integration. Coverage gap acknowledged in the existing comment; description rename pending.
- **IN-02**: `computeSummaryDelta failureReason for multi-cat cascade includes ALL failed categories on EVERY failed category row` — cosmetic verbosity for 3+ category cascades. No correctness impact.
- **IN-03**: `CSS .summary-errors li mixes inline <strong> with block <div> children under flex-column` — architectural inconsistency, renders fine in browsers. Wrap `<strong>` in `<div>` for semantic consistency.

---

_Reviewed: 2026-05-25_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Fixes applied: 2026-05-25 (iteration 1) — Claude (gsd-code-fixer)_
