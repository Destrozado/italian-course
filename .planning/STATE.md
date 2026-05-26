---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Validación editorial
status: "Phase 9 COMPLETE — verifier PASSED 5/5 SCs, ready para /gsd:plan-phase 10"
last_updated: "2026-05-26T02:50:00.000Z"
last_activity: 2026-05-26 — Phase 9 verifier PASSED 5/5: SC1 schema + SC2 prompt + SC3 skill + SC4 smoke test + SC5 piloto, todos los invariants críticos verificados
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 3
  completed_plans: 3
  percent: 0
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 9 — Infraestructura de validación

**Milestone v1.1 Goal:** Validar 271/271 ejercicios curados en v1.0 con criterios R1-R7 + quórum ≥2 AIs, eliminando bugs de batched-curation. Bug class motivador: 4 ambigüedades semánticas cazadas por casualidad en uso real post-v1.0 (preposiciones-040 amici/dai, -032 nelle pareti, -047 cadere sugli alberi, -031 libri/scaffali).

## Current Position

Phase: 9 (Infraestructura de validación) — COMPLETE (verifier PASSED 5/5 SCs, 2026-05-26)
Plan: 09-01 SHIPPED + 09-02 SHIPPED + 09-03 SHIPPED + 09-VERIFICATION PASSED
Status: Phase 9 cerrada, ready `/gsd:plan-phase 10` para descomponer ejecución validación 271 ejercicios + escalada UX disputed
Last activity: 2026-05-26 — Verifier PASSED 5/5: SC1 (schema acepta 271 con validation opcional, 254/254 tests verdes), SC2 (VALIDATION-PROMPT.md self-contained con R1-R7 + 5 criterios), SC3 (SKILL.md con "NUNCA batched" + justificación root cause), SC4 (smoke test VAL_07_STRICT env var con skip option), SC5 (3 commits validate atómicos + gate D-VAL-15 PASS). Invariants OK: zero-deps, D-08 hand-written, D-88 APPEND-ONLY (stripAdditive relax funciona), FOUND-04 español, schemaVersion 4 unchanged.

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incluyendo decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 0/2 (Phase 9 infra + Phase 10 ejecución) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 5/8 (VAL-01/05/07 done en Plan 09-01; VAL-02/03 done en Plan 09-02; VAL-04/06/08 pending) |
| Requisitos v1.1 mapeados | 8/8 (100% — VAL-01/02/03/05/07 → Phase 9; VAL-04/06/08 → Phase 10) |
| Tests dominio + UI smoke | 254/254 verdes (baseline v1.0 + Plan 09-01: +24 nuevos) |
| Granularidad | coarse |
| Mode | standard (NO MVP — esto es editorial, no slice vertical) |
| Ejercicios totales en la app | 271 distribuidos en 7 categorías (todos con explanations curadas Phase 7..7.2) |
| Phase 9 P01 | 4min | 3 tasks | 3 files |
| Phase 9 P09-02 | 9min | 3 tasks | 3 files |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados (Avere 23 + Essere 39 + Génnum 40 + Sustantivos-irregulares 31 + Verbos-movimiento 37 + Profesiones 51 + Preposiciones 50). 62/62 v1 requirements complete, 209/209 tests verdes.
- **2026-05-25 — Milestone v1.1 abierto.** Bug class motivador descubierto: 4 ambigüedades semánticas en Preposiciones cazadas por uso real (preposiciones-040 amici/dai, -032 nelle pareti, -047 cadere sugli alberi, -031 libri/scaffali). Root cause: batched-curation con ~17 ejercicios por batch + revisión humana global del batch = bugs sutiles se cuelan. Decision: validación 1-por-1 con quórum multi-AI antes de seguir confiando en el material.
- **2026-05-25 — Memoria R1-R7 escrita.** Reglas estrictas de alta de ejercicios en `~/.claude/projects/.../memory/exercise_authoring_rules.md` cubriendo: R1 (prompt sin regla/solución), R2 (explanations sin IDs internos), R3 (match con ≥3 valores distintos en der), R4 (explanation enfocada al alumno), R5 (oracle externo grammar/semántica), R6 (1 modificación pedagógica por ejercicio), R7 (UNA SOLA opción válida). El validation prompt de Phase 9 es la operacionalización de estas reglas.
- **2026-05-25 — Roadmap v1.1 fijado.** 2 phases:
  - Phase 9: Infraestructura de validación (VAL-01/02/03/05/07) — schema + prompt + workflow + smoke test + piloto small-scale.
  - Phase 10: Ejecución validación 271 + escalada disputed (VAL-04/06/08) — aplicar workflow a las 7 categorías hasta 271/271 `validated`, UX inline para disputed.

### Quick Tasks Completed

| Quick ID | Slug | Description | Completed | Commits |
|----------|------|-------------|-----------|---------|
| 260524-tpn | fix-botones-multi-choice-pegados-visualm | Fix UX-1 botones multi-choice pegados | 2026-05-24 | `9e38af5` |
| 260525-pwq | fix-shuffle-de-options-en-multiple-choic | Shuffle multi-choice options via sub-state | 2026-05-25 | `c74281a` |
| 260525-vvj | boton-reiniciar-examen-phase-8-y | Phase 8.y backlog — extender `restartRepaso()` dual-mode | 2026-05-25 | `7eaf5a2` |

### Key Decisions (v1.1)

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-05-25 | v1.1 = 2 phases (infra + ejecución), NO 1 phase combinada | Phase 9 piloto pequeño detecta bugs del workflow antes de invertir 1.5-2M tokens en Phase 10. La separación permite cerrar Phase 9 con confidence alta antes de la fase mecánica más cara. |
| 2026-05-25 | Phase numbering continúa desde v1.0 (9, 10) — NO reset a 1 | Audit trail histórico se preserva, MILESTONES.md mantiene timeline lineal, REQUIREMENTS.md traceability incremental. |
| 2026-05-25 | Mode = standard, NOT MVP | Trabajo editorial, no vertical slice. No hay "slice mínima funcional" para validación — la validación es completa o no es. |
| 2026-05-25 | Smoke test VAL-07 activated solo al CIERRE de Phase 10 (feature flag o equivalente) | Si el test se activa en Phase 9, los 271 sin validar lo rompen y bloquean el desarrollo. Activación final = gate de cierre milestone. |
| 2026-05-25 | El validation prompt opera sobre los 5 criterios binarios derivados de R1-R7, NO sobre los 7 puntos textuales de la memoria | El validation prompt es la operacionalización de R1-R7 — los 5 criterios binarios de VAL-02 los condensan en checks objetivos (frase natural, una opción válida, distractoras plausibles, explanation coherente, cero leak). R3/R6 quedan implícitos en "una opción válida" + "explanation coherente". |
| 2026-05-26 | Plan 09-01: `validateValidationShape` NO entra al `PAYLOAD_VALIDATORS` dispatch — es metadata top-level del ejercicio, no payload. Se invoca directamente en el loop tras `validator(ex, file, push)` | D-VAL-05 dice `validation` vive top-level (junto a id/type/categoryIds/payload/notes). El dispatch table es solo para validators de payload por tipo. Esta convención queda abierta para futuros campos top-level opcionales (tags, dificultad, etc.) — patrón reutilizable. |
| 2026-05-26 | Plan 09-01: feature flag VAL-07 implementado con env var `VAL_07_STRICT=1` + `{skip: condition}` option en `describe()` | D-VAL-17 dejó libertad al planner; la elección sobre constante module-level es que activar/desactivar es zero-code-change (solo cambiar el env var al cierre Phase 10). Patrón idiomático `node:test` 2026 verificado en nodejs.org/api/test. |
| 2026-05-26 | Plan 09-01: baseline real reportado por `node --test` ya estaba en 230 tests (no 209 como decía STATE.md tras Phase 8) | Probablemente smoke tests añadidos durante Phase 7.2/8 sin actualizar el contador. El plan deja el baseline en 254/254 verdes (suma neta +24); STATE.md actualizado para reflejar el número real. |
| 2026-05-26 | Plan 09-02: VALIDATION-PROMPT.md R1-R7 a nivel `## ` (no `### `) — refactorizado mid-Task 1 cuando el grep de verificación reveló que el global success criterion exigía `^## (R1\|...)` (2 hashes), no `^### ` (3 hashes) | Tensión menor entre task acceptance (`grep -q "R1 —"` cualquier nivel) y global criterion (`^## R1` exactamente 2 hashes). 7 Edits puntuales para nivelar; contenido literal de R1-R7 preservado 100%. C1-C5 quedan a nivel `### ` por debajo de la table de mapping (también satisface el regex). |
| 2026-05-26 | Plan 09-02: SKILL.md describe zero-deps invariant SIN literalmente decir 'npm install' — el global success criterion exige `! grep -q "npm install"` literal | Reformulado a "cero gestores de paquetes" en la sección critical_constraints. Meaning equivalente al "cero npm install" del plan task action; el intent del plan se respeta y el regex pasa. |
| 2026-05-26 | Plan 09-02: stripAdditive() relax es no-op SEMÁNTICO hasta Plan 09-03 muta avere-001 (E2 baseline del piloto) | Los 17 originales aún no tienen el campo validation; el relax solo se ejerce cuando Plan 03 añade `validation` a `avere-001`. `node scripts/assert-avere-prefix-unchanged.mjs` sigue exit 0 post-Plan-02. Garantiza que Plan 03 no romperá el assert D-88 al añadir validation. |

### Active Todos

- [x] `/gsd:plan-phase 9` — descomponer Phase 9 en planes ejecutables (DONE 2026-05-26 — 09-RESEARCH + 09-PATTERNS + 3 PLAN.md)
- [x] Plan 09-01 (Wave 1 lado A: schema + deriveStatus + VAL-07 paramétrico) — DONE 2026-05-26 (5 commits, 254/254 tests verdes, VAL-01/05/07 completados)
- [x] Plan 09-02 (Wave 1 lado B: VALIDATION-PROMPT.md + SKILL.md + fixture E3 + stripAdditive relax) — DONE 2026-05-26 (3 commits + summary, 254/254 tests verdes, VAL-02/03 completados)
- [ ] Plan 09-03 (Wave 2: piloto end-to-end 3 ejercicios + checkpoint:human-verify) — ready to execute (depends_on 09-01 + 09-02 ya completados)
- [ ] Ejecutar Phase 9 plans hasta verifier PASS
- [ ] `/gsd:plan-phase 10` — descomponer Phase 10 (probable structure: 10-01 escalada UX VAL-08 + UAT piloto disputed; 10-02..10-08 batches de validación 1 por categoría — Preposiciones primero por mayor concentración de bugs)
- [ ] Ejecutar Phase 10 plans hasta 271/271 `validated`
- [ ] `/gsd:complete-milestone v1.1` — tras verifier PASS de Phase 10

### Blockers

(Ninguno — v1.0 cerrado, roadmap v1.1 fijado, R1-R7 en memoria persistente)

### Decisions Pending

- ¿Cuántos AIs distintos exactamente en el quórum? VAL-04 dice "≥2" — Phase 9 plan-time elegirá el pool concreto (sugerencia inicial: `claude-opus-4-7` + `gemini-2.5-pro`, opcionalmente `gpt-5` como tiebreaker en disputed). Decisión diferida a `09-02` o `09-03`.
- ¿Workflow ejecutado por scripts node + agent spawn o manualmente vía slash command repetido 271×2 veces? Phase 9 piloto lo decide. Hipótesis inicial: script + `Task` agent spawn parametrizado por exercise-id; el script lee el JSON, extrae 1 ejercicio, lo pasa al validator prompt en agente fresco, parsea verdict, mergea `passes[]` de vuelta al JSON.
- ¿Disputed exercises del piloto Phase 9 cuentan para el 271/271 de Phase 10 o se re-validan? Asunción de trabajo: se re-validan en Phase 10 con AIs distintos para mantener el invariante "≥2 AIs distintos en validated". Decisión final en plan-time Phase 10.

## Session Continuity

### Last Session

- **Fecha:** 2026-05-26 (Plan 09-02 ejecutado dentro de Phase 9 Wave 1 lado B — `/gsd:execute-phase 9`)
- **Trabajo actual:** Plan 09-02 completado en 9 minutos con 3 commits atómicos en `master`. Entregables: (1) `.planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` self-contained con 6 secciones obligatorias (rol del subagent + R1-R7 verbatim inline literal de la memoria del autor + mapping R1-R7→C1-C5 con tags ASCII `[Cn-criterio]` + contrato JSON output D-VAL-09 + 2 few-shot examples con FAIL = bug motivador literal `(refuerzo regla §1 fem -a→-e)` + guard anti prompt-injection en español). 270 líneas. (2) `.claude/skills/gsd-validate-exercise/SKILL.md` orquestador con frontmatter YAML válido (name, description, argument-hint, allowed-tools: Read/Write/Edit/Bash/Glob/Grep/Task), model IDs literales `claude-opus-4-7` + `claude-sonnet-4-6` (D-VAL-02 audit trail), justificación NO-batched verbatim al autor explicando el bug class, spawn secuencial Pase 1 → Pase 2 lock D-VAL-04, retry budget 1×, commit granularity 1-por-ejercicio Pattern 2 RESEARCH, 9 pasos del workflow documentados con tools concretos. 281 líneas. (3) `tests/fixtures/validation-pilot-disputed.json` con E3 sintético `pilot-disputed-c5-leak-001` violando R1/C5 deliberadamente (fuera de `content/` — content-loader no lo escanea). (4) `scripts/assert-avere-prefix-unchanged.mjs` con `stripAdditive()` ampliado para desestructurar `validation` además de payload/notes; header comentario ampliado con justificación D-VAL-08; no-op semántico hasta Plan 09-03 muta avere-001. Cero deviations Rules 1-4; 2 ajustes tácticos (R-headings a `## ` y npm install wording) son conformancia al global success criterion no auto-fixes. Cero deps añadidas. Requirements completados: VAL-02 (validation prompt 5 criterios + few-shot) + VAL-03 (workflow 1-por-1 + justificación NO batched). 254/254 tests verdes baseline preserved.
- **Trabajo previo (Plan 09-01, 2026-05-26):** Plan 09-01 completado en 4 minutos (5 commits TDD RED→GREEN). Entregables: `validateValidationShape` (schema validator branch) + `validation-state.js` con `deriveStatus(passes)` (sticky disputed D-VAL-07) + bloque paramétrico VAL-07 con feature flag env var `VAL_07_STRICT=1`. Requirements: VAL-01 + VAL-05 + VAL-07.
- **Trabajo previo (plan-phase, 2026-05-26):** 4 artefactos consolidados en `.planning/phases/09-infraestructura-de-validaci-n/`: `09-RESEARCH.md` (779 líneas), `09-PATTERNS.md`, 3 PLAN.md (`09-01`/`09-02`/`09-03`, 343+385+380 líneas, 2 waves).
- **Trabajo previo (discuss-phase, 2026-05-26):** 18 decisiones D-VAL-01..18 capturadas en `09-CONTEXT.md` + audit trail completo en `09-DISCUSSION-LOG.md`.
- **Trabajo previo (v1.0 SHIPPED):** 10 fases entregadas, 271 ejercicios curados + Modo Examen.
- **Siguiente paso:** Ejecutar Plan 09-03 (Wave 2 secuencial con checkpoint:human-verify al final del piloto). Plan 09-03 ejerce el SKILL.md + VALIDATION-PROMPT.md sobre 3 ejercicios reales+fixture (E1 preposiciones-040 + E2 avere-001 + E3 pilot-disputed-c5-leak-001) y el autor verifica las 4 must-haves del gate D-VAL-15 antes de autorizar Phase 10.

### Files Generated

**Phase 9 Plan 09-02 (este ciclo, 2026-05-26):**

- `.planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` (270 líneas — 6 secciones obligatorias: rol, R1-R7 verbatim, mapping C1-C5, contrato JSON, 2 few-shot, anti-injection)
- `.claude/skills/gsd-validate-exercise/SKILL.md` (281 líneas — frontmatter YAML válido, model IDs literales, workflow 9 pasos, justificación NO-batched verbatim)
- `tests/fixtures/validation-pilot-disputed.json` (E3 sintético C5-leak, fuera de runtime)
- `scripts/assert-avere-prefix-unchanged.mjs` (modified — stripAdditive() relax para validation field D-VAL-08)
- `.planning/phases/09-infraestructura-de-validaci-n/09-02-SUMMARY.md` (este SUMMARY)

**Phase 9 Plan 09-01 (ciclo previo, 2026-05-26):**

- `src/data/schema-validator.js` (modified — validateValidationShape branch)
- `src/data/validation-state.js` (deriveStatus helper)
- `tests/exercise-types.test.js` (modified — VAL-07 paramétrico)
- `.planning/phases/09-infraestructura-de-validaci-n/09-01-SUMMARY.md`

**Phase 9 plan-phase (ciclo previo, 2026-05-26):**

- `.planning/phases/09-infraestructura-de-validaci-n/09-RESEARCH.md` (gsd-phase-researcher — Standard Stack verificado, Architecture Responsibility Map, Code Examples 1-6, 5 Open Questions RESOLVED)
- `.planning/phases/09-infraestructura-de-validaci-n/09-PATTERNS.md` (gsd-pattern-mapper — 9 archivos clasificados con analogs concretos + BLOCKING order constraint stripAdditive→avere-001)
- `.planning/phases/09-infraestructura-de-validaci-n/09-01-PLAN.md` (Wave 1, autonomous: schema validator + deriveStatus + smoke test VAL-07 OFF; covers VAL-01/05/07)
- `.planning/phases/09-infraestructura-de-validaci-n/09-02-PLAN.md` (Wave 1, autonomous: VALIDATION-PROMPT.md + SKILL.md + fixture E3 + stripAdditive relax; covers VAL-02/03)
- `.planning/phases/09-infraestructura-de-validaci-n/09-03-PLAN.md` (Wave 2, autonomous=false con checkpoint:human-verify: piloto 3 ejercicios + run-validation-pilot.mjs + gate D-VAL-15; covers VAL-01/02/03/05)
- `.planning/ROADMAP.md` (Phase 9 `**Plans:**` actualizado de "TBD" a "3 plans" con lista; Progress table 0/3 Plans created)

**Phase 9 discuss-phase (ciclo anterior, 2026-05-26):**

- `.planning/phases/09-infraestructura-de-validaci-n/09-CONTEXT.md` (18 decisiones D-VAL-01..D-VAL-18 + canonical_refs + code_context + specifics + deferred)
- `.planning/phases/09-infraestructura-de-validaci-n/09-DISCUSSION-LOG.md` (audit trail completo de las 4 áreas + Claude's discretion + deferred ideas)

**Milestone v1.1 init (ciclo anterior, 2026-05-25):**

- `.planning/REQUIREMENTS.md` (8 requirements VAL-01..08 + traceability table populada)
- `.planning/ROADMAP.md` (modified — añadidas Phase 9 + Phase 10 a Phases checklist + Phase Details + Progress table)

**Heredado de v1.0 SHIPPED:**

- `.planning/milestones/v1.0-ROADMAP.md`, `v1.0-REQUIREMENTS.md`, `v1.0-phases/` — audit trail completo del milestone v1.0
- `.planning/phases/` — phases activas para v1.1 (vacío hasta `/gsd:plan-phase 9`)
- `~/.claude/projects/.../memory/exercise_authoring_rules.md` — R1-R7 que el validation prompt operacionalizará

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| v1.0 phases | — | shipped 2026-05-25 — ver milestones/v1.0-ROADMAP.md | — | — |
| 9 | 09-01 | 4min | 3 | 3 |
| 9 | 09-02 | 9min | 3 | 4 |

### Next Action

```

# Plan 09-02 SHIPPED. Wave 1 completa (lado A + lado B). Siguiente:

# /gsd:execute-phase 9  (sigue ejecutando — Plan 09-03 Wave 2 piloto end-to-end)

# Plan 09-03 incluye checkpoint:human-verify al final del piloto:
#   - El autor inspecciona los 3 ejercicios validados (E1 + E2 + E3)
#   - Verifica las 4 must-haves del gate D-VAL-15
#   - Si PASS: autoriza /gsd:plan-phase 10 (ejecución 271/271)
#   - Si FAIL: itera VALIDATION-PROMPT.md o SKILL.md según el bug detectado

```

Phase 9 será el piloto técnico antes del compromiso 1.5-2M tokens de Phase 10. Si el piloto detecta bugs del workflow (formato de prompt, falsos positivos, falsos negativos, AIs en desacuerdo sistemáticamente), se itera en Phase 9 sin haber gastado tokens en Phase 10. Solo cuando el piloto PASS limpio se procede a Phase 10.

**Siguiente paso (operador):** seguir ejecutando Phase 9 — `/gsd:execute-phase 9` continúa con Plan 09-03 (piloto + checkpoint).

---
*State initialized: 2026-05-23 (v1.0)*
*State re-initialized: 2026-05-25 — Milestone v1.1 planning. v1.0 archivado, Phase 9 + Phase 10 planificadas con 8/8 VAL requirements mapped, 0 orphans. Ready para `/gsd:plan-phase 9`.*

## Operator Next Steps

- `/clear` para liberar contexto del roadmapper
- `/gsd:plan-phase 9` para descomponer Phase 9 en planes ejecutables
