---
phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n
verified: 2026-06-03T12:00:00Z
status: passed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "App arranca en el navegador mostrando las 9 categorías exactamente como hoy"
    expected: "9 categorías gramaticales + Canciones visibles, sin banner de error; ejercicios multi-tipo renderizando como antes; schemaVersion 6 en localStorage sin reset de progreso; backup round-trip v6 funciona; banners de validación como texto plano en español"
    why_human: "Verificación de UI en navegador, comportamiento de localStorage real y round-trip de archivo de backup — no verificable por grep ni node --test"
    resolution: "APPROVED — el autor confirmó los 6 pasos del checkpoint (Task 3 de Plan 03) antes del cierre de la fase. Registrado en 15-03-SUMMARY.md bajo 'Checkpoint Resolution'."
---

# Phase 15: Modelo de datos slot+variantes + schema + migración — Verification Report

**Phase Goal:** El contenido y el state soportan un modelo slot+variantes — cada slot representa una regla con 1..N variantes intercambiables y una explicación compartida — con validator estricto, migración `5→6` y las 8 categorías no-piloto funcionando intactas como slots de 1 variante.
**Verified:** 2026-06-03T12:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC1 | Un archivo de categoría define slots con 1..N variantes jugables y explanation compartida a nivel de slot | VERIFIED | `validateContent` rama XOR en `schema-validator.js:144-165`; `SURFACE_VALIDATORS` + `validateVariants` helper; unit test 1 (multi-variante), test 4 (match); integration test `slot-demo-001` con 2 variantes multiple-choice — `validateContent` → ok true. |
| SC2 | Un slot con exactamente 1 variante carga y se trata con normalidad (sin caso especial) | VERIFIED | Unit test "acepta un slot con exactamente 1 variante (SLOT-03)"; integration test `slot-demo-spiaggia` (1 variante); `validateVariants` no tiene caso especial para longitud 1 (solo rechaza 0). |
| SC3 | El validator rechaza con banner visible JSON malformado: variants[] vacío, variante inválida para su tipo, explanation ausente | VERIFIED | `validateVariants` (schema-validator.js:201-222) empuja errores en español sin throw; unit tests "rechaza variants[] vacío", "rechaza superficie inválida ubicando índice", "rechaza payload Y variants[] simultáneos", "rechaza sin explanation", "D-08 dos variantes inválidas acumulan ambos errores" — todos pasan (19/19). |
| SC4 | migrate5to6 + hydrateV6 idempotentes + deep-clone; backup.js exporta/importa round-trip en v6 | VERIFIED | `storage.js:503-573` — `migrate5to6` y `hydrateV6` con deep-clone por sub-dict; dispatcher `migrate()` encadena `if (s.schemaVersion === 5) s = migrate5to6(s); if (s.schemaVersion === 6) return hydrateV6(s)`; `backup.js:26,36,119-120` — import, constante inline 6, eslabón en `parseBackupFile`; `node --test tests/data-storage.test.js` → 34/34 (describe v6 nuevo + v5 intacto); `node --test tests/backup.test.js` → 31/31. |
| SC5 | Las 8 categorías no-piloto siguen cargando sin re-autoría; app arranca con 9 categorías como hoy | VERIFIED | Integration test SLOT-06 (`slot-variants-integration.test.js:163-213`) valida las 9 categorías reales con el validator extendido — 19 tests de back-compat, todos pasan; conteos exactos por categoría verificados; `node scripts/assert-avere-prefix-unchanged.mjs` → exit 0; checkpoint humano APPROVED (ver human_verification). |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/data/schema-validator.js` | Rama payload XOR variants[] dentro de validateContent; SURFACE_VALIDATORS dispatch table | VERIFIED | `SURFACE_VALIDATORS` en líneas 45-49; `validateVariants` en líneas 201-222; rama XOR en líneas 139-165; los 3 validate*Surface helpers con label-prefix. Commits: 787a75d. |
| `src/data/content-loader.js` | `normalizeExerciseToSlot` exportada pura; `slotById` derivado en `loadContent`; JSDoc retorno actualizado | VERIFIED | `normalizeExerciseToSlot` export en línea 43; `variantFromPayload` helper en línea 75; `slotById` construido en líneas 146-155; retorno `{categories, exerciseById, slotById}` en línea 158-162; JSDoc del retorno actualizado (línea 101-106). Commit: 3831e74. |
| `src/data/storage.js` | `migrate5to6` + `hydrateV6` exportadas; `CURRENT_SCHEMA_VERSION=6`; eslabón en `migrate()` | VERIFIED | `CURRENT_SCHEMA_VERSION = 6` en línea 35; `migrate5to6` en línea 503; `hydrateV6` en línea 538; dispatcher en líneas 144-145. Commit: 26f0678. |
| `src/data/backup.js` | Import de migrate5to6/hydrateV6; constante inline 6; eslabón en parseBackupFile | VERIFIED | Import en línea 26; constante inline `= 6` en línea 36 con rationale Phase 15; eslabones en líneas 119-120. Commit: eac62f1. |
| `tests/fixtures/slot-variants.test.js` | Suite slot+variants: happy, slot-de-1, rechazos, back-compat, normalizeExerciseToSlot | VERIFIED | 19 tests — describe `schema-validator — slot+variants` (14 casos) + describe `normalizeExerciseToSlot` (5 casos); todos pasan. Commit: 7cc7bb1. |
| `tests/fixtures/slot-variants-integration.test.js` | Test de integración pipeline completo + back-compat de las 9 categorías reales | VERIFIED | 26 tests — pipeline sobre `slot-demo.json` (7 casos) + back-compat SLOT-06 de las 9 categorías (19 casos); todos pasan. Commit: f022c4d. |
| `content/exercises/_fixtures/slot-demo.json` | Fixture canónico (1 slot multi-variante + 1 slot de 1 variante); vive en _fixtures/ fuera del registry | VERIFIED | Fixture existe con `slot-demo-001` (2 variantes multiple-choice) y `slot-demo-spiaggia` (1 variante); `validate-content-fixture.mjs slot-demo ...` → exit 0. Commit: f022c4d. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `schema-validator.js` (rama variantes) | `SURFACE_VALIDATORS` por tipo | `validateVariants` itera `ex.variants` llamando `surfaceValidator(variant, ...)` | WIRED | Líneas 213-220: `const surfaceValidator = SURFACE_VALIDATORS[ex.type]; ex.variants.forEach((variant, k) => ... surfaceValidator(...))` |
| `content-loader.js` (`normalizeExerciseToSlot`) | `slotById` en `loadContent` | `slotById[ex.id] = normalizeExerciseToSlot(ex)` dentro del loop de ejercicios | WIRED | Línea 154: conexión directa función pura → mapa derivado |
| `content-loader.js` (`loadContent`) | `validateContent` | Paso 4 del pipeline (línea 130-138); el nuevo validator con la rama XOR fluye por `.errors` → banner D-10 | WIRED | `const { ok, errors } = validateContent({...})` — ruta invariante a través del bump del validator |
| `storage.js` `migrate()` | `migrate5to6` → `hydrateV6` | `if (s.schemaVersion === 5) s = migrate5to6(s); if (s.schemaVersion === 6) return hydrateV6(s)` | WIRED | Líneas 144-145 del dispatcher |
| `backup.js` `parseBackupFile` | `migrate5to6` → `hydrateV6` | Eslabón en cadena; hydrate final cambiado a `hydrateV6` | WIRED | Líneas 119-120; import en línea 26 |

### Data-Flow Trace (Level 4)

No aplica a esta fase. Los artefactos son funciones de validación y normalización puras (sin estado de UI dinámico); el único "consumidor" de `slotById` es Phase 16 (no existe aún en producción). `exerciseById` — consumido por `app.js` — no fue modificado (SLOT-06 back-compat verificado por test).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Suite slot+variants unitaria (19 tests) | `node --test tests/fixtures/slot-variants.test.js` | 19/19 pass, 0 fail | PASS |
| Suite de integración pipeline (26 tests) | `node --test tests/fixtures/slot-variants-integration.test.js` | 26/26 pass, 0 fail | PASS |
| Suite storage v6 (34 tests) | `node --test tests/data-storage.test.js` | 34/34 pass, 0 fail | PASS |
| Suite backup v6 (31 tests) | `node --test tests/backup.test.js` | 31/31 pass, 0 fail | PASS |
| Suite completa | `node --test` | 367/367 pass, 0 fail | PASS |
| Fixture slot-demo valida (exit 0) | `node scripts/validate-content-fixture.mjs slot-demo content/exercises/_fixtures/slot-demo.json` | "OK validación: 2 ejercicio(s)" | PASS |
| Avere snapshot append-only (exit 0) | `node scripts/assert-avere-prefix-unchanged.mjs` | "OK: los 17 ejercicios originales de avere.json están intactos" | PASS |

### Probe Execution

No hay probes en `scripts/*/tests/probe-*.sh` declarados para esta fase. Los behavioral spot-checks anteriores son el equivalente verificable.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| SLOT-01 | 15-01-PLAN, 15-03-PLAN | Slots con 1..N variantes intercambiables | SATISFIED | Validator acepta `variants[]` de 1..N; `normalizeExerciseToSlot` passthrough; fixture `slot-demo-001` con 2 variantes. |
| SLOT-02 | 15-01-PLAN | Explanation a nivel de slot (no por variante) | SATISFIED | `validateVariants` exige `ex.explanation` string no vacío (línea 203-205); unit test "rechaza sin explanation top-level" pasa. |
| SLOT-03 | 15-01-PLAN, 15-03-PLAN | Slot de 1 variante sin caso especial | SATISFIED | `validateVariants` no tiene rama especial para length=1; unit test y fixture `slot-demo-spiaggia` confirman. |
| SLOT-04 | 15-01-PLAN | Validator rechaza JSON malformado con banner visible | SATISFIED | 4 rechazos: variants[] vacío, variante inválida por índice, payload+variants, explanation ausente — todos probados y en español, sin throw. |
| SLOT-05 | 15-02-PLAN | migrate5to6 + hydrateV6 idempotente + deep-clone; backup.js v6 | SATISFIED | Ambas funciones exportadas con deep-clone por sub-dict; dispatcher y parseBackupFile encadenados; 34+31 tests verdes. |
| SLOT-06 | 15-01-PLAN, 15-03-PLAN | 8 categorías no-piloto funcionan como slots de 1 variante sin re-autoría | SATISFIED | Integration test valida las 9 categorías reales con el validator extendido; conteos intactos; avere snapshot verde; checkpoint humano APPROVED. |

**Coverage:** 6/6 requirements satisfechos. Sin requirements huérfanos para Phase 15 en REQUIREMENTS.md (traceability verificada — los 6 SLOT-* están en el REQUIREMENTS.md con status Complete y mapeados a Phase 15).

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/data/storage.js` | 75, 78, 127-135 | JSDoc de `loadState()` y `migrate()` describe "shape v4" y "hydrateV4" como terminus — stale tras el bump a v6 | INFO | Sin impacto en producción. Documentado en REVIEW.md WR-02. No es un TBD/FIXME sin referencia formal. |

**Debt marker gate:** No se encontraron marcadores `TBD`, `FIXME` o `XXX` en los archivos modificados por esta fase.

### Code Review Warnings (de 15-REVIEW.md — informational)

Estas advertencias fueron identificadas en el code review previo al cierre de la fase. Se registran aquí para trazabilidad pero no son blockers dado el estado actual de `slotById` (sin consumidor de producción hasta Phase 16):

**WR-01 — `normalizeExerciseToSlot` variants-branch comparte referencias con `exerciseById`:** La rama `if (Array.isArray(ex.variants))` devuelve `{ ..., categoryIds: ex.categoryIds, variants: ex.variants }` — los arrays son las mismas referencias del ejercicio original. Verificado empíricamente: `slot.variants === ex.variants → true`. No es un bug activo porque `slotById` no tiene consumidor de producción, pero es un riesgo latente si Phase 16 muta un slot en lugar (p.ej. barajar opciones). El test de pureza existente (test 331) solo cubre la rama legacy. Fix sugerido por el reviewer: deep-clone en la rama variants o corrección del JSDoc para indicar "vista compartida de solo lectura".

**WR-02 — JSDoc stale de `loadState` y `migrate()`:** Describe terminus en "shape v4" / "hydrateV4". Sin impacto en producción — el cuerpo del código es correcto.

**WR-03 — `CURRENT_SCHEMA_VERSION` duplicado en storage.js y backup.js sin test de sincronía:** El bump se hizo manualmente en ambos archivos de forma correcta en esta fase; el riesgo es en el próximo bump.

### Human Verification Required

**Checkpoint APPROVED por el autor antes del cierre de la fase (Task 3 de Plan 03, gate blocking-human ASVS L1):**

| Test | Expected | Status |
|------|----------|--------|
| App arranca con 9 categorías + Canciones, sin banner de error | Home muestra las 9 categorías gramaticales como siempre | APPROVED |
| Ejercicios multi-tipo renderizando y puntuando igual | multiple-choice, word-buttons, match funcionan como antes | APPROVED |
| state.schemaVersion === 6 tras sesión, sin reset de progreso | DevTools → localStorage muestra `"schemaVersion":6`; progreso previo intacto | APPROVED |
| Backup round-trip: export + re-import sin "versión más nueva" | El archivo .json v6 re-importa sin error | APPROVED |
| Banners de validación como texto plano en español (T-15-XSS) | Ninguna inyección HTML visible | APPROVED |

### Gaps Summary

No hay gaps. Todos los must-haves están verificados, la suite completa pasa (367/367), el checkpoint humano fue aprobado y registrado en 15-03-SUMMARY.md.

---

_Verified: 2026-06-03T12:00:00Z_
_Verifier: Claude (gsd-verifier)_
