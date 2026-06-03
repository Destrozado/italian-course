# Phase 16: Motor de examen por slots - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

El motor de re-verificación deja de recorrer **ejercicios sueltos** y pasa a recorrer **slots**: por cada slot elige 1 variante aleatoria, redefine "categoría hecha" como pasar sin fallar 1 variante de cada uno de los N slots, y mantiene **intactas** la cascada D-54, la racha de 21 días y los 3 modos de sesión (Repaso 20 / Test completo / Modo Examen). Engine **exercisable end-to-end** con slots de 1 variante (las 9 categorías legacy de Phase 15 funcionan ya como slots de 1) ANTES de la rework de contenido.

**En scope:** el muestreo por slot en `buildSession`/`buildFullTest` (1 variante elegida por slot, fijada al construir la sesión), la redefinición de "hecha" sobre slots, la integración del muestreo en los 3 modos (GUARANTEE ≥1 slot por categoría), y el cableado del shape de variante elegida a través de `inFlightTest`/`sessionResults`/render/review de errores. Cubre EXAM-01..06.

**Fuera de scope (Phase 17, PILOT-*):** reagrupar los 57 ejercicios de Preposiciones en slots por regla, autorar variantes nuevas (quórum R1-R7), añadir el slot `in spiaggia / in montagna`, reset del progreso de Preposiciones. Esta fase entrega el MOTOR que explota el modelo de Phase 15; el contenido real que lo llena viene después. La conversión de las otras 8 categorías es CONV-01 (backlog post-v1.4).

</domain>

<decisions>
## Implementation Decisions

### Selección de variante dentro de un slot (EXAM-01, EXAM-04)
- **D-16-01:** La variante se elige **uniforme aleatoria** entre las variantes del slot (cada una con igual probabilidad), con el **RNG inyectable** existente (mismo patrón que `buildSession`/`fisherYates` → tests deterministas con seed fijo). **Cero state nuevo**: NO se introduce sub-árbol de tracking por variante ni contador `timesShown` por variante. Fiel a la filosofía "cambios mínimos" del autor.
- **D-16-02:** EXAM-04 se cumple por construcción: al re-hacer una categoría (tras fallo/reset, o en otra sesión) la selección uniforme se reejecuta → **pueden** tocar variantes distintas. NO se garantiza "siempre distinta a la anterior" (anti-repetición con memoria fue considerado y descartado por exigir state nuevo sin valor proporcional — el roadmap dice "pueden", no "deben"). La memorización por palabras muere porque la superficie cambia entre pasadas, no porque se prohíba repetir.
- **D-16-03:** EXAM-01 (nunca dos variantes del mismo slot en la misma sesión) se cumple porque cada slot se pickea como UNA unidad y resuelve a UNA variante. La de-duplicación multi-cat ya existente opera a nivel de slot (un slot multi-categoría se pickea una sola vez, cubre sus N categorías).

### Semántica de "Test completo" con slots (EXAM-06)
- **D-16-04:** "Test completo" pasa a significar **1 variante por slot**: recorre los N slots de las categorías elegidas (sin tope, sin ponderación, Fisher-Yates determinista — patrón `buildFullTest` D-50 intacto), eligiendo 1 variante aleatoria por slot. "Completo" = cubrir **todos los slots una vez**, NO todas las variantes de todos los slots. Unifica la noción de "hecha" en los 3 modos y cumple EXAM-01 automáticamente.
- **D-16-05:** Repaso 20 sigue siendo el modo capado (target 20) + ponderado por `exerciseWeight(timesShown)` a nivel de slot + GUARANTEE phase (≥1 slot por categoría elegida, D-49). La diferencia Repaso/Test se mantiene (capado+ponderado vs exhaustivo), ahora a granularidad de slot.

### Recuento en home y summary (EXAM-02)
- **D-16-06:** La columna del home se **sigue llamando "Ejercicios"** (cero cambio de copy/CSS/UI-SPEC). El número cuenta **slots**, pero como `slot id == exercise id` (Phase 15), el recuento actual (`exercisesByCategory[cat].length` y la lógica de cobertura `clearedExerciseIds`) **ya equivale a slots por construcción**: para las 9 categorías legacy (slots de 1 variante) el número es idéntico al de hoy. El delta del summary "pendientes para hecha" lee igual, contando slots.
- **D-16-07:** Consecuencia: la definición de "hecha" (`allInCat.every(id => clearedExerciseIds.includes(id))` en `progress.js`) **no necesita reescritura conceptual** — ya opera sobre ids de slot. Lo que cambia es que la SESIÓN presenta 1 variante por slot; el grading de esa variante marca el slot como cleared via `applyResultToSession` con el `slotId` (= `exerciseId`).

### Cuándo se fija la variante elegida + esquema de id de variante (cierra el diferido de Phase 15)
- **D-16-08:** La variante se **fija al construir la sesión** (NO al renderizar). `buildSession`/`buildFullTest` devuelven la variante ya elegida por slot. Esquema de id de variante = **`variantIndex` (índice dentro del `variants[]` del slot)** — resuelve explícitamente el "esquema de ids de variante" que Phase 15 difirió a esta fase.
- **D-16-09:** El par `{slotId, variantIndex}` (o shape equivalente que el planner decida) se persiste en `inFlightTest` → **reanudar un Test completo muestra la MISMA variante** (no se re-sortea a mitad, coherente con la persistencia per-answer existente). `sessionResults` registra qué variante concreta se mostró → el review de errores del summary muestra la variante exacta que se falló.
- **D-16-10:** **Default `variantIndex = 0`** para: slots legacy de 1 variante, y reanudación de un `inFlightTest` pre-existente (escrito antes de este cambio) que no lleve `variantIndex`. Garantiza backward-compat sin migración de state nueva (el slot de 1 variante siempre resuelve a su única variante, índice 0).

### Invariantes brownfield NO negociables (heredados, re-confirmados)
- **D-16-11:** Reusar `applyResultToSession` para acierto/fallo; los call-sites de `applyImmediateFailure` siguen siendo **exactamente 2** (Pitfall #2, verificable por grep). Fallar la variante de un slot dispara la cascada D-54 inmediata sobre las `categoryIds` del slot (EXAM-03) — el slot pasa el `slotId` (= `exerciseId`) a la maquinaria de cascada existente, que ya opera por id.
- **D-16-12:** Racha de 21 días + promoción `hecha→dominada` (EXAM-05) operan sobre la categoría con la nueva definición de "hecha" por slots **sin cambiar la mecánica de racha** (`progress.js` D-38/D-39 intacto — solo cambia que "todos los ejercicios cubiertos" ahora significa "todos los slots cubiertos", que es lo mismo a nivel de id).

### Claude's Discretion
- **Shape exacto del retorno de `buildSession`/`buildFullTest`:** hoy devuelven `{exerciseIds: string[], actualSize}`. El planner decide cómo llevar el `variantIndex` junto al `slotId` (p.ej. `{slots: [{slotId, variantIndex}], actualSize}`, o arrays paralelos) minimizando el ripple en `app.js`/`inFlightTest`/`sessionResults`/render de los 3 tipos. Restricción: la variante queda fijada al construir (D-16-08) y default a índice 0 (D-16-10).
- **Resolución variante→superficie en render:** cómo `app.js` resuelve `slotById[slotId].variants[variantIndex]` a la superficie que consumen los renders multiple-choice/word-buttons/match (hoy leen `.payload`). Probablemente un getter `sessionCurrentExercise` slot-aware análogo al patrón `songCurrentPhrase` de Phase 13. Discreción del planner; sin nuevos call-sites de `applyImmediateFailure`.
- **¿Migración de `inFlightTest`?:** evaluar si el `inFlightTest` persistido necesita backfill de `variantIndex` o basta el default 0 (D-16-10). Preferencia: **sin migración de schemaVersion** (sigue v6, coherente con D-15-09 — el modelo vive en `content/`, no en el state); el default 0 cubre el legacy.
- **Tests:** smoke paramétrico + unit de dominio puro (`buildSession`/`buildFullTest` con RNG seedado verificando 1 variante por slot, nunca dos del mismo slot, reejecución toca variantes distintas con seeds distintos). Discreción del planner sobre cobertura exacta, respetando el patrón `node --test` existente.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements y roadmap de esta fase
- `.planning/REQUIREMENTS.md` §Motor de examen por slots (EXAM) — EXAM-01..06 + criterios de aceptación.
- `.planning/ROADMAP.md` §Phase 16 — goal + 5 success criteria.

### Contrato heredado de Phase 15 (el modelo que este motor explota)
- `.planning/phases/15-modelo-de-datos-slot-variantes-schema-migraci-n/15-CONTEXT.md` — decisiones D-15-01..09 (shape slot+variantes, `slotById`, type a nivel de slot, esquema de id de variante DIFERIDO a esta fase y aquí resuelto en D-16-08).

### Código que esta fase modifica/extiende (scout realizado)
- `src/domain/session.js` — `buildSession` (GUARANTEE+FILL ponderado), `buildFullTest` (D-50), `fisherYates` (D-62), `weightedPickOne`, `exerciseWeight`. **Punto principal de cambio**: muestreo por slot + selección de variante al construir.
- `src/domain/progress.js` — `applySessionResult` (cascada D-39/D-54, cobertura `clearedExerciseIds`, promoción `hecha`/`dominada`, racha D-38), `applyNewExerciseRegression` (D-40), `applyImmediateFailure`. **Opera por id de slot ya** — la definición de "hecha" no se reescribe (D-16-07).
- `src/data/content-loader.js` — `slotById` (mapa hermano normalizado `{id,type,categoryIds,explanation,variants[]}`, `normalizeExerciseToSlot`). **Es el contrato de entrada del motor** (consumir `slotById`, no `.payload`).
- `src/screens/app.js` — AppShell plano (`currentScreen`), `inFlightTest`/`persistInFlightTest`, `sessionResults`, los 3 call-sites de `applyResultToSession`, render por tipo, summary-errors. Aquí se cablea la variante elegida y el render slot-aware.
- `src/exercise-types/{multiple-choice,word-buttons,match}.js` — grading por tipo; reciben la superficie de la variante (no `.payload` directamente).

### Decisiones de proyecto que constriñen esta fase (PROJECT.md §Key Decisions)
- D-54/D-39 cascada fail-wins inmediata · D-49 GUARANTEE phase · D-50 `buildFullTest` · D-62 `fisherYates` exportable · D-14 sin reemplazo · weight cap=10 · Pitfall #2 (2 call-sites de `applyImmediateFailure`) · D-38 racha con `lastSuccessDate` guard · patrón `songCurrentPhrase`/`songPhraseById` (Phase 13) como análogo de getter dedicado slot-aware.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `slotById` (content-loader.js, Phase 15): mapa hermano ya normalizado a `{id,type,categoryIds,explanation,variants[]}`. El motor consume ESTE mapa (legacy = slot de 1 variante con `variants[0]` derivada del payload). Contrato listo.
- `buildSession`/`buildFullTest`/`weightedPickOne`/`fisherYates`/`exerciseWeight` (session.js): la maquinaria de muestreo existe; el cambio es resolver cada pick a `{slotId, variantIndex}` en vez de `exerciseId`.
- `applyResultToSession` + `applyImmediateFailure` (app.js/progress.js): cascada D-54 por id de slot — reusar, 0 nuevos call-sites (Pitfall #2).
- Patrón `songCurrentPhrase` + `songPhraseById` (Phase 13, app.js): getter dedicado para una pantalla que NO usa `sessionCurrentExercise` directo — análogo para resolver la variante elegida del slot actual.

### Established Patterns
- **Sampler ponderado a nivel de id** `1/(1+min(timesShown,10))`: el id del slot (= exerciseId) es el ancla del peso → el sampler de slots reusa `exerciseStats[slotId]` sin cambio de clave (D-15-09).
- **"hecha" = cobertura total por id** (`clearedExerciseIds.every`): ya equivale a "todos los slots cubiertos" porque exercise id = slot id (D-16-07). No se reescribe la máquina de estados.
- **Persistencia per-answer de Test completo** (`inFlightTest`): la variante elegida debe viajar aquí para que reanudar muestre la misma (D-16-09).
- **RNG inyectable + determinismo con seed**: los tests inyectan RNG; la selección de variante usa el mismo patrón (D-16-01).

### Integration Points
- `loadContent → slotById` es el borde de entrada del motor de Phase 16.
- El shape devuelto por `buildSession`/`buildFullTest` define el contrato hacia `app.js` (render + `inFlightTest` + `sessionResults`). Cambiar de `exerciseIds: string[]` a algo que lleve `variantIndex` es el ripple principal (discreción del planner, D-16-08).
- `applyResultToSession(ex, correct, userAnswer)` recibe el slot/variante; la cascada se dispara por `slotId`.

</code_context>

<specifics>
## Specific Ideas

- El autor eligió de forma consistente la opción de **mínimo cambio** en las 4 áreas: uniforme aleatoria (cero state), Test = 1 variante por slot, etiqueta "Ejercicios" intacta, variante fijada al construir. El planner debe optimizar por **diff mínimo y reutilización del engine**, no por sofisticación (coherente con la filosofía "nada muy sofisticado, pura repetición").
- EXAM-04 interpretado como "pueden tocar variantes distintas" (probabilístico), NO "siempre distintas" — decisión explícita del autor (D-16-02).
- "Test completo" exhaustivo en **slots**, no en variantes — decisión explícita (D-16-04).

</specifics>

<deferred>
## Deferred Ideas

- **Anti-repetición de variante con memoria** (evitar la última variante mostrada por slot) — considerado, descartado para v1.4 por exigir state nuevo (`lastVariant` por slot) sin valor proporcional frente a la selección uniforme. Revisable si en uso real el azar repite demasiado la misma variante.
- **Ponderación por variante** (`timesShown` por variante) — descartado; el contador vive a nivel de slot, no de variante. Revisable si el SRS evoluciona.
- **Conversión del resto de categorías a slots** (CONV-01) — backlog post-v1.4; en esta fase las 9 categorías funcionan como slots de 1 variante (backward-compat).

### Reviewed Todos (not folded)
- `2026-06-02-articulos-indeterminados-partitivos.md` ("Categoría artículos indeterminados y partitivos") — match débil (0.6, keyword). Es una CATEGORÍA DE CONTENIDO nueva (un/uno/una + del/della…), NO el motor de slots. Ya revisado y diferido en Phase 15; sigue diferido a un milestone futuro de contenido. Queda en `pending/`.

</deferred>

---

*Phase: 16-motor-de-examen-por-slots*
*Context gathered: 2026-06-03*
