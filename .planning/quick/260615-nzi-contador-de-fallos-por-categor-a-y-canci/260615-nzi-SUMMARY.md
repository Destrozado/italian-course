---
phase: quick-260615-nzi
plan: 01
subsystem: progreso / persistencia / UI home
tags: [schema-migration, localStorage, progress-tracking, alpine, pico]
status: shipped
requires:
  - schemaVersion 9 (Phase 21) + migrate8to9/hydrateV9 + cadena de backup hasta v9
provides:
  - schemaVersion 10 + migrate9to10 (nominal) + hydrateV10
  - contador vecesFallada por categoría (guard hadProgress) y por canción (por playthrough)
  - indicador "fallada xN" en home (categorías + canciones)
affects:
  - src/data/storage.js
  - src/data/backup.js
  - src/domain/progress.js
  - src/screens/app.js
  - index.html
tech-stack:
  added: []
  patterns:
    - bump nominal puro (migrate9to10 espejo de hydrate, preserva todo, sin delete/poda)
    - lazy-init de campo nuevo con ?? 0 (D-47) — no retroactivo
    - conteo immediate-only bajo guard (cero doble conteo immediate+session)
key-files:
  created: []
  modified:
    - src/data/storage.js
    - src/data/backup.js
    - src/domain/progress.js
    - src/screens/app.js
    - index.html
    - tests/data-storage.test.js
    - tests/backup.test.js
    - tests/domain-progress.test.js
    - tests/screen-canciones.test.js
decisions:
  - "vecesFallada de categoría +1 SOLO bajo guard hadProgress en applyImmediateFailure (call-site canónico D-54); applySessionResult NO recuenta → cero doble conteo"
  - "vecesFallada de canción +1 por playthrough con >=1 frase fallada en completeSong (una vez); reusa el mismo results.some(!correct) que alimenta status"
  - "migración 9→10 NOMINAL: preserva todo, vecesFallada lazy-init a 0 (histórico de fallos no reconstruible)"
metrics:
  duration: ~1 sesión
  completed: 2026-06-15
  tasks: 3
  files: 9
  tests_added: ~24 (411 total, antes 390)
---

# Quick Task 260615-nzi: Contador de fallos por categoría y canción Summary

Contador persistente `vecesFallada` (entero) por categoría y por canción que sube cuando un fallo destruye progreso real, mostrado como "fallada xN" en home — bump nominal de schemaVersion 9→10 con conteo idempotente sin doble conteo.

## What Was Built

**Task 1 — Migración nominal 9→10 + roundtrip de backup (commit `1a8cc30`)**
- `migrate9to10(v9)` en `storage.js`: bump NOMINAL PURO (espejo de `hydrateV9`), preserva todo el estado byte a byte (categoryProgress, exerciseStats, songProgress, dailyLog, timestamps, inFlightTest), solo cambia `schemaVersion: 10`. Deep-clone por sub-dict (anti-prototype-pollution T-nzi-01). No hace `delete` ni poda.
- `hydrateV10(parsed)`: espejo literal de `hydrateV9` con versión 10 + type-guards defensivos.
- `CURRENT_SCHEMA_VERSION` 9→10 en `storage.js` y `backup.js`; cadena `migrate()` y cadena de `parseBackupFile` extendidas (`=== 9 → migrate9to10`; hidratación final `hydrateV10`); `blankState()` → v10.
- Tests: migrate9to10 nominal/puro/idempotente, hydrateV10 defensivo + anti-PP, cadena end-to-end v8→v10, roundtrip de backup preservando `vecesFallada` en categoría y canción.

**Task 2 — Conteo de categoría + canción (commit `dde69a6`)**
- Helper `hadProgress(cat)` en `progress.js` (definido UNA vez): true sii status hecha/dominada, o racha>0, o clearedExerciseIds no vacío.
- `applyImmediateFailure`: bajo el guard `hadProgress(prev)` incrementa `vecesFallada = (prev.vecesFallada ?? 0) + 1` ANTES del reset, con la clave explícita en el objeto reset (gana sobre `...prev`). `applySessionResult` SIN cambios (su FAIL-WINS corre sobre estado ya reseteado → hadProgress false → no recuenta).
- `completeSong` en `app.js`: `+1` a `songProgress[songId].vecesFallada` si `results.some(r => !r.correct)`, leyendo el previo de `this.state` y escribiendo en `newState`, una sola vez por playthrough.

**Task 3 — UI + test de canción (commit `5181865`)**
- Getters `categoriesForDisplay` y `songsForDisplay` exponen `vecesFallada` (`?? 0`).
- `index.html`: `<small x-show="cat.vecesFallada > 0" x-text="\`fallada x${cat.vecesFallada}\`">` en filas de categoría y de canción (el nombre/título se envuelve en `<span>` para no romper el binding existente). Anti-XSS: x-text, contador entero del estado.
- Tests behavioral de `completeSong` (incremento con fallo / +0 sin fallo / acumulación) + getter `songsForDisplay` + indicador en index.html.

## Key Decisions

- **Conteo immediate-only (cero doble conteo).** El incremento de categoría vive solo en `applyImmediateFailure`. La equivalencia Path A (immediate+session) vs Path B (solo session) del test integral preexistente se preserva para el reset cascade, pero `vecesFallada` diverge por diseño (Path A cuenta, Path B no) — el test se ajustó para comparar el cascade excluyendo `vecesFallada` y asserta la divergencia esperada explícitamente.
- **Bump nominal, no retroactivo.** El histórico de fallos no es reconstruible; `vecesFallada` se lazy-init a 0, no se hidrata retroactivamente.

## Deviations from Plan

Ninguna desviación de diseño. Ajustes de tests preexistentes requeridos por el cambio de cadena de migración (parte intrínseca de la Task 1, no desviaciones de scope):
- Aserciones de endpoint de cadena en `backup.test.js` y `data-storage.test.js` actualizadas de `schemaVersion 9` → `10` (la salida de la migración ahora es v10).
- Test forward-compat de rechazo: futuro `> 9` (schemaVersion 10) → `> 10` (schemaVersion 11), pues 10 es ahora el current.
- Test "idempotencia integral" en `domain-progress.test.js` ajustado: el `categoryProgress` deepEqual entre paths ahora excluye el campo immediate-only `vecesFallada` y verifica la divergencia esperada por separado (documentado inline).

## Tests

`node --test tests/*.test.js` → **411 tests, 410 pass, 1 fail**.
- Baseline antes de la tarea: 390 tests, 389 pass, 1 fail.
- El ÚNICO fallo es PREEXISTENTE y AJENO: `content/exercises/genero-numero.json` "12/12 ejercicios con explanation válida" (genero-numero 12→13, quick task 260614-hxn pendiente de re-validar). NO introducido por esta tarea; sigue en 1 fail (cero fallos nuevos).
- +21 tests netos (~24 nuevos de la tarea).

## Self-Check: PASSED
- src/data/storage.js — migrate9to10/hydrateV10 exportados, FOUND
- src/data/backup.js — CURRENT_SCHEMA_VERSION=10 + cadena, FOUND
- src/domain/progress.js — hadProgress + vecesFallada, FOUND
- src/screens/app.js — completeSong increment + getters, FOUND
- index.html — indicador fallada xN, FOUND
- Commits 1a8cc30, dde69a6, 5181865 — FOUND en git log
