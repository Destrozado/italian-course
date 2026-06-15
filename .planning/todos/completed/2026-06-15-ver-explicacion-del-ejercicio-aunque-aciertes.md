---
created: 2026-06-15T00:21:15.632Z
title: Ver la explicación del ejercicio aunque aciertes
area: ui
files:
  - index.html
---

## Problem

Ahora mismo la explicación de un ejercicio solo se muestra al fallar. Pero a veces aciertas por casualidad, o dudabas entre dos opciones y aciertas — y quieres ver igualmente el porqué. No hay forma de consultar la explicación tras un acierto.

## Solution

TBD — añadir un affordance (botón/icono, p.ej. "¿Por qué?" o un icono de info) que permita mostrar la `explanation` del ejercicio también cuando lo aciertas, no solo al fallar.

- La explicación ya existe en el contenido (`exercises[].explanation`); es solo cuestión de exponerla tras acertar.
- No debe entorpecer el flujo rápido cuando aciertas sin dudas (mostrar bajo demanda, no automáticamente).
