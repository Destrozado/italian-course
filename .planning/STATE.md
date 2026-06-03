---
gsd_state_version: 1.0
milestone: v1.4
milestone_name: Variantes de ejercicio (slots por regla)
status: executing
last_updated: "2026-06-03T13:59:44.000Z"
last_activity: 2026-06-03 -- Plan 17-01 ejecutado (migración 6→7 + reset Preposiciones)
progress:
  total_phases: 5
  completed_phases: 2
  total_plans: 9
  completed_plans: 5
  percent: 40
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-02)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 17 — Piloto Preposiciones (contenido)

**Milestone v1.4 Goal:** Matar la memorización por palabras introduciendo *slots* (1 por regla) con variantes intercambiables; un examen recorre N slots eligiendo 1 variante al azar en cada uno, manteniendo intacta la re-verificación D-54. MOTOR + 1 PILOTO: construir el modelo de datos y el motor de examen por slots, luego convertir SOLO Preposiciones como piloto real. Las otras 8 categorías siguen funcionando como slots de 1 variante (backward-compat) — su conversión es out-of-scope (CONV-01 futuro). Brownfield: REUTILIZA la cascada D-54, el sampler, el schema-validator, el patrón Test-completo y `applyResultToSession` — NO reconstruye el motor.

## Current Position

Phase: 17 (Piloto Preposiciones (contenido)) — EXECUTING
Plan: 2 of 4
Status: Executing Phase 17 (Plan 17-01 completo)
Last activity: 2026-06-03 -- Plan 17-01 ejecutado (migración 6→7 + reset Preposiciones)

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
| Fases v1.4 | 2/3 (Phase 15 modelo slot+variantes ✓; Phase 16 motor de examen por slots ✓; Phase 17 piloto Preposiciones pendiente) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 completos | 15/15 (100% — ART-01..08 + PART-01..07) |
| Requisitos v1.3 completos | 19/19 (100% — SONG/PLAY/LINK/DATA + CONT) |
| Requisitos v1.4 mapeados | 17/17 (100% — SLOT→Phase 15 (6); EXAM→Phase 16 (6); PILOT→Phase 17 (5); 0 orphans) |
| Requisitos v1.4 completos | 13/17 (SLOT 6/6 Phase 15 + EXAM 6/6 Phase 16; PILOT 1/5 — PILOT-04 reset migración Plan 17-01) |
| schemaVersion actual | 7 (Plan 17-01: migrate6to7 + hydrateV7 + backup v7, reset selectivo de Preposiciones D-17-08) |
| Ejercicios totales en la app | 373 validated (9 categorías gramaticales) + bloque Canciones standalone |
| Categorías gramaticales | 9 (en v1.4: Preposiciones se convierte a slots-piloto; las otras 8 = slots de 1 variante) |
| Granularidad | coarse |
| Mode | mixed — Phase 15/16 software (motor + migración), Phase 17 contenido editorial (quórum R1-R7) |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados con explanations en 7 categorías. Motor de re-verificación + Modo Examen operativos.
- **2026-05-27 — Milestone v1.1 shipped.** 2 fases (9-10), 8 plans. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos.
- **2026-05-28 — Milestone v1.2 shipped.** 2 fases (11-12), 10 plans. 100 ejercicios nuevos (Articoli 56 + Partitivos 44) validados por quórum cross-vendor. 9 categorías totales, 372/372 validated.
- **2026-06-02 — Milestone v1.3 shipped.** 2 fases (13-14), 3 plans, 19/19 requirements, 306/306 tests. Bloque Canciones brownfield sobre el engine v1.0. schemaVersion 4→5. 1ª canción real "Equilibrio mentale — Ultimo".
- **2026-06-02 — Milestone v1.4 abierto + roadmap fijado.** Variantes de ejercicio (slots por regla). Numeración CONTINÚA desde v1.3 (Phase 14) → **Phases 15-17, NO reset** (mismo criterio que v1.1/v1.2/v1.3). 3 fases coarse, vertical/shippable: **Phase 15 (Modelo de datos slot+variantes + schema + migración)** mapea 6 SLOT (modelo, explicación a nivel de slot, validator, migración `5→6`, backward-compat de las 8 categorías); **Phase 16 (Motor de examen por slots)** mapea 6 EXAM (1 variante aleatoria por slot, "hecha"=N slots, cascada D-54 reusando `applyResultToSession`, racha/dominada + 3 modos integran el muestreo) — engine exercisable end-to-end con slots de 1 variante ANTES de la rework de contenido; **Phase 17 (Piloto Preposiciones)** mapea 5 PILOT (reagrupar 57 ejercicios en slots, autorar variantes nuevas con quórum R1-R7, slot `in spiaggia`, reset progreso, validator + smoke). **Cobertura: 17/17 mapped, 0 orphans, 0 duplicados, 0 gaps.** PILOT depende de SLOT+EXAM en su sitio. Brownfield: el motor de re-verificación NO se reconstruye.

### Decisions

Las decisiones de proyecto se registran en `PROJECT.md` §Key Decisions. Decisiones que constriñen el trabajo v1.4:

- **Phase numbering CONTINÚA (15, 16, 17), NO reset a 1** — audit trail histórico lineal; MILESTONES.md y REQUIREMENTS.md traceability incrementales (mismo criterio que v1.1/v1.2/v1.3).
- **MOTOR + 1 PILOTO, NO conversión masiva** — v1.4 construye el modelo+motor de slots y convierte SOLO Preposiciones como piloto real. Las otras 8 categorías siguen funcionando intactas como slots de 1 variante (backward-compat, SLOT-06). Su conversión es CONV-01 (futuro, out-of-scope explícito) — evita re-validar 372 ejercicios de golpe.
- **Brownfield, REUTILIZAR el engine, NO reconstruir** — el motor de re-verificación está DONE (cascada D-54, sampler, schema-validator, patrón Test-completo, `applyResultToSession`). El muestreo por slot es una capa sobre el sampler existente; "hecha" por slots es una redefinición del recuento; la cascada por variante reusa `applyResultToSession`.
- **Pitfall #2 — minimizar call-sites de `applyImmediateFailure`** — actualmente exactamente 2 call-sites (decisión final + primer fallo match). EXAM-03 debe mantener ese número: la cascada por variante de slot reusa `applyResultToSession`, NO añade un 3er call-site. Verificable por grep.
- **Vertical-slice ordering con dependencia clara** — Phase 16 (motor) debe ser exercisable end-to-end con slots de 1 variante (gracias a SLOT-06 backward-compat) ANTES de la rework de contenido de Phase 17. PILOT depende de SLOT+EXAM en su sitio.
- **Contenido del piloto pasa el quórum estricto R1-R7** — las variantes nuevas de Preposiciones (PILOT-02) NO usan la validación ligera autor-oráculo de canciones; usan el quórum cross-vendor gramatical (skills `gsd-validate-exercise` / `gsd-validate-batch`), porque son ejercicios gramaticales reales.
- **Explicación a nivel de slot, NO por variante (SLOT-02)** — variantes intercambiables comparten regla y explicación; más simple de autorar/validar. Explicación propia por variante está out-of-scope.
- **Reset de progreso de Preposiciones al migrar (PILOT-04)** — coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot; el resto de categorías conserva su progreso. ✓ **Implementado Plan 17-01** (D-17-08): `migrate6to7` clona el patrón deep-clone de `migrate5to6` + 3 desviaciones (delete `categoryProgress.preposiciones`; filtro de `exerciseStats` por prefijo `preposiciones` — cubre ids legacy y futuros de slot; invalidación de `inFlightTest` si algún `exerciseId` empieza por `preposiciones`, evitando crash al reanudar). `hydrateV7` = espejo de `hydrateV6` SIN poda. `CURRENT_SCHEMA_VERSION` 6→7 (storage + backup espejo). `backup.js` round-trip v7 + import v6→v7 reseteando Preposiciones. Idempotente + puro + anti-prototype-pollution preservado. 342/342 tests verdes (+18 nuevos v7); avere snapshot intacto. Las otras 8 categorías byte-intactas (verificado por test).
- **Migración coherente con el patrón existente (SLOT-05)** — `migrate5to6` + `hydrateV6` idempotente + deep-clone defensivo (mismo patrón que `migrate4to5`); `backup.js` extendido a v6 para round-trip. ✓ **Implementado Plan 15-02** (D-15-09: bump NOMINAL a nivel del state root — el modelo slot+variantes vive en `content/`, no en el state; mismo set de sub-dicts que v5; sin reset de progreso, Preposiciones reset es Phase 17; 341/341 tests verdes, +9 nuevos v6).
- **Canon editorial heredado** — explanations de slot en español acentuado correcto + italianismos preservados, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137).
- **Verificación e2e + fixture canónico como contrato (SLOT-01/03/06)** — ✓ **Implementado Plan 15-03**: el fixture `content/exercises/_fixtures/slot-demo.json` (1 slot multi-variante + 1 slot de 1, fuera del registry) recorre el pipeline completo (validateContent → normalizeExerciseToSlot → slotById) sin mutar el legacy; las 9 categorías reales validan intactas con el validator extendido (SLOT-06); avere snapshot verde. 367/367 tests. **Checkpoint humano (ASVS L1, block-on-high) APPROVED**: la app arranca con las 9 categorías como hoy, state persiste en schemaVersion 6 sin reset, backup round-trip v6 funciona, banners de validación como texto plano (T-15-REGR/XSS/DATALOSS mitigados). El fixture queda como contrato vivo del shape de autoría para Phase 16/17.
- **Muestreo por slot + selección de variante en el dominio (EXAM-01/04/06)** — ✓ **Implementado Plan 16-01**: `pickVariantIndex(slot, rng)` helper puro uniforme (D-16-01, default 0 para 0/1 variante D-16-10, guard `Array.isArray`); `buildSession`/`buildFullTest` devuelven `{exerciseIds, variantIndices, actualSize}` con arrays alineados 1:1 (opción **parallel-array** elegida sobre array-of-pairs por diff mínimo al plumbing de Plan 02, D-16-08). Mismo `rng` ya threaded (cero segundo RNG, determinismo con seed). **Cero state nuevo, cero contador por variante; peso anclado a slot.id == exercise.id (D-15-09).** Pureza de capa intacta (cero import de `../data/*`/`../screens/*`). 6 tests deterministas nuevos (EXAM-01 sin duplicados de slot, EXAM-04 barrido de seeds → ≥2 índices distintos, D-16-10 legacy → 0, buildFullTest exhaustivo). 327/327 tests verdes (`node --test tests/*.test.js`).
- **Cableado del motor de slots end-to-end en la pantalla (EXAM-02/03/05/06)** — ✓ **Implementado Plan 16-02**: getter `sessionCurrentExercise` reescrito como **slot-aware** — resuelve `content.slotById[id].variants[variantIndex]` y lo re-envuelve en `{id, type, categoryIds, payload:{...surface, explanation: slot.explanation}}` (**synthetic-payload re-wrap**, mismo truco que `songCurrentPhrase`/`songStart` de Phase 13) → `initSubStateForExercise` y todos los bindings `.payload.*` sobreviven sin tocar. Campo `sessionVariantIndices` paralelo a `sessionExerciseIds` (parallel-array, D-16-08); los **3 launch sites** (`startSession`/`_launchExamen`/`resetSession`) alimentan el pool con `Object.values(content.slotById)` y guardan `result.variantIndices`; `sessionAdvance`/`resumeInFlightTest` resuelven vía el getter (NO re-sortean). La variante viaja en `inFlightTest` (`variantIndices:[...]`) → **resume = misma variante**; blobs legacy sin `variantIndices` → fallback `.map(() => 0)` (D-16-10), **sin bump de schemaVersion** (sigue v6, D-16-09). `sessionResults` registra `variantIndex`; el review de errores del summary muestra la **variante exacta fallada** vía helper `summaryVariantSurface(result)` (index.html, copy/estructura idénticos, EXAM-02). **Cascada D-54 y racha intactas** — `applyResultToSession` reusado, **2 call-sites de `applyImmediateFailure`** (Pitfall #2, grep-verificado). 327/327 tests verdes. **Checkpoint booteo (human-verify, gate=blocking) APPROVED** bajo auto/chain-mode (mitad automatizada del gate verde). **UAT manual de browser** (boot local, home count, Repaso 20 hecha, fallo→cascada D-54, Test resume misma variante, review de errores, localStorage v6 sin reset) trasladado al usuario como verificación de confianza — NO ejecutado headlessly. **Phase 16 COMPLETE: EXAM 6/6.**

### Pending Todos

- [ ] `/gsd:plan-phase 15` — descomponer Phase 15 (Modelo de datos slot+variantes + schema + migración): shape del slot+variantes, validator extendido (slot sin variantes / variante sin payload / explicación ausente), `migrate5to6`/`hydrateV6` + `backup.js` v6, backward-compat de las 8 categorías como slots de 1 variante.
- [ ] `/gsd:plan-phase 16` — descomponer Phase 16 (Motor de examen por slots): muestreo 1 variante/slot en el sampler, "hecha"=N slots + recuento "Ejercicios"=slots, cascada D-54 reusando `applyResultToSession` (0 nuevos call-sites), racha/dominada sobre la nueva "hecha", integración Repaso 20 / Test / Examen. Engine exercisable end-to-end.
- [ ] `/gsd:plan-phase 17` — descomponer Phase 17 (Piloto Preposiciones): reagrupar 57 ejercicios en slots por regla, autorar variantes nuevas (D-85 + quórum R1-R7), slot `in spiaggia / in montagna / al mare / in campagna`, reset progreso, validator + smoke paramétrico.
- [ ] `/gsd:complete-milestone v1.4` — tras verifier PASS de Phase 17.

### Blockers/Concerns

(Ninguno — engine v1.0 DONE y operativo, sampler/cascada D-54/schema-validator/patrón Test-completo reutilizables, roadmap v1.4 fijado, infra de quórum cross-vendor disponible.)

### Decisions Pending (a resolver en plan-time)

- **Shape exacto del modelo slot+variantes en JSON** — cómo se representa un slot (`{slotId, categoryIds, explanation, variants:[...]}`?), dónde vive la explicación, cómo se identifica una variante; y cómo el backward-compat lee un ejercicio plano actual como slot de 1 variante (¿adapter en `loadExercises` vs migración del JSON en disco?). Decisión en plan-time de Phase 15.
- **Cómo el sampler/recuento pasa de ejercicios a slots** — el sampler ponderado actual opera sobre ejercicios; decidir si pondera a nivel de slot y elige variante dentro, o pre-resuelve variantes y filtra duplicados de slot. GUARANTEE phase ≥1 slot/categoría. Decisión en plan-time de Phase 16.
- **Recuento "Ejercicios" del home = slots** — qué getter cambia y cómo se muestra (N slots) sin romper categorías backward-compat (slots de 1 variante = mismo N que hoy). Plan-time Phase 16.
- **Granularidad del regroup de Preposiciones** — cuántos slots y qué reglas (los 57 ejercicios actuales → ¿cuántos slots?); cuántas variantes nuevas autorar por slot. Plan-time Phase 17.

## Deferred Items

Items reconocidos y trasladados al backlog (REQUIREMENTS.md §Future / ROADMAP.md §Backlog):

| Categoría | Item | Status | Deferred At |
|-----------|------|--------|-------------|
| Conversión categorías | CONV-01 — reestructurar las otras 8 categorías a slots-por-regla + variantes, una por milestone incremental, siguiendo el patrón del piloto Preposiciones | Backlog post-v1.4 (en v1.4 funcionan como slots de 1 variante, SLOT-06) | v1.4 init |
| Autoría asistida | AUTHOR-01 — UI/proceso asistido para autorar/revisar variantes sin editar JSON a mano | Backlog post-v1.4 (en v1.4 a mano + quórum, patrón D-85) | v1.4 init |
| Categorización asistida | CATPROC-01/02 — proponer categorías nuevas para frases de canciones sin categoría | Backlog post-v1.3 | v1.3 init |
| Contenido | MUSIC-X1 — más canciones | Backlog post-v1.3 | v1.3 init |
| Contenido | TENSE-X1..X4 (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo) | Backlog | v1.2 init |
| Bridges | PART-X1 — bridges Partitivos ↔ género-número / sustantivos | Backlog | v1.2 init |
| UX | Modo móvil responsive; refactor confirmLabel unificado 6 call-sites; Examen multi-cat | Backlog | v1.0/v1.1 |

## Session Continuity

### Last Session

- **Fecha:** 2026-06-02 — **Roadmap del milestone v1.4 (Variantes de ejercicio / slots por regla) creado por el roadmapper.** Numeración CONTINÚA desde Phase 14 → **Phases 15-17, NO reset** (mismo criterio que v1.1/v1.2/v1.3). 3 fases coarse, vertical/shippable con dependencia explícita: **Phase 15 (Modelo de datos slot+variantes + schema + migración)** mapea 6 SLOT — modelo slot (1 regla, 1..N variantes), explicación a nivel de slot, validator extendido, `migrate5to6`/`hydrateV6` + `backup.js` v6, backward-compat de las 8 categorías como slots de 1 variante; **Phase 16 (Motor de examen por slots)** mapea 6 EXAM — el sampler elige 1 variante aleatoria por slot, "hecha"=pasar N slots + recuento "Ejercicios"=slots, cascada D-54 reusando `applyResultToSession` (0 nuevos call-sites, Pitfall #2), racha/dominada sobre la nueva "hecha", integración Repaso 20 / Test / Examen — engine exercisable end-to-end ANTES de la rework de contenido; **Phase 17 (Piloto Preposiciones)** mapea 5 PILOT — reagrupar 57 ejercicios en slots por regla, autorar variantes nuevas (D-85 + quórum R1-R7), slot `in spiaggia / in montagna`, reset progreso de Preposiciones, validator + smoke paramétrico. **Cobertura: 17/17 mapped, 0 orphans, 0 duplicados, 0 gaps** (cada success criterion respaldado por ≥1 requisito). MOTOR + 1 PILOTO: las otras 8 categorías NO se convierten (CONV-01 futuro). Brownfield: el motor de re-verificación NO se reconstruye. Archivos escritos: `.planning/ROADMAP.md` (sección v1.4 ACTIVE: summary checklist Phases 15-17 + Phase Details con 5 criteria c/u + Progress table +3 filas + backlog CONV-01/AUTHOR-01), `.planning/REQUIREMENTS.md` (Traceability 17 filas + Coverage 17/17), `.planning/STATE.md` (este — re-inicializado para v1.4 planning). v1.0/v1.1/v1.2/v1.3 preservados archivados. Stopped at: roadmap creado. Resume file: None. Siguiente: `/gsd:plan-phase 15`.
- **Fecha:** 2026-06-02 — Plan 14-01 + cierre de v1.3 (Canciones). Milestone v1.3 archivado.

### Files Generated (este ciclo, 2026-06-02 — v1.4 roadmap)

- `.planning/ROADMAP.md` (modified — sección `### 🚧 v1.4 — ACTIVE` con Phases 15-17 en summary checklist; `## Phase Details` con las 3 fases completas (goal/depends-on/requirements/5 success criteria; UI hint:yes en Phase 16); `## Progress` table +3 filas v1.4; backlog CONV-01 + AUTHOR-01; footer milestone v1.4)
- `.planning/REQUIREMENTS.md` (modified — Traceability 17 filas SLOT→Phase 15 / EXAM→Phase 16 / PILOT→Phase 17; Coverage 17/17 mapped, 0 orphans/duplicados/gaps; footer)
- `.planning/STATE.md` (modified — re-inicializado para v1.4 planning; frontmatter milestone v1.4 + total_phases 3; decisiones v1.4; decisiones pending plan-time)

**Heredado (engine + infra reutilizable en v1.4, NO se reconstruye):**

- `src/screens/app.js` — cascada D-54 `applyImmediateFailure` / `applyResultToSession` (2 call-sites EXACTOS — Pitfall #2), factory plano `currentScreen`, patrón Test-completo + summary-errors, sampler GUARANTEE/FILL.
- `src/data/schema-validator.js` — dispatch table `PAYLOAD_VALIDATORS` + banner visible (se extiende para slot+variantes).
- Patrón migración `migrateNtoM` (schemaVersion 5, último `migrate4to5`) → `migrate5to6` + `hydrateV6` + `backup.js` v6.
- Infra de quórum cross-vendor: skills `gsd-validate-exercise` / `gsd-validate-batch`, `scripts/validate-ai-pass.mjs`, reporter — para PILOT-02.

## Operator Next Steps

- **UAT manual recomendado** (Phase 16): arrancar `npx serve`, abrir `http://localhost:PORT`, y recorrer los 7 pasos del checkpoint (home count, Repaso 20 hecha, fallo→cascada D-54, Test resume misma variante, review de errores, localStorage `schemaVersion:6` sin reset, sin banner de validación). Documentado en `16-02-SUMMARY.md` §"Manual UAT carried forward".
- `/gsd:plan-phase 17` para descomponer la última fase del milestone v1.4 (Piloto Preposiciones).
