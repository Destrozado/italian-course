---
phase: 33-pantallas-de-ejercicio
verified: 2026-06-30T00:00:00Z
status: passed
score: 5/5 must-haves verified
overrides_applied: 0
re_verification: "Human UAT passed 6/6 (33-HUMAN-UAT.md). One in-scope layout defect surfaced + fixed (option buttons stretched to ~128px via .button-row flex:1 + column → flex:0 0 auto). Two mobile-responsive items deferred to backlog (desktop-only v1)."
gaps: []
human_verification:
  - test: "Run `npx serve`, start a Repaso exercise (multiple-choice). Tap an option."
    expected: "Option grades instantly (no Comprobar step). Correct option fills green-tint + ✓. Chosen wrong fills red-tint + ✗. Others dim to opacity 0.5. A feedback box shows ¡Esatto!/Quasi… + explanation. Gap in prompt fills with user's chosen answer (green underline if correct, red strikethrough if wrong). CTA reads 'Continuar →'. ¿Por qué? appears on correct. Advance is manual."
    why_human: "Color tinting, glyph rendering, opacity dim, prompt gap fill, Continuar CTA label, and interactive flow cannot be grepped from static files."
  - test: "Run `npx serve`, start a Repaso exercise and verify the top bar elements."
    expected: "Circular ‹ back button top-left. Green progress bar grows as exercises advance. NN/NN counter in monospace (Space Grotesk). Reiniciar ejercicios and ← Volver al home remain at the bottom under the hr."
    why_human: "Progress bar width binding and visual layout require a live browser to confirm."
  - test: "Run `npx serve`, start a Contrarreloj (timed) session."
    expected: "A timer chip showing remaining seconds appears in the top bar AND the depleting progress bar (session-timer-bar) remains visible alongside it."
    why_human: "Timer chip visibility and the dual-bar-plus-chip Contrarreloj presentation cannot be verified without running the app."
  - test: "Run `npx serve`, start a match exercise. Select a left pill, then pick the correct right pill."
    expected: "Selected left pill shows green 2.5px border + green shadow. Correct pair: both pills turn green-tint with a numeric badge (green circle, white number). A wrong pick triggers a single red flash (~300ms) and the immediate D-61 cascade. No 'Comprobar' CTA is present. Optional 'N de M emparejadas' italic note appears mid-flow. Siguiente shows only on final failure feedback."
    why_human: "Animation timing (300ms single-iteration flash), per-pair cascade behavior, numeric badge rendering, and absence of disabled CTA require live browser verification."
  - test: "Run `npx serve`, start a word-buttons exercise. Place words, press Comprobar, then Siguiente."
    expected: "Bank shows serif pills with ¹..⁹ superscripts on --ed-surface. Placing a word leaves an invisible stable placeholder (no reflow). Comprobar is disabled until the answer is complete. On check: feedback box shows ¡Esatto!/Quasi… + explanation. Answer area fills green-underline (correct) or red-strikethrough (wrong). Siguiente advances."
    why_human: "No-reflow placeholder technique, Comprobar disabled state visual (#dcd7cb), answer-area fill, and Siguiente flow require live browser verification."
  - test: "In any exercise screen, press Tab and navigate with keyboard."
    expected: "Focus-visible ring (2px green, 2px offset) appears on options, pills, bank/answer buttons, back button, and bottom CTA. ✓/✗ glyphs on MC options are visible non-chromatically."
    why_human: "Focus-visible state and non-chromatic meaning require a keyboard-driven browser test."
---

# Phase 33: Pantallas de ejercicio Verification Report

**Phase Goal:** Las pantallas de práctica/examen (opción múltiple, emparejar, word-buttons) adoptan el lenguaje Editoriale con barra superior unificada, recreando los estados de selección/comprobado del handoff sobre el motor intacto.
**Verified:** 2026-06-30T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | Every exercise screen shows the Editoriale top bar: circular back button (‹) with `aria-label="Volver al home"`, green progress bar bound to `sessionProgressPercent`, NN/NN counter in Space Grotesk | ✓ VERIFIED | `index.html` line 401-414: `<button class="session-back" @click="requestReturnToHome" aria-label="Volver al home">‹</button>`; `<span class="session-progress-fill" :style="'width:' + sessionProgressPercent + '%'">`, `<span class="session-counter" x-text="sessionProgressCounter">`. CSS `.session-counter` uses `var(--ed-font-mono)` (Space Grotesk). |
| 2  | When Contrarreloj is active, a timer chip (remaining seconds, Space Grotesk) shows AND the depleting progress bar stays (D-11) | ✓ VERIFIED | `index.html` line 423-429: `<div class="session-timer" x-show="sessionTimed && sessionFeedback === null">` + `<progress class="session-timer-bar" :max="sessionTimeLimitMs(sessionCurrentExercise)" :value="sessionTimeRemainingMs">` + `<span class="session-timer-secs session-timer-chip" x-text="Math.ceil(sessionTimeRemainingMs / 1000) + 's'">`. Timer expressions byte-identical to pre-Phase-33 baseline. |
| 3  | The back button calls existing `requestReturnToHome` (confirmation preserved) and carries `aria-label="Volver al home"` | ✓ VERIFIED | `index.html` line 401-404: `@click="requestReturnToHome"` + `aria-label="Volver al home"` static attribute. `requestReturnToHome` count = 6 (unchanged from baseline; engine untouched). |
| 4  | Question block shows category overline (uppercase Hanken 11, `--ed-faint-2`) reusing `sessionContextLabel`, and serif-30 prompt with styled `___` gap (empty pre-grading; green-underline correct / red-strikethrough wrong post-grading) | ✓ VERIFIED | `index.html` line 434: `<h2 class="session-context" x-text="sessionContextLabel">`. CSS `.session-context` has `font-size: 11px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: var(--ed-faint-2)`. Prompt split via `sessionPromptParts` getter (line 449-463). CSS `.session-gap` (min-width 2.2em, border-bottom), `.gap-correct` (green underline), `.gap-wrong` (red strikethrough). |
| 5  | Post-grading gap fill shows user's chosen answer (WR-02 fixed: uses `sessionSelectedIndex` not `correctIndex`) | ✓ VERIFIED | `index.html` line 460: `x-text="sessionFeedback !== null ? (sessionCurrentExercise.payload.options?.[sessionSelectedIndex] ?? '') : ''"`. Commit 3437af7 changed from `correctIndex` to `sessionSelectedIndex`. |
| 6  | Multiple-choice stays 1-STEP (D-01): no Comprobar button, no `green-selection` pre-check state; comprobado states DO apply (green-tint ✓ / red-tint ✗ / rest dim 0.5); feedback box with ¡Esatto!/Quasi… + explanation; Continuar → CTA; ¿Por qué? preserved (D-02/D-04/D-09) | ✓ VERIFIED | `grep -c 'green-selection' index.html` = 0. `@click="sessionSelectOption(perm)"` preserved. `.correcta`/`.incorrecta` `:class` toggles preserved. `¡Esatto!`/`Quasi` hardcoded titles in `.session-feedback` box. `Continuar` CTA present. `revealSessionExplanation()` preserved. CSS: `button.correcta` → `--ed-green-tint` + `--ed-green` border + `--ed-green-on-tint` + `::after "✓"`. `button.incorrecta` → `--ed-red-tint` + `--ed-red` border + `--ed-red-text` + `::after "✗"`. Dim rule: `.session-options button:disabled:not(.correcta):not(.incorrecta) { opacity: 0.5 }`. |
| 7  | Match stays per-pair (D-03): each pair validates instantly; NO match-all-then-Comprobar, NO disabled CTA; matched pairs show green-tint pills with numeric badge; selected pill shows green 2.5px border + shadow; failure flash = single-iteration ≤300ms (WCAG 2.3.1 safe); optional "N de M emparejadas" note (D-05) | ✓ VERIFIED | `matchSelectLeft(idx)`, `matchPickRight(idx)`, `match-grid`, `match-selected`, `match-consumed`, `match-flash` all present. 0 Comprobar occurrences in match section. CSS `.match-selected` → `border: 2.5px solid var(--ed-green); box-shadow: 0 6px 16px rgba(47,125,86,0.18)`. `.match-consumed` → `--ed-green-tint` fill + badge. `.match-badge` = green circle 20px + white Hanken 12/800 number. `animation: match-flash-red 300ms ease-out 1` (single iteration). `.match-note` → 12px Hanken italic, `--ed-faint`. |
| 8  | Word-buttons extrapolated to Editoriale (D-12): bank pills on `--ed-surface`/`--ed-border-soft`/radius 12 with ¹..⁹ superscripts; `.wb-placed { visibility: hidden }` no-reflow preserved; answer area fills green-underline (correct) / red-strikethrough (wrong); feedback box with ¡Esatto!/Quasi…; native Comprobar (disabled until canCheck) → Siguiente preserved | ✓ VERIFIED | `wordButtonsAddWord(entry.idx)`, `wordButtonsRemoveWord(idx)`, `wordButtonsCheck`, `wordButtonsCanCheck`, `bankWithKeys`, `kbd-hint` all present. `.wb-placed { visibility: hidden }` in CSS. `.wb-answer.correcta button` → green underline. `.wb-answer.incorrecta button` → red strikethrough. ¡Esatto!/Quasi… hardcoded in feedback box. `.session-cta:disabled` → `#dcd7cb`/`#a89f8c` (handoff disabled colors). |
| 9  | Engine invariant: grading/cascade/sampler/localStorage/schema/timer NOT behaviorally changed; `x-html=` directive = 0; no Pico reintroduced; `--ed-*` palette not redefined | ✓ VERIFIED | `grep -cE 'x-html=' index.html` = 0. `grep -cE 'x-html=' src/screens/app.js` = 0. No `<link.*pico>`. `applyResultToSession|sessionSelectOption` count in app.js = 31 (unchanged from 33-01 baseline). Six tint tokens added (net-new); no base `--ed-*` token redefined. Phase 32 GAP-01 compat shim `--pico-*` remaps predate Phase 33 and are unchanged. |
| 10 | Reiniciar ejercicios + ← Volver al home stay at the bottom under the `<hr>` | ✓ VERIFIED | `index.html` lines 841-842: `@click="restartRepaso">Reiniciar ejercicios</button>` + `@click="requestReturnToHome">← Volver al home</button>` preserved verbatim. |
| 11 | Tests: 508 pass / 1 fail (single known preexisting `genero-numero` explanation-coverage mismatch — unrelated to Phase 33) | ✓ VERIFIED | `node --test tests/*.test.js` → 509 tests, 508 pass, 1 fail. The single failure is `genero-numero.json` 12-vs-13 explanation coverage mismatch, confirmed preexisting (predates Phase 33). Zero new failures. |

**Score:** 5/5 ROADMAP success criteria verified (11/11 derived truths VERIFIED)

### Code Review Resolution

| Finding | Severity | Status | Evidence |
|---------|----------|--------|----------|
| CR-01: Shared gap-fill prompt renders empty styled slot for word-buttons/match | BLOCKER (review) | FALSE POSITIVE ON IMPACT | Programmatic content survey: zero word-buttons variants and zero match variants have `___` in `payload.prompt`. All 521 exercises with `___` in prompts are `multiple-choice` type. The empty styled slot never manifests in the actual exercise content. |
| WR-02: Incorrect MC fills gap with correct answer struck through | WARNING | FIXED (commit 3437af7) | Gap `x-text` changed from `options?.[payload.correctIndex]` to `options?.[sessionSelectedIndex]` — now shows user's wrong answer struck through, not correct answer. |
| WR-01: Multi-gap prompts render same answer in both slots | WARNING | KNOWN, MINOR | Only 2 MC exercises affected (profesiones.json feminine-masc pairs). Both have 2x `___`; the gap renders a second slot with the same single correct option. Cosmetically imperfect for those 2 exercises. Not a blocking concern for a personal single-user tool. |
| WR-03: Tests not exercised for wb/match prompt types | WARNING | RESOLVED BY CR-01 FALSE POSITIVE | Since no wb/match content has `___` prompts, the absent cross-type test coverage has no observable gap to protect against. Noted for defense-in-depth only. |
| IN-01: `sessionProgressCounter` lacks divide-by-zero guard | INFO | NOT FIXED, NOT USER-FACING | Counter returns "1/0" with empty set, but the outer `x-if="currentScreen === 'session' && sessionCurrentExercise"` unmounts before this is visible. Not blocking. |
| IN-02: Match badge fallback `?? idx` masks lookup failures | INFO | NOT FIXED, ACCEPTABLE | The `x-show="matchLeftIsConsumed(idx)"` guard ensures `find()` should always succeed when the badge is shown. The `?? idx` is a defensive no-throw fallback. Noted for completeness. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `app.css` | Phase 33 session section + 6 tint tokens + CSS for all 3 exercise types | ✓ VERIFIED | Lines 172-1292 contain Phase 33 sections: EX-01/EX-02 foundation (671), Plan 02 MC (929), Plan 03 WB (1029), Plan 04 Match (1174). All 6 tint tokens in `:root`. |
| `src/screens/app.js` | 3 read-only presentational getters: `sessionProgressPercent`, `sessionProgressCounter`, `sessionPromptParts` | ✓ VERIFIED | Lines 2616, 2629, 2653 — all three getters present with double-defense unmount guards. |
| `index.html` | Repainted session block: top bar + 3 exercise type sub-templates | ✓ VERIFIED | Session block repainted at lines 390-845: top bar (398-430), shared prompt/overline (432-463), MC sub-template (470-556), WB sub-template (580-710), match sub-template (711-845). |
| `tests/screen-session-editorial.test.js` | 14 new tests for tint tokens + 3 presentational getters (TDD cycle) | ✓ VERIFIED | Created in 33-01 (commit 67d2cd5 RED → f8bae7b GREEN). 14 tests pass. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.html` top bar back button | `requestReturnToHome` | `@click` on `.session-back` | ✓ WIRED | Line 403: `@click="requestReturnToHome"` |
| `index.html` progress bar fill | `sessionProgressPercent` getter | `:style` width binding | ✓ WIRED | Line 410: `:style="'width:' + sessionProgressPercent + '%'"` |
| `index.html` NN/NN counter | `sessionProgressCounter` getter | `x-text` | ✓ WIRED | Line 414: `x-text="sessionProgressCounter"` |
| `index.html` prompt | `sessionPromptParts` getter | `x-for` over parts array | ✓ WIRED | Line 449: `x-for="(part, idx) in sessionPromptParts"` |
| `index.html` MC option | `sessionSelectOption / applyResultToSession` | `@click` instant-grade | ✓ WIRED | Line 498: `@click="sessionSelectOption(perm)"` (unchanged) |
| `app.css` `button.correcta` | `--ed-green-tint` tokens | tint fill + border + glyph | ✓ WIRED | CSS overrides `button.correcta` with `background: var(--ed-green-tint); border-color: var(--ed-green)` |
| `index.html` match pill | `matchSelectLeft / matchPickRight` | `@click` + `:class` | ✓ WIRED | Lines 717-722, 744-749: both `@click` handlers and all `:class` toggles preserved |
| `app.css` `.match-consumed` | `--ed-green-tint` tokens | matched pill tint + badge | ✓ WIRED | CSS: `.match-consumed { background: var(--ed-green-tint); }` + `.match-badge` green circle |
| `index.html` bank button | `wordButtonsAddWord / bankWithKeys` | `@click` + `x-for` | ✓ WIRED | Lines 584-594: `x-for="(entry, idx) in bankWithKeys"` + `@click="wordButtonsAddWord(entry.idx)"` |
| `index.html` Comprobar | `wordButtonsCheck / wordButtonsCanCheck` | `:disabled` + `@click` | ✓ WIRED | `:disabled="!wordButtonsCanCheck"` + `@click="wordButtonsCheck"` preserved |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|--------------------|--------|
| `index.html` session-counter | `sessionProgressCounter` | `sessionCursor + 1` / `sessionExerciseIds.length` (engine state) | Yes — live cursor state | ✓ FLOWING |
| `index.html` session-gap fill | `payload.options[sessionSelectedIndex]` | Engine state `sessionSelectedIndex` + exercise payload | Yes — user's chosen answer | ✓ FLOWING |
| `index.html` match-badge | `matchPairsConsumed.find(...)?.pairIdx` | Engine `matchPairsConsumed` array (per-pair consume log) | Yes — actual pair consumption data | ✓ FLOWING |
| `index.html` match-note | `matchPairsConsumed.length` / `matchLeft.length` | Engine state | Yes — live consumed-pair count | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 6 tint tokens present in app.css | `grep -cE '\-\-ed-green-tint:|\-\-ed-green-tint-border:|\-\-ed-green-on-tint:|\-\-ed-red-tint:|\-\-ed-red-tint-border:|\-\-ed-red-text:' app.css` | 6 | ✓ PASS |
| 3 getters present in app.js | `grep -c 'sessionProgressPercent\|sessionProgressCounter\|sessionPromptParts' src/screens/app.js` | 3 | ✓ PASS |
| No x-html= directive bindings | `grep -cE 'x-html=' index.html` | 0 | ✓ PASS |
| Match flash single-iteration | `grep -A2 '.match-flash' app.css` contains `ease-out 1` | `animation: match-flash-red 300ms ease-out 1` | ✓ PASS |
| wb-placed visibility hidden | `grep -cE 'visibility.*hidden' app.css` | 2 | ✓ PASS |
| Test suite: 508 pass / 1 preexisting fail | `node --test tests/*.test.js` | 509 tests, 508 pass, 1 fail (genero-numero) | ✓ PASS |

### Probe Execution

No probes declared or applicable for this UI-only brownfield phase.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EX-01 | 33-01 | Editoriale top bar: circular back, green progress, NN/NN counter, Contrarreloj chip | ✓ SATISFIED | Back button + progress bar + counter + timer chip present in `index.html` (lines 398-430); all bindings wired to engine state and new getters |
| EX-02 | 33-01 | Question block: overline + serif-30 prompt + styled gap; italic suggestion OMITTED per D-07 | ✓ SATISFIED | `session-context` overline (line 434), `session-prompt` with `sessionPromptParts` gap split (448-463); italic suggestion correctly absent per documented D-07 decision |
| EX-03 | 33-02 | Multiple-choice comprobado states (green-tint ✓ / red-tint ✗ / rest dim) + feedback box + Continuar CTA; D-01/D-02 deviation honored | ✓ SATISFIED (with conscious deviation D-01) | 1-step instant grade preserved; comprobado CSS states verified; ¡Esatto!/Quasi… titles; Continuar → CTA; no Comprobar button; no green-selection |
| EX-04 | 33-04 | Match: 2-col pills + numeric badge + green-tint matched + active/emparejada states + "N de M" note; D-03/D-05 deviation honored | ✓ SATISFIED (with conscious deviations D-03/D-05) | Per-pair flow preserved; numeric badge CSS + markup; green-tint matched; single red flash; note present; candidate "?"/dashed border omitted per D-05 |
| EX-05 | 33-03 | Word-buttons extrapolated to Editoriale: bank + stable gaps + green/red feedback consistent with EX-03 | ✓ SATISFIED | Bank pills Editoriale; wb-placed no-reflow; answer area fill; ¡Esatto!/Quasi… feedback; Comprobar → Siguiente native model |

All 5 requirements EX-01..EX-05 assigned to Phase 33 are SATISFIED (with the two documented conscious deviations). No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `index.html` | 448-463 | `session-prompt` gap block in shared scaffold | ⚠️ WARNING | Structural — renders for all exercise types, but CR-01 confirmed false-positive on impact: zero wb/match content has `___` in prompts. No user-visible empty slot occurs with actual content. |
| `index.html` | 449-462 | Multi-gap render for 2 MC exercises with 2x `___` | ℹ️ INFO | Cosmetic for 2/521 MC exercises in `profesiones.json` (masc/fem pair prompts). Both gap slots fill with same single-option answer. Not blocking for a personal single-user tool. |
| `src/screens/app.js` | 2629 | `sessionProgressCounter` lacks divide-by-zero guard | ℹ️ INFO | Not user-facing — outer `x-if` unmounts the template before the counter is rendered with empty set. |

No `TBD`, `FIXME`, or `XXX` markers found in Phase 33 modified files.

### Human Verification Required

#### 1. Multiple-Choice Comprobado States (Visual + Interaction)

**Test:** Run `npx serve`, start a Repaso exercise (multiple-choice). Tap an option.
**Expected:** Option grades instantly (no Comprobar step). Correct option fills green-tint + ✓. Chosen wrong fills red-tint + ✗. Others dim to opacity 0.5. A feedback box shows ¡Esatto!/Quasi… + explanation. Gap in prompt fills with user's chosen answer (green underline if correct, red strikethrough if wrong). CTA reads "Continuar →". ¿Por qué? appears on correct. Advance is manual.
**Why human:** Color tinting, glyph rendering, opacity dim, prompt gap fill, Continuar CTA label, and interactive flow cannot be grepped from static files.

#### 2. Editoriale Top Bar (Visual)

**Test:** Run `npx serve`, start a Repaso exercise and verify the top bar elements.
**Expected:** Circular ‹ back button top-left. Green progress bar grows as exercises advance. NN/NN counter in monospace (Space Grotesk). Reiniciar ejercicios and ← Volver al home remain at the bottom under the hr.
**Why human:** Progress bar width binding and visual layout require a live browser to confirm.

#### 3. Contrarreloj Timer Chip (Visual + Interaction)

**Test:** Run `npx serve`, start a Contrarreloj (timed) session.
**Expected:** A timer chip showing remaining seconds appears in the top bar AND the depleting progress bar (session-timer-bar) remains visible alongside it.
**Why human:** Timer chip visibility and the dual-bar-plus-chip Contrarreloj presentation cannot be verified without running the app.

#### 4. Match Per-Pair Flow + States (Visual + Interaction)

**Test:** Run `npx serve`, start a match exercise. Select a left pill, then pick the correct right pill.
**Expected:** Selected left pill shows green 2.5px border + green shadow. Correct pair: both pills turn green-tint with a numeric badge (green circle, white number). A wrong pick triggers a single red flash (~300ms) and the immediate D-61 cascade. No "Comprobar" CTA is present. Optional "N de M emparejadas" italic note appears mid-flow. Siguiente shows only on final failure feedback.
**Why human:** Animation timing (300ms single-iteration flash), per-pair cascade behavior, numeric badge rendering, and absence of disabled CTA require live browser verification.

#### 5. Word-Buttons Editoriale Repaint (Visual + Interaction)

**Test:** Run `npx serve`, start a word-buttons exercise. Place words, press Comprobar, then Siguiente.
**Expected:** Bank shows serif pills with ¹..⁹ superscripts on --ed-surface. Placing a word leaves an invisible stable placeholder (no reflow). Comprobar is disabled until the answer is complete. On check: feedback box shows ¡Esatto!/Quasi… + explanation. Answer area fills green-underline (correct) or red-strikethrough (wrong). Siguiente advances.
**Why human:** No-reflow placeholder technique, Comprobar disabled state visual (#dcd7cb), answer-area fill, and Siguiente flow require live browser verification.

#### 6. Keyboard Accessibility + Focus-Visible

**Test:** In any exercise screen, press Tab and navigate with keyboard.
**Expected:** Focus-visible ring (2px green, 2px offset) appears on options, pills, bank/answer buttons, back button, and bottom CTA. ✓/✗ glyphs on MC options are visible non-chromatically.
**Why human:** Focus-visible state and non-chromatic meaning require a keyboard-driven browser test.

### Gaps Summary

No blocking gaps identified. All 5 ROADMAP success criteria are verified in the codebase. The phase goal is achieved:

- The Editoriale top bar (EX-01), question block with styled gap (EX-02), multiple-choice comprobado states (EX-03), match per-pair Editoriale states (EX-04), and word-buttons Editoriale extrapolation (EX-05) are all implemented in `index.html` and `app.css`.
- The engine (cascade D-54, grading, sampler, localStorage, schema, timer mechanics) was not behaviorally changed.
- All conscious deviations (D-01 1-step MC, D-03 per-pair match, D-05 candidate state omitted, D-07 italic suggestion omitted) were honored and are locked in CONTEXT.md and the ROADMAP.
- WR-02 from the code review was fixed (gap shows user's chosen answer on incorrect MC, not the correct answer).
- CR-01 from the code review is confirmed false-positive on impact: the actual exercise content has zero word-buttons or match variants with `___` in prompts.

Status is `human_needed` (not `passed`) because the visual appearance and interactive runtime behavior require live browser verification.

---

_Verified: 2026-06-30T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
