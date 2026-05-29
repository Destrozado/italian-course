---
quick_id: 260529-c35
slug: a-adir-y-validar-ejercicio-passo-da-te-a
date: 2026-05-29
status: complete
---

# Quick Task: Añadir y validar ejercicio "Passo da te alle otto"

## Descripción

Alta de un ejercicio nuevo en `content/exercises/preposiciones.json` que enseña el
uso idiomático de la preposición simple **`da` + persona = "a/en casa de"**
(`Passo da te alle otto` = "Paso por tu casa a las ocho"). La profesora lo marcó
como excepción concreta a aprender de memoria. Tras el alta, validarlo por quórum
multi-modelo (skill `gsd-validate-exercise`: Opus + Sonnet) hasta `validated`.

## Contexto / decisiones

- **Punto pedagógico (R6):** uno solo — `da` simple con persona/pronombre tónico
  (`da te`) significa "en casa de / adonde está esa persona". Distinto de los
  ejercicios existentes `preposiciones-040` (`dai cugini`) y `preposiciones-042`
  (`dalle zie`), que cubren `da` + preposición articolata. Este cubre el `da`
  simple con pronombre tónico.
- **Anti doble-validez (R7/C2):** `da te` vs `per te` ("por ti") es un patrón de
  doble-validez por calco del hispanohablante (`por`→`per`). Se aplica la técnica
  estrella ya usada y validada en `preposiciones-051`: incluir la traducción
  española objetivo en el prompt `(en español: '...')`. Fija el significado
  ("en casa de") sin filtrar la regla gramatical → no viola R1/C5.
- **Tipo:** multiple-choice (single-valid, coherente con la categoría).

## Tareas

1. Añadir `preposiciones-052` al final del array de `preposiciones.json` con
   `validation.status: "pending"` y `passes: []`.
2. Verificar shape/tests: `node scripts/validate-content-fixture.mjs` (o el de
   validación de contenido) + suite `node --test tests/*.test.js`.
3. Validar por quórum vía skill `gsd-validate-exercise preposiciones-052`
   (Opus + Sonnet, 1-por-1 fresh context). Resolver disputed si lo hubiera
   (calidad > tokens, ambas IAs `correcta`).
4. Commit atómico + actualizar STATE.md (tabla Quick Tasks Completed) + SUMMARY.md.

## Criterio de done

`preposiciones-052` existe, suite verde, y `validation.status: "validated"`
(≥2 pases `correcta` con `by` distintos, cero `incorrecta`).
