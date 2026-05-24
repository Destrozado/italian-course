---
created: 2026-05-24T19:13:55.735Z
title: Fix botones multi-choice pegados visualmente
area: ui
files:
  - styles.css
  - index.html (template currentScreen === 'session' multi-choice block)
---

## Problem

Durante la UAT de Phase 4 (Plan 04-02 Preposiciones, ejercicio multi-choice 14/17 `Non ho mangiato niente: ___ fame!` con opciones `[ho, sono, hai, è]`), el autor reportó que los 4 botones de opciones se ven visualmente **fusionados** — sin gap visible entre ellos. Esto causa **miss-clicks** (le ha pasado más de una vez durante el uso real).

Es una **regresión de Phase 2-3** (los botones multi-choice quedaron con `gap` insuficiente cuando se introdujeron `.button-row` o equivalente en Phase 2 `appShell` plano). El layout actual probablemente usa `display: flex` o grid sobre el `<fieldset>` de opciones sin `gap` explícito, o con `gap` < 0.5rem.

**Repro:** abrir cualquier categoría con multi-choice (ej. Preposiciones), lanzar Repaso 20, observar las 4 opciones — visualmente se ven como un bloque continuo sin separación entre botones individuales.

**Confirmar:** mirar Pico CSS classless rendering del `<fieldset>` o de la lista de `<button>` dentro del session screen multi-choice template. Probablemente falta `gap: 0.5rem` (o equivalente) o un `margin` entre items.

## Solution

TBD. Probable fix ~1-2 líneas de CSS:
1. Localizar el contenedor de los botones de opciones en `index.html` (likely `<template x-if="sessionCurrentExercise.type === 'multiple-choice'">` rendering como `<fieldset>` o `<div>` con `x-for` de `payload.options`).
2. Inspect en DevTools el spacing actual.
3. Añadir `gap: 0.5rem` (o equivalente Pico) al contenedor, o `margin-bottom: 0.25rem` a cada botón opción.
4. Verificar también que en `word-buttons` (Phase 3) y `match` (Phase 3) los botones tampoco se peguen — la regla probablemente aplica a las 3 mecánicas.

**Test post-fix:** abrir la app en `npx serve`, lanzar Repaso 20, verificar visualmente que las 4 opciones se ven como botones independientes con separación clara (no como bloque continuo). Hacer click rápido alternando entre opciones para confirmar que no hay miss-clicks por proximidad.

**No requiere discuss-phase** — es un bug de CSS puro, fix directo.

## Origin

Capturado durante UAT de Plan 04-02 Task 2 (Preposiciones review). Author quote: *"las 4 opciones estan demasiado pegadas, se fusionan unos botones con otros como ha pasado ya otras veces, mejor que se vean que son botones diferentes, ademas se evitan miss clicks como ya me ha pasado."*

Aparece como UX-1 en `04-02-SUMMARY.md` / `04-03-SUMMARY.md` / `04-04-SUMMARY.md` sección "Captured for future phase".
