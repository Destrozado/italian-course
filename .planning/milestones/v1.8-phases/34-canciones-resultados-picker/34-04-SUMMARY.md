---
phase: 34-canciones-resultados-picker
plan: 04
subsystem: ui
tags: [alpine, css, editoriale, word-buttons, song-playback, session-topbar]

# Dependency graph
requires:
  - phase: 33-pantallas-de-ejercicio
    provides: ".session-topbar/.session-back/.session-progress/.session-counter top bar + .session-prompt + wb-* word-buttons treatment (inherited verbatim)"
  - phase: 34-canciones-resultados-picker (34-01)
    provides: "presentational getters/tokens (badge-pasada/fallada, --ed-* tokens); songProgressLabel/sessionProgressPercent idiom"
provides:
  - "Repainted cancion (song playback) screen: Editoriale top bar (circular ‹ back + green progress fill + Frase X/N counter), serif .session-prompt lyric, no timer chip (D-08)"
  - "Presentational song-progress fill derived from sessionCursor (mirrors sessionProgressPercent, no engine field added)"
affects: [phase-34-verifier, future-mobile-responsive]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Inherit Phase 33 session top bar verbatim for the song screen (no parallel styles)"
    - "Presentational progress derive via inline :style mirroring sessionProgressPercent (no engine field)"
    - "Single canonical back affordance (circular ‹) replacing duplicate bottom button"

key-files:
  created: []
  modified:
    - index.html
    - app.css
    - tests/screen-canciones.test.js

key-decisions:
  - "D-08: cancion top bar = .session-topbar scaffold (circular ‹ back reusing returnToSongList + green .session-progress fill + Frase X/N .session-counter); NO .session-timer chip — songs never use Contrarreloj"
  - "Progress fill width derived presentationally inline (mirror of sessionProgressPercent: (sessionCursor+1)/sessionExerciseIds.length); no engine field added"
  - "Removed the redundant bottom '← Volver a Canciones' button — back affordance lives only in the circular ‹ (single canonical control)"
  - "cancion app.css block documents inherited classes; only adds a width-transition rule scoped to .session-topbar .session-progress-fill"

patterns-established:
  - "Reuse-don't-duplicate: the song screen inherits the Phase 33 top bar + word-buttons classes verbatim; new CSS is documentation + a single transition rule"

requirements-completed: [SRP-02]

# Metrics
duration: 11min
completed: 2026-06-30
---

# Phase 34 Plan 04: Cancion Editoriale Top Bar Summary

**Song playback screen repainted to the Editoriale language — inherited Phase 33 top bar (circular ‹ back via `returnToSongList` + green progress fill derived from `sessionCursor` + Space Grotesk "Frase X/N" counter), serif `.session-prompt` lyric, NO timer chip (D-08), with word-buttons / songCheck / songAdvance / 600ms auto-advance untouched.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-06-30T16:17:00Z
- **Completed:** 2026-06-30T16:28:02Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments
- Replaced the bare `<header x-text="songProgressLabel">` in the `cancion` template with the `.session-topbar` scaffold: a circular `‹` `.session-back` (`aria-label="Volver"`, reuses `returnToSongList`), a 4px green `.session-progress`/`.session-progress-fill` bar, and a `.session-counter` bound to `songProgressLabel` ("Frase X/N"). No `.session-timer*` element added (D-08).
- Derived the progress fill width presentationally via an inline `:style` mirroring the `sessionProgressPercent` idiom (`(sessionCursor + 1) / sessionExerciseIds.length`) — no engine field added.
- Applied `.session-prompt` (serif 30/500) to the lyric `<p x-text="songCurrentPhrase.payload.prompt">`; kept the `.session-context` overline.
- Removed the now-redundant bottom "← Volver a Canciones" button; the back affordance is now the single canonical circular `‹`.
- Added a documented cancion block at the bottom of `app.css` (citing SRP-02/D-08) that records the inherited classes and scopes only the fill-width transition. No `--pico-*`, no `prefers-color-scheme`.
- Extended `tests/screen-canciones.test.js` with a Phase 34-04 describe block (8 asserts) covering the top bar, back reuse, progress derive, counter, no-timer, serif prompt, removed bottom button, and the untouched engine + anti-XSS guards.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace the cancion header with the Editoriale top bar** - `3f1f46a` (feat)

**Plan metadata:** _(this commit)_ (docs: complete plan)

## Files Created/Modified
- `index.html` - cancion template: `.session-topbar` scaffold (circular ‹ back + green progress + Frase X/N counter), `.session-prompt` lyric, removed bottom back button
- `app.css` - new bottom block (SRP-02/D-08) documenting inherited classes + a `.session-topbar .session-progress-fill` width transition
- `tests/screen-canciones.test.js` - Phase 34-04 describe block (8 asserts) + rescoped the pre-existing Task 2 window to the SUMMARY banner

## Decisions Made
- Progress fill derived **inline** in the markup (mirroring `sessionProgressPercent`) rather than adding a thin getter — keeps the engine and the getter surface untouched while satisfying "derive presentationally, no engine field." The plan explicitly allowed either an inline expression or a thin getter; inline was chosen as the lighter-touch option.
- The cancion `app.css` block adds essentially **one CSS rule** (a scoped width transition) because the `.session-topbar` family is inherited verbatim from Phase 33 — re-styling would violate the "inherit, don't create parallel styles" constraint. The block is mostly a banner documenting the inheritance, per the Phase 32-33 banner-comment idiom.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Pre-existing Task 2 test window dropped `songCheck`/`songAdvance` after markup grew**
- **Found during:** Task 1 (verification)
- **Issue:** The pre-existing test `index.html: render del playthrough usa x-text...` sliced a fixed 3500-char window from the cancion guard and asserted `songCheck`/`songAdvance` were present. Adding the top-bar markup pushed those bindings to offset ~3900, past the fixed window, failing a previously-green assertion that my change directly caused.
- **Fix:** Rescoped that test's window to bound at the `Pantalla SUMMARY` banner (the same marker-based idiom my new tests use) instead of a brittle fixed offset. Assertion intent unchanged.
- **Files modified:** tests/screen-canciones.test.js
- **Verification:** `node --test tests/screen-canciones.test.js` → 78/78 pass
- **Committed in:** `3f1f46a` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — broken-by-my-change test scoping)
**Impact on plan:** In-scope fix to a test directly destabilized by the new markup. No engine or behavior change; no scope creep.

## Issues Encountered
- Two of my own new assertions initially tripped on prose (the explanatory comment in `index.html` contained the literal "← Volver a Canciones", and the `app.css` banner mentioned `.session-timer*`). Resolved by rewording the comments to avoid the literal tokens and by tightening the `returnToSongList` assertion to count `@click="returnToSongList"` bindings rather than all mentions. Documentation now reads cleanly without weakening the guards.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SRP-02 delivered; the `cancion` screen is now Editoriale-consistent with the rest of the v1.8 restyle.
- Remaining in-phase work: 34-05 (summary/Resultados, SRP-03) per the wave plan.
- **Visual UAT pending** (human-verifiable via `npx serve`): confirm the top bar renders, the serif prompt + word-buttons display, and the 600ms auto-advance still fires after a correct answer.
- Suite stays green except the single documented preexisting unrelated failure (`genero-numero.json` explanation-coverage count 12 vs 13).

## Self-Check: PASSED

- FOUND: index.html
- FOUND: app.css
- FOUND: tests/screen-canciones.test.js
- FOUND: .planning/phases/34-canciones-resultados-picker/34-04-SUMMARY.md
- FOUND: commit 3f1f46a

---
*Phase: 34-canciones-resultados-picker*
*Completed: 2026-06-30*
