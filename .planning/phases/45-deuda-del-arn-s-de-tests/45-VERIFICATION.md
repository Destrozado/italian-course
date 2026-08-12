---
phase: 45-deuda-del-arn-s-de-tests
verified: 2026-08-12T23:06:52Z
status: passed
score: 3/3 must-haves verified
behavior_unverified: 0
overrides_applied: 0
---

# Phase 45: Deuda del arnés de tests Verification Report

**Phase Goal:** Cerrar los tres sitios donde el arnés de tests no vigila lo que su propia prosa
dice que vigila (DEUDA-01, DEUDA-02, DEUDA-03), cerrando el camino por el que una categoría puede
volver a quedarse sin contar con todos los gates en verde.
**Verified:** 2026-08-12T23:06:52Z (re-run against the tree after the code-review-fix commits)
**Status:** passed
**Re-verification:** No — initial verification, but performed against a tree that had already
been through one internal code-review + fix cycle (`45-REVIEW.md` / `45-REVIEW-FIX.md`). This
report does not trust either document's claims — every mutation below was re-executed
independently in this session.

## Methodology note

Per the adversarial verification stance for this phase, no criterion was accepted from SUMMARY
prose. For each of the three ROADMAP success criteria, and for both CR-01/CR-02 critical findings
from `45-REVIEW.md`, the exact mutation recipe was re-run live against the current tree (not
inferred from the SUMMARY/REVIEW-FIX transcripts), the red was observed directly in this
terminal, and the tree was reverted and confirmed clean (`git status --short`) after each one.
Baseline measured first: canonical `1182/1182`, strict `1200/1200`, reporter `Milestone gate
PASS` exit 0 — matches the pre-verification baseline stated in the task exactly.

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | DEUDA-01 — `tests/fixtures/` (63 assertions: 44 + 19) run in the canonical suite invocation, and desyncing a literal `expected` in `REAL_CATEGORIES` turns the canonical suite red | ✓ VERIFIED | Personally mutated `avere: 20→21` in `tests/fixtures/slot-variants-integration.test.js`; canonical invocation produced `Conteo inesperado en content/exercises/avere.json: esperaba 21, encontré 20`, `# fail 1`, and (separately) the OLD form `node --test tests/*.test.js` still passes with `# fail 0` on the same mutation — the original bug, reproduced. Reverted, `git status --short` clean. |
| 2 | DEUDA-01 (CR-01 regression) — the lockstep gate must not stay green when a call-site or a new test header regresses to the *exact pre-phase* degraded form (`node --test tests/`) | ✓ VERIFIED | Personally reproduced MUT6 (one of README's two invocations degraded to `node --test tests/`) → gate goes red naming `README.md: … → 30: node --test tests/`, exit 1. Personally reproduced MUT1 (brand-new `tests/zz-mutante.test.js` header documenting `node --test tests/`) → gate goes red naming that file, exit 1. Both reverted, tree clean. This is the CR-01 fix from `45-REVIEW-FIX.md` (commit `5e90f23`), independently re-verified rather than trusted. |
| 3 | DEUDA-02 — `CATEGORIES_WITH_EXPLANATIONS` is inside the anti-blindness gate; a category registered in `content/categories.json` and absent from that array turns the gate red, naming it | ✓ VERIFIED | Personally deleted the `fare-indefiniti` entry from `tests/exercise-types.test.js`; gate reported `INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: fare-indefiniti`, exit 1, naming exactly that category. Reverted, tree clean. |
| 4 | DEUDA-03 — the reporter's header and footer derive the active milestone from `.planning/STATE.md` frontmatter instead of transcribing it, observed by mutating the data | ✓ VERIFIED | Personally mutated `.planning/STATE.md` `milestone: v2.0 → v9.9`; reporter banner printed `Gate de cierre de v9.9 — …` verbatim. Reverted → banner reads `v2.0` again. `git status --short` clean. |
| 5 | DEUDA-03 (CR-02 regression) — the gate that freezes this derivation must not go blind to the reporter's tail when the comment scanner desyncs on a partial (not total) blanking | ✓ VERIFIED | Personally injected a `/tests\/*.test.js/` regex literal after the reporter's first top-level `console.log` (which opens an unterminated comment block in the naive scanner) plus a hand-written `milestone v1.1` string in the reporter's tail. Gate went red: `el escaner de comentarios y el reconocedor naive DISCREPAN`, exit 1. This is the CR-02 fix from `45-REVIEW-FIX.md` (commit `6b7fe28`), independently re-verified. Reverted from scratchpad copy, tree clean, reporter still exit 0. |
| 6 | DEUDA-01/02/03 exist as defined requirements and as traceability rows mapped to Phase 45; zero orphaned requirements | ✓ VERIFIED | `grep` confirms 3 definitions (`- [x] **DEUDA-0[123]**:`) and 3 traceability rows (`Complete`, mapped to `Phase 45`) in `.planning/REQUIREMENTS.md`. `node --test tests/requirements-traceability.test.js` → `4/4 pass` including the WR-01 duplicate-detection test added post-review. |

**Score:** 6/6 truths verified (0 present-but-behavior-unverified). The three ROADMAP success
criteria (DEUDA-01, DEUDA-02, DEUDA-03) are each independently confirmed by mutation, and the two
critical review findings that could have left them vacuous (CR-01, CR-02) are also independently
confirmed as fixed by mutation, not by trusting `45-REVIEW-FIX.md`'s own tables.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `tests/count-arrays-lockstep.test.js` | Bloque 6 (DEUDA-01 canonical-invocation gate), bloque 3-ter (integrity guard), bloque 7 (DEUDA-03 banner gate + CR-02 differential scanner), bloque 8 (deprecated-command gate, WR-02) | ✓ VERIFIED | All present; `INVOCACION_CANONICA`, `CALL_SITES_INVOCACION` (now includes itself, WR-05 fix), `sinComentariosNaive` (CR-02 fix), `COMANDO_DEPRECADO` (WR-02/bloque 8) all found and exercised live |
| `tests/exercise-types.test.js` | 18 entries with `slug:` + `file:` pair, same line | ✓ VERIFIED | `grep -c "^  { slug: '"` = 18 (via mutation test above) |
| `scripts/run-validation-271.mjs` | `STATE_PATH`, `milestoneActivo`, `etiquetaMilestone`, fail-soft derivation, D-45-09 debt note in header | ✓ VERIFIED | Header line 15 declares the `271` debt; derivation confirmed live by mutation |
| `tests/requirements-traceability.test.js` | Gate deriving Coverage line from disk, cross-checking definitions ↔ mappings, with WR-01 duplicate check | ✓ VERIFIED | `4/4 pass`; file exists, is picked up by the canonical invocation without being declared anywhere (self-proving the plan 45-01 coverage gate) |
| `.planning/REQUIREMENTS.md` | DEUDA-01/02/03 defined + mapped, Coverage `26/26` | ✓ VERIFIED | Confirmed by grep, all present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `tests/count-arrays-lockstep.test.js` | `tests/fixtures/` | `readdirSync` recursive enumeration vs. canonical globs | ✓ WIRED | Coverage gate present and exercised (verified indirectly via full-suite pass count 1182, matches 1101+63+18(new gate tests)) |
| `tests/count-arrays-lockstep.test.js` | `README.md`, 2 `SKILL.md`, `scripts/run-validation-271.mjs`, itself | lockstep call-site check | ✓ WIRED | Confirmed live: degrading any of these to the old form turns the gate red (README case tested directly; self-file case per WR-05 fix, `CALL_SITES_INVOCACION` now includes `tests/count-arrays-lockstep.test.js`) |
| `tests/count-arrays-lockstep.test.js` | `scripts/run-validation-271.mjs` (output lines) | source-assert + differential comment scanner (CR-02 fix) | ✓ WIRED | Confirmed live by the CR-02 mutation reproduction above |
| `tests/requirements-traceability.test.js` | `.planning/REQUIREMENTS.md` | fail-loud read + regex extraction of rows/definitions/Coverage line | ✓ WIRED | `4/4 pass`, includes the WR-01 duplicate check |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Canonical suite green | `node --test tests/*.test.js tests/fixtures/*.test.js` | `1182/1182`, exit 0 | ✓ PASS |
| Strict suite green | `VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js` | `1200/1200`, exit 0 | ✓ PASS |
| Reporter green | `node scripts/run-validation-271.mjs` | `Milestone gate PASS`, exit 0, banner reads `Gate de cierre de v2.0 — … (18 categorías, 250 slots)` | ✓ PASS |
| DEUDA-01 mutation (avere 20→21) | perl in-place edit + canonical run | `# fail 1`, exit 1, correct diagnostic; old form stays green on same mutation | ✓ PASS |
| CR-01 regression (README → `node --test tests/`) | sed in-place edit + `count-arrays-lockstep` run | `# fail 1`, exit 1, names `README.md` | ✓ PASS |
| CR-01 regression (new test header) | new file `tests/zz-mutante.test.js` + `count-arrays-lockstep` run | `# fail 1`, exit 1, names the new file | ✓ PASS |
| DEUDA-02 mutation (delete `fare-indefiniti`) | perl in-place delete + `count-arrays-lockstep` run | `# fail 1`, exit 1, names exactly `fare-indefiniti` | ✓ PASS |
| DEUDA-03 mutation (`.planning/STATE.md` milestone→v9.9) | sed in-place edit + reporter run | banner reads `v9.9` verbatim | ✓ PASS |
| CR-02 regression (partial blanking of reporter tail) | python injection of regex literal + hand-written milestone in tail + `count-arrays-lockstep` run | `# fail 1`, exit 1, "el escaner … y el reconocedor naive DISCREPAN" | ✓ PASS |
| Requirements traceability gate | `node --test tests/requirements-traceability.test.js` | `4/4 pass`, exit 0 | ✓ PASS |
| `git status --short` clean after every mutation revert | `git status --short` | only pre-existing untracked `.gitkeep` / `.cache` | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|--------------|-------------|-------------|--------|----------|
| DEUDA-01 | 45-01 | `tests/fixtures/` in canonical invocation, gated by disk-derived coverage check | ✓ SATISFIED | Confirmed by direct mutation (Truth #1, #2 above) |
| DEUDA-02 | 45-02 | Third count array in anti-blindness gate | ✓ SATISFIED | Confirmed by direct mutation (Truth #3) |
| DEUDA-03 | 45-03 | Reporter derives milestone instead of transcribing, congealed by test | ✓ SATISFIED | Confirmed by direct mutation (Truth #4, #5), plus human checkpoint `approved` (2026-08-13) recorded in `45-03-SUMMARY.md` |

No orphaned requirements: all three DEUDA IDs exist in both ROADMAP and REQUIREMENTS.md, and the
requirements-traceability gate itself confirms zero orphans as of this run.

### Anti-Patterns Found

None of the blocker class (no unresolved `TBD`/`FIXME`/`XXX` without a tracking reference found in
the files this phase modified). `grep` across `tests/count-arrays-lockstep.test.js`,
`tests/requirements-traceability.test.js`, and `scripts/run-validation-271.mjs` for these markers
returned nothing live (only within historical audit-trail prose, which is explicitly declared as
deliberately retained).

### Deuda aceptada, no contada como gap (per verification_stance, confirmed present in this run)

| Item | Where declared | Confirmed present |
|------|------|------|
| D-45-09 — `271` in the reporter's filename is a stale historical count | `scripts/run-validation-271.mjs:15` header | ✓ Confirmed |
| D-45-06 — WR-12 of `44-REVIEW.md` left open by decision | `tests/count-arrays-lockstep.test.js`, `45-02-SUMMARY.md` | ✓ Confirmed present in SUMMARY |
| D-45-15 — the traceability gate doesn't cross-check against `ROADMAP.md` (catches half-edits, not total omission) | `tests/requirements-traceability.test.js` header, `45-04-SUMMARY.md` | ✓ Confirmed, and independently re-derived by this verifier: with `git show HEAD~1:.planning/REQUIREMENTS.md` restored (pre-plan-04 state, 23/23, no DEUDA rows) the gate would have reported green — the SUMMARY's own refutation of the plan's over-claim is accurate |
| A bare `node --test` (no args) mention is out of the CR-01 lockstep's scope, declared in `45-REVIEW-FIX.md` | `tests/count-arrays-lockstep.test.js` header near the CR-01 fix | ✓ Confirmed by reading the test title change ("en TODAS sus invocaciones con argumentos") |
| 4 INFO findings of `45-REVIEW.md` (IN-01..IN-04) left untouched, out of `critical_warning` scope | `45-REVIEW-FIX.md` frontmatter (`findings_in_scope: 7`) | ✓ Confirmed out of scope by design, not silently dropped |

### Documentary hygiene gap — flagged per verification_stance, not blocking phase goal

> **RESOLVED at phase close (2026-08-13), by author decision.** `D-45-05` stays with 45-02's
> "Option A" (reserved at plan time in the committed `45-02-PLAN.md`, so it has priority). 45-01's
> improvised decision — "the documentary lockstep counts occurrences instead of `includes()`" —
> was renumbered to **`D-45-16`**, the first free ID (`D-45-01`..`D-45-15` were all taken). Applied
> across `.planning/STATE.md` and all four SUMMARY files; the collision notes in 45-02/03/04 now
> record the resolution rather than deferring it. The paragraph below is preserved as the finding
> that prompted the fix.

**Unresolved `D-45-05` decision-ID collision.** Two live decisions share the ID `D-45-05`:
`45-01-SUMMARY.md` uses it for "the documentary lockstep counts occurrences instead of using
`includes()`", and `45-02-PLAN.md`/`45-02-SUMMARY.md` reserve it for "Option A (reform the array)".
The renumbering proposed across the phase's own SUMMARYs (`45-02-SUMMARY.md` → rename the 45-01
one to `D-45-08`) was itself overtaken because `45-03-SUMMARY.md` claimed `D-45-08` for something
else (the STATE.md-as-source decision) before the renumbering was ever applied. As of this
verification run, `git log`/`grep` confirm **no commit resolves this collision** — it is still
open across four SUMMARY files (`45-01`, `45-02`, `45-03`, `45-04`), each acknowledging it and
deferring the fix to "phase close."

This is not a code defect and does not affect DEUDA-01/02/03 (none of the tests reference decision
IDs), so it does not block the phase goal. But per this phase's own thesis — that records must not
lie — an unresolved duplicate decision ID in the phase's own audit trail is exactly the kind of
loose end the phase exists to eliminate, one level up in the paperwork rather than the code. It is
reported here as a WARNING for human decision at phase close (renumber one of the two, e.g. the
45-01 one to an ID that doesn't collide with `D-45-08`, `D-45-09`, `D-45-12`, or `D-45-15`, all of
which are already taken).

### Human Verification Required

None required for phase closure. The one item that structurally needed human sign-off —
DEUDA-03's checkpoint on the reporter's printed output ("¿te dice la verdad a ti?") — was already
resolved: `45-03-SUMMARY.md` records `approved` (2026-08-13), and this verifier confirmed the
reporter's live output today matches what was approved (`Gate de cierre de v2.0 — … (18
categorías, 250 slots)`, footer `/gsd-complete-milestone v2.0`).

### Gaps Summary

No gaps against the three ROADMAP success criteria. Both critical findings from the phase's
internal code review (CR-01, CR-02) were independently re-verified as fixed by direct mutation in
this session, not accepted from `45-REVIEW-FIX.md`'s own tables. All five WR-warnings from that
review were spot-checked and found applied (WR-01 duplicate check, WR-02/WR-03 stale-prose
cleanup in README and SKILL.md, WR-04 three-cause fail-soft message, WR-05 self-file lockstep
exemption narrowed). The one open item was a documentary-hygiene warning (the `D-45-05` decision-ID
collision) that the phase's own SUMMARYs already flagged as pending at phase close — reported here
per the verification stance, routed as a WARNING rather than a gap since it does not affect any
must-have truth, artifact, or key link. **It was resolved at phase close** (45-01's decision
renumbered to `D-45-16`); see the resolution note above.

---

_Verified: 2026-08-12T23:06:52Z_
_Verifier: Claude (gsd-verifier)_
