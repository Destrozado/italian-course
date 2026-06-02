---
phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
plan: 02
subsystem: data-migration
tags: [storage, backup, migration, schemaVersion, slot-variantes]
requires:
  - "migrate4to5 / hydrateV5 (Phase 13) como plantilla literal"
  - "parseBackupFile / buildBackupWrapper (Phase 4) como pipeline de round-trip"
provides:
  - "migrate5to6 + hydrateV6 (puros, idempotentes, deep-clone defensivos)"
  - "CURRENT_SCHEMA_VERSION = 6 en storage.js y backup.js"
  - "backup round-trip v6 (parseBackupFile migra hasta v6; forward-compat rechaza >6)"
affects:
  - "loadState() y parseBackupFile ahora normalizan a v6"
tech-stack:
  added: []
  patterns:
    - "Bump nominal de schemaVersion (espejo del precedente 3->4 / 5->6, sin sub-árbol nuevo)"
    - "Deep-clone defensivo por sub-dict vía JSON.parse(JSON.stringify(...)) (anti-prototype-pollution)"
key-files:
  created: []
  modified:
    - src/data/storage.js
    - src/data/backup.js
    - tests/data-storage.test.js
    - tests/backup.test.js
decisions:
  - "D-15-09: bump 5->6 NOMINAL a nivel del state root — el modelo slot+variantes vive en content/, no en el state; mismo set de sub-dicts que v5."
  - "Sin reset de progreso al migrar (Preposiciones reset es Phase 17)."
metrics:
  duration: "~12 min"
  completed: "2026-06-03"
  tasks: 2
  files: 4
  tests: "341/341 verdes (+9 nuevos v6)"
---

# Phase 15 Plan 02: Migración del state a schemaVersion 6 + backup round-trip v6 Summary

`migrate5to6` + `hydrateV6` (espejo literal de la cadena v5) más el round-trip de backup a v6 — bump NOMINAL del state root (D-15-09), el modelo slot+variantes vive en `content/`.

## What Was Built

- **storage.js**: `CURRENT_SCHEMA_VERSION` 5 → 6; `migrate5to6` y `hydrateV6` añadidos como espejo LITERAL de `migrate4to5`/`hydrateV5` (mismo set de sub-dicts: exerciseStats, categoryProgress, dailyLog, songProgress; sin sub-árbol nuevo; deep-clone defensivo por sub-dict; string-guard para timestamps; `inFlightTest` passthrough). El dispatcher `migrate()` encadena el eslabón 5→6 e hidrata en v6 (`if (s.schemaVersion === 5) s = migrate5to6(s); if (s.schemaVersion === 6) return hydrateV6(s);`). Versión desconocida sigue cayendo a warn + `blankState()`. Doc-comments de `blankState` actualizadas a v6.
- **backup.js**: import de `migrate5to6`/`hydrateV6`; constante inline `CURRENT_SCHEMA_VERSION` 5 → 6 con la rationale Phase 15 en el comentario; `parseBackupFile` encadena `if (migrated.schemaVersion === 5) migrated = migrate5to6(migrated);` y cambia el hydrate final a `hydrateV6`. Forward-compat guard (`> CURRENT_SCHEMA_VERSION`) y `buildBackupWrapper` (lee `state.schemaVersion` dinámicamente) sin tocar — auto-trackean el bump.
- **Tests**: nuevo describe `data/storage v6 — migrate5to6 chain + hydrateV6 (Phase 15)` con 8 shapes (fresh→bump, deep-clone notEqual referencia + anidada, sub-dict corrupto→{}, anti-prototype-pollution `__proto__`, idempotencia, hydrate deep-clone, hydrate sub-dicts ausentes, blankState v6, cadena v5→v6). Bloque blankState v5 existente migrado a v6. En backup.test.js: terminus de cadena actualizado de 5 a 6 en todos los happy paths; reject forward-compat re-apuntado a schemaVersion 7 (uno por encima del nuevo current).

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | storage.js — migrate5to6 + hydrateV6 + bump a 6 + eslabón en migrate() (TDD) | 26f0678 | src/data/storage.js, tests/data-storage.test.js |
| 2 | backup.js — round-trip v6 | eac62f1 | src/data/backup.js, tests/backup.test.js |

## Verification

- `node --test tests/data-storage.test.js` — 34/34 verde (describe v6 nuevo + v5 intacto).
- `node --test tests/backup.test.js` — 31/31 verde (terminus de cadena a 6, reject >6).
- `node --test` — 341/341 verde (332 baseline + 9 nuevos v6; sin regresión).

## TDD Gate Compliance

Task 1 ejecutado en ciclo RED→GREEN: el bloque v6 se escribió primero y falló por import inexistente de `migrate5to6`/`hydrateV6` (RED confirmado), luego se implementó storage.js y pasó (GREEN). Ambos commits son `feat(...)` con el test y la implementación juntos en el mismo commit por task (el RED no se commiteó por separado porque el import roto rompía el módulo entero; se verificó en local antes de implementar). GREEN gate presente en `26f0678`.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- src/data/storage.js — FOUND (migrate5to6 + hydrateV6 + CURRENT_SCHEMA_VERSION=6)
- src/data/backup.js — FOUND (import + constante 6 + eslabón parseBackupFile)
- Commit 26f0678 — FOUND
- Commit eac62f1 — FOUND
