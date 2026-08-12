---
phase: 44-integraci-n-lockstep-cierre-v2-0
plan: 03
subsystem: testing / gate anti-ceguera del reporter de cierre de milestone
tags: [gate-anti-ceguera, source-assert, mutation-testing, fail-first, golden, D-40-03, D-44-06, D-44-07, INT-02, G-44-3-WR01]
status: complete

requires:
  - phase: 44-01
    provides: "tests/count-arrays-lockstep.test.js con el helper slugsCiegos, los 3 goldens y los 2 arrays de conteo enganchados a las 18 categorías"
  - "content/categories.json con las 18 entradas registradas (la lista de referencia que el gate lee del disco)"
provides:
  - "`slugsCiegos` anclado al INICIO DE UNA ENTRADA del array (flag `m`): una entrada comentada con `//` deja de satisfacer el ancla"
  - "`paresSlugFile` y `paresCruzados` — predicados puros exportados que extraen y confrontan el par `{ slug, file }` declarado por entrada"
  - "el gate D-40-03 del par `slug` ↔ `file` sobre el reporter, con cláusula de NO-VACUIDAD derivada del disco"
  - "cobertura explícita de las DOS fuentes de conteo por disyuntiva (declara el fichero / lo deriva del slug)"
  - "7 goldens nuevos committeados, todos vistos ROJOS antes de su implementación"
  - "las 3 mutaciones sobre el reporter real vistas ROJAS con mensaje verdadero y revertidas"
affects:
  - "scripts/run-validation-271.mjs (gobernado por el gate, NO modificado)"
  - "tests/fixtures/slot-variants-integration.test.js (gobernado por el gate, NO modificado)"
  - "cualquier alta futura de categoría: la entrada del reporter tendrá que declarar su propio `file`"

actuals:
  tokens: 4950
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "verificación por MUTACIÓN con orden obligatorio: commit del gate → mutar la fuente real → observar rojo con mensaje verdadero → `git checkout --` → observar verde"
    - "cláusula de NO-VACUIDAD: todo gate que compara listas extraídas por regex confronta primero el CONTEO contra una cifra derivada del disco, porque un `deepEqual([], [])` pasa en verde certificando nada (la especie de CR-01)"
    - "ancla de POSICIÓN vs ancla de IDENTIDAD: el slug se exige completo byte a byte (D-40-03) Y en una línea que ABRE una entrada (`^[^\\S\\n]*\\{`, flag `m`)"
    - "whitespace HORIZONTAL (`[^\\S\\n]*`) en vez de `\\s*` para acotar un ancla a una sola línea sin anidar cuantificadores (T-44-03-03)"
    - "cobertura por DISYUNTIVA declarada: una fuente declara el fichero por entrada (y el par tiene que cuadrar) o lo deriva del slug (y es inmune por construcción); una fuente que no haga ninguna de las dos es un canal de ceguera nuevo y el gate lo nombra"

key-files:
  created: []
  modified:
    - "tests/count-arrays-lockstep.test.js"

key-decisions:
  - "El ancla usa whitespace HORIZONTAL (`[^\\S\\n]*`) y no el `\\s*` del snippet del reviewer: `\\s` casa saltos de línea, así que `^\\s*\\{` con flag `m` podría cruzar líneas y el ancla dejaría de significar «esta línea abre una entrada». Es un endurecimiento sobre el fix propuesto, no una desviación de su intención."
  - "Se endurece la POSICIÓN del ancla, jamás la IDENTIDAD del slug: los 3 goldens de colisión de prefijo `fare-ind` (D-40-03) siguen intactos y verdes. El bug de WR-01 era de posición."
  - "`paresCruzados` se exporta como predicado puro propio en vez de calcularse inline en el assert: es el predicado que decide rojo/verde, así que necesita sus goldens positivo y negativo committeados igual que `paresSlugFile`."
  - "El extractor `paresSlugFile` COMPARTE el ancla de entrada de `slugsCiegos`: un par declarado dentro de una entrada comentada no se extrae. Sin eso, la vía 1 y la vía 2 tendrían criterios distintos de «qué es una entrada» y comentar una entrada la sacaría del gate 3 pero no del gate 3-bis."
  - "La cláusula de no-vacuidad va PRIMERO en el test y se apoya en `SLUGS_REGISTRADOS.length`, derivado de `content/categories.json` en disco. Ninguna cifra del fichero está transcrita de un `notes`, de este plan ni del 44-REVIEW.md."

patterns-established:
  - "Gate nuevo = predicado puro exportado + goldens positivo y negativo committeados + mutación sobre la fuente real vista roja. Los tres, o el gate no está verificado."
  - "El rojo de una mutación se pega LITERAL en el SUMMARY: es la única evidencia que sobrevive a la sesión de que el gate muerde."

requirements-completed: [INT-02]

coverage:
  - id: D1
    description: "El ancla de `slugsCiegos` exige que el slug esté en una línea que ABRE una entrada del array (flag `m`): una entrada comentada con `//` devuelve la categoría como CIEGA"
    requirement: "INT-02"
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden-NEGATIVO de ENTRADA COMENTADA: una entrada comentada con // NO ancla nada (G-44-3-WR01)"
        status: pass
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden-NEGATIVO de SLUG EN PROSA: la clave dentro de un comentario de prosa no ancla (G-44-3-WR01)"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 1: comentar la entrada de fare-indefiniti en scripts/run-validation-271.mjs → node --test tests/count-arrays-lockstep.test.js exit 1 nombrando fare-indefiniti"
        status: pass
    human_judgment: false
  - id: D2
    description: "El gate D-40-03 del par `slug` ↔ `file`: todo `file` declarado en el reporter es exactamente `content/exercises/<slug>.json`"
    requirement: "INT-02"
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden-NEGATIVO de PAR CRUZADO: el slug de un hermano con el fichero del otro se delata (D-40-03)"
        status: pass
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#scripts/run-validation-271.mjs: declara un par slug↔file por categoria registrada y ninguno esta cruzado"
        status: pass
      - kind: integration
        ref: "MUTACIÓN A: file de fare-indefiniti → JSON de fare-indicativo → exit 1 nombrando el par cruzado"
        status: pass
    human_judgment: false
  - id: D3
    description: "La cláusula de no-vacuidad: el número de pares extraídos se confronta con `SLUGS_REGISTRADOS.length` derivado de content/categories.json, así que un extractor que deja de ver el array falla en vez de comparar dos listas vacías"
    requirement: "INT-02"
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden de COLUMNAS ALINEADAS: la forma real del reporter (varios espacios) se parsea, o el gate seria vacuo"
        status: pass
      - kind: integration
        ref: "MUTACIÓN B: renombrar la clave `file` a `fichero` en una entrada → exit 1 por la cláusula del conteo (17 !== 18), cero rojos de coherencia"
        status: pass
    human_judgment: false
  - id: D4
    description: "Las dos fuentes de conteo cubiertas por disyuntiva declarada: la que declara el fichero por entrada, por su par; la que lo deriva del slug, por su derivación"
    requirement: "INT-02"
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#las DOS fuentes de conteo estan cubiertas: la que declara el fichero, por su par; la que lo deriva, por su derivacion"
        status: pass
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden de FUENTE SIN file: la que DERIVA la ruta del slug no declara pares (0), y no es un cruce"
        status: pass
    human_judgment: false
  - id: D5
    description: "El reporter y la fixture terminan BYTE-IDÉNTICOS y el reporter sigue en `Milestone gate PASS`: las mutaciones fueron transitorias"
    requirement: "INT-02"
    verification:
      - kind: integration
        ref: "git status --porcelain scripts/ content/ src/ | wc -l → 0; git diff --name-only del plan → solo tests/count-arrays-lockstep.test.js"
        status: pass
      - kind: integration
        ref: "node scripts/run-validation-271.mjs → 'Milestone gate PASS', exit 0"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-08-12
---

# Phase 44 Plan 03: Cierre de G-44-3-WR01 — el gate anti-ceguera endurecido por las dos vías, verificado por mutación

**El gate que impide la cuarta repetición del bug histórico dejó de ser sordo a los dos gestos que el code review encontró: una entrada comentada ya no la satisface, y el par `slug` ↔ `file` del reporter tiene gate propio con cláusula de no-vacuidad derivada del disco — y las dos vías se han VISTO ROJAS sobre el reporter real antes de cerrarse.**

## Performance

- **Duration:** 18 min
- **Tasks:** 2/2
- **Commits:** 2
- **Ficheros tocados:** 1 (`tests/count-arrays-lockstep.test.js`)

## Conteos MEDIDOS en esta sesión (nunca transcritos)

| Medición | Antes de tocar nada | Al cerrar el plan |
|---|---|---|
| `node --test tests/count-arrays-lockstep.test.js` | `# tests 10 / # pass 10 / # fail 0` | `# tests 19 / # pass 19 / # fail 0` |
| `node --test tests/*.test.js` | `# tests 1064 / # pass 1064 / # fail 0` | `# tests 1073 / # pass 1073 / # fail 0` |

Las dos cifras «antes» se midieron con el árbol limpio al abrir el plan, en esta misma sesión, antes de la
primera edición. +9 tests, todos verdes, `fail 0` en los dos ámbitos.

## Accomplishments

### Tarea 1 — el ancla de `slugsCiegos` al inicio de una ENTRADA (vía 1)

Commit `5bcdd5f`.

**El bug PRESENCIADO en verde antes de arreglarlo.** Con el árbol limpio se comentó la entrada de
`fare-indefiniti` del array `CATEGORIES` del reporter — el gesto exacto que el code review describe — y el
gate pasó:

```
1..4
# tests 10
# pass 10
# fail 0
EXIT=0
```

Es decir: el reporter ciego a 7 slots validados en disco, y el gate que existe precisamente para eso,
verde. Revertido con `git checkout -- scripts/run-validation-271.mjs`.

**El fail-first, committeado.** Dos goldens nuevos escritos ANTES de tocar el helper, sobre cadenas
literales del propio fichero (el idiom que 44-01 estableció):

- `SRC_COMENTADO` — la entrada de `fare-indefiniti` precedida de `//`, la de `fare-indicativo` sana.
- `SRC_SLUG_EN_PROSA` — el texto `slug: 'fare-indefiniti'` dentro de un comentario de prosa `// TODO(v2.1)`.

Los dos ROJOS con el helper de 44-01:

```
    not ok 3 - golden-NEGATIVO de ENTRADA COMENTADA: una entrada comentada con // NO ancla nada (G-44-3-WR01)
    not ok 4 - golden-NEGATIVO de SLUG EN PROSA: la clave dentro de un comentario de prosa no ancla (G-44-3-WR01)
# tests 12
# pass 10
# fail 2
```

**El endurecimiento.** El ancla pasó de `slug:\s*(['"`])<slug>\1` (cualquier posición del fichero) a:

```js
const anclado = new RegExp(`^[^\\S\\n]*\\{[^\\n]*slug:\\s*(['"\`])${escapeRe(slug)}\\1`, 'm');
```

El flag `m` es lo que hace que `^` signifique inicio de LÍNEA y no inicio de FICHERO — sin él el ancla solo
mira la primera línea y el gate sería vacuo. Una entrada comentada no lo satisface porque el `//` no es
whitespace y por tanto la línea no abre con `{`. El JSDoc del helper quedó reescrito declarando el
invariante nuevo con sus dos mitades (IDENTIDAD, D-40-03; POSICIÓN, G-44-3-WR01) y por qué comentar una
línea es el gesto más plausible de los que producen la ceguera.

**MUTACIÓN 1, el entregable de la tarea.** Con el gate ya committeado, la misma mutación de antes:

```
    not ok 1 - scripts/run-validation-271.mjs: ninguna categoria registrada queda fuera del array de conteo
# tests 12
# pass 11
# fail 1

INT-02 / D-44-06: scripts/run-validation-271.mjs quedaria CIEGO a estas categorias: fare-indefiniti
```

Exit 1, mensaje verdadero, la categoría nombrada. Revertido → `# fail 0`,
`git status --porcelain scripts/ content/ src/` sin líneas.

### Tarea 2 — el gate D-40-03 del par `slug` ↔ `file` (vía 2)

Commit `dd6edef`.

**Los goldens primero, los cinco rojos** (`paresSlugFile is not defined`, `# fail 5`) antes de escribir el
helper:

| Golden | Qué congela |
|---|---|
| `SRC_PAR_COHERENTE` | extrae los pares tal cual y `paresCruzados` devuelve `[]` |
| `SRC_PAR_CRUZADO` | el copia-pega de D-40-03: `fare-indefiniti` con el fichero de `fare-indicativo` |
| `SRC_ALINEADO` | la forma REAL del reporter, con las columnas cuadradas a varios espacios — sin este golden el gate sería vacuo sobre la única fuente que gobierna el conteo (T-44-03-01) |
| `SRC_SIN_FILE` | la forma de la segunda fuente: 0 pares, y eso NO es un cruce |
| `SRC_PAR_COMENTADO` | un par dentro de una entrada comentada no se extrae (el extractor comparte el ancla de `slugsCiegos`) |

**Los predicados**, los dos puros y exportados
(`EXPORTS: function function function` para `slugsCiegos`, `paresSlugFile`, `paresCruzados`):

- `paresSlugFile(src)` → `{slug, file}[]`, con el ancla de entrada, tolerando la alineación de columnas y
  las tres formas de entrecomillado con la comilla de cierre forzada por backreference.
- `paresCruzados(src)` → los pares cuyo `file` no es `content/exercises/<slug>.json`, formateados
  `slug -> file` para que el diagnóstico del rojo sea verdadero.

**El gate real, con las dos cláusulas en orden.** Primero la NO-VACUIDAD
(`pares.length === SLUGS_REGISTRADOS.length`, derivado de `content/categories.json`), después la
coherencia. El comentario del bloque deja escrito por qué el guard dinámico del reporter no puede ver esto:
con `expected` derivado del propio `file`, un `file` cruzado desplaza LOS DOS lados de la resta a la vez y
la resta cuadra (D-31-06).

**La cobertura de las dos fuentes, por disyuntiva explícita**, en vez de dejar la segunda fuera en
silencio: o la fuente declara el fichero por entrada (y sus pares tienen que cuadrar), o se exige que su
texto DERIVE la ruta del slug (`content/exercises/${slug}.json` como texto). Una fuente que no haga
ninguna de las dos cosas es un canal de ceguera nuevo y el gate lo nombra.

**MUTACIÓN A (par cruzado)** — `file` de `fare-indefiniti` → JSON de `fare-indicativo`, exit 1, dos rojos:

```
    not ok 1 - scripts/run-validation-271.mjs: declara un par slug↔file por categoria registrada y ninguno esta cruzado
    not ok 2 - las DOS fuentes de conteo estan cubiertas: la que declara el fichero, por su par; la que lo deriva, por su derivacion
# tests 19
# pass 17
# fail 2

D-40-03 / INT-02: una entrada de scripts/run-validation-271.mjs declara el fichero de OTRA categoria (el copia-pega del prefijo ambiguo `fare-ind`): fare-indefiniti -> content/exercises/fare-indicativo.json

INT-02 / D-40-03: fuentes de conteo sin cobertura del par:
  scripts/run-validation-271.mjs: declara el fichero por entrada y hay pares CRUZADOS: fare-indefiniti -> content/exercises/fare-indicativo.json
```

Nótese el contraste que define el gap: el gate del bloque 3 (`slugsCiegos`) siguió VERDE bajo esta
mutación, porque el slug sí está anclado. Es exactamente la ceguera que la vía 2 describía.

**MUTACIÓN B (no-vacuidad)** — clave `file` renombrada a `fichero` en esa entrada, exit 1, **un solo rojo y
por la cláusula del CONTEO**:

```
    not ok 1 - scripts/run-validation-271.mjs: declara un par slug↔file por categoria registrada y ninguno esta cruzado
# tests 19
# pass 18
# fail 1

T-44-03-01: el extractor ve 17 pares y content/categories.json registra 18 categorias: o scripts/run-validation-271.mjs dejo de declarar una entrada, o el extractor dejo de ver su array de conteo

17 !== 18
```

Comprobado además que el rojo NO llega por coherencia: `grep -c "D-40-03 / INT-02: una entrada"` sobre la
salida → `0`. La cláusula que existe para que un extractor roto no pase en verde es la que mordió.

## Verificación final (tras los dos reverts)

| Comprobación | Resultado |
|---|---|
| `node --test tests/count-arrays-lockstep.test.js` | `# tests 19 / # pass 19 / # fail 0` |
| `node --test tests/*.test.js` | `# tests 1073 / # pass 1073 / # fail 0` |
| `node scripts/run-validation-271.mjs` | `VAL-06 PASS (250/250)`, `VAL-08 PASS`, `VAL-04 PASS`, **`Milestone gate PASS.`**, exit 0 |
| `git status --porcelain scripts/ content/ src/` | 0 líneas |
| `git diff --name-only HEAD~2..HEAD` | `tests/count-arrays-lockstep.test.js` (único fichero) |
| ancla de inicio de línea con flag `m` | `true true` |
| `SLUGS_REGISTRADOS.length` en el fichero | `true` |
| exports puros | `function function function` |

El `Milestone gate PASS` del reporter es la prueba de que las tres mutaciones se revirtieron limpias.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] El `grep '^ok .*comentada'` del `<verify>` no podía casar un sub-test**

- **Found during:** Tarea 1, paso 2.
- **Issue:** el criterio del plan localiza el golden nuevo con `grep -c "^ok .*COMENTADA\|^ok .*comentada"`
  sobre la salida del runner, pero el reporter TAP de Node indenta los sub-tests con 4 espacios
  (`    ok 3 - ...`) y solo deja a ras de margen la línea de la SUITE. Un golden dentro del `describe` del
  bloque 2 —que es donde el plan pide ponerlo— nunca casaría `^ok`, así que el comando habría devuelto `0`
  sin que nada estuviera mal.
- **Fix:** el golden se llama `golden-NEGATIVO de ENTRADA COMENTADA: ...` (contiene `comentada`, como pide
  el plan) **y además** el título del `describe` del bloque 2 se amplió a
  `goldens de slugsCiegos: ausencia, colision de prefijo y entrada comentada (fail-first, D-44-06)`, que
  es la línea top-level. El `grep` devuelve `1`.
- **Por qué no es relajar nada:** el retítulo solo añade la cobertura nueva al nombre de la suite; los tres
  goldens de 44-01 siguen con su nombre y su cuerpo intactos y verdes.
- **Files modified:** `tests/count-arrays-lockstep.test.js`
- **Commit:** `5bcdd5f`

**2. [Rule 2 - Missing critical] `[^\S\n]*` en vez del `\s*` del snippet del reviewer**

- **Found during:** Tarea 1, paso 3.
- **Issue:** el fix propuesto en `44-REVIEW.md` usa `^\\s*\\{`, y `\s` casa saltos de línea. Con flag `m`,
  `^\s*` puede empezar en una línea anterior y consumir el salto hasta llegar a un `{` de la siguiente, así
  que el ancla dejaría de significar «esta línea abre una entrada» en cuanto apareciera una línea en
  blanco antes de la entrada. Ninguno de los goldens lo habría cazado.
- **Fix:** whitespace HORIZONTAL (`[^\S\n]*`) en `slugsCiegos` y en `paresSlugFile`, con el comentario que
  explica el motivo y su vínculo con T-44-03-03 (acotado a la línea, sin cuantificadores anidados).
- **Files modified:** `tests/count-arrays-lockstep.test.js`
- **Commit:** `5bcdd5f`

**3. [Rule 2 - Missing critical] `paresCruzados` exportado como predicado propio, y un sexto golden**

- **Found during:** Tarea 2, paso 1.
- **Issue:** el plan pedía `paresSlugFile` exportado con goldens, pero el predicado que realmente decide
  rojo/verde es el filtro del cruce. Calculado inline en el assert, el criterio del propio plan
  («cada predicado nuevo es una función pura exportada con sus goldens positivo y negativo committeados»)
  quedaría a medias. Y nada exigía que el extractor compartiera el ancla de entrada con `slugsCiegos`, con
  lo que comentar una entrada la habría sacado del gate 3 pero no del 3-bis: dos definiciones distintas de
  «qué es una entrada» dentro del mismo fichero.
- **Fix:** `paresCruzados` exportado con sus goldens positivo y negativo; el extractor comparte el ancla; y
  golden `SRC_PAR_COMENTADO` que lo congela.
- **Files modified:** `tests/count-arrays-lockstep.test.js`
- **Commit:** `dd6edef`

### Auth gates

Ninguno.

## Known Stubs

Ninguno. El plan no introdujo stubs, `TODO`s de código, tests `skip` ni `<verify>` sin correr: los tres
comandos de la sección de verificación se ejecutaron y las tres mutaciones se observaron rojas.

Nota sobre el único `TODO` que aparece en el diff: el texto `// TODO(v2.1): ...` vive DENTRO de la cadena
literal `SRC_SLUG_EN_PROSA`, que es el dato de entrada de un golden (una prosa de mentira que nombra un
slug para demostrar que nombrarlo no lo engancha). No es deuda: es el fixture.

## Threat Flags

Ninguno. El plan no toca `src/`, no abre endpoint, no añade ruta de autenticación ni de acceso a fichero
nuevo, y no instala nada (T-44-03-SC: proyecto de dependencias cero, el arnés corre con el runner nativo).
Las dos mitigaciones `high` con disposición `mitigate` sobre el fichero editado quedaron aplicadas y
verificadas por mutación: T-44-03-01 (cláusula de no-vacuidad + golden de columnas alineadas + MUTACIÓN B)
y T-44-03-02 (commit antes de mutar, revert por `git checkout --`, `git status --porcelain` vacío).
T-44-03-04 (spoofing del prefijo `fare-ind`) sigue mitigada: la identidad del slug se exige completa y los
goldens de colisión en las dos direcciones están intactos.

## Nota sobre `actuals.tokens`

`4950` = `estimateTokens` (chars/4) sobre el diff realizado del plan (19 803 caracteres de
`git diff HEAD~2..HEAD`). El fichero completo al cerrar mide 29 454 caracteres (≈7 364 en la misma escala).
La estimación del plan era 45 000 con confianza `low`; la diferencia es real y no se redondea para
acercarla, porque una cifra halagadora corrompe todas las estimaciones posteriores.

## Self-Check: PASSED

- `FOUND: tests/count-arrays-lockstep.test.js`
- `FOUND: 5bcdd5f`
- `FOUND: dd6edef`
