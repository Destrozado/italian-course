# Phase 18: Migración `7→8` (reset selectivo articoli + partitivos) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-04
**Phase:** 18-migraci-n-7-8-reset-selectivo-articoli-partitivos
**Areas discussed:** Estado transitorio 18→19/20, Granularidad del reset, Rigor del test de no-regresión, Comportamiento del backup v8

---

## Estado transitorio 18→19/20

| Option | Description | Selected |
|--------|-------------|----------|
| Shippeable sin guard | Migración normal; contenido viejo (slots-de-1) funciona; re-verificación inofensiva | ✓ |
| Guard/copy de aviso | Banner "categoría en conversión" durante el transitorio | |

**User's choice:** Shippeable sin guard (confirmó la recomendación; D-01).
**Notes:** Precedente v1.4 (17-01→17-02/03 sin guard). Autor único usuario, sabe que está convirtiendo. Sin UI nueva.

---

## Granularidad del reset

| Option | Description | Selected |
|--------|-------------|----------|
| Reset por prefijo wipe completo | `articoli*` + `partitivos*` borrados de categoryProgress + exerciseStats + inFlightTest invalidado | ✓ |
| Algo más fino | Reset parcial (solo racha, etc.) | |

**User's choice:** Reset por prefijo, wipe completo (D-02/D-03).
**Notes:** Clon de `migrate6to7`. Prefijos verificados sin colisión con las otras 7 categorías. Reset = racha 0 + dominada perdida + veces-hechas 0 (PILOT-04).

---

## Rigor del test de no-regresión

| Option | Description | Selected |
|--------|-------------|----------|
| Las 7 byte-intactas (fixture con progreso en las 9) | Aserción deep-equal de las 7 no afectadas pre/post migración | ✓ |
| 1-2 representativas (estilo v1.4 'avere snapshot') | Snapshot ligero de 1-2 categorías | |

**User's choice:** Las 7 byte-intactas (D-04).
**Notes:** Más riguroso que v1.4; cuesta 1 fixture con progreso en las 9 categorías.

---

## Comportamiento del backup v8

| Option | Description | Selected |
|--------|-------------|----------|
| Igual que v1.4 | CURRENT_SCHEMA_VERSION→8, parseBackupFile migra hasta 8, >8 rechazado, pérdida-por-diseño al importar viejos | ✓ |
| Matizar | Algún tratamiento especial de backups viejos con progreso articoli/partitivos | |

**User's choice:** Igual que v1.4 (D-05/D-06).
**Notes:** Importar backup v7 con progreso articoli/partitivos → ese progreso se pierde por diseño (consistente con PILOT-04).

---

## Claude's Discretion

- Estructura interna exacta de `migrate7to8`/`hydrateV8` (espejo literal del precedente).
- Desglose de tests adicionales más allá del fixture de no-regresión (idempotencia, anti-prototype-pollution, round-trip) — clonados del set de `migrate6to7`.

## Deferred Ideas

- Banner/copy "categoría en conversión" — descartado (D-01).
- Reagrupación de contenido a slots (articoli → Phase 19, partitivos → Phase 20) — fuera de Phase 18.
