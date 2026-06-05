---
gsd_state_version: 1.0
milestone: v1.6
milestone_name: "Conversión a slots: categorías restantes"
status: executing
last_updated: "2026-06-05T17:04:28.434Z"
last_activity: 2026-06-05 -- Phase 22 planning complete
progress:
  total_phases: 7
  completed_phases: 1
  total_plans: 4
  completed_plans: 1
  percent: 14
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-05 — Milestone v1.6 abierto)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 22 — avere a slots (contenido)

## Current Position

Phase: 22
Plan: Not started
Status: Ready to execute
Last activity: 2026-06-05 -- Phase 22 planning complete

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
| Fases v1.5 | 3/3 completas (Phase 18-20) — SHIPPED 2026-06-05 |
| Fases v1.6 | 1/7 (Phase 21 completada — migración 8→9; Phases 22-27 pendientes) |
| Requisitos v1.6 mapeados | 14/14 (100% — MIG-03/04→Phase 21; AVE→22; ESS→23; MOV→24; GEN→25; PROF→26; SOST→27; 0 orphans) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 completos | 15/15 (100% — ART-01..08 + PART-01..07) |
| Requisitos v1.3 completos | 19/19 (100% — SONG/PLAY/LINK/DATA + CONT) |
| Requisitos v1.4 completos | 17/17 (100% — 6 SLOT + 6 EXAM + 5 PILOT) |
| Requisitos v1.5 completos | 9/9 (100% — MIG-01/02 + ART-01..04 + PART-01..03) |
| schemaVersion actual | 9 (v1.6 Phase 21: migrate8to9 + hydrateV9 + backup v9; reset selectivo de las 6 categorías a convertir) |
| Categorías gramaticales | 9 (3 ya en formato slot+variantes: preposiciones + articoli + partitivos; v1.6 convierte las otras 6) |
| Granularidad | coarse |
| Mode | mixed — Phase 21 software (migración), Phases 22-27 contenido editorial (quórum R1-R7) |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados con explanations en 7 categorías. Motor de re-verificación + Modo Examen operativos.
- **2026-05-27 — Milestone v1.1 shipped.** 2 fases (9-10), 8 plans. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos.
- **2026-05-28 — Milestone v1.2 shipped.** 2 fases (11-12), 10 plans. 100 ejercicios nuevos (Articoli 56 + Partitivos 44) validados por quórum cross-vendor. 9 categorías totales, 372/372 validated.
- **2026-06-02 — Milestone v1.3 shipped.** 2 fases (13-14), 3 plans, 19/19 requirements, 306/306 tests. Bloque Canciones brownfield sobre el engine v1.0. schemaVersion 4→5. 1ª canción real "Equilibrio mentale — Ultimo".
- **2026-06-03 — Milestone v1.4 shipped.** 3 fases (15-17), 9 plans, 17/17 requirements, 342/342 tests. Motor slot+variantes + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum, 2 slots locativos). schemaVersion 5→6→7. Las 8 categorías no-piloto = slots de 1 variante (backward-compat).
- **2026-06-05 — Milestone v1.5 shipped.** 3 fases (18-20), 7 plans, 9/9 requirements, 358/358 tests. Articoli (56→34 slots) + Partitivi (44→19 slots) a slot+variantes (14 superficies nuevas por quórum cross-vendor R1-R7) + migración 7→8 reset selectivo. schemaVersion 7→8. 3/9 categorías en formato slot+variantes.
- **2026-06-05 — Milestone v1.6 abierto + roadmap fijado.** Conversión a slots: categorías restantes (CONV-01 cierre). Numeración CONTINÚA desde v1.5 (Phase 20) → **Phases 21-27, NO reset** (mismo criterio que v1.1/v1.2/v1.3/v1.4/v1.5). 7 fases coarse (1 migración + 6 conversiones, 1 fase por categoría): **Phase 21 (Migración 8→9, reset selectivo de las 6 categorías)** mapea MIG-03/04 — `migrate8to9`/`hydrateV9` idempotente + deep-clone, reset de progreso SOLO de las 6 a convertir (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) vía predicado de 6 prefijos, las 3 ya convertidas (preposiciones, articoli, partitivos) byte-intactas, `backup.js` round-trip v9 + import v8→v9 + rechazo >9; va PRIMERA porque la renumeración de ids de contenido no se puede hacer con progreso vivo (mismo criterio que Phase 18 v1.5 y el plan 17-01 del piloto); **Phase 22 (Avere)** AVE-01/02, **Phase 23 (Essere)** ESS-01/02, **Phase 24 (Verbi di movimento)** MOV-01/02 — verbos; **Phase 25 (Genere e numero)** GEN-01/02 — morfología; **Phase 26 (Professioni)** PROF-01/02, **Phase 27 (Sostantivi irregolari)** SOST-01/02 — léxicas (decisión regla-con-variantes O slots-de-1 en discuss/plan de cada una). Cada conversión replica el patrón de Phases 19/20: reagrupar a slots por regla con explanation a nivel de slot → autorar variantes nuevas por quórum cross-vendor R1-R7 (+ huecos→slots) → sincronizar counts derivados del JSON; validator + smoke verdes. **Cobertura: 14/14 mapped, 0 orphans, 0 duplicados, 0 gaps.** Phases 22-27 dependen de Phase 21; independientes entre sí tras la migración (cualquier orden o paralelo). **Brownfield puro contenido + migración:** toda la maquinaria slot+variantes del motor v1.4 (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 con 2 call-sites, smoke bifurcado por shape) YA EXISTE y NO se toca. Phase 27 cierra CONV-01 (9/9 categorías unificadas).

### Decisions

Las decisiones de proyecto se registran en `PROJECT.md` §Key Decisions. Decisiones que constriñen el trabajo v1.6:

- **Phase numbering CONTINÚA (21-27), NO reset a 1** — audit trail histórico lineal; MILESTONES.md y REQUIREMENTS.md traceability incrementales (mismo criterio que v1.1/v1.2/v1.3/v1.4/v1.5).
- **Brownfield puro contenido + migración — el motor v1.4 NO se toca** — la maquinaria slot+variantes está DONE: `normalizeExerciseToSlot`, `pickVariantIndex` + `variantIndices`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 (exactamente 2 call-sites de `applyImmediateFailure`, verificables por grep), smoke paramétrico bifurcado por shape (slot/legacy). v1.6 NO toca el motor, el sampler ni la cascada — es contenido + migración sobre la maquinaria existente (out-of-scope explícito en REQUIREMENTS.md).
- **Patrón EXACTO de Phases 17/19/20 replicado** — (a) migración schemaVersion con reset selectivo de las categorías convertidas (Phase 21, espejo de Phase 18 con un predicado de 6 prefijos en vez de 2); (b) reagrupar ejercicios en slots por regla + explanation a nivel de slot; (c) autorar variantes nuevas con quórum cross-vendor R1-R7 (skills `gsd-validate-exercise`/`gsd-validate-batch`, `scripts/validate-ai-pass.mjs`, mitad Claude vía `claude -p` headless D-19-08); (d) smoke paramétrico + sync de los hardcodes de count contra el nº real de slots leído del JSON (D-17-04 / D-19-09).
- **Migración PRIMERA (Phase 21), antes de autorar variantes** — no se pueden renumerar ids con progreso vivo. En v1.5 la migración fue Phase 18 (DOS categorías); aquí Phase 21 resetea SEIS categorías en UNA migración mediante un predicado de 6 prefijos.
- **Las 6 conversiones independientes entre sí tras la migración** — son fases separadas (Phases 22-27), 1 fase por categoría; tras Phase 21 pueden autorarse en cualquier orden o en paralelo. El roadmap las separa en fases verticales/shippables para cobertura limpia.
- **Léxicas (Professioni, Sostantivi irregolari) — decisión abierta por categoría** — los success criteria de Phases 26/27 reflejan "regla-con-variantes real O slots-de-1 reagrupados si no aplica"; se resuelve en discuss/plan de cada una. NO se fuerzan variantes artificiales (out-of-scope explícito). El valor es el formato unificado.
- **DESIGN RULE D-04 preservada en las conversiones con match** — Genere e numero (3 match), Professioni (3 match): match solo válido si el pareo requiere regla NO derivable por raíz; los plurales/femeninos derivables por raíz van a multi-choice.
- **APPEND-ONLY D-88 de avere se respeta en Phase 22** — relax mínimo D-178 opción A (campos core sin `explanation`/`notes`) si la reagrupación a slots lo requiere.
- **Reset de progreso de las 6 categorías al migrar (MIG-03)** — coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot; las 3 ya convertidas conservan su progreso (mismo criterio que MIG-01 v1.5 y PILOT-04 v1.4).
- **Contenido pasa el quórum estricto R1-R7** — las variantes nuevas usan el quórum cross-vendor gramatical, NO la validación ligera autor-oráculo de canciones; son ejercicios gramaticales reales.
- **Explicación a nivel de slot, NO por variante (SLOT-02 heredado de v1.4)** — variantes intercambiables comparten regla y explicación; más simple de autorar/validar.
- **Canon editorial heredado** — explanations de slot en español acentuado correcto + italianismos preservados, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137). Gloss ES "(en español: ...)" en prompts es canon R7 del autor (MEMORY.md). Explanations rule-first (lideran con el disparador, no con un sustantivo) — lección D-19-07.

### Pending Todos

(Ninguno — 0 pending.)

### Blockers/Concerns

(Ninguno — motor slot+variantes v1.4 DONE y operativo (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware, sampler por slot, cascada D-54, smoke bifurcado por shape, todos reutilizables); patrón pilot→escala validado en Phases 17/19/20 y replicable; infra de quórum cross-vendor disponible; roadmap v1.6 fijado.)

### Decisions Pending (a resolver en plan-time)

- **Predicado de 6 prefijos en migrate8to9** — invalidar categoryProgress/exerciseStats/inFlightTest si contiene ids de cualquiera de los 6 prefijos (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares). Plan-time Phase 21 (espejo de migrate7to8 con 6 prefijos en vez de 2). Verificar los slugs EXACTOS de categoryId en `content/categories.json` antes de hardcodear el predicado.
- **Granularidad del regroup de cada verbo (Avere/Essere/Verbi di movimento)** — cuántos slots y qué reglas por categoría; cuántas variantes nuevas autorar por slot; qué huecos de regla se materializan como slots nuevos. Plan-time Phases 22/23/24.
- **Granularidad del regroup de Genere e numero** — terminaciones de género + reglas de formación de plural; qué match preservar (D-04). Plan-time Phase 25.
- **Léxicas: regla-con-variantes O slots-de-1 (Professioni / Sostantivi irregolari)** — la decisión clave de Phases 26/27. Professioni: ¿femenino por terminación -e/-essa/-trice como regla-con-variantes? Sostantivi irregolari: ¿patrones de plural irregular como regla, o léxico puro slots-de-1? Plan-time / discuss de cada una.
- **Esquema de ids semántico** — reusar el patrón `{categoria}-{forma|regla}` (D-15-09 piloto, aplicado en articoli/partitivos). Plan-time Phases 22-27.

## Deferred Items

Items reconocidos y trasladados al backlog (REQUIREMENTS.md §Future / ROADMAP.md §Backlog):

| Categoría | Item | Status | Deferred At |
|-----------|------|--------|-------------|
| Autoría asistida | AUTHOR-01 — UI/proceso asistido para autorar/revisar variantes sin editar JSON a mano | Backlog post-v1.4 (en v1.4/v1.5/v1.6 a mano + quórum, patrón D-85) | v1.4 init |
| Categorización asistida | CATPROC-01/02 — proponer categorías nuevas para frases de canciones sin categoría | Backlog post-v1.3 | v1.3 init |
| Contenido | MUSIC-X1 — más canciones | Backlog post-v1.3 | v1.3 init |
| Contenido | TENSE-X1..X4 (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo) | Backlog | v1.2 init |
| Bridges | PART-X1 — bridges Partitivos ↔ género-número / sustantivos | Backlog | v1.2 init |
| UX | Modo móvil responsive; refactor confirmLabel unificado 6 call-sites; Examen multi-cat | Backlog | v1.0/v1.1 |
| Quick task (falso-positivo) | `260525-pwq` shuffle de options en multiple-choice — YA shipped en v1.0; marcado "missing" por frontmatter sin status reconocible | Acknowledged (no es trabajo pendiente) | v1.3/v1.4/v1.5 |
| Quick task (falso-positivo) | `260525-vvj` botón reiniciar examen (Phase 8) — YA shipped en v1.0; marcado "missing" por frontmatter sin status reconocible | Acknowledged (no es trabajo pendiente) | v1.3/v1.4/v1.5 |

## Session Continuity

### Last Session

- **Fecha:** 2026-06-05 — **Phase 21 (Migración `8→9`, reset selectivo de las 6 categorías / MIG-03 + MIG-04) COMPLETADA.** `migrate8to9`/`hydrateV9` + `CURRENT_SCHEMA_VERSION=9` (storage.js + backup.js espejo) clonando el patrón `migrate7to8`/`hydrateV8`, con reset de progreso SOLO de las 6 categorías a convertir (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) vía `const RESET_PREFIXES_V9` + `some(startsWith)`; las 3 ya convertidas (preposiciones, articoli, partitivos) byte-intactas (verificado por fixture de 9 categorías). `backup.js` round-trip v9 + import v8→v9 con reset + rechazo `>9`. 1 plan TDD (2 tasks RED→GREEN), **374/374 tests verdes** (358 baseline + 16 v9). Desviaciones: 3 syncs Rule 3 (asserts blankState 8→9; round-trip v7/v8 ahora resetean avere/essere — antes preservados; tests HI-01/ME-04 migrados a categoría ficticia `test-cat` que no colisiona con ningún prefijo de reset). Commits: ec7bbcf (test T1), af7cb75 (feat T1), 3a159af (test T2), 521e5f8 (feat T2). Quedan Phases 22-27 (las 6 conversiones de contenido). Stopped at: Phase 21 completada. Resume file: None. Siguiente: verificación de fase → Phase 22 (Avere).
- **Fecha:** 2026-06-05 — **Roadmap del milestone v1.6 (Conversión a slots: categorías restantes / CONV-01 cierre) creado por el roadmapper.** Numeración CONTINÚA desde Phase 20 → **Phases 21-27, NO reset** (mismo criterio que v1.1-v1.5). 7 fases coarse (1 migración + 6 conversiones, 1 fase por categoría): **Phase 21 (Migración 8→9, reset selectivo de las 6 categorías)** mapea MIG-03/04 — `migrate8to9`/`hydrateV9` idempotente + deep-clone defensivo, reset de progreso SOLO de las 6 categorías a convertir (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) vía predicado de 6 prefijos, las 3 ya convertidas (preposiciones, articoli, partitivos) byte-intactas, `backup.js` round-trip v9 + import v8→v9 + rechazo >9; va PRIMERA porque la renumeración de ids no se puede hacer con progreso vivo; **Phase 22 (Avere, 23 ejer.)** AVE-01/02, **Phase 23 (Essere, 39 ejer.)** ESS-01/02, **Phase 24 (Verbi di movimento, 37 ejer.)** MOV-01/02 — verbos; **Phase 25 (Genere e numero, 40 ejer.)** GEN-01/02 — morfología; **Phase 26 (Professioni, 51 ejer., léxica)** PROF-01/02, **Phase 27 (Sostantivi irregolari, 31 ejer., léxica)** SOST-01/02 — léxicas con decisión abierta regla-con-variantes O slots-de-1 (a resolver en discuss/plan). Cada conversión replica el patrón de Phases 19/20: reagrupar a slots por regla con explanation a nivel de slot → autorar variantes nuevas por quórum cross-vendor R1-R7 (+ huecos→slots) → sincronizar counts derivados del JSON; validator + smoke verdes. **Cobertura: 14/14 mapped, 0 orphans, 0 duplicados, 0 gaps** (cada success criterion respaldado por ≥1 requisito). Phases 22-27 dependen de Phase 21; independientes entre sí tras la migración. **Brownfield puro contenido + migración: el motor slot+variantes v1.4 NO se reconstruye ni se toca.** Archivos escritos: `.planning/ROADMAP.md` (v1.0-v1.5 colapsados a `<details>` SHIPPED + sección `### 🚧 v1.6 — ACTIVE` con Phases 21-27 en summary checklist + Phase Details con 3-4 criteria c/u (UI hint:no en las 7) + Progress table +7 filas + footer milestone v1.6 + sección `## Backlog` preservada con CONV-01/AUTHOR-01/CATPROC/MUSIC/TENSE/PART-X1), `.planning/REQUIREMENTS.md` (Traceability 14 filas MIG→21 / AVE→22 / ESS→23 / MOV→24 / GEN→25 / PROF→26 / SOST→27 + Coverage 14/14 + mapping rationale), `.planning/STATE.md` (este — re-inicializado para v1.6 planning). v1.0-v1.5 preservados archivados. Stopped at: roadmap creado. Resume file: None. Siguiente: `/gsd:plan-phase 21`.
- **Fecha:** 2026-06-05 — Milestone v1.5 (Conversión a slots: Bloque Artículos / CONV-01) shipped. 3 fases (18-20), 7 plans, 9/9 requirements, 358/358 tests. Articoli (56→34) + Partitivi (44→19) a slot+variantes + migración 7→8. schemaVersion 7→8. 3/9 categorías en formato slot+variantes.

### Files Generated (este ciclo, 2026-06-05 — v1.6 roadmap)

- `.planning/ROADMAP.md` (modified — v1.5 colapsado a `<details>` SHIPPED 2026-06-05; sección `### 🚧 v1.6 — ACTIVE` con Phases 21-27 en summary checklist; `## Phase Details` con las 7 fases completas (goal/depends-on/requirements/success criteria; UI hint:no en las 7); `## Progress` table +7 filas v1.6; `## Backlog` preservada (CONV-01 actualizado a "EN CURSO en v1.6" + AUTHOR-01 + CATPROC + MUSIC-X1 + TENSE/móvil/bridges); footer milestone v1.6)
- `.planning/REQUIREMENTS.md` (modified — Traceability 14 filas MIG→21 / AVE→22 / ESS→23 / MOV→24 / GEN→25 / PROF→26 / SOST→27; Coverage 14/14 mapped, 0 orphans/duplicados/gaps; mapping rationale; footer)
- `.planning/STATE.md` (modified — re-inicializado para v1.6 planning; frontmatter milestone v1.6 + total_phases 7; decisiones v1.6; decisiones pending plan-time)

**Heredado (motor slot+variantes + infra reutilizable en v1.6, NO se reconstruye ni se toca):**

- `src/screens/app.js` — getter `sessionCurrentExercise` slot-aware (`.payload` sintético), `sessionVariantIndices` paralelo, cascada D-54 `applyImmediateFailure`/`applyResultToSession` (2 call-sites EXACTOS — Pitfall #2), 3 launch sites + inFlightTest + sessionResults + summary slot-aware.
- `src/domain/*` — `pickVariantIndex` + `variantIndices` en `buildSession`/`buildFullTest`; sampler por slot.
- `src/data/schema-validator.js` — `validateContent` acepta `payload` XOR `variants[]`; `normalizeExerciseToSlot` (legacy→slot-de-1); `slotById`.
- Patrón migración `migrateNtoM` (schemaVersion 8, último `migrate7to8` con reset selectivo de DOS categorías) → `migrate8to9` + `hydrateV9` + `backup.js` v9 (reset de SEIS categorías, predicado de 6 prefijos).
- Smoke paramétrico bifurcado por shape (`Array.isArray(ex.variants)`) — listo para CONV-01 sin hardcodear slug; 3 hardcodes de count a sincronizar por conversión (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`) + `TOTAL_EXPECTED`.
- Infra de quórum cross-vendor: skills `gsd-validate-exercise` / `gsd-validate-batch`, `scripts/validate-ai-pass.mjs` (multi-provider auto-fallback 429), reporter — para las variantes nuevas (AVE/ESS/MOV/GEN/PROF/SOST -02).
- Blindaje APPEND-ONLY avere: `scripts/snapshot-avere-prefix.mjs` + `scripts/assert-avere-prefix-unchanged.mjs` (relax D-178 opción A en Phase 22).

## Operator Next Steps

- `/gsd:plan-phase 21` (Migración 8→9, reset selectivo de las 6 categorías) — primera fase del milestone v1.6.
