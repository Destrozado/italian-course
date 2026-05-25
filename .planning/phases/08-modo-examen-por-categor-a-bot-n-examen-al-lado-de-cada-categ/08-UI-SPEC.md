---
phase: 8
slug: modo-examen-por-categor-a-bot-n-examen-al-lado-de-cada-categ
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-25
reviewed_at: 2026-05-25
---

# Phase 8 — Contrato de Diseño UI: Modo Examen por categoría

> Contrato visual e interactivo para el único elemento nuevo de Phase 8: un botón `Examen` por fila en la tabla home (`<table>` dentro de `<template x-if="currentScreen === 'home'">`) que arranca un Test Completo de SOLO esa categoría con 1 clic. Generado por `gsd-ui-researcher` tras leer CONTEXT (D-181..D-192), UI-SPEC Phase 4 (paleta Pico classless + clase `secondary` para acciones no protagonistas + 60/30/10 heredado) y UI-SPEC Phase 6 (estructura de wireframes ASCII + Cero tokens nuevos como norma).
>
> **Idioma:** UI y copy en español (FOUND-04). Tokens / CSS vars / identificadores en inglés (heredados de Pico/styles.css).
> **Alcance:** un solo nuevo control — `<button class="secondary outline">Examen</button>` insertado en cada fila de la tabla home como **6ª columna nueva**. Cero pantallas nuevas, cero banners nuevos, cero tokens nuevos, cero call-sites nuevos de `requestConfirm` más allá de la 6ª (D-44 patrón clonado).
> **Out of scope visual:** picker (no se toca), pantalla session (sin diferenciación Examen vs Test completo regular — D-189), banner home reanudar (copy genérica conservada — D-183), banner backup (sin cambios), atajos de teclado para Examen (D-188).

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (proyecto vanilla — Alpine.js 3.15.12 + Pico CSS 2.1.1 classless, sin build step) |
| Preset | not applicable (rechazado al iniciar el proyecto — locked en CLAUDE.md) |
| Component library | Pico CSS 2.1.1 classless (CDN, SRI pinned en `index.html` líneas 9-13) |
| Icon library | none — sin glifo nuevo en Phase 8 (D-185 etiqueta plana sin paréntesis ni números ni `↗`) |
| Font | Pico defaults (system stack heredado: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`) |
| State framework | Alpine.js 3.15.12 (`x-data`, `x-if`, `x-for`, `:disabled`, `:title`, `@click`) |

**Anclas de coherencia visual (heredadas, NO reinventar):**
- `<template x-if="currentScreen === 'home'">` switch (sin cambios). Phase 8 NO añade pantallas.
- `<article>` exterior + `<header>` con título — sin cambios estructurales del home.
- `<figure><table>` densa de 5 columnas — Phase 8 amplía a **6 columnas** añadiendo `<th scope="col">Examen</th>` al final del `<thead>` y `<td>` con `<button>` al final de cada `<tr>` (D-184 reinterpreta el título ROADMAP "picker" → "home").
- `.button-row` permanece sin nuevas instancias en Phase 8 — el botón Examen vive **dentro de la celda `<td>` de la tabla**, no en una row de botones.
- Clase Pico `secondary` (gris muted) — patrón canónico para "no compite con los protagonistas" (precedente: Phase 4 D-81 `Backup`, banner `Descartar`, `Volver al home`, `Importar progreso`). Phase 8 lo refuerza añadiendo además `outline` para una densidad visual aún más baja dentro de una celda de tabla.
- Strings hardcoded en español (FOUND-04, sin i18n). Sin emojis decorativos. T-02-01 anti-XSS invariante reforzado: cero `x-html`, el `:title` del tooltip se escapa por defecto.
- `← Volver al home` permanece el wording fijo de retorno en picker/session/summary/backup (sin cambios). Examen NO añade su propia ruta de retorno (la sesión ya tiene una).

---

## Spacing Scale

Heredado 1:1 de Pico defaults + convenciones Phase 1-7.2. **No declares nuevos tokens.** Phase 8 introduce CERO valores de spacing nuevos.

| Token (rem) | Pixels | Uso en Phase 8 |
|-------------|--------|----------------|
| 0.25rem | 4px | (no usado por Phase 8 — más fino que el padding de `<button>` Pico) |
| 0.5rem  | 8px  | (no usado por Phase 8) |
| 0.75rem | 12px | (no usado por Phase 8) |
| 1rem    | 16px | (no usado por Phase 8 — `.button-row` no se reusa) |
| 1.5rem  | 24px | (no usado por Phase 8) |

**Phase 8 NO añade ninguna regla CSS de spacing.** El botón Examen vive dentro de un `<td>` de la tabla — Pico ya define el padding interno de `<td>` (~0.5rem) y el padding interno de `<button>` (~0.5rem 1rem). La combinación es funcional sin override.

**Reglas reforzadas:**
- **Reusar `<button>` Pico classless por defecto** + clases `secondary outline` (estas dos clases ya existen en Pico 2.1.1 — `outline` es una clase pública documentada por Pico que rinde el botón con borde + fondo transparente, ideal para densidad muy baja dentro de tabla).
- **NO inventar `.examen-button` ni similar.** Si emerge necesidad de override (e.g., width fija para que todas las filas alineen), añadir CSS mínimo en `styles.css` con sección dedicada `/* ─── Phase 8 — Examen button (D-184) ─── */` y comentar la razón. Por defecto el contrato pide CERO CSS nuevo.
- **NO añadir `<hr>`, `<br>`, ni `margin/padding` extras** en la fila de la tabla. La altura de cada fila crece naturalmente para acomodar el botón (Pico hace vertical-align en celdas de tabla).
- **NO añadir un wrapper `.button-row` dentro del `<td>`.** El botón es el único hijo de la celda.

---

## Typography

Pico classless ya define la jerarquía. Phase 8 **NO toca `<h1>`/`<h2>`/`<th>`/`<td>`/`<button>` defaults** y NO añade tamaños ni pesos nuevos.

| Role | Size | Weight | Line Height | Uso en Phase 8 |
|------|------|--------|-------------|----------------|
| Body | 1rem (Pico default ~16px) | 400 | 1.5 (Pico default) | (sin cambios — el texto del resto de columnas) |
| Heading de tabla (`<th>`) | Pico default | 600 (Pico) | 1.2 | El nuevo encabezado `Examen` hereda la misma tipografía que `Estado` / `Categoría` / `Racha` / `Ejercicios` / `Última vez` (FOUND-03 desktop) |
| Botón Examen | Pico default `<button>` (~1rem) | 400 (Pico) | 1.5 | Texto plano `Examen` sin abreviaciones ni glifos (D-185) |

**Patrón de énfasis dentro de la fila:**
- Las 5 columnas existentes mantienen sus tipografías sin cambios.
- El nuevo botón es el ÚNICO elemento interactivo de la fila — toda la fila previa era de texto puro. El botón aporta la única señal de "esto se puede pulsar".

**Forbidden:**
- Custom font-size CSS en `.examen-button` o sobre el `<button>` de la celda. Si emerge necesidad de hacer el botón más pequeño que el default Pico, se aplica `class="secondary outline"` (que ya tiene padding reducido relativo a `secondary` solo).
- NO declarar `font-weight: 600` ni `text-transform: uppercase` en el botón — coherencia con el resto de botones del proyecto (Pico defaults).
- NO añadir `<small>` ni `<kbd>` dentro de la celda — el botón texto plano basta.

---

## Color

Phase 8 **introduce CERO tokens de color nuevos.** Todos los colores vienen de Pico vars (con fallback hex en `styles.css`) y reusan literalmente las clases heredadas (`secondary`, `outline`).

| Role | Value (CSS var con fallback) | Uso en Phase 8 |
|------|------------------------------|----------------|
| Dominant (60%) — surface | `var(--pico-background-color)` (light/dark auto) | Fondo de `<article>` home y celdas de tabla (sin cambios) |
| Secondary (30%) — chrome | `var(--pico-muted-border-color, #e0e0e0)` | Border del `<button class="secondary outline">` |
| Accent (10%) — primary | `var(--pico-primary, #1095c1)` | **NO se usa en Phase 8.** El botón Examen es deliberadamente NO protagonista. |
| Accent secundario muted | clase Pico `secondary` (heredada) | Color del texto del botón Examen — gris muted Pico, mismo tratamiento que `Backup`, `Volver al home`, `Importar progreso` |
| `outline` (variante) | borde sólido + fondo transparente Pico default | Reduce densidad visual aún más — diferencia de un `secondary` sólido como `Backup` (que es secundario pero llena el área del botón) |
| Destructive / error (rojo) | `var(--pico-color-red-500, #d32f2f)` | **NO se usa en Phase 8.** Sin estado destructivo en el botón Examen. La descarte del Test completo activo aparece dentro del `.confirm-inline` heredado (D-44 patrón) con copy estándar `Continuar`/`Cancelar` cyan + gris — sin variante destructiva nueva (precedente Phase 4 §Color — "no branch the helper preemptively"). |
| Success (verde) | `var(--pico-color-green-500, #2e7d32)` | NO se usa en Phase 8 |
| Muted (atenuado) | `var(--pico-muted-color, #6c757d)` | Tooltip color (heredado del nativo del navegador para `title`) — Phase 8 NO override el tooltip |
| Disabled state | Pico default `:disabled` (opacity ~0.5 + cursor not-allowed) | Aplicado automáticamente cuando `cat.totalCount === 0` (D-187) |

### Accent reservado para (lista explícita)

**El `var(--pico-primary)` (cian) NO aparece en Phase 8.** Ningún componente nuevo es primario.

**La clase Pico `secondary outline`** se aplica a UN solo elemento nuevo:
- Botón `Examen` dentro del `<td>` de cada fila de la tabla home — `<button type="button" class="secondary outline" :disabled="!cat.examenEnabled" :title="cat.examenTooltip" @click="startExamen(cat.id)">Examen</button>`.

Todo el resto de elementos del home permanecen idénticos (banners, botones grandes Repaso 20 / Test completo / Backup, badges de estado, etc.).

### Decisión clave — densidad visual del botón en la fila

CONTEXT Claude's discretion: *"`class="secondary"` (consistencia con `Volver al home`) vs primary. Probablemente secondary para no competir con los botones grandes Repaso 20 / Test Completo de la home."*

**Resolución (Claude's discretion):** **`class="secondary outline"`** — un escalón POR DEBAJO de `secondary` sólido.

Razones:
1. **Jerarquía visual a 3 niveles existe ya en la home:**
   - Nivel 1 (protagonistas, primary Pico cyan): `Repaso 20`, `Test completo`. Acciones principales.
   - Nivel 2 (no compite pero descubrible, `class="secondary"` sólido): `Backup`. Acción frecuente pero secundaria.
   - **Nivel 3 NUEVO (densidad mínima, `class="secondary outline"`): `Examen` por fila.** Acción focalizada, contextual a una fila, NO debe gritar desde 7 filas a la vez.
2. **Repetición × N filas:** la home tiene 7 categorías → 7 botones Examen renderizados simultáneamente. Si fueran `secondary` sólido (mismo nivel que `Backup`) la tabla se cargaría de gris muted denso. `outline` baja la densidad visual sin esconder el botón.
3. **Coherencia semántica con la celda de tabla:** `<td>` es un contexto denso (texto plano en 5 columnas hermanas). Un botón outline parece una "etiqueta clickable" dentro de la celda — afín al uso de outline en tablas SaaS (Linear, Notion). Un botón sólido parece una acción primaria que rompe el flujo de lectura de la tabla.
4. **Phase 6 precedente:** los dos botones de `.button-row` bajo `<hr>` en session usan `class="secondary"` sólido porque están en un area dedicada (fila de botones). Phase 8 NO está en una row de botones — está dentro de una celda densa. El downgrade a `outline` es contextual.
5. **`outline` es Pico-oficial y SRI-safe:** la clase `outline` está documentada en `picocss.com/docs/buttons` v2.x (verificada en el upstream — Pico 2.1.1 incluye `outline` y combina con `secondary`/`primary`/`contrast`). Cero dependencias nuevas.

**Si el autor en UAT prefiere `secondary` sólido (sin outline):** quitar la palabra `outline` del `class=` es 1 cambio textual. El resto del contrato no se rompe. **Si el autor prefiere `contrast`** (más alto contraste neutro): coherente con Pico — pero rompe la jerarquía a 3 niveles. **Si el autor prefiere ningún `class=` (default primary cyan):** se convierte en 4º protagonista y compite — rechazado por el CONTEXT (D-184 Claude's discretion).

### Estado disabled (D-187)

| Cuando | Visual | Trigger |
|--------|--------|---------|
| `cat.totalCount === 0` (cat sin ejercicios) | Pico default `:disabled` (opacity ~0.5 + cursor not-allowed + sin hover state) | `:disabled="!cat.examenEnabled"` enlazado a `cat.examenEnabled = (cat.totalCount > 0)` |
| `cat.status === 'hecha'` o `'dominada'` | Pico default idle (NO disabled — D-187 explícito: visible normal) | El estado de la categoría no afecta al botón |

**Tooltip cuando disabled:**

| Cuando | Copy del `:title` | Trigger |
|--------|-------------------|---------|
| `cat.totalCount === 0` | `No hay ejercicios en esta categoría` | `cat.examenTooltip = 'No hay ejercicios en esta categoría'` |
| `cat.totalCount > 0` (idle clickable) | `''` (sin tooltip) | `cat.examenTooltip = ''` |

Razones del tooltip texto plano:
- **Coherencia con el resto de la app:** ningún elemento de Phase 1-7.2 usa `title` para tooltip. Phase 8 inaugura el patrón porque el disabled `<button>` no expone la razón por sí solo (la opacidad es visual pero no informativa). Es un edge defensivo (D-187 — todas las cats tienen >10 ejercicios actualmente; el disabled es para un escenario hipotético "cat vacía en el JSON").
- **Native `title` es accesible:** screen readers leen el atributo; navegadores muestran el tooltip al hover ~500ms; teclado Tab no muestra el tooltip pero el `:disabled` sí es leído por el SR.
- **NO usar `aria-describedby` con un elemento oculto:** over-engineering para un edge improbable. Si UAT lo pide, añadir como follow-up.

### Tooltip cuando enabled (Claude's discretion resuelto)

**NO añadir tooltip cuando el botón está enabled.** Razones:
1. **El texto `Examen` ya es autodescriptivo** — el autor sabe qué hace (lanza un Test completo de esa cat). Añadir `title="Examen completo de esta categoría"` sería redundante y ruidoso (7 tooltips en hover por la tabla).
2. **Coherencia con el resto de tabla home:** ninguna columna tiene tooltip. Las celdas `Estado` / `Categoría` / `Racha` / `Ejercicios` / `Última vez` son texto plano sin `title`.

### Banner / sin-banner

- **Phase 8 NO añade banner alguno.** El banner home in-flight reanudar (`.inflight-banner` Phase 2) sigue idéntico con copy genérica D-183 ("Tienes un Test completo a medias — X / N ejercicios") — Examen reanudable usa exactamente el mismo banner. El banner backup (`.backup-banner` Phase 4) no es afectado.
- **El `.confirm-inline` D-44** (6ª call-site) se reusa SIN tocar la clase. Mismo panel top-right, mismas dimensiones, mismos botones Cyan `Continuar` + gris `Cancelar`.

### Contraste WCAG 2.1 AA

- `class="secondary outline"` (texto Pico muted color + borde Pico muted): ratio Pico default — verificado upstream por Pico (claim WCAG AA en light y dark).
- `:disabled` state (opacity ~0.5): Pico expone el contraste reducido como señal visual. Coherente con todos los `:disabled` del proyecto (e.g., botón `Empezar` del picker cuando `pickerPoolSize === 0`).
- Texto `Examen` sobre fondo blanco / Pico background: ratio Pico default.

---

## Copywriting Contract

**Toda la copy en español** (FOUND-04). Tono neutro factúal — sin emojis decorativos, sin gamificación, sin signos de exclamación. Strings hardcoded en `index.html` (FOUND-04 — sin i18n).

### Botón Examen (D-185 locked)

| Element | Copy | Decisión |
|---------|------|----------|
| Label del botón | `Examen` | D-185 locked. SIN paréntesis con número de ejercicios (no `Examen (23)`), SIN verbal (no `Examinar`), SIN glifo direccional (no `↗ Examen`). Texto plano, consistente con `Repaso 20`, `Test completo`, `Backup`, `Reanudar`, `Descartar`. Cabe holgado dentro del `<td>` sin abreviar a `Test` o `Ex.` |
| Tooltip enabled | (sin tooltip) | Coherente con el resto del home (`Backup` tampoco tiene tooltip) |
| Tooltip disabled | `No hay ejercicios en esta categoría` | Texto plano factual. SIN `(0 ejercicios)`, SIN signo de exclamación. Renderizado vía `:title` nativo del navegador — escape automático por la spec HTML, T-02-01 invariante preservado sin esfuerzo |
| `aria-label` (opcional) | (no se declara — el texto `Examen` es suficiente) | Coherente con `Backup` / `Reanudar` / `Descartar` que tampoco declaran `aria-label`. El screen reader lee "Examen, button" |

### Nuevo header de columna (D-184)

| Element | Copy | Decisión |
|---------|------|----------|
| `<th scope="col">` del nuevo header | `Examen` | Mismo wording que el botón → ruido cognitivo mínimo. Capitalización inicial idéntica a `Estado` / `Categoría` / `Racha` / `Ejercicios` / `Última vez` |
| Alternativa rechazada | (no usar `<th>` vacío) | Una columna con cabecera vacía es ambigua para screen readers y rompe la consistencia visual con las 5 columnas existentes. Phase 8 declara el `<th>` con el mismo wording que el botón. |

### Tabla home — orden de columnas exacto

```
| Estado | Categoría | Racha | Ejercicios | Última vez | Examen |
```

El nuevo `<th>` y la nueva `<td>` son la **6ª columna**, posición final de la fila. Razones (Claude's discretion):
1. **Reading-flow natural izquierda → derecha:** las primeras 5 columnas son metadata informativa (estado actual, contexto histórico). La 6ª columna es la ACCIÓN. Acciones a la derecha es el patrón canónico de tablas SaaS (Linear, Notion, GitHub Issues, dashboards admin).
2. **Coherencia con el botón `Backup` arriba:** la fila `.button-row-prominent` lee `[Repaso 20] [Test completo] [Backup]` — la acción secundaria está a la derecha. La misma jerarquía se replica en la tabla: 5 columnas de metadata + 1 columna de acción a la derecha.
3. **Evita reordering del orden cognitivo existente:** el autor ya tiene memoria muscular para leer "Estado → Categoría → Racha → Ejercicios → Última vez". Insertar `Examen` en el medio (e.g., 2ª columna) rompería ese flujo. Insertarlo al final preserva el orden.
4. **Vs. botón inline al final de la celda Categoría sin `<th>`:** rechazado porque (a) el screen reader pierde el contexto (no hay header asociado al botón); (b) la celda Categoría se vuelve ambigua (texto + botón); (c) la 6ª columna explícita es más legible para una tabla de 7 filas en desktop.

### Estado vacío (cat sin ejercicios — D-187)

| Element | Copy |
|---------|------|
| Botón disabled | `Examen` (sigue visible, NO se oculta) — D-187 explícito: "disabled (no oculto) mantiene la consistencia visual de la fila" |
| Tooltip | `No hay ejercicios en esta categoría` |
| Empty-state row del tabla | (no aplica — Phase 8 NO añade empty-state de tabla; el caso "0 categorías cargadas" ya está cubierto por CONT-05 banner de error) |

### Estado dominada / hecha (D-187)

| Element | Copy |
|---------|------|
| Botón en cat `hecha` | `Examen` enabled normal — D-187 explícito: "El autor sigue queriendo poder re-examinar para reconfirmar dominio" |
| Botón en cat `dominada` | `Examen` enabled normal |
| Tooltip | (sin tooltip — enabled) |

### Confirmación al lanzar Examen con Test completo activo (D-44 patrón, 6ª call-site)

Reusa el panel `.confirm-inline` heredado de Phase 2 sin tocar la clase. Cuando `state.inFlightTest !== null` y el autor pulsa `Examen` en cualquier fila:

| Element | Copy |
|---------|------|
| `confirmDialog.message` | `Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?` |
| Botón Confirm | `Continuar` (Pico primary cyan default — coherente con las 5 call-sites previas) |
| Botón Cancel | `Cancelar` (`class="secondary"` — coherente con las 5 call-sites previas) |
| `confirmDialog.onConfirm` | `() => { this.clearInFlightTest(); this._launchExamen(catId); }` (decisión del planner sobre la firma exacta) |

**Razones de la copy literal:**
- **`Ya hay un Test completo en curso.`** — D-183 hereda la decisión Phase 2: el banner reanudar dice "Test completo a medias", no "Examen a medias". Coherencia textual: si decimos "Test completo" en el banner, decimos "Test completo" en la confirmación. El usuario sabe que un Examen ES semánticamente un Test completo de 1 cat (D-189).
- **`¿Descartarlo y empezar uno nuevo?`** — pregunta directa, segunda persona implícita ("¿Descartarlo [tú]?"). Coherente con las 5 call-sites previas:
  - D-27 (volver al home en picker): "Vas a salir del Test completo en curso. ¿Descartarlo?" (Phase 2)
  - D-43 (descartar in-flight banner): "Vas a descartar tu Test completo a medias. ¿Continuar?"
  - D-44 (lanzar nuevo Test desde picker con uno activo): "Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?"
  - D-76 (import backup): texto multi-paragraph del Phase 4 UI-SPEC.
- **`Continuar` / `Cancelar` (NO `Descartar` / `Cancelar`):** coherencia 100% con las 5 call-sites previas. El verbo "Continuar" en el botón confirm es semánticamente "Continuar con la acción que dispara la confirmación" (descartar el actual + arrancar el nuevo). Cambiar a "Descartar" rompería el patrón unificado del helper.

### Lanzamiento directo sin confirmación (D-186)

CONTEXT D-186 locked: **NO mostrar confirmación previa antes de lanzar Examen** cuando no hay Test completo activo.

| Acción | Confirmation pattern |
|--------|---------------------|
| Click `Examen` sin Test completo activo | **NO confirmación.** Lanza directamente. D-186 explícito: "coherente con D-181 'directo a session' y con el filosofía de 'el autor sabe lo que está clickeando'". |
| Click `Examen` con Test completo activo | Confirmación inline `.confirm-inline` (6ª call-site D-44 patrón) — ver tabla arriba. |

Phase 8 **añade UNA sola call-site nueva** de `requestConfirm()` — la 6ª. Las 5 previas siguen idénticas.

### Tono y reglas heredadas (sin cambios)

- `x-text` exclusivamente para contenido dinámico desde JSON (T-02-01 invariante anti-XSS). El texto `Examen` del botón es **literal HTML**, NO interpolado.
- Texto sin emojis decorativos. Sin `🎯`, sin `📝`, sin glifo direccional.
- Capitalización preservada de Pico defaults.
- Sin signos de exclamación, sin reformulaciones positivas, sin "¡suerte!".

### Edge cases de copywriting

- **Categoría con nombre muy largo (e.g., `Sustantivos irregulares`):** el `<td>` de `Categoría` se expande; la 6ª columna `Examen` mantiene su ancho mínimo dado el contenido fijo del botón. No requiere truncate ni `text-overflow: ellipsis` — el desktop FOUND-03 cabe holgado.
- **Categoría con `cat.totalCount > 99` (hipotético — actualmente máx Profesiones 51):** la columna `Ejercicios` se expande naturalmente; la columna `Examen` no se ve afectada.
- **0 categorías cargadas (CONT-05 banner de error):** la `<table>` está vacía; el banner CONT-05 muestra el problema. Phase 8 NO añade empty-state nuevo.

### Destructive actions

**Phase 8 introduce 0 acciones semánticamente destructivas a nivel UI directo.** La única destructive (descartar Test completo activo) viaja a través del `requestConfirm` heredado D-44 — el destructive ya está manejado por el helper.

---

## Component Inventory (Phase 8 additions)

| Component | Type | DOM location | Sub-states owned |
|-----------|------|--------------|------------------|
| `<th scope="col">Examen</th>` | Table header cell | Dentro del `<thead><tr>` de la tabla home, posición 6 (después de `Última vez`) | None |
| `<td>` por fila con `<button class="secondary outline">` | Table cell + botón | Dentro de cada `<tr>` del `<tbody>` (template `x-for="cat in categoriesForDisplay"`), posición 6 (al final de cada fila) | None — el botón lee `cat.examenEnabled` + `cat.examenTooltip` |
| Botón `Examen` | Button (secondary outline) | Hijo único del `<td>` nuevo | None — handler `startExamen(cat.id)` |
| `cat.examenEnabled` (derived) | Computed property dentro de `categoriesForDisplay` | `src/screens/app.js` línea ~1949 (dentro del `.map()`) | Calculado como `(exercisesByCat[cat.id] ?? []).length > 0` — reuso de `exercisesByCat` ya construido |
| `cat.examenTooltip` (derived) | Computed property dentro de `categoriesForDisplay` | Mismo `.map()` | `cat.examenEnabled ? '' : 'No hay ejercicios en esta categoría'` |
| Handler `startExamen(categoryId)` | Method en `appShell` factory | `src/screens/app.js` (posición junto a `openPicker` / `startSession` — decisión del planner) | Lee `state.inFlightTest`, `content.exerciseById`. Escribe `currentScreen`, `sessionMode`, `sessionExerciseIds`, `sessionCursor`, etc. Decisión arquitectónica del planner (CONTEXT.md ya sugiere reuso del bloque de reset desde `startSession` líneas ~457-475 sin refactor a helper, igual que `restartRepaso` Phase 6 D-104). |
| `_launchExamen(catId)` (helper interno opcional) | Method privado | `src/screens/app.js` | Cuerpo del lanzamiento puro (buildFullTest + reset sub-estado + persistInFlightTest + currentScreen='session'). Usado por `startExamen` + por `confirmDialog.onConfirm` cuando hay conflict. Decisión del planner — la separación interna NO está prescrita en el UI-SPEC. |

**Nota arquitectónica para el planner:** el contrato UI exige solo que (a) un click sin conflict arranque la sesión directamente, (b) un click con conflict abra el confirm con la copy literal de arriba, (c) confirmar el confirm arranque la sesión, (d) cancelar deje el state intacto. La distribución exacta entre `startExamen` / `_launchExamen` / inline en `confirmDialog.onConfirm` es libertad del planner.

---

## Visual Wireframes

### Pantalla home (post-Phase 8, con 7 categorías y todas con ejercicios > 0)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ <article>                                                                        │
│   <header><h2>Categorías</h2></header>                                           │
│                                                                                  │
│   [.inflight-banner si state.inFlightTest activo — sin cambios]                  │
│   [.backup-banner si shouldShowBackupBanner — sin cambios]                       │
│                                                                                  │
│   ┌─────────────────┬──────────────────┬─────────────────────┐                   │
│   │   Repaso 20     │  Test completo   │       Backup        │  ← sin cambios   │
│   │   (primary)     │   (primary)      │     (secondary)     │     Phase 4 D-81 │
│   └─────────────────┴──────────────────┴─────────────────────┘                   │
│                                                                                  │
│   ┌────────┬──────────────────────┬────────┬──────────┬─────────┬───────────┐   │
│   │ Estado │ Categoría            │ Racha  │Ejercicios│Última v.│  Examen   │   │  ← <th> NEW
│   ├────────┼──────────────────────┼────────┼──────────┼─────────┼───────────┤   │
│   │   ●    │ Avere                │ 3/21 d │    23    │  hoy    │ [Examen]  │   │
│   │   ✓    │ Essere               │ 5/21 d │    39    │  ayer   │ [Examen]  │   │
│   │   ●    │ Género y Número      │ 0/21 d │    40    │  ayer   │ [Examen]  │   │
│   │   ★    │ Profesiones          │ 21 d   │    51    │  hoy    │ [Examen]  │   │  ← dominada,
│   │   ●    │ Sustantivos Irreg.   │ 1/21 d │    31    │  hace 3d│ [Examen]  │   │     enabled
│   │   ✓    │ Verbos de Movimiento │ 7/21 d │    37    │  hoy    │ [Examen]  │   │     normal
│   │   ●    │ Preposiciones        │ 0/21 d │    50    │  ayer   │ [Examen]  │   │     (D-187)
│   └────────┴──────────────────────┴────────┴──────────┴─────────┴───────────┘   │
│                                                                                  │
│ </article>                                                                       │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**Vertical order exacto:** banners → action row (3 botones grandes) → tabla con 6 columnas. **Sin cambios respecto a Phase 4/5/6/7 excepto la 6ª columna.**

### Caso edge — categoría con 0 ejercicios (hipotético D-187)

```
   ┌────────┬──────────────────────┬────────┬──────────┬─────────┬─────────────┐
   │   ●    │ Una categoría vacía  │ 0/21 d │     0    │   --    │ [Examen]    │  ← disabled,
   └────────┴──────────────────────┴────────┴──────────┴─────────┴─────────────┘     opacity ~0.5,
                                                                                     cursor not-allowed,
                                                                                     :title="No hay ejercicios en esta categoría"
```

### Confirmation inline (6ª call-site D-44 patrón) cuando hay Test completo activo

```
                                                       ┌──────────────────────────────────────┐
                                                       │ Ya hay un Test completo en curso.    │
                                                       │ ¿Descartarlo y empezar uno nuevo?    │
                                                       │                                      │
                                                       │ [ Continuar ]  [ Cancelar (sec.) ]   │
                                                       └──────────────────────────────────────┘
                                                                  ↑
                                                       Fixed top-right (Phase 2 D-27)
                                                       max-width 22rem, box-shadow, z-index 1000
```

El panel posición, tamaño y styling se heredan literalmente de Phase 2 `.confirm-inline`. CERO nuevo CSS.

### Pantalla session post-lanzamiento de Examen

**Sin cambios visuales (D-189).** La sesión session se renderiza exactamente igual que un Test completo regular: `<header x-text="sessionProgressLabel">` muestra "Ejercicio 1 / 23" (si Avere). El usuario sabe que es un Examen porque acaba de pulsar el botón. NO se renderiza badge "Examen: Avere" ni header diferenciado.

---

## Interaction State Diagram

### UX-NEW — Click `Examen` en fila de cat (sin Test completo activo)

```
              ┌─────────────────────────────┐
              │ currentScreen='home'        │
              │ state.inFlightTest === null │
              │ cat.examenEnabled === true  │
              └──────────────┬──────────────┘
                             │ click "Examen" en fila Avere
                             ▼
              ┌─────────────────────────────────────┐
              │ startExamen('avere') sync:          │
              │  - state.inFlightTest? → false      │
              │    (no confirm path)                │
              │  - cancelAutoAdvance() defensivo    │
              │  - cancelMatchFlash() defensivo     │
              │  - allExercises = [...]             │
              │  - sessionExerciseIds =             │
              │      buildFullTest(['avere'],       │
              │                    allExercises,    │
              │                    rng)             │
              │  - sessionMode = 'test-completo'    │
              │  - sessionCursor = 0                │
              │  - sessionResults = []              │
              │  - reset all sub-states             │
              │    (wordButtons*, match*, etc.)     │
              │  - initSubStateForExercise(first)   │
              │  - persistInFlightTest() — escribe  │
              │    state.inFlightTest con cursor=0  │
              │  - currentScreen = 'session'        │
              └──────────────┬──────────────────────┘
                             │
                             ▼
              ┌─────────────────────────────┐
              │ currentScreen='session'     │
              │ sessionMode='test-completo' │
              │ sessionExerciseIds=[23]     │
              │ sessionCursor=0             │
              │ state.inFlightTest activo   │
              └─────────────────────────────┘
```

### UX-NEW — Click `Examen` en fila de cat (CON Test completo / Examen activo)

```
              ┌─────────────────────────────┐
              │ currentScreen='home'        │
              │ state.inFlightTest !== null │
              │ cat.examenEnabled === true  │
              └──────────────┬──────────────┘
                             │ click "Examen" en fila Avere
                             ▼
              ┌──────────────────────────────────────┐
              │ startExamen('avere') sync:           │
              │  - state.inFlightTest? → TRUE        │
              │  - requestConfirm({                  │
              │      message: "Ya hay un Test ...    │
              │                ¿Descartarlo y ...    │
              │                empezar uno nuevo?",  │
              │      confirmLabel: "Continuar",      │
              │      cancelLabel:  "Cancelar",       │
              │      onConfirm: () => {              │
              │        this.clearInFlightTest();     │
              │        this._launchExamen('avere');  │
              │      }                               │
              │    })                                │
              │  - return (no navega)                │
              └─────────────┬────────────────────────┘
                            │
                            ▼ panel .confirm-inline aparece top-right
                ┌────────────┴───────────────────────┐
                │                                    │
       click Cancelar                       click Continuar
                │                                    │
                ▼                                    ▼
   ┌─────────────────────────┐         ┌──────────────────────────────┐
   │ confirmDialog = null    │         │ clearInFlightTest() (limpia  │
   │ state intact            │         │   state.inFlightTest)        │
   │ currentScreen='home'    │         │ _launchExamen('avere'):      │
   │ (no navigation)         │         │   ... mismo flujo que la     │
   └─────────────────────────┘         │   versión SIN conflict ...   │
                                       │ currentScreen='session'      │
                                       └──────────────────────────────┘
```

**Lo que NO cambia (en ambas ramas):**
- `state.categoryProgress` — el state localStorage queda EXACTAMENTE como estaba (los D-54 ya persistidos del Test completo previo NO se deshacen al descartar). Solo `state.inFlightTest` se vacía.
- `exerciseStats` — NUNCA se bumpean por la operación descarte (D-09 monotonicidad heredada — el Test completo descartado fue Repaso-style abandoned, sus aciertos se descartan, sus fallos D-54 ya están persistidos).

**Edge defensivo:**
- Si `buildFullTest` devuelve 0 ejercicios (escenario imposible si `cat.examenEnabled === true` — el `.length > 0` guarda esto): el guard del `:disabled` lo previene. Pero defensivamente, si por alguna race condition `sessionExerciseIds.length === 0`, `initSubStateForExercise(undefined)` debe ser silencioso (igual que en Phase 6 `restartRepaso` edge "sesión vacía momentánea").

### UX-NEW — Reanudar Examen abandonado (heredado D-183)

```
              ┌─────────────────────────────┐
              │ Examen lanzado, sesión a    │
              │ medias, autor cierra tab    │
              │ → state.inFlightTest        │
              │   persistido con            │
              │   categoryIds=['avere']     │
              │   sessionMode='test-completo'
              └──────────────┬──────────────┘
                             │ recarga la app
                             ▼
              ┌─────────────────────────────┐
              │ currentScreen='home'        │
              │ .inflight-banner visible:   │
              │ "⚠ Tienes un Test completo  │
              │   a medias (12/23 ejer.)"   │  ← copy GENÉRICA (D-183)
              │ [Reanudar] [Descartar]      │
              └──────────────┬──────────────┘
                             │ click Reanudar
                             ▼
              ┌─────────────────────────────┐
              │ resumeInFlightTest() —      │
              │ reconstruye la sesión con   │
              │ las MISMAS categoryIds      │
              │ persistidas (= ['avere'])    │
              │ → buildFullTest(['avere'])  │
              │ → currentScreen='session'   │
              └─────────────────────────────┘
```

El banner reanudar **no distingue** entre Examen y Test completo regular — D-183 explícito ("minimiza cambios; el feature core es el atajo de 1 click desde home"). El autor sabe contextualmente que era un Examen porque la pantalla session muestra los ejercicios solo de Avere.

---

## Keyboard / Focus / Accessibility

### Focus management

| Transition | Where focus lands |
|------------|-------------------|
| Click `Examen` (sin conflict) → reset sesión | Browser default — el botón `Examen` retiene el foco visible. Al cambiar `currentScreen` a `'session'`, el botón se desmonta y el foco vuelve al `<body>` (heredado del patrón Phase 3 D-72: `@keydown.window` escucha al body globalmente). Esto es aceptable: el primer Tab dentro de session lleva al primer botón de la opción multi-choice (o al banco word-buttons, o al item match izq según el tipo del primer ejercicio). |
| Click `Examen` (con conflict) → confirm panel aparece | Phase 2 pattern: el confirm panel renderiza, pero **focus does not auto-move into it** (Phase 2 D-27 / D-43 / D-44 no implementaron focus-trap; UAT 02-04 aceptado). Phase 8 mantiene exactamente este comportamiento — NO añade focus-trap. |
| Click `Continuar` en confirm → reset sesión | Browser default — el botón `Continuar` retiene foco hasta que `currentScreen` cambia a `'session'`, momento en el que el foco vuelve al `<body>`. |
| Click `Cancelar` en confirm | El confirm panel desaparece; el foco vuelve al body. El siguiente Tab lleva al botón `Examen` previamente pulsado (Pico's tab order preservado). |

### Keyboard shortcuts

| Key | Behavior post-Phase 8 |
|-----|------------------------|
| Tab en pantalla home | Cicla a través de: banners (si hay botones) → `Repaso 20` → `Test completo` → `Backup` → fila 1 botón `Examen` → fila 2 botón `Examen` → ... → fila 7 botón `Examen`. El orden de Tab natural sigue el DOM. **Phase 8 NO añade tabindex explícitos** — Pico's tab order natural basta. |
| 1-9 / a-i / Enter / Space / Backspace en home | **Sin cambios** — Phase 1-7.2 NO bound atajos globales en la home. Phase 8 NO bound atajos en home (D-188 explícito: "Sin atajos de teclado en v1. Solo click ratón."). |
| Esc en home | **No bound** — heredado Phase 1-7.2. |
| Enter (foco en botón `Examen` enabled) | Native button click — dispara `startExamen`. |
| Enter (foco en botón `Examen` disabled) | Pico `:disabled` ignora el click — no-op. |
| Enter (foco en `Continuar` del confirm) | Native — dispara onConfirm → arranca Examen. |
| Enter (foco en `Cancelar` del confirm) | Native — dispara onCancel → cierra confirm. |

**Phase 8 NO añade `@keydown.window` listener.** El handler `@keydown.window="handleSessionKey($event)"` existente está scoped al `<article>` de session (heredado Phase 3 D-72) — no afecta a la home.

### ARIA / semantic HTML

| Element | Role / ARIA |
|---------|-------------|
| Nuevo `<th scope="col">Examen</th>` | `scope="col"` (igual que los 5 existentes — heredado del template `index.html` líneas 154-160). Screen readers asocian cada celda `<td>` de cada fila con el header `Examen` automáticamente. |
| Nuevo `<td>` con botón | No `role` explícito — `<td>` semántica nativa. Screen readers leen "Examen, button, Examen" (header + tipo + label del botón). |
| Botón `Examen` enabled | Texto del botón es la etiqueta canónica. No `aria-label`. |
| Botón `Examen` disabled | `:disabled` atributo nativo + `:title="No hay ejercicios en esta categoría"`. Screen readers leen "Examen, button, disabled, No hay ejercicios en esta categoría". |
| Tooltip nativo (`title`) | Renderizado por el navegador en hover ~500ms; en mobile el long-press lo activa (no aplica — FOUND-03 desktop only). |
| Confirm panel D-44 | `role="alertdialog"` y `aria-labelledby="confirm-message"` ya seteados por Phase 2 — Phase 8 NO toca. |

### Color contrast

- `class="secondary outline"` (texto + borde Pico muted): ratio Pico default — verificado upstream por Pico (claim WCAG AA en light y dark mode auto via `color-scheme`).
- `:disabled` state (opacity ~0.5): coherente con todos los disabled del proyecto (e.g., botón `Empezar` del picker cuando `pickerPoolSize === 0`). Pico no rebaja el contraste por debajo del threshold WCAG AA visible — la señal de disabled está en cursor + opacity, no solo en el color.

---

## CSS additions (exhaustive list)

**CERO líneas de CSS nuevo en Phase 8.**

El botón `<button class="secondary outline">Examen</button>` es 100% estilado por Pico CSS 2.1.1 sin override. Las clases `secondary` y `outline` son públicas y documentadas:
- `secondary`: rinde el botón con color Pico muted en lugar del primary cyan.
- `outline`: rinde el botón con border + fondo transparente en lugar del fondo sólido.
- Combinadas: muted + outline = mínima densidad visual + texto legible.

El `<th>` y `<td>` nuevos heredan estilo de Pico's `<table>` defaults — sin override.

**Si emerge necesidad de override durante UAT (e.g., ancho fija de la columna `Examen` para alinear verticalmente los 7 botones, o reducción del padding del `<td>` que envuelve el botón):**

```css
/* ─── Phase 8 — Botón Examen por fila (D-184) ──────────────────────────────
 *
 * Override opcional si UAT detecta que la columna Examen es muy ancha o
 * muy estrecha. Por defecto Pico's <td> + <button class="secondary outline">
 * funciona sin override. Si se descubre alineación visual rota, descomentar
 * y ajustar:
 *
 * .home-table th:last-child,
 * .home-table td:last-child {
 *   width: 7rem;
 *   text-align: center;
 * }
 *
 * NOTA: la tabla home actual NO tiene class="home-table" — habría que añadirla
 * en index.html línea 152 si se quiere targeting limpio. Decisión del planner.
 */
```

Total CSS nuevo PRESCRITO: **0 líneas.** Total CSS opcional (sugerido como follow-up post-UAT, NO blocking): **~4 líneas** dentro de un selector específico.

---

## Implementation Notes for the planner

### Reusable assets a NO reinventar

- **`<button class="secondary outline">`** (Pico CSS 2.1.1 built-in): cero override necesario. La combinación `secondary outline` está documentada por Pico y rinde correctamente en light/dark mode auto.
- **`<th scope="col">` + `<td>`** patrón heredado del index.html línea 153-160: el nuevo `<th>` se inserta como 6º hermano dentro del `<thead><tr>`; el nuevo `<td>` se inserta como 6º hermano dentro del `<tbody><template x-for><tr>`.
- **`categoriesForDisplay` getter** (`src/screens/app.js` línea ~1949): el planner extiende el `.map()` actual con dos campos derivados — `examenEnabled: (exercisesByCat[cat.id] ?? []).length > 0` y `examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría'`. El cómputo de `exercisesByCat` ya existe (línea ~1952-1957); reutilizar sin recomputar.
- **`requestConfirm({message, confirmLabel, cancelLabel, onConfirm})`** (`src/screens/app.js` línea ~388): patrón inline confirm. Phase 8 es la **6ª call-site** (D-27 / D-43 / D-44 / D-76 / Phase 7 import? / Examen). Sin tocar la firma del helper.
- **`clearInFlightTest()`** + **`persistInFlightTest()`** + **`buildFullTest`** (referencias en CONTEXT.md): se invocan tal cual. Sin cambios en sus firmas.
- **Bloque de reset de sub-estado** de `startSession` líneas ~457-475: duplicación aceptable en `startExamen` igual que `restartRepaso` Phase 6 D-104 hizo. Refactor a helper común solo si emerge 3er-4to call-site (CONTEXT.md explícito).

### Cosas deliberadamente FUERA del scope visual Phase 8

- **Sin header diferenciado "Examen: Avere"** en pantalla session (D-189 explícito).
- **Sin copy especializada en banner reanudar** ("Examen de Avere a medias" vs "Test completo a medias") — D-183 explícito.
- **Sin aviso/confirmación previa** ("¿Examinar Avere? Si fallas vuelve a no-hecha") — D-186 explícito.
- **Sin atajos de teclado** (E + número de fila) — D-188 explícito.
- **Sin botón Examen en el picker** — D-184 explícito (reinterpretación del título ROADMAP: ubicación correcta es la tabla home).
- **Sin badge visual "EXAMEN" en la columna `Categoría` de la cat siendo examinada** durante la sesión — over-engineering; el usuario sabe contextualmente.
- **Sin contador "has hecho 3 Exámenes de Avere"** — CONTEXT.md deferred (los counters `exerciseStats` actuales son suficientes).
- **Sin selector multi-cat** (selección de 2-3 cats para examinar en bloque) — CONTEXT.md deferred (si el autor lo necesita usa Test Completo regular vía picker).
- **Sin animación** de aparición de la columna `Examen` — coherente con Phase 1-7.2 (cero animaciones).
- **Sin loading state** ("Generando Examen...") — `buildFullTest` resuelve en <1ms para 23 ejercicios.
- **Sin override CSS prescrito** — el estilo Pico default funciona sin tocar styles.css.

### Reglas T-02-01 (anti-XSS)

- El texto `Examen` del botón es **literal HTML** hardcoded en `index.html`, NO interpolado desde JSON. Cero riesgo XSS.
- El `:title="cat.examenTooltip"` se enlaza a un string controlado por la app (no JSON content), pero por defecto los atributos `title` son escapados por el navegador. Sin riesgo.
- El header `<th scope="col">Examen</th>` es literal HTML. Sin riesgo.
- Cero `x-html` en Phase 8.

### Reactividad Alpine sobre `categoriesForDisplay`

- El getter `categoriesForDisplay` ya es reactivo sobre `this.content` + `this.state` (Phase 2 D-29). Añadir `examenEnabled` + `examenTooltip` dentro del `.map()` mantiene la reactividad automáticamente — cuando `state.categoryProgress` cambia, el getter recomputa, Alpine re-renderiza.
- El `:disabled="!cat.examenEnabled"` y `:title="cat.examenTooltip"` son bindings reactivos estándar de Alpine — re-renderizan cuando `categoriesForDisplay` cambia.

### Naming del handler (Claude's discretion resuelto)

CONTEXT Claude's discretion: *"Nombre del handler — sugerido `startExamen(categoryId)` en `src/screens/app.js`."*

**Resolución:** `startExamen(categoryId)` confirmado.

Razones:
1. **Coherencia con `startSession`** existente (verbo `start` + sustantivo del modo).
2. **Coherencia con `openPicker(mode)`** (Phase 2) — verbo + sustantivo.
3. **El parámetro es semánticamente la `categoryId`**, no `categoryIds` (Examen es 1-cat por diseño D-181).
4. **Naming `restartRepaso` Phase 6** establece el patrón verb-noun en español dentro de identificadores ES. `startExamen` lo respeta.
5. **NO `startCategoryTest(categoryId)`** porque rompe el patrón "Examen" del CONTEXT (D-185 etiqueta + D-189 sessionMode).

### Test plan sugerido (consumo del planner)

El UI-SPEC NO prescribe los tests — el planner los define. Pero coherencia visual con CONTEXT (~3-5 tests sugeridos):

1. **Smoke: `startExamen('avere')` sin Test completo activo** → `currentScreen === 'session'`, `sessionMode === 'test-completo'`, `sessionExerciseIds.length === 23`, `state.inFlightTest !== null`.
2. **Conflict D-44: `startExamen('avere')` con `state.inFlightTest` activo** → `confirmDialog !== null`, message contiene "Ya hay un Test completo en curso", `currentScreen === 'home'` (no navega).
3. **Conflict confirmar: `confirmDialog.onConfirm()` con pending Examen** → `state.inFlightTest.categoryIds === ['avere']`, `currentScreen === 'session'`.
4. **Disabled cat 0 ejercicios:** mockear `categoriesForDisplay` con `totalCount: 0` → `cat.examenEnabled === false`, `cat.examenTooltip === 'No hay ejercicios en esta categoría'`.
5. **Promoción a `hecha` tras Examen sin fallos:** ya cubierto por DOMAIN-04 tests existentes — Examen es semánticamente Test completo de 1 cat (D-189/D-190); cero test nuevo necesario si DOMAIN-04 ya está verde.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | not applicable | not applicable (proyecto vanilla Alpine + Pico CDN; sin shadcn ni registries de terceros) |

Phase 8 introduce **cero dependencias externas nuevas, cero registry blocks, cero CDN packages, cero clases CSS nuevas, cero JS modules nuevos.** El stack queda 100% locked al estado post-Phase 7.2: Alpine 3.15.12 + Pico 2.1.1 (SRI pinned desde Phase 1).

---

## Estados visuales por componente (resumen denso para el ejecutor)

### Botón `Examen` (por fila)

| Estado | Visual | Trigger |
|--------|--------|---------|
| Visible idle (enabled) | Pico `secondary outline` (borde Pico muted, fondo transparente, texto Pico muted) | `cat.examenEnabled === true` |
| Hover (mouse, enabled) | Pico `secondary outline:hover` (background tint sutil + cursor pointer) | Mouseover sobre enabled |
| Focus-visible (teclado, enabled) | Pico `:focus-visible` outline ring | Tab a través de la tabla |
| Pressed (click, enabled) | Pico `:active` (background tint más fuerte) | Click |
| Disabled | Pico `:disabled` (opacity ~0.5 + cursor not-allowed + sin hover) + tooltip nativo | `cat.examenEnabled === false` (i.e. `cat.totalCount === 0`) |
| Durante session activa | El botón sigue renderizado en la home, pero la home no está visible (`currentScreen === 'session'`) — DOM-wise el `<template x-if="currentScreen === 'home'">` desmonta toda la tabla | n/a (visible solo en home) |

### Nuevo header `<th>Examen</th>`

| Estado | Visual | Trigger |
|--------|--------|---------|
| Renderizado | Pico `<th scope="col">` default — mismo peso, color, padding que `Estado` / `Categoría` / `Racha` / `Ejercicios` / `Última vez` | Siempre (mientras `currentScreen === 'home'`) |
| Hover/focus | n/a — el `<th>` no es interactivo | n/a |

### Confirm `.confirm-inline` 6ª call-site (sin cambios CSS, copy nueva)

| Estado | Visual | Trigger |
|--------|--------|---------|
| Hidden | No renderizado — `<template x-if="confirmDialog">` evita el mount | `confirmDialog === null` |
| Visible | Panel top-right fixed (Phase 2 D-27) — sin cambios visuales | `confirmDialog !== null` después de `requestConfirm(...)` |
| Confirm clicked | Panel desaparece + `onConfirm` ejecuta | Click `Continuar` |
| Cancel clicked | Panel desaparece, state intact | Click `Cancelar` |

---

## Decisiones de Claude's Discretion resueltas aquí

| Discretion (CONTEXT.md §Claude's Discretion) | Resolución |
|-----------------------------------------------|------------|
| Layout exacto del botón en la fila (columna nueva vs inline) | **6ª columna nueva** con `<th scope="col">Examen</th>` — reading-flow izquierda-derecha (metadata → acción), coherente con tabla SaaS, mejor a11y que botón inline |
| Estilo del botón (`secondary` solid vs `secondary outline` vs primary) | **`class="secondary outline"`** — nivel 3 de jerarquía visual (1=primary, 2=secondary sólido `Backup`, 3=outline para botones × 7 filas), evita ruido visual repetido |
| Tooltip exacto del disabled | **`No hay ejercicios en esta categoría`** — texto plano factual, sin signo de exclamación, sin parentesis con número |
| Tooltip enabled (debate añadir o no) | **Sin tooltip enabled** — el texto `Examen` ya es autodescriptivo, coherencia con el resto de la home |
| Nombre del handler | **`startExamen(categoryId)`** — verb-noun en ES, coherente con `startSession`, `restartRepaso`, `openPicker` |
| Glifo / icono en el botón | **Sin glifo** (D-185 locked: texto plano). Sin `↗`, sin emoji, sin `(N)` con contador |
| Header del `<th>` | **`Examen`** (mismo wording que el botón → ruido cognitivo mínimo) |
| Posición de la columna en la tabla | **Final (6ª)** — acción al final coherente con `Backup` al final de la row de 3 botones grandes |
| `aria-label` extra en el botón | **No declarado** — texto del botón es la etiqueta canónica, coherente con `Backup`/`Reanudar`/`Descartar` |
| Visual cue durante Examen activo en pantalla session | **Sin diferenciación** (D-189) — la sesión es semánticamente Test completo de 1 cat |
| Banner reanudar especializado | **Sin cambios** (D-183 locked) — copy genérica "Test completo a medias" |
| CSS override del `<td>`/`<th>` para alineación columna | **0 líneas CSS prescrito** — Pico defaults bastan; override de ~4 líneas opcional como follow-up post-UAT |
| Tests count esperado | **3-5 tests** sugeridos al planner (smoke directo, conflict requestConfirm, confirm onConfirm, disabled cat-0; opcional promoción) — el planner decide cantidad exacta |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS — toda copy en español, exacta para los 3 elementos nuevos (`Examen` botón + `Examen` header + `No hay ejercicios en esta categoría` tooltip disabled + literal `Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?` confirm), tono sobrio sin emojis decorativos, T-02-01 invariante anti-XSS reforzado (cero `x-html`, `:title` escapado por navegador), 6ª call-site `requestConfirm` con copy literal que reusa el patrón D-44 unificado
- [ ] Dimension 2 Visuals: PASS — 6ª columna `Examen` al final de la tabla home con `<th>` + `<td>` + `<button class="secondary outline">`; wireframes ASCII de home (con 7 cats enabled), edge cat-0 (disabled), y confirm panel (sin cambios); 6 estados del botón documentados (idle / hover / focus / pressed / disabled / no-renderizado); cero pantallas nuevas, cero banners nuevos, cero diferenciación visual en session
- [ ] Dimension 3 Color: PASS — 60/30/10 heredado de Phase 2-7.2 sin cambios; cero tokens nuevos; clase `secondary outline` (Pico-oficial) aplicada a 1 solo elemento nuevo; sin uso de primary cyan ni destructive red ni success green en Phase 8; tooltip nativo escapado sin contraste custom
- [ ] Dimension 4 Typography: PASS — cero tamaños y pesos nuevos; Pico defaults para `<th>`, `<button>`, body; sin `<small>`, sin `<kbd>`, sin `font-style`, sin `text-transform` en el botón
- [ ] Dimension 5 Spacing: PASS — cero tokens nuevos; cero CSS nuevo prescrito; Pico `<td>` padding + Pico `<button>` padding bastan; sin `.button-row` nuevo, sin margin/padding inline en el `<td>`
- [ ] Dimension 6 Registry Safety: PASS — none (proyecto vanilla, sin terceros más allá de Pico+Alpine CDN ya pinned con SRI desde Phase 1); cero dependencias nuevas; clases `secondary` + `outline` son Pico-oficiales 2.1.1

**Approval:** pending (gsd-ui-checker debe validar y upgradear a `approved`)
