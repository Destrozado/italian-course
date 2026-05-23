# Feature Research

**Domain:** Personal language-learning self-quiz web app (single-user, local, desktop, Italian A1/A2)
**Researched:** 2026-05-23
**Confidence:** MEDIUM-HIGH (strong evidence from Anki/Quizlet/Duolingo patterns; LOW only on niche UX micro-decisions like animation timing)

## Domain Framing

This is NOT a Duolingo competitor. It is a **personal drill tool** — single user, local-only, no cloud, no social, content authored by hand in JSON. The author's stated ethos is *"nada muy sofisticado, es pura repetición y una gestión de los repasos automatizada."* That phrase is the filter for every feature below. Any feature that does not directly serve **"exercise → binary feedback → category re-verification loop"** is suspect.

The two dominant references in this niche are:
- **Anki** (deck-based SRS, minimalist, single user, file-based) — closer in spirit to this project
- **Quizlet** (multi-mode: Learn/Match/Test/Write, gamified, cloud, social) — closer in exercise variety

This app is "Anki-ethos with Quizlet-style exercise types, minus SRS, minus cloud, minus accounts."

## Feature Landscape

### Table Stakes (Users Expect These)

Features the single user will notice immediately if missing. Without these, the app feels broken or amateurish, even for personal use.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Session progress indicator** ("Ejercicio 7 / 20") | Every quiz/SRS app shows it (Anki, Quizlet, Duolingo). User needs to gauge effort remaining. Without it, sessions feel infinite. | S | Counter in header. Also useful for "test completo" mode where N is dynamic. Fits ethos. |
| **Binary visual feedback green/red on answer** | Already in spec; reaffirming. The user named this explicitly. Without it the loop has no closure. | S | Already specified. |
| **"Next" or auto-advance after feedback** | After seeing green/red, you need to move on. Either auto-advance after ~800ms or require Enter/click. | S | Recommend: auto-advance on correct (fast), require click on incorrect (give a beat to register the failure). Both lightweight. |
| **End-of-session summary** ("Acertaste 18/20, fallaste: Avere, Preposiciones") | Closes the loop. User needs to see which categories got reset and which advanced. Anki/Quizlet/Duolingo all do this. | S | List of category state changes is more valuable here than raw % score. The score number is generic; the **state delta** is the actionable info for this app. |
| **Category selection UI before session start** | Already in spec (checkboxes). Reaffirming as table stakes. | S | Already specified. Add "select all / clear all" buttons — five seconds to implement, saves clicks daily. |
| **Per-category overview / dashboard** | The user defined three states (no hecha / hecha / dominada) and a 21-day streak. He MUST be able to see, for each category: current state, streak day count, attempts total. Without this view, the state machine is invisible. | M | This is the home screen. Must show all categories at a glance. State as colored badge, streak as "12/21 días". |
| **State change indicator at session end** | If a category went from "hecha" to "no hecha" because of a failed exercise, the user needs to see it (red banner: "Avere reseteada por fallo en ejercicio X"). Otherwise the harsh reset rule will feel mysterious and frustrating. | S | This is the visible cost of the fail-all rule. Critical for the rule to feel fair instead of buggy. |
| **JSON load error reporting** | Content is hand-edited JSON. A typo silently breaking the app = hours debugging. Show a clear error: "exercises.json line 47: missing field 'answer'" or at minimum "JSON inválido". | S | `JSON.parse` throws with line info on modern V8. Catch and display in a visible banner, not console. Critical because content authoring IS the day-1 workflow. |
| **Export progress to JSON file (manual download)** | Already in spec. Reaffirming. localStorage is volatile (clear cookies, browser corruption, profile reset). Without export, all streaks vanish on one bad day. | S | Already specified. |
| **Import progress from JSON file** | Counterpart to export. Useless to have a backup you cannot restore. | S | Already specified. Confirm overwrite before applying. |
| **Keyboard input for answer selection** | Pressing 1/2/3/4 for multiple choice, Enter to confirm, Space for "next". The user is desktop-only and doing 20+ exercises daily — clicking is friction. Even non-power users adopt number keys instantly. | S | Just keydown listeners. Massive ergonomic win. |
| **Session can be abandoned without corrupting state** | If you close the tab mid-session, the in-progress session should not poison the streak (e.g. mark categories as "failed today"). Streaks should only update on **completed** sessions. | S | Persist session progress only on completion, not per-exercise. Or: persist with explicit "abandoned" flag that excludes from streak math. |

### Differentiators (Real Value-Add, Optional for v1)

Features that make the app meaningfully better but are not required to ship. Add post-MVP based on actual usage friction.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Calendar heatmap of practice days** | Anki's "Review Heatmap" plugin is one of its most beloved features. For a 21-day-streak app, seeing the streak visualized as a grid is highly motivating. Per-category practice frequency visible at a glance. | M | Use a small SVG grid, one square per day, color by exercises completed. ~150 LOC. Fits ethos (no external deps required). HIGH motivational value for a streak-based app. |
| **Per-category attempt/accuracy history** | "Avere: 47 attempts, 89% accuracy, last practiced 3 days ago." Already collecting attempts/correct/failed per exercise — aggregating to category is cheap. | S | Drilldown from category dashboard. Pure derived data, no new persistence. |
| **Per-exercise history view (dev/debug)** | When the author edits a JSON exercise and it suddenly starts failing 100% of the time, he needs to inspect: "Exercise ej-42: 12 attempts, 0 correct — am I marking the answer key wrong?" This is content-authoring debugging. | S | Sortable table behind a "dev" toggle. Hidden in normal use. |
| **JSON schema validation with helpful errors** | Beyond `JSON.parse` errors: also validate that each exercise has the expected shape for its type (multiple choice has `options`, match has `pairs`, etc.). Catches authoring mistakes before they reach the session. | M | Use Ajv or hand-rolled validator. Schema is ~30 lines. Worth it for hand-edited content. Distinguish "JSON broken" vs "JSON valid but missing required field for type=match" — the second is the high-value catch. |
| **"Last export" timestamp warning** | Banner: "Último backup hace 12 días. Exportar ahora." Single-user localStorage data is fragile; gentle nudges prevent loss. | S | Store last-export timestamp in localStorage itself (circular but acceptable). Show banner if > 7 days. Dismissable. |
| **Reset-confirmation dialog on category failure** | The "fail one exercise → reset N categories" rule is intentionally harsh. A momentary confirmation ("Vas a resetear: Avere, Género") is NOT recommended (it would soften the rule and undermine the design). Instead: a **post-reset** clear message. | — | Documented here to be **explicitly rejected** — the harshness is the feature. See Anti-Features. |
| **Sample exercise templates in the JSON file** | A commented "examples" section at the top of `exercises.json` showing the shape for each type. Author self-documents. Single best content-authoring helper. | S | Just a few example entries the author keeps for reference. No code. |
| **Filter/sort categories on dashboard** | Sort by: streak length, last practiced, state. As categories grow from 6 to 20+, this becomes useful. | S | Pure UI, no data work. |
| **"Skip to next session" if all categories are dominated** | Future state; not relevant for v1 since the user starts with zero dominated categories. | S | Defer until reached. |
| **Click-to-match interaction for match exercises** | Industry default is drag-and-drop, but click-to-select-then-click-to-pair is faster on desktop, keyboard-friendly, and far simpler to implement. Recommended for THIS app. | S | Avoids drag-and-drop accessibility/touch complexity that this app does not need. Pure click handlers. |
| **Visible focus rings for keyboard nav** | Tab through options, Enter to select. Power-user ergonomic. CSS-only. | S | `:focus-visible` styles, ~10 lines of CSS. Massive UX gain for keyboard answering. |

### Anti-Features (Commonly Built, Explicitly NOT For This User)

These are features that appear in nearly every public quiz/SRS/language-learning app — and which the user has explicitly excluded in PROJECT.md or whose ethos contradicts his stated philosophy. **Documenting them here so the planner does not drift toward them.**

| Feature | Why Tempting | Why Wrong For This App | Maps To User's Exclusion |
|---------|--------------|------------------------|--------------------------|
| **User accounts / login / authentication** | "Every app has it" | Single user, local machine, no cloud. Pure overhead. | PROJECT.md → "Multi-usuario / autenticación" out of scope. |
| **Cloud sync / cross-device sync** | "What if you switch laptops?" | Author works on one PC. JSON export is enough. Adding sync = backend = abandoning the doble-click-y-funciona stack. | PROJECT.md → "Cloud sync / hosting en internet" out of scope. |
| **Mobile/responsive design** | "Mobile is the future" | Desktop only by explicit decision. Adding responsive doubles UI surface area for zero v1 benefit. Defer until missed. | PROJECT.md → "Acceso desde móvil" out of scope. |
| **Free-text typed answer input** | "More realistic than multiple choice" | Requires accent normalization (è/é), synonym handling, case folding, typo tolerance — none of which the author wants to build. Match/MC/word-button input is deliberate. | PROJECT.md → "Respuesta libre escribiendo texto" out of scope. |
| **Pedagogical explanations on fail/correct** | "Apps should teach, not just test" | App is for **testing what's already learned** from the teacher's PDFs. Theory lives in the PDFs. Adding explanations duplicates that material and slows the loop. | PROJECT.md → "Explicaciones pedagógicas" out of scope. |
| **SRS algorithm (SM-2, FSRS, ratio-weighted scheduling)** | "Anki does it, it's the gold standard" | Author asked for simple "least-practiced first" weighting. The harsh reset rule already enforces revisitation. Layering SRS on top would conflict with the binary done/not-done state machine. | PROJECT.md → "SRS sofisticado (Anki-style, ratio fallos/aciertos ponderado)" out of scope. |
| **Reduced frequency for "dominated" categories** | "Why test what's mastered?" | The author explicitly wants dominated categories to keep appearing equally — that is the maintenance loop. | PROJECT.md → "Frecuencia reducida o eliminación de categorías dominadas" out of scope. |
| **In-app exercise editor / CRUD UI** | "Editing JSON is barbaric" | Author edits JSON comfortably. Building an editor is a whole second app. Defer until the manual flow actually hurts. | PROJECT.md → "UI de edición de ejercicios dentro de la web" out of scope. |
| **AI exercise generation from PDFs** | "Save hours of authoring" | Author wants curatorial control over content. Marked as future exploration. | PROJECT.md → "Generación de ejercicios con IA" out of scope. |
| **Badges, XP, trophies, level-up animations** | "Duolingo's secret sauce" | The user is intrinsically motivated by exam prep. The 21-day "dominada" mark IS the gamification. Adding XP/badges adds noise to a tool he wants minimal. | Implicit: "nada muy sofisticado" + only one motivation hook is specified (the 21-day streak). |
| **Sound effects / haptics on answer** | "Feedback should be multi-sensory" | Desktop, single user, likely studying with background noise of his own choice. Sound effects = annoying in adult deliberate practice. | Implicit: no audio mentioned in spec; ethos is minimal. |
| **Audio playback of Italian phrases (TTS or recorded)** | "Language learning needs audio" | A1/A2 grammar drilling (Avere, prepositions, gender) is text-based. Pronunciation is a different track of language learning, not this tool's job. If needed later: scope as separate feature, do not bake in. | Implicit: spec describes text-based exercise types only. |
| **Hints / "show one letter" / 50/50 lifelines** | "Reduces frustration" | Contradicts the failure-as-feedback loop. A hint is a soft fail that doesn't trigger the reset — undermining the core mechanic. | Implicit: contradicts "regla de fallo" design. |
| **Skip current exercise** | "Sometimes I'm stuck" | Same issue. Either you answer or the session is incomplete. Skipping would create undefined state in the streak/reset math. If you genuinely need to abandon, close the tab (and the abandoned-session rule handles it). | Implicit: contradicts the deterministic state machine. |
| **Undo last answer** | "What if I misclicked?" | Tempting but breaks the harsh-reset rule's integrity. If undo is allowed after a fail, the rule becomes negotiable. Better: accept that occasional misclicks are noise; the streak rule is forgiving (you only need 21 clean days, not 21 perfect ones across all categories). | Implicit: contradicts "regla de fallo". |
| **Pause/resume mid-exercise timer** | "Real life happens" | There is no timer in the spec — feedback is binary, not timed. Pause/resume adds state machine complexity for a non-existent constraint. | Implicit: no timing mentioned. |
| **Daily goal / streak-of-calendar-days (Duolingo-style)** | "Daily streaks drive engagement" | The user explicitly chose **per-category 21-day streak counted only on practiced-without-error days**, NOT calendar days. Adding a parallel calendar-day streak would conflict and confuse. | PROJECT.md key decision → "Racha de 21 días cuenta solo días practicados sin fallo". |
| **Leaderboards / social / sharing** | "Friends keep you accountable" | Single user. There is nobody else. | PROJECT.md → "Multi-usuario" out of scope. |
| **Notifications / reminders / email** | "Don't forget to practice" | Desktop static site, no backend, no service worker scope. The author opens the page when he wants. | Implicit: no server, no push. |
| **Multi-language UI (i18n framework)** | "Future-proofing" | Interface is Spanish, the author is hispanohablante. One language. Adding i18n machinery = framework for nobody. Just hardcode Spanish strings. | PROJECT.md constraint → "Idioma de la interfaz: español". |
| **Analytics / telemetry** | "Know how you use the app" | Single user, no internet, no privacy story to build. He can read his own JSON to see usage patterns. | Implicit: no server, no internet. |
| **Theme switcher / dark mode toggle** | "Users expect dark mode" | Use `prefers-color-scheme` CSS media query (zero JS, system-driven) if dark mode matters at all. A theme toggle is UI surface for no real benefit. | Implicit: ethos is minimal. Recommend system-driven, not toggleable. |

## Feature Dependencies

```
[Category dashboard]
    └──requires──> [Per-category state computation]
                       └──requires──> [Exercise → category mapping (already in spec)]

[End-of-session summary]
    └──requires──> [State change tracking during session]
                       └──requires──> [Per-exercise category list (already in spec)]

[21-day streak display]
    └──requires──> [Daily practice ledger per category]
                       └──requires──> [Session completion event (not per-exercise)]

[Calendar heatmap]
    └──requires──> [Daily practice ledger per category]
                       (shares dependency with streak)

[JSON schema validation]
    └──enhances──> [JSON load error reporting]
                       (both feed the same error banner)

[Keyboard input]
    └──enhances──> [Session UX]
                       (no new data, pure interaction layer)

[Last-export timestamp warning]
    └──requires──> [Export action persists timestamp]

[Click-to-match] ──CONFLICTS──> [Drag-and-drop matching]
    (pick one; recommend click for simplicity)

[Undo last answer] ──CONFLICTS──> [Fail-resets-category rule]
    (undo softens the rule; reject undo)

[Skip exercise] ──CONFLICTS──> [Deterministic session state]
    (skip creates "neither passed nor failed" state; reject skip)
```

### Dependency Notes

- **Daily practice ledger is the single most important derived data structure.** Both the 21-day streak and the heatmap derive from it. Get this right early: `{ [categoryId]: { [YYYY-MM-DD]: { practiced: true, errored: false } } }`.
- **Session completion event** must be the unit that updates the ledger, not per-exercise. Otherwise abandoned sessions corrupt streaks.
- **Per-exercise category list** already exists in the spec (each exercise tests N categories). Everything downstream — state transitions, streak math, fail-reset — depends on it being correctly modeled.

## MVP Definition

### Launch With (v1)

Minimum to make the loop functional and trustworthy. Cut anything that does not serve the core "test → fail → reset → re-verify" mechanic.

- [ ] **Category selection UI before session** — already in spec
- [ ] **Session of 20 random exercises, weighted by least-practiced** — already in spec
- [ ] **Three exercise types** (MC fill-in-blank, word-button translation, match columns) — already in spec
- [ ] **Click-to-match interaction** (not drag) — simpler, keyboard-friendly
- [ ] **Binary green/red feedback** — already in spec
- [ ] **Auto-advance on correct, click-to-advance on incorrect** — small ergonomic tweak
- [ ] **Session progress indicator (X/N)** — table stake
- [ ] **End-of-session summary with state-change list** ("Avere reseteada", "Preposiciones avanza a 12/21") — without this the rule is invisible
- [ ] **Per-category dashboard (state + streak + last practiced)** — the home screen
- [ ] **Fail-resets-all-categories rule applied immediately** — already in spec, core mechanic
- [ ] **Daily practice ledger persisted to localStorage** — foundation for streak/heatmap
- [ ] **21-day streak counter per category** — already in spec
- [ ] **"Test completo" mode** (all exercises of selected categories) — already in spec
- [ ] **JSON content loading with clear error reporting on parse failure** — protects content workflow
- [ ] **Manual export/import of progress JSON** — already in spec
- [ ] **Keyboard input** (number keys for MC, Enter to confirm, Space to advance) — cheap, high ergonomic win
- [ ] **Spanish UI strings, hardcoded** — already a constraint
- [ ] **Static HTML/CSS/JS, no build step required to open** — already a constraint

### Add After Validation (v1.x)

Add when the v1 loop is proven and friction is felt.

- [ ] **JSON schema validation beyond parse errors** — trigger: first time the author ships an exercise that loads but fails at render due to missing field
- [ ] **Calendar heatmap of practice days** — trigger: when streak counts feel abstract and the author wants visual motivation
- [ ] **Per-category accuracy/attempts breakdown** — trigger: when the author wants to know which categories are slipping
- [ ] **Per-exercise history view (dev mode)** — trigger: first time the author suspects a specific exercise is mis-keyed
- [ ] **"Last export" reminder banner** — trigger: first localStorage scare
- [ ] **Sample exercise templates in JSON file** — trivial; can ship in v1 if time permits
- [ ] **Visible focus rings + arrow key navigation** — trigger: keyboard use becomes habitual

### Future Consideration (v2+)

Defer until the loop has been used daily for weeks and concrete needs emerge.

- [ ] **In-app exercise editor** — only if JSON authoring becomes painful at scale (50+ exercises)
- [ ] **Mobile responsive layout** — only if author actually wants mobile practice
- [ ] **Sub-categories within a PDF** — only if a single PDF turns out to be too coarse
- [ ] **Audio for pronunciation exercises** — only if pronunciation becomes a learning need (separate scope)
- [ ] **AI-assisted exercise generation from PDFs** — only after content authoring proves to be the bottleneck

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Per-category dashboard with state/streak | HIGH | LOW | P1 |
| End-of-session state-change summary | HIGH | LOW | P1 |
| JSON parse error visible in UI | HIGH | LOW | P1 |
| Session progress indicator (X/N) | HIGH | LOW | P1 |
| Keyboard input (number keys, Enter) | HIGH | LOW | P1 |
| Click-to-match (vs drag) | HIGH | LOW | P1 |
| Export/import progress JSON | HIGH | LOW | P1 |
| Daily practice ledger persistence | HIGH | LOW | P1 |
| JSON schema validation (beyond parse) | MEDIUM | MEDIUM | P2 |
| Calendar heatmap | MEDIUM | MEDIUM | P2 |
| Per-category accuracy/attempts breakdown | MEDIUM | LOW | P2 |
| Per-exercise history view (dev mode) | MEDIUM | LOW | P2 |
| Last-export reminder banner | MEDIUM | LOW | P2 |
| Sample exercise templates | LOW | LOW | P2 (free) |
| Filter/sort categories on dashboard | LOW | LOW | P3 |
| Visible focus rings + arrow nav | MEDIUM | LOW | P2 |
| Drag-and-drop matching | LOW | MEDIUM | P3 (reject) |
| Audio playback | LOW | HIGH | P3 (reject for v1) |
| Theme toggle | LOW | LOW | P3 (use prefers-color-scheme instead) |
| Undo / Skip / Pause | NEGATIVE | LOW | REJECT (conflicts with rule) |
| SRS algorithm | NEGATIVE | HIGH | REJECT (out of scope) |
| Login / cloud sync | NEGATIVE | HIGH | REJECT (out of scope) |
| Badges / XP / gamification fluff | NEGATIVE | MEDIUM | REJECT (out of scope) |

**Priority key:**
- P1: Must have for v1 launch
- P2: Add post-launch when friction or motivation calls for it
- P3: Future, low-confidence value
- REJECT: Documented anti-feature; do not add

## Competitor Feature Analysis

| Feature | Anki | Quizlet | Duolingo | Our Approach |
|---------|------|---------|----------|--------------|
| Exercise types | Cards (recall, type, cloze) | Learn/Match/Test/Write | MC, listen, translate, match | MC fill-in-blank + word-button translation + match — fixed set, no expansion |
| Feedback | Self-rate (Again/Hard/Good/Easy) | Right/wrong + explanation (PLUS) | Right/wrong + explanation + heart loss | Binary green/red, no explanation |
| Scheduling | SM-2 / FSRS | Simple LCM-style | Crown levels + spaced practice | "Least practiced first" weighting + harsh reset on fail |
| Mastery indicator | Per-card maturity (young/mature) | Color-coded mastery (red/yellow/green) | Crowns per skill | Three discrete states: no hecha / hecha / dominada |
| Streak | Per-day calendar streak | Per-day calendar streak | Daily calendar streak (the famous one) | Per-category 21 practiced-and-clean days |
| Heatmap | Yes, via popular plugin | No | No (annual review only) | Differentiator if added; not v1 |
| Content authoring | TSV import, plugins, GUI | In-app set creation | None (content is locked) | Hand-edited JSON, no GUI |
| Storage | SQLite local + optional sync | Cloud, account-bound | Cloud, account-bound | localStorage + manual JSON export |
| Audio | Optional per-card | Optional per-card | Heavy (core to product) | None |
| Multi-user | No (single profile, can have multiple) | Yes (accounts) | Yes (accounts) | No |
| UI customization | Heavy (CSS-editable card templates) | Light | None | Hardcoded Spanish, minimal CSS |

**Pattern observed:** the more an app moves toward consumer/mass-market (Duolingo > Quizlet > Anki), the more it adds account systems, social features, gamification noise, and content lock-in. Moving in the **opposite direction** (more Anki-ethos, less Quizlet-ethos) is the right vector for this project.

## Confidence Assessment

- **Table stakes claims:** HIGH confidence — patterns observed consistently across Anki, Quizlet, Duolingo, Memrise, multiple vocabulary trainers.
- **Anti-features mapping to user exclusions:** HIGH confidence — all anti-features are either directly listed in PROJECT.md Out of Scope or contradict explicit Key Decisions / "nada muy sofisticado" ethos.
- **Click-vs-drag matching recommendation:** MEDIUM confidence — industry default is drag-and-drop, but for desktop-only single-user keyboard-friendly app, click is objectively simpler. Defensible.
- **Heatmap as differentiator:** MEDIUM confidence — Anki community loves the Review Heatmap plugin specifically because base Anki lacks it; analogous appeal expected here.
- **Auto-advance timing (800ms etc.):** LOW confidence — micro-UX detail. Author should tune by feel after first use.
- **Session-completion-only ledger updates:** HIGH confidence — required for correctness of streak math regardless of UX preferences.

## Sources

- [Anki vs Quizlet 2026 comparison — okti Blog](https://okti.app/en/blog/anki-vs-quizlet-best-alternative-2026/)
- [Anki vs Quizlet — Flexi Classes](https://flexiclasses.com/mandarin/anki-vs-quizlet/)
- [Quizlet vs Anki — Coursebox AI](https://www.coursebox.ai/blog/quizlet-vs-anki)
- [AnkiBuddy custom practice add-on (MC/Match/Written for Anki decks)](https://forums.ankiweb.net/t/ankibuddy-custom-practice-official-thread/22078)
- [Review Heatmap plugin for Anki — Polyglossic](https://www.polyglossic.com/review-heatmap-anki-plugin/)
- [Review Heatmap indicators discussion — Anki Forums](https://forums.ankiweb.net/t/review-heatmap-interpretation-of-indicators/38631)
- [Space: Spaced Repetition (streaks, rest days, vacation mode)](https://apps.apple.com/us/app/space-spaced-repetition/id1546202212)
- [Top 7 gamified learning apps with progress tracking — QuizCat](https://www.quizcat.ai/blog/top-7-gamified-learning-apps-with-progress-tracking)
- [UX Case Study: Duolingo — Usability Geek](https://usabilitygeek.com/ux-case-study-duolingo/)
- [Progress indicator UX best practices — Eleken](https://www.eleken.co/blog-posts/progress-indicator-ux)
- [Drag and drop UI examples and UX tips — Eleken](https://www.eleken.co/blog-posts/drag-and-drop-ui)
- [Drag-and-drop matching plugin for Moodle](https://moodle.org/plugins/qtype_ddmatch)
- [JSON Schema validation guide 2026 — Go Tools](https://go-tools.org/blog/json-schema-validation-complete-guide)
- [Ajv JSON Schema validator](https://json-schema.org/)
- [VoCat — vocabulary trainer with calendar view of study history](https://apps.apple.com/us/app/vocat-my-own-vocabulary/id1538546706)
- [Wokabulary — self-managed vocabulary with tags/categories](https://wokabulary.com/)
- [Keyboard accessibility for power users — Accesify Blog](https://www.accesify.io/blog/keyboard-shortcuts-accessibility-features/)
- [localStorage export/import patterns — Medium (QJ Li)](https://medium.com/@qjli/daily-coding-tips-41-very-useful-localstorage-sessionstorage-import-export-tool-2f20fe6010c7)

---
*Feature research for: personal Italian A1/A2 self-quiz web app*
*Researched: 2026-05-23*
