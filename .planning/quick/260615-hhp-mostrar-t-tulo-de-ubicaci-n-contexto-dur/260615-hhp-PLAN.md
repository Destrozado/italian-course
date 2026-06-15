---
phase: quick-260615-hhp
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/app.js
  - index.html
  - styles.css
  - tests/screen-context-label.test.js
autonomous: true
requirements: [QUICK-260615-HHP]

must_haves:
  truths:
    - "Estando en la pantalla session de un Examen de 1 categoría, el alumno ve 'Examen: <nombre categoría>' como título encima del progreso."
    - "Estando en session de un examen multi-categoría, ve solo 'Examen' (sin listar nombres)."
    - "Estando en session de un Repaso, ve 'Repaso (N ejercicios)' con N = nº real de ejercicios de la sesión."
    - "Estando en la pantalla cancion, ve 'Canción: <title>' con el título de la canción activa."
    - "Las pantallas summary y cancion-summary muestran también el contexto de la sesión/canción de la que vienen, sin romper su header existente."
  artifacts:
    - path: "src/screens/app.js"
      provides: "getter derivado sessionContextLabel (y, si la verificación lo exige, un getter análogo para los resúmenes)"
      contains: "sessionContextLabel"
    - path: "index.html"
      provides: "título de contexto en el markup de session, cancion, summary y cancion-summary"
    - path: "styles.css"
      provides: "clase de estilo para el título de contexto coherente con Pico CSS"
  key_links:
    - from: "index.html (header de session)"
      to: "appShell.sessionContextLabel"
      via: "x-text"
      pattern: "sessionContextLabel"
---

<objective>
Mostrar un título de ubicación/contexto permanente mientras el alumno está DENTRO de una sesión de ejercicios o una canción, y también en las pantallas de resumen, para que no olvide dónde está.

Purpose: Reduce la desorientación ("¿esto era el examen de qué? ¿un repaso?") añadiendo una referencia contextual encima del progreso. Coherente con el Core Value (re-verificación constante por categoría) — el alumno siempre sabe qué está validando.

Output: Uno o dos getters derivados en `appShell`, el título insertado en las 4 pantallas afectadas (session, cancion, summary, cancion-summary), y estilo en styles.css. Pura UI derivada — NO toca estado persistido, storage.js, ni lógica de scoring/racha.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/260615-hhp-mostrar-t-tulo-de-ubicaci-n-contexto-dur/260615-hhp-CONTEXT.md
@CLAUDE.md
@.planning/STATE.md

@src/screens/app.js
@index.html
@styles.css
@content/categories.json
@content/songs.json
@tests/screen-canciones.test.js

<critical_warnings>
## NO INVENTAR — leer el código real

El executor NO debe asumir nombres de getters, propiedades de estado, ni la forma
de los datos. Debe LEER el código real de `src/screens/app.js` para confirmar
cada uno de los siguientes hechos ANTES de escribir el getter. Lo que sigue es lo
verificado en la lectura de planificación; el executor lo confirma, no lo asume:

- **Modo de sesión:** la propiedad es `this.sessionMode` con valores literales
  `'repaso'` | `'test-completo'` | `'cancion'` | `null`. NO existe un modo `'examen'`
  separado — Examen es `sessionMode === 'test-completo'` (ver `_launchExamen`).
- **Categorías de la sesión:** se leen de `this.pickerCheckedCategoryIds`
  (array de ids). Para Examen contiene `[catId]` (1 elemento); para Test completo
  multi-cat contiene varios; en summary SOBREVIVE (no se resetea hasta
  `returnToHomeFromSummary`). VERIFICAR con `pickerCheckedCategoryIds` en
  `_launchExamen`, `startSession` y `returnToHomeFromSummary`.
- **Nombre de categoría:** NO existe un mapa `categoriesById`. Las categorías
  viven en `this.content.categories` (array de `{id, name, order}`). El nombre se
  obtiene con `this.content.categories.find(c => c.id === catId)?.name`. VERIFICAR
  el patrón ya usado en `completeSong` (construye `catNameById` iterando
  `this.content.categories`) y en `categoriesForDisplay`.
- **N real de ejercicios:** `this.sessionExerciseIds.length`. VERIFICAR contra el
  uso en `sessionProgressLabel` (`Ejercicio X / ${this.sessionExerciseIds.length}`).
- **Título de canción:** `this.content.songsById[this.songActiveId]?.title`. El
  doc de canción TIENE campo `title` (ver content/songs/solo.json y el shape
  documentado en content-loader.js `loadSongs`). `songActiveId` SOBREVIVE en
  cancion-summary (no se limpia hasta `returnToSongList`). VERIFICAR.
- **Estado en resúmenes:** `completeSession()` NO llama `resetSession()` (solo lo
  hace `returnToHomeFromSummary()`), así que en la pantalla `summary` siguen vivos
  `sessionMode`, `pickerCheckedCategoryIds` y `sessionExerciseIds`. Para
  cancion-summary, `completeSong()` tampoco resetea hasta `returnToSongList()`.
  VERIFICAR ambos lifecycles leyendo `completeSession`, `returnToHomeFromSummary`,
  `completeSong`, `returnToSongList`. Si el executor confirma que estos viven,
  UN ÚNICO getter `sessionContextLabel` sirve para las 4 pantallas (preferido).
  Si la verificación revela que algún estado NO sobrevive a un resumen concreto,
  derivar un getter análogo para ese resumen (Claude's Discretion en CONTEXT §3).

## Patrón de getter a imitar
Imitar `get pickerHeaderLabel()` / `get pickerStartLabel()` / `get sessionProgressLabel()`
en `src/screens/app.js`: getter sin argumentos, switch por modo, devuelve string,
con guard defensivo (`if (!this.content) return ''`) para sobrevivir al tick de
unmount de Alpine.

## Defensa anti-TypeError (obligatoria)
Como los getters de este componente, devolver `''` cuando falte `content`,
`sessionMode`, o la entrada esperada. NUNCA acceder a `.title`/`.name` sin
encadenamiento opcional (`?.`) — el getter se evalúa durante el tick de unmount.
</critical_warnings>

<interfaces>
Hechos verificados (el executor confirma leyendo el código, no asume):

Propiedades de estado relevantes en appShell (src/screens/app.js):
  - sessionMode: 'repaso' | 'test-completo' | 'cancion' | null
  - pickerCheckedCategoryIds: string[]   // cats de la sesión; [catId] en Examen
  - sessionExerciseIds: string[]         // N real = .length
  - songActiveId: string | null
  - content.categories: Array<{id, name, order}>
  - content.songsById: Record<string, {id, title, phrases, ...}>

Getter de progreso existente (a NO modificar, solo imitar shape):
  get sessionProgressLabel() -> `Ejercicio ${cursor+1} / ${sessionExerciseIds.length}`
  get songProgressLabel()    -> `Frase ${cursor+1} / ${sessionExerciseIds.length}`

Markup donde insertar (index.html), encima del header de progreso existente:
  - session:         L316 `x-if="currentScreen === 'session' && sessionCurrentExercise"`, header L319 (sessionProgressLabel)
  - cancion:         L586 `x-if="currentScreen === 'cancion' && songCurrentPhrase"`, header L589 (songProgressLabel)
  - summary:         L664 `x-if="currentScreen === 'summary' && summaryDelta"`, header L666 (summaryHeaderLabel)
  - cancion-summary: L835 `x-if="currentScreen === 'cancion-summary' && songSummaryDelta"`, header L837 (`<h2>Canción terminada</h2>`)
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Añadir getter(s) de contexto en appShell</name>
  <files>src/screens/app.js, tests/screen-context-label.test.js</files>
  <behavior>
    Verificadas las propiedades reales (ver critical_warnings), el getter
    `sessionContextLabel` devuelve:
    - sessionMode 'test-completo' con pickerCheckedCategoryIds.length === 1:
      `"Examen: <name>"` donde name = content.categories.find(c => c.id === id)?.name
      (fallback al id si no se encuentra el name).
    - sessionMode 'test-completo' con length !== 1 (multi-cat o vacío):
      `"Examen"` (genérico, sin listar nombres — CONTEXT §3).
    - sessionMode 'repaso': `"Repaso (<N> ejercicios)"` con N = sessionExerciseIds.length
      (NO hardcodear 20 — CONTEXT §2).
    - sessionMode 'cancion': `"Canción: <title>"` con
      title = content.songsById[songActiveId]?.title (fallback razonable si falta).
    - Cualquier otro caso (sessionMode null, content no cargado): `""`.
    Test (presence-check sobre el source, patrón de screen-canciones.test.js):
    - `src/screens/app.js` define un getter `get sessionContextLabel()`.
    - El getter referencia `sessionMode`, `pickerCheckedCategoryIds`,
      `sessionExerciseIds`, `content.categories` y `content.songsById`.
    - Contiene los literales `'Examen'`, `'Repaso ('` y `'Canción:'`.
    - NO hardcodea el número 20 dentro del cuerpo del getter (debe usar `.length`).
    - Tiene guard defensivo (`return ''`) para el tick de unmount.
  </behavior>
  <action>
    Primero LEER el código real de src/screens/app.js para CONFIRMAR los hechos
    de critical_warnings (sessionMode, pickerCheckedCategoryIds, sessionExerciseIds,
    songActiveId, content.categories, content.songsById, y los lifecycles de
    completeSession/returnToHomeFromSummary/completeSong/returnToSongList).

    Añadir el getter `get sessionContextLabel()` en la sección de getters reactivos
    (junto a sessionProgressLabel / songProgressLabel), imitando el shape de
    pickerHeaderLabel: switch por this.sessionMode, devolviendo el string correcto
    según el behavior de arriba. Resolver el nombre de categoría con
    `this.content.categories.find(c => c.id === id)?.name ?? id`. Resolver el título
    de canción con `this.content.songsById?.[this.songActiveId]?.title`. Guard inicial
    `if (!this.content) return ''`.

    DECISIÓN de resúmenes (CONTEXT §3, Claude's Discretion): si la verificación de
    lifecycles confirma que sessionMode/pickerCheckedCategoryIds/sessionExerciseIds
    siguen vivos en `summary` y songActiveId en `cancion-summary` (lo esperado según
    la planificación), REUTILIZAR el mismo `sessionContextLabel` para las 4 pantallas.
    Solo si la verificación revela que algún estado NO sobrevive a un resumen, derivar
    un getter análogo dedicado para esa pantalla y documentar por qué en un comentario.

    NO tocar estado persistido, storage.js, ni la lógica de scoring/racha. El getter
    es puramente derivado y read-only.

    Crear tests/screen-context-label.test.js siguiendo EXACTAMENTE el patrón de
    tests/screen-canciones.test.js (import del source con readFileSync + assert de
    presencia textual / windowed slicing — el factory appShell no es trivialmente
    instanciable bajo node sin Alpine). Cubrir los asserts del behavior.
  </action>
  <verify>
    <automated>node --test tests/screen-context-label.test.js</automated>
  </verify>
  <done>El getter sessionContextLabel existe y cubre los 4 modos + el caso vacío con guard defensivo; el nuevo test pasa.</done>
</task>

<task type="auto">
  <name>Task 2: Insertar el título de contexto en las 4 pantallas + estilo</name>
  <files>index.html, styles.css</files>
  <action>
    Insertar el título de contexto ENCIMA del header de progreso existente en cada
    una de las 4 pantallas (CONTEXT §1: jerarquía dónde estás → cuánto llevas):

    - session (index.html ~L316-319): antes de `<header x-text="sessionProgressLabel">`,
      añadir un encabezado de contexto con `x-text="sessionContextLabel"`.
    - cancion (~L586-589): antes de `<header x-text="songProgressLabel">`, igual.
    - summary (~L664-666): antes de `<header x-text="summaryHeaderLabel">`, añadir el
      contexto (CONTEXT §4: respetar el header propio del summary, AÑADIR sin romperlo).
      Si la Task 1 decidió un getter análogo para el summary, usar ese; si no,
      `sessionContextLabel`.
    - cancion-summary (~L835-837): antes de `<header><h2>Canción terminada</h2></header>`,
      añadir el contexto (respetar el header propio).

    Usar un elemento de encabezado coherente con Pico CSS (p.ej. `<h2 class="session-context">`
    o un `<header>` con clase) que renderice como título por encima del progreso. NO
    listar nombres de categoría en el markup — el texto completo lo provee el getter.
    Respetar la estética actual y los `<template x-if>` existentes (insertar DENTRO del
    `<article>`, como primer hijo, sin alterar los guards).

    Añadir en styles.css una clase para el título de contexto (p.ej. `.session-context`)
    coherente con el ritmo de spacing de `.summary-delta` y `.session-explanation` ya
    presentes: tamaño de título, margen inferior pequeño hacia el progreso. Respetar
    Pico CSS (sin utilities, CSS plano con vars de Pico cuando aplique). El progreso
    debe quedar visualmente en tamaño menor debajo (puede mantenerse el `<header>`
    actual tal cual y solo darle al contexto un peso/size mayor).

    NO tocar JS, estado ni lógica. Solo markup + CSS.
  </action>
  <verify>
    <automated>grep -n "sessionContextLabel\|session-context" index.html && node --test tests/*.test.js 2>&1 | grep -E "# (pass|fail)"</automated>
  </verify>
  <done>El título de contexto aparece en las 4 pantallas encima del progreso, con estilo en styles.css; la suite sigue con 373 pass / 1 fail (el fallo PREEXISTENTE de genero-numero, NO uno nuevo).</done>
</task>

</tasks>

<verification>
- `node --test tests/*.test.js` debe terminar con `# pass 373` o más y `# fail 1`
  (el único fallo permitido es el PREEXISTENTE de genero-numero 12→13 de la tarea
  260614-hxn — NO arreglarlo en este plan; solo no introducir fallos NUEVOS). Si el
  nuevo test de Task 1 añade asserts que pasan, el conteo de pass sube por encima de 373.
- `grep -n "sessionContextLabel" index.html` muestra el binding en las pantallas
  session y cancion como mínimo (y summary/cancion-summary salvo getter análogo).
- Visual (no automatizable aquí, opcional UAT del autor): el título aparece encima
  del progreso en session/cancion/summary/cancion-summary.
</verification>

<success_criteria>
- Un getter derivado `sessionContextLabel` (read-only) cubre los 4 modos con el
  formato exacto de CONTEXT §2/§3 y N real de ejercicios (no 20 hardcodeado).
- El título de contexto se muestra encima del progreso en session, cancion, summary
  y cancion-summary, respetando los headers propios de los resúmenes (CONTEXT §1/§4).
- CERO cambios en estado persistido, storage.js o lógica de scoring/racha.
- La suite de tests no introduce fallos nuevos (sigue 1 fallo preexistente).
</success_criteria>

<output>
Create `.planning/quick/260615-hhp-mostrar-t-tulo-de-ubicaci-n-contexto-dur/260615-hhp-01-SUMMARY.md` when done
</output>
