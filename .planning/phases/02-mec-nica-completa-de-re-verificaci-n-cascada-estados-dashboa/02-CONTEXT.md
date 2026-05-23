# Phase 2: Mecánica completa de re-verificación (cascada + estados + dashboard) - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 entrega el **motor completo de re-verificación**: estados de categoría (`no-hecha → hecha → dominada`), cascada de fallo multi-categoría, racha 21 días con `lastSuccessDate` guard, regresión `dominada → no-hecha`, home dashboard con tabla densa, picker compartido con dos modos (Repaso 20 / Test completo), resumen de fin de sesión con delta por categoría, semánticas diferenciadas de abandono (Repaso descarta / Test completo reanuda) y persistencia in-flight del Test completo. Tras esta fase, el bucle "te obliga a no olvidar" es observable end-to-end.

**Requisitos cubiertos:** DOMAIN-03, DOMAIN-04, DOMAIN-05, DOMAIN-06, DOMAIN-07, DOMAIN-08, DOMAIN-10, SESSION-01, SESSION-02, SESSION-03, SESSION-07, SESSION-08, SESSION-09.

**Fuera del scope de esta fase (cubierto en fases posteriores):**
- Tipos de ejercicio `word-buttons` y `match` (Phase 3, EXTYPE-02/03)
- Atajos de teclado 1-4 / Enter / Space (Phase 3, SESSION-06)
- Pantalla Backup con export/import + recordatorio 7 días (Phase 4, BACK-04/05/06)
- Transcripción de los 6 PDFs reales a JSON (Phase 4, SEED-01/02)
- Multi-tab guard, "última export" banner (Phase 5+, polish)

</domain>

<decisions>
## Implementation Decisions

### Navegación y arquitectura de pantallas

- **D-24:** Componente Alpine ÚNICO `appShell()` como `x-data` raíz con `currentScreen` (string: `'home'` | `'picker'` | `'session'` | `'summary'`). Las cuatro pantallas se renderizan vía `<template x-if="currentScreen === 'home'">` mutuamente excluyentes. Sin router de URL — la app es local y el deep-link no aporta.
- **D-25:** `appShell()` es un factory plano: un solo archivo (`src/screens/app.js` o similar) que retorna un objeto con `content`, `state`, `currentScreen`, más TODOS los métodos y sub-estados de las cuatro pantallas como propiedades de un mismo objeto. ~400-500 LOC en un archivo. Prefieren claridad ("`$data` en DevTools muestra todo") sobre composición por spread. El planner puede sub-dividir en helpers privados sin cambiar la decisión arquitectónica.
- **D-26:** El bootstrap (`main.js`) sigue el patrón Promise-handoff de Phase 1: registra `Alpine.data('appShell', () => appShell(appDataReady))` síncronamente antes de Alpine; `appShell.init()` espera la promise antes de marcar `ready`.
- **D-27:** Semántica de abandono del Repaso:
  - Cerrar pestaña / recargar mid-Repaso: descarte silencioso (la sesión nunca llega a `applySessionResult`, alineado con D-20).
  - Pulsar `← Volver al home` mid-Repaso: confirmación inline `¿Descartar esta sesión de repaso? Tus respuestas no se guardarán. [Descartar / Continuar]`. Si confirma descartar, `currentScreen = 'home'` sin tocar state.
- **D-28:** Tras pulsar `Volver al home` desde el resumen: home recargada con estado actualizado (las categorías afectadas muestran su nuevo estado/racha inmediatamente). SIN animación de resaltado.

### Home dashboard (SESSION-01)

- **D-29:** Layout = **tabla densa** (`<table>` de Pico con estilos por defecto). Columnas en este orden:
  1. Estado (badge con glifo Unicode)
  2. Categoría (nombre humano de `categories.json`)
  3. Racha (ej. `0 d`, `5 d`, `21+ d`)
  4. Ejercicios (total absoluto en el JSON, ej. `12`)
  5. Última vez (formato relativo: `hoy`, `ayer`, `hace N d`, `—` si nunca)
- **D-30:** Badges = **glifo Unicode + color de Pico** (sin imagen, sin pill background):
  - `● no-hecha` (gris, `--pico-muted-color` o equivalente)
  - `✓ hecha` (verde, `--pico-color-green-500` o equivalente)
  - `★ dominada` (ámbar/dorado, `--pico-color-amber-500` o equivalente)

  Cada celda incluye `aria-label` con el texto completo del estado por accesibilidad.
- **D-31:** Al alcanzar `dominada`, **NO hay celebración**: solo el badge `★` permanente reemplaza al `✓`. El resumen de fin de sesión menciona el cambio una vez ("Avere: hecha → dominada"). Coherente con el tono sobrio del proyecto y con "sigue apareciendo igual en sesiones".
- **D-32:** Encima de la tabla, **dos botones grandes lado a lado**: `Repaso 20` y `Test completo`. Cada botón abre el picker con su modo ya elegido. Tras los botones, una nota sutil si hay un test in-flight pendiente (ver D-39).

### Picker + lanzador de modos (SESSION-02 / SESSION-03)

- **D-33:** **Picker único compartido** entre los dos modos. El modo se hereda del botón pulsado en home y se muestra en la cabecera del picker:
  - Cabecera `Repaso de 20 ejercicios` o `Test completo`
  - Mismos checkboxes de categorías, mismos botones `Seleccionar todo` / `Quitar todo`
  - Botón `Empezar` con label que cambia según el modo
- **D-34:** Defaults de los checkboxes: **TODOS desmarcados** al entrar al picker. Botón `Empezar` deshabilitado (visualmente apagado) hasta que haya ≥1 categoría marcada. Más deliberado, fuerza al usuario a confirmar qué quiere practicar.
- **D-35:** **Contador en vivo en el label del botón** (única fuente de verdad, sin texto extra):
  - Repaso 20 con pool ≥ 20: `Empezar repaso (20 ejercicios)`
  - Repaso 20 con pool < 20: `Empezar repaso (14 ejercicios — todos los disponibles)`
  - Test completo: `Empezar test completo (87 ejercicios)`
  - Pool = 0 (ninguna marcada): botón disabled.
- **D-36:** **Aviso inline** para Test completo (no modal): cuando el modo es `test-completo`, debajo del botón aparece un `<p>` discreto: `⚠ Test completo — N ejercicios sin tope. Se puede reanudar si lo cierras a medias.`. Pulsar `Empezar` arranca sin confirmación adicional.

### Resumen de fin de sesión (SESSION-07)

- **D-37:** **Pantalla completa** (no toast, no modal). Estructura:
  1. Encabezado: `Sesión terminada · 18/20 correctos`.
  2. Lista de categorías tocadas (la parte prominente), una entrada por categoría con:
     - Estado antes → después (ej. `hecha → no-hecha`).
     - Racha antes → después (ej. `racha 4 → 0`).
     - Si hubo fallo: razón concreta (ej. `falló avere-007 (multi: avere + género)`).
     - Si sigue `no-hecha` tras la sesión: `N ejercicios para volver a hecha` (= total - len(clearedExerciseIds)).
     - Si promoción ocurrió: `Profesiones: no-hecha → hecha ✓` (sin fanfare adicional).
  3. Botón ÚNICO `Volver al home` al pie.

  **Tono = neutral factústico.** Texto plano, sin reformulaciones positivas tipo "necesita revisión". Color rojizo sutil en la flecha cuando hay regresión (`hecha → no-hecha`), verde sutil cuando hay promoción. Sin emojis decorativos. Sin botón `Repetir esta sesión` / `Empezar otra` (descartado por simplicidad del flujo lineal).

### Mecánica de estados (DOMAIN-04, DOMAIN-05, DOMAIN-06, DOMAIN-07, DOMAIN-08)

- **D-38:** **Racha cuenta solo cuando la categoría está en (o se promociona a) `hecha`** + sin fallo en esta categoría en la sesión + `lastSuccessDate !== today`. Concretamente:
  - Categoría `no-hecha` que NO se promociona a `hecha` en la sesión: racha NO incrementa.
  - Categoría que se promociona `no-hecha → hecha` en la sesión: racha = 1 (el día de promoción cuenta como día 1).
  - Categoría ya en `hecha` que se toca sin fallar en la sesión (aunque NO cubras todos sus ejercicios — basta con 1): racha += 1, una sola vez por día via `lastSuccessDate`.
  - Categoría con ≥1 fallo en la sesión: racha = 0.

- **D-39:** **Cascada de fallo = fail-wins absoluto, evaluada al final de sesión**. `applySessionResult` (puro) recibe la sesión completa y procesa:
  1. Calcula `failedCategoryIds = unión de categoryIds de todos los ejercicios fallados en la sesión`.
  2. Para cada categoría en `failedCategoryIds`:
     - `status = 'no-hecha'`
     - `clearedExerciseIds = []` (todos los aciertos previos en esta sesión Y los acumulados de sesiones anteriores se descartan).
     - `streakDays = 0`
     - `becameHechaAt = undefined`, `becameDominadaAt = undefined`
  3. Para cada categoría NO en `failedCategoryIds` pero tocada en la sesión:
     - Añadir todos los `exerciseId` acertados de esa categoría a `clearedExerciseIds` (idempotente, sin duplicados).
     - Si `clearedExerciseIds.length === total ejercicios de la categoría`:
       - Si `status === 'no-hecha'`: `status = 'hecha'`, `becameHechaAt = today`, `streakDays = 1`, `lastSuccessDate = today`.
       - Si `status === 'hecha'` y `lastSuccessDate !== today`: `streakDays += 1`, `lastSuccessDate = today`. Si llega a 21: `status = 'dominada'`, `becameDominadaAt = today`.
     - Si `status === 'hecha'` (ya estaba, aunque cleared no cubra el total esta vez — es posible si vienes de varias sesiones acumuladas y esta no la completa toda) y `lastSuccessDate !== today`: `streakDays += 1`, `lastSuccessDate = today`. Misma promoción a `dominada` si llega a 21.
  4. Actualizar `lastPracticedDate = today` para todas las categorías tocadas (en fail o no).
  5. Actualizar `dailyLog[today]` con `categoriesPracticed` y `categoriesWithFailure`.
  6. `exerciseStats` se actualiza siempre (monotónico, sin importar fail/correct), igual que en Phase 1.

- **D-40:** **DOMAIN-06 — añadir ejercicio nuevo al JSON regresa categoría a `no-hecha`**: evaluado en el **boot** (`main.js` o al cargar content + state). Para cada categoría con `status ∈ {'hecha', 'dominada'}`, si existe algún ejercicio en el content cuyo `id` no está en `clearedExerciseIds`: `status = 'no-hecha'`, `streakDays = 0`, `becameHechaAt = undefined`, `becameDominadaAt = undefined`. `clearedExerciseIds` NO se vacía (los aciertos previos siguen contando para futuras sesiones que cubran el ejercicio nuevo). Esto NO toca el dailyLog ni los `exerciseStats`.

### Persistencia in-flight de Test completo (SESSION-09)

- **D-41:** **`inFlightTest` como subcampo de `italianCourse.v1`** (mismo blob, no clave separada). Shape:
  ```ts
  {
    schemaVersion: 2,
    exerciseStats: { ... },     // como Phase 1
    categoryProgress: { ... },  // nuevo en Phase 2
    dailyLog: { ... },          // nuevo en Phase 2
    inFlightTest?: {
      categoryIds: string[],
      exerciseIds: string[],     // orden ya generado
      cursor: number,
      answers: Array<{exerciseId: string, correct: boolean}>,
      startedAt: number          // epoch ms
    }
  }
  ```
- **D-42:** **Escritura tras cada respuesta** del Test completo (`selectOption` o `advance` escribe el `inFlightTest` actualizado). Localstorage es síncrono y trivialmente rápido a este volumen. La research lo recomienda explícitamente para Test completo.
- **D-43:** **Banner persistente en el home** cuando hay `inFlightTest` no `null`:
  - `⚠ Tienes un Test completo a medias (12/87 ejercicios). [Reanudar] [Descartar]`
  - Va encima de la tabla de categorías (no interrumpe modal, simplemente visible).
  - `Reanudar` lleva directo a la sesión con el cursor y respuestas cargadas.
  - `Descartar` requiere confirmación inline: `¿Descartar el test? Los aciertos hasta ahora no se guardarán.` Luego limpia `inFlightTest = undefined`.
- **D-44:** **Conflicto al pulsar `Test completo` (nuevo) con in-flight pendiente**: confirmación `Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo? [Descartar y empezar / Cancelar]`. Sin esta confirmación, el botón nunca destruye un test in-flight.
- **D-45:** Al **completar** el Test completo (cursor pasa del último ejercicio): `applySessionResult` corre con todas las respuestas y `inFlightTest = undefined`. La cascada se evalúa al final igual que en Repaso.

### Estructura del state ampliado (extiende D-19 de Phase 1)

- **D-46:** **Migración schemaVersion 1 → 2 en `storage.js`**. Al cargar:
  - Si `schemaVersion === 1`: añadir `categoryProgress = {}`, `dailyLog = {}`, `inFlightTest = undefined`, `schemaVersion = 2`. Conservar `exerciseStats` tal cual.
  - Si `schemaVersion === 2`: ya está al día.
  - Otros: blank state (comportamiento defensivo de Phase 1 sin cambios).
- **D-47:** **Inicialización lazy de `categoryProgress[categoryId]`**: si no existe, se crea con `{ status: 'no-hecha', clearedExerciseIds: [], streakDays: 0, lastPracticedDate: undefined, lastSuccessDate: undefined, becameHechaAt: undefined, becameDominadaAt: undefined }`. Equivale a "categoría nunca tocada".
- **D-48:** **`dailyLog[isoDate]`** estructura: `{ date: isoDate, categoriesPracticed: string[], categoriesWithFailure: string[] }`. Una entrada por día tocado. Sin cap de tamaño en Phase 2 (la research dice que el coste es mínimo; un cap de 365 días es polish de Phase 5 si emerge la necesidad).

### Sampler ampliado (DOMAIN-02 → DOMAIN-03)

- **D-49:** **`buildSession` añade GUARANTEE phase antes del FILL** (la FILL phase existente de Phase 1 se mantiene). Algoritmo:
  1. Pool = ejercicios cuyo `categoryIds` solape con `selectedCategoryIds`.
  2. GUARANTEE: para cada `cat` en `selectedCategoryIds`:
     - Si ya hay un ejercicio en `session` que incluye `cat`: skip (un ejercicio multi-cat cubre N categorías).
     - Si no, candidates = `pool ∩ (ejercicios que incluyen cat) \ session`.
     - Si `candidates` vacío: skip silenciosamente (categoría sin ejercicios disponibles — caso poco común, ej. todos ya están en session vía multi-cat).
     - Si no, muestreo ponderado de candidates con la misma `exerciseWeight` actual; añadir al session.
  3. FILL: como en Phase 1, weighted random sin reemplazo hasta `min(targetSize, |pool|)`. Excluyendo los ya en session.
  4. Fisher-Yates final con el mismo RNG para que los picks de la guarantee no queden todos al principio.
- **D-50:** **`buildFullTest(selectedCategoryIds, allExercises)`** = función pura nueva: pool filtrado por categorías + Fisher-Yates (con RNG inyectable para tests). Sin tope, sin weighted sampling, sin guarantee phase (todos los ejercicios entran).
- **D-51:** **Sampler con categorías oversubscritas** (ej. 25 categorías seleccionadas, target 20): la GUARANTEE phase intentará picks hasta target. Si después de la guarantee `|session| === target`, no hay FILL phase. Si la GUARANTEE phase no puede cubrir todas las categorías (ej. categoría sin ejercicios), simplemente no se cubren. La research advertía sobre mostrar un aviso "Has elegido 25 categorías para 20 ejercicios — algunas quedarán fuera" — **diferido a deferred** ya que en v1 el usuario tiene 6 categorías máximo y el caso es teórico.

### Refinements post-UAT round 2 de Plan 02-03 (cambios de semántica)

- **D-54: Fail-cascade INMEDIATA (refinement de D-39 tras UAT round 2 de Plan 02-03).** El autor probó la app y detectó un exploit que violaba el core value:

  > "Si a mitad de sesión de ejercicios, fallas, y te sales del ejercicio y vuelves a la home, no te cambia el estado ni la racha, como si no hubieras fallado, eso debería ser inmediato, en cuanto fallas, lección no hecha y racha perdida."

  **Root cause:** D-39 decidió "cascada evaluada al final de sesión" + SESSION-08 dice "Repaso abandonado se descarta". La combinación creaba un atajo perverso: fallas un ejercicio → te das cuenta → cierras pestaña / pulsas Descartar → el fallo NO se registra → core value "te obliga a no olvidar" violado.

  **Nueva regla canónica:**
  - En cuanto el usuario selecciona una opción INCORRECTA en un ejercicio:
    - Para cada categoría en `exercise.categoryIds`: aplicar la cascada (`status='no-hecha'`, `clearedExerciseIds=[]`, `streakDays=0`, `becameHechaAt=undefined`, `becameDominadaAt=undefined`)
    - Añadir las categorías a `dailyLog[today].categoriesPracticed` Y `.categoriesWithFailure`
    - Persistir a localStorage INMEDIATAMENTE (`saveState`)
  - Los ACIERTOS siguen el patrón existente (write-once-at-session-end via `applySessionResult`, D-20).
  - Al final de sesión, `applySessionResult` SIGUE corriéndose con el `sessionResults` COMPLETO (fails + successes). La cascada es **idempotente** (state.categoryProgress ya está reseteado, re-aplicar es no-op). Los contadores `exerciseStats` SE BUMPEAN UNA SOLA VEZ ahí (no en el mid-session write), preservando D-09 monotonicidad sin doble conteo.

  **Implementación:** export pura `applyImmediateFailure(state, exercise, content, today)` en `src/domain/progress.js`. Caller: `src/screens/app.js > sessionSelectOption` en el branch `!correct`. `applySessionResult` NO cambia su firma ni su lógica.

  **Excepción D-54 vs SESSION-08:** los fallos individuales se persisten inmediatamente; SOLO los aciertos de un Repaso abandonado se descartan. Esta excepción está documentada en REQUIREMENTS.md DOMAIN-04 / SESSION-08 como nota explícita.

- **D-55: Display de Racha `N / 21 d` (refinement de D-29 tras UAT round 2 de Plan 02-03).** Cita del autor:

  > "Y en racha, debería poner 1 d / 21 d para saber que el objetivo es llegar a 21 días."

  **Nueva regla en la celda Racha de la tabla home:**
  - `no-hecha` o `hecha` con cualquier streakDays: mostrar `{N} / 21 d` (ej. `0 / 21 d`, `5 / 21 d`, `20 / 21 d`). El usuario ve cuánto le falta para alcanzar el objetivo.
  - `dominada` (ya superó los 21 días): mostrar `{N} d` solo (ej. `25 d`). El `/ 21 d` no aporta — la columna Estado tiene el ★ que indica dominada. El contador acumulado sigue siendo informativo (cuántos días llevas en dominada).

  **Implementación:** `formatStreak(streak, status)` en `src/screens/app.js` con el nuevo parámetro `status`. No requiere cambios en `index.html` (la celda ya bindea `x-text="cat.streakLabel"`).

### Testabilidad del dominio (DOMAIN-10)

- **D-52:** **`today` como parámetro explícito** de `applySessionResult(state, sessionResult, content, today)`. El caller (screens) llama con `today: todayLocal()`. Los tests inyectan strings ISO arbitrarios (`'2026-05-23'`, `'2026-06-13'`, etc.). Más puro y testeable. Rompe la firma de Phase 1 — la actualización del caller (screens/session.js → screens/app.js refactor) es parte del plan.
- **D-53:** **Suite de smoke tests obligatoria** (≥30 días simulados, en `tests/domain.test.js` extendido o `tests/domain-state.test.js` nuevo) cubriendo:
  1. **Cascada multi-cat**: ejercicio `[avere, genero]` fallado tras acierto previo en `[avere]` → `clearedExerciseIds[avere] = []`, `clearedExerciseIds[genero] = []`, racha 0 ambas. Aciertos previos descartados.
  2. **Promoción y regresión completas**:
     - Acumular aciertos en 3 sesiones sin fallo → `no-hecha → hecha` en la sesión que cubre el último ejercicio, `becameHechaAt = today`, `streakDays = 1`.
     - Simular 21 días con 1 sesión diaria tocando Avere sin fallar (ya `hecha`) → en el día 21, `status = 'dominada'`, `becameDominadaAt = today`. Sigue apareciendo en sample con peso normal.
     - Tras `dominada` con racha 25, sesión con fallo en Avere → `status = 'no-hecha'`, `streakDays = 0`, `becameDominadaAt = undefined`.
  3. **Racha guard + DOMAIN-06**: 5 sesiones el día X sin fallar Avere → racha += 1, no += 5. Por separado: cargar content con ejercicio nuevo no presente en `clearedExerciseIds[avere]` → si Avere estaba `hecha`/`dominada`, regresa a `no-hecha` con cleared preservado, racha 0.
  4. **Sampler edge cases**:
     - GUARANTEE phase con categoría que solo tiene 1 ejercicio → cubre, no repite.
     - GUARANTEE phase con ejercicio multi-cat que cubre 2 categorías simultáneamente → no duplica.
     - Weight cap saturado: 2 ejercicios `timesShown=0` y `timesShown=100` en mismo pool → ratio de selección ≈ 11x con seeded RNG sobre 1000 iteraciones (tolerancia ~5%).
     - `buildFullTest` con 3 categorías y 12 ejercicios totales → resultado tiene 12 ejercicios, todos únicos, todos los IDs presentes.

### Claude's Discretion

- **Estilos visuales concretos del badge** (qué tono exacto de verde/ámbar dentro de las CSS vars de Pico, padding del glifo, font-weight). El planner elige siempre que sean visualmente distinguibles y cumplan WCAG contrast.
- **Layout HTML exacto** de cada pantalla (jerarquía de `<section>`, `<article>`, `<header>`), respetando classless de Pico.
- **Nombres internos de propiedades del `appShell`** (`currentScreen` está fijado por D-24; el resto puede ser `pickerCheckedCategories`, `pickerMode`, `summaryDelta`, etc. — discretion).
- **Estructura del `summaryDelta`** que feed el resumen: cómo se computa internamente y se pasa al template Alpine (probablemente un getter computado de `applySessionResult`'s diff).
- **Implementación concreta del descarte de `inFlightTest`** al completar Test completo (probablemente parte de `applySessionResult` o un helper en screens/app.js — discretion).
- **Decisión de empaquetar el código nuevo de pantallas en `src/screens/app.js` solo, o split** `src/screens/{home,picker,session,summary,app}.js` con `app.js` como orquestador que compone (lo prohíbe D-25 si rompe la regla "todo en un factory" — el split es OK si es solo organización interna del MISMO factory, p.ej. helpers que `app.js` importa y compone en un solo objeto Alpine).
- **Cómo se materializa la confirmación inline** ("¿Descartar?"): un `<dialog>` nativo, un `confirm()`, un sub-template Alpine con `x-show` — discretion siempre que sea consistente entre los tres puntos donde se usa (D-27, D-43, D-44).
- **`exerciseStats.lastShownAt`** (opcional, mencionado en la research): si añadirlo o no. La research lo trata como "useful for don't repeat in same session" pero el sampler ya garantiza unicidad por sin-reemplazo. Discretion (probablemente no, simplicidad).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope, Key Decisions (actualizado tras Phase 1)
- `.planning/REQUIREMENTS.md` — 13 requisitos Phase 2 (DOMAIN-03..08+10, SESSION-01..03+07..09), Out of Scope con razones
- `.planning/ROADMAP.md` §"Phase 2" — Goal, requirements list, 6 success criteria
- `.planning/STATE.md` — Decisiones acumuladas tras Phase 1 (especialmente fail-strict, Test completo reanudable, weight cap=10, contadores monotónicos)

### Phase 1 (mantienen vigencia en Phase 2)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — D-01..D-23 siguen aplicando (estructura de carpetas, schema JSON, validación, NFC, npx serve, schemaVersion, layer purity)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-VERIFICATION.md` — Verifica el patrón Alpine boot (script-ordering + Promise handoff) que Phase 2 mantiene
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md` — Race condition Alpine descubierta en UAT; el patrón Promise handoff es OBLIGATORIO en Phase 2

### Research (HIGH-priority read antes de planificar)
- `.planning/research/SUMMARY.md` — Síntesis general; section "Top Pitfalls" #2 (reset cascade), #4 (JSON typos), #5 (per-answer writes), #6 (weighted random collapse) son críticos para Phase 2
- `.planning/research/ARCHITECTURE.md` §7 — State machine completo con pseudocódigo de `applySessionResult` (la implementación es derivada directa de esa sección, MUST READ)
- `.planning/research/ARCHITECTURE.md` §6 — Session generation algorithm (GUARANTEE + FILL phases), MUST READ
- `.planning/research/ARCHITECTURE.md` §8 — Time / Date handling, `dayKey` semantics
- `.planning/research/PITFALLS.md` #2 (reset cascade model), #4 (weighted random collapse), #5 (localStorage), #10 (Test completo abandono / save-on-every-answer) — Phase 2 mitigations are encoded in D-39, D-42, D-46

### External docs (read once when implementing)
- Alpine.js Installation: https://alpinejs.dev/essentials/installation
- Alpine.js Templating (`x-if`, `x-for`, `x-show`, `x-cloak`): https://alpinejs.dev/directives/if
- Pico CSS Documentation (especialmente Tables, Cards, Buttons, Forms): https://picocss.com/docs
- Pico CSS color vars (`--pico-color-green-500`, etc.): https://picocss.com/docs/colors
- MDN `localStorage` quotas + storage event: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Node 22 test runner (`node --test`, `node:assert/strict`): https://nodejs.org/api/test.html

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (Phase 1, refactor needed)

- **`src/screens/session.js`** — La factory actual `sessionScreen(appDataReady)` se REEMPLAZA por `appShell(appDataReady)` en `src/screens/app.js` (D-24/D-25). La lógica de gestión de respuesta + feedback verde/rojo + auto-avance + persistencia se MUEVE como propiedades dentro del `appShell` agrupadas con un prefijo (p.ej. `sessionCursor`, `sessionSelectedIndex`, `sessionFeedback`, `sessionSelectOption()`, `sessionAdvance()`). El planner debe migrar sin perder D-20 (write-once-on-done) ni el handle `autoAdvanceHandle` con cancelación.
- **`src/domain/session.js`** — `buildSession()` actual (FILL-only) se EXTIENDE añadiendo GUARANTEE phase (D-49). Mantener `exerciseWeight()` y `WEIGHT_CAP=10` intactos. La firma de `buildSession(categoryIds, allExercises, state, requestedSize, mode, rng)` se mantiene; solo el cuerpo crece. Añadir `buildFullTest(categoryIds, allExercises, rng)` como nueva export (D-50).
- **`src/domain/progress.js`** — `applySessionResult(state, sessionResult)` se EXTIENDE a `applySessionResult(state, sessionResult, content, today)` (D-52). La lógica actual (counters monotónicos) se preserva como parte del paso 6 de D-39; añadir pasos 1-5 + dailyLog.
- **`src/domain/dates.js`** — `todayLocal()` ya existe en Phase 1 y se sigue usando (el screen layer la llama y la pasa como `today` al dominio).
- **`src/data/storage.js`** — `loadState()` necesita la rama de migración v1→v2 (D-46). `blankState()` actualizado a `{ schemaVersion: 2, exerciseStats: {}, categoryProgress: {}, dailyLog: {}, inFlightTest: undefined }`. `saveState()` sin cambios estructurales (es agnóstico al shape).
- **`src/data/content-loader.js`** — Se invoca con la lista REAL de categorías (no hard-coded `['avere']` de main.js Phase 1). La transcripción de los 6 PDFs es Phase 4, pero la infraestructura para cargarlos debe ya soportar N archivos. **Phase 2 puede seguir con solo avere.json como contenido vivo**, pero el código debe permitir añadir entradas a `categories.json` sin tocar código.
- **`src/main.js`** — Refactor: ya no hard-codea `['avere']`. Lee `categories.json` y carga todos los `content/exercises/<id>.json` listados. Registra `Alpine.data('appShell', ...)` en vez de `sessionScreen`. **Añade**: paso post-loadContent + post-loadState de "regresión por ejercicio nuevo" (D-40) antes de resolver `appDataReady`.
- **`index.html`** — El template del componente Alpine cambia: en lugar de un solo `<div x-data="sessionScreen">`, el cuerpo del `<main>` es un solo `<div x-data="appShell">` con 4 templates condicionales (`<template x-if="currentScreen === '...'">`). Mantener `x-cloak`, las CSS vars `.correcta`/`.incorrecta`, los CDN SRI pinned.
- **`tests/domain.test.js`** + **`tests/util/seeded-rng.js`** — La suite se EXTIENDE para los 4 grupos de D-53. `seededLcg` se mantiene como RNG determinista para sampler tests. Puede partir en archivos (`tests/domain-progress.test.js`, `tests/domain-session.test.js`) o quedarse en uno — discretion del planner.

### Established Patterns (de Phase 1, mantienen vigencia)

- **Layer purity** (D-02): `src/domain/*` y `src/data/schema-validator.js` no importan storage/fetch/DOM. Phase 2 MANTIENE esto: `applySessionResult` sigue siendo puro, `buildSession`/`buildFullTest` siguen siendo puros.
- **Promise handoff Alpine init** (descrito en STATE.md tras UAT 01-02): el patrón `main.js síncrono → addEventListener('alpine:init') → resuelve Promise tras await loadContent` es la única forma que funciona. NO volver al patrón dual de `01-RESEARCH.md` Pattern 8.
- **`registry` para exercise types** (D-01): el registry sigue con solo `multiple-choice` en Phase 2 (los otros tipos llegan en Phase 3). NO añadir entradas vacías.
- **`x-text` exclusivamente, jamás `x-html`** (T-02-01): cualquier nuevo template Alpine sigue esta regla. textContent escapa el HTML del JSON por defecto.
- **`schemaVersion`-based migration en `storage.js`** (BACK-03): v1→v2 se hace con una función `migrate1to2(parsed)` análoga a la rama de Phase 1.
- **Spanish UI** (FOUND-04): todos los textos nuevos en español; los IDs de slugs (`avere`, `genero-numero`) siguen siendo ASCII lowercase.
- **Tests con `node --test`** (D-11): la suite se ejecuta con `node --test tests/*.test.js` (glob, no `tests/` por el bug de Node 22 documentado).
- **CDN pinned con SRI** (D-22): si en Phase 2 añadimos algún plugin de Alpine (improbable; nada lo pide), seguir SRI. No usar `@latest`.

### Integration Points

- **`main.js` boot flow** se amplía: (1) loadContent, (2) loadState con migración v1→v2, (3) **regresión por ejercicio nuevo** (D-40) — itera categoryProgress y mira si hay ejercicios nuevos no en clearedExerciseIds, (4) resolveAppData. El paso 3 PUEDE alterar el state antes de resolver.
- **`appShell.init()`** espera `appDataReady`, recibe `{content, state}`, e inicializa `currentScreen = 'home'`. Si `state.inFlightTest` existe, el banner de home se renderiza condicional (sin cambiar `currentScreen` automáticamente — D-43).
- **`appShell.startSession(mode)`** (nuevo método): `mode ∈ {'repaso', 'test-completo'}`. Llama a `buildSession(state.pickerSelectedCategoryIds, content.allExercises, state, 20, 'repaso')` o `buildFullTest(...)`. Resetea sub-estados de sesión. Cambia `currentScreen = 'session'`. Si `test-completo`, escribe `inFlightTest` inicial.
- **`appShell.completeSession()`** (nuevo método, invocado cuando `cursor >= exerciseIds.length`): construye `sessionResult`, llama `applySessionResult(state, sessionResult, content, todayLocal())`, calcula `summaryDelta` (capturando `categoryProgress` antes/después por categoría tocada), `saveState`, limpia `inFlightTest`, `currentScreen = 'summary'`.
- **`appShell.returnToHome()`** (nuevo método): valida abandono si `currentScreen === 'session'` y `mode === 'repaso'` (D-27). Si `summary` o `home`, navega directo. Si Test completo en progreso, el flow es distinto (siempre persiste vía `inFlightTest`).

### Estructura final esperada (post-Phase 2)

```
src/
├── main.js                  # boot + Alpine registration (refactor)
├── domain/
│   ├── dates.js             # sin cambios
│   ├── progress.js          # applySessionResult extendido + helpers
│   └── session.js           # buildSession + buildFullTest
├── data/
│   ├── content-loader.js    # carga N categorías (Phase 1 ya lo permite)
│   ├── schema-validator.js  # sin cambios
│   └── storage.js           # blankState v2 + migrate1to2
├── exercise-types/
│   ├── index.js             # sin cambios (solo multiple-choice)
│   └── multiple-choice.js   # sin cambios
└── screens/
    ├── app.js               # NUEVO: factory appShell(appDataReady) plano
    └── session.js           # DELETED o vaciado (migrado a app.js)
content/
├── categories.json          # sin cambios estructurales (solo avere mientras Phase 2)
└── exercises/avere.json     # sin cambios
tests/
├── domain.test.js           # extendido (o split en domain-{progress,session}.test.js)
└── util/seeded-rng.js       # sin cambios
```

</code_context>

<specifics>
## Specific Ideas

- **Tabla densa con 5 columnas exactas** (D-29): coherente con el estilo "menos es más" del autor. NO añadir % de acierto, gráficos, sparklines — eso es Phase 5+ polish (QOL-02/03 son v2).
- **Glifo Unicode sin imagen** (D-30): refuerza "doble click y funciona" + cero dependencias adicionales. Pico maneja los colores; el HTML es solo texto.
- **Sin celebración para `dominada`** (D-31): la mecánica de "dominada sigue apareciendo igual" se traiciona si la celebración la convierte en algo especial. El badge `★` es la única señal y eso es deliberado.
- **Confirmación inline para descarte** (D-27, D-43, D-44): tres puntos donde se ofrece descartar trabajo, todos con el mismo patrón visual. El planner DEBE usar la misma estrategia en los tres para coherencia (probablemente un sub-template Alpine con `x-show` + dos botones).
- **`applySessionResult` puro con `today` inyectado** (D-52): explicar el cambio de firma en el SUMMARY del primer plan que lo toque, para que el verifier no marque como anti-pattern la firma extendida.
- **Banner in-flight test compite por espacio con los botones grandes**: en el home, el orden vertical sugerido es (top → bottom):
  1. Título `Italiano A1/A2`
  2. Si `inFlightTest`: banner amarillo con 2 botones
  3. Dos botones grandes (Repaso 20 / Test completo)
  4. Tabla de categorías
- **`exerciseStats.lastShownAt`**: la research lo propone como opcional. El autor no lo pidió. Probablemente NO añadirlo en Phase 2 (Claude's Discretion).
- **`dailyLog` sin cap en Phase 2**: el tamaño es trivial (centenares de bytes por día); polish de cap en Phase 5 cuando emerja.

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **Animación de resaltado en filas de categorías tocadas** al volver de resumen (descartada en D-28). Considerar en Phase 5 (polish) si el autor pide más feedback visual.
- **Botón `Repetir esta sesión` / `Empezar otra` en el resumen** (descartado en D-37). Útil para sesiones consecutivas tras una cascada. Considerar en Phase 3 o Phase 5 si el patrón de uso lo justifica.
- **Botón por fila en el home (acceso rápido a la categoría)**: un `▶` en cada fila que abre el picker con solo esa categoría pre-marcada. Descartado por no estar en SESSION-01/02. Considerar en Phase 5 si el flujo "marcar/desmarcar para ir a una sola" se siente lento.
- **Recordar la última selección del picker** (descartado en D-34, queremos defaults vacíos para forzar decisión deliberada). Reconsiderar en Phase 5 si el patrón "abrir picker y marcar las mismas 6 cada día" se vuelve fricción.
- **Aviso "Has elegido N categorías para 20 ejercicios — algunas quedarán fuera"** cuando el picker oversubscribe el target (mencionado en research §6). Diferido — improbable con 6 categorías máximo en v1.
- **`lastShownAt` en `exerciseStats`** (opcional en research §2.2): no añadir en Phase 2. Si emerge necesidad (ej. dashboard temporal por ejercicio), reconsiderar.
- **Cap del `dailyLog`** (research §10 propone 365 días): polish de Phase 5 cuando el tamaño se acerque a 1 MB (~3000 días con 6 categorías por día).
- **Multi-tab guard** (pitfall #9): polish de Phase 5; el autor no opera con dos pestañas habitualmente.

</deferred>

---

*Phase: 2-Mecánica completa de re-verificación (cascada + estados + dashboard)*
*Context gathered: 2026-05-23*
*Last updated: 2026-05-23 — refined D-39 + D-29 from UAT round 2 of Plan 02-03 (D-54 fail-cascade inmediata + D-55 racha display N/21 d)*
