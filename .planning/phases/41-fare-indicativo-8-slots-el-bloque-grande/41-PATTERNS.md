# Phase 41: `fare-indicativo` — 8 slots (el bloque grande) - Pattern Map

**Mapped:** 2026-08-03
**Files analyzed:** 5 (1 new, 4 modified)
**Analogs found:** 5 / 5 (todos exactos — es una fase de contenido con molde shipeado)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `content/exercises/fare-indicativo.json` (NEW) | content/data (JSON de categoría, slot+variantes) | file-I/O (fetch en boot) | `content/exercises/riflessivi.json` | exact (mismo molde v1.9, misma `notes` con gates) |
| `content/categories.json` (MOD, append 1) | config/registry | file-I/O | línea 16 del propio fichero (`riflessivi`, order 14) | exact |
| `tests/exercise-types.test.js` (MOD, +1 línea) | test (smoke paramétrico editorial) | batch (itera array de ficheros) | línea 1291 (`riflessivi`) | exact |
| `scripts/run-validation-271.mjs` (MOD, +1 línea — **DIFERIDO a Phase 44 / INT-02**) | script/reporter (gate VAL-04/VAL-06) | batch | línea 185 (`riflessivi`) | exact |
| `tests/fixtures/slot-variants-integration.test.js` (MOD, +1 línea — **DIFERIDO a Phase 44**) | test (back-compat SLOT-06) | batch | línea 184 (`riflessivi`) | exact |

Nota: `tests/domain.test.js` **no se toca** — auto-descubre `content/exercises/*.json` con `readdirSync` (`tests/domain.test.js:16,225`) y valida el bundle completo (`tests/domain.test.js:322-341`). El fichero nuevo entra ahí **gratis**, pero eso significa que **un error de schema en `fare-indicativo.json` rompe `domain.test.js` inmediatamente** (ver §Contrato de schema).

---

## Pattern Assignments

### `content/exercises/fare-indicativo.json` (content, slot+variantes MC-only)

**Analog:** `content/exercises/riflessivi.json` (478 líneas, 7 slots, Phase 38)
**Analog secundario (MC-only, 0-match):** `content/exercises/possessivi.json` (428 líneas, 7 slots, todos `multiple-choice`, 2-4 variantes cada uno)

#### Shape top-level (`riflessivi.json:1-3`)

```json
{
  "notes": "…",
  "exercises": [ … ]
}
```

Exactamente dos claves. Nada más (ni `version`, ni `category`).

#### Shape EXACTO de un slot MC — verbatim, `riflessivi.json:4-68`

Campos a **nivel de slot**: `id`, `type`, `categoryIds`, `explanation`, `variants`, `validation` (ese orden literal).
Campos a **nivel de variante**: SOLO `prompt`, `options`, `correctIndex`. Nada más — sin `explanation` propia, sin `id`, sin `validation`.

```json
{
  "id": "riflessivi-presente",
  "type": "multiple-choice",
  "categoryIds": [
    "riflessivi"
  ],
  "explanation": "Los verbos reflexivos italianos (chiamarsi, svegliarsi) llevan un pronombre reflexivo que cambia con la persona y va SIEMPRE delante del verbo conjugado: io mi, tu ti, lui/lei si, noi ci, voi vi, loro si. […] Las distractoras mezclan un pronombre de otra persona (si con io) o el orden invertido (verbo antes del pronombre), ambos errores típicos.",
  "variants": [
    {
      "prompt": "Io ___ Marco. (en español: yo me llamo)",
      "options": [
        "mi chiamo",
        "ti chiami",
        "si chiama",
        "chiamo mi"
      ],
      "correctIndex": 0
    }
  ],
  "validation": { "…": "ver abajo" }
}
```

**Importante para D-41-05 (0-gloss):** el `(en español: …)` de `riflessivi-presente` es precisamente lo que Phase 41 NO lleva. El precedente de **slot sin gloss** vive en el mismo fichero: `riflessivi-pp-concordanza` (`riflessivi.json:193-233`) — 4 variantes, `"prompt": "Ieri Marco ___ molto presto."`, cero gloss, y el **por qué** documentado dentro de su propio `validation.concerns` (`riflessivi.json:245`):

```
"[D-38-01 NO-gloss] SIN gloss ES en este slot: el espanol (me he despertado) no concuerda el participio; un gloss confundiria. R1 sin leak (no se nombra la terminacion ni la regla)."
```

→ Copiar ese patrón: **el 0-gloss se declara en `notes` (global) Y se re-declara por slot dentro del `concerns` del pase Opus**. Es el audit trail que impide que una pasada futura "arregle" el 0-gloss.

`possessivi-concordanza` (`possessivi.json`, primer slot) confirma el mismo shape MC sin gloss con 3 variantes.

#### Shape EXACTO de `validation` — verbatim, `riflessivi.json:43-67`

```json
"validation": {
  "status": "validated",
  "passes": [
    {
      "by": "claude-opus-4-8",
      "date": "2026-07-01",
      "verdict": "correcta",
      "concerns": [
        "[R1-R7] sin leak: prompt = frase + hueco + gloss ES R7 (desambigua la persona); la regla vive en explanation. Distractoras plausibles: …"
      ]
    },
    {
      "by": "deepseek-reasoner",
      "date": "2026-07-01",
      "verdict": "correcta",
      "concerns": []
    },
    {
      "by": "claude-sonnet-4-6",
      "date": "2026-07-01",
      "verdict": "correcta",
      "concerns": []
    }
  ]
}
```

Claves de un pase: exactamente `by`, `date`, `verdict`, `concerns` (array, **siempre presente**, `[]` si no hay nada).
`status` debe ser coherente con `deriveStatus(passes)` (`src/data/validation-state.js:34-39`):
- cualquier `verdict: "incorrecta"` → `disputed` **sticky** (línea 34-35)
- `≥2 correctas` **con `by` distintos** (`Set.size >= 2`) y cero incorrectas → `validated` (líneas 37-39)
- todo lo demás → `pending`

**Ronda extra DeepSeek (D-41-12) — precedente literal:** el MAGNET `riflessivi-pp-concordanza` lleva **4 pases** (`riflessivi.json:237-266`): `claude-opus-4-8` (con 3 concerns detallados de audit), `deepseek-chat`, `deepseek-reasoner`, `claude-sonnet-4-6`. Ese es el shape a replicar en los 12 variantes de `passato remoto` + `trapassato remoto`.
Los slots sin ronda extra van a 3 pases (`riflessivi.json:43-67`) o 2 (`possessivi-concordanza`: opus + sonnet).

#### `notes` con decisión-de-omisión — verbatim, `riflessivi.json:2`

Un **único string en prosa**, sin markdown, sin saltos de línea, con este esqueleto de 5 movimientos:

1. **Identidad + linaje:** `"Categoría riflessivi (order 14) nacida DIRECTAMENTE en slot+variantes (clon de presente-regolare/modali, patrón v1.7 + Phases 36/37), NUNCA legacy payload."`
2. **La omisión, en MAYÚSCULAS, con el decision-id y el razonamiento:** `"0-MATCH por decisión D-04/D-38-03: el pareo pronombre<->persona (mi<->io, ti<->tu, si<->lui) es una asociación MECÁNICA derivable en cuanto se conoce el paradigma; un match mi<->io sería 'arrastrar sin pensar' exactamente lo que D-04/R3 prohíben […]"`
3. **El cierre explícito anti-inercia:** `"El 0-match aquí es decisión, no omisión."`
4. **El SCOPE-GATE, etiquetado HARD y con cita de líneas del CONTEXT:** `"SCOPE-GATE (HARD, CONTEXT líneas 24-28): los reflexivos RECÍPROCOS ('si amano', 'ci scriviamo') quedan FUERA de scope […]; NINGUNA variante los contiene."` + la **frontera** con lo que SÍ es in-scope: `"El passato prossimo reflexivo SÍ es IN scope (REFLEX-04, el MAGNET …) y NO se confunde con el scope-gate de recíprocos."`
5. **Nota de count-sync con la fase que lo cierra:** `"Nota de count-sync: la sincronización de los 3 arrays de conteo + TOTAL_EXPECTED + baseline y el campo origen/PROV-01 son de Phase 39 (rojo esperado hasta entonces)."`

→ Phase 41 instancia ese mismo esqueleto 5 veces sobre: **0-gloss (D-41-05)**, **0-match (D-41-13)**, **0-word-buttons (D-41-13)**, **blacklist de arcaísmos con audit trail (D-41-08: `fo`/`fé`/`fenno`/`facea`/`fan` — qué forma, por qué está atestiguada, por qué no se usa)**, **gate léxico de perífrasis (D-41-06)**, **marcos disjuntos pr↔pp (D-41-11)**, y el count-sync apuntando a **Phase 44 / INT-02**.

Nótese que `riflessivi.json:2` usa acentos RAE (`categoría`, `sería`, `sincronización`) en `notes` y `explanation`, pero los `concerns` de los pases están **sin acentos** (`explicitamente`, `espanol`) — asimetría real del fichero; el canon acentuado (D-41-17, `[[explanations_must_be_accented]]`) es exigible en `notes`/`explanation`, no en el audit trail de `concerns`.

#### Patrón fijo de distractoras (D-41-09 / D-41-10)

**Analog:** `content/exercises/essere.json` → `essere-sono` (primer slot). La explanation **nombra la distractora y por qué es trampa**:

```
"Cuidado con la distractora 'ho': pertenece al verbo avere, que en italiano se reserva para posesión (Io ho una macchina), no para identidad."
```

**Analog más cercano al patrón cross-slot de Phase 41:** `riflessivi-pp-concordanza` (`riflessivi.json:196-231`) — las 4 variantes usan el **mismo molde de 4 opciones** (key + 2 concordancias mal + 1 auxiliar prohibido), y la última frase de la explanation (`riflessivi.json:192`) nombra las dos trampas. Copiar: cada slot de `fare-indicativo` cierra su explanation nombrando su par de distractoras (raíz equivocada / persona ajena en los simples; auxiliar en otro tiempo / forma mal construida en los compuestos).

---

### `content/categories.json` (config/registry, append 1 entrada)

**Analog:** `content/categories.json:16` (la propia última línea).

Estado actual verbatim (`content/categories.json:1-18`, 14 entradas, alineación por columnas a mano):

```json
    { "id": "modali",                  "name": "Verbi modali (potere/volere/dovere)",       "order": 13, "origen": "ia-quorum" },
    { "id": "riflessivi",              "name": "Verbi riflessivi (mi chiamo/si alza)",      "order": 14, "origen": "ia-quorum" }
  ]
}
```

Edición de Phase 41: añadir coma a la línea 16 y una línea 17 con las **4 claves exactas** `id`, `name`, `order`, `origen` (D-41-16), respetando el padding de columnas:

```json
    { "id": "fare-indicativo",         "name": "Fare — indicativo (faccio/feci/ho fatto)",  "order": 15, "origen": "ia-quorum" }
```

`origen` solo acepta `"ia-quorum"` | `"apuntes-profesora"` (enum PROV-01, cubierto por `tests/schema-validator-origen.test.js:25-52`; un typo → `ok:false`). Las entradas 1-10 no llevan `origen` (ausencia = válida).

---

### `tests/exercise-types.test.js` (test, smoke paramétrico editorial)

**Analog:** línea 1291 (la entrada de `riflessivi`).

`CATEGORIES_WITH_EXPLANATIONS` se declara en **`tests/exercise-types.test.js:1273-1293`**, con el helper `slotCountOf` en **1268-1271** (lee `exercises.length` del JSON real en disco — D-31-06 dynamic-count, NUNCA número mágico):

```js
const slotCountOf = (relFile) =>
  JSON.parse(readFileSync(resolve(__explCountDir, '..', relFile), 'utf-8')).exercises.length;
```

Edición mínima (1 línea, patrón D-144 / EXPL-08 — cero código de test nuevo):

```js
  // v2.0 Phase 41 (IND-01..IND-06): fare-indicativo, 8 slots x 6 personas.
  { file: 'content/exercises/fare-indicativo.json', expected: slotCountOf('content/exercises/fare-indicativo.json') },
```

Con `expected` dinámico, esa línea es **auto-consistente** — no hay rojo posible por count aquí, a diferencia de los dos arrays diferidos.

Esa única línea activa **7 sub-tests** por categoría, todos ya escritos:

| Sub-test | Línea | Qué exige de `fare-indicativo.json` |
|---|---|---|
| `N/N ejercicios con explanation válida` | 1317-1334 | `explanation` string no vacío en los 8 slots (acceso shape-aware vía `getExplanation`, 1301-1302) |
| `apóstrofes ASCII (CONT-06 / D-129)` | 1336-1347 | cero `‘’“”` en las explanations → D-41-17 apóstrofes U+0027 |
| `plain text (no markdown — D-126)` | 1349-1363 | cero `**`, `__`, `##`, backtick |
| `prompt sin leak de regla/solución (R1)` | 1367-1384 | el regex de 1373 escanea **todos** los prompts de todas las variantes (`getPrompts`, 1304-1307): prohíbe `§N`, `(regla`, `(refuerzo`, `— regla`, `— concordancia`, `— excepción`, `(D-NN`… |
| `explanation sin cross-refs técnicos (R2)` | 1388-1403 | cero `#NNN`, `mc-NNN`, `<slug>-NNN` en explanations |
| `VAL-07 — todos validated` | 1432-1448 | **solo con `VAL_07_STRICT=1`**; exige `validation.status === "validated"` en los 8 slots |

**Ojo R1 (línea 1373):** el patrón prohíbe la subcadena `— concordancia` y `— excepción` con guion largo. Las explanations de Phase 41 pueden usar esas palabras libremente; los **prompts** no deben llevar `—` seguido de esas palabras. El regex solo mira prompts para R1 y explanations para R2.

---

### Los 2 touch-points de count-sync DIFERIDOS a Phase 44 (INT-02) — rojo esperado

Localizados, no adivinados. Son **3 arrays** en total (uno ya cubierto arriba):

| # | Fichero:línea | Array | Entrada análoga |
|---|---|---|---|
| 1 | `tests/exercise-types.test.js:1273-1293` | `CATEGORIES_WITH_EXPLANATIONS` | :1291 |
| 2 | `scripts/run-validation-271.mjs:174-189` | `CATEGORIES` (ordenado **alfabéticamente por slug**) | :185 |
| 3 | `tests/fixtures/slot-variants-integration.test.js:167-186` | `REAL_CATEGORIES` | :184 |

**`scripts/run-validation-271.mjs`** — la entrada análoga verbatim (línea 185):

```js
  { slug: 'riflessivi',               file: 'content/exercises/riflessivi.json',               expected: slotCountOf('content/exercises/riflessivi.json') },
```

`TOTAL_EXPECTED` (línea 192) es **derivado**, no literal: `CATEGORIES.reduce((s, c) => s + c.expected, 0)`. El baseline-guard (líneas 204-215) compara `TOTAL_EXPECTED` con `Σ slotCountOf(c.file)` sobre `CATEGORIES` y hace `process.exit(1)` si divergen.
→ Consecuencia concreta: **mientras `fare-indicativo` esté AUSENTE de `CATEGORIES`, el guard NO falla** (ambos lados de la suma ignoran el fichero nuevo por igual). Lo que falla es el gate **VAL-06** (líneas 430-437) por discrepancia de conteo total frente a disco. Ese es el rojo esperado. `CATEGORIES` está ordenado alfabéticamente → `fare-indicativo` iría entre `essere` y `genero-numero` (líneas 179-180).

**`tests/fixtures/slot-variants-integration.test.js`** — entrada análoga (línea 184):

```js
    { slug: 'riflessivi', expected: readJson('content/exercises/riflessivi.json').exercises.length }
```

Genera 2 tests por slug (`validateContent` acepta el fichero, y el conteo no cambia) más un test de bundle conjunto (ids únicos globales).

**Precedente exacto del diferido:** Phase 38 (commit `700e492`) tocó **solo** `content/exercises/riflessivi.json` (+424 líneas, 1 fichero). El registro en `categories.json` fue un commit aparte de la misma fase (`6af53da`, order 14) y el `origen` se estampó en Phase 39 (`d1f1373`). El lockstep de los 3 arrays llegó en Phase 39 (commit `0dfdc7b`, `test(39-02): lockstep de conteos +4 cats nuevas (INT-02)`): **+8 líneas** en `exercise-types.test.js`, **+31/-...** en `run-validation-271.mjs`, **+12** en `slot-variants-integration.test.js`. Phase 41 replica ese reparto con Phase 44 en el rol de Phase 39.

---

## Shared Patterns

### Contrato de schema (lo que rompe `tests/domain.test.js` al instante)
**Source:** `src/data/schema-validator.js`
**Apply to:** cada uno de los 8 slots y las 48 variantes

| Regla | Línea | Detalle |
|---|---|---|
| `categoryIds` array no vacío, ids **conocidos** en `categories.json` | 133-141 | → la entrada de D-41-16 es **prerequisito** del schema, no cosmética |
| `payload` XOR `variants` | 148-165 | slot+variantes ⇒ **NUNCA** `payload` |
| `explanation` obligatoria a nivel de slot, string no vacío | 211-214 | `variants[]` no puede estar vacío (216-217); las variantes **no** llevan explanation propia (comentario 190-193) |
| `prompt` string que **contiene `___`** | 441-443 | las 48 variantes necesitan el hueco literal |
| `options` array de **3 o 4** strings no vacíos | 445-450 | Phase 41 usa 4 (key + 3 distractoras) |
| `correctIndex` entero en `[0, options.length)` | 452-455 | |

`tests/domain.test.js:225` auto-descubre los ficheros con `readdirSync`, y `:322-341` valida el bundle entero (`categories.json` + todos los `exercises/*.json`) exigiendo `result.errors` **vacío**. No hay que editar nada ahí, pero cualquier violación de la tabla anterior sale roja sin tocar los arrays de count.

### Quórum y estado de validación
**Source:** `src/data/validation-state.js:26-40` (`deriveStatus`)
**Apply to:** las 48 variantes → los 8 objetos `validation`
`validated` = ≥2 `correcta` con `by` distintos y **cero** `incorrecta`. Un `incorrecta` es **sticky**: no se limpia con un pase posterior (comentarios 6-11). `by` observados en disco: `claude-opus-4-8`, `claude-sonnet-4-6`, `deepseek-chat`, `deepseek-reasoner`.

### Canon editorial (D-41-17)
**Source:** `riflessivi.json:2,10,192` y `possessivi.json` slot 1
- Español acentuado RAE en `notes` y `explanation` (`está`, `también`, `así`, `Fíjate`).
- Apóstrofes ASCII U+0027; cero smart-quotes (test 1336-1347).
- Comillas simples ASCII para citar italiano dentro de la explanation: `'la sua macchina'`, `'si ha svegliato'`.
- Plain text: sin markdown, sin saltos de línea, un solo párrafo largo por slot.
- Tono D-127: 3ª persona impersonal + regla + paradigma completo + paralelo italiano-español + nombrar la trampa del hispanohablante al final. `riflessivi.json:192` es el mejor ejemplar (cita las 4 terminaciones con ejemplo cada una y cierra con las dos trampas).

### Comando de suite
`node --test tests/*.test.js` — el **glob es obligatorio**, el path desnudo falla en Node 22.20 (`[[test_command_node_glob]]`). Para el gate estricto: `VAL_07_STRICT=1 node --test tests/*.test.js`.

---

## No Analog Found

Ninguno. Los 5 ficheros tienen análogo exacto. Dos puntos sin precedente *literal*, resolubles por composición:

| Aspecto | Por qué no hay análogo exacto | Qué usar |
|---|---|---|
| 6 variantes por slot × 8 slots | el máximo en disco es 4 (`riflessivi-pp-concordanza`, `possessivi-parentela`, `modali-potere`) | el array `variants[]` no tiene tope en el schema (`schema-validator.js:216-230` solo prohíbe `[]`); escalar el mismo shape |
| `notes` con **5** declaraciones de omisión + blacklist con audit trail | `riflessivi.json:2` documenta 2 (0-match + scope-gate) | mismo string único en prosa, 5 instancias del esqueleto de 5 movimientos descrito arriba |

---

## Metadata

**Analog search scope:** `content/exercises/` (14 ficheros), `content/categories.json`, `tests/` (26 ficheros), `scripts/`, `src/data/schema-validator.js`, `src/data/validation-state.js`
**Files scanned:** ~20 (5 leídos en profundidad, resto por grep)
**Git archaeology:** commits `700e492` (Phase 38 autoría), `6af53da` (registro order 14), `d1f1373` (origen PROV-02), `0dfdc7b` (lockstep de counts Phase 39)
**Pattern extraction date:** 2026-08-03
