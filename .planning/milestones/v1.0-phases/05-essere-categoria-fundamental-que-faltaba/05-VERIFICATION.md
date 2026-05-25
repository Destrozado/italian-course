---
phase: 05-essere-categoria-fundamental-que-faltaba
verified: 2026-05-24T00:00:00Z
status: passed
score: 5/6 must-haves verified + post-hoc validation: la categoría Essere (39 ejercicios) está en producción y se usa extensivamente en Phases 7.2 (39 explanations) y Phase 8 (Modo Examen aplica a Essere igual que al resto). Sign-off retroactivo durante cierre milestone v1.0.
overrides_applied: 1
override_notes: "Originalmente status: human_needed esperando UAT formal. Post-hoc validado durante cierre milestone v1.0: Essere shipped 2026-05-24 y se ha usado sin issues en Phases 6/7/7.1/7.2/8. Sign-off retroactivo del autor durante cierre milestone."
gaps: []
human_verification:
  - test: "Lanzar Repaso 20 incluyendo essere y completar sin errores de UX/grading; luego fallar deliberadamente essere-302 y observar cascada D-54 en el resumen"
    expected: "Ambas categorías (essere + verbos-movimiento) aparecen como `no-hecha` con racha 0 en el resumen. La sesión corre de principio a fin sin errores de rendering o grading."
    why_human: "UAT en navegador real. La correctitud del grading de los 39 ejercicios y la visibilidad del efecto cascada en la pantalla de resumen no se puede verificar programáticamente sin un browser headless."
---

# Phase 5: Essere — categoría fundamental que faltaba — Verification Report

**Phase Goal:** La app tiene una categoría `essere` con cobertura A1 completa (conjugación presente + identidad + profesión + nacionalidad + estado + contraste con avere) que el autor puede practicar en sesiones reales, incluyendo al menos 1 ejercicio multi-categoría que cruza essere con otra categoría existente para ejercitar la cascada D-54.
**Verified:** 2026-05-24
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `categories.json` has 7 entries with essere order:2 and all orders shifted correctly (D-99) | VERIFIED | `python3` assertion passed: 7 entries, orders {1..7} unique, avere=1, essere=2, preposiciones=3, verbos-movimiento=4, sustantivos-irregulares=5, genero-numero=6, profesiones=7 |
| 2 | `essere.json` exists with ≥30 exercises, schema-valid, NFC-normalized on load, ASCII apostrophes | VERIFIED | 39 exercises confirmed by count; `validate-content-fixture.mjs essere` exits 0; no U+2018/U+2019 found (Python unicode scan confirms ASCII-only apostrophes) |
| 3 | Coverage spans all 7 sub-areas: conjugación presente (6 persons), identidad, nacionalidad, profesión, estado, cópula clasificatoria, participio stato/stata/stati/state | VERIFIED | All 7 sub-areas confirmed by ID-range inspection; essere-001..008 cover io/tu/lui/lei/noi/voi/loro + 2 variants; all 4 participio forms (stato/stata/stati/state) appear in essere-026..029 and essere-103 |
| 4 | DESIGN RULE Phase 4 applied: 0 match exercises; all 35 multi-choice satisfy D-91 (exactly 1 avere form + 2 essere mal-conjugated + 1 correct = 4 options) | VERIFIED | `python3 D-91 assertion passed` — 0 violations across all 35 mc; match count = 0 confirmed |
| 5 | ≥1 multi-cat exercise with categoryIds: ["essere", <otra>] covering essere-300..305 with exact pairings | VERIFIED | 6 cruces confirmed: essere-300(essere+avere), essere-301(essere+profesiones), essere-302(essere+verbos-movimiento), essere-303(essere+genero-numero), essere-304(essere+sustantivos-irregulares), essere-305(essere+preposiciones) |
| 6 | UAT humano: autor ran Repaso 20 including essere, completed without UX/grading errors; deliberately failed multi-cat essere-302, observed cascada D-54 in summary | NEEDS HUMAN | SUMMARY.md claims UAT-A..UAT-F all PASS confirmed by user "PASS" reply — but this is not programmatically verifiable; requires human attestation |

**Score:** 5/6 truths auto-verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/categories.json` | 7 entries with essere order:2 | VERIFIED | File exists, 7 entries, all orders 1-7 correct |
| `content/exercises/essere.json` | ≥30 exercises, schema-valid, ASCII apostrophes | VERIFIED | 39 exercises, validate-content-fixture.mjs exits 0, no curly apostrophes |
| `tests/domain.test.js` | Parametric smoke covers essere cascade | VERIFIED | Test "applyImmediateFailure on a real multi-cat exercise from essere.json" passes; readdirSync iterates ALL content files |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `content/categories.json` | `content/exercises/essere.json` | content-loader.js iterates categories dynamically | WIRED | `"id":"essere"` confirmed in categories.json; content-loader.js unchanged (no modifications to src/) |
| `content/exercises/essere.json` multi-cat | `src/domain/progress.js applyImmediateFailure` | categoryIds: ["essere", <otra>] triggers D-54 cascade | WIRED | Test confirms cascade fires for essere-300 (essere+avere); all 6 multi-cat have 2-element categoryIds |
| `src/data/content-loader.js` | `src/data/schema-validator.js` | validateContent over all 7 files on boot | WIRED | Bundle test in domain.test.js: "whole content bundle passes validateContent" — passes with 7 files |

### Data-Flow Trace (Level 4)

Not applicable — Phase 5 is 100% content (JSON files + test extension). No new runtime components render dynamic data; the existing content-loader.js and Alpine rendering pipeline are unchanged. The data flow is: categories.json → content-loader.js → schema-validator.js → appShell → session (unchanged from Phase 3/4). Verification of this pipeline is covered by the 145-test suite and UAT.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Schema validation passes for essere.json | `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` | `OK validación: 39 ejercicio(s) en content/exercises/essere.json (slug=essere)` | PASS |
| Full test suite green | `node --test tests/*.test.js` | `# tests 145 / # pass 145 / # fail 0` | PASS |
| D-91 distractor pattern holds across all 35 mc | Python assertion (sum avere forms == 1, len options == 4) | No violations | PASS |
| D-94 multi-cat categoryIds exact | Python assertion on 6 cruces | All 6 match expected pairs | PASS |
| essere cascade D-54 test | `node --test tests/domain.test.js` (essere subtest) | `ok 2 - applyImmediateFailure on a real multi-cat exercise from essere.json...` | PASS |

### Probe Execution

No probes declared or applicable. Phase 5 has no `scripts/*/tests/probe-*.sh` files. Content-only phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEED-03 | 05-01-PLAN.md | Essere as 7th category with A1 coverage + ≥1 multi-cat cascade | SATISFIED (implementation) | All deliverables exist and pass; implementation complete. Note: REQUIREMENTS.md still shows `[ ] SEED-03` (open checkbox) — tracking artifact only, does not affect implementation status. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `.planning/REQUIREMENTS.md` | 70 | SEED-03 marked `[ ]` (unchecked) despite being implemented | INFO | Tracking artifact only — no implementation impact. SUMMARY.md claims "requirements-completed: SEED-03". Implementation verified by codebase evidence. |
| `.planning/STATE.md` | metrics table | Exercise count shows 232 (pre-Phase 5), not updated to 271 | INFO | Tracking artifact only — no implementation impact. The actual files contain 271 exercises (232 + 39). |

No TBD, FIXME, or XXX markers found in essere.json or categories.json. No stub patterns in content files.

---

## Dimension 1: ROADMAP §Phase 5 — 6 Success Criteria

### 1.1 categories.json — 7 entries, essere order:2 (PASS)

Python assertion exits 0:
- 7 entries total
- Orders set = {1,2,3,4,5,6,7} (all unique, no gaps)
- avere=1, essere=2, preposiciones=3, verbos-movimiento=4, sustantivos-irregulares=5, genero-numero=6, profesiones=7
- Name: "Essere (cópula)" following the "Avere (auxiliar)" parenthetical pattern

### 1.2 essere.json — ≥30 exercises, schema-valid, NFC, ASCII apostrophes (PASS)

- 39 exercises (exceeds minimum by 9)
- `validate-content-fixture.mjs essere content/exercises/essere.json` exits 0 with message `OK validación: 39 ejercicio(s)`
- No U+2018/U+2019 (curly apostrophes) found by Python unicode scanner
- Initial grep false alarm: the shell pattern `grep -P "['']"` matched backtick characters in notes fields — those are ASCII U+0060, not apostrophes. Targeted unicode check confirms D-98 compliance.

### 1.3 Coverage — 7 sub-areas including participio (PASS)

All 7 sub-areas confirmed present:
- Conjugación presente: essere-001..008 (io/tu/lui/lei/noi/voi/loro + interrogación + negación = 8 exercises)
- Identidad: essere-009..012 + essere-100 wb
- Nacionalidad: essere-013..015 + essere-101 wb
- Profesión: essere-016..019 + essere-102 wb (with explicit avere contrast)
- Estado/condición: essere-020..023 (including essere-020 `Maria è stanca` — falso amigo crítico)
- Cópula clasificatoria: essere-024..025
- Participio passato prossimo: essere-026..029 (4 mc) + essere-103 wb — covers all 4 forms stato/stata/stati/state with masc/fem × sing/pl concordance

### 1.4 DESIGN RULE Phase 4 applied (PASS)

- 0 match exercises in essere.json (design rule: essere conjugation derivable by root — no match justified)
- D-91 pattern verified by Python script across all 35 multi-choice exercises: every exercise has exactly 4 options with exactly 1 avere form (ho/hai/ha/abbiamo/avete/hanno), 0 violations found

### 1.5 ≥1 multi-cat cruce with cascada D-54 (PASS)

6 multi-cat exercises confirmed with exact D-94 categoryIds:
- essere-300: ["essere","avere"] — `Mio fratello ___ medico e ha trent'anni`
- essere-301: ["essere","profesiones"] — `Lei ___ avvocata`
- essere-302: ["essere","verbos-movimiento"] — `Maria ___ andata al cinema` (D-95 UAT trigger)
- essere-303: ["essere","genero-numero"] — `Noi ___ italiani di Milano`
- essere-304: ["essere","sustantivos-irregulares"] — `Le mie braccia ___ stanche`
- essere-305: ["essere","preposiciones"] — `Io ___ di Milano e parlo italiano`

Test confirms D-54 cascade fires on essere.json multi-cat exercises: `ok 2 - applyImmediateFailure on a real multi-cat exercise from essere.json propagates cascade to all its categoryIds`

### 1.6 UAT humano — Repaso 20 + cascada observada (NEEDS HUMAN)

SUMMARY.md claims UAT-A..UAT-F all PASS. The test suite and schema validation provide strong automated coverage, but end-to-end UX behavior (rendering all 39 exercises without grading errors, observable cascade in the summary screen after failing essere-302) requires human browser verification.

---

## Dimension 2: CONTEXT.md Locked Decisions (D-89..D-99)

| Decision | Expected | Codebase Evidence | Status |
|----------|----------|-------------------|--------|
| D-89: 35 mc + 4 wb + 0 match | 35 mc + 4 wb + 0 match total (29 base mc + 6 multi-cat mc + 4 wb) | Confirmed by Python: mc=35, wb=4, match=0 | PASS |
| D-90: 4 word-buttons (identidad=essere-100, nacionalidad=essere-101, profesión=essere-102, participio=essere-103) | Exact IDs | All 4 IDs present in essere.json with correct sub-area coverage | PASS |
| D-91: distractor pattern in ALL multi-choice | 1 avere + 2 essere mal + 1 correct, 4 options | Python assert: 0 violations across 35 mc | PASS |
| D-92: 8+5+4+5+4+2+5=33 base + 6 multi-cat = 39 | Exact quantitative split | Verified: conj=8, identidad=5, nac=4, prof=5, estado=4, copula=2, participio=5 → base=33; +6 multi-cat=39 | PASS |
| D-93: participio stato/stata/stati/state (4 forms, 5 exercises) | 4 mc + 1 wb | essere-026..029 + essere-103 confirmed; all 4 forms present in JSON blob | PASS |
| D-94: 6 multi-cat with exact categoryIds pairings | essere-300..305 with exact pairs | Python assert: exact match on all 6 IDs and all 6 categoryIds sets | PASS |
| D-98: ASCII apostrophes only | No U+2018/U+2019 | Python unicode scanner: 0 curly apostrophes found | PASS |
| D-99: categories.json shift | avere=1, essere=2, others +1 | Confirmed by Python assertion | PASS |

---

## Dimension 3: Phase Invariants

| Invariant | Expected | Evidence | Status |
|-----------|----------|----------|--------|
| APPEND-ONLY: avere.json not modified | No changes to avere.json | avere.json is 268 lines / 9,230 bytes; no modifications to avere.json are claimed in SUMMARY.md key-files; SUMMARY `modified` list does not include avere.json | PASS |
| Zero src/ or index.html changes | No modifications | SUMMARY.md `key-files.created: [essere.json, SUMMARY.md]`; `modified: [categories.json, tests/domain.test.js, STATE.md, ROADMAP.md, REQUIREMENTS.md]` — src/ and index.html absent | PASS |
| Test suite green: 145/145 | Was 130 at Phase 4 + 15 new | `node --test tests/*.test.js` → `# tests 145 / # pass 145 / # fail 0` | PASS |
| SEED-03 in REQUIREMENTS.md | grep returns ≥1 | `grep -c "SEED-03" .planning/REQUIREMENTS.md` returns 1; full text confirms scope | PASS (present; note: checkbox unchecked — tracking artifact) |
| Plan 05-01 complete | SUMMARY.md exists, ROADMAP Phase 5 [x] | SUMMARY.md exists; ROADMAP line 14 shows `[x] Phase 5` with `(completed 2026-05-24)` | PASS |

---

## Dimension 4: Deviations from PLAN

All 4 deviations documented in SUMMARY.md are reasonable and verified:

1. **Task 1 placeholder essere.json** (`{exercises:[]}`) — Prevents HTTP 404 in content-loader between commits. Final file has 39 exercises. Codebase shows no empty placeholder remains. ACCEPTABLE.

2. **Task 6 parametric refactor** — Instead of adding an essere-specific test, refactored to `readdirSync('content/exercises/')` iteration. Strictly better: automatically covers all existing and future categories. Confirmed by test output showing 7 sub-tests (avere, essere, genero-numero, preposiciones, profesiones, sustantivos-irregulares, verbos-movimiento). ACCEPTABLE — strictly better than planned.

3. **essere-008 prompt changed** — Plan exemplified `Maria non ___ stanca, è felice.` where `è felice` spoils the answer. Changed to `Maria non ___ stanca oggi.` — a single-blank prompt without giveaway. Confirmed in file. ACCEPTABLE — pedagogically cleaner.

4. **essere-009 prompt changed** — Plan's `Io ___ Maria.` would duplicate essere-001. Changed to `Mi chiamo Anna e ___ italiana.` Confirmed in file (prompt differs from essere-001 `Io ___ Maria.`). ACCEPTABLE — avoids duplicate prompt ambiguity.

None of the deviations touch locked decisions D-89..D-99.

---

## Human Verification Required

### 1. End-to-End Session with Essere + Cascada D-54 Observation

**Test:** Start `npx serve`, open http://localhost:3000, select essere (and at least one other category, e.g., verbos-movimiento), launch Repaso 20. Complete the full session. Note any rendering glitches, grading errors, or UX issues. Then deliberately run another session containing essere-302 specifically — when prompted with `Maria ___ andata al cinema`, answer incorrectly. Check the summary screen.

**Expected:** The session runs start-to-finish without JS errors, all 39 essere exercises render and grade correctly (green/red feedback matches the `correctIndex` in the JSON), the summary screen shows essere AND verbos-movimiento both reset to `no-hecha` with racha=0 after the deliberate failure on essere-302.

**Why human:** Visual rendering, grading feedback UI, and summary screen content cannot be verified without a browser. The automated cascade test proves the domain logic is correct but not that the Alpine template correctly renders the cascaded state to the user.

---

## Gaps Summary

No implementation gaps found. All 5 auto-verifiable criteria pass with direct codebase evidence:

- categories.json: 7 entries, correct orders — verified by Python
- essere.json: 39 exercises, schema-valid, NFC, ASCII apostrophes — verified by validator + unicode scan
- Coverage: all 7 sub-areas including participio 4 forms — verified by ID inspection
- DESIGN RULE: 0 match, D-91 holds on all 35 mc — verified by Python assertion
- Multi-cat: 6 cruces with exact D-94 pairings, cascade tested — verified by test suite

Two tracking artifacts noted (INFO severity, no implementation impact):
- SEED-03 checkbox in REQUIREMENTS.md remains unchecked (should be `[x]` per SUMMARY.md)
- STATE.md exercise count shows 232 (pre-Phase 5), not updated to 271

Sole remaining item is human UAT for Criterion 6 (browser session + cascade observation).

---

_Verified: 2026-05-24_
_Verifier: Claude (gsd-verifier)_
