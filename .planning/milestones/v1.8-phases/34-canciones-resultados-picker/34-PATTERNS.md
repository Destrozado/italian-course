# Phase 34: Canciones · Resultados · Picker - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 4 screen sections × 3 files (index.html templates, app.js getters, app.css rules)
**Analogs found:** 11 of 12 elements have a shipped Phase 32-33 analog (only the conic-gradient score ring is net-new)

> **Brownfield restyle, locked no-build stack.** No new files. Each "file" below is a SECTION of an existing file. `app.css` is the base (Pico removed in Phase 32). The engine (`startSong`, `completeSession`, `pickerToggleCategory`, cascada D-54, sampler) is untouched — presentation only. Every new CSS rule consumes `--ed-*` tokens and goes at the bottom of `app.css` (wins the cascade by source order, same specificity — the established Phase 32-33 idiom).

---

## File Classification

| Section to repaint | Role | Data Flow | Closest Shipped Analog | Match Quality |
|--------------------|------|-----------|------------------------|---------------|
| `index.html` `canciones` template (~L274-315) | view-template | render-list | Home category rows `index.html` L205-251 + `app.css` `.cat-name`/`.status-dot` | exact (same hairline-row + status-dot system) |
| `index.html` `cancion` template (~L868-935) | view-template | request-response (per-phrase) | Phase 33 session top bar + word-buttons (`app.css` L703-808, L1054-1168) | exact (already uses `wb-*`; just add Editoriale top bar) |
| `index.html` `summary` template (~L951-1100) | view-template | render-list | Phase 33 feedback box (`app.css` L878-926) + legacy `summary-delta`/`summary-errors` (`styles.css` L157-454) | role-match (delta/errors markup exists; needs Editoriale repaint + new ring) |
| `index.html` `picker` template (~L320-373) | view-template | event-driven (toggle) | Home category rows + `.session-cta` (`app.css` L554-625, L856-876) | exact (hairline rows + green CTA both shipped) |
| `app.js` `songsForDisplay` (L3078-3093) | presentational-getter | transform | `categoriesForDisplay` (L3020+) split-name pattern | exact (same `.split` derivation idiom) |
| `app.js` score X/Y getter (NEW, permitted) | presentational-getter | transform | `sessionProgressPercent` (L2616, read-only derive from session state) | role-match (same read-only derive-from-`sessionResults` idiom) |
| `app.css` 4 screen blocks (NEW rules) | stylesheet | n/a | Phase 32-33 `--ed-*` rule blocks (entire file) | exact (token + banner-comment idiom) |

---

## Pattern Assignments

### `canciones` template + `songsForDisplay` (view-template, render-list)

**Analog:** Home category rows — `index.html` L205-251 (markup) + `app.css` L554-625 (`.status-dot` / `.cat-name` / `.cat-topic`) + `app.js` L3020+ (`categoriesForDisplay` split idiom).

**Status-dot pattern — REUSE VERBATIM** (`index.html` L209-211, `app.css` L558-565):
```html
<span class="status-dot" :class="`badge-${cat.status}`" :aria-label="cat.statusLabel"></span>
```
```css
.status-dot { width: 9px; height: 9px; border-radius: var(--ed-radius-pill);
  background-color: currentColor; } /* color from badge-* */
```
**Delta:** Song triad is `no-hecha`/`pasada`/`fallada`, NOT the category triad. The existing `badge-*` classes (`styles.css` L62-64) only cover `no-hecha`/`hecha`/`dominada`. Per D-07 you need NEW badge classes for song states: `badge-pasada { color: var(--ed-green) }`, `badge-fallada { color: var(--ed-red) }`, `badge-no-hecha` already exists (neutral `--ed-neutral-dot`). Bind `:class="\`badge-${song.status}\`"` exactly like the home row.

**Title+artist split — COPY the `categoriesForDisplay` paren-split idiom** (`index.html` L220-223):
```html
<span class="cat-name" x-text="cat.name.split('(')[0].trim()"></span>
<span class="cat-topic" x-show="cat.name.includes('(')" x-text="..."></span>
```
**Delta (D-05/D-06):** Songs split `title` on the em-dash `—` instead of parens. Add the derivation INSIDE `songsForDisplay` (the getter is the established place for it — `categoriesForDisplay` derives its display fields the same way) rather than inline in the template, because the meta string is `{artista} · {N} huecos`. Extend the returned object (L3083-3091) with:
```js
// inside songsForDisplay map (presentational only, no engine change)
const [titlePart, artistPart] = (song.title ?? song.id).split('—').map(s => s.trim());
return {
  ...,                       // keep id, status, statusLabel, vecesFallada
  titleDisplay: titlePart,   // serif title
  artist: artistPart ?? '',  // italic, '' if no em-dash
  metaLabel: artistPart ? `${artistPart} · ${phraseCount} huecos` : `${phraseCount} huecos`,
};
```
Reuse `.cat-name` (serif 18/600) for the title and `.cat-topic` (italic 12.5 `--ed-faint`) for the meta line — both already in `app.css` L566-581.

**Row CTA arrow — COPY `.home-cta-arrow`** (`app.css` L497-500, `index.html` L154): the `→` glyph (hardcoded, `aria-hidden`) is the established affordance. Row tap keeps existing `@click="startSong(song.id)"` (L304).

**Featured "Continuar" card — COPY `.home-cta` elevated-CTA pattern** (`app.css` L467-500):
```css
.home-cta { display: flex; justify-content: space-between; width: 100%;
  border-radius: var(--ed-radius-cta); background: var(--ed-green);
  color: var(--ed-surface); box-shadow: var(--ed-shadow-cta); }
```
**Delta:** The featured card is `--ed-paper-elevated` surface (radius 18 `--ed-radius-card`, NOT the green CTA fill) with `--ed-shadow-card` (`app.css` L167). Overline `CONTINUAR`/`EMPEZAR` copies `.home-overline` (L447-455). The state-based progress bar (D-02, NO fraction) copies `.streak-bar`/`.streak-bar-fill` (`app.css` L589-603) — `currentColor` fill driven by the song's `badge-*` class, exactly like the home streak bar. Featured selection is presentational only (first `no-hecha`/`fallada` in list order, D-01); compute it in `songsForDisplay` or a thin sibling getter — do NOT touch engine state.

**Tinted cover tiles (list 46px / featured 66px) — net-new technique, anchor to `.match-badge` solid-circle idiom** (`app.css` L1254-1269). No existing repeating-linear-gradient tile exists; closest shipped pattern is the solid color-block-with-glyph (`.match-badge` = green circle + white numeral, and `.status-dot` = `currentColor` block). Per D's discretion the tile uses `repeating-linear-gradient` stripes + a serif initial. Treat the stripe gradient as net-new CSS (see No Analog section), but follow the established radius literal (cover tile 11, per UI-SPEC) and serif-initial-in-tint-color convention.

---

### `cancion` template (view-template, request-response per-phrase)

**Analog:** Phase 33 session screen — INHERITS VERBATIM. This is the highest-confidence mapping (D-08): the template already uses `wb-bank`/`wb-answer`/`bankWithKeys`/`songCheck`/`songAdvance` (`index.html` L880-924), so the word-buttons treatment (`app.css` L1054-1168) applies with zero CSS changes.

**Word-buttons — already styled** (`app.css` L1060-1074 bank pills, L1094-1158 answer area + post-check tint). No delta; verify the `cancion` markup carries the same classes (it does).

**Top bar — REPLACE the bare `<header>` (L873) with the `.session-topbar` scaffold** (`app.css` L704-758):
```css
.session-topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
.session-back { width: 36px; height: 36px; border-radius: var(--ed-radius-pill);
  background: var(--ed-surface); font-family: var(--ed-font-serif); font-size: 22px; } /* ‹ glyph */
.session-progress / .session-progress-fill { 4px green bar }
.session-counter { font-family: var(--ed-font-mono); } /* "Frase X/N" */
```
**Delta:** Move `← Volver a Canciones` (L933) into the circular `.session-back` (`‹` glyph, `aria-label="Volver"` — inherited Phase 33 convention). The `songProgressLabel` getter (`app.js` L2677) feeds `.session-counter` ("Frase X/N"). Progress-bar fill width = a song-progress percent (mirror `sessionProgressPercent`, L2616). **NO timer chip** — songs never use Contrarreloj (do NOT add `.session-timer*` from L778-808). The `.session-context` overline (L871) and `.session-prompt` (use for `songCurrentPhrase.payload.prompt`, currently a bare `<p>` at L876) are both shipped. Auto-advance 600ms (`sessionMode === 'cancion'`) stays untouched.

**Post-check feedback (optional, planner's discretion)** — COPY `.session-feedback`/`.session-feedback-title`/`.session-feedback-correct` (`app.css` L878-916). The current "Respuesta correcta:" `<p class="wb-correct-answer">` (L910-913) can be wrapped in `.session-feedback.wrong`.

---

### `summary` template + score getter (view-template, render-list)

**Analog:** Phase 33 feedback box (`app.css` L878-926) for error cards; legacy `summary-delta`/`summary-errors` markup already in place (`index.html` L957-1096) but styled by PRE-Editoriale `styles.css` L157-454 (still references `--pico-color-*` — these are the rules to repaint).

**Header — REUSE `summaryHeaderLabel` repainted** (D-11). The getter (`app.js` L2368) is untouched; the markup at L954-955 keeps `.session-context` (overline, already Editoriale) + `<header x-text="summaryHeaderLabel">`. Repaint `<header>` to serif title (Spectral 24/600) — mirror `.home-title` (`app.css` L456-464) scaled down.

**Cascade "categorías afectadas" — repaint `summary-delta`** (`index.html` L957-978, `app.js` `summaryDelta`). The `entry.failed` flag (L965) maps to a `FALLÓ` pill. Build the pill from the `--ed-red-tint`/`--ed-red-text` pattern already used by `.session-feedback.wrong` (`app.css` L891-903) and the right-aligned "{N} ej." column (54px LOCKED, D-16). Existing `.delta-regression`/`.delta-promotion` (`styles.css` L164-165) use `--pico-color-*` — **replace these** with `--ed-red`/`--ed-green` in the new app.css block.

**Errors "Errores cometidos" — repaint `summary-errors` over the feedback-card pattern** (`index.html` L1032-1096, `app.js` `summaryVariantSurface` L2588). The struck-through "Tu: ~~x~~" reuses `.user-answer` (currently `styles.css` L430, `--pico` red) repainted to `--ed-red-text` with `text-decoration: line-through`; "Correcta: y" uses `--ed-green-on-tint`; explanation (`.summary-error-explanation`, L454) → `--ed-muted` italic. Each error card surface = `--ed-paper-elevated`, radius 14 (`--ed-radius-feedback`). No markup change to the three `summaryVariantSurface(result).type` sub-templates — repaint only.

**Score ring + "X/Y correctos" — NET-NEW (see No Analog).** Add a thin presentational getter (permitted per CONTEXT.md) deriving from the snapshot `summarySessionResults` (`app.js` L297, set in `completeSession`), NOT live `sessionResults`:
```js
get summaryScore() {
  const total = this.summarySessionResults.length;          // D-10: answered, not launched
  const correct = this.summarySessionResults.filter(r => r.correct).length;
  return { correct, total, pct: total ? Math.round(correct / total * 100) : 0 };
}
```
This mirrors the read-only `sessionProgressPercent` derive-from-session idiom (L2616) — no engine logic added.

---

### `picker` template (view-template, event-driven)

**Analog:** Home category rows (hairline + serif name + paren-split subtitle) + `.session-cta` for the green Empezar button.

**Hairline rows with tick (D-13/D-14) — COPY the home `.cat-name`/`.cat-topic` paren-split** (`index.html` L220-223, `app.css` L566-581). Current picker markup is a bare `<fieldset>` of `<label><input type=checkbox>` (L339-349). Repaint the row to: full-row clickable label + serif `cat.name.split('(')[0]` title + italic subtitle (split on parens, identical to home) + green `✓` on the right when `pickerCheckedCategoryIds.includes(cat.id)`. Keep `@change="pickerToggleCategory(cat.id)"` (L345) verbatim. The custom checkbox (`app.css` L319-334) already renders a green checked state — either keep it or replace the glyph with a `✓` driven by the `:checked` binding.

**Empezar CTA — REUSE `.session-cta`** (`app.css` L856-876, plus disabled state L1172-1177):
```html
<button class="session-cta" @click="startSession"
        :disabled="pickerPoolSize === 0" x-text="pickerStartLabel"></button>
```
`pickerStartLabel` (`app.js` L2993) and `pickerPoolSize` (L2978) are reused verbatim.

**Bulk actions — keep `.button-row`** (`index.html` L333-336, `styles.css` L91): "Seleccionar todo"/"Quitar todo" (`pickerSelectAll`/`pickerClearAll`).

**Contrarreloj toggle — keep `.picker-timed` + `input[role="switch"]`** styling (`app.css` L338-368). The `x-model="pickerTimed"` (L356) is untouched.

**Selection counter (D-12) — NEW thin getter or inline expression:** "{N} categorías seleccionadas" from `pickerCheckedCategoryIds.length`. Presentational only.

---

## Shared Patterns

### Section overline
**Source:** `.home-overline` / `.home-section-overline` (`app.css` L447-455, L528-530)
**Apply to:** Section headers on all 4 screens (`TODAS LAS CANCIONES`, `CATEGORÍAS AFECTADAS`, `ERRORES COMETIDOS · N`, `CONTINUAR`/`EMPEZAR`). Hanken 11/700, ls 2.5px (2px for section), UPPERCASE via CSS, `--ed-faint-2`.

### Status color via `currentColor` + `badge-*`
**Source:** `.status-dot` / `.streak-bar-fill` (`app.css` L558-565, L598-603) + `badge-*` (`styles.css` L62-64)
**Apply to:** Song status dot, featured-card progress bar. **Delta:** add `badge-pasada` (green) + `badge-fallada` (red) classes (song triad, D-07) alongside the existing category triad. The `background-color: currentColor` indirection is the established mechanism — set `color` via `badge-*`, never hardcode the dot color.

### Green CTA + green shadow
**Source:** `.home-cta` / `.session-cta` + `--ed-shadow-cta` (`app.css` L467-480, L856-876, token L166)
**Apply to:** Picker "Empezar". Green reserved exclusively (UI-SPEC §Color) for CTA, ticks, progress fill, ring arc, `pasada` dot, `CONTINUAR`/`EMPEZAR` overline.

### Tint-pair feedback surfaces
**Source:** `.session-feedback.correct/.wrong` + tint tokens `--ed-green-tint`/`--ed-red-tint`/`--ed-*-on-tint` (`app.css` L177-182, L881-916)
**Apply to:** summary error cards, `FALLÓ` pill, `cancion` post-check feedback. Never invent new tint hexes — these six tokens are the locked post-grading palette.

### Cascade wins by source order
**Source:** Entire Phase 32-33 idiom (every new block sits at the bottom of `app.css`, same specificity, beats `styles.css` legacy by load order — `app.css` linked after `styles.css`).
**Apply to:** All 4 new blocks. The legacy `summary-delta`/`summary-errors`/`user-answer`/`delta-*` rules in `styles.css` (still `--pico-*`) are overridden, not deleted — repaint by adding higher-order rules in `app.css`.

### Banner-comment + `/* exception verbatim */` documentation idiom
**Source:** Every section header in `app.css` (e.g. L421-436, L670-685) and off-grid value annotations (L473, L506).
**Apply to:** New blocks must carry the same `═══` banner + cite the handoff/decision, and mark LOCKED off-grid values (22/46/66/54px, ring 72px) `/* exception verbatim — handoff §X */`.

---

## No Analog Found

| Element | Role | Reason | Planner guidance |
|---------|------|--------|------------------|
| Score ring (`conic-gradient`) `summary` | decorative-meter | No conic-gradient or ring meter exists anywhere in `app.css`/`styles.css`. Closest cousins are linear meters (`.streak-bar`, `.session-progress`, `progress`) and the solid `.match-badge` circle — none use angular fill. | NET-NEW CSS. 72px (`--ed-radius-pill`), `conic-gradient(var(--ed-green) {pct*3.6}deg, #e6ddcd 0)` per UI-SPEC §Color; track `#e6ddcd` is a handoff literal (distinct from `--ed-streak-track`). Center `%` in Space Grotesk (`--ed-font-mono`) 22/700 tabular-nums via an inner element or `::after` over a `--ed-paper-elevated` punch-out. Pct from the NEW `summaryScore` getter. This is the ONLY genuinely new visual technique in the phase. |
| Tinted cover tiles (`repeating-linear-gradient` + serif initial) | decorative-tile | No striped-gradient tile shipped; only solid color blocks (`.status-dot`, `.match-badge`). | Semi-new. Follow the solid-block-with-glyph convention (`.match-badge` L1254-1269) for structure (fixed box, centered serif initial, `border-radius` literal 11), but the `repeating-linear-gradient` stripe fill is new (per D's discretion; default stripe `--ed-green-dark #296c4a` per UI-SPEC). |

---

## Metadata

**Analog search scope:** `app.css` (1298 L, read in full), `styles.css` (badge-*, summary-*, picker-*, button-row blocks), `index.html` (canciones L274-315, picker L320-373, cancion L868-935, summary L951-1100, home rows L200-254), `src/screens/app.js` (`songsForDisplay` L3078, `categoriesForDisplay` L3020, picker getters L2962-3002, `summaryVariantSurface` L2588, `sessionProgressPercent` L2616, `songProgressLabel` L2677).
**Files scanned:** 4 (app.css, styles.css, index.html, src/screens/app.js)
**Pattern extraction date:** 2026-06-30
