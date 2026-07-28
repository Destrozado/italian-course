# Phase 35: Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 35-Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas)
**Areas discussed:** Slugs/ids de las 4 categorías nuevas, Alcance VAL-06 (discrepancias de conteo preexistentes)

---

## Slugs / ids de las 4 categorías nuevas

Los ids actuales son MIXTOS (avere/essere/articoli/presente-regolare en IT; preposiciones/partitivos/profesiones en ES). El slug es el contrato transversal: id en categories.json + nombre de fichero + prefijo de RESET_PREFIXES_V12 + prefijo de ids de cruce.

| Option | Description | Selected |
|--------|-------------|----------|
| Italiano corto | `dimostrativi` · `possessivi` · `modali` · `riflessivi`. Coherente con ids IT recientes (articoli, presente-regolare); cortos. | ✓ |
| Italiano con `verbi-` | `dimostrativi` · `possessivi` · `verbi-modali` · `verbi-riflessivi`. Más descriptivo en los verbales, pero más largo. | |
| Español | `demostrativos` · `posesivos` · `verbos-modales` · `verbos-reflexivos`. Coherente con ids ES y con el idioma de la interfaz. | |

**User's choice:** Italiano corto → `RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi']`
**Notes:** Verificado sin colisión `startsWith` con los 10 ids existentes ni entre sí (D-35-03). Contrato para Phases 36–39.

---

## Alcance VAL-06 (discrepancias de conteo preexistentes)

Las 2 discrepancias del reporter VAL-06 (genero-numero 13-vs-12 y preposiciones) son PREEXISTENTES y AJENAS, llevan desde antes de v1.7.

| Option | Description | Selected |
|--------|-------------|----------|
| Dejarlas | Fuera de scope de v1.9; baseline conocido. El gate verifica X=X de las nuevas, no el global preexistente. No tocar Phase 35. | ✓ |
| Arreglarlas de paso en Phase 39 | Reconciliar los 2 counts en el cierre lockstep para dejar VAL-06 global en verde. Añade alcance ajeno. | |

**User's choice:** Dejarlas (fuera de scope)
**Notes:** Documentado como deferred en CONTEXT.md (D-35-08).

---

## Claude's Discretion

- Nombres exactos de funciones de test y estructura de fixtures (mirror de `tests/data-storage.test.js` + `tests/backup.test.js`), cubriendo reset selectivo, no-regresión de las 10 legacy + songProgress, idempotencia/anti-prototype-pollution, y backup round-trip/import/rechazo.
- Mecánica de migración: locked by precedent (mirror `migrate10to11`), no re-litigada.

## Deferred Ideas

- Arreglar las discrepancias de conteo VAL-06 preexistentes — fuera de scope v1.9.
- Todo "Responsive móvil — gutters del figure + tamaño del prompt" (score 0.9, falso positivo del matcher) — reviewed, NO plegado; es CSS responsive móvil, ajeno a una migración de state.
