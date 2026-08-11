---
phase: 44-integraci-n-lockstep-cierre-v2-0
plan: 02
subsystem: contenido — cruces multi-categoría de `fare` + partición de gates
tags: [cruces, multi-categoria, cascada-D-54, particion-base-cruce, G1, G2, G3, INT-03, INT-04, quorum-top-level, 250-250-validated]
status: complete

requires:
  - "44-01: los 2 arrays de conteo enganchados y el reporter honesto en 247/247 PASS"
  - "content/categories.json con avere (1), presente-regolare (10) y modali (13) registradas"
  - "los 22 slots del paradigma de `fare` cerrados desde Phase 43"
provides:
  - "los 3 cruces multi-categoría de `fare`: 3 slots / 9 variantes, los 3 `validated` por quórum Opus + Sonnet"
  - "el milestone gate en verde: `VAL-06 (250/250 validated): PASS` y `VAL_07_STRICT` en 1081/0"
  - "la partición BASE_SLOTS / CROSS_SLOTS en los dos ficheros de test de `fare`"
  - "G1, G2 y G3 como gates mecánicos y permanentes, un assert por cruce"
  - "### 7.6 del prompt del quórum — los 3 gates declarados para el subagent"
affects:
  - "content/exercises/fare-indicativo.json"
  - "content/exercises/fare-indefiniti.json"
  - "tests/content-fare-indicativo.test.js"
  - "tests/content-fare-indefiniti.test.js"
  - ".planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md"

tech-stack:
  added: []
  patterns:
    - "partición BASE/CRUCE: una sola edición de `allVariants()` acota los 14 + 13 call-sites de los gates de paradigma"
    - "gate INVERTIDO en vez de borrado: el que reservaba `-300`+ pasa a exigir que los ids con ese sufijo sean EXACTAMENTE `CROSS_IDS`"
    - "`CROSS_PAIRS` como mapa id → pareja, no pareja única: dos cruces del mismo fichero apuntan a vecinas distintas"
    - "conjunto CERRADO de marcadores declarado como constante del test (G3): el gate es mecánico, no un juicio a ojo"
    - "prohibición de la INICIAL `f-` en `options` en vez de lista enumerada de formas de `fare`"

key-files:
  created: []
  modified:
    - "content/exercises/fare-indicativo.json"
    - "content/exercises/fare-indefiniti.json"
    - "tests/content-fare-indicativo.test.js"
    - "tests/content-fare-indefiniti.test.js"
    - ".planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md"

decisions:
  - "El sentido invertido de D-44-02 se materializa en los 3: la key vive en la categoría vecina y la forma de `fare` va escrita como contexto. Solape cero con los 22 slots del paradigma."
  - "`CONJUGATE` de `tests/content-fare-indefiniti.test.js` se acota a los slots de PARADIGMA de las otras tres categorías: las `options` de un cruce ajeno NO son formas de `fare` por diseño, y meterlas contaminaba el gate con palabras ajenas (Rule 3, desviación 1)."
  - "El gate del sufijo de 3 cifras se escribe sin mensaje de assert en los dos ficheros: el diff de arrays que imprime `assert` ya nombra el id intruso, y el porqué vive en el comentario."
  - "`PRONOUN_RE` vive DENTRO del bloque del cruce en `fare-indefiniti`: el eje de esa categoría es el contexto y no la persona, así que no es constante de la categoría."
  - "El gloss ES del cruce hacia `modali` glosa el COMPLEMENTO y nunca el modal: traducirlo sería leak C5, porque ahí la key ES el modal. Es la divergencia consciente respecto a `modali-300`, que sí lo traduce."
  - "El criterio `git diff -U0 ... | grep -c '^-[^-]'` = 0 es inalcanzable para un append a `notes`, que es un string JSON de una sola línea. Se sustituye por la prueba equivalente y más fuerte: `notes.startsWith(notes_anterior)` byte a byte (desviación 2)."
  - "El gloss ES del cruce NO es una decisión de plan, es una decisión POR SLOT: el quórum obligó a `fare-indicativo-301` al 0-gloss de su categoría (el gloss conjugaba el verbo del hueco = leak C5) mientras `fare-indicativo-300` lo conserva (allí el hueco pide el AUXILIAR y el gloss usa pretérito simple castellano, que no exhibe auxiliar español espejo). La asimetría es deliberada y está declarada en el `notes`."
  - "Un gate de lista cerrada comprueba que el marcador ESTÉ, nunca que EXCLUYA: es condición necesaria y no suficiente. G3 pasó verde dos veces sobre un complemento que no ejercía fuerza excluyente, y lo cazó Sonnet, no el test. La lección va escrita en el `notes` porque el gate no puede expresarla por sí mismo."
  - "La cláusula `altrimenti` de `fare-indefiniti-300#0` queda vestigial tras el 3er intento pero NO se borra: es el marcador de la lista cerrada del gate G3 y quitarlo lo dejaría a cero hits."

metrics:
  duration: "~55 min (Tareas 1-3) + ~40 min (quórum top-level de la Tarea 4, 6 rondas)"
  completed: 2026-08-11

actuals:
  tokens: 83638
  tasks: 4
  commits: 8
---

# Phase 44 Plan 02: los 3 cruces multi-categoría de `fare` Summary

Los 3 cruces de sentido invertido en disco con 9 variantes, los 3 `validated` por quórum top-level Opus + Sonnet tras 6 rondas —la key en la categoría vecina y la forma de `fare` escrita como contexto—, con G1/G2/G3 convertidos en gates mecánicos y los dos ficheros de test particionados en base/cruce sin que ningún gate pierda mordida.

El milestone gate cierra en verde: `VAL-06 (250/250 validated): PASS`, `VAL_07_STRICT` en `1081 pass / 0 fail`, y **INT-03 e INT-04 satisfechos por este plan**.

## Los 3 cruces, sus 9 variantes y su gate

### `fare-indicativo-300` — `["fare-indicativo", "avere"]` · gate **G1**

El participio `fatto` va escrito e invariable; el hueco es **solo el auxiliar**.

| # | prompt | pool | key | persona |
|---|---|---|---|---|
| 0 | `Stamattina io ___ fatto i compiti prima di uscire. (en español: esta mañana hice los deberes antes de salir)` | ho / hai / abbiamo / sono | **ho** | io |
| 1 | `Ieri noi ___ fatto una torta per il compleanno di Marco. (en español: ayer hicimos un pastel para el cumpleaños de Marco)` | ho / abbiamo / avete / siamo | **abbiamo** | noi |
| 2 | `Il mese scorso loro ___ fatto tutto senza aiuto. (en español: el mes pasado hicieron todo sin ayuda)` | ha / avete / sono / hanno | **hanno** | loro |

`correctIndex` = 0 / 1 / 3 (no constante). Cero pronombres objeto antepuestos, cero formas de `fare` en `options`, cero participios dentro de una opción. La distractora de auxiliar es una forma de `essere`, bloqueada por el objeto directo explícito exactamente como el `notes` ya razonaba para D-41-10.

### `fare-indicativo-301` — `["fare-indicativo", "presente-regolare"]` · gate **G2**

Dos cláusulas: en la primera va escrita una forma de `fare` en presente, en la segunda el hueco pide el presente de un verbo **regular**.

Texto **vigente** tras la corrección de la 2ª ronda del quórum (los 3 prompts pasaron al **0-gloss** y la variante 1 cambió de marco — ver «El quórum top-level» más abajo):

| # | prompt | pool | key | sujetos |
|---|---|---|---|---|
| 0 | `Tu fai i compiti da solo, ma noi ___ tutto insieme.` | ripasso / ripassi / ripassiamo / ripassano | **ripassiamo** | tu → noi |
| 1 | `Io faccio una foto senza problemi, ma lui ___ un errore ogni volta.` | commetti / commette / commetto / commettono | **commette** | io → lui |
| 2 | `Noi facciamo il letto ogni mattina, e voi ___ il lavoro con calma.` | controllo / controlla / controllano / controllate | **controllate** | noi → voi |

`correctIndex` = 2 / 1 / 3. Los 3 prompts llevan **exactamente 2** sujetos pronominales y de **personas distintas**; los 4 pools son 4 personas del **mismo** verbo regular (raíz común `rip` / `com` / `con`), y el verbo candidato queda fijado por el objeto literal de la cláusula del hueco (`tutto`, `un errore`, `il lavoro`).

Este es el único cruce **sin** gloss ES, y no por olvido: aquí el hueco pide la forma conjugada de un verbo regular, así que glosarla en español entregaba persona y tiempo —todo lo que el slot examina—. La asimetría con `-300`, que sí lo conserva, está declarada en el `notes`.

### `fare-indefiniti-300` — `["fare-indefiniti", "modali"]` · gate **G3** (el más delicado)

`fare` va escrito en infinitivo, gobernado por el modal; el hueco es **el modal conjugado**.

Texto **vigente** tras el 3er intento de la variante 0, que es el que Sonnet aceptó (ver «El quórum top-level»):

| # | prompt | complemento que excluye | pool | key | persona |
|---|---|---|---|---|---|
| 0 | `Domani io ___ fare i compiti: è un obbligo della scuola, non ho scelta, altrimenti prendo un brutto voto. (en español: es una obligación del colegio, no tengo elección; si no, saco mala nota)` | `non ho scelta` → obligación (y `altrimenti` sostiene el gate) | devo / devi / dovete / posso | **devo** | io |
| 1 | `Qui tu ___ fare una foto, perché il museo dà il permesso. (en español: porque el museo da su autorización)` | `permesso` → permiso | devi / vuoi / puoi / possono | **puoi** | tu |
| 2 | `Sabato noi ___ fare una torta per il compleanno di Marco: è un desiderio nostro, nessuno ce lo ha chiesto. (en español: es un deseo nuestro, nadie nos lo ha pedido)` | `desiderio` → voluntad | dovete / vogliamo / vogliono / possiamo | **vogliamo** | noi |

`correctIndex` = 0 / 2 / 1. **Ninguna opción es una forma de `fare`** — la divergencia obligatoria respecto a `modali-300`, que sí mete `parlo`/`prendiamo`/`dormi`. Los 3 marcadores están declarados como constante `COMPLEMENTOS_QUE_EXCLUYEN` en el test, con un assert que exige **exactamente 1 por prompt** y **los 3 distintos entre las 3 variantes**: sin lista cerrada, «el complemento está ahí» sería una opinión.

El gloss ES de este cruce glosa el **complemento** y nunca el modal. Traducirlo (`tengo que`, `puedo`, `quiero`) sería leak C5 directo, porque aquí la key **es** el modal — y es exactamente lo que hace `modali-300`, del que se clona la forma pero no el marco.

## La prueba de que ningún gate se perdió: `test(` antes y después

| Fichero | `test(` antes | `test(` después | Δ |
|---|---|---|---|
| `tests/content-fare-indicativo.test.js` | **42** | **58** | +16 |
| `tests/content-fare-indefiniti.test.js` | **86** | **97** | +11 |

Suite completa: **1036 → 1063 pass**, `fail 0`. Estricta: **1054 → 1081 tests**, que tras el quórum cierran en **1081 pass / 0 fail** (durante las Tareas 1-3 fueron 1079/2, los 2 fallos esperados).

## Gates re-apuntados, invertidos y añadidos

### `tests/content-fare-indicativo.test.js`

| Gate | Antes | Después |
|---|---|---|
| igualdad de ids con `IDS` | `SLOTS` | `BASE_SLOTS` |
| `reduce` del conteo de 48 variantes | `SLOTS` | `BASE_SLOTS` |
| `allVariants()` (14 call-sites: hueco, un solo pronombre, los 2 de 0-gloss, SCOPE-GATE, objeto cerrado, los 4 de blacklist…) | `SLOTS` | `BASE_SLOTS` — **una sola edición** |
| sufijo numérico de 3 cifras | `deepEqual(usados, [])` | **INVERTIDO**: `deepEqual(usados, CROSS_IDS)` |
| tipo MC, key set, claves peligrosas, smart-quotes, explanations acentuadas, los 4 de `validation`, `categoryIds.includes(slug)` | `SLOTS` | **se quedan en `SLOTS`**: gobiernan todo el fichero |

Bloque 13 nuevo (13 tests): existencia exacta de `CROSS_IDS`, 3 variantes con 3 personas distintas, `categoryIds` de longitud 2 con `CROSS_PAIRS` y vecina **registrada**, hueco, 4 opciones sin duplicados y `correctIndex` variable, SCOPE-GATE por campo, objeto cerrado, blacklist + otros modos, participio no concordado, **G1** (`fatto` escrito, cero pronombres objeto, pool de auxiliares de una palabra con `essere` presente), **G2** (2 sujetos distintos, 4 personas del mismo verbo, forma de `fare` escrita) y el gate compartido de cero formas de `fare` en `options`.

### `tests/content-fare-indefiniti.test.js`

| Gate | Antes | Después |
|---|---|---|
| igualdad de ids con `IDS` | `SLOTS` | `BASE_SLOTS` |
| `reduce` del CONTEO DESIGUAL 3/3/4/2/3/3 = 18 | `SLOTS` | `BASE_SLOTS` |
| `categoryIds` de longitud 1 con el slug completo | `SLOTS` | `BASE_SLOTS` + **espejo** de longitud 2 para el cruce |
| `allVariants()` (13 call-sites, incluidos los **2 de POOL CERRADO** de las 10 formas no personales) | `SLOTS` | `BASE_SLOTS` — **una sola edición** |
| sufijo numérico de 3 cifras | `deepEqual(usados, [])` | **INVERTIDO**: `deepEqual(usados, CROSS_IDS)` |
| tipo MC, key set, 4 opciones + `correctIndex` variable, explanations acentuadas, los 2 tripwires de prosa (`ABSOLUTOS_DESNUDOS`, `CONDICIONES_DE_APARICION`), los de `validation`, `id.startsWith(SLUG-)` | `SLOTS` | **se quedan en `SLOTS`** |

Bloque 14 nuevo (9 tests) con los predicados de **G3**, más un sub-gate en el bloque 6 que hace auditable la acotación de `CONJUGATE` (ver desviación 1).

## Salida literal del reporter — el rojo intermedio y el verde final

Durante las Tareas 1-3 el reporter estuvo **rojo a propósito**, y ese rojo era su entregable: el marcador diciendo la verdad entre que los cruces aterrizan y el quórum termina.

```
Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08)
  VAL-06 (250/250 validated): FAIL (247/250 — pending=3, missing=0, disputed=0)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
```

Código de salida **1**. `TOTAL_EXPECTED` subió de 247 a 250 **solo** porque los `expected` de las 4 entradas de `fare` son dinámicos: este plan no tocó `scripts/run-validation-271.mjs` (`git diff --stat` de los ficheros de 44-01 → sin salida).

Tras la pasada del quórum de la Tarea 4, el estado **vigente y reverificado el 2026-08-11**:

```
Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS

Milestone gate PASS.
```

Código de salida **0**. Y `VAL_07_STRICT=1 node --test tests/*.test.js` pasó de `1079 pass / 2 fail` —los 2 tests de los ficheros de contenido tocados, nombrando los 3 ids `pending`— a **`1081 pass / 0 fail`**: los mismos 2 tests, ahora verdes, sin que se tocara el gate.

```
fare-indicativo-300(pending)      →  validated
fare-indicativo-301(pending)      →  validated
fare-indefiniti-300(pending)      →  validated
```

Nadie «arregló» ese rojo tocando contenido para que cupiera ni relajando un gate. Se cerró estampando el quórum — y el contenido que sí cambió lo cambió el quórum al rechazarlo, que es la dirección correcta.

## Estado final de los 3 cruces

```
fare-indicativo-300  validated  passes=2  claude-opus-5:correcta ; claude-sonnet-5:correcta
fare-indicativo-301  validated  passes=2  claude-opus-5:correcta ; claude-sonnet-5:correcta
fare-indefiniti-300  validated  passes=2  claude-opus-5:correcta ; claude-sonnet-5:correcta
total variantes 9
```

Los 3 con `deriveStatus(passes) === status` verificado contra el disco (`coincide=true` los tres), 2 pases de `by` **distintos** cada uno y cero `incorrecta` en `passes[]`. Cero pases fabricados: los 6 que hay salieron de 6 llamadas reales.

## El quórum TOP-LEVEL — la Tarea 4, resuelta

El checkpoint bloqueante de la Tarea 4 pedía la pasada Opus + Sonnet sobre los 3 cruces, **un ejercicio por contexto fresco y nunca en lote** (VAL-03). Corrió desde el nivel superior, no dentro de un executor (D-44-11). Resultado: los 3 acabaron `validated` y **ninguno necesitó override de autor** — los dos modelos convergieron en `correcta` en los tres.

Pero **hicieron falta 6 rondas para 3 ejercicios**, y el valor de este registro está en las 3 que salieron mal:

| Cruce | Rondas | Opus | Sonnet | Veredicto |
|---|---|---|---|---|
| `fare-indicativo-300` | **1** | `correcta` | `correcta` | `validated` a la primera, 0 concerns de defecto |
| `fare-indicativo-301` | **2** | `incorrecta` → `correcta` | — → `correcta` | `validated` tras reescribir prompts y explanation |
| `fare-indefiniti-300` | **3** | `correcta` ×3 | `incorrecta` ×2 → `correcta` | `validated` tras dos marcos rechazados |

### `fare-indicativo-300` — limpio, con 2 concerns declarativas

Opus y Sonnet dieron `correcta` a la primera. Se le escribieron **2 concerns declarativas de audit trail** —no de defecto—: por qué su gloss ES es seguro (el hueco pide el **auxiliar**, y los glosses usan pretérito simple castellano `hice` / `hicimos` / `hicieron`, así que no exhiben ningún auxiliar español espejo del hueco) y la verificación de G1 en sus dos mitades. Precedente vivo del proyecto: un pase `correcta` sí admite concerns declarativas (`riflessivi.json:245`).

### `fare-indicativo-301` — DOS defectos reales en la 1ª ronda (`incorrecta` de Opus)

**C5-leak.** Los 3 glosses ES conjugaban el verbo del hueco y por tanto entregaban **persona y tiempo**, que es exactamente todo lo que el slot examina: `repasamos` → `ripassiamo`, `comete` → `commette` (casi homógrafas), `revisáis` → `controllate`. El gloss no aportaba nada legítimo, porque el **lexema** ya lo fijan las 4 `options` del mismo verbo y la **persona** el pronombre explícito que G2 obliga. Un gloss que no desambigua nada y sí filtra la forma es leak puro.

**C4 en la explanation.** Abría describiendo la **anatomía del propio ejercicio** y cerraba explicando **por qué fallan las distractoras**: dos de las tres prohibiciones de una explanation en este proyecto, cometidas en el mismo párrafo. Y con agravante: la frase de cierre era el «contrato del pool» que el propio `<action>` del plan pedía clonar de `presente-regolare-302`. El molde traía el defecto dentro.

**Corrección (commit `3295320`).** Los 3 prompts de `-301` vuelven al **0-gloss** de la categoría; la explanation se reescribió abriendo por la regla; y la variante 1 pasó a `Io faccio una foto senza problemi, ma lui ___ un errore ogni volta` para resolver un **non sequitur** que ambos modelos habían señalado (hacer una foto a un monumento y cometer un error no se contrastan). Tras la corrección: Opus `correcta`, Sonnet `correcta`.

Nota de granularidad: 1 commit para los 2 ejercicios de `fare-indicativo` en vez de 1 por ejercicio, porque las correcciones tocaron prosa **compartida** del campo `notes`, que no se puede partir por slot.

### `fare-indefiniti-300` — G3 falló como gate, y lo cazó Sonnet

Opus dio `correcta` las tres veces. Sonnet dio **`incorrecta` por C2 en la variante 1** las dos primeras. El defecto es el más instructivo de la fase:

> **G3 exige un complemento que EXCLUYA dos de los tres modales. El gate solo comprobaba que el marcador de la lista cerrada ESTUVIERA.**

`altrimenti prendo un brutto voto` cumplía el gate por **presencia** de la palabra, sin ejercer fuerza excluyente: una consecuencia negativa genérica admite también `posso`, con `potere` leído como «tener la ocasión». El gate estaba verde y el ejercicio tenía dos respuestas defendibles — que es precisamente el daño que G3 existía para prevenir.

**Intento 2, rechazado también:** `i compiti che la maestra ha assegnato` es un dato descriptivo del **objeto**, no un ancla de modalidad sobre el **sujeto**; los deberes siempre los asigna alguien.

**Intento 3, el vigente (commit `5b9640a`):** `Domani io ___ fare i compiti: è un obbligo della scuola, non ho scelta, altrimenti prendo un brutto voto`. Cierra el hueco porque `posso` **presupone** que hay elección y `non ho scelta` la niega de frente: colisión semántica, no inferencial. Usa el mismo dispositivo —dos puntos más aposición declarativa— que la variante 2 ya empleaba y que había pasado el criterio a la primera.

**Efecto secundario aceptado y declarado en el `notes`:** la cláusula `altrimenti` queda **vestigial** pero NO se puede borrar, porque es el marcador de la lista cerrada del gate y quitarlo lo dejaría a cero hits.

**Lección escrita en el `notes`, porque el gate no puede expresarla por sí mismo:** una lista cerrada comprueba que el complemento **esté**, nunca que **excluya**. Es condición necesaria y no suficiente, y quien herede G3 tiene que leer el complemento, no confiar en el verde.

### Por qué `passes[]` no tiene ningún `incorrecta`

Los 3 pases `incorrecta` juzgaban **textos que ya no existen**, y `disputed` es **sticky**: arrastrarlos habría dejado los 3 cruces en `disputed` para siempre por defectos ya corregidos. El audit trail completo de las 6 rondas vive en el campo `notes` de los dos ficheros de contenido y en los dos mensajes de commit, que es donde un lector futuro lo encuentra sin tener que creerse el `status`.

## Deviations from Plan

### 1. [Rule 3 — bloqueo real] `CONJUGATE` se contaminaba con las `options` de los cruces ajenos

- **Encontrado en:** Tarea 1, al correr la suite completa tras aterrizar `fare-indicativo-300`.
- **El problema:** `tests/content-fare-indefiniti.test.js` construye `CONJUGATE` leyendo **todas** las `options` de los otros tres ficheros de `fare`, y su propio comentario la declara como «la unión de las formas **conjugadas de `fare`**». Al apender el cruce, su distractora de auxiliar `sono` entró en ese set, y el gate «ningún prompt menciona una forma conjugada» se puso rojo contra `fare-indefiniti-infinito-passato#0`, cuyo prompt lleva `sono` legítimamente **desde Phase 43**. Es decir: contenido nuevo y correcto rompía un gate por una vía que el gate no pretendía cubrir.
- **Lo que se hizo:** `CONJUGATE` se construye ahora solo con los slots de **PARADIGMA** de las otras tres categorías, excluyendo sus cruces `-300`+. No es una relajación: por G1/G2/G3 las `options` de un cruce **no pueden ser** formas de `fare`, así que incluirlas no reforzaba el gate, lo contaminaba con auxiliares, verbos regulares y modales. `CONJUGATE` sigue conteniendo todas las formas conjugadas de `fare` de las tres categorías, que es lo único que dice gobernar.
- **Y para que la exclusión no sea un acto de fe** se añadió el sub-gate `CRUCES_AJENOS`: exige que **nada de lo excluido** contenga una forma de `fare`. Si algún día lo contuviera, la exclusión sí bajaría la barra y el test se pone rojo para que se revise la frontera en vez de mantenerla.
- **Ficheros:** `tests/content-fare-indefiniti.test.js`. **Commit:** `9890aa5`.

### 2. [Rule 3 — criterio inalcanzable por construcción] el `grep -c '^-[^-]'` = 0 del append al `notes`

- **Encontrado en:** Tarea 1 y repetido en Tarea 3.
- **El problema:** el criterio de aceptación exige `git diff -U0 <fichero> | grep -c '^-[^-]'` = `0` como prueba de que el `notes` creció «por append puro». Pero `notes` es un **string JSON en una sola línea**: cualquier append reescribe esa línea, así que el diff muestra necesariamente **1** borrado. El criterio es inalcanzable sin partir el campo, y partirlo no es posible en JSON estricto.
- **Lo que se hizo:** se comprobó la propiedad que el criterio quiere demostrar, en su forma **más fuerte y directa**: que el `notes` nuevo **empieza por el anterior byte a byte**, leyendo el anterior de `git show HEAD:<fichero>`. Resultado en los dos ficheros: `true`. Y se verificó que **el único** borrado del diff es esa línea de `notes` (`grep -c '^-  "notes"'` = 1, total de borrados = 1). Los gates `CONTENT.notes.includes(...)` de los dos ficheros siguen verdes, que es la consecuencia observable de que nada se re-editó.
- **Crecimiento:** `fare-indicativo` +5832 caracteres (Tarea 1; la Tarea 2 no tocó el `notes` porque G2 ya estaba declarado verbatim y re-editarlo sería justo lo prohibido), `fare-indefiniti` +6341.

### 3. [Rule 3 — criterio literal] el gate del sufijo se escribe sin mensaje de assert

- **El problema:** el criterio exige que `/deepEqual\(usados, CROSS_IDS\)/` case sobre el fuente. Con un tercer argumento de mensaje —que es como lo muestra el propio `<interfaces>` del plan— el regex no casa.
- **Lo que se hizo:** el assert va sin mensaje en los dos ficheros y el porqué vive en el comentario inmediatamente anterior, que es donde estos dos ficheros ya ponen su razonamiento pesado (el gate 0-gloss hace exactamente eso). No se pierde diagnosis: el diff de arrays que imprime `assert` nombra el id intruso o el que falta, que es toda la información útil aquí; el mensaje no añadía nada que el comentario no diga mejor.
- **Commits:** `9890aa5` (indicativo), `76b06dd` (indefiniti).

### 4. [Rule 3 — constante ausente] `PRONOUN_RE` en `fare-indefiniti`

- **El problema:** el bloque del cruce necesita comprobar el sujeto pronominal explícito y las 3 personas distintas, pero `tests/content-fare-indefiniti.test.js` no tenía matcher de pronombre: el eje de variante de esa categoría es el **contexto sintáctico**, no la persona.
- **Lo que se hizo:** `PRONOUN_RE` se declara **dentro** del `describe` del cruce, no en la cabecera del fichero. Es una constante del cruce y no de la categoría, y ponerla arriba sugeriría que la categoría tiene eje de persona.
- **Commit:** `b281678`.

## Ningún auth gate

Ninguna tarea requirió autenticación. Cero instalaciones de paquetes, cero dependencias nuevas, cero red: `T-44-SC` sigue siendo `accept` y no aplica.

## Verificación de cierre — los 9 puntos

Reverificados contra el disco el **2026-08-11**, después de la pasada del quórum. Los números de esta tabla son los del **estado final**, no los del hand-off:

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `node --test tests/*.test.js` | **1063 pass / 0 fail** ✅ |
| 2 | `node --test` de los dos ficheros por separado | `fail 0` cada uno, con `test(` **crecido** (42→58, 86→97) ✅ |
| 3 | `node scripts/run-validation-271.mjs` | `VAL-06 (250/250 validated): PASS (250/250)`, `VAL-08 PASS`, `VAL-04 PASS`, `Milestone gate PASS`, exit **0** ✅ |
| 4 | `VAL_07_STRICT=1 node --test tests/*.test.js` | **1081 pass / 0 fail** (era 1079/2 con los 3 cruces `pending`) ✅ |
| 5 | los 3 cruces, 9 variantes, `deriveStatus(passes)` == `status` | los 3 `validated`, 2 pases de `by` distintos cada uno, `coincide=true` ✅ |
| 6 | `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` | **sin salida** (`src/data/` NO incluido, D-44-09) ✅ |
| 7 | `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` | **2** ✅ |
| 8 | `git diff --stat` de los ficheros propiedad de 44-01 | **sin salida** ✅ |
| 9 | checkpoint de la Tarea 4 | **RESUELTO**: quórum top-level ejecutado, 6 rondas, 3/3 `validated`, sin override ✅ |

Extra: 250 slots en disco y 18 categorías registradas. `ls docs/09-VALIDATION-PROMPT.md` → **0**: el huérfano no se creó; `### 7.6` vive en la ruta real (`grep -c '### 7.6'` = 1, y nombra los 3 ids y remite a `7.3`).

## Known Stubs

**Ninguno.** Este plan no crea código de producción, no cablea valores vacíos y no deja componentes sin fuente de datos.

Lo único que quedaba pendiente por diseño —los 3 cruces en `pending` con `passes: []`— **está cerrado**: era el objeto del checkpoint de la Tarea 4 y el quórum top-level lo resolvió. Las 3 entradas del ledger `.planning/WINDOWS.md` que registraban ese rojo honesto (`#9` deviation de traceability, `#11` y `#12` unrun-verify de los dos ficheros de contenido) quedan marcadas `fixed`.

**INT-03 e INT-04 quedan ya satisfechos por este plan**, y el disco lo respalda:

- **INT-03** — los 3 cruces en su forma decidida: 3 slots, 9 variantes, `categoryIds` de 2 con las parejas exactas y el slug `modali` (nunca `verbi-modali`), la key en la categoría vecina y la forma de `fare` escrita como contexto. La cascada D-54 sigue en **exactamente 2** call-sites de `applyImmediateFailure` y el diff del motor está vacío: cero líneas de `src/` tocadas.
- **INT-04** — «todas las variantes nuevas validadas 1-por-1 por quórum»: las 9 variantes de los 3 cruces están `validated` con 2 pases de `by` distintos cada uno, y las rondas EXTRA de los 4 magnets estaban ya ejecutadas en disco y declaradas en `### 7.5` por el plan 44-01. **Ya NO hay mitad pendiente.** El `Pending` con el que 44-01 y las Tareas 1-3 lo dejaron era correcto entonces y sería falso ahora.

Los dos requisitos pasan a `Complete` en `.planning/REQUIREMENTS.md`, en el checkbox y en la tabla de Traceability, con la nota de cierre que registra las rondas fallidas.

## Threat Flags

Ninguno nuevo. Este plan no añade endpoint, ruta de auth, patrón de acceso a ficheros en runtime ni cambio de esquema en una frontera de confianza. Las mitigaciones `mitigate` del registro del plan quedan así:

| Threat ID | Disposición | Estado |
|---|---|---|
| T-44-07 (repudiation — `passes[]` de los 3 cruces) | mitigate | **cerrado por completo**: las Tareas 1-3 los dejaron en `pending` con `passes: []` y el gate `status === deriveStatus(passes)` hizo imposible un `validated` fabricado; el checkpoint de la Tarea 4 estampó los 6 pases **reales** (2 por cruce, `by` distintos). Los 3 `incorrecta` de las rondas fallidas no se arrastraron a `passes[]` porque juzgaban textos que ya no existen, y el audit trail de las 6 rondas vive en el `notes` y en los mensajes de commit |
| T-44-08 (tampering — los gates verdes existentes) | mitigate | **cerrado**: `test(` creció en los dos ficheros (+16, +11), cada gate re-apuntado a la partición que gobierna, y los cruces con bloque propio que re-asierta lo que sigue rigiendo sobre ellos. Ninguno debilitado ni borrado |
| T-44-09 (tampering — DOM: markdown y smart-quotes) | mitigate | **cerrado**: los 3 cruces entran solos en el smoke de `tests/exercise-types.test.js`; verificado `false` para smart-quotes y para corchetes angulares en los dos `notes` y en el contenido |
| T-44-10 (tampering — claves peligrosas del JSON) | mitigate | **cerrado**: el gate itera `SLOTS` completo y por tanto cubre los cruces sin edición |
| T-44-11 (DoS — más de una respuesta defendible → `disputed` sticky → reset de 2 categorías) | mitigate | **cerrado, y la red hizo falta**: G1, G2 y G3 quedaron como gates mecánicos, pero **G3 no bastó** — pasó verde dos veces sobre un complemento que cumplía la lista cerrada por presencia sin excluir nada, y la variante 1 de `fare-indefiniti-300` tuvo de hecho dos respuestas defendibles hasta el 3er intento. Lo cazó Sonnet, no el test. La amenaza queda cerrada por el quórum (3/3 `validated`, cero `disputed`), no por el mecanismo, y la limitación de G3 está escrita en el `notes` para quien lo herede |
| T-44-12, T-44-13, T-44-SC | accept | no aplican: sin datos personales, sin red, sin backend, sin instalaciones |

## Self-Check: PASSED

**Ficheros declarados como modificados — todos presentes en disco:**

```
FOUND: content/exercises/fare-indicativo.json
FOUND: content/exercises/fare-indefiniti.json
FOUND: tests/content-fare-indicativo.test.js
FOUND: tests/content-fare-indefiniti.test.js
FOUND: .planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
```

**Commits declarados — los 8 en el historial:**

```
FOUND: 98e43ca  test(44-02): particion base/cruce de fare-indicativo y los invariantes de G1
FOUND: 9890aa5  feat(44-02): fare-indicativo-300 hacia avere — el cruce de sentido invertido con G1
FOUND: 57aa29f  test(44-02): los invariantes de G2 para fare-indicativo-301
FOUND: 0f64cf3  feat(44-02): fare-indicativo-301 hacia presente-regolare — el cruce con G2
FOUND: 76b06dd  test(44-02): particion base/cruce de fare-indefiniti y los invariantes de G3
FOUND: b281678  feat(44-02): fare-indefiniti-300 hacia modali — el cruce con G3, el gate mas delicado
FOUND: 3295320  validate(fare-indicativo): fare-indicativo-300 y -301 → validated (Opus + Sonnet)
FOUND: 5b9640a  validate(fare-indefiniti): fare-indefiniti-300 → validated (Opus + Sonnet)
```

Los dos últimos son del checkpoint de la Tarea 4, resuelto por el orquestador en la pasada top-level. Sin elementos ausentes.

## TDD Gate Compliance

Las 3 tareas llevaban `tdd="true"` y las 3 respetaron la secuencia, con el RED verificado y committeado antes de que existiera el contenido:

| Tarea | RED (`test(...)`) | Fallos en RED | GREEN (`feat(...)`) |
|---|---|---|---|
| 1 (tracer) | `98e43ca` | 5 | `9890aa5` |
| 2 | `57aa29f` | 5 | `0f64cf3` |
| 3 | `76b06dd` | 6 | `b281678` |

Ningún test pasó inesperadamente en RED. No hubo fase REFACTOR: no había nada que limpiar sin cambiar comportamiento.

## El hand-off al quórum TOP-LEVEL — EJECUTADO

Los 3 comandos se lanzaron **desde el nivel superior y no dentro de un executor**, **un ejercicio por contexto fresco y nunca en lote** (VAL-03), Opus + Sonnet:

```
/gsd-validate-exercise fare-indicativo-300     →  validated  (1 ronda)
/gsd-validate-exercise fare-indicativo-301     →  validated  (2 rondas)
/gsd-validate-exercise fare-indefiniti-300     →  validated  (3 rondas)
```

`deriveStatus` exige ≥2 pases `correcta` con `by` **distintos** y cero `incorrecta` para `validated`; cualquier `incorrecta` da `disputed` **STICKY**. Ninguno quedó `disputed`, así que la ronda cross-vendor de `scripts/validate-ai-pass.mjs` no hizo falta.

**El aviso de las Tareas 1-3 acertó.** Decía literalmente: «lo que conviene mirar antes de gastar quórum es `fare-indefiniti-300`; la pregunta es si el complemento excluye **de verdad** dos de los tres modales, o si los tres siguen siendo defendibles». Fue exactamente el que costó 3 rondas, y por exactamente ese motivo. El hand-off señaló el punto débil correcto; lo que no pudo hacer fue arreglarlo, porque G3 estaba verde.

Gate de cierre del milestone, verificado el 2026-08-11 con los 3 `validated`:

```
node --test tests/*.test.js                                    # 1063 pass / 0 fail          ✅
VAL_07_STRICT=1 node --test tests/*.test.js                     # 1081 pass / 0 fail          ✅
node scripts/run-validation-271.mjs                             # VAL-06 (250/250): PASS      ✅
                                                                #   + Milestone gate PASS, exit 0
git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/        # sin salida  (NO añadir src/data/)  ✅
grep -c 'applyImmediateFailure(this.state' src/screens/app.js   # 2                            ✅
```

Siguiente paso, ya fuera de este plan: verificación de la fase 44 y después `/gsd-complete-milestone v2.0`.
