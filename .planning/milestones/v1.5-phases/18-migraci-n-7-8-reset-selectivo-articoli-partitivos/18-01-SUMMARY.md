---
phase: 18-migraci-n-7-8-reset-selectivo-articoli-partitivos
plan: 01
subsystem: data/migration
tags: [migration, schemaVersion, reset-selectivo, backup, tdd, articoli, partitivos]
requires:
  - "schemaVersion 7 (migrate6to7/hydrateV7, Phase 17)"
  - "patrón migrateNtoM/hydrateVN + deep-clone defensivo (toda la cadena)"
provides:
  - "migrate7to8 (reset selectivo articoli+partitivos) + hydrateV8 (espejo sin poda)"
  - "CURRENT_SCHEMA_VERSION = 8 en storage.js y backup.js (espejo coherente)"
  - "backup.js round-trip v8 + import v7→v8 con reset + rechazo >8"
affects:
  - "Phases 19/20 (renumeración de ids de articoli/partitivos — ahora posible sin progreso vivo)"
tech-stack:
  added: []
  patterns:
    - "migrateNtoM hace la poda; hydrateVN es espejo SIN poda (solo type-guards de shape)"
    - "reset por prefijo de id (startsWith) — cubre ids legacy y futuros de slot"
    - "deep-clone defensivo JSON.parse(JSON.stringify(...)) por sub-dict (anti-prototype-pollution)"
    - "espejo inline de CURRENT_SCHEMA_VERSION en backup.js (sin importar de storage.js)"
key-files:
  created: []
  modified:
    - "src/data/storage.js (migrate7to8 + hydrateV8 + bump constante + eslabón en migrate() + JSDoc)"
    - "src/data/backup.js (bump espejo + import + eslabón en parseBackupFile + JSDoc)"
    - "tests/data-storage.test.js (describe v8 con 13 tests + helper v7WithArticoliPartitivos + sync blankState)"
    - "tests/backup.test.js (describe v8 round-trip + sync de asserts de versión + forward-compat 8→9)"
decisions:
  - "D-02/D-03: reset por prefijo de DOS categorías (articoli + partitivos); las otras 7 no colisionan con el filtro startsWith"
  - "D-04: test de no-regresión reforzado con fixture de 9 categorías — las 7 preservadas deep-equal byte a byte"
  - "D-05/D-06: backup v8 round-trip; import v7→v8 resetea articoli/partitivos (progreso de backup viejo se pierde por diseño); >8 rechazado"
  - "Sync de asserts pre-existentes 7→8 (blankState + round-trip v7) como consecuencia directa del bump (precedente 17-01 deviation 1)"
metrics:
  duration: "~12 min"
  completed: "2026-06-04"
  tasks: 2
  files_modified: 4
  tests_total: 358
---

# Phase 18 Plan 01: Migración `7→8` (reset selectivo articoli + partitivos) Summary

Clon literal del patrón validado `migrate6to7`/`hydrateV7` (plan 17-01) que lleva el state de `schemaVersion 7 → 8` reseteando el progreso de DOS categorías (`articoli` + `partitivos`) por prefijo de id, dejando las otras 7 byte-intactas, y extiende `backup.js` al round-trip v8 — desbloquea la renumeración de ids de contenido de las Phases 19/20.

## Qué se construyó

- **`migrate7to8(v7)`** en `src/data/storage.js`: espejo de `migrate6to7` con la única desviación funcional de DOS prefijos en vez de uno — (1) `delete categoryProgress.articoli` + `delete categoryProgress.partitivos`; (2) filtro de `exerciseStats` que descarta claves con prefijo `articoli` o `partitivos`; (3) invalidación de `inFlightTest` si algún `exerciseId` empieza por cualquiera de los dos prefijos. Deep-clone defensivo por sub-dict (puro, idempotente, anti-prototype-pollution).
- **`hydrateV8(parsed)`**: espejo de `hydrateV7` con `schemaVersion: 8`, SIN poda (solo type-guards de shape).
- **`CURRENT_SCHEMA_VERSION = 8`** en `storage.js` (línea 35) y `backup.js` (espejo inline, línea 42).
- **Cadena `migrate()`**: eslabón `if (s.schemaVersion === 7) s = migrate7to8(s);` + `if (s.schemaVersion === 8) return hydrateV8(s);` antes del terminal anterior (`hydrateV7` deja de ser terminal, se conserva exportado por backward-compat).
- **`backup.js parseBackupFile`**: eslabón `if (migrated.schemaVersion === 7) migrated = migrate7to8(migrated);` + hydrate final a `hydrateV8`. El reject forward-compat (`>8`) y `buildBackupWrapper` cubren v8 automáticamente al bumpear la constante (sin cambio de código).
- **Tests v8** en ambos archivos: 13 tests de migración (reset selectivo, idempotencia, pureza, anti-prototype-pollution, inFlightTest, hydrateV8, cadena) + test reforzado D-04 (fixture 9 categorías, las 7 preservadas byte-idénticas) + round-trip v8 + import v7→v8 con reset.

## Cómo se verificó

- TDD estricto: commit `test` (RED) antes de commit `feat` (GREEN) en cada tarea.
- `node --test tests/*.test.js`: **358/358 pass, 0 fail** (baseline 342 + 16 nuevos tests v8).
- `grep "export function migrate7to8"` y `"export function hydrateV8"` en `storage.js`: presentes.
- `CURRENT_SCHEMA_VERSION = 8` en `storage.js` Y `backup.js` (espejo coherente, verificado ignorando comentarios).
- Test de no-regresión D-04 verde: `articoli`+`partitivos` ausentes de ambos dicts; las 7 restantes `assert.deepEqual` byte a byte pre/post.

## Decisiones y desviaciones del plan

### Cambios sincronizados (consecuencia directa del bump — precedente 17-01 deviation 1)

**1. [Rule 3 - Blocking] Sync de asserts `blankState()` pre-existentes 7→8**
- **Encontrado en:** Task 1 (GREEN) — tras bumpear `blankState()` a 8, 3 asserts pre-existentes que esperaban `schemaVersion === 7` fallaban.
- **Fix:** Sincronizados a 8 los asserts de `blankState()` en `tests/data-storage.test.js` (describe "blankState v8") y `tests/backup.test.js` (línea ~93). Nombres/comentarios actualizados a "shape v8 / Phase 18".
- **Por qué:** el plan lo autoriza explícitamente ("Si algún test existente de blankState asume schemaVersion 7, sincronizar a 8"); es consecuencia directa y esperada del bump nominal, no un cambio funcional.

**2. [Rule 3 - Blocking] Sync del bloque round-trip v7 pre-existente en `backup.test.js`**
- **Encontrado en:** Task 2 (GREEN) — el bloque `round-trip v7` (Phase 17) asertaba `r.state.schemaVersion === 7` y la preservación de `partitivos-001`. Tras CURRENT=8, un backup v7 ya NO es current-version: importarlo migra v7→v8 (sale 8) y resetea `partitivos`.
- **Fix:** línea 240 actualizada a `=== 8`; el assert de preservación de `partitivos-001` cambiado a `=== undefined` (ahora se poda en el import v7→v8), con comentario explicativo. El plan listó las líneas 240/277 para sync; el ajuste del assert de partitivos es la consecuencia lógica del reset selectivo aplicado al import (D-06).
- **Por qué:** comportamiento esperado y documentado (D-06: el progreso de articoli/partitivos en un backup viejo se pierde por diseño).

No hubo desviaciones funcionales sobre el plan: `migrate7to8`/`hydrateV8` son el clon literal especificado, con la única desviación de DOS prefijos ya prevista en el plan.

## Notas técnicas

- `hydrateV7` queda importado en `backup.js` pero ya no referenciado por la cadena (terminada en `hydrateV8`); se mantiene por backward-compat según instrucción explícita del plan. Proyecto zero-deps sin lint step, sin impacto.
- `normalizeExerciseToSlot` vive en `src/data/content-loader.js` (no en `schema-validator.js`) — read-only, no tocado. Tras Phase 18 articoli/partitivos quedan con progreso reseteado pero contenido viejo (slots-de-1) hasta que 19/20 los conviertan (D-01, sin guard/banner).

## Self-Check: PASSED

- FOUND: src/data/storage.js (`export function migrate7to8`, `export function hydrateV8`, `CURRENT_SCHEMA_VERSION = 8`)
- FOUND: src/data/backup.js (`migrate7to8`, `hydrateV8`, `CURRENT_SCHEMA_VERSION = 8`)
- FOUND commit 465afc1 (test Task 1 RED)
- FOUND commit 39fc7e8 (feat Task 1 GREEN)
- FOUND commit 9e460d5 (test Task 2 RED)
- FOUND commit b5380e5 (feat Task 2 GREEN)
- Suite completa: 358/358 pass, 0 fail.

## TDD Gate Compliance

Ambas tareas siguen el ciclo RED→GREEN con commits separados:
- Task 1: `test(18-01)` 465afc1 (RED, suite falla por imports inexistentes) → `feat(18-01)` 39fc7e8 (GREEN, 59/59).
- Task 2: `test(18-01)` 9e460d5 (RED, 8 fails por cadena terminada en v7) → `feat(18-01)` b5380e5 (GREEN, 37/37 + suite 358/358).
No se observó RED pasando inesperadamente. Gate cumplido.
