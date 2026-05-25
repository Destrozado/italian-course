---
phase: 02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa
plan: 04
subsystem: ui
tags:
  - summary-delta
  - inflight-test
  - persistence
  - banner-home
  - smoke-test
  - confirm-inline
  - alpine-double-defense
dependency_graph:
  requires:
    - 02-01 (state v2: schemaVersion, categoryProgress, dailyLog, exerciseStats)
    - 02-02 (applySessionResult cascada/promociones + buildFullTest + applyNewExerciseRegression)
    - 02-03 (appShell factory plano + 4-screen switch + requestConfirm + immediate-failure D-54)
  provides:
    - "Pantalla SUMMARY poblada (D-37) con delta factústico por categoría tocada"
    - "computeSummaryDelta helper privado (módulo-level, no método del factory)"
    - "Persistencia in-flight Test completo (D-41/D-42) con per-answer writes"
    - "Banner home reactivo a inFlightTest con Reanudar/Descartar (D-43)"
    - "Confirmación D-44 al lanzar nuevo Test completo con uno in-flight pendiente"
    - "Validación stale en resumeInFlightTest (Pitfall #5)"
    - "Smoke test integrado 30 días (DOMAIN-10) — escenario completo en una sola simulación"
    - "Patrón canónico Alpine double-defense reaplicado (round 1 fix)"
  affects:
    - "Cierra Phase 2: los 6 success criteria del ROADMAP están todos verdes pendiente UAT 6/6 round 2"
tech_stack:
  added:
    - "(ninguna dependencia nueva — solo extensiones sobre Alpine 3.15.12 + Pico 2.1.1)"
  patterns:
    - "summaryDelta computado UNA VEZ en completeSession (NO getter — los getters Alpine no están cacheados)"
    - "Snapshot deep clone (JSON.parse(JSON.stringify(...))) del categoryProgress antes de applySessionResult"
    - "Persist in-flight per-answer (sessionSelectOption + sessionAdvance) con preservación de startedAt"
    - "Stale validation en resumeInFlightTest — si remainingIds no existen en exerciseById, ofrecer descarte"
    - "Smoke test integrado: un solo describe que simula 30+ días combinando cascada multi-cat + promoción + dominada + regresión + racha guard"
    - "Alpine double-defense (REFORZADO en round 1): getter defensivo + outer x-if guard cuando un binding traversa un recurso nullable"
key_files:
  created:
    - .planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-SUMMARY.md
  modified:
    - src/screens/app.js (+~200 LOC: persistInFlightTest, resumeInFlightTest, clearInFlightTest, discardInFlightTestWithConfirm, computeSummaryDelta helper, returnToHomeFromSummary, completeSession reescrito, openPicker D-44, sessionSelectOption D-42 hook, sessionAdvance D-42 hook, startSession initial inFlight write, getters inFlightTestActive/inFlightTestProgress)
    - index.html (template summary completo + banner in-flight home con outer x-if guard tras round 1 fix)
    - styles.css (.summary-delta + .delta-arrow + .delta-regression/.delta-promotion + .delta-reason/.delta-streak/.delta-pending + .inflight-banner)
    - tests/domain-progress.test.js (+1 describe + 1 test integrado 30 días — DOMAIN-10)
decisions:
  - "summaryDelta se computa UNA SOLA VEZ en completeSession y se almacena como prop reactiva (this.summaryDelta = ...) en lugar de exponerlo como getter. Razón: los getters Alpine NO están cacheados (research D-37), re-evaluarían en cada render del template. Además necesitamos el snapshot before de categoryProgress que NO está disponible tras applySessionResult."
  - "Snapshot before deep clone con JSON.parse(JSON.stringify(...)). categoryProgress es un dict pequeño (~10 categorías x pocos campos), el cost <1ms. Alternativas (structuredClone, manual recursion) descartadas por simplicidad. JSON.stringify elide undefined — OK aquí porque categoryProgress no usa undefined como valor significativo."
  - "Per-answer write del inFlightTest desde DOS sitios: sessionSelectOption (tras pushear respuesta) Y sessionAdvance (tras incrementar cursor). El primero captura answers actualizado pero cursor aún viejo; el segundo captura el cursor avanzado. Si el usuario cierra entre ambos puntos, el banner reflejará el cursor previo + las answers correctas — la siguiente reanudación lo retoma sin pérdida."
  - "startedAt se setea SOLO la primera vez (initial write en startSession) y se preserva a través de updates. Informativo — no usado para staleness en v1 (la staleness se detecta por IDs eliminados del content, no por edad)."
  - "Stale validation en resumeInFlightTest: si algún exerciseId en remaining (slice desde cursor) no existe en content.exerciseById, ofrecemos descarte vía requestConfirm en lugar de crashear al intentar renderizar null.payload.prompt. Razón: el autor puede editar JSON entre sesiones."
  - "completeSession NO llama resetSession aún — el usuario debe poder mirar el resumen sin que sub-estado se borre por debajo. resetSession se llama desde returnToHomeFromSummary cuando el usuario pulsa Volver al home. Excepción: cancelAutoAdvance SÍ se llama en completeSession (Pitfall #5 — un setTimeout pendiente con auto-advance scheduled durante el rendering del feedback verde podría disparar fuera de tiempo si no se cancela)."
  - "D-44 confirmación al lanzar nuevo Test completo con uno in-flight: integrado en openPicker antes de cambiar currentScreen. Si user confirma, clearInFlightTest + abrir picker; si cancela, no pasa nada (state intacto, sigue en home). Reusa el helper requestConfirm de Plan 02-03 — patrón uniforme."
  - "Smoke test integrado DOMAIN-10: UN solo describe + UN test combinando 30+ días con todos los aspectos del dominio. Alternativa (varios tests más pequeños) descartada por la suite ya tener tests por aspecto en Plans 02-01 y 02-02. El test integrado es la prueba final del invariante combinado: el dominio funciona end-to-end en un escenario complejo realista."
  - "Patrón Alpine double-defense (Plan 02-03 SUMMARY lessons learned #1) DEBE aplicarse a TODO nuevo binding que traverse un recurso nullable. Round 1 detectó que el banner inFlightTest NO había aplicado el patrón — anti-pattern recurrente. Fix: getter defensivo (inFlightTestActive returns false cuando state null) + outer x-if guard. Lección a documentar más arriba en CONTEXT.md / ADR para que sea un invariante del proyecto, no algo que se redescubre en cada UAT."
metrics:
  duration: "~3h plan original + ~25min UAT round 1 fix + ~15min UAT round 2 fix"
  completed_date: "2026-05-23"
  files_changed: "4 (1 SUMMARY creado, 3 código modificados)"
  commits: 6
  tests_passing: 58/58
---

# Phase 02 Plan 04: Cierre — Resumen + In-flight Test + Smoke 30 días Summary

Plan final de Phase 2: cierra el bucle "te obliga a no olvidar" añadiendo (a) la pantalla de resumen pantalla-completa con delta factústico, (b) persistencia in-flight del Test completo con banner Reanudar/Descartar en home, (c) confirmaciones D-43/D-44, y (d) un smoke test integrado de 30 días simulados (DOMAIN-10). Tras este plan, los 6 success criteria de Phase 2 (ROADMAP.md) están todos verdes pendiente solo del UAT humano final.

## What was built

| Pieza | Detalles |
| --- | --- |
| **`completeSession` reescrito** | Ahora computa `summaryDelta` invocando `computeSummaryDelta(before, newState, sessionResult, content)` y navega a `currentScreen='summary'` (antes iba directo a `'home'`). El snapshot `before` se hace con `JSON.parse(JSON.stringify(this.state.categoryProgress ?? {}))` ANTES de aplicar `applySessionResult` — necesario porque applySessionResult muta el shape interno por categoría. `summaryHeaderLabel` formato `Sesión terminada · X/N correctos`. NO llama `resetSession` aún (el usuario debe poder ver el resumen). |
| **`computeSummaryDelta` helper privado** | Función módulo-level (no método del factory) al fondo de `src/screens/app.js`. Devuelve `{delta, headerLabel}`. El delta es un array de entradas `{categoryId, categoryName, statusBefore, statusAfter, streakBefore, streakAfter, totalInCat, pendingForHecha, failed, failureReason, isPromotion, isRegression}`. Orden: regresiones → promociones → neutrales. Sub-orden alfabético por nombre. failureReason expone cascada multi-cat (`falló (cascada multi: avere + genero)`) cuando hay >1 categoría afectada. |
| **`returnToHomeFromSummary` método** | Limpia sub-estado de sesión + summary (delta y headerLabel) + navega a `'home'`. Engancha al botón único `Volver al home` del template summary. |
| **Persistencia in-flight Test completo** | Cuatro métodos: `persistInFlightTest()` (escribe el shape D-41 al state + saveState; preserva `startedAt` y `categoryIds` previos al reanudar), `resumeInFlightTest()` (valida staleness + restaura sub-estado sesión + navega a `'session'`), `clearInFlightTest()` (pone inFlightTest=undefined + saveState; JSON.stringify lo elide del blob), `discardInFlightTestWithConfirm()` (helper que envuelve clearInFlightTest en un requestConfirm). |
| **Hooks de persistencia per-answer** | `sessionSelectOption` invoca `persistInFlightTest()` al final cuando `sessionMode === 'test-completo'`. `sessionAdvance` invoca `persistInFlightTest()` tras incrementar cursor — sólo si la sesión NO terminó. `startSession` invoca `persistInFlightTest()` initial write cuando `pickerMode === 'test-completo'` (cursor=0, answers=[]). |
| **`openPicker(mode)` D-44 conflict check** | Cuando `mode === 'test-completo' && this.state.inFlightTest`: requestConfirm con mensaje `Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?`. onConfirm → clearInFlightTest + abrir picker. Si cancela: state intacto, sigue en home. |
| **Template `summary` completo** | `<template x-if="currentScreen === 'summary' && summaryDelta">` (double-defense Alpine: si summaryDelta es null, no monta — patrón canónico Plan 02-03). Header `<header x-text="summaryHeaderLabel">`. Lista `<ul class="summary-delta">` con `<li>` por entrada del delta — flecha con `:class="{'delta-regression': isRegression, 'delta-promotion': isPromotion}"`. failureReason, streak diff, pendingForHecha cada uno con su propio inline span condicional. Botón único `Volver al home`. |
| **Banner in-flight en `home` template** | (Round 1 final form, tras fix) `<template x-if="inFlightTestActive">` outer guard, dentro: mensaje + contadores `inFlightTestProgress.cursor` / `inFlightTestProgress.total` con acceso DIRECTO + dos botones `Reanudar` / `Descartar`. Orden vertical en home: banner → botones grandes → tabla. |
| **`styles.css` ampliado** | `.summary-delta` (list-style none + bordes sutiles), `.delta-arrow` (margin + bold), `.delta-regression` (color rojo Pico vars + fallback hex), `.delta-promotion` (verde), `.delta-reason / .delta-streak / .delta-pending` (muted color + tamaño ligeramente menor), `.inflight-banner` (border + background amber sutil + padding + border-radius). |
| **Smoke test DOMAIN-10 integrado** | `describe('domain — smoke test integrado 30 días (DOMAIN-10)')` en `tests/domain-progress.test.js`. Un solo `test` que simula 30+ días: días 1-7 ambas cats acertadas (verifica racha 7 + status hecha), día 8 multi-cat fail (verifica cascada → ambas no-hecha), días 9-29 recuperación avere sola (21 días → dominada en día 29), día 30 fallo (regresión desde dominada → no-hecha con becameDominadaAt undefined), día 30 sesión 2-6 (racha guard: 5 sesiones mismo día NO incrementan racha). Verifica exerciseStats monotónico al final. |

### Estructura final del summary (HTML)

```
<template x-if="currentScreen === 'summary' && summaryDelta">
  <article>
    <header x-text="summaryHeaderLabel"></header>  <!-- "Sesión terminada · 18/20 correctos" -->
    <ul class="summary-delta">
      <template x-for="entry in summaryDelta" :key="entry.categoryId">
        <li>
          <strong>{entry.categoryName}</strong>:
          {entry.statusBefore}
          <span class="delta-arrow" :class="{regression/promotion}">→</span>
          {entry.statusAfter}
          [si failed]:  · {entry.failureReason}
          [si streak cambió]: · racha N → M
          [si statusAfter=no-hecha y pending>0]: · K ejercicios para volver a hecha
        </li>
      </template>
    </ul>
    <button>Volver al home</button>
  </article>
</template>
```

### Estructura final del banner home (HTML — tras round 1 fix)

```
<template x-if="inFlightTestActive">
  <div role="alert" class="inflight-banner">
    ⚠ Tienes un Test completo a medias
    (<span x-text="inFlightTestProgress.cursor"></span>
    / <span x-text="inFlightTestProgress.total"></span> ejercicios).
    <button>Reanudar</button> <button class="secondary">Descartar</button>
  </div>
</template>
```

## Verification

**Domain tests:** `node --test tests/*.test.js` → 58/58 verdes (51 previos de Plans 02-01/02 + 6 de D-54 + 1 nuevo DOMAIN-10 integrado).

**Auditoría automática post-fix (round 1):**

```bash
$ grep -nE '(x-text|x-show|x-bind|:[a-zA-Z]+)="state\.' index.html
79:            antes este bloque usaba `x-show="state.inFlightTest"` con bindings   # HTML comment doc, no binding live
$ grep -nE '(x-text|x-show|x-bind|:[a-zA-Z]+)="content\.' index.html
# (vacío — no quedan content.X directos)
$ grep -nE 'x-for="[^"]+ in content\.' index.html
167:            <template x-for="cat in content.categories" :key="cat.id">   # dentro de <template x-if="currentScreen === 'picker'"> — picker es inalcanzable hasta init() completo
```

**UAT Round 1 — Boot Crash Fix (este SUMMARY documenta esta deviación; el UAT 6/6 final del autor está pendiente):**

Tras el primer pase del plan, la consola DevTools mostraba al recargar `http://localhost:3000`:

> ```
> Alpine Expression Error: Cannot read properties of null (reading 'inFlightTest')
> Expression: "state.inFlightTest?.cursor || 0"
> Expression: "state.inFlightTest?.exerciseIds?.length || 0"
> Uncaught TypeError: Cannot read properties of null (reading 'inFlightTest')
> ```

Aplicado fix double-defense — ver sección "Deviations from Plan" más abajo.

**UAT Round 2 — Picker button spacing fix:**

Tras el round 1, el autor reportó:

> "Los botones 'Seleccionar todo' y 'Quitar todo' tienen el mismo problema que tenían los botones de la home, demasiado pegados, no parecen dos botones, parecen 1 título."

Mismo root cause que el fix de UAT 02-03 round 1 — Pico classless no espacía botones adyacentes. Resuelto generalizando la clase específica `.home-actions` a la clase reutilizable `.button-row` y aplicándola en picker, banner in-flight, y panel de confirmación inline (3 sitios preventivos detectados por audit `grep`). Ver sección "Deviations from Plan" item 2.

**Auditoría post-UAT round 2:**

```
$ grep -c "button-row\|home-actions" index.html
11   # 4 aplicaciones live + 7 comentarios docs (rationale en el HTML)
$ grep -nE 'class="button-row' index.html
107: in-flight banner (Reanudar/Descartar)
124: home actions (Repaso 20/Test completo) — usa también .button-row-prominent
177: picker (Seleccionar todo/Quitar todo) — el finding directo
319: confirm-inline panel (D-27/D-43/D-44)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug Alpine] Banner in-flight crasheaba al boot con state null**

- **Found during:** UAT round 1 — el autor recargó http://localhost:3000 y la consola DevTools mostró ráfagas de TypeError + Alpine Expression Error en los bindings `state.inFlightTest?.cursor` y `state.inFlightTest?.exerciseIds?.length`.
- **User report:** ver cita arriba — TypeError visible en consola tras CADA recarga, aunque funcionalmente la app se levantaba (porque init() completaba el await de appDataReady y los errores desaparecían tras unos ms).
- **Root cause:** el banner del home usaba `x-show="state.inFlightTest"` + bindings `state.inFlightTest?.cursor || 0`. El optional chaining `?.` en una expresión Alpine se evalúa **left-to-right**: `state.inFlightTest?.cursor` significa `(state.inFlightTest)?.cursor` — el `?.` protege SÓLO el segundo acceso (`.cursor` sobre el resultado de `state.inFlightTest`). El primer acceso (`.inFlightTest` sobre `state`) NO está protegido. Durante el boot, entre `Alpine.start()` y `init()` resolviendo `appDataReady`, `this.state` es literalmente `null` (el factory inicializa `state: null` y `init()` lo hidrata async). Alpine evalúa los bindings de los templates ANTES de que `init()` termine → TypeError sobre `null.inFlightTest`.
- **Pattern recurrence:** Plan 02-03 UAT round 1 ya había codificado este mismo patrón con commits `dd4a5f4` (getter null-safe `sessionCurrentExercise`) + `9c11fcf` (x-if guard `&& sessionCurrentExercise`). El patrón canónico se documentó en el SUMMARY de 02-03 ("lessons learned" #1) — pero NO se aplicó al nuevo código del banner introducido en este plan. Anti-pattern recurrente que pide un mecanismo estructural (ADR o convención en CLAUDE.md) para no redescubrirse en cada UAT.
- **Fix (double-defense canónico):**
  1. **Getter defensivo `inFlightTestActive`** en `appShell`: devuelve `false` cuando `this.state` es null O cuando no hay `inFlightTest` O cuando el cursor ya alcanzó/superó el length. JSDoc largo explicando por qué `?.` solo no basta.
  2. **Getter `inFlightTestProgress`** que devuelve `{cursor, total}` o `null` (idéntica lógica de guard). El template lo usa con acceso DIRECTO `inFlightTestProgress.cursor` — el outer x-if garantiza que no se evalúa cuando es null.
  3. **Outer `<template x-if="inFlightTestActive">`** reemplaza el `<div x-show>` del banner. El `<template x-if>` Alpine NO monta el subtree cuando la condición es false, así que los bindings internos jamás se evalúan con state null.
  4. **Comentario HTML extenso** dentro del template documentando el anti-pattern del `?.` left-to-right + el patrón canónico (para futura referencia, no se vuelva a repetir).
- **Files modified:** `src/screens/app.js` (+~50 LOC: 2 getters defensivos), `index.html` (banner block reescrito de `<div x-show>` a `<template x-if>` + bindings directos).
- **Commit:** `b998812` — `fix(02-04): guard inFlightTest banner against null state at boot`.

**2. [Rule 1 - Bug visual recurrente] Picker `Seleccionar todo` / `Quitar todo` pegados parecían un título**

- **Found during:** UAT round 2 — el autor reportó:

  > "Los botones 'Seleccionar todo' y 'Quitar todo' tienen el mismo problema que tenían los botones de la home, demasiado pegados, no parecen dos botones, parecen 1 título."

- **Root cause:** Idéntico al fix de UAT 02-03 round 1 (commit `060c1f7`, "widen home action buttons with flex gap"). Pico classless no añade gap entre `<button>` adyacentes y `role="group"` (Pico's button group) une los bordes para que se lean como un solo control. La clase `.home-actions` se creó en 02-03 para resolverlo en el home, pero NO se reutilizó en el picker — el patrón visual de spacing entre botones adyacentes es **recurrente** (mismo problema, distinto sitio).
- **Fix (generalización del patrón):**
  1. **Renombrar `.home-actions` → `.button-row`** en `styles.css` y `index.html`. Clase ahora genérica, reusable en cualquier fila de botones adyacentes (no atada a home).
  2. **Añadir variante `.button-row-prominent`** que añade `font-size: 1.1rem` + `padding: 0.75rem 1.5rem` para acciones primarias (preserva el look existente del home `Repaso 20` / `Test completo`).
  3. **Aplicar `.button-row` al picker** (`Seleccionar todo` / `Quitar todo`) — fix directo del finding.
  4. **Aplicar `.button-row` preventivamente** a los OTROS pares de botones adyacentes detectados por audit `grep -nE '<button.*>\s*\n\s*<button' index.html`:
     - Banner in-flight Test completo (home): `Reanudar` / `Descartar`.
     - Confirmación inline (D-27/D-43/D-44): botones confirm/cancel.
  5. Los botones de opciones de la sesión (MCQ, `role="group"`) NO se cambian — son opciones de una misma pregunta, deben leerse agrupadas (semántica distinta).
- **Verificación visual esperada:** los pares de botones se ven separados con un gap >= 1rem; cada uno con estilo de botón Pico (background sólido, padding, hover state). Ya no parecen un título.
- **Files modified:** `styles.css` (rename + variant `.button-row-prominent`), `index.html` (4 wrappers: home + picker + banner + confirm panel).
- **Commits:**
  - `89df7f1` — `style(02-04): rename .home-actions to .button-row for reuse`.
  - `5dd205d` — `style(02-04): apply .button-row to picker / banner / confirm buttons`.

### Lección estructural pendiente (ADR)

El patrón **Alpine double-defense** se ha redescubierto en UAT en DOS planes consecutivos (02-03 round 1 + 02-04 round 1). Ya no es una excepción puntual — es un invariante del proyecto que debería:

- Vivir en `CLAUDE.md` (sección "Architecture" o "Patterns") O en un ADR dedicado en `.planning/decisions/`.
- Aparecer como checklist item en cualquier plan futuro que añada un binding Alpine que traverse propiedades anidadas de un recurso nullable (`state`, `content`, derivados).
- Texto sugerido: **"Para cualquier binding Alpine que traverse propiedades anidadas de un recurso reactivo nullable (state, content, derivados): aplicar DOBLE DEFENSA — (a) getter del recurso devuelve null/sentinel cuando no está cargado; (b) `<template x-if="getter">` en el HTML que evite que los bindings internos se evalúen. El optional chaining `?.` NO basta: protege solo el segundo acceso, no el primero (sintaxis Alpine left-to-right). Aplicar a TODOS los bindings, no solo a los del recurso top-level."**

(Esta línea es responsabilidad del autor para el siguiente sprint — no se aplica como Rule 4 aquí porque es trabajo arquitectural fuera del scope del plan; pero queda recogido como item de Deferred Issues.)

### Authentication gates

Ninguno. App local sin auth.

## Commits

| Hash | Mensaje | Archivos |
| --- | --- | --- |
| `d39112b` | `feat(02-04): completeSession computa summaryDelta y navega a summary` | `src/screens/app.js`, `index.html`, `styles.css` |
| `80c93f6` | `feat(02-04): inFlightTest persistence + banner home + D-43/D-44 confirmaciones` | `src/screens/app.js`, `index.html`, `styles.css` |
| `415dc6f` | `test(02-04): smoke test integrado 30 días (DOMAIN-10)` | `tests/domain-progress.test.js` |
| `b998812` | `fix(02-04): guard inFlightTest banner against null state at boot` | `src/screens/app.js`, `index.html` |
| `89df7f1` | `style(02-04): rename .home-actions to .button-row for reuse` | `styles.css`, `index.html` |
| `5dd205d` | `style(02-04): apply .button-row to picker / banner / confirm buttons` | `index.html` |

## Lessons learned

1. **Anti-pattern recurrente — Alpine `?.` left-to-right:** En una expresión Alpine `state.X?.Y`, el `?.` protege SÓLO el acceso `Y` sobre el resultado de `state.X`. El primer acceso (`.X` sobre `state`) NO está protegido. Si `state` puede ser `null` (como sucede entre `Alpine.start()` e `init()` resolviendo `appDataReady`), la expresión crashea. La solución NO es añadir más `?.` (volverían a fallar en algún nivel), sino aplicar double-defense con `<template x-if>` + getter defensivo.

2. **Anti-pattern recurrente — los `x-show` permiten que los bindings se evalúen:** `x-show` solo cambia la visibilidad CSS; los bindings hijos se evalúan SIEMPRE. `<template x-if>` es lo único que evita que el subtree se monte, y por tanto los bindings internos solo se evalúan cuando la condición es truthy. Regla del proyecto: para guards contra null, usar `<template x-if>`, NO `x-show`.

3. **Reaplicar patrones del SUMMARY anterior al planificar el siguiente plan:** la lección estructural de 02-03 ("double-defense canónico") debería haber sido un input directo del planner de 02-04 — específicamente, cualquier binding nuevo introducido en 02-04 que traversara state/content debería haber sido validado contra ese patrón ANTES de la implementación. Item pendiente: enriquecer la pipeline /gsd:plan-phase con una "lessons-learned-checklist" derivada de los SUMMARYs de planes previos.

4. **summaryDelta como prop (no getter) — research D-37 acertada:** la decisión de no exponer summaryDelta como getter (porque Alpine NO cachea getters y recomputaría el cálculo en cada render) demostró ser correcta. El cálculo de delta consume el snapshot `before` que ya no está disponible tras applySessionResult; un getter no podría reconstruirlo sin re-llamar applySessionResult. Patrón a replicar: para datos derivados que dependen de snapshots temporales, usar prop + invalidación explícita en lugar de getter.

5. **Smoke test integrado vale más que muchos tests pequeños:** un solo test de 30+ días que combina cascada multi-cat + promoción + dominada + regresión + racha guard sirve como invariante final del dominio. Si este test falla, la combinación de aspectos se ha roto — incluso si los tests unitarios por aspecto pasan. Patrón a replicar: cada subsistema cerrado merece un smoke test integrado además de los tests unitarios.

6. **Patrón visual recurrente — spacing entre botones adyacentes:** Pico CSS classless no añade `gap` entre `<button>` consecutivos en ningún contexto, y `role="group"` los une como un solo control. UAT 02-03 round 1 lo detectó en el home y se resolvió con `.home-actions`; UAT 02-04 round 2 lo redetectó en el picker con `.home-actions` sin reutilizar. La lección: cuando un problema visual aparece en un sitio, el fix debería ser una clase **genérica** (`.button-row`), no específica (`.home-actions`), porque el patrón VA a reaparecer en cada par de botones nuevo que el plan añada. Patrón a replicar: nombrar clases CSS por el patrón visual que resuelven, no por el sitio donde aparecen primero. Renombrar tras la segunda aparición sale más barato que vivir con N clases duplicadas.

## Lo que queda para Phase 2

- **UAT humano 6/6 final** (CRITERIO 1-6 del ROADMAP §Phase 2). Pendiente del orquestador.
- Una vez verde, Phase 2 está formalmente cerrada: el motor "te obliga a no olvidar" es observable end-to-end.

## Deferred Issues

1. **ADR pendiente — Patrón canónico Alpine double-defense:** ver sección "Lección estructural pendiente" arriba. Item para el siguiente sprint, NO blocking para Phase 2.
2. **`material-profesora/` untracked:** carpeta nueva visible en `git status` pero NO pertenece a este plan ni a Phase 2. El autor sabrá si añadirla a `.gitignore` o commitearla aparte.

## Self-Check: PASSED

Files exist:
- `src/screens/app.js` — FOUND (~1020 LOC tras este plan; incluye summaryDelta + inFlight persistence + double-defense getters `inFlightTestActive` / `inFlightTestProgress`).
- `index.html` — FOUND (summary template completo + banner home con outer x-if guard double-defense).
- `styles.css` — FOUND (summary-delta + delta-arrow + delta colors + inflight-banner añadidos).
- `tests/domain-progress.test.js` — FOUND (incluye smoke test integrado 30 días DOMAIN-10).
- `.planning/phases/02-.../02-04-SUMMARY.md` — FOUND (este archivo).

Commits present in `git log --oneline`:
- `d39112b` — FOUND (completeSession + summaryDelta).
- `80c93f6` — FOUND (inFlightTest persistence + banner + D-43/D-44).
- `415dc6f` — FOUND (DOMAIN-10 smoke test 30 días).
- `b998812` — FOUND (banner null state guard — UAT round 1 fix).
- `89df7f1` — FOUND (rename .home-actions → .button-row — UAT round 2 fix).
- `5dd205d` — FOUND (apply .button-row to picker / banner / confirm — UAT round 2 fix).

Domain tests: 58/58 verdes (`node --test tests/*.test.js` exits 0).

Pending UAT humano 6/6 round 3 (post-fix). Orquestador maneja el re-checkpoint.
