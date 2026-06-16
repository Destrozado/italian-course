# Phase 29: Migración `10→11` (reset selectivo SOLO de `presente-regolare`) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 29-migraci-n-10-11-reset-selectivo-solo-de-presente-regolare
**Areas discussed:** Forma de la migración

---

## Forma de la migración

Planteamiento: `presente-regolare` es una categoría NUEVA — sin progreso previo que resetear y sin cambio de shape del state — por lo que un reset selectivo es hoy un no-op y, estrictamente, podría no hacer falta migración.

| Option | Description | Selected |
|--------|-------------|----------|
| Migración con reset preventivo | `migrate10to11`/`hydrateV11` espejo literal del patrón con reset por prefijo `presente-regolare` (hoy no-op, cubre forward-compat de imports). Mantiene la convención v1.5/v1.6 y MIG-05/06. | ✓ |
| Bump nominal sin reset | Solo sube schemaVersion, sin lógica de reset. Más honesto, menos defensivo ante imports raros. | |
| Sin migración (replantear Phase 29) | Fundir/eliminar la fase apoyándose en DOMAIN-06 en boot. Más simple pero rompe la simetría de la cadena. | |

**User's choice:** Migración con reset preventivo (Recomendado)
**Notes:** El autor priorizó consistencia con el patrón probado de v1.5/v1.6 y la defensa forward-compat (un backup futuro que ya tenga progreso de `presente-regolare` queda reseteado limpiamente) sobre el minimalismo. Decisión registrada como D-29-01.

---

## Decisiones cerradas sin discusión (carry-forward / verificadas)

- **Target `10→11`, no `9→10`** (D-29-02): el codebase ya está en `CURRENT_SCHEMA_VERSION = 10` (detectado por el roadmapper y confirmado en `storage.js:35`); el "9" de PROJECT.md estaba stale. A verificar en plan-time.
- **Patrón de migración** (D-29-03..06): espejo de `migrate8to9`/`hydrateV9` (reset por prefijo, idempotente, deep-clone defensivo, bump espejo en `backup.js`). Convención lockeada por v1.5/v1.6 — no se re-discute.
- **Gate de colisión de prefijo**: verificado durante el scouting — `presente-regolare` no colisiona con ninguno de los 9 slugs existentes.

## Claude's Discretion

- Número/nombres de tests nuevos, organización del fixture, reutilizar o extender el fixture de 9 categorías existente — siguiendo el precedente de Phase 21.

## Deferred Ideas

Ninguna — la discusión se mantuvo dentro del scope de la fase. (Alta de contenido = Phase 30; cruces multi-cat + counts/smoke = Phase 31.)
