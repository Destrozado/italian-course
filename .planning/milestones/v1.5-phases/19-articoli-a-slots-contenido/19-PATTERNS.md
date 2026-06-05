# Phase 19: Articoli a slots (contenido) - Pattern Map

**Mapped:** 2026-06-04
**Files analyzed:** 3 (1 content rewrite, 1 test re-sync, validation tooling reference)
**Analogs found:** 3 / 3

This is a PURE CONTENT/DATA phase. There is no new code: the engine, data model, loader,
validator, smoke test and cross-vendor quorum tooling already exist from Phases 15/16/17.
The deliverable is the JSON rewrite of `articoli.json` plus a one-line count re-sync in the
smoke test. Everything below maps each touched file to its existing analog and extracts the
exact shapes/excerpts the planner must replicate.

## File Classification

| File touched | Role | Data Flow | Closest Analog | Match Quality |
|--------------|------|-----------|----------------|---------------|
| `content/exercises/articoli.json` (rewrite legacy `payload` → slot+`variants[]`) | content/data | transform | `content/exercises/preposiciones.json` (Phase 17 pilot output) | exact |
| `tests/exercise-types.test.js` (re-sync count hardcode) | test | batch/structure-assert | same file, `preposiciones.json` entry already converted (line 1266) | exact |
| (reference, NOT modified) cross-vendor quorum for new variants | tooling | request-response | `scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise` | exact |

---

## Pattern Assignments

### `content/exercises/articoli.json` (content rewrite — transform legacy → slot+variants)

**Analog:** `content/exercises/preposiciones.json` (the canonical Phase 17 pilot output — 49 slots, 42 multi-variant, all `validated`).

This is the single most important target. The file currently holds **56 legacy `payload`-shaped exercises** (`articoli-001..050` articoli-only + `articoli-300..305` crosses) and must be rewritten into the slot+`variants[]` shape.

#### BEFORE — current legacy `payload` shape (`articoli.json`, `articoli-001`)

Multiple-choice legacy exercise (explanation lives INSIDE `payload`):

```json
{
  "id": "articoli-001",
  "type": "multiple-choice",
  "categoryIds": ["articoli"],
  "payload": {
    "prompt": "Leggo ___ libro in giardino.",
    "options": ["il", "lo", "l'", "la"],
    "correctIndex": 0,
    "explanation": "Ante una consonante simple (l-) el artículo determinativo masculino singular es il: il libro. ..."
  },
  "notes": "Determinativo masc sing il ante consonante simple (celda il/consonante). ...",
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

The legacy `match` exercise `articoli-049` (note `payload.pairs` is an array of `[noun, articolo]` 2-tuples; the explanation is again INSIDE `payload`):

```json
{
  "id": "articoli-049",
  "type": "match",
  "categoryIds": ["articoli"],
  "payload": {
    "prompt": "Empareja cada sustantivo con su artículo determinativo.",
    "pairs": [
      ["studente", "lo"], ["zio", "lo"], ["psicologo", "lo"],
      ["gnocchi", "gli"], ["amici", "gli"], ["zii", "gli"], ["libri", "i"]
    ],
    "explanation": "Este empareje va mas alla del il/la/l' basico: ..."
  },
  "notes": "Match determinativo avanzado (D-06): ... 3 valores distintos en columna derecha (lo, gli, i) cumple R3. ...",
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

#### AFTER — canonical slot+variants shape to replicate (from `preposiciones.json`)

**Multi-variant slot** (`preposiciones-di-origen`, lines 3-48 of `preposiciones.json`). Note: `explanation` is at SLOT level (top-level, not inside any variant); `variants[]` are FLAT surfaces with only `{prompt, options, correctIndex}` — no `type`, no `explanation`, no `categoryIds` per variant:

```json
{
  "id": "preposiciones-di-origen",
  "type": "multiple-choice",
  "categoryIds": ["preposiciones"],
  "explanation": "La preposición Di indica origen estable: ...",
  "variants": [
    { "prompt": "Maria viene da Pisa, ma è ___ Roma di nascita.", "options": ["di","a","da","in"], "correctIndex": 0 },
    { "prompt": "Paolo è ___ Napoli di nascita.", "options": ["di","a","da","in"], "correctIndex": 0 }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-7",   "date": "2026-05-26", "verdict": "correcta", "concerns": [] },
      { "by": "claude-sonnet-4-6", "date": "2026-05-26", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Slot-de-1** (single variant — same shape, `variants` array of length 1; `preposiciones-a-casa`, lines 50-86). This is the shape the planner uses for the 2 `match` slots (D-19-03) and the 6 crosses (D-19-04):

```json
{
  "id": "preposiciones-a-casa",
  "type": "multiple-choice",
  "categoryIds": ["preposiciones"],
  "explanation": "Con la palabra casa el italiano usa la preposición A como excepción idiomática, ...",
  "variants": [
    { "prompt": "Vado ___ casa.", "options": ["in","a","da","per"], "correctIndex": 1 }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

**`type:match` slot-de-1** (D-19-03): preposiciones has NO match slot to copy from (all 49 are multiple-choice), BUT the loader/validator support `type:match` at slot level. The variant surface for a match slot is `{prompt, pairs}` (no `correctIndex`). Derive it by lifting the legacy `articoli-049` `payload` into a single variant and moving its `explanation` up to slot level:

```json
{
  "id": "articoli-049",
  "type": "match",
  "categoryIds": ["articoli"],
  "explanation": "Este empareje va mas alla del il/la/l' basico: ...",
  "variants": [
    {
      "prompt": "Empareja cada sustantivo con su artículo determinativo.",
      "pairs": [["studente","lo"],["zio","lo"],["psicologo","lo"],["gnocchi","gli"],["amici","gli"],["zii","gli"],["libri","i"]]
    }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

**Mechanical mapping (legacy → slot), confirmed against `src/data/content-loader.js:43-95`:**

| `type` | legacy `payload` fields | slot `variants[k]` surface | where `explanation` goes |
|--------|-------------------------|----------------------------|--------------------------|
| `multiple-choice` | `prompt, options, correctIndex, explanation` | `{prompt, options, correctIndex}` | slot-level `explanation` |
| `match` | `prompt, pairs, explanation` | `{prompt, pairs}` | slot-level `explanation` |

**GOTCHAS (must follow exactly):**
- **`payload` XOR `variants[]`** — a slot has one or the other, never both (validator `schema-validator.js:149` rejects both). The rewrite REMOVES `payload` and ADDS `variants[]`.
- **`explanation` lives at SLOT level for `variants[]` slots** (D-15-02); it is REQUIRED and must be a non-empty string (`schema-validator.js:204`). Variants carry NO explanation. When fusing several legacy exercises into one slot, apply D-17-05: pick the most complete legacy explanation + graft unique nuances.
- **ASCII apostrophe U+0027** for `l'` / `un'` / `gli` series in options and prompts. The smoke test (`exercise-types.test.js:1319`) FAILS on smart quotes `‘’“”`. The articoli legacy already uses `l'` (U+0027) in options — preserve it.
- **`match` `pairs`** is an array of `[left, right]` 2-tuples; needs 3+ distinct right-column values (R3) — `articoli-049` has `lo/gli/i`, `articoli-050` has the `uno/un'/una/un` series. Duplicates on the left/right are intentional (grading consumes by index).
- **`categoryIds` is an ARRAY** even for single-category slots (`["articoli"]`). The 6 crosses keep TWO ids, e.g. `["articoli","genero-numero"]`.
- **`validation.passes[]`** is the quorum history. Existing 56 are already `validated` — do NOT re-validate unless the surface (prompt/options text) changes when regrouping (D-17-07 "re-validación de superficie"). Pure text-move into `variants[]` without edits needs no re-validation.
- **`notes`** field is free-form authoring metadata; legacy entries carry it. Optional in the slot shape (validator treats it as metadata, `schema-validator.js:168`). Stale `status pending (D-15)` notes are lies — real status is `validated`.

**ID renumbering rules (D-19-04 + Claude's Discretion), confirmed by repo scan:**
- articoli-only slots = `articoli-001..050` → ids are FREE to renumber (progress reset in Phase 18).
- The 6 crosses keep STABLE ids: `articoli-300, articoli-301, articoli-302` (`+genero-numero`), `articoli-303, articoli-304, articoli-305` (`+sustantivos-irregulares`). Do NOT renumber these — `clearedExerciseIds` for genero-numero/sustantivos-irregulares would go stale (regression to no-hecha).
- When renumbering articoli-only slots, RESERVE/exclude the `300..305` range to avoid id collision.

---

### `tests/exercise-types.test.js` (count re-sync — structure assertion)

**Analog:** the SAME file already converted `preposiciones` per D-17-04 (line 1266: `{ file: 'content/exercises/preposiciones.json', expected: 49 }` — note `49`, down from the pre-pilot `52` exercises).

**What to change (one number):** `exercise-types.test.js:1273`:

```js
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 49 },
  ...
  { file: 'content/exercises/articoli.json', expected: 56 },   // ← re-sync to the new slot count
  ...
];
```

The `expected: 56` must become the new TOTAL slot count of the rewritten `articoli.json`
(articoli-only slots after fusion/renumber + 2 match slots + 6 crosses). The planner computes
this from the final regrouping.

**Why this is the ONLY count to touch — the test is already shape-agnostic (PILOT-05):** the
test bifurcates on shape via accessors `getExplanation` (line 1284) and `getPrompts` (line 1287),
which read `ex.variants` when present (slot) and fall back to `ex.payload` (legacy). So
`articoli.json` converted to slots passes the explanation-coverage, smart-quote, markdown, R1
prompt-leak and R2 cross-ref scans WITHOUT further test edits:

```js
const getExplanation = (ex) =>
  Array.isArray(ex.variants) ? ex.explanation : ex.payload?.explanation;
const getPrompts = (ex) =>
  Array.isArray(ex.variants) ? ex.variants.map(v => v?.prompt || '') : [ex.payload?.prompt || ''];
```

`assert.equal(data.exercises.length, expected, ...)` at line 1301-1305 is the assertion that
breaks until the count is re-synced.

**Also re-checked by the same `CATEGORIES_WITH_EXPLANATIONS` array** (D-VAL-18, zero parallel infra):
the `VAL-07 — todos los ejercicios validated` gate (line 1415-1431, run under `VAL_07_STRICT=1`)
asserts every `ex.validation?.status === 'validated'`. New variants/slots must therefore reach
`validated` via the quorum BEFORE this gate passes.

**Run command (project convention, from memory):** `node --test tests/*.test.js`. Strict gate:
`VAL_07_STRICT=1 node --test tests/*.test.js`. Bare-path single-file invocation can fail on
Node 22.20 — use the glob.

**GOTCHA:** the test reads `data.exercises.length` (count of SLOTS, not variants). Fusing N legacy
exercises into 1 multi-variant slot REDUCES the count (preposiciones went 52→49); adding the
`y` / `i+vocal` gap slots (D-19-06) INCREASES it. Net count = planner's final tally.

---

### Cross-vendor quorum pipeline (REFERENCE — no source edits; invoked for new variants/slots)

New variants (D-19-05) and the new `y` / `i+vocal` gap slots (D-19-06) enter ONLY if they pass
the full cross-vendor quorum R1-R7 (D-17-07). Two tools, both already built:

**1. `scripts/validate-ai-pass.mjs`** — external-model pass (Gemini + DeepSeek). Invocation surface
(from header, lines 16-24):

```
node scripts/validate-ai-pass.mjs <exercise-id> [--model=…] [--fallback=a,b,c] [--avoid=x,y] [--write] [--dry-run] [--temp=n]
```

- It LOCATES the exercise by exact `id` scan across `content/exercises/*.json` + `tests/fixtures/*.json` (`findExercise`, lines 87-101).
- `--write` MUTATES `validation.passes[]` IN-PLACE with a surgical brace-balanced rewrite that preserves the compact file format (`writePass`, lines 257-275); the anchor is `"id": "<id>"` (closing-quote anchor so `articoli-1` does not match `articoli-10`, line 259).
- `status` is re-derived by the single-source `deriveStatus()` from `src/data/validation-state.js` (line 35) after each write — do NOT hand-edit `status`.
- A pass it writes looks like: `{ "by": "<model>", "date": "YYYY-MM-DD", "verdict": "...", "concerns": [...] }` (lines 198-203). `by` is the model that ACTUALLY answered (auto-fallback aware) so the quorum's ">=2 distinct `by`" still holds.

**2. skill `gsd-validate-exercise`** (`.claude/skills/gsd-validate-exercise/SKILL.md`) — Claude pass.
Invocation surface: `<exercise-id> [--dry-run]`. Critical invariants (NOT internals):
- **NEVER batched** — one fresh-context Task() subagent per exercise (VAL-03). 30 exercises = 30 invocations.
- Pinned model IDs `claude-opus-4-7` (pass 1) + `claude-sonnet-4-6` (pass 2), sequential, written to `validation.passes[]`, 1 commit per exercise.
- Applies C1-C5 (operationalization of R1-R7) from `09-VALIDATION-PROMPT.md` (self-contained; the subagent inherits NO project context).

**GOTCHAS for new variants (R6 + memory):**
- **R6 critical for `y` / `i+vocal` gap slots** — verify the Italian noun AND its article are correct before authoring (`lo yogurt`, `gli yogurt`, `lo iodio`). Semiconsonantal triggers are easy-error terrain.
- DeepSeek is strict on accents, Opus is lenient → complement with an accent scan.
- **R7 gloss** `(en español: …)` in prompts is author canon, NOT a leak. The C5-leak Gemini/DeepSeek flag on it is a policy false-positive; approval baseline = Claude Opus+Sonnet.
- A new variant means a new SURFACE → it needs its own quorum even if it lives in an existing slot.

---

## Shared Patterns

### Slot normalization contract (the border the engine consumes)
**Source:** `src/data/content-loader.js:43-95` (`normalizeExerciseToSlot` + `variantFromPayload`)
**Apply to:** every slot in `articoli.json`.
The loader feeds BOTH paths into the SAME `slotById` map (line 154): `variants[]` slots pass
through; legacy `payload` slots auto-normalize to slot-de-1. So the 6 crosses MAY be left legacy
and still flow correctly — but for consistency with the pilot the planner will convert them to
explicit slot-de-1 shape (D-19-04). NFC normalization happens at the loader border (line 124);
authoring should still keep files NFC + ASCII apostrophes.

### Validator gate (what the rewritten file must pass)
**Source:** `src/data/schema-validator.js` (slot branch lines 139-220) via runner `scripts/validate-content-fixture.mjs`
**Apply to:** the whole rewritten `articoli.json`.
Run: `node scripts/validate-content-fixture.mjs articoli content/exercises/articoli.json`
(exit 0 = valid). Enforced rules: `payload` XOR `variants[]`; non-empty slot `explanation` when
`variants[]`; `variants[]` non-empty; each variant a flat surface valid for the slot `type`
(`multiple-choice`: prompt with `___`, 3-4 options, `correctIndex` in range; `match`: pairs).

### Smoke / structure test
**Source:** `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS` line 1265-1276, scans 1300-1386)
**Apply to:** count re-sync + the editorial invariants (explanation coverage, ASCII apostrophes,
no markdown, R1 prompt-leak, R2 cross-refs) which run automatically once the count is correct.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | All touched files have an exact analog. The only "new" content — `type:match` slots and the `y`/`i+vocal` gap slots — have no preposiciones twin (preposiciones is 49 MC slots, 0 match), but the loader/validator already support `type:match` at slot level (`content-loader.js:88`, `schema-validator.js` dispatch), and the match variant surface (`{prompt, pairs}`) is derived directly from the legacy `articoli-049/050` payloads above. |

## Metadata

**Analog search scope:** `content/exercises/`, `src/data/`, `scripts/`, `tests/`, `.claude/skills/`
**Files scanned:** `preposiciones.json`, `articoli.json`, `content-loader.js`, `schema-validator.js`,
`validate-ai-pass.mjs`, `validate-content-fixture.mjs`, `exercise-types.test.js`, `gsd-validate-exercise/SKILL.md`
**Verified facts:** articoli = 54 MC + 2 match = 56, all `validated`; crosses = `articoli-300..305`
(3 genero-numero, 3 sustantivos-irregulares); articoli-only = `articoli-001..050`;
preposiciones = 49 slots (42 multi-variant) all MC.
**Pattern extraction date:** 2026-06-04
