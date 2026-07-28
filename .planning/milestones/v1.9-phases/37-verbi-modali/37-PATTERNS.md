# Phase 37: Verbi modali - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 2 (1 NEW content file, 1 MODIFIED index)
**Analogs found:** 2 / 2 (both exact)

Brownfield CONTENT ONLY. No engine/JS file is created or modified. This map covers the two data artifacts the planner will author: the new category file and the one-line index append. The cross-category exercise `modali-300` lives INSIDE the new file, so it is mapped as a sub-pattern of file 1.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/modali.json` (NEW) | content / config (data) | transform (slot+variantes born-in-slots) | `content/exercises/presente-regolare.json` + `content/exercises/possessivi.json` | exact (same milestone twin) |
| `modali-300` cross-exercise (inside `modali.json`) | content / config (data) | transform (multi-cat cascade node) | `presente-regolare-300..303` + `possessivi-300` | exact |
| `content/categories.json` (MODIFIED, append order 13) | config (index) | CRUD (append one array entry) | existing 12 entries; `dimostrativi`/`possessivi` (order 11/12) are the Phase 36 appends | exact |

**Why not `match`:** VERBI MODALI is 0-match by decision (D-04 / D-37-02). Person→form is derivable once the irregular paradigm is known — same reasoning as `presente-regolare`'s explicit 0-match. So the analog for exercise TYPES is `presente-regolare` (MC + word-buttons only), NOT the `articoli-049/050` match slots. Do not author a `match` exercise; document the 0-match in `notes` (mirror of `presente-regolare` line 2).

---

## Pattern Assignments

### `content/exercises/modali.json` (content, born-in-slots transform)

**Analog:** `content/exercises/presente-regolare.json` (verb category born in slots) + `content/exercises/possessivi.json` (fresh Phase-36 twin, same canon/dates).

**Top-level shape** (`presente-regolare.json` lines 1-3; `possessivi.json` lines 1-3):
```json
{
  "notes": "0 match por decision D-04 ... [+ scope-gate passato prossimo modal OUT-OF-SCOPE]",
  "exercises": [ ... ]
}
```
- No top-level `categoryId`. Membership is per-exercise in `categoryIds[]`.
- `notes` is author-internal prose (accented Spanish, ASCII apostrophe, plain text). This is where BOTH the 0-match decision AND the passato-prossimo-modal HARD scope-gate get documented (Pitfall 5 / SC#3). Mirror the density of `presente-regolare.json:2` and `possessivi.json:2`.

**MC slot pattern** (copy from `presente-regolare.json` lines 4-60, `presente-regolare-are`; and `possessivi.json` lines 4-68, `possessivi-concordanza`):
```json
{
  "id": "modali-<semantic>",
  "type": "multiple-choice",
  "categoryIds": [ "modali" ],
  "explanation": "<accented ES, regla + paralelo, plain text, ASCII apostrophe, NO R1 leak>",
  "variants": [
    {
      "prompt": "Io ___ andare al lavoro. (en español: yo puedo ir)",
      "options": [ "posso", "poto", "puoi", "puote" ],
      "correctIndex": 0
    },
    { "...": "≥2 variants per slot (D-37-02); distractoras = 3 vectores D-37-03" }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }
}
```
- `id` prefix MUST be `modali-` (slug contract, Phase 35 D-35-01/02; already in `RESET_PREFIXES_V12`, storage.js:1168 — verified). Semantic ids like `modali-potere`, `modali-volere`, `modali-dovere`, `modali-infinito-wb` — exact final map approved by author at checkpoint (D-37-02).
- Distractoras exercise the 3 D-37-03 vectors: false-regularization (`*poto`/`*volo`/`*dovo`/`*potiamo`), cross-verb contamination (`voglio`/`*volio`, `devo`/`*dovo`), accent trap (`può` 3sg grave vs `puoi` 2sg). Preserve `può` accent literally.
- ES gloss `(en español: ...)` is canon R7 (see every `possessivi` prompt with a gloss, e.g. lines 78, 88, 98). It is NOT an R1 leak; Gemini/DeepSeek false-positive it as C5 — keep it (memory: gloss_es_desambiguacion_canon).

**word-buttons slot pattern** (copy from `presente-regolare.json` lines 307-358, `presente-regolare-isc-wb` / `presente-regolare-are-wb`):
```json
{
  "id": "modali-<semantic>-wb",
  "type": "word-buttons",
  "categoryIds": [ "modali" ],
  "explanation": "<accented ES>",
  "variants": [
    {
      "prompt": "<Spanish sentence>",
      "answer": [ "io", "voglio", "mangiare", "la", "pizza" ],
      "distractors": [ "vogliono", "mangio" ]
    }
  ],
  "validation": { "...": "" }
}
```
- word-buttons variants use `answer: [tokens]` + `distractors: [tokens]` (NOT `options`/`correctIndex`). Copy shape exactly from `presente-regolare-are-wb` (lines 360-410).
- SC#2 HARD requirement: ≥1 word-buttons slot exercising modal+infinitive POSITION — the invariable infinitive follows the conjugated modal (`voglio mangiare`). Distractors should include a wrong-position or wrong-form token so the bank forces the correct order.
- NO variant may contain a modal + participio or `ho/sono/hai/sei…` + PP of a modal (SC#3, Pitfall 5). Grep-verifiable scope-gate.

**Validation block pattern** — two flavors, copy verbatim:

Simple 2-Claude pass (single-category slots), from `possessivi.json` lines 108-124:
```json
"validation": {
  "status": "validated",
  "passes": [
    { "by": "claude-opus-4-8",  "date": "2026-07-01", "verdict": "correcta", "concerns": [] },
    { "by": "claude-sonnet-4-6", "date": "2026-07-01", "verdict": "correcta", "concerns": [] }
  ]
}
```

3-`by` reinforced pass with cross-vendor tiebreaker (magnet slots), from `possessivi.json` lines 175-197 (`possessivi-parentela`) — opus + sonnet + deepseek-reasoner. Use this for the `può`-accent slot and the cross-exercise. `by` values seen in-repo: `claude-opus-4-8`, `claude-sonnet-4-6`, `deepseek-chat` (presente-regolare-300), `deepseek-reasoner` (possessivi). The `concerns[]` array carries dispute-resolution audit notes (see `possessivi.json:56-58` and `possessivi.json:366` for the disputed→rewrite pattern).

Canon requires `status: validated` with ≥2 passes `verdict: correcta` and ≥2 distinct `by` (base = Claude Opus+Sonnet; reinforcement Gemini/DeepSeek via `validate-ai-pass.mjs`).

---

### `modali-300` cross-category exercise (inside `modali.json`)

**Analog:** `presente-regolare-300` (`presente-regolare.json` lines 411-471) and `possessivi-300` (`possessivi.json` lines 329-378). Both are the LAST exercises in the array, id `-300`, `categoryIds` of exactly 2.

**Shape** (copy from `possessivi-300`, lines 329-378 — the freshest Phase-36 precedent, D-36-04):
```json
{
  "id": "modali-300",
  "type": "multiple-choice",
  "categoryIds": [ "modali", "presente-regolare" ],
  "explanation": "<accented ES: modal conjugado gobierna un infinitivo invariable>",
  "variants": [
    { "prompt": "...", "options": [ ... ], "correctIndex": N },
    { "...": "≥2 variants" }
  ],
  "validation": { "status": "validated", "passes": [ opus, sonnet, deepseek-reasoner ] }
}
```
- `categoryIds: ["modali", "presente-regolare"]` — 2 slugs, stable id. This is the ONLY structural difference from a normal slot. The modal conjugado + infinitive of a REGULAR verb is exactly the FEATURES hook ("modal+infinitive enhances presente-regolare", ARCHITECTURE Pattern 5, FEATURES line 80).
- `presente-regolare` exists (order 10) — dependency satisfied.
- Order convention: cross-exercises are numbered `-300+` and placed LAST in the array (see `presente-regolare-300..303` at the tail, and `possessivi-300`/`301` at the tail). One cross (D-37-01) → just `modali-300`.

**D-54 INVARIANT (verified — MUST hold):** The cross-exercise is authored as a NORMAL slot+variantes with a 2-element `categoryIds`. It reuses the existing cascade via `applyResultToSession`; it adds ZERO new `applyImmediateFailure` call-sites. Grep of `src/screens/app.js` confirms EXACTLY 2 real call-sites remain:
- `app.js:1642` — final decision cascade (all 3 exercise types)
- `app.js:1969` — first match-wrong cascade
All other 15 hits are comments/imports. Do NOT touch `src/screens/app.js` or `src/domain/progress.js` (Pitfall 12). The `readdir`-parametric smoke (`tests/domain.test.js` `loadAllExerciseFiles`) auto-covers `modali.json` because it has ≥1 exercise with `categoryIds.length >= 2`.

---

### `content/categories.json` (config index, append order 13)

**Analog:** the existing 12 entries; `dimostrativi` (order 11, line 13) and `possessivi` (order 12, line 14) are the Phase 36 appends and the exact precedent for the append.

**Current tail** (`categories.json` lines 12-14):
```json
    { "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 },
    { "id": "dimostrativi",      "name": "Dimostrativi (questo/quello)",          "order": 11 },
    { "id": "possessivi",        "name": "Possessivi (il mio/la tua)",            "order": 12 }
```

**Append one entry** (add a comma to line 14, then insert):
```json
    { "id": "modali", "name": "Verbi modali (potere/volere/dovere)", "order": 13 }
```
- `id` MUST be exactly `modali` (slug contract) — matches file name, exercise-id prefix, and `RESET_PREFIXES_V12`.
- `order: 13` — cosmetic/documental only. `content-loader` does NOT re-sort; `categoriesForDisplay` iterates the array in insertion order (ARCHITECTURE Pattern 3). Array position = display order. Append at the END (Anti-Pattern 2: never insert mid-array).
- Unique order (no duplicate) — orders currently run 1-12, 13 is the next free (Pitfall 14).
- **Do NOT add `origen`/`source` here** — deferred to Phase 39 (PROV-01). The base record (id/name/order) is Phase 37; the provenance stamp is Phase 39.
- `name` string style: mirrors the parenthetical-disambiguator pattern of `dimostrativi`/`possessivi` names. Exact wording is author discretion.

---

## Shared Patterns

### Editorial canon (applies to every explanation, prompt, and note in `modali.json`)
**Source:** `presente-regolare.json` explanations (e.g. lines 10, 67) + `possessivi.json` (e.g. lines 10, 132) + project memory (explanations_must_be_accented, gloss_es_desambiguacion_canon).
- Accented Spanish (RAE): á/é/í/ó/ú/ñ correct. A missing tilde flagged by quorum (C4-accent) is a REAL bug → fix the tilde, do NOT override (Pitfall 10, memory explanations_must_be_accented).
- ASCII apostrophe U+0027, plain text (no markdown), no smart-quotes.
- Italianisms quoted literally in Italian spelling (`può`, `voglio`, `devo`, `all'università`).
- NO R1 leak: prompt = sentence + blank only; never name the target form, person, or "(irregular)" tag in the prompt. Rule lives in `explanation` (shown after failure) + `notes` (author-internal).

### ES gloss (R7 disambiguator)
**Source:** every glossed prompt in `presente-regolare.json` (line 23, 33, 70…) and `possessivi.json` (line 78, 88, 98…).
**Apply to:** any modal variant where a second reading is defensible (person/meaning). `(en español: ...)` inside the prompt string, after the sentence. Canon R7 — not a leak; keep despite Gemini/DeepSeek C5 false-positive.

### Quorum validation
**Source:** `possessivi.json` validation blocks (simple: lines 108-124; reinforced 3-`by`: lines 175-197; disputed→rewrite audit: lines 56-58, 359-377).
**Apply to:** every new variant/slot. `status: validated`, ≥2 `correcta` passes, ≥2 distinct `by`. Base Claude Opus+Sonnet; reinforce magnet slots (accent trap, cross-exercise) with DeepSeek via `scripts/validate-ai-pass.mjs` (auto-fallback 429 → deepseek-reasoner as 2nd `by`). Resolve disputes by REWRITE, never override-shortcut (memory feedback_disputed_resolution).

### Cross-category cascade (content-only, D-54)
**Source:** `presente-regolare-300` (lines 412-417) / `possessivi-300` (lines 331-335) `categoryIds` shape; `app.js:1642` + `app.js:1969` (the only 2 call-sites, verified).
**Apply to:** `modali-300` only. `categoryIds: ["modali","presente-regolare"]` + zero engine edits.

---

## No Analog Found

None. Every artifact in this phase has an exact in-repo analog (born-in-slots verb category = `presente-regolare`; fresh same-milestone twin + cross-exercise = `possessivi`; index append = `dimostrativi`/`possessivi` entries). The planner should use the repo analogs above, not the RESEARCH.md code examples.

---

## Metadata

**Analog search scope:** `content/exercises/` (presente-regolare, possessivi read in full), `content/categories.json`, `src/screens/app.js` (grep applyImmediateFailure), `src/data/storage.js` (grep RESET_PREFIXES_V12).
**Files scanned:** 5 (2 read fully as analogs + 3 verification greps/reads).
**Pattern extraction date:** 2026-07-01
**Verified invariants:** D-54 = exactly 2 `applyImmediateFailure` call-sites (app.js:1642, app.js:1969); `modali` present in `RESET_PREFIXES_V12` (storage.js:1168); categories.json currently 12 entries (next order = 13).
