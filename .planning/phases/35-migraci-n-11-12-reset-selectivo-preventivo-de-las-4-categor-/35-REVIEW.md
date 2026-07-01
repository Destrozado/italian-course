---
phase: 35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-
reviewed: 2026-07-01T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/data/storage.js
  - src/data/backup.js
  - tests/data-storage.test.js
  - tests/backup.test.js
findings:
  critical: 0
  warning: 3
  info: 3
  total: 6
status: issues_found
---

# Phase 35: Code Review Report

**Reviewed:** 2026-07-01
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

This phase adds the `11 → 12` migration (`migrate11to12` / `hydrateV12` / `RESET_PREFIXES_V12`) as a verbatim structural mirror of `migrate10to11` / `hydrateV11` / `RESET_PREFIXES_V11`, plus a matching bump in `backup.js` and cloned v12 test blocks. The migration logic itself is correct: the three-step pattern (deep-clone → delete category keys → prefix-filter exerciseStats → conditionally invalidate inFlightTest) is faithfully reproduced, all tests pass, `CURRENT_SCHEMA_VERSION` is consistently 12 in both `storage.js` and `backup.js`, prefix collision is clean (no existing slug starts with `dimostrativi`, `possessivi`, `modali`, or `riflessivi` and vice versa), and the `migrate()` dispatcher in `storage.js` properly chains `v11 → migrate11to12 → v12 === 12 → hydrateV12` then falls through to the warn + blankState for any version > 12.

Three issues degrade maintainability, and three stale documentation items are identified below.

## Structural Findings (fallow)

No structural pre-pass was provided.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Dead imports in `backup.js` — `hydrateV7`, `hydrateV8`, `hydrateV9`, `hydrateV11` imported but never called

**File:** `src/data/backup.js:26`
**Issue:** The import line pulls in `hydrateV7`, `hydrateV8`, `hydrateV9`, and `hydrateV11` from `storage.js`. None of them are called anywhere in the module body. The v7/v8/v9/v11 hydrate functions were removed from the migration chain body progressively as each phase added a new "unconditional final hydrate" pattern (`migrated = hydrateV12(migrated)` at line 146), but the import list was never cleaned up. These four symbols are dead weight that misleads a reader into thinking the backup pipeline still branches per intermediate version. Confirmed via `grep`: each of the four names appears exactly once in the file (the import line only).

**Fix:** Remove the four dead symbols from the named import list:
```js
// Before
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7, migrate7to8, hydrateV8, migrate8to9, hydrateV9, migrate9to10, migrate10to11, hydrateV11, migrate11to12, hydrateV12 } from './storage.js';

// After
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, migrate7to8, migrate8to9, migrate9to10, migrate10to11, migrate11to12, hydrateV12 } from './storage.js';
```

---

### WR-02: Stale `@returns` JSDoc on `blankState()` — claims `schemaVersion: 8`, actual return is 12

**File:** `src/data/storage.js:66`
**Issue:** The `@returns` type annotation on `blankState()` reads:
```
@returns {{schemaVersion: 8, ...}}
```
The function body returns `schemaVersion: CURRENT_SCHEMA_VERSION` which is 12. Any tooling (IDE hover, generated docs) that reads the JSDoc type will see the wrong version. The same stale annotation appears on `loadState()` at line 90 (`schemaVersion: 8`) and on the `migrate()` dispatcher at line 147 (`Estado normalizado en el shape v8`).

**Fix:** Update the three annotations:
```js
// line 66
@returns {{schemaVersion: 12, exerciseStats: object, categoryProgress: object, dailyLog: object, songProgress: object, lastBackupAt: null, firstUsedAt: null}}

// line 87–90
// El estado devuelto SIEMPRE está en el shape v12 (las migraciones 1→…→12
// corren transparente vía el dispatcher).
@returns {{schemaVersion: 12, exerciseStats: object, categoryProgress: object, dailyLog: object, songProgress: object, lastBackupAt: ?string, firstUsedAt: ?string, inFlightTest?: object}}

// line 147
@returns {object} Estado normalizado en el shape v12.
```

---

### WR-03: Stale `parseBackupFile()` JSDoc step 5 — claims migration ends at `hydrateV9`

**File:** `src/data/backup.js:70-72`
**Issue:** The in-function JSDoc of `parseBackupFile` describes step 5 as:
```
 *   5. Cadena de migración: migrate1to2 → … → migrate7to8 → migrate8to9 →
 *      hydrateV9. Sale siempre como v9 normalizada (hydrateV9 neutraliza
 *      prototype pollution per T-04-02 / T-18-01 / T-21-01).
```
The actual implementation ends with an unconditional `migrated = hydrateV12(migrated)` and the chain runs through `migrate11to12`. This comment has been wrong since at least Phase 21 (v9) and was not updated for v10, v11, or v12. A developer following the comment would expect `hydrateV9` as the final normalizer and might be confused when debugging. The companion module-level comment at line 19 also still says `state ya migrado a v7`.

**Fix:**
```js
// line 19 (module-level comment):
//   - `{ok: true, state, summary}` cuando todo va bien (state ya migrado a v12).

// lines 70-72 (function JSDoc step 5):
 *   5. Cadena de migración: migrate1to2 → … → migrate11to12 →
 *      hydrateV12. Sale siempre como v12 normalizada (hydrateV12 neutraliza
 *      prototype pollution per T-04-02 / T-18-01 / T-35-01).
```

---

## Info

### IN-01: Stale opening description in `blankState()` JSDoc — still says "shape v9"

**File:** `src/data/storage.js:39`
**Issue:** The first sentence of the `blankState()` JSDoc reads:
```
 * Devuelve un estado "en blanco" (sin progreso) — el estado inicial canónico
 * con shape v9 (D-46/D-47 + D-77/D-78 Phase 4 + D-111 Phase 6 + D-02/D-03
 * Phase 13 + D-15-08/D-15-09 Phase 15 + D-17-08 Phase 17 + D-18 Phase 18 +
 * D-21 Phase 21).
```
The function body now returns `schemaVersion: CURRENT_SCHEMA_VERSION = 12`. The description should be bumped to v12 and the decision reference chain should include D-35. This is a documentation-only issue with no runtime consequence.

**Fix:** Update the opening phrase to `con shape v12 (... + D-35 Phase 35).`

---

### IN-02: Stale test names in `backup.test.js` — two tests still titled "v1 → v9" when they now assert `schemaVersion: 12`

**File:** `tests/backup.test.js:109,163`
**Issue:** Two test names (`'migración cadena v1 → v9 hidratada (via parseBackupFile)'` and `'migración v1 → v9 OK (state.schemaVersion=1 + wrapper.schemaVersion=1)'`) both assert `result.state.schemaVersion === 12` in their bodies but still name the destination as v9. The comment above Test 5 (line 108) also says "sale por la cadena 1→2→3→4→5→6→7→8→9 (Phase 21 extiende a v9)". Test output will display the stale v9 label which does not match the assertion.

**Fix:** Rename to `'migración cadena v1 → v12 hidratada (via parseBackupFile)'` and `'migración v1 → v12 OK (...)'`. Update the comment at line 108 to say "sale por la cadena 1→…→12 (Phase 35 extiende a v12)."

---

### IN-03: backup.js module-level D-74 comment still references the old chain end (`hydrateV4`)

**File:** `src/data/backup.js:13`
**Issue:** The decision log comment at the top of the file reads:
```
//   - D-74: validación estricta + migración automática vía la cadena
//     existente (migrate1to2 → migrate2to3 → migrate3to4 → hydrateV4).
```
The chain has grown to 12 versions. The reference `hydrateV4` has been wrong since Phase 15. While this is not a runtime defect, it misrepresents the actual chain for a reader consulting this file.

**Fix:** Update to `(migrate1to2 → … → migrate11to12 → hydrateV12).`

---

_Reviewed: 2026-07-01_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
