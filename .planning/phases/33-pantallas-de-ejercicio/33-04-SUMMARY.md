---
phase: 33-pantallas-de-ejercicio
plan: 04
subsystem: ui-editoriale-session
tags: [brownfield-ui, editoriale, ex-04, anti-xss, match, per-pair, d-03, d-05, wcag-2.3.1]
requires:
  - "33-01 shared scaffolds (.session-feedback.correct/.wrong, .session-feedback-title, .session-cta, .session-explanation) + post-grading tint tokens (--ed-green-tint family) + the .status-dot currentColor badge technique (Phase 32 app.css 558-565)"
  - "33-03 latest feedback-box pattern (the .session-feedback wrapper + hardcoded serif title) to stay consistent with"
  - "Existing match engine mechanics (matchSelectLeft/matchPickRight, matchLeftIsConsumed/matchRightIsConsumed, matchSelectedLeftIdx, matchPairsConsumed, matchFlashIdx, matchHadFailure, D-61 immediate cascade)"
provides:
  - "EX-04 match Editoriale repaint over the intact PER-PAIR instant-validate + D-61 cascade flow (D-03): 2-column serif-17 pills (--ed-surface + --ed-border-soft, radius 13), green numeric badge per matched pair (green circle 20px + white Hanken 12/800 number) replacing the ¹/ᵃ suffixes (D-05)"
  - ".match-selected repainted to green 2.5px border + --ed-surface + green shadow 0 6px 16px rgba(47,125,86,.18); .match-consumed repainted to --ed-green-tint matched pill"
  - "Single-iteration ≤300ms .match-flash repainted toward --ed-red (WCAG 2.3.1 safe); optional 'N de M emparejadas' note (12px Hanken italic --ed-faint) derived read-only from matchPairsConsumed.length / matchLeft.length"
  - ".session-feedback box + hardcoded 'Quasi…' serif title + preserved .session-explanation/.session-why on final-failure feedback (consistent with 33-01/02/03); Siguiente repainted to .session-cta"
affects:
  - "Closes the Phase 33 per-type repaint trio (33-02 MC, 33-03 word-buttons, 33-04 match) — last exercise screen brought into Editoriale"
tech-stack:
  added: []
  patterns:
    - "Cascade-win via app.css source order over styles.css legacy .match-selected (Pico-blue outline) / .match-consumed (muted-grey opacity .55) / @keyframes match-flash-red (Pico reds)"
    - "Numeric badge number derived read-only from matchPairsConsumed (find p.leftIdx/rightIdx === idx → pairIdx+1); both halves of a pair share the same number; x-text on the derived number only (anti-XSS T-33-07)"
    - "Conscious deviation D-03 honored: PER-PAIR instant validate kept; NO match-all-then-Comprobar, NO disabled completion CTA"
    - "Single-iteration ≤300ms flash preserved (WCAG 2.3.1; ease-out 1, never loop)"
    - "Off-grid handoff-verbatim values (radius 13, padding 14, column gap 14, .18 shadow alpha) marked /* exception verbatim */"
key-files:
  created: []
  modified:
    - "index.html"
    - "app.css"
decisions:
  - "Badge number derives from matchPairsConsumed pairIdx+1 (the canonical payload.pairs index, stable + unique), not the shuffled matchLeft/matchRight idx — so BOTH halves of a matched pair show the SAME number. Defensive `?? idx` fallback never throws; pure read-only, no engine change"
  - "Built the green badge circle as a solid --ed-green background with white text rather than the literal currentColor inversion of .status-dot — .status-dot maps currentColor→background AND would also tint the glyph green; for a white number on green the direct fill is the robust equivalent of the same visual (technique source, not literal copy)"
  - "Kept the ¹..⁹ / ᵃ.. .kbd-hint suffix in the markup for the PRE-matched (interactive) state and hide it via CSS (.match-consumed .kbd-hint{display:none}) once matched — the badge replaces it only on matched pills, preserving the keyboard-shortcut affordance pre-match (D-69/visibleSlotIdx)"
  - "Applied BOTH D-05 optional states (candidate '?'/dashed border was the one NOT applied — see Omitted; the 'N de M emparejadas' note WAS applied since matchPairsConsumed.length/matchLeft.length is a clean read-only derivation with no new engine state)"
  - "Match has no 'correct' feedback box mid-flow (each pair validates at the click); the shared .session-feedback box appears only on final feedback, and since match only closes with feedback after a failure (matchHadFailure → correct=false), the hardcoded title is 'Quasi…' (no ¡Esatto! branch needed); the box renders neutrally if a 'correct' reveal ever fires via ¿Por qué?"
metrics:
  duration: ~20m
  completed: 2026-06-30
---

# Phase 33 Plan 04: Pantallas de ejercicio — Match EX-04 Summary

Repainted the match sub-template into the Editoriale language (EX-04) over the intact PER-PAIR instant-validate flow (CONSCIOUS DEVIATION D-03): each pair still validates the instant a left+right pick is made, with a single red flash + immediate D-61 cascade on the first failure — there is NO "match-all-then-Comprobar" model and NO disabled completion CTA (the EX-04 "CTA disabled until complete" sub-criterion is intentionally not met). Per D-05, the per-pair-compatible handoff states were applied: two columns of serif-17 pills on `--ed-surface` with `--ed-border-soft` borders (radius 13), a green numeric badge per matched pair (green circle 20px + white Hanken 12/800 number) replacing the `¹`/`ᵃ` suffixes, a green-tint fill on matched pills, the selected pill repainted to a green 2.5px border + green shadow, a single-iteration ≤300ms red flash, and an optional centered italic "N de M emparejadas" note. The shared `.session-feedback` box with a hardcoded serif `Quasi…` title wraps the preserved explanation on final-failure feedback (consistent with 33-01/02/03). Brownfield UI-only — `matchSelectLeft`/`matchPickRight`, the consumption getters, `matchPairsConsumed`, `matchFlashIdx`, `matchHadFailure`, the D-61 cascade, grading, sampler, and timer were not touched.

## What Was Built

**Task 1 — Match sub-template markup repaint (index.html, ~711-790)**
- Kept the `.match-grid`/`.match-col` 2-column structure, both `x-for`s with their `:key`s, `@click="matchSelectLeft(idx)"` / `@click="matchPickRight(idx)"`, the `:disabled` consumption+feedback guards, the `match-selected`/`match-consumed`/`match-flash` `:class` toggles, and the `:aria-label`s EXACTLY (D-03: per-pair flow untouched).
- Added a `.match-badge` `<span>` to each pill, shown via `x-show="matchLeftIsConsumed(idx)"` / `matchRightIsConsumed(idx)`, with the number derived read-only: `(matchPairsConsumed.find(p => p.leftIdx === idx)?.pairIdx ?? idx) + 1` (left) / `...p.rightIdx === idx...` (right). Both halves of a matched pair resolve to the same `pairIdx+1`. `x-text` on the derived number only (T-33-07).
- Kept the `<sup class="kbd-hint">` `¹..⁹` / `ᵃ..` suffix for the pre-matched interactive state; CSS hides it once matched so the badge replaces its role.
- Added an OPTIONAL centered `.match-note` (`<span x-text>N</span> de <span x-text>M</span> emparejadas`) driven by `matchPairsConsumed.length` vs `matchLeft.length`, `x-show` only mid-flow (feedback null, >0 and <total). Read-only derivation, no new engine state.
- Wrapped the existing explanation into the shared `.session-feedback` box (`:class` toggled `correct`/`wrong` by `sessionFeedback`) with a hardcoded serif `Quasi…` title (`x-show` incorrect; NOT x-text). Preserved the `.session-explanation` `<p>` (dual-guard) and the `.session-why` "¿Por qué?" button; repainted the Siguiente button to `.session-cta` (`@click="sessionAdvance"` unchanged).

**Task 2 — Match CSS (app.css, appended to the Phase 33 section after 33-03's word-buttons rules)**
- New "Phase 33 / Plan 04" sub-section consuming only `--ed-*`: `.match-grid` column gap 14px (`/* exception verbatim */`); `.match-col button` resting pill (serif 17 `/* verbatim */`, `--ed-surface`, `--ed-border-soft` 1.5px, radius 13 `/* verbatim */`, padding 14 `/* verbatim */`, `position: relative`), hover border-darken (`@media (hover: hover)`), focus-visible 2px green outline offset 2px, ~160ms transitions.
- `.match-selected` → green 2.5px border + `--ed-surface` + green shadow `0 6px 16px rgba(47,125,86,.18)` (`.18` alpha verbatim), removing the legacy blue Pico outline.
- `.match-consumed` → matched pill `--ed-green-tint` fill + `--ed-green-tint-border` + `--ed-green-on-tint` text, `opacity: 1` (annulling the legacy `.55`); `.match-consumed .kbd-hint { display: none }`.
- `.match-badge` → green circle 20px (`--ed-green` fill), white Hanken 12/800 number, inline-flex centered.
- `@keyframes match-flash-red` repainted toward `--ed-red`, `.match-flash { animation: match-flash-red 300ms ease-out 1 }` (single iteration, WCAG 2.3.1 safe — not a loop).
- `.match-note` → 12px Hanken italic, `--ed-faint`, centered.

## Verification

- `node --test tests/*.test.js` → **509 tests, 508 pass / 1 fail**. The single failure is the known preexisting `genero-numero` explanation-coverage mismatch (12 vs 13, "Categorías con explanation coverage (Phase 7.1+)"), unrelated to this UI plan. Zero net-new failures.
- Task 1 automated check prints `PASS` (all six preserved bindings present — `matchSelectLeft(idx)`, `matchPickRight(idx)`, `matchLeftIsConsumed`, `matchRightIsConsumed`, `match-grid`, `match-selected`, `match-flash` — and `x-html=` count 0).
- No "Comprobar" / match-all CTA in the match region (`grep -c Comprobar` over lines 711-790 → 0); the only CTA is the always-clickable Siguiente shown on feedback (D-03).
- Task 2 automated check prints `PASS` (`.match-selected` + `.match-consumed` + `--ed-green-tint` present; `match-flash-red ... ease-out 1` matched; no `infinite` within 80 chars of the keyframe).
- `grep -cE 'x-html=' index.html` → **0** (anti-XSS T-33-07 invariant; the 3 bare `x-html` substrings elsewhere are pre-existing documentation comments outside the match region — same accepted situation 33-01/02/03 documented).
- No `--pico-*` definition or reference in the Plan 04 additions (slice of app.css from the "Plan 04 — Emparejar" banner → 0); no Pico `<link>` in index.html.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Robustness] Badge built as direct green fill + white text instead of literal `.status-dot` currentColor inversion**
- **Found during:** Task 2.
- **Issue:** The `.status-dot` technique maps `currentColor` → `background-color`, which paints the circle green BUT also tints any contained glyph green. The match badge needs a WHITE number on the green circle, so a literal copy of the inversion would render an invisible (green-on-green) number; the only robust fix would be a brittle `-webkit-text-fill-color` override.
- **Fix:** Used the technique as guidance (a solid circular badge in the Editoriale green) but set `background-color: var(--ed-green)` directly with `color: #fff` for the number — same visual, no glyph-tint hazard, no vendor-prefixed text-fill hack.
- **Files modified:** app.css
- **Commit:** 9de5c60

### Documentation note (not a code change)

**2. [Rule 1 - False-positive] Plan's raw `x-html` substring grep vs the canonical directive check**
- The plan's acceptance line uses a raw substring scan (`grep -c 'x-html'`) and expects 0. index.html contains 3 pre-existing `x-html` substrings in documentation comments (outside the match region 711-790), so the raw scan reports non-zero. The canonical anti-XSS invariant (T-33-07) is "no `x-html=` directive binding", measured by `grep -cE 'x-html=' index.html` → **0**, which holds. Identical false-positive documented and accepted by 33-01/02/03. No code change needed.

## Omitted D-05 Optional State

- **Candidate "?" / dashed-border state OMITTED (D-05 planner discretion).** In the existing 2-column per-pair layout, when a left pill is selected the right column is NOT a set of "candidates to drop into a slot" — each right pill is independently clickable to attempt the pair, and the selection is undone after each attempt (the engine clears `matchSelectedLeftIdx` per pick). There is no single pending slot for a "?" placeholder to occupy, and a dashed border on every right pill would falsely imply they are all the target. Forcing it would distort the per-pair affordance (D-05 explicitly allows omission of states that do not fit the 2-column layout cleanly). The selected-pill green border + shadow already carries the "active selection, now pick its partner" cue. The other D-05 optional state — the "N de M emparejadas" note — WAS applied (clean read-only derivation, no new engine state).

## Known Stubs

- None. The match sub-template is fully wired to live engine state (`matchLeft`/`matchRight`, `matchPairsConsumed`, `matchSelectedLeftIdx`, `matchLeftIsConsumed`/`matchRightIsConsumed`, `matchFlashIdx`, `sessionFeedback`, `payload.explanation`); no placeholder/empty data paths introduced. The badge number and note both derive from real consumed-pair state.

## Threat Flags

- None. T-33-07 (DOM injection) is mitigated as planned: `x-text` exclusive for `item` (both columns) and `payload.explanation`; the badge numbers, the "N"/"M" note counts, the `Quasi…` title, and the `aria-label`s are derived/hardcoded strings via x-text/attributes, never x-html. T-33-08 (no new surface) holds — pure presentation; the per-pair flow (`matchSelectLeft`/`matchPickRight`/D-61 cascade) is unchanged. T-33-09 (accessibility) holds — `.match-flash` stays single-iteration ≤300ms (WCAG 2.3.1).

## Self-Check: PASSED

- index.html, app.css — both modified files exist on disk; 33-04-SUMMARY.md created in the plan directory.
- Task commits 0e22c09 (markup) and 9de5c60 (CSS) present in git history.
