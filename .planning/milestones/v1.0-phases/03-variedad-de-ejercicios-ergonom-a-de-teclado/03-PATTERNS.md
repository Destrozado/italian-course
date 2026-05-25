# Phase 3: Variedad de ejercicios + ergonomía de teclado — Pattern Map

**Mapped:** 2026-05-23
**Files analyzed:** 7 (2 new modules + 1 new test + 4 modified files)
**Analogs found:** 7 / 7 (all exact or role-match, todos en la propia codebase ya consolidada en Phases 1+2)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/exercise-types/word-buttons.js` (NEW) | domain handler (grade puro) | request-response (`grade(ex,response) → boolean`) | `src/exercise-types/multiple-choice.js` líneas 20-29 | **exact** (mismo tier, mismo contrato del registry) |
| `src/exercise-types/match.js` (NEW) | domain handler (grade puro con consumo de índices) | request-response (`grade(ex,response) → {correct, pairIdx?}`) | `src/exercise-types/multiple-choice.js` líneas 20-29 | **role-match** (mismo tier + contrato del registry, retorno enriquecido para D-66) |
| `src/exercise-types/index.js` (MODIFIED) | registry barrel | static dispatch table | `src/exercise-types/index.js` líneas 1-19 (versión Phase 1) | **exact** (extender 1 → 3 entradas) |
| `src/data/schema-validator.js` (MODIFIED) | data validation | batch (acumula errores y devuelve `{ok, errors}`) | `src/data/schema-validator.js` líneas 84-127 (rama multiple-choice actual) | **exact** (refactor del branch a dispatch table + 2 nuevos validadores hermanos) |
| `src/screens/app.js` (MODIFIED) | UI factory plano (Alpine `appShell`) | event-driven (`@click`/`@keydown.window`) + mutation reactiva | `src/screens/app.js` líneas 480-547 (`sessionSelectOption` + `sessionAdvance`) | **exact** (extracción del helper compartido `applyResultToSession` + 2 handlers hermanos) |
| `index.html` (MODIFIED) | Alpine template | declarative DOM binding (x-if / x-for / @click) | `index.html` líneas 226-256 (sub-template multiple-choice) | **exact** (añadir 2 sub-templates hermanos dentro del mismo outer x-if) |
| `styles.css` (MODIFIED) | CSS classless overrides | static styling + 1 `@keyframes` | `styles.css` líneas 35-45 (`.correcta`/`.incorrecta`) + líneas 86-97 (`.button-row`) | **exact** (mismo patrón de CSS vars Pico con fallback hex) |
| `tests/exercise-types.test.js` (NEW) | test (node --test puro) | request-response | `tests/domain.test.js` líneas 14-22, 100-198 | **exact** (mismo runner, mismo estilo de import + describe/test) |

---

## Pattern Assignments

### `src/exercise-types/word-buttons.js` (NEW — domain handler, request-response)

**Analog:** `src/exercise-types/multiple-choice.js` (archivo entero, 29 líneas).

**Lo que se COPIA del analog:**

Estructura del módulo completo (líneas 1-29):

```js
// src/exercise-types/multiple-choice.js
// ...
// Decisiones aplicadas:
//   - EXTYPE-01: tipo multiple-choice (frase con hueco + 3-4 botones).
//   - Anti-pattern evitado: "UI grades the answer". `grade()` vive aquí,
//     no en el x-data ni en un atributo HTML.

export const multipleChoice = {
  /**
   * @param {{payload: {correctIndex: number}}} exercise
   * @param {{index: number}} response
   * @returns {boolean}
   */
  grade(exercise, response) {
    return response.index === exercise.payload.correctIndex;
  }
};
```

**Lo que CAMBIA:**

- Export nombrado `wordButtons` (en lugar de `multipleChoice`).
- `grade()` recibe `{tokens: string[]}` (no `{index: number}`).
- Implementación: deep-equal case-insensitive sobre arrays, con guard de longitud previa.
- Bloque de "Decisiones aplicadas" cita D-64, D-67, CONT-06 (no EXTYPE-01).

**Invariantes a preservar:**

- **Layer purity D-02:** sin imports de `data/storage`, `data/content-loader`, ni nada del DOM. El JSDoc debe declarar explícitamente "sin DOM, sin storage, sin fetch" (mismo tono comentado que el analog).
- **NFC ya aplicado al cargar (CONT-06):** NO normalizar dentro de `grade()` — sería trabajo redundante y rompería el contrato "los strings llegan ya normalizados".
- **Sin `try/catch`:** `grade()` no debe atrapar errores; si `response.tokens` es `undefined` el handler usa `response.tokens ?? []` como en RESEARCH.md Pattern 5.

---

### `src/exercise-types/match.js` (NEW — domain handler, request-response con consumo idempotente)

**Analog:** `src/exercise-types/multiple-choice.js` (mismo archivo). Cuando el contrato diverge (devolver `pairIdx` además del booleano), el patrón de retorno enriquecido se justifica en JSDoc.

**Lo que se COPIA del analog:**

- Mismo header con bloque "Decisiones aplicadas" (citar D-65, D-66, D-67).
- Mismo formato de JSDoc `@param`/`@returns`.
- Export nombrado siguiendo convención del registry (`export const match = { ... }`).

**Lo que CAMBIA (firma específica para D-66 duplicados en columna derecha):**

```js
// Estructura objetivo (extraída de RESEARCH.md Pattern 7 + CONTEXT.md D-66):
export const match = {
  /**
   * @param {{payload: {pairs: Array<[string,string]>}}} exercise
   * @param {{leftWord: string, rightWord: string, consumedPairIdx: number[]}} response
   * @returns {{correct: boolean, pairIdx?: number}}
   */
  grade(exercise, response) {
    const { leftWord, rightWord, consumedPairIdx } = response;
    const consumed = new Set(consumedPairIdx ?? []);
    const lLow = leftWord.toLowerCase();
    const rLow = rightWord.toLowerCase();
    for (let i = 0; i < exercise.payload.pairs.length; i++) {
      if (consumed.has(i)) continue;
      const [pl, pr] = exercise.payload.pairs[i];
      if (pl.toLowerCase() === lLow && pr.toLowerCase() === rLow) {
        return { correct: true, pairIdx: i };
      }
    }
    return { correct: false };
  }
};
```

**Invariantes a preservar:**

- **Layer purity D-02:** sin DOM/storage/fetch (mismo invariante que `multiple-choice.js`).
- **Búsqueda lineal + Set de consumidos:** O(N) por intento sobre N ≤ 10 parejas, trivial.
- **Retorno enriquecido (`{correct, pairIdx?}`) es por necesidad D-66**, no por inconsistencia: el caller necesita saber QUÉ índice del payload se consumió para añadirlo a `matchPairsConsumed`. El handler de multiple-choice no necesita ese índice porque cada respuesta es atómica (no acumulable).

---

### `src/exercise-types/index.js` (MODIFIED — registry barrel)

**Analog:** El propio archivo en su versión Phase 1 (19 líneas).

**Estado actual (líneas 1-19):**

```js
import { multipleChoice } from './multiple-choice.js';

export const registry = {
  'multiple-choice': multipleChoice
};
```

**Lo que se COPIA del analog (la propia versión Phase 1):**

- Mismo formato de imports (named import desde archivo hermano).
- Mismo objeto-mapa indexado por `exercise.type` (no es ni Map ni clase — un objeto plano).
- Mismo comentario sobre cómo lo consume Alpine (`const handler = registry[exercise.type]`).

**Lo que CAMBIA:**

- 2 imports adicionales: `import { wordButtons } from './word-buttons.js';` e `import { match } from './match.js';`.
- 2 entradas adicionales en el objeto literal (`'word-buttons': wordButtons`, `'match': match`).
- Comentario header pasa de "Phase 1 solo registra `multiple-choice`" a "Phase 3 registra los 3 tipos completos".

**Invariante a preservar (D-01 registry agnóstico):**

- El switch por tipo OCURRE aquí (registry lookup) y en `schema-validator.js`. **NUNCA** dentro de `grade()` de un tipo concreto. Cualquier tentación de hacer `if (exercise.type === 'X')` dentro de `word-buttons.js` o `match.js` es bug — el tipo ya está implícito por estar en ese archivo.

---

### `src/data/schema-validator.js` (MODIFIED — data validation, batch error accumulation)

**Analog:** El propio archivo, líneas 84-127 (rama actual de `multiple-choice`).

**Lo que se COPIA del analog (líneas 109-127):**

```js
// payload shape para multiple-choice (D-07)
if (ex.type === 'multiple-choice') {
  const { prompt, options, correctIndex } = ex.payload;

  if (typeof prompt !== 'string' || !prompt.includes('___')) {
    push(file, ex.id, '"payload.prompt" debe ser string y contener el hueco "___"');
  }

  if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
    push(file, ex.id, `"payload.options" debe ser array de 3 o 4 strings (encontrado: ${Array.isArray(options) ? options.length : typeof options})`);
  } else if (options.some(o => typeof o !== 'string' || !o.trim())) {
    push(file, ex.id, '"payload.options" contiene entradas vacías o no-string');
  }

  const optsLen = Array.isArray(options) ? options.length : 0;
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= optsLen) {
    push(file, ex.id, `"payload.correctIndex" inválido: ${correctIndex} (debe ser entero en rango [0, ${optsLen}))`);
  }
}
```

**Patrones reutilizados (a mantener literalmente):**

- **Closure `push(file, exerciseId, reason)` (línea 36):** acumula errores sin lanzar mid-walk (D-08).
- **Mensajes en español (FOUND-04):** mismo registro y mismas comillas tipográficas que las existentes (`"payload.X"`, frases descriptivas con el valor encontrado).
- **`else if` para errores anidados:** si `options` no es array, NO se entra a `options.some(...)` (defensiva contra `TypeError`).
- **Continue/early-skip:** si `payload` no existe, `continue` (línea 106) salta la rama de payload — replicar en los nuevos validadores con `return` desde el helper.

**Lo que CAMBIA — refactor recomendado por RESEARCH.md Pattern 6 (dispatch table):**

Líneas 84-127 se reemplazan por:

```js
// Reemplazo de la línea 84 (`if (ex.type !== 'multiple-choice')`):
const validator = PAYLOAD_VALIDATORS[ex.type];
if (!validator) {
  push(file, ex.id, `type "${ex.type}" no soportado (esperado: ${Object.keys(PAYLOAD_VALIDATORS).join(', ')})`);
  continue;
}
validator(ex, file, push);
```

Y al inicio del módulo (después de `const ID_SLUG_RE`):

```js
const PAYLOAD_VALIDATORS = {
  'multiple-choice': validateMultipleChoicePayload,
  'word-buttons': validateWordButtonsPayload,
  'match': validateMatchPayload
};
```

Con los 3 helpers movidos al final del módulo (mismo nivel que comentarios `// ──`). La función `validateMultipleChoicePayload` es **extracción literal** del bloque actual líneas 110-127.

**Invariantes a preservar:**

- **Pureza D-02:** sin imports, sin DOM, sin storage (igual que ahora).
- **Devolver TODOS los errores en un pase (D-08):** los validadores nuevos NO retornan early tras el primer error; pushean y continúan.
- **Shape de error consistente `{file, exerciseId, reason}`:** ya garantizado por el callback `push` compartido — los validadores nuevos lo reciben como parámetro y lo invocan igual.
- **Sin nuevas dependencias:** validación hand-written (D-08). No introducir Valibot/Zod/Ajv.

---

### `src/screens/app.js` (MODIFIED — UI factory plano, event-driven)

**Analog 1: `sessionSelectOption` + cascada D-54 (líneas 480-518).**

```js
sessionSelectOption(idx) {
  // T-02-02: ignora double-clicks o clicks tras ya haber respondido.
  if (this.sessionFeedback !== null) return;

  this.sessionSelectedIndex = idx;
  const ex = this.sessionCurrentExercise;
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { index: idx });

  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: ex.id, correct });

  if (correct) {
    // SESSION-05 verde: auto-avance tras ~600ms. Guardar handle para
    // poder cancelar (Pitfall #5).
    this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
  } else {
    // D-54: cascada inmediata + persist. El estado refleja la regresión
    // ANTES de que el usuario pueda abandonar la sesión. applySessionResult
    // al final es idempotente respecto a este reset (rama FAIL-WINS aplicada
    // sobre state ya reseteado = no-op para la cascada). Los exerciseStats
    // SE BUMPEAN una sola vez ahí al final, preservando D-09 monotonicidad.
    const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
    saveState(newState);
    this.state = newState;
  }

  if (this.sessionMode === 'test-completo') {
    this.persistInFlightTest();
  }
}
```

**Patrón a EXTRAER en helper `applyResultToSession(exercise, correct)` (RESEARCH.md Pattern 3):**

El bloque entero desde `this.sessionFeedback = correct ? ...` hasta el `if (this.sessionMode === 'test-completo')` es el patrón que repite los 3 handlers. `sessionSelectOption` queda como:

```js
sessionSelectOption(idx) {
  if (this.sessionFeedback !== null) return;     // T-02-02 guard
  this.sessionSelectedIndex = idx;
  const ex = this.sessionCurrentExercise;
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { index: idx });
  this.applyResultToSession(ex, correct);
}
```

Y los handlers nuevos siguen exactamente el mismo formato — la lógica de feedback + cascada D-54 + autoAdvance + persistInFlightTest vive en un solo sitio. **Garantía D-54 + D-09:** un único call-site de `applyImmediateFailure` para los 3 tipos (excepto match — ver siguiente analog).

---

**Analog 2: `sessionAdvance` (líneas 533-547) — patrón cleanup setTimeout + advance:**

```js
sessionAdvance() {
  this.cancelAutoAdvance();
  this.sessionCursor += 1;
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) {
    this.completeSession();
  } else if (this.sessionMode === 'test-completo') {
    this.persistInFlightTest();
  }
}
```

**Lo que CAMBIA en Phase 3:**

Tras incrementar `sessionCursor`, antes del check de `>= length`, hay que invocar `initSubStateForExercise(nextEx)` para resetear los sub-estados del nuevo ejercicio (RESEARCH.md Pattern 4):

```js
// Insertar tras `this.sessionFeedback = null;`:
if (this.sessionCursor < this.sessionExerciseIds.length) {
  const nextEx = this.content.exerciseById[this.sessionExerciseIds[this.sessionCursor]];
  this.initSubStateForExercise(nextEx);
}
```

Y `initSubStateForExercise` también se invoca en `startSession()` tras setear `sessionCursor = 0` (línea 325 actual).

**`resetSession()` (líneas 228-236)** se extiende para limpiar TAMBIÉN los sub-estados de word-buttons y match (igual que ya limpia `sessionFeedback`, `sessionResults`, etc.). Y cancelar el `matchFlashHandle` (analogía directa con `cancelAutoAdvance()` línea 553-558).

---

**Analog 3: `cancelAutoAdvance` (líneas 553-558) — patrón de cleanup idempotente de timer:**

```js
cancelAutoAdvance() {
  if (this.sessionAutoAdvanceHandle !== null) {
    clearTimeout(this.sessionAutoAdvanceHandle);
    this.sessionAutoAdvanceHandle = null;
  }
}
```

**Patrón a REPLICAR literal:** `cancelMatchFlash()` con la misma forma (guard truthy + clearTimeout + null reset). Se invoca desde `initSubStateForExercise`, `resetSession`, `destroy()`, y dentro del propio `setTimeout` del parpadeo cuando expira. **Pitfall #5 (timer cleanup) — patrón reusado idéntico.**

---

**Analog 4: Getter `sessionCurrentExercise` (líneas 648-654) — double-defense Alpine canónica:**

```js
get sessionCurrentExercise() {
  if (!this.content) return null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) return null;
  const id = this.sessionExerciseIds[this.sessionCursor];
  if (!id) return null;
  return this.content.exerciseById?.[id] ?? null;
}
```

**Patrón a REPLICAR para los nuevos getters de Phase 3 (`bankWithKeys`, `wordButtonsCanCheck`, `matchLeftIsConsumed`, `matchRightIsConsumed`, etc.):**

- Devolver array vacío o `null`/`false` (NO `undefined`) cuando un pre-requisito falta.
- Guard explícito al inicio (`if (!this.sessionCurrentExercise) return [];`).
- Optional chaining (`?.`) sólo para el SEGUNDO acceso en adelante; el PRIMERO debe ser un check explícito.

---

**Analog 5: Lifecycle `init()` + `destroy()` (líneas 132-147) — Promise-handoff Alpine intacto:**

```js
async init() {
  const { content, state } = await appDataReady;
  this.content = content;
  this.state = state;
  this.ready = true;
  this.currentScreen = 'home';
}

destroy() {
  this.cancelAutoAdvance();
}
```

**Lo que CAMBIA en Phase 3:**

`destroy()` debe añadir `this.cancelMatchFlash();` después del `cancelAutoAdvance` (mismo patrón Pitfall #5 — cualquier timer activo cuando el componente se desmonta debe limpiarse). El listener `@keydown.window` se desmonta solo gracias a Alpine (`<section @keydown.window="handleSessionKey($event)">` dentro del outer `<template x-if="currentScreen === 'session' && ...">`).

**`init()` queda intacto** — Phase 3 NO toca el Promise-handoff (D-26 invariante).

---

### `index.html` (MODIFIED — Alpine template, declarative DOM binding)

**Analog: líneas 226-256 (sub-template multiple-choice actual):**

```html
<template x-if="currentScreen === 'session' && sessionCurrentExercise">
  <article>
    <header x-text="sessionProgressLabel"></header>

    <p x-text="sessionCurrentExercise.payload.prompt"></p>

    <div role="group">
      <template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">
        <button type="button"
                @click="sessionSelectOption(idx)"
                :disabled="sessionFeedback !== null"
                :class="{
                  'correcta': sessionFeedback !== null && idx === sessionCurrentExercise.payload.correctIndex,
                  'incorrecta': sessionFeedback === 'incorrect' && idx === sessionSelectedIndex
                }"
                x-text="opt"></button>
      </template>
    </div>

    <p x-show="sessionFeedback === 'incorrect'">
      Respuesta correcta:
      <strong x-text="sessionCurrentExercise.payload.options[sessionCurrentExercise.payload.correctIndex]"></strong>
    </p>
    <button x-show="sessionFeedback === 'incorrect'" @click="sessionAdvance">Siguiente</button>

    <hr>
    <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
  </article>
</template>
```

**Patrones a copiar literal:**

1. **Outer x-if double-defense** (`currentScreen === 'session' && sessionCurrentExercise`): se preserva sin cambios. Los nuevos sub-templates van DENTRO del mismo `<article>`. (UAT 02-03 lesson #2 cita textualmente la importancia de esta guard).
2. **`x-text` exclusivamente, jamás `x-html`** (T-02-01). Las nuevas palabras del banco se renderizan con `<span x-text="entry.word"></span>` + `<sup class="kbd-hint" x-text="entry.key"></sup>` (NO concatenar en una sola expresión Alpine ni usar `x-html`).
3. **`:disabled="sessionFeedback !== null"`** sobre los botones interactivos — copiar exacto a botones del banco word-buttons, botones del área respuesta, items match.
4. **`:class="{...}"` objeto literal** con expresiones evaluadas — patrón canónico para combinar `.correcta`/`.incorrecta` y los nuevos `.match-selected`/`.match-consumed`/`.match-flash`.
5. **`x-show="sessionFeedback === 'incorrect'"` para el botón "Siguiente"** — copiar literal a los 2 sub-templates nuevos (botón Siguiente aparece tras fallo en los 3 tipos por D-71).
6. **`<button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>`** queda al final del `<article>` (NO se duplica por sub-template — vive una sola vez tras los 3 x-if hermanos).

**Lo que CAMBIA — estructura interna del `<article>`:**

El `<div role="group">` actual de multiple-choice se ENVUELVE en su propio `<template x-if="sessionCurrentExercise.type === 'multiple-choice'">` (sin cambios al markup interior). A continuación se añaden 2 hermanos:

```html
<template x-if="sessionCurrentExercise.type === 'multiple-choice'">
  <div role="group"> <!-- bloque actual sin cambios --> </div>
</template>

<template x-if="sessionCurrentExercise.type === 'word-buttons'">
  <!-- banco + área respuesta + Comprobar (RESEARCH.md Pattern 1) -->
</template>

<template x-if="sessionCurrentExercise.type === 'match'">
  <!-- match-grid con 2 columnas (RESEARCH.md Pattern 1) -->
</template>
```

Y el `<article>` raíz se decora con `@keydown.window="handleSessionKey($event)"` para registrar el listener global con cleanup automático (D-72).

**ANTI-PATTERN a EVITAR (lección recurrente UAT Phase 1+2):**

- **NO** mover el botón `← Volver al home` dentro de cada sub-template — quedaría duplicado 3 veces y el `<hr>` también. Una sola instancia fuera de los 3 sub-templates es la solución correcta.
- **NO** usar `role="group"` para envolver los 2 botones (`Comprobar` + `Siguiente`) cuando convivan tras fallo — Pico une los bordes (UAT 02-03/02-04 lesson recurrent). Usar `.button-row` (líneas 86-97 de `styles.css`).
- **NO** usar `x-html` para concatenar palabra + sufijo. Dos elementos separados (`<span>` + `<sup>`) dentro del `<button>` (T-02-01).

---

### `styles.css` (MODIFIED — CSS classless overrides)

**Analog 1: `.correcta` / `.incorrecta` (líneas 35-45):**

```css
button.correcta {
  background-color: var(--pico-color-green-500, #2e7d32);
  border-color: var(--pico-color-green-600, #1b5e20);
  color: white;
}

button.incorrecta {
  background-color: var(--pico-color-red-500, #d32f2f);
  border-color: var(--pico-color-red-600, #b71c1c);
  color: white;
}
```

**Patrón a copiar:** **CSS var Pico + fallback hex tradicional**. Las nuevas clases (`.match-selected`, `.match-consumed`, `.match-flash`, `.wb-answer.incorrecta`) usan el mismo formato `var(--pico-X, #fallback)` para verde/rojo/muted/primary.

**Analog 2: `.button-row` (líneas 86-97):**

```css
.button-row {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
}
.button-row button {
  flex: 1;
}
.button-row-prominent button {
  font-size: 1.1rem;
  padding: 0.75rem 1.5rem;
}
```

**Patrón a REUSAR (no duplicar):** el row `Comprobar` + `Siguiente` cuando coexistan tras fallo en word-buttons usa `<div class="button-row">` directamente — no se crea selector nuevo (UI-SPEC línea 46 lo cita literal).

**Lo que CAMBIA — nuevas clases a añadir al final del archivo (UI-SPEC líneas 112-167):**

`.wb-bank`, `.wb-answer`, `.wb-answer-empty::before` (placeholder italic), `.wb-answer.incorrecta`, `.wb-correct-answer`, `.kbd-hint`, `.match-grid`, `.match-col`, `.match-selected` (outline 2px Pico primary), `.match-consumed` (muted + opacity 0.55 + cursor not-allowed), `.match-flash` (anima `match-flash-red`) + `@keyframes match-flash-red` (un solo flash 300ms ease-out, NO loop).

**Invariantes a preservar (UI-SPEC):**

- **NO inventar variables CSS nuevas** para spacing (UI-SPEC Spacing Scale línea 47). Px literales en selectores específicos.
- **CSS vars Pico con fallback hex** en TODOS los colores (consistente con líneas 35-45 y 57-59).
- **Sin `role="group"` para `.button-row`** (UAT 02-03/02-04 lesson — no duplicar el bug).
- **`@keyframes match-flash-red`** corre 1 vez (`animation: ... 1` o equivalente), NO loop — WCAG 2.3.1 (max 3 flashes/sec, este es 1).

---

### `tests/exercise-types.test.js` (NEW — node --test puro)

**Analog:** `tests/domain.test.js` (archivo entero, 199 líneas). En particular:

- **Imports (líneas 14-22):**

```js
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { multipleChoice } from '../src/exercise-types/multiple-choice.js';
import { registry } from '../src/exercise-types/index.js';
import { seededLcg } from './util/seeded-rng.js';
```

- **Estructura describe (líneas 173-198):**

```js
describe('exercise-types/multiple-choice', () => {
  test('grade returns true when response.index matches correctIndex', () => {
    const ex = { payload: { correctIndex: 2 } };
    assert.equal(multipleChoice.grade(ex, { index: 2 }), true);
  });
  // ...
});

describe('exercise-types/index', () => {
  test('registry exposes multiple-choice handler with grade()', () => {
    assert.ok(registry['multiple-choice'], 'registry debería tener una entrada "multiple-choice"');
    assert.equal(typeof registry['multiple-choice'].grade, 'function');
    assert.equal(registry['multiple-choice'], multipleChoice);
  });
});
```

- **Test de validator (líneas 101-167):** el patrón `validateContent({ categories, exercisesByFile })` con asserts sobre `result.errors` y `result.errors.some(e => /regex/.test(e.reason))` se REUSA literal para validar payloads malformados de los nuevos tipos.

**Lo que se COPIA:**

- Mismo runner (`node --test tests/*.test.js`).
- Mismos imports (`node:test`, `node:assert/strict`).
- Mismo estilo `describe(group, () => { test(name, () => { assert.X }); })`.
- Mensajes de assert en español con backticks descriptivos (líneas 117-118, 142-148).
- Casos de borde: pool vacío (líneas 73-77), referencias desconocidas (líneas 102-119), errores acumulados en un pase (líneas 121-148), happy path (líneas 150-166).

**Lo que CAMBIA — nuevos describes (cobertura mínima CONTEXT.md "Tests" + RESEARCH.md):**

- `describe('exercise-types/word-buttons', ...)` con tests: sin distractoras, con distractoras, case-insensitive, orden incorrecto, longitud incorrecta, tokens vacíos.
- `describe('exercise-types/match', ...)` con tests: pareja correcta, pareja incorrecta, duplicados en derecha (D-66 — dos `"la"` ambos válidos), case-insensitive, índice ya consumido se ignora.
- `describe('exercise-types/index', ...)` extendido: las 3 entradas existen con identidad correcta.
- Extensiones en `describe('data/schema-validator', ...)` (puede vivir en `domain.test.js` o en este archivo nuevo — discretion del planner): payloads malformados de word-buttons y match con mensajes claros y `{file, exerciseId, reason}` consistente.

**Invariantes a preservar:**

- **Sin dependencias externas** (D-11). Solo `node:test` + `node:assert/strict`.
- **Determinismo:** si se necesita Fisher-Yates en algún test (poco probable — grade es puro), inyectar `seededLcg(seed)` (líneas 22 del archivo + `tests/util/seeded-rng.js`).
- **Sin mocking de DOM/localStorage:** los handlers son puros, no lo necesitan.

---

## Shared Patterns

### Patrón 1 — Double-defense Alpine (lección recurrente Phase 1+2)

**Source:** `src/screens/app.js` líneas 648-654 (`sessionCurrentExercise`) + `index.html` líneas 215-226 (comentario explicativo del outer x-if).

**Apply to:** Cada nuevo `<template x-if="...">` añadido en Phase 3 + cada nuevo getter de sub-estado en `appShell`.

```js
// Getter pattern (en src/screens/app.js):
get bankWithKeys() {
  if (!this.sessionCurrentExercise) return [];          // primer cinturón
  return this.wordButtonsBank.map((word, idx) => ({
    word,
    key: idx < 9 ? String(idx + 1) : ''
  }));
}
```

```html
<!-- Template pattern (en index.html): outer guard ya existente, sub-template hereda -->
<template x-if="currentScreen === 'session' && sessionCurrentExercise">
  <article @keydown.window="handleSessionKey($event)">
    <template x-if="sessionCurrentExercise.type === 'word-buttons'">
      <!-- aquí dentro `sessionCurrentExercise` está garantizado truthy POR la outer guard,
           PERO los payloads anidados usan ?. defensivamente -->
      <p x-text="sessionCurrentExercise?.payload?.prompt"></p>
    </template>
  </article>
</template>
```

**Regla canónica (Plan 02-03 SUMMARY lessons learned #1, citada en `src/screens/app.js` líneas 672-685):**

> Cualquier binding Alpine que traverse propiedades anidadas de un recurso nullable (`state`, `content`, `sessionCurrentExercise`) DEBE protegerse con DOBLE defensa: (1) getter defensivo que devuelve sentinel cuando el recurso no está listo, (2) `<template x-if="<getter>">` que evita que los bindings internos se evalúen. El optional chaining `?.` por sí solo NO basta.

---

### Patrón 2 — Layer purity D-02

**Source:** `src/exercise-types/multiple-choice.js` (archivo entero) + `src/data/schema-validator.js` (archivo entero).

**Apply to:** `src/exercise-types/word-buttons.js`, `src/exercise-types/match.js`, y los nuevos validadores de payload dentro de `schema-validator.js`.

**Comprobación:** los archivos `src/exercise-types/*` y `src/data/schema-validator.js` NO deben tener imports de `data/storage.js`, `data/content-loader.js`, ni referencias a `document`/`window`/`localStorage`/`fetch`/`setTimeout`. Si necesitan algo común (NFC normalization, comparaciones), se hace inline o se mueve a un helper de `src/util/` (no existe aún — crear sólo si emerge).

---

### Patrón 3 — Registry agnóstico D-01

**Source:** `src/exercise-types/index.js` líneas 17-19 + `src/screens/app.js` línea 486 (`const handler = registry[ex.type]`).

**Apply to:** El switch por tipo ocurre en EXACTAMENTE 3 lugares:

1. `src/exercise-types/index.js` (dispatch table del registry).
2. `src/data/schema-validator.js` (dispatch table de validadores de payload — RESEARCH.md Pattern 6).
3. `index.html` (3 sub-templates `<template x-if="sessionCurrentExercise.type === 'X'">`).

**NO se hace switch por tipo** dentro de `grade()` de un handler concreto, ni dentro de `applyResultToSession`, ni dentro de `initSubStateForExercise` (este último switch es por sub-estado, no por tipo abstracto — se justifica porque el `appShell` AÚN no tiene la abstracción "handler conoce su propio sub-estado"; si emergiera, se movería al registry como segunda función `initState(rng)`).

---

### Patrón 4 — Cascada D-54 inmediata exactamente una vez

**Source:** `src/screens/app.js` líneas 496-507 (rama `!correct` de `sessionSelectOption`).

```js
// D-54: cascada inmediata + persist. El estado refleja la regresión
// ANTES de que el usuario pueda abandonar la sesión.
const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
saveState(newState);
this.state = newState;
```

**Apply to:** Todo handler de Phase 3 que detecte fallo (`wordButtonsCheck` branch !correct, `matchPickRight` branch !correct). **CRÍTICO (D-61):**

- Word-buttons: se invoca DIRECTO (mismo flujo que multiple-choice — una sola decisión final).
- Match: se invoca con guard `if (!this.matchHadFailure) { ...applyImmediateFailure...; this.matchHadFailure = true; }`. Los clicks erróneos posteriores en el MISMO ejercicio NO re-disparan (idempotencia explícita, evita writes redundantes a localStorage).

**Extracción canónica recomendada (CONTEXT.md "Claude's Discretion" + RESEARCH.md Pattern 3):**

`applyResultToSession(exercise, correct)` centraliza el bloque para los casos "una sola decisión final" (multiple-choice + word-buttons + match-cuando-termina-todas-las-parejas). El match-mid-ejercicio invoca `applyImmediateFailure` directamente porque no termina el ejercicio aún (sigue jugándose), pero con el guard `matchHadFailure`.

---

### Patrón 5 — Cleanup idempotente de timer (Pitfall #5)

**Source:** `src/screens/app.js` líneas 553-558 (`cancelAutoAdvance`) + línea 146 (`destroy()` lo invoca).

```js
cancelAutoAdvance() {
  if (this.sessionAutoAdvanceHandle !== null) {
    clearTimeout(this.sessionAutoAdvanceHandle);
    this.sessionAutoAdvanceHandle = null;
  }
}
```

**Apply to:** Nuevo `cancelMatchFlash()` con la misma forma. Invocaciones obligatorias desde: `initSubStateForExercise` (al cargar ejercicio nuevo el flash del anterior debe morir), `resetSession`, `destroy()`, y dentro del propio `setTimeout` del flash cuando expira para limpiar `matchFlashHandle = null` antes de quitar la clase.

---

### Patrón 6 — Promise-handoff Alpine init (D-26 invariante)

**Source:** `src/screens/app.js` líneas 132-139 + `index.html` línea 60 (`x-init="init()"`).

**Apply to:** **NO se toca en Phase 3.** El factory `appShell(appDataReady)` sigue recibiendo la Promise, `init()` la awaitea, los sub-estados nuevos se inicializan a default en el objeto literal del factory (líneas 82-118 estilo). El `init()` puede añadir una línea final `this.initSubStateForExercise(null)` (no-op defensiva), pero el patrón estructural queda intacto.

---

### Patrón 7 — Comentarios de "Decisiones aplicadas" en header del módulo

**Source:** Todos los módulos existentes (`src/exercise-types/multiple-choice.js` líneas 1-13, `src/data/schema-validator.js` líneas 1-15, `src/screens/app.js` líneas 1-58).

**Apply to:** Los 2 nuevos archivos `word-buttons.js` y `match.js` deben tener el mismo bloque header con:

- Una línea de qué hace.
- Lista de "Decisiones aplicadas" citando las D-XX relevantes (D-64/D-67 para word-buttons, D-65/D-66/D-67 para match).
- Mención explícita de "Layer purity D-02 invariante".
- Si aplica, mención del anti-pattern evitado ("UI grades the answer").

Mismo estilo de comentario en `tests/exercise-types.test.js` (header explicando qué cubre, mismo formato que `tests/domain.test.js` líneas 1-12).

---

## Files with No Analog (Empty Set)

Todos los archivos a crear/modificar tienen analog directo en la propia codebase. NO existe ningún caso donde el planner deba caer en RESEARCH.md por falta de patrón local — Phase 3 es una extensión limpia del motor Phase 1+2.

| File | Why No Analog Needed |
|------|----------------------|
| (none) | All 7 files have direct codebase analogs |

---

## Metadata

**Analog search scope:**

- `src/exercise-types/` (registry + multiple-choice handler).
- `src/data/schema-validator.js` (rama actual multiple-choice).
- `src/screens/app.js` (sessionSelectOption, sessionAdvance, getters defensivos, lifecycle, cancelAutoAdvance, resetSession, startSession).
- `src/domain/session.js` (Fisher-Yates de buildFullTest — solo como referencia algorítmica para el shuffle de match/word-buttons).
- `index.html` (outer x-if double-defense + sub-template multiple-choice).
- `styles.css` (`.correcta`/`.incorrecta`, `.button-row`).
- `tests/domain.test.js` (estructura de describes + asserts + util/seeded-rng).

**Files scanned:** 11 archivos leídos en pase único; sin re-reads.

**Pattern extraction date:** 2026-05-23.

**Confidence:** HIGH — todos los analogs son código ya en producción (Phase 1+2 con UAT sign-off), no especulativo.
