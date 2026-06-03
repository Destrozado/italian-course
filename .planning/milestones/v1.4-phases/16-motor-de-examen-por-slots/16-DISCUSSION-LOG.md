# Phase 16: Motor de examen por slots - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 16-motor-de-examen-por-slots
**Areas discussed:** Selección de variante, Semántica de Test completo, Recuento en home/summary, Cuándo se fija la variante

---

## Selección de variante

| Option | Description | Selected |
|--------|-------------|----------|
| Anti-repetición | Evita la última variante mostrada de ese slot. Garantiza superficie distinta al re-hacer. Coste: state nuevo (`lastVariant` por slot). | |
| Uniforme aleatoria | Igual probabilidad, sin memoria. "Pueden" tocar distintas (EXAM-04 dice "pueden"). Cero state nuevo. | ✓ |
| Ponderada por timesShown | La variante menos mostrada pesa más. Requiere contador por variante (state más pesado). | |

**User's choice:** Uniforme aleatoria.
**Notes:** Fiel a "cambios mínimos". RNG inyectable para tests deterministas. EXAM-04 se cumple por reejecución de la selección, no por prohibir repetir (D-16-01/02).

---

## Semántica de Test completo

| Option | Description | Selected |
|--------|-------------|----------|
| 1 variante por slot | Test recorre los N slots, 1 variante c/u, sin tope ni ponderación. "Completo" = todos los slots una vez. | ✓ |
| Todas las variantes de todos los slots | Exhaustivo en superficie. Rompe EXAM-01 y descuadra el recuento de slots. | |

**User's choice:** 1 variante por slot.
**Notes:** Unifica "hecha" en los 3 modos; cumple EXAM-01 automáticamente; `buildFullTest` D-50 intacto salvo resolver a variante (D-16-04/05).

---

## Recuento en home/summary

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener etiqueta, contar slots | Columna sigue "Ejercicios"; número = slots (idéntico para legacy 1:1). Cero copy/CSS. | ✓ |
| Renombrar a "Slots" | Más preciso, pero vocabulario nuevo en UI para una sola persona que ya entiende el modelo. | |
| Tú decides | Discreción del planner/UI-SPEC. | |

**User's choice:** Mantener etiqueta, contar slots.
**Notes:** Como `slot id == exercise id`, el recuento y la cobertura `clearedExerciseIds` ya equivalen a slots → no se reescribe la definición de "hecha" (D-16-06/07).

---

## Cuándo se fija la variante

| Option | Description | Selected |
|--------|-------------|----------|
| Al construir la sesión | `buildSession`/`buildFullTest` devuelven `{slotId, variantIndex}`. Sobrevive a reanudar Test; review sabe qué variante falló. | ✓ |
| Al renderizar cada slot | Solo slotIds en la sesión; variante al pintar. Reanudar podría cambiar la variante a mitad (incoherencia). | |

**User's choice:** Al construir la sesión.
**Notes:** Cierra el esquema de id de variante diferido de Phase 15 → `variantIndex` dentro del slot, default 0 para legacy/reanudación pre-existente, sin migración de schemaVersion (D-16-08/09/10).

---

## Claude's Discretion

- Shape exacto del retorno de `buildSession`/`buildFullTest` (cómo llevar `variantIndex` junto al `slotId` minimizando ripple).
- Resolución variante→superficie en render (getter slot-aware análogo a `songCurrentPhrase`).
- Si `inFlightTest` necesita backfill de `variantIndex` o basta el default 0 (preferencia: sin migración de schemaVersion).
- Cobertura exacta de tests (unit puro `buildSession`/`buildFullTest` con RNG seedado + smoke paramétrico).

## Deferred Ideas

- Anti-repetición de variante con memoria (`lastVariant` por slot) — descartado por state nuevo sin valor proporcional.
- Ponderación por variante (`timesShown` por variante) — descartado; contador vive a nivel de slot.
- Conversión del resto de categorías a slots (CONV-01) — backlog post-v1.4.
- Reviewed todo `2026-06-02-articulos-indeterminados-partitivos.md` — categoría de contenido, no el motor; sigue diferido (ya revisado en Phase 15).
