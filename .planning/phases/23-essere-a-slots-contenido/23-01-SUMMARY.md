---
phase: 23-essere-a-slots-contenido
plan: 01
subsystem: contenido-editorial
tags: [essere, slots, variantes, reagrupacion, passato-prossimo, cruces-multi-cat]
requires:
  - "schemaVersion 9 (Phase 21: migrate8to9, reset selectivo de las 6 categorías)"
  - "motor slot+variantes v1.4 (normalizeExerciseToSlot, validateContent payload XOR variants[])"
  - "23-REAGRUPACION-MAP.md aprobado por el autor (Task 1, commit 208ad51)"
provides:
  - "content/exercises/essere.json reescrito a slot+variantes (25 slots, payload eliminado)"
  - "Estructura final de slots de Essere que 23-03 sincroniza contra data.exercises.length"
affects:
  - "23-02 (autoría de variantes nuevas + slots de huecos sobre estos 25 slots)"
  - "23-03 (sync de los 3 hardcodes de count 39 -> N real tras 23-02)"
tech-stack:
  added: []
  patterns:
    - "Reagrupación a slot+variantes por regla (espejo de 22-01/19-01/20-01)"
    - "DIVERGENCIA #1 vs Avere: passato prossimo en 4 slots SEPARADOS por concordancia (D-23-03)"
    - "DIVERGENCIA #2 vs Avere: Essere NO tiene snapshot APPEND-ONLY (no aplica re-base D-88)"
key-files:
  created: []
  modified:
    - "content/exercises/essere.json"
decisions:
  - "io-sono (001) y loro-sono (007) = 2 slots distintos por persona (25 slots total)"
  - "Bloque por regla = 5 slots separados (identidad/nacionalidad/profesión/stato/cópula) — NO fundir"
  - "essere-e = 1 slot con 2 variantes (003+004), base 003 + matiz concordancia fem de 004"
  - "Passato prossimo = 4 slots SEPARADOS (stato/stata/stati/state) — NO fundir (D-23-03)"
  - "Snapshot NO aplica (scripts avere-only); no se corrió ningún script de snapshot/assert"
  - "Merges de explanation = bases 010/013/016/020/024 + matices injertados (D-23-10)"
metrics:
  duration: "~10 min"
  completed: "2026-06-08"
  tasks: 2
  files: 1
---

# Phase 23 Plan 01: Essere a slots — reagrupación + reescritura del JSON Summary

Los 39 ejercicios reales de Essere reagrupados en **25 slots por regla** en `essere.json` (slot+variantes, sin payload), con el passato prossimo partido en 4 slots separados por concordancia y los 6 cruces multi-categoría intactos — validateContent verde.

## Qué se hizo

**Task 1 (mapa de reagrupación)** — YA COMPLETADO en sesión previa (commit `208ad51`); no rehecho. El checkpoint:decision que siguió fue **resuelto por el autor: "aprobado", opción `por-regla-passato-4-slots` (39 ids → 25 slots)**.

**Task 2 (reescritura de `essere.json`)** — commit `f0b3f68`:
- **Presente indicativo por persona/forma (D-23-02, 6 slots):** `essere-sono` (001, io), `essere-sei` (002, tu), `essere-e` (003+004, lui/lei — 2 variantes), `essere-siamo` (005, noi), `essere-siete` (006, voi), `essere-sono-loro` (007, loro). io-sono y loro-sono quedan como 2 slots distintos (decisión del autor en el checkpoint).
- **Bloque por regla (D-23-01, 5 slots):** `essere-identidad` (009/010/011), `essere-nacionalidad` (013/014/015), `essere-profesion` (012/016/017/018/019), `essere-stato` (008/020/021/022/023), `essere-copula` (024/025). Explanations mergeadas (D-23-10) con base + matices injertados.
- **Passato prossimo (D-23-03, 4 SLOTS SEPARADOS por concordancia):** `essere-passato-prossimo-stato` (026), `-stata` (027), `-stati` (028), `-state` (029). DIVERGENCIA deliberada frente a Avere (que fue 1 slot con N variantes); cada explanation enfatiza la concordancia género/número del participio de essere.
- **Word-buttons (D-23-12, 4 slots-de-1):** `essere-wb-identidad` (100), `-nacionalidad` (101), `-profesion` (102), `-passato` (103). Sin match (Essere no tiene — no se inventó).
- **Cruces multi-cat (D-23-09, 6 slots-de-1):** `essere-300..305` con id ESTABLE + `categoryIds` de 2 ids intactos. Cascada D-54 y `clearedExerciseIds` de las categorías cruzadas preservados.
- `payload` eliminado de todos; superficies movidas intactas a `variants[]`; `validation.passes[]` verbatim; distractoras essere/avere preservadas; apóstrofes ASCII; sin smart-quotes.

## Criterio de merge de validation (D-23-11)

Los 39 ejercicios fuente llevaban el quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6` ambas `correcta`. Para slots multi-variante, el `validation` top-level se tomó del ejercicio cuya superficie domina la base del slot (003 para `essere-e`; 010, 013, 016, 020, 024 para los slots de bloque). Las superficies se movieron INTACTAS → no se re-validó (cambio de contenedor). El concern C4-explanation de 008 (verdict `correcta`, NO invalida) no sube al slot porque 008 es variante NO-base de `essere-stato` (base 020); su matiz pedagógico (negación + estado con essere) sí se injertó en la explanation del slot. Sin pérdida de información validada.

## Snapshot / re-base D-88: NO APLICA a Essere

Essere **NO tiene** blindaje APPEND-ONLY. Los scripts `snapshot-avere-prefix.mjs` / `assert-avere-prefix-unchanged.mjs` están hardcodeados a `avere.json` (0 refs a essere) y no existe `.essere-prefix-snapshot.json`. **No se ejecutó ni creó ningún script/archivo de snapshot.** Esta columna de Phase 22 desaparece en Phase 23 — no se replicó la tarea de re-base de 22-01/22-02.

## Verificación

- `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` → exit 0, **25 ejercicios**.
- con payload: 0 · slots sin explanation: 0 · variantes con explanation: 0
- cruces: 6 con 2 cats: 6 · passato slots: stata/state/stati/stato (4 separados)
- wb: 4 · match: 0 · essere-only mal-cat: 0 · ids únicos: true · colisión 300-305: 0
- smart-quotes: 0 matches · `.essere-prefix-snapshot.json`: no existe (correcto)

## Rojo esperado (NO se arregla aquí — es 23-03)

Los 3 hardcodes de count de Essere siguen en `39` mientras el real es ahora `25`:
- `tests/fixtures/slot-variants-integration.test.js:168` → `{ slug: 'essere', expected: 39 }`
- `scripts/run-validation-271.mjs:103` → `{ slug: 'essere', ... expected: 39 }`
- `tests/exercise-types.test.js:1271` → `{ file: '...essere.json', expected: 39 }`

Esto es **rojo a propósito**: 23-03 los sincroniza contra `data.exercises.length` REAL tras 23-02 (las variantes nuevas no suben el count; los slots NUEVOS de 23-02 — p.ej. slot ser/estar D-23-07 — sí). NO se tocan en este plan.

## Deviations from Plan

None — plan ejecutado exactamente como escrito (mapa aprobado tal cual, opción recomendada). El scan de acentos sobre las superficies/explanations movidas no detectó defectos legacy (el legacy ya viene con acentuación correcta y apóstrofes ASCII).

## Self-Check: PASSED

- content/exercises/essere.json → FOUND (25 slots, validateContent exit 0)
- commit f0b3f68 (Task 2) → FOUND
- commit 208ad51 (Task 1, sesión previa) → FOUND
