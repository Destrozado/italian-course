---
phase: 17-piloto-preposiciones-contenido
plan: 02
subsystem: content
tags: [preposiciones, slot-variantes, content-json, validateContent, A1]

# Dependency graph
requires:
  - phase: 17-01
    provides: reset selectivo del progreso de Preposiciones (migración 6→7), que permite renumerar ids sin romper estado
  - phase: 15
    provides: shape slot+variantes en schema-validator.js (payload XOR variants[], explanation top-level)
  - phase: 16
    provides: motor que consume slots y elige 1 variante por slot en cada examen
provides:
  - preposiciones.json reescrito a 47 slots (de 52 ejercicios fuente) en shape slot+variantes
  - 4 slots fusionados con explanation mergeada (D-17-05): SUL (3v), AL (2v), DI-posesso (2v), TRA-futuro (2v, tra/fra)
  - esquema de id semántico limpio (preposiciones-{forma|regla})
  - fact correction 57→52 en REQUIREMENTS.md y ROADMAP.md
affects: [17-03, 17-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reagrupación de contenido a slot+variantes: superficies movidas INTACTAS de payload a variants[] (cambio de contenedor → no re-validación)"
    - "explanation de slot fusionado = base más completa + matices injertados (D-17-05), sin reescritura total"
    - "validation top-level de slot fusionado = passes[] del ejercicio cuya superficie/explanation domina (todas validated por las mismas IAs)"

key-files:
  created: []
  modified:
    - content/exercises/preposiciones.json
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "tra/fra fusionados (tra-fra-fusion aprobado por el autor): 1 slot preposiciones-tra-futuro con 2 variantes, bajo D-17-01 (misma regla pedagógica = tempo futuro)"
  - "validation de slots fusionados: status validated conservado + passes[] del ejercicio dominante (no se duplican passes por variante; todas las superficies fuente ya estaban validated por opus-4-7/sonnet-4-6 en 2026-05-26)"
  - "esquema de id semántico limpio (D-15-09): preposiciones-{forma} para articolate, preposiciones-{regla} cuando la forma sola sería ambigua (di-origen/di-posesso/di-materia)"

patterns-established:
  - "Patrón Before/After de fusión real: payload eliminado, su {prompt,options,correctIndex} migrado intacto a variants[], explanation subida a top-level del slot"

requirements-completed: [PILOT-01]

# Metrics
duration: 18min
completed: 2026-06-03
---

# Phase 17 Plan 02: Reescritura de Preposiciones a slot+variantes Summary

**Los 52 ejercicios de Preposiciones reagrupados en 47 slots por regla/forma (shape slot+variantes), con 4 slots fusionados de explanation mergeada (SUL 3v, AL 2v, DI-posesso 2v, TRA-futuro 2v) y fact correction 57→52 — validateContent verde.**

## Performance

- **Duration:** ~18 min
- **Completed:** 2026-06-03
- **Tasks:** 1 (Task 2; Task 1 + checkpoint completados en sesión previa)
- **Files modified:** 3

## Accomplishments
- `preposiciones.json` reescrito: 52 ejercicios payload → 47 slots con `variants[]` + `explanation` top-level (payload eliminado en los 47).
- 5 fusiones aplicadas según el mapa aprobado: SUL (006/013/043 → 3 variantes), AL (011/015 → 2 variantes), DI-posesso (010/012 → 2 variantes), TRA-futuro (008/049 → 2 variantes, tra/fra fusionados). El resto = singletons (1 variante).
- Las 4 explanations fusionadas siguen D-17-05 (base más completa + matices injertados), sin smart-quotes, sin HTML, sin markdown (T-17-04 satisfecho).
- Cobertura 1:1 verificada: los 52 ids fuente mapeados sin pérdida ni duplicado (T-17-05).
- Fact correction 57→52 en REQUIREMENTS.md (PILOT-01) y en las 3 referencias de la sección Phase 17 de ROADMAP.md.

## Task Commits

1. **Task 1: Producir el mapa de reagrupación auditable** - `c1e54cc` (docs, sesión previa)
2. **Checkpoint:decision tra/fra** - APROBADO por el autor: `tra-fra-fusion` → 47 slots
3. **Task 2: Reescribir preposiciones.json a slot+variantes + fact correction 57→52** - `e75073a` (feat)

## Files Created/Modified
- `content/exercises/preposiciones.json` - Reescrito de 52 ejercicios payload a 47 slots slot+variantes (payload eliminado, variants[] + explanation top-level por slot).
- `.planning/REQUIREMENTS.md` - PILOT-01: "57 ejercicios" → "52 ejercicios".
- `.planning/ROADMAP.md` - 3 referencias "57 ejercicios" de la sección Phase 17 → "52".

## Decisions Made
- **tra/fra fusionados** (opción `tra-fra-fusion`, aprobada por el autor en el checkpoint): un solo slot `preposiciones-tra-futuro` con 2 variantes. La explanation base = la de 049 (la más completa: descarta Da/In/Per + nota eufónica tra/fra ante 'tr-'), injertando de 008 la afirmación explícita de que tra y fra son sinónimos intercambiables.
- **Criterio de `validation` en slots fusionados:** se conserva `status: "validated"` y un único bloque `passes[]` (el del ejercicio cuya superficie/explanation domina la base elegida). Justificación: las superficies fuente de cada fusión estaban TODAS validadas por las mismas IAs (claude-opus-4-7 + claude-sonnet-4-6, 2026-05-26), y como las superficies se mueven intactas (sin cambio de texto) no requieren re-validación. No se duplican passes por variante para no inflar metadata redundante.
- **Singletons:** la explanation existente sube a top-level tal cual; la `validation` del ejercicio se preserva intacta (incluido preposiciones-da-encasade, validado por opus-4-8 el 2026-05-29).

## Deviations from Plan

None - plan executed exactly as written. Las superficies se movieron intactas (sin cambios de texto, NFC preservado), las fusiones siguieron el mapa aprobado y las explanations mergeadas respetaron D-17-05.

## Issues Encountered
None.

## Rojo esperado en tests (a sincronizar en 17-04 — NO arreglar aquí)

Esta reescritura reduce el conteo de Preposiciones de 52 (ejercicios) a 47 (slots), por lo que los 3 hardcodes `expected: 52` quedan en ROJO a propósito. Se sincronizan en 17-04 contra el conteo final real (tras 17-03, que añade slots locativos + variantes nuevas):

- `tests/exercise-types.test.js:1266` — `{ file: 'content/exercises/preposiciones.json', expected: 52 }`
- `tests/fixtures/slot-variants-integration.test.js:169` — `{ slug: 'preposiciones', expected: 52 }`
- `scripts/run-validation-271.mjs:75` — `{ slug: 'preposiciones', ..., expected: 52 }`

El validador de contenido en sí (`scripts/validate-content-fixture.mjs preposiciones …`) **pasa verde** (47 slots, shape slot+variantes válido). El rojo es exclusivamente de los count-asserts hardcodeados, no del shape.

## Verificación (acceptance criteria)

- `node scripts/validate-content-fixture.mjs preposiciones content/exercises/preposiciones.json` → exit 0 ("OK validación: 47 ejercicio(s)").
- con payload: **0** | slots sin explanation: **0** | variantes con explanation: **0**.
- SUL variantes: **3** | AL variantes: **2** | DI-posesso variantes: **2** | TRA-futuro variantes: **2**.
- ids únicos: **true** (47 slots).
- `grep "57 ejercicios"` en ROADMAP.md + REQUIREMENTS.md → **0 matches**.
- T-17-04 scan: 0 HTML tags, 0 smart-quotes, 0 markdown markers (los `__` detectados son el placeholder `___` del prompt, no markup), 0 strings no-NFC.

## Next Phase Readiness
- **17-03 (PILOT-02/03):** la base de 47 slots queda lista para que 17-03 autore variantes nuevas (quórum cross-vendor) y añada los slots locativos `in spiaggia`/`al mare` (Bloque C del mapa, OUT OF SCOPE de este plan).
- **17-04 (PILOT-05):** debe sincronizar los 3 hardcodes `expected: 52` contra el conteo final real (post-17-03) y bifurcar el smoke paramétrico por shape (slot vs payload).

## Self-Check: PASSED

- FOUND: content/exercises/preposiciones.json
- FOUND: .planning/phases/17-piloto-preposiciones-contenido/17-02-SUMMARY.md
- FOUND commit: e75073a (Task 2)
- FOUND commit: c1e54cc (Task 1)
