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
> regla CSS compartida** de tipografía para las dos superficies en scope, más **dos reglas de una sola
> propiedad** (`margin`) porque desde la enmienda del 2026-08-13 cada superficie ocupa una posición
> distinta. El criterio de estilo sigue siendo uno; lo que divergió es el sitio.
>
> Todas las decisiones de fondo están **LOCKED en `46-CONTEXT.md` (D-46-06 … D-46-10)**. Este documento
> las formaliza citando el código que YA existe; no las redecide.
>
> **Actualizado el 2026-08-13 tras la ENMIENDA de D-46-06 / D-46-07 / D-46-08.** El autor, viendo la app
> funcionando en el `checkpoint:human-verify` del plan 46-05, movió la traducción de la superficie 1
> **FUERA** de la caja `.session-feedback`, a justo encima del CTA de avance. La superficie 2 no cambia.
> Consecuencia formal: D-46-08 ya no significa «misma anatomía en las dos superficies» sino **«mismo
> CRITERIO DE ESTILO (serif), posición distinta porque el contexto es distinto»** — en el resumen no hay
> botón de avance, así que el hueco equivalente no existe. Este documento describe el diseño VIGENTE; el
> historial de qué se decidió antes y por qué vive en las enmiendas de `46-CONTEXT.md`.

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
| 1 | Pantalla de ejercicio: el hueco **entre** la caja `.session-feedback` (`index.html:592-621`) y el CTA de avance (`:655-658`) | `index.html:622-647` | **solo** `multiple-choice` (`x-if` en `:547`) | REND-01, REND-02, REND-03, REND-05 |
| 2 | Card de «Errores cometidos» del resumen | `index.html:1321-1323` | **solo** `multiple-choice` (`x-if` en `:1307`) | REND-04, REND-05 |

La superficie 1 sirve a los **tres modos de ejercicio** (repaso, test completo, examen/contrarreloj)
porque el template es único; no hay tres copias que sincronizar.

### Fuera de scope — NO se tocan

| Superficie | Por qué |
|------------|---------|
| `.session-feedback` de `word-buttons` (`index.html:707-736`) | SCH-02 RECHAZA `translationES` en `word-buttons` → nunca hay dato que pintar |
| `.session-feedback` de `match` (`index.html:868-882`) | SCH-02 RECHAZA `translationES` en `match` |
| `.summary-error-explanation` de `word-buttons` (`:1306`) y de `match` (`:1323`) | ídem |
| Pantalla de canciones (`.wb-*`, `song-*`) | sus frases YA son traducción validada; fuera del milestone |
| `.session-prompt` (`index.html:525-540`, `app.css:858-882`) | **byte-intacto** — ver la razón que sobrevive a la enmienda de D-46-06 |
| Botón «¿Por qué?» / tecla `e` (`:615-619`) | **byte-intacto** — D-46-10 |
| CTA «Continuar →» (`:655-658`) | **byte-intacto** — D-46-01. La enmienda de D-46-06 le inserta un **hermano anterior** (el nodo de traducción); el botón, su clase, su `x-show`, su `@click` y su label no cambian, y `.session-cta` sigue sin declarar `margin-top` (gate en V1) |
| `src/domain/`, `src/screens/app.js` | **byte-intacto** — D-46-01 / D-46-11 |

**Hallazgo verificado que sostiene el «byte-intacto»:** los dos getters que alimentan las dos
superficies construyen el payload con **spread de la variante completa** —
`payload: { ...surface, explanation: slot.explanation }` (`src/screens/app.js:2703` para
`sessionCurrentExercise`, `:2742` para `summaryVariantSurface`). Por tanto `translationES` **fluye
sola** a los dos templates sin una línea de JS nueva. El render de esta fase es HTML + CSS puro.

---

## Anatomía (LOCKED — D-46-06 / D-46-08, **ambas ENMENDADAS el 2026-08-13**)

### Superficie 1 — FUERA de la caja, en sitio fijo justo encima del CTA

```
┌─ ¡Esatto!  /  Quasi… ─────────────────────┐   .session-feedback-title   serif 17/600, color de estado
│  Respuesta correcta: **di**                │   .session-feedback-correct sans  13/400, --ed-red-text   (solo al FALLAR)
│  La preposición Di indica origen estable…  │   .session-explanation      sans  13/400, --ed-muted
│  [ ¿Por qué? ]                             │   .session-why                                            (solo al ACERTAR)
└────────────────────────────────────────────┘
   Paolo es de Nápoles de nacimiento.           .session-translation      serif 16/400, --ed-ink        ◀── NUEVO, fuera de la caja
   [ Continuar → ]                              .session-cta                                              (ya existe, sin cambios)
```

**Orden DOM obligatorio (invariante VIGENTE):** el nodo de traducción **NO** está dentro del bloque
`.session-feedback`, y **sí** aparece antes del `.session-cta` en el orden del documento — de hecho es
su hermano inmediatamente anterior (entre los dos no hay más que el comentario). Ese es el sitio FIJO
que pidió el autor: no cambia entre acierto y fallo, y siempre queda justo antes del gesto de avanzar.

**Por qué no dentro de la caja (razón de uso, medida con la app delante):** al acertar la caja tiene una
línea y al fallar está tintada y densa, así que dentro de ella la traducción cambiaba de sitio visual
entre los dos casos y en el de fallo se camuflaba en el recuadro de error.

**Por qué sigue sin ir bajo el prompt italiano (razón que NO ha caducado):** post-corrección el hueco del
prompt se rellena con la opción SELECCIONADA, no con la correcta (`index.html:537`), así que al fallar la
traducción de la frase CORRECTA quedaría pegada a una frase italiana que no le corresponde. El autor
descartó ese sitio explícitamente por este motivo.

**Lo que el sitio nuevo NO relaja:** el doble guard sigue exigiendo `sessionFeedback !== null`. «Verla
siempre» es siempre en el mismo SITIO, nunca antes de responder (R1 / D-46-11).

### Superficie 2 — card de «Errores cometidos» (mismo criterio de estilo, posición distinta)

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
inmediatamente anterior a `.summary-error-explanation`. **Esta superficie NO cambia con la enmienda del
2026-08-13**, y la divergencia respecto a la superficie 1 es deliberada: en el resumen **no hay CTA de
avance**, así que el hueco «justo encima del botón» no existe; y sacar la traducción de la card la
desligaría del error que comenta, porque la card ES su contenedor semántico. Lo que las dos superficies
comparten es el **criterio de estilo** (serif 16/400 ink, una sola declaración CSS), no la posición.

---

## Spacing Scale

Escala del proyecto (4px, ya vigente; **no se amplía**):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | gaps inline, `gap` del `li` de errores (`styles.css:409`) |
| sm | **8px** | separación vertical entre líneas **dentro** de una caja/card — es el valor que usa la traducción de la **superficie 2** |
| md | **16px** | `margin-top` de `.session-feedback`, padding horizontal de caja/card — y, desde la enmienda del 2026-08-13, el margen **vertical** (arriba y abajo) de la traducción de la **superficie 1**, que ya no vive dentro de ninguna caja |
| lg | 24px | prompt → opciones |
| xl | 32px | gaps de layout |
| 2xl | 48px | padding inferior de `main` |
| 3xl | 64px | espaciado de página |

**Lo que esta fase declara:** `margin: 16px 0` (md) en `.session-translation` y `margin: 8px 0 0` (sm) en
`.summary-error-translation`. **Cero** cambios de padding, gap, o margen en cualquier regla existente.

**Espaciado de la superficie 1 — MEDIDO, no asumido.** Instrumentado en Chrome headless sobre el CSS real
(`styles.css` + `app.css`, fuentes de `vendor/fonts/`) con la ancestría DOM real
`main > article.session > div > [.session-options, .session-feedback.wrong, p.session-translation, button.session-cta]`:

| Margen probado | hueco caja→traducción | hueco traducción→CTA |
|---|---|---|
| `8px 0 0` (el sm de la redacción anterior) | 8 px | **0 px** |
| `16px 0` (**el vigente**) | 16 px | **16 px** |

El hueco inferior importa porque **`.session-cta` no declara `margin-top` ninguno** (`app.css:907-923`):
dentro de la caja ese aire lo daba el `padding: 14px 16px` de `.session-feedback`, y fuera de ella no hay
nadie que lo dé. Sin margen inferior la frase queda literalmente pegada al botón. El **16px = md** es el
mismo valor con el que `.session-feedback` se separa de las opciones (`app.css:933`), así que las tres
separaciones de bloque de la pantalla quedan en la misma unidad de la escala.

**Colapso de márgenes (verificado, no asumido):**
- Superficie 1: ya **no hay colapso contra la `explanation`** — la traducción es hermana de la caja, no
  hija. Los márgenes contra `.session-feedback` (que trae `padding`, no `margin-bottom`) y contra
  `.session-cta` (sin margen) no colapsan con nada: los 16 px de arriba y los 16 px de abajo son los
  huecos reales medidos en la tabla.
- Superficie 2: sin cambios. La traducción vive dentro del `<div>` del `x-if`, **no** es flex item del `li`
  (`display:flex; gap:.25rem` está en el `li`, `styles.css:407-409`) → colapso normal de bloques,
  **8px** contra `.summary-error-explanation` (que trae `margin-top: 0.5rem` de `styles.css:458`).

Exceptions: **none**. Ningún valor off-grid nuevo — los dos márgenes son múltiplos de 4 y ambos son tokens
ya vigentes de la escala (sm y md).

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
propio** — la traducción hereda el ancho de su contenedor: desde la enmienda del 2026-08-13 ese contenedor
es el `<div>` del `x-if` y no la caja, así que la línea disponible **crece** (medido a viewport 1400:
1062 px dentro de la caja → 1096 px fuera, porque ya no paga el `padding: 14px 16px`). Un cambio que
ensancha no puede introducir un recorte que antes no existía.

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

**Contraste verificado sobre los fondos donde puede aparecer** (`#2b2722` sobre):

| Fondo | Hex | Ratio | WCAG |
|-------|-----|-------|------|
| `--ed-paper` (**el fondo NUEVO** — `article` / `body`, `app.css:282` y `:256`, donde la traducción cae desde la enmienda del 2026-08-13) | `#f4f0e8` | **13.05:1** | AAA |
| `--ed-green-tint` (caja de acierto) | `#e8f1ea` | **12.85:1** | AAA |
| `--ed-red-tint` (caja de fallo) | `#f6e9e6` | **12.51:1** | AAA |
| `--ed-paper-elevated` (card de error) | `#fbf8f1` | **13.98:1** | AAA |

Los cuatro ratios se recalcularon el 2026-08-13 con la fórmula de luminancia relativa de WCAG 2.x sobre los
hex del `:root`. **Las dos filas de los tintes eran optimistas por una décima** en la redacción anterior
(12.8 → 12.85 y 13.1 → **12.51**); se corrigen aquí en vez de dejar el número bonito, porque un registro
que redondea a su favor es el mismo defecto que CR-01 de la Phase 44. Ninguna corrección cambia el
veredicto: las cuatro superan AAA con enorme margen, y el fondo nuevo no es el peor de los cuatro.

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

**El CRITERIO TIPOGRÁFICO se declara UNA sola vez**, con selector doble, replicando literalmente el
precedente `styles.css:453-460` (`.session-explanation, .summary-error-explanation` compartían un bloque
«porque ambas son visualmente idénticas; el diferenciador es solo el nombre de clase para permitir
customización independiente futura»). Eso es lo que pide D-46-08 tras su enmienda: **un solo criterio de
estilo, no una sola posición**. El **margen** sí se declara por superficie, porque desde la enmienda de
D-46-06 el contexto de cada una es distinto.

```css
/* Traducción española de la frase ya resuelta (Phase 46 · REND-01/04, D-46-07).
 * Texto de FRASE, no comentario: serif como el prompt italiano (.session-prompt,
 * app.css:858), frente a la explanation que es sans muted porque comenta.
 * Sin etiqueta y sin comillas envolventes (D-46-07). Ink neutro en acierto y en
 * fallo: la traducción no es un veredicto. Selector compartido por las dos
 * superficies (precedente styles.css:453) — UN SOLO CRITERIO DE ESTILO, que es
 * lo que exige D-46-08. El MARGEN sale de aquí y se declara por superficie más
 * abajo: desde la enmienda de D-46-06 (2026-08-13) las dos posiciones son
 * distintas porque el contexto es distinto. Cero tokens nuevos. */
.session-translation,
.summary-error-translation {
  font-family: var(--ed-font-serif);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--ed-ink);
}

/* Margen de la superficie 1 — la traducción vive FUERA de la caja tintada, entre
 * ella y el CTA "Continuar →" (D-46-06 enmendada el 2026-08-13, a petición del
 * autor). Necesita aire de bloque por ARRIBA y por ABAJO: `.session-cta` no
 * declara `margin-top` ninguno (app.css:907-923), así que sin el margen inferior
 * la frase queda literalmente pegada al botón — medido en Chrome headless sobre
 * el CSS real, hueco traducción→CTA = 0 px. 16px = md, exactamente el valor con
 * el que `.session-feedback` se separa de las opciones (app.css:933): las tres
 * separaciones de bloque de la pantalla quedan en la misma unidad de la escala. */
.session-translation {
  margin: 16px 0;                  /* md arriba y abajo */
}

/* Margen de la superficie 2 — en «Errores cometidos» la traducción sigue DENTRO
 * de la card, antes de la explanation, así que conserva el sm de siempre: 8px que
 * colapsan contra el margin-top de `.summary-error-explanation`. */
.summary-error-translation {
  margin: 8px 0 0;                 /* sm */
}
```

**Ubicación (discreción ejercida):** en `app.css`, inmediatamente **después** de `.session-explanation`
(hoy `app.css:970-977`), es decir al final del banner *«Caja de feedback (scaffold para 33-02/03/04,
D-09)»*, con las tres reglas consecutivas (`app.css:988-1014`). Razones: (a) mantiene juntas las reglas
que el lector compara; (b) queda dentro del banner que documenta la caja, que es donde un lector busca
el bloque de feedback y su vecindad; (c) en la sección de Resultados (`app.css:1959-1985`) se deja **solo
un comentario de referencia cruzada**, sin regla tipográfica, para que nadie duplique el criterio.

**Especificidad — verificado, no asumido:** ambas clases son **nombres nuevos**; `styles.css` no tiene
ninguna regla para ellas, así que un selector de clase simple en `app.css` (que carga después) basta.
**No** hace falta subir especificidad a `.summary-errors .summary-error-translation` — eso era
necesario para `.summary-error-explanation` porque tenía que vencer a la regla legacy de
`styles.css:454`. **No usar `!important` en ningún caso.**

**Prohibido en esta fase:** tokens `--ed-*` nuevos, hex literales, `@media`, `:empty`, `overflow-wrap`,
`height` / `max-height` / `overflow` / `text-overflow` / `max-width` / `text-wrap`, `!important`, valores
de espaciado fuera de la escala de 4px, cambiar cualquier regla existente de `app.css` / `styles.css`, y
tocar `.session-prompt`. **Lo único que la enmienda del 2026-08-13 añade es el reparto del margen en dos
reglas de una sola propiedad**: las reglas de margen por superficie no pueden declarar nada tipográfico
—si lo hicieran habría dos criterios de estilo y D-46-08 quedaría roto— y el criterio compartido no puede
volver a declarar margen. Las dos mitades de esa frontera tienen gate en V1 y V2.

---

## DOM Contract

`x-text` **exclusivo**, jamás `x-html` (T-02-01). **Doble guard** `x-show`: estado resuelto **Y**
presencia del dato (D-46-09). Sin traducción → el nodo no se pinta y **no queda hueco, etiqueta ni
placeholder** (REND-05 / graceful degradation D-121).

### Superficie 1 — el nodo va ENTRE el `</div>` de `.session-feedback` (`index.html:621`) y el CTA (`:655`)

Punto de inserción **fuera** de la caja: hermano posterior de `.session-feedback` y hermano
**inmediatamente anterior** de `.session-cta`, dentro del `<div>` del `x-if` de `multiple-choice`. Entre la
traducción y el botón no puede haber más markup que el comentario (gate en V6).

```html
<!--
  Phase 46 (REND-01/02/05, D-46-06 ENMENDADA el 2026-08-13, D-46-07/09)
  — Traducción española de la frase YA RESUELTA. Vive FUERA de la caja
  `.session-feedback`, entre ella y el CTA inferior primario de avance:
  un sitio FIJO que no cambia al acertar ni al fallar. Lo eligió el
  autor viendo la app en el checkpoint del plan 46-05 ("dentro del
  cuadro del error se me hace difícil verla; fuera se ve claro").

  Sigue sin ir bajo el prompt italiano, y esa razón NO ha caducado:
  post-corrección el hueco del prompt se rellena con la opción que el
  usuario SELECCIONÓ (:537, `options?.[sessionSelectedIndex]`), no con
  la correcta, así que al fallar la traducción de la frase CORRECTA
  quedaría pegada a una frase italiana que no le corresponde.

  Doble guard VERBATIM (resuelto + dato presente) → sin traducción no
  hay nodo, ni hueco ni placeholder (REND-05 / D-121). Que exija
  `sessionFeedback !== null` es el invariante de no-leak R1 / D-46-11:
  "verla siempre" es siempre en el MISMO SITIO, nunca antes de
  responder. El dato entra por `x-text` y nunca por inyección de HTML
  crudo (T-02-01). Sin affordance propio: no se esconde detrás del
  botón que revela la explanation bajo demanda (D-46-10).
-->
<p x-show="sessionFeedback !== null && sessionCurrentExercise.payload.translationES?.text"
   class="session-translation"
   x-text="sessionCurrentExercise.payload.translationES?.text"></p>
```

**Nota sobre el copy del comentario, aprendida en carne propia:** el comentario **no puede** contener los
literales `Continuar →`, `¿Por qué?` ni el nombre de la directiva de inyección de HTML crudo. V4 y V9
cuentan esas cadenas sobre TODO `index.html`, comentarios incluidos, y comparan contra el estado pre-fase:
una redacción que las mencione pone los gates rojos. Pasó en la primera redacción de este cambio (V4:
9→10, V9: 2→3 «Continuar →») y los dos gates lo cazaron. Mismo patrón que la deuda #14 del ledger de
Phase 44: un comentario que menciona el token que su propio gate cuenta.

### Superficie 2 — sin cambios, el nodo sigue dentro de la card (`index.html:1321-1323`)

```html
<!--
  Phase 46 (REND-04/05, D-46-08 enmendada el 2026-08-13, D-46-09) — MISMO
  CRITERIO DE ESTILO que en pantalla (serif ink, regla CSS compartida), en
  POSICIÓN distinta: aquí la traducción se queda DENTRO de la card, tras
  "Respuesta correcta:" y antes de la explanation, porque en el resumen no
  hay CTA de avance y por tanto no existe el hueco que ocupa en pantalla.
  La card es su contenedor semántico: pertenece al error que comenta.
  Optional chaining defensivo espejo del de la explanation de abajo: el
  filter exterior ya excluye exerciseIds stale. `x-text` exclusivo.
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
| Primary CTA | **«Continuar →»** — literal hardcodeado existente (`index.html:658`), **sin cambios** (D-46-01). La traducción no añade CTA propio; solo se sitúa justo encima de este botón. **El literal no puede repetirse en ningún comentario nuevo**: V9 cuenta sus ocurrencias en todo el fichero y las compara con el estado pre-fase. |
| Affordance secundario | **«¿Por qué?»** — existente (`index.html:620`) + tecla `e`, **sin cambios** (D-46-10, REND-03). Sigue revelando **solo** la `explanation`, y ahora la revela **dentro** de la caja mientras la traducción vive fuera, así que el toggle no puede moverla ni ocultarla. Mismo aviso de recuento que el CTA: el literal no se repite en comentarios. |
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
| **E1** | `.session-translation` entre `.session-feedback` y el CTA de avance (pantalla de ejercicio) | `static-content`, `media` |
| **E2** | `.summary-error-translation` dentro del `x-for` de «Errores cometidos» | `list-collection`, `static-content` |

### Resueltas — `explicit` (el planner las lifta a `must_haves.truths` como string plano)

1. **E1 · empty** — Variante `multiple-choice` SIN `translationES`: el doble guard `x-show` (`sessionFeedback !== null && payload.translationES?.text`) no pinta el nodo, y la pantalla conserva su anatomía previa exacta — la caja `.session-feedback` queda pegada al CTA igual que antes de esta fase, sin hueco, sin etiqueta, sin placeholder, sin «—» (REND-05 / D-121). Que el margen de la traducción sea `16px 0` no deja hueco fantasma: un nodo con `x-show` falso no existe en el layout, así que no aporta ni margen ni caja.
2. **E1 · loading** — No existe estado de carga: el JSON de contenido ya está en memoria antes de que la caja de feedback pueda existir. El diff de la fase no introduce `fetch`, `await`, skeleton ni spinner en `index.html`.
3. **E1 · error** — Cero superficie de error en pantalla. Un `translationES` malformado no llega a runtime: lo rechaza `src/data/schema-validator.js` con los tres mensajes de `## Copywriting Contract`, y hay un test por cada uno de los tres casos (`text` no-string-no-vacío, `text` con `___`, campo presente en `match`/`word-buttons`).
4. **E1 · populated** — Traducción presente: párrafo `.session-translation` en `--ed-font-serif` 16px/400/1.5 `var(--ed-ink)` con `margin: 16px 0`, situado en el DOM **FUERA** de `.session-feedback` y como hermano inmediatamente anterior de `.session-cta` (aserciones V1 y V6 de `## Verification Hooks`; el sitio es el mismo acertando y fallando).
5. **E1 · overflow** — Sin recorte posible: ninguna de las tres reglas CSS declara `height`, `max-height`, `overflow` ni `text-overflow` (V1 lo assertea sobre las tres, comparando nombres de propiedad y no substrings), y el contenedor del `x-if` no fija altura, así que crece con su contenido. La traducción ya no está dentro de `.session-feedback`, que sigue sin cambios (`padding: 14px 16px`, sin altura fijada).
6. **E2 · empty** — Variante fallada SIN `translationES`: el guard con optional chaining (`summaryVariantSurface(result)?.payload?.translationES?.text`) no pinta el nodo y la card muestra prompt → tu respuesta → respuesta correcta → `explanation`, idéntica a hoy.
7. **E2 · loading** — No aplica por la misma razón que en E1: el resumen se construye sobre resultados ya en memoria. La fase no añade ninguna frontera de carga a la card de error.
8. **E2 · error** — Cero superficie de error: los mismos tres rechazos del schema-validator, en la consola del autor y nunca en pantalla. El optional chaining defensivo del guard impide un throw si `summaryVariantSurface` devolviera `undefined`.
9. **E2 · populated** — Mismo **criterio de estilo** que en pantalla, en posición propia: `.summary-error-translation` comparte con `.session-translation` el bloque CSS de tipografía (declarado UNA sola vez, aserción V2) y solo divergen en el margen; va ENTRE la respuesta correcta y `.summary-error-explanation`, cuyo muted+itálica (`app.css:1982-1985`) produce el mismo contraste serif/comentario. **Esta superficie no cambió con la enmienda del 2026-08-13.**
10. **E2 · partial** — Slot con varias variantes donde solo algunas están traducidas: el campo vive POR VARIANTE (D-46-02) y `summaryVariantSurface` resuelve por `variantIndex`, no por slot, así que la variante traducida pinta su traducción y su hermana sin traducir no pinta nada; ninguna hereda de la otra. Test: slot de 2 variantes, una con `translationES` y otra sin, assertando que solo la fallada-con-traducción pinta el nodo.
11. **E2 · overflow** — El `li` de `.summary-errors` no tiene alto fijo ni scroll interno y crece con su contenido; la regla nueva no añade `height`, `max-height` ni `overflow`. Una línea más no puede recortar nada.
12. **E2 · zero-one-many** — Con 0 fallos la `<section class="summary-errors">` entera no se renderiza (`x-if` en `index.html:1259`), así que no hay estado vacío propio que diseñar. Con 1 o N fallos la traducción vive DENTRO del `li` que el `x-for` ya repite, y cada card lleva la de la variante EXACTA fallada. Ningún copy singular/plural nuevo: el contador de la cabecera ya existe.

### Resueltas — `backstop` (el planner las lifta como `{ statement, verification: backstop }`)

- **E1 · long-text** — `statement` **(redactado de nuevo el 2026-08-13 tras la enmienda de D-46-06; sigue ABSTENIDO)**: la traducción de 2+ líneas, ahora **fuera** de `.session-feedback` y entre la caja y el CTA, fluye por espacios con `line-height: 1.5` y ancho heredado del contenedor del `x-if`, sin `overflow-wrap`, sin `max-width` y sin truncado; al crecer empuja el CTA hacia abajo en flujo normal, conservando sus 16 px de aire por arriba y por abajo. `verification: backstop` — inspección visual del autor sobre la traducción **más larga del piloto** (derivada del disco, no elegida a ojo), confirmando que envuelve sin desbordar ni pegarse al recuadro ni al botón.
  **Estado: ABSTENIDO, no cerrado.** Lo abstuvo el autor el 2026-08-13 por **ausencia de sujeto**: la traducción más larga del piloto (`preposiciones-sugli#1`, 57 caracteres = 390 px medidos) cabe en **UNA** línea a todos los anchos de escritorio, así que la premisa «2+ líneas» no tiene sujeto en este corpus. **El cambio de sitio NO revierte esa abstención** — mueve el nodo, no alarga el contenido —, y el ítem se arrastra a las Phases 47-53, donde habrá frases más largas. Ver `46-05-MUTACIONES-EVIDENCIA.md` §Hallazgo 2.
- **E2 · long-text** — `statement`: la misma envoltura multilínea dentro de la card de «Errores cometidos», que **no cambia** con la enmienda del 2026-08-13. `verification: backstop` — la misma inspección visual del autor, comprobada también en esta segunda superficie. **Estado: ABSTENIDO** por la misma ausencia de sujeto, y arrastrado a las Phases 47-53.

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
| V1 | `app.css` declara el bloque compartido `.session-translation, .summary-error-translation` con `--ed-font-serif`, `16px`, `400`, `1.5`, `var(--ed-ink)` y **sin margen**; cada superficie declara SU margen, y el de pantalla supera al del resumen por arriba (comparación derivada entre las dos, no un literal suelto) y es `> 0` por abajo. Más el ancla de la medición: `.session-cta` sigue sin declarar `margin-top` | contrato §CSS + enmienda D-46-06 |
| V2 | **Un solo CRITERIO DE ESTILO:** exactamente UNA regla de traducción declara tipografía y es la del selector doble; las demás declaran **solo** `margin`; cada superficie tiene una única regla de margen propia (todo derivado del parseo, no de recuentos transcritos) | D-46-08 enmendada |
| V3 | `app.css` **no** gana tokens nuevos: el recuento de `--ed-*` definidos en `:root` es idéntico al de `main` | «cero tokens nuevos» |
| V4 | Los dos nodos usan `x-text` y **ningún** `x-html` en el diff de `index.html` | T-02-01 |
| V5 | **No-leak (D-46-11):** toda ocurrencia de `translationES` en `index.html` está en una línea/nodo con guard de estado resuelto (`sessionFeedback !== null`) o dentro del bloque del resumen | R1 |
| V6 | Posición DOM **(reescrita el 2026-08-13 al invariante nuevo)**: en el sub-template `multiple-choice` el nodo `session-translation` **NO** está dentro del bloque `.session-feedback` —acotado contando anidamiento de `<div>`, con control positivo de que la región es la caja de verdad—, **sí** va antes del `session-cta` en el orden del documento, y entre los dos no se cuela más markup que el comentario. En la card de error, orden intacto respecto a `summary-error-explanation` y a «Respuesta correcta:» | D-46-06 enmendada / D-46-08 enmendada |
| V7 | `translationES` **no** aparece en los sub-templates `word-buttons` ni `match` de ninguna de las dos superficies | SCH-02 |
| V8 | **Motor byte-intacto:** `git diff` vacío en `src/domain/` y en `src/screens/app.js`; `SESSION_AUTO_ADVANCE_MS = 600` sin tocar | D-46-01 |
| V9 | `.session-prompt`, `.session-why`, `.session-cta` y sus literales («Continuar →», «¿Por qué?», «¡Esatto!», «Quasi…») sin cambios | D-46-01 / D-46-10 |

**Regla de la casa que aplica aquí:** un gate que congela una cifra debe derivarla del disco, nunca
transcribirla (D-31-06 / CR-01 de la Phase 44). V3 y V2 son recuentos **derivados**, no literales.

**Y la otra regla de la casa: un gate reescrito se verifica por MUTACIÓN, no leyéndolo** (D-46-18). La V6
nueva y el no-leak se probaron el 2026-08-13 con las dos mutaciones que registra
`46-05-MUTACIONES-EVIDENCIA.md`: **M-A** devolver el nodo a dentro de `.session-feedback` → V6 en ROJO
(exit 1, 3 subtests) y **M-B** quitar el guard `sessionFeedback !== null` → V5 en ROJO (exit 1, 2
subtests). Restauración por copia de fichero con md5 idéntico y suite 50/50 en verde después.

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

**Alcance del sign-off tras la enmienda del 2026-08-13.** El checker aprobó el contrato con la traducción
DENTRO de la caja. La enmienda cambia **Spacing** (dos márgenes en vez de uno) y **Visuals** (posición del
nodo); **no** toca Copywriting (cero cadenas nuevas), Color (mismo `--ed-ink` sobre `--ed-paper`, ratio aún
mejor que sobre los tintes: ≈ 13.6:1), Typography (las cinco declaraciones intactas) ni Registry Safety
(sin terceros). Las dos dimensiones afectadas se re-verificaron **por medición** (tabla de §Spacing Scale,
Chrome headless sobre el CSS real) y **por gate** (V1/V2/V6 reescritas y mutadas). El fondo nuevo bajo la
traducción está en la tabla de contraste de §Color, calculado igual que los otros tres. No se reclama un
sign-off nuevo del checker: se declara qué cambió, qué evidencia lo sostiene y qué queda para el ojo del
autor en el checkpoint abierto del plan 46-05.

---

*Phase: 46 — Pipeline de traducción end-to-end (piloto Preposiciones)*
*Contrato derivado de `46-CONTEXT.md` D-46-06 … D-46-10 (LOCKED) + lectura directa de
`index.html`, `app.css`, `styles.css`, `src/screens/app.js` y `content/exercises/preposiciones.json`
el 2026-08-13.*
*Actualizado el 2026-08-13 tras la enmienda de D-46-06 / D-46-07 / D-46-08 (decisión del autor en el
`checkpoint:human-verify` del plan 46-05): la traducción de la superficie 1 sale de `.session-feedback` y
pasa a justo encima del CTA de avance. Superficie 2 sin cambios.*
