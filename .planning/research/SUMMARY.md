# Research Summary — Italian Course

Synthesis of `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`. Consumed by REQUIREMENTS.md, ROADMAP.md, and phase planners.

## Executive Summary

This is a personal drill tool for one user studying Italian at A1/A2 — closest in spirit to Anki (single-user, file-based, minimalist) with Quizlet-style exercise variety, but without SRS, cloud, or accounts. The core mechanic that everything else serves: **answer wrong → all associated categories reset to `no hecha` → user must re-verify**. A 21-day per-category streak is the only gamification.

Recommended stack: **Alpine.js 3.15.x + Pico CSS 2.1.1 + vanilla ES modules, served via `npx serve`**. The "doble click y funciona" wish is architecturally incompatible with the rest of the requirements (Firefox blocks `localStorage` under `file://`, all browsers block `fetch()` of local JSON under `file://`, ES module imports fail under `file://`). One terminal command (`npx serve`, then bookmark `http://localhost:3000`) is the pragmatic trade-off.

The highest-risk parts are **not the UI** — they are domain logic: `applySessionResult()` (fail-reset cascade across multi-category exercises), `todayLocal()` (streak day-key, must use local clock not UTC), and the session sampler (minimum-one-per-category with weighted random fill). These must be built and unit-tested as **pure functions before any UI is wired**.

---

## Recommended Stack

**Primary:**
- **Alpine.js 3.15.x** — reactive UI directives via `x-data`/`x-model`, no build step, single CDN tag
- **Pico CSS 2.1.1** — classless CSS, auto dark mode, single CDN tag
- **Vanilla ES modules** — code organization, no bundler
- **localStorage** — single namespaced key `italianCourse.v1`, full state blob, write-once-per-session
- **`npx serve`** (or VS Code Live Server) — replaces `file://`; one command, then bookmark

**Hard rejections:**
- React/Vue/Svelte (build step, contradicts simplicity ethos)
- IndexedDB (async overhead unnecessary — data fits well under localStorage's 5 MiB)
- File System Access API (Firefox/Safari don't support it)
- Floating CDN versions (`@latest`) — pin exact versions, they break silently otherwise

**Open decision (must confirm in Phase 1):** `npx serve` vs true file:// double-click (which requires content as `.js` ES module exports, no `fetch()`). Recommendation: `npx serve`.

---

## Feature Scope

### Table stakes (v1 must have)
- Category dashboard (home): state badge + streak count + last-practiced date
- Session of 20 exercises with checkboxes to select categories
- Weighted random sampler: least-practiced-first, capped weight `1/(1+min(timesShown,10))`
- Three exercise types: multiple-choice fill-in-blank, word-button translation, click-to-match
- Binary green/red feedback (auto-advance on correct, click-to-advance on incorrect)
- Session progress indicator ("Ejercicio 7 / 20")
- **End-of-session summary with per-category state-change delta** (critical — without it the reset rule feels opaque)
- "Test completo" mode (all exercises in chosen categories)
- Fail-reset cascade applied at session end
- Daily practice ledger updated on session completion only
- 21-day per-category streak with visible counter
- JSON load errors shown visibly in UI (not silently in console)
- Export/import progress JSON for backup
- Keyboard input: 1-4 for MC, Enter, Space to advance
- Spanish UI strings

### Differentiators (v1.x after validation)
- JSON schema validation per exercise type
- "Last export" reminder banner (7+ days since last backup)
- Calendar heatmap of activity
- Per-category accuracy breakdown
- Per-exercise dev history view

### Deferred (v2+)
- In-app exercise editor
- Mobile responsive
- Sub-categories (finer granularity below a PDF)
- AI exercise generation from PDFs

### Anti-features (explicit reject — every one tracks to PROJECT.md exclusions)
- Undo last answer · Skip exercise · Hints/lifelines
- SRS algorithm (Anki-style) · Reduced frequency for dominated categories
- Free-text typed answers · Login/cloud/multi-user
- Audio · Mobile-first design · Badges/XP/gamification fluff
- Pedagogical explanations at correct/incorrect

---

## Recommended Phase Order

Multiple agents converged on this ordering. Domain logic first because it's the highest-risk and most testable without DOM.

| # | Phase | Outcome |
|---|-------|---------|
| 1 | **Foundation** — storage, content loader, JSON schema, NFC normalization, `dates.todayLocal()`, distribution decision (`npx serve` vs bundled) | App boots, loads JSON, renders error banner if content broken |
| 2 | **Domain core** — `progress.applySessionResult()` + `session.buildSession()` as pure functions with unit-test harness for fail-cascade, streak, sampler edge cases | Logic proven correct via simulated 30-day history before any UI |
| 3 | **Exercise types + E2E pipeline** — registry pattern, multiple-choice first (simplest), then word-buttons, then match. Minimal session screen wired end-to-end | Author can do a real session of Avere exercises by end of this phase |
| 4 | **Full UI shell** — home/dashboard, full session screen with all 3 types, end-of-session summary, stats, backup screen, hash router | App is feature-complete for the loop |
| 5 | **Polish & robustness** — multi-tab guard, "last export" banner, corruption defense, dark mode via `prefers-color-scheme` | Daily-driver quality |
| 6 | **Initial content** — transcribe the 6 PDF categories into `content/exercises/*.json` | Real material loaded, app usable for study |

Content phase can parallelize with phases 3-5 once JSON schema is locked in Phase 1.

---

## Top Pitfalls (must address by indicated phase)

1. **Streak day-key timezone** *(Phase 1)* — Use `getFullYear()/getMonth()/getDate()` (local clock), never `toISOString().slice(0,10)` (UTC). Single `todayLocal()` function used everywhere.
2. **Reset cascade model** *(Phase 2)* — Track `clearedExerciseIds: ExerciseId[]` per category. On fail: empty set + status `no-hecha` + streak 0. On correct: add ID; when set covers all exercises in category, status `hecha`. `exerciseStats` (times shown/correct/failed) is **monotonic** — never reset.
3. **`file://` distribution** *(Phase 1)* — Decide before writing code. Default: `npx serve`. Don't try to retrofit.
4. **JSON authoring typos** *(Phase 1)* — ASCII slug IDs, `categories.json` as registry, validator rejects unknown `categoryId` references.
5. **Per-answer localStorage writes** *(Phase 2)* — Write only on session completion. Session = transaction. Per-answer writes create undefined partial states.
6. **Weighted random collapse** *(Phase 2)* — Capped formula `1/(1+Math.min(timesShown,10))` keeps probability of seeing any single exercise from dominating.
7. **Reset cascade UX** *(Phase 4)* — No undo / no skip / no pre-reset confirmation (these soften the core mechanic and contradict the author's intent). Reframe regression positively in summaries: "Avere necesita revisión — 4 ejercicios pendientes". End-of-session summary is a full screen, not a dismissable toast.
8. **localStorage data loss** *(Phase 5)* — User has no backend; one CCleaner run wipes progress. "Last export" reminder banner after 7 days is the cheap safety net.
9. **Diacritic normalization** *(Phase 1)* — NFC normalize on load; matching/grading uses normalized strings. Italian è/à/ò copy-pasted from PDFs can introduce invisible variants.
10. **Multi-tab race** *(Phase 5)* — Cheap "single-tab guard" via storage event sentinel is sufficient for single-user.

---

## Open Questions for User (confirm before Phase 2)

1. **Distribution**: `npx serve` (recommended) vs content-as-JS-modules for true double-click `file://` boot?
2. **Streak on fail**: reset to 0 (strict, recommended) — confirm.
3. **`hecha` invalidation when JSON grows**: adding a new exercise to a `hecha` category implicitly returns it to `no hecha` until the new ex is cleared. Intended?
4. **Test completo abandon semantics**: discard / persist fails-only / resume on reopen? Recommended: resume for Test completo, discard for Repaso.
5. **Weight cap of 10**: confirms "least practiced first" intent without one exercise hogging the sample? (`1/(1+Math.min(timesShown,10))`)

These are surfaced again in REQUIREMENTS.md and resolved at phase planning if not now.

---

## Confidence

| Area | Level | Notes |
|------|-------|-------|
| Stack | HIGH | Versions verified against official docs; `file://` constraints verified against MDN + browser bug trackers |
| Features | HIGH | Table stakes drawn from Anki / Quizlet / Memrise; anti-features map 1:1 to PROJECT.md exclusions |
| Architecture | HIGH | Pure-function patterns + registry — well-established; all choices derive from explicit PROJECT.md requirements |
| Pitfalls | HIGH | Streak/TZ verified via MDN + Duolingo case studies; file:// via MDN/bugzilla; rest are direct observable failure modes |
| Per-category JSON vs single file | MEDIUM | Both work; per-category recommended but trivial to refactor |
