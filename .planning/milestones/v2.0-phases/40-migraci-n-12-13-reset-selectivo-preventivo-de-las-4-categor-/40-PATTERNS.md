# Phase 40: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) - Pattern Map

**Mapped:** 2026-08-03
**Files analyzed:** 4 (all modified, none created)
**Analogs found:** 4 / 4 (all *exact* — same file, one version down)

This phase is a **near-verbatim mirror** of the v1.9 `11→12` link (Phase 35). Every excerpt below is
real code read from disk today. The planner's job is a mechanical `11→12` ⇒ `12→13` substitution plus
the two content changes fenced by CONTEXT.md (the 4 `fare-*` slugs, and the new `fare-ind` overlap
paragraph in the block comment, D-40-05).

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/data/storage.js` | data/persistence (migration chain) | transform (pure state → state) | itself, `migrate11to12` / `hydrateV12` / `RESET_PREFIXES_V12` (lines 1154-1294) | exact |
| `src/data/backup.js` | data/parser (import/export) | transform (string → state) | itself, the v12 chain (lines 26, 56, 126-130, 133-146) | exact |
| `tests/data-storage.test.js` | test | transform | itself, `describe('data/storage v12 — migrate11to12 …')` (lines 1786-2065) | exact |
| `tests/backup.test.js` | test | transform | itself, `describe('data/backup v12 — round-trip + import v11→v12 (Phase 35)')` (lines 630-722) + error-path test at 764-775 | exact |

**No files are created.** No new architecture. `src/screens/`, `src/domain/`, `content/` untouched (D-40-06).

---

## Pattern Assignments

### `src/data/storage.js` (4 edits)

**Analog:** itself, the v11→v12 link.

**Edit 1 — the version constant** (`src/data/storage.js:34-35`):

```js
const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 12;
```
⇒ `= 13`. Nothing else at that site; `blankState()` reads the constant (line 70), so it follows automatically.

**Edit 2 — the migration chain dispatcher** (`src/data/storage.js:149-169`):

```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  ...
  if (s.schemaVersion === 9) s = migrate9to10(s);
  if (s.schemaVersion === 10) s = migrate10to11(s);
  if (s.schemaVersion === 11) s = migrate11to12(s);
  if (s.schemaVersion === 12) return hydrateV12(s);

  // Versión desconocida (probablemente futura) → no perdemos datos del autor:
  // logueamos warning y arrancamos limpio.
  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}
```

⇒ line 162 stays as-is, line 163 becomes `if (s.schemaVersion === 12) s = migrate12to13(s);` and a new
`if (s.schemaVersion === 13) return hydrateV13(s);` is appended before the `console.warn`. The
`console.warn` fallback is untouched.

**Edit 3 — the prefix array + its block comment** (`src/data/storage.js:1154-1168`) — the comment IS
part of the pattern (it documents the collision gate; D-40-05 requires mirroring it AND adding the
`fare-ind` overlap paragraph):

```js
/**
 * Prefijos de id de categoría que `migrate11to12` resetea (D-35-01/03). Son las
 * CUATRO categorías NUEVAS del milestone v1.9: `dimostrativi`, `possessivi`,
 * `modali`, `riflessivi`, que nacen en las Phases 36-38 (Dimostrativi,
 * Possessivi, Verbi modali, Verbi riflessivi).
 *
 * Gate de colisión de prefijo (D-35-03, verificado 2026-07-01): ninguno de los
 * 10 slugs existentes (avere, essere, verbos-movimiento, genero-numero,
 * profesiones, sustantivos-irregulares, preposiciones, articoli, partitivos,
 * presente-regolare) empieza por un slug nuevo ni viceversa, y ningún slug nuevo
 * es prefijo de otro slug nuevo. El filtro `startsWith` no tiene colisiones y
 * preserva los 10 legacy byte a byte. (Espejo de RESET_PREFIXES_V11 de Phase 29,
 * ahora con CUATRO prefijos.)
 */
const RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi'];
```

Note the sentence *"ningún slug nuevo es prefijo de otro slug nuevo"* — that clause is **false for v13**
(`fare-indicativo` / `fare-indefiniti` share `fare-ind`, neither is a prefix of the other, but the phrase
must be rewritten anyway). D-40-05 requires replacing it with an explicit paragraph explaining why the
`fare-ind` overlap is harmless (both are reset), plus the 14-legacy gate, plus (per `<specifics>`) the
D-40-07 cross-exercise-id convention.

**Edit 4 — `migrate11to12`** (`src/data/storage.js:1207-1249`) — the three-step reset, each step after a
defensive deep-clone. This is the exact idiom to copy:

```js
export function migrate11to12(v11) {
  // (1) Reset de categoryProgress de los 4 slugs nuevos tras deep-clone defensivo.
  const categoryProgress = (typeof v11.categoryProgress === 'object' && v11.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v11.categoryProgress))
    : {};
  delete categoryProgress['dimostrativi'];
  delete categoryProgress['possessivi'];
  delete categoryProgress['modali'];
  delete categoryProgress['riflessivi'];

  // (2) Poda por prefijo de exerciseStats (cualquiera de los 4) tras deep-clone.
  const exerciseStatsAll = (typeof v11.exerciseStats === 'object' && v11.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v11.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!RESET_PREFIXES_V12.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de cualquiera de los 4 (Pitfall 3).
  //     Reconstrucción condicional sin mutar el input (estilo migrate3to4).
  let inFlightTest = v11.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && RESET_PREFIXES_V12.some(p => id.startsWith(p)))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 12,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v11.dailyLog === 'object' && v11.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v11.dailyLog))
      : {},
    songProgress: (typeof v11.songProgress === 'object' && v11.songProgress !== null)
      ? JSON.parse(JSON.stringify(v11.songProgress))
      : {},
    lastBackupAt: typeof v11.lastBackupAt === 'string' ? v11.lastBackupAt : null,
    firstUsedAt: typeof v11.firstUsedAt === 'string' ? v11.firstUsedAt : null,
    inFlightTest
  };
}
```

Its JSDoc (lines 1170-1206) documents: which link is the functional analog, the prefix-collision gate,
why prefix (not equality), idempotence+purity, deep-clone rationale, and "exportada para testabilidad".
Mirror that structure with the version numbers bumped.

**Edit 5 — `hydrateV13`, mirroring `hydrateV12`** (`src/data/storage.js:1274-1294`). Note it is
**shape-only**: no `delete`, no prune, no `RESET_PREFIXES` reference at all. The `const p = ...` root
guard is present (this is the difference vs. `hydrateV9`):

```js
export function hydrateV12(parsed) {
  const p = (parsed && typeof parsed === 'object') ? parsed : {};
  return {
    schemaVersion: 12,
    exerciseStats: (typeof p.exerciseStats === 'object' && p.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(p.exerciseStats))
      : {},
    categoryProgress: (typeof p.categoryProgress === 'object' && p.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(p.categoryProgress))
      : {},
    dailyLog: (typeof p.dailyLog === 'object' && p.dailyLog !== null)
      ? JSON.parse(JSON.stringify(p.dailyLog))
      : {},
    songProgress: (typeof p.songProgress === 'object' && p.songProgress !== null)
      ? JSON.parse(JSON.stringify(p.songProgress))
      : {},
    lastBackupAt: typeof p.lastBackupAt === 'string' ? p.lastBackupAt : null,
    firstUsedAt: typeof p.firstUsedAt === 'string' ? p.firstUsedAt : null,
    inFlightTest: p.inFlightTest
  };
}
```

**`migrateNtoM` vs `hydrateVN` — do not conflate (D-40-09):**

| | `migrate12to13` | `hydrateV13` |
|---|---|---|
| Root guard | none (`v12.x` accessed directly) | `const p = (parsed && typeof parsed === 'object') ? parsed : {}` |
| `delete categoryProgress[slug]` | yes, 4 bracket-notation deletes | **no** |
| `exerciseStats` prune loop | yes, `RESET_PREFIXES_V13.some(p => k.startsWith(p))` | **no** — deep-cloned whole |
| `inFlightTest` | conditionally set to `undefined` | passed through as `p.inFlightTest` |
| Returns | fresh root literal `{ schemaVersion: 13, ... }` | fresh root literal `{ schemaVersion: 13, ... }` |

---

### `src/data/backup.js` (4 edits)

**Analog:** itself, the v12 wiring.

**Chain imports** (`src/data/backup.js:26`) — one flat named-import line, chronological order:

```js
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7, migrate7to8, hydrateV8, migrate8to9, hydrateV9, migrate9to10, migrate10to11, hydrateV11, migrate11to12, hydrateV12 } from './storage.js';
```
⇒ append `, migrate12to13, hydrateV13`.

**Mirrored constant** (`src/data/backup.js:56`, preceded by a cumulative block comment at 28-55 where
each phase appended one sentence — Phase 35's is the last, lines 51-55):

```js
 *  ... Phase 35 (D-35 / MIG-02):
 *  bump 11 a 12 — `migrate11to12` resetea el progreso de las CUATRO categorías
 *  nuevas de v1.9 (dimostrativi, possessivi, modali, riflessivi), que nacen en
 *  las Phases 36-38 (no-op hoy; forward-compat de un backup futuro que ya las
 *  contenga); el set de sub-dicts sigue sin cambiar. */
const CURRENT_SCHEMA_VERSION = 12;
```
⇒ append a Phase 40 sentence in the same voice, then `= 13`.

**Future-version rejection** (`src/data/backup.js:126-131`) — **generic against the constant, so it needs
NO edit**; it starts rejecting `>13` automatically once the constant bumps:

```js
  if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `Este backup viene de una versión más nueva de la app (schemaVersion=${state.schemaVersion}; esta app soporta hasta ${CURRENT_SCHEMA_VERSION}).`
    };
  }
```

**Import migration chain** (`src/data/backup.js:133-146`):

```js
  // 5. Cadena de migración — idéntica al pipeline de loadState().
  let migrated = state;
  if (migrated.schemaVersion === 1) migrated = migrate1to2(migrated);
  ...
  if (migrated.schemaVersion === 10) migrated = migrate10to11(migrated);
  if (migrated.schemaVersion === 11) migrated = migrate11to12(migrated);
  migrated = hydrateV12(migrated);
```
⇒ insert `if (migrated.schemaVersion === 12) migrated = migrate12to13(migrated);` and change the tail to
`migrated = hydrateV13(migrated);` (unconditional, as it is today). D-40-11.

---

### `tests/data-storage.test.js`

**Analog:** the whole `describe` block at lines 1786-2065 (Phase 35). Structure to mirror verbatim:

1. **Banner comment** (1786-1797): ASCII rule, "data/storage v12 — migrate11to12 reset selectivo …",
   explains it is a clone of the previous block with the functional deviation, and names the
   no-regression obligation.
2. **Two slug arrays at the top of the `describe`** (1800-1801):
```js
  const RESET_NEW = ['dimostrativi', 'possessivi', 'modali', 'riflessivi'];
  const DIEZ_LEGACY = ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares', 'preposiciones', 'articoli', 'partitivos', 'presente-regolare'];
```
   ⇒ v13: `RESET_NEW` = the 4 `fare-*` slugs; the legacy array becomes **14** entries (see Facts below) and
   should be renamed accordingly (e.g. `CATORCE_LEGACY`).
3. **Fixture factory** (1805-1823) — one exercise + one categoryProgress entry per slug, counter `n`
   giving each a distinct value so byte-comparisons are meaningful:
```js
  function v11WithNewFour() {
    const exerciseStats = {};
    const categoryProgress = {};
    let n = 1;
    for (const cat of [...RESET_NEW, ...DIEZ_LEGACY]) {
      exerciseStats[`${cat}-001`] = { timesShown: n, timesCorrect: n, timesFailed: 0 };
      categoryProgress[cat] = { status: 'hecha', streakDays: n, clearedExerciseIds: [`${cat}-001`], lastSuccessDate: '2026-06-30' };
      n++;
    }
    return {
      schemaVersion: 11,
      exerciseStats,
      categoryProgress,
      dailyLog: { '2026-06-30': { date: '2026-06-30', categoriesPracticed: ['avere', 'essere', 'articoli'], categoriesWithFailure: [] } },
      songProgress: { 'equilibrio-mentale': { status: 'pasada', lastPlayedAt: '2026-06-02' } },
      lastBackupAt: '2026-06-22T10:00:00.000Z',
      firstUsedAt: '2026-04-01T08:00:00.000Z'
    };
  }
```
   Because the 4 v13 slugs are looped over, the `fare-ind` overlap coverage required by CONTEXT.md
   discretion (e) comes for free (`fare-indicativo-001` and `fare-indefiniti-001` both in the fixture,
   both reset) — but state it explicitly in a test name or assertion message.
4. **The 14 tests, in this order** (names are the template):
   - `borra categoryProgress de los 4 slugs nuevos y deja las N legacy intactas` — asserts both
     `=== undefined` **and** `Object.prototype.hasOwnProperty.call(...) === false` per reset slug.
   - `poda exerciseStats con los 4 prefijos nuevos y preserva las N legacy`
   - `invalida inFlightTest que referencia un id de slug nuevo mezclado con uno legacy`
   - `preserva inFlightTest que SOLO toca categorías legacy`
   - `sin inFlightTest no crashea y preserva undefined`
   - `es idempotente` — `assert.deepEqual(migrate(migrate(x)), migrate(x))`
   - `es puro (no muta el input)` — re-asserts the original fixture still has the slugs
   - `anti-prototype-pollution` — fixture built via `JSON.parse('{"schemaVersion":11,"exerciseStats":{"__proto__":{"polluted":true},…}')` (must be `JSON.parse` of a string literal — an object literal would not create the own-property), then `assert.equal(({}).polluted, undefined)`
   - `con sub-dict no-objeto (corrupto) cae a {}` — loops `for (const bad of [null, 'x', 42])`
   - `hydrateVN es espejo … SIN poda — preserva un slug nuevo si está presente` (+ `assert.notEqual(out.exerciseStats, v12In.exerciseStats, 'deep-clone defensivo')`)
   - `hydrateVN sobre vN con sub-dicts ausentes los normaliza a {}`
   - `hydrateVN anti-prototype-pollution`
   - `cadena v11 → v12: …` and `cadena end-to-end v8 → v12: preposiciones sobrevive`
   - **the load-bearing no-regression test** (2014-2060) — snapshot idiom:
```js
    // Snapshot byte a byte ANTES de migrar.
    const beforeCP = JSON.parse(JSON.stringify(categoryProgress));
    const beforeES = JSON.parse(JSON.stringify(exerciseStats));
    const beforeSong = JSON.parse(JSON.stringify(v11.songProgress));

    const v12 = migrate11to12(v11);
    // (a) los 4 slugs nuevos ausentes de ambos dicts.
    // (b) las N legacy byte a byte deep-equal pre/post (por categoría).
    // (c) songProgress byte-intacto.
```
     Note this fixture seeds **two** stats keys per category (`-001` and `-002`) unlike the factory.
   - `blankState() devuelve schemaVersion N`

5. **Import line** (`tests/data-storage.test.js:28`) — append `, migrate12to13, hydrateV13`.

### `tests/backup.test.js`

**Analog:** `describe('data/backup v12 — round-trip + import v11→v12 (Phase 35)')` at lines 630-722 —
exactly three tests, plus one error-path edit elsewhere:

1. `function stateV12()` (643-663) — a state whose progress lives only in legacy categories.
2. `round-trip v12: export (buildBackupWrapper) → import (parseBackupFile) sin "versión más nueva"`:
```js
    const wrapper = buildBackupWrapper(state, '2026-07-01T12:00:00.000Z');
    assert.equal(wrapper.schemaVersion, 12, 'el wrapper espeja state.schemaVersion=12');
    const r = parseBackupFile(JSON.stringify(wrapper));
    assert.equal(r.ok, true, `no debe rechazarse (reason: ${r.reason})`);
    assert.equal(r.state.schemaVersion, 12);
```
3. `round-trip v12 preserva el progreso de las categorías legacy intacto` — per-category `deepEqual`.
4. `import de backup v11 → state v12 con dimostrativi reseteada (D-35 / MIG-02)` — hand-built wrapper
   literal `{ kind: 'italian-course-backup', exportedAt, schemaVersion: 11, state: stateV11In }`, then
   asserts the new slug is `undefined` in both dicts and `preposiciones` is byte-intact.
5. **Error-path test to update** (764-775) — it hardcodes the boundary and its comment names the phase:
```js
  // Test 11 — post-Phase 35: CURRENT_SCHEMA_VERSION = 12. Un wrapper con
  // schemaVersion: 13 (uno por encima del nuevo current) sigue siendo
  // "versión más nueva" (el reject >N es genérico contra CURRENT).
  test('rejects future schemaVersion > 12 (menciona "versión más nueva")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup', schemaVersion: 13, state: { schemaVersion: 13 }
    }));
```
   ⇒ must become `> 13` / `schemaVersion: 14`, or the test will start failing (13 becomes valid).

---

## Shared Patterns

### Defensive deep-clone (anti-prototype-pollution)
**Source:** `src/data/storage.js:1209-1211` (and every sub-dict in `migrate11to12` / `hydrateV12`).
**Apply to:** `migrate12to13`, `hydrateV13`.
```js
const categoryProgress = (typeof v11.categoryProgress === 'object' && v11.categoryProgress !== null)
  ? JSON.parse(JSON.stringify(v11.categoryProgress))
  : {};
```
Per sub-dict, never one clone of the whole root. The returned root is always a **fresh object literal**
with `schemaVersion` first, so `__proto__` own-properties from an imported backup cannot survive.

### Mirrored `CURRENT_SCHEMA_VERSION`
**Source:** `src/data/storage.js:35` and `src/data/backup.js:56`.
**Apply to:** both, in the same commit. `backup.js` deliberately keeps its own copy (testable in isolation);
they must never drift.

### Cumulative JSDoc
**Source:** `src/data/backup.js:28-55`, `src/data/storage.js:1170-1206`.
**Apply to:** every edit. Convention in this codebase is *append a new sentence naming the phase and the
decision id* (`Phase 40 (D-40 / MIG-01): bump 12 a 13 — …`), never rewrite the history.

### `startsWith` prefix predicate
**Source:** `src/data/storage.js:1223` and `1231`.
**Apply to:** both the `exerciseStats` prune and the `inFlightTest` invalidation — the same
`RESET_PREFIXES_VN.some(p => k.startsWith(p))` expression, with the `typeof id === 'string'` guard on the
`inFlightTest` side.

## No Analog Found

None. Every change in this phase has an exact in-file precedent.

---

## Facts Verified for the Planner

1. **The no-regression fixture must cover 14 legacy categories, not 10.** Verified against
   `content/categories.json` (14 entries, orders 1-14), in file order:
   `avere, essere, preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones,
   articoli, partitivos, presente-regolare, dimostrativi, possessivi, modali, riflessivi`.
   The existing test constant `DIEZ_LEGACY` (`tests/data-storage.test.js:1801`) lists 10; the v13 block
   needs all 14 (the four v1.9 slugs are now legacy). CONTEXT.md D-40-03 and `<specifics>` confirm.
   None of the 14 starts with `fare`, and no `fare-*` slug is a prefix of any legacy — the gate holds.

2. **Hardcoded `12` as a schema version in `tests/` that will break.** Grep results:
   - `tests/backup.test.js` — **17** occurrences of `assert.equal(…schemaVersion, 12)` at lines
     93, 121, 155, 175, 198, 246, 294, 345, 386, 446, 488, 527, 575, 615, 668, 671, 711, plus the
     `schemaVersion: 12` fixture at 645. Every one of these is an assertion that the chain lands on
     CURRENT, so all must bump to 13. **Plus** the future-version test at 764-775 (`>12` / `13` ⇒
     `>13` / `14`) — this one flips from passing to failing if missed, the others too.
   - `tests/data-storage.test.js` — lines 39, 52-53, 639, 1495, 1782, 2063 (`blankState().schemaVersion`
     and end-of-chain assertions), plus the entire v12 block's internal `12`s (1828, 1912, 1928, 1938,
     1948, 1959, 1968, 2004). The pre-v12 `describe` blocks assert *their own* intermediate versions and
     must NOT be touched; only the end-of-chain / `blankState()` assertions bump.
   - **No other test file is affected.** `tests/domain.test.js` (`schemaVersion: 3`),
     `tests/domain-progress.test.js` (`: 2`), `tests/screen-canciones.test.js` (`: 10`) and
     `tests/util/test-helpers.js` (`: 2`) use version-agnostic fixtures that never run the migration
     chain to CURRENT.
   - **No `src/` file outside `storage.js` / `backup.js`** references `CURRENT_SCHEMA_VERSION` or
     `hydrateV12`. `src/domain/progress.js` and `src/screens/app.js` only mention `schemaVersion` in
     JSDoc/comments (D-192: "cero migración"), confirming the D-40-06 fence.

3. **Baseline:** `node --test tests/*.test.js` → 672 pass / 0 fail (per CONTEXT.md, 2026-08-03). Note the
   bare-path form is required (memory: `node --test tests/*.test.js`, not a bare dir, on Node 22.20).

## Metadata

**Analog search scope:** `src/data/`, `tests/`, `content/categories.json`, `scripts/`
**Files scanned:** 4 read in full/targeted ranges + 3 greps across `tests/`, `src/`, `scripts/`
**Pattern extraction date:** 2026-08-03
