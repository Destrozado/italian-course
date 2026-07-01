---
status: complete
phase: 33-pantallas-de-ejercicio
source: [33-VERIFICATION.md]
started: 2026-06-30T00:00:00Z
updated: 2026-06-30T00:00:00Z
---

## Current Test

[testing complete — 6/6 functional pass; in-scope option-height defect fixed (3437af7-era app.css); 2 mobile-responsive items deferred to backlog]

## Tests

### 1. Multiple-choice comprobado states (visual + interaction)
expected: Run `npx serve`, start a Repaso (multiple-choice). Tapping an option grades INSTANTLY (no Comprobar). Correct option → green-tint + ✓; chosen-wrong → red-tint + ✗; others dim to opacity 0.5. Feedback box shows ¡Esatto!/Quasi… + explanation. Prompt gap fills with the USER'S CHOSEN answer (green underline if correct, red strikethrough if wrong). CTA reads "Continuar →". ¿Por qué? appears on correct. Advance is manual.
result: pass

### 2. Editoriale top bar (visual)
expected: Circular ‹ back button top-left. Green progress bar grows as exercises advance. NN/NN counter in Space Grotesk (monospace). "Reiniciar ejercicios" and "← Volver al home" remain at the bottom under the hr.
result: pass

### 3. Contrarreloj timer chip (visual + interaction)
expected: In a Contrarreloj (timed) session, a timer chip with remaining seconds appears in the top bar AND the depleting progress bar (.session-timer-bar) remains visible alongside it.
result: pass

### 4. Match per-pair flow + states (visual + interaction)
expected: Selected left pill → green 2.5px border + green shadow. Correct pair → both pills green-tint with a numeric badge (green circle, white number). Wrong pick → single red flash (~300ms) + immediate D-61 cascade. NO "Comprobar" CTA. Optional "N de M emparejadas" italic note mid-flow. Siguiente shows only on final-failure feedback.
result: pass

### 5. Word-buttons Editoriale repaint (visual + interaction)
expected: Bank shows serif pills with ¹..⁹ superscripts on --ed-surface. Placing a word leaves an invisible stable placeholder (no reflow). Comprobar disabled until the answer is complete (#dcd7cb). On check: feedback box ¡Esatto!/Quasi… + explanation; answer area fills green-underline (correct) / red-strikethrough (wrong). Siguiente advances.
result: pass

### 6. Keyboard focus-visible + non-chromatic marks (accessibility)
expected: Tabbing shows a focus-visible ring (2px green, 2px offset) on options, pills, bank/answer buttons, back button, and bottom CTA. ✓/✗ glyphs on MC options are visible (meaning is non-chromatic).
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

result-notes: All 6 functional/visual checkpoints passed (instant-grade states, top bar, timer chip, match per-pair, word-buttons, keyboard focus). 2 layout issues surfaced during testing — see Gaps.

## Gaps

- truth: "Multiple-choice option buttons size to their content (~one line) and all options + the Continuar CTA fit without scrolling."
  status: resolved
  reason: "User reported each option is ~128px tall on mobile; with the ~234px prompt, only 3 of 4 options are visible and the user must scroll to reach the 4th option / the Continuar CTA. ROOT CAUSE (confirmed): the MC options markup is `<div class=\"button-row session-options\">`; legacy styles.css `.button-row button { flex: 1 }` (designed for horizontal equal-width) combines with `.session-options { flex-direction: column }` inside `.session { min-height: calc(100vh - 64px) }`, so each option grew vertically to fill the tall column. Affects desktop tall windows too, acute on mobile."
  resolution: "Added `flex: 0 0 auto` to `.session-options button` in app.css (commit follows). Options now size to content; user re-verified on mobile that all options + Continuar CTA fit without scrolling."
  severity: major
  test: "during-6"
  artifacts: [app.css (.session-options button)]
  scope: "Phase 33 — in scope (defect introduced by this phase's repaint), FIXED"

- truth: "On mobile, exercise-screen content uses the full width (no oversized figure side-margins) and the prompt is sized comfortably."
  status: deferred
  reason: "User reported (a) everything inside `<figure>` has large lateral margins on mobile, narrowing content (setting figure margin-left/right:0 looks better) — this is the HOME/Categorías screen (Phase 32), not the exercise screen; and (b) the 30px serif prompt feels too big on mobile (e.g. a one-sentence prompt + Spanish gloss is ~234px tall). Both are mobile-responsive concerns; CLAUDE.md/UI-SPEC scope v1 as DESKTOP-ONLY (responsive deferred — see orphan Phase 28 + backlog 'responsive móvil')."
  severity: minor
  test: "during-6"
  artifacts: [styles.css (@media max-width:640px figure/article margins), app.css (.session-prompt 30px)]
  missing: ["mobile media-query treatment for figure gutters and prompt font-size — out of v1 desktop-only scope"]
  scope: "Deferred — mobile-responsive (Phase 32 Home + global); not Phase 33 desktop scope"
