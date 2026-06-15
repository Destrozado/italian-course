---
phase: quick-260615-str
plan: 01
subsystem: UI / word-buttons
tags: [ui, word-buttons, canciones, ux]
status: shipped
provides: ["banco word-buttons con huecos estables (sin reflow)"]
affects: [src/screens/app.js, index.html, styles.css, tests/]
key-files:
  modified: ["src/screens/app.js", "index.html", "styles.css"]
  created: ["tests/screen-wordbuttons-slots.test.js"]
metrics:
  completed: 2026-06-15
---

# Quick 260615-str: Word-buttons huecos estables Summary

Al seleccionar una palabra del banco, su hueco **se mantiene ocupado** (placeholder invisible), de modo que las demás palabras NO se mueven (sin reflow → sin mis-clicks ni salto del contenido de abajo). Aplica a ejercicios word-buttons y a canciones (mismo código).

## Qué se hizo

- **Task 1 — refactor del modelo (`src/screens/app.js`)** (commit `5cf2623`): `wordButtonsBank` INMUTABLE tras init; nueva fuente de verdad `wordButtonsPlacedIdx` (índices colocados en orden); `wordButtonsAnswer` convertido a **getter derivado** (`placedIdx.map(i => bank[i])`) → 0 asignaciones residuales, todos los lectores (grade, applyResultToSession, markup, wordButtonsCanCheck, Backspace) intactos. `wordButtonsAddWord`/`RemoveWord` por índices. `bankWithKeys` devuelve `{word, idx, placed, key}` con key dinámico sobre VISIBLES. Helper `visibleSlotIdx(n)` para el teclado. Los 6 resets → `wordButtonsPlacedIdx = []`. Teclado (`handleSessionKey` + `handleSongKey`): dígito N → N-ésima visible vía `visibleSlotIdx` (eliminado el guard viejo `wordButtonsBank.length`).
- **Task 2 — render (`index.html` + `styles.css`)** (commit `46cec5c`): ambos bancos (session + cancion) con `:key="entry.idx"`, `@click="wordButtonsAddWord(entry.idx)"`, y placeholder cuando `entry.placed` (`.wb-placed` + `disabled` + `tabindex=-1` + `aria-hidden`). `wb-answer` con `:key="idx"` (answerPos único → duplicados sin aliasing). CSS `.wb-placed { visibility: hidden; }` (NO display:none → mantiene el hueco).
- **Task 3 — tests (`tests/screen-wordbuttons-slots.test.js`)** (commit `1215567`): 5 tests de comportamiento — colocar mantiene nº de slots; placed marcado + key renumera sobre visibles; quitar restaura el slot en su posición; palabras repetidas por índice (quitar el primer 'io' libera su slot, no el otro); `visibleSlotIdx` salta colocadas; `handleSongKey` dígito coloca la N-ésima VISIBLE.

## Nota de ejecución

El subagent executor se cortó por un error de API (Overloaded) tras commitear Task 1. El orquestador verificó el estado (Task 1 completo y correcto: getter, 6 resets, visibleSlotIdx en ambos handlers), confirmó que Task 2 estaba completo en el working tree y lo commiteó, y completó Task 3 (tests) directamente.

## Validación

- `node --test tests/*.test.js` → **445 pass / 1 fail**. El único fallo es el PREEXISTENTE ajeno (`genero-numero` 12→13). +5 tests netos, 0 fallos nuevos.
- Plan validado por plan-checker (2 bloqueantes + 3 warnings corregidos en revisión antes de ejecutar).
