---
phase: 34-canciones-resultados-picker
plan: 02
subsystem: ui
tags: [alpine, editoriale, no-build, canciones, css-tokens, presentational]

# Dependency graph
requires:
  - phase: 34-canciones-resultados-picker
    plan: 01
    provides: "songsForDisplay extended (titleDisplay/artist/metaLabel/featured); .badge-pasada/.badge-fallada classes; net-new tokens --ed-green-dark/--ed-placeholder/--ed-ring-track"
  - phase: 32-cimientos-visuales-home-categor-as
    provides: "--ed-* tokens, app.css base (Pico removed), .status-dot/.cat-name/.cat-topic/.home-overline/.home-cta-arrow/.streak-bar idioms"
provides:
  - "Repainted Canciones list screen (SRP-01): featured Continuar/Empezar card + Editoriale hairline rows with tinted cover tiles"
  - ".song-featured + .song-cover + .song-row CSS block at the bottom of app.css (consumes only --ed-* tokens)"
affects: [34-03-cancion, 34-04-summary, 34-05-picker]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Filtered x-for + x-show=\"song.featured\" renders exactly the single featured row's card (none when all pasada, D-04) — no engine state, no new getter"
    - "Tinted cover tile = solid-block-with-glyph (.match-badge structure) filled with repeating-linear-gradient + serif initial via x-text (net-new visual, anchored to existing idiom)"
    - "State-based progress bar clones .streak-bar/.streak-bar-fill currentColor mechanism; fixed width per state, NO numeric fraction (D-02)"

key-files:
  created: []
  modified:
    - index.html
    - app.css
    - tests/screen-canciones.test.js
    - tests/screen-responsive.test.js

key-decisions:
  - "D-01/D-04: featured card gated by x-show=\"song.featured\" inside a filtered x-for over songsForDisplay; when no song is featured (all pasada) zero cards render — no separate empty-state markup"
  - "D-02: featured bar fill is a fixed 40% width with currentColor (from badge-${status}); no phraseCount/huecos/fraction binding anywhere in the bar"
  - "D-03: CONTINUAR (fallada) / EMPEZAR (no-hecha) are hardcoded literals in two x-show branches — never data-driven, never x-html (T-02-01)"
  - "D-05/D-06/D-07: rows reuse .status-dot + :class badge-${song.status} verbatim, .cat-name (17px override) for titleDisplay, .cat-topic for metaLabel"
  - "Cover-tile stripe direction 135deg, --ed-green-dark→--ed-green pair, radius 11 / 46px(list) / 66px(featured) all LOCKED off-grid per D-16"

patterns-established:
  - "Per-screen Editoriale block at app.css bottom under a ═══ banner citing the requirement + locked decisions; LOCKED off-grid values annotated /* exception verbatim — handoff §4 */"
  - "Test guards anchored on REAL usage (x-html= attribute, var(--pico-)/--pico-…: definition) rather than prose, so documentation comments mentioning the forbidden token don't trip the guard"

requirements-completed: [SRP-01]

# Metrics
duration: 5min
completed: 2026-06-30
---

# Phase 34 Plan 02: Canciones List Repaint (SRP-01) Summary

**Repainted the Canciones list screen in the Editoriale language — a featured Continuar/Empezar card for the first pending song (hidden when all pasada) plus hairline rows with tinted serif-initial cover tiles, state-colored status dots, serif titles and italic meta — consuming the 34-01 `songsForDisplay` derivations and reusing the existing `startSong` handler verbatim. Engine untouched, presentation only.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-30T16:10:40Z
- **Completed:** 2026-06-30T16:15:27Z
- **Tasks:** 2 completed
- **Files modified:** 4

## Accomplishments
- **Task 1 — Featured card (D-01/D-02/D-03/D-04):** Replaced the canciones `<table>` with a `.song-featured` button gated by `x-show="song.featured"` inside a filtered `x-for` over `songsForDisplay`. Surface uses `--ed-paper-elevated` + `--ed-radius-card` + `--ed-shadow-card` (not the green CTA fill). Overline renders the hardcoded `CONTINUAR` (status `fallada`) / `EMPEZAR` (status `no-hecha`) literals via two `x-show` branches. State-based progress bar clones `.streak-bar`/`.streak-bar-fill` (currentColor from `badge-${status}`) with no numeric fraction. 66px tinted cover (repeating-linear-gradient), serif `titleDisplay`, italic `artist`, "Continuar →" CTA — all wired to `startSong(song.id)` verbatim. Hidden entirely when every song is `pasada` (no card renders).
- **Task 2 — List rows + cover tiles (D-05/D-06/D-07):** Added a `TODAS LAS CANCIONES` section overline and an `x-for` of `.song-row` hairline rows. Each row: a 46px `.song-cover` tile (LOCKED D-16, radius 11) filled with a `repeating-linear-gradient` stripe pair defaulting to `--ed-green-dark`, serif initial via `x-text="song.titleDisplay.charAt(0)"`; a `.status-dot` reused verbatim with `:class="\`badge-${song.status}\`"` (D-07); serif `.cat-name` title (`titleDisplay`, 17px override); italic `.cat-topic` meta (`metaLabel`); the preserved `vecesFallada > 0` "fallada xN" affordance; and a "Jugar →" CTA arrow. Row tap reuses `startSong(song.id)` verbatim.
- All dynamic content bound via `x-text` exclusively; zero `x-html` in `index.html` (T-02-01). The new CSS block sits at the bottom of `app.css` under a `═══` banner citing SRP-01/D-01..D-07, consuming only `--ed-*` tokens (no `--pico-*`, no dark-mode rules).

## Task Commits

Each task was committed atomically:

1. **Task 1: featured Continuar/Empezar card** — `94b9bb5` (feat)
2. **Task 2: list rows + tinted cover tiles** — `7c817c3` (feat)

## Files Created/Modified
- `index.html` — Replaced the canciones `<table>` template with the Editoriale featured card + hairline row list (reuses `songsForDisplay`/`startSong` bindings verbatim).
- `app.css` — Added the `Pantalla CANCIONES` block at file bottom: `.songs-header`/`.songs-title`, `.song-featured*` (card + 66px cover + state bar + CTA), `.songs-list`/`.song-row*` (hairline rows), `.song-cover` (46px tinted tile). Only `--ed-*` tokens.
- `tests/screen-canciones.test.js` — Added Phase 34-02 Task 1 (featured card) + Task 2 (rows/tiles) source + structural asserts; refined the 34-01 pico/x-html/dark-mode guards to match real usage; split the song half of the "fallada xN" assert into Task 2.
- `tests/screen-responsive.test.js` — Updated the stale Phase 28 `data-label` count (8→5) since the canciones screen no longer uses a `<table>` after the Editoriale repaint (deviation Rule 3, see below).

## Decisions Made
- **Featured card via filtered `x-for` + `x-show`:** rather than adding a thin "featured song" getter, the card iterates `songsForDisplay` and `x-show`s only the `song.featured === true` row. Guarantees exactly one card (or none when all `pasada`, D-04) without touching the engine or adding state.
- **Bar fill fixed at 40%:** D-02 forbids a numeric fraction and there is no intra-song partial progress; a fixed partial width signals "pending" while the `currentColor` from `badge-${status}` carries the state color. The card never shows `pasada` (D-04), so a full-bar branch is unnecessary.
- **17px title override on `.cat-name`:** UI-SPEC §Typography specifies list song title 17/600 vs the shared `.cat-name` 18/600; applied via a `.song-row-title` override rather than mutating the shared class.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stale Phase 28 responsive `data-label` test broke by the table removal**
- **Found during:** Task 1
- **Issue:** `tests/screen-responsive.test.js` asserted exactly 8 `data-label=` attributes (5 home + 3 canciones), encoding the old `<table>`-based canciones layout. The Editoriale repaint removes the canciones table, dropping its 3 `data-label` cells, so the assert and the "data-label=\"Jugar\"" assert failed.
- **Fix:** Updated the assert to expect 5 `data-label` (the home table, unchanged) and removed the now-obsolete "Jugar" cell check, documenting that v1.8 is desktop-only and Phase 34 responsive is deferred (CONTEXT §deferred). The home responsive layout is untouched.
- **Files modified:** tests/screen-responsive.test.js
- **Commit:** 94b9bb5

**2. [Rule 3 - Blocking] 34-01 regression guards tripped by new documentation comments**
- **Found during:** Task 1
- **Issue:** The pre-existing 34-01 guards asserted no `--pico-` and no `prefers-color-scheme` substring in the app.css tail after the song-badge banner, and no `x-html` substring in the canciones window. My new banner/inline comments legitimately contain the words "--pico-*", "x-html" (as prose, e.g. "cero --pico-*", "nunca x-html") and originally "prefers-color-scheme", producing false positives.
- **Fix:** Refined the guards to match REAL references only — `var(--pico-…)` / `--pico-…:` definitions and the `x-html=` attribute — not prose mentions (same criterion as 34-01 deviation #1). Reworded the one app.css comment that said "prefers-color-scheme" to "reglas de tema oscuro" to keep the unchanged 34-01 substring guard green.
- **Files modified:** tests/screen-canciones.test.js, app.css
- **Commit:** 94b9bb5

## Verification
- `node --test tests/screen-canciones.test.js` → 58 tests, 58 pass, 0 fail.
- `node --test tests/*.test.js` → 540 tests, 539 pass, 1 fail (the single preexisting, unrelated `Categorías con explanation coverage (Phase 7.1+)` / `genero-numero.json` failure — out of scope, pre-existing).
- Grep guard: `grep -c 'x-html=' index.html` → 0.
- Visual (featured card + tinted tiles + state dots rendering) is human-verifiable via `npx serve` — deferred to UAT per the established Phase 32-34 pattern (Alpine reactivity not trivially instantiable under node).

## Known Stubs
None — the featured card and rows bind real `songsForDisplay` fields (`featured`/`status`/`titleDisplay`/`artist`/`metaLabel`/`vecesFallada`) from 34-01, which read live engine state (`songProgress`). The cover-tile stripe is a fixed default pair (`--ed-green-dark`→`--ed-green`) by design (D-46, no per-song tint source field exists; per-category/theme tints are a deferred content task per CONTEXT §deferred).

## Self-Check: PASSED
- index.html: FOUND (modified)
- app.css: FOUND (modified)
- tests/screen-canciones.test.js: FOUND (modified)
- tests/screen-responsive.test.js: FOUND (modified)
- Commit 94b9bb5: FOUND
- Commit 7c817c3: FOUND
