---
phase: 16-motor-de-examen-por-slots
verified: 2026-06-03T10:30:00Z
status: human_needed
score: 5/5 automated truths verified
overrides_applied: 0
human_verification:
  - test: "Arrancar el server local y verificar las 9 categorías visibles con recuento Ejercicios idéntico al pre-fase"
    expected: "Home muestra 9 categorías; columna Ejercicios con el mismo número que antes de la fase (slots = ejercicios legacy)"
    why_human: "Requiere navegador con localStorage activo bajo http://localhost — no ejecutable headlessly"
  - test: "Repaso 20 sobre 1-2 categorías: completar sin fallar → categoría marcada hecha"
    expected: "El indicador Ejercicio X / N cuenta slots; la categoría se marca hecha al pasar todos los slots"
    why_human: "Comportamiento de UI reactivo (Alpine x-for + estado) no verificable con grep"
  - test: "Fallar un ejercicio a propósito → cascada D-54 inmediata (categorías del slot desmar cadas) + explicación pedagógica igual que antes"
    expected: "Las categoryIds del slot se desmarcan al instante; la explicación de la variante exacta aparece en el feedback"
    why_human: "Requiere interacción real con el motor de cascada D-54 en el navegador"
  - test: "Test completo: avanzar unos ejercicios, F5, Reanudar → reanuda en el mismo punto con la misma variante"
    expected: "El ejercicio mostrado tras Reanudar es el mismo slot con la misma variante que se estaba mostrando antes de recargar"
    why_human: "Requiere persistencia real de localStorage + render slot-aware verificado visualmente"
  - test: "Review de errores del summary muestra el prompt/respuesta correcta/explicación del ejercicio exacto fallado"
    expected: "summaryVariantSurface(result) resuelve la variante concreta (no variante 0 por defecto si se falló otra)"
    why_human: "Requiere sesión real con fallo y comparación visual de la variante mostrada vs registrada"
  - test: "DevTools → Application → Local Storage: schemaVersion 6 y progreso previo NO reseteado; sin banner de validación al arrancar"
    expected: "CURRENT_SCHEMA_VERSION = 6; el progreso pre-fase (rachas, hecha/dominada) se preserva"
    why_human: "Requiere inspección visual de localStorage y ausencia de banner de validación en el navegador"
---

# Phase 16: Motor de examen por slots — Verification Report

**Phase Goal:** El motor de re-verificación recorre slots en vez de ejercicios sueltos — elige 1 variante aleatoria por slot, redefine "categoría hecha" como pasar los N slots, y mantiene la cascada D-54, la racha de 21 días y los 3 modos de sesión intactos. Engine exercisable end-to-end con slots de 1 variante antes de la rework de contenido.

**Verified:** 2026-06-03T10:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Una sesión presenta como máximo 1 variante por slot — nunca dos variantes del mismo slot en la misma sesión | VERIFIED | `pickVariantIndex(slot, rng)` en `session.js:231-234` selecciona 1 variante por slot; `buildSession`/`buildFullTest` devuelven `variantIndices` paralelo (lines 165, 201); EXAM-01 test confirms no duplicate exerciseIds (`tests/domain-session.test.js:233-251`) |
| SC-2 | Categoría marcada "hecha" al pasar sin fallar 1 variante de cada uno de sus N slots; recuento "Ejercicios" del home muestra slots | VERIFIED (partial — UI requires human) | `progress.js` not modified (slot id == exercise id — D-16-07); `index.html:164` retains "Ejercicios" copy unchanged; the 3 launch sites now use `Object.values(this.content.slotById)` (app.js:428, 818, 944); browser confirmation required |
| SC-3 | Fallar dispara cascada D-54 con exactamente 2 call-sites de `applyImmediateFailure` | VERIFIED | `grep -v '^[[:space:]]*\*' src/screens/app.js \| grep -v '^[[:space:]]*//' \| grep -c "applyImmediateFailure("` = **2** (app.js:1475 + app.js:1700); `applyResultToSession` reused (app.js:1492); no new call-sites added |
| SC-4 | Al re-hacer una categoría, la selección aleatoria se reejecuta y pueden tocar variantes distintas | VERIFIED | `restartRepaso` (app.js:944) calls `Object.values(this.content.slotById)` + `buildSession`/`buildFullTest` freshly; EXAM-04 test (`tests/domain-session.test.js:264-283`) sweeps 60 seeds over a 5-variant slot and asserts `observed.size >= 2` |
| SC-5 | Racha 21d + hecha→dominada + Repaso 20 / Test completo / Modo Examen integran el muestreo por slot | VERIFIED (partial — UI requires human) | `progress.js` unmodified (git log shows last commit was Phase 2); all 3 modes feed `Object.values(this.content.slotById)` to samplers (grep confirmed = 3); browser end-to-end confirmation required |

**Score:** 5/5 truths verified at code level (SC-2 and SC-5 partially require human browser confirmation)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/domain/session.js` | `pickVariantIndex` + `variantIndices` in `buildSession`/`buildFullTest` returns | VERIFIED | `pickVariantIndex` at line 231; `variantIndices` in return at lines 165, 201; JSDoc updated; 0 new imports from `../data/*` or `../screens/*` (layer purity intact) |
| `tests/domain-session.test.js` | Seeded tests for slot sampling + variant selection | VERIFIED | New `describe('domain/session — Phase 16 muestreo por slot (EXAM-01/04/06)')` at line 196 with 6 deterministic seeded tests; `variantIndices` appears 12 times |
| `src/screens/app.js` | `sessionCurrentExercise` slot-aware + `variantIndices` threaded through 3 launch sites + advance + resume + `inFlightTest` + `sessionResults` | VERIFIED | `sessionCurrentExercise` getter at line 2280-2298 resolves `content.slotById?.[id].variants[vIdx]` with synthetic payload re-wrap; `sessionVariantIndices` field declared at line 115; 3 launch sites confirmed; `persistInFlightTest` writes `variantIndices` at line 1079; `resumeInFlightTest` restores or falls back to `map(() => 0)` at line 1122-1124; `sessionResults.push` records `variantIndex` at line 1502 |
| `index.html` | summary-errors resolves the exact failed variant via `summaryVariantSurface(result)` | VERIFIED | Lines 743-800: `content.slotById[r.exerciseId]` used as filter guard; all 3 exercise types resolve via `summaryVariantSurface(result).payload.*`; old `content.exerciseById[...].payload` removed from this path |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `session.js` | `slot.variants` | `pickVariantIndex(slot, rng)` | WIRED | `slot.variants` accessed at line 232; defensive `Array.isArray` guard; `n <= 1 ? 0 : Math.floor(rng() * n)` |
| `app.js sessionCurrentExercise` | `content.slotById[id].variants[variantIndex]` | getter slot-aware with synthetic `.payload` | WIRED | `const slot = this.content.slotById?.[id]` at line 2287; surface resolved at line 2291; re-wrapped with `payload: { ...surface, explanation: slot.explanation }` at line 2296 |
| `app.js applyResultToSession` | `applyImmediateFailure(slotId)` | single call-site D-54 reused | WIRED | 2 real call-sites confirmed; `applyResultToSession` dispatches by `ex.id` (slot id); no new call-sites |
| `app.js persistInFlightTest` | `state.inFlightTest.variantIndices` | parallel array persisted | WIRED | `variantIndices: [...this.sessionVariantIndices]` at line 1079; `resumeInFlightTest` restores at line 1122 with legacy fallback `ift.exerciseIds.map(() => 0)` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `app.js sessionCurrentExercise` | `slot.variants[vIdx]` | `content.slotById` populated from `loadContent()` → `content-loader.js` `normalizeExerciseToSlot` | Yes — slotById is a real derived map from loaded JSON content | FLOWING |
| `app.js resumeInFlightTest` | `this.sessionVariantIndices` | `ift.variantIndices` from `state.inFlightTest` (localStorage) or fallback `map(() => 0)` | Yes — restores persisted data or defaults to 0 for legacy blobs | FLOWING |
| `index.html summaryVariantSurface` | `slot.variants[result.variantIndex ?? 0]` | `content.slotById` + `sessionResults` records (which include `variantIndex`) | Yes — reads real persisted variantIndex from sessionResults | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full test suite passes | `node --test tests/*.test.js` | 327/327 pass, 0 fail, 64 suites, 105ms | PASS |
| `pickVariantIndex` exists as pure helper | `grep -n "function pickVariantIndex" src/domain/session.js` | line 231, exactly 1 match | PASS |
| `variantIndices` in both sampler returns | `grep -c "variantIndices" src/domain/session.js` | 9 occurrences (includes JSDoc + return sites) | PASS |
| 3 launch sites use `slotById` | `grep -c "Object.values(this.content.slotById)" src/screens/app.js` | **3** | PASS |
| `applyImmediateFailure` call-sites = 2 | `grep -v '^[[:space:]]*\*' src/screens/app.js \| grep -v '^[[:space:]]*//' \| grep -c "applyImmediateFailure("` | **2** | PASS |
| `schemaVersion` stays at 6 | `grep -n "CURRENT_SCHEMA_VERSION" src/data/storage.js` | line 35: `= 6`; no `= 7` anywhere | PASS |
| Legacy `inFlightTest` fallback to index 0 | `grep -n "map.*=> 0" src/screens/app.js` | line 1124: `ift.exerciseIds.map(() => 0)` | PASS |
| `summaryVariantSurface` wired in `index.html` | `grep -c "summaryVariantSurface" index.html` | 9 occurrences across all 3 exercise-type blocks | PASS |

---

### Probe Execution

Step 7c: SKIPPED — no `probe-*.sh` scripts found in `scripts/*/tests/` and phase is not a migration/tooling phase. The full `node --test` suite serves as the executable verification (327/327 pass).

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXAM-01 | 16-01, 16-02 | 1 variante per slot, never 2 variants of same slot in same session | SATISFIED | `pickVariantIndex` + `variantIndices` parallel array; EXAM-01 dedup test passes; `slotById` as unit |
| EXAM-02 | 16-02 | "Categoría hecha" = passing all N slots; "Ejercicios" count = slots | SATISFIED (code) / HUMAN (browser) | `progress.js` unmodified (slot id == exercise id); "Ejercicios" copy intact in `index.html:164`; browser count confirmation pending |
| EXAM-03 | 16-02 | D-54 cascade reuses `applyResultToSession`; exactly 2 `applyImmediateFailure` call-sites | SATISFIED | grep-verified = 2 real call-sites; `applyResultToSession` is the single cascade entry point |
| EXAM-04 | 16-01, 16-02 | Re-doing category re-executes sampler → can produce different variants | SATISFIED | EXAM-04 test asserts `>= 2` distinct variantIndices across 60 seeds; `restartRepaso` re-calls `buildSession`/`buildFullTest` |
| EXAM-05 | 16-02 | 21-day streak + hecha→dominada operate on slot-based "hecha" unchanged | SATISFIED (code) / HUMAN (browser) | `progress.js` not modified in phase 16; streak/dominada mechanics untouched |
| EXAM-06 | 16-01, 16-02 | All 3 session modes (Repaso 20 / Test completo / Modo Examen) integrate slot sampling | SATISFIED (code) / HUMAN (browser) | All 3 launch sites (`_launchExamen:428`, `startSession:818`, `restartRepaso:944`) use `Object.values(this.content.slotById)` |

All 6 EXAM requirements are code-verified. EXAM-02, EXAM-05, EXAM-06 require browser confirmation for end-to-end UI behavior.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/screens/app.js` | 725 | `placeholders` word | Info | Pre-existing Phase 3 comment about match sub-state initialization — not a debt marker from Phase 16; no functional impact |

No `TBD`, `FIXME`, or `XXX` markers found in any Phase 16 modified files. No blocker anti-patterns.

---

### Human Verification Required

The automated verification (code analysis + 327/327 tests) is complete and all truths pass. The following items from Plan 16-02 Task 3 (checkpoint human-verify, gate=blocking) were carried forward as manual UAT per the SUMMARY notes — they were not executed headlessly during the autonomous chain. The SUMMARY marked these as UAT manual a cargo del usuario.

#### 1. Home screen: 9 categories + Ejercicios count

**Test:** Start local server (`npx serve` or VS Code Live Server); open `http://localhost:PORT` (NOT `file://` — localStorage fails under file://)
**Expected:** 9 categories visible; "Ejercicios" column shows the SAME number as before this phase (slot id == exercise id for legacy 1-variant slots)
**Why human:** Requires a live browser with localStorage; Alpine reactive rendering

#### 2. Repaso 20 session: "hecha" marks on slot completion

**Test:** Start a Repaso 20 session on 1-2 categories; complete without failing
**Expected:** Category marks "hecha"; the "Ejercicio X / N" indicator counts slots
**Why human:** Alpine reactive state + progress.js update observable only in live browser

#### 3. D-54 fail cascade + explanation

**Test:** Intentionally fail an exercise during a session
**Expected:** Immediate D-54 cascade (category unmarked at once); pedagogical explanation appears as before
**Why human:** Cascade behavior requires real user interaction; explanation display is visual

#### 4. Test completo resume — same variant

**Test:** Start a Test completo, advance a few exercises, reload (F5), click Reanudar
**Expected:** Resumes at the same point with the same exercise (same variant — variantIndices persisted in inFlightTest)
**Why human:** Requires localStorage persistence + visual confirmation of same variant

#### 5. Summary error review — exact failed variant

**Test:** Complete a session with at least one failure; examine the "Errores cometidos" section in the summary
**Expected:** Shows the prompt/correct answer/explanation of the EXACT variant that was failed (not variant 0 by default if another variant was shown)
**Why human:** Requires real session with failure + comparison of shown vs recorded variant

#### 6. localStorage schemaVersion 6, no progress reset, no validation banner

**Test:** DevTools → Application → Local Storage: inspect `italian-course-state`
**Expected:** `schemaVersion: 6`; prior progress (streaks, hecha/dominada status) preserved; no validation error banner visible on page load
**Why human:** Requires visual inspection of DevTools localStorage + page load observation

---

### Gaps Summary

No gaps found. All code-level truths verified, all artifacts substantive and wired, all key links confirmed. The `human_needed` status reflects 6 browser-behavior UAT items carried forward from the blocking checkpoint in Plan 16-02 Task 3 — not failures in the code itself.

---

_Verified: 2026-06-03T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
