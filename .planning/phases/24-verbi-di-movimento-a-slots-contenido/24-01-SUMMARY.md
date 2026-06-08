---
phase: 24-verbi-di-movimento-a-slots-contenido
plan: 01
subsystem: content
tags: [verbos-movimiento, slots, passato-prossimo, auxiliar-essere, concordancia, json-content]

# Dependency graph
requires:
  - phase: 23-essere-a-slots-contenido
    provides: patrón slot+variantes canónico (essere.json) — shape de slot, variants[], explanation/validation top-level, slots-de-1 word-buttons
  - phase: 16
    provides: motor slot-aware que consume el shape variants[]
provides:
  - verbos-movimiento.json reagrupado a slot+variantes (37 superficies fuente -> 7 slots por REGLA DE AUXILIAR)
  - mapa de reagrupación auditado y aprobado por el autor (24-REAGRUPACION-MAP.md)
  - estructura de slots que fija el conteo real (7) que sincronizan los tests de 24-03
affects: [24-02, 24-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Slot por REGLA DE AUXILIAR (D-24-01): eje organizador propio de Verbi di movimento, distinto del slot-por-persona de Avere/Essere (aquí es passato prossimo, no presente)"
    - "Concordancia en UN solo slot (D-24-03): divergencia deliberada vs Essere (que separó stato/a/i/e en 4 slots) — el drilling fuerte se reserva al auxiliar"
    - "Slot propio para verbo alternante (correre, D-24-04): aislado de las excepciones puras avere porque alterna según destino"

key-files:
  created:
    - .planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md
  modified:
    - content/exercises/verbos-movimiento.json

key-decisions:
  - "Eje organizador = REGLA DE AUXILIAR essere-vs-avere (D-24-01), NO por persona ni por verbo (aprobado por el autor)"
  - "Concordancia del participio en UN solo slot con 12 variantes (D-24-03), NO 4 slots como Essere"
  - "correre en slot PROPIO (D-24-04) separado de las excepciones puras avere"
  - "032 (discriminación verbo+aux) ubicado en el slot verbos-movimiento-essere (confirmado por el autor)"
  - "026 asignado al slot essere por la regla del reparto (options son formas de essere/avere = elige-auxiliar)"
  - "validation top-level de cada slot = la de la base verbatim; disputed->override 011/024/026 conservados en historial del id, no se re-validan (D-24-11)"
  - "Verbi di movimento NO tiene snapshot APPEND-ONLY ni cruces multi-cat (avere-only) -> NO se replica re-base D-88 (D-24-14)"

patterns-established:
  - "Reparto de pares aux-vs-participio verificado contra las options reales: formas de essere/avere -> slot essere; terminaciones -o/-a/-i/-e -> slot concordanza"
  - "Distractoras essere/avere preservadas en cada variante (son el contraste que entrena la regla)"

requirements-completed: [MOV-01]

# Metrics
duration: ~15min
completed: 2026-06-08
---

# Phase 24 Plan 01: Reagrupación de Verbi di movimento a slots por regla de auxiliar Summary

**37 superficies de Verbi di movimento reagrupadas a 7 slots por la REGLA DE AUXILIAR (essere-vs-avere en passato prossimo), con la concordancia agrupada en un solo slot y correre aislado en slot propio.**

## Performance

- **Duration:** ~15 min (post-checkpoint)
- **Completed:** 2026-06-08
- **Tasks:** 2 (Task 1 mapa + checkpoint:decision aprobado; Task 2 reescritura JSON)
- **Files modified:** 1 (verbos-movimiento.json) + 1 creado en Task 1 (mapa)

## Accomplishments

- `verbos-movimiento.json` reescrito de 37 ejercicios payload-based a 7 slots slot+variantes:
  - `verbos-movimiento-essere` (14 vars) — selección del auxiliar essere; explanation lidera con el anti-calco "io ho andato"
  - `verbos-movimiento-concordanza` (12 vars, UN solo slot D-24-03) — matriz género×número del participio con essere, varios verbos
  - `verbos-movimiento-excepcioni-avere` (6 vars) — movimiento sin destino -> avere + participio invariable (viaggiare/nuotare/camminare/ballare)
  - `verbos-movimiento-correre` (2 vars, slot PROPIO D-24-04) — "¿hay destino? con destino essere, sin destino avere"
  - 3 word-buttons slots-de-1 (`wb-andare`, `wb-viaggiare`, `wb-uscire`)
- Todas las 37 superficies fuente movidas verbatim a `variants[]` (14+12+6+2+1+1+1 = 37), payload eliminado de todos
- `validateContent` verde (7 ejercicios), 0 smart-quotes, apóstrofes ASCII preservados (l'anno, quest'anno, un'ora)
- ids TODOS semánticos, `categoryIds=["verbos-movimiento"]` en todos, sin cruces 300..305, sin slot type:match

## Task Commits

1. **Task 1: Mapa de reagrupación auditable** - `448a6ae` (docs) — committeado antes del checkpoint
2. **Task 2: Reescribir verbos-movimiento.json a slot+variantes** - `9920f5f` (feat)

**Plan metadata:** este SUMMARY (docs)

_Checkpoint:decision entre Task 1 y Task 2: el autor aprobó la opción `por-regla-auxiliar-concordanza-1-slot` (recomendada/locked)._

## Files Created/Modified

- `content/exercises/verbos-movimiento.json` - Reescrito a 7 slots slot+variantes (sin payload, explanation top-level por slot, variantes sin explanation propia, validation de la base verbatim)
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md` - Mapa de auditoría (Task 1, aprobado por el autor)

## Decisions Made

- **Eje por regla de auxiliar (D-24-01)** confirmado por el autor: la trampa A1 de esta categoría es la decisión del auxiliar, no la conjugación de persona (aquí es passato prossimo).
- **Concordancia en 1 solo slot (D-24-03)**: divergencia deliberada vs Essere. La concordancia ya se drillea forma-por-forma en Essere; aquí se agrupa para reservar el drilling fuerte al auxiliar.
- **032 al slot essere** y **026 al slot essere**: ambos confirmados por el autor (sus options son formas de essere/avere = elige-auxiliar).
- **Criterio de merge de validation**: la validation top-level de cada slot multi-variante = la de la base (001/008/017/021), quórum limpio Opus+Sonnet. Los disputed->override del autor de 011/024/026 (C5-leak participio insinúa essere, override autor mantiene) NO suben a la validation top-level del slot (la base 001 tiene quórum limpio); se conservan en el historial conceptual del id fuente pero las superficies se mueven intactas sin re-validar (D-24-11). Sin pérdida pedagógica: el matiz par-complementario ya lo cubre la regla del slot.
- **Sin snapshot, sin cruces (D-24-14)**: Verbi di movimento no tiene blindaje APPEND-ONLY (scripts snapshot-/assert-avere-prefix son avere-only, 0 refs) ni cruces multi-cat (no existen verbos-movimiento-300..305). NO se replicó la re-base D-88 de Avere ni se creó `.verbos-movimiento-prefix-snapshot.json`.

## Deviations from Plan

None - plan executed exactly as written. El mapa propuesto en Task 1 fue aprobado verbatim por el autor en el checkpoint:decision (opción recomendada/locked), incluido el reparto de pares aux-vs-participio, la ubicación de 032 y 026, y el criterio de merge de validation.

## Issues Encountered

None.

## Test count rojo ESPERADO (se arregla en 24-03)

`node --test tests/*.test.js` deja **1 test en rojo a propósito**:

```
not ok 1 - 37/37 ejercicios con explanation válida
    Esperaba 37 ejercicios en content/exercises/verbos-movimiento.json, encontré 7
not ok 52 - Categorías con explanation coverage (Phase 7.1+)
# tests 374 # pass 373 # fail 1
```

El conteo `37` está hardcodeado en los tests (legacy 34 MC + 3 wb); tras la reagrupación hay **7 slots reales**. Este rojo es **esperado y deliberado** — los counts NO se tocan en 24-01. Se sincronizan en **24-03** contra el `data.exercises.length` REAL **final** (tras los slots/variantes nuevos de 24-02). NO arreglar el count aquí. Resto de la suite verde (373/374).

## Notas para 24-02 / 24-03

- **Conteo de slots de esta reagrupación: 7.** 24-02 puede subir el count con slots NUEVOS de huecos (D-24-06); las variantes nuevas NO suben el count. 24-03 lee el valor real final, no la predicción rough del CONTEXT.
- **4 ejes de huecos priorizados (D-24-06)** anotados en el mapa: (a) más verbos essere; (b) más excepciones avere; (c) más test-de-destino en correre; (d) matriz de concordancia completa. Cada candidata debe verificar el auxiliar real del verbo (quórum cross-vendor R1-R7 en 24-02).
- **No aplica re-base D-88** (sin snapshot, sin cruces): documentado arriba.

## Next Phase Readiness

- `verbos-movimiento.json` en shape slot+variantes válido, listo para que 24-02 engorde slots/añada huecos por quórum.
- Único blocker conocido: el count rojo (esperado), que cierra 24-03.

## Self-Check: PASSED

- FOUND: content/exercises/verbos-movimiento.json (validateContent OK, 7 slots, 37 variants)
- FOUND: .planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md
- FOUND commit: 448a6ae (Task 1 mapa)
- FOUND commit: 9920f5f (Task 2 reescritura JSON)

---
*Phase: 24-verbi-di-movimento-a-slots-contenido*
*Completed: 2026-06-08*
