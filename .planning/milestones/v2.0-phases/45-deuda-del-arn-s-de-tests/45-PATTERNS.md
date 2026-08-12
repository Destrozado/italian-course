# Phase 45: Deuda del arnés de tests — Pattern Map

**Mapped:** 2026-08-12
**Files analyzed:** 9 (2 tests, 1 script, 4 docs/skills, 1 planning doc, 1 memoria)
**Analogs found:** 8 / 9 (1 patrón NUEVO sin precedente — ver §No Analog Found)

Todos los excerpts de este documento se leyeron del disco HOY. Ningún número de línea
viene heredado del ROADMAP, de `44-REVIEW.md` ni de `45-RESEARCH.md` (Pitfall 6).

---

## File Classification

| Fichero a modificar | Rol | Data flow | Analog más cercano | Calidad |
|---|---|---|---|---|
| `tests/count-arrays-lockstep.test.js` (+3ª fuente, +test DEUDA-03, prosa) | test / source-assert gate | file-I/O + transform | **él mismo** (los 3 bloques ya existentes son su propio analog) | exact |
| `tests/exercise-types.test.js:1338-1366` (+`slug:` ×18) | test / array declarativo | file-I/O | `scripts/run-validation-271.mjs:177-201` (`CATEGORIES`) | **exact — la forma destino es literalmente esa** |
| `scripts/run-validation-271.mjs` (banner + pie derivados) | script / reporter | file-I/O + stdout | él mismo, `:174-227` (patrón «nunca número mágico») | exact |
| `README.md:30, 32, 100` | doc / contrato | — | — | n/a (edición literal) |
| `.claude/skills/gsd-validate-batch/SKILL.md:479` | doc ejecutable | — | — | n/a |
| `.claude/skills/it-add-song/SKILL.md:26, 263` | doc ejecutable | — | — | n/a |
| `.planning/REQUIREMENTS.md:86-119` (+3 filas, Coverage 26/26) | planning / trazabilidad | — | las 23 filas existentes | exact |
| memoria `test_command_node_glob.md` | memoria de usuario | — | — | n/a |
| **Lectura de `.planning/STATE.md` desde `scripts/`** | script / config-read | file-I/O | ver §No Analog Found | **parcial** |

---

## Pattern Assignments

### 1. `tests/exercise-types.test.js` — DEUDA-02, Opción A (+`slug:` ×18)

**Analog:** `scripts/run-validation-271.mjs:177-201`. No es «parecido»: es **la forma exacta**
que el extractor ya sabe anclar, y la Opción A consiste en converger a ella.

**La forma destino, verbatim del disco** (`scripts/run-validation-271.mjs:177-182`):

```js
const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
  { slug: 'articoli',                 file: 'content/exercises/articoli.json',                 expected: 34 },
  { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 20 },
  { slug: 'dimostrativi',             file: 'content/exercises/dimostrativi.json',             expected: slotCountOf('content/exercises/dimostrativi.json') },
  { slug: 'essere',                   file: 'content/exercises/essere.json',                   expected: 26 },
```

> Nota de forma que el planner debe replicar: el reporter **alinea las columnas con espacios
> múltiples**. `paresSlugFile` (`:236-237`) tolera esa alineación explícitamente
> (`slug:[^\S\n]*(['"\`])…\1[^\S\n]*,[^\S\n]*file:`) — pero exige que **`slug` y `file` estén
> en LA MISMA LÍNEA y `file` venga inmediatamente después de la coma**. Un `slug:` puesto
> detrás del `file:` NO produce par y caería en la rama «canal de ceguera nuevo».

**La forma origen, verbatim del disco** (`tests/exercise-types.test.js:1338-1342` y `:1362-1364`):

```js
const CATEGORIES_WITH_EXPLANATIONS = [
  { file: 'content/exercises/preposiciones.json', expected: 50 },
  { file: 'content/exercises/genero-numero.json', expected: 13 },
  { file: 'content/exercises/avere.json', expected: 20 },
  { file: 'content/exercises/sustantivos-irregulares.json', expected: 5 },
  …
  { file: 'content/exercises/fare-cond-imperativo.json', expected: slotCountOf('content/exercises/fare-cond-imperativo.json') },
  { file: 'content/exercises/fare-indefiniti.json', expected: slotCountOf('content/exercises/fare-indefiniti.json') },
];
```

**El diff por entrada** (mecánico, 18 veces, `slug` ANTES de `file`):

```diff
-  { file: 'content/exercises/preposiciones.json', expected: 50 },
+  { slug: 'preposiciones', file: 'content/exercises/preposiciones.json', expected: 50 },
```

**Consumo — no cambia** (`:1382-1383`, verbatim):

```js
describe('Categorías con explanation coverage (Phase 7.1+)', () => {
  for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS) {
```

Destructura solo `file` y `expected` → la clave nueva es inerte (A4 del research, confirmado hoy).

**Comentario que acompaña las entradas (patrón de este array):** cada alta lleva encima un
comentario con fase + requisito + por qué el `expected` es dinámico. Ej. `:1357`:

```js
  // v2.0 Phase 41 (IND-01..IND-06): fare-indicativo, 8 slots x 6 personas.
```

El bloque `slug:` nuevo debe llevar su propio comentario en ese mismo registro (fase, DEUDA-02,
y que la clave existe para el ancla del gate, no para el consumo).

---

### 2. `tests/count-arrays-lockstep.test.js` — alta de la 3ª fuente

**Analog:** él mismo. Cambio de 1 línea + prosa.

**Estado en disco** (`:44-50`, verbatim):

```js
// Las DOS fuentes de conteo, leidas como TEXTO (nunca importadas — ver cabecera).
const COUNT_ARRAY_SOURCES = [
  'scripts/run-validation-271.mjs',
  'tests/fixtures/slot-variants-integration.test.js',
];

const readSrc = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
```

**Referencia siempre de disco** (`:56-60`, verbatim) — el patrón que cualquier cifra nueva debe seguir:

```js
const CATEGORIES = JSON.parse(
  readFileSync(new URL('../content/categories.json', import.meta.url), 'utf-8')
);
const ENTRADAS = CATEGORIES.categories;
const SLUGS_REGISTRADOS = CATEGORIES.categories.map((c) => c.id);
```

**El ancla** (`:208-213`, verbatim; contiene WR-07 — el `slug:\s*`):

```js
  return slugs.filter((slug) => {
    // `[^\S\n]*` = whitespace HORIZONTAL: acota el ancla a una sola linea (un `\s*`
    // podria cruzar saltos de linea) y no anida cuantificadores (T-44-03-03).
    const anclado = new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:\\s*(['"\`])${escapeRe(slug)}\\1`, 'm');
    return !anclado.test(limpio);
  });
```

> **WR-07 en una palabra:** `slug:\\s*` → `slug:[^\\S\\n]*`. El comentario de dos líneas
> encima ya prohíbe justo lo que la línea hace. `paresSlugFile` (`:237`) ya usa la forma
> correcta. Con la Opción A este ancla pasa a gobernar TRES fuentes.

**La cláusula de disyuntiva** (`:680-707`, verbatim del disco — el mensaje que el research
marca como potencialmente mentiroso está en `:696-699`):

```js
  test('las DOS fuentes de conteo estan cubiertas: la que declara el fichero, por su par; la que lo deriva, por su derivacion', () => {
    const sinCobertura = [];
    for (const rel of COUNT_ARRAY_SOURCES) {
      const SRC = readSrc(rel);
      const pares = paresSlugFile(SRC);
      if (pares.length > 0) {
        const cruzados = paresCruzados(SRC);
        if (cruzados.length > 0) {
          sinCobertura.push(`${rel}: declara el fichero por entrada y hay pares CRUZADOS: ${cruzados.join(', ')}`);
        }
      } else if (!SRC.includes(DERIVA_LA_RUTA)) {
        sinCobertura.push(
          `${rel}: NO declara \`file\` por entrada y tampoco DERIVA la ruta del slug ` +
            `(no contiene \`${DERIVA_LA_RUTA}\`): canal de ceguera nuevo, sin cobertura por ninguna de las dos vias`
        );
      }
    }
```

> **Con la Opción A este mensaje NUNCA se emite para la 3ª fuente** (pasa a declarar pares, así
> que entra por la rama `pares.length > 0`). El diagnóstico falso solo se materializaría con la
> Opción B. Aun así el **nombre del test dice «las DOS fuentes»** y con tres es prosa falsa —
> mismo caso que `:3`, `:44`, `:616` («las dos fuentes de conteo»), `:24-31` (la cabecera enumera
> exactamente dos y explica por qué cada una no es importable). **Actualizar esa prosa es parte
> del fix.** La 3ª fuente necesita su propia justificación de no-importabilidad en la cabecera:
> `CATEGORIES_WITH_EXPLANATIONS` es un `const` de módulo NO exportado.

**Prosa a actualizar además:** `:12` (`node --test tests/*.test.js` como glob de la suite) y
`:108` (cita `run-validation-271.mjs:480`, que hoy es `:511`).
**NO tocar:** `:444` y `:453` — son datos del golden `SRC_TRAMPA`, no el contrato.

---

### 3. `scripts/run-validation-271.mjs` — DEUDA-03, banner y pie derivados

**Analog:** el propio fichero, `:174-227`. Este es el patrón «nunca número mágico» que el
criterio de éxito dice que el banner debe seguir ahora también. **Copiar este estilo, no
inventar un segundo.**

**Imports y raíz del proyecto** (`:46-54`, verbatim):

```js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
…
const projectRoot = resolve(__dirname, '..');
```

> Ojo: `scripts/` usa `resolve(projectRoot, …)`; `tests/` usa `new URL('../…', import.meta.url)`.
> Son dos convenciones distintas y cada tier mantiene la suya. **No cruzarlas.**

**Derivación de disco + guard, verbatim** (`:174-175`, `:203-205`, `:217-227`):

```js
const slotCountOf = (file) =>
  JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8')).exercises.length;
```

```js
// TOTAL_EXPECTED = suma de los `expected` literales de CATEGORIES. Computado para que
// NUNCA divirja de la suma escrita a mano; el guard de abajo lo confronta con el disco.
const TOTAL_EXPECTED = CATEGORIES.reduce((s, c) => s + c.expected, 0);
```

```js
{
  const TOTAL_EXPECTED_BASELINE = CATEGORIES.reduce((s, c) => s + slotCountOf(c.file), 0);
  if (TOTAL_EXPECTED !== TOTAL_EXPECTED_BASELINE) {
    console.error(
      `Incoherencia de conteo: TOTAL_EXPECTED (Σ literales)=${TOTAL_EXPECTED} != ` +
      `Σ slotCountOf(disco)=${TOTAL_EXPECTED_BASELINE}. ` +
      `Revisa los expected literales de CATEGORIES vs el JSON real.`
    );
    process.exit(1);
  }
}
```

**Rasgos del patrón a replicar en la derivación del milestone:**
1. Un `const` a nivel de módulo, calculado una vez, con un comentario que dice **por qué no es
   un literal** (no qué hace).
2. La cifra derivada se **interpola en el mensaje** (`${TOTAL_EXPECTED}`), nunca se transcribe.
3. Precedente de bloque `{ … }` para acotar el scope de un temporal.
4. **Diferencia deliberada:** este guard hace `process.exit(1)`. La lectura de `STATE.md` NO
   puede hacerlo (WR-09) → `try/catch` con fallback a etiqueta, no `throw`.

**Los dos sitios de salida impresa, verbatim del disco:**

`:376`
```js
console.log(`${BOLD}Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08 + VAL-09)${RESET}`);
```

`:511-513`
```js
  console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');
  console.log('  → verifica smoke test paramétrico exit 0.');
  console.log('  → si OK: /gsd:complete-milestone v1.1');
```

> `:511` es **DEUDA-01 dentro de DEUDA-03**: la invocación canónica impresa. El plan la cambia
> en el mismo commit o el reporter recomienda la forma ciega.
> `:513` usa `/gsd:complete-milestone` (dos puntos, forma vieja); el resto del repo usa
> `/gsd-complete-milestone`. Decidir explícitamente cuál se imprime.

**Comentarios stale a corregir, verificados hoy:** `:4` (`milestone v1.1 Phase 10`), `:5`
(`los 271 ejercicios … 7 archivos`), `:7` (`milestone v1.1`), `:42-43` (`node --test tests/*.test.js`
+ `/gsd:complete-milestone v1.1`), `:68` (`La suma de expected es 195`), `:453` (`271/271`).

**Restricción de forma (verificada):** el escáner `sinComentarios` no reconoce literales regex.
La regex de derivación no debe contener `'`, `"` ni backtick, y ninguna entrada de `CATEGORIES`
puede compartir línea con ella. `/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m` cumple.

---

### 4. Test que congela DEUDA-03 — dónde vive y de qué copia

**Ubicación recomendada: DENTRO de `tests/count-arrays-lockstep.test.js`.** Razón verificada:
`sinComentarios`, `slugsCiegos` y `paresSlugFile` son `export function` de ese fichero, pero el
fichero **también registra 25 tests a nivel de módulo**. Importarlos desde otro `.test.js` los
re-registra y duplica la suite. Sin import, el problema no existe.

**Analog del bloque de test** (`:616-629`, verbatim) — la forma exacta a copiar:

```js
describe('gate anti-ceguera — las dos fuentes de conteo enganchan las categorias registradas (INT-02)', () => {
  for (const rel of COUNT_ARRAY_SOURCES) {
    const SRC = readSrc(rel);

    test(`${rel}: ninguna categoria registrada queda fuera del array de conteo`, () => {
      const ciegas = slugsCiegos(SRC, SLUGS_REGISTRADOS);
      assert.deepEqual(
        ciegas,
        [],
        `INT-02 / D-44-06: ${rel} quedaria CIEGO a estas categorias: ${ciegas.join(', ')}`
      );
    });
  }
});
```

Rasgos obligatorios que este analog fija:
- `assert.deepEqual(lista, [], mensaje)` sobre una **lista de infracciones acumuladas**, nunca
  un `assert.ok` booleano. El mensaje del rojo NOMBRA los culpables.
- El mensaje abre con el ID del requisito (`INT-02 / D-44-06:` → aquí `DEUDA-03:`).
- Comentario de sección `// ────` + párrafo «POR QUE EXISTE» antes de cada bloque nuevo
  (ver `:631-643`, `:710-720`).

**Golden fail-first obligatorio si se toca el extractor** (`:255-269`, verbatim del encabezado):

```js
// Operan sobre cadenas literales de este propio fichero, no sobre el disco: es lo
// que los hace deterministas y lo que los convierte en fail-first committeado. Un
// gate probado solo en verde es una afirmacion, no una garantia.

describe('gate anti-ceguera — goldens de slugsCiegos: ausencia, colision de prefijo y entrada comentada (fail-first, D-44-06)', () => {
  const SRC_VACIO = `
    const CATEGORIES = [
      { slug: 'avere', expected: 20 },
      { slug: 'essere', expected: 26 },
    ];
  `;
```

Con la Opción A el ancla no cambia → no hacen falta goldens nuevos para DEUDA-02. **Sí hacen
falta para WR-07** si se arregla (`slugsCiegos("{ slug:\n'x' }", ['x'])` debe devolver `['x']`)
y **para el test nuevo de DEUDA-03** (una cadena literal con un `console.log` que transcribe
`v1.1` debe salir en la lista).

---

## Shared Patterns

### A. Source-assert: leer el TEXTO, nunca importar (D-44-07)
**Source:** `tests/count-arrays-lockstep.test.js:50` · **Aplica a:** todo el gate.
```js
const readSrc = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
```

### B. La referencia se lee del disco, jamás se escribe en el test
**Source:** `tests/count-arrays-lockstep.test.js:56-60` (arriba) y `:663-669`
**Aplica a:** cualquier cifra nueva (1164, 18, 250, `v2.0`).
La cláusula de no-vacuidad muestra el razonamiento explícito (`:657-669`):
```js
    // CLAUSULA DE NO-VACUIDAD, y va PRIMERO. Un extractor por regex que deja de casar
    // devuelve lista vacia, y un deepEqual de [] contra [] pasa en VERDE: …
    assert.equal(
      pares.length,
      SLUGS_REGISTRADOS.length,
      `T-44-03-01: el extractor ve ${pares.length} pares y content/categories.json registra ` +
        `${SLUGS_REGISTRADOS.length} categorias: o ${REPORTER} dejo de declarar una entrada, ` +
        `o el extractor dejo de ver su array de conteo`
    );
```

### C. Lectura fail-LOUD de un `.planning/*.md` desde un test (IIFE + try/catch + throw contextualizado)
**Source:** `tests/content-fare-indefiniti.test.js:429-442` — **el único precedente del repo de
leer un `.planning/*.md` desde `tests/`.** Verbatim:
```js
const VALIDATION_PROMPT = (() => {
  const url = new URL(
    '../.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md',
    import.meta.url
  );
  try {
    return readFileSync(url, 'utf-8');
  } catch (e) {
    throw new Error(
      `No se puede leer el prompt de validacion por quorum (${url.pathname}): es la UNICA fuente de reglas que ve el subagent, asi que su ausencia no puede pasar en silencio. Causa: ${e.message}`
    );
  }
})();
```
**Aplica a:** la lectura de `.planning/STATE.md` **desde el test nuevo** (ahí SÍ debe ser
fail-loud: un test que no puede leer su referencia no puede pasar en verde).
**NO aplica al reporter**, que debe ser fail-soft (WR-09). Es la misma IIFE con `?? null` en
vez de `throw` — misma silueta, polaridad opuesta y con la razón escrita al lado.

### D. Ruta de `.planning/` como constante nombrada en `scripts/`
**Source:** `scripts/validate-ai-pass.mjs:38-39`, verbatim:
```js
const PROMPT_PATH =
  '.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md';
```
**Aplica a:** `scripts/run-validation-271.mjs` → `const STATE_PATH = '.planning/STATE.md';`,
resuelta luego con `resolve(projectRoot, STATE_PATH)`. Ruta constante, sin componente derivado
de input (mitigación de path traversal del research).

---

## No Analog Found

| Qué | Rol | Data flow | Estado |
|---|---|---|---|
| **Parsear frontmatter YAML de un `.md`** | script / config-read | file-I/O + transform | **CERO precedentes.** `grep -rn "frontmatter\|STATE.md" scripts/ tests/` → 0. Los 2 sitios que leen `.planning/*.md` consumen el fichero **entero como texto** y hacen `includes`; ninguno parsea claves. |
| **Assertar sobre el stdout de un script** | test | streaming/stdout | **CERO precedentes.** `child_process` aparece en 1 solo test (`tests/file-lock.test.js:15`) y solo para `spawnSync('node', ['-e', ''])` obteniendo un PID muerto — no captura ni asserta salida. |

**Forma recomendada para los dos huecos, consistente con el repo:**

1. **Frontmatter:** no introducir un parser. Un `String.match` de una clave, con la misma
   disciplina de regex del gate (`[^\S\n]*`, nunca `\s*`; sin cuantificadores anidados —
   T-44-03-03), envuelto en la IIFE del patrón C.
2. **Stdout:** **no shellear el reporter desde el test.** El propio fichero ya declara esa
   política (`:25` y `:30`: «NO corre `node --test` … JUSTIFICACIÓN de NO shellear»). El test
   de DEUDA-03 debe ser **source-assert** (patrón A): leer el texto del reporter, pasarlo por
   `sinComentarios`, y assertar que ninguna línea con `console.log` transcribe un literal de
   milestone. Eso lo mantiene en el tier donde el repo ya sabe operar y evita el `process.exit`
   a nivel de módulo del reporter.
   Riesgo declarado en el research (A2, LOW confidence): el regex `/\bv\d+\.\d+\b/` puede dar
   falsos positivos sobre otras cadenas impresas. **Verificar por mutación antes de aceptarlo.**

---

## Call-sites de la invocación canónica (DEUDA-01) — CONFIRMADOS EN DISCO HOY

Literales exactos. Todos verificados con `grep -n` esta sesión.

| Fichero:línea | Literal en disco (verbatim) | Acción |
|---|---|---|
| `README.md:30` | `node --test tests/*.test.js` (bloque «## Tests del dominio») | **Actualizar** |
| `README.md:32` | ``Debe terminar con `pass 14` (o más) y exit code 0.`` | **Actualizar** a 1164 (obsoleto por 2 órdenes de magnitud) |
| `README.md:100` | `VAL_07_STRICT=1 node --test tests/*.test.js` (comentario encima: `# Linux/macOS — gate del milestone v1.1`) | **Actualizar** (y el `v1.1` del comentario) |
| `.claude/skills/gsd-validate-batch/SKILL.md:479` | `       VAL_07_STRICT=1 node --test tests/*.test.js` (dentro del bloque de «Siguientes pasos») | **Actualizar** |
| `.claude/skills/gsd-validate-batch/SKILL.md:626` | `…el autor flippea conscientemente \`VAL_07_STRICT=1 node --test tests/*.test.js\`…` | **Actualizar** (el research no lo lista; confirmado hoy) |
| `.claude/skills/it-add-song/SKILL.md:26` | ``- `node --test tests/*.test.js` en verde.`` | **Actualizar** |
| `.claude/skills/it-add-song/SKILL.md:263` | `node --test tests/*.test.js        # verde` | **Actualizar** |
| `scripts/run-validation-271.mjs:15` (=`:42` del research) | `//       Autor procede al paso manual: \`VAL_07_STRICT=1 node --test tests/*.test.js\`` | **Actualizar** |
| `scripts/run-validation-271.mjs:511` | `  console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');` | **Actualizar (SALIDA IMPRESA)** |
| `tests/count-arrays-lockstep.test.js:12` | `//     node --test tests/*.test.js` (cabecera «entra en el glob de la suite completa») | **Actualizar** |
| `tests/count-arrays-lockstep.test.js:108` | cita `run-validation-271.mjs:480` | Actualizar a `:511` |
| `tests/count-arrays-lockstep.test.js:444, 453` | literales dentro del golden `SRC_TRAMPA` | **NO TOCAR — datos del test** |
| memoria `test_command_node_glob.md` | «Correr la suite completa con la forma glob: `node --test tests/*.test.js`» + «A 2026-06-03 la suite está en 327/327 verde» | **Actualizar** (invocación y cifra) |
| `CLAUDE.md` | 0 ocurrencias | Nada |

**Hallazgo adicional (no en el research): ~20 ficheros de `tests/*.test.js` llevan
`//     node --test tests/*.test.js` en su cabecera de comentario** (`exercise-types.test.js:10`,
`exercise-fill-in.test.js:20`, `screen-*.test.js`, `file-lock.test.js:4`, `content-fare-*.test.js:12`…),
y tres usan la forma **rota** `node --test tests/` (`domain.test.js:5`, `word-groups.test.js:4`,
`song-validator.test.js:5`), que la memoria documenta que falla en Node 22.20.
**Decisión que el plan debe tomar explícitamente:** actualizar las ~23 cabeceras en lockstep
(caro, mecánico, y elimina la forma rota) o acotar el contrato a los 13 sitios de la tabla y
declarar las cabeceras como prosa no-contractual. Si se elige lo segundo, **decirlo por escrito**
— dejar 20 cabeceras diciendo la forma ciega es exactamente «la prosa es más cuidadosa que el
código» al revés.

---

## `.planning/REQUIREMENTS.md` — forma de las 3 filas nuevas

**Analog:** las 23 filas existentes (`:86-108`). Forma exacta:

```
| INT-04 | Phase 44 — Integración lockstep + cierre | Complete |
```

Añadir tras `INT-04`:
```
| DEUDA-01 | Phase 45 — Deuda del arnés de tests | Pending |
| DEUDA-02 | Phase 45 — Deuda del arnés de tests | Pending |
| DEUDA-03 | Phase 45 — Deuda del arnés de tests | Pending |
```

Y `:119`, verbatim en disco hoy:
```
**Coverage: 23/23 requisitos mapeados — 0 huérfanos, 0 duplicados, 0 gaps.**
```
→ `26/26`. **Esa línea es el análogo directo del anti-patrón CR-01**: una cifra escrita a mano
al lado de una tabla que nadie deriva. Si el plan añade filas y no la toca, el documento miente
en la línea siguiente a la mentira que la fase existe para pagar.

---

## Metadata

**Analog search scope:** `tests/` (29 suites + `tests/fixtures/` + `tests/util/`), `scripts/`
(9 `.mjs` + `scripts/lib/`), `README.md`, `.claude/skills/*/SKILL.md`, `.planning/REQUIREMENTS.md`,
`.planning/STATE.md`, memoria del proyecto.
**Files scanned:** ~45 por grep; 6 leídos con excerpts (`count-arrays-lockstep.test.js` en dos
rangos no solapados, `exercise-types.test.js:1300-1399`, `run-validation-271.mjs` en tres rangos,
`content-fare-indefiniti.test.js:420-455`, `validate-ai-pass.mjs:30-55`, `REQUIREMENTS.md:84-120`).
**Pattern extraction date:** 2026-08-12
**Read-only:** ningún fichero fuente modificado.
