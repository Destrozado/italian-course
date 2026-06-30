---
phase: 32-cimientos-visuales-home-categor-as
plan: 02
subsystem: ui
tags: [home, categorias, editoriale, alpine, css, markup, streak-bar, desktop-table, anti-xss]

# Dependency graph
requires:
  - phase: 32-01
    provides: "tokens --ed-*, @font-face (3 familias), .ed-tricolore, badge-* reconciliado D-01, dark-mode-off"
  - phase: 28-responsive (huérfana archivada)
    provides: "capa @media 640px tabla->tarjetas con data-label (debe NO regresar)"
provides:
  - "Pantalla Home/Categorías rediseñada al lenguaje Editoriale (cabecera serif + CTA verde + ghost row + switch + filas dot/streak/pill + tabla editorial desktop)"
  - "categoriesForDisplay expone streakDays crudo (1 campo presentacional para la barra streak/21)"
  - "Componentes Home reusables en app.css (home-cta, home-ghost, status-dot, streak-bar, examen-pill) + tabla editorial @media(min-width:641px)"
affects: [phase-33-pantallas-ejercicio, phase-34-canciones-resultados-picker]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Derivación D-02 título/tema en expresión Alpine sobre x-text (split del paréntesis del name, sin tocar categories.json)"
    - "Barra de progreso con ancho dinámico vía :style inline (Math.min(streakDays/21*100,100)%); color por currentColor heredado de badge-*"
    - "Tabla editorial desktop como hermano inverso del @media(max-width:640px): @media(min-width:641px) en app.css restila figure table sin reestructurar DOM"
    - "Switch Pico role=switch restilado a verde (:checked → var(--ed-green)) sin tocar el modelo Alpine"

key-files:
  created: []
  modified:
    - src/screens/app.js
    - index.html
    - app.css
    - tests/screen-home-editorial.test.js
    - tests/screen-canciones.test.js
    - tests/screen-examen.test.js

key-decisions:
  - "Subtítulo del CTA = 'Repaso rápido' (neutro) en vez de '20 ejercicios al azar · 5 min' — el CTA abre el picker (D-05), no lanza 20 directos; el copy neutro no promete un comportamiento que el picker no cumple"
  - "Dot y relleno de barra usan background-color:currentColor para heredar el color del badge-* (D-01) ya reconciliado en Plan 01 — un solo hogar de color de estado, sin repetir hex"
  - "Columna 'Última vez' se conserva en el DOM con su data-label (capa móvil Phase-28) y se OCULTA en desktop por CSS (.col-ultima-vez{display:none} bajo min-width:641px) → contrato 5 columnas"
  - "Derivación D-02 hecha en expresión Alpine (no getter nuevo) — mantiene el único cambio JS en 1 campo (streakDays), todo lo demás presentacional en markup"

patterns-established:
  - "Componentes Home Editoriale (CTA/ghost/dot/streak-bar/examen-pill) disponibles como precedente para Phases 33-34"
  - "Reconciliación de tests estructurales cuando un rediseño supersede un contrato visual previo (D-04 Canciones ghost; pill supersede secondary outline)"

requirements-completed: [HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06]

# Metrics
duration: ~3min
completed: 2026-06-30
---

# Phase 32 Plan 02: Home/Categorías Editoriale Summary

**Pantalla Home rediseñada al lenguaje Editoriale — cabecera serif (overline `ITALIANO · A1 / A2` + título Spectral 38 `Categorías`), CTA verde de ancho completo `Repaso 20` (abre el picker, D-05), fila ghost de 3 (Test completo · Canciones · Backup), switch Contrarreloj verde, filas de categoría con dot de estado + nombre/tema serif (D-02) + barra streak/21 + píldora Examen, y tabla editorial papel/serif/hairlines en desktop — reusando todos los bindings Alpine y consumiendo los tokens del Plan 01; único cambio JS = `streakDays` crudo expuesto.**

## Performance

- **Duration:** ~3 min entre commits de tarea
- **Started:** 2026-06-30
- **Completed:** 2026-06-30
- **Tasks:** 3
- **Files modified:** 3 producción (app.js, index.html, app.css) + 3 tests

## Accomplishments
- **HOME-01 (cabecera):** tricolore reutilizable (Plan 01) + overline Hanken 11/700 letter-spacing 2.5px + título serif Spectral 38/600 letter-spacing −0.6px. Copy literal, no de JSON.
- **HOME-02 (CTA):** `<button class="home-cta">` ancho completo, fondo `var(--ed-green)`, `box-shadow: var(--ed-shadow-cta)`, título + subtítulo + flecha `→`. `@click="openPicker('repaso')"` VERBATIM (D-05) — abre el picker, no lanzamiento directo.
- **HOME-03 (ghost row):** fila flex `gap:8px margin-top:9px` de 3 botones `flex:1` borde `var(--ed-border-soft)` radio 12. Canciones BAJA de protagonista a ghost (D-04). Todos los `@click` verbatim.
- **HOME-04 (filas):** dot 9px (color por `badge-${cat.status}` D-01 vía currentColor), nombre serif 18/600 + tema cursiva derivado del paréntesis del `name` (D-02, en expresión Alpine sobre x-text), barra streak/21 (ancho = `streakDays/21`, color verde/ámbar), píldora Examen borde ink (handler/:disabled/:title verbatim).
- **HOME-05 (switch):** overline `CATEGORÍAS` + label `Contrarreloj` + `x-model="homeExamTimed"` intacto; track verde cuando on.
- **HOME-06 (tabla desktop):** `@media (min-width:641px)` restila `figure table` a papel/serif/hairlines, oculta "Última vez" → contrato 5 columnas. Capa móvil Phase-28 (`@media max-width:640px`, tap 44px) intacta.
- **Único cambio JS:** `categoriesForDisplay` ahora devuelve `streakDays: streak` (raw). Motor verificablemente intacto (`applyImmediateFailure(this.state` = 2).

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: Exponer streakDays crudo en categoriesForDisplay** - `7aa4b29` (feat)
2. **Task 2: Reescribir el bloque Home en index.html** - `752ad8a` (feat)
3. **Task 3: Estilos Editoriale de Home en app.css** - `9c6ed7e` (feat)

## Files Created/Modified
- `src/screens/app.js` - `categoriesForDisplay` devuelve 1 campo presentacional `streakDays: streak` (reusa el `const streak` ya computado).
- `index.html` - bloque `<template x-if="currentScreen==='home'">` reescrito al layout Editoriale (header/CTA/ghost/switch/filas/tabla) reusando todos los bindings; banners in-flight/backup conservados; data-label intactos; anti-XSS (cero x-html).
- `app.css` - bloque "Phase 32 Plan 02": componentes Home (header, CTA, ghost, switch, dot, streak-bar, examen-pill) + tabla editorial desktop `@media(min-width:641px)`, todo vía `var(--ed-*)`.
- `tests/screen-home-editorial.test.js` - 21 source-asserts (getter streakDays + motor intacto + copy + bindings verbatim + barra streak + anti-XSS + estilos app.css + no-regresión Phase-28).
- `tests/screen-canciones.test.js` - test "Canciones protagonista" reconciliado al nuevo contrato ghost (D-04 supersede D-01); comportamiento preservado.
- `tests/screen-examen.test.js` - test "secondary outline" reconciliado a la píldora editorial (`examen-pill`); bindings de comportamiento preservados.

## Decisions Made
- **Subtítulo del CTA `Repaso rápido`** (no "20 ejercicios al azar · 5 min"): el CTA abre el picker (D-05), no lanza 20 directos; el copy neutro evita prometer un comportamiento que el picker no cumple. El plan dejaba la copy a discreción con el comportamiento bloqueado.
- **Color de dot/barra vía `currentColor`**: el `.status-dot` y `.streak-bar-fill` usan `background-color:currentColor` para heredar el color que las clases `badge-*` (reconciliadas a D-01 en Plan 01) ya fijan como `color`. Un solo hogar de color de estado, sin repetir hex.
- **"Última vez" oculta por CSS, no eliminada**: el `<td data-label="Última vez">` se conserva en el DOM (la capa móvil Phase-28 depende de los data-label) y se oculta en desktop con `.col-ultima-vez{display:none}` bajo `min-width:641px` → contrato 5 columnas sin romper el móvil.
- **Derivación D-02 en expresión Alpine, no getter**: el split del paréntesis del `name` (título antes de `(`, tema dentro) se hace en `x-text` con `.split('(')` / `.slice(...)`. Mantiene el único cambio JS acotado a 1 campo presentacional.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Comentario en index.html disparaba un test de conteo**
- **Found during:** Task 2
- **Issue:** Un comentario explicativo contenía el literal `x-model="homeExamTimed"`, lo que hacía que el test preexistente `quick-260615-r3b` (que cuenta apariciones exactas == 1) viera 2 ocurrencias y fallara.
- **Fix:** Reescrito el comentario para no contener el literal (`su binding homeExamTimed`). Cero cambio de comportamiento.
- **Files modified:** index.html
- **Commit:** `752ad8a`

**2. [Rule 1 - Test reconciliation] Tests estructurales del diseño anterior**
- **Found during:** Task 2
- **Issue:** Dos tests preexistentes codificaban el contrato visual anterior que el rediseño supersede explícitamente: (a) `screen-canciones.test.js` afirmaba que Canciones es PROTAGONISTA sin `class="secondary"` (D-01 de Phase 13), pero D-04 de Phase 32 lo BAJA a ghost; (b) `screen-examen.test.js` afirmaba `class="secondary outline"` en el botón Examen, restilado a píldora editorial (`examen-pill`) por HOME-04.
- **Fix:** Reconciliados ambos tests al nuevo contrato Editoriale, conservando las aserciones de COMPORTAMIENTO (Canciones sigue abriendo `currentScreen='canciones'`; Examen conserva `startExamen`/`:disabled`/`:title`). Solo cambian las aserciones de estructura visual que el rediseño legítimamente cambia.
- **Files modified:** tests/screen-canciones.test.js, tests/screen-examen.test.js
- **Commit:** `752ad8a`

## Verification
- `node --test tests/*.test.js` → **494 pass / 1 fail** (el único fail es el preexistente AJENO genero-numero "Esperaba 12, encontré 13", quick `260614-hxn`; CERO fails nuevos).
- `grep -c "applyImmediateFailure(this.state" src/screens/app.js` → **2** (motor intacto, cascada D-54 sin regresión).
- `! grep -q 'x-html=' index.html` → sin x-html (anti-XSS T-32-03 preservado).
- Bindings verbatim presentes: `openPicker('repaso')`, `openPicker('test-completo')`, `currentScreen = 'canciones'`, `currentScreen = 'backup'`, `x-model="homeExamTimed"`, `x-for="cat in categoriesForDisplay"`, `startExamen(cat.id)`.
- `@media (max-width: 640px)` + `min-height: 44px` presentes en styles.css (capa móvil Phase-28 sin regresión).
- 8 `data-label=` en index.html (5 home + 3 canciones) — `screen-responsive.test.js` verde.

## Threat Flags

Sin superficie nueva fuera del threat_model del plan. T-32-03 (XSS en markup Home) = mitigado: todo el contenido (incl. derivación D-02) se renderiza vía `x-text`; cero `x-html`. T-32-04 (motor) = mitigado: único cambio JS = 1 campo presentacional, `applyImmediateFailure` sigue en 2 call-sites. T-32-SC (installs) = N/A (cero paquetes; vanilla markup/CSS/1 getter).

## Self-Check: PASSED

- FOUND: `src/screens/app.js` (streakDays: streak)
- FOUND: `index.html` (bloque Home Editoriale)
- FOUND: `app.css` (componentes Home + tabla desktop)
- FOUND: `tests/screen-home-editorial.test.js`
- FOUND: `.planning/phases/32-cimientos-visuales-home-categor-as/32-02-SUMMARY.md`
- FOUND commits: `7aa4b29`, `752ad8a`, `9c6ed7e`

---
*Phase: 32-cimientos-visuales-home-categor-as*
*Completed: 2026-06-30*
