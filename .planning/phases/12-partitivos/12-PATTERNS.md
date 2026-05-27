# Phase 12: Partitivos - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 5 (1 doc, 1 content JSON, 3 integration-point edits)
**Analogs found:** 5 / 5 (all exact — this is a deliberate calque of Phase 11 Articoli)

> CONTENT-ONLY phase. NO engine/UI/schema/sampler code. The 5 files below are the
> complete surface (CONTEXT.md §Integration Points). Every analog is a Phase-11
> Articoli artifact — Partitivos imitates it 1:1, minus the bridges.

## File Classification

| File | NEW / MODIFY | Role | Data Flow | Closest Analog | Match |
|------|--------------|------|-----------|----------------|-------|
| `.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md` | NEW | planning-doc (coverage checklist) | transform (cells→exercise count) | `.planning/phases/11-articoli/11-TEMARIO-ARTICOLI.md` | exact |
| `content/exercises/partitivos.json` | NEW | content (exercise data) | CRUD (static JSON read by engine) | `content/exercises/articoli.json` | exact |
| `content/categories.json` | MODIFY | config (category registry) | CRUD | existing entries (esp. `articoli` order 8) | exact |
| `scripts/run-validation-271.mjs` | MODIFY | config (validation reporter) | batch (sum-check) | `CATEGORIES[]` entry + `TOTAL_EXPECTED` | exact |
| `tests/exercise-types.test.js` | MODIFY | test (explanation coverage) | batch (per-file assert) | `CATEGORIES_WITH_EXPLANATIONS[]` line | exact |

---

## Pattern Assignments

### 1. `.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md` (NEW, planning-doc)

**Analog:** `.planning/phases/11-articoli/11-TEMARIO-ARTICOLI.md` (read in full, 168 lines)
**read_first for planner:** `.planning/phases/11-articoli/11-TEMARIO-ARTICOLI.md`

The temario is the FIRST deliverable (D-13), committed BEFORE `partitivos.json` exists.
It is a Markdown planning doc (markdown allowed — NOT an exercise payload), and its
structure is the count source: each cell maps to >=1 exercise.

**Section skeleton to imitate** (`11-TEMARIO-ARTICOLI.md`):

| Section in Articoli temario | Line(s) | Partitivos equivalent |
|------------------------------|---------|------------------------|
| Header: Fase / Entregable (PRIMER) / Propósito (checklist) | 1-5 | same boilerplate, "PART-02", commit-before-JSON note |
| `**Convenciones de este documento:**` (ASCII apostrophes, italian preserved, español acentuado, markdown OK here) | 7-11 | copy verbatim (canon is identical, D-15) |
| `## Regla nuclear (el disparador fonetico...)` + form×trigger table | 15-33 | `## Regla nuclear` — del/dello/della/dell'/dei/degli/delle inherit the SAME phonetic triggers (D-04: del=di+il) |
| `## Determinativi` + 4 sub-tables (masc sing / masc plural / fem sing / fem plural) | 37-79 | restructure around the **semantic axis** (D-01): `## Incontable (singular)` vs `## Contable (plural)` instead of det/indet split |
| `## Indeterminativi` | 83-108 | replace with `## Alternativas` block: `alcuni/alcune` (plural only), `qualche` (always singular), `un po' di` (incontable only) — each as grammatical-restriction trap (D-03) |
| `## Trampas canonicas (D-04 ... cada una >=1 ejercicio)` numbered table | 112-126 | `## Trampas canonicas (PART)`: qualche+sing, un po' di+incontable, alcuni/alcune+plural, dell' elision, degli before vowel/s-impure, **omisión en negativa** (D-02) |
| `## Espejo pedagogico` contrast table | 130-140 | `## Espejo incontable/contable` — "Ho comprato ___ pane" vs "___ mele" (D-01); plus `## Distinción partitivo vs preposición` for PART-05 (D-05) |
| `## Fuera de alcance (A2 / fuera de v1.2)` | 144-151 | A2 rares out (degli dei, literary) — D-deferred |
| `## Conteo derivado (orientativo...)` per-block table → **Total** | 155-167 | per-block table; **target ~30-40** (D-09), NOT ~45-55 — NO bridge row (D-14) |

**Concrete excerpt — the "Conventions" block to copy verbatim** (`11-TEMARIO-ARTICOLI.md:7-11`):

```markdown
**Convenciones de este documento:**
- Apostrofes ASCII U+0027 en todas las formas elididas (`l'`, `un'`) — nunca comillas tipograficas.
- Terminos italianos preservados con su ortografia (studente, zio, psicologo, gnocchi, ...).
- Texto explicativo en espanol acentuado (canon D-135).
- Markdown estandar permitido aqui (es un documento de planificacion, NO un payload de ejercicio).
```

**Concrete excerpt — the derived-count table shape to copy** (`11-TEMARIO-ARTICOLI.md:155-167`):

```markdown
## Conteo derivado (orientativo — el conteo final lo fijan los planes ...)

| Bloque | Celdas obligatorias | Ejercicios estimados (con varios contextos) |
|--------|---------------------|---------------------------------------------|
| Determinativi masc sing (`il/lo/l'`) | il + lo(x5 disparadores) + l' | ~10-12 |
...
**Total orientativo: ~45-55 ejercicios** (D-12). El temario es la unica fuente del conteo ...
```

> DIFF vs analog: Articoli temario has a **Bridges multi-cat** row (line 165) and totals
> ~45-55. Partitivos has **NO bridge row** (D-14) and totals **~30-40** (D-09). Drop that row.

---

### 2. `content/exercises/partitivos.json` (NEW, content / CRUD)

**Analog:** `content/exercises/articoli.json` (1641 lines, 56 exercises)
**read_first for planner:** `content/exercises/articoli.json` lines 1-31 (mc shape), 1395-1465 (match shape)
**Differentiate from:** `content/exercises/preposiciones.json` (PART-05 — see "Shared Patterns" below)

**Top-level file structure** (`articoli.json:1-2` open, `1637-1641` close):

```json
{
  "exercises": [
    { ... exercise objects ... }
  ]
}
```

Single root key `exercises` (array). No metadata, no schemaVersion in this file.

**multiple-choice exercise shape — copy this skeleton** (`articoli.json:3-31`, exercise `articoli-001`):

```json
{
  "id": "articoli-001",
  "type": "multiple-choice",
  "categoryIds": ["articoli"],
  "payload": {
    "prompt": "Leggo ___ libro in giardino.",
    "options": ["il", "lo", "l'", "la"],
    "correctIndex": 0,
    "explanation": "Ante una consonante simple (l-) el artículo determinativo masculino singular es il: il libro. La forma lo se reserva para sonidos especiales (s+consonante, z, gn, ps, x) y l' para las vocales; aquí ninguno aplica. El hispanohablante tiende a elegir bien il en estos casos: la dificultad real aparece con lo y l', no con il."
  },
  "notes": "Determinativo masc sing il ante consonante simple (celda il/consonante). Distractoras lo/l'/la = errores ante otros disparadores.",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "deepseek-v4-flash", "date": "2026-05-27", "verdict": "correcta", "concerns": [] },
      { "by": "claude-opus-4-7",  "date": "2026-05-27", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

Field-by-field for Partitivos:
- `id`: `partitivos-001`, `partitivos-002`, ... — **NO `-300..` bridge series** (D-14; Articoli used `articoli-300..305` — do NOT replicate).
- `type`: `"multiple-choice"` (backbone, D-07) | `"match"` (1 block, D-08) | `"word-buttons"` (almost none, D-07).
- `categoryIds`: `["partitivos"]` always — even PART-05 classification exercises (D-06: NO bridge to Preposiciones).
- `payload.prompt`: italian sentence with `___` blank. For PART-05 (D-05) the prompt is the full sentence and `options` become `["partitivo", "preposición"]`.
- `payload.options`: distractors = other plausible partitive forms (D-Discretion: `del/dello/della` for incontable, `dei/degli/delle` for plural). For the omission mini-block (D-02) include `"∅ / sin partitivo"` as a valid option.
- `payload.correctIndex`: integer (grading by index — see grading note below).
- `payload.explanation`: curated, canon below.
- `notes`: author-facing rationale citing the temario cell + D-refs (free text, not graded).
- `validation`: see shape block below.

**match exercise shape — copy this skeleton** (`articoli.json:1395-1430`, exercise `articoli-049`):

```json
{
  "id": "articoli-049",
  "type": "match",
  "categoryIds": ["articoli"],
  "payload": {
    "prompt": "Empareja cada sustantivo con su artículo determinativo.",
    "pairs": [
      ["studente", "lo"],
      ["zio", "lo"],
      ["psicologo", "lo"],
      ["gnocchi", "gli"],
      ["amici", "gli"],
      ["zii", "gli"],
      ["libri", "i"]
    ],
    "explanation": "..."
  },
  "notes": "... 3 valores distintos en columna derecha (lo, gli, i) cumple R3. Duplicados textuales intencionales (D-66): lo x3, gli x3 — el grading consume por indice. DESIGN RULE: articolo<->sustantivo no es derivable por raiz ...",
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

For Partitivos match (D-08): pairs = sustantivo↔forma partitiva, e.g.
`["pane","del"], ["zucchero","dello"], ["acqua","dell'"], ["studenti","degli"], ["mele","delle"], ["libri","dei"]`.
- Right column MUST have **>=3 distinct values** (R3 / authoring rule). The six forms above give 6 distinct → satisfied.
- Textual duplicates in the right column ALLOWED (D-66) — several nouns can share `del`/`degli`/`delle`; grading consumes by index.
- Satisfies DESIGN RULE: pairing depends on gender + phonetic trigger + number, NOT shared root → not root-derivable (CONTEXT.md §Established Patterns).

**validation block shape** (`{ status, passes: [{ by, date, verdict, concerns }] }`) — exact, from `articoli-001:14-30`:

```json
"validation": {
  "status": "validated",
  "passes": [
    { "by": "deepseek-v4-flash",  "date": "<YYYY-MM-DD>", "verdict": "correcta", "concerns": [] },
    { "by": "claude-sonnet-4-6",  "date": "<YYYY-MM-DD>", "verdict": "correcta", "concerns": [] }
  ]
}
```

> DIFF vs analog `by[]`: Articoli used `deepseek-v4-flash` + `claude-opus-4-7`. Phase 12
> quorum pool is **`deepseek-v4-flash` + `claude-sonnet-4-6`** (D-10). The `by` field MUST
> carry the model tier, never a bare vendor key like `"deepseek"` (D-12 invariant). Two
> distinct `by` values → `deriveStatus` returns `validated` (CONTEXT.md §Established Patterns).
> Author-written exercises start `status: "pending"` (or omit passes) until the quorum runs (D-15);
> only commit `validated` after >=2 distinct `by` pass.

**curated `explanation` canon** — concrete model (`articoli-001` payload, line 11):

> "Ante una consonante simple (l-) el artículo determinativo masculino singular es il: il libro.
> La forma lo se reserva para sonidos especiales (s+consonante, z, gn, ps, x) y l' para las vocales;
> aquí ninguno aplica. El hispanohablante tiende a elegir bien il en estos casos: la dificultad real
> aparece con lo y l', no con il."

Canon rules visible in that string (CONTEXT.md D-15 / §Established Patterns):
- **Español acentuado** — `artículo`, `aquí`, `dificultad` carry á/í/etc. (D-135 RAE).
- **Italianismos preserved** — `il libro`, `lo`, `l'` keep italian spelling, no accent imposed.
- **ASCII apostrophes U+0027** — `l'` uses `'` (0x27), never `'` smart-quote (CONT-06; tested by `tests/exercise-types.test.js` invariant 2).
- **Plain text, NO markdown** — no `**`, `__`, `##`, backticks (T-02-01 anti-XSS; tested by invariant 3).
- **NO internal refs** — never cite another exercise by ID (R2; see `preposiciones-016` notes at `preposiciones.json:260` for a documented fix where a `del ejercicio 003` ref was removed).

For PART-05 the explanation must state that the **prepositive function lives in the Preposiciones
category, not here** (D-06 / ROADMAP criterion 3) — contrast, don't re-teach.

---

### 3. `content/categories.json` (MODIFY, config)

**Analog:** the 8 existing entries (read in full, 13 lines).
**read_first for planner:** `content/categories.json` (whole file).

**Verbatim existing entries** (`categories.json:3-10`):

```json
{ "id": "avere",                   "name": "Avere (auxiliar)",        "order": 1 },
{ "id": "essere",                  "name": "Essere (cópula)",         "order": 2 },
{ "id": "preposiciones",           "name": "Preposiciones",           "order": 3 },
{ "id": "sustantivos-irregulares", "name": "Sustantivos irregulares", "order": 5 },
{ "id": "articoli",                "name": "Articoli (artículos)",    "order": 8 }
```

**Exact edit:** append a 9th entry after `articoli` (order 8), inside the `categories` array, before the closing `]` at line 11:

```json
{ "id": "partitivos",              "name": "Partitivos",              "order": 9 }
```

Convention notes (verified against the live file):
- Keys in fixed order: `id`, `name`, `order`. Whitespace is **column-aligned** (values padded with spaces) — match the alignment.
- `id` is a kebab-case slug matching the exercise filename (`partitivos` ↔ `content/exercises/partitivos.json`).
- `order` is sequential 1..N (highest existing = 8). Next is **9** (matches CONTEXT.md D-Discretion).
- `name` convention is **mixed**: some plain (`Preposiciones`, `Profesiones`), some with a parenthetical gloss (`Avere (auxiliar)`, `Articoli (artículos)`). CONTEXT.md offers both `"Partitivos"` and `"Partitivos (partitivo)"` — planner picks one at execution (Claude's Discretion). Given the slug already reads as Spanish, plain `"Partitivos"` is the lean default; gloss is the analog-consistent choice if the planner wants to mirror `Articoli (artículos)`.
- **No `order` collision:** order 4 (`verbos-movimiento`) and order 7 (`profesiones`) are present in the file too (not shown in the 5-line excerpt above) — full set is 1-8 contiguous. Adding 9 is safe.

> Adding this entry auto-surfaces the home-row + Examen button via `categoriesForDisplay`
> (src/screens/app.js ~2141, per CONTEXT.md §Reusable Assets) — **zero UI code** (satisfies PART-01).

---

### 4. `scripts/run-validation-271.mjs` (MODIFY, config / batch)

**Analog:** the `CATEGORIES[]` array + `TOTAL_EXPECTED` constant.
**read_first for planner:** `scripts/run-validation-271.mjs` lines 63-81.

**Exact current state** (`run-validation-271.mjs:70-81`):

```js
const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 51 },
  { slug: 'articoli',                 file: 'content/exercises/articoli.json',                 expected: 56 },
  { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 23 },
  { slug: 'essere',                   file: 'content/exercises/essere.json',                   expected: 39 },
  { slug: 'genero-numero',            file: 'content/exercises/genero-numero.json',            expected: 40 },
  { slug: 'profesiones',              file: 'content/exercises/profesiones.json',              expected: 51 },
  { slug: 'sustantivos-irregulares',  file: 'content/exercises/sustantivos-irregulares.json',  expected: 31 },
  { slug: 'verbos-movimiento',        file: 'content/exercises/verbos-movimiento.json',        expected: 37 },
];

const TOTAL_EXPECTED = 328;
```

**Entry shape to copy** (one element, column-aligned): `{ slug: '<cat>', file: 'content/exercises/<cat>.json', expected: N }`.

**Exact edit (two changes):**
1. Add the partitivos entry. Order is **"riesgo-first (preposiciones) + alfabético resto"** (comment line 63). Alphabetically `partitivos` sits between `genero-numero` and `profesiones` — insert after line 75 (`genero-numero`):
   ```js
   { slug: 'partitivos',               file: 'content/exercises/partitivos.json',               expected: N },
   ```
2. Bump `TOTAL_EXPECTED` (line 81): `328 → 328 + N`, where **N = the final partitivos exercise count from the temario** (D-13). Update lockstep — the reporter fails if disk sum ≠ TOTAL_EXPECTED.

**Verified math (flag for planner):** CONTEXT.md states `TOTAL_EXPECTED` is currently **328** — CONFIRMED. The 8 `expected` values sum to exactly 328 (`51+56+23+39+40+51+31+37 = 328`), and each file's on-disk `"id":` count matches its `expected` (verified all 8). So `TOTAL_EXPECTED` must become `328 + N` and the new entry's `expected` must equal the real on-disk count of `partitivos.json`. The header comment (lines 64-69) explains the 328 derivation — the planner should extend that comment to mention the 9th category.

> Note the alphabetical-ordering comment (line 63). Articoli was placed right after preposiciones
> because it sorts first among "el resto". Partitivos sorts between genero-numero and profesiones —
> the planner should keep the array sorted to honor the documented convention (not strictly enforced
> by code, but a maintenance contract).

---

### 5. `tests/exercise-types.test.js` (MODIFY, test / batch)

**Analog:** the `CATEGORIES_WITH_EXPLANATIONS[]` array.
**read_first for planner:** `tests/exercise-types.test.js` lines 1260-1275.

**Exact current state** (`exercise-types.test.js:1265-1275`):

```js
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 51 },
  { file: 'content/exercises/genero-numero.json', expected: 40 },
  { file: 'content/exercises/avere.json', expected: 23 },
  { file: 'content/exercises/sustantivos-irregulares.json', expected: 31 },
  { file: 'content/exercises/verbos-movimiento.json', expected: 37 },
  { file: 'content/exercises/essere.json', expected: 39 },
  { file: 'content/exercises/profesiones.json', expected: 51 },
  { file: 'content/exercises/articoli.json', expected: 56 },
  // Cobertura editorial: 272/272 v1.0/v1.1 + 56 articoli (8ª categoría, v1.2 Phase 11) = 328 con explanation curada.
];
```

**Line shape to copy:** `{ file: 'content/exercises/<cat>.json', expected: N },` (note: this array has **no `slug` key** — only `file` + `expected`, and is **not** alphabetically sorted; it appends new categories at the end).

**Exact edit:** add one line before the closing `];` (after line 1273, the `articoli` line), and update the trailing comment:

```js
  { file: 'content/exercises/partitivos.json', expected: N },
  // Cobertura editorial: ... + N partitivos (9ª categoría, v1.2 Phase 12) = 328+N con explanation curada.
```

where **N = final partitivos count** (same value as in run-validation-271.mjs, lockstep with the temario).

This array drives the "explanation coverage" describe block (line 1278) AND is reused by the
apostrophe/plain-text invariant block (line 1393, comment "reutiliza el array
`CATEGORIES_WITH_EXPLANATIONS`"). So one line added → all three editorial invariants
(coverage, ASCII apostrophes, no-markdown) run against `partitivos.json` automatically.

---

## Shared Patterns

### S1. Validation block / quorum (`{ status, passes: [{ by, date, verdict, concerns }] }`)
**Source:** `content/exercises/articoli.json:14-30` (every exercise carries one).
**Apply to:** every exercise object in `partitivos.json`.
- `status` ∈ `pending` | `validated` | `disputed`; written value, but `deriveStatus(passes)` is the source of truth (`src/data/validation-state.js`).
- `validated` requires **>=2 distinct `by`** (CONTEXT.md §Established Patterns).
- Phase 12 `by` pool = `deepseek-v4-flash` + `claude-sonnet-4-6` (D-10), each WITH tier (D-12).
- `concerns: []` when clean.

### S2. Explanation canon (español acentuado + italianismos + ASCII `'` + plain text + no internal refs)
**Source:** `articoli.json` payload explanations (e.g. line 11, line 1410); `preposiciones.json:260` notes documents an R2 fix (removed `del ejercicio 003` ref).
**Apply to:** every `payload.explanation` in `partitivos.json` AND every prose line in the temario.
**Enforced by:** `tests/exercise-types.test.js` CATEGORIES_WITH_EXPLANATIONS invariants 1-3 (coverage / ASCII apostrophe / no-markdown, lines 1260-1263).

### S3. Grading (index for multiple-choice, case-insensitive for match)
**Source:** CONTEXT.md §Established Patterns; multiple-choice uses `correctIndex` (`articoli.json:9-10`); match uses ordered `pairs` consumed by index (`articoli.json:1401-1409`, see `articoli-049` notes on duplicate consumption).
**Apply to:** all PART-05 classification (index over `["partitivo","preposición"]`) and the sustantivo↔forma match.
**Doble-validez guard (D-03):** multiple-choice graded by index demands exactly ONE correct option — forcing the grammatical restriction (`qualche`+sing, `un po' di`+incontable, `alcuni`+plural) is what keeps near-synonyms (`dei libri ≈ alcuni libri ≈ qualche libro`) from yielding >1 correct answer.

### S4. PART-05 differentiation from Preposiciones (do NOT duplicate, do NOT bridge)
**Source:** `content/exercises/preposiciones.json` — `del`/`della` appear there ONLY as *preposizioni articolate* (e.g. line 106 `Su + Il = Sul`, line 201 `A + Il = Al`, line 258 `da + la = dalla`, line 218 options `["di","della","dalla","alla"]`). That file teaches the prepositive function.
**Apply to:** `partitivos.json` PART-05 exercises must *classify/contrast* (`partitivo` vs `preposición`) using only `di`-based forms (`del/dello/della/dell'/dei/degli/delle`, the only ones that overlap in shape — D-06), keep `categoryIds: ["partitivos"]` (no bridge, D-06/D-14), and state in the explanation that the prepositive use lives in the Preposiciones category — without re-teaching it.

### S5. NO bridges (the anti-pattern to avoid)
**Source:** `articoli.json:1467-1612` (`articoli-300..305`, `categoryIds: ["articoli","genero-numero"]` etc.) — Articoli's multi-category bridge series.
**Apply to:** Partitivos must **NOT** create any `-300..` series and must **NOT** put a second category in `categoryIds` (D-14, PART-X1 deferred to v1.3+). This analog exists only to show what Phase 12 deliberately omits.

---

## No Analog Found

None. Every file has an exact analog from Phase 11 (Articoli) — this phase is a deliberate
content calque. No RESEARCH.md fallback needed.

---

## Flags / Disagreements with CONTEXT.md

| Item | CONTEXT.md says | Live codebase | Verdict |
|------|-----------------|---------------|---------|
| `TOTAL_EXPECTED` | "=328 actual" (line 77) | `TOTAL_EXPECTED = 328` (line 81); 8 entries sum to 328; all on-disk counts match | **CONFIRMED** — bump to 328+N |
| categories.json key convention | `{ id, name, order }`, order 9 (D-Discretion) | exactly `{ id, name, order }`, highest order = 8, column-aligned, mixed plain/gloss names | **CONFIRMED** — order 9 correct |
| test line shape | `{file:'content/exercises/<cat>.json', expected:N}` (line 78) | exact match at lines 1266-1273 (no `slug` key in this array) | **CONFIRMED** |
| run-validation entry shape | "add to CATEGORIES[] + bump TOTAL" (line 77) | entry has THREE keys `{ slug, file, expected }` (run-validation uses `slug`; the test array does NOT) | **MINOR CLARIFICATION** — the two arrays differ: `run-validation-271.mjs` entries have `slug`, `tests/exercise-types.test.js` entries do not. Planner must use the right shape per file. |
| bridge series | none (D-14) | Articoli has `articoli-300..305` (6 bridges, confirmed) | **CONFIRMED** — Partitivos omits; use `partitivos-001..` only |

---

## Metadata

**Analog search scope:** `content/exercises/`, `content/categories.json`, `scripts/`, `tests/`, `.planning/phases/11-articoli/`
**Files scanned:** 8 content JSONs (counted), 4 read in detail (articoli.json, categories.json, run-validation-271.mjs, exercise-types.test.js) + 11-TEMARIO-ARTICOLI.md + preposiciones.json (targeted)
**Pattern extraction date:** 2026-05-28
