---
phase: 38-verbi-riflessivi
verified: 2026-07-01T18:58:16Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
---

# Phase 38: Verbi riflessivi Verification Report

**Phase Goal:** El autor puede ser examinado sobre los reflexivos: presente (`mi chiamo`/`ti chiami`/`si chiama`), colocación del pronombre ANTES del verbo conjugado, construcción sobre terminaciones regulares (engancha con `presente-regolare`), passato prossimo reflexivo con `essere` + concordancia -o/-a/-i/-e (engancha con `essere`), y 2-3 desajustes reflexivos ES↔IT genuinos. Última de las 4 altas; order 14; autorada por quórum R1-R7.
**Verified:** 2026-07-01T18:58:16Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
| - | ----- | ------ | -------- |
| 1 | Presente reflexivo en todas las personas + colocación del pronombre ANTES del verbo (word-buttons con orden-distractor `*sveglio mi`) | ✓ VERIFIED | `riflessivi-presente` (MC, io/tu/noi con `mi chiamo`/`ti svegli`/`ci alziamo`, distractoras de orden invertido `chiamo mi`/`svegli ti`). `riflessivi-collocazione-wb` (word-buttons, 1 slot) con distractores `sveglio mi` y `laviamo ci` (verbo-antes-pronombre) en el banco → fuerza `mi sveglio`/`ci laviamo`. Confirmado por parse node. |
| 2 | Reflexivo sobre terminaciones regulares enganchado a presente-regolare + trío mismatch ES↔IT genuino sin trampas falsas | ✓ VERIFIED | `riflessivi-su-regolari` (`si alza` -are base, `vi vestite` -ire). `riflessivi-mismatch` = EXACTAMENTE el trío: `mi ammalo` (ammalarsi reflexivo), `ti dimentichi di` (dimenticarsi+di), `sale` (salire NO-reflexivo; `si sale` = distractora del calco). Los 3 con gloss ES `(en español: …)`. No hay verbos coincidentes falsos. |
| 3 | Passato prossimo reflexivo con essere + concordancia -o/-a/-i/-e: slot dedicado, 4 terminaciones como variantes, cue por nombres propios, CERO avere (MAGNET análogo pr-301) | ✓ VERIFIED | `riflessivi-pp-concordanza` (MC, 4 variantes): Marco→`si è svegliato`(-o), Maria→`si è svegliata`(-a), i ragazzi→`si sono alzati`(-i), le ragazze→`si sono alzate`(-e). CERO `avere` en ningún key correcto (grep node: NONE); distractora `avere` presente y obligatoria (`si ha…`/`si hanno…`). SIN gloss ES (D-38-01, 0/4). Options usan `si è` acentuado (18 accented, 0 bare en options; los 10 bare `si e` viven solo en texto de `concerns` de auditoría, no user-facing). |
| 4 | 2 cruces multi-cat (categoryIds de 2) que propagan la cascada D-54 y NO añaden call-sites (EXACTAMENTE 2 de applyImmediateFailure) | ✓ VERIFIED | `riflessivi-300` categoryIds sorted = `[presente-regolare, riflessivi]`; `riflessivi-301` = `[essere, riflessivi]`; ambos al tail del array (últimos 2). `grep -c "applyImmediateFailure(this.state" src/screens/app.js` = **2**. `git diff` de `app.js`+`progress.js` = VACÍO (ENGINE CLEAN). Test de cascada multi-cat real sobre `riflessivi.json` PASA (subtest 12: "propagates cascade to all its categoryIds"). |
| 5 | Todas las variantes validated por quórum cross-vendor R1-R7 (≥2 by distintos); explanations acentuadas + gloss canónico + sin leak; carga en boot y aparece en home/picker/Repaso/Examen | ✓ VERIFIED | 7/7 slots `status: validated`, todos con ≥3 `by` distintos incluyendo `claude-sonnet-4-6` (sello canónico), todos `verdict: correcta`. MAGNET + riflessivi-301 con 4 `by` (ronda extra `deepseek-reasoner`). Sin R1 leak en prompts (scan: NONE). Boot genérico: `content-loader.js:111-118` itera `categories.json` y hace fetch de `content/exercises/<cid>.json`; `app.js:3020 categoriesForDisplay` itera `content.exerciseById` por categoryIds → riflessivi (order 14) aparece sin código nuevo. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `content/exercises/riflessivi.json` | 7 slots (5 REFLEX + 2 cruces), born-in-slots, 0-match | ✓ VERIFIED | Parses OK. 7 exercises, all ids prefixed `riflessivi-`. 0 `type:"match"`. `notes` documenta 0-match + scope-gate recíprocos. |
| `content/categories.json` | append riflessivi order 14 (id/name/order, NO origen) | ✓ VERIFIED | 14 entradas; `riflessivi` order 14 = último; keys exactamente `id/name/order`; sin `origen`; `modali` sigue order 13. |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| categories.json | riflessivi.json | content-loader fetch loop | ✓ WIRED | `content-loader.js:117` `content/exercises/${cid}.json` genérico |
| riflessivi-300 | presente-regolare, riflessivi | categoryIds + applyResultToSession | ✓ WIRED | cascade test PASS, 0 call-sites nuevos |
| riflessivi-301 | essere, riflessivi | categoryIds + applyResultToSession | ✓ WIRED | cascade test PASS, análogo pr-301 |
| content.categories | home/picker/Repaso/Examen | categoriesForDisplay array iteration | ✓ WIRED | itera exerciseById por categoryIds; no per-category code |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| JSON parses + 7 slots | `node -e JSON.parse` | 7 exercises, PARSE OK | ✓ PASS |
| CERO avere en keys | `node` grep keys | NONE | ✓ PASS |
| avere distractor presente (MAGNET/301) | `node` | true/true | ✓ PASS |
| D-54 call-sites = 2 | `grep -c` | 2 | ✓ PASS |
| Engine unchanged | `git diff --quiet` | ENGINE CLEAN | ✓ PASS |
| Test suite | `node --test tests/*.test.js` | 598 pass / 1 fail | ✓ PASS (fail es pre-existente ajeno) |
| riflessivi cascade test | subtest 12 | ok | ✓ PASS |

### Probe Execution

No conventional `scripts/*/tests/probe-*.sh` for content phases. Verification used the project test suite + `validate-content-fixture` (documented PASS in 38-02-SUMMARY V5). N/A.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| REFLEX-01 | 38-01 | Presente reflexivo todas las personas | ✓ SATISFIED | riflessivi-presente |
| REFLEX-02 | 38-01 | Colocación pronombre ANTES del verbo (word-buttons) | ✓ SATISFIED | riflessivi-collocazione-wb con orden-distractor |
| REFLEX-03 | 38-01 | Reflexivo sobre terminaciones regulares | ✓ SATISFIED | riflessivi-su-regolari + riflessivi-300 cruce |
| REFLEX-04 | 38-01 | pp reflexivo con essere + concordancia (MAGNET) | ✓ SATISFIED | riflessivi-pp-concordanza + riflessivi-301 |
| REFLEX-05 | 38-01 | 2-3 desajustes ES↔IT genuinos | ✓ SATISFIED | riflessivi-mismatch (ammalarsi/dimenticarsi(di)/salire) |

### Anti-Patterns Found

None. No debt markers (TBD/FIXME/XXX/TODO) in riflessivi.json or categories.json. No stub returns, no empty-data hollow slots. The 10 bare `si e` strings are confined to `validation.passes[].concerns` auditor prose (internal metadata), NOT to any user-facing option/prompt — all 18 user-facing auxiliary forms are accented `si è`.

### Deliberate Design Decisions (NOT gaps)

- **0-match** — intentional per D-04/D-38-03 (pronombre↔persona es mecánico); documentado en `notes`.
- **No gloss ES en pp-concordanza/riflessivi-301** — intentional per D-38-01 (el español no concuerda el participio).
- **Counts en rojo hasta Phase 39** — expected (count-sync + TOTAL_EXPECTED + origen/PROV-01 son de Phase 39 lockstep).
- **1 failing test `genero-numero.json` (espera 12, hay 13)** — PRE-EXISTING and out of scope, documented in CONTEXT/STATE since v1.6. Unrelated to riflessivi.

### Human Verification Required

None. All success criteria are structurally verifiable against the codebase (content authoring phase, no visual/runtime UI behavior introduced; boot/display integration is generic and confirmed by reading the integration points + the passing cascade test).

### Gaps Summary

No gaps. All 5 success criteria are verified against the actual codebase, not merely the SUMMARY claims. The MAGNET pp-concordanza was independently re-verified (4 endings, cue por nombres propios, zero-avere keys, avere distractors present, zero ES gloss). Both cruces confirmed at the array tail with correct sorted categoryIds, propagating the D-54 cascade without adding call-sites (grep = 2, engine diff empty, real cascade test green). Quorum: 7/7 validated with canonical `claude-sonnet-4-6` seal + DeepSeek reinforcement (extra reasoner round on both concordance nodes). Category registered order 14, loads and displays generically.

---

_Verified: 2026-07-01T18:58:16Z_
_Verifier: Claude (gsd-verifier)_
