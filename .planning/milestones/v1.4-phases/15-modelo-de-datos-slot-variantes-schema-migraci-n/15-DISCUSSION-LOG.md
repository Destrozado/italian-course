# Phase 15: Modelo de datos slot+variantes + schema + migración - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 15-modelo-de-datos-slot-variantes-schema-migraci-n
**Areas discussed:** Forma del JSON de un slot, ¿Variantes de distinto tipo?, Compat de las 8 categorías

---

## Cross-reference de todos

| Todo | Match | Decisión |
|------|-------|----------|
| `2026-06-02-articulos-indeterminados-partitivos.md` | 0.6 (keywords: categoría, una, del) | **Dejar diferido** — categoría de contenido nueva, no el motor de slots. Falso positivo. Queda en pending/. |

---

## Forma del JSON de un slot

| Option | Description | Selected |
|--------|-------------|----------|
| exercises[] + variants[] opcional | Additive: cada ejercicio gana `variants[]` opcional; type/categoryIds/explanation a nivel slot; variantes planas (solo superficie); sin variants = slot de 1; los 8 archivos viejos no cambian. | ✓ |
| Nuevo slots[] explícito | Estructura `slots[]` nueva con id semántico y `variants[]` siempre presente; los 8 viejos siguen en `exercises[]` → loader maneja dos formas. | |

**User's choice:** exercises[] + variants[] opcional (seleccionó el preview de esa forma).
**Notes:** Coherente con "cambios mínimos"; el autor edita el JSON a mano y valora una sola lista con diff mínimo. Variantes planas (prompt/options/correctIndex directos, sin wrapper `payload` por variante).

---

## ¿Variantes de distinto tipo?

| Option | Description | Selected |
|--------|-------------|----------|
| Un tipo por slot | Todas las variantes comparten el `type` del slot; variabilidad por texto; grading/atajos/render idénticos dentro del slot. | ✓ |
| Tipo por variante (mezclar) | Cada variante declara su `type`; un slot puede mezclar multiple-choice + word-buttons; máximo anti-memorización pero más complejidad de motor. | |

**User's choice:** Un tipo por slot.
**Notes:** `type` se queda a nivel de slot. Mezclar tipos queda como idea diferida.

---

## Compat de las 8 categorías

| Option | Description | Selected |
|--------|-------------|----------|
| Intactos byte-a-byte | Los 8 JSON no se tocan; validador acepta legacy `payload` (slot de 1) y `variants[]` nuevo; loader normaliza; snapshot avere D-88 verde; 372 validados sin re-tocar. | ✓ |
| Reescribir a forma nueva | Convertir los 8 a `variants:[{...}]` aunque sea 1 variante; rompe snapshot avere y obliga a re-validar 372 ejercicios. | |

**User's choice:** Intactos byte-a-byte.
**Notes:** Cero re-validación; D-88 avere debe seguir verde.

---

## Claude's Discretion

- Implementación exacta del check "payload XOR variants" en `validateContent` (reusar `PAYLOAD_VALIDATORS` por tipo para la superficie de cada variante).
- Esquema de ids de variante (índice vs id derivado) — diferible a Phase 16 si el render lo necesita.
- Internals de `migrate5to6`/`hydrateV6` (se espera bump nominal del root, patrón de la cadena existente).
- NFC normalize ya cubre `variants[]` (recursivo) sin cambios.

## Deferred Ideas

- Mezclar tipos por variante dentro de un slot (descartado para v1.4 por complejidad).
- Sub-árbol de state slot-aware / tracking por variante (no necesario; `exerciseStats` por id de slot basta).
- Categoría de contenido "artículos indeterminados + partitivos" (todo diferido).
