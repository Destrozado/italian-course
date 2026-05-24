---
phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
verified: 2026-05-24T05:57:38Z
status: passed
score: 15/15 must-haves verified
overrides_applied: 0
re_verification: false
---

# Phase 3: Variedad de ejercicios + ergonomía de teclado — Verification Report

**Phase Goal:** El autor puede practicar los tres tipos de ejercicio (multiple-choice, word-buttons, match) en una misma sesión y operar toda la práctica desde el teclado (1-4 / Enter / Space) sin tocar el ratón.
**Verified:** 2026-05-24T05:57:38Z
**Status:** PASSED
**Re-verification:** No — initial verification

---

## Step 0: Previous Verification

No prior VERIFICATION.md found for Phase 3. Proceeding as initial verification.

---

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Un ejercicio `word-buttons` muestra frase en español, botones con palabras italianas + distractoras, permite construir la traducción y validar; cascada y contadores funcionan igual que multiple-choice | VERIFIED | `src/exercise-types/word-buttons.js` (grade() puro, case-insensitive D-67); sub-template `x-if="...type === 'word-buttons'"` en `index.html` L275; `wordButtonsCheck()` invoca `applyResultToSession` — mismo flujo que multi-choice |
| 2 | Un ejercicio `match` muestra dos columnas, empareja click-izq → click-der; al completar todas las parejas se valida y aplica mismos efectos sobre estado/contadores | VERIFIED | `src/exercise-types/match.js` (grade() puro, retorno `{correct, pairIdx?}` D-66); sub-template `x-if="...type === 'match'"` en `index.html` L354; `matchPickRight` invoca `applyResultToSession(ex, !this.matchHadFailure)` al completar todas las parejas |
| 3 | Una sesión que mezcla los tres tipos corre de principio a fin sin saltos de UI ni fallos de grading; el resumen final agrega correctamente aciertos/fallos | VERIFIED | `avere.json` tiene 17 ejercicios (12 multi-choice + 2 word-buttons + 3 match); `registry` en `index.js` expone los 3 tipos; `initSubStateForExercise` limpia uniforme todos los sub-estados entre ejercicios; UAT 2026-05-24 PASS confirma sesión mixta sin errores |
| 4 | Teclas 1-4 seleccionan opciones multi-choice; Enter confirma/avanza tras fallo; Space alias de Enter; el autor completa sesión de 20 sin ratón (incluyendo word-buttons y match) | VERIFIED | `handleSessionKey()` en `src/screens/app.js` cubre: Ctrl/Meta/Alt skip, Enter/Space (D-71), Backspace (D-69), 1-9 multi-choice (D-68) + word-buttons (D-69) + match (D-70: dígitos izq + letras a-i der); `@keydown.window="handleSessionKey($event)"` en `index.html` L: `<article>`; UAT 2026-05-24 PASS confirma sin ratón |

**ROADMAP Score: 4/4 success criteria verified**

---

### Must-Have Truths (Plans Frontmatter — Plan 03-01)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | word-buttons en avere.json se valida sin errores en el banner #error-banner | VERIFIED | `avere-100` + `avere-101` presentes con payload D-64 válido; `validateWordButtonsPayload` en dispatch table acepta estos ejercicios; UAT paso 1 PASS |
| 2 | Lanzar Repaso produce ejercicio word-buttons con banco mostrando palabras + sufijo numérico ¹..⁹ (D-57, D-69) | VERIFIED | `bankWithKeys` getter retorna `{word, key}` con key=`String(idx+1)` para idx<9; `.kbd-hint` CSS renderiza sufijo; `initSubStateForExercise` llama `fisherYates(answer ∪ distractors)` para barajar banco |
| 3 | Click sobre palabra del banco la mueve al área respuesta; click en área respuesta la devuelve al banco (D-56) | VERIFIED | `wordButtonsAddWord(idx)` + `wordButtonsRemoveWord(idx)` implementados con inmutable array assignment; ambos wired en el sub-template HTML con `@click` |
| 4 | Pulsar 1..9 mueve palabra N-1 del banco al área; Backspace quita última (D-69) | VERIFIED | `handleSessionKey` rama Backspace: `wordButtonsRemoveWord(last)` con `preventDefault()`; rama dígitos word-buttons: `wordButtonsAddWord(idx)` si `idx < bank.length && idx < 9` |
| 5 | Botón Comprobar deshabilitado con área vacía; Enter/Enter con secuencia exacta → verde + auto-avance 600ms; cualquier otra → rojo + frase correcta + botón Siguiente (D-58, D-59) | VERIFIED | `wordButtonsCanCheck` getter = `wordButtonsAnswer.length > 0 && sessionFeedback === null`; `:disabled="!wordButtonsCanCheck"` en HTML; `wordButtonsCheck()` → `applyResultToSession` → feedback + setTimeout 600ms ó applyImmediateFailure |
| 6 | Al fallar word-buttons, `applyImmediateFailure` se ejecuta exactamente una vez | VERIFIED | `grep -c "applyImmediateFailure(this.state" src/screens/app.js` = 2 exactos (un call-site en `applyResultToSession`, uno en `matchPickRight` con guard). Para word-buttons: SOLO pasa por `applyResultToSession` |
| 7 | Grading word-buttons es case-insensitive (D-67) | VERIFIED | `word-buttons.js` L44-45: `actual[i].toLowerCase() !== expected[i].toLowerCase()`; cubierto por tests en `exercise-types.test.js` |
| 8 | Tras fallo, Enter/Space avanza; tras acierto, Enter/Space no hacen nada (D-71) | VERIFIED | `handleSessionKey` rama Enter/Space: `if (sessionFeedback === 'incorrect') → sessionAdvance()`; `if (ex.type === 'word-buttons' && feedback === null && canCheck) → wordButtonsCheck()`; tras acierto no hay branch que avance |
| 9 | Pulsar 1..4 en multi-choice selecciona opción N-1; teclas que excedan el número de opciones se ignoran (D-68) | VERIFIED | `handleSessionKey` rama dígitos multi-choice: `if (idx < ex.payload.options.length) sessionSelectOption(idx)` — cap natural |
| 10 | Cambiar `currentScreen` a 'home' no deja listeners huérfanos; `@keydown.window` cleanup automático (D-72) | VERIFIED | `<article @keydown.window="handleSessionKey($event)">` bajo outer `x-if="currentScreen === 'session' && sessionCurrentExercise"` — Alpine desmonta el listener al desmontar el elemento; UAT paso 5 PASS |
| 11 | Schema validator rechaza payload word-buttons malformado con mensaje específico en #error-banner | VERIFIED | `validateWordButtonsPayload` en `PAYLOAD_VALIDATORS` dispatch table; 11 negative test cases en `exercise-types.test.js`; UAT paso 10 PASS |
| 12 | Sesión solo multi-choice reproduce comportamiento Phase 2 UAT tras refactor de `sessionSelectOption` | VERIFIED | `sessionSelectOption` delega en `applyResultToSession`; 58 tests Phase 2 siguen verdes en suite de 105; W2 smoke confirmado por algebraic equivalence + grep single call-site |

**Plan 03-01 must-haves score: 12/12 verified**

---

### Must-Have Truths (Plans Frontmatter — Plan 03-02)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Nuevos ejercicios match en avere.json se validan sin errores | VERIFIED | `avere-200`, `avere-201`, `avere-202` con payload D-65; `validateMatchPayload` impl real (no stub) en dispatch table; UAT paso 1 PASS (no banner) |
| 2 | Lanzar Repaso puede mostrar ejercicio match: 2 columnas con sufijos numéricos (izq) + alfabéticos (der) (D-70) | VERIFIED | sub-template match con `.match-grid` (1fr 1fr) + `.match-col` × 2; sufijos `idx+1` (izq) + `letterFor(idx)` (der) via `.kbd-hint`; wired en HTML |
| 3 | Click sobre item izq lo marca visualmente (outline azul Pico); click en item der dispara validación (D-60) | VERIFIED | `:class="{'match-selected': matchSelectedLeftIdx === idx && !matchLeftIsConsumed(idx)}"` + `@click="matchSelectLeft(idx)"`; `matchPickRight(idx)` invoca `match.grade()` + actualiza `matchPairsConsumed` |
| 4 | Emparejamiento correcto: ambos quedan muted + no clickeables; incorrecto: parpadeo rojo 300ms + deshacer (D-60) | VERIFIED | `.match-consumed` clase CSS + `:disabled="matchRightIsConsumed(idx) \|\| sessionFeedback !== null"`; `flashMatchPair(leftIdx, rightIdx)` → `matchFlashIdx = {...}` + `setTimeout 300ms` → reset; `.match-flash { animation: match-flash-red 300ms ease-out 1 }` |
| 5 | Tras 2+ intentos erróneos en mismo match, localStorage se modifica EXACTAMENTE UNA VEZ (D-61 idempotencia) | VERIFIED | `if (!this.matchHadFailure) { applyImmediateFailure + saveState + matchHadFailure = true }`; test W3 verifica presencia textual del guard y count=2 call-sites; UAT paso 6 PASS |
| 6 | Tras primer intento erróneo en match, categoría Avere queda inmediatamente en `no-hecha` en localStorage | VERIFIED | `applyImmediateFailure` llamado síncronamente dentro del guard en `matchPickRight`; `saveState` invocado en el mismo guard; UAT paso 6 + 14 PASS |
| 7 | Match no se interrumpe tras fallo; usuario debe completar todas las parejas; al consumir la última con fallo previo → contabilizado fallado (D-63 forced last pair) | VERIFIED | `matchPickRight` invoca `applyResultToSession(ex, !this.matchHadFailure)` SOLO cuando `matchPairsConsumed.length === ex.payload.pairs.length`; no hay auto-completar |
| 8 | D-61 exploit-proof: cerrar pestaña tras primer fallo match → categoría sigue en `no-hecha` tras reabrir | VERIFIED | `applyImmediateFailure + saveState` ocurren en el primer parpadeo rojo, ANTES de que el usuario avance o cierre; UAT paso 14 PASS |
| 9 | Teclado match: dígito 1..9 selecciona item izq; letra a..i con izq ya seleccionado dispara validación; letra sin número previo ignorada; otro número antes de letra reemplaza selección (D-70) | VERIFIED | `handleSessionKey` rama letras: `if (matchSelectedLeftIdx === null) return;` guard; dígito 1-9 match: `matchSelectLeft(idx)` — reemplaza la selección previa por asignación directa; UAT paso 4 + 5 PASS |
| 10 | Enter/Space tras fallo en cualquier tipo avanza; en match tras consumir última pareja con fallos → auto-advance o Siguiente (D-71) | VERIFIED | `handleSessionKey` rama Enter/Space: `if (sessionFeedback === 'incorrect') → sessionAdvance()`; al completar match con `matchHadFailure=true`, `applyResultToSession(ex, false)` setea `sessionFeedback = 'incorrect'` y el botón Siguiente aparece |
| 11 | Grading match es case-insensitive (D-67) | VERIFIED | `match.js` L68: `pl.toLowerCase() === lwLower && pr.toLowerCase() === rwLower`; cubierto por test case en `exercise-types.test.js` |
| 12 | Columna derecha con duplicados textuales: cualquier 'ha' válido sirve para emparejar; grading consume por índice (D-66) | VERIFIED | `match.grade` usa `consumed = new Set(consumedPairIdx)` + búsqueda lineal sobre pairs no consumidos; `avere-202` tiene `["lui","ha"] + ["lei","ha"] + ["noi","abbiamo"]`; test D-66 con `consumedPairIdx:[0]` pasa |
| 13 | Sesión Repaso 20 sobre Avere mezcla 3 tipos de principio a fin sin errores; summary con delta correcto | VERIFIED | `registry` tiene 3 tipos; `initSubStateForExercise` cubre todos los tipos; UAT paso 3 + 9 PASS |
| 14 | Payload match malformado → banner #error-banner con file + exerciseId + reason legible en español | VERIFIED | `validateMatchPayload` impl real (no stub); 9 negative test cases; UAT paso 10 PASS |
| 15 | Listener @keydown.window desmontado limpiamente al cambiar `currentScreen` (D-72) | VERIFIED | `<article @keydown.window="handleSessionKey($event)">` bajo outer `x-if` — Alpine lifecycle desmonta automáticamente; UAT paso 5 PASS |

**Plan 03-02 must-haves score: 15/15 verified**

---

### Must-Have Truths (Plan 03-03 UAT Checkpoint)

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | El autor confirma que sesión de 20 ejercicios mezclando los 3 tipos se completa sin tocar el ratón | VERIFIED | UAT-03-03 veredict PASS 2026-05-24; paso 4 "Criterio 4 ROADMAP — sin ratón" cubierto |
| 2 | El autor confirma que tras fallo en cualquiera de los 3 tipos, recargar NO permite escapar la cascada (D-54/D-61 exploit-proof) | VERIFIED | UAT paso 13 (D-54 multi-choice) + paso 14 (D-61 match) PASS |
| 3 | Transiciones entre los 3 tipos en misma sesión son fluidas — sin saltos de UI, sin estados residuales | VERIFIED | UAT paso 3 + 7 PASS; `initSubStateForExercise` limpieza universal confirmada |
| 4 | Comportamiento de teclado predecible: 1-4 multi-choice; 1-9 word-buttons; 1-9 izq + a-i der match; Enter/Space tras fallo avanza; Backspace quita última | VERIFIED | UAT paso 4 PASS; `handleSessionKey` cubre las 18 teclas |
| 5 | Listener @keydown.window se desmonta limpio al cambiar `currentScreen`; foco queda en body (D-72) | VERIFIED | UAT paso 5 + 12 PASS |
| 6 | Summary final agrega correctamente aciertos/fallos por categoría tras sesión mixta | VERIFIED | UAT paso 3 + 9 PASS; `applySessionResult` unchanged from Phase 2 |

**Plan 03-03 must-haves score: 6/6 verified (UAT PASS 2026-05-24)**

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/exercise-types/word-buttons.js` | Handler word-buttons grade() puro (D-64, D-67, D-02) | VERIFIED | Exists, 49 lines, 0 imports (layer purity D-02), grade() case-insensitive |
| `src/exercise-types/match.js` | Handler match grade() puro (D-65, D-66, D-67, D-02) | VERIFIED | Exists, 74 lines, 0 imports (layer purity D-02), grade() case-insensitive, retorno enriched {correct, pairIdx?} |
| `src/exercise-types/index.js` | Registry con 3 entradas finales | VERIFIED | Contains `'multiple-choice': multipleChoice`, `'word-buttons': wordButtons`, `'match': match` |
| `src/data/schema-validator.js` | Dispatch table PAYLOAD_VALIDATORS + 3 impls reales (sin stubs) | VERIFIED | `PAYLOAD_VALIDATORS` present (4 occurrences), stub message `'aún no soportado'` absent, `validateWordButtonsPayload` + `validateMatchPayload` impl real confirmed |
| `src/screens/app.js` | applyResultToSession + initSubStateForExercise + handleSessionKey + match handlers + sub-estados | VERIFIED | All identifiers confirmed: `applyResultToSession`, `wordButtonsAddWord`, `wordButtonsRemoveWord`, `wordButtonsCheck`, `initSubStateForExercise`, `handleSessionKey`, `cancelMatchFlash`, `bankWithKeys`, `wordButtonsCanCheck`, `matchSelectLeft`, `matchPickRight`, `flashMatchPair`, `matchLeftIsConsumed`, `matchRightIsConsumed`, `letterFor` |
| `src/domain/session.js` | `export function fisherYates` reusable | VERIFIED | `export function fisherYates(arr, rng = Math.random)` present; 7 occurrences in file (def + usages in buildSession/buildFullTest/initSubStateForExercise) |
| `index.html` | Sub-templates type === 'word-buttons' + type === 'match' + @keydown.window + no x-html | VERIFIED | Both `<template x-if="sessionCurrentExercise.type === 'word-buttons'">` and `<template x-if="sessionCurrentExercise.type === 'match'">` present; `@keydown.window="handleSessionKey($event)"` on `<article>`; `x-html` count = 0 |
| `styles.css` | .wb-bank, .wb-answer, .wb-answer.incorrecta, .wb-correct-answer, .kbd-hint, .match-grid, .match-col, .match-selected, .match-consumed, .match-flash, @keyframes match-flash-red | VERIFIED | All CSS selectors confirmed present; `animation: match-flash-red 300ms ease-out 1` (1 iteration, WCAG §2.3.1 safe) |
| `tests/exercise-types.test.js` | 47 tests total (23 word-buttons from 03-01 + 24 match from 03-02) | VERIFIED | 47/47 passing, 0 skipped; includes W3 idempotencia describe + W5 smoke describe |
| `content/exercises/avere.json` | 17 exercises total: 12 multi-choice + 2 word-buttons + 3 match; avere-202 with duplicate 'ha' in right column | VERIFIED | `total: 17, word-buttons: 2, match: 3`; `with-dup: 1 ids: ['avere-202']` confirmed |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/screens/app.js handleSessionKey` | `registry['word-buttons'].grade` | `wordButtonsCheck -> applyResultToSession` | VERIFIED | `wordButtonsCheck()` calls `registry[ex.type].grade(ex, {tokens: wordButtonsAnswer})`; `applyResultToSession` wired |
| `src/screens/app.js applyResultToSession (rama !correct)` | `applyImmediateFailure` | import from `src/domain/progress.js` + saveState | VERIFIED | `grep -c "applyImmediateFailure(this.state" app.js` = 2; call-site #1 in `applyResultToSession` confirmed |
| `index.html <article @keydown.window>` | `handleSessionKey($event)` | Alpine event modifier .window with automatic cleanup on outer x-if unmount (D-72) | VERIFIED | `<article @keydown.window="handleSessionKey($event)">` at session screen article element |
| `src/data/schema-validator.js PAYLOAD_VALIDATORS` | `validateWordButtonsPayload` | dispatch table lookup by ex.type | VERIFIED | `'word-buttons': validateWordButtonsPayload` present in PAYLOAD_VALIDATORS |
| `src/screens/app.js matchPickRight (rama !correct, primer fallo)` | `applyImmediateFailure + saveState` | guard `if (!this.matchHadFailure)` | VERIFIED | Guard string `if (!this.matchHadFailure) {` present in app.js; call-site #2 confirmed |
| `src/screens/app.js matchPickRight (rama correct, al completar)` | `applyResultToSession(ex, !this.matchHadFailure)` | branch detects `matchPairsConsumed.length === ex.payload.pairs.length` | VERIFIED | Code pattern confirmed via file inspection |
| `index.html match-col items izquierda` | `handleSessionKey ramas 1-9 + matchSelectLeft` | sufijo numérico + @click + tecla (D-70) | VERIFIED | `@click="matchSelectLeft(idx)"` + `handleSessionKey` rama `key >= '1' && key <= '9'` for match type |
| `index.html match-col items derecha` | `handleSessionKey ramas a-i + matchPickRight` | sufijo alfabético + letterFor mapping + @click + tecla (D-70) | VERIFIED | `@click="matchPickRight(idx)"` + `handleSessionKey` rama `key >= 'a' && key <= 'i'` at L1067 |
| `src/screens/app.js flashMatchPair` | `cancelMatchFlash + clase CSS .match-flash` | `setTimeout 300ms + cleanup in resetSession/destroy (D-72)` | VERIFIED | `flashMatchPair` calls `cancelMatchFlash()` defensively + `matchFlashHandle = setTimeout(...)` 300ms; `.match-flash { animation: match-flash-red 300ms ease-out 1 }` |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `index.html` word-buttons sub-template | `bankWithKeys` | `wordButtonsBank` populated by `initSubStateForExercise` → `fisherYates(payload.answer ∪ payload.distractors)` | Yes — from real JSON exercise payload | FLOWING |
| `index.html` word-buttons sub-template | `wordButtonsAnswer` | `wordButtonsAddWord(idx)` mutates state reactively | Yes — from user interactions populating real tokens | FLOWING |
| `index.html` match sub-template | `matchLeft` / `matchRight` | `initSubStateForExercise` → `fisherYates(pairs.map(p => p[0/1]))` | Yes — shuffled from real JSON pairs | FLOWING |
| `index.html` match sub-template | `matchPairsConsumed` | `matchPickRight` appends `{leftIdx, rightIdx, pairIdx}` on each correct pair | Yes — from real grading outcomes | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| word-buttons.grade correct case-insensitive | `node -e "import('./src/exercise-types/word-buttons.js').then(m => console.log(m.wordButtons.grade({payload:{answer:['io','ho']}},{tokens:['IO','Ho']})))"` | `true` (verified by 8 test cases in test suite) | PASS |
| match.grade with consumedPairIdx D-66 | 7 test cases in exercise-types.test.js covering D-66 | All 7 pass (105/105 total) | PASS |
| Full test suite | `node --test tests/*.test.js` | `# tests 105 # pass 105 # fail 0 # skipped 0` | PASS |
| avere.json JSON validity + counts | `node -e '...'` | `total: 17 word-buttons: 2 match: 3 with-dup: 1` | PASS |
| Layer purity D-02 word-buttons | `grep -c "^import" src/exercise-types/word-buttons.js` | `0` | PASS |
| Layer purity D-02 match | `grep -c "^import" src/exercise-types/match.js` | `0` | PASS |
| applyImmediateFailure call-site count = 2 | `grep -c "applyImmediateFailure(this.state" src/screens/app.js` | `2` | PASS |
| No x-html in index.html | `grep -c "x-html" index.html` | `0` | PASS |
| requestReturnToHome count = 2 (no duplication) | `grep -c '@click="requestReturnToHome"' index.html` | `2` | PASS |
| No 03-02 plan ID in production code | `grep -F "03-02" src/screens/app.js` | empty (exit 1) | PASS |
| Stub message removed | `grep -F "aún no soportado" src/data/schema-validator.js` | empty (exit 1) | PASS |
| D-61 idempotency guard present | `grep -F "if (!this.matchHadFailure)" src/screens/app.js` | Found at guard block | PASS |

---

## Probe Execution

No conventional probe scripts found (`scripts/*/tests/probe-*.sh`). Phase 3 is a UI/logic phase without standalone probe scripts. Test suite (`node --test`) serves as the automated verification vehicle.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| EXTYPE-02 | 03-01-PLAN.md | Tipo `word-buttons`: botones con palabras italianas, construir traducción, validar | SATISFIED | `word-buttons.js` + sub-template HTML + CSS .wb-* + 2 seed exercises + 12 test cases; UAT 2026-05-24 PASS |
| EXTYPE-03 | 03-02-PLAN.md | Tipo `match`: dos columnas, empareja click-izq → click-der, valida al completar | SATISFIED | `match.js` + sub-template HTML + CSS .match-* + 3 seed exercises (avere-202 with D-66 duplicates) + 7 grade tests + 11 validator tests; UAT 2026-05-24 PASS |
| SESSION-06 | 03-01-PLAN.md + 03-02-PLAN.md | Atajos de teclado: 1-4 multi-choice, Enter confirmar/avanzar, Space alias de Enter | SATISFIED | `handleSessionKey` covers 18 keys: 1-4 (D-68), 1-9 word-buttons (D-69), 1-9 match izq + a-i match der (D-70), Enter/Space (D-71), Backspace (D-69); `@keydown.window` D-72 cleanup; UAT paso 4 PASS confirma sesión 20 sin ratón |

**Requirement traceability verdict:**
- EXTYPE-02: COMPLETE (03-01 PASS + 03-03 UAT PASS 2026-05-24)
- EXTYPE-03: COMPLETE (03-02 PASS + 03-03 UAT PASS 2026-05-24)
- SESSION-06: COMPLETE (03-01 PASS + 03-02 PASS + 03-03 UAT PASS 2026-05-24)

**Note:** REQUIREMENTS.md currently shows EXTYPE-02 as `Pending` and SESSION-06 as `Pending`; EXTYPE-03 is already marked `Complete (Plan 03-02)`. The orchestrator's `/gsd:complete-phase 3` command should update all three to Complete.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `tests/exercise-types.test.js` | W3 describe | test.skip conditional used for W3 idempotencia | INFO | `skip` was conditional on `matchPickRight(` presence; in final state (03-02 landed), `matchPickRight` IS present in app.js, so W3 tests ran and passed as real tests (0 skipped in 105/105). No impact. |
| `index.html` | L240 | `role="group"` present | INFO | This is the pre-existing multiple-choice button group from Phase 1/2. Phase 3 word-buttons and match sub-templates correctly use `.button-row` instead. Not a Phase 3 regression. |

No TBD, FIXME, XXX debt markers found in Phase 3 modified files.
No unreferenced debt markers blocking closure.

---

## 8 Pitfalls Verification Status (from 03-RESEARCH.md)

| Pitfall | Description | Status | Evidence |
|---------|-------------|--------|---------|
| Pitfall #1 — Listener huérfano | `@keydown.window` sobrevive al unmount de la sesión | MITIGATED + VERIFIED | `<article @keydown.window>` bajo outer `x-if="currentScreen === 'session'"` — Alpine lifecycle desmonta automáticamente; UAT paso 5 PASS |
| Pitfall #2 — saveState redundante | `applyImmediateFailure` llamado múltiples veces por fallo en match | MITIGATED + VERIFIED | `if (!this.matchHadFailure) { ... matchHadFailure = true }` guard; `grep -c "applyImmediateFailure(this.state" app.js` = 2; test W3 verifies guard presence; UAT paso 6 PASS |
| Pitfall #3 — Sub-estado residual | Estado del ejercicio anterior "mancha" el siguiente | MITIGATED + VERIFIED | `initSubStateForExercise(exercise)` limpieza universal (`wordButtonsBank = [], wordButtonsAnswer = [], matchLeft = [], matchRight = [], matchSelectedLeftIdx = null, matchPairsConsumed = [], matchHadFailure = false, cancelMatchFlash()`); llamado desde `startSession`, `sessionAdvance`, `resumeInFlightTest`; UAT paso 7 PASS |
| Pitfall #4 — setTimeout match-flash huérfano | Flash setTimeout ejecuta tras unmount y crashea | MITIGATED + VERIFIED | `cancelMatchFlash()` llamado en `resetSession`, `destroy`, `initSubStateForExercise`, y antes de cada `flashMatchPair`; UAT paso 8 PASS |
| Pitfall #5 — Renumeración word-buttons >9 | Sufijos ¹⁰ ¹¹ generados para posiciones >9 | MITIGATED + VERIFIED | `bankWithKeys` getter: `key: idx < 9 ? String(idx + 1) : ''` — posiciones 10+ tienen key vacía; cubierto por test unitario |
| Pitfall #6 — Validator no rechaza match malformado | payload inválido monta Alpine sin error visible | MITIGATED + VERIFIED | `validateMatchPayload` impl real (no stub) en dispatch table; 9 negative test cases; UAT paso 10 PASS |
| Pitfall #7 — Read de payload tras unmount | TypeError al leer `sessionCurrentExercise.payload` durante tick de unmount | MITIGATED + VERIFIED | Double-defense Alpine guards en sub-templates; null-safe getters en `sessionCurrentExercise`; UAT paso 11 PASS |
| Pitfall #8 — Foco residual | Botón retiene focus visualmente al avanzar/montar | MITIGATED + VERIFIED | `@keydown.window` en `<article>` + foco al body vía lifecycle Alpine; UAT paso 12 PASS (`document.activeElement` = body) |

---

## UAT Closure Evidence

**UAT Veredicto:** PASS — aprobado por el autor el 2026-05-24.

Esto constituye evidencia `human-verified` para todos los must-haves que requieren verificación en navegador. Los 15 pasos del UAT-03-03 fueron recorridos con resultado PASS global. La verificación humana cierra:

- D-54 exploit-proof multi-choice (no-regresión Phase 2) — UAT paso 13
- D-61 exploit-proof match (primer fallo persiste tras cerrar pestaña) — UAT paso 14
- D-66 duplicados visuales avere-202 (ambos órdenes A y B funcionales) — UAT paso 15
- Sesión mixta de 3 tipos sin errores — UAT paso 3 + 9
- Sesión de 20 sin ratón — UAT paso 4 (Criterio 4 ROADMAP)

---

## Human Verification Required

None — UAT 2026-05-24 with PASS verdict closes all items that required human testing. No open human verification items remain.

---

## Regression Risk for Phase 4

Phase 4 goal: backup (BACK-04/05/06) + contenido completo (SEED-01/02). Risks to Phase 3 invariants:

1. **Adding new exercise types** (not expected in Phase 4, but if it happened): registry dispatch table must be extended + `initSubStateForExercise` must add a branch + sub-template needed. The pattern is established and documented.

2. **Adding new JSON category files** (SEED-01: 6 PDFs): the schema validator dispatch table is closed with 3 types — new exercises using the 3 existing types will validate correctly. If types beyond the 3 are introduced, the dispatch table must be extended.

3. **Modifying `applyImmediateFailure` or `applyResultToSession`** (e.g., for new persistence semantics): the W3 test pinning `grep -c "applyImmediateFailure(this.state" app.js` = 2 will catch unintended additions. This test should remain green across Phase 4.

4. **Schema version migration** (BACK-04/05): if state schema changes, the `schemaVersion` field must be bumped and a migration function added. Phase 3 sub-states (matchLeft, matchRight, matchPairsConsumed, etc.) are in-session only (not persisted) so they are not migration targets.

5. **content/exercises/avere.json additions**: D-66 test (`avere-202` with duplicate 'ha') must be preserved or the UAT step 15 seed is missing. New exercises should be added to the end; do not reorder existing IDs.

---

## Gaps Summary

No gaps. All must-haves verified. Phase 3 goal achieved in the codebase.

The full verification chain:
- 105/105 automated tests passing (domain + exercise-type logic + W3 idempotencia guard + W5 smoke handlers)
- All 15 code-level invariants verified by grep/inspection
- UAT PASS 2026-05-24 closes the human-verification dimension
- Requirements EXTYPE-02 + EXTYPE-03 + SESSION-06 are ready to be marked Complete

---

_Verified: 2026-05-24T05:57:38Z_
_Verifier: Claude (gsd-verifier)_
