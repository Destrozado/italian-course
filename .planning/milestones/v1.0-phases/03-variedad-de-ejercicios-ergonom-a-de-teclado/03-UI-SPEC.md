---
phase: 3
slug: variedad-de-ejercicios-ergonom-a-de-teclado
status: approved
shadcn_initialized: false
preset: none
created: 2026-05-23
---

# Phase 3 — Contrato de Diseño UI

> Contrato visual e interactivo para Phase 3 (word-buttons + match + atajos de teclado). Generado por `gsd-ui-researcher`, verificado por `gsd-ui-checker`.
>
> **Idioma:** UI y copy en español (FOUND-04). Tokens/CSS vars/identificadores en inglés (heredados de Pico/styles.css).
> **Alcance:** los dos nuevos sub-templates `word-buttons` y `match` dentro del session screen + handlers de teclado globales. Home/picker/summary/banner inFlightTest se mantienen intactos.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (proyecto vanilla — Alpine.js + Pico CSS classless, sin build) |
| Preset | not applicable |
| Component library | Pico CSS 2.1.1 classless (sin componentes JS, solo CSS) |
| Icon library | none — glifos Unicode existentes (●/✓/★/⚠/→) + nuevos (¹²³⁴⁵⁶⁷⁸⁹ y ᵃᵇᶜᵈᵉᶠᵍʰⁱ) |
| Font | system stack heredado de Pico (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...`) |

**Nota:** la app no usa shadcn ni framework de componentes. La paleta es 100% CSS vars de Pico (`--pico-*`) con fallback hex en `styles.css`. Phase 3 NO introduce sistema nuevo — reusa las clases existentes (`button-row`, `correcta`/`incorrecta`, `badge-*`) y añade un mínimo de clases nuevas listadas abajo.

---

## Spacing Scale

Pico ya impone su propio espaciado (rem-based, múltiplos de 0.5rem ≈ 8px). Phase 3 declara estos múltiplos de 4px para los elementos nuevos (banco word-buttons, área respuesta, columnas match):

| Token | Value | Usage en Phase 3 |
|-------|-------|------------------|
| xs | 4px | Padding interno del sufijo `¹`/`ᵃ` respecto a la palabra (ej. `casa<sup>¹</sup>`) |
| sm | 8px | Gap entre botones contiguos del banco / entre items adyacentes en columna match |
| md | 16px | Padding interno del área-respuesta vacía; margen entre el banco y el área respuesta; gap entre las dos columnas de match |
| lg | 24px | Margen vertical entre el prompt y el banco / entre el área respuesta y el botón `Comprobar` |
| xl | 32px | Margen entre la sección del ejercicio y el botón secundario `← Volver al home` |

**Reglas:**
- **Reusar `.button-row`** (gap: 1rem ≈ 16px, ver `styles.css` líneas 86-97) para el row del botón `Comprobar` + botón `Siguiente` cuando convivan tras un fallo. NO `role="group"` (Pico une los bordes — lección recurrente UAT 02-03/02-04).
- **NO inventar variables CSS nuevas** para spacing. Si un componente necesita un valor específico, usar el px literal directo en el selector dedicado o un `style="..."` inline cuando sea un override puntual (mismo patrón que ya usan el banner inFlightTest y el confirm-inline).
- **Excepción aceptada:** el banco word-buttons puede usar `flex-wrap: wrap; gap: 8px` para que las palabras fluyan en varias líneas si la frase es larga (>6 tokens); coherente con el patrón "responsive básico desktop" de FOUND-03.

**Excepciones:** ninguna fuera del scope desktop v1.

---

## Typography

Pico classless ya define la jerarquía base. Phase 3 NO toca `<h1>`, `<h2>`, `<p>` defaults. Solo declara tamaños/pesos para los elementos NUEVOS (botones del banco, items de match, sufijos numérico/alfabético, frase correcta tras fallo).

| Role | Size | Weight | Line Height | Uso en Phase 3 |
|------|------|--------|-------------|----------------|
| Body | 16px (Pico default) | 400 | 1.5 (Pico default) | `payload.prompt` del ejercicio, frase correcta tras fallo |
| Label / Button | 16px (Pico default) | 400 | 1.5 (Pico default) | Texto de las palabras del banco y los items de match |
| Heading session | 1.25rem ≈ 20px (heredado del `<header x-text="sessionProgressLabel">` Phase 1) | 600 | 1.2 | Indicador `Ejercicio X / N` |
| Sufijo teclado | 0.75em (relativo al botón) | 600 | inherit | Superíndice Unicode `¹²³ᵃᵇᶜ` adosado a cada palabra/item (ver D-69/D-70) |

**Sufijos numérico/alfabético (resolución de Claude's discretion en CONTEXT.md):**
- **Estilo elegido: superíndice Unicode** (`¹²³⁴⁵⁶⁷⁸⁹` y `ᵃᵇᶜᵈᵉᶠᵍʰⁱ`) **dentro del mismo `<button>`**, separado por un espacio fino antes (`ho ¹`, `la ᵃ`).
- **Razón vs `<kbd>` tag:** `<kbd>` añade un borde/background propio en Pico que compite visualmente con el botón anfitrión y duplica el "control look". El superíndice Unicode se mezcla con el texto y deja el botón limpio. Además es text-only y se renderiza igual de fiable bajo dark mode automático.
- **Color del sufijo:** `var(--pico-muted-color, #6c757d)` aplicado con `<sup class="kbd-hint">¹</sup>` para reducir contraste respecto a la palabra principal. La palabra italiana sigue siendo lo prominente; la tecla es ayuda secundaria.
- **`aria-label`** sobre el botón completo (`aria-label="Palabra 1: ho"` / `aria-label="Letra a: la"`) — los lectores de pantalla NO leen sub/superíndice Unicode de forma consistente; el `aria-label` es la fuente accesible (a11y guard sobre D-69/D-70).
- **Cuando se desnumera:** si el banco word-buttons tiene >9 palabras visibles, las posiciones 10..N se renderizan SIN sufijo (no son alcanzables por número). Esto es coherente con D-69 (cap 1-9 dinámico). Warning soft del schema validator (ver Claude's discretion en CONTEXT.md) queda como recomendación al planner — no es bloqueante.

**Estados de texto en feedback (heredados Phase 1/2 + extensión Phase 3):**
- `.correcta` (verde sólido, texto blanco) — palabra correctamente colocada al validar word-buttons / pareja match correcta.
- `.incorrecta` (rojo sólido, texto blanco) — área respuesta al fallar word-buttons / parpadeo de pareja match incorrecta.
- **Nueva clase `.match-consumed`** (definida abajo) — pareja correcta ya fijada, items "apagados".

---

## Color

Pico classless + dark mode auto via `prefers-color-scheme` (heredado). Phase 3 NO añade ninguna CSS var nueva. Reusa **exactamente** las que ya viven en `styles.css`:

| Role | Value (CSS var con fallback) | Usage en Phase 3 |
|------|-----------------------------|------------------|
| Dominant (60%) — surface | `var(--pico-background-color)` (Pico auto light/dark) | Fondo del `<main>`, del `<article>` de la sesión, del área respuesta vacía word-buttons |
| Secondary (30%) — chrome | `var(--pico-card-background-color, #fff)` + `var(--pico-muted-border-color, #e0e0e0)` | Borde discreto alrededor del área respuesta vacía word-buttons; borde de los items match no-seleccionados |
| Accent (10%) — actions | Pico `<button>` default (azulado en light, claro en dark) | Botón `Comprobar` (primario), botón `Siguiente` (primario), botones del banco word-buttons NO colocados, items match seleccionables |
| Success (verde) | `var(--pico-color-green-500, #2e7d32)` + `--pico-color-green-600, #1b5e20` (border) | `.correcta` (palabra correctamente colocada / pareja match correcta fijada) — clase existente, reusada literal |
| Destructive / error (rojo) | `var(--pico-color-red-500, #d32f2f)` + `--pico-color-red-600, #b71c1c` (border) | `.incorrecta` (área respuesta al fallar word-buttons / parpadeo rojo en pareja match incorrecta) — clase existente, reusada literal |
| Muted (atenuado) | `var(--pico-muted-color, #6c757d)` | Sufijos teclado `¹²³ᵃᵇᶜ`, items match `.match-consumed` (apagados tras pareja correcta) |
| Border (frame) | `var(--pico-muted-border-color, #e0e0e0)` | Borde 1px del área respuesta vacía + del item izq seleccionado en match (variante outline) |

**Accent reservado para (lista explícita — no "todos los elementos interactivos"):**
- Botón primario `Comprobar` (siempre visible bajo el área respuesta word-buttons).
- Botón primario `Siguiente` (visible solo tras fallo, en los tres tipos — clase Pico default sin `.secondary`).
- Botones del banco word-buttons (estado idle clickable).
- Items match en estado idle clickable (estilo `<button>` Pico default).

**NO usa accent (color secundario o muted):**
- Botón `← Volver al home` → mantiene `.secondary` (gris Pico) heredado.
- Items match en estado `.match-consumed` → muted gris.
- Sufijos teclado → muted gris.

**Contraste WCAG 2.1 AA:**
- `.correcta` (verde sólido + texto blanco): contrast ratio ≥ 4.5:1 verificado (mismo color que badges Phase 2 con sign-off WCAG).
- `.incorrecta` (rojo sólido + texto blanco): ratio ≥ 4.5:1 verificado.
- `.match-consumed` (muted gris sobre fondo card): ratio mínimo 3:1 sobre fondo (el texto NO es interactivo en este estado — pierde affordance deliberadamente, no se exige 4.5:1).
- Sufijo `¹` en muted sobre fondo del botón Pico: el sufijo es **decorativo** (la información está en `aria-label`). Ratio 3:1 es suficiente.

**Estados visuales nuevos (definidos como overrides en `styles.css`):**

```css
/* ─── Word-buttons ──────────────────────────────────────────────────── */

/* Banco arriba: contenedor flex-wrap con gap 8px. */
.wb-bank { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.5rem 0; }

/* Área respuesta vacía: borde sutil + min-height + placeholder. */
.wb-answer {
  min-height: 3rem;
  padding: 1rem;
  margin: 1.5rem 0;
  border: 1px dashed var(--pico-muted-border-color, #e0e0e0);
  border-radius: var(--pico-border-radius, 0.25rem);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.wb-answer-empty::before {
  content: 'Construye la frase pulsando las palabras del banco...';
  color: var(--pico-muted-color, #6c757d);
  font-style: italic;
}
/* Tras fallar el chequeo: borde rojo sobre el área respuesta. */
.wb-answer.incorrecta { border-color: var(--pico-color-red-500, #d32f2f); border-style: solid; }
/* Frase correcta literal tras fallo: párrafo bajo el área respuesta. */
.wb-correct-answer { color: var(--pico-color-green-500, #2e7d32); font-weight: 600; margin-top: 0.5rem; }

/* Sufijo teclado dentro del botón. */
.kbd-hint { color: var(--pico-muted-color, #6c757d); font-size: 0.75em; margin-left: 0.25rem; font-weight: 600; }

/* ─── Match ─────────────────────────────────────────────────────────── */

/* Layout dos columnas. */
.match-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.5rem 0; }
.match-col { display: flex; flex-direction: column; gap: 0.5rem; }

/* Item izq seleccionado (esperando click der). */
.match-selected { outline: 2px solid var(--pico-primary, #1095c1); outline-offset: 2px; }
/* Pareja correcta fijada: muted + no clickable (Alpine pondrá :disabled + esta clase). */
.match-consumed {
  color: var(--pico-muted-color, #6c757d);
  background: transparent;
  border-color: var(--pico-muted-border-color, #e0e0e0);
  opacity: 0.55;
  cursor: not-allowed;
}
/* Parpadeo rojo breve cuando una pareja es incorrecta (D-60). */
@keyframes match-flash-red {
  0%, 100% { background-color: transparent; border-color: var(--pico-primary-border, currentColor); }
  50% { background-color: var(--pico-color-red-500, #d32f2f); border-color: var(--pico-color-red-600, #b71c1c); color: white; }
}
.match-flash {
  animation: match-flash-red 300ms ease-out 1;
}
```

**Notas para el planner:**
- Las clases anteriores son la **referencia normativa**. Los nombres exactos pueden cambiar si chocan con algo del proyecto, pero el SET de estados (idle/selected/consumed/flash + bank/answer/correct-answer/empty) y los colores son inmutables.
- El animation `match-flash` corre **una sola vez** (sin loop). El handler `matchPickRight` aplica la clase, espera 300ms con `setTimeout`, la quita Y deshace la pareja (D-60). Cleanup obligatorio del setTimeout en `cancelAutoAdvance()` / `resetSession()` igual que el `sessionAutoAdvanceHandle` actual (Pitfall #5 heredado).

---

## Copywriting Contract

**Toda la copy en español** (FOUND-04). Tono neutral factúal coherente con Phase 1/2 — sin emojis decorativos, sin gamificación, sin signos de exclamación.

| Element | Copy |
|---------|------|
| Prompt word-buttons (heredado del JSON) | `payload.prompt` literal (ej. `"Yo tengo un coche."`) — sin etiqueta envolvente |
| Placeholder área respuesta vacía | `Construye la frase pulsando las palabras del banco...` (italic, muted, via `::before`) |
| CTA primario word-buttons | `Comprobar` (botón siempre visible; disabled si área vacía) |
| Helper bajo área respuesta (NO mostrar — implícito) | (vacío; la presencia del botón Comprobar + sufijos teclado es suficiente affordance) |
| Mensaje correcto tras fallo word-buttons | `Respuesta correcta: <strong>{tokens.join(' ')}</strong>` (estilo `.wb-correct-answer`) |
| CTA tras fallo (los 3 tipos) | `Siguiente` (heredado Phase 1; clase Pico default, sin `.secondary`) |
| Prompt match (heredado del JSON) | `payload.prompt` literal (ej. `"Empareja sustantivo con artículo."`) |
| Estado "esperando click derecha" match | (sin texto adicional — el `outline` azul sobre el item izq seleccionado es la única señal; D-70 explícito) |
| Empty state — banco sin distractoras (todas movidas) | (no aplica — el banco se vacía solo al final del ejercicio; el área respuesta lo refleja, no requiere placeholder) |
| Error state — JSON malformado | heredado de Phase 1: banner `#error-banner` con `archivo + exerciseId + razón` (ya cubierto en validator extendido) |
| Destructive confirmation — abandonar sesión mid-Repaso | heredado Phase 2 D-27: `¿Descartar esta sesión de repaso? Tus respuestas no se guardarán. [Descartar / Continuar]` — sin cambios |
| Destructive immediata — match primer fallo (D-61) | **NO se muestra confirmación**. El parpadeo rojo y la persistencia de cascada son inmediatos y silenciosos (coherente con D-54: "te obliga a no olvidar"). El usuario verá la regresión al volver a home / en el summary final. |
| Aria-label sufijo numérico | `Palabra {N}: {word}` (ej. `Palabra 1: ho`) sobre cada `<button>` del banco |
| Aria-label sufijo alfabético | `Letra {L}: {item}` (ej. `Letra a: la`) sobre cada item de la columna derecha de match |
| Aria-label item izq match | `Sustantivo {N}: {item}` (ej. `Sustantivo 1: casa`) — `Sustantivo` es genérico; si emerge un ejercicio con otra naturaleza (verbos↔persona) el planner puede generalizarlo a `Elemento` o leer un campo opcional `payload.leftLabel` del JSON. Discretion del planner. |

**Reglas de copy heredadas (sin cambios):**
- Texto del prompt y de las opciones se renderiza vía `x-text` exclusivamente. JAMÁS `x-html` (T-02-01).
- Strings NFC normalizadas al cargar (CONT-06). El render mantiene capitalización original del JSON; el grading es case-insensitive (D-67).
- Sin emojis decorativos. Glifos Unicode informativos (●/✓/★/⚠/→/¹²³/ᵃᵇᶜ) sí son permitidos — son señales semánticas, no decoración.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| none | not applicable | not applicable (proyecto vanilla Alpine + Pico CDN; sin shadcn ni registries de terceros) |

**Cero terceros más allá de los dos CDN ya pinned con SRI** (Pico 2.1.1 + Alpine 3.15.12 — declarados en `index.html` líneas 9-13 y 27-30). Phase 3 NO añade dependencias.

---

## Estados visuales por componente (resumen denso para el ejecutor)

Esta sección complementa los tokens anteriores con el SET COMPLETO de estados que cada nuevo botón/item debe soportar. El checker valida que el ejecutor cubrió los 5 (word-buttons) + 4 (match) sin huecos.

### Word-buttons — botón del banco

| Estado | Visual | Trigger |
|--------|--------|---------|
| Idle (disponible) | `<button>` Pico default + sufijo `¹` muted | Render inicial / palabra devuelta del área respuesta |
| Hover (mouse) | Heredado de Pico (background-color hover en `<button>`) | Mouseover desktop |
| Focus-visible (teclado) | No aplica directamente — el foco vive en `<body>` (D-72). Sin embargo, si el usuario hace Tab fuera del foco esperado, Pico aplica `outline` por defecto sobre el botón focado — NO desactivar (a11y). | Tab navigation residual |
| Pressed (durante click) | Heredado de Pico (background-color active) | Click |
| Hidden (movida al área respuesta) | No se renderiza (Alpine `x-for` sobre `wordButtonsBank`, no hay items "ocultos") | `wordButtonsAddWord(idx)` |

### Word-buttons — palabra dentro del área respuesta

| Estado | Visual | Trigger |
|--------|--------|---------|
| Colocada (clickable, devuelve al banco) | `<button>` Pico default + sufijo NO se muestra (no es alcanzable por número desde el área; solo Backspace quita la última) | Render inicial tras `wordButtonsAddWord` |
| Hover (mouse) | Heredado de Pico | Mouseover |
| Validada — correcta | clase `.correcta` (verde sólido + texto blanco) | `wordButtonsCheck` returns `true` |
| Validada — fallo (área completa) | clase `.incorrecta` aplicada al CONTENEDOR `.wb-answer` (borde rojo sólido), las palabras individuales NO cambian de fondo | `wordButtonsCheck` returns `false` |
| Disabled (post-validación) | atributo `:disabled="sessionFeedback !== null"` — heredado del patrón Phase 1 (las palabras ya colocadas no se mueven más una vez validado) | `sessionFeedback !== null` |

### Word-buttons — botón `Comprobar`

| Estado | Visual | Trigger |
|--------|--------|---------|
| Disabled (área vacía) | `:disabled="!wordButtonsCanCheck"` — Pico aplica opacity reducida + cursor not-allowed | `wordButtonsAnswer.length === 0 \|\| sessionFeedback !== null` |
| Idle clickable | `<button>` Pico primario (sin `.secondary`) | Hay ≥1 palabra colocada y aún sin validar |
| Tras validación | desaparece (`x-show="sessionFeedback === null"`) — sustituido por botón `Siguiente` si fallo, o auto-avance 600ms si correcto | `sessionFeedback !== null` |

### Match — item izquierdo

| Estado | Visual | Trigger |
|--------|--------|---------|
| Idle clickable | `<button>` Pico default + sufijo `¹` muted | Render inicial |
| Seleccionado (esperando click derecha) | clase `.match-selected` (outline 2px azul Pico primary) | `matchSelectLeft(idx)` — uno solo a la vez |
| Consumed (pareja correcta fijada) | clase `.match-consumed` (muted gris, opacity 0.55, cursor not-allowed) + `:disabled="true"` | Pareja validada como correcta (D-60) |
| Flash rojo (intento erróneo) | clase `.match-flash` (animation 300ms única) — aplicada SIMULTÁNEAMENTE al item izq seleccionado y al item der intentado | `match.grade(...)` returns `false` |

### Match — item derecho

Mismos 4 estados que el izquierdo, con dos diferencias:
- Sufijo es alfabético `ᵃᵇᶜ` en lugar de numérico.
- Estado "seleccionado a la espera de pareja" NO existe en derecha (el flujo es izq → der, nunca der → izq).

### Cascada inmediata match (D-61) — observable

- Tras el primer parpadeo rojo del ejercicio: `state.categoryProgress` ya está reseteado (cascada aplicada). **No hay señal visual adicional** dentro del ejercicio — el usuario sigue completando las parejas restantes con normalidad. La regresión se observa al volver a home o en el summary final.
- **Importante para el planner:** NO añadir toast/banner "Ejercicio fallado" tras el primer parpadeo. Romperia la promesa "tono sobrio sin gamificación". El parpadeo + la persistencia silenciosa son suficientes.

---

## Comportamiento "forced last pair" en match (Claude's discretion resuelto)

**Decisión:** **NO auto-completar** la última pareja. El usuario debe hacer el click final (o pulsar el número + letra) como en cualquier otra pareja. Razones:
1. **Coherencia mecánica:** todas las parejas siguen exactamente el mismo flujo. No hay rama especial "última".
2. **Mínima sorpresa:** auto-completar mientras el usuario aún no decidió rompe el modelo mental "yo controlo cuándo se valida".
3. **Implementación simple:** sin código especial para `pairsConsumed.length === pairs.length - 1`.
4. **Sin coste real:** el último click es un solo input (1 número + 1 letra = 2 teclas o 2 clicks). Aceptable.

Si en UAT emerge fricción ("el último click es trivial y molesto"), el plan de Phase 5 puede reconsiderarlo. Por ahora **out of scope** del ejecutor.

---

## Keyboard shortcuts — contrato exhaustivo (refuerzo de D-68/D-69/D-70/D-71/D-72)

Esta tabla es la **fuente de verdad** del handler global `handleSessionKey(event)`. El checker la usa para validar que el ejecutor cubrió todas las teclas sin huecos ni colisiones.

| Tecla | Multiple-choice | Word-buttons | Match |
|-------|-----------------|--------------|-------|
| `1`-`4` | Selecciona opción `N-1` (ignora si N > opciones reales) | Mueve palabra `N` del banco al área respuesta (1-based sobre `wordButtonsBank` actual) | Selecciona item izq de posición `N` (1-based sobre `matchLeft`) |
| `5`-`9` | (ignorado — multiple-choice cap 4) | Mueve palabra `N` (igual lógica que 1-4) | Selecciona item izq de posición `N` (igual lógica que 1-4) |
| `a`-`i` | (ignorado) | (ignorado) | Si hay item izq seleccionado: forma pareja con item der de la posición `a=1, b=2, ..., i=9`; si no, ignorado |
| `Backspace` | (ignorado) | Quita la **última** palabra colocada (la devuelve al banco) | (ignorado — no hay "deshacer" en match; las parejas correctas son fijas D-60) |
| `Enter` | Si `sessionFeedback === null`: ignorado (multi-choice se valida por click directo a la opción). Si `sessionFeedback === 'incorrect'`: `sessionAdvance()` | Si `sessionFeedback === null` y `wordButtonsCanCheck`: `wordButtonsCheck()`. Si `sessionFeedback === 'incorrect'`: `sessionAdvance()` | Si `sessionFeedback === 'incorrect'`: `sessionAdvance()` (caso raro — match casi siempre marca fallo inmediato y continúa; pero al final, cuando todas las parejas están consumed y matchHadFailure, sessionAdvance() avanza al siguiente ejercicio) |
| `Space` | Igual que `Enter` (con `preventDefault` para evitar scroll de página) | Igual que `Enter` (con `preventDefault`) | Igual que `Enter` (con `preventDefault`) |
| Cualquier otra | Ignorada (no `preventDefault` — deja que el navegador haga lo suyo: Tab, F12, etc.) | idem | idem |

**Reglas transversales del handler:**
- **Foco al body** (D-72): el handler se registra con `@keydown.window` sobre el contenedor del session screen (`<section @keydown.window="handleSessionKey">`). Alpine lo desmonta automáticamente al cambiar `currentScreen`, evitando que las teclas se capturen en home/picker/summary.
- **Renumeración dinámica** (D-69): cada vez que `wordButtonsBank` cambia, los índices visibles se recalculan. Implementación recomendada: `bankWithKeys = wordButtonsBank.map((w, i) => ({word: w, key: String(i+1)}))` recalculado en render. Las posiciones 10..N (si >9 palabras visibles) se renderizan SIN sufijo.
- **Tras acierto, Enter/Space NO hacen nada** (D-71): el auto-avance 600ms gestiona el avance. `preventDefault` sobre Space sigue activo (evita scroll). Esto implica que el handler tras detectar Enter/Space con `sessionFeedback === 'correct'` simplemente retorna sin acción.
- **Modifiers:** ignorar la tecla si `event.ctrlKey \|\| event.metaKey \|\| event.altKey` (deja Ctrl+R, Cmd+L, etc. pasar al navegador). `event.shiftKey` se acepta — algunos teclados emiten `Shift+1` para `!`; el handler usa `event.key` literal (que ya devuelve `!` no `1`), evitando confusión.

---

## Layout responsive (recordatorio — desktop only v1, FOUND-03)

- **Word-buttons banco:** `flex-wrap: wrap` permite que palabras largas vayan a nueva línea sin overflow. Min-width del `<main>` heredado de Pico (max-width ~50rem). En ventanas de 1024px o más, una frase de 8 tokens cabe en 1-2 líneas.
- **Match dos columnas:** `grid-template-columns: 1fr 1fr` con `gap: 1rem`. En ventanas <500px (móvil, FUERA DE SCOPE) se rompería; el ejecutor NO añade media query para móvil en Phase 3. v2 lo evaluará.
- **Sufijos numérico/alfabético:** son texto inline — no rompen layout. Si una palabra muy corta queda con sufijo casi del mismo tamaño que ella (`io ¹`), es aceptable visualmente.

---

## Accesibilidad — checklist mínimo

- [ ] Todos los `<button>` del banco y de match llevan `aria-label` con `{Palabra/Letra/Sustantivo} {N}: {text}`.
- [ ] El `<section>` del session screen mantiene foco al `<body>` (D-72) — el listener `@keydown.window` no roba el foco visualmente.
- [ ] Pico aplica `outline` en `:focus-visible` por defecto en `<button>` — no override. El usuario puede usar Tab como fallback si el handler global falla.
- [ ] El sufijo Unicode `¹²³ᵃᵇᶜ` es decorativo a efectos de screen reader; la información canónica vive en `aria-label`.
- [ ] El parpadeo rojo de match (`@keyframes match-flash-red`) dura 300ms — NO se repite, no hay riesgo de seizure (WCAG 2.1 §2.3.1: max 3 flashes/sec, este es 1 flash único).
- [ ] Los items match en estado `.match-consumed` tienen `:disabled` + `cursor: not-allowed` — los screen readers anuncian "unavailable" automáticamente.
- [ ] El área respuesta vacía word-buttons tiene `aria-live="polite"` (recomendado al planner) para que el screen reader anuncie cada palabra añadida/quitada — esta sí es a11y nueva no cubierta por Phase 1/2.

---

## Decisiones de Claude's Discretion ya resueltas en este UI-SPEC

| Discretion (CONTEXT.md) | Resolución aquí |
|-------------------------|-----------------|
| Sufijo `<kbd>` vs superíndice Unicode | **Superíndice Unicode** con clase `.kbd-hint` muted (justificado arriba) |
| Color exacto del item izq seleccionado en match | **Outline 2px** `var(--pico-primary)` (no background fill — preserva la legibilidad del texto y se distingue de `.correcta`/`.incorrecta`) |
| Animación de parpadeo rojo | **`@keyframes match-flash-red` 300ms ease-out 1 vez** (no loop, no seizure-risk) |
| Tamaño/padding botones del banco | **Heredado de Pico** (`<button>` default) — sin override (mantiene consistencia con multi-choice y picker) |
| Placeholder del área respuesta vacía | **`Construye la frase pulsando las palabras del banco...`** italic muted via `::before` |
| Forced last pair en match | **NO auto-completar** — exigir el click final (coherencia mecánica) |
| Warning schema validator >9 palabras visibles word-buttons | **Recomendación al planner**: warning soft (no bloquea carga), mostrado en `#error-banner` con tono informativo, no rojo. Discretion final del planner. |

## Decisiones que QUEDAN para el planner (NO resueltas aquí)

- Nomenclatura final de los métodos del `appShell` (`wordButtonsCheck`, `matchPickRight`, etc.) — convención heredada de Phase 2 prefijo por área (`session*`, `wordButtons*`, `match*`) PERO los nombres exactos son discretion.
- Si `applyResultToSession(exercise, correct)` es un helper extraído o se duplica inline en cada handler (CRÍTICO: aplicar `applyImmediateFailure` exactamente UNA vez por ejercicio fallado — el planner DEBE garantizarlo).
- Si añadir `aria-live="polite"` al área respuesta word-buttons (recomendado pero no obligatorio).
- Estructura interna de los archivos `src/exercise-types/{word-buttons,match}.js` — solo se exige que cumplan la firma del registry y la layer purity (D-02).

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS (toda la copy en español, tono sobrio, sin emojis decorativos, aria-labels declarados)
- [ ] Dimension 2 Visuals: PASS (5 estados word-buttons + 4 estados match documentados, animación 300ms sin seizure risk)
- [ ] Dimension 3 Color: PASS (60/30/10 respetado vía Pico vars + .correcta/.incorrecta heredadas; accent reservado a 4 elementos listados)
- [ ] Dimension 4 Typography: PASS (Pico defaults + sufijo 0.75em muted; aria-label como fuente canónica para screen readers)
- [ ] Dimension 5 Spacing: PASS (4/8/16/24/32 declarados; .button-row reusado; sin role="group" prohibido)
- [ ] Dimension 6 Registry Safety: PASS (none — proyecto vanilla, sin terceros más allá de Pico+Alpine CDN ya pinned con SRI)

**Approval:** pending
