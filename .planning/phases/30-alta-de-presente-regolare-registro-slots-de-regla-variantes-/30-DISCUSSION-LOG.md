# Phase 30: Alta de `presente-regolare` (registro + slots de regla + variantes por quórum) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-
**Areas discussed:** Eje de variación por slot, Granularidad y conteo de slots, Match D-04, Mix de tipos + framing word-buttons

---

## A — Eje de variación dentro de cada slot de regla

| Option | Description | Selected |
|--------|-------------|----------|
| Verbo + persona | Cada variante distinto verbo Y distinta persona; obliga a aplicar la regla a léxico fresco | ✓ |
| Solo el verbo (persona fija) | Aísla la regla pero no practica las 6 personas dentro del slot | |
| Solo la persona (verbo fijo) | Practica la tabla de UN verbo, arriesga memorizarlo | |

**User's choice:** Verbo + persona
**Notes:** Implementa el core value "matar la memorización por palabra" (PRES-03) → D-30-01.

---

## B — Granularidad y conteo de slots

| Option | Description | Selected |
|--------|-------------|----------|
| 6 slots de regla | -are/-ere/-ire simple/-ire -isc-/-care-gare (1)/-ciare-giare (1); cada slot = una regla | ✓ |
| 8 slots (ortográficos separados) | Separar -care/-gare y -ciare/-giare en 4 slots; duplica regla idéntica | |
| Más de 8 (subdividir por persona) | Choca con el eje verbo+persona; explota el conteo | |

**User's choice:** 6 slots de regla → D-30-02 (N=6, Phase 31 sync 183→189).

### B.2 — Cobertura de personas

| Option | Description | Selected |
|--------|-------------|----------|
| Garantizar las 6 distribuidas | Las 6 personas aparecen ≥1 vez entre las variantes de los 6 slots | ✓ |
| Spread natural sin garantía | Riesgo de infra-representar voi/loro | |

**User's choice:** Garantizar las 6 distribuidas → D-30-03.

### B.3 — Refuerzo de la trampa -isc-

| Option | Description | Selected |
|--------|-------------|----------|
| ≥3 variantes + word-buttons en -isc- | Munición extra para la trampa A1 más caída | ✓ |
| ≥3 variantes, sin word-buttons obligatorio | word-buttons a discreción del planner | |
| Uniforme ≥2 en todos | Sin tratamiento especial | |

**User's choice:** ≥3 variantes + word-buttons en -isc- → D-30-04.

---

## C — Match (DESIGN RULE D-04)

| Option | Description | Selected |
|--------|-------------|----------|
| 0 match (alineado roadmap) | io→parlo derivable por raíz → match trivial prohibido D-04; documentar el porqué | ✓ |
| Match SOLO trampa -isc- | finire↔finisce no derivable → D-04 lo permitiría | |
| Match infinitivo↔grupo | parlare→-are; mapping conceptual no derivable | |
| Match -isc- + infinitivo↔grupo | Ambos pareos no-derivables | |

**User's choice:** 0 match → D-30-05.
**Notes:** Contraste con avere/essere (que SÍ tienen match porque ho/hai/ha/abbiamo no son derivables por raíz). Los pareos no-derivables (-isc-, infinitivo↔grupo) quedan anotados en Deferred por si se reabren en review.

---

## D.1 — Mix de tipos por slot

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-choice en todos + word-buttons selectivo | Espejo del balance avere/essere | ✓ |
| Ambos tipos en cada slot | Más autoría + más carga de quórum | |
| Solo multi-choice | Pierde la construcción activa | |

**User's choice:** Multi-choice en todos + word-buttons selectivo → D-30-06.

## D.2 — Framing word-buttons

| Option | Description | Selected |
|--------|-------------|----------|
| Frase completa (como avere/essere) | answer[] + distractors[]; consistente, no toca el motor | ✓ |
| Solo la forma conjugada | Rompería el patrón actual; exigiría render distinto (toca motor) | |

**User's choice:** Frase completa → D-30-07.

---

## Claude's Discretion

- Verbos concretos por slot más allá de los nombrados en ROADMAP/REQUIREMENTS.
- Qué slots (además del -isc-) reciben word-buttons; nº de variantes por slot sobre el mínimo.
- ids/orden de los ejercicios en el JSON; texto exacto de cada explanation (respetando R1-R7).

## Deferred Ideas

- Match no-derivable (-isc- finire↔finisce, o infinitivo↔grupo): descartado en D-30-05 a favor de 2 tipos limpios; reconsiderar en review/UAT si hace falta reforzar la clasificación de grupo. Es una variante descartada de ESTA fase, no scope de otra.
