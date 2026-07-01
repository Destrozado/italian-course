# Feature Research — v1.9: 4 new grammar categories (rule inventory)

**Domain:** A1/A2 Italian self-quiz content (slot+variantes JSON) for a Spanish-speaking learner
**Researched:** 2026-07-01
**Confidence:** HIGH (grammar verified against multiple authoritative sources; slot/exercise-type design verified against existing repo content `articoli.json` + `presente-regolare.json`)

> **How to read this file.** The "feature landscape" here is not app features — it is the **rule inventory** (candidate slots) for the 4 new categories. Each rule = one candidate slot (one rule, 1..N interchangeable variantes sharing an explanation), classified table-stakes / differentiator / anti-feature, with complexity, dependencies on existing categories, and an exercise-TYPE suggestion reasoned against the DESIGN RULE.
>
> **DESIGN RULE (Phase 4, codified):** `match` is ONLY valid when the pairing requires a rule NOT derivable by shared root. Singular↔plural and masc↔fem with a shared root → multiple-choice with plausible distractors. Conjugation derivable by root (io↔parlo) → NOT match (see `presente-regolare.json` notes: 0 match by decision).
>
> **Explanation canon (inherited, do NOT re-litigate):** Spanish accented (RAE), Italian quoted literally in Italian spelling, gloss `(en español: ...)` allowed and canonical (R7), plain text, ASCII apostrophe. Distractor pedagogy: distractors are other real forms / the calco error — only one concords.

---

## Feature Landscape

### Table Stakes (must cover for A1/A2)

Rules a learner is expected to master at A1/A2. Missing = the category feels incomplete.

| Rule (candidate slot) | Category | Why expected | Complexity | Exercise type | Deps |
|---|---|---|---|---|---|
| `questo/questa/questi/queste` agreement (vicino) | DEMOS | Core "this"; 4-form gender/number agreement | LOW | multiple-choice | genero-numero |
| `quest'` elision before vowel (quest'anno, quest'amica) | DEMOS | Standard A1 elision | LOW | multiple-choice | genero-numero |
| `quello` article-like forms `quel/quello/quell'/quei/quegli/quelle` | DEMOS | The signature trap; mirrors definite article exactly | **HIGH** | multiple-choice + **match** | **articoli** (direct) |
| ES 3-way → IT 2-way collapse (este/ese/aquel → questo/quello) | DEMOS | THE Spanish-speaker calco trap | MEDIUM | multiple-choice | — |
| `il mio / la mia / i miei / le mie` (+ tuo/suo) agreement with the THING possessed | POSS | Core possessive; agrees with possessed noun not possessor | MEDIUM | multiple-choice | genero-numero, articoli |
| Possessive REQUIRES the definite article (la mia casa, not "mia casa") | POSS | Direct contrast with Spanish (mi casa) | LOW | multiple-choice | articoli |
| Family-member singular unmodified DROPS article (mia madre, tuo fratello) | POSS | High-frequency A1 exception | MEDIUM | multiple-choice | — |
| Article RETURNS with plural / alteration (i miei fratelli, la mia mamma) | POSS | The exception-to-the-exception | MEDIUM | multiple-choice | genero-numero |
| Present of `potere / volere / dovere` (irregular, by person) | MODAL | Core A1 irregular conjugation | MEDIUM | multiple-choice + word-buttons | — |
| Modal + infinitive (posso andare, voglio mangiare, devo studiare) | MODAL | The defining modal construction | LOW | word-buttons + multiple-choice | presente-regolare (infinitive) |
| Present of `mi chiamo / ti chiami / si chiama` (reflexive, all persons) | REFLEX | First verb every learner meets | MEDIUM | multiple-choice + word-buttons | presente-regolare |
| Reflexive pronoun placement BEFORE the conjugated verb (mi sveglio, not "sveglio mi") | REFLEX | Core word-order rule | LOW | word-buttons | presente-regolare |
| Reflexive present built on regular endings (si alza, ci laviamo, vi vestite) | REFLEX | Extends presente-regolare with pronoun | MEDIUM | multiple-choice + word-buttons | **presente-regolare** (direct) |

### Differentiators (A2 depth / nice-to-have, aligned with Core Value "no olvidar")

Not required for A1, but they deepen re-verification and cover known learner pain.

| Rule (candidate slot) | Category | Value | Complexity | Exercise type | Deps |
|---|---|---|---|---|---|
| Neutral pronoun `ciò` (ciò che, per ciò) — "that/what" abstract | DEMOS | Fills the neutral-pronoun gap; pronoun quello vs adjective quello | MEDIUM | multiple-choice | — |
| `questo` vs `quello` as **pronouns** (4 forms: questo/questa/questi/queste, quello/quella/quelli/quelle) | DEMOS | Pronoun forms are simpler than adjective quello — worth isolating | LOW | multiple-choice | genero-numero |
| `suo` = his/her/its ambiguity (context resolves; agrees with possessed) | POSS | Classic confusion; su/sus is different in ES | MEDIUM | multiple-choice | — |
| `loro` possessive is INVARIABLE + keeps article (il loro, la loro, i loro, le loro) | POSS | Irregular within the paradigm | MEDIUM | multiple-choice | articoli |
| Passato prossimo of modals: auxiliary BORROWED from the following infinitive (ho dovuto lavorare vs sono dovuto andare) | MODAL | A2 subtlety; verified rule | **HIGH** | multiple-choice | avere, essere |
| Reflexive passato prossimo with ESSERE + agreement (mi sono svegliato/a, si sono alzati/e) | REFLEX | A2; all reflexives take essere, participle agrees | **HIGH** | multiple-choice | **essere** (direct) |
| ES↔IT reflexive mismatch (verbs reflexive in one language not the other) | REFLEX | Genuine calco trap for Spanish speaker | MEDIUM | multiple-choice | — |

**ES↔IT reflexive mismatch — concrete pairs to test (research note):** Overlap is large (chiamarsi/llamarse, svegliarsi/despertarse, alzarsi/levantarse, arrabbiarsi/enfadarse all reflexive in both). Genuine mismatches worth a slot: `ammalarsi` (IT reflexive) vs "enfermar/ponerse enfermo"; `dimenticarsi (di)` optional reflexive vs "olvidarse (de)"; `salire` (IT non-reflexive "to go up") vs ES "subirse". Keep this slot SMALL and high-signal — pick 2-3 clear divergences, do not manufacture false traps.

### Anti-Features (explicitly OUT of A1/A2 scope)

| Rule / feature | Why tempting | Why out of scope | Instead |
|---|---|---|---|
| `codesto` (the third demonstrative) | Completes the ES 3-way symmetry (este/ese/aquel) | Archaic/Tuscan-regional, NOT A1/A2; reinforces the wrong mental model | Teach the 2-way collapse explicitly (questo/quello) |
| Reciprocal reflexives (si amano, ci scriviamo "each other") | Natural extension of reflexive pronouns | A2+/B1 nuance; distinct semantics | Defer to a later reflexive/pronoun milestone |
| `stesso` (medesimo) as demonstrative-adjacent | Appears near demonstratives in grammars | Not a demonstrative; separate emphatic-adjective topic | Out of category scope |
| Modal + pronoun placement (voglio farlo / lo voglio fare) | Real and common | Requires clitic pronouns (not yet a category) | Defer until clitics exist as content |
| `sapere` as a 4th modal | Grammars group it with potere/volere/dovere | Milestone scope is the THREE named modals; sapere ≠ "can" cleanly (skill vs ability) | Out; revisit if a verbs-irregolari milestone lands |
| Free-text answer for any of these | "More realistic" | Project OUT-OF-SCOPE (accent/synonym normalization); 3 types suffice | multiple-choice / word-buttons / match |
| Possessive PRONOUN standalone (il mio è rosso) | Symmetry with adjective | Adjective use is table-stakes; pronoun standalone is a thin A2 add | Optional single slot at most; not priority |
| Heavy tenses (imperfetto/futuro/condizionale/congiuntivo, dedicated passato prossimo, irregular participles) | Would round out verbs | Explicitly a SEPARATE later milestone (PROJECT.md) | Only the modal/reflexive passato prossimo slivers above, and only if scoped in |

---

## Feature Dependencies

```
DEMOS: quello article-like forms
    └──requires──> articoli (il/lo/l'/i/gli/le triggers: s-impura, z, ps, gn, x, vowel, semiconsonant)
                       quel↔il · quello↔lo · quell'↔l' · quei↔i · quegli↔gli · quelle↔le

POSS: agreement + article rules
    └──requires──> genero-numero (which form: mio/mia/miei/mie)
    └──requires──> articoli (which article precedes: il mio / la mia / lo / l')

MODAL: modal + infinitive
    └──enhances──> presente-regolare (the infinitive being governed)
MODAL: passato prossimo auxiliary borrowing
    └──requires──> avere + essere (auxiliary + participle agreement)

REFLEX: reflexive present
    └──requires──> presente-regolare (endings the pronoun attaches to)  [DIRECT — builds on v1.7]
REFLEX: reflexive passato prossimo
    └──requires──> essere (auxiliary + participle gender/number agreement)  [DIRECT]

ES-3way collapse (DEMOS) ──conflicts──> codesto  (adding codesto reinforces the wrong model)
```

### Dependency Notes

- **DEMOS `quello` requires `articoli`:** the six adjective forms of `quello` are the definite article shifted by `qu-`, trigger-for-trigger. This is the strongest cross-category link in the milestone and the primary justification for a **match** slot (see below). Multi-cat cross exercises (`dimostrativi`+`articoli`, mirroring the `avere-300` pattern) are natural here for cascade D-54 reinforcement.
- **POSS requires both `genero-numero` and `articoli`:** two independent axes — form of the possessive (agrees with possessed noun) AND the article that precedes it. Good candidate for multi-cat crosses.
- **REFLEX builds directly on `presente-regolare` (v1.7):** the reflexive present is regular endings + a pre-posed pronoun. This is the cleanest "builds on prior category" story in the milestone; frame explanations as "you already know si alza's ending from -are; the new part is the `si`."
- **MODAL + REFLEX passato prossimo both pull in `avere`/`essere`:** these are the A2 slivers. Decide in requirements whether they are IN scope for v1.9 or deferred to the heavy-tenses milestone. Recommendation below.

---

## Per-category slot summary (candidate slot counts)

| Category | Table-stakes slots | Differentiator slots | Notes on `match` |
|---|---|---|---|
| **DIMOSTRATIVI** | ~4 (questo agr., quest' elision, quello forms, ES-collapse) | ~2 (ciò, pronoun questo/quello) | **1 match JUSTIFIED**: noun→quello-form, same logic as `articoli-049` (trigger not derivable by root) |
| **POSSESSIVI** | ~4 (form agreement, article-required, family drop, family-return) | ~2 (suo ambiguity, loro invariable) | **match NOT justified** for the core; possessive form is derivable from the noun's gender/number (root-derivable) → multiple-choice with the calco distractor ("mi casa" → "mia casa" no-article). A family-member vs non-family **match** (article vs no-article) is *arguably* justified (rule not derivable by root) — flag for author judgment. |
| **VERBI MODALI** | ~2 (present conj. of the 3; modal+infinitive) | ~1 (pp auxiliary borrowing) | **match NOT justified**: conjugation derivable by person (same reasoning as `presente-regolare` 0-match). MC + word-buttons only. |
| **VERBI RIFLESSIVI** | ~3 (chiamarsi/present, pronoun placement, reflexive-on-regular) | ~2 (pp with essere+agreement, ES↔IT mismatch) | **match NOT justified** for conjugation. A pronoun→person **match** (mi↔io, ti↔tu, si↔lui) is root-mechanical → forbidden by DESIGN RULE; use MC/word-buttons. |

**Estimated new slots for v1.9 (table-stakes only): ~13.** With differentiators: ~20. In line with prior single-category slot counts (Articoli 34, Preposiciones 49) spread across 4 categories.

---

## `match` justification (per DESIGN RULE) — the decisive calls

- **DIMOSTRATIVI — `match` JUSTIFIED (1 slot).** noun → `quel/quello/quell'/quei/quegli/quelle`. The pairing requires the phonological-trigger rule (s-impura/z/ps/gn/x/vowel), which is NOT derivable from a shared root — it is exactly the `articoli-049` precedent (`studente`→`lo`, `gnocchi`→`gli`). This is the milestone's clearest legitimate match.
- **POSSESSIVI — `match` mostly NOT justified.** Core possessive-form selection is root-derivable (noun gender/number → mio/mia/miei/mie), so use MC. **Edge case flagged:** a `match` of family-vs-common noun → article-present/absent (madre→∅, mamma→la, casa→la) tests a rule *not* derivable by root and could qualify — decide in plan; if in doubt, MC with the article/no-article distractor is the safe default.
- **VERBI MODALI — `match` NOT justified.** Person→form is derivable once you know the (irregular) paradigm; treat like `presente-regolare`'s explicit 0-match decision. MC + word-buttons.
- **VERBI RIFLESSIVI — `match` NOT justified.** Pronoun↔person (mi↔io) is mechanical association = exactly what D-04/R3 forbid. Conjugation is root-derivable. MC + word-buttons (word-buttons is ideal for pronoun-placement: build "io mi sveglio" from a bank containing the distractor order "sveglio mi").

---

## MVP Definition (recommended scope for v1.9)

### Launch With (v1.9 core — table-stakes)

- [ ] **DIMOSTRATIVI:** questo agreement · quest' elision · quello article-like forms (+ 1 match) · ES-3way→2way collapse — *the quello/articoli link is the headline.*
- [ ] **POSSESSIVI:** form agreement (mio/mia/miei/mie ×tuo/suo) · article-required · family-member drop · article-returns-with-plural/alteration.
- [ ] **VERBI MODALI:** present of potere/volere/dovere · modal+infinitive.
- [ ] **VERBI RIFLESSIVI:** reflexive present (chiamarsi + regular-based si alza/ci laviamo) · pronoun placement.

### Add After Validation (differentiators, same milestone if time)

- [ ] DEMOS `ciò` neutral pronoun; questo/quello pronoun forms.
- [ ] POSS `suo` ambiguity slot; `loro` invariable.
- [ ] **REFLEX passato prossimo with essere + agreement** — strongest A2 add, direct `essere` dependency, high learner value. **Recommend INCLUDING** (it is the reflexive analogue of the already-shipped `presente-regolare-301` essere-agreement slot).

### Future Consideration (defer)

- [ ] **MODAL passato prossimo auxiliary borrowing** — verified real (ho dovuto lavorare / sono dovuto andare) but genuinely A2-subtle and low-frequency at this level. **Recommend DEFERRING** to the heavy-tenses milestone unless the author wants full symmetry with the reflexive pp slot. Flag for requirements decision.
- [ ] Reciprocal reflexives, clitic+modal, codesto, sapere-as-modal — out (see anti-features).

## Feature Prioritization Matrix

| Rule (slot) | Learner value | Authoring cost | Priority |
|---|---|---|---|
| quello article-like forms (+match) | HIGH | HIGH | P1 |
| ES-3way→2way collapse | HIGH | MEDIUM | P1 |
| questo/quest' agreement + elision | HIGH | LOW | P1 |
| possessive article-required + form agreement | HIGH | MEDIUM | P1 |
| family-member drop + return | HIGH | MEDIUM | P1 |
| modal present + modal+infinitive | HIGH | MEDIUM | P1 |
| reflexive present + pronoun placement | HIGH | MEDIUM | P1 |
| reflexive pp with essere+agreement | HIGH | HIGH | P2 |
| ciò / suo ambiguity / loro invariable | MEDIUM | MEDIUM | P2 |
| ES↔IT reflexive mismatch | MEDIUM | MEDIUM | P2 |
| modal pp auxiliary borrowing | MEDIUM | HIGH | P3 |

**Priority key:** P1 must-have (table-stakes) · P2 should-have (high-value A2) · P3 defer.

## Sources

- [Italian Demonstrative Adjectives — Lawless Italian](https://www.lawlessitalian.com/grammar/adjectives/demonstrative-adjectives/) — quello forms mirror definite article, questo agreement (HIGH)
- [Demonstratives questo/quello — Mango Languages](https://mangolanguages.com/resources/learn/grammar/italian/how-to-use-the-demonstratives-questo-this-and-quello-that-in-italian) — quel/quello/quei/quegli triggers verified against il/lo/i/gli (HIGH)
- [Demonstrative pronouns questo, quello, ciò — Elon.io](https://elon.io/grammar/italian/pronouns/demonstrative/questo-quello) — pronoun 4-form set + ciò neutral (MEDIUM)
- [Family members and "my" in Italian — Prof Corsini](https://ilsitodiprofcorsini.wordpress.com/family-members-and-my-in-italian/) — singular-unmodified drop, plural/alteration return (HIGH)
- [Mio, Tuo, Suo and the Definite Article Rule — Polyglottist Academy](https://www.polyglottistlanguageacademy.com/language-culture-travelling-blog/2025/6/22/how-to-use-italian-possessives-mio-tuo-suoand-the-definite-article-rule) — article-required, agreement with possessed, family exception, loro invariable (HIGH)
- [Italian Possessive Adjectives — Duolingo blog](https://blog.duolingo.com/italian-possessive-adjectives/) — form agreement mio/mia/miei/mie, suo ambiguity (MEDIUM)
- [Modal verbs overview (dovere/potere/volere) — Elon.io](https://elon.io/grammar/italian/verbs/modal-verbs/overview) — irregular present, modal+infinitive (HIGH)
- [Passato Prossimo: Potere, Volere, Dovere — Think in Italian](https://www.thinkinitalian.com/potere-volere-dovere-sapere-passato-prossimo) — auxiliary borrowed from following infinitive, essere agreement (HIGH)
- [Modal verbs in the past tense — OnlineItalianClub](https://onlineitalianclub.com/free-italian-exercises-and-resources/italian-grammar/verbi-modali-passato-prossimo-modal-verbs/) — ho dovuto lavorare / sono dovuto andare (HIGH)
- [Reflexive Verbs A1 — OnlineItalianClub](https://onlineitalianclub.com/free-italian-exercises-and-resources/online-italian-course-beginner-level-a1/italian-grammar-reflexive-verbs/) — present conjugation, pronoun placement (HIGH)
- [Reflexive verbs guide — Busuu](https://www.busuu.com/en/italian/reflexive-verb) — all reflexives take essere, participle agreement (HIGH)
- [Reflexive pronouns/verbs across Romance languages — Adrosverse](https://www.adrosverse.com/comparative-grammar-reflexive-pronouns-and-verbs-in-spanish-portuguese-italian-french/) — ES vs IT reflexive comparison, essere-vs-haber, agreement difference (MEDIUM)
- Repo: `content/exercises/articoli.json` — slot shape, `match` precedent (articoli-049), explanation canon, article triggers (HIGH — authoritative for THIS project)
- Repo: `content/exercises/presente-regolare.json` — reflexive dependency base, 0-match decision reasoning, passato prossimo essere-agreement slot (301), gloss/distractor canon (HIGH)

---
*Feature research (rule inventory) for: v1.9 — 4 new A1/A2 grammar categories*
*Researched: 2026-07-01*
