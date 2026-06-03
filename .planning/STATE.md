---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: "Conversión a slots: Bloque Artículos"
status: planning
last_updated: "2026-06-04T00:00:00.000Z"
last_activity: 2026-06-04
progress:
  total_phases: 3
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-04 — Milestone v1.5 iniciado)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Milestone v1.5 — Conversión a slots: Bloque Artículos (CONV-01). Roadmap fijado (Phases 18-20). Convertir Articoli + Partitivi al modelo slot+variantes reutilizando TODA la maquinaria v1.4 (motor, sampler, cascada D-54, smoke bifurcado por shape — NO se tocan). Siguiente: `/gsd:plan-phase 18`.

## Current Position

Phase: 18 (Migración 7→8) — Not started (roadmap fijado, sin plans aún)
Plan: —
Status: Roadmap creado, pendiente de `/gsd:plan-phase 18`
Last activity: 2026-06-04 — Roadmap v1.5 creado por el roadmapper

## Quick Tasks Completed

| Fecha | Quick ID | Tarea | Resultado |
|-------|----------|-------|-----------|
| 2026-05-29 | 260529-c35 | Añadir y validar `preposiciones-052` ("Passo da te alle otto") — `da` simple = "en casa de", excepción idiomática A1 | `validated` (quórum Opus 4.8 + Sonnet 4.6, ambas `correcta`); 275 tests PASS; reporter gate PASS (373/373) |

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incl. decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 2/2 completas (Phase 9-10) — SHIPPED 2026-05-27 |
| Fases v1.2 | 2/2 completas (Phase 11-12) — SHIPPED 2026-05-28 |
| Fases v1.3 | 2/2 completas (Phase 13-14) — SHIPPED 2026-06-02 |
| Fases v1.4 | 3/3 completas (Phase 15-17) — SHIPPED 2026-06-03 |
| Fases v1.5 | 0/3 (Phase 18 migración 7→8 ⏳; Phase 19 Articoli ⏳; Phase 20 Partitivi ⏳) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 completos | 15/15 (100% — ART-01..08 + PART-01..07) |
| Requisitos v1.3 completos | 19/19 (100% — SONG/PLAY/LINK/DATA + CONT) |
| Requisitos v1.4 completos | 17/17 (100% — 6 SLOT + 6 EXAM + 5 PILOT) |
| Requisitos v1.5 mapeados | 9/9 (100% — MIG→Phase 18 (2); ART→Phase 19 (4); PART→Phase 20 (3); 0 orphans) |
| Requisitos v1.5 completos | 0/9 |
| schemaVersion actual | 7 (v1.5 migrará a 8: migrate7to8 + hydrateV8 + backup v8, reset selectivo de articoli+partitivos en Phase 18) |
| Ejercicios totales en la app | 370 validated (9 categorías; Preposiciones = 49 slots tras v1.4; Articoli + Partitivos = slots de 1 variante hasta convertirse en v1.5) + bloque Canciones standalone |
| Categorías gramaticales | 9 (en v1.5 se convierten Articoli + Partitivi a slots; las otras 7 = slots de 1 variante) |
| Granularidad | coarse |
| Mode | mixed — Phase 18 software (migración), Phases 19-20 contenido editorial (quórum R1-R7) |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados con explanations en 7 categorías. Motor de re-verificación + Modo Examen operativos.
- **2026-05-27 — Milestone v1.1 shipped.** 2 fases (9-10), 8 plans. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos.
- **2026-05-28 — Milestone v1.2 shipped.** 2 fases (11-12), 10 plans. 100 ejercicios nuevos (Articoli 56 + Partitivos 44) validados por quórum cross-vendor. 9 categorías totales, 372/372 validated.
- **2026-06-02 — Milestone v1.3 shipped.** 2 fases (13-14), 3 plans, 19/19 requirements, 306/306 tests. Bloque Canciones brownfield sobre el engine v1.0. schemaVersion 4→5. 1ª canción real "Equilibrio mentale — Ultimo".
- **2026-06-03 — Milestone v1.4 shipped.** 3 fases (15-17), 9 plans, 17/17 requirements, 342/342 tests. Motor slot+variantes + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum, 2 slots locativos). schemaVersion 5→6→7. Las 8 categorías no-piloto = slots de 1 variante (backward-compat).
- **2026-06-04 — Milestone v1.5 abierto + roadmap fijado.** Conversión a slots: Bloque Artículos (CONV-01). Numeración CONTINÚA desde v1.4 (Phase 17) → **Phases 18-20, NO reset** (mismo criterio que v1.1/v1.2/v1.3/v1.4). 3 fases coarse, vertical/shippable con dependencia explícita: **Phase 18 (Migración 7→8, reset selectivo articoli+partitivos)** mapea 2 MIG — `migrate7to8`/`hydrateV8` idempotente + deep-clone, reset de progreso SOLO de articoli + partitivos (categoryProgress + exerciseStats por prefijo + inFlightTest, racha 0), las otras 7 byte-intactas, `backup.js` round-trip v8 + import v7→v8; va PRIMERA porque la renumeración de ids de contenido no se puede hacer con progreso vivo (mismo criterio que el plan 17-01 del piloto); **Phase 19 (Articoli a slots)** mapea 4 ART — reagrupar 56 ejercicios por regla (determinativi por disparador + indeterminativi como slots propios ART-03), variantes nuevas por quórum + huecos→slots, validator + smoke + counts + explanations a nivel de slot; **Phase 20 (Partitivi a slots)** mapea 3 PART — reagrupar 44 ejercicios por regla (del-formas + contable/incontable + alternativas + omisión + partitivo-vs-prep), variantes nuevas por quórum + huecos→slots, validator + smoke + counts + explanations a nivel de slot. **Cobertura: 9/9 mapped, 0 orphans, 0 duplicados, 0 gaps.** Phases 19 y 20 dependen de Phase 18; independientes entre sí tras la migración (pueden autorarse en cualquier orden o en paralelo). **Brownfield puro contenido + migración:** toda la maquinaria slot+variantes del motor v1.4 (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 con 2 call-sites, smoke bifurcado por shape) YA EXISTE y NO se toca.

### Decisions

Las decisiones de proyecto se registran en `PROJECT.md` §Key Decisions. Decisiones que constriñen el trabajo v1.5:

- **Phase numbering CONTINÚA (18, 19, 20), NO reset a 1** — audit trail histórico lineal; MILESTONES.md y REQUIREMENTS.md traceability incrementales (mismo criterio que v1.1/v1.2/v1.3/v1.4).
- **Brownfield puro contenido + migración — el motor v1.4 NO se toca** — la maquinaria slot+variantes está DONE: `normalizeExerciseToSlot`, `pickVariantIndex` + `variantIndices`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 (exactamente 2 call-sites de `applyImmediateFailure`, verificables por grep), smoke paramétrico bifurcado por shape (slot/legacy). v1.5 NO toca el motor, el sampler ni la cascada — es contenido + migración sobre la maquinaria existente (out-of-scope explícito en REQUIREMENTS.md).
- **Patrón EXACTO del piloto Preposiciones (Phase 17) replicado** — (a) migración schemaVersion con reset selectivo de las categorías convertidas (17-01 → Phase 18); (b) reagrupar ejercicios en slots por regla + explanation a nivel de slot (17-02); (c) autorar variantes nuevas con quórum cross-vendor R1-R7 (skills `gsd-validate-exercise`/`gsd-validate-batch`, `scripts/validate-ai-pass.mjs`) (17-03); (d) smoke paramétrico + sync de los hardcodes de count contra el nº real de slots (17-04 / D-17-04).
- **Migración PRIMERA (Phase 18), antes de autorar variantes** — no se pueden renumerar ids con progreso vivo. En el piloto la migración fue el primer plan (17-01). La diferencia clave: la migración `7→8` resetea DOS categorías (articoli + partitivos) en UNA sola migración (vs 1 sola en v1.4).
- **Articoli y Partitivi independientes entre sí tras la migración** — pueden ser fases separadas (Phase 19 / Phase 20) o plans paralelos; el roadmap las separa en 2 fases verticales/shippables para cobertura limpia.
- **Indeterminativi como slots propios dentro de Articoli (ART-03), NO categoría nueva** — recoge el espíritu del todo cerrado el 2026-06-03. Reglas de selección uno/un' como slots por disparador fonético.
- **Reset de progreso de articoli+partitivos al migrar (MIG-01)** — coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot; el resto de categorías conserva su progreso (mismo criterio que PILOT-04 en v1.4).
- **Contenido pasa el quórum estricto R1-R7** — las variantes nuevas (ART-02 / PART-02) usan el quórum cross-vendor gramatical, NO la validación ligera autor-oráculo de canciones; son ejercicios gramaticales reales.
- **Explicación a nivel de slot, NO por variante (SLOT-02 heredado de v1.4)** — variantes intercambiables comparten regla y explicación; más simple de autorar/validar.
- **Canon editorial heredado** — explanations de slot en español acentuado correcto + italianismos preservados, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137). Gloss ES "(en español: ...)" en prompts es canon R7 del autor (MEMORY.md).

### Pending Todos

(Ninguno — 0 pending.)

### Blockers/Concerns

(Ninguno — motor slot+variantes v1.4 DONE y operativo (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware, sampler por slot, cascada D-54, smoke bifurcado por shape, todos reutilizables); patrón del piloto Preposiciones validado y replicable; infra de quórum cross-vendor disponible; roadmap v1.5 fijado.)

### Decisions Pending (a resolver en plan-time)

- **Granularidad del regroup de Articoli** — cuántos slots y qué reglas (los 56 ejercicios actuales → ¿cuántos slots determinativi por disparador fonético + cuántos slots indeterminativi?); cuántas variantes nuevas autorar por slot; qué huecos de regla se materializan como slots nuevos. Plan-time Phase 19.
- **Granularidad del regroup de Partitivi** — cuántos slots y qué reglas (los 44 ejercicios → del-formas por disparador + eje contable/incontable + alternativas + omisión + partitivo-vs-prep); cuántas variantes nuevas por slot. Plan-time Phase 20.
- **Esquema de ids semántico** — reusar el patrón `preposiciones-{forma|regla}` del piloto (D-15-09) para `articoli-{...}` y `partitivos-{...}`. Plan-time Phases 19/20.
- **Reset de inFlightTest en migrate7to8** — invalidar si contiene ids de articoli O partitivos (vs solo una). Plan-time Phase 18 (espejo de migrate6to7 con un predicado de dos prefijos).

## Deferred Items

Items reconocidos y trasladados al backlog (REQUIREMENTS.md §Future / ROADMAP.md §Backlog):

| Categoría | Item | Status | Deferred At |
|-----------|------|--------|-------------|
| Conversión categorías | CONV-01 cont. — convertir las 6 categorías restantes (verbos + morfología) a slots+variantes, una por milestone incremental | Backlog post-v1.5 (en v1.4/v1.5 funcionan como slots de 1 variante, SLOT-06) | v1.5 init |
| Autoría asistida | AUTHOR-01 — UI/proceso asistido para autorar/revisar variantes sin editar JSON a mano | Backlog post-v1.4 (en v1.4/v1.5 a mano + quórum, patrón D-85) | v1.4 init |
| Categorización asistida | CATPROC-01/02 — proponer categorías nuevas para frases de canciones sin categoría | Backlog post-v1.3 | v1.3 init |
| Contenido | MUSIC-X1 — más canciones | Backlog post-v1.3 | v1.3 init |
| Contenido | TENSE-X1..X4 (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo) | Backlog | v1.2 init |
| Bridges | PART-X1 — bridges Partitivos ↔ género-número / sustantivos | Backlog | v1.2 init |
| UX | Modo móvil responsive; refactor confirmLabel unificado 6 call-sites; Examen multi-cat | Backlog | v1.0/v1.1 |

## Session Continuity

### Last Session

- **Fecha:** 2026-06-04 — **Roadmap del milestone v1.5 (Conversión a slots: Bloque Artículos / CONV-01) creado por el roadmapper.** Numeración CONTINÚA desde Phase 17 → **Phases 18-20, NO reset** (mismo criterio que v1.1/v1.2/v1.3/v1.4). 3 fases coarse, vertical/shippable con dependencia explícita: **Phase 18 (Migración 7→8, reset selectivo articoli+partitivos)** mapea 2 MIG — `migrate7to8`/`hydrateV8` idempotente + deep-clone defensivo, reset de progreso SOLO de articoli + partitivos (categoryProgress + exerciseStats por prefijo + inFlightTest, racha 0), las otras 7 byte-intactas, `backup.js` round-trip v8 + import v7→v8, rechazo de >8; va PRIMERA porque la renumeración de ids de contenido no se puede hacer con progreso vivo; **Phase 19 (Articoli a slots)** mapea 4 ART — reagrupar 56 ejercicios por regla (determinativi por disparador fonético + indeterminativi como slots propios ART-03), variantes nuevas por quórum R1-R7 + huecos→slots, validator + smoke paramétrico + sync de counts + explanations a nivel de slot; **Phase 20 (Partitivi a slots)** mapea 3 PART — reagrupar 44 ejercicios por regla (del-formas + contable/incontable + alternativas + omisión + partitivo-vs-prep), variantes nuevas por quórum + huecos→slots, validator + smoke + counts + explanations a nivel de slot. **Cobertura: 9/9 mapped, 0 orphans, 0 duplicados, 0 gaps** (cada success criterion respaldado por ≥1 requisito). Phases 19/20 dependen de Phase 18; independientes entre sí tras la migración. **Brownfield puro contenido + migración: el motor slot+variantes v1.4 NO se reconstruye ni se toca.** Archivos escritos: `.planning/ROADMAP.md` (v1.4 colapsado a `<details>` SHIPPED + sección `### 🚧 v1.5 — ACTIVE` con Phases 18-20 en summary checklist + Phase Details con 3-4 criteria c/u + Progress table +3 filas + footer milestone v1.5), `.planning/REQUIREMENTS.md` (Traceability 9 filas MIG→Phase 18 / ART→Phase 19 / PART→Phase 20 + Coverage 9/9 + mapping rationale), `.planning/STATE.md` (este — re-inicializado para v1.5 planning). v1.0-v1.4 preservados archivados. Stopped at: roadmap creado. Resume file: None. Siguiente: `/gsd:plan-phase 18`.
- **Fecha:** 2026-06-03 — Milestone v1.4 (Variantes de ejercicio / slots por regla) shipped + archivado. 3 fases (15-17), 9 plans, 17/17 requirements, 342/342 tests.

### Files Generated (este ciclo, 2026-06-04 — v1.5 roadmap)

- `.planning/ROADMAP.md` (modified — v1.4 colapsado a `<details>` SHIPPED 2026-06-03; sección `### 🚧 v1.5 — ACTIVE` con Phases 18-20 en summary checklist; `## Phase Details` con las 3 fases completas (goal/depends-on/requirements/success criteria; UI hint:no en las 3); `## Progress` table +3 filas v1.5; backlog CONV-01 cont. + AUTHOR-01; footer milestone v1.5)
- `.planning/REQUIREMENTS.md` (modified — Traceability 9 filas MIG→Phase 18 / ART→Phase 19 / PART→Phase 20; Coverage 9/9 mapped, 0 orphans/duplicados/gaps; mapping rationale; footer)
- `.planning/STATE.md` (modified — re-inicializado para v1.5 planning; frontmatter milestone v1.5 + total_phases 3; decisiones v1.5; decisiones pending plan-time)

**Heredado (motor slot+variantes + infra reutilizable en v1.5, NO se reconstruye ni se toca):**

- `src/screens/app.js` — getter `sessionCurrentExercise` slot-aware (`.payload` sintético), `sessionVariantIndices` paralelo, cascada D-54 `applyImmediateFailure`/`applyResultToSession` (2 call-sites EXACTOS — Pitfall #2), 3 launch sites + inFlightTest + sessionResults + summary slot-aware.
- `src/domain/*` — `pickVariantIndex` + `variantIndices` en `buildSession`/`buildFullTest`; sampler por slot.
- `src/data/schema-validator.js` — `validateContent` acepta `payload` XOR `variants[]`; `normalizeExerciseToSlot` (legacy→slot-de-1); `slotById`.
- Patrón migración `migrateNtoM` (schemaVersion 7, último `migrate6to7` con reset selectivo de Preposiciones) → `migrate7to8` + `hydrateV8` + `backup.js` v8 (reset de DOS categorías).
- Smoke paramétrico bifurcado por shape (`Array.isArray(ex.variants)`) — listo para CONV-01 sin hardcodear slug; 3 hardcodes de count a sincronizar (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`).
- Infra de quórum cross-vendor: skills `gsd-validate-exercise` / `gsd-validate-batch`, `scripts/validate-ai-pass.mjs` (multi-provider auto-fallback 429), reporter — para ART-02 / PART-02.

## Operator Next Steps

- Plan the first phase with `/gsd:plan-phase 18`
