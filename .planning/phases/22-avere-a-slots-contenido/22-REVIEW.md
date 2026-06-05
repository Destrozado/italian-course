---
phase: 22-avere-a-slots-contenido
reviewed: 2026-06-05T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/avere.json
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

# Phase 22: Code Review Report

**Reviewed:** 2026-06-05
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 22 converted `content/exercises/avere.json` from 23 legacy `payload` exercises to 20 `slot+variants[]` entries (37 surfaces total), and synced the three hardcoded `expected` counts plus `TOTAL_EXPECTED` (323→320). I verified the conversion adversarially against every claim in the phase brief:

- **Count-sync correctness — PASS.** `run-validation-271.mjs` line 102 reads `avere: 20`, `TOTAL_EXPECTED` (line 111) is `320`, and the comment arithmetic (lines 88-94) is internally consistent: `323 − 23 + 20 = 320`. The two test fixtures (`exercise-types.test.js:1268` and `slot-variants-integration.test.js:170,172,174,176`) both expect `avere: 20`. The reporter runs green: `VAL-06 (320/320)`, `VAL-08 cero disputed`, `VAL-04 PASS`. Disk total measured = 320, matching expected.
- **JSON structural integrity — PASS.** 20 exercises, all ids unique, valid JSON. No duplicate `options` in any of the 30 multiple-choice variants; every `correctIndex` is in `[0, options.length)`. No smart quotes (`‘’“”`) anywhere in the file. Word-buttons distractors do not overlap their `answer`. Match `pairs` all have length ≥ 2.
- **Multi-cat crosses — PASS.** `avere-300..305` all present with stable ids and exactly 2 `categoryIds` each (`avere` + one of profesiones / sustantivos-irregulares / preposiciones / genero-numero / verbos-movimiento). All referenced category ids exist in `content/categories.json`.
- **Validation passes — PASS.** Every one of the 20 slots carries `validation.passes[]` with ≥2 distinct `correcta` verdicts (`by` distinct). The 14 new surfaces are covered. `avere-ragione` carries a 4-vendor quorum (deepseek-chat, deepseek-reasoner, opus, sonnet).
- **Tests — PASS.** `node --test tests/exercise-types.test.js tests/fixtures/slot-variants-integration.test.js` → 154/154. `VAL_07_STRICT=1` strict gate → 137/137. R1 (prompt leak) and R2 (cross-ref) scans clean across all 37 prompts and 20 explanations.

No blockers found. One warning and three info-level observations follow, all concerning maintainability of the `avere-passato-prossimo` author-override audit trail and surfaces left untested by the changed test files.

## Warnings

### WR-01: `avere-passato-prossimo` written status diverges from the strict `deriveStatus` derivation (audit-trail fragility)

**File:** `content/exercises/avere.json:451-477`
**Issue:** This slot has `validation.status = "validated"` written into the JSON, but `validation.passes[]` contains a `claude-sonnet-4-6` entry with `verdict: "incorrecta"` (line 463). The strict `deriveStatus(passes)` returns `disputed` for this input (any `incorrecta` is sticky per D-VAL-07). The reporter only passes because `effectiveStatus()` in `run-validation-271.mjs:126-133` relaxes `disputed`→`validated` when an `{by:"autor", verdict:"correcta"}` override exists — which it does (lines 469-475).

This is a working, intentional override (the inconsistency warning at `run-validation-271.mjs:226` correctly stays silent because `written === effectiveStatus`). The fragility: the slot's "true" gate-pass depends entirely on the `by:"autor"` entry surviving any future edit. If someone trims the audit trail (removes the author override but leaves the `incorrecta`) while keeping `status:"validated"`, the JSON-level `status` field becomes a lie that the relaxed reporter would silently still accept as validated, while the strict `VAL_07_STRICT` gate (`exercise-types.test.js:1423`, which reads `ex.validation?.status` directly and never calls `deriveStatus`) would *also* pass on the stale written field. The two gates would agree on the wrong answer. The VAL-04 distinct-by count for this slot is exactly 2 (`claude-opus-4-7` + `autor`) — there is no third margin if the author entry is ever questioned.

**Fix:** No content change required for this phase (the override is legitimate and the brief confirms the C5-leak concern is a documented false positive). To harden the audit trail, consider adding a third independent `correcta` pass (e.g. a re-run on a different vendor) so VAL-04 distinctness does not hinge on the single `autor` override entry, and so a strict cross-check (`status` field vs `deriveStatus(passes)` consistency) could be added later without this slot being the lone exception. At minimum, keep the override `concerns` note (lines 472-474) intact — it is the only in-file record of *why* the `incorrecta` is being overridden.

## Info

### IN-01: Strict `VAL_07` gate trusts the written `status` field instead of re-deriving from `passes[]`

**File:** `tests/exercise-types.test.js:1423`
**Issue:** The Phase 10 close-gate test filters on `ex.validation?.status !== 'validated'` — it reads the hand-written `status` string and never re-derives from `passes[]`. This means the strict gate cannot catch a slot where `passes[]` says `disputed` but `status` was manually set to `"validated"` without a legitimate override (the exact failure mode WR-01 describes). The reporter's `effectiveStatus()` is the only place that reconciles the two, and it is not exercised by this test.
**Fix:** Optionally tighten the strict gate to assert `effectiveStatus(ex.validation.passes) === 'validated'` (import the same helper), so written-vs-derived drift fails loudly rather than relying on the reporter being run separately.

### IN-02: Changed test files do not assert the new avere `slot+variants` surfaces directly

**File:** `tests/exercise-types.test.js:1268`, `tests/fixtures/slot-variants-integration.test.js:170`
**Issue:** Both changed test files were touched only to bump the avere count `23→20`. The avere conversion itself (correctIndex correctness, no-dup-options, the 6 multi-cat crosses keeping 2 categoryIds, the 14 new surfaces) is validated transitively by `validateContent` and the explanation/R1/R2 scans, but there is no test that pins the *specific* invariants the brief calls out for this phase (e.g. "avere-300..305 each have exactly 2 categoryIds"). A future edit that drops a cross's second categoryId or duplicates an option would still pass every changed test as long as the shape stays schema-valid and the count stays 20.
**Fix:** Consider a small phase-scoped assertion (e.g. in the integration suite) that the six `avere-30x` slots each have `categoryIds.length === 2` and that `avere` is among them. Low cost, locks the brief's key invariant.

### IN-03: Comment narrative in `run-validation-271.mjs` is a long unverified ledger (maintenance smell)

**File:** `scripts/run-validation-271.mjs:64-94`
**Issue:** The running historical arithmetic (`373 → 370 → 348 → 323 → 320`) is now ~30 lines of hand-maintained prose embedded in a comment. The numbers are correct today (I verified `323 − 23 + 20 = 320` and that 37 surfaces = 23 legacy + 14 new), but the ledger has no test enforcing it; only the `TOTAL_EXPECTED` constant and the per-category `expected` values are machine-checked. Each future conversion appends another paragraph that can silently drift from the constants below it.
**Fix:** Non-blocking. When this grows again, consider moving the historical ledger to a phase doc and keeping the comment to a one-line pointer plus the live `TOTAL_EXPECTED = sum(expected)` invariant (which could itself be asserted at top of the script rather than living only as a comment claim).

---

_Reviewed: 2026-06-05_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
