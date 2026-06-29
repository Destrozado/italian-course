# Phase 32: Cimientos visuales + Home/Categorías - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Sienta la **capa Editoriale** de la que dependen todas las fases posteriores de v1.8 — tokens CSS (custom properties con los colores/tipografías/escalas/radios/sombras del README), las 3 fuentes auto-hospedadas (`@font-face` desde `vendor/fonts/`, sin red), una capa `app.css` aplicada **sobre Pico** (Pico = reset/base), y el motivo tricolore reutilizable — y **rediseña la pantalla Home/Categorías** (cabecera editorial, CTA Repaso, fila ghost, filas de categoría, switch Contrarreloj) en columna móvil y como **tabla editorial en desktop**.

**Solo presentación (markup + CSS + a lo sumo bindings/getters presentacionales).** El motor (cascada D-54, sampler, slot-engine, `localStorage`, schema, migraciones) NO se toca. No se añaden categorías ni contenido. `support.js`/`.dc.html` son referencia, no van a producción.
</domain>

<decisions>
## Implementation Decisions

### Mapeo de estado de categoría → punto de color (HOME-04)
- **D-01:** Los 3 puntos del diseño mapean a los estados reales así: **`dominada` → verde** (dominado; racha ≥21, bar lleno) · **`hecha` → ámbar** (en progreso; racha 0-20, bar parcial) · **`no-hecha` → neutro** (`neutral-dot`, "Sin empezar"). El bar de racha se rellena en verde o ámbar según el estado. `vecesFallada` se mantiene como indicador secundario en la columna Racha (como hoy), no cambia el color del punto.

### Subtítulo "tema" de categoría (HOME-04)
- **D-02:** El nombre serif + tema en cursiva se **deriva partiendo el paréntesis del `name`** existente: `"Avere (presente indicativo)"` → título **Avere** + subtítulo en cursiva *presente indicativo*. Puramente presentacional, **sin tocar `categories.json`** ni añadir campos. Las categorías cuyo `name` no tenga paréntesis se muestran solo con el nombre (sin subtítulo). NO se añade campo `topic`.

### Paleta / modo oscuro (FND-03)
- **D-03:** Se **fuerza la paleta papel Editoriale siempre** y se **desactiva el modo oscuro automático de Pico** (hoy `:root { color-scheme: light dark }` + `prefers-color-scheme`). El handoff define una sola paleta (papel cálido); no se inventa una variante oscura. Fijar tema claro e ignorar `prefers-color-scheme`.

### CTA Repaso + reorganización de botones (HOME-02, HOME-03)
- **D-04:** Se sigue el diseño: **1 CTA primario grande verde "Repaso 20"** (título + subtítulo + flecha + sombra verde) + **fila ghost de 3 botones** (Test completo · Canciones · Backup). **Canciones baja de protagonista a la fila ghost** (acepta desviarse del D-01 previo donde Canciones era protagonista entre 4 botones).
- **D-05:** El CTA "Repaso 20" **conserva su comportamiento actual** (`openPicker('repaso')` — abre el picker de selección de categorías). Solo cambia el aspecto, NO se convierte en lanzamiento directo. El subtítulo del CTA ("20 ejercicios al azar · 5 min" del mock) es decorativo; si choca con el paso del picker, priorizar la verdad del comportamiento (texto neutro tipo "Repaso rápido" admisible) — decisión fina del planner, sin cambiar lógica.

### Claude's Discretion
- Estructura interna de la capa CSS (un `app.css` nuevo vs ampliar `styles.css`), nombres de las custom properties, técnica de tabla editorial en desktop (reusar `<table>` + restyle vs grid), y cómo exponer la racha cruda — todo a criterio del planner/researcher, respetando "Pico como base + capa encima" y "motor intacto".
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Diseño (fuente de verdad visual)
- `design_handoff_italiano_redesign/README.md` — tokens (colores hex, 3 familias tipográficas + import, escala tamaños/pesos, radios, sombras, tricolore), detalle de la pantalla Home/Categorías (§1) e interacciones. **Fidelidad alta.**
- `design_handoff_italiano_redesign/Italiano-Home.dc.html` — referencia visual (variante **1a "Editoriale"** = la buena; ignorar 1b). `support.js` = preview, NO producción.

### Requisitos / roadmap
- `.planning/REQUIREMENTS.md` — FND-01..04, HOME-01..06 (los 10 requisitos de esta fase).
- `.planning/ROADMAP.md` §Phase 32 — goal + 5 criterios de éxito.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/screens/app.js` getter **`categoriesForDisplay`** (~línea 2966): ya expone por categoría `{ id, name, status (no-hecha|hecha|dominada), badgeGlyph, statusLabel, streakLabel, totalCount, examenEnabled, examenTooltip, vecesFallada }`. **Falta exponer la racha cruda** (`streakDays`) para dibujar el bar `streak/21` — añadido presentacional al objeto devuelto.
- `index.html` bloque Home (~líneas 65-225): cabecera, `.button-row.button-row-prominent` (4 botones hoy), `label.home-exam-timed` (switch Contrarreloj, `x-model="homeExamTimed"`), `<figure><table>` 6 columnas (Estado · Categoría · Racha · Ejercicios · Última vez · Examen) con `x-for="cat in categoriesForDisplay"`.
- `styles.css`: hoja mínima sobre Pico; clases de feedback `.correcta/.incorrecta`, badges `.badge-*`, `.button-row(-prominent)`, `.home-exam-timed`. Usa CSS vars de Pico con fallbacks hex.
- **Capa responsive Phase 28**: `@media (max-width: 640px)` que transforma la tabla en tarjetas vía `data-label` en celdas. La columna "Última vez" se omite en las tarjetas móviles; el diseño Editoriale móvil tampoco la muestra.

### Established Patterns
- **Pico classless desde CDN** (jsdelivr, SRI pinned) + `styles.css` local. Alpine 3.15.12 también CDN. Añadir Google Fonts por CDN sería consistente, pero **D (FND-02) exige auto-hospedar** en `vendor/fonts/` (offline). `vendor/` aún no existe — crearlo.
- Double-defense Alpine: getters guardan `if (!this.content)`; `<template x-if="currentScreen==='home'">` evita evaluar bindings pre-init.
- Estética/markup cambian; **componentes Alpine y getters se conservan** (solo presentación). `homeExamTimed`, `openPicker`, `startExamen`, `categoriesForDisplay` intactos en su lógica.

### Integration Points
- La capa de tokens/`@font-face`/`app.css` se enlaza en `<head>` de `index.html` (después de Pico para sobreescribir).
- El nuevo markup de Home reemplaza el bloque `<template x-if="currentScreen==='home'">`, reusando los mismos bindings (`@click`, `x-model`, `x-for`, `x-text`).
</code_context>

<specifics>
## Specific Ideas

- "Editoriale" = papel cálido `#f4f0e8`, serif **Spectral** para títulos/nombres, **Hanken Grotesk** para overlines/meta/botones, **Space Grotesk** para contadores/stats; acento **verde `#2f7d56`** (primario) y **rojo `#b5412e`**; motivo tricolore decorativo (verde/crema/rojo, 4px, radio 999).
- Cabecera Home: overline `ITALIANO · A1 / A2` + título serif **Categorías** (Spectral 38, letter-spacing −0.6px).
- Fila de categoría: punto 9px + nombre Spectral 18/600 + tema cursiva (Spectral italic 12.5, color `faint`) + bar de racha (alto 4, máx-ancho 110px) + meta "N/21 d · M ejercicios" + píldora **Examen** (borde `ink` 1px).
- Desktop: tabla editorial con columnas Estado · Categoría · Racha · Ejercicios · Última vez · Examen, conservando papel/serif/hairlines.
</specifics>

<deferred>
## Deferred Ideas

- **Arte de portada de canción real** y **modo oscuro Editoriale** → ya en `Future Requirements` de REQUIREMENTS.md (no en v1.8).
- Pantallas de ejercicio / canciones / resultados / picker → **Phases 33-34** (no tocar aquí más allá de que hereden la capa Editoriale global).
- Si más adelante se quiere un campo `topic` explícito por categoría → futura tarea de contenido (hoy se deriva del `name`).
</deferred>

---

*Phase: 32-Cimientos visuales + Home/Categorías*
*Context gathered: 2026-06-30*
