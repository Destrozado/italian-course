---
phase: 32-cimientos-visuales-home-categor-as
plan: 01
subsystem: ui
tags: [css, design-tokens, self-hosted-fonts, woff2, font-face, pico-css, editoriale, dark-mode]

# Dependency graph
requires:
  - phase: 28-responsive (huérfana archivada)
    provides: capa @media 640px tabla→tarjetas con data-label (debe NO regresar)
provides:
  - "Capa Editoriale app.css sobre Pico: tokens --ed-* en :root (colores/tipografía/radios/sombras/espaciado)"
  - "3 familias auto-hospedadas en vendor/fonts/ (13 woff2 subset latin) vía @font-face offline"
  - "Motivo tricolore reutilizable .ed-tricolore (verde/crema/rojo, 4px, radio 999)"
  - "Modo oscuro de Pico desactivado: paleta papel siempre (color-scheme: light)"
  - ".badge-* reconciliado a D-01: dominada=verde, hecha=ámbar, no-hecha=neutro"
affects: [phase-33-pantallas-ejercicio, phase-34-canciones-resultados-picker, home-categorias-plan-02]

# Tech tracking
tech-stack:
  added: [self-hosted woff2 fonts (Spectral/Hanken Grotesk/Space Grotesk)]
  patterns:
    - "Override-on-Pico vía CSS custom properties --ed-* (app.css linkeado DESPUÉS de styles.css)"
    - "@font-face con rutas relativas ./vendor/fonts/ + font-display:swap, cero red en runtime"
    - "Tricolore como linear-gradient de paradas duras (sin markup interno)"

key-files:
  created:
    - app.css
    - vendor/fonts/ (13 woff2)
  modified:
    - index.html
    - styles.css

key-decisions:
  - "@font-face declarados en app.css (no en fichero fonts.css aparte) — un solo hogar para la capa"
  - "Tricolore implementado como linear-gradient de 3 paradas duras → .ed-tricolore funciona como <span> vacío sin markup interno"
  - "Badge color corregido en UN solo hogar (styles.css con tokens --ed-* + fallback hex); app.css NO redefine .badge-* para evitar pelea de cascada"
  - "Gutter 22px anclado en <main> (envuelve todas las pantallas) sin reestructurar DOM"

patterns-established:
  - "Capa Editoriale: tokens --ed-* en :root consumidos vía var(--ed-*, #fallback)"
  - "Fuentes auto-hospedadas offline-first vía @font-face relativo (precedente nuevo; vendor/ no existía)"
  - "Tricolore reutilizable disponible para Phases 33-34"

requirements-completed: [FND-01, FND-02, FND-03, FND-04]

# Metrics
duration: ~3min
completed: 2026-06-30
---

# Phase 32 Plan 01: Cimientos visuales Editoriale Summary

**Capa `app.css` Editoriale sobre Pico — tokens `--ed-*`, 3 fuentes auto-hospedadas offline en `vendor/fonts/`, motivo tricolore reutilizable, modo oscuro desactivado y `.badge-*` reconciliado a D-01 (dominada=verde, hecha=ámbar).**

## Performance

- **Duration:** ~3 min (137 s entre primer y último commit de tarea)
- **Started:** 2026-06-30
- **Completed:** 2026-06-30
- **Tasks:** 3
- **Files modified:** 4 lógicos (app.css nuevo, index.html, styles.css, vendor/fonts/ con 13 woff2)

## Accomplishments
- **FND-02 (offline):** 13 ficheros `.woff2` subset latin descargados del CDN de Google y auto-hospedados en `vendor/fonts/` (Spectral 400/500/600/700 + italic 400/500; Hanken Grotesk 400/500/600/700/800; Space Grotesk 500/700). Headers `wOF2` verificados. CERO peticiones a `fonts.googleapis.com`/`gstatic.com` en runtime.
- **FND-01 (tokens):** `app.css` declara todos los `--ed-*` en `:root` con los valores EXACTOS del handoff (off-grid 22px y sombra CTA `.26` verbatim, no `.28`).
- **FND-03 (base + dark off):** `body` consume `--ed-paper` (#f4f0e8) + sans; headings serif Spectral; `<main>` con gutter lateral 22px. Modo oscuro de Pico desactivado (`color-scheme: light` en styles.css + meta).
- **FND-04 (tricolore):** clase `.ed-tricolore` reutilizable (verde/crema/rojo, 4px, radio 999) vía `linear-gradient`.
- **D-01 reconciliado:** `.badge-*` corregido de la inversión legacy → dominada=verde `--ed-green`, hecha=ámbar `--ed-amber`, no-hecha=neutro `--ed-neutral-dot`.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: Auto-hospedar las 3 familias en vendor/fonts/** - `dbdabb7` (feat)
2. **Task 2: Crear app.css (tokens + base Editoriale + tricolore) y enlazarlo** - `94e1886` (feat)
3. **Task 3: Desactivar modo oscuro (D-03) y reconciliar .badge-* a D-01** - `9b676d7` (fix)

## Files Created/Modified
- `vendor/fonts/*.woff2` (13) - Fuentes subset latin auto-hospedadas (nuevo directorio `vendor/`).
- `app.css` - Capa Editoriale: @font-face, tokens `--ed-*`, base papel/serif, gutter 22px, `.ed-tricolore`.
- `index.html` - `<link app.css>` tras `styles.css`; `<meta color-scheme>` → `light`.
- `styles.css` - `:root { color-scheme: light }`; `.badge-*` reconciliado a D-01 con tokens `--ed-*`.

## Decisions Made
- **`@font-face` en `app.css`** (no un `vendor/fonts/fonts.css` aparte): la discreción del plan permitía ambos; se eligió un solo hogar para la capa Editoriale, menos `<link>` en el `<head>`.
- **Tricolore vía `linear-gradient`** de 3 paradas duras (verde 0-33.3% / crema 33.3-66.6% / rojo 66.6-100%): `.ed-tricolore` funciona como `<span>` vacío, sin requerir 3 hijos en el markup → más fácil de reutilizar en Phases 33-34.
- **Color del badge en UN solo hogar (`styles.css`)**: las 3 reglas legacy se editaron in situ a los tokens `--ed-*` con fallback hex; `app.css` NO redefine `.badge-*` → las dos hojas no se pelean en la cascada (resuelve el LOAD-BEARING BUG documentado en PATTERNS).

## Deviations from Plan

None - plan executed exactly as written.

(El grep de acceptance de Task 1 marcó `app.css` por una mención de `fonts.googleapis.com` dentro de un comentario en prosa, no una referencia de runtime; se reescribió el comentario para mantener el grep limpio. No es una desviación de comportamiento — cero refs `src:`/`url(`/`href=` a Google en ningún momento.)

## Issues Encountered
- **El CDN de Google entrega woff2 según el `User-Agent`.** Se usó un UA de Chrome moderno con `curl` y se extrajo el bloque `@font-face` del subset latin (el que contiene `U+0000-00FF`) por familia/peso/estilo. Los 13 ficheros se verificaron con el magic header `wOF2`. La descarga de red SÍ era posible en el entorno → no hizo falta el checkpoint:human-action contemplado en el plan.

## User Setup Required
None - no external service configuration required. Las fuentes ya están en el repo (`vendor/fonts/`), la app sigue funcionando offline con `npx serve`.

## Verification
- `node --test tests/*.test.js` → **473 pass / 1 fail** (el único fail es el preexistente AJENO genero-numero; CERO fails nuevos — esta fase no toca lógica).
- `grep -rl "fonts.googleapis.com|fonts.gstatic.com" index.html app.css vendor/` → **vacío** (FND-02 offline).
- `grep -- '--ed-paper: #f4f0e8' app.css` → presente (FND-01).
- `grep 'color-scheme: light;' styles.css` presente y `color-scheme: light dark` ausente (FND-03/D-03).
- `ls vendor/fonts/*.woff2 | wc -l` → **13** (FND-02).
- D-01: `.badge-dominada`=verde `#2f7d56`, `.badge-hecha`=ámbar `#b9852f`, `.badge-no-hecha`=neutro `#c4bcab`.

## Threat Flags

Sin superficie nueva fuera del threat_model del plan. T-32-01 (assets woff2 vendoreados) = accept, sin red en runtime; T-32-02 (fuga de origen a Google) = mitigado (verificado vacío). No hay instalación de paquetes (T-32-SC N/A).

## Next Phase Readiness
- Cimientos visuales listos: Phase 33 (pantallas de ejercicio) y Phase 34 (canciones/resultados/picker) ya pueden consumir tokens `--ed-*`, las fuentes y `.ed-tricolore`.
- **Plan 02 (Home/Categorías)** de esta misma fase depende de esta salida: rediseñará el bloque Home reusando estos tokens, el badge ya correcto (D-01) y el getter `categoriesForDisplay` (raw `streakDays` se añadirá en Plan 02).
- Sin bloqueos.

## Self-Check: PASSED

- FOUND: `app.css`
- FOUND: `vendor/fonts/` (13 woff2)
- FOUND: `.planning/phases/32-cimientos-visuales-home-categor-as/32-01-SUMMARY.md`
- FOUND commits: `dbdabb7`, `94e1886`, `9b676d7`

---
*Phase: 32-cimientos-visuales-home-categor-as*
*Completed: 2026-06-30*
