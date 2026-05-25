---
phase: 06-polish-ux-post-sesion-reiniciar-y-review-errores
plan: 01
subsystem: ui-session-screen
tags: [ux-01, repaso, restart, mvp-slice, vertical-slice]
requires:
  - Phase 1 buildSession (src/domain/session.js)
  - Phase 2 D-54 cascada inmediata persistida (applyImmediateFailure)
  - Phase 2 D-09 monotonicidad de exerciseStats
  - Phase 3 sub-estados word-buttons + match + initSubStateForExercise
  - Phase 4 categories.json 6 entradas + 232 ejercicios reales
provides:
  - UX-01 botón "Reiniciar ejercicios" funcional end-to-end en pantalla session durante Repaso 20
  - Handler restartRepaso() reusable como modelo para futuros resets de sub-estado
  - .button-row pattern aplicado al session screen bajo <hr> (junto a "← Volver al home")
  - 3 smoke tests dominio de buildSession invariantes restart
affects:
  - src/screens/app.js (handler nuevo)
  - index.html (button-row session screen)
  - tests/domain.test.js (3 nuevos tests)
tech_stack:
  added: []
  patterns:
    - "Handler factory appShell duplicando ~15 líneas de startSession sin refactor a helper común (D-104)"
    - ".button-row con flex: 1 reusado del picker/backup/home"
    - "x-show='sessionMode === \"repaso\"' como single source of truth de visibilidad del botón (D-100)"
    - "Guard defensivo doble: x-show en template + early return en handler"
    - "Cancelación defensiva de timers (cancelAutoAdvance + cancelMatchFlash) PRIMERO en el handler (pattern S-2)"
key_files:
  created: []
  modified:
    - src/screens/app.js
    - index.html
    - tests/domain.test.js
decisions:
  - "D-100 honrado: botón visible solo cuando sessionMode === 'repaso' (x-show en template)"
  - "D-101 honrado: re-llama buildSession con MISMAS categoryIds; descarta aciertos no-comprometidos; preserva fallos D-54 ya persistidos (NO saveState en el handler)"
  - "D-102 honrado: reset directo en 1 clic, sin requestConfirm, sin animación de confirmación"
  - "D-103 honrado: .button-row bajo <hr> con Reiniciar (izq) + Volver al home (der), clase Pico secondary"
  - "D-104 honrado: handler restartRepaso() en factory appShell, duplicación intencional de ~15 líneas de startSession sin refactor a helper común (recomendación se mantiene: refactor solo si emerge un 3er call-site)"
  - "D-112 honrado: 06-01 entrega UX-01 como vertical slice independiente — el autor puede usar el botón el día 1 del plan"
metrics:
  duration: ~30 min
  completed_date: 2026-05-25
  tasks: 3
  task_commits: 2
  files_modified: 3
  tests_total: 148
  tests_added: 3
  tests_baseline: 145
  uat_outcome: 5/5 PASS
---

# Phase 6 Plan 01: Reiniciar (UX-01) Summary

## One-liner

Botón "Reiniciar ejercicios" en la pantalla session de Repaso 20 que re-llama `buildSession` con las MISMAS categorías en 1 clic, descartando aciertos no-comprometidos y preservando fallos D-54 ya persistidos — sin saveState, sin confirmación, sin animación.

## What Was Built

**Vertical slice MVP (UX-01) entregado end-to-end:** el autor puede arrancar `npx serve`, lanzar un Repaso 20, fallar deliberadamente a mitad (cascada D-54 inmediata se persiste), y pulsar "Reiniciar ejercicios" para rearrancar la sesión con las MISMAS categorías en 1 clic — sin perder los fallos persistidos y sin abandonar la pantalla session.

### Components

1. **`restartRepaso()` handler en el factory `appShell`** (`src/screens/app.js`, línea ~459):
   - Guard defensivo de entrada: `if (this.sessionMode !== 'repaso') return;` (D-100 / D-104)
   - Cancelaciones defensivas PRIMERO: `cancelAutoAdvance()` + `cancelMatchFlash()` (pattern S-2 — evita timeouts huérfanos disparando `sessionAdvance` sobre state ya reseteado)
   - Reconstrucción del pool: `Object.values(this.content.exerciseById)`
   - Re-sample: `buildSession(this.pickerCheckedCategoryIds, allExercises, this.state, 20, 'repaso')` — hard-coded `'repaso'`, hard-coded `20`, hard-coded modo Repaso (D-100 no acepta test-completo)
   - Reset de sub-estado idéntico al patrón de `startSession()` (sessionExerciseIds + cursor + results + selectedIndex + feedback + word-buttons bank/answer + match Left/Right/SelectedLeftIdx/PairsConsumed/HadFailure)
   - **Explícitamente NO toca:** `sessionMode`, `pickerCheckedCategoryIds`, `currentScreen`, `state`, `localStorage` (D-101 + D-09 + D-54 invariantes preservados)
   - **Explícitamente NO introduce** `matchFirstWrongPair` (prop reservado para plan 06-02; el handler 06-02 añadirá la línea cuando introduzca el prop)
   - Si `result.exerciseIds.length > 0`, inicializa el sub-estado del primer ejercicio nuevo vía `initSubStateForExercise(firstEx)`; si vacío, el getter `sessionCurrentExercise` ya devuelve null defensivamente

2. **`.button-row` en `index.html` session screen** (bajo `<hr>`, justo antes del cierre del bloque session):
   - 2 botones lado a lado con `flex: 1` heredado, clase Pico `secondary`
   - **Izquierda:** `<button class="secondary" x-show="sessionMode === 'repaso'" @click="restartRepaso">Reiniciar ejercicios</button>`
   - **Derecha:** el existente `<button class="secondary" @click="requestReturnToHome">← Volver al home</button>` (movido dentro del nuevo `.button-row`, intacto en clase + handler + texto)
   - **NO** `aria-label`, **NO** `title` tooltip, **NO** `disabled` binding, **NO** atajo de teclado (UI-SPEC §Keyboard shortcut "Sin atajo de teclado en v1")
   - **NO** `<hr>` adicional entre los botones (el `<hr>` previo se mantiene tal cual)
   - El texto "Reiniciar ejercicios" es literal en template (NO `x-text`, NO interpolación desde JSON) — T-02-01 anti-XSS reforzado

3. **3 smoke tests dominio en `tests/domain.test.js`** (describe block "Phase 6 — restartRepaso smoke (UX-01)" añadido al final):
   - **Test 1:** `buildSession con state post-cascada D-54 preserva categoryIds y produce sample válido` — fixture con state simulado post-D-54 (`p1` marcado como fallado, `prep` con status `no-hecha`, streak 0), invoca buildSession con seed determinista, assertea que ambas categorías están presentes en el sample y que no hay duplicados.
   - **Test 2:** `buildSession llamado dos veces con misma seed produce el mismo sample` — smoke determinismo del re-sampling post-restart (condición necesaria para reproducir comportamiento).
   - **Test 3:** `buildSession con pool reducido a 1 ejercicio devuelve actualSize 1` — edge cuando una categoría tiene 1 solo ejercicio, el reset no fuerza sample vacío.

### Test counts

- **Baseline pre-plan:** 145 verdes
- **Nuevos:** 3
- **Total final:** 148/148 verdes, exit 0
- Output del runner contiene literal `"Phase 6 — restartRepaso smoke (UX-01)"`.

## How It Was Built

### Task 1 (commit `2c93f7c`): Handler + botón cableado

Ejecutado en orden:
1. Lectura de los rangos prescritos en PATTERNS.md §1: `startSession` líneas 367-412 como analog primario, `cancelAutoAdvance`/`cancelMatchFlash` para el pattern S-2, `initSubStateForExercise` para el reset del primer ejercicio.
2. Inserción del nuevo método `restartRepaso()` en el factory `appShell` justo después de `startSession()` (agrupamiento natural de handlers de sesión).
3. Modificación del bloque final del session template en `index.html`: el `<button>← Volver al home</button>` suelto se movió dentro de un `<div class="button-row">` nuevo, precedido por `<button class="secondary" x-show="sessionMode === 'repaso'" @click="restartRepaso">Reiniciar ejercicios</button>`.
4. Verificación: `node --test tests/*.test.js` exit 0 sobre los 145 baseline (sin tests nuevos en Task 1 — esos llegan en Task 2).
5. Grep verifications: `restartRepaso` en src/screens/app.js (1 match), `@click="restartRepaso"` en index.html (1 match), `matchFirstWrongPair` en src/screens/app.js (0 matches — reservado a 06-02).

### Task 2 (commit `0ef8200`): Smoke tests

Ejecutado en orden:
1. Lectura del estilo de tests existentes en `tests/domain.test.js` + helper `seededLcg` en `tests/util/seeded-rng.js` + firma exacta de `buildSession` en `src/domain/session.js`.
2. Añadido un nuevo describe block `'Phase 6 — restartRepaso smoke (UX-01)'` al final del archivo, sin reordenar nada anterior.
3. 3 tests síncronos con `node:test` + `node:assert/strict`, sin `describe.skip`, sin mock-timers.
4. Verificación: `node --test tests/*.test.js` → 148 tests, exit 0, output incluye el literal del describe block.

### Task 3 (UAT humano, "approved 5/5")

El autor verificó los 5 UATs en `http://localhost:3000` tras `npx serve`:
- **UAT-1 (truth 1):** PASS — `.button-row` visible bajo `<hr>` con "Reiniciar ejercicios" (izq) y "← Volver al home" (der), ambos secondary Pico, repartiendo el ancho ~50/50 por `flex: 1`.
- **UAT-2 (truth 3):** PASS — En Test completo el botón Reiniciar NO aparece; solo "← Volver al home" ocupa el `.button-row` al 100%.
- **UAT-3 (truth 4 + truth 2):** PASS — Tras fallar deliberadamente y verificar en DevTools que `categoryProgress[<cat>].status === 'no-hecha'` y `streakDays === 0` (cascada D-54 ya persistida), pulsar Reiniciar: cursor salta a "Ejercicio 1 / 20", aparece ejercicio nuevo (re-sample), sin confirmación inline, sin flash de confirmación, fallo D-54 preservado en localStorage, `exerciseStats` NO bumpeado por los aciertos no-comprometidos.
- **UAT-4 (truth 5 — edge defensivo):** PASS — Reiniciar al instante sin haber respondido nada: reset limpio en 1 clic, sin console error, pantalla se mantiene en session.
- **UAT-5 (atajos):** PASS — Teclas 1-4 + Enter + Space funcionan idénticas a pre-Phase 6; tecla 'R' NO dispara restart (UI-SPEC §Keyboard shortcuts honrado); Ctrl+R sigue recargando la pestaña.

**Verdicto: 5/5 PASS.**

## Deviations from Plan

**None — plan ejecutado exactamente como escrito.**

Los pequeños tipos de "ajuste fino" que el plan listaba como Claude's discretion (etiqueta del botón, exacta posición de inserción del handler dentro del factory) se resolvieron por el path estándar del PATTERNS.md sin cambios:
- Etiqueta: `"Reiniciar ejercicios"` (default del plan, NO abreviado — cabe holgado en `.button-row` flex: 1 50%).
- Posición del handler: inmediatamente después de `startSession()` (agrupamiento natural de handlers de sesión, lectura facilitada).
- Posición del `.button-row`: bajo el `<hr>` existente, sin `<hr>` adicional entre los botones.

## Auth Gates Encountered

**Ninguno.** El plan no toca I/O, red, ni autenticación.

## Decisions Honored

- **D-100** (botón solo en Repaso 20): doble defensa — `x-show="sessionMode === 'repaso'"` en template + early return `if (this.sessionMode !== 'repaso') return;` en handler. Verificado en UAT-2.
- **D-101** (descartar aciertos + preservar fallos D-54 + re-llamar buildSession): `restartRepaso` NO contiene `saveState()` ni `this.state = ...` ni mutación de `categoryProgress`/`exerciseStats`. Verificado en UAT-3 paso 6 (DevTools muestra fallo D-54 intacto post-restart + `exerciseStats.timesShown` sin bump).
- **D-102** (reset directo 1 clic, sin requestConfirm): el handler no invoca `requestConfirm()`. Verificado en UAT-3.
- **D-103** (.button-row bajo <hr>, clase Pico secondary, posición izq=Reiniciar / der=Volver): exactamente como UI-SPEC § Visual wireframes. Verificado en UAT-1.
- **D-104** (handler nuevo, duplicación intencional de ~15 líneas de startSession): no se introdujo helper común. La recomendación se mantiene — refactor solo si emerge un 3er call-site.
- **D-09** (monotonicidad de exerciseStats): el handler NO toca `exerciseStats`. Verificado en UAT-3 paso 6 (timesShown idéntico pre/post-restart sobre un ejercicio acertado y descartado).
- **D-54** (cascada inmediata persistida intocable): el handler NO modifica `categoryProgress`. Verificado en UAT-3 paso 6.
- **D-112** (Phase 6 = 2 plans secuenciales): 06-01 entrega UX-01 como vertical slice independiente. El autor puede usar el botón el día 1 del plan (verificado por el propio UAT humano).

## Pitfalls Avoided

1. **`matchFirstWrongPair` NO introducido en 06-01** — el prop es propiedad exclusiva de 06-02. `grep -c 'matchFirstWrongPair' src/screens/app.js` = 0 verificado.
2. **No `saveState()` en `restartRepaso`** — los aciertos no-comprometidos se descartan sin tocar localStorage, coherente con SESSION-08 (abandono Repaso descarta por defecto) y preservando los fallos D-54 que ya están en disco.
3. **Cancelación de timers PRIMERO** — `cancelAutoAdvance` + `cancelMatchFlash` antes de cualquier reset evita que un `setTimeout` huérfano dispare `sessionAdvance()` sobre un cursor ya reseteado a 0 (pattern S-2 obligatorio, threat T-06-01-02 mitigado).
4. **T-02-01 (anti-XSS):** texto del botón literal en template, NO interpolado vía `x-text`.
5. **Apóstrofes ASCII (CONT-06):** no se introdujeron apóstrofes typográficos en el código (todos los strings nuevos usan `'` ASCII U+0027).
6. **No alteración de `currentScreen`:** el restart opera dentro de la pantalla session sin transición — coherente con la promesa del UAT Phase 4 ("1 clic sin cambiar de pantalla").
7. **Doble defensa botón visible:** `x-show` en template + guard en handler. Si alguien invoca `restartRepaso()` desde la consola con `sessionMode === 'test-completo'`, el handler retorna sin tocar nada (threat T-06-01-03 mitigado).

## Known Stubs

**Ninguno.** El plan entrega vertical slice completa — botón usable, handler implementado, sub-estado correcto, tests cubriendo el dominio.

## Threat Flags

**Ninguno introducido.** Phase 6 plan 01 no añade trust boundaries nuevas — toca código local sin red, sin I/O nuevo, sin dependencias nuevas. La superficie de ataque (single-user, 100% local, sin red) es idéntica a la pre-plan.

## Reserved for Plan 06-02

- **`matchFirstWrongPair` sub-estado** (D-107): será añadido por 06-02 en el factory `appShell`, en `resetSession()`, en `matchPickRight` (capturarlo `null` ↔ `{left, right}` en el primer fallo), y en `restartRepaso()` (el plan 06-02 modificará el handler de 06-01 para añadir `this.matchFirstWrongPair = null;` en el bloque de reset de sub-estados de match).
- **Extensión del shape de `sessionResults` con `userAnswer`** (D-105/D-106): 06-02 extiende la firma de `applyResultToSession(ex, correct, userAnswer)` y los 3 call-sites.
- **Sección "Errores cometidos" en el resumen** (D-108/D-109): nuevo `<section>` en el summary template tras `<ul.summary-delta>`.
- **Migración `migrate3to4`** (D-111): bump `CURRENT_SCHEMA_VERSION` a 4 + backfill defensivo de `userAnswer = null` en `inFlightTest.answers` pre-existentes.

## Lessons Learned

- **Patrón `.button-row` bajo `<hr>` consolidado para 4 ubicaciones** (home, picker, backup, ahora session). Esta es la 4ª aplicación; el patrón está suficientemente consolidado para considerarse normativo cuando se necesitan ≥2 botones secundarios al fondo de una pantalla.
- **Duplicación intencional `startSession` ↔ `restartRepaso` aceptable en v1**: la abstracción a un helper común `_resetSessionSubState(result)` ahorraría ~15 líneas a costa de un punto de indirección extra. Recomendación reafirmada: NO refactorizar hasta que emerja un 3er call-site (e.g., si en futuras fases hay un "retry incorrect" en summary screen que también necesite re-sample).
- **Smoke tests con `seededLcg` como helper estándar para dominio**: el patrón "fixture mínimo + seed determinista + assertions de invariantes" sigue siendo la herramienta correcta para tests de dominio puro (`src/domain/*`) sin necesidad de mocks o JSDOM.
- **UAT humano 5/5 PASS confirma que tasks pequeñas (~15 líneas handler + ~5 líneas HTML + 3 tests) son MVP slices defensibles** — el autor pudo usar la feature el día 1 del plan.

## Self-Check: PASSED

**Files modified (3 esperados, 3 verificados):**
- `[ FOUND ] src/screens/app.js` — `restartRepaso()` declarado (1 match), `matchFirstWrongPair` NO presente (0 matches, reservado para 06-02).
- `[ FOUND ] index.html` — `@click="restartRepaso"` (1 match), `<div class="button-row">` añadido en session screen.
- `[ FOUND ] tests/domain.test.js` — describe block `"Phase 6 — restartRepaso smoke (UX-01)"` en línea 364.

**Commits (2 task commits + 1 SUMMARY commit esperados):**
- `[ FOUND ] 2c93f7c` — feat(06-01): add restartRepaso handler and button (UX-01)
- `[ FOUND ] 0ef8200` — test(06-01): add restartRepaso smoke tests for buildSession invariants
- `[  PENDING ] docs(06-01): SUMMARY` — commit que materializa este archivo, creado inmediatamente tras este write.

**Test suite:**
- `[ PASS ] node --test tests/*.test.js` → 148/148 verdes, exit 0, 0 skipped, 0 failed. Baseline 145 + 3 nuevos.

**Plan-level verification (8 success criteria del PLAN.md):**
- [x] `grep -n 'restartRepaso' src/screens/app.js | wc -l` ≥ 1 (handler declarado)
- [x] `grep -n '@click="restartRepaso"' index.html | wc -l` ≥ 1 (botón cableado)
- [x] `grep -n '<div class="button-row">' index.html` muestra el nuevo .button-row en session screen
- [x] `grep -c 'matchFirstWrongPair' src/screens/app.js` == 0 (reservado a 06-02)
- [x] `node --test tests/*.test.js` reporta 148 tests verdes (145 baseline + 3 nuevos) + exit 0
- [x] Output del runner contiene literal `"Phase 6 — restartRepaso smoke (UX-01)"`
- [x] UAT humano 5/5 PASS con cita textual del autor: "approved 5/5"
- [x] Solo 3 archivos modificados (`files_modified` del frontmatter)

**Success criteria del plan (6 puntos):**
1. [x] El autor practica un Repaso 20, falla a mitad, pulsa "Reiniciar ejercicios" sin volver al home (4 clicks → 1 click verificado por UAT humano).
2. [x] La cascada D-54 ya persistida se preserva tras el restart (UAT-3 paso 6 verificó en DevTools).
3. [x] Los 3 smoke tests nuevos verifican los invariantes dominio del re-sampling.
4. [x] El botón está oculto en Test completo (UAT-2 verificó visualmente).
5. [x] 145/145 baseline + 3 nuevos = 148/148 tests verdes. Cero regresiones.
6. [x] Vertical slice MVP entregado: la capacidad UX-01 está usable end-to-end por el autor.
