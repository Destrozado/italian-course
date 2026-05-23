# Phase 1: Loop mínimo end-to-end (Avere + multiple-choice) - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 entrega el **loop mínimo end-to-end** del juego: la app arranca con `npx serve`, carga `categories.json` + `content/exercises/avere.json` con schema validation (banner visible si algo es inválido), y permite al autor lanzar y completar una sesión real de multiple-choice contra Avere. Al terminar la sesión, los contadores por ejercicio (`timesShown`, `timesCorrect`, `timesFailed`) persisten en `localStorage` bajo `italianCourse.v1` y se recuperan al recargar.

Fuera del scope de esta fase (cubierto en fases posteriores): cascada de fallo multi-categoría, estados `hecha`/`dominada`, racha de 21 días, home dashboard, resumen de fin de sesión, otros tipos de ejercicio, backup UI, contenido más allá de Avere seed.

</domain>

<decisions>
## Implementation Decisions

### Estructura de carpetas y módulos

- **D-01:** Layout modular con `src/` separando dominio puro, datos, exercise-types y screens:
  ```
  italian-course/
  ├── index.html
  ├── styles.css
  ├── src/
  │   ├── main.js                  # Bootstrap Alpine, registra screens
  │   ├── domain/                  # Lógica pura, sin DOM ni storage
  │   │   ├── dates.js             # todayLocal()
  │   │   ├── progress.js          # applySessionResult() (Phase 2: ya esqueleto en F1 sin cascada)
  │   │   └── session.js           # buildSession() + buildFullTest()
  │   ├── data/
  │   │   ├── storage.js           # localStorage wrapper, schemaVersion, load/save state
  │   │   └── content-loader.js    # fetch + validate JSONs, banner en error
  │   ├── exercise-types/
  │   │   ├── index.js             # Registry: { 'multiple-choice': {render, grade}, ... }
  │   │   └── multiple-choice.js   # Render + grade del tipo multiple-choice
  │   │   # word-buttons.js y match.js entran en Phase 3
  │   └── screens/
  │       ├── session.js           # Pantalla de sesión (Fase 1 mínima: indicador X/N, feedback)
  │       # home/picker/summary se añaden en Phase 2
  ├── content/
  │   ├── categories.json
  │   └── exercises/
  │       └── avere.json
  ├── tests/
  │   └── domain.test.js           # node --test
  └── material-profesora/          # ya existe, no se toca
  ```
- **D-02:** Dominio puro (`src/domain/`) no importa de `data/` ni de `screens/`. Es testeable con `node --test` sin DOM.
- **D-03:** Los módulos son ES modules nativos (`<script type="module">`), sin bundler.

### Schema JSON de ejercicios y categorías

- **D-04:** `content/categories.json` es el registro maestro:
  ```json
  {
    "categories": [
      { "id": "avere", "name": "Avere (auxiliar)", "order": 1 }
    ]
  }
  ```
  El `id` es slug ASCII (lowercase, hyphen). Solo se referencia desde `categoryIds` de los ejercicios — typos producen error de validación visible.

- **D-05:** Un archivo `content/exercises/<categoryId>.json` por categoría, con array `exercises`:
  ```json
  {
    "$schema": "../schema-exercise.json",
    "exercises": [
      {
        "id": "avere-001",
        "type": "multiple-choice",
        "categoryIds": ["avere"],
        "payload": {
          "prompt": "Io ___ una macchina nuova.",
          "options": ["ho", "hai", "ha", "abbiamo"],
          "correctIndex": 0
        }
      }
    ]
  }
  ```
- **D-06:** Campos obligatorios por ejercicio: `id`, `type`, `categoryIds` (array no vacío), `payload`. Opcionales: `notes` (string, libre, para anotar dudas/contexto al editar).
- **D-07:** Payload de `multiple-choice`: `prompt` (string, hueco marcado con `___`), `options` (array de 3-4 strings), `correctIndex` (entero, 0-based).
- **D-08:** Validación: schema validator hand-written (~30-50 líneas) que comprueba tipos, campos obligatorios, integridad referencial (todo `categoryIds[]` referencia un id en `categories.json`), unicidad de `exercise.id` global. Al fallar, banner visible en la UI con: archivo, id del ejercicio (si lo tiene), descripción del problema.
- **D-09:** Las strings se normalizan a NFC en el momento de cargar (`content-loader.js`), tanto en prompts como en options.
- **D-10:** Si la validación falla, la app NO arranca con datos parciales — se muestra solo el banner de error global. (Justificación: simpleza; en Phase 5 podríamos refinar para cargar lo válido y avisar.)

### Test runner para el dominio

- **D-11:** `node --test` (Node 22 built-in) con `node:assert/strict`. Tests en `tests/domain.test.js`. Se ejecuta con `node --test tests/`.
- **D-12:** Phase 1 incluye smoke tests para `dates.todayLocal()` y `session.buildSession()` con escenarios mínimos:
  - `todayLocal()` devuelve `YYYY-MM-DD` y usa reloj local (mock Date)
  - `buildSession(["avere"], avereSeed, freshState, 20, 'repaso')` con seed de 10-12 ejercicios devuelve 10-12 (no 20 — ver D-13)
  - `buildSession` aplica weight cap `1/(1+min(timesShown, 10))` — verificable con dos ejercicios de timesShown distintos
  - El tests/ runner se ejecuta sin npm install, solo Node

### Sampler: edge case con #disponibles < tamaño de sesión

- **D-13:** Cuando #ejercicios disponibles < tamaño de sesión solicitado, la sesión se **reduce** al número disponible (sin repeticiones). Si `buildSession(cats, exercises, state, 20, 'repaso')` solo encuentra 8 ejercicios elegibles, devuelve 8.
- **D-14:** No hay "rellenar con repetidos" — los ejercicios dentro de una sesión son únicos.
- **D-15:** Implicación: en Phase 1 las sesiones serán de 10-12 ejercicios (no 20) hasta que se amplíe el contenido en Phase 4.

### Contenido seed de Avere para Phase 1

- **D-16:** Phase 1 incluye 10-12 ejercicios de Avere generados a partir de `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf` por el ejecutor. Distribución mínima: presente indicativo en las 6 personas (io ho, tu hai, lui/lei ha, noi abbiamo, voi avete, loro hanno) + 4-6 ejercicios que mezclan conjugaciones en contexto.
- **D-17:** Al menos 1 ejercicio seed lleva `categoryIds` con más de 1 categoría conceptual (aunque la segunda categoría aún no tenga archivo en Phase 1 — el validator debería tolerar o requerir que sí esté en `categories.json`). **Decisión:** en Phase 1 todos los ejercicios usan SOLO `["avere"]` porque ninguna otra categoría existe todavía. Los multi-categoría llegan en Phase 4 cuando se transcriben los otros PDFs.
- **D-18:** El autor (vcompany) puede revisar/sustituir los ejercicios seed después; no son una decisión definitiva, son un punto de partida funcional.

### Persistencia y estado

- **D-19:** El estado en localStorage tiene esta forma mínima en Phase 1 (extendible en Phase 2):
  ```json
  {
    "schemaVersion": 1,
    "exerciseStats": {
      "avere-001": { "timesShown": 3, "timesCorrect": 2, "timesFailed": 1 }
    }
  }
  ```
  Phase 2 añade `categoryStates`, `dailyLog`, etc. La extensibilidad se mantiene vía `schemaVersion` + migraciones en `storage.js`.
- **D-20:** Escritura única al final de sesión: en Phase 1 esto significa al terminar la sesión, antes de cualquier UI de "Volver al inicio" (Phase 2 añade la pantalla de resumen). Si el autor cierra la pestaña antes del final, la sesión se descarta (alineado con SESSION-08 en Phase 2).

### Bootstrap y arranque

- **D-21:** El autor arranca con `npx serve` en la carpeta del proyecto (sin install). La app vive en `http://localhost:3000`. README incluye estas instrucciones.
- **D-22:** Alpine.js 3.15.x y Pico CSS 2.1.1 se cargan vía CDN con `integrity` (subresource integrity) y versión exacta pinned — no `@latest`.
- **D-23:** No hay `package.json` en Phase 1 (no se necesita para `node --test`, que funciona standalone). Si en una fase posterior necesitamos deps reales, se añade.

### Claude's Discretion

- Layout exacto del HTML de la pantalla de sesión en Phase 1 (qué componente Alpine wraps qué) — el planner decide siempre que cumpla los success criteria.
- Nombres internos de las funciones helper (`render`, `grade`, `dispatch`, etc.).
- Cómo se inyecta `Alpine.start()` con relación al carga de contenido (probablemente: cargar contenido → si OK, registrar Alpine.data() y arrancar; si KO, render banner inline sin Alpine).
- Estilos visuales concretos (Pico CSS classless por defecto, solo se añaden clases si necesario).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level
- `.planning/PROJECT.md` — Project vision, Core Value, Out of Scope, Key Decisions
- `.planning/REQUIREMENTS.md` — v1 requirements (40 total), v2 deferred, Out of Scope
- `.planning/ROADMAP.md` §"Phase 1" — Phase goal, requirements list (19 reqs), 5 success criteria
- `.planning/STATE.md` — Accumulated decisions and milestone context

### Research
- `.planning/research/SUMMARY.md` — Synthesis of stack/features/architecture/pitfalls (HIGH-priority read)
- `.planning/research/STACK.md` — Alpine 3.15 + Pico 2.1 + ES modules rationale, `file://` constraints
- `.planning/research/ARCHITECTURE.md` — Data model, build order, pure-function patterns, `applySessionResult` shape
- `.planning/research/PITFALLS.md` — Streak/TZ, multi-tab, JSON authoring, NFC normalization, file:// gotchas

### Source material (informational, not normative)
- `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf` — Source for Avere seed exercises (D-16)
- `material-profesora/1 LEZIONE IN ITALIANO.odt` — Lección general (puede aportar contexto a Avere)

### External docs (read once when implementing)
- Alpine.js Installation: https://alpinejs.dev/essentials/installation
- Pico CSS Documentation: https://picocss.com/docs
- MDN `localStorage` quotas: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- Node 22 test runner: https://nodejs.org/api/test.html

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

(Greenfield project — no existing code to reuse en Phase 1.)

### Established Patterns

- **JSON-first content:** Las decisiones de schema (D-04..D-10) establecen el patrón que todas las fases siguen. Phase 3 añadirá `payload` shapes para word-buttons y match siguiendo el mismo molde (campos `id`, `type`, `categoryIds`, `payload` con la forma específica del tipo).
- **Registry pattern para exercise-types:** D-01 marca `src/exercise-types/index.js` como punto de extensión. Cada tipo exporta `{ render(node, exercise, onAnswer), grade(exercise, response) }`. Phase 3 amplía el registry sin tocar el resto.
- **Dominio puro testable:** D-02 + D-11 establecen el patrón de "lógica sin DOM, tests con `node --test`" que se mantendrá en Phase 2 (`applySessionResult`, estados, racha) y Phase 3 (sampling con 3 tipos).

### Integration Points

- **Bootstrap order:** `main.js` orquesta: cargar `categories.json` → cargar `exercises/*.json` → validar → si OK, registrar Alpine components y `Alpine.start()`. Si KO, render banner sin Alpine. Esto se cementa en Phase 1 y no cambia.
- **Storage namespace:** `italianCourse.v1` queda reservado en Phase 1. Phase 2 extiende su shape, no su nombre. `schemaVersion` permite migrar si el shape cambia.
- **`material-profesora/` no se modifica desde el código** — es fuente de verdad humana que la app no lee directamente. Solo los ejercicios manualmente derivados acaban en JSON.

</code_context>

<specifics>
## Specific Ideas

- **Avere seed cubre las 6 personas del presente indicativo + variantes contextuales** (D-16). Esto es deliberado: el autor está aprendiendo conjugaciones; cubrir las 6 personas garantiza que el sampler verá variedad real desde el día 1.
- **Banner de error JSON visible, no consola** (D-08, alineado con CONT-05): el autor edita JSON a mano; un typo no descubrible es el peor escenario. Banner debe mostrar archivo + ejercicio + qué falló de forma legible (no stacktrace).
- **`npx serve` con bookmark** (D-21): el flujo diario debe ser un comando + un bookmark. El autor abre un terminal una vez (`npx serve`), bookmarkea `http://localhost:3000`, y a partir de ahí solo abre el bookmark.
- **No `package.json` en Phase 1** (D-23): refuerza el "cero install". Si un autor curioso clona el proyecto, debe poder ejecutar `npx serve` y `node --test tests/` sin haber tocado nada más.

</specifics>

<deferred>
## Deferred Ideas

(Aparecidas durante la discusión, capturadas para no perderlas.)

- **Refinamiento del banner de error** para permitir "cargar lo válido y avisar de lo roto" en lugar de bloquear (D-10 deja todo o nada en Phase 1). Considerar para Phase 5 (Polish) si el flujo manual de edición genera fricción.
- **`integrity` (SRI) en los CDN tags** (D-22) — bien para Phase 1. Cuando salga una versión nueva de Alpine/Pico, el upgrade requiere recalcular el hash. Considerar si vale la pena un script o se hace a mano.
- **Mocking del reloj para tests de `todayLocal()`** (D-12) — Phase 2 va a necesitar mock del reloj más sofisticado para tests de racha (21 días simulados). En Phase 1 basta con un mock simple.

</deferred>

---

*Phase: 1-Loop mínimo end-to-end (Avere + multiple-choice)*
*Context gathered: 2026-05-23*
