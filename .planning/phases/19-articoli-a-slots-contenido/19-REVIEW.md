---
phase: 19-articoli-a-slots-contenido
reviewed: 2026-06-04T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/articoli.json
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - scripts/run-validation-271.mjs
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 19: Code Review Report

**Reviewed:** 2026-06-04
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the phase-19 conversion of `articoli.json` from 56 legacy `payload` exercises to 34 slot+variants, plus the three count-sync sites. All the hard integrity invariants hold and were verified programmatically:

- Slot count = 34; `payload` residue = 0; slots without top-level `explanation` = 0; variants carrying their own `explanation` = 0 (the `validation` sub-blocks on variants are audit trail, not explanations — correctly distinct).
- The 6 cross-category exercises keep STABLE ids `articoli-300..305` with 2 `categoryIds` each (genero-numero / sustantivos-irregulares); no articoli-only exercise reuses the `30x` range. `clearedExerciseIds` in other categories is not at risk.
- Count sync is internally consistent: all 3 hardcodes = 34, `TOTAL_EXPECTED = 348` (= 370 − 56 + 34). Reporter PASS (348/348), full suite `node --test tests/*.test.js` 128/128 in that file, `VAL_07_STRICT=1` 367/367.
- 0 smart-quotes, 0 markdown markers, 0 R1 prompt-leaks, 0 R2 `#NNN` cross-refs, 0 duplicate ids, all MC `correctIndex` in range with a `___` blank, every article–noun pairing linguistically correct (lo/gli for s-impura/z/ps/gn/x/y-semicons, l'/un' elisions, le/i plurals, irregular `braccia`/`uova` → `le`).
- VAL-04 holds at slot level for all 34 slots (≥2 distinct `by` `correcta`).

Two real defects remain, both Italian-orthography errors in prompts inherited from the 19-01 batch and never re-validated by the cross-vendor quorum (which only ran on the 8 new surfaces in 19-02). Notably, the 19-02 quorum caught exactly this defect class (`piu` → `più`) in a *new* prompt, but the equivalent errors in the carried-over slots slipped through because moved surfaces were explicitly not re-validated.

## Warnings

### WR-01: Missing Italian accent — "E" should be "È" (verb essere) in prompt

**File:** `content/exercises/articoli.json:1241` (slot `articoli-una-invariable`, 3rd variant)
**Issue:** The prompt is `"E ___ studentessa molto brava."`. The leading `E` is meant to be the verb *è* ("es"), which must carry the grave accent: `È`. As written, `E` reads as the conjunction "y/and", making the sentence ungrammatical ("Y una estudiante muy buena"). This is an Italian-orthography error (not a smart-quote: the fix is the accented ASCII-Latin `È`, U+00C8). The same file uses the accent correctly elsewhere (`è grande` line 488, `è spagnola` line 545, `è bellissima` line 565, `Dov'è` line 32, `c'è` lines 345/1145/1221), so this is an internal inconsistency, not a convention. It teaches the learner a malformed Italian sentence in a slot whose whole point is article choice.
**Fix:**
```json
"prompt": "È ___ studentessa molto brava.",
```

### WR-02: Missing Italian accent — "C'e" should be "C'è" in prompt

**File:** `content/exercises/articoli.json:911` (slot `articoli-un-cons`, 2nd variant)
**Issue:** The prompt is `"C'e ___ ragazzo che ti cerca."`. The correct Italian is `C'è` ("hay / there is") with grave accent on the verb *è*. `C'e` is not valid Italian. The same file already writes `c'è` correctly at lines 345 (`In aula c'è`), 1145 (`Nel disegno c'è`) and 1221 (`In soggiorno c'è`), confirming this is an inconsistency to fix, not the house style. This is the exact bug class the 19-02 cross-vendor quorum flagged on a new prompt (`piu` → `più`, per 19-02-SUMMARY Deviation #2); these 19-01 slots were never re-run through the quorum, so it was not caught.
**Fix:**
```json
"prompt": "C'è ___ ragazzo che ti cerca.",
```

## Info

### IN-01: Two distinct provenance shapes for slot-level `validation` may confuse future audits

**File:** `content/exercises/articoli.json` (e.g. slots `articoli-lo-yi:1677`, `articoli-gli-yi:1794` vs the 32 legacy slots)
**Issue:** The 32 slots from 19-01 carry a top-level `validation.passes[]` of 2 entries dated `2026-05-27` (deepseek-v4-flash + claude-opus-4-7), while the 2 new slots from 19-02 carry a 4-entry top-level block dated `2026-06-04` (gemini + deepseek + opus + sonnet), AND those 2 also duplicate a 4-entry block per variant. Per 19-03-SUMMARY (D-19-09), the top-level block on the new slots was synthesized by "elevating" the variant-level quorum to slot level to satisfy `VAL_07_STRICT`. The data passes all gates and the elevation is documented, but the dual shape (2-pass-old vs 4-pass-new, plus variant-level duplication only on new slots) is an inconsistency that a future audit script keying on a uniform shape could trip over. No correctness impact today.
**Fix:** No change required for this phase. If a uniform audit is added later, normalize slot-level `validation` provenance across all 34 slots, or document the two provenance generations explicitly in the slot schema notes.

### IN-02: `run-validation-271.mjs` identity/comment drift (reporter still labelled "271")

**File:** `scripts/run-validation-271.mjs:2,5,311` (and VAL-06 comment `271/271`)
**Issue:** The script name and several comments still say "271" / "los 271 ejercicios", but `TOTAL_EXPECTED` is now 348 and the VAL-06 inline comment at line 311 reads `271/271` while the code correctly compares against `TOTAL_EXPECTED`. The behavior is correct (the comment is stale, not the logic), but the misleading "271" labels accumulate across phases (this is the v1.5 total) and reduce readability of a gate script. Pure documentation drift; no functional defect.
**Fix:** Update the stale `271` references in the header/comments to reference `TOTAL_EXPECTED` (or "el total vigente") so the comment tracks the constant. Optionally rename the file in a later cleanup phase.

---

_Reviewed: 2026-06-04_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
