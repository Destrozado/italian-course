---
phase: 04-backup-robusto-contenido-completo
reviewed: 2026-05-24T15:30:00Z
depth: deep
files_reviewed: 17
files_reviewed_list:
  - src/data/backup.js
  - src/data/storage.js
  - src/domain/dates.js
  - src/screens/app.js
  - src/main.js
  - src/data/content-loader.js
  - index.html
  - styles.css
  - content/categories.json
  - content/exercises/avere.json
  - content/exercises/preposiciones.json
  - content/exercises/verbos-movimiento.json
  - content/exercises/sustantivos-irregulares.json
  - content/exercises/genero-numero.json
  - content/exercises/profesiones.json
  - tests/backup.test.js
  - tests/domain.test.js
  - tests/data-storage.test.js
  - scripts/validate-content-fixture.mjs
  - scripts/snapshot-avere-prefix.mjs
  - scripts/assert-avere-prefix-unchanged.mjs
  - scripts/assert-multi-cat-cross.mjs
  - .gitignore
status: issues_found
commits_reviewed: 4 (Plans 04-01 .. 04-04)
findings:
  blocker: 0
  high: 1
  medium: 4
  low: 5
  info: 4
  critical: 0
  warning: 5
  total: 14
severity_breakdown:
  BLOCKER: 0
  HIGH: 1
  MEDIUM: 4
  LOW: 5
  INFO: 4
---

# Phase 4: Code Review Report — Backup robusto + contenido completo

**Reviewed:** 2026-05-24T15:30:00Z
**Depth:** deep
**Files Reviewed:** 17 source files + 5 scripts + 3 test files
**Status:** issues_found (1 HIGH, 4 MEDIUM, 5 LOW, 4 INFO — advisory, NOT blocking)

## Summary

Phase 4 delivers `(a)` a robust manual backup system (JSON export/import + >7-day reminder) on top of the existing storage layer, and `(b)` 6 PDFs transcribed to JSON with cross-category exercises (avere-300..305) exercising the D-54 cascade. The implementation is sound overall and the layered architecture is preserved.

**Strengths verified:**
- **Layer purity D-02:** `src/data/backup.js` and `src/domain/dates.js` contain ZERO references to `localStorage`, `document`, or `window` (verified via grep). `src/data/storage.js` remains the only door to localStorage.
- **D-88 APPEND-ONLY invariant:** The first 17 exercises of `avere.json` (avere-001..012, avere-100..101, avere-200..202) are intact. New multi-cat exercises (avere-300..305) are appended at the end. The snapshot+assert scripts mechanize the invariant correctly.
- **Pitfall coverage:** All 10 catalogued pitfalls from `04-RESEARCH.md` are addressed (revokeObjectURL deferred, `input.value=''` reset, try/catch JSON.parse, DST-safe day arithmetic via local-noon anchor, future-date defense via negative `daysSinceISO`, schemaVersion bounds check, prototype pollution defense via literal reconstruction, `JSON.stringify` elides `undefined` for `inFlightTest` and `firstUsedAt`, `resetSession` before `commitImport`).
- **No XSS surface:** all JSON-derived text rendered via `x-text` (textContent). No `innerHTML`, no `dangerouslySetInnerHTML`, no `eval`, no `new Function`.
- **Design rule applied:** `match` exercises kept only where the right-side answer is NOT derivable from the left-side root (genero-numero 207/208/209 for articles; profesiones 200/201/202 for place/tool/verb). `sustantivos-irregulares.json` contains zero match exercises — former match exercises were correctly converted to multi-choice.
- **Spanish UI + ASCII apostrophes:** all user-facing copy is in Spanish (FOUND-04); no curly quotes/apostrophes detected in content or source files.

**Findings below are advisory** — none block phase completion. The single HIGH item is an architectural gap around stale references after import (boot regression not re-run), but is benign in practice because the resume-test guard already defends downstream and applySessionResult tolerates missing exerciseById entries.

---

## HIGH Findings

### HI-01: `applyNewExerciseRegression` NOT re-run after `commitImport`

**File:** `src/screens/app.js:673-684` (handler `commitImport`)
**Severity:** HIGH
**Issue:**
After an import, `this.state = this.backupPendingImport.state` replaces the in-memory state, but `applyNewExerciseRegression(state, content)` (the boot-path DOMAIN-06 / D-40 sanity pass that demotes `hecha`/`dominada` categories whose pool grew with new exercises) is NOT invoked. The boot regression runs only in `src/main.js:85` on `state0 = loadState()` at startup. Consequence: if the user imports a backup from a previous app version with fewer exercises per category, categories may remain marked `hecha`/`dominada` despite having new uncleared exercises — the home table will lie about progress until the user manually re-practices the affected category and `applySessionResult` re-evaluates the status.

Concretely: a backup exported in v1 of the content (only `avere` with 17 exercises) imported into v2 (avere with 23 exercises including multi-cat) would keep `categoryProgress.avere.status === 'hecha'` even though `clearedExerciseIds.length < totalInCat`. The home table shows `✓ hecha` until the user practices avere and fails or completes a new session, at which point `applySessionResult` recomputes status. **No data loss; no crash; misleading UI for one session.**

**Suggested Fix:**
```js
commitImport() {
  if (!this.backupPendingImport) return;
  this.resetSession();
  // Re-run boot regression on the imported state (DOMAIN-06 / D-40)
  // so a backup from an older content version is normalized against the
  // currently loaded exercise pool BEFORE the home table renders.
  let imported = this.backupPendingImport.state;
  imported = applyNewExerciseRegression(imported, this.content);
  this.state = imported;
  saveState(this.state);
  this.backupPendingImport = null;
  this.backupLastMessage = { kind: 'success', text: 'Progreso importado correctamente.' };
  this.currentScreen = 'home';
}
```
Add import: `import { applyNewExerciseRegression } from '../domain/progress.js';` at top of `src/screens/app.js`.

---

## MEDIUM Findings

### ME-01: `requestConfirm` lacks `onCancel`; `backupPendingImport` lingers after Cancel

**File:** `src/screens/app.js:627-662` (`onFileSelected`) + `:307-314` (`requestConfirm`)
**Severity:** MEDIUM
**Issue:**
The 5th call-site of `requestConfirm` documents inline (line 651-654) that "requestConfirm no admite onCancel; cancelar deja backupPendingImport cargado pero inerte". In practice this means: user picks file A (valid), opens confirm, hits Cancel. `backupPendingImport` is set but `confirmDialog` becomes `null`. User now picks file B (also valid): `onFileSelected` correctly overwrites `backupPendingImport` so no stale state survives — OK.

But: user picks file A, hits Cancel, then navigates to home (clicks "← Volver al home"). `requestReturnToHome()` (line 238-261) clears `backupLastMessage` for the backup screen but does NOT clear `backupPendingImport`. The next time the user enters the backup screen and clicks Importar without picking a file (e.g., they cancel the file picker), nothing happens — but `backupPendingImport` is still populated with the OLD payload. If they somehow trigger `commitImport()` (which only fires from confirm callback, so this is hard to reach), the stale payload would be applied. **Currently unreachable as a bug because `commitImport` only fires from `onConfirm`, which is only set inside `onFileSelected` AFTER overwriting `backupPendingImport`.** So this is defensive depth, not a live bug.

**Suggested Fix:** Clear `backupPendingImport = null` either (a) on the Cancel button handler in `index.html:533-536` (turning it into an inline closure that clears both `confirmDialog` and `backupPendingImport`), or (b) extend `requestConfirm` to accept an `onCancel` callback. Option (a) is the minimal change:
```html
<button type="button" class="secondary"
        @click="confirmDialog = null; backupPendingImport = null"
        x-text="confirmDialog?.cancelLabel"></button>
```
But this couples the inline-confirm primitive to a Phase-4-specific concern. Option (b) is architecturally cleaner. Either is acceptable for v2 — current code is defensively safe.

### ME-02: `parseBackupFile` accepts `state.schemaVersion < 1` silently

**File:** `src/data/backup.js:88-99`
**Severity:** MEDIUM
**Issue:**
Step 4 rejects `state.schemaVersion > CURRENT_SCHEMA_VERSION` but has no lower bound. A backup with `state.schemaVersion: 0` (or negative) passes Step 4, then the migration chain at Step 5 (`if (migrated.schemaVersion === 1)... if (=== 2)...`) skips both branches, and `hydrateV3(migrated)` normalizes everything to v3 shape with defaults. Effectively: any `schemaVersion: 0` backup is silently "promoted" to v3 with empty sub-objects. No crash, no data loss (the user picked the file), but a malformed backup is accepted without explicit rejection.

**Suggested Fix:**
```js
// 4. Forward-compat + lower bound.
if (typeof state.schemaVersion !== 'number'
    || state.schemaVersion < 1
    || state.schemaVersion > CURRENT_SCHEMA_VERSION) {
  return {
    ok: false,
    reason: `state.schemaVersion=${state.schemaVersion} fuera del rango soportado (1..${CURRENT_SCHEMA_VERSION}).`
  };
}
```

### ME-03: Double `new Date().toISOString()` in `exportBackup`

**File:** `src/screens/app.js:583,589`
**Severity:** MEDIUM
**Issue:**
The handler does:
```js
this.state = { ...this.state, lastBackupAt: new Date().toISOString() };
if (this.state.firstUsedAt === null) {
  this.state = { ...this.state, firstUsedAt: new Date().toISOString() };
}
```
Two separate `new Date()` calls and two spread-replacements of `this.state`. The two timestamps differ by ~microseconds (effectively the same ISO string in practice), so this is cosmetic. But the double-spread does two reactive updates instead of one — Alpine recomputes dependent getters twice. Trivial perf; primary concern is style coherence.

**Suggested Fix:**
```js
const now = new Date().toISOString();
this.state = {
  ...this.state,
  lastBackupAt: now,
  firstUsedAt: this.state.firstUsedAt ?? now,
};
saveState(this.state);
```

### ME-04: `exerciseStats` orphans after import are never reaped

**File:** `src/screens/app.js:673-684` (`commitImport`) + `src/domain/progress.js`
**Severity:** MEDIUM
**Issue:**
After `commitImport`, `state.exerciseStats` may contain entries for exercise IDs that no longer exist in the currently-loaded content (e.g., the backup was exported when an exercise was named `avere-200` and that exercise was later removed by the author). These orphan stats sit in storage indefinitely, growing localStorage usage incrementally per import. At 5 MiB localStorage quota and ~500 bytes per stat entry, the practical limit is ~10K orphans — not realistic in v1. Cosmetic + future-proofing concern.

**Suggested Fix:** After `commitImport`, filter `state.exerciseStats` to keys present in `this.content.exerciseById`. Or defer to v2 as a maintenance pass. Same for `categoryProgress` entries referencing missing categories.

---

## LOW Findings

### LO-01: `parseBackupFile` error message for missing schemaVersion is ambiguous

**File:** `src/data/backup.js:74-76`
**Severity:** LOW
**Issue:**
The reject message reads: `El campo "state.schemaVersion" falta o no es número.` But the same message fires for both missing and non-number cases. A user editing a backup manually who set `schemaVersion: "3"` (string) sees the same message as one who omitted the field — slightly harder to diagnose.

**Suggested Fix:** Branch the message:
```js
if (state.schemaVersion === undefined) return { ok: false, reason: 'Falta el campo "state.schemaVersion".' };
if (typeof state.schemaVersion !== 'number') return { ok: false, reason: `"state.schemaVersion" debe ser número (recibido: ${typeof state.schemaVersion}).` };
```

### LO-02: `wrapper.schemaVersion` not type-guarded before mismatch check

**File:** `src/data/backup.js:80-85`
**Severity:** LOW
**Issue:**
The mismatch check `wrapper.schemaVersion !== state.schemaVersion` will trigger if `wrapper.schemaVersion` is missing/non-number. The reject message says `wrapper.schemaVersion=${wrapper.schemaVersion}` which renders as `wrapper.schemaVersion=undefined` — informative but not idiomatic. Equally a backup with `wrapper.schemaVersion: "3"` (string) would fail the mismatch check correctly (since `"3" !== 3`) and the message would read `wrapper.schemaVersion=3, state.schemaVersion=3` which is misleading.

**Suggested Fix:** Add an explicit type guard:
```js
if (typeof wrapper.schemaVersion !== 'number') {
  return { ok: false, reason: '"schemaVersion" en el envoltorio debe ser número.' };
}
if (wrapper.schemaVersion !== state.schemaVersion) { ... }
```

### LO-03: `buildImportConfirmMessage` shows "Invalid Date" if `exportedAt` is malformed

**File:** `src/screens/app.js:694-704`
**Severity:** LOW
**Issue:**
If `wrapper.exportedAt` is a string but not a valid ISO date (e.g., `"yesterday"`), `parseBackupFile` accepts it (line 103 only checks `typeof === 'string'`). Then `new Date("yesterday").toLocaleString('es-ES')` yields `"Invalid Date"` in the confirm dialog. The user sees "Vas a importar un backup del Invalid Date." Confusing but harmless.

**Suggested Fix:** In `buildImportConfirmMessage`:
```js
const parsed = new Date(summary.exportedAt);
const exportedDate = (summary.exportedAt === 'desconocido' || Number.isNaN(parsed.getTime()))
  ? 'fecha desconocida'
  : parsed.toLocaleString('es-ES');
```

### LO-04: `daysSinceISO` test for `null` second arg passes via `typeof !== 'string'` guard, but no test for empty string

**File:** `tests/backup.test.js:323-328`
**Severity:** LOW
**Issue:**
Test 20 covers `null`, `undefined`, and non-string `42`, but `daysSinceISO('2026-05-17T10:00:00.000Z', '')` (empty string) is not tested. The function would pass `''` through to `parseIsoLocalNoon('')` which returns `null` (regex doesn't match), then `if (!a || !b) return 0;` correctly handles it. So empty-string is OK, but the test coverage doesn't pin that down.

**Suggested Fix:** Add `assert.equal(daysSinceISO('2026-05-17T10:00:00.000Z', ''), 0);` to Test 21.

### LO-05: `tests/backup.test.js` Test 5 lives in the wrong describe block

**File:** `tests/backup.test.js:105-123`
**Severity:** LOW
**Issue:**
Test 5 ("migración cadena v1 → v3 hidratada (via parseBackupFile)") lives inside the `data/storage v3 — migrate2to3 + hydrateV3 + blankState v3` describe block, but actually exercises `parseBackupFile` (a `data/backup` function). Test 13 in the next describe block is a near-duplicate. The placement is documented in the comment but creates noise — readers expecting storage tests find a backup test.

**Suggested Fix:** Move Test 5 into the `data/backup — parseBackupFile happy path` describe block alongside Test 13, or rename the storage describe block to clarify the cross-module assertion. Cosmetic.

---

## INFO Findings

### IN-01: Multi-cat exercises live exclusively in `avere.json`

**File:** `content/exercises/*.json`
**Severity:** INFO
**Issue:**
SEED-02 ("1-2 multi-categoría por archivo") is interpreted in this implementation as "6 cruces in avere.json covering all 5 new categories" rather than literal "1-2 multi-cat per file." This is documented in plan 04-04 SUMMARY as a deliberate consequence of D-88 (don't touch other JSONs' original 17-exercise patterns and preserve APPEND-ONLY) and the natural semantic fit of avere with everything. The cascade is exercised, but a user picking only `genero-numero` for a session will never hit a multi-cat exercise — multi-cat coverage requires picking `avere` too.

**Suggestion:** Either accept (current behaviour) or add 1 multi-cat exercise per non-avere file in v2 to broaden coverage. No action needed for v1.

### IN-02: `parseBackupFile` doesn't validate post-migration shape (defers to hydrateV3)

**File:** `src/data/backup.js:96-99`
**Severity:** INFO
**Issue:**
The migration chain `migrate1to2 → migrate2to3 → hydrateV3` runs over user-provided input. `hydrateV3` defensively replaces malformed sub-objects with `{}` defaults. This means a backup with `state.categoryProgress: "not an object"` is silently coerced to `categoryProgress: {}` — the user loses category progress data with no error message. Acceptable tradeoff (broken backups still load) but worth noting as design choice.

**Suggestion:** Document this behaviour in user-facing docs (if any) or add a `summary.warnings` array to surface coercions. Not v1 priority.

### IN-03: `setTimeout(() => URL.revokeObjectURL(url), 0)` blocks GC for 1 tick

**File:** `src/screens/app.js:579`
**Severity:** INFO
**Issue:**
Pitfall #1 mitigation. The 0ms `setTimeout` defers `revokeObjectURL` to the next microtask, allowing the browser to start the actual download before the URL is invalidated. This is correct per MDN guidance. The `setTimeout` handle is not captured for cleanup — if the component is destroyed within that tick, the callback still fires (harmlessly, just no-op on already-revoked URL). Not an issue, just an observation.

### IN-04: No test for `exportBackup` / `commitImport` / `onFileSelected`

**File:** `src/screens/app.js:569-684`
**Severity:** INFO
**Issue:**
The screen-layer handlers `exportBackup`, `onFileSelected`, `commitImport`, `buildImportConfirmMessage` are not covered by unit tests because they use DOM APIs (`document.createElement`, `URL.createObjectURL`, file `text()`). Coverage is provided by the documented mini-UAT (5/5 PASS, 2026-05-24). Future polish: add jsdom-based tests or extract a `buildImportPlan(rawText): {plan, error}` pure helper to lift the testable logic out of the handler.

---

## Self-Check

- **D-02 layer purity (backup.js + dates.js):** PASSED — `grep -E 'localStorage|document\.|window\.' src/data/backup.js src/domain/dates.js` returns no matches.
- **D-88 APPEND-ONLY (avere.json):** PASSED — first 17 exercises (avere-001..012, avere-100..101, avere-200..202) preserved; new exercises (avere-300..305) appended at end. Snapshot+assert scripts verify structurally.
- **D-76 requestConfirm 5th call-site:** PASSED — onFileSelected uses the helper without modifying it. The acknowledged `onCancel` gap is documented and handled defensively (overwrite on next import, but cleanup post-back-to-home is incomplete — see ME-01).
- **Pitfall defenses present:** PASSED — all 10 catalogued pitfalls from 04-RESEARCH.md have defensive code (revokeObjectURL deferred via setTimeout, input.value reset, try/catch JSON.parse, DST-safe day arithmetic, future-date negative handling, schemaVersion upper bound — lower bound missing per ME-02, prototype pollution test passes, JSON.stringify elides undefined, resetSession before commitImport).
- **Spanish UI + ASCII apostrophes:** PASSED — no curly quotes/apostrophes in content/src; all user-facing strings in Spanish.
- **No XSS surface:** PASSED — only `x-text` (textContent) bindings; no `innerHTML` / `eval` / `new Function` / `document.write`.

**Self-Check: PASSED with caveats**
- HI-01 (boot regression after import) is the only finding that would benefit from a follow-up fix; the rest are MEDIUM/LOW/INFO and can be addressed opportunistically or deferred to v2.

---

_Reviewed: 2026-05-24T15:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: deep_
_Mode: advisory (does NOT block phase completion per spec)_
