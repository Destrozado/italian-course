---
phase: 44-integraci-n-lockstep-cierre-v2-0
reviewed: 2026-08-12T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - content/exercises/fare-indefiniti.json
  - content/exercises/fare-indicativo.json
  - scripts/run-validation-271.mjs
  - tests/content-fare-indefiniti.test.js
  - tests/content-fare-indicativo.test.js
  - tests/count-arrays-lockstep.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 4
  warning: 13
  info: 0
  total: 17
status: issues_found
---

# Phase 44: Code Review Report

**Reviewed:** 2026-08-12
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

The phase's stated purpose is to kill the lockstep lie: a registered category can no
longer disappear from the count arrays without something going red. The suite is green
(`# tests 1092 / # pass 1092 / # fail 0`) and `run-validation-271.mjs` prints
`VAL-06 (250/250 validated): PASS`.

Neither of those facts is evidence. Every finding below was **reproduced by mutation**
against the working tree and then reverted; the repo is back to its pre-review state
(only the pre-existing `.planning/config.json` edit remains).

The headline result: **the exact historical bug this phase exists to prevent still
reproduces, with the exact same number.** Block-commenting the four `fare` entries out
of the reporter's `CATEGORIES` makes it print `VAL-06 (225/225 validated): PASS` —
`225/225`, verbatim the figure `tests/count-arrays-lockstep.test.js:19` cites as the
three-phase blindness — while `count-arrays-lockstep.test.js` itself stays at
`# pass 19 / # fail 0`. The gate hardening of G-44-3-WR01 closed `//` and left `/* */`
open, and `/* */` is the more plausible gesture of the two because it is what an editor's
"toggle block comment" produces over a multi-line selection.

Three further Critical findings: `fare-indefiniti-300` has no key↔person gate at all
(the CR-02 fix was applied to the sibling only, and a mutated `correctIndex` teaching the
wrong modal passes all 1092 tests); the reporter's `effectiveStatus` bypasses the
mandatory `override: true` flag and will emit `Milestone gate PASS` over an exercise the
single source of truth calls `disputed`; and the object-presence gates match by raw
substring, so a prompt with **no direct object at all** passes because `soprattutto`
contains `tutto`.

Cross-cutting pattern worth naming, because it recurs in all three test files: **the
prose is more careful than the code.** Several comments declare, in capital letters, an
invariant the adjacent line does not implement (`//` vs `/* */`; `[^\S\n]` vs `\s*`;
"NINGUN cue se compara con `includes`" three lines above four raw `includes` calls; "la
prohibicion ciega de la inicial f- era FALSA" 2000 lines above a surviving `/^f/i`). In a
codebase where the tests *are* the enforcement mechanism, a comment that over-promises is
the same defect class as a gate that under-checks.

## Structural Findings (fallow)

No `<structural_findings>` block was supplied with this review request. All findings below
are narrative (direct-inspection + mutation) findings.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: The anti-blindness gate is blind to block-commented entries — the 225/225 bug reproduces verbatim

**File:** `tests/count-arrays-lockstep.test.js:100-107` (and `:124-128`)

**Issue:** `slugsCiegos` anchors on a line that opens with horizontal whitespace then `{`.
The file's own justification (lines 84-89) claims this defeats a commented-out entry:
*"Una entrada comentada NO satisface el ancla nueva porque el `//` no es whitespace y por
tanto la linea no abre con `{`."*

That reasoning only holds for **line** comments. A `/* … */` block leaves the wrapped
lines byte-identical — they still open with whitespace then `{` — so the anchor matches and
the category is reported as hooked while the reporter has stopped counting it.
`paresSlugFile` has the same hole, so the new non-vacuity clause at `:420-426` also stays
green (the phantom pairs still count toward `pares.length`).

Reproduced end-to-end. Wrapping the four `fare` entries of
`scripts/run-validation-271.mjs:184-187` in `/* */`:

```
--- reporter with the 4 fare entries BLOCK-COMMENTED ---
  VAL-06 (225/225 validated): PASS
  Milestone gate PASS.
--- the anti-blindness gate ---
# tests 19
# pass 19
# fail 0
```

`225/225 PASS` is the exact string the header of this very file cites as the bug that ran
for three phases. The coherence guard at `run-validation-271.mjs:213-223` cannot see it
either, because both sides of its subtraction iterate the *same* (now shorter)
`CATEGORIES`. This is a `/* */` away from a fourth repetition, and the file that exists as
*"lo UNICO que impide la cuarta repeticion"* certifies it green.

Also confirmed in isolation:

```js
slugsCiegos(SRC_BLOCK_COMMENT, ['fare-indefiniti','fare-indicativo'])  // => []  (expected both)
paresSlugFile(SRC_BLOCK_COMMENT)                                       // => 2 phantom pairs
```

**Fix:** strip comments before anchoring, rather than trying to encode "not a comment" in
the anchor. A tokenizer is overkill; a two-pass blank-out is enough and is testable:

```js
// Reemplaza el contenido de comentarios de bloque y de linea por espacios,
// PRESERVANDO los saltos de linea para que el flag `m` y los numeros de linea
// sigan valiendo. Va PRIMERO, y los goldens de abajo lo prueban en las dos formas.
const sinComentarios = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '));

export function slugsCiegos(src, slugs) {
  const limpio = sinComentarios(src);
  return slugs.filter((slug) => {
    const anclado = new RegExp(
      `^[^\\S\\n]*\\{[^\\n]*slug:[^\\S\\n]*(['"\`])${escapeRe(slug)}\\1`, 'm'
    );
    return !anclado.test(limpio);
  });
}
// paresSlugFile aplica el MISMO `sinComentarios` sobre `src` antes del matchAll.
```

Then add the two missing fail-first goldens next to `SRC_COMENTADO` — one for `/* */`
around a single entry and one around a run of entries — because the current golden set is
what made this hole look closed.

---

### CR-02: `fare-indefiniti-300` has no key↔person gate — a mutated `correctIndex` teaching the wrong modal passes all 1092 tests

**File:** `tests/content-fare-indefiniti.test.js:2160-2413` (missing gate); content at
`content/exercises/fare-indefiniti.json` (`fare-indefiniti-300`)

**Issue:** The sibling file closed exactly this hole for its own crosses — see
`tests/content-fare-indicativo.test.js:995-1046`, *"El gate que ataba
`options[correctIndex]` a la persona del sujeto vivia en el bloque del paradigma y la
particion lo re-apunto a BASE_SLOTS, asi que los cruces se quedaron SIN el … Este lo
cierra. Es el gate mas importante de los cruces."* Block 14 of `fare-indefiniti` never
gained the counterpart. Its twelve gates check that options are modal-stemmed
(`:2383`), that there are 4 distinct options (`:2320`), that `correctIndex` is in range and
not constant (`:2325-2335`), and that exactly one disambiguating complement is present
(`:2390`) — but **nothing ties the key to the subject or to the complement.**

Reproduced. Moving `fare-indefiniti-300` variant 1 (`Qui tu ___ fare una foto, perché il
museo dà il permesso.`) from `correctIndex: 2` (`puoi`) to `correctIndex: 3` (`possono`) —
wrong person *and* wrong modal — leaves the whole suite green:

```
# tests 1092
# pass 1092
# fail 0
```

The exercise now teaches that `tu … possono` is correct, and by the D-54 cascade a failure
on it resets `fare-indefiniti` **and** `modali`. Note that the person gate at `:2297-2303`
cannot help: it reads `(v.prompt.match(PRONOUN_RE) || [''])[0]` — the **first** pronoun in
the whole prompt — which is the very defect CR-02 diagnosed and fixed in the sibling with
`personaDelHueco`. It is green today only because each of the three prompts happens to
carry exactly one pronoun.

**Fix:** port both halves from the sibling. The person of the hole first:

```js
// El sujeto del hueco es el ULTIMO pronombre ANTES del hueco, nunca el primero del
// prompt (CR-02, cerrado en el fichero hermano y no aqui).
const personaDelHueco = (prompt) => {
  const hits = prompt.split('___')[0].match(PRONOUN_RE) || [];
  return hits.length ? hits[hits.length - 1].toLowerCase() : '';
};
```

then the gate the block is missing — and it has to check **both** axes, because in this
cross the person alone does not single out the answer (`devo`/`posso` are both 1sg in
variant 0):

```js
test('la KEY concuerda con la persona del sujeto DEL HUECO y con el modal que el complemento EXIGE (D-44-02, D-44-04)', () => {
  const PERSONA_DE = { // por raiz+desinencia, mapeo cerrado de los 3 modales
    devo:'io', devi:'tu', deve:'lui', dobbiamo:'noi', dovete:'voi', devono:'loro',
    posso:'io', puoi:'tu', può:'lui', possiamo:'noi', potete:'voi', possono:'loro',
    voglio:'io', vuoi:'tu', vuole:'lui', vogliamo:'noi', volete:'voi', vogliono:'loro',
  };
  const MODAL_DEL_COMPLEMENTO = { altrimenti:'dev', permesso:'poss', desiderio:'vogl' };
  const variantes = byId('fare-indefiniti-300').variants;
  assert.ok(variantes.length > 0, 'no-vacuidad: sin variantes este gate no mira nada');
  for (const [k, v] of variantes.entries()) {
    const key = v.options[v.correctIndex];
    const p = personaDelHueco(v.prompt);
    assert.equal(PERSONA_DE[key], p,
      `#${k}: sujeto "${p}" y key "${key}", que es de la persona "${PERSONA_DE[key]}": "${v.prompt}"`);
    const compl = COMPLEMENTOS_QUE_EXCLUYEN.find((m) => wordish(m).test(v.prompt));
    assert.ok(key.startsWith(MODAL_DEL_COMPLEMENTO[compl]),
      `#${k}: el complemento "${compl}" exige el modal ${MODAL_DEL_COMPLEMENTO[compl]}- y la key es "${key}"`);
    // Y ninguna distractora puede satisfacer las DOS cosas a la vez.
    const tambien = v.options.filter((o) => o !== key &&
      PERSONA_DE[o] === p && o.startsWith(MODAL_DEL_COMPLEMENTO[compl]));
    assert.deepEqual(tambien, [], `#${k}: segunda respuesta defendible: ${tambien.join(', ')}`);
  }
});
```

Verify by mutation before committing: flip `correctIndex` on each of the three variants and
confirm three distinct reds.

---

### CR-03: `effectiveStatus` bypasses the mandatory `override: true` flag — `Milestone gate PASS` over a `disputed` exercise

**File:** `scripts/run-validation-271.mjs:238-245`

**Issue:** `deriveStatus` (`src/data/validation-state.js`) is the documented single source
of truth (WR-01) and its contract is explicit: an override is *"una entry con
`by: "autor"`, `verdict: "correcta"` y `override: true`. El flag es OBLIGATORIO y
explícito … para que el override nunca ocurra por accidente"*, and it *"NO fabrica
quórum"* — it still requires ≥2 distinct `correcta` including one from a model.

`effectiveStatus` reimplements the relax and drops all three guards: it only looks for
`p?.by === 'autor' && p?.verdict === 'correcta'`. No `override: true`, no quorum check, no
model-pass check. Since the reporter counts by `effectiveStatus` and treats the
written-vs-derived mismatch as a **printed warning only** (`:338-340`, `:419-421`), the
milestone gate will green-light an exercise the source of truth calls `disputed`:

```
passes = [opus:correcta, sonnet:correcta, deepseek:incorrecta, autor:correcta]  // no override flag
deriveStatus (source of truth) = disputed
reporter effectiveStatus       = validated
VAL-04 distinct by = 3  (>= 2, so VAL-04 PASSES)
=> VAL-08 sees 0 disputed; Milestone gate PASS
```

The comment at `:227-236` justifying the relax describes the pre-G-42-3 world ("D-VAL-25
camino b escribe `validation.status = "validated"` directo en el JSON sin tocar
`passes[]`"). That world is gone: `deriveStatus` has handled the override natively since
Phase 42. `effectiveStatus` is now redundant *and* strictly weaker than the function it
wraps, and it is the last gate before `/gsd:complete-milestone`.

**Fix:** delete the duplicate and defer to the source of truth.

```js
// v2.0: `deriveStatus` implementa el override del autor desde G-42-3 (flag
// `override: true` OBLIGATORIO, sin fabricar quorum). El relax local de path-B ya
// no hace falta y era mas PERMISIVO que la fuente unica: aceptaba cualquier pase
// `by:"autor"` sin el flag, sin quorum y sin ningun pase de modelo.
const effectiveStatus = (passes) => deriveStatus(passes);
```

(or drop the indirection and call `deriveStatus(passes)` at `:312`). Then promote the
written-vs-derived mismatch from warning to a fourth sub-gate, so the reporter cannot
print PASS while disagreeing with the JSON it just read.

---

### CR-04: object-presence gates match by raw substring — `soprattutto` satisfies `tutto`, so a prompt with no object passes

**File:** `tests/content-fare-indefiniti.test.js:938-939` and `:2353`;
`tests/content-fare-indicativo.test.js:424` and `:1096`

**Issue:** `tests/content-fare-indefiniti.test.js:30-39` declares the rule in capitals:
*"en este fichero NINGUN cue se compara con `includes`, `endsWith` ni `startsWith` a pelo …
Un gate de presencia matcheado por subcadena no se pone rojo: deja de morder, que es peor,
porque aprueba en silencio la variante futura que existia para cazar."* Four object gates
break exactly that rule, and `tutto` — a member of `OBJECTS` — is a substring of
`soprattutto` and `tuttora`, two ordinary Italian words.

Reproduced. Replacing the object in `fare-indefiniti-gerundio-presente` variant 2 with a
word that merely *contains* it (`___ tutto in fretta …` → `___ soprattutto in fretta …`)
leaves the file green:

```
# tests 108 / # pass 108 / # fail 0
```

The variant now has no direct object for `fare` at all, and the gate that exists to
guarantee one certifies it. The defect cuts both ways — it also produces false reds:

```js
'Soprattutto io ___ i compiti in fretta'  ->  ['i compiti', 'tutto']
// tests/content-fare-indefiniti.test.js:940 asserts enClausula.length === 1  =>  RED
'Lui ___ soprattutto ogni giorno'         ->  ['tutto']       // no object, gate green
```

so a legitimate future prompt opening with `Soprattutto` goes red with the message
"2 objetos en la clausula del hueco", and the plausible next move is to relax the gate.

**Fix:** route all four call sites through the `wordish` matcher the file already owns
(`:143-144`). It is Unicode-aware and it is the tool the header mandates.

```js
// tests/content-fare-indefiniti.test.js:938-942
const clausula = segmentoDelHueco(v.prompt);
if (!wordish(obj).test(clausula)) { sucio.push(`${id}#${k}: la clausula del hueco no lleva "${obj}"`); return; }
const enClausula = OBJECTS.filter((o) => wordish(o).test(clausula));

// :2353 y content-fare-indicativo.test.js:424 / :1096
OBJECTS.some((o) => wordish(o).test(v.prompt))
```

Add a golden that pins the discrimination, so the hole cannot reopen silently:

```js
test('golden: `soprattutto` NO cuenta como el objeto `tutto` (CR-04)', () => {
  assert.ok(!wordish('tutto').test('___ soprattutto in fretta'));
  assert.ok(wordish('tutto').test('___ tutto in fretta'));
});
```

---

## Warnings

### WR-01: a third hardcoded count array sits outside the anti-blindness gate, and the gate cannot parse it

**File:** `tests/count-arrays-lockstep.test.js:45-48`, `:437-464`

**Issue:** `COUNT_ARRAY_SOURCES` is a hardcoded list of two files, and the header states
flatly *"Las DOS fuentes de conteo"*. There is a third: `CATEGORIES_WITH_EXPLANATIONS` in
`tests/exercise-types.test.js:1338-1366`, an 18-entry array of `{ file, expected }` whose
`expected` gates `data.exercises.length` at `:1391`. It is complete today, but nothing
makes a 19th category appear in it. Worse, the gate's second test claims to name any
uncovered source — *"Una fuente que no haga ninguna de las dos cosas es un canal de
ceguera NUEVO, y eso es exactamente lo que este gate existe para nombrar"* — while the
enumeration it iterates is a literal of length 2, so a new channel is unnameable by
construction. And `CATEGORIES_WITH_EXPLANATIONS` keys by `file` with no `slug:` key, so
merely appending it to `COUNT_ARRAY_SOURCES` would report all 18 categories blind.

**Fix:** discover sources instead of listing them, and make `slugsCiegos` accept either
shape. Minimum viable version — anchor on `content/exercises/<slug>.json` as an
alternative identity when no `slug:` key is present:

```js
// Un slug esta anclado si la entrada lo nombra por la clave `slug:` O por la RUTA
// de su fichero: hay arrays de conteo que solo declaran `file` (CATEGORIES_WITH_EXPLANATIONS).
const anclas = (slug) => [
  new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:[^\\S\\n]*(['"\`])${escapeRe(slug)}\\1`, 'm'),
  new RegExp(`^[^\\S\\n]*\\{[^\\n]*content/exercises/${escapeRe(slug)}\\.json`, 'm'),
];
```

and add a source-assert that *no other* file under `tests/` or `scripts/` contains a
`{ … expected: … }` entry list, so the third channel cannot be joined by a fourth in
silence.

---

### WR-02: `pareceFare` still assumes no legitimate f-initial word can appear in a cross pool

**File:** `tests/content-fare-indicativo.test.js:256-259`;
`tests/content-fare-indefiniti.test.js:298-299`

**Issue:** WR-02 correctly identified the premise as false and subtracted the `essere`
passato remoto. The subtraction is not the general fix, because the premise was not
specifically about `essere` — it was *"en los pools de los cruces … no hay ninguna palabra
legitima con inicial f-"*, and Italian regular verbs beginning with `f-` are ordinary
(`finire`, `firmare`, `fumare`, `finanziare`). `fare-indicativo-301`'s pool is four
persons of a regular verb (`ripasso/ripassi/ripassiamo/ripassano` today); the day the
authoring picks `finire`, `pareceFare('finiamo')` is `true` and the G1/G2 gate at
`:1118-1127` goes red with the same false diagnosis WR-02 removed — *"mete una forma de
fare en options"* — and the `CRUCES_AJENOS` gate at
`tests/content-fare-indefiniti.test.js:1051-1084` goes red at the same time with a second
false message.

**Fix:** stop guessing from the initial letter and derive the actual thing being tested.
The set of `fare` forms is already computable from disk:

```js
// Las formas de `fare` de las CUATRO categorias, leidas del disco: es lo que el gate
// dice prohibir. La inicial f- era un proxy, y un proxy que muerde `finiamo`.
const FORMAS_DE_FARE = new Set(
  ['fare-indicativo','fare-congiuntivo','fare-cond-imperativo','fare-indefiniti']
    .flatMap((f) => JSON.parse(readFileSync(new URL(`../content/exercises/${f}.json`, import.meta.url),'utf-8'))
      .exercises.filter((s) => !/-\d{3}$/.test(s.id))
      .flatMap((s) => s.variants.flatMap((v) => v.options.flatMap((o) => o.split(/\s+/)))))
);
const pareceFare = (w) => FORMAS_DE_FARE.has(w.toLowerCase());
```

If the initial-letter proxy is kept deliberately, say so in the comment and add a golden
asserting the *known* false positive (`assert.ok(pareceFare('finiamo'))` with a comment
explaining it is accepted), so the next reader is not told the problem is solved.

---

### WR-03: the G3 gate still carries the blind `/^f/i` the same file calls FALSE

**File:** `tests/content-fare-indefiniti.test.js:2369-2381` (line `:2378`)

**Issue:** `pareceFare` is defined at `:299` of this file and used at `:1081`, under a
25-line comment (`:277-297`) explaining that the blind f- prohibition is false and
produced a false red. The G3 gate 2000 lines later ignores it:

```js
const sucio = v.options.filter((o) => o.split(/\s+/).some((w) => /^f/i.test(w)));
```

and its comment at `:2373-2375` re-asserts the retracted premise as fact: *"Se prohibe la
inicial f- entera y no una lista de formas, porque toda forma de `fare` empieza por f- y en
un pool de modales conjugados no hay ninguna palabra legitima con esa inicial."* Two gates
in one file, one hardened and one not, with contradictory comments — the pattern this
project's memory records as *"el modelo marca un patron y aprueba otro identico"*.

**Fix:** use `pareceFare` at `:2378` (or the derived set from WR-02) and delete the
retracted justification from the comment, replacing it with a pointer to `:277-297`.

---

### WR-04: `250` in the `notes` is transcribed, not derived — the exact number CR-01 was about is still unanchored

**File:** `tests/content-fare-indefiniti.test.js:1146-1187`

**Issue:** The CR-01 (Phase 44) fix is half done. The comment promises *"se comprueba
contra el DISCO para que el literal no pueda divergir otra vez sin ponerse rojo"*, and the
disk anchor at `:1164-1186` does derive `fare`'s own two numbers (`25 slots`, `122`
variants). But `250` — the project-wide `TOTAL_EXPECTED`, i.e. **the number that went
stale and caused CR-01** — is asserted as a bare literal at `:1158`:

```js
for (const n of ['25 slots', '122', '250']) {
  assert.ok(CONTENT.notes.includes(n), ...);
}
```

Add one slot to any non-`fare` category and the reporter prints 251, the `notes` still says
250, and this assert still passes because the literal `'250'` is still in the string. The
memory entry `[[gate_congela_literal_debe_anclar_disco]]` describes this precisely.

Two secondary weaknesses in the same gate: `notes.includes(String(variantes))` is a
**numeric substring** check (`'122'` is satisfied by `1220`, `3122`, a date, a decision
id), and `notes.includes('113')` / `'247'` have the same property.

**Fix:** derive the total from the reporter, the way the lockstep test derives its
reference from `categories.json`:

```js
// El total del milestone se DERIVA del array de conteo del reporter, no se transcribe:
// es el numero que CR-01 dejo obsoleto.
const REPORTER_SRC = readFileSync(new URL('../scripts/run-validation-271.mjs', import.meta.url), 'utf-8');
const totalDelReporter = [...REPORTER_SRC.matchAll(/file: '([^']+)'/g)]
  .reduce((a, m) => a + JSON.parse(readFileSync(new URL(`../${m[1]}`, import.meta.url), 'utf-8')).exercises.length, 0);
assert.ok(CONTENT.notes.includes(String(totalDelReporter)),
  `INT-02: el reporter cuenta ${totalDelReporter} slots y el notes no lo declara`);
```

and delimit the numeric checks so they cannot be satisfied by a substring (e.g. match
`/\b122 variantes\b/` rather than `includes('122')`).

---

### WR-05: the reporter's coherence guard is aggregate-only — compensating literal drifts pass

**File:** `scripts/run-validation-271.mjs:213-223`, `:422-424`

**Issue:** The guard compares `Σ expected` with `Σ slotCountOf(disk)`. The comment at
`:163-166` claims per-file protection: *"El reporter falla si la suma encontrada en disco
no coincide con el expected — protege contra archivos JSON con ejercicios
borrados/duplicados."* It protects the sum, not the files. Two offsetting drifts cancel,
and the per-category mismatch at `:422-424` is a **printed warning that no gate consumes**.

Reproduced (`preposiciones` 50→49, `articoli` 34→35):

```
        → Total 50 ≠ esperado 49 para preposiciones
        → Total 34 ≠ esperado 35 para articoli
  Milestone gate PASS.
exit=0
```

Note also that for the ten categories with dynamic `expected`, the guard is tautological
(both sides read the same file in the same run), so it only ever constrained the eight
literals — in aggregate.

**Fix:** gate per category, not on the sum:

```js
{
  const desalineadas = CATEGORIES
    .filter((c) => c.expected !== slotCountOf(c.file))
    .map((c) => `${c.slug}: expected=${c.expected} disco=${slotCountOf(c.file)}`);
  if (desalineadas.length > 0) {
    console.error(`Incoherencia de conteo POR CATEGORIA:\n  ${desalineadas.join('\n  ')}`);
    process.exit(1);
  }
}
```

and fold `r.total !== r.expected` into `val06Pass` so it stops being advisory.

---

### WR-06: `tests/fixtures/slot-variants-integration.test.js` never runs in the canonical suite

**File:** `tests/fixtures/slot-variants-integration.test.js:170-231`

**Issue:** `node --test tests/*.test.js` — the project's documented command, per
`[[test_command_node_glob]]` and every acceptance criterion in `44-04-PLAN.md` — does not
glob into `tests/fixtures/`. Confirmed: the suite output contains no
`integración slot+variantes` or `back-compat SLOT-06` describe, and the only occurrence of
the filename is the source-assert test name from `count-arrays-lockstep`. So this file's
own gates — the per-category `expected` count at `:213-220` and the all-18-categories
bundle validation at `:223-231` — are dead in the canonical run. Phase 44 added four
entries to `REAL_CATEGORIES` and hardened the gate over its *source text*, but the
assertions inside it are never executed.

Consequence beyond dead code: a cross-wired `expected` (`{ slug: 'fare-indefiniti',
expected: readJson('content/exercises/fare-indicativo.json')…}`, the `fare-ind` copy-paste
D-40-03 warns about) is not detectable by `paresSlugFile` — that helper is deliberately a
no-op on this file, since it declares no `file` key — and the assert that *would* catch it
does not run.

**Fix:** bring the file into the canonical run. Either move it to `tests/` (its two
sibling `tests/fixtures/*.test.js` files have the same problem), or standardise on
`node --test --recursive tests/` and update the memory entry plus the plan/summary
templates. Whichever is chosen, record the pre/post `# tests` count in the summary — the
number will jump, and an unexplained jump is what invites the next "it was already
covered" assumption.

---

### WR-07: `slug:\s*` crosses newlines, two lines under the comment that forbids it

**File:** `tests/count-arrays-lockstep.test.js:102-104`

**Issue:** The comment states the rule: *"`[^\S\n]*` = whitespace HORIZONTAL: acota el
ancla a una sola linea (un `\s*` podria cruzar saltos de linea)"*. The very next line uses
`slug:\s*` for the gap between the key and the opening quote. Confirmed:

```js
slugsCiegos("    { slug:\n'fare-indefiniti', x }", ['fare-indefiniti'])  // => []  (anchored)
```

`paresSlugFile` at `:126` gets this right (`slug:[^\S\n]*`), so the two helpers that the
file says share an anchor do not.

**Fix:** `slug:[^\S\n]*(['"\`])` in `slugsCiegos`, matching `paresSlugFile`.

---

### WR-08: `OBJECT_PRONOUN_RE` matches definite articles anywhere in the prompt

**File:** `tests/content-fare-indicativo.test.js:112`, consumed at `:1273-1283`

**Issue:** `/(^|[^\p{L}])(lo|la|li|le)([^\p{L}]|$)/iu` cannot distinguish the object
clitics it targets from the definite articles `lo`, `la`, `li`, `le`, which are among the
commonest words in Italian. The stated concern is narrow and positional — a clitic
*immediately before the auxiliary* forces participle agreement (`li ho fatti`) — but the
gate is unanchored, so any future `-300` prompt containing `la torta`, `le foto` or
`li vedo` goes red with the message "lleva un pronombre objeto antepuesto" while carrying
no clitic at all. It is green today only because `OBJECTS` happens to contain no
`la`/`le`/`lo`/`li`-initial phrase.

The sibling file solved this shape properly: `terminaEnPalabra(antesDelHueco(prompt), cue)`
(`tests/content-fare-indefiniti.test.js:164-165`) tests adjacency, not presence.

**Fix:** test adjacency to the hole, which is also what the comment actually describes:

```js
// El clitico solo fuerza la concordancia si es la palabra INMEDIATAMENTE anterior al
// auxiliar. Sin la adyacencia, el gate confunde el clitico con el articulo homografo.
const CLITICOS_OBJETO = ['lo', 'la', 'li', 'le'];
const antesDelHueco = (p) => p.split('___')[0].trimEnd();
const terminaEnPalabra = (t, c) => t.endsWith(c) && !/\p{L}/u.test(t.slice(0, t.length - c.length).slice(-1) || '');
// ...
assert.ok(!CLITICOS_OBJETO.some((c) => terminaEnPalabra(antesDelHueco(v.prompt), c)), ...);
```

---

### WR-09: the reporter's "never throws" defence is defeated by module-scope reads of the same files

**File:** `scripts/run-validation-271.mjs:170-171`, `:213-223`, `:253-265`

**Issue:** `loadCategory` is documented as *"NUNCA throws — el batch debe poder continuar
reportando el resto de categorias aunque una este corrupta (defensa en profundidad frente
a T-10-02-02 del threat model)"*, and the reporter has a whole rendering path for
`r.loadError` (`:389-397`). That path is unreachable for any file that also feeds
`slotCountOf`: eleven `slotCountOf(...)` calls run at module-evaluation time inside the
`CATEGORIES` literal, and the guard at `:214` calls it for **all eighteen**. A single
corrupt or missing JSON therefore kills the process with a raw `SyntaxError`/`ENOENT`
stack before a single row is printed, which is precisely the outcome the defensive design
exists to avoid — and it also makes the `process.exit(1)` at `:221` an import-time
side effect (documented as a hazard in `count-arrays-lockstep.test.js:26-28`).

**Fix:** make `slotCountOf` fail soft and let the existing report path do its job:

```js
const slotCountOf = (file) => {
  try {
    const data = JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8'));
    return Array.isArray(data.exercises) ? data.exercises.length : null;
  } catch { return null; }
};
```

then treat `null` as a category-level load error rather than a crash, and move the
coherence guard out of module scope into the main flow so importing the module is safe.

---

### WR-10: reporter header and printed output are stale by three milestones

**File:** `scripts/run-validation-271.mjs:5-7`, `:64`, `:360`, `:437`, `:481`

**Issue:** The file documents itself as reading *"los 271 ejercicios distribuidos en los 7
archivos"* with *"La suma de `expected` es 195"*; reality is 18 files and 250 slots. The
banner it prints to the author is `Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 +
VAL-08)` and the success path tells him to run `/gsd:complete-milestone v1.1` — at v2.0
Phase 44. This is the console output that decides whether a milestone closes; a stale
banner is how a reader concludes the wrong gate ran. `VAL-06`'s comment at `:437` still
says "271/271".

**Fix:** derive the banner from the data it already has and delete the frozen counts from
the prose:

```js
console.log(`${BOLD}Gate de cierre de milestone — VAL-04 + VAL-06 + VAL-08 (${CATEGORIES.length} categorías, ${TOTAL_EXPECTED} slots)${RESET}`);
```

Keep the accounting history block (`:64-162`) — it is a deliberate audit trail — but move
the two numbers that claim to describe *current* behaviour out of it.

---

### WR-11: correctness-critical helpers are duplicated, and the anchor between copies is one-way

**File:** `tests/content-fare-indefiniti.test.js:143-144` / `tests/content-fare-indicativo.test.js:872-873`
(`wordish`); `:298-299` / `:256-259` (`pareceFare`);
`tests/content-fare-indicativo.test.js:1016-1025` and `:1229-1238` (`raizComun`)

**Issue:** Three duplications, with three different risk profiles:

1. `wordish` is copy-pasted between the two files (the comment says "clonado"). It is the
   matcher on which every CR-02-class guarantee in both files rests. A fix to one copy
   does not reach the other — and the WR-10 lesson recorded in the comment (the missing
   `i` flag) is exactly the kind of fix that would be applied once.
2. `pareceFare` + `FORMAS_CON_F_AUTORIZADAS` are duplicated with a **one-way** anchor:
   `formasConFDelHermano()` (`:306-314`) reads `fare-indicativo`'s `ESSERE_FORMS` and
   `fare-indefiniti` asserts equality. Nothing anchors in the other direction, and nothing
   anchors the `pareceFare` *body* — the two predicates can diverge in logic while the two
   whitelists stay equal. WR-03 is that divergence, already present.
3. `raizComunDe` (`:1016-1025`) and `raizComun` (`:1229-1238`) are byte-identical in the
   same file under two names.

**Fix:** extract `wordish`, `terminaEnPalabra`, `empiezaPorPalabra` and `raizComun` into
`tests/util/` (the directory already exists) and import from both files — importing a
**non-test** helper module does not re-register `describe`s, so the constraint recorded in
`44-04-PLAN.md:68` does not apply to it. That constraint applies to importing a *test
file*, which is a different thing; the source-assert workaround is only needed for
`ESSERE_FORMS`, which lives inside a test file. Merge `raizComunDe`/`raizComun` into one
name at first use.

---

### WR-12: the pair gate's non-vacuity clause couples the reporter's array length to `categories.json`

**File:** `tests/count-arrays-lockstep.test.js:420-426`

**Issue:** `assert.equal(pares.length, SLUGS_REGISTRADOS.length)` is a good non-vacuity
clause and a poor equality. It holds today (18 = 18) but it asserts something the gate does
not mean: that the reporter declares *exactly as many pairs as there are registered
categories*. A count entry for a file that is legitimately not a display category (a
`canciones` bundle, a fixture) makes it red with a message blaming the extractor. And in
the other direction it is offsettable: one pair for an unregistered slug plus one missing
registered slug leaves the length equal — `slugsCiegos` catches the missing one, so the
composite is covered, but this assert's own message would be misleading about which
failure occurred.

**Fix:** assert the property that is actually meant — every registered slug appears exactly
once among the extracted pairs — which is non-vacuous *and* true:

```js
const declarados = paresSlugFile(SRC).map((p) => p.slug);
assert.deepEqual(
  [...declarados].sort(),
  [...SLUGS_REGISTRADOS].sort(),
  `T-44-03-01: los pares declarados por ${REPORTER} y las categorias registradas no coinciden`
);
```

---

### WR-13: `assert.deepEqual` used on a boolean expression

**File:** `tests/count-arrays-lockstep.test.js:526-530`

**Issue:**

```js
assert.deepEqual(
  [...new Set(orders)].length === orders.length,
  true,
  `INT-01: hay order duplicados: ${orders.join(', ')}`
);
```

`deepEqual(<boolean>, true)` collapses the comparison before the assertion runs, so the
failure output is `false !== true` plus the message — the diff that makes `deepEqual`
worth using is discarded. Same file, `:529-533`, uses `deepEqual` correctly on arrays.

**Fix:** assert the sets directly so the failure names the duplicates:

```js
const duplicados = orders.filter((o, i) => orders.indexOf(o) !== i);
assert.deepEqual(duplicados, [], `INT-01: hay order duplicados: ${duplicados.join(', ')}`);
```

---

## Verification notes

Every Critical finding was reproduced by mutation against the working tree and reverted.
`git status --short` at the end of the review shows only `M .planning/config.json`, which
was already modified before the review started. Post-revert confirmation:

```
# tests 1092 / # pass 1092 / # fail 0
VAL-06 (250/250 validated): PASS
Milestone gate PASS.
```

Suggested fix order, because two of these interact: CR-01 first (it is the phase's own
premise), then CR-03 (it is the last gate before milestone close), then CR-02 and CR-04
(content-correctness). WR-02/WR-03 should be fixed together or the two `pareceFare` copies
will disagree again. WR-06 should be settled before the next phase measures a `# tests`
delta, since it changes the baseline.

---

_Reviewed: 2026-08-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
