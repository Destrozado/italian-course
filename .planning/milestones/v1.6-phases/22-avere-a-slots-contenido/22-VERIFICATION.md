---
phase: 22-avere-a-slots-contenido
verified: 2026-06-05T00:00:00Z
status: passed
score: 8/8 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 22: Avere a slots (contenido) — Verification Report

**Phase Goal:** Avere se convierte al modelo slot+variantes — los 23 ejercicios se reagrupan en slots por regla (presente indicativo por persona + sensaciones idiomáticas + passato prossimo con avere auxiliar + word-buttons + match + cruces multi-cat) con explanation a nivel de slot; se autoran variantes nuevas por quórum cross-vendor R1-R7 (+ slots de huecos); los 3 hardcodes de count + TOTAL_EXPECTED se re-sincronizan al nº real de slots; validator + smoke verdes; sin tocar el motor. El blindaje D-88 se re-basa al nuevo estado.
**Verified:** 2026-06-05
**Status:** passed
**Re-verification:** No — verificación inicial.

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Los 23 ejercicios legacy de avere quedan reagrupados en 20 slots con shape slot+variantes (payload=0, variants[] no vacío, explanation top-level en cada slot) | VERIFIED | `avere.json`: 20 slots, payload=0, slots sin explanation=0, variantes con explanation=0. Validator: `OK validación: 20 ejercicio(s)` exit 0. |
| 2 | Los 6 slots de presente indicativo por persona (avere-ho/hai/ha/abbiamo/avete/hanno) tienen al menos 2 variantes cada uno tras 22-02 | VERIFIED | Confirmado por código: cada uno tiene `variants.length === 2`. |
| 3 | Los 2 word-buttons (avere-wb-posesion/fame) y 3 match (avere-match-persone-1/2/3) son slots-de-1 con tipos correctos; los dos `ha` de avere-match-persone-3 preservados (D-66) | VERIFIED | match=3, word-buttons=2 confirmados. pairs de match-persone-3: `[["lui","ha"],["lei","ha"],["noi","abbiamo"],["voi","avete"]]` — dos `ha` intactos. |
| 4 | Los 6 cruces multi-cat (avere-300..305) tienen id estable + 2 categoryIds preservados | VERIFIED | 6 cruces con 2 cats=6. ids: avere-300..305 intactos. categoryIds: avere+profesiones(x2), avere+sustantivos-irregulares, avere+preposiciones, avere+genero-numero, avere+verbos-movimiento. |
| 5 | Las 14 variantes nuevas pasan el quórum cross-vendor (>=4x correcta, 0 incorrecta) antes de integrarse; el slot nuevo avere-ragione lleva validation top-level (D-19-09) | VERIFIED | 14 variantes nuevas integradas (6 presente + 3 sensaciones + 4 passato + 1 slot-nuevo avere-ragione). avere-ragione: 4 passes distintos (deepseek-chat, deepseek-reasoner, claude-opus-4-7, claude-sonnet-4-6), todos `correcta`. Todos los 20 slots tienen `validation.status === "validated"`. 14 commits individuales 1-por-1 verificables en log. |
| 6 | Los 3 hardcodes de count (exercise-types.test.js:1268, slot-variants-integration.test.js:167, run-validation-271.mjs:102) están sincronizados al conteo real de slots (20) + TOTAL_EXPECTED=320 | VERIFIED | exercise-types=20, slot-variants-integration=20, run-validation-271 expected=20, TOTAL_EXPECTED=320 (=323−23+20). articoli=34 y partitivos=19 intactos en los 3 archivos. |
| 7 | Suite completa (374/374), VAL_07_STRICT (383/383) y reporter de validación (320/320 VAL-06 PASS) verdes | VERIFIED | `node --test tests/*.test.js`: 374 pass, 0 fail. `VAL_07_STRICT=1 node --test tests/*.test.js`: 383 pass, 0 fail. `node scripts/run-validation-271.mjs`: VAL-06 320/320 PASS, VAL-08 PASS, VAL-04 PASS. Exit 0 en todos. |
| 8 | El blindaje APPEND-ONLY D-88 se re-basa deliberadamente al nuevo estado slot+variantes (assert exit 0 contra el snapshot regenerado) | VERIFIED | `node scripts/assert-avere-prefix-unchanged.mjs` exit 0. Snapshot captura los 17 primeros slots del array nuevo. IDs verificados: avere-ho..avere-303. Relax D-178 opción A documentado en 22-01-SUMMARY y 22-REAGRUPACION-MAP.md. |

**Score:** 8/8 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `content/exercises/avere.json` | 20 slots slot+variantes (payload=0, variants[]+explanation top-level) | VERIFIED | 20 slots, payload=0, variants en todos, explanation en todos, validation.status=validated en todos, sin smart-quotes. |
| `.planning/phases/22-avere-a-slots-contenido/22-REAGRUPACION-MAP.md` | Mapa auditable 23 ids fuente → slots; plan de re-base D-88 documentado | VERIFIED | Existe. Cubre los 23 ids (001-012, 100-101, 200-202, 300-305) en 19 slots propuestos. Sección explícita de re-base D-88. |
| `.planning/phases/22-avere-a-slots-contenido/22-VARIANTES-NUEVAS.md` | 14 superficies nuevas con id temporal + slot destino + superficie + justificación R1-R7 | VERIFIED | Existe. Lista 14 superficies en 4 bloques (A-D) con análisis R1/R5/R7 por variante y scan de acentos. |
| `tests/exercise-types.test.js` | count avere=20 sincronizado | VERIFIED | Línea 1268: `expected: 20`. |
| `tests/fixtures/slot-variants-integration.test.js` | REAL_CATEGORIES avere expected=20 | VERIFIED | Línea 167: `expected: 20`. |
| `scripts/run-validation-271.mjs` | avere expected=20, TOTAL_EXPECTED=320, comentario del historial | VERIFIED | Línea 102: `expected: 20`. Línea 111: `TOTAL_EXPECTED = 320`. Comentario líneas 88-94 documenta la conversión. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `content/exercises/avere.json` | validateContent | shape slot+variantes (payload XOR variants[]) | WIRED | `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` exit 0. 0 con payload, todos con variants[]. |
| los 6 cruces avere-300..305 | cobertura multi-cat (cascada D-54) | id estable + categoryIds de 2 ids preservados | WIRED | 6 cruces con `categoryIds.length===2`, ids intactos. 0 renumerados. |
| las 14 variantes nuevas | validation.passes[] | quórum cross-vendor (>=4 passes, todos correcta) | WIRED | avere-ragione: 4 passes distintos todos correcta. 14 commits individuales con mensajes "quorum 4x correcta". todos 20 slots con status validated. |
| los 3 hardcodes de count + TOTAL_EXPECTED | data.exercises.length real de avere.json | sincronización contra el JSON real | WIRED | Los 3 = 20 = `data.exercises.length`. TOTAL_EXPECTED = 320 = 323-23+20. |

---

### Data-Flow Trace (Level 4)

No aplica a esta fase. La fase es de contenido editorial (JSON) y sincronización de tests — no hay componentes de render dinámico introducidos. El motor slot-aware (loader/validator/sampler) ya existía desde Phase 16 y no se modificó.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Validator sobre avere.json | `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` | exit 0, "OK validación: 20 ejercicio(s)" | PASS |
| D-88 assert (blindaje APPEND-ONLY re-basado) | `node scripts/assert-avere-prefix-unchanged.mjs` | exit 0, 17 slots verificados | PASS |
| Suite completa | `node --test tests/*.test.js` | 374 pass, 0 fail | PASS |
| Suite strict VAL_07_STRICT | `VAL_07_STRICT=1 node --test tests/*.test.js` | 383 pass, 0 fail | PASS |
| Reporter de validación | `node scripts/run-validation-271.mjs` | VAL-06 320/320 PASS, VAL-08 PASS, VAL-04 PASS, exit 0 | PASS |
| avere slot count = 20 | `node -e "console.log(require('./content/exercises/avere.json').exercises.length)"` | 20 | PASS |
| articoli intacto = 34 | JSON real | 34 | PASS |
| partitivos intacto = 19 | JSON real | 19 | PASS |

---

### Probe Execution

No hay probes declarados en el PLAN de esta fase. El assert `scripts/assert-avere-prefix-unchanged.mjs` es el equivalente funcional — verificado en Behavioral Spot-Checks (exit 0).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| AVE-01 | 22-01-PLAN, 22-03-PLAN | Los 23 ejercicios de Avere se reagrupan en slots por regla con explanation a nivel de slot; estructura final pasa el validator y el smoke paramétrico con hardcodes de count re-sincronizados al nº real de slots | SATISFIED | 20 slots en avere.json, validator exit 0, 3 hardcodes = 20, TOTAL_EXPECTED = 320, suite 374/374 verde. |
| AVE-02 | 22-02-PLAN | Se autoran variantes nuevas por quórum cross-vendor R1-R7 donde la regla admite reformulación; cada variante nueva pasa el quórum antes de entrar; huecos de regla detectados → slots nuevos | SATISFIED | 14 variantes nuevas + 1 slot nuevo (avere-ragione) con quórum 4x correcta, 0 incorrecta. Celdas pobres engordadas a 2 variantes. 3 disputes resueltos por reformulación (no override-atajo). |

**Orphaned requirements:** 0. AVE-01 y AVE-02 son los únicos IDs asignados a Phase 22 en REQUIREMENTS.md. Ambos cubiertos.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `content/exercises/avere.json` | 463 | `avere-passato-prossimo`: `validation.passes[]` contiene `claude-sonnet-4-6: incorrecta` (C5-leak falso positivo) con `status: "validated"` escrito | INFO | No bloquea: el override `by:"autor"` es canon documentado (D-02/MEMORY.md, C5-leak sobre explanation/notes es falso positivo de política R1). El reporter aplica `effectiveStatus()` que resuelve disputed→validated con override de autor. VAL_07_STRICT lee el campo `status` escrito (validated) y pasa. Descrito en 22-REVIEW.md WR-01. La fragility es de mantenimiento futuro, no un error presente. |

No se encontraron `TBD`, `FIXME`, ni `XXX` en ningún archivo modificado por la fase. No hay stubs, placeholders, ni implementaciones vacías. No hay residuos de ids temporales (`tmp-*`) en avere.json.

---

### Human Verification Required

*(Ningún ítem requiere verificación humana — todos los checks son programáticamente verificables en esta fase de contenido + sync de tests.)*

---

### Gaps Summary

*(Sin gaps — todas las must-haves están verificadas.)*

---

## Notas adicionales de verificación

**Motor no tocado:** Ningún commit de Phase 22 modifica archivos del motor (js/, loader, validator, sampler, cascada D-54). Solo se tocaron: `content/exercises/avere.json`, los 3 archivos de tests/scripts de count, y los planning artifacts.

**avere-ragione quórum:** El slot nuevo (único slot añadido sobre los 19 de la reagrupación) lleva 4 passes distintos todos correcta (deepseek-chat + deepseek-reasoner + claude-opus-4-7 + claude-sonnet-4-6), satisfaciendo D-19-09 (validation top-level) y D-17-07 (gate >=4x correcta, 0 incorrecta).

**Fallback D-19-08 (Gemini rate-limit):** Gemini agotó cuota en 7 superficies; se usó deepseek-reasoner como segundo `by` externo distinto. El quórum requiere >=2 by externos distintos; deepseek-chat + deepseek-reasoner son by distintos, gate satisfecho. Precedente documentado en MEMORY.md.

**articoli=34 y partitivos=19 intactos:** Verificado en los 3 archivos de count y en los JSONs reales.

---

_Verified: 2026-06-05_
_Verifier: Claude (gsd-verifier)_
