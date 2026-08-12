# Phase 42: `fare-congiuntivo` — 4 slots (homógrafas + disparador) - Pattern Map

**Mapped:** 2026-08-06
**Files analyzed:** 4 (2 nuevos, 2 modificados)
**Analogs found:** 4 / 4 (todos exactos — Phase 41 es el molde literal)

## File Classification

| New/Modified File | Rol | Data Flow | Análogo más cercano | Match |
|---|---|---|---|---|
| `content/exercises/fare-congiuntivo.json` — NEW | content (datos de dominio, JSON a mano) | file-I/O read-only (fetch en boot vía `content-loader.js`) | `content/exercises/fare-indicativo.json` (Phase 41, 2026-08-04) | exact |
| `content/categories.json` — MODIFY (append 1) | config / registry | file-I/O read-only, prerequisito de schema | su propia última entrada (`fare-indicativo`, order 15) | exact |
| `tests/exercise-types.test.js` — MODIFY (1 línea + comentario) | test (smoke paramétrico) | batch sobre array de ficheros | líneas 1292-1293 (entrada de `fare-indicativo`) | exact |
| `tests/content-fare-congiuntivo.test.js` — NEW | test (invariantes de categoría) | batch / assertions sobre JSON parseado | `tests/content-fare-indicativo.test.js` (682 líneas, 12 `describe`) | exact |

No hay ningún fichero de `src/` en la lista: el motor v1.4 no se toca (`git diff src/screens/app.js src/domain/ src/data/` debe quedar vacío al cierre).

---

## Pattern Assignments

### `content/exercises/fare-congiuntivo.json` (content, file-I/O)

**Análogo:** `content/exercises/fare-indicativo.json`

**Forma top-level exacta** (línea 1-3): exactamente 2 claves, `notes` primero y `exercises` después.

```json
{
  "notes": "Categoría fare-indicativo (order 15) nacida DIRECTAMENTE en slot+variantes, clon del patrón v1.7/v1.9 de presente-regolare, modali, possessivi y riflessivi, NUNCA legacy payload. …",
  "exercises": [ … ]
}
```

**Key set exacto del slot** — 6 claves, ni una más (congelado por el test del análogo, `content-fare-indicativo.test.js:208-219`):

```
['categoryIds', 'explanation', 'id', 'type', 'validation', 'variants']
```

**Key set exacto de la variante** — 3 claves:

```
['correctIndex', 'options', 'prompt']
```

**Excerpt literal de slot MC** (`fare-indicativo.json:4-21`, primer slot, primera variante):

```json
{
  "id": "fare-indicativo-presente",
  "type": "multiple-choice",
  "categoryIds": [
    "fare-indicativo"
  ],
  "explanation": "El presente de indicativo de fare es irregular y reparte dos raíces entre las seis personas: io faccio, tu fai, … ",
  "variants": [
    {
      "prompt": "Io ___ i compiti ogni giorno.",
      "options": [
        "faco",
        "faccio",
        "facio",
        "fanno"
      ],
      "correctIndex": 1
    }
  ],
  "validation": { "status": "…", "passes": [ … ] }
}
```

Nótese: `type` es siempre el string `"multiple-choice"`; `options` tiene exactamente 4 entradas sin duplicados; `correctIndex` es un índice, no un string; el hueco es el literal `___` (tres underscores) dentro del `prompt`; el pronombre sujeto va explícito y en el orden de persona io/tu/lui-lei/noi/voi/loro por índice de variante.

**Shape exacto de `validation.passes[]`** (`fare-indicativo.json`, slot `fare-indicativo-presente`) — 4 claves por pase: `by`, `date`, `verdict`, `concerns` (array, puede estar vacío):

```json
"validation": {
  "status": "validated",
  "passes": [
    {
      "by": "claude-opus-5",
      "date": "2026-08-04",
      "verdict": "correcta",
      "concerns": [
        "[D-41-05 NO-gloss] SIN gloss ES en este slot: el espanol mapea 1:1 la casilla (hago / haces / hace), asi que cualquier gloss sobre el verbo regala el tiempo — leak R1 directo …"
      ]
    },
    {
      "by": "claude-sonnet-5",
      "date": "2026-08-04",
      "verdict": "correcta",
      "concerns": []
    }
  ]
}
```

Reglas que el shape impone y que el planner debe respetar:
- `validation` es **por slot**, no por variante — el `status` de un slot lo deriva `deriveStatus(passes)` de `src/data/validation-state.js`. La expresión «validada 1-por-1» de CONTEXT.md se refiere al *procedimiento* de quórum (un subagent fresh por variante, VAL-03), no a un objeto `validation` por variante: el trail se agrega en el slot.
- `by` = el modelo **realmente resuelto** (`claude-opus-5`, `claude-sonnet-5`, `deepseek-…`), no el ID pinneado de la skill.
- Un pase `correcta` **sí admite** `concerns` declarativas (precedente literal arriba). No hace falta bajar a `disputed` para dejar audit trail.
- Escribir `"status": "validated"` a mano sin ≥2 pases `correcta` de ≥2 `by` distintos rompe el bloque 11 del test análogo.
- Mientras se autora, `passes: []` con `status: "pending"` es verde en el test de categoría (y solo `VAL_07_STRICT=1` lo pone rojo).

**Estilo de `notes`** — el patrón literal a replicar: **un solo string en prosa, gigantesco** (el de `fare-indicativo` son ~8.000 palabras en una sola línea de JSON), en español acentuado RAE, plain text, sin markdown ni saltos de línea, con secciones marcadas en MAYÚSCULAS dentro del propio texto y cada gate declarado con su «por qué» y su audit trail. Marcadores usados por el análogo, a clonar semánticamente en Phase 42:

`0-GLOSS por decisión D-41-05: …` · `0-MATCH por decisión D-41-13 y DESIGN RULE D-04: …` · `0-WORD-BUTTONS por decisión D-41-13: …` · `BLACKLIST DE FORMAS ATESTIGUADAS (D-41-08) con audit trail: 'fo' es toscano-arcaico por faccio, …` · `SCOPE-GATE (HARD, D-41-06) de perífrasis y modismos: …` · `Nota de escaneo: todas las comprobaciones de ausencia … se hacen SIEMPRE por campo, sobre prompt y sobre options, y NUNCA sobre el fichero completo, porque este notes las nombra a propósito y un grep de fichero entero se auto-invalidaría.` · `Nota de count-sync: … son de Phase 44 e INT-02.` · y las **correcciones de autoría posteriores** con su fecha (`AUXILIAR EN FUTURO ANTERIORE RETIRADO …, corrección de autoría del 2026-08-03 con audit trail: …`).

Nótese que dentro de `notes` las formas italianas citadas van entre apóstrofes ASCII (`'fo'`, `'fé'`), y que el test análogo lo **exige en positivo** (`CONTENT.notes.includes(\`'${f}'\`)`, línea 374-385): la blacklist de D-42-11 debe nombrarse con ese mismo formato de comillas o el gate equivalente de Phase 42 no la encontrará.

Gates que el `notes` de Phase 42 debe declarar (de CONTEXT.md): no-correferencia de sujetos (D-42-06), 0-gloss del verbo **con** la excepción del gloss léxico de conjunción (D-42-13), blacklist ampliada (D-42-11, incluidos `facci`, `facciam`, los sustantivos `faccia`/`facce`/`facciate`, y el condizionale/imperativo de Phase 43), SCOPE-GATE del objeto literal heredado, 0-match / 0-wb, el hand-off del magnet del imperativo a Phase 43 (D-42-15), y la nota de escaneo por campo.

---

### `content/categories.json` (config / registry)

**Análogo:** su propia última entrada. Fichero completo = 19 líneas, **15 entradas**, `order` 1-15, JSON con columnas alineadas a mano.

Última entrada actual (línea 17) y forma exacta de las 4 claves (`id`, `name`, `order`, `origen`):

```json
    { "id": "riflessivi",              "name": "Verbi riflessivi (mi chiamo/si alza)",      "order": 14, "origen": "ia-quorum" },
    { "id": "fare-indicativo",         "name": "Fare — indicativo (faccio/feci/ho fatto)",  "order": 15, "origen": "ia-quorum" }
```

Append de Phase 42 → la línea 17 recibe coma final y se añade la 16ª manteniendo la alineación de columnas y el patrón de `name` `"Fare — <modo> (<3 formas ejemplo>)"` con **raya em U+2014**, p. ej. `"Fare — congiuntivo (faccia/facessi/abbia fatto)"`. Las 10 primeras entradas **no** llevan `origen`; desde `dimostrativi` (order 11) todas llevan `"origen": "ia-quorum"` — la nueva también (PROV-01).

**Por qué no es cosmético** — `src/data/schema-validator.js:133-146`:

```javascript
      // categoryIds: array no vacío, referencias conocidas
      if (!Array.isArray(ex.categoryIds) || ex.categoryIds.length === 0) {
        push(file, ex.id, '"categoryIds" debe ser array no vacío');
      } else {
        for (const cid of ex.categoryIds) {
          …
          if (!knownCategoryIds.has(cid)) {
            push(file, ex.id, `referencia a categoría desconocida: "${cid}"`);
          }
        }
      }
```

Es decir: `content/exercises/fare-congiuntivo.json` **no puede estar en disco sin la entrada** — cualquier slot con `categoryIds: ["fare-congiuntivo"]` produce un error de schema. Consecuencia de orden de ejecución: la entrada de `categories.json` va en el **primer** commit del Plan 42-01, antes o junto al primer slot.

---

### `tests/exercise-types.test.js` (test, batch)

**Análogo:** líneas 1292-1293 del propio fichero. Array `CATEGORIES_WITH_EXPLANATIONS` declarado en la **línea 1273**, cerrado en la 1295.

Forma exacta a apendizar tras la línea 1293 (comentario de fase + 1 línea con `expected` **dinámico**, nunca número mágico — D-31-06):

```javascript
  // v2.0 Phase 41 (IND-01..IND-06): fare-indicativo, 8 slots x 6 personas.
  { file: 'content/exercises/fare-indicativo.json', expected: slotCountOf('content/exercises/fare-indicativo.json') },
  // ← AQUÍ: v2.0 Phase 42 (CONG-01..CONG-04): fare-congiuntivo, 5 slots (4 del paradigma + disparador).
  { file: 'content/exercises/fare-congiuntivo.json', expected: slotCountOf('content/exercises/fare-congiuntivo.json') },
```

Helper ya existente (líneas ~1266-1271), cero infra nueva:

```javascript
const slotCountOf = (relFile) =>
  JSON.parse(readFileSync(resolve(__explCountDir, '..', relFile), 'utf-8')).exercises.length;
```

**Reuso en el gate D-VAL-18** (~línea 1429) — la misma línea activa el gate de VAL-07 sin tocar nada más:

```javascript
describe('VAL-07 — todos los ejercicios validated (Phase 10 close gate)', {
  skip: VAL_07_STRICT ? false : 'feature flag VAL_07_STRICT=1 no activado (esperado durante Phase 9)'
}, () => {
  for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS) {
```

Ojo: la línea 1294 es un comentario de cobertura editorial que cierra el array — el append va **antes** de él, o justo detrás de la 1293.

---

### `tests/content-fare-congiuntivo.test.js` (test, batch)

**Análogo:** `tests/content-fare-indicativo.test.js` — 682 líneas, **12 bloques** `describe` (el `code_context` de CONTEXT.md dice 11; el conteo real en disco es 12, porque el bloque 7 son dos `describe` separados, simples y compuestos).

**Cabecera y setup** (líneas 1-43) — patrón exacto a clonar, incluida la ADVERTENCIA DE ESCANEO:

```javascript
// ADVERTENCIA DE ESCANEO (heredada de 41-01, no negociable): todos los
// escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]` — y NUNCA sobre el fichero
// completo ni sobre `notes`. El `notes` de la categoria NOMBRA a proposito
// cada forma de la blacklist y cada perifrasis excluida, con su audit trail,
// asi que un grep de fichero entero se auto-invalidaria …

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { deriveStatus } from '../src/data/validation-state.js';

const CONTENT = JSON.parse(
  readFileSync(new URL('../content/exercises/fare-indicativo.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];
```

Nótese: comentarios del test **sin acentos** (a diferencia del contenido, que va acentuado RAE); `assert` estricto; `new URL(..., import.meta.url)` para las rutas; `deriveStatus` importado del código real, no reimplementado.

**Helpers de recorrido** (líneas 180-181) — la base del escaneo por campo:

```javascript
const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));
const allVariants = () => SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));
```

**Idioma del escaneo por campo** (el punto crítico) — todas las assertions de AUSENCIA construyen el conjunto de campos y filtran, nunca miran `CONTENT` como texto (líneas 308-316, 348-357):

```javascript
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
```

```javascript
    for (const { slot, v, k } of allVariants()) {
      for (const o of v.options) {
        const sucio = o.split(' ').filter((p) => ATESTIGUADAS.has(p));
        assert.deepEqual(sucio, [], `D-41-08: … la opcion "${o}" contiene la forma atestiguada ${sucio.join(', ')}`);
      }
    }
```

Patrón de assertion en todo el fichero: `assert.deepEqual(sucio, [], mensaje)` en vez de `assert.ok(sucio.length === 0)` — el array vacío hace que el diff del fallo **liste las ofensoras**. Y todo mensaje cita la decisión (`D-41-08: …`) y la coordenada `${slot.id}#${k}`.

**La única excepción documentada al escaneo por campo**: el escaneo *en positivo* sobre `notes` y `explanation`, que es lo contrario de una ausencia (líneas 374-385) — se exige que el audit trail exista:

```javascript
    for (const f of BLACKLIST) {
      assert.ok(CONTENT.notes.includes(`'${f}'`), `D-41-08: el notes no documenta la forma ${f}`);
    }
```

**Los 12 `describe` del análogo, y su traducción a Phase 42:**

| # | `describe` del análogo (línea) | Qué congela | Traducción a Phase 42 |
|---|---|---|---|
| 1 | `estructura y conteos (D-41-01, D-41-13, D-41-14)` (187) | 2 claves top-level; los 8 ids en orden de disco; `type === 'multiple-choice'` en todos; 6 variantes por slot y 48 total; key set de slot y de variante; ningún id con sufijo `/-\d{3}$/` | 5 ids, 6 variantes, **30** total, MC-only, espacio `-300`+ libre |
| 2 | `paradigma completo, 48 keys` (232) | `CANON[id]` = las 6 keys en orden de persona, sin repetición | **el CANON de Phase 42 SÍ repite key dentro del slot** (`faccia`×3, `abbia fatto`×3, `facessi`×2, `avessi fatto`×2) → el assert `new Set(keys).size === 6` de la línea 237 **NO se puede clonar**; se sustituye por `deepEqual(keys, CANON[id])` y, para las homógrafas, por el gate de D-42-07 (disparador distinto + objeto distinto + distractoras distintas por variante) |
| 3 | `eje de persona con pronombre explicito (D-41-07)` (246) | hueco `___` en los 48; **exactamente un** pronombre por prompt; el pronombre de la variante k es el de la persona k | clonable en los 4 slots del paradigma. **Cuidado en el slot del disparador y con D-42-06:** la no-correferencia obliga a sujetos explícitos distintos en la principal (`Lui pensa che io faccia…`), así que «exactamente 1 pronombre por prompt» es FALSO por diseño en varias de las 30 — el gate correcto es «el último/el del subordinado es el de la persona k» o bien exigir disparador impersonal, no un conteo de 1 |
| 4 | `0-gloss en los 48 prompts (D-41-05)` (277) | ningún prompt lleva paréntesis; ningún prompt menciona `/espa/i` | **desviación declarada de Phase 42**: D-42-13 permite el gloss léxico de la conjunción, que va entre paréntesis. El gate se reescribe: los paréntesis solo pueden contener uno del set cerrado de glosas de conjunción (`aunque`, `siempre que`, `antes de que`, `a pesar de que`) y nunca aparecer junto a una forma de `fare`/`avere` |
| 5 | `SCOPE-GATE lexico de perifrasis (D-41-06)` (307) | ninguna perífrasis en `prompt`/`options`; cada prompt lleva un objeto del conjunto cerrado de 7 | clonable literal (el conjunto de 7 objetos es el mismo, heredado) |
| 6 | `blacklist de formas atestiguadas (D-41-08)` (332) | blacklist corta en `options`; blacklist completa palabra a palabra; formas de otro modo; participio concordado `/\bfatt[aie]\b/`; audit trail en `notes` en positivo | la blacklist de Phase 42 **quita** `faccia`/`facciate`/`facciano`/`facessi`/`facesse` (son keys aquí) y **añade** `facci`, `facciam`, `facce`, y el condizionale/imperativo (`farei` y familia, `fa'`) |
| 7a/7b | `patron de distractoras de los 4 simples (D-41-09)` (392) y `de los 4 compuestos (D-41-10)` (410) | 4 opciones sin duplicados, key una sola vez, y el conteo exacto por familia (1 otra-persona + 2 inexistentes; 2 aux-swap + 1 malformada) | 3 patrones en vez de 2: D-42-10 (`presente`/`imperfetto`: 1 indicativo de esa persona + 1 subjuntivo de otra persona + 1 raíz inventada), D-42-09 (`passato`/`trapassato`: **cero indicativo**, las 3 son subjuntivo de esa persona), D-42-12 (disparador: las 4 casillas modo × tiempo, **ninguna inventada**) |
| 8 | `marcos disjuntos … (D-41-11)` + `marco temporal propio por variante (D-41-02)` (460, 493) | tabla `FRAMES` con el marco literal de cada variante, los 6 distintos por slot | Phase 42: tabla de **disparadores** por variante (los 6 distintos por slot, D-42-07) y de marcos de concordancia en los compuestos (D-42-02) |
| 9 | `marco sintactico del trapassato remoto` (509) | exactamente 1 conector por prompt, reparto 2+2+2, la principal no duplica el verbo examinado, la explanation acota el marco | Phase 42: el gate del slot disparador (los 6 disparadores, exactamente 1 por prompt, la variante `so che` → `fa` única, y `se` hipotético con principal en condizionale de un verbo **que no es `fare`**, D-42-16) |
| 10 | `canon editorial e higiene del JSON (D-41-17, T-41-01)` (557) | walk recursivo de strings/claves; sin `<`, `>`, `&#`, `javascript:`; sin smart quotes `[‘’“”]`; sin `__proto__`/`constructor`/`prototype`; explanations no vacías y con `/[áéíóúñÁÉÍÓÚÑ]/` | clonable literal (5 explanations en vez de 8) |
| 11 | `coherencia del audit trail de validacion (D-41-15, T-41-03)` (601) | `validation` con `status` string y `passes` array; `status === deriveStatus(passes)`; si `validated` → ≥2 `correcta` + ≥2 `by` + 0 `incorrecta`; los slots de ronda EXTRA llevan un `by` que empieza por `deepseek` | clonable; `EXTRA_ROUND_SLOTS` de Phase 42 = los slots que contienen las 10 homógrafas (`presente`, `imperfetto`, `passato`, `trapassato`) por D-42-08 |
| 12 | `registro de la categoria (D-41-16, SC-5)` (654) | la entrada existe con las 4 claves exactas, `order` y `origen`; **es la última del array**; los slots referencian el slug | clonable con `order: 16`; el assert «es la última del array» (línea 670) es correcto hoy y se pondrá rojo cuando Phase 43 apende la 17ª — es el patrón heredado, se mantiene |

Excerpt del gate condicionado de ronda extra (líneas 637-647), el idioma «exige solo si ya está validated»:

```javascript
    for (const id of EXTRA_ROUND_SLOTS) {
      const s = byId(id);
      if (s.validation.status !== 'validated') continue;
      const bys = s.validation.passes.map((p) => String(p.by || '').toLowerCase());
      assert.ok(bys.some((b) => b.startsWith('deepseek')), `D-41-12: ${id} esta validated sin la ronda EXTRA obligatoria …`);
    }
```

Y el comentario de las líneas 602-608 explica por qué el bloque 11 es **verde con `passes: []`** — el test no exige que la categoría esté validada (eso es `VAL_07_STRICT`), impide que un `validated` escrito a mano pase por bueno. Phase 42 clona esa semántica: los tests pueden entrar en verde antes de que corra el quórum top-level.

---

## Shared Patterns

### Slug byte-a-byte (contrato de Phase 40)
**Fuente:** `src/data/storage.js:1345`
**Aplica a:** el nombre de fichero, el `id` de `categories.json`, el prefijo de todos los ids de slot.

```javascript
const RESET_PREFIXES_V13 = ['fare-indicativo', 'fare-congiuntivo', 'fare-cond-imperativo', 'fare-indefiniti'];
```

**VERIFICADO:** `'fare-congiuntivo'` ya está ahí (Phase 40 shippeada), y el comentario de las líneas 1300-1312 declara los 4 strings como vinculantes para Phases 41-44. Phase 42 **no toca** este fichero; solo debe usar el slug exacto. El comentario también fija (D-40-07) que los cruces de Phase 44 viven en `fare-congiuntivo-300`+ con `categoryIds: ["fare-congiuntivo", "<slug legacy>"]` y el de `fare` primero — de ahí el gate de «ningún id con sufijo de 3 cifras».

### Motor axis-agnostic (cero código nuevo para el 5º slot)
**Fuente:** `src/domain/session.js:232`
**Aplica a:** el slot `fare-congiuntivo-disparador` (D-42-01).

```javascript
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  if (n <= 1) return 0;
  return Math.min(n - 1, Math.floor(rng() * n)); // clamp guards rng()===1.0
}
```

**CONFIRMADO axis-agnostic:** la función solo lee `slot.variants.length` y devuelve un índice uniforme. No sabe nada del *significado* del eje. Un slot cuyo eje de variante es «el disparador» en vez de «la persona» funciona sin una línea nueva, exactamente igual que los 4 de eje-persona. El docblock la declara además `Pure` (no lee de `../data/*`).

### Registro de categoría = prerequisito de schema
**Fuente:** `src/data/schema-validator.js:133-146` (excerpt arriba)
**Aplica a:** el orden de ejecución de los planes — la entrada de `categories.json` primero.

### Canon editorial
**Fuente:** `content/exercises/fare-indicativo.json` (`notes` + las 8 `explanation`) y los bloques 10 y 4 del test análogo.
**Aplica a:** los 30 prompts, las 5 explanations y el `notes`.

Español acentuado RAE (un flag C4-accent del quórum sobre español sin tildes es bug **REAL**, se arreglan los acentos, no se hace override); apóstrofes ASCII U+0027 y cero smart quotes; plain text sin markdown; italianismos en ortografía italiana; sin `<`, `>`, `&#`, `javascript:`; sin leak R1 de regla/persona/desinencia en el prompt.

---

## No Analog Found

Ninguno. Los 4 ficheros tienen análogo exacto y shippeado. Las tres **desviaciones deliberadas** respecto del análogo (no son huecos de patrón, son decisiones de CONTEXT.md que el planner debe escribir explícitamente):

| Desviación | Decisión | Consecuencia |
|---|---|---|
| Keys repetidas dentro de un slot (`faccia`×3) | D-42-05 / D-42-07 | el assert `new Set(keys).size === 6` del bloque 2 del análogo NO se clona |
| Gloss léxico entre paréntesis en el prompt | D-42-13 | el assert «ningún prompt lleva paréntesis» del bloque 4 se reescribe a set cerrado de glosas |
| Un prompt puede llevar 2 pronombres sujeto | D-42-06 (no-correferencia) | el assert «exactamente 1 pronombre» del bloque 3 se reescribe |

---

## Metadata

**Estado del codebase verificado (2026-08-06):**

| Hecho | Valor verificado |
|---|---|
| Entradas en `content/categories.json` | **15** (order 1-15, última `fare-indicativo`); fichero de 19 líneas |
| Ficheros en `content/exercises/*.json` | **15** |
| Slots en disco (suma de `exercises.length`) | **233** |
| `'fare-congiuntivo'` en `RESET_PREFIXES_V13` | **SÍ** (`src/data/storage.js:1345`) |
| `CATEGORIES_WITH_EXPLANATIONS` | declarado en `tests/exercise-types.test.js:1273`, cerrado en 1295, última entrada en 1293; reusado por el gate D-VAL-18 (~1429) |
| `content/exercises/fare-indicativo.json` | 739 líneas, 8 slots, todos `validated` |
| `tests/content-fare-indicativo.test.js` | 682 líneas, 12 `describe` |
| Comando de test | `node --test tests/*.test.js` — **el glob es obligatorio**, el path desnudo `tests/` falla en Node 22.20. Marcador honesto de la fase: `VAL_07_STRICT=1 node --test tests/*.test.js` |

**Analog search scope:** `content/exercises/`, `content/`, `tests/`, `src/data/`, `src/domain/`
**Pattern extraction date:** 2026-08-06
