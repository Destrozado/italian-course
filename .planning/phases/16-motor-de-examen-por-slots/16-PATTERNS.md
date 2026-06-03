# Phase 16: Motor de examen por slots - Pattern Map

**Mapped:** 2026-06-03
**Files analyzed:** 8 (6 src + index.html template surface + 1 test file)
**Analogs found:** 8 / 8 (all are in-place modifications of existing files — the analog IS the file's own established pattern plus a cross-cutting Phase 13 song analog)

This is a brownfield domain/engine phase. There are **no new files** — every change extends an existing file. So "analog" here means: (a) the file's own current pattern to preserve, and (b) the closest sibling pattern elsewhere in the codebase to copy when adding the new variant-aware behavior. The single most load-bearing cross-file analog is the **Phase 13 `songCurrentPhrase` / `songPhraseById`** dedicated slot-aware getter pair.

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/domain/session.js` | domain / sampler | transform (pure) | own `buildSession`/`buildFullTest` + `weightedPickOne`/`fisherYates` | self / exact |
| `src/domain/progress.js` | domain / state-machine | transform (pure) | own `applySessionResult` FAIL-WINS / `applyImmediateFailure` | self / no conceptual change (D-16-07) |
| `src/data/content-loader.js` | data / loader | request-response (fetch) → index | own `slotById` + `normalizeExerciseToSlot` (already built Phase 15) | self / exact (consume, don't extend) |
| `src/screens/app.js` (getter) | screen / state | event-driven (Alpine reactive) | `songCurrentPhrase` getter (Phase 13) | **exact analog** |
| `src/screens/app.js` (build call-sites) | screen / state | event-driven | own `_launchSession`/`_launchExamen`/`resetSession` (3 sites) | self / exact |
| `src/screens/app.js` (inFlightTest) | screen / persistence | event-driven → localStorage | own `persistInFlightTest`/`resumeInFlightTest` | self / extend shape |
| `index.html` (render + summary) | template | event-driven (Alpine bindings) | existing `sessionCurrentExercise.payload.*` bindings | self / surface-swap |
| `tests/domain-session.test.js` | test | n/a | `domain.test.js` `buildSession` + `seededLcg` | exact analog |

---

## Existing Return Shape (the contract to evolve)

Both samplers return the SAME shape today (`src/domain/session.js:153-156` and `184-187`):

```javascript
return {
  exerciseIds: shuffledSession.map(ex => ex.id),  // string[]
  actualSize: shuffledSession.length
};
```

Every consumer in `app.js` reads `result.exerciseIds` (string[]) and stores it into `this.sessionExerciseIds`, then later resolves each id via `this.content.exerciseById[id]`. Call-sites that read `result.exerciseIds`: `app.js:431, 452-453, 823, 832-833, 958, 992-993`.

`inFlightTest` persists `exerciseIds: [...this.sessionExerciseIds]` (`app.js:1053`).

**Planner decision point (D-16-08 / Claude's Discretion):** carry `variantIndex` alongside each `slotId`. The minimal-ripple options the planner must choose between:
- **Parallel array:** keep `exerciseIds: string[]`, add `variantIndices: number[]` (default-filled with 0). Smallest diff to `sessionExerciseIds` plumbing; `inFlightTest` gains one parallel array.
- **Array of pairs:** `slots: [{slotId, variantIndex}], actualSize`. Cleaner but touches every `result.exerciseIds` read + `sessionExerciseIds` consumers + `inFlightTest` shape + stale-id validation in `resumeInFlightTest`.

Either way the planner must keep `actualSize` and the `exerciseIds`-empty → `actualSize: 0` early-return (`session.js:106`).

---

## Pattern Assignments

### `src/domain/session.js` (domain sampler, pure transform)

**Analog:** its own `weightedPickOne` + `fisherYates` (same file).

**Variant pick reuses the injectable-RNG pattern** — D-16-01 says variant selection uses the *same* RNG already threaded through `buildSession`/`buildFullTest`. The uniform pick is a one-liner using the existing `rng()`:

```javascript
// New helper, sibling to weightedPickOne (session.js:206-218 is the template).
// Uniform pick over slot.variants — NO weighting (D-16-01: no per-variant timesShown).
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  return n <= 1 ? 0 : Math.floor(rng() * n);   // default 0 for 1-variant slots (D-16-10)
}
```

**Weight anchor stays at slot id** (`session.js:206-209`) — DO NOT change the key. The weight reads `state.exerciseStats?.[ex.id]?.timesShown`; since `slot id == exercise id` (Phase 15 / D-15-09) this is already slot-level weighting. No new state.

```javascript
function weightedPickOne(candidates, state, rng) {
  const weights = candidates.map(ex =>
    exerciseWeight(state.exerciseStats?.[ex.id]?.timesShown ?? 0)
  );
  // ... accumulator walk, safety return candidates[last]
}
```

**Sampler input must switch from `exerciseById` to `slotById`** (D-16, code_context): both samplers filter `allExercises` by `categoryIds` overlap (`session.js:101-104` and `175-177`). The `slotById` values carry the same `{id, categoryIds}` keys the filter needs, so the filter is unchanged — only the array passed in changes (at the `app.js` call-sites, `Object.values(this.content.exerciseById)` → `Object.values(this.content.slotById)`). EXAM-01 is satisfied structurally: each slot is picked as ONE unit (de-dup already operates on slot references via `!session.includes(ex)`, `session.js:126, 137`).

**Pure / RNG-injectable / no mutation** — preserve the module header invariants (`session.js:27`: no import from `../data/*` or `../screens/*`). The variant pick must NOT read `slotById` from a data module; it reads `slot.variants` off the slot object passed in.

---

### `src/domain/progress.js` (domain state-machine, pure)

**Analog:** its own FAIL-WINS branch and `applyImmediateFailure` (same file). **No conceptual rewrite (D-16-07).**

The coverage check that defines "hecha" (`progress.js:132-133`) already operates on slot ids because exercise id == slot id:

```javascript
const allInCat = exercisesByCategory[catId] ?? [];
const isCovered = allInCat.length > 0 && allInCat.every(id => cat.clearedExerciseIds.includes(id));
```

`buildExercisesByCategory` (`progress.js:361-369`) iterates `content.exerciseById` — this still yields slot ids. **If the planner passes `slotById` as `content` instead, the shape `{id, categoryIds}` is identical, so this helper is untouched.** The cascade is driven by `answers[].exerciseId` (`progress.js:84-91`); the session will push `{exerciseId: slotId, ...}` (already the case — `applyResultToSession` pushes `ex.id`). `applyImmediateFailure` reads `exercise.categoryIds` (`progress.js:304`) — the slot carries `categoryIds`, so feeding it the slot (or the resolved variant-bearing object that still carries `.id`/`.categoryIds`) is the only requirement. **Pitfall #2: still exactly 2 `applyImmediateFailure` call-sites — DO NOT add a third.**

The whole file likely needs **zero edits** if `app.js` keeps passing slot-shaped objects with `.id` and `.categoryIds`. Planner should confirm and treat progress.js as read-only unless a signature carries a variant.

---

### `src/data/content-loader.js` (data loader)

**Analog:** already built in Phase 15 — `slotById` + `normalizeExerciseToSlot` (`content-loader.js:43-95`, indexed at `145-156`). **This file is the engine's input contract; the engine CONSUMES it, this file does not change.**

The normalized slot shape the engine must read:

```javascript
// content-loader.js:44-52 (variants[] passthrough) and 56-63 (legacy → slot of 1)
{ id, type, categoryIds, explanation, variants: [ {surface...} ] }
```

Variant surfaces are FLAT (no `.payload` wrapper) — `variantFromPayload` (`content-loader.js:75-95`) shows exactly what each type's surface is:
- `multiple-choice` → `{prompt, options, correctIndex}`
- `word-buttons` → `{prompt, answer, distractors?}`
- `match` → `{prompt, pairs}`

`explanation` lives at slot level (`content-loader.js:61`), NOT inside variants. This is the key delta the render must absorb: today templates read `payload.explanation`; with slots the explanation is `slot.explanation` shared across variants.

---

### `src/screens/app.js` — variant resolution getter (THE critical analog)

**Analog:** `songCurrentPhrase` (`app.js:2253-2259`) — a dedicated, defensive, slot-aware getter that resolves the current cursor id against a DEDICATED map instead of `exerciseById`. This is the exact template for resolving `slotById[slotId].variants[variantIndex]` into the `.payload`-shaped surface the renders expect.

`sessionCurrentExercise` today (`app.js:2230-2236`):

```javascript
get sessionCurrentExercise() {
  if (!this.content) return null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
  const id = this.sessionExerciseIds[this.sessionCursor];
  if (!id) return null;
  return this.content.exerciseById?.[id] ?? null;   // returns object WITH .payload
},
```

`songCurrentPhrase` — the analog that does NOT make `sessionCurrentExercise` aware of a second map (`app.js:2253-2259`):

```javascript
get songCurrentPhrase() {
  if (!this.content) return null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
  const id = this.sessionExerciseIds[this.sessionCursor];
  if (!id) return null;
  return this.songPhraseById?.[id] ?? null;
},
```

Note how `songStart` builds `phraseById` entries with a synthetic `.payload` (`app.js:515-525`) precisely so the EXISTING `payload.*` template bindings work unchanged:

```javascript
const graded = {
  id: phrase.id,
  type: 'word-buttons',
  payload: { prompt: phrase.prompt, answer: phrase.answer ?? [], distractors: phrase.distractors ?? [] },
  categoryIds: phrase.categoryIds ?? []
};
```

**This is the minimal-ripple blueprint for Phase 16:** the variant-aware getter (the planner's discretion calls it slot-aware `sessionCurrentExercise`) resolves the chosen variant and re-wraps the flat variant surface + slot-level `explanation` into a synthetic `.payload`-shaped object so the dozens of `sessionCurrentExercise.payload.*` template bindings and `initSubStateForExercise`'s `exercise.payload.*` reads survive without edits:

```javascript
// Phase 16 — slot-aware resolution, modeled on songCurrentPhrase + songStart's synthetic payload.
// Returns an object shaped like the legacy {id, type, categoryIds, payload:{...}} that
// every render binding + initSubStateForExercise already consumes.
get sessionCurrentExercise() {
  if (!this.content) return null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
  const id = this.sessionExerciseIds[this.sessionCursor];
  if (!id) return null;
  const slot = this.content.slotById?.[id];
  if (!slot) return null;
  const vIdx = /* variantIndex for this cursor, default 0 (D-16-10) */;
  const surface = slot.variants?.[vIdx] ?? slot.variants?.[0] ?? {};
  return {
    id: slot.id,
    type: slot.type,
    categoryIds: slot.categoryIds,
    payload: { ...surface, explanation: slot.explanation }  // re-wrap flat surface + slot explanation
  };
},
```

This re-wrapping makes `progress.js`, `initSubStateForExercise` (`app.js:1855, 1868-1869, 1885`), the three grade call-sites, and ALL `index.html` `.payload` bindings work **unchanged** — the same trick `songStart` used in Phase 13. Strongly preferred over rewriting templates.

---

### `src/screens/app.js` — the 3 build/launch call-sites

**Analog:** the three sites are siblings of each other.

1. `_launchTestCompletoForCategory` (single-cat resume launcher) — `app.js:417-418, 431, 452-459`
2. `_launchSession` — `app.js:803-843` (dispatches `buildSession` for repaso vs `buildFullTest` for test-completo)
3. `resetSession` — `app.js:924-1006` (re-rolls; dual-mode buildSession/buildFullTest)

Each does the same sequence:

```javascript
const allExercises = Object.values(this.content.exerciseById);   // → switch to slotById
result = buildSession(this.pickerCheckedCategoryIds, allExercises, this.state, 20, 'repaso');  // or buildFullTest
this.sessionExerciseIds = result.exerciseIds;       // → carry variantIndices too
this.sessionResults = [];
if (result.exerciseIds.length > 0) {
  const firstEx = this.content.exerciseById[result.exerciseIds[0]];   // → resolve via slot+variant
  this.initSubStateForExercise(firstEx);
}
```

All three must change identically: feed `slotById`, store whatever variant carrier the planner chose, and resolve `firstEx`/`nextEx` through the new variant-aware path (or directly via the new getter). `sessionAdvance` resolves `nextEx` at `app.js:1522`; `resumeInFlightTest` at `app.js:1106` — same swap. **Keep these three in lockstep** to avoid drift (the existing code already keeps them parallel).

---

### `src/screens/app.js` — inFlightTest persistence (D-16-09)

**Analog:** `persistInFlightTest` (`app.js:1039-1060`) + `resumeInFlightTest` (`app.js:1074-1110`).

Current persisted shape (`app.js:1051-1057`):

```javascript
inFlightTest: {
  categoryIds,
  exerciseIds: [...this.sessionExerciseIds],
  cursor: this.sessionCursor,
  answers: [...this.sessionResults],
  startedAt: prev?.startedAt ?? Date.now()
}
```

The chosen variant must travel here so resume shows the SAME variant (D-16-09). Minimal-ripple: add a parallel `variantIndices: [...]` array alongside `exerciseIds`. **Backward-compat (D-16-10):** a pre-existing persisted `inFlightTest` without `variantIndices` → default every index to 0 on resume (legacy slots are 1-variant, so index 0 is correct). **No schemaVersion bump (D-16-09 preference, stays v6)** — the default-0 fallback covers legacy blobs, same philosophy as `resumeInFlightTest`'s existing defensive handling.

Stale-id validation in `resumeInFlightTest` (`app.js:1078-1079`) checks `remainingIds.every(eid => this.content.exerciseById[eid])` — switch the existence check to `slotById` (or keep `exerciseById`, ids are identical). The `.payload`-crash defense comment (`app.js:1072`) is exactly why the re-wrapping getter matters on resume.

---

### `index.html` — render + summary-errors surface

**Analog:** existing `sessionCurrentExercise.payload.*` bindings (themselves the template).

`.payload` is read in templates at: prompt `index.html:321`, multi-choice options/correctIndex `347,350,357`, explanation `362,371-373`, word-buttons answer `423`, explanations `432-434, 521-523`. Song bindings `592, 625`. **Summary "Errores cometidos"** reads `content.exerciseById[result.exerciseId].payload.*` at `index.html:747-797` (and song summary `843-846`).

**If the getter re-wraps into a synthetic `.payload` (recommended above), the session-render bindings need ZERO edits.** The one place that does NOT go through the getter is the summary-errors block, which re-resolves `content.exerciseById[result.exerciseId].payload.*` from the id alone. The summary now needs the variant too (D-16-09: "review de errores muestra la variante exacta que se falló"). Planner options:
- Persist enough in `sessionResults` (it already stores `userAnswer`, `app.js:1459`) to re-resolve the variant — add `variantIndex` to each pushed result and resolve `slotById[exerciseId].variants[variantIndex]` in the summary template (or via a small helper getter, mirroring the synthetic-payload trick).

This summary-resolution is the second-biggest template ripple after the getter; everything else funnels through the getter.

---

## Shared Patterns

### Injectable RNG + seeded determinism (D-16-01)
**Source:** `src/domain/session.js:50-57` (`fisherYates`), `:100,173` (rng param), tests use `tests/util/seeded-rng.js` `seededLcg(seed)`.
**Apply to:** the new variant pick in `session.js`. Use the SAME `rng` already threaded through the sampler — do not introduce a second RNG.
```javascript
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) { ... }
// variant pick consumes the same rng() → deterministic with a fixed seed.
```

### Slot-aware dedicated getter (THE Phase 16 keystone)
**Source:** `src/screens/app.js:2253-2259` (`songCurrentPhrase`) + synthetic-payload build at `:515-525`.
**Apply to:** `sessionCurrentExercise` becoming slot+variant aware while re-wrapping into a `.payload`-shaped object so downstream render/grade/initSubState code is untouched.

### FAIL-WINS cascade by slot id (Pitfall #2 — exactly 2 call-sites)
**Source:** `src/domain/progress.js:113-121` (FAIL-WINS branch), `:296-334` (`applyImmediateFailure`); the 2 call-sites are `app.js:1475` (in `applyResultToSession`) and the match first-wrong direct call (`app.js` ~1737, guarded by `matchHadFailure`).
**Apply to:** all three exercise types — keep routing fail through `applyResultToSession`. Do NOT add a third `applyImmediateFailure` call-site. Verify with `grep -c "applyImmediateFailure(" src/screens/app.js` (should stay 2 calls + 1 import).

### "hecha" = total coverage by slot id (no rewrite — D-16-07)
**Source:** `src/domain/progress.js:132-133`, helper `:361-369`.
**Apply to:** nothing — it already means "all slots covered" because exercise id == slot id. Treat progress.js as effectively read-only.

### Synthetic-payload re-wrap to preserve `.payload` bindings
**Source:** `src/screens/app.js:515-525` (`songStart` wrapping a phrase into `{id,type,payload,categoryIds}`).
**Apply to:** the variant-aware getter and (likely) the summary-errors resolution, so that flat variant surfaces + slot-level `explanation` present as the legacy `.payload` shape the entire UI already consumes.

### Test pattern: `node:test` + injected seeded RNG
**Source:** `tests/domain.test.js:14-15,24` (`import { test, describe } from 'node:test'`, `seededLcg`), `:60-101` (`buildSession` assertions with `seededLcg(1234)`).
**Apply to:** new domain tests — 1 variant per slot, never two of the same slot in one session (EXAM-01), re-roll with different seeds touches different variants (EXAM-04 probabilistic), default-0 for 1-variant legacy slots (D-16-10). Use the existing `domain-session.test.js` file.

---

## No Analog Found

None. Every change extends an existing, well-established pattern. The closest thing to "new" is the variant-aware getter, and it has a near-exact analog in Phase 13's `songCurrentPhrase`.

---

## Metadata

**Analog search scope:** `src/domain/`, `src/data/`, `src/screens/`, `src/exercise-types/`, `index.html`, `tests/`
**Files scanned:** session.js, progress.js, content-loader.js, app.js (targeted reads), multiple-choice.js, word-buttons.js, match.js, index.html (grep), domain.test.js (grep)
**Pattern extraction date:** 2026-06-03
