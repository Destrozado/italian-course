---
phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7
reviewed: 2026-06-17T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/presente-regolare.json
  - scripts/run-validation-271.mjs
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 4
  info: 4
  total: 8
status: issues_found
---

# Phase 31: Code Review Report

**Reviewed:** 2026-06-17
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 31 adds 4 multi-cat cross exercises (`presente-regolare-300..303`) to `presente-regolare.json` and wires `presente-regolare` into 3 count surfaces (the VAL reporter `CATEGORIES`, the integration back-compat gate, and the explanation-coverage smoke array) plus `TOTAL_EXPECTED`, using a dynamic `slotCountOf`/`readJson` helper instead of a magic number.

The **content is linguistically sound**. I traced all 12 answer keys: the passato-prossimo auxiliary selection (avere for `parlare`/`lavorare`/`dormire`; essere for `partire`/`tornare`/`arrivare`/`entrare`), the essere participle agreement in 301 (`è partito` m-sg, `è tornata` f-sg, `sono arrivati` m-pl, `sono entrate` f-pl), and the presente-vs-passato contrast direction in 302/303 are all correct. Shape is valid: 12 unique IDs, every `correctIndex` in range, `categoryIds` reference existing categories, all 12 carry `validation.status: "validated"` with ≥2 distinct `by`.

The **defects are in the wiring layer**, not the content. The dynamic-count helper is read 3× and runs at module init OUTSIDE the file's own defensive `loadCategory` try/catch, breaking the "NUNCA throws" contract the reporter's header promises. The "coherence guard" the phase added is effectively a tautology and its comment misdescribes what it protects. And the phase touched all 3 count surfaces but only modernized `presente-regolare` to dynamic counting, leaving the 2 known-stale literals (`preposiciones`, `genero-numero`) hardcoded — which is why the suite ships RED.

**Known/expected per phase brief (NOT flagged as new bugs):** VAL-06 FAIL (197/195) from preexisting AJENO count drift in `genero-numero` (13 vs 12) and `preposiciones` (50 vs 49), and the one preexisting genero-numero smoke fail. I verified via git that both drifts predate this phase (`eb31712`, `ea91936`).

## Warnings

### WR-01: Dynamic-count helper crashes the reporter at module init, defeating the documented "NUNCA throws" defensive contract

**File:** `scripts/run-validation-271.mjs:170-171, 180, 194`
**Issue:** The header comment and `loadCategory` (lines 227-245) promise defense-in-depth: "NUNCA throws — el batch debe poder continuar reportando el resto de categorías aunque una esté corrupta." But the new `slotCountOf` runs `JSON.parse(readFileSync(...))` with no try/catch, at module-evaluation time, in three places: the `CATEGORIES` literal (line 180), and twice in the coherence-guard block (line 194). If `presente-regolare.json` is corrupt/unparseable, the reporter throws an uncaught `SyntaxError` and dies BEFORE the defensive per-category loop ever runs — so the other 9 categories are never reported. I reproduced this: corrupting the file produces `SyntaxError ... at slotCountOf (...:171:8)` and aborts the whole run. This is exactly the failure mode `loadCategory` was written to prevent (threat T-10-02-02), now reintroduced for one category.
**Fix:** Compute the slot count once, defensively, and reuse it:
```js
function slotCountOf(file) {
  try {
    return JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8')).exercises.length;
  } catch {
    return null; // signal unreadable; let loadCategory report it in the table
  }
}
// Then in CATEGORIES use the value (or fall back), and in the guard skip the
// assert when the count is null instead of letting JSON.parse throw uncaught.
```

### WR-02: "Coherence guard" is a tautology that cannot fire for the case its comment claims to protect

**File:** `scripts/run-validation-271.mjs:190-203`
**Issue:** The comment states: "Si el JSON de presente-regolare cambia su nº de slots, este assert salta y obliga a revisar el historial." That is false. `TOTAL_EXPECTED` (line 188) already equals `(sum of 9 literals = 183) + slotCountOf(presente-regolare)`. The guard recomputes `TOTAL_EXPECTED_BASELINE = 183 + slotCountOf(presente-regolare)` from the SAME source. If the JSON grows/shrinks, BOTH sides move identically, so `TOTAL_EXPECTED !== TOTAL_EXPECTED_BASELINE` is never true on a slot change — the assert can NEVER fire for the scenario the comment describes. What it actually catches is only a hand-edited drift in one of the 9 literals away from summing to 183 (the `183` constant is itself hardcoded in two places). The guard is misleading: it gives false confidence that slot drift is gated when it is not.
**Fix:** Either delete the guard (it protects nothing the comment claims), or make it actually independent — e.g. assert each literal against its file's real count, or pin the 183 base as `CATEGORIES.filter(c => c.slug !== 'presente-regolare').reduce(...)` and assert that equals a literal `183`. At minimum, correct the comment to describe what it really does.

### WR-03: Phase touched all 3 count surfaces but left 2 known-stale literals hardcoded, so the suite ships RED

**File:** `scripts/run-validation-271.mjs:174,178`; `tests/fixtures/slot-variants-integration.test.js:170,173`; `tests/exercise-types.test.js:1274,1275`
**Issue:** This phase modified every count surface to add `presente-regolare`, and chose dynamic counting (`slotCountOf`/`readJson(...).exercises.length`) for it specifically to avoid magic numbers (D-31-06). But `preposiciones` (literal 49, real 50) and `genero-numero` (literal 12, real 13) were left as magic numbers in the very same arrays the phase was editing. Result: the integration suite has 2 hard failures (`preposiciones: el conteo... (49)` and `genero-numero: ... (12)`), the explanation-coverage smoke has 1 hard failure (`12/12 ... genero-numero`), and the reporter VAL-06 FAILs (197/195). The phase brief flags these drifts as preexisting/out-of-scope, which is fair for the ROOT cause — but the phase had both files open and applied the dynamic fix asymmetrically, leaving the milestone-close suite RED. A reviewer cannot distinguish "intentionally deferred" from "missed" without the brief.
**Fix:** Apply the same dynamic-count treatment the phase used for `presente-regolare` to the other two (or sync the literals to 50/12→13). If deferral is deliberate, add an inline comment at each stale literal (`// KNOWN drift, AJENO to Phase 31, see ...`) so the RED is self-documenting and not mistaken for a regression.

### WR-04: Reporter user-facing labels still hardcode the stale "271" milestone framing

**File:** `scripts/run-validation-271.mjs:340,417,423`
**Issue:** The phase recomputed `TOTAL_EXPECTED` dynamically (good) but left fossilized literals in the operator-facing output and in a load-bearing comment. Line 340 prints the banner `Milestone v1.1 — gate Phase 10`; line 417's comment asserts "VAL-06: 271/271 ... Y total real = 271"; the file is even named `run-validation-271.mjs`. The actual gate is now 195 across 10 categories at the v1.7 close. The mismatch between the dynamic logic and the static "271/v1.1/Phase 10" labels is actively misleading to the author at milestone close — the one moment this script is consulted.
**Fix:** Parameterize the banner/comments off `TOTAL_EXPECTED` and the current milestone, e.g. `Milestone v1.7 — gate (VAL-04 + VAL-06 + VAL-08)` and update the line-417 comment to `${TOTAL_EXPECTED}/${TOTAL_EXPECTED}`. Renaming the file is optional but the in-output strings should not lie.

## Info

### IN-01: `slotCountOf` reads `presente-regolare.json` from disk 3 separate times per run

**File:** `scripts/run-validation-271.mjs:180,194` (helper at 170)
**Issue:** The same file is `readFileSync` + `JSON.parse`-d once in the `CATEGORIES` literal (line 180), then again twice in the guard block (`slotCountOf` at 194 — itself one call, but the guard re-derives a value `loadCategory` will read a 4th time in the main loop). Functionally correct, but it triples the I/O for one category and is the seam that WR-01 exploits.
**Fix:** Read once into a `const PRESENTE_REGOLARE_SLOTS` and reference it everywhere (CATEGORIES entry, guard, total comment).

### IN-02: Two independent `slotCountOf` helpers with diverging path logic across test files

**File:** `tests/exercise-types.test.js:1270-1271` vs `scripts/run-validation-271.mjs:170-171` vs `tests/fixtures/slot-variants-integration.test.js:38-40` (`readJson`)
**Issue:** Three near-identical "read JSON, return `.exercises.length`" helpers now exist with subtly different resolve bases (`__explCountDir/'..'`, `projectRoot`, `projectRoot` via `readJson`). Duplication invites drift — a future path refactor must be applied in 3 places or one silently breaks.
**Fix:** Acceptable for a no-build personal tool, but consider a single shared `scripts/lib/slot-count.mjs` (or `readJson`) imported by all three. Low priority.

### IN-03: Cross exercises silently widen `avere`/`essere` session pools

**File:** `content/exercises/presente-regolare.json:414-417,475-478,547-550,599-602`
**Issue:** `presente-regolare-300..303` declare `categoryIds: ["presente-regolare", "avere"|"essere"]`. Via `buildSession` (`src/domain/session.js:110,124,132`), selecting ONLY `avere` or `essere` now pulls these passato-prossimo crosses into that session's pool and they count toward `avere`/`essere` coverage. This is the intended "cruces multi-cat" feature, not a bug — but it is a behavioral change to the `avere`/`essere` categories that the phase brief frames as "engine not touched." The engine code is untouched; the data-driven behavior of two other categories did change.
**Fix:** No code change. Confirm the author intends `avere`/`essere`-only sessions to surface passato-prossimo-with-participle items; if not, the crosses should be tagged with a dedicated cross category instead of the base ones. Documentation note only.

### IN-04: Smoke `getExplanation`/`getPrompts` shape-bifurcation only checks `variants` truthiness, not slot validity

**File:** `tests/exercise-types.test.js:1295-1301`
**Issue:** `Array.isArray(ex.variants) ? ... : ex.payload?....` correctly routes the new slot-shaped crosses, and the R1/R2/smart-quote scans now cover all variant prompts. No defect — noting that a malformed slot with `variants: []` would yield `getPrompts` = `[]` (scans vacuously pass) and `getExplanation` from top-level still checked, so coverage holds. Confirmed the new crosses pass all 4 editorial scans.
**Fix:** None. Recorded as positive verification of the shape-agnostic path under the new content.

---

_Reviewed: 2026-06-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
