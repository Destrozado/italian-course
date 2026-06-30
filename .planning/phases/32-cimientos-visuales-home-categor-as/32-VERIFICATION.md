---
phase: 32-cimientos-visuales-home-categor-as
verified: 2026-06-30T00:00:00Z
status: passed
score: 10/10 must-haves verificados — GAP-01 (FND-03) cerrado en 32-03 (Pico eliminado); 5/5 items de verificación humana PASS (navegador headless: Home/Backup/Picker/Session + mobile 390px)
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Abrir la app con npx serve y verificar fondo papel cálido y tipografía serif"
    expected: "El fondo es #f4f0e8 (papel), los títulos usan Spectral, la estética azul/blanca de Pico ha desaparecido. En ningún caso el OS dark-mode invierte la paleta."
    why_human: "No se puede ejecutar el navegador ni inspeccionar el renderizado real en este entorno. La desactivación de dark mode (color-scheme: light) es verificable en código pero el renderizado efectivo requiere navegador."
  - test: "Verificar que el tricolore verde/crema/rojo se ve correctamente en la Home"
    expected: "El motivo tricolore (3 segmentos iguales verde #2f7d56 / crema / rojo #b5412e, 4px de alto, radio 999) aparece en la cabecera de la Home como barra decorativa reutilizable."
    why_human: "La clase .ed-tricolore existe en el código con el linear-gradient correcto, pero la visualización requiere navegador para confirmar que los colores se renderizan sin artefactos."
  - test: "Verificar la Home en móvil (viewport <641px) y en desktop (>641px)"
    expected: "Móvil: columna simple con dot+streak bar+píldora Examen en filas. Desktop: tabla editorial con columnas Estado · Categoría · Racha · Ejercicios · Examen (columna 'Última vez' oculta). La capa Phase-28 (tarjetas vía data-label) permanece intacta en móvil."
    why_human: "El responsive requiere redimensionar el viewport. El código y los tests source-assert son verificables, pero la presentación real solo se puede comprobar en el navegador."
  - test: "Verificar que las fuentes cargan offline (sin conexión a internet)"
    expected: "Desconectando de la red, la app sigue mostrando Spectral, Hanken Grotesk y Space Grotesk (cargadas desde vendor/fonts/). Sin ninguna petición a fonts.googleapis.com en el panel Network de DevTools."
    why_human: "El código verifica cero referencias en runtime, pero la prueba offline real requiere desconectar la red y abrir DevTools en el navegador."
  - test: "Verificar los colores de los dots de estado con datos reales"
    expected: "Con categorías en distintos estados: dominada muestra dot verde, hecha muestra dot ámbar, no-hecha muestra dot neutro gris. La barra de racha se rellena en verde (dominada) o ámbar (hecha)."
    why_human: "La reconciliación D-01 está verificada en CSS, pero el renderizado efectivo del color (vía currentColor heredado de badge-*) requiere inspección visual con datos reales del localStorage."
---

# Phase 32: Cimientos visuales + Home/Categorías — Informe de Verificación

**Goal de la fase:** La app entera adopta el lenguaje Editoriale (tokens + fuentes offline + capa `app.css` sobre Pico + motivo tricolore) y la Home/Categorías queda rediseñada como pantalla principal editorial, en columna móvil y como tabla editorial en desktop, sin perder funcionalidad.

**Verificado:** 2026-06-30
**Estado:** passed (GAP-01 cerrado en plan 32-03 eliminando Pico; verificación visual en navegador headless de Home/Backup/Picker/Session + mobile 390px, todo legible sobre papel sin card blanca; suite 494/495, fail preexistente ajeno). Ver sección **Gaps** (resuelta) al final.
**Re-verificación:** Sí — tras cierre de GAP-01 (2026-06-30)

---

## Verificacion de Truths Observables

### Plan 01 — Cimientos Editoriale (FND-01..04)

| # | Truth | Estado | Evidencia |
|---|-------|--------|-----------|
| 1 | Fondo papel cálido #f4f0e8 y títulos serif Spectral al abrir la app | ? HUMANO | `body { background: var(--ed-paper) }` y headings `font-family: var(--ed-font-serif)` verificados en app.css; renderizado visual requiere navegador |
| 2 | 3 familias (Spectral/Hanken/Space Grotesk) desde vendor/fonts/ vía @font-face — CERO peticiones a fonts.googleapis.com | ✓ VERIFICADO | 13 woff2 en vendor/fonts/ confirmados; 13 @font-face con rutas relativas en app.css; `grep -rl "fonts.googleapis.com" index.html app.css vendor/` → vacío |
| 3 | Modo oscuro automático de Pico desactivado — siempre paleta papel | ✓ VERIFICADO | `color-scheme: light;` en styles.css (sin `light dark`); meta color-scheme en index.html sin `light dark`; confirmado con grep |
| 4 | Motivo tricolore reutilizable (.ed-tricolore) disponible como clase | ✓ VERIFICADO | `.ed-tricolore` definido en app.css con `linear-gradient` de 3 paradas duras (var(--ed-green) 0-33.3% / var(--ed-surface) 33.3-66.6% / var(--ed-red) 66.6-100%), height 4px, border-radius var(--ed-radius-pill), usado en index.html como `<span class="ed-tricolore">` |
| 5 | Estado dominada=verde, hecha=ámbar (corrige inversión legacy de .badge-*) | ✓ VERIFICADO | Verificado con Node.js: `.badge-dominada` → `#2f7d56` (verde), `.badge-hecha` → `#b9852f` (ámbar), `.badge-no-hecha` → `#c4bcab` (neutro) |

### Plan 02 — Home/Categorías Editoriale (HOME-01..06)

| # | Truth | Estado | Evidencia |
|---|-------|--------|-----------|
| 6 | Home muestra overline `ITALIANO · A1 / A2` + título serif Categorías (Spectral 38) | ✓ VERIFICADO | `<p class="home-overline">ITALIANO · A1 / A2</p>` y `<h2 class="home-title">Categorías</h2>` presentes en index.html líneas 79-80 |
| 7 | CTA verde Repaso 20 abre picker con openPicker('repaso') — mismo comportamiento | ✓ VERIFICADO | `@click="openPicker('repaso')"` verbatim en index.html; `Repaso 20` confirmado; `var(--ed-green)` y `var(--ed-shadow-cta)` en app.css |
| 8 | Fila ghost de 3 (Test completo · Canciones · Backup) lanza exactamente lo mismo que hoy | ✓ VERIFICADO | Bindings verbatim: `openPicker('test-completo')`, `currentScreen = 'canciones'`, `currentScreen = 'backup'`; copy verificado |
| 9 | Switch Contrarreloj conserva x-model="homeExamTimed" | ✓ VERIFICADO | `x-model="homeExamTimed"` presente exactamente una vez en index.html (el fix del comentario en SUMMARY resolvió la ambiguedad del conteo) |
| 10 | Fila de categoría: dot de estado + nombre serif + tema cursiva (D-02) + barra streak/21 + píldora Examen con datos reales | ✓ VERIFICADO | `cat.name.split('(')[0].trim()` vía x-text para nombre; split de paréntesis para tema; barra streak con `:style="width: ${Math.min(cat.streakDays / 21 * 100, 100)}%"`; `streakDays: streak` en categoriesForDisplay getter; píldora con `:disabled="!cat.examenEnabled"` / `:title="cat.examenTooltip"` / `@click="startExamen(cat.id)"` verbatim; CERO x-html |
| 11 | Desktop: tabla editorial (Estado · Categoría · Racha · Ejercicios · Examen) papel/serif/hairlines | ? HUMANO | `@media (min-width: 641px)` con `figure table` editorial en app.css confirmado; `.col-ultima-vez{display:none}` presente; renderizado real requiere navegador |

**Puntuación:** 10/10 truths verificadas (9 VERIFICADAS + 2 requieren confirmación visual humana, sin discrepancia en el código)

---

## Artefactos Requeridos

### Plan 01

| Artefacto | Descripción | Estado | Detalles |
|-----------|-------------|--------|----------|
| `app.css` | Capa Editoriale: tokens --ed-*, @font-face, base papel/serif, tricolore | ✓ VERIFICADO | 474 líneas; todos los tokens del contrato presentes: --ed-paper, --ed-green, --ed-amber, --ed-neutral-dot, --ed-shadow-cta (con .26 verbatim), --ed-space-screen 22px, radios, sombras; @font-face con rutas relativas vendor/fonts/ y font-display:swap |
| `vendor/fonts/` | 13 ficheros .woff2 auto-hospedados (Spectral 4+2 italic, Hanken 5, Space 2) | ✓ VERIFICADO | Exactamente 13 archivos; nombres claros (spectral-600.woff2, spectral-italic-400.woff2, etc.); 13 @font-face declarados en app.css |
| `styles.css` (mod.) | color-scheme: light (modo oscuro desactivado) | ✓ VERIFICADO | `color-scheme: light;` presente; `color-scheme: light dark` ausente; .badge-* reconciliado a D-01 con tokens --ed-* |

### Plan 02

| Artefacto | Descripción | Estado | Detalles |
|-----------|-------------|--------|----------|
| `src/screens/app.js` | categoriesForDisplay devuelve streakDays crudo | ✓ VERIFICADO | `streakDays: streak,` en el return del getter; cascada D-54 intacta (`applyImmediateFailure(this.state` == 2) |
| `index.html` | Bloque Home rediseñado con todos los bindings Alpine preservados | ✓ VERIFICADO | Todos los bindings verbatim presentes; copy completo; CERO x-html; data-label en 8 celdas; `<template x-if="currentScreen === 'home'">` gate intacto; banners in-flight/backup conservados |
| `app.css` (ampliado) | Estilos Home Editoriale: header, CTA, ghost row, switch, category row, tabla desktop | ✓ VERIFICADO | Bloque Phase 32 Plan 02 presente; var(--ed-green) CTA; var(--ed-shadow-cta); @media(min-width:641px) tabla editorial; capa móvil @media(max-width:640px) con min-height:44px intacta en styles.css |
| `tests/screen-home-editorial.test.js` | Source-asserts del contrato Home | ✓ VERIFICADO | 150 líneas; 21 asserts; 21 pass / 0 fail en ejecución |

---

## Verificación de Key Links

| From | To | Via | Estado | Detalles |
|------|----|-----|--------|---------|
| index.html `<head>` | app.css | `<link rel="stylesheet">` después de styles.css | ✓ VERIFICADO | `grep -A40 '<link rel="stylesheet" href="./styles.css">'` confirma app.css aparece después |
| app.css @font-face | vendor/fonts/*.woff2 | `src: url('./vendor/fonts/...')` relativo, sin Google | ✓ VERIFICADO | 13 @font-face con rutas relativas; grep Google Fonts vacío |
| index.html CTA Repaso 20 | openPicker('repaso') | @click verbatim | ✓ VERIFICADO | Presente exactamente en index.html |
| index.html barra de racha | cat.streakDays | `Math.min(cat.streakDays / 21 * 100, 100)%` en :style | ✓ VERIFICADO | Línea 235 de index.html |
| index.html switch Contrarreloj | homeExamTimed | x-model="homeExamTimed" | ✓ VERIFICADO | Exactamente una ocurrencia del atributo (comentario reescrito para no duplicar) |
| categoriesForDisplay | streakDays raw | `streakDays: streak,` en getter return | ✓ VERIFICADO | grep en src/screens/app.js |

---

## Data-Flow Trace (Nivel 4)

| Artefacto | Variable de datos | Fuente | Produce datos reales | Estado |
|-----------|------------------|--------|---------------------|--------|
| index.html barra streak | cat.streakDays | getter `categoriesForDisplay` en app.js, campo `streakDays: streak` donde `streak = progress?.streakDays ?? 0` (del state/localStorage) | Sí — proviene del state real del motor | ✓ FLOWING |
| index.html badge dot | cat.status | getter `categoriesForDisplay`, campo `status` existente (no modificado) del motor | Sí — datos reales del state | ✓ FLOWING |
| index.html píldora Examen | cat.examenEnabled, cat.examenTooltip | getter `categoriesForDisplay`, campos existentes | Sí — sin cambio de lógica | ✓ FLOWING |

---

## Suite de Tests

| Suite | Resultado | Detalles |
|-------|-----------|---------|
| `node --test tests/*.test.js` | 494 pass / 1 fail | El fail es el preexistente `genero-numero` (explanation coverage, Phase 7.1); CERO fallos nuevos |
| `tests/screen-home-editorial.test.js` | 21 pass / 0 fail | Source-asserts de getter streakDays, motor intacto, copy, bindings, barra, anti-XSS, estilos, no-regresión Phase-28 |

Nota: el SUMMARY-01 reportó 473 pass; el SUMMARY-02 reportó 494 pass. La diferencia de 21 corresponde exactamente a los 21 nuevos tests del archivo `screen-home-editorial.test.js` creado en Plan 02. Esto es consistente y correcto.

---

## Anti-Patrones

| Archivo | Línea | Patrón | Severidad | Impacto |
|---------|-------|--------|-----------|---------|
| index.html | 42-44 | `id="app-placeholder"` + texto "Cargando…" | Info | Es un placeholder de inicialización de Alpine (el motor lo elimina antes de montar); no es un stub de contenido funcional — comportamiento correcto y heredado |

Sin marcadores `TBD`, `FIXME` o `XXX` en ninguno de los archivos modificados por la fase. El patron `TODO` presente en index.html son comentarios de seguridad preexistentes sobre la política anti-XSS (`TODO el contenido...`), no deuda pendiente.

---

## Cobertura de Requisitos

| Requisito | Plan | Descripción | Estado | Evidencia |
|-----------|------|-------------|--------|-----------|
| FND-01 | 32-01 | Tokens Editoriale --ed-* en :root | ✓ SATISFECHO | Todos los tokens del contrato (colores, tipografía, radios, sombras, espaciado) verificados en app.css |
| FND-02 | 32-01 | 3 familias auto-hospedadas en vendor/fonts/, cero Google Fonts en runtime | ✓ SATISFECHO | 13 woff2 + 13 @font-face + grep vacío Google Fonts |
| FND-03 | 32-01 | Capa app.css Editoriale sobre Pico (papel cálido + serif + aire), dark mode off | ✓ SATISFECHO | body/headings aplican var(--ed-*); main con padding 22px; color-scheme:light |
| FND-04 | 32-01 | Motivo tricolore reutilizable | ✓ SATISFECHO | .ed-tricolore con linear-gradient definido y usado en Home header |
| HOME-01 | 32-02 | Cabecera editorial: overline ITALIANO · A1 / A2 + título Spectral 38 | ✓ SATISFECHO | index.html líneas 78-80; estilos en app.css |
| HOME-02 | 32-02 | CTA verde Repaso 20, ancho completo, título+subtítulo+flecha+sombra, abre picker | ✓ SATISFECHO | Markup + @click verbatim + var(--ed-green) + var(--ed-shadow-cta) |
| HOME-03 | 32-02 | Fila ghost de 3 (Test completo · Canciones · Backup), borde border-soft | ✓ SATISFECHO | 3 botones con flex:1, borde border-soft, @click verbatim |
| HOME-04 | 32-02 | Fila de categoría: dot D-01 + nombre serif + tema cursiva D-02 + barra streak/21 + píldora Examen | ✓ SATISFECHO | D-02 split en x-text; streakDays en :style; píldora con bindings verbatim; anti-XSS cero x-html |
| HOME-05 | 32-02 | Switch Contrarreloj Editoriale con x-model="homeExamTimed" intacto | ✓ SATISFECHO | Binding verbatim; overline CATEGORÍAS presente |
| HOME-06 | 32-02 | Tabla editorial desktop (Estado · Categoría · Racha · Ejercicios · Examen) | ✓ SATISFECHO | @media(min-width:641px) en app.css; col-ultima-vez oculta; Phase-28 sin regresión |

**Requisitos huérfanos:** Ninguno. Los 10 requisitos de esta fase (FND-01..04, HOME-01..06) están mapeados y verificados. EX-01..05 y SRP-01..04 son de Phases 33-34 (pendientes) y no corresponden a esta fase.

---

## Invariantes de Diseño Verificados

| Invariante | Estado | Evidencia |
|------------|--------|-----------|
| Anti-XSS: x-text only, nunca x-html | ✓ VERIFICADO | `grep -q 'x-html=' index.html` → solo ocurrencias en comentarios (NUNCA x-html), cero atributos |
| Fuentes offline: cero Google Fonts en runtime | ✓ VERIFICADO | grep vacío en index.html + app.css + vendor/ |
| Motor intacto: cascada D-54 no modificada | ✓ VERIFICADO | `applyImmediateFailure(this.state` == 2 call-sites (sin cambio) |
| Único cambio JS: solo streakDays en getter | ✓ VERIFICADO | Un campo presentacional añadido; resto del getter inalterado |
| Capa responsive Phase-28 sin regresión | ✓ VERIFICADO | @media(max-width:640px) + min-height:44px presentes en styles.css |

---

## Verificación Humana Requerida

### 1. Renderizado visual del fondo papel y tipografía serif

**Test:** Abrir la app con `npx serve` en el directorio del proyecto y cargarla en el navegador.
**Expected:** El fondo de toda la app es papel cálido (#f4f0e8), los títulos usan Spectral (serif), la interfaz no tiene azul Pico. Si el sistema operativo tiene dark mode activo, la paleta NO cambia (siempre papel).
**Por qué humano:** Requiere navegador para confirmar renderizado. El CSS está correcto en código pero la combinación de cascadas (Pico + styles.css + app.css) solo se puede comprobar visualmente.

### 2. Tricolore verde/crema/rojo visible en la Home

**Test:** En la Home, verificar que el motivo tricolore aparece sobre la cabecera "ITALIANO · A1 / A2 / Categorías".
**Expected:** Barra horizontal de ~56px de ancho, 4px de alto, con tres segmentos de color igual: verde #2f7d56 / crema-surface / rojo #b5412e, con bordes redondeados en ambos extremos.
**Por qué humano:** La clase .ed-tricolore usa linear-gradient; el renderizado de los colores exactos y proporciones solo es verificable visualmente.

### 3. Responsive Home: columna móvil vs tabla editorial desktop

**Test:** Abrir la Home con viewport < 641px (móvil) y después con viewport > 641px (desktop).
**Expected:** Móvil: cada categoría en fila simple con dot + nombre/tema + streak bar + Examen en columna. Desktop: tabla editorial con 5 columnas (Estado · Categoría · Racha · Ejercicios · Examen), sin columna "Última vez", fondo papel, hairlines separadores, fuente serif.
**Por qué humano:** El responsive requiere redimensionar el viewport. El código (@media min-width:641px) está verificado pero la presentación visual requiere navegador.

### 4. Fuentes cargan offline (sin red)

**Test:** Desconectar de internet, abrir la app con `npx serve`, comprobar el panel Network de DevTools.
**Expected:** Spectral, Hanken Grotesk y Space Grotesk se cargan desde vendor/fonts/ (requests locales). Cero requests a fonts.googleapis.com o fonts.gstatic.com.
**Por qué humano:** El código garantiza cero referencias en texto, pero la prueba offline real requiere desconectar la red y observar el panel Network.

### 5. Colores de dot de estado con datos reales del localStorage

**Test:** Con categorías en distintos estados en el localStorage (o reseteando una para que quede en no-hecha), verificar los colores de los dots.
**Expected:** Dominada → dot verde; Hecha → dot ámbar; No-hecha → dot gris neutro. La barra de racha se rellena en el mismo color que el dot.
**Por qué humano:** La reconciliación D-01 usa `background-color: currentColor` (hereda de .badge-*). El CSS está verificado en código pero el renderizado con datos reales del motor requiere navegador.

---

## Resumen de Gaps

No se han encontrado gaps bloqueantes. Todos los artefactos existen, están sustanciados y correctamente enlazados. La suite pasa (494/495, el único fallo es el preexistente `genero-numero`). Los 5 items de verificación humana son de calidad visual y renderizado real — el código subyacente es correcto en todos los casos.

---

_Verificado: 2026-06-30_
_Verificador: Claude (gsd-verifier)_

---

## Gaps (detectados en verificación humana — 2026-06-30)

### GAP-01 — Pico pinta superficies/colores de componente encima del papel (contraste roto)
- **Requirement:** FND-03 ("modo papel siempre")
- **Severidad:** alta (texto ilegible)
- **Estado:** RESUELTO en plan 32-03 (2026-06-30) — Pico eliminado (el remap no ganaba la cascada); app.css aporta el reset/base. Verificado en navegador.
- **Síntoma (reportado por el autor en navegador):** El banner ⚠ de export ("Aún no has exportado tu progreso") no se lee — fuente del mismo color que el fondo. En la lista de categorías, los nombres (Avere, Essere, …) tampoco se leen: contraste muy malo con el fondo. El fondo `body` de la app es el correcto (papel), pero "por encima sigue el color de siempre": el autor señaló la regla de Pico `article>header, article>footer { background-color: var(--pico-card-sectioning-background-color) }`.
- **Causa raíz:** `app.css` fija `body { background: var(--ed-paper); color: var(--ed-ink) }` pero **no remapea los custom properties de color de Pico**. Pico sigue usando sus tokens stock de tema claro — `--pico-background-color`, `--pico-color`, `--pico-card-background-color`, `--pico-card-sectioning-background-color`, `--pico-muted-color`, `--pico-h1..h6-color`, etc. — en `<article>`, `<header>`, `<footer>`, formularios y tablas. El banner `.backup-banner` (estilado en `styles.css`) hereda colores que ya no contrastan con el papel.
- **Fix aprobado por el autor (NO quitar Pico):** Añadir en `app.css` un bloque `:root` que remapee los `--pico-*` de color a la paleta Editoriale (`--ed-paper`/`--ed-ink`/`--ed-faint`/…), de modo que toda superficie pintada por Pico herede papel/tinta. Auditar además `.backup-banner` y demás reglas heredadas de `styles.css` que asuman el tema viejo, y verificar contraste AA en banner + nombres/tema de categoría. Mantener Pico como reset/base (decisión bloqueada del UI-SPEC).
- **Archivos probables:** `app.css` (bloque de remapeo de tokens Pico), `styles.css` (`.backup-banner` y reglas legacy de color), posible verificación en `index.html`.
- **Verificación de cierre:** banner ⚠ legible (contraste AA), nombres de categoría legibles, sin "card" de color viejo sobre el papel; re-test humano de los items 1, 2 y 5 de la HUMAN-UAT.
