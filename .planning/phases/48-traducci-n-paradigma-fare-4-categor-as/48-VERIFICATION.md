---
phase: 48-traducci-n-paradigma-fare-4-categor-as
verified: 2026-08-16T19:31:07Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 48: Traducción — paradigma `fare` (4 categorías) Verification Report

**Phase Goal:** Que las 4 categorías del paradigma de `fare` muestren la traducción de su frase al
resolverse, con las 122 traducciones validadas.
**Verified:** 2026-08-16T19:31:07Z
**Status:** passed
**Re-verification:** No — initial verification

All numbers below were re-derived directly from disk (JSON walk + `deriveStatus` import + live
reporter/test runs), not copied from any SUMMARY.md.

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | **Cobertura del bloque:** 122 variantes `multiple-choice` (54+30+21+17) llevan `translationES.text` no vacío | ✓ VERIFIED | Disk walk: `fare-indicativo`=54/54, `fare-congiuntivo`=30/30, `fare-indefiniti`=21/21, `fare-cond-imperativo`=17/17 → 122/122 with non-empty text, 0 missing, 0 gap-marker leaks |
| 2 | **El tiempo verbal se reconoce en español** sin convertirse en explicación gramatical | ✓ VERIFIED CON EXCEPCIÓN NOMBRADA Y CONTADA | Grep for Italian/Spanish grammatical metalanguage (`congiuntivo`, `trapassato`, `imperfetto`, etc.) inside `translationES.text` across all 122 → 0 matches. Known limit: 11/122 (6 hard + 5 soft), all in `fare-congiuntivo`, where Spanish structurally cannot preserve the congiuntivo/indicativo contrast — documented in `docs/TRANSLATION-VALIDATION-PROMPT.md` ("Aclaración de S2: el MODO obligado del congiuntivo…") and reported explicitly as "SC-2: CUMPLIDO CON EXCEPCIÓN NOMBRADA Y CONTADA" in 48-05-SUMMARY.md, never claimed as plainly met. Count re-derived independently in this verification (see below) and matches 6+5=11 exactly. |
| 3 | **Calidad validada:** 122 `validated` by quorum, 0 `disputed`, Spanish accented per RAE | ✓ VERIFIED | Live `deriveStatus()` import run against all 122 `passes[]` arrays on disk: 122/122 written `status` fields match `deriveStatus()` output exactly, 0 mismatches. Reporter: `TRAD-COV PASS (328/328)`, `VAL-04/06/08/09 PASS`, `Milestone gate PASS`, exit 0. 0 disputed, 0 pending. Exactly 1 override in the block (`fare-indicativo-passato-remoto#4`, matches known state), 8 overrides total in corpus (confirmed by disk walk). |
| 4 | **Gate y brownfield:** `expected` derived (not literal), mutation-observed-red, `src/domain/` untouched, `schemaVersion`=13, reporter exit 0 | ✓ VERIFIED | `node scripts/run-validation-271.mjs` → exit 0, includes new `ANCLA-RATCHET` sub-gate (added post-review, CR-01 fix) → PASS. `node --test tests/count-arrays-lockstep.test.js` → 75/75 pass, includes CR-01/CR-02/GATE-05 golden tests exercising mutation-observed-red for ratchet-down, non-integer floor, and vacuous-gate cases. `git log -1 -- src/domain/ src/screens/app.js` shows no phase-48 commit touched the engine. `schemaVersion = 13` in `src/data/backup.js`. |

**Score:** 4/4 truths verified (0 present-but-behavior-unverified).

### Congiuntivo exception, independently re-derived

Classified all 122 translations by matrix-verb trigger, cross-checked against
`fare-congiuntivo.json` on disk:

- **6 hard** (`presente#2`, `passato#2`, `trapassato#0/#1/#2`, `disparador#0`) — Italian requires
  congiuntivo, Spanish structurally forces indicative (`pensar que`, `saber que` govern
  indicative).
- **5 soft** (`presente#3`, `imperfetto#3`, `passato#5`, `trapassato#5`, `disparador#1`) — Spanish
  concessive `aunque`/`a pesar de que` admits both moods with different readings; forcing the
  Italian mood would inject a hypothetical reading the original lacks.
- Total: **11/122**, all confined to `fare-congiuntivo`; the other 3 categories contribute 0.

This matches the count in 48-03-SUMMARY.md and 48-05-SUMMARY.md exactly, and D-48-13 (`opcion-a`:
natural Spanish always, mood never forced, exception named) is reflected verbatim in
`docs/TRANSLATION-VALIDATION-PROMPT.md`'s "Aclaración de S2" section — not buried in a `notes`
field or a SUMMARY only.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/fare-indicativo.json` | 54 `translationES`, all `validated` | ✓ VERIFIED | 54/54 on disk, `deriveStatus` match |
| `content/exercises/fare-congiuntivo.json` | 30 `translationES`, all `validated` | ✓ VERIFIED | 30/30 on disk, `deriveStatus` match |
| `content/exercises/fare-indefiniti.json` | 21 `translationES`, all `validated` | ✓ VERIFIED | 21/21 on disk, `deriveStatus` match |
| `content/exercises/fare-cond-imperativo.json` | 17 `translationES`, all `validated` | ✓ VERIFIED | 17/17 on disk, `deriveStatus` match |
| `scripts/run-validation-271.mjs` (`TRANSLATION_COVERAGE`) | 4 new entries, `expected` derived via `mcVariantCountOf`/`slotCountOf`, no literal | ✓ VERIFIED | 7 categories total, reporter runs `mcVariantCountOf`-style derivation live; `TRAD-COV PASS (328/328)` |
| `content/translation-coverage.lock.json` | 7 keys, 3 pre-existing floors unchanged (96/48/62) | ✓ VERIFIED | 7 categories anchored; `ANCLA-RATCHET PASS` confirms no floor dropped vs HEAD |
| `docs/TRANSLATION-VALIDATION-PROMPT.md` | Congiuntivo-mode exception documented | ✓ VERIFIED | "Aclaración de S2: el MODO obligado del congiuntivo…" section present, plus a subsequent WR-06 amendment narrowing the temporal-relation clause |
| `48-MUTACIONES-EVIDENCIA.md` | 4 gate mutations + 3 permutations, 5-part evidence each | ✓ VERIFIED | 1067-line file present with all sections (green photo w/ md5, mutation, red observed, restore, green photo) |
| `48-REVIEW.md` | Code review with disposition of findings | ⚠️ STALE (see Anti-Patterns) | File exists (2 critical + 7 warning + 3 info = 12, matches known state) but frontmatter (`status: issues_found`) was never updated after 7 findings were fixed and 1 refuted in subsequent commits |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `content/exercises/fare-*.json` | `scripts/run-validation-271.mjs` (`TRANSLATION_COVERAGE`) | new translations trigger coverage entries | ✓ WIRED | Reporter reads all 4 files live; `TRAD-COV PASS (328/328)` |
| `scripts/run-validation-271.mjs` | `content/translation-coverage.lock.json` | anchor re-emission on category entry | ✓ WIRED | `ANCLA-RATCHET` sub-gate consumes `scripts/lib/ancla-ratchet.mjs`, single shared implementation used by both the reporter and `tests/count-arrays-lockstep.test.js` GATE-03 |
| `src/data/validation-state.js` (`deriveStatus`) | `content/exercises/fare-*.json` (`validation.status`) | status must equal derived value | ✓ WIRED | Verified by direct ESM import + walk: 122/122 match, 0 mismatches |
| `48-REVIEW.md` findings | fix commits | CR-01/CR-02/WR-01/02/03/04/06 fixed, WR-05 refuted, WR-07 escalated | ✓ WIRED (but review doc not updated) | Verified via `git log` (commits `80f17f0`, `c0dfeed`, `d7d7312`, `3ba3405`, `42cd064`, `d76c4a0`, `25e916e`, `d05f1ab`) each with mutation-verified before/after evidence in the commit message, and confirmed by re-running the newly added tests (all pass) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Reporter reports 328/328 validated, exit 0, `ANCLA-RATCHET PASS` | `node scripts/run-validation-271.mjs; echo $?` | `TRAD-COV PASS (328/328)`, `Milestone gate PASS`, exit 0 | ✓ PASS |
| Anti-blindness gate green, includes CR-01/CR-02/GATE-05 goldens | `node --test tests/count-arrays-lockstep.test.js` | 19 suites / 75 tests, 0 fail | ✓ PASS |
| Full suite — no regressions beyond the 4 pre-existing D-45-12 failures | `node --test tests/*.test.js tests/fixtures/*.test.js` | 1389 tests, 1385 pass, 4 fail — all 4 inside `tests/requirements-traceability.test.js` (same file/suite as known pre-existing debt) | ✓ PASS |
| `deriveStatus` == written `status` for all 122 fare translations | direct ESM import + walk | 122/122 match | ✓ PASS |
| WR-04 fix present on disk (gloss/translation alignment) | disk read of `fare-indicativo-300#0` | gloss "hice", translation "hice los deberes…" — aligned | ✓ PASS |
| WR-01/02/03 fixes covered by dedicated tests | `node --test tests/translation-validator.test.js` | named subtests `(WR-01)`, `(WR-02)`, `(WR-03)` all `ok` | ✓ PASS |
| WR-07 confirmed still unfixed (author-escalated, non-blocking) | grep `disco[slug] ?? 0` in `tests/count-arrays-lockstep.test.js` | pattern present at lines 2682-2683 | ✓ PASS (matches documented escalation) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| TRAD-03 | 48-01, 48-02, 48-03, 48-04, 48-05 | Bloque `fare` traducido y validado al 100%: 54+30+21+17=122 | ✓ SATISFIED | 122/122 on disk with `validated` status matching `deriveStatus`; REQUIREMENTS.md marks `[x] Complete`; no orphaned requirements mapped to Phase 48 in REQUIREMENTS.md beyond TRAD-03 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/phases/48-.../48-REVIEW.md` | frontmatter | `status: issues_found` not updated after 7/9 critical+warning findings were fixed (commits `80f17f0`…`25e916e`) and 1 (WR-05) refuted (`d05f1ab`) | ⚠️ Warning | Reading `48-REVIEW.md` alone gives a false impression that all 12 findings are still open. The actual disposition is only visible by cross-referencing `git log`, `WINDOWS.md`, and `48-05-SUMMARY.md`. Phase 47 has a companion `47-REVIEW-FIX.md` documenting the same kind of closure; Phase 48 has no equivalent consolidated doc. Does not block the phase goal — every fix is independently verified above by test + disk evidence — but the review artifact itself is stale and should be updated or superseded by a `48-REVIEW-FIX.md`. |
| `.planning/WINDOWS.md` | ids 43, 45, 48, 52, 55, 57 | Ledger `status` column stays `open` for entries whose narrative explicitly says "CERRADO"/"ARREGLADO" (saneo de `concerns[]`, `--adjudicar` guard, D-48-20's 4 variants), while sibling ids in the same phase (21, 22, 42, 60) were correctly flipped to `fixed` | ⚠️ Warning | Inconsistent ledger bookkeeping within the same phase: `gsd-tools windows fixed <id>` was applied for some closures but not others. `open_count`/`fixed_count` frontmatter (47/13/60) is internally self-consistent with the table, so the ledger isn't corrupted — it's just under-marked for these specific ids. `workflow.windows_enforce` is absent from `.planning/config.json` (defaults to not blocking `/gsd-ship`), so this does not currently block shipping, but it will misrepresent true open-defect count if the flag is ever enabled. |
| (test fixture) `tests/count-arrays-lockstep.test.js:484` | `TODO(v2.1)` inside a JS template-string fixture (`SRC_SLUG_EN_PROSA`) | ℹ️ Info | Synthetic test input simulating "prose that looks like a coverage-array entry," used to verify the gate's regex correctly excludes it — not a real unresolved debt marker in production code. Not gate-blocking. |

No stub patterns, no empty/placeholder implementations, no gap-marker leaks, and no grammatical-metalanguage leaks were found in any of the 122 translations.

### Human Verification Required

None. All success criteria and prohibitions were independently re-derived from disk (JSON walks,
live `deriveStatus` execution, live reporter/test runs, and `git log` cross-referencing of the
code-review fix commits) rather than trusted from SUMMARY.md prose.

### Gaps Summary

No gaps block the phase goal. Two warnings are recorded for process hygiene (stale `48-REVIEW.md`
frontmatter and inconsistent `WINDOWS.md` status flips for ids 43/45/48/52/55/57) — both are
documentation/bookkeeping issues, not functional defects; every underlying fix they describe was
independently verified against the current disk state and passing tests. One item (WR-07, GATE-03's
`disco 0` message conflating "denominator shrank" with "category un-covered") remains open by
explicit author decision, is non-blocking (doesn't produce a false green), and is accurately
reported as still-open in both `48-REVIEW.md` and `WINDOWS.md` id 53.

---

_Verified: 2026-08-16T19:31:07Z_
_Verifier: Claude (gsd-verifier)_
