# Phase 31: Cruces multi-cat + integración lockstep (cierre v1.7) - Pattern Map

**Mapped:** 2026-06-17
**Files analyzed:** 4 (all MODIFICATIONS — brownfield, no new files; motor v1.4 NOT touched)
**Analogs found:** 4 / 4

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `content/exercises/presente-regolare.json` | content (exercise JSON, slot+variantes) | transform (authoring data) | `avere-300..305` in `content/exercises/avere.json` (cross shape) + the 8 base slots already in `presente-regolare.json` | exact (shape) + role-match (slot+variants) |
| `tests/exercise-types.test.js` | test (paramétrico smoke + editorial coverage) | batch (loop over file/expected) | the existing 9 entries of `CATEGORIES_WITH_EXPLANATIONS` (line 1265) | exact |
| `tests/fixtures/slot-variants-integration.test.js` | test (back-compat count gate) | batch (loop over slug/expected) | `REAL_CATEGORIES` array (line 166) | exact |
| `scripts/run-validation-271.mjs` | script (quórum reporter VAL-06) | batch (loop over CATEGORIES) | `CATEGORIES` array (line 158) + `TOTAL_EXPECTED` (line 170) | exact |

**Key invariant discovered:** `presente-regolare` is currently ABSENT from ALL THREE count arrays (`CATEGORIES_WITH_EXPLANATIONS`, `REAL_CATEGORIES`, `CATEGORIES`) and from `TOTAL_EXPECTED`. The 8 base slots from Phase 30 are NOT yet counted by the lockstep harness. So INT-01/INT-02 ADD a new entry to each of the three arrays (not just bump an existing number) AND raise `TOTAL_EXPECTED`. The category IS registered in `content/categories.json:12` (id `presente-regolare`, order 10), so `categoryIds` references resolve.

---

## Pattern Assignments

### `content/exercises/presente-regolare.json` (content, slot+variantes)

**Analog A — cross object shape:** `content/exercises/avere.json` lines 702-738 (`avere-300`)

This is the EXACT cross shape to mirror (`id` in a numeric block, `type`, `categoryIds[]` of 2, `explanation`, `variants[]`, `validation.passes[]` by quórum):

```json
{
  "id": "avere-300",
  "type": "multiple-choice",
  "categoryIds": [
    "avere",
    "profesiones"
  ],
  "explanation": "La tercera persona singular del presente indicativo de avere es 'ha', usada con 'lui': 'Lui ha un fratello medico' equivale al español 'Él tiene un hermano médico'. ...",
  "variants": [
    {
      "prompt": "Lui ___ un fratello medico.",
      "options": [ "ho", "hai", "ha", "abbiamo" ],
      "correctIndex": 2
    }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-7", "date": "2026-05-27", "verdict": "correcta", "concerns": [] },
      { "by": "claude-sonnet-4-6", "date": "2026-05-27", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Deviations from the avere-300 analog (per CONTEXT decisions):**
- `categoryIds` here = `["presente-regolare", "avere"]` or `["presente-regolare", "essere"]` (D-31-04). The HUB `presente-regolare` is first; it is the new category that owns the cross, mirroring avere-300 where the newly-extended `avere` hub owns its cross.
- `variants[]` must have **≥2 variants** (slot+variantes, D-31-05) — NOT single-variant like avere-300. This is the anti-memorization requirement D-30-01.
- `id` convention (Claude's discretion D-31-04 / line 53): suggested `presente-regolare-300..` mirroring the avere-300 numeric block. ~4 cross objects (M≈4, ≈8 variants total).
- `date` in `passes[]`: use this phase's validation date; `by` = `claude-opus-4-8` + `claude-sonnet-4-6` (current quórum base per memory `cross-vendor`, matching the base slots already at lines 47-54).

**Analog B — slot+variantes shape (multi-variant, same file):** `content/exercises/presente-regolare.json` lines 4-59 (`presente-regolare-are`)

The base slots show the ≥2-variant slot shape this category was born in. The cross objects must match this slot+variantes form (variants array of plain `{prompt, options, correctIndex}` objects, explanation top-level):

```json
{
  "id": "presente-regolare-are",
  "type": "multiple-choice",
  "categoryIds": [ "presente-regolare" ],
  "explanation": "...canon español acentuado, gloss '(en español: ...)' permitido (R7)...",
  "variants": [
    { "prompt": "Io ___ italiano con i miei amici.", "options": ["parli","parlo","parla","parlate"], "correctIndex": 1 },
    { "prompt": "Tu ___ in un ufficio in centro. (en español: tú trabajas)", "options": ["lavoro","lavori","lavora","lavorano"], "correctIndex": 1 },
    { "prompt": "Lui ___ la matematica all'università. (en español: él estudia)", "options": ["studio","studi","studia","studiate"], "correctIndex": 2 }
  ],
  "validation": { "status": "validated", "passes": [ ... opus-4-8 + sonnet-4-6 ... ] }
}
```

**Note on the R7 gloss:** base slots use `(en español: tú trabajas)` inline in `prompt` (lines 23, 33). This is canon (memory `gloss-es-desambiguacion-canon`) and is required for the cross objects to disambiguate the temporal contrast (e.g. distinguish "pidió la forma compuesta" vs "pidió el presente"). The smoke R1 leak-test regex (exercise-types.test.js:1356) does NOT flag the gloss.

**Analog C — essere auxiliary forms:** `content/exercises/essere.json` (present forms `sono/sei/è` used as auxiliary, e.g. options at lines 14-27). For the `essere`-auxiliary crosses (`è partito`/`è partita`/`sono partiti`/`sono partite`), the participle↔subject agreement is the NEW correctness risk per D-31-08 and must be the explicit subject of the explanation + quórum check.

**Validation/authoring rules (apply to every cross object):**
- R1-R7 quórum 1-por-1, NEVER batched (VAL-03). Base of approval = Claude Opus + Sonnet. `disputed` → autor-oráculo (memory `feedback-disputed-resolution`, calidad > tokens, no override-atajo).
- Explanations must be accented Spanish plain-text (memory `explanations-must-be-accented`); a C4-accent flag on un-accented Spanish is a REAL bug, not false-positive.
- D-31-02: ONLY regular participles (`-ato`/`-uto`/`-ito`); PROHIBITED irregular participles (preso/fatto/detto/messo) and irregular auxiliaries (andare/venire).

---

### `tests/exercise-types.test.js` (test, batch) — INT-02

**Analog:** the `CATEGORIES_WITH_EXPLANATIONS` array, line 1265-1276 (9 entries today).

**Array entry shape** (line 1266-1274):
```javascript
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 50 },
  { file: 'content/exercises/genero-numero.json', expected: 12 },
  { file: 'content/exercises/avere.json', expected: 20 },
  // ... 6 more ...
  { file: 'content/exercises/partitivos.json', expected: 19 },
  // INT-02 ADDS the 10th entry here:
  // { file: 'content/exercises/presente-regolare.json', expected: 8 + M },
];
```

**How `expected` is consumed** (line 1300-1305) — the loop asserts `data.exercises.length === expected` (slot count, NOT variant count), then validates explanation present, ASCII apostrophes (line 1319), no-markdown (line 1332), R1 no-leak (line 1350), R2 no-cross-refs (line 1371). Adding the 10th entry runs all these editorial/security scans against the new file automatically.

**The same array is reused** by the validated-status gate at line 1410-1418 (D-VAL-18 / D-144) — adding the entry also makes that gate require every `presente-regolare` exercise to have `status: "validated"`.

**D-31-06 dynamic-count contract (Claude's discretion D-31-06 line 57):** the author wants `expected` read from the REAL JSON, never a magic number. Pattern to apply: compute `expected` from the parsed file rather than literal `8+M`. The file is already parsed inside the loop (line 1298 `JSON.parse(readFileSync(path,...))`), so the entry can carry a sentinel or the count be derived. Concretely for the new entry, set `expected` by reading `presente-regolare.json` length at array-construction time (e.g. a small helper `count('content/exercises/presente-regolare.json')`) so the number tracks the final JSON. Mirror D-30-02 (`183 + exercises.length REAL`).

---

### `tests/fixtures/slot-variants-integration.test.js` (test, batch) — INT-01 (3rd hardcode)

**Analog:** `REAL_CATEGORIES` array, line 166-176 (9 entries today; comment at line 160 still says "las 9 categorías reales").

**Array entry shape** (line 167-175):
```javascript
const REAL_CATEGORIES = [
  { slug: 'avere', expected: 20 },
  { slug: 'essere', expected: 26 },
  // ... 7 more ...
  { slug: 'partitivos', expected: 19 }
  // INT-01 ADDS: { slug: 'presente-regolare', expected: 8 + M }
];
```

**How consumed** (line 178-201): the loop builds `file = content/exercises/${slug}.json`, runs `validateContent` (schema-validator) against the file (line 181-192), then asserts `exercises.length === expected` (line 194-200). Adding the entry verifies the new cross objects pass the shape validator AND locks the count.

**Also update** the "9 categorías" wording (lines 160, 163, 164 comment) → 10, and the bundle test at line 204 (`las 9 categorías reales validan TODAS juntas`) which iterates `REAL_CATEGORIES` and checks globally-unique ids — the new entry flows through automatically but the test title/comment references "9".

`realCategories` (line 45) is loaded from `content/categories.json` which already includes `presente-regolare` (id present, order 10) — no change needed there; the schema validator will resolve the `categoryIds` reference.

**D-31-06 dynamic-count contract:** same as above — `readJson(file).exercises` is already used (line 182, 195); prefer deriving `expected` from the real file rather than a literal.

---

### `scripts/run-validation-271.mjs` (script, batch) — INT-01 (TOTAL_EXPECTED + CATEGORIES)

**Analog:** `CATEGORIES` array (line 158-168, 9 entries) + `TOTAL_EXPECTED` constant (line 170).

**Constant** (line 170):
```javascript
const TOTAL_EXPECTED = 183;   // → 183 + (8 + M)  ≈ 195
```

**CATEGORIES array entry shape** (line 159-167):
```javascript
const CATEGORIES = [
  { slug: 'preposiciones', file: 'content/exercises/preposiciones.json', expected: 49 },
  // ... 8 more ...
  { slug: 'verbos-movimiento', file: 'content/exercises/verbos-movimiento.json', expected: 7 },
  // INT-01 ADDS: { slug: 'presente-regolare', file: 'content/exercises/presente-regolare.json', expected: 8 + M }
];
```

**How `TOTAL_EXPECTED` is consumed** (VAL-06 reporter, line 375-393):
```javascript
const totalValidated = perCategory.reduce((s, r) => s + r.validated, 0);
// ...
totalValidated === TOTAL_EXPECTED &&
totalActual === TOTAL_EXPECTED &&
// ...
`  VAL-06 (${TOTAL_EXPECTED}/${TOTAL_EXPECTED} validated): ${
  ... ? ok(`PASS (${totalValidated}/${TOTAL_EXPECTED})`)
      : fail(`FAIL (${totalValidated}/${TOTAL_EXPECTED} — ...)`)
}`
```
VAL-06 passes only when EVERY exercise across ALL categories (including the new presente-regolare base 8 + cross M) is `validated` AND `totalActual === TOTAL_EXPECTED`. So all ≈8 cross variants must reach `validated` before this is green. Per-category loop (line 218) reads `exercises.length` (line 294) and counts `effectiveStatus` (line 185) per exercise.

**Comment-history block** (lines 64-153): the file documents every total change. Add a history line `→ 183 + (8 + M) (v1.7 Phase 31, PRES-07/INT-01): presente-regolare engancha al motor (8 slots base + M cruces)` matching the existing style (e.g. line 140, 150). Line 64 (`La suma de expected es 183`) must be updated to the new total.

**D-31-06 dynamic-count contract:** `loadCategory` already parses the JSON (line 200-211); the author's preference (D-31-06 line 57) is for the count to derive from the real JSON. If keeping the literal `expected` per CATEGORIES entry (current pattern), `TOTAL_EXPECTED` MUST equal the sum of the literals — but the author wants it tied to the real slot count of the final JSON, so prefer computing the presente-regolare expected (and ideally TOTAL_EXPECTED) from disk rather than estimating M.

---

## Shared Patterns

### Quórum validation (R1-R7, 1-por-1)
**Source:** `.claude/skills/gsd-validate-exercise/SKILL.md` (skill, NOT a repo file pattern) + base slot `passes[]` shape in `presente-regolare.json:43-58`.
**Apply to:** every new cross object's `validation.passes[]`.
- Base of approval: `claude-opus-4-8` + `claude-sonnet-4-6` (two distinct `by`, verdict `correcta`). The reporter (`run-validation-271.mjs:266-272`) enforces ≥2 distinct `by` among `correcta` passes (VAL-04).
- NEVER batched (VAL-03); cross-vendor scan (`scripts/validate-ai-pass.mjs`) catches accent/subtle bugs (memory `cross-vendor`).
- `disputed` → autor-oráculo override writes `status: "validated"` + an `{by:"autor", verdict:"correcta"}` entry; the reporter's `effectiveStatus`/`hasAuthorOverride` relax (line 185-192) honors it.

### Dynamic count contract (D-30-02 / D-31-06)
**Source:** comment-history in `run-validation-271.mjs:64-153` (every total derived from real slot count) + `data.exercises.length` reads in all three consumers.
**Apply to:** all three count hardcodes + TOTAL_EXPECTED.
- Counts measure SLOTS (`data.exercises.length`), NOT variants. The ≈8 cross variants count as M≈4 slots toward the total.
- Read the N from the final JSON; never hardcode an estimate of M.

### Schema shape (slot+variants)
**Source:** `src/data/schema-validator.js` — `validateContent` (line 65), `payload` XOR `variants[]` rule (line 139-154), `validateVariants` (line 201), per-variant `multiple-choice` surface validator (line 46). `categoryIds` must be non-empty array of known string ids (line 124-130).
**Apply to:** every cross object — must have `variants[]` (not `payload`), top-level `explanation` (line 204), non-empty variants (line 207), and `categoryIds` referencing ids present in `content/categories.json` (both `presente-regolare` and `avere`/`essere` exist).

### Cascada D-54 (motor NOT touched — verify only)
**Source:** `tests/exercise-types.test.js:791-792` — asserts EXACTLY 2 call-sites of `applyImmediateFailure(this.state, ...)`.
**Apply to:** no code change; this test must stay green. The phase only adds cross CONTENT that triggers the existing cascade (`categoryIds[]` of 2 → fail propagates reset to BOTH categories). Verify via grep that call-site count remains 2.

---

## No Analog Found

None. Every file has a direct in-repo analog. The single genuinely new element is the **passato prossimo content** (auxiliary choice + participle↔subject agreement), which has no prior exercise analog in the codebase — but its JSON SHAPE is fully covered by the avere-300 / base-slot analogs above. The planner should source the linguistic content from D-31-01/02/08 + R1-R7, not from an existing file.

---

## Metadata

**Analog search scope:** `content/exercises/`, `tests/`, `tests/fixtures/`, `scripts/`, `src/data/`, `content/categories.json`
**Files scanned:** 7 (avere.json, presente-regolare.json, essere.json, exercise-types.test.js, slot-variants-integration.test.js, run-validation-271.mjs, schema-validator.js) + categories.json + registry grep across src/
**Pattern extraction date:** 2026-06-17
