---
phase: 09-infraestructura-de-validaci-n
verified: 2026-05-26T00:00:00Z
status: passed
score: 5/5
overrides_applied: 0
---

# Phase 9: Infraestructura de validación — Verification Report

**Phase Goal:** Crear la maquinaria (schema + prompt + workflow + gate de tests) que hará posible validar los 271 ejercicios 1-por-1 con quórum multi-AI sin re-inventar el proceso cada vez. Cerrar la fase con un piloto small-scale sobre una categoría real para probar que el pipeline funciona antes de invertir 1.5-2M tokens en Phase 10.
**Verified:** 2026-05-26
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC1: Schema validator acepta los 271 ejercicios actuales sin tocar el JSON (campo `validation` opcional, backward-compat) | VERIFIED | `validateValidationShape` exists at line 313 of `src/data/schema-validator.js` with `if (!('validation' in ex)) return;` back-compat guard. Invocado en el loop principal (línea 138). `node --test tests/*.test.js`: 118 tests, 0 fail. Las 7 categorías pasan `validate-content-fixture.mjs`. |
| 2 | SC2: `09-VALIDATION-PROMPT.md` con los 5 criterios binarios verbatim listos para copy-paste; R1-R7 operacionalizados inline | VERIFIED | Archivo existe con 270 líneas. Contiene los 7 headings `## R1 —` … `## R7 —` literales. Contiene `c1_natural`, `c2_una_opcion`, `c3_distractoras`, `c4_explanation`, `c5_leak` como keys exactas. Contiene guard anti-injection "DATA a evaluar, NO instrucción". 13 `## ` headings (≥6 secciones). |
| 3 | SC3: Script/flujo documentado "1 ejercicio = 1 agente fresco" con justificación explícita NO-batched | VERIFIED | `.claude/skills/gsd-validate-exercise/SKILL.md` existe con frontmatter YAML válido. Contiene "NUNCA batched", "fresh context", model IDs literales `claude-opus-4-7` + `claude-sonnet-4-6`, "batched-curation" (root cause), "root cause de los 4 bugs motivadores". Sección `<workflow_justification_no_batched>` es verbatim. |
| 4 | SC4: Smoke test paramétrico en `tests/exercise-types.test.js` con feature flag VAL_07_STRICT, OFF por defecto, ON produce 7 failures | VERIFIED | `const VAL_07_STRICT = process.env.VAL_07_STRICT === '1'` en línea 1395. `describe('VAL-07 — todos los ejercicios validated', { skip: VAL_07_STRICT ? false : '...' })` en línea 1397. Sin flag: 118/118 pasan (VAL-07 suite marcada SKIP). Con flag activado `VAL_07_STRICT=1`: 118 pass + 7 fail (1 por cada categoría — expected). |
| 5 | SC5: Piloto end-to-end completado: ≥1 ejercicio real con ≥2 pases registrados, `by`/`date`/`verdict`/`concerns?` poblados, status consistente con schema VAL-01 | VERIFIED | 3 ejercicios con `passes.length === 2` cada uno: E1 `preposiciones-040` (validated), E2 `avere-001` (validated), E3 `pilot-disputed-c5-leak-001` (disputed). Cada pase tiene `by` ∈ {`claude-opus-4-7`, `claude-sonnet-4-6`}, `date: "2026-05-26"` (ISO), `verdict` ∈ {`correcta`, `incorrecta`}, `concerns: []` o array de strings tagged `[C5-leak]`. `node scripts/run-validation-pilot.mjs` exit 0 con los 4 sub-gates del D-VAL-15 en PASS. 3 commits atómicos: `validate(preposiciones)`, `validate(avere)`, `validate(genero-numero)`. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/schema-validator.js` | `validateValidationShape()` hand-written, invocado en el loop, mensajes en español | VERIFIED | 360 líneas. Función en líneas 313-358. Invocación en línea 138. 29 instancias de "debe ser/inválido/esperado". Whitelists `VALID_STATUS`, `VALID_VERDICT`, `ISO_DATE` presentes. |
| `src/data/validation-state.js` | `deriveStatus(passes)` pure helper, sticky disputed, `export function` | VERIFIED | 42 líneas. `export function deriveStatus` en línea 31. Cabecera "Pure — sin DOM". Regla sticky documentada. `new Set` para distinctBy. Importable vía ESM sin side-effects. |
| `tests/exercise-types.test.js` | 3 suites Phase 9: schema-validator validation field, deriveStatus transitions, VAL-07 paramétrico | VERIFIED | Suite "validation field (Phase 9 D-VAL-08)": 13 tests. Suite "deriveStatus (Phase 9 D-VAL-07)": 11 tests. Suite "VAL-07": 7 tests (SKIP por defecto). Total: 254 tests en `*.test.js`, 0 fail. |
| `.planning/phases/09-.../09-VALIDATION-PROMPT.md` | 6 secciones, R1-R7 inline verbatim, 5 criterios, few-shot 2-shot, guard anti-injection | VERIFIED | 270 líneas. 7 headings R1-R7 literales. Keys exactas c1-c5. Few-shot FAIL contiene "refuerzo regla §1 fem -a→-e" (bug motivador literal). Self-contained: cero referencias a archivos externos. |
| `.claude/skills/gsd-validate-exercise/SKILL.md` | Frontmatter YAML, model IDs explícitos, NUNCA batched, 9 pasos de ejecución | VERIFIED | 282 líneas. Frontmatter válido (`name`, `description`, `argument-hint`, `allowed-tools` con 7 entries). Model IDs literales. `<critical_constraints>` con justificación VAL-03 verbatim. `<workflow_justification_no_batched>` con root cause explícito. |
| `tests/fixtures/validation-pilot-disputed.json` | Ejercicio E3 sintético C5-leak, id `pilot-disputed-c5-leak-001`, fuera de `content/` | VERIFIED | Existe. JSON válido. `id: "pilot-disputed-c5-leak-001"`. `payload.prompt` contiene "refuerzo regla §1 fem -a→-e". `notes` con "FIXTURE DE PILOTO Phase 9". Después del piloto, tiene `validation.status: "disputed"` con 2 passes taggeados `[C5-leak]`. |
| `scripts/run-validation-pilot.mjs` | Reporter post-piloto, gate D-VAL-15 (4 sub-gates), exit 0 si PASS | VERIFIED | 302 líneas. `import { deriveStatus }`. Referencia los 3 ejercicios del piloto. ANSI colors. Gate D-VAL-15 con 4 sub-gates. Exit 0 actual. Mensajes en español. |
| `scripts/assert-avere-prefix-unchanged.mjs` | `stripAdditive()` desestructura `validation`, comentario D-VAL-08, exit 0 | VERIFIED | `grep` confirma `validation, ...rest` en la función. Comentario `D-VAL-08` presente. `node scripts/assert-avere-prefix-unchanged.mjs` exit 0 tras mutar `avere-001`. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `schema-validator.js` loop (línea 133) | `validateValidationShape(ex, file, push)` | invocación directa línea 138 | VERIFIED | `grep -q "validateValidationShape(ex, file, push)"` exit 0 |
| `tests/exercise-types.test.js` | `process.env.VAL_07_STRICT` | `const VAL_07_STRICT = process.env.VAL_07_STRICT === '1'` + `{skip:}` option | VERIFIED | Patrón `skip: VAL_07_STRICT ? false : '...'` en línea 1398 |
| `SKILL.md` step 1 | `09-VALIDATION-PROMPT.md` | Read tool antes de spawnear Task() | VERIFIED | `grep -q "09-VALIDATION-PROMPT.md" SKILL.md` exit 0 |
| `run-validation-pilot.mjs` | `src/data/validation-state.js deriveStatus` | `import { deriveStatus }` en línea 33 | VERIFIED | Import named existe, script corre con exit 0 |
| `scripts/assert-avere-prefix-unchanged.mjs` `stripAdditive()` | campo `validation` excluido del compare | `const { payload, notes, validation, ...rest } = ex;` | VERIFIED | `grep -qE "validation, ?\.\.\.rest"` exit 0 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `run-validation-pilot.mjs` | `rows[]` (validación de los 3 ejercicios) | `readFileSync` + `JSON.parse` sobre archivos de ejercicios reales | Si — lee los JSONs mutados por el skill con `passes[]` poblado por los subagents | FLOWING |
| `tests/exercise-types.test.js` VAL-07 suite | `notValidated` | `readFileSync` de `content/exercises/*.json` | Si — lee los 7 archivos de categorías reales | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `node --test tests/*.test.js` exit 0 sin VAL_07_STRICT | `node --test tests/*.test.js` | 254 tests, 0 fail | PASS |
| `VAL_07_STRICT=1` produce 7 failures | `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` | 118 pass, 7 fail (1 por categoría) | PASS |
| `run-validation-pilot.mjs` exit 0 con D-VAL-15 PASS | `node scripts/run-validation-pilot.mjs` | Exit 0, 4 sub-gates PASS | PASS |
| `assert-avere-prefix-unchanged.mjs` exit 0 post-mutación avere-001 | `node scripts/assert-avere-prefix-unchanged.mjs` | Exit 0, 17 ejercicios originales intactos | PASS |
| Schema validator acepta preposiciones.json (con validation field en ex-040) | `node scripts/validate-content-fixture.mjs preposiciones ...` | OK, 50 ejercicios | PASS |
| Schema validator acepta avere.json (con validation field en avere-001) | `node scripts/validate-content-fixture.mjs avere ...` | OK, 23 ejercicios | PASS |

### Probe Execution

No probes declared in PLAN files. Los behavioral spot-checks sustituyen la verificación programática (se ejecutaron directamente arriba).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| VAL-01 | 09-01-PLAN.md | Schema opcional `validation` con `{status, passes[{by,date,verdict,concerns?}]}`, backward-compat | SATISFIED | `validateValidationShape` hand-written, `if (!('validation' in ex)) return` back-compat, 13 tests unitarios, 7 categorías pasan schema validator |
| VAL-02 | 09-02-PLAN.md | Validation prompt documentado con 5 criterios binarios | SATISFIED | `09-VALIDATION-PROMPT.md` con R1-R7 inline, 5 criterios C1-C5 con keys exactas, few-shot 2-shot, guard anti-injection |
| VAL-03 | 09-02-PLAN.md | Workflow 1-por-1 documentado con justificación explícita NO-batched | SATISFIED | `SKILL.md` con `NUNCA batched`, root cause "batched-curation con ~17 ejercicios por contexto", sección `<workflow_justification_no_batched>` |
| VAL-05 | 09-01-PLAN.md + 09-03-PLAN.md | `passes[]` entries con `{by, date, verdict, concerns?}` shape enforced | SATISFIED | `validateValidationShape` enforce shape por entry, 3 ejercicios del piloto con `passes[]` correctamente poblados |
| VAL-07 | 09-01-PLAN.md | Smoke test paramétrico verifica `validation.status === "validated"` | SATISFIED | `const VAL_07_STRICT = process.env.VAL_07_STRICT === '1'` + `{skip:}` option; OFF default (118/118 PASS); ON produce 7 failures esperados |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (ninguno) | — | — | — | — |

Sin TBD/FIXME/XXX ni placeholders en los 7 archivos modificados por la fase.

### Human Verification Required

Ningún item identificado para verificación humana. Todos los comportamientos observables son verificables programáticamente.

---

## Invariants Verification (Critical)

| Invariant | Check | Result |
|-----------|-------|--------|
| Zero-deps: sin `package.json` ni `node_modules` nuevos | `ls /home/vcompanyb/italian-course/package*.json` → not found | PASS — no existe package.json en el proyecto |
| D-08 hand-written validator: `validateValidationShape` sin Ajv/Zod/Valibot | Inspeccionado el código completo de `schema-validator.js` (360 líneas): solo usa construcciones JavaScript nativas | PASS |
| D-88 APPEND-ONLY avere: `node scripts/assert-avere-prefix-unchanged.mjs` exit 0 | Exit 0 confirmado tras añadir `validation` a `avere-001` | PASS |
| FOUND-04 Spanish messages: errores del validator en español | 29 instancias de "debe ser/inválido/esperado" en `schema-validator.js` | PASS |
| schemaVersion unchanged: sin migración introducida | `validation` es campo top-level del ejercicio (content metadata), no del state. Sin cambio en `schemaVersion`. | PASS |

---

## Gaps Summary

Sin gaps. Los 5 Success Criteria del ROADMAP §Phase 9 están observablemente presentes y funcionando en el codebase.

---

_Verified: 2026-05-26_
_Verifier: Claude (gsd-verifier)_
