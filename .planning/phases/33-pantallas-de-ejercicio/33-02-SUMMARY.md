---
phase: 33-pantallas-de-ejercicio
plan: 02
subsystem: ui-editoriale-session
tags: [brownfield-ui, editoriale, ex-03, anti-xss, multiple-choice, comprobado]
requires:
  - "33-01 shared scaffolds (.session-feedback.correct/.wrong, .session-feedback-title, .session-cta, .session-explanation) + post-grading tint tokens (--ed-green-tint family, --ed-red-tint family)"
  - "Existing engine grading flow (sessionSelectOption → grade → applyResultToSession, sessionFeedback, sessionSelectedIndex, multiChoiceOrder shuffle indirection D-181)"
  - "Existing presentational state (sessionExplanationRevealed, revealSessionExplanation, sessionAdvance)"
provides:
  - "EX-03 comprobado visuals for multiple-choice: green-tint ✓ correct / red-tint ✗ chosen-wrong / opacity-0.5 dim for the rest, over the intact 1-step instant-grade flow (D-01/D-02)"
  - "Repainted MC sub-template markup (instant-grade option row + .session-feedback box with hardcoded ¡Esatto!/Quasi… serif titles + Continuar → CTA, D-04/D-09)"
  - ".session-options CSS block in app.css (resting option styling, .correcta/.incorrecta tint+border+✓/✗ override, scoped post-grading dim, focus-visible)"
affects:
  - "Plans 33-03 (word-buttons) and 33-04 (match) — both will add their own .session-feedback wrappers; the test assertion was updated to count advance buttons by intent so it stays green as they do"
tech-stack:
  added: []
  patterns:
    - "Cascade-win via app.css source order over styles.css legacy .correcta/.incorrecta (same specificity, later file)"
    - "Non-chromatic state cue: hardcoded ✓/✗ glyphs via ::after content on the state class (meaning not carried by color alone — focus/disabled spec)"
    - "x-text exclusive data binding (anti-XSS T-02-01); feedback titles + CTA labels + glyphs hardcoded"
    - "Off-grid handoff-verbatim pixel values marked /* exception verbatim */ (gap 10, padding 15×18)"
    - "1-step instant-grade preserved verbatim (D-01): no Comprobar button, no pre-check green-selection state, keyboard 1-4 still grades instantly"
key-files:
  created: []
  modified:
    - "index.html"
    - "app.css"
    - "tests/exercise-types.test.js"
decisions:
  - "Folded the legacy 'Respuesta correcta:' line into the .session-feedback box (planner's-call option in the plan) as .session-feedback-correct — copy stays Spanish, the <strong x-text> data binding preserved; shown only on incorrect"
  - "Added the ✓/✗ marks via ::after content on .correcta/.incorrecta (CSS), not as data spans, so they are hardcoded non-data glyphs toggled by the engine-set state class (anti-XSS-safe, non-chromatic meaning)"
  - ".correcta/.incorrecta forced opacity:1 so they are never caught by the opacity-0.5 dim rule even while :disabled during feedback"
metrics:
  duration: ~20m
  completed: 2026-06-30
---

# Phase 33 Plan 02: Pantallas de ejercicio — Multiple-choice EX-03 Summary

Repainted the multiple-choice sub-template into the Editoriale *comprobado* states (EX-03) on top of the intact 1-step instant-grade flow. Tapping an option still grades INSTANTLY (D-01 — no "Comprobar" button, no pre-check green-selection state, keyboard 1-4 unchanged); the visual states are applied AFTER the grade: the correct option fills green-tint with a green 2px border and a ✓, the chosen-wrong option fills red-tint with a red 2px border and a ✗, every other option dims to opacity 0.5, and a tinted feedback box appears with a hardcoded serif Italian title (¡Esatto! / Quasi…) plus the existing pedagogical explanation and the "¿Por qué?" reveal. The advance control became the bottom Continuar → CTA calling the unchanged `sessionAdvance` (D-04 manual advance). Brownfield UI-only — the grading engine, cascade, sampler, and timer were not touched.

## What Was Built

**Task 1 — MC sub-template markup repaint (index.html, ~470-556)**
- Kept the `multiChoiceOrder` `x-for`/`:key="perm"`, `@click="sessionSelectOption(perm)"`, `:disabled`, the `'correcta'`/`'incorrecta'` `:class` toggles, and `x-text="...options[perm]"` byte-equivalent (D-01 flow untouched). Added `class="session-options"` on the option row for CSS scoping.
- Wrapped the feedback area into the 33-01 `.session-feedback` box toggled `.correct`/`.wrong` by `sessionFeedback`. Inside it: two hardcoded serif titles `¡Esatto!` (`x-show="...=== 'correct'"`) and `Quasi…` (`x-show="...=== 'incorrect'"`) — NOT x-text (D-09); the legacy "Respuesta correcta:" line folded in as `.session-feedback-correct` (Spanish copy, `<strong x-text>` preserved, shown only on incorrect); the existing `.session-explanation` `<p>` (dual-guard `x-show` + `x-text` preserved); the existing `.session-why` "¿Por qué?" button (`revealSessionExplanation()` preserved).
- Converted the advance `<button>` into the bottom `.session-cta` with hardcoded label `Continuar →` calling the unchanged `sessionAdvance`. No auto-advance added.

**Task 2 — MC option/marks/dim CSS (app.css, appended to the Phase 33 section)**
- New "Phase 33 / Plan 02" sub-section consuming only `--ed-*`: `.session-options` (column, gap 10px `/* exception verbatim */`); resting `.session-options button` (serif 18/500, `--ed-surface`, `--ed-border-soft` 1.5px, radius 14 `--ed-radius-feedback`, padding 15×18 `/* exception verbatim */`, `justify-content: space-between`); hover border-darken (desktop, `@media (hover: hover)`); focus-visible 2px green outline offset 2px.
- Overrode legacy `button.correcta` → `--ed-green-tint` fill + `--ed-green` 2px border + `--ed-green-on-tint` text + `::after "✓"`; `button.incorrecta` → `--ed-red-tint` + `--ed-red` 2px border + `--ed-red-text` + `::after "✗"`. Both forced `opacity:1`.
- Post-grading dim: `.session-options button:disabled:not(.correcta):not(.incorrecta) { opacity: 0.5 }` — scoped to the MC option row so it does not bleed into match/word-buttons. Added `.session-feedback-correct` styling (Hanken 13, `--ed-red-text`).

## Verification

- `node --test tests/*.test.js` → **509 tests, 508 pass / 1 fail**. The single failure is the known preexisting `genero-numero` explanation-coverage mismatch (12 vs 13), unrelated to this UI plan. Zero net-new failures.
- Task 1 keep/copy/no-pre-selection checks pass: all four bindings present, `¡Esatto!`/`Quasi`/`Continuar` present, no `green-selection` class.
- Task 2 automated check prints `PASS` (both legacy classes overridden, both tint families consumed, `opacity: 0.5` present).
- `grep -cE 'x-html=' index.html` → **0** (the anti-XSS T-33-03 invariant; the 3 bare `x-html` substrings are pre-existing documentation comments, not directive bindings — same situation 33-01 documented).
- No `--pico-*` definition or reference introduced in the Plan 02 additions (verified by slicing the file at the "Phase 33 / Plan 02" banner); the only `--pico-*` in app.css is the Phase 32 GAP-01 compat shim.
- Engine call-site baseline unchanged: `applyResultToSession|sessionSelectOption` in app.js = 31.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test reflects new structure] r3b CAMBIO 1 advance-button assertion**
- **Found during:** Task 2 verification (`node --test`).
- **Issue:** `tests/exercise-types.test.js:1521` counted `x-show="sessionFeedback !== null"` globally and asserted exactly 3 (one per per-type advance button). The MC repaint legitimately introduced a 4th occurrence: the new `.session-feedback` box wrapper carries the same guard. The test's *intent* (the 3 per-type exercise advance buttons share the feedback guard) was still satisfied, but the naive substring count went 3 → 4 and the test failed. This is also fragile against 33-03/33-04, which will add their own feedback-box wrappers.
- **Fix:** Re-expressed the assertion to count the 3 advance buttons by intent — `x-show="sessionFeedback !== null"` immediately followed (within 80 chars) by `@click="sessionAdvance">` — which matches exactly the MC `Continuar →`, word-buttons `Siguiente`, and match `Siguiente` controls (3), and is robust to additional feedback-box wrappers. The song assertion (`songAdvance`) is unchanged.
- **Files modified:** tests/exercise-types.test.js
- **Commit:** aa0ad8a

## Known Stubs

- None. The MC sub-template is fully wired to live engine state; no placeholder/empty data paths introduced.

## Threat Flags

- None. T-33-03 (DOM injection) is mitigated as planned: `x-text` exclusive for `options[perm]`, the folded `Respuesta correcta` strong, and `payload.explanation`; the ¡Esatto!/Quasi…, Continuar →, and ✓/✗ marks are hardcoded (the ✓/✗ via CSS `::after content`), never x-html. T-33-04 (no new surface) holds — pure presentation, grading flow unchanged.

## Self-Check: PASSED

- index.html, app.css, tests/exercise-types.test.js — all modified files exist on disk.
- Task commits 3a2b50c (markup) and aa0ad8a (CSS + test) present in git history.
