# Phase 8: Modo Examen por categoría - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 8 entrega un **botón "Examen" por fila en la tabla home** que arranca un Test Completo de **SOLO esa categoría** con un click. Resuelve el dolor de jugar 5-6 Repasos seguidos para validar dominio de una sola categoría.

**Reinterpretación del título ROADMAP:** el título dice "al lado de cada categoría en el picker", pero el autor confirmó en discuss que la ubicación correcta es la **tabla home** (no el picker). El picker no se toca.

**Capacidades entregadas:**
- 1 botón "Examen" en cada fila de la tabla home, al lado de las columnas existentes (estado / categoría / racha / N ejercicios / última vez).
- Click → arranca directamente una sesión de Test Completo de esa cat (salta el picker, salta "Empezar").
- Reutiliza `buildFullTest(categoryIds, allExercises, rng)` (D-50) con `categoryIds = [catId]`.
- Reutiliza la persistencia `inFlightTest` (D-41/D-42) — Examen es semánticamente un Test Completo de 1 cat → comparte el mismo slot inFlightTest.
- Reutiliza `requestConfirm` (D-44 patrón) cuando el usuario lanza un Examen con otro Test Completo / Examen ya activo — 6ª call-site del helper.
- Reutiliza el flujo de session + summary + cascada D-54 + promoción a `hecha` (DOMAIN-04) sin modificación.

**Requisitos cubiertos** (IDs concretos los crea plan-phase):
- EXAM-01: Botón "Examen" en cada fila home con etiqueta plana "Examen".
- EXAM-02: Click → buildFullTest de 1 cat → currentScreen='session' sessionMode='test-completo', sin pasar por picker.
- EXAM-03: Conflict con Test Completo/Examen activo dispara `requestConfirm` (D-44 patrón).
- EXAM-04: Persistencia `inFlightTest` funciona igual que Test Completo regular (banner home reanudar, descartar, etc.).
- EXAM-05: Botón disabled cuando la categoría tiene 0 ejercicios cargados; visible+enabled en `hecha` y `dominada`.

**Fuera del scope:**
- Cambios al picker (sigue mostrando Repaso 20 / Test Completo igual).
- Cambios al motor de re-verificación (cascada D-54, sampler, promociones, racha intactos).
- Cambios al schema validator (Examen es UX puro, no toca contenido).
- Cambios al campo `inFlightTest` o migración schemaVersion — slot único compartido.
- Atajos de teclado para Examen (sin atajos en v1).
- Diferenciación visual en pantalla session entre Examen y Test Completo regular (mismo header, mismo flujo).
- Aviso/confirmación previa antes de lanzar Examen (lanzamiento directo).
- Copy especializada en banner reanudar ("Examen de Avere a medias") — copy genérica "Test completo a medias" se mantiene.
- Examen multi-cat (selección de N cats para Examen) — Examen es 1 cat por diseño; si quieres varias usas Test Completo regular vía picker.

</domain>

<decisions>
## Implementation Decisions

### Flujo de click

- **D-181:** **Click directo a session — salta picker y "Empezar".** Aprobado en discuss.
  - Click "Examen" en fila Avere del home → `buildFullTest(['avere'], allExercises)` → `sessionMode='test-completo'` → `persistInFlightTest()` → `currentScreen='session'`.
  - El picker no se abre. Si el usuario quiere examinar 2 categorías a la vez, debe usar Test Completo regular vía picker (out-of-scope para Examen).
  - **Por qué:** resuelve al máximo el dolor "5-6 Repasos para validar dominio". Cualquier fricción extra (reset checkboxes + ir a "Empezar") contradice el espíritu del feature.

### Persistencia + conflict + reanudar

- **D-182:** **Slot único `inFlightTest` compartido entre Test Completo regular y Examen.** Aprobado en discuss.
  - Solo 1 inFlightTest activo a la vez, independientemente de si es Examen o Test Completo.
  - Lanzar cualquier nuevo Test/Examen con uno activo → `requestConfirm` ("Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?") — 6ª call-site del helper D-44.
  - **Por qué:** cero estado nuevo, cero migración schemaVersion. El semántico "es Test Completo de 1 cat" justifica usar el mismo slot.

- **D-183:** **Banner home reanudar mantiene copy genérica.** Aprobado en discuss.
  - Sigue diciendo "Tienes un Test completo a medias — X/N ejercicios" tanto si el inFlightTest es un Examen como un Test Completo regular.
  - **Por qué:** minimiza cambios; el feature core es el atajo de 1 click desde home, no la diferenciación cosmética del banner.

### Ubicación del botón

- **D-184:** **Botón "Examen" en la tabla home, no en el picker.** Aprobado en discuss (reinterpretación del título ROADMAP).
  - El título ROADMAP dice "al lado de cada categoría en el picker" pero el autor confirmó que la ubicación correcta es la tabla home (1 click desde home vs 2 clicks via picker).
  - La tabla home actual tiene 5 columnas (estado / categoría / racha / N ejercicios / última vez). Se añade una 6ª columna o se inserta el botón al final de cada fila.
  - El picker no se modifica — sigue funcionando igual con sus 2 entry points Repaso 20 / Test Completo.
  - **Por qué:** la tabla home ya lista todas las categorías con su estado actual; añadir Examen ahí es el lugar natural (1 click desde dashboard).

### Copy + UI + edge cases

- **D-185:** **Etiqueta del botón: "Examen" (texto plano).** Aprobado en discuss.
  - Sin paréntesis con número de ejercicios, sin "Examinar" verbal.
  - Consistente con el resto de UI en español ("Repaso 20", "Test completo", "Backup", etc.).

- **D-186:** **Lanzamiento directo, sin confirmación previa.** Aprobado en discuss.
  - Click Examen → arranca sesión sin mostrar requestConfirm con "Vas a examinar N ejercicios, si fallas la cat vuelve a no-hecha".
  - Coherente con D-181 "directo a session" y con el filosofía de "el autor sabe lo que está clickeando".
  - Si pulsa por error puede salir con "← Volver al home" (Test Completo persiste vía inFlightTest, nada se pierde — D-41).

- **D-187:** **Edge cats: 0 ejercicios → disabled + tooltip; `dominada` → visible normal.** Aprobado en discuss.
  - Categoría con 0 ejercicios cargados (vacía en JSON o todos sus ejercicios eliminados) → botón disabled con tooltip explicativo ("No hay ejercicios en esta categoría").
  - Categoría en estado `dominada` o `hecha` → botón visible y enabled normal. El autor sigue queriendo poder re-examinar para reconfirmar dominio.
  - **Por qué:** disabled (no oculto) mantiene la consistencia visual de la fila; ocultar el botón en `dominada` le quita flexibilidad sin ganancia clara.

- **D-188:** **Sin atajos de teclado en v1.** Aprobado en discuss.
  - Solo click ratón. Coherente con que la tabla home actual no expone atajos.
  - Si emerge dolor post-uso, se añade en una fase incremental futura.

### Decisiones implícitas (heredadas, no se votan)

- **D-189:** **`sessionMode = 'test-completo'`** cuando arranca Examen. No se introduce un nuevo modo 'examen' — la sesión es semánticamente Test Completo (Fisher-Yates, sin tope, persistente).
- **D-190:** **Promoción a `hecha` aplica igual.** Si el Examen se completa sin fallar, todos los ejercicios de la cat quedan en `clearedExerciseIds` → DOMAIN-04 promociona la cat a `hecha` automáticamente. Si falla 1 → cascada D-54 → cat vuelve a `no-hecha` con racha 0 (igual que cualquier sesión).
- **D-191:** **Summary tras Examen** muestra delta de la categoría única examinada — sin cambios al renderizado del summary (es genérico por categorías tocadas).
- **D-192:** **Cero migración schemaVersion** — sigue 4. El feature es UX puro sobre estructuras existentes; no añade campos al state.

### Claude's Discretion

- **Layout exacto del botón en la fila** — columna nueva (6ª) vs botón inline al final de la fila. Se decide en plan-phase / ui-phase con preview visual.
- **Estilo del botón** — `class="secondary"` (consistencia con "Volver al home") vs primary. Probablemente secondary para no competir con los botones grandes Repaso 20 / Test Completo de la home.
- **Tooltip exacto del disabled** — copy se afina en plan-phase.
- **Nombre del handler** — sugerido `startExamen(categoryId)` en `src/screens/app.js`. Plan-phase confirmará.
- **Tests count esperado** — plan-phase definirá los smoke tests (probablemente +3-5 tests: click directo a session, conflict D-44, disabled cat 0, summary delta correcto, promoción a `hecha` tras Examen sin fallos).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase-level
- `.planning/PROJECT.md` — Validated Phase 1..7.2 entries; Key Decisions; valor core "te obliga a no olvidar".
- `.planning/REQUIREMENTS.md` — añadir subsección EXAM-01..05 en plan-phase / execute.
- `.planning/ROADMAP.md` §Phase 8 — título y goal originales (interpretación 'picker'→'home' en este CONTEXT.md).
- `.planning/STATE.md` — schemaVersion 4, 199/199 tests baseline pre-Phase-8.

### Fases precedentes con decisiones que se REUTILIZAN
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-02-PLAN.md` — D-50 `buildFullTest(categoryIds, allExercises, rng)` definition.
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-PLAN.md` — D-41/D-42/D-43/D-44 inFlightTest persistence + banner reanudar + requestConfirm patrón.
- `.planning/phases/06-polish-ux-post-sesion-reiniciar-y-review-errores/06-01-PLAN.md` — D-100/D-101/D-102/D-103/D-104 patrón de pattern-reuse desde startSession (referencia para `startExamen`).

### Code references (lectura ANTES de planificar)
- `src/screens/app.js` líneas ~145-150 (botones home Repaso 20 / Test completo — `openPicker`).
- `src/screens/app.js` líneas ~155-180 (tabla `categoriesForDisplay` template — donde se añade columna o botón inline).
- `src/screens/app.js` líneas ~270-290 (`openPicker` conflict D-44 — patrón a clonar para `startExamen`).
- `src/screens/app.js` líneas ~430-485 (`startSession` — reuso del bloque de reset + persistInFlightTest).
- `src/screens/app.js` líneas ~388-396 (`requestConfirm` helper — 6ª call-site).
- `src/screens/app.js` (computed `categoriesForDisplay`) — añadir `examenEnabled: bool` y `examenLabel: 'Examen'` o calcular en template.
- `src/domain/session.js` líneas 173-188 (`buildFullTest` — sin cambios, se invoca tal cual con `categoryIds=[catId]`).
- `src/data/storage.js` — `state.inFlightTest` shape (Plan 02-04). Sin cambios.
- `index.html` líneas ~155-178 (tabla home `<table>` — añadir columna o `<td>` con botón).
- `index.html` líneas ~65-180 (pantalla home completa — contexto).

### Content references
- `content/categories.json` (7 cats activas: avere, essere, género-número, profesiones, sustantivos-irregulares, verbos-movimiento, preposiciones — todas elegibles para Examen).
- `content/exercises/{cat}.json` — los pools por categoría (avere 23, essere 39, etc.). Edge case 0 ejercicios: actualmente todas tienen >10, pero el guard debe existir defensivamente.

### Tests references
- `tests/exercise-types.test.js` — `CATEGORIES_WITH_EXPLANATIONS` paramétrico (sin cambios).
- `tests/domain-session.test.js` — `buildFullTest` ya testado para categoryIds multi; añadir test 1-cat si no existe.
- Plan-phase definirá si tests nuevos viven en `tests/screen-examen.test.js` (nuevo) o se añaden a `tests/screen-multi-choice-shuffle.test.js` / otro.

### Material profesora (no aplica)
- Phase 8 es UX puro — no toca contenido pedagógico.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`buildFullTest(categoryIds, allExercises, rng)`** (`src/domain/session.js:173`) — invocado tal cual con `categoryIds=[catId]`. Sin modificación, sin tests nuevos del lado dominio (ya testado para 1+ cats).
- **`requestConfirm(opts)`** (`src/screens/app.js:388`) — patrón inline confirm de 4ª-6ª call-site. Examen es la 6ª (D-27 / D-43 / D-44 / D-76 / Phase 7 / Examen).
- **`persistInFlightTest()`** (`src/screens/app.js:~600`) — escribe `state.inFlightTest` con cursor/answers/categoryIds/startedAt. Se invoca tal cual tras `startExamen`.
- **`clearInFlightTest()`** (referenciado en D-44 conflict) — limpia inFlightTest. Reusable en el confirm.onConfirm.
- **Bloque de reset de sub-estado** de `startSession` líneas ~457-475 — duplicación aceptable v1 igual que `restartRepaso` (Phase 6 D-104). Refactor a helper común solo si emerge 3er-4to call-site.

### Established Patterns
- **D-44 conflict pattern:** chequea `state.inFlightTest` → `requestConfirm({message, onConfirm: () => clearInFlightTest() + arranca nuevo})`. Examen lo clona.
- **`pickerMode` vs `sessionMode`:** Examen salta `pickerMode` (no pasa por picker) y va directo a `sessionMode='test-completo'`.
- **`categoriesForDisplay` computed:** ya enriquece cada cat con badge/streak/labels para la tabla home. Añadir aquí `examenEnabled` (bool basado en `totalCount > 0`) y reutilizar desde el template.
- **`x-show` defensivo:** patrón habitual en `index.html`; Examen disabled puede ir via `:disabled="!cat.examenEnabled"` (no x-show — mantenemos el botón visible greyed).
- **Cancelaciones defensivas (Pattern S-2):** `cancelAutoAdvance()` + `cancelMatchFlash()` antes de reset sub-estado (Pitfall #5).
- **Phase 6 `restartRepaso` precedente** — el pattern de "duplicar bloque de reset desde startSession sin refactor a helper" ya está establecido. `startExamen` sigue el mismo enfoque.

### Integration Points
- **`src/screens/app.js`** — añadir método `startExamen(categoryId)`. Posición: junto a `openPicker` / `startSession`. Cuerpo: ver D-181 (chequeo D-44 → buildFullTest → reset sub-estado → persistInFlightTest → currentScreen='session').
- **`index.html` tabla home** — añadir `<th>` (opcional, podría no tener header si se quiere minimalista) y `<td>` con `<button @click="startExamen(cat.id)" :disabled="!cat.examenEnabled">Examen</button>` por fila.
- **`categoriesForDisplay` computed** — derivar `examenEnabled = (cat.totalCount ?? 0) > 0`. Probablemente computar `totalCount` ya disponible (la columna "N ejercicios" ya lo muestra).
- **CSS** — Pico CSS classless cubre `<button>` por defecto; probablemente añadir `class="secondary outline"` o similar para que el botón no compita visualmente con Repaso 20 / Test completo (botones grandes). Detalle visual decide ui-phase.

</code_context>

<specifics>
## Specific Ideas

- El dolor canónico que motivó la fase: "tengo que validar dominio de Avere antes del A1 oficial → hoy hago Repaso 20 → Repaso 20 → Repaso 20... 5-6 veces antes de cubrir los 23 ejercicios con seguridad". Examen lo resuelve en 1 click.
- Tras Phase 7.2 todas las cats tienen explanations 100%; un fallo en Examen muestra inline + summary "Errores cometidos" igual que cualquier sesión. Pedagógicamente el Examen es el momento clave para que las explanations entreguen valor.
- Coexistencia con Test Completo "todas las categorías": Test Completo regular sigue siendo útil para repasos integradores 7-cats; Examen es para validación focalizada 1-cat. No se sustituyen.
- Reanudación de Examen abandonado funciona igual que Test Completo regular (banner home → "Reanudar" → buildFullTest sobre las MISMAS categoryIds persistidas, que en Examen es solo 1).
- DOMAIN-04 promotion a `hecha`: tras Examen sin fallos de Avere, Avere pasa de `no-hecha`/`hecha`/`dominada` (cualquier estado previo) a `hecha`. Si ya estaba `dominada` se mantiene `dominada` (jerarquía dominada > hecha). Si estaba en racha activa, racha continúa.
- Edge cat con 0 ejercicios: actualmente todas las 7 cats tienen >10 ejercicios (avere 23 mínimo, profesiones 51 máximo). El disabled es defensivo para un escenario futuro (autor borra todos los ejercicios de una cat manualmente o crea una cat vacía en categories.json antes de añadirle JSON).

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la decisión scope, capturadas para no perderlas — todas out-of-scope Phase 8.)

- **Examen multi-cat (selección de 2-3 cats para examinar en bloque)** — out of scope; si el autor lo necesita usa Test Completo regular vía picker. Si emerge demanda específica, fase incremental "Examen multi-cat" con UI distinta (picker con botón "Examen" en vez de "Empezar"?).
- **Copy especializada en banner reanudar** ("Examen de Avere a medias" vs "Test completo a medias") — out of scope; coste cosmético no justificado v1.
- **Diferenciación visual en pantalla session** (header "Examen: Avere" en vez del header genérico de Test Completo) — out of scope; el usuario sabe en qué Examen está porque lo acaba de lanzar.
- **Aviso/confirmación previa** ("¿Examinar Avere? Si fallas vuelve a no-hecha") — out of scope; el autor sabe lo que clickea.
- **Atajos de teclado** (E + número de fila) — out of scope v1; deferido a fase incremental si emerge dolor.
- **Botón "Examen" también en el picker** (al lado de cada checkbox) — out of scope; D-184 lo descartó. Si emerge demanda específica, se reabre.
- **Slot inFlightTest separado** (Examen y Test Completo en paralelo) — out of scope; over-engineering 1-usuario v1, requiere migración schemaVersion.
- **Tracking estadístico de Examenes realizados** (counter aparte, "has hecho 3 Exámenes de Avere") — out of scope; los counters exerciseStats actuales son suficientes.
- **Ranking/leaderboard de Examenes** — out of scope (usuario único, FOUND-04 sin internet).

</deferred>

---

*Phase: 8-modo-examen-por-categoría*
*Context gathered: 2026-05-25*
