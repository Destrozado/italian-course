---
phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
plan: 01
subsystem: foundation
tags:
  - alpine.js
  - pico-css
  - es-modules
  - localStorage
  - node-test
  - sri
  - nfc
  - schema-validation

# Dependency graph
requires: []
provides:
  - "Bootstrap HTML with CDN-pinned Alpine 3.15.12 + Pico CSS 2.1.1 (SRI verified)"
  - "Pure-domain modules: dates.todayLocal, session.buildSession + exerciseWeight, progress.applySessionResult"
  - "Hand-written schema validator accumulating all errors in a single pass (Spanish messages)"
  - "content-loader with NFC normalization at the boundary + validation"
  - "localStorage wrapper keyed `italianCourse.v1` with schemaVersion + defensive corruption recovery"
  - "exercise-types registry seeded with multiple-choice handler"
  - "main.js bootstrap orchestrator exposing `window.__appBoot` for Plan 02"
  - "12 seed exercises of Avere covering presente indicativo (6 persons) + 4 passato prossimo + 2 idiomatic 'avere fame/caldo'"
  - "node --test smoke suite with 14 tests across 6 suites"
affects:
  - "01-02 (Plan 02 wires Alpine.start + sessionScreen onto __appBoot)"
  - "Phase 2 (extends applySessionResult with cascade/streak, adds categoryProgress, bumps schemaVersion)"
  - "Phase 3 (adds word-buttons/match handlers to exercise-types registry)"
  - "Phase 4 (adds 5 more category JSONs + multi-categoryIds exercises; backup export/import)"

# Tech tracking
tech-stack:
  added:
    - "Alpine.js 3.15.12 (CDN via jsDelivr + SRI sha384-pb6hrQvo4s23cEUFtj0CZkzGE3jyK3pj26RIupXXxhSrrcUA/Cn0lZgcCrGH0t6L)"
    - "Pico CSS 2.1.1 classless (CDN via jsDelivr + SRI sha384-NZhm4G1I7BpEGdjDKnzEfy3d78xvy7ECKUwwnKTYi036z42IyF056PbHfpQLIYgL)"
    - "Native browser ES modules (`<script type=\"module\">`)"
    - "Node 22 LTS `node --test` runner with `node:assert/strict` and `t.mock.timers.enable({apis:['Date']})`"
  patterns:
    - "Strict layer separation: `src/domain/*` and `src/data/schema-validator.js` never import from data/ or screens/ — pure, importable by Node test runner without DOM"
    - "Registry pattern for exercise-types — each type exports `{ grade(exercise, response) → boolean }`; index.js owns the lookup map"
    - "Boundary NFC normalization: every string from outside the app is normalized in `content-loader.js` BEFORE validation/use"
    - "All-or-nothing boot (D-10): on validation failure, banner via direct DOM (createElement + textContent), no Alpine.start"
    - "Write-once-at-session-end (D-20) — storage wrapper exposes saveState; main.js never auto-persists"
    - "Hand-written validator accumulates ALL errors in single pass (no throw mid-walk) — author sees every typo at once"
    - "Spanish UI strings hardcoded (FOUND-04); English code identifiers everywhere else"

key-files:
  created:
    - "index.html"
    - "styles.css"
    - "README.md"
    - "src/main.js"
    - "src/domain/dates.js"
    - "src/domain/session.js"
    - "src/domain/progress.js"
    - "src/data/schema-validator.js"
    - "src/data/content-loader.js"
    - "src/data/storage.js"
    - "src/exercise-types/index.js"
    - "src/exercise-types/multiple-choice.js"
    - "content/categories.json"
    - "content/exercises/avere.json"
    - "tests/domain.test.js"
    - "tests/util/seeded-rng.js"
  modified: []

key-decisions:
  - "Materialized layer-purity contract (D-02): grep confirms `src/domain/*` and `src/data/schema-validator.js` contain zero `localStorage|fetch|document|window` references."
  - "Phase 1 `buildSession` is FILL-only (weighted random); GUARANTEE phase (set-cover greedy) deferred to Phase 2 per RESEARCH.md assumption A5 — there's only one category in Phase 1, so set-cover is a no-op."
  - "`applySessionResult` is the Phase 1 reduced subset: ONLY touches `exerciseStats`. Cascade and category states arrive in Phase 2 (DOMAIN-04..08)."
  - "Storage shape is `{ schemaVersion: 1, exerciseStats: {} }`; Phase 2 will bump schemaVersion and `migrate()` will add a new branch."
  - "`main.js` in Plan 01 does NOT call `Alpine.start()` — it exposes `window.__appBoot = { content, state, ready: true }`. Plan 02 owns Alpine wiring."
  - "Avere seed = 12 exercises (max of the 10–12 range): 6 presente indicativo (one per person) + 2 idiomatic 'avere fame/caldo' + 4 passato prossimo with avere auxiliary derived from PDF §3 (transitivos, comunicación, actividad física, cognitivos). All `categoryIds: [\"avere\"]` only (D-17)."
  - "Test runner invocation in README: `node --test tests/*.test.js` instead of `node --test tests/` — Node 22 tries to resolve trailing `tests/` as a module path and fails; the glob form is portable across versions. Verified locally with v22.20.0."

patterns-established:
  - "Pure domain modules (`src/domain/*`) — testable by `node --test` with no DOM/storage/fetch; future phases extend the same files."
  - "Validator returns `{ok, errors[]}` and accumulates — never throws mid-walk. Banner renderer reads `errors[]` and renders each via textContent."
  - "ES-module-everywhere — no bundler, no package.json; `<script type=\"module\">` + relative `./` imports."
  - "Defensive localStorage recovery — corrupt JSON backed up to `italianCourse.v1.corrupt.<timestamp>` and `blankState()` returned, never blocks boot."
  - "CDN-pinned versions + SRI integrity — never floating tags; new Alpine/Pico version requires recomputing sha384."

requirements-completed:
  - FOUND-01
  - FOUND-02
  - FOUND-03
  - FOUND-04
  - CONT-01
  - CONT-02
  - CONT-03
  - CONT-04
  - CONT-05
  - CONT-06
  - EXTYPE-01
  - DOMAIN-01
  - DOMAIN-02
  - DOMAIN-09
  - BACK-01
  - BACK-02
  - BACK-03

# Metrics
duration: ~14 min
completed: 2026-05-23
---

# Phase 1 Plan 01: Foundation Summary

**Walking Skeleton complete — Alpine 3.15.12 + Pico 2.1.1 (CDN+SRI), pure domain modules with 14-test node --test suite, hand-written schema validator with NFC normalization, localStorage wrapper keyed `italianCourse.v1`, and 12 Avere seed exercises ready for Plan 02 to wire the UI.**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-05-23T14:32:30Z (approx)
- **Completed:** 2026-05-23T14:46:11Z
- **Tasks:** 3 atomic commits
- **Files created:** 16 (1,190 total LOC including JSON and tests)

## Accomplishments

- Pure-domain layer (`src/domain/*`) with the three functions Plan 02 + Phase 2 will consume: `todayLocal`, `buildSession`/`exerciseWeight`, `applySessionResult`. Zero DOM/storage/fetch imports.
- Hand-written validator (~130 LOC) that accumulates ALL errors in a single pass with Spanish messages — author edits JSON and sees every typo at once instead of cycling through reloads.
- Content loader normalizes every string to NFC at the boundary BEFORE validation, then exposes `exerciseById` indexed for fast lookup.
- localStorage wrapper bound to single key `italianCourse.v1`, with defensive corrupt-backup and a `migrate()` hook ready for Phase 2's schema bump.
- `index.html` with **both SRI hashes pinned exactly as in RESEARCH.md** (verified manually via `curl` of the live jsDelivr assets — they match byte-for-byte).
- 12 Avere exercises derived from `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf`: 6 covering presente indicativo (io ho / tu hai / lui-lei ha / noi abbiamo / voi avete / loro hanno) per D-16, plus 2 idiomatic constructions (`avere fame`, `avere caldo`) plus 4 passato prossimo examples directly from the PDF §3 verb categories (mangiare/parlare/dormire/capire).
- `tests/domain.test.js`: 14 tests across 6 suites — all pass with `node --test tests/*.test.js`.
- README in Spanish (FOUND-04) explaining `npx serve` + bookmark, requirements (Node 22 LTS, no `npm install`), and the file:// pitfalls that make double-click unworkable.

## Task Commits

Each task was committed atomically:

1. **Task 1: Pure domain functions + validator + tests** — `997388c` (feat)
2. **Task 2: Data layer (storage + content-loader + NFC) and exercise-types registry** — `9fbb947` (feat)
3. **Task 3: HTML/CSS bootstrap + main.js + Avere seed + README** — `4aca6a1` (feat)

## Files Created/Modified

**Created (16 files):**

| Path | LOC | Purpose |
|------|-----|---------|
| `index.html` | 34 | Bootstrap HTML; Pico + Alpine via CDN with SRI; loads `main.js` as ES module. |
| `styles.css` | 13 | Minimal — `color-scheme: light dark` only. Pico classless does the rest in Phase 1. |
| `README.md` | 88 | Spanish docs: arranque (`npx serve`), requisitos (Node 22), tests, estructura, edición de contenido, motivo de no usar `file://`. |
| `src/main.js` | 98 | Bootstrap orchestrator (Phase 1 minimal): loadContent → loadState → expose `window.__appBoot`. On failure renders banner via direct DOM API (textContent only). |
| `src/domain/dates.js` | 26 | `todayLocal()` using local clock (no UTC). |
| `src/domain/session.js` | 96 | `buildSession()` weighted-sample fill phase + `exerciseWeight()` with cap 10. |
| `src/domain/progress.js` | 47 | `applySessionResult()` pure-immutable counter updater (Phase 1 reduced subset). |
| `src/data/schema-validator.js` | 132 | Hand-written validator accumulating all errors in one pass; Spanish messages. |
| `src/data/content-loader.js` | 109 | fetch + NFC-normalize-in-place + validate; throws Error with `.errors[]` on failure. |
| `src/data/storage.js` | 109 | localStorage wrapper bound to `italianCourse.v1`; corrupt-backup recovery + `migrate()` hook. |
| `src/exercise-types/index.js` | 19 | Registry — Phase 1 only exposes `multiple-choice`. |
| `src/exercise-types/multiple-choice.js` | 29 | `grade(exercise, response)` boolean handler. Pure. |
| `content/categories.json` | 5 | Master registry — Phase 1 only declares `avere`. |
| `content/exercises/avere.json` | 136 | 12 seed exercises (6 presente indicativo + 2 idiomatic + 4 passato prossimo). |
| `tests/domain.test.js` | 231 | 14 tests across 6 suites (dates, session, progress, validator, multiple-choice, registry). |
| `tests/util/seeded-rng.js` | 18 | Deterministic LCG for reproducible sampler tests. |

**Modified:** none (Phase 1 is greenfield).

## Verification Evidence

### `npx serve .` smoke test (Task 3)

```
=== HTTP checks ===
index.html: 200
categories.json: 200
avere.json: 200
main.js: 200
schema-validator.js: 200

=== Content-Type checks ===
Content-Type: application/json; charset=utf-8
Content-Type: application/json; charset=utf-8

=== Seed exercises count ===
Loaded 12 exercises; first id: avere-001

=== Index HTML SRI verify ===
integrity="sha384-NZhm4G1I7BpEGdjDKnzEfy3d78xvy7ECKUwwnKTYi036z42IyF056PbHfpQLIYgL"
integrity="sha384-pb6hrQvo4s23cEUFtj0CZkzGE3jyK3pj26RIupXXxhSrrcUA/Cn0lZgcCrGH0t6L"
```

Both SRI hashes match RESEARCH.md byte-for-byte (Pico 2.1.1 classless + Alpine 3.15.12).

### `node --test tests/*.test.js` output

```
# tests 14
# suites 6
# pass 14
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 49.554676
```

Exit code 0. All 14 tests pass (the plan required ≥9, with at least 7 for the dominio — exceeded with margin).

### Validator end-to-end (failure path)

Manually simulated `categories.json` with uppercase id and `correctIndex: 99`:

```
ok = false
  - {"file":"categories.json","exerciseId":"AVERE","reason":"id de categoría inválido: \"AVERE\" (debe ser slug ASCII en minúsculas)"}
  - {"file":"content/exercises/avere.json","exerciseId":"avere-001","reason":"referencia a categoría desconocida: \"avere\""}
  - {"file":"content/exercises/avere.json","exerciseId":"avere-001","reason":"\"payload.correctIndex\" inválido: 99 (debe ser entero en rango [0, 3))"}
```

Three independent errors accumulated in a single pass — exactly the multi-error reporting D-08 / Pitfall 6 mandates.

### Purity gates

```
=== src/domain/* + src/data/schema-validator.js (must NOT contain) ===
grep -E "(localStorage|fetch|document\.|window\.)" → only comment hits, no actual API usage.

=== src/exercise-types/*.js (must NOT contain) ===
grep -E "(localStorage|fetch)" → empty.

=== src/data/storage.js (must contain key) ===
const KEY = 'italianCourse.v1';  ✓

=== src/data/content-loader.js (must contain) ===
node[key] = v.normalize('NFC');  ✓

=== index.html (must NOT contain floating tags) ===
grep -cE '@latest|@\^|@~' index.html → 0  ✓

=== src/main.js (must NOT contain) ===
grep -c innerHTML src/main.js → 0  ✓
```

## Decisions Made

- **Test runner invocation**: README documents `node --test tests/*.test.js` (glob form) instead of the plan's literal `node --test tests/`. Reason: in Node v22.20.0 the trailing-slash form (`tests/`) is interpreted as a module-path and fails with `Cannot find module '/.../tests'`. The glob form works identically across all Node 22+ versions and is what `npx serve`-style users will copy-paste from the README. The `node --test` (no path) form also works via auto-discovery; both forms are functionally equivalent.
- **Avere seed composition**: Plan requires "6 persons of presente indicativo + 4-6 contextualized variants". I produced 6 + 6 = 12 to land at the max of the 10-12 range, giving the sampler more material in Phase 1 (the cap is in `requestedSize = min(20, pool.length) = 12` so all 12 will be used per session per D-13). Contextual variants split as 2 idiomatic (`avere fame`, `avere caldo`) + 4 passato prossimo derived from the PDF §3 verb categories. The PDF itself is about Passato Prossimo with Avere — the presente indicativo paradigm I added is the natural prerequisite to learn before tackling passato prossimo.
- **main.js error-banner DOM strategy**: Plan specified `<article role="alert">` rendered into the body. I render it into the existing `#error-banner` slot in `index.html` (so the placeholder is logically below the error if both ever coexist), with a fallback to `document.body.prepend()` if the slot is missing. Strictly equivalent to the plan from the user's perspective — the banner appears at the top of `<main>`.

## Deviations from Plan

None — the plan was executed exactly as specified. All decisions D-01..D-23 are materialized in code, and no auto-fix (Rule 1/2/3) or architectural change (Rule 4) was needed.

The minor deviations documented above (test invocation form, seed count at max-of-range, banner slot anchor) are all within "Claude's Discretion" per CONTEXT.md and do not alter any locked decision.

**Total deviations:** 0
**Impact on plan:** Plan executed clean. Greenfield greenfield-clean delivery.

## Issues Encountered

None of substance. One mechanical observation:

- The first `npx serve` curl smoke-test returned `000` HTTP codes because the `serve` package was still being downloaded by `npx`. Resolved by polling readiness with a 1-second loop before issuing the curl requests. Documented mentally; not a code change.

## User Setup Required

None — Phase 1 is fully self-contained:

- No environment variables.
- No dashboard configuration.
- The single external dependency is `npx serve` which installs on-demand at first run (~600k weekly downloads, Vercel-maintained — package legitimacy audited in RESEARCH.md).
- CDN assets (Pico + Alpine) load via SRI-verified jsDelivr — first-run requires internet, then cached.

## Next Phase Readiness

**Plan 02 (this phase, next plan) can start immediately.** Its handoff contract is:

```js
window.__appBoot = {
  content: { categories: Array<{id, name, order?}>, exerciseById: Record<id, Exercise> },
  state:   { schemaVersion: 1, exerciseStats: Record<id, {timesShown, timesCorrect, timesFailed}> },
  ready:   true
};
```

Plan 02 will:
1. Create `src/screens/session.js` exporting the `sessionScreen(content, state)` Alpine factory.
2. Add the session-screen markup (`<div x-data="sessionScreen" x-init="init()">...`) to `index.html`, replacing the `#app-placeholder` text.
3. Extend `src/main.js` to register `window.Alpine.data('sessionScreen', ...)` and call `Alpine.start()` from inside an `alpine:init` listener (handling both auto-start orderings as documented in RESEARCH.md Pattern 8).
4. Wire `applySessionResult` + `saveState` at session end (D-20: single write).

The required interfaces (`loadContent`, `loadState`, `saveState`, `buildSession`, `applySessionResult`, `registry`) are already exported and tested. No refactoring needed in Plan 01 files.

**Phase 2 readiness:** the `migrate()` hook in `storage.js` is the natural insertion point for the `schemaVersion: 2` migration that adds `categoryProgress` and `dailyLog`. The pure `applySessionResult` is the natural insertion point for the cascade-on-failure logic (DOMAIN-04). No architectural change required to extend.

## Self-Check: PASSED

Files exist (verified):
- `index.html`, `styles.css`, `README.md` ✓
- `src/main.js`, `src/domain/{dates,session,progress}.js`, `src/data/{schema-validator,content-loader,storage}.js`, `src/exercise-types/{index,multiple-choice}.js` ✓
- `content/categories.json`, `content/exercises/avere.json` ✓
- `tests/domain.test.js`, `tests/util/seeded-rng.js` ✓

Commits exist (verified):
- `997388c` — Task 1 (feat: pure domain + validator + tests) ✓
- `9fbb947` — Task 2 (feat: data layer + exercise-types registry) ✓
- `4aca6a1` — Task 3 (feat: HTML/CSS bootstrap + main.js + seed + README) ✓

All 14 tests pass (`node --test tests/*.test.js`, exit code 0).

---
*Phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice*
*Plan: 01*
*Completed: 2026-05-23*
