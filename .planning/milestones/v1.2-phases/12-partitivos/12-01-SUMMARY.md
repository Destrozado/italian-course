---
phase: 12-partitivos
plan: 01
subsystem: content
tags: [italian, partitivo, temario, a1, planning-doc]

# Dependency graph
requires:
  - phase: 11-articoli
    provides: "11-TEMARIO-ARTICOLI.md como modelo de documento (estructura forma×disparador, tabla de conteo derivado, bloque Convenciones, espejo pedagógico); disparadores fonéticos heredados (del = di + il)"
provides:
  - "Temario exhaustivo del partitivo (.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md) — checklist de cobertura estructurado sobre el eje incontable↔contable"
  - "Enumeración de las 7 formas del partitivo determinativo (del/dello/della/dell'/dei/degli/delle) × disparador fonético + las 3 alternativas por restricción gramatical (qualche/un po' di/alcuni-alcune)"
  - "Mini-bloque de omisión afirmativa↔negativa (opción ∅) + sección de distinción partitivo vs preposizione articolata (PART-05)"
  - "Conteo derivado orientativo ~30-40 ejercicios (D-09), SIN fila de bridges (D-14) — fuente única del conteo para 12-02/12-03"
affects: [12-02-base-multiple-choice, 12-03-match-clasificacion, 12-04-integracion, 12-05-validacion]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Temario-antes-de-ejercicios verificable en git (D-13): el doc de planificación precede a content/exercises/*.json — mismo patrón que cerró Phase 11"
    - "Temario estructurado sobre el eje semántico de la categoría (incontable↔contable), no sobre la división morfológica — reorientación del modelo det/indet de Articoli"

key-files:
  created:
    - .planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md
  modified: []

key-decisions:
  - "Frame del §Espejo corregido de 'C'è ___' a 'Ho preso ___' — c'è es singular y produciría el agramatical 'C'è dei libri' en la cara contable-plural; 'Ho preso dello zucchero / Ho preso dei libri' mantiene el verbo constante a través del contraste y es gramatical"
  - "Carry-forward para 12-02/12-03: los ejercicios de contable plural deben usar un verbo que concuerde en plural (Ci sono / Ho comprato / Ho preso / Vedo...), NUNCA 'C'è ___ [plural]'; mantener el MISMO verbo a ambos lados de un par de contraste incontable↔contable"
  - "Preferencia menor de canon: preferir la forma elidida 'un po' d'acqua' sobre 'un po' di acqua' donde lea más natural (ambas aceptables en A1)"

patterns-established:
  - "Eje semántico primero: el temario fija la decisión '¿esto se cuenta o no?' (incontable↔contable) ANTES de la decisión fonética (¿qué forma de del-?) — el espejo es el corazón de la categoría"
  - "Alternativas como trampa por restricción gramatical (no por sinonimia): qualche+singular, un po' di+incontable, alcuni/alcune+plural; la restricción blinda contra >1 respuesta correcta en multiple-choice por índice (D-03)"
  - "Distinción de función con restricción locked a formas di-based (del/dello/della/dell'/dei/degli/delle): son las únicas que solapan con la preposizione articolata; nel/sul/al/dal/col quedan fuera (D-06)"

requirements-completed: [PART-02]

# Metrics
duration: 4min
completed: 2026-05-28
---

# Phase 12 Plan 01: Temario exhaustivo del partitivo Summary

**Temario de cobertura del partitivo italiano estructurado sobre el eje incontable↔contable — 7 formas del/dello/della/dell'/dei/degli/delle × disparador fonético heredado de Articoli + 3 alternativas por restricción gramatical + omisión en negativa + distinción partitivo/preposizione (PART-05), commiteado ANTES de cualquier ejercicio (D-13).**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-28T02:32:09+02:00 (Task 1 commit)
- **Completed:** 2026-05-28T00:36:16Z
- **Tasks:** 2 (1 auto + 1 checkpoint:human-verify aprobado)
- **Files modified:** 1 (12-TEMARIO-PARTITIVOS.md, creado)

## Accomplishments

- **Temario exhaustivo del partitivo** (`12-TEMARIO-PARTITIVOS.md`, 180 líneas) calcado de `11-TEMARIO-ARTICOLI.md` pero reorientado al eje semántico incontable↔contable (D-01) en vez de det/indet.
- **Regla nuclear documentada:** el partitivo determinativo = `di` + artículo determinativo, así que HEREDA los disparadores fonéticos de Articoli (D-04); `del = di + il` como ancla pedagógica — el partitivo se "construye encima" de Articoli, no se memoriza de cero.
- **Las 7 formas** (`del/dello/della/dell'/dei/degli/delle`) enumeradas con su disparador fonético y ≥1 sustantivo de ejemplo, repartidas en las secciones `## Incontable (singular)` y `## Contable (plural)`.
- **Las 3 alternativas** (`qualche`+singular, `un po' di`+incontable, `alcuni/alcune`+plural) tratadas como trampa por restricción gramatical con la justificación de doble-validez documentada (D-03).
- **Mini-bloque de omisión** afirmativa↔negativa con opción `∅ / sin partitivo` (D-02) y el matiz pedagógico clave (la dificultad real para el hispanohablante está en USAR el partitivo en afirmativa, no en omitirlo en negativa).
- **Sección de distinción partitivo vs preposizione articolata** (PART-05) con restricción locked a formas `di`-based (D-06) y la nota de que la función prepositiva vive en Preposiciones.
- **Tabla de conteo derivado** con total orientativo ~30-40 (D-09) y SIN fila de bridges (D-14).
- **Checkpoint human-verify APROBADO** por el autor — cobertura del temario confirmada; el orden temario-antes-de-ejercicios queda verificable en git.

## Task Commits

1. **Task 1: Redactar el temario exhaustivo del partitivo** — `04db148` (docs) — crea `12-TEMARIO-PARTITIVOS.md` (180 líneas)
2. **Task 2: Checkpoint human-verify (autor revisa y aprueba)** — APROBADO (`user_response: "approved"`). El autor aplicó UNA corrección gramatical antes de aprobar, commiteada por separado: `9b5a15a` (fix) — frame del §Espejo `"C'è ___"` → `"Ho preso ___"`.

**Plan metadata:** este SUMMARY + STATE.md + ROADMAP.md (docs: complete plan).

## Files Created/Modified

- `.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md` — temario exhaustivo de cobertura del partitivo: regla nuclear + incontable + contable + alternativas + trampas canónicas + espejo + omisión + distinción PART-05 + fuera de alcance + conteo derivado. Checklist de cobertura del que se derivan los ejercicios de 12-02/12-03.

## Decisions Made

- **§Espejo: `"C'è ___"` → `"Ho preso ___"` (corrección gramatical del autor, commit `9b5a15a`).** `c'è` es singular y produciría el agramatical `"C'è dei libri"` en la cara contable-plural. `Ho preso dello zucchero` / `Ho preso dei libri` mantiene el verbo constante a través del contraste incontable↔contable y es gramatical en ambas caras.
- **Carry-forward para downstream (12-02 / 12-03) — LECCIÓN REAL:** los ejercicios de contable plural deben usar un verbo que concuerde en plural (`Ci sono` / `Ho comprato` / `Ho preso` / `Vedo`...), **NUNCA** `"C'è ___ [plural]"` — `c'è` es singular. Mantener el **mismo verbo** a ambos lados de un par de contraste incontable↔contable (p.ej. `Ho preso del pane` / `Ho preso dei libri`), para que el único cambio sea la cara semántica del partitivo, no el verbo.
- **Preferencia de canon menor:** preferir la forma elidida `un po' d'acqua` sobre `un po' di acqua` donde lea más natural (ambas aceptables en A1). El temario actual escribe `un po' di acqua`; al redactar ejercicios, la forma elidida es la preferida estéticamente sin ser obligatoria.

## Deviations from Plan

None - plan executed exactly as written. La única modificación del temario (frame del §Espejo) fue una corrección gramatical aplicada por el autor durante el checkpoint human-verify, no una desviación del executor; está registrada arriba como decisión y carry-forward.

## Issues Encountered

None. El temario se redactó calcando el modelo de Articoli y pasó el checkpoint human-verify con una sola corrección gramatical del autor (registrada). No hubo bloqueos ni auto-fixes de las reglas de desviación.

## User Setup Required

None - no external service configuration required (fase content-only, zero-deps invariant del proyecto).

## Next Phase Readiness

- **12-02 (base multiple-choice)** tiene el checklist de cobertura listo: del-formas incontable/contable + alternativas por restricción + mini-bloque de omisión. Debe mapear cada celda del temario a ≥1 ejercicio (PART-03/04/06). **Aplicar el carry-forward C'è→verbo-plural** al escribir los pares de contraste.
- **12-03 (match + clasificación)** tiene el bloque de match sustantivo↔forma y la sección de distinción PART-05 documentados; fijará el conteo final exacto N (~30-40 orientativo).
- **D-13 satisfecho y verificable:** el temario (`04db148`) precede a `content/exercises/partitivos.json` (que NO existe aún) en el historial git — mismo patrón que cerró Phase 11.
- Sin bridges (D-14): el conteo no lleva fila de bridges; PART-X1 diferido a v1.3+.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-partitivos/12-01-SUMMARY.md`
- FOUND: `.planning/phases/12-partitivos/12-TEMARIO-PARTITIVOS.md`
- FOUND: commit `04db148` (Task 1 — temario)
- FOUND: commit `9b5a15a` (grammar fix — §Espejo C'è→Ho preso)
- CONFIRMED: `content/exercises/partitivos.json` does NOT exist (D-13 order holds — temario precedes exercises in git)

---
*Phase: 12-partitivos*
*Completed: 2026-05-28*
