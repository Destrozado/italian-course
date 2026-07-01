# Phase 35: Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas) - Pattern Map

**Mapped:** 2026-07-01
**Files analyzed:** 4 (all MODIFIED, none new)
**Analogs found:** 4 / 4 (all exact — verbatim mirror of the v1.7 `10→11` migration, Phase 29)

> This phase is a **brownfield verbatim mirror**. Every function to add already
> exists one version down. The planner does NOT re-litigate mechanics (D-35-04/05,
> "locked by precedent"). Copy the `…10to11` / `…V11` / `RESET_PREFIXES_V11`
> shapes, change `10→11` to `11→12`, and change the prefix array to the 4 slugs.

**The 4 new slugs (D-35-01, contract for the whole milestone):**
`['dimostrativi', 'possessivi', 'modali', 'riflessivi']`

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `src/data/storage.js` | model / persistence | transform (migration chain) | `migrate10to11` + `hydrateV11` + `RESET_PREFIXES_V11` (same file) | exact |
| `src/data/backup.js` | model / serialization | transform (round-trip + import migration) | `CURRENT_SCHEMA_VERSION=11` block + import chain (same file) | exact |
| `tests/data-storage.test.js` | test | — | `describe('data/storage v11 — migrate10to11 …')` block (same file, lines 1500-1783) | exact |
| `tests/backup.test.js` | test | — | `describe('data/backup v11 — round-trip + import v10→v11 …')` block (same file, lines 535-626) + reject-future test (671-679) | exact |

---

## Pattern Assignments

### `src/data/storage.js` (model, transform)

**Analog:** the `10→11` triplet in the SAME file. Four edits:

#### Edit 1 — bump `CURRENT_SCHEMA_VERSION` (line 35)
```javascript
const CURRENT_SCHEMA_VERSION = 11;   // → change to 12
```
This constant flows into `blankState()` (line 70) automatically — `blankState()`
needs NO other change (it reads `CURRENT_SCHEMA_VERSION`; the `blankState v11` test
asserting `schemaVersion === 11` at data-storage.test.js:39/53 must become 12).

#### Edit 2 — extend the migration chain (dispatcher `migrate()`, lines 152-162)
Current tail:
```javascript
  if (s.schemaVersion === 10) s = migrate10to11(s);
  if (s.schemaVersion === 11) return hydrateV11(s);
```
**Insertion point: line 162.** Change the terminal `hydrateV11` line to a
`migrate11to12` link, and add the new terminal `hydrateV12`:
```javascript
  if (s.schemaVersion === 10) s = migrate10to11(s);
  if (s.schemaVersion === 11) s = migrate11to12(s);   // NEW link
  if (s.schemaVersion === 12) return hydrateV12(s);    // NEW terminal
```

#### Edit 3 — add `RESET_PREFIXES_V12` (mirror of `RESET_PREFIXES_V11`, line 1029)
Template (lines 1017-1029). Mirror the comment (D-35-03 no-collision `startsWith`, per <specifics>):
```javascript
const RESET_PREFIXES_V11 = ['presente-regolare'];
```
New:
```javascript
// Prefijos de id que migrate11to12 resetea (D-35-01/03). Son las CUATRO
// categorías nuevas de v1.9: dimostrativi, possessivi, modali, riflessivi.
// Gate de colisión startsWith (D-35-03): ninguno de los 10 slugs existentes
// empieza por un slug nuevo ni viceversa, y ningún slug nuevo es prefijo de
// otro → sin colisiones, preserva los 10 byte a byte.
const RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi'];
```
Note: RESET_PREFIXES_V11 has one element; V9 has six. The `.some(p => …)` loop
form (used in migrate8to9/migrate10to11) generalizes to any array length — copy
that form, NOT the hand-unrolled `delete a; delete b;` of migrate7to8/migrate8to9.

#### Edit 4 — add `migrate11to12` (verbatim mirror of `migrate10to11`, lines 1067-1106)

`migrate10to11` is the EXACT template — it uses `RESET_PREFIXES_V11.some(...)` for
both the exerciseStats prune (step 2) and the inFlightTest invalidation (step 3).
The 3-step body (deep-clone → delete/prune → invalidate) copies verbatim; only
(a) the delete lines and (b) the array name change.

Template step 1 (categoryProgress reset — line 1068-1072):
```javascript
  const categoryProgress = (typeof v10.categoryProgress === 'object' && v10.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v10.categoryProgress))
    : {};
  delete categoryProgress['presente-regolare'];   // bracket: el id lleva guion
```
→ For v11→v12, replace the single `delete` with FOUR bracket-notation deletes
(D-35-04, one per slug):
```javascript
  const categoryProgress = (typeof v11.categoryProgress === 'object' && v11.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v11.categoryProgress))
    : {};
  delete categoryProgress['dimostrativi'];
  delete categoryProgress['possessivi'];
  delete categoryProgress['modali'];
  delete categoryProgress['riflessivi'];
```

Template step 2 (exerciseStats prune by prefix — lines 1074-1081) copies verbatim,
swapping `RESET_PREFIXES_V11` → `RESET_PREFIXES_V12` and `v10` → `v11`:
```javascript
  const exerciseStatsAll = (typeof v11.exerciseStats === 'object' && v11.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v11.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!RESET_PREFIXES_V12.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
  }
```

Template step 3 (inFlightTest invalidation — lines 1083-1090) copies verbatim:
```javascript
  let inFlightTest = v11.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && RESET_PREFIXES_V12.some(p => id.startsWith(p)))) {
    inFlightTest = undefined;
  }
```

Template return (lines 1092-1105) copies verbatim with `schemaVersion: 12` and
all `v10.` → `v11.`:
```javascript
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
```

#### Edit 5 — add `hydrateV12` (verbatim mirror of `hydrateV11`, lines 1131-1151)

`hydrateV11` uses the `const p = (parsed && typeof parsed === 'object') ? parsed : {}`
root guard introduced in `hydrateV10` — COPY THAT (do NOT copy the older
`hydrateV9` shape which lacks it; see storage.js:1121 note). `hydrateV12` does NOT
repeat the prune (D-35-05 — a state reaching it is already v12-shaped or a direct
v12 import to preserve intact). Copy verbatim, changing `11` → `12`:
```javascript
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

---

### `src/data/backup.js` (model, transform)

**Analog:** the version-handling block in the SAME file. Three edits.

#### Edit 1 — extend the import statement (line 26)
Current:
```javascript
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7, migrate7to8, hydrateV8, migrate8to9, hydrateV9, migrate9to10, migrate10to11, hydrateV11 } from './storage.js';
```
→ Append `migrate11to12, hydrateV12` (and drop the no-longer-terminal `hydrateV11`
from the import ONLY IF it's unused after — see Edit 3; keep it if the chain still
calls it as a link, which it does NOT here, but leaving an unused import is harmless.
Simplest: add both new names, keep the rest).

#### Edit 2 — bump `CURRENT_SCHEMA_VERSION` (line 52)
```javascript
const CURRENT_SCHEMA_VERSION = 11;   // → change to 12
```
**Must stay in sync with storage.js** (established pattern, <code_context>: "espejado
en storage.js Y backup.js — nunca desincronizar"). Extend the doc comment above it
(lines 28-51) with a Phase 35 sentence mirroring the Phase 29 sentence at lines 48-51.

#### Edit 3 — extend the migration chain in `parseBackupFile` (lines 130-141)
This chain mirrors `loadState()`'s dispatcher but ends with an UNCONDITIONAL
`hydrateVN` (not a `return`). Current tail:
```javascript
  if (migrated.schemaVersion === 10) migrated = migrate10to11(migrated);
  migrated = hydrateV11(migrated);
```
**Insertion point: line 140-141.** Add the `migrate11to12` link and swap the
terminal hydrate:
```javascript
  if (migrated.schemaVersion === 10) migrated = migrate10to11(migrated);
  if (migrated.schemaVersion === 11) migrated = migrate11to12(migrated);   // NEW
  migrated = hydrateV12(migrated);
```

**Reject `> 12` — NO code change needed.** Guard at lines 122-127 is generic
against `CURRENT_SCHEMA_VERSION`; bumping the constant (Edit 2) makes it reject
`> 12` automatically. Only the test literal changes (see backup test file).

---

### `tests/data-storage.test.js` (test)

**Analog:** `describe('data/storage v11 — migrate10to11 reset selectivo de presente-regolare (Phase 29)')`, **lines 1500-1783**. Clone this whole block to a `v12 / migrate11to12` block.

Fixture shape to mirror (`v10WithPresenteRegolare()`, lines 1514-1546): a state
with the reset-category(ies) PLUS the categories to preserve. For v12 the fixture is
`v11WithNewFour()` — 4 new slugs (to reset) + the **10 legacy** slugs (to preserve).
The 10 legacy = the 9 `NUEVE_REALES` (line 1548) **plus `presente-regolare`** (now a
real preserved category post-v1.7). Update the preserved list accordingly:
```javascript
const DIEZ_LEGACY = ['avere', 'essere', 'verbos-movimiento', 'genero-numero', 'profesiones', 'sustantivos-irregulares', 'preposiciones', 'articoli', 'partitivos', 'presente-regolare'];
const RESET_NEW = ['dimostrativi', 'possessivi', 'modali', 'riflessivi'];
```

Tests to clone verbatim (adapting `migrate10to11`→`migrate11to12`, `v10`→`v11`,
`v11`→`v12`, `presente-regolare`→the 4 slugs, `NUEVE_REALES`→`DIEZ_LEGACY`), covering
exactly Claude's-Discretion checklist (a)-(d) from CONTEXT.md:

| Template test (line) | Covers | Adaptation for v12 |
|----------------------|--------|--------------------|
| "borra categoryProgress … deja las 9 reales intactas" (1550) | reset delete + preserve legacy | loop over 4 reset slugs; deepEqual 10 legacy |
| "poda exerciseStats con el prefijo …" (1564) | prefix prune of exerciseStats | 4 prefixes pruned; 10 legacy `-001` preserved |
| "invalida inFlightTest que referencia ids …" (1575) | inFlightTest invalidation | exerciseIds mixing a new-slug id + a legacy id → undefined |
| "preserva inFlightTest que SOLO toca categorías reales" (1589) | inFlightTest preserved | only-legacy ids preserved |
| "sin inFlightTest no crashea" (1604) | undefined-safe | verbatim |
| "es idempotente" (1610) | idempotency (a→d) | `migrate11to12(migrate11to12(x))` deep-equals |
| "es puro (no muta el input)" (1618) | purity | 4 new slugs still present in input after call |
| "anti-prototype-pollution: `__proto__` …" (1627) | anti-prototype-pollution (d) | malicious `schemaVersion:11` fixture; assert `({}).polluted === undefined` |
| "con sub-dict no-objeto (corrupto) cae a {}" (1634) | defensive shape | verbatim, `schemaVersion:11` |
| "hydrateV11 es espejo de hydrateV10 … SIN poda" (1645) | hydrate preserves, deep-clones | `hydrateV12` preserves a new-slug if present |
| "hydrateV11 sobre v11 con sub-dicts ausentes → {}" (1666) | hydrate normalizes | verbatim |
| "hydrateV11 anti-prototype-pollution" (1674) | hydrate anti-pollution | verbatim |
| "cadena v10 → v11: … reseteada, … preservadas" (1684) | chain reset + preserve | `hydrateV12(migrate11to12(v11))` |
| "cadena end-to-end v8 → v11" (1703) | full chain survives | extend to `hydrateV12(migrate11to12(migrate10to11(migrate9to10(migrate8to9(v8)))))` |
| **"no-regresión: las 9 reales byte-idénticas …" (1730)** | **byte-intact legacy + reset-new (b)** | snapshot-before/deep-equal-after over the 10 legacy; assert 4 new slugs absent from both dicts; **songProgress byte-intact** (line 1778) |
| "blankState() devuelve schemaVersion 11" (1781) | blankState version | assert `=== 12` |

Also update the top `blankState v11` describe block (**lines 36-54**): the two
`schemaVersion === 11` asserts (lines 39, 53) become `12`, and describe/test labels
`v11`→`v12`. Import line 28 needs `migrate11to12, hydrateV12` appended.

**Key: the "no-regresión" test (1730) is the load-bearing checklist-(b) coverage** —
it proves the 10 legacy + `songProgress` are byte-intact via a JSON snapshot taken
before migration and `deepEqual`'d after.

---

### `tests/backup.test.js` (test)

**Analog:** `describe('data/backup v11 — round-trip + import v10→v11 (Phase 29)')`, **lines 535-626**. Clone to a `v12 / import v11→v12` block.

Fixture (`stateV11()`, lines 547-567): a state at CURRENT with progress in real
categories. For v12 clone to `stateV12()` at `schemaVersion: 12` with legacy-category
progress (include `presente-regolare` among the preserved, since it's now legacy).

Tests to clone (adapting `migrate10to11`→`migrate11to12`, `v10`→`v11`, `v11`→`v12`,
`presente-regolare`→a representative new slug e.g. `dimostrativi`, and every
`r.state.schemaVersion, 11`→`12`):

| Template test (line) | Covers | Adaptation |
|----------------------|--------|------------|
| "round-trip v11: export → import sin 'versión más nueva'" (569) | round-trip v12 (d) | `stateV12()`; wrapper.schemaVersion 12; `r.state.schemaVersion === 12` |
| "round-trip v11 preserva el progreso … intacto" (578) | preserve on round-trip | deepEqual legacy categories incl. presente-regolare |
| "import de backup v10 → state v11 con presente-regolare reseteada" (591) | cross-version import migration v11→v12 (d) | `stateV11In` at schemaVersion:11 containing a new-slug (e.g. `dimostrativi`) + a legacy; assert new-slug reset, legacy byte-intact, `r.state.schemaVersion === 12` |

**Reject-future test — update the literal (lines 668-679).** Template:
```javascript
  test('rejects future schemaVersion > 11 (menciona "versión más nueva")', () => {
    const r = parseBackupFile(JSON.stringify({
      kind: 'italian-course-backup',
      schemaVersion: 12,
      state: { schemaVersion: 12 }
    }));
    assert.equal(r.ok, false);
    assert.match(r.reason, /versión más nueva/i);
  });
```
→ Change label to `> 12`, bump both `schemaVersion: 12` literals to `13`. This is
the ONLY edit to the reject block (guard code unchanged).

**Also update round-trip-current asserts elsewhere:** every `assert.equal(r.state.schemaVersion, 11)`
in the earlier v7/v8/v9/v10 backup blocks (lines 121, 155, 175, 198, 246, 294, 345,
386, 446, 488, 527) asserts the migrated output lands at CURRENT — they all become
`12`. Grep `r.state.schemaVersion, 11` and `s.schemaVersion, 11` / `blankState … 11`
before finalizing. Also the `blankState() … v11` test at **line 91-93** (`assert.equal(s.schemaVersion, 11)`) → 12.

---

## Shared Patterns

### Deep-clone defensivo anti-prototype-pollution (T-21-01 / T-29-01)
**Source:** every migrate/hydrate in `src/data/storage.js` (e.g. migrate10to11 lines 1069-1080).
**Apply to:** `migrate11to12`, `hydrateV12`.
Every sub-dict is reconstructed via `JSON.parse(JSON.stringify(x))` guarded by
`typeof x === 'object' && x !== null ? … : {}`. The root object is a fresh literal
`{ schemaVersion: 12, … }`, never assigns `__proto__` as prototype. The `delete` /
prefix-prune operate on the CLONE, never on the input (guarantees purity + idempotency).

### Selective reset by `startsWith` prefix (3-step body)
**Source:** `migrate8to9` (lines 852-896, array form) and `migrate10to11` (lines 1067-1106, array form).
**Apply to:** `migrate11to12`.
Three ops: (1) `delete categoryProgress[slug]` bracket-notation per slug;
(2) prune `exerciseStats` keeping keys where `!RESET_PREFIXES_V12.some(p => k.startsWith(p))`;
(3) invalidate `inFlightTest` (→ `undefined`) if any `exerciseIds` entry starts with
a reset prefix. Use the `.some(...)` array form (not hand-unrolled `delete a;delete b;`)
since the prefix array has 4 elements.

### `CURRENT_SCHEMA_VERSION` mirrored in storage.js AND backup.js
**Source:** storage.js:35 and backup.js:52.
**Apply to:** both bumps to 12 in lockstep. Never desync (established pattern).

### Migration chain link pattern
**Source:** storage.js dispatcher `migrate()` lines 152-162; backup.js `parseBackupFile` lines 131-141.
**Apply to:** insert `if (…=== 11) … migrate11to12(…)` before the terminal hydrate,
and change the terminal hydrate to `hydrateV12`. storage.js uses `return hydrateVN(s)`;
backup.js uses unconditional `migrated = hydrateVN(migrated)`.

---

## No Analog Found

None. All 4 files have an exact same-file template one version down.

---

## Metadata

**Analog search scope:** `src/data/storage.js`, `src/data/backup.js`, `tests/data-storage.test.js`, `tests/backup.test.js` (the migration surface is fully self-contained; no engine/screen/schema-validator changes per <code_context> Integration Points).
**Files scanned:** 4
**Pattern extraction date:** 2026-07-01
**Precedent:** v1.7 Phase 29 (`10→11`, reset selectivo de `presente-regolare`) — the direct analog. Also `migrate8to9` (6-prefix array form), `migrate7to8` (2-prefix). Test command: `node --test tests/*.test.js` (per MEMORY: bare path fails on Node 22.20).
