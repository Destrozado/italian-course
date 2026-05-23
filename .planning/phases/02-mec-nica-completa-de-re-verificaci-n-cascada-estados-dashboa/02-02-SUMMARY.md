---
phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
plan: 02
subsystem: domain
tags: [sampler, set-cover, fisher-yates, weighted-random, regression-boot, pure-domain, node-test]

requires:
  - phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
    plan: 01
    provides: applySessionResult v2 + storage schemaVersion=2 + test-helpers (blankStateV2/makeContent/setupHechaState/setupDominadaState)
provides:
  - buildSession con GUARANTEE phase (D-49) + FILL phase (preservado) + Fisher-Yates final — firma de Phase 1 intacta
  - buildFullTest nueva export (D-50) — modo Test completo del picker, Fisher-Yates determinista sobre el pool entero
  - weightedPickOne helper privado factorizado — reusado por GUARANTEE y FILL
  - applyNewExerciseRegression nueva export en progress.js (D-40, DOMAIN-06) — preserva clearedExerciseIds al regresar
  - Suite de 13 tests añadidos cubriendo D-53.4 (8 sampler) + D-53.3b (5 DOMAIN-06)
affects: [02-03, 02-04]

tech-stack:
  added: []
  patterns:
    - "set-cover greedy con alreadyCovered chequeo para multi-cat coverage"
    - "oversubscription protection con `break` al alcanzar targetSize (silent skip D-51)"
    - "helper privado factorizado (weightedPickOne) reusado por dos fases del mismo algoritmo"
    - "función pura de boot regression separada del flujo de sesión (Pitfall #10)"
    - "RNG inyectable (seededLcg) compartido entre 1000 iteraciones del statistical ratio test — semillas consecutivas producen primer-output correlacionado"

key-files:
  created:
    - tests/domain-session.test.js (8 tests del sampler bajo D-53.4)
    - .planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-02-SUMMARY.md
  modified:
    - src/domain/session.js (GUARANTEE phase + buildFullTest export + weightedPickOne privado)
    - src/domain/progress.js (applyNewExerciseRegression nueva export + header con D-40)
    - tests/domain-progress.test.js (+5 tests bajo D-53.3b, import extendido con applyNewExerciseRegression)

key-decisions:
  - "Statistical ratio test usa UN solo seededLcg(42) compartido entre las 1000 iteraciones, NO seededLcg(seed+i) por iteración (deviation de RESEARCH.md). Las LCGs con semillas consecutivas producen un primer output altamente correlacionado (step ≈ 1664525/2^32) que falsea el ratio (observado 3.65 vs esperado ~11). Con LCG compartida el state evoluciona correctamente entre iteraciones y la distribución es pseudo-uniforme (observado 10.36)."
  - "applyNewExerciseRegression queda como export top-level en progress.js junto a applySessionResult, NO nested dentro de ésta (Pitfall #10 explícito en JSDoc)."
  - "buildExercisesByCategory helper privado se reusa entre applySessionResult y applyNewExerciseRegression — DRY sin exportar el helper."
  - "Fisher-Yates final del buildSession se conserva idéntico al de Phase 1: los picks de GUARANTEE no se quedan al inicio del array, mantiene determinismo con RNG fijo."

patterns-established:
  - "Pattern: GUARANTEE + FILL phases con weightedPickOne reusado — separa la garantía de cobertura (set-cover greedy) del relleno ponderado, ambos sobre la misma función de muestreo"
  - "Pattern: boot regression como función pura separada — la regresión por content drift NO se mezcla con la lógica de sesión; el caller (main.js) compone ambas en el flujo correcto"
  - "Pattern: statistical ratio test con RNG compartido entre iteraciones para evitar correlación de primer-output en LCGs con semillas consecutivas"
  - "Pattern: tests de unicidad por Set size (`new Set(ids).size === ids.length`) en lugar de chequeos de orden — alineado con Fisher-Yates final"

requirements-completed: [DOMAIN-03, DOMAIN-06, DOMAIN-10]

duration: ~20min
completed: 2026-05-23
---

# Phase 2 Plan 02-02: Mecánica completa de re-verificación (sampler + DOMAIN-06) Summary

**Sampler completo (GUARANTEE + FILL + buildFullTest) + DOMAIN-06 implementado como `applyNewExerciseRegression` pura separada con preservación crítica de `clearedExerciseIds` (D-40) — 51 tests verdes (38 supervivientes Plan 02-01 + 8 sampler nuevos + 5 DOMAIN-06 nuevos).**

## Performance

- **Duración:** ~20 min
- **Iniciado:** 2026-05-23
- **Completado:** 2026-05-23
- **Tareas:** 2 (Task 1 sampler, Task 2 applyNewExerciseRegression)
- **Archivos modificados:** 3
- **Archivos creados:** 2 (1 test + este SUMMARY)

## Accomplishments

- **GUARANTEE phase funcionando como set-cover greedy:** para cada categoría seleccionada, `buildSession` garantiza ≥1 ejercicio si hay candidates. Un ejercicio multi-cat (p.ej. `[avere, genero]`) picked una sola vez cubre ambas — el chequeo `alreadyCovered` evita duplicación. Verificado por test con 2 categorías + 1 ejercicio multi-cat → `actualSize=1`.
- **Oversubscription gestionada silenciosa (D-51):** test con 25 categorías marcadas + targetSize=20 produce exactamente `actualSize=20`. El `break` en la GUARANTEE phase corta cuando alcanza target. Las 5 categorías sobrantes se ignoran sin warning (diferido a Phase 5).
- **`buildFullTest` determinista:** mismo seed produce mismo orden. Pool entero entra (12 ejercicios → 12 IDs únicos). Sin tope, sin weighted, sin guarantee phase.
- **Weight cap=10 estadísticamente verificado:** ejercicio `cold` (timesShown=0) seleccionado ~10x más que `hot` (timesShown=100). 1000 iteraciones con LCG compartida producen ratio 10.36 (tolerancia [8, 14]).
- **DOMAIN-06 boot regression como función PURA separada:** `applyNewExerciseRegression(state, content)` detecta categorías `hecha`/`dominada` con ejercicios nuevos no cubiertos, las regresa a `no-hecha` y **preserva `clearedExerciseIds`** (D-40 explícito y verificado por test). NO va dentro de `applySessionResult` (Pitfall #10 documentado en JSDoc).
- **Firma `buildSession` preservada de Phase 1:** los 3 tests existentes sobre `buildSession` siguen verdes sin cambios — solo el cuerpo creció con la GUARANTEE phase antes del FILL.
- **Layer purity intacta:** ni `session.js` ni `progress.js` importan de `data/*` o `screens/*`.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: buildSession con GUARANTEE phase + buildFullTest + weightedPickOne** — `8b09368` (feat)
2. **Task 2: applyNewExerciseRegression (DOMAIN-06 boot regression)** — `d673438` (feat)

## Files Created/Modified

### Creados

- `tests/domain-session.test.js` — 8 tests bajo `domain/session — D-53.4a/4b`. Cubre:
  - GUARANTEE phase multi-cat coverage (1 pick cubre 2 categorías)
  - GUARANTEE phase con 3 cats y pool=3 (FILL no añade más)
  - Oversubscription 25 cats / target=20 con drop silente
  - Weighted statistical ratio (tolerancia [8, 14])
  - `categoryIds=[]` defensivo (pool vacío)
  - `buildFullTest` con 12 ejercicios en 2 categorías + determinismo por seed
  - `buildFullTest` con pool vacío sin throw
  - `buildFullTest` filtrando por categoryIds

- `.planning/phases/.../02-02-SUMMARY.md` — este documento.

### Modificados

- `src/domain/session.js`:
  - **Algoritmo extendido a 4 pasos:** Pool → GUARANTEE (D-49) → FILL → Fisher-Yates. Firma `buildSession(categoryIds, allExercises, state, requestedSize, mode, rng)` PRESERVADA.
  - **Helper privado `weightedPickOne(candidates, state, rng)`** factorizado del FILL phase de Phase 1 — ahora reusado también por GUARANTEE.
  - **Nueva export `buildFullTest(categoryIds, allExercises, rng)`** (D-50) — Fisher-Yates sobre el pool entero.
  - **Header actualizado** con D-49, D-50, D-51. JSDoc de `buildSession` documenta los 4 pasos del nuevo algoritmo.

- `src/domain/progress.js`:
  - **Nueva export `applyNewExerciseRegression(state, content)`** (D-40, DOMAIN-06). Bucle por categoryProgress; si `cat.status ∈ {'hecha','dominada'}` y hay ejercicios en el content fuera de `clearedExerciseIds`: regresa a `no-hecha` con `streakDays=0`, `becameHechaAt=undefined`, `becameDominadaAt=undefined`. **`clearedExerciseIds` PRESERVADO.**
  - **JSDoc explícito** sobre Pitfall #10: "Esta función NO va dentro de `applySessionResult`. Se invoca UNA VEZ al boot por `main.js`."
  - **Reuso del helper privado `buildExercisesByCategory`** ya existente (sin duplicar).
  - **Header actualizado** con D-40 (boot regression).

- `tests/domain-progress.test.js`:
  - **Import extendido:** `import { applySessionResult, applyNewExerciseRegression } from '../src/domain/progress.js'`.
  - **Nuevo `describe('domain/progress — D-53.3b applyNewExerciseRegression (DOMAIN-06)')`** con 5 tests cubriendo:
    1. `hecha → no-hecha` con cleared preservado (D-40 explícito)
    2. `dominada → no-hecha` con `becameDominadaAt` borrado y cleared preservado
    3. Categoría `no-hecha` NO se toca (solo regresan estados promocionados)
    4. Idempotencia (categoría hecha con cleared cubriendo todo → no se regresa)
    5. Pureza estricta del input (deep-equal contra fixture builder doble)

## Distribución final de tests

| Suite | Tests | Origen |
|-------|-------|--------|
| `tests/domain.test.js` | 12 | Phase 1 supervivientes (dates, session/weight+filter/empty, schema-validator, multiple-choice, registry) |
| `tests/data-storage.test.js` | 8 | Plan 02-01 |
| `tests/domain-progress.test.js` | 18 + 5 = 23 | Plan 02-01 base + Plan 02-02 DOMAIN-06 |
| `tests/domain-session.test.js` | 8 | **NUEVO en este plan** |
| **Total** | **51** | `node --test tests/*.test.js` exits 0 |

## Cómo Plan 02-03 consumirá estos contratos

### `buildSession` (D-49)

`src/screens/picker.js` (Plan 02-03) llamará:

```js
import { buildSession } from '../domain/session.js';
const { exerciseIds, actualSize } = buildSession(
  selectedCategoryIds,   // array de IDs marcados en el picker
  this.allExercises,     // del content loaded
  this.state,            // del store
  20,                    // requestedSize fijo (D-08)
  'repaso',
  Math.random            // o seededLcg(seed) para debugging
);
```

Para 6 categorías seleccionadas, la GUARANTEE phase intentará cubrir las 6 antes de la FILL → el dashboard del Plan 02-03 puede confiar en que cada categoría se práctica ≥1 vez por sesión (cuando hay candidates).

### `buildFullTest` (D-50)

Cuando el usuario elige "Test completo" en el picker (modo distinto de "Repaso 20"):

```js
import { buildFullTest } from '../domain/session.js';
const { exerciseIds, actualSize } = buildFullTest(
  selectedCategoryIds,
  this.allExercises,
  Math.random
);
// Persistir state.inFlightTest = { categoryIds: selectedCategoryIds, exerciseIds, cursor: 0, answers: [], startedAt: Date.now() }
```

`actualSize` puede ser arbitrariamente grande (no hay tope). El picker debe mostrar el número antes del "Empezar" para que el usuario confirme.

### `applyNewExerciseRegression` (D-40)

Plan 02-03 modificará `src/main.js` para invocar la función en el boot. Snippet de integración:

```js
// src/main.js (Plan 02-03 lo añadirá)
import { applyNewExerciseRegression } from './domain/progress.js';
import { loadContent } from './data/content-loader.js';
import { loadState, saveState } from './data/storage.js';

async function bootstrap() {
  const content = await loadContent();
  const state0 = loadState();                              // migración v1→v2 transparente

  // ── DOMAIN-06: regresión por ejercicio nuevo añadido al JSON ──
  const stateAfterRegression = applyNewExerciseRegression(state0, content);
  if (stateAfterRegression !== state0) {
    saveState(stateAfterRegression);                        // persistir si hubo cambios
  }

  // Resolver appDataReady con stateAfterRegression
  resolveAppData({ content, state: stateAfterRegression });
}
```

Una sola vez por boot. Tras este paso, las categorías regresadas mostrarán el estado `no-hecha` en el dashboard del home — el banner "Categoría X ha vuelto a no-hecha porque añadiste un ejercicio nuevo" (si Plan 02-03 lo implementa) podrá comparar `state0.categoryProgress[id].status` con `stateAfterRegression.categoryProgress[id].status` para detectar qué categorías regresaron.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Statistical ratio test inicial daba ratio=3.65 con `seededLcg(seed+i)` por iteración**

- **Found during:** Task 1, primer run de `tests/domain-session.test.js`.
- **Issue:** El test "weighted statistical ratio" siguiendo el patrón documentado en `02-RESEARCH.md` (`seededLcg(1000 + i)` por iteración) producía ratio=3.65 (cold=785, hot=215), muy por debajo del esperado ~11. La causa: una LCG con semillas consecutivas tiene su PRIMER output altamente correlacionado — el step es `1664525/2^32 ≈ 0.000387`, por lo que 1000 semillas consecutivas cubren una franja de ~0.387 del intervalo [0,1) en vez de distribuirse uniformemente. Con probabilidad teórica de pick `hot` = 1/12 ≈ 0.0833, la cola del intervalo está infra-representada cuando se usa solo el primer output de LCGs con semillas consecutivas.
- **Fix:** Reemplazar `seededLcg(1000 + i)` por una sola instancia `const rng = seededLcg(42)` compartida entre las 1000 iteraciones del bucle. El state del LCG evoluciona correctamente entre llamadas y produce una distribución pseudo-uniforme. Ratio observado tras el fix: 10.36 (dentro de la tolerancia [8, 14]).
- **Validación independiente:** un mini-test en `/tmp/test_lcg.mjs` con el mismo predicado (`r ≤ 1` vs `r > 1` con `totalWeight = 12/11`) confirma el sesgo: approach A (LCG fresca por iter) = 3.65, approach B (LCG compartida) = 10.36, approach C (`Math.random`) = 10.49. Conclusión: la LCG compartida ES correcta; la documentación de RESEARCH.md tiene un bug menor del que merece nota en futuras suites.
- **Files modified:** `tests/domain-session.test.js`. Documentado en comentario inline de bloque del test.
- **Commit:** `8b09368` (incorporado en el commit de Task 1).
- **Justificación de la categoría:** Rule 1 (auto-fix de test bug) — la función bajo prueba (`buildSession` weighted sampling) es correcta; el bug está en cómo el test consumía el RNG.

**Sin otras desviaciones.** El plan se ejecutó exactamente como estaba escrito en los demás aspectos: GUARANTEE phase, `buildFullTest`, `applyNewExerciseRegression`, tests Phase 1 intactos.

## Tests añadidos vs mínimo del plan

El plan exigía:
- ≥6 tests en `tests/domain-session.test.js` → entregados **8** (5 GUARANTEE + 3 buildFullTest)
- ≥4 tests en el nuevo describe DOMAIN-06 → entregados **5** (4 funcionales + 1 pureza)

Los tests extra cubren defensivos (`categoryIds=[]` para sampler, `buildFullTest` con filtrado por categoryIds) que protegen ante refactors futuros.

## Self-Check: PASSED

**Archivos creados:**
- `tests/domain-session.test.js` — FOUND
- `.planning/phases/.../02-02-SUMMARY.md` — FOUND (this file)

**Archivos modificados:**
- `src/domain/session.js` — diff aplicado, `buildFullTest` exportado, `weightedPickOne` privado, GUARANTEE phase en `buildSession`, D-49/D-50/D-51 en header.
- `src/domain/progress.js` — `applyNewExerciseRegression` exportada como top-level (no nested), `clearedExerciseIds NO se vacía` documentado, D-40 en header.
- `tests/domain-progress.test.js` — import extendido, nuevo `describe('domain/progress — D-53.3b ...')` con 5 tests.

**Commits:**
- `8b09368` — FOUND (Task 1: GUARANTEE phase + buildFullTest + weightedPickOne)
- `d673438` — FOUND (Task 2: applyNewExerciseRegression)

**Verificación final:** `node --test tests/*.test.js` exits 0 con **51 tests pasando** (objetivo del plan: ≥32 — superado por +59%). Sin warnings, sin skips, sin todos.

Acceptance criteria de las dos tareas verificados manualmente con grep tras cada commit (`alreadyCovered` ≥1 match, `D-49`/`D-50`/`D-40` en headers, `export function buildFullTest`/`applyNewExerciseRegression` matches top-level, `clearedExerciseIds`/`preservado` en docstrings).
