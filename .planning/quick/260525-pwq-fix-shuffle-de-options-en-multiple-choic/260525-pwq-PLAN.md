---
phase: quick-260525-pwq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/app.js
  - index.html
  - tests/screen-multi-choice-shuffle.test.js
autonomous: true
requirements:
  - "quick: fix shuffle de options en multiple-choice (core value: re-verificar contenido, no posición)"

must_haves:
  truths:
    - "Cada vez que un multi-choice se monta en sub-state, el orden visual de las options se reordena con fisherYates."
    - "La indirección de orden NO toca el JSON de contenido: payload.options y payload.correctIndex siguen siendo los valores canónicos inmutables."
    - "Hacer click en la opción visualmente en posición N invoca multipleChoice.grade con el índice ORIGINAL (el del JSON), de modo que grade sigue funcionando sin cambios."
    - "El template renderiza el TEXTO de las options reordenadas (payload.options[perm]), no el índice perm."
    - "El highlight verde de la respuesta correcta tras feedback se aplica a la posición visual donde está el correctIndex original."
    - "El feedback textual 'Respuesta correcta: X' y el render del summary 'Errores cometidos' (review) NO se rompen — siguen mostrando el texto correcto."
    - "Caso flagrante avere-302..305 (4 ejercicios con MISMAS options + correctIndex=2): el alumno ya no puede aprender la posición — el orden visual varía entre ejercicios y entre cargas."
    - "Tests pasan: invariante de permutación válida (sort = [0..N-1]), preservación de la respuesta correcta tras shuffle, determinismo con seededLcg."
  artifacts:
    - path: "src/screens/app.js"
      provides: "Sub-estado multiChoiceOrder + inicialización en initSubStateForExercise rama multiple-choice + remap en sessionSelectOption call-sites (click + keydown)"
      contains: "multiChoiceOrder"
    - path: "index.html"
      provides: "Template multi-choice itera multiChoiceOrder con indirección payload.options[perm]; clase correcta usa perm; click pasa perm"
      contains: "multiChoiceOrder"
    - path: "tests/screen-multi-choice-shuffle.test.js"
      provides: "3 sub-tests sobre invariantes shuffle (permutación válida + correctness preservation + determinismo seededLcg) usando fisherYates ya exportado de src/domain/session.js"
      contains: "fisherYates"
  key_links:
    - from: "src/screens/app.js (initSubStateForExercise rama multiple-choice)"
      to: "src/domain/session.js fisherYates"
      via: "import + invocación con [0,1,..,N-1] y Math.random (mismo patrón que word-buttons / match — D-57/D-62, non-deterministic por carga intencional)"
      pattern: "fisherYates\\("
    - from: "index.html template multi-choice"
      to: "Alpine state multiChoiceOrder + payload.options[perm]"
      via: "x-for sobre multiChoiceOrder, x-text en payload.options[perm], click pasa perm (índice original)"
      pattern: "multiChoiceOrder"
    - from: "sessionSelectOption(idx)"
      to: "multipleChoice.grade con índice original"
      via: "idx en este flow ES el índice original (perm) — el call-site del keydown 1..9 debe traducir digit→multiChoiceOrder[digit-1] para mantener la semántica"
      pattern: "sessionSelectOption"
---

<objective>
Fix shuffle de options en multiple-choice. Hoy el template itera `payload.options` directo (index.html:262); la distribución de `correctIndex` está sesgada (pos 1 = 41%, pos 3 = 9%) y hay casos flagrantes (avere-302..305: MISMAS 4 options con correctIndex=2 → el alumno aprende "tercera columna" en vez de la regla pedagógica). Esto viola el core value del proyecto ("que el sistema te obligue a no olvidar"): orden predecible = no re-verificar contenido.

Approach: sub-estado `multiChoiceOrder` (permutación de índices) inicializado vía `fisherYates([0..N-1])` en `initSubStateForExercise`, igual que el banco word-buttons (D-57) y las columnas match (D-62). El JSON se queda inmutable (D-132); el template usa indirección `payload.options[perm]`; el click y el keydown pasan el índice ORIGINAL a `sessionSelectOption(idx)` → cero cambios en `src/exercise-types/multiple-choice.js` y cero cambios en grade.

Purpose: que el motor cumpla su promesa — un solo fallo te devuelve a re-verificar la categoría, pero para que eso tenga sentido pedagógico el orden de las options DEBE forzar al alumno a leer cada respuesta cada vez.

Output: 3 archivos modificados, 1 archivo de tests nuevo, ~202/202 tests verdes (199 baseline + 3 nuevos).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@CLAUDE.md

<interfaces>
<!-- Contratos clave extraídos del codebase. El executor NO necesita explorar más. -->

From `src/domain/session.js` (helper ya público, D-62):
```javascript
/**
 * Fisher-Yates shuffle seedable. Copia defensiva — NO muta arr.
 * @template T
 * @param {T[]} arr
 * @param {() => number} [rng=Math.random]
 * @returns {T[]}
 */
export function fisherYates(arr, rng = Math.random)
```

From `src/exercise-types/multiple-choice.js` (NO se toca):
```javascript
export const multipleChoice = {
  /**
   * @param {{payload: {correctIndex: number}}} exercise
   * @param {{index: number}} response   // index === índice ORIGINAL del JSON
   * @returns {boolean}
   */
  grade(exercise, response) {
    return response.index === exercise.payload.correctIndex;
  }
};
```

From `src/screens/app.js` línea ~941 (call-site #1 del click):
```javascript
sessionSelectOption(idx) {
  if (this.sessionFeedback !== null) return;
  this.sessionSelectedIndex = idx;
  const ex = this.sessionCurrentExercise;
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { index: idx });
  // ...
  this.applyResultToSession(ex, correct, ex.payload.options[idx]);
}
```
**Invariante crítica:** `idx` en este método es y debe seguir siendo el índice ORIGINAL del JSON (el que apunta a `payload.options[idx]`). Cualquier remap visual→original ocurre AGUAS ARRIBA (en el call-site), no aquí.

From `src/screens/app.js` línea ~1514 (call-site #2 del keydown 1..9):
```javascript
if (ex.type === 'multiple-choice') {
  if (idx < (ex.payload.options?.length ?? 0)) {
    this.sessionSelectOption(idx);  // idx = parseInt(key)-1 — POSICIÓN VISUAL
  }
  return;
}
```
**Bug actual implícito post-shuffle:** este `idx` proviene de `key - 1`, que es la posición VISUAL (1ª tecla = posición 0 visual). Tras introducir shuffle, este idx ya no es el índice original — debe traducirse a `this.multiChoiceOrder[idx]` antes de pasar a `sessionSelectOption`.

From `src/screens/app.js` línea ~1376 (initSubStateForExercise — patrón a seguir):
```javascript
initSubStateForExercise(exercise) {
  // limpieza universal: wordButtonsBank=[], matchLeft=[], etc., y AHORA multiChoiceOrder=[]
  // ...
  if (exercise.type === 'word-buttons') {
    this.wordButtonsBank = fisherYates(all);    // D-57 Math.random intencional
  } else if (exercise.type === 'match') {
    this.matchLeft = fisherYates(...);          // D-62
    this.matchRight = fisherYates(...);
  }
  // NUEVA rama: else if (exercise.type === 'multiple-choice')
}
```

From `index.html` líneas 259-296 (template multi-choice actual):
```html
<template x-if="sessionCurrentExercise.type === 'multiple-choice'">
  <div>
    <div class="button-row">
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
    <!-- explanation + Siguiente, sin cambios -->
  </div>
</template>
```

From `index.html` líneas ~578-581 (summary review — NO se toca: usa `payload.options[correctIndex]` que es resiliente al shuffle de sub-state):
```html
<template x-if="content.exerciseById[result.exerciseId].type === 'multiple-choice'">
  <div>
    <div>Tu respuesta: <span class="user-answer" x-text="result.userAnswer"></span></div>
    <div>Respuesta correcta: <strong x-text="...options[correctIndex]"></strong></div>
  </div>
</template>
```
**Por qué este bloque NO se toca:** opera sobre `content.exerciseById[...]` (JSON inmutable, sin sub-state), y `result.userAnswer` ya guarda el TEXTO literal de la opción clickada (D-105/D-106). El shuffle visual no afecta a este path en absoluto.

From `tests/util/seeded-rng.js`:
```javascript
export function seededLcg(seed)   // → () => number en [0,1), determinista
```

Convención de tests del proyecto (de `tests/exercise-types.test.js` y `tests/domain-session.test.js`):
- `node --test tests/*.test.js`
- `import { test, describe } from 'node:test'`
- `import assert from 'node:assert/strict'`
- Sin DOM ni Alpine — tests puros sobre dominio/util. (NB: `multiChoiceOrder` se inicializa DENTRO de Alpine x-data; el test invoca `fisherYates([0..N-1], seededLcg(seed))` directamente sobre el helper de dominio para validar las invariantes — el mismo helper que el screen invoca. Esto es exactamente lo que hace `domain-session.test.js` con `buildFullTest`.)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Shuffle multi-choice via sub-state multiChoiceOrder (sub-estado + template + remap keydown + tests)</name>
  <files>
    src/screens/app.js,
    index.html,
    tests/screen-multi-choice-shuffle.test.js
  </files>
  <behavior>
    Tests nuevos en `tests/screen-multi-choice-shuffle.test.js` (3 sub-tests sobre las invariantes del shuffle, ejecutando `fisherYates` directamente — el mismo helper que invoca el screen):

    - Test 1 — Permutation validity:
        Dado N ∈ {2, 3, 4, 5} y `rng = seededLcg(s)`, `out = fisherYates([0..N-1], rng)`.
        Assert: `[...out].sort((a,b)=>a-b)` equals `[0..N-1]`. (sin perder ni duplicar índices).

    - Test 2 — Correctness preservation:
        Dado `options = ['ho','hai','ha','hanno']`, `correctIndex = 2`, `perm = fisherYates([0,1,2,3], seededLcg(7))`.
        Assert: `options[perm[perm.indexOf(correctIndex)]]` equals `options[correctIndex]` equals `'ha'`. (La opción correcta sigue existiendo en la permutación, y su texto se preserva.)
        Adicional: `perm.includes(correctIndex)` es true.

    - Test 3 — Determinismo con seededLcg:
        Dos llamadas `fisherYates([0..3], seededLcg(42))` consecutivas producen arrays `deepStrictEqual` idénticos. (Misma seed → misma permutación reproducible.)

    Estos 3 tests viven en su propio archivo `tests/screen-multi-choice-shuffle.test.js` (no entremezclados con `exercise-types.test.js` que cubre grade) — captura el invariante de la integración shuffle screen-level, aunque el test mismo opere sobre el helper de dominio (justificado por D-62: un único algoritmo reusable). El test importa `fisherYates` de `src/domain/session.js` y `seededLcg` de `tests/util/seeded-rng.js`.
  </behavior>
  <action>
    Implementación atómica en 1 commit (alcance pequeño, todo o nada — el template, el sub-estado y el remap de keydown deben aterrizar juntos para no dejar la app en estado inconsistente).

    Paso 1 — Tests primero (RED): crear `tests/screen-multi-choice-shuffle.test.js` con los 3 sub-tests descritos en `<behavior>`. Verificar que pasan ANTES de tocar el screen (pasan trivialmente — `fisherYates` ya existe y es correcto; estos tests son tests de invariantes/regression sobre el helper en su nuevo uso, no tests de feature nueva). Esto es delivery del invariante documentado, no TDD red→green del helper.

    Paso 2 — Sub-estado en `src/screens/app.js` x-data factory: añadir `multiChoiceOrder: []` junto a `sessionSelectedIndex` (línea ~108). Comentario inline: `// Phase quick-260525-pwq — D-XXX permutación visual de payload.options. El JSON sigue inmutable; el sub-estado lo reordena por carga (Math.random intencional, igual que wordButtonsBank D-57 y matchLeft/Right D-62: el orden visual non-deterministic por carga es lo que fuerza al alumno a re-leer cada opción).`

    Paso 3 — `initSubStateForExercise` (línea ~1376): añadir limpieza universal `this.multiChoiceOrder = []` junto al resto (antes del `if (!exercise) return`). Añadir nueva rama al final del bloque tipo:
      `else if (exercise.type === 'multiple-choice') {
         const n = exercise.payload.options.length;
         this.multiChoiceOrder = fisherYates(Array.from({length: n}, (_, i) => i));
       }`
    Comentario inline que referencie D-57/D-62 para coherencia (el algoritmo es el mismo, el RNG es Math.random intencional, copia defensiva via fisherYates).

    Paso 4 — Template multi-choice en `index.html` (líneas 259-296):
      - Cambiar `<template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">` a `<template x-for="(perm, idx) in multiChoiceOrder" :key="perm">`. El `:key="perm"` (índice original) es estable entre re-renders del mismo ejercicio, lo cual es lo que queremos.
      - Reemplazar `x-text="opt"` por `x-text="sessionCurrentExercise.payload.options[perm]"`.
      - Reemplazar `@click="sessionSelectOption(idx)"` por `@click="sessionSelectOption(perm)"`. (El click pasa el índice ORIGINAL — sessionSelectOption queda intacto.)
      - Clase `'correcta'`: cambiar `idx === ...correctIndex` por `perm === sessionCurrentExercise.payload.correctIndex`.
      - Clase `'incorrecta'`: cambiar `idx === sessionSelectedIndex` por `perm === sessionSelectedIndex` (sessionSelectedIndex ya guarda el índice ORIGINAL, así que la comparación con `perm` es coherente).
      - El bloque `<p x-show="sessionFeedback === 'incorrect'">Respuesta correcta: <strong x-text="...options[correctIndex]"></strong></p>` NO cambia (sigue mostrando el texto correcto desde el JSON inmutable).
      - El bloque `explanation` NO cambia.
      - El botón `Siguiente` NO cambia.

    Paso 5 — Remap del keydown en `src/screens/app.js` (línea ~1514) — CRÍTICO, no olvidar:
      Antes:
        `if (idx < (ex.payload.options?.length ?? 0)) { this.sessionSelectOption(idx); }`
      Después:
        `if (idx < this.multiChoiceOrder.length) { this.sessionSelectOption(this.multiChoiceOrder[idx]); }`
      Comentario inline: `// Tecla N selecciona la opción VISUAL en posición N-1; multiChoiceOrder[idx] traduce a índice ORIGINAL del JSON para que sessionSelectOption + multipleChoice.grade sigan operando sobre el correctIndex canónico (Phase quick-260525-pwq).`

    Paso 6 — Verificar manualmente que el template y los call-sites son coherentes:
      - `grep -n "multiChoiceOrder" src/screens/app.js index.html` debe mostrar 4+ matches (declaración, limpieza, init en rama, remap keydown, x-for template, :key).
      - `grep -n "sessionSelectOption(idx)" index.html` debe retornar 0 matches (debió cambiarse a `sessionSelectOption(perm)`).
      - `grep -n "x-for.*payload.options" index.html` debe retornar 0 matches (debió cambiarse a iterar multiChoiceOrder).
      - `src/exercise-types/multiple-choice.js` SIN modificar (grep diff: cero cambios).
      - `content/exercises/*.json` SIN modificar (D-132 layer purity).
      - `src/data/schema-validator.js` SIN modificar (D-171).
      - `styles.css` SIN modificar (D-172).

    Paso 7 — Mini-smoke manual (no automated, anotar en commit msg): cargar avere-302 (uno de los 4 ejercicios flagrantes con correctIndex=2) y recargar la sesión 3-4 veces para confirmar visualmente que el orden cambia y que la opción correcta no siempre está en la 3ª posición.

    Commit message: `fix(quick-260525-pwq): shuffle multi-choice options via sub-state multiChoiceOrder`. Body explica: caso flagrante avere-302..305 + distribución sesgada (pos 1 = 41%, pos 3 = 9%) + approach (sub-estado permutación) + invariantes preservadas (D-132 JSON inmutable, D-176 schemaVersion 4, src/exercise-types/multiple-choice.js cero diff). Referencia al PROJECT.md core value "que el sistema te obligue a no olvidar".
  </action>
  <verify>
    <automated>node --test tests/*.test.js</automated>
    <human-check>
      Lanzar `npx serve`, abrir la app y empezar una sesión de la categoría `avere` con tamaño ≥ 6. Verificar:
      1. La primera vez que aparece un multi-choice (cualquier ID), las opciones se ven en un orden plausible.
      2. Recargar la página (no nueva sesión: F5 mismo state) y comprobar que el orden visual cambia (Math.random intencional por carga, igual que word-buttons / match).
      3. Forzar un fallo en cualquier multi-choice clicando una opción incorrecta y comprobar que:
         a) La opción clickada se marca incorrecta (rojo).
         b) La opción correcta se marca correcta (verde) — y es la correcta semánticamente (no la 3ª siempre).
         c) El bloque "Respuesta correcta: X" muestra el texto correcto.
         d) Si el ejercicio tiene `explanation`, aparece.
         e) Click en "Siguiente" avanza al siguiente ejercicio.
      4. Hacer el mismo flow con la tecla `3` (en vez de click) y comprobar que selecciona la 3ª opción VISUAL (no siempre el índice 2 del JSON).
      5. Si la sesión incluye avere-302..305 (los 4 flagrantes), comprobar que el orden visual difiere entre los 4 (no todos con la correcta en la 3ª columna).
    </human-check>
  </verify>
  <done>
    1. `node --test tests/*.test.js` exit 0 con ~202/202 verdes (199 baseline + 3 nuevos en `tests/screen-multi-choice-shuffle.test.js`).
    2. `grep -c "multiChoiceOrder" src/screens/app.js` ≥ 3 (declaración + limpieza + init rama multi-choice + remap keydown), `grep -c "multiChoiceOrder" index.html` ≥ 2 (x-for + :key).
    3. `grep -n "x-for.*payload.options" index.html` retorna 0 matches.
    4. `git diff src/exercise-types/multiple-choice.js content/exercises/ src/data/schema-validator.js styles.css` retorna 0 líneas (invariantes D-132/D-171/D-172/D-176 preservadas).
    5. Mini-smoke humano de los 5 escenarios pasa sin issues (anotar resultado en SUMMARY).
    6. Commit atómico landed con mensaje `fix(quick-260525-pwq): shuffle multi-choice options via sub-state multiChoiceOrder`.
  </done>
</task>

</tasks>

<verification>
- Tests: 199 baseline + 3 nuevos sub-tests shuffle = 202 verdes con `node --test tests/*.test.js`.
- Invariantes layer purity: cero diff en `src/exercise-types/multiple-choice.js`, `content/exercises/`, `src/data/schema-validator.js`, `styles.css`.
- Coherencia call-sites: `sessionSelectOption(idx)` siempre recibe el índice ORIGINAL del JSON (no la posición visual). Verificable por grep en `index.html` (`sessionSelectOption(perm)` en click) y en `src/screens/app.js` línea ~1514 (`this.multiChoiceOrder[idx]` en keydown).
- Smoke humano: 5 escenarios pasan (orden cambia por carga, click marca correcta semánticamente correcta, tecla 3 selecciona 3ª visual, avere-302..305 ya no fija la correcta en la 3ª columna).
</verification>

<success_criteria>
Plan completo cuando:
- [ ] `tests/screen-multi-choice-shuffle.test.js` existe con 3 sub-tests pasando.
- [ ] `multiChoiceOrder: []` declarado en x-data, limpieza universal en `initSubStateForExercise`, init rama multi-choice con `fisherYates(Array.from({length: n}, (_, i) => i))`.
- [ ] Template multi-choice en `index.html` itera `multiChoiceOrder` y usa `payload.options[perm]` para texto/click/clases.
- [ ] Keydown 1..9 multi-choice traduce digit→`multiChoiceOrder[idx]` antes de invocar `sessionSelectOption`.
- [ ] `src/exercise-types/multiple-choice.js` SIN modificar (`grep` cero matches del fix).
- [ ] JSON de contenido + schema-validator + styles.css SIN modificar (D-132/D-171/D-172).
- [ ] `node --test tests/*.test.js` exit 0 con ~202/202.
- [ ] Mini-smoke humano 5/5 PASS (anotado en SUMMARY).
- [ ] 1 commit atómico landed.
- [ ] SUMMARY.md captura la decisión D-XXX (sub-estado `multiChoiceOrder` con Math.random intencional, paralelo arquitectónico con D-57/D-62).
</success_criteria>

<output>
Create `.planning/quick/260525-pwq-fix-shuffle-de-options-en-multiple-choic/260525-pwq-SUMMARY.md` when done. SUMMARY debe documentar:
- Decisión nueva: sub-estado `multiChoiceOrder` (permutación visual, Math.random intencional, paralelo D-57/D-62) — propuesta como D-XXX para anclar en STATE.md "Key Decisions" si el autor lo confirma.
- Caso flagrante resuelto: avere-302..305 (4 ejercicios MISMAS options + correctIndex=2) ya no entrena "tercera columna".
- Distribución global de correctIndex (pos 1 = 41%, pos 3 = 9%) ya no afecta al alumno — el sesgo está en los JSON pero el shuffle visual lo neutraliza.
- Invariantes preservadas verificadas: D-132 JSON inmutable, D-176 schemaVersion 4, src/exercise-types/multiple-choice.js cero diff, schema-validator/styles.css cero diff.
- Resultado de mini-smoke humano (5 escenarios).
- Recomendación opcional para STATE.md "Key Decisions": añadir entrada con la decisión.
</output>
