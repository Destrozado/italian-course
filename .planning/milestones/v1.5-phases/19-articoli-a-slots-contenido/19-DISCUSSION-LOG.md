# Phase 19: Articoli a slots (contenido) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 19-articoli-a-slots-contenido
**Areas discussed:** Granularidad sing/plural, Ejercicios match (2), Cruces inter-categoría (6), Alcance autoría variantes

---

## Granularidad sing/plural

| Option | Description | Selected |
|--------|-------------|----------|
| Por disparador (sing+plural juntos) | La regla es el disparador fonético; sing/plural = variantes (lo studente/gli studenti). Coincide literal con ROADMAP, diverge de D-17-02. | |
| Por forma (sing y plural separados) | il, i, lo, gli, l', la, le = slots distintos. Mantiene D-17-02 al pie de la letra. | ✓ |

**User's choice:** Por forma (sing y plural separados) → D-19-01.
**Notes:** Mantiene la línea purista-por-forma del piloto. El texto del ROADMAP ("il/i…") se interpreta como descripción de familias por disparador, no como prescripción de slot compartido.

## Granularidad serie lo/gli (sub-disparadores)

| Option | Description | Selected |
|--------|-------------|----------|
| Un slot por sub-disparador | z, gn, ps, x, s+cons cada uno su slot. Cada sub-sonido = trampa distinta. Respeta D-17-01. | ✓ |
| Un slot 'suoni speciali' | Todos los sonidos especiales en un slot único con cada sub-sonido como variante. | |

**User's choice:** Un slot por sub-disparador → D-19-02.
**Notes:** Maximiza re-verificación por celda; el contenido ya tiene densidad por celda.

---

## Ejercicios match (2)

| Option | Description | Selected |
|--------|-------------|----------|
| Slots match propios (slot-de-1) | Cada match = slot type:match, slot-de-1, sin variantes. Skill distinta (agregación de serie). | ✓ |
| Reconvertir a multiple-choice | Descomponer en MCs por celda. Pierde la skill de agregación; cambia superficie. | |
| Descartar los match | Eliminarlos. Pierde 2 ejercicios validados. | |

**User's choice:** Slots match propios (slot-de-1) → D-19-03.
**Notes:** El shape soporta type a nivel de slot; preserva valor pedagógico complementario.

---

## Cruces inter-categoría (6)

| Option | Description | Selected |
|--------|-------------|----------|
| Slots-de-1 con id ESTABLE (no renumerar) | Conservan id actual; renumeración libre solo para articoli-only. Preserva cobertura de genero-numero/sustantivos. | ✓ |
| Dejarlos legacy e intactos (diferir) | No tocarlos; el loader los normaliza. Articoli queda con shape mixto. | |
| Renumerarlos con el resto | Ids nuevos para los 56. genero-numero/sustantivos (no reseteados) pierden cobertura. | |

**User's choice:** Slots-de-1 con id estable (no renumerar) → D-19-04.
**Notes:** Phase 18 reseteó articoli pero NO genero-numero/sustantivos-irregulares; renumerar los cruces causaría regresión a no-hecha en esas categorías. El planner reserva esos ids al renumerar articoli-only.

---

## Alcance autoría variantes

| Option | Description | Selected |
|--------|-------------|----------|
| Arrastrar D-17-06 + priorizar celdas pobres | Variantes donde la regla lo admite, sin cuota; engordar x/ps/gn a ≥2. | ✓ |
| Densidad mínima fija (≥2-3 en todo slot productivo) | Cuota dura. Más exhaustivo, más coste y riesgo de variantes artificiales. | |
| Solo reagrupar, cero variantes nuevas | Mínimo absoluto. Incumpliría ART-02. | |

**User's choice:** Arrastrar D-17-06 + priorizar celdas pobres → D-19-05.

## Huecos de disparador (y / i+vocal)

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, añadir slots y/i+vocal (sing+plural) | lo yogurt/gli yogurt etc. por quórum. Cierra la serie suoni speciali. | ✓ |
| Solo si surgen naturalmente | No forzar; arriesga serie incompleta. | |
| No añadir huecos en esta fase | Quedarse con disparadores presentes. | |

**User's choice:** Sí, añadir slots y/i+vocal (sing+plural) → D-19-06.
**Notes:** Verificar artículo+sustantivo italiano (R6) — los semiconsonánticos son terreno de error fácil.

---

## Claude's Discretion

- Esquema de id de los slots articoli-only (reservando los ids estables de los cruces, D-19-04).
- Re-sincronización de los hardcodes de count y parametrización del smoke (ART-04, patrón D-17-04).
- Límite slot-vs-variante en formas invariables (`la`, `le`): aplicar D-17-01.

## Deferred Ideas

- Conversión de Partitivi (Phase 20) y de las 6 categorías restantes (CONV-01 backlog).
- Reescritura de explicaciones a regla generalizada (descartada por coste, como en el piloto).
- Densidad mínima fija de variantes por slot (descartada a favor de "donde tenga sentido + celdas pobres").
