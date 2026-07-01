# Technology Stack — v1.9 (Determinantes + verbos A1/A2 + PROV-01)

**Project:** Italian Course — Ejercicios A1/A2
**Milestone:** v1.9 (subsequent / brownfield PURE content)
**Researched:** 2026-07-01
**Confidence:** HIGH (grounded by reading the actual repo, not training data)

## Executive Summary

**No new runtime dependencies. No new tooling. No new scripts. Reuse everything.**

v1.9 adds 4 grammar categories (Dimostrativi, Possessivi, Verbi modali, Verbi
riflessivi) authored from scratch by the existing cross-vendor quorum, plus one
transversal optional data field (PROV-01) marking content provenance. Both jobs
are already fully served by machinery shipped in v1.4–v1.7 and validated across
10 existing categories. The engine (cascada D-54 with 2 call-sites, sampler,
slot-engine, `localStorage`, migrations) is NOT touched — this is brownfield
pure content, identical in shape to every category added since v1.5.

The only code delta for the entire milestone is:

1. **4 new `content/exercises/*.json`** files (slot+variantes, hand-authored via
   the quorum), + **4 new entries** in `content/categories.json`.
2. **1 migration** `migrate10to11`-style bump (`schemaVersion 11 → 12`) that
   selectively resets ONLY the 4 new categories' progress — the standard
   v1.6/v1.7 pattern, unrelated to PROV-01.
3. **PROV-01:** a ~6-line optional field validator added to
   `src/data/schema-validator.js` (recommended: `origen` enum at the category
   level in `categories.json`). Zero migration for PROV-01 itself — it is CONTENT
   metadata in `content/`, not `state` in `localStorage`.

The recommended answer to "what stack additions are needed?" is: **essentially
none.** The rest of this document justifies precisely which existing pieces are
reused and specifies the minimal PROV-01 validator change with placement
rationale and backward-compat analysis.

## Recommended Stack (unchanged — verified against repo)

### Core (runtime) — NO CHANGE

| Technology | Version | Purpose | Why unchanged |
|------------|---------|---------|---------------|
| **Alpine.js** | 3.15.12 (CDN, pinned) | Reactive UI directives | Engine + screens untouched; new categories are just more JSON the existing render path already handles. |
| **`app.css` (vanilla)** | n/a | Base/reset + Editoriale tokens | Pico ELIMINATED in v1.8 (Phase 32, GAP-01). **Do NOT reintroduce Pico.** No new CSS needed — new categories render through the existing 3 exercise-type templates. |
| **Vanilla ES modules** | browser-native | Code organization | No new modules. Validator edit is in the existing `schema-validator.js`. |
| **localStorage** | browser-native | Progress persistence, single key `italianCourse.v1` + `schemaVersion` | `CURRENT_SCHEMA_VERSION = 11` today (`src/data/storage.js:35`). v1.9 bumps to 12 for the selective category reset — same chain pattern (`migrate1to2 … migrate9to10`) already in place. |
| **Native file import/export** | browser-native | Backup | `backup.js` round-trip must accept the new schemaVersion (standard `>N` reject bump), same as every prior milestone. Not a stack change. |

### Authoring / validation tooling — NO CHANGE

| Tool | Location | Purpose | Why reused as-is for the 4 new categories |
|------|----------|---------|--------------------------------------------|
| **Hand-written schema validator** | `src/data/schema-validator.js` | `validateContent` (dispatch `PAYLOAD_VALIDATORS` + `SURFACE_VALIDATORS`); separate `validateSongs` | Already validates slot+variantes: `payload` XOR `variants[]`, per-surface validation by `type`, slot-level `explanation`, and the optional top-level `validation.passes[]`. The 4 new categories are exactly this shape — the validator needs ZERO change to accept them. |
| **Cross-vendor quorum pipeline** | `scripts/validate-ai-pass.mjs` | One external pass (Gemini/DeepSeek, auto-fallback on 429, `--write`) per exercise, R1-R7 rules | Zero-deps (native `https`/`fs`). Finds exercises by scanning `content/exercises/*.json` (`findExercise`, lines 87-101) — the 4 new files are auto-discovered, no script edit. Writes into `validation.passes[]` surgically (`writePass`), re-derives `status` via `deriveStatus`. Claude passes run via the `gsd-validate-exercise` skill (Task subagents). |
| **`deriveStatus`** | `src/data/validation-state.js` | Single source of truth for `pending`/`validated`/`disputed` | Imported by the quorum script (WR-01). Unchanged. |
| **Node.js test runner** | `node --test tests/*.test.js` | Regression | New categories add +4 rows to the parametric smoke (data, not code) — see "What NOT to add". Path-glob invocation required (bare path fails on Node 22.20 per MEMORY). |
| **`npx serve` / Live Server** | n/a | Local static serving | Unchanged. |

**Why reuse suffices (root cause):** since v1.4 the slot+variantes model is a
generic container validated by `type`, not by category. Every category added
since (Articoli, Partitivi, Presente-regolare, + the 6 CONV-01 conversions) went
in as pure JSON + one migration + count bumps, with the engine and validator
untouched. The 4 v1.9 categories are the same class of change. The quorum
pipeline is likewise category-agnostic: it validates one exercise object against
R1-R7 regardless of which file it lives in.

## PROV-01 — Provenance marker (the only genuinely new field)

**Goal:** an OPTIONAL, backward-compatible enum marking whether content came
from the teacher's notes or the AI quorum:

- values: `apuntes-profesora` | `ia-quorum`
- the 4 new v1.9 categories are born `ia-quorum` (pure)
- must NOT break the 10 existing categories (which carry no such field)

### Critical backward-compat fact (verified in code)

`validateContent` does **NOT** perform an exhaustive/strict key check on either
category objects or exercise objects. It only asserts required fields are
present and well-typed, and ignores unknown fields. Concretely:

- Category loop (`schema-validator.js:78-90`) checks only `id` (slug), `name`,
  and uniqueness. An extra `origen` key is silently accepted **today, with zero
  code change.**
- Exercise loop checks `id`, `type`, `categoryIds`, `payload` XOR `variants`,
  and the optional `validation`. Unknown top-level keys are ignored.
- The category objects flow into the UI via `categoriesRaw.categories`
  (`content-loader.js:131`) essentially as-is; adding a field does not disturb
  `categoriesForDisplay` (`app.js:3020`), which reads only `id`/`name`/progress.

So the **absolute minimum** for PROV-01 is *nothing* — the field is already
tolerated. The value of adding a validator rule is to catch typos in the enum
(`ia-quorom`, `apuntes_profesora`) at boot with a red banner, consistent with how
every other content field is guarded. Recommended, but small.

### Field-placement comparison

| Placement | Validator-change cost | Backward-compat for 10 existing cats | Granularity | Verdict |
|-----------|----------------------|--------------------------------------|-------------|---------|
| **A. Per-category in `categories.json`** (`origen` on each category object) | **Lowest.** ~6 lines in the existing category loop (`schema-validator.js:78-90`), mirroring the `validation` optional-field pattern. One check runs 10–14 times total. | **Free.** Existing 10 category objects omit the field → optional → accepted. New 4 declare `"origen": "ia-quorum"`. Legacy mixed-provenance cats can be labeled later with a single field each. | Coarse (whole category). Matches the domain: v1.9 cats are *entirely* `ia-quorum`; the legacy cats are *entirely* teacher-derived except a few quorum-authored variants. | **RECOMMENDED.** |
| **B. Per-exercise/slot** (`origen` on each exercise object) | Medium. New optional-field helper called once per exercise (~180+ call sites at runtime), plus a new branch in the exercise loop. More lines, more test surface. | Free (optional). But every new exercise must carry the field to be meaningful, multiplying authoring effort. | Fine (per slot). Overkill: within one v1.9 category, every slot has identical provenance. | Not recommended. |
| **C. Per-variant** (`origen` inside each `variants[k]`) | Highest. Must thread through `SURFACE_VALIDATORS` (which today validate a pure surface `{prompt,options,...}`), touching all 3 surface validators + `validateVariants`. Largest blast radius, closest to the engine. | Free (optional) but invasive: the surface validators are shared with song phrases; adding a field there risks scope creep. | Finest. Genuinely useful only for a *mixed-provenance slot* (some variants teacher, some quorum) — a case that does not exist in v1.9 and is rare in legacy. | Not recommended. |

### Recommended PROV-01 implementation (Placement A)

Add to `categories.json` for the 4 new categories:

```json
{ "id": "dimostrativi", "name": "Dimostrativi", "order": 11, "origen": "ia-quorum" }
```

Add a guarded optional check in the existing category loop of `validateContent`
(mirrors the `validateValidationShape` "absence = accepted" contract):

```js
const VALID_ORIGEN = ['apuntes-profesora', 'ia-quorum'];
// ... inside the `for (const cat of categories)` loop, after the name check:
if ('origen' in cat && !VALID_ORIGEN.includes(cat.origen)) {
  push('categories.json', cat.id,
    `"origen" inválido: ${JSON.stringify(cat.origen)} (esperado: apuntes-profesora|ia-quorum)`);
}
```

- **Lines changed:** ~5 (one `const` + one `if`). No new function, no new module.
- **Migration:** NONE for PROV-01 (content field, not `state`). The 11→12 bump
  in v1.9 exists solely for the selective progress reset of the 4 new
  categories and would happen with or without PROV-01.
- **Backward-compat:** the 10 existing categories omit `origen` → `'origen' in cat`
  is false → skipped → accepted. Verified against the current loop semantics.
- **Legacy mixed labeling:** the milestone can optionally backfill `origen` on
  the 10 existing categories later (their provenance is mostly teacher-notes with
  quorum-authored variants) — that is a one-field-per-line edit, decided in
  discuss/plan per the PROJECT note. Placement A does not force it.

**Note on `source` vs `origen`:** PROJECT.md writes `source`/`origen`
interchangeably. Recommend committing to **`origen`** for consistency with the
Spanish-domain field naming already in the codebase (`categoryIds`, `explanation`
are English by legacy, but new author-facing enums lean Spanish; either works —
pick one and enforce it in the enum check). LOW-stakes naming choice; defer to
author preference in discuss.

## Installation

**No installation step.** No `npm install`, no new package, no `package.json`
change. The quorum script continues to read `GEMINI_API_KEY` / `DEEPSEEK_API_KEY`
from `.env` (already configured). Node LTS for `node --test` and `npx serve` is
already assumed.

## Alternatives Considered (and rejected)

| Category | Recommended | Alternative | Why not |
|----------|-------------|-------------|---------|
| Provenance placement | Per-category in `categories.json` (A) | Per-exercise (B) / per-variant (C) | B/C add validator surface and authoring burden for granularity v1.9 does not need — provenance is uniform per category. |
| Provenance enforcement | ~6-line optional check | New validation library (Valibot/Zod) | The hand-written validator already accumulates all errors in one pass; adding a dependency for one enum contradicts the v1 "no runtime deps" principle and the What-NOT-to-Use table. |
| PROV-01 persistence | Content field (no migration) | State field + migration | Provenance is a property of authored content, not user progress. Putting it in `state` would need a migration AND would desync from the JSON source of truth. |
| Authoring the 4 categories | Existing quorum (`validate-ai-pass.mjs` + `gsd-validate-exercise`) | New per-category script | The script is category-agnostic (scans all `content/exercises/*.json`); a new script would duplicate `findExercise`/`writePass`/`deriveStatus` for zero gain. |

## What NOT to Add (guardrails for the roadmap)

| Avoid | Why |
|-------|-----|
| **Any new runtime library** (validation, state, UI) | The slot+variantes engine + hand-written validator already handle the 4 categories. Adding deps violates the v1 no-build/no-deps principle and the CLAUDE.md "What NOT to Use" table. |
| **Reintroducing Pico CSS** | ELIMINATED in v1.8 (Phase 32, GAP-01); `app.css` is the base/reset. The `--pico-*` remap loses the cascade. New categories need no CSS at all. |
| **Touching the engine** (cascada D-54, sampler, slot-engine, promotions/racha) | Brownfield pure content. The 2 `applyImmediateFailure` call-sites are an invariant (Pitfall #2) — new categories flow through unchanged. |
| **A new quorum/authoring script** | `validate-ai-pass.mjs` auto-discovers the new files. Editing STATE.md SDK handlers is unnecessary; per MEMORY, they reject positional Spanish argv — edit JSON directly / use the script as-is. |
| **Per-exercise or per-variant provenance** | Overkill granularity; larger validator blast radius (surface validators are shared with songs). |
| **A migration for PROV-01** | It's content metadata in `content/`, not `state`. Only the selective category-reset needs the 11→12 bump. |
| **Number-magic count constants** | Follow the dynamic-count pattern (`TOTAL_EXPECTED` derived, never hard-coded) + `+4` parametric smoke rows — data, not code (matches v1.6/v1.7). |

## Sources

- `src/data/schema-validator.js` (read in full) — confirmed optional-field
  pattern (`validateValidationShape`, `'x' in obj` guard), no strict key
  checking on category/exercise objects, slot+variantes `payload` XOR
  `variants[]` (HIGH)
- `scripts/validate-ai-pass.mjs` (read in full) — zero-deps quorum, category-
  agnostic file discovery, surgical `writePass`, `deriveStatus` import (HIGH)
- `src/data/storage.js:35` — `CURRENT_SCHEMA_VERSION = 11`; migration chain
  `migrate1to2 … migrate9to10` present (HIGH)
- `src/data/content-loader.js` — category objects pass through
  `categoriesRaw.categories` largely as-is; `normalizeExerciseToSlot` (HIGH)
- `content/categories.json` — 10 categories, `{id,name,order}` shape (HIGH)
- `content/exercises/presente-regolare.json` — real slot+variantes +
  `validation.passes[]` shape reference (HIGH)
- `src/screens/app.js:3020` `categoriesForDisplay` — reads only id/name/progress,
  ignores extra category fields (HIGH)
- `.planning/PROJECT.md` §Current Milestone v1.9 — PROV-01 scope, 11→12
  selective reset pattern, 4 categories born `ia-quorum` (HIGH)
- `CLAUDE.md` §What NOT to Use, MEMORY (Pico removed, quorum validator, test
  command) — guardrails (HIGH)

---
*Stack research for: v1.9 — 4 new grammar categories + PROV-01 provenance.*
*Researched: 2026-07-01. Brownfield pure content — engine untouched.*
