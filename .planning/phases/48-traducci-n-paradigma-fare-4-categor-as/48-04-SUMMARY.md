---
phase: 48-traducci-n-paradigma-fare-4-categor-as
plan: "04"
subsystem: contenido/traducción
tags: [traduccion, quorum-cross-vendor, enmienda-criterios, D-46-12, TRAD-03, fare-indefiniti, fare-cond-imperativo, WR-01, WR-02, barrido-mecanico]
status: complete
requires:
  - "48-01 (jueces declarados D-48-01, patrón de enganche y ancla, arreglo de la pared de contenido)"
  - "48-02 (fare-indicativo 54/54, aclaración de S2 sobre el pronombre sujeto)"
  - "48-03 (fare-congiuntivo 30/30, D-48-19 precisada, aclaración de S2 sobre el MODO)"
  - "docs/TRANSLATION-VALIDATION-PROMPT.md + scripts/validate-translation-pass.mjs (Phase 46)"
  - "scripts/lib/pass-guard.mjs (CR-01 de Phase 47), capitalizarSiAbre + rama OPCION_ELIDIDA (WR-01/WR-02 de Phase 47)"
provides:
  - "fare-indefiniti 21/21 y fare-cond-imperativo 17/17 traducidas y validated por quórum cross-vendor real"
  - "el bloque `fare` CERRADO: 122 variantes, 122 traducciones, 122 validated, 0 disputed"
  - "TRAD-COV en PASS (328/328) con SIETE categorías; reporter en exit 0"
  - "quinta enmienda del doc de criterios: el condizionale COMPOSTO como futuro del pasado se dice con condicional SIMPLE"
  - "los dos arreglos del code review de la Phase 47 (WR-01 y WR-02) verificados por OBSERVACIÓN sobre sus primeros sujetos reales"
  - "dos barridos mecánicos verificados POR MUTACIÓN, corridos ANTES del quórum, con un defecto cazado sin gastar una llamada"
  - "el límite conocido de D-48-19 (verbos matriz sincréticos) declarado y aceptado por el autor"
affects:
  - "plan 48-05 (cierre del milestone, TRAD-03, backstop long-text, colisión hiciste, las 4 de D-48-20)"
tech-stack:
  added: []
  patterns:
    - "quórum cross-vendor 1-por-1 (VAL-03)"
    - "barrido mecánico verificado POR MUTACIÓN y corrido ANTES del quórum, no después"
    - "trabajo adversarial de CERO llamadas: leer lo que el propio objetor votó en las estructuras idénticas"
    - "enmienda absolutoria del doc verificada por grep + cumplimiento literal sobre sujeto derivado del disco"
    - "verificación por OBSERVACIÓN (invocación en seco) de un arreglo cuyo modo de fallo es silencioso"
key-files:
  created: []
  modified:
    - content/exercises/fare-indefiniti.json
    - content/exercises/fare-cond-imperativo.json
    - scripts/run-validation-271.mjs
    - content/translation-coverage.lock.json
    - tests/content-fare-indefiniti.test.js
    - tests/content-fare-cond-imperativo.test.js
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/WINDOWS.md
decisions:
  - "D-48-21: QUINTA ENMIENDA del doc de criterios (el condizionale COMPOSTO como futuro del pasado se rinde con condicional SIMPLE español), decidida por el autor como CUARTA vía frente a las tres que el executor propuso. Cierra la CLASE entera, no la casilla"
  - "D-48-22: el disparador de escalada que el plan 48-04 escribió («DOS vendors marcando estructuras idénticas») era MÁS ESTRICTO que la doctrina de la `WINDOWS` id 37 («marcar uno y aprobar idénticos»). Donde el plan y la doctrina discrepan, manda la doctrina"
  - "D-48-23: LÍMITE CONOCIDO de D-48-19, aceptado por el autor — la regla se aplica donde el ITALIANO marca la persona con pronombre ESCRITO; donde la marca solo por morfología, el español no lo replica. No es deuda ni desviación: es el borde de la regla, dicho en voz alta"
  - "D-48-24: el condizionale composto CONTRAFACTUAL queda FUERA de la enmienda y fuera del cumplimiento literal — su español ya usa el compuesto y la enmienda no absuelve nada sobre él"
  - "D-48-25: las 6 hermanas del condizionale passato NO se uniforman: 5 futuro-del-pasado con condicional simple + 1 contrafactual con el compuesto. La coherencia intra-slot está subordinada a la fidelidad"
  - "D-48-26: el participio de presente italiano se rinde con la construcción española que la lengua sí tiene (`en funciones`, `que forman parte`); SC-2 se reporta NO CUMPLIDO para esas dos variantes, por imposibilidad del español"
metrics:
  duration: "~95 min"
  completed: "2026-08-16"
actuals:
  tokens: 32000
  tasks: 2
  commits: 3
---

# Phase 48 Plan 04: `fare-indefiniti` + `fare-cond-imperativo` — el bloque cerrado Summary

Las 38 traducciones que faltaban existen, están `validated` por quórum cross-vendor real, y
**el bloque `fare` cierra en 122/122 con `TRAD-COV: PASS (328/328)` y el reporter en exit 0**.

Pero el resultado que importa no es la cifra. Es que **un barrido mecánico de dos regex cazó un
defecto real ANTES de gastar una sola llamada**, y que **el disparador de escalada que este mismo
plan había escrito era demasiado estricto** y por poco cierra por override una clase entera que
pedía enmienda.

## Lo que el barrido mecánico encontró antes que el quórum

Los dos barridos que el estado aguas arriba prescribió se corrieron **sobre mis propias 38 antes de
someterlas al quórum**, y **cada detector se verificó POR MUTACIÓN** — no por que saliera verde,
que es exactamente la lección de la `WINDOWS` id 44:

| Barrido | Mutación de prueba | Esperado | Obtenido | Sobre las 38 reales |
|---|---|---|---|---|
| Persona indeterminada | quitar `ella` de `gerundio-passato#1` | ROJO | **ROJO** | **0 flags** |
| Persona indeterminada | quitar `él` de `cond-presente#2`, `yo` de `cond-passato#0` | ROJO | **ROJO** (2) | **0 flags** |
| Marco cerrado × perfecto compuesto | «Ayer **he hecho** los deberes con Anna» | ROJO | **ROJO** | **0 flags** |

**El primero encontró un defecto de verdad mientras autoraba.** `fare-indefiniti-gerundio-passato#1`
(`Avendo fatto il lavoro il giorno prima, **lei** era già libera`) iba a salir como «…ya **estaba**
libre», con `estaba` **sincrética de 1ª y 3ª del singular** y el italiano fijando la persona con
`lei`. Se escribió «**ella** ya estaba libre» **antes de la primera llamada**. Coste del hallazgo:
cero llamadas. Ése es el punto ciego del quórum cerrado por otra vía, que es para lo que se
prescribió el barrido.

Las otras tres casillas donde D-48-19 mordió, todas escritas con pronombre desde el principio:

| Variante | Italiano | Español | Forma sincrética |
|---|---|---|---|
| `cond-presente#0` | `Se fossi in te, **io** farei…` | Si estuviera en tu lugar, **yo** haría todo de otra manera. | `haría` |
| `cond-presente#2` | `…**lui** farebbe una foto…` | Si no fuera tan tarde, **él** haría una foto al atardecer. | `haría` |
| `cond-passato#0` | `…che **io** avrei fatto…` | Había jurado que **yo** haría el trabajo la semana siguiente. | `haría` |

**Y el barrido de marco cerrado × perfecto compuesto se corrió también sobre las 328 del corpus
entero: 0 coincidencias.** La red que 48-03 prescribió para 48-05 sigue limpia.

## El bloqueo, y por qué mi recomendación fue la equivocada

`fare-cond-imperativo-cond-passato#1` salió **`disputed`**. `gemini-3.5-flash-lite` objetó que el
español usa el condicional **simple** donde el italiano usa el **compuesto**.

**El trabajo adversarial se hizo con CERO llamadas nuevas**, leyendo del disco lo que el propio
objetor había votado en las estructuras idénticas:

| Variante | Español | `gemini-3.5-flash-lite` | `deepseek-reasoner` |
|---|---|---|---|
| `cond-passato#0` | Había jurado que yo **haría** el trabajo… | `correcta` | `correcta` |
| `cond-passato#1` | Sabía que **harías** los deberes… | **`incorrecta`** | `correcta` |
| `cond-passato#2` | Ha dicho que él **haría** todo… | `correcta` | `correcta` |
| `cond-passato#3` | Estaba seguro de que **cometeríamos** un error… | `correcta` | `correcta` |
| `cond-passato#5` | Me ha prometido que **harían** una foto… | `correcta` | `correcta` |
| `cond-passato#4` *(contrafactual)* | **Habríais hecho** un pastel de buena gana… | `correcta` | `correcta` |

El concern literal, transcrito antes de retirarse:

> `[S2-fidelidad] cambia el tiempo verbal: el italiano usa el condicional compuesto ('avresti fatto', 'habrías hecho'), pero la traducción usa el condicional simple ('harías'). Sugerencia: "Sabía que habrías hecho los deberes al día siguiente."`

**Dónde acerté y dónde me equivoqué, dicho sin adornos.** El análisis de fondo era correcto: la
sugerencia del objetor **no es futuro del pasado en español** —se lee contrafactual o como
probabilidad del pasado—, así que obedecerla habría **inyectado** una lectura ausente del original,
que es el mismo argumento con el que D-48-14 descartó la `opcion-b`. Pero **la conclusión operativa
era la equivocada**: recomendé cerrar por override porque **el disparador de escalada que este plan
escribió** —«dos vendors marcando estructuras idénticas»— no se cumplía.

**El disparador del plan era más estricto que la doctrina del proyecto.** *Marcar uno y aprobar
cuatro idénticos* **es** la firma canónica de la `WINDOWS` id 37, la misma que ya obligó a las
cuatro enmiendas anteriores. Y pesaba un factor que ninguna de mis tres opciones capturaba: **el
fenómeno es sistemático y reaparecerá en las categorías que quedan de TRAD-X1.** Un override cierra
una casilla; la enmienda cierra la clase. Queda como **D-48-22**.

## La quinta enmienda del doc de criterios

**Aclaración de S2: el condizionale COMPOSTO italiano como FUTURO DEL PASADO se dice en español con
condicional SIMPLE** — sexta hermana de `da` + PERSONA, PARTITIVO, ADVERBIAL DE COMIDA, PRONOMBRE
SUJETO y MODO DEL CONGIUNTIVO.

**Lo que la enmienda NO absuelve, y es lo que la mantiene estrecha:** el condizionale composto
**contrafactual** (`Voi avreste fatto una torta volentieri, ma alla fine non è successo`) **sí** pide
el compuesto en español. La aclaración cubre **un valor de los dos**, y el texto los distingue por el
marco de la propia frase.

**Prueba de dos condiciones del carve-out de 47-01:**

1. **Ausencia de sujeto: FALLA.** Medido **ancho primero y refinado después**, sobre las **328**
   traducciones. La medida ancha (auxiliar en condizionale presente) dio **7**, con **1 fuera** de
   `fare-cond-imperativo` — `fare-congiuntivo-disparador#4`, `sarebbe contenta`, que es condizionale
   **presente + adjetivo** y no compuesto. Refinado exigiendo **auxiliar + PARTICIPIO**: **N = 6, las
   6 de `cond-passato`, cero fuera.** De ellas **5 son de futuro del pasado** y son el sujeto; la
   sexta es el contrafactual, que **no entra** (D-48-24). Los cinco cuerpos cerrados (96 + 62 + 48 +
   54 + 30 = **290**) tienen **cero** condizionale composto. Sujeto íntegramente **en vuelo del
   propio plan**.
2. **Direccionalidad absolutoria: SE MANTIENE, verificada POR GREP.** Sobre las **48 líneas** nuevas:
   **cero** coincidencias de los patrones de endurecimiento del veto de 47-01 (`marca como
   incorrecta`, `marca sX false`, `exige que`, `debes`, `tienes que marcar/exigir`), frente a **4**
   marcas absolutorias. `git diff --numstat`: **48 inserciones, 0 borrados**.

Falla una ⇒ **cumplimiento literal**, ejecutado: **las 5 re-validadas desde cero**, `passes[]`
reseteado a vacío, **10 llamadas, 10 `correcta`, cero auto-fallbacks, cero pases pre-enmienda
supervivientes**. Los pases retirados quedaron transcritos literalmente antes de retirarse (D-48-07).

**`cond-passato#1` cierra SIN tocar un carácter del español, SIN override y SIN tercer juez** —
mismo movimiento que `disparador#1` (48-03), `301#1` (48-02) y `delle-invariable#0` (Phase 47).
**Overrides: 8 en `HEAD` → 8 ahora.** **D-48-01 sin desviaciones nuevas de homogeneidad.**

### Una acotación del precedente, dicha porque las dos veces anteriores fue al revés

**El cumplimiento literal NO destapó nada esta vez**: las 10 llamadas volvieron `correcta` sin un
solo concern nuevo. No es un fallo del método — es que el sujeto eran **5 variantes recién autoradas
bajo las cuatro enmiendas ya vigentes**, no un cuerpo cerrado bajo un doc anterior. El precedente
(«pagarlo destapa lo que un argumento no destapa») **se acota**: destapa cuando el sujeto **tiene
historia**; sobre trabajo **en vuelo**, confirma.

## Los dos arreglos del code review de la Phase 47, verificados por OBSERVACIÓN

**WR-01 · `capitalizarSiAbre`** — los 3 `prompt` que abren con el marcador de hueco, transcritos
LITERALMENTE de la invocación en seco. **Los tres abren en mayúscula:**

```
Facendo tutto in fretta, lei ha rotto un piatto.
Avendo fatto i compiti la sera prima, io ho potuto dormire fino a tardi.
Avendo fatto il lavoro il giorno prima, lei era già libera.
```

**WR-02 · rama `OPCION_ELIDIDA`** — la única opción con apóstrofo final del bloque, del `--dry-run`
real del validador:

```json
"italianoResuelto": "Marco, fa' una foto con il tuo telefono!"
```

**Ni espacio sobrante ni apóstrofo desplazado.** El apóstrofo se queda pegado a `fa` y el espacio
ante `una` se conserva — que es lo correcto, porque `fa'` es **apócope y no elisión**, y no se suelda.
Los dos modos de fallo eran silenciosos por naturaleza: la única mitigación era mirarlos, y se
miraron.

## Las cuatro asimetrías entre lenguas, declaradas

### 1. El participio de presente — el Success Criterion 2 NO se cumple, y es imposibilidad del español

| Dirección compuesta | Italiano | Español |
|---|---|---|
| `fare-indefiniti-participio-presente#0` | Il direttore **facente** funzione ha firmato il documento oggi. | El director **en funciones** ha firmado el documento hoy. |
| `fare-indefiniti-participio-presente#1` | I paesi **facenti** parte dell'accordo devono rispettare le nuove regole. | Los países **que forman parte** del acuerdo deben respetar las nuevas reglas. |

**Para estas dos variantes el Success Criterion 2 no se cumple, y la causa es una imposibilidad de la
lengua española, no una decisión de traducción.** El español **no tiene participio de presente
productivo**: `*haciente` no existe en ningún registro. La forma italiana se rinde con un sintagma
preposicional en la primera y con una oración de relativo en la segunda — **los recursos que el
español sí tiene**. Ninguna de las dos traducciones contiene una forma verbal española inexistente.
Calcar una para «que se viera la forma» habría sido enseñar una lengua que no existe.

### 2. El imperativo negativo de 2ª persona

`Anna, non **fare** un errore adesso!` → «Anna, ¡no **cometas** un error ahora!»

El italiano construye la orden negativa de tú con **infinitivo**; el español usa su propia forma.
**Verificado por lectura: la traducción no usa un infinitivo español como imperativo negativo.**

### 3. El condizionale passato, repartido variante a variante

**Las 6 NO usan la misma forma. Uniformarlas habría traducido mal cinco frases o una.**

| Variante | Uso | Forma española | Traducción |
|---|---|---|---|
| `#0` | futuro del pasado | condicional **simple** | Había jurado que yo **haría** el trabajo la semana siguiente. |
| `#1` | futuro del pasado | condicional **simple** | Sabía que **harías** los deberes al día siguiente. |
| `#2` | futuro del pasado | condicional **simple** | Ha dicho que él **haría** todo la semana siguiente. |
| `#3` | futuro del pasado | condicional **simple** | Estaba seguro de que **cometeríamos** un error más tarde. |
| `#5` | futuro del pasado | condicional **simple** | Me ha prometido que **harían** una foto al grupo al día siguiente. |
| `#4` | **contrafactual** | condicional **COMPUESTO** | **Habríais hecho** un pastel de buena gana, pero al final no ocurrió. |

**5 simple + 1 compuesto.** La regla de coherencia intra-slot **se rompe aquí a propósito**, y
romperla es lo correcto: es una heurística de calidad subordinada a la fidelidad (T-48-25).

### 4. El imperativo y sus homógrafas del congiuntivo

Las cinco del imperativo, y al lado la traducción ya cerrada de su hermana homógrafa:

| Forma italiana | Imperativo (este plan) | Homógrafa ya cerrada |
|---|---|---|
| `fa'` | Marco, ¡**haz** una foto con tu teléfono! | *(única sin homógrafa)* |
| `faccia` | Señor Rossi, **haga** el trabajo con calma. | `congiuntivo-presente#0`: Hace falta que yo **haga** los deberes esta noche. |
| `facciamo` | ¡Venga, **hagamos** los dos un pastel para la fiesta! | `congiuntivo-presente#3`: Aunque **hacemos** todo, el profesor nunca está contento. |
| `fate` | Niños, ¡**haced** los deberes antes de la cena! | `indicativo-presente#4`: Todas las mañanas **hacéis** el trabajo. |
| `facciano` | Señores, **hagan** todo sin prisa, como ustedes prefieran. | `congiuntivo-presente#5`: Es importante que no **cometan** un error ahora. |

**Las dos formales se leen como órdenes de cortesía y no como subjuntivos subordinados:** van en
oración principal, sin `que` y sin verbo matriz, mientras sus homógrafas viven todas dentro de una
subordinada introducida por `que`. La distinción es legible sin abrir el JSON.

**La exhortativa incluye al hablante:** «¡Venga, **hagamos** los dos un pastel para la fiesta!» — el
`noi due` del italiano se conserva en «los dos» y la 1ª del plural mete al hablante dentro del grupo.
Un vocativo dirigido a otros no lo excluiría, y aquí no hay ninguno que lo intente.

## El límite conocido de D-48-19, declarado y aceptado

Tres verbos **MATRIZ** míos son sincréticos en español mientras el italiano fija la persona **por
morfología y sin pronombre escrito**:

| Variante | Italiano | Persona en italiano | Español | Forma sincrética |
|---|---|---|---|---|
| `cond-passato#0` | `**Aveva** giurato che…` | 3ª sg inequívoca | **Había jurado** que yo haría… | `había jurado` |
| `cond-passato#1` | `**Sapevo** che…` | 1ª sg inequívoca | **Sabía** que harías… | `sabía` |
| `cond-passato#3` | `**Era** sicuro che…` | 3ª sg inequívoca | **Estaba seguro** de que… | `estaba` |

**Se quedan bare, por decisión del autor.** La regla se aplica donde el italiano marca la persona con
**pronombre escrito**; donde la marca **solo por morfología**, el español no lo replica. Dos apoyos:
el alcance de D-48-19 se midió en 48-03 sobre «italiano con pronombre sujeto **explícito**» (11 = 7 +
4), y el corpus **ya cerrado** hace exactamente lo mismo — «**No creía** que él hiciera el trabajo
solo», «Mi madre **creía** que habías hecho…», «**No creía** que hubierais hecho…».

**No es deuda ni desviación pendiente: es el borde de la regla.** Queda como **D-48-23** y como
entrada de `WINDOWS`. Haberlo dicho en voz alta en vez de enterrarlo es lo que permite que sea una
decisión.

## El cierre del bloque, contado del disco

| Categoría | Variantes `multiple-choice` | Con traducción | `validated` | `disputed` |
|---|---|---|---|---|
| `fare-indicativo` | 54 | 54 | 54 | 0 |
| `fare-congiuntivo` | 30 | 30 | 30 | 0 |
| `fare-indefiniti` | 21 | 21 | 21 | 0 |
| `fare-cond-imperativo` | 17 | 17 | 17 | 0 |
| **TOTAL** | **122** | **122** | **122** | **0** |

**Las tres cifras derivadas por recorrido propio con `deriveStatus` sobre el disco, no sumadas de los
SUMMARY anteriores.**

**Pares byte-idénticos entre las 122: 0.** Contado con un `Set` sobre el disco. Cero deduplicaciones
y cero diferencias artificiales.

### Las líneas del reporter, literales

```
Cobertura de traducción — unidad: VARIANTE multiple-choice (7 categorías declaradas cubiertas, 328 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 62         | 0         | 0        | 0
fare-indicativo          | 54       | 54         | 0         | 0        | 0
fare-congiuntivo         | 30       | 30         | 0         | 0        | 0
fare-indefiniti          | 21       | 21         | 0         | 0        | 0
fare-cond-imperativo     | 17       | 17         | 0         | 0        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (328/328 traducciones validated): PASS (328/328)

Milestone gate PASS.
```

`node scripts/run-validation-271.mjs; echo $?` → **0**.

## El rojo intencionado, atribuido y en el sub-gate correcto

Los dos estados parciales, transcritos:

| Momento | TRAD-COV | VAL-04/06/08/09 |
|---|---|---|
| Tras enganchar `fare-indefiniti`, antes de validar | `FAIL (290/311 — pending=21, missing=0, disputed=0)` | **PASS** |
| Tras enganchar `fare-cond-imperativo`, antes de validar | `FAIL (311/328 — pending=17, missing=0, disputed=0)` | **PASS** |
| Con la `disputed` viva | `FAIL (327/328 — pending=0, missing=0, disputed=1)` | **PASS** |

**El rojo cayó las tres veces en TRAD-COV y nunca en VAL-08**, que es lo correcto (`WINDOWS` id 40).

## La longitud, medida para que 48-05 no la estime

Las tres traducciones más largas de `fare-indefiniti`, con su recuento y su dirección compuesta:

| Caracteres | Dirección | Traducción |
|---|---|---|
| **108** | `fare-indefiniti-300#0` | Mañana tengo que hacer los deberes: es una obligación del colegio, no tengo elección; si no, saco mala nota. |
| **108** | `fare-indefiniti-300#2` | El sábado queremos hacer un pastel para el cumpleaños de Marco: es un deseo nuestro, nadie nos lo ha pedido. |
| **73** | `fare-indefiniti-participio-presente#1` | Los países que forman parte del acuerdo deben respetar las nuevas reglas. |

Las dos de 108 son **las candidatas del backstop long-text que 48-05 re-prueba**, y son las que el
plan predijo. Las tres de `fare-indefiniti-300` rinden la frase italiana **entera** —principal y
subordinada—, coinciden con el gloss en la parte glosada (que es correcto y esperable) y **no
reproducen los paréntesis**: verificado por grep, 0 coincidencias.

## Desviaciones del plan

### 1. [Rule 3 — Bloqueante] Las DOS paredes de contenido, abiertas y verificadas por MUTACIÓN

`tests/content-fare-indefiniti.test.js:660` y `tests/content-fare-cond-imperativo.test.js:609`
congelaban el key set de variante en 3 claves. Arreglo idéntico al de 48-01 y 48-03: descontar
`translationES` **y esa clave sola**.

| Fichero | Mutación | Esperado | Obtenido |
|---|---|---|---|
| `content-fare-indefiniti` | clave intrusa `hint` | ROJO | **ROJO** (`key set de fare-indefiniti-infinito-presente#0`) |
| `content-fare-indefiniti` | `prompt` → `promt` | ROJO | **ROJO** (7 fallos) |
| `content-fare-indefiniti` | restaurado | VERDE + disco byte-idéntico | **VERDE 111/111**, `diff -q` IDÉNTICO |
| `content-fare-cond-imperativo` | clave intrusa `hint` | ROJO | **ROJO** (`key set de fare-cond-imperativo-cond-presente#0`) |
| `content-fare-cond-imperativo` | `prompt` → `promt` | ROJO | **ROJO** (8 fallos) |
| `content-fare-cond-imperativo` | restaurado | VERDE + disco byte-idéntico | **VERDE 79/79**, `diff -q` IDÉNTICO |

Ninguna de las dos se verificó por que pasara a verde.

### 2. [Decisión del autor] La cuarta vía frente a las tres opciones del executor

Descrita arriba. El executor propuso override, tercer juez o reescritura; el autor eligió **enmendar
el doc**, que ninguna de las tres capturaba.

## Verificación

| # | Criterio | Resultado |
|---|---|---|
| 1 | Gate anti-ceguera tras cada enganche | exit **0**, 66/66; **6** pares ↔ 6 categorías, luego **7** ↔ 7; 0 cruzados |
| 2 | Ancla por gesto explícito, dos veces | 6 claves y luego **7**; los 6 suelos preexistentes **idénticos a `HEAD`**; diff = clave nueva + fecha. Bump sin flag ANTES en las dos, único cambio `[ALTA]` |
| 3 | `expected` derivado | **0** literales numéricos en la región, **0** prosa nueva dentro del array |
| 4 | Rojo intencionado | TRAD-COV las 3 veces; **VAL-08 en PASS** siempre |
| 5 | 21/21 y 17/17 status **derivado** | `deriveStatus` sobre el disco: **38 validated**, 0 disputed, 0 pending; **38/38** con ≥2 `by` de 2 VENDORS |
| 6 | Higiene del texto | huecos `___` **0**; metalenguaje **0**; smart quotes **0**; paréntesis **0**; `<` `>` `&#` **0** en los dos ficheros |
| 7 | WR-01 / WR-02 | los 4 sujetos transcritos de la invocación en seco; 3 abren en mayúscula, el apóstrofo bien colocado |
| 8 | Cierre del bloque | **122 / 122 / 122**, derivadas del disco |
| 9 | Colisiones byte-idénticas entre las 122 | **0** |
| 10 | TRAD-COV final | **PASS (328/328)**, exit **0**, `Milestone gate PASS` |
| 11 | Violaciones de ancla | **0** en las dos corridas |
| 12 | Overrides | **8 en `HEAD` → 8 ahora.** Cero nuevos, cero terceros jueces |
| 13 | `validation` de SLOT | **0/7 y 0/3 distintos a `HEAD`**; los dos `notes` idénticos |
| 14 | Español tras validar | **0 caracteres modificados**; las 38 byte-idénticas a como se autoraron |
| 15 | Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `schemaVersion` **13** |
| 16 | Suite | **1297**/1293, **4 fallos** — los mismos pre-existentes, ni uno más |
| 17 | Barrido perfecto/simple sobre las 328 | **0 coincidencias** |
| 18 | TRAD-03 | sigue **`Pending`**, verificado al terminar — solo 48-05 lo cierra |

### Recuento de la operación

| Magnitud | Cifra, derivada |
|---|---|
| Traducciones autoradas | **38** (21 + 17) |
| Llamadas de quórum | **86** (42 + 34 + 10 del cumplimiento literal) |
| **Auto-fallbacks** | **0** — `by` escrito == `by` pinneado en las 86 |
| `disputed` encontrados / resueltos | **1 / 1** — **0 con override** |
| Overrides nuevos | **0** |
| Caracteres de español modificados tras validar | **0** |
| Defectos cazados por barrido mecánico antes del quórum | **1** (`gerundio-passato#1`), coste **0 llamadas** |

## Amenazas

- **T-48-25** (uniformar el condicional compuesto): **NO se uniformó.** Las 6 llevan su reparto
  transcrito variante a variante arriba; 5 simple + 1 compuesto.
- **T-48-26** (invertir el ratchet, dos veces): bump **sin flag primero** en las dos re-emisiones,
  diff leído, único cambio `[ALTA]`. **Ningún suelo bajó**, comparado uno a uno contra `HEAD`.
- **T-48-27** (gate ciego): anti-ceguera VERDE tras **cada** edición, 6↔6 y luego 7↔7, cero prosa en
  la región, `expected` derivado, 0 pares cruzados.
- **T-48-28** (italiano malformado al evaluador): los 4 sujetos comprobados **en seco antes** de
  gastar llamadas y transcritos literalmente.
- **T-48-29** (corrupción read-modify-write): `validation` de los **10** slots **idéntico a `HEAD`**,
  los dos `notes` idénticos, `git diff` entre lotes de slot.
- **T-48-30** (prompt injection): los 3 `prompt` con gloss español entre paréntesis se ejercieron 6
  veces; ningún vendor los obedeció como directiva y ninguna traducción reprodujo paréntesis.
- **T-48-31** (fuga de claves): claves comprobadas **por presencia y longitud**, sin imprimir valor.
  Ninguna en el JSON ni aquí.
- **T-48-32** (audit trail que miente): cero `by` editados a mano, cero auto-fallbacks, cero
  overrides nuevos. El pase `incorrecta` retirado está **transcrito literal** en `WINDOWS`, en la
  OCTAVA NOTA y aquí antes de retirarse.
- **T-48-33** (rate limits): concurrencia 1, cola verificada contra los dos proveedores antes de la
  primera llamada. **Se repite el dato de 48-03 porque volvió a pasar:** el listado de DeepSeek
  **NO** incluía `deepseek-reasoner` (devolvió `deepseek-v4-flash` y `deepseek-v4-pro`) y aun así el
  modelo respondió las 43 veces. La verificación de cola es **necesaria y no suficiente**.

## Known Stubs

Ninguno. Las 38 traducciones son contenido definitivo y `validated`.

## Registro

- **OCTAVA NOTA de D-46-12** en `46-CONTEXT.md`, con su ordinal **contado del disco** (el más alto
  escrito era el séptimo) y con la constancia de que el disparador del plan era más estricto que la
  doctrina.
- **`WINDOWS` id 50:** la quinta enmienda, con la prueba de dos condiciones y la acotación del
  precedente del cumplimiento literal.
- **`WINDOWS` id 51:** el límite conocido de D-48-19, con los tres ejemplos y el precedente del
  corpus cerrado.

## Sin cambios — todo sigue asignado a 48-05

**TRAD-03 sigue `Pending`**, verificado al terminar. Siguen abiertos y **no se han tocado**: la
colisión `hiciste` (`fare-indicativo-passato-remoto#1` ↔ `passato-prossimo#1`), las **4 variantes de
D-48-20**, el defecto de `--adjudicar` (id 45) y el saneo de `concerns[]` (id 43). Los 4 fallos
pre-existentes de la suite tampoco se tocaron.

## Notas para 48-05

1. **El backstop long-text tiene sujeto medido**: `fare-indefiniti-300#0` y `#2`, **108 caracteres**
   cada una. No hace falta estimarlo.
2. **Los dos barridos mecánicos están escritos y verificados por mutación**, y uno de ellos cazó un
   defecto real antes del quórum. Lo que queda es decidir si se convierten en **gates**.
3. **La quinta enmienda cierra una CLASE, no una casilla**: el condizionale composto como futuro del
   pasado reaparecerá en las categorías que quedan de TRAD-X1, y ya está absuelto.
4. **El precedente del cumplimiento literal queda acotado** (destapa cuando el sujeto tiene historia;
   sobre trabajo en vuelo, confirma). Dato útil para presupuestar.
5. **El límite de D-48-19 está cerrado por decisión del autor** y no necesita trabajo en 48-05.

## Self-Check: PASSED

- `content/exercises/fare-indefiniti.json` — FOUND (21 `translationES`, las 21 `validated`)
- `content/exercises/fare-cond-imperativo.json` — FOUND (17 `translationES`, las 17 `validated`)
- `scripts/run-validation-271.mjs` — FOUND (entradas `fare-indefiniti` y `fare-cond-imperativo`, `expected` derivado)
- `content/translation-coverage.lock.json` — FOUND (7 claves)
- `tests/content-fare-indefiniti.test.js` — FOUND (key set ensanchado y mutado)
- `tests/content-fare-cond-imperativo.test.js` — FOUND (key set ensanchado y mutado)
- `docs/TRANSLATION-VALIDATION-PROMPT.md` — FOUND (sección nueva, 48 inserciones, 0 borrados)
- `.planning/phases/46-…/46-CONTEXT.md` — FOUND (OCTAVA NOTA de D-46-12)
- `.planning/WINDOWS.md` — FOUND (ids 50 y 51)
- Commit `a58f34c` — FOUND
- Commit `0127afc` — FOUND
