---
title: "decoyBank.pos con varias categorías por token (palabra repetida con función distinta)"
area: content-pipeline
created: 2026-07-27
source: 260727-dcy-SUMMARY.md
severity: minor
status: pending
---

## Qué

`decoyBank.pos` está indexado por **texto de palabra**, así que una palabra que
aparece dos veces en `answer` con **función gramatical distinta** solo puede
llevar UNA etiqueta POS — y una de las dos ocurrencias queda mal agrupada en el
modo "decoradores agrupados".

Caso real (único del corpus a 2026-07-27): **`22-settembre-009`**

```
IT:  Io la vita la prendo com'è
ES:  ["yo","la","vida","la","tomo","como","es"]
         ↑ artículo    ↑ pronombre de objeto directo
```

Está `disputed` (propagado a sus 7 apariciones): `deepseek-reasoner` lo marca
`incorrecta` por D2 de forma **estable** (3 re-pases, temp 0.2 / 0.6 / 1.0), y en
su último concern reconoce que el arreglo es **de esquema, no de contenido** —
lo que contradice la propia regla D1 del prompt ("los duplicados textuales solo
requieren UNA entrada en `pos`").

## Por qué diferido

Decisión del autor (2026-07-27): **opción A — aceptar el `disputed`**. La frase es
jugable igual (el modo agrupado no lee `decoyBank.validation`), es **1 de 311**
frases únicas convertidas, y es el **único** caso del corpus con este patrón. El
coste de cambiar el esquema no se justifica por una frase.

**Reactivar si vuelve a aparecer** en una canción nueva: entonces ya es una clase
de casos y no una excepción.

## Cómo abordar (opción B)

1. **Esquema**: `decoyBank.pos[token]` acepta `string | string[]`. Retrocompat
   total (todas las entradas actuales son `string`).
2. **`src/domain/word-groups.js`**: `groupTokens` reparte por ÍNDICE de entrada,
   no por texto. Con array, la n-ésima ocurrencia del token toma `pos[token][n]`
   (con fallback al último elemento si hay menos etiquetas que ocurrencias).
   El invariante a preservar: **ninguna entrada del banco se pierde** (hoy
   verificado en las 639 frases).
3. **`docs/DECOY-VALIDATION-PROMPT.md`**: reescribir D1 para admitir el array y
   exigir que su longitud cuadre con el nº de ocurrencias; añadir few-shot con un
   token de doble función.
4. **`scripts/validate-decoy-pass.mjs`**: `serDecoyBank` debe serializar el array
   (round-trip estable) — hay test de round-trip que lo cubre.
5. **Schema validator + tests**: aceptar la forma nueva sin romper la vieja.
6. **Re-validar** `22-settembre-009` (re-pasar el `by` que objetó; `writePass`
   reemplaza el pase del mismo `by` y `deriveStatus` vuelve a `validated`).

## Alternativa descartada (opción C)

Reformular la traducción a `["yo","tomo","la","vida","como","es"]` elimina el `la`
duplicado y es español igual de natural, pero cambia una traducción ya
`validated` y obliga a re-validar S1-S6. Descartada por no tocar traducciones.
