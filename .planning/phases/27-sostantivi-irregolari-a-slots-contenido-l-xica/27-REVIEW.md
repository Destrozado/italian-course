---
phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica
reviewed: 2026-06-09T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/sustantivos-irregulares.json
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - scripts/run-validation-271.mjs
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 27: Code Review Report

**Reviewed:** 2026-06-09
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 27 converts `content/exercises/sustantivos-irregulares.json` from the legacy
`payload` shape to slot+variantes (5 slots, 44 variants) and syncs three count
hardcodes (31 → 5) plus `TOTAL_EXPECTED` (209 → 183). I reviewed the JSON for
structural integrity and content correctness, and verified the three count edits
against the rest of the codebase.

**Adversarial verdict: the implementation holds up.** I attacked the JSON for
structural defects, Italian-grammar errors, R1/R5/R7 authoring-rule violations,
and the count-sync arithmetic for off-by-N errors — and found nothing that
rises to BLOCKER. Concretely verified:

- **Structure (R5):** All 44 variants have `{prompt, options, correctIndex}`;
  every variant has exactly 4 distinct options (case-insensitive); every
  `correctIndex` is in range and points at the grammatically correct Italian
  form. All 5 slots carry a non-empty top-level `explanation`. (Verified by
  script over the parsed JSON.)
- **Content rules:** No smart quotes (only ASCII U+0027, e.g. `Un'età`); no
  markdown markers; no cross-references to other categories
  (`genero-numero`/`articoli`/etc.); no R1 rule/solution leaks in prompts; the
  four `(en español: …)` glosses are R7-canon disambiguation (per author
  memory), not leaks. Italian agreement in the glossed prompts is correct
  (`due ciglia corte`, `sopracciglia folte`, `lenzuola … pulite`,
  `molte miglia`).
- **Count sync:** All three hardcodes = 5 (`exercise-types.test.js:1269`,
  `slot-variants-integration.test.js:171`, `run-validation-271.mjs:166`) and
  `TOTAL_EXPECTED = 183` (`run-validation-271.mjs:170`). Arithmetic
  209 − 31 + 5 = 183 is correct, and the reporter's `totalActual` summed across
  all 9 files equals 183 — confirming no sibling count drifted. The full test
  suite (`exercise-types` 128/128, `slot-variants-integration` 26/26,
  `data-storage` 72/72) and the reporter gate (VAL-04/06/08 PASS, 183/183) all
  pass.

The remaining findings are minor quality/robustness notes, not correctness
defects.

## Warnings

### WR-01: Second `tempio` variant uses two implausible distractors, weakening foil quality

**File:** `content/exercises/sustantivos-irregulares.json:413-420`
**Issue:** Slot `cambio-radice` contains the prompt `"Un tempio, due ___."`
**twice** (variant index 2 at lines 393-400 and variant index 4 at lines
413-420), both with `correctIndex: 1` → `templi`. This duplication is intentional
(the reporter comment at `run-validation-271.mjs:144-145` documents
"duplicado #008==#025 como 2 variantes"). However, the second copy's distractor
set is `["tempi", "templi", "tempios", "templios"]` — `tempios` and `templios`
are both obvious non-Italian forms (Spanish/`-s`-style). With two transparently
wrong options, the learner is effectively choosing between `tempi` (the real
trap: plural of `tempo`) and `templi`, so the 4-option format adds no
discriminative value on this card. The first copy (lines 393-400,
`["tempi", "templi", "tempios", "tempie"]`) is the stronger foil set. Not a
correctness bug — both are valid R5 (4 distinct options, correct answer) — but
the duplicate adds repetition without pedagogical payload.
**Fix:** Either drop the weaker duplicate, or replace one of its dead
distractors with a plausible-but-wrong form so both `tempio` cards exercise a
distinct trap, e.g.:
```json
{
  "prompt": "Un tempio, due ___.",
  "options": ["tempi", "templi", "tempii", "tempie"],
  "correctIndex": 1
}
```
(`tempii` is a plausible-looking over-regularization; `templios` is not.)

## Info

### IN-01: `dii` distractor contradicted by its own explanation phrasing

**File:** `content/exercises/sustantivos-irregulares.json:370` (explanation) / `383-390` (variant)
**Issue:** The `cambio-radice` explanation says "no sigue la regla -o→-i (por eso
'dii' suena mal)", and the `"Un dio, due ___."` variant lists `dii` as a
distractor (option 0). This is internally consistent and intentional (the
explanation pre-empts the trap), so it is not a bug. Flagging only so the author
is aware the explanation names a distractor verbatim — if a future content-rule
ever forbids naming foils in the slot explanation, this card would trip it.
**Fix:** No change required. Leave as-is unless an authoring rule against
naming distractors in explanations is introduced.

### IN-02: `data-storage.test.js` references a stale-shaped exercise id `sustantivos-irregulares-001`

**File:** `tests/data-storage.test.js:1146` (outside this phase's edited set)
**Issue:** A test fixture references `clearedExerciseIds: ['sustantivos-irregulares-001']`,
an id that no longer exists after the slot conversion (the new ids are
`sustantivos-irregulares-sovrabbondanti`, `…-cambio-radice`, etc.). The test
still passes (72/72) because the id is a synthetic localStorage-state value not
cross-checked against the content files, so this is harmless today. Noted
because it is a latent inconsistency: if a future test ever validates
`clearedExerciseIds` against real content ids, this fixture would become a
false failure. This file was not part of Phase 27's scope and was not modified
by the phase.
**Fix:** Optional cleanup — update the fixture id to a real slot id (e.g.
`sustantivos-irregulares-sovrabbondanti`) the next time `data-storage.test.js`
is touched.

---

_Reviewed: 2026-06-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
