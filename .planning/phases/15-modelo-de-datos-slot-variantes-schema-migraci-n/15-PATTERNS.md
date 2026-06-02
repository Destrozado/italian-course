# Phase 15: Modelo de datos slot+variantes + schema + migración - Pattern Map

**Mapped:** 2026-06-03
**Files analyzed:** 4 modified source files + 3 test analogs
**Analogs found:** 4 / 4 (all in-file analogs — this phase MODIFIES existing data-layer files, no new files)

This phase is a pure data-layer extension. Every change has a precise sibling already in the same file. The dominant instruction for the planner: **mirror the nearest sibling literally** (same shape, same guards, same comment density, same español messages), do not invent new structure.

## File Classification

| Modified File | Role | Data Flow | Closest Analog (in-file sibling) | Match Quality |
|---------------|------|-----------|----------------------------------|---------------|
| `src/data/schema-validator.js` | validator (model) | transform / accumulate-validate | `validateContent` walk + `PAYLOAD_VALIDATORS` dispatch + `validateSongs` sibling | exact (same module) |
| `src/data/content-loader.js` | loader | file-I/O → transform → index | `loadContent` fetch→NFC→validate→index sequence | exact (same module) |
| `src/data/storage.js` | model / migration | transform (chain) | `migrate4to5` / `hydrateV5` + `migrate()` dispatcher | exact (same module) |
| `src/data/backup.js` | model / serializer | transform (parse/build) | `parseBackupFile` migration chain + `buildBackupWrapper` | exact (same module) |

### Test Analogs

| Module changed | Test file to extend | Existing analog pattern inside |
|----------------|---------------------|--------------------------------|
| `schema-validator.js` (slot+variants) | `tests/exercise-types.test.js` (`describe('data/schema-validator — word-buttons payload')`, lines 105-148) AND `tests/song-validator.test.js` (sibling-validator test layout, lines 20-260) | happy-path `validateContent({categories, exercisesByFile})` + `assert.equal(result.ok, true)` / reject `result.ok === false` |
| `storage.js` (`migrate5to6`/`hydrateV6`) | `tests/data-storage.test.js` (`describe('data/storage v5 — migrate4to5 chain + hydrateV5 (Phase 13)')`, lines 407-494) | per-link migrate test: fresh→bump, preserve-existing deep-clone, corrupt→default, anti-prototype-pollution, hydrate |
| `backup.js` (v6 round-trip) | `tests/backup.test.js` (lines 35-220) | `parseBackupFile` chain-to-current happy path + forward-compat reject + `buildBackupWrapper` shape |

## Pattern Assignments

### `src/data/schema-validator.js` (validator, accumulate-validate)

**Analog A — the exercise walk + dispatch** (`validateContent`, lines 88-139). This is where the `payload` XOR `variants[]` branch must be inserted. The current per-exercise flow:

- id presence + global uniqueness (lines 90-97)
- `type` dispatch lookup, `continue` if unsupported (lines 103-107)
- `categoryIds` array non-empty + known-refs (lines 110-122)
- **payload presence guard** (lines 124-128) — `if (!ex.payload || typeof ex.payload !== 'object') { push(...); continue; }` — THIS is the exact spot the XOR logic replaces: today it assumes `payload` always exists; the slot model makes it `payload` XOR `variants[]`.
- `validator(ex, file, push)` dispatched per-type (line 133) — for legacy `payload`.
- optional top-level `validation` (line 138) — unchanged, stays per-slot.

**D-08 accumulate-no-throw invariant** — the load-bearing rule the new variant walk MUST preserve (lines 50-52, 133):
```javascript
const errors = [];
const push = (file, exerciseId, reason) => errors.push({ file, exerciseId, reason });
// ...
validator(ex, file, push);   // pushes more errors, NEVER returns early globally
// ...
return { ok: errors.length === 0, errors };
```

**Analog B — `PAYLOAD_VALIDATORS` reuse for variant surface.** The three surface validators already check EXACTLY the per-variant surface, but they read from `ex.payload` (the wrapper). Note the destructure line in each — that is the single line that differs when validating a flat variant vs a wrapped payload:

- `validateMultipleChoicePayload` (lines 316-343): `const { prompt, options, correctIndex } = ex.payload;` — needs `{prompt, options, correctIndex}` from the variant object instead. Messages say `"payload.prompt"`, `"payload.options"`, `"payload.correctIndex"`.
- `validateWordButtonsPayload` (lines 360-388): `const { prompt, answer, distractors } = ex.payload;` — variant surface `{prompt, answer, distractors?}`.
- `validateMatchPayload` (lines 406-444): `const { prompt, pairs } = ex.payload;` — variant surface `{prompt, pairs}`. Note the in-`forEach` early-return guard (lines 422-426) that avoids `TypeError` on a malformed pair — keep this when validating variant pairs.

**Decision for planner (SLOT-04, Claude's Discretion):** the cleanest reuse is to refactor each `validate*Payload(ex, file, push)` so its surface check operates on a passed-in surface object + a label prefix, then call it once per variant. Alternatively add three `validate*Surface(surface, exId, file, push, idx)` siblings mirroring these. Either way the message style must stay `"variants[k].prompt ..."` in español (FOUND-04) and accumulate (D-08).

**Analog C — `validateSongs` as the "sibling validator" precedent** (lines 176-260). This is the template for *how a new validation concern was bolted on without disturbing `validateContent`*. Key reusable moves the slot work should echo:
- separate doc-comment block stating strategy "idéntica a `validateContent`: acumula TODOS los errores… nunca lanza mid-walk… mensajes en español" (lines 146-175).
- a flattened-surface helper `validateSongPhrasePayload` (lines 280-300) that is explicitly described as "Adaptado de `validateWordButtonsPayload` — el payload está APLANADO sobre la frase (prompt/answer/distractors directos, no bajo `.payload`)". **This is the exact precedent for validating a flat variant** — a variant is a flattened payload, same as a song phrase. Copy this adaptation shape.
- divergence comments call out where it intentionally differs from `validateContent` (lines 166-169, 238-240) — the slot validator should similarly document the XOR rule and the `explanation`-at-slot-level requirement.

**The XOR / explanation rules to encode** (from CONTEXT D-15-02/04/06 + SLOT-04 discretion). Reject:
- slot with `variants[]` empty (`[]`).
- a variant missing/invalid surface for the slot `type`.
- `payload` AND `variants[]` both present simultaneously.
- `explanation` absent at slot top-level when `variants[]` is present (new slots require slot-level explanation; legacy `payload.explanation` stays optional per back-compat — see existing optional-explanation guard at lines 338-342, 383-387, 439-443).

**Test analog** (`tests/exercise-types.test.js` lines 105-148): happy-path skeleton to clone for slot+variants tests:
```javascript
const result = validateContent({
  categories: [{ id: 'avere', name: 'Avere', order: 1 }],
  exercisesByFile: { 'avere.json': [ { id: 'wb-001', type: 'word-buttons', categoryIds: ['avere'], payload: {...} } ] }
});
assert.equal(result.ok, true, `Errores inesperados: ${JSON.stringify(result.errors)}`);
assert.deepEqual(result.errors, []);
```
Reject tests assert `result.ok === false`. Add a new `describe('data/schema-validator — slot+variants')` block; legacy-`payload` cases must still pass (back-compat D-15-06).

---

### `src/data/content-loader.js` (loader, file-I/O → transform → index)

**Analog — `loadContent` sequence** (lines 29-71). The canonical fetch→NFC→validate→index pipeline. The slot work touches step 5 (indexing) and possibly adds a legacy→slot-of-1 normalization between steps 3 and 5:

- step 3, NFC at the edge (lines 42-47): `normalizeNfcInPlace(arr)` per file. Per CONTEXT D-15 / "NFC normalize" discretion, `normalizeNfcInPlace` (lines 157-171) is already recursive → it covers `variants[]` with **zero changes**. Do not touch it.
- step 4, validate (lines 50-58) — unchanged path; the new validator flows through here and `.errors` reaches `main.js` (D-10).
- step 5, build `exerciseById` index (lines 60-65):
```javascript
const exerciseById = {};
for (const arr of Object.values(exercisesByFile)) {
  for (const ex of arr) exerciseById[ex.id] = ex;
}
```
This is the integration contract for Phase 16 (sampler/render consume `exerciseById`). **D-15-04 (legacy = slot de 1):** an exercise WITHOUT `variants[]` keeps its `payload` and is interpreted as a 1-variant slot whose only variant is that `payload` (its `payload.explanation` becoming the slot explanation). The planner decides whether `loadContent` normalizes legacy→slot-of-1 here (so `exerciseById` exposes a uniform slot shape) or defers the resolution to Phase 16. CONTEXT leaves the exposed shape as the contract decision; the "Esquema de ids de variante" is explicitly deferrable to Phase 16 if not needed for the pure model.

**Sibling precedent — `loadSongs`** (lines 94-133) shows the same fetch→NFC→validate→index sequence applied to a parallel concern, including the explicit `normalizeNfcInPlace(doc)` loop and a separate `*ById` index map. Mirror its structure if any new index/normalize step is added.

---

### `src/data/storage.js` (model/migration, transform-chain)

**Analog — `migrate4to5` + `hydrateV5`** (lines 418-471). These are the LITERAL template for `migrate5to6` / `hydrateV6`. Copy the shape exactly.

`migrate4to5` (lines 418-437) — bump + per-sub-dict deep-clone defensive JSON round-trip (CR-03 / anti-prototype-pollution T-04-02):
```javascript
export function migrate4to5(v4) {
  return {
    schemaVersion: 5,
    exerciseStats: (typeof v4.exerciseStats === 'object' && v4.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(v4.exerciseStats))
      : {},
    categoryProgress: (typeof v4.categoryProgress === 'object' && v4.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(v4.categoryProgress))
      : {},
    dailyLog: (typeof v4.dailyLog === 'object' && v4.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v4.dailyLog))
      : {},
    songProgress: (typeof v4.songProgress === 'object' && v4.songProgress !== null)
      ? JSON.parse(JSON.stringify(v4.songProgress))
      : {},   // NEW sub-árbol (Phase 13)
    lastBackupAt: typeof v4.lastBackupAt === 'string' ? v4.lastBackupAt : null,
    firstUsedAt: typeof v4.firstUsedAt === 'string' ? v4.firstUsedAt : null,
    inFlightTest: v4.inFlightTest
  };
}
```

**D-15-09 — the bump is NOMINAL at the state root** (like 3→4 in `migrate3to4`, lines 274-282, and like the v5→v6 prose in CONTEXT). The slot+variants model lives in `content/`, NOT in the state. `exerciseStats` stays keyed by the slot/exercise id (unchanged). So `migrate5to6` adds NO new sub-tree — it is `migrate4to5` minus the `songProgress` "NEW" line, with `5`→`6` everywhere and `v4`→`v5` param naming. Same guards, same JSON round-trip, same `inFlightTest` passthrough.

`hydrateV5` (lines 452-471) — the end-of-chain hydrator with identical guards; `hydrateV6` mirrors it 1:1 with the version literal bumped.

**`migrate()` dispatcher fall-through** (lines 136-149) — add the new link before the final hydrate:
```javascript
if (s.schemaVersion === 4) s = migrate4to5(s);
if (s.schemaVersion === 5) return hydrateV5(s);   // ← becomes: if (s.schemaVersion === 5) s = migrate5to6(s);
//                                                    if (s.schemaVersion === 6) return hydrateV6(s);
```
Unknown version still falls through to `console.warn(...)` + `blankState()` (lines 147-148) — never lose author state.

**`CURRENT_SCHEMA_VERSION`** (line 35): `5` → `6`. **`blankState()`** (lines 55-66) returns `schemaVersion: CURRENT_SCHEMA_VERSION` (already a constant ref, so it follows the bump automatically) — confirm its sub-dict set is unchanged (no new state field per D-15-09; update only the doc-comment version references at lines 37-53).

**Idempotence + purity** — `migrate3to4` (lines 306-356) documents the idempotence + purity contract most thoroughly (preserve existing values, reconstruct new root object, never mutate input). The v5→v6 link inherits these for free since it adds no field, but keep the doc-comment in the same style (cite D-15-08, the 3→4 nominal-bump precedent, T-04-02/CR-03).

**Test analog** (`tests/data-storage.test.js` lines 407-494, `describe('data/storage v5 — migrate4to5 chain + hydrateV5 (Phase 13)')`). Clone this block as a `v6` describe. The five test shapes to mirror:
1. fresh prior-version → bump produces next version, sub-objects intact (lines 408-428).
2. preserve existing sub-dict with deep-clone, assert `notEqual` reference (lines 430-445).
3. corrupt sub-value (non-object) falls to default (lines 447-456).
4. anti-prototype-pollution via `JSON.parse('{... "__proto__":{"polluted":true} ...}')` then `assert(({}).polluted === undefined)` (lines 458-463).
5. hydrate preserves all fields incl. deep-clone defensive (lines 465-492).

Also update the `import {...}` line (line 28) to add `migrate5to6, hydrateV6`, and the `blankState` shape tests (lines 36-55) to expect `schemaVersion: 6`.

---

### `src/data/backup.js` (model/serializer, parse/build)

**Analog — the whole module is already the v5 template** (lines 26-148). The v6 extension is a mechanical bump of the same three touchpoints used for the v4→v5 work:

1. **Import line** (line 26): add the new chain links →
```javascript
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, hydrateV5, hydrateV6 } from './storage.js';
```
2. **Inline `CURRENT_SCHEMA_VERSION`** (line 34): `5` → `6`. Note the deliberate inline-mirror comment (lines 28-33) — keep the module testable without importing the storage constant; extend the comment with the Phase 15 / v5→v6 rationale.
3. **Migration chain in `parseBackupFile`** (lines 111-117) — append the new link and bump the final hydrate:
```javascript
let migrated = state;
if (migrated.schemaVersion === 1) migrated = migrate1to2(migrated);
if (migrated.schemaVersion === 2) migrated = migrate2to3(migrated);
if (migrated.schemaVersion === 3) migrated = migrate3to4(migrated);
if (migrated.schemaVersion === 4) migrated = migrate4to5(migrated);
// ← add: if (migrated.schemaVersion === 5) migrated = migrate5to6(migrated);
migrated = hydrateV5(migrated);   // ← becomes hydrateV6(migrated)
```

**Single-reason-of-failure pattern** (lines 22-24, and each guard 68-109): backup does NOT accumulate (unlike `validateContent`) — first failing guard returns `{ok:false, reason}` in español. The forward-compat guard (lines 104-109) auto-tracks the bumped constant: `state.schemaVersion > CURRENT_SCHEMA_VERSION` now rejects only >6. The lower-bound/integer guard (lines 87-92) is unchanged. `wrapper.schemaVersion === state.schemaVersion` coherence check (lines 96-101) unchanged.

**`buildBackupWrapper`** (lines 141-148) — needs NO change: it reads `state.schemaVersion` dynamically, so a v6 state produces a v6 wrapper automatically. Verify only.

**Test analog** (`tests/backup.test.js` lines 35-220). Patterns to extend:
- chain-to-current happy path: `parseBackupFile(JSON.stringify(wrapper))` then `assert.equal(r.state.schemaVersion, 5)` → bump expectation to `6` (lines 109-126, 136-200). These currently assert v5 as the chain terminus; they become v6.
- forward-compat reject test for a `schemaVersion` one above current (mirror the existing `> CURRENT` reject around lines 104-109 in source / its test).
- `buildBackupWrapper` shape test (header note line 14): `{kind, exportedAt, schemaVersion, state}`, `exportedAt` injectable.

## Shared Patterns

### D-08 accumulate-errors-no-throw (validator)
**Source:** `src/data/schema-validator.js` lines 50-52, 142 (also `validateSongs` lines 177-178, 259).
**Apply to:** all new slot+variants validation. Single walk, push every error, never throw mid-walk, return `{ok: errors.length === 0, errors}`. Messages in español (FOUND-04).

### Deep-clone defensive sub-dict (anti-prototype-pollution, CR-03 / T-04-02)
**Source:** `src/data/storage.js` lines 332-355 (rationale comment) + the `JSON.parse(JSON.stringify(...))` per sub-dict pattern repeated in `migrate3to4`/`hydrateV4`/`migrate4to5`/`hydrateV5`.
**Apply to:** `migrate5to6` + `hydrateV6`. Reconstruct a fresh root literal `{ schemaVersion: 6, ... }`; deep-clone each sub-dict via JSON round-trip; never mutate input (purity); idempotent (re-running on same blob yields identical shape).

### Migration chain fall-through dispatcher
**Source:** `src/data/storage.js` `migrate()` lines 136-149; mirrored in `backup.js` `parseBackupFile` lines 111-117.
**Apply to:** both the `storage.js` dispatcher AND the `backup.js` import + inline chain. Add the v5→v6 link in BOTH places; unknown/future version → warn + `blankState()` (storage) or `{ok:false, reason}` forward-compat reject (backup).

### Backup wrapper version round-trip (D-73)
**Source:** `src/data/backup.js` `buildBackupWrapper` lines 141-148 + inline `CURRENT_SCHEMA_VERSION` lines 28-34.
**Apply to:** bump the inline constant to 6; `buildBackupWrapper` itself needs no change (reads `state.schemaVersion`).

### Flattened-surface validator adaptation
**Source:** `src/data/schema-validator.js` `validateSongPhrasePayload` lines 280-300 ("Adaptado de `validateWordButtonsPayload` — payload APLANADO… no bajo `.payload`").
**Apply to:** validating each flat variant (a variant is a flattened payload, identical premise to a song phrase). Reuse / adapt `PAYLOAD_VALIDATORS` surface checks.

### NFC at the edge (D-09 / CONT-06)
**Source:** `src/data/content-loader.js` `normalizeNfcInPlace` lines 157-171 (recursive) + call sites lines 42-47.
**Apply to:** nothing new — it is already recursive and covers `variants[]` automatically. Do NOT modify it (explicit CONTEXT note).

## No Analog Found

None. Every change in this phase has an exact in-file sibling. This is a textbook "extend the chain / extend the dispatch" phase.

## Metadata

**Analog search scope:** `src/data/` (4 target modules + `validation-state.js`), `tests/` (all 14 test files; relevant: `exercise-types.test.js`, `song-validator.test.js`, `data-storage.test.js`, `backup.test.js`).
**Files scanned:** 4 source files read in full (≤516 lines each), 3 test files greped + key ranges read.
**Pattern extraction date:** 2026-06-03
