---
phase: 33-pantallas-de-ejercicio
plan: 03
subsystem: ui-editoriale-session
tags: [brownfield-ui, editoriale, ex-05, anti-xss, word-buttons, assemble-then-check]
requires:
  - "33-01 shared scaffolds (.session-feedback.correct/.wrong, .session-feedback-title, .session-cta, .session-explanation) + post-grading tint tokens (--ed-green-tint family, --ed-red-tint family)"
  - "33-02 multiple-choice feedback-box pattern (the .session-feedback wrapper + hardcoded ¡Esatto!/Quasi… serif titles) to mirror"
  - "Existing word-buttons engine mechanics (wordButtonsAddWord/RemoveWord/Check, wordButtonsCanCheck, bankWithKeys, wordButtonsAnswer getter, .wb-placed no-reflow technique from quick-260615-str)"
provides:
  - "EX-05 word-buttons Editoriale repaint: bank pills on --ed-surface + --ed-border-soft (radius 12), stable no-reflow gaps, post-grading green-underline/red-strikethrough answer fill (D-08), .session-feedback box with serif ¡Esatto!/Quasi… title (D-09) — all consistent with multiple-choice (D-12)"
  - "Native assemble-then-check flow preserved verbatim: Comprobar (:disabled until wordButtonsCanCheck) → Siguiente, both repainted to .session-cta"
  - ".wb-bank/.wb-answer/.wb-placed/.wb-answer-empty/.kbd-hint Editoriale CSS overriding the legacy Pico greens/reds + .session-cta:disabled handoff state"
affects:
  - "Plan 33-04 (match) — the last per-type repaint; reuses the same .session-feedback box + .session-cta language established across 33-02/03"
tech-stack:
  added: []
  patterns:
    - "Cascade-win via app.css source order over styles.css legacy .wb-answer.incorrecta / .wb-correct-answer / .kbd-hint (same specificity, later file)"
    - "Post-grading answer-area fill driven by a sessionFeedback-based class (.correcta added alongside the pre-existing .incorrecta), mirroring the MC .session-gap green-underline/red-strikethrough (D-08)"
    - "x-text exclusive data binding (anti-XSS T-33-05); feedback titles + Comprobar/Siguiente labels + ¹..⁹ key superscripts hardcoded/derived, never x-html"
    - "Native assemble-then-check kept (NOT the rejected MC 1-step): word-buttons genuinely assembles then checks (D-12)"
    - "Off-grid handoff-verbatim disabled hexes #dcd7cb / #a89f8c isolated as a single local rule, marked /* exception verbatim */"
key-files:
  created: []
  modified:
    - "index.html"
    - "app.css"
decisions:
  - "Folded the legacy '.wb-correct-answer' (D-59 Respuesta correcta line) into the .session-feedback box as .session-feedback-correct (planner's-call option in the plan) — copy stays Spanish, the <strong x-text=...answer.join(' ')> data binding preserved; shown only on incorrect, identical to the MC fold from 33-02"
  - "Added a `correcta` :class toggle on .wb-answer for the post-grading green fill; the pre-existing `incorrecta` toggle already drove the red state, so D-08 needed only the green counterpart (no engine change — both read sessionFeedback)"
  - "Drove the post-grading fill on the assembled word <button>s inside .wb-answer (underline/strikethrough per word) rather than inventing a single gap span — word-buttons has no literal ___ gap; the assembled answer IS the filled gap"
  - "Applied .session-cta:disabled (handoff #dcd7cb/#a89f8c) as a shared rule — only word-buttons currently has a disabled CTA (Comprobar until canCheck); MC/match CTAs are never disabled, so no bleed"
metrics:
  duration: ~15m
  completed: 2026-06-30
---

# Phase 33 Plan 03: Pantallas de ejercicio — Word-buttons EX-05 Summary

Repainted the word-buttons sub-template into the Editoriale language (EX-05) by extrapolating consistently from multiple-choice (D-12), over the intact native assemble-then-check mechanics. The bank is now serif pills on `--ed-surface` with `--ed-border-soft` borders (radius 12, `--ed-radius-ghost`) keeping the `¹..⁹` key superscripts; placing a word still leaves an invisible no-reflow placeholder (`.wb-placed { visibility: hidden }` preserved); the answer area is a stable styled gap that, post-grading, fills green-underline if correct / red-strikethrough if wrong (D-08, mirroring the MC `.session-gap`); and a tinted `.session-feedback` box shows a hardcoded serif Italian title (¡Esatto! / Quasi…) plus the folded "Respuesta correcta" line, the existing pedagogical explanation, and the "¿Por qué?" reveal — identical to the MC pattern from 33-02 (D-09). The native Comprobar (disabled until `wordButtonsCanCheck`) → Siguiente flow is preserved verbatim (NOT converted to 1-step — assemble-then-check is the word-buttons norm, D-12). Brownfield UI-only — `wordButtonsAddWord`/`RemoveWord`/`Check`, `bankWithKeys`, the no-reflow technique, grading, sampler, and timer were not touched.

## What Was Built

**Task 1 — Word-buttons sub-template markup repaint (index.html, ~559-680)**
- Kept the `.wb-bank` `x-for` over `bankWithKeys`, `@click="wordButtonsAddWord(entry.idx)"`, the `wb-placed` `:class`, the `:disabled`/`:tabindex`/`:aria-hidden`/`:aria-label`, and the `<span x-text="entry.word">` + `<sup class="kbd-hint" x-text="entry.key">` byte-equivalent (the ¹..⁹ superscripts + no-reflow placeholder stay).
- Kept the `.wb-answer` block (`wb-answer-empty` toggle, `aria-live`, the `wordButtonsAnswer` `x-for`, `@click="wordButtonsRemoveWord(idx)"`, `x-text="word"`); added a `'correcta': sessionFeedback === 'correct'` toggle alongside the pre-existing `'incorrecta'` so CSS can render the green/red post-grading fill (D-08).
- Wrapped the feedback area into the shared `.session-feedback` box toggled `.correct`/`.wrong` by `sessionFeedback`. Inside it: hardcoded serif `¡Esatto!` (`x-show` correct) / `Quasi…` (`x-show` incorrect) — NOT x-text (D-09); the legacy `.wb-correct-answer` line folded in as `.session-feedback-correct` (Spanish copy, `<strong x-text="...answer.join(' ')">` preserved, shown only on incorrect); the existing `.session-explanation` `<p>` (dual-guard preserved); the existing `.session-why` "¿Por qué?" button (preserved).
- Applied `.session-cta` to the unchanged button-row Comprobar (`@click="wordButtonsCheck" :disabled="!wordButtonsCanCheck"`, label hardcoded) → Siguiente (`@click="sessionAdvance"`, label hardcoded). Native model kept (no auto-advance, no 1-step conversion).

**Task 2 — Word-buttons CSS (app.css, appended to the Phase 33 section after 33-02's MC rules)**
- New "Phase 33 / Plan 03" sub-section consuming only `--ed-*`: `.wb-bank` margin + `.wb-bank button` pills (serif 18/500, `--ed-surface`, `--ed-border-soft` 1.5px, radius 12 `--ed-radius-ghost`, padding 10×16), hover border-darken (`@media (hover: hover)`), focus-visible 2px green outline.
- `.wb-placed { visibility: hidden }` reaffirmed (no-reflow placeholder intact); `.wb-answer` repainted to a stable styled gap (`--ed-surface`, `--ed-border-soft` 1.5px, radius 14 `--ed-radius-feedback`); `.wb-answer button` (placed words) repainted; `.wb-answer-empty::before` placeholder italic toward `--ed-faint` + sans.
- Post-grading fill mirroring MC `.session-gap`: `.wb-answer.correcta button` → green underline + `--ed-green`; `.wb-answer.incorrecta button` → red strikethrough + `--ed-red` (overriding the legacy Pico `.wb-answer.incorrecta` / `.wb-correct-answer` greens/reds by source order).
- `.kbd-hint` overridden to 0.65em relative, sans 500, `--ed-faint`. `.session-cta:disabled` → handoff `#dcd7cb` fill + `#a89f8c` text (`/* exception verbatim */`), box-shadow none — Comprobar disabled state.

## Verification

- `node --test tests/*.test.js` → **509 tests, 508 pass / 1 fail**. The single failure is the known preexisting `genero-numero` explanation-coverage mismatch (12 vs 13), unrelated to this UI plan. Zero net-new failures.
- Task 1 keep/Comprobar checks pass: all six preserved bindings present (`wordButtonsAddWord(entry.idx)`, `wordButtonsRemoveWord(idx)`, `wordButtonsCheck`, `wordButtonsCanCheck`, `bankWithKeys`, `kbd-hint`), `Comprobar`+`Siguiente` present.
- Task 2 automated check prints `PASS` (`.wb-bank` + `visibility: hidden` + `.kbd-hint` + radius-12/`--ed-radius-ghost` present).
- `grep -cE 'x-html=' index.html` → **0** (anti-XSS T-33-05 invariant; the 3 bare `x-html` substrings at lines 217/820/1075 are pre-existing documentation comments, none in the edited word-buttons region — same situation 33-01/33-02 documented).
- No `--pico-*` definition or reference introduced in the Plan 03 additions (verified by slicing app.css at the "Plan 03 — Word-buttons" banner → 0); no Pico `<link>` in index.html.

## Deviations from Plan

### Documentation note (not a code change)

**1. [Rule 1 - False-positive] Task 1 raw-substring `/x-html/g` check vs the canonical directive check**
- **Found during:** Task 1 verification.
- **Issue:** The Task 1 automated verify and the acceptance line use a raw substring scan (`/x-html/g` / `grep -c 'x-html'`) and expect 0. index.html already contains 3 `x-html` substrings at lines 217/820/1075 — all pre-existing documentation comments (e.g. "anti-XSS, NUNCA x-html") that predate this plan and lie OUTSIDE the edited word-buttons region (559-680). The raw-substring check therefore reports non-zero.
- **Resolution:** The canonical anti-XSS invariant (T-33-05) is "no `x-html=` directive binding", measured by `grep -cE 'x-html=' index.html` → **0**, which holds. This is the identical false-positive that 33-01 and 33-02 documented and accepted. No `x-html` was introduced; no code change needed.
- **Files modified:** none.

## Known Stubs

- None. The word-buttons sub-template is fully wired to live engine state (`bankWithKeys`, `wordButtonsAnswer`, `sessionFeedback`, `payload.answer`, `payload.explanation`); no placeholder/empty data paths introduced.

## Threat Flags

- None. T-33-05 (DOM injection) is mitigated as planned: `x-text` exclusive for `entry.word`, `word`, `payload.answer.join(' ')`, and `payload.explanation`; the ¡Esatto!/Quasi… titles, Comprobar/Siguiente labels, and ¹..⁹ key superscripts are hardcoded/derived strings via x-text, never x-html. T-33-06 (no new surface) holds — pure presentation, assemble-then-check mechanics unchanged.

## Self-Check: PASSED

- index.html, app.css — both modified files exist on disk; 33-03-SUMMARY.md created in the plan directory.
- Task commits 9a2da61 (markup) and f4fd301 (CSS) present in git history.
