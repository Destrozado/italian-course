---
phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica
verified: 2026-06-09T00:00:00Z
status: passed
score: 10/10 must-haves verified
overrides_applied: 0
---

# Phase 27: Sostantivi irregolari a slots (Contenido léxica) Verification Report

**Phase Goal:** Sostantivi irregolares se convierte al modelo unificado slot+variantes — los 31 ejercicios validados se reagrupan en slots con explicación a nivel de slot (D-04 respetada: plurales derivables por raíz → multiple-choice, no match). La decisión "regla-con-variantes O slots-de-1" queda documentada explícitamente (no se fuerzan variantes artificiales). SI hay regla → se autoran variantes nuevas por quórum cross-vendor R1-R7 (4× correcta, 1-por-1); SI léxica pura → se documenta que no aplica autoría. La estructura final pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations preservada. Con esta fase, las 9 categorías de gramática quedan en formato slot+variantes unificado: CONV-01 cerrado.
**Verified:** 2026-06-09
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `sustantivos-irregulares.json` es valid slot+variantes: 5 slots, 0 payload keys, every slot has non-empty top-level explanation, all type: multiple-choice, 44 total variants | ✓ VERIFIED | Validator exits 0 (5 ejercicios); payload:0; slots sin explanation:0; no-MC:0; total variants:44 confirmed by live node commands |
| 2 | Decisión híbrida documentada (SOST-01): 27-REAGRUPACION-MAP.md documenta explícitamente la decisión por bloque; cambio-radice y plurali-regolari tienen 8 variantes cada uno sin variantes nuevas (SOST-01); sólo los 3 slots del bloque regla reciben variantes nuevas (SOST-02) | ✓ VERIFIED | 27-REAGRUPACION-MAP.md contiene sección "Decision hibrida por bloque (SOST-01/SOST-02)" con 12+ referencias explícitas; cambio-radice variants:8 y plurali-regolari variants:8 confirmados intactos |
| 3 | Nuevas variantes pasaron quórum (27-VARIANTES-NUEVAS.md): 13/13 validadas ≥4× correcta, 0 incorrecta; 4 casos de doble-validez R7 resueltos por reformulación; base canónica Opus 4.8 + Sonnet 4.6 | ✓ VERIFIED | 27-VARIANTES-NUEVAS.md tabla de resultados muestra 13 rows con status:validated, opus✓ sonnet✓ + ≥2 externos distintos; 4 reformulaciones documentadas con evidencia de la doble-validez cazada |
| 4 | Counts sincronizados (D-27-13): exercise-types.test.js, slot-variants-integration.test.js y run-validation-271.mjs muestran sustantivos-irregulares expected=5; TOTAL_EXPECTED=183 | ✓ VERIFIED | grep confirma: exercise-types.test.js:1269 expected:5; slot-variants-integration.test.js:171 expected:5; run-validation-271.mjs expected:5 y TOTAL_EXPECTED=183 |
| 5 | Suite completa verde: `node --test tests/*.test.js` exits 0 (374/374 pass); VAL_07_STRICT exits 0 (383/383); `node scripts/run-validation-271.mjs` exits 0 (PASS 183/183) | ✓ VERIFIED | Suite 374 pass/0 fail; strict 383 pass/0 fail; reporter: VAL-06 PASS (183/183), VAL-08 PASS, VAL-04 PASS; Milestone gate PASS |
| 6 | CONV-01 cerrado: las 9 categorías de gramática están en formato slot+variantes | ✓ VERIFIED | Node command verifica 9/9 archivos: all-slot:true any-payload:false en preposiciones(49), articoli(34), avere(20), essere(26), genero-numero(12), partitivos(19), profesiones(11), sustantivos-irregulares(5), verbos-movimiento(7) |
| 7 | SOST-01 y SOST-02 marcados Done en REQUIREMENTS.md | ✓ VERIFIED | REQUIREMENTS.md líneas 88-89: SOST-01 "Done (27-03)", SOST-02 "Done (27-02)"; 14/14 requirements mapped ✓ |
| 8 | Slots separados por sub-regla (granularidad fina D-27-02): sovrabbondanti, invariabili-accentate, invariabili-straniere son slots distintos | ✓ VERIFIED | Node confirms: sovrabbondanti:true, inv-accentate:true, inv-straniere:true; los 3 ids existen como entidades separadas en el JSON |
| 9 | Duplicado tempio (#008==#025) presente como 2 variantes con answer "templi" en slot cambio-radice (D-27-05) | ✓ VERIFIED | Node: templi variants in cambio-radice:2 |
| 10 | Ninguna explanation referencia categorías Genere e numero / Articoli por id o prosa (D-27-06); sin smart-quotes; 0 cruces 300..305 | ✓ VERIFIED | refs cross-cat:0; smart-quotes grep: 0 matches; cruces:0; mal-cat:0 |

**Score:** 10/10 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/sustantivos-irregulares.json` | Reescrito a 5 slots slot+variantes HIBRIDO | ✓ VERIFIED | 5 slots, 44 variants, validator exit 0; all MC, no payload, explanations present |
| `27-REAGRUPACION-MAP.md` | Mapa auditable con decisión híbrida documentada por bloque | ✓ VERIFIED | Existe con tablas detalladas de los 31 ids fuente, sección "Decision hibrida" explícita, secciones sin-cruces, sin-snapshot, MC-only |
| `27-VARIANTES-NUEVAS.md` | Registro de 13 variantes nuevas con resultados de quórum | ✓ VERIFIED | Existe con 13 rows de resultados, 3 ejes documentados, sección explícita de bloque lexico/contraste sin variantes |
| `tests/exercise-types.test.js` | Count sustantivos-irregulares sincronizado a 5 | ✓ VERIFIED | Línea 1269: expected:5 |
| `tests/fixtures/slot-variants-integration.test.js` | Count sustantivos-irregulares sincronizado a 5 | ✓ VERIFIED | Línea 171: expected:5 |
| `scripts/run-validation-271.mjs` | expected:5 + TOTAL_EXPECTED:183 + historial con CONV-01 | ✓ VERIFIED | expected:5 en línea 166; TOTAL_EXPECTED=183 en línea 170; comentario de historial referencia CONV-01 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `sustantivos-irregulares.json` | `validateContent / normalizeExerciseToSlot` | shape slot+variantes (payload XOR variants[]) | ✓ WIRED | `node scripts/validate-content-fixture.mjs` exits 0 |
| Hardcodes en 3 archivos de test/script | `data.exercises.length` real de `sustantivos-irregulares.json` | sincronización contra conteo REAL del JSON | ✓ WIRED | Los 3 valores coinciden en 5; TOTAL_EXPECTED=183=209−31+5 verificado |
| 13 variantes nuevas del bloque regla | `validation.passes[]` de sus slots | quórum cross-vendor (≥4 pases by distintos, todos correcta) | ✓ WIRED | 27-VARIANTES-NUEVAS.md muestra 13/13 validated; slots existentes conservan validation top-level de 27-01; `slots without validation.status validated:0` |
| Bloque lexico/contraste (cambio-radice, plurali-regolari) | Sin variantes nuevas (SOST-01) | documentación explícita en mapa + VARIANTES-NUEVAS | ✓ WIRED | Ambos slots tienen exactamente 8 variants tras 27-01+27-02; VARIANTES-NUEVAS sección explícita documenta el no-engorde |

---

### Data-Flow Trace (Level 4)

Phase 27 is a pure content conversion (JSON authoring + test count sync) — no dynamic data rendering artifacts introduced. The validator and runtime engine are unchanged from prior phases. The JSON flows through the existing loader/validator pipeline, verified by the smoke test suite (374/374 pass). No Level 4 trace is required beyond the validator and smoke exit codes.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Validator accepts 5 slots | `node scripts/validate-content-fixture.mjs sustantivos-irregulares content/exercises/sustantivos-irregulares.json` | "OK validación: 5 ejercicio(s)" | ✓ PASS |
| Full test suite green | `node --test tests/*.test.js` | 374/374 pass, 0 fail | ✓ PASS |
| Strict VAL_07 green | `VAL_07_STRICT=1 node --test tests/*.test.js` | 383/383 pass, 0 fail | ✓ PASS |
| Milestone reporter green | `node scripts/run-validation-271.mjs` | exit 0; PASS (183/183) | ✓ PASS |
| CONV-01 state (9/9 all-slot) | node multi-file check | all 9 files: all-slot:true, any-payload:false | ✓ PASS |

---

### Probe Execution

No probes declared in PLAN.md files for this phase. No `probe-*.sh` files exist for this phase. Step 7c: SKIPPED (no probes declared or applicable).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SOST-01 | 27-01, 27-03 | 31 ejercicios reagrupados a slots con explanation; validator + smoke verdes; counts re-sincronizados | ✓ SATISFIED | 5 slots, validator exit 0, suite 374/374, counts=5 en 3 archivos, TOTAL_EXPECTED=183 |
| SOST-02 | 27-02 | Variantes nuevas donde hay regla (bloque regla); documentado que bloque léxico/contraste no admiten autoría | ✓ SATISFIED | 13 variantes nuevas en los 3 slots del bloque regla; 27-VARIANTES-NUEVAS.md con sección explícita de no-autoría; 13/13 ≥4× correcta |

**Coverage: 2/2 requirements satisfied ✓ — 0 orphans, 0 gaps.**

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No anti-patterns found in modified files |

Scan applied to: `content/exercises/sustantivos-irregulares.json`, `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`. Zero TBD/FIXME/XXX markers; zero placeholder strings; zero smart-quotes; zero empty implementations; zero stub patterns.

---

### Human Verification Required

None. This phase is a content-conversion + count-sync phase. All observably testable behaviors were verified programmatically:
- JSON structure and validator correctness via `validate-content-fixture.mjs`
- Full test suite via `node --test`
- Milestone gate via `run-validation-271.mjs`
- All 9 grammar categories confirmed in slot+variantes format

The quórum cross-vendor (Opus + Sonnet + DeepSeek) serves as the pedagogical quality gate for new variants. No UI, real-time, or visual behavior was introduced.

---

### Gaps Summary

No gaps. All 10 must-have truths verified against the live codebase. The phase goal is fully achieved.

**Key findings confirming goal achievement:**

1. **`sustantivos-irregulares.json` is correct slot+variantes:** 5 slots (3 bloque regla + 1 léxico + 1 contraste), 44 variants (31 original + 13 new), 0 payload keys, all MC, all explanations present, validator green.

2. **Hybrid decision documented explicitly (SOST-01):** The 27-REAGRUPACION-MAP.md has a dedicated "Decision hibrida por bloque" section covering all three blocks. The cambio-radice and plurali-regolari blocks have exactly 8 variants each with no new variants — the no-authoring is documented as explicit SOST-01 compliance.

3. **New variants author-verified (SOST-02):** 13/13 surfaces passed quórum (≥4× correcta, 0 incorrecta), with 4 real double-validity bugs caught by the cross-vendor quórum and resolved by reformulation (not override shortcut). Documented 1-by-1 in 27-VARIANTES-NUEVAS.md.

4. **Counts synced (D-27-13):** All 3 hardcodes read expected:5; TOTAL_EXPECTED=183 (= 209 − 31 + 5); reporter PASS (183/183).

5. **CONV-01 closed:** All 9 grammar categories verified as all-slot:true / any-payload:false on disk.

---

_Verified: 2026-06-09_
_Verifier: Claude (gsd-verifier)_
