---
phase: 23-essere-a-slots-contenido
reviewed: 2026-06-08T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/essere.json
  - scripts/run-validation-271.mjs
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
status: clean
---

# Phase 23: Code Review Report

**Reviewed:** 2026-06-08
**Depth:** standard
**Files Reviewed:** 4
**Status:** clean

## Summary

Phase 23 converted `essere.json` to the slot+variants model (26 slots, 53 variants) and synced the hardcoded Essere count from 39 to 26 across three files, with `TOTAL_EXPECTED` dropping 320 to 307. I reviewed all four files at standard depth, focused on count-sync correctness, JSON structural integrity, stable ids for the cross-category exercises, and whether the test changes were limited to counts (no logic drift).

I adopted a defect-first stance and ran the validator, both test suites, the strict gate, and the reporter to try to break the change. Everything held:

- **Count-sync correctness — verified.** `essere.json` contains exactly 26 slots on disk. All three consumers now hardcode `26`: `run-validation-271.mjs:112`, `exercise-types.test.js:1271`, and `slot-variants-integration.test.js:170`. `TOTAL_EXPECTED` (`run-validation-271.mjs:120`) is `307`, which equals the literal sum of the nine per-category `expected` values (49+34+20+26+40+19+51+31+37 = 307). The reporter's defensive `total !== expected` guard would have caught any drift; it reports PASS with `307/307` and exit 0.
- **JSON structural integrity — verified.** All 26 slots have `variants[]` arrays. Every multiple-choice variant has a `correctIndex` in bounds with no duplicate options; every word-buttons variant has a valid `answer[]` with no distractor/answer overlap. The full content bundle passes `validateContent` (back-compat SLOT-06 test green), and ids are globally unique across all nine category files.
- **Stable ids essere-300..305 — verified.** All six crosses are present with their original ids and correct multi-category `categoryIds` (`essere-300` → essere+avere, `301` → profesiones, `302` → verbos-movimiento, `303` → genero-numero, `304` → sustantivos-irregulares, `305` → preposiciones). Every referenced category resolves against `content/categories.json`.
- **No logic drift in tests/script — verified.** The line-level diff against the phase base shows the only functional changes are the four `39 → 26` edits and the `320 → 307` edit, plus an additive comment block documenting the conversion history. No assertion logic, accessor, or control flow was touched.
- **Test suite — green.** `node --test` on both files: 154/154 pass. Strict gate `VAL_07_STRICT=1`: 137/137 pass. Reporter: gate PASS.
- **Content quality — sound.** No smart quotes (CONT-06 clean). R1/R2 leak scans pass. All third-person-plural items correctly admit only `sono` as the valid option; the passato-prossimo concordance split into four separate slots (stato/stata/stati/state) is internally consistent with each prompt's subject gender/number.

No Critical or Warning findings. Two low-severity Info observations follow; neither blocks the phase.

## Info

### IN-01: Reporter sub-gate labels still say "271" / "v1.1 Phase 10" after the total grew to 307

**File:** `scripts/run-validation-271.mjs:1-9, 257, 334`
**Issue:** The script filename, header banner (`Milestone v1.1 — gate Phase 10`, line 257), and the inline comment for VAL-06 (line 334: `// VAL-06: 271/271 ...`) are frozen at the original 271-exercise milestone, even though `TOTAL_EXPECTED` is now 307 and the file has been edited through Phase 23. The runtime output is correct because the printed strings interpolate `TOTAL_EXPECTED` (lines 340–344), so this is purely stale documentation, not a behavioral defect. It does create a mild traceability smell: a reader grepping for "307" finds the constant but the surrounding prose claims 271.
**Fix:** Optional cosmetic cleanup — update the line 334 comment to `// VAL-06: 307/307 ...` and consider a one-line note in the header that the "271" name is historical. Not worth a rename of the file (would churn invocation docs); leave as-is if churn is undesired.

### IN-02: `essere-passato-prossimo-*` slots carry only a single variant each

**File:** `content/exercises/essere.json:651-797` (slots `-stato`, `-stata`, `-stati`, `-state`)
**Issue:** Each of the four passato-prossimo concordance slots has exactly one variant. This is a deliberate design choice (D-23-03 splits concordance into four separate slots, and a single surface per concordance cell is legitimate), and the slot model explicitly supports 1-variant slots (mirrored by the `slot-demo-spiaggia` fixture). It is flagged only as an observation: thin cells (1 variant) give the repetition engine less material to rotate before a learner memorizes the exact sentence rather than the rule. This is a content-coverage note, not a correctness or structural defect.
**Fix:** No action required for this phase. If the author later notices rote-memorization on these four, add a second surface per cell (the conversion comment already notes +4 passato surfaces were added elsewhere). Tracking only.

---

_Reviewed: 2026-06-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
