# Phase 48 · Plan 05 — Evidencia de las mutaciones de cierre

> **Contenido:** las mutaciones de cierre de la fase, ejecutadas sobre el bloque `fare` ya completo
> (122 traducciones, corpus 328). Todas se EJECUTARON y en todas se OBSERVÓ el rojo con su exit code
> apuntado y su línea literal transcrita de la corrida. **Ninguna se leyó.**

> **Este fichero NO es el SUMMARY del plan 05.** El plan 05 está **parcialmente ejecutado**: las Tasks
> 1 y 2 están hechas, y la **Task 3 (`checkpoint:human-verify`, `gate="blocking"`) queda BLOQUEADA
> ESPERANDO AL AUTOR**. El SUMMARY se escribe cuando el autor cierre la Task 3, no antes: escribirlo
> ahora haría que el índice de planes leyera el plan como completo y se saltara el gate bloqueante. Es
> la misma disciplina que los ficheros equivalentes de las Phases 46 y 47.
>
> Existe porque el registro literal de los exit codes **es** la mitigación de T-48-35 y T-48-39. Si
> viviera solo en el contexto del ejecutor, se perdería al cerrarse la sesión y las mutaciones no
> contarían como ejecutadas.

- **Fecha de la corrida:** 2026-08-16
- **HEAD durante la corrida:** `a8947c0`
- **Ficheros mutados y restaurados:** `scripts/run-validation-271.mjs` (mutaciones 1 y 3, permutación B)
  · `content/translation-coverage.lock.json` (mutación 1b, permutación C) ·
  `content/exercises/fare-congiuntivo.json` (mutación 2) ·
  `content/exercises/fare-cond-imperativo.json` (mutación 3) ·
  `content/exercises/fare-indicativo.json` (permutación A, mutación 4)
- **md5 de la foto verde** — tomados ANTES de mutar nada, 2026-08-16T17:13:08Z:

| Fichero | md5 |
|---|---|
| `scripts/run-validation-271.mjs` | `38a26bc22de211120c0d2d25e7a42db9` |
| `content/translation-coverage.lock.json` | `766704b793037f4c8c8c62e120f222d9` |
| `content/exercises/fare-cond-imperativo.json` | `776a170f8fa87617a3e044f0b3f37a41` |
| `content/exercises/fare-congiuntivo.json` | `3ece2ead8cb8022718bcf6eb68afc00d` |
| `content/exercises/fare-indefiniti.json` | `edd207ef3912e05b41baa1d04c8cf9bb` |
| `content/exercises/fare-indicativo.json` | `1bf96ca69838dc17e445b68a2a274195` |
| `scripts/validate-translation-pass.mjs` | `223965012998e37c6310010a5856332b` |

**Método de restauración:** copia de fichero (`cp` desde la copia de la foto verde), **fichero a
fichero**, nunca `git checkout` / `git stash` / `git clean`. Es el idioma que la Phase 46 fijó
deliberadamente y la prohibición explícita del plan. La igualdad del md5 tras cada restauración es la
prueba de que fue exacta, no aproximada.

**`content/exercises/fare-indefiniti.json` NO se mutó.** Su md5 está en la tabla porque forma parte de
la foto verde de partida y porque su intactidad es criterio de aceptación; se dice en lugar de dejarlo
suponer.

---

## Foto verde de partida — 2026-08-16T17:13:08Z

```
$ git status --porcelain
 M .planning/config.json              ← flag de orquestación, ajeno a la fase
?? .planning/research/.cache/         ← untracked, ajeno a la fase
$ node scripts/run-validation-271.mjs ; echo $?
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
0
```

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?     # 2026-08-16T17:13:11Z
# tests 66
# suites 17
# pass 66
# fail 0
0
```

**Los dos exit codes de partida son 0.** Sin esta foto ningún rojo de abajo sería atribuible a su
mutación — es la `<precondition>` del Task 1, verificada y no asumida.

---

## MUTACIÓN 1 — desenganchar una categoría del array

**Categoría desenganchada: `fare-indicativo`**, la más grande de las cuatro (54 variantes), elegida
para que la diferencia en el total sea inconfundible.

La entrada se **QUITA**, no se comenta ni se deforma: el script de mutación localiza la apertura
`const TRANSLATION_COVERAGE = [` y su `];`, elimina la línea entera de la entrada nombrada, y **aborta**
si no encuentra la apertura, si no encuentra el cierre, si la entrada pedida no aparece, o si el fichero
resultante es idéntico al de partida. `git diff --stat`: `1 file changed, 1 deletion(-)`.

**Las 54 traducciones siguen en disco, íntegras y `validated`, durante toda la mutación.** Eso es lo
que hace de esto una prueba de **ceguera** y no de ausencia.

### 1a — el rojo OBSERVADO en el gate anti-ceguera — 2026-08-16T17:13:24Z

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
    not ok 2 - las lineas de entrada del array de cobertura de TRADUCCION tambien sobreviven byte a byte (D-46-17)
not ok 5 - integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)
    not ok 1 - scripts/run-validation-271.mjs: ninguna categoria con traduccion en disco queda fuera del array de cobertura de traduccion
not ok 7 - GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)
# tests 66
# pass 64
# fail 2
1
```

- **Exit code observado: `1`.**
- **Mensaje literal de GATE-02**, transcrito de la corrida:

  > `D-46-17: el extractor ve 6 pares en la region de `TRANSLATION_COVERAGE` de
  > scripts/run-validation-271.mjs y el disco declara 7 categorias cubiertas de traduccion (articoli,
  > fare-cond-imperativo, fare-congiuntivo, fare-indefiniti, fare-indicativo, partitivos,
  > preposiciones). Las dos causas son reales: o el reporter dejo de declarar una entrada —y entonces
  > la ceguera ya existe, y quedarian CIEGAS: **fare-indicativo**—, o el extractor dejo de ver su array
  > (una entrada partida en dos lineas, un slug detras del file, la declaracion renombrada). Con lista
  > vacia esta comprobacion pasaria en verde`
  >
  > `6 !== 7`

  **`fare-indicativo` queda nombrada como categoría con traducciones en disco no enganchada**, que es
  literalmente lo que el criterio de aceptación pide.

- La **cláusula de no-vacuidad se quedó VERDE**: el recorrido del disco sí encontró las 7 categorías
  cubiertas y las nombra una a una. El rojo viene del **hecho medido** (falta una entrada) y no de un
  reconocedor que dejó de casar. Un rojo por no-vacuidad habría sido un rojo inútil.

### 1a — el reporter, con la expectativa del plan CORREGIDA por lo observado

El plan escribía: *«Correr el reporter: debe emitir un PASS de cobertura con un total MENOR, ciego a
esas variantes»*. **No lo hace, y no lo hace porque el ancla lo impide.** Transcrito:

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (6 categorías declaradas cubiertas, 274 variantes)
  TRAD-COV (274/274 traducciones validated): FAIL (EL DENOMINADOR ENCOGIÓ — fare-indicativo: anclada con 54 variante(s) y YA NO está declarada cubierta — sus 54 variantes desaparecieron del denominador)
Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
  - TRAD-COV: ROJO porque EL DENOMINADOR ENCOGIÓ, no por cobertura incompleta.
      fare-indicativo: anclada con 54 variante(s) y YA NO está declarada cubierta — sus 54 variantes desaparecieron del denominador
1
```

**Las dos cifras que el criterio de aceptación pide, transcritas:** el total de la foto verde es
**328** y el total con la mutación es **274**. La diferencia es **54**, que es **exactamente** el
número de variantes de la categoría desenganchada. El denominador encogió; lo que ya no ocurre es que
encoja **en silencio**.

**Esto es un hallazgo, y a favor.** La expectativa del plan es correcta para el mundo anterior al CR-02
de la Phase 47 y ha quedado obsoleta por el ancla que aquel code review introdujo. Se registra en vez
de reescribirse: el plan pedía un pass ciego y lo que hay es un segundo gate independiente que lo
impide. El pass ciego **sí existe** y se reproduce abajo, pero hace falta una mutación más profunda.

### 1b — el PASS CIEGO reproducido, quitando también la clave del ancla — 2026-08-16T17:13:40Z

Es el gesto de un autor que desengancha la entrada y a continuación re-emite el ancla sin mirar (o el
mundo anterior al CR-02). Mutación: la de 1a **más** `delete lock.categorias['fare-indicativo']`.

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (6 categorías declaradas cubiertas, 274 variantes)
  TRAD-COV (274/274 traducciones validated): PASS (274/274)
Milestone gate PASS.
0
```

**El reporter sale en `exit 0` con `Milestone gate PASS` mientras 54 traducciones validadas están en
disco sin contarse.** `328` se convirtió en `274` y nada se puso rojo en el reporter: es el
`225/225 PASS` de las Phases 41/42/43 trasladado a las variantes, reproducido literalmente sobre el
bloque `fare`.

**Y con el reporter ciego, la suite sigue roja por DOS caminos independientes** — 2026-08-16T17:13:47Z:

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
not ok 5 - integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)
not ok 7 - GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)
not ok 16 - GATE-03 - el denominador de cobertura de traduccion no encoge en silencio (CR-02)
# tests 66
# pass 63
# fail 3
1
```

**Mensaje literal de GATE-03**, transcrito:

> `GATE-03: estas categorias tienen traducciones en disco y NO estan ancladas, asi que su denominador
> puede encoger sin que nada lo vea: **fare-indicativo**. Ejecuta: node
> scripts/bump-translation-lock.mjs --write`

**Conclusión de la mutación 1:** el vector está cubierto **tres veces** —GATE-02, GATE-03 y el ancla
del reporter—, y las tres nombran a `fare-indicativo`. Hace falta romper las **tres** a la vez para que
el pass ciego llegue a emitirse, y aun así la suite no lo deja pasar.

### Restauración — 2026-08-16T17:13:47Z

```
$ cp <copia-de-la-foto-verde> scripts/run-validation-271.mjs
$ cp <copia-de-la-foto-verde> content/translation-coverage.lock.json
$ md5sum scripts/run-validation-271.mjs content/translation-coverage.lock.json
38a26bc22de211120c0d2d25e7a42db9  scripts/run-validation-271.mjs          ← idéntico a la foto verde
766704b793037f4c8c8c62e120f222d9  content/translation-coverage.lock.json  ← idéntico a la foto verde
$ git status --porcelain scripts/ content/
(vacío)
```

---

## MUTACIÓN 2 — borrar UNA variante validada de una categoría anclada

**Variante borrada: `fare-congiuntivo-disparador#5`**, impresa por el propio script de mutación antes
de tocar nada:

```
VARIANTE QUE SE BORRA: fare-congiuntivo-disparador#5
  italiano: Io so che lui ___ il lavoro in questo momento.
  espanol : Sé que hace el trabajo en este momento.
  status  : validated | pases: deepseek-reasoner:correcta, gemini-3.5-flash-lite:correcta
MUTADO: fare-congiuntivo baja de 30 a 29 variantes multiple-choice
```

El script aborta si la variante no tiene `translationES.validation`, si no está `validated`, si no
localiza el prompt en el texto, si el resultado no parsea como JSON, o si el fichero resultante es
idéntico al de partida. `git diff --stat`: `1 file changed, 30 deletions(-)`.

### El rojo OBSERVADO — 2026-08-16T17:14:18Z

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (7 categorías declaradas cubiertas, 327 variantes)
  TRAD-COV (327/327 traducciones validated): FAIL (EL DENOMINADOR ENCOGIÓ — fare-congiuntivo: el ancla fija 30 variante(s) multiple-choice y en disco quedan 29 (faltan 1))
Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
  - TRAD-COV: ROJO porque EL DENOMINADOR ENCOGIÓ, no por cobertura incompleta.
      fare-congiuntivo: el ancla fija 30 variante(s) multiple-choice y en disco quedan 29 (faltan 1)
1
```

- **Exit code observado: `1`.**
- **El mensaje nombra la categoría y LAS DOS CIFRAS**, que es lo que el criterio de aceptación pide:
  `fare-congiuntivo`, ancla **30**, disco **29**, y además la resta explícita (`faltan 1`).
- **La tautología que el ancla existe para romper queda a la vista en la propia línea:**
  `TRAD-COV (327/327 traducciones validated)` — `expected`, `surfaces` y `validated` bajaron los tres a
  la vez porque los tres se derivan del mismo fichero en la misma corrida, y la igualdad de enteros del
  veredicto sigue cuadrando. **Antes del CR-02 esto era `PASS (327/327)` en exit 0.** El ancla es el
  único término del veredicto que el borrado no puede mover consigo, y es el que emite el rojo.
- El rojo **distingue su causa**: dice `ROJO porque EL DENOMINADOR ENCOGIÓ, no por cobertura
  incompleta`. Las dos causas no se funden, que es la propiedad que el comentario del ancla declara y
  aquí se observa.

### Restauración, verificada en tres planos — 2026-08-16T17:14:28Z

```
$ cp <copia-de-la-foto-verde> content/exercises/fare-congiuntivo.json
$ md5sum content/exercises/fare-congiuntivo.json
3ece2ead8cb8022718bcf6eb68afc00d          ← idéntico a la foto verde
$ git status --porcelain content/
(vacío)
$ node -e '<lee la última variante del último slot del disco>'
fare-congiuntivo-disparador#5 | Sé que hace el trabajo en este momento. | validated
```

md5 byte a byte, `porcelain` vacío y **la lectura del dato concreto** de vuelta. Un md5 igual con un
texto distinto es imposible, pero el tercer plano es el que se lee sin saber eso.

---

## MUTACIÓN 3 — borrar TODAS las traducciones de una categoría

**Categoría: `fare-cond-imperativo`**, la más pequeña de las cuatro (17 variantes). La mutación tiene
**dos pasos**, y los dos importan porque el agujero solo aparece cuando se dan los dos.

### 3a — quitar las 17 `translationES` y dejar la entrada en el array

```
MUTADO: retiradas 17 translationES de fare-cond-imperativo
```

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?     # 2026-08-16T17:14:38Z
not ok 7 - GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)
not ok 16 - GATE-03 - el denominador de cobertura de traduccion no encoge en silencio (CR-02)
# tests 66
# pass 64
# fail 2
1
```

GATE-02 muerde, pero **por la dirección contraria**: hay 7 pares en el array y el disco ya solo declara
**6** categorías cubiertas. Ése es exactamente el estado que invita a «arreglarlo» retirando la
entrada — y es lo que el paso 3b hace.

### 3b — retirar TAMBIÉN la entrada del array, que es lo que 3a permite

```
MUTADO: retirada la entrada 'fare-cond-imperativo' de TRANSLATION_COVERAGE
```

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?     # 2026-08-16T17:14:44Z
not ok 16 - GATE-03 - el denominador de cobertura de traduccion no encoge en silencio (CR-02)
# tests 66
# pass 65
# fail 1
1
```

**GATE-02 se pone VERDE.** Seis pares y seis categorías cubiertas: para el gate anti-ceguera el estado
es coherente, porque la categoría **dejó de estar declarada cubierta** y por tanto ya no exige su
entrada. **Ahí está el agujero, observado y no argumentado**, y es exactamente el que el ancla tapa:

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (6 categorías declaradas cubiertas, 311 variantes)
  TRAD-COV (311/311 traducciones validated): FAIL (EL DENOMINADOR ENCOGIÓ — fare-cond-imperativo: anclada con 17 variante(s) y YA NO está declarada cubierta — sus 17 variantes desaparecieron del denominador)
Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
  - TRAD-COV: ROJO porque EL DENOMINADOR ENCOGIÓ, no por cobertura incompleta.
      fare-cond-imperativo: anclada con 17 variante(s) y YA NO está declarada cubierta — sus 17 variantes desaparecieron del denominador
1
```

- **Exit code observado: `1`.**
- **El mensaje nombra la categoría y cuántas variantes desaparecen del denominador**: `fare-cond-imperativo`,
  **17**, y lo dice con esas palabras (`sus 17 variantes desaparecieron del denominador`). Es el
  criterio de aceptación, literal.
- El total pasa de **328** a **311**; la diferencia es **17**.
- Y la rama del mensaje es **la otra** de las dos que el ancla tiene: no es «suelo incumplido» (la de la
  mutación 2) sino «anclada y ya no declarada cubierta». **Las dos ramas quedan ejercidas**, cada una
  por su vector, y ninguna es la que dispara la otra.

**Mensaje literal de GATE-03** en este mismo estado:

> `GATE-03 / CR-02: el numero de variantes multiple-choice cayo por debajo del ancla. La cifra de
> TRAD-COV seguira CUADRANDO (expected, surfaces y validated se derivan del mismo fichero y bajan
> juntos), asi que este es el unico sitio donde se ve: **fare-cond-imperativo: ancla 17, disco 0**. Si
> el borrado no era deliberado, restaura la variante; si lo era, re-emite el ancla con node
> scripts/bump-translation-lock.mjs --write`

### HALLAZGO DE LEGIBILIDAD (menor, registrado y NO arreglado): `disco 0` no es un conteo

El mensaje de GATE-03 dice `el numero de variantes multiple-choice cayo por debajo del ancla` y reporta
`disco 0`. **En disco siguen existiendo las 17 variantes multiple-choice**: lo que cayó a cero no es su
número, sino la presencia de la categoría en el conjunto de cubiertas. La causa está a la vista en el
código del gate (`tests/count-arrays-lockstep.test.js:2652`): `disco[slug] ?? 0`, y
`conteoMcDeCategoriasCubiertas()` omite del mapa las categorías que no tienen **ninguna** variante con
`translationES`. El `0` es el fallback del `??`, no una medida.

**Consecuencia real:** GATE-03 funde en un solo mensaje las dos causas que **el ancla del reporter sí
distingue** con dos textos distintos («ya no está declarada cubierta» frente a «el ancla fija N y en
disco quedan M»). Un autor que lea solo GATE-03 buscará variantes borradas donde lo que pasó fue que se
retiró el campo de traducción.

**NO SE ARREGLA AQUÍ, a propósito.** Arreglar el mensaje de un gate desde el plan de cierre exigiría su
propia mutación, y convertir un cierre en un cambio de gate sin verificar es el modo de fallo que este
proyecto ya pagó (prohibición explícita del plan, T-48-39). Se **escala** al autor y queda en el ledger.
El rojo **no es ilegible** —nombra la categoría, la cifra anclada y el remedio—, así que no bloquea: es
una imprecisión de prosa en la magnitud, no una ausencia de sujeto.

### Restauración — 2026-08-16T17:14:51Z

```
$ cp <copia-de-la-foto-verde> content/exercises/fare-cond-imperativo.json
$ cp <copia-de-la-foto-verde> scripts/run-validation-271.mjs
$ md5sum content/exercises/fare-cond-imperativo.json scripts/run-validation-271.mjs
776a170f8fa87617a3e044f0b3f37a41  content/exercises/fare-cond-imperativo.json   ← idéntico
38a26bc22de211120c0d2d25e7a42db9  scripts/run-validation-271.mjs                ← idéntico
$ git status --porcelain content/ scripts/ tests/
(vacío)
```

---

## Las TRES permutaciones de orden — la fila `ordering` de la sonda de bordes, EJECUTADA

Las tres se ejecutan sobre el árbol real y se restauran. **Afirmar la propiedad sin ejecutarla no
cuenta**, que es el motivo por el que el plan las pide permutando de verdad.

### Permutación A — `passes[]` de una variante `validated` — 2026-08-16T17:15:xx

**Sujeto: `fare-indicativo-presente#0`**, la primera variante del fichero con ≥2 pases.

```
  orden ANTES   : deepseek-reasoner , gemini-3.5-flash-lite   -> deriveStatus = validated
  orden DESPUES : gemini-3.5-flash-lite , deepseek-reasoner   -> deriveStatus = validated
  IGUALES: true
PERMUTADO EN DISCO
$ node scripts/run-validation-271.mjs ; echo $?
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (328/328 traducciones validated): PASS (328/328)
Milestone gate PASS.
0
```

El status derivado **no cambia**, y la permutación se escribió al disco (no se quedó en memoria) para
que además pasara por `VAL-09`, que compara el `status` escrito con el derivado. Restaurado:
`md5 1bf96ca69838dc17e445b68a2a274195`, `porcelain` vacío.

### Permutación B — las 7 entradas de `TRANSLATION_COVERAGE`

```
ORDEN ANTES  : preposiciones, partitivos, articoli, fare-indicativo, fare-congiuntivo, fare-indefiniti, fare-cond-imperativo
ORDEN DESPUES: fare-cond-imperativo, fare-indefiniti, fare-congiuntivo, fare-indicativo, articoli, partitivos, preposiciones
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (7 categorías declaradas cubiertas, 328 variantes)
  TRAD-COV (328/328 traducciones validated): PASS (328/328)
Milestone gate PASS.
0
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
# tests 66
# pass 66
# fail 0
0
```

`TOTAL_TRANSLATION_EXPECTED` **328 antes y 328 después**; el veredicto no cambia y el gate anti-ceguera
sigue verde (compara **conjuntos** de slugs, no secuencias). Restaurado:
`md5 38a26bc22de211120c0d2d25e7a42db9`.

### Permutación C — las 7 claves del ancla

```
ORDEN ANTES  : articoli, fare-cond-imperativo, fare-congiuntivo, fare-indefiniti, fare-indicativo, partitivos, preposiciones
ORDEN DESPUES: preposiciones, partitivos, fare-indicativo, fare-indefiniti, fare-congiuntivo, fare-cond-imperativo, articoli
$ node scripts/run-validation-271.mjs ; echo $?
  TRAD-COV (328/328 traducciones validated): PASS (328/328)
Milestone gate PASS.
0
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
# tests 66
# pass 66
# fail 0
0
```

El veredicto de ancla no cambia: `anclaViolaciones` recorre `Object.entries` y compara por clave, no por
posición. Restaurado: `md5 766704b793037f4c8c8c62e120f222d9`, `porcelain` vacío.

---

## Foto verde final del Task 1 — 2026-08-16T17:15:48Z

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (7 categorías declaradas cubiertas, 328 variantes)
  TRAD-COV (328/328 traducciones validated): PASS (328/328)
Milestone gate PASS.
0
$ node --test tests/count-arrays-lockstep.test.js tests/schema-translation.test.js ; echo $?
# tests 105
# pass 105
# fail 0
0
$ git diff --stat src/domain/ src/screens/app.js
(vacío)
$ grep -n 'CURRENT_SCHEMA_VERSION' src/data/storage.js
35:const CURRENT_SCHEMA_VERSION = 13;
$ node --test tests/*.test.js tests/fixtures/*.test.js
# tests 1360
# pass 1356
# fail 4          ← los 4 pre-existentes de tests/requirements-traceability.test.js, ni uno más
```

Los **4** son los mismos de siempre (`WINDOWS` id 17, deuda D-45-12): `la forma del documento sigue
donde este gate la busca`, `la cifra escrita en la linea de Coverage cuadra con el conteo real de
filas`, `cero DUPLICADOS en las dos mitades (WR-01)` y `trazabilidad de requisitos — la cobertura se
DERIVA del disco (DEUDA, D-45-12)`. **Cero regresiones nuevas.**

---

## Tabla resumen de las mutaciones de gate

| # | Qué se mutó | Exit code OBSERVADO | Gates en rojo | Sujeto NOMBRADO en el mensaje |
|---|---|---|---|---|
| **1a** | Quitada la entrada `fare-indicativo` de `TRANSLATION_COVERAGE` | **1** (gate) · **1** (reporter) | GATE-02 (`6 !== 7`), guard de integridad del escáner, ancla del reporter | `fare-indicativo` · 328 → **274** (Δ = 54) |
| **1b** | 1a **+** borrada la clave `fare-indicativo` del ancla | **1** (gate) · **0** (reporter, **PASS CIEGO 274/274**) | GATE-02, GATE-03, guard del escáner | `fare-indicativo` en los tres |
| **2** | Borrada `fare-congiuntivo-disparador#5` (validated) | **1** (reporter) | Ancla — rama «suelo incumplido» | `fare-congiuntivo`: ancla **30**, disco **29**, faltan **1** |
| **3a** | Quitadas las 17 `translationES` de `fare-cond-imperativo` | **1** (gate) | GATE-02 (dirección contraria), GATE-03 | `fare-cond-imperativo` |
| **3b** | 3a **+** quitada su entrada del array | **1** (reporter) · GATE-02 **VERDE** | Ancla — rama «ya no declarada cubierta», GATE-03 | `fare-cond-imperativo`, **17** variantes fuera del denominador |

**Ninguna resultó no discriminante.** Todas dieron rojo por la razón que se buscaba y por ninguna otra;
en las dos formas de la mutación 1 la cláusula de no-vacuidad se quedó VERDE, que es lo que separa «el
gate muerde» de «el gate está averiado»; y en 3b GATE-02 se puso verde **a propósito**, que es la
demostración del agujero que el ancla cubre.

| Permutación | Antes | Después | ¿Cambia? |
|---|---|---|---|
| **A** — `passes[]` de `fare-indicativo-presente#0` | `deriveStatus = validated` | `deriveStatus = validated` | **No** |
| **B** — 7 entradas de `TRANSLATION_COVERAGE` | `328`, `PASS (328/328)`, gate 66/66 | `328`, `PASS (328/328)`, gate 66/66 | **No** |
| **C** — 7 claves del ancla | `PASS (328/328)`, 0 violaciones | `PASS (328/328)`, 0 violaciones | **No** |
