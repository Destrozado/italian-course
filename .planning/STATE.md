---
gsd_state_version: 1.0
milestone: v1.2
milestone_name: Más contenido A1 (Articoli + Partitivos)
status: ready_to_complete
last_updated: "2026-05-28T12:00:00.000Z"
last_activity: 2026-05-28
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 10
  completed_plans: 10
  percent: 100
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-05-27)

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 12 — partitivos

**Milestone v1.2 Goal:** Añadir 2 categorías nuevas de gramática A1 (Articoli y Partitivos), diseñadas desde cero sin PDF de referencia. Cada categoría sigue el mismo flujo dentro de su propia fase: (a) temario exhaustivo ANTES de redactar ejercicios → (b) ejercicios que cubren cada celda del temario → (c) explanations pedagógicas curadas → (d) validación por quórum ≥2 IAs distintas reutilizando la infraestructura editorial de v1.1 (skill `gsd-validate-batch` + reporter `scripts/run-validation-271.mjs` + reglas R1-R7). NO se modifica el engine: motor de re-verificación, sampler, cascada D-54, schema validator y 3 tipos de ejercicio están DONE.

## Current Position

Phase: 12 (partitivos) — EXECUTING
Plan: 5 of 5
Status: 12-04 completo (integración 3-count lockstep N=44) — siguiente 12-05 (validación por quórum)
Last activity: 2026-05-28

Progress: [█████████░] 90%

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases v1.0 | 10/10 completas (Phase 1-8 incl. decimales 7.1/7.2) — SHIPPED 2026-05-25 |
| Fases v1.1 | 2/2 completas (Phase 9 infra + Phase 10 ejecución) — SHIPPED 2026-05-27 |
| Fases v1.2 | 0/2 (Phase 11 Articoli + Phase 12 Partitivos) |
| Requisitos v1.0 completos | 62/62 (100%) |
| Requisitos v1.1 completos | 8/8 (100% — VAL-01..08) |
| Requisitos v1.2 mapeados | 15/15 (100% — ART-01..08 → Phase 11; PART-01..07 → Phase 12; 0 orphans) |
| Requisitos v1.2 completos | 14/15 (ART-01..08 → Phase 11 + PART-01..06 → Phase 12; falta PART-07 quórum→12-05) |
| Ejercicios totales en la app | 372 = 328 validated (8 categorías) + 44 partitivos pending (9ª, validated en 12-05) |
| Categorías | 9 (Articoli 8ª; Partitivos 9ª cableada en 12-04, contenido pending hasta quórum 12-05) |
| Granularidad | coarse |
| Mode | standard (NO MVP — esto es contenido editorial, no slice vertical de software) |

**By Phase (v1.2):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 11. Articoli | 0 | — | — |
| 12. Partitivos | 0 | — | — |
| Phase 11 P01 | 5min | 2 tasks | 1 files |
| Phase 11 P02 | 15min | 3 tasks | 2 files |
| Phase 11 P04 | ~8min | 3 tasks | 2 files |
| Phase 11 P05 | ~40min | 2 tasks | 4 files |
| 11 | 5 | - | - |
| Phase 12 P01 | 4min | 2 tasks | 1 files |
| Phase 12 P12-02 | 7min | 3 tasks | 2 files |
| Phase 12 P12-03 | 2min | 3 tasks | 1 files |
| Phase 12 P04 | 3min | 3 tasks | 2 files |

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
- [Phase ?]: Bloque base multiple-choice de Articoli (48 ejercicios det+indet) aprobado por el autor sin cambios (checkpoint 11-02 D-85); articoli registrado en categories.json order 8 como deviation Rule 3
- [Phase 11]: Match articolo<->sustantivo (049/050) + 6 bridges multi-cat (300..305) aprobados por el autor sin cambios (checkpoint 11-03). Conteo final CANONICO de content/exercises/articoli.json = 56 ejercicios (48 base + 2 match + 6 bridges); 11-04 debe propagarlo identico a categories.json, run-validation-271.mjs (TOTAL_EXPECTED 272->328) y tests/exercise-types.test.js
- [Phase 11]: Plan 11-04 cableo articoli en los 3 puntos de integracion con conteos en LOCKSTEP N=56 (categories.json order 8 ya por 11-02, no duplicado; reporter CATEGORIES+TOTAL_EXPECTED 272->328; CATEGORIES_WITH_EXPLANATIONS expected:56). Smoke test 123/0 PASS. ART-01 cubierto. Reporter exit 1 SOLO por status pending de los 56 articoli (lo cierra 11-05 via quorum).
- [Phase 11]: Plan 11-05 validó articoli por quórum cross-vendor (DeepSeek Flash + Opus 4.7) en vez del canon v1.1 (Opus+Sonnet), a petición del autor para probar multi-vendor. Invariante >=2 by distintos preservado. El cross-vendor capturó 8 bugs reales que los human-verify de 11-02/11-03 dejaron pasar (2 contracciones prep+art: 008 allo/011 sullo, 1 leak de triggers fonéticos en match 049, 5 acentos graves c'è/più: 013/028/038/042/043). Gate verde: reporter exit 0 328/328, smoke estricto VAL_07_STRICT=1 268/0. ART-08 cubierto. Infra nueva reutilizable: scripts/validate-ai-pass.mjs (multi-provider, auto-fallback 429) + docs/VALIDACION-QUORUM.md. Phase 11 lista para verifier.
- [Phase 12]: Temario exhaustivo del partitivo (12-TEMARIO-PARTITIVOS.md, commit 04db148) APROBADO por el autor en checkpoint 12-01 human-verify. Estructurado sobre el eje incontable-contable (D-01); 7 formas del/dello/della/dell'/dei/degli/delle + 3 alternativas por restriccion + omision + distincion PART-05; conteo orientativo ~30-40 sin bridges (D-14). D-13 verificable en git: precede a partitivos.json (que no existe aun).
- [Phase 12]: CARRY-FORWARD para 12-02/12-03 — los ejercicios de contable PLURAL deben usar un verbo que concuerde en plural (Ci sono / Ho comprato / Ho preso / Vedo...), NUNCA 'C'e ___ [plural]' (c'e es singular; 'C'e dei libri' es agramatical). Mantener el MISMO verbo a ambos lados de un par de contraste incontable-contable (Ho preso del pane / Ho preso dei libri). Surgio al corregir el espejo del temario (commit 9b5a15a, C'e->Ho preso). Preferencia menor: 'un po' d'acqua' elidido > 'un po' di acqua' donde lea natural (ambas validas A1).
- [Phase 12]: Bloque base multiple-choice de Partitivos (37 ejercicios: del-formas 001-026 incontable/contable + alternativas por restriccion 027-033 + omision 034-037) APROBADO por el autor en checkpoint 12-02 human-verify. El autor-proxy aplico UNA correccion: partitivos-010 reframeado (bug double-di voglia di+della) -> 'A pranzo cucino ___ pasta al pomodoro'. categories.json entry partitivos order 9 anadido en c415487 como deviation Rule-3 (12-04 verifica, NO re-anade).
- [Phase 12]: CARRY-FORWARD para 12-03 — conteo tras 12-02 = 37; target FINAL N <= 44 (techo verify), asi que 12-03 anade modesto (~1-2 match + ~4-5 PART-05) y FIJA el N. FLAG doble-validez para quorum 12-05: partitivos-034 y 036 (afirmativa omision) marcan ∅ como wrong aunque el partitivo afirmativo es OPCIONAL (Compro pane / Ho amici tambien validos) — implementan D-02 by design, el autor es oraculo (override pedagogia o reformular); negativas 035/037 inequivocas.
- [Phase 12]: Plan 12-03 FIJA el conteo FINAL N=44 de content/exercises/partitivos.json (37 base + 2 match 038/039 + 5 clasificación PART-05 040-044) — exactamente el techo ≤44 del verify. Match D-08 (pareo por género+disparador+número, NO por raíz; R3 ≥3 distintas; D-66 dups textuales). Clasificación PART-05 con 3 opciones `["partitivo","preposición","artículo determinativo"]` + slot `___` (DEVIATION ACEPTADA: el schema validator `validateMultipleChoicePayload` exige 3-4 opciones + `___`; las 2 opciones literales de D-05 fallarían; modificar el validador sería Rule 4 out-of-scope por ser fase content-only; la 3ª opción es meta-distractor que nombra el `il` dentro de `del`; author proxy ACEPTÓ). NOTA (no defecto): correctIndex=0 en las 42 MC es irrelevante por D-181 (engine permuta opciones con Math.random no-seedable al render; quórum valida en aislamiento). APROBADO checkpoint 12-03 sin cambios de contenido. **12-04 lockstep N=44:** categories.json order 9 YA presente (verificar NO re-añadir, c415487); reporter `run-validation-271.mjs` TOTAL_EXPECTED 328→372 + entry CATEGORIES `{slug:'partitivos',file:'content/exercises/partitivos.json',expected:44}`; test CATEGORIES_WITH_EXPLANATIONS `{file:'content/exercises/partitivos.json',expected:44}`. Commits Task 1 `2cfb6f3`, Task 2 `4c37490`.
- [Phase 12]: Plan 12-04 cableó partitivos en los 3 puntos de integración con conteos en LOCKSTEP N=44 (longitud real de partitivos.json, no inventada; coincide con 12-03-SUMMARY). categories.json order 9 YA presente desde 12-02 (c415487) -> Task 1 VERIFY-only sin commit nuevo. reporter run-validation-271.mjs: CATEGORIES +entry {slug:'partitivos',file:'content/exercises/partitivos.json',expected:44} alfabético entre genero-numero y profesiones + TOTAL_EXPECTED 328->372 (suma de 9 expected==372). test exercise-types.test.js: CATEGORIES_WITH_EXPLANATIONS +linea {file:...partitivos.json,expected:44} SIN slug (shape distinta del reporter). Lockstep 44==44==44 verificado; node --test 128/128 PASS. PART-01 cubierto. Commits Task 2 8f7c9a6, Task 3 9cfed4b. EXPECTED (no defecto): reporter exit 1 SOLO por pending=44 (found=44==expected=44, missing=0, disputed=0); el green gate lo cierra 12-05 via quorum, NO se intentó forzar exit 0.

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

- **Fecha:** 2026-05-28 — Plan 12-04 completado (autonomous, sin checkpoints): cableó la categoría `partitivos` en los 3 puntos de integración con conteos en **LOCKSTEP N=44** (longitud real de `content/exercises/partitivos.json`, leída del archivo, coincide con 12-03-SUMMARY). **Task 1 (categories.json) VERIFY-only** — la entry `{id:"partitivos",name:"Partitivos",order:9}` ya estaba committeada en 12-02 (`c415487`, deviation Rule-3); verificada (9 cats, order 9, articoli order 8 intacto, fixture exit 0), NO re-añadida → sin commit nuevo. **Task 2 `8f7c9a6` (feat):** `scripts/run-validation-271.mjs` CATEGORIES +entry `{slug:'partitivos',file:'content/exercises/partitivos.json',expected:44}` alfabético entre genero-numero y profesiones + `TOTAL_EXPECTED` 328→**372** + header comment extendido; suma de 9 expected (51+56+23+39+40+44+51+31+37)==372. **Task 3 `9cfed4b` (test):** `tests/exercise-types.test.js` CATEGORIES_WITH_EXPLANATIONS +línea `{file:'content/exercises/partitivos.json',expected:44}` **SIN slug** (shape distinta del reporter) + comentario de cierre→372; `node --test` **128/128 PASS**. **Lockstep 44==44==44 verificado; TOTAL_EXPECTED 372==suma==372.** PART-01 cubierto. **EXPECTED (no defecto):** `node scripts/run-validation-271.mjs` → exit 1 SOLO porque los 44 partitivos siguen `status:pending` (la tabla del reporter confirma found=44==expected=44, missing=0, disputed=0; único sub-gate fallando VAL-06 328/372 pending=44). El green gate (exit 0) lo cierra 12-05 vía quórum; NO se intentó forzar exit 0 (imposible hasta 12-05). 0 deviations. Stopped at: Completed 12-04-PLAN.md. Resume file: None. Siguiente: Plan 12-05 (validación por quórum DeepSeek Pro + Opus 4.7; FLAG doble-validez 034/036 heredado de 12-02/12-03).
- **Fecha:** 2026-05-28 — Plan 12-03 completado (continuación tras checkpoint Task 3 human-verify APROBADO sin cambios de contenido): bloque match sustantivo↔forma partitiva (partitivos-038/039, D-08 — pareo por género+disparador+número; 038 5 pares/4 distintos, 039 5 pares/3 distintos; R3 ≥3 distintas + D-66 dups) + bloque clasificación PART-05 partitivo-vs-preposizione articolata (partitivos-040..044, solo formas di-based, sin bridge, explanation remite la función prepositiva a Preposiciones). **FINAL N=44** fijado en `content/exercises/partitivos.json` (42 multiple-choice + 2 match), todos `status: pending`, `categoryIds:["partitivos"]`, ids únicos, fixture validator exit 0. **DEVIATION ACEPTADA (3 opciones en PART-05):** el schema validator `validateMultipleChoicePayload` exige 3-4 opciones + slot `___`; las 2 opciones literales de D-05 fallarían → PART-05 usa 3 opciones `["partitivo","preposición","artículo determinativo"]` (3ª = meta-distractor del `il` dentro de `del`) + arrow convention `___`; modificar el validador sería Rule 4 out-of-scope (fase content-only); author proxy ACEPTÓ. **NOTA (no defecto):** correctIndex=0 en las 42 MC es irrelevante por D-181 (engine permuta opciones con Math.random no-seedable al render; el quórum valida en aislamiento). Commits: Task 1 `2cfb6f3`, Task 2 `4c37490`. PART-05/06 cubiertos. **HANDOFF 12-04 lockstep N=44:** categories.json order 9 YA presente (verificar NO re-añadir, c415487); reporter `run-validation-271.mjs` TOTAL_EXPECTED 328→**372** + entry CATEGORIES `{slug:'partitivos',file:'content/exercises/partitivos.json',expected:44}`; test CATEGORIES_WITH_EXPLANATIONS `{file:'content/exercises/partitivos.json',expected:44}`. **12-05:** los 44 entran al quórum; FLAG doble-validez heredado de 12-02 (034/036 afirmativa-omisión marcan ∅ como wrong, D-02 by design, autor es oráculo; negativas 035/037 inequívocas); match + PART-05 sin flags conocidos. Stopped at: Completed 12-03-PLAN.md. Resume file: None. Siguiente: Plan 12-04 (integración 3-count lockstep N=44).
- **Fecha:** 2026-05-28 — Plan 12-02 completado (continuación tras checkpoint Task 3 human-verify APROBADO): bloque base multiple-choice de Partitivos en `content/exercises/partitivos.json` — 37 ejercicios (partitivos-001..037), todos `validation.status: "pending"`, `categoryIds:["partitivos"]`, ids únicos, JSON parsea, fixture validator exit 0. Reparto: del-formas 001-026 (incontable del/dello/della/dell' + contable dei/degli/delle, cada forma respuesta correcta en >=1 ejercicio + pares de contraste verbo-constante), alternativas por restricción gramatical 027-033 (qualche+singular / un po' di+incontable / alcuni-alcune+plural), mini-bloque omisión 034-037 (opción literal `∅ / sin partitivo`). Commits: Task 1 `c415487` (+ categories.json entry partitivos order 9, deviation Rule-3), Task 2 `780bf64`, corrección del revisor `e30e225` (partitivos-010 reframeado: bug double-di `voglia di`+`della` → "A pranzo cucino ___ pasta al pomodoro"). PART-03/04/06 cubiertos. **Carry-forward 12-03:** conteo ya en 37 → target FINAL N <= 44 (techo verify), añadir modesto (~1-2 match + ~4-5 PART-05) y FIJAR el N. **FLAG doble-validez para quórum 12-05:** partitivos-034 y 036 (afirmativa omisión) marcan ∅ como wrong aunque el partitivo afirmativo es OPCIONAL (D-02 by design); el autor es oráculo al resolver disputas (negativas 035/037 inequívocas). **12-04:** categories.json entry YA presente (verificar, NO re-añadir) + bump reporter TOTAL_EXPECTED 328+N + línea CATEGORIES_WITH_EXPLANATIONS cuando 12-03 fije N. Stopped at: Completed 12-02-PLAN.md. Resume file: None. Siguiente: Plan 12-03 (match sustantivo↔forma partitiva + clasificación PART-05; fija N final).
- **Fecha:** 2026-05-28 — Plan 12-01 completado: temario exhaustivo del partitivo redactado (commit `04db148`) y APROBADO por el autor en el checkpoint human-verify. El autor aplicó UNA corrección gramatical antes de aprobar (commit `9b5a15a`): el frame del §Espejo `"C'è ___"` → `"Ho preso ___"` (c'è es singular y produciría el agramatical "C'è dei libri"; "Ho preso dello zucchero / Ho preso dei libri" mantiene el verbo constante y es gramatical). PART-02 satisfecho; orden temario-antes-de-ejercicios verificable en git (no existe `content/exercises/partitivos.json`, D-13). **Carry-forward para 12-02/12-03:** contable plural usa verbo plural (Ci sono / Ho preso / Vedo...), NUNCA "C'è ___ [plural]"; mismo verbo a ambos lados del contraste incontable↔contable. Stopped at: Completed 12-01-PLAN.md. Resume file: None. Siguiente: Plan 12-02 (bloque base multiple-choice: del-formas + alternativas + omisión + explanations).
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
