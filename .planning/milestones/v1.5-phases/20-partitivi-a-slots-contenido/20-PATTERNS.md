# Phase 20: Partitivi a slots (contenido) - Pattern Map

**Mapped:** 2026-06-05
**Files analyzed:** 4 (1 content rewrite, 3 count re-syncs) + validation tooling reference
**Analogs found:** 4 / 4

This is a PURE CONTENT/DATA phase — **the exact twin of Phase 19 (Articoli)**. There is no new
code: the engine, data model, loader, validator, smoke test and cross-vendor quorum tooling
already exist from Phases 15/16/17 and were exercised end-to-end in Phase 19. The deliverable is
the JSON rewrite of `partitivos.json` (44 legacy `payload` exercises → slot+`variants[]`) plus a
count re-sync in 3 hardcode sites + `TOTAL_EXPECTED`.

**The single best analog for every file is Phase 19's Articoli conversion.** `articoli.json`
post-conversion (34 slots, all `validation.status: validated` top-level) is the reference shape;
the 19-01/02/03 SUMMARYs document the exact pipeline; `19-PATTERNS.md` is the structural template
this file mirrors. Partitivi differs from Articoli ONLY in: (a) 0 inter-category crosses → ids
fully free to renumber (D-19-04 does NOT apply); (b) one extra rule dimension — clasificación
partitivo-vs-preposizione (D-20-04) with a 3-option MC shape; (c) the "∅ omisión en negativa"
contrast slot (D-20-03).

**Verified facts (read from disk 2026-06-05):**
- `partitivos.json` = **44 exercises, ALL legacy `payload`** (0 `variants[]`): 42 `multiple-choice` + 2 `match` (038/039). All `validation.status === 'validated'`.
- `articoli.json` = 34 slots, all `validation.status === 'validated'` top-level (the AFTER reference).
- 3 count hardcodes for partitivos, all currently `expected: 44`: `tests/exercise-types.test.js:1274`, `tests/fixtures/slot-variants-integration.test.js:175`, `scripts/run-validation-271.mjs:91`.
- `TOTAL_EXPECTED = 348` (`scripts/run-validation-271.mjs:97`).
- Loader/validator live at `src/data/content-loader.js` (NOT `content/`) and `src/data/schema-validator.js`.

## File Classification

| File touched | Role | Data Flow | Closest Analog | Match Quality |
|--------------|------|-----------|----------------|---------------|
| `content/exercises/partitivos.json` (rewrite legacy `payload` → slot+`variants[]`) | content/data | transform | `content/exercises/articoli.json` (Phase 19 output) | exact (direct twin) |
| `tests/exercise-types.test.js` (re-sync count) | test | structure-assert | same file, articoli entry line 1273 (`expected: 34`) | exact |
| `tests/fixtures/slot-variants-integration.test.js` (re-sync count) | test | structure-assert | same file, articoli entry line 174 (`expected: 34`) | exact |
| `scripts/run-validation-271.mjs` (re-sync count + `TOTAL_EXPECTED`) | test/reporter | structure-assert | same file, articoli entry line 87 + total-history comment | exact |
| (reference, NOT modified) cross-vendor quorum for new surfaces | tooling | request-response | `scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise` | exact |

---

## Pattern Assignments

### `content/exercises/partitivos.json` (content rewrite — transform legacy → slot+variants)

**Analog:** `content/exercises/articoli.json` (Phase 19 post-conversion — 34 slots, all
`validated`). The mechanical legacy→slot transform is IDENTICAL; only the rule dimensions differ.

This is the single most important target. The file currently holds **44 legacy `payload`-shaped
exercises** (`partitivos-001..044`, all `partitivos`-only — 0 crosses) and must be rewritten into
the slot+`variants[]` shape, regrouped by rule per D-20-01..06.

#### BEFORE — current legacy `payload` shape (verified `partitivos-001`)

Multiple-choice legacy exercise (explanation lives INSIDE `payload`):

```json
{
  "id": "partitivos-001",
  "type": "multiple-choice",
  "categoryIds": ["partitivos"],
  "payload": {
    "prompt": "Compro ___ pane per la cena.",
    "options": ["del", "dello", "della", "dell'"],
    "correctIndex": 0,
    "explanation": "El partitivo no es una forma nueva: es di + el artículo determinativo. Pane es masculino y empieza por consonante simple (p-), que pide il, así que el partitivo es del (di + il)..."
  },
  "notes": "Incontable masc + consonante simple -> del (di + il)... Espejo D-01 con partitivos-014.",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "deepseek-v4-pro", "date": "2026-05-28", "verdict": "correcta", "concerns": [] },
      { "by": "claude-opus-4-7", "date": "2026-05-28", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

The legacy `match` exercise `partitivos-038` (note `payload.pairs` = array of `[noun, forma]`
2-tuples; explanation again INSIDE `payload`; right-column has 4 distinct values del/dello/dell'/della
satisfying R3; ONE intentional textual duplicate `del` on pane+vino, graded by index):

```json
{
  "id": "partitivos-038",
  "type": "match",
  "categoryIds": ["partitivos"],
  "payload": {
    "prompt": "Empareja cada sustantivo incontable con su forma partitiva singular...",
    "pairs": [["pane","del"],["zucchero","dello"],["acqua","dell'"],["vino","del"],["carne","della"]],
    "explanation": "La forma partitiva de un sustantivo no se memoriza suelta: es di más el artículo determinativo..."
  },
  "notes": "Match incontable D-08... Columna derecha: del, dello, dell', del, della -> 4 valores DISTINTOS... UN duplicado textual intencional (D-66)... status pending para quórum (D-15).",
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

The clasificación MC `partitivos-040` (D-20-04 / PART-05) — **note the 3-option shape**, NOT 4:

```json
{
  "id": "partitivos-040",
  "payload": {
    "prompt": "Ho mangiato del pane. -> Aquí 'del' funciona como ___",
    "options": ["partitivo", "preposición", "artículo determinativo"],
    "correctIndex": 0
  }
}
```

The negativa MC `partitivos-035` (D-20-03) — **note the "∅ / sin partitivo" option as correct**:

```json
{
  "id": "partitivos-035",
  "payload": {
    "prompt": "Non compro ___ pane.",
    "options": ["∅ / sin partitivo", "del", "dei", "dello"],
    "correctIndex": 0
  }
}
```

#### AFTER — canonical slot+variants shape to replicate (verified `articoli-il-cons`)

**Multi-variant slot.** `explanation` is at SLOT level (top-level, NOT inside any variant);
`variants[]` are FLAT surfaces with only `{prompt, options, correctIndex}` — no `type`, no
`explanation`, no `categoryIds` per variant. `validation` block at SLOT level (D-19-09 — read by
`VAL_07_STRICT`):

```json
{
  "id": "articoli-il-cons",
  "type": "multiple-choice",
  "categoryIds": ["articoli"],
  "explanation": "Ante una consonante simple el artículo determinativo masculino singular es il: il libro, il ragazzo... il es la forma por defecto del masculino singular...",
  "variants": [
    { "prompt": "Leggo ___ libro in giardino.",   "options": ["il","lo","l'","la"], "correctIndex": 0 },
    { "prompt": "Ho conosciuto ___ ragazzo ieri.", "options": ["il","lo","l'","la"], "correctIndex": 0 },
    { "prompt": "Dov'è ___ cane di Marco?",        "options": ["il","lo","l'","la"], "correctIndex": 0 },
    { "prompt": "Pulisco ___ tavolo della cucina.", "options": ["il","lo","l'","la"], "correctIndex": 0 }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "deepseek-v4-flash", "date": "2026-05-27", "verdict": "correcta", "concerns": [] },
      { "by": "claude-opus-4-7",   "date": "2026-05-27", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Slot-de-1** (single variant — same shape, `variants` of length 1). This is the shape for the 2
`match` slots (D-20-06: partitivos-038/039) and any slot-de-1 (the clasificación slot D-20-04
starts here and grows by variants). For `type:match` the variant surface is `{prompt, pairs}` (NO
`correctIndex`) — lift the legacy `payload` into a single variant, move `explanation` up to slot
level. Articoli already did exactly this for `articoli-049/050`.

**Mechanical mapping (legacy → slot), confirmed against `src/data/content-loader.js:43-95`
(`normalizeExerciseToSlot` + `variantFromPayload`):**

| `type` | legacy `payload` fields | slot `variants[k]` surface | where `explanation` goes |
|--------|-------------------------|----------------------------|--------------------------|
| `multiple-choice` | `prompt, options, correctIndex, explanation` | `{prompt, options, correctIndex}` | slot-level `explanation` |
| `match` | `prompt, pairs, explanation` | `{prompt, pairs}` | slot-level `explanation` |

#### Regrouping map (Phase-20-specific, from D-20-01..06 + CONTEXT notes)

The planner produces a `20-REAGRUPACION-MAP.md` (audited by author, mirroring `19-REAGRUPACION-MAP.md`).
Target slot families, derived from the verified `notes` of the 44 exercises:

- **del-formas, 1 slot per forma + split por sub-disparador (D-20-01, mirrors D-19-01/02):**
  del (001-004), dello → split **z** (005-006) / **s-impura** (007), della (008-010),
  dell' (011-013), dei (014-016), degli → split **s-impura** (017) / **vocal** (018) / **z** (019),
  delle invariable → 1 slot multi-variante (020-022, D-17-01).
- **alternativas, 3 slots (D-20-02):** qualche (027-029), un po' di (030-031),
  alcuni/e → 1 slot, género como variantes (032/033 — concordancia ≠ regla distinta).
- **omisión en negativa, 1 slot de contraste (D-20-03):** afirmativa (034 del, 036 degli) +
  negativa "∅" (035, 037) as variants of the SAME slot. The "∅" answer is a distinct skill → it
  earns a contrast slot. **Asymmetry vs D-20-05.**
- **partitivo-vs-preposizione, 1 slot de clasificación (D-20-04):** 040-044 as variants, mixing
  PARTITIVA + PREPOSITIVA examples. **3-option MC shape** (`partitivo / preposición / artículo
  determinativo`) — do NOT pad to 4. Splitting by function would break the classify skill.
- **pares contable/incontable (D-20-05): NO dedicated slot** — 023/024 ('Ho comprato…'),
  025/026 ('Ho preso…') absorbed each into its del-forma slot (023 del→slot del; 024 dei→slot dei).
- **match (D-20-06): 2 slots-de-1 `type:match`:** 038 (incontable) + 039 (contable plural).

**GOTCHAS (must follow exactly — verified against `src/data/schema-validator.js` + Phase 19 review):**
- **`payload` XOR `variants[]`** — never both (validator rejects both). The rewrite REMOVES `payload`, ADDS `variants[]`.
- **`explanation` at SLOT level for `variants[]` slots** (D-15-02) — REQUIRED, non-empty string. Variants carry NONE. When fusing legacy exercises, apply D-17-05: pick most complete + graft nuances. **Explanations must be RULE-FIRST** (lead with the disparador/rule, not a concrete noun) per D-19-07.
- **`validation.status` MUST be present TOP-LEVEL on every slot** (D-19-09). This was the auto-fixed Rule-2 bug in 19-03: the 2 new slots had variant-level validation but missed slot-level, breaking `VAL_07_STRICT` (`status: absent`). New partitivos slots created from new surfaces MUST carry the slot-level `validation` block, not just per-variant.
- **ASCII apostrophe U+0027** for `dell'` / `dall'` in options and prompts. Smoke test fails on smart quotes `'''""`. Legacy partitivos already uses `dell'` (U+0027) — preserve it.
- **`∅` (U+2205 EMPTY SET) is a legitimate option value** in the negativa slot (035/037) — it is NOT a smart-quote and must survive the rewrite verbatim.
- **Italian accents in moved surfaces (Phase 19 WR-01/WR-02 lesson):** the quorum only validates NEW surfaces. Phase 19 found legacy explanations with missing accents (`piu`→`più`, `è` sin acento) that human-verify passes approved. **Run an accent scan over the MOVED surfaces too**, not only the new ones — partitivos legacy may carry the same latent defects.
- **`match` `pairs`** = array of `[left, right]` 2-tuples; needs 3+ distinct right values (R3). 038 has del/dello/dell'/della (4 distinct); intentional duplicates (D-66) graded by index.
- **`categoryIds` is an ARRAY** even single-category: `["partitivos"]`. **No crosses exist** → no two-id entries (unlike articoli's 300..305).

**ID renumbering (D-20-07 — Claude's Discretion, confirmed 0 crosses):**
- ALL ids are FREE to renumber (progress reset in Phase 18; no shared ids with other categories).
- D-19-04 (reserve 300..305) does NOT apply — there is no `partitivos-30x` range to preserve.
- Scheme is planner's choice: clean sequential OR semantic `partitivos-{forma|regla}` (e.g.
  `partitivos-del-cons`, `partitivos-dello-z`, `partitivos-clasificacion`) per D-15-09 style.
  Articoli used semantic ids (`articoli-il-cons`, `articoli-lo-yi`) — strong precedent for semantic.

---

### `tests/exercise-types.test.js` (count re-sync — structure assertion)

**Analog:** the SAME file's articoli entry, already synced in 19-03 (line 1273: `expected: 34`).

**What to change (one number), line 1274:**

```js
const CATEGORIES_WITH_EXPLANATIONS = [
  ...
  { file: 'content/exercises/articoli.json', expected: 34 },
  { file: 'content/exercises/partitivos.json', expected: 44 },  // ← re-sync to new slot count
  ...
];
```

`expected: 44` becomes the new TOTAL slot count of the rewritten `partitivos.json` (del-forma
slots after fusion/split + 3 alternativa slots + 1 negativa slot + 1 clasificación slot + 2 match
slots + any new gap slots from D-19-06). **Read it programmatically from `data.exercises.length`,
never estimate** — 19-03 explicitly learned this (estimated ~25, real was 34).

**Why this is shape-agnostic (PILOT-05, verified lines 1284-1290):** the test bifurcates on shape
via `getExplanation` and `getPrompts`, which read `ex.variants` when present and fall back to
`ex.payload`. So partitivos converted to slots passes the explanation-coverage, smart-quote,
markdown, R1 prompt-leak and R2 cross-ref scans WITHOUT further test edits:

```js
const getExplanation = (ex) =>
  Array.isArray(ex.variants) ? ex.explanation : ex.payload?.explanation;
const getPrompts = (ex) =>
  Array.isArray(ex.variants) ? ex.variants.map(v => v?.prompt || '') : [ex.payload?.prompt || ''];
```

`assert.equal(data.exercises.length, expected, ...)` (lines 1301-1305) is the assertion that
breaks until the count is re-synced. The `VAL-07 — todos validated` gate (run under
`VAL_07_STRICT=1`) also reads this array and asserts every `ex.validation?.status === 'validated'`
at slot level → new slots must reach `validated` via quorum AND carry slot-level status.

---

### `tests/fixtures/slot-variants-integration.test.js` (count re-sync)

**Analog:** the SAME file's articoli entry (line 174: `expected: 34`).

**What to change, line 175:**

```js
const REAL_CATEGORIES = [
  ...
  { slug: 'articoli', expected: 34 },
  { slug: 'partitivos', expected: 44 }  // ← re-sync to new slot count
];
```

Same value as the other two hardcodes. This test asserts `validateContent` accepts the file and
the count matches `data.exercises.length`.

---

### `scripts/run-validation-271.mjs` (count re-sync + `TOTAL_EXPECTED` + history comment)

**Analog:** the SAME file's articoli sync in 19-03 (line 87: `expected: 34`; `TOTAL_EXPECTED`
370→348; total-history comment narrating the Articoli conversion at lines 75-80).

**Three edits:**

1. **Line 91** — partitivos `expected: 44` → new slot count (same value as the other 2 hardcodes).
2. **Line 97** — `TOTAL_EXPECTED = 348` → `348 − 44 + <new partitivos slot count>`.
3. **Lines 64-84 comment** — append a new history line narrating the Partitivi conversion, exactly
   mirroring the Articoli precedent at lines 75-80:

```
//   → <new total> (v1.5 Phase 20, PART-03): Partitivi se convirtió al shape slot+variantes.
//   La reagrupación fundió 44 ejercicios payload por forma/disparador → N slots + M slots
//   nuevos por quórum cross-vendor = <slot count> slots reales. TOTAL = 348 − 44 + <count>.
```

The reporter FAILS if the on-disk sum ≠ `TOTAL_EXPECTED` (protects against deleted/duplicated
exercises). VAL-06 asserts `totalValidated === TOTAL_EXPECTED` (lines 313-320).

**Run command (project convention, from memory):** `node --test tests/*.test.js`. Strict gate:
`VAL_07_STRICT=1 node --test tests/*.test.js`. Reporter: `node scripts/run-validation-271.mjs`.
Bare single-file invocation can fail on Node 22.20 — use the glob.

---

### Cross-vendor quorum pipeline (REFERENCE — no source edits; invoked for new surfaces)

New variants (D-19-05, engordar celdas pobres — e.g. dello+s-impura, degli+vocal, degli+z to ≥2)
and new gap slots (D-19-06, suoni speciali huecos — e.g. dello+gn/ps/x, degli+gn/ps if natural A1
noun exists) enter ONLY if they pass the full cross-vendor quorum R1-R7 (D-17-07). Both tools
already built and exercised in Phase 19 (8 surfaces, 0 excluded).

**1. `scripts/validate-ai-pass.mjs`** — external-model pass (Gemini + DeepSeek, auto-fallback on
429, keys in `.env`). Invocation:

```
node scripts/validate-ai-pass.mjs <exercise-id> [--model=…] [--fallback=a,b,c] [--avoid=x,y] [--write] [--dry-run] [--temp=n]
```

- Locates the exercise by exact `id` scan across `content/exercises/*.json` + `tests/fixtures/*.json`.
- `--write` MUTATES `validation.passes[]` IN-PLACE (surgical brace-balanced rewrite preserving compact format); anchor is `"id": "<id>"` closing-quote anchor.
- `status` is re-derived by `deriveStatus()` from `src/data/validation-state.js` after each write — do NOT hand-edit `status`.
- A written pass: `{ "by": "<model>", "date": "YYYY-MM-DD", "verdict": "...", "concerns": [...] }`. `by` = model that actually answered (fallback-aware) so ">=2 distinct `by`" holds.

**2. skill `gsd-validate-exercise`** — Claude pass (`.claude/skills/gsd-validate-exercise/SKILL.md`):
- **NEVER batched** — one fresh-context Task() subagent per exercise (VAL-03).
- Pinned model IDs `claude-opus-4-7` (pass 1) + `claude-sonnet-4-6` (pass 2), sequential, written to `validation.passes[]`, 1 commit per exercise.
- Applies C1-C5 (operationalization of R1-R7); the subagent inherits NO project context.
- **Fallback when Task unavailable to executor (Phase 19 precedent):** the Claude half can run via `claude -p --model claude-opus-4-7` / `--model claude-sonnet-4-6` headless, 1 process per model per surface, VALIDATION-PROMPT verbatim, exercise stripped of its `validation` field to avoid biasing. Functionally equivalent 1-por-1 NEVER batched.

**GOTCHAS for new surfaces (R6 + memory + Phase 19 lessons):**
- **R6 critical for del-forma gap slots** — verify the Italian noun, its gender/number, AND the di+articolo contraction before authoring (`dello gnomo`? `dello psicologo`? `degli psicologi`?). Suoni speciali are easy-error terrain; Phase 19 confirmed `lo iodio` (NOT l'iodio) only via quorum.
- **Validate the new surface as an ISOLATED legacy `payload` exercise FIRST, then move it into `variants[]`** (Phase 19 pattern, 19-02). Each new variant = new SURFACE → its own quorum even inside an existing slot.
- **DeepSeek strict on accents, Opus lenient** → complement with an accent scan. Phase 19 hit a DeepSeek C4 false-positive hallucinating accents on correct text → resolved by re-run (no content override-shortcut; quality > tokens).
- **R7 gloss** `(en español: …)` in prompts is author canon, NOT a leak. The C5-leak Gemini/DeepSeek flag is a policy false-positive; approval baseline = Claude Opus+Sonnet.
- **Italian-specific Partitivi pitfalls to expect** (CONTEXT §explicación): trampa de género de `latte`, calco del plural español en `qualche` (always singular), di+articolo contraction errors.

---

## Shared Patterns

### Slot normalization contract (the border the engine consumes)
**Source:** `src/data/content-loader.js:43-95` (`normalizeExerciseToSlot` + `variantFromPayload`), feeding `slotById` (line 154).
**Apply to:** every slot in `partitivos.json`.
Both paths feed the SAME `slotById` map: `variants[]` slots pass through; legacy `payload` slots
auto-normalize to slot-de-1. NFC normalization happens at the loader border; authoring should keep
files NFC + ASCII apostrophes. The regrouped partitivos flows through the same path with NO loader
change. `type:match` is supported at slot level (Phase 19 first real use, partitivos reuses it).

### Validator gate (what the rewritten file must pass)
**Source:** `src/data/schema-validator.js` (slot branch) via runner `scripts/validate-content-fixture.mjs`.
**Apply to:** the whole rewritten `partitivos.json`.
Run: `node scripts/validate-content-fixture.mjs partitivos content/exercises/partitivos.json`
(exit 0 = valid). Enforced: `payload` XOR `variants[]`; non-empty slot `explanation` when
`variants[]`; `variants[]` non-empty; each variant a flat surface valid for slot `type`
(`multiple-choice`: prompt with `___`, 3-4 options, `correctIndex` in range; `match`: pairs).

### Smoke / structure + reporter (count sync)
**Source:** `tests/exercise-types.test.js` (CATEGORIES_WITH_EXPLANATIONS), `tests/fixtures/slot-variants-integration.test.js` (REAL_CATEGORIES), `scripts/run-validation-271.mjs` (CATEGORIES + TOTAL_EXPECTED).
**Apply to:** all 3 partitivos hardcodes + `TOTAL_EXPECTED` must agree on the SAME real slot count
read from `data.exercises.length`. The editorial invariants (explanation coverage, ASCII
apostrophes, no markdown, R1/R2 scans) run automatically once the count is correct.

### Validation top-level for the gate (D-19-09)
**Source:** `tests/exercise-types.test.js` VAL-07 gate (reads `ex.validation?.status` at slot level).
**Apply to:** every NEW slot created from new surfaces.
Phase 19's 19-03 Rule-2 fix: new slots had per-variant validation but missed slot-level →
`VAL_07_STRICT` saw `status: absent`. Mirror the 32 already-correct slots: add the `validation`
block (`status: validated` + `passes[]`) at SLOT level, reflecting the shared cross-vendor quorum
of its variants. Do NOT invent validation — elevate the variant-level approved quorum to slot level.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | — | — | Every touched file has an EXACT analog in Phase 19 Articoli. The two Partitivi-specific surface shapes — the 3-option clasificación MC (D-20-04) and the `∅`-option negativa MC (D-20-03) — are NOT new structurally: both are ordinary `{prompt, options, correctIndex}` variant surfaces (3 or 4 options, `correctIndex` in range), already valid under `schema-validator.js` and already present as legacy in `partitivos.json` (verified 040, 035). They simply move intact into `variants[]`. |

## Metadata

**Analog search scope:** `content/exercises/`, `src/data/`, `scripts/`, `tests/`, `tests/fixtures/`, `.claude/skills/`, prior phase artifacts (19-PATTERNS, 19-01/02/03 SUMMARYs).
**Files scanned:** `partitivos.json`, `articoli.json`, `content-loader.js`, `schema-validator.js`, `exercise-types.test.js`, `slot-variants-integration.test.js`, `run-validation-271.mjs`, `validate-ai-pass.mjs`, `validate-content-fixture.mjs`.
**Verified facts:** partitivos = 42 MC + 2 match = 44, all legacy `payload`, all `validated`, 0 variants, 0 crosses; articoli = 34 slots all `validated` top-level; 3 hardcodes all `expected: 44`; `TOTAL_EXPECTED = 348`; loader at `src/data/content-loader.js`.
**Pattern extraction date:** 2026-06-05
