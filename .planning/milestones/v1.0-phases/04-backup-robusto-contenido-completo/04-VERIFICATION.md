---
phase: 4
verified: 2026-05-24T16:00:00Z
status: passed
score: 5/5 must-haves verified
requirements_complete: BACK-04,BACK-05,BACK-06,SEED-01,SEED-02
tests: 130/130 passing
re_verification: null
---

# Phase 4: Backup robusto + contenido completo — Verification Report

**Phase Goal:** El autor tiene la app cargada con los 6 PDFs reales (Avere, Género y Número, Verbos de Movimiento, Profesiones, Sustantivos Irregulares, Preposiciones) incluyendo ejercicios multi-categoría que ejercitan la cascada, y puede exportar/importar su progreso en JSON con un recordatorio cuando lleva >7 días sin backup.

**Verified:** 2026-05-24T16:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Phase Goal Achievement — 5 ROADMAP Success Criteria

| # | ROADMAP §Phase 4 Success Criterion | Status | Evidence |
|---|----|---|---|
| 1 | Pantalla "Backup" con botón "Exportar progreso" → descarga JSON con fecha en el nombre | VERIFIED | `src/screens/app.js:569 exportBackup()` (lines 569-606): construye `Blob` via `buildBackupWrapper(state)` + `URL.createObjectURL` + `a.download = \`italian-course-backup-${todayLocal()}.json\`` (line 577). `index.html:494` botón "Exportar progreso" bound `@click="exportBackup"`. `index.html:147` botón "Backup" en `.button-row-prominent` de home. UAT-A PASS author 2026-05-24. |
| 2 | Pantalla "Backup" con botón "Importar progreso" → acepta JSON, pide confirmación, reemplaza estado; importar el archivo recién exportado deja la app idéntica | VERIFIED | `src/screens/app.js:627 onFileSelected()` lee file, llama `parseBackupFile`, dispara `requestConfirm()` con cuerpo construido por `buildImportConfirmMessage` (líneas 694-704: incluye fecha + categorías + ejercicios + warning REEMPLAZARÁ). `commitImport()` (líneas 673-684) llama `resetSession()` + reemplaza `this.state` + `saveState`. `src/data/backup.js parseBackupFile` (línea 54) valida wrapper.kind, schemaVersion + ejecuta migration chain 1→2→3 idempotente. UAT-B PASS (round-trip idéntico). |
| 3 | Home banner discreto si >7 días desde último export (timestamp persistido junto al estado) | VERIFIED | `index.html:123` `<template x-if="shouldShowBackupBanner">` con texto reactivo. `src/screens/app.js:1489 shouldShowBackupBanner` getter: `daysSinceISO(lastBackupAt, today) > 7` con fallback a `firstUsedAt`. `src/screens/app.js:1514 backupBannerText`. `state.lastBackupAt` añadido en migrate2to3 (`src/data/storage.js:208 migrate2to3` líneas 208-241) + reseteado en exportBackup (línea 583). UAT-C PASS (banner aparece/desaparece reactivo, variantes correctas null fallback + fecha futura suprime). |
| 4 | 6 PDFs transcritos a `content/exercises/{...}.json` con ≥10 ejercicios cada uno, validados por schema, normalizados a NFC al cargar | VERIFIED | `content/categories.json`: 6 entradas en orden Avere → Preposiciones → Verbos Mov → Sustantivos Irreg → Género Núm → Profesiones. Counts: avere 23 (17 originales + 6 multi-cat), preposiciones 50, verbos-movimiento 37, sustantivos-irregulares 31, genero-numero 40, profesiones 51 — TODOS ≥ 10. `validateContent({categories, exercisesByFile})` sobre los 6 archivos a la vez retorna `ok:true`. `src/data/content-loader.js:42-46` aplica `normalizeNfcInPlace` antes de validar (D-09 / CONT-06). UAT-D PASS. |
| 5 | ≥1-2 ejercicios por PDF son multi-categoría — al fallar uno se observa cascada propagándose a varias categorías | VERIFIED | `avere.json` contiene 6 ejercicios multi-cat (avere-300..305) cubriendo TODOS los 5 cruces obligatorios: avere↔profesiones (300,301), avere↔sustantivos-irregulares (302), avere↔preposiciones (303), avere↔genero-numero (304), avere↔verbos-movimiento (305). `scripts/assert-multi-cat-cross.mjs` los 5 cruces exit 0. `tests/domain.test.js:222` describe block "multi-cat real cascade — Phase 4 SEED-02 integration" con 2 tests verdes que cargan avere.json real y assertean cascada D-54 sobre `categoryIds[]`. UAT-E PASS (cascada inmediata visible en resumen). |

**Score: 5/5 ROADMAP success criteria VERIFIED**

---

## Must-Haves Verification (cross-cut from 04-01..04-04 PLAN frontmatter)

### Backup runtime (Plan 04-01)

| Truth | Status | Evidence |
|---|---|---|
| El autor abre la pantalla Backup, exporta y obtiene archivo `italian-course-backup-YYYY-MM-DD.json` | VERIFIED | `src/screens/app.js:577` `a.download = \`italian-course-backup-${todayLocal()}.json\``. Triggered by `@click="exportBackup"` on line 494 of `index.html`. UAT-A author confirmation. |
| El autor selecciona el archivo, confirma inline con fecha/categorías/ejercicios, Continuar reemplaza estado idéntico al exportado | VERIFIED | `buildImportConfirmMessage(summary)` (`src/screens/app.js:694`) construye texto con fecha localizada + `summary.categories` + `summary.exercises` + warning REEMPLAZARÁ. `commitImport()` reemplaza state vía `saveState`. UAT-B author confirmation. |
| Al cumplirse >7 días aparece banner ámbar con "Han pasado N días desde tu último backup" + botón "Ir a Backup" | VERIFIED | `index.html:123-127` template + botón. `getter shouldShowBackupBanner` (`app.js:1489`) usa `daysSinceISO(...) > 7`. `getter backupBannerText` (`app.js:1514`) renderiza texto reactivo. UAT-C author confirmation. |
| Tras export exitoso el banner desaparece automáticamente sin recargar (reactividad Alpine sobre `state.lastBackupAt`) | VERIFIED | `exportBackup` (`app.js:583`) hace `this.state = { ...this.state, lastBackupAt: new Date().toISOString() }` — spread immutable que dispara recompute del getter Alpine (NO mutación profunda). UAT-A→banner desaparece. |
| Migration v2→v3 idempotente, no destruye exerciseStats/categoryProgress/dailyLog/inFlightTest | VERIFIED | `src/data/storage.js:208 migrate2to3(v2)` con type-guard por campo: `lastBackupAt: typeof v2.lastBackupAt === 'string' ? v2.lastBackupAt : null` (idempotente). `tests/backup.test.js` tests 1-5 cubren idempotencia + preservación. 21 tests verdes. |
| Primer saveState tras sesión setea `state.firstUsedAt` ISO actual; en sesiones siguientes no se sobreescribe | VERIFIED | Guard inline aplicado en 4 call-sites: `app.js:444` (persistInFlightTest spread), `app.js:795` (applyResultToSession rama D-54), `app.js:1009` (applyResultToSession match incorrect), `app.js:1313` (completeSession). Patrón `newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString()`. Cada call-site comentario "Phase 4 D-78". |
| Importar archivo `kind != 'italian-course-backup'` o sin `state` o con `schemaVersion > 3` → mensaje rojo en español, sin throw, sin crash | VERIFIED | `src/data/backup.js parseBackupFile` (líneas 54-122) implementa 7 guards secuenciales con mensajes literales del UI-SPEC en español. `backup.test.js` 6 reject-path tests verdes. UAT-B bonus exploit-proof: archivo ajeno produce mensaje rojo sin crash. |

### Contenido (Planes 04-02 + 04-03 + 04-04)

| Truth | Status | Evidence |
|---|---|---|
| `content/categories.json` 6 entradas en orden Avere→Preposiciones→Verbos-mov→Sustantivos-irreg→Género-núm→Profesiones | VERIFIED | `content/categories.json` 6 entradas con `order` 1..6 sin gaps. Cada `id` cumple `^[a-z0-9][a-z0-9-]*$`. |
| `scripts/validate-content-fixture.mjs` invoca `validateContent({categories, exercisesByFile})` con firma REAL (B-4 fix) | VERIFIED | Helper presente y ejecutado 6× (uno por categoría) — todos exit 0. Reusable por planes 04-02/04-03/04-04. |
| preposiciones.json contiene ≥10 ejercicios validados | VERIFIED (50) | 50 ejercicios multi-choice, schema valid. Cobertura PDF completa (8 simples + 30 articolate + casos + 2 fuera-de-PDF aprobados por autor). |
| verbos-movimiento.json contiene ≥10 ejercicios validados | VERIFIED (37) | 37 ejercicios (34 multi-choice + 3 word-buttons), schema valid. |
| sustantivos-irregulares.json contiene ≥10 ejercicios validados (mezcla post-design-rule) | VERIFIED (31) | 31 ejercicios: 17 multi-choice + 14 match. DESIGN RULE 'match-if-not-trivial-by-root' aplicada (5 invariables convertidas a multi-choice via patch 9d21c88). |
| genero-numero.json contiene ≥10 ejercicios validados | VERIFIED (40) | 40 ejercicios mezcla (16 multi-choice + 24 match). D-66 duplicados en columna derecha aplicados. |
| profesiones.json contiene ≥10 ejercicios validados (mezcla 3 tipos) | VERIFIED (51) | 51 ejercicios: 43 multi-choice + 5 word-buttons + 3 match. Meta-rule -ista invariable + 3rd match profesión↔acción incluidos. |
| Las 6 categorías están en home tras este plan; el autor puede lanzar Repaso de las 6 sin banner CONT-05 | VERIFIED | UAT-D author confirmation: 6 categorías visibles con ≥10 ejercicios cada una, NO banner CONT-05. |
| El autor revisó pedagógicamente cada categoría ANTES del commit (D-85) | VERIFIED | 5 checkpoint:human-verify executions (Plans 04-02 Tasks 2/3 + Plan 04-03 Tasks 1/2/3) + 1 design-rule UAT patch (9d21c88) — todos approved por el autor. Plan 04-04 Task 1b approved multi-cat. |
| El tipo `match` ejercita la regla D-66 en al menos un ejercicio | VERIFIED | genero-numero.json incluye match sustantivo↔artículo con duplicados textuales (varios sustantivos comparten `la`/`il`). |

### Multi-cat + cascada (Plan 04-04)

| Truth | Status | Evidence |
|---|---|---|
| avere.json contiene los 17 originales INTACTOS (D-88) | VERIFIED | `node scripts/assert-avere-prefix-unchanged.mjs` exit 0. IDs verified: avere-001..012 + avere-100..101 + avere-200..202 idénticos al snapshot pre-edit. |
| ≥6 ejercicios multi-cat avere-3XX que cruzan Avere con las 5 categorías nuevas | VERIFIED | 6 ejercicios avere-300..305. Distribución: profesiones×2 (300,301), sustantivos-irregulares (302), preposiciones (303), genero-numero (304), verbos-movimiento (305). Cobertura completa de los 5 cruces obligatorios. |
| Cada cruce obligatorio (5 categorías × 1 cruce mínimo) verificable via `scripts/assert-multi-cat-cross.mjs` (W-7 fix) | VERIFIED | 5 invocaciones exit 0: avere↔preposiciones (avere-303), avere↔verbos-movimiento (avere-305), avere↔sustantivos-irregulares (avere-302), avere↔genero-numero (avere-304), avere↔profesiones (avere-300, avere-301). |
| El autor revisó las propuestas multi-cat ANTES del commit (W-3 fix) | VERIFIED | Task 1b checkpoint:human-verify, autor approved sin pedir ediciones (commit 2f5c267 post-approval). |
| Smoke test integrado carga avere.json real y assertea cascada D-54 sobre 2+ categorías | VERIFIED | `tests/domain.test.js:222-323` describe "multi-cat real cascade — Phase 4 SEED-02 integration" con 2 tests: (1) `applyImmediateFailure` sobre primer multi-cat encontrado dinámicamente → cascada sobre `categoryIds[]` (status='no-hecha', streakDays=0, clearedExerciseIds=[]); (2) `validateContent` roundtrip post-extensión. 2/2 verdes. |
| Al fallar un multi-cat real, cascada D-54 INMEDIATA resetea las 2+ categorías simultáneamente | VERIFIED | UAT-E PASS author: fallo de multi-cat en sesión real propaga cascada visible en DevTools localStorage + resumen final con transición hecha→no-hecha de las N categorías afectadas. |
| Todas las invocaciones de schema validation usan el helper único + smoke checks complejos usan helper scripts (B-2/B-4) | VERIFIED | 4 helper scripts en `scripts/`: validate-content-fixture.mjs (B-4), snapshot-avere-prefix.mjs (W-4), assert-avere-prefix-unchanged.mjs (W-4), assert-multi-cat-cross.mjs (W-7). Cero `node -e` con apóstrofes anidados en código fuente. |

---

## Required Artifacts (Three-Level Verification)

| Artifact | Exists | Substantive | Wired | Data Flows | Status |
|---|---|---|---|---|---|
| `src/data/backup.js` | YES | YES (5512 bytes, parseBackupFile + buildBackupWrapper) | YES (imported in `src/screens/app.js`) | YES (data flows from file→parseBackupFile→state) | VERIFIED |
| `src/data/storage.js` | YES (MODIFIED) | YES (CURRENT_SCHEMA_VERSION=3, migrate2to3 + hydrateV3 exports nuevos) | YES (importado por app.js + main.js) | YES | VERIFIED |
| `src/domain/dates.js` | YES (MODIFIED) | YES (daysSinceISO export añadido, DST-safe via parseIsoLocalNoon) | YES (importado por app.js) | YES | VERIFIED |
| `src/screens/app.js` | YES (MODIFIED) | YES (handlers exportBackup, onFileSelected, commitImport, buildImportConfirmMessage + 3 getters + sub-estados + firstUsedAt plumbing 4 sitios) | YES | YES (state.lastBackupAt/firstUsedAt reactivos vía spread immutable) | VERIFIED |
| `index.html` | YES (MODIFIED) | YES (banner template, 3er botón "Backup", template `currentScreen='backup'`, file input oculto x-ref) | YES | YES (`x-text` bindings sobre `backupBannerText`/`backupStatusLine`/`backupLastMessage?.text`) | VERIFIED |
| `styles.css` | YES (MODIFIED) | YES (.backup-banner, .backup-message-success/-error, .confirm-inline #confirm-message white-space:pre-line) | YES | n/a (CSS) | VERIFIED |
| `content/categories.json` | YES (MODIFIED) | YES (6 categorías, slugs válidos, order 1..6 sin gaps) | YES (cargado por content-loader) | YES | VERIFIED |
| `content/exercises/avere.json` | YES (MODIFIED, APPEND-ONLY) | YES (23 ejercicios: 17 originales D-88 INTACTOS + 6 multi-cat avere-300..305) | YES | YES | VERIFIED |
| `content/exercises/preposiciones.json` | YES (NEW) | YES (50 ejercicios multi-choice) | YES | YES | VERIFIED |
| `content/exercises/verbos-movimiento.json` | YES (NEW) | YES (37 ejercicios mezcla mc+wb) | YES | YES | VERIFIED |
| `content/exercises/sustantivos-irregulares.json` | YES (NEW) | YES (31 ejercicios post-design-rule mezcla mc+match) | YES | YES | VERIFIED |
| `content/exercises/genero-numero.json` | YES (NEW) | YES (40 ejercicios mezcla mc+match D-66) | YES | YES | VERIFIED |
| `content/exercises/profesiones.json` | YES (NEW) | YES (51 ejercicios mezcla 3 tipos + meta-rule -ista) | YES | YES | VERIFIED |
| `scripts/validate-content-fixture.mjs` | YES (NEW) | YES (helper único firma REAL B-4) | YES (invocado 6×) | n/a | VERIFIED |
| `scripts/snapshot-avere-prefix.mjs` | YES (NEW) | YES (captura primeros 17 ejercicios D-88) | YES (Plan 04-04 Task 1a) | n/a | VERIFIED |
| `scripts/assert-avere-prefix-unchanged.mjs` | YES (NEW) | YES (assert.deepStrictEqual D-88 W-4 fix) | YES | n/a | VERIFIED |
| `scripts/assert-multi-cat-cross.mjs` | YES (NEW) | YES (CLI <slug1> <slug2> programmatic W-7 fix) | YES (invocado 5×) | n/a | VERIFIED |
| `tests/backup.test.js` | YES (NEW) | YES (21 tests organizados en 5 describe blocks) | YES (test runner) | n/a | VERIFIED |
| `tests/domain.test.js` | YES (MODIFIED) | YES (+2 tests "multi-cat real cascade — Phase 4 SEED-02 integration") | YES | n/a | VERIFIED |
| `tests/data-storage.test.js` | YES (MODIFIED) | YES (+2 tests para v3 chain) | YES | n/a | VERIFIED |
| `.gitignore` | YES (NEW) | YES (entrada `scripts/.avere-prefix-snapshot.json`) | YES | n/a | VERIFIED |

---

## Key Link Verification (Wiring)

| From | To | Via | Status |
|---|---|---|---|
| `src/screens/app.js exportBackup` | `src/data/backup.js buildBackupWrapper` + `URL.createObjectURL` + `state.lastBackupAt` + `saveState` | import + Blob/URL/createElement + spread immutable | WIRED — verified at line 575 (`buildBackupWrapper`), 578 (`createObjectURL`), 583 (`lastBackupAt` reset), 591 (`saveState`) |
| `src/screens/app.js onFileSelected` | `src/data/backup.js parseBackupFile` via `file.text()` → `requestConfirm` → `commitImport` → `saveState` | await file.text() + parseBackupFile + requestConfirm | WIRED — lines 631, 644, 655-660, 677 |
| `src/screens/app.js shouldShowBackupBanner getter` | `src/domain/dates.js daysSinceISO` + `state.lastBackupAt`/`state.firstUsedAt` | import daysSinceISO + this.state access | WIRED — lines 1492-1499 |
| `src/data/storage.js migrate dispatcher` | `migrate1to2` → `migrate2to3` → `hydrateV3` chain | if-chain over schemaVersion | WIRED — lines 129-131 |
| `src/screens/app.js` 4 call-sites firstUsedAt | guard inline `?? new Date().toISOString()` pre-saveState | inline guard | WIRED — lines 444, 588, 795, 1009, 1313 (5 sitios = 4 saveState paths + exportBackup primer-export) |
| `index.html` banner template | `shouldShowBackupBanner` getter + `backupBannerText` getter | Alpine `<template x-if>` + `x-text` | WIRED — lines 123-127 |
| `index.html` template `currentScreen='backup'` | `backupStatusLine` + `exportBackup` + `$refs.backupFileInput` + `onFileSelected` + `backupLastMessage` | x-text + @click + @change + :class + x-show | WIRED — lines 487-509 |
| `tests/domain.test.js` multi-cat smoke | `content/exercises/avere.json` + `applyImmediateFailure` + `validateContent` | readFileSync + JSON.parse + assert.deepEqual | WIRED — lines 222-322 |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| Full test suite passes | `node --test tests/*.test.js` | tests 130, pass 130, fail 0 | PASS |
| Backup tests pass | `node --test tests/backup.test.js` | tests 21, pass 21 | PASS |
| Domain tests pass (includes multi-cat smoke) | `node --test tests/domain.test.js` | tests 14, pass 14 | PASS |
| All 6 content files schema-valid via helper | `node scripts/validate-content-fixture.mjs <slug> <path>` ×6 | All 6 exit 0 | PASS |
| All 6 files together pass validateContent | Inline programmatic invocation with full `{categories, exercisesByFile}` | result.ok=true, errors=[] | PASS |
| 5 obligatory multi-cat crosses present | `node scripts/assert-multi-cat-cross.mjs avere <slug>` ×5 | All 5 exit 0; 6 cruces totales | PASS |
| D-88 APPEND-ONLY invariant | `node scripts/assert-avere-prefix-unchanged.mjs` | exit 0, 17 IDs verified | PASS |
| Layer purity D-02 (backup.js + dates.js) | `grep -E 'localStorage\|document\.\|window\.' src/data/backup.js src/domain/dates.js` | exit 1 (no matches) | PASS |
| Syntax check key sources | `node --check` on backup.js, storage.js, dates.js, app.js | All exit 0 | PASS |
| No curly apostrophes in content | `grep -P "[\x{2019}]" content/exercises/*.json` | exit 1 (no matches) | PASS |
| NFC normalization on content load | `grep -nE "normalize|NFC" src/data/content-loader.js` | 6 matches; `normalizeNfcInPlace` invoked line 44-46 | PASS |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| BACK-04 | 04-01 (runtime) + 04-04 (UAT) | Pantalla "Backup" con botón "Exportar progreso" descarga JSON | SATISFIED | `exportBackup` handler + button + UAT-A PASS + REQUIREMENTS.md marked [x] |
| BACK-05 | 04-01 (runtime) + 04-04 (UAT) | Pantalla "Backup" con botón "Importar progreso" + confirmación + reemplazo | SATISFIED | `onFileSelected` + `commitImport` + `buildImportConfirmMessage` + UAT-B round-trip PASS |
| BACK-06 | 04-01 (runtime) + 04-04 (UAT) | Banner home recordando backup >7 días | SATISFIED | `shouldShowBackupBanner` getter + banner template + `daysSinceISO` + UAT-C reactivo PASS |
| SEED-01 | 04-02 + 04-03 + 04-04 | 6 PDFs transcritos ≥10 ejercicios cada uno, schema-validados, NFC | SATISFIED | 6/6 categorías con contenido real (232 ejercicios totales) — counts: 23+50+37+31+40+51, validateContent OK, NFC on load. UAT-D PASS. |
| SEED-02 | 04-04 | Multi-cat exercises cascading D-54 visible in real session | SATISFIED | 6 cruces avere-300..305 cubren los 5 cruces obligatorios + smoke test cascada real (2 tests verdes) + UAT-E author PASS (cascada D-54 propaga inmediata sobre N categorías visible en resumen) |

**Coverage: 5/5 requirements SATISFIED**

No ORPHANED requirements (no IDs in REQUIREMENTS.md mapped to Phase 4 that weren't claimed in any plan).

---

## Anti-Patterns Scan

Scanned files modified in Phase 4 (per SUMMARY key-files):

- `src/data/backup.js`, `src/data/storage.js`, `src/domain/dates.js`, `src/screens/app.js`, `index.html`, `styles.css`
- `content/categories.json`, `content/exercises/*.json` (6 archivos)
- `scripts/*.mjs` (4 helpers)
- `tests/*.test.js` (3 archivos)

| File | Pattern | Severity | Impact |
|---|---|---|---|
| (none) | No debt markers (TBD/FIXME/XXX) found in Phase 4 modified files | INFO | No unreferenced debt |
| (none) | No empty-return stubs in handlers | INFO | All handlers have substantive bodies |
| (none) | No console.log-only handlers | INFO | All handlers do real work |
| (none) | No curly apostrophes U+2019 in content | INFO | RESEARCH §D landmine cleared |

Anti-pattern scan: **CLEAN** — no blockers, no warnings.

---

## Code Review Findings (Advisory — from 04-REVIEW.md)

The phase has a separate code review (`04-REVIEW.md`) that documents 1 HIGH + 4 MEDIUM + 5 LOW + 4 INFO advisory findings. Per the verification scope, **these findings are advisory and do NOT block phase completion**. Summarized for context:

- **HI-01:** `applyNewExerciseRegression` not re-run after `commitImport`. Benign in practice — `applyResultToSession` recomputes status on next session, and the resume-test guard defends downstream. UI may briefly show stale `hecha` status after importing a backup from an older content version. **Recommended for v2** (not v1 blocker).
- **ME-01..04, LO-01..05, IN-01..04:** Polish items, edge-case handling, test coverage extensions. None affect the 5 ROADMAP success criteria or the 5 requirements. Documented for future iterations.

These findings are tracked in `04-REVIEW.md` and do not contradict the goal-backward verification result.

---

## Notable Findings

1. **All 5 ROADMAP success criteria verifiable structurally in the codebase**, not only by UAT claims. The UAT INTEGRAL 5/5 PASS is reinforced by:
   - 130 automated tests passing (including 2 new multi-cat smoke tests that load real `avere.json` and assert cascade on `categoryIds[]`).
   - 4 helper scripts mechanizing W-4/W-7/B-2/B-4 fixes (snapshot+assert vs git diff, JSON parsing vs grep, helper scripts vs `node -e` with nested apostrophes, real `validateContent` signature).
   - `validateContent({categories, exercisesByFile})` over all 6 files together returns `ok:true`.
   - D-88 invariant verifiable on demand: snapshot+assert exit 0.
   - Layer purity D-02 verifiable by grep: zero `localStorage|document.|window.` matches in `src/data/backup.js` and `src/domain/dates.js`.

2. **Content scope expanded substantively** beyond the ≥10 minimum: 232 exercises total (avere 23, preposiciones 50, verbos-movimiento 37, sustantivos-irregulares 31, genero-numero 40, profesiones 51) — author-driven "cobertura PDF máxima" directive captured as an established pattern.

3. **DESIGN RULE 'match-if-not-trivial-by-root'** captured during 04-03 UAT and applied retroactively + universally to 04-04 multi-cat (all 6 crosses are multi-choice, not match). Pattern now normative for future content.

4. **D-88 APPEND-ONLY invariant** mechanized via `scripts/snapshot-avere-prefix.mjs` + `scripts/assert-avere-prefix-unchanged.mjs` — robust replacement for `git diff` that requires staging setup. Reusable for any future content file with no-modification invariant.

5. **Schema dispatch table closed in Phase 3** carried Phase 4 content with zero validator changes — no extensions needed for multi-cat (`categoryIds[].length >= 2` already supported).

6. **Author-checkpoint pattern validated 6× without bugs** — plans 04-02 Tasks 2/3 + 04-03 Tasks 1/2/3 + 04-04 Task 1b. The "PDF → JSON → checkpoint humano → commit" workflow is now an established phase-pattern.

---

## Status Verdict

**Status: passed**

All 5 ROADMAP §Phase 4 success criteria verified end-to-end in the codebase. All 5 requirements (BACK-04, BACK-05, BACK-06, SEED-01, SEED-02) satisfied with concrete evidence beyond SUMMARY claims:

- **Files exist and are substantive** — every claimed artifact verified by inspection.
- **Wiring complete** — imports, handlers, getters, key links traced from UI binding back to data layer.
- **Data flows real** — `avere.json` multi-cat exercises exist with correct `categoryIds[]`; `validateContent` passes; multi-cat smoke test runs cascade D-54 over real categoryIds; tests 130/130 green.
- **UAT corroborated by automated evidence** — UAT INTEGRAL 5/5 PASS is reinforced (not replaced) by 130 passing tests, 5 helper-script verifications (D-88, multi-cat ×5, D-02 ×2), and schema validation across all 6 content files.

Phase 4 goal achieved. Ready to proceed to milestone v1.0 close.

---

*Verified: 2026-05-24T16:00:00Z*
*Verifier: Claude (gsd-verifier)*
*Mode: goal-backward, initial verification*
