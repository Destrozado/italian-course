---
phase: 24-verbi-di-movimento-a-slots-contenido
reviewed: 2026-06-08T12:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/verbos-movimiento.json
  - scripts/run-validation-271.mjs
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 24: Code Review Report

**Reviewed:** 2026-06-08T12:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 24 converted `content/exercises/verbos-movimiento.json` from the legacy `payload` shape to the slot+variantes shape and synced the hardcoded count references in three consumer files. The core mechanical work is correct and verified:

- **Structural integrity:** JSON parses cleanly; 7 slots (4 `multiple-choice` + 3 `word-buttons`), 57 variants total. Matches the phase intent.
- **Count-sync:** All three count references are 7 (`scripts/run-validation-271.mjs:129`, `tests/exercise-types.test.js:1270`, `tests/fixtures/slot-variants-integration.test.js:170`). `TOTAL_EXPECTED = 277` (run-validation-271.mjs:132) equals the arithmetic sum of all nine `expected` values (49+34+20+26+40+19+51+31+7 = 277). No 37→7 leftover anywhere in scope.
- **Schema validity:** Each slot has a top-level non-empty `explanation` (SLOT-02 satisfied), every variant is a flat surface valid for its `type`, and `validateContent` accepts the file (`schema-validator.js` `validateVariants` path).
- **Runtime grading path:** `sessionCurrentExercise` (app.js:2282) re-wraps each variant surface into `{ payload: {...surface, explanation} }`, so `wordButtons.grade(ex, …)` (which reads `ex.payload.answer`) and the multiple-choice handler operate correctly on the converted slots. Conversion is playable end-to-end.
- **Italian content:** All 44 multiple-choice `correctIndex` values and 3 word-buttons answers/distractors were traced individually and are grammatically and pedagogically correct (essere vs avere auxiliary selection, participle gender/number agreement, the correre/volare destino-alternation slot, and the avere-exception activities). No double-valid distractors detected. Word-buttons have no answer/distractor overlap and no duplicate tokens.
- **Tests:** `node --test tests/exercise-types.test.js tests/fixtures/slot-variants-integration.test.js` → 154 pass, 0 fail.

No blockers. Two warnings (one a real process/audit-trail defect, one a robustness gap in the reporter) and two info items.

## Warnings

### WR-01: `validation.passes` metadata predates the variants it claims to validate (stale audit trail)

**File:** `content/exercises/verbos-movimiento.json:115-131, 220-236, 295-311, 355-371, 385-401, 415-431, 445-461`
**Issue:** Every slot's `validation.passes[]` entries are dated `2026-05-27` with `status: "validated"`, but the Phase 24 commits that added the new variants are dated `2026-06-08` (e.g. `5b7b400 feat(24-02): add concordancia variant (partite, fem pl)`, `2fb4e65 ... (sceso, masc sg)`, `c0238f2 ... (correre con destino, Anna)`). The recorded quorum passes therefore never reviewed the newly-added surfaces (`sceso`, `salita`, `corsa`, `partite`, `venuti`, `sciato`, `passeggiato`, the volare/correre destino variants, etc.). The slot-level `validated` status now asserts a quorum that did not see ~half the variants.

This is the exact risk the project's own validation gate exists to catch: `run-validation-271.mjs` and the `VAL_07_STRICT` smoke test treat `status: "validated"` as ground truth, but at the slot granularity that status no longer corresponds to a quorum over the actual content. The content happens to be correct (verified manually in this review), so this is not a content bug — but the audit trail is misleading and would mask a genuine error in any future variant added the same way.

**Fix:** Re-run the cross-vendor quorum (Opus + Sonnet, per `memory/multi_vendor_quorum_validator.md`) over the expanded slots and update each affected slot's `validation.passes[]` with current-dated entries (or add a fresh pass dated `2026-06-08`). At minimum, document the decision that slot-level validation covers only the originally-validated variant set if that is the intended semantics. Example for the `concordanza` slot:
```json
"passes": [
  { "by": "claude-opus-4-7",  "date": "2026-06-08", "verdict": "correcta", "concerns": [] },
  { "by": "claude-sonnet-4-6", "date": "2026-06-08", "verdict": "correcta", "concerns": [] }
]
```

### WR-02: `run-validation-271.mjs` reports `total: 0` for a category that fails to load, silently understating the true count

**File:** `scripts/run-validation-271.mjs:182-199, 341-350`
**Issue:** When `loadCategory` fails (unreadable/corrupt JSON), the category is pushed with `total: 0` and `loadError` set. `totalActual` (line 341) sums `r.total`, so a corrupt `verbos-movimiento.json` contributes 0 to the total. The VAL-06 gate (line 347-350) does include `!anyLoadError` so the gate still fails correctly — but the printed diagnostic (`totalActual`) understates the real disk count, and the per-category `Total ≠ esperado` warning (line 331) is suppressed for the failed file because the loop `continue`s at line 306 before reaching it. A reviewer reading the table could conclude the file is simply missing exercises rather than unparseable. This is a robustness/diagnostics gap, not a correctness bug in the gate itself.
**Fix:** This is pre-existing reporter behavior, not introduced by Phase 24, but worth noting since this phase touches the file. Consider emitting the expected count alongside the load error so the table line reads, e.g., `verbos-movimiento | ERROR DE CARGA (esperado 7)`. No change required for this phase to ship.

## Info

### IN-01: Massive comment block in `run-validation-271.mjs` is becoming a maintenance liability

**File:** `scripts/run-validation-271.mjs:63-119`
**Issue:** The `CATEGORIES` const is preceded by ~57 lines of historical narrative tracking every total since 373 (`373 → 370 → 348 → 323 → 320 → 307 → 277`). It is accurate and the Phase 24 entry (lines 104-115) is correctly appended, but the block now dwarfs the code it documents and duplicates information that lives in the planning artifacts. Each phase appends another paragraph. Risk: future edits update the `expected: 7` value but forget the prose, leaving contradictory documentation in the same file.
**Fix:** Consider trimming to the current totals and a one-line pointer to the phase history in `.planning/`. Low priority — purely a readability concern.

### IN-02: Script filename and gate labels still reference "271" / "milestone v1.1" while the actual total is 277 and content is at v1.6

**File:** `scripts/run-validation-271.mjs:1-7, 132, 269, 346, 386-391`
**Issue:** The file is named `run-validation-271.mjs` and the header/output strings say "Milestone v1.1 — gate Phase 10" and "271 ejercicios", but `TOTAL_EXPECTED` is now 277 and the comment history shows content has moved through v1.6 / Phase 24. The hardcoded `271` literals in the VAL-06 prose (header line 6, the `271/271` framing) are stale relative to the live `TOTAL_EXPECTED = 277` constant the gate actually enforces. The gate logic is correct (it uses the constant, not the literal), so this is cosmetic, but the mismatch is confusing and the filename no longer reflects reality.
**Fix:** Update the header comment and the `Milestone v1.1` / `271` string literals to track `TOTAL_EXPECTED`, or interpolate the constant into the header text. Renaming the file is out of scope for this phase. Cosmetic only.

---

_Reviewed: 2026-06-08T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
