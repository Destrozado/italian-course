# Quick Task 260615-str: Word-buttons huecos estables (sin reflow) - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

En los ejercicios word-buttons (seleccionar palabras para formar la frase), al pulsar una palabra del banco hoy se ELIMINA del array → el banco encoge y `flex-wrap` recoloca todo (las palabras saltan de fila y el contenido de abajo se mueve), causando mis-clicks. Objetivo: que el hueco de la palabra colocada **se mantenga ocupado** (placeholder invisible del mismo tamaño) para que las posiciones de las demás NO cambien.

Aplica a la pantalla `session` (ejercicios word-buttons) Y a `cancion` (las canciones usan el MISMO word-buttons inverso, mismo código). UI/interacción + refactor del modelo de estado del banco. NO toca estado persistido (localStorage), NO toca el grading (solo cómo se deriva la respuesta).
</domain>

<decisions>
## Implementation Decisions (diseño LOCKED)

### Modelo nuevo (índices, banco estable)
- `wordButtonsBank`: lista barajada de palabras (`answer ∪ distractors`, `fisherYates`), **ESTABLE** durante el ejercicio — se fija en `initSubStateForExercise` y NO se vuelve a mutar (hoy se hace `.filter` en add/remove; eso desaparece).
- Nuevo estado `wordButtonsPlacedIdx`: array de ÍNDICES del banco, en orden de click = la secuencia de respuesta. Es la NUEVA fuente de verdad de la respuesta.
- `wordButtonsAnswer`: pasa de ser propiedad de estado a **getter derivado**: `this.wordButtonsPlacedIdx.map(i => this.wordButtonsBank[i])`. Así todos los lectores actuales siguen funcionando sin cambios:
  - grading: `grade(phrase, { tokens: this.wordButtonsAnswer })`.
  - `applyResultToSession(phrase, correct, [...this.wordButtonsAnswer])`.
  - markup del área respuesta (`x-for word in wordButtonsAnswer`), check de vacío (`wordButtonsAnswer.length === 0`).
- Usar índices (no valores) maneja correctamente **palabras repetidas** (p.ej. "io muoio, io muoio").

### Handlers
- `wordButtonsAddWord(slotIdx)`: si el slot NO está colocado y `sessionFeedback === null` → `wordButtonsPlacedIdx.push(slotIdx)`. (ya NO filtra el banco.)
- `wordButtonsRemoveWord(answerPos)`: `wordButtonsPlacedIdx.splice(answerPos, 1)` → libera ese slot, que vuelve a su **posición visual original** (el banco es estable). (ya NO hace push al final del banco.)
- Teclado (`handleSessionKey`): dígito N → colocar la N-ésima palabra VISIBLE (no-colocada); Backspace → quitar la última colocada (`pop`/`splice` last). Mapear N → el slotIdx de la N-ésima entrada visible (usar el `key` de `bankWithKeys`).

### bankWithKeys (getter) — render con huecos
- Devuelve UNA entrada por CADA slot del banco (incluidos los colocados), con: `{ word, idx, placed, key }`.
  - `placed = wordButtonsPlacedIdx.includes(idx)`.
  - `key`: numeración DINÁMICA sobre las palabras VISIBLES en orden de slot (contador que salta las colocadas), `String(n)` si n ≤ 9, si no `''`. (preserva D-69: 1 = primera visible, renumera al colocar — PERO el botón NO se mueve, solo cambia su superíndice.)
- Mantener el guard anti-TypeError actual (`if (!sessionCurrentExercise && !songCurrentPhrase) return []`).

### Markup (index.html, bloque word-buttons del banco ~L442-451; canción tiene su propio banco análogo — verificar)
- `x-for="(entry, idx) in bankWithKeys" :key="entry.idx"` (key estable por slot → Alpine no recrea DOM, layout estable).
- Cada botón del banco:
  - `@click="wordButtonsAddWord(entry.idx)"`.
  - cuando `entry.placed` → render como **placeholder invisible que mantiene el hueco**: clase tipo `.wb-placed` con `visibility: hidden` (NO `display:none`, que colapsaría el hueco), `aria-hidden`, no clickable/no focusable (`disabled` + `tabindex=-1`), mismo contenido para conservar tamaño.
  - cuando visible → como ahora (palabra + sufijo `entry.key`).
- El área de respuesta (`wb-answer`) sigue igual (lee el getter `wordButtonsAnswer`).

### CSS (styles.css)
- `.wb-placed { visibility: hidden; }` (mantiene la caja → las demás no se mueven). Verificar que el botón placeholder conserva el mismo tamaño que tendría visible (mismo padding/contenido).

### Reset / init (sincronizar el nuevo estado)
- TODOS los sitios que hoy hacen `this.wordButtonsAnswer = []` deben pasar a `this.wordButtonsPlacedIdx = []` (y eliminar la asignación a `wordButtonsAnswer` porque será getter). Sitios conocidos (verificar todos): `initSubStateForExercise`, `_launchExamen`, `startSong`, `restartRepaso`, `resetSession`, y cualquier otro reset. `wordButtonsBank` se sigue poblando con `fisherYates(all)` en `initSubStateForExercise`.

### Claude's Discretion
- Nombre exacto del estado (`wordButtonsPlacedIdx` sugerido) y de la clase CSS (`.wb-placed`).
- Si conviene un método helper para "N-ésima visible → slotIdx" en el teclado.
- Si el placeholder usa el mismo `<button disabled>` con visibility:hidden, o un `<span>` espaciador equivalente (preferible mantener el mismo elemento para igualdad de tamaño exacta).
</decisions>

<specifics>
## Specific Ideas

- `src/screens/app.js`:
  - estado: `wordButtonsBank` (216), `wordButtonsAnswer` (218 → getter), NUEVO `wordButtonsPlacedIdx`.
  - `wordButtonsAddWord` (~1813), `wordButtonsRemoveWord` (~1829) — reescribir a índices.
  - `bankWithKeys` getter (~2676) — devolver placed + key dinámico por visibles.
  - `handleSessionKey` (~736-747) — dígito N → N-ésima visible; Backspace → última colocada.
  - grading word-buttons (~681-682) — sin cambios (lee getter).
  - resets: 65, 95(531), 638-639, 818-819, 1086-1087, 2083 — `wordButtonsPlacedIdx = []`.
- index.html: banco word-buttons (~L442-451) + el banco de la pantalla `cancion` (buscar, ~L650-660) — mismo patrón placeholder.
- styles.css: `.wb-bank` (~182), añadir `.wb-placed`.
- Tests: `tests/screen-canciones.test.js` (L287/299 usa wordButtonsBank/bankWithKeys), `tests/domain.test.js` (L473 mock de wordButtonsAnswer), `tests/exercise-types.test.js`. Actualizar a nuevo modelo + AÑADIR: colocar mantiene `bankWithKeys.length` constante (slots estables); slot colocado marcado `placed`; quitar restaura el slot a su posición; respuesta derivada correcta con duplicados; teclado dígito mapea a visible. Correr `node --test tests/*.test.js` (glob Node 22.20). 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) — NO tocar; no introducir fallos nuevos.
</specifics>

<canonical_refs>
## Canonical References

UAT 2026-06-15. Mejora de UX sobre word-buttons (D-56/D-57/D-58/D-69), aplicada también a canciones (Phase 13, word-buttons inverso). Sin specs externas.
</canonical_refs>
