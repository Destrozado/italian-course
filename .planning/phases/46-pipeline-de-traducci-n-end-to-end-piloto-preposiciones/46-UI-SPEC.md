---
phase: 46
slug: pipeline-de-traducci-n-end-to-end-piloto-preposiciones
status: approved
shadcn_initialized: false
preset: none
created: 2026-08-13
---

# Phase 46 — UI Design Contract

> Contrato visual y de interacción de la Phase 46. Generado por `gsd-ui-researcher`, verificado por `gsd-ui-checker`.
>
> **Naturaleza de la fase:** brownfield puro sobre un sistema de diseño hand-written ya establecido
> (tokens `--ed-*`, Phase 32-34). Esta fase **NO introduce ningún token nuevo, ninguna paleta nueva,
> ninguna familia tipográfica nueva y ninguna copy nueva de interfaz.** Introduce **un (1) rol
> tipográfico nuevo** — la traducción española de la frase resuelta — y lo materializa como **una (1)
> regla CSS compartida** por las dos superficies en scope.
>
> Todas las decisiones de fondo están **LOCKED en `46-CONTEXT.md` (D-46-06 … D-46-10)**. Este documento
> las formaliza citando el código que YA existe; no las redecide.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | **none** (hand-written; sin shadcn, sin registry) |
| Preset | not applicable |
| Component library | **none** — HTML estático + Alpine.js 3.x directivas (`x-show`, `x-text`, `x-for`, `x-if`) |
| Icon library | **none** — los marcadores son glifos hardcodeados (`✓`, `✗`, `→`) en CSS/markup, `aria-hidden` |
| Font | `--ed-font-serif` = `'Spectral', Georgia, serif` · `--ed-font-sans` = `'Hanken Grotesk', system-ui, sans-serif` (self-hosted en `vendor/fonts/`, `@font-face` en `app.css`) |
| Base / reset | **`app.css` ES el reset/base.** Pico CSS fue ELIMINADO en Phase 32 (GAP-01). `styles.css` carga primero, `app.css` después y gana la cascada. |
| Theme | **un solo tema claro.** No hay `prefers-color-scheme` ni `[data-theme=dark]` activos → no hace falta variante oscura. |
| Viewport | **desktop-only** (CLAUDE.md). Responsive móvil diferido a milestone propio; esta fase **no añade `@media`**. |

**Prohibiciones de stack (heredadas, no negociables en esta fase):** no re-introducir Pico, Tailwind,
shadcn ni ningún framework CSS; no añadir dependencias; no `x-html` (T-02-01, anti-XSS).

**shadcn gate:** no aplica. El stack no es React/Next/Vite y CLAUDE.md prohíbe explícitamente
frameworks con build step. `components.json` ausente y debe seguir ausente.

---

## Scope: exactamente 2 superficies

| # | Superficie | Fichero · líneas actuales | Sub-template | Requirement |
|---|------------|---------------------------|--------------|-------------|
| 1 | Caja de feedback de la pantalla de ejercicio (`.session-feedback`) | `index.html:592-621` | **solo** `multiple-choice` (`x-if` en `:547`) | REND-01, REND-02, REND-03, REND-05 |
| 2 | Card de «Errores cometidos» del resumen | `index.html:1281-1298` | **solo** `multiple-choice` (`x-if` en `:1281`) | REND-04, REND-05 |

La superficie 1 sirve a los **tres modos de ejercicio** (repaso, test completo, examen/contrarreloj)
porque el template es único; no hay tres copias que sincronizar.

### Fuera de scope — NO se tocan

| Superficie | Por qué |
|------------|---------|
| `.session-feedback` de `word-buttons` (`index.html:707-736`) | SCH-02 RECHAZA `translationES` en `word-buttons` → nunca hay dato que pintar |
| `.session-feedback` de `match` (`index.html:868-882`) | SCH-02 RECHAZA `translationES` en `match` |
| `.summary-error-explanation` de `word-buttons` (`:1306`) y de `match` (`:1323`) | ídem |
| Pantalla de canciones (`.wb-*`, `song-*`) | sus frases YA son traducción validada; fuera del milestone |
| `.session-prompt` (`index.html:525-540`, `app.css:858-882`) | **byte-intacto** — ver D-46-06 |
| Botón «¿Por qué?» / tecla `e` (`:617-620`) | **byte-intacto** — D-46-10 |
| CTA «Continuar →» (`:629-632`) | **byte-intacto** — D-46-01 |
| `src/domain/`, `src/screens/app.js` | **byte-intacto** — D-46-01 / D-46-11 |

**Hallazgo verificado que sostiene el «byte-intacto»:** los dos getters que alimentan las dos
superficies construyen el payload con **spread de la variante completa** —
`payload: { ...surface, explanation: slot.explanation }` (`src/screens/app.js:2703` para
`sessionCurrentExercise`, `:2742` para `summaryVariantSurface`). Por tanto `translationES` **fluye
sola** a los dos templates sin una línea de JS nueva. El render de esta fase es HTML + CSS puro.

---

## Anatomía (LOCKED — D-46-06 / D-46-08)

### Superficie 1 — caja de feedback, orden narrativo `qué era → qué significa → por qué`

```
┌─ ¡Esatto!  /  Quasi… ─────────────────────┐   .session-feedback-title   serif 17/600, color de estado
│  Respuesta correcta: **di**                │   .session-feedback-correct sans  13/400, --ed-red-text   (solo al FALLAR)
│  Paolo es de Nápoles de nacimiento.        │   .session-translation      serif 16/400, --ed-ink        ◀── NUEVO
│  La preposición Di indica origen estable…  │   .session-explanation      sans  13/400, --ed-muted
│  [ ¿Por qué? ]                             │   .session-why                                            (solo al ACERTAR)
└────────────────────────────────────────────┘
```

**Orden DOM obligatorio:** la traducción es el **hermano inmediatamente siguiente** a
`.session-feedback-correct` e **inmediatamente anterior** a `.session-explanation`. No es negociable:
al fallar, la línea «Respuesta correcta: **di**» es el antecedente que hace legible la traducción
(el prompt italiano de arriba muestra la opción SELECCIONADA tachada, no la correcta —
`index.html:537`), y la `explanation` cierra con el porqué.

### Superficie 2 — card de «Errores cometidos» (misma anatomía, misma lógica de estilo)

```
┌─ ERRORES COMETIDOS · 3 ───────────────────┐
│ Maria viene da Pisa, ma è ___ Roma…        │   li > strong                serif (prompt de la variante)
│ Tu respuesta: ~~a~~                        │   .user-answer               --ed-red-text, tachado
│ Respuesta correcta: **di**                 │   li div strong              --ed-green-on-tint
│ Paolo es de Nápoles de nacimiento.         │   .summary-error-translation serif 16/400, --ed-ink   ◀── NUEVO
│ La preposición Di indica origen estable…   │   .summary-error-explanation italic muted            (ya existe)
└────────────────────────────────────────────┘
```

**Orden DOM obligatorio:** hermano inmediatamente siguiente al `<div>` de «Respuesta correcta:» e
inmediatamente anterior a `.summary-error-explanation`.

---

## Spacing Scale

Escala del proyecto (4px, ya vigente; **no se amplía**):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | gaps inline, `gap` del `li` de errores (`styles.css:409`) |
| sm | **8px** | **el único valor que esta fase usa**: separación vertical entre líneas dentro de la caja de feedback y dentro de la card de error |
| md | 16px | `margin-top` de `.session-feedback`, padding horizontal de caja/card |
| lg | 24px | prompt → opciones |
| xl | 32px | gaps de layout |
| 2xl | 48px | padding inferior de `main` |
| 3xl | 64px | espaciado de página |

**Lo que esta fase declara:** `margin: 8px 0 0` en las dos clases nuevas. **Cero** cambios de padding,
gap, o margen en cualquier regla existente.

**Colapso de márgenes (verificado, no asumido):**
- Superficie 1: `.session-feedback` tiene `padding: 14px 16px` (`app.css:934`) → los márgenes de los
  hijos no se escapan de la caja. Entre traducción y `explanation`: `max(0, 8px)` = **8px**
  (`.session-explanation` trae `margin-top: 0.5rem` de `styles.css:458`).
- Superficie 2: la traducción vive dentro del `<div>` del `x-if`, **no** es flex item del `li`
  (`display:flex; gap:.25rem` está en el `li`, `styles.css:407-409`) → colapso normal de bloques,
  mismo resultado de **8px** contra `.summary-error-explanation`.

Exceptions: **none**. Ningún valor off-grid nuevo.

---

## Typography

Inventario tipográfico **de las dos superficies en scope** (tras esta fase):

| Role | Selector | Size | Weight | Line Height | Family | Estado |
|------|----------|------|--------|-------------|--------|--------|
| Título de caja | `.session-feedback-title` | 17px | 600 | 1.3 | serif | existe (`app.css:946-951`) |
| **Frase (traducción)** | **`.session-translation`, `.summary-error-translation`** | **16px** | **400** | **1.5** | **serif** | **NUEVO — el único rol que esta fase declara** |
| Dato de corrección | `.session-feedback-correct` | 13px | 400 | 1.5 | sans | existe (`app.css:957-964`) |
| Comentario (explanation) | `.session-explanation` | 13px | 400 | 1.5 | sans, `--ed-muted` | existe (`app.css:970-977`) |

**Sizes declaradas en scope: 3** → `17 / 16 / 13`. **Weights declaradas en scope: 2** → `400 / 600`.
*(El `font-weight: 700` de `.session-feedback-correct strong` (`app.css:965-967`) es pre-existente del
contrato de Phase 33 y no se toca; esta fase **no declara ningún peso nuevo**.)*

**Por qué serif 16/400 y no otra cosa (D-46-07, razonado sobre el código real):**
- **serif** porque la traducción es **texto de frase** — hermana del prompt italiano, que es
  `--ed-font-serif` 30/500 (`app.css:858-865`) — mientras la `explanation` es **comentario** y por eso
  es sans muted. La distinción es semántica, no decorativa.
- **16px** porque ya existe en la escala del proyecto (`app.css:919`, `:1050`, `:1743`) y porque
  desciende del título (17/600) sin competir con él, y asciende sobre la `explanation` (13/400 muted)
  con jerarquía inequívoca. En la superficie 2 iguala el tamaño de las líneas «Tu respuesta / Respuesta
  correcta» (16px heredado del `body`) y se distingue de ellas **solo** por familia serif + color ink,
  que es exactamente el contraste que pide D-46-08.
- **400** (no 500 ni 600) para que el peso no la confunda con un encabezado.
- **1.5** = el `line-height` del `body` (`app.css:259`); una traducción de 2 líneas respira igual que
  el resto de la prosa de la caja.
- **Sin etiqueta «Traducción:» y sin comillas latinas envolventes** (descartadas en D-46-07): la
  distinción tipográfica ya lo dice, y sin etiqueta el caso «sin traducción» (REND-05) es un único
  nodo que desaparece — no hay etiqueta ni contenedor huérfano que esconder.

**Wrapping:** flujo normal por espacios, sin `overflow-wrap: anywhere`. Ese refuerzo existe en
`.user-answer` (`styles.css:435`) porque ahí puede llegar un string unido sin espacios; una frase
española siempre trae espacios. **No añadir `overflow-wrap`, ni `text-wrap: balance`, ni `max-width`
propio** — la traducción hereda el ancho de la caja.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `--ed-paper` `#f4f0e8` | fondo de app y de `article` |
| Secondary (30%) | `--ed-surface` `#fbfaf6` · `--ed-paper-elevated` `#fbf8f1` | superficies de opción · card de error |
| Accent (10%) | `--ed-green` `#2f7d56` | ver lista reservada |
| Destructive / error | `--ed-red` `#b5412e` · `--ed-red-text` `#8f3322` | estado de fallo |

**Accent (`--ed-green`) reservado exclusivamente para:** el CTA primario («Continuar →», «Empezar»),
el hueco acertado (`.session-gap.gap-correct`), la barra/anillo de progreso, los enlaces, y el
`focus-visible` outline. **La traducción NO usa accent.**

### Color de la traducción — LOCKED

`color: var(--ed-ink)` (`#2b2722`) en **ambas** superficies y en **ambos** estados (acierto y fallo).

**Por qué ink neutro y no un color de estado:** la traducción es información **pedagógica invariante**
— la misma frase significa lo mismo se haya acertado o fallado. Tintarla de verde/rojo le daría
semántica de veredicto que no tiene, y competiría con el título y con la línea «Respuesta correcta:»,
que sí son señal de estado.

**Contraste verificado sobre los tres fondos donde puede aparecer** (`#2b2722` sobre):

| Fondo | Hex | Ratio aprox. | WCAG |
|-------|-----|--------------|------|
| `--ed-green-tint` (caja de acierto) | `#e8f1ea` | ≈ **12.8:1** | AAA |
| `--ed-red-tint` (caja de fallo) | `#f6e9e6` | ≈ **13.1:1** | AAA |
| `--ed-paper-elevated` (card de error) | `#fbf8f1` | ≈ **14.0:1** | AAA |

**Cero tokens `--ed-*` nuevos.** Cero hex literales en las reglas nuevas.

**El significado nunca es solo cromático:** la distinción traducción/explanation es **familia
tipográfica + tamaño + color** (serif 16 ink vs sans 13 muted; serif 16 ink vs italic muted en el
resumen), no matiz de color. Un usuario con visión de color reducida distingue ambas igual.

---

## CSS Contract

**Clases nuevas (discreción ejercida — espejo exacto del par que ya existe):**

| Superficie | Clase nueva | Espeja |
|------------|-------------|--------|
| 1 — caja de feedback | `.session-translation` | `.session-explanation` |
| 2 — card de error | `.summary-error-translation` | `.summary-error-explanation` |

**Regla única y compartida** — se declara **una sola vez**, con selector doble, replicando literalmente
el precedente `styles.css:453-460` (`.session-explanation, .summary-error-explanation` compartían un
bloque «porque ambas son visualmente idénticas; el diferenciador es solo el nombre de clase para
permitir customización independiente futura»). Un solo criterio de estilo que mantener en dos sitios
es exactamente lo que pide D-46-08.

```css
/* Traducción española de la frase ya resuelta (Phase 46 · REND-01/04, D-46-07).
 * Texto de FRASE, no comentario: serif como el prompt italiano (.session-prompt,
 * app.css:858), frente a la explanation que es sans muted porque comenta.
 * Sin etiqueta y sin comillas envolventes (D-46-07). Ink neutro en acierto y en
 * fallo: la traducción no es un veredicto. Selector compartido por las dos
 * superficies (precedente styles.css:453) — un solo criterio de estilo.
 * Cero tokens nuevos. */
.session-translation,
.summary-error-translation {
  font-family: var(--ed-font-serif);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--ed-ink);
  margin: 8px 0 0;                 /* sm — colapsa a 8px contra el margin-top de la explanation */
}
```

**Ubicación (discreción ejercida):** en `app.css`, inmediatamente **después** de `.session-explanation`
(hoy `app.css:970-977`), es decir al final del banner *«Caja de feedback (scaffold para 33-02/03/04,
D-09)»*. Razones: (a) mantiene juntas las dos reglas que el lector compara; (b) queda dentro del banner
que documenta la caja; (c) en la sección de Resultados (`app.css:1959-1985`) se deja **solo un
comentario de referencia cruzada**, sin regla, para que nadie duplique el criterio.

**Especificidad — verificado, no asumido:** ambas clases son **nombres nuevos**; `styles.css` no tiene
ninguna regla para ellas, así que un selector de clase simple en `app.css` (que carga después) basta.
**No** hace falta subir especificidad a `.summary-errors .summary-error-translation` — eso era
necesario para `.summary-error-explanation` porque tenía que vencer a la regla legacy de
`styles.css:454`. **No usar `!important` en ningún caso.**

**Prohibido en esta fase:** tokens nuevos, hex literales, `@media`, `:empty`, `overflow-wrap`,
`!important`, cambiar cualquier regla existente de `app.css` / `styles.css`, y tocar `.session-prompt`.

---

## DOM Contract

`x-text` **exclusivo**, jamás `x-html` (T-02-01). **Doble guard** `x-show`: estado resuelto **Y**
presencia del dato (D-46-09). Sin traducción → el nodo no se pinta y **no queda hueco, etiqueta ni
placeholder** (REND-05 / graceful degradation D-121).

### Superficie 1 — insertar entre `index.html:606` y `:607`

```html
<!--
  Phase 46 (REND-01/02/05, D-46-06/07/09) — Traducción española de la frase YA
  RESUELTA. Va bajo "Respuesta correcta:" y ANTES de la explanation: orden
  narrativo qué era → qué significa → por qué. NO va bajo el prompt italiano
  porque post-corrección el hueco se rellena con la opción SELECCIONADA
  (:537), no con la correcta. Doble guard (resuelto + dato presente) → sin
  traducción no hay nodo (D-121). `x-text` exclusivo (T-02-01). Aparece SIEMPRE
  al resolver, acertando o fallando, sin affordance propio (D-46-10).
-->
<p x-show="sessionFeedback !== null && sessionCurrentExercise.payload.translationES?.text"
   class="session-translation"
   x-text="sessionCurrentExercise.payload.translationES?.text"></p>
```

### Superficie 2 — insertar entre `index.html:1284` y `:1285`

```html
<!--
  Phase 46 (REND-04/05, D-46-08/09) — Misma anatomía y mismo criterio de estilo
  que en pantalla. Optional chaining defensivo espejo del de la explanation
  (:1294): el filter exterior ya excluye exerciseIds stale. `x-text` exclusivo.
-->
<p x-show="summaryVariantSurface(result)?.payload?.translationES?.text"
   class="summary-error-translation"
   x-text="summaryVariantSurface(result)?.payload?.translationES?.text"></p>
```

**En la superficie 2 el guard de «estado resuelto» es estructural, no una expresión:** la card solo
existe dentro del `x-for` de fallos del resumen, que por definición es post-resolución.

**Invariante no-leak (R1 / D-46-11):** ningún template puede pintar `translationES` sin un guard de
estado resuelto. En la superficie 1 el guard es `sessionFeedback !== null`; en la 2 es el
`x-for`/`x-if` del resumen. Un template nuevo añadido más adelante que lo olvide debe salir ROJO en la
suite (ver `## Verification Hooks`).

---

## Copywriting Contract

**Esta fase no añade ni cambia una sola cadena de interfaz.** Todo el copy visible es **dato de
contenido** (`translationES.text`, autorado y validado por quórum), no chrome.

| Element | Copy |
|---------|------|
| Primary CTA | **«Continuar →»** — literal hardcodeado existente (`index.html:632`), **sin cambios** (D-46-01). La traducción no añade CTA propio. |
| Affordance secundario | **«¿Por qué?»** — existente (`index.html:620`) + tecla `e`, **sin cambios** (D-46-10, REND-03). Sigue revelando **solo** la `explanation`; la traducción **no** se esconde detrás de él. |
| Títulos de caja | **«¡Esatto!» / «Quasi…»** hardcodeados (`:599-600`), **sin cambios** |
| Label de la traducción | **NINGUNO.** Sin «Traducción:», sin «Significa:», sin comillas latinas envolventes (descartado en D-46-07). |
| Empty state | **NINGUNO por diseño.** Un `multiple-choice` sin `translationES` no pinta nodo: sin hueco, sin etiqueta, sin placeholder, sin «—», sin «Sin traducción» (REND-05, D-121). El estado vacío correcto es **la ausencia total**. |
| Error state (runtime) | **NINGUNO.** No hay fetch, ni async, ni fallo posible en runtime: el contenido es JSON estático ya cargado. Un campo malformado se caza **antes**, en `src/data/schema-validator.js`, en la consola del autor — nunca en pantalla. |
| Destructive actions | **NINGUNA** en esta fase. Sin borrado, sin reset de progreso, sin migración de state (`schemaVersion` sigue en 13, SCH-03). Nada que confirmar. |

### Copy author-facing (mensajes del validador — SCH-01/SCH-02/SCH-03)

No es UI de pantalla, pero **es copy que un humano lee** y debe seguir el estilo vigente del validador
(español, ruta de campo entre comillas dobles, regla en indicativo — ver
`src/data/schema-validator.js:419`):

| Caso | Mensaje |
|------|---------|
| `translationES` presente pero `text` no es string no vacío | `"translationES.text" debe ser string no vacío si translationES está presente` |
| `translationES.text` contiene `___` | `"translationES.text" no puede contener "___" — la traducción es de la frase YA RESUELTA` |
| `translationES` en `match` / `word-buttons` | `"translationES" no está permitido en variantes de tipo "match" / "word-buttons"` |

---

## UI Considerations

**Probe:** `ui-consideration-probe.cjs`, ejecutado TRAS la aprobación del checker (2026-08-13).
**Cobertura: 14 aplicables · 14 resueltas · 0 sin resolver — 12 `explicit`, 2 `backstop`.**

Elementos y sus *kinds* (**override autorado**: el cue-match heurístico del motor detectó solo
`overflow`+`long-text` en E1 y omitió `long-text` en E2; la unión detected+missed se autoró a mano en
el paso propose-then-confirm, porque `autoResolve` es un suelo de RESOLUCIÓN y no puede recuperar un
kind que nunca se propuso):

| Elemento | Superficie | Kinds |
|---|---|---|
| **E1** | `.session-translation` dentro de `.session-feedback` (pantalla de ejercicio) | `static-content`, `media` |
| **E2** | `.summary-error-translation` dentro del `x-for` de «Errores cometidos» | `list-collection`, `static-content` |

### Resueltas — `explicit` (el planner las lifta a `must_haves.truths` como string plano)

1. **E1 · empty** — Variante `multiple-choice` SIN `translationES`: el doble guard `x-show` (`sessionFeedback !== null && payload.translationES?.text`) no pinta el nodo, y la caja `.session-feedback` conserva su anatomía previa exacta — sin hueco, sin etiqueta, sin placeholder, sin «—» (REND-05 / D-121).
2. **E1 · loading** — No existe estado de carga: el JSON de contenido ya está en memoria antes de que la caja de feedback pueda existir. El diff de la fase no introduce `fetch`, `await`, skeleton ni spinner en `index.html`.
3. **E1 · error** — Cero superficie de error en pantalla. Un `translationES` malformado no llega a runtime: lo rechaza `src/data/schema-validator.js` con los tres mensajes de `## Copywriting Contract`, y hay un test por cada uno de los tres casos (`text` no-string-no-vacío, `text` con `___`, campo presente en `match`/`word-buttons`).
4. **E1 · populated** — Traducción presente: párrafo `.session-translation` en `--ed-font-serif` 16px/400/1.5 `var(--ed-ink)` con `margin: 8px 0 0`, situado en el DOM ENTRE `.session-feedback-correct` y `.session-explanation` (aserciones V1 y V6 de `## Verification Hooks`).
5. **E1 · overflow** — Sin recorte posible: la regla CSS nueva no declara `height`, `max-height`, `overflow` ni `text-overflow`, y `.session-feedback` (`padding: 14px 16px`, sin altura fijada) queda sin cambios, así que crece con su contenido.
6. **E2 · empty** — Variante fallada SIN `translationES`: el guard con optional chaining (`summaryVariantSurface(result)?.payload?.translationES?.text`) no pinta el nodo y la card muestra prompt → tu respuesta → respuesta correcta → `explanation`, idéntica a hoy.
7. **E2 · loading** — No aplica por la misma razón que en E1: el resumen se construye sobre resultados ya en memoria. La fase no añade ninguna frontera de carga a la card de error.
8. **E2 · error** — Cero superficie de error: los mismos tres rechazos del schema-validator, en la consola del autor y nunca en pantalla. El optional chaining defensivo del guard impide un throw si `summaryVariantSurface` devolviera `undefined`.
9. **E2 · populated** — Misma anatomía y mismo criterio de estilo que en pantalla: `.summary-error-translation` comparte el bloque CSS con `.session-translation` (declarado UNA sola vez, aserción V2) y va ENTRE la respuesta correcta y `.summary-error-explanation`, cuyo muted+itálica (`app.css:1982-1985`) produce el mismo contraste serif/comentario.
10. **E2 · partial** — Slot con varias variantes donde solo algunas están traducidas: el campo vive POR VARIANTE (D-46-02) y `summaryVariantSurface` resuelve por `variantIndex`, no por slot, así que la variante traducida pinta su traducción y su hermana sin traducir no pinta nada; ninguna hereda de la otra. Test: slot de 2 variantes, una con `translationES` y otra sin, assertando que solo la fallada-con-traducción pinta el nodo.
11. **E2 · overflow** — El `li` de `.summary-errors` no tiene alto fijo ni scroll interno y crece con su contenido; la regla nueva no añade `height`, `max-height` ni `overflow`. Una línea más no puede recortar nada.
12. **E2 · zero-one-many** — Con 0 fallos la `<section class="summary-errors">` entera no se renderiza (`x-if` en `index.html:1259`), así que no hay estado vacío propio que diseñar. Con 1 o N fallos la traducción vive DENTRO del `li` que el `x-for` ya repite, y cada card lleva la de la variante EXACTA fallada. Ningún copy singular/plural nuevo: el contador de la cabecera ya existe.

### Resueltas — `backstop` (el planner las lifta como `{ statement, verification: backstop }`)

- **E1 · long-text** — `statement`: la traducción de 2+ líneas dentro de `.session-feedback` fluye por espacios con `line-height: 1.5` y ancho heredado de la caja, sin `overflow-wrap`, sin `max-width` y sin truncado. `verification: backstop` — inspección visual del autor sobre la traducción **más larga del piloto** (derivada del disco, no elegida a ojo), confirmando que envuelve dentro de la caja sin desbordar ni empujar el CTA fuera de vista.
- **E2 · long-text** — `statement`: la misma envoltura multilínea dentro de la card de «Errores cometidos». `verification: backstop` — la misma inspección visual del autor, comprobada también en esta segunda superficie.

<!-- Formato de lift (regla ## UI Considerations de plan-phase): resolved/explicit → truth string;
     resolved/backstop → { statement, verification: backstop } con clave escalar PLANA (nunca objeto
     anidado, ADR-550 #1278); unresolved → assumption explícita del planner. Una backstop que el
     verificador no pueda confirmar con evidencia se abstiene → human_needed, nunca pasa en silencio.
     Esta sección se REEMPLAZA en cada re-run del probe, jamás se concatena. El copy de los estados
     vacío/error vive en ## Copywriting Contract; aquí se referencia, no se repite. -->

---

## Verification Hooks

Qué debe assertear la suite sobre **este contrato** (para el planner; patrón `tests/screen-*.test.js`,
que ya leen `index.html` y `app.css` como texto — ver `tests/screen-session-editorial.test.js:19-28`):

| # | Aserción | Ancla |
|---|----------|-------|
| V1 | `app.css` declara el bloque compartido `.session-translation, .summary-error-translation` con `--ed-font-serif`, `16px`, `400`, `1.5`, `var(--ed-ink)`, `margin: 8px 0 0` | contrato §CSS |
| V2 | El bloque se declara **una sola vez** (`match` global de `.session-translation` en `app.css` = 1) | D-46-08, un solo criterio |
| V3 | `app.css` **no** gana tokens nuevos: el recuento de `--ed-*` definidos en `:root` es idéntico al de `main` | «cero tokens nuevos» |
| V4 | Los dos nodos usan `x-text` y **ningún** `x-html` en el diff de `index.html` | T-02-01 |
| V5 | **No-leak (D-46-11):** toda ocurrencia de `translationES` en `index.html` está en una línea/nodo con guard de estado resuelto (`sessionFeedback !== null`) o dentro del bloque del resumen | R1 |
| V6 | Orden DOM: en el sub-template `multiple-choice`, el índice de `session-translation` está **entre** el de `session-feedback-correct` y el de `session-explanation`; ídem en la card de error respecto a `summary-error-explanation` | D-46-06 / D-46-08 |
| V7 | `translationES` **no** aparece en los sub-templates `word-buttons` ni `match` de ninguna de las dos superficies | SCH-02 |
| V8 | **Motor byte-intacto:** `git diff` vacío en `src/domain/` y en `src/screens/app.js`; `SESSION_AUTO_ADVANCE_MS = 600` sin tocar | D-46-01 |
| V9 | `.session-prompt`, `.session-why`, `.session-cta` y sus literales («Continuar →», «¿Por qué?», «¡Esatto!», «Quasi…») sin cambios | D-46-01 / D-46-10 |

**Regla de la casa que aplica aquí:** un gate que congela una cifra debe derivarla del disco, nunca
transcribirla (D-31-06 / CR-01 de la Phase 44). V3 y V2 son recuentos **derivados**, no literales.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| — | **none** | **not applicable** — sin shadcn, sin `components.json`, sin registries de terceros, cero dependencias nuevas. Todo el CSS es hand-written sobre tokens `--ed-*` ya existentes. |

Gate de vetting de terceros: **no ejecutado porque no hay terceros declarados**. Si una fase futura
declarase uno, el gate se ejecuta antes de que el bloque entre en un UI-SPEC.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** APPROVED por `gsd-ui-checker` el 2026-08-13 — 6/6 dimensiones PASS, cero recomendaciones. Verificó contra disco las líneas citadas, los nombres de token, los selectores y los ratios de contraste. UI-consideration probe ejecutado después: 14/14 resueltas (12 explicit, 2 backstop).

---

*Phase: 46 — Pipeline de traducción end-to-end (piloto Preposiciones)*
*Contrato derivado de `46-CONTEXT.md` D-46-06 … D-46-10 (LOCKED) + lectura directa de
`index.html`, `app.css`, `styles.css`, `src/screens/app.js` y `content/exercises/preposiciones.json`
el 2026-08-13.*
