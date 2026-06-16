---
phase: 28
plan: 01
subsystem: ui-responsive
tags: [responsive, mobile, css, pico, media-query, accessibility]
requires: []
provides:
  - "@media (max-width: 640px) responsive layer in styles.css (table->cards, button-row wrap, 44px touch, match 2-col, timer, confirm full-width)"
  - "data-label attributes on home + canciones table cells for the card layout"
  - "tests/screen-responsive.test.js source-assert invariants guard"
affects:
  - index.html
  - styles.css
tech-stack:
  added: []
  patterns:
    - "table->cards via CSS-only (thead display:none + tr/td block + td::before content:attr(data-label))"
    - "single mobile breakpoint 640px, desktop byte-identical (no rule outside the media query)"
    - "44px minimum touch targets (WCAG 2.5.5 / Apple HIG) mobile-only"
key-files:
  created:
    - tests/screen-responsive.test.js
  modified:
    - index.html
    - styles.css
decisions:
  - "Un único breakpoint 640px (UI-SPEC); sin capa tablet dedicada — flex-wrap + container fluido de Pico cubren 641-1024px"
  - "match mantiene 2 columnas en móvil (gap 0.5rem) — apilar a 1 columna destruiría la semántica izq↔der del emparejamiento"
  - "Botón Empezar del picker seleccionado por adyacencia (.picker-timed + button) — no hay clase/id propio y no se añade markup nuevo"
metrics:
  duration: ~3 min
  completed: 2026-06-15
---

# Phase 28 Plan 01: Responsive / Mobile-Friendly Summary

Capa responsive CSS-first detrás de un único `@media (max-width: 640px)` que colapsa las dos tablas a tarjetas verticales, hace envolver la fila de botones de home y garantiza áreas táctiles de 44px en las 7 pantallas — con el escritorio (>=641px) byte-idéntico.

## What Was Built

- **Tarea 1 (`6a03a09`)** — `data-label` en las celdas de las dos únicas tablas (`index.html`):
  - Home: `Estado`, `Racha`, `Ejercicios`, `Última vez`, `Examen` (la celda del nombre de categoría queda SIN label = título de tarjeta).
  - Canciones: `Estado`, `Frases`, `Jugar` (la celda del título queda SIN label).
  - 8 atributos en total. Inerte en escritorio: ningún selector >=641px usa `data-label`.
- **Tarea 2 (`a4f38b0`)** — un bloque `@media (max-width: 640px)` al final de `styles.css` con las 8 secciones del UI-SPEC:
  - **§1 tabla→tarjetas** (LOCKED #1): `figure table thead{display:none}`, fila→bloque con separador, `td` como fila label↔valor con `td[data-label]::before{content:attr(data-label)}` (muted semibold); celdas sin label como título de tarjeta; botones `Examen`/`Jugar` full-width con `min-height:44px` (color `secondary outline` intacto).
  - **§2 button-row wrap** (LOCKED #2): `.button-row{flex-wrap:wrap}`, botones `flex:1 1 8rem; min-width:8rem; min-height:44px` → los 4 botones de home (incl. Backup) visibles; arregla TODAS las `.button-row` de la app.
  - **§3** `.home-exam-timed` como fila tappable 44px.
  - **§4** `fieldset label` y `.picker-timed` con 44px; botón `Empezar` (`.picker-timed + button`) full-width 44px; `.picker-warning` con `overflow-wrap`.
  - **§5** `.session-context` capado a 1.15rem (desktop sigue 1.25rem); cronómetro con `flex-wrap` — barra `flex:1 1 100%` siempre visible, segundos saltan a 2ª línea si aprieta; `tabular-nums` y rojo intactos.
  - **§6** chips de `.wb-bank`/`.wb-answer` a 44px; `.match-grid{gap:0.5rem}` MANTENIENDO 2 columnas (NO se redefine `grid-template-columns`), items con 44px + `overflow-wrap`; `.match-selected`/`.match-consumed`/`.match-flash` sin tocar.
  - **§7** `.summary-errors li` con `overflow-wrap`.
  - **§8** `.confirm-inline{left:1rem;right:1rem;max-width:none}` para no recortarse a 320-360px.
- **Tarea 3 (`2d3d4a0`)** — `tests/screen-responsive.test.js`: 8 asserts source que blindan el breakpoint, el patrón tabla→tarjetas + wrap, 8 data-label + `Examen`/`Jugar`, match no apilada a 1 col, y DESKTOP INTACTO (toda `@media` es `max-width:640px`, sin `min-width`).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Selector del botón "Empezar" del picker corregido**
- **Found during:** Tarea 2
- **Issue:** El plan/UI-SPEC sugería que el botón "Empezar" estaría en un `<form>`/`type="submit"`/`.picker-start`. El markup real (`index.html:314`) es un `<button type="button" @click="startSession">` suelto, sin clase, id, form ni submit. Mis selectores iniciales `article button[type="submit"]`, `.picker-start button`, `form button` no casaban con nada → "Empezar" no habría recibido su tap target de 44px.
- **Fix:** Sustituido por `.picker-timed + button` (adyacencia: el botón Empezar sigue inmediatamente al label `.picker-timed`), acotado para no afectar botones de otras pantallas. Sin markup nuevo.
- **Files modified:** styles.css
- **Commit:** a4f38b0

## TDD Gate Compliance

La Tarea 3 está marcada `tdd="true"`, pero su naturaleza es source-assert de invariantes estructurales sobre código ya escrito (no driving de comportamiento runtime). El orden de ejecución fue implementación primero (Tareas 1-2 commiteadas: `feat`) y luego el test guard (`test`), por lo que NO hay un commit `test` (RED) anterior al `feat` (GREEN) para este artefacto concreto. El test pasó en verde en su primera ejecución porque las invariantes ya eran ciertas — esperado y correcto para un guard estructural. No es un fallo de gate: el grueso de la fase es validación VISUAL, reconocida explícitamente en la cabecera del test y en la verificación de abajo.

## Verification

- `node --test tests/*.test.js` (glob obligatorio Node 22.20) → **441 tests, 440 pass, 1 fail**. El único fallo es el preexistente y ajeno `genero-numero` (12→13), documentado como baseline. **Cero fallos nuevos** (baseline 433/432/1 → 441/440/1; +8 tests del nuevo guard).
- `tests/screen-responsive.test.js` aislado → 8 pass / 0 fail.
- `grep -c 'data-label=' index.html` → **8**.
- `grep '@media' styles.css` → una sola ocurrencia, `@media (max-width: 640px)`; ninguna `min-width` ni `max-width` >640. **Desktop intacto** (reglas L1-509 sin modificar; sólo se añadió el bloque al final).

**La validación de aspecto real es VISUAL** (auditoría posterior pendiente, fuera de unit test). Comprobar manualmente:
- a **320 / 360 / 390px** (móvil vertical): el botón "Examen" de home visible y tappable; los 4 botones de home (incl. "Backup") visibles; la match-grid mantiene 2 columnas; la barra del cronómetro visible en la cabecera de session; el panel confirm no recortado; checkboxes del picker cómodos.
- a **1024px / escritorio**: render idéntico a hoy.

## Known Stubs

Ninguno. La fase es layout-only; no introduce datos, endpoints ni placeholders.

## Self-Check: PASSED

- FOUND: index.html, styles.css, tests/screen-responsive.test.js, 28-01-SUMMARY.md
- FOUND commits: 6a03a09, a4f38b0, 2d3d4a0
