---
phase: 21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as
reviewed: 2026-06-05T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/data/storage.js
  - src/data/backup.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 21: Code Review Report

**Reviewed:** 2026-06-05T00:00:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Phase 21 adds `migrate8to9` + `hydrateV9` to the localStorage schema-migration chain (bump 8→9) and wires the new link into both the `loadState` dispatcher (`storage.js`) and the backup import pipeline (`backup.js`). The migration resets progress for SIX category prefixes (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) while preserving three (preposiciones, articoli, partitivos).

I reviewed the change adversarially against the stated risk surface: the 6-prefix reset predicate, idempotency/purity, anti-prototype-pollution on the deep-clone, chain wiring, and genuine preservation of the 3 untouched categories.

**Assessment: correctness is sound.** The implementation is a faithful clone of the established `migrate6to7` / `migrate7to8` pattern. The reset predicate is collision-free against the current 9 category slugs (verified against `content/categories.json` and the exercise-id naming convention in `content/exercises/*.json`). Deep-clone via `JSON.parse(JSON.stringify(...))` is applied per sub-dict before any `delete`/filter, so the prototype-pollution defense holds. `delete` of an absent key and a `startsWith` filter that matches nothing are both no-ops, so idempotency and purity hold; the input is never mutated (a fresh root literal is returned). The 112-test suite passes (`node --test`), including dedicated byte-identity assertions for the 3 preserved categories.

No BLOCKER-class defects found. Two WARNING-class robustness/maintainability concerns and three INFO items below.

## Warnings

### WR-01: Bare `startsWith` prefix match has no delimiter boundary — latent false-reset risk for future category slugs

**File:** `src/data/storage.js:868`, `876` (and the constant at `822`)
**Issue:**
The reset predicate matches exercise-id and inFlightTest-id prefixes with a bare `k.startsWith(p)` — no trailing `-` boundary:

```js
if (!RESET_PREFIXES_V9.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
```

This is collision-free **today** (verified: none of `preposiciones`/`articoli`/`partitivos` begins with any of the 6 reset prefixes, and no reset prefix is a prefix of another). But the boundary-free match is a structural fragility, not a present bug:

- A future category slug such as `avere-compuesto`, `essere-passato`, or `profesiones-femeninas` would be silently and wrongly reset, because it `startsWith('avere')` / `startsWith('essere')` / `startsWith('profesiones')`. The same applies to any future *exercise* id under a new category whose slug shares a prefix.
- Because the gate is enforced only by a hand-maintained comment ("verificado contra content/categories.json, 2026-06-05") and not by code, the safety guarantee silently rots the moment a colliding slug is added — and the failure mode is silent data loss (progress reset), exactly the Core Value the system exists to protect.

This is inherited from `migrate6to7`/`migrate7to8`, so it is a pre-existing pattern weakness rather than a Phase-21 regression. Flagging because Phase 21 widens the prefix set to six, materially increasing collision surface for the upcoming Phases 22-27.

**Fix:** Match on a category-id boundary instead of a bare prefix. Exercise ids are `"{slug}-{suffix}"` and category-progress keys are exactly `"{slug}"`, so an exact-or-`{slug}-` test removes the collision class:

```js
function belongsToResetCategory(id) {
  return RESET_PREFIXES_V9.some(p => id === p || id.startsWith(p + '-'));
}
// exerciseStats filter:
if (!belongsToResetCategory(k)) exerciseStats[k] = exerciseStatsAll[k];
// inFlightTest guard:
...exerciseIds.some(id => typeof id === 'string' && belongsToResetCategory(id))
```

Apply the same helper retroactively to `migrate6to7`/`migrate7to8` for consistency. At minimum, add a unit test asserting that a hypothetical `avere-compuesto`/`avereX` slug is NOT reset, to convert the comment-only gate into an enforced one.

### WR-02: `inFlightTest` invalidation inspects only `exerciseIds`, ignoring `categoryIds` — possible stale resume reference

**File:** `src/data/storage.js:873-878`
**Issue:**
The in-flight-test invalidation triggers only when an entry in `inFlightTest.exerciseIds` matches a reset prefix. It never inspects `inFlightTest.categoryIds`. The test fixtures (e.g. `tests/data-storage.test.js:1214-1227`) confirm the intended contract, but they only exercise cases where `categoryIds` and `exerciseIds` agree.

Consider a malformed/partial in-flight blob (manual localStorage edit, or an interrupted write) where `categoryIds: ['avere']` but `exerciseIds: []` or `exerciseIds` is absent/non-array. The `Array.isArray(inFlightTest.exerciseIds)` guard makes the whole condition fall through, so the in-flight test is **preserved** while referencing a category whose slot ids will no longer exist after Phases 22-27 reagrupan los ids. On resume, `slotById[id]` would be `undefined` and the render would crash — the exact "Pitfall 3" this guard claims to defend against (comment at line 871).

This is a narrow, edge-case robustness gap (depends on a desynchronized in-flight blob), so it is a WARNING, not a BLOCKER. It also pre-exists in `migrate6to7`/`migrate7to8`.

**Fix:** Also invalidate when `categoryIds` references a reset prefix, and treat a present-but-malformed `inFlightTest` defensively:

```js
let inFlightTest = v8.inFlightTest;
if (inFlightTest && typeof inFlightTest === 'object') {
  const idsHit = Array.isArray(inFlightTest.exerciseIds) &&
    inFlightTest.exerciseIds.some(id => typeof id === 'string' && belongsToResetCategory(id));
  const catsHit = Array.isArray(inFlightTest.categoryIds) &&
    inFlightTest.categoryIds.some(c => typeof c === 'string' && RESET_PREFIXES_V9.includes(c));
  if (idsHit || catsHit) inFlightTest = undefined;
}
```

## Info

### IN-01: Stale JSDoc — `blankState()` / `loadState()` / `migrate()` still document the post-migration shape as v8

**File:** `src/data/storage.js:66`, `87-88`, `90`, `147`
**Issue:**
The code correctly produces `schemaVersion: 9` (via `CURRENT_SCHEMA_VERSION = 9`), but several JSDoc blocks were not updated for the bump:
- L66: `@returns {{schemaVersion: 8, ...}}` for `blankState()` — should be 9.
- L87-88: "El estado devuelto SIEMPRE está en el shape v8 (las migraciones 1→…→8 corren transparente…)" for `loadState()` — should read v9 / 1→…→9.
- L90: `@returns {{schemaVersion: 8, ...}}` for `loadState()` — should be 9.
- L147: `@returns {object} Estado normalizado en el shape v8.` for `migrate()` — should be v9.

(The v8 references at L44, L701, L755, L771-791, L847 are correct — they legitimately describe v8 as a chain link.)
**Fix:** Update the four locations above from `8` to `9`. Low risk, doc-only, but these are the contract annotations for the public entry points and are now actively misleading.

### IN-02: `RESET_PREFIXES_V9` safety gate is a comment, not an assertion

**File:** `src/data/storage.js:810-822`
**Issue:**
The collision-safety guarantee for the six prefixes is documented as a dated comment ("verificado contra content/categories.json, 2026-06-05"). There is no runtime or test-time check tying `RESET_PREFIXES_V9` to the real category slug set, so the guarantee cannot be mechanically re-verified when content changes. Closely related to WR-01.
**Fix:** Add a test that imports the real `content/categories.json`, asserts each of the 3 preserved slugs is NOT matched by `belongsToResetCategory`, and that each reset prefix corresponds to an actual category id. This makes the gate self-checking against future slug additions.

### IN-03: `parseBackupFile` migration chain is duplicated verbatim from `migrate()`

**File:** `src/data/backup.js:126-134` vs `src/data/storage.js:152-160`
**Issue:**
The 8-line if-ladder dispatching `migrate1to2 → … → migrate8to9` is copy-pasted between `storage.js` `migrate()` and `backup.js` `parseBackupFile()`. Each schema bump (now done 9 times) requires editing both ladders in lockstep; a future contributor adding `migrate9to10` to only one site would produce a silently divergent import-vs-load path. Phase 21 correctly updated both, so no current defect — but the duplication is an accumulating maintenance hazard.
**Fix:** Extract the chain into a single exported `runMigrationChain(state)` in `storage.js` and call it from both `migrate()` and `parseBackupFile()`. The terminal hydrate (`hydrateV9`) and the dispatcher's "unknown version → blankState" branch differ slightly between the two, so factor only the shared ladder.

---

_Reviewed: 2026-06-05T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
