# Phase 20: Partitivi a slots (contenido) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-05
**Phase:** 20-partitivi-a-slots-contenido
**Areas discussed:** Alternativas, Omisión en negativa, Partitivo vs preposizione, Granularidad del-formas + contraste

---

## Alternativas (qualche / un po' di / alcuni / alcune)

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot/alternativa; alcuni/e juntos | qualche, un po' di, alcuni/e como 3 slots; alcuni/alcune = variantes de género dentro de UN slot (espejo trato invariable D-17-01) | ✓ |
| 1 slot/alternativa; alcuni≠alcune | alcuni y alcune como slots separados (purista por forma, D-19-01) | |
| 1 slot 'alternativas' único | qualche/un po' di/alcuni/alcune como variantes de un solo slot | |

**User's choice:** 1 slot por alternativa; alcuni/alcune juntos como variantes de género (→ D-20-02)
**Notes:** El autor distingue cambio de forma por concordancia (mismo slot) de cambio por regla/disparador distinto (slots separados).

---

## Omisión en negativa (D-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Slot de contraste afirm/neg | Un slot 'uso vs omisión en negativa' con caras afirmativa (del/degli) + negativa (∅) como variantes | ✓ |
| Afirmativas absorbidas + slot ∅ | 034/036 absorbidas en sus slots del-forma; slot aparte solo con caras ∅ (035/037) | |
| Slots separados afirm/neg | Un slot afirmativa + un slot negativa | |

**User's choice:** Slot de contraste afirmativa/negativa (→ D-20-03)
**Notes:** El contraste afirmativa/negativa ES la lección; la respuesta "∅ sin partitivo" es un skill que ninguna forma representa.

---

## Partitivo vs preposizione articolata (D-05)

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot de clasificación | Un slot 'distinguir partitivo vs preposizione' con las 5 frases (040-044) como variantes mezcladas | ✓ |
| Split por función | Slot PARTITIVA + slot PREPOSITIVA separados | |

**User's choice:** Un slot de clasificación (→ D-20-04)
**Notes:** El skill es clasificar la función; separar por función rompe el ejercicio (clasificar exige ver ambas mezcladas).

---

## Granularidad del-formas (split por sub-disparador)

| Option | Description | Selected |
|--------|-------------|----------|
| Mirror D-19-02 (split sub-disparador) | dello → z / s-impura; degli → s-impura / vocal / z separados; 1 slot/forma + sing/plural separados en el resto | ✓ |
| 1 slot por forma (sin split) | dello único y degli único; sub-sonidos como variantes (densidad fina en Partitivi) | |

**User's choice:** Mirror D-19-02 — split por sub-disparador en dello/degli (→ D-20-01)
**Notes:** Consistente con Articoli; cada sub-sonido = trampa distinta. Engordar celdas pobres resultantes en autoría (D-19-05 arrastrado).

---

## Pares de contraste contable/incontable (D-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Absorbidos en sus slots del-forma | Cada lado del par como variante de su slot por forma; contraste implícito vía verbo compartido | ✓ |
| Slot de contraste dedicado | Un slot 'contraste contable/incontable' agrupando los pares (espejo omisión) | |

**User's choice:** Absorbidos en sus slots del-forma (→ D-20-05)
**Notes:** Asimetría deliberada vs omisión: el eje contable/incontable ya está representado por las formas distintas (del vs dei); la omisión sí merece slot de contraste porque "∅" es skill propio.

---

## Claude's Discretion

- Esquema de id de los slots de Partitivi (sin cruces → renumeración libre, D-20-07).
- Cómo re-sincronizar los 3 hardcodes de count + TOTAL_EXPECTED al nº real de slots (D-17-04); elevar validation.status a nivel de slot en los nuevos (D-19-09).
- Límite slot vs variante en `delle` invariable y en `alcuni/e` (D-17-01 / D-20-02).
- Qué huecos de del-formas (dello+gn/ps/x, degli+gn/ps) son naturales para slots nuevos (D-19-06).

## Deferred Ideas

- Conversión de las 6 categorías restantes a slots (CONV-01 cont.) — backlog post-v1.5.
- Bridges Partitivos ↔ género-número / sustantivos (PART-X1) — backlog.
- Reescritura de explicaciones a regla generalizada — descartada por coste (D-17-05).
- Densidad mínima fija de variantes por slot — descartada (D-19-05).
