# Phase 38: Verbi riflessivi - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 2 (1 NEW content file, 1 MODIFIED index)
**Analogs found:** 2 / 2 (both exact)

Brownfield CONTENT ONLY. No engine/JS file is created or modified. This map covers the two data artifacts the planner will author: the new category file `content/exercises/riflessivi.json` and the one-line index append to `content/categories.json`. The TWO cross-category exercises `riflessivi-300` / `riflessivi-301` live INSIDE the new file, so they are mapped as sub-patterns of file 1. `riflessivi` is the MOST layered of the milestone's 4 births (5 REFLEX layers) and carries a MAGNET slot (pp concordancia, REFLEX-04) requiring an extra DeepSeek round.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/riflessivi.json` (NEW) | content / config (data) | transform (slot+variantes born-in-slots) | `content/exercises/presente-regolare.json` + `content/exercises/modali.json` | exact (same-milestone twin) |
| `riflessivi-pp-concordanza` MAGNET slot (inside `riflessivi.json`) | content (data) | transform (4-way agreement matrix) | `presente-regolare-301` + `essere-passato-prossimo-stato/stata/stati/state` | exact |
| `riflessivi-collocazione-wb` word-buttons (inside `riflessivi.json`) | content (data) | transform (token-order slot) | `presente-regolare-are-wb` / `modali-infinito-wb` | exact |
| `riflessivi-300` cross-exercise (inside `riflessivi.json`) | content (data) | transform (multi-cat cascade node) | `presente-regolare-300` / `modali-300` | exact |
| `riflessivi-301` cross-exercise (inside `riflessivi.json`) | content (data) | transform (multi-cat cascade node) | `presente-regolare-301` | exact |
| `content/categories.json` (MODIFIED, append order 14) | config (index) | CRUD (append one array entry) | existing 13 entries; `modali` (order 13) is the Phase 37 append | exact |

**Why not `match`:** VERBI RIFLESSIVI is 0-match by decision (D-04 / D-38-03). Pronombre↔persona (`mi`↔io) is a mechanical association derivable once the paradigm is known — exactly what D-04/R3 forbid; conjugation is derivable by root. So the analog for exercise TYPES is `presente-regolare` / `modali` (MC + word-buttons only), NOT the `articoli` match slots. Do NOT author a `match` exercise; document the 0-match in `notes` (mirror of `presente-regolare.json:2` and `modali.json:2`).

---

## Pattern Assignments

### `content/exercises/riflessivi.json` (content, born-in-slots transform)

**Analog:** `content/exercises/presente-regolare.json` (verb category born in slots) + `content/exercises/modali.json` (freshest Phase-37 twin, same canon/dates/validation shape).

**Top-level shape** (`presente-regolare.json` lines 1-3; `modali.json` lines 1-3):
```json
{
  "notes": "Categoría riflessivi (order 14) nacida DIRECTAMENTE en slot+variantes (clon de presente-regolare/modali). 0-MATCH por D-04/D-38-03 ... [+ scope-gate: recíprocos si amano/ci scriviamo FUERA]",
  "exercises": [ ... ]
}
```
- No top-level `categoryId`. Membership is per-exercise in `categoryIds[]`.
- `notes` is author-internal prose (accented Spanish RAE, ASCII apostrophe U+0027, plain text, no markdown). This is where the 0-match decision (D-04, mirror `presente-regolare.json:2`) AND the HARD scope-gate for reciprocals (`si amano`/`ci scriviamo`, deferred) get documented. Mirror the density of `modali.json:2` (which documents both its 0-match AND its passato-prossimo-modal scope-gate).

**MC slot pattern** (copy from `presente-regolare.json` lines 4-60; `modali.json` lines 4-75 `modali-potere`):
```json
{
  "id": "riflessivi-<semantic>",
  "type": "multiple-choice",
  "categoryIds": [ "riflessivi" ],
  "explanation": "<accented ES, regla + paralelo, plain text, ASCII apostrophe, NO R1 leak>",
  "variants": [
    {
      "prompt": "Io ___ Marco. (en español: yo me llamo)",
      "options": [ "mi chiamo", "ti chiami", "si chiama", "chiamo mi" ],
      "correctIndex": 0
    },
    { "...": "≥2 variants per slot; distractoras plausibles" }
  ],
  "validation": { "status": "validated", "passes": [ ... ] }
}
```
- `id` prefix MUST be `riflessivi-` (slug contract, Phase 35 D-35-01/02; already in `RESET_PREFIXES_V12`, storage.js:1168, with explicit `delete categoryProgress['riflessivi']` at storage.js:1215 — verified, no `startsWith` collision). Semantic ids like `riflessivi-presente`, `riflessivi-su-regolari`, `riflessivi-pp-concordanza`, `riflessivi-mismatch` — exact final map approved by author at checkpoint (D-38-03).
- Italianisms quoted literally (`mi sveglio`, `si è svegliata`, `ci laviamo`). NO smart-quotes.

**Proposed slot map (D-38-03 GUIDE, author approves at checkpoint):** `riflessivi-presente` (MC, chiamarsi + personas, REFLEX-01), `riflessivi-collocazione-wb` (word-buttons, REFLEX-02, HARD required), `riflessivi-su-regolari` (MC/word-buttons, REFLEX-03), `riflessivi-pp-concordanza` (MC MAGNET, REFLEX-04), `riflessivi-mismatch` (MC, ES↔IT trío, REFLEX-05), + `riflessivi-300`/`riflessivi-301`. Minimum coverage = 5 layers + 2 cruces.

---

### `riflessivi-pp-concordanza` MAGNET slot (REFLEX-04, Pitfall 6) — inside `riflessivi.json`

**Analog:** `presente-regolare-301` (`presente-regolare.json` lines 472-543) — THE direct mould — reinforced by `essere-passato-prossimo-stato/stata/stati/state` (`essere.json` lines 621-740, the 4-cell matrix stato/stata/stati/state).

**Clone VERBATIM the `presente-regolare-301` mechanics** — 4 terminaciones -o/-a/-i/-e as contrasting variants, one per subject cue, `avere`-auxiliary as distractor (NEVER key):
```json
{
  "id": "riflessivi-pp-concordanza",
  "type": "multiple-choice",
  "categoryIds": [ "riflessivi" ],
  "explanation": "<accented ES: pp reflexivo SIEMPRE con essere; participio concuerda gén/núm con el sujeto -o/-a/-i/-e; NO gloss ES (el español no concuerda el participio, D-38-01)>",
  "variants": [
    { "prompt": "Ieri Marco ___ presto.",        "options": [ "mi sono svegliato", "si è svegliato", "si è svegliata", "si ha svegliato" ], "correctIndex": 1 },
    { "prompt": "Ieri Maria ___ tardi.",          "options": [ "si è svegliato", "si è svegliata", "si è svegliate", "si ha svegliata" ], "correctIndex": 1 },
    { "prompt": "Ieri i ragazzi ___ insieme.",    "options": [ "si sono alzate", "si sono alzati", "si è alzati", "si hanno alzati" ], "correctIndex": 1 },
    { "prompt": "Stamattina le ragazze ___ tardi.", "options": [ "si sono alzate", "si sono alzati", "si è alzate", "si hanno alzate" ], "correctIndex": 0 }
  ],
  "validation": { "status": "validated", "passes": [ opus, sonnet_or_deepseek, deepseek-EXTRA ] }
}
```
- **Cue = nombres propios / sujetos explícitos** carrying gender+number NATURALLY: `Marco`→`-o`, `Maria`→`-a`, `i ragazzi`→`-i`, `le ragazze`→`-e` (D-38-01, verbatim mirror of `presente-regolare-301` lines 482-519). ONE correct ending per variant, no R1-leak (never name the ending or the rule).
- **NO gloss ES `(en español: …)` in this slot** (D-38-01) — Spanish (`me he despertado`) does NOT agree the participle; a gloss would confuse. This is the ONE slot that departs from the R7-gloss habit of `presente-regolare-301` (which DID carry glosses because there person disambiguation was defensible; here the ES has no agreement to disambiguate).
- **CERO `avere`** in ANY reflexive pp variant — all reflexives take `essere`; `*mi ho svegliato` / `*si ha svegliato` is an OBLIGATORY distractor, never a key. Grep-verifiable (verify BEFORE quorum: no `avere` aux, no `-o` ending for a feminine cue).
- **Extra DeepSeek round OBLIGATORY** (D-38-04 magnet / Pitfall 6): DeepSeek is strict on concordancia/acentos and catches a `-o` for a feminine subject that human-verify approves. Discipline = D-31-08 (verify all 4 endings explicitly; see the `concerns[]` audit at `presente-regolare.json:529-533`).

---

### `riflessivi-collocazione-wb` word-buttons (REFLEX-02, HARD) — inside `riflessivi.json`

**Analog:** `presente-regolare-are-wb` (`presente-regolare.json` lines 360-410) + `modali-infinito-wb` (`modali.json` lines 270-326).

**Shape** (copy `answer[]`+`distractors[]` verbatim; NOT `options`/`correctIndex`):
```json
{
  "id": "riflessivi-collocazione-wb",
  "type": "word-buttons",
  "categoryIds": [ "riflessivi" ],
  "explanation": "<accented ES: el pronombre reflexivo va ANTES del verbo conjugado; mi sveglio, nunca *sveglio mi>",
  "variants": [
    {
      "prompt": "Yo me despierto temprano.",
      "answer": [ "io", "mi", "sveglio", "presto" ],
      "distractors": [ "sveglio mi", "si" ]
    }
  ]
}
```
- REFLEX-02 HARD requirement: the bank MUST include the ORDER-distractor (`*sveglio mi`, pronoun after the verb) so the token bank forces `mi sveglio` (pronoun BEFORE the conjugated verb). This mirrors how `modali-infinito-wb` seeds a conjugated-verb distractor (`mangio`/`andiamo`, lines 286-303) to force the modal+infinitive order.
- Prompt in Spanish; answer/distractors as Italian tokens.

---

### `riflessivi-300` cross-category exercise (↔presente-regolare) — inside `riflessivi.json`

**Analog:** `presente-regolare-300` (`presente-regolare.json` lines 411-471) / `modali-300` (`modali.json` lines 328-390). LAST-but-one in the array, id `-300`, `categoryIds` of exactly 2.
```json
{
  "id": "riflessivi-300",
  "type": "multiple-choice",
  "categoryIds": [ "riflessivi", "presente-regolare" ],
  "explanation": "<accented ES: reflexivo PRESENTE sobre terminación regular; ya sabes -are/-ere/-ire, lo nuevo es el pronombre pre-puesto (mi sveglio / ci laviamo)>",
  "variants": [ { "prompt": "...", "options": [...], "correctIndex": N }, { "...": "≥2" } ],
  "validation": { "status": "validated", "passes": [ opus, deepseek/sonnet ] }
}
```
- `categoryIds: ["riflessivi","presente-regolare"]` — 2 slugs, stable id. `presente-regolare` exists (order 10) — dependency satisfied.

### `riflessivi-301` cross-category exercise (↔essere) — inside `riflessivi.json`

**Analog:** `presente-regolare-301` (`presente-regolare.json` lines 472-543) — the DIRECT analog — cross with `essere` where the pp concordancia cascades. `essere` exists (order 2) — dependency satisfied.
```json
{
  "id": "riflessivi-301",
  "type": "multiple-choice",
  "categoryIds": [ "riflessivi", "essere" ],
  "explanation": "<accented ES: pp reflexivo con essere + concordancia -o/-a/-i/-e; donde essere cascadea>",
  "variants": [ { "prompt": "Ieri Marco si ___ presto. ...", "options": [...], "correctIndex": N }, "..." ],
  "validation": { "status": "validated", "passes": [ opus, deepseek-reasoner ] }
}
```
- **D-38-04:** SC#4 requires TWO cruces (unlike Phase 37 which had 1). Both at the END of the array, `-300` then `-301`. Reuse the concordancia mechanics from `presente-regolare-301` here too (this is `riflessivi-301`'s literal precedent; also carry the CERO-`avere` invariant and DeepSeek reinforcement, since it is a pp-agreement node).

**D-54 INVARIANT (verified — MUST hold):** Both cross-exercises are authored as NORMAL slots+variantes with a 2-element `categoryIds`. They reuse the existing cascade via `applyResultToSession`; they add ZERO new `applyImmediateFailure` call-sites. Grep of `src/screens/app.js` confirms EXACTLY 2 real call-sites remain:
- `app.js:1642` — final decision cascade (all 3 exercise types)
- `app.js:1969` — first match-wrong cascade

All other 13 hits are comments/imports/JSDoc. Do NOT touch `src/screens/app.js` or `src/domain/progress.js` (Pitfall 12). The `readdir`-parametric smoke (`tests/domain.test.js` `loadAllExerciseFiles`) auto-covers `riflessivi.json` because it has ≥1 exercise with `categoryIds.length >= 2`.

---

### `content/categories.json` (config index, append order 14)

**Analog:** the existing 13 entries; `modali` (order 13, line 15) is the Phase 37 append and the exact precedent.

**Current tail** (`categories.json` lines 13-15):
```json
    { "id": "dimostrativi",      "name": "Dimostrativi (questo/quello)",              "order": 11 },
    { "id": "possessivi",        "name": "Possessivi (il mio/la tua)",                "order": 12 },
    { "id": "modali",            "name": "Verbi modali (potere/volere/dovere)",       "order": 13 }
```

**Append one entry** (add a comma to line 15, then insert):
```json
    { "id": "riflessivi", "name": "Verbi riflessivi (mi chiamo/si alza)", "order": 14 }
```
- `id` MUST be exactly `riflessivi` (slug contract) — matches file name, exercise-id prefix, and `RESET_PREFIXES_V12` (storage.js:1168). NOT `verbi-riflessivi` (that is only the phase directory name, per D-35 / CONTEXT line 20).
- `order: 14` — cosmetic/documental only. `content-loader` does NOT re-sort; `app.js categoriesForDisplay` iterates the array in insertion order (ARCHITECTURE Pattern 3). Array position = display order. Append at the END (never insert mid-array).
- Unique order — orders currently run 1-13; 14 is the next free.
- **Do NOT add `origen`/`source` here** — deferred to Phase 39 (PROV-01). The base record (id/name/order) is Phase 38; the provenance stamp is Phase 39.
- `name` string style: mirrors the parenthetical-disambiguator pattern of `modali`/`possessivi` names. Exact wording is author discretion.

---

## Shared Patterns

### Editorial canon (applies to every explanation, prompt, and note in `riflessivi.json`)
**Source:** `presente-regolare.json` explanations (e.g. lines 10, 418, 479) + `modali.json` (e.g. lines 10, 335) + project memory (explanations_must_be_accented, gloss_es_desambiguacion_canon).
- Accented Spanish (RAE): á/é/í/ó/ú/ñ correct. A missing tilde flagged by quorum (C4-accent) is a REAL bug → fix the tilde, do NOT override (Pitfall 10, memory explanations_must_be_accented). See `modali.json:63-64` for the disputed→rewrite audit pattern.
- ASCII apostrophe U+0027, plain text (no markdown), no smart-quotes.
- Italianisms quoted literally in Italian spelling (`mi sveglio`, `si è svegliata`, `ci laviamo`, `un po'`).
- NO R1 leak: prompt = sentence + blank (+ ES gloss where legitimate) only; never name the target form, person, ending, or "(reflexivo)" tag in the prompt. Rule lives in `explanation` (shown after failure) + `notes` (author-internal).

### ES gloss (R7 disambiguator) — with a MAGNET exception
**Source:** every glossed prompt in `presente-regolare.json` (lines 23, 33, 70…) and `modali.json` (lines 13, 85, 146…).
**Apply to:** REFLEX-05 mismatch slot (OBLIGATORY there — Pitfall 6/9, the legitimate disambiguator where reflexivity differs: `ammalarsi` vs "enfermar", `dimenticarsi (di)` vs "olvidarse (de)", `salire` NON-reflexive vs "subirse") + any variant where person/meaning is defensible. `(en español: …)` inside the prompt string, after the sentence. Canon R7 — NOT a leak; keep despite Gemini/DeepSeek C5 false-positive (see `modali.json:257` audit).
**DO NOT apply to:** `riflessivi-pp-concordanza` (D-38-01) — the Spanish participle does not agree, so a gloss would confuse rather than disambiguate. This is the deliberate exception to the otherwise-universal gloss habit.

### Quorum validation
**Source:** `presente-regolare.json` (simple 2-Claude: lines 43-58; reinforced opus+deepseek: lines 522-541 `presente-regolare-301`) + `modali.json` (opus + deepseek-reasoner: lines 115-135; disputed→rewrite audit: lines 63-64).
**Apply to:** every new variant/slot. `status: validated`, ≥2 `verdict: correcta` passes, ≥2 distinct `by`. Base = Claude Opus + Sonnet. `by` values seen in-repo: `claude-opus-4-8`, `claude-sonnet-4-6`, `deepseek-chat`, `deepseek-reasoner`. The `concerns[]` array carries the dispute-resolution audit (D-31-08 4-ending verification for concordancia; see `presente-regolare.json:529-533`). Resolve disputes by REWRITE, never override-shortcut (memory feedback_disputed_resolution).
**MAGNET reinforcement (D-38-04, Pitfall 6):** `riflessivi-pp-concordanza` AND `riflessivi-301` get an EXTRA DeepSeek round (via `scripts/validate-ai-pass.mjs`, auto-fallback 429 → deepseek-reasoner as an added `by`). DeepSeek pass is OBLIGATORY for the pp-agreement nodes.
**Executor caveat (memory executor_cannot_run_task_quorum):** if authoring runs via execute-phase→gsd-executor, the canonical Opus+Sonnet base (skill `gsd-validate-exercise`, which spawns Task subagents) is NOT available inside the subagent → it falls back to Opus-inline + DeepSeek (meets the structural bar). For the canonical Opus+Sonnet base, validate top-level after execute-phase. The DeepSeek magnet pass is required either way.

### Cross-category cascade (content-only, D-54)
**Source:** `presente-regolare-300`/`-301` (lines 414-417, 475-478) / `modali-300` (lines 331-334) `categoryIds` shape; `app.js:1642` + `app.js:1969` (the only 2 call-sites, verified).
**Apply to:** `riflessivi-300` (`["riflessivi","presente-regolare"]`) and `riflessivi-301` (`["riflessivi","essere"]`) only. Zero engine edits.

---

## No Analog Found

None. Every artifact in this phase has an exact in-repo analog:
- born-in-slots verb category = `presente-regolare` / `modali`
- pp-concordancia MAGNET (4-way -o/-a/-i/-e + subject cue + no `avere`) = `presente-regolare-301` (mould) + `essere-passato-prossimo-stato/stata/stati/state` (matrix)
- word-buttons order slot = `presente-regolare-are-wb` / `modali-infinito-wb`
- cross-exercises = `presente-regolare-300`/`-301` / `modali-300`
- index append = `modali` entry (order 13)

The planner should use the repo analogs above, not the RESEARCH.md code examples.

---

## Metadata

**Analog search scope:** `content/exercises/` (presente-regolare + modali read in full as analogs; essere grepped for concordancia slots), `content/categories.json` (read fully), `src/screens/app.js` (grep applyImmediateFailure), `src/data/storage.js` (grep riflessivi / RESET_PREFIXES_V12).
**Files scanned:** 6 (3 read fully + 3 verification greps).
**Pattern extraction date:** 2026-07-01
**Verified invariants:**
- D-54 = exactly 2 `applyImmediateFailure` call-sites (app.js:1642, app.js:1969); all other 13 hits are comments/imports/JSDoc.
- `riflessivi` present in `RESET_PREFIXES_V12` (storage.js:1168) with explicit `delete categoryProgress['riflessivi']` (storage.js:1215) — no `startsWith` collision.
- `essere.json` carries the 4-cell agreement matrix stato/stata/stati/state (lines 621-740) — the `essere` shape `riflessivi-301` cascades with.
- `categories.json` currently 13 entries (orders 1-13, `modali`=13); next free order = 14.
