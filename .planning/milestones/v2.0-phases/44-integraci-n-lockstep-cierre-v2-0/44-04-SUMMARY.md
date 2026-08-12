---
phase: 44-integraci-n-lockstep-cierre-v2-0
plan: 04
subsystem: testing / los gates de los cruces multi-categoría — predicado de `fare` y frontera del gloss
tags: [gap-closure, WR-02, WR-03, mutation-testing, source-assert, golden, frontera-de-palabra, particion, C5-leak, R1, D-44-02, D-54, INT-03]
status: complete

requires:
  - phase: 44-02
    provides: "los 3 cruces multi-categoría en disco (`fare-indicativo-300`, `-301`, `fare-indefiniti-300`), validados por quórum, y la partición BASE / CRUCE que re-apuntó los gates de paradigma a `allVariants()`"
  - phase: 44-03
    provides: "el arnés de verificación por MUTACIÓN en serie (commit → mutar → rojo → `git checkout --` → verde) y la disciplina de cláusula de NO-VACUIDAD de CR-01"
  - "`ESSERE_FORMS` de tests/content-fare-indicativo.test.js — la whitelist de auxiliares que el gate G1 autoriza, y por tanto la fuente de la resta"
provides:
  - "`pareceFare` — el predicado de `fare` DERIVADO de `ESSERE_FORMS`, declarado detrás de su fuente (sin TDZ), que sustituye la prohibición ciega de la inicial `f-`"
  - "la misma resta en `CRUCES_AJENOS` de tests/content-fare-indefiniti.test.js, con la whitelist local ANCLADA por source-assert al literal del hermano"
  - "cláusula de NO-VACUIDAD de `CRUCES_AJENOS`: el gate ya no puede pasar sin haber mirado nada"
  - "gate A — `fare-indicativo-301` FIJADO al 0-gloss (sin paréntesis y sin mención del español)"
  - "gate B — `fare-indicativo-300` conserva gloss y su gloss no exhibe el auxiliar castellano `haber`, con cláusula de EXISTENCIA por delante de la lista negra"
  - "gate C — `fare-indefiniti-300` conserva gloss y su gloss no traduce el modal examinado, con su propia lista negra que NO es la del vecino"
  - "los helpers puros `wordish` (clonado), `glosDe`, `auxHaberEn` y `modalesEsEn`, con 17 goldens nuevos committeados incluidos 4 guardias de falso positivo, dos de ellos tomados del contenido REAL"
  - "9 mutaciones observadas (7 exigidas + 2 extra sobre el ancla), con sus mensajes literales"
affects:
  - "content/exercises/fare-indicativo.json y content/exercises/fare-indefiniti.json (gobernados por los gates, BYTE-IDÉNTICOS)"
  - "cualquier alta futura de cruce en estas dos categorías: el gloss queda sujeto a la partición, y las options a la resta"
  - "la whitelist `ESSERE_FORMS`: ganar una forma con inicial f- (el congiuntivo `fossi`/`fosse`/`fossero`) ya NO rompe el gate — la resta la sigue sola, y el source-assert obliga a propagarla al fichero hermano"

actuals:
  tokens: 8329
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "DERIVAR el predicado de su whitelist en vez de escribir una lista paralela: el duplicado escrito a mano es lo que produce el falso rojo cuando la fuente evoluciona"
    - "declaración del predicado DETRÁS de su fuente cuando la deriva: un `Set` derivado de una `const` antes de su declaración es `ReferenceError` de TDZ al evaluar el módulo, y el fichero entero deja de correr sin que ningún test se ponga rojo"
    - "ancla entre dos ficheros de test por SOURCE-ASSERT sobre el texto, nunca por import: bajo `node --test tests/*.test.js` importar un test desde otro registra y corre sus `describe` dos veces"
    - "la extracción de un source-assert devuelve `null` y no `[]` cuando no encuentra su literal: un `[]` silencioso hace que el gate compare dos conjuntos vacíos y pase en verde habiendo perdido su fuente de verdad"
    - "gate de gloss por PARTICIÓN y no uniforme: la política real es asimétrica por slot, y un gate uniforme es falso en las dos direcciones (pone rojo el gloss legítimo o deja reponer el prohibido)"
    - "cláusula de EXISTENCIA del gloss POR DELANTE de la lista negra: sin ella, borrar el gloss deja la lista negra corriendo sobre `''` y el gate certifica en verde lo contrario de lo que dice"
    - "lista negra POR ESPEJO DEL HUECO: la del auxiliar castellano rige donde el hueco es el auxiliar y la del modal donde el hueco es el modal; reutilizar la del vecino pone rojo contenido validado"
    - "toda forma castellana se compara con FRONTERA DE PALABRA UNICODE y la perífrasis como BIGRAMA COMPLETO, con goldens de falso positivo tomados del contenido REAL como prueba"

key-files:
  created: []
  modified:
    - "tests/content-fare-indicativo.test.js"
    - "tests/content-fare-indefiniti.test.js"

key-decisions:
  - "El predicado `pareceFare` se TRASLADA detrás de `ESSERE_FORMS` en vez de derivarse en su sitio original: derivar el `Set` en la línea donde vivía `FARE_INITIAL_RE` es un `ReferenceError` de TDZ al evaluar el módulo y ningún test correría. Donde estaba queda un puntero que explica el traslado, para que nadie lo devuelva por estética."
  - "La alternación `/^(f|fa|fe)/i` se sustituye por la inicial simple `/^f/i` y se comprueba la equivalencia: el resultado solo se consumía vía `.test()`, así que la primera rama ya cubría lo que las otras dos fingían añadir."
  - "La whitelist del fichero de `fare-indefiniti` se escribe a mano y se ANCLA por source-assert, en vez de importarse: el import haría correr 14 `describe` del hermano una segunda vez y falsearía el conteo de la suite. El crecimiento exacto de +19 en la suite (13+6) es la prueba mecánica de que no se importó."
  - "`formasConFDelHermano()` devuelve `null` —y no `[]`— cuando no encuentra el literal, y el gate asserta ese `null` ANTES de comparar conjuntos. Es la lección de CR-01 aplicada a un source-assert: un `[]` silencioso pasa en verde comparando dos vacíos."
  - "El gate de gloss NO se aplica al gate G3 de `fare-indefiniti-300` (línea del `/^f/i` sobre sus PROPIAS options), que se deja intacto a propósito: ahí el pool son modales conjugados y su premisa —ninguna palabra legítima con inicial f-— es verdadera. WR-02 nombra `CRUCES_AJENOS`, que es el que recorre las options de `fare-indicativo-300` donde `essere` SÍ está autorizado."
  - "La lista negra del modal enumera la perífrasis de obligación como BIGRAMA (`tengo que`) y jamás como palabra suelta (`tengo`): el gloss real de la primera variante contiene `no tengo elección`, y compararlo por la palabra suelta pondría rojo contenido ya validado por quórum — reproduciendo el bug de WR-02 en el mismo plan que lo cierra."
  - "Se enumeran las formas castellanas en su ortografía acentuada RAE Y TAMBIÉN sin tilde: un gloss futuro escrito sin acentos sería el mismo leak con otra grafía, y el gate no puede depender de que la autoría acentúe."

patterns-established:
  - "Un gate que resta tiene que verificarse en las DOS direcciones: rojo con lo que debe morder y VERDE con lo que la resta autoriza. La mitad verde es el cierre real del falso rojo, y sin ella el arreglo no está probado."
  - "Un guardia de falso positivo vale cuando está tomado del CONTENIDO REAL en disco: `no tengo elección` y `nadie nos lo ha pedido` son goldens porque son lo que hay escrito, no ejemplos inventados."

requirements-completed: [INT-03]

coverage:
  - id: D1
    description: "El gate G1/G2 de `options` de los cruces resta las formas de `essere` que la whitelist de auxiliares autoriza, en vez de prohibir la inicial `f-` a ciegas — y la resta se DERIVA de `ESSERE_FORMS`"
    requirement: "INT-03"
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#NO muerde el passato remoto de essere, que la whitelist de auxiliares autoriza (el falso rojo de WR-02)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#la whitelist derivada NO esta vacia y todos sus miembros vienen de ESSERE_FORMS"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 1: 'fatto' inyectado en la entrada del gate → exit 1 nombrando fatto; MUTACIÓN 2: 'fui' inyectado → fail 0, exit 0 (el cierre de WR-02)"
        status: pass
    human_judgment: false
  - id: D2
    description: "El mismo arreglo en `CRUCES_AJENOS` de tests/content-fare-indefiniti.test.js, con su whitelist local anclada por source-assert al literal del hermano y con cláusula de no-vacuidad"
    requirement: "INT-03"
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#ANCLA: la whitelist con inicial f- de este fichero es EXACTAMENTE la del hermano, leida de su TEXTO (G-44-3-WR02)"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 3: 'fatto' inyectado en CRUCES_AJENOS → exit 1; MUTACIÓN 4: 'fui' → fail 0; MUTACIÓN extra A: falta `furono` en la whitelist local → rojo por igualdad de conjunto; MUTACIÓN extra B: la extracción pierde su literal → rojo por `devolvio nada`"
        status: pass
    human_judgment: false
  - id: D3
    description: "`fare-indicativo-301` está FIJADO al 0-gloss: ninguno de sus 3 prompts contiene paréntesis ni menciona el español, con no-vacuidad derivada del disco"
    requirement: "INT-03"
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#WR-03 gate A — fare-indicativo-301 esta FIJADO al 0-gloss: el leak C5 que el quorum cerro no puede volver (R1, D-41-05)"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 5: paréntesis repuesto en la entrada del gate → exit 1 con el mensaje del leak C5"
        status: pass
    human_judgment: false
  - id: D4
    description: "La frontera del gloss de `fare-indicativo-300` está codificada: el gloss EXISTE y no exhibe ninguna forma del auxiliar castellano `haber`, comparada con frontera de palabra unicode"
    requirement: "INT-03"
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#WR-03 gate B — fare-indicativo-300 CONSERVA su gloss y el gloss NO exhibe el auxiliar castellano espejo del hueco (R1)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#auxHaberEn: guardia de FALSO POSITIVO — mucha / fecha llevan la forma como subcadena y NO son el auxiliar"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 6: `he hecho` prefijado al gloss → exit 1 nombrando `he`; MUTACIÓN 7: gloss vaciado → exit 1 por la cláusula de EXISTENCIA, 0 rojos de lista negra"
        status: pass
    human_judgment: false
  - id: D5
    description: "El gloss de `fare-indefiniti-300` no traduce el modal examinado, con su propia lista negra (la perífrasis como bigrama) que NO es la del auxiliar castellano del vecino"
    requirement: "INT-03"
    verification:
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#WR-03 — el gloss del cruce CONSERVA su contenido y NO traduce el modal examinado (R1, G3)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#goldens de modalesEsEn: guardia de FALSO POSITIVO del contenido REAL — `no tengo elección` NO es la perifrasis de obligacion"
        status: pass
      - kind: unit
        ref: "tests/content-fare-indefiniti.test.js#goldens de modalesEsEn: segundo guardia del contenido REAL — el compuesto con `haber` es LEGITIMO en este cruce"
        status: pass
      - kind: integration
        ref: "MUTACIÓN 8: `tengo que` prefijado al gloss → exit 1 nombrándola; MUTACIÓN 9: gloss vaciado → exit 1 por la cláusula de EXISTENCIA, 0 rojos de lista negra"
        status: pass
    human_judgment: false
  - id: D6
    description: "`content/`, `src/` y `scripts/` terminan BYTE-IDÉNTICOS y el reporter sigue en `Milestone gate PASS`: las 9 mutaciones fueron transitorias y sobre la entrada del gate dentro del fichero de test"
    requirement: "INT-03"
    verification:
      - kind: integration
        ref: "git status --porcelain content/ src/ scripts/ → 0 líneas; git diff --name-only HEAD~3..HEAD → exactamente los 2 ficheros de test"
        status: pass
      - kind: integration
        ref: "node scripts/run-validation-271.mjs → VAL-06 PASS (250/250), VAL-08 PASS, VAL-04 PASS, 'Milestone gate PASS.', exit 0"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-08-12
---

# Phase 44 Plan 04: Cierre de WR-02 y WR-03 — el gate deja de contradecir al gate de al lado, y el gloss de los cruces pasa a tener predicado

**El predicado que prohibía la inicial `f-` a ciegas ahora RESTA las formas que la whitelist de auxiliares del propio fichero autoriza —verificado en las dos direcciones, rojo con `fatto` y VERDE con `fui`—, y los tres cruces tienen por fin el gate de gloss que su `notes` ya declaraba: el `-301` fijado al 0-gloss que el quórum impuso, y los otros dos con su frontera codificada, cada uno mirando su propio espejo y no el del vecino. `content/` byte-idéntico.**

## Performance

- **Duration:** 15 min (10:10 → 10:25)
- **Tasks:** 3/3
- **Commits:** 3
- **Ficheros tocados:** 2, exactamente los dos ficheros de test que el plan lista

## Conteos MEDIDOS en esta sesión (nunca transcritos)

| Medición | Al abrir el plan (árbol limpio) | Al cerrar el plan | Δ |
|---|---|---|---|
| `node --test tests/content-fare-indicativo.test.js` | `# tests 79 / # pass 79 / # fail 0` | `# tests 92 / # pass 92 / # fail 0` | **+13** |
| `node --test tests/content-fare-indefiniti.test.js` | `# tests 102 / # pass 102 / # fail 0` | `# tests 108 / # pass 108 / # fail 0` | **+6** |
| `node --test tests/*.test.js` | `# tests 1073 / # suites 192 / # pass 1073 / # fail 0` | `# tests 1092 / # suites 194 / # pass 1092 / # fail 0` | **+19** |

Las tres cifras «antes» se midieron con el árbol limpio, en esta misma sesión, antes de la primera edición.
**El +19 de la suite es exactamente 13 + 6**, y eso no es decorativo: es la prueba mecánica de que el ancla
entre los dos ficheros va por LECTURA DE TEXTO y no por import. Si el fichero de `fare-indefiniti` hubiera
importado a su hermano, los 16 `describe` del hermano se habrían registrado una segunda vez y la suite habría
crecido en más del doble. El criterio del plan lo pedía así por eso.

## Accomplishments

### Tarea 1 (tracer) — WR-02: el gate deja de contradecir al gate de al lado

Commit `dd78476`. Los dos ficheros.

**El bug, en una frase:** el predicado prohibía la inicial `f-` en las `options` de los cruces apoyándose en
la premisa escrita «en los pools de los cruces no hay ninguna palabra legítima con inicial f-». Su
contraprueba vivía 100 líneas más abajo en el mismo fichero: `ESSERE_FORMS` incluye el passato remoto
`fui, fosti, fu, fummo, foste, furono`, y el gate G1 de `fare-indicativo-300` autoriza EXPLÍCITAMENTE
cualquier miembro de esa whitelist como distractora de auxiliar (`AVERE.has(o) || ESSERE.has(o)`, verificado
en disco). Dos gates del mismo fichero decían cosas contradictorias sobre la misma palabra.

**El arreglo, DERIVANDO en vez de duplicando:**

```js
const FORMAS_CON_F_AUTORIZADAS = new Set(
  ESSERE_FORMS.filter((f) => /^f/i.test(f)).map((f) => f.toLowerCase())
);
const pareceFare = (w) => /^f/i.test(w) && !FORMAS_CON_F_AUTORIZADAS.has(w.toLowerCase());
```

El día que la whitelist gane el congiuntivo `fossi` / `fosse` / `fossero`, la resta lo sigue sola. Una lista
paralela escrita a mano sería la misma clase de duplicado que produjo el falso rojo.

**El traslado es mecánico y no cosmético.** El predicado vivía en la línea 123 y `ESSERE_FORMS` se declara en
la 218: derivar el `Set` en su sitio original es un `ReferenceError` de TDZ al evaluar el módulo, y el fichero
entero dejaría de correr sin que ningún test se pusiera rojo. Donde estaba queda un puntero que explica el
motivo, para que nadie lo devuelva por estética.

**La alternación redundante cae.** `/^(f|fa|fe)/i` equivalía EXACTAMENTE a `/^f/i` porque el resultado solo se
consumía vía `.test()` y la primera rama ya cubría lo que las otras dos fingían añadir. Comprobado:
`['fatto','faccio','farò','fui','fu','xyz'].every(w => BLIND.test(w) === /^f/i.test(w))` → `true`.

**Fail-first, sin tocar el árbol.** Los goldens se validaron contra el predicado CIEGO de antes:

```
con el predicado ciego, estos goldens saldrian ROJOS: fui, fosti, fu, fummo, foste, furono, Fu
```

**El segundo fichero, ANCLADO y no derivado.** `tests/content-fare-indefiniti.test.js` propagaba el mismo
predicado a los cruces de las otras tres categorías vía `CRUCES_AJENOS` —que recorre precisamente las 24
options de `fare-indicativo-300` y `-301`— y habría roto una segunda suite con el mensaje igualmente falso
«la exclusion de CONJUGATE dejaria de ser inocua». Su whitelist se escribe a mano (importar el hermano
falsearía el conteo de la suite) pero NO puede derivar en silencio, así que `formasConFDelHermano()` lee el
TEXTO del hermano, extrae el literal `ESSERE_FORMS`, filtra las formas con inicial `f-` y el gate exige
igualdad de conjunto. Devuelve `null` —y no `[]`— si no encuentra el literal, y el assert de `null` va
ANTES de comparar: un `[]` silencioso compararía dos vacíos y pasaría en verde habiendo perdido su fuente de
verdad. Es CR-01 aplicado a un source-assert.

**Cláusula de no-vacuidad de `CRUCES_AJENOS`.** Hoy son las 24 options de los 2 cruces de `fare-indicativo`,
pero la cifra NO se transcribe: se exige que la lista tenga contenido y que los cruces que la alimentan
existan. Sin ella, un refactor que dejara de recolectarlas dejaría el `deepEqual([], [])` pasando en verde.

**Las 4 mutaciones de la tarea** (commit `dd78476` primero, revert por `git checkout --`):

| # | Mutación | Resultado |
|---|---|---|
| 1 | `'fatto'` inyectado en `v.options` del gate de `fare-indicativo` | **ROJO**, exit 1 |
| 2 | `'fui'` inyectado en su lugar | **VERDE**, `fail 0`, exit 0 |
| 3 | `{o:'fatto'}` inyectado en `CRUCES_AJENOS` de `fare-indefiniti` | **ROJO**, exit 1 |
| 4 | `{o:'fui'}` inyectado en su lugar | **VERDE**, `fail 0`, exit 0 |

Mensajes literales de los dos rojos:

```
    not ok 11 - G1/G2 — ninguna opcion de ningun cruce contiene una forma de fare: la key vive en la vecina (D-44-02)
        D-44-02: fare-indicativo-300#0 mete una forma de fare en options —descontadas las formas de essere que la whitelist de auxiliares autoriza—: fatto — el hueco es de la categoria VECINA
# tests 84
# pass 83
# fail 1
```

```
    not ok 5 - EN POSITIVO: lo que CONJUGATE excluye —las options de los cruces ajenos— no contiene ninguna forma de fare (D-44-02)
        D-44-02: un cruce ajeno mete una forma de fare en options —descontadas las formas de essere que la whitelist de auxiliares autoriza— y la exclusion de CONJUGATE dejaria de ser inocua: MUT/MUT-300#0: "fatto"
# tests 104
# pass 103
# fail 1
```

**Los dos verdes son el cierre real de WR-02**, y son tan importantes como los rojos: con `'fui'` inyectado
—una forma que empieza por `f-` y que el gate G1 autoriza— los dos ficheros siguieron en `# fail 0` con exit
0. Con el predicado de antes, los dos habrían salido rojos con un diagnóstico falso. Eso es el gap.

**Dos mutaciones EXTRA sobre el ancla** (no las pedía el plan; son la evidencia de T-44-04-03):

```
== A) whitelist local DERIVADA (falta furono) ==
    not ok 4 - ANCLA: la whitelist con inicial f- de este fichero es EXACTAMENTE la del hermano, leida de su TEXTO (G-44-3-WR02)
        G-44-3-WR02: la whitelist local DERIVO de la del hermano — es la misma clase de duplicado que produjo el falso rojo

== B) la extraccion pierde su fuente de verdad ==
    not ok 4 - ANCLA: la whitelist con inicial f- de este fichero es EXACTAMENTE la del hermano, leida de su TEXTO (G-44-3-WR02)
      error: 'G-44-3-WR02: la extraccion de ESSERE_FORMS de tests/content-fare-indicativo.test.js devolvio nada — esta whitelist local acaba de perder su fuente de verdad y hay que re-anclarla, no comparar dos conjuntos vacios'
```

### Tarea 2 — WR-03, los dos gates de gloss de `fare-indicativo`, POR PARTICIÓN

Commit `8210a24`.

**El agujero:** el 0-gloss del bloque 4 se re-apuntó a los slots BASE durante 44-02, así que dejó de cubrir
los cruces, y el bloque 13 NO lo re-asertaba en ninguna forma pese a que su cabecera promete «RE-ASERTA los
gates que siguen rigiendo sobre ellos». La resolución documentada de `fare-indicativo-301` fue BORRAR sus 3
glosses por leak C5 —el gloss conjugaba el verbo del hueco (`repasamos` / `comete` / `revisáis`)— y hasta
hoy nada impedía reponerlos con la suite entera en verde.

**Y NO podía ser un gate uniforme**, que es la trampa que el plan marcó: el `-301` va a 0-gloss y el `-300`
de al lado CONSERVA gloss porque glosa el complemento y no la casilla. Un gate uniforme pondría rojo un gloss
legítimo o dejaría reponer el prohibido. Los dos gates son por partición y lo dejan escrito en su comentario.

**Gate A — el `-301` fijado al 0-gloss.** Ausencia de paréntesis Y ausencia de mención del español (el gloss
podría reponerse sin paréntesis), con la cláusula de no-vacuidad del número de variantes derivada del disco
por delante. El mensaje de assert dice POR QUÉ está rojo: el gloss que el quórum obligó a borrar.

**Gate B — la frontera del `-300`, con la cláusula de EXISTENCIA por DELANTE.** Primero que hay
EXACTAMENTE un paréntesis de apertura y contenido no vacío; después que el gloss no exhibe ninguna forma del
auxiliar castellano `haber`. El orden no es estético: sin la primera cláusula, borrar el gloss dejaría la
lista negra corriendo sobre `''` y el gate certificaría en verde lo contrario de lo que dice (T-44-04-01, la
especie de CR-01 aplicada al Core Value).

**Frontera de palabra unicode, no `includes` crudo.** El esbozo del code review usaba
`AUX_ES = ['he ', 'has ', 'ha ', ...]` con `gloss.includes(...)`, y eso pondría rojo un gloss futuro con
`mucha gente` o `la fecha de hoy` (contienen `ha` como sufijo) o con `hace tiempo` (como prefijo). Se clonó
`wordish` del fichero hermano y los dos guardias de falso positivo están COMMITEADOS como goldens — son lo
único que distingue este gate del `includes`.

**Foto del disco, fechada hoy 2026-08-12** (leída, nunca transcrita):

```
301: [null,null,null]
300: ["en español: esta mañana hice los deberes antes de salir",
     "en español: ayer hicimos un pastel para el cumpleaños de Marco",
     "en español: el mes pasado hicieron todo sin ayuda"]
```

Los 3 del `-301` sin paréntesis; los 3 del `-300` con su gloss en PRETÉRITO SIMPLE, que es exactamente la
condición de supervivencia que el pase de Opus dejó escrita.

**Las 3 mutaciones de la tarea** (commit `8210a24` primero):

```
== MUTACION A: parentesis repuesto en el -301 ==
    not ok 12 - WR-03 gate A — fare-indicativo-301 esta FIJADO al 0-gloss: el leak C5 que el quorum cerro no puede volver (R1, D-41-05)
      error: 'C5-leak / R1: fare-indicativo-301#0 recupero el gloss que el quorum obligo a BORRAR — el gloss de este cruce conjuga el verbo del hueco y entrega la casilla examinada: "Tu fai i compiti da solo, ma noi ___ tutto insieme. (en español: repasamos todo juntos)"'
# fail 1   REAL_EXIT=1
```

```
== MUTACION B1: auxiliar castellano inyectado en el gloss del -300 ==
    not ok 13 - WR-03 gate B — fare-indicativo-300 CONSERVA su gloss y el gloss NO exhibe el auxiliar castellano espejo del hueco (R1)
        R1: fare-indicativo-300#0 exhibe en el gloss el auxiliar castellano espejo del hueco (he) — el hueco ES el auxiliar, asi que el gloss tiene que ir en preterito simple: "en español: he hecho — esta mañana hice los deberes antes de salir"
# fail 1   REAL_EXIT=1
```

```
== MUTACION B2: gloss VACIADO en el -300 ==
    not ok 13 - WR-03 gate B — fare-indicativo-300 CONSERVA su gloss y el gloss NO exhibe el auxiliar castellano espejo del hueco (R1)
      error: 'G-44-3-WR03: fare-indicativo-300#0 se quedo sin contenido de gloss, asi que la lista negra de abajo estaria pasando sobre una cadena vacia: "Stamattina io ___ fatto i compiti prima di uscire. ()"'
# fail 1   REAL_EXIT=1

rojos por la LISTA NEGRA (prefijo 'R1: fare-indicativo-300#'): 0
rojos por la clausula de EXISTENCIA: 1
```

La última medición es la que importa: el rojo del gloss vaciado llega por la cláusula de EXISTENCIA y **cero
veces** por la lista negra. La cláusula que existe para que el gate no certifique sobre una cadena vacía es la
que mordió.

### Tarea 3 — WR-03, el gloss de `fare-indefiniti-300` no traduce el modal

Commit `abcaf9a`.

**La frontera ya estaba decidida en el `notes` —«el gloss NO traduce el modal»— y no tenía predicado.** Aquí el
hueco es el MODAL CONJUGADO, así que un gloss con `tengo que`, `puedo` o `quiero` entrega exactamente la
casilla que el cruce pregunta.

**Y su lista negra NO es la del vecino, que es la trampa central de la tarea.** En `fare-indicativo-300` el
hueco es el auxiliar y un compuesto con `haber` en el gloss es el leak; aquí el hueco es el modal y el
compuesto con `haber` es LEGÍTIMO — el gloss real de la tercera variante contiene `nadie nos lo ha pedido`,
validado por quórum. Reutilizar la lista del vecino habría reproducido el bug de WR-02 en el mismo plan que lo
cierra. Cada gate mira su propio espejo.

**La perífrasis va como BIGRAMA COMPLETO.** `tengo que`, nunca `tengo`: el gloss real de la primera variante
contiene `no tengo elección`, que NO es la perífrasis de obligación. Los dos guardias de falso positivo están
committeados como goldens **tomados del contenido real en disco**, no inventados.

**Foto del disco, fechada hoy 2026-08-12:**

```
[
 "en español: es una obligación del colegio, no tengo elección; si no, saco mala nota",
 "en español: porque el museo da su autorización",
 "en español: es un deseo nuestro, nadie nos lo ha pedido"
]
```

**Las 2 mutaciones de la tarea** (commit `abcaf9a` primero):

```
== MUTACION C1: la perifrasis de obligacion inyectada en el gloss ==
    not ok 4 - WR-03 — el gloss del cruce CONSERVA su contenido y NO traduce el modal examinado (R1, G3)
        R1 / G3: fare-indefiniti-300#0 traduce en el gloss el modal EXAMINADO (tengo que) — es la casilla que el cruce pregunta, y por la cascada D-54 el fallo resetea fare-indefiniti Y modali a la vez: "en español: tengo que hacerlo, es una obligación del colegio, no tengo elección; si no, saco mala nota"
# fail 1   REAL_EXIT=1
```

```
== MUTACION C2: gloss VACIADO ==
    not ok 4 - WR-03 — el gloss del cruce CONSERVA su contenido y NO traduce el modal examinado (R1, G3)
      error: 'G-44-3-WR03: fare-indefiniti-300#0 se quedo sin contenido de gloss, asi que la lista negra de abajo estaria pasando sobre una cadena vacia: "Domani io ___ fare i compiti: è un obbligo della scuola, non ho scelta, altrimenti prendo un brutto voto. ()"'
# fail 1   REAL_EXIT=1

rojos por la LISTA NEGRA ('R1 / G3: fare-indefiniti-300#'): 0
```

Nótese que el mensaje del rojo C1 nombra la perífrasis pese a que el gloss contiene TAMBIÉN `no tengo
elección`: el bigrama muerde donde debe y el `tengo` suelto sigue siendo invisible al gate. Es el guardia de
falso positivo funcionando dentro de un rojo real.

## Los tres gaps del cierre, con su evidencia

| Gap | Qué era | Cerrado por | Verificado por |
|---|---|---|---|
| G-44-3-WR01 | el gate anti-ceguera del reporter era sordo a una entrada comentada y al par cruzado | plan 44-03 | 3 mutaciones sobre el reporter real |
| **G-44-3-WR02** | el gate de options prohibía la inicial `f-` a ciegas y contradecía al gate G1 de al lado, en DOS ficheros | `pareceFare` derivado + ancla por source-assert | 4 mutaciones (2 rojas, **2 verdes**) + 2 extra sobre el ancla |
| **G-44-3-WR03** | los 3 cruces no tenían gate de gloss: el `-301` podía reponer el leak C5, y las fronteras del `-300` y de `fare-indefiniti-300` solo vivían en prosa | 3 gates por partición con cláusula de existencia por delante | 5 mutaciones rojas |

## Verificación final (tras las 9 mutaciones y sus reverts)

| Comprobación | Resultado |
|---|---|
| `node --test tests/content-fare-indicativo.test.js` | `# tests 92 / # pass 92 / # fail 0` |
| `node --test tests/content-fare-indefiniti.test.js` | `# tests 108 / # pass 108 / # fail 0` |
| `node --test tests/*.test.js` | `# tests 1092 / # suites 194 / # pass 1092 / # fail 0` |
| `node scripts/run-validation-271.mjs` | `VAL-06 PASS (250/250)`, `VAL-08 PASS`, `VAL-04 PASS`, **`Milestone gate PASS.`**, exit 0 |
| `git status --porcelain content/ src/ scripts/` | 0 líneas |
| `git diff --name-only HEAD~3..HEAD` | exactamente `tests/content-fare-indefiniti.test.js` y `tests/content-fare-indicativo.test.js` |
| whitelist DERIVADA (no escrita a mano) | `true` |
| predicado declarado DETRÁS de su fuente (sin TDZ) | `true` |
| ancla por LECTURA de texto, no por import | `true` |
| `FARE_INITIAL_RE` residual en el fichero | `false` (sustituido, no duplicado) |
| `COMPLEMENTOS_QUE_EXCLUYEN` antes de `modalesEsEn` | `true` |
| `wordish` en la ventana de `modalesEsEn` | `true` |
| foto del `-301` | `301: [null,null,null]` |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] El criterio de TDZ del propio plan lo defeteaba mi comentario puntero**

- **Found during:** Tarea 1, tras el paso 3.
- **Issue:** el criterio de aceptación es
  `s.indexOf('const ESSERE_FORMS') < s.indexOf('pareceFare')` y compara la PRIMERA aparición del token. El
  comentario puntero que el plan pide dejar en el sitio original (para explicar el traslado) mencionaba
  `pareceFare` por su nombre, así que la primera aparición del token quedaba 100 líneas ANTES de la
  declaración de la whitelist y el criterio devolvía `false` con el código perfectamente sano. Un criterio de
  posición sobre texto no distingue una mención de una declaración.
- **Fix:** el comentario puntero describe el predicado en prosa —«el predicado de "esto parece una forma de
  `fare`"»— sin usar el token. El comentario sigue diciendo todo lo que tenía que decir (dónde vive, por qué
  vive allí, y que la premisa que había AQUÍ era falsa) y el criterio pasa a `true`.
- **Por qué no es hacer trampa al criterio:** lo que el criterio protege es que la DECLARACIÓN vaya detrás de
  su fuente, porque delante es `ReferenceError` de TDZ. Eso se cumple y se cumplía; lo que se corrigió es que
  el detector no pudiera confundir una mención en prosa con la declaración.
- **Files modified:** `tests/content-fare-indicativo.test.js`
- **Commit:** `dd78476`

**2. [Rule 2 - Missing critical] Dos mutaciones EXTRA sobre el ancla del source-assert**

- **Found during:** Tarea 1, tras el paso 7.
- **Issue:** el plan pide 7 mutaciones y ninguna cubre el gate que T-44-04-03 nombra como mitigación
  `high`: el propio source-assert. Un ancla que nunca se ha visto roja es exactamente el modo de fallo que el
  ancla existe para prevenir — habría quedado cerrada solo en verde.
- **Fix:** dos mutaciones adicionales, ambas rojas y documentadas arriba: (A) quitar `furono` de la whitelist
  local → rojo por igualdad de conjunto; (B) romper el literal que la extracción busca → rojo por
  `devolvio nada`, es decir por la rama del `null` y NO comparando dos conjuntos vacíos.
- **Files modified:** ninguno de forma permanente (mutaciones transitorias, revertidas por `git checkout --`).
- **Commit:** evidencia en este SUMMARY; el gate mutado es el de `dd78476`.

### Decisiones de NO-alcance (deuda respetada, no descubierta)

- **El gate G3 de `fare-indefiniti-300` conserva su `/^f/i` a ciegas, a propósito.** Está a 200 líneas del que
  se editó y usa el mismo patrón, pero recorre las options PROPIAS del cruce, que son modales conjugados
  gobernados además por `MODAL_STEM_RE`: ahí la premisa «ningún miembro legítimo del pool empieza por f-» es
  VERDADERA. WR-02 nombra `CRUCES_AJENOS`, que es el que recorre las options de `fare-indicativo-300` donde
  `essere` sí está autorizado. Cambiar G3 habría sido ampliar el alcance sobre un gate correcto.
- **WR-04…WR-09 y IN-01…IN-03 sin tocar**, según la prohibición del plan. En particular el conteo de
  pronombres de los cruces (WR-04) sigue como estaba, aunque su gate esté a pocas líneas de los editados.

### Auth gates

Ninguno.

## Known Stubs

Ninguno. El plan no introdujo stubs, `TODO`s de código, tests `skip` ni `<verify>` sin correr: los cuatro
bloques de `<verify>` de las tres tareas se ejecutaron, las 9 mutaciones se observaron con su mensaje literal
y los 17 goldens nuevos están committeados y verdes.

## Threat Flags

Ninguno. El plan no toca `src/`, no abre endpoint, no añade ruta de autenticación ni de acceso a fichero nuevo
—la única lectura nueva es `readFileSync` sobre un fichero de test del propio repo, para el source-assert— y
no instala nada (T-44-04-SC: proyecto de dependencias cero, runner nativo de Node).

Las seis mitigaciones con disposición `mitigate` quedaron aplicadas y verificadas por mutación:

| Threat | Mitigación aplicada | Evidencia |
|---|---|---|
| T-44-04-01 (gate de gloss sobre cadena vacía) | cláusula de EXISTENCIA por delante de la lista negra en los 3 gates de gloss | mutaciones B2 y C2: rojo por la cláusula, **0** rojos de lista negra |
| T-44-04-02 (lista negra por `includes` crudo) | `wordish` con frontera de palabra unicode + perífrasis como bigrama | 4 goldens de falso positivo, 2 tomados del contenido real |
| T-44-04-03 (whitelist duplicada entre ficheros) | source-assert de igualdad de conjunto con rama `null` explícita | mutaciones extra A y B |
| T-44-04-04 (mutación transitoria del fichero de test) | commit ANTES de mutar, revert por `git checkout --`, `git status` vacío | 0 líneas en `content/ src/ scripts/`; `content/` byte-idéntico |
| T-44-04-05 (gate nuevo que baja la barra de uno existente) | gates ADITIVOS y por partición; el único predicado reescrito es el que emitía el diagnóstico falso | +13 / +6 / +19 tests, `fail 0`, `Milestone gate PASS` |
| T-44-04-06 (gate cerrado sin evidencia de rojo) | 9 mensajes de assert rojos literales en este SUMMARY + 17 goldens committeados | secciones de cada tarea |

## Nota sobre `actuals.tokens`

`8329` = `estimateTokens` (chars/4) sobre el diff realizado del plan (33 316 caracteres de
`git diff HEAD~3..HEAD`). La estimación del plan era 85 000 con confianza `low`. La diferencia es real —el
plan cifró como si hubiera que releer los 3 274 líneas de los dos ficheros, y el bloque `<interfaces>` del
propio plan ya traía las regiones exactas y el contenido de los 3 cruces leídos del disco, que es lo que
convirtió una tarea de exploración en una de edición— y no se redondea para acercarla, porque una cifra
halagadora corrompe todas las estimaciones posteriores.

## Self-Check: PASSED

- `FOUND: tests/content-fare-indicativo.test.js`
- `FOUND: tests/content-fare-indefiniti.test.js`
- `FOUND: dd78476`
- `FOUND: 8210a24`
- `FOUND: abcaf9a`
