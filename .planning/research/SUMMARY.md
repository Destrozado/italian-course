# Project Research Summary

**Project:** Italian Course — Ejercicios A1/A2 (v1.9)
**Domain:** Brownfield pure-content authoring — 4 new Italian grammar categories + PROV-01 provenance marker
**Researched:** 2026-07-01
**Confidence:** HIGH

## Executive Summary

Milestone v1.9 is **brownfield pure content**: 4 new grammar categories (Dimostrativi, Possessivi, Verbi modali, Verbi riflessivi) authored from scratch via the existing cross-vendor quorum, plus one optional data field (PROV-01) marking content provenance. The engine (cascada D-54, slot+variantes sampler, localStorage, migration chain) is NOT touched. Every mechanism needed — slot+variantes validation, category-agnostic quorum pipeline, selective-reset migration, count-sync lockstep — was established and exercised in v1.5–v1.7. The four new categories are the same class of change as `presente-regolare` (v1.7), differing only in Italian linguistic content.

The recommended approach is exact replication of the v1.7 pattern four times: one combined migration bump (`11→12`) with four reset prefixes, four new `content/exercises/<slug>.json` files born directly in slot+variantes (never legacy payload), four entries appended to `categories.json` (orders 11–14), then count-sync lockstep in a dedicated closing phase. PROV-01 requires approximately five lines added to the existing category validator loop (`schema-validator.js`) — optional field, backward-compatible, no migration, category-level granularity for the four new pure `ia-quorum` categories. Legacy categories carry mixed provenance and must NOT be labeled at category level; that granularity decision is explicitly open for discuss/plan.

The primary risks in v1.9 are **content quality**, not engineering. Three slot families are confirmed quorum-bug magnets requiring a dedicated extra DeepSeek pass: (1) Dimostrativi `quello` phonetic-trigger split (`quei` vs `quegli`) mirrors the articoli lo/gli trap; (2) Possessivi family-member article exception with its plural/loro/alteration carve-outs; (3) Riflessivi passato-prossimo essere-agreement (-o/-a/-i/-e matrix). Two scope decisions must be settled at requirements time: modal passato-prossimo auxiliary borrowing (researchers recommend **DEFER** — A2 doble-validez swamp) and riflessivi passato-prossimo with essere-agreement (researchers recommend **INCLUDE** — direct `essere` dependency, high learner value, precedent in `presente-regolare-301`).

---

## Key Findings

### Recommended Stack

No new runtime dependencies. No tooling changes. No `npm install`. The full stack for v1.9 is the existing Alpine.js 3.15.12 + vanilla CSS + ES modules + localStorage + `npx serve`, exactly as shipped. PROV-01 is ~5 lines in the existing hand-written schema validator. The quorum pipeline (`validate-ai-pass.mjs`) auto-discovers new `content/exercises/*.json` files by `readdirSync` — no script edits needed. The `node --test tests/*.test.js` test command (path-glob required on Node 22.20) runs the unchanged suite; new categories add only parametric data rows, not new test code.

**Core technologies (all unchanged):**
- **Alpine.js 3.15.12 (CDN, pinned):** reactive UI — engine and screens untouched; new categories flow through existing render path
- **`app.css` (vanilla):** base/reset — Pico ELIMINATED in v1.8 (Phase 32, GAP-01); do NOT reintroduce
- **localStorage (`italianCourse.v1`):** progress persistence — `CURRENT_SCHEMA_VERSION` bumps 11->12 via standard migration chain
- **`schema-validator.js` (hand-written):** allowlist-permissive; accepts `origen` optional field today with zero code change; ~5-line addition recommended to catch typos in the enum
- **`validate-ai-pass.mjs`:** category-agnostic quorum — auto-discovers new files, no edits

**The only new code in v1.9:**
1. Four `content/exercises/<slug>.json` files
2. Four entries in `content/categories.json` (append, orders 11-14, optional `origen: "ia-quorum"`)
3. `migrate11to12` / `hydrateV12` in `storage.js` (RESET_PREFIXES_V12 = 4 slugs) + `CURRENT_SCHEMA_VERSION = 12` mirrored in `backup.js`
4. +4 rows in three count arrays + `TOTAL_EXPECTED_BASELINE` update
5. PROV-01: ~5 lines optional-enum check in `validateContent` category loop

### Expected Features (Rule Inventory)

The "features" for v1.9 are grammar rule slots. Research identifies ~13 table-stakes slots across the four categories, ~7 differentiator slots, and a clear set of anti-features to exclude.

**Must have (table stakes — P1):**
- **DIMOSTRATIVI:** `questo/questa/questi/queste` agreement; `quest'` elision; `quello` article-like forms (`quel/quello/quell'/quei/quegli/quelle`) + 1 justified `match` slot; ES 3-way->IT 2-way collapse (explicit `codesto` out-of-scope note required)
- **POSSESSIVI:** form agreement (`mio/mia/miei/mie x tuo/suo`) with the possessed noun; definite article required (`il mio libro`, contrast with Spanish `mi libro`); family-member singular drops article (`mia madre`); article returns with plural/alteration (`le mie sorelle`, `la mia mamma`)
- **VERBI MODALI:** present of `potere/volere/dovere` (irregular); modal + infinitive construction (`posso andare`)
- **VERBI RIFLESSIVI:** reflexive present (`mi chiamo`, `si alza`, `ci laviamo`); reflexive pronoun placement before conjugated verb (word-buttons ideal)

**Should have (differentiators — P2, same milestone if time):**
- Neutral pronoun `cio`; questo/quello as pronouns (DIMOSTRATIVI)
- `suo` ambiguity (his/her/its); `loro` invariable + always keeps article (POSSESSIVI)
- **Riflessivi passato prossimo with essere + agreement** (`mi sono svegliato/a`, `ci siamo alzati/e`) — researchers recommend INCLUDE; direct `essere` dependency; precedent in `presente-regolare-301`

**Defer (v2+ / separate milestone — P3):**
- Modal passato-prossimo auxiliary borrowing (`ho dovuto lavorare` vs `sono dovuto andare`) — researchers recommend DEFER; A2 doble-validez swamp (both auxiliaries colloquially acceptable); belongs to PASSPROX-01 milestone
- Reciprocal reflexives, clitic+modal placement, `codesto`, `sapere` as 4th modal — all explicitly out of A1/A2 scope

**Exercise-type decisions (from DESIGN RULE D-04):**
- `match` JUSTIFIED for Dimostrativi `quello`-forms (phonetic trigger, not root-derivable — same as `articoli-049` precedent)
- `match` NOT justified for modal conjugation, reflexive pronoun-to-person, core possessive agreement (all root-derivable)
- Possessivi family-member article vs no-article `match` is borderline — flagged for author judgment in plan

### Architecture Approach

The architecture is a strict content-only extension of the existing slot+variantes model. The engine (cascada D-54 with exactly 2 `applyImmediateFailure` call-sites at `app.js:1642` and `app.js:1969`, sampler, `normalizeExerciseToSlot`) handles N categories generically; adding categories 11-14 is pure registration + JSON authoring. The invariant for the entire milestone: zero diff in `src/screens/app.js` and `src/domain/progress.js`.

**Touch-points (complete list, verified against repo):**
1. **`content/categories.json`** — append 4 entries (array order = display order; `order` field is documentary only, NOT sorted by content-loader)
2. **`content/exercises/<slug>.json`** x 4 — born in slot+variantes (`variants: [>=2]`), never legacy `payload`; IDs prefixed by slug for reset-predicate matching
3. **`src/data/storage.js`** — `migrate11to12` + `hydrateV12` + `RESET_PREFIXES_V12` (4 slugs) + `CURRENT_SCHEMA_VERSION = 12`
4. **`src/data/backup.js`** — mirror `CURRENT_SCHEMA_VERSION = 12`; add v12 round-trip + reject `>12`
5. **`src/data/schema-validator.js`** — ~5-line optional `origen` enum check in category loop (PROV-01)
6. **Three count arrays + TOTAL_EXPECTED_BASELINE:**
   - `tests/exercise-types.test.js` `CATEGORIES_WITH_EXPLANATIONS` (+4 entries, dynamic `slotCountOf`)
   - `tests/fixtures/slot-variants-integration.test.js` `REAL_CATEGORIES` (+4 entries)
   - `scripts/run-validation-271.mjs` `CATEGORIES` (+4 entries) + `TOTAL_EXPECTED_BASELINE` formula update
7. **Smoke (`tests/domain.test.js` `loadAllExerciseFiles`)** — readdir-based, auto-discovers new files, zero code change needed
8. **Multi-cat cruces** (content-only): `riflessivi<->essere`, `riflessivi<->presente-regolare`, `possessivi<->articoli`, `possessivi<->genero-numero`, `dimostrativi<->articoli`; D-54 cascade stays at 2 call-sites

**PROV-01 data-flow:** metadata-only; no runtime consumer reads `origen`; not stored in localStorage; no migration required. The sole validator addition guards against typos at boot.

**Legacy provenance granularity decision (OPEN):** The 10 existing categories are genuinely MIXED provenance (PDF-transcribed content + quorum-authored variants from CONV-01). Stamping them with a single category-level `origen` is dishonest. Options ranked: slot-level > variant-level > leave absent > (category-level ONLY for the four born-pure new categories). Decide in discuss/plan; absence is more honest than a wrong label.

### Critical Pitfalls

**Three quorum-bug magnets (each needs a dedicated extra DeepSeek pass):**

1. **Dimostrativi `quello` phonetic split (`quei` vs `quegli`)** — mirrors the articoli lo/gli trap; authors who know `il`->`i` write `quei studenti` when `quegli studenti` is correct. Derive each noun's phonetic class explicitly before writing the key; treat every `quello`-form variant like an `articoli-049` slot. Budget the extra quorum round.

2. **Possessivi family-member article exception over/under-applied** — the A1/A2 rule is NOT flat "family = no article"; plural (`le mie sorelle`), `loro` (`il loro padre`), and diminutive/altered nouns (`la mia mamma`, `il mio fratellino`) ALL restore the article. Slot the exception with variants that deliberately span both sides; verify each against the four carve-outs before quorum.

3. **Riflessivi passato-prossimo essere-agreement** — all reflexives take `essere`; the participle agrees with the subject in gender AND number (`-o/-a/-i/-e`). Authors calco `avere` (`mi ho svegliato` — wrong) or under-populate the agreement matrix. Model after `presente-regolare-301`: dedicated concordancia slot, all four endings as contrasting variants, subject-gender cue in every prompt.

**Two integration lockstep pitfalls:**

4. **Three count arrays + TOTAL_EXPECTED_BASELINE out of sync** — three independent hardcoded arrays live in different files; the guard formula in `run-validation-271.mjs` (`183 + PRESENTE_REGOLARE_SLOTS`) must itself be updated to include the four new categories' slot counts — the easiest item to miss.

5. **Migration `RESET_PREFIXES_V12` missing a slug / prefix collision** — all four category slugs must be added exactly; omitting one means that category may boot as `hecha`. `startsWith` predicate has no collision today but must be verified by script.

**Two scope/content pitfalls:**

6. **Modal passato-prossimo scope creep** — authoring `ho dovuto / sono dovuto` variants opens a doble-validez swamp. Hard scope boundary: Verbi modali = present indicative + infinitive ONLY.

7. **PROV-01 `origen` required instead of optional** — making it required breaks backward-compat (existing 10 categories have no such field). Must mirror the `validateValidationShape` "absence = accepted" contract.

---

## Implications for Roadmap

Based on combined research, the following phase structure starting from Phase 35 is recommended. Dependency ordering (migration -> determinantes -> modals -> riflessivi -> lockstep) is an invariant; granularity within that order is the roadmapper's decision.

### Phase 35: Migration 11->12 (foundation)
**Rationale:** Migration ALWAYS goes first in this project (v1.5/v1.6/v1.7 precedent). All four categories are born under this schema; the reset predicate must exist before any category content is authored.
**Delivers:** `migrate11to12` + `hydrateV12` + `RESET_PREFIXES_V12` (4 slugs) in `storage.js`; `CURRENT_SCHEMA_VERSION = 12` mirrored in `backup.js`; backup round-trip v12; reject `>12`; full migration chain tests.
**Avoids:** Missing reset prefix (Pitfall 5), prefix collision, backup mirror mismatch.

### Phase 36: Dimostrativi + Possessivi (determinantes)
**Rationale:** Both depend on already-shipped `articoli` and `genero-numero` (v1.5). Doing them together respects their shared dependency family; `quello`/`articoli` cross-exercise is the headline of this phase.
**Delivers:** `content/exercises/dimostrativi.json` + `content/exercises/possessivi.json`; entries in `categories.json` (orders 11, 12); multi-cat cruces `dimostrativi<->articoli`, `possessivi<->articoli`, `possessivi<->genero-numero`.
**Addresses:** questo/quest'/quello forms (P1); ES 3-way->2-way collapse; possessive agreement + article rule + family exception (all 4 carve-outs); suo ambiguity + loro invariable (P2 if time).
**Avoids:** Pitfalls 1-4 (quello phonetic split, ES calco, family exception, thing-agreement), Pitfall 8 (R1 trigger leak), Pitfall 9 (R7 gloss missing).
**Research flag:** quorum-intensive — budget two extra DeepSeek passes (quello slots, possessivi exception slots).

### Phase 37: Verbi modali
**Rationale:** No dependency on the other new categories. Sequencing is flexible; placing here keeps verbals together with Phase 38.
**Delivers:** `content/exercises/modali.json`; entry in `categories.json` (order 13); present conjugation + modal+infinitive slots (P1).
**Addresses:** Present of `potere/volere/dovere`; modal + infinitive.
**Avoids:** Pitfall 5 (modal PP scope creep — hard scope gate: NO `ho dovuto / sono dovuto` variants, OOS note in category notes).
**Research flag:** scope decision must be confirmed before authoring — modal passato-prossimo is DEFERRED (P3).

### Phase 38: Verbi riflessivi
**Rationale:** Last of the four new categories; depends most heavily on already-shipped `presente-regolare` (v1.7) and `essere`. Sequencing last lets this phase confidently inherit from prior authoring phases.
**Delivers:** `content/exercises/riflessivi.json`; entry in `categories.json` (order 14); reflexive present + pronoun placement (P1); riflessivi passato-prossimo with essere+agreement (P2, recommended INCLUDE); multi-cat cruces `riflessivi<->essere`, `riflessivi<->presente-regolare`.
**Avoids:** Pitfall 6 (riflessivi essere-agreement — dedicated concordancia slot, -o/-a/-i/-e matrix, subject-gender cues, no `avere` auxiliary); Pitfall 12 (D-54 invariant — cruces are content-only `categoryIds`, zero engine edits).
**Research flag:** quorum-intensive — budget one extra DeepSeek pass on essere-agreement slots. Confirm riflessivi PP scope IN at requirements time.

### Phase 39: PROV-01 + Integration Lockstep (milestone close)
**Rationale:** PROV-01 is transversal metadata; lockstep touches all three count arrays simultaneously. Mirrors Phase 31 of v1.7 exactly; ensures full suite green with `VAL_07_STRICT=1` as a single gate.
**Delivers:** `origen: "ia-quorum"` on the four new categories; ~5-line optional-enum check in `schema-validator.js`; all three count arrays updated (+4 each, dynamic `slotCountOf`); `TOTAL_EXPECTED_BASELINE` formula updated; 4 smoke entries; full suite green.
**Avoids:** Pitfall 11 (count arrays out of sync), Pitfall 14 (smoke pickup / order collision), Pitfall 15 (mislabeling mixed-legacy — left ABSENT), Pitfall 16 (`origen` must be OPTIONAL).

### Phase Ordering Rationale

- **Migration first** is a project-invariant established in v1.5/v1.6/v1.7.
- **Determinantes (36) before verbals (37/38)** because `articoli` and `genero-numero` are the most direct dependencies, both stable since v1.5.
- **Riflessivi last** of the four altas because it is most linguistically layered and profits from authoring discipline accumulated in Phases 36-37.
- **PROV-01 + lockstep last** because PROV-01 is low-risk transversal metadata and count-sync is cheapest when all four JSON files are final.
- **Alternative granularity:** roadmapper may merge Phases 36+37 or 37+38 if fewer phases are preferred. The dependency ordering (35->36->38->39, with 37 flexible) is the invariant.

### Research Flags

Phases needing extra quorum rounds or scope-gates:

- **Phase 36 (Dimostrativi):** `quello` phonetic-split slots are confirmed bug magnets — require dedicated DeepSeek pass; design distance anchors for all demonstrative fill-ins before authoring.
- **Phase 36 (Possessivi):** family-member exception slots are confirmed bug magnets — require extra DeepSeek pass; verify all four carve-outs covered by contrasting variants.
- **Phase 38 (Riflessivi):** essere-agreement slots are confirmed bug magnets — require extra DeepSeek pass; design -o/-a/-i/-e concordancia slot up front.
- **Phase 39 (Lockstep):** `TOTAL_EXPECTED_BASELINE` update in `run-validation-271.mjs` is the easiest item to miss.

Phases with well-documented standard patterns (no extra research needed):

- **Phase 35 (Migration):** exact mirror of `migrate10to11`/`hydrateV11`; swap in four new slug prefixes.
- **Phase 37 (Modali):** lower bug density; primary risk is scope gate (modal PP deferred), not content quality.
- **Phase 39 (Lockstep):** exact mirror of Phase 31 (v1.7); mechanical but requires all four JSON files final.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All verified against live repo code: `CURRENT_SCHEMA_VERSION=11` in storage.js; validator permissiveness confirmed; auto-discovery in `validate-ai-pass.mjs` confirmed; Pico removal confirmed from Phase 32 |
| Features (rule inventory) | HIGH | Italian grammar rules verified against multiple authoritative A1/A2 sources + cross-checked against repo precedents (`articoli.json` lo/gli trigger, `presente-regolare.json` essere-agreement slot); design-type decisions grounded in DESIGN RULE D-04 |
| Architecture | HIGH | Touch-points verified against live repo: line numbers for count arrays, call-site count for D-54, `categoriesRaw` pass-through in content-loader, `categories.json` array-not-sorted behavior |
| Pitfalls | HIGH | Grounded in repo memory (cross-vendor caught 8 bugs in v1.2 articoli, MOV-01 concordanza trap, PROF-01/SOST-01 hibrido pattern, v1.7 lockstep precedents); quorum-magnet classifications from observed DeepSeek behavior on cognate slot families |

**Overall confidence:** HIGH

### Gaps to Address

- **PROV-01 legacy granularity (OPEN DECISION):** The 10 existing categories are genuinely mixed provenance (PDF-transcribed + quorum-augmented). Category-level labeling for them is dishonest; leaving them absent is more honest than a wrong label. Explicitly an open discuss/plan decision.

- **`origen` vs `source` field name:** STACK.md and ARCHITECTURE.md use `origen`; PROJECT.md uses both interchangeably. Low-stakes; recommend `origen` for consistency. Pick one and enforce it in the validator enum check.

- **Riflessivi passato-prossimo scope (CONFIRM AT REQUIREMENTS):** Research consensus is INCLUDE. If the author disagrees, Phase 38's slot count and quorum budget change non-trivially. Confirm before writing requirements.

- **Modal passato-prossimo scope (CONFIRM AT REQUIREMENTS):** Research consensus is DEFER. If included, doble-validez problem expands Phase 37 significantly. Confirm DEFER before writing requirements.

- **Possessivi family-member `match` slot (borderline call):** Flagged as "arguably justified" but MC is the safe default. If included, needs explicit DESIGN RULE alignment in the phase plan.

---

## Sources

### Primary (HIGH confidence — verified against live repo)
- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION=11`, migration chain, `RESET_PREFIXES_V11`, `migrate10to11`/`hydrateV11` pattern
- `src/data/backup.js` — `parseBackupFile` migration chain, `CURRENT_SCHEMA_VERSION` mirror, round-trip + reject `>current`
- `src/data/schema-validator.js` — allowlist-permissive on extra fields, `'origen' in cat` guard feasibility, `payload` XOR `variants`
- `src/data/content-loader.js` — `categoriesRaw.categories` pass-through without sort; `normalizeExerciseToSlot`
- `src/screens/app.js` — `categoriesForDisplay` (array-order, no sort); `applyImmediateFailure` at exactly 2 call-sites (lines 1642, 1969)
- `content/categories.json` — 10 entries, `{id, name, order}` shape, array = display order
- `content/exercises/articoli.json` — lo/gli phonetic-trigger precedent; `articoli-049/050` match template; R7 doble-validez patterns
- `content/exercises/presente-regolare.json` — slot+variantes shape reference; 0-match decision; essere-agreement slot (301); cruces 300-303 with avere/essere
- `tests/exercise-types.test.js` — `CATEGORIES_WITH_EXPLANATIONS`, `slotCountOf`, 2-call-site invariant test
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES` array
- `scripts/run-validation-271.mjs` — `CATEGORIES`, `TOTAL_EXPECTED`, `TOTAL_EXPECTED_BASELINE` guard
- `tests/domain.test.js` — `loadAllExerciseFiles` readdir auto-discovery
- `.planning/PROJECT.md` — Key Decisions D-54/D-04, v1.9 milestone goal, CONV-01/PROV-01 scope, lockstep precedents
- `.planning/milestones/v1.7-ROADMAP.md` — Phase 29/30/31 migration->authoring->lockstep pattern
- Memory: `exercise_authoring_rules.md` (R1-R7), `feedback_cross_vendor_catches_bugs.md`, `feedback_disputed_resolution.md`, `explanations_must_be_accented.md`, `gloss_es_desambiguacion_canon.md`, `pico_token_remap_required.md`

### Secondary (HIGH confidence — authoritative external sources for Italian grammar)
- [Lawless Italian — Demonstrative Adjectives](https://www.lawlessitalian.com/grammar/adjectives/demonstrative-adjectives/) — quello forms mirror definite article
- [Mango Languages — questo/quello](https://mangolanguages.com/resources/learn/grammar/italian/how-to-use-the-demonstratives-questo-this-and-quello-that-in-italian) — quel/quello/quei/quegli triggers verified
- [Prof Corsini — Family members and "my"](https://ilsitodiprofcorsini.wordpress.com/family-members-and-my-in-italian/) — singular unmodified drop; plural/alteration return
- [Polyglottist Academy — Possessive + Definite Article Rule](https://www.polyglottistlanguageacademy.com/language-culture-travelling-blog/2025/6/22/how-to-use-italian-possessives-mio-tuo-suoand-the-definite-article-rule) — article-required, agreement with possessed, family exception, loro invariable
- [Elon.io — Modal Verbs Overview](https://elon.io/grammar/italian/verbs/modal-verbs/overview) — irregular present, modal+infinitive
- [Think in Italian — Modal PP](https://www.thinkinitalian.com/potere-volere-dovere-sapere-passato-prossimo) — auxiliary borrowed from following infinitive
- [OnlineItalianClub — Reflexive Verbs A1](https://onlineitalianclub.com/free-italian-exercises-and-resources/online-italian-course-beginner-level-a1/italian-grammar-reflexive-verbs/) — present conjugation, pronoun placement
- [Busuu — Reflexive verbs guide](https://www.busuu.com/en/italian/reflexive-verb) — all reflexives take essere, participle agreement

---
*Research completed: 2026-07-01*
*Ready for roadmap: yes*
