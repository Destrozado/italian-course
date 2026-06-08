---
phase: 26-professioni-a-slots-contenido-lexica
reviewed: 2026-06-09T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/profesiones.json
  - scripts/run-validation-271.mjs
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 1
  info: 3
  total: 4
status: issues_found
---

# Phase 26: Code Review Report

**Reviewed:** 2026-06-09
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 26 converted `content/exercises/profesiones.json` from 51 legacy payload
exercises to 11 slot+variants slots (hybrid: feminización rule-rich with
variants + léxico puro match/comprehension without variants), and synced
hardcoded count values in three test/script files (51→11, TOTAL_EXPECTED
249→209).

**The structural and mechanical integrity is sound.** I verified independently
(not by trusting the diff):

- `profesiones.json` parses cleanly and contains exactly 11 slots; the real
  `validateContent` validator returns `{ok: true, errors: []}`.
- All MC variant surfaces satisfy the schema (prompt contains `___`, 3-4 option
  strings, `correctIndex` in range); all 3 match variants have valid `pairs`
  (2-10 tuples); the word-buttons variant has valid `answer`/`distractors`.
- Zero smart-quotes (`‘’“”`), zero markdown markers in explanations, zero R1
  prompt leaks, zero R2 cross-refs.
- No duplicate options within any MC variant; no duplicate left/right within any
  match column; no distractor==answer collisions in word-buttons.
- Count syncs are **consistent across all three consumers**: reporter
  `expected: 11` + `TOTAL_EXPECTED = 209`; `exercise-types.test.js`
  CATEGORIES_WITH_EXPLANATIONS `profesiones → 11`; `slot-variants-integration`
  REAL_CATEGORIES `profesiones → 11`. The 209 sum reconciles
  (49+34+20+26+12+19+11+31+7 = 209).
- `node --test` on both test files: **154 pass, 0 fail**. Strict gate
  `VAL_07_STRICT=1`: **137 pass, 0 fail**. `node scripts/run-validation-271.mjs`:
  **gate PASS** (VAL-04 + VAL-06 + VAL-08 all green).
- The `profesiones-invariabili` slot carries a historical `incorrecta` pass
  plus an explicit `{by:"autor", verdict:"correcta"}` override. The reporter's
  `effectiveStatus()` relaxes it to `validated` and VAL-04 counts 3 distinct
  `correcta` by-values (opus, sonnet, autor). This is the documented
  gloss-canon / override path (per author memory), not a defect.

No blockers. The findings below are quality/maintainability defects in the
touched files, plus one accuracy concern about the count-sync substrate.

## Warnings

### WR-01: Reporter VAL-06 sub-gate comment contradicts the live constant (271 vs 209)

**File:** `scripts/run-validation-271.mjs:370` (also `:5`, `:13`)
**Issue:** Phase 26 updated `TOTAL_EXPECTED = 209` (line 156) but left load-bearing
comments asserting the old invariant. Line 370 reads
`// VAL-06: 271/271 con effectiveStatus === "validated" Y total real = 271.`
directly above the code that compares against `TOTAL_EXPECTED` (209). Lines 5 and
13 likewise claim "los 271 ejercicios". A future maintainer reading the comment
will believe the gate enforces 271 and may "fix" the constant back, silently
breaking the gate. The comment is the spec next to the code; when they disagree,
the comment actively misleads. The file is in phase-26 scope (the constant edit
landed here), so the stale comment should have been synced in the same change.
**Fix:**
```js
// Line 370 — match the live constant and make it self-updating:
// VAL-06: todos con effectiveStatus === "validated" Y total real === TOTAL_EXPECTED (209).
```
Apply the same 271→209 correction to the header comments on lines 5 and 13.

## Info

### IN-01: Reporter header undercounts the category files (7 vs 9)

**File:** `scripts/run-validation-271.mjs:5`
**Issue:** The header says "Lee los 271 ejercicios distribuidos en los 7 archivos
`content/exercises/*.json`", but the `CATEGORIES` array (lines 144-154) iterates
9 files (preposiciones, articoli, avere, essere, genero-numero, partitivos,
profesiones, sustantivos-irregulares, verbos-movimiento). Pre-existing drift
(predates phase 26), but it sits in a file phase 26 edited and compounds the
WR-01 confusion. Low risk — purely documentary.
**Fix:** Change "7 archivos" → "9 archivos" (or "los archivos") in the header
comment.

### IN-02: Reporter filename and identifiers are frozen at "271", now meaningless

**File:** `scripts/run-validation-271.mjs` (filename), and references at `:34`, `:413`
**Issue:** The script is named `run-validation-271.mjs` and its banner cites the
"Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08)", but the live total
is 209 across what is now a v1.6/Phase-26 codebase. The "271" is now an
arbitrary historical label, not the count. Renaming a script invoked by other
docs/workflows is out of a content phase's scope, so this is INFO not WARNING —
but the divergence between name and behavior is a standing maintainability tax.
**Fix:** Consider renaming to `run-validation-gate.mjs` (with a wrapper or doc
note) in a dedicated cleanup, or at minimum add a one-line header note that "271"
is a legacy name and the live total is `TOTAL_EXPECTED`.

### IN-03: Stale "269 pendientes hoy" comment in the defensive branch

**File:** `scripts/run-validation-271.mjs:237`
**Issue:** `// Esto cubre el estado pre-batch (la mayoría de los 269 pendientes hoy)`
describes a pre-validation snapshot that no longer exists — all 209 exercises are
`validated` (the reporter itself prints 0 pending / 0 missing). The comment
describes a transient historical state as "hoy". Harmless, but it is dead
documentation that misleads about current invariants.
**Fix:** Reword to describe the branch's purpose generically, e.g.
`// Cubre ejercicios sin campo validation o sin passes[] — los cuenta como missing sin crashear.`

---

_Reviewed: 2026-06-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
