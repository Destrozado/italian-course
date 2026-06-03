---
phase: 17-piloto-preposiciones-contenido
reviewed: 2026-06-03T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - src/data/storage.js
  - src/data/backup.js
  - scripts/run-validation-271.mjs
  - tests/data-storage.test.js
  - tests/backup.test.js
  - tests/exercise-types.test.js
  - tests/fixtures/slot-variants-integration.test.js
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 17: Code Review Report

**Reviewed:** 2026-06-03
**Depth:** standard
**Files Reviewed:** 7
**Status:** issues_found

## Summary

La migración schemaVersion 6→7 (`migrate6to7` / `hydrateV7`) está implementada correctamente en todos sus aspectos de corrección de comportamiento:

- La poda de `categoryProgress.preposiciones` es quirúrgica y correcta (deep-clone antes del `delete`, no muta el input).
- El filtro de `exerciseStats` por prefijo `'preposiciones'` es seguro: ninguno de los otros 8 slugs de categoría comienza por ese prefijo (verificado contra `content/categories.json`).
- La invalidación de `inFlightTest` es correcta y conservadora: comprueba `exerciseIds` (donde viven los IDs de ejercicio reales) y no depende de `categoryIds` (que no causaría crash porque las categorías siguen existiendo en el content).
- El deep-clone anti-prototype-pollution se preserva fielmente respecto al patrón `migrate5to6` / `hydrateV6`.
- La idempotencia es real (delete sobre clave ausente es no-op, filtro de prefijo es no-op si ya se podaron las claves).
- `hydrateV7` es espejo literal de `hydrateV6` con la versión bumpeada a 7, sin poda (correcto).
- El round-trip de backup v7 y la cadena de migración en `backup.js` terminan correctamente en `hydrateV7`.
- Los conteos de ejercicios en todos los archivos de test/scripts coinciden con el contenido real en disco (preposiciones: 49, total: 370).

Los hallazgos son defectos de documentación y calidad, no de corrección.

---

## Warnings

### WR-01: Imports muertos `hydrateV5` y `hydrateV6` en `backup.js`

**File:** `src/data/backup.js:26`
**Issue:** La línea de import trae `hydrateV5` y `hydrateV6`, pero ninguna de las dos se invoca en ningún punto de `parseBackupFile`. El pipeline de migración encadena `migrate*to*` y termina con un `hydrateV7` incondicional; los pasos intermedios intermedios no necesitan hydrate explícito. `hydrateV5` lleva muerto desde Phase 15 (cuando `hydrateV6` sustituyó el paso final); `hydrateV6` lleva muerto desde Phase 17 (cuando fue reemplazado por `hydrateV7`). Los imports muertos no rompen nada en ES modules, pero son ruido que contradice la regla de que la cadena de backup es espejo de la de `loadState`, e inducen confusión sobre qué pasos son activos.

**Fix:**
```js
// src/data/backup.js — línea 26
// Antes:
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, hydrateV5, migrate5to6, hydrateV6, migrate6to7, hydrateV7 } from './storage.js';

// Después (eliminar hydrateV5 y hydrateV6):
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7 } from './storage.js';
```

---

### WR-02: JSDoc de `loadState()` y de `migrate()` obsoleto — dice "v4" cuando la realidad es v7

**File:** `src/data/storage.js:76-79` y `src/data/storage.js:136`
**Issue:** El bloque JSDoc de `loadState()` (líneas 76-79) declara:

```
 * El estado devuelto SIEMPRE está en el shape v4 (las migraciones 1→2→3→4
 * @returns {{schemaVersion: 4, ...}}
```

Y el JSDoc de `migrate()` (línea 136) declara:

```
 * @returns {object} Estado normalizado en el shape v4.
```

Ambos son incorrectos: la cadena actualmente termina en `hydrateV7`, y el valor de retorno es siempre `schemaVersion: 7`. Estos comentarios no fueron actualizados durante las Phases 13, 15 ni 17. El comentario de `migrate()` también describe la cadena como "cadena 1 → 2 → 3 → 4 → hydrateV4", sin mencionar los eslabones v5, v6, v7.

Riesgo concreto: un futuro mantenedor que lea `loadState()` y asuma que el resultado tiene `schemaVersion: 4` escribirá código roto (e.g. comparaciones de versión, inicialización de campos de v5+).

**Fix:**
```js
// loadState() — líneas 76-79: reemplazar
/**
 * El estado devuelto SIEMPRE está en el shape v7 (las migraciones 1→2→3→4→5→6→7
 * corren transparente vía el dispatcher).
 *
 * @returns {{schemaVersion: 7, exerciseStats: object, categoryProgress: object,
 *            dailyLog: object, songProgress: object, lastBackupAt: ?string,
 *            firstUsedAt: ?string, inFlightTest?: object}}
 */

// migrate() — línea 136: reemplazar
 * @returns {object} Estado normalizado en el shape v7.
```

Y actualizar el cuerpo del JSDoc del dispatcher de "Phase 6 (D-111): cadena 1 → 2 → 3 → 4 → hydrateV4" a la cadena completa actual.

---

### WR-03: JSDoc de `parseBackupFile` en `backup.js` describe la cadena de migración obsoleta ("v4 normalizada")

**File:** `src/data/backup.js:19` y `src/data/backup.js:53-55`
**Issue:** El encabezado del módulo (línea 19) dice:

```
 *   - `{ok: true, state, summary}` cuando todo va bien (state ya migrado a v4).
```

Y el JSDoc interno del pipeline (líneas 53-55) dice:

```
 *   5. Cadena de migración: migrate1to2 → migrate2to3 → migrate3to4 →
 *      hydrateV4. Sale siempre como v4 normalizada (hydrateV4 neutraliza
 *      prototype pollution per T-04-02).
```

El pipeline real (líneas 118-124) termina en `hydrateV7`, no en `hydrateV4`. La descripción del paso 5 nombra explícitamente `hydrateV4` que ya no es el eslabón final.

**Fix:**
```js
// backup.js línea 19:
 *   - `{ok: true, state, summary}` cuando todo va bien (state ya migrado a v7).

// backup.js líneas 53-55:
 *   5. Cadena de migración: migrate1to2 → migrate2to3 → migrate3to4 →
 *      migrate4to5 → migrate5to6 → migrate6to7 → hydrateV7 (final).
 *      Sale siempre como v7 normalizada (hydrateV7 neutraliza prototype
 *      pollution per T-04-02 / T-17-01). migrate6to7 resetea Preposiciones.
```

---

## Info

### IN-01: Comentario en `tests/exercise-types.test.js` declara total "372" cuando el real es 370

**File:** `tests/exercise-types.test.js:1275`
**Issue:** El comentario de cierre de `CATEGORIES_WITH_EXPLANATIONS`:

```js
// Cobertura editorial: 272/272 v1.0/v1.1 + 56 articoli (8ª categoría, v1.2 Phase 11)
// + 44 partitivos (9ª categoría, v1.2 Phase 12) = 372 con explanation curada.
```

El total "372" era correcto antes de Phase 17 cuando Preposiciones tenía 52 ejercicios planos. Tras la reagrupación a 49 slots, la suma real de `CATEGORIES_WITH_EXPLANATIONS` es 370 (verificado: 49+40+23+31+37+39+51+56+44 = 370). El comentario no se actualizó.

Este comentario solo afecta a la legibilidad; los asserts del test usan los valores individuales por archivo (que sí son correctos), así que el comportamiento del test es correcto.

**Fix:**
```js
// tests/exercise-types.test.js — línea 1275: reemplazar
// Cobertura editorial: 269 (272 originales v1.0/v1.1, recontado con preposiciones:49
// tras Phase 17) + 56 articoli (8ª categoría) + 44 partitivos (9ª categoría) = 369
// + 1 preposiciones-052 pendiente de conteo = 370 ejercicios con explanation curada.
// (O simplificado: suma de expected[] = 370.)
```

---

### IN-02: `run-validation-271.mjs` imprime "VAL-06 (271/271 validated)" pero el target real es 370/370

**File:** `scripts/run-validation-271.mjs:311`
**Issue:** La línea de output imprime:

```js
`  VAL-06 (271/271 validated): ${...}`
```

El literal `"271/271"` era el objetivo histórico del milestone v1.1 (solo 7 categorías, 271 ejercicios). El `TOTAL_EXPECTED` es ahora 370 (actualizado correctamente en línea 91), y el PASS/FAIL usa `TOTAL_EXPECTED` en la interpolación dinámica. Pero el label estático "271/271" en la plantilla no se actualizó. Un operador que vea `VAL-06 (271/271 validated): PASS (370/370)` verá una discrepancia confusa entre el label estático y el dinámico.

**Fix:**
```js
// scripts/run-validation-271.mjs — línea 311: reemplazar el literal
`  VAL-06 (${TOTAL_EXPECTED}/${TOTAL_EXPECTED} validated): ${...}`
```

---

_Reviewed: 2026-06-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
