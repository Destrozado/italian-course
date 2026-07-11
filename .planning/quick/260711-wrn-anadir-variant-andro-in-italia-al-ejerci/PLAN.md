---
quick_id: 260711-wrn
slug: anadir-variant-andro-in-italia-al-ejerci
date: 2026-07-11
status: in-progress
---

# Quick Task: Añadir variant "Andrò in Italia" al ejercicio `preposiciones-in-paese`

## Motivación

El autor tradujo "Iré a Italia gratis" como *"Andrò **a** Italia gratis"* (calco del español),
siendo la correcta *"Andrò **in** Italia gratis"*. La regla país/región → `in` ya está cubierta
por el ejercicio `preposiciones-in-paese` (`Vivo ___ Italia`), pero **solo con verbo estático**
(`vivere`). El calco del autor surge justo con **verbo de movimiento** (`andare`, "adónde vas"),
porque en español "voy **a** Italia" es correcto. Ese matiz direccional no lo prueba ningún
variant actual.

## Alcance

Fichero: `content/exercises/preposiciones.json`, ejercicio `preposiciones-in-paese`.

1. **Añadir un tercer variant** con la frase literal del autor:
   - `prompt`: `"Andrò ___ Italia gratis."`
   - `options`: `["a", "in", "da", "per"]`
   - `correctIndex`: `1` (→ `"in"`)
   - Respuesta única y limpia: `a` es el calco (incorrecto), `da` (origen) y `per` (a través de,
     exigiría artículo `per l'Italia`) no encajan como destino.

2. **Ampliar la `explanation`** para cubrir el uso **direccional** (moto a luogo, "adónde se va"),
   no solo el estático (stato in luogo, "dónde se vive/está"), y nombrar explícitamente el calco
   `andare a Italia`. Mantener acentuación española (RAE).

3. **Marcar `validation.status` como `pending`** para forzar re-validación por quórum
   (Opus + Sonnet canónico) del ejercicio completo tras el cambio.

## Fuera de alcance

- No se crea ejercicio nuevo standalone (el autor pidió "como mínimo meterlo como alternativa
  de ese mismo ejercicio").
- No se toca `preposiciones-a-ciudad` (su explicación ya menciona `Vado in Italia`).

## Verificación

- JSON parsea sin errores.
- El variant tiene 4 opciones, `correctIndex` apunta a `"in"`, y el prompt no filtra la respuesta.
- La `explanation` sigue acentuada y no contiene referencias `#NNN`.
- El quórum LLM aprueba el ejercicio (o se resuelven los concerns).
