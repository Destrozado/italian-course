---
phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
reviewed: 2026-08-03T10:53:57Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/data/storage.js
  - src/data/backup.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 2
  warning: 6
  info: 1
  total: 9
status: issues_found
---

# Phase 40: Code Review Report

**Reviewed:** 2026-08-03T10:53:57Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Scope reviewed: the `12 → 13` migration link (`git diff bf57840^..HEAD`) — `RESET_PREFIXES_V13`,
`migrate12to13`, `hydrateV13`, both `CURRENT_SCHEMA_VERSION` bumps, the two dispatcher wirings, and
the 25 new tests. Judged against the `migrate11to12` / `hydrateV12` / `RESET_PREFIXES_V12` analog at
`src/data/storage.js:1155-1295`.

**What is correct.** The reset logic itself is sound and I could not break it. The prefix-collision
gate (D-40-03) is verified true against the live registry: I parsed `content/categories.json` and
none of the 14 registered slugs collides with any of the 4 `fare` prefixes in either direction. The
4 slugs match `REQUIREMENTS.md` byte for byte, including the `cond` abbreviation. `migrate12to13` is
genuinely pure (I confirmed the input `v12` retains its 4 slugs after the call) and genuinely
idempotent. The dispatcher wiring has no fall-through hole: `storage.js:152-169` handles every
integer 1-13 and `backup.js:114-119` rejects everything outside `[1, CURRENT]` before the chain
runs, so `backup.js`'s unconditional trailing `hydrateV13` can never receive an unmigrated blob.
`hydrateV13` correctly does *not* re-run the prune. The two constants agree at 13. 697/697 tests pass.

**What is wrong.** The one security class named as in-scope — prototype pollution — is the one that
is actually broken, and the phase's own tests assert around it rather than at it. The load-bearing
claim repeated in both new docblocks, that `JSON.parse(JSON.stringify(...))` "neutraliza … `__proto__`
como own-property", is **empirically false**: a JSON round-trip *preserves* an own `__proto__` key,
because `JSON.stringify` serialises it as an ordinary own-enumerable property. I verified this
directly against the shipped code, not by inspection. Two consequences follow (CR-01, CR-02), and
both of the new anti-pollution tests pass on the defective code because they assert the wrong
predicate (WR-02).

Secondary: one dead import was introduced by this diff (WR-04), `inFlightTest` is the single
sub-object that escapes the clone defense and that escape now has a live crash path (WR-03), and the
`typeof === 'object'` guard admits arrays — the exact case the new "corrupto cae a `{}`" test omits
(WR-05).

Note on inheritance: CR-01, CR-02, WR-03 and WR-05 are all faithful reproductions of the
`migrate11to12` / `hydrateV12` analog, and by the phase's own rule that is not a deviation. They are
reported anyway because the review brief explicitly asks whether the deep-clone defense is "intact
and complete in the NEW code" and whether "any attacker-controlled key survives". The fix for each is
a one-liner that should be applied family-wide, not just at link 13.

## Critical Issues

### CR-01: Untrusted `__proto__` own-property survives `hydrateV13` into live state

**File:** `src/data/storage.js:1459-1479` (`hydrateV13`), reached via `src/data/backup.js:152`

**Issue:** The deep-clone defense does not do what its docblock claims. `JSON.stringify` emits an own
`__proto__` key as an ordinary property, and `JSON.parse` re-creates it as an own property, so the
round-trip is a **no-op** against this input:

```js
const src = JSON.parse('{"__proto__":{"polluted":true},"a":1}');
JSON.stringify(src);                                              // '{"__proto__":{"polluted":true},"a":1}'
Object.prototype.hasOwnProperty.call(JSON.parse(JSON.stringify(src)), '__proto__');  // true
```

For a backup whose `state.schemaVersion` is already 13 — the ordinary case from here on, since the
user's own exports are v13 — `migrate12to13` never runs and `hydrateV13` is the *only* code that
touches the payload. Verified end to end against `parseBackupFile`:

```js
const w13 = '{"kind":"italian-course-backup","exportedAt":"x","schemaVersion":13,"state":{"schemaVersion":13,"exerciseStats":{"__proto__":{"polluted":true},"x":{"n":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}}';
const r = parseBackupFile(w13);
r.ok;                                                                       // true
Object.prototype.hasOwnProperty.call(r.state.exerciseStats, '__proto__');   // true  ← reaches live state
r.summary.exercises;                                                        // 2 instead of 1
```

The attacker-controlled key is then written to `localStorage` by `saveState`, and survives every
subsequent `loadState` (schemaVersion 13 → `hydrateV13` again → preserved again). It detonates at the
next migration link: every prune loop in this file — `migrate6to7`, `migrate7to8`, `migrate8to9`,
`migrate10to11`, `migrate11to12`, `migrate12to13` — is a plain `out[k] = …` assignment, which invokes
the `__proto__` setter (see CR-02). So a `13 → 14` link written to the established pattern converts
this dormant key into a live prototype poisoning of the user's `exerciseStats`, with no code change
at that link that would look suspicious in review.

**Fix:** Strip the key in a shared helper and use it for every sub-dict in both `migrate12to13` and
`hydrateV13` (ideally applied to the whole family):

```js
/** Deep-clone + drop `__proto__` as own-property. JSON round-trip alone does NOT
 *  drop it — stringify serialises it as an ordinary own-enumerable key. */
function cloneDict(x) {
  if (typeof x !== 'object' || x === null || Array.isArray(x)) return {};
  const out = {};
  for (const [k, v] of Object.entries(JSON.parse(JSON.stringify(x)))) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    Object.defineProperty(out, k, { value: v, writable: true, enumerable: true, configurable: true });
  }
  return out;
}

// hydrateV13:
exerciseStats: cloneDict(p.exerciseStats),
categoryProgress: cloneDict(p.categoryProgress),
dailyLog: cloneDict(p.dailyLog),
songProgress: cloneDict(p.songProgress),
```

### CR-02: `migrate12to13`'s prune loop converts `__proto__` into a prototype assignment, injecting enumeration-invisible stats

**File:** `src/data/storage.js:1406-1409`

**Issue:** Step (2) rebuilds `exerciseStats` with a bare assignment:

```js
const exerciseStats = {};
for (const k of Object.keys(exerciseStatsAll)) {
  if (!RESET_PREFIXES_V13.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
}
```

`'__proto__'.startsWith(...)` is false for all four prefixes, so the key reaches the assignment — and
`exerciseStats['__proto__'] = value` does **not** create a property; it invokes the inherited
`__proto__` setter and re-parents the freshly built object onto the attacker's object. Verified on
the shipped code:

```js
const mal = JSON.parse('{"schemaVersion":12,"exerciseStats":{"__proto__":{"avere-001":{"timesShown":999999},"polluted":true},"preposiciones-001":{"timesShown":1}},"categoryProgress":{},"dailyLog":{},"songProgress":{},"lastBackupAt":null,"firstUsedAt":null}');
const out = migrate12to13(mal);
Object.getPrototypeOf(out.exerciseStats) === Object.prototype;  // false  ← re-parented
out.exerciseStats.polluted;                                     // true
out.exerciseStats['avere-001'];                                 // { timesShown: 999999 }  ← phantom entry
Object.keys(out.exerciseStats);                                 // [ 'preposiciones-001' ]  ← invisible to enumeration
```

The returned dict now answers `exerciseStats[id]` lookups with attacker-supplied stats for arbitrary
ids while `Object.keys` reports them as absent — precisely the discrepancy that makes this class of
bug hard to diagnose from the UI. `migrate12to13`'s docblock (line 1385) promises the opposite:
"reconstruye un root literal fresco". The root *is* fresh; the sub-dict is not.

Mitigating factor, stated honestly: both production callers currently pass the result straight into
`hydrateV13`, whose `JSON.stringify` serialises own-enumerable properties only and therefore drops the
inherited ones (I confirmed the v12-wrapper import path emits a clean `exerciseStats`). So this does
not corrupt live state *today*. It is classified BLOCKER because the exported function violates its
own documented contract, the containment depends entirely on hydrate happening to run last, and CR-01
supplies the input that makes it fire.

**Fix:** Skip the key in the loop (and adopt `cloneDict` from CR-01 for the clone itself):

```js
for (const k of Object.keys(exerciseStatsAll)) {
  if (k === '__proto__') continue;                     // assignment would re-parent, not add a key
  if (!RESET_PREFIXES_V13.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
}
```

## Warnings

### WR-01: Both new docblocks assert a security property the code does not have

**File:** `src/data/storage.js:1383-1385`, `src/data/storage.js:1452`

**Issue:** Newly written in this phase: "el `JSON.parse(JSON.stringify(...))` por sub-dict neutraliza
getters / `__proto__` como own-property de un backup importado". Neither half holds. `__proto__` as an
own property survives the round-trip untouched (proof in CR-01). And `JSON.stringify` does not
"neutralise" getters — it *invokes* them and serialises the result; the reason getters are a non-issue
here is unrelated (every input reaching these functions is already `JSON.parse` output, which has no
accessors). This is not cosmetic: the comment is the reason the defect passed authoring and review,
and it is duplicated verbatim down the whole migration family.

**Fix:** Correct the claim to describe what the round-trip actually buys (drops functions/`undefined`,
flattens non-`Object.prototype` prototype chains of *nested* values) and state explicitly that
`__proto__` as an own key requires a separate filter — referencing `cloneDict` once CR-01 lands.

### WR-02: The two new anti-prototype-pollution tests are tautological — they pass on the defective code

**File:** `tests/data-storage.test.js` (`migrate12to13 anti-prototype-pollution…` and `hydrateV13
anti-prototype-pollution…`)

**Issue:** Both tests build exactly the right malicious fixture and then assert the wrong predicate:

```js
assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
assert.equal(v13.schemaVersion, 13);
```

`({}).polluted` is `undefined` for *any* implementation that avoids `Object.assign` / a `Set` on a
pre-existing object — including one that copies every sub-dict straight through by reference.
`JSON.parse` never pollutes the global prototype, so the assertion can only fail if the code is
rewritten to use `Object.assign`. The proof that these tests are non-load-bearing is that they pass
right now while `migrate12to13(malicious).exerciseStats.polluted === true` (CR-02) and while
`hydrateV13`'s output carries an own `__proto__` key (CR-01). The suite is at 697/697 and detects
neither.

**Fix:** Assert on the *output object*, not on the global:

```js
const v13 = migrate12to13(malicious);
assert.equal(({}).polluted, undefined, 'el prototipo global Object no debe quedar contaminado');
assert.equal(Object.getPrototypeOf(v13.exerciseStats), Object.prototype,
  'el sub-dict devuelto NO debe quedar re-parentado por un __proto__ own-property');
assert.equal(v13.exerciseStats.polluted, undefined,
  'ninguna propiedad del atacante debe ser visible por lookup');
assert.equal(Object.prototype.hasOwnProperty.call(v13.exerciseStats, '__proto__'), false,
  'la clave __proto__ no debe sobrevivir al clone');
// idem para categoryProgress / dailyLog / songProgress, y el mismo bloque para hydrateV13.
```

### WR-03: `inFlightTest` is copied by reference and never shape-validated on the v13 path — live `TypeError` on resume

**File:** `src/data/storage.js:1413` and `src/data/storage.js:1477`

**Issue:** `inFlightTest` is the only sub-object in the new code that is not cloned. Confirmed:
`migrate12to13(x).inFlightTest === x.inFlightTest`, and `hydrateV13` passes `p.inFlightTest` straight
through, so the reference from `JSON.parse` of untrusted input reaches live state unaltered.

The aliasing alone is minor. The reachable defect is the missing shape guard. `migrate3to4`
(lines 328-351) carries an explicit prior fix for exactly this — normalising a non-array
`answers` to `[]` because "más tarde `resumeInFlightTest()` hacía `[...ift.answers]` y crasheaba" —
but a backup imported at `schemaVersion: 13` skips `migrate3to4` entirely and no later link
re-applies it. Verified: `hydrateV13` returns `inFlightTest.answers` verbatim, and
`src/screens/app.js:1357` does `this.sessionResults = [...ift.answers]` → `TypeError: null is not
iterable` for `answers: null`. `src/screens/app.js:1328` (`ift.exerciseIds.slice(ift.cursor)`) has the
same exposure for a non-array `exerciseIds`. The v3→v4 fix has been silently outgrown by the chain.

**Fix:** Give `hydrateV13` the same normalisation the v3→v4 link already documents, so it applies at
whatever version the blob enters at:

```js
let inFlightTest = p.inFlightTest;
if (inFlightTest && typeof inFlightTest === 'object') {
  inFlightTest = {
    ...JSON.parse(JSON.stringify(inFlightTest)),
    answers:     Array.isArray(inFlightTest.answers)     ? inFlightTest.answers     : [],
    exerciseIds: Array.isArray(inFlightTest.exerciseIds) ? inFlightTest.exerciseIds : []
  };
} else {
  inFlightTest = undefined;
}
```

### WR-04: Dead import `hydrateV12` introduced by this diff

**File:** `src/data/backup.js:26`

**Issue:** This phase replaced `migrated = hydrateV12(migrated)` with `hydrateV13` at line 152 but left
`hydrateV12` in the import list. It now has zero call sites in `backup.js` (verified by grep across
`src/`). The same omission at the four preceding links has accumulated `hydrateV7`, `hydrateV8`,
`hydrateV9` and `hydrateV11` as dead names — this commit makes it five. With no bundler and no linter
in the stack (per CLAUDE.md, deliberately), nothing will ever flag these.

**Fix:** Drop `hydrateV12` from the import (and, as cleanup, the four already-dead names):

```js
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7,
         migrate7to8, migrate8to9, migrate9to10, migrate10to11, migrate11to12,
         migrate12to13, hydrateV13 } from './storage.js';
```

### WR-05: Array sub-dicts defeat the `typeof === 'object'` guard, and the new "corrupto cae a {}" test omits that case

**File:** `src/data/storage.js:1394-1396`, `1403-1405`, `1424-1429`, `1466-1474`; test at
`tests/data-storage.test.js` (`migrate12to13 con sub-dict no-objeto (corrupto) cae a {}`)

**Issue:** The new test iterates `for (const bad of [null, 'x', 42])` and asserts each sub-dict falls
back to `{}`. Those three are exactly the values the guard already rejects. The one JSON-reachable
value that *defeats* the guard — an array, for which `typeof [] === 'object' && [] !== null` is true —
is not tested. Verified through the full import pipeline:

```js
// state: { exerciseStats: [{a:1},{b:2}], categoryProgress: ['x'], … }
r.ok;                                   // true — accepted
Array.isArray(r.state.categoryProgress) // true  ← an Array lands in live state as categoryProgress
r.summary;                              // { categories: 1, exercises: 2 } — indices counted as ids
```

`categoryProgress` stays an Array all the way through `hydrateV13` (only `exerciseStats` is
accidentally de-arrayed, by the rebuild loop of step 2). Downstream code that treats
`categoryProgress` as a plain dict will then see `'0'` as a category id. Low likelihood, but the test
is written as if this case were covered.

**Fix:** Add `Array.isArray` to the guard (the `cloneDict` helper in CR-01 already does this) and
extend the fixture:

```js
for (const bad of [null, 'x', 42, [], [{ a: 1 }], true]) { /* … */ }
```

### WR-06: JSDoc version drift in the functions this phase changed

**File:** `src/data/backup.js:74-76`, `src/data/backup.js:13`, `src/data/backup.js:19`,
`src/data/storage.js:39`, `:66`, `:87`, `:90`, `:136-147`

**Issue:** The phase edited `parseBackupFile`'s body (line 151-152) without touching its own docblock,
which still documents the pipeline as "migrate7to8 → migrate8to9 → hydrateV9. Sale siempre como v9
normalizada" — four versions stale and now describing lines that were changed in this commit. The
module header (line 13) still says the chain is "migrate1to2 → migrate2to3 → migrate3to4 → hydrateV4"
and line 19 says "state ya migrado a v7". On the `storage.js` side, `blankState`'s
`@returns {{schemaVersion: 8, …}}` (line 66) is now wrong *as a direct result of this commit*, since
the function's literal return value changed when `CURRENT_SCHEMA_VERSION` moved to 13; the same
applies to `loadState`'s "SIEMPRE está en el shape v8" (line 87) and `migrate`'s "@returns … shape v8"
(line 147). The `RESET_PREFIXES_V13` block comment is meticulous while the surrounding contracts drift
each phase.

**Fix:** Replace the hardcoded version numbers with a reference to the constant, so no future link has
to remember: e.g. `@returns {object} Estado normalizado en el shape actual (CURRENT_SCHEMA_VERSION)`,
and update the `parseBackupFile` pipeline step 5 to `migrate1to2 → … → migrate12to13 → hydrateV13`.

## Info

### IN-01: Fixture construction duplicated between two tests in the v13 block

**File:** `tests/data-storage.test.js` (`v12WithNewFour()` and the `no-regresión` test body)

**Issue:** The no-regression test re-implements the `v12WithNewFour()` loop inline, differing only by
seeding a second stats key per category (`-002`). The `RESET_NEW_V13` / `CATORCE_LEGACY` /
`songProgress` / `dailyLog` shapes are restated verbatim. A future 15th category has to be added in
two places or the no-regression test silently narrows.

**Fix:** Parameterise the helper, e.g. `v12WithNewFour({ statsPerCat = 1 } = {})`, and have the
no-regression test call it with `statsPerCat: 2`. (Restating the *prefix list* independently of the
source constant is deliberate and good — that part should stay duplicated.)

---

_Reviewed: 2026-08-03T10:53:57Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
