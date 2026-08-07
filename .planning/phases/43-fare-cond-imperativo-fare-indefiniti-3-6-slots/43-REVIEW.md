---
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
reviewed: 2026-08-07T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - content/exercises/fare-cond-imperativo.json
  - content/exercises/fare-indefiniti.json
  - content/categories.json
  - tests/content-fare-cond-imperativo.test.js
  - tests/content-fare-indefiniti.test.js
  - tests/exercise-types.test.js
  - .claude/skills/gsd-validate-exercise/SKILL.md
  - .claude/skills/gsd-validate-batch/SKILL.md
  - .planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
findings:
  critical: 1
  warning: 11
  info: 7
  total: 19
status: issues_found
---

# Phase 43: Code Review Report

**Reviewed:** 2026-08-07
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Content-authoring phase: two hand-authored exercise categories (9 slots / 35 variants), two
invariant test files (~2 330 lines), one registry entry, two skill path fixes and a new
exceptions section in the quorum validation prompt. `src/` untouched, as declared.

Verification performed for this review:

- `node --test tests/*.test.js` → **995 pass / 0 fail**. `node --test` on the two new files
  alone → 139 pass.
- Every declared invariant from the phase brief was traced by hand against the JSON, not
  taken from the test names: 6/6/5 = 17 and 3/3/4/2/3/3 = 18 counts agree across JSON,
  `notes` prose and `EXPECTED_VARIANTS`; `fa'` is U+0027 (verified byte-wise, also in
  `categories.json:19`); `fai`/`fa` absent from every `options` array; `avere fatto` absent
  from every field; the participio-passato pool is exactly `fatto/fatta/fatti/fatte` with
  only `lo`-series plural clitics; `facente` is exactly 2 variants on the two declared
  compounds; no id carries a 3-digit suffix; all 9 slots are `pending` with `passes: []`
  (expected).
- The three "subtle parts" the executors self-reported were re-derived, not accepted:
  the `matcherDe('fa')` negative-lookahead sibling **is** correct and **is not** disabled
  (traced against `"fa'"`, `"…, fa i compiti…"`); the `{lit, head}` anchor pair **does**
  resolve correctly through `CORTE_DE_CLAUSULA` (`"Ha detto che lui ___ …"` →
  `["Ha detto", " lui ___ …", ""]`, neighbour-segment match hits, `cuantas === 2`); the
  `CONJUGATE` scan is **not** vacuous — it reads 157 real option strings from the three
  sibling JSONs and `POOL ∩ CONJUGATE = ∅` is asserted separately
  (`content-fare-indefiniti.test.js:743`), and a missing sibling file would throw at import.
- `RESET_PREFIXES_V13` (`src/data/storage.js:1345`) already contains both new slugs
  verbatim; the `fare-ind` truncation hazard does not materialise anywhere in `src/`.
- The skill path correction is complete and correct: the new path exists, the old
  directory does not, and `grep` finds zero stale `.planning/phases/09-…` references in
  `.claude/skills/`.

The defects that remain are concentrated in three places: **(a)** one slot ships variants
with two grammatically defensible answers, which is the exact failure mode this project's
cascade punishes hardest; **(b)** several gates are declared "HARD" but cannot bite as
written; **(c)** the new validation-prompt exceptions partly pre-judge the criterion the
quorum exists to check independently.

No `<structural_findings>` block was supplied, so all findings below are narrative.

## Critical Issues

### CR-01: `fare-cond-imperativo-cond-passato` — the aux-swap distractor is a fully valid answer in 4 of 6 variants

**File:** `content/exercises/fare-cond-imperativo.json:97`, `:107`, `:117`, `:137`
(distractor strings at `:100`, `:109`, `:121`, `:139`)

**Issue:** The slot's fixed distractor pattern puts the **trapassato prossimo** of the same
person into every variant ("el mismo participio con el auxiliar en OTRO tiempo"). The file's
own operational rule is explicit: *"lo prohibido es la distractora DEFENDIBLE COMO CORRECTA
en ese contexto"*. In four variants the frame does not exclude that reading — both options
produce natural, standard Italian:

| # | prompt | key | aux-swap | with the aux-swap |
|---|--------|-----|----------|-------------------|
| 1 | `Sapevo che tu ___ i compiti da solo.` | `avresti fatto` | `avevi fatto` | *"Sapevo che avevi fatto i compiti da solo"* — grammatical, and arguably the **default** reading |
| 2 | `Ha detto che lui ___ tutto entro venerdì.` | `avrebbe fatto` | `aveva fatto` | *"Ha detto che aveva fatto tutto entro venerdì"* — grammatical and natural |
| 3 | `A quanto pare noi ___ un errore nel conteggio.` | `avremmo fatto` | `avevamo fatto` | *"A quanto pare avevamo fatto un errore"* — grammatical and natural |
| 5 | `Secondo il giornale loro ___ una foto proibita.` | `avrebbero fatto` | `avevano fatto` | *"Secondo il giornale avevano fatto una foto proibita"* — grammatical and natural |

Only variants 0 and 4 are safe, and only because their adversative tail
(`ma non ho avuto tempo` / `ma alla fine non è successo`) contradicts a completed action.
The two frames that *do not* self-exclude — futuro-nel-passato (`Sapevo che`, `Ha detto che`)
and evidential/rumour (`A quanto pare`, `Secondo il giornale`) — are exactly the two anchor
groups D-43-11 mandates.

This matters because of the project's own cascade: a wrong pick on any variant resets all
17 variants of the category, and if the quorum flags it the slot goes `disputed`, which is
sticky.

**Why no gate caught it:** the phase reasoned only about the *other* distractor family. The
"GATE HARD" of D-43-10 (`tests/content-fare-cond-imperativo.test.js:728-739`) bans the
conditional protasis `se`, which neutralises the **condizionale-presente** calco distractor,
and nothing else. The only assertion about the aux-swap family
(`tests/content-fare-cond-imperativo.test.js:723-726`) checks the six are *distinct from one
another* — never that any frame excludes them. `notes` even claims this slot is deliberately
left out of the extra deepseek round because "su riesgo es de redacción de marco, no de doble
validez de forma"; the redaction of the marco is precisely what is defective.

**Fix:** rework the four frames so the posteriority reading is forced, then freeze it with a
gate. Two mechanically checkable options:

1. Add an explicit posteriority adverbial governed by the hueco clause in the
   futuro-nel-passato variants, and drop the aux-swap from the evidential ones:

```json
{
  "prompt": "Sapevo che tu ___ i compiti il giorno dopo.",
  "options": ["faresti", "avevi fatto", "avresti fatto", "avresti fare"],
  "correctIndex": 2
}
```

2. Or replace the aux-swap in the four unsafe variants with a family that is agrammatical in
   any frame (the slot already has one such family: `avrei fare` / `avresti fare` / …), and
   keep the trapassato only in the two adversative variants.

Then add the missing gate, mirroring the shape of the existing `se` gate:

```js
// Nueva ANCLE_POSTERIORIDAD: conjunto CERRADO de marcadores que excluyen la lectura
// de trapassato. Toda variante que ofrezca un AUX_SWAP tiene que llevar uno.
const ANCLE_POSTERIORIDAD = ['il giorno dopo', 'la settimana dopo', 'entro la sera'];
const ADVERSATIVE = ['ma non ho avuto tempo', 'ma non ho potuto', 'ma alla fine non è successo'];

test('GATE HARD: toda variante con aux-swap excluye la lectura de trapassato', () => {
  const sucio = [];
  eachVariant(PASSATO, (v, k) => {
    if (!v.options.some((o) => AUX_SWAP.includes(o))) return;
    const seguro =
      ADVERSATIVE.some((a) => v.prompt.includes(a)) ||
      ANCLE_POSTERIORIDAD.some((a) => gobiernaElHueco(v.prompt, a));
    if (!seguro) sucio.push(`${PASSATO}#${k}: "${v.prompt}"`);
  });
  assert.deepEqual(sucio, [], 'D-43-10: el trapassato es una segunda respuesta defendible en este marco');
});
```

## Warnings

### WR-01: Postposed-object agreement offered as a wrong answer without audit trail

**File:** `content/exercises/fare-indefiniti.json:101-108` and `:110-118`

**Issue:** The two "invariable" variants offer the agreeing participle as the wrong answer —
`fatti` against `Ieri io ho ___ i compiti con Anna.` and `fatta` against
`Maria ha ___ una torta per la festa.` Agreement of the participle with a **postposed**
direct object (`ho comprata la casa`, `ho fatti i compiti`) is attested in literary and
older Italian; it is rare/marked today, not ungrammatical. The category's own criterion is
"lo prohibido es la distractora DEFENDIBLE COMO CORRECTA", and the sibling case (`avere
fatto`) received a full magnet treatment with blacklist + explanation + audit trail. This one
received none: it is not mentioned in `notes`, not in the explanation, and not in the
validation prompt. Note that this is precisely the slot for which D-43-20 mandates the extra
deepseek round, so a validator *will* raise it, with no declared context to resolve it.

**Fix:** either (a) accept the risk and document it, adding one line to the slot's
`explanation` ("la concordancia con el objeto pospuesto existe en textos literarios pero hoy
no es la norma; aquí se pide siempre la invariable") plus an audit-trail paragraph in
`notes`, and record it as a declared `concern` when the quorum runs; or (b) drop the agreeing
forms from the two invariable variants and use a non-participial distractor from the POOL.

### WR-02: Object-scope gate diverged between the two sibling test files — declared object may not be in the hueco clause

**File:** `tests/content-fare-cond-imperativo.test.js:555`

**Issue:**

```js
if (!v.prompt.includes(obj)) { sucio.push(...); return; }
const clausula = segmentoDelHueco(v.prompt, CORTE_FUERTE);
const enClausula = OBJECTS.filter((o) => clausula.includes(o));
```

Presence of the **declared** object is checked against the whole prompt, while the count is
taken over the hueco clause. A prompt whose hueco clause contains closed-set object *A*
while the table declares *B* sitting in the main clause passes green on both checks
(`prompt.includes(B)` ✓, `enClausula === [A]`, length 1 ✓) — the table would be documenting
a variant it does not describe, which is the exact "intención vs contenido" drift the block
comment claims to prevent. The sibling file written in the same phase got this right
(`tests/content-fare-indefiniti.test.js:619` uses `clausula.includes(obj)`).

**Fix:**

```js
const clausula = segmentoDelHueco(v.prompt, CORTE_FUERTE);
if (!clausula.includes(obj)) { sucio.push(`${id}#${k}: la clausula del hueco no lleva "${obj}"`); return; }
```

### WR-03: `DEITTICI_FUTURO` is an under-specified closed set — the "HARD" gate has a wide hole

**File:** `tests/content-fare-cond-imperativo.test.js:215-218`, gate at `:677-688`

**Issue:** The gate exists because the futuro semplice is a distractor in all six
condizionale-presente variants, so any future marker makes it defensible. But the prohibited
set enumerates only eight literals and misses whole productive families: `entro <día>`,
`tra/fra <periodo>`, `più tardi`, `<día> prossimo/prossima`, `un giorno`, `in futuro`,
`quando + futuro`. This is not hypothetical — **the phase's own content uses one of them**:
`content/exercises/fare-cond-imperativo.json:107` writes `entro venerdì`. It happens to sit
in the condizionale-*passato* slot where the gate does not apply, but it demonstrates that
the author's own vocabulary escapes the enumeration. A future edit moving that phrasing one
slot over would open a double answer with the gate still green.

**Fix:** extend the set with the missing families and add the prefix-form matchers:

```js
const DEITTICI_FUTURO = [
  'domani', 'dopodomani', 'stasera', 'presto',
  'fra poco', 'tra poco', 'la prossima settimana', "l'anno prossimo", 'il mese prossimo',
  'più tardi', 'in futuro', 'un giorno',
];
const DEITTICI_FUTURO_PREFIJO = [/(^|[^\p{L}])entro\s/iu, /(^|[^\p{L}])(tra|fra)\s+\w/iu,
                                 /(^|[^\p{L}])\w+\s+prossim[ao](\b|$)/iu];
```

### WR-04: `causativo` in `PERIPHRASIS` is a dead check that advertises coverage it does not have

**File:** `tests/content-fare-cond-imperativo.test.js:253` (and `:251-252` comment),
`tests/content-fare-indefiniti.test.js:258`

**Issue:** The comment states `` `causativo` se anade a la lista del analogo para cubrir
`fare + infinito` mas alla de `far fare` ``. The check is
`campos.filter((c) => c.toLowerCase().includes('causativo'))` over Italian prompts and
options. The Spanish/Italian metalinguistic noun *causativo* will never appear in an Italian
exercise sentence, so the entry can never fire. An actual causative — `Marco fa riparare la
macchina`, `Prima di far riparare…`, `Io devo far fare i compiti a Marco` — passes cleanly
(`far fare` only catches the elided two-word collocation). The gate's real coverage of the
causative is effectively zero while the comment asserts the opposite.

**Fix:** replace the sentinel word with a structural matcher, or delete it and stop claiming
coverage:

```js
// fare/far + infinito (causativo). Detecta la construccion, no el nombre del fenomeno.
const CAUSATIVO = /(^|[^\p{L}])(fa|fai|fa'|fanno|far|fare|facciamo|fate|farebbe|farei)\s+\p{L}+(are|ere|ire|rre)(\b|$)/iu;
```

### WR-05: Concordance-cue matching ignores the file's own word-boundary discipline

**File:** `tests/content-fare-indefiniti.test.js:221-230`, used at `:779` and `:816`

**Issue:** The file header states, in capitals, that `ne` and `ci` are substrings of dozens
of Italian words so "su escaneo va por palabra suelta". `PRONOMBRES_PROHIBIDOS` honours that
(`wordish`, line 803). `CONCORD_CUES` and `CONCORD_PROHIBIDOS` do not — they use raw
`prompt.toLowerCase().includes(bigrama)` on two-token clitic strings whose first token is a
two-letter clitic. Concrete false positives that are one authoring edit away:

- `'le ha'` matches inside **`Miche`*`le ha`* firmato…**, `Rafae`*`le ha`*…, `quel`*`le ha`*`nno`
- `'la ha'` matches inside `quel`*`la ha`*`…`, `Pao`*`la ha`*`…`
- `'li ho'` matches inside `g`*`li ho`* `detto`

`conCue()` drives the 2 + 2 coherence assert at `:827-840`, which cross-checks the prompt's
cue against the key. A false positive there flips a variant's classification and turns a
correct file red — or, if it lands on the other side, lets a real mismatch through.

**Fix:** route both lists through the existing matcher:

```js
const conCue = () => P().variants.map((v) => CONCORD_CUES.some((c) => wordish(c).test(v.prompt)));
// …
const hits = CONCORD_PROHIBIDOS.filter((b) => wordish(b).test(v.prompt));
```

### WR-06: `09-VALIDATION-PROMPT.md` §7.2 pre-judges C2 on the highest-risk slot of the phase

**File:** `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md:301`

**Issue:** The new text ends with *"su ausencia es precisamente lo que garantiza que hay UNA
sola opción defendible, así que **C2 se cumple gracias a ellas y no a pesar de ellas**"*. C2
(`una_opcion`) is the criterion the quorum exists to adjudicate independently, and the slot
this sentence is about is the one the phase itself designates as its double-validity hot spot
(`EXTRA_ROUND_SLOTS = [IMPERATIVO]`, D-43-20, `tests/content-fare-cond-imperativo.test.js:265`).
The prompt is supposed to supply the **missing fact** the subagent cannot see (why the two
forms are absent); instead it also supplies the **verdict**. A validator that internalises
this sentence has been told not to look for a second defensible answer on the exact slot
where one is most likely — and CR-01 above shows the phase's C2 reasoning is not infallible.

**Fix:** keep the fact, drop the conclusion:

```md
**Marcar como distractora plausible ausente cualquiera de esas tres es un FALSO POSITIVO** de C3.
Evalúa C2 con normalidad sobre las opciones que SÍ están presentes: la ausencia de esas tres
formas no es en sí misma prueba de que las cuatro restantes dejen una sola respuesta defendible.
```

### WR-07: §7.2 states the exception by description instead of by literal, and omits the clitic family

**File:** `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md:294-299`

**Issue:** Two problems in the same block.

1. The exempt forms are never written down. §7.2 says *"las dos formas alternativas del
   imperativo de 2ª persona del singular de `fare` … (las que compiten con la forma
   apostrofada elegida como key)"* — never `fai` and `fa`; and *"la grafía no elidida del
   infinito compuesto"* — never `avere fatto`. The whole reason the exception lives in this
   file is that the subagent runs with empty context and cannot read `notes`; re-introducing
   an inference step is the failure mode the project already recorded (*"el síntoma = el
   modelo marca un patrón y aprueba otro idéntico"*).
2. The exception is narrower than the source. `content/exercises/fare-cond-imperativo.json`
   places the clitic family under the **same** RECONOCER-NO-PRODUCIR principle ("y en menor
   grado las formas con clítico") and blacklists `fallo`, `fammi`, `fatelo`, `facci`; §7.2
   does not cover them, so a validator flagging "falta una distractora plausible: `fallo`"
   is raising an uncovered false positive.

Related but smaller: §7.1's list of still-prohibited periphrases is given as Spanish
paraphrase (`desayuno, compra, frío, pronominal, causativo`) rather than the Italian literals
the validator will actually be looking at.

**Fix:**

```md
1. las formas `fai` y `fa` (imperativo de 2ª persona del singular de `fare`), que compiten
   con la key apostrofada `fa'`;
2. la grafía no elidida `avere fatto` del infinito compuesto, que compite con la key `aver fatto`;
3. las formas con clítico aglutinado `fallo`, `fammi`, `fatelo`, `facci`, por el mismo principio.
```

…and in §7.1: `fare colazione`, `fare la spesa`, `fare freddo`, `farcela`, `fare + infinito`.

### WR-08: Four near-copies of the same test harness; drift is already present

**File:** `tests/content-fare-cond-imperativo.test.js` / `tests/content-fare-indefiniti.test.js`
(and the pre-existing `tests/content-fare-congiuntivo.test.js`)

**Issue:** Measured: **201 of the 719** substantive (>25 char) lines of the cond-imperativo
test appear verbatim in the indefiniti test, and **175** appear verbatim in the pre-existing
congiuntivo test. The shared surface includes `wordish`, `CORTE_FUERTE`, `segmentoDelHueco`,
the `walk()` string/key collector, the whole "audit trail de validación" describe block
(byte-identical apart from the slot count), and the whole "registro de la categoría" block.
With `fare-indicativo` that is four copies of ~200 lines, and Phase 44 will add a fifth.

This is not a style complaint: **WR-02 is the drift**. One copy of the object-scope gate was
tightened and the other was not, in the same phase, by two executors working from the same
pattern. A fix applied to one copy will not reach the other four.

**Fix:** extract to `tests/helpers/content-invariants.js` and import:

```js
export const wordish = (s) => new RegExp(`(^|[^\\p{L}])${escape(s)}([^\\p{L}]|$)`, 'iu');
export const CORTE_FUERTE = /[,;.:—–]+/u;
export const segmentoDelHueco = (p, corte = CORTE_FUERTE) => p.split(corte).find((s) => s.includes('___')) || '';
export const describeAuditTrail = (SLOTS, extraRoundSlots) => { /* bloque 12 completo */ };
export const describeRegistroCategoria = (SLUG, SLOTS, CATEGORIES, order) => { /* bloque 13 */ };
```

### WR-09: The gerundio-passato exclusion rule is enforced by index, and its stated reason is contradicted by the data

**File:** `tests/content-fare-indefiniti.test.js:937-948`, content at
`content/exercises/fare-indefiniti.json:231-241` and `:242-251`

**Issue:** The rule is *"el gerundio simple entra en las opciones del gerundio passato SOLO
en la variante temporal, donde el adverbial de anterioridad lo hace agramatical; en la causal
y en la concesiva no entra, porque … el marco causal admite también la lectura de
contemporaneidad."* But the causal variant (`#1`) carries **`il giorno prima`** — the very
same class of anteriority adverbial as the temporal variant's `la sera prima`, and both are
members of `ADVERBIALI_ANTERIORITA` (`:243`). If that adverbial makes `facendo`
ungrammatical in `#0`, it does so in `#1` too; the stated reason does not distinguish them.

Consequence: `flags[GER_PASS_CON_SIMPLE]` pins the asymmetry to a hard-coded index (`:275`)
rather than to the property that supposedly justifies it, so the gate freezes an arbitrary
choice and a future re-pass reading the comment will find it does not describe the content.
Separately, `Facendo i compiti la sera prima, io ho potuto dormire fino a tardi` is marked
but not clearly ungrammatical, which makes `#0` the weaker of the two — record it as a
quorum concern.

**Fix:** derive the flag from the property, not the index:

```js
test('el gerundio SIMPLE solo entra donde un adverbial de anterioridad lo excluye', () => {
  const sucio = [];
  byId(GER_PASS).variants.forEach((v, k) => {
    const ofrece = v.options.includes('facendo');
    const conAdverbial = ADVERBIALI_ANTERIORITA.some((a) => v.prompt.includes(a));
    if (ofrece && !conAdverbial) sucio.push(`${GER_PASS}#${k}: ofrece facendo sin adverbial de anterioridad`);
  });
  assert.deepEqual(sucio, [], 'INDEF-04');
});
```

…and reconcile the `notes` rationale with whichever asymmetry survives.

### WR-10: The singular vocative markers are not as unambiguous as the "GATE DE VOCATIVO INEQUÍVOCO" claims

**File:** `content/exercises/fare-cond-imperativo.json:161` and `:171`

**Issue:** `notes` builds an explicit safety argument for the two **plural** variants:
because a plural courtesy vocative also admits the `voi` form, variant 4 additionally carries
the capitalised `Loro`, and the exhortative carries `noi due`. Both singular variants got no
equivalent treatment, yet both have a comparable residual reading:

- `Marco, ___ una foto al gruppo!` — key `fa'`, distractor `faccia`. First name + `Lei` is
  ordinary contemporary Italian (superior→subordinate, professional register), so `faccia`
  is not excluded by the vocative alone; only the `!` and the casual `al gruppo` tilt it.
- `Signor Rossi, ___ il lavoro con calma.` — key `faccia`, distractor `fate`. The *voi di
  cortesia* to a single addressee is attested (historical, and still southern-regional).
  Weaker than the previous one, but it is the same class of collision the notes mitigated
  for the plural.

The gate that "freezes" this (`:453-466`) only checks that exactly one marker from the closed
set is present — it cannot detect that a marker under-determines the register.

**Fix:** strengthen the two singular prompts with a register cue the way the plurals were
strengthened, e.g. `Marco, dai, ___ una foto al gruppo!` (informal discourse marker, mirrors
the `Dai,` already used in variant 2) and `Signor Rossi, ___ il lavoro con calma, se Lei
preferisce.` (explicit `Lei`, mirroring the `Loro` of variant 4). Then extend the block-3
test with the two extra literals the way `:468-482` already does for the plurals.

### WR-11: The `TOTAL_EXPECTED` knock-on note attributes the delta to the wrong categories

**File:** `content/exercises/fare-cond-imperativo.json:2` and
`content/exercises/fare-indefiniti.json:2` (identical sentence in both)

**Issue:** Both files write, explicitly "para que no haya que recalcularlo" in Phase 44:
*"con esta categoría y con fare-indefiniti … TOTAL_EXPECTED pasa de 225 a 247."* The number
247 is right (verified: 247 slots on disk across all 18 content files), but the attribution
is wrong. `scripts/run-validation-271.mjs:173-188` lists **14** categories summing to 225 —
`fare-indicativo` (8 slots) and `fare-congiuntivo` (5 slots) are missing from it too. The
delta of 22 is *four* categories, not two. A Phase-44 executor following the note literally
adds only the two Phase-43 categories and lands on 234, silently leaving the reporter blind
to two more.

Aggravating: the coherence guard at `:205-206` sums `slotCountOf` **over `CATEGORIES`** on
both sides, so it is structurally incapable of detecting an omitted category and would not
flag the mistake.

**Fix:** correct the sentence in both `notes` to name all four missing categories, e.g.
*"TOTAL_EXPECTED pasa de 225 a 247 al añadir las CUATRO categorías de fare que faltan en
`scripts/run-validation-271.mjs`: fare-indicativo (8), fare-congiuntivo (5),
fare-cond-imperativo (3) y fare-indefiniti (6)."* Phase 44 should additionally add a guard
that compares `CATEGORIES.length` against the number of `*.json` files in
`content/exercises/`.

## Info

### IN-01: Two more tautological entries added to the explanation-coverage count gate

**File:** `tests/exercise-types.test.js:1361-1364`, assertion at `:1390-1395`

**Issue:** `expected: slotCountOf('…/fare-cond-imperativo.json')` and the indefiniti twin
resolve the same path that `data` resolves, at the same moment, so
`assert.equal(data.exercises.length, expected)` compares a file with itself. The tautology is
pre-existing and explicitly documented (`:1328-1334`), and count-sync is Phase 44's
deliverable — but these two new entries contribute zero count protection while reading as if
they do.

**Fix:** none required this phase; when INT-02 lands, replace the dynamic `expected` with the
literal that the dedicated content test already pins (17 / 3 slots and 18 / 6 slots), so the
smoke gate becomes an independent second opinion.

### IN-02: `assert.equal(({}).polluted, undefined)` cannot fail

**File:** `tests/content-fare-indefiniti.test.js:1020`

**Issue:** Nothing in the test — or in the content — ever attempts to set `polluted` on
`Object.prototype`, so the assertion holds regardless of the JSON's contents. It reads as
prototype-pollution coverage but provides none; the real protection is the key scan on the
preceding line.

**Fix:** either drop it, or make it actually exercise the risk:

```js
const merged = {};
const deepMerge = (t, s) => { for (const k of Object.keys(s)) { /* merge ingenuo */ } };
deepMerge(merged, CONTENT);
assert.equal(({}).polluted, undefined);
assert.equal(Object.getPrototypeOf(merged), Object.prototype);
```

### IN-03: Test name promises an adjacency check the body does not perform

**File:** `tests/content-fare-indefiniti.test.js:842-850`

**Issue:** `'las 2 variantes de concordancia usan el cue declarado en la tabla, adyacente al
hueco'` only runs `assert.ok(CONCORD_CUES.includes(f.cue))` — set membership of a constant
against another constant. It never reads the prompt, so it checks neither "declarado en la
tabla" against the content nor "adyacente al hueco". Adjacency is in fact covered at
`:495-514`, so the coverage exists; the name is what misleads.

**Fix:** rename to `'los cues de concordancia salen del conjunto CERRADO de bigramas admitidos'`,
or add the adjacency assertion locally.

### IN-04: Asymmetric hygiene coverage between the two files of the same phase

**File:** `tests/content-fare-cond-imperativo.test.js:886-968` vs
`tests/content-fare-indefiniti.test.js:994-1082`

**Issue:** The indefiniti file asserts the R2 cross-ref ban on explanations
(`!/#\d{3}|mc-\d+/`, line 1029) and the prototype assertion (line 1020); the cond-imperativo
file has neither. The cond-imperativo header says R2 lives in the shared smoke test — which
is true, and makes the indefiniti copy the redundant one — but the two files disagree about
where the boundary is, which is the same copy-drift symptom as WR-08.

**Fix:** pick one convention and apply it to both (extraction per WR-08 makes this automatic).

### IN-05: `REAL_FORMS` is missing `facenti`, so a real form would count as invented

**File:** `tests/content-fare-cond-imperativo.test.js:176-188`

**Issue:** `REAL_FORMS` is the reference set that decides whether a distractor is genuinely
non-existent (`inexistentes = resto.filter((o) => !REAL_FORMS.has(o))`, lines 670 and 716).
It lists `facente` at line 186 but not `facenti`, even though `NO_PERSONALI` at line 209 does
list it. If `facenti` were ever used in this category the gate would classify a real Italian
form as invented and stay green. No current impact.

**Fix:** add `'facenti'` to the `REAL_FORMS` set literal.

### IN-06: The RAE-accent gate is satisfied by a single accented character

**File:** `tests/content-fare-cond-imperativo.test.js:928`,
`tests/content-fare-indefiniti.test.js:1028`

**Issue:** `assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/)` passes as soon as one accented
character exists anywhere in a 900–1 800 character text. The failure mode the project actually
recorded (`explanations_must_be_accented`: systematically unaccented Spanish flagged by the
quorum as a *real* bug, not a false positive) would sail through — an explanation with `así`
in the first sentence and no other tildes is green. The nine current explanations are fine;
the gate is what is weak.

**Fix:** make it density-based, e.g. require at least one accent per ~250 characters, or scan
for a list of high-frequency Spanish words that must be accented in the text
(`también`, `más`, `así`, `está`, `qué`, `según`, `únic`, `práctic`) and assert none of their
unaccented spellings appear as standalone words.

### IN-07: The `notes` blobs are ~13 KB and ~17 KB single-line JSON strings shipped to the browser

**File:** `content/exercises/fare-cond-imperativo.json:2`,
`content/exercises/fare-indefiniti.json:2`

**Issue:** Both `notes` are one unbroken line each. They are authoring metadata never rendered
in the UI, yet they are part of the JSON the content loader fetches and parses on every boot,
and they are effectively undiffable — a one-word change produces a single-line diff of the
whole blob, which is exactly the review surface where an accidental edit to an audit-trail
claim would go unnoticed. The pattern is inherited from Phases 41/42, so this is consistency,
not novelty.

**Fix:** out of scope for this phase, but worth a backlog item: move the audit trail to a
sidecar `content/exercises/<slug>.notes.md` and keep only a short pointer in the JSON, or have
the loader drop `notes` after the tests that read it. Note that both test files read
`CONTENT.notes` for positive audit-trail assertions, so a sidecar would need the same reads
repointed.

---

_Reviewed: 2026-08-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
