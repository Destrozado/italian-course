---
phase: quick-260615-hhp
plan: 01
subsystem: ui
tags: [ui, alpine, context-label, screens]
status: shipped
requires:
  - "appShell factory + getters reactivos (src/screens/app.js)"
  - "sessionMode/pickerCheckedCategoryIds/sessionExerciseIds/songActiveId/content.categories/content.songsById (estado existente)"
provides:
  - "Getter derivado read-only sessionContextLabel"
  - "Título de ubicación/contexto en las 4 pantallas (session, cancion, summary, cancion-summary)"
  - "Clase CSS .session-context"
affects:
  - "src/screens/app.js"
  - "index.html"
  - "styles.css"
  - "tests/screen-context-label.test.js"
tech-stack:
  added: []
  patterns:
    - "Getter derivado puramente read-only con guard double-defense (if (!this.content) return '')"
    - "Binding Alpine x-text sobre getter en <h2> como primer hijo del <article>"
key-files:
  created:
    - "tests/screen-context-label.test.js"
  modified:
    - "src/screens/app.js"
    - "index.html"
    - "styles.css"
decisions:
  - "Un único getter sessionContextLabel reutilizado en las 4 pantallas (verificado: el estado del que deriva sobrevive a los resúmenes — completeSession/completeSong NO resetean)"
  - "Repaso usa sessionExerciseIds.length, NUNCA 20 hardcodeado (CONTEXT §2)"
  - "Examen multi-cat/vacío → 'Examen' genérico sin listar nombres (CONTEXT §3)"
  - "Contexto añadido ENCIMA del header propio de los resúmenes sin romperlo (CONTEXT §4)"
metrics:
  duration: ~12m
  completed: 2026-06-15
  tasks: 2
  files: 4
---

# Quick 260615-hhp: Mostrar título de ubicación/contexto durante la sesión Summary

Título de ubicación derivado (`sessionContextLabel`) que muestra "Examen: &lt;categoría&gt;" / "Examen" / "Repaso (N ejercicios)" / "Canción: &lt;title&gt;" encima del progreso en las pantallas session, cancion, summary y cancion-summary — pura UI derivada, sin tocar estado persistido ni scoring.

## What Was Built

- **Task 1 — Getter `sessionContextLabel`** (`src/screens/app.js`, commit `35a9a0a`): getter read-only situado junto a `songProgressLabel`. Switch por `this.sessionMode`:
  - `'test-completo'` con `pickerCheckedCategoryIds.length === 1` → `"Examen: <name>"` (name resuelto con `content.categories.find(c => c.id === id)?.name ?? id`).
  - `'test-completo'` multi-cat o vacío → `"Examen"`.
  - `'repaso'` → `"Repaso (${sessionExerciseIds.length} ejercicios)"` (N real, sin 20 hardcodeado).
  - `'cancion'` → `"Canción: ${content.songsById?.[songActiveId]?.title ?? songActiveId}"`.
  - cualquier otro caso / `content` no cargado → `''` (guard `if (!this.content) return ''`).
  - Nuevo `tests/screen-context-label.test.js` (13 asserts: 5 de presencia textual sobre el source + 8 behaviorales instanciando el factory).
- **Task 2 — Markup + estilo** (`index.html` + `styles.css`, commit `e156335`): `<h2 class="session-context" x-text="sessionContextLabel">` insertado como primer hijo del `<article>` en las 4 pantallas, encima del header de progreso. En los resúmenes va encima del header propio (`summaryHeaderLabel` / `<h2>Canción terminada</h2>`) sin romperlo. Clase `.session-context` en styles.css (tamaño/peso de título, `margin-bottom: 0.25rem`, `:empty { display: none }`, vars de Pico).

## Verificación de hechos (leído el código real, no asumido)

- `sessionMode`: `'repaso' | 'test-completo' | 'cancion' | null` (Examen = `'test-completo'`, ver `_launchExamen` L433/L438 → `pickerCheckedCategoryIds = [catId]`). ✓
- Categorías: `content.categories` array de `{id, name, order}`; sin mapa `categoriesById`. ✓
- N real: `sessionExerciseIds.length` (mismo uso que `sessionProgressLabel`). ✓
- Título canción: `content.songsById[songActiveId].title` (campo `title` confirmado en songs.json y `songsForDisplay`). ✓
- Lifecycles: `completeSession()` NO llama `resetSession()` (solo `returnToHomeFromSummary()`) → estado vive en `summary`. `completeSong()` NO limpia `songActiveId` (solo `returnToSongList()`) → vive en `cancion-summary`. Por eso UN único getter sirve para las 4 pantallas. ✓

## Test Results

- `node --test tests/screen-context-label.test.js` → 13 pass / 0 fail.
- `node --test tests/*.test.js` → **387 tests, 386 pass, 1 fail**.
  - El único fallo es **PREEXISTENTE y ajeno**: `content/exercises/genero-numero.json` espera 12 ejercicios con explanation válida pero hay 13 (consecuencia de la tarea 260614-hxn que añadió el bloque `genero-numero-nazionalita`). NO se arregla en este plan. No se introdujeron fallos nuevos (la suite estaba en 1 fail antes de empezar y sigue en 1 fail; el conteo de pass subió de 373 a 386 por los 13 asserts nuevos).

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito. Las 4 decisiones del CONTEXT.md honradas. Cero cambios en estado persistido, storage.js, ni lógica de scoring/racha.

## Known Stubs

None.

## Self-Check: PASSED

- `src/screens/app.js` → contiene `get sessionContextLabel()`. FOUND.
- `tests/screen-context-label.test.js` → FOUND.
- `index.html` → 4 bindings `sessionContextLabel` (L319, L591, L671, L844). FOUND.
- `styles.css` → `.session-context`. FOUND.
- Commit `35a9a0a` (Task 1). FOUND.
- Commit `e156335` (Task 2). FOUND.
