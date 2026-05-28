---
phase: 12-partitivos
plan: 03
subsystem: content
tags: [partitivos, italian, match, multiple-choice, classification, PART-05, json-content]

# Dependency graph
requires:
  - phase: 12-02
    provides: "Bloque base multiple-choice (partitivos-001..037) en content/exercises/partitivos.json — conteo de partida N=37; categories.json entry partitivos order 9 (c415487)"
  - phase: 11-03
    provides: "Patrón del bloque match (articoli-049/050) calcado para el match sustantivo↔forma partitiva"
provides:
  - "Bloque match sustantivo↔forma partitiva (partitivos-038/039) — pareo por género+disparador+número (DESIGN RULE D-08), NO por raíz"
  - "Bloque de clasificación PART-05 partitivo vs preposizione articolata (partitivos-040..044) — solo formas di-based, sin bridge, explanation que remite la función prepositiva a Preposiciones"
  - "FINAL N=44 de content/exercises/partitivos.json fijado (42 multiple-choice + 2 match) — número canónico de lockstep para 12-04"
affects: [12-04, 12-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Clasificación meta-lingüística con slot ___ (arrow convention 'frase -> Aquí X funciona como ___') para satisfacer el schema validator del engine sin tocarlo"
    - "Match con duplicados textuales en columna derecha (D-66) + ≥3 valores distintos (R3)"

key-files:
  created: []
  modified:
    - "content/exercises/partitivos.json (APPEND: partitivos-038/039 match + partitivos-040..044 clasificación PART-05; N 37→44)"

key-decisions:
  - "FINAL N=44 fijado (37 base + 2 match + 5 clasificación) — exactamente el techo ≤44 del verify; 12-04 lo propaga en lockstep a los 3 puntos de integración"
  - "Clasificación PART-05 usa 3 opciones ['partitivo','preposición','artículo determinativo'] en vez de las 2 literales de D-05 — adaptación in-scope al schema validator del engine (3-4 opciones + slot ___ obligatorios); NO se modifica el validador (out of scope, content-only phase). Author proxy ACEPTÓ"
  - "Las 5 clasificaciones se listan correct-first (correctIndex=0) con orden de opciones variado entre ejercicios; irrelevante por D-181 (el engine permuta opciones con Math.random no-seedable al render)"

patterns-established:
  - "Clasificación de función con slot ___ + meta-distractor: tercera opción nombra el componente literal ('artículo determinativo' = el 'il' dentro de 'del'), no una clase fantasma"
  - "Match partitivo: pareo por (género + disparador fonético + número), consistente con articoli-049/050"

requirements-completed: [PART-05, PART-06]

# Metrics
duration: 2min
completed: 2026-05-28
---

# Phase 12 Plan 03: Match sustantivo↔forma partitiva + clasificación PART-05 Summary

**Cierra el contenido de Partitivos en N=44: bloque match sustantivo↔forma partitiva (D-08) + 5 ejercicios de clasificación partitivo-vs-preposizione articolata (PART-05), todos `status: pending` para el quórum de 12-05.**

## Performance

- **Duration:** ~2 min (continuación de finalización; el contenido se autoría en la sesión previa antes del checkpoint)
- **Started:** 2026-05-28 (handoff post-checkpoint APROBADO)
- **Completed:** 2026-05-28
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify aprobado)
- **Files modified:** 1 (content/exercises/partitivos.json)

## Accomplishments

- **Bloque match (partitivos-038/039)** — sustantivo↔forma partitiva, pareo por género+disparador+número (DESIGN RULE D-08, NO por raíz). 038: 5 pares, 4 formas distintas (del/dello/dell'/della). 039: 5 pares, 3 formas distintas (dei/degli/delle). Ambos ≥3 distintas (R3), con duplicados textuales intencionales (D-66: vino→del, amici→degli, case→delle). Explanation enseña que la forma depende de género+disparador fonético+número (mismos disparadores que el artículo, del = di + il).
- **Bloque clasificación PART-05 (partitivos-040..044)** — 5 ejercicios `multiple-choice` que obligan a distinguir función PARTITIVA ("algo de": 040 "Ho mangiato del pane", 042 "delle mele", 044 "dell'acqua") de función PREPOSITIVA ("de el": 041 "Il sapore del caffè", 043 "La casa del nonno"). Ambas clases presentes (3 partitivo + 2 preposición). Solo formas di-based (del/delle/dell'). Sin bridge (categoryIds=["partitivos"]). Explanation remite la función prepositiva a la categoría Preposiciones sin re-enseñarla.
- **FINAL N=44 fijado** — content/exercises/partitivos.json en su forma de contenido final (solo falta el flip de validation status en 12-05).

## Task Commits

Tareas auto committeadas atómicamente (autoría en sesión previa al checkpoint):

1. **Task 1: Bloque match sustantivo↔forma partitiva (D-08)** — `2cfb6f3` (feat)
2. **Task 2: Clasificación PART-05 + fija N=44** — `4c37490` (feat)
3. **Task 3: Checkpoint human-verify** — APROBADO por el author proxy sin cambios de contenido (no genera commit de código)

**Plan metadata:** este SUMMARY + STATE.md + ROADMAP.md (docs commit de finalización)

## Files Created/Modified

- `content/exercises/partitivos.json` — APPEND de partitivos-038/039 (match) + partitivos-040..044 (clasificación PART-05); conteo 37→44. Todos `categoryIds:["partitivos"]`, `validation:{status:"pending",passes:[]}`, ids únicos, ningún id en rango 300. Fixture validator exit 0.

## ⚠️ FINAL N = 44 — HANDOFF LOCKSTEP PARA 12-04

`content/exercises/partitivos.json` queda en **N = 44** (42 multiple-choice + 2 match = 37 base + 2 match + 5 clasificación). Es exactamente el techo ≤44 del verify de la fase. **El plan 12-04 debe propagar N=44 en lockstep a los 3 puntos de integración:**

| Punto de integración | Acción de 12-04 | Estado actual (verificado en disco) |
|----------------------|-----------------|-------------------------------------|
| `content/categories.json` | **VERIFICAR, NO re-añadir** | Entry `{"id":"partitivos","name":"Partitivos","order":9}` YA presente (12-02 `c415487`, deviation Rule-3) |
| `scripts/run-validation-271.mjs` | `TOTAL_EXPECTED` **328 → 372** (+44) + nueva entry en array `CATEGORIES`: `{ slug: 'partitivos', file: 'content/exercises/partitivos.json', expected: 44 }` | `TOTAL_EXPECTED = 328` (línea 81); array `CATEGORIES` tiene articoli expected:56, falta partitivos |
| `tests/exercise-types.test.js` | Nueva línea en `CATEGORIES_WITH_EXPLANATIONS`: `{ file: 'content/exercises/partitivos.json', expected: 44 }` (D-144) | `CATEGORIES_WITH_EXPLANATIONS` (línea 1265) tiene articoli expected:56, falta partitivos |

## Decisions Made

- **FINAL N=44** — conteo de partida 37 (post-12-02) + 2 match (D-08) + 5 clasificación (PART-05). Modesto, dentro del techo ≤44. Cobertura del temario completa (cada celda ≥1 ejercicio).
- **Clasificación PART-05 con 3 opciones (no 2)** — ver Deviations §1.
- **correctIndex=0 en las 42 MC** — ver Issues Encountered (no es defecto).

## Deviations from Plan

### Deviaciones aceptadas (decisión de diseño documentada y aprobada por author proxy)

**1. [Rule 4 — Architectural avoided] Clasificación PART-05 usa 3 opciones en vez de las 2 literales del plan/D-05**
- **Found during:** Task 2 (autoría de la clasificación PART-05)
- **Issue:** El plan y D-05 especifican `options: ["partitivo","preposición"]` (2 opciones, grading por índice). Pero el schema validator del engine (`src/data/schema-validator.js` → `validateMultipleChoicePayload`) **exige 3-4 opciones y un slot `___` en el prompt**. La shape literal de 2 opciones de D-05 fallaría la validación del schema.
- **Decisión:** Como Phase 12 es **content-only** y NO debe modificar el validador (modificar el validador para admitir 2 opciones sería un cambio arquitectónico = out of scope, Rule 4), PART-05 (040-044) usa **3 opciones** `["partitivo","preposición","artículo determinativo"]` donde la tercera es un **meta-distractor** que nombra el componente literal (el `il` dentro de `del`), más un **slot `___` de clasificación** vía arrow convention (`"frase -> Aquí 'del' funciona como ___"`), convención ya usada en profesiones.json / genero-numero.json. **El author proxy ACEPTÓ esta adaptación como la correcta solución in-scope.** Una shape literal de 2 opciones requeriría un cambio de schema (Rule 4, fuera de scope).
- **Files modified:** content/exercises/partitivos.json (040-044)
- **Verification:** fixture validator exit 0; las 5 son `multiple-choice` con `options` que incluyen 'partitivo' + variante de 'preposición'; ambas clases presentes (3 partitivo, 2 preposición).
- **Committed in:** `4c37490` (Task 2)

---

**Total deviations:** 1 (adaptación de diseño aceptada; sin auto-fixes Rule 1/2/3 necesarios). El bloque match no tuvo deviaciones.
**Impact on plan:** La adaptación a 3 opciones preserva el objetivo pedagógico de PART-05 (clasificar función partitiva vs prepositiva) respetando el invariante de "no tocar el engine". Sin scope creep. El author proxy revisó y aprobó sin cambios de contenido.

## Issues Encountered

**Nota (NO es defecto): las 42 multiple-choice tienen `correctIndex=0`.**
Esto es funcionalmente seguro porque el engine aplica una permutación `Math.random` **no-seedable** a las opciones en el render (D-181, `src/screens/app.js`) — la posición de la respuesta correcta es irrelevante por diseño, y el quórum (12-05) valida cada ejercicio en aislamiento. La distribución variada de articoli es ahora redundante dada D-181. (El autor puede redistribuir más tarde si lo desea — puramente estilístico.)

**Nota: match dentro de la norma validada de articoli.**
038 (5 pares, 4 distintos, 1 dup) y 039 (5 pares, 3 distintos) — ambos ≥3 distintos, DESIGN-RULE compliant (pareo por género+disparador+número, no por raíz); consistente con los articoli-049/050 validados (6-7 pares).

## User Setup Required

None — no se requiere configuración de servicios externos.

## Next Phase Readiness

- **12-04 (integración 3-count lockstep):** N=44 fijado y registrado arriba con los 3 targets exactos. categories.json ya presente (verificar, no re-añadir); reporter TOTAL_EXPECTED 328→372 + CATEGORIES entry expected:44; test CATEGORIES_WITH_EXPLANATIONS expected:44.
- **12-05 (validación por quórum):** los 44 ejercicios están `status: pending`. **FLAG doble-validez heredado de 12-02:** partitivos-034 y 036 (afirmativa omisión) marcan ∅ como wrong aunque el partitivo afirmativo es OPCIONAL (D-02 by design; el autor es oráculo al resolver disputas; negativas 035/037 inequívocas). El bloque match + clasificación PART-05 de este plan entra al quórum sin flags conocidos (author proxy aprobó: match dentro de norma articoli; PART-05 inequívoco con la frase + flecha desambiguando función).

## Self-Check: PASSED

- FOUND: `.planning/phases/12-partitivos/12-03-SUMMARY.md`
- FOUND commit `2cfb6f3` (Task 1 match block)
- FOUND commit `4c37490` (Task 2 PART-05 classification + N=44)
- content/exercises/partitivos.json: N=44 verified, fixture validator exit 0, all `status: pending`, all `categoryIds:["partitivos"]`, ids unique.

---
*Phase: 12-partitivos*
*Completed: 2026-05-28*
