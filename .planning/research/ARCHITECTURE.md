# Architecture Research

**Domain:** Single-user static web quiz app (spaced-repetition / strict-failure model) with localStorage persistence and hand-edited JSON content
**Researched:** 2026-05-23
**Confidence:** HIGH (synthesized from explicit PROJECT.md requirements; well-known web patterns; no external libraries to verify)

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                       UI LAYER (index.html + DOM)                    │
│  ┌──────────────┐ ┌───────────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ Home/Picker  │ │ Session Runner│ │ Resumen  │ │ Backup (I/E)   │ │
│  │ (categorías) │ │ (ejercicios)  │ │ (stats)  │ │ JSON import/exp│ │
│  └──────┬───────┘ └───────┬───────┘ └────┬─────┘ └────┬───────────┘ │
│         │                 │              │            │              │
│         │  (events)       │  (events)    │ (read-only)│              │
├─────────┴─────────────────┴──────────────┴────────────┴──────────────┤
│                       APPLICATION / DOMAIN LAYER                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────────┐  │
│  │  session.js │  │ progress.js  │  │ exercise-types/ (registry) │  │
│  │ (sampler +  │  │ (state       │  │  multiple-choice           │  │
│  │  runner)    │  │  machine,    │  │  word-buttons              │  │
│  │             │  │  streaks)    │  │  match                     │  │
│  └──────┬──────┘  └──────┬───────┘  └──────────────┬─────────────┘  │
│         │                │                          │                │
├─────────┴────────────────┴──────────────────────────┴────────────────┤
│                       DATA LAYER                                     │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐ │
│  │ content/ (JSON, static) │    │ storage.js  → localStorage      │ │
│  │  exercises.json         │    │   userProgress (categorías)     │ │
│  │  categories.json        │    │   exerciseStats                 │ │
│  │  (read-only at runtime) │    │   dailyLog                      │ │
│  └─────────────────────────┘    │   schemaVersion                 │ │
│                                  └─────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `content/*.json` | Static, versioned exercise + category definitions (the "what to study") | Hand-edited JSON, loaded once via `fetch()` at app start |
| `storage.js` | Read/write a single JSON blob to `localStorage` under one key; schema versioning; import/export | Thin wrapper: `loadState()`, `saveState()`, `exportJson()`, `importJson()` |
| `progress.js` | Category state machine; "did I fail today" derivation; streak update on session end | Pure functions: `(currentState, sessionResult) → newState` |
| `session.js` | Build a session (sampling) and run it (cursor through exercises, collect answers) | Two layers: `buildSession(opts)` (pure) and `SessionRunner` (stateful per session) |
| `exercise-types/*.js` | Per-type render + grade logic. One module per type, registered into a map | Registry pattern: `{ render(payload, container), grade(payload, userInput) → boolean }` |
| `ui/*.js` | Screen controllers (home picker, session runner, stats, backup). Reads domain output, dispatches user events | Plain JS modules, one screen = one module |
| `app.js` | Composition root: loads content, hydrates state from localStorage, wires up router/screens | Tiny — just glue |

**Hard rule:** UI never touches `localStorage` directly. UI never grades an answer. Domain layer never touches the DOM. This is the only architectural commandment that matters at this size.

---

## 2. Data Model

### 2.1 Content (static, in `content/`)

```ts
// content/categories.json
type Category = {
  id: string;            // "avere", "genero-numero", "preposiciones"
  name: string;          // "Avere"
  description?: string;  // optional, shown in picker
  order?: number;        // sort order in UI
};

// content/exercises.json (or sharded: content/exercises/*.json)
type Exercise =
  | MultipleChoiceExercise
  | WordButtonsExercise
  | MatchExercise;

type ExerciseBase = {
  id: string;            // stable, e.g. "avere-pres-001". NEVER mutate.
  categoryIds: string[]; // 1..N. Multi-category support.
  type: "multiple-choice" | "word-buttons" | "match";
};

type MultipleChoiceExercise = ExerciseBase & {
  type: "multiple-choice";
  prompt: string;        // "Io ___ fame." (use ___ for hueco; or split prefix/suffix)
  options: string[];     // ["ho", "hai", "ha", "abbiamo"]
  answerIndex: number;   // 0
};

type WordButtonsExercise = ExerciseBase & {
  type: "word-buttons";
  promptEs: string;      // "Yo tengo hambre"
  tokens: string[];      // ["Io", "ho", "fame"]  (the correct order)
  // Distractors optional; if absent, just shuffle `tokens`.
  distractors?: string[];
};

type MatchExercise = ExerciseBase & {
  type: "match";
  pairs: Array<{ left: string; right: string }>;
  // UI shuffles each column independently; correct = matching original pairs.
};
```

**Why multi-category metadata lives on the exercise (not the other way around):**
- Source of truth is one-way: exercise → its categories. Easy to query "all exercises for category X" by filter.
- Matches the failure rule: "fail this exercise → its `categoryIds` all reset" is a one-liner.
- Hand-editing is local: adding a category tag means editing one exercise, not a separate index file.

### 2.2 State (in `localStorage`, single key)

```ts
// stored under key "italianCourse.v1"
type PersistedState = {
  schemaVersion: 1;
  categoryProgress: Record<CategoryId, CategoryProgress>;
  exerciseStats: Record<ExerciseId, ExerciseStat>;
  dailyLog: Record<ISODate, DailyEntry>; // "2026-05-23" → entry
  lastSessionAt?: number;                // epoch ms
};

type CategoryProgress = {
  status: "no-hecha" | "hecha" | "dominada";
  // Streak counted only on local-calendar days the user practiced this category
  // AND did not fail any exercise touching it.
  streakDays: number;        // 0..21+ (caps visually at 21 for "dominada")
  lastPracticedDate?: ISODate; // last day this category appeared in a session
  lastSuccessDate?: ISODate;   // last day it ended a session without failures
  becameHechaAt?: ISODate;     // when streak counting started
  becameDominadaAt?: ISODate;  // 21-day mark
};

type ExerciseStat = {
  timesShown: number;
  timesCorrect: number;
  timesFailed: number;
  lastShownAt?: number; // epoch ms — useful for "don't repeat in same session"
};

type DailyEntry = {
  date: ISODate;
  categoriesPracticed: CategoryId[];     // set, deduped
  categoriesWithFailure: CategoryId[];   // set, deduped
};

type ISODate = string;       // "YYYY-MM-DD" in **local** time
type CategoryId = string;
type ExerciseId = string;
```

**Note on `dailyLog`:** Keeping a per-day log (instead of just a counter on the category) makes streak recomputation deterministic and debuggable — you can replay the streak from the log if anything goes wrong. Size is trivial (one entry per day, ~few hundred bytes).

---

## 3. Content vs State Separation

| Concern | Content (JSON files) | State (`localStorage`) |
|---------|---------------------|------------------------|
| Lifecycle | Versioned in git, edited by author | Mutated by app at runtime |
| Identity | `Exercise.id` is the join key | `exerciseStats[exerciseId]` references it |
| Authority | Always loaded fresh from `content/` | Always loaded from `localStorage` |
| Backup | Already in git | Export to JSON, manual |

**Concrete rules:**

1. **Never write content to `localStorage`.** The app reads `content/exercises.json` via `fetch()` every load. Caching is the browser's job.
2. **State references content by ID only.** If you delete an exercise from JSON, its stat entry becomes orphaned — that's fine; clean it lazily on next save (`pruneOrphans(state, content)`).
3. **Adding a new exercise must be safe.** New `Exercise.id` → no entry in `exerciseStats` → defaults to `{ timesShown: 0, ... }`. Same for new categories.
4. **Schema version on persisted state.** When the state shape changes, write a migration (`migrate(rawState) → currentState`). Throw on unknown versions rather than silently corrupting.
5. **Export = persisted state only.** The export file is the user's progress, not the content. It's small, readable, and re-importable on a fresh install. Format:
   ```json
   { "exportedAt": "2026-05-23T18:00:00", "appVersion": "1.0", "state": { ...PersistedState } }
   ```
6. **Import = full replace with confirmation.** Don't merge — that's a rabbit hole. Confirm-replace is fine for one user.

---

## 4. Exercise Type Model

**Use a discriminated union + a registry.** This is the cleanest pattern for a small number of types where each has its own render/grade behavior.

```js
// exercise-types/index.js
import * as multipleChoice from "./multiple-choice.js";
import * as wordButtons from "./word-buttons.js";
import * as match from "./match.js";

export const registry = {
  "multiple-choice": multipleChoice,
  "word-buttons": wordButtons,
  "match": match,
};

export function getHandler(type) {
  const h = registry[type];
  if (!h) throw new Error(`Unknown exercise type: ${type}`);
  return h;
}
```

Each handler module exports the same shape:

```js
// exercise-types/multiple-choice.js
export function render(exercise, container, onAnswer) {
  // Renders into `container`. Calls onAnswer({ userInput }) when user picks.
}

export function grade(exercise, userInput) {
  return userInput.index === exercise.answerIndex; // boolean
}

// Optional: validate(exercise) → throws if JSON shape is wrong.
// Useful for a one-shot content lint script.
```

**Why this is right for this app:**
- Adding a fourth type later (e.g. "fill in conjugation table") = one new file + one registry line. No edits to `session.js`, `progress.js`, or UI screen.
- Grading lives next to the type definition. No conditional `if (type === "multiple-choice") ...` scattered around.
- The discriminated-union TS types catch shape errors at edit time (if you adopt TS or JSDoc).

**Anti-pattern to avoid:** A single mega-component that switch-cases on `exercise.type` for both rendering and grading. Looks fine with 3 types, unmaintainable at 6.

---

## 5. Module / File Layout

```
italian-course/
├── index.html                    # single HTML entry, loads app.js as module
├── styles.css                    # one file is enough at this size
├── app.js                        # composition root
├── src/
│   ├── storage.js                # localStorage wrapper + import/export
│   ├── progress.js               # category state machine, streaks
│   ├── session.js                # sampling + session runner
│   ├── dates.js                  # local-day helpers (see §7)
│   ├── content-loader.js         # fetch + validate JSON
│   ├── exercise-types/
│   │   ├── index.js              # registry
│   │   ├── multiple-choice.js
│   │   ├── word-buttons.js
│   │   └── match.js
│   └── ui/
│       ├── router.js             # tiny hash router (#/, #/session, #/stats)
│       ├── screen-home.js        # category picker, "Iniciar repaso" / "Test completo"
│       ├── screen-session.js     # runs SessionRunner, hosts exercise-type render
│       ├── screen-stats.js       # progress overview
│       └── screen-backup.js      # import/export JSON
├── content/
│   ├── categories.json
│   └── exercises/
│       ├── avere.json
│       ├── genero-numero.json
│       ├── verbos-movimiento.json
│       ├── profesiones.json
│       ├── sustantivos-irregulares.json
│       └── preposiciones.json
└── .planning/                    # already exists
```

**Rationale:**

- **Flat `src/`, no deep nesting.** At ~10-15 modules total, folders beyond `exercise-types/` and `ui/` add navigation cost without organization gain.
- **Exercises sharded by category.** Six small JSON files instead of one huge one — easier hand-editing, easier git diffs, no merge conflicts when adding a category. `content-loader.js` reads `categories.json`, then loads each `exercises/<id>.json`, concatenates.
- **No build step required.** ES modules in modern browsers handle this directly. `index.html` → `<script type="module" src="app.js">`. Opens via double-click... *with one caveat:* `fetch()` of local JSON via `file://` is blocked in most browsers. **You must either** (a) inline content as ES module exports (`export default [...]` in `.js` files), or (b) tell the user to run a one-liner local server (`python -m http.server`), or (c) embed all JSON into a single bootstrapped `<script type="application/json">` block in `index.html`. Recommendation: **option (a)** — `content/exercises/avere.js` exporting an array. Keeps "double-click and it works" promise from PROJECT.md.
- **Tests (when you add them) live next to source:** `session.test.js` beside `session.js`. Run with any small test runner (Vitest is the lightest if you ever add a build step) or just keep pure-function logic and write `_smoke.js` files you run from the console.

---

## 6. Session Generation Algorithm

### Inputs

- `selectedCategoryIds: CategoryId[]` (from picker)
- `mode: "repaso" | "test-completo"`
- `targetCount: number` (20 for repaso; ignored for test-completo)
- `allExercises: Exercise[]` (filtered to those touching at least one selected category)
- `exerciseStats: Record<ExerciseId, ExerciseStat>`

### Algorithm (repaso mode, 20-question case)

```
1. POOL = exercises where exercise.categoryIds ∩ selectedCategoryIds ≠ ∅
   If POOL is empty → error UI ("no hay ejercicios para esas categorías")

2. GUARANTEE PHASE — ensure ≥1 per selected category, where possible:
   For each cat in selectedCategoryIds:
     candidates = exercises in POOL that include cat in categoryIds
     if candidates empty: skip (category has no exercises yet)
     pick one weighted by (1 / (timesShown + 1))  // less-shown = higher prob
     add to SESSION (avoid duplicates)
     Note: a single exercise can satisfy multiple categories due to multi-category tags

3. FILL PHASE — fill up to targetCount:
   remaining = POOL \ SESSION
   while |SESSION| < targetCount and remaining ≠ ∅:
     pick one from remaining weighted by (1 / (timesShown + 1))
     add to SESSION; remove from remaining

4. If |SESSION| < targetCount after exhausting POOL:
   → session is smaller than 20; that's fine, surface it in the UI
   → ("Sesión de 14 ejercicios — todas las categorías cubiertas")

5. SHUFFLE(SESSION) — final order is random; guarantee picks are not all at the start.
```

### Weighting

`weight(exercise) = 1 / (exerciseStats[ex.id]?.timesShown ?? 0 + 1)`

Implement as standard weighted-without-replacement: compute cumulative weights, sample uniform [0, total), find slot, remove, repeat. For ~hundreds of exercises this is fast enough not to think about it.

### Edge Cases & Pitfalls

| Case | Behavior |
|------|----------|
| Category has 0 exercises | Skip silently in guarantee phase; user sees fewer than expected (not an error) |
| Category has 1-2 exercises | Guarantee phase picks one; fill phase may pick the same one again (deduped — won't repeat in same session) |
| Pool smaller than targetCount | Session is shorter than 20. Don't try to repeat exercises within a session |
| User selects 25 categories, target = 20 | Guarantee phase will fill all 20 slots with one-per-category. **Some categories won't appear.** Surface this: "Has elegido 25 categorías para 20 ejercicios; 5 quedarán fuera de esta sesión." Pick which 5 to drop by lowest priority (highest `timesShown` average across their exercises) |
| All exercises in pool have `timesShown = 0` (fresh user) | All weights equal → uniform random. Correct behavior |
| Test completo mode | Skip steps 2-4 entirely; SESSION = all of POOL, shuffled. Step 1 + shuffle |
| User cancels mid-session | Session results so far are discarded (don't half-commit progress). Document this clearly in UI |

### Output

```ts
type Session = {
  id: string;             // uuid-ish, for logging
  mode: "repaso" | "test-completo";
  exerciseIds: ExerciseId[];   // ordered
  selectedCategoryIds: CategoryId[]; // remembered for end-of-session attribution
  startedAt: number;
};
```

The runner mutates an in-memory `SessionResult` as the user progresses, then commits at session end (see §8).

---

## 7. Category Lifecycle State Machine

### States and Transitions

```
        ┌──────────┐  (all exercises in this category answered correctly
        │ no-hecha │   across one or more sessions, no pending failure)
        └────┬─────┘
             │  reachHecha()
             ▼
        ┌──────────┐  (each new local-day with practice + no failure → streakDays++)
   ┌────│  hecha   │────┐
   │    └────┬─────┘    │
   │         │ streakDays reaches 21
   │         ▼
   │    ┌──────────┐
   │    │ dominada │   (continues appearing in sessions identically;
   │    └────┬─────┘    just a visual badge)
   │         │
   │         │  any failure on an exercise tagged with this category
   │         │  in ANY session
   │         ▼
   └────────────────────┐
                        │  FAIL RESET
                        ▼
                  back to no-hecha
                  streakDays = 0
                  becameHechaAt = undefined
                  becameDominadaAt = undefined
```

### `no-hecha → hecha` Transition

When does a category become "hecha"? PROJECT.md says: "todos sus ejercicios completados sin fallar."

**Strict interpretation (recommended):** track which exercise IDs have been answered correctly *without an outstanding failure* per category. Maintain `pendingExercises: Set<ExerciseId>` per category. When the set is empty, the category becomes `hecha`. A failure on any exercise of that category re-adds *all* its exercises to `pendingExercises` and flips status back to `no-hecha`.

Equivalent simpler model: `category.status = "hecha"` iff `every exercise in category has exerciseStats[id].timesCorrect >= 1 AND last interaction was correct`. The "last interaction was correct" condition is implicit in the fail-reset rule, but **only if you reset stats too** — which would lose history. Cleaner: keep stats monotonic (they're history) and maintain a separate `pendingExercises` set as the "have I cleared this round" tracker.

**Concrete recommendation:** Add a per-category `clearedExerciseIds: Set<ExerciseId>` to `CategoryProgress`. On correct answer, add the exercise to the set for each of its categories. On wrong answer, *empty* the set for each of its categories (and flip status to `no-hecha`). When the set equals the full set of exercises in that category, flip to `hecha`.

```ts
type CategoryProgress = {
  status: "no-hecha" | "hecha" | "dominada";
  clearedExerciseIds: ExerciseId[];  // exercises answered correctly in the CURRENT round
  streakDays: number;
  lastPracticedDate?: ISODate;
  lastSuccessDate?: ISODate;
  becameHechaAt?: ISODate;
  becameDominadaAt?: ISODate;
};
```

### End-of-Session Update (the single most important function)

```js
// progress.js
export function applySessionResult(state, sessionResult, content, today) {
  // sessionResult: { answers: [{ exerciseId, correct }] }
  // today: local-day ISODate, injected for testability

  const failedExerciseIds = sessionResult.answers
    .filter(a => !a.correct)
    .map(a => a.exerciseId);

  const failedCategoryIds = new Set(
    failedExerciseIds.flatMap(eid =>
      content.exerciseById[eid].categoryIds
    )
  );

  const practicedCategoryIds = new Set(
    sessionResult.answers.flatMap(a =>
      content.exerciseById[a.exerciseId].categoryIds
    )
  );

  // 1. Update exerciseStats (always)
  for (const ans of sessionResult.answers) {
    const s = state.exerciseStats[ans.exerciseId] ??= blankStat();
    s.timesShown += 1;
    if (ans.correct) s.timesCorrect += 1;
    else s.timesFailed += 1;
    s.lastShownAt = Date.now();
  }

  // 2. Update categoryProgress
  for (const catId of practicedCategoryIds) {
    const cat = state.categoryProgress[catId] ??= blankCategoryProgress();

    if (failedCategoryIds.has(catId)) {
      // FAIL RESET — the headline rule
      cat.status = "no-hecha";
      cat.streakDays = 0;
      cat.clearedExerciseIds = [];
      cat.becameHechaAt = undefined;
      cat.becameDominadaAt = undefined;
    } else {
      // All exercises of this category answered correctly today
      // Add cleared exercises to the set
      const correctIdsForCat = sessionResult.answers
        .filter(a => a.correct && content.exerciseById[a.exerciseId].categoryIds.includes(catId))
        .map(a => a.exerciseId);
      cat.clearedExerciseIds = unique([...cat.clearedExerciseIds, ...correctIdsForCat]);

      const allInCat = content.exercisesByCategory[catId].map(e => e.id);
      const isCleared = allInCat.every(id => cat.clearedExerciseIds.includes(id));

      if (isCleared) {
        if (cat.status === "no-hecha") {
          cat.status = "hecha";
          cat.becameHechaAt = today;
        }
        // Streak increment: only once per local-day per category
        if (cat.lastSuccessDate !== today) {
          cat.streakDays += 1;
          cat.lastSuccessDate = today;
          if (cat.streakDays >= 21 && cat.status !== "dominada") {
            cat.status = "dominada";
            cat.becameDominadaAt = today;
          }
        }
      }
    }

    cat.lastPracticedDate = today;
  }

  // 3. Update daily log
  const entry = state.dailyLog[today] ??= { date: today, categoriesPracticed: [], categoriesWithFailure: [] };
  entry.categoriesPracticed = unique([...entry.categoriesPracticed, ...practicedCategoryIds]);
  entry.categoriesWithFailure = unique([...entry.categoriesWithFailure, ...failedCategoryIds]);

  state.lastSessionAt = Date.now();
  return state;
}
```

**Critical invariants:**
- Fail-reset wins. If a category appears in both `practicedCategoryIds` and `failedCategoryIds`, it gets reset — no streak credit, no "hecha" status. This handles "I passed exercise A in category X, but failed exercise B in category X in the same session" correctly.
- Streak increments **once per day per category**, guarded by `lastSuccessDate !== today`. Doing 5 sessions on the same day doesn't add 5 to the streak.
- `applySessionResult` is **pure** (takes state, returns new state). Commit to localStorage happens in a separate step. Easy to unit-test.

---

## 8. Time / Date Handling

The streak counter is the single piece of logic where time matters. Get this right or the whole motivation system breaks.

### Decision: **Local calendar day, no UTC**

A "day" for this app is "a day on the user's wall clock." The user is one person studying on one machine; cross-timezone concerns are theoretical. Don't over-engineer.

```js
// src/dates.js
export function todayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;  // "2026-05-23"
}

export function daysBetween(isoA, isoB) {
  // Used only for diagnostics, not for streak logic
  return Math.round((Date.parse(isoB) - Date.parse(isoA)) / 86400000);
}
```

### Edge Cases (acceptable trade-offs)

| Case | Behavior | Rationale |
|------|----------|-----------|
| User practices at 23:55, then again at 00:05 | Two different local days; streak +2 for that category (if both successful) | Matches user's mental model of "I studied yesterday and today" |
| Daylight saving | Irrelevant — we use calendar dates, not durations | `getDate()` is DST-safe |
| User changes system clock | Streak can be gamed or accidentally broken | Acceptable for personal app; **do not** add server-side validation |
| User travels across timezones | Day labels shift with local clock | This is a desktop-only app per constraints; rare |
| User skips a day | Streak does NOT auto-reset. The rule per PROJECT.md is "21 días seguidos de racha" but the streak only counts *days you practiced without failure* — so skipping a day just means the streak doesn't advance, not that it resets | This is the more forgiving interpretation; matches the explicit text "cuenta solo los días en los que practicaste esa categoría y no fallaste" |

**On the skipped-day question:** PROJECT.md is unambiguous: streak advances on practice-and-no-fail days. Skipping doesn't fail. Failure resets. This is the explicit design — confirm with the author if there's any doubt, but the wording is clear. (Alternative interpretation — "21 *consecutive calendar* days, missing any day resets" — is more punishing and *not* what the document says.)

### `lastSuccessDate` is the streak guard

Don't compute the streak from `dailyLog` on every render. Store it explicitly on the category. `dailyLog` is for audit/recompute only.

---

## 9. Persistence Layer

### Write Strategy

**Write on meaningful events, not on every keystroke.**

| Event | Persist? |
|-------|----------|
| User checks/unchecks a category in picker | No (UI-only state) |
| User starts a session | No |
| User answers an exercise (within a session) | **No** — keep session result in memory |
| User finishes a session | **Yes** — single atomic write |
| User cancels mid-session | No — discard in-memory result |
| User imports/exports | Yes (import); read-only (export) |

**Why batch on session end:** A session has 20 answers. Writing 20 times is wasteful and creates 20 windows for inconsistent partial state. One write at the end is atomic from the user's perspective and matches the "session = unit of progress" mental model.

**Trade-off:** If the browser crashes mid-session, the session's progress is lost. For a personal study app this is acceptable — the user just redoes the session. The alternative (write-on-each-answer) introduces partial-state complications (what's the category state if half a session is committed?) that aren't worth solving for a single user.

### Implementation

```js
// src/storage.js
const KEY = "italianCourse.v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    return migrate(parsed);
  } catch (e) {
    console.error("State load failed; backing up corrupt state", e);
    localStorage.setItem(KEY + ".corrupt." + Date.now(), localStorage.getItem(KEY) ?? "");
    return blankState();
  }
}

export function saveState(state) {
  // Synchronous; localStorage is sync anyway
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportJson(state) {
  return JSON.stringify({ exportedAt: new Date().toISOString(), appVersion: "1.0", state }, null, 2);
}

export function importJson(jsonText) {
  const parsed = JSON.parse(jsonText);
  if (!parsed.state) throw new Error("Invalid backup file");
  return migrate(parsed.state); // run through migration in case of version mismatch
}
```

### Multi-Tab Issues

`localStorage` is shared across tabs. If the user opens the app in two tabs and does sessions in both, the last-writer wins and the other tab's progress is lost.

**Mitigation:** Listen to the `storage` event and either:
- **(a) Warn:** "Otra pestaña ha actualizado el progreso. Recarga para sincronizar." (Recommended — simple, accurate.)
- **(b) Auto-reload:** Reload state on `storage` event, refuse if a session is mid-flight.

For a single user with desktop-only constraint, **(a)** is enough. Don't build distributed-system primitives for one person.

### Corruption Defense

- Wrap `JSON.parse` in try/catch on load.
- On parse failure, copy the corrupt blob to `italianCourse.v1.corrupt.<timestamp>` so the user can recover, then start fresh.
- Validate shape after parse: check `schemaVersion`, presence of expected top-level keys. If missing, run `migrate()` or fall back.

### Size & Quota

`localStorage` is typically 5-10MB per origin. Per-exercise state is ~50 bytes; per-day log entry is ~100 bytes; 1000 exercises × 50 bytes = 50KB; 10 years × 365 days × 100 bytes = 365KB. **Well under quota** — no concern.

---

## 10. Data Flow: Anatomy of a Session

```
[1] User opens index.html
    └─ app.js loads
       ├─ content-loader.js fetches categories + exercises  (content)
       └─ storage.js loadState() reads localStorage         (state)
    └─ screen-home.js renders, populated from content + state

[2] User checks 3 categories, picks "Sesión de repaso 20"
    └─ screen-home dispatches → session.buildSession({
         selectedCategoryIds, mode: "repaso", targetCount: 20,
         allExercises, exerciseStats
       })
    └─ session: an array of 20 exerciseIds, in order
    └─ router → #/session, screen-session takes over

[3] screen-session iterates the session:
    For each exerciseId:
       - look up exercise from content
       - getHandler(exercise.type).render(exercise, container, onAnswer)
       - on onAnswer({ userInput }):
           correct = handler.grade(exercise, userInput)
           append { exerciseId, correct } to in-memory sessionResult
           show green/red flash, advance to next
       - DO NOT write to localStorage here

[4] After exercise 20:
    └─ progress.applySessionResult(state, sessionResult, content, todayLocal())
       returns newState
    └─ storage.saveState(newState)
    └─ screen-session shows summary (X correctas / 20, categorías afectadas)
    └─ User clicks "Volver" → router → #/

[5] screen-home re-renders with fresh state — categories show updated
    status badges (no-hecha / hecha / dominada) and streak counts.
```

**Key invariants in this flow:**
- Content is loaded once; state is loaded once; thereafter both are in-memory until session end.
- UI talks to domain via plain function calls + DOM events. No reactive framework needed; the data graph is tiny.
- The only async operations are `fetch()` (startup) and... that's it. No promises in the hot path.

---

## 11. Build Order (Roadmap Implications)

This is the section the roadmap will lean on most. Order is chosen so each layer can be tested independently before depending on the next.

### Phase A — Domain Core (no UI, no persistence)
**Goal:** Prove the math is right. Pure functions only.

1. Define data types (TypeScript or JSDoc).
2. Implement `progress.applySessionResult()` against hard-coded content + state fixtures.
3. Implement `session.buildSession()` against hard-coded content + state fixtures.
4. Write smoke tests for the failure cases in §6 (oversubscription, single-exercise category, fail-reset) and §7 (state machine transitions).

**Why first:** This is the highest-risk logic (multi-category fail-reset, streak-once-per-day, oversubscription). If it's broken, everything else is wasted. It's also the easiest to test — pure functions, no DOM, no I/O.

**Exit criteria:** Running a script that simulates 30 days of sessions produces sensible category states and streaks. Edge cases covered.

### Phase B — Persistence + Content Loading
**Goal:** Wire the domain to localStorage and to JSON files.

1. `storage.js` — load/save/import/export, with the migration shell in place (`schemaVersion: 1`).
2. `content-loader.js` — load categories + exercises (either via `fetch()` from a local server or via ES module imports for double-click usage).
3. Corruption test: hand-edit localStorage to invalid JSON, confirm graceful recovery.
4. Decide on the `file://` vs local-server question (see §5 recommendation: ES module imports for content).

**Exit criteria:** Can persist state across page reloads. Can import/export. Content additions to JSON show up in `allExercises` on reload.

### Phase C — Exercise Type Registry + One Working Type
**Goal:** Render and grade one exercise type end-to-end.

1. Build the `exercise-types/` registry skeleton.
2. Implement `multiple-choice` first (simplest, most pedagogically central).
3. Build a minimal `screen-session.js` that runs through a hard-coded session of 3 multiple-choice exercises and calls `applySessionResult` at the end.

**Why multiple-choice first:** It's the simplest UI (radio buttons), validates the full pipeline (render → grade → persist → state update), and is the most common exercise type so it'll get used for thousands of interactions.

**Exit criteria:** Open app, run a 3-exercise session, see state update, reload, see persisted state.

### Phase D — Full UI Shell
**Goal:** The user-facing screens.

1. `screen-home.js` — category picker with status badges and streak display.
2. Wire `buildSession()` into the picker → starts a real session.
3. `screen-session.js` — full session runner (already partially built in Phase C).
4. End-of-session summary screen.
5. `screen-stats.js` — overview of all categories + global stats.
6. `screen-backup.js` — import/export UI.

**Exit criteria:** A real user (the author) can run a complete daily session using only multiple-choice exercises.

### Phase E — Remaining Exercise Types
**Goal:** Cover the three types from PROJECT.md.

1. `word-buttons.js` — drag/click word ordering.
2. `match.js` — two-column matching.
3. Validation script: lint all `content/exercises/*.js` for shape errors before commit.

**Why after the full shell:** If the registry pattern is right, adding types is mechanical. Doing them last means the early loops with the author can use multiple-choice content (easier to author), and the harder types come once the pipeline is proven.

**Exit criteria:** All three exercise types work in real sessions. A test-completo session of mixed types runs to completion.

### Phase F — Initial Content
**Goal:** Load the real PDFs into JSON.

1. Transcribe Avere → exercises.
2. Repeat for the other 5 categories.
3. Validate via lint script.

**Why last in the technical roadmap but parallel-able:** Content authoring is independent of the engine. Once Phase C is done, content can be authored in parallel with Phases D-E. **But the engine must be done first**, because content shape may change as the engine evolves, and you don't want to redo transcription.

### Dependencies Diagram

```
Phase A (domain core, pure)
    │
    ├──→ Phase B (persistence)
    │       │
    │       └──→ Phase C (type registry + first type + minimal runner)
    │               │
    │               ├──→ Phase D (full UI shell)
    │               │
    │               └──→ Phase E (other exercise types)
    │
    └──→ (content can begin authoring after Phase C, parallel to D/E)

Phase F (content) — parallel-able with D & E
```

### Recommended MVP Boundary

**MVP = A + B + C + minimal D + initial content for ONE category.**

That is: domain logic correct, persistence working, multiple-choice running end-to-end, category picker for one category, ~20-30 real Avere exercises. The author can immediately start using it, validate the loop, and discover what's actually missing — *before* you build the other two exercise types or the stats screen. This is the smallest version that delivers the core value ("que el sistema te obligue a no olvidar") for one topic.

---

## 12. Anti-Patterns

### Anti-Pattern 1: UI grades the answer
**What people do:** Compute correctness in the click handler of the multiple-choice button.
**Why it's wrong:** Couples UI to exercise shape. Adding a new exercise type means editing UI screens. Testing requires DOM.
**Do this instead:** UI dispatches `{ userInput }` to domain. `exercise-types/<type>.grade()` returns boolean. UI just renders green or red based on the result.

### Anti-Pattern 2: Streak counter computed from `dailyLog` on every render
**What people do:** "I'll just iterate the log each time I need the streak — it's cheap." It is cheap, but you'll get bugs when the log is incomplete (e.g. after import).
**Do this instead:** Streak is stored explicitly on the category and updated in one place: `applySessionResult`. `dailyLog` is for audit/debugging, not the source of truth.

### Anti-Pattern 3: Writing to localStorage on every answer
**What people do:** "Defensive — what if the browser crashes?"
**Why it's wrong:** Creates partial-session states with no clear semantics. Was this category "hecha" after exercise 5 but should be reset after exercise 12? You'll spend a week debugging.
**Do this instead:** Commit on session end. Treat a session as a transaction.

### Anti-Pattern 4: Merging on import
**What people do:** "If the user imports a backup, merge with current state to be safe."
**Why it's wrong:** Merge semantics are ambiguous (whose `streakDays` wins?). Bugs hide for months.
**Do this instead:** Import = replace with confirmation. The user knows what they're doing.

### Anti-Pattern 5: Resetting `exerciseStats` on fail-reset
**What people do:** "Fail-reset should reset everything — including the counters."
**Why it's wrong:** Loses history. The user wants to know "I've done this exercise 50 times" — the failure resets the category status, not the historical record.
**Do this instead:** `exerciseStats` is monotonic (always grows). `categoryProgress.clearedExerciseIds` is what gets reset.

### Anti-Pattern 6: Premature framework adoption
**What people do:** "Let's use React/Vue/Svelte — it's a SPA."
**Why it's wrong:** This app has 4-5 screens, <100 DOM events, no shared widgets, no server. Adding a framework adds a build step, bundler config, and dependencies for a benefit that doesn't materialize at this size. Violates the "double click and works" constraint from PROJECT.md.
**Do this instead:** Vanilla JS + ES modules. Maybe a tiny templating helper if string concatenation gets ugly. Re-evaluate only if a screen genuinely needs reactive state.

### Anti-Pattern 7: Treating `dailyLog` as bounded
**What people do:** Prune `dailyLog` after 30 days "to keep storage small."
**Why it's wrong:** Loses the ability to recompute streaks deterministically if a bug is found. Storage is not a problem (see §9 size estimate).
**Do this instead:** Keep `dailyLog` forever. It's the audit trail.

---

## 13. Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Domain | Plain function calls + callbacks | UI passes user input; domain returns booleans/new state. No events bus needed at this size. |
| Domain ↔ Storage | Pure function call (`saveState(newState)`) | Storage is dumb; domain decides when to write. |
| Domain ↔ Content | Read-only injection | Content is loaded once and passed to domain functions. Never mutated. |
| `exercise-types/*` ↔ UI | Through registry only | UI never imports specific type modules directly. |

### External Services

None. There are no external services. This is the architecture's biggest advantage — no APIs to mock, no auth, no network errors, no rate limits.

---

## Sources

- **PROJECT.md** (`.planning/PROJECT.md`) — explicit requirements, constraints, key decisions. Primary source for all design recommendations above. (HIGH confidence; author-authored.)
- **MDN — Web Storage API** — `localStorage` semantics, quota, storage event. Standard web platform behavior.
- **MDN — JavaScript Modules** — ES module loading from `file://` limitations.
- General single-page-app patterns for small-scale vanilla JS — well-established community practice; no single canonical source.

No external libraries are recommended; therefore no library docs were verified via Context7. (Confidence HIGH on the no-library recommendation — the app's complexity does not justify adding dependencies.)

---
*Architecture research for: single-user static quiz app with localStorage progress and strict-failure spaced repetition*
*Researched: 2026-05-23*
