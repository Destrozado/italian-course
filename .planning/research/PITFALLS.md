# Pitfalls Research

**Domain:** Brownfield content authoring — adding 4 Italian A1/A2 grammar categories (Dimostrativi, Possessivi, Verbi modali, Verbi riflessivi) as slot+variantes via cross-vendor quorum (R1-R7), + PROV-01 provenance marker. Engine v1.4 untouched.
**Researched:** 2026-07-01
**Confidence:** HIGH (grounded in repo state: PROJECT.md Key Decisions/D-54, v1.6/v1.7 lockstep precedents, articoli.json quello/lo-gli mirror, exercise_authoring_rules R1-R7, schema-validator.js, count-array hardcodes verified in-tree)

This is NOT generic content-authoring advice. Every pitfall below is specific to (a) the four target categories' Italian linguistics, (b) the established R1-R7 quorum pipeline, (c) the exact integration lockstep points that v1.5/v1.6/v1.7 taught, or (d) PROV-01's legacy-labeling honesty problem.

---

## Critical Pitfalls

### Pitfall 1: Dimostrativi `quello` article-form agreement collapses the same phonetic trigger as articoli lo/gli — but authored blind (QUORUM MAGNET)

**What goes wrong:**
`quello` (lontano) inflects EXACTLY like the determinative article: `quel` (il/i cons), `quello`/`quegli` (s-impura, z, gn, ps, x, y, i+vocal), `quell'` (vowel sing), `quei` (il→plural), `quelle` (fem plural). The trap is IDENTICAL to `articoli` lo/gli split by phonetic trigger (see `articoli.json` articoli-049/050 match + the lo/gli/uno family). Authors who know `il`→`i` will write `quei studenti` (calco of the wrong `i studenti`) when it must be `quegli studenti` (because singular is `quello studente`). The `quei/quegli` split is the single highest-density wrong-key producer in this milestone.

**Why it happens:**
The author already shipped the lo/gli-equivalent logic once (articoli, Phase 19), so it feels "known" and gets authored fast without re-deriving each noun's phonetic class. But `quello` adds forms the article table doesn't (`quei` has no article analog beyond `i`; `quegli` mirrors `gli`). Fast authoring + familiarity = exactly where wrong keys slip in.

**How to avoid:**
- Treat every `quello`-form variant like an articoli lo/gli variant: run each noun through the phonetic table (R5 checklist item 4) BEFORE writing the key. `quello studente` / `quei ragazzi` / `quegli zii` / `quegli amici` / `quell'albero` / `quelle case`.
- Reuse the articoli.json match/mc patterns literally (articoli-049 is the template): the DESIGN RULE (D-04) says match ONLY if the pairing is not root-derivable — noun→demonstrative-form IS a phonetic-rule pairing (not root), so match is legitimate here, same as articoli-049/050.
- Budget an EXTRA quorum round for the `quello` slots specifically — DeepSeek is strict on exactly this class and will catch `quei`↔`quegli` misassignment that human-verify approves (precedent: v1.2 caught 8 articoli bugs human-verify passed, incl. phonetic-trigger leaks).

**Warning signs:**
`quei` before a vowel/s-impura/z noun; `quegli` before a plain-consonant noun; any `quello`-form variant that passed with only 2 Claude passes and no DeepSeek pass.

**Phase to address:** The Dimostrativi authoring+quorum phase. Flag `quello` slots as needing a dedicated validation pass.

---

### Pitfall 2: Dimostrativi ES 3-way → IT 2-way calco produces doble-validez / wrong-key (QUORUM MAGNET)

**What goes wrong:**
Spanish has THREE degrees (este/ese/aquel); Italian A1/A2 has TWO (`questo` vicino / `quello` lontano — `quello` absorbs both *ese* and *aquel*). `codesto` (the historical 3rd) is out of A1/A2 scope. Two failure modes: (1) an author includes `codesto` as a correct/distractor form (out of scope, and near-archaic → confuses); (2) a fill-in whose Spanish gloss says "ese/aquel" makes BOTH a `questo`-reading and a `quello`-reading defensible depending on imagined distance → doble-validez (R7 violation), the classic quorum-magnet.

**Why it happens:**
The hispanohablante author's native 3-way system leaks. A prompt like "___ libro (ese)" has no distance anchor, so `questo` and `quello` are both grammatically fine → R7 fail.

**How to avoid:**
- Explicitly document `codesto` as OUT of scope in the category notes (precedent: MOV-01 documented `correre` isolation; SOST-01/PROF-01 documented "no artificial variants"). Never author it as key or distractor.
- Add an explicit distance anchor to disambiguate (R7 fix pattern): "___ libro **qui sul tavolo**" forces `questo`; "___ libro **là in fondo**" forces `quello`. This is the SAME fix shape as R7's `Sono ___ Roma di nascita`.
- Put the ES gloss in the prompt per R7/canon — but ensure the gloss + the anchor land on ONE reading. A gloss of "(en español: ese)" WITHOUT an Italian anchor is a doble-validez trap, not a disambiguator.

**Warning signs:**
Any demonstrative fill-in with no spatial/deictic anchor; ES gloss containing "ese" or "aquel" but no `qui`/`qua`/`lì`/`là`/`quello lì` cue in the Italian.

**Phase to address:** Dimostrativi authoring phase (design the anchors up front, not at dispute-resolution time).

---

### Pitfall 3: Possessivi family-member article exception over/under-applied (QUORUM MAGNET)

**What goes wrong:**
Italian possessives normally take the article (`il mio libro`, `la tua casa`). The A1/A2 exception: SINGULAR, UNMODIFIED family members drop it (`mia madre`, `tuo padre`, `sua sorella`). But the exception has boundaries that produce wrong keys in both directions:
- Re-applies the article when the noun is PLURAL (`le mie sorelle`, not *mie sorelle*).
- Re-applies with `loro` (`il loro padre` — `loro` ALWAYS keeps the article).
- Re-applies with a diminutive/altered or modified noun (`la mia mamma`, `la mia sorella maggiore`, `il mio fratellino`).
Authors either drop the article everywhere ("possessive family = no article") or keep it everywhere. Both yield systematically wrong keys.

**Why it happens:**
The rule is memorized as a flat "family = no article" heuristic that ignores the plural/loro/modified carve-outs. The `mia madre` vs `la mia mamma` contrast (explicitly called out in the milestone context) is the canonical trap: `mamma` is affective/altered → article returns.

**How to avoid:**
- Slot the exception as its OWN rule slot with variants that DELIBERATELY span both sides: `mia madre` (drop) vs `la mia mamma` (keep) vs `le mie sorelle` (plural→keep) vs `il loro padre` (loro→keep). This is what makes the slot pedagogically real (R6: one point per exercise, but the SLOT teaches the boundary via contrasting variants).
- Verify each key against the four carve-outs before quorum (add to the R5-style pre-commit checklist for this category).
- Expect DeepSeek to catch `mie sorelle`-type drops (missing article on plural family). Budget the extra round.

**Warning signs:**
Any family-member possessive that is plural, uses `loro`, or uses an altered noun (`mamma`, `papà`, `fratellino`, `sorellina`) WITHOUT the article; any variant that drops the article on a modified family noun.

**Phase to address:** Possessivi authoring phase. The exception slot needs the extra quorum round.

---

### Pitfall 4: Possessivi concordance with the possessed thing, not the possessor (calco from English/confusion)

**What goes wrong:**
Italian possessives agree with the POSSESSED noun's gender/number, not the possessor's. `la sua macchina` = "his/her car" — `sua` is feminine because *macchina* is feminine, regardless of whether the owner is male. Authors (especially reasoning in Spanish/English) may gender the possessive to the owner (`suo` for a male owner + feminine noun) → wrong key. Also `suo/sua` collapses his AND her (no gender-of-owner marking), which surprises.

**Why it happens:**
English "his/her" marks the owner; the author's mental model carries owner-marking into Italian. The prompt's Spanish gloss ("su coche") hides the trap because Spanish also agrees with the thing but doesn't force the author to re-derive.

**How to avoid:**
- Author variants where owner gender and possessed gender DIFFER, to force the correct model: "Marco lava ___ macchina" → `la sua` (feminine, male owner). Explanation states the rule ("concuerda con la cosa poseída, no con el poseedor").
- Do NOT rely on the ES gloss to teach this — Spanish doesn't expose it. The Italian frame must carry the contrast.

**Warning signs:**
Every possessive variant has matching owner/possessed gender (trap never exercised); any key gendered to the subject rather than the object noun.

**Phase to address:** Possessivi authoring phase.

---

### Pitfall 5: Verbi modali passato-prossimo auxiliary borrowing — SCOPE CREEP into out-of-A1 territory

**What goes wrong:**
`potere/volere/dovere` in the passato prossimo "borrow" the auxiliary of the following infinitive (`sono dovuto andare` vs `ho dovuto mangiare`) — a genuinely hard A2+/B1 rule with real doble-validez (colloquial Italian often accepts `avere` everywhere: `ho dovuto andare` is widely used). If the milestone authors modal passato-prossimo variants, it (a) exceeds the stated A1 modal scope (`potere/volere/dovere` + infinitive, present tense: posso/voglio/devo + andare), and (b) opens a doble-validez swamp the quorum can't cleanly resolve (both auxiliaries defensible).

**Why it happens:**
"Completeness" instinct: having authored the present, the author wants passato prossimo too. But the milestone context explicitly scopes modals as present + infinitive; heavy tenses (passato prossimo dedicated, imperfetto, etc.) are a SEPARATE later milestone (PROJECT.md backlog: PASSPROX-01, TENSE-X1..X4).

**How to avoid:**
- HARD scope boundary: Verbi modali = present indicative + infinitive ONLY (`posso/puoi/può/possiamo/potete/possono` + inf; same for volere/dovere). Document the passato-prossimo auxiliary-borrowing rule as OUT of scope in category notes.
- If a modal + auxiliary contrast is wanted, defer it to the dedicated passato-prossimo milestone where the doble-validez can be handled with explicit context anchors.

**Warning signs:**
Any modal variant containing `ho/sono/hai/sei...` + past participle of a modal; any variant where both `ho dovuto` and `sono dovuto` complete the prompt validly.

**Phase to address:** Verbi modali authoring phase (scope-gate at design time, before writing variants).

---

### Pitfall 6: Verbi riflessivi passato-prossimo essere-agreement + Spanish/Italian reflexive mismatch (QUORUM MAGNET)

**What goes wrong:**
Two intertwined traps:
1. **essere-agreement in passato prossimo:** reflexives take `essere` and the participle agrees with the subject: `mi sono svegliato` (masc) / `mi sono svegliata` (fem) / `ci siamo svegliati` / `ci siamo svegliate`. Authors calco `avere` (`mi ho svegliato` — wrong) or forget gender/number agreement (`mi sono svegliato` for a feminine subject → wrong key). This is the EXACT trap MOV-01 handled for movement verbs (essere-vs-avere + concordancia) — same failure class, new category.
2. **ES↔IT reflexive mismatch:** some verbs are reflexive in one language but not the other. Italian `alzarsi` (reflexive) = Spanish "levantarse" (reflexive) — matches. Italian `chiamarsi` = "llamarse" matches, while verbs like `sposarsi`/"casarse", or non-reflexive-in-Spanish cases, can trip the author. A wrong assumption about whether the pronoun is required produces wrong keys or doble-validez.

**Why it happens:**
The author reasons from Spanish reflexive morphology, which mostly-but-not-always aligns; and the passato-prossimo agreement is a 4-way (-o/-a/-i/-e) matrix that's easy to under-populate (only masc-sing authored).

**How to avoid:**
- If passato prossimo of reflexives is IN scope, model it after MOV-01/Essere `stato/stata/stati/state`: a dedicated concordancia slot with all four endings as CONTRASTING variants, keys verified explicitly (v1.7 D-31-08 verified essere concordance -o/-a/-i/-e explicitly — reuse that discipline). The prompt must carry a gender/number cue for the subject so the key is unambiguous (else doble-validez between -o/-a).
- Verify each Italian reflexive against its Spanish counterpart in the R5 pre-commit pass; add ES gloss where the reflexive-ness differs.
- Keep A1 present (`mi chiamo / ti svegli / si alza`) separate from passato prossimo; if PP is heavy, consider deferring per the modal scope logic (Pitfall 5).
- Budget the extra quorum round — this is a MOV-01-class magnet (MOV-01 had disputes resolved by reformulation).

**Warning signs:**
`avere` auxiliary with a reflexive; `mi sono svegliato` for a feminine subject with no masc cue; a reflexive fill-in with no subject-gender anchor (doble-validez -o/-a); a verb assumed reflexive in Italian because it is in Spanish (or vice versa) without verification.

**Phase to address:** Verbi riflessivi authoring phase (design the concordancia slot + subject cues up front).

---

## Authoring-Process Pitfalls (pipeline-specific)

### Pitfall 7: Forcing artificial variants onto lexical/memorization slots

**What goes wrong:**
The slot+variantes model wants ≥2 intercambiable variants per slot to defeat word-memorization. But some content is lexical/memorization (e.g. a fixed possessive-family lemma set, or `ciò` as a neutral pronoun with essentially one form). Forcing 2+ synthetic variants onto a purely lexical point creates padded, low-quality exercises.

**Why it happens:**
Misreading "slot+variantes" as "every slot MUST have N variants." The v1.6 híbrido precedent (Professioni PROF-01, Sostantivi SOST-01) explicitly resolved this: rule-rich blocks get authored variants; lexical/contrast blocks stay SINGLE-variant and DOCUMENT "sin autoría de variantes."

**How to avoid:**
- Split each category into a RULE block (phonetic-form agreement, concordancia, exception boundaries → author real variants) and a LEXICAL block (fixed forms, `ciò`, memorized lemmas → single variant, documented). Reuse the híbrido pattern from PROF-01/SOST-01 verbatim.
- Document "SIN autoría de variantes" in notes for lexical slots so a future reviewer doesn't flag them as incomplete.

**Warning signs:** Two variants of a slot that differ only trivially (synonym swap) with no distinct pedagogical trigger; a variant authored just to hit a count.

**Phase to address:** Each category's authoring phase (block classification is a design-time decision, per the milestone's slot+variantes framing).

---

### Pitfall 8: Leaking the phonetic/grammatical trigger into the prompt (R1 violation)

**What goes wrong:**
Writing prompts like "___ studente (s impura → quello)" or "___ madre (parentesco, sin artículo)" — the rule/trigger is in the prompt, so the user reads instead of recalls. R1 is the #1 authoring rule and v1.2 caught trigger-leak bugs in articoli that human-verify passed.

**Why it happens:**
Author wants to "help" or annotate the cell being tested. For these four categories the temptation is acute: `quello`-forms, the family exception, and reflexive agreement all beg for a parenthetical hint.

**How to avoid:**
- Prompt = the sentence + the blank. Period (R1). The rule lives in `explanation` (shown only after failing) and `notes` (author-internal). Neutral `(masc)`/`(fem)` tags allowed ONLY when structurally needed to disambiguate (e.g. elided forms where both genders elide).
- The ES gloss `(en español: …)` is CANON R7 (author-approved) for disambiguating doble-validez — it is NOT a trigger leak. Do not confuse the two: a gloss gives the meaning; a leak gives the RULE. Gemini/DeepSeek will false-positive the gloss as a C5 leak — that flag is a known policy false-positive, keep the gloss.

**Warning signs:** Any prompt containing `§N`, `(regla`, `(s impura`, `(parentesco`, `-x→-y`, or the target form named in the prompt.

**Phase to address:** All four authoring phases (R1 is a per-batch pre-commit gate).

---

### Pitfall 9: Forgetting the ES gloss where two answers are defensible (R7)

**What goes wrong:**
A fill-in with 2+ correct answers ships without a disambiguating ES gloss/anchor → the engine marks a legitimate answer as wrong → unfair failure, cascade fires wrongly. The four categories have specific doble-validez zones: demonstrative distance (Pitfall 2), reflexive subject gender (Pitfall 6), modal-PP auxiliary (Pitfall 5).

**Why it happens:**
Author sees their intended answer and doesn't mentally test each distractor as R7 demands.

**How to avoid:**
- Run the R7 mental check on EVERY multi-choice/fill-in: does any other option validly complete the sentence with a different meaning? If yes → add context anchor or ES gloss to force one reading.
- Resolve disputes by REWRITE (add gloss/anchor so BOTH AIs land on correct), NEVER by override-shortcut. The author is oracle, but the fix must make the exercise unambiguous, not just silence the flag. (Precedent: disputed_resolution memory — calidad > tokens; both AIs must reach correcta.)

**Warning signs:** A disputed verdict "resolved" by editing only the `validation` block without touching the prompt; an ES gloss missing on a demonstrative/reflexive fill-in.

**Phase to address:** All four authoring phases + their quorum passes.

---

### Pitfall 10: Accent bugs in Spanish explanations flagged as REAL (fix accents, don't override)

**What goes wrong:**
Explanations must be correctly-accented Spanish (RAE canon EXPL-06/D-135): á/é/í/ó/ú, ñ. When the quorum (DeepSeek especially) flags a C4-accent issue on Spanish text missing tildes, it is a REAL bug, not a policy false-positive. Overriding it ships mis-accented pedagogy.

**Why it happens:**
Confusion between two different quorum flags: (a) the ASCII-apostrophe convention (U+0027, intentional, keep) vs (b) missing Spanish tildes (a real error). The memory note is explicit: "apóstrofes ASCII" ≠ "sin acentos." A C4-accent flag on un-tilded Spanish is a bug to FIX.

**How to avoid:**
- Author all explanations with correct Spanish accents from the start (regla + ejemplo paralelo, plain text, ASCII apostrophes). Italianisms (`città`, `caffè`, `quegli`, `mia madre`) preserve Italian orthography.
- When a C4-accent flag appears on Spanish text: add the missing tilde. Do NOT override. Reserve override only for the known gloss/C5 false-positive.
- The smoke paramétrico enforces ASCII apostrophes + no-markdown but NOT tildes — so tilde correctness rides on authoring discipline + quorum, not the test.

**Warning signs:** An explanation with `explicacion`, `articulo`, `numero`, `regla` un-tilded; a C4 flag dismissed without editing the text.

**Phase to address:** All four authoring phases (canon carried from Phase 7.1 into every new category).

---

## Integration Lockstep Pitfalls (verified against current tree)

These are the exact sync points that v1.5/v1.6/v1.7 established. The milestone adds FOUR categories, so each point must be touched FOUR times (or once with four entries).

### Pitfall 11: Forgetting to update all THREE count-array hardcodes + TOTAL_EXPECTED

**What goes wrong:**
There are THREE independent count arrays plus a derived total, and a new category absent from any one fails the suite (or worse, passes silently if only some are updated):
1. `tests/exercise-types.test.js` → `CATEGORIES_WITH_EXPLANATIONS` (line ~1273) — explanation coverage + smoke.
2. `scripts/run-validation-271.mjs` → `CATEGORIES` (line ~176) + `TOTAL_EXPECTED` (reduce) + the coherence guard (`TOTAL_EXPECTED_BASELINE = 183 + …`).
3. `tests/fixtures/slot-variants-integration.test.js` → `REAL_CATEGORIES` (line ~168).

**Why it happens:**
The three arrays live in different files (tests vs script) and are easy to update partially. The `run-validation` coherence guard is hardcoded to `183 + PRESENTE_REGOLARE_SLOTS` — adding four new categories means this guard formula ITSELF must change (it currently only knows about presente-regolare), or it will throw.

**How to avoid:**
- Use dynamic-count (`slotCountOf`/`.exercises.length`) for the four NEW entries, exactly as presente-regolare does (D-31-06 — never a magic number).
- Update the `TOTAL_EXPECTED_BASELINE` coherence-guard formula in `run-validation-271.mjs` to account for the four new categories' slot counts (currently `183 + PRESENTE_REGOLARE_SLOTS`, i.e. today 195 → must become `195 + sum(new four)` or be reframed). This is the easiest thing to miss because it's a guard, not an array entry.
- Add all four to all three arrays in the SAME plan (the integration/lockstep phase), verify with the full suite + `VAL_07_STRICT=1`.

**Warning signs:** Suite passes but reporter VAL-06 shows a count mismatch; the coherence guard in run-validation throws "Incoherencia de conteo"; only some of the three arrays mention the new categories.

**Phase to address:** The integration-lockstep phase (last phase of the milestone), per v1.7 Phase 31 precedent.

---

### Pitfall 12: Adding a 3rd applyImmediateFailure call-site via a new cruce (D-54 invariant)

**What goes wrong:**
If the milestone authors multi-cat cruces (e.g. Riflessivi↔Essere, Modali↔a verb) and someone wires cascade handling through a NEW path instead of reusing `applyResultToSession`, the cascade gains a 3rd `applyImmediateFailure(this.state,...)` call-site — breaking the D-54 invariant (EXACTLY 2 call-sites: final decision + match-first-wrong).

**Why it happens:**
A new cruce feels like new plumbing. But cruces are PURE CONTENT (`categoryIds: [a, b]`) — they need ZERO engine changes; the existing 2 call-sites already cascade to all `categoryIds`. v1.3 Canciones proved this (0 new call-sites; Pitfall #2 architecturally prevented).

**How to avoid:**
- Cruces are content-only: add `categoryIds: ["riflessivi", "essere"]` to a variant; the engine cascades automatically. Do NOT touch `src/screens/app.js` or `src/domain/progress.js`.
- The invariant is guarded by tests in FOUR files (`exercise-types.test.js` line ~785 "EXACTAMENTE 2 call-sites", `screen-canciones.test.js`, `screen-home-editorial.test.js`, `domain-progress.test.js`). Run them; if the count is 3, a plan touched the engine and must be reverted.

**Warning signs:** Any diff in `src/screens/app.js`/`src/domain/progress.js` during this milestone (should be ZERO — brownfield puro de contenido); the "EXACTAMENTE 2 call-sites" test failing.

**Phase to address:** The cruces/lockstep phase (guardrail already exists — just don't touch the engine).

---

### Pitfall 13: Migration reset-selectivo predicate missing a new prefix (RESET_PREFIXES)

**What goes wrong:**
The migration (schemaVersion 11→12) resets progress ONLY for the new categories via a `startsWith`-prefix predicate (pattern: `RESET_PREFIXES_V9 = ['avere', 'essere', ...]`). Omitting one of the four new category slugs means that category's stale progress survives the migration → the new category could boot as already-`hecha`, defeating the Core Value.

**Why it happens:**
Four slugs to add; easy to add three. Also the slug naming must EXACTLY match the `categories.json` id used as the exercise-id prefix.

**How to avoid:**
- Add all four new slugs to the reset-prefix list for `migrate11to12`/`hydrateV12`. Use the exact `categories.json` ids.
- **Prefix-collision caution (documented in storage.js ~line 821):** the `startsWith` filter has no collision only because no reset prefix is a prefix of another slug. Verify the four new slugs are not prefixes of any existing slug and vice versa (`possessivi`/`dimostrativi`/`modali`/`riflessivi` are safe, but confirm the actual chosen ids don't prefix-collide, e.g. avoid a bare `poss` that could match a future slug).
- Mirror `CURRENT_SCHEMA_VERSION` bump in BOTH `storage.js` and `backup.js`; add backup round-trip v12 + import v11→v12 + reject `>12` (v1.7 Phase 29 precedent).

**Warning signs:** A new category boots `hecha`/`dominada` on a migrated state; a backup fixture test shows surviving progress under a new prefix; `CURRENT_SCHEMA_VERSION` mismatched between storage.js and backup.js.

**Phase to address:** The migration phase (goes FIRST, per v1.6/v1.7 ordering — migration unblocks clean birth of new categories).

---

### Pitfall 14: Smoke parametric not picking up a new file / categories.json order collision

**What goes wrong:**
Two related integration misses:
1. The smoke parametric coverage (`CATEGORIES_WITH_EXPLANATIONS`) is a hardcoded array — a new `content/exercises/*.json` file is NOT auto-discovered. Forget to add it → the new category's explanations/ASCII/no-markdown/R1/R2 are never scanned.
2. `categories.json` `order` values: existing orders run 1–10. The four new categories need orders 11–14 (or a deliberate insert). A DUPLICATE order collides in home display (undefined sort). presente-regolare took order 10; the next free is 11.

**Why it happens:**
The arrays are intentionally hardcoded (PILOT-05: no slug auto-discovery, so shape bifurcation stays explicit). And `order` is a manual integer.

**How to avoid:**
- Add one `CATEGORIES_WITH_EXPLANATIONS` entry per new category (dynamic `expected: slotCountOf(...)`). Adding a category is "1 line in the array — zero new code" (D-144).
- Assign orders 11, 12, 13, 14 (no reuse of 1–10). Verify no duplicate `order` in `categories.json`.

**Warning signs:** New category renders but its explanations never get scanned (coverage test doesn't mention it); home table shows two categories at the same position / unstable order.

**Phase to address:** The integration-lockstep phase (smoke + categories.json registration).

---

## PROV-01 Pitfalls (provenance marker)

### Pitfall 15: Mislabeling MIXED-provenance legacy categories as purely one source

**What goes wrong:**
The legacy categories are NOT single-source. Several were PDF-transcribed by the author (`apuntes-profesora`) THEN quorum-augmented with new authored surfaces during CONV-01 (e.g. articoli: 56 legacy → 34 slots with 8+ quorum-authored variants incl. lo/gli-yi, degli-gn/ps; preposiciones: 41 new variants by quorum; every v1.6 conversion added quorum surfaces). Stamping such a category `source: "apuntes-profesora"` at the category level is dishonest — much of its current content is `ia-quorum`. The four NEW categories are cleanly `ia-quorum` (born from scratch), but the legacy ones are genuinely mixed.

**Why it happens:**
Category-level granularity is the simplest to implement, but it CANNOT honestly represent a category whose slots have different origins.

**How to avoid:**
- Choose granularity that can represent mixed legacy: SLOT-level (or variant-level) `source`, not category-level. A slot transcribed from the PDF = `apuntes-profesora`; a slot/variant authored by quorum = `ia-quorum`. The four new categories are uniformly `ia-quorum` at whatever granularity is chosen.
- If a category-level field is used for the new-four convenience, do NOT retroactively stamp legacy categories with a single value — leave legacy `source` absent (unknown/mixed) rather than assert a false uniform origin. Absence is more honest than a wrong label.
- Decide granularity in discuss/plan (the milestone context flags this as open). Honest options ranked: slot-level > variant-level > (category-level ONLY for the born-pure new four).

**Warning signs:** An articoli/preposiciones (or any CONV-01) slot that was quorum-authored carrying `source: "apuntes-profesora"`; a single category-level `source` on a category known to contain quorum-authored variants.

**Phase to address:** The PROV-01 phase (granularity decision is the crux — resolve in discuss/plan before stamping anything).

---

### Pitfall 16: Making the `source` field REQUIRED (breaks backward-compat)

**What goes wrong:**
If the schema validator is changed to REQUIRE `source`, all existing exercises (which lack it) fail validation → the app refuses to boot, backups fail round-trip. The validator (`schema-validator.js`) is currently a positive-allowlist (checks required fields: id, type, categoryIds, payload XOR variants) and is PERMISSIVE about unknown/extra fields — so an OPTIONAL new field is backward-compatible by construction (same pattern as the optional top-level `validation` block, D-VAL-08, and optional `explanation`, D-116).

**Why it happens:**
Instinct to enforce the new field for data quality.

**How to avoid:**
- Add `source` as OPTIONAL with an "if present, must be one of `apuntes-profesora`|`ia-quorum`" check (mirror the `explanation` "if present, non-empty string" rule, D-116). Absent = accepted.
- Do NOT add a "source required" check. Do NOT convert the validator to reject unknown fields.
- Verify: the 9 existing categories + Canciones validate unchanged after the schema change (fixture test, like every migration phase).

**Warning signs:** App boot shows a validation banner on existing categories after the schema change; backup round-trip of a pre-PROV state fails; the validator gained a "falta source" error path.

**Phase to address:** The PROV-01 schema phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Category-level `source` (one value per file) | Trivial to author | Cannot represent mixed legacy (articoli/prep are PDF+quorum) → dishonest provenance | ONLY for the four born-pure `ia-quorum` categories; NEVER for CONV-01 legacy |
| Forcing 2+ variants on lexical slots (`ciò`, family lemmas) | Uniform "every slot has variants" | Padded low-value exercises, synonym-swap non-variants | Never — use híbrido single-variant + documented "sin autoría" (PROF-01/SOST-01) |
| Override-shortcut on a disputed R7/accent flag | Fewer tokens, faster close | Ships ambiguous exercise or mis-accented pedagogy | Never for real bugs; override reserved ONLY for known gloss-C5 false-positive |
| Authoring modal passato prossimo now | Feels "complete" | Doble-validez swamp + out of A1 scope; belongs to PASSPROX-01 milestone | Never in v1.9 — hard scope boundary |
| Skipping DeepSeek pass on `quello`/possessive-exception/reflexive slots | Faster quorum | These are the exact magnets DeepSeek catches; human-verify approves wrong keys | Never for the three magnet slot-classes |

## Integration Gotchas

| Integration point | Common Mistake | Correct Approach |
|-------------------|----------------|------------------|
| `RESET_PREFIXES` (migration 11→12) | Add 3 of 4 slugs; or a slug that prefix-collides | Add all 4 exact `categories.json` ids; verify no `startsWith` collision |
| 3 count arrays + TOTAL_EXPECTED | Update tests but not run-validation guard; magic numbers | Dynamic `slotCountOf` for new 4; update `TOTAL_EXPECTED_BASELINE` formula |
| D-54 cascade (2 call-sites) | Wire a cruce through a new failure path | Cruces are content-only (`categoryIds:[a,b]`); zero engine edits |
| `CATEGORIES_WITH_EXPLANATIONS` smoke | Assume auto-discovery of new file | Add 1 explicit entry per new category (dynamic expected) |
| `categories.json` order | Reuse order 10 or duplicate an integer | Orders 11–14, no duplicates |
| `CURRENT_SCHEMA_VERSION` | Bump storage.js only | Mirror in storage.js AND backup.js; add v12 round-trip + reject >12 |

## "Looks Done But Isn't" Checklist

- [ ] **Dimostrativi `quello`:** Often missing DeepSeek-verified `quei`/`quegli` split — verify each noun's phonetic class, not just Claude passes.
- [ ] **Dimostrativi scope:** Often missing explicit `codesto` out-of-scope note + distance anchors on every fill-in.
- [ ] **Possessivi exception:** Often missing the plural/`loro`/altered-noun carve-outs — verify `le mie sorelle`, `il loro padre`, `la mia mamma` keys.
- [ ] **Riflessivi PP:** Often missing the -o/-a/-i/-e concordancia matrix and subject-gender cues — verify no `avere` auxiliary, no bare -o for feminine subject.
- [ ] **Migration:** Often missing one of 4 reset prefixes + backup.js version mirror — verify new categories boot `no-hecha` on migrated state.
- [ ] **Counts:** Often missing the run-validation coherence-guard formula update — verify no "Incoherencia de conteo" throw + VAL-06 counts all 4.
- [ ] **PROV-01:** Often missing honesty on mixed legacy — verify no CONV-01 quorum-authored slot is stamped `apuntes-profesora`; verify `source` is OPTIONAL (existing content still validates).
- [ ] **Engine:** Often missing the "zero engine diff" invariant — verify `git diff src/screens/app.js src/domain/progress.js` is empty and the 2-call-site tests pass.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong `quei/quegli`/possessive/reflexive key shipped | LOW | Fix key in JSON, re-run that item through quorum (both AIs correcta), re-run smoke |
| 3rd applyImmediateFailure call-site added | MEDIUM | Revert engine edit; re-route cruce as content-only `categoryIds`; re-run 2-call-site tests |
| Missing reset prefix (category boots hecha) | LOW | Add prefix to RESET_PREFIXES, re-run migration fixture; users re-earn state (Core Value intact) |
| Count array out of sync | LOW | Add missing entry (dynamic count) + fix guard formula; suite goes green |
| Legacy category mislabeled provenance | LOW-MEDIUM | Remove false category-level `source`; move to slot/variant granularity or leave absent |
| `source` made required (boot breaks) | LOW | Change validator to optional (if-present check); re-validate existing 9 + Canciones |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 `quello` phonetic split | Dimostrativi authoring+quorum (extra round) | DeepSeek pass on all `quello` slots; phonetic-table check |
| 2 ES 3-way→IT 2-way | Dimostrativi authoring | `codesto` OOS note + distance anchor on every fill-in |
| 3 Possessivi family exception | Possessivi authoring+quorum (extra round) | Carve-out variants (plural/loro/altered) keys DeepSeek-verified |
| 4 Possessivi thing-agreement | Possessivi authoring | Owner≠possessed gender variants exist |
| 5 Modal PP scope creep | Modali authoring (scope gate) | No modal + past-participle variants; OOS note present |
| 6 Riflessivi essere-agreement | Riflessivi authoring+quorum (extra round) | -o/-a/-i/-e matrix + subject cues; no `avere` aux |
| 7 Artificial variants on lexical | Each authoring phase | Híbrido split; "sin autoría" documented on lexical slots |
| 8 Trigger leak (R1) | All authoring phases | R1 pre-commit grep; gloss≠leak distinction held |
| 9 Missing ES gloss (R7) | All authoring + quorum | R7 mental check per item; disputes fixed by rewrite |
| 10 Accent bugs | All authoring phases | Correct tildes at authoring; C4-accent flag = fix not override |
| 11 Count arrays/TOTAL_EXPECTED | Integration lockstep phase | All 3 arrays + guard formula updated; VAL_07_STRICT green |
| 12 3rd D-54 call-site | Cruces/lockstep phase | 2-call-site tests pass; zero engine diff |
| 13 Reset prefix / collision | Migration phase (first) | All 4 slugs; no prefix collision; backup v12 round-trip |
| 14 Smoke pickup / order | Integration lockstep phase | 4 new smoke entries; orders 11–14 unique |
| 15 Mixed-legacy mislabel | PROV-01 phase (granularity decision) | No quorum slot stamped `apuntes-profesora` |
| 16 `source` required | PROV-01 schema phase | Optional field; existing 9 + Canciones validate |

## Sources

- `.planning/PROJECT.md` — Key Decisions (D-54 2-call-site invariant, D-04 DESIGN RULE, híbrido PROF-01/SOST-01, dynamic-count D-31-06), milestone v1.9 goal, v1.6/v1.7 lockstep precedents (HIGH)
- `.planning/milestones/v1.7-ROADMAP.md` — Phase 29/30/31 lockstep pattern (migration→authoring→cruces+counts), TOTAL_EXPECTED derivation, quorum-caught bugs (HIGH)
- `content/exercises/articoli.json` — lo/gli phonetic-trigger trap, articoli-049/050 match template, R7 doble-validez patterns (HIGH)
- `~/.claude/.../memory/exercise_authoring_rules.md` — R1-R7 verbatim + pre-commit checklist (HIGH)
- `~/.claude/.../memory/multi_vendor_quorum_validator.md`, `feedback_cross_vendor_catches_bugs.md`, `feedback_disputed_resolution.md`, `explanations_must_be_accented.md`, `gloss_es_desambiguacion_canon.md` — quorum discipline, DeepSeek accent strictness, gloss-vs-leak, override discipline (HIGH)
- `src/data/schema-validator.js` (positive-allowlist, permissive on extra fields → optional `source` is backward-compat), `src/data/storage.js` (RESET_PREFIXES_V9 + startsWith collision note), `scripts/run-validation-271.mjs` (CATEGORIES + TOTAL_EXPECTED guard), `tests/exercise-types.test.js` (CATEGORIES_WITH_EXPLANATIONS + 2-call-site test), `tests/fixtures/slot-variants-integration.test.js` (REAL_CATEGORIES) (HIGH)
- Italian grammar (standard A1-A2 references, training data): `quello` inflection table, possessive family-member article exception, reflexive essere-agreement, modal auxiliary-borrowing — MEDIUM (verified against articoli.json in-repo patterns where overlapping)

---
*Pitfalls research for: v1.9 brownfield content authoring (4 grammar categories + PROV-01)*
*Researched: 2026-07-01*
