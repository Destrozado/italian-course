---
phase: 25-genere-e-numero-a-slots-contenido
verified: 2026-06-08T00:00:00Z
status: passed
score: 3/3 must-haves verified
overrides_applied: 0
re_verification: null
gaps: []
human_verification: []
---

# Phase 25: Genere e numero a slots (contenido) — Verification Report

**Phase Goal:** Genere e numero se convierte al modelo slot+variantes — los 40 ejercicios validados se reagrupan en slots por regla (terminaciones de género masc/fem + formación de plural por terminación), se autoran variantes nuevas que pasan el quórum, y la estructura final pasa el validator y el smoke. Primera de las 3 categorías de morfología/léxico.
**Verified:** 2026-06-08
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Los 40 ejercicios de Genere e numero quedan reagrupados en 12 slots por regla con explanation a nivel de slot; 3 match preservados (D-04); 0 payload; 0 word-buttons; 0 cruces 300-305 | VERIFIED | `genero-numero.json`: 12 slots, 60 variantes, 0 payload, 2 slots type:match, 12 explanations top-level, 0 variantes con explanation propia. `validateContent` exit 0. |
| 2 | GEN-01 cerrado: 3 hardcodes de count (40→12) + TOTAL_EXPECTED (277→249) sincronizados; suite completa verde | VERIFIED | `tests/exercise-types.test.js:1267` expected=12, `slot-variants-integration.test.js:172` expected=12, `run-validation-271.mjs:138` expected=12 / TOTAL_EXPECTED=249. Suite: 374/374 pass; VAL_07_STRICT=383/383; reporter VAL-06 PASS 249/249. Aritmética: 49+34+20+26+12+19+51+31+7=249. |
| 3 | GEN-02 satisfecho: los 4 ejes de huecos materializados como variantes nuevas validadas; contenido pasa validation | VERIFIED | Eje 1 (invariabili): 12 variantes (caffè, città, università, virtù, libertà, qualità, film, sport, bar, computer, autobus). Eje 2 (sonido duro con excepción): 13 variantes incluyendo amico→amici, greco→greci, nemico→nemici, medico→medici (PIERDEN h), lago→laghi, gioco→giochi (CONSERVAN). Eje 3 (-trice: 6 variantes; -essa: 6 variantes). Eje 4 (plural base o-i: 4, a-e: 4, e-i: 5). Total 60 variantes vs 40 originales. |

**Score:** 3/3 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/genero-numero.json` | 12 slots slot+variantes, 60 variantes, 0 payload | VERIFIED | 12 slots, 60 variantes, 0 payload, 2 match, 0 word-buttons, todos con explanation top-level, 0 variantes con explanation propia |
| `tests/exercise-types.test.js` | genero-numero expected:12 (era 40) | VERIFIED | Línea 1267: `expected: 12`. Suite 374/374, VAL_07_STRICT 383/383. |
| `tests/fixtures/slot-variants-integration.test.js` | genero-numero expected:12 | VERIFIED | Línea 172: `expected: 12`. 26 tests pass. |
| `scripts/run-validation-271.mjs` | genero-numero expected:12, TOTAL_EXPECTED:249 | VERIFIED | Línea 138: `expected: 12`; línea 145: `TOTAL_EXPECTED = 249`. Reporter PASS 249/249. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `genero-numero.json` slots | smoke paramétrico | `Array.isArray(ex.variants)` bifurcación | WIRED | 2 ocurrencias de `Array.isArray(ex.variants)` en exercise-types.test.js:1285/1288; slots match cubiertos por rama match; 374/374 tests pasan. |
| `genero-numero.json` slots | run-validation-271.mjs | slug en CATEGORIES array + expected=12 | WIRED | Línea 138 en run-validation-271.mjs; VAL-06 PASS 249/249 incluyendo genero-numero 12/12. |
| variantes nuevas | `validation.passes[]` a nivel de slot | quórum ≥4x correcta (Opus+Sonnet+2 externos) | WIRED | Todos los 12 slots tienen validation.status=validated con passes[] de claude-opus-4-7+claude-sonnet-4-6. Las 20 variantes nuevas comparten la validation del slot (D-25-08). |

---

### Data-Flow Trace (Level 4)

No aplica a este tipo de fase. El contenido es JSON estático leído por el loader al arranque; la "data source" es el propio archivo JSON verificado en nivel 1-3. El reporter y el smoke leen directamente del JSON, verificado funcionalmente mediante `run-validation-271.mjs` (exit 0) y `node --test` (374/374).

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Suite completa verde | `node --test tests/*.test.js` | 374 pass / 0 fail | PASS |
| Suite estricta VAL_07 verde | `VAL_07_STRICT=1 node --test tests/*.test.js` | 383 pass / 0 fail | PASS |
| Reporter validation gate verde | `node scripts/run-validation-271.mjs` | exit 0, 249/249, genero-numero 12/12, 0 disputed, VAL-04/06/08 PASS | PASS |
| Validator de shape del JSON | `node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json` | exit 0, 12 ejercicios | PASS |
| Integration test de slot+variantes | `node --test tests/fixtures/slot-variants-integration.test.js` | 26 pass / 0 fail | PASS |

---

### Probe Execution

No se declaran probes en el PLAN. No aplica el patrón `scripts/*/tests/probe-*.sh` para esta fase de contenido.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| GEN-01 | 25-03-PLAN.md | 40 ejercicios reagrupados en slots; validator + smoke con counts re-sincronizados al nº real de slots | SATISFIED | 12 slots en genero-numero.json; 3 hardcodes=12; TOTAL_EXPECTED=249; 374/374 + 383/383 + 249/249 verdes |
| GEN-02 | 25-02-PLAN.md | Variantes nuevas (D-85 + quórum cross-vendor R1-R7) donde la regla admite reformulación; huecos → slots nuevos | SATISFIED | 20 variantes nuevas en 4 ejes (invariabili 7 nuevas, co-chi 6 nuevas, trice 2 nuevas, essa 2 nuevas, plural base 3 nuevas); quórum ≥4x correcta 0 incorrecta verificado 1-por-1; 0 slots nuevos (todos engordan slots existentes, decisión del autor) |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (ninguno) | — | — | — | — |

Grep de TBD/FIXME/XXX/TODO/PLACEHOLDER sobre los 4 archivos modificados por la fase devuelve 0 matches en todos.

---

### Human Verification Required

(ninguna — todas las verificaciones son automatizables para esta fase de contenido JSON)

---

### Gaps Summary

Ningún gap encontrado. La fase 25 entregó exactamente su objetivo:

- `content/exercises/genero-numero.json` convertido a formato slot+variantes con 12 slots semánticos (1 por micro-regla) y 60 variantes (40 originales + 20 nuevas de 4 ejes).
- Los 3 match preservados correctamente (D-04/D-25-03).
- 0 payload, 0 word-buttons, 0 smart-quotes, 0 refs cruzadas a Articoli, acentos italianos preservados.
- GEN-01 cerrado: 3 hardcodes sincronizados a 12, TOTAL_EXPECTED=249, suite 374/374 + 383/383 + reporter 249/249 verdes.
- GEN-02 satisfecho: los 4 ejes de huecos priorizados (D-25-04) materializados con variantes validadas por quórum cross-vendor.
- Categorías vecinas (avere=20, articoli=34) intactas.
- Todos los commits declarados en los SUMMARYs existen en el historial git.

---

_Verified: 2026-06-08_
_Verifier: Claude (gsd-verifier)_
