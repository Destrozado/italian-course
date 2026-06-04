---
phase: 19-articoli-a-slots-contenido
plan: 01
subsystem: content
tags: [articoli, slots, variants, json, content-rewrite, anti-memorizacion]

# Dependency graph
requires:
  - phase: 17-piloto-preposiciones-contenido
    provides: "patron canonico slot+variantes (preposiciones.json), merge de explanation D-17-05, slot-de-1"
  - phase: 16
    provides: "motor que consume el shape slot+variantes; loader normalizeExerciseToSlot; schema-validator"
provides:
  - "articoli.json reescrito a slot+variantes (32 slots, payload eliminado, explanation top-level por slot)"
  - "19-REAGRUPACION-MAP.md auditado por el autor (mapa id-fuente→slot, rango 300..305 reservado)"
affects: [19-02, 19-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "slot+variantes con explanation top-level (D-15-02); variantes flat sin explanation propia"
    - "split por sub-disparador en lo/gli (D-19-02) — un slot por cada trampa fonetica"
    - "type:match como slot-de-1 (primer uso real; preposiciones no tenia match)"

key-files:
  created:
    - .planning/phases/19-articoli-a-slots-contenido/19-REAGRUPACION-MAP.md
  modified:
    - content/exercises/articoli.json

key-decisions:
  - "D-19-02 locked (Opcion A): split por sub-disparador en lo/gli — 16 determinativi"
  - "validation por slot = passes[] del/los ejercicio(s) fuente (todos comparten quorum deepseek-v4-flash + claude-opus-4-7, 2026-05-27); criterio: conservar el quorum identico de las superficies fusionadas"
  - "ids 049/050 conservados como id-slot (no renumerados) para trazabilidad del match"
  - "cruces 300..305 con id ESTABLE + 2 categoryIds intactos (D-19-04) — no romper clearedExerciseIds"

patterns-established:
  - "Reagrupacion legacy→slot mueve superficies INTACTAS a variants[] (cambio de contenedor, sin re-validacion)"
  - "explanation mergeada elegir-la-mas-completa + injertar matices (D-17-05), sin reescritura total"

requirements-completed: [ART-01, ART-03]

# Metrics
duration: ~15min
completed: 2026-06-04
---

# Phase 19 Plan 01: Articoli a slots (contenido) Summary

**articoli.json reescrito de 56 ejercicios legacy `payload` a 32 slots `slot+variantes`: 16 determinativi (lo/gli split por sub-disparador), 8 indeterminativi como slots propios, 2 match slots-de-1 y 6 cruces con id estable, todos con explanation top-level mergeada (D-17-05) y validateContent verde.**

## Performance

- **Duration:** ~15 min (agente de continuación; Task 1 ya completado por agente previo)
- **Completed:** 2026-06-04
- **Tasks:** 2/2 (Task 1 heredado de agente previo; checkpoint:decision aprobado por el autor; Task 2 ejecutado aquí)
- **Files modified:** 1 (`content/exercises/articoli.json`)

## Accomplishments
- **Reagrupación 56→32:** las 56 superficies fuente (54 MC + 2 match) se mueven INTACTAS a `variants[]` repartidas en 32 slots; sin re-validación (cambio de contenedor).
- **Split por sub-disparador (D-19-02):** la serie lo/gli queda con un slot por trampa fonética (lo+s-cons, lo+z, lo+ps, lo+gn, lo+x; gli+s-cons, gli+z, gli+ps, gli+gn, gli+vocal) → el motor re-verifica cada celda.
- **Formas invariables agrupadas (D-17-01):** `la`, `le`, `una` quedan como un slot multi-variante cada una, con contrastes masc/fem injertados en la explanation.
- **Indeterminativi como slots propios (ART-03):** 8 slots con `categoryIds=["articoli"]` (no categoría nueva).
- **Match y cruces:** 049/050 como slots-de-1 `type:match`; 300..305 con id estable + 2 categoryIds intactos (no rompe `clearedExerciseIds` de genero-numero/sustantivos-irregulares).
- **explanation top-level mergeada (D-17-05):** cada slot multi-variante usa la base más completa del grupo + matices injertados de las descartadas; slots-de-1 suben su explanation tal cual.

## Task Commits

1. **Task 1: Producir el mapa de reagrupación auditable** - `2dd3b9f` (docs) — *heredado de agente previo, verificado presente*
2. **Task 2: Reescribir articoli.json a slot+variantes** - `21a3df1` (feat)

**Checkpoint:decision** (aprobar el mapa) resuelto por el autor: APROBADO Opción A (split por sub-disparador, D-19-02 locked), 32 slots, merges y celdas pobres confirmados.

## Files Created/Modified
- `content/exercises/articoli.json` - reescrito a slot+variantes: 32 slots, payload eliminado, explanation top-level por slot, variantes flat sin explanation propia, apóstrofes ASCII U+0027 preservados.
- `.planning/phases/19-articoli-a-slots-contenido/19-REAGRUPACION-MAP.md` - mapa de auditoría (creado en Task 1).

## Decisions Made
- **validation por slot:** se conserva el `passes[]` de los ejercicios fuente. Todas las superficies fusionadas comparten el MISMO quórum (`deepseek-v4-flash` + `claude-opus-4-7`, fecha `2026-05-27`, verdict `correcta`, concerns vacíos), así que el slot resultante hereda ese par de passes sin ambigüedad. Criterio: como las superficies se mueven intactas y su quórum es idéntico, no hay que combinar ni elegir entre passes divergentes.
- **ids 049/050:** se mantienen como id-slot (no se renumeran a id semántico) por claridad de trazabilidad del match, según el mapa aprobado.
- **explanation merges:** aplicado exactamente como el mapa: base = la fuente más general/completa; matices injertados = contrastes masc/fem (la zia vs lo zio; un amico vs un'amica), pitfalls del hispanohablante (il studente, el psicólogo), reglas de elisión solo-singular.

## Deviations from Plan

None - plan executed exactly as written. Las superficies se movieron intactas (sin tocar prompts/options/correctIndex/pairs), por lo que NO se generó ninguna superficie nueva que requiera quórum en 19-02.

## Issues Encountered

**Rojo esperado en tests (NO un fallo):** el count hardcoded `expected: 56` de Articoli en `tests/exercise-types.test.js:1273` ahora falla (`32 !== 56`), porque la reagrupación reduce de 56 ejercicios a 32 slots. Esto es ESPERADO y documentado por el plan: el count se sincroniza contra el conteo REAL final en 19-03 (tras añadir variantes nuevas y huecos en 19-02). El resto de la suite pasa (127/128). Los mismos counts 56 hardcoded existen también en `tests/fixtures/slot-variants-integration.test.js:174` y `scripts/run-validation-271.mjs:81` — NO tocados aquí (alcance de 19-03).

## Verificación (acceptance criteria Task 2)
- `validate-content-fixture articoli` → exit 0, 32 slots
- con payload: 0 | slots sin explanation: 0 | variantes con explanation: 0
- cruces: 6 con 2 cats: 6 | match slots: 2
- sin smart-quotes (0 matches) | articoli-only con id 30x: 0 (rango reservado respetado)
- 56 superficies fuente → 56 variantes (54 MC + 2 match), cobertura 1:1
- apóstrofe ASCII U+0027 presente (113), no-ASCII apóstrofe: 0

## Next Phase Readiness
- **19-02:** listo para autorar variantes nuevas que engorden las celdas pobres (lo+ps/gn/x, gli+s-cons/z/ps/gn, uno+s-cons/z/ps/gn) y materializar los huecos `y`/`i+vocal` (D-19-06), todo vía quórum cross-vendor.
- **19-03:** sincronizará el count REAL final (32 + nuevos de 19-02) en los 3 sitios hardcoded.
- Sin blockers.

## Self-Check: PASSED
- FOUND: content/exercises/articoli.json
- FOUND: 19-REAGRUPACION-MAP.md
- FOUND: 19-01-SUMMARY.md
- FOUND commit: 2dd3b9f (Task 1)
- FOUND commit: 21a3df1 (Task 2)

---
*Phase: 19-articoli-a-slots-contenido*
*Completed: 2026-06-04*
