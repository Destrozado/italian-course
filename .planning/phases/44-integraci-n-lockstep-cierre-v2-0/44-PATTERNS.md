# Phase 44: Integración lockstep + cierre v2.0 - Pattern Map

**Mapped:** 2026-08-11
**Files analyzed:** 10 (7 modificados + 2-3 nuevos/ampliados)
**Analogs found:** 10 / 10 (todos con análogo exacto o de rol)

> Todos los rangos de línea de este documento se verificaron contra el disco el 2026-08-11.
> **Corrección de ref del CONTEXT:** `docs/09-VALIDATION-PROMPT.md` **NO EXISTE**. La ruta real es
> `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md`
> (325 líneas), y es la que el skill `gsd-validate-exercise` lee literalmente en su Paso 1.
> Un plan que edite `docs/09-VALIDATION-PROMPT.md` crea un fichero huérfano que el quórum nunca lee.

---

## Clasificación de ficheros

| Fichero nuevo/modificado | Rol | Flujo de datos | Análogo más cercano | Calidad |
|---|---|---|---|---|
| `scripts/run-validation-271.mjs` (+4 en `CATEGORIES`) | script/reporter | batch (file-I/O + agregación) | las 5 entradas dinámicas ya presentes (`dimostrativi`, `modali`, `possessivi`, `presente-regolare`, `riflessivi`) en el mismo array | exacta (misma línea, mismo idiom) |
| `tests/fixtures/slot-variants-integration.test.js` (+4 en `REAL_CATEGORIES`) | test back-compat | file-I/O + transform | las 4 entradas de Phase 39 (`dimostrativi`/`possessivi`/`modali`/`riflessivi`, líneas 181-184) | exacta |
| **NUEVO** gate anti-ceguera (D-44-06/07) | test invariante | file-I/O + source-assert | `tests/exercise-types.test.js:1535` (`const APP_SRC = readFileSync(...)`) para el source-assert; `tests/content-fare-indicativo.test.js` §12 para el cruce con `categories.json` | role-match (source-assert existe; aplicado a arrays de conteo es nuevo) |
| `content/exercises/fare-indicativo.json` (+`-300`, `-301`) | contenido JSON | contenido estático | `content/exercises/presente-regolare.json` → `presente-regolare-302`/`-303` (molde literal invertido) y `-300` (cruce ↔`avere`) | exacta |
| `content/exercises/fare-indefiniti.json` (+`-300`) | contenido JSON | contenido estático | `content/exercises/modali.json` → `modali-300` (3 variantes, `categoryIds` de 2, key = modal conjugado) | exacta |
| **NUEVO/AMPLIADO** gates de test de los 3 cruces | test de contenido | file-I/O + escaneo por campo | `tests/content-fare-indicativo.test.js` (700 líneas) y `tests/content-fare-indefiniti.test.js` (1939) | exacta |
| `tests/content-fare-indicativo.test.js` (**modificación FORZOSA**, ver §Rotura) | test de contenido | file-I/O | — (se edita el propio análogo) | n/a |
| `tests/content-fare-indefiniti.test.js` (**modificación FORZOSA**) | test de contenido | file-I/O | — | n/a |
| `.planning/REQUIREMENTS.md` (INT-02/03/04) | doc | texto | edición directa permitida | exacta |
| `.planning/ROADMAP.md` (§Phase 44 SC#2/3/4 + §v2.0) | doc | texto | **skill `gsd-phase`**, NUNCA Write/Edit (anti-pattern #15) | exacta |
| `…/09-VALIDATION-PROMPT.md` §7.5 (4º magnet + G1/G2/G3) | doc de prompt | texto consumido por subagent | §7.1 / §7.2 / §7.4 del mismo fichero (excepciones de Phase 43) | exacta |

---

## ⚠️ Rotura estructural que el planner DEBE presupuestar (el hallazgo más importante de este mapeo)

Añadir slots `-300`+ a `fare-indicativo.json` y `fare-indefiniti.json` **pone en ROJO gates existentes que hoy están verdes**, porque los dos ficheros de test iteran `SLOTS` (= `CONTENT.exercises` **entero**) en vez de una lista de slots base. Esto NO es opcional ni negociable: es trabajo obligatorio del plan de cruces.

`tests/content-fare-indicativo.test.js`:

| Línea | Gate | Por qué rompe |
|---|---|---|
| 181 | `const allVariants = () => SLOTS.flatMap(...)` | pasa a incluir las 6 variantes de cruce → arrastra todos los escaneos de abajo |
| 193 | `assert.deepEqual(SLOTS.map(s => s.id), IDS)` | `IDS` son los 8 del paradigma → **falla** |
| 205 | `SLOTS.reduce(...) === 48` | pasa a 54 → **falla** |
| 209-219 | key set de todos los `SLOTS` | los cruces tienen el mismo key set → sobrevive |
| **223** | `ningun id lleva sufijo numerico de 3 cifras` (`/-\d{3}$/`) | **es EL gate que hay que INVERTIR** — ver excerpt abajo |
| 253 | `EXACTAMENTE un pronombre sujeto` vía `allVariants()` | G2 exige sujeto en **las DOS cláusulas** → 2 pronombres → **falla** |
| 289 / 296 | 0-gloss: `ningun prompt contiene parentesis` / `menciona el espanol` | el molde `-302/-303` y `modali-300` llevan **gloss ES entre paréntesis** → **falla en los dos asserts** |
| 261 | pronombre de la variante `k` = persona `k` | usa `IDS`, no `allVariants()` → sobrevive |
| 494 | marco temporal por variante (`FRAMES[id]`) | usa `IDS` → sobrevive |
| 590/610/618/628 | explanations acentuadas + audit trail de `validation` | itera `SLOTS` → los cruces nacen `pending` con `passes: []`; `deriveStatus([]) === 'pending'` → **sobreviven** (documentado en el comentario de la línea ~600) |

`tests/content-fare-indefiniti.test.js`:

| Línea | Gate | Por qué rompe |
|---|---|---|
| 504 | `SLOTS.map(id) === IDS` (6 ids) | **falla** |
| 534 | `SLOTS.reduce(...) === TOTAL_VARIANTES` (18, cte en :181) | pasa a 21 → **falla** |
| **540** | `categoryIds de longitud 1 con el slug COMPLETO en los 6` | el cruce es de longitud **2** → **falla** |
| 578 | gate del sufijo de 3 cifras | **invertir** |
| 1413/1507/1727/1813/1824/1834/1928 | escaneos y audit trail sobre `SLOTS` | revisar caso a caso; los de `validation` sobreviven con `passes: []` |

**Patrón de arreglo recomendado (el que el propio proyecto ya insinúa con `SIMPLE_SLOTS`/`COMPOUND_SLOTS`, `content-fare-indicativo.test.js:73-75`):** introducir la partición explícita y re-apuntar los gates de paradigma a la lista base, dejando los cruces con su propio `describe`.

```js
// content-fare-indicativo.test.js:73-75 — el idiom de partición YA EXISTE, clonarlo:
const SIMPLE_SLOTS = IDS.slice(0, 4);
const COMPOUND_SLOTS = IDS.slice(4);

// Forma a añadir (D-40-07: slug COMPLETO, nunca `fare-ind*` — D-40-03 colisión de prefijo):
const CROSS_IDS = ['fare-indicativo-300', 'fare-indicativo-301'];
const BASE_SLOTS = SLOTS.filter((s) => !CROSS_IDS.includes(s.id));
const CROSS_SLOTS = SLOTS.filter((s) => CROSS_IDS.includes(s.id));
const allVariants = () => BASE_SLOTS.flatMap((s) => s.variants.map((v, k) => ({ slot: s, v, k })));
```

---

## Asignaciones de patrón

### `content/exercises/fare-indicativo.json` → `fare-indicativo-300` (cruce ↔ `avere`, contenido, estático)

**Análogo:** `presente-regolare-302` / `-303` (forma invertida) + `presente-regolare-300` (para el pool de `avere`).

**Shape completo verbatim a clonar** (`presente-regolare-302`, con el compuesto ESCRITO como contexto y la key en la otra casilla — es exactamente la forma que D-44-02 invierte):

```json
{
  "id": "presente-regolare-302",
  "type": "multiple-choice",
  "categoryIds": [
    "presente-regolare",
    "avere"
  ],
  "explanation": "Aquí hay que formar el presente indicativo regular, no el pasado. El enunciado ya trae escrita la forma compuesta del passato prossimo con avere (ho parlato, abbiamo mangiato), que sirve solo como contexto temporal de lo que pasó ayer; el hueco pide la forma del presente del mismo verbo […] Las distractoras son otras personas del presente del mismo verbo: solo una concuerda con el sujeto.",
  "variants": [
    {
      "prompt": "Ieri ho parlato spagnolo, ma di solito io ___ italiano. (en español: pero normalmente yo hablo)",
      "options": ["parlo", "parli", "parla", "parlano"],
      "correctIndex": 0
    }
  ],
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "claude-opus-4-8", "date": "2026-06-17", "verdict": "correcta", "concerns": ["[D-31-01 direccion] pide PRESENTE; passato con avere solo EXPUESTO como contraste temporal, correcto", "[R1-R7] sin leak; gloss R7; explanation estudiante-foco tras fix C4; acentos canon ES OK"] },
      { "by": "deepseek-chat", "date": "2026-06-17", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

**Notas de copia (vinculantes):**
- **Key set del slot exacto y en este orden alfabético al ordenar:** `['categoryIds','explanation','id','type','validation','variants']`; de la variante: `['correctIndex','options','prompt']` (gate en `content-fare-indicativo.test.js:209-219`).
- **`validation` nace `{"status": "pending", "passes": []}`** — NO se copia el bloque `validated` del análogo (D-44-11; el `notes` de `fare-indefiniti` lo dice literalmente: «el executor no fabrica pases, porque un pase inventado destruye la única evidencia…»).
- **Gloss ES entre paréntesis** — presente en el molde y en `modali-300`. Colisiona con el gate 0-gloss de la categoría (D-41-05, líneas 289/296): el plan debe acotar ese gate a `BASE_SLOTS` y declarar el gloss del cruce como decisión en el `notes` (el gloss es canon R7 y desambigua sin filtrar cuando la key está en la categoría vecina).
- **G1:** el pool de `options` clona la mecánica de `presente-regolare-300` (auxiliar `avere` conjugado + `essere` como distractora de auxiliar), pero con `fatto` **escrito en el prompt**, nunca en `options`.

**Pool de `options` para el eje auxiliar** (`presente-regolare-300`, variantes 1-3 — el patrón «auxiliar equivocado + participio mal formado»):

```json
["ho parlato", "sono parlato", "ho parlate", "ho parlando"]
["siamo lavorato", "abbiamo lavorato", "abbiamo lavorate", "abbiamo lavorando"]
```
> En `fare-indicativo-300` el hueco es SOLO el auxiliar, así que el pool son 4 formas conjugadas de `avere` + `essere`, sin participio dentro de la opción. `fatto` es invariable y va escrito (G1) → **prohibido `lo`/`la`/`li`/`le` en el prompt**.

---

### `content/exercises/fare-indicativo.json` → `fare-indicativo-301` (cruce ↔ `presente-regolare`)

**Análogo:** `presente-regolare-302` para el marco, y su pool para G2.

**Patrón de `options` de G2 — «4 personas del MISMO verbo regular»** (verbatim, `presente-regolare-302`/`-303`):

```json
{ "options": ["parlo", "parli", "parla", "parlano"], "correctIndex": 0 }
{ "options": ["mangia", "mangio", "mangiamo", "mangiano"], "correctIndex": 2 }
{ "options": ["parto", "parti", "parte", "partono"], "correctIndex": 0 }
```
> Nunca verbos distintos en el mismo pool (regla de las LECTURAS: más de uno sería defendible). La explanation del análogo cierra con la frase exacta que hace de contrato: *«Las distractoras son otras personas del presente del mismo verbo: solo una concuerda con el sujeto.»*
> G2 exige **sujeto pronominal explícito en las DOS cláusulas** (D-41-07) → contradice el gate «EXACTAMENTE un pronombre» de la línea 253, que hay que acotar a `BASE_SLOTS`.

---

### `content/exercises/fare-indefiniti.json` → `fare-indefiniti-300` (cruce ↔ `modali`)

**Análogo:** `modali-300` — mismo `categoryIds` de 2, 3 variantes, key = modal conjugado. Verbatim:

```json
{
  "id": "modali-300",
  "type": "multiple-choice",
  "categoryIds": ["modali", "presente-regolare"],
  "explanation": "Este ejercicio junta dos reglas: el modal irregular conjugado (potere/volere/dovere) más el infinitivo de un verbo REGULAR que el modal gobierna. […] En este hueco pedimos el MODAL: elige la forma que concuerda con el sujeto; las distractoras son otras personas del modal y una forma conjugada del verbo regular colada en el sitio del modal.",
  "variants": [
    { "prompt": "Io ___ parlare con il direttore. (en español: yo tengo que / debo hablar)", "options": ["dovo", "devo", "devi", "parlo"], "correctIndex": 1 },
    { "prompt": "Noi ___ prendere il treno delle otto. (en español: nosotros podemos coger)", "options": ["possiamo", "possono", "prendiamo", "posso"], "correctIndex": 0 },
    { "prompt": "Tu ___ dormire ancora un po'. (en español: tú puedes dormir)", "options": ["dormi", "puoi", "può", "posso"], "correctIndex": 1 }
  ]
}
```

**Divergencias obligatorias respecto al análogo (G3):**
1. `modali-300` mete **`parlo`/`prendiamo`/`dormi`** (forma conjugada del verbo gobernado) como distractora. En `fare-indefiniti-300` eso sería una forma de `fare` en `options` → **prohibido por G3**. El pool son 4 formas de modales y nada más.
2. `modali-300` usa marcos genéricos (`parlare con il direttore`) donde los 3 modales serían intercambiables — se salva porque el gloss ES fija cuál. **G3 exige además un complemento explícito** (obligación / permiso / voluntad) que excluya dos de los tres; el gloss solo no basta como red única.
3. El objeto viene del conjunto CERRADO de D-41-06 (`OBJECTS`, `content-fare-indefiniti.test.js:373` / `content-fare-indicativo.test.js:122`):
```js
const OBJECTS = ['i compiti', 'un errore', 'il lavoro', 'una torta', 'il letto', 'tutto', 'una foto'];
```
4. `categoryIds: ["fare-indefiniti", "modali"]` — **`modali`, NO `verbi-modali`** (INT-03 escribe el slug equivocado; `schema-validator.js` rechazaría el fichero).

---

### `scripts/run-validation-271.mjs` (script/reporter, batch)

**Análogo:** las entradas dinámicas ya existentes en el mismo array (líneas 173-188).

**Helper y entradas verbatim** (`scripts/run-validation-271.mjs:171-188`):

```js
const slotCountOf = (file) =>
  JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8')).exercises.length;

const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
  …
  { slug: 'modali',                   file: 'content/exercises/modali.json',                   expected: slotCountOf('content/exercises/modali.json') },
  …
];
```

Las 4 entradas nuevas clonan exactamente esa segunda forma (D-31-06: dinámico, nunca número mágico). **Alfabéticamente** van entre `essere` y `genero-numero`: `fare-cond-imperativo`, `fare-congiuntivo`, `fare-indefiniti`, `fare-indicativo` (el array está ordenado por slug).

**Lo que se arrastra solo — NO tocar** (líneas 190-215):

```js
const TOTAL_EXPECTED = CATEGORIES.reduce((s, c) => s + c.expected, 0);

{
  const TOTAL_EXPECTED_BASELINE = CATEGORIES.reduce((s, c) => s + slotCountOf(c.file), 0);
  if (TOTAL_EXPECTED !== TOTAL_EXPECTED_BASELINE) {
    console.error(`Incoherencia de conteo: TOTAL_EXPECTED (Σ literales)=${TOTAL_EXPECTED} != …`);
    process.exit(1);
  }
}
```
> **Ese `process.exit(1)` corre al CARGAR el módulo** → importar este fichero desde un test es una bomba. Es la razón técnica de D-44-07 (source-assert). Confirmado en disco.

---

### `tests/fixtures/slot-variants-integration.test.js` (test back-compat)

**Análogo:** las 4 entradas de Phase 39, líneas 181-184. Helper `readJson` en las líneas 38-40:

```js
/** Lee y parsea un JSON del repo desde una ruta relativa a la raíz del proyecto. */
function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(projectRoot, relPath), 'utf8'));
}
```

Entradas verbatim a clonar (`:181-184`, dentro del callback del `describe` que empieza en `:163` → **no importable**, D-44-07):

```js
    // v1.9 Phase 39 (INT-02): 4 categorías nuevas con expected DINÁMICO (D-31-06)
    // = exercises.length real del JSON, NO número mágico.
    { slug: 'dimostrativi', expected: readJson('content/exercises/dimostrativi.json').exercises.length },
    { slug: 'possessivi', expected: readJson('content/exercises/possessivi.json').exercises.length },
    { slug: 'modali', expected: readJson('content/exercises/modali.json').exercises.length },
    { slug: 'riflessivi', expected: readJson('content/exercises/riflessivi.json').exercises.length }
```

El bucle de abajo (`:187`) deriva el fichero del slug — `content/exercises/${slug}.json` — así que **1 línea por categoría y cero código nuevo**. Ojo: el nombre del `describe` dice «las 10 categorías reales» y ya son 14 → conviene actualizar el literal a 18 en la misma edición (hay 3 títulos que lo citan: `:163`, `:186`(mensaje) y `:222`).

---

### NUEVO — gate anti-ceguera (test invariante, source-assert)

**Análogo #1 — el patrón source-assert** (`tests/exercise-types.test.js:1534-1535` + el comentario que lo justifica en `:1525-1531`):

```js
describe('quick-260615-hr0: ver explicación al acertar', () => {
  const APP_SRC = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');

  test('la acción reveal cancela el auto-avance y pone sessionExplanationRevealed = true', () => {
    const idx = APP_SRC.indexOf('revealSessionExplanation(');
    assert.ok(idx > -1, 'revealSessionExplanation debe existir en app.js');
    const body = APP_SRC.slice(idx, idx + 600);
    assert.match(body, /this\.cancelAutoAdvance\(\)/, 'revealSessionExplanation debe llamar a this.cancelAutoAdvance()');
  });
```

**Análogo #2 — leer `content/categories.json` desde un test de contenido** (`tests/content-fare-indicativo.test.js:36-39, 655`):

```js
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);
…
const entradas = CATEGORIES.categories;   // el array vive bajo la clave `categories`
```

**Forma sugerida del gate** (composición de los dos, cero infra nueva):

```js
const COUNT_ARRAY_SOURCES = [
  '../scripts/run-validation-271.mjs',
  '../tests/fixtures/slot-variants-integration.test.js',
];
for (const rel of COUNT_ARRAY_SOURCES) {
  const SRC = readFileSync(new URL(rel, import.meta.url), 'utf8');
  test(`${rel}: ninguna categoría registrada queda fuera del array de conteo`, () => {
    const ciegas = CATEGORIES.categories
      .map((c) => c.id)
      .filter((slug) => !new RegExp(`slug:\\s*'${slug}'`).test(SRC));
    assert.deepEqual(ciegas, [], 'INT-02 / D-44-06: el reporter quedaría CIEGO a estas categorías');
  });
}
```
> Cuidado con D-40-03 al escribir el regex: `fare-ind` es prefijo ambiguo. Ancla por `slug: '<slug completo>'` (reporter) y por `slug: '<slug>', expected:` o el literal de ruta `content/exercises/<slug>.json` (back-compat), **nunca** por `includes(slug)` a pelo, que daría falso verde de `fare-indicativo` cuando solo esté `fare-indefiniti`… y al revés no, pero sí lo daría cualquier substring futuro.
> Ubicación: fichero propio (`tests/count-arrays-lockstep.test.js`) entra en el glob `tests/*.test.js` igual que un `describe` en `exercise-types.test.js`, y no engorda un fichero de 1500+ líneas. Discreción del planner (CONTEXT §Discretion).

---

### NUEVO — gates de test de los 3 cruces

**Análogo:** `tests/content-fare-indicativo.test.js` (700 líneas) y `tests/content-fare-indefiniti.test.js` (1939).

**Cabecera obligatoria — ADVERTENCIA DE ESCANEO POR CAMPO** (verbatim `content-fare-indicativo.test.js:13-19`, clonar el espíritu y el aviso):

```
// ADVERTENCIA DE ESCANEO (heredada de 41-01, no negociable): todos los
// escaneos de AUSENCIA de este fichero van SIEMPRE por campo —
// `variants[].prompt` y `variants[].options[]` — y NUNCA sobre el fichero
// completo ni sobre `notes`. El `notes` de la categoria NOMBRA a proposito
// cada forma de la blacklist y cada perifrasis excluida, con su audit trail,
// asi que un grep de fichero entero se auto-invalidaria.
```

**Escaneo por campo, forma canónica** (`:307-317` — SCOPE-GATE léxico, el molde de G1/G3):

```js
  test('ningun prompt ni opcion contiene un marcador de perifrasis', () => {
    for (const { slot, v, k } of allVariants()) {
      const campos = [v.prompt, ...v.options];
      for (const m of PERIPHRASIS) {
        const sucio = campos.filter((c) => c.toLowerCase().includes(m));
        assert.deepEqual(sucio, [], `D-41-06: ${slot.id}#${k} cruza la perifrasis "${m}": ${sucio.join(' | ')}`);
      }
    }
  });
```

**Gate del objeto del conjunto cerrado** (`:318-325`) — los 3 cruces lo heredan SIN excepción (D-41-06; la de `facente` de D-43-18 es local al participio presente):

```js
  test('cada prompt lleva un objeto del conjunto CERRADO de 7', () => {
    for (const { slot, v, k } of allVariants()) {
      assert.ok(OBJECTS.some((o) => v.prompt.includes(o)),
        `D-41-06: ${slot.id}#${k} no usa ningun objeto del conjunto cerrado: "${v.prompt}"`);
    }
  });
```

**EL gate a INVERTIR** (`content-fare-indicativo.test.js:221-224`, gemelo en `content-fare-indefiniti.test.js:577-579`):

```js
  test('ningun id lleva sufijo numerico de 3 cifras: el espacio -300+ queda libre (D-41-14)', () => {
    // Los cruces multi-categoria son de Phase 44 / INT-03 y viven en -300+.
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, [], 'D-41-14: fare-indicativo-300+ es espacio reservado para Phase 44');
  });
```
Forma invertida a escribir (el comentario ya anuncia esta fase — actualizarlo, no borrarlo):

```js
  test('los unicos ids con sufijo de 3 cifras son los cruces declarados (D-40-07, INT-03)', () => {
    const usados = SLOTS.map((s) => s.id).filter((id) => /-\d{3}$/.test(id));
    assert.deepEqual(usados, CROSS_IDS, 'D-40-07: el espacio -300+ aloja EXACTAMENTE los cruces de Phase 44');
  });
```

**Gate de `categoryIds` a acotar** (`content-fare-indefiniti.test.js:540-545`) — hoy exige longitud 1 en TODOS los slots:

```js
  test('categoryIds de longitud 1 con el slug COMPLETO en los 6 (D-43-22, D-40-03)', () => {
    const sucio = SLOTS
      .filter((s) => !Array.isArray(s.categoryIds) || s.categoryIds.length !== 1 || s.categoryIds[0] !== SLUG)
      .map((s) => `${s.id}(${JSON.stringify(s.categoryIds)})`);
    assert.deepEqual(sucio, [], `D-43-22: categoryIds debe ser exactamente ["${SLUG}"]`);
  });
```
→ acotar a `BASE_SLOTS` y añadir el gate espejo del cruce: `categoryIds.length === 2`, `[0] === SLUG` (prefijo byte a byte, D-40-07) y `[1]` el slug vecino exacto.

**Gates que SOBREVIVEN intactos con los cruces `pending`** (`content-fare-indicativo.test.js:600-651`) — el comentario lo explica y es el permiso explícito para cerrar 44-02 en rojo honesto:

```js
  // ESTOS ASSERTS SON VERDES CON passes: [] — deriveStatus([]) devuelve
  // 'pending', asi que la igualdad se cumple antes de que corra el quorum.
  test('status coincide con deriveStatus(passes) …: no se puede forjar un validated', () => {
    for (const s of SLOTS) {
      assert.equal(s.validation.status, deriveStatus(s.validation.passes), …);
    }
  });
```

---

### `…/09-VALIDATION-PROMPT.md` — §7.5 nueva (doc de prompt)

**Análogo:** §7.4 del mismo fichero (líneas 313-321), la excepción más reciente y la mejor escrita: declara la indulgencia, y a continuación **«La frontera, y aquí NO hay indulgencia»** con el caso inverso que sí muerde. Estructura a clonar para G1/G2/G3:

1. Título `### 7.5 <nombre> — cruces multi-categoría `-300`+ (v2.0 Phase 44)`, con el slug y el/los slot(s) nombrados.
2. Qué NO es falso positivo / qué el subagent NO debe marcar (que la key esté en la categoría vecina y que la forma de `fare` vaya escrita en el prompt **es el diseño**, no un leak ni un fuera de tema).
3. La frontera: qué sigue mordiendo (C5 sobre la forma verbal del hueco; C2 si el marco de G3 no excluye dos modales; el gloss sobre la palabra del blank).
4. Cerrar remitiendo a §7.3 («lo que estas excepciones NO relajan»), que es el patrón del fichero.

Y el 4º magnet (D-43-17, par `aver fatto`/`avere fatto`) se declara aquí también — el subagent **no ve el `notes`** (`[[exception_belongs_in_validation_prompt]]`).

---

## Patrones compartidos

### `expected` DINÁMICO, nunca número mágico (D-31-06)
**Fuente:** `scripts/run-validation-271.mjs:171` · `tests/exercise-types.test.js:1335` · `tests/fixtures/slot-variants-integration.test.js:38`
**Aplica a:** las 8 líneas nuevas de los dos arrays de conteo.
Tres implementaciones gemelas de lo mismo; unificarlas está **diferido** (CONTEXT §Deferred). Nota honesta ya escrita en `exercise-types.test.js:1328-1334`: con `expected` dinámico el assert de conteo es **tautológico** y el gate real vive en el test de contenido dedicado.

### El slot nace `pending` con `passes: []` (D-44-11, VAL-03)
**Fuente:** el `notes` de `fare-indefiniti.json` (cola) — *«Los 6 slots nacen con status pending y con la lista de pases vacía porque el quórum base canónico corre en una pasada TOP-LEVEL posterior, un ejercicio por contexto y nunca en lote; el executor no fabrica pases, porque un pase inventado destruye la única evidencia que el autor tiene de que una variante fue revisada.»*
**Aplica a:** los 3 cruces. El plan 44-02 **cierra en rojo esperado** (reporter 247/250) y eso es un entregable, no un fallo.

### Forma del `concerns[]` en un pase (audit trail con etiqueta de decisión)
**Fuente:** `presente-regolare-302` y `modali-300`. Patrón: `"[<ID-DECISIÓN> <tema>] <hallazgo>"`, uno por eje:
```
"[D-31-01 direccion] pide PRESENTE; passato con avere solo EXPUESTO como contraste temporal, correcto"
"[R1-R7] sin leak; gloss ES R7; un po' con apóstrofe ASCII; acentos ES corregidos tras C4"
"[disputed->rewrite] DeepSeek marco C4-accent REAL (mas/aqui sin tilde); resuelto por REESCRITURA con tildes RAE, no override"
```
Un pase `correcta` SÍ admite `concerns` declarativas (`[[top_level_quorum_mechanics]]`).

### Decisión-de-omisión documentada en `notes`, por APPEND
**Fuente:** el `notes` de `modali.json` — «(1) 0-MATCH por D-04/D-37-02 … El 0-match aquí es decisión, no omisión. (2) SCOPE-GATE … fuera de scope HARD».
**Aplica a:** el append de `notes` en los dos ficheros `fare`. Hay que declarar: por qué `fare-congiuntivo`/`fare-cond-imperativo` **no** llevan cruce (D-44-01), por qué el sentido está **invertido** (D-44-02, citando el solape de `Io devo ___ il letto`), G1/G2/G3 verbatim, y el gloss ES del cruce frente al 0-gloss de la categoría. **Append de bloque, nunca re-edición** (CONTEXT §Discretion).
Los tests exigen el audit trail **en positivo** (`content-fare-indicativo.test.js:373-381`, `content-fare-indefiniti.test.js:909-917`: `CONTENT.notes.includes(...)`), así que el `notes` es contrato ejecutable, no prosa.

### Registro de categoría (`categories.json`) — INT-01 ya cumplido, solo verificar
**Fuente:** `content-fare-indicativo.test.js:652-699` — el `describe` §12 completo: key set de 4 claves, `order`, `origen: 'ia-quorum'`, y el gate estable `entradas.indexOf(cat) === cat.order - 1` (con el comentario WR-05 que explica por qué se sustituyó el número mágico `14`).
**Aplica a:** la verificación de INT-01. Existe ya para las 4 categorías `fare` → ninguna edición nueva.

### Anti-pattern #15 de GSD
**Aplica a:** `.planning/ROADMAP.md` → skill **`gsd-phase`**. `.planning/STATE.md` → handlers `gsd-tools query`. `.planning/REQUIREMENTS.md` → Edit directo, permitido.
Nota operativa de memoria: `[[test_command_node_glob]]` — los handlers del SDK rechazan argv posicional en español; editar directo cuando toque.

### Forma del PLAN de una fase de integración
**Fuente:** `.planning/milestones/v1.9-phases/39-prov-01-integraci-n-lockstep-cierre-v1-9/39-01-PLAN.md`
Frontmatter con `wave`, `depends_on: []`, `files_modified`, `must_haves.truths` (bullets verificables en español), `must_haves.artifacts` con `path`/`provides`/`contains`, y `key_links`. Cuerpo: `<objective>` (Purpose + Output), `<context>` con un bloque `<interfaces>` que **pega el código canon a clonar con su ruta y sus líneas**, y tasks con `<read_first>` / `<behavior>` / `<action>` / `<verify><automated>` / `<acceptance_criteria>` (greps concretos) / `<done>`.
Verificar también `39-VERIFICATION.md` para la forma del gate de cierre de milestone.

### Gate de cierre — la trampa del scope
**Fuente:** D-44-09, verificado en vivo.
```bash
git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/      # debe salir VACÍO
grep -c 'applyImmediateFailure(this.state' src/screens/app.js  # debe dar 2
node --test tests/*.test.js                                    # glob obligatorio (Node 22.20)
VAL_07_STRICT=1 node --test tests/*.test.js
node scripts/run-validation-271.mjs                            # 250/250 PASS al final
```
**NO añadir `src/data/` al diff.** El `notes` de Phase 43 lo dice y era cierto por fase, falso por milestone (Phase 40 metió `migrate12to13`/`hydrateV13`, Phase 42 amplió `validation-state.js`).

---

## Sin análogo

| Fichero | Rol | Flujo | Motivo |
|---|---|---|---|
| — | — | — | Ninguno. Los 10 touch-points tienen análogo en el repo; el único elemento genuinamente nuevo es la *composición* del gate anti-ceguera (source-assert × `categories.json`), y sus dos mitades existen por separado. |

---

## Metadata

**Scope de búsqueda:** `content/exercises/`, `tests/`, `tests/fixtures/`, `scripts/`, `docs/`, `.planning/milestones/v1.9-phases/39-*`, `.claude/skills/`
**Ficheros leídos:** 12 (2 JSON de contenido vía extracción de slots, 4 de test, 1 script, 1 doc de prompt, 1 SKILL.md, 2 PLAN/dir de Phase 39, CONTEXT.md)
**Análogos fuertes minados:** 5 (`presente-regolare.json`, `modali.json`, `content-fare-indicativo.test.js`, `run-validation-271.mjs`, `slot-variants-integration.test.js`)
**Fecha de extracción:** 2026-08-11
