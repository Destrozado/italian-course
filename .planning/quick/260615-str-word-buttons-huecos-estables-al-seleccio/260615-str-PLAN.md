---
phase: quick-260615-str
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/app.js
  - index.html
  - styles.css
  - tests/screen-canciones.test.js
  - tests/exercise-types.test.js
autonomous: true
requirements: [WB-HUECOS-01]

must_haves:
  truths:
    - "Al colocar una palabra del banco, el nº de slots visibles del banco NO cambia (el hueco se mantiene ocupado por un placeholder invisible) — las demás palabras no se mueven (sin reflow)."
    - "El slot de una palabra colocada se renderiza con visibility:hidden (mantiene la caja), no es clickable ni focusable."
    - "Quitar una palabra del área respuesta restaura ese slot a su posición visual ORIGINAL en el banco (banco estable, no append al final)."
    - "La respuesta derivada (wordButtonsAnswer) es correcta incluso con palabras repetidas (mapeo por índice, no por valor)."
    - "El atajo de teclado dígito N coloca la N-ésima palabra VISIBLE (no-colocada); Backspace quita la última colocada."
    - "Las canciones (pantalla cancion, mismo word-buttons inverso) siguen funcionando idénticas con el nuevo modelo."
    - "El grading y el estado persistido (localStorage) NO cambian — solo cambia cómo se deriva la respuesta y cómo se renderiza el banco."
  artifacts:
    - path: "src/screens/app.js"
      provides: "Estado wordButtonsPlacedIdx (fuente de verdad), getter derivado wordButtonsAnswer, wordButtonsAddWord/RemoveWord por índices, bankWithKeys con placed+key dinámico, mapeo teclado dígito→slot visible, resets a wordButtonsPlacedIdx=[]"
      contains: "wordButtonsPlacedIdx"
    - path: "index.html"
      provides: "Banco word-buttons (session ~L442 y cancion ~L656) con :key=entry.idx, @click=wordButtonsAddWord(entry.idx) y placeholder .wb-placed cuando entry.placed"
      contains: "entry.idx"
    - path: "styles.css"
      provides: "Clase .wb-placed con visibility:hidden (mantiene el tamaño de la caja)"
      contains: ".wb-placed"
  key_links:
    - from: "src/screens/app.js wordButtonsAnswer (getter)"
      to: "wordButtonsPlacedIdx + wordButtonsBank"
      via: "this.wordButtonsPlacedIdx.map(i => this.wordButtonsBank[i])"
      pattern: "wordButtonsPlacedIdx\\.map"
    - from: "index.html banco (x-for bankWithKeys)"
      to: "wordButtonsAddWord(entry.idx)"
      via: "click pasa el slotIdx, no el loop idx"
      pattern: "wordButtonsAddWord\\(entry\\.idx\\)"
    - from: "bankWithKeys getter"
      to: "wordButtonsPlacedIdx.includes(idx)"
      via: "placed flag por slot"
      pattern: "placed"
---

<objective>
En los ejercicios word-buttons (y en las canciones, que usan el MISMO word-buttons inverso), al pulsar una palabra del banco hoy se ELIMINA del array → el banco encoge y `flex-wrap` recoloca todo, causando mis-clicks. Este plan refactoriza el MODELO del banco para que el hueco de una palabra colocada se mantenga ocupado por un placeholder invisible (`visibility:hidden`), de modo que las posiciones de las demás palabras NO cambien.

El cambio es: modelo del banco (índices, banco estable) + render (placeholder) + CSS. NO toca el grading ni el estado persistido (localStorage).

Purpose: Eliminar el reflow del banco que causa mis-clicks (UAT 2026-06-15).
Output: `wordButtonsPlacedIdx` como nueva fuente de verdad, `wordButtonsAnswer` como getter derivado, banco estable con placeholders invisibles, tests actualizados + nuevos.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260615-str-word-buttons-huecos-estables-al-seleccio/260615-str-CONTEXT.md
@./CLAUDE.md

<interfaces>
<!-- Contratos REALES extraídos del código. El executor NO necesita explorar. -->

ESTADO ACTUAL (src/screens/app.js):
- L216 `wordButtonsBank: []` — hoy lista de palabras VISIBLES (se muta con .filter en add/remove).
- L218 `wordButtonsAnswer: []` — hoy propiedad de estado (tokens colocados, orden cronológico).

LECTORES de wordButtonsAnswer (TODOS deben seguir funcionando con el getter — enumerados):
- L681-682 `songCheck()`: `grade(phrase, { tokens: this.wordButtonsAnswer })` y `applyResultToSession(phrase, correct, [...this.wordButtonsAnswer])`.
- L736-737 `handleSongKey` Backspace: `const last = this.wordButtonsAnswer.length - 1; if (last>=0) this.wordButtonsRemoveWord(last)`.
- L1850 `wordButtonsCheck()`: `grade(ex, { tokens: this.wordButtonsAnswer })`.
- L1857 `wordButtonsCheck()`: `applyResultToSession(ex, correct, [...this.wordButtonsAnswer])`.
- L2250-2252 `handleSessionKey` Backspace: chequea `this.wordButtonsAnswer.length > 0` y llama `wordButtonsRemoveWord(this.wordButtonsAnswer.length - 1)`.
- L2697 `get wordButtonsCanCheck`: `return this.wordButtonsAnswer.length > 0 && this.sessionFeedback === null`.
- index.html L456/L460/L462 (session) y L670/L674/L676 (cancion): `wordButtonsAnswer.length === 0`, `x-for word in wordButtonsAnswer`, `wordButtonsRemoveWord(idx)`.
TODOS estos leen `.length` o iteran/clonan el array → un getter que devuelve un array fresco los satisface sin cambios.

ESCRITORES de wordButtonsAnswer (se convierten a wordButtonsPlacedIdx; el getter NO es asignable):
- L531, L639, L819, L1087, L2084, L2114 — `this.wordButtonsAnswer = []` (resets/init) → pasar a `this.wordButtonsPlacedIdx = []`.
- L1818 `wordButtonsAddWord`: `this.wordButtonsAnswer = [...this.wordButtonsAnswer, word]` → reescribir a push de índice.
- L1833 `wordButtonsRemoveWord`: `this.wordButtonsAnswer = this.wordButtonsAnswer.filter(...)` → reescribir a splice de índice.

ESCRITORES de wordButtonsBank (el banco YA NO se muta tras init):
- L530,638,818,1086,2083 `this.wordButtonsBank = []` (limpieza) → SE MANTIENEN (limpieza de banco al cambiar de ejercicio).
- L2113 `this.wordButtonsBank = fisherYates(all)` (init word-buttons) → SE MANTIENE.
- L1817 `this.wordButtonsBank = this.wordButtonsBank.filter(...)` (en addWord) → SE ELIMINA (el banco deja de mutarse).
- L1834 `this.wordButtonsBank = [...this.wordButtonsBank, word]` (en removeWord) → SE ELIMINA.

bankWithKeys getter ACTUAL (L2676-2687):
```
get bankWithKeys() {
  if (!this.sessionCurrentExercise && !this.songCurrentPhrase) return [];
  return this.wordButtonsBank.map((word, idx) => ({
    word, key: idx < 9 ? String(idx + 1) : ''
  }));
}
```

MAPEO TECLADO ACTUAL (dígito → palabra del banco):
- handleSessionKey L2279-2284: `if (idx < this.wordButtonsBank.length && idx < 9) this.wordButtonsAddWord(idx)`.
- handleSongKey L744-747: `const idx = Number(key) - 1; if (idx < this.wordButtonsBank.length && idx < 9) this.wordButtonsAddWord(idx)`.
En el modelo VIEJO `idx` (posición visible) == slotIdx. En el NUEVO hay que traducir N-ésima VISIBLE → slotIdx. CRÍTICO: el guard viejo `idx < this.wordButtonsBank.length` debe DESAPARECER de ambas ramas word-buttons; sustituirlo por `this.visibleSlotIdx(idx)`. Si quedara `wordButtonsBank.length` en estas ramas, colocaría el slot equivocado cuando hay huecos.

MARKUP ACTUAL (index.html, 2 bloques idénticos: session L442-451, cancion L656-664):
```
<div class="wb-bank">
  <template x-for="(entry, idx) in bankWithKeys" :key="entry.word + '_' + idx">
    <button type="button"
            @click="wordButtonsAddWord(idx)"
            :disabled="sessionFeedback !== null"
            :aria-label="'Palabra ' + entry.key + ': ' + entry.word">
      <span x-text="entry.word"></span><sup class="kbd-hint" x-text="entry.key"></sup>
    </button>
  </template>
</div>
```

MARKUP ÁREA RESPUESTA ACTUAL (index.html, wb-answer: session ~L454-466, cancion ~L668-680):
```
<template x-for="(word, idx) in wordButtonsAnswer" :key="word + '_' + idx">
  <button type="button" @click="wordButtonsRemoveWord(idx)" ...>
```
El `idx` del x-for en el área de respuesta ES el answerPos (único dentro del array de respuesta). `:key="word + '_' + idx"` NO es robusto con palabras repetidas → cambiar a `:key="idx"`.

CSS ACTUAL (styles.css): `.wb-bank` L182, `.wb-answer` L192. Botones del banco = `<button>` con padding Pico por defecto.

FACTORY DE TEST (instanciable sin Alpine): `import { appShell } from '../src/screens/app.js'; const app = appShell(Promise.resolve());` — devuelve el objeto plano; getters y handlers se ejercitan directamente (ver tests/screen-canciones.test.js L271-319).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Refactor del modelo del banco a índices (app.js) — banco estable, wordButtonsAnswer derivado</name>
  <files>src/screens/app.js</files>
  <behavior>
    - wordButtonsAnswer (getter) con bank=['io','muoio','io'] y placedIdx=[0,1,2] → ['io','muoio','io'] (duplicados por índice OK).
    - wordButtonsAddWord(slotIdx) con slot no colocado y sessionFeedback null → placedIdx.push(slotIdx); el banco NO se muta (length constante).
    - wordButtonsAddWord sobre un slot YA colocado → no-op (no duplica).
    - wordButtonsAddWord con sessionFeedback !== null → no-op.
    - wordButtonsRemoveWord(answerPos) → splice(answerPos,1) de placedIdx; el slot vuelve a estar disponible en su posición original.
    - bankWithKeys devuelve UNA entrada por CADA slot: {word, idx, placed, key}; placed = placedIdx.includes(idx); key = numeración dinámica sobre VISIBLES (salta colocadas), String(n) si n<=9 si no ''.
    - bankWithKeys.length == wordButtonsBank.length siempre (incluso con palabras colocadas).
    - guard anti-TypeError: sin sessionCurrentExercise ni songCurrentPhrase → [].
    - teclado dígito N → slotIdx de la N-ésima entrada VISIBLE (no-colocada) vía visibleSlotIdx(N-1); fuera de rango → no-op. Las ramas word-buttons de handleSessionKey/handleSongKey NO usan wordButtonsBank.length.
  </behavior>
  <action>
Implementa el modelo nuevo del CONTEXT.md (diseño LOCKED, no reinterpretar):

1. ESTADO (L214-218): mantener `wordButtonsBank: []` (lista barajada, ESTABLE tras init). Añadir nuevo estado `wordButtonsPlacedIdx: []` (array de ÍNDICES del banco en orden de click = secuencia de respuesta, NUEVA fuente de verdad). ELIMINAR la propiedad de estado `wordButtonsAnswer: []` de L218 (pasa a getter).

2. GETTER derivado `wordButtonsAnswer`: añadir junto a los otros getters (p.ej. cerca de `wordButtonsCanCheck` L2696): `get wordButtonsAnswer() { return this.wordButtonsPlacedIdx.map(i => this.wordButtonsBank[i]); }`. Esto satisface a TODOS los lectores enumerados en `<interfaces>` (length, x-for, spread-clone) sin tocarlos. Verifica que ningún sitio ASIGNA a `wordButtonsAnswer` salvo los reseteos (que se migran abajo) y los dos handlers (que se reescriben).

3. `wordButtonsAddWord(slotIdx)` (L1813-1819): reescribir a índices. Guard `if (this.sessionFeedback !== null) return;`. Guard rango `if (slotIdx < 0 || slotIdx >= this.wordButtonsBank.length) return;`. Guard "ya colocado" `if (this.wordButtonsPlacedIdx.includes(slotIdx)) return;`. Acción: `this.wordButtonsPlacedIdx = [...this.wordButtonsPlacedIdx, slotIdx];` (array nuevo por reactividad). ELIMINAR el `.filter` del banco (L1817).

4. `wordButtonsRemoveWord(answerPos)` (L1829-1835): reescribir a índices. Guard feedback. Guard rango contra `this.wordButtonsPlacedIdx.length`. Acción: `this.wordButtonsPlacedIdx = this.wordButtonsPlacedIdx.filter((_, i) => i !== answerPos);` (array nuevo). ELIMINAR el push al banco (L1834). El slot vuelve a su posición visual original porque el banco es estable.

5. `bankWithKeys` getter (L2676-2687): mantener el guard `if (!this.sessionCurrentExercise && !this.songCurrentPhrase) return [];`. Devolver UNA entrada por cada slot, con key dinámico que salta las colocadas. Implementa un contador de visibles: recorre `this.wordButtonsBank` con su `idx`; `placed = this.wordButtonsPlacedIdx.includes(idx)`; si NO placed incrementa un contador `n` de visibles y asigna `key = n <= 9 ? String(n) : ''`; si placed → `key = ''`. Devuelve `{ word, idx, placed, key }` por slot. (Preserva D-69: 1 = primera visible, renumera al colocar; el botón NO se mueve, solo cambia su superíndice.)

6. MAPEO TECLADO — N-ésima VISIBLE → slotIdx (Claude's Discretion: helper). Añade un helper, p.ej. `visibleSlotIdx(n)` que devuelve el slotIdx de la N-ésima entrada visible (no-colocada) o -1 si no existe — implementable como `const visibles = this.bankWithKeys.filter(e => !e.placed); return n < visibles.length ? visibles[n].idx : -1;`. Actualiza las DOS ramas word-buttons (ELIMINANDO el guard viejo `idx < this.wordButtonsBank.length`):
   - handleSessionKey rama word-buttons (L2279-2284): `const slot = this.visibleSlotIdx(idx); if (idx < 9 && slot !== -1) this.wordButtonsAddWord(slot);` (idx = parseInt(key,10)-1, ya calculado en L2260).
   - handleSongKey dígitos (L744-747): mismo patrón — `const idx = Number(key)-1; const slot = this.visibleSlotIdx(idx); if (idx < 9 && slot !== -1) this.wordButtonsAddWord(slot);`.
   CRÍTICO: tras editar, NINGUNA de estas dos ramas debe contener `wordButtonsBank.length` (queda obsoleto y colocaría el slot equivocado con huecos). Backspace en ambos handlers (L736-737, L2250-2252) NO cambia: sigue usando `wordButtonsAnswer.length` (getter) y `wordButtonsRemoveWord(last)` por answerPos.

7. RESETS / INIT — TODOS los `this.wordButtonsAnswer = []` pasan a `this.wordButtonsPlacedIdx = []` (porque wordButtonsAnswer es getter, asignarle lanzaría). Sitios EXACTOS verificados por grep: L531, L639, L819, L1087, L2084, L2114. Los `this.wordButtonsBank = []` (L530,638,818,1086,2083) y `this.wordButtonsBank = fisherYates(all)` (L2113) SE MANTIENEN. En `initSubStateForExercise` la limpieza universal pone `wordButtonsBank=[]` y `wordButtonsPlacedIdx=[]`; en la rama word-buttons se puebla el banco con fisherYates y se deja `wordButtonsPlacedIdx=[]`.

NO toques: grading (registry[...].grade), applyResultToSession, el estado persistido, schemaVersion, ni la lógica de match/multi-choice.
  </action>
  <verify>
    <automated>node --test tests/exercise-types.test.js tests/screen-canciones.test.js tests/domain.test.js 2>&1 | grep -E "^# (tests|pass|fail)|not ok"</automated>
  </verify>
  <done>wordButtonsPlacedIdx es la fuente de verdad; wordButtonsAnswer es getter derivado; add/remove operan por índice sin mutar el banco; bankWithKeys devuelve {word,idx,placed,key} por slot; teclado mapea N→slot visible. Gates de grep (todos deben cumplirse):
- `grep -n "this.wordButtonsAnswer = " src/screens/app.js` → 0 asignaciones (solo getter y lecturas).
- `grep -c "wordButtonsPlacedIdx = \[\]" src/screens/app.js` → 6 (los 6 resets/init migrados).
- En las ramas word-buttons de handleSessionKey y handleSongKey NO queda `wordButtonsBank.length`: inspecciona ambas ramas dígito (alrededor de L744-747 y L2279-2284) y confirma que usan `this.visibleSlotIdx(idx)`, NO `idx < this.wordButtonsBank.length`. (El `wordButtonsBank.length` solo es admisible en los guards de rango de wordButtonsAddWord, no en los handlers de teclado.)
Suite sin fallos nuevos (incluye screen-canciones, donde bankWithKeys cambia de shape).</done>
</task>

<task type="auto">
  <name>Task 2: Render del banco con placeholders invisibles (index.html + styles.css)</name>
  <files>index.html, styles.css</files>
  <action>
Actualiza los DOS bloques de banco word-buttons (idénticos): session (~L442-451) y cancion (~L656-664). En cada `<template x-for>`:

1. `:key` estable por slot: cambiar `:key="entry.word + '_' + idx"` → `:key="entry.idx"` (key estable por slot → Alpine no recrea DOM, layout estable). Mantén la firma `x-for="(entry, idx) in bankWithKeys"` (el `idx` del loop ya no se usa para el click).

2. `@click`: cambiar `@click="wordButtonsAddWord(idx)"` → `@click="wordButtonsAddWord(entry.idx)"` (pasa el slotIdx, NO el loop idx). CRÍTICO: en el modelo nuevo el loop idx ya NO coincide con el slot porque el banco no se filtra.

3. Estado placeholder cuando `entry.placed`: el botón se convierte en placeholder invisible que mantiene el hueco. Añade:
   - `:class="{ 'wb-placed': entry.placed }"`.
   - `:disabled="sessionFeedback !== null || entry.placed"` (no clickable cuando colocado).
   - `:tabindex="entry.placed ? -1 : 0"` y `:aria-hidden="entry.placed"` (no focusable / oculto a lectores cuando colocado).
   - MANTÉN el mismo contenido interno (`<span x-text="entry.word">` + `<sup class="kbd-hint" x-text="entry.key">`) para conservar el tamaño exacto de la caja (el placeholder usa el MISMO elemento `<button>`, Claude's Discretion confirmada en CONTEXT).

4. ÁREA DE RESPUESTA — `:key` robusto con repetidas: en los DOS bloques `wb-answer` (session ~L460 y cancion ~L674), el `<template x-for="(word, idx) in wordButtonsAnswer">` usa hoy `:key="word + '_' + idx"`. Con palabras repetidas ese key NO es único de forma robusta y Alpine puede reciclar nodos mal. Cambiar `:key="word + '_' + idx"` → `:key="idx"` (el idx del x-for en el área de respuesta ES el answerPos, único dentro del array). NO cambies nada más del área de respuesta: sigue leyendo el getter `wordButtonsAnswer` y `wordButtonsRemoveWord(idx)` por answerPos.

5. styles.css — añade tras `.wb-bank` (L182) o en el bloque word-buttons: `.wb-placed { visibility: hidden; }`. NO uses `display:none` (colapsaría el hueco y provocaría reflow — el bug que arreglamos). El botón conserva su tamaño porque mantiene el mismo padding/contenido, solo se vuelve invisible.

Verifica que AMBOS bancos (session + cancion) quedan idénticos en estructura (mismo patrón placeholder), y que AMBAS áreas de respuesta usan `:key="idx"`.
  </action>
  <verify>
    <automated>test "$(grep -c 'wordButtonsAddWord(entry.idx)' index.html)" = 2 && test "$(grep -c ':key="idx"' index.html)" -ge 2 && grep -q 'wb-placed' styles.css && grep -q 'visibility: hidden' styles.css && echo OK</automated>
  </verify>
  <done>Ambos bancos usan `:key="entry.idx"` y `@click="wordButtonsAddWord(entry.idx)"`; los botones con `entry.placed` reciben clase `wb-placed`, `disabled`, `tabindex=-1`, `aria-hidden`; AMBAS áreas de respuesta (wb-answer session ~L460 y cancion ~L674) usan `:key="idx"` (no `word + '_' + idx`); `.wb-placed { visibility: hidden; }` existe en styles.css; el resto del área respuesta intacta.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Tests — actualizar al nuevo modelo + añadir cobertura de huecos estables y teclado</name>
  <files>tests/screen-canciones.test.js, tests/exercise-types.test.js</files>
  <behavior>
    - bankWithKeys.length constante: con 3 palabras y 1 colocada, sigue devolviendo 3 entradas.
    - slot colocado marcado placed=true; los demás placed=false.
    - quitar (removeWord) restaura el slot: tras add(1) y removeWord(0), el slot 1 vuelve a placed=false y respuesta vacía.
    - respuesta derivada con duplicados: bank=['io','muoio','io'], add(0)+add(2) → wordButtonsAnswer == ['io','io'].
    - teclado dígito → visible (vía handler): con un slot YA colocado, pulsar dígito coloca el slot VISIBLE correcto (no el slot N crudo) — verifica el mapeo visibleSlotIdx desde el handler real.
    - key dinámico: tras colocar la 1ª visible, la que era 2ª pasa a key '1' pero su entry.idx (slot) no cambia.
  </behavior>
  <action>
Actualiza los tests existentes que referencian el modelo viejo y AÑADE cobertura del modelo nuevo. Usa el factory `appShell(Promise.resolve())` (instanciable sin Alpine, ya usado en screen-canciones.test.js L271-319). Setea `wordButtonsBank` y `wordButtonsPlacedIdx` directamente sobre el objeto.

1. tests/screen-canciones.test.js (L271-319, describe "bankWithKeys pinta el banco en modo canción"):
   - El test "NO está vacío" (L291-300): ahora `bankWithKeys` devuelve objetos `{word,idx,placed,key}`. Mantén la aserción de `.length === 3` y `.map(e => e.word)`. AÑADE: todos `placed === false` cuando `wordButtonsPlacedIdx` está vacío.
   - El test "numera teclas 1..9" (L302-307): sigue válido con banco de 10 y nada colocado (key '1'..'9' y '' en el 10º). Verifica que sigue pasando con la numeración dinámica sobre visibles.
   - El test "[] sin frase activa" (L309-318): sin cambios.

2. AÑADE un nuevo describe (en screen-canciones.test.js o exercise-types.test.js, según afinidad — exercise-types es donde viven los smoke de handlers) con tests del modelo de huecos estables. Para cada test instancia `appShell(Promise.resolve())`, monta el contexto mínimo de canción (como songApp L272-289) o de session, setea `app.wordButtonsBank` y `app.wordButtonsPlacedIdx = []`, `app.sessionFeedback = null`:
   - "colocar mantiene el nº de slots constante": tras `app.wordButtonsAddWord(1)`, `app.bankWithKeys.length` == longitud del banco (sin encoger).
   - "slot colocado marcado placed": tras add(1), `app.bankWithKeys[1].placed === true` y el resto `false`.
   - "quitar restaura el slot a su posición": add(1) luego removeWord(0) → `app.bankWithKeys[1].placed === false` y `app.wordButtonsAnswer.length === 0`.
   - "respuesta derivada correcta con duplicados": bank `['io','muoio','io']`, add(0)+add(2) → `assert.deepEqual(app.wordButtonsAnswer, ['io','io'])`.
   - "key dinámico tras colocar": con bank de 3 y placedIdx=[0] (1ª visible colocada), `app.bankWithKeys[1].key === '1'` y `app.bankWithKeys[1].idx === 1` (el slot no cambia, solo el superíndice).

3. AÑADE cobertura del PATH DE TECLADO con slots colocados (BLOQUEANTE checker — ejercita el handler real, no solo visibleSlotIdx):
   - "teclado dígito coloca slot visible con un hueco previo (session)": monta el contexto session word-buttons mínimo (sessionCurrentExercise set, sessionFeedback=null), bank de 3, coloca primero el slot 0 (`app.wordButtonsAddWord(0)`), luego invoca el handler de teclado real `app.handleSessionKey(...)` con el dígito '1' (el evento/firma tal como el handler la espera — replica la forma usada en los smoke existentes de handleSessionKey en exercise-types.test.js). Asegura que coloca el slot VISIBLE (slot 1), NO el slot 0 de nuevo ni un slot crudo: tras la pulsación `app.wordButtonsAnswer` debe ser `[bank[0], bank[1]]` (en ese orden). Esto cubre que la rama usa `visibleSlotIdx` y no `wordButtonsBank.length`.
   - Si el contexto de canción es viable con el factory (songApp ya montado en screen-canciones.test.js), AÑADE el equivalente para `handleSongKey` con dígito y un slot colocado, verificando el mismo mapeo. Si montar el handler de canción no es viable sin Alpine, deja el de session (que cubre la lógica compartida visibleSlotIdx) y anótalo en el SUMMARY.

4. Verifica que NO quedan referencias al modelo viejo que asignen `wordButtonsAnswer` como propiedad en los tests (es getter; si algún test lo seteaba, cámbialo a `wordButtonsPlacedIdx`). `tests/domain.test.js` L472-484 NO toca el estado del screen (es un mock de array literal) → no cambia.

Corre `node --test tests/*.test.js`. Recuerda: 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) NO se toca; no introducir fallos nuevos.
  </action>
  <verify>
    <automated>node --test tests/*.test.js 2>&1 | grep -E "^# (tests|pass|fail)|not ok"</automated>
  </verify>
  <done>Tests existentes de bankWithKeys actualizados al shape {word,idx,placed,key}; añadidos tests de huecos estables (slots constantes, placed, restaurar, duplicados, key dinámico) Y un test que ejercita el HANDLER de teclado (handleSessionKey, y handleSongKey si viable) con un slot ya colocado verificando que coloca el slot VISIBLE correcto (mapeo visibleSlotIdx); `node --test tests/*.test.js` → solo el 1 fallo preexistente ajeno (genero-numero 12→13), 0 fallos nuevos (la salida del grep muestra `not ok` solo para ese fallo).</done>
</task>

</tasks>

<verification>
- `grep -n "this.wordButtonsAnswer = " src/screens/app.js` → 0 asignaciones (wordButtonsAnswer es getter).
- `grep -c "wordButtonsPlacedIdx = \[\]" src/screens/app.js` → 6 (resets/init migrados; el grep cuenta también init).
- Ramas word-buttons de handleSessionKey/handleSongKey NO contienen `wordButtonsBank.length` (usan `visibleSlotIdx`).
- `grep -c 'wordButtonsAddWord(entry.idx)' index.html` → 2 (session + cancion).
- AMBAS áreas wb-answer usan `:key="idx"` (no `word + '_' + idx`).
- `grep -q '.wb-placed' styles.css && grep -q 'visibility: hidden' styles.css`.
- `node --test tests/*.test.js 2>&1 | grep -E "^# (tests|pass|fail)|not ok"` → solo 1 `not ok` preexistente ajeno (genero-numero 12→13).
</verification>

<success_criteria>
- Al colocar una palabra, el banco NO encoge (placeholder invisible con visibility:hidden mantiene el hueco); las demás palabras no se mueven.
- Quitar una palabra restaura su slot a la posición visual original (banco estable).
- Palabras repetidas se manejan por índice (respuesta derivada correcta) y el área de respuesta usa `:key="idx"`.
- Teclado: dígito N → N-ésima visible (vía visibleSlotIdx, sin wordButtonsBank.length); Backspace → última colocada. Cubierto por test de handler con hueco previo.
- Canciones funcionan idénticas con el nuevo modelo.
- Grading y estado persistido sin cambios.
- Suite verde salvo el fallo preexistente ajeno; sin fallos nuevos.
</success_criteria>

<output>
Create `.planning/quick/260615-str-word-buttons-huecos-estables-al-seleccio/260615-str-SUMMARY.md` when done
</output>
