---
status: partial
phase: 33-pantallas-de-ejercicio
source: [33-VERIFICATION.md]
started: 2026-06-30T00:00:00Z
updated: 2026-06-30T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Multiple-choice comprobado states (visual + interaction)
expected: Run `npx serve`, start a Repaso (multiple-choice). Tapping an option grades INSTANTLY (no Comprobar). Correct option → green-tint + ✓; chosen-wrong → red-tint + ✗; others dim to opacity 0.5. Feedback box shows ¡Esatto!/Quasi… + explanation. Prompt gap fills with the USER'S CHOSEN answer (green underline if correct, red strikethrough if wrong). CTA reads "Continuar →". ¿Por qué? appears on correct. Advance is manual.
result: [pending]

### 2. Editoriale top bar (visual)
expected: Circular ‹ back button top-left. Green progress bar grows as exercises advance. NN/NN counter in Space Grotesk (monospace). "Reiniciar ejercicios" and "← Volver al home" remain at the bottom under the hr.
result: [pending]

### 3. Contrarreloj timer chip (visual + interaction)
expected: In a Contrarreloj (timed) session, a timer chip with remaining seconds appears in the top bar AND the depleting progress bar (.session-timer-bar) remains visible alongside it.
result: [pending]

### 4. Match per-pair flow + states (visual + interaction)
expected: Selected left pill → green 2.5px border + green shadow. Correct pair → both pills green-tint with a numeric badge (green circle, white number). Wrong pick → single red flash (~300ms) + immediate D-61 cascade. NO "Comprobar" CTA. Optional "N de M emparejadas" italic note mid-flow. Siguiente shows only on final-failure feedback.
result: [pending]

### 5. Word-buttons Editoriale repaint (visual + interaction)
expected: Bank shows serif pills with ¹..⁹ superscripts on --ed-surface. Placing a word leaves an invisible stable placeholder (no reflow). Comprobar disabled until the answer is complete (#dcd7cb). On check: feedback box ¡Esatto!/Quasi… + explanation; answer area fills green-underline (correct) / red-strikethrough (wrong). Siguiente advances.
result: [pending]

### 6. Keyboard focus-visible + non-chromatic marks (accessibility)
expected: Tabbing shows a focus-visible ring (2px green, 2px offset) on options, pills, bank/answer buttons, back button, and bottom CTA. ✓/✗ glyphs on MC options are visible (meaning is non-chromatic).
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
