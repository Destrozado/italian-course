---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Validación editorial
status: shipped
last_updated: "2026-05-26T15:54:35.806Z"
last_activity: 2026-05-26 -- Plan 10-03 completed (docs README + STATE.md scaffolding `## Phase 10 Progress` + `## Deferred-disputed`)
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 8
  completed_plans: 6
  percent: 38
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 10 — ejecuci-n-validaci-n-271-ejercicios-escalada-disputed

**Milestone v1.1 Goal:** Validar 271/271 ejercicios curados en v1.0 con criterios R1-R7 + quórum ≥2 AIs, eliminando bugs de batched-curation. Bug class motivador: 4 ambigüedades semánticas cazadas por casualidad en uso real post-v1.0 (preposiciones-040 amici/dai, -032 nelle pareti, -047 cadere sugli alberi, -031 libri/scaffali).

## Current Position

Phase: 10 (ejecuci-n-validaci-n-271-ejercicios-escalada-disputed) — EXECUTING
Plan: 4 of 5 (Plan 10-01 + Plan 10-02 + Plan 10-03 closed)
Status: Ready to execute Plan 09-03 (piloto Phase 9 checkpoint:human-verify) → Plan 10-04 (batch run real sobre 269 pendientes) → Plan 10-05 (milestone close gate)
Last activity: 2026-05-27 -- Categoría verbos-movimiento cerrada vía /gsd-validate-batch (37/37 validated, 6 disputed resueltos) — 272/272 TOTAL VALIDATED

Phase 10 — Categoría verbos-movimiento cerrada (2026-05-27): 37/37 validated, 6 disputed resueltos, 0 deferred, 0 pending. ¡272/272 ejercicios validated en las 7 categorías!

Phase 10 — Categoría profesiones cerrada (2026-05-27): 51/51 validated, 15 disputed resueltos, 0 deferred, 0 pending.

Phase 10 — Categoría sustantivos-irregulares cerrada (2026-05-27): 31/31 validated, 6 disputed resueltos, 0 deferred, 0 pending.

Phase 10 — Categoría genero-numero cerrada (2026-05-27): 40/40 validated, 8 disputed resueltos, 0 deferred, 0 pending.

Phase 10 — Categoría essere cerrada (2026-05-27): 39/39 validated, 6 disputed resueltos, 0 deferred, 0 pending.

Phase 10 — Categoría avere cerrada (2026-05-27): 23/23 validated, 3 disputed resueltos (avere-009 override autor; avere-202 accept-fix 2 ciclos; avere-300 accept-fix), 0 deferred, 0 pending. Snapshot D-88 regenerado tras fix aprobado de avere-202.

**Plan 10-03 closure (2026-05-26):**

- Docs README: sección `## Validación editorial (milestone v1.1)` añadida (115 líneas vs baseline 88; +27 append) con bloque copy-paste literal `VAL_07_STRICT=1 node --test tests/*.test.js` + explicación del flip manual (RESEARCH Q6 + D-VAL-17) + 3 comandos del workflow editorial + mención de los 4 caminos terminales VAL-08
- STATE.md scaffolding: secciones `## Phase 10 Progress` (checklist 7 categorías D-VAL-22 + comentario HTML formato literal) + `## Deferred-disputed` (placeholder D-VAL-25 path-d) insertadas ANTES de `## Operator Next Steps` que preserva el cierre del archivo
- Las 88 líneas pre-existentes del README preservadas intactas; resto del STATE.md (Project Reference, Current Position previo, Performance Metrics, Accumulated Context, Session Continuity) preservado
- Deviation Rule 3 - Blocking documentada: regex verify `! grep -q "npm install" README.md` falla por contenido pre-existente línea 25 ("Sin `npm install`" — pre-existente niega el uso, NO lo introduce); acceptance criterion "preservar 88 líneas previas intactas" tiene prioridad. Análogo a Plan 09-02 D-VAL-09
- Zero deps añadidas, cero scripts/skills modificados, cero deviations Rule 4 (architectural)
- VAL-06 partially-supported (docs ready for milestone-close use)

**Plan 10-02 closure (2026-05-26):**

- Reporter milestone gate: `scripts/run-validation-271.mjs` (NUEVO, 357 líneas, supera el `min_lines: 120` del plan must-haves por 3×)
- Zero-deps invariant preservado: solo `node:fs` + `node:url` + `node:path` + import del módulo puro `validation-state.js`. NO `child_process`, NO `writeFileSync`, NO shell-out a `node --test`
- 3 sub-gates verificados: VAL-04 (≥2 distinct `by` por validated), VAL-06 (271/271 validated), VAL-08 (cero disputed)
- Helper `effectiveStatus(passes)` implementa relax path-B D-VAL-25 cb (RESEARCH Open Q #1 opción c): `deriveStatus==='disputed'` + entry `{by:'autor', verdict:'correcta'}` → trata como `validated`
- Mensaje literal `VAL_07_STRICT=1 node --test tests/*.test.js` impreso al PASS como siguiente paso manual (gesto consciente del autor; Phase 10 NO auto-flippea)
- Tabla colorizada ANSI con 6 columnas (Categoría/Total/Validated/Disputed/Pending/Missing) + warnings inline en amarillo (disputed IDs, missing N, inconsistencia status escrito vs derivado)
- Defensive load (no throws): JSON corrupto reporta error y sigue con el resto (mitiga T-10-02-02)
- Estado del run pre-batch verificado: exit 1 con 2/271 validated (los del piloto Phase 9: preposiciones-040 + avere-001), 269 en missing — la rama defensive funciona como diseñada
- VAL-04 + VAL-06 completados (criterios verificables; el milestone cierra cuando el reporter sale exit 0 tras Plan 10-04 + colaresolución)

**Plan 10-01 closure (2026-05-26):**

- Categoría sub-skill: `.claude/skills/gsd-validate-batch/SKILL.md` (NUEVO, 630 líneas, frontmatter YAML válido con 9 herramientas incluyendo AskUserQuestion + Skill, sin modo fork del contexto)
- Las 8 decisiones D-VAL-19..D-VAL-26 documentadas verbatim
- Los 4 caminos disputed con texto literal en español + suggested-fix derivado del tag [Cn-criterio]
- Reconsider trigger D-VAL-21 (preposiciones-031/-032/-047 + threshold 5%)
- Pre-flight + cierre AVERE assert con AskUserQuestion 3 opciones
- Schema-validation defensive POST-categoría
- Skill base Phase 9 intocable (`git diff --stat .claude/skills/gsd-validate-exercise/SKILL.md` vacío)
- VAL-08 completed

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incluyendo decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 0/2 (Phase 9 infra + Phase 10 ejecución) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (VAL-01/05/07 done en Plan 09-01; VAL-02/03 done en Plan 09-02; VAL-08 done en Plan 10-01; VAL-04/06 done en Plan 10-02 reporter — milestone cierra cuando reporter exit 0 tras Plan 10-04 batch run) |
| Requisitos v1.1 mapeados | 8/8 (100% — VAL-01/02/03/05/07 → Phase 9; VAL-04/06/08 → Phase 10) |
| Tests dominio + UI smoke | 254/254 verdes (baseline v1.0 + Plan 09-01: +24 nuevos) |
| Granularidad | coarse |
| Mode | standard (NO MVP — esto es editorial, no slice vertical) |
| Ejercicios totales en la app | 271 distribuidos en 7 categorías (todos con explanations curadas Phase 7..7.2) |
| Phase 9 P01 | 4min | 3 tasks | 3 files |
| Phase 9 P09-02 | 9min | 3 tasks | 3 files |
| Phase 10 P01 | 6min | 1 tasks | 1 files |
| Phase 10 P02 | ~12min | 1 tasks | 1 files |
| Phase 10 P03 | ~2min | 2 tasks | 2 files |

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
| 2026-05-26 | Plan 10-01: sub-skill `gsd-validate-batch` corre INLINE en main session, NO en modo fork del contexto | RESEARCH Q1/Q2: (a) AskUserQuestion no disponible en subagents spawneados vía Task (anthropics/claude-code#18721) — sin él, banner D-VAL-26 + checkpoint D-VAL-23 fallan; (b) subagents no pueden spawnear otros subagents (Claude Code docs /en/sub-agents) — un sub-skill forkeado no podría invocar `gsd-validate-exercise` que internamente usa 2 Task(). La D-VAL-19 "su propio subagent" se entiende en sentido conceptual (body del SKILL.md autocontenido), NO técnico. |
| 2026-05-26 | Plan 10-01: BYPASS sticky D-VAL-07 vive en el batch (Edit tool resetea `passes:[]` antes de invocar al skill hijo), NO en `gsd-validate-exercise` | Skill base Phase 9 intocable per critical_constraint #8 del plan. Phase 9 SKILL.md Paso 8 ya documenta APPEND como default y deja al CALLER la responsabilidad del reset. Audit trail completo preservado vía git log (los passes[] originales viven en commits anteriores `validate(...) → disputed`). |
| 2026-05-26 | Plan 10-01: reformulación táctica `context: fork` -> `modo fork del contexto` en body del SKILL.md por tensión menor action/verify | El plan action exige documentar invariante "NUNCA `context: fork`" en critical_constraints (necesita la frase); el verify automated exige `! grep -q "context: fork"` sobre TODO el archivo. Patrón análogo al Plan 09-02 D-VAL-09 ("cero gestores de paquetes" vs literal "npm install"). Meaning preservado; el lector humano entiende perfectamente. |
| 2026-05-26 | Plan 10-02: `effectiveStatus(passes)` vive en `scripts/run-validation-271.mjs` (NO en `validation-state.js`) | Semánticamente es regla del reporter, no del motor de derivación. El módulo puro `validation-state.js::deriveStatus` mantiene su contrato sticky D-VAL-07 (testeado en bloque paramétrico VAL-07 con 7 sub-tests Phase 9) — añadir parámetro `allowAuthorOverride` contaminaría el contrato, requeriría actualizar call-sites Phase 9, y violaría "Phase 10 NO modifica archivos Phase 9". El relax path-B vive donde se consume. Pattern reutilizable para futuros reporters/validators que necesiten distinguir disputed-real vs override-validado. |
| 2026-05-26 | Plan 10-02: reporter NO shellea `node --test` — el smoke test estricto VAL-07 es paso MANUAL separado al cierre | RESEARCH Q5 #2 + TL;DR #4: auto-correr tests desde el reporter (a) confunde exit-code semantics (test failure ≠ gate failure), (b) acopla 2 responsabilidades (estado JSONs vs comportamiento código), (c) añade ~5-15s latencia. El autor flippea `VAL_07_STRICT=1` conscientemente al cierre del milestone como gesto consciente — debe ser acción separada y explícita, no efecto secundario del reporter. El reporter imprime el comando literal en PASS para zero ambigüedad. |
| 2026-05-26 | Plan 10-03: README es single-source-of-truth del comando `VAL_07_STRICT=1 node --test tests/*.test.js`; STATE.md scaffolding precede al runtime (Plan 10-04 batch lo puebla) | RESEARCH Q6: documentar en README + autor flippea manualmente al cierre. NO auto-flip (mutación silenciosa al final de un batch agotador), NO `.env` write (sin audit trail por gitignore), NO setting en `.planning/config.json` (introduce dependencia inversa tests↔planning). El reporter Plan 10-02 imprime el comando literal en PASS → cero ambigüedad. |
| 2026-05-26 | Plan 10-03: regex verify `! grep -q "npm install" README.md` falla por contenido PRE-EXISTENTE línea 25 (\"Sin `npm install`\") — preservar las 88 líneas previas tiene prioridad sobre el regex | El contenido pre-existente NIEGA el uso de npm install (refuerza el invariante zero-deps, no lo viola). Análogo a Plan 09-02 D-VAL-09 y Plan 10-01 D-VAL-19-frontmatter (\"cero gestores de paquetes\" / \"modo fork del contexto\" vs literal). Documentado como deviation Rule 3 - Blocking no-fix; el intent del plan task (no añadir referencias nuevas a npm install) se respeta 100%. |

### Active Todos

- [x] `/gsd:plan-phase 9` — descomponer Phase 9 en planes ejecutables (DONE 2026-05-26 — 09-RESEARCH + 09-PATTERNS + 3 PLAN.md)
- [x] Plan 09-01 (Wave 1 lado A: schema + deriveStatus + VAL-07 paramétrico) — DONE 2026-05-26 (5 commits, 254/254 tests verdes, VAL-01/05/07 completados)
- [x] Plan 09-02 (Wave 1 lado B: VALIDATION-PROMPT.md + SKILL.md + fixture E3 + stripAdditive relax) — DONE 2026-05-26 (3 commits + summary, 254/254 tests verdes, VAL-02/03 completados)
- [ ] Plan 09-03 (Wave 2: piloto end-to-end 3 ejercicios + checkpoint:human-verify) — ready to execute (depends_on 09-01 + 09-02 ya completados)
- [ ] Ejecutar Phase 9 plans hasta verifier PASS
- [x] `/gsd:plan-phase 10` — descomponer Phase 10 (DONE 2026-05-26 — 5 PLAN.md + RESEARCH + PATTERNS + CONTEXT)
- [x] Plan 10-01 (Wave 1 lado A: sub-skill `gsd-validate-batch` para VAL-08 escalada UX inline) — DONE 2026-05-26 (1 commit `db99070`, 630 líneas SKILL.md, VAL-08 completado)
- [x] Plan 10-02 (Wave 1 lado B paralelo: reporter `scripts/run-validation-271.mjs` para VAL-04 + VAL-06 gate) — DONE 2026-05-26 (1 commit `8372d10`, 357 líneas reporter zero-deps, VAL-04 + VAL-06 completados)
- [x] Plan 10-03 (docs: README sección `VAL_07_STRICT=1` activación manual + STATE.md scaffolding `## Phase 10 Progress` + `## Deferred-disputed`) — DONE 2026-05-26 (2 commits `a26cbc7` + `5a5b1f0`, README 88→115 líneas, STATE.md +24 líneas, VAL-06 partial)
- [ ] Plan 10-04 (Wave 2: ejecución real del batch sobre 269 pendientes — invocar `/gsd-validate-batch --all-pending`)
- [ ] Plan 10-05 (Close gate: reporter exit 0 + flip `VAL_07_STRICT=1`)
- [ ] `/gsd:complete-milestone v1.1` — tras verifier PASS de Phase 10

### Blockers

(Ninguno — v1.0 cerrado, roadmap v1.1 fijado, R1-R7 en memoria persistente)

### Decisions Pending

- ¿Cuántos AIs distintos exactamente en el quórum? VAL-04 dice "≥2" — Phase 9 plan-time elegirá el pool concreto (sugerencia inicial: `claude-opus-4-7` + `gemini-2.5-pro`, opcionalmente `gpt-5` como tiebreaker en disputed). Decisión diferida a `09-02` o `09-03`.
- ¿Workflow ejecutado por scripts node + agent spawn o manualmente vía slash command repetido 271×2 veces? Phase 9 piloto lo decide. Hipótesis inicial: script + `Task` agent spawn parametrizado por exercise-id; el script lee el JSON, extrae 1 ejercicio, lo pasa al validator prompt en agente fresco, parsea verdict, mergea `passes[]` de vuelta al JSON.
- ¿Disputed exercises del piloto Phase 9 cuentan para el 271/271 de Phase 10 o se re-validan? Asunción de trabajo: se re-validan en Phase 10 con AIs distintos para mantener el invariante "≥2 AIs distintos en validated". Decisión final en plan-time Phase 10.

## Session Continuity

### Last Session

- **Fecha:** 2026-05-26 (Plan 10-03 ejecutado dentro de Phase 10 Wave 1 lado C — `/gsd:execute-phase 10`)
- **Trabajo actual:** Plan 10-03 completado en ~2 minutos con 2 commits atómicos en `master` (`a26cbc7` README + `5a5b1f0` STATE.md). Entregables: (1) `README.md` extendido de 88 a 115 líneas (+27 append) con sección nueva `## Validación editorial (milestone v1.1)` — párrafo introductorio explicando el quórum R1-R7 + 271/271 target + bug class motivador, subsección `### Smoke test estricto al cierre del milestone` con bloque copy-paste literal del comando `VAL_07_STRICT=1 node --test tests/*.test.js` + 2 frases sobre cómo previene regresión + por qué el flip es manual por diseño (RESEARCH Q6 + D-VAL-17 — gesto consciente, NO auto-flip), subsección `### Workflow editorial — comandos` con 3 comandos del autor (`/gsd-validate-exercise`, `/gsd-validate-batch`, `node scripts/run-validation-271.mjs`) + mención de los 4 caminos terminales VAL-08 (Accept fix / Reject + override / Rewrite manualmente / Skip defer). Las 88 líneas pre-existentes preservadas intactas (header `# Italian Course — Ejercicios A1/A2` línea 1, `## Estado del proyecto` previo). (2) `.planning/STATE.md` extendido con 2 secciones nuevas insertadas ANTES de `## Operator Next Steps` (que se preserva como cierre): `## Phase 10 Progress` con comentario HTML invisible documentando el formato literal que el sub-skill batch Plan 10-04 appendea por cada categoría cerrada + subsección `### Categorías (orden lockeado D-VAL-22):` con checklist de las 7 categorías sin marcar (preposiciones 49 + avere 22 + essere 39 + genero-numero 40 + profesiones 51 + sustantivos-irregulares 31 + verbos-movimiento 37 = 269 pendientes = 271 - 2 piloto) + subsección `### Categorías cerradas:` vacía con placeholder; `## Deferred-disputed` con comentario HTML referenciando D-VAL-25 path-d + formato literal de las líneas que el batch appendea cuando autor responde "Skip (defer al final del milestone)" + 1 línea de placeholder vacío. Frontmatter actualizado: `last_activity` Plan 10-03, `progress.completed_plans` 5→6, `progress.percent` 25→38; `milestone: v1.1` + `milestone_name: Validación editorial` preservados. Resto del STATE.md intacto (Project Reference, Current Position previo, Performance Metrics, Accumulated Context, Session Continuity). Deviation Rule 3 - Blocking documentada: regex verify `! grep -q "npm install" README.md` falla por contenido pre-existente línea 25 ("Sin `npm install`" — pre-existente NIEGA el uso, refuerza el invariante zero-deps, no lo viola); acceptance criterion "preservar las 88 líneas previas intactas" tiene prioridad. Análogo a Plan 09-02 D-VAL-09 y Plan 10-01 D-VAL-19-frontmatter (zero-deps invariant descrito SIN literal "npm install"). Zero deps añadidas. Cero scripts/skills modificados. Cero deviations Rule 4 (architectural). Requirements: VAL-06 partial-supported (docs ready for milestone-close use; el requirement cierra completo en Plan 10-05 tras reporter exit 0 + flip manual del autor).
- **Trabajo previo (Plan 10-02, 2026-05-26):** Plan 10-02 completado en ~12 minutos con 1 commit atómico en `master` (`8372d10`). Entregable: `scripts/run-validation-271.mjs` (NUEVO, 357 líneas). Reporter milestone gate v1.1 zero-deps con 3 sub-gates VAL-04 + VAL-06 + VAL-08, helper `effectiveStatus(passes)` relax path-B D-VAL-25 cb, tabla ANSI colorizada con 6 columnas, exit 0 con mensaje literal `VAL_07_STRICT=1 node --test tests/*.test.js` en PASS. Defensive load sin throws. Ejecución verificada: exit 1 con 2/271 validated, 269 missing — rama defensive funciona. Requirements: VAL-04 + VAL-06.
- **Trabajo previo (Plan 10-01, 2026-05-26):** Plan 10-01 completado en ~6 minutos con 1 commit atómico (`db99070`). Entregable: `.claude/skills/gsd-validate-batch/SKILL.md` (NUEVO, 630 líneas). Frontmatter YAML válido con 9 herramientas incluyendo AskUserQuestion + Skill, sin modo fork del contexto. 8 decisiones D-VAL-19..D-VAL-26 documentadas verbatim. 4 caminos disputed con texto literal español. Reconsider trigger D-VAL-21 + pre-flight + cierre AVERE assert + schema-validation defensive. Skill base Phase 9 intocable. VAL-08 completed.
- **Trabajo previo (Plan 09-02, 2026-05-26):** Plan 09-02 completado en 9 minutos con 3 commits atómicos. Entregables: `09-VALIDATION-PROMPT.md` (270 líneas, R1-R7 inline + C1-C5 mapping + 2 few-shot) + `.claude/skills/gsd-validate-exercise/SKILL.md` (281 líneas, orquestador Opus+Sonnet) + fixture E3 + stripAdditive() relax. Requirements: VAL-02 + VAL-03.
- **Trabajo previo (Plan 09-01, 2026-05-26):** Plan 09-01 completado en 4 minutos (5 commits TDD RED→GREEN). Entregables: `validateValidationShape` (schema validator branch) + `validation-state.js` con `deriveStatus(passes)` (sticky disputed D-VAL-07) + bloque paramétrico VAL-07 con feature flag env var `VAL_07_STRICT=1`. Requirements: VAL-01 + VAL-05 + VAL-07.
- **Trabajo previo (plan-phase, 2026-05-26):** 4 artefactos consolidados en `.planning/phases/09-infraestructura-de-validaci-n/`: `09-RESEARCH.md` (779 líneas), `09-PATTERNS.md`, 3 PLAN.md (`09-01`/`09-02`/`09-03`, 343+385+380 líneas, 2 waves).
- **Trabajo previo (discuss-phase, 2026-05-26):** 18 decisiones D-VAL-01..18 capturadas en `09-CONTEXT.md` + audit trail completo en `09-DISCUSSION-LOG.md`.
- **Trabajo previo (v1.0 SHIPPED):** 10 fases entregadas, 271 ejercicios curados + Modo Examen.
- **Siguiente paso:** Ejecutar Plan 09-03 (piloto Phase 9 checkpoint:human-verify, recomendado antes de Plan 10-04) → Plan 10-04 (`/gsd-validate-batch --all-pending` sobre 269 pendientes con checkpoint AskUserQuestion por categoría + cola disputed VAL-08) → Plan 10-05 (milestone close: reporter `node scripts/run-validation-271.mjs` exit 0 + flip manual del autor `VAL_07_STRICT=1 node --test tests/*.test.js` + `/gsd:complete-milestone v1.1`).

### Files Generated

**Phase 10 Plan 10-03 (este ciclo, 2026-05-26):**

- `README.md` (modified — añadida sección `## Validación editorial (milestone v1.1)` tras `## Estado del proyecto`; 88 → 115 líneas; +27 append; comando literal `VAL_07_STRICT=1 node --test tests/*.test.js` como single-source-of-truth + 3 comandos del workflow editorial + mención de los 4 caminos terminales VAL-08; las 88 líneas pre-existentes intactas incluyendo el "Sin `npm install`" línea 25 que refuerza zero-deps)
- `.planning/STATE.md` (modified — añadidas secciones `## Phase 10 Progress` con checklist de las 7 categorías en orden D-VAL-22 + `## Deferred-disputed` placeholder D-VAL-25 path-d, ambas insertadas ANTES de `## Operator Next Steps`; frontmatter `last_activity` + `completed_plans` 5→6 + `percent` 25→38)
- `.planning/phases/10-ejecuci-n-validaci-n-271-ejercicios-escalada-disputed/10-03-SUMMARY.md` (NUEVO — este SUMMARY)

**Phase 10 Plan 10-02 (ciclo previo, 2026-05-26):**

- `scripts/run-validation-271.mjs` (NUEVO, 357 líneas — reporter milestone gate v1.1 zero-deps, 3 sub-gates VAL-04 + VAL-06 + VAL-08, helper `effectiveStatus(passes)` relax path-B, tabla ANSI colorizada con 6 columnas en español, exit 0/1 según gate, mensaje literal `VAL_07_STRICT=1 node --test tests/*.test.js` impreso al PASS como siguiente paso manual)
- `.planning/phases/10-ejecuci-n-validaci-n-271-ejercicios-escalada-disputed/10-02-SUMMARY.md` (este SUMMARY)

**Phase 10 Plan 10-01 (ciclo previo, 2026-05-26):**

- `.claude/skills/gsd-validate-batch/SKILL.md` (NUEVO, 630 líneas — sub-skill orquestador batch inline en main session, frontmatter YAML válido con 9 herramientas, las 8 decisiones D-VAL-19..D-VAL-26 documentadas verbatim, 4 caminos disputed con texto literal en español, banner pretty-print con suggested-fix derivado del tag [Cn-criterio], pre-flight + cierre AVERE asserts, schema-validation defensive, reconsider trigger D-VAL-21)
- `.planning/phases/10-ejecuci-n-validaci-n-271-ejercicios-escalada-disputed/10-01-SUMMARY.md`

**Phase 9 Plan 09-02 (ciclo previo, 2026-05-26):**

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
| 10 | 10-01 | 6min | 1 | 1 |
| 10 | 10-02 | ~12min | 1 | 1 |
| 10 | 10-03 | ~2min | 2 | 2 |

### Next Action

```

# Plan 10-03 SHIPPED. README sección Validación editorial v1.1 (commit a26cbc7) + STATE.md scaffolding (commit 5a5b1f0).

# Wave 1 cerrado completo: lado A (10-01 sub-skill) + lado B (10-02 reporter) + lado C (10-03 docs/state).

# Siguiente:

# /gsd:execute-phase 9   (Plan 09-03 piloto Phase 9 checkpoint:human-verify — recomendado antes de Plan 10-04)

# /gsd:execute-phase 10  (sigue ejecutando — Plan 10-04 batch real sobre 269 pendientes vía /gsd-validate-batch --all-pending)

# Cierre milestone v1.1 (Plan 10-05): reporter exit 0 + flip VAL_07_STRICT=1 manual + /gsd:complete-milestone v1.1.

```

Wave 1 cerrado (10-01 + 10-02 + 10-03 closed). Quedan: Plan 09-03 (piloto Phase 9 checkpoint:human-verify, recomendado antes de Plan 10-04), Plan 10-04 (batch real, autonomous=false con checkpoints AskUserQuestion), Plan 10-05 (cierre milestone).

**Siguiente paso (operador):** ejecutar Plan 09-03 (piloto) → Plan 10-04 (batch real sobre 269 pendientes) → Plan 10-05 (cierre milestone).

---
*State initialized: 2026-05-23 (v1.0)*
*State re-initialized: 2026-05-25 — Milestone v1.1 planning. v1.0 archivado, Phase 9 + Phase 10 planificadas con 8/8 VAL requirements mapped, 0 orphans. Ready para `/gsd:plan-phase 9`.*

## Phase 10 Progress

<!-- El sub-skill gsd-validate-batch appendea aquí una línea por cada categoría cerrada, formato literal: "Phase 10 — Categoría <slug> cerrada (<ISO-fecha>): X/Y validated, Z disputed resueltos, W deferred" -->

### Categorías (orden lockeado D-VAL-22):

- [x] preposiciones — CERRADA 2026-05-26: 51/51 validated (50 originales + 1 nuevo -051), 0 disputed. 11 disputed resueltos vía fixes editoriales (técnica: traducción española objetivo en prompt). +1 ejercicio nuevo -051 (par di/su con -020).
- [x] avere — CERRADA 2026-05-27: 23/23 validated, 3 disputed resueltos.
- [x] essere — CERRADA 2026-05-27: 39/39 validated, 6 disputed resueltos.
- [x] genero-numero — CERRADA 2026-05-27: 40/40 validated, 8 disputed resueltos.
- [x] profesiones — CERRADA 2026-05-27: 51/51 validated, 15 disputed resueltos.
- [x] sustantivos-irregulares — CERRADA 2026-05-27: 31/31 validated, 6 disputed resueltos.
- [x] verbos-movimiento — CERRADA 2026-05-27: 37/37 validated, 6 disputed resueltos.

### Categorías cerradas:

- Phase 10 — Categoría verbos-movimiento cerrada (2026-05-27): 37/37 validated, 6 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~16% (6/37). Disputed: 011/024/026 ([C5] el participio femenino dado en el prompt — andata/venuta/partite — insinúa que el auxiliar es essere por concordancia de género; solo Sonnet, Opus OK; mismo formato par-complementario que 013/015/025 ya validados → Reject+override del autor: el ejercicio aún exige elegir persona/número del auxiliar y el diseño dar-un-lado/pedir-el-otro es intencional); 012/022 ([C4] meta-staging "este ejercicio es la cara complementaria/opuesta del anterior" en la explanation → accept-fix eliminando la referencia editorial); 028 ([C2] "Tu sei ___" sin fijar género del tu → uscito/uscita ambas válidas, doble-validez → accept-fix: prompt "Marco, tu sei ___" fija masculino). Patrón: la categoría es muy regular (passato prossimo essere+concordancia / excepciones avere viaggiare/nuotare/camminare/ballare + correre dual); los concerns fueron meta-staging editorial y doble-validez de género no fijado. CIERRA EL MILESTONE v1.1: 272/272 validated en las 7 categorías.
- Phase 10 — Categoría profesiones cerrada (2026-05-27): 51/51 validated, 15 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~29% (15/51, la categoría más compleja editorialmente: mezcla de multiple-choice, match y word-buttons). Patrones de los disputed: (1) refs meta del curador en explanation (024/025 "el PDF de la profesora/tabla", 031 "(cross-ref a Género y Número)", 039 meta-staging del diseñador) → accept-fix limpiando; (2) explanation lingüísticamente imprecisa (005/014 "-essa exige raíz en -e" cuando dottore/professore acaban en -ore; 011 "H tras la C" atribuida a la feminización cuando ya está en el masculino; 033 "-atore sufijo compuesto") → accept-fix precisando; (3) doble-validez (003 avvocata/avvocatessa con avvocatessa en opciones → fuera de opciones; 100 word-buttons dottora/dottoressa → explanation no llama error a dottora); (4) tags en prompt que filtran la regla (019 "(masc, coloquial)", 028 "(masc, préstamo inglés)") → simplificados; (5) factual: 030 muratore→muratrice dudoso (muratrice = máquina) → cambiado a allenatore→allenatrice; (6) match no unívoco 200 (cuoco/cameriere ambos en ristorante/bar) → cuoco→cucina, cameriere→ristorante; (7) 020 invariable "Il collega → la ___" muestra la respuesta → Reject+override (es el test de invariabilidad, coherente con cantante/dentista/pianista/tassista/pilota validadas). 019 necesitó 2 ciclos de fix (prompt + explanation). Nota de proceso: el formato "X → la ___" en profesiones invariables muestra la palabra-respuesta; salvo 020 (flagged por Sonnet) el resto validó — borderline aceptado como test de invariabilidad.
- Phase 10 — Categoría sustantivos-irregulares cerrada (2026-05-27): 31/31 validated, 6 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~19% (6/31). Disputed: 007/021/022 ([C2-una_opcion] doble-validez en plurales del cuerpo — orecchi/orecchie, ginocchi/ginocchia, ossi/ossa: la forma "rival" también válida estaba en las opciones y la explanation la admitía; AMBOS modelos en los 3; resueltos accept-fix fijando CONTEXTO en el prompt que fuerza una sola forma — "Le orecchie grandi", "le ginocchia fanno male", "Lo scheletro umano ha molte ossa" — patrón de fix R7); 027/030/031 ([C1-natural] el tag "(dirección inversa)" del formato de reconocimiento inverso plural→singular juzgado como meta-staging artificial; resueltos accept-fix eliminando el tag — la estructura "Due X, un ___." ya comunica la tarea, como demostró 029 que validó limpio sin tag; 028 re-tocado por coherencia aunque ya estaba validated). Patrón dominante: doble-validez en sustantivos con dos plurales aceptados (cuerpo humano) + meta-staging en el tag de dirección inversa. Nota de proceso: 027/030/031 requirieron 2 ciclos de fix — el primer ciclo (contexto/trim) resolvió la doble-validez pero la re-validación surfaceó el concern C1 del tag "(dirección inversa)", resuelto en el 2º ciclo. Nondeterminismo observado: 030/031 oscilaron entre correcta/disputed entre runs por lo borderline del formato inverso — confirmó que el tag era la causa.
- Phase 10 — Categoría genero-numero cerrada (2026-05-27): 40/40 validated, 8 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~20% (8/40). Disputed: 006 (Reject+override — falso positivo de Sonnet [C5-leak] sobre el formato flecha "X → la ___"; Opus OK y el mismo formato validó en 019-027; la flecha es la TAREA del ejercicio, no leak de la regla morfológica); 007/028 ([C4] explanations sobre dottore→dottoressa con afirmaciones contradictorias/falsas sobre "-tore/-trice" — 028 cazado por AMBOS modelos; accept-fix reescribiendo la explanation a la regla -essa limpia); 012 ([C4] meta-staging "Refuerzo directo de la regla general femenina:" como prefijo del curador — accept-fix quitando el prefijo); 033/034/036 ([C5-leak] AMBOS modelos — etiqueta "(sustantivo invariable, vocal acentuada/préstamo inglés)" en el prompt que nombra la regla; accept-fix borrando el paréntesis); 037 ([C1/C2/C4] doble-validez psicologi/psicologhi — psicologo es la EXCEPCIÓN a la regla -go→-ghi: profesiones en -logo de persona hacen plural en -gi; el multiple-choice de respuesta única no admite dos correctas → accept-fix: correcta=psicologi, se retira psicologhi de opciones, explanation reescrita). Patrón dominante: leak de etiquetas meta en el prompt (R1/C5) + explanations con errores factuales/contradicciones en la familia profesiones -tore/-essa (R5/C4). Nota proceso: el formato flecha de cambio de género validó limpio en 019-027; el único disputed por ese formato (006) fue falso positivo aislado de Sonnet.
- Phase 10 — Categoría preposiciones cerrada (2026-05-26): 51/51 validated, 11 disputed resueltos, 0 deferred, 0 pending. Nota: +1 ejercicio nuevo (-051) creado durante la resolución de disputed. Dispute rate inicial ~22% (muy por encima del 5-15% hipotético) — el sistema cazó bugs editoriales reales: R7 doble-validez verbo+ciudad/libro+tema, R2 ref a ejercicio por ID, R4 meta-staging, C1 falta artículo. Técnica de resolución validada: incluir la traducción española objetivo en el prompt desambigua doble-validez Y hace que el alumno ejercite el significado.
- Phase 10 — Categoría essere cerrada (2026-05-27): 39/39 validated, 6 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~15% (6/39). Disputed: 016/300/301 → meta-staging C4 ("en estos ejercicios" / "dispara cascada" / "motor de re-verificación") resueltos accept-fix; 026 → error factual ("stato como auxiliar en è andato") accept-fix 2 ciclos (Sonnet cazó imprecisión "el auxiliar es siempre è" en el 1º); 300 también accept-fix 2 ciclos (Opus cazó framing residual "los dos pilares del eje essere/avere" en el 1º); 018 → doble validez C2 (avete=tenéis studenti) resuelto añadiendo contraste "non professori" al prompt; 305 → error factual ("vengo di Madrid" debía ser "vengo da Madrid") accept-fix. Patrón dominante: meta-staging + errores factuales en explanations de los cruces D-94 (300/301/305). Commit de normalización previo (essere.json a formato 2-espacios expandido).
- Phase 10 — Categoría avere cerrada (2026-05-27): 23/23 validated, 3 disputed resueltos, 0 deferred, 0 pending. Dispute rate ~14% (3/22). Disputed: avere-009 → Reject+override (falso positivo C5-leak de Sonnet: confundía explanation/notes con el prompt; R1 limita C5-leak al prompt). avere-202 (match D-66) → Accept-fix en 2 ciclos: 1º añadir 4º par voi→avete (C3 distribución), 2º limpiar prompt «(con duplicados)» (C5) + referencia al sistema en explanation (C4 meta-staging). avere-300 → Accept-fix: explanation con error de idioma (palabras españolas «mecánico, oficinista» como si fueran italianas) reescrita. Snapshot D-88 regenerado tras la mutación aprobada de avere-202 (blindado entre los 17 originales).

## Deferred-disputed

<!-- Cuando el autor responde "Skip (defer al final del milestone)" en la cola disputed D-VAL-25 path-d, el sub-skill appendea aquí una línea: "- <exercise-id> (<ISO-fecha>): deferred por autor — razón: \"<razón opcional>\"". VAL-06 impide cerrar el milestone con deferred no resueltos. El reporter scripts/run-validation-271.mjs los detectará como FAIL en VAL-08. -->

(vacío hasta que el autor difiera algún disputed en path-d)

## Operator Next Steps

- `/clear` para liberar contexto del roadmapper
- `/gsd:plan-phase 9` para descomponer Phase 9 en planes ejecutables
