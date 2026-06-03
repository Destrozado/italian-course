---
phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
reviewed: 2026-06-03T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - src/data/schema-validator.js
  - src/data/content-loader.js
  - src/data/storage.js
  - src/data/backup.js
  - content/exercises/_fixtures/slot-demo.json
  - tests/fixtures/slot-variants.test.js
  - tests/fixtures/slot-variants-integration.test.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-06-03
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Phase 15 adds the slot+variantes data model (validator XOR branch + `normalizeExerciseToSlot` + derived `slotById`) and the nominal `schemaVersion` 5 -> 6 migration with backup round-trip. The highest-risk areas flagged in the brief — the `migrate5to6 -> hydrateV6` chain and the backup version round-trip — are implemented as faithful literal mirrors of the existing v4/v5 links, are pure/idempotent, deep-clone every sub-dict (anti-prototype-pollution), and are well covered by tests. The full suite (110 phase-relevant tests) passes, the 8 legacy categories validate unchanged (SLOT-06 back-compat holds), and the migration is correctly nominal (no progress reset). No data-loss or security defect was found in the migration or backup code.

The defects below are concentrated in the **loader's normalization purity claim** and in **documentation/contract drift**. The most material is WR-01: `normalizeExerciseToSlot` is documented and summarized as "PURA / `exerciseById` byte-idéntico", but on the `variants[]` branch it returns a **shallow** object that shares the `variants` array, every variant object, and the `categoryIds` array by reference with the original exercise. This is a latent corruption vector for Phase 16's engine (which "affects" this phase) if it ever mutates a slot in place (e.g. shuffling option order). It is not a live bug today only because `slotById` has no production consumer yet.

## Warnings

### WR-01: `normalizeExerciseToSlot` variants-branch is a shallow passthrough, not pure — shares mutable references with `exerciseById`

**File:** `src/data/content-loader.js:43-53`
**Issue:** The function's JSDoc states "Función PURA: ... NO muta el argumento ni su payload" and 15-01-SUMMARY claims `exerciseById` stays "byte-idéntico (refs originales)" while `slotById` is a derived sibling. For the legacy branch (lines 55-63) this holds because `variantFromPayload` constructs fresh objects. But the `variants[]` branch returns `{ ..., categoryIds: ex.categoryIds, variants: ex.variants }` — the same array references. Verified empirically:

```
slot.variants    === ex.variants    // true
slot.variants[0] === ex.variants[0] // true
slot.categoryIds === ex.categoryIds // true
```

`slotById[id].variants` and `exerciseById[id].variants` are therefore the **same objects**. The whole point of having a separate `slotById` "sibling" map is contract isolation for the Phase 16 engine. If that engine shuffles options/pairs in place, reorders variants, or otherwise mutates a slot it received from `slotById`, it silently corrupts the canonical `exerciseById` exercise too — breaking the SLOT-06 back-compat invariant that app.js reads `.payload` intact. The existing purity test (`slot-variants.test.js:331`) only exercises the *legacy* branch, so this gap is untested. "Pure (does not mutate input)" and "returns shared mutable references" are different guarantees; the code/docs conflate them.
**Fix:** Either (a) deep-clone the variants branch to make the sibling map truly independent (consistent with the deep-clone defensiveness already used everywhere in storage.js):
```js
if (Array.isArray(ex.variants)) {
  return {
    id: ex.id,
    type: ex.type,
    categoryIds: [...ex.categoryIds],
    explanation: ex.explanation,
    variants: ex.variants.map(v => ({ ...v }))
  };
}
```
or (b) keep the shallow passthrough but correct the JSDoc to state explicitly "returns a shallow view sharing variant/categoryIds references; consumers MUST treat slots as read-only", and add a Phase-16 note. Option (a) is safer given the data-loss class of the risk.

### WR-02: `loadState()` JSDoc and inline comment describe the wrong schema version (v4)

**File:** `src/data/storage.js:75-78` (and the `migrate()` doc at 130-132)
**Issue:** After the v6 bump, `loadState`'s doc-comment still reads: "El estado devuelto SIEMPRE está en el shape v4 (las migraciones 1->2->3->4 corren transparente...)" and the `@returns {{schemaVersion: 4, ...}}` annotation, plus the comment block at lines 30-32 only documents the chain up to 2->3. `migrate()`'s JSDoc (lines 124-136) likewise still describes "Phase 6 (D-111): cadena 1 -> 2 -> 3 -> 4 -> hydrateV4" and claims the dispatcher ends at `hydrateV4`, even though the body now chains through `migrate5to6` and returns `hydrateV6`. For a module whose entire job is correct version migration, stale version contracts in the doc are a real maintenance hazard — the next migrate-author copies a doc that lies about the terminus.
**Fix:** Update the `loadState` JSDoc/return type to v6, extend the top-of-file comment block (lines 27-32) to mention the 4->5 and 5->6 links, and rewrite the `migrate()` JSDoc to describe the actual `... -> migrate5to6 -> hydrateV6` terminus.

### WR-03: Backup version-coupling is duplicated as an inline literal, with no test guarding the two constants stay equal

**File:** `src/data/backup.js:36` vs `src/data/storage.js:35`
**Issue:** `CURRENT_SCHEMA_VERSION = 6` is declared independently in both modules. The deliberate rationale (module testability without importing storage) is reasonable, but there is no test asserting `backup.CURRENT === storage.CURRENT`. The two were bumped together this phase by hand; the next bump can update one and miss the other. The failure is silent and dangerous: if `storage` advances to 7 (state genuinely v7) while `backup` stays 6, `parseBackupFile` would reject every export of the *current* state as "versión más nueva" (lines 106-111) — the user cannot re-import their own backup. `buildBackupWrapper` reads `state.schemaVersion` dynamically, so it would stamp 7 into the wrapper, which `parseBackupFile`'s own forward-compat guard then refuses. Because `CURRENT_SCHEMA_VERSION` is not exported from `storage.js`, a guard test cannot even be written today without exporting it.
**Fix:** Export `CURRENT_SCHEMA_VERSION` from `storage.js` and add a one-line test in `backup.test.js` asserting the inline backup constant equals the storage one (import only for the assertion, keep the inline literal for runtime decoupling if desired). This converts a silent round-trip break into a failing test the moment the two drift.

## Info

### IN-01: A stray `explanation` (or any extra field) inside a `variants[]` entry is silently accepted and carried through

**File:** `src/data/schema-validator.js:215-221`, `src/data/content-loader.js:44-52`
**Issue:** The surface validators check only the known fields; unknown fields in a variant (e.g. an author mistakenly placing `"explanation"` per-variant, which D-15-02 explicitly forbids, or a typo'd field) pass validation. `normalizeExerciseToSlot`'s passthrough then preserves them verbatim in `slotById`. Per the project's authoring memory (R1: "no leak en prompt"), a per-variant `explanation` is dead/duplicated data that the slot model intends to live only at slot level. Not a correctness bug, but the validator is the author's only guardrail (hand-edited JSON), so a forbidden-field warning would catch the exact mistake D-15-02 was written to prevent.
**Fix:** Optionally add an unknown-key check in the surface validators (warn on keys outside the type's allowed set), or at minimum reject a per-variant `explanation` field with a Spanish message pointing the author to slot-level `explanation`.

### IN-02: `hasPayload` accepts an array as a "payload" (arrays are `typeof 'object'`)

**File:** `src/data/schema-validator.js:145`
**Issue:** `const hasPayload = ex.payload && typeof ex.payload === 'object';` is true when `ex.payload` is an array. The XOR routing then sends it down the legacy `validator(ex, ...)` path, which destructures `{prompt, options, ...}` off the array and emits field errors (verified: it produces clear "payload.prompt / payload.options" rejections, no crash). So the failure mode is benign — a malformed `payload: []` is correctly rejected — but the error messages talk about missing prompt/options rather than "payload debe ser objeto, no array", which is slightly less actionable for the hand-editing author.
**Fix:** Low priority. If desired, tighten to `!Array.isArray(ex.payload)` in the `hasPayload` guard and emit a dedicated "payload no puede ser array" message, mirroring the `Array.isArray(variant)` guard at line 216.

### IN-03: NaN-rejection test (ME-02) does not exercise the real code path

**File:** `tests/backup.test.js:301-317`
**Issue:** The test titled "rejects schemaVersion=NaN" never calls `parseBackupFile`; it only asserts `Number.isInteger(NaN) === false` as a "structural smoke" check, with a long comment explaining NaN can't survive `JSON.parse`. That reasoning is sound (JSON has no NaN literal), but the test name promises coverage it does not provide — a reader scanning green checks would believe the NaN path through `parseBackupFile` is verified when it isn't. The integer/lower-bound guard itself (`backup.js:89`) is genuinely covered by the 0 / -1 / 1.5 tests.
**Fix:** Either rename the test to reflect that it's a predicate smoke check (e.g. "ME-02 guard predicate rejects NaN/0.5"), or remove it as redundant given the 0/-1/1.5 cases already prove `Number.isInteger` + lower-bound. Test-only; no production impact.

### IN-04: `loadContent` returns `categoriesRaw.categories` without the `?? []` fallback used five lines earlier

**File:** `src/data/content-loader.js:130-159`
**Issue:** At line 130 the validator is called with `categoriesRaw?.categories ?? []` (defensive). At line 159 the function returns `categoriesRaw.categories` directly. If `content/categories.json` parsed to something without a `categories` array, validation at line 130 would already fail (`'campo "categories" debe ser array'`) and throw before reaching line 159, so this cannot actually return `undefined` in practice. It's a harmless asymmetry, not a live null-deref, but the inconsistency reads as an oversight.
**Fix:** For consistency, return `categoriesRaw.categories ?? []` (or rely on the validated array). Cosmetic.

---

_Reviewed: 2026-06-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
