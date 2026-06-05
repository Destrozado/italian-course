# Phase 18: Migración `7→8` (reset selectivo articoli + partitivos) - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Una **migración de datos pura** que clona el patrón validado `migrate6to7` (plan 17-01) para llevar el state de `schemaVersion 7 → 8`, reseteando el progreso de **DOS** categorías a la vez (`articoli` + `partitivos`) y dejando las otras 7 byte-intactas. Cubre MIG-01 (`migrate7to8`/`hydrateV8` + reset) y MIG-02 (`backup.js` round-trip v8).

**NO toca** el contenido (los JSON de articoli/partitivos se reagrupan a slots en Phases 19/20), ni el motor de examen, ni el sampler, ni la cascada D-54. Es la fase que va PRIMERA porque la renumeración de ids de las fases de contenido no se puede hacer con progreso vivo.

</domain>

<decisions>
## Implementation Decisions

### A) Estado transitorio entre Phase 18 y 19/20
- **D-01:** Phase 18 es **shippeable sola, SIN guard ni copy especial**. Tras la migración, articoli/partitivos quedan con progreso reseteado (racha 0) pero contenido VIEJO (slots-de-1 vía `normalizeExerciseToSlot`) hasta que 19/20 los conviertan. Re-hacerlas con contenido viejo es re-verificación inofensiva, coherente con el Core Value. Sin banner "categoría en conversión" — sería scope creep y UI nueva; además el autor es único usuario y sabe que está convirtiendo. Precedente: en v1.4 el transitorio existió entre plans (17-01 → 17-02/03) sin guard.

### B) Granularidad del reset
- **D-02:** Reset **por prefijo de id de categoría**: `articoli*` + `partitivos*`. Wipe completo de ambas — `delete categoryProgress.articoli` + `delete categoryProgress.partitivos`; filtro de `exerciseStats` que descarta claves con prefijo `articoli` o `partitivos`; invalidación de `inFlightTest` si ALGÚN `exerciseId` empieza por cualquiera de los dos prefijos. Reset = racha 0 + dominada perdida + veces-hechas 0 (precedente PILOT-04).
- **D-03:** Seguridad de prefijo verificada: ninguna de las otras 7 categorías (`avere`, `essere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`) empieza por `articoli` ni `partitivos` → el filtro por prefijo no tiene colisiones. (Nota: el id de la categoría partitivos es `partitivos`, en español, aunque el display sea "Partitivi".)

### C) Rigor del test de no-regresión
- **D-04:** Test riguroso: un **fixture con progreso en las 9 categorías** → `migrate7to8` → aserción de que (a) articoli + partitivos quedan borradas de categoryProgress y exerciseStats, y (b) las **7 restantes** mantienen `categoryProgress` + `exerciseStats` **idénticos byte a byte** (deep-equal pre/post). Más riguroso que el "avere snapshot" de v1.4 (que solo cubría 1 categoría), cuesta 1 fixture.

### D) Backup v8
- **D-05:** Igual que v1.4: `CURRENT_SCHEMA_VERSION → 8` en `storage.js` y `backup.js` (espejo); `parseBackupFile` migra hasta v8 (importar un backup v7 corre `migrate7to8` → resetea ambas categorías); backups con `schemaVersion > 8` se rechazan (forward-compat). Round-trip v8 (export v8 reimportable).
- **D-06:** Importar un backup viejo (v7 o anterior) que CONTENGA progreso de articoli/partitivos → ese progreso **se pierde por diseño** (la migración lo resetea). Comportamiento consistente con PILOT-04 (importar pre-reset de Preposiciones perdía su progreso). Aceptado.

### Claude's Discretion
- Estructura interna exacta de `migrate7to8`/`hydrateV8` (espejo literal de `migrate6to7`/`hydrateV7`): el planner/executor la deriva del precedente. `hydrateV8` NO repite la poda — solo garantiza shape (igual que `hydrateV7` vs `migrate6to7`).
- Número y desglose de tests nuevos más allá del fixture de no-regresión de D-04 (idempotencia, anti-prototype-pollution, round-trip backup) — clonados del set de `migrate6to7`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Patrón a clonar (el más importante)
- `src/data/storage.js` — `migrate6to7` (líneas ~604), `hydrateV7` (~666), `CURRENT_SCHEMA_VERSION` (línea 35), cadena `migrate()` (líneas 138-147). `migrate7to8` es un espejo de `migrate6to7` con 2 prefijos en vez de 1.
- `.planning/milestones/v1.4-phases/17-piloto-preposiciones-contenido/17-01-SUMMARY.md` — el plan que estableció el patrón de reset selectivo (D-17-08). Decisiones y desviaciones documentadas.
- `src/data/backup.js` — `parseBackupFile` / `buildBackupWrapper`, `CURRENT_SCHEMA_VERSION` espejo. Patrón round-trip a extender a v8.
- `tests/data-storage.test.js` — tests de `migrate6to7` (idempotencia, reset selectivo, no-mutación de otras categorías, anti-prototype-pollution) a clonar para v8.

### Requirements
- `.planning/REQUIREMENTS.md` §MIG-01, §MIG-02 — alcance de la migración y del backup.
- `.planning/ROADMAP.md` §Phase 18 — goal + success criteria.

### Contexto del modelo de datos (heredado v1.4)
- `src/data/schema-validator.js` — `normalizeExerciseToSlot` (por qué articoli/partitivos siguen cargando como slots-de-1 tras el reset, antes de convertirlas).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `migrate6to7` / `hydrateV7` (`src/data/storage.js`): plantilla literal — copiar, renombrar a `7to8`/`V8`, cambiar el filtro de 1 prefijo (`preposiciones`) a 2 (`articoli` || `partitivos`).
- Deep-clone defensivo `JSON.parse(JSON.stringify(...))` por sub-dict (anti-prototype-pollution, CR-03) — ya presente en toda la cadena de migraciones.
- `parseBackupFile` / `buildBackupWrapper` (`src/data/backup.js`): pipeline de round-trip; solo cambia el número de versión a 8.

### Established Patterns
- **Bump nominal de schemaVersion** (5→6, 6→7): sin sub-árbol nuevo, solo poda. 7→8 sigue el mismo molde.
- **`migrateNtoM` hace la poda; `hydrateVN` es espejo SIN poda** (solo garantiza shape) — la poda es responsabilidad del paso de migración durante la cadena.
- **Reset por prefijo de id** cubre ids legacy y futuros de slot (clave: tras 19/20 los ids de articoli/partitivos seguirán empezando por esos prefijos).

### Integration Points
- `migrate()` chain en `storage.js` (líneas 138-147): añadir `if (s.schemaVersion === 7) s = migrate7to8(s);` y `if (s.schemaVersion === 8) return hydrateV8(s);`.
- `CURRENT_SCHEMA_VERSION` en `storage.js` (35) y `backup.js` (espejo) → 8.
- `blankState` v8.

</code_context>

<specifics>
## Specific Ideas

- El patrón objetivo es literalmente el plan **17-01** (migrate6to7). La única desviación funcional: el filtro de reset opera sobre DOS prefijos en vez de uno.
- Test de no-regresión más fuerte que v1.4: fixture con progreso en las 9 categorías, aserción de byte-igualdad de las 7 no afectadas.

</specifics>

<deferred>
## Deferred Ideas

- Banner/copy "categoría en conversión" para el estado transitorio — descartado (D-01), no se añade UI.
- La reagrupación de contenido a slots de articoli (Phase 19) y partitivos (Phase 20) — fuera de Phase 18; esta fase solo migra el state.

None más — discusión dentro del scope de la fase.

</deferred>

---

*Phase: 18-migraci-n-7-8-reset-selectivo-articoli-partitivos*
*Context gathered: 2026-06-04*
