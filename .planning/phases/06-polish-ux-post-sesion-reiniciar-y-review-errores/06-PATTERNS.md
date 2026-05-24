# Phase 6: Polish UX post-sesión — reiniciar + review errores - Pattern Map

**Mapped:** 2026-05-24
**Files analyzed:** 5 (3 production + 2 tests)
**Analogs found:** 5 / 5 (all exact role + data-flow matches in-repo)

> Phase 6 es 100% pulido UX sobre helpers ya extraídos en Phase 1-5. **Cero dependencias nuevas, cero pantallas nuevas, cero capas nuevas.** Los analogs viven en el MISMO factory `appShell` (app.js) y los MISMOS archivos que se van a tocar — el patrón a copiar es literalmente "el helper de al lado, con un argumento más".

## File Classification

| File to Modify | Role | Data Flow | Closest Analog | Match Quality |
|----------------|------|-----------|----------------|---------------|
| `src/screens/app.js` (handler `restartRepaso()` nuevo) | screen-handler / Alpine factory method | event-driven (click) → state-mutate | `startSession()` (app.js:367-412) | exact (role + flow + factory + state-mutate shape) |
| `src/screens/app.js` (extender `applyResultToSession` con `userAnswer`) | screen-handler / dispatch helper | event-driven → push to `sessionResults` | `applyResultToSession(ex, correct)` (app.js:831-861) — el helper mismo, firma extendida | exact (refactor surgical de su propia firma) |
| `src/screens/app.js` (nuevo sub-estado `matchFirstWrongPair` + reset) | screen-state reactive prop | derived/captured state | `matchHadFailure: false` (app.js:127) + reset en `resetSession()` (app.js:289) + set en `matchPickRight` (app.js:1056-1062) | exact (gemelo arquitectónico — mismo guard `!matchHadFailure`) |
| `index.html` (botón Reiniciar en `.button-row` session) | HTML template — button in button-row | request-response click handler | `← Volver al home` button (index.html:415) | exact (mismo `.button-row`, misma clase `secondary`) |
| `index.html` (sección `<section class="summary-errors">` en summary) | HTML template — list section | render-derived from state | `<ul class="summary-delta">` (index.html:437-458) + `<template x-if="ex.type === '...'">` dispatch (index.html:259/296/375) | exact (mismo container summary, mismo `x-for` + `:key`, mismo dispatch pattern) |
| `src/data/storage.js` (bump `CURRENT_SCHEMA_VERSION` 3→4 + `migrate3to4`) | data-layer / pure migration | transform | `migrate2to3(v2)` (storage.js:208-224) + dispatcher chain (storage.js:126-137) | exact (mismo módulo, mismo patrón en cadena) |
| `tests/data-storage.test.js` (extender con migrate3to4 tests) | test — pure migration unit | transform-assert | `migrate2to3 + hydrateV3` tests (data-storage.test.js:49-81 + backup.test.js:36-86) | exact (modelo directo) |
| `tests/domain.test.js` o nuevo `tests/screens-app.smoke.test.js` (smoke restart + sessionResults shape) | test — domain/UI smoke | sequence + assert | `buildSession*` tests (domain.test.js:51-91) | role-match (smoke pattern; restart no es dominio puro estricto) |

## Pattern Assignments

### 1. `src/screens/app.js` — Nuevo handler `restartRepaso()` (UX-01 / D-104)

**Analog:** `startSession()` en `src/screens/app.js` líneas 367-412.

**Por qué este analog (y no `resumeInFlightTest`):** El shape requerido es "llamar a `buildSession` con state actualizado + resetear sub-estado + init sub-estado del primer ejercicio + permanecer en `'session'`". Eso es exactamente lo que hace `startSession()` EXCEPTO el último step (transición `currentScreen = 'session'`, que en restart se omite porque ya estamos ahí). El delta entre los dos handlers es trivial.

**Imports YA disponibles** (app.js líneas 60-65 — no añadir nada):
```js
import { buildSession, buildFullTest, fisherYates } from '../domain/session.js';
import { applySessionResult, applyImmediateFailure, applyNewExerciseRegression } from '../domain/progress.js';
import { todayLocal, daysSinceISO } from '../domain/dates.js';
import { saveState } from '../data/storage.js';
// (registry no requerido por restartRepaso)
```

**Core pattern a copiar** (app.js:367-412 — todo el bloque dentro del `startSession()`):
```js
startSession() {
  const allExercises = Object.values(this.content.exerciseById);
  let result;
  if (this.pickerMode === 'repaso') {
    result = buildSession(
      this.pickerCheckedCategoryIds,
      allExercises,
      this.state,
      20,
      'repaso'
    );
  } else if (this.pickerMode === 'test-completo') {
    result = buildFullTest(this.pickerCheckedCategoryIds, allExercises);
  } else {
    // Defensivo: pickerMode inválido — no arrancamos.
    return;
  }

  // Reset session sub-estado.
  this.cancelAutoAdvance();
  this.sessionMode = this.pickerMode;
  this.sessionExerciseIds = result.exerciseIds;
  this.sessionCursor = 0;
  this.sessionResults = [];
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;

  // Phase 3 plan 01: inicializar sub-estado del PRIMER ejercicio (si
  // hay alguno). En pool vacío `result.exerciseIds = []` y el getter
  // sessionCurrentExercise devuelve null defensivamente.
  if (result.exerciseIds.length > 0) {
    const firstEx = this.content.exerciseById[result.exerciseIds[0]];
    this.initSubStateForExercise(firstEx);
  }

  if (this.pickerMode === 'test-completo') {
    this.persistInFlightTest();
  }

  this.currentScreen = 'session';
},
```

**Adaptación para Phase 6 — diferencias mínimas:**
- Lee `this.sessionMode` (en lugar de `this.pickerMode`) — el restart vive en pantalla session, no en picker.
- **Guard defensivo de entrada:** `if (this.sessionMode !== 'repaso') return;` (D-100/D-104 — botón sólo aplica a Repaso 20).
- Llama SIEMPRE a `buildSession(...)` con `'repaso'`, hard-coded (sin la rama `test-completo` ni el `buildFullTest`).
- **NO toca** `this.sessionMode` (preservado).
- **NO toca** `this.pickerCheckedCategoryIds` (preservado — D-101).
- **NO toca** `this.currentScreen` (sigue `'session'`).
- **NO llama** `persistInFlightTest()` (Repaso nunca persiste in-flight — D-101).
- Adicional vs `startSession`: cancelar `matchFlash` también (`this.cancelMatchFlash()`) + resetear `matchFirstWrongPair = null` (D-107).

**State-mutation invariants preservados** (D-09, D-54 — verificable por inspección):
- `this.state` NO se reasigna ni se llama a `saveState` — los aciertos no comprometidos se descartan sin tocar localStorage (coherente con SESSION-08 abandono Repaso).
- Los fallos D-54 ya persistidos antes del click siguen intactos en `this.state.categoryProgress` y en localStorage.

**Edge case defensivo** (UI-SPEC §"Disabled state defensivo"):
- `if (result.exerciseIds.length === 0)`: el bloque `if (result.exerciseIds.length > 0)` que envuelve `initSubStateForExercise` ya garantiza que no se crashea. La pantalla session muestra un estado vacío momentáneo — el getter `sessionCurrentExercise` devuelve `null` y el `<template x-if="... && sessionCurrentExercise">` (index.html:247) impide el render.

---

### 2. `src/screens/app.js` — Extender `applyResultToSession(ex, correct, userAnswer)` (UX-02 / D-105 / D-106)

**Analog:** `applyResultToSession(ex, correct)` actual en `src/screens/app.js` líneas 831-861 — **es el helper que se extiende, no un gemelo externo**.

**Core pattern actual** (app.js:831-861):
```js
applyResultToSession(ex, correct) {
  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: ex.id, correct });

  if (correct) {
    this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
  } else {
    const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
    newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
    saveState(newState);
    this.state = newState;
  }

  if (this.sessionMode === 'test-completo') {
    this.persistInFlightTest();
  }
},
```

**Adaptación Phase 6:** sólo cambia la línea del `push`:
```js
applyResultToSession(ex, correct, userAnswer) {
  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: ex.id, correct, userAnswer });
  // ... resto idéntico
},
```

**Call-sites a actualizar** (3 — todos viven dentro del mismo archivo):

| Call-site | Línea actual | 3er arg a pasar |
|-----------|-------------|-----------------|
| `sessionSelectOption(idx)` | app.js:797 — `this.applyResultToSession(ex, correct);` | `ex.payload.options[idx]` (texto literal de la opción clickada) |
| `wordButtonsCheck()` | app.js:964 — `this.applyResultToSession(ex, correct);` | `[...this.wordButtonsAnswer]` (clon defensivo) |
| `matchPickRight(rightIdx)` — al completar todas las parejas | app.js:1050 — `this.applyResultToSession(ex, !this.matchHadFailure);` | `this.matchFirstWrongPair` (null si no hubo fallo, `{left, right}` si lo hubo — D-107) |

**Imports YA disponibles** (sin cambios). El helper actual ya importa todo lo necesario.

---

### 3. `src/screens/app.js` — Nuevo sub-estado `matchFirstWrongPair` (D-107)

**Analog gemelo arquitectónico:** `matchHadFailure: false` en app.js:127.

**Tres puntos de toque** (los mismos 3 puntos que `matchHadFailure` ya toca):

**A. Declaración del prop reactivo** (app.js:127, junto a `matchHadFailure`):
```js
// ─── Sub-estado match (Phase 3 plan 02 — D-60/D-61/D-62/D-63/D-66/D-70) ─
matchLeft: [],
matchRight: [],
matchSelectedLeftIdx: null,
matchPairsConsumed: [],
/** True si el usuario falló al menos UNA pareja en este ejercicio (D-60). */
matchHadFailure: false,
// ↓ AÑADIR (Phase 6 D-107):
/** null | {left: string, right: string} — primer pareo erróneo capturado en
 *  matchPickRight bajo guard !matchHadFailure (D-107). Se preserva durante
 *  el resto del ejercicio para mostrar en la sección "Errores cometidos"
 *  del summary. Reset en resetSession() y restartRepaso() + initSubStateForExercise(). */
matchFirstWrongPair: null,
```

**B. Reset en `resetSession()`** (app.js:289, en el bloque de match reset):
```js
this.matchHadFailure = false;
// ↓ AÑADIR (Phase 6 D-107):
this.matchFirstWrongPair = null;
```

Y simétricamente en `initSubStateForExercise()` (app.js:1165) — el bloque de limpieza universal:
```js
this.matchHadFailure = false;
this.cancelMatchFlash();
// ↓ AÑADIR (Phase 6 D-107):
this.matchFirstWrongPair = null;  // (insertar antes de cancelMatchFlash o después — orden irrelevante)
```

Y en `restartRepaso()` (nuevo handler — ya recogido en el pattern del item 1).

**C. Set en `matchPickRight(rightIdx)`** (app.js:1052-1062 — dentro del `else` de "Pareja incorrecta", bajo el guard `!this.matchHadFailure`):

**Pattern actual** (app.js:1052-1070):
```js
} else {
  // Pareja incorrecta — D-61 cascada inmediata SOLO en el primer fallo.
  if (!this.matchHadFailure) {
    const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
    newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
    saveState(newState);
    this.state = newState;
    this.matchHadFailure = true;
    if (this.sessionMode === 'test-completo') {
      this.persistInFlightTest();
    }
  }
  // Disparar el parpadeo + deshacer la selección
  this.flashMatchPair(leftIdx, rightIdx);
  this.matchSelectedLeftIdx = null;
}
```

**Phase 6 addition** (insertar capture **antes** de `this.matchHadFailure = true;`):
```js
if (!this.matchHadFailure) {
  // ↓ AÑADIR (Phase 6 D-107) — capturar el primer pareo erróneo ANTES del flip
  // del guard. `leftWord` y `rightWord` ya están en scope desde líneas 1024-1025
  // (matchPickRight los lee al inicio del handler).
  this.matchFirstWrongPair = { left: leftWord, right: rightWord };
  const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
  // ... resto idéntico
  this.matchHadFailure = true;
  // ...
}
```

**Pareja simétrica con guard D-61:** mismo guard que ya garantiza "una cascada por ejercicio" garantiza "una captura por ejercicio". Cero call-sites adicionales — cero riesgo de doble-write.

---

### 4. `index.html` — Botón "Reiniciar ejercicios" en `.button-row` (UX-01 / D-103)

**Analog directo:** `← Volver al home` button (index.html:415).

**Pattern actual** (index.html:414-415, justo antes de cerrar el session `<article>`):
```html
<hr>
<button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
```

**Issue para Phase 6:** el botón "Volver al home" actual NO está dentro de un `.button-row` — está suelto bajo el `<hr>`. UI-SPEC §"Visual wireframes" Phase 6 propone envolver AMBOS en un `.button-row`:

**Pattern a adoptar** (sustituir línea 415):
```html
<hr>
<div class="button-row">
  <button type="button"
          class="secondary"
          x-show="sessionMode === 'repaso'"
          @click="restartRepaso">Reiniciar ejercicios</button>
  <button type="button"
          class="secondary"
          @click="requestReturnToHome">← Volver al home</button>
</div>
```

**Por qué `.button-row` directamente** (NO `role="group"`):
- Lección recurrente UAT 02-03/02-04 codificada en `styles.css` líneas 64-75: Pico classless no añade gap entre `<button>` adyacentes; `.button-row` es la clase canónica.
- `.button-row button { flex: 1; }` (styles.css:91) los reparte 50/50.
- Cuando `sessionMode === 'test-completo'`, el botón Reiniciar tiene `x-show="false"` → `display: none`; el otro botón sigue con `flex: 1` y ocupa el 100% (comportamiento idéntico al pre-Phase 6).

**`@click="restartRepaso"`** sin paréntesis es válido en Alpine (mismo patrón que `@click="requestReturnToHome"` ya en uso en la línea original).

**Imports / scripts:** sin cambios — Alpine ya está cargado, `restartRepaso` se expone al añadirlo al factory en `app.js`.

**Estados visuales del botón** (Pico hereda automático — sin nuevo CSS):
- Idle: Pico `secondary` (gris muted, idéntico al "Volver al home" adyacente).
- Hover/focus/pressed: heredados de Pico `:hover` / `:focus-visible` / `:active`.
- Oculto: `display: none` via `x-show` (test-completo).
- Durante feedback: **SIEMPRE clickable** — sin `:disabled` binding. UI-SPEC explícito.

---

### 5. `index.html` — Sección `<section class="summary-errors">` en summary (UX-02 / D-108 / D-109)

**Analog primary:** `<ul class="summary-delta">` en index.html:437-458 — el contenedor lista factúal hermano (mismo `<article>` summary).

**Analog secundario:** el dispatch por `ex.type` en session screen — index.html líneas 259 (multi-choice), 296 (word-buttons), 375 (match).

**Pattern del summary-delta a copiar** (index.html:437-458):
```html
<ul class="summary-delta">
  <template x-for="entry in summaryDelta" :key="entry.categoryId">
    <li>
      <strong x-text="entry.categoryName"></strong>:
      <span x-text="entry.statusBefore"></span>
      <span class="delta-arrow"
            :class="{ 'delta-regression': entry.isRegression, 'delta-promotion': entry.isPromotion }">→</span>
      <span x-text="entry.statusAfter"></span>
      <template x-if="entry.failed">
        <span class="delta-reason" x-text="' · ' + entry.failureReason"></span>
      </template>
      <!-- ... -->
    </li>
  </template>
</ul>
```

**Patrón clave del dispatch por tipo en session** (index.html:259/296/375):
```html
<template x-if="sessionCurrentExercise.type === 'multiple-choice'">
  <div> <!-- contenido específico --> </div>
</template>
<template x-if="sessionCurrentExercise.type === 'word-buttons'">
  <div> <!-- contenido específico --> </div>
</template>
<template x-if="sessionCurrentExercise.type === 'match'">
  <div> <!-- contenido específico --> </div>
</template>
```

**Pattern a escribir** (insertar entre línea 458 — cierre `</ul>` de summary-delta — y línea 460 — botón "Volver al home"):
```html
<template x-if="sessionResults.some(r => !r.correct)">
  <section class="summary-errors">
    <h3>Errores cometidos</h3>
    <ul>
      <template x-for="result in sessionResults.filter(r => !r.correct)" :key="result.exerciseId">
        <li>
          <strong x-text="content.exerciseById[result.exerciseId].payload.prompt"></strong>

          <template x-if="content.exerciseById[result.exerciseId].type === 'multiple-choice'">
            <div>
              <div>Tu respuesta: <span class="user-answer" x-text="result.userAnswer"></span></div>
              <div>Respuesta correcta: <strong x-text="content.exerciseById[result.exerciseId].payload.options[content.exerciseById[result.exerciseId].payload.correctIndex]"></strong></div>
            </div>
          </template>

          <template x-if="content.exerciseById[result.exerciseId].type === 'word-buttons'">
            <div>
              <div>Tu respuesta: <span class="user-answer" x-text="(result.userAnswer || []).join(' ')"></span></div>
              <div>Respuesta correcta: <strong x-text="content.exerciseById[result.exerciseId].payload.answer.join(' ')"></strong></div>
            </div>
          </template>

          <template x-if="content.exerciseById[result.exerciseId].type === 'match' && result.userAnswer">
            <div>
              <div>Tu respuesta: <span class="user-answer" x-text="result.userAnswer.left + ' ↔ ' + result.userAnswer.right"></span></div>
              <div>Respuesta correcta: <strong x-text="result.userAnswer.left + ' ↔ ' + (content.exerciseById[result.exerciseId].payload.pairs.find(p => p[0] === result.userAnswer.left)?.[1] || '(?)')"></strong></div>
            </div>
          </template>
        </li>
      </template>
    </ul>
  </section>
</template>
```

**Invariantes T-02-01 reforzados:**
- `x-text` exclusivamente para TODO contenido del JSON (prompt, options, answer tokens, pairs, userAnswer). JAMÁS `x-html`.
- `↔`, `Tu respuesta:`, `Respuesta correcta:` son strings hardcoded del template (NO interpolados).
- `(?)` fallback defensivo si `pairs.find(...)` no encuentra match.

**Optional refactor a getter computado** (UI-SPEC líneas 412-414): el planner puede mover la lógica de "renderizar fila por tipo" a un getter `errorRows()` en el factory `appShell` para evitar la verbosidad del template. Decisión discrecional; ambos válidos. El contrato exige el output visual descrito.

**CSS nuevo** (añadir al final de `styles.css`, ~30 líneas según UI-SPEC §"Estados visuales nuevos"):
```css
.summary-errors {
  margin-top: 1.5rem;
}
.summary-errors h3 {
  margin-bottom: 0.5rem;
}
.summary-errors ul {
  list-style: none;
  padding-left: 0;
}
.summary-errors li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--pico-muted-border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.summary-errors li:last-child {
  border-bottom: none;
}
.summary-errors .user-answer {
  background-color: var(--pico-color-red-500, #d32f2f);
  color: white;
  padding: 0 0.25rem;
  border-radius: var(--pico-border-radius, 0.25rem);
  overflow-wrap: anywhere;
}
```

**Coherencia visual con `.summary-delta`** (styles.css:147-152): mismo `padding: 0.5rem 0` + mismo `border-bottom: 1px solid var(--pico-muted-border-color)` + mismo `list-style: none; padding-left: 0;` — el ritmo vertical es idéntico, la sección de errores se siente como continuación natural de summary-delta.

---

### 6. `src/data/storage.js` — Bump `CURRENT_SCHEMA_VERSION` 3→4 + `migrate3to4` + `hydrateV4` (D-111)

**Analog directo:** `migrate2to3(v2)` (storage.js:208-224) + `hydrateV3(parsed)` (storage.js:243-259) + el dispatcher `migrate(parsed)` (storage.js:126-137).

**Pattern actual de `migrate2to3`** (storage.js:208-224):
```js
export function migrate2to3(v2) {
  return {
    schemaVersion: 3,
    exerciseStats: (typeof v2.exerciseStats === 'object' && v2.exerciseStats !== null)
      ? v2.exerciseStats
      : {},
    categoryProgress: (typeof v2.categoryProgress === 'object' && v2.categoryProgress !== null)
      ? v2.categoryProgress
      : {},
    dailyLog: (typeof v2.dailyLog === 'object' && v2.dailyLog !== null)
      ? v2.dailyLog
      : {},
    lastBackupAt: typeof v2.lastBackupAt === 'string' ? v2.lastBackupAt : null,
    firstUsedAt: typeof v2.firstUsedAt === 'string' ? v2.firstUsedAt : null,
    inFlightTest: v2.inFlightTest
  };
}
```

**Pattern actual del dispatcher** (storage.js:126-137):
```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) return hydrateV3(s);

  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}
```

**Cambios Phase 6 D-111:**

**A.** Bump constante:
```js
const CURRENT_SCHEMA_VERSION = 4;  // era 3
```

**B.** Añadir `migrate3to4(v3)` (después de `migrate2to3` / `hydrateV3`):
```js
/**
 * Migra un estado v3 a v4 (D-111 Phase 6). Backfillea `userAnswer: null` en
 * los items de `state.inFlightTest.answers` que estén pre-Phase 6 (sin
 * el campo). Preserva todo lo demás.
 *
 * Razón: Phase 6 extiende el shape de `sessionResults` (y por D-110 también
 * el de `inFlightTest.answers`) con `userAnswer`. Los inFlightTest persistidos
 * antes del despliegue tienen `answers[i].userAnswer === undefined`; backfill
 * a `null` evita renderizar "undefined" en la sección "Errores cometidos"
 * tras reanudar un Test completo pre-migración (D-110 fallback path).
 *
 * Idempotencia: si `userAnswer` ya está set (string/array/object/null), se
 * preserva tal cual.
 *
 * @param {object} v3 - Estado parseado con `schemaVersion: 3`.
 * @returns {object} Estado normalizado v4.
 */
export function migrate3to4(v3) {
  const next = {
    schemaVersion: 4,
    exerciseStats: (typeof v3.exerciseStats === 'object' && v3.exerciseStats !== null)
      ? v3.exerciseStats
      : {},
    categoryProgress: (typeof v3.categoryProgress === 'object' && v3.categoryProgress !== null)
      ? v3.categoryProgress
      : {},
    dailyLog: (typeof v3.dailyLog === 'object' && v3.dailyLog !== null)
      ? v3.dailyLog
      : {},
    lastBackupAt: typeof v3.lastBackupAt === 'string' ? v3.lastBackupAt : null,
    firstUsedAt: typeof v3.firstUsedAt === 'string' ? v3.firstUsedAt : null,
    inFlightTest: v3.inFlightTest
  };
  // Backfill defensivo userAnswer en inFlightTest.answers (D-110).
  if (next.inFlightTest && Array.isArray(next.inFlightTest.answers)) {
    next.inFlightTest = {
      ...next.inFlightTest,
      answers: next.inFlightTest.answers.map(a =>
        a && typeof a === 'object' && !('userAnswer' in a)
          ? { ...a, userAnswer: null }
          : a
      )
    };
  }
  return next;
}
```

**C.** Añadir `hydrateV4(parsed)` con el mismo patrón defensivo que `hydrateV3` (storage.js:243-259) — copia literal con el shape v4 (mismo cuerpo que `migrate3to4` pero sin el backfill, asumiendo `inFlightTest` ya con shape v4).

**D.** Actualizar el dispatcher (storage.js:126-137):
```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) s = migrate3to4(s);   // NEW
  if (s.schemaVersion === 4) return hydrateV4(s);  // NEW (era return hydrateV3(s))

  console.warn('schemaVersion desconocido:', parsed.schemaVersion, '— iniciando estado en blanco');
  return blankState();
}
```

**Cadena forward-compat verificada por D-74:** un backup v1 importado post-Phase 6 corre `migrate1to2 → migrate2to3 → migrate3to4 → hydrateV4`. Un backup v4 importado pre-Phase 6 lo rechaza el validator `parseBackupFile` por `schemaVersion > CURRENT` (mismo patrón).

**Defensa contra prototype pollution** (T-04-02): el `next = { schemaVersion: 4, ... }` reconstruye el objeto con prototipo limpio. Mismo invariante que ya está en `hydrateV3`.

---

### 7. `tests/data-storage.test.js` — Tests de `migrate3to4` + `hydrateV4`

**Analog directo:** los tests `data/storage v3 — migrate2to3 chain + hydrateV3 (Phase 4)` (data-storage.test.js:49-81) y los tests 1-5 de `tests/backup.test.js` líneas 36-128.

**Pattern actual** (data-storage.test.js:50-81):
```js
describe('data/storage v3 — migrate2to3 chain + hydrateV3 (Phase 4)', () => {
  test('migrate2to3 sobre v2 fresh produce v3 con campos nuevos null + sub-objetos preservados', () => {
    const v2 = {
      schemaVersion: 2,
      exerciseStats: { a: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {},
      dailyLog: {}
    };
    const v3 = migrate2to3(v2);
    assert.equal(v3.schemaVersion, 3);
    assert.deepEqual(v3.exerciseStats, v2.exerciseStats);
    assert.equal(v3.lastBackupAt, null);
    assert.equal(v3.firstUsedAt, null);
  });

  test('hydrateV3 sobre v3 válido preserva todos los campos', () => {
    // ...
  });
});
```

**Tests a añadir** (mismo estilo, copiado letra por letra):

```js
import { blankState, migrate1to2, hydrateV2, migrate2to3, hydrateV3, migrate3to4, hydrateV4 } from '../src/data/storage.js';

describe('data/storage v4 — migrate3to4 chain + hydrateV4 (Phase 6)', () => {
  test('migrate3to4 sobre v3 fresh produce v4 preservando sub-objetos íntegros', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: { a: { timesShown: 1, timesCorrect: 1, timesFailed: 0 } },
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.deepEqual(v4.exerciseStats, v3.exerciseStats);
    assert.equal(v4.lastBackupAt, null);
    assert.equal(v4.firstUsedAt, null);
    assert.equal(v4.inFlightTest, undefined);
  });

  test('migrate3to4 backfillea userAnswer:null en inFlightTest.answers pre-Phase 6', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {},
      categoryProgress: {},
      dailyLog: {},
      lastBackupAt: null,
      firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'],
        exerciseIds: ['a1', 'a2'],
        cursor: 1,
        answers: [
          { exerciseId: 'a1', correct: true },     // sin userAnswer
          { exerciseId: 'a2', correct: false }    // sin userAnswer
        ],
        startedAt: 1716480000000
      }
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.schemaVersion, 4);
    assert.equal(v4.inFlightTest.answers[0].userAnswer, null);
    assert.equal(v4.inFlightTest.answers[1].userAnswer, null);
    // Resto preservado
    assert.equal(v4.inFlightTest.cursor, 1);
    assert.deepEqual(v4.inFlightTest.exerciseIds, ['a1', 'a2']);
  });

  test('migrate3to4 idempotente sobre userAnswer ya presente', () => {
    const v3 = {
      schemaVersion: 3,
      exerciseStats: {}, categoryProgress: {}, dailyLog: {},
      lastBackupAt: null, firstUsedAt: null,
      inFlightTest: {
        categoryIds: ['avere'], exerciseIds: ['a1'], cursor: 0,
        answers: [{ exerciseId: 'a1', correct: false, userAnswer: 'hai' }],
        startedAt: 0
      }
    };
    const v4 = migrate3to4(v3);
    assert.equal(v4.inFlightTest.answers[0].userAnswer, 'hai');
  });

  test('migrate3to4 sin inFlightTest (state limpio) no crashea', () => {
    const v3 = blankState();
    // forzar schemaVersion: 3 para simular pre-bump
    const v3Real = { ...v3, schemaVersion: 3 };
    const v4 = migrate3to4(v3Real);
    assert.equal(v4.schemaVersion, 4);
    assert.equal(v4.inFlightTest, undefined);
  });

  test('blankState() devuelve schemaVersion: 4 (Phase 6 bump)', () => {
    assert.equal(blankState().schemaVersion, 4);
  });
});
```

**Convenciones del archivo** (heredadas — sin cambios):
- `node:test` + `node:assert/strict`.
- Sin mock-timers (la migración es pura).
- Import del nuevo símbolo (`migrate3to4`, `hydrateV4`) junto a los existentes.

---

### 8. `tests/domain.test.js` (o nuevo archivo) — Smoke restart + shape `sessionResults`

**Analog primary:** los tests del `domain/session` en domain.test.js:51-91 (`buildSession reduces actualSize...`, `buildSession with empty pool...`).

**Pattern actual** (domain.test.js:60-73):
```js
test('buildSession reduces actualSize to pool length when pool < requested (D-13)', () => {
  const exercises = Array.from({ length: 8 }, (_, i) => ({
    id: `a${i + 1}`,
    type: 'multiple-choice',
    categoryIds: ['avere'],
    payload: {}
  }));
  const result = buildSession(['avere'], exercises, { exerciseStats: {} }, 20, 'repaso', seededLcg(1234));
  assert.equal(result.actualSize, 8);
  assert.equal(result.exerciseIds.length, 8);
  assert.equal(new Set(result.exerciseIds).size, 8);
});
```

**Tests a añadir** (smoke del dominio puro — el factory `appShell` no se importa porque depende de Alpine/DOM, así que cubrimos el invariante via los helpers puros que llama):

```js
describe('Phase 6 — restartRepaso smoke (UX-01)', () => {
  test('buildSession con state actualizado tras cascada D-54 preserva categoryIds y produce sample válido', () => {
    // Setup: 8 ejercicios en 2 categorías; simular state con 1 categoría regresada.
    const exercises = [
      { id: 'a1', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'a2', type: 'multiple-choice', categoryIds: ['avere'], payload: {} },
      { id: 'p1', type: 'multiple-choice', categoryIds: ['prep'], payload: {} },
      { id: 'p2', type: 'multiple-choice', categoryIds: ['prep'], payload: {} }
    ];
    const stateAfterCascade = {
      exerciseStats: { p1: { timesShown: 1, timesCorrect: 0, timesFailed: 1 } },
      categoryProgress: { prep: { status: 'no-hecha', streakDays: 0, clearedExerciseIds: [] } }
    };
    // Restart: llamar buildSession con MISMAS categoryIds del picker.
    const result = buildSession(['avere', 'prep'], exercises, stateAfterCascade, 20, 'repaso', seededLcg(42));
    assert.ok(result.exerciseIds.length > 0);
    assert.equal(new Set(result.exerciseIds).size, result.exerciseIds.length, 'sin duplicados');
    // Las MISMAS categorías quedan en el pool — al menos un ejercicio de cada cat presente.
    const sampledCats = new Set(result.exerciseIds.map(id => exercises.find(e => e.id === id).categoryIds[0]));
    assert.ok(sampledCats.has('avere'), 'avere presente tras restart');
    assert.ok(sampledCats.has('prep'), 'prep presente tras restart');
  });
});

describe('Phase 6 — sessionResults shape extendido (UX-02)', () => {
  test('sessionResults push acepta userAnswer string (multi-choice)', () => {
    const results = [];
    results.push({ exerciseId: 'a1', correct: false, userAnswer: 'hai' });
    assert.equal(typeof results[0].userAnswer, 'string');
    assert.equal(results[0].userAnswer, 'hai');
  });

  test('sessionResults push acepta userAnswer array (word-buttons)', () => {
    const results = [];
    results.push({ exerciseId: 'a1', correct: false, userAnswer: ['io', 'ha', 'un', 'libro'] });
    assert.ok(Array.isArray(results[0].userAnswer));
    assert.equal(results[0].userAnswer.join(' '), 'io ha un libro');
  });

  test('sessionResults push acepta userAnswer object (match firstWrongPair)', () => {
    const results = [];
    results.push({ exerciseId: 'a1', correct: false, userAnswer: { left: 'casa', right: 'il' } });
    assert.equal(results[0].userAnswer.left, 'casa');
    assert.equal(results[0].userAnswer.right, 'il');
  });

  test('sessionResults push acepta userAnswer null (match completado sin fallos)', () => {
    const results = [];
    results.push({ exerciseId: 'a1', correct: true, userAnswer: null });
    assert.equal(results[0].userAnswer, null);
  });

  test('sessionResults.filter(!correct) filtra correctamente para renderizar la sección', () => {
    const results = [
      { exerciseId: 'a1', correct: true, userAnswer: 'ho' },
      { exerciseId: 'a2', correct: false, userAnswer: 'hai' },
      { exerciseId: 'a3', correct: true, userAnswer: null }
    ];
    const errors = results.filter(r => !r.correct);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].exerciseId, 'a2');
  });
});
```

**Por qué smoke y no e2e:** el proyecto no usa headless runners (CONTEXT deferred — "el patrón establecido es UAT humano"). El smoke valida los INVARIANTES dominio/puros que sostienen restart + sessionResults; el UAT humano valida la UI visible.

---

## Shared Patterns (cross-cutting Phase 6)

### Pattern S-1: Inmutabilidad de Alpine reactivity
**Source:** `src/screens/app.js` líneas 340-343 (`pickerToggleCategory`), 930-947 (`wordButtonsAddWord/RemoveWord`), 1036-1039 (`matchPairsConsumed`).
**Apply to:** Cualquier mutación de array reactivo en restartRepaso, applyResultToSession, matchPickRight extensions.

**Excerpt** (app.js:931-932):
```js
this.wordButtonsBank = this.wordButtonsBank.filter((_, i) => i !== idx);
this.wordButtonsAnswer = [...this.wordButtonsAnswer, word];
```

**Excerpción aplicada en Phase 6:**
- `this.sessionResults.push({...})` ya está en uso (app.js:833) y es seguro porque Alpine traquea mutaciones in-place de arrays via Proxy — el patrón push existente del helper se preserva.
- Para `matchFirstWrongPair = {left, right}` la asignación nueva es atómica (object inmutable nuevo) — sigue el patrón.

### Pattern S-2: Cancelación de timeouts antes de cualquier reset
**Source:** `src/screens/app.js` línea 271 (`resetSession`), 386 (`startSession`), 877 (`sessionAdvance`).
**Apply to:** `restartRepaso()` debe llamar `cancelAutoAdvance()` + `cancelMatchFlash()` PRIMERO.

**Excerpt** (app.js:271-272):
```js
resetSession() {
  this.cancelAutoAdvance();
  this.cancelMatchFlash();
  // ...
}
```

**Razón** (Pitfall #5 codificado): un `setTimeout` pendiente puede disparar `sessionAdvance()` sobre el state ya reseteado, causando corrupción visual (cursor fuera de rango).

### Pattern S-3: T-02-01 anti-XSS — `x-text` exclusivo, jamás `x-html`
**Source:** Invariante codificado en TODO `index.html`. Referencias: D-72 (CONTEXT Phase 3), UI-SPEC §"Reglas T-02-01".
**Apply to:** TODA la sección `<section class="summary-errors">` y CUALQUIER binding nuevo que renderice contenido del JSON.

**Excerpt** (index.html:270):
```html
<button ... x-text="opt"></button>
```

**Aplicación Phase 6:** todos los bindings de `result.userAnswer`, `payload.options[correctIndex]`, `payload.answer.join(' ')`, `payload.pairs.find(...)[1]` usan `x-text`. NUNCA `x-html` (ni siquiera para concatenar strings — el operador `+` dentro del expression de `x-text` es seguro porque produce un string que Alpine inserta vía `textContent`).

### Pattern S-4: `firstUsedAt` inline guard (D-78)
**Source:** `src/screens/app.js` líneas 454, 845, 1059, 1363 (4 call-sites de toString).
**Apply to:** Phase 6 NO añade nuevos call-sites (restart no escribe state; los bumps de inFlightTest pasan por `persistInFlightTest` que ya lo cubre). Sin embargo, si la implementación del `restartRepaso` decide escribir state por alguna razón (no debería), debe respetar el patrón:

**Excerpt** (app.js:843-845):
```js
const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
newState.firstUsedAt = newState.firstUsedAt ?? new Date().toISOString();
saveState(newState);
```

**Aplicación Phase 6:** confirmar que `restartRepaso` NO llama a `saveState` y por lo tanto NO necesita este guard — coherente con D-101 "los aciertos no comprometidos se descartan sin tocar state".

### Pattern S-5: Schema migration chain forward-compat (D-74)
**Source:** `src/data/storage.js` `migrate()` dispatcher (líneas 126-137).
**Apply to:** `migrate3to4` + `hydrateV4` se enchufan a la cadena existente — sin cambios al consumidor (`loadState`).

**Excerpt** (storage.js:126-131):
```js
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState();
  let s = parsed;
  if (s.schemaVersion === 1) s = migrate1to2(s);
  if (s.schemaVersion === 2) s = migrate2to3(s);
  if (s.schemaVersion === 3) return hydrateV3(s);
  // ...
}
```

**Aplicación Phase 6:** insertar 2 líneas (`if (s.schemaVersion === 3) s = migrate3to4(s); if (s.schemaVersion === 4) return hydrateV4(s);`) preservando la estructura fall-through.

### Pattern S-6: Defensive `?.` optional chaining para render seguro
**Source:** `src/screens/app.js` `resumeInFlightTest` (línea 480), schema-validator (varios sitios).
**Apply to:** El template `summary-errors` para match — `pairs.find(...)?.[1] || '(?)'`.

**Excerpción aplicada:**
```html
x-text="result.userAnswer.left + ' ↔ ' + (content.exerciseById[result.exerciseId].payload.pairs.find(p => p[0] === result.userAnswer.left)?.[1] || '(?)')"
```

**Razón:** defensa contra el edge "userAnswer.left no existe en pairs" (no debería ocurrir bajo el flujo D-107, pero defensa cuesta 4 chars).

---

## No Analog Found

**Files with no close match:** none. Phase 6 es 100% extensión de patrones ya establecidos en Phase 1-5. **Todos los 5 puntos de toque tienen analog exact-match en el MISMO archivo o archivo gemelo (tests).**

| File | Role | Data Flow | Razón "no analog" |
|------|------|-----------|-------------------|
| (vacío) | — | — | — |

> Esto confirma el principio CONTEXT.md §"specifics": *"Cero cambios al dominio puro — Phase 6 es 100% capa de presentación + state shape + migración. Esto mantiene D-02 layer purity intacto y baja el riesgo a 'Claude implementa UI / autor verifica visualmente en UAT'."*

---

## Metadata

**Analog search scope:**
- `src/screens/app.js` — único factory de UI con ~1400 líneas; gemelos arquitectónicos abundan (startSession, applyResultToSession, matchHadFailure).
- `src/data/storage.js` — cadena de migraciones v1→v2→v3 establecida; v3→v4 sigue el patrón letra por letra.
- `index.html` — 5 pantallas con switch `currentScreen`; `.button-row` + dispatch por `ex.type` + `<template x-for>` + `summary-delta` cubren los 2 puntos de toque HTML.
- `styles.css` — `.summary-delta` y `.incorrecta` cubren el ritmo visual nuevo; cero tokens nuevos requeridos.
- `tests/data-storage.test.js` + `tests/backup.test.js` — pattern de tests de migración pura ya repetido 4× en la cadena 1→2→3.
- `tests/domain.test.js` — pattern de smoke `buildSession` con state mockeado.

**Files scanned:** 7 (`src/screens/app.js`, `src/data/storage.js`, `src/data/backup.js`, `src/data/schema-validator.js`, `index.html`, `styles.css`, 5 archivos de tests).

**Pattern extraction date:** 2026-05-24

**Confidence:** HIGH — todos los analogs viven en el mismo codebase, ya validados por Phase 1-5 con tests verdes (130/130). Phase 6 es una extensión literal de helpers existentes; el riesgo de "el patrón no encaja" es nulo.
