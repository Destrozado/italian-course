# Pitfalls Research

**Domain:** Static personal language-learning quiz web app (single-user, localStorage, hand-edited JSON content, custom reset-cascade + 21-day streak mechanics)
**Researched:** 2026-05-23
**Confidence:** HIGH on streak/timezone, file:// runtime, JSON authoring, diacritics, reset-cascade UX (verified with multiple sources + lived patterns from Duolingo/SRS designs). MEDIUM on localStorage quota math for THIS app's data shape (quotas are well-known; growth projections are estimates).

> Scope reminder: this is a **single user, single machine, desktop, no backend** tool. Many "generic web pitfalls" (XSS, auth, multi-user races) are not relevant. The pitfalls below focus on what can actually break THIS app: the reset cascade, the 21-day streak, the localStorage bet, the hand-edited JSON content workflow, and the file:// runtime promise.

---

## Critical Pitfalls

### Pitfall 1: Local-midnight streak rollover loses the 21-day streak silently

**What goes wrong:**
The user practices "today", but the app's day-key (e.g. `2026-05-23`) is computed differently than expected, so a session done at 23:58 and another at 00:02 either count as the same day (streak doesn't advance) or as two days (streak progresses without the user practicing twice). When the user travels (e.g. weekend trip to a different timezone), a session done abroad at "local Saturday 22:00" is recorded as Sunday in the original TZ — and Monday morning back home, the streak shows a gap.

**Why it happens:**
Three subtly different "today" definitions coexist in any JS app:
1. `new Date().toISOString().slice(0,10)` → UTC date (wrong for Europe in evenings).
2. `new Date().toLocaleDateString()` → locale-formatted, but uses **system clock TZ at that moment**, which changes when the laptop moves.
3. `new Date().toDateString()` → also TZ-dependent.

Duolingo, the canonical example, locks the streak to the account-creation TZ and many users lose streaks specifically because of this. The bug is not in the streak counter — it's in the **day-key derivation**.

**How to avoid:**
- Pick **one** day-key function and use it everywhere: `dayKey(date) = local YYYY-MM-DD from date.getFullYear()/getMonth()/getDate()` (no UTC, no toISOString).
- Store the streak as `{ lastPracticedDayKey, streakDays }` per category. On each successful exercise: if `dayKey(now) === lastPracticedDayKey` do nothing; if `dayKey(now) === dayKey(lastPracticedDayKey + 1 day)` increment; else **reset to 1** (not 0 — today counts).
- Define the "day rollover" explicitly in code with a comment: "a day is the local civil date as displayed by the OS clock at the moment of practice". Document that travel may cost a day; that is the lesser evil vs. weird TZ math.
- Do **not** offer a "configure day-start hour" feature in v1 — adds complexity for a one-user app.

**Warning signs:**
- Two sessions on the same evening across midnight that count as one day-of-streak (or two).
- The streak number changes without a session being completed (just opening the app).
- Manual test: do a session, advance system clock by 25 hours, open app — streak should still be intact (1 day passed); advance by 49 hours — streak should reset for that category.

**Phase to address:**
**Early (Phase 2 / data + scheduler).** This is the heart of the "domination" mechanic. Get it right before there is any meaningful streak history to break.

---

### Pitfall 2: Reset cascade creates an unsolvable "what is 'hecha' anymore" state

**What goes wrong:**
The user has 5 categories all marked `hecha`. They start a 20-exercise session that touches all categories. Exercise #7 is tagged with 3 categories (Avere + Género + Preposiciones) and they fail it. Per the strict rule, all 3 categories reset to `no hecha`. But:
- The remaining 13 exercises in the session may include other multi-category exercises that, even if passed, **cannot mark a category as `hecha` again** mid-session because there's no guarantee every exercise in the category was covered.
- The user finishes the session having "completed" 19/20 and yet now sees 3 categories regressed. Demoralizing.
- Worse: some exercises tagged `Avere + Preposiciones` were already covered before the fail and still count as "done in this session". Are they re-credited? Re-required?

**Why it happens:**
The reset rule is global ("the category resets"), but `hecha` is a derived state ("all exercises in this category have been passed without failing any of them since last reset"). The "since last reset" bookkeeping must be **per-category, per-exercise**, not per-session.

**How to avoid:**
- Model state explicitly: each exercise stores `{ passedSinceCategoryReset: { [categoryId]: boolean } }`. When category X resets, set `passedSinceCategoryReset[X] = false` for every exercise tagged with X.
- A category is `hecha` ⟺ every exercise tagged with that category has `passedSinceCategoryReset[X] === true`.
- This means **passing a multi-category exercise sets the flag for ALL its categories**, and failing it clears the flag (and triggers the reset cascade) for ALL its categories. Symmetric and predictable.
- In the UI, after a session, show a per-category diff: "Avere: was `hecha`, now `no hecha` because failed `ex_42` (3 ejercicios pendientes para recuperar)". The user needs to **see why** the regression happened.
- Confirm the 21-day streak rule: a fail resets the *category* state to `no hecha`, but does it reset the *streak*? The PROJECT.md says streak = "días en los que practicaste esa categoría y no fallaste" — so a day with a fail in that category does NOT count toward the streak, but doesn't necessarily wipe the existing streak. Decide explicitly: **fail → streak resets to 0** (strict, matches the "domination" spirit) vs. **fail → today doesn't count but yesterday's count survives** (lenient). Recommend strict, given Core Value.

**Warning signs:**
- The user asks "why is this category still showing `no hecha`, I just passed everything?" — means the `passedSinceCategoryReset` map is out of sync with the exercise pool.
- After failing one multi-category exercise, you discover other categories are stuck `no hecha` because of exercises that exist in JSON but never appeared in any session (the user never had a chance to pass them).
- Adding a new exercise to JSON silently moves a previously `hecha` category back to `no hecha` (correct behavior — but must be visible).

**Phase to address:**
**Early (Phase 2 / state machine).** This is the second-most-important mechanic after the day-key. Build a small test harness with 3 fake categories and 5 fake exercises and walk through every transition before building any UI.

---

### Pitfall 3: "Minimum 1 exercise per category" is structurally ambiguous with multi-category exercises

**What goes wrong:**
User picks 6 categories. Session size = 20. The selector picks one exercise tagged `Avere + Género`, which already covers 2 of the 6 categories — now does it owe 4 more or 5 more "minimum 1" picks? After 4 multi-category exercises (each covering 2-3 cats), the constraint is "satisfied" with only 4 exercises, but 16 slots remain. Filled how? With weighted random — but the weighting is across the whole pool of selected categories, biasing toward whichever has more `veces realizadas = 0` exercises.

Worst case: a "minimum 1 per category" interpreted naively as "pick 1 exercise from each category" can pick the **same exercise 3 times** if it's tagged with 3 selected categories.

**Why it happens:**
The constraint is set-cover, not selection. "Cover all selected categories" ≠ "pick N exercises from each category".

**How to avoid:**
- Define the contract explicitly: "the session must contain at least one exercise tagged with each selected category; remaining slots are filled by weighted random sampling **without replacement** from the union of all exercises in selected categories."
- Implementation order:
  1. Greedy set-cover: for each selected category not yet covered, pick the least-practiced exercise that covers it (and possibly others). Mark exercise as in-session.
  2. Fill remaining slots: weighted sample without replacement from `(union of exercises in selected categories) minus (already-in-session)`.
- If the pool is smaller than 20 exercises total, the session is shorter — don't loop forever trying to reach 20. Show "Sesión de N ejercicios (no hay más disponibles)".
- If a selected category has **zero exercises** in JSON (typo in catId, empty PDF imported), warn at session-start, not after generation.

**Warning signs:**
- The same exercise appears twice in a session.
- "Minimum 1 per category" silently violated when a category has 0 exercises tagged with it.
- Session generation takes >100ms (sign of a retry loop trying to satisfy unsatisfiable constraints).
- The first exercise of every session is always the same one (deterministic least-practiced when one exercise has `veces=0` and the rest have `veces≥1`).

**Phase to address:**
**Mid (Phase 3 / session generator).** Must come after the data model (Pitfall 2) is stable. Write the algorithm as a pure function with seedable randomness so it can be unit-tested with fixed scenarios.

---

### Pitfall 4: Weighted random with `1 / (veces_realizadas + 1)` collapses to deterministic when one exercise is far behind

**What goes wrong:**
Weighting "less practiced = more likely" sounds fine. But if the user just added 5 new exercises to category Avere (all `veces=0`) and the rest have `veces=10+`, the weights become `1` vs `1/11`. The 5 new exercises dominate every session for weeks until they catch up, while the established exercises are barely sampled — meaning the "domination" verification of old material atrophies.

Conversely, if every exercise has `veces ≈ 50`, the weights are all `~1/51` — essentially uniform, and the prioritization does nothing.

**Why it happens:**
Linear inverse weighting has poor dynamic range. The ratio of "most-likely" to "least-likely" is unbounded when veces=0 exists, and approaches 1 (no signal) as everything grows.

**How to avoid:**
- Use `weight = 1 / (1 + Math.log1p(veces_realizadas))` or a capped formula like `weight = 1 / (1 + Math.min(veces_realizadas, 10))`. This bounds the ratio between most/least sampled to ~11x even when one is at 0 and another at 100.
- Alternative: stratified — split exercises into "veces=0" (cold), "veces<median" (warm), "veces≥median" (hot) and pick e.g. 50%/30%/20%. Simpler to reason about.
- Always include a tiny epsilon so no exercise has probability zero: every exercise must have a non-trivial chance of being picked even if it's the most-practiced.
- Log the weight distribution during dev (console.table) so the author can see "ex_3 → 18%, ex_12 → 14%, ex_7 → 0.2%" and adjust.

**Warning signs:**
- After 2 weeks of use, the user reports "I keep seeing the same exercise". Check distribution.
- A category that's been `hecha` for a while never appears in sessions again (means weight collapsed to ~0).
- Adding new exercises makes old ones effectively invisible.

**Phase to address:**
**Mid (Phase 3 / session generator).** Same phase as Pitfall 3. Pick the formula, document it as a Key Decision in PROJECT.md, make it a single named function so it's easy to tune later.

---

### Pitfall 5: localStorage data loss / quota silently breaks the only persistence layer

**What goes wrong:**
Three failure modes, in order of likelihood:
1. **User clears browsing data** (or runs CCleaner, or "clear cookies and site data") → progress is wiped. No backend means no recovery.
2. **Browser corrupts localStorage** (rare but happens after crashes, particularly on Chrome with multiple profiles) → app loads with partial JSON, parsing throws, app shows empty state.
3. **Quota exceeded** — Chrome/Firefox enforce ~5-10 MB per origin. With per-exercise counters + daily log + per-category streak history, growth is small (single user), but if the author logs *every individual session event* (`{date, exerciseId, correct, ts}`) for years, it can grow into the MB range.

A subtler failure: opening the app from `file:///C:/.../index.html` vs `file:///C:/.../subdir/index.html` produces **different localStorage origins** — the user could "lose" their progress just by moving the folder or accessing via a slightly different URL.

**Why it happens:**
localStorage is "best effort" by spec — the browser can evict it under pressure and the user can clear it any time. Origins for `file://` URLs are notoriously fragile across browsers (some treat each file as opaque/null origin).

**How to avoid:**
- **Wrap every write in try/catch** for `QuotaExceededError` and surface a visible warning ("Almacenamiento lleno — exporta tu progreso").
- **Periodic backup reminder**: on every Nth session-end (e.g. every 7 days), show a non-blocking banner: "Han pasado 7 días desde tu último backup. ¿Exportar JSON?" with a one-click download. Track `lastBackupDate` in localStorage itself.
- **Auto-snapshot to download** at major milestones (a category reaches `dominada`). Generates a date-stamped `.json` the user can stash in Dropbox/Drive.
- **Cap the daily log size**: keep a `last 365 days` rolling window for per-day practice records; older days can be aggregated to monthly summary or dropped. Streak math only needs `lastPracticedDayKey` per category, not the full history.
- **Pick a stable storage path**: serve from a fixed folder, document the URL/path the user should bookmark. If the author moves the folder, do an explicit `migrate-from-json-file` flow rather than trust localStorage.
- **Schema-version every write**: top-level object has `{version: 1, ...}`. On load, if `version` is missing or unknown, show "datos en formato no reconocido — importa tu último backup" rather than silently rewriting.

**Warning signs:**
- The "estado de las categorías" panel shows everything as `no hecha` after launch and the user knows that's wrong.
- `JSON.parse` throws on app start (visible in DevTools console).
- The export button produces an empty/tiny file.
- Quota warning shows in DevTools storage tab approaching 5MB.

**Phase to address:**
- **Early (Phase 1 / persistence layer):** wrap localStorage in a typed `Storage` module with `load() / save() / export() / import()`, schema version field, and quota-handling. No raw `localStorage.setItem` anywhere else.
- **Mid (Phase 4 / UX polish):** add backup reminder banner.
- **Ongoing:** every schema change bumps the version and adds a migration entry.

---

### Pitfall 6: `file://` protocol breaks the "doble click y funciona" promise

**What goes wrong:**
The author saves `exercises.json` next to `index.html`, opens index.html via double-click, and the page is blank. Reasons depending on browser/version:
- `fetch('./exercises.json')` from `file://` is blocked in Chrome by default (origin `null`, CORS denial).
- ES modules (`<script type="module">`) are blocked from `file://` in some Chrome configurations because module CORS is strictly enforced.
- `import` statements that reach across files fail under `file://` for the same reason.
- IndexedDB works on `file://` in most browsers BUT may have quirks; localStorage works but origin is treated as opaque/null.

**Why it happens:**
Browsers tightened `file://` restrictions over the years for security. The original "open an HTML file and run JS" workflow is increasingly restricted, especially for modular code.

**How to avoid:**
- **Bundle to a single self-contained HTML file** for distribution: inline the CSS, inline the JS, and inline `exercises.json` as a `<script id="exercises" type="application/json">…</script>` block (or as a JS literal). One file, double-click, works. This is the most robust path for THIS app's "no server" constraint.
- Alternatively: ship a tiny `start.bat` (Windows) / `start.sh` that runs `python -m http.server 8000` and opens the browser. Breaks the "no processes" promise — only acceptable as fallback.
- **Use no ES modules** in the runtime distribution, or compile them out. Classic `<script>` tags load fine from `file://`.
- **No `fetch()` of local files** in v1. If exercises must be in a separate JSON for hand-editing, build step concatenates `exercises.json` into `app.html` at "deploy" time (even if "deploy" is just `cat`).
- **Test on the actual target browser** (the author's daily driver — Chrome? Firefox?) before declaring "done". `file://` behavior differs between them.

**Warning signs:**
- Opening the file shows a blank page; DevTools console shows `CORS` / `origin null` errors.
- `import` statements throw in console.
- Works in Firefox but not Chrome (or vice versa).
- `window.localStorage` is null/undefined (some `file://` contexts disable it).

**Phase to address:**
**Phase 1 (foundation).** Decide the distribution model BEFORE writing any code. If single-file-HTML, set up a trivial bundler (esbuild / a one-line shell script) from day one — retrofitting later is painful.

---

### Pitfall 7: Hand-edited JSON typos silently break the data model

**What goes wrong:**
The author adds an exercise to `exercises.json`. They type `"category": "Avere"` in one exercise and `"category": "avere"` (lowercase) in another. The app treats these as two different categories. A "phantom category" appears in the UI, and the real Avere is missing exercises it should have. Or they tag an exercise with `["Avere", "Genero"]` instead of `["Avere", "Género"]` (no accent) — and the multi-category linking silently breaks.

Other JSON pitfalls:
- Trailing comma → entire file fails to parse → app starts empty.
- Mismatched quotes (smart quotes from copy-paste) → same.
- Missing required field (no `id`, no `prompt`) → exercise crashes the rendering.
- Duplicate `id` across exercises → counters get conflated.
- Multi-choice exercise with the "correct" answer not actually in the options array.

**Why it happens:**
JSON has no built-in schema enforcement; hand-editing has no IDE-level validation unless explicitly configured. The author is editing in their natural workflow ("una categoría = un PDF, ejercicio a ejercicio") and the cost of a typo is invisible until session generation surfaces it.

**How to avoid:**
- **Ship a JSON schema** (`exercises.schema.json`) and reference it from the JSON via `"$schema": "./exercises.schema.json"`. VS Code auto-validates on save and underlines errors.
- **Define category IDs in a separate top-level array** (`"categories": [{"id": "avere", "label": "Avere"}, ...]`) and reference them by ID in exercises. The app validates that every `category` value in an exercise exists in the `categories` array — phantom IDs are rejected at load time with a visible error.
- **On app load, run a validator pass** and dump errors to a dedicated panel: "5 errores en tu JSON: ex_12 → categoría 'Genero' no existe (¿quisiste decir 'genero'?), ex_23 → respuesta correcta no está entre las opciones, ex_8 → id duplicado". App refuses to start a session if there are blocking errors but shows the diagnostics.
- **Author workflow**: a tiny "validate" page (`validate.html`) that drag-drops a JSON file and reports issues. Lets the author validate before committing.
- For diacritics: normalize all category IDs to lowercased ASCII-only slugs (`avere`, `genero-y-numero`, `verbos-movimiento`). Display labels can be `"Género y Número"`. IDs in JSON never carry accents.

**Warning signs:**
- A "ghost" category appears in the UI with 1-2 exercises.
- Adding an exercise doesn't change the count of any category.
- Failing an exercise resets fewer categories than expected (because one was typo'd and didn't match).
- JSON file opens blank/empty in the app — likely parse error in console.

**Phase to address:**
**Phase 1 (data model)** for the schema definition; **Phase 2 (load/validate)** for the validator pass. Author has to live with this from day 1 — bad foundations bake in bad data.

---

### Pitfall 8: Diacritic mismatches in matching/display ("è" vs "e" + combining grave)

**What goes wrong:**
The author copies a sentence from a PDF: `"Lui è italiano"`. The copy-paste introduces NFD-form `e` + combining U+0300, even though it visually identical to NFC-form `è`. In a match-columns exercise where the user clicks the right answer and the code compares strings with `===`, the comparison fails — the user sees red for a "correct" answer.

In multiple-choice exercises this is invisible (you click the option, JS uses the object reference). But in:
- Word-construction exercises where you assemble a sentence from buttons (each button is a string), the comparison `assembled === expected` is brittle.
- Future expansion to typed answers (out-of-scope today, but the author may add it later).
- Search/filter UIs.

Italian-specific characters: `à è é ì í ò ó ù`. PDFs especially are notorious for emitting NFD or mixed-form text. Some PDFs also emit non-breaking spaces (U+00A0) where regular spaces are expected.

**Why it happens:**
JS string equality is byte-level; visually identical strings can have different code-point sequences. Copy-paste from PDFs is the main vector. Even within Italian content from different sources, you'll see mixed NFC/NFD.

**How to avoid:**
- On JSON load, **normalize every string** to NFC: `obj.prompt = obj.prompt.normalize('NFC')` recursively across the loaded data. Run in the validator pass.
- For comparisons in word-construction exercises, also `.normalize('NFC').trim()` on assembled answers before comparing. Optionally strip non-breaking spaces: `.replace(/ /g, ' ')`.
- **Diacritic-insensitive matching is OFF by default** — for an A1/A2 Italian course, accents matter pedagogically (`e` vs `è` are different words). Do not strip diacritics during answer checking. Only consider it if a "lenient mode" is requested.
- For exercise IDs and category IDs, **forbid non-ASCII characters in the schema** (slugs only). Display labels can be full Italian text.

**Warning signs:**
- Author reports "I clicked the right answer and it showed red".
- Same word in two different exercises sorts differently in a list.
- `string.length` doesn't match what you'd expect (composed `è` is length 1, decomposed `è` is length 2).
- `console.log(str.charCodeAt(0))` returns a different value than expected.

**Phase to address:**
**Phase 1 (load pipeline).** Normalize-on-load is a one-line policy that prevents a whole class of bugs. Cheap insurance.

---

### Pitfall 9: Multi-tab same-app race condition corrupts state

**What goes wrong:**
The author has the app open in two tabs (left it open from yesterday, opened a fresh one today). Both tabs read the same localStorage on load. The user practices in Tab B; state gets saved. They switch to Tab A (which has stale in-memory state), do another exercise — Tab A's save overwrites Tab B's progress entirely. The streak update and reset cascade from Tab B are lost.

**Why it happens:**
localStorage has no locking. Each tab keeps its own in-memory copy of the state and writes the whole blob on save (typical pattern). Last-writer-wins clobbers updates made elsewhere. The `storage` event fires across tabs but only if you wire it up.

**How to avoid:**
**Cheap defense (recommended for v1)**: detect multi-tab on startup with a sentinel key + storage event, and refuse to start a session in the second tab. Show "Esta app está abierta en otra pestaña. Cierra la otra antes de continuar." Acceptable UX for a single-user tool.
- Implementation: on load, write `last-open: <random-token>` to localStorage and listen for `storage` events. If another tab writes a different token, it's a competing tab. Both tabs alert.
- BroadcastChannel API is a cleaner alternative if the target browser supports it (all modern browsers do).

**More expensive defense (not needed v1)**: per-key partial writes + storage-event listening to merge changes. Overkill for a single-user app.

**Warning signs:**
- "I did 30 exercises yesterday but the app only remembered 15."
- Streak resets to 1 unexpectedly.
- Author has multiple browser tabs and a habit of leaving the app open.

**Phase to address:**
**Phase 4 (polish / robustness).** Not blocking for MVP — the author probably won't run two tabs often. But add the single-tab guard before the app sees real daily use to prevent silent data loss.

---

### Pitfall 10: Long "Test completo" sessions exhaust motivation and never finish

**What goes wrong:**
Author selects 6 categories with ~25 exercises each → "Test completo" → 150 exercises in a single session. Half-way through they get tired, accidentally fail one — three categories cascade-reset — they close the tab. The cascading resets from the partial session are persisted, the long-session investment is wasted, and the next day they see *more* `no hecha` than before they started. Net negative motivation.

**Why it happens:**
The "Test completo" feature has no batching, no pause-and-resume, no early-exit semantics. Fatigue is real in language learning, especially when failure is punitive (3 categories reset from one mistake).

**How to avoid:**
- **Persist session progress incrementally**: every answered exercise updates state immediately. If the user closes the tab, they can resume from where they left off (next launch shows "tienes una sesión inacabada de X/Y ejercicios — ¿continuar?").
- **Show progress prominently**: "12/150 — estás en la categoría Avere" with an estimate ("~8 min restantes").
- **"Cierra y guarda" button** (not just "abandon"): explicitly ends the session, keeps the answers given so far, and applies cascades only for completed exercises. Failures registered so far still count.
- **Suggest a break threshold** in UI: after 50 exercises in one session, prompt "¿Pausa? Tu progreso está guardado." Non-blocking.
- **Consider a per-category Test completo** (one category at a time) as the default UX instead of multi-category mega-sessions. The author can still pick "All" if they want.
- **Frame cascades positively in the post-session screen**: "Has fallado 1 ejercicio en Avere — repítela. El resto de tu progreso intacto." Avoid emphasizing the regression number.

**Warning signs:**
- Test completo sessions are started but never completed (check via session-start timestamps vs. session-end).
- Author stops using the app for several days after a bad session.
- Streak drops to 1 repeatedly because the user gives up mid-session.

**Phase to address:**
**Phase 4 (UX polish).** The save-on-every-answer pattern is also useful for crash recovery. Build it in even if the explicit "pause/resume" UI comes later.

---

## Technical Debt Patterns

Shortcuts that look reasonable but bite later in THIS app.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Raw `localStorage.setItem` calls scattered throughout code | "Just save it real quick" | Quota errors swallowed silently; no schema versioning; impossible to add migration when fields change | **Never.** Wrap from day 1 — it's 30 lines of code. |
| No JSON schema (just hand-edit and pray) | Author can start adding exercises immediately | Typos in category IDs create phantom categories; reset cascade misses categories; debugging takes hours per incident | Acceptable for the first 5-10 exercises before more land. Add schema before category count > 3 or exercise count > 20. |
| Storing the full daily practice log forever | "Maybe we'll want history later" | localStorage quota; serialization slowdown; backups become large | Acceptable in v1 if rolling-window cap (e.g. 365 days) is documented as a follow-up. Add cap before second milestone. |
| Computing streaks from `Date.now()` and timezone offsets at display time | Quick to implement | Travel breaks it; midnight rollover is fuzzy; refactor is painful once persisted | **Never.** Pick a `dayKey()` function first and use it for both storage and display. |
| One single JSON file for all exercises | Simple to edit | Concurrent edits impossible (not an issue for one user); harder to bisect a bad commit; large file slows VS Code | Acceptable for single-user. Revisit when file > 500 KB or 200+ exercises. |
| Identifying exercises by array index instead of stable `id` | "It works, the array doesn't change" | Author reorders or deletes one mid-list → all counters point at the wrong exercise; impossible to debug | **Never.** Require `id` field from day 1 in the schema. |
| Multi-choice answer is identified by string match against the option text | Trivially simple | Diacritic mismatches, trailing whitespace bugs, locale differences | Acceptable if NFC-normalize-on-load is in place. Otherwise switch to option-index. |
| Single-file HTML by manually pasting JSON into a script tag | Works for "double click" | Author has to re-paste after every edit; easy to miss updates | Acceptable if the build step is a 1-line shell script that does it. Manual paste is the trap. |

---

## Integration Gotchas

There are no third-party APIs in this app — but there are "integrations" with the browser runtime and the author's editing tools.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Browser localStorage | Treating it as a database (atomic writes, transactions) | Treat it as a single mutable blob: load whole object, mutate, save whole object. Wrap writes in try/catch for quota errors. |
| Browser `file://` runtime | Assuming fetch/import work the same as on `http://` | Bundle to single-file HTML or run a tiny local server. Never assume `fetch('./data.json')` works from a double-clicked file. |
| Browser timezone (`Date`) | Mixing `toISOString` (UTC) with `getFullYear()/getMonth()/getDate()` (local) | Use one explicit `dayKey(date)` function based on local civil date. Never use ISO strings for day keys. |
| Browser tabs | Assuming only one instance runs at a time | Detect multi-tab via storage event + sentinel. Refuse to operate in the secondary tab. |
| Text editor (VS Code) for JSON | No schema → no autocomplete or error squiggles | Add `$schema` reference in JSON + ship `exercises.schema.json`. Author gets autocomplete on category IDs. |
| PDF copy-paste source | Non-NFC text, non-breaking spaces, smart quotes | Normalize-on-load (`.normalize('NFC')`, strip U+00A0, replace smart quotes). |
| Git (if author uses it for content versioning) | Committing `localStorage` data is impossible; export/import is the only versioning | Document a "weekly export" habit; the JSON is the source of truth, localStorage is cache. |

---

## Performance Traps

For a single-user app with <500 exercises, performance is not a real concern — but a few patterns degrade UX nonetheless.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering the whole exercise list on every state change | Slight lag on click; flicker; janky animations | Render only the active exercise; the "estado de categorías" panel updates in place. | Noticeable >50 exercises in the panel. |
| Re-running session generation algorithm in a loop until constraints are satisfied | Session start takes >1s | Deterministic greedy + sample-without-replacement, no retries. | Breaks when categories selected but unsatisfiable (zero exercises) — show error, don't loop. |
| Re-serializing the full state JSON on every answer | DevTools storage panel shows constant writes; slow on large states | Debounce saves (~500ms) OR save only deltas to a session log + full state at session end. | At ~1MB state size, writes start lagging. Add cap. |
| Computing streaks/aggregates at render time across full history | Slow page load | Cache derived values (`isHecha`, `streakDays`) in state; recompute only on relevant events. | At 1000+ exercises or full year of daily logs. |
| Loading the entire `exercises.json` into a `<select>` or `<option>` list | Slow to render the picker | Categories panel uses category IDs (small set), not exercise IDs. | Visible at >100 exercises. |

---

## Security Mistakes

This is a single-user, local-only app. The traditional web security concerns (XSS, CSRF, SQL injection) are essentially N/A. But:

| Mistake | Risk | Prevention |
|---------|------|------------|
| `innerHTML` of exercise content from JSON | If the author ever shares the JSON file or imports one from someone else (e.g. another learner sends theirs), arbitrary HTML/scripts execute. | Use `textContent` for prompts/answers; never `innerHTML`. If formatting is needed, parse a tiny markdown subset, never raw HTML. |
| Trusting `import` of arbitrary JSON files in the future | A malicious-or-malformed JSON file could crash the app or corrupt state | Validate against schema on import before merging into state. Reject with diagnostics, don't overwrite. |
| Including PII or class material in exported backups, then losing the file | Privacy leak if the author shares accidentally | Backup file contains only progress + exercise content the author already authored. No tracking, no logs of identity. Document clearly. |
| Using third-party CDN scripts (e.g. Tailwind from CDN) | The app stops working when offline; CDN compromise = code execution | Bundle everything locally. No external requests. The author works offline. |

---

## UX Pitfalls

These are specific to the author's stated needs and mechanics.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing the reset cascade as a punishment ("¡Has fallado! 3 categorías reseteadas") | Frustration, abandonment | Reframe as recovery: "Avere necesita revisión — 4 ejercicios pendientes". Show the path forward, not the regression. |
| 21-day streak counter visible everywhere even before user reaches 21 | Pressure, then existential drop when broken | Show streak as days-since-last-reset for that category (lighter weight). Visual celebration only at 21. Failure resets to 1 (today still counts), never to 0. |
| Sessions always default to "all categories" | User feels obligated to do everything daily → burnout | Default to "categorías no hechas" + "categorías cerca de dominar". User can override. |
| No feedback on WHY an answer is wrong | A1 learner can't self-diagnose accent vs. word-choice vs. grammar mistakes | The author explicitly chose this (PROJECT.md: "solo bien/mal, sin explicación"). Respect the decision but consider showing the correct answer briefly after a fail (no rule explanation, just "Correcto: era X"). |
| `Test completo` for 6 categories = 150 exercises with no break | Fatigue mid-session, abandonment, accidental fails | Per-category Test completo as default; multi-category test as opt-in with a warning ("estás a punto de ejecutar 150 ejercicios"). |
| Empty-state of "no exercises in this category" looks the same as a working state | Author sees a passing session but the category never advances | Show explicit "0 ejercicios" badge when a category is empty; warn at category-creation time. |
| `Hecha` state shown identically to `Dominada` in session selection UI | Author can't see what to focus on | Use distinct visual treatment: `no hecha` (urgent), `hecha` (ok), `dominada` (badge but de-emphasized). |
| Toast/feedback messages that disappear too quickly to read | Author misses important diagnostic info ("3 categorías reseteadas") | Permanent end-of-session summary screen. Don't rely on transient toasts for important state changes. |
| Exercise feedback "verde/rojo" without any timing for the green flash | Feels instant, no celebration → no positive reinforcement | 300ms green flash before advancing. Tiny but matters for daily-use stickiness. |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces:

- [ ] **Streak logic**: works when you do a session today and one tomorrow — but did you test what happens at 23:59 → 00:01 on the same physical evening? Did you test what happens after skipping a day? Did you test what happens after 2 days off?
- [ ] **Reset cascade**: a fail visibly resets the right categories — but did you check that the exercises within those categories return to `pending` in the `passedSinceCategoryReset` map? After the cascade, can the user re-pass and recover `hecha` status?
- [ ] **Multi-category exercises in sessions**: appear in sessions — but does the "mínimo 1 por categoría" constraint actually verify all categories are covered? Test with a session where all selected categories share a single multi-category exercise (does it pick more or stop at one?).
- [ ] **JSON load**: app starts — but did you test with a malformed JSON (trailing comma, missing field, duplicate id)? Does it show a useful error or fail silently with a blank page?
- [ ] **Export/import**: button exists and downloads a file — but did you test importing that file back? Did you test importing an OLDER version (schema mismatch)? Does it merge or replace? Document the answer.
- [ ] **localStorage quota**: writes succeed during dev — but did you test what happens at the quota boundary? Mock a `QuotaExceededError` and confirm the app shows a warning instead of crashing.
- [ ] **file:// double-click**: it works for you — but did you test on a fresh Chrome profile? On Firefox? With ES modules? After moving the folder?
- [ ] **21-day "dominada" celebration**: the milestone fires when streak hits 21 — but did you test that it doesn't re-fire every subsequent day? That it persists across reloads?
- [ ] **Weighted random**: produces varied output in a 100-call sample — but did you test with one exercise at `veces=0` and 9 at `veces=20`? Is the cold one over-sampled?
- [ ] **Session generation with all categories empty**: app doesn't crash — but does it tell the user what's wrong, or just show a blank session?
- [ ] **Diacritics**: typing/clicking accented options works — but did you copy-paste `è` from a PDF and confirm it matches the canonical NFC version in your JSON?
- [ ] **Backup reminder**: shows up — but does it dismiss properly? Does it remember the dismissal? Does it re-show after N days?
- [ ] **"Test completo" partway abandon**: tab closed mid-session — does any state persist? Are partial fails counted or discarded? Document the answer.
- [ ] **Multi-tab**: works in one tab — open a second tab, do work in tab A, switch to tab B and answer one exercise. Is tab A's progress lost?

---

## Recovery Strategies

When pitfalls occur despite prevention:

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Lost localStorage progress (cleared/corrupted) | LOW if recent backup exists | Import the latest backup JSON via the import UI. If no backup, accept loss and restart. |
| Schema version mismatch on load | LOW | Show diagnostic in dedicated panel; offer "Reset to defaults" or "Import older backup". Never silently rewrite. |
| Hand-edited JSON broke parsing | LOW | App shows the validation errors with line numbers; author fixes JSON externally; reload. |
| Streak lost due to TZ travel | LOW | Acceptable loss. Document this in the README ("travel may cost a streak day"). Don't add manual streak edit — too easy to abuse. |
| Reset cascade hit by accident (misclick on a typed answer) | MEDIUM | No undo in v1. Mitigation is the multi-choice format (less typo-prone). If "deshacer última respuesta" added later, only allow within the same session. |
| Stuck `no hecha` because an exercise was added to JSON but never appeared in a session | LOW | App naturally surfaces this by including the new exercise in the next session's weighted pick (lowest `veces`). |
| Quota exceeded mid-write | LOW | App shows "Almacenamiento lleno — exporta y limpia el log diario antiguo". Provide a "compactar log" button that drops day-records older than N days. |
| Phantom category in UI (typo in JSON) | LOW | Validation panel surfaces the typo; author fixes the JSON; the phantom disappears. |
| Multi-tab clobber | MEDIUM | If detected after the fact, the most recent save wins. No automatic recovery. Prevention (single-tab guard) is the real fix. |
| `file://` doesn't work in author's browser | LOW-MEDIUM | Fall back to "run the included `start.bat` to launch with a local server". Document as a "if double-click doesn't work" instruction in the README. |
| Session feels rigged / always shows same exercise | LOW | Tune the weighting formula (it's a single function); ship the change as a content update. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| #1 Streak / day-key | **Phase 2 (data + scheduler core)** | Unit test: simulate clock advancing 1h, 25h, 49h, 73h. Streak transitions match spec. |
| #2 Reset cascade state model | **Phase 2 (data + scheduler core)** | Unit test: small fixture with 3 categories + 5 exercises; walk every state transition; confirm `hecha` ↔ `no hecha` invariant after each fail/pass. |
| #3 "Minimum 1 per category" constraint | **Phase 3 (session generator)** | Property-based test: any selection of categories produces a session that contains ≥1 exercise per selected category and never duplicates. |
| #4 Weighted random collapse | **Phase 3 (session generator)** | Distribution test: 1000 simulated sessions, log distribution; confirm cold and hot exercises both appear; ratio stays within 10-20x. |
| #5 localStorage / quota / data loss | **Phase 1 (foundation)** for the wrapper; **Phase 4 (polish)** for backup banner; ongoing for migrations | Manual test: fill localStorage near 5MB cap, attempt save, confirm warning fires. Test export-import roundtrip. |
| #6 `file://` runtime promise | **Phase 1 (foundation)** — decide bundling | Smoke test: clean install, double-click HTML in target browser (Chrome AND Firefox), confirm session can be completed. |
| #7 JSON authoring typos | **Phase 1 (schema)** + **Phase 2 (load validator)** | Author runs the validator on an intentionally-broken JSON and gets actionable errors. |
| #8 Diacritic / NFC normalization | **Phase 1 (load pipeline)** | Test: copy `è` from a PDF, paste into JSON, ensure it matches the canonical form after load. |
| #9 Multi-tab race | **Phase 4 (polish)** | Open two tabs, verify the second shows a "abierta en otra pestaña" guard. |
| #10 Long-session fatigue / Test completo abandon | **Phase 3** (incremental save) + **Phase 4** (per-category Test completo as default) | Manual test: close the tab mid-session, reopen, confirm resume prompt; confirm partial state persisted. |

---

## Sources

- [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — confirms localStorage best-effort semantics and quota behavior. HIGH confidence.
- [TrackJS — Failed to execute setItem on Storage](https://trackjs.com/javascript-errors/failed-to-execute-setitem-on-storage/) — common QuotaExceededError patterns. MEDIUM.
- [MDN — String.prototype.normalize()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) — canonical reference for NFC/NFD. HIGH.
- [Diacritic-insensitive String Comparison in JavaScript (ClarityDev)](https://claritydev.net/blog/diacritic-insensitive-string-comparison-javascript) — practical patterns; we recommend keeping diacritics significant for A1/A2 learning. MEDIUM.
- [MDN — CORS Request Not HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSRequestNotHttp) — authoritative on `file://` origin handling. HIGH.
- [Inter-tab communication using local storage — Fastmail](https://www.fastmail.com/blog/inter-tab-communication-using-local-storage/) — practical multi-tab patterns from a production app. MEDIUM-HIGH.
- [Race condition in localStorage store in multiple tabs (ember-simple-auth #97)](https://github.com/mainmatter/ember-simple-auth/issues/97) — concrete case study of the race. MEDIUM.
- [Duolingo Wiki — Streak troubleshooting](https://duolingo.fandom.com/wiki/Streak) — empirical evidence of timezone/midnight streak bugs from the dominant streak-based language app. MEDIUM (community-maintained but consistent with many independent reports).
- [Duolingo Time Zone Issues](https://www.justanswer.com/computer/nedsf-wrong-time-zone-so-i-m-using.html) — independent confirmation. LOW-MEDIUM.
- [Weighted sampling without replacement (Max Halford)](https://maxhalford.github.io/blog/weighted-sampling-without-replacement/) — Efraimidis–Spirakis algorithm for the session generator. HIGH (well-known algorithm).
- [JSON Schema: How to Validate API Responses (DEV)](https://dev.to/snappy_tools/json-schema-how-to-validate-api-responses-before-they-break-your-app-3mlm) — hand-edited config and validation patterns. MEDIUM.
- [Project context: `.planning/PROJECT.md`](.planning/PROJECT.md) — Core Value and mechanics that constrain which pitfalls actually matter. HIGH (source of truth for the author's intent).

---
*Pitfalls research for: personal Italian A1/A2 self-study quiz web app (static, localStorage, single-user)*
*Researched: 2026-05-23*
