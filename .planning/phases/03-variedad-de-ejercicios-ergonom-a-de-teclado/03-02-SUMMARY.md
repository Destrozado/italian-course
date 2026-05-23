---
phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
plan: 02
subsystem: ui
tags: [alpine, pico, match, keyboard, registry, dispatch-table, fisher-yates, cascada-inmediata, duplicados]

# Dependency graph
requires:
  - phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
    provides: registry pattern (grade() shape), schema validator skeleton, NFC normalize on load, layer purity D-02
  - phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
    provides: appShell factory plano (D-25), cascada D-54 inmediata via applyImmediateFailure, double-defense Alpine pattern, .button-row, Promise-handoff D-26
  - phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
    provides: 03-01 — applyResultToSession single call-site, initSubStateForExercise (rama wb + placeholders match), handleSessionKey (ramas 1-9 multi + 1-9 wb + Backspace + Enter/Space), cancelMatchFlash idempotente, fisherYates exportable, stub validateMatchPayload
provides:
  - match exercise type end-to-end (handler puro D-66 duplicados + sub-template Alpine + sub-estados appShell activados + CSS .match-* + 3 ejercicios seed avere.json)
  - validateMatchPayload impl real reemplazando el stub de 03-01 — dispatch table cerrada con 3 IMPLs (sin stubs)
  - applyImmediateFailure SECOND call-site con guard matchHadFailure (Pitfall #2 idempotencia D-61) — total 2 call-sites EXACTOS verificados por test
  - flashMatchPair + cleanup via cancelMatchFlash existente (Pitfall #4 setTimeout huérfano)
  - handleSessionKey rama letras a-i (matchPickRight) + dígitos 1-9 (matchSelectLeft) — completa SESSION-06 extensión total D-68..D-72
  - 18 teclas cubiertas (1-9 + a-i + Enter + Space + Backspace) con cleanup automático via outer x-if (D-72)
affects:
  - 03-03 (UAT): consume los 3 tipos finales para verificar los 4 criterios ROADMAP + 11 pasos human-check + D-61 exploit-proof end-to-end con localStorage DevTools

# Tech tracking
tech-stack:
  added: []  # Sin nuevas dependencias — stack Phase 1+2+3-01 sin tocar
  patterns:
    - "Retorno enriquecido `{correct, pairIdx?}` justificado funcionalmente para D-66 (no inconsistencia)"
    - "Segundo call-site de applyImmediateFailure con guard explícito por flag de ejercicio (matchHadFailure) — patrón replicable si emerge un 3er tipo con cascada mid-ejercicio"
    - "Dispatch table cerrada con N impls reales (sin stubs intermedios) — dispatch table es la única fuente de verdad de los tipos soportados"
    - "Animation CSS WCAG-safe: 1 flash único 300ms (NO loop, max 3 flashes/sec WCAG §2.3.1)"
    - "test.skip condicional por inspección de runtime (matchPickRightExists()) — permite que un test añadido en Task 1 se active automáticamente al landed Task 2 sin editar el archivo de tests"

key-files:
  created:
    - src/exercise-types/match.js
    - .planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-02-SUMMARY.md
  modified:
    - src/exercise-types/index.js
    - src/data/schema-validator.js
    - src/screens/app.js
    - content/exercises/avere.json
    - index.html
    - styles.css
    - tests/exercise-types.test.js

key-decisions:
  - "Sub-estados match declarados en factory plano por 03-01 — Plan 02 SOLO añade lógica (matchSelectLeft/matchPickRight/flashMatchPair) sin tocar la forma del factory. La rama del registry + la rama de initSubStateForExercise + la rama de handleSessionKey son las únicas modificaciones a app.js (clean diff)."
  - "applyImmediateFailure tiene 2 call-sites EXACTOS, NO 1: el primero en applyResultToSession (decisión final, los 3 tipos) y el segundo directo en matchPickRight con guard matchHadFailure (primer fallo match, antes de que el ejercicio termine). El test W3 asserta el count exactamente — refactor protection."
  - "Forced last pair (D-63): NO auto-completar (UI-SPEC + plan). El usuario hace el último click manualmente — mecánica coherente con el resto de parejas. Si UAT emerge fricción, Phase 5 puede reconsiderar."
  - "test.skip condicional con función de detección (matchPickRightExists) — patrón reusable: añadir tests en Task N que verifiquen presencia textual de código que llega en Task N+1, sin que el commit intermedio rompa exit 0."

# Quality marks
requirements-completed: [EXTYPE-03]
# Note: SESSION-06 contribuye desde 03-01 + 03-02 pero CIERRA en 03-03 UAT
# (necesita confirmación humana del 4º criterio ROADMAP "sesión 20 sin ratón
# incluyendo word-buttons Y match"). EXTYPE-03 cierra aquí porque el tipo
# match es operativo end-to-end (handler + render + cascada + tests) sin
# dependencia adicional al UAT.

# Metrics
duration: ~10min
completed: 2026-05-23
---

# Phase 3 Plan 02: Match end-to-end + cascada inmediata idempotente Summary

**Tipo match operativo con click izq → click der (o teclado 1-9 + a-i), cascada D-61 inmediata + idempotente al primer fallo (guard `matchHadFailure` con 2 call-sites EXACTOS de `applyImmediateFailure` verificados por test), grading con duplicados textuales en columna derecha (D-66 consumo por índice), y dispatch table del validator cerrada con 3 impls reales (sin stubs intermedios).**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-23T21:40:10Z
- **Completed:** 2026-05-23T21:50:19Z
- **Tasks:** 2 (Task 1 TDD + Task 2 sub-template + handlers + seed + W5 smoke)
- **Files created:** 2 (match.js, este SUMMARY)
- **Files modified:** 7 (index.js, schema-validator.js, app.js, avere.json, index.html, styles.css, exercise-types.test.js)
- **Tests:** 81 baseline (Phase 1+2 + 03-01) + 24 nuevos (03-02) = **105/105 verdes**.

## Accomplishments

- **`match.grade` puro** (`src/exercise-types/match.js`, 0 imports — layer purity D-02 invariante) con búsqueda lineal sobre `pairs[]` saltando los `consumedPairIdx`, comparación case-insensitive (D-67), retorno enriquecido `{correct, pairIdx?}` para soportar D-66 duplicados textuales sin que la UI inspeccione el payload.
- **Registry completado** con `'match': match` — los 3 tipos finales Phase 3 expuestos.
- **`validateMatchPayload` impl real** (`src/data/schema-validator.js`) reemplaza el stub de 03-01. Reglas: prompt string no vacío, pairs array de 2..10 entradas, cada tuple exactamente 2 strings no vacíos. D-08 acumula errores en un pase; early-return DENTRO del `forEach` solo cuando una `pair` no es array (para evitar `TypeError` al traversar `p[0]`/`p[1]` de algo no-iterable). El mensaje stub `'aún no soportado'` está completamente erradicado del archivo (verificado por grep en self-check).
- **Sub-estados match activados** en `appShell` factory plano: la declaración existía desde 03-01 (matchLeft, matchRight, matchSelectedLeftIdx, matchPairsConsumed, matchHadFailure, matchFlashIdx, matchFlashHandle); 03-02 añade el SHUFFLE inicial vía `fisherYates` en `initSubStateForExercise` rama match (D-62), y la cleanup automática vía `cancelMatchFlash` que ya estaba en `resetSession`/`destroy` desde 03-01.
- **Handlers match nuevos** en `appShell`:
  - `matchSelectLeft(idx)`: selecciona item izq, guard contra consumed + feedback. Reemplaza selección previa por asignación directa (D-70).
  - `matchPickRight(rightIdx)`: invoca `match.grade()`, en rama correct añade a `matchPairsConsumed` (inmutable) y limpia selección; si `matchPairsConsumed.length === pairs.length` invoca `applyResultToSession(ex, !matchHadFailure)` (decisión final del ejercicio, idempotente sobre la cascada ya aplicada). En rama incorrect con guard `if (!this.matchHadFailure)`, dispara `applyImmediateFailure + saveState + matchHadFailure = true + persistInFlightTest (si test-completo)`. SEGUNDO call-site EXACTO de `applyImmediateFailure(this.state, ...)` — el test W3 asserta count === 2.
  - `flashMatchPair(leftIdx, rightIdx)`: programa setTimeout 300ms para que ambos items pierdan la clase `.match-flash`, con cleanup defensivo previo via `cancelMatchFlash`.
  - `matchLeftIsConsumed(idx)` / `matchRightIsConsumed(idx)`: helpers de búsqueda sobre `matchPairsConsumed`, defensivos contra array vacío/no-array.
  - `letterFor(idx)`: mapea 0..8 → 'a'..'i', '' para idx >= 9 (UI-SPEC).
- **`handleSessionKey` extendido** con la rama match completa:
  - Dígitos 1-9: si `ex.type === 'match'`, invoca `matchSelectLeft(idx)` con guards de length + consumed (D-70).
  - Letras a-i: nueva rama tras la rama dígitos. Guards: feedback nulo, type match, `matchSelectedLeftIdx !== null` (letra sin número previo → ignorada silenciosamente, D-70), idx < matchRight.length, no consumed. Si pasa todos los guards → `matchPickRight(idx)`.
  - Los comentarios placeholder `'03-02'` (de 03-01) eliminados completamente. `grep -F "03-02" src/screens/app.js` retorna sin ocurrencias (B1 revisión iteración 1 honrada).
- **Sub-template HTML match** en `index.html` como 3er hermano dentro del `<article>` session: `.match-grid` (`1fr 1fr`) con dos `.match-col`, items botón con sufijos visibles `¹..⁹` (izq) y `ᵃ..ⁱ` (der), aria-label en español ("Sustantivo 1: casa", "Letra a: la"), bindings null-safe sobre `matchFlashIdx`. Botón `Siguiente` con `x-show="sessionFeedback === 'incorrect'"` aparece cuando el ejercicio se cierra con `matchHadFailure=true` (la cascada D-61 ya disparó al inicio; aquí solo se muestra el botón porque `sessionFeedback === 'incorrect'` se setea al completar el ejercicio).
- **CSS `.match-*`** en `styles.css` con 5 selectores + `@keyframes match-flash-red`. WCAG 2.1 §2.3.1 safe (1 flash único 300ms, NO loop). Colores via Pico CSS vars con fallback hex tradicional, coherente con el resto del proyecto.
- **3 ejercicios match seed** en `content/exercises/avere.json` (avere-200..202):
  - `avere-200`: 4 parejas io↔ho, tu↔hai, lui↔ha, noi↔abbiamo (sin duplicados — happy path).
  - `avere-201`: 4 parejas con `ha` apareciendo solo una vez en derecha (control case-insensitive end-to-end).
  - `avere-202`: 3 parejas con `ha` DUPLICADO textualmente en columna derecha (lui↔ha + lei↔ha + noi↔abbiamo) — verifica D-66 end-to-end. Total Avere: 17 ejercicios (12 multi + 2 word-buttons + 3 match).
- **24 tests nuevos** en `tests/exercise-types.test.js`:
  - 7 tests `match.grade` (correct, incorrect, case-insensitive, D-66 duplicado consumed, D-66 orden inverso, índice consumido, response sin consumedPairIdx + determinismo).
  - 1 test registry final con 3 entradas.
  - 11 tests `validateMatchPayload` (happy + 9 negative cases + 1 verificación de erradicación del stub message).
  - 2 tests W3 idempotencia (skipped en Task 1 commit `f9e400e`, ACTIVADOS automáticamente en Task 2 commit `f4000b7` vía detección runtime de `matchPickRight(` en source).
  - 3 tests W5 smoke (presencia textual de matchSelectLeft/matchPickRight/flashMatchPair/helpers + ramas match en handleSessionKey + shuffle en initSubStateForExercise rama match).

## Task Commits

W6 política multi-commit honrada con 2 commits separados — granularidad task-level (Task 1 puramente domain + tests, Task 2 puramente UI + seed + tests UI):

1. **Task 1 (TDD): match handler + real validator + tests cubriendo D-66 + W3 idempotencia (skipped hasta Task 2)** — `f9e400e` (feat). RED phase: import de `match` desde `'../src/exercise-types/match.js'` (inexistente) hizo fallar la suite entera. GREEN phase: añadidos `match.js` + `'match': match` al registry + `validateMatchPayload` impl real + 7 tests grade + 1 test registry + 11 tests validator. W3 idempotencia tests añadidos pero con `{ skip: <condition> }` condicional sobre presencia de `matchPickRight(` en `src/screens/app.js`. Tests post-commit: 100 passing + 2 skipped (W3 esperando Task 2). Layer purity D-02 verificada: `grep -c "^import" src/exercise-types/match.js` → 0.

2. **Task 2: match end-to-end (handlers + sub-template + CSS + seed + W5 smoke + W3 idempotencia activado)** — `f4000b7` (feat). app.js extendido con: rama match en `initSubStateForExercise`, 5 métodos nuevos (`matchSelectLeft`/`matchPickRight`/`flashMatchPair`/`matchLeftIsConsumed`/`matchRightIsConsumed`/`letterFor`), rama match en handleSessionKey (dígitos 1-9 + letras a-i). index.html: sub-template `<template x-if="...type === 'match'">` con `.match-grid`. styles.css: 5 selectores match + `@keyframes match-flash-red`. avere.json: 3 ejercicios match (avere-200..202). exercise-types.test.js: describe W5 smoke (3 tests presence-of-source). Los 2 tests W3 antes-skipped se ACTIVARON automáticamente — la función `matchPickRightExists()` detectó el método y desactivó el skip. Tests post-commit: 105/105 passing, 0 skipped, 0 failed.

## Files Created/Modified

### Created
- `src/exercise-types/match.js` — Handler `match` con `grade(exercise, response)` retornando `{correct, pairIdx?}`. 0 imports (layer purity D-02). Header con cita explícita de D-65/D-66/D-67/CONT-06/D-02 + nota sobre la asimetría con multi-choice/word-buttons justificada por necesidad D-66.
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-02-SUMMARY.md` — Este archivo.

### Modified
- `src/exercise-types/index.js` — Añadida entrada `'match': match`. Header actualizado: "Phase 3 completo: registry expone los 3 tipos finales". Nota en JSDoc explicando la asimetría del retorno enriquecido de `match.grade`.
- `src/data/schema-validator.js` — `validateMatchPayload` stub reemplazado por impl real (D-65 schema completo). Comentarios docs actualizados (sin "Plan posterior reemplaza..."; ahora dice "dispatch table cerrada con 3 impls reales").
- `src/screens/app.js` — +199 inserciones (5 métodos nuevos + rama match en initSubStateForExercise + 2 ramas en handleSessionKey + comentarios sin '03-02'). Sub-estados match conservan su forma (declarados en 03-01).
- `content/exercises/avere.json` — 3 ejercicios match (avere-200/-201/-202; uno con duplicados textuales D-66). Total: 17 ejercicios.
- `index.html` — Sub-template match nuevo (3er hermano de multiple-choice y word-buttons dentro del `<article>` session). Sin tocar el outer `<template x-if="currentScreen === 'session' && sessionCurrentExercise">`. Botón `← Volver al home` permanece en su única ubicación legítima (count `@click="requestReturnToHome"` = 2, count "Volver al home" = 3 — idéntico a pre-Phase 3 y post-03-01).
- `styles.css` — Sección `Phase 3 — match (Plan 03-02)` añadida al final con 5 selectores + `@keyframes match-flash-red`.
- `tests/exercise-types.test.js` — +24 tests nuevos (7 grade + 1 registry final + 11 validator + 2 W3 + 3 W5 smoke). Total tests en archivo: 47.

## Decisions Made

Ver bloque `key-decisions` del frontmatter. Decisiones principales:

1. **2 call-sites EXACTOS de `applyImmediateFailure`, NO 1**: el plan presentaba una opción "centralizar todo en applyResultToSession" pero matchPickRight necesita disparar la cascada EN MEDIO del ejercicio (D-61 PRIMER fallo, no al final). Mantener el call-site directo dentro del bloque `if (!this.matchHadFailure)` es semánticamente más limpio que abstraer `applyResultToSession` para soportar "decisión intermedia que no termina el ejercicio" — sería un parámetro adicional + rama interna. La arquitectura final: applyResultToSession centraliza la DECISIÓN FINAL (los 3 tipos); matchPickRight tiene además el dispatch directo del PRIMER FALLO match con guard idempotente. El test W3 cuenta los call-sites para que cualquier regresión arquitectónica sea detectada.

2. **Retorno enriquecido `{correct, pairIdx?}` justificado funcionalmente**: una alternativa era hacer que el caller (matchPickRight) buscase el pairIdx tras un grade booleano. Pero eso duplica la lógica de búsqueda (lineal con consumed) entre handler y caller — Romper el principio "la UI no graduates the answer". Mantener la búsqueda DENTRO de match.grade y exponer el pairIdx vía return es la forma limpia. El JSDoc lo justifica explícitamente.

3. **test.skip condicional con detección runtime**: el patrón "tests añadidos en Task N que verifican código de Task N+1" surge naturalmente al organizar planes por waves verticales. Usé `readFileSync` + `String.includes('matchPickRight(')` como predicado de detección — si `matchPickRight` está en `src/screens/app.js`, el skip se desactiva automáticamente. Esto evita la necesidad de editar el archivo de tests al landed Task 2: el commit de Task 1 está limpio (exit 0 con 2 skipped explicados), el commit de Task 2 activa los tests sin tocar el archivo de tests, los commits son auditables independientemente.

4. **Forced last pair: NO auto-completar (UI-SPEC)**: respetada. matchPickRight invoca applyResultToSession SOLO cuando matchPairsConsumed.length === pairs.length — la última pareja siempre requiere el click/tecla manual del usuario.

5. **Persistencia inFlightTest tras primer fallo match en test-completo**: añadida en matchPickRight rama incorrect dentro del guard `if (!this.matchHadFailure)`. Razón: la cascada D-61 ya cambió categoryProgress (vía applyImmediateFailure + saveState), pero el snapshot de inFlightTest no se actualiza solo por ese saveState — es una key distinta del state. Por consistencia con applyResultToSession (que persiste inFlightTest tras la decisión final en test-completo), matchPickRight también lo persiste tras el primer fallo. Effect: el banner home muestra el cursor correcto incluso si el usuario cierra la pestaña tras el primer parpadeo rojo de un test-completo match.

## Deviations from Plan

**Total deviations:** 1 (Rule 3, sub-iteración para satisfacer el grep AC `grep -F '03-02' src/screens/app.js` = nada).

**Impact on plan:** plan ejecutado tal cual escrito; las modificaciones de comentarios para satisfacer el grep AC son sub-iteración no funcional.

### 1. [Rule 3 - Blocking Issue] Comentarios 03-02 reformulados para satisfacer grep AC estricto

- **Found during:** Task 2, tras inicial implementación de la rama match en `initSubStateForExercise`.
- **Issue:** El plan AC dice `grep -F "03-02" src/screens/app.js` retorna nada. Tras la primera escritura quedaban 2 referencias a '03-02' en comentarios docs heredados de 03-01:
  - Línea ~547: `// ...match en matchPickRight cuando aterrice 03-02). Pitfall #2...`.
  - Línea ~898: `* Match (Plan 03-02 — D-62 shuffle ambas columnas; D-66 duplicados...`.
- **Fix:** Reformulación de los comentarios sin referencia al plan ID. El primero pasó a hablar del 2do call-site directo en matchPickRight con guard; el segundo simplificado a `Match (D-62 shuffle ambas columnas; D-66 duplicados...)`. Sin cambio funcional.
- **Files modified:** `src/screens/app.js`.
- **Commit:** `f4000b7` (mismo commit que Task 2 — fix in-flight).

### Notes — no auth gates, no checkpoints

Phase 3 plan 02 NO involucra autenticación, instalación de paquetes nuevos, ni decisiones arquitectónicas que requieran human-action. Ejecución 100% autonomous tal como `autonomous: true` declaraba en frontmatter del plan.

## Issues Encountered

### W3 idempotencia (revisión iteración 1) — estrategia adoptada

El plan presenta dos estrategias para verificar la idempotencia D-61:

(1) Instanciar `appShell` bajo node con state/content mocks + spy sobre `applyImmediateFailure` + 2 invocaciones consecutivas de `matchPickRight(idxIncorrecto)`.

(2) Verificación textual por presencia del guard `if (!this.matchHadFailure)` y count exacto de call-sites de `applyImmediateFailure`.

**Decisión adoptada: estrategia (2)**. Razones técnicas concretas:

- `appShell(appDataReady)` retorna un factory cuyo `init()` await-ea la Promise. Bajo node sin `await`, los métodos directos (matchPickRight, matchSelectLeft) son llamables, pero requieren que `this.sessionCurrentExercise` esté populado (getter que depende de `content.exerciseById[id]`).
- El getter `sessionCurrentExercise` accede a `this.content.exerciseById?.[id]`, que requiere `this.content = { exerciseById: { [id]: ex } }`.
- Para el spy sobre `applyImmediateFailure`, tendría que monkey-patch el import del módulo `../domain/progress.js` o usar dependency injection (NO existe en el código actual — es un import directo).
- El setup mínimo serían ~30 líneas de mock + monkey-patch frágil que solo verifica algo que el guard textual ya garantiza estructuralmente.

**Strategia adoptada (verificación textual)**: 
- Test 1: localiza `matchPickRight(` y verifica que en los próximos 4000 caracteres aparece `if (!this.matchHadFailure)` Y `applyImmediateFailure(this.state`.
- Test 2: cuenta call-sites de `applyImmediateFailure(this.state` en el archivo entero — DEBE ser exactamente 2 (uno en applyResultToSession + uno en matchPickRight).

**Garantía de no-regresión**: si alguien (incluido un futuro yo) quita el guard, añade un 3er call-site, o renombra el flag, los tests fallan inmediatamente. Robustez funcional cubierta por **UAT humano paso 8** del 03-03 (`localStorage.getItem('italianCourse.v1')` se observa modificado SOLO la primera vez tras N fallos consecutivos en match).

**Reportable W3 (revisión iteración 1) = verificación textual + grep, no instancia real.**

### W5 UI behaviors smoke (revisión iteración 1) — misma estrategia

Idéntico análisis aplicado para los tests W5 smoke de `matchSelectLeft` + `matchPickRight`: instanciar el factory bajo node es frágil. Tests adoptados:

1. Presencia de los 6 identificadores match en `app.js` (matchSelectLeft, matchPickRight, flashMatchPair, matchLeftIsConsumed, matchRightIsConsumed, letterFor).
2. handleSessionKey contiene la rama de letras a-i (`key >= 'a' && key <= 'i'`) Y la invocación `matchPickRight(idx)`.
3. initSubStateForExercise contiene `exercise.type === 'match'` Y `this.matchLeft = fisherYates(...)` Y `this.matchRight = fisherYates(...)`.

**Reportable W5 (revisión iteración 1) = verificación textual + grep, no instancia real.** Behavioural mid-sesión cubierta por UAT humano pasos 4-7 del 03-03 (click+teclado, validación instantánea D-60, D-66 duplicados, D-61 exploit-proof tras primer fallo).

### Forced last pair behaviour — confirmado NO auto-completar

UI-SPEC + plan exigen que `matchPickRight` invoque `applyResultToSession` SOLO cuando `matchPairsConsumed.length === pairs.length`. El usuario hace el último click manualmente, igual que las parejas anteriores. Implementación verificada por inspección visual del código en `matchPickRight` rama correct.

## Stub Removal — confirmación

El acceptance criterion crítico era: `grep -F 'aún no soportado' src/data/schema-validator.js` retorna nada después de Task 1. Verificado en el self-check inicial de Task 1, y mantenido tras Task 2:

```bash
$ grep -F 'aún no soportado' src/data/schema-validator.js
$ echo $?
1   # No match — el stub message fue completamente erradicado.
```

Además los tests verifican explícitamente la erradicación: el test "el mensaje stub previo 'aún no soportado' ya NO aparece para match (impl real reemplaza al stub)" envía un match malformado y asserta que NINGÚN error tiene `/aún no soportado/` en su `.reason`.

## applyImmediateFailure call-site count — confirmación

Acceptance criterion: arquitectura clara con exactamente 2 call-sites. Verificado:

```bash
$ grep -c "applyImmediateFailure(this.state" src/screens/app.js
2
```

Localización exacta:
- **Call-site #1 (decisión final, 3 tipos)**: `applyResultToSession(ex, correct)` rama incorrect. Cubre multi-choice (`sessionSelectOption`), word-buttons (`wordButtonsCheck`), y match-cuando-completas-todas-las-parejas (`matchPickRight` rama correct branch al alcanzar `length === pairs.length` con `matchHadFailure=true`).
- **Call-site #2 (primer fallo match)**: `matchPickRight` rama incorrect dentro del guard `if (!this.matchHadFailure)`.

El test W3 asserta `matches.length === 2`. Cualquier regresión (3 call-sites por copy-paste mal hecho, o 1 por refactor que centralizó incorrectamente) hace fallar el test al instante.

## Forced last pair — confirmación

D-63 + UI-SPEC línea 268 dicen "NO auto-completar". Inspección del código en `matchPickRight` rama correct:

```js
if (result.correct === true) {
  this.matchPairsConsumed = [...this.matchPairsConsumed, { leftIdx, rightIdx, pairIdx: result.pairIdx }];
  this.matchSelectedLeftIdx = null;
  if (this.matchPairsConsumed.length === ex.payload.pairs.length) {
    this.applyResultToSession(ex, !this.matchHadFailure);
  }
}
```

El ejercicio se cierra SOLO cuando el usuario completa todas las parejas vía clicks/teclas. NO hay rama "si quedan 1 izq + 1 der → auto-pareja". Coherencia mecánica preservada.

## match-flash 300ms — recomendación post-UAT

Sin runtime browser, no puedo evaluar si 300ms se siente lento/rápido. Recomendación al UAT 03-03:

- **Si 300ms se siente largo** (usuario quiere clickear la siguiente pareja inmediatamente): reducir a 250ms o 200ms en `styles.css` (1 línea + 1 línea en `flashMatchPair` setTimeout). Cap WCAG inferior NO se viola (1 flash sigue siendo «1»).
- **Si 300ms se siente corto** (usuario apenas ve el rojo antes de que se quite): incrementar a 400-500ms. NO superar 600ms (al borde del threshold WCAG 2.3.1 si hubiera múltiples flashes consecutivos por clicks muy rápidos — pero con el guard `cancelMatchFlash()` previo, eso no debería pasar).

Si UAT no reporta fricción, mantener 300ms (UI-SPEC normativo).

## Reservas para Plan 03-03 (UAT)

El plan instala la lista completa de verificaciones manuales que 03-03 debe pasar:

### 4 criterios ROADMAP de Phase 3

1. **Tipo word-buttons operativo end-to-end** — cubierto por 03-01 sin UAT explícito; UAT 03-03 lo verifica en una sesión real.
2. **Tipo match operativo end-to-end con cascada D-61 exploit-proof** — cubierto por 03-02 estructuralmente (tests W3 + W5 + ejercicios seed avere-200..202); UAT 03-03 lo verifica con DevTools + cierre de pestaña.
3. **Sesión mixta de los 3 tipos sin errores** — UAT humano necesario (reintentar Repaso 20 sobre Avere hasta que la mezcla aleatoria incluya los 3 tipos).
4. **Sesión 20 sin necesidad de ratón incluyendo word-buttons Y match** — UAT humano necesario (cubre SESSION-06 D-72 foco al body + 18 teclas funcionales).

### 11 verificaciones humanas del Task 2 `<human-check>`

(Listadas literalmente en el plan; UAT 03-03 las consumirá una por una con checkboxes.)

1. `npx serve` arranca + home muestra Avere con 17 ejercicios.
2. Sin errores en `#error-banner`.
3. Repaso 20 sobre Avere incluye los 3 tipos en algún punto.
4. Visual: grid 1fr 1fr + sufijos `¹..⁹`/`ᵃ..ⁱ` + outline azul al seleccionar izq + muted tras correct + parpadeo rojo tras incorrect.
5. Teclado: `1`→outline izq; `a` con número → valida; `a` sin número → ignored; otro número antes de letra → reemplaza.
6. **D-61 exploit-proof**: DevTools localStorage muestra `status:'no-hecha', streakDays:0` INMEDIATAMENTE tras primer parpadeo; cerrar pestaña + recargar → categoría sigue en `no-hecha`.
7. **D-66 duplicados** (avere-202): `lui→primer 'ha'` Y `lui→segundo 'ha'` ambos funcionan; cualquier orden válido completa el ejercicio.
8. **Idempotencia Pitfall #2**: 3 fallos consecutivos → DevTools localStorage se escribe SOLO la primera vez (write count observable en Application panel).
9. **Sesión mixta**: 3 tipos en una sola pasada sin errores en consola; summary final muestra delta correcto.
10. **Sin ratón** (parcial — UAT 03-03 completo): 20 ejercicios completados solo con teclado.
11. Pulsar `1` en home tras la sesión → no hace nada (cleanup automático del listener via outer x-if D-72).

## Lecciones aprendidas

1. **Patrón "test.skip condicional con detección runtime"**: el `{ skip: matchPickRightExists() ? false : '<razón>' }` evita la fricción "Task N añade tests; Task N+1 los activa editando el archivo de tests". Patrón reusable para futuras phases con waves verticales que tienen interdependencias parciales entre commits.

2. **Comentarios docs cuentan como código bajo grep ACs estrictos**: el segundo Run del grep `grep -F "03-02" src/screens/app.js` detectó 2 referencias en comentarios docs sobrevivientes del 03-01. Lección reusable: SIEMPRE buscar el plan ID en el archivo completo (incluyendo JSDoc) tras la implementación, antes del commit. Si emerge en docs, reformular sin perder semántica.

3. **2 call-sites como invariante arquitectónica testeable**: la idea de contar `applyImmediateFailure(this.state` con grep para garantizar que solo hay 2 ubicaciones (y NO 1 ni 3) es un patrón reusable de "arquitectura testable" — más robusto que un comment "esto se llama una sola vez". Si alguien añade un 3er call-site por refactor, el test falla inmediatamente.

4. **Retorno enriquecido del registry es OK con justificación funcional**: la asimetría entre `multipleChoice.grade()→boolean` y `match.grade()→{correct, pairIdx?}` no es inconsistencia — es necesidad D-66. Documentarla en el JSDoc del handler (y referenciarla en el registry `index.js`) hace que la asimetría sea legible y mantenible.

## Self-Check

Comprobaciones automatizadas tras escribir SUMMARY:

### Files exist
- `src/exercise-types/match.js` — **FOUND**
- `tests/exercise-types.test.js` — **MODIFIED** (con 47 tests totales, 24 nuevos en 03-02)
- `src/data/schema-validator.js` — **MODIFIED** (validateMatchPayload impl real, comentarios actualizados)
- `src/screens/app.js` — **MODIFIED** (+199 líneas: 5 métodos match + rama init + ramas handleSessionKey + comentarios sin '03-02')
- `src/exercise-types/index.js` — **MODIFIED** (registry con 3 entradas finales)
- `content/exercises/avere.json` — **MODIFIED** (3 ejercicios match añadidos)
- `index.html` — **MODIFIED** (sub-template match)
- `styles.css` — **MODIFIED** (.match-* + @keyframes)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-02-SUMMARY.md` — **FOUND** (este archivo)

### Commits exist
- `f9e400e` Task 1 — **FOUND** (`git log --oneline | grep f9e400e`)
- `f4000b7` Task 2 — **FOUND**

### Tests green
- `node --test tests/*.test.js` exit 0, 105/105 verdes (81 baseline Phase 1+2+03-01 + 24 nuevos en 03-02). 0 skipped, 0 failed.

### Stub message erradicado
- `grep -F 'aún no soportado' src/data/schema-validator.js` retorna nada. Stub completamente reemplazado.

### Call-sites correctos
- `grep -c "applyImmediateFailure(this.state" src/screens/app.js` retorna 2. Arquitectura correcta.

### Identificadores match presentes
- `matchSelectLeft(`, `matchPickRight(`, `flashMatchPair(`, `matchLeftIsConsumed(`, `matchRightIsConsumed(`, `letterFor(` todos presentes en `src/screens/app.js`.

### Sin literales '03-02' en código de producción
- `grep -F "03-02" src/screens/app.js` retorna nada.

## Self-Check: PASSED

## Next Phase Readiness

Plan 03-03 (UAT) listo para empezar:
- 17 ejercicios Avere (12 multi + 2 word-buttons + 3 match — uno con duplicados D-66).
- Los 3 tipos finales operativos end-to-end (handler + render + grading + cascada).
- Cascada D-61 exploit-proof estructuralmente — verificable con DevTools localStorage en UAT.
- 18 teclas cubiertas (1-9 + a-i + Enter + Space + Backspace) con cleanup automático.
- 105 tests dominio + UI smoke verdes — base sólida para la regresión en UAT.

Phase 3 cierra (todos los criterios ROADMAP + EXTYPE-02/EXTYPE-03/SESSION-06) cuando 03-03 confirma manualmente.

---
*Phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado*
*Plan: 02*
*Completed: 2026-05-23*
