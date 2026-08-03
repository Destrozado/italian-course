---
phase: 41-fare-indicativo-8-slots-el-bloque-grande
reviewed: 2026-08-03T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - content/exercises/fare-indicativo.json
  - content/categories.json
  - tests/content-fare-indicativo.test.js
  - tests/exercise-types.test.js
findings:
  critical: 1
  warning: 6
  info: 4
  total: 11
status: issues_found
---

# Phase 41: Code Review Report

**Reviewed:** 2026-08-03
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Content-authoring phase: one hand-authored category (`fare-indicativo`, 8 multiple-choice slots × 6 person-variants = 48), its registry entry, and a permanent-invariant test file. Zero engine code changed.

What I verified mechanically before looking for defects:

- `node --test tests/*.test.js` → **765 pass / 0 fail**. `VAL_07_STRICT=1 node --test tests/*.test.js` → **1 fail**, and it is exactly `content/exercises/fare-indicativo.json — todos los ejercicios validated`. That is the declared honest marker of pending work, not a regression.
- Schema conformance is genuinely covered: `tests/domain.test.js:222-233` discovers `content/exercises/*.json` with `readdirSync`, and the whole-bundle `validateContent` test at `tests/domain.test.js:322` therefore includes the new file. Slot-level `explanation` (validator `src/data/schema-validator.js:210-231`), no variant-level explanation, `categoryIds` → known category, `correctIndex` in range, 3-4 options: all green.
- `src/main.js:67-74` derives `categoryIds` from `categories.json`, so the new content file **is** fetched at runtime. No hidden manifest to update. The `categories.json` entry is a hard prerequisite and it is present, last in the array, `order: 15`, key set identical to its 4 `origen`-bearing siblings.
- Counts: 8 slots, 6 variants each, 48 total; 48 unique prompts; no duplicate option strings in any variant; every prompt has exactly one `___`; no id in the reserved `-300+` range; no id collides globally (whole-bundle validator agrees).
- `validation` is `{status:"pending", passes:[]}` on all 8 slots. No forged `validated`, no fabricated pass entries.
- Editorial canon: file is NFC-stable; zero U+2019/U+201C/U+201D; zero `<`, `>`, `&#`, `javascript:`, markdown markers; zero `__proto__`/`constructor`/`prototype` own-keys. I ran a 60-word missing-tilde scan over all 8 explanations — every hit was a legitimately unaccented Spanish word (`tercera`, `primera`, `solo`, `este`, `historia`, `apoyo`, `fijarse`). **No accent violations in the data.**
- The "self-invalidating grep" trap was avoided correctly: every absence check in `tests/content-fare-indicativo.test.js` is scoped to `variants[].options[]` (blacklist, other-moods, participle-agreement, compound shape) or to `variants[].prompt` + `options[]` (periphrasis, frames). The only whole-file scans are the hygiene ones (angle brackets / smart quotes / dangerous keys), where including `notes` is correct. I found **no** unscoped absence check.

So the structure is sound and the test file is much stronger than average. The defects that remain are in (a) one distractor family that is real Italian the prompt does not exclude, (b) a declared distractor rule the data silently deviates from in 12 of 24 compound variants, and (c) three invariants the test file *claims* to enforce but enforces only weakly.

## Critical Issues

### CR-01: The futuro-anteriore distractor is a defensible second answer (epistemic/suppositional reading) in 4 variants — a right answer gets marked wrong and resets the whole category

**File:** `content/exercises/fare-indicativo.json:333`, `:362`, `:407`, `:436`

**Issue:** The `passato-prossimo` and `trapassato-prossimo` slots both offer the *futuro anteriore* of the auxiliary as a tense distractor. The explanations treat that form as strictly future-anchored (`:306` "avrò fatto para lo que estará hecho antes de un momento futuro"; `:380` "la segunda es el futuro avrò fatto, que anticipa un momento futuro"). That is an incomplete account of Italian: `avrà fatto` / `avranno fatto` also carry the well-established **epistemic (suppositional) reading**, which refers to the *past*, not the future — the same construction as `sarà partito ieri` ("he must have left yesterday"). Nothing in these four prompts blocks it:

- `:329` + `:333` — "Questa settimana lui **avrà fatto** il lavoro e ora può riposare." = *he must have done the work this week and now he can rest.* Fully idiomatic.
- `:359` + `:362` — "Questo mese loro **avranno fatto** un errore e adesso lo pagano." = *they must have made a mistake this month and now they're paying for it.*
- `:403` + `:407` — "Quando la riunione è cominciata, lui già **avrà fatto** il lavoro." = *when the meeting started he had probably already done the work.*
- `:433` + `:436` — "Loro già **avranno fatto** tutto quando il professore è entrato."

The 1st-person variants (`:309`, `:383`) are safe — you do not speculate about yourself — and the trapassato-remoto slot is safe because a `passato remoto` main clause hard-blocks the reading. The exposure is the 3rd-person singular and plural variants of the two `-prossimo` slots (the 2nd-person ones, `:322`/`:395`, are adjacent risk).

This is the exact defect class the phase's own SC-2 exists to prevent, and the phase already applied the reasoning to sequences once — `notes:2` rejects `fui fatto` in trapassato remoto *because it is an attested sequence*, even though the direct object blocks it in that frame. The same rule was not applied to `avrà fatto`.

Why this is critical rather than cosmetic: this is a self-validation tool with an immediate-failure cascade. A learner who deliberately picks the epistemic reading is marked wrong, and `applyImmediateFailure` drops the category to `no-hecha`, sets `streakDays: 0` and wipes `clearedExerciseIds` (see `tests/domain.test.js:289-307` asserting exactly that on real content). One unfair item destroys real progress state.

**Fix:** replace the futuro-anteriore distractor in those variants with an auxiliary tense that has no past-referring reading. The trapassato-remoto auxiliary works, keeps the two-word invariant, keeps "same person / other tense", and is unambiguously wrong outside a `passato remoto` main clause — and it is *not* covered by the D-41-11 cross-direction ban, which only bans the *simple* passato remoto forms (`feci`…), enforced at `tests/content-fare-indicativo.test.js:439`:

```json
// content/exercises/fare-indicativo.json:329-336  (passato prossimo, lui)
"prompt": "Questa settimana lui ___ il lavoro e ora può riposare.",
"options": [
  "ha fatto",
  "aveva fatto",
  "ebbe fatto",   // was "avrà fatto" — no epistemic reading, blocked by the recent frame
  "ha fare"
],
"correctIndex": 0
```

Apply the same swap at `:362` (`avranno fatto` → `ebbero fatto`), `:407` (`avrà fatto` → `ebbe fatto`) and `:436` (`avranno fatto` → `ebbero fatto`). If the futuro-anteriore distractor is kept instead, the concern must be recorded in `validation.passes[].concerns` so the pending quorum rules on it explicitly rather than re-deriving it.

## Warnings

### WR-01: 12 of the 24 compound variants deviate from D-41-10 — the malformed distractor carries the *present* auxiliary, duplicating another distractor and collapsing two test dimensions into one

**File:** `content/exercises/fare-indicativo.json:398`, `:408`, `:425`, `:472`, `:482`, `:499`, `:536`, `:546`, `:556`, `:566`, `:573`, `:583`

**Issue:** `notes:2` (D-41-10) specifies the two authorized distractor families as "el auxiliar essere en el mismo tiempo y persona que la key … **y el auxiliar correcto seguido del infinitivo, es decir ho fare, avevo fare, avrò fare**" — one auxiliary tense per compound slot, matching the key. Only the `passato-prossimo` slot honors it (`hai fare`/`ha fare`/`avete fare` against present-tense keys). In the other three slots the infinitive distractor always uses the **present** auxiliary regardless of the slot:

| slot | variant | key | tense distractors | infinitive distractor |
|---|---|---|---|---|
| trapassato prossimo | tu / lui / voi | `avevi fatto` … | `avrai fatto`, **`hai fatto`** | **`hai fare`** (should be `avevi fare`) |
| futuro anteriore | tu / lui / voi | `avrai fatto` … | `hai fatto`, `avevi fatto` | **`hai fare`** (should be `avrai fare`) |
| trapassato remoto | all six | `ebbi fatto` … | **`ho fatto`**, `avrò fatto` | **`ho fare`** (should be `ebbi fare`) |

Concrete failure scenario — `trapassato remoto`, variant io (`:532-537`): options are `ho fatto`, `ebbi fatto`, `avrò fatto`, `ho fare`. A learner who knows only "the auxiliary must be in passato remoto" eliminates **two** options with a single rule and is left with a 1-in-2 guess. The item was designed as a 4-way discrimination and behaves as a 2-way one. Simultaneously, the lesson the infinitive distractor is supposed to isolate ("don't put the infinitive where the participle goes") is never isolated, because that option is *also* wrong on the auxiliary tense — the learner never has to notice `fare` vs `fatto`. All six trapassato-remoto variants and three variants each of trapassato prossimo and futuro anteriore are affected.

The invariant test cannot see this. `tests/content-fare-indicativo.test.js:384` classifies the malformed option purely by `o.split(' ')[1] === 'fare'` and never inspects its auxiliary tense, so swapping `avevo fare` → `ho fare` anywhere leaves the suite green.

**Fix:** put the slot's own auxiliary tense on the infinitive distractor (`avevi fare`, `avrai fare`, `ebbi fare`, …), and add the missing dimension to the test:

```js
// after computing keyTense / malformadas in the compound block
for (const o of malformadas.filter(x => x.split(' ')[1] === 'fare')) {
  assert.equal(tenseOf(o.split(' ')[0], k), keyTense,
    `D-41-10: ${id}#${k} la distractora de infinitivo "${o}" debe llevar el auxiliar del slot (${keyTense})`);
}
```

### WR-02: the "explanations están en español acentuado" assertion is near-vacuous — one accented character in ~1,400 passes

**File:** `tests/content-fare-indicativo.test.js:544`

**Issue:** `assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/)` only proves that **at least one** accented character exists somewhere in the string. Measured density in the current data: `fare-indicativo-trapassato-remoto` has 10 accented characters in 1,403 chars; `fare-indicativo-passato-prossimo` has 11 in 1,426. Concrete failure scenario: a future rewrite that drops every tilde but leaves a single `raíz` keeps this test green — while `memory/explanations_must_be_accented.md` records that unaccented Spanish in an explanation is treated as a **real bug** in this project (PRES-05), not a nitpick. The test therefore advertises an invariant it does not hold.

**Fix:** assert against words that must carry a tilde if the prose is intact, so the check degrades loudly rather than silently:

```js
const ACENTUADAS = ['raíz', 'así', 'aquí', 'también', 'más', 'única', 'único', 'qué', 'está', 'sílaba', 'ortografía'];
for (const s of SLOTS) {
  const hits = ACENTUADAS.filter(w => s.explanation.includes(w));
  assert.ok(hits.length >= 3,
    `D-41-17: la explanation de ${s.id} solo lleva ${hits.length} palabras acentuadas reconocidas (${hits.join(', ')}) — posible pérdida de tildes RAE`);
}
```

### WR-03: "2 formas inexistentes" is decided by absence from this file's own key table, so an attested archaic form would pass as "inexistent"

**File:** `tests/content-fare-indicativo.test.js:354` (and `:80`, `:356`)

**Issue:** `const inexistentes = resto.filter((o) => !ALL_CANON_FORMS.has(o))` classifies **any** string that is not one of the file's own 48 keys as "inexistente". It has no view of Italian outside this file. So a distractor like `fei`, `festi`, `femmo`, `feste`, `fero`, `feciono`, `fici`, `facisti`, `facette` or `facettero` — the eleven attested archaic/dialectal passato-remoto forms that `notes:2` says the author "descartó una a una", ratifying the rule on 2026-08-03 — would be counted as one of the two required "inexistentes" and the test would go green. That is precisely the unfair-item damage D-41-08 exists to prevent, and the guard the phase wrote does not cover it: `BLACKLIST` (`:80`) holds only 5 of the 16 forms the `notes` documents, and none of the eleven passato-remoto ones.

Concretely today: `facetti` (`content/exercises/fare-indicativo.json:239`) is the single distractor the file itself flags as needing scrutiny ("anotada aquí para que la ronda extra de DeepSeek de D-41-12 la mire con lupa" — it sits in the slot where `faci` had to be blacklisted). Nothing in the suite constrains it, and its slot is `validation.status: "pending"`, so no automated or human gate has ruled on it yet. The three cross-root distractors `fecesti` (`:247`), `fecemmo` (`:267`), `feceste` (`:277`) are in the same unverified bucket — they are morphologically the direct Latin-perfect shapes (`fecisti`, `fecistis`), which is why the contracted relatives `festi`/`feste` had to be blacklisted.

**Fix:** extend `BLACKLIST` to the full 16 forms the `notes` enumerates so the ratified rule is mechanically enforced, and drop the misleading "inexistentes" wording for what the assertion actually proves:

```js
const BLACKLIST = [
  'fo', 'fé', 'fenno', 'facea', 'fan',        // D-41-08 canónicas
  'face', 'faci',                              // añadidas en 41-01
  'fei', 'festi', 'femmo', 'feste', 'fero', 'feciono',
  'fici', 'facisti', 'facette', 'facettero', 'facero',
];
```
and, separately, get `facetti` / `fecesti` / `fecemmo` / `feceste` explicitly ruled on in the pending quorum pass (`validation.passes[].concerns`) rather than left implicit.

### WR-04: two explanations never mention the distractor family half of their own variants actually offer

**File:** `content/exercises/fare-indicativo.json:380`, `:454` (and, secondarily, `:232`)

**Issue:** The slot-level `explanation` is the only didactic feedback the learner sees after answering. The `trapassato-prossimo` explanation (`:380`) enumerates exactly three traps — present auxiliary, future auxiliary, over-generalized `essere` (`ero fatto`) — and the `futuro-anteriore` explanation (`:454`) does the same with `sarò fatto`. But `ero fatto`/`sarò fatto` only appear in the io/noi/loro variants; the tu/lui/voi variants of both slots instead offer the infinitive malformation `hai fare` / `ha fare` / `avete fare` (`:398`, `:408`, `:425`, `:472`, `:482`, `:499`), which neither explanation mentions at all. A learner who picks `hai fare` on `:393` reads an explanation about `ho fatto`, `avrò fatto` and `ero fatto` and gets no account of the error they actually made. This is an omission rather than a design choice: the `passato-prossimo` explanation (`:306`, "La tercera … es dejar el infinitivo donde va el participio y escribir ho fare") and the `trapassato-remoto` one (`:528`) both cover it correctly.

Same shape, smaller, at `:232`: the passato-remoto explanation declares exactly two trap families (cross-root alternation, regular `-are` conjugation), but `facetti` (`:239`), `faciò` (`:259`) and `facerono` (`:288`) fit neither.

**Fix:** add one sentence to both explanations, mirroring the wording already used at `:306`:

> "Y una trampa más, la de construir mal el compuesto: dejar el infinitivo donde va el participio y escribir hai fare en lugar de hai fatto."

Optionally guard it, since the file has 3 of 4 compounds citing the family already:

```js
for (const id of COMPOUND_SLOTS) {
  const ofreceInfinitivo = byId(id).variants.some(v => v.options.some(o => o.endsWith(' fare')));
  if (ofreceInfinitivo) {
    assert.match(byId(id).explanation, /\bfare\b[^.]*participio|participio[^.]*\bfare\b/i,
      `${id}: ofrece la distractora de infinitivo pero la explanation no la explica`);
  }
}
```

### WR-05: 12 prompts teach a marked `già` word order and no explanation tells the learner the unmarked one

**File:** `content/exercises/fare-indicativo.json:383`, `:393`, `:403`, `:413`, `:423`, `:433`, `:457`, `:467`, `:477`, `:487`, `:497`, `:507`

**Issue:** Because D-41-10 forces every compound option to be exactly two words, `già` cannot sit in its canonical Italian slot between auxiliary and participle, so all 12 trapassato-prossimo / futuro-anteriore prompts put it in front of the blank: "io già ___ i compiti" → *io già avevo fatto i compiti*. `notes:2` documents this as a deliberate consequence of the option format and correctly observes that the preverbal position is grammatical but **marked by focus**. The learner-facing text never says so: the trapassato-prossimo explanation (`:380`) even says the frame comes "casi siempre acompañada del adverbio già" without stating where `già` goes. Concrete failure scenario: 12 of 48 exposures drill a focus-marked order with no correction, and the learner produces `io già avevo fatto i compiti` where an Italian teacher expects `avevo già fatto i compiti` — the tool taught the wrong default. This is a live risk precisely because the app's value proposition is repetition until it sticks.

**Fix:** one sentence in the two affected explanations, e.g. "En el enunciado el già va delante del auxiliar por el formato de las opciones; el orden normal en italiano es avevo già fatto, con el già entre el auxiliar y el participio." No data change needed.

### WR-06: the new category is invisible to the per-category count guard and to the validation reporter — both stay green while ignoring 48 new variants

**File:** `tests/fixtures/slot-variants-integration.test.js:168-185`, `scripts/run-validation-271.mjs:185`

**Issue:** `REAL_CATEGORIES` (14 entries) and the reporter's `CATEGORIES` array were not extended with `fare-indicativo`. Both are hardcoded mirrors of `content/categories.json`. Effects today, verified:

- `slot-variants-integration.test.js` gives every other category a `validateContent` pass **and** a "count did not change" guard; `fare-indicativo` gets neither. The suite-wide bundle validation in `tests/domain.test.js:322` does cover schema (so this is not a schema hole), but the count guard — the mechanism that forces a conscious update when content changes — does not exist for the new 8 slots.
- `scripts/run-validation-271.mjs` keeps reporting its previous total in PASS. `notes:2` acknowledges this ("no se pone rojo, se queda CIEGO al fichero … lo que es peor que un rojo porque parece verde") and defers the sync to Phase 44/INT-02.

Deferring is a legitimate call, but the observable state is a green reporter that under-reports the corpus, which is the failure mode the note itself calls worse than red.

**Fix:** the sync is two one-line additions and does not depend on Phase 44:

```js
// tests/fixtures/slot-variants-integration.test.js
{ slug: 'fare-indicativo', expected: readJson('content/exercises/fare-indicativo.json').exercises.length }
// scripts/run-validation-271.mjs
{ slug: 'fare-indicativo', file: 'content/exercises/fare-indicativo.json', expected: slotCountOf('content/exercises/fare-indicativo.json') },
```
If it must stay deferred, the baseline-guard formula should be made to fail loudly on an exercises file that is present on disk but absent from the array, so "blind" becomes "red".

## Info

### IN-01: two of the four audit-trail tests are 100% vacuous today, and nothing asserts the state the phase actually requires

**File:** `tests/content-fare-indicativo.test.js:579-599`

**Issue:** `SLOTS.filter(x => x.validation.status === 'validated')` yields `[]` and the D-41-12 extra-round test `continue`s on every slot, so both bodies never execute. The file documents this openly (`:554-560`) and the tests do acquire teeth once a status flips, so this is acceptable design — but note what is *not* asserted: the phase's requirement is `status: "pending"` with `passes: []` **now**, and no test says so. The consistency check at `:569` only requires `status === deriveStatus(passes)`, so a hand-edit to `{status: "disputed", passes: [{by:"x", date:"2026-08-03", verdict:"incorrecta"}]}` is self-consistent, passes schema, passes block 11 entirely (the quorum test inspects only `validated` slots) and would go unnoticed.

**Fix:** add a positive assertion for the current contract, e.g. `assert.equal(s.validation.status, 'pending')` and `assert.deepEqual(s.validation.passes, [])` guarded by a comment saying it must be updated deliberately when the quorum runs — or at minimum extend the quorum-shape check to `disputed` slots too.

### IN-02: the hygiene scans never touch the new `categories.json` entry, whose `name` is the string actually rendered in home / picker / Repaso

**File:** `content/categories.json:17`, `tests/content-fare-indicativo.test.js:613-620`

**Issue:** Block 10's angle-bracket / smart-quote / dangerous-key scans walk `CONTENT` only. `CATEGORIES` is read (`:37`) but only checked for key set, `order`, `origen` and a non-empty `name`. The new name `"Fare — indicativo (faccio/feci/ho fatto)"` introduces U+2014, the only non-ASCII punctuation in the file and the only em dash among the 15 entries (siblings use the plain `Name (detail)` shape). Harmless as-is — the render path is `x-text` — but the string that reaches the DOM is the one with no hygiene coverage.

**Fix:** run the same three scans over `CATEGORIES.categories` names in block 12, and either drop the em dash for consistency with the 14 siblings or accept it deliberately.

### IN-03: the periphrasis SCOPE-GATE list covers 4 of the 5 families the notes calls a HARD gate

**File:** `tests/content-fare-indicativo.test.js:92`

**Issue:** `PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel']` maps to *desayunar*, *la compra*, *el tiempo meteorológico* and *arreglárselas*. `notes:2` lists a fifth out-of-scope family — "el causativo con infinitivo" — and there is no marker for it, nor for the other weather collocations (`caldo`, `bel tempo`). The data is clean today; the gate simply would not catch a future `fa fare i compiti` or `fa caldo` variant.

**Fix:** add `'caldo'`, `'bel tempo'` and a causative check (an option or prompt matching `/\bfa(?:nno|te|cciamo)?\s+\w+are\b/`) to the same loop.

### IN-04: the blacklist and other-moods scans are options-only, while the file header promises prompt + options

**File:** `tests/content-fare-indicativo.test.js:13-19` vs `:302-317`

**Issue:** The header states that every absence scan goes "por campo — `variants[].prompt` y `variants[].options[]`". The blacklist (`:307`), other-moods (`:314`) and participle-agreement (`:321`) scans read `v.options` only. Defensible — the stated risk model is about distractors — but a blacklisted or wrong-mood form appearing inside a prompt would not be caught, and the comment overstates the coverage.

**Fix:** either scan `[v.prompt, ...v.options]` for the two exact-match lists (using a word-boundary regex for the prompt side, since these are exact-match lists today) or narrow the header comment to say the blacklist is options-scoped by design.

---

_Reviewed: 2026-08-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
