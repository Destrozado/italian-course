---
phase: 20-partitivi-a-slots-contenido
plan: 01
subsystem: content
tags: [partitivos, slots, content-conversion, brownfield]
requires:
  - "Phase 18 (migrate7to8 — reset selectivo articoli+partitivos; ids renumerables sin progreso vivo)"
  - "motor slot+variantes v1.4 (normalizeExerciseToSlot, validateContent, smoke bifurcado por shape)"
provides:
  - "content/exercises/partitivos.json en shape slot+variantes (17 slots, payload eliminado)"
  - "20-REAGRUPACION-MAP.md auditado/aprobado (44 ids fuente -> 17 slots, 1:1)"
affects:
  - "tests/exercise-types.test.js (count hardcoded 44 -> rojo esperado hasta 20-03)"
  - "tests/fixtures/slot-variants-integration.test.js (count 44 -> sync en 20-03)"
  - "scripts/run-validation-271.mjs (TOTAL_EXPECTED -> sync en 20-03)"
tech-stack:
  added: []
  patterns:
    - "slot+variantes (payload XOR variants[]; explanation top-level por slot; variantes sin explanation propia)"
    - "merge de explanation D-17-05 (elegir-la-mas-completa + injertar matices/pitfalls del hispanohablante)"
    - "absorcion de pares de contraste D-01 por correctIndex real (D-20-05)"
key-files:
  created:
    - ".planning/phases/20-partitivi-a-slots-contenido/20-REAGRUPACION-MAP.md (Task 1, agente previo)"
  modified:
    - "content/exercises/partitivos.json (44 ejercicios legacy -> 17 slots)"
decisions:
  - "D-20-01..07, D-17-01, D-17-05 aplicados tal cual el mapa aprobado; granularidad locked split-por-subdisparador"
  - "validation por slot: heredar passes[] de las superficies fuente (mismo quorum deepseek-v4-pro + claude-opus-4-7 / 2026-05-28)"
  - "slot de negativa: ademas porta el pass 'autor' override (D-02) heredado de partitivos-036"
metrics:
  duration: "~10 min (continuacion, Task 2)"
  completed: "2026-06-05"
  tasks: 2
  files: 2
---

# Phase 20 Plan 01: Partitivi a slots (contenido) Summary

Reagrupacion de los 44 ejercicios reales de Partitivi al modelo slot+variantes del motor v1.4: 17 slots (10 del-formas split por sub-disparador, 3 alternativas, 1 negativa de contraste con `∅`, 1 clasificacion MC de 3 opciones, 2 match), payload eliminado, explanations mergeadas a nivel de slot, validateContent verde.

## What Was Built

- **Task 1 (agente previo, commit `bf8ba9b`):** `20-REAGRUPACION-MAP.md` — mapa de auditoria id-fuente -> slot, cobertura 44 ids 1:1, con el correctIndex REAL de los pares D-01 leido del JSON. Aprobado por el autor en el checkpoint:decision ("aprobado", granularidad locked `split-por-subdisparador`).
- **Task 2 (este agente, commit `42fb532`):** `content/exercises/partitivos.json` reescrito de 44 ejercicios legacy `payload` a **17 slots** `slot+variantes` segun el mapa aprobado.

### Slots resultantes (17)

| Bloque | Slots | ids-fuente cubiertos |
|--------|-------|----------------------|
| Del-formas (D-20-01) | 10 | 001-026 (incl. pares D-01 absorbidos 023/024/025/026) |
| Alternativas (D-20-02) | 3 | 027-033 (qualche / un-po-di / alcuni-alcune) |
| Negativa de contraste (D-20-03) | 1 | 034-037 (con `∅ / sin partitivo`) |
| Clasificacion (D-20-04) | 1 | 040-044 (MC de 3 opciones) |
| Match (D-20-06) | 2 | 038, 039 (slots-de-1 type:match) |

Del-formas: `del-cons` (5 variantes, incl. 023), `dello-z` (3, incl. 025), `dello-scons` (1), `della-cons` (3), `dell-vocal` (3), `dei-cons` (4, incl. 026), `degli-scons` (1), `degli-vocal` (1), `degli-z` (1), `delle-invariable` (4, incl. 024). Las 44 superficies (42 MC + 2 match) movidas INTACTAS a `variants[]` (cambio de contenedor -> sin re-validacion). Cada slot multi-variante con explanation top-level mergeada (D-17-05): base la mas completa + injertados los matices y pitfalls del hispanohablante (genero de `latte`, `qualche` siempre singular, contraccion di+articolo, asimetria afirmativa/negativa, particion partitivo vs preposizione articolata). ids semanticos libres, `categoryIds=["partitivos"]` (0 cruces, D-20-07).

## Verification

- `node scripts/validate-content-fixture.mjs partitivos content/exercises/partitivos.json` -> **exit 0** (17 slots)
- con payload: **0** | slots sin explanation: **0** | variantes con explanation: **0** | cats no-partitivos: **0**
- match slots: **2** | total slots: **17** | `∅` count: **5** (>=2 requerido; 035/037 correctas + distractoras en 034/036/044... — preservado verbatim) | smart-quotes: **0**
- clasificacion: 5 variantes, todas con **3 opciones** (no rellenadas a 4)
- apostrofes ASCII U+0027 en `dell'`: 28 ocurrencias; smart-apostrophe U+2019 en `dell`: 0
- scan de acentos sobre superficies movidas (WR-01/WR-02): sin defectos legacy (no `piu`/`perche`/`caffe` desnudos; `caffè`/`tè`/`è` intactos)
- Suite completa `node --test tests/*.test.js`: **357/358** — el unico rojo es el count hardcoded de Partitivi (`tests/exercise-types.test.js:1274` `expected: 44`, `actual: 17`). **ROJO ESPERADO**, se sincroniza en 20-03 (NO se arregla aqui por instruccion del plan).

## Criterio de validation por slot

Cada slot hereda el `validation` (status `validated` + `passes[]`) de sus ejercicios fuente, que comparten todos el mismo quorum cross-vendor **deepseek-v4-pro + claude-opus-4-7 (2026-05-28)**. El slot `partitivos-negativa` ademas porta el tercer pass **`autor` override (D-02)** heredado de `partitivos-036`, reescrito para referirse a la variante dentro del slot (la opcion `∅` es gramaticalmente valida en "Ho amici a Roma" pero no es la idiomatica que D-02 ensena; `degli` se mantiene correcta). Ninguna superficie se reformulo -> ninguna requiere re-validacion (D-17-07).

## Deviations from Plan

None — plan ejecutado exactamente como el mapa aprobado. Ninguna superficie tocada, ningun defecto de acento legacy hallado, ninguna variante nueva autorada (eso es 20-02), ningun count de tests sincronizado (eso es 20-03).

## Conteo final pendiente

17 slots resultan de SOLO esta reagrupacion. El conteo NO incluye los slots de huecos de del-formas (dello+gn/ps/x, degli+gn/ps; D-19-06) ni el engorde de celdas pobres (`dello-scons` 007, `degli-scons` 017, `degli-vocal` 018, `degli-z` 019 — todas con 1 variante hoy), que se autoran en 20-02. El conteo REAL final (que sincroniza 20-03) se determina tras 20-02.

## Self-Check: PASSED

- FOUND: content/exercises/partitivos.json (17 slots, exit 0)
- FOUND: .planning/phases/20-partitivi-a-slots-contenido/20-REAGRUPACION-MAP.md
- FOUND commit bf8ba9b (Task 1)
- FOUND commit 42fb532 (Task 2)
