---
phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
plan: 02
subsystem: session-screen
tags:
  - alpine.js
  - session-screen
  - feedback-ui
  - localStorage
  - write-once
  - pure-component
  - x-text-only
  - alpine-race-fix
  - script-ordering
  - async-bootstrap

# Dependency graph
requires:
  - "Plan 01 — loadContent, loadState, saveState, buildSession, applySessionResult, registry, exerciseById"
  - "Plan 01 window.__appBoot handoff contract (now optional — kept as diagnostic)"
provides:
  - "Alpine component factory `sessionScreen(appDataReady)` (src/screens/session.js)"
  - "Markup HTML para la pantalla de sesión con feedback verde/rojo (index.html)"
  - "Bootstrap async con Promise handoff (main.js → sessionScreen) — robusto contra script ordering races"
  - "Estilos mínimos en styles.css: [x-cloak] + .correcta/.incorrecta"
  - "Auto-advance 600ms cancelable en respuesta correcta (Pitfall #5 mitigation)"
  - "Persistencia única al final de sesión (D-20 materializada en código)"
  - "Patrón de inicialización Alpine sin race condition (factory registrado síncrono ANTES de defer; contenido async vía Promise)"
affects:
  - "Phase 2 (extiende sessionScreen para integrar picker/summary, añade home.js)"
  - "Phase 3 (añade word-buttons/match handlers — sessionScreen ya delega via registry)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Component factory devuelve objeto Alpine data — NO toca DOM directamente (Alpine se encarga via x-text/x-show/x-for)"
    - "setTimeout/clearTimeout pareados — handle guardado en estado, cancelado en advance() y destroy()"
    - "Script ordering pattern: main.js (module) ANTES de Alpine (defer) en <head>; module body corre primero y registra `alpine:init` listener síncrono antes de que Alpine cargue"
    - "Promise-based async bootstrap handoff: factory recibe Promise<{content,state}>; init() la await antes de buildSession; mientras tanto Alpine ya montó el componente con ready:false (template no-ready visible momentáneamente)"
    - "Class binding object syntax (:class={...}) para feedback verde/rojo simultáneo"
    - "Template x-if mutuamente exclusivos (ready+!done | ready+done | !ready) en lugar de un solo template con muchos x-show"
    - "Boot fail mode: si la carga JSON falla, la Promise NUNCA resuelve → init() queda en await indefinido → ready:false → banner DOM síncrono es el único output (D-10 all-or-nothing)"

key-files:
  created:
    - "src/screens/session.js"
  modified:
    - "src/main.js"
    - "index.html"
    - "styles.css"
    - ".planning/STATE.md"
    - ".planning/ROADMAP.md"
    - ".planning/REQUIREMENTS.md"

key-decisions:
  - "sessionScreen() devuelve un objeto Alpine puro: no importa nada de fuera de src/ excepto setTimeout/clearTimeout (que son globals, no DOM). Esto garantiza que un futuro test con jsdom o smoke en Node con stubs de Alpine no necesita mocks de fetch/document."
  - "El placeholder `<div id=\"app-placeholder\">` se REMUEVE en main.js antes de que Alpine procese el árbol, en lugar de coexistir con el x-data. Razón: evita un flash visual de 'Cargando…' apareciendo a la vez que la sesión arranca, y mantiene el DOM en un estado limpio para Alpine."
  - "El feedback rojo aplica DOS clases simultáneamente: `.correcta` sobre el botón correcto (verde) + `.incorrecta` sobre el botón clicado (rojo). La especificación SESSION-05 dice 'simultáneamente'; el class-object binding lo hace en una sola expresión."
  - "El estado `feedback` es un string discriminator ('correct' | 'incorrect' | null) en lugar de un boolean. Razón: el HTML necesita diferenciar 'incorrecta' (mostrar respuesta + Siguiente) de 'correcta' (auto-avance silencioso) — un boolean perdería esa información."
  - "`window.__appBoot` se mantiene como handoff diagnóstico (T-02-05 'accept') — útil en DevTools para inspeccionar `content.exerciseById` y `state.exerciseStats` durante debugging."
  - "POST-CHECKPOINT FIX (decision): abandonar el patrón dual `alpine:init + window.Alpine guard` y reemplazarlo por (a) ordering físico de scripts (main.js antes que Alpine en el HTML) + (b) factory async con Promise handoff. Razón: el patrón dual original asumía que `addEventListener('alpine:init', ...)` se podía hacer después de `await loadContent` y aún seguir a tiempo; en la práctica Alpine emite el evento antes de que el await complete. Mover la registración al top-level síncrono del módulo es la única forma robusta de garantizar orden de ejecución sin tocar el orden de eventos de Alpine."
  - "El factory ahora acepta una Promise (`appDataReady`) en lugar de `(content, state)` directos. Razón: Alpine monta el componente síncronamente cuando evalúa `x-data`; si el factory recibiera referencias todavía-no-cargadas, init() necesitaría chequearlas y volver a engancharse. La Promise es la abstracción natural: el componente arranca, espera (template !ready visible), y se rehidrata cuando el contenido llega."

# Metrics
duration: ~22 min (Tasks 1+2 ~6 min; checkpoint diagnostic + race-fix iteration ~10 min; UAT 8/8 + finalize ~6 min)
completed: "2026-05-23"
---

# Phase 1 Plan 02: Session Screen Alpine — Walking Skeleton Complete

**End-to-end loop verified by user. La app arranca con `npx serve`, carga 10-12 ejercicios de Avere, responde clicks con feedback verde/rojo (verde auto-avanza 600ms, rojo requiere "Siguiente"), persiste contadores UNA sola vez al final, y al recargar refleja los contadores. 8/8 verificaciones manuales aprobadas. 14/14 tests del dominio siguen verdes.**

## Status

- ✅ **Task 1** — `src/screens/session.js` factory + `src/main.js` Alpine registration + `styles.css` extension. Committed at `a6a37ef`.
- ✅ **Task 2** — `index.html` markup with 3 conditional templates + feedback bindings. Committed at `5cdecda`.
- ✅ **Task 3** — `checkpoint:human-verify` **APPROVED** by user after Alpine race-condition fix landed. 8/8 verification steps passed.

## Performance

- **Started:** 2026-05-23
- **Tasks 1+2 implementation:** ~6 min
- **Post-checkpoint diagnostic + race-condition fix:** ~10 min (2 fix commits)
- **User UAT:** all 8 verifications passed
- **Total:** ~22 min

## Accomplishments

### `src/screens/session.js` (new, ~205 LOC including comments)

Alpine component factory `sessionScreen(appDataReady)` — note the signature changed during the post-checkpoint fix from `(content, state)` to a single `Promise<{content,state}>` argument. Returns a reactive object with:

| Field / method | Shape | Purpose |
|---|---|---|
| `content` | object \| null | Filled by `init()` after awaiting `appDataReady`. |
| `state` | object \| null | Same. |
| `ready` | boolean | True after `init()` resolves with a non-empty pool. |
| `exerciseIds` | string[] | IDs in session order (from `buildSession`). |
| `cursor` | number | 0-based index of current exercise. |
| `results` | Array<{exerciseId, correct}> | Accumulator for `applySessionResult` at session end. |
| `autoAdvanceHandle` | number\|null | setTimeout handle so we can cancel (pitfall #5). |
| `selectedIndex` | number\|null | Which option the user clicked (for `.incorrecta` highlight). |
| `feedback` | 'correct' \| 'incorrect' \| null | Discriminator for feedback UI. |
| `init()` | async () => void | Awaits `appDataReady`, then calls `buildSession(['avere'], ...)`; sets `ready`. |
| `currentExercise` | getter → Exercise | Resolves cursor → exercise object. |
| `progressLabel` | getter → string | "Ejercicio X / N" (SESSION-04). |
| `done` | getter → boolean | `cursor >= exerciseIds.length`. |
| `selectOption(idx)` | (number) => void | Grades via registry, sets feedback, schedules auto-advance on correct. |
| `advance()` | () => void | Cancels timer, increments cursor; on done → applySessionResult + saveState. |
| `cancelAutoAdvance()` | () => void | Idempotent timer kill. |
| `destroy()` | () => void | Alpine teardown hook → cancelAutoAdvance. |

**Purity invariants (verified by grep):**
- No `document.*` / `window.*` / `innerHTML` outside comments — Alpine handles all DOM via directives.
- Imports limited to `../domain/session.js`, `../domain/progress.js`, `../data/storage.js`, `../exercise-types/index.js`. No fetch, no localStorage direct calls, no DOM API.
- Only `setTimeout`/`clearTimeout` are reached for global APIs — required for the cancelable auto-advance.

### `src/main.js` (extended; substantially refactored in post-checkpoint fix)

Three responsibilities after the final iteration:

1. **Synchronous top-level Alpine registration** — `document.addEventListener('alpine:init', ...)` is called at the module body's top level (before any `await`). Since this `<script type="module">` is declared BEFORE Alpine's `<script defer>` in `index.html`, the module body executes first and registers the listener before Alpine emits `alpine:init`.
2. **Promise-based async data handoff** — A module-scoped `appDataReady` Promise is created at top-level and exposed to the factory closure via `Alpine.data('sessionScreen', () => sessionScreen(appDataReady))`. The `bootstrap()` async function resolves the Promise once `loadContent` + `loadState` complete.
3. **Validation banner via direct DOM API (unchanged)** — On boot failure, `renderValidationBanner` builds the banner with `createElement` + `textContent` (no `innerHTML`). The promise is intentionally left UNRESOLVED in error path → `sessionScreen.init()` stays in `await` forever → `ready` stays false → only the banner is visible (D-10 all-or-nothing).

`window.__appBoot` is retained as a diagnostic handoff (T-02-05 disposition: accept).

### `index.html` (extended; script ordering changed in post-checkpoint fix)

Two structural changes:

1. **Script ordering** — `<script type="module" src="./src/main.js">` is declared BEFORE the Alpine `<script defer>` in `<head>`. Per HTML spec, module scripts and defer scripts execute in document order. This guarantees `main.js`'s top-level `addEventListener('alpine:init', ...)` runs before Alpine emits the event.
2. **Alpine markup unchanged from Task 2** — A single `<div x-data="sessionScreen" x-init="init()" x-cloak>` container with three mutually-exclusive `<template x-if>` branches:
   - **`ready && !done`** — Active session: `<header x-text="progressLabel">` + `<p x-text="currentExercise.payload.prompt">` + `<div role="group">` with `<template x-for>` rendering option buttons. Each button:
     - `@click="selectOption(idx)"`
     - `:disabled="feedback !== null"` (T-02-02 mitigation)
     - `:class` object binding for `.correcta` / `.incorrecta`
     - `x-text="opt"` (NEVER `x-html`)
     - After incorrect: `<p>Respuesta correcta: <strong x-text="...">...</strong></p>` + `<button @click="advance">Siguiente</button>`, both gated on `feedback === 'incorrect'`.
   - **`ready && done`** — `<article><p>Sesión terminada. Recarga la página para empezar otra.</p></article>` (Phase 2 will replace with proper summary).
   - **`!ready`** — Defensive fallback ("No hay ejercicios disponibles"). Visible briefly during initial paint while `init()` awaits `appDataReady`; unreachable in steady state with the Phase 1 seed of 12 exercises.

CDN tags + SRI hashes intact from Plan 01 (verified: 2 `integrity="sha384-` occurrences).

### `styles.css` (extended)

Three rules appended after the `:root { color-scheme: light dark }` block:

```css
[x-cloak] { display: none !important; }
button.correcta { background-color: var(--pico-color-green-500, #2e7d32); ... }
button.incorrecta { background-color: var(--pico-color-red-500, #d32f2f); ... }
```

Pico CSS vars are used with hex fallbacks so the colors are correct even if the CDN fails to load.

## Task Commits (atomic)

| # | Task | Hash | Files |
|---|------|------|-------|
| 1 | sessionScreen factory + main.js registration + styles.css feedback classes | `a6a37ef` | src/screens/session.js (new), src/main.js, styles.css |
| 2 | index.html Alpine markup with three templates | `5cdecda` | index.html |
| — | Partial SUMMARY pre-checkpoint | `e9fd750` | .planning/phases/01-…/01-02-SUMMARY.md |
| — | **Race-fix attempt #1** — `window.deferLoadingAlpine` hook (insufficient) | `6a27d2c` | index.html, src/main.js |
| — | **Race-fix attempt #2 (final)** — script ordering + sync listener + async Promise handoff | `ac46d70` | index.html, src/main.js, src/screens/session.js |

## Post-Checkpoint Fix — Alpine Initialization Race Condition

During the user's first attempt at Task 3 verification, the page rendered as expected up to the `<h1>` but the session UI was blank. DevTools console reported:

```
Alpine Expression Error: init is not defined
Alpine Expression Error: ready is not defined
```

Diagnosis: Alpine evaluated `x-data="sessionScreen"` as a bare expression because the factory was registered via `Alpine.data('sessionScreen', ...)` only AFTER `await loadContent(...)` completed inside `bootstrap()`. By that time Alpine's defer script had already fired `alpine:init`, scanned the DOM, found no registered `sessionScreen` factory, and bailed.

### Fix attempt #1 — `window.deferLoadingAlpine` (commit `6a27d2c`)

Used Alpine's official `deferLoadingAlpine` hook: a synchronous inline `<script>` in `<head>` exposed `window.__resolveAppReady`; `main.js` resolved it after registering the listener. **Did not work reliably** — the inline script ran before Alpine's defer script loaded, but the hook semantics in Alpine 3.15 do not actually wait on a user-controlled promise the way the docs implied. Errors persisted.

### Fix attempt #2 — script ordering + sync listener + Promise handoff (commit `ac46d70`, final)

Three composing changes:

1. **`index.html`** — Move `<script type="module" src="./src/main.js">` BEFORE Alpine's `<script defer>` in `<head>`. The HTML spec guarantees that module scripts and defer scripts execute in document order, so the module body runs first.
2. **`src/main.js`** — Move `document.addEventListener('alpine:init', ...)` to the SYNCHRONOUS top-level of the module body (before any `await`). The factory closure captures a module-scoped `appDataReady` Promise that `bootstrap()` resolves when `loadContent` completes. The brittle dual `if (window.Alpine) { ... start() }` block was removed.
3. **`src/screens/session.js`** — Factory signature changed from `(content, state)` to `(appDataReady: Promise)`. `init()` is now `async` and awaits the promise before calling `buildSession`. While awaiting, the component stays in `ready: false` and the HTML's `!ready` template ("No hay ejercicios disponibles") shows briefly (~10-100ms typical, indistinguishable from FOUC).

The fix is structurally sound because it does not race-condition the registration: HTML script ordering + module top-level execution semantics are deterministic.

**Tests still pass:** `node --test tests/*.test.js` → 14/14 verde after the fix (no domain regression).

## UAT Results — All 8 Manual Verifications Passed

User executed the 8-step checklist on 2026-05-23 after fix `ac46d70` and reported "approved":

| # | Verification | Result |
|---|---|---|
| 1 | Boot silencioso — Pico + Alpine + JSONs cargan 200, sin errores en consola, "Ejercicio 1 / N" visible | ✅ |
| 2 | Respuesta correcta + auto-avance 600ms — botón verde, demás disabled, sin "Siguiente" | ✅ |
| 3 | Respuesta incorrecta + Siguiente — rojo + verde simultáneos, texto correcta, botón "Siguiente" funciona | ✅ |
| 4 | Persistencia al final — `italianCourse.v1` NO existe durante la sesión, aparece SOLO al terminar | ✅ |
| 5 | Recarga refleja contadores — `italianCourse.v1` conserva counters tras Ctrl+R | ✅ |
| 6 | Sesión abandonada se descarta — cerrar pestaña tras 2-3 ejercicios deja localStorage limpio (D-20) | ✅ |
| 7 | Banner de error — romper `correctIndex` en avere.json muestra banner rojo en español, no la UI normal | ✅ |
| 8 | `node --test tests/*.test.js` → 14/14 verde | ✅ |

## Verification (final automated gates)

```
=== Security gates ===
grep -E "x-html=|innerHTML" index.html              → CLEAN
grep -E "(document\.|window\.|innerHTML)" src/screens/session.js (non-comments)
                                                    → CLEAN (no DOM API)

=== Structural gates ===
grep -c 'x-data="sessionScreen"' index.html         → 1
grep -c 'integrity="sha384-' index.html             → 2
grep -c 'x-text' index.html                         → 5
grep -c "alpine:init" src/main.js                   → 1 (sync top-level listener)
grep "setTimeout" src/screens/session.js            → present
grep "clearTimeout" src/screens/session.js          → present

=== Test regression ===
node --test tests/*.test.js                          → 14 pass / 0 fail
```

## Deviations from Plan

### Tasks 1+2

**None.** The plan was executed exactly as written.

The placeholder strategy ("remove vs. add x-cloak") deviates from the plan-of-record only in that we picked one of the two alternatives the plan explicitly offered ("Alternativamente añadirle `x-cloak`"). Removing is cleaner: avoids an empty-but-cloaked node lingering in the DOM. This is within "Claude's Discretion" per CONTEXT.md.

### Post-checkpoint Alpine race fix [Rule 1 — Bug]

**Found during:** Task 3 user UAT (Verification 1 failed initially — page rendered but session UI was blank).

**Issue:** The dual-pattern Alpine registration prescribed in `01-RESEARCH.md` Pattern 8 (`alpine:init` listener + `window.Alpine` guard) was registered AFTER `await loadContent(...)`. Alpine's defer script had already fired `alpine:init` and scanned the DOM by the time the listener attached, so the `sessionScreen` factory was never registered. The `<div x-data="sessionScreen">` evaluated as a bare expression → "init is not defined" / "ready is not defined" errors.

**Fix:** Replace dual pattern with three composing changes (see "Post-Checkpoint Fix" section above):
1. Script ordering: `main.js` before Alpine in `<head>`.
2. Synchronous top-level `addEventListener('alpine:init', ...)` in `main.js`.
3. Factory signature change to accept a Promise; `init()` becomes async.

**Files modified:** `index.html`, `src/main.js`, `src/screens/session.js`.

**Commits:** `6a27d2c` (first attempt, insufficient), `ac46d70` (final fix).

**Why Rule 1 (not Rule 4):** No new architectural surface — same files, same responsibilities. The fix corrected a bootstrap correctness bug. Module/defer execution semantics are stable HTML/JS spec.

**Implication for `01-RESEARCH.md` Pattern 8:** That research pattern (dual listener + guard) is unreliable when the module body has top-level awaits. Future plans should reference THIS plan's approach (script ordering + sync listener + Promise) when wiring Alpine factories after async data loads. Recommend updating `01-RESEARCH.md` in a small follow-up, but not blocking on it for phase verification.

## Phase 1 Coverage — All 19 Requirements Touched

This plan + Plan 01-01 collectively materialize all 19 requirements assigned to Phase 1:

| Req | Where materialized | Verified by |
|---|---|---|
| FOUND-01 | `index.html` + README (`npx serve`) | UAT 1 |
| FOUND-02 | `index.html` (Alpine CDN + Pico CDN, SRI pinned) | UAT 1 + grep gate |
| FOUND-03 | Pico classless (no horizontal scroll on desktop sizes) | UAT visual |
| FOUND-04 | All UI strings in Spanish (`<h1>Italiano A1/A2</h1>`, "Siguiente", "Respuesta correcta:", "Sesión terminada", "Cargando…", "No hay ejercicios disponibles") | UAT visual |
| CONT-01 | `content/exercises/avere.json` exists (Plan 01) | Plan 01-01 SUMMARY |
| CONT-02 | `content/categories.json` exists (Plan 01) | Plan 01-01 SUMMARY |
| CONT-03 | `avere.json` ejercicios tienen `{id, type, categoryIds, payload}` | Schema validator (Plan 01) |
| CONT-04 | `src/data/schema-validator.js` se ejecuta en `loadContent` (Plan 01) | UAT 7 (banner test) |
| CONT-05 | `renderValidationBanner` en `src/main.js` | UAT 7 |
| CONT-06 | `normalizeNFC` aplicado en content-loader (Plan 01) | Plan 01-01 SUMMARY |
| EXTYPE-01 | `src/exercise-types/multiple-choice.js` (Plan 01) + `selectOption` (Plan 02) | UAT 2 + UAT 3 |
| DOMAIN-01 | `src/domain/dates.js` (Plan 01) | tests/domain.test.js |
| DOMAIN-02 | `src/domain/session.js` `buildSession` (Plan 01) | tests/domain.test.js |
| DOMAIN-09 | `src/domain/progress.js` `applySessionResult` solo incrementa, nunca resetea (Plan 01) | tests/domain.test.js |
| SESSION-04 | `progressLabel` getter en `sessionScreen` | UAT 2 ("Ejercicio 1 / N → 2 / N") |
| SESSION-05 | `selectOption` schedules timeout en `correct`; no en `incorrect` | UAT 2 + UAT 3 |
| BACK-01 | `saveState`/`loadState` en `src/data/storage.js` con clave `italianCourse.v1` (Plan 01) | UAT 4 + UAT 5 |
| BACK-02 | `advance()` solo llama `saveState` cuando `done === true` (D-20) | UAT 4 (key NO aparece hasta el final) |
| BACK-03 | `schemaVersion: 1` en el state inicial (Plan 01 `storage.js`) | UAT 4 (parseado muestra `schemaVersion: 1`) |

The verifier agent will run a fresh end-to-end check against these.

## Handoff to Phase 2

Phase 2 needs to:
1. Extend `applySessionResult` with `categoryProgress` map (state per category: `no-hecha`/`hecha`/`dominada`, racha, lastSuccessDate, clearedExerciseIds).
2. Implement cascade: failing an exercise that tags N categories resets all N to `no-hecha`.
3. Add `src/screens/home.js` (category dashboard), `src/screens/picker.js` (checkboxes), `src/screens/summary.js` (post-session screen with delta).
4. Bump `schemaVersion` to 2; add migration branch in `storage.js`.

The modular structure established in Phase 1 (`src/screens/`, `src/domain/`, `src/data/`, `src/exercise-types/`) supports these extensions without rewriting. `sessionScreen` already delegates grading to `registry[type]`, so adding `word-buttons` and `match` in Phase 3 only requires new handlers — no changes to `sessionScreen`.

## Self-Check: PASSED

Files exist:
- `src/screens/session.js` ✓
- `src/main.js` (modified) ✓
- `index.html` (modified) ✓
- `styles.css` (modified) ✓

Commits exist (verified via `git log --oneline`):
- `a6a37ef` — Task 1 ✓
- `5cdecda` — Task 2 ✓
- `e9fd750` — partial SUMMARY ✓
- `6a27d2c` — race-fix attempt #1 ✓
- `ac46d70` — race-fix attempt #2 (final) ✓

Automated gates pass (security, structural, test regression). Manual UAT gate (Task 3 / 8 steps) approved by user.

---
*Phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice*
*Plan: 02 — Walking Skeleton end-to-end completion*
*Status: COMPLETE — handed off to verifier agent*
