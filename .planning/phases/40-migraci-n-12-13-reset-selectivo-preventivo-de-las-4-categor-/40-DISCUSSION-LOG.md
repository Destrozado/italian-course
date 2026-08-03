# Phase 40: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-03
**Phase:** 40-Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`)
**Areas discussed:** Contrato de slugs, Predicado del reset, Alcance vs categories.json, Ids de los cruces multi-cat

---

## Cross-reference de todos

| Option | Description | Selected |
|--------|-------------|----------|
| Ninguno | Los 3 matches son falsos positivos para una fase de migración de state | ✓ |
| Plegar FARE-X1 | Marcar `fare-paradigma-completo.md` como plegado en Phase 40 | |
| Plegar decoyBank.pos | Meter DECOY-X1 en esta fase | |

**User's choice:** Ninguno
**Notes:** El matcher devolvió 3 candidatos con scores 0.9 / 0.6 / 0.6. "Responsive móvil" puntuó 0.9 por solapamiento de palabras basura (`del`, `phase`) — mismo falso positivo que ya se descartó en Phase 35. `FARE-X1` es el documento de diseño del milestone entero, no un todo consumible por una fase; se registra como canonical ref en su lugar.

---

## Contrato de slugs

| Option | Description | Selected |
|--------|-------------|----------|
| Verbatim del roadmap | `fare-indicativo` · `fare-congiuntivo` · `fare-cond-imperativo` · `fare-indefiniti`. Cero deriva entre documento y código | ✓ |
| Desabreviar el tercero | `fare-condizionale-imperativo`. Más legible, pero obliga a corregir ROADMAP.md y REQUIREMENTS.md | |
| Partir cond/imperativo ya | `fare-condizionale` + `fare-imperativo` = 5 categorías. Cambia FARE-X1, Phase 43 y los orders | |

**User's choice:** Verbatim del roadmap
**Notes:** Se mantiene la abreviatura `cond`, que es el único slug abreviado del proyecto, a cambio de que ROADMAP.md y REQUIREMENTS.md no necesiten corrección. Decisión one-way: el slug es a la vez id, nombre de fichero, prefijo de reset y prefijo de los ids de cruce (D-40-01/02).

---

## Predicado del reset

| Option | Description | Selected |
|--------|-------------|----------|
| 4 slugs completos | Espejo literal de `RESET_PREFIXES_V12`; lo que exige REQUIREMENTS ("completos, nunca truncados") | ✓ |
| Prefijo paraguas `'fare-'` | Un solo elemento; cubriría categorías `fare-*` futuras — que es justo el riesgo | |
| Igualdad exacta, no prefijo | `===` contra los 4 ids; no barrería los ids de slot (`fare-indicativo-001`) | |

**User's choice:** 4 slugs completos
**Notes:** El paraguas `'fare-'` se rechazó por un caso concreto y nombrado: una eventual categoría `fare-modismi` (perífrasis/modismos, hoy Out of Scope pero marcada en REQUIREMENTS como "categoría propia si el autor lo echa en falta") quedaría reseteada sin querer. El solape textual `fare-ind` entre `fare-indicativo` y `fare-indefiniti` es inocuo porque ambos se resetean, pero justifica declarar los prefijos enteros para que el predicado sea auditable slug a slug (D-40-04/05).

---

## Alcance vs categories.json

| Option | Description | Selected |
|--------|-------------|----------|
| No — solo state | `storage.js` + `backup.js` + tests. `categories.json` intacto. Espejo de Phase 35 | ✓ |
| Sí — las 4 ahora | Registrar order 15-18 en esta fase, adelantando INT-01 | |
| Solo la primera | Registrar `fare-indicativo` para desbloquear Phase 41 antes | |

**User's choice:** No — solo state
**Notes:** Registrar ahora dejaría el home listando 4 categorías vacías durante Phases 41-43 y rompería el guard de coherencia de conteo (`TOTAL_EXPECTED` literal vs `Σ slotCountOf(disco)` = 0, `scripts/run-validation-271.mjs:205-209`) — el estado intermedio roto que el orden migración→contenido→lockstep existe para evitar (D-40-06).

---

## Ids de los cruces multi-cat

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, convención v1.9 | Cruce en el fichero de `fare`, id con prefijo de `fare`, `categoryIds: [fare-*, legacy]` | ✓ |
| No, lo decide Phase 44 | Dejar la convención abierta | |

**User's choice:** Sí, convención v1.9
**Notes:** Es lo único que hace correcto el reset por prefijo: un cruce autorado bajo el prefijo legacy (`avere-400`) quedaría fuera de `RESET_PREFIXES_V13` y sobreviviría al reset de `fare`, dejando estado huérfano que no se manifiesta hasta que el autor falle ese cruce concreto. Convención verificada en disco sobre los 5 cruces de v1.9 (`dimostrativi-300`, `possessivi-300/301`, `riflessivi-300/301`, `modali-300`). Decisión tomada en Phase 40 pero ejecutada en Phase 44 (D-40-07).

---

## Claude's Discretion

- Nombres exactos de las funciones de test y estructura de los fixtures (mirror de `tests/data-storage.test.js` y `tests/backup.test.js`), siempre que cubran los 5 puntos (a)-(e) listados en CONTEXT.md.
- Redacción exacta de los comentarios de bloque, siempre que documenten el gate de no-colisión y el solape `fare-ind`.

## Deferred Ideas

- Partir `fare-indicativo` en semplici/composti si la categoría se atasca en el uso real (riesgo asumido en REQUIREMENTS.md §Future).
- Una futura categoría `fare-modismi` — hoy Out of Scope; es la razón concreta por la que se rechazó el prefijo paraguas.
- Arreglar las discrepancias de conteo VAL-06 preexistentes (genero-numero, preposiciones) — fuera de scope desde v1.9, sigue fuera.
- 3 todos revisados y no plegados: responsive móvil (falso positivo), decoyBank.pos multi-categoría (DECOY-X1), FARE-X1 (documento de milestone, registrado como canonical ref).
