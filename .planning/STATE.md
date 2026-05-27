---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Más contenido A1 (Articoli + Partitivos)
status: executing
last_updated: "2026-05-27T21:15:11.370Z"
last_activity: 2026-05-27
progress:
  total_phases: 4
  completed_phases: 0
  total_plans: 5
  completed_plans: 1
  percent: 0
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-27)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 11 — articoli

**Milestone v1.2 Goal:** Añadir 2 categorías nuevas de gramática A1 (Articoli y Partitivos), diseñadas desde cero sin PDF de referencia. Cada categoría sigue el mismo flujo dentro de su propia fase: (a) temario exhaustivo ANTES de redactar ejercicios → (b) ejercicios que cubren cada celda del temario → (c) explanations pedagógicas curadas → (d) validación por quórum ≥2 IAs distintas reutilizando la infraestructura editorial de v1.1 (skill `gsd-validate-batch` + reporter `scripts/run-validation-271.mjs` + reglas R1-R7). NO se modifica el engine: motor de re-verificación, sampler, cascada D-54, schema validator y 3 tipos de ejercicio están DONE.

## Current Position

Phase: 11 (articoli) — EXECUTING
Plan: 2 of 5
Status: Ready to execute
Last activity: 2026-05-27 -- Plan 11-01 completado (temario Articoli aprobado por el autor)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incl. decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 2/2 completas (Phase 9 infra + Phase 10 ejecución) — SHIPPED 2026-05-27 |
| Fases v1.2 | 0/2 (Phase 11 Articoli + Phase 12 Partitivos) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 mapeados | 15/15 (100% — ART-01..08 → Phase 11; PART-01..07 → Phase 12; 0 orphans) |
| Requisitos v1.2 completos | 0/15 |
| Ejercicios totales en la app | 272 distribuidos en 7 categorías (todos validated por ≥2 IAs) |
| Categorías | 7 (Articoli será la 8ª, Partitivos la 9ª) |
| Granularidad | coarse |
| Mode | standard (NO MVP — esto es contenido editorial, no slice vertical de software) |

**By Phase (v1.2):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 11. Articoli | 0 | — | — |
| 12. Partitivos | 0 | — | — |
| Phase 11 P01 | 5min | 2 tasks | 1 files |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados con explanations en 7 categorías. Motor de re-verificación + Modo Examen operativos.
- **2026-05-27 — Milestone v1.1 shipped.** 2 fases (9-10), 8 plans. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos, 0 deferred. Gate verde: reporter `run-validation-271.mjs` exit 0 + smoke `VAL_07_STRICT=1` 261/261 PASS. Infra editorial completa: skills `gsd-validate-exercise` + `gsd-validate-batch`, `09-VALIDATION-PROMPT.md`, reporter, array `CATEGORIES_WITH_EXPLANATIONS`.
- **2026-05-27 — Milestone v1.2 abierto + roadmap fijado.** 2 categorías nuevas de contenido A1. Numeración continúa desde v1.1 (Phase 11 + Phase 12, NO reset). El autor decidió en init la forma de 2 fases (Articoli primero, Partitivos en fase separada) — honrada sin sobre-fragmentar. Cada fase recorre temario→ejercicios→explanations→validación. 15 requirements (8 ART + 7 PART), 15/15 mapped, 0 orphans, 0 gaps.

### Decisions

Las decisiones de proyecto se registran en `PROJECT.md` §Key Decisions. Decisiones que constriñen el trabajo v1.2:

- **Phase numbering continúa (11, 12), NO reset a 1** — audit trail histórico lineal; MILESTONES.md y REQUIREMENTS.md traceability incrementales (mismo criterio que v1.1).
- **Articoli = 1 categoría (det + indet juntos), NO 2 separadas** — comparten regla fonética; el espejo `il/lo↔un/uno` se rompería si se separan (Out of Scope REQUIREMENTS.md).
- **Temario ANTES de ejercicios es hard requirement** (ART-02 / PART-02) — el orden temario→ejercicios debe ser verificable en git; surface en success criteria de ambas fases.
- **`match` solo válido si el pareo NO es derivable por raíz compartida** (DESIGN RULE v1.0). Para Articoli: `match` artículo↔sustantivo es buen fit (el artículo depende de la fonética/género inicial del sustantivo, no de la raíz). Singular↔plural / masc↔fem con raíz compartida → multiple-choice con distractoras plausibles.
- **Bridges multi-cat patrón avere-300../essere-300..** — ~6 cruces por categoría nueva que testean 2 categorías a la vez; fallar uno cascada D-54 a ambas. v1.2: bridges solo para Articoli (ART-06). Partitivos sin bridges para acotar (PART-X1 diferido).
- **Distinción partitivo vs preposizione articolata** (PART-05) — `del/della` comparten forma con la preposizione articolata, pero la función prepositiva YA vive en Preposiciones; Partitivos cubre SOLO "algo de".
- **Canon editorial heredado de v1.1/v1.0** — explanations en español acentuado (á/é/í/ó/ú + ñ RAE) + italianismos citados con ortografía italiana, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137).
- **Validación reutiliza infra v1.1 sin tocarla** — skill `gsd-validate-batch` + reporter + R1-R7. Añadir una categoría al reporter y al smoke test es bump de constantes: `TOTAL_EXPECTED` (272 → +N) + nueva entry en el array `CATEGORIES` del reporter + 1 línea en `CATEGORIES_WITH_EXPLANATIONS` (D-144) con la cuenta exacta de la categoría.
- [Phase ?]: Temario Articoli aprobado por el autor sin cambios (checkpoint 11-01); casos A2 (lo pneumatico/lo yogurt) fuera por D-03

### Pending Todos

- [ ] `/gsd:plan-phase 11` — descomponer Phase 11 (Articoli) en planes ejecutables (temario → ejercicios → explanations → bridges → validación)
- [ ] `/gsd:plan-phase 12` — descomponer Phase 12 (Partitivos) tras cerrar Phase 11
- [ ] `/gsd:complete-milestone v1.2` — tras verifier PASS de Phase 12

### Blockers/Concerns

(Ninguno — v1.1 cerrado y archivado, infra editorial operativa, roadmap v1.2 fijado, R1-R7 en memoria persistente, canon ortográfico establecido)

### Decisions Pending (a resolver en plan-time)

- **Cuántos y cuáles ejercicios por categoría** — el temario exhaustivo (ART-02 / PART-02) determinará el número de celdas y por tanto el conteo de ejercicios; se fija al diseñar el temario, no ahora.
- **Pool de IAs del quórum para v1.2** — v1.1 usó Opus 4.7 + Sonnet 4.6. Confirmar mismo pool o variar en plan-time (el invariante es ≥2 `by` distintos).
- **Cómo materializar el documento de temario** — fichero markdown en la carpeta de la fase (p.ej. `11-TEMARIO-ARTICOLI.md`) vs sección dentro del PLAN. Decisión en plan-time; lo importante es que preceda a los ejercicios en git.

## Deferred Items

Items reconocidos y trasladados al backlog (REQUIREMENTS.md §Future):

| Categoría | Item | Status | Deferred At |
|-----------|------|--------|-------------|
| Contenido | TENSE-X1..X4 (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo) conforme la profesora entrega material | Backlog v1.3+ | v1.2 init |
| Bridges | PART-X1 — bridges Partitivos ↔ género-número / sustantivos | Backlog v1.3+ (acota v1.2) | v1.2 init |
| UX | Modo móvil responsive si emerge dolor; refactor confirmLabel unificado 6 call-sites; Examen multi-cat | Backlog | v1.0/v1.1 |

## Session Continuity

### Last Session

- **Fecha:** 2026-05-27 — Plan 11-01 completado: temario exhaustivo de Articoli redactado (commit `74cd086`) y APROBADO por el autor en el checkpoint human-verify sin cambios. ART-02 satisfecho; orden temario-antes-de-ejercicios verificable en git (no existe `content/exercises/articoli.json`). Stopped at: Completed 11-01-PLAN.md. Resume file: None. Siguiente: Plan 11-02 (ejercicios base multiple-choice).
- **Trabajo previo (v1.2 roadmap, 2026-05-27):** Roadmap del milestone v1.2 creado por el roadmapper.
- **Trabajo actual (roadmap):** Creados/actualizados `.planning/ROADMAP.md` (Phase 11 Articoli + Phase 12 Partitivos añadidas a la sección v1.2 ACTIVE con summary checklist + Phase Details con goal/depends-on/requirements/5 success criteria cada una + UI hint:yes en ambas + Progress table extendida), `.planning/REQUIREMENTS.md` (traceability confirmada 15/15 mapped, 0 orphans, 0 duplicados), `.planning/STATE.md` (este — re-inicializado para v1.2 planning). v1.0 y v1.1 preservados archivados en la sección Milestones y en `.planning/milestones/`.
- **Cobertura:** 15/15 requirements mapped (ART-01..08 → Phase 11; PART-01..07 → Phase 12). 0 orphans. 0 gaps en success criteria (cada criterio observable tiene ≥1 requisito que lo soporta).
- **Trabajo previo (v1.1 SHIPPED 2026-05-27):** 2 fases, 8 plans, 272/272 ejercicios validados por quórum, 55 disputed resueltos. Archivado en `.planning/milestones/v1.1-ROADMAP.md`.
- **Trabajo previo (v1.0 SHIPPED 2026-05-25):** 10 fases, 26 plans, motor + 7 categorías + Modo Examen. Archivado en `.planning/milestones/v1.0-ROADMAP.md`.
- **Siguiente paso:** `/gsd:plan-phase 11` para descomponer Articoli en planes ejecutables.

### Files Generated (este ciclo, 2026-05-27)

- `.planning/ROADMAP.md` (modified — sección `### v1.2 — ACTIVE` con Phase 11 + Phase 12 en summary checklist; `## Phase Details` con las 2 fases completas; `## Progress` table +2 filas v1.2; footer milestone v1.2 planning)
- `.planning/REQUIREMENTS.md` (modified — Coverage note de "provisional" a "CONFIRMADO por el roadmapper"; +líneas Orphans:0 / Duplicados:0; footer actualizado)
- `.planning/STATE.md` (modified — re-inicializado para v1.2 planning; frontmatter milestone v1.2 + total_phases 2; secciones actualizadas a la nueva fase)

**Heredado (infra editorial reutilizable en v1.2):**

- `.claude/skills/gsd-validate-batch/SKILL.md` + `.claude/skills/gsd-validate-exercise/SKILL.md`
- `scripts/run-validation-271.mjs` (reporter — bump `TOTAL_EXPECTED` + array `CATEGORIES` al añadir categorías)
- `tests/exercise-types.test.js` (array `CATEGORIES_WITH_EXPLANATIONS` — 1 línea por categoría nueva, D-144)
- `.planning/phases/09-.../09-VALIDATION-PROMPT.md` (R1-R7 → C1-C5 operacionalizados)
- `~/.claude/projects/.../memory/exercise_authoring_rules.md` (R1-R7) + `feedback_disputed_resolution.md`

## Operator Next Steps

- `/clear` para liberar contexto del roadmapper
- `/gsd:plan-phase 11` para descomponer Phase 11 (Articoli) en planes ejecutables

---
*State initialized: 2026-05-23 (v1.0)*
*State re-initialized: 2026-05-27 — Milestone v1.2 planning. v1.0 + v1.1 archivados; Phase 11 (Articoli) + Phase 12 (Partitivos) planificadas con 15/15 requirements mapped, 0 orphans. Ready para `/gsd:plan-phase 11`.*
