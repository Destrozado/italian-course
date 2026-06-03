---
phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
plan: 01
subsystem: database
tags: [schema-validator, content-loader, slot-variants, validation, node-test]

# Dependency graph
requires:
  - phase: 13-canciones-modelo-de-datos
    provides: "validateSongs / validateSongPhrasePayload — precedente de validador de superficie aplanada, reusado como patrón para validar variantes planas"
provides:
  - "validateContent acepta payload XOR variants[] con todos los rechazos en español (SLOT-01/02/03/04)"
  - "SURFACE_VALIDATORS dispatch table (tipo → validador de superficie plana con prefijo de mensaje)"
  - "normalizeExerciseToSlot(ex) función pura: legacy→slot-de-1 / passthrough variants[] (D-15-04)"
  - "loadContent expone slotById derivado uniforme junto a exerciseById intacto (SLOT-06 back-compat)"
affects: [16-motor-de-examen-por-slots, 17-piloto-preposiciones]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Validador de superficie plana con label-prefix configurable (variante = payload aplanado, espejo de validateSongPhrasePayload)"
    - "Mapa *ById HERMANO derivado vía función pura exportada (slotById espejo de songsById)"

key-files:
  created:
    - tests/fixtures/slot-variants.test.js
  modified:
    - src/data/schema-validator.js
    - src/data/content-loader.js

key-decisions:
  - "Refactor de los 3 validate*Payload a validate*Surface(surface, exId, file, push, label) — el wrapper legacy delega con label 'payload'; la ruta variantes itera con label 'variants[k]'. Reuso real de la lógica de superficie, no duplicación."
  - "loadContent normaliza legacy→slot-de-1 EN el loader (no se difiere a Phase 16): slotById expone la shape canónica de slot a Phase 16; exerciseById queda byte-idéntico para app.js."
  - "explanation a nivel de slot obligatoria cuando hay variants[] (SLOT-02); legacy payload.explanation sigue opcional (D-15-04)."

patterns-established:
  - "SURFACE_VALIDATORS: dispatch table espejo de PAYLOAD_VALIDATORS para validar superficies planas indexadas por tipo."
  - "normalizeExerciseToSlot exportada y pura: los tests la importan sin fetch; loadContent la reusa por ejercicio."

requirements-completed: [SLOT-01, SLOT-02, SLOT-03, SLOT-04, SLOT-06]

# Metrics
duration: ~12min
completed: 2026-06-02
---

# Phase 15 Plan 01: Modelo de datos slot+variantes (validator + loader) Summary

**validateContent acepta `payload` XOR `variants[]` reusando validadores de superficie por tipo, y loadContent expone un `slotById` uniforme derivado vía la función pura `normalizeExerciseToSlot`, sin tocar `exerciseById` ni los 8 archivos legacy.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-06-02T22:34:28Z
- **Completed:** 2026-06-02T22:39:16Z
- **Tasks:** 2
- **Files modified:** 3 (2 source + 1 test created)

## Accomplishments
- `validateContent` ahora enrutará cada ejercicio por la regla `payload` XOR `variants[]` (D-15-02/04/06): rechaza ambos-presentes, ninguno, `variants[]` vacío, `explanation` ausente a nivel de slot (SLOT-02) y superficie de variante inválida (ubicada por índice `variants[k]`), todo en español sin throw mid-walk (D-08).
- Refactor de los 3 `validate*Payload` extrayendo `validate*Surface(surface, exId, file, push, label)` — el payload legacy delega con label `"payload"` (back-compat exacto), la ruta variantes itera con `"variants[k]"`. Nueva dispatch table `SURFACE_VALIDATORS`.
- `normalizeExerciseToSlot(ex)` pura exportada: legacy → slot de 1 variante (`explanation` desde `payload.explanation ?? null`, superficie plana por tipo) sin mutar el payload; slot con `variants[]` → passthrough a la shape canónica.
- `loadContent` construye el mapa HERMANO `slotById` con esa misma función (espejo de `songsById`), retornando `{categories, exerciseById, slotById}`; `exerciseById` byte-idéntico (refs originales) → app.js sigue leyendo `.payload` intacto (SLOT-06).

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1 (RED): tests slot+variants + normalizeExerciseToSlot** - `7cc7bb1` (test)
2. **Task 1 (GREEN): rama payload XOR variants[] en validateContent** - `787a75d` (feat)
3. **Task 2: normalizeExerciseToSlot pura + slotById derivado** - `3831e74` (feat)

**Plan metadata:** (este commit, docs)

_Nota: Task 1 fue TDD (test → feat). El describe `normalizeExerciseToSlot` de Task 2 quedó RED tras el commit de Task 1 (import inexistente) y verde tras Task 2 — la suite completa del fixture se ejerce al final de Task 2._

## Files Created/Modified
- `tests/fixtures/slot-variants.test.js` - 19 tests: happy multi-variante, slot-de-1 (SLOT-03), word-buttons/match variantes, back-compat legacy (con/sin payload.explanation), rechazos (vacío, superficie inválida ubicada por índice, payload+variants, sin explanation, ninguno), D-08 acumulación, no-throw; describe puro de normalizeExerciseToSlot (legacy→slot-de-1, passthrough, pureza).
- `src/data/schema-validator.js` - rama XOR en `validateContent`; `validateVariants` helper; 3 `validate*Surface` extraídos + `SURFACE_VALIDATORS` dispatch table; los `validate*Payload` legacy delegan al surface helper.
- `src/data/content-loader.js` - `normalizeExerciseToSlot` (export pura) + `variantFromPayload`; `slotById` derivado en `loadContent`; JSDoc del retorno actualizado.

## Decisions Made
- **Refactor surface-helper con label-prefix** (SLOT-04, Claude's Discretion, opción de PATTERNS Analog B): reuso genuino de la lógica de superficie entre payload legacy y variante, evitando dos copias divergentes. Mensajes `"variants[k].campo"` vs `"payload.campo"` por el label.
- **Normalización legacy→slot-de-1 en el loader (no diferida a Phase 16):** el plan dejaba la decisión abierta; se eligió exponer `slotById` ya uniforme para que Phase 16 consuma un único contrato de slot. `exerciseById` se mantiene intacto para no romper app.js.
- **Esquema de id de variante diferido a Phase 16** (CONTEXT): `slotById` expone `variants` como array indexado sin ids propios.

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
None. El refactor de los 3 validadores de payload preservó verde `tests/exercise-types.test.js` (128/128) en el primer intento; la suite completa pasó de 313 a 332 tests verdes (+19).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `slotById` listo como contrato uniforme para Phase 16 (motor de examen por slots): cada slot ya es `{id, type, categoryIds, explanation, variants[]}`, legacy incluido como slot de 1.
- El validador acepta ya el shape de autoría que Phase 17 (piloto Preposiciones) producirá; los 8 archivos legacy y el snapshot append-only de avere (`assert-avere-prefix-unchanged.mjs`, exit 0) quedan intactos.
- Pendiente en esta fase (otros plans): `migrate5to6`/`hydrateV6` + `backup.js` v6 (state schemaVersion bump nominal D-15-08/09).

## Verification
- `node --test tests/fixtures/slot-variants.test.js` → 19/19 verdes.
- `node --test` → 332/332 verdes (313 baseline + 19 nuevos; back-compat validator legacy + Canciones + render app.js intactos).
- `node scripts/assert-avere-prefix-unchanged.mjs` → exit 0 (los 8 archivos no se tocan, D-88/D-178).

## Self-Check: PASSED
- FOUND: tests/fixtures/slot-variants.test.js
- FOUND: src/data/schema-validator.js (rama variants + SURFACE_VALIDATORS)
- FOUND: src/data/content-loader.js (normalizeExerciseToSlot + slotById)
- FOUND commit: 7cc7bb1 (test)
- FOUND commit: 787a75d (feat validator)
- FOUND commit: 3831e74 (feat loader)

---
*Phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n*
*Completed: 2026-06-02*
