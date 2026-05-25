---
phase: quick-260525-pwq
plan: 01
subsystem: screen / multi-choice UX
tags:
  - quick-task
  - bug-fix
  - shuffle
  - core-value-enforcement
  - parallel-to-D-57-D-62
requires: []
provides:
  - "Sub-estado multiChoiceOrder (permutación visual) en appShell"
  - "Indirección payload.options[perm] en template multi-choice"
  - "Remap keydown 1..9 multi-choice → multiChoiceOrder[idx]"
affects:
  - "Distribución visual de correctIndex en TODAS las sesiones con ejercicios multi-choice"
  - "Atajos de teclado 1..9 en sesión multi-choice (semántica = posición VISUAL, no índice JSON)"
tech-stack:
  added: []
  patterns:
    - "Fisher-Yates sub-state shuffle por carga (paralelo arquitectónico con D-57 word-buttons + D-62 match)"
    - "Indirección JSON-canónico ↔ visual sin tocar handlers de grading (cero diff en exercise-types)"
key-files:
  created:
    - "tests/screen-multi-choice-shuffle.test.js"
  modified:
    - "src/screens/app.js (líneas ~115 declaración multiChoiceOrder, ~1395 limpieza universal, ~1422 init rama multi-choice, ~1530 remap keydown)"
    - "index.html (líneas 259-296 template multi-choice con indirección)"
decisions:
  - "D-181 (propuesta): sub-estado multiChoiceOrder con Math.random intencional, paralelo D-57/D-62"
metrics:
  duration: "~25 min"
  completed_at: "2026-05-25T16:47:33Z"
  tests: "199 baseline → 202 (3 nuevos sub-tests shuffle invariants)"
  commits: "1 atómico (esperado)"
---

# Phase quick-260525-pwq Plan 01: Fix shuffle de options en multi-choice — Summary

## One-liner

Shuffle visual de opciones multi-choice via sub-estado `multiChoiceOrder` (permutación de índices) inicializado por carga vía `fisherYates`, manteniendo el JSON inmutable (D-132) y cero diff en `src/exercise-types/multiple-choice.js` — neutraliza el sesgo de `correctIndex` (pos 1 = 41%, pos 3 = 9% en el corpus actual) y el caso flagrante avere-302..305 (4 ejercicios con MISMAS options + correctIndex=2 → ya no entrena "tercera columna").

## Why

El template HTML iteraba `payload.options` directo (index.html:262), exponiendo al alumno a la distribución sesgada de `correctIndex` del corpus. Esto violaba el **core value** del proyecto declarado en `PROJECT.md` y `CLAUDE.md` — *"que el sistema te obligue a no olvidar"*. Sin shuffle, el alumno aprende posiciones (clavadísimo en avere-302..305 con la respuesta SIEMPRE en la 3ª columna) en lugar de re-verificar contenido. Cinco minutos de sesión bastan para que el patrón se cuele.

## What changed

### Files modified

| Archivo | Cambios |
|---------|---------|
| `src/screens/app.js` | +52 LOC: declaración `multiChoiceOrder: []` (~línea 115), limpieza universal en `initSubStateForExercise` (~línea 1395), nueva rama `else if (exercise.type === 'multiple-choice')` con `fisherYates(Array.from({length:n}, (_,i)=>i))` (~línea 1422), remap keydown 1..9 con `this.multiChoiceOrder[idx]` (~línea 1530) |
| `index.html` | +13 LOC neto: template multi-choice (líneas 259-296) ahora itera `multiChoiceOrder`; `x-text` resuelve `payload.options[perm]`; `@click="sessionSelectOption(perm)"`; clases `correcta`/`incorrecta` comparan `perm === correctIndex` y `perm === sessionSelectedIndex` |
| `tests/screen-multi-choice-shuffle.test.js` | +106 LOC (NEW): 3 sub-tests sobre invariantes del shuffle |

### Tests delta

- **199 baseline → 202** (3 nuevos verdes, 100% pass rate sostenido).
- Sub-tests añadidos:
  1. **Permutation validity** — Para N ∈ {2,3,4,5}, `fisherYates([0..N-1], seededLcg(100+N))` produce array de longitud N cuyo `sort()` equals `[0..N-1]` (ningún índice se pierde ni se duplica).
  2. **Correctness preservation (caso avere-302..305)** — Con `options = ['ho','hai','ha','hanno']` y `correctIndex = 2`, tras `fisherYates([0,1,2,3], seededLcg(7))`: `perm.includes(2)` es true y `options[perm[perm.indexOf(2)]] === 'ha'`.
  3. **Determinismo con seededLcg** — Dos llamadas independientes con `seededLcg(42)` producen arrays `deepStrictEqual` idénticos; además verifica que la permutación NO es la identidad (sanity check anti-tautología).

## Cómo se resolvió el caso flagrante

Antes del fix: 4 ejercicios consecutivos (avere-302..305) con MISMAS 4 opciones (`ho/hai/ha/hanno`) y `correctIndex=2` en todos → la respuesta correcta siempre era la 3ª columna. El alumno aprendía la posición, no la regla.

Después del fix: `multiChoiceOrder` se inicializa con `fisherYates([0,1,2,3])` (Math.random) en CADA carga de ejercicio. Las 4 opciones se renderizan en orden distinto entre los 4 ejercicios consecutivos y entre cargas de página. La opción correcta sigue siendo `'ha'` (el texto desde el JSON inmutable), pero su posición visual varía. El alumno tiene que LEER las 4 opciones para encontrar `ha`.

Para el corpus global (pos 1 = 41% correctIndex, pos 3 = 9%), el sesgo sigue existiendo en el JSON pero el shuffle visual lo neutraliza completamente — la distribución que ve el alumno es uniforme por construcción del Fisher-Yates.

## Invariantes preservadas (verificadas)

| Invariante | Verificación | Resultado |
|------------|--------------|-----------|
| **D-132 JSON inmutable** | `git diff --stat content/exercises/` | `0` líneas |
| **D-171 schema validator sin tocar** | `git diff --stat src/data/schema-validator.js` | `0` líneas |
| **D-172 styles.css sin tocar** | `git diff --stat styles.css` | `0` líneas |
| **`src/exercise-types/multiple-choice.js` cero diff** | `git diff --stat src/exercise-types/multiple-choice.js` | `0` líneas |
| **`multipleChoice.grade` opera sobre correctIndex canónico** | El `@click` pasa `perm` (índice ORIGINAL); el keydown traduce `idx` visual → `multiChoiceOrder[idx]` ORIGINAL | grade ve siempre el índice del JSON, comportamiento inalterado |
| **`sessionResults` guarda el texto correcto de la opción clickada** | `applyResultToSession(ex, correct, ex.payload.options[idx])` — `idx` es el ORIGINAL en este punto del flow | summary "Errores cometidos" sigue mostrando texto correcto |

## Architectural decision (propuesta D-181)

Nueva decisión propuesta para STATE.md "Key Decisions":

> **D-181 (2026-05-25)** — Sub-estado `multiChoiceOrder` (permutación visual de `payload.options` multi-choice) con `Math.random` intencional. Paralelo arquitectónico exacto con `wordButtonsBank` (D-57) y `matchLeft`/`matchRight` (D-62): el orden visual non-deterministic por carga es el invariante que el core value del proyecto requiere ("que el sistema te obligue a no olvidar" — el alumno re-verifica contenido, no posición). El JSON sigue siendo la fuente canónica inmutable; el sub-estado lo reordena visualmente sin tocar `grade`. Razón: pre-fix, el corpus tenía distribución sesgada de `correctIndex` (pos 1 = 41%, pos 3 = 9%) y un caso flagrante (avere-302..305) que convertía 4 ejercicios consecutivos en entrenamiento de "tercera columna".

Razón para anclar: cuando el autor añada un 4º tipo de ejercicio con opciones renderizadas en orden fijo desde el JSON, esta decisión recuerda que el patrón normativo del proyecto es **shuffle visual por sub-estado** salvo justificación pedagógica explícita.

## Decisiones secundarias

- **`:key="perm"` en el `x-for`** (no `:key="idx"`): el índice ORIGINAL del JSON es estable entre re-renders del mismo ejercicio. Si se cambiara a `:key="idx"` (posición visual), un re-render parcial (ej. tras feedback) podría hacer que Alpine reusara el `<button>` DOM pero cambiara su texto — bug sutil. `perm` garantiza identidad entre DOM y opción.
- **Longitud-guard del keydown usa `multiChoiceOrder.length`** (en lugar de `payload.options.length`): son iguales por construcción, pero leer de la fuente que el click usa hace el invariante explícito y aísla de futuros refactors.
- **Math.random (no seedable)**: Cuando el día futuro lleguemos a tests integration-level del screen layer, los tests podrán reproducir orden visual exacto haciendo monkey-patch de `Math.random` o inyectando el helper de seed — pero la producción usa entropía real por carga. Trade-off correcto v1.

## UAT manual recomendado (autor)

Ejecutar con `npx serve` y abrir la app. Verificar los 5 escenarios:

1. **Orden cambia entre cargas**: empezar sesión `avere` con tamaño ≥6 (Repaso 20 cubre). Identificar un multi-choice (los `avere-302..305` ideales). Refrescar la página (F5, conserva localStorage), volver a entrar a Repaso con las mismas categorías. Verificar que el orden de las opciones difiere entre cargas.
2. **Avere-302..305 ya no fija la correcta en pos 3**: ejecutar Test completo de `avere` (incluye los 6 cruces multi-cat). En los 4 ejercicios con `correctIndex=2` y options `ho/hai/ha/hanno`, observar que `ha` aparece en posiciones distintas entre los 4 (no siempre 3ª).
3. **Feedback rojo correcto**: hacer click en una opción INCORRECTA en cualquier multi-choice. Verificar:
   - La opción clickada se marca roja (`.incorrecta`).
   - La opción CORRECTA se marca verde (`.correcta`) — y es la correcta semánticamente (no la 3ª siempre).
   - El párrafo "Respuesta correcta: **X**" muestra el TEXTO correcto.
   - Si el ejercicio tiene `explanation`, aparece.
   - Click en "Siguiente" avanza.
4. **Tecla 1..9 selecciona VISUAL**: en cualquier multi-choice (sin feedback aún), pulsar la tecla `3`. Verificar que selecciona la 3ª opción visual (no siempre `correctIndex=2`). En avere-302..305: pulsar `3` debería marcar incorrecta la mayor parte del tiempo (sólo acertaría si el shuffle dejó casualmente `ha` en pos 3).
5. **Summary post-sesión**: terminar una sesión con al menos un fallo en multi-choice. En la pantalla resumen, sección "Errores cometidos", verificar que tu respuesta y "Respuesta correcta" muestran textos correctos (no índices, no la 3ª opción visual genérica).

## Self-Check: PASSED

- `tests/screen-multi-choice-shuffle.test.js` existe.
- `.planning/quick/260525-pwq-fix-shuffle-de-options-en-multiple-choic/260525-pwq-SUMMARY.md` existe.
- `multiChoiceOrder` referenciado en `src/screens/app.js` (9 matches) y en `index.html` (2 matches).
- `node --test tests/*.test.js`: **# tests 202 / # pass 202 / # fail 0**.
- Layer-purity diff cero en `src/exercise-types/multiple-choice.js`, `content/exercises/`, `src/data/schema-validator.js`, `styles.css`.
- Commit hash registrado tras commit atómico (sección bajo).

## Commit landed

- **Hash:** `c74281a`
- **Message:** `feat(quick-260525-pwq): shuffle multi-choice options via sub-state multiChoiceOrder (D-181)`
- **Stat:** 3 files changed, 176 insertions(+), 7 deletions(-) (las "7 deletions" son las 7 líneas viejas del template multi-choice reemplazadas — cero deletions de archivos tracked vía `git diff --diff-filter=D HEAD~1 HEAD`).

