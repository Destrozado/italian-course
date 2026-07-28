# Phase 37: Verbi modali - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 37-Verbi modali
**Areas discussed:** Cruce multi-cat, Mapa de slots / granularidad, Diseño de distractoras, Profundidad modal+infinitivo

---

## Cruce multi-cat

| Option | Description | Selected |
|--------|-------------|----------|
| Sí: 1 cruce modali↔presente-regolare | `modali-300` con categoryIds:['modali','presente-regolare']; reusa applyResultToSession (D-54 en 2 call-sites) | ✓ |
| No: categoría limpia sin cruce | Ninguna SC lo pide; enganche del infinitivo ya se ejerce dentro de la categoría | |

**User's choice:** Sí — 1 cruce `modali-300` (modali↔presente-regolare).
**Notes:** Mantiene simetría con Phase 36 y refuerza el loop cross-categoría; el infinitivo gobernado es el enganche que FEATURES marca (modal+infinitive enhances presente-regolare).

---

## Mapa de slots / granularidad

| Option | Description | Selected |
|--------|-------------|----------|
| Guía + checkpoint del autor (como Phase 36) | Cobertura mínima aquí; mapa exacto (ids, nº slots, MC vs word-buttons) aprobado en checkpoint:decision al autorar | ✓ |
| Fijar ahora: 1 slot conjugación por verbo + slots modal+inf | 3 slots conjugación + 1-2 modal+inf, rígido desde ya | |
| Fijar ahora: consolidado ~2 slots | 1 slot conjugación mixta + 1 modal+inf, mínimo | |

**User's choice:** Guía + checkpoint del autor (patrón v1.6/v1.7/Phase 36).
**Notes:** Se fija solo la cobertura mínima (conjugación de los 3 + modal+inf); la densidad (por-verbo vs consolidado) la aprueba el autor al autorar. 0-match heredado (D-04): person→form derivable → MC + word-buttons, sin match.

---

## Diseño de distractoras (SC#1)

| Option | Description | Selected |
|--------|-------------|----------|
| Regularización + cross-verbo + acento | Mix de los 3 vectores reales de fallo A1 | ✓ |
| Solo regularización | Un solo vector (*poto/*volo) | |
| Guía, lo decide el autor/quórum por slot | No fijar la clase aquí | |

**User's choice:** Los 3 vectores — regularización falsa (*poto/*volo/*potiamo), contaminación cross-verbo (voglio/*volio), trampa del acento (può vs puoi).
**Notes:** Sigue R1 (distractora plausible sin filtrar regla/persona); cada distractora verificada por quórum.

---

## Profundidad modal+infinitivo (SC#2)

| Option | Description | Selected |
|--------|-------------|----------|
| Variedad de infinitivos + posición | 3 modales gobernando varios infinitivos + ejercer la posición con ≥1 word-buttons | ✓ |
| Los 3 ejemplos canónicos | posso andare / voglio mangiare / devo studiare, mínimo SC#2 | |

**User's choice:** Variedad de infinitivos + posición — patrón estructural (modal conjugado + infinitivo invariable), no 3 frases memorizadas.
**Notes:** Los ejemplos canónicos son el núcleo, no el techo; ≥1 slot word-buttons obligatorio (SC#2).

## Claude's Discretion

- Nombres exactos de ids de slot (prefijo `modali-`), nº final de slots, MC vs word-buttons por slot — aprobado en checkpoint:decision del autor (D-37-02).
- Estructura de plans (probable 1 track — categoría única).

## Deferred Ideas

- Passato prossimo modal (auxiliar prestado) — HARD out-of-scope; PASSPROX-01 / MODAL-PP-01 (milestone de tiempos pesados).
- Count-sync + TOTAL_EXPECTED + PROV-01 `origen` — Phase 39 (lockstep de cierre).
- `sapere` como 4º modal / modal + clítico — out (requieren clíticos como contenido; backlog).
- Reviewed (not folded): todo "Responsive móvil" (score 0.9) — falso positivo de matcher; trabajo CSS ajeno a autoría de contenido JSON.
