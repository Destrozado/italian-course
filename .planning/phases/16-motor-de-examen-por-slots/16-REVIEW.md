---
phase: 16-motor-de-examen-por-slots
reviewed: 2026-06-03T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/domain/session.js
  - src/screens/app.js
  - index.html
  - tests/domain-session.test.js
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 16: Code Review Report

**Reviewed:** 2026-06-03T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the Phase 16 slot-traversal exam engine: `buildSession`/`buildFullTest`
now return `{exerciseIds, variantIndices, actualSize}` parallel arrays, and
`app.js` resolves the chosen variant per cursor via the slot-aware
`sessionCurrentExercise` getter.

**The phase-context invariants all hold under adversarial inspection:**

- **Exactly 2 real `applyImmediateFailure` call-sites** in `app.js` (lines 1519
  and 1745); the other ~10 occurrences are comments/JSDoc/imports (Pitfall #2 OK).
- **No `schemaVersion` bump** — `inFlightTest.variantIndices` rides in the
  existing blob; `src/data/backup.js` schema constants untouched (D-192 OK).
- **Default `variantIndex 0`** for legacy 1-variant slots (`pickVariantIndex`
  `n <= 1 ? 0`) and for legacy `inFlightTest` resume
  (`ift.exerciseIds.map(() => 0)` backfill at app.js:1124) (D-16-10 OK).
- **No array-length mismatch** between `exerciseIds` and `variantIndices`: both
  derive from the same `.map()` over the same shuffled array in both samplers.
- **No XSS surface**: every variant field (`prompt`, `options`, `answer`,
  `pairs`, `explanation`) is rendered via `x-text` only; zero `x-html`/
  `innerHTML` in `index.html` (grep-confirmed lines 584, 832 are comments
  asserting the `x-text`-only rule).
- **`exerciseById` and `slotById` share identical keys** (built in the same
  loop in `content-loader.js:147-155`), so the resume stale-check against
  `exerciseById` (app.js:1105) is valid for `slotById` resolution.
- The live session render path reads `sessionCurrentExercise.payload.*`
  (slot-aware) throughout `index.html`; the summary uses
  `summaryVariantSurface(result)`. No surviving stale `exerciseById[...].payload`
  reads in any render path.

All 14 unit tests in `tests/domain-session.test.js` pass, including the new
Phase 16 slot/variant suite (range checks, alignment, EXAM-01 de-dup, EXAM-04
re-roll, D-16-10 legacy → 0, empty pool).

No BLOCKER-level defects found. Two robustness WARNINGs and three INFO items below.

## Warnings

### WR-01: `pickVariantIndex` lacks the out-of-range clamp its JSDoc claims, and the comment is factually wrong

**File:** `src/domain/session.js:231-234` (JSDoc at 219-222)

**Issue:** The JSDoc states the function "cubre el borde patológico rng()→1.0
(T-16-02) igual que el patrón de `weightedPickOne`." This claim is **false** for
multi-variant slots:

```js
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  return n <= 1 ? 0 : Math.floor(rng() * n);
}
```

The `n <= 1 ? 0` branch only protects the 0/1-variant case. For `n > 1`, if any
injected `rng()` ever returns exactly `1.0`, `Math.floor(1.0 * n)` returns `n` —
an index one past the end of `variants`, producing `undefined` when later
indexed. Unlike `weightedPickOne` (which has an explicit
`return candidates[candidates.length - 1]` float-rounding fallback), this
function has no equivalent guard. It currently survives only because both
`Math.random()` and `seededLcg` are guaranteed `[0, 1)` — so the path is
unreachable today, but the code asserts a protection it does not implement, and
a future non-conforming RNG (or a seam where someone passes `() => 1`) would
silently feed an out-of-range index downstream. (Note: `sessionCurrentExercise`
at app.js:2291 happens to absorb it via `?? slot.variants?.[0] ?? {}`, but the
domain function itself should be self-consistent.)

**Fix:** Clamp defensively and correct the comment:

```js
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  if (n <= 1) return 0;
  return Math.min(n - 1, Math.floor(rng() * n)); // clamp guards rng()===1.0
}
```

### WR-02: Resume path does not validate that a stored `variantIndex` is still in range after a slot's variant count shrinks

**File:** `src/screens/app.js:1100-1124` (`resumeInFlightTest`)

**Issue:** The stale-ID validation (`allRemainingExist`, line 1105) only checks
that each remaining `exerciseId` still exists in `exerciseById`. It does **not**
check that the stored `variantIndices[i]` is still valid for the (possibly
edited) slot. The author edits content JSON by hand between sessions (per
CLAUDE.md the JSON is hand-authored); if a slot that had e.g. 4 variants is
reduced to 2, a persisted `variantIndex` of `3` survives the resume unchanged
(restored verbatim at line 1122-1124). When `sessionCurrentExercise` resolves it,
`slot.variants?.[3] ?? slot.variants?.[0]` silently falls back to **variant 0** —
the user resumes a test showing a *different* surface than was originally chosen,
with no signal. This contradicts the D-16-09 intent ("reanudar muestre la MISMA
variante"). No crash (the `?? variants[0]` fallback prevents a TypeError), so
this is a correctness/UX degradation rather than a BLOCKER.

**Fix:** Either include the variant-range check in the staleness validation, or
clamp on restore. Minimal clamp:

```js
this.sessionVariantIndices = (Array.isArray(ift.variantIndices)
  ? ift.exerciseIds.map((id, i) => {
      const n = this.content.slotById[id]?.variants?.length ?? 1;
      const v = ift.variantIndices[i] ?? 0;
      return v < n ? v : 0; // clamp stale/shrunk index to 0
    })
  : ift.exerciseIds.map(() => 0));
```

## Info

### IN-01: No automated coverage for the resume-path variant backfill / clamp

**File:** `tests/domain-session.test.js` (gap), behavior in `src/screens/app.js:1118-1124`

**Issue:** The phase context explicitly flags "resume path falling back to 0
correctly" as a key risk, yet the legacy-backfill (`ift.exerciseIds.map(() => 0)`)
and the out-of-range fallback live only in `app.js` (the UI layer, intentionally
not unit-tested per the architecture). The domain-level guarantee is tested
(`pickVariantIndex` via `buildSession`), but the resume reconstruction logic — the
exact code the phase context warns about — has zero regression protection. If
WR-02 is fixed by moving clamping into a small pure helper, that helper would be
unit-testable.

**Fix:** Extract the variantIndices reconstruction into a pure helper (e.g.
`reconcileVariantIndices(ift, slotById)`) in `session.js` or a small util module
and add tests for: missing array → all zeros; present array → passthrough;
shrunk-slot index → clamped to 0.

### IN-02: `summaryVariantSurface(result)` is re-invoked many times per error row

**File:** `index.html:755-800`

**Issue:** Each error `<li>` calls `summaryVariantSurface(result)` up to ~7 times
(prompt, three `x-if` type checks, options+correctIndex, explanation x-show +
x-text), and the getter rebuilds a fresh `{ type, payload: {...surface,
explanation} }` object on every call. This is a readability/consistency smell
(the live-session template binds a single cached `sessionCurrentExercise`
getter; the summary re-resolves per binding). Performance is explicitly out of
v1 review scope and the data scale is tiny, so this is INFO only.

**Fix:** No action required for v1. If revisited, resolve once per row into a
local via `<template x-for>` with a computed alias, or precompute a
`summaryErrorRows` getter that maps each failed result to its resolved surface.

### IN-03: Misleading comment in `applyResultToSession` references song path that cannot reach it

**File:** `src/screens/app.js:1505-1514`

**Issue:** The comment block inside `applyResultToSession`'s `if (correct)` branch
documents a `sessionMode === 'cancion'` dispatch to `songAdvance`. However, the
song path uses its own `songCheck` → `applyResultToSession` → and the advance
dispatch at line 1511-1513 (`sessionMode === 'cancion' ? songAdvance : sessionAdvance`)
is correct and live. This is fine — but the adjacent comment at 1494-1497 about
"registrar qué VARIANTE concreta se mostró" applies to song phrases too, where
`sessionCurrentVariantIndex` reads `sessionVariantIndices[cursor]` which is `[]`
for songs (`startSong` never sets it), so every song result records
`variantIndex: 0` via the `?? 0` fallback. That is harmless (songs resolve via
`songPhraseById`, never `summaryVariantSurface`), but the pushed `variantIndex`
field on song results is dead data. Worth a one-line comment noting the field is
inert for `sessionMode === 'cancion'`.

**Fix:** Add a clarifying comment that `variantIndex` in `sessionResults` is only
meaningful for `repaso`/`test-completo`; for `cancion` it is always 0 and unused.

---

_Reviewed: 2026-06-03T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
