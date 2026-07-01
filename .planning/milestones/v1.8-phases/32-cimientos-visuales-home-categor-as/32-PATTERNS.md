# Phase 32: Cimientos visuales + Home/Categorías - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 5 (2 new, 3 modified)
**Analogs found:** 5 / 5

> Brownfield visual redesign of a vanilla static web app (Alpine.js 3.15.12 + Pico CSS 2.1.1 classless + ES modules + localStorage, **no build, NOT React**). Engine/logic is OUT OF SCOPE. All analogs live in this same repo — the new Editoriale layer mirrors the existing override-over-Pico and Alpine-binding conventions already present.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `app.css` (NEW) — Editoriale layer (tokens + components) | stylesheet | transform (CSS-over-Pico) | `styles.css` (whole-file structure + `@media 640px` table→card layer) | role-match (same override-on-Pico idiom; no existing "token layer" yet) |
| `vendor/fonts/` (NEW) — self-hosted .woff2 + `@font-face` | asset + stylesheet | file-I/O (font load) | `index.html` `<head>` CDN/local stylesheet links (lines 9-15) | partial (no self-hosted font precedent — `vendor/` does not exist; new pattern) |
| `index.html` (MODIFIED) — `<head>` link + Home `<template>` block | markup | request-response (Alpine render) | itself, lines 65-210 (current Home `<template x-if>`) + lines 9-15 (`<head>`) | exact (replacing in place) |
| `styles.css` (MODIFIED) — disable Pico dark mode, reconcile `.badge-*` (D-01) | stylesheet | transform | itself, lines 11-13 (`color-scheme`) + 57-59 (`.badge-*`) | exact |
| `src/screens/app.js` (MODIFIED) — expose raw `streakDays` in `categoriesForDisplay` | presentational JS | transform (getter) | itself, `categoriesForDisplay` getter lines 2966-3003 | exact |

---

## Pattern Assignments

### `app.css` (NEW — stylesheet, CSS-over-Pico transform)

**Analog:** `styles.css` (entire file — the project's only existing "override layer on top of Pico classless"). Mirror its three load-bearing idioms.

**(1) Override-on-Pico with CSS-var + hex-fallback** — `styles.css` lines 35-45. Every color reads a Pico var first, falls back to hex. The Editoriale layer **inverts the priority** (Editoriale tokens are the source of truth, not Pico), but keep the same syntactic shape:
```css
button.correcta {
  background-color: var(--pico-color-green-500, #2e7d32);
  border-color: var(--pico-color-green-600, #1b5e20);
  color: white;
}
```
**How to mirror:** declare Editoriale tokens as custom properties on `:root` (e.g. `--ed-paper:#f4f0e8; --ed-green:#2f7d56; --ed-ink:#2b2722; --ed-faint:#a39a88; --ed-hairline:rgba(43,39,34,.09)` …) then consume them in component rules with `var(--ed-green)`. This is the same `var(...)` idiom already in the file, just with a new namespaced prefix. `app.css` is linked **after** `styles.css` and Pico in `<head>` so it wins the cascade.

**(2) Heavily-commented section banners** — `styles.css` uses `/* ─── Phase N — name ─── */` block headers (lines 163, 248, 319, 519). Match this so the planner's CSS reads like the existing file. Token block first, then component blocks (tricolore, header, CTA, ghost row, category row, switch, desktop table).

**(3) The `.button-row` / `.button-row-prominent` flex pattern** — `styles.css` lines 86-97 is the analog for the **ghost button row** (HOME-03):
```css
.button-row { display: flex; gap: 1rem; margin: 1.5rem 0; }
.button-row button { flex: 1; }
.button-row-prominent button { font-size: 1.1rem; padding: 0.75rem 1.5rem; }
```
**How to mirror:** the ghost row is `display:flex; gap:8px` with each button `flex:1; padding:11px 4px; border:1px solid var(--ed-border-soft); border-radius:12px`. Same flex-of-equal-buttons skeleton; restyle borders/padding to the Editoriale tokens. Do NOT reuse `role="group"` (the file's comments at lines 61-85 and 130-143 document why Pico's button-group glues borders — `.button-row` exists precisely to avoid that).

**(4) Desktop table styling (HOME-06)** — the analog is the **Phase 28 `@media (max-width:640px)` table→card layer**, `styles.css` lines 532-601. That layer proves the established technique: keep the existing `<figure><table>` and restyle it per-breakpoint via attribute selectors, never restructure the DOM. Key excerpt (the `data-label`-driven mobile cards):
```css
@media (max-width: 640px) {
  figure table thead { display: none; }
  figure table, figure table tbody, figure table tr, figure table td { display: block; width: 100%; }
  figure table td[data-label]::before {
    content: attr(data-label);
    color: var(--pico-muted-color, #6c757d);
    font-size: 0.8em; font-weight: 600;
  }
  figure table td:not([data-label]) { /* card title = category name */
    text-align: left; font-size: 1.15rem; font-weight: 600;
  }
}
```
**How to mirror (HOME-06):** the desktop editorial table is the **inverse breakpoint** of this same pattern — restyle `figure table` (warm paper bg, Spectral serif cells, `border-bottom` hairlines) for `>=641px` and let the existing Phase-28 mobile-card rules continue to own `<=640px`. The mobile layer already drops "Última vez" by omitting its `data-label`; the desktop view should drop/hide the same `<td data-label="Última vez">` to reach the 5-column contract (Estado · Categoría · Racha · Ejercicios · Examen). The Phase-28 44px tap-target rules (lines 591-601) **must not regress** — do not remove them.

---

### `vendor/fonts/` (NEW — asset + `@font-face` stylesheet, file-I/O)

**Analog:** the `<head>` stylesheet-link convention in `index.html` lines 9-15 (Pico via CDN + local `./styles.css`). There is **no existing self-hosted-font precedent** — `vendor/` does not exist (confirmed: `ls vendor` → no dir). This is a genuinely new asset pattern; RESEARCH/UI-SPEC govern it, not a codebase analog.

**Integration excerpt (the link pattern to mirror)** — `index.html` lines 9-15:
```html
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2.1.1/css/pico.classless.min.css"
      integrity="sha384-…" crossorigin="anonymous">
<link rel="stylesheet" href="./styles.css">
```
**How to mirror:** the `@font-face` rules can live inside `app.css` (top, before tokens) or a dedicated `vendor/fonts/fonts.css` linked in `<head>`. Each face uses `font-display: swap` and `src: url('./vendor/fonts/<file>.woff2') format('woff2')` — relative `./` paths like the existing `./styles.css` / `./src/main.js`. **Zero references to `fonts.googleapis.com`** at runtime (the README import line — `design_handoff_italiano_redesign/README.md` line 72 — is the source list ONLY; do not paste that `<link>`). Subset weights per UI-SPEC: Spectral 400/500/600/700 + italic 400/500, Hanken Grotesk 400/500/600/700/800, Space Grotesk 500/700. Works offline and on `http://localhost` (project constraint).

---

### `index.html` (MODIFIED — markup, Alpine render)

**Analog:** the current Home block, `index.html` lines 65-210 — replace this in place, **reusing every existing Alpine binding**.

**(1) Screen gate (keep exactly)** — line 65:
```html
<template x-if="currentScreen === 'home'">
```
This `<template x-if>` is the canonical double-defense gate (comment lines 78-92 + `code_context`): it prevents bindings from evaluating before `init()` resolves. Keep it as the outer wrapper of the redesigned Home.

**(2) Header (HOME-01)** — replace lines 67-69:
```html
<header><h2>Categorías</h2></header>
```
**How to mirror:** add the tricolore motif element + overline `ITALIANO · A1 / A2` + Spectral 38/600 title `Categorías`. Markup-only; no new binding.

**(3) CTA + ghost row (HOME-02/03, D-04/D-05)** — replace the 4-button block at lines 144-154:
```html
<div class="button-row button-row-prominent">
  <button type="button" @click="openPicker('repaso')">Repaso 20</button>
  <button type="button" @click="openPicker('test-completo')">Test completo</button>
  <button type="button" @click="currentScreen = 'canciones'">Canciones</button>
  <button type="button" class="secondary" @click="currentScreen = 'backup'">Backup</button>
</div>
```
**How to mirror:** split into (a) one full-width primary CTA `<button @click="openPicker('repaso')">` (D-05: **behavior unchanged**, still opens the picker — NOT a direct launch) and (b) a ghost row of 3 — `Test completo` (`@click="openPicker('test-completo')"`) · `Canciones` (`@click="currentScreen='canciones'"`) · `Backup` (`@click="currentScreen='backup'"`). **Copy all four `@click` handlers verbatim** — only the wrapping markup/classes change. Canciones drops from prominent to ghost (D-04).

**(4) Contrarreloj switch (HOME-05)** — keep the binding at lines 161-164:
```html
<label class="home-exam-timed">
  <input type="checkbox" role="switch" x-model="homeExamTimed">
  Contrarreloj ⏱
</label>
```
**How to mirror:** restyle the Pico `role="switch"` to the Editoriale green track in `app.css`. **`x-model="homeExamTimed"` is untouched** (D-05).

**(5) Category table + row (HOME-04/06)** — the `x-for` loop at lines 167-208 is the core analog:
```html
<figure>
  <table>
    <thead><tr>… Estado · Categoría · Racha · Ejercicios · Última vez · Examen …</tr></thead>
    <tbody>
      <template x-for="cat in categoriesForDisplay" :key="cat.id">
        <tr>
          <td data-label="Estado">
            <span :class="`badge-${cat.status}`" :aria-label="cat.statusLabel" x-text="cat.badgeGlyph"></span>
          </td>
          <td><span x-text="cat.name"></span></td>
          <td data-label="Racha">
            <span x-text="cat.streakLabel"></span>
            <small x-show="cat.vecesFallada > 0" x-text="`fallada x${cat.vecesFallada}`"></small>
          </td>
          <td data-label="Ejercicios" x-text="cat.totalCount"></td>
          <td data-label="Última vez" x-text="cat.lastPracticedLabel"></td>
          <td data-label="Examen">
            <button type="button" class="secondary outline"
                    :disabled="!cat.examenEnabled" :title="cat.examenTooltip"
                    @click="startExamen(cat.id)">Examen</button>
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</figure>
```
**How to mirror:**
- **Keep** `x-for="cat in categoriesForDisplay" :key="cat.id"`, the `data-label` attributes (the Phase-28 mobile-card layer depends on them — see `app.css` notes), and the Examen `<button>` with `:disabled`/`:title`/`@click="startExamen(cat.id)"` verbatim.
- **Status dot (D-01):** the current `:class="`badge-${cat.status}`"` already keys off `cat.status` (`no-hecha|hecha|dominada`). Reuse it — but `app.css` must define `.badge-dominada{color:green}` / `.badge-hecha{color:amber}` to honor D-01 (the legacy `styles.css` inverts them — see Shared Patterns below). The dot is a 9px round element; the existing `badgeGlyph` span can become the dot (color via class) or be replaced by a styled `<span>`.
- **Name/topic split (D-02):** the cell `<span x-text="cat.name">` becomes title + italic subtitle. Per UI-SPEC Data Contract, the split may be done **in the Alpine expression** (e.g. `x-text="cat.name.split('(')[0].trim()"` for the title and a `<span x-show>` for the parenthetical) **or** via a tiny presentational getter — planner's discretion. No `categories.json` change.
- **Streak bar (HOME-04):** add a bar element whose fill width = `cat.streakDays / 21 * 100%` (requires the new raw `streakDays` field — see app.js below), colored green (dominada) / amber (hecha). Reuse `cat.streakLabel` for the `"N/21 d · M ejercicios"` text where possible.

**(6) `<head>` link order** — lines 9-15. Add the `app.css` link (and font `@font-face` source) **after** `./styles.css` so Editoriale overrides win. Also remove `<meta name="color-scheme" content="light dark">` at line 6 (D-03, see styles.css below).

**Anti-XSS invariant (keep):** all JSON-sourced text renders via `x-text` (comment lines 56-58, 224-226). The redesign must not introduce `x-html` or interpolate content into markup.

---

### `styles.css` (MODIFIED — stylesheet, transform)

**Analog:** itself — two surgical edits.

**(1) Disable Pico auto dark mode (D-03/FND-03)** — lines 11-13:
```css
:root {
  color-scheme: light dark;
}
```
**How to mirror:** change to `:root { color-scheme: light; }` (or `only light`) and remove the `<meta name="color-scheme" content="light dark">` from `index.html` line 6. This forces the single warm-paper palette; do not invent a dark variant.

**(2) Reconcile `.badge-*` colors per D-01** — lines 57-59:
```css
.badge-no-hecha { color: var(--pico-muted-color, #6c757d); font-weight: 600; }
.badge-hecha    { color: var(--pico-color-green-500, #2e7d32); font-weight: 600; }
.badge-dominada { color: var(--pico-color-amber-500, #f59e0b); font-weight: 600; }
```
**LOAD-BEARING BUG (D-01 conflict):** legacy is `hecha`=green, `dominada`=amber — **inverted** vs the Editoriale contract (`dominada`=green `#2f7d56`, `hecha`=amber `#b9852f`). The new layer MUST honor D-01. **How to mirror:** either edit these three rules here to the Editoriale tokens, OR override them in `app.css` (which loads later) — planner's discretion, but the rendered result must be `dominada→green / hecha→amber / no-hecha→neutral #c4bcab`. Decide one home so the two files don't fight.

---

### `src/screens/app.js` (MODIFIED — presentational JS, getter transform)

**Analog:** the `categoriesForDisplay` getter itself, lines 2966-3003.

**Core pattern (the returned row object)** — lines 2985-3001:
```js
const streak = progress?.streakDays ?? 0;   // line 2979 — already read locally
…
return {
  id: cat.id,
  name: cat.name,
  status,
  badgeGlyph: badgeGlyphFor(status),
  statusLabel: statusLabelFor(status),
  streakLabel: formatStreak(streak, status),
  totalCount,
  lastPracticedLabel: formatRelativeDate(lastPracticedDate, today),
  examenEnabled,
  examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría',
  vecesFallada: progress?.vecesFallada ?? 0
};
```
**How to mirror (the ONLY allowed change):** `const streak` is **already computed** on line 2979 but never returned. Add **one** field to the returned object:
```js
streakDays: streak,   // raw value for the streak/21 bar fill width (presentational, Phase 32)
```
That is the entire app.js change. **Do NOT touch** status derivation, `formatStreak`, the cascade D-54, sampler, slot-engine, localStorage, schema, or migrations. The `songsForDisplay` getter (lines 3021-3036) is the documented sibling of this pattern but is **out of scope** for Phase 32 (Songs screen is Phase 34).

**Double-defense guard (keep):** line 2967 `if (!this.content || !this.state) return [];` is the house pattern (mirrored by `songsForDisplay` line 3022, `bankWithKeys`). Do not remove it.

---

## Shared Patterns

### Override-on-Pico via CSS custom properties
**Source:** `styles.css` lines 35-59, 86-97 (the whole file is `var(--pico-*, #hexfallback)` over Pico classless).
**Apply to:** `app.css` (all component rules). The Editoriale layer declares its own `--ed-*` tokens on `:root` and is linked **after** Pico + `styles.css` in `<head>`, so it wins the cascade. Same `var(...)` syntax, new namespace; Pico remains the base/reset.

### Restyle-the-existing-table, never restructure (breakpoint attribute selectors)
**Source:** Phase 28 `@media (max-width:640px)` layer, `styles.css` lines 532-601 (table→cards via `attr(data-label)`, `thead{display:none}`, `td:not([data-label])` = card title).
**Apply to:** `index.html` category table (keep the `<figure><table>` + `data-label` cells intact) and `app.css` desktop table (HOME-06). The desktop editorial table is the inverse-breakpoint sibling of this proven technique. The 44px tap-target rules (lines 591-601, 608-615) must not regress.

### Alpine double-defense gate + preserved bindings
**Source:** `index.html` `<template x-if="currentScreen==='home'">` (line 65) + `categoriesForDisplay` guard `if (!this.content || !this.state) return []` (app.js line 2967). Documented in `code_context`.
**Apply to:** all of Phase 32 — markup/CSS change, **bindings do not**. Reuse `@click="openPicker(...)"`, `@click="startExamen(cat.id)"`, `x-model="homeExamTimed"`, `x-for="cat in categoriesForDisplay"`, `x-text`, `:disabled`, `:title`, `:class` verbatim.

### Anti-XSS: JSON content only via `x-text`
**Source:** `index.html` comments lines 56-58, 224-226.
**Apply to:** all new Home markup. Never introduce `x-html`; render `cat.name` and derived topic via `x-text` (or Alpine string expressions that bind to text, never markup).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `vendor/fonts/*.woff2` + `@font-face` | asset / stylesheet | file-I/O | No self-hosted font precedent in the repo; `vendor/` does not exist. All current external assets (Pico, Alpine) are CDN with SRI. The `@font-face` source-relative-path pattern follows `index.html`'s `./styles.css` link idiom, but the self-hosting itself is new — governed by UI-SPEC §Self-Hosted Fonts + README, not a codebase analog. |
| `app.css` token block (CSS custom properties on `:root`) | stylesheet | transform | No existing **design-token layer** — `styles.css` consumes Pico's vars but defines none of its own. The `:root { --ed-* }` token set is net-new; mirror the *consumption* idiom (`var(...)`) from `styles.css`, but the token declarations come from UI-SPEC §Color/Typography/Radii. |

---

## Metadata

**Analog search scope:** repo root (`index.html`, `styles.css`), `src/screens/app.js`, `design_handoff_italiano_redesign/` (reference only — NOT production), `vendor/` (absent).
**Files scanned:** 4 source files (index.html, styles.css, app.js, README handoff) + 2 context docs (32-CONTEXT.md, 32-UI-SPEC.md).
**Pattern extraction date:** 2026-06-30
