---
phase: 25-genere-e-numero-a-slots-contenido
plan: 01
subsystem: contenido-editorial
tags: [genero-numero, slot-variantes, conversion, morfologia]
requires:
  - "Phase 21 migracion 8->9 (reset selectivo de genero-numero, progreso vivo limpio)"
  - "Motor slot+variantes v1.4 (normalizeExerciseToSlot, pickVariantIndex, getter slot-aware, sampler por slot, cascada D-54) — NO tocado"
provides:
  - "genero-numero.json en shape slot+variantes (12 slots, 40 superficies en variants[])"
  - "25-REAGRUPACION-MAP.md auditado y aprobado (artefacto de auditoria 40 ids -> 12 slots)"
affects:
  - "tests/exercise-types.test.js (count hardcode 40 -> rojo esperado, lo sincroniza 25-03)"
  - "tests/fixtures/slot-variants-integration.test.js (count hardcode 40 -> rojo esperado)"
  - "scripts/run-validation-271.mjs (count + TOTAL_EXPECTED -> rojo esperado)"
tech-stack:
  added: []
  patterns:
    - "slot+variantes: explanation top-level por slot + variants[] shallow (MC {prompt,options,correctIndex} | match {prompt,pairs})"
    - "merge de explanations elegir-la-mas-completa + injertar matices (D-25-07), rule-first"
    - "duplicados literales colapsados a variantes del mismo micro-slot (D-25-01)"
    - "match preservado por D-04/D-25-03 (articulo-por-sonido no derivable por raiz)"
key-files:
  created:
    - ".planning/phases/25-genere-e-numero-a-slots-contenido/25-01-SUMMARY.md"
  modified:
    - "content/exercises/genero-numero.json (40 ejercicios payload -> 12 slots variants[])"
decisions:
  - "12 slots (granularidad FINA D-25-01): 5 plural (o-i, a-e, e-i, co-chi, invariabili) + 3 femenino (o-a, trice, essa) + 1 articolo-suono MC + 1 articolo-plurale-logo (037 slot propio, opcion A) + 2 match (singolare 207+208, plurale 209)"
  - "Criterio de validation top-level en slots multi-variante = validation de la BASE elegida en el mapa (no fusion de passes[]); superficies movidas intactas, no re-validadas (D-25-08)"
  - "037 (lo psicologo->psicologi) -> slot propio articolo-plurale-logo (opcion A aprobada): es -go->-gi SIN h, distinto de co-chi (con h)"
metrics:
  duration: "~12 min"
  completed: "2026-06-08"
  tasks: 2
  files: 1
---

# Phase 25 Plan 01: Genere e numero a slots (reagrupacion + reescritura del JSON) Summary

Los 40 ejercicios legacy de Genere e numero (37 MC + 3 match, todos con `payload`) reagrupados y reescritos a **12 slots** en shape slot+variantes con granularidad FINA (1 slot por micro-regla, D-25-01); las 40 superficies movidas intactas a `variants[]`, `payload` eliminado, explanations rule-first mergeadas a nivel de slot, 3 match preservados type:match (D-25-03/D-04); `validateContent` verde.

## What Was Built

**Task 1 (ya hecho por el ejecutor previo, commit `c487390`):** `25-REAGRUPACION-MAP.md` — mapa de auditoria 40 ids -> 12 slots, aprobado por el autor en el checkpoint:decision (granularidad FINA, 6 duplicados colapsados, 037 a slot propio opcion A, 3 match en 2 slots, sin snapshot/cruces/word-buttons).

**Task 2 (commit `f74b458`):** `content/exercises/genero-numero.json` reescrito a 12 slots:

| Slot | type | variantes (ids fuente) |
|------|------|------------------------|
| `genero-numero-plurale-o-i` | MC | 3 (001, 011, 013) |
| `genero-numero-plurale-a-e` | MC | 3 (002, 012, 014) |
| `genero-numero-plurale-e-i` | MC | 4 (015, 016, 017, 018) |
| `genero-numero-plurale-co-chi` | MC | 7 (003, 030, 004, 031, 005, 032, 029) |
| `genero-numero-invariabili` | MC | 5 (008, 035, 033, 034, 036) |
| `genero-numero-femminile-o-a` | MC | 4 (019, 020, 021, 022) |
| `genero-numero-femminile-trice` | MC | 4 (006, 023, 024, 025) |
| `genero-numero-femminile-essa` | MC | 4 (007, 028, 026, 027) |
| `genero-numero-articolo-suono` | MC | 2 (009, 010) |
| `genero-numero-articolo-plurale-logo` | MC | 1 (037) |
| `genero-numero-match-articolo-singolare` | match | 2 (207, 208) |
| `genero-numero-match-articolo-plurale` | match | 1 (209) |

Total: 37 variantes MC + 3 variantes match = 40 superficies (todas las fuente). ids TODOS semanticos, `categoryIds: ["genero-numero"]` en los 12 slots.

## Verification Evidence

- `node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json` -> **exit 0, 12 ejercicios**
- con payload: **0** · slots sin explanation: **0** · variantes con explanation: **0**
- match slots: **2** todos con `variants[].pairs: true` (PRESERVADOS, no convertidos a MC)
- slot `invariabili`: **1** (caffè/città/università/film) · word-buttons: **0** · cruces 300-305: **0** · mal-cat: **0**
- micro-reglas de plural SEPARADAS (o-i, a-e, e-i, co/go): los 4 `true`; femenino (trice/essa): `true`
- refs a la CATEGORIA Articoli (id o prosa): **0** (D-25-02)
- smart-quotes: **0** (grep `[‘’“”]` sin matches) · apostrofes ASCII U+0027 preservados (l'amico, l'attore)
- acentos italianos preservados verbatim: caffè/città/università `true`
- snapshot: NO existe `.genero-numero-prefix-snapshot.json` (avere-only, D-25-10) — NO se ejecuto ningun script de snapshot/assert
- categorias vecinas intactas: avere OK, articoli OK

## Criterio de merge de validation (D-25-08)

`validation` top-level de cada slot multi-variante = la de la BASE elegida en el mapa (todas quorum limpio claude-opus-4-7 + claude-sonnet-4-6, 2026-05-27). Las superficies se movieron INTACTAS -> no se re-validaron. El disputed->override del autor de 006 (Sonnet [C5-leak] formato flecha -> override correcta) es de POLITICA sobre el formato flecha (ya cubierto por la regla del slot `femminile-trice`); su slot toma la validation de la base 025 (quorum limpio) sin perdida pedagogica. Slots-de-1 (`articolo-plurale-logo` <- 037, `match-articolo-plurale` <- 209): validation del unico fuente verbatim.

## Genere e numero: NO aplica snapshot / cruces / word-buttons

Documentado por D-25-10: los scripts `snapshot-avere-prefix.mjs` / `assert-avere-prefix-unchanged.mjs` son avere-only (hardcoded a `avere.json`, 0 refs a genero-numero); no existe `.genero-numero-prefix-snapshot.json`. NO se replica la tarea de re-base D-88. El set legacy NO tiene cruces multi-cat (no hay genero-numero-300..305) ni word-buttons (0 en legacy) -> no se crearon.

## Deviations from Plan

None — plan ejecutado exactamente como escrito (mapa aprobado tal cual, opcion A para 037, 2 match slots). Task 1 no rehecho (commit previo `c487390` verificado).

## Rojo esperado (NO arreglado aqui — es 25-03)

`node --test tests/*.test.js` -> **373 pass / 1 fail**. El unico fail es el count hardcodeado de genero-numero (Esperaba 40, encontre 12) en `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js` y `scripts/run-validation-271.mjs` (+ `TOTAL_EXPECTED`). Es el rojo ESPERADO documentado en el plan; lo sincroniza 25-03 contra `data.exercises.length` real (= 12; delta de fase = -40 + nuevos slots de 25-02). NO se tocan counts aqui.

## Known Stubs

None — los 12 slots tienen contenido real movido del legacy; las celdas pobres (articolo-suono 2 vars, articolo-plurale-logo 1 var, match-plurale 1 var) son candidatas a engorde en 25-02 (documentadas en el mapa, ejes D-25-04), NO stubs sin datos.

## Self-Check: PASSED

- FOUND: content/exercises/genero-numero.json (12 slots, validateContent exit 0)
- FOUND: .planning/phases/25-genere-e-numero-a-slots-contenido/25-01-SUMMARY.md
- FOUND commit c487390 (Task 1) · FOUND commit f74b458 (Task 2)
