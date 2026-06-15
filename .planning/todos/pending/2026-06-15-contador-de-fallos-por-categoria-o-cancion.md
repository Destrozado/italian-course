---
created: 2026-06-15T00:21:15.632Z
title: Contador de fallos por categoría o canción
area: general
files:
  - index.html
---

## Problem

No hay forma de ver qué categorías/canciones cuestan más. Se quiere un contador persistente de "veces fallada" por categoría y por canción.

## Solution

TBD — cada vez que se RESETEA la racha de una categoría o canción (es decir, fallas un ejercicio y eso te devuelve a repetir la categoría entera — el loop core del proyecto), incrementar en 1 un contador `vecesFallada` de esa categoría/canción.

- Persistir en localStorage dentro del estado namespaced existente (`italian-course-state`), como el resto de contadores.
- Considerar incremento de `schemaVersion` + migración para el campo nuevo (ver CLAUDE.md, localStorage best practices).
- Mostrar el contador en la pantalla de selección de categorías/canciones para identificar las más difíciles.
- Ojo a la definición exacta de "reset de racha": confirmar que se cuenta 1 por reset (no 1 por cada ejercicio fallado).
