---
quick_id: 260711-wrn
slug: anadir-variant-andro-in-italia-al-ejerci
date: 2026-07-11
status: complete
---

# Summary: Variant "Andrò in Italia" en `preposiciones-in-paese`

## Qué se hizo

El autor tradujo "Iré a Italia gratis" como *"Andrò **a** Italia gratis"* (calco del español,
donde "voy **a** Italia" es correcto), siendo la forma italiana correcta *"Andrò **in** Italia gratis"*.

La regla país/región → `in` ya estaba cubierta por `preposiciones-in-paese` (`Vivo ___ Italia`),
pero **solo con verbo estático** (`vivere`). El calco del autor surge con **verbo de movimiento**
(`andare`, dirección). Se añadió ese caso como **tercer variant al mismo ejercicio** (lo que pidió
el autor: "como mínimo meterlo como alternativa de ese mismo ejercicio").

### Cambios en `content/exercises/preposiciones.json` (ejercicio `preposiciones-in-paese`)

1. **Nuevo variant** (frase literal del autor):
   - `prompt`: `"Andrò ___ Italia gratis."`
   - `options`: `["a", "in", "da", "per"]`, `correctIndex`: `1` (→ `"in"`)

2. **Explanation ampliada**: ahora cubre tanto el uso estático (stato in luogo, "dónde se vive/está")
   como el direccional (moto a luogo, "adónde se va"), y nombra explícitamente el calco `andare a Italia`.

## Verificación

- JSON parsea sin error; el ejercicio pasa de 2 → 3 variants.
- **Quórum de validación (canónico Opus + Sonnet, top-level):**
  - Opus 4.8 → `verdict: correcta`, 5/5 criterios, 0 concerns.
  - Sonnet 5 → `verdict: correcta`, 5/5 criterios, 0 concerns.
  - Ambos verificaron explícitamente **respuesta única** en el variant nuevo: `a` es el calco
    incorrecto, `da` (origen) y `per` (exigiría artículo `per l'Italia`) no encajan como destino a país.
  - `deriveStatus(passes)` → **`validated`** (4 pases, ≥2 `by` distintos, 0 `incorrecta`).

## Commits

- `c667479` — feat: añadir el variant + ampliar explanation + `status: pending`
- `92b8137` — validate: re-validación por quórum → `validated`

## Notas

- No se creó ejercicio standalone (el autor pidió variant del ejercicio existente).
- No se tocó `preposiciones-a-ciudad` (su explanation ya menciona `Vado in Italia` como contraste).
