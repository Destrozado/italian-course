---
phase: 37-verbi-modali
reviewed: 2026-07-01T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - content/exercises/modali.json
  - content/categories.json
findings:
  critical: 0
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 37: Code Review Report

**Reviewed:** 2026-07-01
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the two content JSON files added in Phase 37: `modali.json` (6 exercises covering potere/volere/dovere present indicative + modal+infinitive construction) and the `categories.json` entry for the new `modali` category.

**Overall quality is high.** Both files are well-formed JSON. All 17 correctIndex values point to the right options. Every Italian conjugation is correct (posso/puoi/può/possiamo/possono for potere; voglio/vuoi/vogliono for volere; devo/dobbiamo/devono for dovere). The `può` grave accent (U+00F2) is correct in all four occurrences. Apostrophes throughout are ASCII U+0027. Spanish explanations carry proper RAE accents. The scope-gate is clean — no passato prossimo forms anywhere. All six exercises carry a 2-vendor quorum with `correcta` verdicts. The `modali` category entry in `categories.json` has exactly the three required fields (`id`, `name`, `order`) at order 13, with no duplicate order values.

Two findings surfaced: one WARNING (a factual inaccuracy in the dovere explanation about the number of distinct stems) and one INFO (minor coverage gap — the `voi` person is untested for all three verbs).

---

## Warnings

### WR-01: dovere explanation claims two distinct stems but the verb has three

**File:** `content/exercises/modali.json` — `modali-dovere` exercise, `explanation` field (line 143)

**Issue:** The explanation states "Aquí hay dos raíces distintas: dev- en las personas del singular y en la tercera del plural (devo, devi, deve, devono), y dobb- en la primera del plural (dobbiamo)." This is linguistically inaccurate. The paradigm the explanation itself lists one sentence earlier includes `voi dovete`, which uses a third distinct stem — `dov-` — that is neither `dev-` nor `dobb-`. A student relying on the root analysis to reconstruct `dovete` from scratch would have no basis for it. The correct form `dovete` is present in the paradigm list, so the answer token is not wrong, but the structural rule taught is false.

**Fix:** Replace the two-root claim with one that accurately covers all three stems (or scope it to only the tested persons):

Option A — accurate three-stem description (preferred):
```
Aquí hay tres raíces distintas: dev- en las personas del singular y en la
tercera del plural (devo, devi, deve, devono), dobb- en la primera del plural
(dobbiamo), y dov- en la segunda del plural (dovete). [...]
```

Option B — scope the claim to what is tested in this exercise (if the voi person is intentionally out of scope here):
```
En esta categoría se trabajan las personas que más caen: dev- (singular y
tercera del plural: devo, devi, deve, devono) y dobb- (primera del plural:
dobbiamo). La segunda del plural dovete sigue la raíz dov- y se aborda aparte.
```

---

## Info

### IN-01: voi person untested across all three modal verbs

**File:** `content/exercises/modali.json` — all six exercises

**Issue:** The `voi` person (potete / volete / dovete) does not appear as the correct answer in any variant of any exercise. Coverage across all exercises combined: potere covers io/tu/lui/noi/loro; volere covers io/tu/loro; dovere covers io/noi/loro. `voi` is entirely absent as a tested production target. The forms do appear as distractors (potete appears three times as a distractor in modali-potere), so students see them, but are never asked to select them.

**Note:** This is a content authoring decision and is not labeled a bug. An A1 course may reasonably defer `voi` coverage. It is flagged here for the author's awareness in case it is an unintentional gap rather than a deliberate deferral.

**Fix (if gap is unintentional):** Add one variant per verb with a `voi` subject. Minimum additions:
- `modali-potere`: "Voi ___ uscire adesso? (en español: vosotros podéis)" with `potete` correct.
- `modali-volere`: "Voi ___ mangiare pizza o pasta? (en español: vosotros queréis)" with `volete` correct.
- `modali-dovere`: "Voi ___ studiare per lunedì. (en español: vosotros tenéis que)" with `dovete` correct.

---

_Reviewed: 2026-07-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
