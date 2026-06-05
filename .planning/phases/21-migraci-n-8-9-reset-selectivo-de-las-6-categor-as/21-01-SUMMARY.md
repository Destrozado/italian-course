---
phase: 21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as
plan: 01
subsystem: data/migration
tags: [migration, schemaVersion, reset-selectivo, backup, tdd, las-6-categorias]
requires:
  - "schemaVersion 8 (migrate7to8/hydrateV8, Phase 18)"
  - "patrón migrateNtoM/hydrateVN + deep-clone defensivo (toda la cadena)"
provides:
  - "migrate8to9 (reset selectivo de las 6 categorías) + hydrateV9 (espejo sin poda)"
  - "CURRENT_SCHEMA_VERSION = 9 en storage.js y backup.js (espejo coherente)"
  - "backup.js round-trip v9 + import v8→v9 con reset + rechazo >9"
affects:
  - "Phases 22-27 (renumeración de ids de avere/essere/verbos-movimiento/genero-numero/profesiones/sustantivos-irregulares — ahora posible sin progreso vivo)"
tech-stack:
  added: []
  patterns:
    - "migrateNtoM hace la poda; hydrateVN es espejo SIN poda (solo type-guards de shape)"
    - "reset por prefijo de id (startsWith) sobre 6 prefijos vía RESET_PREFIXES_V9 + some() — cubre ids legacy y futuros de slot"
    - "deep-clone defensivo JSON.parse(JSON.stringify(...)) por sub-dict (anti-prototype-pollution)"
    - "espejo inline de CURRENT_SCHEMA_VERSION en backup.js (sin importar de storage.js)"
key-files:
  created: []
  modified:
    - "src/data/storage.js (migrate8to9 + hydrateV9 + RESET_PREFIXES_V9 + bump constante + eslabón en migrate() + JSDoc)"
    - "src/data/backup.js (bump espejo + import + eslabón en parseBackupFile + JSDoc)"
    - "tests/data-storage.test.js (describe v9 con 13 tests + helper v8WithSixCategories + sync blankState)"
    - "tests/backup.test.js (describe v9 round-trip + sync de asserts de versión + forward-compat 9→10 + sync HI-01/ME-04 a categoría ficticia)"
decisions:
  - "D-21: reset por prefijo de SEIS categorías (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) vía const RESET_PREFIXES_V9 + some(startsWith); las 3 ya convertidas (preposiciones, articoli, partitivos) no colisionan con el filtro"
  - "RESET_PREFIXES_V9 + some() en vez de encadenar 6 condiciones — equivalente funcional, más legible (recomendado por el plan)"
  - "test de no-regresión con fixture de 9 categorías — las 3 preservadas deep-equal byte a byte"
  - "backup v9 round-trip; import v8→v9 resetea las 6 (progreso de backup viejo se pierde por diseño); >9 rechazado"
  - "Sync de tests HI-01/ME-04 a categoría ficticia test-cat (no colisiona con NINGÚN prefijo de reset de la cadena completa) — antes usaban avere, ahora reseteada"
metrics:
  duration: "~18 min"
  completed: "2026-06-05"
  tasks: 2
  files_modified: 4
  tests_total: 374
---

# Phase 21 Plan 01: Migración `8→9` (reset selectivo de las 6 categorías) Summary

Clon literal del patrón validado `migrate7to8`/`hydrateV8` (plan 18-01) que lleva el state de `schemaVersion 8 → 9` reseteando el progreso de SEIS categorías (`avere`, `essere`, `verbos-movimiento`, `genero-numero`, `profesiones`, `sustantivos-irregulares`) por prefijo de id, dejando las 3 ya convertidas (`preposiciones`, `articoli`, `partitivos`) byte-intactas, y extiende `backup.js` al round-trip v9 — desbloquea la renumeración de ids de contenido de las Phases 22-27.

## Qué se construyó

- **`migrate8to9(v8)`** en `src/data/storage.js`: espejo de `migrate7to8` con la única desviación funcional de SEIS prefijos en vez de dos — (1) seis `delete` de `categoryProgress` (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares); (2) filtro de `exerciseStats` que descarta claves con cualquiera de los 6 prefijos vía `const RESET_PREFIXES_V9 = [...]` + `some(p => k.startsWith(p))`; (3) invalidación de `inFlightTest` si algún `exerciseId` empieza por cualquiera de los 6 prefijos. Deep-clone defensivo por sub-dict (puro, idempotente, anti-prototype-pollution).
- **`hydrateV9(parsed)`**: espejo de `hydrateV8` con `schemaVersion: 9`, SIN poda (solo type-guards de shape).
- **`RESET_PREFIXES_V9`**: const enumerando los 6 prefijos, con JSDoc del gate de colisión (las 3 preservadas no empiezan por ninguno; ningún prefijo de reset es prefijo de otro slug — verificado contra `content/categories.json`).
- **`CURRENT_SCHEMA_VERSION = 9`** en `storage.js` (línea 35) y `backup.js` (espejo inline, línea 42).
- **Cadena `migrate()`**: eslabón `if (s.schemaVersion === 8) s = migrate8to9(s);` + `if (s.schemaVersion === 9) return hydrateV9(s);` antes del terminal anterior (`hydrateV8` deja de ser terminal, se conserva exportado por backward-compat).
- **`backup.js parseBackupFile`**: eslabón `if (migrated.schemaVersion === 8) migrated = migrate8to9(migrated);` + hydrate final a `hydrateV9`. El reject forward-compat (`>9`) y `buildBackupWrapper` cubren v9 automáticamente al bumpear la constante (sin cambio de código).
- **Tests v9** en ambos archivos: 13 tests de migración (reset selectivo de 6, idempotencia, pureza, anti-prototype-pollution, inFlightTest, hydrateV9, cadena) + test reforzado de no-regresión (fixture 9 categorías, las 3 preservadas byte-idénticas) + round-trip v9 + import v8→v9 con reset.

## Cómo se verificó

- TDD estricto: commit `test` (RED) antes de commit `feat` (GREEN) en cada tarea.
- `node --test tests/*.test.js`: **374/374 pass, 0 fail** (baseline 358 + 16 nuevos tests v9).
- `grep "export function migrate8to9"` y `"export function hydrateV9"` en `storage.js`: presentes.
- `CURRENT_SCHEMA_VERSION = 9` en `storage.js` Y `backup.js` (espejo coherente, verificado ignorando comentarios).
- Test de no-regresión verde: las 6 ausentes de ambos dicts; `preposiciones`+`articoli`+`partitivos` `assert.deepEqual` byte a byte pre/post.
- Verificación automatizada de ambas tareas (`<automated>` del plan): OK en las dos.

## Decisiones y desviaciones del plan

### Cambios sincronizados (consecuencia directa del bump y del reset — Rule 3)

**1. [Rule 3 - Blocking] Sync de asserts `blankState()` pre-existentes 8→9**
- **Encontrado en:** Task 1 (RED) — tras bumpear `blankState()` a 9, asserts pre-existentes que esperaban `schemaVersion === 8` fallarían.
- **Fix:** Sincronizados a 9 los asserts de `blankState()` en `tests/data-storage.test.js` (describe "blankState v9") y `tests/backup.test.js` (Test 4). Nombres/comentarios actualizados a "shape v9 / Phase 21".
- **Por qué:** el plan lo autoriza explícitamente; consecuencia directa del bump nominal, no un cambio funcional.

**2. [Rule 3 - Blocking] Sync del bloque round-trip v7/v8 pre-existente en `backup.test.js`**
- **Encontrado en:** Task 2 (GREEN) — los bloques `round-trip v7` (Phase 17) y `round-trip v8` (Phase 18) asertaban `avere`/`essere` preservados y `r.state.schemaVersion === 8`. Tras CURRENT=9, un backup v7/v8 ya NO es current-version: importarlo migra hasta v9 (sale 9) y resetea `avere`/`essere` (ahora entre las 6).
- **Fix:** asserts de versión `=== 8` → `=== 9`; los asserts de preservación de `avere`/`essere` invertidos a `=== undefined` (ahora se podan por `migrate8to9` en la cadena), con comentarios explicativos. `partitivos` en el round-trip v7 se poda por `migrate7to8` (era reseteada de v8); documentado que un backup v8+ sí la preservaría.
- **Por qué:** comportamiento esperado del reset selectivo aplicado al import (D-21: el progreso de las 6 en un backup viejo se pierde por diseño).

**3. [Rule 3 - Blocking] Sync de tests HI-01 (regression) y ME-04 (reap) a categoría ficticia `test-cat`**
- **Encontrado en:** Task 2 (GREEN) — 4 tests pre-existentes (`commitImport re-corre applyNewExerciseRegression` ×2 + `reapa huérfanos` ×2) usaban `avere` como categoría de prueba para verificar la lógica de regression/reap, NO la migración. Tras CURRENT=9, `avere` se poda en `parseBackupFile` (entra en las 6) → `finalState.categoryProgress.avere` queda `undefined` → `TypeError: Cannot read properties of undefined`.
- **Fix:** cambiada la categoría de prueba `avere` → categoría ficticia `test-cat` en los 4 tests. `test-cat` NO colisiona con NINGÚN prefijo de reset de la cadena completa (migrate6to7 poda `preposiciones`, migrate7to8 poda `articoli`/`partitivos`, migrate8to9 poda las 6) → sobrevive la migración v3→v9 intacta y el test ejerce solo su lógica objetivo. Los ids de ejercicio (`a1`/`a2`/`x1`/`ghost-*`) ya eran neutros.
- **Por qué:** preservar la intención de los tests (regression/reap) sin que la migración interfiera. Las 9 categorías reales son podadas en algún eslabón de la cadena, así que ninguna sirve como "categoría estable" — una ficticia neutra es la elección correcta y mínima.

No hubo desviaciones funcionales sobre el plan: `migrate8to9`/`hydrateV9` son el clon literal especificado, con la única desviación de SEIS prefijos ya prevista en el plan.

## Notas técnicas

- `RESET_PREFIXES_V9` se definió como const a nivel de módulo (recomendado por el plan) en vez de encadenar 6 condiciones `startsWith`; lo reusan tanto el filtro de `exerciseStats` como el predicado de `inFlightTest` (DRY, una sola fuente de verdad de los 6 prefijos).
- `hydrateV8`/`migrate7to8` quedan exportados en `backup.js`/`storage.js` pero ya no son terminales de la cadena (terminada en `hydrateV9`); se mantienen por backward-compat según el patrón histórico (igual que `hydrateV7`).
- Gate de colisión verificado contra `content/categories.json` (2026-06-05): los 6 reset y los 3 preservados son mutuamente exclusivos bajo `startsWith`; ningún slug reset es prefijo de otro. Sin colisiones.
- Proyecto zero-deps sin lint step (static web) — sin impacto de los exports no-referenciados.

## Self-Check: PASSED

- FOUND: src/data/storage.js (`export function migrate8to9`, `export function hydrateV9`, `CURRENT_SCHEMA_VERSION = 9`)
- FOUND: src/data/backup.js (`migrate8to9`, `hydrateV9`, `CURRENT_SCHEMA_VERSION = 9`)
- FOUND commit ec7bbcf (test Task 1 RED)
- FOUND commit af7cb75 (feat Task 1 GREEN)
- FOUND commit 3a159af (test Task 2 RED)
- FOUND commit 521e5f8 (feat Task 2 GREEN)
- Suite completa: 374/374 pass, 0 fail.

## TDD Gate Compliance

Ambas tareas siguen el ciclo RED→GREEN con commits separados:
- Task 1: `test(21-01)` ec7bbcf (RED, suite falla por imports inexistentes) → `feat(21-01)` af7cb75 (GREEN, 72/72 storage).
- Task 2: `test(21-01)` 3a159af (RED, 13 fails por cadena terminada en v8 / CURRENT=8) → `feat(21-01)` 521e5f8 (GREEN, 40/40 backup + suite 374/374).
No se observó RED pasando inesperadamente. Gate cumplido.
