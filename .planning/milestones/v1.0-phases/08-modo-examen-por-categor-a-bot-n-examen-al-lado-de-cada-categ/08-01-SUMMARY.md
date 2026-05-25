---
phase: 08
plan: 01
subsystem: home-dashboard / session-launch
tags: [examen, home, requestConfirm, buildFullTest, inFlightTest, picker-skip]
status: complete
completed: 2026-05-25
tests_pass: 209
requirements:
  - EXAM-01
  - EXAM-02
  - EXAM-03
  - EXAM-04
  - EXAM-05
dependency-graph:
  requires:
    - buildFullTest (Phase 2, D-50)
    - requestConfirm (Phase 2, D-27/D-43/D-44 — 6ª call-site)
    - persistInFlightTest (Phase 2, D-41/D-42)
    - clearInFlightTest (Phase 2, D-45)
    - categoriesForDisplay computed (Phase 2, D-29)
    - restartRepaso reset pattern (Phase 6, D-104)
  provides:
    - startExamen(categoryId) — entry point handler
    - _launchExamen(catId) — private launch helper
    - examenEnabled / examenTooltip — categoriesForDisplay extension
    - 6ª columna Examen en tabla home
  affects:
    - src/screens/app.js (insert startExamen + _launchExamen + extend computed)
    - index.html (add 6th column with <th> + <td> + button)
    - tests/screen-examen.test.js (new file)
tech-stack:
  added: []
  patterns: [presence-check-tests, helper-extraction-for-2-call-sites, conflict-D-44-clone]
key-files:
  created:
    - tests/screen-examen.test.js
    - .planning/phases/08-modo-examen-por-categor-a-bot-n-examen-al-lado-de-cada-categ/08-01-SUMMARY.md
  modified:
    - src/screens/app.js
    - index.html
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/STATE.md
decisions:
  - "Examen es 1-cat por diseño D-181 — la firma es startExamen(categoryId) singular, no plural. Multi-cat queda como deferred."
  - "_launchExamen extraído como helper privado — 2 call-sites (directo + onConfirm post-clearInFlightTest) justifican extracción wins on readability."
  - "confirmLabel 'Descartar y empezar' lockeado coherencia con openPicker D-44 línea 276 (análogo más directo); UI-SPEC sugería 'Continuar' originalmente — homogeneización de las 6 call-sites del helper diferida."
  - "Test file nuevo tests/screen-examen.test.js (Opción A PATTERNS.md §3 — per-feature consistency)."
  - "Reset SUPERSET completo heredado de restartRepaso (NO subset de startSession) — Examen puede venir de mid-match si conflict D-44 cancela un Test previo."
metrics:
  duration_min: 35
---

# Phase 8 Plan 01: Modo Examen por categoría Summary

Feature "Examen por categoría" entregado end-to-end en un único plan atómico: botón `Examen` por fila en la tabla home (6ª columna nueva) que arranca un Test completo de 1 cat directo con 1 click (salta picker, salta "Empezar"). Reutiliza buildFullTest D-50 + slot único inFlightTest D-182 + patrón D-44 como 6ª call-site del helper requestConfirm. Cero migración schemaVersion, cero CSS nuevo, cero módulos nuevos. EXAM-01..05 cerrados, milestone v1.0 ampliado con Modo Examen incremental.

## Executive Summary

- **Feature entregado:** click en `Examen` de cualquier fila home → si no hay Test completo activo → arranca sesión Test completo de SOLO esa categoría directamente. Si hay Test completo activo → confirm inline (6ª call-site D-44) con copy literal idéntica al openPicker.
- **D-181..D-192 honored:** lanzamiento directo (D-181), slot único compartido (D-182), copy genérica banner reanudar (D-183), 6ª columna en home (D-184), etiqueta plana `Examen` (D-185), sin confirmación previa (D-186), edge cat-0 disabled + tooltip + cats `hecha`/`dominada` enabled (D-187), sin atajos de teclado v1 (D-188), sessionMode='test-completo' literal (D-189), promoción a `hecha` aplica igual (D-190), summary sin cambios (D-191), cero migración schemaVersion (D-192).
- **6ª call-site D-44 + helper privado:** `startExamen(categoryId)` chequea `state.inFlightTest`, si activo invoca `requestConfirm` con copy literal `'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?'` + confirmLabel `'Descartar y empezar'`. `_launchExamen(catId)` extraído como helper privado (2 call-sites: directo + onConfirm).
- **Tests:** 7 smoke presence-check verdes en `tests/screen-examen.test.js`. Suite completa 202 → 209 verdes.
- **EXAM-01..05 cerrados:** REQUIREMENTS.md Coverage 57/57 → 62/62 (100%).

## What Was Built

### 1. Handler + helper en `src/screens/app.js`

Posición lógica: junto a `openPicker` (líneas 271-290 originales), después del cierre del método openPicker.

**`startExamen(categoryId)`** — entry point handler:
- Guard D-44: `if (this.state.inFlightTest)` → `requestConfirm({...})` con copy literal idéntica a openPicker línea 275 + confirmLabel `'Descartar y empezar'` (coherencia con análogo directo D-44).
- onConfirm: `this.clearInFlightTest()` + `this._launchExamen(categoryId)`.
- Path normal sin conflict: `this._launchExamen(categoryId)` directo.

**`_launchExamen(catId)`** — helper privado del cuerpo del lanzamiento puro:
- Pattern S-2 cancelaciones: `cancelAutoAdvance()` + `cancelMatchFlash()` (set completo heredado de restartRepaso).
- `buildFullTest([catId], allExercises)` — Examen es 1-cat por diseño D-181.
- `sessionMode = 'test-completo'` literal (D-189 — NO this.pickerMode).
- `pickerCheckedCategoryIds = [catId]` **ANTES** de `persistInFlightTest()` — pitfall PATTERNS.md §1 Analog 2.
- Reset sub-estados word-buttons (Phase 3) + match (Phase 3 + Phase 6 D-107/D-112).
- `initSubStateForExercise(firstEx)` si hay pool.
- `persistInFlightTest()` SIEMPRE (D-182 slot único — no condicional como startSession).
- `currentScreen = 'session'`.

**`categoriesForDisplay` extendido** (líneas 1949-1977 originales):
- Extraído `const totalCount = (exercisesByCat[cat.id] ?? []).length` antes del return para reusar.
- 2 campos nuevos en el return:
  - `examenEnabled: totalCount > 0` (D-184/D-187 — cats `hecha`/`dominada` siguen enabled normal).
  - `examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría'` (D-187).
- JSDoc del getter actualizado para mencionar `examenEnabled` y `examenTooltip`.

### 2. 6ª columna `Examen` en `index.html`

Sección `<template x-if="currentScreen === 'home'">` líneas 150-178 originales.

- Comment actualizado: `<!-- Tabla densa (D-29) con 5 columnas exactas. -->` → `<!-- Tabla densa (D-29) con 6 columnas exactas — 6ª columna Examen añadida en Phase 8 (D-184). -->`.
- Nuevo `<th scope="col">Examen</th>` como 6º hermano dentro del `<thead><tr>`.
- Nuevo `<td>` con botón como 6ª `<td>` al final de cada `<tr>` del `<template x-for>`:
  ```html
  <td>
    <button type="button"
            class="secondary outline"
            :disabled="!cat.examenEnabled"
            :title="cat.examenTooltip"
            @click="startExamen(cat.id)">Examen</button>
  </td>
  ```
- Texto `Examen` LITERAL HTML (D-185 + T-02-01 anti-XSS — NO x-text interpolado).
- Cero CSS nuevo (UI-SPEC §CSS additions lockea CERO).

### 3. 7 smoke tests en `tests/screen-examen.test.js`

Archivo nuevo (Opción A PATTERNS.md §3 — per-feature consistency).

Setup: lectura textual de `src/screens/app.js` e `index.html` + slicing windowed sobre la DEFINICIÓN del método (regex `^\s+methodName\(args\)\s*\{` con flag `/m`, evita matchear JSDoc references).

7 sub-tests dentro de `describe('appShell.startExamen — Phase 8 D-181..D-192', ...)`:

1. `startExamen` definido con firma `startExamen(categoryId)`.
2. `_launchExamen` helper privado tiene ≥ 2 call-sites (`this._launchExamen(`).
3. `this.state.inFlightTest` chequeado ANTES de `this._launchExamen(` dentro de startExamen (D-44 conflict).
4. `requestConfirm` con copy literal D-44 + confirmLabel `'Descartar y empezar'`.
5. `buildFullTest([...])` + `sessionMode = 'test-completo'` dentro de `_launchExamen`.
6. `pickerCheckedCategoryIds = [...]` ANTES de `persistInFlightTest()` (pitfall §1 Analog 2).
7. `index.html` tiene `<th scope="col">Examen</th>` + `class="secondary outline"` + `startExamen(cat.id)` + `:disabled` + `:title`.

Cero factory instantiation (presence-check coherente con `tests/exercise-types.test.js:739-754`).

### 4. Audit trail consolidado

**`.planning/PROJECT.md`** — `### Validated` extendido con entry Phase 8 (8 bullets cubriendo handler/helper/reuso/pitfall/computed/HTML/tests/non-changes) + 1 fila nueva en Key Decisions (confirmLabel lockeado + audit trail del análisis empírico 5 call-sites).

**`.planning/REQUIREMENTS.md`** — nueva subsección `### Modo Examen por categoría (EXAM) — Phase 8` con EXAM-01..05 + 5 filas en Traceability + Coverage actualizada `57/57 → 62/62 (100%)` + footer actualizado.

**`.planning/ROADMAP.md`** — Phase 8 checkbox `[ ]` → `[x]` con `(completed 2026-05-25)`; plan listing `[ ] 08-01-PLAN.md` → `[x] ... completado 2026-05-25`; fila Progress `0/1 Planned` → `1/1 Complete 2026-05-25`; footer actualizado a 209/209 verdes + 62/62.

**`.planning/STATE.md`** — Performance Metrics: Fases completadas `5/6` → `10/10`, Requisitos `41/43` → `62/62`, Tests `145` → `209`. Current Position actualizado a Phase 8 COMPLETED. Roadmap Evolution entry añadida.

## Key Decisions

- **`_launchExamen(catId)` extraído como helper privado** — 2 call-sites justificadas (directo desde startExamen path no-conflict + onConfirm callback post-clearInFlightTest). Extracción wins on readability vs duplicación inline. Trade-off: 1 método privado nuevo al factory.
- **`confirmLabel = 'Descartar y empezar'` lockeado** — análisis empírico de las 5 call-sites previas de `requestConfirm` (commit d7a0e4b documentó la distribución: `Descartar*` 4/5 + `Continuar` 1/5). El UI-SPEC original sugería `'Continuar'` (coherencia con D-27), pero el análogo SEMÁNTICO más directo es openPicker D-44 línea 276 (mismo message + mismo intent: descartar Test completo activo + arrancar nuevo). Homogeneización general de las 6 call-sites del helper diferida.
- **Test file nuevo `tests/screen-examen.test.js`** (Opción A PATTERNS.md §3) — per-feature consistency con `tests/screen-multi-choice-shuffle.test.js`. Append a otro archivo rechazado: ese archivo es estrictamente sobre shuffle de multi-choice, no sobre handlers de screen genéricos.

## Pitfalls Avoided

- **`pickerCheckedCategoryIds = [catId]` ANTES de `persistInFlightTest()`** — pitfall sutil PATTERNS.md §1 Analog 2. `persistInFlightTest` lee `this.pickerCheckedCategoryIds.length > 0 ? [...] : (prev?.categoryIds ?? [])`. Si no se setea ANTES, el fallback captura las cats del Test anterior — regresión silenciosa al reanudar.
- **Reset SUPERSET completo (NO subset de startSession)** — `restartRepaso` (Phase 6 D-104) es el analog correcto, no `startSession`. Examen lanzado desde home puede venir de mid-match si el path conflict D-44 cancela un Test previo a medias. `cancelMatchFlash()` es necesario aunque `startSession` no lo aplica.
- **Texto `Examen` LITERAL HTML en index.html** — NO `x-text="cat.examenLabel"` ni interpolado desde JSON. T-02-01 anti-XSS invariante preservado por construcción (D-185).
- **Resolución de la DEFINICIÓN del método en los tests** — `indexOf('_launchExamen(')` originalmente matcheaba el comment JSDoc de startExamen en línea 316, no la definición en línea 370. Resuelto con regex `^\s+_launchExamen\(catId\)\s*\{/m` (multiline, indented). Pitfall capturado durante desarrollo.

## Tests Added

7 sub-tests en `tests/screen-examen.test.js` dentro de `describe('appShell.startExamen — Phase 8 D-181..D-192', ...)`:

| # | Test name | What it verifies |
|---|-----------|------------------|
| 1 | `startExamen está definido en src/screens/app.js (Phase 8 D-181)` | Firma `startExamen(categoryId)` presente |
| 2 | `_launchExamen helper privado existe y es invocado al menos 2 veces` | ≥ 2 call-sites de `this._launchExamen(` |
| 3 | `startExamen chequea state.inFlightTest ANTES de buildFullTest (D-44 conflict)` | `this.state.inFlightTest` aparece ANTES de `this._launchExamen(` |
| 4 | `startExamen invoca requestConfirm con copy literal D-44 6ª call-site` | Copy literal D-183 + confirmLabel `'Descartar y empezar'` |
| 5 | `_launchExamen invoca buildFullTest con un array de 1 categoryId` | `buildFullTest([` + `sessionMode = 'test-completo'` |
| 6 | `_launchExamen setea pickerCheckedCategoryIds ANTES de persistInFlightTest` | Orden de mutación correcto (pitfall §1 Analog 2) |
| 7 | `index.html tiene 6ª columna Examen con botón secondary outline` | `<th>` + `class="secondary outline"` + `startExamen(cat.id)` + `:disabled` + `:title` |

Suite completa: 202 baseline → 209 verdes (delta +7). Cero tests skipped. Cero factory instantiation.

## Files Modified / Created

**Created:**
- `tests/screen-examen.test.js` (123 lines — 7 smoke tests + describe block + setup const)
- `.planning/phases/08-modo-examen-por-categor-a-bot-n-examen-al-lado-de-cada-categ/08-01-SUMMARY.md` (this file)

**Modified:**
- `src/screens/app.js` (+152 / -4 — `startExamen` + `_launchExamen` + `categoriesForDisplay` extension + JSDoc update)
- `index.html` (+9 / -1 — comment update + new `<th>` + new `<td>` with button)
- `.planning/PROJECT.md` (+entry Phase 8 Validated + 1 row Key Decisions)
- `.planning/REQUIREMENTS.md` (+ subsection EXAM-01..05 + 5 traceability rows + Coverage 57→62 + footer)
- `.planning/ROADMAP.md` (+ checkbox marcado + plan listing marcado + fila Progress + footer)
- `.planning/STATE.md` (+ Performance Metrics + Current Position + Roadmap Evolution entry + footer)

## Captured for Future Phase

Deferred del CONTEXT.md `<deferred>` (out-of-scope Phase 8, capturados para no perderlos):

- **Examen multi-cat** (selección de 2-3 cats para examinar en bloque) — si emerge demanda, fase incremental "Examen multi-cat" con UI distinta (picker con botón "Examen" en vez de "Empezar").
- **Atajos de teclado** (E + número de fila) — D-188 v1 sin atajos. Diferido a fase incremental si emerge dolor.
- **Copy especializada en banner reanudar** (`"Examen de Avere a medias"` vs `"Test completo a medias"`) — D-183 mantiene copy genérica.
- **Diferenciación visual en pantalla session** (header "Examen: Avere" vs header genérico) — D-189 sin diferenciación.
- **Botón Examen también en el picker** (al lado de cada checkbox) — D-184 descartó (ubicación correcta es tabla home).
- **Slot inFlightTest separado** (Examen y Test Completo en paralelo) — D-182 slot único compartido.
- **Tracking estadístico de Examenes realizados** (counter aparte) — los counters exerciseStats son suficientes.

**Capturado nuevo por el planner durante Phase 8:**

- **Homogeneizar las 6 call-sites del helper `requestConfirm`** con confirmLabel unificado — actualmente la distribución es `Descartar*` 5/6 (D-43 / D-44 openPicker / Examen / resumeInFlightTest stale / discardInFlightTest) + `Continuar` 1/6 (D-76 backup import) + `Descartar` simple en D-27. Si emerge demanda de coherencia textual fuerte, refactor en fase incremental.

## Next Steps

1. **Phase 8 verifier pass** — `phase.complete` tras VERIFICATION.md status:passed.
2. **`/gsd:complete-milestone v1.0`** — milestone v1.0 ampliado close con feature Examen (62/62 v1 requirements complete + cobertura 100% editorial + Modo Examen 1-click desde home).
3. (Opcional) **UAT humano post-merge** — autor arranca `npx serve`, verifica visualmente las 6 columnas + click Examen sin conflict + click Examen con conflict → confirm inline + (opcional) cat vacía → disabled + tooltip + reanudar Examen abandonado.

## Self-Check: PASSED

- `src/screens/app.js`: FOUND (handler + helper + computed extension)
- `index.html`: FOUND (6th column + button + bindings)
- `tests/screen-examen.test.js`: FOUND (7 tests verdes standalone + suite completa 209)
- `.planning/PROJECT.md`: FOUND (Phase 8 Validated entry + Key Decisions row)
- `.planning/REQUIREMENTS.md`: FOUND (EXAM section + 5 traceability rows + 62/62)
- `.planning/ROADMAP.md`: FOUND (checkbox marcado + plan listing + Progress + footer)
- `.planning/STATE.md`: FOUND (Performance Metrics + Current Position + Roadmap Evolution + footer)
- Commits:
  - Task 1: `575178f` — feat(08-01) handler + helper + computed
  - Task 2: `b7d7991` — feat(08-01) 6th column in index.html
  - Task 3: `704b744` — test(08-01) 7 smoke presence-check tests
  - Task 4 (audit + SUMMARY): pending commit final atómico
