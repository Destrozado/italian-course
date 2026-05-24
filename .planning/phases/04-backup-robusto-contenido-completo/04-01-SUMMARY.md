---
phase: 04-backup-robusto-contenido-completo
plan: 01
subsystem: ui
tags: [backup, migration, alpine, vanilla-js, localStorage, schema-versioning, dst-safe, pure-module, layer-purity]

# Dependency graph
requires:
  - phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
    provides: storage wrapper + migrate1to2/hydrateV2 patterns, schema-validator módulo puro shape, layer purity D-02, Pico CSS + Alpine stack pinned con SRI
  - phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
    provides: appShell factory plano (D-25), requestConfirm helper (4 call-sites pre-Phase 4), inFlightTest persistence + banner home pattern (D-43/D-44), .button-row-prominent + .inflight-banner CSS analogs, completeSession + applyResultToSession + persistInFlightTest call-sites de saveState (sobre los que se monta el firstUsedAt plumbing)
  - phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
    provides: applyResultToSession single call-site D-54 (consume el guard firstUsedAt en sus 2 ramas), 105 tests baseline verdes (Phase 1+2+3) sobre los que aterrizan los 23 nuevos
provides:
  - state schema v3 transparente (migrate2to3 idempotente + hydrateV3 defensivo + bumped CURRENT_SCHEMA_VERSION) — añade `lastBackupAt: null` y `firstUsedAt: null` sin destruir exerciseStats/categoryProgress/dailyLog/inFlightTest
  - módulo puro `src/data/backup.js` con `parseBackupFile(rawStr) → {ok, state, summary}|{ok:false, reason}` (6 reject paths con mensajes en español verbatim del UI-SPEC) + `buildBackupWrapper(state, exportedAt?)` envoltura `{kind:'italian-course-backup', exportedAt, schemaVersion, state}` (D-73)
  - helper puro `daysSinceISO(iso, todayStr)` en `src/domain/dates.js` DST-safe (local-noon anchor algoritmo, defensivo ante NaN/null, puede devolver negativo para fechas futuras per Pitfall #5)
  - pantalla Backup end-to-end: 5º valor de currentScreen enum, handlers exportBackup/onFileSelected/commitImport/buildImportConfirmMessage, 3 getters reactivos (shouldShowBackupBanner double-defense, backupBannerText, backupStatusLine con caso especial fecha futura), 4ª call-site de requestConfirm con cuerpo multi-párrafo
  - banner home recordatorio de backup >7 días con desaparición reactiva tras export (Alpine sobre state.lastBackupAt)
  - 3er botón "Backup" (class=secondary) en home button-row-prominent
  - firstUsedAt plumbing inline (NO helper) en 4 call-sites (completeSession + applyResultToSession D-54 + applyResultToSession match incorrect + persistInFlightTest spread) — guard `?? new Date().toISOString()` con comentario "Phase 4 D-78" inline
  - 23 tests nuevos (21 backup + 2 storage chain) sobre 105 baseline = 128/128 verdes
affects:
  - 04-02 (contenido Preposiciones + Verbos de movimiento): consume schema v3 + backup runtime listo para el autor ANTES de transcribir 6 PDFs (slice property MVP cumplida)
  - 04-03 (Sustantivos Irregulares + Género y Número + Profesiones): mismo backup runtime; ningún cambio adicional al schema esperado
  - 04-04 (avere multi-cat + smoke cascada + UAT integral): consume backup como red de seguridad pre/post-transcripción; UAT integral verifica los 5 criterios ROADMAP de Phase 4 incluyendo BACK-04/-05/-06 ya cerrados aquí

# Tech tracking
tech-stack:
  added: []  # Cero dependencias nuevas — Blob/URL/FileReader son browser-native; node:test sigue cubriendo dominio + data
  patterns:
    - "Migration chain en cadena (1→2→3→hydrateV3) en el dispatcher migrate() — añadir vN+1 requiere `if (s.schemaVersion === N) s = migrateNtoN+1(s);` + bump CURRENT_SCHEMA_VERSION + nuevo hydrateVN+1 defensivo. Tests cubren el dispatcher partiendo de cada versión anterior."
    - "Módulo puro `src/data/backup.js` con `{ok, ...} | {ok:false, reason}` discriminado — mismo patrón que `src/data/schema-validator.js`. Layer purity D-02 verificable por grep (`grep -E 'localStorage|document\\.|window\\.' src/data/backup.js` retorna exit 1)."
    - "DST-safe day-difference via local-noon anchor (`new Date(y, mo-1, d, 12, 0, 0, 0)`) — patrón aplicable a cualquier comparación 'días entre dos fechas locales'. Defensivo ante NaN/no-string/futuro (devuelve 0 o negativo según caller decida)."
    - "Prototype pollution defense por reconstrucción literal: `hydrateV3(parsed)` construye `{schemaVersion: 3, exerciseStats: ..., ...}` con literal — un `__proto__` en el JSON queda como property no-prototype tras la reconstrucción. Verificado con test que asserta `({}).polluted === undefined` post-parse."
    - "firstUsedAt plumbing INLINE (NO helper) — 4 call-sites tocados con 1 línea cada uno (`if (newState.firstUsedAt === null) newState.firstUsedAt = new Date().toISOString();` o `?? new Date().toISOString()` en el spread). Justificación: helper requeriría que el caller llame `this.setFirstUsedAtIfMissing()` ANTES de construir `newState`, cambiando el orden existente y subiendo riesgo de regresión. Inline mantiene cada call-site auto-contenido y obvio."
    - "Reactividad Alpine sobre `state.lastBackupAt`: tras `this.state = { ...this.state, lastBackupAt: ... }` el banner home desaparece sin recargar (`shouldShowBackupBanner` getter recomputa). Patrón observable también para el banner inflight existente."
    - "Confirmación inline reusable (`requestConfirm` 5ª call-site post-Phase-4) sin tocar el helper — solo añade nueva invocación con mismo shape `{message, confirmLabel, cancelLabel, onConfirm}`. Aceptada limitación: `onCancel` no soportado, `backupPendingImport` queda cargado pero inerte al cancelar (documentado inline)."
    - "`white-space: pre-line` en `.confirm-inline #confirm-message` — habilita newlines en `buildImportConfirmMessage` sin afectar los otros usos del panel (D-43/D-44 reanudar/descartar test). Descendant selector mantiene scope."
    - "`x-show` sobre `<p>` mensaje (NO `x-if`) con optional chaining (`backupLastMessage?.kind`, `backupLastMessage?.text`) — DOM mantenido montado, evita ruido de mount/unmount cuando el mensaje cambia entre success y error."

key-files:
  created:
    - src/data/backup.js
    - tests/backup.test.js
    - .planning/phases/04-backup-robusto-contenido-completo/04-01-SUMMARY.md
  modified:
    - src/data/storage.js
    - src/domain/dates.js
    - src/screens/app.js
    - index.html
    - styles.css
    - tests/data-storage.test.js
    - tests/domain.test.js

key-decisions:
  - "D-73 envoltura `{kind:'italian-course-backup', exportedAt, schemaVersion, state}` aterriza en `buildBackupWrapper` + `parseBackupFile`. Discriminador `kind` rechaza archivos JSON ajenos antes de cualquier guard de shape."
  - "D-74 validación estricta de import (kind check + state requerido + schemaVersion ≤3 acepta con migrate chain + >3 rechaza) implementada como 7 guards secuenciales en `parseBackupFile`; mensajes literales del UI-SPEC en español sin emojis."
  - "D-75 nombre `italian-course-backup-YYYY-MM-DD.json` vía `a.download = \`italian-course-backup-${todayLocal()}.json\`;` — fecha local NO UTC (consistencia con dailyLog)."
  - "D-76 4ª call-site de `requestConfirm` inline en `onFileSelected` sin tocar el helper. Pre-Phase-4 había 4 call-sites (D-27 + D-43 + 2 × D-44); ahora 5 totales (W-NEW-4 fix)."
  - "D-77 `lastBackupAt` añadido al state v3 via migrate2to3; reseteado a ISO actual tras exportBackup exitoso. `null` significa 'nunca exportado' — el banner usa `firstUsedAt` como fallback (D-78)."
  - "D-78 `firstUsedAt` segundo timestamp añadido al state v3; guard inline en 4 call-sites (completeSession + applyResultToSession ×2 + persistInFlightTest spread). `null` significa 'state nunca tocado en sesión real' — banner suprimido hasta que aparezca el primer saveState real."
  - "D-79 timestamp ISO UTC vía `new Date().toISOString()`; comparación por días locales completos vía `daysSinceISO(iso, todayStr)` puro DST-safe. Helper puede devolver negativo (futuro) — `shouldShowBackupBanner` interpreta `<0` como 'no mostrar' (Pitfall #5 + T-04-04)."
  - "D-80 banner persistente sin snooze — `<template x-if='shouldShowBackupBanner'>` en home, getter en app.js, sin snoozedUntil ni dismiss. Desaparece automáticamente al exportar (reactividad Alpine sobre state.lastBackupAt)."
  - "D-81 3er botón `Backup` (class=secondary, Pico) en `.button-row.button-row-prominent` — orden Repaso 20 → Test completo → Backup (per UI-SPEC)."
  - "D-82 `requestReturnToHome` reusado por botón ← Volver al home; W-2 fix limpia `backupLastMessage` al salir de la pantalla Backup para que no aparezca stale al re-entrar."
  - "D-83 pantalla `currentScreen='backup'` con header + status line + 2 botones (Exportar primario / Importar secundario) + input file oculto + mensaje area + back button. Wireframe UI-SPEC implementado verbatim."
  - "D-84 5º valor `'backup'` en `currentScreen` switch + sub-estados `backupLastMessage`/`backupPendingImport` declarados en el factory plano de app.js (patrón D-25). `backupFileInputRef` resuelto vía `$refs.backupFileInput` (no propiedad)."
  - "Helper `setFirstUsedAtIfMissing` propuesto en RESEARCH RECHAZADO (B-5 fix) — los 4 call-sites son tocables en 1 línea cada uno; un helper subiría riesgo arquitectónico (cambia orden de operaciones en el caller). Inline mantenido."

patterns-established:
  - "Migration chain dispatcher: `if (s.schemaVersion === N) s = migrateNtoN+1(s);` repetido por versión + retorno final `hydrateV{LATEST}(s)`. Idempotente por type-guards en cada `migrateNtoN+1`."
  - "Layer purity por grep: `grep -E 'localStorage|document\\.|window\\.' src/data/backup.js` debe retornar exit 1. Test estructural sin runtime."
  - "Reject path con mensaje literal del UI-SPEC: el módulo puro produce el string que la UI muestra directamente — sin transformación intermedia. Diff entre UI-SPEC `Message area copy` y `parseBackupFile` strings = 0."
  - "DST-safe day-diff: helper privado `parseIsoLocalNoon(isoDate) → new Date(y, mo-1, d, 12, 0, 0, 0)` anchor 12:00 local. Resiste cambios DST (23/25h) porque la diferencia siempre es ≥ ~22h ≤ ~26h, redondeada a días enteros vía `Math.round(diff / 86400000)`."
  - "Prototype pollution defense por reconstrucción literal en `hydrate*` — V8 trata `__proto__` literal-key como property de objeto plano, NO contamina `Object.prototype`. Test cubre `({}).polluted === undefined` post-parse."
  - "Multi-source banner (lastBackupAt + firstUsedAt fallback): si nunca exportó pero firstUsedAt indica state real existente >7d, el banner igualmente aparece. Texto switch en `backupBannerText` getter."
  - "Reactividad Alpine sobre spread immutable `this.state = { ...this.state, lastBackupAt: ... }` — el getter recomputa porque la referencia cambia. NO mutar `this.state.lastBackupAt = ...` (Alpine NO observaría el cambio profundo)."

# Quality marks
requirements-completed: [BACK-04, BACK-05, BACK-06]
# Note: SEED-01 + SEED-02 (transcripción de 6 PDFs) NO cubiertos aquí —
# corresponden a planes 04-02 / 04-03 / 04-04. Este plan entrega el
# backup runtime AISLADO sobre el contenido actual (solo Avere) como
# slice vertical MVP (B-3 protección de la slice property).

# Metrics
duration: ~16min
completed: 2026-05-24
---

# Phase 4 Plan 01: Backup runtime end-to-end vertical slice Summary

**State schema v3 + módulo puro `src/data/backup.js` con `parseBackupFile`/`buildBackupWrapper` (6 reject paths español verbatim del UI-SPEC) + helper `daysSinceISO` DST-safe + pantalla Backup completa (handlers export/import, banner home recordatorio >7d con reactividad sobre `state.lastBackupAt`, 3er botón en home, firstUsedAt plumbing inline en 4 call-sites) + 23 tests nuevos (128/128 verdes) — el autor puede exportar/importar progreso desde el día 1 del plan ANTES de transcribir los 6 PDFs.**

## Performance

- **Duration:** ~16 min (Task 1 + Task 2; Task 3 mini-UAT humano ~10 min adicionales)
- **Started:** 2026-05-24T10:04:00Z (commit 180168d timestamp aprox)
- **Completed:** 2026-05-24T10:30:00Z (post mini-UAT humano PASS)
- **Tasks:** 3 (Task 1 auto/TDD + Task 2 auto/TDD + Task 3 checkpoint:human-verify)
- **Files created:** 3 (backup.js, backup.test.js, este SUMMARY)
- **Files modified:** 6 (storage.js, dates.js, app.js, index.html, styles.css, data-storage.test.js, domain.test.js)
- **Tests:** 105 baseline (Phase 1+2+3) + 23 nuevos (Phase 4 Task 1) = **128/128 verdes**, 0 skipped, 0 failed.

## Accomplishments

### Data layer (Task 1)
- **Storage v2→v3 transparente** (`src/data/storage.js`): bump `CURRENT_SCHEMA_VERSION = 3`; `blankState` extendido con `lastBackupAt: null` y `firstUsedAt: null` (D-77/D-78); nuevo export `migrate2to3(v2)` idempotente preservando exerciseStats/categoryProgress/dailyLog/inFlightTest intactos (type-guard cada campo igual que `migrate1to2`); nuevo export `hydrateV3(parsed)` defensivo ante sub-objetos malformados (mismo patrón que `hydrateV2` líneas 163-177); dispatcher `migrate()` encadena `1→2→3→hydrateV3` en fall-through; `hydrateV2` conservado como export por backward-compat de tests existentes. Header del archivo cita explícita "D-77 / D-78 (Phase 4)".
- **Módulo puro `src/data/backup.js`** (NEW): `parseBackupFile(rawStr)` con 7 guards secuenciales (JSON parse + wrapper object + kind check + state object + schemaVersion number + wrapper/state version match + schemaVersion ≤3) → migration chain `migrate1to2 → migrate2to3 → hydrateV3` → summary `{exportedAt, categories, exercises}` → return `{ok:true, state:migrated, summary}` o `{ok:false, reason}` con mensaje literal del UI-SPEC. `buildBackupWrapper(state, exportedAt=new Date().toISOString())` retorna `{kind:'italian-course-backup', exportedAt, schemaVersion, state}` (D-73). Default param permite tests deterministas. Layer purity D-02 verificada por grep (cero matches `localStorage|document.|window.`).
- **Helper puro `daysSinceISO`** (`src/domain/dates.js`): nuevo export con algoritmo DST-safe local-noon anchor (`parseIsoLocalNoon(isoDate) → new Date(y, mo-1, d, 12, 0, 0, 0)`) y redondeo `Math.round(diff / 86400000)`. Defensivo: `typeof iso !== 'string'` → 0; `Date.getTime()` NaN → 0. PUEDE devolver negativo para fechas futuras (Pitfall #5 + T-04-04). JSDoc cita Pitfall #4 (DST) + Pitfall #5 (negative).

### UI layer (Task 2)
- **5 handlers nuevos** en `src/screens/app.js`:
  - `exportBackup()`: `buildBackupWrapper(this.state)` → `JSON.stringify(wrapper, null, 2)` → Blob `application/json` → `URL.createObjectURL` → anchor `a.download = \`italian-course-backup-${todayLocal()}.json\`` (D-75) → `a.click()` → `setTimeout(URL.revokeObjectURL, 0)` (Pitfall #1+#7). Inmediatamente: `this.state = { ...this.state, lastBackupAt: new Date().toISOString() }`; `if (firstUsedAt === null) state.firstUsedAt = ...` (primer-export defensivo); `saveState`; `backupLastMessage = {kind:'success', text:'Progreso exportado. Guarda el archivo en lugar seguro.'}` (literal UI-SPEC).
  - `onFileSelected(event)` async: `file.text()` → `parseBackupFile(rawText)` → si `!ok` muestra `backupLastMessage = {kind:'error', text:result.reason}` + `input.value=''` y return; si `ok` → `backupPendingImport = {state, summary}` → `requestConfirm({message: buildImportConfirmMessage(summary), confirmLabel:'Continuar', cancelLabel:'Cancelar', onConfirm: () => commitImport()})` → `input.value=''` (Pitfall #2 — siempre al final). Comentario inline documenta que `requestConfirm` NO admite `onCancel` (limitación aceptada — `backupPendingImport` queda cargado pero inerte al cancelar, se sobreescribe en el próximo import).
  - `commitImport()`: guard `!backupPendingImport` → `resetSession()` (Pitfall #10 — descarta sesión in-flight antes de reemplazar state) → `this.state = backupPendingImport.state` → `saveState` → `backupPendingImport = null` → `backupLastMessage = {kind:'success', text:'Progreso importado correctamente.'}` → `currentScreen = 'home'`.
  - `buildImportConfirmMessage(summary)`: string multi-línea con `\n\n` entre párrafos; si `exportedAt === 'desconocido'` → "un backup de fecha desconocida"; en caso contrario `new Date(...).toLocaleString('es-ES')`. Cuerpo literal con cuenta `categorías con progreso` + `ejercicios con stats` + warning `REEMPLAZARÁ tu progreso actual y no se puede deshacer`.
- **3 getters reactivos** en `src/screens/app.js`:
  - `shouldShowBackupBanner`: double-defense `if (!this.state) return false;` luego `lastBackupAt` o `firstUsedAt` con `daysSinceISO(...) > 7`. Pitfall #5: trata `days < 0` (fecha futura) como "no mostrar" (T-04-04 defensa).
  - `backupBannerText`: si `lastBackupAt === null` → "Aún no has exportado tu progreso."; en caso contrario `Han pasado ${days} días desde tu último backup.`.
  - `backupStatusLine`: en pantalla Backup; formato `Último backup: ${fechaLegible} (hace N días).` con casos especiales `N===0` → "(hoy)", `N<0` → "(fecha futura)". `fechaLegible` vía `toLocaleDateString('es-ES', {day:'numeric', month:'long', year:'numeric'})`.
- **firstUsedAt plumbing INLINE** en 4 call-sites de `src/screens/app.js`: `completeSession()` (~línea 1103) + `applyResultToSession` rama D-54 fallo inmediato (~línea 598) + `applyResultToSession` rama match incorrect (~línea 810) + `persistInFlightTest` (spread modificado para combinar `firstUsedAt: this.state.firstUsedAt ?? new Date().toISOString()` con `inFlightTest`). Cada call-site lleva comentario `// Phase 4 D-78: marca firstUsedAt si null (inline guard, no helper).`
- **W-2 fix** en `requestReturnToHome()`: bloque que limpia `backupLastMessage = null` cuando `currentScreen === 'backup'` antes de saltar a `resetSession()`. UI-SPEC línea 206 cumplido: "It is cleared automatically when the user leaves the backup screen".
- **Markup** en `index.html`:
  - Banner backup en home: `<template x-if="shouldShowBackupBanner">` con `role="alert"`, clase `.backup-banner`, texto via `x-text="backupBannerText"`, botón "Ir a Backup" que setea `currentScreen = 'backup'`. Insertado DESPUÉS de `<template x-if="inFlightTestActive">` y ANTES de `<div class="button-row button-row-prominent">`.
  - 3er botón "Backup" (`class="secondary"`) en `.button-row.button-row-prominent` (D-81). Orden final: Repaso 20 → Test completo → Backup.
  - Template `<template x-if="currentScreen === 'backup'">`: `<article>` con header "Backup", `<p class="picker-warning" x-text="backupStatusLine">`, `.button-row` con 2 botones (Exportar primario / Importar secundario que dispara `$refs.backupFileInput.click()`), `<input type="file" x-ref="backupFileInput" accept=".json,application/json" @change="onFileSelected($event)" style="display:none">`, `<p x-show="backupLastMessage" :class="backupLastMessage?.kind === 'success' ? 'backup-message-success' : 'backup-message-error'" x-text="backupLastMessage?.text">`, `<hr>`, botón `← Volver al home`.
- **CSS** en `styles.css` (~25 líneas añadidas al final): `.backup-banner` (border ámbar + bg 0.08 + padding + margin-bottom + display flex align-items center gap 0.75rem, espejo de `.inflight-banner`), `.backup-banner button { margin-left: auto; flex-shrink: 0; }`, `.backup-message-success` (verde, mismo color que `.delta-promotion`), `.backup-message-error` (rojo, mismo color que `.delta-regression`), `.confirm-inline #confirm-message { white-space: pre-line; }` (habilita newlines del confirm body). Cada bloque precedido por comentario "Phase 4 — ... (D-XX)".

### Tests (Task 1)
- **`tests/backup.test.js`** (NEW, 335 líneas): 21 tests organizados en 5 describe blocks:
  - `data/backup — parseBackupFile happy path` (3 tests: v3, migración v1→v3, migración v2→v3).
  - `data/backup — parseBackupFile error paths` (7 tests: JSON inválido, kind erróneo, state ausente, schemaVersion ausente, futura, mismatch, prototype pollution defense — el último verifica `result.ok=true` Y `({}).polluted === undefined`).
  - `data/backup — buildBackupWrapper` (1 test con `exportedAt` explícito determinista).
  - `data/storage — migrate2to3 + hydrateV3 + blankState v3` (5 tests: shape v3, idempotencia sobre valores existentes, hydrateV3 defensivo, blankState shape exacto, dispatcher v1→v3 cadena).
  - `domain/dates — daysSinceISO` (5 tests: mismo día → 0, 7 días → 7, futuro → -7, no-string → 0, NaN-date → 0).
- **`tests/data-storage.test.js`** (EXTEND): nuevo describe block `data/storage v3 — migrate2to3 chain + hydrateV3` con 2 tests adicionales que NO viven en backup.test.js (dispatcher v1→v3 + hydrateV3 sobre v3 directo con sub-objetos malformados).
- **`tests/domain.test.js`** (EXTEND): 1 línea de comentario al final apuntando a tests/backup.test.js para los tests de daysSinceISO (co-located).

## Task Commits

W6 política multi-commit honrada con 2 commits separados — granularidad task-level (Task 1 puro data + domain + tests, Task 2 puro UI + estilos):

1. **Task 1 (TDD): Migración v2→v3 + daysSinceISO + backup.js módulo puro + tests** — `180168d` (feat). RED → GREEN ejecutadas. Layer purity D-02 verificada por grep tras el commit (cero matches `localStorage|document.|window.` en `src/data/backup.js` y `src/domain/dates.js`). 128 tests verdes post-commit (105 baseline + 23 nuevos). Stats: 6 archivos cambiados, +663 inserciones / −18.

2. **Task 2: Pantalla Backup + handlers export/import + banner home + 3er botón + firstUsedAt plumbing + estilos** — `33b0945` (feat). 3 archivos editados: `src/screens/app.js` (+292 líneas: 5 handlers + 3 getters + 4 inline guards firstUsedAt + W-2 fix requestReturnToHome + sub-estados + imports), `index.html` (+76 líneas: banner + 3er botón + template Backup), `styles.css` (+48 líneas: 5 reglas Phase 4). 128 tests verdes preservados (ningún cambio estructural del session/picker/summary). `node --check src/screens/app.js && node --check src/data/backup.js && node --check src/domain/dates.js` exit 0.

3. **Task 3 (checkpoint:human-verify): Mini-UAT humano del flujo Backup end-to-end** — sin commit, 5/5 PASS por el autor (2026-05-24):
   - **UAT-1 (Render inicial pantalla Backup):** PASS — pantalla carga sin errores en consola; "Aún no has exportado tu progreso." visible; 2 botones + back button correctos.
   - **UAT-2 (Exportar descarga JSON):** PASS — archivo descargado con nombre `italian-course-backup-2026-05-24.json`; contenido JSON well-formed con shape `{kind, exportedAt, schemaVersion, state}`; mensaje verde "Progreso exportado. Guarda el archivo en lugar seguro." visible; banner home desaparece tras volver.
   - **UAT-3 (Import error path):** PASS — archivo JSON ajeno (sin `kind` correcto) muestra mensaje rojo literal del UI-SPEC; sin throw, sin crash en consola.
   - **UAT-4 (Import OK round-trip):** PASS — confirmación inline muestra fecha local + categorías + ejercicios + warning REEMPLAZARÁ; "Continuar" reemplaza state; vuelta a home con mensaje verde "Progreso importado correctamente."; estado idéntico al exportado verificado en DevTools localStorage.
   - **UAT-5 (Banner reactividad >7d + null + futuro):** PASS — DevTools sim `lastBackupAt = 8 días atrás` → banner aparece; sim `lastBackupAt = null && firstUsedAt = 8d` → banner aparece con texto "Aún no has exportado..."; sim `lastBackupAt = mañana` → banner suprimido (T-04-04 defensa por `daysSinceISO < 0`).

**Plan metadata commit:** (próximo, este commit) `docs(04-01): summary + mini-UAT PASS, complete plan`.

## Files Created/Modified

### Created
- `src/data/backup.js` — Módulo puro `parseBackupFile` + `buildBackupWrapper`. 130 líneas. 0 dependencias de localStorage/DOM (D-02 verificada por grep). Mensajes en español verbatim del UI-SPEC.
- `tests/backup.test.js` — 21 tests organizados en 5 describe blocks (parseBackupFile happy + error paths + buildBackupWrapper + migrate2to3/hydrateV3/blankState v3 + daysSinceISO). 335 líneas.
- `.planning/phases/04-backup-robusto-contenido-completo/04-01-SUMMARY.md` — Este archivo.

### Modified
- `src/data/storage.js` — +104 líneas. `CURRENT_SCHEMA_VERSION = 3`, `blankState` con `lastBackupAt/firstUsedAt: null`, exports nuevos `migrate2to3` + `hydrateV3`, dispatcher `migrate()` encadena 1→2→3→hydrateV3, header cita "D-77 / D-78 (Phase 4)", `hydrateV2` conservado como export.
- `src/domain/dates.js` — +56 líneas. Nuevo export `daysSinceISO(iso, todayStr)` + helper privado `parseIsoLocalNoon`. JSDoc cita Pitfall #4 + #5.
- `src/screens/app.js` — +292 líneas. Imports nuevos (daysSinceISO, parseBackupFile, buildBackupWrapper), JSDoc enum currentScreen extendido con 'backup', 2 sub-estados nuevos (backupLastMessage, backupPendingImport), 5 handlers nuevos (exportBackup, onFileSelected async, commitImport, buildImportConfirmMessage), 3 getters reactivos (shouldShowBackupBanner, backupBannerText, backupStatusLine), 4 inline guards firstUsedAt con comentario "Phase 4 D-78", W-2 fix en requestReturnToHome.
- `index.html` — +76 líneas. Banner home `<template x-if="shouldShowBackupBanner">`, 3er botón "Backup" en `.button-row-prominent`, template `<template x-if="currentScreen === 'backup'">` completo con header + status + 2 botones + input file oculto + mensaje + back.
- `styles.css` — +48 líneas al final. `.backup-banner`, `.backup-banner button`, `.backup-message-success`, `.backup-message-error`, `.confirm-inline #confirm-message`. Cada bloque con comentario "Phase 4 — ... (D-XX)".
- `tests/data-storage.test.js` — +54 líneas. Asserts actualizados a v3 + nuevo describe block `migrate2to3 chain + hydrateV3` con 2 tests.
- `tests/domain.test.js` — +2 líneas. Nota co-located al final apuntando a `tests/backup.test.js`.

## Decisions Made

Ver bloque `key-decisions` del frontmatter (D-73..D-84 + decisión de rechazar el helper `setFirstUsedAtIfMissing`). Decisiones principales adicionales emergidas durante ejecución:

1. **Helper `setFirstUsedAtIfMissing` RECHAZADO (B-5 fix del checker)** — RESEARCH sugería un helper en `appShell` que mutase `this.state` antes del `saveState`. La revisión del checker (B-5) detectó que: (a) los 4 call-sites son tocables en 1 línea cada uno; (b) un helper requeriría que el caller llame `this.setFirstUsedAtIfMissing()` ANTES de construir `newState`, cambiando el orden de operaciones existentes; (c) el riesgo de regresión es asimétrico (un olvido del helper en un nuevo call-site futuro = bug silencioso); (d) el inline guard hace cada call-site auto-contenido y obvio en code review. Decisión final: 4 call-sites con guard inline `?? new Date().toISOString()` o `if (newState.firstUsedAt === null) newState.firstUsedAt = ...`. Comentario `// Phase 4 D-78` en cada uno hace el patrón rastreable por grep. Reflejado en el frontmatter `must_haves.artifacts` del PLAN.

2. **`requestConfirm` no admite `onCancel` — limitación aceptada inline** — La firma actual del helper (verificada durante read_first, src/screens/app.js:289) sólo lee `{message, confirmLabel, cancelLabel, onConfirm}`. Pasar un `onCancel` sería ignorado silenciosamente. Decisión: NO añadir `onCancel` al `onFileSelected`; aceptar que `backupPendingImport` queda cargado pero inerte al cancelar (se sobreescribe en el próximo import). Documentado con comentario inline en `onFileSelected`. Alternativa rechazada: extender `requestConfirm` para soportar `onCancel` — fuera de scope de este plan (4 call-sites pre-existentes funcionan sin él; añadirlo requeriría tocar el helper + verificar que las 4 call-sites existentes no rompen).

3. **`x-show` (no `x-if`) sobre el `<p>` mensaje** — Mantiene el DOM montado siempre; evita ruido de mount/unmount cuando el mensaje cambia entre success y error. Optional chaining (`backupLastMessage?.kind`, `backupLastMessage?.text`) hace el binding null-safe. UI-SPEC línea 553-556 justificaba esta elección.

4. **`white-space: pre-line` como descendant selector (`.confirm-inline #confirm-message`)** — habilita newlines en `buildImportConfirmMessage` sin afectar los otros 4 usos del panel `.confirm-inline` (D-43 reanudar / D-44 descartar / etc.). Scope CSS preservado.

5. **Banner suprimido cuando `daysSinceISO < 0`** — fecha futura por reloj del usuario fuera de sync (T-04-04). `shouldShowBackupBanner` retorna `false` en ese caso; `backupStatusLine` muestra "(fecha futura)" en la pantalla Backup. Defensa cero-coste verificada en mini-UAT-5.

## Deviations from Plan

**Total deviations:** 0 (plan ejecutado exactamente como escrito).

**Impact on plan:** ninguno — el plan ya incorporaba las correcciones del checker (B-3 mini-UAT, B-5 inline guard sin helper, W-NEW-4 5ª call-site, W-2 limpieza backupLastMessage) en el frontmatter `must_haves`. La ejecución consumió esas decisiones tal cual.

### Notes — no auth gates, ningún paquete instalado

Phase 4 Plan 01 NO involucra autenticación, instalación de paquetes (Phase 4 instala CERO paquetes externos per T-04-SC), ni decisiones arquitectónicas que requieran human-action. Ejecución 100% según `autonomous: false` con un único checkpoint humano (Task 3 mini-UAT). El checkpoint cumplió su función protectora — verificó el flujo end-to-end ANTES de aterrizar contenido en los planes 04-02..04-04 (slice property MVP per B-3).

## Issues Encountered

Ninguno bloqueante. Sub-iteraciones menores durante Task 2:

### W-1 (size de Task 2) mitigada por Task 3 mini-UAT
El checker pre-ejecución marcó W-1 ("Task 2 grande, ~292 líneas en app.js + 76 en index + 48 en styles"). Mitigación arquitectónica: Task 3 mini-UAT consume el output de Task 2 y verifica el flujo end-to-end ANTES de cualquier plan posterior. UAT 5/5 PASS confirma que el size no introdujo bugs.

### Reactividad Alpine sobre spread immutable
Punto verificable en mini-UAT-2: tras `this.state = { ...this.state, lastBackupAt: ... }`, el banner home debe desaparecer SIN recargar. Verificado por el autor en UAT — `shouldShowBackupBanner` getter recomputa porque la referencia `this.state` cambió (Alpine NO observaría una mutación profunda `this.state.lastBackupAt = ...`). Patrón ya establecido en Phase 2 (D-54 spread inmutable).

### Layer purity D-02 verificada por grep
```bash
$ grep -E 'localStorage|document\.|window\.' src/data/backup.js
$ echo $?
1
$ grep -E 'localStorage|document\.|window\.' src/domain/dates.js
$ echo $?
1
```
Ambos retornan exit 1 (sin matches). D-02 invariante preservada.

## Mini-UAT Result

**Sign-off:** PASS 5/5 por el autor el 2026-05-24.

| UAT | Verifica | Resultado |
|-----|----------|-----------|
| UAT-1 | Render inicial pantalla Backup | PASS — sin errores en consola del navegador; copywriting visible |
| UAT-2 | Exportar progreso descarga JSON correcto | PASS — archivo `italian-course-backup-2026-05-24.json` descargado; shape `{kind, exportedAt, schemaVersion, state}` verificado |
| UAT-3 | Import error path muestra mensaje rojo | PASS — archivo ajeno produce mensaje rojo literal; sin throw |
| UAT-4 | Import OK round-trip | PASS — confirmación inline + Continuar reemplaza state; round-trip idéntico |
| UAT-5 | Banner reactividad >7d + null + fecha futura | PASS — DevTools sim de los 3 escenarios verifica `shouldShowBackupBanner` getter |

El mini-UAT cumplió su función protectora del MVP slice property (B-3): bugs potenciales en banner/reactividad/orden DOM/flujo confirm→commitImport habrían sido capturados aquí ANTES de transcribir 5 PDFs encima en los planes 04-02..04-04. Cero bugs detectados.

## Self-Check

### Files exist
- `src/data/backup.js` — **FOUND**
- `tests/backup.test.js` — **FOUND**
- `src/data/storage.js` — **MODIFIED** (CURRENT_SCHEMA_VERSION=3, migrate2to3 + hydrateV3 exports nuevos, dispatcher encadena 1→2→3)
- `src/domain/dates.js` — **MODIFIED** (daysSinceISO export nuevo)
- `src/screens/app.js` — **MODIFIED** (+292 líneas: handlers + getters + inline guards + W-2 fix)
- `index.html` — **MODIFIED** (banner + 3er botón + template Backup)
- `styles.css` — **MODIFIED** (5 reglas Phase 4 al final)
- `tests/data-storage.test.js` — **MODIFIED** (asserts v3 + nuevo describe migrate2to3 chain)
- `tests/domain.test.js` — **MODIFIED** (nota co-located)
- `.planning/phases/04-backup-robusto-contenido-completo/04-01-SUMMARY.md` — **FOUND** (este archivo)

### Commits exist
- `180168d` Task 1 (feat) — **FOUND** (`git log --oneline | grep 180168d`)
- `33b0945` Task 2 (feat) — **FOUND**
- Final docs commit — pendiente (este commit).

### Tests green
- `node --test tests/*.test.js` exit 0, **128/128 verdes** (105 baseline Phase 1+2+3 + 23 nuevos Phase 4 Task 1). 0 skipped, 0 failed. Verificado tras Task 2 commit `33b0945`.

### Layer purity D-02
- `grep -E 'localStorage|document\.|window\.' src/data/backup.js` retorna exit 1 (sin matches).
- `grep -E 'localStorage|document\.|window\.' src/domain/dates.js` retorna exit 1 (sin matches).

### Mini-UAT
- 5/5 PASS por el autor (2026-05-24). Backup runtime end-to-end verificado humano-side.

### Decisiones cubiertas
- D-73, D-74, D-75, D-76, D-77, D-78, D-79, D-80, D-81, D-82, D-83, D-84 — 12 decisiones del CONTEXT.md materializadas (citadas en `decisions_covered` del PLAN frontmatter; matching contra implementación verificado por los grep AC del plan).

### Requirements cubiertos
- BACK-04 (export) ✅
- BACK-05 (import + confirmación) ✅
- BACK-06 (banner 7d) ✅

## Self-Check: PASSED

## Next Phase Readiness

Plan 04-02 listo para empezar:
- Backup runtime operativo en producción local — el autor puede exportar su progreso de Phase 1-3 ANTES de transcribir los 6 PDFs (red de seguridad MVP).
- Schema v3 transparente — nuevos campos en JSON se transcribirán manteniendo `lastBackupAt`/`firstUsedAt` intactos.
- 128 tests verdes como baseline de regresión para los siguientes 3 planes (04-02, 04-03, 04-04 cada uno añade ejercicios JSON sin tocar el motor).
- `requestConfirm` 5 call-sites (4 pre-Phase-4 + 1 nuevo en onFileSelected) — patrón consolidado para futuras confirmaciones.

Phase 4 cierra cuando 04-04 completa (UAT integral de los 5 criterios ROADMAP, incluyendo BACK-04/-05/-06 ya cerrados aquí + SEED-01/SEED-02 cubiertos por 04-02 + 04-03 + 04-04).

---
*Phase: 04-backup-robusto-contenido-completo*
*Plan: 01*
*Completed: 2026-05-24*
