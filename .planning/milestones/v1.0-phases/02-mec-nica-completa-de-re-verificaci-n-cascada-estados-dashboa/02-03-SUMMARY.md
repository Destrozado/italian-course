---
phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
plan: 03
subsystem: ui
tags:
  - alpine
  - factory-plano
  - currentScreen
  - dashboard
  - picker
  - session-migration
  - confirm-inline
  - boot-regression
  - state-v2
dependency_graph:
  requires:
    - 02-01 (state v2: categoryProgress, dailyLog, schemaVersion)
    - 02-02 (applySessionResult ampliado + applyNewExerciseRegression + buildFullTest)
    - 01-02 (sessionScreen Alpine + Promise-handoff race-condition fix)
  provides:
    - "appShell factory plano (`src/screens/app.js`)"
    - "currentScreen switch entre home/picker/session/summary"
    - "Home dashboard con tabla densa de categorías (5 columnas)"
    - "Picker compartido Repaso/Test completo con labels dinámicos"
    - "Sesión multiple-choice migrada al appShell"
    - "Boot pipeline ampliado con applyNewExerciseRegression (DOMAIN-06)"
    - "categoryIds derivado dinámicamente de content/categories.json"
    - "Confirmación inline reusable (D-27 base para D-43/D-44 de Plan 02-04)"
    - "Patrón canónico: x-if guard + getter defensivo contra unmount tick"
  affects:
    - 02-04 (le toca poblar summaryDelta + persistencia in-flight Test completo + banner home)
tech_stack:
  added:
    - "(ninguna nueva dependencia — solo cambios internos sobre Alpine 3.15.12 + Pico 2.1.1)"
  patterns:
    - factory plano (D-25): props con prefijo de área en un único objeto
    - currentScreen switch (D-24): templates x-if mutuamente excluyentes
    - confirmDialog reusable (D-27): patrón {message, confirmLabel, cancelLabel, onConfirm}
    - flex wrapper custom para botones grandes (NO Pico role="group")
    - getter defensivo + x-if guard contra unmount tick (UAT 02-03 → patrón canónico)
key_files:
  created:
    - src/screens/app.js (590 LOC; factory plano `appShell`)
  modified:
    - index.html (4 templates x-if + confirmDialog inline + .home-actions wrapper)
    - styles.css (badges + picker-warning + confirm-inline + home-actions)
    - src/main.js (registra appShell + deriva categoryIds + applyNewExerciseRegression)
  deleted:
    - src/screens/session.js (lógica migrada íntegra a app.js con prefijo session*)
decisions:
  - "Patrón canónico del proyecto: ante cualquier `<template x-if=\"X\">` cuyos bindings internos lean propiedades anidadas de un recurso (`X.foo.bar`), aplicar SIEMPRE doble defensa — getter que devuelve `null` cuando el recurso no existe + guard `&& sessionCurrentExercise` (o equivalente) en el x-if. Alpine reevalúa los bindings UNA VEZ con el state nuevo antes de desmontar el template, y `undefined.foo` lanza TypeError visible en consola."
  - "Para botones grandes lado a lado en home: NO usar `role=\"group\"` de Pico (une los bordes y parece un control único). En su lugar, wrapper custom con `display: flex; gap: 1rem` + `flex: 1` en los hijos. Mantiene el estilo Pico por defecto pero con separación visible."
  - "Patrón establecido en `applyNewExerciseRegression`: la función devuelve el MISMO objeto (===) si no hubo cambios, o uno NUEVO si hubo regresión. main.js compara `state !== state0` por identidad para decidir si persistir (evita writes innecesarios al boot)."
  - "El Test completo NO requiere confirmación al volver al home (porque siempre persistirá vía inFlightTest en Plan 02-04). Solo el Repaso mid-sesión la requiere (D-27)."
metrics:
  duration: "~4h (incluye UAT humano round 1 + 2 fixes UAT + UAT round 2 + 2 design refinements)"
  completed_date: "2026-05-23"
  files_changed: 6 (1 created, 4 modified, 1 deleted)
  commits: 11
  tests_passing: 57/57 (dominio; UI no se testea con node --test todavía)
---

# Phase 02 Plan 03: Vertical slice UI — Home dashboard + Picker + Session migrada Summary

Vertical slice de UI: un único `appShell` Alpine factory plano que gestiona las cuatro pantallas (home, picker, session, summary stub) con `currentScreen` switch, lleva la lógica de sesión Phase 1 migrada con prefijo `session*`, e integra el state v2 + cascada/promociones de Plans 02-01 y 02-02 al cerrar sesión. Boot ahora deriva `categoryIds` desde `content/categories.json` y aplica `applyNewExerciseRegression` (DOMAIN-06) antes de resolver `appDataReady`.

## What was built

| Pieza | Detalles |
| --- | --- |
| **`src/screens/app.js` NUEVO** | Factory plano `appShell(appDataReady)` de 590 LOC. Props con prefijo de área (`picker*`, `session*`, `summary*`, `confirmDialog`), métodos para navegación entre 4 pantallas, helpers `requestConfirm`/`resetSession`, lógica de sesión migrada íntegra de Phase 1 (renombrada `session*`), getters reactivos para la tabla home y los labels dinámicos del picker. |
| **`index.html` reescrito** | El `<main>` ahora contiene `<div x-data="appShell">` con cuatro `<template x-if>` mutuamente excluyentes (home/picker/session/summary) + `<div class="confirm-inline">` reusable al final del x-data root. Home tiene tabla densa de 5 columnas y dos botones grandes. Picker tiene checkboxes + aviso inline Test completo + labels dinámicos. Session migrada con prefijo `session*` en bindings. CDN SRI Pico/Alpine preservados sin cambios. |
| **`styles.css` ampliado** | Añadidos `.badge-no-hecha`/`.badge-hecha`/`.badge-dominada` con CSS vars Pico + fallback hex, `.picker-warning` para el aviso Test completo, `.confirm-inline` para el panel discreto (posición fixed top/right, z-index 1000), y `.home-actions` (flex wrapper) tras UAT. |
| **`src/main.js` refactorizado** | Deriva `categoryIds` dinámicamente de `content/categories.json` (en vez del hard-coded `['avere']`), aplica `applyNewExerciseRegression` antes de `resolveAppData`, persiste sólo si la regresión cambió algo (`state !== state0`), registra `appShell` en vez de `sessionScreen`. Patrón síncrono `alpine:init` al top-level del módulo PRESERVADO (UAT 01-02 race-condition fix). |
| **`src/screens/session.js` ELIMINADO** | Toda su lógica vive ahora en `src/screens/app.js` como métodos `session*`. `grep -r screens/session` confirma 0 referencias residuales. |

### Estructura del HTML de Plan 02-03

```
<div x-data="appShell" x-init="init()" x-cloak>
  <template x-if="currentScreen === 'home'"> ... tabla densa + 2 botones grandes ... </template>
  <template x-if="currentScreen === 'picker'"> ... checkboxes + label dinámico ... </template>
  <template x-if="currentScreen === 'session' && sessionCurrentExercise"> ... multiple-choice ... </template>
  <template x-if="currentScreen === 'summary'"> ... stub Plan 02-04 ... </template>
  <div x-show="confirmDialog" class="confirm-inline"> ... panel reusable D-27/D-43/D-44 ... </div>
</div>
```

## Verification

**Domain tests:** `node --test tests/*.test.js` → 51/51 verdes tras los fixes UAT (sin regresión).

**UAT humano 7/7 aprobado:**

1. **Boot + Home dashboard (SESSION-01):** página carga sin errores rojos en consola, título visible, dos botones grandes lado a lado, tabla con 5 columnas en orden correcto, fila avere con badge `●` gris, racha `0 d`, ejercicios `12`, última vez `—`.
2. **Picker Repaso (SESSION-02):** cabecera `Repaso de 20 ejercicios`, checkbox avere desmarcado por defecto (D-34), botón `Empezar` disabled cuando pool=0, label cambia a `Empezar repaso (12 ejercicios — todos los disponibles)` al marcar, Seleccionar todo / Quitar todo funcionan, volver al home directo (sin confirmación porque no estamos en session).
3. **Picker Test completo (SESSION-03):** cabecera `Test completo`, aviso inline `⚠ Test completo — 12 ejercicios sin tope. Se puede reanudar si lo cierras a medias.` aparece al marcar, label cambia a `Empezar test completo (12 ejercicios)`.
4. **Sesión Repaso completa:** progreso `Ejercicio 1 / 12` arriba, multiple-choice funciona igual que Phase 1 (verde sobre correcto + auto-avance 600ms, rojo + "Siguiente" sobre incorrecto), al completar los 12 vuelve a home, localStorage refleja `schemaVersion: 2` + `categoryProgress.avere` poblado.
5. **Cascada + Promoción observables:** sesión perfecta → badge `✓` verde, racha `1 d`, última vez `hoy`. Sesión con fallo → badge `●` gris, racha `0 d`, counters `exerciseStats` igualmente incrementados (DOMAIN-09).
6. **Confirmación inline mid-Repaso (D-27):** panel discreto en esquina superior derecha con texto `¿Descartar esta sesión de repaso? Tus respuestas no se guardarán.`, botones `Descartar` / `Continuar`, `Continuar` cierra panel y mantiene sesión, `Descartar` vuelve a home sin escribir state.
7. **DOMAIN-06 boot regression:** añadir ejercicio nuevo a `content/exercises/avere.json` con avere en estado `hecha` → recargar → tabla muestra avere ahora `● gris` con racha `0 d` y ejercicios `13`, `clearedExerciseIds` previos preservados en localStorage.

## Deviations from Plan

**Found during UAT 7/7 — 2 issues auto-fixed (Rule 1: bug fixes).**

### Auto-fixed Issues

**1. [Rule 1 - Bug visual] Botones de home pegados sin gap, parecían un título**

- **Found during:** UAT 02-03 Verificación 1.
- **User report:** "Los botones de `Repaso 20` y `Test completo` están pegados y nada diferencia uno del otro y casi ni parecen botones, casi parecen un título. Debería notarse más que son botones y que son 2 botones diferentes."
- **Root cause:** los dos `<button>` estaban envueltos en `<div role="group">`, que Pico CSS interpreta como **button group** (Pico's idiomático "control unificado": une los bordes adyacentes, mismo background plano, parecen un solo control segmentado). Combinado con los defaults de Pico classless para botones primarios, el conjunto se leía como una cabecera/badge en vez de dos acciones distintas.
- **Fix:** sustituir el wrapper `role="group"` por `<div class="home-actions">` (clase custom) + CSS:
  ```css
  .home-actions { display: flex; gap: 1rem; margin: 1.5rem 0; }
  .home-actions button { flex: 1; font-size: 1.1rem; padding: 0.75rem 1.5rem; }
  ```
  Pico estiliza los `<button>` con background sólido + hover por defecto, así que no necesitamos override de colores — solo gap visible y un poco más de presencia tipográfica.
- **Files modified:** `index.html`, `styles.css`.
- **Commit:** `060c1f7` — `fix(02-03): widen home action buttons with flex gap`.

**2. [Rule 1 - Bug Alpine] `Cannot read properties of undefined (reading 'payload')` al cerrar sesión**

- **Found during:** UAT 02-03 Verificación 4 (sesión completa) y Verificación 6 (descartar mid-Repaso).
- **User report:** consola lanza `Alpine Expression Error: Cannot read properties of undefined (reading 'payload')` en los bindings `sessionCurrentExercise.payload.prompt`, `.options`, `.options[correctIndex]` justo al cambiar `currentScreen` a `'home'`.
- **Root cause:** cuando la sesión termina (`completeSession()` incrementa cursor más allá del último ejercicio y cambia `currentScreen = 'home'`) o cuando el usuario descarta mid-Repaso vía el modal de confirmación, Alpine **re-evalúa los bindings del `<template x-if="currentScreen === 'session'">` UNA VEZ con el state nuevo antes de desmontarlo** (tick de unmount). En ese tick, el getter `sessionCurrentExercise` devuelve `undefined` (cursor >= length), y los bindings internos del template intentan leer `.payload` de `undefined` → TypeError. Es el mismo patrón de race condition que Phase 1 resolvió en UAT 01-02 con la guard `<template x-if="ready && !done">`.
- **Fix (doble defensa — patrón canónico del proyecto a partir de ahora):**
  - **Getter:** explicitar el retorno `null` (no `undefined`) cuando `cursor >= length`, cuando `content` aún no cargó, o cuando el id no existe en `exerciseById`. Plus JSDoc largo explicando el porqué.
  - **Template:** añadir `&& sessionCurrentExercise` al `x-if` del template session. Cuando el getter devuelve `null`, Alpine ni siquiera monta el template ni evalúa los bindings internos.
- **Files modified:** `src/screens/app.js` (getter), `index.html` (template guard).
- **Commits:** `dd4a5f4` — `fix(02-03): make sessionCurrentExercise getter return null when out of bounds`, `9c11fcf` — `fix(02-03): guard session template x-if with sessionCurrentExercise non-null check`.

### Authentication gates

Ninguna. La app es local sin auth.

## UAT Round 2 — Design Refinements

Tras el UAT round 1 (7/7 aprobado), el autor siguió probando la app durante el día y detectó **dos refinements de diseño** que invocó por separado del UAT formal. Ambos son cambios semánticos del modelo que el autor pidió DESPUÉS de ver la implementación funcional — refinan dos decisiones previas (D-39 y D-29) sin tocar el resto de la arquitectura. Documentados como Rule 2 (design-level changes solicitados por el usuario, no auto-aplicados): nuevas decisiones D-54 y D-55 añadidas a CONTEXT.md, código y tests actualizados.

### Finding 3 — Exploit "fail + escape" (CRITICAL: viola core value)

**Cita del autor:**

> "Si a mitad de sesión de ejercicios, fallas, y te sales del ejercicio y vuelves a la home, no te cambia el estado ni la racha, como si no hubieras fallado, eso debería ser inmediato, en cuanto fallas, lección no hecha y racha perdida."

**Root cause:** D-39 (cascada al final de sesión) + SESSION-08 (Repaso abandonado se descarta) en combinación creaban un atajo perverso: el usuario falla → se da cuenta → cierra la pestaña o pulsa Descartar → el fallo no se registra → core value "te obliga a no olvidar" violado. La separación clean de "evaluar todo al final" había sonado bien en el diseño pero rompía en la práctica.

**Nueva decisión D-54: Fail-cascade INMEDIATA (refinement de D-39).**

- **Semántica nueva:** en cuanto `feedback === 'incorrect'` en `sessionSelectOption`, aplicar `applyImmediateFailure(state, exercise, content, today)`:
  - Para cada categoría en `exercise.categoryIds`: reset cascade idéntico a la rama FAIL-WINS de D-39 (`status='no-hecha'`, `clearedExerciseIds=[]`, `streakDays=0`, `becameHechaAt/becameDominadaAt=undefined`).
  - Añadir las categorías a `dailyLog[today].categoriesPracticed` Y `.categoriesWithFailure`.
  - Persistir inmediatamente con `saveState(newState)`.
  - **NO tocar `exerciseStats`** (eso lo hace `applySessionResult` al final de sesión, UNA sola vez).
- **Los aciertos NO cambian:** siguen el patrón Phase 1 write-once-on-done (D-20). Acumulan en `sessionResults` y se persisten al final via `applySessionResult`.
- **`applySessionResult` SIN CAMBIOS:** se sigue llamando al cerrar sesión con el `sessionResults` COMPLETO (fails + successes). La cascada es **idempotente** respecto al state ya reseteado por `applyImmediateFailure` (re-aplicar el reset sobre state idéntico = no-op). Los `exerciseStats` se bumpean ahí UNA SOLA VEZ, preservando DOMAIN-09 monotonicidad sin doble conteo.

**Por qué `applySessionResult` no cambia:**

| Paso de D-39 | Idempotente respecto a `applyImmediateFailure`? |
| --- | --- |
| Paso 1: calcular `failedCategoryIds` | Sí — la lista se calcula del sessionResults, no depende del state actual. |
| Paso 2: rama FAIL-WINS (reset cat) | **Sí** — re-aplicar `status='no-hecha'`, `clearedExerciseIds=[]`, `streakDays=0` sobre state que ya está así produce el MISMO state. |
| Paso 3: rama PROMOTION (cleared/streak) | N/A — las categorías falladas NO entran a esta rama. |
| Paso 4: `lastPracticedDate=today` | Sí — re-set al mismo valor. |
| Paso 5: dailyLog | Sí — `uniqueStrings` dedupea categorías ya presentes. |
| Paso 6: `exerciseStats` monotónico | **Bumpea UNA sola vez** aquí (NO en applyImmediateFailure). |

El test de integralidad lo verifica explícitamente: `applyImmediateFailure(state, ex, ...)` + `applySessionResult(answers: [ex fallado])` = `applySessionResult(answers: [ex fallado])` directamente (mismo state final).

**Cómo afecta a futuras fases:**
- **Aciertos siguen siendo write-once-on-session-end.** Plan 02-04 `inFlightTest` (persistencia per-answer del Test completo) sigue válido tal como estaba diseñado — el Test completo persiste cada respuesta (acierto o fallo) en `inFlightTest`, y `applySessionResult` corre al completar el último ejercicio. D-54 NO toca esto.
- **`dailyLog` puede ser eventualmente sobre-poblado** (un fallo persiste mid-session aunque la sesión se abandone — la entrada en `dailyLog` ya está escrita). Esto es desirable: refleja el día en que el usuario tocó la categoría aunque no terminara la sesión.
- **SESSION-08 mantiene su validez para aciertos.** REQUIREMENTS.md añade una nota explícita de excepción en DOMAIN-04 y SESSION-08: "los fallos individuales se persisten inmediatamente; solo los aciertos de un Repaso abandonado se descartan".

**Tests nuevos (6 tests):** `tests/domain-progress.test.js` extendido con un `describe('domain/progress — D-54 applyImmediateFailure (cascada inmediata)')`:
1. Resetea cascada sin tocar exerciseStats (idempotencia + monotonicidad).
2. Añade categoría a dailyLog.categoriesPracticed y dailyLog.categoriesWithFailure.
3. Idempotencia integral: applyImmediateFailure + applySessionResult con mismo fail = solo applySessionResult.
4. Caso E2E exploit: cat hecha → fail inmediato → abandono sin applySessionResult = regresión persiste.
5. Ejercicio multi-cat: cascada inmediata afecta TODAS las categorías del ejercicio.
6. Pureza: input state NO se muta tras applyImmediateFailure.

### Finding 4 — Racha display: mostrar `N / 21 d` para visibilizar objetivo

**Cita del autor:**

> "Y en racha, debería poner 1 d / 21 d para saber que el objetivo es llegar a 21 días."

**Diagnosis:** El header `Racha` mostraba `0 d`, `5 d`, `21+ d` — comunicaba el valor actual pero no contextualizaba con el objetivo. El usuario quería que el formato hiciera explícito hacia dónde va.

**Nueva decisión D-55: Display de Racha `N / 21 d` (refinement de D-29).**

- **Reglas del formato:**
  - `status != 'dominada'` (no-hecha o hecha con cualquier streakDays): mostrar `{N} / 21 d` (ej. `0 / 21 d`, `5 / 21 d`, `20 / 21 d`).
  - `status === 'dominada'` (streakDays >= 21 con promoción confirmada): mostrar `{N} d` (ej. `25 d`). Ya superó el objetivo; el `/ 21 d` no aporta, y la columna Estado ya tiene el ★ que indica dominada. El contador acumulado sigue siendo informativo (cuántos días llevas en dominada).
- **Implementación:** `formatStreak(streak, status)` en `src/screens/app.js` con el nuevo segundo parámetro. La celda HTML ya bindea `x-text="cat.streakLabel"`, así que no requiere cambios en `index.html`.

**Por qué no hay tests dedicados:** el formato es UI puro (string formatting); los tests del dominio cubren `streakDays` numérico. El smoke check visual durante UAT es suficiente — el verifier verá en la tabla home que la racha de avere sale como `5 / 21 d` en vez de `5 d`.

### Resumen de cambios UAT round 2

- **2 decisiones nuevas:** D-54 (fail-cascade inmediata) + D-55 (racha display).
- **2 archivos del dominio modificados:** `src/domain/progress.js` (nuevo export `applyImmediateFailure`), `src/screens/app.js` (call site en `sessionSelectOption` + `formatStreak(streak, status)`).
- **2 archivos de docs modificados:** `02-CONTEXT.md` (nueva sección "Refinements post-UAT round 2 de Plan 02-03"), `REQUIREMENTS.md` (excepción D-54 en DOMAIN-04 y SESSION-08).
- **6 tests nuevos** verdes (D-54). Suite total: 57/57.

## Commits

| Hash | Mensaje | Archivos |
| --- | --- | --- |
| `b725a8c` | `feat(02-03): add appShell factory plano with 4-screen switch` | `src/screens/app.js` (creado) |
| `eae0ad3` | `feat(02-03): rewrite index.html with 4-screen Alpine shell` | `index.html` |
| `b8baf12` | `feat(02-03): wire appShell — refactor main.js + badges CSS + delete session.js` | `src/main.js`, `styles.css`, `src/screens/session.js` (eliminado) |
| `060c1f7` | `fix(02-03): widen home action buttons with flex gap` | `index.html`, `styles.css` |
| `dd4a5f4` | `fix(02-03): make sessionCurrentExercise getter return null when out of bounds` | `src/screens/app.js` |
| `9c11fcf` | `fix(02-03): guard session template x-if with sessionCurrentExercise non-null check` | `index.html` |
| `85466b1` | `feat(02-03): add applyImmediateFailure helper for eager cascade on fail (D-54)` | `src/domain/progress.js`, `tests/domain-progress.test.js` |
| `2a91850` | `feat(02-03): wire selectOption to apply immediate failure (D-54)` | `src/screens/app.js` |
| `36d1cba` | `feat(02-03): show racha as N / 21 d with dominada exception (D-55)` | `src/screens/app.js` |
| `743f937` | `docs(02): update CONTEXT.md with D-54 + D-55 from UAT round 2` | `.planning/phases/02-.../02-CONTEXT.md` |
| `6d8fd1f` | `docs(02): note D-54 exception in REQUIREMENTS.md DOMAIN-04/SESSION-08` | `.planning/REQUIREMENTS.md` |

## Lessons learned / anti-patterns evitados

1. **Patrón canónico — Alpine x-if + getter defensivo (UAT 02-03 → regla del proyecto):** SIEMPRE que un `<template x-if="X">` tenga bindings que lean propiedades anidadas de un recurso reactivo (ej. `X.payload.prompt`), aplicar DOBLE defensa:
   - El getter del recurso devuelve `null` (NO `undefined`) en cualquier caso de "no disponible" (out of bounds, no cargado, id inválido).
   - El `x-if` del template incluye `&& X` además de la condición de pantalla.

   Razón: Alpine evalúa los bindings del template UNA VEZ con el state nuevo antes de desmontarlo (tick de unmount). Sin el doble guard, los bindings internos lanzan TypeError visible en consola — funcionalmente no rompe (el template desaparece después) pero contamina la consola y rompe la confianza del autor. Phase 1 UAT 01-02 estableció el patrón con `ready && !done`; Plan 02-03 UAT lo formaliza como patrón canónico aplicable a TODAS las pantallas Alpine futuras.

2. **Anti-pattern Pico — `role="group"` para acciones distintas:** `role="group"` en Pico CSS produce un button group (control segmentado, bordes unidos). NO es el wrapper genérico para "dos botones lado a lado". Para acciones distintas (incluso del mismo estilo), usar wrapper custom con `display: flex; gap`. El patrón actualizado en este plan vale para todos los pares de acciones futuros (ej. la barra Seleccionar todo / Quitar todo del picker — que SÍ funciona bien con `role="group"` porque son acciones del mismo grupo conceptual; el contraste home vs picker es justamente lo que diferencia).

3. **Boot regression idempotente — `applyNewExerciseRegression`:** la función devuelve el MISMO objeto (`===`) cuando no hubo cambios, o uno NUEVO si hubo regresión. `main.js` compara `state !== state0` por identidad para decidir si persistir. Esto evita writes innecesarios al boot (la mayoría de veces no hay ejercicios nuevos y no debe haber I/O a localStorage al arrancar). Patrón a replicar en cualquier futura "migración" boot-time.

4. **Factory plano (D-25) sobre composición:** la decisión de aplastar todos los sub-estados en un único objeto con prefijos de área (`picker*`, `session*`, etc.) en vez de componer via spread fue acertada — el `$data` en DevTools es totalmente navegable, los getters reactivos pueden leer de cualquier sub-estado sin "this binding" gymnastics, y la lógica de un método `requestReturnToHome` puede inspeccionar `sessionMode` Y `currentScreen` sin friction. El tradeoff (un archivo de 590 LOC) es aceptable para un proyecto personal.

5. **`role="group"` SÍ funciona bien en el picker:** los botones `Seleccionar todo` / `Quitar todo` están envueltos en `role="group"` y se ven correctamente como un grupo de acciones masivas. La regla: `role="group"` para acciones del mismo conjunto conceptual; flex wrapper custom para acciones primarias distintas que necesitan presencia individual.

## Lo que queda para Plan 02-04

- Pantalla **summary** completa: `summaryDelta` computado en `completeSession` con categoryProgress antes/después, render de promociones (no-hecha → hecha → dominada), fallos por categoría, etc.
- Persistencia **in-flight Test completo**: escritura per-answer de `inFlightTest` en localStorage, banner reanudar en home, `resumeInFlightTest()`, `clearInFlightTest()`, `discardInFlightTestWithConfirm()`.
- Confirmaciones inline D-43 / D-44 (descarte de in-flight + lanzar nuevo con uno en curso) — reusan `requestConfirm` ya implementado en este plan.
- Smoke tests del state machine ≥30 días (simulación de calendario).
- UAT final integrado.

## Self-Check: PASSED

Files exist:
- `src/screens/app.js` — FOUND (~620 LOC tras UAT round 2; incluye `applyImmediateFailure` wire en `sessionSelectOption` + `formatStreak(streak, status)` D-55 + defensive `sessionCurrentExercise` getter).
- `index.html` — FOUND (4 x-if templates + confirm-inline + `.home-actions` wrapper + session guard; sin cambios en UAT round 2 — D-55 es internal a app.js).
- `styles.css` — FOUND (badges + picker-warning + confirm-inline + home-actions).
- `src/main.js` — FOUND (registers appShell, derives categoryIds, applies applyNewExerciseRegression).
- `src/domain/progress.js` — FOUND (incluye nuevo export `applyImmediateFailure` para D-54).
- `tests/domain-progress.test.js` — FOUND (incluye `describe('D-54 applyImmediateFailure')` con 6 tests).
- `.planning/phases/02-.../02-CONTEXT.md` — FOUND (sección "Refinements post-UAT round 2" con D-54 y D-55).
- `.planning/REQUIREMENTS.md` — FOUND (nota de excepción D-54 en DOMAIN-04 y SESSION-08).
- `src/screens/session.js` — CORRECTLY ABSENT (deleted as planned).

Commits present in `git log --oneline`:
- `b725a8c` — FOUND (appShell factory plano).
- `eae0ad3` — FOUND (4-screen index.html).
- `b8baf12` — FOUND (main.js + styles + delete session.js).
- `060c1f7` — FOUND (home buttons flex gap).
- `dd4a5f4` — FOUND (getter null defensive).
- `9c11fcf` — FOUND (template x-if guard).
- `85466b1` — FOUND (applyImmediateFailure helper + 6 tests D-54).
- `2a91850` — FOUND (wire selectOption D-54).
- `36d1cba` — FOUND (racha display N / 21 d D-55).
- `743f937` — FOUND (CONTEXT.md D-54 + D-55).
- `6d8fd1f` — FOUND (REQUIREMENTS.md D-54 exception).

Domain tests: 57/57 verdes (`node --test tests/*.test.js` exits 0).
