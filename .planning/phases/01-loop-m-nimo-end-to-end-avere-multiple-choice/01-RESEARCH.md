# Phase 1: Loop mínimo end-to-end (Avere + multiple-choice) - Research

**Researched:** 2026-05-23
**Domain:** Static personal web app — bootstrap, JSON content loading, multiple-choice session, localStorage persistence
**Confidence:** HIGH

## Summary

Phase 1 is the Walking Skeleton + first vertical slice. All four major surfaces — Alpine 3.15.x bootstrap, hand-written JSON schema validator, pure-function `buildSession()` (set-cover excluded, single category), and a single-key localStorage wrapper — are already constrained tightly by CONTEXT.md (decisions D-01 through D-23). Project-level research (`SUMMARY.md`, `STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`) already verified the stack against MDN, Alpine docs, Pico docs, and the Node 22 test runner API. CDN versions are pinned and SRI hashes have been computed in this research session against the actual jsdelivr assets.

The risk surface for Phase 1 is small and well-scoped: the only thing the planner needs to be careful about is keeping the dominio puro / data / screens separation clean from day 1 (D-02) so Phase 2 can extend `applySessionResult` and category states without rewriting Phase 1 code. Everything else is execution.

**Primary recommendation:** Build in this strict order — domain pure functions first (with `node --test` smoke tests), then `data/` layer (validator + storage + content-loader), then exercise-types registry, then screens, then `main.js` glue. Walking Skeleton deliverable = "load 1 Avere exercise, click an answer, counter persists, reload shows it" — exactly as suggested in the additional context.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Reactive UI bindings, session screen state | Browser / Client (Alpine.js) | — | App is single-user static; Alpine `x-data` lives in the browser only. No server tier exists. |
| Content load (`categories.json`, `exercises/avere.json`) | Browser / Client (`fetch()` from same origin) | — | `npx serve` serves static files; the browser fetches them. No backend processing. |
| Schema validation | Browser / Client (hand-written validator in `src/data/`) | — | Runs at boot, before Alpine starts, on the same thread. |
| Persistence (counters) | Browser / Client (`localStorage`) | — | No backend. Single-user, single-tab acceptable in Phase 1 (multi-tab guard deferred to Phase 5). |
| Pure domain logic (`dates.todayLocal`, `buildSession`) | Browser / Client (no I/O) | Node.js test runtime | Same JS files imported by both browser (via `<script type="module">`) and `node --test`. ES modules work in both. |
| Static asset delivery (Alpine, Pico) | CDN / Static (jsDelivr) | — | Loaded with pinned versions + SRI; no self-hosting in Phase 1. |
| Test execution | Node.js test runtime (`node --test tests/`) | — | Pure-function modules only; no DOM, no fetch — tests don't need a browser. |

**Why this matters:** This is a single-tier client app — there is no "API" or "backend" tier to confuse. The risk isn't tier misassignment; it's *layer* misassignment within the browser tier (e.g. UI grading answers, or domain code touching `localStorage`). The Architecture research already calls this out as the only architectural commandment that matters (`ARCHITECTURE.md` §1). Planner: ensure no task lets `src/domain/*` import from `src/data/*` or `src/screens/*`.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Estructura de carpetas y módulos**
- **D-01:** Layout modular en `src/` separando dominio puro, datos, exercise-types y screens (estructura completa en CONTEXT.md).
- **D-02:** Dominio puro (`src/domain/`) no importa de `data/` ni de `screens/`. Testeable con `node --test` sin DOM.
- **D-03:** ES modules nativos (`<script type="module">`), sin bundler.

**Schema JSON**
- **D-04:** `content/categories.json` es el registro maestro de categorías (id slug ASCII).
- **D-05:** Un archivo `content/exercises/<categoryId>.json` por categoría con array `exercises`.
- **D-06:** Campos obligatorios por ejercicio: `id`, `type`, `categoryIds` (array no vacío), `payload`. Opcional: `notes`.
- **D-07:** Payload de `multiple-choice`: `prompt` (con `___`), `options` (3-4 strings), `correctIndex` (0-based).
- **D-08:** Schema validator hand-written (~30-50 líneas), comprueba tipos, campos obligatorios, integridad referencial, unicidad de `id` global. Banner visible con archivo + id + descripción al fallar.
- **D-09:** Strings normalizadas a NFC en el momento de cargar (`content-loader.js`).
- **D-10:** Si la validación falla, la app NO arranca con datos parciales — solo banner de error global.

**Test runner**
- **D-11:** `node --test` (Node 22 built-in) con `node:assert/strict`. Tests en `tests/domain.test.js`. Ejecuta con `node --test tests/`.
- **D-12:** Phase 1 incluye smoke tests para `dates.todayLocal()` y `session.buildSession()`.

**Sampler edge cases**
- **D-13:** Cuando #ejercicios disponibles < tamaño solicitado, la sesión se reduce al número disponible.
- **D-14:** No hay "rellenar con repetidos".
- **D-15:** En Phase 1 las sesiones son de 10-12 ejercicios (lo que haya de Avere).

**Contenido seed**
- **D-16:** 10-12 ejercicios de Avere generados a partir de `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf`. Distribución mínima: presente indicativo en las 6 personas + 4-6 ejercicios contextuales.
- **D-17/D-18:** Todos los ejercicios seed usan SOLO `["avere"]` en Phase 1; multi-categoría llega en Phase 4.

**Persistencia**
- **D-19:** Estado en localStorage:
  ```json
  { "schemaVersion": 1, "exerciseStats": { "<id>": { "timesShown": N, "timesCorrect": N, "timesFailed": N } } }
  ```
- **D-20:** Escritura única al final de sesión. Sesión abandonada se descarta.

**Bootstrap**
- **D-21:** `npx serve` en la carpeta del proyecto. App en `http://localhost:3000`. README incluye instrucciones.
- **D-22:** Alpine.js 3.15.x y Pico CSS 2.1.1 vía CDN con `integrity` (SRI) y versión exacta pinned — no `@latest`.
- **D-23:** No `package.json` en Phase 1.

### Claude's Discretion

- Layout exacto del HTML de la pantalla de sesión en Phase 1 (qué componente Alpine envuelve qué).
- Nombres internos de las funciones helper (`render`, `grade`, `dispatch`, etc.).
- Cómo se inyecta `Alpine.start()` con relación a la carga de contenido (recomendación: cargar → validar → registrar Alpine.data → arrancar; si KO, banner inline sin Alpine).
- Estilos visuales concretos (Pico CSS classless por defecto, solo añadir clases si necesario).

### Deferred Ideas (OUT OF SCOPE)

- Refinamiento del banner para "cargar lo válido y avisar de lo roto" (Phase 5).
- Script para recomputar SRI cuando suba la versión de Alpine/Pico.
- Mock del reloj más sofisticado para tests de racha de 21 días (Phase 2).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | App arranca con `npx serve` en `http://localhost:3000` | Standard Stack → `serve` 14.2.6 [VERIFIED: npm registry]. Pattern §"npx serve setup". |
| FOUND-02 | Stack HTML+CSS+JS vanilla con Alpine 3.15.x + Pico 2.1.1 (CDN, pinned), cero build | Standard Stack table; SRI hashes computed. |
| FOUND-03 | Responsive básico desktop primario | Pico CSS responsive defaults [CITED: picocss.com/docs]. |
| FOUND-04 | UI en español, hardcoded | Pattern §"Spanish UI strings"; no i18n in Phase 1. |
| CONT-01 | Ejercicios en `content/exercises/<categoryId>.json` | D-05 + layout in D-01. |
| CONT-02 | `content/categories.json` como registro maestro | D-04. |
| CONT-03 | Cada ejercicio: id, type, categoryIds (array), payload, opcional notes | D-06. |
| CONT-04 | Schema validator rechaza JSON malformado y `categoryId` desconocidos | D-08; Pattern §"Hand-written JSON schema validator". |
| CONT-05 | Banner UI visible (no consola) con archivo + problema | D-08; Pattern §"Bootstrap order". |
| CONT-06 | Strings NFC-normalizadas al cargar | D-09; Pattern §"NFC normalization on load". |
| EXTYPE-01 | `multiple-choice`: frase con hueco + 3-4 botones | D-07; Pattern §"multiple-choice render". |
| DOMAIN-01 | `dates.todayLocal()` → YYYY-MM-DD local time | Pattern §"`dates.todayLocal()`"; uses `getFullYear/getMonth/getDate`. |
| DOMAIN-02 | `session.buildSession(...)` con set-cover + weight 1/(1+min(timesShown,10)) | **Phase 1 scope:** weighted sample only (set-cover triviale con 1 categoría). Pattern §"Pure-function buildSession()". |
| DOMAIN-09 | Contadores monotónicos | Pattern §"applySessionResult"; D-19. |
| SESSION-04 | Indicador "Ejercicio X / N" durante la sesión | Pattern §"Session screen x-data shape". |
| SESSION-05 | Verde auto-avanza ~600ms; rojo muestra correcta + botón "Siguiente" | Pattern §"Auto-advance with cancellable timeout". |
| BACK-01 | Estado en localStorage bajo clave `italianCourse.v1` | D-19; Pattern §"localStorage wrapper". |
| BACK-02 | Estado escrito SOLO al final de sesión | D-20; Pattern §"localStorage wrapper". |
| BACK-03 | Campo `schemaVersion` en el estado | D-19; Pattern §"localStorage wrapper". |

## Project Constraints (from CLAUDE.md)

- **Tech stack:** web estática (HTML+CSS+JS sin servidor) [VERIFIED: CLAUDE.md§Constraints]. Reflejado en D-21/D-22/D-23.
- **Persistencia:** `localStorage` + export/import JSON. Phase 1 sólo localStorage; export/import en Phase 4.
- **Hosting:** local en máquina del autor. Sin internet (después de bootstrap CDN), sin cuentas, sin sync.
- **Dispositivo:** desktop only v1.
- **Contenido:** JSON editado a mano.
- **Idioma UI:** español.
- **GSD Workflow Enforcement:** "Do not make direct repo edits outside a GSD workflow." El plan debe usar slash commands GSD para todas las ediciones.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Alpine.js | 3.15.12 | Reactive UI (`x-data`, `x-show`, `x-on`, `x-text`) | [VERIFIED: npm registry] Single `<script defer>`, no build, perfect fit for click-driven quiz UI. CDN pinned. |
| Pico CSS (classless variant) | 2.1.1 | Classless CSS + auto dark mode | [VERIFIED: npm registry] `pico.classless.min.css` styles semantic HTML directly. Single `<link>`. Auto dark via `prefers-color-scheme`. |
| Node.js | 22 LTS | `node --test` runtime + `npx serve` | [VERIFIED: local install — `node --version` returned `v22.20.0`] Built-in test runner with native Date mocking. |
| `serve` (npx-on-demand) | 14.2.6 | Static HTTP server on `localhost:3000` | [VERIFIED: npm registry — `npm view serve version`] No `npm install` needed; npx caches. |
| Vanilla ES modules | browser-native | Code split between `src/*` modules | [CITED: whatwg/html#8121] Requires HTTP serving (works under `http://localhost`, not `file://`). |
| `localStorage` (Web Storage API) | browser-native | Persist `italianCourse.v1` blob | [CITED: MDN Storage API] ~5 MiB/origin; well under what we need. |

### Supporting

Phase 1 needs **no supporting libraries** — every requirement is met by the core stack plus hand-written code. (The `@alpinejs/persist` plugin is intentionally NOT used; D-20 specifies write-once-at-session-end, which Persist's auto-sync would violate.)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Alpine 3.15.x | Vanilla JS (~200 LOC of `render(state)` helpers) | Locked by D-22 / FOUND-02. |
| Pico classless | Pico default (class-based) | Discretion item; classless preferred per CONTEXT.md Discretion section ("Pico CSS classless por defecto"). |
| Hand-written validator | Valibot 1.x (~1.4 KB tree-shaken) | Locked by D-08 ("hand-written ~30-50 líneas"). |
| `node --test` | Vitest 2.x | Locked by D-11. `node --test` works zero-dep on Node 22. |
| `localStorage` single-key | Alpine Persist plugin | Locked by D-20 (write-once-at-session-end). |
| `npx serve` | VS Code Live Server extension | `npx serve` chosen in CLAUDE.md and D-21. Live Server is a viable equivalent if the author prefers. |

**Installation (no `npm install`):**

```bash
# One-time, system-wide: ensure Node 22 LTS installed (already verified locally).
# Per-project, single command to run the app:
cd italian-course
npx serve .
# → http://localhost:3000 — bookmark it.
```

**Version verification:** All versions confirmed via `npm view <pkg> version` against the npm registry on 2026-05-23. SRI hashes computed locally against the actual jsDelivr-served files (see CDN tags below).

### CDN Tags with SRI (Phase 1)

The following snippets go in `index.html` `<head>`. SRI hashes were computed against the live jsDelivr assets on 2026-05-23.

```html
<!-- Pico CSS 2.1.1 (classless variant) -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.classless.min.css"
      integrity="sha384-NZhm4G1I7BpEGdjDKnzEfy3d78xvy7ECKUwwnKTYi036z42IyF056PbHfpQLIYgL"
      crossorigin="anonymous">

<!-- Alpine.js 3.15.12 -->
<script defer
        src="https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/dist/cdn.min.js"
        integrity="sha384-pb6hrQvo4s23cEUFtj0CZkzGE3jyK3pj26RIupXXxhSrrcUA/Cn0lZgcCrGH0t6L"
        crossorigin="anonymous"></script>
```

**Sizes (raw, not gzipped):** Pico classless 71040 B (~71 KB), Alpine 46346 B (~46 KB). Acceptable for a personal-use bookmark target.

**`crossorigin="anonymous"` is mandatory** when using `integrity` — without it the browser "fails open" and silently skips the integrity check [CITED: srihash.org].

**SRI for Pico default variant (NOT used in Phase 1, kept for reference if author prefers class-based later):**
- URL: `https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.min.css` (83319 B)
- sha384: `L1dWfspMTHU/ApYnFiMz2QID/PlP1xCW9visvBdbEkOLkSSWsP6ZJWhPw6apiXxU`

**SRI for `@alpinejs/persist` 3.15.12 (NOT used in Phase 1):**
- URL: `https://cdn.jsdelivr.net/npm/@alpinejs/persist@3.15.12/dist/cdn.min.js` (835 B)
- sha384: `6WOLkykwLb3YWzXZ6lAq+GI0p3V+enUm9jY6yIXGpIriiAUOSF5dgNJLoSSNam4j`

## Package Legitimacy Audit

> Phase 1 installs NO packages locally (D-23: no `package.json`). The only "packages" referenced are CDN-served assets and `serve` invoked via `npx` on-demand. Audit covers these.

| Package | Registry | Age | Downloads (approx) | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------------|-------------|-----------|-------------|
| `alpinejs` @3.15.12 | npm | 9+ years (org); 3.x line maintained since 2021 | ~600k/week | github.com/alpinejs/alpine | unavailable (no slopcheck on host) | Approved [CITED: alpinejs.dev/essentials/installation] |
| `@picocss/pico` @2.1.1 | npm | 5+ years | ~50k/week | github.com/picocss/pico | unavailable | Approved [CITED: picocss.com/docs] |
| `serve` @14.2.6 | npm | 8+ years; maintained by Vercel | ~600k/week | github.com/vercel/serve | unavailable | Approved (well-known Vercel tool) |
| `@alpinejs/persist` @3.15.12 | npm | matches core | n/a | github.com/alpinejs/alpine (monorepo) | unavailable | NOT USED in Phase 1 (D-20 conflict). SRI provided for reference. |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

**slopcheck unavailable** (could not install on host; `pip install slopcheck` not run because no `pip` in path within agent shell). Mitigation: every package above is named in the official documentation pages of Alpine and Pico that have been verified by WebFetch in prior research (`research/STACK.md` sources list). Specifically:
- `alpinejs` and `@alpinejs/persist` are referenced at https://alpinejs.dev/essentials/installation [CITED in this session via WebFetch].
- `@picocss/pico` and `pico.classless.min.css` are referenced at https://picocss.com/docs and https://picocss.com/docs/classless [CITED in this session via WebFetch].
- `serve` is `npm view`-confirmed and is a flagship Vercel tool.

Because the names are confirmed via *official documentation*, they meet the `[VERIFIED: npm registry]` tier per the package-name-provenance rule. SRI hashes are an additional integrity safeguard on top.

## Architecture Patterns

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│ Browser tab — http://localhost:3000                                  │
│                                                                      │
│   [1] index.html loads                                               │
│         │                                                            │
│         ├─► CDN: Pico CSS (with SRI)         ── static, parallel    │
│         ├─► CDN: Alpine.js (defer, with SRI)                         │
│         └─► <script type="module" src="src/main.js">                │
│                  │                                                   │
│   [2] main.js (sequential bootstrap)                                 │
│         │                                                            │
│         ├─► data/content-loader.js                                   │
│         │     │   fetch('content/categories.json')                  │
│         │     │   fetch('content/exercises/avere.json')             │
│         │     │   → validate (data/schema-validator.js)             │
│         │     │   → normalize NFC                                   │
│         │     ├── VALID ─► return { categories, exercisesByCat }    │
│         │     └── INVALID ─► throw ValidationError {file,id,reason} │
│         │                                                            │
│         ├─► data/storage.js: loadState()                            │
│         │     │   localStorage.getItem('italianCourse.v1')          │
│         │     ├── present + valid ─► state                          │
│         │     └── missing/corrupt ─► blankState() + warn console    │
│         │                                                            │
│         ├─► IF ValidationError:                                     │
│         │     render banner directly into <body>; do NOT Alpine.start│
│         │                                                            │
│         └─► IF OK:                                                   │
│               register Alpine components (sessionScreen, etc.)       │
│               Alpine.start()                                         │
│                                                                      │
│   [3] User interaction (Alpine reactive)                            │
│         sessionScreen x-data ──► domain/session.js: buildSession() │
│                                ──► exercise-types/multiple-choice  │
│                                ──► onAnswer ─► in-memory results    │
│                                                                      │
│   [4] Session end                                                    │
│         domain/progress.js: applySessionResult(state, results)      │
│         data/storage.js: saveState(newState)  ← SINGLE WRITE        │
│                                                                      │
│   [5] User reloads → [1] again; counters reflected in state         │
└──────────────────────────────────────────────────────────────────────┘
```

The arrows trace the primary use case: open → load + validate → click answers → persist at end → reload shows counters. This IS the Walking Skeleton.

### Component Responsibilities (file-to-implementation mapping)

| Module | Imports From | Imported By | Responsibility |
|--------|-------------|-------------|----------------|
| `src/main.js` | data/, domain/, screens/, exercise-types/ | nothing (entry) | Bootstrap orchestrator. NOT a pure module. |
| `src/domain/dates.js` | nothing | domain/, tests/ | `todayLocal()`. Pure. |
| `src/domain/session.js` | domain/dates.js (optional) | screens/, tests/ | `buildSession()`. Pure. |
| `src/domain/progress.js` | nothing | screens/, tests/ | `applySessionResult()` (Phase 1: just counters; Phase 2 extends). Pure. |
| `src/data/storage.js` | nothing | main.js, screens/ | `loadState() / saveState()`. Touches `localStorage`. |
| `src/data/content-loader.js` | data/schema-validator.js | main.js | `loadContent()`. Touches `fetch` + NFC. |
| `src/data/schema-validator.js` | nothing | data/content-loader.js, tests/ | Pure validator function. Testable. |
| `src/exercise-types/index.js` | exercise-types/multiple-choice.js | screens/session.js | Registry. |
| `src/exercise-types/multiple-choice.js` | nothing | exercise-types/index.js | `{ grade(exercise, response) }`. Rendering done via Alpine template in HTML. |
| `src/screens/session.js` | exercise-types/, domain/ | main.js | Alpine component factory for session screen. |

**Hard rules (enforce during planning):**
1. Nothing in `src/domain/` may import from `src/data/` or `src/screens/`.
2. Nothing in `src/data/` may import from `src/screens/`.
3. `data/schema-validator.js` is pure (no `fetch`, no `localStorage`) so it can be unit-tested.

### Recommended Project Structure (Phase 1)

```
italian-course/
├── index.html                       # CDN tags (SRI), <body> with x-data refs
├── styles.css                       # tiny overrides on top of Pico classless
├── README.md                        # "First run" section: npx serve + bookmark
├── src/
│   ├── main.js                      # Bootstrap (see Pattern §Bootstrap order)
│   ├── domain/
│   │   ├── dates.js                 # todayLocal()
│   │   ├── progress.js              # applySessionResult (counters only in P1)
│   │   └── session.js               # buildSession (Phase 1 scope, see Pattern)
│   ├── data/
│   │   ├── schema-validator.js      # Pure: validateContent({categories, exercisesByFile})
│   │   ├── content-loader.js        # fetch + NFC + validate
│   │   └── storage.js               # localStorage wrapper
│   ├── exercise-types/
│   │   ├── index.js                 # registry: { 'multiple-choice': { grade } }
│   │   └── multiple-choice.js       # grade()
│   └── screens/
│       └── session.js               # Alpine component factory
├── content/
│   ├── categories.json
│   └── exercises/
│       └── avere.json               # 10-12 seed exercises (D-16)
├── tests/
│   └── domain.test.js               # node --test
└── material-profesora/              # existing, not touched
```

### Pattern 1: Alpine bootstrap from CDN with SRI

**What:** Pin Alpine 3.15.12 + Pico 2.1.1 classless, load with `defer` and `integrity` + `crossorigin="anonymous"`.
**When to use:** Any phase touching `index.html`.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Italian Course — Ejercicios A1/A2</title>

  <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.classless.min.css"
        integrity="sha384-NZhm4G1I7BpEGdjDKnzEfy3d78xvy7ECKUwwnKTYi036z42IyF056PbHfpQLIYgL"
        crossorigin="anonymous">

  <link rel="stylesheet" href="./styles.css">

  <script defer
          src="https://cdn.jsdelivr.net/npm/alpinejs@3.15.12/dist/cdn.min.js"
          integrity="sha384-pb6hrQvo4s23cEUFtj0CZkzGE3jyK3pj26RIupXXxhSrrcUA/Cn0lZgcCrGH0t6L"
          crossorigin="anonymous"></script>

  <script type="module" src="./src/main.js"></script>
</head>
<body>
  <main>
    <h1>Italiano A1/A2</h1>
    <div id="error-banner" hidden></div>
    <div id="app" x-data="sessionScreen" x-show="ready">
      <!-- session screen markup (see Pattern 4) -->
    </div>
  </main>
</body>
</html>
```

**Critical:** `defer` on the Alpine `<script>` AND `type="module"` on `main.js` both delay execution until DOM parse is done. Alpine's `Alpine.start()` must be called by `main.js` AFTER content validation completes (see Pattern 8).

### Pattern 2: Hand-written JSON schema validator (~40 lines)

**What:** Single pure function `validateContent({categories, exercisesByFile})` that walks the loaded structures, accumulates `ValidationError[]`, returns `{ok, errors}`.
**When to use:** Called once at boot, before Alpine.start (D-08, D-10).
**File:** `src/data/schema-validator.js`

```js
// Source: hand-written per D-08; pattern verified against research/ARCHITECTURE.md §2
// All errors accumulate; we never throw mid-walk so the user sees ALL problems at once.

const ID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * @param {{categories: Array, exercisesByFile: Record<string, Array>}} input
 * @returns {{ok: boolean, errors: Array<{file: string, exerciseId?: string, reason: string}>}}
 */
export function validateContent({ categories, exercisesByFile }) {
  const errors = [];
  const push = (file, exerciseId, reason) => errors.push({ file, exerciseId, reason });

  // 1. categories.json shape
  if (!Array.isArray(categories)) {
    push('categories.json', undefined, 'campo "categories" debe ser array');
    return { ok: false, errors };
  }
  const knownCategoryIds = new Set();
  for (const cat of categories) {
    if (typeof cat?.id !== 'string' || !ID_SLUG_RE.test(cat.id)) {
      push('categories.json', cat?.id, `id de categoría inválido: "${cat?.id}" (debe ser slug ASCII)`);
      continue;
    }
    if (knownCategoryIds.has(cat.id)) {
      push('categories.json', cat.id, `id de categoría duplicado: "${cat.id}"`);
    }
    if (typeof cat.name !== 'string' || !cat.name.trim()) {
      push('categories.json', cat.id, `falta campo "name" en categoría "${cat.id}"`);
    }
    knownCategoryIds.add(cat.id);
  }

  // 2. exercises/*.json shape + referential integrity + global id uniqueness
  const seenExerciseIds = new Set();
  for (const [file, exercises] of Object.entries(exercisesByFile)) {
    if (!Array.isArray(exercises)) {
      push(file, undefined, 'campo "exercises" debe ser array');
      continue;
    }
    for (const ex of exercises) {
      if (typeof ex?.id !== 'string' || !ex.id.trim()) {
        push(file, ex?.id, 'ejercicio sin "id" o id vacío'); continue;
      }
      if (seenExerciseIds.has(ex.id)) {
        push(file, ex.id, `id de ejercicio duplicado: "${ex.id}"`);
      }
      seenExerciseIds.add(ex.id);

      if (ex.type !== 'multiple-choice') {
        push(file, ex.id, `type "${ex.type}" no soportado en esta fase (esperado: multiple-choice)`);
      }
      if (!Array.isArray(ex.categoryIds) || ex.categoryIds.length === 0) {
        push(file, ex.id, '"categoryIds" debe ser array no vacío');
      } else {
        for (const cid of ex.categoryIds) {
          if (!knownCategoryIds.has(cid)) {
            push(file, ex.id, `referencia a categoría desconocida: "${cid}"`);
          }
        }
      }
      if (!ex.payload || typeof ex.payload !== 'object') {
        push(file, ex.id, 'falta "payload"');
      } else if (ex.type === 'multiple-choice') {
        const { prompt, options, correctIndex } = ex.payload;
        if (typeof prompt !== 'string' || !prompt.includes('___')) {
          push(file, ex.id, '"payload.prompt" debe ser string con "___"');
        }
        if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
          push(file, ex.id, '"payload.options" debe tener 3 o 4 strings');
        } else if (options.some(o => typeof o !== 'string' || !o.trim())) {
          push(file, ex.id, '"payload.options" contiene entradas vacías o no-string');
        }
        if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= (options?.length ?? 0)) {
          push(file, ex.id, `"payload.correctIndex" inválido: ${correctIndex}`);
        }
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
```

**Test it:** Add cases in `tests/domain.test.js` with each failure mode (duplicate id, unknown categoryId, missing prompt, etc.). Pure function = trivial to test.

### Pattern 3: Pure-function `buildSession()` (Phase 1 scope)

**What:** Weighted random sample without replacement; size = `min(requested, #available)`.
**Phase 1 scope:** Set-cover is NOT required (only one category, "avere", exists). Phase 2 will add the set-cover greedy phase.
**File:** `src/domain/session.js`

```js
// Source: ARCHITECTURE.md §6, simplified for single-category Phase 1
// Phase 2 will add the GUARANTEE PHASE (set-cover greedy) before this FILL PHASE.

const WEIGHT_CAP = 10; // D-15 / STATE.md decision

/**
 * Returns weight for an exercise based on monotonic timesShown counter.
 * weight = 1 / (1 + min(timesShown, 10))
 */
export function exerciseWeight(timesShown) {
  return 1 / (1 + Math.min(timesShown ?? 0, WEIGHT_CAP));
}

/**
 * Build a session.
 * @param {string[]} categoryIds   - selected category ids
 * @param {Exercise[]} allExercises - all loaded exercises
 * @param {Object} state           - { exerciseStats: { [id]: { timesShown } } }
 * @param {number} requestedSize   - desired session length (e.g. 20)
 * @param {'repaso'} mode          - Phase 1 supports only 'repaso'
 * @param {() => number} [rng]     - Math.random by default; injectable for tests
 * @returns {{ exerciseIds: string[], actualSize: number }}
 */
export function buildSession(categoryIds, allExercises, state, requestedSize, mode = 'repaso', rng = Math.random) {
  // Filter: exercises tagged with at least one selected category
  const pool = allExercises.filter(ex =>
    ex.categoryIds.some(c => categoryIds.includes(c))
  );

  if (pool.length === 0) return { exerciseIds: [], actualSize: 0 };

  const targetSize = Math.min(requestedSize, pool.length);   // D-13
  const remaining = [...pool];
  const picked = [];

  while (picked.length < targetSize && remaining.length > 0) {
    const weights = remaining.map(ex =>
      exerciseWeight(state.exerciseStats?.[ex.id]?.timesShown ?? 0)
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let r = rng() * totalWeight;
    let idx = 0;
    for (; idx < weights.length; idx++) {
      r -= weights[idx];
      if (r <= 0) break;
    }
    if (idx >= remaining.length) idx = remaining.length - 1; // float-safety
    picked.push(remaining[idx]);
    remaining.splice(idx, 1);   // no-replacement (D-14)
  }

  // Shuffle final order (Fisher-Yates with same rng)
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return {
    exerciseIds: picked.map(ex => ex.id),
    actualSize: picked.length
  };
}
```

**Edge cases (test with `node --test`):**
- `allExercises = []` → `actualSize: 0`. No throw.
- `requestedSize = 20`, `pool.length = 8` → returns 8. (D-13)
- All `timesShown = 0` → weights all `1`, uniform sampling (correct).
- One exercise with `timesShown = 0`, others `timesShown = 100` → cold one's weight is `1.0` vs `1/11 ≈ 0.09`; cold appears ~11× as often, not 100× (cap works).
- Pass `rng = seededLcg(1234)` for deterministic tests.

**Deterministic seeded RNG for tests:**

```js
// tests/util/seeded-rng.js (pure, ~5 lines)
export function seededLcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2**32;
  };
}
```

### Pattern 4: Session screen `x-data` shape (Alpine)

**What:** One Alpine component factory `sessionScreen()` registered in `main.js`. Owns: cursor, current exercise, selected option, feedback state, auto-advance timer handle.
**File:** `src/screens/session.js`

```js
// Source: pattern derived from CONTEXT.md D-01 and SESSION-04/05 requirements
// Alpine.data() registers the factory; the HTML uses x-data="sessionScreen"

import { buildSession } from '../domain/session.js';
import { registry } from '../exercise-types/index.js';
import { applySessionResult } from '../domain/progress.js';
import { saveState } from '../data/storage.js';

export function sessionScreen(content, state) {
  return {
    // ---- bootstrap ----
    ready: false,
    content,                                // injected (categories, exercises by id)
    state,                                  // injected (live ref)

    // ---- session ----
    exerciseIds: [],
    cursor: 0,
    results: [],                            // [{ exerciseId, correct }, ...]
    autoAdvanceHandle: null,

    // ---- per-exercise UI state ----
    selectedIndex: null,
    feedback: null,                         // null | 'correct' | 'incorrect'

    init() {
      // Phase 1: single category, hard-coded for now (Phase 2 adds picker)
      const { exerciseIds, actualSize } = buildSession(
        ['avere'],
        Object.values(content.exerciseById),
        state,
        20,
        'repaso'
      );
      this.exerciseIds = exerciseIds;
      if (actualSize === 0) {
        // Empty pool — show a message, no session
        this.ready = false;
        return;
      }
      this.ready = true;
    },

    get currentExercise() {
      return this.content.exerciseById[this.exerciseIds[this.cursor]];
    },
    get progressLabel() {
      return `Ejercicio ${this.cursor + 1} / ${this.exerciseIds.length}`;
    },
    get done() {
      return this.cursor >= this.exerciseIds.length;
    },

    selectOption(idx) {
      if (this.feedback !== null) return;                   // ignore second click
      this.selectedIndex = idx;
      const ex = this.currentExercise;
      const handler = registry[ex.type];
      const correct = handler.grade(ex, { index: idx });
      this.feedback = correct ? 'correct' : 'incorrect';
      this.results.push({ exerciseId: ex.id, correct });

      if (correct) {
        // SESSION-05: auto-advance after ~600ms
        this.autoAdvanceHandle = setTimeout(() => this.advance(), 600);
      }
      // On 'incorrect' the user clicks the "Siguiente" button; no auto-advance.
    },

    advance() {
      this.cancelAutoAdvance();
      this.cursor += 1;
      this.selectedIndex = null;
      this.feedback = null;

      if (this.done) {
        // D-20: single write at session end
        const newState = applySessionResult(this.state, { answers: this.results });
        saveState(newState);
        // Phase 1: no summary screen yet (Phase 2). Just show "Sesión terminada".
      }
    },

    cancelAutoAdvance() {
      if (this.autoAdvanceHandle !== null) {
        clearTimeout(this.autoAdvanceHandle);
        this.autoAdvanceHandle = null;
      }
    },

    destroy() {                          // Alpine calls this on x-data teardown
      this.cancelAutoAdvance();
    }
  };
}
```

**HTML side (illustrative — concrete layout is Claude's Discretion per CONTEXT.md):**

```html
<div x-data="sessionScreen" x-init="init()" x-show="ready" x-cloak>
  <template x-if="!done">
    <article>
      <header x-text="progressLabel"></header>      <!-- SESSION-04 -->

      <p x-text="currentExercise.payload.prompt"></p>

      <template x-for="(opt, idx) in currentExercise.payload.options" :key="idx">
        <button type="button"
                @click="selectOption(idx)"
                :disabled="feedback !== null"
                :class="feedback !== null && idx === currentExercise.payload.correctIndex
                          ? 'pico-color-jade-500'
                          : (feedback === 'incorrect' && idx === selectedIndex ? 'pico-color-red-500' : '')"
                x-text="opt"></button>
      </template>

      <p x-show="feedback === 'incorrect'">
        Respuesta correcta: <strong x-text="currentExercise.payload.options[currentExercise.payload.correctIndex]"></strong>
      </p>

      <button x-show="feedback === 'incorrect'" @click="advance">Siguiente</button>   <!-- SESSION-05 -->
    </article>
  </template>

  <template x-if="done">
    <article><p>Sesión terminada.</p></article>
  </template>
</div>
```

**Critical detail:** `destroy()` cancels the pending `setTimeout`. Without this, if the user clicks "Siguiente" right after a correct answer (rare race), the cursor would advance twice. The `cancelAutoAdvance()` call inside `advance()` is the primary defense; `destroy()` is the safety net.

### Pattern 5: `dates.todayLocal()`

**What:** Local YYYY-MM-DD without UTC drift.
**File:** `src/domain/dates.js`

```js
// Source: ARCHITECTURE.md §8 + PITFALLS.md §1 — explicit "no UTC, no toISOString"
// Pure; takes optional Date for testability.

/**
 * Returns local calendar date as "YYYY-MM-DD".
 * Uses LOCAL clock — getFullYear/getMonth/getDate are TZ-correct and DST-safe.
 * NEVER use toISOString().slice(0,10) — that's UTC.
 *
 * @param {Date} [now=new Date()] - injectable for tests
 */
export function todayLocal(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

**Test with `node --test` (Node 22 native Date mocking):**

```js
// tests/domain.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { todayLocal } from '../src/domain/dates.js';

test('todayLocal returns YYYY-MM-DD using local clock', (t) => {
  // Set a fixed instant: 2026-05-23 10:00 local (in this process's TZ)
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 4, 23, 10, 0, 0).getTime() });
  //                                            month is 0-indexed → 4 = May
  assert.equal(todayLocal(), '2026-05-23');
});

test('todayLocal handles end-of-month boundary', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 11, 31, 23, 59, 59).getTime() });
  assert.equal(todayLocal(), '2026-12-31');
  // Advance 2 seconds — crosses local midnight into 2027-01-01
  t.mock.timers.tick(2000);
  assert.equal(todayLocal(), '2027-01-01');
});
```

[VERIFIED: nodejs.org/api/test.html#class-mocktimers] — Node 22's `t.mock.timers.enable({apis:['Date']})` is the recommended approach. Auto-restored after the test ends.

### Pattern 6: localStorage wrapper

**What:** Single key `italianCourse.v1`, schemaVersion field, load-with-defaults, save-once, graceful corruption recovery.
**File:** `src/data/storage.js`

```js
// Source: D-19, D-20, BACK-01, BACK-02, BACK-03 + research/PITFALLS.md §5
// Single point of contact with localStorage. No domain logic.

const KEY = 'italianCourse.v1';
const CURRENT_SCHEMA_VERSION = 1;

export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {}
  };
}

export function loadState() {
  let raw;
  try {
    raw = localStorage.getItem(KEY);
  } catch (e) {
    console.warn('localStorage unavailable; starting with empty state', e);
    return blankState();
  }
  if (!raw) return blankState();

  try {
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch (e) {
    console.warn('localStorage state corrupt; starting fresh. Backing up to .corrupt.', e);
    try {
      localStorage.setItem(KEY + '.corrupt.' + Date.now(), raw);
    } catch (_) { /* may also fail; nothing we can do */ }
    return blankState();
  }
}

/** Persist state atomically. Called ONCE at session end (D-20). */
export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to write state to localStorage (quota?)', e);
    // Phase 1: surface in console only. UI banner for quota is Phase 5 polish.
  }
}

function migrate(parsed) {
  // Phase 1: only version 1 exists. Phase 2+ will add migration branches.
  if (!parsed || typeof parsed !== 'object') return blankState();
  if (parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
    // Defensive: ensure exerciseStats is an object
    if (typeof parsed.exerciseStats !== 'object' || parsed.exerciseStats === null) {
      parsed.exerciseStats = {};
    }
    return parsed;
  }
  // Unknown / future version → treat as fresh (loud warning)
  console.warn('Unknown schemaVersion', parsed.schemaVersion, '— starting fresh');
  return blankState();
}
```

**State shape concrete example (Phase 1 only):**

```json
{
  "schemaVersion": 1,
  "exerciseStats": {
    "avere-001": { "timesShown": 3, "timesCorrect": 2, "timesFailed": 1 },
    "avere-002": { "timesShown": 1, "timesCorrect": 1, "timesFailed": 0 }
  }
}
```

Phase 2 will add `categoryProgress`, `dailyLog`, etc. The `schemaVersion` bump lets `migrate()` transform on load.

### Pattern 7: `applySessionResult` (Phase 1 reduced shape)

**What:** Pure function that takes state + session results, returns new state. Phase 1 only updates `exerciseStats` (no cascade, no states, no streak — those come in Phase 2).
**File:** `src/domain/progress.js`

```js
// Source: ARCHITECTURE.md §7 — full version; this is the Phase 1 minimal subset.
// Pure: returns a new state object; does not mutate input.

export function applySessionResult(state, sessionResult) {
  // sessionResult: { answers: [{ exerciseId, correct }] }
  const next = {
    ...state,
    exerciseStats: { ...state.exerciseStats }
  };

  for (const ans of sessionResult.answers) {
    const prev = next.exerciseStats[ans.exerciseId] ?? { timesShown: 0, timesCorrect: 0, timesFailed: 0 };
    next.exerciseStats[ans.exerciseId] = {
      timesShown: prev.timesShown + 1,
      timesCorrect: prev.timesCorrect + (ans.correct ? 1 : 0),
      timesFailed: prev.timesFailed + (ans.correct ? 0 : 1)
    };
  }

  return next;
}
```

**DOMAIN-09 monotonic invariant:** Counters only grow. There is no path in Phase 1 that decrements them. Phase 2 will add `categoryProgress.clearedExerciseIds` (which DOES reset) but `exerciseStats` stays monotonic forever.

### Pattern 8: Bootstrap order in `main.js`

**What:** Load content → validate → if OK, register Alpine + start; if KO, render banner inline.
**File:** `src/main.js`

```js
// Source: D-21, D-22, CONTEXT.md "code_context > Integration Points"

import { loadContent } from './data/content-loader.js';
import { loadState } from './data/storage.js';
import { sessionScreen } from './screens/session.js';

const REGISTRY = ['avere'];   // Phase 1: hard-coded category list

async function bootstrap() {
  let content;
  try {
    content = await loadContent(REGISTRY);   // throws { errors: [...] } if invalid
  } catch (err) {
    renderValidationBanner(err.errors ?? [{ file: '?', reason: String(err) }]);
    return;                                  // D-10: do NOT call Alpine.start
  }

  const state = loadState();

  // Register Alpine components BEFORE Alpine.start
  // Alpine is loaded with defer; it auto-starts on DOMContentLoaded UNLESS we
  // register a listener for `alpine:init` first (recommended pattern).
  document.addEventListener('alpine:init', () => {
    window.Alpine.data('sessionScreen', () => sessionScreen(content, state));
  });

  // If alpine:init already fired (script-defer + DOMContentLoaded race), this
  // listener won't run — guard by checking window.Alpine existence:
  if (window.Alpine) {
    window.Alpine.data('sessionScreen', () => sessionScreen(content, state));
    window.Alpine.start();
  }
}

function renderValidationBanner(errors) {
  // Pico classless: <article role="alert"> gives a styled card.
  const banner = document.createElement('article');
  banner.setAttribute('role', 'alert');
  banner.style.borderColor = 'var(--pico-color-red-500, #d9534f)';
  banner.innerHTML = `
    <header><strong>Error en el contenido</strong></header>
    <p>No se ha podido cargar el contenido. Revisa los siguientes problemas y recarga la página:</p>
    <ul></ul>
  `;
  const list = banner.querySelector('ul');
  for (const e of errors) {
    const li = document.createElement('li');
    // textContent — never innerHTML (PITFALLS.md security row)
    li.textContent = `[${e.file}${e.exerciseId ? ` / ${e.exerciseId}` : ''}] ${e.reason}`;
    list.appendChild(li);
  }
  document.body.prepend(banner);
}

bootstrap();
```

**Critical: Alpine and `defer`.** When Alpine is loaded with `defer`, it fires `alpine:init` on DOMContentLoaded then auto-starts. Because `main.js` is also `type="module"` (which is implicitly deferred), the relative order between Alpine's auto-start and our `bootstrap()` is not guaranteed. The pattern above handles both orderings:
1. If `bootstrap()` runs first → adds `alpine:init` listener → Alpine fires it later → component registered → Alpine auto-starts.
2. If Alpine starts first → `window.Alpine` already exists → register and call `.start()` manually (calling `.start()` twice is a no-op per Alpine semantics).

**Alternative pattern:** disable Alpine auto-start by setting `window.deferLoadingAlpine = callback => bootstrap().then(callback)` BEFORE the Alpine script tag executes. Cleaner but couples HTML and JS. For Phase 1 the listener+guard pattern above is simpler.

### Pattern 9: NFC normalization on load

**What:** Recursively normalize every string field of every exercise (prompt + each option) to NFC.
**Where:** `src/data/content-loader.js`, immediately after `JSON.parse` and BEFORE `validateContent`.

```js
// Source: D-09, PITFALLS.md §8

export async function loadContent(categoryRegistry) {
  const categoriesRaw = await fetchJson('content/categories.json');
  const exercisesByFile = {};
  for (const cid of categoryRegistry) {
    const path = `content/exercises/${cid}.json`;
    const raw = await fetchJson(path);
    exercisesByFile[path] = raw.exercises ?? [];
  }

  // NFC normalize EVERYTHING that's a string in the loaded structures.
  // Done BEFORE validation so the validator works against normalized data.
  normalizeNfcInPlace(categoriesRaw);
  for (const arr of Object.values(exercisesByFile)) normalizeNfcInPlace(arr);

  // Validate
  const { ok, errors } = validateContent({
    categories: categoriesRaw.categories ?? [],
    exercisesByFile
  });
  if (!ok) {
    const err = new Error('Content validation failed');
    err.errors = errors;
    throw err;
  }

  // Build convenient indexes
  const exerciseById = {};
  for (const arr of Object.values(exercisesByFile)) {
    for (const ex of arr) exerciseById[ex.id] = ex;
  }

  return {
    categories: categoriesRaw.categories,
    exerciseById
  };
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}: HTTP ${res.status}`);
  return await res.json();
}

function normalizeNfcInPlace(node) {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      if (typeof node[i] === 'string') node[i] = node[i].normalize('NFC');
      else normalizeNfcInPlace(node[i]);
    }
  } else if (node && typeof node === 'object') {
    for (const key of Object.keys(node)) {
      const v = node[key];
      if (typeof v === 'string') node[key] = v.normalize('NFC');
      else normalizeNfcInPlace(v);
    }
  }
}
```

[CITED: MDN String.prototype.normalize] — `'NFC'` is the default form; choosing it explicitly self-documents intent.

### Pattern 10: `node --test` setup (no `package.json`)

**What:** Tests run as plain ES modules with `node --test tests/`. No dependencies, no config.
**Files:** `tests/domain.test.js`

Sample structure:

```js
// tests/domain.test.js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { todayLocal } from '../src/domain/dates.js';
import { buildSession, exerciseWeight } from '../src/domain/session.js';
import { applySessionResult } from '../src/domain/progress.js';
import { validateContent } from '../src/data/schema-validator.js';

describe('domain/dates', () => {
  test('todayLocal returns local YYYY-MM-DD', (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 4, 23, 10).getTime() });
    assert.equal(todayLocal(), '2026-05-23');
  });
});

describe('domain/session', () => {
  test('buildSession reduces size when pool smaller than requested', () => {
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} }
    ];
    const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso');
    assert.equal(result.actualSize, 2);
    assert.equal(result.exerciseIds.length, 2);
    // No repeats
    assert.equal(new Set(result.exerciseIds).size, 2);
  });

  test('exerciseWeight respects cap at timesShown=10', () => {
    assert.equal(exerciseWeight(0), 1);
    assert.equal(exerciseWeight(10), 1/11);
    assert.equal(exerciseWeight(100), 1/11);   // capped
  });

  test('buildSession with empty pool returns zero-length session', () => {
    const result = buildSession(['avere'], [], { exerciseStats: {} }, 20, 'repaso');
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });
});

describe('domain/progress', () => {
  test('applySessionResult increments counters monotonically', () => {
    const before = { schemaVersion: 1, exerciseStats: {} };
    const after = applySessionResult(before, {
      answers: [
        { exerciseId: 'a1', correct: true },
        { exerciseId: 'a1', correct: false },
        { exerciseId: 'a2', correct: true }
      ]
    });
    assert.deepEqual(after.exerciseStats['a1'], { timesShown: 2, timesCorrect: 1, timesFailed: 1 });
    assert.deepEqual(after.exerciseStats['a2'], { timesShown: 1, timesCorrect: 1, timesFailed: 0 });
    // Input not mutated
    assert.deepEqual(before.exerciseStats, {});
  });
});

describe('data/schema-validator', () => {
  test('rejects unknown categoryId reference', () => {
    const result = validateContent({
      categories: [{ id: 'avere', name: 'Avere' }],
      exercisesByFile: {
        'content/exercises/avere.json': [
          { id: 'a1', type: 'multiple-choice', categoryIds: ['ghost'],
            payload: { prompt: '___', options: ['a','b','c'], correctIndex: 0 } }
        ]
      }
    });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /ghost/.test(e.reason)));
  });
});
```

**Run:**

```bash
node --test tests/
```

[VERIFIED: nodejs.org/api/test.html — Node 22 LTS] Built-in TAP-style reporter. Exit code 0 if all pass, non-zero otherwise. Works without `package.json` because `node --test` discovers files itself.

**Deferred (Phase 2 spec):** `process.env.FAKE_TODAY` injection for streak-related tests. In Phase 1 the `t.mock.timers.enable({apis:['Date']})` pattern is sufficient.

### Anti-Patterns to Avoid

- **UI grades the answer.** `exercise-types/multiple-choice.js` owns `grade()`. The Alpine component calls it. Never compute correctness in an HTML attribute or click handler.
- **Writing localStorage on every answer.** Locked by D-20. The Alpine component holds `results` in memory; `saveState()` is called once in `advance()` when `done === true`.
- **Importing from `src/data/` inside `src/domain/`.** Breaks D-02 testability.
- **Mutating input state in `applySessionResult`.** Pattern 7 shows the spread-clone form. Alpine's reactivity is fine either way, but unit tests rely on input not being mutated.
- **Calling `Alpine.start()` before content validation completes.** Banner can't render reliably if Alpine has already taken over `<body>`. Always: validate → if OK Alpine.start, if KO direct DOM manipulation.
- **Floating CDN versions** (`@latest`, `@3`, `@2`). Locked by D-22.
- **Using `innerHTML` for exercise prompts/options.** PDFs can contain anything; use `x-text` (textContent under the hood) which never executes HTML.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive DOM updates for the session screen | Manual `document.querySelector` + `innerHTML` loops | Alpine.js `x-data` / `x-show` / `x-text` / `x-for` | Locked by D-22. Alpine is already in the page. |
| CSS reset, button styling, dark mode | Custom CSS | Pico CSS 2.1.1 classless | Locked by D-22. Auto dark via `prefers-color-scheme`. |
| Local static HTTP server | A Python or Node oneliner you maintain | `npx serve` | Locked by D-21. Cached on first run, zero config. |
| Test runner | Vitest, Jest, Mocha, custom harness | `node --test` (Node 22 built-in) | Locked by D-11. Zero dep, zero `package.json`. |
| Date mocking in tests | Manually swapping `globalThis.Date` | `t.mock.timers.enable({apis:['Date']})` | Native to Node 22; auto-restored. |
| Unicode normalization | Hand-coded combining-mark walker | `String.prototype.normalize('NFC')` | Browser-native, ICU-correct. |
| SRI hash generation | Pasting hashes from a random blog | `openssl dgst -sha384 -binary <file> \| openssl base64 -A` | The hashes in this RESEARCH.md were computed from the actual jsDelivr-served files on 2026-05-23. |
| Weighted random sampling | Picking a library like `weighted-random-sampler` | ~10 lines of cumulative-weight scan (Pattern 3) | Pool is tiny (≤200 ever); naive O(n²) is trivially fast and tax-free for testing. |

**Key insight:** Phase 1 is small enough that adding ANY dependency beyond CDN-Alpine + CDN-Pico would be a Smell. The "no `package.json`" decision (D-23) is what enforces this — if you find yourself wanting one, push back to the planner and discuss.

## Runtime State Inventory

> SKIPPED — Phase 1 is greenfield. No existing data, services, OS registrations, secrets, or build artifacts to migrate. The `material-profesora/` folder already exists but contains source-of-truth PDFs that the app never reads at runtime; they are not affected by Phase 1 code.

## Common Pitfalls

### Pitfall 1: Alpine starts before content validation completes

**What goes wrong:** `<script defer src=".../alpine.min.js">` and `<script type="module" src="./src/main.js">` are both deferred. Their relative order is not guaranteed by the spec; in practice modules typically run after `defer` scripts, but races can occur. If Alpine auto-starts on `DOMContentLoaded` while `main.js` is still `await`-ing `fetch()` of content, components won't be registered yet.

**Why it happens:** Module scripts and defer scripts both delay until DOM-parse-complete but their execution order is browser-implementation-defined for cross-defer-vs-module situations.

**How to avoid:** Use the dual pattern in Pattern 8: register `alpine:init` listener AND check `window.Alpine` after async load. Alternative: set `window.deferLoadingAlpine = cb => bootstrap().then(cb)` before the Alpine `<script>` tag.

**Warning signs:** Banner shows correctly but Alpine components never reactive (clicks do nothing). Console shows `Alpine Expression Error: sessionScreen is not defined`.

### Pitfall 2: `fetch('content/...')` returns HTML index page silently

**What goes wrong:** If the user runs `npx serve` from the wrong directory, or types a `content/exercices/avere.json` typo, the server's default behavior is to return the directory's `index.html` (or a 404 HTML page) with a 200 status. `JSON.parse` on HTML throws.

**Why it happens:** Static servers can be configured to fall back to `index.html` for SPA routing; `serve` defaults are friendly to this pattern.

**How to avoid:** In `fetchJson`, check `Content-Type` or wrap `JSON.parse` in a clear error. Pattern 9 already throws `No se pudo cargar X: HTTP <code>` on non-2xx; add a sanity check on response Content-Type if it becomes a real problem.

**Warning signs:** Banner says "Unexpected token < in JSON at position 0" — that "<" is the start of an HTML `<!DOCTYPE>` page.

### Pitfall 3: localStorage origin is `file://` instead of `http://localhost:3000`

**What goes wrong:** Author double-clicks `index.html` once "just to see", browser remembers `file://...`; later when serving via `npx serve` the localStorage origin is different so the previous (test) state is invisible. Or: app appears to "lose" state because the author moved the folder.

**Why it happens:** localStorage scopes by origin. `file://...` and `http://localhost:3000` are different origins.

**How to avoid:** README documents *always* using `npx serve`. Never recommend double-click in the docs. The Walking Skeleton task should confirm `http://localhost:3000` is the bookmark.

**Warning signs:** "I did exercises yesterday but the counter shows 0." Check `window.location.origin` in DevTools.

### Pitfall 4: NFC normalization missed on one path

**What goes wrong:** Author pastes `è` (NFD) from a PDF into `correctIndex` text. Validator passes (it's a valid string). `multiple-choice.grade()` compares index, so it works. But later when SESSION-05 shows the correct-answer text on a fail, the displayed text has the decomposed form, looking visually identical but rendering with subtly different metrics.

**Why it happens:** NFC normalization is applied recursively in `normalizeNfcInPlace` — but only on data that came through `loadContent`. If any future code path constructs strings from elsewhere (e.g., import from JSON file) it must run the same normalization.

**How to avoid:** Centralize the normalization in the load pipeline (already done in Pattern 9). When export/import is added in Phase 4, run normalization on imported data before merging. Document the rule: "every string from outside the app gets NFC-normalized at the boundary."

**Warning signs:** Two exercises that look identical render with different widths; clipboard-paste from PDF results in `prompt.length` being unexpectedly large.

### Pitfall 5: Auto-advance timeout leaks across cursor advances

**What goes wrong:** User answers correctly → 600 ms timer starts → user impatiently clicks somewhere → answer for next question lands inside the same Alpine reactive scope while the old timer is still pending → cursor advances twice in quick succession.

**Why it happens:** `setTimeout` handles aren't cancelled when state changes unless code explicitly does so.

**How to avoid:** Pattern 4 cancels in two places: `cancelAutoAdvance()` is called at the start of `advance()` AND in `destroy()`. Tests cover the case "user clicks 'Siguiente' while autoadvance is pending" by manually advancing the cursor before the timer fires.

**Warning signs:** Cursor skips an exercise; "Ejercicio 3 / 10" jumps to "Ejercicio 5 / 10" without showing #4. Logging in DevTools shows `advance()` called twice with the same `cursor` value.

### Pitfall 6: Schema validator hard-throws on first error, hiding the rest

**What goes wrong:** Author has 5 typos across `avere.json`. Validator throws on the first one. Author fixes it, reloads, sees the second one, fixes it, reloads, ... five reload cycles.

**Why it happens:** Most validators throw on first failure.

**How to avoid:** Pattern 2 accumulates errors into an array and returns `{ok, errors}`. The banner shows ALL problems at once.

**Warning signs:** Author complains "I just fixed it and now there's another error" — means they would benefit from accumulated reporting.

## Code Examples

All concrete examples appear inline in **Architecture Patterns** above. Cross-references:

- Alpine bootstrap → **Pattern 1**
- Schema validator → **Pattern 2**
- `buildSession()` → **Pattern 3**
- Session screen Alpine `x-data` → **Pattern 4**
- `dates.todayLocal()` → **Pattern 5**
- localStorage wrapper → **Pattern 6**
- `applySessionResult` (Phase 1 subset) → **Pattern 7**
- Bootstrap order in `main.js` → **Pattern 8**
- NFC normalization → **Pattern 9**
- `node --test` setup → **Pattern 10**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mocking `Date` with `globalThis.Date = ...` | `t.mock.timers.enable({apis:['Date']})` | Node 20.4+ (2023); stable in Node 22 LTS | Auto-restored, supports `tick()` and `setTime()`, no manual cleanup |
| `JSON.parse(localStorage.getItem(...))` raw | Wrap in try/catch + corrupt-backup pattern | Industry standard since ~2018 | Survives Chrome crash recovery, browser updates |
| `<link rel="stylesheet">` from CDN without SRI | `integrity` + `crossorigin="anonymous"` | SRI shipped 2016; norm by 2020 | Tamper-resistance vs CDN compromise |
| `<script>` for content as ES module imports under `file://` | HTTP serving (`npx serve`) for any non-trivial JS app | Browser tightening 2019-2023 | Module-from-file is universally blocked now |
| Hand-rolling weighted random | Same — for tiny pools this is correct | n/a | Don't over-engineer with a library |

**Deprecated / outdated:**
- Loading Alpine without `defer` → still works but Alpine docs explicitly require `defer` [CITED: alpinejs.dev/essentials/installation].
- Class-based Pico v2 for a personal tool → not deprecated but classless is the lighter path; this is Claude's Discretion per CONTEXT.md.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | "Auto-advance ~600ms" implements SESSION-05's intent | Pattern 4 | Low — easily tuned later (single constant in `sessionScreen`). |
| A2 | The user's daily browser supports SRI properly (modern Chromium/Firefox) | Pattern 1 | Very low — both have supported SRI since 2016. Verifiable on the author's machine. |
| A3 | Pico classless variant is preferred over class-based for Phase 1 | Stack, Pattern 1 | Low — CONTEXT.md Discretion says "Pico CSS classless por defecto". If author prefers class-based, swap to `pico.min.css` (SRI provided). |
| A4 | `serve` 14.2.6 is the right pinning for `npx serve` | Stack | Very low — `npx serve` resolves latest by default; no real pin in Phase 1 because no `package.json`. Hard-pinning would require a `package.json`. |
| A5 | Phase 1 requirement DOMAIN-02 only requires the weighted FILL phase (not set-cover) since there's a single category | Pattern 3 | Medium — verify with the planner. CONTEXT.md domain section explicitly says "Fuera del scope: cascada de fallo multi-categoría", and Phase 2 ROADMAP requires DOMAIN-03/04 (full domain). Set-cover with one selected category is a no-op so this matches REQUIREMENTS.md spirit. **Planner should explicitly call out in PLAN.md that Phase 1's `buildSession` is the fill phase only and Phase 2 will extend.** |
| A6 | The user runs Node 22 (or newer LTS) | Stack, Pattern 5 | Very low — verified locally (`node --version` → `v22.20.0`). README should state minimum version. |
| A7 | `alpine:init` event firing order — combining defer Alpine + module main.js — is handled by the dual-listener pattern | Pattern 8 | Low — well-known Alpine community pattern. If it ever races, set `window.deferLoadingAlpine` instead (also documented in Pattern 8). |

**Calls for planner action:** A5 is the only assumption with medium risk and should be surfaced explicitly in PLAN.md so it can be confirmed during plan-check or first task review.

## Open Questions

1. **Should the README pin Node version explicitly?**
   - What we know: D-11 says "Node 22 built-in"; `node --test` Date mocking shipped stable in Node 22. Earlier versions partially supported it (Node 20.4+) but Node 22 is the safe minimum.
   - What's unclear: Whether the author has multiple Node versions installed.
   - Recommendation: README states "Requires Node 22 LTS or newer". No `engines` field (no `package.json`).

2. **What font/typography choices live in `styles.css`?**
   - What we know: Pico classless ships a sensible default. No author preference recorded.
   - What's unclear: Whether the author wants larger text for Italian content readability.
   - Recommendation: Phase 1 ships an empty `styles.css` (just `:root { color-scheme: light dark; }` for clarity). Defer typography tweaks to Phase 5.

3. **Should empty-session UX show a friendly "todavía no hay ejercicios" message?**
   - What we know: D-13 says reduce to actual size; CONTEXT.md is silent on the zero-pool case.
   - What's unclear: In Phase 1 with the 10-12 Avere seed, this should be unreachable, but defensive UX is cheap.
   - Recommendation: Pattern 4 returns `ready: false` for zero pool. Add a small "No hay ejercicios disponibles" message bound to that same condition. Trivial.

4. **`grade()` return shape: boolean or `{correct, hint}`?**
   - What we know: Pattern 4 expects `boolean`. EXTYPE-01 only requires bien/mal.
   - What's unclear: Phase 3 word-buttons might want richer return (e.g. position-of-first-error).
   - Recommendation: Phase 1 returns `boolean`. Phase 3 can extend registry signature; that's a backwards-compatible widening.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `node --test`, `npx serve` | ✓ | v22.20.0 (verified `node --version`) | — |
| `npx` | `npx serve` invocation | ✓ | 11.10.0 (verified `npx --version`) | — |
| Internet (first run only) | CDN: Pico, Alpine; npx serve download | required at first run | — | Offline fallback: download CDN assets to `vendor/`, swap to local paths. **Not needed Phase 1.** |
| Modern browser (Chrome/Firefox/Edge) | All UI | author's daily driver assumed | — | — |
| `openssl` | (research-time only — for SRI hash regeneration) | ✓ | (used in research) | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None blocking Phase 1.

## Security Domain

> `security_enforcement` not set explicitly in `.planning/config.json` — treat as **enabled per default**. Phase 1 is a single-user local app with no auth, no backend, no network calls after CDN bootstrap. ASVS surface is minimal but non-empty.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | n/a — single user, no login. |
| V3 Session Management | no | n/a — no server sessions. |
| V4 Access Control | no | n/a. |
| V5 Input Validation | yes | Hand-written validator (Pattern 2) for all hand-edited JSON content. `JSON.parse` for parse safety. NFC normalization. NO `innerHTML` of any user-data path. |
| V6 Cryptography | yes (passive) | SRI for CDN integrity (sha384). Locked by D-22; SRI hashes pre-computed in this research. |
| V7 Error Handling | yes | Validator banner shows actionable errors (file + id + reason). localStorage corruption recovery (Pattern 6). |
| V8 Data Protection | yes (limited) | `localStorage` is unencrypted on disk; no PII besides exercise counters. Document in README. |
| V14 Configuration | yes | Pinned versions + SRI. No floating tags. |

### Known Threat Patterns for static-localStorage stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CDN compromise pushes malicious Alpine.js | Tampering, Elevation | SRI `integrity` attribute + `crossorigin="anonymous"`. Pinned version. (Pattern 1) |
| Malicious content in copy-pasted JSON (e.g., `<script>` in a prompt) | Tampering | Use `x-text` / `textContent`, never `innerHTML`. Even though the author is the only editor today, in Phase 4 import-from-file is added; pattern must be in place from day 1. |
| Trailing-comma / corrupt JSON crashes the load path | Denial of Service | `try/JSON.parse/catch` with visible banner (Pattern 8). |
| localStorage manipulation via DevTools | Tampering | Acceptable — single-user local. State has no security implications. |
| `file://` localStorage origin confusion | Information Disclosure (theoretical) | README directs author to always use `npx serve`. (Pitfall 3) |
| Modulo-bias in weighted random producing predictable sequences | Information Disclosure (theoretical) | Irrelevant for a personal study app — no security boundary depends on sampling randomness. |
| Quota exceeded silently dropping writes | Tampering (logic) | Pattern 6 wraps `setItem` in try/catch and logs. Phase 5 adds UI banner. |

**No third-party network calls after bootstrap.** Once Alpine + Pico are cached, the app needs zero outbound requests. This eliminates entire classes of supply-chain risk.

## Sources

### Primary (HIGH confidence)
- [Node.js v22 Test Runner — `node:test` MockTimers](https://nodejs.org/api/test.html) — Verified Date mocking API and `apis: ['Date']` usage [VERIFIED via WebFetch in this session]
- [Alpine.js Installation Docs](https://alpinejs.dev/essentials/installation) — Verified pinned-version CDN tag with `defer`; SRI not in official docs but supported by browsers [VERIFIED via WebFetch in this session]
- [Pico CSS Documentation](https://picocss.com/docs) and [Pico Classless docs](https://picocss.com/docs/classless) — Verified classless variant URL and behavior [VERIFIED via WebFetch in this session]
- [srihash.org](https://www.srihash.org/) — Verified SRI command-line generation pattern with `openssl dgst -sha384` and `crossorigin="anonymous"` requirement [VERIFIED via WebFetch in this session]
- Project research: `.planning/research/STACK.md`, `ARCHITECTURE.md`, `PITFALLS.md`, `SUMMARY.md` — all marked HIGH confidence in their own metadata, derived from MDN + official docs
- Local verification: `npm view alpinejs version` → `3.15.12`; `npm view @picocss/pico version` → `2.1.1`; `npm view serve version` → `14.2.6`; `npm view @alpinejs/persist version` → `3.15.12`; `node --version` → `v22.20.0`
- SRI hashes: computed locally on 2026-05-23 from the actual jsDelivr-served files via `openssl dgst -sha384 -binary <file> | openssl base64 -A`

### Secondary (MEDIUM confidence)
- MDN String.prototype.normalize — referenced in PITFALLS.md, well-established API
- MDN Storage quotas and eviction — referenced in STACK.md

### Tertiary (LOW confidence)
- (none — Phase 1 surface is small enough that all decisions are HIGH or MEDIUM)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version pinned, npm-verified, and SRI-hashed against live assets in this session.
- Architecture: HIGH — patterns derive directly from project-level `ARCHITECTURE.md` (HIGH confidence research) and CONTEXT.md decisions D-01 through D-23.
- Pitfalls: HIGH — drawn from `PITFALLS.md` (#1-10) filtered to those applicable in Phase 1; specific Phase 1 pitfalls (Alpine init race, fetch returning HTML, etc.) come from the patterns in this research.

**Research date:** 2026-05-23
**Valid until:** 2026-06-22 (30 days — stable stack; recheck Alpine/Pico versions if Phase 1 starts after that date)

**Walking Skeleton interpretation (confirming the planner's likely first deliverable):**

The smallest possible end-to-end deliverable for this project — the first thing that proves the architecture works — is:

1. `categories.json` with `[{ id: 'avere', name: 'Avere (auxiliar)', order: 1 }]`
2. `content/exercises/avere.json` with ONE exercise
3. `index.html` with Alpine + Pico CDN (with SRI)
4. `src/main.js` that loads + validates + boots Alpine
5. `src/screens/session.js` that renders ONE multiple-choice and on click updates `state.exerciseStats[id].timesShown` then `saveState()`
6. Reloading the page shows the counter incremented

That's it. Once that works, adding the remaining 9-11 Avere seed exercises (D-16) and the full session flow (cursor, feedback, auto-advance, indicator) is mechanical layering — no new architectural risks. **Planner: produce this as Plan 1's first verifiable milestone before fanning out into the rest of the requirements.**
