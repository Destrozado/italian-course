# Architecture Patterns

**Domain:** Integración de 4 categorías nuevas (slot+variantes) + marca de procedencia (PROV-01) en el motor v1.4 SIN tocar el engine
**Researched:** 2026-07-01

## Recommended Architecture

**Invariante rector:** brownfield puro de contenido. El milestone v1.9 NO añade ni modifica una sola línea del motor de re-verificación. Todo el trabajo vive en: (a) `content/` (JSON de las 4 categorías + `categories.json`), (b) un eslabón de migración `11→12` en `storage.js`+`backup.js`, (c) los 3 arrays de conteo hardcoded + `TOTAL_EXPECTED`, (d) opcionalmente un campo `source` en `categories.json`. Verificado contra código real: el modelo slot+variantes (`validateContent`, `normalizeExerciseToSlot`, `pickVariantIndex`, getter `.payload` sintético, sampler, cascada D-54) ya soporta N categorías; añadir la 11ª..14ª es puro registro + contenido.

```
                    content/categories.json  (array — orden de display)
                              │  [+4 entradas: dimostrativi, possessivi, modali, riflessivi]
                              ▼
content-loader.js  loadContent()  ── NO re-ordena; pasa categoriesRaw.categories tal cual
     │  fetchJson por cada content/exercises/<slug>.json
     │  normalizeNfcInPlace
     ▼
schema-validator.js  validateContent({categories, exercisesByFile})
     │  ALLOWLIST-PERMISIVO: valida campos requeridos, IGNORA campos extra
     │  → `source`/`origen` pasa sin cambios de schema (retrocompat gratis)
     ▼
  exerciseById[]  +  slotById[]  (normalizeExerciseToSlot: legacy→slot-1, variants→passthrough)
     │
     ▼
app.js  (factory Alpine plano)
     ├─ categoriesForDisplay  ← itera content.categories EN ORDEN DE ARRAY (order field NO se lee)
     ├─ buildSession / buildFullTest  ← pickVariantIndex + variantIndices paralelo
     └─ cascada D-54  applyImmediateFailure  ← EXACTAMENTE 2 call-sites (app.js:1642, app.js:1969)

storage.js  loadState → migrate() dispatcher  1→2→…→11→[NUEVO 11→12]→hydrateV12
backup.js   parseBackupFile  (misma cadena) + CURRENT_SCHEMA_VERSION espejo = 12
```

### Component Boundaries

| Component | Responsibility | v1.9 toca? | Communicates With |
|-----------|---------------|------------|-------------------|
| `content/categories.json` | Índice de categorías (id, name, order) — el ARRAY define el orden de display | SÍ: +4 entradas (+ opcional `source`) | content-loader, schema-validator, app.js |
| `content/exercises/<slug>.json` | Ejercicios-slot por categoría (top-level `{notes?, exercises[]}`) | SÍ: +4 archivos nuevos | content-loader, validador, smoke |
| `src/data/schema-validator.js` `validateContent` | Valida shape; `payload` XOR `variants[]`; categoryIds conocidas | NO (permisivo con `source`) | content-loader |
| `src/data/content-loader.js` `loadContent` | fetch + NFC + validar + `exerciseById`/`slotById` | NO | app.js |
| `src/screens/app.js` | UI + sampler + cascada D-54 (2 call-sites) | NO (engine intacto) | storage, content-loader, progress |
| `src/domain/progress.js` `applyImmediateFailure` | Cascada de fallo inmediata | NO | app.js |
| `src/data/storage.js` | Migración en cadena + `CURRENT_SCHEMA_VERSION` | SÍ: +`migrate11to12`/`hydrateV12`, bump a 12 | backup.js, app.js |
| `src/data/backup.js` | Round-trip export/import; rechaza `> current` | SÍ: import de migrate/hydrate v12, `CURRENT_SCHEMA_VERSION=12` | storage.js |
| Conteo: `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs` | Arrays hardcoded + `TOTAL_EXPECTED` | SÍ: +4 entradas cada uno | — |
| `tests/domain.test.js` `loadAllExerciseFiles` (readdir) | Smoke cascada multi-cat PARAMÉTRICO sobre TODOS los archivos | NO (auto-cubre las 4 nuevas) | — |

### Data Flow

`source` (PROV-01) es **metadata pura**: NINGÚN consumidor de runtime lo lee. Grep confirmado — no hay `.source`/`origen` en `src/` fuera de comentarios/canciones. El campo viaja en el JSON, sobrevive validación (permisiva), y queda disponible para auditoría/futuras vistas. No entra en el state de localStorage, no toca la migración, no toca el backup.

---

## Patterns to Follow

### Pattern 1: Alta de categoría nueva = clon del patrón v1.7 (presente-regolare)
**What:** v1.7 es el precedente EXACTO — categoría NUEVA (no conversión) nacida directamente en slot+variantes. Replicar 4 veces.
**When:** Cada una de dimostrativi/possessivi/modali/riflessivi.
**Cómo (verificado contra `presente-regolare.json`):**
- Archivo `content/exercises/<slug>.json` con top-level `{ notes?, exercises: [...] }` (sin `categoryId` top-level — la pertenencia va per-ejercicio en `categoryIds[]`).
- Cada ejercicio-slot: `{ id, type, categoryIds:[slug], explanation, variants:[≥2], validation }`. `variants` XOR `payload` (nace con `variants`, NUNCA legacy de 1 variante).
- `id` con prefijo = slug de categoría (p.ej. `dimostrativi-questo`, `possessivi-mio`) — clave para el reset selectivo por `startsWith`.
- `explanation` a nivel de slot, español acentuado (canon PRES-05/RAE), apóstrofes ASCII, plain text.
- Registrar en `categories.json`.

### Pattern 2: Migración ONE-bump para todo el milestone (`11→12`), NO per-categoría
**What:** UN solo eslabón `migrate11to12`/`hydrateV12`, `CURRENT_SCHEMA_VERSION=12` (espejo en `storage.js` y `backup.js`).
**Justificación (fuerte):**
- **Las 4 categorías nacen de cero → no hay progreso previo que resetear.** El reset selectivo de v1.5/v1.6/v1.7 existía porque se RENUMERABAN ids de categorías con progreso vivo. Aquí no existe estado previo bajo esos 4 prefijos en NINGÚN state real. El reset es, como en v1.7, un **no-op preventivo/forward-compat** (cubre el round-trip de un backup futuro que ya contenga esas categorías).
- Precedente directo: v1.7 hizo UN bump (`10→11`) para su categoría nueva aunque REQUIREMENTS decía `9→10`. Aquí, 4 categorías-de-cero en un milestone = 1 bump limpio. Per-categoría (`11→12→13→14→15`) multiplicaría 4× el boilerplate de migración/hydrate/backup/tests sin ganar nada — todos serían no-op idénticos salvo el prefijo.
- Patrón de shape: bump NOMINAL (mismo set de sub-dicts; sin sub-árbol nuevo). PROV-01 NO añade nada al state.

**`migrate11to12` concreto (espejo LITERAL de `migrate10to11`, cambiando el array de prefijos):**
```js
const RESET_PREFIXES_V12 = ['dimostrativi', 'possessivi', 'modali', 'riflessivi'];
// (ids exactos a fijar en plan; deben coincidir con los slugs de categories.json)
```
Los 3 pasos idénticos: (1) `delete categoryProgress[<cada slug>]` tras deep-clone; (2) filtrar `exerciseStats` por `RESET_PREFIXES_V12.some(p => k.startsWith(p))`; (3) invalidar `inFlightTest` si referencia esos prefijos. Deep-clone JSON anti-prototype-pollution en todos los sub-dicts. Idempotente + puro. `hydrateV12` = espejo de `hydrateV11` (con guard root `const p = ...`), versión 12, sin re-ejecutar poda.

**Gate de colisión de prefijo (verificar en plan-time):** ninguno de los 4 slugs nuevos puede ser prefijo de otro slug existente ni viceversa. Chequear contra los 10 slugs actuales — `modali`/`possessivi`/`dimostrativi`/`riflessivi` no colisionan con ninguno, pero confirmarlo por script como en v1.6/v1.7.

**`backup.js`:** añadir `migrate11to12, hydrateV12` al import desde `storage.js`; extender la cadena (`if (migrated.schemaVersion === 11) migrated = migrate11to12(migrated); migrated = hydrateV12(migrated);`); bump `CURRENT_SCHEMA_VERSION = 12`. El rechazo `> current` (D-74) sube a 12 automáticamente.

### Pattern 3: categories.json — APPEND al final del array (order 11..14)
**What:** Añadir las 4 entradas al FINAL del array, `order: 11..14`.
**Hallazgo clave (verificado):** `content-loader` devuelve `categoriesRaw.categories` **sin re-ordenar**, y `categoriesForDisplay` itera ese array **tal cual**. El campo `order` es **documental/legacy — NO se consume para ordenar**. Por tanto el orden de display = el orden del array en el JSON.
**Decisión de posición:** APPEND al final es lo correcto y lo simple. Aunque semánticamente `dimostrativi`/`possessivi` "pertenecen" cerca de `articoli`/`genere-numero` (son determinantes que enganchan con el artículo), INSERTAR en medio desplazaría el orden visible de las 10 categorías existentes en el home sin ningún beneficio funcional (no hay dependencia de motor en el orden). El autor está acostumbrado a ver las categorías nuevas al final (así llegó `presente-regolare` en order 10). Los `order` de las nuevas: 11 (dimostrativi), 12 (possessivi), 13 (modali), 14 (riflessivi) — cosmético, pero mantener coherencia num/array.
**Impacto home-table:** ninguno estructural. Aparecen 4 filas nuevas al final de la tabla editorial (badge no-hecha, racha 0/21, botón Examen habilitado en cuanto tengan ejercicios). `categoriesForDisplay` ya deriva todo (status/streak/count/examenEnabled) genéricamente.

### Pattern 4: PROV-01 `source` a nivel de categoría en `categories.json`
**What:** Campo opcional `source: "apuntes-profesora" | "ia-quorum"` por entrada de `categories.json`.
**Por qué categoría (no slot/variante):**
- Granularidad correcta para el caso real: las 4 nuevas nacen `ia-quorum` puras (100% procedencia uniforme). Las 10 legacy son de procedencia MIXTA (transcritas de PDF en v1.0, pero AUMENTADAS por quórum en v1.4-v1.7 al convertirlas a slots). A nivel de categoría, el valor honesto para las legacy es `apuntes-profesora` (origen del contenido pedagógico raíz) — la marca refleja "de dónde salió el tema", no "quién tocó cada variante".
- `categories.json` es el único índice global y el sitio más barato de etiquetar (10+4 = 14 líneas, no 200+ ejercicios).
- **Retrocompatible GRATIS:** el validador de `categories.json` chequea `id` (slug), `name` (no vacío), unicidad — e **IGNORA cualquier campo extra** (no hay rechazo por `Object.keys`). Verificado en `schema-validator.js`. `source` pasa sin tocar el schema.
**Etiquetado del legado mixto (concreto):**
- Las 10 legacy → `source: "apuntes-profesora"` (origen del tema; el aumento por quórum es transformación, no cambio de procedencia).
- Las 4 nuevas → `source: "ia-quorum"`.
- Si el autor quisiera marcar el matiz "aumentado por IA" de las legacy, la vía natural futura sería un `source` a nivel de variante (`variant.source`), pero eso es scope de otro milestone; a nivel de categoría, dos valores bastan.
**Data-flow:** metadata-only. Nada lo lee en runtime (grep confirmado). Cero migración, cero backup, cero UI obligatoria. Decisión de granularidad exacta queda para discuss/plan, pero la recomendación es categoría-level en `categories.json`.

### Pattern 5: Cruces multi-cat — enganchar al motor de re-verificación
**What:** Ejercicios con `categoryIds` de 2+ categorías; fallar uno propaga cascada D-54 a todas. Precedente: `presente-regolare-300..303` (verificado: 300/302 cruzan con `avere`, 301/303 con `essere`).
**Recomendación por categoría (dependencias reales A1/A2):**
- **riflessivi ↔ essere / presente-regolare:** ALTO valor. El passato prossimo reflexivo usa `essere` + concordancia (`mi sono alzato/a`) — cruce natural con `essere`. El presente reflexivo (`mi chiamo`) es conjugación regular con pronombre — cruce con `presente-regolare`. Patrón: `riflessivi-300` (`[riflessivi, essere]`), `riflessivi-301` (`[riflessivi, presente-regolare]`).
- **possessivi ↔ articoli / genero-numero:** ALTO valor. El posesivo lleva artículo (`il mio`, excepción parentesco `mia madre`) y concuerda con la cosa poseída (género/número). Patrón: `possessivi-300` (`[possessivi, articoli]`), `possessivi-301` (`[possessivi, genero-numero]`).
- **dimostrativi ↔ articoli:** MEDIO-ALTO. `quello` toma formas tipo-artículo (`quel/quello/quell'/quei/quegli/quelle`) que ESPEJAN la regla de `lo/il/gli` de `articoli`. Patrón: `dimostrativi-300` (`[dimostrativi, articoli]`).
- **modali ↔ presente-regolare:** MEDIO. `potere/volere/dovere` son irregulares en presente (no son `presente-regolare`), pero rigen infinitivo (`posso andare`) — cruce posible con verbos de movimiento o presente. BAJO prioridad; puede quedar 0-cruces si no aporta contraste pedagógico claro (como Avere/Essere quedaron 0-match).
**Invariante:** los cruces se autoran como slot+variantes normales con `categoryIds` multi; NO añaden call-sites. **La cascada D-54 sigue con EXACTAMENTE 2 call-sites de `applyImmediateFailure` (`app.js:1642` decisión final, `app.js:1969` primer fallo de match) — verificado por grep.**

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Migración per-categoría (`11→12→13→14→15`)
**What:** Un eslabón de migración por cada categoría nueva.
**Why bad:** 4× boilerplate idéntico (todos no-op preventivos), 4× tests de cadena, 4× import en backup. Cero beneficio: no hay progreso previo que resetear en ninguna. Complica el dispatcher sin razón.
**Instead:** UN bump `11→12` con `RESET_PREFIXES_V12` de 4 prefijos (Pattern 2).

### Anti-Pattern 2: Insertar categorías en medio del array por "afinidad semántica"
**What:** Meter `dimostrativi`/`possessivi` junto a `articoli` (order 8) desplazando el resto.
**Why bad:** Cambia el orden de display de las 10 categorías existentes en el home sin beneficio (el orden no tiene efecto de motor). Rompe la expectativa del autor (nuevas = al final, como v1.7).
**Instead:** APPEND, order 11..14 (Pattern 3).

### Anti-Pattern 3: Tocar el motor para "leer" `source`
**What:** Añadir lógica de runtime que consuma `source` (filtros, badges de procedencia, etc.).
**Why bad:** Rompe el invariante brownfield-puro y añade superficie sin pedido real. PROV-01 es "marcar la procedencia a nivel de datos", no una feature de UI.
**Instead:** metadata-only. Si emerge una vista de procedencia, es otro milestone.

### Anti-Pattern 4: Nacer legacy (payload de 1 variante)
**What:** Crear las 4 categorías con `payload` en vez de `variants[]`.
**Why bad:** El Core Value exige que re-hacer una categoría tras un fallo pueda presentar OTRA variante del mismo slot (mata memorización). v1.7 estableció "nace en slot+variantes, ≥2 variantes por slot".
**Instead:** `variants: [≥2]` por slot desde el día 1 (Pattern 1).

### Anti-Pattern 5: Olvidar sincronizar los 3 arrays de conteo + `TOTAL_EXPECTED`
**What:** Añadir contenido sin actualizar los conteos hardcoded → smoke/gate en rojo.
**Why bad:** El reporter VAL-06 y los tests de conteo comparan `TOTAL_EXPECTED` (suma derivada) contra la realidad; desincronía = FAIL.
**Instead:** Ver §Count Sync (Pattern lockstep de Phase 31).

---

## Count Sync — Touch-points exactos (verificados)

Tres arrays hardcoded + un `TOTAL_EXPECTED` derivado. Todos deben ganar +4 entradas (una por categoría nueva):

1. **`tests/exercise-types.test.js`** — array `CATEGORIES_WITH_EXPLANATIONS` (líneas ~1273-1286). Cada entrada `{ file, expected }`. Para las nuevas, usar el helper `slotCountOf('content/exercises/<slug>.json')` (línea ~1270) — así el conteo se lee del JSON real, no un número mágico. Este array alimenta 2 loops (smoke de explanations ~1304 + validación de contenido ~1429).

2. **`tests/fixtures/slot-variants-integration.test.js`** — array de slugs `{ slug, expected }` (líneas ~169-178). Las nuevas: `expected: readJson('content/exercises/<slug>.json').exercises.length` (patrón ya usado para presente-regolare línea 178).

3. **`scripts/run-validation-271.mjs`** — array `CATEGORIES` (líneas ~174-183) con `{ slug, file, expected }`. Para las nuevas: `expected: slotCountOf('content/exercises/<slug>.json')`. `TOTAL_EXPECTED = CATEGORIES.reduce((s,c) => s + c.expected, 0)` (línea 188) se re-suma solo. **OJO:** hay un `TOTAL_EXPECTED_BASELINE` de coherencia (línea 195, hoy `183 + PRESENTE_REGOLARE_SLOTS`) — hay que extenderlo con los slots de las 4 nuevas o el gate fallará. Nota preexistente (v1.7): el reporter VAL-06 ya reportaba FAIL por 2 discrepantes AJENOS (genero-numero 13-vs-12, preposiciones 50-vs-49); v1.9 puede reconciliarlos de paso o dejarlos como estaban.

**Dynamic-count que mantiene la honestidad:** `slotCountOf` / `.exercises.length` leen del JSON en tiempo de test → si el nº de slots de una categoría nueva cambia, `expected` y `TOTAL_EXPECTED` se mueven solos. El único número mágico a tocar a mano es el `TOTAL_EXPECTED_BASELINE` de coherencia en `run-validation-271.mjs`.

**Smoke paramétrico (`tests/domain.test.js` `loadAllExerciseFiles` via `readdirSync`):** itera TODOS los archivos de `content/exercises/` → cubre la cascada multi-cat de las 4 nuevas SIN retoque de código (auto-descubrimiento). Solo hay que asegurar que cada categoría con cruces tenga ≥1 ejercicio con `categoryIds.length >= 2` para que el sub-test sea significativo.

---

## Suggested Build Order (Phases 35+)

Continuando desde Phase 34 (última de v1.8). Numeración EMPIEZA en **Phase 35**.

**Phase 35 — Migración `11→12` (reset selectivo preventivo de las 4 nuevas).** VA PRIMERA (desbloquea que las categorías nazcan limpias; patrón v1.7 Phase 29). `migrate11to12`/`hydrateV12`/`RESET_PREFIXES_V12` (4 prefijos) + `CURRENT_SCHEMA_VERSION=12` espejo en storage+backup + round-trip v12 + rechazo `>12` + tests de cadena (reset no-op, byte-intacto de las 10 + songProgress, idempotencia, anti-prototype-pollution). Gate de colisión de prefijo verificado por script.

**Phase 36 — Alta de Possessivi + Dimostrativi (determinantes, dependen de articoli).** Se hacen juntas o consecutivas porque comparten la dependencia de `articoli`/`genero-numero` (el posesivo lleva artículo; `quello` toma formas tipo-artículo). Registrar en `categories.json` (order 11/12) + autorar slots+variantes por quórum R1-R7 + cruces `possessivi↔articoli/genero-numero`, `dimostrativi↔articoli`. Trampa clave: dimostrativi calco ES 3-vías (este/ese/aquel) → IT 2-vías (questo/quello).

**Phase 37 — Alta de Verbi modali (potere/volere/dovere + infinitivo).** Independiente de las otras nuevas. Slots+variantes por quórum. Cruce opcional (BAJO) con presente/movimiento; puede quedar 0-cruces si no aporta contraste. Se puede intercalar antes/después de riflessivi sin problema.

**Phase 38 — Alta de Verbi riflessivi.** VA DESPUÉS de confirmar reutilización de `presente-regolare`/`essere` (el reflexivo presente = conjugación regular + pronombre; el passato prossimo reflexivo = `essere` + concordancia). Cruces `riflessivi↔essere` y `riflessivi↔presente-regolare`. Es la más "verbal-pesada" de las 4 → última para apoyarse en las categorías verbales ya estables.

**Phase 39 — PROV-01 + integración lockstep (cierre v1.9).** Añadir `source` a `categories.json` (10 legacy = `apuntes-profesora`, 4 nuevas = `ia-quorum`) + re-sincronizar los 3 arrays de conteo + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE` + +4 entradas en `CATEGORIES_WITH_EXPLANATIONS` + suite verde completa (incl. `VAL_07_STRICT=1`). PROV-01 al final porque es transversal y de bajo riesgo (metadata-only, cero motor). Cierra el milestone.

**Ordering rationale:**
- Migración PRIMERO (desbloquea, patrón invariante v1.5/1.6/1.7).
- Determinantes (36) antes que verbos (37/38) porque su dependencia (`articoli`) ya está estable desde v1.5, mientras que riflessivi depende de `presente-regolare`/`essere` que conviene confirmar reutilizables.
- riflessivi ÚLTIMA de las altas (más compleja, se apoya en las verbales).
- PROV-01 + lockstep al final (transversal, junta counts+source en una fase de cierre, patrón Phase 31 de v1.7).
- Alternativa aceptable: fusionar las 4 altas en menos fases (el autor pidió "agrupar 4 categorías en un milestone; una por categoría sería demasiado") — pero 1 fase por alta mantiene los plans acotados y el quórum manejable. Roadmapper decide granularidad; las DEPENDENCIAS (migración→altas→lockstep, determinantes antes que riflessivi) son el invariante.

---

## Scalability Considerations

| Concern | Hoy (10 cat) | v1.9 (14 cat) | A futuro (20+ cat / tiempos verbales) |
|---------|--------------|---------------|----------------------------------------|
| localStorage size | <<500 KB | +4 categorías de progreso ~despreciable | Sigue muy por debajo de 5 MiB |
| Arrays de conteo hardcoded | 3 arrays, sync manual | 3 arrays +4 c/u | Considerar derivar TODO por readdir (eliminar hardcode) si crece mucho |
| Migración en cadena | 11 eslabones | 12 | La cadena crece 1/milestone; sigue O(n) trivial en boot |
| Home table | 10 filas | 14 filas | Responsive móvil (backlog) si la tabla se hace larga |
| Smoke paramétrico | readdir auto-cubre | readdir auto-cubre | Escala sin retoque (auto-descubrimiento) |

**Nota de deuda:** los 3 arrays de conteo hardcoded son el único punto que NO auto-escala (hay que añadir 4 entradas a mano en cada uno). El smoke de cascada (readdir) ya es paramétrico. Si el proyecto añade muchas más categorías, valdría la pena migrar los 3 arrays a un readdir compartido — pero es refactor opcional fuera de scope v1.9.

---

## Sources

- `src/data/storage.js` (leído completo: dispatcher `migrate()`, cadena 1→11, `migrate10to11`/`hydrateV11`/`RESET_PREFIXES_V11`, `CURRENT_SCHEMA_VERSION=11`) — HIGH (código real)
- `src/data/backup.js` (leído completo: `parseBackupFile` cadena de migración, `CURRENT_SCHEMA_VERSION=11` a bumpear a 12, rechazo `>current`, `buildBackupWrapper`) — HIGH
- `src/data/schema-validator.js` (validador `categories.json` permisivo con campos extra; `payload` XOR `variants`; categoryIds conocidas) — HIGH
- `src/data/content-loader.js` (NO re-ordena `categories`; `exerciseById`/`slotById` via `normalizeExerciseToSlot`) — HIGH
- `src/screens/app.js` (`categoriesForDisplay` itera array sin sort; `applyImmediateFailure` en líneas 1642 y 1969 = 2 call-sites) — HIGH (grep + lectura)
- `content/categories.json` (10 entradas, array = orden display) — HIGH
- `content/exercises/presente-regolare.json` (top-level `{notes, exercises}`, slots `{id,type,categoryIds,explanation,variants,validation}`, cruces 300..303 con avere/essere) — HIGH
- `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS`, `slotCountOf`), `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs` (`TOTAL_EXPECTED`, `TOTAL_EXPECTED_BASELINE`), `tests/domain.test.js` (`loadAllExerciseFiles` readdir) — HIGH
- `.planning/PROJECT.md` §Current Milestone v1.9 + §Recently Validated (v1.5/v1.6/v1.7 reset-selectivo/lockstep precedents) — HIGH
- `.planning/milestones/v1.7-ROADMAP.md` (Phase 29→30→31: migración→alta→cruces+lockstep, precedente directo) — HIGH
