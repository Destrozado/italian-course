---
phase: 34-canciones-resultados-picker
plan: 03
subsystem: ui
tags: [alpine, picker, editoriale, no-build, presentational]

# Dependency graph
requires:
  - phase: 32-cimientos-visuales-home-categor-as
    provides: "--ed-* tokens, app.css base (Pico removed), .cat-name/.cat-topic, split-name idiom, hairline-row pattern"
  - phase: 33-pantallas-de-ejercicio
    provides: ".session-cta green CTA + green shadow + :disabled state"
  - phase: 34-canciones-resultados-picker
    plan: 01
    provides: "pickerSelectedCount getter (pickerCheckedCategoryIds.length, D-12)"
provides:
  - "Repainted Repaso/Examen picker: Editoriale hairline rows (serif name + italic paren-split subtitle + green tick) + selected-category counter + green .session-cta Empezar"
  - "app.css picker block (.picker-rows/.picker-row/.picker-check-native/.picker-row-tick/.picker-count/.picker-cta)"
affects: [34-04-summary]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Native checkbox visually hidden (1px clip + opacity 0, NOT display:none) to preserve focus while reusing @change/:checked verbatim"
    - "Selection counter singular/plural via two x-show branches (number x-text, suffix hardcoded — T-02-01)"

key-files:
  created: []
  modified:
    - index.html
    - app.css
    - tests/screen-canciones.test.js

key-decisions:
  - "D-12: counter = pickerSelectedCount (selected CATEGORIES), exercise count stays in pickerStartLabel / test-completo warning"
  - "D-13: full-row clickable <label>; native checkbox visually hidden but @change=pickerToggleCategory / :checked kept verbatim; green ✓ glyph gated by pickerCheckedCategoryIds.includes(cat.id)"
  - "D-14: serif .cat-name = cat.name.split('(')[0].trim(); italic .cat-topic subtitle from the parenthetical, x-show on cat.name.includes('(') — same idiom as home D-32-02"
  - "Empezar reuses .session-cta verbatim (green + shadow + disabled); added layout-only .picker-cta (full-width + 24px top margin), .session-cta itself untouched"

patterns-established:
  - "Visually-hidden native checkbox (clip + opacity 0, pointer-events none) keeps the engine binding intact while the full-row label drives the interaction"

requirements-completed: [SRP-04]

# Metrics
duration: 2min
completed: 2026-06-30
---

# Phase 34 Plan 03: Repaso/Examen Picker Repaint Summary

**Repainted the Repaso/Examen picker into the Editoriale language — hairline category rows (serif name + italic paren-split subtitle + green ✓ when selected), a "{N} categorías seleccionadas" counter driven by `pickerSelectedCount`, and the green `.session-cta` Empezar button — reusing every picker handler/getter verbatim; engine untouched.**

## Performance

- **Duration:** 2 min
- **Started:** 2026-06-30T16:18:48Z
- **Tasks:** 2 completed
- **Files modified:** 3

## Accomplishments
- Replaced the bare `<fieldset>` of checkbox labels with Editoriale hairline rows (D-13): a full-row clickable `<label class="picker-row">` per `cat in content.categories`, serif `.cat-name` title via `x-text="cat.name.split('(')[0].trim()"` and an italic `.cat-topic` subtitle from the parenthetical (`x-show="cat.name.includes('(')"`) — the same split idiom as the home rows (D-14/D-32-02) — plus a green `✓` glyph on the right gated by `x-show="pickerCheckedCategoryIds.includes(cat.id)"`.
- Preserved the engine binding verbatim: the native checkbox keeps `@change="pickerToggleCategory(cat.id)"` and `:checked="pickerCheckedCategoryIds.includes(cat.id)"`, visually hidden via `.picker-check-native` (1px clip + `opacity:0`, not `display:none`, so row focus survives).
- Added a "{N} categorías seleccionadas" / "1 categoría seleccionada" counter (D-12) driven by the 34-01 `pickerSelectedCount` getter — the exercise count is NOT duplicated (it stays in `pickerStartLabel` and the test-completo warning).
- Repainted the Empezar button to the shipped green `.session-cta` (green fill + `--ed-shadow-cta` + `:disabled` state), keeping `@click="startSession"`, `:disabled="pickerPoolSize === 0"`, and `x-text="pickerStartLabel"` verbatim; added a layout-only `.picker-cta` rule (full-width + 24px top margin) without redefining `.session-cta`.
- Preserved bulk actions (`pickerSelectAll`/`pickerClearAll`), the Contrarreloj `.picker-timed` switch (`x-model="pickerTimed"`), the `pickerHeaderLabel` header, the `.picker-warning` test-completo notice, and the "← Volver al home" control.
- All new CSS sits at the bottom of `app.css` (`--ed-*` only, no `--pico-*`, dark-mode off), winning the cascade by source order.

## Task Commits

Each task was committed atomically:

1. **Task 1: picker rows + green tick + selected-category counter** - `953d87f` (feat)
2. **Task 2: Empezar CTA repainted to .session-cta** - `1cc26d5` (feat)

## Files Created/Modified
- `index.html` - Picker `<fieldset>` → `.picker-rows` Editoriale hairline rows + selection counter; Empezar button gains `class="session-cta picker-cta"`. Presentation only; all handlers/getters reused verbatim.
- `app.css` - New bottom-of-file picker block (`.picker-rows`, `.picker-row`, `.picker-check-native`, `.picker-row-body`, `.picker-row-topic`, `.picker-row-tick`, `.picker-count`, `.picker-cta`). `--ed-*` tokens only; `.session-cta` reused (not redefined).
- `tests/screen-canciones.test.js` - Phase 34-03 Task 1 + Task 2 source-asserts (split idiom, tick gate, toggle/`:checked` verbatim, `pickerSelectedCount` not `pickerPoolSize`, no `x-html`, `.session-cta` class + bindings, `.session-cta` not redefined, warning intact).

## Decisions Made
- **Native checkbox visually hidden via clip, not `display:none`:** keeps keyboard focus/tab order on the row while the full-row `<label>` drives selection and the engine binding (`@change`/`:checked`) stays untouched. Matches D-13's "full-row clickable" intent without a JS change.
- **Counter singular/plural via two `x-show` branches:** the number renders via `x-text="pickerSelectedCount"` and the suffix ("categoría seleccionada" / "categorías seleccionadas") is a hardcoded literal — satisfies T-02-01 (data via `x-text`, copy hardcoded) without a new getter.
- **`.picker-cta` for context layout only:** `.session-cta` is `inline-flex`; the picker CTA needs full-width + top margin, so a thin `.picker-cta` adds layout without touching the reused green/shadow/disabled rule.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CSS comment prose tripped the `prefers-color-scheme` regression guard**
- **Found during:** Task 1
- **Issue:** The 34-01 regression test asserts `prefers-color-scheme` appears nowhere in `app.css` (regex matches prose, not just rules). My picker-block banner comment included the literal phrase "sin prefers-color-scheme (D-32-03, dark-mode off)", which tripped both the pre-existing 34-01 guard and my own new picker guard.
- **Fix:** Reworded the comment to "dark-mode off (D-32-03 — sin reglas de media query de color)", removing the literal token while keeping the documented intent (no dark-mode rules introduced — which is true; the block adds none).
- **Files modified:** app.css
- **Commit:** 953d87f

## Verification
- `node --test tests/screen-canciones.test.js` → 69 tests, 69 pass, 0 fail.
- `node --test tests/*.test.js` → 548 tests, 547 pass, 1 fail (the single pre-existing, unrelated `Categorías con explanation coverage (Phase 7.1+)` content-data failure — out of scope, documented in 34-01).
- `grep -c 'x-html=' index.html` → 0 (T-02-01 anti-XSS guard satisfied; only comment prose references it).
- No new `--pico-*` references and no `prefers-color-scheme` rules in `app.css`.

## Known Stubs
None — every binding is wired to real engine state (`content.categories`, `pickerCheckedCategoryIds`, `pickerSelectedCount`, `pickerStartLabel`, `pickerPoolSize`, `pickerTimed`); the markup consumes the existing handlers/getters verbatim. Presentation-only.

## Self-Check: PASSED
- index.html: FOUND (modified)
- app.css: FOUND (modified)
- tests/screen-canciones.test.js: FOUND (modified)
- Commit 953d87f: FOUND
- Commit 1cc26d5: FOUND
