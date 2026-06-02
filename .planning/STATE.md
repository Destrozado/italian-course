---
gsd_state_version: 1.0
milestone: v1.3
milestone_name: Canciones (bloque de traducción)
status: ready_to_plan
last_updated: 2026-06-02T15:29:00.189Z
last_activity: 2026-06-02 -- Phase 14 execution started
progress:
  total_phases: 4
  completed_phases: 1
  total_plans: 3
  completed_plans: 3
  percent: 25
stopped_at: Phase 14 complete (1/1) — ready to discuss Phase 999.1
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-02)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 999.1 — bot n reiniciar ejercicios en pantalla de sesi n

**Milestone v1.3 Goal:** Añadir un bloque "Canciones" separado del home: traducir canciones italianas frase a frase como ejercicio (word-buttons en dirección inversa italiano→español), con las frases enganchadas al motor de re-verificación existente vía cascada D-54. Reproducción secuencial tipo Test completo (sin reinicio a mitad) + resumen de errores. Frases catalogables (cascada al fallar) o sin categoría (guardadas, sin cascada). Canciones standalone: NO entran en Repaso 20 / Test ni en la tabla de categorías. Estado simple pasada/fallada por canción (NO dominada/streak/21-day). Primer contenido: "Equilibrio mentale — Ultimo". Brownfield: REUTILIZA engine (cascada D-54, schema-validator `PAYLOAD_VALIDATORS`, word-buttons `grade()`, patrón Test-completo/summary-errors) — NO reconstruye el motor.

## Current Position

Phase: 999.1
Plan: Not started
Status: Ready to plan
Last activity: 2026-06-02

## Quick Tasks Completed

| Fecha | Quick ID | Tarea | Resultado |
|-------|----------|-------|-----------|
| 2026-05-29 | 260529-c35 | Añadir y validar `preposiciones-052` ("Passo da te alle otto") — `da` simple = "en casa de", excepción idiomática A1 | `validated` (quórum Opus 4.8 + Sonnet 4.6, ambas `correcta`); 275 tests PASS; reporter gate PASS (373/373) |

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incl. decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 2/2 completas (Phase 9 infra + Phase 10 ejecución) — SHIPPED 2026-05-27 |
| Fases v1.2 | 2/2 completas (Phase 11 Articoli + Phase 12 Partitivos) — SHIPPED 2026-05-28 |
| Fases v1.3 | 0/2 (Phase 13 Bloque Canciones + playthrough; Phase 14 Contenido "Equilibrio mentale") |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 completos | 15/15 (100% — ART-01..08 + PART-01..07) |
| Requisitos v1.3 mapeados | 19/19 (100% — SONG/PLAY/LINK/DATA → Phase 13 (16); CONT → Phase 14 (3); 0 orphans) |
| Requisitos v1.3 completos | 0/19 (planning) |
| Ejercicios totales en la app | 373 validated (9 categorías gramaticales) |
| Categorías gramaticales | 9 (Articoli 8ª; Partitivos 9ª) — las canciones son bloque APARTE, no categorías |
| Granularidad | coarse |
| Mode | mixed — Phase 13 es slice vertical de software (engine reuse); Phase 14 es contenido editorial (validación ligera autor-oráculo, NO quórum estricto) |

**By Phase (v1.3):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 13. Bloque Canciones + playthrough | 0 | — | — |
| 14. Contenido "Equilibrio mentale" | 0 | — | — |
| Phase 13 P01 | 5 min | 2 tasks | 9 files |
| Phase 13 P02 | ~12 min | 3 tasks | 4 files |
| 14 | 1 | - | - |

## Accumulated Context

### Roadmap Evolution

- **2026-05-25 — Milestone v1.0 shipped.** 10 fases activas, 26 plans, 71 tasks. 271/271 ejercicios curados con explanations en 7 categorías. Motor de re-verificación + Modo Examen operativos.
- **2026-05-27 — Milestone v1.1 shipped.** 2 fases (9-10), 8 plans. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos, 0 deferred.
- **2026-05-28 — Milestone v1.2 shipped.** 2 fases (11-12), 10 plans. 100 ejercicios nuevos (Articoli 56 + Partitivos 44) validados por quórum cross-vendor (DeepSeek + Opus 4.7). 9 categorías totales, 372/372 validated. Patrón "categoría nueva" consolidado.
- **2026-06-02 — Milestone v1.3 abierto + roadmap fijado.** Bloque "Canciones" (traducción italiano→español frase a frase, enganchada al engine vía cascada D-54). Numeración CONTINÚA desde v1.2 (Phase 13 + Phase 14, NO reset — mismo criterio que v1.1/v1.2). El autor favorece slices verticales pequeños y patrones consolidados — 2 fases: (13) software end-to-end reutilizando el engine; (14) contenido "Equilibrio mentale" autorado + validación ligera. 19 requirements (4 SONG + 5 PLAY + 4 LINK + 3 DATA + 3 CONT), 19/19 mapped, 0 orphans, 0 gaps.

### Decisions

Las decisiones de proyecto se registran en `PROJECT.md` §Key Decisions. Decisiones que constriñen el trabajo v1.3:

- **Phase numbering CONTINÚA (13, 14), NO reset a 1** — audit trail histórico lineal; MILESTONES.md y REQUIREMENTS.md traceability incrementales (mismo criterio que v1.1 y v1.2).
- **Brownfield, mostly-integration: REUTILIZAR, NO reconstruir** — el motor de re-verificación está DONE y NO se toca. Phase 13 reutiliza: cascada D-54 `applyImmediateFailure`/`applyResultToSession` (`src/screens/app.js`); tipo word-buttons `grade()` (`src/exercise-types/word-buttons.js`) que ya gradúa una secuencia exacta de tokens case-insensitively — las canciones lo usan en dirección INVERSA (línea italiana = prompt → user construye tokens españoles = answer); schema-validator hand-written (`src/data/schema-validator.js`, dispatch `PAYLOAD_VALIDATORS`); patrón Test-completo + summary-errors UX.
- **Vertical-slice ordering** — Phase 13 debe entregar un loop end-to-end "jugar una canción mínima" temprano (con una canción semilla de pocas frases), no fragmentar en data-model→UI→mecánica horizontales. Phase 14 carga el contenido real "Equilibrio mentale" sobre la maquinaria ya verificada.
- **Canciones standalone (LINK-04)** — NO entran en el sampler de Repaso 20 / Test completo ni en la tabla de categorías del home. Bloque APARTE. El espíritu de re-verificación llega vía cascada D-54 a las categorías gramaticales reales enganchadas por frase.
- **Recorrido tipo Test completo, NO mid-restart (PLAY-01)** — N frases en orden hasta el final + resumen. PERO sin slot de reanudación `inFlightTest`: abandonar a mitad descarta el progreso no comprometido (los fallos ya cascadeados por D-54 quedan) y al re-entrar empieza de cero (PLAY-05). Diferencia explícita con el Test completo de categorías (que sí se reanuda).
- **Estado por canción simple: pasada/fallada (SONG-02/04)** — NO dominada / NO racha / NO log 21-day. Persiste en localStorage entre sesiones. Mucho más simple que el modelo de categorías.
- **Frases sin categoría soportadas en el modelo (LINK-03)** — etiquetadas y guardadas, sin disparar cascada; preparado para el proceso de propuesta de categorías nuevas (CATPROC) que se DIFIERE a un milestone futuro. El modelo de datos v1.3 no debe bloquearlo.
- **Validación de contenido LIGERA autor-oráculo (CONT-03)** — NO el quórum gramatical estricto R1-R7 que usan las categorías. Una IA verifica que la traducción española sea defendible y que el enganche de categorías por frase sea correcto; el autor es oráculo final sobre el fraseo artístico (las traducciones de canciones son "particulares" por diseño).
- **Schema de canción + migración coherentes con lo existente (DATA-01/02/03)** — el JSON de canción se valida con el mismo patrón hand-written + banner visible; si el state requiere campos nuevos, migración `migrateNtoM` desde schemaVersion 4 (mismo patrón que `migrate3to4`).
- **Canon editorial heredado** — donde el contenido lleve texto explicativo en español: acentos correctos (á/é/í/ó/ú + ñ RAE) + italianismos citados con ortografía italiana, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137). El italiano de las frases preserva su ortografía.
- [Phase ?]: Plan 13-01: validateSongs export separado (no extiende PAYLOAD_VALIDATORS) — coherente con LINK-04 standalone
- [Phase ?]: Plan 13-01: songProgress plano {status,lastPlayedAt} sin streak/dominada (D-03); migrate4to5/hydrateV5 deep-clone defensivo (CR-03/T-13-01)
- [Phase ?]: Plan 13-01 [Rule 2]: backup.js extendido a v5 para preservar round-trip export/import del estado actual
- [Phase ?]: Plan 13-02: pantallas DEDICADAS cancion/cancion-summary + getter songCurrentPhrase y mapa dedicado songPhraseById (no song-aware sessionCurrentExercise, LINK-04)
- [Phase ?]: Plan 13-02: cascada de cancion REUSA applyResultToSession (0 call-sites nuevos de applyImmediateFailure, Pitfall #2); auto-avance dispatcha por sessionMode=cancion; PLAY-05 sin inFlightTest

### Pending Todos

- [ ] `/gsd:plan-phase 13` — descomponer Phase 13 (Bloque Canciones + modelo de datos + playthrough end-to-end) en planes ejecutables, favoreciendo un slice vertical "jugar una canción mínima" temprano (schema + validator + migración, pantalla Canciones + listado/estado, playthrough word-buttons inverso + feedback + resumen, cascada D-54 + standalone)
- [ ] `/gsd:plan-phase 14` — descomponer Phase 14 (Contenido "Equilibrio mentale — Ultimo") tras cerrar Phase 13 (limpieza ruido → segmentación en frases → traducción curada + distractoras + enganche categorías → validación ligera autor-oráculo)
- [ ] `/gsd:complete-milestone v1.3` — tras verifier PASS de Phase 14

### Blockers/Concerns

(Ninguno — engine v1.0 DONE y operativo, word-buttons/schema-validator/cascada D-54/patrón Test-completo reutilizables, roadmap v1.3 fijado, canon ortográfico establecido)

### Decisions Pending (a resolver en plan-time)

- **Shape exacto del schema de canción** — `{songId, title, artist, phrases:[{phraseId, italian, answer:[tokens es], distractors?:[], categoryIds?:[]}]}` o variante; decidir el shape concreto y cómo se distingue una frase sin categoría (`categoryIds:[]` vs ausencia del campo) en plan-time.
- **Dónde vive el JSON de canciones en disco** — carpeta `content/songs/` 1 archivo por canción (espejo del patrón `content/exercises/`) vs `content/songs.json` único; decisión en plan-time.
- **Cómo carga/registra la pantalla Canciones** — 6º `currentScreen` en el factory plano `src/screens/app.js` (espejo de session/summary/backup) + carga del JSON de canciones en boot; confirmar en plan-time.
- **Si DATA-03 (migración) realmente se necesita** — depende de si el state de canciones (pasada/fallada por canción) requiere una subkey nueva en el state raíz → si la añade, bump schemaVersion 4→5 con `migrate4to5`; si se puede colgar de la estructura existente sin campos nuevos, DATA-03 se cubre por "no se necesita migración" documentado. Decisión al diseñar el state shape.
- **Modo de validación ligera (CONT-03)** — qué IA(s) y prompt para el autor-oráculo (NO el reporter R1-R7); decisión en plan-time de Phase 14.

## Deferred Items

Items reconocidos y trasladados al backlog (REQUIREMENTS.md §Future):

| Categoría | Item | Status | Deferred At |
|-----------|------|--------|-------------|
| Categorización asistida | CATPROC-01/02 — proceso que propone categorías nuevas para frases de canciones sin categoría + creación/re-enganche por el autor | Backlog post-v1.3 (modelo de datos v1.3 LINK-03 ya lo soporta) | v1.3 init |
| Contenido | MUSIC-X1 — más canciones conforme el autor las quiera trabajar (patrón de alta consolidado en v1.3) | Backlog post-v1.3 | v1.3 init |
| Contenido | TENSE-X1..X4 (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo) conforme la profesora entrega material | Backlog | v1.2 init |
| Bridges | PART-X1 — bridges Partitivos ↔ género-número / sustantivos | Backlog | v1.2 init |
| UX | Modo móvil responsive si emerge dolor; refactor confirmLabel unificado 6 call-sites; Examen multi-cat | Backlog | v1.0/v1.1 |

## Session Continuity

### Last Session

- **Fecha:** 2026-06-02 — **Plan 13-02 completado (último plan de Phase 13).** Slice VERTICAL jugable del bloque Canciones reutilizando el engine: botón protagonista en el home, pantalla de listado con estado por canción, playthrough secuencial it->es con feedback y cascada D-54 inmediata (un solo call-site, reusando `applyResultToSession`), y resumen post-canción (Block A frases falladas vs correcta + Block B impacto factual en categorías). 3 tasks, 3 commits (`1b80210` boot+listado, `10fe9c8` playthrough+cascada, `db69f8e` resumen+write-once). Pantallas DEDICADAS `cancion`/`cancion-summary` (getter `songCurrentPhrase` + mapa `songPhraseById`, no song-aware `sessionCurrentExercise` — LINK-04). `loadSongs` cableado en boot (`main.js`), `songsById` hermano de `exerciseById`. 306/306 tests pass (+19 en `screen-canciones.test.js`). Requisitos completados: SONG-01..04, PLAY-01..05, LINK-02/04. **Phase 13 ready for verification.** Stopped at: 13-02 ejecutado. Resume file: None. Siguiente: verificación de Phase 13, luego `/gsd:plan-phase 14`.
- **Fecha:** 2026-06-02 — Roadmap del milestone v1.3 (Canciones) creado por el roadmapper. **Numeración CONTINÚA desde Phase 12 → Phases 13-14, NO reset** (mismo criterio que v1.1/v1.2). 2 fases coarse, vertical-slice: **Phase 13 (Bloque Canciones + modelo de datos + playthrough end-to-end)** mapea 16 requisitos (SONG-01..04 + PLAY-01..05 + LINK-01..04 + DATA-01..03) y entrega el loop completo "jugar una canción mínima" reutilizando el engine (cascada D-54, word-buttons inverso, schema-validator, patrón Test-completo); **Phase 14 (Contenido "Equilibrio mentale — Ultimo")** mapea 3 (CONT-01..03) — letra segmentada + traducción curada + enganche de categorías + validación ligera autor-oráculo (NO quórum R1-R7). **Cobertura: 19/19 mapped, 0 orphans, 0 duplicados, 0 gaps** (cada success criterion respaldado por ≥1 requisito). Brownfield: el motor de re-verificación NO se reconstruye. Archivos escritos: `.planning/ROADMAP.md` (sección v1.3 ACTIVE con summary checklist + Phase Details 5 criteria Phase 13 / 3 criteria Phase 14 + UI hint:yes en ambas + Progress table +2 filas + backlog CATPROC/MUSIC-X1), `.planning/REQUIREMENTS.md` (Traceability 19 filas + Coverage 19/19), `.planning/STATE.md` (este — re-inicializado para v1.3 planning). v1.0/v1.1/v1.2 preservados archivados. Stopped at: roadmap creado. Resume file: None. Siguiente: `/gsd:plan-phase 13`.
- **Fecha:** 2026-05-28 — Plan 12-04 completado: cableó `partitivos` en los 3 puntos de integración en LOCKSTEP N=44. Milestone v1.2 cerrado y archivado.

### Files Generated (este ciclo, 2026-06-02)

- `.planning/ROADMAP.md` (modified — sección `### v1.3 — ACTIVE` con Phase 13 + Phase 14 en summary checklist; `## Phase Details` con las 2 fases completas (goal/depends-on/requirements/success criteria + UI hint:yes); `## Progress` table +2 filas v1.3; backlog CATPROC + MUSIC-X1; footer milestone v1.3)
- `.planning/REQUIREMENTS.md` (modified — Traceability 19 filas SONG/PLAY/LINK/DATA→Phase 13 + CONT→Phase 14; Coverage 19/19 mapped, 0 orphans/duplicados/gaps; footer)
- `.planning/STATE.md` (modified — re-inicializado para v1.3 planning; frontmatter milestone v1.3 + total_phases 2; decisiones v1.3; decisiones pending plan-time)

**Heredado (engine + infra reutilizable en v1.3, NO se reconstruye):**

- `src/screens/app.js` — cascada D-54 `applyImmediateFailure` / `applyResultToSession`, factory plano `currentScreen`, patrón Test-completo + summary-errors
- `src/exercise-types/word-buttons.js` — `grade()` por secuencia exacta de tokens case-insensitive (las canciones lo usan en dirección inversa italiano→español)
- `src/data/schema-validator.js` — dispatch table `PAYLOAD_VALIDATORS` + banner visible
- Patrón migración `migrateNtoM` (schemaVersion 4, último `migrate3to4`)

## Operator Next Steps

- `/gsd:plan-phase 13` para descomponer Bloque Canciones + playthrough en planes ejecutables.
