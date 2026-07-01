# Phase 36: Dimostrativi + Possessivi (determinantes) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 36-Dimostrativi + Possessivi (determinantes)
**Areas discussed:** Inventario y granularidad de slots, Profundidad A2/diferenciadores, Match en Possessivi, Cruces multi-cat

---

## Granularidad de las formas de quello (slots)

| Option | Description | Selected |
|--------|-------------|----------|
| Consolidado | 1 slot MC 'formas de quello' (6 formas como variantes por disparador) + 1 slot match sustantivo→forma (análogo articoli-049). Pocos slots densos, coherente con presente-regolare. | ✓ |
| Fino tipo articoli | Split por clase fonética en slots/sub-slots separados (quel/quello/quei/quegli/quell'/quelle), como articoli Phase 19. | |

**User's choice:** Consolidado (D-36-01)
**Notes:** El magnet quei/quegli se cubre con variantes contrastantes dentro del slot + el match; ronda extra de quórum con pase DeepSeek obligatorio sobre los slots de quello (INT-04).

---

## Profundidad de los A2/diferenciadores (DEMOS-05 ciò/pronombres, POSS-05 suo/loro)

| Option | Description | Selected |
|--------|-------------|----------|
| Híbrido | ciò = slot léxico single-variant documentado (patrón PROF-01/SOST-01); pronominales questo/quello 1 slot con variantes; suo his/her 1 slot (owner≠possessed); loro invariable 1 slot. | ✓ |
| Completo autorado | Todos los diferenciadores con ≥2 variantes reales, incluido ciò (ciò che / per ciò / è ciò che). | |
| Mínimo | 1 slot lo más ligero por requisito, sin desdoblar pronombres/suo/loro. | |

**User's choice:** Híbrido (D-36-02)
**Notes:** Cubre los requisitos sin padding; no forzar variantes sintéticas sobre puntos léxicos (Pitfall 7).

---

## Match en Possessivi (juicio del autor)

| Option | Description | Selected |
|--------|-------------|----------|
| MC-only | El único match del phase es el de dimostrativi (quello). Possessivi core = MC con distractora del calco 'mi casa'→'*mia casa' (derivable por raíz). Safe default de la research. | ✓ |
| Añadir match familia-vs-común | Slot match sustantivo→artículo/∅ (madre→∅, mamma→la, casa→la) — presencia/ausencia de artículo no derivable por raíz. | |

**User's choice:** MC-only (D-36-03)
**Notes:** La research flaggeaba este slot como 'author judgment'; el autor optó por el safe default.

---

## Densidad de los cruces multi-cat

| Option | Description | Selected |
|--------|-------------|----------|
| 1 por par | dimostrativi-300 (↔articoli), possessivi-300 (↔articoli), possessivi-301 (↔genero-numero). Espejo de presente-regolare-300..303. | ✓ |
| 2 por par | Duplica cada cruce (6 en total) para más densidad de cascada. | |

**User's choice:** 1 por par (D-36-04)
**Notes:** Mínimo que satisface SC#4; cascada D-54 sin nuevos call-sites (siguen 2).

---

## Claude's Discretion

- Nombres exactos de ids de slot (semánticos, con prefijo de slug), nº final de slots por categoría, y qué slots usan word-buttons vs MC (mapa aprobado por el autor en checkpoint:decision al inicio de la autoría, patrón v1.6/v1.7).
- Estructura de plans de la fase (probable 1 track por categoría) — decisión del planner.

## Deferred Ideas

- Sync de counts + TOTAL_EXPECTED + TOTAL_EXPECTED_BASELINE → Phase 39 (lockstep).
- PROV-01 `origen: "ia-quorum"` en categories.json → Phase 39.
- Match familia-vs-común en possessivi → descartado (D-36-03).
- Reviewed todo (not folded): "Responsive móvil — gutters del figure + tamaño del prompt" (falso positivo de matcher; es CSS responsive, ajeno a autoría de contenido).
