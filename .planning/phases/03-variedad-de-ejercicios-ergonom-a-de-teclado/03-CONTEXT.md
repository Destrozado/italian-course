# Phase 3: Variedad de ejercicios + ergonomía de teclado - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 entrega **los dos tipos de ejercicio restantes (`word-buttons` y `match`) y la ergonomía de teclado completa** para que una sesión de 20 corra sin tocar el ratón. Los dos tipos nuevos:

- Reusan TODA la mecánica de Phase 2 (cascada inmediata D-54, contadores monotónicos, racha, sampler multi-categoría, registry, `applyImmediateFailure`).
- Implementan `grade()` siguiendo el patrón existente del registry (`src/exercise-types/index.js`).
- Renderizan vía sub-templates Alpine dentro del `<template x-if="currentScreen === 'session'">` existente del `appShell`. NO se crea pantalla nueva — el `appShell` plano (D-25) se extiende con sub-estados por tipo.

Tras esta fase, la app es funcionalmente completa para uso diario; solo queda transcribir contenido real y backup (Phase 4).

**Requisitos cubiertos:** EXTYPE-02 (word-buttons), EXTYPE-03 (match), SESSION-06 (atajos 1-4/Enter/Space — literal para multiple-choice; extensión a word-buttons/match per goal "sin ratón").

**Fuera del scope (cubierto en otras fases):**
- BACK-04/05/06 export/import + recordatorio 7 días → Phase 4
- SEED-01/02 transcripción de los 6 PDFs reales → Phase 4
- Sub-categorías, editor UI, animaciones celebratorias, gamificación, dark mode toggle, multi-tab guard → v2 / polish

</domain>

<decisions>
## Implementation Decisions

### Word-buttons — UX

- **D-56:** **Modelo de selección "Mover al área de respuesta"**. Layout: un banco de palabras arriba (botones) + un área de respuesta debajo donde se acumulan las palabras seleccionadas en el orden pulsado. Click sobre una palabra del banco la MUEVE al área (desaparece del banco). Click sobre una palabra ya colocada la devuelve al banco. La frase construida es visualmente concatenable leyendo el área de respuesta de izquierda a derecha.
- **D-57:** **Distractoras opcionales en el JSON** (`payload.distractors[]`). Banco al iniciar = `shuffle(payload.answer ∪ (payload.distractors ?? []))`. El grading exige que la secuencia colocada sea exactamente `payload.answer` (comparación de array tras `toLowerCase()` y NFC — ver D-67).
- **D-58:** **Validación con botón "Comprobar"** (siempre visible bajo el área respuesta) que se DESHABILITA mientras el área esté vacía. Enter en teclado dispara el mismo handler (`wordButtonsCheck()`). NO hay auto-validación al alcanzar N palabras — el usuario decide cuándo. Coherente con el tono "re-verifica conscientemente" del proyecto.
- **D-59:** **Feedback al fallar = frase correcta literal** debajo del intento (el intento se queda tintado en rojo). Botón "Siguiente" aparece bajo la frase correcta, como en multiple-choice (SESSION-05). El usuario lee la respuesta correcta antes de avanzar.

### Match — UX

- **D-60:** **Validación instantánea por pareja**:
  - Tras emparejar (click izq → click der, o teclado equivalente), la pareja se evalúa al instante.
  - **Pareja correcta**: se queda fija en verde y los dos items se "apagan" (no clickeables, atenuados visualmente). NO se puede deshacer una pareja correcta.
  - **Pareja incorrecta**: parpadeo rojo breve, la pareja se deshace, ambos items vuelven al estado seleccionable.
  - **Cualquier intento erróneo en el ejercicio → ejercicio FALLADO** (incluso si después el usuario consigue completar todas las parejas correctamente). Flag boolean `matchHadFailure` por ejercicio.
- **D-61:** **Cascada D-54 inmediata en el PRIMER intento erróneo del ejercicio** (NO al final del ejercicio, NO al final de la sesión). El primer click incorrecto dispara `applyImmediateFailure(state, exercise, content, today)`, persiste a localStorage al instante, marca `matchHadFailure = true`. Intentos erróneos posteriores en el MISMO ejercicio son idempotentes (state.categoryProgress ya reseteado). El ejercicio CONTINÚA hasta que el usuario termina todas las parejas — al final, `applySessionResult` recibe el ejercicio marcado `correct: false` y la cascada es idempotente. Exploit-proof: cerrar pestaña tras el primer fallo NO permite escapar la cascada.
- **D-62:** **Shuffle de ambas columnas en cada render** con Fisher-Yates seedable (mismo RNG que el sampler). Al cargar el ejercicio en `sessionCurrentExercise`, se baraja UNA VEZ y se cachea en sub-estados (`matchLeft`, `matchRight`) — el orden no cambia mientras el ejercicio está en pantalla.
- **D-63:** **Tamaño variable** (N parejas entre 2 y ~10). El schema acepta cualquier longitud en ese rango. Layout responsive: dos columnas verticales lado a lado, un item por fila, sin scroll horizontal. Comportamiento del "forced last pair" (cuando solo queda 1 izq y 1 der disponibles, son forzosamente pareja) = **Claude's discretion** del planner.

### Schema JSON + grading

- **D-64:** **Payload de `word-buttons`** = `{prompt: string, answer: string[], distractors?: string[]}`:
  - `prompt`: frase en español a traducir (string no vacío)
  - `answer`: array de tokens italianos en orden correcto (≥1 token, cada token string no vacío)
  - `distractors`: array opcional de tokens distractores adicionales (cada uno string no vacío). Si está ausente, se trata como `[]`.
  - Ejemplo:
    ```json
    {
      "id": "avere-100",
      "type": "word-buttons",
      "categoryIds": ["avere"],
      "payload": {
        "prompt": "Yo tengo un coche.",
        "answer": ["io", "ho", "una", "macchina"],
        "distractors": ["hai", "sono"]
      }
    }
    ```
- **D-65:** **Payload de `match`** = `{prompt: string, pairs: Array<[string, string]>}`:
  - `prompt`: instrucción corta (ej. "Empareja sustantivo con artículo")
  - `pairs`: array de tuples [izq, der], cada tuple es exactamente 2 strings no vacíos. Longitud 2 ≤ N ≤ 10.
  - Columna izquierda al render = `shuffle(pairs.map(p => p[0]))`, derecha = `shuffle(pairs.map(p => p[1]))`.
  - Ejemplo:
    ```json
    {
      "id": "genero-001",
      "type": "match",
      "categoryIds": ["genero-numero"],
      "payload": {
        "prompt": "Empareja sustantivo con artículo.",
        "pairs": [
          ["casa", "la"],
          ["libro", "il"],
          ["amico", "l'"]
        ]
      }
    }
    ```
- **D-66:** **Duplicados en columna derecha permitidos**. Si `pairs` contiene `["casa","la"]` y `["porta","la"]`, ambas parejas son válidas. El grading textual: una pareja {izq, der} que el usuario forma es CORRECTA si existe alguna `pair` en `payload.pairs` con `pair[0].toLowerCase() === izq.toLowerCase()` y `pair[1].toLowerCase() === der.toLowerCase()`, Y esa pair (por índice) no ha sido consumida ya en este ejercicio. Tracking interno: array de índices de pairs consumidos. La columna derecha puede mostrar visualmente dos `"la"` idénticos — ambos sirven indistintamente para los sustantivos femeninos.
- **D-67:** **Grading case-insensitive** para los dos tipos nuevos (y solo para los nuevos — multiple-choice sigue por índice, no por texto):
  - `wordButtons.grade(exercise, response)`: `response.tokens.map(t => t.toLowerCase())` deep-equal `exercise.payload.answer.map(t => t.toLowerCase())`. Ambos arrays ya están NFC-normalizados (CONT-06 al cargar).
  - `match.grade(exercise, response)`: comprueba cada `response.pairs[i]` con lowercase + consume el `pair` matching del payload.
  - El render mantiene la capitalización original del JSON. El autor puede ser laxo al transcribir; el riesgo de "ocultar typos de mayúsculas" se asume como trade-off favorable a ergonomía.

### Ergonomía teclado (SESSION-06 + extensión a los 3 tipos)

- **D-68:** **Multiple-choice — teclas (SESSION-06 literal)**: `1-4` → `sessionSelectOption(idx-1)`. Si el ejercicio tiene N opciones (3 o 4), las teclas que excedan N (ej. `4` en ejercicio de 3 opciones) se ignoran silenciosamente. No se mapean 5-9 para multi-choice (el schema actual limita a 4 opciones).
- **D-69:** **Word-buttons — teclas**: `1-9` **dinámicos sobre las palabras VISIBLES del banco**. La palabra en primera posición visible es siempre `1`, la segunda `2`, etc. Visualmente cada botón del banco lleva un sufijo numérico (ej. `ho ¹`, `hai ²`). A medida que el banco mengua (palabras movidas al área respuesta), las claves se RE-NUMERAN dinámicamente. `Backspace` → quita la última palabra colocada (la devuelve al banco). `Enter` → `wordButtonsCheck()` (botón Comprobar). Si el banco tiene >9 palabras visibles, las 10+ no son alcanzables por número (caso poco común para A1/A2; el schema validator NO bloquea — Claude's discretion sobre si emitir warning suave).
- **D-70:** **Match — teclas**: columna izquierda con números **1-9**, columna derecha con letras **a-i**. Cada item lleva su sufijo visible (ej. `casa ¹`, `la ᵃ`). Flujo:
  - Pulsar un número (`1`–`9`) → selecciona/marca el item izq de esa posición visible (estado `matchSelectedLeftIdx`).
  - Pulsar una letra (`a`–`i`) sin número previo → ignorado silenciosamente.
  - Pulsar una letra con número previo activo → forma la pareja {izqSeleccionado, der[letra]}, evalúa y aplica D-60.
  - Pulsar otro número antes de la letra → reemplaza la selección anterior (cambias de mente).
  - Cap natural 9×9 = 81 parejas; cap real esperado 5–8 por ejercicio.
- **D-71:** **Enter/Space tras fallo** dispara `sessionAdvance()` (= click en "Siguiente") en los tres tipos. Tras acierto, Enter/Space **no hacen nada** — el auto-avance 600ms (SESSION-05) gestiona el avance, intacto. El handler global hace `e.preventDefault()` para `Space` (evita scroll de página).
- **D-72:** **Foco al body al montar/avanzar sesión**: ningún botón recibe focus visualmente. El keydown listener se registra a nivel del componente sesión (recomendación: `@keydown.window` de Alpine, que se monta/desmonta automáticamente con el sub-template `<template x-if="currentScreen === 'session'">`). Cleanup obligatorio al cambiar `currentScreen` o desmontar — sin esto, las teclas seguirían capturándose en home/picker/summary (bug latente). El sub-template del session screen ya cumple D-Phase 2 (double-defense Alpine) — añadir el listener sobre el contenedor del session screen, NO sobre `document` directamente.

### Claude's Discretion

- **Estilos visuales concretos**: borde del área respuesta vacía (placeholder "Construye la frase..." o similar), tamaño y padding de botones del banco, color exacto del item izq seleccionado en match, animación de parpadeo rojo, tipografía del sufijo numérico/alfabético (superíndice Unicode `¹²³`/`ᵃᵇᶜ` vs etiqueta `<kbd>`). Pico color vars + sin emojis decorativos, coherente con tono sobrio de Phase 2.
- **Comportamiento del "forced last pair" en match** (auto-completar al penúltimo click o exigir el click final). Ambas son razonables.
- **Estructura interna de `src/exercise-types/word-buttons.js` y `match.js`**: objeto con `grade(exercise, response)` exportado, registrado en `index.js`. Layer purity D-02 invariante (sin DOM/storage/fetch).
- **Nomenclatura de propiedades del `appShell`** para sub-estados (ej. `wordButtonsAnswer`, `matchSelectedLeftIdx`). D-25 fija el factory plano; los nombres son del planner.
- **Helper privado `applyResultToSession(exercise, correct)`** (recomendado en code_context) o duplicación inline en los 3 handlers — el planner elige. Si duplica, asegurarse de que `applyImmediateFailure` se llama exactamente UNA vez por ejercicio fallado.
- **Estrategia de `@keydown.window` vs addEventListener manual**: recomendación `@keydown.window` por simplicidad de cleanup; alternativa válida si el planner prefiere control explícito.
- **Tests del registry**: archivo nuevo `tests/exercise-types.test.js` o extensión de `tests/domain.test.js`. Cobertura mínima: distractoras en word-buttons, duplicados en match, case-insensitivity, ordering, schema validator rechaza payloads malformados con mensajes claros.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope, Key Decisions (Phase 1+2)
- `.planning/REQUIREMENTS.md` — EXTYPE-02, EXTYPE-03, SESSION-06 (los 3 requisitos de Phase 3)
- `.planning/ROADMAP.md` §"Phase 3" — Goal, 4 success criteria
- `.planning/STATE.md` — Decisiones acumuladas tras Phase 2 (Promise-handoff Alpine init, x-if double-defense, layer purity)

### Phase 1 (mantienen vigencia en Phase 3)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — D-01..D-23 (registry pattern, schema validator, NFC, layer purity, schemaVersion, CDN SRI)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-VERIFICATION.md` — patrón Alpine boot
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md` — patrón Promise-handoff OBLIGATORIO

### Phase 2 (mantienen vigencia en Phase 3)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — D-24..D-55 (appShell plano + sub-estados por pantalla, D-54 fail-cascade inmediata, schemaVersion 2)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-SUMMARY.md` — patrones de confirmación inline + button-row + double-defense Alpine

### Research (read antes de planificar)
- `.planning/research/SUMMARY.md` — síntesis general
- `.planning/research/ARCHITECTURE.md` — patrones registry, layer purity, sub-templates Alpine
- `.planning/research/PITFALLS.md` — anti-patterns relevantes (UI grades the answer, double-defense)

### Code references (leer antes de planificar)
- `src/exercise-types/index.js` — registry actual con `multiple-choice` (extender con 2 entradas)
- `src/exercise-types/multiple-choice.js` — patrón canónico de `grade()` a replicar
- `src/data/schema-validator.js` líneas 84-127 — extender para `word-buttons` y `match` payloads (reemplazar el branch literal `ex.type !== 'multiple-choice'`)
- `src/screens/app.js` — `appShell` factory plano donde se añaden sub-estados de los nuevos tipos
- `src/screens/app.js` líneas 480-540 (`sessionSelectOption` / `sessionAdvance`) — patrón de feedback verde/rojo + cascada inmediata D-54 a generalizar
- `index.html` líneas 226-261 — `<template x-if="currentScreen === 'session'">` donde se añaden sub-templates por `sessionCurrentExercise.type`

### External docs (read once when implementing)
- Alpine.js `x-if` / `x-for` / `x-show`: https://alpinejs.dev/directives/if
- Alpine.js event modifiers (`.prevent`, `.window`): https://alpinejs.dev/directives/on
- Pico CSS Buttons + Forms: https://picocss.com/docs
- MDN `KeyboardEvent.key`: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key (usar `event.key` para `'1'..'9'` y `'a'..'i'`)
- Node 22 test runner: https://nodejs.org/api/test.html

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (Phase 2, ningún refactor estructural necesario)

- **`src/exercise-types/index.js`** — Añadir entradas `'word-buttons': wordButtons` y `'match': match`. No cambia la firma del registry. Los consumidores (`appShell`) lo recorren genéricamente.
- **`src/exercise-types/multiple-choice.js`** — Plantilla canónica. Los dos archivos nuevos exportan un objeto con `grade(exercise, response)` siguiendo el mismo patrón. Layer purity D-02 invariante.
- **`src/screens/app.js`** — El factory plano (D-25) se EXTIENDE con sub-estados por tipo. Propuesta de nomenclatura (Claude's discretion del planner):
  - Word-buttons: `wordButtonsBank: string[]`, `wordButtonsAnswer: string[]`, `wordButtonsCanCheck` (getter computado `wordButtonsAnswer.length > 0 && sessionFeedback === null`), `wordButtonsAddWord(idx)`, `wordButtonsRemoveWord(idx)`, `wordButtonsCheck()`.
  - Match: `matchLeft: string[]`, `matchRight: string[]`, `matchSelectedLeftIdx: number | null`, `matchPairsConsumed: Array<{leftIdx, rightIdx, pairIdx}>`, `matchHadFailure: boolean`, `matchSelectLeft(idx)`, `matchPickRight(idx)`.
- **`src/data/schema-validator.js`** — La rama `if (ex.type !== 'multiple-choice')` en línea 84 se REEMPLAZA por un switch/lookup que valida los 3 tipos. Añadir 2 bloques nuevos:
  - Word-buttons: `prompt` string no vacío, `answer` array de strings no vacío, `distractors` opcional array de strings.
  - Match: `prompt` string, `pairs` array de tuples [string, string] con longitud entre 2 y 10, cada string no vacío.
  - Mensajes de error en español (FOUND-04), formato `{file, exerciseId, reason}` consistente.
- **`src/screens/app.js`** — `sessionSelectOption(idx)` actual (línea 480) es ESPECÍFICO de multiple-choice. Phase 3 lo deja igual y AÑADE handlers paralelos `wordButtonsCheck()` y `matchPickRight(idx)`. **CRÍTICO**: la lógica común (push a `sessionResults`, marcar `sessionFeedback`, llamar `applyImmediateFailure` en branch !correct, programar autoAdvance 600ms en correct) DEBE extraerse a un helper privado (recomendado `applyResultToSession(exercise, correct)`) para no duplicar D-54 entre los tres tipos. Sin esto, una refactorización futura puede romper la cascada en uno solo de los tipos.
- **`index.html`** — El template `<template x-if="currentScreen === 'session' && sessionCurrentExercise">` (líneas 226-261) se reorganiza:
  ```html
  <template x-if="currentScreen === 'session' && sessionCurrentExercise">
    <section @keydown.window="handleSessionKey">
      <p x-text="sessionProgressLabel"></p>
      <p x-text="sessionCurrentExercise.payload.prompt"></p>
      <template x-if="sessionCurrentExercise.type === 'multiple-choice'">
        <!-- bloque existente: x-for opciones, sessionSelectOption(idx), feedback -->
      </template>
      <template x-if="sessionCurrentExercise.type === 'word-buttons'">
        <!-- nuevo: banco + área respuesta + Comprobar -->
      </template>
      <template x-if="sessionCurrentExercise.type === 'match'">
        <!-- nuevo: 2 columnas + matchSelectedLeftIdx visible + items apagados -->
      </template>
      <button x-show="sessionFeedback === 'incorrect'" @click="sessionAdvance">Siguiente</button>
      <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
    </section>
  </template>
  ```
- **Tests** — Patrón Phase 2 (`tests/domain.test.js` con `node --test`). Añadir cobertura para:
  - `wordButtons.grade` con/sin distractoras, case-insensitive, orden incorrecto, longitud incorrecta.
  - `match.grade` con duplicados en derecha, case-insensitive, parejas en orden distinto.
  - Schema validator rechaza payloads malformados con mensajes claros y file/exerciseId correctos.

### Established Patterns (de Phase 1/2, mantienen vigencia)

- **Layer purity** (D-02): `src/domain/*` y `src/exercise-types/*` no importan storage/fetch/DOM. Mantener invariante en los handlers nuevos.
- **Registry agnóstico** (D-01): el switch por tipo se hace en `index.js` (registry lookup) y en validator/screen, nunca dentro de `grade()` de un tipo concreto.
- **Promise-handoff Alpine init**: sin cambios estructurales.
- **`x-text` exclusivamente, jamás `x-html`** (T-02-01): textContent escapa por defecto.
- **Double-defense Alpine** (Phase 2 lección recurrente): `<template x-if="...">` + getters null-safe. Aplicar también a los nuevos sub-templates (`sessionCurrentExercise.payload.answer`, `sessionCurrentExercise.payload.pairs`, etc.).
- **`schemaVersion`-based migration**: Phase 3 **NO necesita migración**. El state shape (`exerciseStats`, `categoryProgress`, `dailyLog`, `inFlightTest`) ya es agnóstico al `exercise.type`. `schemaVersion` permanece en 2.
- **Spanish UI** (FOUND-04): "Comprobar", "Empareja sustantivo con artículo", "Construye la frase...", "Siguiente". IDs/slugs siguen ASCII.
- **Tests con `node --test`** (D-11): `node --test tests/*.test.js` (glob).

### Integration Points

- **`appShell.startSession(mode)`** existente sigue invocando `buildSession`/`buildFullTest`. Ningún cambio en `src/domain/session.js` — el sampler es agnóstico al tipo (solo opera sobre `categoryIds`).
- **Carga de ejercicio nuevo** (cuando `sessionCursor` avanza o al arrancar): debe resetear los sub-estados específicos del tipo del NUEVO ejercicio. Helper sugerido `initSubStateForExercise(exercise)`:
  - `multiple-choice`: nada extra (los bindings actuales no necesitan reset adicional).
  - `word-buttons`: `wordButtonsBank = shuffle(payload.answer.concat(payload.distractors ?? []), rng)`, `wordButtonsAnswer = []`.
  - `match`: `matchLeft = shuffle(payload.pairs.map(p => p[0]), rng)`, `matchRight = shuffle(payload.pairs.map(p => p[1]), rng)`, `matchSelectedLeftIdx = null`, `matchPairsConsumed = []`, `matchHadFailure = false`.
- **`applyImmediateFailure` (existente Phase 2)** se invoca:
  - Word-buttons: una vez en `wordButtonsCheck()` branch !correct (igual que multi-choice).
  - Match: en `matchPickRight(idx)` branch !correct (cuando el grade de la pareja recién formada devuelve `false`), antes de aplicar el parpadeo rojo + deshacer. Idempotente: múltiples errores en el MISMO ejercicio no duplican (state.categoryProgress ya reseteado tras el primero).
- **`applySessionResult` al final de sesión**: sin cambios estructurales. Recibe `sessionResults` con entradas `{exerciseId, correct}` agnósticas al tipo. Counters monotónicos D-09 aplican igual. En match con `matchHadFailure === true`, el ejercicio se incluye como `correct: false` aunque al final el usuario formó todas las parejas correctas.
- **Cleanup del keydown listener**: si se usa `@keydown.window` Alpine modifier (recomendado), el listener se desmonta automáticamente al cambiar `currentScreen`. Si se prefiere addEventListener manual, el cleanup explícito DEBE estar en el lifecycle (riesgo: olvidarlo deja el listener activo capturando teclas en home/picker/summary).

### Estructura final esperada (post-Phase 3)

```
src/
├── main.js                       # sin cambios estructurales
├── domain/                       # sin cambios
├── data/
│   ├── content-loader.js         # sin cambios
│   ├── schema-validator.js       # EXTENDIDO: payloads de word-buttons + match
│   └── storage.js                # sin cambios (schemaVersion sigue en 2)
├── exercise-types/
│   ├── index.js                  # EXTENDIDO: registry con 3 entradas
│   ├── multiple-choice.js        # sin cambios
│   ├── word-buttons.js           # NUEVO: grade() exportado
│   └── match.js                  # NUEVO: grade() exportado
└── screens/
    └── app.js                    # EXTENDIDO: sub-estados + handlers + applyResultToSession helper + handleSessionKey
content/
├── categories.json               # sin cambios estructurales
└── exercises/avere.json          # sin cambios (Phase 4 añade los demás)
index.html                        # EXTENDIDO: 2 sub-templates nuevos + @keydown.window
tests/
├── domain.test.js                # sin cambios (sampler/progress)
└── exercise-types.test.js        # NUEVO: grade() de los 3 tipos + schema validator extendido
```

</code_context>

<specifics>
## Specific Ideas

- **El usuario quiere ergonomía agresiva**: el goal explícita "completa una sesión de 20 sin necesidad de ratón **incluyendo word-buttons y match**". Si en UAT se descubre que un atajo concreto es incómodo (ej. mezcla números+letras en match), ajustarlo es prioritario — no descartar la promesa de "sin ratón".
- **Sufijos numéricos/alfabéticos visibles en los botones** (D-69/D-70): el binding entre tecla y elemento DEBE ser visible (`ho ¹`, `la ᵃ`). El usuario tiene que poder mirar la pantalla y saber qué pulsar sin pensar. Si los sufijos resultan ruidosos visualmente, opciones de Claude's discretion: `<kbd>` tag de Pico, superíndice Unicode, label `[1]`.
- **Coherencia visual con Phase 2**: clases Pico classless, `.button-row` (introducido en Phase 2 UAT 02-04) puede reusarse en el banco word-buttons si encaja.
- **Renumeración dinámica del banco word-buttons** (D-69): el bind `1` siempre apunta a la primera palabra VISIBLE actual, no a la primera palabra original. Implementación más simple: re-derivar `bankWithKeys = wordButtonsBank.map((w, i) => ({word: w, key: String(i+1)}))` en cada render. Sin "huecos" en la numeración.
- **Match validación instantánea + cascada inmediata** (D-60/D-61): si el usuario falla la primera pareja y cierra pestaña, la cascada D-54 YA persistió. Exploit-proof — coherente con la promesa "te obliga a no olvidar".
- **`@keydown.window` modificador de Alpine**: recomendación canónica. Se registra/desregistra con el lifecycle del template — más robusto que `addEventListener('keydown', ...)` manual con cleanup en `destroy()`. Si Alpine no soporta `.window` en este contexto, fallback a registrar/desregistrar en `init()`/`destroy()` del `appShell` con guard `currentScreen === 'session'`.
- **Phase 3 no añade nuevas pantallas**: solo extiende session screen con sub-templates. Home, picker, summary, banner inFlightTest, confirmaciones inline (D-27/D-43/D-44) — todos intactos.

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **Auto-completar el "forced last pair" en match**: cuando solo quedan 1 izq + 1 der disponibles, completar sin pedir el click. Útil para evitar un click trivial al final. Si el planner descarta auto-completar y en UAT se siente lento, reconsiderar en Phase 5 polish.
- **Letras a-z para palabras del banco word-buttons** (alternativa a 1-9): permitiría >9 palabras alcanzables por teclado pero rompe la consistencia con multi-choice (1-4). Reconsiderar si emerge un ejercicio A2 con frase muy larga (>9 tokens contando distractoras).
- **Tab + Enter como fallback de teclado**: descartado en favor de números/letras directas. Si un ejercicio puntual no encaja, considerar Tab como secundario.
- **Flag opcional `caseSensitive: true` por ejercicio**: descartado (D-67 case-insensitive global). Si emerge ejercicio que TESTEE mayúsculas (nombres propios al inicio de frase), añadir flag opcional al schema.
- **Cancelar auto-avance 600ms con Enter tras acierto**: descartado en D-71 (rompe SESSION-05). Reconsiderar si en UAT el usuario echa de menos avanzar más rápido.
- **Indicador visual del item izq seleccionado en match** (animación, ring, color): Claude's discretion. Si la selección no es visualmente obvia en UAT, prioridad de ajuste post-Phase 3.
- **Permitir distractoras en match** (items extra que NO emparejan con nada): no contemplado en D-65 (todos los items izq y der son parte de alguna pair). Reconsiderar si emerge en Phase 4 al transcribir un PDF con distractoras explícitas.
- **Warning del schema validator** cuando un word-buttons tiene >9 palabras visibles (banco + distractoras): Claude's discretion del planner. Recomendado como warning suave (no error bloqueante) para no romper ejercicios A2 con frases largas.
- **Sub-categorías más finas que "1 PDF = 1 categoría"**: out of scope v1 (declarado en PROJECT.md). No reabrir aquí.

</deferred>

---

*Phase: 3-Variedad de ejercicios + ergonomía de teclado*
*Context gathered: 2026-05-23*
