---
phase: 26-professioni-a-slots-contenido-l-xica
verified: 2026-06-09T10:00:00Z
status: passed
score: 3/3 must-haves verified
overrides_applied: 0
gaps: []
deferred: []
human_verification: []
---

# Phase 26: Professioni a slots — Verification Report

**Phase Goal:** Professioni se convierte al modelo unificado — los 51 ejercicios validados se reagrupan en slots con explicación a nivel de slot. La estructura final pasa el validator y el smoke. Decisión "regla-con-variantes O slots-de-1" documentada explícitamente.
**Verified:** 2026-06-09
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Los 51 ejercicios de Professioni quedan reagrupados en slots con explicación a nivel de slot, en formato unificado slot+variantes; los 3 match preservan la DESIGN RULE D-04 (profesión↔lugar/herramienta/acción, no derivable por raíz). La decisión "regla-con-variantes O slots-de-1" queda documentada explícitamente. | ✓ VERIFIED | `profesiones.json` tiene 11 slots con `variants[]` y `explanation` top-level en todos (0 con payload, 0 sin explanation). Los 3 match (`profesiones-luogo`, `-strumento`, `-azione`) preservan `type:match` con `variants[].pairs` (5 pares cada uno). La decisión híbrida está documentada explícitamente por bloque en `26-REAGRUPACION-MAP.md` (sección "Decision hibrida por bloque (PROF-01/PROF-02)") y en `26-VARIANTES-NUEVAS.md` (sección "Bloque lexico puro: SIN autoria de variantes"). `validateContent` exit 0 (11 ejercicios). Suite completa: 374/374 pass, VAL_07_STRICT: 383/383 pass. |
| 2 | SI se identifica regla-con-variantes (feminización por terminación -e/-essa/-trice), se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1) que pasan el quórum antes de entrar; SI la categoría queda como slots-de-1, se documenta que no aplica autoría de variantes. | ✓ VERIFIED | Regla-con-variantes identificada en el BLOQUE REGLA (feminización). 12 variantes nuevas integradas en los 5 slots de feminización (10 commits de quorum: `495771b`, `ff2f34d`, `0752d2b`, `6af6df3`, `4269eeb`). Cada una validada 1-por-1 con >=4× correcta (opus+sonnet+2 externos). El BLOQUE LÉXICO PURO (comprensión + 3 match) queda como slots-de-1 sin variantes nuevas, documentado explícitamente como cumplimiento de PROF-01. Conteo post-26-02: `trice`=11 vars (>8), `essa`=6 vars (>4), `invariabili`=16 vars (>12), `o-a`=12 vars (>10), `iera`=5 vars (>4). Total: 50 variantes en 11 slots. |
| 3 | La estructura final de Professioni pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada. | ✓ VERIFIED | `node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json` → exit 0. `node --test tests/*.test.js` → 374/0. `VAL_07_STRICT=1 node --test tests/*.test.js` → 383/0. `node scripts/run-validation-271.mjs` → exit 0 (VAL-06 209/209, VAL-08 0 disputed, VAL-04 PASS). Los 3 hardcodes sincronizados: `exercise-types.test.js:1272` = 11, `slot-variants-integration.test.js:173` = 11, `run-validation-271.mjs:151` = 11. `TOTAL_EXPECTED` = 209 (249 − 51 + 11). 0 slots sin explanation. |

**Score:** 3/3 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/profesiones.json` | 11 slots en shape slot+variantes HIBRIDO (payload eliminado, variants[]+explanation top-level; bloque regla por sub-regla, bloque léxico por eje semántico, 3 match preservados, articolo-suono, word-buttons) | ✓ VERIFIED | 11 slots confirmados. 0 con payload. 0 sin explanation top-level. 0 variantes con explanation propia. 3 match con pairs. 1 word-buttons. Todos categoryIds=["profesiones"]. 0 cruces 300-305. Override de collega presente verbatim. 0 refs cross-cat. 0 smart-quotes. |
| `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-REAGRUPACION-MAP.md` | Mapa id-fuente→slot con modelo HIBRIDO documentado por bloque; conteo de slots reportado; decisión PROF-01/PROF-02 explícita; secciones "sin cruces" y "snapshot no aplica" | ✓ VERIFIED | Archivo existe con 44+ referencias a `profesiones-`. Sección explícita "Decision hibrida por bloque (PROF-01 / PROF-02)" presente. Sección "Sin cruces multi-cat: no existen profesiones-300..305" presente. Sección "Snapshot / re-base D-88: NO APLICA a Professioni" presente. Conteo canónico = 11 slots reportado. |
| `tests/exercise-types.test.js` | Count de profesiones en CATEGORIES_WITH_EXPLANATIONS sincronizado a 11 | ✓ VERIFIED | Línea 1272: `expected: 11`. Smoke shape-agnostic intacto: `Array.isArray(ex.variants)` = 2 ocurrencias (sin cambios). |
| `tests/fixtures/slot-variants-integration.test.js` | REAL_CATEGORIES expected de profesiones = 11 | ✓ VERIFIED | Línea 173: `expected: 11`. |
| `scripts/run-validation-271.mjs` | expected profesiones = 11 + TOTAL_EXPECTED = 209 + comentario historial actualizado | ✓ VERIFIED | Línea 151: `expected: 11`. Línea 156: `const TOTAL_EXPECTED = 209`. Comentario de historial añadido con la conversión híbrida de Professioni. |
| `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-VARIANTES-NUEVAS.md` | Set propuesto de variantes nuevas (solo feminización) con sección explícita de que el bloque léxico no recibe variantes (PROF-01) | ✓ VERIFIED | Archivo existe. Sección "Bloque lexico puro: SIN autoria de variantes (PROF-01/D-26-02)" presente con documentación por tipo de slot. Los 3 ejes cubiertos (contraste -trice/-essa, invariables -ista/-ante, -o/-a y -iere/-iera). |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `content/exercises/profesiones.json` | `validateContent / normalizeExerciseToSlot` | shape slot+variantes (`variants[]` presente, payload ausente) | ✓ WIRED | `validateContent` exit 0. 0 con payload. Todos los slots con `variants[]` no vacíos. |
| Los 3 match (luogo/strumento/azione) | slots de eje semántico con type:match (D-26-02/D-04) | `variant={prompt, pairs}` | ✓ WIRED | 3 slots type:match. Todos con `variants[].pairs` (5 pares cada uno). D-04 preservado: asociaciones léxicas profesión↔lugar/herramienta/acción, no derivables por raíz. |
| Variantes nuevas de feminización (26-02) | slots de feminización destino | quórum cross-vendor (>=4 pases by distintos, todos correcta) | ✓ WIRED | 12 variantes integradas en los 5 slots de feminización. Commits documentados con 1 commit por slot engordado. Los slots mantienen `validation.status=validated` (0 slots sin validation top-level). `run-validation-271.mjs` VAL-04 PASS (>=2 distinct `by` por slot). |
| Los 3 hardcodes + TOTAL_EXPECTED | `data.exercises.length` real de `profesiones.json` | sincronización contra el conteo REAL del JSON (= 11) | ✓ WIRED | Los 3 archivos tienen `expected: 11`. `TOTAL_EXPECTED = 209 = 249 − 51 + 11`. El reporter no emite warning de count para profesiones. |

---

## Data-Flow Trace (Level 4)

No aplica a esta fase — es conversión de contenido JSON estático (sin componentes de UI que rendericen datos dinámicos). El contenido fluye vía `validateContent` al loader/sampler del motor slot-aware (sin modificaciones a motor, loader ni sampler en esta fase). El smoke paramétrico (exercise-types.test.js) verifica indirectamente que el contenido fluye correctamente (coverage/R1/R2/smart-quotes/markdown).

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| validateContent acepta los 11 slots | `node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json` | exit 0, "OK validación: 11 ejercicio(s)" | ✓ PASS |
| Suite completa verde (0 fail esperado) | `node --test tests/*.test.js` | 374 pass / 0 fail | ✓ PASS |
| VAL_07_STRICT verde | `VAL_07_STRICT=1 node --test tests/*.test.js` | 383 pass / 0 fail | ✓ PASS |
| Reporter de validación PASS | `node scripts/run-validation-271.mjs` | exit 0, VAL-06 209/209, VAL-08 0 disputed, VAL-04 PASS | ✓ PASS |
| 0 payload residual | `d.exercises.filter(e=>e.payload).length` | 0 | ✓ PASS |
| 3 match preservados type:match con pairs | `d.exercises.filter(e=>e.type==='match')` | 3 slots, todos con `variants[].pairs` (5 pares) | ✓ PASS |
| 1 word-buttons preservado type:word-buttons | `d.exercises.filter(e=>e.type==='word-buttons')` | 1 slot (5 variants con `answer[]`) | ✓ PASS |
| Feminización granularidad fina (D-26-03) | presencia de o-a/iera/trice/essa en ids | true, true, true, true | ✓ PASS |
| 0 refs cross-cat (D-26-05) | grep en explanations | 0 matches | ✓ PASS |
| Override de collega presente verbatim | check `by:autor` + `override` en invariabili | true | ✓ PASS |
| 0 smart-quotes | `grep -nP '[\x{2018}\x{2019}\x{201C}\x{201D}]'` | 0 matches | ✓ PASS |

---

## Probe Execution

No aplica — no hay probes `scripts/*/tests/probe-*.sh` para esta fase (conversión de contenido JSON, no migración de motor/infraestructura).

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PROF-01 | 26-01-PLAN + 26-03-PLAN | Los 51 ejercicios reagrupados en slots con explanation a nivel de slot; estructura pasa validator y smoke; counts re-sincronizados | ✓ SATISFIED | 11 slots en `profesiones.json`, validateContent verde, suite 374/374, reporter exit 0, counts 11/11/11/209 sincronizados. Decisión híbrida documentada explícitamente por bloque. |
| PROF-02 | 26-02-PLAN | Donde existe regla-con-variantes, se autoran variantes nuevas con quórum; si no aplica, se documenta explícitamente | ✓ SATISFIED | 12 variantes nuevas en 5 slots de feminización, cada una con >=4× correcta por quórum. Bloque léxico puro documentado como "SIN autoria de variantes (PROF-01/D-26-02)" en `26-VARIANTES-NUEVAS.md` y en el mapa de reagrupación. |

**Nota:** REQUIREMENTS.md traceability marca ambos PROF-01 y PROF-02 como "Complete" para Phase 26. 0 orphans.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | — |

Sin marcadores de deuda (TBD/FIXME/XXX), stubs, ni placeholders en ningún archivo modificado por la fase. El contenido léxico de `profesiones.json` es real y validado (no placeholder). Los 11 slots tienen explanations substantivas y rule-first.

---

## Human Verification Required

Ningún ítem requiere verificación humana:

- La estructura del JSON es verificable programáticamente (y se verificó).
- El quórum cross-vendor de las 12 variantes nuevas está documentado con commits auditables.
- El validator y smoke son deterministas y pasaron.
- La decisión híbrida (regla-con-variantes/slots-de-1) está documentada en artefactos auditables, no solo en el SUMMARY.
- El contenido visual (renderizado en el navegador) no es objeto de verificación de esta fase (conversión de formato, no UI nueva).

---

## Gaps Summary

Ningún gap. Los 3 must-haves de los Success Criteria del roadmap están verificados con evidencia directa en el codebase:

1. **Reagrupación híbrida documentada:** `profesiones.json` tiene 11 slots semánticos con `variants[]` y `explanation` top-level. La decisión "regla-con-variantes O slots-de-1" está documentada por bloque en `26-REAGRUPACION-MAP.md` y `26-VARIANTES-NUEVAS.md`. Los 3 match preservan D-04.
2. **Autoría de variantes nuevas con quórum:** 12 variantes integradas en los 5 slots de feminización, cada una con >=4× correcta por quórum cross-vendor. El bloque léxico puro queda sin variantes (PROF-01 cumplido).
3. **Validator y smoke verdes con counts re-sincronizados:** 4 comandos de verificación pasan con exit 0 (validate-content-fixture, test suite, VAL_07_STRICT, run-validation-271). Los 3 hardcodes y TOTAL_EXPECTED coinciden con `data.exercises.length = 11`.

---

_Verified: 2026-06-09_
_Verifier: Claude (gsd-verifier)_
