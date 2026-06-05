---
phase: 20-partitivi-a-slots-contenido
reviewed: 2026-06-05T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/partitivos.json
  - scripts/run-validation-271.mjs
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 20: Code Review Report

**Reviewed:** 2026-06-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 20 converted `content/exercises/partitivos.json` from 44 legacy `payload` exercises to 19 `slot+variants[]` entries (50 surface variants total), and synced the count constants (44→19 in three locations: `run-validation-271.mjs` CATEGORIES array, `tests/exercise-types.test.js` CATEGORIES_WITH_EXPLANATIONS, `tests/fixtures/slot-variants-integration.test.js` REAL_CATEGORIES) plus `TOTAL_EXPECTED` (348→323).

**Count-sync correctness: verified clean.** I independently summed all 9 category files (49+34+23+39+40+19+51+31+37 = 323) and confirmed `TOTAL_EXPECTED === 323`. The three hardcoded `expected: 19` constants match the on-disk `data.exercises.length`. The reporter passes all 3 sub-gates (VAL-04/06/08) with 323/323, the full test suite passes (137 tests with `VAL_07_STRICT=1`, 0 fail), and `validateContent` returns `ok:true` with zero errors on the new file.

**JSON structural integrity: verified clean.** All 19 slots have valid `type`/`categoryIds`/`explanation`/`variants` shape; all multiple-choice variant prompts contain `___`; no duplicate options within any variant; all `correctIndex` values are in-range; no R1 prompt-leak, R2 cross-ref, smart-quote, or markdown-marker violations. Each slot derives `validated` with ≥2 distinct `by`. The two `match` slots intentionally carry duplicate right-side values (`del`/`degli`/`delle`) — this is correct and supported by the `consumedPairIdx` grading path (D-66), not a defect.

The defects below are all **documentation/maintainability drift** around the count-sync, not correctness bugs. The authoritative constants are correct; the surrounding prose now actively contradicts them, which is a real hazard for the next person syncing counts.

## Warnings

### WR-01: Reporter header comment and inline comment still claim "271 exercises" / "7 files" — contradicts TOTAL_EXPECTED=323 and 9-entry CATEGORIES array

**File:** `scripts/run-validation-271.mjs:5`, `13`, `318`
**Issue:** The authoritative constant `TOTAL_EXPECTED = 323` (line 104) and the `CATEGORIES` array (9 entries, lines 92-102) are correct, but the file's own documentation contradicts them:
- Line 5: `// Lee los 271 ejercicios distribuidos en los 7 archivos` — wrong count (271→323) AND wrong file count (7→9).
- Line 13: `//   2. VAL-06 — los 271 con validation.status === "validated"` — stale count.
- Line 318: `// VAL-06: 271/271 con effectiveStatus === "validated" Y total real = 271.` — stale count directly above code that uses `TOTAL_EXPECTED`.

This is the exact failure mode count-sync work introduces: the magic number was updated in the constant but not in the comments that explain it. A maintainer reading the header will believe the gate checks 271, then be confused when it reports 323. Phase 20 touched this file's `expected` value and `TOTAL_EXPECTED`, so the stale prose is now in-scope drift.
**Fix:** Update the three comment sites to reflect the current totals (and 9 files):
```js
// Line 5:
// Lee los 323 ejercicios distribuidos en los 9 archivos `content/exercises/*.json`
// Line 13:
//   2. VAL-06 — los 323 con `validation.status === "validated"` (vía el
// Line 318:
// VAL-06: 323/323 con effectiveStatus === "validated" Y total real = 323.
```
Consider also renaming the file from `run-validation-271.mjs` to a count-agnostic name (e.g. `run-validation-gate.mjs`); the `271` in the filename is now misleading and will keep drifting on every content phase. (Filename rename is optional and out of strict count-sync scope, but the embedded `271` is the root cause of this recurring drift.)

### WR-02: Test-file count constants are duplicated across three files with no single source of truth

**File:** `tests/exercise-types.test.js:1265-1276`, `tests/fixtures/slot-variants-integration.test.js:166-176`, `scripts/run-validation-271.mjs:92-102`
**Issue:** The per-category expected counts (e.g. `partitivos: 19`) are hardcoded independently in three separate arrays (`CATEGORIES_WITH_EXPLANATIONS`, `REAL_CATEGORIES`, `CATEGORIES`). Phase 20 had to update all three by hand, and they happen to agree now — but nothing enforces that. A future content phase that updates two of three will produce a green reporter with a red test (or vice versa), and the divergence is silent until a test run. This is the structural reason WR-01 was even possible. The 4th occurrence (`slot-variants-integration.test.js` REAL_CATEGORIES) and the comment "las 9 categorías reales" at line 14/160 of that file are consistent now, but the triplication is a standing trap.
**Fix:** Extract the canonical `{slug, expected}` table to a single shared module (e.g. `content/category-counts.js` or read `data.exercises.length` from disk as the source of truth in tests) and import it in all three consumers. Lower-effort interim: add a cross-check test asserting the three arrays agree, so any future single-site edit fails loudly. Not blocking because all three are currently in sync and verified.

### WR-03: Reporter's historical comment block embeds the full count-derivation math — high-friction to keep correct, and one line is internally inconsistent

**File:** `scripts/run-validation-271.mjs:63-91`
**Issue:** The `CATEGORIES` array is preceded by a ~28-line running history of every total since v1.0 (373→370→348→323). The Phase 20 entry (lines 81-87) is internally correct (`348 − 44 + 19 = 323`), but the block as a whole is now the most error-prone artifact in the file: every future phase must append another paragraph and re-verify the arithmetic by hand. Line 88-89 still says `partitivos ordena entre genero-numero y profesiones` describing alphabetical placement, which is fine, but the surrounding narrative compounds the WR-01 drift risk. The comment asserts facts (`44 ejercicios payload → 17 slots ... + 2 = 19 slots`) that are not enforced anywhere — if someone deletes a slot, the arithmetic comment silently lies while the runtime `expected:19` check catches it.
**Fix:** Trim the historical derivation to a one-line pointer (e.g. `// Count history: see .planning/phases/*/REAGRUPACION-MAP.md`) and keep only the authoritative `expected` values inline. Move the audit narrative to the phase planning docs where it belongs, so the executable file carries only the numbers the code actually reads. Not blocking — the math is currently correct.

## Info

### IN-01: `effectiveStatus` author-override relax path is never exercised by partitivos content (dead-ish branch for this category)

**File:** `scripts/run-validation-271.mjs:119-126`
**Issue:** The `effectiveStatus()` relax (promote `disputed`→`validated` when an `{by:"autor", verdict:"correcta"}` entry exists) only fires when `deriveStatus` returns `disputed`, which requires an `incorrecta` entry in `passes[]`. In partitivos.json the only author entry is on `partitivos-negativa`, whose `passes[]` contains zero `incorrecta` verdicts (all three are `correcta`), so that slot already derives `validated` outright — the relax branch is never taken for any partitivos slot. This is not a bug (the branch is genuinely needed for other categories' disputed-override audit trail), but the `partitivos-negativa` override comment (JSON lines 962-963) frames it as a sticky-disputed override, which no longer matches the actual passes shape (no incorrecta present). Worth a note so a future reader doesn't assume the relax path is what keeps `negativa` green.
**Fix:** No code change required. Optionally clarify the `negativa` concern note to state the override is now redundant for status derivation (3 distinct `correcta`) and survives only as audit-trail documentation of the D-02 pedagogical decision.

### IN-02: `match` variant prompts are not asserted to contain a blank (correct, but asymmetric with multiple-choice)

**File:** `content/exercises/partitivos.json:1048-1073`, `1100-1125`
**Issue:** The two `match` slots use a single-variant `pairs` surface with a descriptive prompt (no `___`), which is correct — the `match` surface validator does not require `___` (only multiple-choice does). No defect. Noting only that the slot+variants conversion correctly preserved the type-appropriate surface shape for match, which is the easy thing to get wrong in a bulk conversion.
**Fix:** None. Behavior is correct.

### IN-03: Several slots have low variant counts (1-2) — acceptable but uneven repetition coverage

**File:** `content/exercises/partitivos.json` — `partitivos-degli-gn` (1 variant, line 585), `partitivos-degli-ps` (1 variant, line 634), plus six 2-variant slots
**Issue:** The two new `suoni speciali` slots (`degli-gn`, `degli-ps`) carry a single variant each. Given the project's core value ("que el sistema te obligue a no olvidar" via repeated re-verification), single-variant slots offer the thinnest repetition surface — a single memorized answer satisfies the slot. This is a content-density observation, not a correctness defect; the conversion preserved the source surfaces 1:1 plus the documented +6, and single-variant slots are explicitly supported (SLOT-03, tested in the fixture).
**Fix:** None required for this phase. Consider authoring 1-2 additional surfaces for the two new special-sound slots in a future content pass if the author finds them under-drilled in practice.

---

_Reviewed: 2026-06-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
