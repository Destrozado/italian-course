---
title: "Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"
area: ui
created: 2026-06-30
source: 33-HUMAN-UAT.md
severity: minor
status: pending
---

## Qué

Dos ajustes de **responsive móvil** detectados durante la UAT de Phase 33 (v1.8 Editoriale). Diferidos porque v1 es **desktop-only** (CLAUDE.md; UI-SPEC). Reagrupan con el trabajo huérfano Phase 28 "responsive-mobile" y el backlog "responsive móvil".

1. **Gutters del `<figure>` en la Home/Categorías (Phase 32):** en móvil, todo lo que está dentro de `<figure>` tiene márgenes laterales grandes que estrechan mucho el contenido. Aplicar `margin-left/right: 0` al `figure` (o trasvasar el padding al contenedor) se ve mucho mejor. Tocar la capa `@media (max-width: 640px)` de `styles.css` (ya existe un trasvase parcial en `article:has(figure table)`).

2. **Prompt del ejercicio demasiado grande en móvil:** la frase serif a 30px (`.session-prompt`, valor verbatim del handoff, pensado para desktop) con el gloss español hace que un prompt de 1 frase ocupe ~234px en móvil. Reducir el `font-size` del prompt en una media-query móvil.

## Por qué diferido

Ambos son responsive móvil; el milestone v1.8 y el producto v1 son **desktop-only por decisión** (CLAUDE.md: "responsive móvil se evaluará después"). El defecto REAL in-scope que salió en la misma UAT (altura de opción ~128px por `flex:1` + columna) **sí** se arregló en Phase 33 (`app.css` `.session-options button { flex: 0 0 auto }`).

## Cómo abordar

Cuando se reactive el responsive móvil como milestone/fase formal: media-queries en `styles.css`/`app.css` para (1) figure a sangre en Home y (2) escala del prompt. Sin tocar motor. Ver Phase 28 archivada en `.planning/milestones/orphan-phases/28-responsive-mobile/`.
