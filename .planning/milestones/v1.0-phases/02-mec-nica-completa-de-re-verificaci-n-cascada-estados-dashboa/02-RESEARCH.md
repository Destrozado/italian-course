# Phase 2: Mecánica completa de re-verificación (cascada + estados + dashboard) - Research

**Researched:** 2026-05-23
**Domain:** Vanilla web app with Alpine.js 3.15.12 + Pico CSS 2.1.1 + localStorage; pure-function domain (cascade state machine + weighted sampler with set-cover); Node 22 `node --test` for testing
**Confidence:** HIGH

---

## User Constraints (from CONTEXT.md)

### Decisiones bloqueadas (D-24..D-53)

Las 30 decisiones de `02-CONTEXT.md` están **cerradas**. Esta research trabaja DENTRO de esas decisiones, no las explora. Resumen operativo:

- **D-24/D-25:** Una sola raíz Alpine `appShell()` en `src/screens/app.js`, factory plano, `currentScreen` switch entre `'home' | 'picker' | 'session' | 'summary'`, ~400-500 LOC en un solo archivo.
- **D-26:** Bootstrap mantiene patrón Promise-handoff de Phase 1 (script ordering + sync top-level `alpine:init` listener).
- **D-27:** Abandono Repaso = silencioso al cerrar, confirmación inline al pulsar "Volver".
- **D-29..D-32:** Home = tabla densa de 5 columnas; badges Unicode + color (no pills); banner in-flight encima de los botones grandes.
- **D-33..D-36:** Picker compartido, checkboxes vacíos por defecto, label dinámico del botón, aviso inline para Test completo.
- **D-37:** Resumen pantalla-completa, tono neutro factúal.
- **D-38..D-40:** Mecánica de racha + cascada + DOMAIN-06 (regresión por ejercicio nuevo evaluada en boot).
- **D-41..D-45:** `inFlightTest` como subcampo de la misma key localStorage; escritura por respuesta; banner persistente; conflicto al lanzar nuevo Test completo.
- **D-46..D-48:** Migración schemaVersion 1 → 2 en `storage.js`; inicialización lazy de `categoryProgress[id]`; `dailyLog` sin cap.
- **D-49..D-51:** Sampler con GUARANTEE + FILL; `buildFullTest` nueva export; oversubscription se gestiona silenciosa.
- **D-52:** `applySessionResult(state, sessionResult, content, today)` — `today` como parámetro explícito.
- **D-53:** Suite de smoke tests ≥30 días en `tests/domain-*.test.js`.

### Claude's Discretion (zonas donde la research recomienda)

- Estilos visuales exactos del badge dentro de las CSS vars de Pico
- Layout HTML concreto de cada pantalla (jerarquía `<section>`/`<article>`)
- Nombres internos de propiedades del `appShell` (`pickerCheckedCategoryIds`, `summaryDelta`, etc.)
- Estructura interna de `summaryDelta`
- Si Phase 2 split en helpers privados o todo en `src/screens/app.js`
- Tipo concreto de UI para confirmación inline (sub-template Alpine `x-show` recomendado)
- Si añadir o no `exerciseStats.lastShownAt` (recomendación: NO en Phase 2)

### Deferred Ideas (OUT OF SCOPE)

Animación de resaltado en filas tocadas (descartada D-28), botón "Repetir esta sesión" en el resumen (D-37), botón por fila para acceso rápido, recordar última selección del picker (D-34), aviso "N categorías para 20 ejercicios" (research §6, no aplica en v1), `exerciseStats.lastShownAt`, cap del `dailyLog`, multi-tab guard.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DOMAIN-03 | `buildFullTest(categories, exercises)` puro, sin tope | Sección 5 — pseudocódigo + edge cases [VERIFIED: archivo existente `src/domain/session.js`] |
| DOMAIN-04 | `applySessionResult(state, sessionResult)` cascada fail-wins + promoción | Sección 2 — pseudocódigo canónico [VERIFIED: ARCHITECTURE.md §7 + D-39 alineados] |
| DOMAIN-05 | Estados `no-hecha` → `hecha` → `dominada` (21 días racha) | Sección 2 — máquina de estados [VERIFIED: ARCHITECTURE.md §7] |
| DOMAIN-06 | Categoría regresa a `no-hecha` si se añade ejercicio nuevo | Sección 3 — paso 3 de boot + edge cases [VERIFIED: D-40] |
| DOMAIN-07 | Racha solo cuando `lastSuccessDate !== today` | Sección 2 — invariantes streak guard [VERIFIED: ARCHITECTURE.md §7] |
| DOMAIN-08 | Promoción a `dominada` a los 21 días | Sección 2 — paso 2b del pseudocódigo [VERIFIED: D-38] |
| DOMAIN-10 | Smoke tests ≥30 días | Sección 7 — estrategia con inyección de `today` [VERIFIED: Node 22 docs] |
| SESSION-01 | Home dashboard con tabla densa | Sección 6 — multi-screen pattern + Pico table [CITED: picocss.com/docs/colors] |
| SESSION-02 | "Repaso de 20" abre picker | Sección 6 — single-root + screen switch [VERIFIED: alpinejs.dev/directives/data] |
| SESSION-03 | "Test completo" abre picker con aviso | Sección 6 — patrón compartido picker [VERIFIED: D-33] |
| SESSION-07 | Resumen post-sesión con delta | Sección 6 — `summaryDelta` derivation [VERIFIED: D-37] |
| SESSION-08 | Abandono Repaso descarta | Sección 6 — semánticas distintas Repaso/Test [VERIFIED: D-27] |
| SESSION-09 | Test completo reanudable | Sección 4 — in-flight persistence pattern [CITED: developer.chrome.com unload deprecation] |

---

## Summary

Phase 2 transforma el walking skeleton de Phase 1 en el motor completo de re-verificación. Toda la complejidad nueva se concentra en tres áreas: (1) **lógica pura del dominio** — `applySessionResult` evoluciona de "actualiza contadores" a una máquina de estados con cascada fail-wins, promociones a `hecha`/`dominada`, racha con guard por día, y regresión por ejercicio nuevo añadido; (2) **un único componente Alpine raíz** `appShell` con `currentScreen` switch y 4 templates condicionales; (3) **persistencia ampliada** con migración schemaVersion 1 → 2 y un nuevo subcampo `inFlightTest` que se escribe tras cada respuesta del Test completo.

Las decisiones críticas (cascada fail-wins, single root Alpine, `today` inyectado, in-flight blob único) están todas en `02-CONTEXT.md` y son congruentes con la arquitectura de Phase 1. No hay decisiones nuevas pendientes — esta research **codifica los algoritmos exactos** y advierte de los matices de implementación que harán que el plan no se atasque en sutilezas.

**Recomendación primaria:** ataca el dominio puro PRIMERO (Wave 0 o Plan 02-01) con tests exhaustivos ≥30 días; el dominio correcto desbloquea trivialmente las pantallas (que solo son render condicional sobre el state). Plan en orden inverso = riesgo de UI que pinta estados inválidos durante días.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Cascada de fallo (`applySessionResult`) | Domain (`src/domain/progress.js`) | — | Pura, sin DOM, sin storage. Testeable con `node --test`. D-02 layer purity. |
| Sampler GUARANTEE + FILL (`buildSession`/`buildFullTest`) | Domain (`src/domain/session.js`) | — | Pura, RNG inyectable. D-49/D-50/D-52. |
| DOMAIN-06 regresión por ejercicio nuevo (evaluación al boot) | Domain helper, invocado desde main.js | — | Mismo perfil de pureza que `applySessionResult`. main.js es el orchestrator que la dispara. D-40. |
| Migración schemaVersion 1 → 2 | Data (`src/data/storage.js`) | — | Ya es la frontera con localStorage. D-46. |
| `inFlightTest` (read/write) | Data (storage) + Screen (app.js que decide cuándo escribir) | — | El blob completo va via `saveState`. El "cuándo" es decisión de pantalla (cada respuesta del Test completo). D-41/D-42. |
| Home dashboard render | Screen (`src/screens/app.js` parte `home`) | — | Solo lee state/content, no muta. SESSION-01. |
| Picker / lanzador | Screen (`src/screens/app.js` parte `picker`) | — | UI-only state hasta que llama `buildSession`. SESSION-02/03. |
| Session runner | Screen (`src/screens/app.js`, migrado de Phase 1 sessionScreen) | — | Ya existe. Se integra dentro de `appShell`. |
| Resumen post-sesión | Screen (`src/screens/app.js` parte `summary`) | — | Lee `summaryDelta` computado en `completeSession`. SESSION-07. |
| Confirmación inline ("¿Descartar?") | Screen helper compartido | — | Sub-template Alpine reusable. D-27/D-43/D-44. |

**Por qué importa:** la layer-purity de Phase 1 sigue siendo el contrato más caro de romper. Cualquier "para qué vamos a hacer puro `applySessionResult` si ya estamos en el screen" descarrila el testing simulado de 30 días.

---

## Standard Stack

### Core (sin cambios respecto a Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **Alpine.js** | 3.15.12 (pinned CDN + SRI) | Reactividad declarativa de los 4 screens vía `x-data` + `x-if` | Ya validado en Phase 1, integridad SRI presente en `index.html` [VERIFIED: npm view alpinejs version → 3.15.12] |
| **Pico CSS** | 2.1.1 (classless, pinned CDN + SRI) | Estilo de la tabla densa, botones grandes, dialogs, badges | Ya integrado [VERIFIED: npm view @picocss/pico version → 2.1.1] |
| **Vanilla ES modules** | nativo del navegador | Organización en `src/screens/app.js` (nuevo), refactor de `src/domain/progress.js` y `src/domain/session.js` | No build step (FOUND-02) |
| **localStorage** | nativo del navegador | Single key `italianCourse.v1` con shape extendido v2 | D-41/D-46. Quota ~5 MiB es holgura suficiente (`dailyLog` ~100 bytes/día × ~3650 días = 365 KB) |
| **`node --test`** | Node 22.20+ built-in | Tests del dominio puro (≥30 días simulados) | Sin instalación. Glob `tests/*.test.js` por bug de directorio en Node 22 (D-11) |

**Sin nuevas dependencias.** El plan no introduce librerías. Esto preserva el SRI pinned y la promesa de "doble click y funciona" (vía `npx serve`).

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (ninguna nueva) | — | — | — |

### Alternatives Considered (y rechazadas)

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `appShell` factory plano (D-25) | Alpine.store global + componentes anidados | Store añade abstracción (`Alpine.store('app')`) sin valor en una app de 1 raíz; el factory plano deja todo en `$data` de DevTools, lo cual es exactamente lo que pidió el autor. |
| `<template x-if>` para 4 screens | `<div x-show="currentScreen === 'home'">` | `x-if` desmonta el DOM (state preservado en parent), `x-show` lo mantiene oculto. Para 4 pantallas mutuamente exclusivas con tabla densa que puede crecer, `x-if` libera nodos del DOM y la diferencia conceptual es clara (home no existe mientras estás en session). **Recomendación: `x-if`** según D-24. |
| Confirmación inline con `<dialog>` nativo | `confirm()` JS / sub-template con `x-show` | `<dialog>` requiere `.showModal()` imperativo y polyfill mental sobre Pico classless. `confirm()` es feo y modal-blocking. **Recomendación: sub-template Alpine `x-show`** — coherente con el resto y reutilizable en los 3 puntos (D-27/D-43/D-44). |
| `t.mock.timers.enable({apis:['Date']})` para tests de 30 días | `today` como parámetro inyectado | El parámetro inyectado es trivial (un string ISO), siempre determinista, no contamina entre tests. D-52 ya decide esto — la research confirma que es la práctica idiomática [CITED: nodejs.org/api/test.html "passing time/date values as function arguments"]. |

**Installation:** ninguna.

**Version verification:**
```bash
npm view alpinejs version                       # → 3.15.12 [VERIFIED 2026-05-23]
npm view @picocss/pico version                  # → 2.1.1   [VERIFIED 2026-05-23]
node --version                                  # → v22.20.0 [VERIFIED 2026-05-23]
```

---

## Package Legitimacy Audit

Phase 2 **NO instala paquetes externos**. Mantiene exactamente el mismo set de Phase 1:

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `alpinejs@3.15.12` | npm CDN (jsdelivr) | 5 años (linaje) | 100k+/sem | github.com/alpinejs/alpine | n/a (CDN) | Approved (heredado de Phase 1) |
| `@picocss/pico@2.1.1` | npm CDN (jsdelivr) | 5 años (linaje) | 30k+/sem | github.com/picocss/pico | n/a (CDN) | Approved (heredado de Phase 1) |

Sin `npm install`. Sin `package.json`. La integridad SRI ya está pinned en `index.html` (`integrity="sha384-..."`). slopcheck N/A para esta fase.

---

## Algoritmo `applySessionResult` (HIGH)

> Esta es la sección más importante del documento. El planner debe implementar `src/domain/progress.js` derivado directamente de aquí. Cada línea del pseudocódigo está alineada con D-38/D-39/D-40 y con `ARCHITECTURE.md §7`.

### Firma

```js
// src/domain/progress.js
export function applySessionResult(state, sessionResult, content, today) {
  // ...
}
```

| Param | Shape | Notas |
|-------|-------|-------|
| `state` | `{schemaVersion:2, exerciseStats, categoryProgress, dailyLog, inFlightTest?}` | Se trata como inmutable. Spread-clone interno. |
| `sessionResult` | `{answers: Array<{exerciseId:string, correct:boolean}>}` | El cursor ya completó la sesión. Una respuesta por ejercicio. |
| `content` | `{categories, exerciseById}` (lo que devuelve `loadContent`) | Read-only. Necesario para mapear `exerciseId → categoryIds` y calcular "todos los ejercicios de una categoría". |
| `today` | `ISODate` (string `'YYYY-MM-DD'`) | **Inyectado por el caller** (`todayLocal()` en runtime, string fijo en tests). D-52. |

### Pseudocódigo canónico

```js
// PURO: devuelve estado nuevo, no muta el input.
export function applySessionResult(state, sessionResult, content, today) {
  // 0. Pre-cómputo: índices derivados del content para no re-iterar.
  //    `exercisesByCategory` = Record<categoryId, exerciseId[]>
  //    Si no viene precomputado en content, lo computamos aquí (caro: O(N) ejercicios).
  //    OPCIONAL: el planner puede meter este índice en loadContent una sola vez.
  const exercisesByCategory = buildExercisesByCategory(content); // helper local o de content-loader

  // 1. Spread-clone del estado y subobjetos que vamos a mutar.
  const next = {
    ...state,
    exerciseStats: { ...(state.exerciseStats ?? {}) },
    categoryProgress: { ...(state.categoryProgress ?? {}) },
    dailyLog: { ...(state.dailyLog ?? {}) }
  };

  const answers = sessionResult.answers ?? [];

  // 2. Computar conjuntos auxiliares (paso 1 de D-39).
  const failedExerciseIds = answers.filter(a => !a.correct).map(a => a.exerciseId);
  const correctExerciseIds = answers.filter(a => a.correct).map(a => a.exerciseId);

  // Categoría aparece en failedCategoryIds si CUALQUIER ejercicio fallado la toca.
  // Categoría aparece en practicedCategoryIds si CUALQUIER ejercicio (acierto o fallo) la toca.
  const failedCategoryIds = new Set(
    failedExerciseIds.flatMap(eid => content.exerciseById[eid]?.categoryIds ?? [])
  );
  const practicedCategoryIds = new Set(
    answers.flatMap(a => content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );

  // 3. Actualizar exerciseStats (monotónico SIEMPRE — DOMAIN-09).
  //    Esto NO depende de fail-wins; correct y failed se separan en distintos counters.
  for (const ans of answers) {
    const prev = next.exerciseStats[ans.exerciseId] ?? blankStat();
    next.exerciseStats[ans.exerciseId] = {
      timesShown: prev.timesShown + 1,
      timesCorrect: prev.timesCorrect + (ans.correct ? 1 : 0),
      timesFailed: prev.timesFailed + (ans.correct ? 0 : 1)
    };
  }

  // 4. Actualizar categoryProgress por cada categoría tocada.
  for (const catId of practicedCategoryIds) {
    // Inicialización lazy (D-47).
    const prev = next.categoryProgress[catId] ?? blankCategoryProgress();
    const cat = { ...prev, clearedExerciseIds: [...prev.clearedExerciseIds] };
    next.categoryProgress[catId] = cat;

    if (failedCategoryIds.has(catId)) {
      // ─── FAIL-WINS: cascada de fallo (D-39, paso 2).
      cat.status = 'no-hecha';
      cat.clearedExerciseIds = [];      // descarta TODO lo acumulado en esta y sesiones previas
      cat.streakDays = 0;
      cat.becameHechaAt = undefined;
      cat.becameDominadaAt = undefined;
      // lastSuccessDate NO se toca aquí — la sesión no fue exitosa,
      // pero su valor histórico puede ser útil para depurar. (Discreción: el planner puede limpiarlo.)
    } else {
      // ─── Sin fallo en esta categoría en esta sesión (D-39, paso 3).

      // 4a. Añadir aciertos de esta categoría a clearedExerciseIds (idempotente).
      const correctIdsForCat = correctExerciseIds.filter(eid =>
        (content.exerciseById[eid]?.categoryIds ?? []).includes(catId)
      );
      cat.clearedExerciseIds = uniqueStrings([...cat.clearedExerciseIds, ...correctIdsForCat]);

      // 4b. Verificar si "covered" (todos los ejercicios de la categoría están en cleared).
      const allInCat = exercisesByCategory[catId] ?? [];
      const isCovered = allInCat.length > 0 && allInCat.every(id => cat.clearedExerciseIds.includes(id));

      // 4c. Promoción + streak.
      //
      // CASOS según D-38:
      //   A) status === 'no-hecha' y isCovered: promociona a 'hecha', streak = 1.
      //   B) status === 'hecha' (o 'dominada') y al menos 1 acierto sin fallo en esta sesión:
      //      streak += 1 (si lastSuccessDate !== today). No requiere isCovered.
      //   C) status === 'hecha' que cumple los 21 días: promociona a 'dominada'.
      //
      // Edge case: status === 'no-hecha' pero NO isCovered, sin fallo: NO promociona,
      // solo añade aciertos al cleared. NO incrementa streak (D-38 línea 1).

      if (cat.status === 'no-hecha' && isCovered) {
        // Caso A: promoción al promocionar la categoría.
        cat.status = 'hecha';
        cat.becameHechaAt = today;
        cat.streakDays = 1;
        cat.lastSuccessDate = today;
      } else if (cat.status === 'hecha' || cat.status === 'dominada') {
        // Caso B: estado ya promocionado, posible incremento de racha (guard por día).
        if (cat.lastSuccessDate !== today) {
          cat.streakDays = (cat.streakDays ?? 0) + 1;
          cat.lastSuccessDate = today;
        }
        // Caso C: promoción a 'dominada' al cruzar 21.
        if (cat.streakDays >= 21 && cat.status !== 'dominada') {
          cat.status = 'dominada';
          cat.becameDominadaAt = today;
        }
      }
      // Si status === 'no-hecha' y NO isCovered: NO se incrementa streak ni se promociona.
      // Pero clearedExerciseIds ya tiene los nuevos aciertos acumulándose (paso 4a).
    }

    // 4d. lastPracticedDate: SIEMPRE para todas las tocadas, en fail o no (D-39, paso 4).
    cat.lastPracticedDate = today;
  }

  // 5. Actualizar dailyLog (D-39, paso 5; D-48 shape).
  const prevEntry = next.dailyLog[today] ?? { date: today, categoriesPracticed: [], categoriesWithFailure: [] };
  next.dailyLog[today] = {
    date: today,
    categoriesPracticed: uniqueStrings([...prevEntry.categoriesPracticed, ...practicedCategoryIds]),
    categoriesWithFailure: uniqueStrings([...prevEntry.categoriesWithFailure, ...failedCategoryIds])
  };

  // 6. Limpiar inFlightTest si existe (D-45). El caller probablemente lo hace,
  //    pero hacerlo aquí garantiza idempotencia. Discreción del planner.
  if (next.inFlightTest !== undefined) {
    delete next.inFlightTest;
  }

  return next;
}

// ─── Helpers ───
function blankStat() {
  return { timesShown: 0, timesCorrect: 0, timesFailed: 0 };
}

function blankCategoryProgress() {
  return {
    status: 'no-hecha',
    clearedExerciseIds: [],
    streakDays: 0,
    lastPracticedDate: undefined,
    lastSuccessDate: undefined,
    becameHechaAt: undefined,
    becameDominadaAt: undefined
  };
}

function uniqueStrings(arr) {
  return [...new Set(arr)];
}

function buildExercisesByCategory(content) {
  const out = {};
  for (const ex of Object.values(content.exerciseById)) {
    for (const cid of ex.categoryIds ?? []) {
      (out[cid] ??= []).push(ex.id);
    }
  }
  return out;
}
```

### Invariantes críticos (verificables por tests)

1. **Fail-wins absoluto.** Si una categoría está tanto en `practicedCategoryIds` como en `failedCategoryIds`, se aplica el branch del fail (línea ~30). No importa cuántos aciertos previos tuviera en esta sesión: TODOS se descartan. (Pitfall #2 del research general.)
2. **Cascada multi-categoría.** Un solo ejercicio fallado con `categoryIds: ['avere', 'genero']` marca ambas en `failedCategoryIds` y resetea ambas. Test obligatorio D-53.1.
3. **`exerciseStats` monotónico.** El paso 3 corre **siempre**, antes y al margen del branch fail/correct de la categoría. Un fail aumenta `timesShown` y `timesFailed`, jamás resetea.
4. **`lastSuccessDate` guard.** El incremento de streak nunca corre dos veces el mismo día — el día se identifica con el string ISO. 5 sesiones en el día X tocando Avere con todas correctas → `streakDays += 1` UNA VEZ.
5. **Idempotencia parcial.** Llamar `applySessionResult` dos veces con el mismo `sessionResult` aplicado a su propio output NO es seguro (`exerciseStats` doblaría). Esto está fuera del scope del dominio — el caller (screen) es responsable de invocar una vez por sesión.
6. **`lastPracticedDate` siempre.** Categoría tocada (acierto o fallo) → `lastPracticedDate = today`. Esto es lo que usa la home para "Última vez" (D-29).
7. **`clearedExerciseIds` NO se vacía cuando isCovered.** Tras promocionar a `hecha`, `clearedExerciseIds` sigue conteniendo todos los IDs (no es "round-by-round" reset). Solo se vacía en el branch fail. (Esto es lo que permite que DOMAIN-06 sepa qué aciertos previos preservar al añadir un ejercicio nuevo, ver Sección 3.)

### Casos límite explícitos (test D-53 requiere cubrir cada uno)

| # | Escenario | Resultado esperado |
|---|-----------|--------------------|
| 1 | Categoría `hecha` en estado, sesión toca y acierta solo 1 ejercicio (no cubre todo), sin fallo, `lastSuccessDate !== today` | `streakDays += 1`, `lastSuccessDate = today`, sigue `hecha`. **No requiere re-cover** porque ya está `hecha`. (D-38 línea 3) |
| 2 | Categoría `no-hecha`, sesión cubre TODOS sus ejercicios sin fallo | Promoción: `status='hecha'`, `becameHechaAt=today`, `streakDays=1`, `lastSuccessDate=today`. |
| 3 | Categoría `no-hecha`, sesión acierta algunos pero NO todos, sin fallo | `clearedExerciseIds` crece; `status` sigue `'no-hecha'`; `streakDays` sigue 0 (no promociona). |
| 4 | Categoría `dominada`, sesión la toca sin fallo, `lastSuccessDate !== today` | `streakDays += 1`, sigue `dominada` (no regresa). |
| 5 | Categoría `dominada` con 1 fallo en la sesión | `status='no-hecha'`, `streakDays=0`, `becameDominadaAt=undefined`, `becameHechaAt=undefined`, `clearedExerciseIds=[]`. |
| 6 | Ejercicio multi-cat `[avere, genero]` fallado tras acierto previo `[avere]` en la misma sesión | Ambas avere y genero → fail branch. `clearedExerciseIds[avere]` = `[]` (descarta acierto previo). |
| 7 | 5 sesiones el mismo día tocando Avere sin fallar (categoría ya `hecha`) | `streakDays` incrementa **una sola vez**. `lastSuccessDate` no permite el 2º incremento. |
| 8 | Categoría `hecha` que promociona durante la sesión (caso A) y la misma sesión la toca varias veces | `streakDays=1`, no `streakDays=N`. La promoción ocurre **una vez** en el iter de `practicedCategoryIds` (es un Set, sin duplicados). |
| 9 | Categoría que llega a `streakDays=21` exacto durante la sesión | Pasa a `dominada` en el mismo applySessionResult call. `becameDominadaAt = today`. |
| 10 | Sesión vacía (`answers = []`) | Estado devuelto es idéntico al input (spread-clone pero sin cambios funcionales). No throws. |
| 11 | Ejercicio fallado cuyo `categoryIds` está vacío o roto | `failedCategoryIds` no añade nada. `exerciseStats` se actualiza igualmente. (Defensive: validator de Phase 1 rechaza esto.) |
| 12 | `lastSuccessDate === today` pero promoción de no-hecha a hecha en esta sesión (paradoja: el día de promoción ya tiene lastSuccessDate por otra promoción?) | Solo puede pasar si `applySessionResult` corre dos veces el mismo día. La 1ª promociona, la 2ª re-promociona idempotente. El caso A debería sobreescribir streakDays=1 y lastSuccessDate=today sin daño. **Recomendación:** el caso A no checa `lastSuccessDate` (siempre setea streakDays=1) — esto es seguro porque `lastSuccessDate === today` significa que ya practicó hoy con éxito, y promocionar a hecha hoy es idempotente. |

### Por qué NO se vacía `clearedExerciseIds` cuando se promociona a `hecha`

D-39 paso 3 dice "añadir todos los exerciseId acertados a `clearedExerciseIds`". El paso de "vaciar tras llegar a covered" **NO existe**. Razón: si el usuario añade un ejercicio nuevo a la categoría después de promocionar (DOMAIN-06), necesitamos saber qué ejercicios ya estaban cleared para preservar ese trabajo. Si `clearedExerciseIds` se vaciara al promocionar, perderíamos esa información y el usuario tendría que re-acertar todo desde cero al añadir un solo ejercicio.

**Implicación para tests:** verifica que tras promoción `cat.clearedExerciseIds.length === allInCat.length` (todos los IDs ahí).

---

## Migración schemaVersion 1 → 2 (HIGH)

> El planner extiende `src/data/storage.js`. La función `migrate(parsed)` actual ya tiene la estructura — solo añade una rama nueva.

### Detección de la versión

```js
// Reemplaza/extiende la función migrate() actual en src/data/storage.js.

const CURRENT_SCHEMA_VERSION = 2;  // antes: 1

export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {},
    inFlightTest: undefined          // no se serializa si es undefined; opcionalmente omitir
  };
}

function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();

  // Versión actual (v2): solo defensivo, asegurar que los campos existen.
  if (parsed.schemaVersion === 2) {
    return hydrateV2(parsed);
  }

  // v1 → v2: añadir los campos nuevos, conservar exerciseStats.
  if (parsed.schemaVersion === 1) {
    return migrate1to2(parsed);
  }

  // Desconocido (probablemente futuro): blank state defensivo. Log warn.
  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}

function migrate1to2(parsedV1) {
  // Preserva exerciseStats íntegro. Añade los campos nuevos vacíos.
  // categoryProgress se inicializa vacío — la regresión DOMAIN-06 corre en main.js
  // tras el load y rellenará lo que pueda inferir del content (categorías que el
  // usuario ya tocó en v1 quedan en 'no-hecha' con cleared=[] hasta que vuelva a
  // practicarlas).
  return {
    schemaVersion: 2,
    exerciseStats: typeof parsedV1.exerciseStats === 'object' && parsedV1.exerciseStats !== null
      ? parsedV1.exerciseStats
      : {},
    categoryProgress: {},        // se hidrata lazy on first applySessionResult o en boot via DOMAIN-06
    dailyLog: {},                // no hay log histórico de v1; empieza vacío
    inFlightTest: undefined
  };
}

function hydrateV2(parsed) {
  // Defensivo: si manualmente el usuario edita localStorage o si una migración futura
  // se queda a medias, garantizamos shape.
  return {
    schemaVersion: 2,
    exerciseStats: typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null
      ? parsed.exerciseStats
      : {},
    categoryProgress: typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null
      ? parsed.categoryProgress
      : {},
    dailyLog: typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null
      ? parsed.dailyLog
      : {},
    inFlightTest: parsed.inFlightTest  // permitido undefined o objeto
  };
}
```

### Hidratación retroactiva de `categoryProgress`

**Pregunta clave:** el usuario practicó Avere en v1, ahora carga v2. `categoryProgress.avere` no existe. ¿Qué pasa?

- **Decisión:** NO se intenta "reconstruir" el estado pasado. v1 no guardaba ni racha ni `clearedExerciseIds`, así que es **imposible** inferir si Avere estaba `hecha` o no de los counters monotónicos.
- `categoryProgress` queda vacío `{}` tras migrate. Cuando `applySessionResult` corre por primera vez para Avere, hace inicialización lazy (`blankCategoryProgress()`) — el usuario comienza en `no-hecha` con cleared vacío.
- Esto es **el comportamiento correcto** dado que v1 no tenía la noción de "hecha"; era el walking skeleton. La pérdida es 0 entradas de racha (no había racha en v1) y `clearedExerciseIds=[]` (que el usuario rellena en su primera sesión v2).

**Implicación para el README / SUMMARY de Plan 02:** documentar explícitamente "tras la actualización a Phase 2, todas las categorías arrancan en `no-hecha`. Los contadores históricos por ejercicio se conservan."

### Edge case: migración mientras hay sesión a medias

**No aplica.** El estado en memoria del Phase 1 `sessionScreen` no toca `loadState()` mid-session — el load corre una sola vez en boot. Si el usuario recarga mid-session de Phase 1, esa sesión se descarta (D-20, ya verificado en UAT). Phase 2 hereda la misma semántica para Repaso (D-27); Test completo es la EXCEPCIÓN (D-42, persiste cada respuesta via `inFlightTest`).

### Verificación recomendada (test manual + automated)

**Manual:**
1. Con Phase 1 instalado, ejecuta 1 sesión, cierra.
2. Inspecciona `localStorage.getItem('italianCourse.v1')` → debe tener `schemaVersion: 1` y `exerciseStats: {...}`.
3. Despliega Phase 2.
4. Recarga. Inspecciona localStorage → debe tener `schemaVersion: 2`, `categoryProgress: {}`, `dailyLog: {}`, `exerciseStats` íntegro.

**Automated (tests):**
- `tests/storage-migrate.test.js` (nuevo, o dentro de `tests/data.test.js`): un test que llama `migrate({schemaVersion:1, exerciseStats:{a:{timesShown:5}}})` y verifica que el output tiene shape v2 con exerciseStats preservado.

---

## Sampler GUARANTEE + FILL (HIGH)

> El planner extiende `src/domain/session.js`. La firma de `buildSession` se mantiene; el cuerpo crece. Se añade `buildFullTest` como nueva export.

### `buildSession` (extiende Phase 1)

```js
// src/domain/session.js (firma sin cambios)
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) {
  // 1. Pool: ejercicios cuyo categoryIds solape con categoryIds.
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  if (pool.length === 0) return { exerciseIds: [], actualSize: 0 };

  const targetSize = Math.min(requestedSize, pool.length);
  const session = [];          // ejercicios elegidos en este orden

  // 2. GUARANTEE phase (NUEVO en Phase 2 — D-49).
  for (const cat of categoryIds) {
    // Si ya hay un ejercicio en session que cubre `cat`, skip (un ejercicio multi-cat
    // cubre N categorías — D-49 paso 2 línea 1).
    const alreadyCovered = session.some(ex => (ex.categoryIds ?? []).includes(cat));
    if (alreadyCovered) continue;

    // Candidates: pool ∩ ejercicios que incluyen cat, menos los ya en session.
    const candidates = pool.filter(ex =>
      (ex.categoryIds ?? []).includes(cat) &&
      !session.includes(ex)
    );

    if (candidates.length === 0) {
      // D-51: silently skip. La categoría no tiene ejercicios disponibles
      // (caso raro: el único ejercicio que la cubre ya está en session por multi-cat).
      continue;
    }

    // Stop early si ya hemos llenado: oversubscription protection (D-51).
    if (session.length >= targetSize) break;

    // Muestreo ponderado con exerciseWeight (misma fórmula del Phase 1).
    const picked = weightedPickOne(candidates, state, rng);
    session.push(picked);
  }

  // 3. FILL phase (existente de Phase 1, sin cambios estructurales — D-49 paso 3).
  const remaining = pool.filter(ex => !session.includes(ex));
  while (session.length < targetSize && remaining.length > 0) {
    const picked = weightedPickOne(remaining, state, rng);
    session.push(picked);
    const idx = remaining.indexOf(picked);
    remaining.splice(idx, 1);
  }

  // 4. Fisher-Yates final (D-49 paso 4, mismo RNG).
  for (let i = session.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [session[i], session[j]] = [session[j], session[i]];
  }

  return {
    exerciseIds: session.map(ex => ex.id),
    actualSize: session.length
  };
}

// Helper privado — mismo algoritmo del Phase 1, factorizado.
function weightedPickOne(candidates, state, rng) {
  const weights = candidates.map(ex =>
    exerciseWeight(state.exerciseStats?.[ex.id]?.timesShown ?? 0)
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let r = rng() * totalWeight;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];  // safety por float rounding
}
```

### `buildFullTest` (nuevo — D-50)

```js
export function buildFullTest(categoryIds, allExercises, rng = Math.random) {
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  // Fisher-Yates sobre el pool entero. Sin tope, sin guarantee phase, sin weighted.
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    exerciseIds: shuffled.map(ex => ex.id),
    actualSize: shuffled.length
  };
}
```

### Edge cases (test D-53.4 los cubre)

| # | Escenario | Comportamiento |
|---|-----------|----------------|
| 1 | Categoría seleccionada sin ejercicios disponibles | GUARANTEE skip silencioso. Aviso UI se difiere a Phase 5 (D-51 explícito). |
| 2 | Ejercicio multi-cat `[avere, genero]` cubre 2 categorías en un pick | GUARANTEE para `avere` lo elige; `genero` ve `alreadyCovered=true` y skip. Funciona por construcción (el `some()` del `alreadyCovered` chequea). |
| 3 | targetSize=20, pool=12 | GUARANTEE phase llena hasta 6 (si hay 6 categorías), FILL phase llena los 6 restantes con weighted random. Total=12, no se intenta llegar a 20 (D-13 hereded de Phase 1). |
| 4 | targetSize=20, categorías=25, todas con ejercicios | GUARANTEE phase llena hasta 20; el `break` interno cuando `session.length >= targetSize` corta. **5 categorías quedan sin cubrir**. D-51 dice "drop silently". |
| 5 | targetSize=20, categorías=1, pool=50 | GUARANTEE elige 1, FILL elige 19 más. Total=20. |
| 6 | targetSize=0 (caso defensivo) | session = [], actualSize=0. (No should never happen pero defensive.) |
| 7 | RNG inyectado seededLcg(1234) | Resultado determinista — clave para tests. |
| 8 | buildFullTest con 3 categorías y 12 ejercicios totales | Resultado = 12 ejercicios únicos, mismo seed → mismo orden (test D-53.4 línea 4). |
| 9 | exerciseWeight aplicado en GUARANTEE: 2 ejercicios candidatos para `avere`, timesShown=0 y timesShown=100 | Ratio de selección ~11x (weight cap=10 → 1/1 vs 1/11). Test estadístico: 1000 iteraciones con seeded RNG → ratio dentro de ~5% tolerance. |

### Por qué la GUARANTEE phase NO altera el "pool" para la FILL

Implementación elegante: la GUARANTEE phase añade picks a `session`; la FILL itera sobre `pool.filter(ex => !session.includes(ex))`. No hay estado compartido fuera de `session`. Esto facilita el test: una llamada a `buildSession` produce un resultado determinista con RNG dado.

**Posible gotcha de implementación:** `session.includes(ex)` compara por referencia. Si `pool` y `session` contienen el mismo objeto `ex` por referencia (no copia), esto funciona. **Verificar** que el `.filter` no clona objetos.

---

## Persistencia in-flight Test completo (HIGH)

> D-41 y D-42 son las decisiones clave. Esta sección codifica los matices de implementación.

### Shape exacto (de `02-CONTEXT.md` D-41)

```ts
{
  schemaVersion: 2,
  exerciseStats: { ... },
  categoryProgress: { ... },
  dailyLog: { ... },
  inFlightTest?: {
    categoryIds: string[],              // las categorías seleccionadas al lanzar
    exerciseIds: string[],              // orden ya generado por buildFullTest
    cursor: number,                     // 0-based: el ejercicio actual a mostrar
    answers: Array<{exerciseId: string, correct: boolean}>,  // hasta el último respondido
    startedAt: number                   // epoch ms — usado para detectar staleness
  }
}
```

### Cuándo escribir

| Evento | Acción |
|--------|--------|
| Test completo arranca (después de `buildFullTest`) | Set `inFlightTest = {categoryIds, exerciseIds, cursor:0, answers:[], startedAt:Date.now()}`, llamar `saveState` |
| Usuario responde un ejercicio (correcto o incorrecto) | `answers.push({...})`; `cursor` incrementa (tras advance); `saveState` con el blob completo |
| Test completo termina (cursor pasa del último) | `applySessionResult(state, {answers}, content, todayLocal())` → el resultado tiene `inFlightTest = undefined` (paso 6 del pseudocódigo) → `saveState` con el blob nuevo |
| Usuario pulsa "Descartar" en banner home | `inFlightTest = undefined`; `saveState` |
| Usuario pulsa "Reanudar" en banner home | NO write — solo `currentScreen='session'` con el estado del `inFlightTest` cargado en propiedades de `appShell` |
| Usuario pulsa "Test completo" con in-flight pendiente y confirma "Descartar y empezar uno nuevo" (D-44) | Genera nuevo `inFlightTest`, sobreescribe |

### Patrón de escritura recomendado

```js
// Dentro de appShell, en sessionSelectOption o sessionAdvance para Test completo:
sessionAdvance() {
  // ... lógica existente de cursor++, feedback=null ...

  // Solo para Test completo: escribir inFlightTest tras cada avance.
  if (this.sessionMode === 'test-completo') {
    this.state = {
      ...this.state,
      inFlightTest: {
        ...this.state.inFlightTest,
        cursor: this.sessionCursor,
        answers: [...this.sessionResults]  // o this.results, según naming del planner
      }
    };
    saveState(this.state);
  }

  // Si done:
  if (this.sessionDone) {
    this.completeSession();
  }
}
```

**Nota crítica:** `state.inFlightTest` debe ser un **objeto separado en memoria por sesión** — el `appShell` puede mantener una copia local en propiedades (`this.sessionExerciseIds`, `this.sessionCursor`, `this.sessionResults`) y sincronizarlo al blob via spread como arriba. La razón: si Alpine reactividad hace que cada answer triggere un re-render del banner home, no queremos hacer eso (el home no está montado mientras estamos en session, pero por defensiveness).

### ¿`visibilitychange` / `beforeunload` necesarios?

**Recomendación: NO añadirlos en Phase 2.** Razones:

1. La escritura per-answer (D-42) ya cubre el 99% del riesgo: si el usuario cierra el tab tras la respuesta #12 de 87, esa respuesta ya está en localStorage.
2. La pérdida posible: ~5-10 segundos de "el usuario respondió pero antes de hacer click en el botón verde lo cierra" — el feedback verde tarda 600ms en auto-avanzar; la escritura ocurre en el `advance()`. Ventana real de pérdida es la animación verde de 600ms.
3. `beforeunload` está deprecándose en Chrome (rollout a abril 2026) [CITED: developer.chrome.com/docs/web-platform/deprecating-unload]. Si lo añadimos hoy, en pocos meses no funcionará.
4. `visibilitychange` (recomendado por MDN para Chrome 2026+) es más fiable pero introduce complejidad de "sincronizar el estado en memoria de Alpine al blob" en un listener external al ciclo Alpine. **Diferido a Phase 5** si el autor reporta pérdida de respuestas.

**Implicación para el plan:** documentar en el SUMMARY que "el riesgo residual de perder hasta 1 respuesta tras un crash brusco es aceptado por simplicidad; mitigable en polish vía `visibilitychange`".

### Detección de in-flight stale (categoría / ejercicio borrado)

**Pregunta:** un usuario lanza Test completo el 1 de junio. Vuelve el 22 de junio. Mientras tanto añadió un ejercicio nuevo (DOMAIN-06). Su `inFlightTest.exerciseIds` referencia ejercicios que aún existen, pero el catálogo cambió. ¿Está roto?

**Respuesta:**

1. **`exerciseIds` referencia IDs estables.** Mientras los IDs sigan en `content.exerciseById`, el reanudo funciona.
2. **Si algún `exerciseId` en `inFlightTest.exerciseIds` NO existe en content (el autor borró el ejercicio del JSON):** el reanudo lanza `currentExercise === undefined` en el primer acceso. **Mitigación recomendada:** en el botón "Reanudar" del banner home, filtrar:
   ```js
   resumeInFlightTest() {
     const valid = this.state.inFlightTest.exerciseIds.filter(
       eid => this.content.exerciseById[eid] !== undefined
     );
     if (valid.length === 0 || valid.length < this.state.inFlightTest.cursor) {
       // El test está roto — el cursor apunta a un ejercicio borrado o no quedan ejercicios
       this.confirmDiscardInFlightTest('El test que tenías a medias ya no existe en el contenido.');
       return;
     }
     // Ajustar cursor si los IDs anteriores al cursor fueron borrados
     // (defensivo, raro en uso normal — el autor solo añade ejercicios, no borra mid-test)
     this.sessionExerciseIds = valid;
     // ...
   }
   ```
3. **Grace period:** **NO recomendado en v1**. El `startedAt` se persiste pero no se compara contra `Date.now() > startedAt + N` para descartar. Razón: si el autor deja un Test completo de 87 ejercicios y vuelve en 2 semanas a terminarlo, eso es legítimo. Solo se descarta si el usuario lo pulsa "Descartar" en el banner.

**Implicación para el plan:** una tarea pequeña "validar `inFlightTest.exerciseIds` contra `content.exerciseById` antes de `Reanudar`". 5-10 LOC.

### Atomicidad del write

`localStorage.setItem(KEY, JSON.stringify(state))` es **síncrono y atómico**. No hay risk de partial writes a nivel de la API (el blob completo o nada). Esto valida la decisión D-41 (single blob, no separate keys).

---

## Alpine multi-screen patterns (HIGH)

### Recomendación

**Componente único `appShell()` con `<template x-if>` por screen.** Cada `<template>` contiene UN SOLO elemento root (limitación de Alpine 3.x: "template tags can only contain one root element"). Los templates son **mutually exclusive** por el comparador `currentScreen === '...'` así que en cualquier momento solo uno está en el DOM.

### Implicaciones de `<template x-if>` en Alpine 3.x

| Característica | Comportamiento |
|----------------|----------------|
| Render | Cuando la condición pasa de `false` a `true`, el elemento del template se inserta en el DOM. Cuando vuelve a `false`, se **destruye completamente**. |
| State preservation | Las **propiedades del `appShell`** (raíz único) SIEMPRE se preservan: viven en el x-data raíz, no en el template. Cambiar `currentScreen='home'` → `'session'` → `'home'` no resetea `pickerCheckedCategoryIds`, ni `categoryProgress`, etc. **PERO**: si pones un `x-data` ANIDADO dentro de un template (no recomendado, viola D-25), eso SÍ se desmonta. |
| Watchers (`$watch`) | Bug conocido: watchers definidos en un componente hijo dentro de `x-if` **no se destruyen al desmontar** y se duplican al re-montar. **Mitigación:** todos los `$watch` de Phase 2 viven en `appShell.init()`, no dentro de los templates. |
| `<template>` vs `<div>` | `x-if` **requiere** `<template>`. Usar `<div x-if>` no funciona. |
| `x-show` alternativa | `x-show` mantiene los elementos en el DOM (sólo `display:none`). Para 4 pantallas mutuamente exclusivas con tabla densa que tiene N filas, esto desperdicia DOM. **`x-if` es la decisión correcta** (alineado con D-24). |

[CITED: alpinejs.dev/directives/if + GitHub discussion #3654 sobre watchers]

### Patrón concreto del `index.html`

```html
<div x-data="appShell" x-init="init()" x-cloak>

  <!-- Banner errores validación: ya existente, fuera del switch -->

  <!-- Screen: HOME -->
  <template x-if="currentScreen === 'home'">
    <article>
      <header>...</header>
      <!-- Banner in-flight test (condicional) -->
      <div x-show="state.inFlightTest">...</div>
      <!-- Botones grandes -->
      <div role="group">
        <button @click="openPicker('repaso')">Repaso 20</button>
        <button @click="openPicker('test-completo')">Test completo</button>
      </div>
      <!-- Tabla densa -->
      <table>
        <thead>...</thead>
        <tbody>
          <template x-for="cat in categoriesForDisplay" :key="cat.id">
            <tr>
              <td><span :class="badgeClass(cat.id)" x-text="badgeGlyphAndName(cat.id)"></span></td>
              <td x-text="cat.name"></td>
              <td x-text="streakLabel(cat.id)"></td>
              ...
            </tr>
          </template>
        </tbody>
      </table>
    </article>
  </template>

  <!-- Screen: PICKER -->
  <template x-if="currentScreen === 'picker'">
    <article>
      <header x-text="pickerHeaderLabel"></header>
      <!-- Checkboxes con x-for sobre categories -->
      <!-- Select all / Clear all -->
      <button @click="startSession" :disabled="pickerPoolSize === 0" x-text="pickerStartLabel"></button>
      <p x-show="pickerMode === 'test-completo'">⚠ Test completo — <span x-text="pickerPoolSize"></span> ejercicios sin tope...</p>
    </article>
  </template>

  <!-- Screen: SESSION (migrado de Phase 1 sessionScreen, propiedades inline) -->
  <template x-if="currentScreen === 'session'">
    <article>
      <header x-text="sessionProgressLabel"></header>
      <p x-text="sessionCurrentExercise.payload.prompt"></p>
      <div role="group">
        <template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">
          <button @click="sessionSelectOption(idx)" :disabled="sessionFeedback !== null"
                  :class="sessionOptionClass(idx)" x-text="opt"></button>
        </template>
      </div>
      <!-- Feedback rojo: respuesta correcta + Siguiente -->
      <p x-show="sessionFeedback === 'incorrect'">...</p>
      <button x-show="sessionFeedback === 'incorrect'" @click="sessionAdvance">Siguiente</button>
      <!-- Volver al home (con confirmación inline si Repaso, ver below) -->
      <button @click="requestReturnToHome">← Volver al home</button>
    </article>
  </template>

  <!-- Screen: SUMMARY -->
  <template x-if="currentScreen === 'summary'">
    <article>
      <header x-text="summaryHeaderLabel"></header>
      <ul>
        <template x-for="entry in summaryDelta" :key="entry.categoryId">
          <li>
            <span x-text="entry.categoryName"></span>:
            <span x-text="entry.statusBefore"></span>
            <span :style="entry.deltaColor">→</span>
            <span x-text="entry.statusAfter"></span>
            <span x-text="entry.reasonOrNote"></span>
          </li>
        </template>
      </ul>
      <button @click="returnToHomeFromSummary">Volver al home</button>
    </article>
  </template>

  <!-- Confirmation inline reusable (D-27/D-43/D-44) -->
  <div x-show="confirmDialog" role="alertdialog" class="confirm-inline">
    <p x-text="confirmDialog?.message"></p>
    <div role="group">
      <button @click="confirmDialog.onConfirm()" x-text="confirmDialog?.confirmLabel"></button>
      <button @click="confirmDialog = null" x-text="confirmDialog?.cancelLabel || 'Cancelar'"></button>
    </div>
  </div>

</div>
```

### Performance de Alpine con 30+ propiedades en un x-data

Búsquedas oficiales [CITED: alpinedevtools.com/blog/stores-usage-guide, alpinejs.dev/advanced/reactivity]:

- Alpine usa **Vue's reactivity engine** (Proxy-based) — granular, no whole-tree re-render.
- Cambio en `state.categoryProgress.avere.streakDays` triggera **solo** los `x-text`/`x-show` que leen ese path. No re-renderiza la tabla entera.
- **Getters NO están cacheados** (a diferencia de Vue `computed`). Si `summaryDelta` es un getter que itera 50 categorías, se recomputa cada vez que se lee. Para 6 categorías iniciales esto es trivial; si crece a 50, considerar **memoizar** o computar imperativamente al transicionar a `summary` (`this.summaryDelta = computeSummary(...)` en `completeSession`).
- **Recomendación práctica:** computar `summaryDelta` **una vez** al entrar a `summary` (en `completeSession()` antes del `currentScreen='summary'`) y almacenarlo como propiedad plana. NO usar getter.

### Performance: re-render de la tabla home con N filas

| Filas | Reactivity overhead | Recomendación |
|-------|--------------------|----------------|
| 6 (v1 actual) | Trivial. <1ms | Sin acción. |
| 50 (v2 hipotético) | <10ms en hardware moderno | Sin acción. |
| 500+ | Considerar virtualización | No aplica en este proyecto. |

### Preservación de scroll position al cambiar pantalla

`x-if` destruye el DOM. El scroll del `<main>` se reseteará automáticamente al cambio de pantalla porque cuando `currentScreen='session'` el `<table>` del home desaparece (el `<main>` se contrae a la altura del `<article>` de session).

**Recomendación:** **NO añadir preservación de scroll en v1**. El usuario navega entre 4 pantallas chicas; el navegador hará scroll-to-top automático cuando el `<table>` desaparece. Si en Phase 5 surge la queja "vuelvo del summary y la home está al final", añadir un `this.$nextTick(() => window.scrollTo(0,0))` en `returnToHomeFromSummary()`.

### Validación de "factory plano" vs alternativas

D-25 fija "factory plano, todo en un objeto". Esta research **confirma que es la decisión correcta** para ~500 LOC:

| Alternativa | Por qué NO |
|-------------|-----------|
| Alpine.store global | Añade una capa de indirección (`$store.app.currentScreen`). Para una app de 1 raíz, el store es ruido. |
| Componentes anidados con x-data | Cada x-data anidado dentro de `x-if` se desmonta al cambio de pantalla → state perdido → re-init mata el patrón. Solo serviría si cada pantalla fuera "stateful pero efímera", que no es el caso (picker recuerda checkboxes hasta confirmar; session tiene mucha state). |
| Spread composition (`{...home(), ...picker(), ...}`) | Conflictos de naming, debugging difícil (¿de quién es `init()`?). Plano = trazable. |

---

## Testing strategy con `node --test` (HIGH)

### Setup

- Tests en `tests/domain.test.js` (extendido) o split en `tests/domain-progress.test.js` + `tests/domain-session.test.js`. **Recomendación: split** — D-53 tiene 4 grupos de tests claramente separados; un solo archivo se vuelve 800+ LOC.
- Comando canónico: `node --test tests/*.test.js` (glob, NO `tests/` — Node 22.20 bug documentado en D-11). [CITED: nodejs.org/api/test.html "use explicit glob patterns"]
- Imports: `node:test` + `node:assert/strict` + módulos del dominio (`../src/domain/progress.js`, etc.).
- RNG determinista: `tests/util/seeded-rng.js` ya existe (Phase 1). Reutilizar.

### Patrón de inyección de `today` (D-52)

```js
// tests/domain-progress.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { applySessionResult } from '../src/domain/progress.js';

describe('domain/progress — racha 21 días simulada', () => {
  test('21 días consecutivos sin fallar promocionan a dominada', () => {
    let state = blankState();  // helper local del test
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'a2', categoryIds: ['avere'] }
    ]);

    // Simular 21 días: cada día acertar ambos ejercicios.
    for (let day = 0; day < 21; day++) {
      const isoDate = `2026-06-${String(day + 1).padStart(2, '0')}`;  // 2026-06-01..2026-06-21
      state = applySessionResult(state, {
        answers: [
          { exerciseId: 'a1', correct: true },
          { exerciseId: 'a2', correct: true }
        ]
      }, content, isoDate);
    }

    assert.equal(state.categoryProgress['avere'].status, 'dominada');
    assert.equal(state.categoryProgress['avere'].streakDays, 21);
    assert.equal(state.categoryProgress['avere'].becameDominadaAt, '2026-06-21');
  });

  test('5 sesiones el mismo día solo incrementan streak una vez', () => {
    let state = setupHechaState();  // helper que arranca con avere en 'hecha'
    const today = '2026-06-01';
    for (let i = 0; i < 5; i++) {
      state = applySessionResult(state, {
        answers: [{ exerciseId: 'a1', correct: true }]
      }, content, today);
    }
    assert.equal(state.categoryProgress['avere'].streakDays, prevStreak + 1);
  });
});
```

**Por qué inyectar `today` como string en vez de `t.mock.timers.enable({apis:['Date']})`:**

1. Más simple — el test no necesita avanzar mock-tick.
2. La función puede ser pura sin tocar globals.
3. Tests se ejecutan en paralelo sin interferir (mock timers son globales del test context).
4. [CITED: nodejs.org/api/test.html] "passing time/date values as function arguments" es la recomendación canónica.

### Patrón de tests parametrizados (D-53 simulación 30 días)

```js
test('30 días alternos sin fallar producen 30 incrementos de racha (eventualmente dominada)', () => {
  let state = blankState();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(2026, 5, 1 + i);  // junio 1, 2, 3, ..., 30
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  for (const isoDate of dates) {
    state = applySessionResult(state, {
      answers: content.allIds.map(eid => ({ exerciseId: eid, correct: true }))
    }, content, isoDate);
  }

  assert.equal(state.categoryProgress['avere'].streakDays, 30);
  assert.equal(state.categoryProgress['avere'].status, 'dominada');
});
```

### Patrón para sampler tests (D-53.4)

```js
import { seededLcg } from './util/seeded-rng.js';

test('weighted sampling con timesShown=0 vs timesShown=100 produce ratio ~11x', () => {
  const exercises = [
    { id: 'cold', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
    { id: 'hot', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
  ];
  const state = {
    exerciseStats: {
      cold: { timesShown: 0, timesCorrect: 0, timesFailed: 0 },
      hot: { timesShown: 100, timesCorrect: 50, timesFailed: 50 }
    }
  };

  const counts = { cold: 0, hot: 0 };
  for (let i = 0; i < 1000; i++) {
    // Cada iteración necesita un RNG fresco para que la varianza sea real
    const result = buildSession(['avere'], exercises, state, 1, 'repaso', seededLcg(1000 + i));
    counts[result.exerciseIds[0]]++;
  }

  const ratio = counts.cold / counts.hot;
  // Expected: weight cold = 1, weight hot = 1/11. Probabilidades: cold = 11/12 ≈ 0.917, hot = 1/12 ≈ 0.083.
  // Ratio = 11. Tolerancia ±5% sobre 1000 iteraciones → entre 10.45 y 11.55.
  assert.ok(ratio > 9 && ratio < 13, `ratio fuera de tolerancia: ${ratio}`);
});
```

### Mocking de funciones puras

**No es necesario.** Todas las funciones del dominio son puras: state in → state out. No hay side effects que mockear. Los únicos "mocks" son:

- `today` → parámetro literal
- `rng` → `seededLcg(seed)`
- `state` → objeto literal de test
- `content` → objeto literal con `exerciseById` y array de ejercicios

Esto es una **ventaja enorme** de la layer-purity de Phase 1: los tests son legibles, deterministas y rápidos.

### Cobertura mínima (D-53)

| Grupo | Tests obligatorios |
|-------|---------------------|
| **D-53.1 Cascada multi-cat** | a) ejercicio `[avere, genero]` fallado tras acierto `[avere]` previo → ambas reset; b) sesión con 1 fallo `[avere]` y 5 aciertos `[avere]` → avere reset (fail-wins); c) ejercicio fallado `[avere]` no afecta a `[genero]` ajena |
| **D-53.2 Promoción y regresión** | a) 3 sesiones acumulando aciertos → promoción a hecha; b) 21 días simulados → dominada en día 21; c) sesión con fallo tras dominada → no-hecha + streak 0 + becameDominadaAt undefined |
| **D-53.3 Racha guard + DOMAIN-06** | a) 5 sesiones mismo día sin fallar → streak += 1 (una vez); b) DOMAIN-06: añadir ejercicio nuevo regresa hecha→no-hecha con cleared preservado |
| **D-53.4 Sampler edges** | a) GUARANTEE con 1 ejercicio por categoría → cubre 1; b) ejercicio multi-cat cubre 2 cats → no duplica; c) weight ratio cold:hot ≈11x (statistical test); d) buildFullTest con 12 ejercicios → resultado 12, único, ordenado por seed |

**Total estimado:** 14-18 tests nuevos. Sumado a los 14 de Phase 1 = ~28-32 tests verdes al cerrar Phase 2.

---

## Pico CSS variables y patrones (HIGH)

### Variables CSS confirmadas

Pico CSS 2.1.1 expone variables con prefijo `--pico-`. [CITED: picocss.com/docs/css-variables]

**Confirmado disponible:**
- `--pico-primary`, `--pico-secondary`, `--pico-contrast` (con variantes `-background`, `-hover`, `-focus`)
- `--pico-muted-color` (texto secundario)
- `--pico-form-element-invalid-border-color`, `--pico-form-element-valid-border-color`
- 20 familias de color (red, pink, fuchsia, purple, violet, indigo, blue, azure, cyan, **jade**, **green**, lime, yellow, **amber**, pumpkin, orange, sand, grey, zinc, slate) con shades 50–950 — **PERO** estos NO están incluidos por defecto en `pico.classless.min.css`. [CITED: picocss.com/docs/colors]

### Implicación crítica para D-30 (badges)

El CONTEXT.md D-30 menciona `--pico-color-green-500` y `--pico-color-amber-500`. **Estas variables NO existen en `pico.classless.min.css`** — están en una hoja separada (`pico.colors.min.css`) que **NO se está cargando** según el `index.html` actual.

**Opciones:**

1. **Definir fallbacks hex en `styles.css`** (recomendado — más consistente con cómo Phase 1 ya maneja `--pico-color-green-500` para `.correcta`/`.incorrecta`):
   ```css
   .badge-no-hecha   { color: var(--pico-muted-color, #6c757d); }
   .badge-hecha      { color: var(--pico-color-green-500, #2e7d32); }
   .badge-dominada   { color: var(--pico-color-amber-500, #f59e0b); }
   ```
   El fallback hex se aplica porque la var no existe en classless. **Esta es la decisión correcta** — coherente con Phase 1's styles.css.

2. Cargar `pico.colors.min.css` adicional vía CDN. **NO recomendado** — añade ~50 KB de CSS para usar 2 colores; rompe el principio "menos CSS posible".

3. Hard-code los colores sin var. Coherente pero pierde el upgrade-path si el autor cambia el tema.

**Recomendación final:** opción 1. Documentar en SUMMARY del plan que "los badges usan `--pico-color-green-500` y `--pico-color-amber-500` con fallback hex porque la hoja `pico.colors.min.css` no se carga; los fallbacks son la fuente real de color en práctica".

### Tabla densa (`<table>`)

Pico classless renderiza `<table>` con padding default y hover sutil. **Sin clases adicionales necesarias.** Recomendación:

```html
<figure>  <!-- Pico recomienda wrap en <figure> para scroll horizontal en móvil; opcional en desktop -->
  <table>
    <thead>
      <tr>
        <th scope="col">Estado</th>
        <th scope="col">Categoría</th>
        <th scope="col">Racha</th>
        <th scope="col">Ejercicios</th>
        <th scope="col">Última vez</th>
      </tr>
    </thead>
    <tbody>
      <template x-for="cat in categoriesForDisplay" :key="cat.id">
        <tr>
          <td><span :class="`badge-${cat.status}`" x-text="cat.badgeGlyph" :aria-label="cat.statusLabel"></span></td>
          <td x-text="cat.name"></td>
          <td x-text="cat.streakLabel"></td>
          <td x-text="cat.totalCount"></td>
          <td x-text="cat.lastPracticedLabel"></td>
        </tr>
      </template>
    </tbody>
  </table>
</figure>
```

### Botones grandes lado a lado

Pico classless `<button>` es full-width por defecto. Para 2 lado a lado, usar `role="group"`:

```html
<div role="group">
  <button @click="openPicker('repaso')">Repaso 20</button>
  <button @click="openPicker('test-completo')">Test completo</button>
</div>
```

Pico estiliza `[role="group"]` como flex horizontal. Sin CSS adicional.

### Aviso inline (`<p>`)

Para el aviso de Test completo (D-36), un `<p>` con color sutil:

```html
<p x-show="pickerMode === 'test-completo'" style="color: var(--pico-muted-color);">
  ⚠ Test completo — <span x-text="pickerPoolSize"></span> ejercicios sin tope. Se puede reanudar si lo cierras a medias.
</p>
```

### Confirmación inline

Pico no tiene un widget de confirm built-in. **Recomendación: `<dialog>` con `x-show` (no `.showModal()`).** Pico estiliza `<dialog>` por defecto. Pero el más simple y consistente con el resto:

```html
<!-- Anywhere fuera de los templates de screen, pero dentro del x-data root -->
<div x-show="confirmDialog" role="alertdialog" style="position:fixed; top:1rem; right:1rem; padding:1rem; border:1px solid var(--pico-muted-color); background:var(--pico-card-background-color); border-radius:var(--pico-border-radius);">
  <p x-text="confirmDialog?.message"></p>
  <div role="group">
    <button @click="confirmDialog.onConfirm(); confirmDialog = null;" x-text="confirmDialog?.confirmLabel || 'Descartar'"></button>
    <button @click="confirmDialog = null" x-text="confirmDialog?.cancelLabel || 'Continuar'" class="secondary"></button>
  </div>
</div>
```

`appShell.confirmDialog` es null o `{message, confirmLabel, cancelLabel, onConfirm}`. Helper:

```js
requestConfirm({message, confirmLabel, cancelLabel, onConfirm}) {
  this.confirmDialog = { message, confirmLabel, cancelLabel, onConfirm };
}

// Uso en los 3 puntos D-27/D-43/D-44:
requestReturnToHome() {
  if (this.currentScreen === 'session' && this.sessionMode === 'repaso') {
    this.requestConfirm({
      message: '¿Descartar esta sesión de repaso? Tus respuestas no se guardarán.',
      confirmLabel: 'Descartar',
      cancelLabel: 'Continuar',
      onConfirm: () => { this.currentScreen = 'home'; this.resetSession(); }
    });
  } else {
    this.currentScreen = 'home';
  }
}
```

**Una sola implementación**, reusada en los tres puntos. Cumple D-27, D-43, D-44 simultáneamente.

---

## Confirmación inline pattern (HIGH)

Resumido en la sección anterior. Patrón completo:

```html
<!-- Dentro del x-data root, fuera de los templates de screen -->
<div x-show="confirmDialog"
     x-cloak
     role="alertdialog"
     aria-labelledby="confirm-message">
  <p id="confirm-message" x-text="confirmDialog?.message"></p>
  <div role="group">
    <button type="button"
            @click="confirmDialog.onConfirm(); confirmDialog = null;"
            x-text="confirmDialog?.confirmLabel"></button>
    <button type="button"
            class="secondary"
            @click="confirmDialog = null"
            x-text="confirmDialog?.cancelLabel"></button>
  </div>
</div>
```

```js
// Propiedades del appShell
confirmDialog: null,  // { message, confirmLabel, cancelLabel, onConfirm }

requestConfirm({message, confirmLabel, cancelLabel = 'Cancelar', onConfirm}) {
  this.confirmDialog = { message, confirmLabel, cancelLabel, onConfirm };
}
```

**Usos:**

| Punto | Llamada |
|-------|---------|
| **D-27 (Volver al home mid-Repaso)** | `requestConfirm({message: '¿Descartar esta sesión de repaso? Tus respuestas no se guardarán.', confirmLabel: 'Descartar', cancelLabel: 'Continuar', onConfirm: () => { this.currentScreen='home'; this.resetSession(); }})` |
| **D-43 (Descartar in-flight test del banner)** | `requestConfirm({message: '¿Descartar el test? Los aciertos hasta ahora no se guardarán.', confirmLabel: 'Descartar', cancelLabel: 'Cancelar', onConfirm: () => { this.state = {...this.state, inFlightTest: undefined}; saveState(this.state); }})` |
| **D-44 (Test completo nuevo con in-flight pendiente)** | `requestConfirm({message: 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?', confirmLabel: 'Descartar y empezar', cancelLabel: 'Cancelar', onConfirm: () => { this.state = {...this.state, inFlightTest: undefined}; saveState(this.state); this.startSession('test-completo'); }})` |

**Por qué `x-show` y no `<dialog>.showModal()`:**
- `x-show` es declarativo (`confirmDialog ? show : hide`). Coherente con todo Alpine.
- `<dialog>.showModal()` requiere `this.$refs.dlg.showModal()` imperativo. Trae interferencia con focus management de Pico.
- `confirm()` JS es modal-blocking síncrono y feo.

---

## Runtime State Inventory

Esta es una refactor/migración significativa (schemaVersion 1 → 2). El inventory:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | `localStorage[italianCourse.v1]` con shape v1 = `{schemaVersion:1, exerciseStats:{...}}` | Migración en `storage.js` (D-46). NO se borra; se extiende vía `migrate1to2`. |
| **Live service config** | Ninguno. App 100% local, sin servicios externos. | Ninguna. |
| **OS-registered state** | Ninguno. No hay tareas programadas, ni daemon, ni scheduled jobs. | Ninguna. |
| **Secrets/env vars** | Ninguno. Sin auth, sin tokens, sin API keys. | Ninguna. |
| **Build artifacts** | Ninguno. Sin `package.json`, sin `dist/`, sin compilados. CDN tags con SRI están en `index.html` y NO cambian. | Ninguna. **Importante:** las versiones `alpinejs@3.15.12` y `@picocss/pico@2.1.1` con sus hashes SRI deben mantenerse intactas. |

**Adicional — riesgo de upgrade:**
- Si el usuario tiene cacheado `italianCourse.v1` con datos v1 reales (12 ejercicios respondidos), tras Plan 02-01 debe poder cargar la app sin perder los counters. La migración automática lo garantiza.
- El bookmark `http://localhost:3000` no cambia. El `npx serve` sigue igual. Sin cambios operacionales para el autor.

---

## Common Pitfalls

### Pitfall 1: Alpine `<template x-if>` con múltiples root elements

**What goes wrong:** Pones 2 `<article>` dentro de un `<template x-if>` y Alpine ignora silenciosamente el segundo. [CITED: alpinejs.dev/directives/if]

**How to avoid:** UN solo elemento root por template. Si necesitas múltiples siblings, envuélvelos en un `<div>` o un `<article>`.

### Pitfall 2: Olvidar que `applySessionResult` cambió la firma

**What goes wrong:** El planner refactoriza `progress.js` añadiendo `content` y `today` pero el caller en `app.js` sigue llamando `applySessionResult(state, sessionResult)`. JavaScript no avisa — `content` queda `undefined`, `today` queda `undefined`, el código falla en `content.exerciseById[eid]` con "Cannot read properties of undefined".

**How to avoid:** Búsqueda global de llamadas a `applySessionResult` tras el refactor. Phase 1 tiene UNA sola llamada (en `src/screens/session.js` línea 178). Phase 2 mueve esa llamada al nuevo `appShell` — debe pasar 4 argumentos.

**Warning sign:** test fail con "Cannot read properties of undefined (reading 'exerciseById')".

### Pitfall 3: `categoryProgress` proxy escapes (Alpine reactive)

**What goes wrong:** Al hacer `this.state = applySessionResult(this.state, ...)` Alpine ENVUELVE el nuevo state en un Proxy. Si más tarde `JSON.stringify(this.state)` se llama (en `saveState`), funciona — los Proxies de Alpine serializan transparentemente. **PERO:** si pasas `this.state.categoryProgress` por referencia a una función pura del dominio que hace `.includes(...)` u operaciones sin clonar, puede haber sutilezas. Probable que NO sea un problema en práctica — Vue 3 Proxies (que Alpine usa) son operacionalmente transparentes.

**How to avoid:** En `applySessionResult` ya se hace spread-clone interno del state. No mutar el input. Tests verifican esto.

### Pitfall 4: Sesión vacía cuando `pool` está vacío

**What goes wrong:** El usuario marca solo categorías que tienen `[]` ejercicios. `buildSession` devuelve `actualSize=0`. El template `ready && !done` evalúa pero `currentExercise` es undefined → "Cannot read property 'payload' of undefined".

**How to avoid:** El picker tiene `:disabled="pickerPoolSize === 0"` (D-35). El botón "Empezar" no es pulsable si pool=0. Si por algún bug se llega a session con exerciseIds=[], `done` es `true` desde el inicio y va directo a summary (que muestra una sesión sin categorías afectadas — esto sería raro pero no rompe).

### Pitfall 5: `inFlightTest` con `cursor` apuntando a un ejercicio borrado

**What goes wrong:** Autor borra un ejercicio de `avere.json` y reanuda un test antiguo. `exerciseIds[cursor]` referencia un ID que ya no existe en `content.exerciseById`. UI renderiza `undefined.payload.prompt` → crash.

**How to avoid:** En `resumeInFlightTest()`, validar que TODOS los `exerciseIds` existen. Si alguno falta, abrir confirm "El test que tenías a medias ya no existe en el contenido" → descartar.

### Pitfall 6: Reactivity stale al sobreescribir `state`

**What goes wrong:** `this.state = applySessionResult(...)` reemplaza el objeto. Alpine debería detectar la swap y re-rerender (Proxies vigilan asignaciones). PERO si el HTML referencia `state.categoryProgress.avere.streakDays` con un path muy profundo, el proxy intermedio puede no triggear si solo cambia el root.

**Verificación:** confirmar que tras `applySessionResult` la home tabla refresca al volver. Si no, hacer la mutation **in-place** en lugar de reasignar:
```js
// En vez de:
this.state = newState;
// Hacer:
Object.assign(this.state, newState);
```

[CITED: alpinejs.dev/advanced/reactivity — proxy intercept de get/set en cualquier depth]

### Pitfall 7: `lastSuccessDate` comparación de strings

**What goes wrong:** Si en algún lado se compara `lastSuccessDate === Date.now()` (epoch ms) en vez de string ISO, falla siempre. Phase 2 usa strings ISO en todo el dominio.

**How to avoid:** Type discipline. `today` es siempre `'YYYY-MM-DD'`. `cat.lastSuccessDate` y `cat.lastPracticedDate` son strings ISO o undefined. **Jamás** mezclar con epoch ms (eso es `startedAt` en `inFlightTest`, que es distinto).

### Pitfall 8: Refactor de `sessionScreen` → `appShell` rompe Phase 1 tests

**What goes wrong:** `tests/domain.test.js` actual no toca `sessionScreen` (es Alpine, no testeable con node --test), solo el dominio. Pero `src/screens/session.js` se ELIMINA o vacía. Si Phase 1 SUMMARY referencia `sessionScreen` en alguna prueba, romperá.

**Verificación:** `grep -rn "sessionScreen" tests/` → debería devolver 0 matches actualmente. Si Phase 2 añade tests del screen layer, hacerlo aparte de `tests/domain*.test.js`.

### Pitfall 9: Olvidar limpiar `inFlightTest` al completar Test completo

**What goes wrong:** Test completo termina, `applySessionResult` corre, summary se muestra. Pero `state.inFlightTest` sigue ahí. Al volver al home, banner persistente "Tienes un Test completo a medias" aparece — confuso.

**How to avoid:** El paso 6 del pseudocódigo de `applySessionResult` borra `inFlightTest`. Test obligatorio: tras `applySessionResult` con sesión completa, `next.inFlightTest === undefined`.

### Pitfall 10: DOMAIN-06 corriendo en cada `applySessionResult` además del boot

**What goes wrong:** Si el planner pone la lógica de DOMAIN-06 dentro de `applySessionResult`, regresa categorías constantemente (cada vez que detecta un ejercicio en content que no está en cleared). Falso positivo.

**How to avoid:** DOMAIN-06 corre **una vez en el boot** (paso 3 del flow de `main.js` ampliado, mencionado en CONTEXT.md "Integration Points"). NO va en `applySessionResult`. Documentar en código.

Implementación de DOMAIN-06 en boot:

```js
// src/main.js, dentro de bootstrap(), después de loadContent + loadState:
function applyNewExerciseRegression(state, content) {
  const exercisesByCategory = buildExercisesByCategory(content);
  const next = { ...state, categoryProgress: { ...state.categoryProgress } };

  for (const [catId, cat] of Object.entries(next.categoryProgress)) {
    if (cat.status !== 'hecha' && cat.status !== 'dominada') continue;
    const allInCat = exercisesByCategory[catId] ?? [];
    const hasNewExercise = allInCat.some(eid => !cat.clearedExerciseIds.includes(eid));
    if (hasNewExercise) {
      next.categoryProgress[catId] = {
        ...cat,
        status: 'no-hecha',
        streakDays: 0,
        becameHechaAt: undefined,
        becameDominadaAt: undefined
        // clearedExerciseIds NO se vacía (D-40 explícito)
        // lastPracticedDate y lastSuccessDate preservados
      };
    }
  }
  return next;
}

// En bootstrap():
const state0 = loadState();
const stateAfterDOMAIN06 = applyNewExerciseRegression(state0, content);
saveState(stateAfterDOMAIN06);  // persistir el cambio si hubo regresión
```

**Test obligatorio (D-53.3):** estado v2 con avere `hecha`, cleared=[a1,a2]; content añade a3 → tras `applyNewExerciseRegression`, avere `no-hecha`, streak=0, cleared=[a1,a2] preservado.

---

## Code Examples

### Patrón canónico de migración

```js
// src/data/storage.js
const CURRENT_SCHEMA_VERSION = 2;

export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {}
  };
}

function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  if (parsed.schemaVersion === 2) return hydrateV2(parsed);
  if (parsed.schemaVersion === 1) return migrate1to2(parsed);
  console.warn('schemaVersion desconocido:', parsed.schemaVersion);
  return blankState();
}

function migrate1to2(v1) {
  return {
    schemaVersion: 2,
    exerciseStats: (typeof v1.exerciseStats === 'object' && v1.exerciseStats) || {},
    categoryProgress: {},
    dailyLog: {}
    // inFlightTest omitido (undefined)
  };
}
```

[Source: derived from src/data/storage.js Phase 1 + D-46]

### Patrón canónico de inicialización lazy

```js
// src/domain/progress.js
function blankCategoryProgress() {
  return {
    status: 'no-hecha',
    clearedExerciseIds: [],
    streakDays: 0,
    lastPracticedDate: undefined,
    lastSuccessDate: undefined,
    becameHechaAt: undefined,
    becameDominadaAt: undefined
  };
}

// Uso dentro del loop de applySessionResult:
const prev = next.categoryProgress[catId] ?? blankCategoryProgress();
const cat = { ...prev, clearedExerciseIds: [...prev.clearedExerciseIds] };
next.categoryProgress[catId] = cat;
```

[Source: D-47]

### Patrón canónico de computar `summaryDelta`

```js
// Dentro de appShell, en completeSession:
completeSession() {
  const sessionResult = { answers: this.sessionResults };
  const today = todayLocal();
  const before = JSON.parse(JSON.stringify(this.state.categoryProgress));  // deep snapshot
  const newState = applySessionResult(this.state, sessionResult, this.content, today);
  saveState(newState);
  this.state = newState;

  // Computar delta UNA VEZ aquí (no getter, no reactivity overhead).
  const practicedCatIds = new Set(
    sessionResult.answers.flatMap(a => this.content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );
  const failedCatIds = new Set(
    sessionResult.answers.filter(a => !a.correct).flatMap(a => this.content.exerciseById[a.exerciseId]?.categoryIds ?? [])
  );
  this.summaryDelta = [...practicedCatIds].map(catId => {
    const beforeCat = before[catId] ?? { status: 'no-hecha', streakDays: 0, clearedExerciseIds: [] };
    const afterCat = newState.categoryProgress[catId];
    const totalInCat = this.content.exercisesByCategory[catId]?.length ?? 0;
    const failed = failedCatIds.has(catId);
    return {
      categoryId: catId,
      categoryName: this.content.categories.find(c => c.id === catId)?.name ?? catId,
      statusBefore: beforeCat.status,
      statusAfter: afterCat.status,
      streakBefore: beforeCat.streakDays,
      streakAfter: afterCat.streakDays,
      pendingForHecha: afterCat.status === 'no-hecha' ? (totalInCat - afterCat.clearedExerciseIds.length) : 0,
      reason: failed ? `falló (cascada multi: ${[...failedCatIds].join(' + ')})` : null
    };
  });

  // Cuenta global de aciertos/fallos
  this.summaryHeaderLabel = `Sesión terminada · ${sessionResult.answers.filter(a => a.correct).length}/${sessionResult.answers.length} correctos`;

  this.currentScreen = 'summary';
}
```

[Source: derived from D-37, ARCHITECTURE.md §7 patterns]

### Patrón canónico de banner in-flight

```html
<!-- Dentro del template x-if="currentScreen === 'home'", encima de los botones -->
<div x-show="state.inFlightTest" role="alert" style="border: 1px solid var(--pico-muted-color); padding: 0.75rem; margin-bottom: 1rem;">
  ⚠ Tienes un Test completo a medias
  (<span x-text="state.inFlightTest?.cursor"></span>
  / <span x-text="state.inFlightTest?.exerciseIds?.length"></span> ejercicios).
  <div role="group" style="margin-top:0.5rem;">
    <button @click="resumeInFlightTest()">Reanudar</button>
    <button class="secondary" @click="discardInFlightTestWithConfirm()">Descartar</button>
  </div>
</div>
```

```js
resumeInFlightTest() {
  const ift = this.state.inFlightTest;
  // Validar IDs aún existen en content (Pitfall 5)
  const valid = ift.exerciseIds.filter(eid => this.content.exerciseById[eid]);
  if (valid.length === 0 || valid.length <= ift.cursor) {
    this.requestConfirm({
      message: 'El test que tenías a medias ya no existe en el contenido. ¿Descartar?',
      confirmLabel: 'Descartar',
      onConfirm: () => this.clearInFlightTest()
    });
    return;
  }
  this.sessionMode = 'test-completo';
  this.sessionExerciseIds = ift.exerciseIds;
  this.sessionCursor = ift.cursor;
  this.sessionResults = [...ift.answers];
  this.currentScreen = 'session';
}

clearInFlightTest() {
  this.state = { ...this.state, inFlightTest: undefined };
  saveState(this.state);
}
```

[Source: derived from D-41, D-42, D-43]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phase 1 `applySessionResult(state, sessionResult)` — solo counters | Phase 2 `applySessionResult(state, sessionResult, content, today)` — cascada + estados + log | D-52 (Phase 2) | Firma rota — refactor del único caller en `appShell` |
| Phase 1 `sessionScreen()` factory | Phase 2 `appShell()` factory único | D-24 (Phase 2) | `src/screens/session.js` se elimina o vacía; toda la lógica migra a `src/screens/app.js` |
| Phase 1 main.js hard-codea `['avere']` | Phase 2 main.js lee `categories.json` | Code context CONTEXT.md | `REGISTRY` deriva del JSON; permite añadir categorías sin tocar código |
| Phase 1 storage v1 = `{schemaVersion:1, exerciseStats}` | Phase 2 storage v2 = `{schemaVersion:2, exerciseStats, categoryProgress, dailyLog, inFlightTest?}` | D-46 | Migración 1→2 transparente |
| Phase 1 write-once-on-session-end (todos los modos) | Phase 2 write-once para Repaso, write-on-every-answer para Test completo | D-42 | Inflexión: Test completo es la EXCEPCIÓN reanudable |
| `beforeunload` para guardar estado | NO usar; per-answer writes son suficientes | Recomendación research (2026) | Chrome deprecation [CITED] |

**Deprecated/outdated:**
- `localStorage` bajo `file://` (Phase 1 ya rechazado): SIGUE rechazado. `npx serve` único path soportado.
- Pattern 8 dual-listener de `01-RESEARCH.md`: rechazado tras UAT 01-02. Phase 2 mantiene el patrón Promise-handoff de Phase 1 SUMMARY (script ordering + sync top-level listener).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `--pico-color-green-500` y `--pico-color-amber-500` NO están en `pico.classless.min.css`; sí están en `pico.colors.min.css` (no cargada) | Pico CSS variables | LOW — el fallback hex en `styles.css` resuelve el caso. Verificar visualmente al implementar (DevTools → computed styles). |
| A2 | Alpine `<template x-if>` con root único es el patrón canónico — `x-data` raíz preserva state al cambiar `currentScreen` | Alpine multi-screen | LOW — verificado en Alpine docs + GitHub discussions. Si fallara, contingencia: `x-show` (mantiene DOM pero pierde ventaja). |
| A3 | `state.inFlightTest` persistido en el mismo blob es atómico (no risk de partial write) | In-flight Test | LOW — `JSON.stringify` + `localStorage.setItem` son síncronos atómicos por spec. |
| A4 | El refactor `sessionScreen → appShell` no rompe ningún test (los tests no tocan screens) | Pitfall 8 | LOW — `grep tests/ sessionScreen` → 0 matches en el repo actual. |
| A5 | `Object.values(content.exerciseById)` produce el mismo orden en runtime de Node (tests) y en browser | Sampler tests | LOW — orden de inserción preservado en JS spec desde ES2015. |
| A6 | El usuario NO usa Phase 1 con muchos ejercicios en v1 antes de upgrade (la migración descarta racha — no había en v1) | Migración | LOW — Phase 1 walking skeleton tiene 12 ejercicios de Avere; el usuario reporta "approved 8/8" pero no ha acumulado meses de uso. Migración es lossless para counters; "pierde" solo racha que nunca existió. |
| A7 | `categoriesForDisplay` puede ser un getter sin perf hit con 6 categorías | Performance | LOW — bench teórico <1ms. Si crece a 50+: memoizar al transicionar. |

---

## Open Questions

Ninguna abierta. Todas las decisiones críticas están cerradas en `02-CONTEXT.md`. La research codifica los algoritmos exactos derivados de esas decisiones.

**Posibles preguntas que pueden emerger durante la implementación (NO blockers, son discreción del planner):**

1. **¿`exerciseStats.lastShownAt`?**
   - What we know: Discreción del planner (CONTEXT.md). La research dice "no añadirlo en Phase 2 por simplicidad".
   - Recommendation: NO añadir. Si en Phase 5 surge la necesidad para un dashboard temporal, añadir entonces.

2. **¿Cap del `dailyLog`?**
   - What we know: D-48 dice "sin cap en Phase 2". Cap es polish de Phase 5.
   - Recommendation: NO añadir cap. Tamaño actual es trivial.

3. **¿Mostrar warning cuando picker oversubscribe target (D-51)?**
   - What we know: Diferido a deferred. En v1 hay 6 categorías → caso teórico.
   - Recommendation: NO mostrar. El usuario sabe lo que selecciona.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node 22 LTS | Tests con `node --test`, `npx serve` | ✓ | v22.20.0 [VERIFIED 2026-05-23] | — |
| npx | Para `npx serve` | ✓ | con Node 22 | — |
| Navegador moderno (Chrome/Firefox/Edge) | Runtime de la app | ✓ (usuario lo abrirá) | — | — |
| Internet (primera vez) | Cargar Alpine + Pico desde CDN | ✓ asumido | — | App cacheada offline una vez cargada |
| `alpinejs@3.15.12` CDN | UI reactiva | ✓ (CDN ya configurado en `index.html` con SRI) | 3.15.12 | — |
| `@picocss/pico@2.1.1` CDN | Estilo classless | ✓ (CDN ya configurado en `index.html` con SRI) | 2.1.1 | — |

**Missing dependencies with no fallback:** ninguna.
**Missing dependencies with fallback:** ninguna.

---

## Validation Architecture

> `workflow.nyquist_validation` no se ha consultado explícitamente, pero la sección se incluye por defecto (key absent = enabled).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `node:test` (Node 22.20.0 built-in) |
| Config file | none — convention-based |
| Quick run command | `node --test tests/domain-progress.test.js` |
| Full suite command | `node --test tests/*.test.js` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DOMAIN-03 | `buildFullTest` devuelve todos los ejercicios del pool sin tope | unit | `node --test tests/domain-session.test.js` | ❌ Wave 0 (split desde domain.test.js) |
| DOMAIN-04 | Cascada fail-wins en `applySessionResult` | unit | `node --test tests/domain-progress.test.js` | ❌ Wave 0 |
| DOMAIN-05 | Transiciones `no-hecha → hecha → dominada` | unit | `node --test tests/domain-progress.test.js` | ❌ Wave 0 |
| DOMAIN-06 | Ejercicio nuevo regresa categoría a `no-hecha` | unit | `node --test tests/domain-progress.test.js` (o `main-boot.test.js`) | ❌ Wave 0 |
| DOMAIN-07 | Racha guard por `lastSuccessDate !== today` | unit | `node --test tests/domain-progress.test.js` | ❌ Wave 0 |
| DOMAIN-08 | Promoción a `dominada` al alcanzar 21 días | unit | `node --test tests/domain-progress.test.js` | ❌ Wave 0 |
| DOMAIN-10 | Smoke tests simulando ≥30 días | unit (suite) | `node --test tests/domain-progress.test.js` | ❌ Wave 0 |
| SESSION-01 | Home dashboard muestra tabla con badges | manual-only (UAT) | (verificación humana al abrir `http://localhost:3000`) | ❌ |
| SESSION-02 | Botón "Repaso 20" abre picker | manual-only (UAT) | (verificación humana) | ❌ |
| SESSION-03 | Botón "Test completo" abre picker con aviso | manual-only (UAT) | (verificación humana) | ❌ |
| SESSION-07 | Resumen pantalla-completa con delta | manual-only (UAT) | (verificación humana) | ❌ |
| SESSION-08 | Abandono Repaso descarta state | manual-only (UAT) | (verificación humana cerrando pestaña mid-Repaso) | ❌ |
| SESSION-09 | Test completo reanudable | manual-only (UAT) + unit storage migration | manual + `node --test tests/data-storage.test.js` | ❌ |

**Manual-only justification:** SESSION-01..09 implican reactividad Alpine + DOM render. Testear con jsdom/happy-dom añadiría una dependencia (violando el "cero npm install") y no aporta más confianza que la UAT humana del autor en su flujo real.

### Sampling Rate

- **Per task commit:** `node --test tests/domain-progress.test.js` (subseconds) o `node --test tests/domain-session.test.js`
- **Per wave merge:** `node --test tests/*.test.js` (full suite, ~28-32 tests)
- **Phase gate:** Full suite green + UAT humano (D-53 los success criteria implican verificación humana end-to-end de cascada, dominada, etc.)

### Wave 0 Gaps

- [ ] `tests/domain-progress.test.js` — covers DOMAIN-04/05/06/07/08/10. Split desde `tests/domain.test.js` (los counters de Phase 1 quedan + se añaden los nuevos para cascada/estados).
- [ ] `tests/domain-session.test.js` — covers DOMAIN-03 y nuevos edge cases del GUARANTEE phase de `buildSession`.
- [ ] `tests/data-storage.test.js` (opcional) — covers migración 1→2 de `migrate1to2`. **Recomendación:** sí crear, porque la migración es la pieza más fácil de romper y la difícil de reproducir manualmente (requiere setup de localStorage v1).
- [ ] (No es necesario) test runner config — `node --test` no necesita config.

*(Si no hay gaps en otras áreas: "Existing test infrastructure de Phase 1 cubre el setup; solo faltan los archivos nuevos listados arriba.")*

---

## Sources

### Primary (HIGH confidence)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — D-24..D-53, fuente de todas las decisiones que esta research codifica.
- `.planning/research/ARCHITECTURE.md` §6 (Session generation), §7 (State machine + applySessionResult pseudocode), §8 (Date handling), §9 (Persistence Layer) — match exacto con el pseudocódigo que produce esta research.
- `.planning/research/PITFALLS.md` #1 (TZ), #2 (reset cascade model), #3 (set-cover ambiguity), #4 (weighted random collapse), #5 (localStorage), #10 (Test completo abandonment) — mitigations codificadas en las decisiones D-38/39/40/41/42 ya validan estos pitfalls.
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md` — patrón Promise-handoff Alpine (validado en UAT 01-02; mantiene vigencia en Phase 2).
- `src/main.js`, `src/screens/session.js`, `src/domain/progress.js`, `src/domain/session.js`, `src/data/storage.js` — código existente que Phase 2 extiende/refactoriza. Read directly.
- [alpinejs.dev/directives/if](https://alpinejs.dev/directives/if) — verificado: `<template x-if>` con root único, destruye DOM al toggle.
- [alpinejs.dev/advanced/reactivity](https://alpinejs.dev/advanced/reactivity) — verificado: Vue Proxy reactivity, granular cambios deep.
- [nodejs.org/api/test.html](https://nodejs.org/api/test.html) — verificado: glob patterns recomendados, function-arg injection canónico para time.
- [picocss.com/docs/colors](https://picocss.com/docs/colors) — verificado: 20 familias de color, NO en classless por defecto.
- [picocss.com/docs/css-variables](https://picocss.com/docs/css-variables) — verificado: `--pico-muted-color`, `--pico-primary`, `--pico-form-element-invalid-*` confirmados.
- `npm view alpinejs version` → 3.15.12 [VERIFIED 2026-05-23]
- `npm view @picocss/pico version` → 2.1.1 [VERIFIED 2026-05-23]
- `node --version` → v22.20.0 [VERIFIED 2026-05-23]

### Secondary (MEDIUM confidence)
- [alpinedevtools.com/blog/stores-usage-guide](https://alpinedevtools.com/blog/stores-usage-guide) — best practices para large `x-data` (keep flat, getters no cached). Múltiples fuentes coinciden.
- [github.com/alpinejs/alpine discussion #3654](https://github.com/alpinejs/alpine/discussions/3654) — confirma que `$watch` dentro de `x-if` no se destruye (gotcha real).
- [developer.chrome.com/docs/web-platform/deprecating-unload](https://developer.chrome.com/docs/web-platform/deprecating-unload) — Chrome rollout abril 2026; valida la decisión de NO añadir `beforeunload` en Phase 2.

### Tertiary (LOW confidence)
- Ninguna. Todas las decisiones críticas están validadas por al menos una fuente HIGH o múltiples MEDIUM.

---

## Metadata

**Confidence breakdown:**
- Algoritmo `applySessionResult`: HIGH — derivado directo de ARCHITECTURE.md §7 + D-39, todos los edge cases mapeados.
- Migración storage v1→v2: HIGH — patrón estándar, código de Phase 1 ya tiene el shell.
- Sampler GUARANTEE + FILL: HIGH — algoritmo set-cover greedy clásico, edge cases identificados.
- In-flight Test completo: HIGH — atomicity de localStorage garantizada por spec.
- Alpine multi-screen patterns: HIGH — `<template x-if>` con root único es documentado oficialmente.
- Testing strategy: HIGH — `node --test` con `today` inyectado es la práctica canónica.
- Pico CSS variables: MEDIUM-HIGH — confirmado que `--pico-color-*-500` no está en classless; fallback hex es la decisión correcta.
- Confirmación inline pattern: HIGH — reutilizable con `x-show` + helper `requestConfirm()`.
- Performance: HIGH — 6 categorías × 5 columnas es trivial para Alpine reactivity.

**Research date:** 2026-05-23
**Valid until:** 2026-06-22 (30 days — stable; Alpine 3.15.12 y Pico 2.1.1 son versiones maduras sin major releases en pipeline)

---

## RESEARCH COMPLETE

Phase 2 motor completo de re-verificación — esta research codifica los algoritmos exactos (`applySessionResult` con cascada + promoción + racha guard, sampler GUARANTEE+FILL, migración schemaVersion 1→2, `inFlightTest` per-answer write) derivados de las 30 decisiones cerradas en CONTEXT.md, con edge cases mapeados, tests obligatorios listados, y patrones HTML/CSS/JS canónicos listos para que el planner los inserte en `src/screens/app.js`, `src/domain/progress.js`, `src/domain/session.js` y `src/data/storage.js` sin re-investigar nada.
