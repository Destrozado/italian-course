# Phase 2: Mecánica completa de re-verificación (cascada + estados + dashboard) - Pattern Map

**Mapped:** 2026-05-23
**Files analyzed:** 9 (8 modificados + 1 creado + 1 eliminado)
**Analogs found:** 9 / 9 (todos tienen analog en el codebase de Phase 1)

## File Classification

| Archivo (nuevo/modificado/eliminado) | Role | Data Flow | Closest Analog | Match Quality |
|--------------------------------------|------|-----------|----------------|---------------|
| `src/domain/session.js` (MOD) | DOMAIN (pure) | transform (RNG→list) | `src/domain/session.js` (self, Phase 1) | exact (self-evolution) |
| `src/domain/progress.js` (MOD) | DOMAIN (pure) | transform (state machine) | `src/domain/progress.js` (self, Phase 1) | exact (self-evolution) |
| `src/data/storage.js` (MOD) | DATA (boundary) | request-response (localStorage I/O) | `src/data/storage.js` (self, Phase 1) | exact (self-evolution) |
| `src/main.js` (MOD) | BOOT (orchestrator) | event-driven (Alpine init) | `src/main.js` (self, Phase 1) | exact (self-evolution) |
| `index.html` (MOD) | TEMPLATE (HTML+Alpine) | declarative reactive | `index.html` (self, Phase 1) | exact (self-evolution) |
| `styles.css` (MOD) | STYLE | CSS cascade | `styles.css` (self, Phase 1) | exact (self-evolution) |
| `src/screens/app.js` (NEW) | SCREEN (Alpine factory) | event-driven + state machine | `src/screens/session.js` (Phase 1) | strong (role+flow) |
| `tests/domain.test.js` (MOD) | TEST (node --test) | request-response (input→assertion) | `tests/domain.test.js` (self, Phase 1) | exact (self-evolution) |
| `src/screens/session.js` (DEL) | SCREEN | — | (deleted, lógica migra a app.js) | n/a |

---

## Pattern Assignments

### `src/domain/session.js` (DOMAIN, pure, transform) — MODIFICADO

**Analog:** `src/domain/session.js` (Phase 1, self). Mantiene firma de `buildSession`; añade GUARANTEE phase antes del bucle FILL y exporta `buildFullTest`.

**Layer-purity boundary:** módulo sin DOM, sin storage, sin fetch. RNG inyectable. NO importa de `screens/`, `data/storage.js` ni `main.js`. Se importa SOLO desde `src/screens/app.js` y `tests/domain*.test.js`.

**Imports pattern** (líneas 1-16 actuales — NO añadir imports nuevos; el módulo sigue sin dependencias):
```js
// src/domain/session.js
//
// Pure domain module — sampler de sesión. Sin DOM, sin storage, sin fetch.
```
El módulo se exporta `exerciseWeight` y `buildSession`; Phase 2 añade `export function buildFullTest`. Mantiene `WEIGHT_CAP = 10`.

**Core pattern a PRESERVAR — weighted random sin reemplazo + Fisher-Yates** (líneas 53-95, actual `buildSession`):
```js
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) {
  // 1. Filtrar el pool a ejercicios elegibles
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );

  if (pool.length === 0) return { exerciseIds: [], actualSize: 0 };

  const targetSize = Math.min(requestedSize, pool.length);
  // ... weighted sampling loop ...

  // 4. Fisher-Yates final con el mismo rng
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return { exerciseIds: picked.map(ex => ex.id), actualSize: picked.length };
}
```

**Lo que CAMBIA — añadir GUARANTEE phase entre paso 1 y paso 3** (D-49, código canónico en RESEARCH.md §"Sampler GUARANTEE + FILL"):
```js
// 2. GUARANTEE phase (NUEVO en Phase 2 — D-49).
for (const cat of categoryIds) {
  const alreadyCovered = session.some(ex => (ex.categoryIds ?? []).includes(cat));
  if (alreadyCovered) continue;
  const candidates = pool.filter(ex =>
    (ex.categoryIds ?? []).includes(cat) && !session.includes(ex)
  );
  if (candidates.length === 0) continue;          // D-51: silently skip
  if (session.length >= targetSize) break;        // oversubscription protection
  const picked = weightedPickOne(candidates, state, rng);
  session.push(picked);
}
// 3. FILL phase (existente, sin cambios estructurales).
```

**Nueva export `buildFullTest`** (D-50; en el mismo archivo siguiendo el estilo doc-comment de `buildSession`):
```js
export function buildFullTest(categoryIds, allExercises, rng = Math.random) {
  const pool = allExercises.filter(ex =>
    Array.isArray(ex.categoryIds) && ex.categoryIds.some(c => categoryIds.includes(c))
  );
  const shuffled = [...pool];
  // Fisher-Yates (mismo del actual buildSession, refactorizable a helper)
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return { exerciseIds: shuffled.map(ex => ex.id), actualSize: shuffled.length };
}
```

**Helper privado a EXTRAER** (factorizando el bucle weighted que aparece en GUARANTEE y FILL):
```js
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

**Validación de pureza (heredada de Phase 1):** una llamada a `buildSession` o `buildFullTest` con el mismo `rng` seeded produce siempre el mismo output. Mutar el output NO afecta a `state` ni a `allExercises` (test ya existente sirve de regression).

---

### `src/domain/progress.js` (DOMAIN, pure, state machine) — MODIFICADO

**Analog:** `src/domain/progress.js` (Phase 1, self). La función pasa de "actualiza contadores" a "máquina de estados completa con cascada + promociones + log diario". Firma cambia.

**Layer-purity boundary:** PURA. Sin DOM, sin storage, sin fetch, sin lectura de `Date`/`Math.random`. `today` y `content` son inyectados. Misma regla de imports cero que Phase 1.

**Imports pattern actual (sin cambios — el módulo sigue sin imports):**
```js
// src/domain/progress.js
//
// Pure domain module — actualización de contadores de progreso.
// Sin DOM, sin storage, sin fetch.
```

**Patrón de spread-clone defensivo a PRESERVAR** (líneas 25-44 actuales):
```js
export function applySessionResult(state, sessionResult) {
  const next = {
    ...state,
    exerciseStats: { ...(state.exerciseStats ?? {}) }
  };
  for (const ans of sessionResult.answers ?? []) {
    const prev = next.exerciseStats[ans.exerciseId] ?? {
      timesShown: 0, timesCorrect: 0, timesFailed: 0
    };
    next.exerciseStats[ans.exerciseId] = {
      timesShown: prev.timesShown + 1,
      timesCorrect: prev.timesCorrect + (ans.correct ? 1 : 0),
      timesFailed: prev.timesFailed + (ans.correct ? 0 : 1)
    };
  }
  return next;
}
```

**Lo que CAMBIA — nueva firma + estructura completa** (D-52; el pseudocódigo canónico vive en RESEARCH.md §"Algoritmo applySessionResult"):
```js
//   - D-52: firma rota intencionalmente. `today` (ISO string) y `content`
//     se inyectan; el caller (appShell.completeSession) los pasa.
//   - D-39: cascada fail-wins absoluto. Si una categoría aparece en
//     `failedCategoryIds`, se RESETEA aunque hubiera aciertos en la misma sesión.
//   - D-38: streak respeta `lastSuccessDate !== today` guard (5 sesiones
//     mismo día → +1, no +5).
//   - DOMAIN-09: `exerciseStats` SIGUE siendo monotónico (paso 6 del pseudocódigo,
//     corre en TODOS los casos, antes y al margen del branch fail/correct).

export function applySessionResult(state, sessionResult, content, today) {
  const exercisesByCategory = buildExercisesByCategory(content);  // helper local
  const next = {
    ...state,
    exerciseStats: { ...(state.exerciseStats ?? {}) },
    categoryProgress: { ...(state.categoryProgress ?? {}) },
    dailyLog: { ...(state.dailyLog ?? {}) }
  };
  // ... 6 pasos del pseudocódigo: failedCategoryIds, practicedCategoryIds,
  // actualización monotónica exerciseStats, branch fail-wins vs promotion,
  // dailyLog[today], delete inFlightTest ...
  return next;
}
```

**Helpers privados nuevos en el mismo archivo** (D-47, RESEARCH.md §"Patrón canónico de inicialización lazy"):
```js
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

function buildExercisesByCategory(content) {
  const out = {};
  for (const ex of Object.values(content.exerciseById)) {
    for (const cid of ex.categoryIds ?? []) {
      (out[cid] ??= []).push(ex.id);
    }
  }
  return out;
}

function uniqueStrings(arr) { return [...new Set(arr)]; }
```

**Nueva export `applyNewExerciseRegression`** para DOMAIN-06 (D-40; RESEARCH.md §"Common Pitfalls #10"). Es una FUNCIÓN PURA SEPARADA — NO va dentro de `applySessionResult` (anti-pattern documentado):
```js
export function applyNewExerciseRegression(state, content) {
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
      };
    }
  }
  return next;
}
```

---

### `src/data/storage.js` (DATA, request-response) — MODIFICADO

**Analog:** `src/data/storage.js` (Phase 1, self). Misma arquitectura de "única puerta a localStorage"; sólo cambia el shape del estado y se añade la rama `migrate1to2`.

**Layer-purity boundary:** ESTE archivo SÍ toca `localStorage` (es la frontera). Mantiene la regla "el resto del proyecto NO importa localStorage directamente". `saveState` sigue siendo estructuralmente agnóstico.

**Constante de versión y `blankState` a ACTUALIZAR** (líneas 22-34 actuales; ejemplo de cómo crece):
```js
// ANTES (Phase 1):
const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 1;

export function blankState() {
  return { schemaVersion: CURRENT_SCHEMA_VERSION, exerciseStats: {} };
}
```
```js
// DESPUÉS (Phase 2 — D-46, D-47):
const KEY = 'italianCourse.v1';            // la KEY localStorage NO cambia
const CURRENT_SCHEMA_VERSION = 2;

export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {}
    // inFlightTest omitido (undefined) — saveState/JSON.stringify lo elide
  };
}
```

**Patrón defensivo del wrapper try/catch a PRESERVAR** (líneas 44-70 actuales) — `loadState()`, `saveState()` NO cambian estructura, sólo llaman al nuevo `migrate`:
```js
export function loadState() {
  let raw;
  try { raw = localStorage.getItem(KEY); }
  catch (e) {
    console.warn('localStorage no disponible; iniciando estado en blanco', e);
    return blankState();
  }
  if (!raw) return blankState();
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) {
    console.warn('Estado de localStorage corrupto; haciendo backup y arrancando limpio.', e);
    try { localStorage.setItem(KEY + '.corrupt.' + Date.now(), raw); } catch (_) {}
    return blankState();
  }
  return migrate(parsed);
}
```

**Lo que CAMBIA — función `migrate` extendida** (líneas 94-109; añade `migrate1to2` + `hydrateV2`, manteniendo el branch defensivo "schemaVersion desconocido → blankState"):
```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  if (parsed.schemaVersion === 2) return hydrateV2(parsed);
  if (parsed.schemaVersion === 1) return migrate1to2(parsed);
  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}

function migrate1to2(v1) {
  return {
    schemaVersion: 2,
    exerciseStats: (typeof v1.exerciseStats === 'object' && v1.exerciseStats !== null)
      ? v1.exerciseStats
      : {},
    categoryProgress: {},       // hidrata lazy on first applySessionResult
    dailyLog: {}
    // inFlightTest omitido
  };
}

function hydrateV2(parsed) {
  return {
    schemaVersion: 2,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null) ? parsed.exerciseStats : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null) ? parsed.categoryProgress : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null) ? parsed.dailyLog : {},
    inFlightTest: parsed.inFlightTest   // permitido undefined o objeto
  };
}
```

**Patrón documental obligatorio en el header del archivo** (en línea de "Decisiones aplicadas"): añadir referencia D-41/D-46/D-47 y la nota "inFlightTest vive en el mismo blob que el resto del state, NO en una key separada".

---

### `src/main.js` (BOOT, orchestrator) — MODIFICADO

**Analog:** `src/main.js` (Phase 1, self). Mantiene el patrón Promise-handoff síncrono (CRÍTICO — UAT 01-02 lo verificó); cambian (1) la lista de categorías a cargar, (2) el factory que se registra con Alpine, (3) el paso post-load de DOMAIN-06.

**Layer boundary:** orchestrator. Importa de `data/`, `screens/` y `domain/` (sólo para `applyNewExerciseRegression`). NO contiene lógica de dominio inline.

**Patrón síncrono Promise-handoff Alpine — INTACTO** (líneas 36-48 actuales — esto NO se mueve, NO se cambia el orden de declaración, NO se hace `addEventListener` dentro de un `async`):
```js
let resolveAppData;
const appDataReady = new Promise((resolve) => {
  resolveAppData = resolve;
});

// --- Registro SÍNCRONO del listener Alpine al cargar el módulo ---------
// Tiene que correr antes de que Alpine emita `alpine:init`.
document.addEventListener('alpine:init', () => {
  window.Alpine.data('sessionScreen', () => sessionScreen(appDataReady));
});
```

**Lo que CAMBIA — registro del nuevo factory** (D-25, D-26):
```js
// Antes:
import { sessionScreen } from './screens/session.js';
// ...
window.Alpine.data('sessionScreen', () => sessionScreen(appDataReady));

// Después:
import { appShell } from './screens/app.js';
// ...
window.Alpine.data('appShell', () => appShell(appDataReady));
```

**Lo que CAMBIA — REGISTRY derivado de `categories.json`** (sustituye el hard-code `['avere']` de la línea 28):
```js
// Antes:
const REGISTRY = ['avere'];
const content = await loadContent(REGISTRY);

// Después (CONTEXT.md "Existing Code Insights" + "Integration Points"):
//   1) loadContent ahora se invoca con la lista derivada de categories.json
//   2) content-loader.js ya soporta N categorías (Phase 1 lo dejó preparado),
//      sólo cambia QUÉ lista se le pasa.
async function bootstrap() {
  try {
    const categoriesRaw = await fetch('content/categories.json').then(r => r.json());
    const categoryIds = (categoriesRaw.categories ?? []).map(c => c.id);
    const content = await loadContent(categoryIds);
    // ... resto igual ...
```
> NOTA: el planner puede decidir si la "doble carga" de categories.json (una en main.js, otra dentro de loadContent) se evita refactorizando `loadContent` para devolver también las categorías. Discretion.

**Lo que SE AÑADE — DOMAIN-06 boot step** (D-40; RESEARCH.md §"Common Pitfalls #10"). Va ENTRE `loadState()` y `resolveAppData(...)`:
```js
import { applyNewExerciseRegression } from './domain/progress.js';

// dentro de bootstrap(), tras loadContent + loadState:
const state0 = loadState();
const state = applyNewExerciseRegression(state0, content);
if (state !== state0) {
  // Sólo persistir si hubo regresión (evita writes innecesarios al boot).
  saveState(state);
}

window.__appBoot = { content, state, ready: true };
const placeholder = document.getElementById('app-placeholder');
if (placeholder) placeholder.remove();
resolveAppData({ content, state });
```

**Patrón del banner de error a PRESERVAR íntegramente** (líneas 88-128 actuales — `renderValidationBanner` se reusa sin cambios). El factory que NO resuelve la Promise sigue siendo el mecanismo de all-or-nothing (D-10).

---

### `index.html` (TEMPLATE, declarative reactive) — MODIFICADO

**Analog:** `index.html` (Phase 1, self). Se conservan: SRI pinning, `x-cloak`, orden script main.js → Alpine defer, banner div, placeholder. SE CAMBIA: el contenido del `<main>` muta de "un `<div x-data="sessionScreen">` con 3 templates" a "un `<div x-data="appShell">` con 4 templates de screen + 1 confirmDialog".

**Layer-purity boundary:** templates Alpine. T-02-01 (jamás `x-html`, solo `x-text`/`:class`/`:disabled`) sigue siendo regla absoluta — el JSON del autor puede contener literales que NO deben renderizarse como HTML.

**Patrón "CDN pinned con SRI" a PRESERVAR** (líneas 9-13 y 27-30 actuales — versiones NO cambian; no se añaden plugins de Alpine):
```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.classless.min.css"
      integrity="sha384-NZhm4G1I7BpEGdjDKnzEfy3d78xvy7ECKUwwnKTYi036z42IyF056PbHfpQLIYgL"
      crossorigin="anonymous">
<script type="module" src="./src/main.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/dist/cdn.min.js"
        integrity="sha384-pb6hrQvo4s23cEUFtj0CZkzGE3jyK3pj26RIupXXxhSrrcUA/Cn0lZgcCrGH0t6L"
        crossorigin="anonymous"></script>
```

**Patrón Alpine x-data + x-init + x-cloak a PRESERVAR** (líneas 56-97 actuales; sólo cambia el nombre del factory y el contenido de los templates):
```html
<!-- ANTES (Phase 1): -->
<div x-data="sessionScreen" x-init="init()" x-cloak>
  <template x-if="ready && !done"> <article> ... </article> </template>
  <template x-if="ready && done">  <article> ... </article> </template>
  <template x-if="!ready">         <article> ... </article> </template>
</div>
```
```html
<!-- DESPUÉS (Phase 2 — D-24): cuatro screens mutuamente exclusivas -->
<div x-data="appShell" x-init="init()" x-cloak>
  <template x-if="currentScreen === 'home'">    <article>...</article> </template>
  <template x-if="currentScreen === 'picker'">  <article>...</article> </template>
  <template x-if="currentScreen === 'session'"> <article>...</article> </template>
  <template x-if="currentScreen === 'summary'"> <article>...</article> </template>
  <!-- Confirmación inline (D-27/D-43/D-44, fuera de los 4 templates) -->
  <div x-show="confirmDialog" role="alertdialog" aria-labelledby="confirm-message">
    <p id="confirm-message" x-text="confirmDialog?.message"></p>
    <div role="group">
      <button @click="confirmDialog.onConfirm(); confirmDialog = null;" x-text="confirmDialog?.confirmLabel"></button>
      <button class="secondary" @click="confirmDialog = null" x-text="confirmDialog?.cancelLabel"></button>
    </div>
  </div>
</div>
```

**Patrón "feedback verde/rojo" del session screen a MIGRAR íntegramente al template session** (líneas 56-83 actuales, dentro del nuevo `<template x-if="currentScreen === 'session'">`). El cambio es que los nombres pasan de `feedback` / `selectOption` / `currentExercise` / `progressLabel` a `sessionFeedback` / `sessionSelectOption` / `sessionCurrentExercise` / `sessionProgressLabel` (prefijo `session*` por D-25):
```html
<!-- Phase 1 (mantener mismo patrón, solo renombrar y mover al nuevo template) -->
<div role="group">
  <template x-for="(opt, idx) in currentExercise.payload.options" :key="idx">
    <button type="button"
            @click="selectOption(idx)"
            :disabled="feedback !== null"
            :class="{
              'correcta': feedback !== null && idx === currentExercise.payload.correctIndex,
              'incorrecta': feedback === 'incorrect' && idx === selectedIndex
            }"
            x-text="opt"></button>
  </template>
</div>
```

**Nuevos sub-templates a AÑADIR** (estructura indicativa, no plantilla fija):
- **Home table** (D-29, RESEARCH.md §"Pico CSS variables"):
  ```html
  <figure>
    <table>
      <thead><tr><th>Estado</th><th>Categoría</th><th>Racha</th><th>Ejercicios</th><th>Última vez</th></tr></thead>
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
- **Banner in-flight test** (D-43, RESEARCH.md §"Patrón canónico de banner in-flight"):
  ```html
  <div x-show="state.inFlightTest" role="alert">...</div>
  ```
- **Botones grandes lado a lado** (D-32):
  ```html
  <div role="group">
    <button @click="openPicker('repaso')">Repaso 20</button>
    <button @click="openPicker('test-completo')">Test completo</button>
  </div>
  ```

**Patrón a NO romper**: `x-cloak` en el root, jamás `x-html`, `x-init="init()"` exclusivo, los 4 templates con UN solo elemento root por `<template x-if>` (Pitfall #1 de la RESEARCH).

---

### `styles.css` (STYLE) — MODIFICADO

**Analog:** `styles.css` (Phase 1, self). Mantiene `[x-cloak]`, `.correcta`, `.incorrecta`. AÑADE clases de badge, posiblemente un estilo del banner in-flight y del `confirmDialog`.

**Patrón a PRESERVAR — CSS var con fallback hex** (líneas 30-40 actuales — coherente con cómo `.correcta` ya usa `var(--pico-color-green-500, #2e7d32)`):
```css
button.correcta {
  background-color: var(--pico-color-green-500, #2e7d32);
  border-color: var(--pico-color-green-600, #1b5e20);
  color: white;
}

button.incorrecta {
  background-color: var(--pico-color-red-500, #d32f2f);
  border-color: var(--pico-color-red-600, #b71c1c);
  color: white;
}
```

**Patrón nuevo a AÑADIR — badges con el mismo idiom var+fallback** (D-30, RESEARCH.md §"Implicación crítica para D-30"):
```css
/* Badges de estado (D-30). pico.colors.min.css NO se carga; los fallbacks
   hex son la fuente de color en práctica. */
.badge-no-hecha   { color: var(--pico-muted-color, #6c757d); font-weight: 600; }
.badge-hecha      { color: var(--pico-color-green-500, #2e7d32); font-weight: 600; }
.badge-dominada   { color: var(--pico-color-amber-500, #f59e0b); font-weight: 600; }
```

**Patrón a NO añadir**: utility classes tipo Tailwind, ni vendor prefixes que Pico ya cubre, ni `@import` de hojas externas (sigue el principio "Pico classless + custom mínimo").

---

### `src/screens/app.js` (SCREEN, Alpine factory) — **NUEVO** (reemplaza a `src/screens/session.js`)

**Analog principal:** `src/screens/session.js` de Phase 1. Es el ÚNICO factory Alpine del proyecto; toda su forma (factory que recibe `appDataReady`, init async, `ready` flag, `currentExercise` getter, `selectOption`/`advance`, cancelación de `setTimeout`) se preserva y se REEMPAQUETA dentro de un objeto más grande con `currentScreen`.

**Analog secundario para data flow + máquina de estados:** `src/domain/progress.js` (el patrón de spread-clone defensivo se aplica al actualizar `state.inFlightTest`).

**Layer-purity boundary:** screen layer. PUEDE importar `domain/`, `data/`, `exercise-types/`. NO puede importar de otros archivos en `screens/` (porque no los hay) ni de `main.js`. Usa `setTimeout`/`clearTimeout` (no son DOM). NO toca `document`, `window`, `innerHTML` — la UI declarativa va en `index.html`.

**Imports pattern** (calcado del actual `src/screens/session.js` líneas 36-39, ampliado):
```js
// src/screens/app.js
import { buildSession, buildFullTest } from '../domain/session.js';
import { applySessionResult } from '../domain/progress.js';
import { todayLocal } from '../domain/dates.js';
import { loadState, saveState } from '../data/storage.js';   // loadState solo si hace falta refresh; normalmente NO
import { registry } from '../exercise-types/index.js';
```

**Factory signature pattern** (calcado de `sessionScreen(appDataReady)` líneas 62-114):
```js
/**
 * Factory de componente Alpine `appShell(appDataReady)`. D-24/D-25/D-26.
 * Patrón Promise-handoff: el factory recibe la Promise resuelta por main.js
 * tras loadContent + DOMAIN-06 boot; init() la espera antes de marcar ready.
 */
export function appShell(appDataReady) {
  return {
    // ---- referencias inyectadas (llenadas en init() tras await) ----
    content: null,
    state: null,

    // ---- bootstrap ----
    ready: false,

    // ---- navegación (D-24) ----
    currentScreen: 'home',           // 'home' | 'picker' | 'session' | 'summary'

    // ---- sub-estados (prefijos por área, D-25) ----
    pickerMode: null,                // 'repaso' | 'test-completo'
    pickerCheckedCategoryIds: [],
    sessionMode: null,
    sessionExerciseIds: [],
    sessionCursor: 0,
    sessionResults: [],
    sessionSelectedIndex: null,
    sessionFeedback: null,           // null | 'correct' | 'incorrect'
    sessionAutoAdvanceHandle: null,
    summaryDelta: null,
    summaryHeaderLabel: '',
    confirmDialog: null,             // helper único reutilizado en 3 puntos

    async init() {
      const { content, state } = await appDataReady;
      this.content = content;
      this.state = state;
      this.ready = true;
    },
    // ... métodos abajo ...
  };
}
```

**Core pattern a MIGRAR íntegramente — selectOption + advance + cancelAutoAdvance** (líneas 137-202 de `session.js`, sólo se renombra el prefijo y se enchufa al cambio de screen al terminar):
```js
sessionSelectOption(idx) {
  // T-02-02: ignora double-clicks
  if (this.sessionFeedback !== null) return;
  this.sessionSelectedIndex = idx;
  const ex = this.content.exerciseById[this.sessionExerciseIds[this.sessionCursor]];
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { index: idx });
  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: ex.id, correct });

  // Para Test completo: write inFlightTest tras cada respuesta (D-42)
  if (this.sessionMode === 'test-completo') {
    this.persistInFlightTest();
  }

  if (correct) {
    this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
  }
},

sessionAdvance() {
  this.cancelAutoAdvance();
  this.sessionCursor += 1;
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;

  if (this.sessionCursor >= this.sessionExerciseIds.length) {
    this.completeSession();   // reemplaza el "applySessionResult + saveState" inline
  }
},

cancelAutoAdvance() {
  if (this.sessionAutoAdvanceHandle !== null) {
    clearTimeout(this.sessionAutoAdvanceHandle);
    this.sessionAutoAdvanceHandle = null;
  }
},

destroy() { this.cancelAutoAdvance(); }
```

**`completeSession` — derivado de la línea 178 actual + Pattern canónico de `summaryDelta` en RESEARCH.md §"Code Examples":**
```js
completeSession() {
  const sessionResult = { answers: this.sessionResults };
  const today = todayLocal();
  // Snapshot ANTES de aplicar (deep clone — el shape es pequeño)
  const before = JSON.parse(JSON.stringify(this.state.categoryProgress ?? {}));
  const newState = applySessionResult(this.state, sessionResult, this.content, today);
  saveState(newState);
  this.state = newState;

  this.summaryDelta = computeSummaryDelta(before, newState, sessionResult, this.content);
  const correctCount = sessionResult.answers.filter(a => a.correct).length;
  this.summaryHeaderLabel = `Sesión terminada · ${correctCount}/${sessionResult.answers.length} correctos`;

  this.currentScreen = 'summary';
}
```
> `computeSummaryDelta` puede ser helper privado del módulo (no exportado) o método del objeto — discretion.

**`persistInFlightTest` — patrón nuevo derivado de la sección "Persistencia in-flight" de RESEARCH.md:**
```js
persistInFlightTest() {
  this.state = {
    ...this.state,
    inFlightTest: {
      categoryIds: this.pickerCheckedCategoryIds,
      exerciseIds: this.sessionExerciseIds,
      cursor: this.sessionCursor,
      answers: [...this.sessionResults],
      startedAt: this.state.inFlightTest?.startedAt ?? Date.now()
    }
  };
  saveState(this.state);
}
```

**Confirmación inline — patrón único reutilizado en D-27 / D-43 / D-44** (RESEARCH.md §"Confirmación inline pattern"):
```js
requestConfirm({ message, confirmLabel, cancelLabel = 'Cancelar', onConfirm }) {
  this.confirmDialog = { message, confirmLabel, cancelLabel, onConfirm };
},

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

**Patrones del session.js Phase 1 que NO se pierden (D-20, T-02-02, Pitfall #5):**
- write-once-per-session para Repaso (mismo del Phase 1: sólo cuando cursor ≥ length).
- Cancelación de `setTimeout` en `advance` y `destroy`.
- Guard `if (feedback !== null) return` para double-clicks.
- `setTimeout` 600ms para auto-advance en correct.

---

### `tests/domain.test.js` (TEST, node --test) — MODIFICADO (extendido o split)

**Analog:** `tests/domain.test.js` (Phase 1, self). Misma maquinaria (`node:test`, `node:assert/strict`, `seededLcg`). Se añaden ~14-18 tests nuevos (D-53.1 a D-53.4).

**Layer-purity boundary:** tests SOLO importan del dominio puro. NO importan de `screens/`, `main.js`, `data/storage.js` (localStorage no existe en node --test). El validator (`schema-validator.js`) y los exercise-types sí son importables.

**Imports pattern a PRESERVAR + ampliar** (líneas 14-23 actuales):
```js
// Phase 1 (mantener):
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { todayLocal } from '../src/domain/dates.js';
import { buildSession, exerciseWeight } from '../src/domain/session.js';
import { applySessionResult } from '../src/domain/progress.js';
import { validateContent } from '../src/data/schema-validator.js';
import { multipleChoice } from '../src/exercise-types/multiple-choice.js';
import { registry } from '../src/exercise-types/index.js';
import { seededLcg } from './util/seeded-rng.js';

// Phase 2 — añadir:
import { buildFullTest } from '../src/domain/session.js';
import { applyNewExerciseRegression } from '../src/domain/progress.js';
```

**Patrón describe + test a CALCAR** (líneas 29-128 actuales; estructura idéntica para los grupos nuevos):
```js
describe('domain/progress — cascada multi-cat (D-53.1)', () => {
  test('ejercicio [avere, genero] fallado tras acierto previo [avere] resetea ambas', () => {
    const content = makeContent([
      { id: 'a1', categoryIds: ['avere'] },
      { id: 'm1', categoryIds: ['avere', 'genero'] }
    ]);
    const before = blankStateV2();
    const after = applySessionResult(before, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'm1', correct: false }
      ]
    }, content, '2026-05-23');
    assert.equal(after.categoryProgress['avere'].clearedExerciseIds.length, 0);
    assert.equal(after.categoryProgress['genero'].clearedExerciseIds.length, 0);
    assert.equal(after.categoryProgress['avere'].streakDays, 0);
  });
});
```

**Patrón de inyección de `today` (D-52) — derivado de RESEARCH.md §"Testing strategy"** (DIFIERE del Phase 1, donde `applySessionResult` no recibía `today`):
```js
// Bucle de N días con strings ISO inyectados — el patrón nuevo de Phase 2.
test('21 días consecutivos sin fallar promocionan a dominada', () => {
  let state = blankStateV2();
  const content = makeContent([...]);
  for (let day = 0; day < 21; day++) {
    const isoDate = `2026-06-${String(day + 1).padStart(2, '0')}`;
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
```

**Patrón de tests parametrizados con seededLcg para sampler edges (D-53.4):**
```js
test('GUARANTEE cubre 1 ejercicio por categoría con multi-cat compartido', () => {
  const exercises = [
    { id: 'a1', categoryIds: ['avere'], payload: {} },
    { id: 'm1', categoryIds: ['avere', 'genero'], payload: {} }
  ];
  const { exerciseIds } = buildSession(
    ['avere', 'genero'], exercises, { exerciseStats: {} }, 5, 'repaso', seededLcg(42)
  );
  // m1 cubre ambas categorías; la GUARANTEE no debería elegir 2 separados.
  assert.ok(exerciseIds.length <= 2);
});
```

**Split en archivos** (RESEARCH.md §"Testing strategy" recomienda):
- `tests/domain.test.js` queda con los grupos de Phase 1 (`dates`, `schema-validator`, `exercise-types`).
- `tests/domain-progress.test.js` (nuevo) para D-53.1/.2/.3.
- `tests/domain-session.test.js` (nuevo) para D-53.4.
- Comando canónico sigue siendo `node --test tests/*.test.js` (glob, D-11, evita bug Node 22 al pasar directorio).

**Patrón a NO romper**: tests deben seguir corriendo en `node --test` puro sin instalar nada. No `node_modules`, no `package.json`, no jest. `seededLcg` se reutiliza tal cual (`tests/util/seeded-rng.js` sin cambios).

---

## Shared Patterns

### Spread-clone defensivo (pureza)
**Source:** `src/domain/progress.js` líneas 27-30 (Phase 1 actual)
**Apply to:** `src/domain/progress.js` (extendido), `src/domain/session.js` (`buildFullTest`), `applyNewExerciseRegression`
```js
const next = {
  ...state,
  exerciseStats: { ...(state.exerciseStats ?? {}) },
  categoryProgress: { ...(state.categoryProgress ?? {}) },
  dailyLog: { ...(state.dailyLog ?? {}) }
};
```
Ningún módulo del dominio muta su input. Spread superficial + spread por sub-rama tocada. Listas anidadas como `clearedExerciseIds` se clonan con `[...arr]` cuando se van a modificar.

### Patrón "CSS var con fallback hex"
**Source:** `styles.css` líneas 33-44 (Phase 1 actual)
**Apply to:** `styles.css` (badges nuevos), cualquier estilo de banner / confirmDialog
```css
color: var(--pico-color-green-500, #2e7d32);
```
Razón documentada en RESEARCH.md §"Pico CSS variables": las color shades de Pico NO están en `pico.classless.min.css`; el fallback hex es la fuente real del color. **Coherencia obligatoria** con cómo Phase 1 ya estiliza `.correcta`/`.incorrecta`.

### Patrón "factory(appDataReady)" + Promise handoff
**Source:** `src/screens/session.js` líneas 62-114 + `src/main.js` líneas 36-48 (Phase 1)
**Apply to:** `src/screens/app.js` (nuevo factory `appShell`), `src/main.js` (registro y resolución)
```js
// main.js síncrono al top-level:
let resolveAppData;
const appDataReady = new Promise((resolve) => { resolveAppData = resolve; });
document.addEventListener('alpine:init', () => {
  window.Alpine.data('appShell', () => appShell(appDataReady));
});
// bootstrap async resuelve más tarde:
resolveAppData({ content, state });
```
ESTE patrón NO se puede romper — la UAT 01-02 documentó la race condition que evita. Si cualquier plan propone mover el `addEventListener` dentro de un `async`, el verifier lo rechaza.

### Patrón "x-cloak + x-text exclusivo + un elemento root por template"
**Source:** `index.html` líneas 56-97 + comentario de seguridad líneas 52-55 (Phase 1)
**Apply to:** todos los templates Alpine nuevos del Phase 2 (home, picker, session, summary, confirmDialog)
- `x-cloak` en el root del `<div x-data>` (CSS lo oculta hasta init).
- `x-text` para CUALQUIER string del content JSON. Nunca `x-html`.
- Un solo elemento root por cada `<template x-if>` (Alpine 3.x ignora siblings extra silenciosamente — Pitfall #1 de la RESEARCH).
- `:class` y `:disabled` usados con objetos / expresiones, calcado de las opciones del session screen actual.

### Patrón "wrapper try/catch defensivo en boundary I/O"
**Source:** `src/data/storage.js` líneas 44-67 + 79-85 (Phase 1)
**Apply to:** `src/data/storage.js` (loadState/saveState siguen igual), cualquier nueva escritura de `inFlightTest`
- `localStorage.getItem`/`setItem` envueltos en try/catch que loguea a `console.warn`/`console.error` y devuelve fallback.
- `JSON.parse` envuelto con backup a `KEY + '.corrupt.' + Date.now()` antes de devolver `blankState()`.
- Mensajes en español (FOUND-04). El planner NO inventa nuevos mensajes — reusa el mismo idiom.

### Patrón "schemaVersion-based migrate(parsed) en cadena"
**Source:** `src/data/storage.js` líneas 94-109 (Phase 1)
**Apply to:** `src/data/storage.js` extendido para Phase 2
```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  if (parsed.schemaVersion === 2) return hydrateV2(parsed);
  if (parsed.schemaVersion === 1) return migrate1to2(parsed);
  console.warn('schemaVersion desconocido:', parsed.schemaVersion);
  return blankState();
}
```
La cadena es la del Phase 1, sólo se inserta una nueva rama por versión. El "desconocido → blankState defensivo" se mantiene como último branch. CADA versión nueva añade exactamente una rama nueva, NUNCA se reescribe el switch.

### Patrón "cancel pending setTimeout en advance + destroy"
**Source:** `src/screens/session.js` líneas 165-202 (Phase 1)
**Apply to:** `src/screens/app.js` (migración 1:1 del bucle session)
```js
cancelAutoAdvance() {
  if (this.sessionAutoAdvanceHandle !== null) {
    clearTimeout(this.sessionAutoAdvanceHandle);
    this.sessionAutoAdvanceHandle = null;
  }
},
destroy() { this.cancelAutoAdvance(); }
```
Anti-Pitfall #5 documentado en Phase 1. NO se pierde en el refactor — el factory `appShell` debe seguir teniendo `destroy()` y `cancelAutoAdvance()` con la misma semántica.

### Patrón "node --test + node:assert/strict + seededLcg" para tests del dominio
**Source:** `tests/domain.test.js` líneas 14-23 + `tests/util/seeded-rng.js` (Phase 1)
**Apply to:** todos los tests nuevos (`tests/domain-progress.test.js`, `tests/domain-session.test.js` o el existente extendido)
- Sin `package.json`, sin instalación. Comando: `node --test tests/*.test.js`.
- `t.mock.timers.enable({apis:['Date']})` se usa SOLO para `todayLocal` (Phase 1). El resto de tests Phase 2 inyecta `today` como string ISO al `applySessionResult` — NO mockean Date.
- `seededLcg(seed)` para cualquier test que use el sampler.

### Patrón "JSDoc + comentarios de decisión inline"
**Source:** todos los módulos Phase 1 (encabezado con "Decisiones aplicadas: D-XX" + JSDoc en cada export)
**Apply to:** todos los archivos modificados o creados en Phase 2
Cada función exportada lleva JSDoc con `@param`/`@returns`. El encabezado de archivo lista las decisiones aplicadas (D-XX), apuntando a 02-CONTEXT.md. Esta documentación inline NO es opcional — el verifier la espera.

---

## No Analog Found

No hay archivos sin analog en este phase. Todos los archivos del Phase 2 (modificados o creados) tienen un equivalente directo en Phase 1 (sea el mismo archivo en su versión Phase 1 o el `session.js` que se reemplaza por `app.js`). El "analog" para `src/screens/app.js` es `src/screens/session.js` (mismo rol de factory Alpine único, mismas reglas de pureza, mismo patrón Promise-handoff). Las estructuras nuevas (`currentScreen` switch, `confirmDialog`, banner in-flight, `summaryDelta`) son ampliaciones de patrones existentes, no patrones inéditos.

## Metadata

**Analog search scope:** `/home/vcompanyb/italian-course/src/**`, `/home/vcompanyb/italian-course/tests/**`, `/home/vcompanyb/italian-course/index.html`, `/home/vcompanyb/italian-course/styles.css`, `/home/vcompanyb/italian-course/content/categories.json`.
**Files scanned:** 12 (todo el código fuente Phase 1).
**Pattern extraction date:** 2026-05-23.
**Files read in extraction** (con líneas relevantes):
- `src/screens/session.js` (1-204, factory Alpine, selectOption/advance/cancelAutoAdvance, layer purity comments)
- `src/domain/session.js` (1-96, buildSession + exerciseWeight + Fisher-Yates)
- `src/domain/progress.js` (1-47, applySessionResult v1 + spread-clone defensivo)
- `src/data/storage.js` (1-109, loadState/saveState/migrate/blankState + try/catch boundary)
- `src/main.js` (1-130, Promise-handoff síncrono + bootstrap + renderValidationBanner)
- `src/domain/dates.js` (1-26, todayLocal con `now` inyectable)
- `src/data/content-loader.js` (1-109, fetchJson + NFC normalize + validateContent integration)
- `src/data/schema-validator.js` (1-132, validator hand-written, acumulación de errores)
- `src/exercise-types/index.js`, `src/exercise-types/multiple-choice.js` (registry pattern, sin cambios Phase 2)
- `index.html` (1-100, SRI pinning + script order + Alpine templates + x-cloak/x-text)
- `styles.css` (1-44, CSS var + fallback hex pattern)
- `tests/domain.test.js` (1-232, describe/test + node:assert/strict + mock timers)
- `tests/util/seeded-rng.js` (1-19, LCG determinista)

---

## PATTERN MAPPING COMPLETE

**Phase:** 2 — Mecánica completa de re-verificación (cascada + estados + dashboard)
**Files classified:** 9 (8 MOD/NEW + 1 DEL)
**Analogs found:** 9 / 9 (100% cobertura — todos los archivos derivan de un patrón Phase 1 establecido)

### Coverage
- Files con exact analog (self-evolution): 7 (`session.js`, `progress.js`, `storage.js`, `main.js`, `index.html`, `styles.css`, `domain.test.js`)
- Files con strong role-match analog: 1 (`src/screens/app.js` ← `src/screens/session.js`)
- Files con no analog: 0
- Files DELETED: 1 (`src/screens/session.js`, lógica migrada)

### Key Patterns Identified
- Todo el dominio sigue siendo PURO (sin DOM, sin storage, sin fetch). `applySessionResult` cambia firma pero la regla layer-purity se mantiene intacta (D-02).
- El factory Alpine único `appShell(appDataReady)` reusa íntegramente el patrón Promise-handoff de Phase 1 (`sessionScreen(appDataReady)` líneas 62-114) que la UAT 01-02 verificó como anti-race-condition.
- Migración `schemaVersion 1 → 2` extiende la cadena de `migrate(parsed)` de Phase 1 con UNA rama nueva (`migrate1to2`); el branch defensivo "desconocido → blankState" se preserva.
- Cascada fail-wins + promociones implementan el pseudocódigo canónico de RESEARCH.md §"Algoritmo applySessionResult" — preserva el spread-clone defensivo de Phase 1 y mantiene `exerciseStats` monotónico (DOMAIN-09).
- DOMAIN-06 vive en `applyNewExerciseRegression` (función exportada SEPARADA), invocada UNA SOLA VEZ en boot de `main.js`. Nunca dentro de `applySessionResult` (anti-pattern Pitfall #10).
- Confirmación inline reutiliza un único patrón (`requestConfirm({...})` + sub-template Alpine con `x-show`) en los 3 puntos D-27/D-43/D-44 (consistencia obligatoria).
- Tests Phase 2 inyectan `today` como string ISO (D-52); NO mockean `Date` globalmente. Conservan `node --test tests/*.test.js` sin instalación.
- CDN SRI pinning, `x-cloak`, `x-text` exclusivo, "un elemento root por template `x-if`" son invariantes heredados de Phase 1 que NO se tocan.

### File Created
`/home/vcompanyb/italian-course/.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-PATTERNS.md`

### Ready for Planning
Pattern mapping completo. El planner puede ahora referenciar analog patterns concretos en cada PLAN.md (cita líneas específicas de Phase 1 + las recomendaciones de cambio + las decisiones D-XX correspondientes). Los 9 archivos del scope Phase 2 quedan vinculados a 1+ analogs Phase 1 cada uno con código excerpts de 5-15 líneas extraídos.
