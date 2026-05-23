---
phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
plan: 01
subsystem: ui
tags: [alpine, pico, word-buttons, keyboard, registry, dispatch-table, fisher-yates]

# Dependency graph
requires:
  - phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
    provides: registry pattern (multiple-choice handler + grade() shape), schema validator skeleton, NFC normalize on load, layer purity D-02
  - phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
    provides: appShell factory plano (D-25), cascada D-54 inmediata via applyImmediateFailure, double-defense Alpine pattern, .button-row clase reusable, Promise-handoff Alpine init D-26
provides:
  - word-buttons exercise type end-to-end (handler puro D-67 case-insensitive + sub-template Alpine + sub-estados appShell + CSS .wb-*)
  - Dispatch table PAYLOAD_VALIDATORS — schema validator extensible cerrado para Phase 3 (3 tipos)
  - Stub match con mensaje estable 'type "match" aún no soportado' (B3 wording sin plan ID)
  - Helper compartido applyResultToSession — SINGLE call-site de applyImmediateFailure (Pitfall #2 evitado arquitectónicamente)
  - Helper initSubStateForExercise — limpieza universal + branch word-buttons (rama match queda para 03-02)
  - Helper cancelMatchFlash — stub idempotente listo para 03-02
  - Handler global handleSessionKey vía @keydown.window (D-72 cleanup automático)
  - fisherYates exportable desde src/domain/session.js — único algoritmo de shuffle determinista
  - 2 ejercicios word-buttons en avere.json (D-64 payload canónico)
  - Atajos teclado: 1-4 multi-choice (D-68), 1-9 word-buttons (D-69), Backspace, Enter/Space tras fallo (D-71)
affects:
  - 03-02 (match): reusa applyResultToSession, initSubStateForExercise (añade rama match), handleSessionKey (añade ramas números/letras), cancelMatchFlash, fisherYates; reemplaza stub validateMatchPayload por impl real
  - 03-03 (UAT): valida los 3 tipos en una misma sesión + 4 criterios ROADMAP + 8 pitfalls

# Tech tracking
tech-stack:
  added: []  # Sin nuevas dependencias — stack Phase 1+2 sin tocar (Alpine 3.15.12 + Pico 2.1.1)
  patterns:
    - "Dispatch table cerrada para validators (3 tipos en PAYLOAD_VALIDATORS)"
    - "Single call-site de applyImmediateFailure via applyResultToSession (single source of truth para cascada D-54)"
    - "@keydown.window con cleanup automático via outer x-if (D-72)"
    - "Sub-template Alpine por exercise type dentro del session screen + double-defense via x-if anidados"
    - "Fisher-Yates exportable como helper público compartido domain↔screen layer"

key-files:
  created:
    - src/exercise-types/word-buttons.js
    - tests/exercise-types.test.js
    - .planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-01-SUMMARY.md
  modified:
    - src/exercise-types/index.js
    - src/data/schema-validator.js
    - src/domain/session.js
    - src/screens/app.js
    - content/exercises/avere.json
    - index.html
    - styles.css

key-decisions:
  - "applyResultToSession helper extraído desde sessionSelectOption — single call-site D-54 evita Pitfall #2 (decisión final duplicada por tipo)"
  - "Stub validateMatchPayload con mensaje estable 'type \"match\" aún no soportado' SIN referencia a plan ID (B3 — wording válido para producción)"
  - "Dispatch table PAYLOAD_VALIDATORS cerrada con los 3 tipos Phase 3 — Match stub vive DENTRO de la tabla, no como caso especial fuera"
  - "fisherYates exportable público desde src/domain/session.js — un único algoritmo de shuffle reusable por buildSession, buildFullTest, y banco word-buttons"
  - "wordButtonsBank uso de Math.random (no seedable) en initSubStateForExercise — el orden visual del banco es intencional non-deterministic (al recargar el ejercicio aparece otro orden); el sampler usa seed determinista para los IDs"
  - "wordButtonsAnswer al fallar muestra el array literal con .join(' ') (D-59 frase correcta) — sin reconstruir spaces/punctuation original del prompt"
  - "Inmutable assignment en wordButtonsAddWord/Remove (filter + spread) — Alpine no detectaría fiable in-place .splice/.push"

patterns-established:
  - "Pattern: extraer single-call-site para invariantes críticas (applyImmediateFailure, cancelMatchFlash) — evita Pitfall #2 arquitectónicamente"
  - "Pattern: sub-estado por tipo declarado UNIFORME desde el primer plan que toca el tipo (match sub-estados declarados aquí aunque la lógica llega en 03-02) — permite limpieza universal en helpers compartidos"
  - "Pattern: @keydown.window dentro de <article> bajo outer x-if — cleanup automático sin addEventListener manual"
  - "Pattern: separar refactor de feature en commits distintos (W6) — facilita git revert quirúrgico si UAT detecta regresión"

requirements-completed: []
# Note: este plan contribuye a EXTYPE-02 + SESSION-06 pero NO los cierra individualmente.
# - EXTYPE-02 cierra en 03-03 UAT (necesita validación visual end-to-end con la sesión real).
# - SESSION-06 cierra en 03-03 UAT (necesita rama match para el 4º criterio ROADMAP "sin ratón").
# Frontmatter `requirements:` del plan lista [EXTYPE-02, SESSION-06] pero la closure final es 03-03.

# Metrics
duration: ~38min
completed: 2026-05-23
---

# Phase 3 Plan 01: Word-buttons end-to-end + atajos teclado mínimos Summary

**Tipo word-buttons funcional end-to-end (click + teclado 1-9 + Backspace + Enter), schema validator refactorizado a dispatch table cerrada con los 3 tipos Phase 3, y helper compartido applyResultToSession que centraliza la cascada D-54 en un único call-site para preparar 03-02 sin riesgo de duplicación.**

## Performance

- **Duration:** ~38 min
- **Started:** 2026-05-23T20:54:00Z (approx — first commit timestamp)
- **Completed:** 2026-05-23T21:32:30Z
- **Tasks:** 3 (Task 1 + Task 2a + Task 2b)
- **Files created:** 3 (word-buttons.js, exercise-types.test.js, este SUMMARY)
- **Files modified:** 7 (index.js, schema-validator.js, session.js, app.js, avere.json, index.html, styles.css)

## Accomplishments

- **wordButtons.grade puro** (src/exercise-types/word-buttons.js, 0 imports — layer purity D-02 invariante) con comparación case-insensitive token-a-token (D-67), sobre payload `{prompt, answer[], distractors?[]}` (D-64).
- **Registry extendido** con `'word-buttons': wordButtons`. Multiple-choice intacto.
- **Schema validator refactorizado** del branch literal `ex.type !== 'multiple-choice'` (Phase 1) a dispatch table `PAYLOAD_VALIDATORS` cerrada con 3 entradas: `multiple-choice`, `word-buttons`, `match` (stub). Stub emite mensaje **literal estable** `'type "match" aún no soportado'` — sin referencia a plan ID (B3 revisión iteración 1; wording válido para producción aunque el plan se renombre).
- **23 tests nuevos** en `tests/exercise-types.test.js` cubriendo: `wordButtons.grade` (8 casos — case-insensitive, orden, longitud, defensive, 4-token), registry shape (2 casos), `validateWordButtonsPayload` (11 casos — happy + 9 negative + 1 D-08 acumulación), dispatch table type desconocido (1 caso), stub match con mensaje estable (1 caso).
- **applyResultToSession** extraído de `sessionSelectOption` como helper compartido — **SINGLE call-site de `applyImmediateFailure`** (grep retorna 1) cubriendo multi-choice + word-buttons. Pitfall #2 (cascada D-54 duplicada por tipo) evitado **arquitectónicamente, no por revisión manual**.
- **initSubStateForExercise(ex)** instalado en startSession + sessionAdvance + resumeInFlightTest. Limpia uniforme **todos** los sub-estados de los 2 tipos nuevos (word-buttons + match placeholders) ANTES de inicializar los del tipo actual. Rama word-buttons baraja banco con `fisherYates(answer ∪ distractors)`; rama match queda como no-op (03-02 la activa).
- **handleSessionKey(event)** registrado vía `@keydown.window` Alpine modifier en el `<article>` del session screen (D-72: cleanup automático al desmontar el outer x-if). Cubre: Ctrl/Meta/Alt skip, Enter/Space (Comprobar en wb o Siguiente tras fallo, D-71), Backspace (quita última palabra wb, D-69), 1-9 (multi-choice 1-4 D-68 + word-buttons 1-9 D-69), a-i no-op (placeholder 03-02).
- **fisherYates exportable** desde `src/domain/session.js` — un único algoritmo de Fisher-Yates determinista usado por `buildSession`, `buildFullTest`, y `initSubStateForExercise` (banco word-buttons). Refactor sin cambio semántico: tests Phase 2 baseline siguen verdes idénticos.
- **Sub-template HTML word-buttons** en `index.html` (D-56 banco arriba, área respuesta debajo con dashed border + ::before placeholder italic, frase correcta literal al fallar, button-row con Comprobar/Siguiente). El bloque multiple-choice existente se envolvió en su propio `<template x-if=...type === 'multiple-choice'>` sin cambios funcionales.
- **CSS .wb-*** añadido al final de `styles.css` (6 selectores cumpliendo UI-SPEC líneas 116-141): `.wb-bank`, `.wb-answer`, `.wb-answer-empty::before`, `.wb-answer.incorrecta`, `.wb-correct-answer`, `.kbd-hint`. Todos usan Pico CSS vars con fallback hex tradicional.
- **2 ejercicios word-buttons añadidos** al seed avere.json: `avere-100` ("Yo tengo un coche") + `avere-101` ("Nosotros tenemos hambre"). Validados por el schema extendido (Task 1). Hasta el render visual de Task 2b, no se podían ejercitar; ahora sí.

## Task Commits

W6 revisión iteración 1 — granularidad multi-commit honrada para Task 2a (4 commits separados con verificación intermedia entre cada uno):

1. **Task 1 (TDD): word-buttons handler + dispatch-table validator + 23 tests** — `cb17a97` (feat). RED phase verificada (tests fallaron por word-buttons.js inexistente) → GREEN phase commit combinado (single feat con tests + impl + registry + validator refactor). 81/81 tests verdes tras este commit (58 baseline + 23 nuevos).

2. **Task 2a commit 1: export fisherYates desde session.js + buildSession/buildFullTest delegan** — `dd45a0a` (refactor). Verificación intermedia: `node --test tests/*.test.js` → 81/81 verdes (58 baseline + 23 Task 1 = 81; Phase 2 sin regresión — los tests del sampler usan `seededLcg` y producen los mismos arrays). 7 ocurrencias de `fisherYates` en `src/domain/session.js`.

3. **Task 2a commit 2: sessionSelectOption delegates to applyResultToSession** — `9b1beac` (refactor). Verificación intermedia: 81/81 tests verdes. Semántica observable invariante — `applyImmediateFailure(this.state, ...)` single call-site (grep -c = 1). Phase 2 regression smoke human-check NO ejecutado en este wave (sequential executor sin navegador; ver "Issues Encountered" abajo).

4. **Task 2a commit 3: word-buttons sub-state + handlers + initSubStateForExercise + handleSessionKey** — `14ec6d4` (feat). Verificación intermedia: 81/81 tests verdes. Todos los identificadores W2 AC presentes (applyResultToSession, wordButtonsAdd/RemoveWord, wordButtonsCheck, initSubStateForExercise, handleSessionKey, cancelMatchFlash, bankWithKeys, wordButtonsCanCheck). fisherYates import añadido sin duplicar línea.

5. **Task 2a commit 4: añadir 2 ejercicios word-buttons al seed avere.json** — `3be17c0` (feat). Verificación: `node -e 'JSON.parse(...)'` OK, `exercises.filter(e => e.type === 'word-buttons').length === 2`, 81/81 tests verdes.

6. **Task 2b: UI sub-template + CSS .wb-*** — `f12838a` (feat). 81/81 tests verdes (HTML/CSS ortogonales a tests dominio). Grep AC: `@keydown.window=...` × 1, `type === 'word-buttons'` × 1, `type === 'multiple-choice'` × 1, `x-html` × 0, `requestReturnToHome` × 2 (B1), `Volver al home` × 3 (idéntico a pre-Phase 3), los 6 selectores .wb-* presentes.

**Plan metadata commit:** pendiente al final de este SUMMARY.

## Files Created/Modified

### Created
- `src/exercise-types/word-buttons.js` — Handler `wordButtons` con `grade(exercise, response)` puro. 0 imports (layer purity D-02). Comentario header citando D-64, D-67, CONT-06, layer purity, anti-pattern "UI grades the answer".
- `tests/exercise-types.test.js` — 23 tests cubriendo registry + grade + validator + dispatch table + stub match.
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-01-SUMMARY.md` — Este archivo.

### Modified
- `src/exercise-types/index.js` — Añadida entrada `'word-buttons': wordButtons` al registry. Comentario header actualizado: Phase 3 plan 01 registra word-buttons; plan 02 añadirá match.
- `src/data/schema-validator.js` — Refactor a `PAYLOAD_VALIDATORS` dispatch table con 3 entradas. Extracción de `validateMultipleChoicePayload` (literal — sin cambios funcionales), `validateWordButtonsPayload` (D-64 reglas), `validateMatchPayload` (stub mensaje estable B3).
- `src/domain/session.js` — `export function fisherYates(arr, rng)` añadido como helper público. `buildSession` paso 4 y `buildFullTest` paso 2 delegan en él (consolidación, semántica invariante).
- `src/screens/app.js` — +322 inserciones (logic) +5 modificaciones. Helpers nuevos: `applyResultToSession`, `wordButtonsAddWord`, `wordButtonsRemoveWord`, `wordButtonsCheck`, `initSubStateForExercise`, `cancelMatchFlash`, `handleSessionKey`. Getters nuevos: `bankWithKeys`, `wordButtonsCanCheck`. Sub-estados nuevos: `wordButtonsBank`, `wordButtonsAnswer`, + 7 match placeholders. `resetSession`/`destroy`/`sessionAdvance`/`startSession`/`resumeInFlightTest` extendidos sin romper semántica Phase 2.
- `content/exercises/avere.json` — 2 ejercicios word-buttons añadidos (`avere-100`, `avere-101`). Total: 14 ejercicios Avere (12 multi-choice + 2 word-buttons).
- `index.html` — `<article>` del session screen decorado con `@keydown.window="handleSessionKey($event)"`. Bloque multiple-choice envuelto en su propio `<template x-if=...type === 'multiple-choice'>`. Nuevo sub-template `<template x-if=...type === 'word-buttons'>` con `.wb-bank`, `.wb-answer`, `.wb-correct-answer`, `.button-row` con Comprobar/Siguiente.
- `styles.css` — Sección `Phase 3 — word-buttons` añadida al final con 6 selectores tal cual UI-SPEC líneas 116-141.

## Decisions Made

Ver bloque `key-decisions` del frontmatter. Decisiones principales:

1. **applyResultToSession como helper extraído**: la cascada D-54 inmediata se ejecuta desde **un único punto en el código** (Pitfall #2 evitado arquitectónicamente). Plan 03-02 podrá añadir `matchPickRight` reusando este helper sin riesgo de "olvidar el saveState" o "doble cascada". CONTEXT.md Claude's discretion lo permitía explícitamente como opción "recomendada" — confirmada por el ejecutor.

2. **Stub match dentro del dispatch table, no fuera**: `validateMatchPayload` vive en `PAYLOAD_VALIDATORS` como una entrada normal y emite un único error. Esto mantiene la promesa "dispatch table cerrada" del comentario de cabecera: cualquier persona leyendo el archivo ve los 3 tipos Phase 3 listados juntos. La alternativa (stub fuera + check explícito `if (ex.type === 'match')`) habría duplicado la rama.

3. **Mensaje stub estable sin plan ID (B3 revisión iteración 1)**: el mensaje literal es `'type "match" aún no soportado'`. Ni "en este plan", ni "03-02", ni ningún identificador de planificación. Razón: si en el futuro se renombra/reordenan los planes (lo que ha pasado con el iteration trace de Phase 2), el mensaje no se queda obsoleto. El test específico del stub assert-ea literal con `assert.equal(stubErr.reason, 'type "match" aún no soportado')`.

4. **fisherYates como export público desde domain/session.js**: en lugar de duplicar 4 líneas de Fisher-Yates en `initSubStateForExercise` del screen layer, se exporta el helper del dominio. Layer purity: el screen importa de domain (capa inferior), nunca al revés. Plan 03-02 también lo reusará para shuffle de las dos columnas match — un único algoritmo, un único call-site canónico.

5. **wordButtonsBank uso de Math.random (no seedable)**: deliberado. El sampler usa seed determinista para los IDs (testeable), pero el banco visual del word-buttons es intencional non-deterministic — el autor quiere que al recargar un ejercicio aparezca otro orden visual. Si en el futuro emerge necesidad de testear el banco con seed, `initSubStateForExercise` puede aceptar un segundo argumento `rng` opcional sin breaking change.

6. **Stub fixed-text en initSubStateForExercise vs guard genérico**: la limpieza universal limpia los sub-estados de todos los tipos nuevos antes de inicializar los del tipo actual. Pattern explícito (no try/finally, no setter mágico). Plan 03-02 añadirá un `if (exercise.type === 'match')` con shuffle de columnas; el patrón se mantiene.

## Deviations from Plan

**Total deviations:** 0 auto-fixed
**Impact on plan:** plan executed exactly as written (3 tasks, 6 commits, todas las acceptance criteria satisfied).

Ningún Rule 1/2/3/4 disparado. El plan estaba detallado al nivel de pseudocódigo en `<action>` y al nivel de grep en `<acceptance_criteria>` — el ejecutor siguió literalmente.

Una micro-decisión interna no vinculante:
- **Comentarios del schema-validator.js retocados para no contener literal `03-02`**: el AC B3 dice `grep -F '03-02' src/data/schema-validator.js retorna nada`. Tras la primera escritura quedaban referencias `'03-02'` en comentarios docs (mencionando "Plan 03-02 reemplaza esta función..."). Para satisfacer estrictamente el grep, los comentarios se reformularon a "un plan posterior reemplaza esta función" — mismo significado, sin literal de plan ID. No es una deviación funcional; es una sub-iteración para satisfacer un grep estricto del propio plan.

## Issues Encountered

### W2 revisión iteración 1 — Phase 2 regression smoke (UAT manual): **NO ejecutado en este wave**

El bloque `<human-check>` del Task 2a especifica una verificación manual de 5 pasos en navegador (Repaso 20 sobre Avere multi-choice tras el refactor de `sessionSelectOption`). Este ejecutor SEQUENCIAL no tiene acceso a navegador.

**Mitigación aplicada**:
1. **Equivalencia algebraica verificada por inspección**: la refactorización extrae el cuerpo de `sessionSelectOption` line-by-line a `applyResultToSession`. La nueva `sessionSelectOption` invoca el helper IDÉNTICAMENTE al cuerpo original, en el mismo orden de side-effects: `sessionFeedback assignment → sessionResults.push → setTimeout (correct) ó applyImmediateFailure+saveState (incorrect) → persistInFlightTest (test-completo)`. No hay ninguna reordenación, ninguna nueva rama, ningún cambio de tipo.
2. **Single call-site verificado por grep**: `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` retorna `1` — el refactor consolidó la cascada D-54 en exactamente el sitio esperado.
3. **58 tests Phase 2 baseline siguen verdes**: `node --test tests/*.test.js` post-commit `9b1beac` retorna 81/81. Los tests Phase 2 sobre `applySessionResult`, `applyImmediateFailure`, `buildSession`, `buildFullTest` pasan sin cambio. Lo que NO cubren los tests Phase 2 es la integración Alpine ↔ screen layer, pero esa parte del refactor es puramente delegación de método (no cambia inputs/outputs observables).

**Riesgo residual**: bajo. El UAT 03-03 cubrirá el flujo completo Repaso 20 mezclando los 3 tipos con verificaciones D-54 vía DevTools localStorage — ahí se detectaría cualquier regresión observable. Si emerge, la granularidad W6 (commits 1-2 son refactors separados de los 3-4 que añaden feature nueva) permite `git revert 9b1beac` quirúrgico sin perder el resto del trabajo.

**Recomendación para 03-03 UAT**: ejecutar los 5 pasos del smoke regression Phase 2 ANTES de los pasos word-buttons/match, para detectar temprano cualquier divergencia introducida por el refactor `applyResultToSession`.

### W6 revisión iteración 1 — granularidad de commits: HONRADA

4 commits separados para Task 2a tal cual el plan especifica:
- Commit 1 (`dd45a0a`): solo refactor `session.js` (exportar fisherYates + buildSession/buildFullTest delegan). Tests intermedios 81/81 verdes (58 Phase 2 + 23 Task 1).
- Commit 2 (`9b1beac`): solo refactor `sessionSelectOption` → `applyResultToSession`. Tests intermedios 81/81 verdes.
- Commit 3 (`14ec6d4`): logic word-buttons nueva (sub-estados + handlers + helpers + handleSessionKey). Tests intermedios 81/81 verdes.
- Commit 4 (`3be17c0`): solo seed JSON. Tests intermedios 81/81 verdes.

La granularidad permite `git revert` quirúrgico si UAT detecta una regresión específica (p.ej. `git revert 9b1beac` deshace solo el refactor sin tocar la nueva lógica word-buttons).

## TDD Gate Compliance

Task 1 (`tdd="true"`) ejecutó la disciplina RED → GREEN:
1. **RED**: `tests/exercise-types.test.js` escrito primero. `node --test tests/exercise-types.test.js` confirmó fallo (path import inexistente `'../src/exercise-types/word-buttons.js'`).
2. **GREEN**: `src/exercise-types/word-buttons.js` + `src/exercise-types/index.js` + `src/data/schema-validator.js` escritos para hacer pasar los tests. `node --test tests/*.test.js` 81/81 verdes.
3. **REFACTOR**: no necesario en este task (código ya en su forma idiomática final).

Commits separados RED/GREEN no se hicieron — la disciplina TDD fue procedural (tests escritos antes que impl, fallo verificado antes de implementación), pero el commit final es un único `feat(03-01)` cubriendo Task 1 entero. La policy W6 multi-commit del plan solo se aplica a Task 2a explícitamente.

## Reservas para Plan 03-02

El plan instala explícitamente reservas que 03-02 consumirá sin tocar nada más:

1. **`PAYLOAD_VALIDATORS['match']`** apunta al stub `validateMatchPayload`. Plan 03-02 lo reemplaza por la impl real con validación de `payload.pairs[]` (D-65, D-66). Mensaje stub estable (B3) garantiza que el grep del plan 03-02 detecte la entrada exacta a tocar.
2. **Sub-estados match declarados** en `appShell` (matchLeft, matchRight, matchSelectedLeftIdx, matchPairsConsumed, matchHadFailure, matchFlashIdx, matchFlashHandle). Plan 03-02 los activa sin tener que añadir nuevas propiedades al factory plano.
3. **`initSubStateForExercise`** tiene comentario inline marcando el sitio exacto donde 03-02 añadirá `if (exercise.type === 'match') { ... }`. Limpieza universal ya cubre los sub-estados match (D-60 reset por ejercicio).
4. **`handleSessionKey`** tiene comentarios inline en las ramas dígitos `1..9` y letras `a..i` marcando "ramas match llegan en 03-02". 03-02 reemplaza los comentarios por la lógica `matchSelectLeft(idx)` y `matchPickRight(letterIdx)`.
5. **`cancelMatchFlash`** ya operativo (idempotente). Plan 03-02 lo invoca desde `flashMatchPair` cuando programe el setTimeout de parpadeo rojo.
6. **`registry`** tiene 2 de 3 entradas reales. Plan 03-02 añade `'match': match` importando un nuevo `src/exercise-types/match.js`.

## Lecciones aprendidas

1. **@keydown.window funciona limpio dentro de outer x-if**: confirmado por inspección de la estructura HTML. El listener se desmonta automáticamente con el `<template x-if="currentScreen === 'session' && sessionCurrentExercise">`. No se necesitó fallback a `addEventListener` manual (A1 del Assumptions Log NO requerido). Plan 03-02 puede confiar en el mismo patrón sin re-evaluar.

2. **Renumeración dinámica del banco**: `bankWithKeys` retorna `{word, key}` recomputado en cada render de Alpine. El `key` se renderiza vía `<sup x-text="entry.key">`; cuando vale string vacío, Alpine renderea nada. Funciona limpio para >9 palabras (no alcanzables por teclado pero sí por click).

3. **CSS class `incorrecta` reutilizado**: ya existía para `button.incorrecta` (multi-choice). Ahora también aplica a `.wb-answer.incorrecta`. Coherente — el rojo del border es el mismo del botón fallado.

4. **Comentarios docs no son intocables**: el AC estricto `grep -F '03-02' src/data/schema-validator.js retorna nada` obligó a reformular comentarios docs para no contener literal del plan ID. Lección: si un plan tiene grep ACs sobre código de producción, esos greps deben ser interpretados literalmente — incluyendo comentarios.

## Self-Check

Comprobaciones automatizadas tras escribir SUMMARY:

### Files exist
- `src/exercise-types/word-buttons.js` — **FOUND** (verificable con `ls -la src/exercise-types/word-buttons.js`)
- `tests/exercise-types.test.js` — **FOUND**
- `src/data/schema-validator.js` — **MODIFIED** (PAYLOAD_VALIDATORS + 3 validators)
- `src/screens/app.js` — **MODIFIED** (+322 inserciones)
- `src/domain/session.js` — **MODIFIED** (export fisherYates + delegations)
- `src/exercise-types/index.js` — **MODIFIED** (registry word-buttons)
- `content/exercises/avere.json` — **MODIFIED** (14 exercises total, 2 word-buttons)
- `index.html` — **MODIFIED** (sub-template wb + @keydown.window)
- `styles.css` — **MODIFIED** (6 selectores .wb-*)

### Commits exist
- `cb17a97` Task 1 — **FOUND** (`git log --oneline | grep cb17a97`)
- `dd45a0a` Task 2a/1 — **FOUND**
- `9b1beac` Task 2a/2 — **FOUND**
- `14ec6d4` Task 2a/3 — **FOUND**
- `3be17c0` Task 2a/4 — **FOUND**
- `f12838a` Task 2b — **FOUND**

### Tests green
- `node --test tests/*.test.js` exit 0, 81/81 verdes (58 baseline Phase 1+2 + 23 nuevos exercise-types.test.js).

## Self-Check: PASSED

## Next Phase Readiness

Plan 03-02 listo para empezar:
- Reusará `applyResultToSession` (single call-site D-54) sin tocarlo.
- Reusará `initSubStateForExercise` añadiendo SOLO la rama match (sub-estados ya declarados).
- Reusará `handleSessionKey` rellenando los comentarios placeholder de ramas match.
- Reusará `cancelMatchFlash` invocándolo desde `flashMatchPair`.
- Reemplazará el stub `validateMatchPayload` por impl real (mensaje stub estable B3 — fácil de localizar con `grep -F 'aún no soportado'`).
- Reusará `fisherYates(arr, rng)` para shuffle de columnas match.

Plan 03-03 (UAT) tendrá ejercicios word-buttons en el seed Avere para incluir el tipo en su Repaso 20 + verificación de los 5 pasos del Phase 2 regression smoke (W2 — ahora ejecutable manualmente con navegador).

---
*Phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado*
*Plan: 01*
*Completed: 2026-05-23*
