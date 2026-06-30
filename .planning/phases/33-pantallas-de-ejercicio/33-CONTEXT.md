# Phase 33: Pantallas de ejercicio - Context

**Gathered:** 2026-06-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Aplica el lenguaje **Editoriale** (papel cálido, serif Spectral, acento verde/rojo, barra superior unificada) a las **3 pantallas de práctica/examen** — **opción múltiple**, **emparejar**, **word-buttons** — recreando los estados visuales del handoff (selección/comprobado/feedback) **sobre el motor intacto**.

**Solo presentación (markup + CSS + getters/bindings presentacionales).** El motor NO se toca: cascada D-54, `applyResultToSession`/`applyImmediateFailure`, sampler, slot-engine, grading (`registry[type].grade`), `localStorage`, schema, migraciones. Consume la capa Editoriale de Phase 32 (tokens `--ed-*`, fuentes auto-hospedadas, `app.css` sobre Pico). `support.js`/`.dc.html` son referencia, no van a producción.

**Decisión transversal clave:** el autor **conserva los modelos de interacción actuales** (corregir al instante) en lugar de los flujos "Comprobar → Continuar" del handoff. Esta fase es **repintado visual + estados comprobado del handoff**, NO un rediseño de interacción. Dos criterios de éxito del ROADMAP/REQUIREMENTS se incumplen a propósito (ver decisiones D-01 y D-03 abajo).
</domain>

<decisions>
## Implementation Decisions

### Opción múltiple — modelo de interacción (EX-02, EX-03)
- **D-01 (DESVÍA de EX-03 a propósito):** Se **conserva el flujo 1-paso actual**: tocar una opción **corrige al instante** (`sessionSelectOption` → `grade` → `applyResultToSession`). **NO** se introduce el flujo 2-pasos del handoff (sin botón "Comprobar", sin estado "selección sin comprobar" `green-selection`). El teclado se mantiene como hoy (teclas 1-4 corrigen al instante). Por tanto el sub-criterio de EX-03 "selección (borde verde + green-selection + hueco rellenado pre-corrección)" y "CTA Comprobar" **no se cumplen**; el resto de EX-03 sí.
- **D-02:** Los **estados *comprobado*** del handoff SÍ se aplican tras el click: opción correcta → `green-tint` + borde verde + texto `green-on-tint` + **✓**; opción elegida-incorrecta → `red-tint` + borde rojo + texto `red-text` + **✗**; resto de opciones → `opacity: 0.5`; **caja de feedback** verde/rojo (radio 14). Estos mapean a las clases `.correcta`/`.incorrecta` actuales, repintadas en Editoriale.
- **D-04 (avance):** **Avance manual siempre** — tras corregir, el usuario pulsa "Continuar"/"Siguiente" (tanto acierto como fallo). Conserva el comportamiento actual de los modos gramática (sin auto-avance en acierto; el auto-avance 600ms sigue siendo SOLO de modo canción, intacto). El CTA al fondo dice "Continuar →" cuando hay feedback.

### Emparejar — modelo de interacción (EX-04)
- **D-03 (DESVÍA de EX-04 a propósito):** Se **conserva el flujo por-pareja actual**: cada pareja se valida al instante (flash rojo + cascada inmediata D-61 al primer fallo, `matchHadFailure`). **NO** se adopta el "empareja todo y luego Comprobar" del handoff. Por tanto el sub-criterio de EX-04 "CTA deshabilitado hasta completar" **no se cumple** (no hay CTA Comprobar en match).
- **D-05:** Estados visuales del handoff aplicados **solo los compatibles con el flujo por-pareja — planner decide**: badge numérico por par + `green-tint` en píldoras emparejadas son deseables; los textuales "eligiendo…"/"?" y el borde discontinuo de candidata se aplican solo si encajan con el layout actual de 2 columnas (`.match-grid`/`.match-col`) sin forzar. Reemplaza/repinta los sufijos actuales (¹/ᵃ, `.match-selected`, `.match-consumed`, `.match-flash`).

### Bloque de pregunta — overline, sugerencia, hueco (EX-02)
- **D-06 (overline):** **Reusar `sessionContextLabel`** existente, repintado como overline Editoriale (MAYÚSCULAS, Hanken 11, letter-spacing 2–2.5px, color `faint-2`). Sin nueva lógica de derivación.
- **D-07 (sugerencia cursiva):** **Omitir** la "sugerencia en cursiva" del handoff ("Elige la forma correcta de avere"). No existe campo fuente en los datos y añadirlo tocaría contenido/JSON (fuera de "UI puro"). El overline + la frase serif ya orientan.
- **D-08 (render del hueco):** La frase del prompt trae el hueco como `___` (verificado en los JSON). Mostrar la frase serif (30px) con el **hueco visible estilizado** y, **tras corregir, rellenarlo** con la respuesta: **verde subrayado** si acierto, **rojo tachado** si fallo. Aplica a **opción múltiple y word-buttons**. (Es relleno post-corrección, no pre-selección — coherente con el flujo 1-paso de D-01.)

### Caja de feedback (EX-03)
- **D-09:** Caja de feedback con **título serif en italiano**: **"¡Esatto!"** (acierto) / **"Quasi…"** (fallo), fiel al mock, seguido de la **explicación pedagógica actual** (`payload.explanation`, vía la clase `.session-explanation` compartida + el affordance "¿Por qué?" en acierto, que se conservan). Fondo `green-tint`/`red-tint` con su borde según resultado.

### Barra superior (EX-01)
- **D-10 (atrás / volver / reiniciar):** **Botón atrás circular** arriba-izquierda = **"Volver al home"** (conserva la confirmación `requestReturnToHome` actual). **"Reiniciar ejercicios" se queda abajo** como acción secundaria (no se pierde funcionalidad UX-01). La barra superior lleva además: **barra de progreso verde** (% del set) + **contador `NN/NN`** (Space Grotesk).
- **D-11 (cronómetro):** Cuando Contrarreloj está activo, mostrar un **chip de cronómetro** con los segundos restantes (Space Grotesk) en la barra superior **Y mantener la barra que se vacía** como refuerzo visual. La mecánica (`sessionTimed`, `sessionTimeRemainingMs`, `sessionTimeLimitMs`) queda **intacta**; solo cambia la presentación.

### Word-buttons (EX-05)
- **D-12 (criterio del planner):** No está en el handoff. El planner **extrapola el lenguaje Editoriale**: banco de palabras, huecos estables con relleno post-corrección (D-08), feedback verde/rojo y título italiano (D-09) **coherentes con opción múltiple**. Conserva la mecánica actual (`wordButtonsAddWord`/`RemoveWord`/`Check`, `bankWithKeys`, sufijos ¹..⁹).

### Claude's Discretion
- Estructura CSS concreta (ampliar `app.css`/`styles.css`), nombres de clases nuevas, técnica del hueco estilizado y su relleno, forma exacta del chip de cronómetro y de la barra de progreso superior, qué estados de match son "compatibles" (D-05), y la maquetación full-height con CTA al fondo — todo a criterio del planner respetando "Pico como base + Editoriale encima" y "motor intacto".
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Diseño (fuente de verdad visual)
- `design_handoff_italiano_redesign/README.md` §2 (Ejercicio · opción múltiple), §3 (Ejercicio · emparejar) y Design Tokens — colores hex, 3 familias tipográficas, escala, radios, sombras, estados de interacción. **Fidelidad alta** (con las desviaciones conscientes D-01/D-03).
- `design_handoff_italiano_redesign/Italiano-Home.dc.html` — prototipo con TODAS las pantallas (turno 2 = ejercicios). Es **referencia visual**; `support.js` NO va a producción.

### Decisiones heredadas (Phase 32 — capa Editoriale base)
- `.planning/phases/32-cimientos-visuales-home-categor-as/32-CONTEXT.md` — D-01 (estado→color de punto), D-02 (split del `name` para título+tema), D-03 (paleta papel forzada / dark-mode off). Esta fase **consume** los tokens `--ed-*`, las fuentes de `vendor/fonts/` y `app.css` que creó Phase 32.

### Requisitos / roadmap
- `.planning/REQUIREMENTS.md` — EX-01..05 (los 5 requisitos de esta fase). NOTA: EX-03 ("CTA Comprobar") y EX-04 ("CTA hasta completar") se incumplen a propósito por D-01/D-03.
- `.planning/ROADMAP.md` §Phase 33 — goal + 5 criterios de éxito (con las mismas desviaciones conscientes).

### Código a recrear (no tocar lógica)
- `index.html` ~líneas 390-668 — bloque `<template x-if="currentScreen === 'session'">`: barra de contexto/progreso, timer, sub-templates multiple-choice / word-buttons / match, botones Reiniciar/Volver.
- `src/screens/app.js` — getters/handlers de sesión presentacionales (`sessionContextLabel`, `sessionProgressLabel`, `multiChoiceOrder`, `bankWithKeys`, `matchLeft`/`matchRight`, `sessionTimeRemainingMs`). La **lógica** (`sessionSelectOption`, `applyResultToSession`, grading, cascada) NO se modifica.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Sub-templates por tipo ya separados** en `index.html` (`x-if="...type === 'multiple-choice' | 'word-buttons' | 'match'"`): repintar cada uno sin entremezclar.
- **Clases de feedback existentes:** `.correcta`/`.incorrecta` (opción correcta/elegida-incorrecta), `.session-explanation` (compartida por los 3 tipos), `.match-selected`/`.match-consumed`/`.match-flash`, `.wb-bank`/`.wb-answer`/`.wb-placed`, `.button-row`. Mapear D-02/D-05/D-09 sobre estas clases.
- **Timer presentacional:** `.session-timer` + `.session-timer-bar` (`<progress>` Pico) + `.session-timer-secs`, gobernados por `sessionTimed && sessionFeedback === null`. D-11 añade un chip y conserva la barra.
- **Contexto/progreso:** `sessionContextLabel` (h2 `.session-context`) y `sessionProgressLabel` (`<header>`) — reusar para overline (D-06) y contador NN/NN.
- **Hueco en datos:** los `prompt` traen `___` literal (p.ej. `"Lui ___ ventidue anni."`) → split por `___` para D-08.

### Established Patterns
- **`x-text` exclusivo** en todo binding de datos (invariante anti-XSS T-02-01). No introducir `x-html`. Texto de botones (Comprobar/Siguiente/Continuar) hardcoded, no dinámico.
- **Double-defense Alpine:** outer `x-if="currentScreen === 'session' && sessionCurrentExercise"` + null-checks en bindings (`matchFlashIdx && ...`).
- **Estética cambia, componentes/getters Alpine se conservan** (solo presentación) — igual que Phase 32.
- **Sin auto-avance en modos gramática** (repaso/test/examen); auto-avance 600ms es SOLO modo canción (quick-260615-r3b). D-04 lo respeta.

### Integration Points
- La capa Editoriale ya está enlazada en `<head>` desde Phase 32; esta fase solo añade reglas CSS para el bloque `session` y, a lo sumo, getters presentacionales (overline/contador) sin tocar la lógica de sesión.
- El nuevo markup reemplaza el interior del `<template x-if="currentScreen === 'session'">` reusando los mismos `@click`/`x-show`/`x-for`/bindings.
</code_context>

<specifics>
## Specific Ideas

- Barra superior: atrás circular (‹) arriba-izq + barra de progreso verde (% del set) + contador `NN/NN` (Space Grotesk) + chip de cronómetro (segundos) cuando Contrarreloj activo, **manteniendo** la barra Pico que se vacía.
- Opción múltiple: frase serif 30 con hueco `___` visible; al corregir, hueco relleno (verde subrayado acierto / rojo tachado fallo). Opciones serif 18 fondo `surface` borde `border-soft`; comprobado → `green-tint`✓ / `red-tint`✗ / resto `opacity .5`; caja feedback con título serif italiano "¡Esatto!"/"Quasi…" + explicación.
- Emparejar: 2 columnas de píldoras serif con badge numérico por par y `green-tint` en emparejadas; validación por-pareja con flash rojo (conservada).
- "Editoriale" = papel `#f4f0e8`, verde `#2f7d56`, rojo `#b5412e`, serif Spectral / Hanken Grotesk / Space Grotesk (ya disponibles desde Phase 32).
</specifics>

<deferred>
## Deferred Ideas

- **Flujo 2-pasos "Comprobar → Continuar"** en opción múltiple y **"emparejar todo y comprobar"** en match (tal y como los dibuja el handoff): rechazados conscientemente para v1.8 (D-01/D-03). Si en el futuro se quiere ese modelo de interacción → nuevo trabajo de motor/UX, no UI puro.
- **Campo `topic`/`hint` por ejercicio** para una sugerencia en cursiva real (D-07 lo omite): futura tarea de contenido si se desea.
- **Pantallas Canciones · Resultados · Picker** → Phase 34 (heredan la barra superior de esta fase para la reproducción de canción).

None del resto — la discusión se mantuvo dentro del scope de la fase.
</deferred>

---

*Phase: 33-Pantallas de ejercicio*
*Context gathered: 2026-06-30*
