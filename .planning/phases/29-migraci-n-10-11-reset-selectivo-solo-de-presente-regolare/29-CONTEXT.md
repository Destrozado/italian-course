# Phase 29: Migración `10→11` (reset selectivo SOLO de `presente-regolare`) - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase entrega la capa de persistencia/migración que deja el state listo para que nazca la 10ª categoría (`presente-regolare`): `migrate10to11` + `hydrateV11` + bump de `CURRENT_SCHEMA_VERSION` a 11 (espejo en `storage.js` y `backup.js`), con reset selectivo por prefijo de la categoría nueva y forward-compat de backup (round-trip v11, import v10→v11 aplicando el reset, rechazo de `>11`). Cubre MIG-05 y MIG-06.

**Brownfield puro:** el motor v1.4 (cascada D-54, sampler por slot, slot-engine, render) NO se toca. Solo se añade un eslabón a la cadena de migración existente. Esta fase NO autora contenido (eso es Phase 30) ni toca counts/smoke (eso es Phase 31).

</domain>

<decisions>
## Implementation Decisions

### Forma de la migración
- **D-29-01:** Hacer una **migración real con reset preventivo** (NO un bump nominal ni "sin migración"). Aunque `presente-regolare` es una categoría nueva — ningún state actual tiene progreso bajo ese prefijo y añadir contenido no cambia el shape del state, por lo que el reset es **hoy un no-op** — se mantiene la simetría con el patrón v1.5/v1.6 y se cubre forward-compat: el import de un backup futuro que ya contenga progreso de `presente-regolare` (p. ej. tras re-autorar/renumerar slots) queda reseteado limpiamente. Decisión del autor 2026-06-16.

### Target de versión (cerrado por roadmapping)
- **D-29-02:** La migración va **`10→11`**, NO `9→10`. El codebase YA está en `CURRENT_SCHEMA_VERSION = 10` (`src/data/storage.js:35`, `src/data/backup.js:49`) por el quick task `260615-nzi` (contador `vecesFallada`), que añadió `migrate9to10`/`hydrateV10`. Los IDs de requisito MIG-05/06 (que dicen `9→10`) se mantienen; solo cambia el número de schema target. **Verificar `CURRENT_SCHEMA_VERSION` en el código en plan-time antes de hardcodear** (no fiarse del número en docs).

### Patrón de implementación (convención lockeada v1.5/v1.6)
- **D-29-03:** `migrate10to11` es un **espejo casi literal de `migrate8to9`** (`storage.js:851`), con UNA desviación: el reset opera sobre UN solo prefijo (`presente-regolare`) en vez de seis. Reset por **prefijo** (`startsWith`), no por igualdad exacta — cubre tanto ids legacy como ids de slot que produzca Phase 30. Pasos: (1) `delete categoryProgress['presente-regolare']` tras deep-clone; (2) podar `exerciseStats` por prefijo; (3) invalidar `inFlightTest` si referencia ids con ese prefijo.
- **D-29-04:** Definir una constante `RESET_PREFIXES_V11 = ['presente-regolare']` (espejo de `RESET_PREFIXES_V9`) con el comentario del **gate de colisión de prefijo** verificado (ver code_context). Idempotente + puro: NO mutar el input; re-ejecutar sobre un v11 ya migrado es no-op. Deep-clone defensivo anti-prototype-pollution (`JSON.parse(JSON.stringify(...))`) en cada sub-objeto.
- **D-29-05:** `hydrateV11` es espejo literal de `hydrateV10` (`storage.js`) con la versión a 11 — el shape root v11 es **idéntico** a v10 (bump nominal a nivel de shape; la diferencia efectiva la hace `migrate10to11` en la cadena). `hydrateV11` NO repite la poda de la migración (un state que llega a hydrate ya viene v11-shaped o es un import directo a preservar). Encadenar en el dispatcher: `if (s.schemaVersion === 10) s = migrate10to11(s); if (s.schemaVersion === 11) return hydrateV11(s);`.
- **D-29-06:** `backup.js` bumpea `CURRENT_SCHEMA_VERSION` a 11 en espejo (mantener la independencia documentada en `backup.js:29`), soporta round-trip v11, import v10→v11 (aplicando el reset selectivo vía la cadena de `storage.js`), y rechaza wrappers con `schemaVersion > 11` (patrón `backup.js:119`).

### Verificación (qué debe ser cierto)
- **D-29-07:** Test con fixture que demuestre: (a) las 9 categorías de gramática existentes + `songProgress` quedan **byte-intactas** tras migrar; (b) un state con progreso ficticio bajo `presente-regolare` queda reseteado; (c) idempotencia (re-ejecutar = misma shape); (d) la app arranca limpia sobre el state migrado y la suite baseline sigue verde. Espejo de los tests de la cadena v9 (Phase 21).

### Claude's Discretion
- Número exacto y nombres de los tests nuevos, organización del fixture, y si reutiliza el fixture de 9 categorías existente o lo extiende — el planner/executor decide siguiendo el precedente de Phase 21 (`21-01-PLAN.md`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Patrón de migración (análogos directos)
- `.planning/milestones/v1.6-phases/21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as/21-01-PLAN.md` — el plan de la migración análoga `8→9` (reset selectivo de 6 categorías); plantilla directa de tareas/tests para Phase 29.
- `.planning/milestones/v1.6-phases/21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as/21-VERIFICATION.md` — qué se verificó en la migración análoga (must-haves).
- `src/data/storage.js` §`migrate8to9` (línea ~851) + §`RESET_PREFIXES_V9` (~826) + §`hydrateV9`/`hydrateV10` + dispatcher de cadena (~155-165) — código fuente a espejar.
- `src/data/backup.js` §`CURRENT_SCHEMA_VERSION` (49) + chequeo de rechazo `>N` (119) — espejo del bump y forward-compat.

### Requisitos y roadmap
- `.planning/REQUIREMENTS.md` §Migración (MIG-05, MIG-06) + la **nota de implementación** sobre la discrepancia `9→10` vs `10→11`.
- `.planning/ROADMAP.md` §Phase 29 — goal + success criteria + nota de numeración.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `migrate8to9` (`storage.js:851`): espejo literal a copiar, cambiando 6 prefijos → 1 (`presente-regolare`).
- `RESET_PREFIXES_V9` (`storage.js:826`): patrón de la constante + comentario del gate de colisión.
- `hydrateV10` (`storage.js`): shape root a replicar en `hydrateV11` (campos: `schemaVersion`, `exerciseStats`, `categoryProgress`, `dailyLog`, `songProgress`, `lastBackupAt`, `firstUsedAt`, `inFlightTest`).
- Cadena de migración en el dispatcher de `storage.js` (~155-165): añadir un eslabón `10→11`.
- `backup.js` round-trip + reject `>N` (líneas 49, 119): patrón forward-compat.

### Established Patterns
- **Reset por prefijo `startsWith`, no por igualdad** (cubre ids legacy + ids de slot futuros).
- **Idempotencia + pureza** (no mutar input; re-ejecutar es no-op) — T-21-02.
- **Deep-clone defensivo anti-prototype-pollution** en cada sub-objeto — T-21-01.
- **`hydrateVN` NO repite la poda de `migrateN-1toN`** — solo garantiza shape.
- **Bump espejo en `storage.js` + `backup.js`** manteniendo su independencia.

### Integration Points
- **Gate de colisión de prefijo (VERIFICADO 2026-06-16):** `presente-regolare` NO colisiona — ninguno de los 9 slugs existentes (`avere`, `essere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`, `articoli`, `partitivos`) empieza por `presente-regolare` ni es prefijo suyo. El filtro `startsWith` no tiene colisiones y preserva las 9 byte a byte.
- La aparición real de la categoría nueva en el state (regresión hecha→no-hecha al detectar ejercicios nuevos) la maneja `applyNewExerciseRegression` (DOMAIN-06) en boot — NO es responsabilidad de esta migración.

</code_context>

<specifics>
## Specific Ideas

El autor priorizó **consistencia y defensa forward-compat** sobre minimalismo: aun sabiendo que el reset es hoy un no-op, prefiere mantener el patrón probado de v1.5/v1.6 para no romper la simetría de la cadena de migración.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (El alta de contenido es Phase 30; los cruces multi-cat + sync de counts/smoke son Phase 31.)

</deferred>

---

*Phase: 29-migraci-n-10-11-reset-selectivo-solo-de-presente-regolare*
*Context gathered: 2026-06-16*
