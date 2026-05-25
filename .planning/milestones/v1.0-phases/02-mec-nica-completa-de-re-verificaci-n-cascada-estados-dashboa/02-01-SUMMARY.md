---
phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
plan: 01
subsystem: domain
tags: [state-machine, cascade, streak, schema-migration, pure-domain, node-test]

requires:
  - phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
    provides: blankState v1 + applySessionResult v1 (counters monotónicos) + layer purity D-02 + Promise-handoff Alpine bootstrap
provides:
  - applySessionResult con firma extendida (state, sessionResult, content, today) y máquina de estados completa
  - Migración storage schemaVersion 1 → 2 transparente con preservación de exerciseStats
  - Helpers de test compartidos (blankStateV2, makeContent, setupHechaState, setupDominadaState) reusables en Plans 02-02 y 02-04
  - Suite de 18 tests del dominio cubriendo cascada multi-cat, promociones, racha guard, simulación 21 días, dailyLog idempotente, regresión desde dominada, limpieza de inFlightTest
affects: [02-02, 02-03, 02-04]

tech-stack:
  added: []
  patterns:
    - "schemaVersion-based migrate(parsed) en cadena (extiende Phase 1)"
    - "today inyectado como parámetro string ISO (no Date.now() en el dominio) — habilita simulaciones N-día deterministas"
    - "spread-clone defensivo recursivo en sub-objetos (state, exerciseStats, categoryProgress, dailyLog)"
    - "uniqueStrings(arr) helper para acumulación idempotente sin duplicados"

key-files:
  created:
    - tests/domain-progress.test.js (18 tests del state machine)
    - tests/data-storage.test.js (8 tests de migración pura)
    - tests/util/test-helpers.js (helpers compartidos blankStateV2/makeContent/setupHechaState/setupDominadaState)
    - .planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-01-SUMMARY.md
  modified:
    - src/data/storage.js (CURRENT_SCHEMA_VERSION 1→2, blankState v2, migrate1to2, hydrateV2)
    - src/domain/progress.js (applySessionResult firma extendida + máquina de estados completa con helpers privados)
    - tests/domain.test.js (eliminado bloque describe('domain/progress') — movido a domain-progress.test.js, import limpiado)

key-decisions:
  - "Firma de applySessionResult rota intencionalmente (Pitfall #2): ahora exige (state, sessionResult, content, today). Sin breaking change había imposibilidad de testear racha 21 días sin tocar reloj global."
  - "applyNewExerciseRegression (DOMAIN-06) NO se implementa en este plan — vive en Plan 02-02 como export separada para invocarse SOLO en boot (Pitfall #10)."
  - "KEY 'italianCourse.v1' de localStorage NO cambia entre Phase 1 y Phase 2 (D-41 deliberado): preserva estado v1 del autor sin perder counters históricos."
  - "migrate1to2 NO hidrata categoryProgress retroactivamente — v1 no guardaba racha ni clearedExerciseIds, es imposible inferir si una categoría estaba 'hecha'. Tras la migración todas las categorías arrancan vacías; la próxima sesión las re-cubre via lazy init D-47."
  - "Pureness de applySessionResult validada con doble fixture builder (no JSON round-trip) — JSON.parse(JSON.stringify) descarta claves con valor undefined y disparaba falsos positivos en strict deep-equal."

patterns-established:
  - "Pattern: maquina de estados puramente funcional con today inyectado — clave para tests N-día deterministas sin mocks de Date"
  - "Pattern: fail-wins absoluto evaluado al final de sesión — categoría con 1 fallo descarta TODOS los aciertos (sesión + acumulados). 1 invariante = 0 bugs sutiles de orden de evaluación"
  - "Pattern: lazy initialization de categoryProgress[id] vía helper blankCategoryProgress() en lugar de pre-poblado en blankState/migrate — defensivo para futuros añadidos de categoría sin requerir migración"
  - "Pattern: helpers de test en tests/util/test-helpers.js (no en cada archivo de test) — preparados para Plans 02-02 y 02-04 sin duplicación"

requirements-completed: [DOMAIN-04, DOMAIN-05, DOMAIN-07, DOMAIN-08, DOMAIN-10]

duration: ~25min
completed: 2026-05-23
---

# Phase 2 Plan 02-01: Mecánica completa de re-verificación (motor puro) Summary

**Máquina de estados pura del dominio v2: cascada fail-wins, promociones no-hecha→hecha→dominada (21 días), racha con `lastSuccessDate` guard, `dailyLog` idempotente, migración schemaVersion 1→2 transparente — 38 tests verdes (14 supervivientes Phase 1 + 8 nuevos de storage + 18 nuevos del state machine).**

## Performance

- **Duración:** ~25 min
- **Iniciado:** 2026-05-23
- **Completado:** 2026-05-23
- **Tareas:** 2 (Task 1 storage v2, Task 2 applySessionResult extendido)
- **Archivos modificados:** 3
- **Archivos creados:** 4 (3 fuente/test + 1 SUMMARY)

## Accomplishments

- **Dominio puro v2 funciona end-to-end:** la simulación de 21 días consecutivos promociona Avere a `dominada` con `becameDominadaAt='2026-06-21'` y `streakDays=21`. Un test verifica la cadena completa sin un solo mock global.
- **Cascada multi-categoría implementada y verificada:** ejercicio `[avere, genero]` fallado tras acierto previo de `[avere]` resetea ambas categorías a `no-hecha` con `clearedExerciseIds=[]` y `streakDays=0`. Test D-53.1 explícito.
- **Migración storage v1→v2 con preservación lossless de `exerciseStats`:** un estado v1 cargado se convierte automáticamente a v2 con sus contadores históricos intactos. Tests defensivos pasan ante `exerciseStats: null` y ausencia del campo.
- **`lastSuccessDate` guard testeado:** 5 sesiones el mismo día tocando una categoría `hecha` sin fallar incrementan `streakDays` UNA SOLA VEZ. Sin guard, este test fallaría y la racha sería trivialmente farmable.
- **`inFlightTest` se limpia automáticamente al terminar la sesión** (Pitfall #9): tras `applySessionResult`, la clave `inFlightTest` ya no existe en el objeto devuelto. Plan 02-03 podrá lanzar Test completo confiando en que la cascada no resurge con el blob viejo.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: Storage v2 — blankState + migrate1to2 + hydrateV2** — `03aa2f8` (feat)
2. **Task 2: applySessionResult extendido — cascada + promociones + racha guard + dailyLog** — `145d201` (feat)

## Files Created/Modified

### Creados

- `tests/domain-progress.test.js` — 18 tests cubriendo D-53.1 (cascada multi-cat, 3 tests), D-53.2 (promoción y regresión completas, 4 tests incluyendo simulación 21 días), D-53.3 (racha guard + dailyLog + edge cases + pureza + monotonicidad + inFlightTest cleanup, 9 tests) + 2 tests heredados de Phase 1 actualizados a la nueva firma.
- `tests/data-storage.test.js` — 8 tests de las funciones puras de migración (`blankState`, `migrate1to2`, `hydrateV2`) sin tocar la API de `localStorage`.
- `tests/util/test-helpers.js` — `blankStateV2()`, `makeContent(specs)`, `setupHechaState(cat, ids, opts)`, `setupDominadaState(cat, ids, opts)`. Preparados para reutilización en Plans 02-02 (sampler) y 02-04 (acceptance + tests del refactor).
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-01-SUMMARY.md` — este documento.

### Modificados

- `src/data/storage.js`:
  - `CURRENT_SCHEMA_VERSION = 2` (antes `1`).
  - `KEY = 'italianCourse.v1'` SIN CAMBIO deliberado (D-41 — preserva state v1 del autor).
  - `blankState()` devuelve shape v2 completo: `{schemaVersion:2, exerciseStats:{}, categoryProgress:{}, dailyLog:{}}` (`inFlightTest` omitido).
  - `migrate(parsed)` enruta por schemaVersion: 2 → `hydrateV2`, 1 → `migrate1to2`, desconocido → warn + `blankState()`.
  - Nuevas exports públicas `migrate1to2`, `hydrateV2` (test-only, documentadas como tales en JSDoc).
  - Header con referencias D-41, D-46, D-47 + nota "inFlightTest vive en el mismo blob, no en una key separada".

- `src/domain/progress.js`:
  - **Firma rota intencionalmente:** `applySessionResult(state, sessionResult, content, today)` — ahora exige 4 argumentos (D-52). El JSDoc lo documenta explícitamente con la nota de Pitfall #2.
  - Algoritmo derivado línea por línea del pseudocódigo canónico de 02-RESEARCH.md "Algoritmo applySessionResult (HIGH)".
  - 4 helpers privados nuevos: `blankStat()`, `blankCategoryProgress()`, `buildExercisesByCategory(content)`, `uniqueStrings(arr)`.
  - 6 pasos del algoritmo numerados en comentarios para facilitar trazabilidad con D-39.
  - **`applyNewExerciseRegression` deliberadamente NO incluida** — comentario explícito en el header señala que esa export es Plan 02-02 (Pitfall #10).

- `tests/domain.test.js`:
  - Eliminado el bloque `describe('domain/progress', ...)` íntegro (2 tests).
  - Eliminado el `import { applySessionResult }`.
  - Comentario marcando el split a `tests/domain-progress.test.js`.
  - Las suites restantes (`domain/dates`, `domain/session`, `data/schema-validator`, `exercise-types/multiple-choice`, `exercise-types/index`) siguen verdes — 12 tests sobrevivientes.

## Cambio de firma de `applySessionResult` (Pitfall #2 documentado)

Phase 1 expone:

```js
applySessionResult(state, sessionResult)   // solo contadores
```

Phase 2 cambia a:

```js
applySessionResult(state, sessionResult, content, today)   // máquina de estados completa
```

**Por qué es una decisión deliberada (no un error):**

1. **Testabilidad de racha 21 días.** Sin `today` inyectado, simular 21 días requiere `t.mock.timers.enable({apis:['Date']})` o monkey-patch global. Con `today: string`, los tests pasan strings ISO y la suite es trivialmente determinista.
2. **Capacidad de cascada multi-categoría.** Sin `content`, la función no puede saber qué categorías toca cada `exerciseId` ni cuántos ejercicios tiene cada categoría (necesario para `isCovered`).
3. **Layer-purity preservada.** La función sigue siendo pura: no importa `dates.js`, no llama `todayLocal()`, no toca DOM/storage/fetch. El caller (`src/screens/app.js` en Plan 02-03) ejecuta `todayLocal()` y se lo pasa.
4. **No hay caller fuera del dominio aún.** Phase 1 tenía UN solo caller (en `src/screens/session.js`). Phase 2 lo reemplaza por completo (Plan 02-03), así que la "rotura" es trivialmente coordinada en el mismo phase.

**Tests viejos actualizados, no eliminados:** los 2 tests de Phase 1 sobre `applySessionResult` se movieron a `tests/domain-progress.test.js` actualizando los argumentos a la nueva firma. La lógica testeada (contadores monotónicos, no-mutación del input) sigue siendo válida y verde.

## Shape v2 final del estado

```ts
{
  schemaVersion: 2,
  exerciseStats: Record<exerciseId, {
    timesShown: number,
    timesCorrect: number,
    timesFailed: number
  }>,
  categoryProgress: Record<categoryId, {
    status: 'no-hecha' | 'hecha' | 'dominada',
    clearedExerciseIds: string[],
    streakDays: number,
    lastPracticedDate?: string,    // 'YYYY-MM-DD'
    lastSuccessDate?: string,      // 'YYYY-MM-DD'
    becameHechaAt?: string,        // 'YYYY-MM-DD'
    becameDominadaAt?: string      // 'YYYY-MM-DD'
  }>,
  dailyLog: Record<isoDate, {
    date: string,                  // ISO 'YYYY-MM-DD'
    categoriesPracticed: string[],
    categoriesWithFailure: string[]
  }>,
  inFlightTest?: {                 // populado por Plan 02-03; este plan solo respeta la key
    categoryIds: string[],
    exerciseIds: string[],
    cursor: number,
    answers: Array<{exerciseId, correct}>,
    startedAt: number              // epoch ms
  }
}
```

**Cadena de migración:**

```
schemaVersion === 2  →  hydrateV2(parsed)        // defensive type-guards
schemaVersion === 1  →  migrate1to2(parsed)      // preserva exerciseStats, inicializa los demás vacíos
otro / sin parsed    →  blankState()             // warn + estado nuevo
```

## Tests nuevos por grupo D-53

| Grupo | Suite | Tests | Verifican |
|-------|-------|-------|-----------|
| **D-53.1** Cascada multi-cat | `domain/progress — D-53.1` | 3 | Ejercicio multi-cat fallado resetea AMBAS categorías; 1 fallo + 5 aciertos sigue resetando (fail-wins absoluto); fallo en una categoría no afecta a una ajena que se acertó. |
| **D-53.2** Promoción y regresión | `domain/progress — D-53.2` | 4 | Cubrir todos los ejercicios en una sesión promociona a `hecha` con `streakDays=1`; 3 sesiones acumulativas promocionan SOLO al cubrir el último; simulación 21 días promociona a `dominada` con `becameDominadaAt='2026-06-21'`; fallo desde `dominada` regresa a `no-hecha` con todo el state reseteado. |
| **D-53.3** Racha guard + edges | `domain/progress — D-53.3` | 9 | 5 sesiones mismo día → streak `+= 1` única vez; sesión vacía no muta funcionalmente; categoryIds=[] no toca categoryProgress; `dailyLog` shape D-48 correcto; idempotencia en invocaciones múltiples mismo día; pureza estricta del input; `exerciseStats` monotónico tras fallo; `inFlightTest` borrado tras la función; categoría `hecha` que toca solo 1/2 ejercicios incrementa racha (caso límite #1). |
| **Heredado** Phase 1 actualizados | `domain/progress — contadores monotónicos` | 2 | Contadores incrementan + no-mutación + acumulación sobre estado preexistente, todo bajo la firma de 4 argumentos. |

**Storage:** `data/storage.js` cubierto por 8 tests adicionales en `tests/data-storage.test.js` (blankState shape, migrate1to2 con happy-path + defensivos null/undefined, hydrateV2 con happy-path + defensivos null + inFlightTest preservation).

**Total Phase 2:** 26 tests nuevos verdes (8 storage + 18 progress).
**Total proyecto:** 38 tests verdes (`node --test tests/*.test.js` exits 0).

## Cómo Plan 02-02 (sampler) y Plan 02-03 (UI) consumirán estos contratos

### Plan 02-02 (sampler GUARANTEE + FILL + buildFullTest)

- Importará `blankStateV2`, `makeContent` desde `tests/util/test-helpers.js` para sus tests del sampler.
- Implementará `applyNewExerciseRegression(state, content)` como nueva export pura en `src/domain/progress.js` — el slot está reservado por el comentario del header del archivo. NO debe ponerse dentro de `applySessionResult` (Pitfall #10 documentado).
- El sampler NO toca `categoryProgress`; solo lee `state.exerciseStats[id].timesShown` para `exerciseWeight`. La extensión es ortogonal a este plan.

### Plan 02-03 (UI: home, picker, session, summary)

- `src/screens/app.js` instanciará `applySessionResult(this.state, sessionResult, this.content, todayLocal())` con la firma de 4 argumentos. Sin esta llamada actualizada, JavaScript no avisa: `content` queda `undefined`, `today` queda `undefined`, y la cascada explota en `content.exerciseById[eid]`. El JSDoc del export lo advierte explícitamente.
- `summaryDelta` de la pantalla de resumen se calculará leyendo `state.categoryProgress` antes/después; el shape definido en este plan (`status`, `streakDays`, `becameHechaAt`, etc.) alimenta directamente las celdas de la tabla.
- El banner `inFlightTest` del home lee `state.inFlightTest?.cursor` y `state.inFlightTest?.exerciseIds.length`; el campo está garantizado como opcional por `hydrateV2`.
- `loadState()` retorna shape v2 garantizado tras la migración automática — `src/screens/app.js` puede asumir que `state.categoryProgress`, `state.dailyLog` existen (aunque puedan ser `{}` la primera vez).

### Plan 02-04 (refactor + tests acceptance)

- Las suites en `tests/domain-progress.test.js` y `tests/data-storage.test.js` siguen verdes — si Plan 02-04 refactoriza, basta con re-correr `node --test tests/*.test.js` para detectar regresiones.
- Los helpers `setupHechaState` / `setupDominadaState` se reutilizan para los tests de transiciones complejas (regresión tras DOMAIN-06, etc.).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] JSON round-trip snapshot perdía claves con valor `undefined`**

- **Found during:** Task 2, primer run de `tests/domain-progress.test.js`.
- **Issue:** El test `'pureza: input state no se muta'` usaba `JSON.parse(JSON.stringify(before))` como snapshot. Cuando el fixture incluía `becameDominadaAt: undefined`, el round-trip lo eliminaba del snapshot pero `before` (que sigue siendo el objeto original) lo mantenía. `assert.deepEqual(before, snapshot)` fallaba con strict deep-equal: `+ becameDominadaAt: undefined`.
- **Fix:** Reemplazado el snapshot con un factory `makeFixture()` invocado dos veces (una para `before`, otra para `snapshot`). Cero round-trip JSON, las claves con `undefined` se preservan en ambos lados.
- **Files modified:** `tests/domain-progress.test.js`.
- **Commit:** `145d201` (incorporado en el commit de Task 2).
- **Justificación de la categoría:** este es un bug en el test, no en el dominio — la función bajo prueba era correcta. Rule 1 (auto-fix) aplica porque era un fallo de implementación del test que bloqueaba la verificación.

**Sin otras desviaciones.** El plan se ejecutó exactamente como estaba escrito: 2 tasks, 2 commits, suite verde.

## Tests añadidos por encima del mínimo

El plan exigía **≥10 tests nuevos** en `tests/domain-progress.test.js` y **6 tests** en `tests/data-storage.test.js`. La implementación entrega:

- `tests/domain-progress.test.js`: **18 tests** (3 cascada + 4 promoción/regresión + 9 racha/edges + 2 heredados de Phase 1 = 18). +80% sobre mínimo.
- `tests/data-storage.test.js`: **8 tests** (los 6 del plan + 2 defensivos extra: `migrate1to2` con campo `exerciseStats` ausente, `hydrateV2` con `inFlightTest` ausente).

Los tests extra cubren casos defensivos del shape (campos ausentes/null) que protegen contra futuros estados de localStorage editados manualmente o migraciones incompletas.

## Self-Check: PASSED

**Archivos creados:**
- `tests/domain-progress.test.js` — FOUND
- `tests/data-storage.test.js` — FOUND
- `tests/util/test-helpers.js` — FOUND
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-01-SUMMARY.md` — FOUND (this file)

**Archivos modificados:**
- `src/data/storage.js` — diff aplicado, `CURRENT_SCHEMA_VERSION = 2`, exports `blankState/migrate1to2/hydrateV2`.
- `src/domain/progress.js` — `applySessionResult` con 4 parámetros, helpers privados, `delete next.inFlightTest`.
- `tests/domain.test.js` — bloque `describe('domain/progress')` eliminado, import de `applySessionResult` eliminado.

**Commits:**
- `03aa2f8` — FOUND
- `145d201` — FOUND

**Verificación final:** `node --test tests/*.test.js` exits 0 con 38 tests pasando (14 supervivientes Phase 1 + 8 storage nuevos + 18 progress nuevos = 40… pero 2 de los 18 progress son los movidos desde Phase 1, así que netos: 14 + 8 + 16 = 38). Sin warnings, sin skips, sin todos.
