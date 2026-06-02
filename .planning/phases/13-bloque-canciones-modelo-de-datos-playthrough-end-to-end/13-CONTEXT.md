# Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 13 entrega un bloque "Canciones" separado del home, su modelo de datos, y la capacidad de jugar una canción entera de principio a fin — todo reutilizando el engine v1.0 existente (cascada D-54, tipo `word-buttons`, schema-validator, patrón Test-completo/summary), **sin reconstruir el motor de re-verificación**.

Una canción = lista ordenada de frases. Jugarla = recorrer sus N frases en orden hasta el final (patrón Test completo, sin reinicio a mitad); cada frase muestra la **línea italiana** y el usuario construye la **traducción española** eligiendo palabras (word-buttons en dirección inversa it→es). Fallar una frase enganchada a categorías gramaticales dispara la cascada D-54 inmediata sobre esas categorías. Frases sin categoría se guardan/juegan sin cascada. Al terminar, resumen con frases falladas + impacto en categorías.

Cubre: SONG-01..04, PLAY-01..05, LINK-01..04, DATA-01..03 (16 requisitos).

**El contenido real ("Equilibrio mentale — Ultimo") NO entra aquí** — es Phase 14. Phase 13 se valida con una mini-canción de prueba (vertical slice jugable end-to-end).
</domain>

<decisions>
## Implementation Decisions

### Acceso desde el home
- **D-01:** "Canciones" es un **botón protagonista** en la fila prominente del home, al mismo nivel que `Repaso 20` / `Test completo` (NO en estilo muted como Backup). Le da peso de feature principal. Abre una pantalla nueva (nuevo valor de `currentScreen`, p.ej. `'canciones'`) con el listado.
- Bloque **separado de la tabla de categorías** del home (decisión de milestone arrastrada): las canciones no son filas de esa tabla.

### Estado de la canción (pasada/fallada + redención)
- **D-02:** El estado de cada canción **refleja el último intento completo**, con 3 valores:
  - `no hecha` = nunca terminada
  - `pasada` = el último recorrido completo terminó **sin ningún fallo**
  - `fallada` = el último recorrido completo terminó con ≥1 fallo
- **D-03:** Es **redimible y bidireccional**: re-jugar una `fallada` y terminar limpio la sube a `pasada`; volver a fallar una `pasada` la baja a `fallada`. NO es sticky (a diferencia de `dominada` de categorías). Sin racha de 21 días, sin "dominada".
- El estado de la canción se persiste al **terminar** el recorrido (write-once-at-end). Los fallos de cascada D-54 sobre categorías se persisten **inmediatamente** al fallar cada frase (invariante D-54, no se toca).

### Resumen post-canción
- **D-04:** El resumen muestra **errores + impacto en categorías**:
  - Lista de frases falladas (línea italiana + tu respuesta vs traducción correcta) — reusa el patrón `summary-errors` / `summarySessionResults`.
  - Un bloque tipo "Categorías que bajaron de estado por esto: […]" — reusa el **concepto** `summaryDelta` (estado categoría antes→después), pero adaptado: solo lista las categorías gramaticales que cascadearon por las frases falladas de esta canción. Cierra el loop pedagógico: sabes qué repasar tras la canción.
  - Las frases **sin categoría** falladas no aparecen en el bloque de impacto (no cascadean), pero sí en la lista de errores.

### Banco de palabras español (mecánica de traducción inversa)
- **D-05:** El banco usa **distractoras opcionales por frase** — reutiliza el campo `distractors?` que `word-buttons` ya soporta. Cada frase decide si lleva señuelos españoles. **Por defecto sin distractoras** salvo donde añadan valor pedagógico (se afina en el contenido, Phase 14).
- **D-06:** El grading **ignora puntuación y mayúsculas** (arrastrado de `word-buttons`: comparación de secuencia exacta de tokens, case-insensitive + NFC). Los tokens del `answer[]` son palabras españolas sin puntuación; la línea italiana del `prompt` se muestra tal cual (con su puntuación/mayúsculas originales) como texto a traducir.
- La dirección es la **inversa** del word-buttons actual: `prompt` = línea **italiana**, `answer[]` = tokens **españoles**. El handler `grade()` es agnóstico al idioma (compara secuencias), así que se reutiliza tal cual.

### Claude's Discretion
Decididos por el builder/researcher siguiendo los patrones del codebase (el autor delegó explícitamente):
- **Layout del JSON de canciones** — p.ej. `content/songs/<slug>.json` por canción + posible índice `songs.json`, coherente con el patrón "un archivo por categoría" y con `content-loader.js`. Si conviene un índice ligero para el listado, adelante.
- **Reuso de pantalla** — si el playthrough reusa `currentScreen='session'`/`'summary'` o introduce pantallas dedicadas (`'cancion'`/`'cancion-summary'`). Mantener el patrón de templates `x-if` mutuamente excluyentes (D-24) y el cleanup por lifecycle (D-72).
- **Tipo de ejercicio** — si las frases de canción usan el tipo `word-buttons` tal cual (con dirección invertida en el contenido) o se registra un tipo nuevo en el `registry` (p.ej. `song-line`) que reusa `wordButtons.grade()`. Decisión de diseño del builder; el invariante es UN solo call-site de cascada (helper `applyResultToSession`, D-54/Pitfall #2).
- **Forma del state + migración** — sub-árbol nuevo para canciones (p.ej. `state.songProgress`) + `migrate4to5` + bump `CURRENT_SCHEMA_VERSION` 4→5 siguiendo la cadena existente (`migrate1to2`→…→`hydrateV4`). Deep-clone defensivo como en `migrate3to4`.
- **Schema-validator** — extender el dispatch `PAYLOAD_VALIDATORS` y/o añadir un validador de archivo de canción que rechace JSON malformado con banner visible (coherente con el validator existente, DATA-02).
- **Atajos de teclado** — reusar los de `word-buttons` (1-9 banco + Backspace + Enter=Comprobar; Enter/Space tras fallo avanza) vía `@keydown.window` (D-72).
- **Standalone enforcement** — garantizar que las frases de canción NO entran en `buildSession`/`buildFullTest` (LINK-04): las canciones se cargan/recorren por su propio path, separadas del pool de `content/exercises/`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y requisitos de la fase
- `.planning/ROADMAP.md` §Phase 13 — goal, depends-on, 5 success criteria, requisitos mapeados
- `.planning/REQUIREMENTS.md` §v1.3 — SONG-01..04, PLAY-01..05, LINK-01..04, DATA-01..03 (texto exacto de cada requisito) + Out of Scope (qué NO hacer)
- `.planning/PROJECT.md` §Current Milestone v1.3 + §Key Decisions — Core Value, cascada D-54, design rules heredadas

### Engine a reutilizar (NO reconstruir)
- `src/screens/app.js` — factory `appShell`: `currentScreen` switch (D-24), `applyResultToSession` (único call-site de cascada), `applyImmediateFailure` (cascada D-54 inmediata), `completeSession`/`summaryDelta`/`summarySessionResults`, `buildFullTest`, patrón `inFlightTest`, cleanup `@keydown.window` (D-72)
- `src/exercise-types/word-buttons.js` — `wordButtons.grade()` (secuencia exacta, case-insensitive + NFC); payload `{prompt, answer[], distractors?, explanation?}`
- `src/exercise-types/index.js` — `registry` (dispatch por `ex.type`)
- `src/data/schema-validator.js` — dispatch table `PAYLOAD_VALIDATORS` por tipo; rechazo con banner visible
- `src/data/storage.js` — cadena de migraciones `migrate()` (1→2→3→4→hydrateV4), `CURRENT_SCHEMA_VERSION`, deep-clone defensivo (`migrate3to4`)
- `src/domain/progress.js` — `applyImmediateFailure`, `applySessionResult`, `applyNewExerciseRegression`
- `src/domain/session.js` — `buildSession`, `buildFullTest`, `fisherYates` (las canciones NO deben entrar aquí — LINK-04)
- `src/data/content-loader.js` — carga de `content/exercises/*.json` + `categories.json` (referencia para el patrón de carga de canciones)
- `index.html` — fila prominente del home (`.button-row button-row-prominent`, líneas ~144-147), tabla densa de categorías, banners `x-if` con getter null-safe (patrón double-defense), pantallas session/summary
- `content/categories.json` — 9 categorías existentes (ids para enganche `categoryIds[]` de las frases)

### Reglas editoriales (relevantes para Phase 14 pero útiles de contexto)
- Memoria persistente `exercise_authoring_rules.md` (R1-R6) — NOTA: el quórum estricto R1-R7 NO aplica a canciones (CONT-03 = validación ligera autor-oráculo)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`wordButtons.grade()`** — agnóstico al idioma; reutilizable tal cual para it→es invirtiendo qué va en `prompt` vs `answer[]` en el contenido.
- **`applyResultToSession` / `applyImmediateFailure`** — el primitivo de cascada D-54 toma un ejercicio con `categoryIds[]`; una frase de canción con `categoryIds` cascadea idéntico. UN solo call-site (Pitfall #2).
- **`summaryDelta` + `summarySessionResults`** — patrón listo para el resumen post-canción (impacto en categorías + lista de errores). El snapshot dedicado en `completeSession()` evita la race contra el unmount.
- **Cadena de migraciones + `hydrateV4`** — patrón para `migrate4to5` y el sub-árbol `songProgress`.
- **`.button-row button-row-prominent`** — clase lista para el 4º botón "Canciones".
- **Atajos `@keydown.window` (D-72)** — listener global con cleanup por lifecycle; reusable en el playthrough.

### Established Patterns
- **`currentScreen` switch (D-24)** — pantallas como `<template x-if>` mutuamente excluyentes; añadir `'canciones'` (listado) + reuso/dedicado para playthrough.
- **Double-defense Alpine** — getter null-safe + `x-if` guard antes de bindings (bindings se evalúan antes de `init()`). Aplicar a cualquier banner/listado nuevo.
- **Write-once-at-end para aciertos; fallos persisten inmediatamente (D-54)** — el estado de la canción sigue el primero; la cascada sigue el segundo.
- **Un archivo JSON por unidad de contenido** — coherente con `content/exercises/<categoria>.json`.

### Integration Points
- Home: nuevo botón protagonista + nuevo `currentScreen='canciones'`.
- State: nuevo sub-árbol (`songProgress`) + `migrate4to5` + bump `CURRENT_SCHEMA_VERSION`.
- Content: nuevo directorio/archivo(s) de canciones + carga separada del pool de ejercicios (NO entra en el sampler).
- Cascade: las frases enganchadas reutilizan `applyImmediateFailure` con sus `categoryIds[]`.
- Schema-validator: nuevo path de validación para archivos de canción.

</code_context>

<specifics>
## Specific Ideas

- La canción de ejemplo (Phase 14) es "Equilibrio mentale — Ultimo"; las traducciones de canciones son "particulares" por diseño (parte de la gracia) — por eso Phase 14 valida en modo ligero autor-oráculo, no quórum estricto.
- El bloque de impacto del resumen debe reusar el lenguaje factual/neutral del `summaryDelta` actual (estado antes→después), no gamificación.
- Phase 13 debería tener una **mini-canción de prueba** (pocas frases, alguna enganchada a categorías existentes, alguna sin categoría) para verificar el slice end-to-end sin depender del contenido real de Phase 14.
</specifics>

<deferred>
## Deferred Ideas

- **Proceso que propone categorías nuevas para frases sin categoría** (CATPROC-01/02) — milestone futuro; Phase 13 solo deja el modelo de datos preparado para frases sin categoría.
- **Más canciones** (MUSIC-X1) — el patrón de alta queda consolidado; añadir canciones es contenido posterior.
- **Audio / karaoke / sync con la música** — fuera de scope (es ejercicio de traducción textual).
- **Reanudar una canción a mitad** (`inFlightTest` para canciones) — descartado por simplicidad; abandonar descarta y se reempieza de cero (PLAY-05).
- **Mezclar frases de canciones en Repaso 20 / Test** — fuera por LINK-04.

None pendientes de todos (no había todos para esta fase).

</deferred>

---

*Phase: 13-Bloque Canciones + modelo de datos + playthrough end-to-end*
*Context gathered: 2026-06-02*
