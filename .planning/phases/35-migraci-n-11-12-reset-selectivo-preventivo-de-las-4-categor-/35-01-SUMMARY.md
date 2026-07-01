---
phase: 35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-
plan: 01
subsystem: data/migration
tags: [migration, schema-version, backup, brownfield-mirror, forward-compat]
requires:
  - "src/data/storage.js migrate10to11/hydrateV11/RESET_PREFIXES_V11 (v1.7 Phase 29 analog)"
  - "src/data/backup.js parseBackupFile chain + generic version guard"
provides:
  - "RESET_PREFIXES_V12 (4 new-category slug prefixes)"
  - "migrate11to12 (selective reset, idempotent, anti-prototype-pollution)"
  - "hydrateV12 (mirror of hydrateV11, no prune)"
  - "CURRENT_SCHEMA_VERSION=12 mirrored in storage.js + backup.js"
  - "backup round-trip v12 + import v11->v12 + reject > 12"
affects:
  - "Phases 36-38 (the 4 new categories are born on a clean v12 state)"
tech-stack:
  added: []
  patterns:
    - "Selective reset by startsWith prefix (3-step body) — verbatim mirror of migrate10to11"
    - "Deep-clone defensivo anti-prototype-pollution (JSON round-trip per sub-dict)"
    - "CURRENT_SCHEMA_VERSION mirrored in storage.js AND backup.js (never desync)"
key-files:
  created: []
  modified:
    - "src/data/storage.js"
    - "src/data/backup.js"
    - "tests/data-storage.test.js"
    - "tests/backup.test.js"
decisions:
  - "D-35-01/03: RESET_PREFIXES_V12 = [dimostrativi, possessivi, modali, riflessivi]; startsWith no-collision gate verified against the 10 legacy slugs"
  - "D-35-04: 4 bracket-notation deletes + .some(...) array form for prune/invalidate (4-element array)"
  - "D-35-05: hydrateV12 mirrors hydrateV11 (root-guard, no prune); CURRENT bumped in both files"
  - "D-35-06: preventive reset is a no-op today (slugs don't exist yet) — forward-compat mirror"
  - "D-35-08: preexisting genero-numero explanation-count discrepancy is OUT OF SCOPE — not touched"
metrics:
  duration: "~8 min"
  completed: "2026-07-01"
  tasks: 4
  files: 4
  tests: "594/595 pass (1 preexisting AJENO genero-numero fail)"
---

# Phase 35 Plan 01: Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas) Summary

Selective schema migration `11→12` (`migrate11to12` + `hydrateV12` + `RESET_PREFIXES_V12`) that resets by id-prefix the progress of the 4 new v1.9 categories (dimostrativi, possessivi, modali, riflessivi), a verbatim mirror of the v1.7 `10→11` migration, mirrored in backup.js — leaving a clean v12 state for Phases 36-38.

## What Was Built

Four atomic tasks, each a verbatim mirror of the v1.7 Phase 29 `10→11` analog one version down:

1. **storage.js chain** (`6c7c1bc`): bumped `CURRENT_SCHEMA_VERSION` 11→12; added `RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi']` with the startsWith no-collision comment (D-35-03); added `migrate11to12` (3-step body: 4 bracket deletes of categoryProgress, `.some(p => k.startsWith(p))` prune of exerciseStats, inFlightTest invalidation — all on deep-clones, anti-prototype-pollution); added `hydrateV12` (mirror of hydrateV11 root-guard, no prune); extended the `migrate()` dispatcher tail with the 11→12 link + hydrateV12 terminal.
2. **backup.js mirror** (`0db2d52`): imported `migrate11to12, hydrateV12`; bumped `CURRENT_SCHEMA_VERSION` 11→12 (lockstep) + Phase 35 doc sentence; extended the `parseBackupFile` chain with the 11→12 link + hydrateV12 terminal. Reject-`> 12` is automatic via the generic version guard (no code change).
3. **data-storage.test.js** (`1c5af95`): cloned the v11 describe block to a v12 block covering (a) reset of the 4 new slugs, (b) 10 legacy + songProgress byte-intact (load-bearing no-regresión test with pre/post JSON snapshot deepEqual), (c) idempotency + purity, (d) anti-prototype-pollution + hydrateV12 mirror + chain v11→v12 + end-to-end v8→v12; bumped the 3 `blankState()`-output asserts to 12.
4. **backup.test.js** (`fa8811a`): added a v12 block (true round-trip v12 with `stateV12()`, preserve legacy incl. presente-regolare, import v11→v12 resetting dimostrativi with preposiciones byte-intact); bumped the reject-future test to `schemaVersion: 13` (`> 12`); bumped all output-migrated-to-CURRENT asserts (v1..v11 blocks + blankState) 11→12.

## Verification

- `node --test tests/data-storage.test.js` → 112/112 pass (16 in the new v12 block).
- `node --test tests/backup.test.js` → 47/47 pass.
- `node --test tests/*.test.js` (full suite) → 594/595 pass. The single fail is the PREEXISTING, AJENO `genero-numero` explanation-count discrepancy (`12/12 ejercicios con explanation válida`, D-35-08) — out of scope, not introduced by this migration.
- Engine integrity: `git diff HEAD src/screens/app.js src/domain/ src/data/schema-validator.js` is empty — the v1.4 engine (cascade D-54, sampler, slot-engine, schema-validator, screens) was NOT touched. Only the 4 declared files changed.
- Inline behaviour checks (before test blocks existed): `migrate11to12` resets dimostrativi + preserves avere → exit 0; `parseBackupFile` rejects a wrapper `schemaVersion:13` with `/versión más nueva/i` → exit 0.

## Success Criteria (all met)

1. `CURRENT_SCHEMA_VERSION === 12` mirrored in storage.js AND backup.js (0 residual `= 11`). ✓
2. `RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi']` with startsWith no-collision comment. ✓
3. `migrate11to12` + `hydrateV12` present, exported, idempotent, anti-prototype-pollution; chain link applied in both dispatchers. ✓
4. Fixture with fake progress in the 4 new slugs migrates to categoryProgress WITHOUT those keys; 10 legacy + songProgress byte-identical. ✓
5. Backup: round-trip v12 OK, import v11→v12 applies the reset, wrapper `schemaVersion: 13` rejected with `/versión más nueva/i`. ✓
6. Full suite green (only the preexisting AJENO genero-numero fail); engine NOT touched. ✓

## Deviations from Plan

None — plan executed exactly as written. The mechanics were LOCKED by precedent (D-35-04/05, verbatim mirror of the v1.7 `10→11` pattern), so no re-litigation and no auto-fixes were needed.

Note on the existing v11 backup block: because `migrate11to12` now runs on any v11 state, the pre-existing "round-trip v11" tests in backup.test.js now migrate a v11 state up to v12; their output asserts were bumped 11→12 as the plan's Task 4 instruction required (all `r.state.schemaVersion` output-to-CURRENT asserts). A new dedicated v12 block adds a *true* round-trip v12 (`stateV12()` at schemaVersion 12) plus the import v11→v12 reset test.

## Authentication Gates

None.

## Known Stubs

None. This is a data-migration mirror; no UI, no data sources, no placeholders.

## Threat Flags

None. The migration surface is self-contained and hardened by the mirrored pattern (T-35-01 deep-clone anti-prototype-pollution, T-35-02 generic version reject, T-35-03 purity/idempotency) — all covered by dedicated tests. No new security-relevant surface introduced beyond the threat register in the plan.

## Self-Check: PASSED

Files created/modified verified present:
- src/data/storage.js — FOUND
- src/data/backup.js — FOUND
- tests/data-storage.test.js — FOUND
- tests/backup.test.js — FOUND

Commits verified in git log:
- 6c7c1bc (feat storage.js chain) — FOUND
- 0db2d52 (feat backup.js mirror) — FOUND
- 1c5af95 (test data-storage v12) — FOUND
- fa8811a (test backup v12) — FOUND
