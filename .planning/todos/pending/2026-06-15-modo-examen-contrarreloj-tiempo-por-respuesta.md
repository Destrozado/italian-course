---
created: 2026-06-15T00:21:15.632Z
title: Modo examen contrarreloj (tiempo por respuesta)
area: general
files:
  - index.html
---

## Problem

Los ejercicios son de clicar botones con textos (no de escribir). Por difícil que se ponga el contenido, reconocer la respuesta entre botones es mucho más fácil que escribirla: si ves la palabra y te suena, la pones. Falta un modo más exigente que obligue a "reaccionar" en vez de tener tiempo de razonar — con poco tiempo, solo aciertas si te lo sabes al 100% sin dudar.

## Solution

TBD — una modalidad de examen con LÍMITE DE TIEMPO por pregunta. Si se agota el tiempo de una pregunta, cuenta como fallo (y por tanto dispararía el reset de racha del loop core).

Tiempos orientativos por tipo de ejercicio (ajustables/afinables):
- **multiple-choice** (seleccionar una opción): ~5 segundos.
- **match** (emparejar 4 filas con sus parejas): ~10 segundos.
- **word-buttons** (seleccionar 5-6 palabras para formar una frase): ~2 segundos por palabra (escala con el nº de palabras de la frase).

Notas:
- Debe ser un MODO opcional (el examen normal sin tiempo sigue existiendo).
- Mostrar un temporizador visible (cuenta atrás) por pregunta.
- Los tiempos deben ser fáciles de afinar (constantes/config), no hardcodeados dispersos.
