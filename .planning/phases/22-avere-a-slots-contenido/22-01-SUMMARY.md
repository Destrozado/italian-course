---
phase: 22-avere-a-slots-contenido
plan: 01
subsystem: contenido-editorial
tags: [avere, slots, slot+variantes, conversion, D-88, D-178, D-17-05, D-66]
requires:
  - Phase 21 (migración 8→9, reset selectivo de las 6 categorías — progreso de avere reseteado, renumeración de ids libre)
  - motor slot+variantes v1.4 (validateContent acepta payload XOR variants[]; normalizeExerciseToSlot; getter slot-aware)
provides:
  - "content/exercises/avere.json en formato slot+variantes (19 slots, 23 ids fuente 1:1)"
  - "blindaje APPEND-ONLY D-88 re-basado al estado slot+variantes (snapshot regenerado, assert exit 0)"
  - "22-REAGRUPACION-MAP.md (artefacto de auditoría aprobado por el autor)"
affects:
  - "22-02 (autoría de variantes nuevas: engorde de 6 celdas pobres de presente + idiomatismos + passato de otros verbos)"
  - "22-03 (sync de los 3 hardcodes de count 23→19 + TOTAL_EXPECTED)"
tech-stack:
  added: []
  patterns:
    - "reagrupación a slots por regla con explanation a nivel de slot (D-17-05 merge elegir-la-más-completa + injertar matices)"
    - "superficies movidas intactas a variants[] (cambio de contenedor → sin re-validación)"
    - "re-base deliberado del blindaje APPEND-ONLY D-88 (relax D-178 opción A)"
key-files:
  created:
    - .planning/phases/22-avere-a-slots-contenido/22-REAGRUPACION-MAP.md (Task 1, commit 46ab9e5)
  modified:
    - content/exercises/avere.json (Task 2, commit fda481b — 23 ejercicios legacy → 19 slots slot+variantes)
    - scripts/.avere-prefix-snapshot.json (Task 2 — re-basado al estado slot+variantes; gitignored, no trackeado)
decisions:
  - "Presente indicativo por persona = 6 slots-de-1 (avere-ho/hai/ha/abbiamo/avete/hanno), D-19-01: cada forma es una trampa de conjugación distinta"
  - "Sensación física idiomática (fame+caldo) = 1 slot avere-sensazioni con 2 variantes (D-17-01)"
  - "Passato prossimo con auxiliar avere = 1 slot avere-passato-prossimo con 4 variantes (D-17-01); validation preservada de 009 (disputed→override autor, C5-leak falso-positivo, canon D-02/MEMORY.md)"
  - "Cruces multi-cat avere-300..305 = 6 slots-de-1 con id ESTABLE + 2 categoryIds intactos (D-19-04/D-87)"
  - "RE-BASE del blindaje D-88 (relax D-178 opción A): snapshot regenerado al estado slot+variantes; el invariante se preserva sobre el nuevo ground truth, NO se ignora"
metrics:
  duration: "~1 sesión (continuación tras checkpoint aprobado)"
  completed: "2026-06-05"
  tasks_completed: 2
  slots_resultantes: 19
  ids_fuente: 23
---

# Phase 22 Plan 01: Avere a slots (reagrupación + re-base D-88) Summary

Reagrupación de los 23 ejercicios legacy de Avere en **19 slots slot+variantes** por regla (presente por persona + sensaciones + passato prossimo + word-buttons + match + cruces), con explanation a nivel de slot, payload eliminado, superficies movidas intactas, y re-base deliberado del blindaje APPEND-ONLY D-88.

## Qué se hizo

### Task 1 (ya completada antes del checkpoint — commit 46ab9e5)

Producido `22-REAGRUPACION-MAP.md`: tabla de auditoría que cubre los 23 ids fuente 1:1 → 19 slots, con explanation-base + matices a injertar por slot multi-variante, reserva del rango `avere-300..305`, y sección documentando el plan de re-base del blindaje D-88. **Verificada, no rehecha.**

Checkpoint:decision resuelto: el autor aprobó la opción `por-persona-plus-rebase` ("aprobado").

### Task 2 (commit fda481b) — reescritura de avere.json + re-base D-88

**(A) Reescritura a slot+variantes (19 slots):**

| Bloque | Slots | ids-fuente | type |
|--------|-------|-----------|------|
| Presente indicativo por persona (D-19-01) | 6 (`avere-ho/hai/ha/abbiamo/avete/hanno`) | 001-006 | multiple-choice |
| Sensación física idiomática (D-17-01) | 1 (`avere-sensazioni`, 2 variantes) | 007, 008 | multiple-choice |
| Passato prossimo con auxiliar avere (D-17-01) | 1 (`avere-passato-prossimo`, 4 variantes) | 009-012 | multiple-choice |
| Word-buttons (D-19-03) | 2 (`avere-wb-posesion/fame`) | 100, 101 | word-buttons |
| Match (D-19-03, D-66) | 3 (`avere-match-persone-1/2/3`) | 200, 201, 202 | match |
| Cruces multi-cat (D-19-04/D-87) | 6 (`avere-300..305`, id estable) | 300-305 | multiple-choice |
| **TOTAL** | **19** | **23 ids** | |

- `payload` eliminado de los 23 ejercicios; superficies **movidas intactas** a `variants[]` (cambio de contenedor → sin re-validación).
- `explanation` a nivel de slot, no por variante; las 17 superficies de slot-de-1 suben tal cual; las 2 multi-variante (sensaciones, passato) mergeadas D-17-05 (ver abajo).
- Los dos `ha` de `avere-match-persone-3` (202) preservados verbatim (D-66).
- Cruces `avere-300..305`: id estable + 2 categoryIds intactos (no rompe `clearedExerciseIds` ni la cascada D-54).
- Sin smart-quotes; scan de acentos sobre las superficies movidas (los prompts legacy ya estaban limpios; las explanations en español conservan su acentuación correcta).

**(B) Re-base del blindaje APPEND-ONLY D-88 (relax D-178 opción A):**

- Tras reescribir el JSON, `node scripts/snapshot-avere-prefix.mjs` regeneró `scripts/.avere-prefix-snapshot.json` capturando los 17 primeros slots del array nuevo.
- `node scripts/assert-avere-prefix-unchanged.mjs` vuelve a **exit 0** contra el nuevo ground truth.
- El invariante se **preserva** sobre el nuevo estado (los 17 primeros slots no cambian silenciosamente en el futuro), **no se ignora**. La conversión a slots supersede el invariante legacy de ids (Phase 21 ya reseteó el progreso de avere → renumeración libre).
- **Nota:** `scripts/.avere-prefix-snapshot.json` está gitignored (ground truth local del proceso, según su cabecera), por eso el re-base NO aparece como cambio trackeado en el commit fda481b; el re-base se ejecuta localmente y queda documentado aquí. El commit que materializa el re-base es **fda481b** (al reescribir avere.json, que es contra lo que el snapshot se regenera).

## Criterio de merge de validation (slot passato prossimo)

El slot `avere-passato-prossimo` **preserva el `validation` top-level de 009 tal cual**: status `validated` + 3 passes (opus `correcta`, sonnet `incorrecta` [C5-leak falso-positivo sobre explanation/notes], **autor `correcta` [override]**). 009 es la variante cuya explanation/superficie domina la base del slot. El override del autor es canon (D-02 / MEMORY.md: el C5-leak sobre explanation/notes es falso-positivo de política R1, limitado al prompt). NO se re-valida ninguna superficie (movidas intactas).

## Merge de explanations (D-17-05)

- **`avere-sensazioni`** — base = explanation de 008 (caldo, la más general: patrón "sensación térmica con avere"); injertados los matices de 007: lista de sensaciones (hambre/sed/frío) y el pitfall `estoy hambriento`→`sono affamato` vs `avere fame`.
- **`avere-passato-prossimo`** — base = explanation de 009 (transitivo + regla pedagógica "si lleva qualcosa detrás, auxiliar avere"); injertados: verbos de comunicación (010, `con` no cambia la regla), actividad física/corporal (011, pitfall essere por intuición), cognitivos (012, participio invariable con avere).
- Los 6 slots de presente por persona conservan sus matices del hispanohablante ya embebidos (edad con avere [003], raíz av- rota en abbiamo [004], h muda avete/hanno [005], hanno vs anno [006]).

## Deviations from Plan

None — el plan se ejecutó exactamente como estaba escrito (continuación tras checkpoint aprobado, opción `por-persona-plus-rebase`).

## Rojo esperado (NO arreglar aquí — es 22-03)

Los 3 hardcodes de count de avere (`expected: 23`) ahora quedan rojos porque hay 19 slots:
- `tests/exercise-types.test.js:1268` → `{ file: 'content/exercises/avere.json', expected: 23 }`
- `tests/fixtures/slot-variants-integration.test.js:167` → `{ slug: 'avere', expected: 23 }`
- `scripts/run-validation-271.mjs:95` → `{ slug: 'avere', ... expected: 23 }` (+ `TOTAL_EXPECTED = 323`)

Esto es **esperado por diseño** y se sincroniza al nº real de slots (tras 22-02) en el plan **22-03**. NO se tocan los counts en este plan (out-of-scope explícito en el PLAN).

## Verification

- `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` → exit 0 (`OK validación: 19 ejercicio(s)`)
- `node scripts/snapshot-avere-prefix.mjs` → exit 0 (17 slots capturados)
- `node scripts/assert-avere-prefix-unchanged.mjs` → exit 0 (D-88 re-basado, intacto)
- Acceptance criteria: payload=0, slots sin explanation=0, variantes con explanation=0, cruces=6 con 2 cats=6, match=3, wb=2, avere-only mal-cat=0, smart-quotes=0.

## Known Stubs

None — todos los slots tienen explanation top-level no vacía, variantes con superficie válida, y data real movida intacta del contenido legacy validado.

## Notas para 22-02

- 6 celdas pobres a engordar: los 6 slots de presente por persona (1 variante hoy).
- Huecos de regla: idiomatismos avere sete/freddo/sonno/ragione/anni (D-19-06); más verbos de passato prossimo.

## Self-Check: PASSED

- FOUND: `.planning/phases/22-avere-a-slots-contenido/22-01-SUMMARY.md`
- FOUND: `content/exercises/avere.json`
- FOUND commit 46ab9e5 (Task 1 — mapa)
- FOUND commit fda481b (Task 2 — reescritura + re-base D-88)
