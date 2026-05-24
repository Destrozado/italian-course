---
phase: 6
slug: polish-ux-post-sesion-reiniciar-y-review-errores
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-24
---

# Phase 6 — Contrato de Diseño UI: Polish UX post-sesión (Reiniciar + Errores cometidos)

> Contrato visual e interactivo para los dos pulidos UX de Phase 6 (UX-01 + UX-02) sobre las pantallas existentes `session` y `summary`. Generado por `gsd-ui-researcher` tras leer CONTEXT (D-100..D-112), UI-SPEC Phase 3 (sub-templates + `.button-row` + `.incorrecta`) y UI-SPEC Phase 4 (Pico classless + Spanish copy + 60/30/10 tokens).
>
> **Idioma:** UI y copy en español (FOUND-04). Tokens/CSS vars/identificadores en inglés (heredados de Pico/styles.css).
> **Alcance:** (a) un nuevo botón en `.button-row` bajo `<hr>` de la pantalla session; (b) una nueva sección `<section class="summary-errors">` insertada bajo `<ul.summary-delta>` en la pantalla summary. Cero pantallas nuevas, cero tokens nuevos, cero terceros nuevos.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (proyecto vanilla — Alpine.js 3.15.12 + Pico CSS 2.1.1 classless, sin build step) |
| Preset | not applicable (rechazado al iniciar el proyecto — locked en CLAUDE.md) |
| Component library | Pico CSS 2.1.1 classless (CDN, SRI pinned en `index.html` líneas 9-13) |
| Icon library | none — glifos Unicode existentes (`←`, `↔`, `→`, `⚠`, `●`, `✓`, `★`, `¹²³ᵃᵇᶜ`); Phase 6 NO añade glifos nuevos |
| Font | Pico defaults (system stack heredado: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`) |
| State framework | Alpine.js 3.15.12 (`x-data`, `x-if`, `x-for`, `x-show`, `x-text`, `@click`, `@keydown.window`) |

**Anclas de coherencia visual (heredadas, NO reinventar):**
- `<template x-if="currentScreen === '...'">` switch sobre `currentScreen` (5 valores; Phase 6 NO añade pantallas).
- `<article>` es el contenedor exterior de cada pantalla. `<header>` lleva el título.
- `.button-row` (NO `role="group"` — lección recurrente UAT 02-03/02-04) es el wrapper canónico para botones adyacentes.
- `.incorrecta` (rojo sólido) y `.correcta` (verde sólido) son las clases de feedback heredadas Phase 1/2.
- `secondary` (clase Pico) marca botones que no compiten con la acción principal.
- Strings hardcoded en español; sin emojis decorativos; cero `x-html` (T-02-01 invariante anti-XSS).
- `← Volver al home` es el wording fijo de retorno en picker/session/summary/backup.

---

## Spacing Scale

Heredado 1:1 de Pico defaults + convenciones Phase 1-5. **No declares nuevos tokens.** Todo spacing en Phase 6 proviene de las variables Pico (`--pico-spacing`) o múltiplos rem de 0.25rem (= 4px @ root 16px).

| Token (rem) | Pixels | Uso en Phase 6 |
|-------------|--------|----------------|
| 0.25rem | 4px | Padding interno alrededor del separador `↔` de la fila match en errores |
| 0.5rem  | 8px  | Gap interno del `<li>` multi-línea en `.summary-errors`; `padding: 0.5rem 0` entre filas (mismo ritmo que `.summary-delta`) |
| 0.75rem | 12px | (no usado en Phase 6 — reservado para futuras revisiones) |
| 1rem    | 16px | Gap horizontal del `.button-row` (existente) — el botón Reiniciar lo hereda intacto |
| 1.5rem  | 24px | `margin-top` de `<section class="summary-errors">` para separarlo de `<ul.summary-delta>` (mismo ritmo que `.button-row` margin-block) |
| 2rem    | 32px | (no usado en Phase 6) |

**Excepciones:** ninguna. Los dos componentes nuevos (botón en `.button-row` + sección `.summary-errors`) reusan literalmente los valores que ya viven en `styles.css`. **NO hay `<hr>` añadido** entre `<ul.summary-delta>` y `<section class="summary-errors">` — la separación es por `margin-top: 1.5rem`, coherente con el ritmo vertical existente del summary (Pico ya espacia `<ul>` y `<section>` con su rhythm by default).

**Reglas reforzadas:**
- **Reusar `.button-row`** existente en la pantalla session (línea 415 actual: `← Volver al home`) — Phase 6 añade un segundo `<button>` dentro del MISMO `.button-row`. Los dos botones reparten el ancho con `flex: 1` (heredado).
- **NO inventar variables CSS** para spacing. Si un selector nuevo (e.g. `.summary-errors li`) necesita un valor específico, usar literal rem en el selector dedicado.
- **Lista plana cronológica** (D-108) sin scroll dedicado dentro de la sección — el scroll del `<main>` es suficiente; un Test completo de 271 ejercicios con 30 errores cabe naturalmente en la página (target desktop, FOUND-03).

---

## Typography

Pico classless ya define la jerarquía. Phase 6 **NO toca `<h1>`/`<h2>`/`<p>` defaults** y NO añade tamaños ni pesos nuevos.

| Role | Size | Weight | Line Height | Uso en Phase 6 |
|------|------|--------|-------------|----------------|
| Body | 1rem (Pico default ~16px) | 400 | 1.5 (Pico default) | Texto plano de las líneas "Tu respuesta: ..." y "Respuesta correcta: ..." dentro de `<li>` en `.summary-errors` |
| Label / Button | 1rem (Pico default) | 400 | 1.5 (Pico default) | Etiqueta del botón "Reiniciar ejercicios" (igual densidad que `← Volver al home` adyacente) |
| Heading session | `<h3>` Pico default (~1.25rem) | 600 (Pico) | 1.2 | Encabezado `Errores cometidos` de la nueva sección |
| Prompt del ejercicio en fila de error | 1rem | 600 (vía `<strong>`) | 1.5 | El prompt original (frase con hueco / instrucción de match) se muestra en `<strong>` arriba de cada `<li>` |

**Patrón de énfasis dentro de cada fila de error (D-109):**
- Prompt: `<strong x-text="...">` — peso semibold heredado de Pico (sin override).
- Etiqueta `Tu respuesta:` — texto plano.
- Valor `userAnswer` renderizado: envuelto en `<span class="incorrecta">` (rojo sólido + texto blanco, padding mínimo — clase existente).
- Etiqueta `Respuesta correcta:` — texto plano.
- Valor correcto: envuelto en `<strong>` semibold sin color (el énfasis viene del peso, no del color verde — ver §Color).

**Forbidden:**
- Custom font-size CSS en `.summary-errors` o sus descendientes. Cualquier tamaño viene de Pico o de los selectores existentes (`.kbd-hint`, `.picker-warning`).
- NO declarar `font-style: italic` en las líneas de error — coherencia con `.summary-delta` que ya usa texto plano (cero adornos).

---

## Color

Phase 6 **introduce CERO tokens de color nuevos.** Todos los colores vienen de Pico vars (con fallback hex en `styles.css`) y reusan literalmente las clases heredadas `.incorrecta` y `.correcta`.

| Role | Value (CSS var con fallback) | Uso en Phase 6 |
|------|------------------------------|----------------|
| Dominant (60%) — surface | `var(--pico-background-color)` (light/dark auto) | Fondo de `<article>` summary y `<article>` session (sin cambios) |
| Secondary (30%) — chrome | `var(--pico-muted-border-color, #e0e0e0)` | Border-bottom de cada `<li>` en `.summary-errors` (mismo ritmo separador que `.summary-delta`) |
| Accent (10%) — primary | `var(--pico-primary, #1095c1)` | NO se usa en Phase 6. Ningún botón nuevo es primario. |
| Accent secundario muted | clase Pico `secondary` (heredada) | Botón "Reiniciar ejercicios" (D-103 explícito) — mismo tratamiento que `← Volver al home` adyacente |
| Destructive / error (rojo) | `var(--pico-color-red-500, #d32f2f)` + `--pico-color-red-600, #b71c1c` (border) | `.incorrecta` aplicada sobre `<span>` de `userAnswer` en cada fila de error — clase existente reusada literal |
| Success (verde) | `var(--pico-color-green-500, #2e7d32)` | NO se usa en Phase 6 sobre el valor "correcta" — ver decisión de Claude's discretion abajo |
| Muted (atenuado) | `var(--pico-muted-color, #6c757d)` | Etiquetas "Tu respuesta:" / "Respuesta correcta:" si el planner decide diferenciarlas del texto principal (opcional — ver §Notas) |

### Accent reservado para (lista explícita)

**El `var(--pico-primary)` (cian) NO aparece en Phase 6.** Ningún componente nuevo es primario.

**La clase Pico `secondary` (gris muted)** se aplica a UN solo elemento nuevo en Phase 6:
- Botón `Reiniciar ejercicios` en la pantalla session — `<button type="button" class="secondary" ...>`.

Todo el resto de elementos nuevos (la sección `.summary-errors` y sus `<li>`) son contenedores no-interactivos sin color de acento.

### Decisión clave — color del valor "Respuesta correcta" en fila de error

CONTEXT D-109 dice: *"`<strong>` para "respuesta correcta" (verde no es Pico estándar, valorar)"*.

**Resolución (Claude's discretion):** **NO usar verde sólido sobre el valor correcto.** Aplicar solo `<strong>` (peso semibold heredado de Pico) sin clase de color.

Razones:
1. **Coherencia con multi-choice en sesión:** la línea actual (index.html línea 276-278) muestra `Respuesta correcta: <strong x-text="...">` sin clase `.correcta` envolvente — el peso es la única señal. Phase 6 replica ese patrón en summary.
2. **`.correcta` es para botones, no para spans de texto:** la clase `button.correcta` (styles.css línea 35) hereda `color: white` + `background-color: green` — aplicada sobre un `<span>` de prosa rompe la legibilidad (verde sólido detrás del texto en mid-flow).
3. **`.wb-correct-answer` (styles.css línea 223) usa verde sobre texto, NO sobre fondo** — pero ese verde es un párrafo aislado (`<p class="wb-correct-answer">`), no inline dentro de una fila. Replicarlo dentro de `<li>` añadiría ruido visual.
4. **El rojo del `.incorrecta` ya carga el contraste** — el valor "tu respuesta" (rojo sólido + blanco) destaca claramente; el valor "respuesta correcta" gana visibilidad por contraste relativo (texto en color por defecto) sin competir.

**Si el autor en UAT pide explícitamente verde sobre el valor correcto:** añadir clase `.summary-errors-correct` definida como `color: var(--pico-color-green-500); font-weight: 600;` (sin background) — sería un follow-up de pulido, NO bloqueante del contrato.

### Estados visuales nuevos (a definir como overrides mínimos en `styles.css`)

```css
/* ─── Phase 6 — Sección "Errores cometidos" en summary (D-108/D-109) ──────
 *
 * Sección post-sesión que lista cada ejercicio fallado con prompt + tu
 * respuesta (rojo) + respuesta correcta (semibold sin color). Renderizada
 * solo cuando sessionResults.some(r => !r.correct) (D-108 x-if guard).
 *
 * Spacing rhythm coherente con .summary-delta (líneas styles.css 147-152):
 * lista sin viñetas, padding vertical 0.5rem por <li>, border-bottom muted
 * salvo el último elemento. margin-top: 1.5rem separa la sección del
 * <ul.summary-delta> de arriba sin requerir <hr>.
 *
 * El header <h3> hereda Pico defaults (~1.25rem, weight 600) sin override.
 */
.summary-errors {
  margin-top: 1.5rem;
}
.summary-errors h3 {
  margin-bottom: 0.5rem;
}
.summary-errors ul {
  list-style: none;
  padding-left: 0;
}
.summary-errors li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.summary-errors li:last-child {
  border-bottom: none;
}

/* Span con la respuesta del usuario (rojo). Reusa los tokens existentes
 * de .incorrecta (button.incorrecta líneas 41-45) sin acoplarse al
 * selector "button" — define una variante para uso inline en spans.
 *
 * NOTA: el planner puede reusar literal la clase `.incorrecta` sobre el
 * <span> si Alpine lo permite — Pico no tiene selectores que restrinjan
 * la clase a button. Esta variante explícita es defensiva por si el CSS
 * existente de button.incorrecta colisiona visualmente (padding del
 * button no aplica a span). Decisión del executor — ambas son válidas.
 *
 * Spacing: padding 0 vertical + 0.25rem (4px) horizontal. Multiplo del
 * token base de la spacing scale; cero vertical porque la line-height
 * 1.5 de Pico ya da respiración suficiente al span inline, y 4px
 * horizontal es separación mínima válida entre el texto y el borde
 * rojo del background. */
.summary-errors .user-answer {
  background-color: var(--pico-color-red-500, #d32f2f);
  color: white;
  padding: 0 0.25rem;
  border-radius: var(--pico-border-radius, 0.25rem);
  /* Word-wrap defensivo para userAnswer largos (word-buttons join + match
   * pair con strings de 50+ chars). */
  overflow-wrap: anywhere;
}
```

**Total CSS nuevo:** ~30 líneas, 1 sección nueva, 0 nuevas CSS vars, 0 nuevos colores.

### Banner / sin-banner

- **Phase 6 NO añade banner alguno** (D-102 explícitamente rechaza confirmación; D-108 explícitamente rechaza renderizar la sección vacía cuando no hay errores).
- El banner de Test completo in-flight (`.inflight-banner` Phase 2) y el banner de backup (`.backup-banner` Phase 4) siguen idénticos; no son afectados por Phase 6.

### Contraste WCAG 2.1 AA

- `.incorrecta` (rojo sólido `#d32f2f` + texto blanco): ratio verificado en Phase 1/2 ≥ 4.5:1. Reusado literal en Phase 6.
- `<strong>` semibold sin color sobre fondo Pico default: contraste = Pico default (verificado por upstream Pico). Phase 6 no toca.
- Texto plano "Tu respuesta:" / "Respuesta correcta:" sobre fondo Pico default: contraste = Pico default.

---

## Copywriting Contract

**Toda la copy en español** (FOUND-04). Tono neutro factúal — sin emojis decorativos, sin gamificación, sin signos de exclamación. Strings hardcoded en `index.html` (FOUND-04 — sin i18n).

### UX-01 — Botón "Reiniciar ejercicios" en pantalla session

| Element | Copy | Decisión |
|---------|------|----------|
| Label del botón | `Reiniciar ejercicios` | Default de CONTEXT D-103 confirmado. Cabe holgado en `.button-row` flex (~50% del ancho disponible al lado de `← Volver al home`); no requiere abreviación a `Reiniciar`. SIN icono Unicode delante (e.g. `↻`) — coherencia con `← Volver al home` que sí tiene flecha porque indica dirección; "Reiniciar" no necesita glifo direccional. |
| `aria-label` (opcional, mismo texto que label) | (no se declara — el texto del botón es suficiente para screen readers) | Coherente con `← Volver al home` que tampoco tiene `aria-label` explícito (el `←` es decorativo y el texto basta). |
| Tooltip (`title`) | NO declarado | Coherente con el resto de la app (Phase 1-5 nunca usaron tooltips). |

**Visibilidad condicional:** `x-show="sessionMode === 'repaso'"` (D-100 — oculto en Test completo).

**Estados visuales del botón:**

| Estado | Visual | Trigger |
|--------|--------|---------|
| Idle clickable | Pico default `secondary` (gris muted, mismo que `← Volver al home`) | Por defecto durante toda la sesión Repaso |
| Hover (desktop) | Heredado de Pico secondary hover | Mouseover |
| Focus-visible (teclado) | Heredado de Pico `:focus-visible` outline | Tab navigation residual (el foco vive en `<body>` por D-72 pero Tab funciona como fallback) |
| Pressed | Heredado de Pico `:active` | Click |
| Oculto | `x-show="sessionMode === 'repaso'"` aplica `display: none` | `sessionMode === 'test-completo'` |
| Disabled durante feedback | **NO** — el botón permanece SIEMPRE clickable durante la sesión Repaso, incluso con `sessionFeedback === 'correct'` o `'incorrect'` activo | D-103 explícito: "visible durante toda la sesión (no matter sessionFeedback state)" |

**Decisión sobre disabled durante auto-advance (Claude's discretion):** **NO grey-out durante feedback verde.** El usuario puede pulsar Reiniciar entre que respondió correctamente y los 600ms del auto-advance. El handler `restartRepaso()` debe llamar `cancelAutoAdvance()` defensivamente (D-104 ya lo recoge: "Cancelar autoAdvance + matchFlash defensivo") para evitar que el setTimeout dispare `sessionAdvance()` sobre el state ya reseteado.

**Keyboard shortcut (Claude's discretion resuelto):** **Sin atajo de teclado en v1.**

Razones:
1. **El conjunto actual de atajos está saturado:** la pantalla session ya usa 1-9 (multi-choice + word-buttons + match izq), a-i (match der), Backspace (word-buttons quita última), Enter/Space (avanza tras fallo / comprueba word-buttons). Añadir `R` colisiona con teclados que envían `R` por Ctrl+R (recarga) — el handler global filtra modifiers (D-72) pero la ergonomía del usuario espera Ctrl+R para recargar la pestaña.
2. **`Esc` colisiona con el comportamiento esperado:** algunos usuarios esperan que Esc cierre modales o vuelva atrás. `Esc → restartRepaso` rompería ese mental model.
3. **El botón está siempre visible:** click puro es la affordance principal. El dolor del UAT (4 clicks vs 1 click) ya queda resuelto sin teclado.
4. **Reconsiderar en v2:** si el autor en UAT pide explícitamente `R` o `F5` o cualquier otra tecla, añadir el handler en una fase futura sin tocar el contrato base.

**Disabled state defensivo (edge `sessionExerciseIds` vacío):** El handler `restartRepaso()` debe defenderse del caso "buildSession devuelve 0 ejercicios" (e.g., todas las categorías quedaron sin ejercicios reseteables tras la cascada). Comportamiento esperado: el botón sigue clickable, el handler ejecuta `buildSession`, si `result.exerciseIds.length === 0` mostrar `backupLastMessage`-style message o simplemente quedarse en la sesión vacía (decisión del planner). El UI-SPEC NO prescribe un disabled visual basado en estado interno — sería un over-engineering para un edge improbable.

**Visual cue tras el reset (Claude's discretion):** **NO añadir flash/animación de confirmación** tras pulsar Reiniciar.

Razones:
1. **El cambio del indicador `sessionProgressLabel`** (de `Ejercicio 15 / 20` a `Ejercicio 1 / 20`) y el render del nuevo prompt SON la confirmación visual natural.
2. **Coherencia con el resto de la app:** ninguna acción en Phase 1-5 dispara un flash/toast de "operación completada" (excepto el `backupLastMessage` que es persistente, no transitorio).
3. **Tono sobrio del proyecto:** el autor explícitamente prefiere zero fanfare (D-37 / Phase 2 establecido).

### UX-02 — Sección "Errores cometidos" en pantalla summary

| Element | Copy |
|---------|------|
| Header de la sección | `Errores cometidos` (default ROADMAP confirmado) |
| Etiqueta antes del prompt | (no hay etiqueta — el prompt va directo en `<strong>` arriba de cada `<li>`) |
| Etiqueta antes del valor del usuario | `Tu respuesta: ` (con espacio final, antes del `<span class="user-answer">`) |
| Etiqueta antes del valor correcto | `Respuesta correcta: ` (con espacio final, antes del `<strong>`) |
| Separador match `↔` entre left y right | `↔` (Unicode U+2194 LEFT RIGHT ARROW) con `&nbsp;` o spaces a ambos lados — coherente con CONTEXT D-109: `${userAnswer.left} ↔ ${userAnswer.right}` |
| Fallback si no se puede recuperar el `correctRight` del match | `(no se pudo determinar la pareja correcta — consulta el ejercicio)` (texto plano sin clase) |
| Fallback si `userAnswer === null/undefined` (edge inFlightTest pre-Phase 6 reanudado) | Omitir las dos líneas "Tu respuesta:" + "Respuesta correcta:" y mostrar solo el prompt. La fila sigue existiendo (sigue siendo un error contabilizado), pero la captura no está disponible para errores pre-migración. NO mostrar `(sin detalle)` literal — la ausencia es más limpia visualmente que un placeholder. |
| Estado vacío (0 errores) | **NO renderizar la sección** — `<template x-if="sessionResults.some(r => !r.correct)">` (D-108). Sin mensaje "sin errores", sin emoji `✓`, sin párrafo "¡todo correcto!" — la ausencia de la sección es la señal. |
| Singular vs plural en el header | `Errores cometidos` se mantiene en plural también cuando hay solo 1 error. Coherente con `streakLabel` Phase 2 que no distingue singular/plural ("1 / 21 d"). |

**Tono y reglas heredadas (sin cambios):**
- `x-text` exclusivamente (T-02-01 invariante anti-XSS).
- Texto sin emojis decorativos. El `↔` del match es semántico (indica dirección bidireccional), no decorativo.
- Capitalización preservada del JSON (NFC normalizado al cargar — CONT-06).
- Sin signos de exclamación, sin reformulaciones positivas, sin "¡ánimo!", sin "vuelve a intentarlo".

### Edge cases de copywriting

- **Prompt largo (>40 chars):** word-wrap natural; sin truncate. El `<strong>` envuelve todo el prompt completo.
- **userAnswer word-buttons con 5+ palabras:** `userAnswer.join(' ')` produce una frase larga; el `<span class="user-answer">` con `overflow-wrap: anywhere` la envuelve a la siguiente línea dentro de la celda del `<li>` (gap: 0.25rem mantiene la línea siguiente legible).
- **Prompt con caracteres especiales (apóstrofes ASCII `'` por CONT-06):** se renderiza literal via `x-text`; cero riesgo XSS porque NUNCA usamos `x-html`.

### Destructive actions

**Phase 6 introduce 1 acción semánticamente destructiva** (UX-01 reiniciar descarta aciertos no-comprometidos), pero D-102 explícitamente decide **NO mostrar confirmación**:

| Action | Confirmation pattern |
|--------|---------------------|
| `Reiniciar ejercicios` (UX-01) | **NO confirmación.** Reset directo en 1 clic. Justificado por D-102: el dolor que motiva la feature es "1 click vs 4 actual clicks" — añadir confirmación devolvería el flujo a 2 clics y abriría modal. Los fallos D-54 ya están persistidos (no se deshacen); los aciertos descartados son consistentes con SESSION-08 que ya descarta por defecto al abandonar Repaso. |

**Phase 6 NO añade nuevos call-sites de `requestConfirm()`** — sigue habiendo 5 call-sites (los 4 de Phase 2 + el 5º de D-76 Phase 4).

---

## Component Inventory (Phase 6 additions)

| Component | Type | DOM location | Sub-states owned |
|-----------|------|--------------|------------------|
| Botón `Reiniciar ejercicios` | Button (secondary) | Dentro del `.button-row` existente bajo `<hr>` del session template (index.html línea 414-415), DELANTE de `← Volver al home` | None — handler `restartRepaso()` lee `sessionMode` + `pickerCheckedCategoryIds` + `state` + `content` |
| `<section class="summary-errors">` | Section block | Dentro del summary template, INMEDIATAMENTE DESPUÉS de `<ul class="summary-delta">` (línea 458) y ANTES del botón `Volver al home` (línea 460) | Lee `sessionResults` (existente) + `content.exerciseById` (existente) |
| `<h3>Errores cometidos</h3>` | Heading | Primer hijo de `<section class="summary-errors">` | n/a |
| `<ul>` interna con `<li>` por error | List | Segundo hijo de la sección | n/a |
| Sub-template por `ex.type` dentro del `<li>` | Conditional render | Cada `<li>` dispatcha por `content.exerciseById[result.exerciseId].type` con `<template x-if="...">` para multi-choice / word-buttons / match | n/a (todo derivado) |
| `<span class="user-answer">` | Inline highlight | Dentro de cada `<li>`, envuelve `userAnswer` renderizado | n/a (estilo puro) |
| Sub-estado nuevo en `appShell` factory: `matchFirstWrongPair: null` | Reactive data | `src/screens/app.js` líneas ~155 (junto a otros sub-estados match) | Setea `matchPickRight` bajo `!matchHadFailure`; resetea `resetSession()` + `restartRepaso()` |

---

## Visual Wireframes

### Pantalla session (post-Phase 6, modo Repaso 20)

```
┌──────────────────────────────────────────────────────────────────────┐
│ <article @keydown.window="handleSessionKey">                         │
│   <header>Ejercicio 7 / 20</header>                                  │
│                                                                      │
│   <p>Yo ___ un coche.</p>                                            │
│                                                                      │
│   ┌──────────┬──────────┬──────────┬──────────┐                      │
│   │   ho     │   hai    │    ha    │  hanno   │  ← multi-choice .button-row
│   └──────────┴──────────┴──────────┴──────────┘                      │
│                                                                      │
│   <hr>                                                               │
│                                                                      │
│   ┌────────────────────────────────┬─────────────────────────────────┐│
│   │     Reiniciar ejercicios       │      ← Volver al home          ││  ← .button-row
│   │     (secondary, NEW Phase 6)   │      (secondary, existing)     ││     flex: 1 cada uno
│   └────────────────────────────────┴─────────────────────────────────┘│
│                                                                      │
│ </article>                                                           │
└──────────────────────────────────────────────────────────────────────┘
```

**Vertical order exacto:**
1. `<header>` con `sessionProgressLabel`
2. `<p>` con `payload.prompt`
3. Sub-template por tipo (multi-choice / word-buttons / match) — sin cambios
4. `<hr>` separador
5. `.button-row` con DOS botones: `Reiniciar ejercicios` (izquierda) + `← Volver al home` (derecha)

**Modo Test completo:** El `.button-row` solo contiene `← Volver al home` (el botón Reiniciar tiene `x-show="sessionMode === 'repaso'"`). Layout sin Reiniciar: `← Volver al home` ocupa el 100% del `.button-row` (el `flex: 1` heredado lo expande). Esto es exactamente el comportamiento pre-Phase 6 — la única diferencia es el ESLINT cuando el modo es Repaso.

**Razón del orden izquierda→derecha (Reiniciar antes que Volver):**
- Lectura natural de izquierda a derecha: "acción en contexto" (Reiniciar la sesión actual) → "salir del contexto" (Volver al home).
- Mismo patrón que el banner `.inflight-banner` Phase 2 (`[Reanudar] [Descartar]`): la acción que continúa el flujo va a la izquierda; la que abandona va a la derecha.

### Pantalla summary (post-Phase 6, sesión con errores)

```
┌──────────────────────────────────────────────────────────────────────┐
│ <article>                                                            │
│   <header>Sesión terminada · 17/20 correctos</header>                │
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────────┐│
│   │ Avere: hecha → no-hecha · 3 ejercicios para volver a hecha      ││  ← .summary-delta
│   │ Preposiciones: dominada → no-hecha · racha 21 → 0               ││     (existing)
│   │ Profesiones: hecha → dominada · racha 20 → 21                   ││
│   └─────────────────────────────────────────────────────────────────┘│
│                                                                      │
│   ┌─ Errores cometidos ──────────────────────────────────────────────┐│  ← <section class="summary-errors">
│   │                                                                  ││     NEW Phase 6
│   │  Yo ___ un coche.                                                ││     <h3>
│   │  Tu respuesta: [hai]                                             ││     <li> 1
│   │  Respuesta correcta: ho                                          ││
│   │  ─────────────────────────────────────────                       ││
│   │  Construye: "Tengo un libro."                                    ││     <li> 2 (word-buttons)
│   │  Tu respuesta: [io ha un libro]                                  ││
│   │  Respuesta correcta: io ho un libro                              ││
│   │  ─────────────────────────────────────────                       ││
│   │  Empareja sustantivo con artículo.                               ││     <li> 3 (match)
│   │  Tu respuesta: [casa ↔ il]                                       ││
│   │  Respuesta correcta: casa ↔ la                                   ││
│   └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│   ┌─────────────────────┐                                            │
│   │   Volver al home    │  ← existing button (Pico default primary)  │
│   └─────────────────────┘                                            │
│                                                                      │
│ </article>                                                           │
└──────────────────────────────────────────────────────────────────────┘
```

**Vertical order exacto:**
1. `<header>` con `summaryHeaderLabel` (existente)
2. `<ul class="summary-delta">` (existente, sin cambios — incluye sus `<li>` con `<strong>` + delta-arrow + estados)
3. `<template x-if="sessionResults.some(r => !r.correct)">` envuelve la nueva sección
4. `<section class="summary-errors">`
5. Botón `Volver al home` (existente, sin cambios)

**Estructura interna de cada `<li>` (D-109):**

```html
<li>
  <strong x-text="content.exerciseById[result.exerciseId].payload.prompt"></strong>

  <!-- Dispatch por tipo (multi-choice / word-buttons / match) -->
  <template x-if="content.exerciseById[result.exerciseId].type === 'multiple-choice'">
    <div>
      <div>Tu respuesta: <span class="user-answer" x-text="result.userAnswer"></span></div>
      <div>Respuesta correcta: <strong x-text="content.exerciseById[result.exerciseId].payload.options[content.exerciseById[result.exerciseId].payload.correctIndex]"></strong></div>
    </div>
  </template>

  <template x-if="content.exerciseById[result.exerciseId].type === 'word-buttons'">
    <div>
      <div>Tu respuesta: <span class="user-answer" x-text="(result.userAnswer || []).join(' ')"></span></div>
      <div>Respuesta correcta: <strong x-text="content.exerciseById[result.exerciseId].payload.answer.join(' ')"></strong></div>
    </div>
  </template>

  <template x-if="content.exerciseById[result.exerciseId].type === 'match' && result.userAnswer">
    <div>
      <div>Tu respuesta: <span class="user-answer" x-text="result.userAnswer.left + ' ↔ ' + result.userAnswer.right"></span></div>
      <!-- correctRight: ex.payload.pairs.find(p => p[0] === userAnswer.left)[1] -->
      <div>Respuesta correcta: <strong x-text="result.userAnswer.left + ' ↔ ' + (content.exerciseById[result.exerciseId].payload.pairs.find(p => p[0] === result.userAnswer.left)?.[1] || '(?)')"></strong></div>
    </div>
  </template>
</li>
```

**Notas para el planner sobre la lógica del dispatch:**

- El executor PUEDE refactorizar el dispatch a un getter computado en el factory (e.g. `errorRows()` que precompute `{prompt, userAnswerDisplay, correctDisplay}` por error) para evitar la lógica inline en el template. Decisión del planner — el contrato exige solo que el output visual sea el descrito; la arquitectura interna es discrecional.
- El `?.` (optional chaining) sobre `.find(p => p[0] === userAnswer.left)?.[1]` defiende contra el caso patológico "el userAnswer.left no existe en pairs" (no debería ocurrir pero defensa cuesta 4 chars). Si el caso ocurre, renderiza `(?)` literalmente.
- **Match con userAnswer === null** (ejercicio match correcto sin fallos) NO se renderiza en la sección porque `r.correct === true` lo filtra antes — el guard `&& result.userAnswer` en el `x-if` es defensa adicional para inFlightTest pre-Phase 6 (D-110/D-111).

---

## Interaction State Diagram

### UX-01 — Click "Reiniciar ejercicios" (modo Repaso)

```
              ┌─────────────────────────────┐
              │ currentScreen='session'     │
              │ sessionMode='repaso'        │
              │ sessionCursor=N (0 ≤ N < 20)│
              │ sessionFeedback=any         │
              │ sessionResults=[...]        │
              │ matchHadFailure=any         │
              └──────────────┬──────────────┘
                             │ click "Reiniciar ejercicios"
                             ▼
              ┌─────────────────────────────┐
              │ restartRepaso() syncronous: │
              │  - cancelAutoAdvance()      │
              │  - cancelMatchFlash()       │
              │  - allExercises = ...       │
              │  - result = buildSession(   │
              │       pickerCheckedCategoryIds,
              │       allExercises,         │
              │       this.state,    ← post-D-54 if any
              │       20, 'repaso')         │
              │  - sessionExerciseIds = result.exerciseIds
              │  - sessionCursor = 0        │
              │  - sessionResults = []      │
              │  - reset all sub-states     │
              │    (wordButtons*, match*,   │
              │     matchFirstWrongPair=null)
              │  - initSubStateForExercise( │
              │      firstExercise)          │
              │  - currentScreen stays 'session'
              └──────────────┬──────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ currentScreen='session'     │
              │ sessionCursor=0             │
              │ sessionFeedback=null        │
              │ sessionResults=[]           │
              │ Same sessionMode='repaso'   │
              │ Same pickerCheckedCategoryIds
              │ Possibly different exerciseIds
              │   (new sample, state-aware) │
              └─────────────────────────────┘
```

**Lo que NO cambia:**
- `state` — el state localStorage queda EXACTAMENTE como antes (incluyendo los D-54 ya persistidos durante esta sesión).
- `sessionMode` — sigue siendo `'repaso'`.
- `pickerCheckedCategoryIds` — preservado para que `buildSession` re-sample sobre las mismas categorías.
- `exerciseStats` — NUNCA se bumpean por la operación reset (D-09 monotonicidad heredada — coherente con SESSION-08 que descarta aciertos no-comprometidos).
- `currentScreen` — sigue siendo `'session'` (no se navega).

**Edge defensivo:** Si `result.exerciseIds.length === 0` (todas las categorías quedaron vacías de ejercicios reseteables tras una cascada brutal — escenario muy improbable), el handler debe gestionarlo. Recomendación: el `initSubStateForExercise(firstExercise)` ya tiene un guard implícito (`if (result.exerciseIds.length > 0)`), así que el reset es silencioso. La pantalla session muestra un estado "vacío" momentáneo. El planner valora si añadir un mensaje "No quedan ejercicios para repasar — vuelve al home" o si el comportamiento default (pantalla en blanco con el botón Volver) es aceptable. **UI-SPEC NO prescribe el mensaje** — es over-engineering para edge improbable.

### UX-02 — Render de la sección "Errores cometidos"

```
        ┌──────────────────────────────────────────┐
        │ completeSession() ejecuta:                │
        │  - sessionResult = { answers: sessionResults }
        │  - applySessionResult(this.state, ...)    │
        │  - summaryDelta = computeSummaryDelta(...)│
        │  - currentScreen = 'summary'              │
        └──────────────┬───────────────────────────┘
                       │
                       ▼ Alpine reactivity reescanea
        ┌──────────────────────────────────────────┐
        │ <template x-if="currentScreen === 'summary' && summaryDelta">
        │   <article>                              │
        │     <header />                           │
        │     <ul.summary-delta />                 │
        │     <template x-if="sessionResults.some(r => !r.correct)">
        │       <section class="summary-errors">   │
        │         <h3>Errores cometidos</h3>       │
        │         <ul>                             │
        │           x-for r in sessionResults.filter(!correct) │
        │             render <li> con dispatch por tipo
        │         </ul>                            │
        │       </section>                         │
        │     </template>                          │
        │     <button>Volver al home</button>      │
        │   </article>                             │
        │ </template>                              │
        └──────────────────────────────────────────┘
                       │
                       │ click "Volver al home"
                       ▼
        ┌──────────────────────────────────────────┐
        │ returnToHomeFromSummary() ejecuta:        │
        │  - resetSession()  ← incluye limpiar     │
        │    sessionResults                         │
        │  - summaryDelta = null                    │
        │  - currentScreen = 'home'                 │
        │                                          │
        │  La sección .summary-errors desaparece  │
        │  porque su x-if guard ya no se cumple   │
        │  (sessionResults vacío).                  │
        └──────────────────────────────────────────┘
```

---

## Keyboard / Focus / Accessibility

### Focus management

| Transition | Where focus lands |
|------------|-------------------|
| Click "Reiniciar ejercicios" → reset sesión | Browser default — el botón Reiniciar retiene el foco visible. Esto es aceptable: el siguiente Tab lleva al primer elemento del nuevo ejercicio (botón de opción multi-choice, o palabra del banco word-buttons, o item match izq). NO llamar `.focus()` programáticamente — coherente con el patrón Phase 1-5 (`@keydown.window` escucha al body globalmente). |
| Render de `<section class="summary-errors">` | Foco no cambia automáticamente — el botón `Volver al home` debajo de la sección sigue siendo el siguiente Tab natural. Sin `autofocus`, sin `.focus()` programático. |

### Keyboard shortcuts

| Key | Behavior post-Phase 6 |
|-----|------------------------|
| `1`-`9`, `a`-`i`, `Enter`, `Space`, `Backspace` (sesión) | **Sin cambios** — el handler `handleSessionKey` Phase 3 sigue idéntico. El botón Reiniciar NO tiene shortcut (Claude's discretion arriba). |
| Tab en pantalla session | Cicla a través de los botones de opción/banco/match → Reiniciar → Volver al home. El Reiniciar entra naturalmente en el orden de tab porque está antes de Volver al home en el DOM. |
| Tab en pantalla summary | Cicla a través de los enlaces/botones existentes. La sección `.summary-errors` solo contiene texto + spans + `<strong>` — no son focusables. El botón `Volver al home` es el único focusable, igual que pre-Phase 6. |

**No new `@keydown.window` listener.** Phase 6 NO extiende el handler global.

### ARIA / semantic HTML

| Element | Role / ARIA |
|---------|-------------|
| Botón "Reiniciar ejercicios" | No `aria-label` explícito — el texto del botón es la etiqueta canónica. Coherente con `← Volver al home`. |
| `<section class="summary-errors">` | No `role` explícito — `<section>` es landmark implícito. Si el planner quiere reforzar a11y, puede añadir `aria-labelledby="errors-heading"` apuntando al `<h3>`, pero no es obligatorio. |
| `<h3>Errores cometidos</h3>` | Heading semántico — los screen readers lo anuncian automáticamente como heading nivel 3. Posible refuerzo opcional: `id="errors-heading"` para que la sección lo referencie via `aria-labelledby`. |
| `<span class="user-answer">` | No ARIA — es chrome visual de énfasis. El texto del usuario se lee inline por el screen reader (entra dentro del flow del `<li>`). |
| `<li>` por error | No `role` — `<ul>`/`<li>` semántica nativa es suficiente. Sin `aria-live` — el contenido se renderiza una vez al entrar a summary, no es live. |

### Color contrast

- `.summary-errors .user-answer` (rojo `#d32f2f` + blanco): mismo ratio que `.incorrecta` button — ≥ 4.5:1 verificado en Phase 1/2.
- `<strong>` semibold sobre fondo Pico default: ratio Pico default (verificado upstream).
- Texto plano de las etiquetas "Tu respuesta:" / "Respuesta correcta:" sobre fondo Pico: ratio Pico default.

---

## Implementation Notes for the planner

### Reusable assets a NO reinventar

- **`.button-row`** (styles.css línea 86-97): el `<button>Reiniciar ejercicios</button>` se inserta DENTRO del `.button-row` existente (index.html línea 414-415), antes del botón `← Volver al home`. Layout flex con `gap: 1rem` y `flex: 1` los reparte 50/50.
- **`.incorrecta`** o variante `.user-answer` (este UI-SPEC): el planner elige reusar la clase existente `.incorrecta` sobre `<span>` (Pico no restringe la clase a `<button>`) o definir `.user-answer` como variante inline-friendly. Las dos son válidas; el contrato exige el output visual (rojo sólido + texto blanco + padding mínimo).
- **`<template x-if="ex.type === '...'">`** patrón heredado de Phase 3 (index.html líneas 259/296/375): el dispatch por tipo dentro del `<li>` sigue exactamente el mismo patrón.
- **`x-for` con `:key` sobre array filtrado** (heredado Phase 2 `.summary-delta` línea 438): `x-for="result in sessionResults.filter(r => !r.correct)" :key="result.exerciseId"` es válido y eficiente; Alpine recomputa el array cuando `sessionResults` cambia (irrelevante en summary — la sesión ya terminó, sessionResults es inmutable hasta `returnToHomeFromSummary`).
- **`content.exerciseById[result.exerciseId]`**: ya disponible en `appShell` (line ~89 factory) — `content.exerciseById` es un dict por ID construido durante el bootstrap. Sin penalización de lookup.

### Cosas deliberadamente FUERA del scope visual Phase 6

- **Sin botón "Repetir solo los errores"** en la sección — entra dentro de una fase "drill mode" futura (CONTEXT deferred).
- **Sin agrupación por categoría** dentro de la sección — D-108 explícito (lista plana cronológica).
- **Sin highlight visual cuando un error es multi-cat** — el `.summary-delta` arriba ya muestra las 2+ categorías reseteadas; duplicarlo dentro de la fila de error sería ruido (CONTEXT deferred).
- **Sin `<hr>`** entre `<ul.summary-delta>` y `<section class="summary-errors">` — el `margin-top: 1.5rem` de la sección es suficiente.
- **Sin animación** de aparición de la sección — coherente con Phase 1-5 (cero animaciones de entrada/salida).
- **Sin scroll dedicado** dentro de `.summary-errors` — el scroll del `<main>` cubre el caso "muchos errores" (un Test completo de 271 ejercicios cabe holgado en página).
- **Sin `notes` del ejercicio en la fila** — Claude's discretion CONTEXT resuelto: NO mostrar `ex.notes` por defecto en v1. Si UAT lo pide, añadir como `<small class="notes">` debajo del bloque correcto.
- **Sin counter "X de N errores"** — el header `Errores cometidos` es suficiente. El número exacto es contable visualmente.

### Reglas T-02-01 (anti-XSS)

- TODO el contenido JSON (prompts, options, answers, pair strings, userAnswer values) se renderiza vía `x-text` exclusivamente. JAMÁS `x-html`.
- La etiqueta "Tu respuesta:" y "Respuesta correcta:" son HARDCODED en el HTML, NO interpoladas desde JSON.
- El separador `↔` del match es un literal en el template (`x-text="result.userAnswer.left + ' ↔ ' + result.userAnswer.right"`) — el `↔` viene del template, no del JSON.

### Reactividad Alpine sobre `sessionResults` extendido

- `sessionResults.push({ exerciseId, correct, userAnswer })` mantiene la reactividad porque Alpine observa la mutación de la array (mismo patrón ya usado en `applyResultToSession` actual línea 833). El planner NO necesita spread-clone ni reassignación.
- `persistInFlightTest()` hace `answers: [...this.sessionResults]` (CONTEXT D-110) — el clon es shallow pero los elementos son objetos planos serializables; `localStorage.setItem` los serializa con `JSON.stringify` que captura `userAnswer` automáticamente.
- `resumeInFlightTest()` restaura `sessionResults` desde `inFlightTest.answers` — los items son los mismos plain objects (`{exerciseId, correct, userAnswer}`).

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | not applicable | not applicable (proyecto vanilla Alpine + Pico CDN; sin shadcn ni registries de terceros) |

Phase 6 introduce **cero dependencias externas nuevas, cero registry blocks, cero CDN packages.** El stack queda 100% locked al estado post-Phase 5: Alpine 3.15.12 + Pico 2.1.1 (SRI pinned desde Phase 1).

---

## Estados visuales por componente (resumen denso para el ejecutor)

### Botón "Reiniciar ejercicios"

| Estado | Visual | Trigger |
|--------|--------|---------|
| Visible idle | Pico `secondary` clickable | `currentScreen === 'session' && sessionMode === 'repaso'` |
| Hover (mouse) | Pico secondary hover | Mouseover |
| Focus-visible | Pico `:focus-visible` outline | Tab |
| Pressed (click) | Pico `:active` | Click |
| Oculto | `display: none` via `x-show="sessionMode === 'repaso'"` | `sessionMode === 'test-completo'` |
| Durante feedback (correct/incorrect) | **Sigue idle clickable** — NO grey-out | `sessionFeedback !== null` (sin override) |

### Sección "Errores cometidos"

| Estado | Visual | Trigger |
|--------|--------|---------|
| Hidden (sin errores) | No renderizada — `<template x-if>` evita el mount | `sessionResults.every(r => r.correct)` o `sessionResults.length === 0` |
| Rendered (≥1 error) | `<section>` con header + lista | `sessionResults.some(r => !r.correct)` |
| Cada `<li>` rendered | Flex column, border-bottom muted, padding 0.5rem 0 | x-for sobre `sessionResults.filter(!correct)` |
| `<span class="user-answer">` dentro de `<li>` | Rojo sólido `#d32f2f` + texto blanco + padding `0 0.25rem` (0px vertical, 4px horizontal) | Siempre (mientras la fila se renderiza) |
| `<strong>` de respuesta correcta | Pico semibold sin color | Siempre |
| Match con `userAnswer === null` | Las dos líneas "Tu respuesta:" + "Respuesta correcta:" se omiten; solo prompt | `result.userAnswer === null` (caso match completado sin fallos pero entró por bug; o inFlightTest pre-Phase 6 reanudado tras migrate3to4 backfill) |

---

## Decisiones de Claude's Discretion resueltas aquí

| Discretion (CONTEXT.md) | Resolución |
|-------------------------|------------|
| Label exacto del botón "Reiniciar ejercicios" | `Reiniciar ejercicios` (sin abreviar, sin icono `↻`) |
| Visual state durante feedback (grey-out?) | NO grey-out — siempre clickable durante toda la sesión |
| Keyboard shortcut (R, Esc, ...) | **Ninguno en v1** — saturación + colisión con Ctrl+R |
| Accessibility (aria-label, tab order) | Sin `aria-label` extra (texto del botón basta); tab order natural en `.button-row` |
| Disabled state si sessionExerciseIds vacío | Sin disabled visual prescriptivo — el reset es silencioso, planner valora si añadir mensaje |
| Visual cue post-reset | Sin flash — el cambio de `sessionProgressLabel` y prompt son confirmación natural |
| Exact header text de la sección | `Errores cometidos` (default ROADMAP) |
| Position relativa a `<ul.summary-delta>` | INMEDIATAMENTE DESPUÉS, con `margin-top: 1.5rem`, SIN `<hr>` |
| Layout de cada `<li>` | `<li>` multi-línea (`display: flex; flex-direction: column; gap: 0.25rem`) — NO `<details>` ni `<table>` ni `<dl>` |
| Visual hierarchy prompt vs answers | `<strong>` del prompt arriba (peso semibold); etiquetas Tu/Correcta plain; valor user en `.user-answer` rojo; valor correcto en `<strong>` |
| Color treatment del valor correcto | **`<strong>` sin clase verde** (peso es la única señal — coherencia con multi-choice sesión líneas 277/328) |
| Layout match (`casa ↔ il / casa ↔ la`) | Separador `↔` Unicode entre left/right; misma estructura para ambos valores user/correcto |
| Spacing rhythm entre items | `padding: 0.5rem 0; border-bottom: 1px solid muted` (mismo ritmo que `.summary-delta`) |
| Empty state | NO renderizar la sección — `<template x-if>` guard |
| Long content handling | `overflow-wrap: anywhere` sobre `.user-answer`; word-wrap natural sobre prompt + correcto |
| Scroll past viewport | Scroll del `<main>` cubre — sin scroll dedicado en la sección |
| Highlight multi-cat | NO — `.summary-delta` arriba ya lo cubre |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS — toda copy en español, exacta para los 2 elementos nuevos (`Reiniciar ejercicios` / `Errores cometidos` + etiquetas Tu/Correcta + fallbacks), tono sobrio sin emojis decorativos, T-02-01 invariante anti-XSS reforzado, edge cases de copy declarados (prompt largo, userAnswer largo, null defensivo, plural en header)
- [ ] Dimension 2 Visuals: PASS — botón Reiniciar dentro de `.button-row` existente con posición izquierda (Reiniciar) → derecha (Volver al home); sección `.summary-errors` con `margin-top: 1.5rem` bajo `<ul.summary-delta>` y antes de `Volver al home`; 6 estados del botón + 6 estados de la sección documentados; wireframes ASCII de las 2 pantallas afectadas
- [ ] Dimension 3 Color: PASS — 60/30/10 heredado de Phase 2-5 sin cambios; cero tokens nuevos; `.incorrecta` reusada (rojo sólido + blanco) para `userAnswer`; `<strong>` sin color verde para respuesta correcta (justificado por coherencia con multi-choice sesión); accent `secondary` aplicado a 1 solo elemento nuevo (botón Reiniciar)
- [ ] Dimension 4 Typography: PASS — cero tamaños y pesos nuevos; Pico defaults para `<h3>`, `<strong>`, body; `.user-answer` solo con padding inline y `overflow-wrap` — sin font-size ni font-style nuevos
- [ ] Dimension 5 Spacing: PASS — cero tokens nuevos; `.button-row` existente reusado intacto; `.summary-errors` con `margin-top: 1.5rem` + `padding: 0.5rem 0` + `gap: 0.25rem` + `.user-answer` con `padding: 0 0.25rem` — todo múltiplos rem de 0.25rem (= 4px) o cero; sin `<hr>`, sin role="group"
- [ ] Dimension 6 Registry Safety: PASS — none (proyecto vanilla, sin terceros más allá de Pico+Alpine CDN ya pinned con SRI desde Phase 1)

**Approval:** pending (gsd-ui-checker debe validar y upgradear a `approved`)
