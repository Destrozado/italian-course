# Phase 29: Migración `10→11` (reset selectivo SOLO de `presente-regolare`) - Pattern Map

**Mapped:** 2026-06-16
**Files analyzed:** 3 (storage.js, backup.js, tests/data-storage.test.js + tests/backup.test.js)
**Analogs found:** 3 / 3 (todos exact — esta fase ESPEJA un patrón ya existente)

> Esta fase es brownfield puro: cada artefacto nuevo es un espejo casi-literal de un eslabón existente de la cadena de migración. El executor NO inventa; copia el analog y aplica UNA desviación documentada.
>
> **Gate de versión (D-29-02, VERIFICADO en código 2026-06-16):** `CURRENT_SCHEMA_VERSION = 10` en `src/data/storage.js:35` y `src/data/backup.js:49`. La migración es **`10→11`** (NO `9→10`). El último eslabón existente es `migrate9to10`/`hydrateV10`. NO hardcodear contra docs (que dicen `9→10`).

---

## File Classification

| Archivo (modificado) | Role | Data Flow | Analog más cercano | Match |
|----------------------|------|-----------|--------------------|-------|
| `src/data/storage.js` (`migrate10to11`) | migration | transform / batch | `migrate8to9` (`storage.js:851`) | exact (reset selectivo por prefijo) |
| `src/data/storage.js` (`hydrateV11`) | migration | transform | `hydrateV10` (`storage.js:994`) / `hydrateV9` (`storage.js:916`) | exact (bump nominal de shape) |
| `src/data/storage.js` (`RESET_PREFIXES_V11`) | config / const | n/a | `RESET_PREFIXES_V9` (`storage.js:811-823`) | exact |
| `src/data/storage.js` (dispatcher + `CURRENT_SCHEMA_VERSION`) | migration router | request-response | `migrate()` dispatcher (`storage.js:149-167`) + `:35` | exact |
| `src/data/backup.js` (bump + cadena + reject `>N`) | service (pure parser) | transform / request-response | `parseBackupFile` (`backup.js:73-147`) + `:26`, `:49`, `:119`, `:136-137` | exact |
| `tests/data-storage.test.js` (bloque v11) | test | n/a | bloque `describe('… v9 — migrate8to9 …')` (`tests/data-storage.test.js:1121-1375`) | exact |
| `tests/backup.test.js` (bloque v11 round-trip) | test | n/a | `describe('… backup v9 — round-trip … (Phase 21)')` (`tests/backup.test.js:417-533`) | exact |

---

## Pattern Assignments

### 1. `migrate10to11` (storage.js) — migration, transform/batch

**Analog:** `migrate8to9` (`src/data/storage.js:851-895`).
**Desviación única (D-29-03):** reset opera sobre **1 prefijo** (`presente-regolare`) en vez de 6. Insertar como eslabón **después de `migrate9to10`** (después de `storage.js:978`).

**ATENCIÓN — divergencia entre los dos analogs candidatos:**
- `migrate9to10` (el eslabón inmediatamente anterior, `:959-978`) es un bump **NOMINAL PURO** — NO hace reset. **NO es el analog a copiar para la lógica.** Solo se imita su POSICIÓN en el archivo (justo antes de `hydrateV10`).
- `migrate8to9` (`:851-895`) ES el analog funcional: reset selectivo por prefijo con los 3 pasos (delete categoryProgress + poda exerciseStats + invalidar inFlightTest).

**Core pattern a copiar — los 3 pasos** (`storage.js:851-895`, adaptados a 1 prefijo):
```javascript
export function migrate10to11(v10) {
  // (1) Reset de categoryProgress['presente-regolare'] tras deep-clone defensivo.
  const categoryProgress = (typeof v10.categoryProgress === 'object' && v10.categoryProgress !== null)
    ? JSON.parse(JSON.stringify(v10.categoryProgress))
    : {};
  delete categoryProgress['presente-regolare'];   // bracket: el id lleva guion

  // (2) Poda por prefijo de exerciseStats['presente-regolare*'] tras deep-clone.
  const exerciseStatsAll = (typeof v10.exerciseStats === 'object' && v10.exerciseStats !== null)
    ? JSON.parse(JSON.stringify(v10.exerciseStats))
    : {};
  const exerciseStats = {};
  for (const k of Object.keys(exerciseStatsAll)) {
    if (!RESET_PREFIXES_V11.some(p => k.startsWith(p))) exerciseStats[k] = exerciseStatsAll[k];
  }

  // (3) Invalidar inFlightTest si referencia ids de presente-regolare (Pitfall 3).
  let inFlightTest = v10.inFlightTest;
  if (inFlightTest && typeof inFlightTest === 'object' &&
      Array.isArray(inFlightTest.exerciseIds) &&
      inFlightTest.exerciseIds.some(id => typeof id === 'string' && RESET_PREFIXES_V11.some(p => id.startsWith(p)))) {
    inFlightTest = undefined;
  }

  return {
    schemaVersion: 11,
    exerciseStats,
    categoryProgress,
    dailyLog: (typeof v10.dailyLog === 'object' && v10.dailyLog !== null)
      ? JSON.parse(JSON.stringify(v10.dailyLog))
      : {},
    songProgress: (typeof v10.songProgress === 'object' && v10.songProgress !== null)
      ? JSON.parse(JSON.stringify(v10.songProgress))
      : {},
    lastBackupAt: typeof v10.lastBackupAt === 'string' ? v10.lastBackupAt : null,
    firstUsedAt: typeof v10.firstUsedAt === 'string' ? v10.firstUsedAt : null,
    inFlightTest
  };
}
```

> Nota de fidelidad al analog: `migrate8to9` usa `RESET_PREFIXES_V9.some(p => ...)` para la poda y la invalidación (paso 2 y 3). Como `RESET_PREFIXES_V11` tiene un solo elemento, el `.some(...)` es equivalente a `k.startsWith('presente-regolare')`, pero **mantener la forma `.some()`** preserva la simetría y el patrón de constante (D-29-04). El comentario `(3)` referencia "Pitfall 3" tal cual en el analog.

**Idempotencia + pureza (T-21-02, copiar la garantía):** NO muta el input; re-ejecutar sobre un v11 ya migrado es no-op (`delete` de clave ausente + filtro sin matches + `inFlightTest` ya ajeno se preservan). El docblock de `migrate8to9` (`:826-850`) es la plantilla del docblock — adaptar "SEIS prefijos" → "UN prefijo (`presente-regolare`)" y "Phases 22-27" → "Phase 30".

---

### 2. `hydrateV11` (storage.js) — migration, transform

**Analog:** `hydrateV10` (`src/data/storage.js:994-1014`) — usar este, NO `hydrateV9`, porque `hydrateV10` ya incorpora el guard root defensivo `const p = (parsed && typeof parsed === 'object') ? parsed : {};` (línea 995) que `hydrateV9` no tiene.

**El shape root v11 es IDÉNTICO a v10** (D-29-05). `hydrateV11` **NO repite la poda** de `migrate10to11` — solo garantiza shape (un state que llega aquí ya viene v11-shaped o es un import a preservar). Copiar literal cambiando `10`→`11`:
```javascript
export function hydrateV11(parsed) {
  const p = (parsed && typeof parsed === 'object') ? parsed : {};
  return {
    schemaVersion: 11,
    exerciseStats: (typeof p.exerciseStats === 'object' && p.exerciseStats !== null)
      ? JSON.parse(JSON.stringify(p.exerciseStats))
      : {},
    categoryProgress: (typeof p.categoryProgress === 'object' && p.categoryProgress !== null)
      ? JSON.parse(JSON.stringify(p.categoryProgress))
      : {},
    dailyLog: (typeof p.dailyLog === 'object' && p.dailyLog !== null)
      ? JSON.parse(JSON.stringify(p.dailyLog))
      : {},
    songProgress: (typeof p.songProgress === 'object' && p.songProgress !== null)
      ? JSON.parse(JSON.stringify(p.songProgress))
      : {},
    lastBackupAt: typeof p.lastBackupAt === 'string' ? p.lastBackupAt : null,
    firstUsedAt: typeof p.firstUsedAt === 'string' ? p.firstUsedAt : null,
    inFlightTest: p.inFlightTest
  };
}
```

---

### 3. `RESET_PREFIXES_V11` (storage.js) — config/const

**Analog:** `RESET_PREFIXES_V9` (`src/data/storage.js:811-823`) — constante + docblock con el **gate de colisión de prefijo**.

```javascript
/**
 * Prefijos de id de categoría que `migrate10to11` resetea (D-29-03/04). Es la
 * categoría NUEVA `presente-regolare` que nace en Phase 30.
 *
 * Gate de colisión de prefijo (verificado 2026-06-16): ninguno de los 9 slugs
 * existentes (avere, essere, preposiciones, verbos-movimiento,
 * sustantivos-irregulares, genero-numero, profesiones, articoli, partitivos)
 * empieza por `presente-regolare` ni es prefijo suyo. El filtro `startsWith`
 * no tiene colisiones y preserva las 9 byte a byte. (Espejo de RESET_PREFIXES_V9.)
 */
const RESET_PREFIXES_V11 = ['presente-regolare'];
```

> El gate de colisión está VERIFICADO en `29-CONTEXT.md:73` (sección `Integration Points`). Copiar la lista de 9 slugs de ahí; el comentario de `RESET_PREFIXES_V9` (`:817-822`) es la plantilla del wording.

---

### 4. Dispatcher de cadena + `CURRENT_SCHEMA_VERSION` (storage.js)

**Analog:** `migrate()` (`src/data/storage.js:149-167`) + constante `:35`.

**Cambio 1 — bump constante** (`storage.js:35`):
```javascript
const CURRENT_SCHEMA_VERSION = 11;   // era 10
```

**Cambio 2 — eslabón nuevo en el dispatcher.** El bloque actual (`:160-161`):
```javascript
  if (s.schemaVersion === 9) s = migrate9to10(s);
  if (s.schemaVersion === 10) return hydrateV10(s);   // ← cambia esta línea
```
queda (espejo D-29-05):
```javascript
  if (s.schemaVersion === 9) s = migrate9to10(s);
  if (s.schemaVersion === 10) s = migrate10to11(s);   // NUEVO eslabón
  if (s.schemaVersion === 11) return hydrateV11(s);   // hydrate final apunta a v11
```
El bloque "Versión desconocida → warn + blankState" (`:163-166`) NO cambia. `blankState()` (`:68-79`) usa `CURRENT_SCHEMA_VERSION`, así que sube a 11 automáticamente con el bump de `:35` — no se toca su cuerpo (igual que `migrate8to9` dejó `blankState` sin reset porque un estado en blanco no tiene progreso que resetear).

---

### 5. `backup.js` — bump espejo + cadena + import + reject `>N`

**Analog:** `parseBackupFile` (`src/data/backup.js:73-147`), constante `:49`, import `:26`, reject `:119`, último eslabón cadena `:136-137`.

**Cambio 1 — import** (`backup.js:26`): añadir `migrate10to11, hydrateV11` a la lista nombrada:
```javascript
import { migrate1to2, migrate2to3, migrate3to4, migrate4to5, migrate5to6, migrate6to7, hydrateV7, migrate7to8, hydrateV8, migrate8to9, hydrateV9, migrate9to10, migrate10to11, hydrateV11 } from './storage.js';
```
> `hydrateV10` puede dejar de importarse si el último eslabón pasa a `hydrateV11` (revisar uso restante antes de quitarlo). `migrate9to10` se mantiene.

**Cambio 2 — bump constante espejo** (`backup.js:49`):
```javascript
const CURRENT_SCHEMA_VERSION = 11;   // era 10
```
Mantener la independencia documentada en el docblock `:28-48` (espejo manual de storage.js, NO import de la constante). Añadir una frase al docblock siguiendo el precedente de Phase 21 (`:39-42`): "Phase 29 (D-29 / MIG-05/06): bump 10 a 11 — `migrate10to11` resetea el progreso de la categoría nueva `presente-regolare` (no-op hoy; forward-compat de un backup futuro que ya la contenga); el set de sub-dicts sigue sin cambiar."

**Cambio 3 — eslabón en la cadena de migración** (`backup.js:136-137`):
```javascript
  if (migrated.schemaVersion === 9) migrated = migrate9to10(migrated);
  if (migrated.schemaVersion === 10) migrated = migrate10to11(migrated);   // NUEVO
  migrated = hydrateV11(migrated);   // antes hydrateV10
```

**Cambio 4 — reject `>N` ya es genérico** (`backup.js:119-124`): NO requiere edición de código — usa `CURRENT_SCHEMA_VERSION`, que ahora es 11, así que rechaza `schemaVersion > 11` automáticamente. Solo verificar el mensaje:
```javascript
  if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { ok: false, reason: `Este backup viene de una versión más nueva ... (esta app soporta hasta ${CURRENT_SCHEMA_VERSION}).` };
  }
```
`buildBackupWrapper` (`:161-168`) NO cambia (espeja `state.schemaVersion`, que sube vía storage al migrar).

---

### 6. Tests de la cadena v11 — `tests/data-storage.test.js`

**Analog directo:** bloque `describe('data/storage v9 — migrate8to9 reset selectivo de las 6 categorías (Phase 21)')` (`tests/data-storage.test.js:1121-1375`). Es la plantilla exacta — clonar y adaptar de 6 categorías → 1 (`presente-regolare`), preservando las 9 reales.

**Cambios obligatorios al clonar el bloque v9:**
1. **Import** (`tests/data-storage.test.js:28`): añadir `migrate10to11, hydrateV11`.
2. **Helper fixture** (espejo de `v8WithSixCategories`, `:1126-1156`): crear un `v10WithPresenteRegolare()` que tenga progreso ficticio bajo `presente-regolare` (la reseteada) + las 9 reales (las preservadas). `schemaVersion: 10`.
3. **Tests a clonar uno a uno** (mismos nombres adaptando "6"→"presente-regolare"):
   - borra categoryProgress de presente-regolare, deja las 9 intactas (`:1158-1174`)
   - poda exerciseStats por prefijo, preserva las 9 (`:1176-1186`)
   - invalida inFlightTest que referencia ids de presente-regolare (`:1188-1212`)
   - preserva inFlightTest ajeno (`:1214-1227`)
   - sin inFlightTest no crashea (`:1229-1233`)
   - **idempotente** (`:1235-1241`)
   - **puro / no muta input** (`:1243-1252`)
   - **anti-prototype-pollution `__proto__`** (`:1254-1259`) — clave: `schemaVersion: 10` en el JSON malicioso
   - sub-dict corrupto cae a `{}` (`:1261-1270`)
   - `hydrateV11` espejo SIN poda (`:1272-1291`)
   - `hydrateV11` normaliza sub-dicts ausentes (`:1293-1299`)
   - cadena `v10 → v11` (`:1304-1324`)
   - **no-regresión byte-idéntica** (`:1329-1374`) — el test REFORZADO: fixture con las 9 reales + presente-regolare, snapshot `JSON.parse(JSON.stringify(...))` pre-migración, assert deep-equal byte a byte de las 9 post-migración + presente-regolare ausente. **Este es el que demuestra D-29-07(a).**

**Test del bump de `blankState`/cadena nominal:** mirar también el bloque `describe('data/storage v10 — migrate9to10 nominal')` (`:1387-1497`) y `describe('… blankState v10 …')` (`:36-55`) — de aquí copiar:
   - `blankState() devuelve schemaVersion 11` (espejo de `:1494-1496`)
   - `blankState()` shape v11 completo (espejo de `:37-50`)
   - cadena end-to-end `v8 → v11` opcional (espejo de `:1470-1492`, pero ahora la cadena llega a 11 vía `migrate10to11`).

**Estructura del fixture — fidelidad al analog** (`:1126-1156`): cada categoría tiene `{ status, streakDays, clearedExerciseIds: ['<cat>-001'], lastSuccessDate }` en categoryProgress y `{ timesShown, timesCorrect, timesFailed }` en exerciseStats keyed `<cat>-001`. Reusar este shape.

---

### 7. Tests de backup v11 round-trip — `tests/backup.test.js`

**Analog directo:** `describe('data/backup v9 — round-trip + import v8→v9 (Phase 21)')` (`tests/backup.test.js:417-533`) + el reject-future test (`:578-586`).

**Cambios al clonar:**
1. **Helper `stateV11()`** (espejo de `stateV9`, `:420-438`): `schemaVersion: 11` con progreso en las categorías PRESERVADAS (las 9 reales) → demuestra round-trip sin pérdida.
2. **Tests a clonar:**
   - `round-trip v11: export → import sin "versión más nueva"` (espejo `:440-447`); assert `r.state.schemaVersion === 11`.
   - `round-trip v11 preserva el progreso de las 9 categorías intacto` (espejo `:449-460`).
   - `import de backup v10 → state v11 con presente-regolare reseteada` (espejo `:462-502`, que importa v8 y verifica reset) — fixture v10 con progreso ficticio bajo `presente-regolare` + una real; assert presente-regolare podada, la real preservada byte a byte.
3. **Reject futuro** (espejo `:578-586`): clonar a `rejects future schemaVersion > 11 (menciona "versión más nueva")` con `schemaVersion: 12` en wrapper y state.
4. **Ajustar los asserts existentes que esperan `r.state.schemaVersion === 10`**: hay MUCHOS (`:121, :155, :175, :198, :246, :294, :446, :488, :527` y más). Tras el bump, la cadena de backup sale como **v11**, así que esos `assert.equal(r.state.schemaVersion, 10)` pasan a `11`. Buscar con `grep -n "schemaVersion, 10" tests/backup.test.js` y actualizar; lo mismo en `tests/data-storage.test.js` para los asserts de cadena que esperan 10. El test `blankState() … v10` (`tests/backup.test.js:91-93`) pasa a v11.

> Precedente directo del plan: `.planning/milestones/v1.6-phases/21-migraci-n-8-9-reset-selectivo-de-las-6-categor-as/21-01-PLAN.md` (plantilla de tareas/tests) y `21-VERIFICATION.md` (must-haves). El executor sigue ese plan adaptando 6→1.

---

## Shared Patterns

### Deep-clone defensivo anti-prototype-pollution
**Source:** todos los `migrateNtoN+1` (canónico `migrate8to9`, `storage.js:853-870`).
**Apply to:** cada sub-dict de `migrate10to11` y `hydrateV11`.
```javascript
(typeof X === 'object' && X !== null) ? JSON.parse(JSON.stringify(X)) : {}
```
El test `__proto__ own-property no contamina el global` (`tests/data-storage.test.js:1254-1259`) es la verificación obligatoria — clonar con `schemaVersion: 10` en el JSON malicioso.

### Reset por prefijo (`startsWith`), no por igualdad
**Source:** `migrate8to9` pasos (2) y (3) (`storage.js:863-879`).
**Apply to:** poda de `exerciseStats` e invalidación de `inFlightTest` en `migrate10to11`. Cubre ids legacy Y los ids de slot que produzca Phase 30 (todos empiezan por `presente-regolare`).

### Bump espejo storage.js ↔ backup.js manteniendo independencia
**Source:** `storage.js:35` + `backup.js:49` (docblock `:28-48` documenta por qué se duplica en vez de importar).
**Apply to:** los dos `CURRENT_SCHEMA_VERSION = 11`. NO refactorizar a import compartido — es deliberado para que `backup.js` sea testeable aislado.

### `hydrateVN` NO repite la poda de `migrateN-1toN`
**Source:** docblock de `hydrateV9` (`storage.js:898-915`) y `hydrateV7`/`hydrateV8`.
**Apply to:** `hydrateV11` solo garantiza shape; el reset lo hace `migrate10to11` en la cadena.

---

## No Analog Found

Ninguno. Los 3 artefactos (migración, hydrate, constante) + cadena + backup + tests tienen analog exacto en la cadena existente. Esta fase es replicación pura del patrón v1.5/v1.6.

---

## Metadata

**Analog search scope:** `src/data/`, `tests/`
**Files scanned:** `src/data/storage.js` (1014 líneas), `src/data/backup.js` (168 líneas), `tests/data-storage.test.js` (1497 líneas), `tests/backup.test.js` (parcial: bloques v9/v10/reject)
**Pattern extraction date:** 2026-06-16
**Gate de versión confirmado en código:** `CURRENT_SCHEMA_VERSION = 10` → target `11` (NO `9→10`)
