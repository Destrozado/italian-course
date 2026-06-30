# Phase 34: Canciones · Resultados · Picker - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Aplica el lenguaje **Editoriale** (papel cálido, serif Spectral, acento verde/rojo, barra superior unificada) a las **4 pantallas que cierran el rediseño v1.8** — **lista de Canciones**, **reproducción de canción** (rellenar huecos), **Resultados de sesión** (summary) y el **picker** de Repaso/Examen — **sobre el motor intacto**.

**Solo presentación (markup + CSS + getters/bindings presentacionales).** El motor NO se toca: cascada D-54, sampler, slot-engine, `songProgress`/`localStorage`, schema, migraciones, grading. Consume la capa Editoriale de Phase 32 (tokens `--ed-*`, fuentes auto-hospedadas) y la barra superior + tratamiento word-buttons de Phase 33. `support.js`/`.dc.html` son referencia, no van a producción.

**IMPORTANTE — Pico fue ELIMINADO en Phase 32 (GAP-01):** `app.css` es ahora el reset/base. Pese a que los CONTEXT de Phases 32/33 dicen "sobre Pico", NO re-introducir Pico. Toda regla nueva va sobre `app.css`/`styles.css`.

**Desviaciones conscientes del handoff** (por falta de dato fuente, mismo criterio que D-33-07): la tarjeta "Continuar" NO muestra fracción "9/14 huecos" (no existe progreso parcial intra-canción), la meta de canción omite "Nivel" (no existe campo), y el picker se **extrapola** (no está en el handoff).
</domain>

<decisions>
## Implementation Decisions

### Canciones — tarjeta destacada "Continuar" (SRP-01)
- **D-01 (fuente):** La tarjeta destaca la **primera canción pendiente** = primera `no-hecha` o `fallada` recorriendo el orden de la lista. No usa `lastPlayedAt`. Semántica = "la siguiente que te toca", no "retoma lo último".
- **D-02 (barra de progreso):** **Barra por estado, SIN fracción numérica.** No existe persistencia de huecos parciales (PLAY-05 descarta lo no comprometido; `songProgress` solo guarda `{status, lastPlayedAt, vecesFallada}`). La barra se rellena según estado — NO se inventa un "9/14 huecos". Coherente con "datos reales de sesión".
- **D-03 (overline dinámico):** El overline verde es **`CONTINUAR`** si la destacada está `fallada` (la retomas) y **`EMPEZAR`** si está `no-hecha` (nueva). Hardcoded por rama, sin dato nuevo.
- **D-04 (empty state):** Si **todas** las canciones están `pasada` (ninguna pendiente), **se oculta la tarjeta destacada** — solo la lista con overline `TODAS LAS CANCIONES`. La ausencia es la señal (patrón D-108).

### Canciones — meta de fila + punto de estado (SRP-01)
- **D-05 (título + artista):** **Partir el `title` por el guion "—"**: parte izquierda = título serif, parte derecha = artista en cursiva. Presentacional, **sin tocar JSON** — mismo patrón que D-32-02 (split del `name` de categoría por paréntesis). Si un título no tiene guion, mostrar solo el título.
- **D-06 (nivel omitido):** **No hay campo `nivel`** → se omite. Meta cursiva = `{artista} · {N} huecos` (artista del split D-05 + `phraseCount` real). Mismo criterio que D-33-07 (omitir lo que no tiene campo fuente).
- **D-07 (punto de estado):** El estado de canción es `no-hecha / pasada / fallada` (NO la tríada de categorías). Mapeo: **`pasada` → verde**, **`fallada` → rojo (`#b5412e`)**, **`no-hecha` → neutro**. El rojo de `fallada` es coherente con el acento de errores del resto de la app.

### Reproducción de canción (SRP-02) — heredada, criterio del planner
- **D-08:** No se discutió como gray area porque queda determinado por herencia: la pantalla `cancion` ya es **word-buttons** (mismos `bankWithKeys`/`wb-bank`/`wb-answer` que Phase 33). SRP-02 = **aplicar el tratamiento Editoriale de word-buttons de Phase 33 + la barra superior** (atrás circular + progreso "Frase X/N"), **sin chip de cronómetro** (los songs NO usan Contrarreloj), conservando el **auto-avance 600ms de modo canción** (intacto). Render del hueco en la letra y relleno post-corrección a criterio del planner, coherente con D-33-08/D-33-12.

### Resultados de sesión — anillo de score (SRP-03)
- **D-09 (alcance):** El **anillo de score + "X/Y correctos" aparece en TODAS las sesiones** (`repaso` / `test-completo` / `examen`). La pantalla `summary` es compartida → una sola pantalla de Resultados Editoriale, consistente. No se bifurca por `sessionMode`.
- **D-10 (denominador):** **X/Y = aciertos / ejercicios respondidos** (`sessionResults.length`), NO el total del set lanzado. Refleja lo que realmente se respondió (en repaso/examen la cascada D-54 puede cortar la sesión antes del final). El porcentaje del anillo se deriva de esa fracción.
- **D-11 (título):** **Reusar `summaryHeaderLabel`** existente, repintado serif (overline + título). Cero lógica nueva. La sección **"categorías afectadas (cascada)"** mapea al `summaryDelta` actual (la etiqueta `FALLÓ` ↔ `entry.failed`); la sección **"Errores cometidos"** ya existe (`summary-errors` / `summaryVariantSurface`). Es repintado, no lógica nueva.

### Picker de Repaso/Examen (SRP-04) — extrapolado
- **D-12 (contador):** El contador muestra **categorías seleccionadas** (`pickerCheckedCategoryIds.length`, p.ej. "3 categorías seleccionadas"). El conteo de ejercicios ya lo muestran `pickerStartLabel` (botón Empezar) y el aviso de test-completo → el contador no lo duplica.
- **D-13 (estilo de selección):** **Filas Editoriale con tick** — filas con hairline (estilo de las filas de categoría del Home / lista de canciones): nombre serif + check verde a la derecha cuando seleccionada, fila completa clicable. Reusa el `@change="pickerToggleCategory(cat.id)"` actual.
- **D-14 (sub-título de categoría):** Sí — **reusar el split del `name` por paréntesis (D-32-02)**: "Avere" + cursiva *presente indicativo*. Consistente con el Home. Presentacional, sin tocar datos.

### Claude's Discretion
- Estructura CSS concreta (ampliar `app.css`/`styles.css`), nombres de clases nuevas, técnica del anillo `conic-gradient` y su centro de %, técnica de los tiles de portada tintados con inicial serif (`repeating-linear-gradient`), render del hueco en la letra de canción y su relleno post-corrección, truncado o no de la lista de "categorías afectadas" (el handoff insinúa "+N más en cascada"; el `summaryDelta` actual las lista todas), y la maquetación de cada pantalla — todo a criterio del planner respetando "`app.css` base (sin Pico) + Editoriale encima" y "motor intacto".
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Diseño (fuente de verdad visual)
- `design_handoff_italiano_redesign/README.md` §4 (Canciones) y §5 (Resultados del examen) + Design Tokens (colores hex, 3 familias tipográficas, escala, radios, sombras). **Fidelidad alta** con las desviaciones conscientes D-02/D-06 (sin fracción de huecos, sin nivel). El picker (SRP-04) y la reproducción (SRP-02) NO están en el handoff — se extrapolan.
- `design_handoff_italiano_redesign/Italiano-Home.dc.html` — prototipo con todas las pantallas (turno 2 incluye canciones/resultados). Referencia visual; `support.js` NO va a producción.

### Decisiones heredadas (capa Editoriale base)
- `.planning/phases/32-cimientos-visuales-home-categor-as/32-CONTEXT.md` — D-32-01 (estado→color de punto), D-32-02 (split del `name` para título+tema), D-32-03 (paleta papel forzada / dark-mode off). **NOTA: Pico fue eliminado en Phase 32 — `app.css` es el base.**
- `.planning/phases/33-pantallas-de-ejercicio/33-CONTEXT.md` — barra superior Editoriale (D-33-10/11), tratamiento word-buttons (D-33-12), render del hueco + relleno post-corrección (D-33-08), caja de feedback (D-33-09). SRP-02 reutiliza estos.

### Requisitos / roadmap
- `.planning/REQUIREMENTS.md` — SRP-01..04 (los 4 requisitos de esta fase). NOTA: SRP-01 ("barra de progreso 9/14") y la meta "Nivel" se cumplen parcialmente a propósito por falta de dato fuente (D-02/D-06).
- `.planning/ROADMAP.md` §Phase 34 — goal + 4 criterios de éxito.

### Código a recrear (no tocar lógica)
- `index.html` ~líneas 274-315 (`currentScreen === 'canciones'`), ~320-373 (`picker`), ~868-935 (`cancion`), ~951-1100 (`summary`). Repintar el interior reusando los mismos `@click`/`x-for`/`x-text`/bindings.
- `src/screens/app.js` — getters presentacionales: `songsForDisplay` (~3078, AÑADIR derivación de artista por split + estado→color; NO existe artista/nivel ni progreso parcial), `summaryHeaderLabel`/`summaryDelta`/`summarySessionResults`/`summaryVariantSurface`, `pickerCheckedCategoryIds`/`pickerPoolSize`/`pickerStartLabel`. La **lógica** (`startSong`, `completeSession`, `completeSong`, `pickerToggleCategory`, cascada) NO se modifica. El score X/Y se computa de `sessionResults` (getter presentacional nuevo permitido).
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`songsForDisplay`** (`src/screens/app.js:3078`): expone `{id, title, phraseCount, status, statusLabel, vecesFallada}`. Falta exponer artista (split de `title`) y el color de estado para los tiles — añadidos presentacionales al objeto.
- **`songProgress`** persistido = `{status: 'no-hecha'|'pasada'|'fallada', lastPlayedAt, vecesFallada}`. NO hay fracción de huecos completados (base de D-02). `lastPlayedAt` existe pero D-01 no lo usa.
- **Pantalla summary ya tiene** `summaryDelta` (categorías antes→después, con `entry.failed`/`isRegression`/`isPromotion` → mapea a "categorías afectadas"/`FALLÓ`) y `summary-errors` con `summaryVariantSurface` (frase + Tu/Correcta + explicación → mapea a "Errores cometidos"). El **anillo** es lo único nuevo (computar score de `sessionResults`).
- **Picker:** `pickerCheckedCategoryIds` (array de ids marcados), `pickerToggleCategory`/`pickerSelectAll`/`pickerClearAll`, `pickerPoolSize`, `pickerStartLabel`, `pickerTimed`, aviso test-completo. Reutilizables verbatim; solo cambia presentación + contador (D-12).
- **Pantalla `cancion`** ya usa `wb-bank`/`wb-answer`/`bankWithKeys`/`songCheck`/`songAdvance` — mismas clases que word-buttons de Phase 33 (base de D-08).

### Established Patterns
- **`x-text` exclusivo** en todo binding de datos (invariante anti-XSS T-02-01). No introducir `x-html`. Texto de botones/labels hardcoded.
- **Double-defense Alpine:** outer `x-if="currentScreen === 'X' && <guard>"` (`songCurrentPhrase`, `summaryDelta`, `songSummaryDelta`) + null-checks en bindings.
- **Estética cambia, componentes/getters Alpine se conservan** (solo presentación) — igual que Phases 32/33.
- **Auto-avance 600ms es SOLO modo canción** (`sessionMode === 'cancion'`); modos gramática avanzan manual. D-08 lo respeta.

### Integration Points
- La capa Editoriale ya está enlazada en `<head>` desde Phase 32; esta fase solo añade reglas CSS para los bloques `canciones`/`cancion`/`summary`/`picker` y getters presentacionales (artista split, color de estado, score X/Y).
- El nuevo markup reemplaza el interior de cada `<template x-if="currentScreen === '...'">` reusando los mismos `@click`/`x-show`/`x-for`/bindings.
</code_context>

<specifics>
## Specific Ideas

- **Canciones:** tarjeta destacada (papel elevado, radio 18) con portada tile rayado + overline verde dinámico (CONTINUAR/EMPEZAR) + título serif + artista cursiva + barra por estado; lista con tiles 46px (inicial serif tintada) + título serif 17 + meta cursiva "Ultimo · N huecos" + punto de estado (verde/rojo/neutro). Sin fracción de huecos.
- **Resultados:** hero con anillo `conic-gradient` 72px (green Ndeg / `#e6ddcd`) + "%" en Space Grotesk al centro; al lado "X/Y" serif (Y = respondidas) + "correctos"; sección categorías afectadas (cascada, etiqueta `FALLÓ` roja) desde `summaryDelta`; errores con frase + "Tu: ~~x~~ / Correcta: y" + explicación.
- **Picker:** filas con tick verde + nombre serif + sub-título cursiva (split por paréntesis) + contador "N categorías seleccionadas"; Seleccionar/Quitar todo; toggle Contrarreloj; botón Empezar con `pickerStartLabel`.
- "Editoriale" = papel `#f4f0e8`, verde `#2f7d56`, rojo `#b5412e`, serif Spectral / Hanken Grotesk / Space Grotesk (disponibles desde Phase 32).
</specifics>

<deferred>
## Deferred Ideas

- **Flujo 2-pasos "Comprobar → Continuar"** en la reproducción de canción — fuera de scope (mismo criterio que D-33-01/03; UI puro, no rediseño de interacción).
- **Arte de portada de canción real** y **modo oscuro Editoriale** → ya en `Future Requirements` de REQUIREMENTS.md (no en v1.8).
- **Persistencia de progreso parcial intra-canción** ("9/14 huecos" real) → requeriría tocar el motor/`songProgress` (no es UI puro). Futura tarea si se quiere una barra de progreso real en la card Continuar.
- **Campos `artista`/`nivel`/`topic` por canción** → futura tarea de contenido si se quiere meta explícita en vez de derivada del `title`.

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`mobile-responsive-exercise-home.md`, score 0.9) — NO se pliega. Aplica a las pantallas de Phases 32/33 (Home + ejercicios), no a las 4 pantallas de Phase 34, y v1.8 es **desktop-only** (CLAUDE.md + nota de cierre de Phase 33 "defer mobile items"). Queda en el backlog de un milestone responsive futuro.
</deferred>

---

*Phase: 34-Canciones · Resultados · Picker*
*Context gathered: 2026-06-30*
