# Phase 43: `fare-cond-imperativo` + `fare-indefiniti` — 3 + 6 slots - Pattern Map

**Mapped:** 2026-08-07
**Files analyzed:** 6 (4 nuevos, 2 modificados)
**Analogs found:** 6 / 6 (todos exactos — Phase 42 es el molde literal, y Phase 41 el molde de Phase 42)

## File Classification

| New/Modified File | Rol | Data Flow | Análogo más cercano | Match |
|---|---|---|---|---|
| `content/exercises/fare-cond-imperativo.json` — NEW (3 slots / 17 variantes) | content (datos de dominio, JSON a mano) | file-I/O read-only (fetch en boot vía `content-loader.js`) | `content/exercises/fare-congiuntivo.json` (Phase 42, 2026-08-06, 475 líneas, 5 slots / 30 variantes, todas `validated`) | exact |
| `content/exercises/fare-indefiniti.json` — NEW (6 slots / 18 variantes) | content | file-I/O read-only | `content/exercises/fare-congiuntivo.json` (forma) + `content/exercises/riflessivi.json` → `riflessivi-pp-concordanza` (contenido del slot de participio) | exact + partial |
| `content/categories.json` — MODIFY (append 2) | config / registry | file-I/O read-only, prerequisito de schema | su propia última entrada (`fare-congiuntivo`, order 16, línea 18) | exact |
| `tests/exercise-types.test.js` — MODIFY (2 líneas + 2 comentarios) | test (smoke paramétrico) | batch sobre array de ficheros | líneas 1359-1360 (entrada de `fare-congiuntivo`) | exact |
| `tests/content-fare-cond-imperativo.test.js` — NEW | test (invariantes de categoría) | batch / assertions sobre JSON parseado | `tests/content-fare-congiuntivo.test.js` (1443 líneas, **13** `describe`) | exact |
| `tests/content-fare-indefiniti.test.js` — NEW | test (invariantes de categoría) | batch / assertions sobre JSON parseado | `tests/content-fare-congiuntivo.test.js` | exact |

Ningún fichero de `src/` en la lista. **El motor v1.4 no se toca:** `git diff src/screens/app.js src/domain/ src/data/` debe quedar vacío al cierre (verificación de la fase).

**Corrección de una coordenada de CONTEXT.md:** `CATEGORIES_WITH_EXPLANATIONS` **no** está en `tests/exercise-types.test.js:1273` — hoy se declara en la **línea 1338** (el fichero creció con la revisión IN-03 de Phase 42). Ver §`tests/exercise-types.test.js` abajo con las líneas verificadas el 2026-08-07.

---

## Pattern Assignments

### `content/exercises/fare-cond-imperativo.json` y `content/exercises/fare-indefiniti.json` (content, file-I/O)

**Análogo:** `content/exercises/fare-congiuntivo.json`

**Forma top-level exacta** — exactamente 2 claves, `notes` primero y `exercises` después. El test análogo lo congela (`content-fare-congiuntivo.test.js:408-410`):

```javascript
  test('el fichero tiene exactamente 2 claves top-level: notes y exercises', () => {
    assert.deepEqual(Object.keys(CONTENT).sort(), ['exercises', 'notes']);
  });
```

**Key set exacto del slot** — 6 claves, ni una más (`content-fare-congiuntivo.test.js:440-451`):

```
['categoryIds', 'explanation', 'id', 'type', 'validation', 'variants']
```

**Key set exacto de la variante** — 3 claves:

```
['correctIndex', 'options', 'prompt']
```

**Excerpt literal del slot MC** (`fare-congiuntivo.json`, slot `fare-congiuntivo-presente`, primeras 2 variantes y el bloque `validation`) — es el molde byte a byte:

```json
{
  "id": "fare-congiuntivo-presente",
  "type": "multiple-choice",
  "categoryIds": [
    "fare-congiuntivo"
  ],
  "explanation": "El congiuntivo presente de fare es, al contrario que el presente de indicativo, completamente uniforme: las seis personas se construyen sobre una sola raíz, facc-, y no hay ninguna alternancia entre raíz larga y raíz corta. El paradigma completo es io faccia, tu faccia, lui/lei faccia, noi facciamo, ...",
  "variants": [
    {
      "prompt": "Bisogna che io ___ i compiti stasera.",
      "options": [
        "faccio",
        "facia",
        "faccia",
        "facciate"
      ],
      "correctIndex": 2
    },
    {
      "prompt": "È necessario che tu ___ il letto ogni mattina.",
      "options": [
        "faccia",
        "fachi",
        "fai",
        "facciano"
      ],
      "correctIndex": 0
    }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-5",     "date": "2026-08-06", "verdict": "correcta", "concerns": [] },
      { "by": "claude-sonnet-5",   "date": "2026-08-06", "verdict": "correcta", "concerns": [] },
      { "by": "deepseek-reasoner", "date": "2026-08-06", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

(En disco `validation.passes[]` va indentado en vertical, una clave por línea; la forma compacta de arriba es solo para leerlo aquí.)

Invariantes que el shape impone y que el planner debe escribir en los 9 slots nuevos:

- `type` es siempre el string `"multiple-choice"` (0-match, 0-word-buttons, D-43-22 / DESIGN RULE D-04).
- `options` = exactamente 4, **sin duplicados internos**; `correctIndex` entero en `[0,4)` y **no constante dentro del slot** (`content-fare-congiuntivo.test.js:453-468` — «el autor aprendería la posición»).
- El hueco es el literal `___` (tres underscores) y hay **exactamente uno** por prompt (`:546-555`; el gate es `v.prompt.split('___').length !== 2`, conteo y no presencia).
- `categoryIds` de longitud 1 con el slug exacto (`:428-438`). Para Phase 43: `["fare-cond-imperativo"]` y `["fare-indefiniti"]`, nunca los dos.
- Ningún id con sufijo numérico de 3 cifras (`:470-474`, regex `/-\d{3}$/`) — el espacio `-300`+ queda libre para Phase 44.

**Shape de `validation.passes[]`** — 4 claves por pase: `by`, `date`, `verdict`, `concerns` (array, puede estar vacío). Reglas heredadas y ya verificadas:

- `validation` es **por slot**, no por variante. «Validada 1-por-1» (VAL-03) describe el *procedimiento* de quórum (un subagent fresh por variante); el trail se agrega en el slot.
- `by` = el modelo **realmente resuelto** (`claude-opus-5`, `claude-sonnet-5`, `deepseek-reasoner`), no el ID pinneado de la skill (`[[top_level_quorum_mechanics]]`).
- Un pase `correcta` **sí admite** `concerns` declarativas — precedente literal en `riflessivi.json` → `riflessivi-pp-concordanza`, cuyo pase `correcta` lleva dos concerns de audit trail (`[D-38-01 concordancia] las 4 terminaciones verificadas explicitamente: …`, `[D-38-01 CERO-avere] auxiliar SIEMPRE essere; …`). **Es el modelo exacto de audit trail que los 3 bloques de doble validez de D-43-20 deberían dejar escrito.**
- Mientras se autora, `passes: []` con `status: "pending"` es **verde** en el test de categoría; solo `VAL_07_STRICT=1` lo pone rojo. Escribir `"status": "validated"` a mano sin ≥2 `correcta` de ≥2 `by` distintos rompe el bloque 12.

**Estilo de `notes`** — un solo string en prosa, gigantesco (**31.288 caracteres** en `fare-congiuntivo.json`, una sola línea de JSON), español acentuado RAE, plain text sin markdown ni saltos de línea, con marcadores en MAYÚSCULAS dentro del propio texto, y cada gate declarado con su «por qué» y su audit trail. Excerpt literal de apertura, que es el registro a clonar:

> «Categoría fare-congiuntivo (order 16) nacida DIRECTAMENTE en slot+variantes, clon del patrón v1.7/v1.9 de presente-regolare, modali, possessivi, riflessivi y fare-indicativo, NUNCA legacy payload. Son 5 slots por 6 variantes cada uno, es decir 30 variantes: […] Un solo eje por slot en los cinco, así que pickVariantIndex los sirve sin una sola línea de motor nueva. DIVERGENCIA DECLARADA respecto al roadmap (D-42-01): el título de la fase habla de 4 slots y de unas 24 variantes, y aquí son 5 slots y 30 variantes, porque […]. Knock-on que Phase 44 e INT-02 necesitan: el milestone pasa de 21 slots y unas 107 variantes a 22 slots y unas 113 variantes. Los cinco slots llevan categoryIds con exactamente un id […]. Ningún id de este fichero usa el espacio de sufijos numéricos de tres cifras: fare-congiuntivo-300 y siguientes quedan libres para los cruces de Phase 44. GATE DE NO-CORREFERENCIA DE SUJETOS (HARD, D-42-06), con audit trail: en italiano estándar, cuando el sujeto de la oración principal COINCIDE con el del subordinado, la construcción con che más subjuntivo es defectuosa […]. La pareja explícita, para que no quede duda: la forma correcta es Penso di fare i compiti y la incorrecta es Penso che io faccia i compiti. […] Por eso se declara como gate de autoría y no se deja al quórum […]»

Y la cola del mismo `notes`, que muestra el otro registro obligatorio — la **corrección de autoría posterior con su lección transferible**:

> «CONSECUENCIA PARA UNA PASADA FUTURA, que es la lección transferible y no el arreglo puntual: la afirmación de este notes de que los seis marcadores sitúan la acción como ya terminada era una PROMESA sobre las seis y el test la comprueba solo como presencia en la cláusula del hueco […]. Ningún marcador nuevo de este slot puede ser deíctico al día de la enunciación […]»

Nótese el idioma del `notes`: las formas italianas citadas van **entre apóstrofes ASCII** (`'facci'`, `'fo'`), porque el test lo exige **en positivo** (`:842-847`):

```javascript
    const faltan = BLACKLIST.filter((f) => !CONTENT.notes.includes(`'${f}'`));
    assert.deepEqual(faltan, [], 'D-42-11: el notes no documenta estas formas de la blacklist');
```

**Cuidado de fase:** la key del imperativo es `fa'`, cuyo último carácter ES un apóstrofe ASCII. Nombrarla en `notes` como `'fa''` es ilegible y frágil; el planner debe decidir **una** convención (p. ej. nombrarla sin comillas envolventes y declarar la excepción en la cabecera del test) y **no** clonar ciegamente el `` `'${f}'` `` para esa entrada. Es la única fricción real que el molde de Phase 42 no cubre.

**Marcadores del `notes` a clonar semánticamente en los DOS ficheros nuevos** (uno por gate de CONTEXT.md):

`0-GLOSS del verbo (D-41-05 / D-43-22)` · `0-MATCH y 0-WORD-BUTTONS (D-43-22, DESIGN RULE D-04)` · `SCOPE-GATE (HARD) del objeto literal, conjunto CERRADO de 7` · `EXCEPCIÓN ACOTADA AL SCOPE-GATE (D-43-18): 'facente funzione' y 'facente parte', solo en el slot de participio presente, participio fosilizado y NO perífrasis verbal` · `BLACKLIST DE FORMAS ATESTIGUADAS Y DEFENDIBLES con audit trail (D-43-04 'fai'/'fa', D-43-07 clíticos, D-43-17 'avere fatto', D-43-16 pronombres de concordancia opcional)` · `RECONOCER, NO PRODUCIR (D-43-19)` · `AUSENCIA DE 'io' EN EL IMPERATIVO: estructural, no olvido (D-43-08)` · `GATE DE VOCATIVO INEQUÍVOCO (D-43-05)` · `GATE HARD DE PRONOMBRE: solo lo/la/li/le (D-43-16)` · `HOMOGRAFÍA CON CONGIUNTIVO E INDICATIVO: declarada y enseñada, nunca contrastada (D-43-06)` · `CUARTO MAGNET DEL MILESTONE: 'aver fatto' vs 'avere fatto' (D-43-17), no declarado por INT-04` · `CONJUNTO CERRADO DE TIPOS DE CONTEXTO y qué tipo lleva cada variante (D-43-12)` · `REPARTO DESIGUAL DE VARIANTES, justificado slot a slot (D-43-03)` · `Nota de escaneo: SIEMPRE por campo, prompt y options, NUNCA sobre el fichero completo` · `Nota de count-sync: los 3 arrays hardcoded, TOTAL_EXPECTED y el baseline-guard son de Phase 44 / INT-02`.

**Análogo de contenido para el slot de participio de `fare-indefiniti`:** `content/exercises/riflessivi.json` → `riflessivi-pp-concordanza`. Su patrón de variantes es exactamente el que D-43-16 pide (pool fijo de terminaciones, un cue de concordancia por prompt, distractoras = concordancia incorrecta):

```json
{ "prompt": "Ieri Marco ___ molto presto.",
  "options": ["si è svegliato", "si è svegliata", "si sono svegliato", "si ha svegliato"], "correctIndex": 0 },
{ "prompt": "Ieri Maria ___ tardi.",
  "options": ["si è svegliato", "si è svegliata", "si è svegliate", "si ha svegliata"], "correctIndex": 1 }
```

Y su `explanation` es el molde de tono para la interferencia con el español: *«La trampa más grave para un hispanohablante es que en español el participio con haber no cambia ('me he despertado' sea quien sea), así que esta concordancia es propia del italiano»* → el análogo directo de «el español no concuerda ('las he hecho'), el italiano sí ('le ho fatte')».

---

### `content/categories.json` (config / registry)

**Análogo:** su propia última entrada. Fichero completo verificado el 2026-08-07 = **20 líneas, 16 entradas**, `order` 1-16, JSON con columnas alineadas a mano.

Últimas dos entradas (líneas 17-18) y forma exacta de las 4 claves (`id`, `name`, `order`, `origen`):

```json
    { "id": "fare-indicativo",         "name": "Fare — indicativo (faccio/feci/ho fatto)",  "order": 15, "origen": "ia-quorum" },
    { "id": "fare-congiuntivo",        "name": "Fare — congiuntivo (faccia/facessi/abbia fatto)", "order": 16, "origen": "ia-quorum" }
```

**Punto de inserción:** la línea 18 recibe coma final y se añaden **dos** entradas más, `order: 17` y `order: 18`, en ese orden y al final del array. Nótese que la entrada 16 ya rompió la alineación de columnas del `name` (es más larga que la caja); el planner puede mantener la alineación de las 15 primeras y dejar las nuevas al estilo de la 16 — no hay assert de whitespace.

Patrón de `name`: `"Fare — <modo> (<3 formas ejemplo>)"` con **raya em U+2014**, no guion. Propuesta de CONTEXT.md: `"Fare — condizionale e imperativo (farei/fa')"` y `"Fare — formas indefinidas (fare/fatto/facendo)"`. **Ojo:** el primero contiene un apóstrofe ASCII dentro de un string JSON — legal, sin escape.

Las 10 primeras entradas **no** llevan `origen`; desde `dimostrativi` (order 11) todas llevan `"origen": "ia-quorum"` — las dos nuevas también (PROV-01).

**Por qué no es cosmético** — `src/data/schema-validator.js` exige que todo `categoryIds` referencie una categoría conocida:

```javascript
        for (const cid of ex.categoryIds) {
          …
          if (!knownCategoryIds.has(cid)) {
            push(file, ex.id, `referencia a categoría desconocida: "${cid}"`);
          }
        }
```

Consecuencia de orden de ejecución, ya incorporada en D-43-02: **la entrada de `categories.json` va en el primer commit de cada plan**, antes o junto al primer slot de su categoría. Es la razón de que cada plan sea dueño de su categoría entera.

**Buena noticia verificada para el append doble:** el test de Phase 42 **ya no** asserta «es la última del array» (el patrón que sí tenía el de Phase 41). Desde WR-05 lo sustituyó por dos invariantes derivados (`content-fare-congiuntivo.test.js:1407-1433`):

```javascript
    const cat = entradas.find((c) => c.id === 'fare-congiuntivo');
    assert.equal(entradas.indexOf(cat), cat.order - 1, …);
    …
    assert.deepEqual(entradas.map((c) => c.order), entradas.map((_, i) => i + 1), …);
```

Es decir: apendizar order 17 y 18 al final **mantiene verde** el test de `fare-congiuntivo`. El de `fare-indicativo` (`tests/content-fare-indicativo.test.js:674`) ya lleva el comentario que anticipa la 17ª — verificar en el TRACER que sigue verde, pero no debería morder.

---

### `tests/exercise-types.test.js` (test, batch)

**Análogo:** líneas 1358-1360 del propio fichero. Coordenadas **verificadas el 2026-08-07** (CONTEXT.md decía 1273, que es la coordenada de antes de la revisión IN-03 de Phase 42):

| Elemento | Línea |
|---|---|
| Helper `slotCountOf` | 1335-1336 |
| `const CATEGORIES_WITH_EXPLANATIONS = [` | **1338** |
| Entrada de `fare-indicativo` (Phase 41) | 1358 |
| Comentario + entrada de `fare-congiuntivo` (Phase 42) | 1359-1360 |
| Comentario de cobertura editorial que cierra el array | 1361 |
| Cierre `];` | 1362 |
| Primer consumidor (smoke de explanations) | 1379 |
| Gate D-VAL-18 / VAL-07 que **reusa el mismo array** | ~1496-1504 |

Forma exacta a apendizar **tras la línea 1360 y antes del comentario 1361** (comentario de fase + `expected` **dinámico**, nunca número mágico — D-31-06):

```javascript
  // v2.0 Phase 41 (IND-01..IND-06): fare-indicativo, 8 slots x 6 personas.
  { file: 'content/exercises/fare-indicativo.json', expected: slotCountOf('content/exercises/fare-indicativo.json') },
  // v2.0 Phase 42 (CONG-01..CONG-04): fare-congiuntivo, 5 slots (4 del paradigma + el disparador).
  { file: 'content/exercises/fare-congiuntivo.json', expected: slotCountOf('content/exercises/fare-congiuntivo.json') },
  // ← AQUÍ: v2.0 Phase 43 (CI-01..CI-03): fare-cond-imperativo, 3 slots (cond. presente + cond. passato + imperativo).
  { file: 'content/exercises/fare-cond-imperativo.json', expected: slotCountOf('content/exercises/fare-cond-imperativo.json') },
  // ← AQUÍ: v2.0 Phase 43 (INDEF-01..INDEF-04): fare-indefiniti, 6 slots de formas no personales.
  { file: 'content/exercises/fare-indefiniti.json', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
```

Helper ya existente, cero infra nueva (líneas 1335-1336):

```javascript
const slotCountOf = (relFile) =>
  JSON.parse(readFileSync(resolve(__explCountDir, '..', relFile), 'utf-8')).exercises.length;
```

**Reparto entre los dos plans:** cada plan añade **su** línea (Plan 43-01 la de `fare-cond-imperativo`, Plan 43-02 la de `fare-indefiniti`). Es exactamente el punto de colisión que justifica waves distintas en D-43-02.

**Semántica que el comentario IN-03 (líneas 1328-1334) obliga a conocer:** con `slotCountOf` el assert de conteo es **tautológico** (`expected` y `data` resuelven a la misma ruta). El gate de conteo real de las dos categorías nuevas vive **solo** en sus tests de contenido dedicados (3 slots / 17 variantes y 6 slots / 18 variantes). No hay red en el smoke; el planner debe escribir esos conteos como asserts literales en los ficheros nuevos.

---

### `tests/content-fare-cond-imperativo.test.js` y `tests/content-fare-indefiniti.test.js` (test, batch)

**Análogo:** `tests/content-fare-congiuntivo.test.js` — **1443 líneas, 13 bloques `describe`** (el molde anterior, `tests/content-fare-indicativo.test.js`, son 700 líneas / 12 `describe`; el de Phase 42 es el que hay que clonar, porque ya incorpora WR-01..WR-11 e IN-03..IN-07).

**Cabecera y setup** (líneas 1-70) — patrón exacto a clonar, incluida la ADVERTENCIA DE ESCANEO y la declaración de desviaciones:

```javascript
// tests/content-fare-congiuntivo.test.js
//
// v2.0 Phase 42 (CONG-01..CONG-04) — invariantes PERMANENTES de la categoria …
//
//     node --test tests/content-fare-congiuntivo.test.js
//
// ADVERTENCIA DE ESCANEO (heredada de 41-01 y de 42-01, no negociable): todos
// los escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]`, sobre el JSON parseado — y
// NUNCA sobre el fichero completo ni sobre `notes`. […] Y SIEMPRE por
// coincidencia EXACTA, nunca por subcadena: […]
//
// LAS TRES DESVIACIONES DELIBERADAS respecto del analogo …

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { deriveStatus } from '../src/data/validation-state.js';

const CONTENT = JSON.parse(
  readFileSync(new URL('../content/exercises/fare-congiuntivo.json', import.meta.url), 'utf-8')
);
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);

const SLOTS = CONTENT.exercises;
const byId = (id) => SLOTS.find((s) => s.id === id);
const keyOf = (v) => v.options[v.correctIndex];
const eachVariant = (slotId, fn) => byId(slotId).variants.forEach((v, k) => fn(v, k));
const allVariants = () => SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));
```

Nótese: comentarios del test **sin acentos** (a diferencia del contenido, que va acentuado RAE); `assert` estricto; `new URL(..., import.meta.url)`; `deriveStatus` importado del código real, nunca reimplementado. **La cabecera es el sitio donde Phase 43 declara sus propias desviaciones** — como mínimo la del apóstrofe de `fa'` en el escaneo en positivo del `notes`.

**Matcher de palabra Unicode** (líneas 82-83) — imprescindible en esta fase, porque `fa` es prefijo de casi todo el paradigma y `fa'` lleva un carácter no-letra al final:

```javascript
const wordish = (s) =>
  new RegExp(`(^|[^\\p{L}])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'iu');
```

El comentario WR-10 explica por qué lleva `iu` y no solo `u`: sin la `i`, la posición donde una forma prohibida aparece de verdad —**inicio de oración**— era justo la que no se veía (`facci` caía y `Facci` no). **Phase 43 hereda el agujero al revés:** `fa'` como opción se compara por igualdad exacta, pero en `prompt` el `'` final ya es `[^\p{L}]`, así que `wordish("fa")` **hace match dentro de `fa'`**. El gate de blacklist de `fa` tiene que excluir explícitamente la key `fa'` o pondrá roja la variante correcta. Es la trampa nº 1 del clonado.

**Escaneo por campo — el idioma exacto** (líneas 802-818), con la distinción `option` (igualdad exacta) vs `prompt` (`wordish`):

```javascript
  const camposDe = (v) => [{ campo: 'prompt', texto: v.prompt }, ...v.options.map((o) => ({ campo: 'option', texto: o }))];

  test('ni una opcion ni un prompt de las 30 variantes lleva una forma de la blacklist', () => {
    for (const { slot, v, k } of allVariants()) {
      const sucio = [];
      for (const { campo, texto } of camposDe(v)) {
        for (const f of BLACKLIST) {
          const hit = campo === 'option' ? texto === f : wordish(f).test(texto);
          if (hit) sucio.push(`${f} (${campo}: "${texto}")`);
        }
      }
      assert.deepEqual(sucio, [], `D-42-11: ${slot.id}#${k} ofrece o menciona una forma atestiguada: ${sucio.join(', ')}`);
    }
  });
```

Patrón de assertion en todo el fichero: `assert.deepEqual(sucio, [], mensaje)` en vez de `assert.ok(sucio.length === 0)` — el array vacío hace que el diff del fallo **liste las ofensoras**. Y todo mensaje cita la decisión (`D-42-11: …`) y la coordenada `${slot.id}#${k}`.

**Constantes de escaneo del análogo** (líneas 184-200), a re-derivar para cada categoría nueva:

```javascript
const BLACKLIST = [ … ];
const PHASE43_FORMS = ['farei', 'faresti', 'farebbe', 'faremmo', 'fareste', 'farebbero', "fa'"];
const PARTICIPIO_CONCORDADO = /\bfatt[aie]\b/i;
const PERIPHRASIS = ['colazione', 'spesa', 'freddo', 'farcel', 'far fare'];
const OBJECTS = ['i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto'];
```

Tres lecturas obligadas para Phase 43:
1. `PERIPHRASIS` y `OBJECTS` se **clonan literales** en los dos ficheros nuevos (el conjunto cerrado de 7 objetos es el heredado de D-41-06). `PERIPHRASIS` gana `causativo` si el planner quiere cubrir `fare + infinito` más allá de `far fare`.
2. `PHASE43_FORMS` es justo lo que Phase 43 **produce**: en el fichero nuevo esas 7 formas son keys legítimas, no blacklist. No se clona ese `describe`; se invierte en un gate de paradigma.
3. `PARTICIPIO_CONCORDADO = /\bfatt[aie]\b/i` es el gate que Phase 42 usaba para **prohibir** el participio concordado por ser el MAGNET de Phase 43. En `fare-indefiniti` se invierte: es el **pool cerrado** del slot de participio passato (`fatto`/`fatta`/`fatti`/`fatte`).

**Excepción documentada al escaneo por campo** — el escaneo *en positivo* sobre `notes` y `explanation`, que es lo contrario de una ausencia (líneas 842-853):

```javascript
    const faltan = BLACKLIST.filter((f) => !CONTENT.notes.includes(`'${f}'`));
    assert.deepEqual(faltan, [], 'D-42-11: el notes no documenta estas formas de la blacklist');

    for (const marca of ['HOMOGRAFÍAS VISTAS Y DELIBERADAS', 'QUINTA homografía']) {
      assert.ok(CONTENT.notes.includes(marca), `D-42-11: el notes no declara "${marca}"`);
    }
```

Ese segundo patrón —**exigir marcadores literales en MAYÚSCULAS dentro del `notes`**— es el mecanismo con el que Phase 43 debe congelar sus declaraciones nuevas: `RECONOCER, NO PRODUCIR`, `CUARTO MAGNET`, `EXCEPCIÓN AL SCOPE-GATE`, `AUSENCIA DE io`.

**Gate de ámbito del hueco** (líneas 104-121) — infraestructura ya escrita, reusable tal cual si Phase 43 necesita comprobar que un marcador gobierna la cláusula del hueco (el trabajo fino de D-43-10, blindar que `farebbe` no sea defendible en el marco del condizionale passato):

```javascript
const CORTE_FUERTE = /[,;.:—–]+/u;
const CORTE_DE_CLAUSULA = /[,;.:—–]+|(?:^|[^\p{L}])(?:e|ed|o|od|ma|però|mentre|che)(?=[^\p{L}]|$)/u;
const segmentoDelHueco = (p, corte) => p.split(corte).find((s) => s.includes('___')) || '';

const gobiernaElHueco = (p, lit) => { … };
```

**Es el análogo directo del gate que D-43-10 deja abierto** y el planner debería reusarlo literalmente en el slot de condizionale passato: el marco de futuro-nel-passato (`ha detto che`, `pensavo che`, `mi ha promesso che`) tiene que **gobernar la cláusula del hueco**, no solo estar presente en el prompt.

**Gate del objeto literal** (líneas 757-775) — clonable casi literal, con `CORTE_FUERTE` para contar objetos:

```javascript
        const clausula = segmentoDelHueco(v.prompt, CORTE_FUERTE);
        const enClausula = OBJECTS.filter((o) => clausula.includes(o));
        if (enClausula.length !== 1) sucio.push(`${id}#${k}: ${enClausula.length} objetos en la clausula del hueco (…)`);
```

**Gate de canon editorial e higiene** (líneas 1215-1269) — clonable **literal** con el `walk` recursivo:

```javascript
  const strings = []; const claves = [];
  (function walk(node) { … })(CONTENT);

  for (const marca of ['<', '>', '&#', 'javascript:', '`']) { … }
  const sucio = strings.filter((s) => /[‘’“”]/.test(s)).map((s) => s.slice(0, 60));
  const sucias = claves.filter((k) => ['__proto__', 'constructor', 'prototype'].includes(k));
  assert.match(s.explanation, /[áéíóúñÁÉÍÓÚÑ]/, `D-42-17: la explanation de ${s.id} no lleva ningun acento RAE`);
```

**El escaneo de smart quotes `/[‘’“”]/` es el gate que blinda que `fa'` sea U+0027 y no U+2019** (specifics de CONTEXT.md). Ya existe; se clona sin tocar.

**Gate de audit trail y ronda EXTRA** (líneas 1309-1385) — clonable con las listas de Phase 43. Lo que hay que reproducir sin recortar:

```javascript
  test('status coincide con deriveStatus(passes) en los 5 slots: no se puede forjar un validated', … );

  test('si un slot esta validated, sus pases cumplen el quorum: >=2 correcta, >=2 by distintos, 0 incorrecta salvo override del autor', () => {
    for (const s of SLOTS.filter((x) => x.validation.status === 'validated')) {
      …
      const override = passes.find((p) => p.by === 'autor' && p.verdict === 'correcta' && p.override === true);
      const incorrectas = passes.filter((p) => p.verdict === 'incorrecta');
      if (incorrectas.length > 0) {
        assert.ok(override, …);
        assert.ok(Array.isArray(override.concerns) && override.concerns.some((c) => c.trim().length > 0), …);
        assert.ok(correctas.some((p) => p.by !== 'autor'), …);
      }
    }
  });

  test('los 4 slots del paradigma llevan un pase deepseek cuando pasan a validated (D-42-08)', () => {
    for (const id of EXTRA_ROUND_SLOTS) {
      const s = byId(id);
      if (s.validation.status !== 'validated') continue;
      const bys = s.validation.passes.map((p) => String(p.by || '').toLowerCase());
      assert.ok(bys.some((b) => b.startsWith('deepseek')), `D-42-08: ${id} esta validated sin la ronda EXTRA obligatoria …`);
    }
  });
```

`EXTRA_ROUND_SLOTS` de Phase 43 (D-43-20): en `fare-cond-imperativo` = **solo** `…-imperativo`; en `fare-indefiniti` = `…-participio-passato` y `…-infinito-passato`. El condizionale passato **no** lleva ronda extra (su riesgo se controla con el gate de marco, no con presupuesto de quórum).

El comentario de las líneas 1310-1316 explica por qué el bloque es **verde con `passes: []`**: no exige que la categoría esté validada (eso es `VAL_07_STRICT`), impide que un `validated` escrito a mano pase por bueno. Los dos tests nuevos entran en verde antes de que corra el quórum top-level — **es lo que permite que `execute-phase` cierre en verde y el quórum vaya después** (D-43-02).

**Los 13 `describe` del análogo, y su traducción a los DOS ficheros de Phase 43:**

| # | `describe` del análogo (línea) | Qué congela | `fare-cond-imperativo` (3 slots / 17) | `fare-indefiniti` (6 slots / 18) |
|---|---|---|---|---|
| 1 | `estructura y conteos` (407) | 2 claves top-level; ids en orden de disco; MC-only; N variantes por slot y total; key set de slot y variante; 4 options sin duplicados; `correctIndex` en rango y **no constante** por slot; `categoryIds` len 1; ningún id `/-\d{3}$/` | 3 ids; **`variants.length` = 6/6/5 y total 17**; el `for (const id of IDS) … equal(…, 6)` del análogo **NO se clona** (aquí es desigual) → tabla `EXPECTED_VARIANTS` por id, con **`…-imperativo` === 5 como invariante permanente (D-43-08)** | 6 ids; **`EXPECTED_VARIANTS` = 3/3/4/2/3/3, total 18 (D-43-03)**; nótese que `participio-presente` con 2 es el mínimo legal del motor |
| 2 | `paradigma completo, 30 keys` (481) | `CANON[id]` = las keys en orden, con repeticiones deliberadas; igualdad ORDENADA `deepEqual(variants.map(keyOf), CANON[id])` | `CANON` = las 6 del condizionale presente, las 6 del passato (`avrei fatto`…`avrebbero fatto`) y **las 5 del imperativo con `fa'` en el índice de 2ª sg**. Sin repeticiones → aquí **sí** se puede recuperar el `new Set(keys).size === n` del molde de Phase 41 | `CANON` con **key REPETIDA por diseño** (`fare` ×3, `aver fatto` ×3, `facendo` ×3, `avendo fatto` ×3, `facente` ×2, y `fatto`/`fatta`/`fatti`/`fatte` una vez cada una): el `new Set` **NO se clona** (desviación tipo D-42-05), y el sustituto de la unicidad es el gate de **tipo de contexto distinto por variante** (D-43-12), no un pronombre |
| 3 | `sujeto explicito y no-correferencia` (539) | exactamente **un** hueco `___` por prompt (conteo, IN-05); el disparador declarado es el único de su slot; el sujeto del hueco es el pronombre de su persona | el gate de hueco se clona literal. **Pronombre sujeto explícito en las 12 variantes de condizionale (D-41-07/D-43-22)** con tabla `VARIANT_TABLE`. En el imperativo lo sustituye el **gate de VOCATIVO INEQUÍVOCO (D-43-05)**: un `ADDRESSEES = ['a un amico','a un signore','ai bambini','a dei clienti']`, exactamente uno por prompt, y el que la tabla declara para esa variante | el gate de hueco se clona literal. **El gate de pronombre NO aplica** (el eje no es la persona) y hay que declararlo como desviación en la cabecera. Lo sustituye el gate de **tipo de contexto** de D-43-12: `CONTEXT_TYPES` cerrado, uno por variante, y **todos distintos dentro del slot** |
| 4 | `0-gloss del verbo con gloss lexico de conjuncion` (669) | ningún prompt glosa el verbo; los paréntesis solo admiten el set cerrado de glosas | clonable como **0-gloss estricto** (D-43-22: aquí el candidato de gloss léxico es el vocativo o el marco, **nunca la forma verbal**) | ídem |
| 5 | `SCOPE-GATE lexico del objeto literal` (746) | ninguna perífrasis en `prompt`/`options`; el objeto de la tabla, del conjunto cerrado de 7, **uno solo por cláusula del hueco** | clonable literal | clonable **con la EXCEPCIÓN ACOTADA de D-43-18**: las 2 variantes de `…-participio-presente` quedan exentas del «objeto del conjunto cerrado» y admiten `facente funzione` / `facente parte`. La exención va **enumerada por id de slot**, nunca como relajación global, y el `PERIPHRASIS` sigue mordiendo en las otras 16 |
| 6 | `blacklist de formas atestiguadas y defendibles` (782) | blacklist por campo, `option` por igualdad exacta y `prompt` por `wordish`; audit trail en `notes` en positivo | `BLACKLIST` = **`fai`, `fa`** (D-43-04, con la exclusión explícita de la key `fa'` — ver la trampa del matcher arriba), **clíticos `fallo`/`fammi`/`fatelo`/`facci`** (D-43-07), y las arcaicas heredadas `fo`/`fé` | `BLACKLIST` = **`avere fatto`** (D-43-17), los clíticos, las arcaicas, **los pronombres `mi`/`ti`/`ci`/`vi`/`ne` en los prompts del slot de participio** (D-43-16) y **toda forma conjugada** (D-43-13) |
| 7 | `distractoras de presente e imperfetto` (860) | conteo exacto por familia de error | **D-43-09**: en cada una de las 6 del condizionale presente, exactamente 1 futuro de esa persona + 1 condizionale de otra persona + 1 raíz regularizada inexistente | **D-43-13** en su lugar: **pool CERRADO no personal** — las 4 options de las 18 variantes salen siempre de `{fare, aver fatto, fatto/a/i/e, facendo, avendo fatto, facente}`; gate grep-verificable de **cero formas conjugadas** |
| 8 | `distractoras de passato y trapassato, cero indicativo` (912) | ídem para los compuestos | **D-43-10**: en cada una de las 6 del condizionale passato, exactamente 1 condizionale presente de esa persona + 1 aux-swap (`avrà fatto`/`aveva fatto`) + 1 malformada (`sarei fatto`, `avrei fare`) | **D-43-16**: en las 4 del participio passato las options son **siempre** las 4 terminaciones `fatto/fatta/fatti/fatte` (`deepEqual` del set ordenado), y el reparto 2 invariables + 2 concordadas es tabla |
| 9 | `slot del disparador, 4 casillas modo x tiempo` (981) | el slot de eje distinto | **el slot de imperativo**: `variants.length === 5`, las 5 keys de `CANON`, y el gate de **registro** de D-43-05 (las 3 distractoras son formas reales del imperativo de OTRO destinatario, ninguna inventada, ninguna de otro modo) | **el slot de `infinito-passato`**: `aver fatto` key en las 3, `avere fatto` ausente de todo campo (**cuarto magnet**, D-43-17); y el slot de `infinito-presente` con la variante de **imperativo negativo `non fare`** (D-43-14) declarada por tabla |
| 10 | `disparadores, marcos y objetos por variante` (1161) | tabla declarativa: los N marcos distintos por slot | tabla `VARIANT_TABLE` con marco + objeto + persona; **≥2 de las 6 del condizionale passato con marco de futuro-nel-passato** (D-43-11) y el gate `gobiernaElHueco` sobre ese marco (D-43-10) | tabla `VARIANT_TABLE` con tipo de contexto + objeto; los tipos **distintos dentro de cada slot** y del conjunto cerrado de D-43-12; la variante de `stare + gerundio` declarada en `…-gerundio-presente` (D-43-15) |
| 11 | `canon editorial e higiene del JSON` (1215) | walk recursivo; sin `<`/`>`/`&#`/`javascript:`/backtick; sin smart quotes; sin `__proto__`; explanations no vacías y con acento RAE; **dosificación de la interferencia** por slot | clonable literal (3 explanations). Añadir en positivo: la explanation del imperativo **cita el paradigma de 5 y explica por qué falta `io`** (D-43-08), **nombra `fai`/`fa` y los clíticos como atestiguados** (D-43-07/19) y **declara la homografía con congiuntivo e indicativo** (D-43-06); la del condizionale presente lleva la línea del par mínimo **`faremo`/`faremmo`**; la del passato desarrolla «dijo que haría» vs `ha detto che avrebbe fatto` (D-43-11, patrón D-42-14 con el assert `explanation.length > 600` sobre el slot que lo desarrolla) | clonable literal (6 explanations). En positivo: la de participio passato con el par «las he hecho» / `le ho fatte`; la de gerundio presente diciendo que el error de `stare + gerundio` es **usarlo de más**, no formarlo (D-43-15); la de infinito passato declarando que `avere fatto` también es correcta (D-43-17/19); la de participio presente con la **nota de registro** de INDEF-03 |
| 12 | `audit trail de validacion y ronda EXTRA` (1309) | `status === deriveStatus(passes)`; quórum si `validated`; override del autor con motivo escrito; `deepseek` en los slots de ronda extra | clonable; `EXTRA_ROUND_SLOTS = ['fare-cond-imperativo-imperativo']` | clonable; `EXTRA_ROUND_SLOTS = ['fare-indefiniti-participio-passato', 'fare-indefiniti-infinito-passato']` |
| 13 | `registro de la categoria` (1391) | la entrada existe con las 4 claves exactas, `order` y `origen`; **índice = order − 1**; orders únicos y contiguos 1..n; los slots referencian el slug | clonable con `order: 17` | clonable con `order: 18`. **El assert global de orders contiguos vive en el análogo y no hace falta triplicarlo** — basta con que un fichero lo tenga; duplicarlo en los tres es ruido, pero es inocuo |

---

## Shared Patterns

### Slug byte-a-byte (contrato de Phase 40, INVIOLABLE)
**Fuente:** `src/data/storage.js:1345`
**Aplica a:** nombre de fichero, `id` de `categories.json`, prefijo de todos los ids de slot, y el elemento del array de reset.

```javascript
const RESET_PREFIXES_V13 = ['fare-indicativo', 'fare-congiuntivo', 'fare-cond-imperativo', 'fare-indefiniti'];
```

**VERIFICADO 2026-08-07:** los dos slugs de Phase 43 **ya están ahí** (Phase 40 shippeada), y el comentario de las líneas 1300-1312 los declara vinculantes para Phases 41-44. También aparecen en `src/data/backup.js:57`, `tests/backup.test.js:793` y `tests/data-storage.test.js:2089` (`RESET_NEW_V13`). **Phase 43 no toca ninguno de esos ficheros**: solo debe usar el slug exacto. Cualquier divergencia de una letra deja la categoría fuera del reset selectivo sin que ningún test lo diga.

**Colisión de prefijo (D-40-03):** `fare-indicativo` y `fare-indefiniti` comparten `fare-ind`. Cualquier comprobación de prefijo —en tests, en greps de auditoría, en el reset— declara el **slug completo**, nunca truncado.

### Motor axis-agnostic (cero código nuevo para los 9 slots)
**Fuente:** `src/domain/session.js:232`
**Aplica a:** los 9 slots, incluidos los 6 de eje-contexto y el de 5 variantes.

```javascript
function pickVariantIndex(slot, rng) {
  const n = Array.isArray(slot.variants) ? slot.variants.length : 1;
  if (n <= 1) return 0;
  return Math.min(n - 1, Math.floor(rng() * n)); // clamp guards rng()===1.0
}
```

**CONFIRMADO axis-agnostic:** la función solo lee `slot.variants.length` y devuelve un índice uniforme. No sabe nada del *significado* del eje ni del número de variantes: un slot de 5 (imperativo), de 4 (participio passato) o de 2 (participio presente) funciona sin una línea nueva. El docblock la declara además `Pure` (no lee de `../data/*`). **Es la prueba de que `git diff src/` queda vacío.**

### Registro de categoría = prerequisito de schema
**Fuente:** `src/data/schema-validator.js` (`knownCategoryIds`)
**Aplica a:** el orden de ejecución de los dos planes — la entrada de `categories.json` va **primero**, en el mismo commit que el primer slot de esa categoría.

### Canon editorial (D-43-21)
**Fuente:** `content/exercises/fare-congiuntivo.json` (`notes` + las 5 `explanation`) y los bloques 4 y 11 del test análogo.
**Aplica a:** los 35 prompts, las 9 explanations y los 2 `notes`.

Español acentuado RAE (un flag C4-accent del quórum sobre español sin tildes es bug **REAL**: se arreglan los acentos, **NO** se hace override — `[[explanations_must_be_accented]]`); **apóstrofes ASCII U+0027 y cero smart quotes** (en esta fase deja de ser cosmético: el apóstrofe de `fa'` es parte de la key); plain text sin markdown ni backticks; italianismos en ortografía italiana; sin `<`, `>`, `&#`, `javascript:`; sin leak R1 de regla / persona / desinencia en el prompt.

### Excepción declarada → `docs/09-VALIDATION-PROMPT.md`, no solo al `notes`
**Fuente:** `[[exception_belongs_in_validation_prompt]]`
**Aplica a:** las excepciones **nuevas** de esta fase — la de `facente funzione` al SCOPE-GATE (D-43-18) y el principio «reconocer, no producir» (D-43-19).

El subagent del quórum **no ve el `notes`**: si la excepción vive solo ahí, marcará `facente funzione` como violación del gate léxico y `fa'`/`aver fatto` como magnets sin resolver. Síntoma diagnóstico del patrón: el modelo marca un caso y aprueba otro idéntico. **Es un edit a `docs/09-VALIDATION-PROMPT.md` que ninguno de los 6 ficheros de la tabla contiene** — el planner debe asignarlo explícitamente (natural en el Plan 43-02, o antes de la pasada top-level de quórum).

### Comando de test
**Fuente:** `[[test_command_node_glob]]`

```
node --test tests/*.test.js
```

El **glob es obligatorio**: el path desnudo `tests/` falla en Node 22.20. Marcador honesto del trabajo de esta fase: `VAL_07_STRICT=1 node --test tests/*.test.js`.

---

## No Analog Found

Ningún fichero se queda sin análogo. Lo que **no** tiene precedente exacto y el planner debe escribir a mano, con las desviaciones declaradas en la cabecera del test (patrón «LAS TRES DESVIACIONES DELIBERADAS» de `content-fare-congiuntivo.test.js:25-45`):

| Hueco de patrón | Origen | Qué hay que inventar |
|---|---|---|
| **Conteo DESIGUAL de variantes por slot** | D-43-03 / D-43-08 | Los 3 análogos (`fare-indicativo`, `fare-congiuntivo`, y sus tests) asumen N constante por slot. Se sustituye el `equal(variants.length, 6)` por una tabla `EXPECTED_VARIANTS`, y **`…-imperativo === 5` se congela como invariante permanente**, no como dato de conteo |
| **Slot con eje CONTEXTO y key compartida** | D-43-12 | Phase 42 resolvió el «qué covaría entre variantes que comparten key» con el **pronombre sujeto**; en `fare-indefiniti` no hay pronombre. Lo sustituye la lista cerrada de tipos de contexto sintáctico, con gate de «todos distintos dentro del slot». Sin precedente en disco |
| **Key que contiene un apóstrofe (`fa'`)** | D-43-04 | Rompe dos idiomas heredados: el escaneo en positivo del `notes` (`` `'${f}'` ``) y `wordish('fa')`, que hace match dentro de `fa'`. Requiere convención explícita, declarada en la cabecera |
| **Excepción enumerada por slot al SCOPE-GATE** | D-43-18 | El gate léxico del análogo es global sobre `allVariants()`. Aquí hay que exentar 2 variantes por id de slot **sin** relajar el gate en las otras 16 |
| **Pool de options CERRADO y grep-verificable** | D-43-13 | El «cero formas conjugadas» de `fare-indefiniti` no tiene equivalente: los análogos verifican *composición* de distractoras, no *pertenencia a un pool*. Es un assert nuevo, y el más barato de la fase |

---

## Metadata

**Estado del codebase verificado (2026-08-07):**

| Hecho | Valor verificado |
|---|---|
| Entradas en `content/categories.json` | **16** (order 1-16, última `fare-congiuntivo` en la línea 18); fichero de **20 líneas** |
| `content/exercises/fare-congiuntivo.json` | **475 líneas**, 5 slots × 6 variantes = 30, todos `validated` (3 pases: opus-5, sonnet-5, deepseek-reasoner); `notes` de **31.288 caracteres** |
| `content/exercises/fare-indicativo.json` | **739 líneas**, 8 slots |
| `tests/content-fare-congiuntivo.test.js` | **1443 líneas, 13 `describe`** |
| `tests/content-fare-indicativo.test.js` | **700 líneas, 12 `describe`** |
| `CATEGORIES_WITH_EXPLANATIONS` | declarado en `tests/exercise-types.test.js:1338` (**no** 1273); helper `slotCountOf` en 1335-1336; última entrada 1359-1360; cierre 1362; reusado por el gate D-VAL-18 (~1496-1504) |
| Los 4 slugs en `RESET_PREFIXES_V13` | **SÍ** (`src/data/storage.js:1345`), incluidos `fare-cond-imperativo` y `fare-indefiniti` |
| `pickVariantIndex` | `src/domain/session.js:232`, `Pure`, axis-agnostic — cero cambio de motor |
| `TOTAL_EXPECTED` | vive en `scripts/run-validation-271.mjs:192` (derivado de `CATEGORIES`, con baseline-guard en :205-209) — **Phase 44 / INT-02, fuera de scope aquí**; rojo/ciego esperado al cierre de Phase 43 |
| Comando de test | `node --test tests/*.test.js` — el glob es obligatorio |

**Analog search scope:** `content/exercises/`, `content/`, `tests/`, `src/data/`, `src/domain/`, `scripts/`
**Pattern extraction date:** 2026-08-07
