---
phase: 33-pantallas-de-ejercicio
reviewed: 2026-06-30T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - app.css
  - index.html
  - src/screens/app.js
  - tests/screen-session-editorial.test.js
  - tests/exercise-types.test.js
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 33: Code Review Report

**Reviewed:** 2026-06-30
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Phase 33 repaints the SESSION block of `index.html` to the "Editoriale" language, adds three read-only presentational getters to `src/screens/app.js` (`sessionProgressPercent`, `sessionProgressCounter`, `sessionPromptParts`), and appends ~636 lines of CSS to `app.css`. The engine invariants hold well: no `x-html` directive was introduced (all data still flows through `x-text`), no `--pico-*` tokens were added, the `--ed-*` palette is not re-declared (each base token defined exactly once), and the new getters are genuinely read-only — none mutates state, calls `saveState`, or touches the cascade/sampler. The grading flow (`sessionSelectOption`, `wordButtonsCheck`, `matchPickRight`, `sessionAdvance`) is untouched.

However, there is one BLOCKER: the new gap-fill prompt rendering (`.session-prompt` / `sessionPromptParts`) was designed and tested ONLY for `multiple-choice`, but the `<p class="session-prompt">` block lives in the SHARED session scaffold, so it ALSO renders for `word-buttons` and `match` exercises — both of which carry `___` in the vast majority of their prompts. The result is a visible empty styled slot in the prompt for those two types, with multiple-choice-specific fill logic that never produces text. This is a real, broad presentational regression, not a theoretical edge case.

## Critical Issues

### CR-01: Shared gap-fill prompt renders an empty styled slot for word-buttons and match exercises

**File:** `index.html:448-463` (and getter `src/screens/app.js:2640-2645`; CSS `app.css:834-851`)

**Issue:**
The `<p class="session-prompt">` block that splits the prompt on `___` and intercalates a `.session-gap` slot is placed in the SHARED session scaffold, ABOVE the per-type `<template x-if="...type === 'multiple-choice'">` block. It therefore renders for ALL three exercise types.

The gap-fill text is hardcoded to multiple-choice payload fields:
```html
x-text="sessionFeedback !== null ? (sessionCurrentExercise.payload.options?.[sessionCurrentExercise.payload.correctIndex] ?? '') : ''"
```
- `word-buttons` payload shape is `{prompt, answer, distractors}` — no `options`/`correctIndex`.
- `match` payload shape is `{prompt, pairs}` — no `options`/`correctIndex`.

For both types `payload.options` is `undefined`, so the `?? ''` always yields an empty string. But `.session-gap` has `min-width: 2.2em` plus a `border-bottom`, so the prompt now shows a permanent blank underlined box where the `___` was, and post-correction it turns green-underlined / red-struck-through while remaining EMPTY.

This is not rare. Confirmed against `content/exercises/`:
- word-buttons files with `___` prompts: `essere.json` (46), `avere.json` (32), `verbos-movimiento.json` (54), `presente-regolare.json` (25), `profesiones.json` and more.
- match files with `___` prompts: `articoli.json` (62), `genero-numero.json` (60), `partitivos.json` (48), and more.

Previously (pre-Phase-33) the prompt was a plain `<p x-text="...payload.prompt">`, so the `___` rendered literally as text and word-buttons answers appeared in their own `.wb-answer` area. Now the same prompt gets a duplicate, always-empty gap slot. For match, the `___` is part of the left-column stem and there is no fill at all.

**Fix:**
Scope the gap-fill rendering to multiple-choice only, and render the plain prompt (with literal `___` as text) for the other types. Move the `.session-prompt` gap block INSIDE the multiple-choice `x-if`, and restore a plain serif prompt in the shared scaffold for word-buttons/match:
```html
<!-- Shared scaffold: plain prompt for non-multiple-choice -->
<template x-if="sessionCurrentExercise.type !== 'multiple-choice'">
  <p class="session-prompt" x-text="sessionCurrentExercise.payload.prompt"></p>
</template>

<!-- Inside the multiple-choice x-if block only: -->
<p class="session-prompt">
  <template x-for="(part, idx) in sessionPromptParts" :key="idx">
    ... existing gap-fill markup ...
  </template>
</p>
```
Alternatively, make the gap-fill text type-aware (e.g. word-buttons → `payload.answer.join(' ')`, match → no fill) AND suppress the empty `.session-gap` box when there is nothing to fill. Whichever path is chosen, add a test that asserts `sessionPromptParts` / the rendered gap behaves correctly for word-buttons and match prompts containing `___`.

## Warnings

### WR-01: Multi-gap prompts render a gap after every `___`, filled with the same answer

**File:** `index.html:449-462`

**Issue:**
The inline comment at line 452-453 states the assumption "un único `___` por prompt → un solo slot tras la primera parte". The template does NOT enforce this — it renders a gap after every part except the last (`idx < sessionPromptParts.length - 1`). A prompt with two `___` yields three parts and two gap slots, each filled with the SAME `correctIndex` option.

Two such prompts exist in content:
- `profesiones.json`: `"Una persona che recita in un film o a teatro è un ___ o una ___."`
- `profesiones.json`: `"Una persona che insegna a scuola è un ___ o una ___."`

If these are multiple-choice, both gaps fill with the identical single correct option (likely wrong for the masc/fem pair). If they are word-buttons/match, this compounds CR-01.

**Fix:**
Decide and enforce one behavior. Either guarantee single-gap prompts at the content/validator level (and assert it), or render only the FIRST gap and append remaining parts as plain text. At minimum, do not fill every gap with the same multiple-choice answer when more than one gap exists.

### WR-02: Incorrect multiple-choice fills the gap with the CORRECT answer, struck through in red

**File:** `index.html:460` + `app.css:846-851`

**Issue:**
On an incorrect multiple-choice answer, the gap shows `payload.options[correctIndex]` (the correct answer) with `text-decoration: line-through` in red (`.gap-wrong`). Striking through the correct answer reads as "this is wrong", which is the opposite of its meaning. The user fails, and the prompt then displays the right answer crossed out — easily misread as confirming the failure rather than teaching the correction. The actual correct answer is also (correctly) shown in the `.session-feedback-correct` box below, making the struck-through prompt gap redundant and contradictory.

**Fix:**
Either fill the gap with the user's WRONG selection struck through (and show the correct answer green elsewhere), or do not strike-through the correct answer in the gap on failure. Confirm the intended D-08 semantics; if "show correct answer in gap" is intended, drop the `line-through` for the wrong state.

### WR-03: New getters/markup are untested for the two exercise types they affect

**File:** `tests/screen-session-editorial.test.js:124-174`

**Issue:**
`sessionPromptParts` is only exercised with `multiple-choice` payloads (`makeAppWithPrompt` hardcodes `type: 'multiple-choice'`). The behavioral suite never sets up a word-buttons or match exercise whose prompt contains `___`, so the regression in CR-01 passes the full test suite green (verified: 14/14 pass). The presence-only assertions (`split('___')`, guard shape) do not constrain cross-type rendering.

**Fix:**
Add behavioral cases instantiating the factory with a word-buttons slot (`{prompt:'Io ___ Maria.', answer:[...], distractors:[...]}`) and a match slot (`{prompt:'Il cuoco → la ___.', pairs:[...]}`), and assert the rendered gap/prompt does not produce an empty styled slot. This is the test that would have caught CR-01.

## Info

### IN-01: `sessionProgressCounter` lacks the divide-by-zero-style guard its sibling has

**File:** `src/screens/app.js:2627-2629`

**Issue:**
`sessionProgressPercent` guards `total === 0`, but `sessionProgressCounter` does not — with an empty set it returns `"1/0"`. In practice the enclosing `<template x-if="... && sessionCurrentExercise">` unmounts before this is visible, so it is not user-facing today. Noted for consistency/defense-in-depth, matching the double-defense pattern the JSDoc claims.

**Fix:**
```js
get sessionProgressCounter() {
  const total = this.sessionExerciseIds.length;
  if (total === 0) return '0/0';
  return `${this.sessionCursor + 1}/${total}`;
}
```

### IN-02: Match badge fallback `?? idx` masks lookup failures

**File:** `index.html:733,752`

**Issue:**
`(matchPairsConsumed.find(p => p.leftIdx === idx)?.pairIdx ?? idx) + 1`. The badge is shown via `x-show="matchLeftIsConsumed(idx)"`, so the `find()` should always succeed; the `?? idx` fallback would silently render a plausible-but-wrong number if the invariant ever breaks (e.g. shuffled-index vs canonical-index drift). `?? idx` correctly handles a genuine `pairIdx === 0` (nullish coalescing), so no bug today — but the fallback hides rather than surfaces an impossible state.

**Fix:**
Consider a sentinel (`?? -1` rendering blank) so a broken lookup is visibly absent rather than displaying a misleading number, consistent with the `leftIdx ... -1` defensive pattern documented elsewhere in app.js.

---

_Reviewed: 2026-06-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
