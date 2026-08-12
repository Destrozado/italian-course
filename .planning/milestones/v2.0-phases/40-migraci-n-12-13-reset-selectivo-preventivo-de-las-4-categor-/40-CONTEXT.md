# Phase 40: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Subir el `state` del proyecto a `schemaVersion 13` con un eslabón `migrate12to13` + `hydrateV13` que resetea **selectivamente por prefijo de id** el progreso de las 4 categorías nuevas de v2.0 (`fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti`), dejando el terreno limpio para que nazcan sin estado espurio en las Phases 41-43. Es un **mirror casi verbatim** de `migrate11to12` / `RESET_PREFIXES_V12` (v1.9, Phase 35), que a su vez espeja `migrate10to11` (v1.7, Phase 29). Cubre MIG-01 + MIG-02.

**Va PRIMERA** en el milestone — invariante de v1.5 (Phase 18), v1.6 (Phase 21), v1.7 (Phase 29) y v1.9 (Phase 35): la migración precede al contenido.

**Dentro de scope:** `migrate12to13`, `hydrateV13`, `RESET_PREFIXES_V13`, `CURRENT_SCHEMA_VERSION=13` (espejado en `storage.js` **y** `backup.js`), el eslabón nuevo en la cadena de migración, espejo en `backup.js` (round-trip v13 + import `v12→v13` + rechazo `>13`), y los tests de migración/backup.

**Fuera de scope:** cualquier contenido de las 4 categorías (Phases 41-43), entradas en `categories.json` (D-40-03), sync de counts / `TOTAL_EXPECTED` / baseline-guard / smoke paramétrico (Phase 44, INT-02), cruces multi-cat (Phase 44, INT-03). **El motor v1.4 NO se toca** — `git diff src/screens/app.js src/domain/` debe quedar vacío al cierre.

</domain>

<decisions>
## Implementation Decisions

### Contrato de slugs (decisión que Phase 40 fuerza early para todo v2.0)

- **D-40-01:** Los 4 ids/slugs son, **verbatim del roadmap**: `fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti`. Se mantiene la abreviatura `cond` del tercero para que no haya deriva entre ROADMAP.md/REQUIREMENTS.md y el código. Convención heredada de D-35-01 (italiano corto), ahora con el prefijo de verbo `fare-` como espacio de nombres del milestone. — **Reversibility:** one-way — renombrar después de Phases 41-43 exige **otro** bump de `schemaVersion` con su reset, porque el slug es simultáneamente prefijo de `RESET_PREFIXES_V13`, nombre de fichero de contenido, `id` en `categories.json` y prefijo de los ids de cruce ya escritos en `exerciseStats` del autor.
- **D-40-02:** Esos slugs son el **contrato transversal del milestone** (espejo de D-35-02). Cada uno es a la vez: (a) `id` en `categories.json` (Phase 44, order 15-18), (b) nombre de fichero `content/exercises/<slug>.json`, (c) elemento de `RESET_PREFIXES_V13`, y (d) prefijo de los ids de slot y de cruce multi-cat. Las Phases 41-44 DEBEN usar exactamente estos 4 strings.
- **D-40-03 (no-colisión, verificado 2026-08-03):** Ninguna de las 14 categorías registradas (`avere`, `essere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`, `articoli`, `partitivos`, `presente-regolare`, `dimostrativi`, `possessivi`, `modali`, `riflessivi`) empieza por `fare`, ni ningún slug nuevo es prefijo de una legacy. El filtro `startsWith` preserva las 14 byte a byte. **Matiz propio de v2.0 que no existía en Phase 35:** `fare-indicativo` y `fare-indefiniti` **sí** comparten el prefijo textual `fare-ind` entre sí — es inocuo (ambos se resetean), pero es la razón de D-40-04.

### Predicado del reset

- **D-40-04:** `RESET_PREFIXES_V13` declara los **4 slugs completos**, nunca truncados:
  ```js
  const RESET_PREFIXES_V13 = ['fare-indicativo', 'fare-congiuntivo', 'fare-cond-imperativo', 'fare-indefiniti'];
  ```
  Espejo literal de `RESET_PREFIXES_V12` (que también tiene 4 elementos), con la forma `RESET_PREFIXES_V13.some(p => k.startsWith(p))`. **Rechazado explícitamente** el prefijo paraguas `['fare-']`: sería más corto pero resetearía sin querer cualquier categoría `fare-*` futura — en concreto una eventual `fare-modismi` (perífrasis y modismos están hoy en Out of Scope de REQUIREMENTS.md marcados como "categoría propia si el autor lo echa en falta"). **Rechazado** también el cambio a igualdad exacta (`===`): no barrería los ids de slot (`fare-indicativo-001`), que es justo lo que el reset tiene que limpiar. — **Reversibility:** costly — una vez shippeado v13, el reset ya se habrá ejecutado sobre el state del autor; corregir el predicado después exige un eslabón `13→14` adicional, no una edición local.
- **D-40-05:** El comentario de bloque sobre `RESET_PREFIXES_V13` espeja el de `RESET_PREFIXES_V12` (`src/data/storage.js:1154-1167`) y debe documentar explícitamente: (a) el gate de no-colisión con las 14 legacy verificado en D-40-03, y (b) el solape interno `fare-ind` entre `fare-indicativo` y `fare-indefiniti` y por qué es inocuo. Ese segundo punto es nuevo respecto a Phase 35 y es la trampa de plan-time que señala REQUIREMENTS.md §Mapping rationale.

### Alcance de la fase

- **D-40-06:** Phase 40 **NO toca `content/categories.json`**. Los ficheros modificados son exactamente: `src/data/storage.js`, `src/data/backup.js`, `tests/data-storage.test.js`, `tests/backup.test.js`. Espejo de Phase 35. El registro operativo de cada categoría lo hace su fase de contenido cuando su JSON existe; INT-01 lo cierra y verifica en Phase 44. Registrar las 4 entradas ahora dejaría el home listando 4 categorías vacías durante Phases 41-43 y rompería el guard de coherencia de conteo (`TOTAL_EXPECTED` literal vs `Σ slotCountOf(disco)` = 0, `scripts/run-validation-271.mjs:205-209`). — **Reversibility:** reversible — añadir las entradas más tarde es exactamente el plan de Phase 44.

### Convención de ids de los cruces multi-categoría (vinculante para Phase 44)

- **D-40-07:** Los cruces multi-cat de `fare` (INT-03: `↔ avere` en los compuestos, `↔ modali` en `devo/posso/voglio fare`, `↔ presente-regolare` como contraste irregular-vs-regular) **viven en el fichero de la categoría de `fare`**, su `id` lleva prefijo de `fare` (`fare-indicativo-300`, …) y `categoryIds` es `[<slug de fare>, <slug legacy>]` — la categoría de `fare` PRIMERO. Es la convención literal de v1.9, verificada en disco: `dimostrativi-300 ["dimostrativi","articoli"]`, `possessivi-301 ["possessivi","genero-numero"]`, `riflessivi-300 ["riflessivi","presente-regolare"]`, `modali-300 ["modali","presente-regolare"]`.
  **Por qué se fija AQUÍ y no en Phase 44:** es lo único que hace correcto el reset por prefijo. Un cruce autorado bajo el prefijo de la categoría legacy (p. ej. `avere-400`) quedaría **fuera** de `RESET_PREFIXES_V13` y sobreviviría al reset de `fare`, dejando estado huérfano — un bug que no se manifiesta hasta que el autor falle ese cruce concreto. — **Reversibility:** costly — deshacerlo obliga a re-autorar los ejercicios de cruce y sus ids ya estarán en `exerciseStats` del autor.

### Mecánica de migración (locked by precedent — el planner NO re-litiga)

Heredadas de D-35-04..07 y aplicadas una versión más arriba:

- **D-40-08:** `migrate12to13` hace las 3 operaciones del patrón `migrate11to12`, cada una tras **deep-clone defensivo** (`JSON.parse(JSON.stringify(...))` por sub-dict, anti-prototype-pollution): (1) `delete categoryProgress[slug]` para los 4 slugs en bracket notation, (2) poda de `exerciseStats` conservando solo las claves que NO empiezan por ningún `RESET_PREFIXES_V13`, (3) invalidar `inFlightTest` si `exerciseIds` referencia ids que empiezan por algún prefijo nuevo. Pura (no muta el input), idempotente, y devuelve un root literal fresco `{ schemaVersion: 13, ... }`.
- **D-40-09:** `hydrateV13` espeja `hydrateV12` (`src/data/storage.js:1274`) con la versión a 13: deep-clone + type-guards por sub-objeto, mantiene el guard root (`const p = ...`), y **NO repite la poda** — un state que llega a `hydrateV13` ya viene v13-shaped por la cadena, o es un import directo v13 que debe preservarse íntegro. `CURRENT_SCHEMA_VERSION = 13` en `src/data/storage.js:35` **y** `src/data/backup.js:56` — nunca desincronizados.
- **D-40-10:** El reset es **preventivo / forward-compat** aunque las 4 categorías nazcan sin progreso: hoy es un no-op sobre datos reales, pero cubre el caso de un re-autorado o renumerado futuro que deje estado espurio. Misma justificación que `RESET_PREFIXES_V11` (v1.7) y `RESET_PREFIXES_V12` (v1.9).
- **D-40-11:** `backup.js`: round-trip v13 (export/import), migra import `v12→v13` reusando la cadena (añadir `if (migrated.schemaVersion === 12) migrated = migrate12to13(migrated);` + `migrated = hydrateV13(migrated);` en `src/data/backup.js:144-146`), y **rechaza** wrappers `schemaVersion > 13` con el mensaje existente.

### Alcance / no-scope heredado

- **D-40-12:** Las discrepancias de conteo PREEXISTENTES del reporter VAL-06 (genero-numero, preposiciones) siguen **fuera de scope**, igual que en D-35-08. No se tocan en Phase 40 ni se "arreglan de paso". El gate de v2.0 verifica que las categorías nuevas aporten X=X sin gap, no que el global preexistente esté en 0.

### Claude's Discretion

- Nombres exactos de las funciones de test y estructura de los fixtures (mirror de `tests/data-storage.test.js` y `tests/backup.test.js`), siempre que cubran:
  (a) las 4 nuevas bootan `no-hecha` con racha 0 tras el reset por prefijo;
  (b) las **14** legacy + `songProgress` byte-intactas (fixture de no-regresión con snapshot `deepEqual` pre/post);
  (c) idempotencia + pureza + anti-prototype-pollution de `migrate12to13` y `hydrateV13`;
  (d) backup round-trip v13 + import `v12→v13` aplicando el reset + rechazo `>13`;
  (e) al menos un caso que ejercite el solape `fare-ind` (un id `fare-indicativo-001` y otro `fare-indefiniti-001` en el mismo fixture, ambos reseteados).
- Redacción exacta de los comentarios de bloque, siempre que cumplan D-40-05.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El mirror a copiar (v1.9, patrón exacto — es el ref más importante)
- `.planning/milestones/v1.9-phases/35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-/35-CONTEXT.md` — la fase análoga directa (`11→12`, 4 categorías, mismo reset por prefijo). D-35-01..09 son el precedente literal de D-40-01..12.
- `.planning/milestones/v1.9-phases/35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-/35-01-SUMMARY.md` — cómo se ejecutó y qué se verificó.
- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION` (línea 35), cadena de migración (líneas 161-163), `RESET_PREFIXES_V12` + comentario de bloque (1154-1168), `migrate11to12` (1207-1249), `hydrateV12` (1274-1294). Phase 40 = mirror `12→13` a continuación.
- `src/data/backup.js` — imports de la cadena (línea 26), `CURRENT_SCHEMA_VERSION` espejado (56), rechazo de versión futura (126-130), cadena de import (144-146).
- `tests/data-storage.test.js` — patrón de tests de migración (idempotencia, deep-clone, reset selectivo, no-regresión de las legacy).
- `tests/backup.test.js` — patrón de round-trip + import cross-version + rechazo de versión futura.

### Requisitos y alcance del milestone
- `.planning/REQUIREMENTS.md` — MIG-01 y MIG-02 (definición literal), §Mapping rationale (la trampa del prefijo `fare-ind`), §Out of Scope, §Estado del codebase al fijar el roadmap.
- `.planning/ROADMAP.md` §Phase 40 — Goal + los 4 Success Criteria que la verificación va a comprobar.
- `.planning/todos/pending/fare-paradigma-completo.md` — el documento de diseño FARE-X1 acordado con el autor el 2026-07-27 (eje slot/variante, encaje en `pickVariantIndex`, la categoría como unidad de reset). Contexto del milestone entero; Phase 40 solo consume de él los 4 slugs.

### Convención de cruces (para D-40-07)
- `content/exercises/dimostrativi.json`, `content/exercises/possessivi.json`, `content/exercises/riflessivi.json`, `content/exercises/modali.json` — los 5 cruces multi-cat de v1.9 (`*-300` / `*-301`) que fijan la convención de id y de orden en `categoryIds`.

### Investigación (v1.9 — aplicable por analogía)
- `.planning/research/ARCHITECTURE.md` §migración — ONE bump por milestone (no per-categoría), `RESET_PREFIXES`, espejo storage/backup.
- `.planning/research/PITFALLS.md` — pitfalls de migración: el predicado debe incluir los 4 slugs, cautela con `startsWith`, espejo en `backup.js`, idempotencia.

> **Nota de frescura:** `.planning/research/*` es de **2026-07-01 (v1.9)**. v2.0 **no tiene fase de research** — el autor la saltó a propósito porque el diseño FARE-X1 ya estaba cerrado. Estos dos ficheros valen como referencia de patrón de migración, no como investigación de v2.0.

### Regla de proyecto
- `CLAUDE.md` — stack (web estática, ES modules, localStorage con clave raíz namespaced, `schemaVersion` + migración en boot).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `migrate11to12` + `hydrateV12` + `RESET_PREFIXES_V12` (`src/data/storage.js:1154-1294`): copiar adaptando `11→12` ⇒ `12→13` y el array de prefijos a los 4 slugs de D-40-01. Es el analog funcional **directo** (mismos 3 pasos, mismo número de prefijos: 4).
- La cadena de migración en `src/data/storage.js:161-163`: añadir `if (s.schemaVersion === 12) s = migrate12to13(s);` y cambiar el retorno a `if (s.schemaVersion === 13) return hydrateV13(s);`.
- `src/data/backup.js`: el bloque de imports (línea 26), round-trip / import / rechazo ya versionado — bump espejo a 13.

### Established Patterns
- **Reset selectivo por prefijo `startsWith`** sobre `categoryProgress` (delete por slug) + `exerciseStats` (poda) + `inFlightTest` (invalidación) — repetido en `migrate6to7` (preposiciones), `migrate7to8` (articoli+partitivos), `migrate8to9` (6 cats), `migrate10to11` (1 cat), `migrate11to12` (4 cats).
- **Deep-clone defensivo (JSON round-trip) anti-prototype-pollution** en cada migración e hidratación (T-21-01 / T-29-01 / T-35-01).
- **`CURRENT_SCHEMA_VERSION` espejado en `storage.js` Y `backup.js`** — nunca desincronizar. `backup.js` mantiene su propia constante a propósito, para ser testeable sin importar la de `storage`.
- **`hydrateVN` no re-ejecuta lógica de migración**, solo garantiza shape (precedente `hydrateV11` → `hydrateV12`).

### Integration Points
- Boot: `storage.js` aplica la cadena al cargar de localStorage. No requiere cambios en el motor, screens ni schema-validator.
- `backup.js` import path: la migración cross-version reusa la misma cadena.
- **Nada más se toca.** El gate de cierre de la fase es `git diff src/screens/app.js src/domain/` vacío.

### Estado verificado del codebase (2026-08-03)
- `CURRENT_SCHEMA_VERSION` = **12** en `src/data/storage.js:35` y `src/data/backup.js:56`.
- **14 categorías** registradas en `content/categories.json` (orders 1-14); las 4 de v1.9 llevan `origen: "ia-quorum"`, las 10 legacy lo tienen ausente (PROV-02).
- Suite en verde: `node --test tests/*.test.js` → **672 pass / 0 fail**. Ese es el baseline contra el que se mide "sin fails nuevos".

</code_context>

<specifics>
## Specific Ideas

- El contrato de slugs (D-40-01/02) es lo único de esta fase que condiciona a las demás: documentarlo en el comentario de `RESET_PREFIXES_V13` como espejo del de `RESET_PREFIXES_V12`, **añadiendo** el párrafo nuevo sobre el solape interno `fare-ind` (D-40-05).
- D-40-07 (convención de ids de cruce) es una decisión tomada en Phase 40 pero **ejecutada en Phase 44**. El planner debe dejarla escrita donde Phase 44 la vea — el comentario de `RESET_PREFIXES_V13` es el sitio natural, porque ahí es donde importa por qué.
- El fixture de no-regresión debe cubrir **14** categorías legacy, no 10 — Phase 35 verificaba 10; las 4 de v1.9 ya son legacy para v2.0.

</specifics>

<deferred>
## Deferred Ideas

- **Partir `fare-indicativo` en semplici/composti** — riesgo asumido y documentado en REQUIREMENTS.md §Future (la categoría mezcla *presente* diario con *trapassato remoto* extinto en la misma unidad de reset). Si se atasca en el uso real, es barato y hay precedente (`260614-hxn`). No afecta a Phase 40 más que en el hecho de que un split futuro exigiría su propio eslabón de migración.
- **Una futura categoría `fare-modismi`** (perífrasis y modismos: `fare la spesa`, `fa freddo`, `farcela`, causativo) — hoy Out of Scope explícito. Es la razón concreta por la que D-40-04 rechaza el prefijo paraguas `'fare-'`.
- **Arreglar las discrepancias de conteo VAL-06 preexistentes** (genero-numero, preposiciones) — fuera de scope desde v1.9 (D-35-08), sigue fuera (D-40-12).

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, minor, score 0.9) — falso positivo del matcher: puntuó alto por palabras basura (`del`, `phase`), pero es CSS responsive, ajeno a una migración de `state`. Ya se descartó igual en Phase 35. Pertenece al backlog "responsive móvil".
- **"decoyBank.pos con varias categorías por token"** (`area: content-pipeline`, minor, score 0.6) — DECOY-X1, pipeline de canciones. Sin relación con la cadena de migración; el autor ya decidió aceptar el `disputed` (opción A, 2026-07-27) hasta que el patrón reaparezca.
- **"FARE-X1 — paradigma completo del verbo `fare`"** (`area: content`, feature, score 0.6) — es el documento de diseño del milestone **entero**, no un todo consumible por Phase 40. Registrado como canonical ref; se cierra cuando cierre v2.0, no aquí.

</deferred>

---

*Phase: 40-Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`)*
*Context gathered: 2026-08-03*
