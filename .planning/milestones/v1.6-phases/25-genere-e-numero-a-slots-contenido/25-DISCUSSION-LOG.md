# Phase 25: Genere e numero a slots (contenido) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 25-genere-e-numero-a-slots-contenido
**Areas discussed:** Eje de slots, Solape Articoli, Huecos variantes, Nº slots

---

## Eje organizador de slots / granularidad

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot por micro-regla | Cada terminación = su propio slot (~10-13 slots). Máximo drilling; duplicadas literales = variantes del mismo micro-slot. | ✓ |
| Agrupado por familia | 3-5 slots gruesos (PLURAL/GÉNERO/ARTÍCULO), cada sub-regla = variante. Riesgo: mezcla reglas con trampa distinta. | |
| Híbrido: aislar trampas | Slots gruesos por familia pero se aíslan las sub-reglas trampa A1. | |

**User's choice:** 1 slot por micro-regla
**Notes:** Divergencia consciente vs D-24-02 (Verbi di movimento usó pocos slots porque era UNA regla essere-vs-avere). Aquí hay varias reglas paralelas con trampa propia → cada micro-regla merece su slot. → D-25-01.

---

## Sub-bloque artículos + solape con categoría Articoli

| Option | Description | Selected |
|--------|-------------|----------|
| Slot(s) propio + no referenciar Articoli | Artículos se quedan agrupados en slot propio; explanations NO remiten a la categoría Articoli (análogo D-24-07). Match preservado (D-04). | ✓ |
| Slot propio, sin restricción de referencia | Artículos como slot propio pero explanations pueden mencionar Articoli (rompería D-24-07). | |
| Lo decide el mapa | Dejar al mapa, restricción de no-referencia por defecto. | |

**User's choice:** Slot(s) propio + no referenciar Articoli
**Notes:** Restricción análoga a D-24-07/D-159. Artículo-por-sonido = regla no derivable por raíz → 3 match PRESERVAN match (D-04). → D-25-02, D-25-03.

---

## Variantes nuevas — ejes de huecos a engordar (multiselect)

| Option | Description | Selected |
|--------|-------------|----------|
| Invariables (trampa fuerte) | virtù/caffè/città/università + extranjerismos film/sport/bar → mata calco 'cittàs'/'films'. | ✓ |
| Plural -co/-go (sonido duro) | Conservación/pérdida del sonido duro: amico→amici (pierde) vs parco→parchi (conserva). | ✓ |
| Género -tore/-trice vs -essa | Contraste de sufijos de feminización: cuándo cada uno. | ✓ |
| Plural base -o/-a/-e | Más variantes de reglas regulares para variedad. | ✓ |

**User's choice:** Los 4 ejes
**Notes:** Ambición generosa sin cuota fija (hereda D-24-05). Verificar que cada palabra tome realmente esa forma; no meter irregulares puros (→ Phase 27). → D-25-04.

---

## Número final de slots

| Option | Description | Selected |
|--------|-------------|----------|
| Lo fija el mapa, luego sync | Nº exacto en 25-REAGRUPACION-MAP.md con checkpoint del autor; sync de counts contra data.exercises.length REAL. Patrón AVE-01/ESS-01. | ✓ |
| Objetivo aproximado ahora | Fijar rango objetivo ya en discuss. | |

**User's choice:** Lo fija el mapa, luego sync
**Notes:** Predicción rough ~10-13 slots. 3 hardcodes + TOTAL_EXPECTED (277) → delta = −40 + slots reales. → D-25-11.

---

## Claude's Discretion

- Asignación exacta ejercicio→micro-slot y nº total de slots (en el mapa, dentro de D-25-01..04).
- Si los 3 match quedan como 3 slots-de-1 o agrupados (dentro de D-04/D-25-03).
- Redacción de prompts/options/explanations de variantes nuevas (sujeto a quórum).
- Esquema concreto de ids semánticos por micro-regla.

## Deferred Ideas

None — discusión dentro del scope. La open question "regla-con-variantes O slots-de-1" se resuelve en Phases 26/27 (léxicas puras); NO aplica a Genere e numero (rule-rich). Plurales irregulares puros (uomo/uomini) → Phase 27. Cruces multi-cat nuevos → out of scope.
