# Phase 11: Articoli - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 4 (1 new, 3 modified)
**Analogs found:** 4 / 4

This is a CONTENT phase: the work is authoring a new JSON exercise file and wiring a new category into 3 integration points. NO engine/sampler/cascade/validator/UI code is written. Adding the `categories.json` entry auto-surfaces the home row + Examen button via `categoriesForDisplay` (src/screens/app.js ~2141) — zero UI code.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/articoli.json` | content (exercise data) | CRUD / data-as-config | `content/exercises/genero-numero.json` (match) + `content/exercises/avere.json` (mc base + bridges) | exact |
| `content/categories.json` | config (registry) | data-as-config | itself (append to array) | exact |
| `scripts/run-validation-271.mjs` | config (validation runner) | batch | itself (`CATEGORIES[]` + `TOTAL_EXPECTED`) | exact |
| `tests/exercise-types.test.js` | test (editorial coverage) | batch | itself (`CATEGORIES_WITH_EXPLANATIONS`) | exact |

---

## Pattern Assignments

### `content/exercises/articoli.json` (content, NEW)

**Analogs:** `content/exercises/avere.json` (multiple-choice base + bridges `avere-300..305`), `content/exercises/genero-numero.json` (match with textual duplicates in right column, lines 1078-1178).

**File envelope** (root shape — `content/exercises/avere.json:1-2`):
```json
{
  "exercises": [
```
Closes with `]` then `}` (see `genero-numero.json:1179-1180`). One top-level key `exercises` holding an array. No category metadata in this file (that lives in `categories.json`).

---

#### (a) Base `multiple-choice` exercise — single category

**Source:** `content/exercises/avere.json:3-38` (full shape incl. validation block).

```json
{
  "id": "avere-001",
  "type": "multiple-choice",
  "categoryIds": [
    "avere"
  ],
  "payload": {
    "prompt": "Io ___ una macchina nuova.",
    "options": [
      "ho",
      "hai",
      "ha",
      "abbiamo"
    ],
    "correctIndex": 0,
    "explanation": "La forma 'ho' es la primera persona singular del presente indicativo del verbo avere y se usa con el pronombre 'io' para expresar posesión. En italiano, 'Io ho una macchina' equivale al español 'Yo tengo un coche': el verbo avere cubre todo lo que en español hacemos con tener, sin necesidad de verbos auxiliares adicionales."
  },
  "notes": "Presente indicativo, 1ª persona singular (io). Posesión.",
  "validation": {
    "status": "validated",
    "passes": [
      {
        "by": "claude-opus-4-7",
        "date": "2026-05-26",
        "verdict": "correcta",
        "concerns": []
      },
      {
        "by": "claude-sonnet-4-6",
        "date": "2026-05-26",
        "verdict": "correcta",
        "concerns": []
      }
    ]
  }
}
```

**For articoli base** (`articoli-001..`): `categoryIds: ["articoli"]`. The `prompt` carries the phonetic trigger noun and the `___` gap; `options` are the plausible article forms (e.g. `["il","lo","l'","la"]` for masc sing; `["i","gli"]`-style + distractors for masc plural; `["un","uno"]` for indet masc). `correctIndex` selects the right form (grading by INDEX for multiple-choice). Trampas obligatorias D-04: `lo zio`, `uno studente`, `lo psicologo`, `gli gnocchi`, `l'amico`/`l'amica`, `un'amica` vs `un amico`.

**Apóstrofes in options/prompt/explanation:** ASCII U+0027 only (`l'`, `un'`) — no smart quotes. Compact array form is also valid JSON (`genero-numero.json:9` writes `"options": ["ragazze", "ragazzos", "ragazzi", "ragazzoi"]` on one line); either style passes the validator.

---

#### (b) `match` exercise — textual duplicates in right column (D-66)

**Source:** `content/exercises/genero-numero.json:1111-1142` (`genero-numero-208`, the masc-singular phonetic match — the closest model for articolo↔sustantivo). Also `genero-numero-209` (lines 1144-1178, plural articles) for the plural extension.

```json
{
  "id": "genero-numero-208",
  "type": "match",
  "categoryIds": ["genero-numero"],
  "payload": {
    "prompt": "Empareja cada sustantivo masculino singular con su artículo definido.",
    "pairs": [
      ["zaino", "lo"],
      ["amico", "l'"],
      ["studente", "lo"],
      ["ragazzo", "il"]
    ],
    "explanation": "El artículo definido masculino singular depende del sonido inicial del sustantivo: Lo ante s+consonante, z, ps, gn, pn y x (lo zaino, lo studente, lo psicologo); L' ante vocal por elisión (l'amico, l'occhio); Il ante el resto de consonantes (il ragazzo, il libro). La distractora más frecuente del hispanohablante es usar Il delante de z- o s+cons- como en español; el italiano requiere Lo en esos casos por motivos fonéticos."
  },
  "notes": "Match con 3 artículos distintos en columna derecha (lo×2, l'×1, il×1) por regla R3 — al menos 3 valores únicos. zaino y studente comparten 'lo' intencionalmente (D-66): testea que el alumno reconoce que tanto z- como s+cons- disparan la misma regla. ...",
  "validation": { "status": "validated", "passes": [ /* opus + sonnet, ver bloque compartido */ ] }
}
```

**Match payload shape:** `pairs` = array of `[izquierda, derecha]` 2-string tuples. Left column = nouns; right column = articles. **Duplicates in the right column are intentional and allowed** (D-66 — grading consumes by index, so `["zaino","lo"]` + `["studente","lo"]` both map to `lo`).

**Authoring rule R3 (from memory, NOT enforced by schema):** ≥3 distinct values in the matched column so the puzzle isn't trivially solvable. `genero-numero-208` uses `lo×2, l'×1, il×1` → 3 distinct.

**Schema constraints actually enforced** (`src/data/schema-validator.js:249-287`): `pairs` must be an array; length **2–10**; each pair exactly 2 non-empty strings; optional `explanation` must be non-empty string if present. (No distinct-value check in code — that is the R3 authoring rule.)

**DESIGN RULE (PROJECT.md, LOCKED):** use `match` ONLY when the pairing is NOT derivable from a shared root. `articolo↔sustantivo` qualifies (article depends on the noun's initial phonetics, not its root). singular↔plural / masc↔fem with shared root → use `multiple-choice` with distractors instead.

**For articoli match:** go DEEPER than génnumero — include `lo/gli/uno` + plurals + trampas; do NOT re-do the basic `il/la/l'` singular that génnumero already covers (D-06). Group nouns under a shared trigger (e.g. `studente→lo, zio→lo, psicologo→lo, libro→il, amico→l'`).

---

#### (c) Multi-category bridge `multiple-choice` with `categoryIds:[A,B]`

**Source:** `content/exercises/avere.json:663-698` (`avere-300`, generic bridge) and **`avere.json:737-772` (`avere-302`) — the model for `articoli↔sustantivos-irregulares`** (irregular plural `braccia`).

```json
{
  "id": "avere-302",
  "type": "multiple-choice",
  "categoryIds": [
    "avere",
    "sustantivos-irregulares"
  ],
  "payload": {
    "prompt": "Lui ___ due braccia stanche.",
    "options": [
      "ho",
      "hai",
      "ha",
      "abbiamo"
    ],
    "correctIndex": 2,
    "explanation": "El verbo avere conjugado con 'lui' es 'ha' (3ª singular), y aquí acompaña a un plural irregular del cuerpo: 'braccia' (brazos) viene del singular masculino 'braccio' pero hace plural femenino, por eso el adjetivo concuerda como 'stanche'. ..."
  },
  "notes": "Cruce Avere + Sustantivos Irregulares (D-87 / SEED-02). Posesión 3ª singular + plural irregular `braccia` (singular masc `braccio` → plural fem `braccia`, concordancia `stanche`).",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-7",  "date": "2026-05-27", "verdict": "correcta", "concerns": [] },
      { "by": "claude-sonnet-4-6", "date": "2026-05-27", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Bridge convention:** `id` in the `300+` range (`articoli-300..`, exact mirror of `avere-300..` / `essere-300..`); `type: "multiple-choice"`; `categoryIds: ["articoli", X]` (two slugs). The 6 avere bridges (`avere-300..305`, lines 663-884) are the real examples to mirror.

**For articoli's ~6 bridges (D-08/D-09/D-10):** only TWO crossed categories — `articoli↔genero-numero` (~3: correct article + plural/gender, e.g. `le/i` + sustantivo) and `articoli↔sustantivos-irregulares` (~3: article of an irregular noun — `lo zio→gli zii`, `il braccio→le braccia`, `l'uovo→le uova`). Concrete model from the specifics: `"___ braccia sono stanche."` with options `["le","i","gli","la"]`, `correctIndex` → `le` (irregular fem plural `braccia`). Do NOT add profesiones/preposiciones bridges (deferred). Failing a bridge resets BOTH categories instantly (cascade D-54, inherited — no code).

---

#### `validation` block & status lifecycle (applies to every exercise above)

**Shape** (`src/data/schema-validator.js:296+`, examples throughout avere.json):
```json
"validation": {
  "status": "pending" | "validated" | "disputed",
  "passes": [
    { "by": "<model-id>", "date": "YYYY-MM-DD", "verdict": "correcta" | "incorrecta", "concerns": [] }
  ]
}
```
- **Authoring → start `status: "pending"`** with empty/absent `passes`. The quorum validator (`gsd-validate-batch`) appends `passes[]` entries.
- **`validated` requires ≥2 distinct `by` values** with `verdict: "correcta"` (see every `avere-3xx` block: one `claude-opus-4-7` + one `claude-sonnet-4-6`).
- `deriveStatus(passes)` (`src/data/validation-state.js`) is sticky-disputed; the validation runner has an `effectiveStatus` relax for author overrides (`run-validation-271.mjs:93`).

#### `explanation` / `notes` canon (D-135/D-137, CONT-06, T-02-01)
- `explanation` lives INSIDE `payload`, non-empty string, Spanish accented prose with Italian terms preserved. Apóstrofes ASCII U+0027. Plain text only — NO markdown tokens (`**`, `__`, `##`, backtick) — the test below asserts this.
- `notes` is a top-level sibling of `payload` (free-form authoring rationale, references decisions like D-66/D-04). Not rendered to the user.

---

### `content/categories.json` (config, MODIFY)

**Analog:** itself. Current full array (`content/categories.json:1-11`):

```json
{
  "categories": [
    { "id": "avere",                   "name": "Avere (auxiliar)",        "order": 1 },
    { "id": "essere",                  "name": "Essere (cópula)",         "order": 2 },
    { "id": "preposiciones",           "name": "Preposiciones",           "order": 3 },
    { "id": "verbos-movimiento",       "name": "Verbos de movimiento",    "order": 4 },
    { "id": "sustantivos-irregulares", "name": "Sustantivos irregulares", "order": 5 },
    { "id": "genero-numero",           "name": "Género y número",         "order": 6 },
    { "id": "profesiones",             "name": "Profesiones",             "order": 7 }
  ]
}
```

**Exact insertion** — add as the last array element (after `profesiones`, add a `,` to the profesiones line):
```json
    { "id": "profesiones",             "name": "Profesiones",             "order": 7 },
    { "id": "articoli",                "name": "Articoli (artículos)",    "order": 8 }
```
`name` follows the parenthetical pattern of the other categories (D-Claude's-discretion, suggested in CONTEXT). Adding this entry auto-surfaces the home row + Examen button (`examenEnabled = totalCount > 0`) — no UI code.

---

### `scripts/run-validation-271.mjs` (config, MODIFY)

**Analog:** itself. Two edits.

**Edit 1 — `CATEGORIES[]` array** (`scripts/run-validation-271.mjs:68-76`). Order is "riesgo-first (preposiciones) + alfabético resto" (comment line 63). `articoli` is alphabetically first among the rest, so insert it right after `preposiciones`:
```javascript
const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 51 },
  { slug: 'articoli',                 file: 'content/exercises/articoli.json',                 expected: <N> },
  { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 23 },
  { slug: 'essere',                   file: 'content/exercises/essere.json',                   expected: 39 },
  { slug: 'genero-numero',            file: 'content/exercises/genero-numero.json',            expected: 40 },
  { slug: 'profesiones',              file: 'content/exercises/profesiones.json',              expected: 51 },
  { slug: 'sustantivos-irregulares',  file: 'content/exercises/sustantivos-irregulares.json',  expected: 31 },
  { slug: 'verbos-movimiento',        file: 'content/exercises/verbos-movimiento.json',        expected: 37 },
];
```
`<N>` = exact final count of exercises authored in `articoli.json` (target ~45-55 per D-12, base + bridges combined).

**Edit 2 — `TOTAL_EXPECTED`** (`scripts/run-validation-271.mjs:78`). Current value `272`. Bump by `<N>`:
```javascript
const TOTAL_EXPECTED = 272;   // → becomes 272 + <N>
```
The reporter fails (non-zero exit) if the sum of `expected` across `CATEGORIES[]` ≠ `TOTAL_EXPECTED`, and if either ≠ the exercises found on disk. So all three numbers must be consistent: `articoli.json` length == its `expected` entry, and `272 + N` == new `TOTAL_EXPECTED`. Update the comment block at lines 64-67 too (it explains the 272 figure).

---

### `tests/exercise-types.test.js` (test, MODIFY)

**Analog:** itself. One-line insertion into `CATEGORIES_WITH_EXPLANATIONS` (`tests/exercise-types.test.js:1265-1274`):

```javascript
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 51 },
  { file: 'content/exercises/genero-numero.json', expected: 40 },
  { file: 'content/exercises/avere.json', expected: 23 },
  { file: 'content/exercises/sustantivos-irregulares.json', expected: 31 },
  { file: 'content/exercises/verbos-movimiento.json', expected: 37 },
  { file: 'content/exercises/essere.json', expected: 39 },
  { file: 'content/exercises/profesiones.json', expected: 51 },
  { file: 'content/exercises/articoli.json', expected: <N> },
];
```

This array is consumed by two `describe` blocks (lines 1277 and 1400). Each entry is checked against 3 editorial invariants (comment lines 1260-1263): (1) exact coverage — `data.exercises.length === expected` AND every exercise has a non-empty `payload.explanation`; (2) apóstrofes ASCII U+0027 (no smart quotes); (3) plain text with no markdown markers. `<N>` MUST equal the same count used in `run-validation-271.mjs` and the actual file length.

---

## Shared Patterns

### Validation quorum block (≥2 distinct `by`)
**Source:** `content/exercises/avere.json` (every `avere-3xx` block, e.g. lines 682-698) · schema in `src/data/schema-validator.js:296+`
**Apply to:** every exercise in `articoli.json`.
```json
"validation": {
  "status": "validated",
  "passes": [
    { "by": "claude-opus-4-7",  "date": "YYYY-MM-DD", "verdict": "correcta", "concerns": [] },
    { "by": "claude-sonnet-4-6", "date": "YYYY-MM-DD", "verdict": "correcta", "concerns": [] }
  ]
}
```
Author writes `status: "pending"` first; `gsd-validate-batch` fills `passes[]` to reach `validated` (D-15).

### Explanation canon
**Source:** all exercise files · enforced by `tests/exercise-types.test.js:1284-1293`
**Apply to:** every `payload.explanation` in `articoli.json`.
Spanish accented prose + Italian terms preserved (D-135/D-137); apóstrofes ASCII U+0027 (CONT-06); plain text, no markdown (T-02-01). No `#NNN` exercise references inside explanations (authoring rule, memory).

### The three count numbers must stay in lockstep
**Sources:** `scripts/run-validation-271.mjs:74` (`expected`), `:78` (`TOTAL_EXPECTED`), `tests/exercise-types.test.js` `expected`
**Apply to:** the final exercise count `<N>` of `articoli.json` — write it in all three places identically, and bump `TOTAL_EXPECTED` to `272 + <N>`.

---

## No Analog Found

None. Every file has an exact in-repo analog (this is the 8th category following an established 7-category pattern).

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| — | — | — | All 4 files have exact analogs. |

---

## Metadata

**Analog search scope:** `content/exercises/`, `content/categories.json`, `scripts/run-validation-271.mjs`, `tests/exercise-types.test.js`, `src/data/schema-validator.js`
**Files scanned:** 7 exercise JSON files (avere, essere, genero-numero, preposiciones, profesiones, sustantivos-irregulares, verbos-movimiento) + categories.json + 1 validation runner + 1 test file + 1 schema validator
**Pattern extraction date:** 2026-05-27
