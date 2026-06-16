# Phase 30: Alta de `presente-regolare` (registro + slots de regla + variantes por quórum) - Pattern Map

**Mapped:** 2026-06-17
**Files analyzed:** 2 (1 create, 1 modify)
**Analogs found:** 2 / 2 (both exact)

> **Nature of this phase:** CONTENT-AUTHORING / brownfield puro. NO engine, runtime,
> render, sampler or migration code is touched. The new content file is born directly
> in the unified slot+variant format (CONV-01). The only "patterns" to copy are the
> exact JSON shapes of the two analog content files — these JSON shapes ARE the contract
> that `src/data/schema-validator.js` enforces at boot.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/presente-regolare.json` (CREATE) | content / data (exercise slots) | batch / static-load | `content/exercises/essere.json` + `content/exercises/avere.json` | exact (slot+variant format, both already migrated) |
| `content/categories.json` (MODIFY) | content / registry | static-load | the 9 existing entries (lines 3-11) | exact |

**No source code (`.js`) files are created or modified in this phase.**
`src/data/schema-validator.js` is read-only here — it is the SHAPE CONTRACT the new JSON must satisfy, not a file to edit.

---

## Pattern Assignments

### `content/exercises/presente-regolare.json` (content, slot+variant)

**Analogs:** `content/exercises/essere.json` (multiple-choice slots + word-buttons slots), `content/exercises/avere.json` (adds the match shape — for REFERENCE only, NOT used here per D-30-05).

#### Top-level file shape (copy exactly)

The file is a single object with an `exercises` array. Each entry is a **slot** (one rule, ≥2 interchangeable variants). Source: `essere.json` lines 1-2 + 4-49.

```json
{
  "exercises": [
    {
      "id": "presente-regolare-...",
      "type": "multiple-choice",
      "categoryIds": ["presente-regolare"],
      "explanation": "...",
      "variants": [ /* ≥2 entries */ ],
      "validation": { "status": "...", "passes": [ ... ] }
    }
  ]
}
```

Field rules (verified against `schema-validator.js`):
- `id` — globally unique slug, kebab `presente-regolare-…` (validator lines 104-112, ID checked at content-load only for category ids; exercise id just needs to be a non-empty unique string). Mirror `essere-sono`, `essere-wb-identidad` naming.
- `type` — MUST be one of `multiple-choice`, `word-buttons`, `match` (validator dispatch table lines 30-34, 118-122). This phase uses only the first two (D-30-05: 0 match).
- `categoryIds` — non-empty array of known category ids (validator lines 125-137). Single-cat here: `["presente-regolare"]`. (Cross-cat `["presente-regolare","avere"]`-style entries are Phase 31, NOT this phase.)
- `explanation` — REQUIRED at slot level when `variants[]` present; must be non-empty string (validator `validateVariants` lines 202-205). Plain-text Spanish, accented canon (PRES-05). NO `payload` + `variants` together, NO neither (validator lines 144-156).
- `variants` — non-empty array; each entry is a FLAT surface object for the slot's `type` (validator lines 207-221).
- `validation` — top-level metadata block, filled by the quórum, not by hand (see Shared Patterns).

#### Variant surface — `multiple-choice` (copy from `essere.json` lines 10-31, slot `essere-sono`)

Each variant is `{prompt, options[], correctIndex}`:

```json
{
  "prompt": "Io ___ Maria.",
  "options": ["sei", "sono", "ho", "siamo"],
  "correctIndex": 1
}
```

Surface constraints (validator `validateMultipleChoiceSurface` lines 429-446):
- `prompt` — string that MUST contain the hole `___`.
- `options` — array of **3 or 4** non-empty strings (NOT 2, NOT 5+).
- `correctIndex` — integer in `[0, options.length)`.

For `presente-regolare`: prompt = `"Io ___ italiano."` style; the hole takes the conjugated form; distractor options are WRONG conjugations of the SAME or a near verb (e.g. for `parlo`: `parli`, `parla`, `parlate`). Per D-30-01 each variant of a slot varies verb + person together (var1 `io`+verbA, var2 `tu`+verbB).

#### Variant surface — `word-buttons` (copy from `essere.json` lines 775-792, slot `essere-wb-identidad`)

Each variant is `{prompt(ES), answer[], distractors[]}` — builds the FULL sentence (D-30-07), exact mirror of avere/essere:

```json
{
  "prompt": "Yo soy María y él es Luca.",
  "answer": ["io", "sono", "Maria", "e", "lui", "è", "Luca"],
  "distractors": ["ho", "ha"]
}
```

Compact avere example (`avere.json` lines 487-499, slot `avere-wb-posesion`):

```json
{
  "prompt": "Yo tengo un coche.",
  "answer": ["io", "ho", "una", "macchina"],
  "distractors": ["hai", "sono"]
}
```

Surface constraints (validator `validateWordButtonsSurface` lines 488-508):
- `prompt` — non-empty string. **CONVENTION (load-bearing):** in word-buttons the `prompt` is the SPANISH sentence to translate; `answer[]` are the ordered ITALIAN tokens. (Inverse of multiple-choice, where prompt is Italian with a hole.)
- `answer` — array of ≥1 non-empty string tokens (the ordered correct Italian sentence).
- `distractors` — optional array of non-empty strings (wrong word-buttons offered alongside).

For `presente-regolare`: `answer[]` = full Italian sentence `["io","parlo","italiano"]`; `distractors[]` = wrong verb FORMS (`"parli"`,`"parla"`) per D-30-07. NOT syllables/letters (would break render — forbidden in brownfield). The `-isc-` slot carries word-buttons obligatorily (D-30-04): e.g. answer `["io","finisco","il","lavoro"]`, distractors `["fino","fino"]`.

#### Variant surface — `match` (REFERENCE ONLY — NOT used, D-30-05)

Captured for completeness. Source: `avere.json` lines 565-587, slot `avere-match-persone-1`. Each variant is `{prompt, pairs[][]}`:

```json
{
  "prompt": "Empareja el sujeto con la forma de avere.",
  "pairs": [ ["io", "ho"], ["tu", "hai"], ["lui", "ha"], ["noi", "abbiamo"] ]
}
```

Surface constraints (validator `validateMatchSurface` lines 554-582): `prompt` non-empty string; `pairs` array of 2-10 tuples; each pair exactly 2 non-empty strings. R3 (memory) additionally requires ≥3 distinct values per side if reintroduced.

> **Why presente-regolare has 0 match (D-30-05):** `io→parlo` is derivable by root (`parl-` + ending), so a match would be "drag without thinking" (violates D-04/R3). Contrast: avere/essere DO have match because `ho/hai/ha/abbiamo` are NOT root-derivable. **This decision must be documented `notes` (autor-internal) in the JSON** per CONTEXT D-30-05.
>
> **PLANNER ALERT — no `notes` precedent exists.** A `grep` of all `content/exercises/*.json` found ZERO usage of a `notes` field anywhere in the codebase. The validator (`validateContent`, lines 65-175) only checks KNOWN fields and never rejects unknown keys, so an extra `notes` (top-level sibling of `exercises`, or per-exercise) passes validation silently. The planner must DECIDE the placement convention for this autor-internal note since there is no analog to copy. Recommended: a top-level `"notes"` string sibling to `"exercises"` in the file (clearly file-scoped, won't collide with any exercise field the validator inspects).

#### Slot inventory the JSON must materialize (from CONTEXT, for planner reference, NOT a code pattern)

6 rule-slots (D-30-02), each ≥2 variants (D-30-03), `-isc-` ≥3 variants + word-buttons (D-30-04):
1. `-are` · 2. `-ere` · 3. `-ire` simple · 4. `-ire` con `-isc-` (refuerzo) · 5. ortográficos velares `-care/-gare` · 6. ortográficos palatales `-ciare/-giare`.
All 6 persons (io/tu/lui/noi/voi/loro) must appear ≥1× across the category (D-30-03). multiple-choice in all slots; word-buttons selective (D-30-06).

---

### `content/categories.json` (content, registry) — MODIFY

**Analog:** the 9 existing entries (lines 3-11). Add ONE entry with `order: 10` (PRES-01).

Existing shape (line 11, last entry):
```json
{ "id": "partitivos", "name": "Partitivi", "order": 9 }
```

New entry to append inside the `categories` array (CONTEXT suggested name; italian, mirrors the style of the other 9):
```json
{ "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 }
```

Constraints (validator lines 77-90):
- `id` — slug ASCII `^[a-z0-9][a-z0-9-]*$`, unique (no duplicate of the 9 existing).
- `name` — non-empty string (Italian per the 9-entry convention).
- `order` — not validated by the schema, but the 9 entries are strictly sequential 1-9; `10` continues the sequence.
- Keep the hand-aligned column formatting of the existing entries (cosmetic, but matches the file's hand-edited style).

---

## Shared Patterns

### `validation` block (quórum metadata)

**Source:** every slot in both analogs, e.g. `essere.json` lines 32-48; the rich cross-vendor variant at `essere-ser-estar` lines 1211-1245; the disputed→autor-override audit trail at `avere-passato-prossimo` lines 451-477.
**Apply to:** EVERY exercise/slot in the new file.

Shape (validator `validateValidationShape` lines 608-654):
```json
"validation": {
  "status": "validated",
  "passes": [
    { "by": "claude-opus-4-8", "date": "2026-06-17", "verdict": "correcta", "concerns": [] },
    { "by": "claude-sonnet-4-6", "date": "2026-06-17", "verdict": "correcta", "concerns": [] }
  ]
}
```
- `status` ∈ `pending` | `validated` | `disputed`.
- `passes[].by` non-empty string (model id, or `"autor"` for oracle override).
- `passes[].date` ISO `YYYY-MM-DD`.
- `passes[].verdict` ∈ `correcta` | `incorrecta`.
- `passes[].concerns` optional array of strings.
- **Filled by the quórum, NOT by hand** (CONTEXT code_context): skill `gsd-validate-exercise` (1-per-1, fresh-context subagent, NEVER batched — VAL-03) + `scripts/validate-ai-pass.mjs` (cross-vendor). `disputed` → autor-oracle override with audit-trail concern (see the `avere-passato-prossimo` override at lines 469-476 as the canonical pattern: an `"autor"` pass with `"[override] ..."` concern).

### `payload` XOR `variants` — never legacy here

**Source:** validator lines 139-165.
**Apply to:** every slot in the new file → ALWAYS use `variants[]` (the new file is born in slot format, never the legacy `payload` branch). Slot-level `explanation` is mandatory; per-variant `explanation` does NOT exist in the variants branch.

### Authoring rules R1-R7 (memory `exercise-authoring-rules`) + gloss ES canon (R7)

**Apply to:** every variant's prompt/options/answer/explanation.
- R1: prompt carries NO rule/solution. R2: no `#NNN` refs. R4: explanation student-focused. R6: one pedagogical modification per exercise. R7: exactly one valid option + gloss `(en español: …)` canon.
- **Gloss ES is canon (memory `gloss-es-desambiguacion-canon`):** the `(en español: …)` C5-leak that Gemini/DeepSeek flag is a false-positive; base of approval = Claude Opus+Sonnet.
- **Cross-vendor catches bugs (memory `feedback-cross-vendor-catches-bugs`):** DeepSeek strict on accents, Opus lenient → complement with an accent scan of the Spanish canon `explanation` text.

### Test/validation invariants the JSON must satisfy (consumed Phase 31, but content must comply now)

**Source:** `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS` smoke). The new JSON must satisfy content invariants (coverage / ASCII apostrophes / no-markdown) even though the smoke-table entry is added in Phase 31. Test runner: `node --test tests/*.test.js` (bare path fails on Node 22.20 — memory `test_command_node_glob`).

---

## No Analog Found

| File / Field | Role | Reason |
|--------------|------|--------|
| `notes` (autor-internal 0-match doc, D-30-05) | content metadata | NO `notes` field exists in any `content/exercises/*.json`. Validator does not reject unknown keys, so it is free-form. Planner must choose placement (recommended: top-level string sibling of `exercises`). |

Everything else has an exact analog (slot+variant format already established in essere.json/avere.json since Phase 15).

---

## Metadata

**Analog search scope:** `content/exercises/`, `content/categories.json`, `src/data/schema-validator.js`
**Files scanned:** 4 (CONTEXT.md, categories.json, essere.json, avere.json, schema-validator.js) + grep across all `content/exercises/*.json` for `notes`
**Pattern extraction date:** 2026-06-17
