---
phase: 45-deuda-del-arn-s-de-tests
plan: 02
subsystem: arnés de tests / gate anti-ceguera
tags: [deuda-02, wr-07, source-assert, gate, anti-cr-01, integridad-del-escaner]
status: complete

requires:
  - "tests/count-arrays-lockstep.test.js (bloques 1-6, Phases 44 y 45-01)"
  - "content/categories.json como referencia de disco"
  - "scripts/run-validation-271.mjs como silueta destino del par slug ↔ file"
provides:
  - "CATEGORIES_WITH_EXPLANATIONS como TERCERA fuente de conteo, cubierta por slugsCiegos Y por paresCruzados"
  - "Ancla de slugsCiegos acotada a una sola línea (WR-07), con golden fail-first"
  - "Guard de integridad del escáner: ninguna línea de entrada sobrevive alterada a sinComentarios"
  - "Identidad ASCII de los 18 slugs registrados, congelada"
affects:
  - "tests/exercise-types.test.js (18 entradas + comentario de alta)"
  - "la prosa del gate: cabecera, COUNT_ARRAY_SOURCES, ALCANCE DELIBERADO, separador y nombres de tests"

tech-stack:
  added: []
  patterns:
    - "source-assert (D-44-07): leer el TEXTO, nunca importar — la 3ª fuente añade su propia razón de no-importabilidad"
    - "la referencia SIEMPRE del disco (Pattern B): ninguna cifra nueva transcrita"
    - "cláusula de no-vacuidad por conteo derivado, y va PRIMERO (anti CR-01)"
    - "convergencia de forma: las 3 fuentes declaran par slug + file en la misma línea y en ese orden"
    - "prosa redactada en términos de COUNT_ARRAY_SOURCES, no enumerando un número"

key-files:
  created: []
  modified:
    - tests/exercise-types.test.js
    - tests/count-arrays-lockstep.test.js

decisions:
  - "D-45-05 (45-02) — Opción A (reformar el array), no Opción B (enseñar al extractor)"
  - "D-45-06 — WR-07 SÍ (con golden fail-first); WR-12 NO, queda como deuda abierta por escrito"
  - "D-45-07 — la prosa que enumeraba «las DOS fuentes» se reescribe en términos de COUNT_ARRAY_SOURCES, nombres de test incluidos"

metrics:
  duration: "~55 min"
  completed: 2026-08-12

actuals:
  tokens: 5700
  tasks: 3
  commits: 3
---

# Phase 45 Plan 02: DEUDA-02 — la tercera fuente de conteo entra en el gate Summary

`CATEGORIES_WITH_EXPLANATIONS` deja de ser un array que nadie vigila: declara par `slug` ↔ `file`
en la silueta del reporter, entra en `COUNT_ARRAY_SOURCES` y queda cubierta por los **dos** gates.
Borrarle una entrada ya no encoge la suite en silencio con exit 0 — se ha visto el rojo en las
cinco formas, transcrito literal y revertido.

## Qué se construyó

**1. Las 18 entradas toman forma parseable (`tests/exercise-types.test.js`).** Cada entrada declara
`slug: '<slug>',` **delante** del `file:` y en la **misma línea**, con las columnas alineadas igual
que `CATEGORIES` en `scripts/run-validation-271.mjs`. La clave es inerte para el consumo —el bucle
destructura solo `file` y `expected`— y existe para el ancla del gate. Ningún `expected` tocado: los
9 literales que muerden y los 9 tautológicos (deuda IN-03) se quedan como estaban.

**2. La tercera fuente dada de alta.** `'tests/exercise-types.test.js'` en `COUNT_ARRAY_SOURCES`.
Como declara pares, entra por la rama del par: la fuente queda cubierta por `slugsCiegos` **y** por
`paresCruzados`, así que el copia-pega `fare-ind` entre slug y file también queda cazado aquí, gratis.
Verificado sobre disco: **18 pares extraídos, 0 cruzados**.

**3. WR-07 — el ancla deja de cruzar saltos de línea.** `slug:\s*` → `slug:[^\S\n]*`, que es
**exactamente** la clase que `ENTRADA_CON_FILE` de `paresSlugFile` ya usaba: las dos funciones que
el fichero declara que comparten ancla ahora lo comparten de verdad, y no solo en el comentario.
Sin cuantificadores anidados (T-44-03-03). Golden nuevo `SRC_SLUG_A_DOS_LINEAS`, fail-first
committeado.

**4. Guard de integridad del escáner (bloque 3-ter).** Para cada fuente declarada, toda línea de
entrada del texto **crudo** tiene que sobrevivir **byte a byte** a `sinComentarios`. Reutiliza la
mitad posicional del ancla compartida (`LINEA_DE_ENTRADA`), no un tercer extractor. Cláusula de
no-vacuidad primero, con la referencia derivada del disco. Y el test de identidad ASCII de los 18
`id`, que es lo que hace correcta la comparación byte a byte del ancla.

**5. La prosa que el cambio volvía falsa, actualizada** (no como pulido — D-45-07): la cabecera
justifica la no-importabilidad de las **tres** (la 3ª por su propia razón: `const` de módulo no
exportado, y aunque lo exportase, importar un fichero de test re-registraría sus `describe`); el
comentario de `COUNT_ARRAY_SOURCES`, el separador de la sección 3 y los nombres del `describe` y del
test de la disyuntiva se redactan **en términos de `COUNT_ARRAY_SOURCES`**, no enumerando un número,
que es lo que los hace no envejecer; y el párrafo `ALCANCE DELIBERADO` de `sinComentarios` lleva
ahora el **inventario real** de literales regex por fuente.

## Mediciones, fechadas — 2026-08-12

| Medida | Antes del plan | Tarea 1 | Tarea 2 | Tarea 3 |
|---|---|---|---|---|
| `node --test tests/count-arrays-lockstep.test.js` | 27 pass / 0 fail | 28 | 29 | **31** |
| `node --test tests/exercise-types.test.js` | **183** pass / 0 fail | **183** | 183 | **183** |
| Invocación canónica (`tests/*.test.js tests/fixtures/*.test.js`) | 1167 | 1168 | 1169 | **1171** |
| Idem con `VAL_07_STRICT=1` | 1185 | — | — | **1189** |

El `# pass` de `exercise-types.test.js` es **idéntico antes y después** (183): la prueba mecánica de
que la clave nueva es inerte para el consumo (A4 del research).

> **Nota sobre las cifras del plan.** Los criterios de aceptación transcriben `# pass 25` para el
> gate al cerrar la tarea 1. El valor real es **28**: la cifra del plan se computó antes de que el
> plan 45-01 añadiera sus 3 tests. No se sustituye una cifra transcrita por otra — estas viven
> **solo aquí**, fechadas y como medición. En el arnés no se assertó ningún conteo nuevo.

## Verificación por mutación — los 7 rojos observados

Ninguno inferido. Salida transcrita de la terminal; los 7 revertidos.

### 1. `boundary` — borrar UNA entrada (el rojo que define DEUDA-02)

```
$ perl -ni -e "print unless /^  \{ slug: 'fare-indefiniti',/" tests/exercise-types.test.js
$ node --test tests/count-arrays-lockstep.test.js; echo "exit=$?"
        INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: fare-indefiniti
        + actual - expected
        + [
        +   'fare-indefiniti'
        + ]
        - []
not ok 3 - gate anti-ceguera — las fuentes de conteo declaradas enganchan las categorias registradas (INT-02)
# tests 28
# pass 27
# fail 1
exit=1
```

Nombra **exactamente** esa categoría y ninguna otra.

### 2. `empty` — el array a `[]`

```
        INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: avere,
        essere, preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero,
        profesiones, articoli, partitivos, presente-regolare, dimostrativi, possessivi, modali,
        riflessivi, fare-indicativo, fare-congiuntivo, fare-cond-imperativo, fare-indefiniti
# pass 26
# fail 2
exit=1
```

Las 18 registradas, **en el orden de `content/categories.json`** (que es también la prueba de la
propiedad `ordering`). El segundo rojo es la disyuntiva, y su mensaje es **verdadero** en ese
estado: `tests/exercise-types.test.js: NO declara \`file\` por entrada y tampoco DERIVA la ruta del
slug (no contiene \`content/exercises/${slug}.json\`): canal de ceguera nuevo` — con el array vacío
no hay ni pares ni derivación, así que la causa que nombra es la real.

### 3 y 4. `adjacency` — cada hermano del prefijo ambiguo `fare-ind`, por separado

```
$ (borrada solo fare-indicativo)
        INT-02 / D-44-06: … quedaria CIEGO a estas categorias: fare-indicativo
# pass 27 / # fail 1 / exit=1

$ (borrada solo fare-indefiniti)
        INT-02 / D-44-06: … quedaria CIEGO a estas categorias: fare-indefiniti
# pass 27 / # fail 1 / exit=1
```

Ninguno de los dos nombra al otro. La colisión `fare-ind` no ancla nada, también sobre la 3ª fuente.

### 5. WR-07 — fail-first del golden nuevo (revertido SOLO el fix del ancla)

```
        WR-07: el hueco tras `slug:` es whitespace HORIZONTAL; con `\s*` esta forma pasaba por enganchada
        + actual - expected
        + []
        - [
        -   'fare-indefiniti'
        - ]
not ok 1 - golden-NEGATIVO de ANCLA A DOS LINEAS: la clave y su valor en lineas distintas NO anclan (WR-07)
# tests 29
# pass 28
# fail 1
exit=1
```

El `+ []` es el bug entero en una línea: con `\s*`, un slug cuyo valor entrecomillado vive en la
línea SIGUIENTE se reportaba **enganchado**.

### 6. Integridad del escáner — dos entradas envueltas en un comentario de bloque

```
        DEUDA-02: estas lineas de entrada NO sobreviven identicas a sinComentarios, asi que el ancla
        del gate no las ve como el fichero las escribe. Las dos causas son reales y el diagnostico no
        puede elegir una: o estas entradas estan envueltas en un comentario de bloque —deliberado o
        accidental, y entonces la ceguera ya existe—, o un literal de expresion regular con comilla
        desparejada desalineo el escaner en esa linea:
          tests/exercise-types.test.js:1366: { slug: 'modali',     file: … },
          tests/exercise-types.test.js:1367: { slug: 'riflessivi', file: … },
not ok 5 - integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)
# pass 29
# fail 2
exit=1
```

Nombra **las dos líneas**, con su número. El mensaje enuncia las dos causas posibles porque las dos
son reales: atribuir una sola sería un diagnóstico plausible y falso.

### 7. No-vacuidad — el reconocimiento de líneas de entrada devuelto a lista vacía

```
$ (LINEA_DE_ENTRADA sustituida por /^ZZZ_EL_ANCLA_DEJO_DE_CASAR/)
      error: 'DEUDA-02 / T-45-02-03: el reconocimiento de lineas de entrada ve 0 lineas en las 3
      fuentes declaradas y content/categories.json registra 18 categorias: o las fuentes dejaron de
      declarar sus entradas, o el ancla dejo de reconocerlas — y con lista vacia esta comprobacion
      pasaria en verde sin haber mirado ni una linea'
# pass 30 / # fail 1 / exit=1
```

Sin esa cláusula el `deepEqual([], [])` habría pasado en **verde certificando nada**: CR-01 verbatim.

### Extra a) SIN falso rojo — una entrada comentada con `//`

```
$ (comentada la entrada de partitivos con //)
        INT-02 / D-44-06: … quedaria CIEGO a estas categorias: partitivos
# pass 30
# fail 1
exit=1
```

**Exactamente un** diagnóstico, y verdadero: `slugsCiegos` rojo, el guard nuevo **verde** (esa línea
deja de abrir con `{` y por tanto deja de ser línea de entrada). Duplicar el rojo con un segundo
diagnóstico habría sido ruido.

### Extra b) Identidad ASCII — un `id` con acento

```
$ (content/categories.json: "profesiones" → "profesionés")
        DEUDA-02: estos id de content/categories.json no son ASCII puro, asi que la identidad byte a
        byte del ancla podria fallar por composicion Unicode: profesionés
# pass 26 / # fail 5 / exit=1
```

Revertido con `git checkout -- content/categories.json`; `git status --short` sin residuo.

### `ordering` — verde indiferente al orden

Movida la entrada de `articoli` de la posición 8 a la 1: `# tests 28 / # pass 28 / # fail 0` en el
gate y `183` en `exercise-types`. El veredicto no depende del orden de las entradas; el orden del
**reporte** sí es el de `content/categories.json` (rojo 2).

## Decisiones

Las tres del plan, aplicadas tal cual:

- **D-45-05 (45-02) — Opción A.** Reformar el array, no enseñar al extractor. Cero regex nueva que
  mantener, cobertura por los dos gates en vez de por uno, y las tres fuentes quedan
  estructuralmente idénticas — que es lo que hará que la cuarta se enganche sin pensar.
- **D-45-06 — WR-07 sí, WR-12 no.** Ver «Deuda abierta».
- **D-45-07 — la prosa se actualiza como parte del fix.** Y un grado más de lo que el plan pedía: en
  vez de escribir «las TRES fuentes» (que se quedaría corta el día de la cuarta), se redacta en
  términos de **`COUNT_ARRAY_SOURCES`**.

## Desviaciones del plan

### 1. [Rule 3 — bloqueo] `git checkout --` como recipe de revert destruye trabajo NO committeado

- **Encontrado en:** tarea 1, revirtiendo el primer rojo obligatorio.
- **Problema:** el criterio de aceptación dice literalmente «después `git checkout --
  tests/exercise-types.test.js`». En ese momento las 18 entradas reformadas **todavía no estaban
  committeadas**, así que el checkout no revirtió la mutación: revirtió la mutación **y el trabajo
  de la tarea**, dejando el fichero en el estado de HEAD (0 entradas con `slug`). Confirmado con
  `grep -c "^  { slug: '"` → `0`.
- **Arreglo:** copia de trabajo en el scratchpad antes de cada mutación y restauración desde ella
  (`cp $SCR/exercise-types.BASE.js tests/…`). `git checkout --` se reservó para
  `content/categories.json`, que sí estaba limpio en HEAD.
- **Coste:** rehacer la edición del array. Ningún rojo perdido: los cinco se re-observaron sobre el
  estado bueno.

### 2. [Transparencia] Un fallo de CARGA no es el golden poniéndose rojo

- **Encontrado en:** tarea 2, primer intento del fail-first de WR-07.
- **Problema:** la sustitución con `perl` para revertir el ancla se comió el escape del backtick
  (`(['"\`])` → `(['"`])`), rompiendo el template literal. El runner devolvió
  `not ok 1 - tests/count-arrays-lockstep.test.js` / `# tests 1` / `exit=1`. Es rojo, y **no vale**:
  un fichero que no parsea falla por sintaxis, no por el golden. Aceptarlo habría sido exactamente
  el vicio que esta fase paga — un rojo plausible en vez del rojo real.
- **Arreglo:** mutación por sustitución de cadena exacta en Python, y verificación de que el rojo es
  el del `describe` de goldens (`not ok 1 - golden-NEGATIVO de ANCLA A DOS LINEAS …`, `# tests 29`).

### 3. [Precisión] El párrafo `ALCANCE DELIBERADO` se partió entre la tarea 1 y la tarea 3

El plan pide en la tarea 1 reescribir ese párrafo «remitiendo al guard de la Tarea 3», y en la
tarea 3 volver a actualizarlo para que remita a ese guard. El commit de la tarea 1 habría citado un
bloque **que aún no existía**. Se hizo así: en la tarea 1, el inventario real de literales regex y
la cláusula que acota el daño; en la tarea 3, la frase que remite al bloque 3-ter. Cada commit
queda verdadero por sí solo, y el resultado final es el que el plan describe.

### 4. [Transparencia] Colisión de ID de decisión con el plan 45-01

`45-02-PLAN.md` reserva **D-45-05** para «Opción A» desde el momento de planificar. El plan 45-01,
al descubrir en ejecución que su lockstep era vacuo, registró su decisión improvisada también como
**D-45-05** («el lockstep cuenta ocurrencias»). Hay dos D-45-05 vivos en la fase. Aquí se registra
como **D-45-05 (45-02)** y no se toca el SUMMARY del otro plan (artefacto ajeno). **Propuesta para
el cierre de fase:** renumerar la del 45-01 a **D-45-08**, que es la improvisada. Se deja escrito
para que la auditoría lo encuentre en vez de descubrirlo.

## Deuda abierta (D-45-06) — WR-12

`assert.equal(pares.length, SLUGS_REGISTRADOS.length)` del bloque 3-bis solo se aplica a la fuente
`REPORTER`. Queda **fuera por escrito**, no por olvido: es ortogonal a DEUDA-02, la Opción A no lo
agrava (no mete la 3ª fuente en esa cláusula) y su fix cambiaría la semántica de un assert que hoy
pasa — riesgo sin criterio de éxito que lo pida. Registrado aquí como deuda viva.

## Assumption declarada como `unresolved`

El edge `precision` de DEUDA-02 sigue sin aplicar y se mantiene `unresolved` con el motivo del plan:
el gate no hace aritmética, compara conjuntos de cadenas y acumula listas. No se fabrica un criterio.

## Criterios de aceptación

| Criterio | Resultado |
|---|---|
| Gate verde, exit 0 | ✅ `# tests 31 / # pass 31 / # fail 0` |
| `exercise-types.test.js` mismo `# pass` que antes | ✅ 183 → 183 |
| `grep -c "^  { slug: '" tests/exercise-types.test.js` = 18 | ✅ `18` |
| `grep -cE "file:.*slug:"` = 0 (ningún slug detrás de su file) | ✅ `0` |
| ROJO `boundary` (una entrada) | ✅ nombra `fare-indefiniti` y nadie más |
| ROJO `empty` (array a `[]`) | ✅ nombra las 18 registradas |
| ROJO `adjacency` en los dos sentidos | ✅ cada hermano por separado |
| VERDE indiferente al orden | ✅ 28/28 con `articoli` movida |
| `grep -ci 'las dos fuentes'` sobre la salida del gate | ✅ `0` |
| ROJO fail-first de WR-07 | ✅ `+ []` vs `- ['fare-indefiniti']`, exit 1 |
| Ancla idéntica a la de `paresSlugFile` | ✅ las dos usan `slug:[^\S\n]*` (lectura + golden que asserta que coinciden) |
| ROJO del guard de integridad (bloque) | ✅ nombra las 2 líneas con su número |
| ROJO de la no-vacuidad | ✅ `ve 0 lineas … registra 18 categorias` |
| SIN falso rojo con `//` | ✅ guard verde, solo `slugsCiegos` rojo |
| ROJO del test ASCII | ✅ nombra `profesionés`; revertido |
| 18 pares extraídos / 0 cruzados sobre la 3ª fuente | ✅ medido |
| Canónica verde | ✅ `1171/1171`, exit 0 |
| `VAL_07_STRICT=1` verde | ✅ `1189/1189` |
| `git status --short` sin residuo en `tests/` ni en `content/` | ✅ |
| Ninguna cifra nueva transcrita en el arnés | ✅ todo derivado (`SLUGS_REGISTRADOS.length`, `COUNT_ARRAY_SOURCES.length`) |

## Known Stubs

Ninguno. No se dejó código sin cablear, ni test saltado, ni `<verify>` sin correr. Los 3 gates
nuevos corren en la suite y los 7 rojos se observaron.

## Deferred Issues

- **WR-12** — arriba, con motivo (D-45-06).
- Colisión de ID **D-45-05** entre 45-01 y 45-02 — propuesta de renumerado arriba.
- `.planning/research/.cache/` sin ignorar y `.planning/phases/45-*/.gitkeep` siguen sin tocar
  (heredados, ya registrados en `deferred-items.md` del plan 45-01).

## Self-Check: PASSED

- `tests/exercise-types.test.js` — FOUND (18 entradas con `slug:`)
- `tests/count-arrays-lockstep.test.js` — FOUND (3ª fuente, ancla WR-07, bloque 3-ter)
- commit `150d079` — FOUND
- commit `1b85fc1` — FOUND
- commit `513c8cd` — FOUND
