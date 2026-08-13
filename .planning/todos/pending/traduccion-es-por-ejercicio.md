---
title: "TRAD-X1 — Traducción al español en cada ejercicio (campo por variante, visible al resolver)"
area: content
created: 2026-08-13
source: conversación con el autor 2026-08-13 (cierre de v2.0)
severity: feature
status: pending
target: milestone candidato (post-v2.0)
resolves_phase: 46
---

## Qué

Cada ejercicio lleva la **traducción española de su frase**, visible **al resolver** (aciertes o
falles), para aprender vocabulario y reconocer el tiempo verbal en contexto.

## Puntos de diseño — decidir en plan-time, no antes

- **El nivel es la variante, no el slot.** Hoy hay 18 categorías / 250 slots y varias variantes por
  slot (cada variante es una frase distinta). La traducción es un campo **por variante**, así que el
  volumen de autoría es del orden del corpus entero — es tamaño **milestone**, no quick task, y con
  quórum por delante.
- **R1 (no leak) manda sobre la UI.** Una traducción completa mostrada *antes* de responder regala la
  respuesta. La formulación correcta es «solo al resolver», pero conviene que **el schema o el motor
  lo hagan imposible**, no solo la pantalla.
- **Colisión con el `gloss` que ya existe.** Este proyecto ya usa glosses ES como canon de
  desambiguación (**R7**) dentro del `prompt`. Hay que decidir explícitamente si el campo nuevo es
  otra cosa (traducción completa de la frase, post-respuesta) o una extensión del gloss — si no,
  acabas con **dos fuentes de español que se contradicen**.
- **Separado de `explanation`.** La explanation tiene tres prohibiciones ya establecidas; una
  traducción no es una explicación y mezclarlas volvería a engendrar la deuda de prosa de las
  Phases 41-44.
- **Precedente reutilizable:** el bloque **Canciones** ya hace italiano→español troceado por
  palabras, con su propio validador (S1-S6). Merece una mirada antes de inventar nada.
- **Migración:** si el campo es obligatorio, toca **`schemaVersion 13→14`** con el patrón de reset
  selectivo que es invariante del proyecto desde v1.5.
- **Acentos:** el español va acentuado (RAE, PRES-05) — es un flag **C4 real**, no un falso positivo.

## Orden respecto al otro candidato

**Este va PRIMERO.** Los pares ES↔IT que produce son exactamente el léxico que necesita
`vocabulario-es-it.md` (VOCAB-X1).
