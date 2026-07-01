# Phase 39: PROV-01 + integración lockstep (cierre v1.9) - Research

**Researched:** 2026-07-01
**Domain:** Metadata schema extension + count-array lockstep (brownfield puro de contenido; motor NO tocado)
**Confidence:** HIGH

## Summary

Phase 39 is the low-risk CLOSEOUT of milestone v1.9 and a DIRECT mirror of Phase 31 (v1.7 closeout). The four new categories (`dimostrativi`, `possessivi`, `modali`, `riflessivi`) are **already fully authored, registered in `categories.json` (order 11–14), and all 28 exercises are `validated` by cross-vendor quorum with ≥2 distinct `by`.** The engine (cascada D-54, sampler, slot-engine, storage) is byte-untouched and must stay so. The migration `11→12` (Phase 35) is already shipped (`CURRENT_SCHEMA_VERSION=12`, `RESET_PREFIXES_V12` present). Phases 36/37/38 already handled the INT-04 quorum magnets.

The actual work in Phase 39 is small and mechanical: (1) add an OPTIONAL `origen` enum field to the schema-validator's category loop (~6 lines, retrocompatible); (2) stamp `origen: "ia-quorum"` onto exactly the 4 new entries in `categories.json` (legacy 10 stay ABSENT); (3) add the 4 new categories to **all three hardcoded count arrays + the run-validation `TOTAL_EXPECTED_BASELINE` coherence-guard formula** (the easiest thing to forget), using DYNAMIC `slotCountOf`/`.exercises.length` (never a magic number).

**One critical entanglement:** the currently-red suite (`598/599`, and the run-validation reporter FAIL 197/195) is caused by a PRE-EXISTING count mismatch: `genero-numero.json` has 13 exercises on disk but all three arrays expect 12 (the 13th, `genero-numero-nazionalita`, was added by quick task `260614-hxn`). **Phase 39 must fix genero-numero 12→13 in the same lockstep pass** or the "suite verde estricta" success criterion (SC-5) cannot be met. This is separate from the +4 new categories but shares the exact same files, so it belongs in this phase.

**Primary recommendation:** Add optional `origen` enum to schema-validator (validate enum, absence = accepted); stamp the 4 new categories only; add the 4 new categories to the 3 count arrays with dynamic counts + extend the baseline-guard formula; fix the pre-existing genero-numero 12→13; verify `git diff src/screens/app.js src/domain/progress.js` is empty and the 2-call-site invariant holds; run full suite + `VAL_07_STRICT=1` green.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PROV-01 | Schema-validator acepta campo OPCIONAL `origen` (enum `ia-quorum`\|`apuntes-profesora`) a nivel categoría, retrocompatible, valida enum | Exact insertion point: `src/data/schema-validator.js` lines 78–90 (category loop). Pattern to clone: `validateValidationShape` (lines 608–654) — optional field, `if (!('x' in obj)) return`, enum via `.includes()`. Absence = accepted by construction (loop never inspects unknown fields). |
| PROV-02 | 4 nuevas nacen con `origen: "ia-quorum"`; 10 legacy quedan ABSENT | `content/categories.json` lines 13–16 (the 4 new, orders 11–14) currently have NO `origen`. Add `"origen": "ia-quorum"` to exactly those 4. Leave lines 3–12 (legacy) untouched. |
| INT-01 | 4 entradas en `categories.json` (append, order 11–14), no rompe display | ALREADY DONE — lines 13–16 present, orders 11/12/13/14 unique, no duplicates. content-loader iterates categories ids (line 117), so they already load at boot. Verify only. |
| INT-02 | Counts re-sincronizados: 3 arrays + `TOTAL_EXPECTED` + baseline-guard + smoke, dynamic-count | The 4 new categories are ABSENT from all 3 arrays. See §Count Sync Touchpoints below for exact file:line + current/target. |
| INT-03 | Cruces multi-cat existen, reusan `applyResultToSession`, D-54 en EXACTAMENTE 2 call-sites | Cruces ALREADY exist (verified below). D-54 verified at exactly 2 call-sites (app.js:1642, app.js:1969). Phase must keep engine diff empty. |
| INT-04 | Todas las variantes validadas 1-por-1 por quórum R1-R7 con rondas EXTRA en 3 magnets | ALL 28 new exercises already `validated` with ≥2 `by`; the 3 magnets have DeepSeek passes (verified below). At closeout INT-04 = CONFIRM/VERIFY, not re-author. |

## User Constraints (from source-of-truth docs; no CONTEXT.md exists yet)

> No `.planning/phases/39-.../*-CONTEXT.md` exists — no discuss-phase has run. The constraints below are LOCKED by REQUIREMENTS.md / ROADMAP.md / CLAUDE.md and carry the same authority.

### Locked Decisions
- **Field name is `origen`** (Spanish), enum values `"ia-quorum"` | `"apuntes-profesora"`. NOTE: ARCHITECTURE.md (dated 2026-07-01 09:31, pre-registration) calls it `source` — that name is SUPERSEDED. REQUIREMENTS.md PROV-01/02 and ROADMAP.md SC-1/2 (both later) say `origen`. Use `origen`.
- **Legacy 10 categories: `origen` ABSENT** (not `null`, not a value). Their provenance is MIXED (PDF-transcribed then quorum-augmented in CONV-01); labeling them at category level would lie (REQUIREMENTS.md line 88, PROV-02, Pitfall 15). Absence is the honest choice.
- **Category-level granularity only for v1.9.** Per-slot/per-variant provenance (PROV-X1) is DEFERRED (REQUIREMENTS.md line 73). Do NOT add slot-level `origen`.
- **Motor v1.4 NO se toca.** `git diff src/screens/app.js src/domain/progress.js` MUST be empty. Cascada D-54 stays at EXACTAMENTE 2 call-sites.
- **Dynamic-count, never magic number (D-31-06).** New count-array entries use `slotCountOf(...)`/`.exercises.length`.

### Claude's Discretion
- Exact wording of the enum error message (Spanish, per FOUND-04 convention in the validator).
- Whether the run-validation `TOTAL_EXPECTED_BASELINE` guard is reframed as a sum-of-dynamic-slots or kept as an extended literal-plus-dynamic formula (both honest, see §Count Sync).
- Whether to add a schema-validator unit test for the new `origen` enum (recommended: yes, mirror the `validateValidationShape` test style).

### Deferred Ideas (OUT OF SCOPE)
- Per-slot/per-variant `origen` (PROV-X1).
- Re-authoring any of the 4 new categories' content (already validated).
- Any engine change, any migration change (Phase 35 shipped).
- Responsive/mobile (v1.8 deferred).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `origen` enum validation | Data/Validation (`schema-validator.js`) | — | Pure content validation; runs in Node tests + browser boot. No engine, no DOM. |
| Stamp `origen` on 4 new cats | Content (`categories.json`) | — | Hand-authored JSON metadata; content-loader passes it through untouched. |
| Count sync (3 arrays + baseline) | Test harness + validation script | — | Guardrails only; no runtime behavior. |
| Cruces multi-cat cascade | Engine (untouched) | Content (`categoryIds`) | Cruces are PURE CONTENT; the existing 2 call-sites already cascade to all `categoryIds`. |
| Quorum confirmation (INT-04) | Content validation metadata | — | `validation.passes[]` already written; closeout verifies, not re-runs. |

## Standard Stack

No new packages. Zero-deps, browser-native, hand-authored JSON (per CLAUDE.md). Node's built-in `node --test` is the runner.

**Test command (from MEMORY.md):**
```bash
node --test tests/*.test.js
VAL_07_STRICT=1 node --test tests/*.test.js
node scripts/run-validation-271.mjs
```
NOTE (MEMORY.md `test_command_node_glob`): bare paths fail on Node 22.20 — always `node --test tests/*.test.js`.

## Count Sync Touchpoints (INT-02 — THE core of this phase)

There are **THREE hardcoded count arrays + ONE derived total + ONE coherence-guard formula**, spread across 2 files. None uses readdir auto-discovery — every array is hardcoded (PILOT-05 keeps shape bifurcation explicit). The 4 new categories are ABSENT from all of them.

### Current slot counts on disk (verified via `.exercises.length`)

| Category | On disk | In arrays (expected) | Status |
|----------|---------|----------------------|--------|
| dimostrativi | **8** | absent | ADD (order 11) |
| possessivi | **7** | absent | ADD (order 12) |
| modali | **6** | absent | ADD (order 13) |
| riflessivi | **7** | absent | ADD (order 14) |
| genero-numero | **13** | 12 | **FIX 12→13 (pre-existing red)** |
| preposiciones | 50 | run-validation:49 / exercise-types:50 | pre-existing skew — see note |
| presente-regolare | 12 | dynamic (12) | OK |
| all others | match | match | OK |

New-four total = 8 + 7 + 6 + 7 = **28 new slots**.

### Touchpoint 1 — `tests/exercise-types.test.js` → `CATEGORIES_WITH_EXPLANATIONS`

- **Array declared:** lines **1273–1287**. Dynamic helper `slotCountOf` at **lines 1270–1271**.
- Presente-regolare precedent to CLONE (line 1285):
  ```js
  { file: 'content/exercises/presente-regolare.json', expected: slotCountOf('content/exercises/presente-regolare.json') },
  ```
- **Consumed by TWO loops:**
  - Line **1304** — "Categorías con explanation coverage" (asserts `data.exercises.length === expected`, plus ASCII/plain-text/R1 scans). **This is the smoke/coverage scan** — a new file NOT in this array is NEVER scanned for explanations/ASCII/markdown. (This is what §SC-4 calls "the smoke paramétrico + 4 entradas explícitas".)
  - Line **1429** — `VAL_07_STRICT` gate (asserts all exercises `validation.status === "validated"`).
- **Current pre-existing failure:** line 1275 `genero-numero.json expected: 12` fails against 13 on disk (exercise-types.test.js:1311). **Fix to 13.**
- **`preposiciones` here is `50`** (line 1274) — matches disk (50). Do NOT touch.
- **TARGET:** add 4 dynamic entries; fix genero-numero to 12→13.

### Touchpoint 2 — `scripts/run-validation-271.mjs` → `CATEGORIES` + `TOTAL_EXPECTED` + baseline-guard

- **Array declared:** lines **173–184**. Dynamic helper `slotCountOf` at **lines 170–171**.
- Presente-regolare precedent (line 180):
  ```js
  { slug: 'presente-regolare', file: 'content/exercises/presente-regolare.json', expected: slotCountOf('content/exercises/presente-regolare.json') },
  ```
- **`TOTAL_EXPECTED`** — line **188**: `CATEGORIES.reduce((s, c) => s + c.expected, 0)` (self-summing; never hardcode).
- **⚠️ BASELINE-GUARD (the easiest to forget — CONTEXT-flagged):** lines **193–203**:
  ```js
  const PRESENTE_REGOLARE_SLOTS = slotCountOf('content/exercises/presente-regolare.json');
  const TOTAL_EXPECTED_BASELINE = 183 + PRESENTE_REGOLARE_SLOTS; // hoy 183 + 12 = 195
  if (TOTAL_EXPECTED !== TOTAL_EXPECTED_BASELINE) { console.error(...); process.exit(1); }
  ```
  This guard hard-codes `183 +` and ONLY knows about presente-regolare. Adding 4 categories means **this formula ITSELF must change** or the script throws "Incoherencia de conteo". Two honest options:
  - (a) Extend literal: `TOTAL_EXPECTED_BASELINE = 195 + slotCountOf(dimostrativi) + slotCountOf(possessivi) + slotCountOf(modali) + slotCountOf(riflessivi)` — BUT `195` embeds `genero-numero=12`; after fixing genero-numero to 13 the base literal shifts by +1 (183→184). Be precise: base of the 9 fixed legacy = 183 with genero-numero at 12; with genero-numero at 13 it becomes 184.
  - (b) **Reframe (recommended):** derive the baseline entirely from the array itself, e.g. sum `slotCountOf(c.file)` across ALL `CATEGORIES` and compare to `TOTAL_EXPECTED`. This makes the guard immune to future adds and removes the magic `183`. (Discretion — either is acceptable per success criteria "la fórmula se extiende".)
- **`CATEGORIES` loop consumer:** line **251** `for (const { slug, file, expected } of CATEGORIES)`. New cats absent here = never counted → reporter under-reports.
- **Pre-existing reporter FAIL confirmed:** running the script today shows `genero-numero | 13 ≠ esperado 12` and `VAL-06 197/195 FAIL`. The 4 new categories are NOT in the reporter at all yet.
- **`preposiciones` here is `49`** (line 174) vs 50 on disk. This is a KNOWN pre-existing skew (v1.7 SUMMARY noted "genero-numero, preposiciones" both as pre-existing discrepancies). **Decision point for the plan:** SC-5 says "suite verde estricta over 14 categories" — the *test suite* (`node --test`) uses exercise-types.test.js (preposiciones=50, correct). The run-validation *script* is a separate reporter gate. If the plan wants the reporter green too, preposiciones must also go 49→50 here. **Flag for planner:** decide whether SC-5 "suite" includes the run-validation reporter or only `node --test`. Conservative reading: fix genero-numero everywhere (required for `node --test` green) and, to make the reporter honest, also fix preposiciones 49→50 in run-validation. `[ASSUMED]` that the author wants the reporter green too — confirm in discuss/plan.
- **TARGET:** add 4 dynamic entries; fix genero-numero 12→13; extend/reframe baseline-guard; (recommended) fix preposiciones 49→50.

### Touchpoint 3 — `tests/fixtures/slot-variants-integration.test.js` → `REAL_CATEGORIES`

- **Array declared:** lines **168–179**. Dynamic entry precedent (line 178):
  ```js
  { slug: 'presente-regolare', expected: readJson('content/exercises/presente-regolare.json').exercises.length }
  ```
- **Consumers:** line **181** (validateContent accepts file + count assertion `expected`), line **207** (bundle-all-together validation with unique ids).
- **Current genero-numero here:** line 174 `{ slug: 'genero-numero', expected: 12 }` — must go 12→13. (This test currently passes because the count assertion is only hit in the `${slug}: el conteo` subtest at line 197 — verify it does not currently fail; the visible red is exercise-types.test.js. But if genero-numero is fixed only in one array, THIS array will then go red. Fix ALL THREE in lockstep.)
- **TARGET:** add 4 entries (use `readJson(...).exercises.length`, this file's helper); fix genero-numero 12→13.

### Lockstep summary table

| File | Array | Line | Add 4 new? | genero-numero fix | Other |
|------|-------|------|-----------|-------------------|-------|
| `tests/exercise-types.test.js` | `CATEGORIES_WITH_EXPLANATIONS` | 1273–1287 | YES (dynamic) | 12→13 (line 1275) | preposiciones already 50 ✓ |
| `scripts/run-validation-271.mjs` | `CATEGORIES` + `TOTAL_EXPECTED` + baseline-guard | 173–203 | YES (dynamic) | 12→13 (line 178) | baseline formula (193–203) + preposiciones 49→50 (line 174) `[ASSUMED]` |
| `tests/fixtures/slot-variants-integration.test.js` | `REAL_CATEGORIES` | 168–179 | YES (dynamic) | 12→13 (line 174) | — |

## Architecture Patterns

### PROV-01 insertion pattern (schema-validator)

**What:** Add an optional category-level `origen` enum check inside the existing category loop.
**Where:** `src/data/schema-validator.js`, inside `for (const cat of categories)` at **lines 78–90** (currently checks `id` slug, uniqueness, `name`).
**Pattern to clone:** `validateValidationShape` (lines 608–654) — the canonical optional-field-with-enum validator already in this file.

```js
// Source: src/data/schema-validator.js — mirror of validateValidationShape enum check (lines 617–623)
// Inside the `for (const cat of categories)` loop, after the name check (~line 88):
const VALID_ORIGEN = ['ia-quorum', 'apuntes-profesora'];
if (cat.origen !== undefined) {                          // absence = accepted (retrocompat, PROV-01)
  if (!VALID_ORIGEN.includes(cat.origen)) {
    push('categories.json', cat.id,
      `"origen" inválido: ${JSON.stringify(cat.origen)} (esperado: ia-quorum|apuntes-profesora)`);
  }
}
```
- `absence = accepted` is guaranteed: the loop only reads fields it explicitly names; unknown fields are ignored. The 10 legacy cats without `origen` keep validating (already true — they validate today).
- Enum check catches typos (e.g. `"ia_quorum"`, `"quorum"`).
- Mensajes en español (FOUND-04).

### PROV-02 stamp pattern (categories.json)

**What:** Add `"origen": "ia-quorum"` to exactly the 4 new entries.
**Where:** `content/categories.json` lines 13–16.
```json
{ "id": "dimostrativi", "name": "Dimostrativi (questo/quello)", "order": 11, "origen": "ia-quorum" },
{ "id": "possessivi",   "name": "Possessivi (il mio/la tua)",  "order": 12, "origen": "ia-quorum" },
{ "id": "modali",       "name": "Verbi modali (potere/volere/dovere)", "order": 13, "origen": "ia-quorum" },
{ "id": "riflessivi",   "name": "Verbi riflessivi (mi chiamo/si alza)", "order": 14, "origen": "ia-quorum" }
```
Leave lines 3–12 (legacy) exactly as-is (no `origen`).

### INT-03 cruces (already exist — verify only)

Verified cross-category exercises on disk:
| Cruce | Exercise id | categoryIds |
|-------|-------------|-------------|
| dimostrativi↔articoli | `dimostrativi-300` | `["dimostrativi","articoli"]` |
| possessivi↔articoli | `possessivi-300` | `["possessivi","articoli"]` |
| possessivi↔genero-numero | `possessivi-301` | `["possessivi","genero-numero"]` |
| riflessivi↔presente-regolare | `riflessivi-300` | `["riflessivi","presente-regolare"]` |
| riflessivi↔essere | `riflessivi-301` | `["riflessivi","essere"]` |
| modali↔presente-regolare | `modali-300` | `["modali","presente-regolare"]` |

All are pure content (`categoryIds` of 2), authored as normal slot+variants. The engine cascades via the existing 2 call-sites — no plumbing needed.

### D-54 two-call-site invariant (must remain 2)

- Call-sites verified: `src/screens/app.js:1642` (decisión final) and `src/screens/app.js:1969` (primer fallo de match). Grep pattern: `applyImmediateFailure(this.state`.
- **Guarded by 3 test files** (each asserts exactly 2 matches of `/applyImmediateFailure\(this\.state/g`):
  - `tests/exercise-types.test.js:785` → assertion at **:791** `assert.equal(matches.length, 2, ...)`
  - `tests/screen-canciones.test.js:587`
  - `tests/screen-home-editorial.test.js:41`
- **Phase gate:** `git diff src/screens/app.js src/domain/progress.js` MUST be empty at end of phase.

### Anti-Patterns to Avoid
- **Renaming the field to `source`:** ARCHITECTURE.md says `source`, but the LOCKED name (REQUIREMENTS/ROADMAP) is `origen`. Use `origen`.
- **Stamping legacy categories with any `origen` value:** dishonest (mixed provenance); leave absent.
- **Hardcoding new counts as magic numbers:** violates D-31-06; use `slotCountOf`/`.exercises.length`.
- **Fixing genero-numero in only one array:** the other arrays flip red. Fix all three in one lockstep pass.
- **Touching the engine to "read" `origen`:** it's display/metadata only; the sampler and cascade never read it.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Optional enum field validation | New validator subsystem | Clone `validateValidationShape` enum pattern (schema-validator.js:617–623) | Established idiom in this exact file; `absence = accepted` already proven backward-compat. |
| Dynamic slot count | Manual integer per category | `slotCountOf(file)` (already defined in both consuming files) | D-31-06 honesty; count follows content automatically. |
| Cross-cat cascade wiring | New call-site / new engine path | Existing `categoryIds` + 2 call-sites | Engine already cascades to all `categoryIds`; cruces are pure content. |
| Quorum re-run at closeout | Re-author/re-validate 28 exercises | Verify `validation.status === "validated"` (already true) | All 28 already validated ≥2 `by`; INT-04 magnets already have DeepSeek passes. |

## Runtime State Inventory

> This is a metadata + test-array phase, not a rename/migration. Migration (`11→12`) already shipped in Phase 35. Included for completeness since counts touch stored fixtures.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | localStorage state — already at `schemaVersion 12` (Phase 35). `origen` is category metadata, NOT persisted per-user state. | None — `origen` lives in content JSON, never written to localStorage. |
| Live service config | None (local static app, no external services). | None. |
| OS-registered state | None. | None. |
| Secrets/env vars | `VAL_07_STRICT=1` is a TEST env flag (opt-in strict gate), not a secret. Quorum API keys in `.env` used only if re-running validation (not needed — content already validated). | None. |
| Build artifacts | None (no build step; zero-deps). | None. |

**Nothing found requiring migration:** verified — Phase 35 handled `RESET_PREFIXES_V12 = ['dimostrativi','possessivi','modali','riflessivi']` (storage.js:1168) and `CURRENT_SCHEMA_VERSION=12`. Phase 39 does NOT touch storage.js/backup.js.

## Common Pitfalls

### Pitfall 1: Forgetting the baseline-guard formula (THE easiest to forget)
**What goes wrong:** You update the 3 arrays but leave `run-validation-271.mjs:195` at `183 + PRESENTE_REGOLARE_SLOTS`. The script throws "Incoherencia de conteo" because `TOTAL_EXPECTED` now includes 28 new slots + the genero-numero +1.
**Why it happens:** It's a guard, not an array entry — invisible when scanning for arrays.
**How to avoid:** Extend/reframe the formula (lines 193–203) in the SAME edit. Recommended: derive baseline from `slotCountOf` over all `CATEGORIES` (kills the magic `183`).
**Warning signs:** `process.exit(1)` with "Incoherencia de conteo" before any table prints.

### Pitfall 2: The pre-existing genero-numero 12→13 red (blocks SC-5)
**What goes wrong:** Suite stays red (`598/599`) even after adding the 4 new cats, because `genero-numero` (13 on disk) fails against expected 12 in all three arrays.
**Why it happens:** The 13th exercise (`genero-numero-nazionalita`) was added by quick task `260614-hxn` without syncing the arrays; every milestone since carried it as "1 fail preexistente ajeno".
**How to avoid:** Fix `genero-numero` 12→13 in ALL THREE arrays as part of this lockstep. It shares the exact files, so it is IN scope for "suite verde estricta".
**Warning signs:** `Esperaba 12 ejercicios en content/exercises/genero-numero.json, encontré 13` (exercise-types.test.js:1311).

### Pitfall 3: preposiciones 49 vs 50 skew (reporter-only)
**What goes wrong:** After fixing genero-numero, the run-validation reporter may still FAIL on preposiciones (49 expected vs 50 disk) even though `node --test` is green.
**Why it happens:** run-validation-271.mjs:174 says 49; exercise-types.test.js:1274 says 50 (disk truth). The two gates disagree on preposiciones historically.
**How to avoid:** If SC-5 "suite" includes the run-validation reporter, fix preposiciones 49→50 in run-validation too. `[ASSUMED]` — confirm scope in discuss/plan.
**Warning signs:** `node --test` green but `node scripts/run-validation-271.mjs` shows `preposiciones | 50 ≠ esperado 49`.

### Pitfall 4: Accidentally touching the engine
**What goes wrong:** Any edit to `src/screens/app.js` or `src/domain/progress.js` breaks the brownfield-puro invariant and can add a 3rd call-site.
**How to avoid:** `git diff src/screens/app.js src/domain/progress.js` must be empty. Run the 3 two-call-site guard tests.
**Warning signs:** `assert.equal(matches.length, 2)` fails (exercise-types.test.js:791).

### Pitfall 5: Mislabeling legacy provenance (PROV-02)
**What goes wrong:** Stamping legacy categories with `origen: "apuntes-profesora"` — but they're mixed (PDF + quorum-augmented in CONV-01). Lying.
**How to avoid:** Leave legacy `origen` ABSENT. Only the 4 born-pure new categories get `ia-quorum`.

## Code Examples

### INT-04 magnet verification (confirm-only at closeout)

All 28 new exercises are `validated` with ≥2 distinct `by`. The 3 doble-validez magnets each carry a DeepSeek pass:
```
dimostrativi-quello       validated [claude-opus-4-8 + claude-sonnet-4-6 + deepseek-reasoner]  ← magnet quei/quegli
possessivi-parentela      validated [claude-opus-4-8 + claude-sonnet-4-6 + deepseek-reasoner]  ← magnet parentesco
riflessivi-pp-concordanza validated [claude-opus-4-8 + deepseek-chat + deepseek-reasoner + claude-sonnet-4-6]  ← magnet essere-PP
```
INT-04 at closeout = assert these remain `validated` (e.g. via the `VAL_07_STRICT` gate once the 4 new files are in `CATEGORIES_WITH_EXPLANATIONS`). Do NOT re-author.

NOTE (MEMORY.md `executor_cannot_run_task_quorum`): if any fresh quorum pass is somehow needed, the gsd-executor subagent CANNOT spawn Task subagents — run the canonical Opus+Sonnet quorum at TOP-LEVEL after execute-phase. But for Phase 39 this should not be required (content already validated).

## State of the Art

| Old Approach (v1.7 Phase 31) | Current Approach (v1.9 Phase 39) | Impact |
|------------------------------|----------------------------------|--------|
| Add 1 category (presente-regolare) to 3 arrays + extend baseline `183 + PRESENTE_REGOLARE_SLOTS` | Add 4 categories to 3 arrays + extend baseline to cover 4 new + fix genero-numero pre-existing skew | 4× the entries; the baseline formula must grow or be reframed |
| Field: no provenance field existed | New OPTIONAL `origen` enum, retrocompatible | ~6 lines in validator; legacy absent |
| genero-numero carried as "1 fail preexistente ajeno" through v1.7/v1.8 | genero-numero 12→13 FIXED in this lockstep | Suite goes fully green (SC-5) |

**Deprecated/outdated:**
- ARCHITECTURE.md's `source` field name — superseded by `origen` in REQUIREMENTS/ROADMAP.
- The `183 +` magic literal in the baseline guard — should be reframed to a dynamic sum (recommended).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | SC-5 "suite verde estricta" includes the run-validation reporter (not just `node --test`), so preposiciones 49→50 should also be fixed in run-validation-271.mjs | Count Sync Touchpoint 2, Pitfall 3 | If only `node --test` counts, the preposiciones edit is unnecessary (harmless but out of minimal scope). If reporter DOES count, omitting it leaves the milestone gate red. Confirm in discuss/plan. |
| A2 | The genero-numero 12→13 fix is IN scope for Phase 39 (shares the lockstep files) rather than a separate quick task | Summary, Pitfall 2 | If treated as separate, SC-5 "suite verde" cannot be met within Phase 39. Low risk — it must be fixed somewhere and these are the same files. |
| A3 | INT-04 at closeout is verify-only (all 28 already validated) | INT-04 row, Code Examples | If the author wants a fresh top-level Opus+Sonnet re-seal, that's a top-level task (executor can't spawn Task quorum). |

## Open Questions

1. **Does SC-5's "suite verde estricta" include `node scripts/run-validation-271.mjs`?**
   - What we know: `node --test tests/*.test.js` and `VAL_07_STRICT=1` are the primary gates; the reporter is a separate script currently FAIL (197/195).
   - What's unclear: whether the reporter must go green (would require preposiciones 49→50 too).
   - Recommendation: fix genero-numero everywhere (required for `node --test`), and fix preposiciones 49→50 in run-validation to make the reporter honest. Confirm with author (A1).

2. **Add a dedicated schema-validator unit test for the `origen` enum?**
   - What we know: `validateValidationShape` has a test-style precedent; adding one is cheap and matches project rigor.
   - Recommendation: yes — add a small test (valid `ia-quorum`/`apuntes-profesora` accepted; typo rejected; absence accepted). Discretion.

## Environment Availability

> No external dependencies. Node's built-in `node --test` is the runner; no packages, no network. Quorum re-run is NOT needed (content validated). Skipping formal probe — all tooling is Node built-in.

## Sources

### Primary (HIGH confidence — verified in-tree this session)
- `src/data/schema-validator.js` — category loop (78–90), `validateValidationShape` enum pattern (608–654), `validateContent` structure
- `content/categories.json` — 14 categories, orders 11–14 for the new 4, no `origen` yet (lines 13–16)
- `content/exercises/*.json` — slot counts verified: dimostrativi=8, possessivi=7, modali=6, riflessivi=7, genero-numero=13, preposiciones=50, presente-regolare=12
- `tests/exercise-types.test.js` — `CATEGORIES_WITH_EXPLANATIONS` (1273–1287), coverage loop (1304), VAL_07_STRICT gate (1424–1442), 2-call-site test (785–791)
- `scripts/run-validation-271.mjs` — `CATEGORIES` (173–184), `TOTAL_EXPECTED` (188), baseline-guard (193–203), loop (251)
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES` (168–179)
- `tests/screen-canciones.test.js:587`, `tests/screen-home-editorial.test.js:41` — 2-call-site guards
- `src/screens/app.js:1642, :1969` — the exactly-2 `applyImmediateFailure(this.state` call-sites
- `src/data/content-loader.js:117` — boot iterates `categories.json` ids (new cats already load)
- `src/data/storage.js:35,1168` — `CURRENT_SCHEMA_VERSION=12`, `RESET_PREFIXES_V12` (Phase 35, out of scope here)
- Live test run: `598/599` (`node --test`), reporter FAIL `197/195` + `genero-numero 13≠12` — confirms pre-existing red
- Validation status probe: all 28 new exercises `validated` ≥2 `by`; 3 magnets have DeepSeek passes

### Secondary (HIGH — planning docs)
- `.planning/REQUIREMENTS.md` — PROV-01/02, INT-01..04, line 88 legacy-absent decision, line 132 Phase 39 summary
- `.planning/ROADMAP.md` — Phase 39 goal + 5 SC (lines 219–230), Phase 31 mirror note
- `.planning/research/PITFALLS.md` — Pitfalls 11–15 (count arrays, D-54, migration, smoke, provenance honesty)
- `.planning/research/ARCHITECTURE.md` — count-sync touchpoints, Pattern 3 (append), Pattern 5 (cruces D-54); NOTE `source`→`origen` supersession

### Project instructions
- `CLAUDE.md` — static web, zero-deps, hand-authored JSON, no build
- `MEMORY.md` — test command (`node --test tests/*.test.js`), executor cannot spawn Task quorum, quorum skills

## Project Constraints (from CLAUDE.md)
- Tech stack: static web (HTML + CSS + JS), no server, no build, no `npm install`.
- Persistence: `localStorage` + JSON export/import. No DB, no backend.
- Content: hand-edited JSON files; no editing UI.
- Interface language: Spanish (validator messages, explanations).
- Pin exact CDN versions; no floating versions (not relevant to this phase — no new deps).
- GSD workflow: edits must go through a GSD command.

## Metadata

**Confidence breakdown:**
- PROV-01/02 (schema + stamp): HIGH — exact insertion point + clone pattern verified in-tree; 4 new cats already registered.
- INT-02 (count sync): HIGH — all 3 arrays + baseline located file:line, current/target counts verified on disk; genero-numero red reproduced live.
- INT-03 (cruces + D-54): HIGH — cruces verified on disk; 2 call-sites verified + 3 guard tests located.
- INT-04 (quorum): HIGH — all 28 exercises confirmed `validated` ≥2 `by`; magnets have DeepSeek.
- Scope of "suite verde" (reporter vs node --test): MEDIUM — flagged as A1/Open Q1 for author confirmation.

**Research date:** 2026-07-01
**Valid until:** 2026-07-31 (stable; content frozen, engine untouched — only risk is a new quick task changing a count array before the phase runs)
