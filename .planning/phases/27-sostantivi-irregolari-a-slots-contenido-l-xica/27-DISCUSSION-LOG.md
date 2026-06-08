# Phase 27: Sostantivi irregolari a slots (contenido, léxica) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-09
**Phase:** 27-sostantivi-irregolari-a-slots-contenido-l-xica
**Areas discussed:** Modelo de la categoría, Familias y granularidad, Ambición de variantes, Ítems límite del set

---

## Modelo de la categoría (resuelve SOST-01)

| Option | Description | Selected |
|--------|-------------|----------|
| Híbrida (como Professioni) | Bloque regla (sovrabbondanti -o→-a + invariabili) → slots por sub-regla CON autoría de variantes. Bloque léxico puro (lemas únicos) → slots reagrupados SIN variantes forzadas. Documentado por bloque. | ✓ |
| Slots-de-1 puros | Toda la categoría como léxica pura, sin autoría en ningún sitio. | |
| Rule-rich entera | Forzar que todo encaje en reglas con variantes (como Genere e numero). | |

**User's choice:** Híbrida (como Professioni) → D-27-01
**Notes:** El contenido respalda híbrida: 2 familias-regla reales (sovrabbondanti, invariabili) + lemas de cambio de raíz que son léxica pura.

---

## Familias y granularidad

| Option | Description | Selected |
|--------|-------------|----------|
| Fina: 1 slot por sub-regla | Drill-the-hard (hereda D-26-03/D-25-01); cada patrón es su propia trampa. | ✓ |
| Gruesa: pocos slots amplios | Agrupar familias afines en menos slots. | |

| Option | Description | Selected |
|--------|-------------|----------|
| Dividir invariabili: acentuadas vs extranjeras | Slot A truncas/acentuadas (città/caffè/università); Slot B extranjerismos/consonante (film/sport). | ✓ |
| Un solo slot invariabili | Todas juntas en "plural = singular". | |

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot "cambio de raíz", lemas = variantes | uomo/dio/bue/tempio como variantes del meta-patrón "raíz impredecible". | ✓ |
| Slots-de-1 por lema | Cada lema en slot propio. | |

**User's choice:** Fina + invariabili dividida + 1 slot cambio-de-raíz → D-27-02
**Notes:** —

---

## Ambición de variantes nuevas

| Option | Description | Selected |
|--------|-------------|----------|
| Generosa, sin cuota fija | Engordar donde la regla lo admite; el mapa concreta, el quórum valida 1-por-1. | ✓ |
| Mínima / solo reagrupar | Casi sin variantes nuevas. | |

| Option (dónde) | Description | Selected |
|--------|-------------|----------|
| SÍ: sovrabbondanti -o→-a (cuerpo) | Familia rica; engordar con A1/A2 plausibles. | ✓ |
| SÍ: invariabili (acentuadas + extranjeras) | Más acentuadas + más extranjeras; mata el calco. | ✓ |
| NO: slot cambio de raíz (lemas) | Lemas fijos memorizables; se documenta que no se fuerzan. | ✓ (como NO) |

**User's choice:** Generosa sin cuota; engorde en sovrabbondanti e invariabili; NO en cambio de raíz → D-27-03 + D-27-04 (verificación de plural italiano real obligatoria)
**Notes:** —

---

## Ítems límite del set (boundary fijo = 31)

| Option (regulares) | Description | Selected |
|--------|-------------|----------|
| Slot de contraste "plurali regolari" | Parentesco regulares como foils deliberados, sin engorde, sin remitir a Genere e numero. | ✓ |
| Repartir como variantes-foil | Distribuir cada regular dentro del slot irregular más cercano. | |
| Slots-de-1 reagrupados | Cada regular como slot propio. | |

| Option (duplicado #008==#025) | Description | Selected |
|--------|-------------|----------|
| Merge a 1 slot, 2 variantes | Al slot cambio-de-raíz como 2 variantes del lema tempio. | ✓ |
| Dedup a 1 superficie | Quedarse con una, descartar la otra. | |

| Option (inversos #027-031 + adjetivo #026) | Description | Selected |
|--------|-------------|----------|
| Variantes del slot de su lema/regla | Cada inverso → variante del slot correspondiente. | ✓ |
| Slot propio "plural→singular" | Slot aparte agrupando todos los inversos. | |

**User's choice:** Slot de contraste + merge tempio + inversos como variantes de su slot → D-27-05
**Notes:** —

---

## Claude's Discretion

- Asignación exacta ejercicio→slot y nº final de slots → `27-REAGRUPACION-MAP.md` con checkpoint del autor.
- Dónde cae orecchio→orecchie (#007, plural en -e) — micro-variante sovrabbondanti o aparte.
- Dónde cae moglie→mogli (#004, casi-regular -e→-i) — slot de contraste o aparte.
- Número/forma concretos de variantes nuevas (sujeto a quórum); redacción de prompts/options/explanations; esquema de ids semánticos.

## Deferred Ideas

None — la discusión se mantuvo dentro del scope. Última conversión del milestone (cierra CONV-01). Cruces multi-cat nuevos, bloque Canciones y tiempos verbales futuros (TENSE-X1..X4) siguen en backlog, fuera del boundary v1.6.
