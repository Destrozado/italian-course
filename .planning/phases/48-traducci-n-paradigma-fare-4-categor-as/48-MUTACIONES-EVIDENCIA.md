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

---
---

# TASK 2 — la mutación de acentos, las colisiones, los backstops y las dos deudas de herramienta

---

## MUTACIÓN 4 — un español validado pierde sus tildes → el QUÓRUM lo caza → `disputed` → TRAD-COV ROJO

**Dirección compuesta mutada: `fare-indicativo-passato-prossimo#1`.**

**Cómo se eligió, derivado del disco y no a ojo.** Se recorrieron las 122 traducciones del bloque
contando tildes: **28** llevan 2 o más y **5** llevan 3, que es el máximo del bloque. Se eligió esta de
entre las de 3 porque sus tres tildes pertenecen a **tres clases de regla distintas**, lo que hace la
mutación inequívoca por partida triple:

| | |
|---|---|
| `prompt` italiano | `Ieri tu hai fatto il letto e la stanza è ancora in ordine.` |
| Texto ORIGINAL | `Ayer hiciste la cama y la habitación todavía está ordenada.` |
| Texto MUTADO | `Ayer hiciste la cama y la habitacion todavia esta ordenada.` |
| Tilde 1 | `habitación` — **aguda terminada en -n** |
| Tilde 2 | `todavía` — **hiato con í tónica** |
| Tilde 3 | `está` — aguda en vocal Y **diacrítica** frente a `esta` (determinante), que es un par mínimo real |
| Longitud | **idéntica** (59 chars): el script aborta si cambia, para que la mutación sea *sólo* desacentuar |

Además se vació `validation.passes` a `[]` y el `status` a `pending`: los pases anteriores validaron el
texto **anterior**, y dejarlos habría sido un registro que miente sobre qué se validó. Los dos pases
retirados quedan transcritos por el propio script antes de tocar nada:

```
PASES PREVIOS (se vacian: validaron el texto ANTERIOR):
  deepseek-reasoner : correcta (2026-08-15)
  gemini-3.5-flash-lite : correcta (2026-08-15)
MUTADO: fare-indicativo-passato-prossimo#1  3 tildes -> 0, longitud 59 = 59
```

### Los dos veredictos REALES del quórum cross-vendor

Los dos jueces son los **declarados del bloque** (D-48-01): `deepseek-reasoner` + `gemini-3.5-flash-lite`.
`by` escrito == `by` pinneado en los dos: **cero auto-fallbacks**.

**Pase 1 — `deepseek-reasoner`, 2026-08-16T17:22:13Z**

```
$ node scripts/validate-translation-pass.mjs 'fare-indicativo-passato-prossimo#1' --model=deepseek-reasoner --write
- **S4 (ortografía y acentos RAE):** falla. Faltan tres tildes genuinas: `habitacion`, `todavia`,
         `esta`. Verificado carácter a carácter.
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tres tildes en el español: 'habitacion' debe ser 'habitación', 'todavia' debe ser 'todavía' y 'esta' debe ser 'está'"
  ]
}
✔ actualizado pase deepseek-reasoner → fare-indicativo-passato-prossimo#1.translationES (status: disputed)
```

**Pase 2 — `gemini-3.5-flash-lite`, 2026-08-16T17:22:41Z** (con `--avoid=deepseek-reasoner`)

```
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tildes obligatorias en el español: 'habitacion' debe ser 'habitación', 'todavia' debe ser 'todavía' y 'esta' debe ser 'está'"
  ]
}
✔ actualizado pase gemini-3.5-flash-lite → fare-indicativo-passato-prossimo#1.translationES (status: disputed)
```

**Los DOS vendors devolvieron `incorrecta` con el tag literal `[S4-acentos]`, cada uno nombrando las
TRES palabras exactas, y los dos con `s4_acentos: false` y los otros cuatro criterios en `true`** — el
rojo es **atribuible al acento y a nada más**. Ninguno aprovechó para objetar fidelidad, naturalidad ni
el italiano, y ninguno tocó el `hiciste` del sujeto (que es la colisión declarada del bloque).

**S4 muerde también sobre el bloque `fare` y con los jueces de este bloque.** El camino de hallazgo
bloqueante —los dos vendors aprobando el texto sin tildes— **NO se activó**, así que no hizo falta
reforzar `docs/TRANSLATION-VALIDATION-PROMPT.md`, el doc no cambió y no hay nada que re-validar bajo un
doc nuevo.

### `deriveStatus` EJECUTADO sobre los pases del disco — 2026-08-16T17:22:50Z

No se leyó el campo escrito: se corrió la función sobre el array del disco, que es lo que el criterio de
aceptación exige.

```
  status ESCRITO  : disputed
  status DERIVADO : disputed
  by de los pases : deepseek-reasoner:incorrecta, gemini-3.5-flash-lite:incorrecta
```

### El rojo OBSERVADO, y en el sub-gate CORRECTO

```
$ node scripts/run-validation-271.mjs ; echo $?
        → Traducciones disputed: fare-indicativo-passato-prossimo#1
  VAL-08 (cero disputed): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (328/328 traducciones validated): FAIL (327/328 — pending=0, missing=0, disputed=1)
        → Disputed: fare-indicativo-passato-prossimo#1
Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal:** `TRAD-COV (328/328 traducciones validated): FAIL (327/328 — pending=0, missing=0, disputed=1)`
- **Dirección compuesta nombrada dos veces**, en la tabla y bajo el sub-gate.

### CIERRE POR ESCRITO DEL HALLAZGO DEL LEDGER id 40 — tercera y última lectura

**`VAL-08` se quedó en `PASS`, y ESO ES CORRECTO.** No es un fallo del gate ni una mutación que no
muerde: es la expectativa la que estaba mal escrita, y **se copió de plan a plan durante dos fases
seguidas** (Phase 46 «Hallazgo 1», Phase 47 mutación 2). Este plan pidió el rojo donde le corresponde y
lo obtuvo a la primera.

**El porqué, leído en el código y confirmado por la corrida:** `val08Pass = totalDisputed === 0`, y
`totalDisputed` se reduce sobre `perCategory`, que es el bucle de **SLOTS**. VAL-08 es **por diseño** un
gate de nivel slot. Los `disputed` de nivel **traducción** viven en `perTranslationCategory` →
`totalTranslationDisputed`, y los consume **TRAD-COV**, que además es quien imprime la dirección
compuesta.

**No queda vía de escape**, que es lo que importa: una traducción `disputed` no es `validated`, así que
baja `totalTranslationValidated` por debajo de `TOTAL_TRANSLATION_EXPECTED` y TRAD-COV sale FAIL
necesariamente. La cobertura está completa; lo que sobraba era la expectativa.

**No se ensancha VAL-08 y se dice por qué**, para que la cuarta lectura no exista: ensancharlo cambiaría
la semántica de un sub-gate a final de fase, exigiría su propia mutación, y convertiría un cierre en un
cambio de gate sin verificar. **El ledger id 40 queda cerrado por escrito, no arreglado**, porque no hay
nada que arreglar.

### Restauración y CERO residuos — 2026-08-16T17:23:03Z

```
$ cp <copia-de-la-foto-verde> content/exercises/fare-indicativo.json
$ md5sum content/exercises/fare-indicativo.json
1bf96ca69838dc17e445b68a2a274195          ← idéntico a la foto verde
$ git status --porcelain content/
(vacío)
$ node -e '<recorre las 328 traducciones del disco>'
pases de traduccion: 664 | incorrecta vivos: 4 | con adjudicacion: 0
  incorrecta VIVA: articoli-lo-z#1 by=gemini-3.5-flash-lite date=2026-08-14
  incorrecta VIVA: fare-indicativo-passato-remoto#4 by=gemini-3.5-flash-lite date=2026-08-15
  incorrecta VIVA: partitivos-qualche#2 by=deepseek-chat date=2026-08-14
  incorrecta VIVA: partitivos-qualche#2 by=deepseek-reasoner date=2026-08-14
$ node -e '<lee la variante del disco>'
  Ayer hiciste la cama y la habitación todavía está ordenada.
  status: validated | deepseek-reasoner:correcta, gemini-3.5-flash-lite:correcta
$ node scripts/run-validation-271.mjs ; echo $?
  TRAD-COV (328/328 traducciones validated): PASS (328/328)
Milestone gate PASS.
0
```

**Los 4 `incorrecta` vivos son los CUATRO HISTÓRICOS**, todos de fechas anteriores a la mutación
(`2026-08-14` y `2026-08-15`) y todos con su entrada propia en el ledger (ids 35, 39, 44). **Cero pases
de la ventana de la mutación sobreviven**, cero campos `adjudicacion` en todo el corpus, y **los
overrides siguen en 8** (contados del disco: `grep -ro '"override": true' content/exercises/ | wc -l`
→ `8`). `disputed` de traducción en el corpus: **0**.

**Nota de método sobre esta comprobación, porque el primer intento fue una medida mala.** La primera
pasada buscó «pases con fecha 2026-08-16» y devolvió **136**, que asustaba y no significaba nada: son
los pases legítimos que el plan 48-04 escribió esa misma mañana. La medida buena es «`incorrecta` vivos»
más «`by` de la mutación», y da **0** de la mutación. Se deja escrito porque una comprobación de
residuos mal formulada da una cifra que parece un hallazgo y no lo es.

---

## LAS DOS DEUDAS DE HERRAMIENTA, ARREGLADAS Y VERIFICADAS CADA UNA CON SU PROPIA MUTACIÓN

Son las ids **43** y **45** del ledger, «misma familia: defectos de la tubería de escritura de pases, no
del contenido», con el cierre asignado explícitamente al plan 48-05.

### id 43 — la prosa de los modelos entraba al JSON sin sanear

**EL FALLO, REPRODUCIDO ANTES DE ESCRIBIR UNA LÍNEA DE ARREGLO — 2026-08-16T17:18:54Z.** Se escribió al
árbol real, con el escritor de verdad, un pase con un concern del tipo que los modelos producen a diario:

```
concerns: ['[S2-fidelidad] sustitucion sugerida: hacia -> yo hacia, y ademas el modelo escribe
            comillas tipograficas como en “hacia”']
✔ actualizado pase mutacion-48-05 → fare-indicativo-presente#0.translationES (status: validated)
$ node --test tests/content-fare-indicativo.test.js ; echo $?
not ok 1 - ningun string del fichero lleva corchetes angulares, entidades ni javascript:
        T-41-01: aparece > en el contenido
not ok 2 - ningun string lleva comillas tipograficas: apostrofes ASCII U+0027 (D-41-17)
        D-41-17: smart quotes en el contenido
# tests 93
# pass 91
# fail 2
1
```

**UN SOLO concern rompe DOS gates.** Y **el enunciado del ledger se queda corto**: nombra `<`, `>` y
`&#`, y las **comillas tipográficas** son un vector igual de real y **más probable**, porque los modelos
las escriben solos sin que nadie se las pida. El arreglo cubre las dos familias.

**EL ARREGLO:** `sanearParaCorpus()` — función pura, exportada — aplicada dentro de `applyPassToText`,
que es el **único** paso obligatorio hacia el disco (la CLI, los tests y cualquier llamador futuro pasan
por él; ponerlo en `run` habría dejado abierto el camino que los tests ya usan). Sustituciones que
**preservan el significado y no pierden un solo carácter**: `->`→`→`, `=>`→`⇒`, `<`→`‹`, `>`→`›`,
`&#`→`& #`, `javascript:`→`javascript :`, y las comillas tipográficas a ASCII, que es lo que D-41-17
pide del resto del corpus de todos modos.

**Por qué sanear y no rechazar:** rechazar obligaría a re-invocar —y el pase ya está PAGADO (WR-02)— y,
si el modelo insiste, se pierde un concern legítimo. Ensanchar el gate para que ignore los campos de
validación sería ablandar un invariante de seguridad (x-text-only, T-02-01) desde el plan de cierre. **Se
conforma el escritor, no el gate.**

**LA MUTACIÓN DEL ARREGLO** — porque un fix propuesto es una hipótesis, no evidencia:

| Estado | `node --test tests/translation-validator.test.js` |
|---|---|
| Con el arreglo | **65/65, exit 0** |
| `sanearParaCorpus` neutralizado a la identidad | **4 fallos, exit 1** — `las sustituciones preservan el significado…`, `NINGUNA marca prohibida sobrevive…`, `el saneo ocurre en applyPassToText…`, `el verdict, el by y la date NO los toca el saneo` |
| Restaurado por copia | **65/65, exit 0**, y `diff -q` contra la copia: **idéntico** |

**Y LA MUTACIÓN DE PUNTA A PUNTA, que es la que de verdad cierra el ítem** — 2026-08-16T17:21:37Z: se
volvió a escribir **exactamente el mismo concern** que había puesto los dos gates en rojo:

```
$ node --test tests/content-fare-indicativo.test.js ; echo $?
# tests 93
# pass 93
# fail 0
0
$ node -e '<lee el pase del disco>'
"concerns": [
  "[S2-fidelidad] sustitucion sugerida: hacia → yo hacia, y ademas el modelo escribe comillas
   tipograficas como en \"hacia\""
]
```

**Mismo concern, gate verde, y el significado intacto en disco.** Restaurado después:
`md5 1bf96ca69838dc17e445b68a2a274195`, `porcelain` vacío, **0 pases residuales de `mutacion-48-05`**
en el corpus.

**No-vacuidad del propio arreglo:** el bloque de tests **deriva del fichero del gate** la lista de marcas
prohibidas (lee `tests/content-fare-indicativo.test.js` y comprueba que sigue prohibiendo las cuatro
marcas y las comillas). Si mañana el gate añade una marca y el saneador no, ese test lo dice. Sin esa
cláusula, el bloque entero certificaría una lista transcrita a mano.

### id 45 — `--adjudicar` grababa el motivo aunque el modelo no se dejara adjudicar

**EL DEFECTO, tal como el ledger lo describe y con la consecuencia OBSERVADA en 48-02:** `--adjudicar`
sólo *permite* sobrescribir un `incorrecta` previo; **el veredicto escrito sigue siendo el que devuelve
el modelo**. Al adjudicar `fare-indicativo-passato-remoto#4`, el modelo volvió a decir `incorrecta`, y en
disco quedó un pase `incorrecta` **llevando colgada** una adjudicación que refuta su propio concern, con
el status todavía en `disputed`. **Ese registro se lee como adjudicado sin estarlo.**

**LA DECISIÓN (1) DEL LEDGER, TOMADA:** sí, `--adjudicar` debe **rechazar la escritura** cuando el
veredicto devuelto sigue siendo `incorrecta`. Implementado: el pase se **imprime** (está pagado y tiene
que ser recuperable, mismo idioma que WR-02), **no se toca el disco**, y el proceso sale con **exit 4**,
un código propio para que el gesto no se lea como éxito. El mensaje **nombra las tres salidas legítimas**
y dice explícitamente que re-invocar al mismo modelo no es una de ellas, porque es el dado que
`scripts/lib/pass-guard.mjs` existe para impedir.

**LA DECISIÓN (2) DEL LEDGER, RESPONDIDA SIN CONSTRUIR NADA:** «¿hace falta un camino explícito para
grabar una refutación sin depender de que el modelo coopere?» **Ya existe y es el override de autor de
primera clase** (`by: "autor"`, `override: true`, motivo escrito), que `deriveStatus` admite desde la
Phase 42 y que el corpus usa 8 veces. **No se construye un mecanismo nuevo**: se nombra el que hay, en el
propio mensaje de error, que es donde el autor lo va a necesitar. Añadir un segundo camino para lo mismo
habría multiplicado las formas de retirar un disenso, que es exactamente lo que CR-01 existe para
evitar.

**LA MUTACIÓN DEL ARREGLO:**

| Estado | `node --test tests/translation-validator.test.js` |
|---|---|
| Con el arreglo | **65/65, exit 0** |
| El guard desactivado (`if (false && …)`) | **1 fallo, exit 1** — `verdict incorrecta con --adjudicar: NO se escribe nada y el pase se devuelve marcado` |
| Restaurado por copia | **65/65, exit 0**, `diff -q`: **idéntico** |

Los tres tests del bloque cubren las tres ramas y **una de ellas es de no-regresión**: un `incorrecta`
**sin** `--adjudicar` se sigue escribiendo como siempre (el disenso se registra, que es lo que CR-01
protege), y una adjudicación que **sí** persuade al modelo sigue grabando su motivo. El arreglo no se
ha comido el caso normal. Y el test del rechazo comprueba que **se invocó UNA sola vez**: rechazar no
puede convertirse en re-tirar el dado.

---

## LAS COLISIONES ESPAÑOLAS DEL BLOQUE — derivadas del disco con un `Set`

### Nivel 1 — texto completo: la cifra es CERO

Recorrido de las 122 traducciones del bloque, normalizando **sólo espacios** (nunca acentos ni
mayúsculas: dos textos que difieran en una tilde NO son la misma traducción, PRES-05 / S4) y contando
con un `Set`:

```
TEXTOS DEL BLOQUE fare, derivados del disco: 122
  claves distintas en el Set: 122
  COLISIONES (textos - distintos): 0
  colisiones INTRA-SLOT (hermanas que comparten casilla): 0
```

**Y el corpus entero, como contexto:** 328 traducciones, 327 distintas, **1** colisión — y está **fuera
del bloque**: `preposiciones-col#0` ↔ `preposiciones-col#1`, las dos «Vivo con el abuelo.». Es del
piloto de la Phase 46 y no es sujeto de esta fase; queda dicha para que no aparezca como sorpresa.

### Nivel 2 — la forma verbal: donde la colisión declarada del bloque VIVE de verdad

**La cifra de nivel 1 no basta y decir sólo «0» sería engañoso.** La colisión `hiciste` que el bloque
declara **no es de frase entera** —las dos frases difieren— sino de **la forma española que renderiza el
target italiano**. Es la que el alumno ve, así que es la que hay que contar.

**Método, y sus límites dichos en voz alta.** Se extrae del disco, por variante: la forma italiana
correcta (`options[correctIndex]`) y la forma española de `hacer`. Se restringe a las variantes cuyo
**target italiano es una forma del paradigma de `fare`** —**98 de 122**— porque las otras 24 examinan un
modal, un participio concordado de otro verbo o un cruce de categoría, y su español coincide con otro
por razones ajenas al paradigma. Se descartan además los usos españoles que **no** renderizan el target:
el `hace`/`hacía` adverbial de tiempo (`Hace muchos años…`) y el matriz `hace/hacía falta`. **La primera
corrida, sin esos dos descartes, daba 20 grupos y 57 variantes: era una cifra inflada por el extractor,
y se dice porque la cifra inflada es la que habría acabado en el SUMMARY si nadie mira los resultados.**

**14 de las 98 no llevan forma española de `hacer`**: son las que el español rinde con *cometer*
(`cometen`, `cometían`, `cometí`, `han cometido`, `cometan`, `hayamos cometido`, `habían cometido`,
`cometas`, `haber cometido`, `cometiendo`, `cometeríamos`) y las dos de `haré`/`hará` que sí lo llevan.
No se silencian: se listan.

**LA CIFRA: 13 grupos, 33 variantes implicadas de las 98.**

| Forma española | Formas italianas que colapsan | Direcciones | Motivo lingüístico |
|---|---|---|---|
| `hiciste` | `facesti` / `hai fatto` | `fare-indicativo-passato-remoto#1` · `passato-prossimo#1` | **La colisión declarada del bloque.** El español peninsular excluye el perfecto compuesto con marco cerrado (`ayer`) y tiene UN pretérito simple donde el italiano parte remoto / prossimo |
| `hizo` | `fece` / `abbia fatto` / `fatti` | `passato-remoto#2` · `congiuntivo-passato#2` · `indefiniti-participio-passato#2` | Misma raíz que la anterior + la excepción `opcion-a` (el congiuntivo baja a indicativo) |
| `hicieron` | `fecero` / `abbiano fatto` | `passato-remoto#5` · `congiuntivo-passato#5` | Ídem |
| `había hecho` | `avevo fatto` / `aveva fatto` / `avessi fatto` / `avesse fatto` | `ind-trapassato-prossimo#0` y `#2` · `cong-trapassato#0` y `#2` | **Excepción `opcion-a` medida**: el español obliga indicativo tras `sapeva`/`sembrava`. Y **aquí se ve la deuda D-48-20 con los ojos**: las dos de congiuntivo escriben el pronombre (`yo había hecho`, `él había hecho`) y las dos de indicativo **no** |
| `habías hecho` | `avevi fatto` / `avessi fatto` | `ind-trapassato-prossimo#1` · `cong-trapassato#1` | Excepción `opcion-a` |
| `hacía` | `facevo` / `faceva` | `ind-imperfetto#0` · `ind-imperfetto#2` | **Sincretismo puro de 1ª/3ª singular**: son DOS de las 4 variantes de D-48-20 |
| `hace` | `fa` / `faccia` | `ind-presente#2` · `cong-presente#2` · `cong-disparador#0` y `#5` | Excepción `opcion-a`: el par de contraste `penso che faccia` ↔ `so che fa` **no sobrevive** |
| `haces` | `fai` / `faccia` | `ind-presente#1` · `cong-disparador#1` | Ídem (concesiva `benché`) |
| `haría` | `farei` / `farebbe` / `avrei fatto` / `avrebbe fatto` | `cond-presente#0` y `#2` · `cond-passato#0` y `#2` | **La clase que la QUINTA ENMIENDA absuelve** (condizionale composto = futuro del pasado) + sincretismo de 1ª/3ª |
| `harías` | `faresti` / `avresti fatto` | `cond-presente#1` · `cond-passato#1` | Ídem |
| `harían` | `farebbero` / `avrebbero fatto` | `cond-presente#5` · `cond-passato#5` | Ídem |
| `ha hecho` | `ha fatto` / `fatto` | `ind-passato-prossimo#2` · `indefiniti-participio-passato#1` | El participio concordado italiano no tiene reflejo español |
| `hemos hecho` | `abbiamo fatto` / `fatte` | `ind-passato-prossimo#3` · `indefiniti-participio-passato#3` | Ídem (`le abbiamo fatte`) |

**Ninguna se deduplica y ninguna se diferencia artificialmente.** Si el español las hace coincidir,
coinciden: la cifra es el resultado, no el problema. Y los motivos no son 13 sino **cinco familias**: el
pretérito único del español peninsular, la excepción `opcion-a` (ledger id 46), el sincretismo de 1ª/3ª
del singular (ledger ids 48 y 51), el condizionale composto como futuro del pasado (ledger id 50) y el
participio concordado. **Las cinco están ya declaradas y decididas por el autor**: esta cuenta no
descubre nada nuevo, las **mide**.

---

## LOS BACKSTOPS LONG-TEXT 21 y 22 — POR PRIMERA VEZ CON SUJETO

### Primero, el arnés VALIDADO contra el control externo

**Ninguna cifra nueva vale hasta que el arnés reproduce una cifra independiente publicada antes.** Es la
lección que la Phase 47 pagó: su primera corrida dio **414 px** y era falsa, porque `document.fonts.ready`
resuelve **antes** de que una `@font-face` que aún no se ha pedido llegue a cargarse, y se midió con la
fallback Georgia — **10 % de error justo en la magnitud que decide si el ítem se cierra**.

Arnés: página con la ancestría DOM real de las dos superficies, `styles.css` + `app.css` y las
`@font-face` de `vendor/fonts/`, conducida con Chrome headless (`--dump-dom`) a cinco anchos de viewport.
**Se fuerza `document.fonts.load('400 16px Spectral')` ANTES de medir** y se comprueba
`document.fonts.check(...)`: **`spectralCargada: true` en las cinco corridas**.

| Control externo | Publicado en | Medido ahora | ¿Cuadra? |
|---|---|---|---|
| `preposiciones-sugli#1`, 57 chars, superficie 1 | `WINDOWS` id 21 (Phase 46): **390 px** | **390 px** | **Sí, exacto** |
| `partitivos-dello-scons#0`, 65 chars, superficie 1 y 2 | `WINDOWS` id 21/22 (Phase 47): **462 px** | **462 px** | **Sí, exacto** |
| Caja más estrecha superficie 1 (viewport 700) | Phase 47: **656 px** | **656 px** | **Sí** |
| Caja más estrecha superficie 2 (viewport 700) | Phase 47: **622 px** | **622 px** | **Sí** |

**Cuatro cifras independientes reproducidas, dos de ellas de fases distintas.** El arnés es bueno porque
reproduce, no porque parezca razonable.

### La medida nueva — las dos traducciones más largas del bloque

Derivadas del disco (48-04 ya las dejó transcritas): `fare-indefiniti-300#0` y `#2`, **108 caracteres**
cada una, **43 más** que el sujeto de la Phase 47 y **20 por encima** del umbral de ~88 caracteres que la
Phase 47 predijo para la caja de 622 px.

| Texto | chars | viewport | S1 caja / texto / **líneas** | S2 caja / texto / **líneas** |
|---|---|---|---|---|
| `sugli#1` (control 46) | 57 | 1400→700 | 1096→656 / 390 / **1** | 1062→622 / 390 / **1** |
| `dello-scons#0` (control 47) | 65 | 1400→700 | 1096→656 / 462 / **1** | 1062→622 / 462 / **1** |
| **`fare-indefiniti-300#0`** | **108** | 1400 / 1100 / 900 | 765 / **1** | 765 / **1** |
| **`fare-indefiniti-300#0`** | **108** | **800** | 756 / 725 / **2** | 722 / 686 / **2** |
| **`fare-indefiniti-300#0`** | **108** | **700** | 656 / 651 / **2** | 622 / 609 / **2** |
| **`fare-indefiniti-300#2`** | **108** | **800** | 756 / 730 / **2** | 722 / 709 / **2** |
| **`fare-indefiniti-300#2`** | **108** | **700** | 656 / 619 / **2** | 622 / 619 / **2** |
| sintético (control positivo) | 147 | 900 / 800 / 700 | **2** | **2** (y **2** ya a 1100) |

**LA PREMISA TIENE SUJETO.** Dos traducciones **reales** del corpus, `validated` y committeadas, envuelven
en **2 líneas** en **las DOS superficies** a los dos anchos de escritorio más angostos. No es un
sintético: es contenido que el autor va a ver.

**La envoltura es LIMPIA, medido y no argumentado:** `desborda: false` en las 20 medidas;
`text-overflow: clip` y `overflow-wrap: normal` (envuelve por espacios, no parte palabras);
`max-width: none`; ninguna medida de texto excede su caja.

**Estilo computado, verificado en la corrida (viewport 700):**
`font-family: Spectral, Georgia, serif` · `font-size: 16px` · `font-weight: 400` · `line-height: 24px` ·
`max-width: none` · `overflow-wrap: normal` · `text-overflow: clip` · `margin 16px/16px` (S1) y
`8px/0px` (S2).

### Y no se solapa con el CTA — medido, que es la otra mitad del enunciado

El enunciado de la id 21 habla de la envoltura **entre la caja de feedback y el CTA**, así que no basta
con contar líneas: hay que comprobar que la segunda línea no invade el botón.

```
viewport 700: {"altoParrafo":48,"finParrafo":96,"inicioCta":112,"hueco":16,"solapa":false}
viewport 800: {"altoParrafo":48,"finParrafo":96,"inicioCta":112,"hueco":16,"solapa":false}
```

El párrafo de 2 líneas mide **48 px** (2 × 24 de `line-height`), y el hueco hasta el CTA sigue siendo
**exactamente los 16 px** que `.session-translation { margin: 16px 0 }` declara. **La envoltura EMPUJA
el CTA hacia abajo; no lo pisa.** `solapa: false`.

### El estado en el que salen los dos ítems

**LA MITAD MECÁNICA ESTÁ CERRADA CON EVIDENCIA MEDIDA, POR PRIMERA VEZ DESDE LA PHASE 46.** Dos fases de
abstención lo eran **por ausencia de sujeto**, y el sujeto ha aparecido en este bloque, exactamente donde
la Phase 47 predijo que aparecería.

**LA MITAD HUMANA LA CONFIRMA EL AUTOR EN LA TASK 3**, y hasta entonces los dos ítems **NO se cierran y
NO se reetiquetan como pasados**: se les añade la medida nueva, conservando su historia entera, y se
declara que la premisa ya tiene sujeto y que la envoltura mecánica es limpia. **Un aprobado del autor
sobre el render general tampoco los cerraría**: lo que los cierra es que el autor mire **esa** frase
envuelta en **esa** pantalla y diga que se ve bien. El plan lo pide por su nombre y el checkpoint lo
pregunta por su nombre.

### Ninguna residuo del arnés

El fichero de medición vivió en la raíz del repo (para que las rutas relativas a `styles.css`, `app.css`
y `vendor/fonts/` resolvieran como en la app real) y **se borró al terminar**:
`git status --porcelain` no lo ve, y el árbol queda con los dos ficheros de código del arreglo y nada más.
