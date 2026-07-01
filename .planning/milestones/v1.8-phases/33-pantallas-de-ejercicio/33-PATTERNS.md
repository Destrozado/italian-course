# Phase 33: Pantallas de ejercicio - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 3 (index.html session block, styles.css, app.css) + 1 getter file (src/screens/app.js)
**Analogs found:** 3 / 3 (all in-repo; the freshest analog is the Phase 32 Home repaint)

> **BROWNFIELD UI-ONLY REPAINT.** The files to modify are already known and the closest analog is, in most cases, **the same file / same block** being repainted. The single freshest precedent for "repaint an existing screen into Editoriale without touching logic" is the **Phase 32 Home repaint** (`app.css` lines 409-656): it consumes `--ed-*` tokens, restyles existing markup that keeps its Alpine bindings, and demonstrates the status-dot/streak-bar/table-restyle techniques. Map every Phase 33 repaint onto that precedent.

---

## Binding Invariants (apply to ALL markup work)

| Invariant | Rule | Source |
|-----------|------|--------|
| **T-02-01 anti-XSS** | `x-text` is the **exclusive** data binding. NEVER introduce `x-html`. All data (prompt, options, explanation, words, pairs) flows through `x-text`. Button labels (Continuar / Siguiente / Comprobar / ¿Por qué?) stay **hardcoded** in markup, not dynamic. | index.html lines 457, 481-483, 571; UI-SPEC §15 |
| **Engine untouched** | Do NOT modify `sessionSelectOption`, `applyResultToSession`, `applyImmediateFailure`, grading (`registry[type].grade`), the D-54/D-61 cascade, sampler, slot-engine, `localStorage`, schema, migrations. Repaint = markup + CSS + presentational getters ONLY. | CONTEXT D-01..D-12; UI-SPEC banner |
| **Bindings preserved** | The new markup reuses the SAME `@click` / `x-show` / `x-for` / `:class` / `:disabled` handlers and getters. "Estética cambia, componentes/getters Alpine se conservan" — identical to Phase 32. | CONTEXT §Established Patterns |
| **Double-defense Alpine** | Keep outer guard `x-if="currentScreen === 'session' && sessionCurrentExercise"` + inner null-checks (`matchFlashIdx && matchFlashIdx.left === idx`). | index.html line 390, 593 |
| **Tokens are reused, not redefined** | Reuse Phase 32 `--ed-*` tokens verbatim. Do NOT redefine the palette. Do NOT re-introduce Pico (removed in Phase 32 / GAP-01). New post-grading tint tokens (`green-tint`/`red-tint` family) are the ONLY additions, named with the `--ed-*` convention. | UI-SPEC §Color; MEMORY pico_token_remap |
| **Cascade order** | `app.css` is linked AFTER `styles.css` in `<head>` (index.html lines 14 + 19) and wins the cascade. New Editoriale rules for the session block go in `app.css` to override the legacy `styles.css` definitions. | index.html lines 12-19 |

---

## File Classification

| File / region to modify | Role | Data Flow | Closest Analog | Match Quality |
|-------------------------|------|-----------|----------------|---------------|
| `index.html` ~390-668 (session `<template>` block) | markup repaint | request-response (instant grade) | itself (current session block) + Phase 32 Home markup repaint | exact / self |
| `styles.css` lines 38-48, 233-245 (`.correcta`/`.incorrecta`/`.wb-answer.incorrecta`/`.wb-correct-answer`) | CSS | n/a (feedback styling) | Phase 32 `app.css` 409-656 (Editoriale restyle of legacy classes) | role-match |
| `styles.css` lines 191-256, 278-327 (`.wb-bank`/`.wb-answer`/`.wb-placed`/`.kbd-hint`/`.match-*`) | CSS | n/a | Phase 32 `app.css` `.home-ghost`/`.examen-pill`/`.streak-bar` | role-match |
| `styles.css` lines 453-522 (`.session-explanation`/`.session-why`/`.session-context`/`.session-timer*`) | CSS | n/a | Phase 32 `.home-overline`/`.home-cta`/`.home-section-overline` | role-match |
| `app.css` `:root` (lines 132-171) — ADD post-grading tint tokens | CSS (tokens) | n/a | Phase 32 `:root` token block | exact |
| `app.css` — ADD new `session-*` Editoriale section | CSS | n/a | Phase 32 Plan 02 Home section (`app.css` 409-656) | exact (same author pattern) |
| `src/screens/app.js` — `sessionContextLabel`, `sessionProgressLabel`, `bankWithKeys` (REUSE as-is) | presentational getter | transform | themselves (read-only derived getters) | exact / self |
| `src/screens/app.js` — ADD small presentational getter(s): progress %/`NN/NN` counter, prompt gap-split on `___` | presentational getter (NEW) | transform | existing `sessionProgressLabel` (line 2600) + `bankWithKeys` (line 2704) | role-match |

---

## Pattern Assignments

### `index.html` ~390-668 — session block (markup repaint, request-response)

**Analog:** itself (the current block) repainted per the Phase 32 markup precedent — keep every binding, change only structure/classes for Editoriale.

**Current top bar / context / progress / timer** (lines 391-408) — repaint into the EX-01 top bar (back button `‹` + green progress bar + `NN/NN` counter + timer chip). Bindings to preserve:
```html
<article @keydown.window="handleSessionKey($event)">
  <h2 class="session-context" x-text="sessionContextLabel"></h2>          <!-- D-06 overline -->
  <header x-text="sessionProgressLabel"></header>                          <!-- D-10 counter source -->
  <div class="session-timer" x-show="sessionTimed && sessionFeedback === null">
    <progress class="session-timer-bar"
              :max="sessionTimeLimitMs(sessionCurrentExercise)"
              :value="sessionTimeRemainingMs"></progress>                  <!-- D-11 keep depleting bar -->
    <span class="session-timer-secs"
          x-text="Math.ceil(sessionTimeRemainingMs / 1000) + 's'"></span>  <!-- D-11 add chip styling -->
  </div>
  <p x-text="sessionCurrentExercise.payload.prompt"></p>                   <!-- D-08 split on ___ -->
```
- Back button is NEW icon-only markup → `@click="requestReturnToHome"` + static `aria-label="Volver al home"` (UI-SPEC §Accessibility). The existing confirmation in `requestReturnToHome` is preserved (D-10).
- The `sessionTimeLimitMs(...)` / `sessionTimeRemainingMs` bindings are presentational reads — DO NOT touch the timer engine (`sessionTimed`, `sessionTimeLimitMs`).

**Multiple-choice sub-template** (lines 417-470) — repaint, keep the shuffle indirection (`multiChoiceOrder` / `perm`) and the instant-grade `@click`:
```html
<template x-for="(perm, idx) in multiChoiceOrder" :key="perm">
  <button type="button"
          @click="sessionSelectOption(perm)"                              <!-- D-01 1-step instant grade — UNCHANGED -->
          :disabled="sessionFeedback !== null"
          :class="{
            'correcta':   sessionFeedback !== null && perm === sessionCurrentExercise.payload.correctIndex,
            'incorrecta': sessionFeedback === 'incorrect' && perm === sessionSelectedIndex
          }"
          x-text="sessionCurrentExercise.payload.options[perm]"></button>
</template>
```
- D-02 maps onto the existing `.correcta` / `.incorrecta` classes (repainted in CSS — see below). The "rest dim to opacity 0.5" and `✓`/`✗` glyphs are NEW CSS/markup but the class toggles stay.
- D-09 feedback box: wrap the existing `.session-explanation` `<p>` (line 460-462) + a NEW hardcoded serif title `¡Esatto!`/`Quasi…` (chosen via an `x-show` on `sessionFeedback === 'correct'` vs `'incorrect'`). The `¿Por qué?` reveal button (lines 464-467) and `sessionExplanationRevealed` logic are preserved.
- D-04 CTA: the existing `<button x-show="sessionFeedback !== null" @click="sessionAdvance">Siguiente</button>` (line 468) becomes the bottom CTA labelled **"Continuar →"** (label hardcoded). `sessionAdvance` is unchanged.

**Word-buttons sub-template** (lines 485-549) — repaint per D-12. Keep `wordButtonsAddWord`/`RemoveWord`/`Check`, `bankWithKeys`, `wordButtonsCanCheck`, the `.kbd-hint` superscripts, and the `wb-placed`/`wb-answer-empty`/`incorrecta` class toggles. Native model keeps **"Comprobar"** → **"Siguiente"** (line 535-546).

**Match sub-template** (lines 582-635) — repaint per D-03/D-05. Keep the per-pair flow (`matchSelectLeft`/`matchPickRight`, `matchLeftIsConsumed`/`matchRightIsConsumed`, `matchFlashIdx`, `matchSelectedLeftIdx`), the 2-column `.match-grid`/`.match-col` layout, and the `:class` toggles for `.match-selected`/`.match-consumed`/`.match-flash`. The numeric badge per matched pair replaces the `¹`/`ᵃ` suffixes (D-05) — repaint the `<sup class="kbd-hint">` markup accordingly.

**Bottom secondary row** (lines 662-668) — keep verbatim; this is the EX-01 footer row. `restartRepaso` (no inline confirm, D-102) + `requestReturnToHome` (keeps confirm, D-10), under the `<hr>`:
```html
<hr>
<div class="button-row">
  <button type="button" class="secondary"
          x-show="sessionMode === 'repaso' || sessionMode === 'test-completo'"
          @click="restartRepaso">Reiniciar ejercicios</button>
  <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
</div>
```

---

### `styles.css` — legacy feedback/match/wb classes (CSS, to be overridden in app.css)

**Analog:** Phase 32 `app.css` 409-656 (Editoriale restyle of legacy classes via `--ed-*` over the now-removed Pico base).

**Legacy `.correcta` / `.incorrecta`** (styles.css lines 38-48) — currently full-fill green/red with `--pico-color-*` fallbacks. D-02 repaints these to **tint-fill** (`green-tint`/`red-tint`) + 2px accent border + tinted text + `✓`/`✗`. Override in `app.css` (wins cascade):
```css
/* styles.css CURRENT (to be overridden) */
button.correcta {
  background-color: var(--pico-color-green-500, #2e7d32);
  border-color: var(--pico-color-green-600, #1b5e20);
  color: white;
}
button.incorrecta {
  background-color: var(--pico-color-red-500, #d32f2f);
  border-color: var(--pico-color-red-600, #b71c1c);
  color: white;
}
```

**Legacy match states** (styles.css lines 293-327) — `.match-selected` (outline 2px Pico-blue), `.match-consumed` (muted grey), `@keyframes match-flash-red`. D-05 repaints: selected → green 2.5px border + `--ed-surface` + green shadow `0 6px 16px rgba(47,125,86,.18)`; consumed → `green-tint` matched pill + badge; flash → red over `--ed-red`. The keyframe must stay **single-iteration** (`300ms ease-out 1`) — WCAG 2.3.1 safe (do not change to loop).

**Legacy wb states** (styles.css lines 192-256) — `.wb-bank` (flex wrap), `.wb-placed` (`visibility:hidden` — KEEP this no-reflow technique), `.wb-answer`/`.wb-answer-empty::before` placeholder, `.kbd-hint` superscript. Repaint surfaces to `--ed-surface` + `--ed-border-soft` + `--ed-radius-ghost` (12px), mirroring multiple-choice (D-12).

**Legacy `.session-explanation` / `.session-why` / `.session-context` / `.session-timer*`** (styles.css lines 453-522) — currently `--pico-*` muted/italic. Repaint per UI-SPEC Typography: explanation → Hanken 13 `--ed-muted` 1.5; context → Editoriale overline (Hanken 11/700, letter-spacing 2-2.5px, UPPERCASE via CSS `text-transform`, `--ed-faint-2`); timer-secs → Space Grotesk 13/700.

---

### `app.css` `:root` — ADD post-grading tint tokens (CSS tokens, exact analog)

**Analog:** the existing Phase 32 `:root` token block (app.css lines 132-171). Append in the same style/section:
```css
/* Phase 32 PRECEDENT — accent/state tokens already present (REUSE, do not redefine): */
--ed-green: #2f7d56;   --ed-red: #b5412e;
--ed-surface: #fbfaf6; --ed-border-soft: rgba(43, 39, 34, 0.16);
--ed-radius-feedback: 14px;  --ed-radius-ghost: 12px;  --ed-radius-pill: 999px;
```
**ADD** (UI-SPEC §Color "Post-grading tint pairs"):
- `--ed-green-tint: #e8f1ea;` `--ed-green-tint-border: #cfe3d6;` `--ed-green-on-tint: #23603f;`
- `--ed-red-tint: #f6e9e6;` `--ed-red-tint-border: #ecd3cc;` `--ed-red-text: #8f3322;`

---

### `app.css` — ADD new session Editoriale section (CSS, exact author-pattern analog)

**Analog:** Phase 32 Plan 02 Home section (app.css lines 409-656) — the canonical "new Editoriale component section" shape: a banner comment header, then per-component rules consuming `--ed-*`, with off-grid handoff values marked `/* exception verbatim */`.

**Overline pattern** (copy from `.home-overline`, app.css 435-443) → reuse for the EX-02 context overline:
```css
.home-overline {                       /* PRECEDENT — copy onto the session overline */
  font-family: var(--ed-font-sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ed-faint-2);
  margin: 0;
}
```

**Green CTA pattern** (copy from `.home-cta`, app.css 455-468) → the bottom "Continuar →" primary CTA reuses this fill + radius + shadow:
```css
.home-cta {                            /* PRECEDENT — green primary CTA */
  border-radius: var(--ed-radius-cta);
  background: var(--ed-green);
  color: var(--ed-surface);
  box-shadow: var(--ed-shadow-cta);
  /* ...display/padding... */
}
```

**Status/streak dot via `currentColor`** (app.css 546-591) → the technique for the green numeric match badge (green circle + white number) and the green progress-bar fill draws from these.

**Editorial `<progress>` restyle precedent** (app.css 358-378) → base `<progress>` is already green-fill on `--ed-streak-track`; the EX-01 top progress bar and the depleting timer bar build on this (the timer's red value-color override lives in `styles.css` 514-515 and wins by specificity — repaint it).

**Off-grid verbatim values to reproduce exactly** (UI-SPEC §Handoff-verbatim, mark each `/* exception verbatim */` like Phase 32 did): option gap 10px, option padding 15×18px, match pill padding 14px / column gap 14px, screen gutter `--ed-space-screen` 22px, radii 13/14/12px.

---

### `src/screens/app.js` — presentational getters

**REUSE as-is (no change to logic):**
- `sessionContextLabel` (lines 2654-2674) → EX-02 overline source (D-06). Returns `"Examen: Avere"` / `"Repaso (20 ejercicios)"`. CSS uppercases it; do NOT uppercase in JS (UI-SPEC §Copywriting).
- `sessionProgressLabel` (lines 2600-2602) → counter source. Currently `"Ejercicio X / N"` from `sessionCursor + 1` / `sessionExerciseIds.length`.
- `bankWithKeys` (lines 2704-2721) → word-bank render (D-12), already returns `{word, idx, placed, key}`.
- `letterFor(idx)` (lines 2068-2070), `matchLeft`/`matchRight` (state arrays), `multiChoiceOrder` (state) → match/MC render. State arrays are populated by the engine; read-only consumption is fine.

**ADD (NEW presentational getters — model on the existing read-only getters above):**
- **Progress %/counter getter** for the EX-01 top bar (green bar width + `NN/NN`). Derive from existing state — `sessionCursor` + `sessionExerciseIds.length` — exactly like `sessionProgressLabel` (line 2600-2602). Pure derived, no engine touch. (No `percent` getter exists today — confirmed via grep.)
- **Prompt gap-split getter** for D-08. Split `sessionCurrentExercise.payload.prompt` on the literal `___` into parts so the gap renders as a styled inline slot, and post-grading fills it (green underline / red strikethrough). Model the defensive null-guard + `.map`/derive shape on `bankWithKeys` (lines 2710-2721): `if (!this.sessionCurrentExercise) return [...]`. **`x-text` only** on each part — never `x-html`.

> **Getter guard pattern to copy** (from `bankWithKeys` line 2710 and `sessionContextLabel` line 2655): every new getter starts with a double-defense early-return for the unmount tick (`if (!this.sessionCurrentExercise) return ...`).

---

## Shared Patterns

### Editoriale token consumption
**Source:** `app.css` `:root` (lines 132-171) + the Phase 32 Home section (409-656).
**Apply to:** every new CSS rule in the session section. Consume `--ed-*`; never hardcode the palette; never reintroduce `--pico-*` definitions (the shim at app.css 188-224 routes legacy `styles.css` references but new code uses `--ed-*` directly).

### Cascade-win via app.css ordering
**Source:** `index.html` lines 14 + 19 (`styles.css` then `app.css`).
**Apply to:** all repaints of legacy `styles.css` classes (`.correcta`, `.incorrecta`, `.match-*`, `.wb-*`, `.session-*`). Put the Editoriale override in `app.css` so it wins by source order (same specificity) — exactly how Phase 32 overrode legacy Home classes.

### x-text-only data binding (anti-XSS)
**Source:** index.html lines 439, 462, 497, 513, 596, 610 (every `x-text` on JSON data).
**Apply to:** all new gap-split, feedback-title, and option/pill markup. Hardcode static labels; flow only `prompt`/`options`/`explanation`/`words`/`pairs` through `x-text`.

### Double-defense Alpine guards
**Source:** index.html line 390 (outer `x-if`), line 593 (`matchFlashIdx && ...`); app.js line 2710 / 2655 (getter early-return).
**Apply to:** every new getter and every binding that dereferences `sessionCurrentExercise.payload.*`.

### WCAG-safe single-flash animation
**Source:** `styles.css` lines 314-327 (`@keyframes match-flash-red`, `animation: ... 1`).
**Apply to:** the repainted `.match-flash` — keep single iteration, ≤300ms (UI-SPEC §Transitions).

---

## No Analog Found

| File / feature | Role | Data Flow | Reason |
|----------------|------|-----------|--------|
| Top progress-bar `NN/NN` counter chip (Space Grotesk) | markup + CSS | n/a | No counter chip exists in the codebase; Home uses streak bars, not a session progress counter. Build from `sessionProgressLabel` state + Phase 32 `<progress>`/Space-Grotesk precedents. |
| Styled inline gap (`___`) + post-grading fill (underline/strikethrough) | markup + CSS + getter | transform | No gap-rendering exists today (prompt is a flat `<p x-text>`). NEW pattern (D-08); model the getter on `bankWithKeys`, the styling is net-new (UI-SPEC §Gap rendering). |
| Numeric match badge (green circle + white number) | markup + CSS | n/a | No numeric badge exists; replaces the `¹`/`ᵃ` `.kbd-hint` suffixes (D-05). Build the green circle from the `currentColor` dot technique (app.css 546-552). |
| Feedback box with serif Italian title (`¡Esatto!`/`Quasi…`) | markup + CSS | n/a | No titled feedback box exists (today it's a bare `.session-explanation` `<p>` + a "Respuesta correcta:" line). NEW container (D-09); reuse `.session-explanation` inside it. |

These have no direct in-repo analog and the planner should follow UI-SPEC §Component & Interaction Contract for them, reusing the Phase 32 token/technique precedents cited above.

---

## Metadata

**Analog search scope:** `index.html` (session block 388-670), `styles.css` (feedback/wb/match/session sections 25-522), `app.css` (tokens 126-407, Home repaint 409-656), `src/screens/app.js` (presentational getters 2535-2762, `letterFor` 2068).
**Files scanned:** 4
**Pattern extraction date:** 2026-06-30
