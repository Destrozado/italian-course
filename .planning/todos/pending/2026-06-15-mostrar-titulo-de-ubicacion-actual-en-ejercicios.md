---
created: 2026-06-15T00:21:15.632Z
title: Mostrar título de ubicación actual en ejercicios
area: ui
files:
  - index.html
  - styles.css
---

## Problem

Cuando estás DENTRO de una categoría, un examen, un repaso o una canción, no hay ningún título visible que indique dónde estás. Es fácil olvidar en qué categoría/modo estás a mitad de sesión. Se necesita una referencia contextual permanente en pantalla mientras se hacen ejercicios.

## Solution

TBD — añadir una cabecera/título contextual visible durante toda la sesión de ejercicios que muestre el contexto actual:
- Categoría: nombre de la categoría (p.ej. "Preposizioni").
- Examen / Repaso: indicar el modo y, si aplica, qué abarca.
- Canción: título de la canción (p.ej. "Solo — Ultimo").

Debe verse siempre mientras resuelves, no solo en la pantalla de selección. Reutilizar los nombres ya disponibles (categories.json `name`, songs.json `title`, modo activo).
