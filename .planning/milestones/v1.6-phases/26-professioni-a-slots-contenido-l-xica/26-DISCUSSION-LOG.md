# Phase 26: Professioni a slots (contenido, léxica) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-08
**Phase:** 26-professioni-a-slots-contenido-l-xica
**Areas discussed:** Modelo categoría (regla vs léxica), Granularidad slots feminización, Ambición variantes nuevas, Solapes + word-buttons

---

## A. Modelo de la categoría (regla-con-variantes vs léxica pura)

| Option | Description | Selected |
|--------|-------------|----------|
| Híbrido | Feminización = rule-rich → slots por sub-regla CON variantes; léxica pura (match + comprensión) = slots-de-1/agrupados SIN variantes artificiales. Decisión documentada por bloque. | ✓ |
| Todo regla-con-variantes | Forzar variantes en todo, incluido el match léxico. Riesgo de variantes artificiales (viola PROF-01). | |
| Todo slots-de-1 reagrupados | Tratar Professioni como léxica pura entera; sin autoría de variantes en ningún bloque. | |

**User's choice:** Híbrido (recomendado)
**Notes:** Resuelve la open question PROF-01 del roadmap. El contenido demuestra que la feminización masc→fem es regla real con sub-reglas intercambiables; el match lugar/herramienta/acción + comprensión es léxica pura. → D-26-01.

### Sub-pregunta: organización del bloque léxico puro

| Option | Description | Selected |
|--------|-------------|----------|
| Por eje semántico | 3 match → slots por eje (lugar/herramienta/acción), match preservado D-04; comprensión-MC 039-040 → slot léxico propio. Sin variantes. | ✓ |
| Cada uno slot-de-1 | Cada match y comprensión-MC como slot-de-1, sin agrupar por eje. | |
| Lo decides tú en el mapa | Fijar guía y dejar agrupación al REAGRUPACION-MAP. | |

**User's choice:** Por eje semántico (recomendado)
**Notes:** → D-26-02.

---

## B. Granularidad de los slots de feminización

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot por sub-regla | Granularidad fina (hereda D-25-01): -o→-a / -iere→-iera / -tore→-trice / -e/-ore→-essa / invariable. ~5-7 slots de feminización. | ✓ |
| Agrupado por familia gruesa | Menos slots; difumina el contraste -trice vs -essa (trampa A1). | |
| Lo decides tú en el mapa | Fijar "fina" y concretar asignación en el mapa. | |

**User's choice:** 1 slot por sub-regla (recomendado)
**Notes:** → D-26-03.

---

## C. Ambición de variantes nuevas (PROF-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Generosa sin cuota | Hereda D-25-04: engordar todos los slots de feminización con candidatas reales, quórum 1-por-1. Ejes: -trice vs -essa, invariables -ista/-ante, -o→-a, -iere→-iera. Verificación de regla obligatoria. | ✓ |
| Acotada a los ejes-trampa | Solo los 2-3 slots con trampa A1 más fuerte. | |
| Lo decides tú en el mapa | Fijar guía y dejar candidatas al VARIANTES-NUEVAS. | |

**User's choice:** Generosa sin cuota (recomendado)
**Notes:** Solo en bloque regla (feminización); bloque léxico NO autora variantes (cumplimiento explícito de PROF-01). → D-26-04.

---

## D. Solapes con otras categorías + word-buttons

### Sub-pregunta: solapes (Articoli / Essere / Genere e numero)

| Option | Description | Selected |
|--------|-------------|----------|
| No-referencia | Análogo a D-25-02/D-24-07/D-159: contenido usa artículo/essere/plural con normalidad pero explanation NO remiten a otra categoría. | ✓ |
| Sin restricción especial | Permitir remitir a Articoli/Essere/Genere. Rompe el precedente LOCKED. | |

**User's choice:** No-referencia (recomendado)
**Notes:** Afecta a artículo-por-sonido (036-038), essere en WB (100-104), plurales en WB. → D-26-05.

### Sub-pregunta: word-buttons (100-104)

| Option | Description | Selected |
|--------|-------------|----------|
| Slots WB propios | Se quedan como word-buttons (precedente Phase 24); shape WB a variants[] shallow, explanation a nivel de slot, agrupados por lo que entrenan. Sin remitir a Essere. | ✓ |
| Slot WB único | Los 5 WB → un slot único con los 5 como variantes. | |
| Lo decides tú en el mapa | Fijar "WB se conservan" y dejar agrupación al mapa. | |

**User's choice:** Slots WB propios (recomendado)
**Notes:** → D-26-06.

---

## Claude's Discretion

- Asignación exacta ejercicio→slot y nº total de slots → `26-REAGRUPACION-MAP.md` con checkpoint del autor (dentro de D-26-01..06).
- Placement del slot artículo-por-sonido (036-038): slot propio "articolo + professione (per suono)", MC preservado, sin remitir a Articoli.
- Si los 3 match léxicos son 3 slots-de-1 o agrupan reformulaciones existentes como variantes (sin variantes *nuevas*).
- Si los 5 WB son 1 slot WB único o varios.
- Esquema concreto de ids semánticos; redacción de prompts/options/explanations de variantes nuevas (sujeto a quórum).

## Deferred Ideas

None — la discusión se mantuvo dentro del scope. Sostantivi irregolari (Phase 27) resuelve la misma open question para plurales irregulares y cierra CONV-01. Plurales irregulares puros, cruces multi-cat nuevos, bloque Canciones y tiempos verbales futuros → fuera de scope / backlog.
