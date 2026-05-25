# Phase 6: Polish UX post-sesión — reiniciar + review errores - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 entrega **dos pulidos UX sobre flujos existentes**, sin cambios en el motor de re-verificación (D-54 cascada inmediata, D-09 monotonicidad, sampler, layer purity — todo intacto):

**Capacidades entregadas:**
- **(a) Botón "Reiniciar ejercicios"** en la pantalla de sesión (solo cuando `sessionMode === 'repaso'`) que rearranca un Repaso 20 con las MISMAS categorías seleccionadas en **1 clic**, descartando aciertos no-comprometidos y preservando los fallos D-54 ya persistidos. Soluciona el dolor capturado en UAT Phase 4: "muchas veces fallas a mitad y tienes que dar Volver al home → Descartar → Repaso 20 → seleccionar → Empezar — 4 clicks y 2 pantallas — por 1 solo click que reinicie".
- **(b) Sección "Errores cometidos"** en la pantalla de resumen (post-SESSION-07) que renderiza, para cada ejercicio fallado, una fila multi-línea con: prompt original + tu respuesta (rojo) + respuesta correcta (verde). Aplica a **ambos modos de sesión** (Repaso 20 + Test completo) y a los **3 tipos** de ejercicio (multi-choice / word-buttons / match). Resuelve el deseo UAT: "ver al final todos los errores en vez de repasarlos según vas fallando".

**Requisitos cubiertos:** UX-01 (botón reiniciar) + UX-02 (review de errores en resumen).

**Fuera del scope:**
- Botón "Reiniciar" en Test completo — el banner home (Reanudar/Descartar D-43) ya cubre ese caso; reiniciar 200+ ejercicios rara vez tiene sentido. Si emerge dolor en v2, fase futura.
- Persistencia rolling de "errores recientes" entre sesiones (state.recentErrors[]) — el autor no lo pidió; tras pulsar "Volver al home" el resumen se limpia. v2 candidate.
- Pantalla nueva o sección en home para consultar errores históricos — out of scope v1; el repaso es post-sesión inmediato.
- Cambios al sampler `buildSession()` — re-llamarlo con state actualizado funciona idéntico, no requiere modificación.
- Cambios al motor de cascada D-54, promociones, racha, dailyLog — todos intactos.
- Logging persistente del propio `sessionResults` completo (los aciertos también) — solo los errores se renderizan, los aciertos siguen siendo factoring del summaryDelta agregado.
- UI específica para destacar visualmente errores multi-cat — el resumen factual (`summaryDelta`) ya muestra las 2+ categorías reseteadas en su sección; la fila de "Errores cometidos" se mantiene neutral (1 ejercicio = 1 fila).

</domain>

<decisions>
## Implementation Decisions

### UX-01 (a): Botón "Reiniciar ejercicios"

- **D-100:** **El botón aplica SOLO a Repaso 20.** Visible cuando `sessionMode === 'repaso'`, oculto en Test completo. En Test completo el banner del home (D-41/D-43) ya entrega el equivalente funcional (Reanudar/Descartar + relanzar) sin asimetría destructiva durante la sesión. El dolor del UAT Phase 4 es puramente sobre Repaso 20 ("4 clicks, 2 pantallas"). Solución quirúrgica al dolor real.

- **D-101:** **Reiniciar = descartar aciertos + preservar fallos D-54 + re-llamar `buildSession`.** Semántica idéntica al patrón ya establecido SESSION-08/D-54 ("abandono descarta aciertos, fallos persisten siempre"):
  - **Aciertos no-comprometidos** de la sesión actual: se descartan (cero efecto sobre `exerciseStats` — los timesShown/timesCorrect/timesFailed NO se bumpean — coherente con SESSION-08 abandono).
  - **Fallos D-54** ya persistidos via `applyImmediateFailure` (cascada inmediata): **se preservan**. El invariante "te obliga a no olvidar" prevalece — no se pueden deshacer.
  - **Re-sampling:** llama a `buildSession(pickerCheckedCategoryIds, allExercises, state, 20, 'repaso')` con el state actualizado (post-D-54 si aplicaron). Los 20 ejercicios nuevos pueden diferir de los 20 anteriores por aleatoriedad del sampler — comportamiento deseable: ya viste algunos.
  - **`pickerCheckedCategoryIds`** se preserva tal cual (las "MISMAS categorías seleccionadas" del ROADMAP §1).
  - **Sub-estado de sesión** (cursor, sessionResults, sessionFeedback, sub-templates word-buttons/match) se resetea exactamente como hace `resetSession()`. Cancelar autoAdvance + matchFlash defensivo.

- **D-102:** **Reset directo en 1 clic — SIN `requestConfirm()` inline.** Coherente con el dolor que motiva la feature ("por 1 solo click que reinicie"). Añadir confirmación devolvería el flujo a 2 clics y abriría un modal — contradice el espíritu del UAT. Los fallos D-54 ya están persistidos y no pueden deshacerse; los aciertos descartados son consistentes con el modelo SESSION-08 que ya descarta por defecto al abandonar Repaso. Sin confirmación es coherente con el modelo.

- **D-103:** **Posición visual: `.button-row` bajo el `<hr>` de la pantalla session, junto a `← Volver al home`.** Misma fila, clase Pico `secondary`. Patrón consistente con picker/backup/home (líneas index.html 198/493/144). Visible toda la sesión sin importar `sessionFeedback` (acierto/fallo/sin-responder). Cero clutter porque va donde ya hay un botón secundario.
  - Etiqueta sugerida: `"Reiniciar ejercicios"` (planner refina si el ancho del botón en `.button-row` quedaría apretado — abreviar a `"Reiniciar"` aceptable).
  - `x-show="sessionMode === 'repaso'"` para ocultarlo en Test completo.

- **D-104:** **Implementación: un handler nuevo `restartRepaso()` en el factory `appShell`.** Pseudo-código:
  ```js
  restartRepaso() {
    if (this.sessionMode !== 'repaso') return; // defensivo
    // Reusar la lógica de buildSession con state actualizado.
    const allExercises = Object.values(this.content.exerciseById);
    const result = buildSession(
      this.pickerCheckedCategoryIds,
      allExercises,
      this.state,
      20,
      'repaso'
    );
    // Reset sub-estado de sesión preservando sessionMode + pickerCheckedCategoryIds.
    this.cancelAutoAdvance();
    this.cancelMatchFlash();
    this.sessionExerciseIds = result.exerciseIds;
    this.sessionCursor = 0;
    this.sessionResults = [];
    this.sessionSelectedIndex = null;
    this.sessionFeedback = null;
    this.wordButtonsBank = [];
    this.wordButtonsAnswer = [];
    this.matchLeft = [];
    this.matchRight = [];
    this.matchSelectedLeftIdx = null;
    this.matchPairsConsumed = [];
    this.matchHadFailure = false;
    this.matchFirstWrongPair = null; // D-107
    // Inicializar sub-estado del PRIMER ejercicio nuevo.
    if (result.exerciseIds.length > 0) {
      const firstEx = this.content.exerciseById[result.exerciseIds[0]];
      this.initSubStateForExercise(firstEx);
    }
    // No transicionamos `currentScreen` — ya estamos en 'session'.
  }
  ```
  El planner valora si extraer un helper común con `startSession()` (líneas 367-412) para los bloques shared (reset sub-estado + initSubStateForExercise), o si la duplicación de ~10 líneas es preferible a una abstracción prematura. Recomendación: duplicación aceptable en v1; refactor solo si emerge un 3er call-site.

### UX-02 (b): Sección "Errores cometidos" en el resumen

- **D-105:** **Extender el shape de `sessionResults` con `userAnswer`.** Shape uniforme para los 3 tipos:
  ```js
  sessionResults.push({
    exerciseId: string,
    correct: boolean,
    userAnswer:
      | string                              // multi-choice
      | string[]                            // word-buttons
      | { left: string, right: string }     // match (primer pareo erróneo)
      | null                                // match correcto (sin fallos) → null
  })
  ```
  - **multi-choice:** `userAnswer = ex.payload.options[sessionSelectedIndex]` (texto literal de la opción clickada). Robusto frente a futuros refactors de `options[]` shape — muestra exactamente lo que el autor ve.
  - **word-buttons:** `userAnswer = [...this.wordButtonsAnswer]` (clon defensivo del array de palabras formado en orden). El resumen lo une con `.join(' ')` igual que la respuesta correcta hoy (index.html línea 328).
  - **match:** `userAnswer = { left, right }` del **PRIMER pareo erróneo** capturado en `matchPickRight` cuando `result.correct === false && !this.matchHadFailure` (mismo guard que la cascada D-61 inmediata). Si el ejercicio se completa sin fallos, `userAnswer = null`.

- **D-106:** **`applyResultToSession(ex, correct, userAnswer)` — tercer argumento.** El único call-site del push (línea 833) se extiende con el 3er arg. Las 3 call-sites del helper lo pasan:
  - `sessionSelectOption(idx)`: `applyResultToSession(ex, correct, ex.payload.options[idx])`
  - `wordButtonsCheck()`: `applyResultToSession(ex, correct, [...this.wordButtonsAnswer])`
  - `matchPickRight()` (al completar todas las parejas): `applyResultToSession(ex, !this.matchHadFailure, this.matchFirstWrongPair)` — `matchFirstWrongPair` es `null` si no hubo fallo, `{left, right}` si lo hubo.

- **D-107:** **Nuevo sub-estado `matchFirstWrongPair: null` en el factory `appShell`.**
  - Se setea **una sola vez** dentro del `if (!this.matchHadFailure)` branch de `matchPickRight` (líneas 1056-1070), capturando `{left: leftWord, right: rightWord}` del intento erróneo justo antes de marcar `matchHadFailure = true`.
  - Se resetea a `null` en `resetSession()` (línea 270) junto con los otros sub-estados de match.
  - También se resetea en `restartRepaso()` (D-104).
  - Su lectura ocurre solo dentro de `matchPickRight` al completar todas las parejas (rama `correct` del completion). Inmutable durante el resto del ejercicio.

- **D-108:** **Lista plana cronológica.** El template summary añade `<section>` o `<ul>` nueva tras `<ul.summary-delta>` actual (index.html línea 437-458). Filtro:
  ```html
  <template x-if="sessionResults.some(r => !r.correct)">
    <section class="summary-errors">
      <h3>Errores cometidos</h3>
      <ul>
        <template x-for="result in sessionResults.filter(r => !r.correct)" :key="result.exerciseId">
          <li>...</li>
        </template>
      </ul>
    </section>
  </template>
  ```
  - Sin agrupación por categoría ni por tipo — el orden cronológico (orden de respuesta) refleja la experiencia natural del autor.
  - El template del `<li>` consulta `content.exerciseById[result.exerciseId]` para obtener prompt + tipo + datos del payload — `content` ya está en memoria, sin penalización.
  - **`x-if` guard sobre `sessionResults.some(!correct)`** evita renderizar la sección vacía cuando no hubo errores.

- **D-109:** **Layout de cada fila: multi-línea con clase `.incorrecta` (rojo) ya existente.**
  - `<li>` con `<strong>` del prompt arriba.
  - Línea siguiente: `Tu respuesta: <span class="incorrecta">{userAnswer renderizado por tipo}</span>`.
  - Línea siguiente: `Respuesta correcta: <strong>{correct answer por tipo}</strong>`.
  - Renderizado por tipo (dispatch table o `x-if` por `ex.type` en el sub-template):
    - **multi-choice:** `userAnswer` directo + `ex.payload.options[ex.payload.correctIndex]` como correcto.
    - **word-buttons:** `userAnswer.join(' ')` + `ex.payload.answer.join(' ')` como correcto.
    - **match:** `${userAnswer.left} ↔ ${userAnswer.right}` + `${userAnswer.left} ↔ ${correctRight}` donde `correctRight = ex.payload.pairs.find(p => p.left === userAnswer.left).right`. Si por algún motivo no existe el match (defensivo), fallback a mostrar todas las parejas correctas en una sola línea.
  - Reusar la clase `.incorrecta` ya definida (líneas index.html 268/314) que aplica color rojo coherente con el feedback de sesión. Para el "correcto" en verde se puede usar `<strong>` (mismo patrón que líneas 277/328 actuales del resumen de fallo durante la sesión).

- **D-110:** **Persistir `userAnswer` en `inFlightTest.answers`.** El Test completo es reanudable; si el autor falla a mitad, cierra pestaña y reanuda, el resumen final debe mostrar TAMBIÉN los errores pre-cierre con detalle. Implica:
  - `persistInFlightTest()` (línea 443) ya escribe `answers: [...this.sessionResults]` — al extender el shape de `sessionResults` con `userAnswer`, el inFlightTest hereda automáticamente el campo extra. **Sin cambios** en el helper persistInFlightTest.
  - `resumeInFlightTest()` (línea 478) restaura `sessionResults` desde `ift.answers` — los inFlightTest pre-Phase 6 (sin userAnswer) llegan con `userAnswer === undefined` por respuesta. Mostrarían "sin detalle" en la sección de errores (o se omitirían defensivamente). **Tratamiento:** migración v3→v4 (D-111) backfillea `userAnswer = null` en los inFlightTest.answers pre-existentes para evitar undefined.

- **D-111:** **Migración schemaVersion 3 → 4 con `migrate3to4`.**
  - Bump `CURRENT_SCHEMA_VERSION` a 4 en `src/data/storage.js`.
  - Nueva función `migrate3to4(state)`: para cada entrada en `state.inFlightTest?.answers ?? []`, si `userAnswer` está `undefined`, setear a `null`. Devuelve el state actualizado con `schemaVersion: 4`.
  - **Backups v3** importados en post-Phase 6: la cadena `migrate1to2 → migrate2to3 → migrate3to4` corre automáticamente (D-74). Funciona forward-compat.
  - **Backups v4** importados en pre-Phase 6 (entornos sin actualizar): el validator del D-74 los rechaza (`schemaVersion > CURRENT`) con banner "Este backup viene de una versión más nueva de la app". Mismo patrón existente.
  - El `state.firstUsedAt` y `state.lastBackupAt` ya están en v3 — sin cambios.
  - **Apartado especial:** el bump de versión NO toca el shape del state principal — solo backfill defensivo de un campo dentro de un sub-objeto (inFlightTest). Migración mínima.

### Plan structure

- **D-112:** **Probablemente 2 plans secuenciales (planner confirma).** Lógica: UX-01 y UX-02 son ortogonales (no comparten código nuevo más allá de `resetSession()` que ya existe). Cada uno entrega valor visible independiente:
  - **Plan 06-01 — Reiniciar (UX-01):** handler `restartRepaso()` + botón HTML en pantalla session + tests dominio mínimos (NO requiere extender `sessionResults` shape, NO toca migración, NO toca summary template). El autor puede usarlo el día 1 del plan.
  - **Plan 06-02 — Errores cometidos (UX-02):** extender `sessionResults` shape + adaptar 3 call-sites de `applyResultToSession` + nuevo sub-estado `matchFirstWrongPair` + sección summary + migración v3→v4 + tests. Vertical slice más densa.
  - El planner valora si encajar todo en 1 plan combinado (justificado si el tamaño total de cambios es manageable y el UAT integral es atómico) — el patrón MVP de Phase 5 (1 plan único) es defensible si el riesgo runtime es bajo (es UX puro sobre helpers ya extraídos).

### Claude's Discretion

- **Etiqueta del botón "Reiniciar ejercicios"**: planner refina si abreviar (`"Reiniciar"`, `"↻ Reiniciar"`) por restricciones de `.button-row` en pantalla session. No requiere icono — texto puro coherente con el resto de la UI.
- **CSS exacto de la sección `.summary-errors`**: planner decide el spacing entre `<ul.summary-delta>` y la nueva sección — añadir `<hr>` separador, o solo margin-top. Sin emojis decorativos.
- **Texto literal del header de la sección**: `"Errores cometidos"` (default ROADMAP) o variantes (`"Tus errores"`, `"Repasa tus errores"`). El default ROADMAP es el más neutral.
- **¿Mostrar también las `notes` del ejercicio fallado en la fila?** El campo `ex.notes` (cuando existe) contiene una nota pedagógica corta. Útil para repaso, pero alarga la fila. Recomendación: NO mostrarlo por defecto en v1 — el autor ya las vio durante la sesión (si las renderizamos en el feedback de fallo en la sesión actual, cosa que NO hacemos hoy). Reconsiderar en v2 si el autor las echa de menos.
- **Tests:** los planner añade tests dominio + UI smoke (extender `tests/domain.test.js`?) para:
  - `buildSession` recall con `pickerCheckedCategoryIds` mantenidos.
  - Shape extendido de `sessionResults` para los 3 tipos.
  - Migración `migrate3to4` backfill correcto sobre inFlightTest pre-existente.
  - El UAT humano final cubre la pantalla visible — la sección "Errores cometidos" con captura distinta por los 3 tipos.
- **Smoke test paramétrico vs unitario:** el patrón ya existente (`tests/data/multi-cat-content.test.mjs` parametrizado por archivo) probablemente no aplica aquí — Phase 6 es UI/domain, no contenido. Tests unitarios estándar.
- **¿Capturar también `userAnswer` cuando `correct === true` (para multi-choice y word-buttons)?** Por simetría del shape, sí — `userAnswer = "texto correcto" / [palabras correctas]`. El filtro del resumen es `!r.correct`, así que no se renderiza nunca; pero mantener el shape uniforme simplifica la lógica. Coste: tamaño de sessionResults sube proporcionalmente — irrelevante para 20-100 ejercicios.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope, Key Decisions Phase 1-5
- `.planning/REQUIREMENTS.md` §"Polish UX post-sesión (UX) — Phase 6" — UX-01 + UX-02 specs detallados con captura UAT Phase 4
- `.planning/ROADMAP.md` §"Phase 6" — Goal + 5 success criteria + dependencias (depends Phase 5)
- `.planning/STATE.md` — schemaVersion: 3 actual, 271 ejercicios, 7 categorías, 145/145 tests

### Phase 2 (vigente — base del motor afectado por UX-01)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — **D-24** (switch `currentScreen`), **D-27** (`requestConfirm()` inline pattern), **D-42** (per-answer write inFlightTest), **D-54** (cascada inmediata persistida), **D-55** (racha display)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-SUMMARY.md` — patrón summary screen (summaryDelta + headerLabel)

### Phase 3 (vigente — base de los 3 tipos afectados por UX-02)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` — **D-56..D-66** (sub-templates word-buttons + match, applyResultToSession helper compartido, cascada D-61 idempotente)

### Phase 4 (vigente — base de la migración v3→v4)
- `.planning/phases/04-backup-robusto-contenido-completo/04-CONTEXT.md` — **D-73..D-84** (backup wrapper kind + schemaVersion, import validator estricto + cadena de migraciones, D-78 firstUsedAt inline, D-83 layout pantalla backup)

### Phase 5 (vigente — base del state actual)
- `.planning/phases/05-essere-categoria-fundamental-que-faltaba/05-CONTEXT.md` — **D-85..D-99** (Claude propone JSON, APPEND-ONLY, NFC normalize, 7 categorías)

### Code references (leer ANTES de planificar)
- `src/screens/app.js` líneas 92-160 — factory plano `appShell` (sub-estados de las 5 pantallas)
- `src/screens/app.js` línea 107 — `sessionResults: []` (Array<{exerciseId, correct}> → extender con `userAnswer`)
- `src/screens/app.js` líneas 200-261 — `openPicker` + `requestReturnToHome` (modelo del descarte Repaso D-27)
- `src/screens/app.js` líneas 270-290 — `resetSession()` (a extender con `matchFirstWrongPair`)
- `src/screens/app.js` líneas 367-412 — `startSession()` (modelo para `restartRepaso()` — buildSession + reset sub-estado + initSubStateForExercise)
- `src/screens/app.js` líneas 443-464 — `persistInFlightTest()` (D-42; sin cambios pero el shape de answers cambia)
- `src/screens/app.js` líneas 478-549 — `resumeInFlightTest()` (defensivo ante answers sin userAnswer)
- `src/screens/app.js` líneas 778-798 — `sessionSelectOption(idx)` (1ª call-site de applyResultToSession con userAnswer)
- `src/screens/app.js` líneas 800-861 — `applyResultToSession(ex, correct)` (extender firma con 3er arg `userAnswer`)
- `src/screens/app.js` líneas 958-965 — `wordButtonsCheck()` (2ª call-site)
- `src/screens/app.js` líneas 1017-1076 — `matchPickRight(rightIdx)` (3ª call-site + captura de matchFirstWrongPair bajo guard !matchHadFailure)
- `src/screens/app.js` líneas 1330-1393 — `completeSession()` + `returnToHomeFromSummary()` (modelo del lifecycle del summary; la sección de errores se limpia automáticamente al pulsar Volver)
- `src/domain/session.js` — `buildSession()` y `buildFullTest()` (sin cambios; D-101 los re-llama con state actualizado)
- `src/domain/progress.js` — `applyImmediateFailure` (sin cambios; D-100/D-101 reusan su efecto persistido)
- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION` (bump a 4) + cadena `migrate1to2 / migrate2to3` + nueva `migrate3to4`
- `src/data/backup.js` — `parseBackupFile` + `buildBackupWrapper` (sin cambios; D-74 validator acepta v3 importado vía migración)
- `index.html` líneas 195-230 — pantalla picker (referencia layout `.button-row`)
- `index.html` líneas 247-417 — pantalla session (donde añadir el botón Reiniciar y modificar el `.button-row` bajo `<hr>`)
- `index.html` líneas 419-462 — pantalla summary (donde insertar la sección "Errores cometidos" tras `<ul.summary-delta>`)

### Tests references
- `tests/domain.test.js` — domain unitarios + smoke 30 días + multi-cat real
- `tests/exercise-types.test.js` — grade() handlers + 23 word-buttons + 24 match
- `tests/data-storage.test.js` — migraciones existentes (modelo para migrate3to4)
- `tests/backup.test.js` — backup roundtrip (D-74 validator)

### External docs
- No external docs requeridos para Phase 6 — es UX puro sobre helpers internos ya extraídos en Phase 1-5. Cero dependencias nuevas, cero APIs nuevas, cero patrones de framework no usados.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`applyResultToSession(ex, correct)` (app.js:831)**: ÚNICA call-site del `sessionResults.push` para los 3 tipos. Extender su firma con `userAnswer` propaga el cambio a 3 sitios solamente (sessionSelectOption / wordButtonsCheck / matchPickRight) — cero refactor en el resto del codebase.
- **`resetSession()` (app.js:270-290)**: ya limpia sub-estados de los 3 tipos. Añadir `matchFirstWrongPair = null` (D-107) sigue el patrón existente — 1 línea más.
- **`buildSession()` función pura (src/domain/session.js)**: sin estado interno, sin side effects. Re-invocable con cualquier state. D-101 reutiliza tal cual.
- **`persistInFlightTest()` (app.js:443)**: hace `answers: [...this.sessionResults]` clon. Hereda automáticamente el shape extendido — D-110 sin cambios al helper.
- **`requestConfirm()` (D-27)**: NO se usa en UX-01 (D-102 reset directo) — pero está disponible si emerge necesidad en algún edge futuro.
- **`returnToHomeFromSummary()` (app.js:1388-1393)**: ya limpia `summaryDelta` + `summaryHeaderLabel`. Si añadimos `summaryErrors` derived state (no necesario — `sessionResults` ya está), también lo limpia su propio reset. **Si NO usamos derived state y leemos `sessionResults` directo en el template, no requiere cambios al helper.**
- **Clase CSS `.incorrecta` (líneas index.html 268/314 + posible CSS file)**: ya define el rojo del feedback de fallo. Reusable directamente en el template de la fila de error.
- **Pattern `<template x-if="...">` con sub-template por `ex.type`**: ya establecido para multi-choice/word-buttons/match en session screen (líneas 259/296/375). Mismo patrón aplicable a la fila de error en summary.

### Established Patterns

- **D-24 (Phase 2)**: switch `currentScreen` con valores discretos. Phase 6 NO añade pantalla nueva — extiende `summary` con una sección + extiende `session` con un botón.
- **D-27 (Phase 2)**: `requestConfirm()` inline para confirmaciones destructivas. D-102 explícitamente decide NO reusarlo (1 clic > 2 clics + modal).
- **D-42 (Phase 2)**: per-answer write de `inFlightTest`. D-110 hereda el shape extendido sin cambios al helper.
- **D-54 (Phase 2)**: cascada inmediata persistida. D-101 explícitamente **preserva** estos efectos — el botón Reiniciar NO los deshace.
- **D-09 (Phase 1)**: monotonicidad de `exerciseStats`. D-101 NO bumpea los contadores al reiniciar (cero efecto sobre timesShown/Failed/Correct).
- **D-74 (Phase 4) — backup wrapper + cadena de migraciones**: el validator acepta `state.schemaVersion <= CURRENT`. D-111 bumpea CURRENT a 4; la cadena 1→2→3→4 corre automática.
- **Layer purity D-02 (Phase 1)**: dominio puro + handlers de UI. Phase 6 NO introduce I/O nuevo — la migración `migrate3to4` es función pura sobre state.
- **`.button-row` (NO `role="group"`, lesson recurrente UAT 02-03/02-04)**: clase establecida para grupos de botones. D-103 la reutiliza.
- **Helper compartido `applyImmediateFailure` único call-site multiplexado por D-61 (matchPickRight) + applyResultToSession**: D-101 NO toca esta arquitectura.

### Integration Points

- **Boot path**: `migrate3to4` se ejecuta en `loadState` igual que las migraciones previas — sin cambio en `main.js` (la cadena se aplica automática si la lista de migrations está exportada en orden).
- **Backup export/import**: `buildBackupWrapper` (src/data/backup.js) ya escribe `state.schemaVersion`. Tras D-111, los exports nuevos llevan `schemaVersion: 4`. Importar v3 → migración automática.
- **Banner home de backup (D-80)**: sin afectación — opera sobre `state.lastBackupAt` que no cambia.
- **Test completo en curso pre-Phase 6 (inFlightTest)**: al boot post-Phase 6, `migrate3to4` corre sobre el state y backfillea `userAnswer = null` en las answers existentes. El autor reanuda el test, lo termina, y en el resumen los errores pre-Phase 6 aparecen con "Tu respuesta: (sin detalle)" o se omiten defensivamente. Los errores POST-Phase 6 aparecen con detalle completo.
- **DOMAIN-06 applyNewExerciseRegression**: sin afectación — Phase 6 no añade ejercicios nuevos.
- **Cascada D-54**: sin afectación. El botón Reiniciar opera DESPUÉS de que la cascada ya se aplicó.

### Estructura final esperada (post-Phase 6)

```
src/
├── data/
│   ├── storage.js                # MIGRADO: CURRENT_SCHEMA_VERSION=4 + migrate3to4
│   ├── content-loader.js         # SIN CAMBIOS
│   ├── schema-validator.js       # SIN CAMBIOS
│   └── backup.js                 # SIN CAMBIOS (D-74 validator acepta v4 outgoing)
├── domain/
│   ├── session.js                # SIN CAMBIOS
│   ├── progress.js               # SIN CAMBIOS
│   └── dates.js                  # SIN CAMBIOS
├── exercise-types/
│   ├── multiple-choice.js        # SIN CAMBIOS (grade() puro intacto)
│   ├── word-buttons.js           # SIN CAMBIOS
│   ├── match.js                  # SIN CAMBIOS
│   └── index.js                  # SIN CAMBIOS
├── screens/
│   └── app.js                    # EXTENDIDO: matchFirstWrongPair sub-estado + restartRepaso() + applyResultToSession(ex, correct, userAnswer)
└── main.js                       # SIN CAMBIOS

index.html                        # EXTENDIDO: botón Reiniciar en session + sección Errores cometidos en summary

content/                          # SIN CAMBIOS

tests/
├── domain.test.js                # EXTENDIDO: smoke de restart + shape sessionResults
├── data-storage.test.js          # EXTENDIDO: migrate3to4 backfill
└── exercise-types.test.js        # SIN CAMBIOS (grade handlers no tocan userAnswer)
```

Toda la complejidad nueva queda contenida en `src/screens/app.js` + `index.html` + `src/data/storage.js`. Cero churn fuera de esos 3 archivos (más tests).

</code_context>

<specifics>
## Specific Ideas

- **El dolor es UX-01 (reiniciar)**: el UAT Phase 4 lo capturó literalmente como "muchas veces fallas a mitad" — el escenario típico es Repaso 20 con 3-5 categorías, fallas el 3er ejercicio (cascada D-54 inmediata sobre ≥1 categoría visible), y quieres rearrancar en limpio. El botón se diseña para ESE momento, no para "fallaste todo y odias la vida" (lo cual es contra el invariante del producto). Esto justifica que NO haya confirmación (D-102): el autor sabe lo que hace porque ya falló de forma persistida — el invariante "te obliga a no olvidar" sigue ahí, solo es que descarta lo no comprometido y resamplea.
- **El dolor de UX-02 es la pérdida de información cronológica**: el feedback rojo en sesión muestra la respuesta correcta SOLO durante 2-5 segundos (hasta que el autor pulsa "Siguiente"). Acabada la sesión, esa info se perdió. La sección "Errores cometidos" recupera el agregado para repaso post-sesión. Captura UAT literal: "ver al final todos los errores en vez de repasarlos según vas fallando" — el deseo es agregación, no consulta histórica.
- **match es el caso peor para captura porque permite múltiples intentos**: el patrón D-105 (solo el PRIMER pareo erróneo) es el más alineado pedagógicamente — coincide con el guard D-61 que ya marca "ese fue el error que cuenta" para la cascada. Hay simetría arquitectónica: el primer fallo es el que dispara la cascada D-54, y también es el que se muestra en el resumen. Coherente.
- **La migración v3→v4 es nominal** — solo bumpea el número y backfillea un campo dentro de un sub-objeto opcional (inFlightTest). Risk-free. Sirve para mantener la disciplina de bumps que ya está establecida en el patrón v1→v2→v3 de Phase 4.
- **El plan estructura 2 vs 1**: la decisión depende del riesgo runtime. 2 plans secuenciales tienen la ventaja de checkpoints UAT independientes (Reiniciar se prueba primero, da confianza, luego se ataca el shape extendido + migración). 1 plan combinado es más rápido pero arriesga UAT-blocked entre las 2 features. El patrón MVP de Phase 5 (1 plan) funcionó porque el riesgo era cero (puro contenido). Aquí el riesgo es UX y migración — sugiere 2 plans.
- **El layout multi-línea (D-109) escala a Test completo**: un Test completo de 271 ejercicios con 30 errores cabe en 30 `<li>` con scroll natural de la pantalla. Cero overflow esperado en desktop (target primario). Responsive móvil queda para v2 según constraint del PROJECT.md.
- **Cero cambios al dominio puro** — Phase 6 es 100% capa de presentación + state shape + migración. Esto mantiene D-02 layer purity intacto y baja el riesgo a "Claude implementa UI / autor verifica visualmente en UAT".

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **Botón Reiniciar en Test completo**: si emerge dolor real (poco probable, ya hay banner home), reconsiderar en v2. Implicaría descartar `inFlightTest` desde la pantalla de sesión — punto destructivo que hoy solo existe en home, así que requeriría confirmación inline.
- **Persistencia rolling de errores recientes** (`state.recentErrors[]` rolling 3 sesiones): el autor no lo pidió. Si tras usar UX-02 echa de menos consultar errores días después, fase futura — implicaría pantalla nueva o sección en home y migración schemaVersion adicional.
- **Pantalla "Errores históricos"**: out of scope v1. Reconsiderar cuando se acumule suficiente uso para detectar patrones (e.g., "siempre fallo essere en ___" → diseño de drill específico).
- **Agrupación por categoría en la sección de errores**: D-108 descarta — útil solo en Test completo con muchos errores. Reconsiderar si UAT muestra que el orden cronológico no es navegable para Test completo. La separación visual `<hr>` por categoría dentro de la lista plana podría ser un compromiso intermedio.
- **Agrupación por tipo de ejercicio**: descartado por inconsistencia visual con el resto del resumen.
- **Mostrar también `ex.notes` en la fila de error**: out of scope v1 (Claude's discretion). Si el autor las quiere, añadir como `<small class="notes">` debajo.
- **Botón "Repetir solo los errores"** (nueva sesión con los IDs fallados): potente pedagógicamente, pero out of scope Phase 6 — entra dentro de una fase "drill mode" futura.
- **Confirmación condicional según `sessionResults.length`**: descartado por complejidad innecesaria — el modelo binario (sin confirmación) es más coherente con el resto del sistema.
- **Refactor a helper común entre `startSession` y `restartRepaso`**: planner valora; recomendación es duplicar ~10 líneas en v1 y refactorizar solo si emerge un 3er call-site.
- **Highlight visual cuando un error es multi-cat**: el `summaryDelta` (sección actual) ya muestra las 2+ categorías reseteadas. Duplicarlo en la fila de error sería ruido — los dos bloques se complementan.
- **Snooze del banner backup tras reiniciar muchas sesiones**: out of scope Phase 6 — no relacionado con UX-01/UX-02. El banner D-80 ya es "no se puede silenciar" intencional.
- **Botón "Reiniciar" en el resumen (post-summary, antes de Volver al home)**: tentador, pero el flujo actual ya termina la sesión y "Volver al home" + botón "Repaso 20" en home es 2 clics (no 4). El dolor del UAT es mid-sesión, no post-sesión. Out of scope.
- **Test e2e con Playwright o similar**: el proyecto no usa runners headless. UAT humano es el patrón establecido. Out of scope Phase 6.

</deferred>

---

*Phase: 6-Polish UX post-sesión — reiniciar + review errores*
*Context gathered: 2026-05-24*
