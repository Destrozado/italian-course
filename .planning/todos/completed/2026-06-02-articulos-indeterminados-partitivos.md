---
created: 2026-06-02T17:59:51.993Z
title: Categoría artículos indeterminados y partitivos
area: content
files: []
---

## Problem

Falta una categoría de ejercicios dedicada a los artículos indeterminados y
partitivos del italiano. El autor lo pidió explícitamente ("un, delle y tal").

Cobertura esperada:
- **Articoli indeterminativi**: `un`, `uno`, `una`, `un'` — con sus reglas de
  selección según género y sonido inicial del sustantivo (ej. `uno` ante s+cons,
  z, gn, ps, x, y; `un'` ante femenino con vocal).
- **Articoli partitivi**: `del`, `dello`, `dell'`, `della`, `dei`, `degli`,
  `delle` — preposición `di` + artículo determinado, para expresar cantidad
  indeterminada ("algo de / unos").

## Solution

TBD. Crear un JSON de categoría nuevo (1 PDF/tema = 1 categoría, según convención
del proyecto) siguiendo las reglas de autoría R1-R6. Validar con el quórum
multi-modelo antes de dar de alta.

## Resolution — cerrado como ya-cubierto (2026-06-03)

El contenido pedido **ya shipped en v1.2 (2026-05-28)**, antes de capturar este todo:

- **Indeterminativi** (`un`/`uno`/`una`/`un'`): viven en `content/exercises/articoli.json`
  (56 ejercicios, combina determinativi + indeterminativi). Cada forma aparece como
  opción en 14 ejercicios (`un`×14, `uno`×14, `una`×14, `un'`×14), con sus reglas de
  selección (`uno` ante s+cons/z/gn/ps/x; `un'` ante femenino+vocal).
- **Partitivos** (`del`/`dello`/`dell'`/`della`/`dei`/`degli`/`delle`): categoría propia
  `content/exercises/partitivos.json` (44 ejercicios, 9ª categoría). Las 7 formas presentes
  como opciones; quórum cross-vendor validado.

Ambas categorías están quórum-validadas (372/372 en v1.2). El único matiz no literal —
indeterminativi van junto a determinativi en Articoli en vez de en una categoría
"indeterminados" standalone — se deja fuera de scope: las reglas y ejercicios ya se
entrenan. Si en el futuro se quiere separar, va como reorganización nueva, no como
contenido faltante.
