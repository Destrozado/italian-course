---
phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
verified: 2026-05-23T00:00:00Z
status: passed
human_uat_approved: 2026-05-23 (user approved 8/8 manual checks during plan 01-02 checkpoint)
score: 5/5 must-haves verified (roadmap success criteria) + 5/5 human verification items approved by user during execution
overrides_applied: 0
human_verification:
  - test: "Al abrir http://localhost:3000 tras npx serve: la app muestra el primer ejercicio de Avere con su prompt (___), 3-4 botones de opción, y el indicador 'Ejercicio 1 / N' (N entre 10-12)"
    expected: "Primer ejercicio visible, indicador de progreso correcto, sin errores en DevTools Console"
    why_human: "Requiere navegador real con Alpine.js cargado desde CDN y DevTools activos"
  - test: "Al hacer clic en la opción correcta: el botón se marca en verde, los demás se deshabilitan, y tras ~600ms la app avanza automáticamente al siguiente ejercicio"
    expected: "Auto-avance tras ~600ms, indicador pasa a 'Ejercicio 2 / N', sin botón 'Siguiente'"
    why_human: "Comportamiento de timer y binding Alpine que no puede verificarse con grep"
  - test: "Al hacer clic en una opción incorrecta: el botón se marca en rojo, el botón correcto se marca en verde simultáneamente, aparece 'Respuesta correcta: ...' y un botón 'Siguiente' — sin auto-avance"
    expected: "Doble feedback verde/rojo simultáneo, botón 'Siguiente' visible, sin auto-avance"
    why_human: "Comportamiento visual y de interacción que requiere browser real"
  - test: "Completar todos los ejercicios persiste los contadores en localStorage exactamente UNA VEZ al final"
    expected: "Clave 'italianCourse.v1' NO aparece en DevTools Application → Local Storage hasta el último ejercicio; tras terminar, contiene exerciseStats con schemaVersion:1"
    why_human: "Requiere inspeccionar DevTools Application durante y después de la sesión"
  - test: "Al recargar (Ctrl+R) tras completar la sesión, los contadores reflejan exactamente la sesión anterior"
    expected: "localStorage.getItem('italianCourse.v1') parseado contiene los mismos contadores que los ejercicios respondidos"
    why_human: "Requiere verificación en DevTools Console y comparación manual"
---
NOTE: The user has already approved manual UAT (8/8 verifications passed on 2026-05-23 per 01-02-SUMMARY.md).
The human_needed status is retained per verification-process rules (section 9: status is human_needed when ANY
human verification items exist). The UAT evidence from the SUMMARY is treated as strong supporting evidence
for all 5 items above. No blocker gaps were found.

# Phase 1: Loop Mínimo End-to-End (Avere + Multiple-Choice) — Verification Report

**Phase Goal:** El autor puede arrancar la app con `npx serve`, ver una categoría real (Avere) y completar una sesión de multiple-choice cuyo resultado persiste en localStorage al recargar
**Verified:** 2026-05-23
**Status:** human_needed — all automated checks pass; 5 items require browser interaction (UAT already approved by user on 2026-05-23)
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (from ROADMAP.md Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | La app arranca con `npx serve`, abre `http://localhost:3000` sin errores (Alpine+Pico CDN con versiones pinned, textos en español) | VERIFIED | index.html has 2 SRI sha384 hashes (Pico 2.1.1 + Alpine 3.15.12); no floating @latest/@^; `lang="es"` set; script ordering (main.js before Alpine) guarantees race-free boot |
| 2 | Carga categories.json + avere.json con validación de schema; JSON inválido muestra banner de error UI visible | VERIFIED | schema-validator.js is a 132-LOC hand-written single-pass validator; renderValidationBanner in main.js uses createElement+textContent (no innerHTML); content-loader throws Error with .errors[] on failure |
| 3 | Sesión multiple-choice con feedback verde/rojo (verde auto-avanza ~600ms, rojo muestra respuesta + "Siguiente"), indicador "Ejercicio X / N" | VERIFIED (automated+UAT) | session.js implements selectOption with setTimeout(600ms) for correct; advance() for incorrect; progressLabel getter; cancelAutoAdvance in destroy(); UAT steps 2+3 passed |
| 4 | Al terminar, timesShown/timesCorrect/timesFailed persisten UNA sola vez en localStorage bajo `italianCourse.v1` con schemaVersion; al recargar los contadores reflejan la sesión | VERIFIED (automated+UAT) | saveState called only inside `if (this.done)` in advance(); KEY='italianCourse.v1'; blankState() returns {schemaVersion:1}; UAT steps 4+5+6 passed |
| 5 | todayLocal() devuelve YYYY-MM-DD local (no UTC); buildSession() respeta muestreo ponderado 1/(1+min(timesShown,10)) | VERIFIED | node --test passes 14/14; todayLocal uses getFullYear/getMonth/getDate (no toISOString); exerciseWeight(100)===1/11 (cap verified by test) |

**Score:** 5/5 roadmap success criteria verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `index.html` | CDN tags (SRI) + Alpine markup + x-data="sessionScreen" | VERIFIED | 100 LOC; 2x integrity="sha384-"; x-data="sessionScreen" present; 5x x-text; no x-html |
| `src/domain/dates.js` | todayLocal() pure, local clock | VERIFIED | 27 LOC; exports todayLocal; uses getFullYear/getMonth/getDate; no toISOString |
| `src/domain/session.js` | buildSession + exerciseWeight pure | VERIFIED | 97 LOC; exports both; WEIGHT_CAP=10; weighted sampling without replacement; Fisher-Yates |
| `src/domain/progress.js` | applySessionResult pure, monotonic counters | VERIFIED | 48 LOC; spread-clone state; counters only increment; returns new state |
| `src/data/schema-validator.js` | validateContent accumulates all errors | VERIFIED | 132 LOC; accumulates errors array; never throws mid-walk; Spanish messages |
| `src/data/content-loader.js` | fetch+NFC+validate; throws with .errors | VERIFIED | 110 LOC; normalizeNfcInPlace before validate; throws Error with .errors on failure |
| `src/data/storage.js` | italianCourse.v1 key; schemaVersion:1; defensive | VERIFIED | 110 LOC; KEY='italianCourse.v1'; blankState returns {schemaVersion:1}; corrupt-backup recovery |
| `src/exercise-types/index.js` | registry = {'multiple-choice': ...} | VERIFIED | 19 LOC; exports registry object |
| `src/exercise-types/multiple-choice.js` | grade(exercise, response) → boolean | VERIFIED | 29 LOC; grade compares response.index === correctIndex |
| `src/screens/session.js` | sessionScreen(appDataReady) Alpine factory | VERIFIED | 205 LOC; all required methods present; Promise-based async init |
| `content/categories.json` | {categories:[{id:"avere",...}]} | VERIFIED | Valid JSON; id="avere"; slug passes ID_SLUG_RE |
| `content/exercises/avere.json` | 10-12 exercises, all categoryIds:["avere"] | VERIFIED | 12 exercises; all type="multiple-choice"; all categoryIds:["avere"]; all prompts contain "___"; options 3-4 each; correctIndex in range |
| `tests/domain.test.js` | ≥7 tests with node --test | VERIFIED | 14 tests, 6 suites, 14/14 pass, exit code 0 |
| `tests/util/seeded-rng.js` | seededLcg(seed) deterministic RNG | VERIFIED | 18 LOC; LCG with NR constants 1664525/1013904223 |
| `README.md` | Spanish docs: npx serve, Node 22, tests | VERIFIED | Documents npx serve, node --test tests/*.test.js, Node 22 requirement, file:// pitfall |
| `styles.css` | x-cloak + .correcta + .incorrecta | VERIFIED | 45 LOC; all 3 rules present with Pico CSS vars + hex fallbacks |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| src/main.js | src/data/content-loader.js | import { loadContent } | WIRED | Line 23: `import { loadContent } from './data/content-loader.js'` |
| src/main.js | src/data/storage.js | import { loadState } | WIRED | Line 24: `import { loadState } from './data/storage.js'` |
| src/main.js | src/screens/session.js | import { sessionScreen } | WIRED | Line 25: `import { sessionScreen } from './screens/session.js'` |
| src/main.js | Alpine.data('sessionScreen') | alpine:init sync listener | WIRED | Lines 46-48: addEventListener('alpine:init') at sync top-level before any await |
| src/data/content-loader.js | src/data/schema-validator.js | import { validateContent } | WIRED | Line 19: `import { validateContent } from './schema-validator.js'` |
| src/data/content-loader.js | fetch | fetch('content/categories.json') | WIRED | Line 31: `fetchJson('content/categories.json')` |
| src/data/storage.js | localStorage | italianCourse.v1 key | WIRED | KEY='italianCourse.v1'; getItem + setItem present |
| index.html | CDN Alpine 3.15.12 | script defer + integrity | WIRED | Line 27-30: sha384-pb6hrQvo4s23cEU... present |
| index.html | CDN Pico 2.1.1 | link + integrity | WIRED | Line 10-13: sha384-NZhm4G1I7BpEGdj... present |
| src/screens/session.js | src/domain/session.js | import { buildSession } | WIRED | Line 36: `import { buildSession } from '../domain/session.js'` |
| src/screens/session.js | src/domain/progress.js | import { applySessionResult } | WIRED | Line 37: `import { applySessionResult } from '../domain/progress.js'` |
| src/screens/session.js | src/data/storage.js | import { saveState } | WIRED | Line 38: `import { saveState } from '../data/storage.js'` |
| src/screens/session.js | src/exercise-types/index.js | import { registry } | WIRED | Line 39: `import { registry } from '../exercise-types/index.js'` |
| index.html | src/screens/session.js (via Alpine) | x-data="sessionScreen" | WIRED | Line 56: `<div x-data="sessionScreen" x-init="init()" x-cloak>` |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| src/screens/session.js | content/exerciseById | main.js resolveAppData({content,state}) → await appDataReady | YES — from loadContent() which fetches and validates JSON | FLOWING |
| src/screens/session.js | exerciseIds | buildSession(['avere'], Object.values(content.exerciseById), ...) | YES — weighted sampling over real pool of 12 exercises | FLOWING |
| src/screens/session.js | results → saveState | applySessionResult(this.state, {answers: this.results}) inside if(this.done) | YES — accumulates real answers; saveState writes to localStorage | FLOWING |
| index.html | progressLabel / currentExercise.payload.prompt / options | sessionScreen reactive getters | YES — rendered via x-text from real exerciseById data | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Test suite passes | `node --test tests/*.test.js` | 14 pass / 0 fail / exit 0 | PASS |
| 12 exercises valid | node inline validation script | "seed content OK: 12 ejercicios" | PASS |
| Purity gate (domain + validator) | grep for localStorage/fetch/document./window. in domain/* and schema-validator.js | Only comment lines match (no live API calls) | PASS |
| Purity gate (exercise-types) | grep for localStorage/fetch in exercise-types/* | No matches | PASS |
| No innerHTML in main.js | grep -c "innerHTML" src/main.js | 0 | PASS |
| No x-html in index.html | grep -E "x-html" index.html (excluding comments) | Comment-only reference ("jamás x-html") | PASS |
| SRI count | grep -c 'integrity="sha384-"' index.html | 2 | PASS |
| No floating CDN versions | grep -cE '@latest\|@\^\|@~' index.html | 0 | PASS |
| Session.js no direct DOM | grep for document./window./innerHTML in session.js (non-comments) | Only comment on line 14 | PASS |
| saveState only on done | grep saveState in session.js | Only inside if(this.done) block in advance() | PASS |
| No package.json/node_modules | ls package.json / ls node_modules | Neither exists | PASS |
| italianCourse.v1 key | grep -c "italianCourse.v1" storage.js | 4 (KEY const + usages) | PASS |
| NFC normalize | grep -c "normalize('NFC')" content-loader.js | 3 (in-place helper loop) | PASS |
| setTimeout/clearTimeout paired | grep in session.js | setTimeout line 152, clearTimeout line 190, both present | PASS |
| Alpine.data registered | grep "Alpine.data" main.js | Line 47: window.Alpine.data('sessionScreen', ...) | PASS |

### Probe Execution

No conventional probe scripts found (`scripts/*/tests/probe-*.sh` path absent). Phase has no declared probes. Step 7c: SKIPPED (no probes declared or conventional).

### Requirements Coverage

All 19 Phase 1 requirements accounted for across plans 01-01 and 01-02:

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FOUND-01 | 01-01 | App starts with `npx serve`, accessible at http://localhost:3000 | SATISFIED | index.html + README document npx serve; no build step required |
| FOUND-02 | 01-01 | HTML+CSS+JS vanilla, Alpine CDN pinned, Pico CDN pinned, zero build | SATISFIED | Alpine 3.15.12 + Pico 2.1.1 in index.html with SRI; no package.json |
| FOUND-03 | 01-01 | Basic responsive (not broken on small desktop) | SATISFIED | viewport meta present; Pico classless handles responsive layout by default |
| FOUND-04 | 01-01 | Spanish UI language | SATISFIED | "Ejercicio X / N", "Siguiente", "Respuesta correcta:", "Sesión terminada", "Cargando…", "Error en el contenido" all present in Spanish; error messages in validator also Spanish |
| CONT-01 | 01-01 | Exercises in content/exercises/ per category | SATISFIED | content/exercises/avere.json exists with 12 exercises |
| CONT-02 | 01-01 | content/categories.json master registry | SATISFIED | categories.json exists: {categories:[{id:"avere",name:"Avere (auxiliar)",order:1}]} |
| CONT-03 | 01-01 | Exercise fields: id, type, categoryIds, payload, optional notes | SATISFIED | All 12 avere exercises have all required fields; schema-validator enforces this shape |
| CONT-04 | 01-01 | Schema validator runs on load, rejects malformed JSON | SATISFIED | validateContent() called in loadContent() before returning; accumulates all errors |
| CONT-05 | 01-01 | Failed load/validation shows visible UI banner (not silent console) | SATISFIED | renderValidationBanner() in main.js creates article[role=alert] with error list via textContent |
| CONT-06 | 01-01 | Strings normalized to NFC on load | SATISFIED | normalizeNfcInPlace() called in content-loader.js BEFORE validateContent(); line 44 and 45-47 |
| EXTYPE-01 | 01-01/02 | multiple-choice type: prompt with gap + 3-4 option buttons | SATISFIED | multiple-choice.js grade(); index.html template with x-for buttons; all 12 exercises are multiple-choice |
| DOMAIN-01 | 01-01 | todayLocal() returns YYYY-MM-DD using local clock | SATISFIED | Uses getFullYear/getMonth/getDate; test passes (including midnight-boundary test) |
| DOMAIN-02 | 01-01 | buildSession() with weighted sampling 1/(1+min(timesShown,10)) | SATISFIED | exerciseWeight cap=10; weighted sampling without replacement; 3 passing tests |
| DOMAIN-09 | 01-01 | timesShown/timesCorrect/timesFailed are monotonically increasing | SATISFIED | applySessionResult only increments; test verifies no mutation and monotonic accumulation |
| SESSION-04 | 01-02 | Progress indicator "Ejercicio X / N" during session | SATISFIED | progressLabel getter in session.js; rendered via x-text="progressLabel" in index.html |
| SESSION-05 | 01-02 | Correct: green + auto-advance ~600ms; Incorrect: red + correct shown + "Siguiente" | SATISFIED | selectOption schedules setTimeout(600ms) on correct; no schedule on incorrect; :class binding for .correcta/.incorrecta; x-show for "Siguiente" button gated on feedback==='incorrect' |
| BACK-01 | 01-01 | All user state persisted in localStorage under italianCourse.v1 | SATISFIED | KEY='italianCourse.v1'; loadState/saveState use this key exclusively |
| BACK-02 | 01-01 | State written to localStorage only at end of completed session | SATISFIED | saveState only called inside `if (this.done)` in advance(); D-20 materialized |
| BACK-03 | 01-01 | State includes schemaVersion field | SATISFIED | blankState() returns {schemaVersion:1,exerciseStats:{}}; loadState returns this shape |

**Coverage: 19/19 requirements satisfied**

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| index.html | 52 | "TODO" in HTML comment ("TODO el contenido del JSON") | INFO | False positive — "TODO" here is the Spanish word "todo" (= "all"), not a task marker. Not a debt marker. |
| index.html | 39 | `<div id="app-placeholder">Cargando…</div>` | INFO | Intentional loading placeholder; main.js removes it on successful boot. Not a stub. |

No TBD, FIXME, or XXX debt markers found in any Phase 1 source file.
No `return null` stubs in domain modules (the one `return null` candidate in the grep produced no output — all empty-return patterns are context-appropriate).
No `innerHTML` usage in src/main.js or src/screens/session.js.
No `x-html` usage in index.html.

### Human Verification Required

The following items require browser interaction to verify. Per the user notes, manual UAT was already completed (8/8 verifications approved on 2026-05-23 per 01-02-SUMMARY.md). These items are listed for completeness and as a standing record.

#### 1. Session UI renders and boots correctly

**Test:** Run `npx serve .` from project root, open `http://localhost:3000`, check DevTools Console
**Expected:** No errors; "Ejercicio 1 / N" visible (N=10-12); first Avere exercise shown with prompt and 3-4 option buttons
**Why human:** Requires real browser with Alpine.js loaded from CDN

#### 2. Correct answer feedback and auto-advance

**Test:** Click the correct option button
**Expected:** Button turns green immediately; other buttons disabled; no "Siguiente" button; after ~600ms the app automatically advances to "Ejercicio 2 / N"
**Why human:** Timer-based behavior requires live browser with real timing

#### 3. Incorrect answer feedback and manual advance

**Test:** Click an incorrect option button
**Expected:** Clicked button turns red AND correct button turns green simultaneously; "Respuesta correcta: [text]" appears; "Siguiente" button appears; no auto-advance
**Why human:** Alpine :class binding behavior requires visual verification

#### 4. Write-once-at-session-end persistence (D-20)

**Test:** Open DevTools Application → Local Storage, observe `italianCourse.v1` during a session, then complete all exercises
**Expected:** Key absent during session; appears only after last exercise; contains `{schemaVersion:1, exerciseStats:{...}}`
**Why human:** Requires real localStorage inspection in browser DevTools

#### 5. Reload reflects previous session counters

**Test:** After completing a session, press Ctrl+R; inspect `localStorage.getItem('italianCourse.v1')` in DevTools Console
**Expected:** exerciseStats counters match the exercises answered in the previous session
**Why human:** Requires browser DevTools to inspect state across page reloads

---

## Gaps Summary

No gaps found. All 5 roadmap success criteria are VERIFIED by automated evidence. All 19 requirements are SATISFIED. All 15 artifacts exist, are substantive, and are wired. All 14 key links are confirmed wired by import/usage grep. Data flows from JSON files through content-loader → session factory → saveState are all FLOWING.

The human_needed status reflects browser-interaction items that are inherently unverifiable by static analysis. The user has already approved manual UAT (8/8 checks passed) on the same date as implementation, providing strong evidence that all runtime behaviors work as specified.

**Phase 1 goal achievement: CONFIRMED by automated evidence + user-approved UAT.**

---

_Verified: 2026-05-23_
_Verifier: Claude (gsd-verifier)_
