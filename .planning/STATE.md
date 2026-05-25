---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Validación editorial
status: "Phase 9 CONTEXT.md generado, ready para `/gsd:plan-phase 9`"
last_updated: "2026-05-26T00:30:00.000Z"
last_activity: 2026-05-26 — Phase 9 discuss-phase completo, 18 decisiones D-VAL-01..18 capturadas, 9 ítems diferidos a plan-time
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 9 — Infraestructura de validación (schema `validation` + validation prompt + workflow 1-por-1 + smoke test + piloto)

**Milestone v1.1 Goal:** Validar 271/271 ejercicios curados en v1.0 con criterios R1-R7 + quórum ≥2 AIs, eliminando bugs de batched-curation. Bug class motivador: 4 ambigüedades semánticas cazadas por casualidad en uso real post-v1.0 (preposiciones-040 amici/dai, -032 nelle pareti, -047 cadere sugli alberi, -031 libri/scaffali).

## Current Position

Phase: Phase 9 — Not started (roadmap acabado de fijar)
Plan: —
Status: Roadmap v1.1 fijado, ready para `/gsd:plan-phase 9`
Last activity: 2026-05-25 — Milestone v1.1 roadmap creado, 2 fases (Phase 9 + Phase 10), 8/8 requirements VAL-01..08 mapeados, 0 orphans

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incluyendo decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 0/2 (Phase 9 infra + Phase 10 ejecución) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 0/8 (VAL-01..08 pending) |
| Requisitos v1.1 mapeados | 8/8 (100% — VAL-01/02/03/05/07 → Phase 9; VAL-04/06/08 → Phase 10) |
| Tests dominio + UI smoke | 209/209 verdes (baseline v1.0) |
| Granularidad | coarse |
| Mode | standard (NO MVP — esto es editorial, no slice vertical) |
| Ejercicios totales en la app | 271 distribuidos en 7 categorías (todos con explanations curadas Phase 7..7.2) |

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

### Active Todos

- [ ] `/gsd:plan-phase 9` — descomponer Phase 9 en planes ejecutables (probable structure: 09-01 schema extension + smoke test paramétrico; 09-02 validation prompt + workflow doc; 09-03 piloto end-to-end sobre 1 ejercicio real)
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

- **Fecha:** 2026-05-26 (Phase 9 CONTEXT.md generado tras `/gsd-discuss-phase 9`)
- **Trabajo actual:** Discusión interactiva sobre las 4 gray areas de Phase 9 (Mecanismo workflow, Schema location + tipos, Output del AI validator, Diseño del piloto). 18 decisiones D-VAL-01..D-VAL-18 capturadas en `.planning/phases/09-infraestructura-de-validaci-n/09-CONTEXT.md` + audit trail completo en `09-DISCUSSION-LOG.md`. Resoluciones clave: (a) workflow = slash command Claude Code con Task() spawn, (b) quórum = Opus + Sonnet pragmático (riesgo mismo-vendor capturado explícito), (c) schema `validation` top-level con transiciones sticky-disputed, (d) output = JSON fenced estructurado con concerns[] tagged `[Cn-criterio]`, (e) piloto = 3 ejercicios × 2 pases (preposiciones-040 + baseline + fixture sintético C5-leak en `tests/fixtures/`) con gate = 3 estados terminales + parsing limpio. Hallazgo discusión: los 4 bugs motivadores YA están fixed → fixture sintético es la única forma determinística de probar disputed path en Phase 9.
- **Trabajo previo (Milestone init):** El orquestador `/gsd-new-milestone` (2026-05-25) corrió research → requirements → roadmap produciendo el ROADMAP.md v1.1 con 2 phases + 8/8 requirements VAL-01..08 mapped, 0 orphans.
- **Trabajo previo (v1.0 SHIPPED):** 10 fases entregadas. App funcionalmente completa con motor re-verificación + 7 categorías + 271 ejercicios curados + Modo Examen. El autor lleva usando la app diariamente desde Phase 2 — uso real expuso los 4 bugs de Preposiciones que motivan v1.1.
- **Siguiente paso:** `/clear` luego `/gsd:plan-phase 9` para descomponer Phase 9 en planes ejecutables. El planner lee `09-CONTEXT.md` y resuelve los 9 ítems "Claude's Discretion" diferidos a plan-time (paralelo vs secuencial pases, granularidad commit, ubicación slash command, retry budget, idioma del prompt, few-shot examples, implementación feature flag VAL-07, E2 baseline exacto, relax del avere-prefix-assert).

### Files Generated

**Phase 9 discuss-phase (este ciclo, 2026-05-26):**

- `.planning/phases/09-infraestructura-de-validaci-n/09-CONTEXT.md` (18 decisiones D-VAL-01..D-VAL-18 + canonical_refs + code_context + specifics + deferred)
- `.planning/phases/09-infraestructura-de-validaci-n/09-DISCUSSION-LOG.md` (audit trail completo de las 4 áreas + Claude's discretion + deferred ideas)
- `.planning/STATE.md` (este archivo — Last Session actualizado a Phase 9 context gathered)

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

### Next Action

```

# Milestone v1.1 roadmap fijado. Siguiente:

# 1. /clear  → libera contexto del roadmapper

# 2. /gsd:plan-phase 9  → descomponer Phase 9 en planes ejecutables

# Phase 9 entrega la infraestructura (schema, prompt, workflow, smoke test) + piloto small-scale.

# Phase 10 ejecuta validación de los 271 ejercicios hasta 271/271 validated.

```

Phase 9 será el piloto técnico antes del compromiso 1.5-2M tokens de Phase 10. Si el piloto detecta bugs del workflow (formato de prompt, falsos positivos, falsos negativos, AIs en desacuerdo sistemáticamente), se itera en Phase 9 sin haber gastado tokens en Phase 10. Solo cuando el piloto PASS limpio se procede a Phase 10.

**Siguiente paso (operador):** `/clear` → `/gsd:plan-phase 9`.

---
*State initialized: 2026-05-23 (v1.0)*
*State re-initialized: 2026-05-25 — Milestone v1.1 planning. v1.0 archivado, Phase 9 + Phase 10 planificadas con 8/8 VAL requirements mapped, 0 orphans. Ready para `/gsd:plan-phase 9`.*

## Operator Next Steps

- `/clear` para liberar contexto del roadmapper
- `/gsd:plan-phase 9` para descomponer Phase 9 en planes ejecutables
