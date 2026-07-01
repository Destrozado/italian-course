# Phase 36: Dimostrativi + Possessivi (determinantes) - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 3 (2 new JSON content files + 1 modified index)
**Analogs found:** 3 / 3 (all exact or role-match)

This is a brownfield CONTENT-authoring phase. The engine (motor v1.4) is NOT touched. The only "code" is JSON: two new slot+variantes category files and an append to the category index. Every new file has a strong in-repo analog — the milestone research explicitly frames Phase 36 as an EXACT clone of the v1.7 `presente-regolare` pattern.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/dimostrativi.json` (NEW) | content (slot+variantes category) | transform (rule→variants) | `content/exercises/presente-regolare.json` | exact (structural template) |
| `content/exercises/possessivi.json` (NEW) | content (slot+variantes category) | transform (rule→variants) | `content/exercises/presente-regolare.json` | exact (structural template) |
| `content/categories.json` (MODIFY) | config (category index) | CRUD (append) | `content/categories.json` (self, existing 10 entries) | exact |

**Sub-slot analogs (patterns to copy WITHIN the two new files):**

| Slot to author | Type | Closest analog | Match Quality |
|----------------|------|----------------|---------------|
| `dimostrativi-quello` MC (6 article-like forms as contrasting variants) | multiple-choice | `presente-regolare-are` (dense MC w/ distractor pedagogy) | role-match |
| `dimostrativi-match-quello` (noun→form, phonetic trigger) | match | `articoli-049` / `articoli-050` (articoli.json lines 1327-1441) | exact |
| `dimostrativi` `ciò` lexical single-variant | multiple-choice (1 variant) | `genero-numero-articolo-plurale-logo` (genero-numero.json lines 459-477) | role-match |
| `possessivi` core (form agreement + article-required) MC + calco distractor | multiple-choice | `presente-regolare-are` + `articoli-300/301` distractor logic | role-match |
| `possessivi` family-exception slot (contrasting carve-out variants) | multiple-choice | `presente-regolare-301` (4 contrasting agreement variants in one slot) | role-match |
| `dimostrativi-300`, `possessivi-300`, `possessivi-301` (multi-cat crosses) | multiple-choice | `presente-regolare-300..303` (presente-regolare.json lines 411-647) | exact |

---

## Pattern Assignments

### `content/exercises/dimostrativi.json` (content, transform) + `content/exercises/possessivi.json` (content, transform)

**Analog:** `content/exercises/presente-regolare.json` — the EXACT mold for both new files (v1.7 precedent: a category born directly in slot+variantes, never legacy payload).

**Top-level shape** (`presente-regolare.json` lines 1-3, 648-649):
```json
{
  "notes": "...documenta una decisión de diseño (aquí: el 0-match por D-04)...",
  "exercises": [
    { ... slot ... },
    { ... slot ... }
  ]
}
```
- NO top-level `categoryId`. Category membership is per-exercise in `categoryIds[]`.
- `notes` is author-internal (never shown to the user). Use it to document design decisions — for Phase 36 this is where `ciò` "sin autoría de variantes" (D-36-02) and `codesto` OUT-OF-SCOPE (SC#2) go, mirroring the way `presente-regolare` documents its 0-match decision.

**Per-slot shape (MC)** (`presente-regolare-are`, lines 4-60):
```json
{
  "id": "presente-regolare-are",
  "type": "multiple-choice",
  "categoryIds": [ "presente-regolare" ],
  "explanation": "Los verbos del primer grupo (...). Cuidado: las distractoras son otras personas del MISMO verbo (parli, parla, parlate), todas existen pero solo una concuerda con el sujeto del enunciado.",
  "variants": [
    {
      "prompt": "Io ___ italiano con i miei amici.",
      "options": [ "parli", "parlo", "parla", "parlate" ],
      "correctIndex": 1
    },
    {
      "prompt": "Tu ___ in un ufficio in centro. (en español: tú trabajas)",
      "options": [ "lavoro", "lavori", "lavora", "lavorano" ],
      "correctIndex": 1
    }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-8", "date": "2026-06-17", "verdict": "correcta", "concerns": [] },
      { "by": "claude-sonnet-4-6", "date": "2026-06-17", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Copy-these conventions from this analog:**
- `id` prefix = category slug (`dimostrativi-*` / `possessivi-*`). Load-bearing: the migration `RESET_PREFIXES_V12` matches by `startsWith`, so ids MUST start with the exact slug (contract from Phase 35: `dimostrativi` / `possessivi`).
- `variants: [≥2]` per rule-rich slot (NEVER `payload`; NEVER a lone variant on a rule slot). This is the "nace en slot+variantes" invariant (Anti-Pattern 4).
- `explanation` at slot level, Spanish accented (RAE), plain text, ASCII apostrophe U+0027. NO markdown. The explanation is shown only after a wrong answer.
- Gloss `(en español: ...)` inline in the prompt where two answers would be defensible (R7 canon — see `lavorare`/`studiare`/`dormire` variants). This is CANON, not a leak. For Phase 36 this is the disambiguator for the ES 3-way→IT 2-way collapse (put a distance anchor `qui`/`là` PLUS the gloss so exactly one reading survives — Pitfall 2).
- Distractor pedagogy: distractors are OTHER real forms; only one concords. The explanation names WHY the distractors are wrong (see `finisco` slot: distractor `fino` = the typical calco error). For `possessivi`, the calco distractor is `mi casa`→`*mia casa` (no article) per D-36-03.
- `validation.status: "validated"` with `≥2 passes`, `≥2` distinct `by`. Canonical base = `claude-opus-4-8` + `claude-sonnet-4-6`; magnet slots add a `deepseek-chat` pass (see crosses below).

**Word-buttons slot shape** (if used — `presente-regolare-are-wb`, lines 359-410) uses `answer: [...]` (ordered tokens) + `distractors: [...]` instead of `options`/`correctIndex`:
```json
{
  "id": "presente-regolare-are-wb",
  "type": "word-buttons",
  "categoryIds": [ "presente-regolare" ],
  "explanation": "...",
  "variants": [
    { "prompt": "Nosotros hablamos italiano.", "answer": [ "noi", "parliamo", "italiano" ], "distractors": [ "parlo", "parli" ] }
  ],
  "validation": { ... }
}
```
Word-buttons vs MC is Claude's discretion (CONTEXT.md line 66): MC for form production, word-buttons where a token-ordering trap adds value.

---

### `dimostrativi-match-quello` (match slot — noun→form)

**Analog:** `content/exercises/articoli.json` `articoli-049` (lines 1326-1385) and `articoli-050` (lines 1386-1441).

This is the ONLY `match` slot of the phase (D-36-03: possessivi is MC-only). It is legitimate per DESIGN RULE D-04 because noun→`quel/quello/quell'/quei/quegli/quelle` is a phonetic-trigger pairing, NOT root-derivable — the exact `articoli-049` precedent.

**Match slot shape** (`articoli-049`, lines 1326-1385):
```json
{
  "id": "articoli-049",
  "type": "match",
  "categoryIds": [ "articoli" ],
  "explanation": "Este empareje va mas alla del il/la/l' basico: agrupa los disparadores que obligan a lo en singular y a gli en plural. La serie lo aparece ante s+consonante (lo studente), z (lo zio), ps (lo psicologo)...",
  "variants": [
    {
      "prompt": "Empareja cada sustantivo con su artículo determinativo.",
      "pairs": [
        [ "studente", "lo" ],
        [ "zio", "lo" ],
        [ "psicologo", "lo" ],
        [ "gnocchi", "gli" ],
        [ "amici", "gli" ],
        [ "zii", "gli" ],
        [ "libri", "i" ]
      ]
    }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }
}
```

**Copy-these conventions:**
- `variants[].pairs` is an array of `[left, right]` two-element arrays (noun → form). No `options`/`correctIndex`.
- Memory rule R3/match-authoring: match needs 3+ DISTINCT right-hand values so the pairing isn't trivially guessable. `articoli-049` uses 3 distinct forms (`lo`/`gli`/`i`). For `quello` map each noun through the phonetic table BEFORE writing the key: `quello studente` / `quei ragazzi` / `quegli zii` / `quegli amici` / `quell'albero` / `quelle case` (Pitfall 1 — the `quei`/`quegli` split is Magnet #1).
- MAGNET: this slot requires an EXTRA quorum round with a mandatory DeepSeek pass (INT-04, Pitfall 1). `articoli-049`'s own validation used a `deepseek-v4-flash` + `claude-opus-4-7` pair (lines 1370-1382) — mirror that discipline (a DeepSeek `by` is REQUIRED here, not optional).

---

### `ciò` lexical single-variant slot (híbrido D-36-02)

**Analog:** `content/exercises/genero-numero.json` `genero-numero-articolo-plurale-logo` (lines 459-477) — the closest in-repo example of a legitimately single-variant MC slot with `validation`.

```json
{
  "id": "genero-numero-articolo-plurale-logo",
  "type": "multiple-choice",
  "categoryIds": ["genero-numero"],
  "explanation": "Las profesiones terminadas en -logo forman el plural en -gi SIN h: psicologo → psicologi. ...",
  "variants": [
    {
      "prompt": "Lo psicologo, due ___.",
      "options": ["psicologi", "psicologa", "psicologos", "psicologe"],
      "correctIndex": 0
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

**Copy-these conventions:**
- A single-variant slot is structurally valid — same shape as a multi-variant slot, just one entry in `variants[]`.
- For `ciò`: do NOT force synthetic variants (`ciò che`/`per ciò` as padding = Pitfall 7). Author ONE variant and DOCUMENT the decision in the file-level `notes` ("`ciò` es slot léxico single-variant, sin autoría de variantes; forma esencialmente única") so a future reviewer does not flag it as incomplete. This is the híbrido PROF-01/SOST-01 pattern applied at the `notes` level (the repo's precedent for documenting design decisions is the `presente-regolare.json` `notes` at line 2).
- The pronoun `questo`/`quello` forms and the `suo` his/her and `loro` invariable slots (D-36-02) are ordinary multi-variant slots — use the `presente-regolare-are` MC shape, not this single-variant shape.

---

### Multi-cat crosses: `dimostrativi-300`, `possessivi-300`, `possessivi-301` (D-36-04)

**Analog:** `content/exercises/presente-regolare.json` `presente-regolare-300..303` (lines 411-647).

**Cross slot shape** (`presente-regolare-301`, lines 472-543 — the essere-agreement cross):
```json
{
  "id": "presente-regolare-301",
  "type": "multiple-choice",
  "categoryIds": [ "presente-regolare", "essere" ],
  "explanation": "...con essere el participio concuerda con el sujeto en género y número... (en español: ...)",
  "variants": [
    { "prompt": "Ieri Marco ___ presto per il lavoro. (en español: ayer Marco salió / ha salido)", "options": [ "ha partito", "è partito", "è partita", "sono partito" ], "correctIndex": 1 },
    { "prompt": "Ieri sera Maria ___ a casa molto tardi. (en español: ...)", "options": [ "ha tornata", "è tornato", "è tornata", "è tornate" ], "correctIndex": 2 }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-8", "date": "2026-06-17", "verdict": "correcta", "concerns": [ "[D-31-08a concordancia] ...", "[R1-R7] sin leak; gloss R7; ..." ] },
      { "by": "deepseek-chat", "date": "2026-06-17", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Copy-these conventions:**
- `categoryIds` has TWO slugs — this is the ONLY structural difference vs a normal slot. The engine cascades a failure to ALL listed categories automatically (D-54). Per D-36-04:
  - `dimostrativi-300` → `categoryIds: ["dimostrativi", "articoli"]`
  - `possessivi-300` → `categoryIds: ["possessivi", "articoli"]`
  - `possessivi-301` → `categoryIds: ["possessivi", "genero-numero"]`
- Stable `id` with the primary category's prefix (`presente-regolare-300`, not a shared namespace).
- CRITICAL invariant (D-54 / Pitfall 12): crosses are PURE CONTENT. Adding a 2-slug `categoryIds` requires ZERO engine edits. Do NOT touch `src/screens/app.js` or `src/domain/progress.js`. The cascade already routes through the existing 2 call-sites (verified: `applyImmediateFailure` at `src/screens/app.js:1642` and `src/screens/app.js:1969`).
- The `passes[].concerns[]` array in these crosses carries author-visible verification notes tagged `[D-...]` / `[R1-R7]` — a useful convention to record what was checked (e.g. the phonetic-table check for `quello`, the 4 carve-outs for the family exception).

---

### `content/categories.json` (config, CRUD-append)

**Analog:** `content/categories.json` itself (self, lines 1-14) — existing 10 entries, order 1-10.

**Entry shape** (line 12, the `presente-regolare` precedent that arrived at order 10):
```json
{ "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 }
```

**Modification for Phase 36 — APPEND two entries at the END of the array:**
```json
{ "id": "dimostrativi", "name": "...", "order": 11 },
{ "id": "possessivi",   "name": "...", "order": 12 }
```

**Copy-these conventions:**
- Three fields only: `id` (slug — must match the exercise-id prefix AND the Phase 35 `RESET_PREFIXES_V12` slug), `name` (Italian display name, style-consistent with the existing rows, e.g. "Dimostrativi" / "Possessivi"), `order` (integer).
- APPEND at the end (Anti-Pattern 2: do NOT insert mid-array for "semantic affinity" — it would reshuffle the home display of the existing 10 rows). The array order IS the display order; `order` is documental/legacy and NOT read for sorting (`content-loader` returns the array as-is; `categoriesForDisplay` iterates it unsorted). Verified in ARCHITECTURE.md Pattern 3.
- `order` values must be unique — 11 (dimostrativi), 12 (possessivi), continuing the sequence (Pitfall 14).
- Do NOT add a `source`/`origen` field here — that is Phase 39 (PROV-01, transversal). Only `id`/`name`/`order` in Phase 36.

---

## Shared Patterns

### Editorial canon (applies to EVERY slot in both new files)
**Sources:** memory `explanations_must_be_accented.md`, `gloss_es_desambiguacion_canon.md`, `exercise_authoring_rules.md` (R1-R7); enforced-by-example throughout `presente-regolare.json`.
- Spanish explanations accented (RAE): á/é/í/ó/ú, ñ. A C4-accent flag on un-tilded Spanish is a REAL bug → fix the tilde, do NOT override (Pitfall 10).
- ASCII apostrophe U+0027 only; no smart-quotes; plain text (no markdown).
- Italianisms quoted literally in Italian orthography (`quegli`, `mia madre`, `città`).
- R1 no-leak: the prompt is the sentence + blank ONLY. No `(s impura → quello)`, no `(parentesco)`, no target form named in the prompt. The rule lives in `explanation` (post-failure) and `notes` (author-internal). The `(en español: ...)` gloss is R7 canon and is NOT a leak — Gemini/DeepSeek may false-positive it as C5; keep it.

### Validation block (applies to EVERY slot)
**Source:** every slot in `presente-regolare.json` (e.g. lines 43-59); magnet slots use the DeepSeek-inclusive pair from `presente-regolare-300` (lines 451-470) / `articoli-049` (lines 1368-1384).
```json
"validation": {
  "status": "validated",
  "passes": [
    { "by": "<vendor>", "date": "YYYY-MM-DD", "verdict": "correcta", "concerns": [] },
    { "by": "<distinct-vendor>", "date": "YYYY-MM-DD", "verdict": "correcta", "concerns": [] }
  ]
}
```
- `≥2` passes, `≥2` distinct `by`, both `verdict: "correcta"`.
- Base canon: `claude-opus-4-8` + `claude-sonnet-4-6`.
- MAGNET slots (Magnet #1 `quello` forms; Magnet #2 possessivi family-exception carve-outs) REQUIRE an extra round with a mandatory `deepseek-*` `by` (INT-04, Pitfalls 1 & 3). Reinforcement path: `scripts/validate-ai-pass.mjs` (Gemini/DeepSeek, auto-fallback 429 → deepseek-reasoner, `--write`; keys in `.env`).

### D-54 cascade engine invariant (applies to the whole phase — a guardrail, not a file to write)
**Source:** `src/screens/app.js` — `applyImmediateFailure` at line 1642 (final decision) and line 1969 (match first-wrong). Verified: EXACTLY 2 call-sites.
- Crosses reuse `applyResultToSession` / the existing cascade; they add ZERO new call-sites.
- Invariant guarded by tests in 4 files (`exercise-types.test.js` ~line 785 "EXACTAMENTE 2 call-sites", plus screen/domain-progress tests). A non-empty `git diff src/screens/app.js src/domain/progress.js` during this phase is a red flag (Pitfall 12).

---

## No Analog Found

None. All three files and all sub-slot types have strong in-repo analogs. This is the intended design: Phase 36 is an explicit clone of the v1.7 `presente-regolare` alta-de-categoría pattern.

---

## Count-Sync Touch-Points (Phase 39 owns these — flag for the planner, do NOT treat as Phase 36 new files)

Per ARCHITECTURE.md §Count Sync + CONTEXT.md line 20: adding these 2 categories leaves the hardcoded counts red until Phase 39 syncs them. This is EXPECTED red (same pattern as v1.6/v1.7 deferred sync). The planner MAY sync the 2 new categories' counts at the end of Phase 36 to go green early, or leave it to Phase 39 — plan decision, not a failure if red until 39.

| File | Symbol | Line(s) | Action (Phase 39, optionally Phase 36) |
|------|--------|---------|----------------------------------------|
| `tests/exercise-types.test.js` | `CATEGORIES_WITH_EXPLANATIONS` | ~1273-1285 (+ `slotCountOf` ~1270; loops ~1304, ~1429) | +1 entry per new category, `expected: slotCountOf('content/exercises/<slug>.json')` (dynamic, never magic number) |
| `tests/fixtures/slot-variants-integration.test.js` | `REAL_CATEGORIES` | ~168-178 | +1 entry per new category, `expected: readJson(...).exercises.length` |
| `scripts/run-validation-271.mjs` | `CATEGORIES`, `TOTAL_EXPECTED`, `TOTAL_EXPECTED_BASELINE` | `CATEGORIES` ~173-180; `TOTAL_EXPECTED` reduce ~188; `TOTAL_EXPECTED_BASELINE = 183 + PRESENTE_REGOLARE_SLOTS` ~195 | +1 `CATEGORIES` entry per new cat (`slotCountOf`). `TOTAL_EXPECTED` re-sums automatically. `TOTAL_EXPECTED_BASELINE` formula MUST be extended by hand with the new slot counts or the coherence guard throws (Pitfall 11 — the easiest miss). |

Smoke parametric (`tests/domain.test.js` `loadAllExerciseFiles` via `readdirSync`) auto-discovers the 2 new files — no edit needed there; it auto-covers the new multi-cat crosses (Pitfall 14).

---

## Metadata

**Analog search scope:** `content/exercises/` (10 files), `content/categories.json`, `src/screens/app.js` (call-site verification), `tests/` + `scripts/` (count-sync verification).
**Files scanned:** presente-regolare.json (full), articoli.json (match slots 1320-1519), genero-numero.json (single-variant + match 459-508), categories.json (full), profesiones.json / sustantivos-irregulares.json (variant-count survey), app.js (grep), 3 count-sync files (grep).
**Pattern extraction date:** 2026-07-01
