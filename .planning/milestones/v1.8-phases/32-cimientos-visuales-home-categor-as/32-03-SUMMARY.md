---
phase: 32-cimientos-visuales-home-categor-as
plan: 03
status: complete
requirements: [FND-03]
gap_closure: true
key-files:
  created: []
  modified:
    - index.html
    - app.css
deviation: true
---

# Plan 32-03 — Cierre de GAP-01 (FND-03 contraste) — SUMMARY

## Qué se hizo

Cerrado **GAP-01** (FND-03 "modo papel siempre"): la Home y el resto de pantallas
ya no muestran la "card" blanca de Pico encima del papel, y el banner ⚠ de export
y los nombres de categoría se leen.

## Desviación respecto al plan (importante)

El plan 32-03 (y la decisión bloqueada previa 32-CONTEXT **D-03**) mandaban
**mantener Pico** y cerrar el gap remapeando sus `--pico-*` de color. **Se implementó
la Tarea 1 (remap) y NO funcionó**: Pico 2.1.1 define sus tokens de color bajo el
selector `:root:not([data-theme=dark])` — mayor especificidad que el `:root` plano
del remap — así que su `--pico-card-background-color` (blanco) seguía ganando la
cascada y pintaba el `<article>` blanco sobre el papel. Confirmado en navegador
(screenshot before/after).

**Decisión del autor en el checkpoint (2026-06-30): eliminar Pico y usar solo la
capa Editoriale.** Esto **invierte la decisión bloqueada D-03** ("Pico = reset/base").
Registrado como override.

## Cambios (CSS + 1 línea de markup)

- **`index.html`** — eliminado el `<link>` de Pico CSS (CDN classless 2.1.1). styles.css
  y app.css se mantienen.
- **`app.css`**:
  - El bloque `:root` de `--pico-*` pasa de "remap" a **shim de compatibilidad**: styles.css
    (legacy) aún usa `var(--pico-*, <fallback>)`; el shim enruta las que puede a tokens
    `--ed-*` y el resto cae a su fallback hex.
  - Nueva sección **"Base de elementos"** que reemplaza el reset/base que daba Pico:
    `box-sizing`, `<main>` centrado (`max-width:1140px`) + gutter 22px, `<article>` con
    **fondo papel** (era la card blanca del gap), `<button>` base, `<input>/<select>/<textarea>`,
    checkbox (`appearance:none` + marca verde), **switch `role="switch"`** (toggle pill
    Editoriale, reemplaza el switch de Pico — Contrarreloj), `<progress>` (track + value),
    y tablas. Todo con la paleta `--ed-*`.

## Verificación

- **Self-check automático:** greps de Tarea 1/2 OK; `grep -c picocss index.html` = 0 (Pico fuera);
  Alpine sigue cargado; FND-02 intacto (cero refs a Google Fonts en index/app/styles).
- **Suite:** `node --test tests/*.test.js` → **494 pass / 1 fail** (el fail es el preexistente
  AJENO `genero-numero`; cero fails nuevos — cambio CSS + 1 línea de `<head>`).
- **Verificación VISUAL en navegador (headless Chrome + CDP, por petición del autor):**
  capturas de las 4 pantallas clave sobre el tema papel, sin card blanca:
  - **Home** — fondo papel, sin card blanca; nombres de categoría (Avere, Essere, …) legibles
    en serif tinta; CTA verde, ghost row, tricolore, dots de estado y switch Contrarreloj OK.
  - **Backup** — el aviso ⚠ "Aún no has exportado tu progreso" **ahora se lee** (era el bug
    reportado); botones Exportar/Importar/Volver legibles.
  - **Picker** — checkboxes de categoría + Contrarreloj (switch) estilados; "Empezar"
    deshabilitado correctamente sin selección.
  - **Session** — pregunta + botones de respuesta (dei/degli/dello/delle) legibles; el
    `<progress>` del cronómetro renderiza (barra roja de cuenta atrás).

## Checkpoint (Tarea 3)

`checkpoint:human-verify` resuelto: el autor delegó la verificación visual al asistente
("tú mismo puedes abrir la web y ver cómo se ve"). Verificado por capturas headless de las
4 pantallas. Items 1, 2 y 5 de 32-HUMAN-UAT → pass.

## must_haves

- ✅ Banner ⚠ de export legible (tinta sobre papel).
- ✅ Nombres/tema de categoría legibles.
- ✅ Ninguna superficie con la card blanca stock encima del papel.
- ⚠️ "Pico sigue presente como base" → **invertido por decisión del autor**: Pico eliminado;
  app.css es ahora el reset/base.

## Notas para Phases 33-34

Ya **no hay Pico**. Cualquier pantalla que se rediseñe parte del reset/base de `app.css`
(sección "Base de elementos"). styles.css aún tiene `var(--pico-*, fallback)` legacy
enrutadas por el shim — al rediseñar cada pantalla, migrar esas refs a `--ed-*` directos.
