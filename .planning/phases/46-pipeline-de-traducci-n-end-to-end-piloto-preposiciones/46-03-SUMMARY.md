---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
plan: 03
subsystem: validation
tags: [gates, anti-ceguera, mutation-testing, no-vacuidad, source-assert, regex-extractor, node-test, derived-counts]

# Dependency graph
requires:
  - phase: 46-01
    provides: "el campo `translationES: { text, validation }` en disco y las cifras de corpus MEDIDAS (722 variantes multiple-choice de 758 totales; Preposiciones = 50 slots / 96 variantes)"
  - phase: 46-02
    provides: "la dirección compuesta `<slot-id>#<k>` y el comando del quórum que el rojo del reporter imprime como acción sugerida"
  - phase: 09-infraestructura-de-validaci-n
    provides: "`deriveStatus` como fuente única de status — se importa, nunca se reimplementa (WR-01)"
  - phase: 44-fare-indefiniti-e-integracion
    provides: "el gate anti-ceguera (`slugsCiegos` / `paresSlugFile` / `sinComentarios`) y la cláusula de no-vacuidad de CR-01"
  - phase: 45-deuda-tecnica-de-gates
    provides: "la lección de que los cinco gates vacuos se cazaron los cinco CORRIENDO la mutación"
provides:
  - "`TRANSLATION_COVERAGE` en el reporter: array paramétrico de cobertura de traducción con `expected` derivado del disco a granularidad de VARIANTE"
  - "`mcVariantCountOf(file)` — la primera unidad de conteo del proyecto que no es `exercises.length`"
  - "El sub-gate impreso `TRAD-COV`, con veredicto por igualdad de enteros, cláusula de no-vacuidad primero y enganche a `gatePass`"
  - "`regionDeArray(src, nombre)` — acotado de un array de conteo por su declaración, sobre el texto ya limpio de comentarios"
  - "`categoriasDeclaradasCubiertas()` — el conjunto de categorías cubiertas de traducción DERIVADO del disco"
  - "GATE-02: el array de traducción como fuente vigilada del anti-ceguera, con 12 goldens fail-first sobre literales"
affects: [46-04-expansion-96-variantes, 46-05-verificacion-visual, 47-53-resto-de-categorias]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 10729
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Acotado por REGIÓN de un array de conteo cuando el mismo fichero declara dos: cada gate mide el array que le toca, en vez de sumar un margen al recuento global"
    - "Referencia de gate derivada del disco por PRESENCIA DE CAMPO (`translationES` en alguna variante) en lugar de por registro: mide lo que está cubierto hoy, no lo que debería estarlo algún día"
    - "Conteo a granularidad de sub-objeto de variante con dirección compuesta `<slot-id>#<k>` en los mensajes, copiable al comando del quórum"
    - "Rojo POR AUSENCIA DE DATOS como veredicto DISTINTO de rojo por incumplimiento, impreso con su propia razón y su propia acción sugerida"

key-files:
  created: []
  modified:
    - scripts/run-validation-271.mjs
    - tests/count-arrays-lockstep.test.js

key-decisions:
  - "El `actual` que MUERDE es el recuento de traducciones `validated`; la segunda igualdad (variantes recorridas == esperadas) se declara EN EL CÓDIGO por lo que es: la mitad estructural, tautológica sobre un árbol coherente, y NO la que muerde"
  - "La referencia del anti-ceguera de traducción NO puede ser `content/categories.json`: exigir las 18 categorías hoy sería un rojo permanente e inservible, y un rojo inservible invita a relajar el gate"
  - "El acotado por región no es cosmético: sin él, un slug borrado de `CATEGORIES` y vivo en el array de traducción seguiría apareciendo anclado en el fuente entero — canal de ceguera NUEVO abierto por este mismo plan"
  - "`regionDeArray` devuelve cadena VACÍA cuando la declaración no aparece, nunca el fuente completo como fallback: el fallback volvería a mezclar los dos arrays en silencio"
  - "`categoriasDeclaradasCubiertas` es FAIL-LOUD sobre un JSON que no parsea: un `catch { continue }` convertiría un fichero corrupto en «no cubierta», que es el gate vacuo que ese fichero persigue"
  - "`mcVariantCountOf` falla con diagnóstico NOMBRADO en vez de con un ENOENT desnudo, para que el rojo por ausencia de datos sea legible en las dos rutas (derivación del expected y recorrido del conteo)"

patterns-established:
  - "Cuando un fichero pasa a declarar DOS arrays vigilados, la cláusula de no-vacuidad se ACOTA a la región de cada uno; sumarle un margen la deja comparando una cifra que ya no describe nada (CR-01)"
  - "Un golden de ACOTADO acompaña a todo gate que estrecha su ámbito: sin él, el estrechamiento no está comprobado y los demás goldens del bloque no significan nada"
  - "La mutación que más prueba no es la que rompe el dato, es la que rompe el EXTRACTOR dejando el dato intacto: el `slug` detrás del `file` deja `slugsCiegos` en verde y solo la no-vacuidad lo caza"

requirements-completed: [TVAL-04, GATE-01, GATE-02]

coverage:
  - id: D1
    description: "El reporter tiene un gate de traducción que sale ROJO si alguna traducción de una categoría declarada cubierta no está `validated`, y su veredicto entra en la conjunción `gatePass` que gobierna el exit code"
    requirement: "TVAL-04"
    verification:
      - kind: integration
        ref: "`node scripts/run-validation-271.mjs` → exit 1 con `TRAD-COV (96/96 traducciones validated): FAIL (0/96 — pending=1, missing=95, disputed=0)` mientras los cuatro sub-gates de slots están en PASS: el exit code lo pone el gate nuevo y solo el gate nuevo"
        status: pass
    human_judgment: false
  - id: D2
    description: "El `expected` de cobertura se DERIVA del disco a granularidad de variante y no está transcrito como número mágico en ningún sitio"
    requirement: "GATE-01"
    verification:
      - kind: unit
        ref: "aserción de fuente: en la región del array, `expected:\\s*\\d+` = 0 ocurrencias; en la región del array y su bucle de conteo, las cifras del piloto (96 / 50) = 0 ocurrencias fuera de comentario"
        status: pass
    human_judgment: false
  - id: D3
    description: "El gate compara DOS magnitudes distintas derivadas del disco, no una tautología: variantes `multiple-choice` en el fichero (expected) frente a `translationES` con status derivado `validated` (actual)"
    requirement: "GATE-01"
    verification:
      - kind: integration
        ref: "en disco hoy: expected=96 y validated=0 con la misma lectura del mismo fichero. Un assert tautológico no podría producir 0 ≠ 96"
        status: pass
    human_judgment: false
  - id: D4
    description: "El 100% se expresa como IGUALDAD DE ENTEROS, nunca como porcentaje redondeado ni umbral flotante"
    requirement: "GATE-01"
    verification:
      - kind: unit
        ref: "aserción de fuente sobre la región del sub-gate: `toFixed|Math.round|/ TOTAL_TRANSLATION_EXPECTED|0.99` = 0 líneas fuera de comentario"
        status: pass
    human_judgment: false
  - id: D5
    description: "Cláusula de no-vacuidad obligatoria y PRIMERO: array vacío, total esperado cero o fichero declarado ilegible → ROJO por AUSENCIA DE DATOS, nunca verde por lista vacía"
    requirement: "TVAL-04"
    verification:
      - kind: integration
        ref: "mutación ejecutada: array vaciado a `[]` → exit 1 con `FAIL (AUSENCIA DE DATOS — …)`; fichero declarado inexistente → exit 1 con el diagnóstico nombrado de `mcVariantCountOf`"
        status: pass
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js — offset de la igualdad de recuentos (1114) < offset del `deepEqual` de ciegas (1802) dentro del mismo `test(...)`"
        status: pass
    human_judgment: false
  - id: D6
    description: "El veredicto no depende del orden de recorrido: el gate agrega y compara CONJUNTOS, no cortocircuita en la primera entrada"
    requirement: "TVAL-04"
    verification:
      - kind: integration
        ref: "permutación ejecutada sobre el reporter con dos entradas: mismo exit code (1) y mismos contadores (0/128, pending=1, missing=127) en los dos órdenes"
        status: pass
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#ORDERING — permutar las entradas de un golden no cambia el conjunto de ciegas ni de cruzadas"
        status: pass
    human_judgment: false
  - id: D7
    description: "El anti-ceguera pone ROJO cualquier categoría declarada cubierta que no esté enganchada al array de cobertura, medida contra un conjunto DERIVADO del disco"
    requirement: "GATE-02"
    verification:
      - kind: integration
        ref: "MUTACIÓN 3 de D-46-18 EJECUTADA (ver la tabla de mutaciones): entrada retirada → exit 1, con el mensaje nombrando `preposiciones` como categoría que quedaría CIEGA"
        status: pass
      - kind: unit
        ref: "12 goldens fail-first sobre literales (ausencia, prefijo, un byte, // , /* */, dos líneas, cruce, acotado, región ausente, control verde, ordering)"
        status: pass
    human_judgment: false
  - id: D8
    description: "Una categoría enganchada con un slug que difiere en un solo byte, o con la entrada partida en dos líneas, NO cuenta como enganche"
    requirement: "GATE-02"
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js#golden-NEGATIVO de UN SOLO BYTE y #golden-NEGATIVO de SLUG A DOS LINEAS"
        status: pass
      - kind: integration
        ref: "mutación del extractor EJECUTADA sobre el fuente real: entrada partida en dos líneas → exit 1 disparado por la cláusula de NO-VACUIDAD"
        status: pass
    human_judgment: false
  - id: D9
    description: "El sub-gate de traducción es legible para el autor: el rojo dice qué falta, dónde (dirección compuesta) y con qué comando se arregla"
    verification: []
    human_judgment: true
    rationale: "Que la salida impresa sea ÚTIL es juicio del autor sobre su propia consola. Los tests congelan que las cifras van interpoladas y que el comando sugerido existe; que el mensaje le sirva para actuar solo lo puede decir él, y lo verá de verdad en el plan 46-04, cuando el rojo pase de 95 variantes a unas pocas."

# Metrics
duration: 26min
completed: 2026-08-13
status: complete
---

# Phase 46 Plan 03: Gates de cobertura y anti-ceguera Summary

**El reporter gana un segundo array paramétrico con el `expected` derivado del disco a granularidad de VARIANTE y un sub-gate que compara dos magnitudes genuinamente distintas, y el anti-ceguera lo adopta como fuente vigilada medida contra un conjunto de categorías-cubiertas derivado del disco — con las tres mutaciones EJECUTADAS y el rojo observado, incluida la que deja `slugsCiegos` en verde y solo la cláusula de no-vacuidad caza.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-08-13T18:33:00Z (aprox., primera lectura de contexto)
- **Completed:** 2026-08-13T18:59:38Z
- **Tasks:** 3
- **Files modified:** 2 (312+/1- en el reporter, 515+/2- en el meta-test)

## El estado ROJO al cerrar este plan es el criterio de aceptación

Medido el **2026-08-13T18:59Z**, con el árbol restaurado y limpio:

```
node scripts/run-validation-271.mjs   →  exit 1
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (96/96 traducciones validated): FAIL (0/96 — pending=1, missing=95, disputed=0)
```

**Por qué es no-cero:** de las 96 variantes `multiple-choice` de Preposiciones, 95 no tienen
todavía el campo `translationES` (cuentan como `missing`) y la única que lo tiene —la frase
canónica del tracer— está en `pending`, porque el plan 46-01 la dejó con `passes: []` y el 46-02
construyó el validador sin gastar su cuota en un pase real. Cero `validated` frente a 96
esperadas.

**Qué lo pondrá a cero:** el plan **46-04**, autorando las 95 traducciones que faltan y pasando
las 96 por el quórum cross-vendor hasta que `deriveStatus` derive `validated` en todas (dos `by`
distintos por traducción). El plan 46-05 vuelve a verificarlo por mutación.

**Lo que NO se ha hecho, deliberadamente:** no se ha bajado el umbral, no se ha añadido tolerancia,
no se ha excluido Preposiciones del array, no se ha convertido la igualdad en un porcentaje. Ese
rojo es el lado fail-first del umbral y la prueba de que el gate muerde; la presión por aliviarlo
es exactamente el defecto que T-46-14 modela.

## Verificación POR MUTACIÓN (D-46-18 — leer el gate no cuenta)

Todas EJECUTADAS el **2026-08-13**, con el exit code apuntado de la corrida, no del código leído.
Backup y restauración por copia de fichero y `git checkout --` del fichero concreto; sin `git
stash` ni `git clean`.

### Punto de partida

| Corrida | Exit |
|---|---|
| `node --test tests/count-arrays-lockstep.test.js` (árbol limpio, post-Task 2) | **0** (52/52) |

### MUTACIÓN 3 de D-46-18 — declarar Preposiciones cubierta y NO engancharla

Retirada la entrada de `TRANSLATION_COVERAGE`. Preposiciones sigue declarada cubierta por el
DISCO (tiene la traducción canónica), así que el conjunto derivado la incluye.

| Corrida | Exit | Test que la caza |
|---|---|---|
| `node --test tests/count-arrays-lockstep.test.js` | **1** | `GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)` → subtest `scripts/run-validation-271.mjs: ninguna categoria con traduccion en disco queda fuera del array de cobertura de traduccion` |

Mensaje observado, literal:

```
D-46-17: el extractor ve 0 pares en la region de `TRANSLATION_COVERAGE` de
scripts/run-validation-271.mjs y el disco declara 1 categorias cubiertas de traduccion
(preposiciones). Las dos causas son reales: o el reporter dejo de declarar una entrada —y
entonces la ceguera ya existe, y quedarian CIEGAS: preposiciones—, o el extractor dejo de ver su
array (una entrada partida en dos lineas, un slug detras del file, la declaracion renombrada).
Con lista vacia esta comprobacion pasaria en verde

0 !== 1
```

Nombra `preposiciones` como categoría que quedaría CIEGA, tal y como exigía el criterio de
aceptación. Cazada además, en la misma corrida, por la extensión de DEUDA-02 (`las lineas de
entrada del array de cobertura de TRADUCCION tambien sobreviven byte a byte`).

### MUTACIÓN DEL EXTRACTOR (a) — `slug` y `file` en líneas distintas

La entrada vuelve, partida: `{ slug:` en una línea y `'preposiciones', file: …` en la siguiente.

| Corrida | Exit | Quién la caza |
|---|---|---|
| `node scripts/run-validation-271.mjs` | 1 | el reporter **sigue funcionando y contando**: imprime `TRAD-COV (96/96 …): FAIL (0/96 …)`. El dato está intacto; lo que está roto es el gate que lo vigila |
| `node --test tests/count-arrays-lockstep.test.js` | **1** | la **CLÁUSULA DE NO-VACUIDAD** (`0 !== 1`), no el `deepEqual` de ciegas |

### MUTACIÓN DEL EXTRACTOR (b) — el `slug` DETRÁS del `file`

No la pedía el plan, y es la que más prueba: `{ file: '…', slug: 'preposiciones', … }`. El ancla
de `slugsCiegos` sigue casando (`slug:` aparece en la línea que abre con `{`), así que ese helper
se queda VERDE por sí solo. `paresSlugFile` no forma par.

| Medición | Valor |
|---|---|
| `slugsCiegos(region, ['preposiciones'])` | `[]` ← **verde por sí solo** |
| `paresSlugFile(region).length` | `0` |
| `node --test tests/count-arrays-lockstep.test.js` | **1**, 1 subtest rojo |

El mensaje del rojo dice `quedarian CIEGAS: ninguna` — es decir, el `deepEqual([], [])` habría
pasado en verde y la cláusula de no-vacuidad es lo ÚNICO que separa este gate de ser vacuo. Es la
demostración limpia de por qué la cláusula va primero, y de que el modo de fallo de este repo no
es hipotético.

### Restauración y re-verificación

| Comprobación | Resultado |
|---|---|
| `git status --porcelain` de los dos ficheros | vacío |
| `node --test tests/count-arrays-lockstep.test.js` | exit **0** (52/52) |
| `node --test tests/*.test.js tests/fixtures/*.test.js` | 1298 tests / 1294 pass / **4 fail** — los mismos 4 pre-existentes |
| `node scripts/run-validation-271.mjs` | exit **1**, `TRAD-COV FAIL (0/96)` — el ROJO ESPERADO, no uno nuevo |
| `git diff --stat src/domain/ src/screens/app.js` | vacío |

## Task Commits

1. **Task 1 — GATE-01 en el reporter** — `af8a505` (feat)
2. **Task 2 (RED) — goldens del array de traducción en rojo** — `8df81d3` (test)
3. **Task 2 (GREEN) — helpers, gate contra disco y acotado por región** — `e78c7eb` (feat)

_No hubo commit de REFACTOR: no había nada que limpiar. Y el **Task 3 no tiene commit propio a
propósito**: su entregable es evidencia de corrida, y su árbol final es idéntico al inicial por
construcción (las mutaciones se restauran). Su registro es la sección de arriba._

## Accomplishments

- **`mcVariantCountOf`**, la primera unidad de conteo del proyecto que no es `exercises.length`.
  Y la población es «variantes `multiple-choice`» a propósito, no «variantes»: el schema RECHAZA
  `translationES` en `match` y `word-buttons` (SCH-02), así que un denominador que las incluyera
  daría 722/758 y sería **imposible de cerrar por construcción** — el gate se quedaría rojo para
  siempre y la única salida sería ablandarlo. El aviso del 46-01 se aplicó tal cual, y la
  población está nombrada en la cabecera de la tabla impresa para que nadie lea esas cifras como
  slots.
- **Dos magnitudes distintas, y escrito en el código por qué no se pueden fundir.** El `expected`
  cuenta variantes en el fichero; el `actual` que decide cuenta traducciones cuyo status DERIVADO
  es `validated`. La segunda igualdad del veredicto (variantes recorridas == esperadas) se declara
  por lo que es —la mitad estructural, **tautológica** sobre un árbol coherente, espejo de
  `totalActual === TOTAL_EXPECTED` en VAL-06— y no como si mordiera. El caveat de
  `tests/exercise-types.test.js:1328-1334` va citado en el sitio donde hacía falta resistirlo.
- **Rojo por AUSENCIA DE DATOS como veredicto distinto** del rojo por incumplimiento, con su
  propia razón impresa y su propia acción sugerida. Las dos rutas por las que un fichero ilegible
  puede llegar al gate están cubiertas: la del recorrido (vía `loadCategory`) y la de la
  derivación del `expected`, que antes moría con un ENOENT desnudo y ahora nombra el fichero, la
  causa y las dos salidas reales.
- **12 goldens fail-first** para el array nuevo, sobre cadenas literales del propio fichero de
  test —nunca sobre disco, que es lo que los hace deterministas— cubriendo ausencia, colisión de
  prefijo, un solo byte, `//`, `/* */`, slug a dos líneas, par cruzado, control verde, ordering y
  los dos del acotado.
- **La referencia del anti-ceguera se DERIVA del disco por PRESENCIA DE CAMPO**, no del registro
  de categorías: una categoría está declarada cubierta cuando su fichero tiene al menos una
  variante `multiple-choice` con la clave `translationES`. Consecuencia deliberada y buscada: en
  cuanto una categoría recibe su PRIMERA traducción, el gate EXIGE que esté enganchada. **No hay
  ventana en la que traducir sin enganchar salga verde** — que es la ventana por la que se colaron
  las Phases 41, 42 y 43.

## Decisions Made

1. **La referencia no puede ser `content/categories.json`.** Es la fuente del bloque 3, donde
   TODAS las registradas deben estar enganchadas. Aquí solo las cubiertas: el milestone traduce
   por fases (47-53), así que exigir las 18 hoy sería un rojo permanente e inservible, y un rojo
   inservible invita a relajar el gate — el mismo razonamiento con el que el bloque 8 de este
   fichero decidió no gatear las versiones de milestone en los SKILL.md.
2. **El `actual` que muerde es `validated`; la igualdad estructural se declara tautológica.**
   Decirlo en el comentario es la diferencia entre un gate honesto y uno que aparenta dos
   verificaciones donde hay una y media.
3. **`regionDeArray` devuelve cadena vacía, no el fuente completo.** El «fallback razonable»
   habría vuelto a mezclar los dos arrays el día que el reconocedor deje de casar, en silencio.
   Región vacía → cero pares → no-vacuidad roja: renombrar el array no puede pasar desapercibido.
   Hay un golden dedicado (`REGION AUSENTE`) precisamente porque es el modo de fallo del propio
   acotador.
4. **`categoriasDeclaradasCubiertas` es fail-loud sobre un JSON que no parsea.** Un
   `catch { continue }` habría convertido un fichero corrupto en «esta categoría no está
   cubierta», o sea en un gate verde. Se llama DENTRO de los tests y no a nivel de módulo por
   ATRIBUCIÓN del rojo (lección de la Phase 45-02: un fallo de carga se lee como «este fichero
   está roto», no como «este gate se puso rojo»).
5. **Un golden de ACOTADO acompaña al estrechamiento.** Sin él, el acotado por región no estaría
   comprobado y los otros nueve goldens del bloque no significarían nada: `preposiciones` saldría
   enganchada por la entrada del array de SLOTS y la ceguera del de TRADUCCIÓN se certificaría en
   verde. Es el mismo patrón del «control positivo junto a cada aserción de ausencia» que
   estableció el plan 46-01.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] La cláusula de no-vacuidad del bloque 3-bis contaba pares sobre el fichero ENTERO**

- **Found during:** Task 1 (al correr el meta-test tras añadir el array).
- **Issue:** `paresSlugFile(SRC)` sobre el fuente completo del reporter mezclaba los pares de los
  dos arrays: 19 pares contra 18 categorías registradas. El subtest se puso rojo, y **con razón**:
  dejaba de contar lo que dice contar.
- **Fix:** acotar la cláusula a la región de `CATEGORIES` con `regionDeArray`, y la del array
  nuevo a la suya. **No** se le sumó un margen: un margen la habría dejado comparando una cifra
  que ya no describe nada, que es CR-01 de la Phase 44 verbatim.
- **Files modified:** `tests/count-arrays-lockstep.test.js`
- **Verification:** las tres mutaciones del Task 3 siguen dando rojo tras el acotado, así que el
  estrechamiento no volvió vacua la cláusula. Y el rojo intermedio quedó registrado en el mensaje
  del commit `af8a505`, no escondido.
- **Committed in:** `e78c7eb` (Task 2 GREEN)

**2. [Rule 2 - Missing Critical] Canal de ceguera NUEVO abierto por el array de este propio plan**

- **Found during:** Task 2 (al razonar el acotado del punto anterior).
- **Issue:** el gate del bloque 3 escanea el fuente ENTERO con `slugsCiegos`. Con un segundo array
  que declara los MISMOS slugs, una categoría **borrada de `CATEGORIES`** y viva en el array de
  traducción seguiría apareciendo anclada: el bloque 3 la daría por enganchada estando ciega para
  el conteo de slots. El plan no lo anticipaba, y es un agujero que este plan habría abierto.
- **Fix:** aserción propia en el bloque 3-bis exigiendo que las 18 registradas estén ancladas
  DENTRO de la región de `CATEGORIES`, con el razonamiento escrito al lado. La cláusula de
  no-vacuidad region-scoped ya lo cazaría por recuento (17 ≠ 18); la aserción explícita nombra las
  categorías y hace que el cierre esté comprobado, no solo implicado.
- **Files modified:** `tests/count-arrays-lockstep.test.js`
- **Verification:** 52/52 verde; la mutación de desenganche sigue roja.
- **Committed in:** `e78c7eb` (Task 2 GREEN)

**3. [Rule 2 - Missing Critical] `mcVariantCountOf` moría con un ENOENT desnudo**

- **Found during:** Task 1 (mutación de no-vacuidad con un fichero declarado inexistente).
- **Issue:** con `expected` derivado, un fichero declarado e ilegible hace que la excepción salte
  en la DERIVACIÓN, antes de que exista `loadCategory` — el proceso muere con un stack trace y sin
  imprimir una sola fila. La truth «un fichero que no se pudo leer NO puede emitir PASS» se
  cumplía (exit ≠ 0), pero el rojo era ilegible, que es justo lo que el bloque 4 del meta-test
  anti-ceguera existe para traducir a un mensaje.
- **Fix:** `try/catch` con `console.error` + `process.exit(1)` que nombra el fichero, la causa y
  las dos salidas reales (reparar, o retirar la entrada). Polaridad del guard de coherencia, no de
  la etiqueta cosmética del milestone: esto es el `expected` del veredicto, no un rótulo.
- **Files modified:** `scripts/run-validation-271.mjs`
- **Verification:** mutación re-ejecutada con el `expected` derivado de un fichero inexistente →
  exit 1 con el diagnóstico nombrado en la primera línea de salida.
- **Committed in:** `af8a505` (Task 1)

### Desviación de alcance declarada (NO auto-arreglada)

**4. La suite completa NO termina en exit 0 — deuda PRE-EXISTENTE, fuera de alcance**

- **Línea base medida ANTES de tocar nada** (HEAD `c00a1b5`): 1284 tests, 1280 pass, **4 fail**.
- **Al terminar:** 1298 tests, 1294 pass, **4 fail** — los MISMOS cuatro subtests de
  `tests/requirements-traceability.test.js`. Los 14 tests nuevos pasan todos; cero regresiones.
- **Por qué no se arregla aquí:** es el registro de requisitos de v2.1, no el pipeline de
  traducción. Ya está en `.planning/WINDOWS.md` y en `deferred-items.md` desde el plan 46-01.

---

**Total deviations:** 3 auto-arregladas (las tres Rule 2) + 1 desviación de alcance declarada.
**Impact on plan:** las tres eran necesarias para la corrección, y **las tres son agujeros en
gates**, dos de ellos abiertos por el propio array que este plan añade. Cero scope creep: ni un
fichero fuera de los dos declarados en `files_modified`.

## Threat Flags

Ninguna. Este plan no añade superficie de red, ni endpoints, ni rutas de autenticación, ni acceso
a ficheros gobernado por input: los dos ficheros tocados leen rutas CONSTANTES del propio repo.
Las dos entradas del registro STRIDE con disposición `mitigate` quedan mitigadas y verificadas:

| Threat | Mitigación aplicada | Verificación |
|---|---|---|
| T-46-13 (un gate que certifica en verde midiendo nada) | cláusula de no-vacuidad ANTES de cada assert, con la cifra derivada del disco; array vacío o fichero ilegible → ROJO por ausencia de datos | las tres mutaciones del Task 3 EJECUTADAS con exit code registrado, incluida la que deja `slugsCiegos` en verde |
| T-46-14 (umbral ablandado silenciosamente) | veredicto por IGUALDAD DE ENTEROS; cero porcentaje, redondeo o umbral flotante | aserción de fuente sobre la región del sub-gate: 0 líneas con `toFixed`/`Math.round`/división/`0.99` |

`T-46-SC` (legitimidad de paquetes) no aplica: cero instalaciones en este plan.

## Known Stubs

Ninguno. Los dos ficheros están completos y en producción: el gate corre, muerde y su veredicto
gobierna el exit code hoy.

Lo que SÍ queda declarado como estado intermedio esperado —y no es un stub— es el rojo de
`TRAD-COV`: el gate está entero, lo que falta es el CONTENIDO que lo satisfaga (las 95
traducciones del plan 46-04). Registrado en `.planning/WINDOWS.md` como `unmet-truth` para que
siga visible en el gate de ship si el 46-04 no lo cerrase.

## Issues Encountered

- **El array nuevo rompió un gate existente en cuanto se declaró**, y era el resultado correcto:
  la cláusula de no-vacuidad del bloque 3-bis contaba pares sobre el fichero entero. El commit del
  Task 1 lo declara en su mensaje en vez de esconderlo, porque un rojo intermedio explicado es
  información y un rojo intermedio silencioso es deuda.
- **El caveat de la tautología es una tentación real, no una nota de estilo.** La forma más corta
  del gate —comparar variantes contra variantes— sale sola al escribirlo, tiene aspecto de estar
  verificando y no puede fallar nunca. Hizo falta escribir en el código qué mitad muerde y qué
  mitad no para que la siguiente lectura no la «simplifique».
- **La mutación que más enseñó no estaba en el plan.** Poner el `slug` detrás del `file` deja
  `slugsCiegos` en VERDE y solo la no-vacuidad lo caza: sin ella, el gate sería vacuo con las
  18 categorías ancladas y el reporter imprimiendo cifras correctas. Es el argumento entero de
  por qué la cláusula va primero, en una sola corrida.
- **Ninguna incidencia con las líneas que citaba el plan:** `:289-290`, `:292-316`, `:373`,
  `:429-472`, `:576-589`, `:628` y `:747-759` coincidían con el disco.

## User Setup Required

None — cero dependencias nuevas, cero configuración, cero claves. El gate de legitimidad de
paquetes no aplica por ausencia de instalaciones, no por omisión.

## Next Phase Readiness

**Listo para el plan 46-04 (las 95 traducciones que faltan):**

- El gate ya está montado y **ya está rojo**, así que el 46-04 tiene un semáforo real: cada
  traducción autorada y validada mueve `validated` un punto, y el `missing` de la tabla dice
  cuántas quedan sin necesidad de contar nada a mano.
- El rojo imprime la **dirección compuesta `<slot-id>#<k>`** de cada disputed y el comando del
  quórum con sus dos `by` distintos: la salida del reporter es la lista de trabajo.
- **Aviso mecánico:** hoy `pending=1` y `missing=95`. Autorar una traducción la mueve de `missing`
  a `pending`, **no** a `validated` — el gate solo baja de verdad cuando pasa el quórum. Un
  `pending` alto a mitad del 46-04 es progreso normal, no un fallo.
- **Y el enganche es automático por diseño:** las otras 17 categorías NO están en
  `TRANSLATION_COVERAGE`, así que en cuanto una reciba su primera traducción (Phases 47-53) el
  anti-ceguera se pondrá ROJO exigiendo su entrada. Eso es la funcionalidad, no un bug: el olvido
  de enganchar ya no puede emitir un PASS.

**Nota para el plan 46-05 (verificación por mutación de cierre):** las mutaciones 1 y 2 de D-46-18
(dejar una traducción en `pending`; quitarle los acentos a una traducción) van contra el gate de
ESTE plan y contra el prompt del 46-02, y **solo se pueden ejecutar cuando exista una traducción
`validated`** — hoy no hay ninguna. Es correcto que estén en el 46-05 y no aquí.

**Regla de la casa que aplica desde aquí (D-46-18):** si el code review de esta fase propone un fix
que toque `TRANSLATION_COVERAGE`, el sub-gate `TRAD-COV`, `regionDeArray` o
`categoriasDeclaradasCubiertas`, ese fix se verifica con la MISMA mutación que el código que
arregla. 2 de 4 fixes de revisor en la Phase 44 eran incorrectos y uno era peor que el bug.

## Self-Check: PASSED

- Los 2 ficheros de `files_modified` existen en disco y su diff contra `c00a1b5` es 312+/1- y
  515+/2-.
- Los 3 commits declarados existen en `git log`: `af8a505`, `8df81d3`, `e78c7eb`.
- `grep -c 'TRANSLATION_COVERAGE' scripts/run-validation-271.mjs` ≥ 1 y
  `grep -c 'TRANSLATION_COVERAGE' tests/count-arrays-lockstep.test.js` ≥ 1 (el `contains` de los
  dos artefactos del plan).
- `grep -c 'deriveStatus' scripts/run-validation-271.mjs` = 7; el bucle nuevo usa
  `effectiveStatus`, no una comparación local de `verdict`.
- `grep -c 'const SRC_TRAD_' tests/count-arrays-lockstep.test.js` = 9 (≥ 9 exigidos), y ninguno
  llama a `readSrc` ni a `readFileSync`: 0 ocurrencias de cada uno en el bloque de goldens.
- `grep -c "function slugsCiegos\|function paresSlugFile\|function sinComentarios"` = 3 — una
  definición de cada, no se duplicó el escáner.
- Offsets dentro del `test(...)` del gate contra disco: no-vacuidad en 1114, `deepEqual` de ciegas
  en 1802 → la cláusula va PRIMERO.
- `git status --porcelain` de los dos ficheros: vacío (mutaciones restauradas).
- `git diff --stat src/domain/ src/screens/app.js`: vacío.
- Suite: 1298 / 1294 / 4 — los mismos 4 de la línea base `c00a1b5`.
- Reporter: exit 1 con `TRAD-COV FAIL (0/96)` — el rojo esperado y documentado.

---
*Phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones*
*Completed: 2026-08-13*
