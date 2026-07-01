# Phase 35: Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas) - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Subir el `state` del proyecto a `schemaVersion 12` con un eslabón `migrate11to12` + `hydrateV12` que resetea **selectivamente por prefijo de id** el progreso de las 4 categorías nuevas de v1.9 (Dimostrativi, Possessivi, Modali, Riflessivi), dejando el terreno limpio para que nazcan sin estado espurio en las Phases 36–38. Es un **mirror exacto** de `migrate10to11`/`RESET_PREFIXES_V11=['presente-regolare']` (v1.7, Phase 29). Cubre MIG-01 + MIG-02.

**Va PRIMERA** en el milestone (invariante v1.5/v1.6/v1.7: la migración precede al contenido).

**Dentro de scope:** `migrate11to12`, `hydrateV12`, `CURRENT_SCHEMA_VERSION=12`, `RESET_PREFIXES_V12`, espejo en `backup.js` (round-trip v12 + import `v11→v12` + rechazo `>12`), tests de migración.
**Fuera de scope:** cualquier contenido de las 4 categorías (Phases 36–38), `categories.json` entries (Phase 39 lockstep / o cuando nazca cada categoría), PROV-01, sync de counts (Phase 39), cruces multi-cat (Phase 39). NO se toca el motor v1.4.

</domain>

<decisions>
## Implementation Decisions

### Slugs / ids de las 4 categorías nuevas (decisión que Phase 35 fuerza early)
- **D-35-01:** Convención **italiano corto**: los ids/slugs son `dimostrativi`, `possessivi`, `modali`, `riflessivi`. Coherente con los ids italianos recientes (`articoli`, `presente-regolare`) y con los nombres de tema del material. → `RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi']`.
- **D-35-02:** Estos slugs son el contrato transversal del milestone: son a la vez (a) `id` en `categories.json`, (b) nombre de fichero `content/exercises/<slug>.json`, (c) prefijo de `RESET_PREFIXES_V12`, y (d) prefijo de los ids de cruce multi-cat (`dimostrativi-300`, `possessivi-300`, `riflessivi-300`…). Las Phases 36–39 DEBEN usar exactamente estos slugs.
- **D-35-03:** Verificado sin colisión `startsWith`: ninguno de los 10 ids existentes empieza por un slug nuevo ni viceversa, y ningún slug nuevo es prefijo de otro. El filtro `startsWith` del reset no tiene colisiones (mirror de la garantía D-29-03/04 de v1.7).

### Mecánica de migración (locked by precedent — el planner NO re-litiga)
- **D-35-04:** `migrate11to12` hace las 3 operaciones del patrón `migrate10to11`, cada una tras **deep-clone defensivo** (anti-prototype-pollution): (1) `delete categoryProgress[slug]` para los 4 slugs (bracket notation), (2) poda de `exerciseStats` conservando solo las claves que NO empiezan por ningún `RESET_PREFIXES_V12`, (3) invalidar `inFlightTest` si referencia ids que empiezan por algún prefijo nuevo. Idempotente.
- **D-35-05:** `hydrateV12` espeja `hydrateV11` (deep-clone, NO repite la poda — un state que llega ya viene v12-shaped o es import directo v12 a preservar íntegro). `CURRENT_SCHEMA_VERSION=12` en `storage.js` **y** en `backup.js`.
- **D-35-06:** Reset preventivo aunque las 4 categorías nazcan SIN progreso: en datos reales de hoy es un no-op (no existe progreso para esos slugs todavía), pero se incluye como mirror forward-compat — si un re-autorado/renumerado futuro deja estado espurio, queda reseteado. Es la misma justificación que RESET_PREFIXES_V11 de v1.7.
- **D-35-07:** `backup.js`: round-trip v12 (export/import), migra import `v11→v12` reusando la cadena, y **rechaza** wrappers `schemaVersion > 12`.

### Alcance / no-scope
- **D-35-08:** Las 2 discrepancias de conteo PREEXISTENTES y AJENAS del reporter VAL-06 (genero-numero 13-vs-12, preposiciones) quedan **fuera de scope de v1.9** — no se tocan en Phase 35 ni se "arreglan de paso". Son baseline conocido; el gate de v1.9 verifica que las categorías nuevas aporten X=X sin gap, no que el global preexistente esté en 0.

### Claude's Discretion
- Nombres exactos de las funciones de test / estructura de fixtures (mirror de `tests/data-storage.test.js` y `tests/backup.test.js`), siempre que cubran: (a) las 4 nuevas bootan `no-hecha` racha 0 tras reset por prefijo, (b) las 10 legacy + `songProgress` byte-intactas (fixture de no-regresión), (c) idempotencia + anti-prototype-pollution, (d) backup round-trip v12 + import v11→v12 + rechazo >12.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El mirror a copiar (v1.7, patrón exacto)
- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION` (línea ~35), `RESET_PREFIXES_V11` (~1029), `migrate10to11` (~1067), `hydrateV11` (~1131), y la cadena `if (s.schemaVersion === N) s = migrateNtoM(s)` (~161). Phase 35 = mirror `11→12`.
- `src/data/backup.js` — versión espejada de `CURRENT_SCHEMA_VERSION` + lógica de round-trip / import / rechazo `>N`.
- `tests/data-storage.test.js` — patrón de tests de migración (idempotencia, deep-clone, reset selectivo, no-regresión de las legacy).
- `tests/backup.test.js` — patrón de tests de backup round-trip + import cross-version + rechazo de versión futura.

### Requisitos
- `.planning/REQUIREMENTS.md` — MIG-01 (migrate11to12/hydrateV12/reset selectivo) y MIG-02 (backup.js v12).

### Investigación del milestone
- `.planning/research/ARCHITECTURE.md` — §migración (ONE bump 11→12 para todo el milestone, no per-categoría; RESET_PREFIXES; storage.js/backup.js mirror).
- `.planning/research/PITFALLS.md` — pitfalls de migración: predicado de reset debe incluir los 4 slugs; cautela `startsWith`; espejo en backup.js; migración idempotente.

### Precedente de milestone
- `.planning/milestones/v1.7-ROADMAP.md` — Phase 29 (`10→11`, reset selectivo de la categoría nueva) — el análogo directo de esta fase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `migrate10to11` + `hydrateV11` + `RESET_PREFIXES_V11` en `src/data/storage.js`: copiar verbatim adaptando `10→11`⇒`11→12` y el array de prefijos a los 4 slugs de D-35-01.
- La cadena de migración `if (s.schemaVersion === N)…` en `src/data/storage.js:161`: añadir el eslabón `if (s.schemaVersion === 11) s = migrate11to12(s);` y `if (s.schemaVersion === 12) return hydrateV12(s);`.
- `backup.js`: el bloque de round-trip/import/rechazo ya versionado — bump espejo a 12.

### Established Patterns
- **Reset selectivo por prefijo `startsWith`** sobre `categoryProgress` (delete) + `exerciseStats` (poda) + `inFlightTest` (invalidación) — patrón repetido en `migrate6to7` (preposiciones), `migrate7to8` (articoli+partitivos), `migrate8to9` (6 cats, `RESET_PREFIXES_V9`), `migrate10to11` (`RESET_PREFIXES_V11`).
- **Deep-clone defensivo (JSON round-trip) anti-prototype-pollution** en cada migración e hidratación (T-21-01 / T-29-01).
- **`CURRENT_SCHEMA_VERSION` espejado en storage.js Y backup.js** — nunca desincronizar.

### Integration Points
- Boot: `storage.js` aplica la cadena de migración al cargar de localStorage; no requiere cambios en el motor, screens ni schema-validator.
- `backup.js` import path: la migración cross-version reusa la misma cadena.

</code_context>

<specifics>
## Specific Ideas

- El contrato de slugs (D-35-01/02) es lo único de esta fase que condiciona a las demás; documentarlo en `RESET_PREFIXES_V12` con comentario espejo del de `RESET_PREFIXES_V11` (explicando la no-colisión `startsWith`, D-35-03).

</specifics>

<deferred>
## Deferred Ideas

- **Arreglar las discrepancias de conteo VAL-06 preexistentes** (genero-numero 13-vs-12, preposiciones) — decidido dejarlas fuera de scope de v1.9 (D-35-08). Si algún día se abordan, es trabajo aparte, no de este milestone.

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, severity minor) — el matcher le dio score 0.9 por solapamiento de palabras (home/ejercicios), pero es un falso positivo: es trabajo de CSS responsive móvil, ajeno a una fase de migración de `state`. Pertenece al backlog "responsive móvil", no a v1.9. No plegado.

</deferred>

---

*Phase: 35-Migración `11→12` (reset selectivo preventivo de las 4 categorías nuevas)*
*Context gathered: 2026-07-01*
