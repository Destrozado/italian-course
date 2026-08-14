# Phase 47 · Plan 04 — Evidencia de las mutaciones de cierre

> **Contenido:** las **tres** mutaciones de cierre de la fase, ejecutadas sobre el bloque Artículos ya
> completo (110 traducciones, corpus 206). Las tres se EJECUTARON y en las tres se OBSERVÓ el rojo con
> su exit code apuntado y su línea literal transcrita de la corrida. **Ninguna se leyó.**

> **Este fichero NO es el SUMMARY del plan 04.** El plan 04 está **parcialmente ejecutado**: las Tasks
> 1 y 2 están hechas, y la **Task 3 (`checkpoint:human-verify`, `gate="blocking"`) está BLOQUEADA
> ESPERANDO AL AUTOR**. El SUMMARY se escribe cuando el autor cierre la Task 3, no antes: escribirlo
> ahora haría que el índice de planes leyera el plan como completo y se saltara el gate bloqueante.
> Es la misma disciplina que el fichero equivalente de la Phase 46.
>
> Existe porque el registro literal de los exit codes **es** la mitigación de T-47-22 (Repudiation:
> afirmar que el gate muerde sin haberlo observado). Si viviera solo en el contexto del ejecutor, se
> perdería al cerrarse la sesión y las mutaciones no contarían como ejecutadas.

- **Fecha de la corrida:** 2026-08-14
- **HEAD durante la corrida:** `829ee5c`
- **Ficheros mutados y restaurados:** `content/exercises/articoli.json` (mutaciones 1 y 2) ·
  `scripts/run-validation-271.mjs` (mutación 3, en sus dos formas)
- **md5 de la foto verde** — los tres, tomados ANTES de mutar nada:

| Fichero | md5 |
|---|---|
| `content/exercises/articoli.json` | `93625e94c8baaac24937b78956a72a0f` |
| `content/exercises/partitivos.json` | `39e7cac5531597d81c6bc23228cc400d` |
| `scripts/run-validation-271.mjs` | `37ae18c84377d8f4173b8ac0534323a7` |

**Método de restauración:** copia de fichero (`cp` desde la copia de la foto verde), **fichero a
fichero**, nunca `git checkout` / `git stash` / `git clean`. Es el idioma que la Phase 46 fijó
deliberadamente para no arrastrar pérdidas colaterales, y la prohibición explícita del plan 47-04. La
igualdad del md5 tras cada restauración es la prueba de que fue exacta, no aproximada.

**`content/exercises/partitivos.json` NO se mutó.** Su md5 está en la tabla porque forma parte de la
foto verde de partida y porque su intactidad es criterio de aceptación; las dos mutaciones de contenido
cayeron las dos sobre `articoli.json`, y se dice en lugar de dejarlo suponer.

---

## Foto verde de partida — 2026-08-14T17:45:39Z

```
$ git status --porcelain
?? .planning/research/.cache/          ← untracked, ajeno a la fase; ningún fichero rastreado modificado
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 62         | 0         | 0        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?     # 2026-08-14T17:45:43Z
# tests 64
# suites 15
# pass 64
# fail 0
0
```

**Los dos exit codes de partida son 0.** Sin esta foto ningún rojo de abajo sería atribuible a su
mutación — es la `<precondition>` del Task 1, verificada y no asumida.

---

## MUTACIÓN 1 — una sola traducción sin validar deja el gate de cobertura ROJO

**Dirección compuesta mutada: `articoli-il-cons#0`**

Estado antes (íntegro, impreso por el propio script de mutación antes de tocar nada):

```json
{
  "text": "Leo el libro en el jardín.",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "gemini-3.5-flash-lite", "date": "2026-08-14", "verdict": "correcta", "concerns": [] },
      { "by": "deepseek-reasoner",     "date": "2026-08-14", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

La mutación vació `validation.passes` a `[]` y dejó `validation.status` en `"pending"`. **El texto de la
traducción NO se tocó** —el script aborta si lo detecta cambiado—: esta mutación prueba el **umbral de
cobertura**, no la calidad. `git diff --stat` de la mutación:
`1 file changed, 2 insertions(+), 15 deletions(-)`.

El script de mutación aborta si el slot no existe, si la variante no tiene `translationES.validation`,
si los `passes` ya estaban vacíos, o si el fichero resultante es idéntico al de partida. **Una mutación
que no muta y sale verde sería el peor resultado posible**, así que no puede pasar en silencio.

### El rojo OBSERVADO — 2026-08-14T17:46:14Z

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 61         | 0         | 1        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal del sub-gate:**
  `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)`
- Las dos cifras difieren en **exactamente una unidad** (205 vs 206) y las dos las **interpola el
  reporter** desde valores computados (`totalTranslationValidated` y `TOTAL_TRANSLATION_EXPECTED`, este
  último Σ de los `expected` que `mcVariantCountOf` deriva de cada fichero). **Ninguna la transcribió el
  ejecutor.**
- `pending=1` nombra exactamente la magnitud mutada, y la fila de `articoli` la localiza en su categoría
  (`62 | 61 | 0 | 1 | 0`).
- **UNA sola traducción no `validated` entre las 110 del bloque —206 del corpus— pone el gate rojo. No
  se promedia ni se tolera un umbral:** el veredicto es igualdad de enteros
  (`totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED`).

### El otro lado del umbral — verde restaurado, 2026-08-14T17:46:19Z

```
$ cp <copia-de-la-foto-verde> content/exercises/articoli.json
$ md5sum content/exercises/articoli.json
93625e94c8baaac24937b78956a72a0f          ← idéntico a la foto verde: restauración byte a byte
$ git status --porcelain content/exercises/articoli.json
(vacío)
$ node scripts/run-validation-271.mjs ; echo $?
articoli                 | 62       | 62         | 0         | 0        | 0
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

**Los DOS lados del umbral quedan ejecutados: 205/206 → ROJO, 206/206 → VERDE.**

---

## MUTACIÓN 2 — texto sin tildes → el QUÓRUM lo caza → `disputed` → gate ROJO

**Dirección compuesta mutada: `articoli-gli-ps#0`.**

**Cómo se eligió, y por qué no hay ninguna de 3 tildes.** El corpus del bloque se recorrió entero
contando tildes por traducción: **ninguna de las 110 llega a 3**, y **15** llevan exactamente 2 (9 en
`articoli`, 6 en `partitivos`). Se eligió esta de entre las de 2 porque sus dos tildes pertenecen a
**clases de regla distintas**, lo que hace la mutación inequívoca por partida doble:

| | |
|---|---|
| `prompt` italiano | `Al convegno parlano gli psicologi più noti.` |
| Respuesta correcta | `gli` |
| Texto ORIGINAL | `En el congreso hablan los psicólogos más conocidos.` |
| Texto MUTADO | `En el congreso hablan los psicologos mas conocidos.` |
| Tildes quitadas | `ó` (esdrújula: `psicólogos`) y `á` (**tilde diacrítica**: `más` adverbio vs. `mas` conjunción adversativa). 2 → 0. |
| Longitud | **idéntica** (51 chars): el script aborta si cambia, para que la mutación sea *solo* desacentuar |

Además se vació `validation.passes` a `[]`: los pases anteriores validaron el texto **anterior**, y
dejarlos habría sido un registro que miente sobre qué se validó. `git diff --stat`:
`1 file changed, 3 insertions(+), 16 deletions(-)`.

**La autoridad sobre acentos es el QUÓRUM (criterio S4), no un escáner mecánico de tildes.** No se creó
ninguno: el diff de esta mutación **no toca `scripts/` ni `tests/` ni `docs/`** —verificado con
`git status --porcelain scripts/ tests/ docs/` → **vacío**, transcrito abajo—. Inventarlo habría sido
re-litigar D-46-12/TRAD-01-encoding, que lo descartó a propósito por falsos positivos sobre nombres
propios y monosílabos.

### Los dos veredictos REALES del quórum cross-vendor

Dos invocaciones, una por vendor, con `--avoid` para garantizar `by` distintos. Los dos jueces son los
**mismos que gobiernan `articoli` en disco**, incluido el `deepseek-reasoner` del cambio de juez de
mitad de corpus (`WINDOWS` id 38): la mutación se juzga con el tribunal real de la categoría, no con uno
más blando ni más severo.

**Pase 1 — `deepseek-reasoner`, 2026-08-14T17:47:05Z** (pinneado `deepseek-reasoner`, respondió
`deepseek-reasoner` — **sin fallback**, el `by` escrito es el pinneado)

```
$ node scripts/validate-translation-pass.mjs 'articoli-gli-ps#0' --model=deepseek-reasoner --write
- **S4:** Faltan dos tildes obligatorias: `psicologos` debe ser `psicólogos` y `mas` debe ser `más`.
         Por tanto, S4 es `false`.
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan dos tildes en el español: 'psicologos' debe ser 'psicólogos' y 'mas' debe ser 'más'"
  ]
}
✔ actualizado pase deepseek-reasoner → articoli-gli-ps#0.translationES (status: disputed)
```

**Pase 2 — `gemini-3.5-flash-lite`, 2026-08-14T17:47:35Z** (pinneado `gemini-3.5-flash-lite`, respondió
`gemini-3.5-flash-lite` — **el fallback declarado no llegó a usarse**; se nombran los dos, el pinneado y
el que respondió, porque en esta fase hubo 4 auto-fallbacks reales y no se puede dar por supuesto)

```
$ node scripts/validate-translation-pass.mjs 'articoli-gli-ps#0' \
    --model=gemini-3.5-flash-lite \
    --fallback=gemini-3.5-flash,gemini-2.5-flash \
    --avoid=deepseek-reasoner --write
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tildes obligatorias en el español: 'psicologos' debe ser 'psicólogos' y 'mas' debe ser 'más'"
  ]
}
✔ actualizado pase gemini-3.5-flash-lite → articoli-gli-ps#0.translationES (status: disputed)
```

**Los DOS vendors devolvieron `incorrecta` con el tag literal `[S4-acentos]`, cada uno nombrando las dos
tildes exactas y los dos con `s4_acentos: false` y los otros cuatro criterios en `true`** — o sea, el
rojo es **atribuible al acento y a nada más**: ninguno de los dos aprovechó para objetar fidelidad,
naturalidad ni el italiano.

**S4 MUERDE sobre este bloque, y con el juez nuevo.** El camino del punto 5 del plan —los dos vendors
aprobando el texto sin tildes, que sería un HALLAZGO BLOQUEANTE— **NO se activó**. Por tanto **no hizo
falta reforzar `docs/TRANSLATION-VALIDATION-PROMPT.md`**, el prompt no cambió, y **no hay nada que
re-validar bajo un prompt nuevo**. Es también la confirmación de que el cambio de juez de la id 38 no
ablandó el criterio de acentos: `deepseek-reasoner` lo aplica igual de estricto que `deepseek-chat` en la
Phase 46.

### El rojo OBSERVADO — 2026-08-14T17:47:44Z

`deriveStatus(passes)` con dos `incorrecta` y cero override → `disputed` (sticky, D-VAL-07). El `status`
escrito en disco quedó también en `disputed`, así que **VAL-09 siguió en PASS**: no hubo desincronía y el
rojo no viene de un registro incoherente.

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 61         | 1         | 0        | 0
        → Traducciones disputed: articoli-gli-ps#0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=0, missing=0, disputed=1)
        → Disputed: articoli-gli-ps#0

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal:**
  `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=0, missing=0, disputed=1)`
- **Dirección compuesta nombrada, dos veces:** `→ Traducciones disputed: articoli-gli-ps#0` (en la tabla)
  y `→ Disputed: articoli-gli-ps#0` (bajo el sub-gate).
- La cadena completa quedó ejecutada de punta a punta:
  **texto sin tildes → quórum `incorrecta` con `[S4-acentos]` → `deriveStatus` = `disputed` → reporter
  exit 1.** Sin escáner mecánico en ninguno de los eslabones.

### Sobre `VAL-08`: el criterio de aceptación del plan nombra el sub-gate equivocado — y es el MISMO hallazgo de la Phase 46, reproducido

El criterio del plan 47-04 pide, para la mutación 2, «la línea del sub-gate de cero `disputed` **también
en FAIL**». **`VAL-08` se quedó en `PASS`**, exactamente igual que en la Phase 46 (allí quedó anotado
como «Hallazgo 1»). **No es que el gate no muerda: es que el criterio espera el rojo en el sub-gate que
no le corresponde.**

Leído en `scripts/run-validation-271.mjs`: `val08Pass = totalDisputed === 0`, y `totalDisputed` se reduce
sobre `perCategory` —el bucle de **SLOTS**—. VAL-08 es, por diseño, un gate de nivel slot. Los
`disputed` de nivel **traducción** viven en `perTranslationCategory` → `totalTranslationDisputed`, y los
consume **TRAD-COV**, que es quien los imprime y quien nombra la dirección compuesta.

**No queda ninguna vía de escape**, que es lo que importa: una traducción `disputed` no es `validated`,
así que baja `totalTranslationValidated` por debajo de `TOTAL_TRANSLATION_EXPECTED` y TRAD-COV sale FAIL
necesariamente. La cobertura está completa; lo que sobra es la expectativa escrita en el criterio.

**No se tocó el gate**, y aquí la regla de la casa es doblemente aplicable: ensanchar VAL-08 para
incluir los `disputed` de traducción cambiaría la semántica de un sub-gate a final de fase, sin mandato,
y —lo decisivo— **habría que verificar ese cambio con la misma mutación que verifica el código que
arregla**, lo que convertiría un cierre de fase en un cambio de gate sin verificar. Se deja **anotado
para el autor**, no arreglado en silencio. Que el hallazgo se reproduzca idéntico dos fases seguidas es
en sí mismo el dato: **el criterio se copió de plan a plan sin corregirse**, y esta es la segunda vez que
se paga leerlo.

### Verde restaurado — 2026-08-14T17:47:54Z

```
$ git status --porcelain scripts/ tests/ docs/          # T-47-23
(vacío)                                                 ← ningún escáner de acentos inventado
$ cp <copia-de-la-foto-verde> content/exercises/articoli.json
$ md5sum content/exercises/articoli.json
93625e94c8baaac24937b78956a72a0f                        ← idéntico a la foto verde
$ git status --porcelain content/exercises/articoli.json
(vacío)
$ node -e '<lee la variante del disco>'
"En el congreso hablan los psicólogos más conocidos." | status: validated |
  passes: gemini-3.5-flash-lite:correcta, deepseek-reasoner:correcta
$ node scripts/run-validation-271.mjs ; echo $?
articoli                 | 62       | 62         | 0         | 0        | 0
  VAL-08 (cero disputed): PASS
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

La restauración se comprueba en **tres** planos, no en uno: el md5 (byte a byte), el `porcelain` (git no
ve nada) y la **lectura del dato concreto** (el texto acentuado y sus dos pases `correcta` de vuelta). Un
md5 igual con un texto distinto es imposible, pero el tercer plano es el que se lee sin saber eso.

### Suite tras las mutaciones 1 y 2 restauradas — 2026-08-14T17:48:06Z

```
$ node --test tests/*.test.js tests/fixtures/*.test.js
# tests 1343
# suites 229
# pass 1339
# fail 4
```

Los **4** son los **mismos 4 pre-existentes** de `tests/requirements-traceability.test.js` (`WINDOWS`
id 17, deuda D-45-12), el mismo `not ok 142 - trazabilidad de requisitos — la cobertura se DERIVA del
disco (DEUDA, D-45-12)` y las **mismas cifras exactas** que la línea base del plan 47-03 (1343 / 1339 /
4). **Cero regresiones nuevas.** La suite **no** sale en exit 0 y **no debe salirlo**: arreglar la
trazabilidad aquí sería editar un gate sin correr su mutación, que es justo lo que esta fase existe para
no hacer.

---

## MUTACIÓN 3 — desenganchar las categorías pone ROJO el gate anti-ceguera

Es la mutación que el **Success Criterion 3 del ROADMAP** exige por su nombre: *«desengancharlas pone
ROJO el gate anti-ceguera, **verificado corriendo la mutación al cerrar la fase**»*. Se ejecuta en sus
**dos formas** —quitar UNA entrada y quitar LAS DOS— porque el mensaje del gate distingue entre «falta
una entrada» y «el extractor dejó de ver el array», y una mutación que quite las dos podría enmascarar
la segunda causa.

**Fichero mutado:** `scripts/run-validation-271.mjs` (la región de `TRANSLATION_COVERAGE`).
**El contenido traducido NO se toca:** las 110 traducciones siguen en disco, íntegras y `validated`
durante toda la mutación. Eso es lo que hace de esto una prueba de **ceguera** y no de ausencia.

La entrada se **QUITA**, no se comenta ni se deforma: el script de mutación localiza la apertura
`const TRANSLATION_COVERAGE = [` y su `];`, elimina la línea entera de la entrada nombrada, y **aborta**
si no encuentra la apertura, si no encuentra el cierre, si alguna de las entradas pedidas no aparece, o
si el fichero resultante es idéntico al de partida. Comentarla habría probado otra cosa (los goldens de
`sinComentarios` ya cubren el `//` y el `/* */`); lo que aquí se quiere es la entrada **ausente**.

### Foto verde de partida — 2026-08-14T17:50:12Z

```
$ git status --porcelain
?? .planning/research/.cache/          ← untracked ajeno; ningún fichero rastreado modificado
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
# tests 64
# pass 64
# fail 0
0
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

---

### MUTACIÓN 3a — desenganchar UNA (Articoli)

`git diff --stat`: `1 file changed, 1 deletion(-)`. El array queda con **2** entradas
(`preposiciones`, `partitivos`) y las 62 traducciones de `articoli` siguen intactas en disco.

#### El rojo OBSERVADO — 2026-08-14T17:50:30Z

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
    not ok 2 - las lineas de entrada del array de cobertura de TRADUCCION tambien sobreviven byte a byte (D-46-17)
not ok 5 - integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)
    not ok 1 - scripts/run-validation-271.mjs: ninguna categoria con traduccion en disco queda fuera del array de cobertura de traduccion
not ok 7 - GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)
# tests 64
# pass 62
# fail 2
1
```

- **Exit code observado: `1`** (distinto de 0, que es lo que el plan pide).
- **Mensaje literal de GATE-02**, transcrito de la corrida:

  > `D-46-17: el extractor ve 2 pares en la region de `TRANSLATION_COVERAGE` de
  > scripts/run-validation-271.mjs y el disco declara 3 categorias cubiertas de traduccion (articoli,
  > partitivos, preposiciones). Las dos causas son reales: o el reporter dejo de declarar una entrada
  > —y entonces la ceguera ya existe, y quedarian CIEGAS: **articoli**—, o el extractor dejo de ver su
  > array (una entrada partida en dos lineas, un slug detras del file, la declaracion renombrada). Con
  > lista vacia esta comprobacion pasaria en verde`
  >
  > `2 !== 3`

  **Articoli queda nombrada como categoría con traducciones en disco no enganchada**, que es
  literalmente lo que el criterio de aceptación pide.

#### QUÉ aserción mordió — la atribución, que es lo que distingue «el gate muerde» de «el gate está averiado»

| Aserción | Fichero:línea | ¿Mordió? | Qué significaría |
|---|---|---|---|
| **Cláusula de no-vacuidad** `declaradas.length > 0` | `count-arrays-lockstep.test.js:1367` | **NO — siguió VERDE** | Si hubiera mordido, el diagnóstico sería *avería del gate*: el recorrido del disco habría dejado de reconocer `translationES` |
| **Igualdad pares ↔ declaradas** (`2 !== 3`) | `:1374` (lanza en `:1374:12`) | **SÍ ← es la que mordió** | El disco declara 3 cubiertas y la región del array declara 2: **la ceguera es real y medida** |
| Lista de ciegas `deepEqual(ciegas, [])` | `:1385` | no llegó a evaluarse | La igualdad de arriba lanza antes; su **mensaje ya nombra a `articoli` como ciega**, así que la atribución no se pierde |
| Pares cruzados | `:1393` | no llegó a evaluarse | — |
| **Guard de integridad del escáner** (`ve 2 lineas … y el disco declara 3`) | `:1021` / lanza en `:1033:12` | **SÍ — segunda aserción independiente** | Vigila lo mismo por otro camino (líneas de entrada frente a categorías cubiertas): dos gates independientes cazan el desenganche |

**Que la cláusula de no-vacuidad se quedara VERDE es la mitad importante del resultado.** Significa que
el extractor **sí** encontró la región, **sí** leyó el disco y **sí** contó bien; el rojo viene del
**hecho medido** (falta una entrada) y no de un reconocedor que dejó de casar. Un rojo por no-vacuidad
habría sido un rojo inútil.

#### Y el reporter, mientras tanto, emite un PASS CIEGO — 2026-08-14T17:50:42Z

Esta es la razón de ser del gate, observada en vivo y no argumentada:

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (2 categorías declaradas cubiertas, 144 variantes)
preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
  TRAD-COV (144/144 traducciones validated): PASS (144/144)
Milestone gate PASS.
0
```

**El reporter sale en `exit 0` con `Milestone gate PASS` mientras 62 traducciones validadas están en
disco sin contarse.** `206` se convirtió en `144` y nada se puso rojo: el total encogió en silencio y el
gate de cierre certificó una cobertura que ignora una categoría entera. **Es el `225/225 PASS` de las
Phases 41/42/43 trasladado a las variantes, reproducido literalmente.** Sin el gate anti-ceguera esta
mutación es indetectable — y es exactamente el bug que corrió tres fases seguidas.

---

### MUTACIÓN 3b — desenganchar LAS DOS (Articoli y Partitivos)

Restaurada antes 3a (`md5 37ae18c84377d8f4173b8ac0534323a7`, `porcelain` vacío) y vuelta a mutar.
`git diff --stat`: `1 file changed, 2 deletions(-)`. El array queda con **1** entrada
(`preposiciones`) y las 110 traducciones del bloque siguen intactas en disco.

#### El rojo OBSERVADO — 2026-08-14T17:50:57Z

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
    not ok 2 - las lineas de entrada del array de cobertura de TRADUCCION tambien sobreviven byte a byte (D-46-17)
not ok 5 - integridad del escaner — ninguna linea de entrada de array de conteo es alterada por sinComentarios (DEUDA-02)
    not ok 1 - scripts/run-validation-271.mjs: ninguna categoria con traduccion en disco queda fuera del array de cobertura de traduccion
not ok 7 - GATE-02 — el array de cobertura de traduccion del reporter engancha cada categoria DECLARADA CUBIERTA (D-46-17)
# tests 64
# pass 62
# fail 2
1
```

- **Exit code observado: `1`.**
- **Mensaje literal de GATE-02**, con **las DOS categorías nombradas**:

  > `D-46-17: el extractor ve 1 pares en la region de `TRANSLATION_COVERAGE` de
  > scripts/run-validation-271.mjs y el disco declara 3 categorias cubiertas de traduccion (articoli,
  > partitivos, preposiciones). Las dos causas son reales: o el reporter dejo de declarar una entrada
  > —y entonces la ceguera ya existe, y quedarian CIEGAS: **articoli, partitivos**—, o el extractor dejo
  > de ver su array (…). Con lista vacia esta comprobacion pasaria en verde`
  >
  > `1 !== 3`

- **Mensaje literal del guard de integridad del escáner:**

  > `D-46-17 / DEUDA-02: el reconocimiento de lineas de entrada ve 1 lineas en la region de
  > `TRANSLATION_COVERAGE` de scripts/run-validation-271.mjs y el disco declara 3 categorias cubiertas:
  > o el reporter dejo de declararlas, o el acotado por region dejo de encontrar el array — y con cero
  > lineas la comprobacion de abajo pasaria en verde sin haber mirado ninguna`

#### Atribución

**La misma aserción mordió, y la cláusula de no-vacuidad volvió a quedarse VERDE.** Es justo lo que la
segunda forma existe para comprobar: quitar las dos entradas **no** enmascara la segunda causa. Si el
rojo hubiera migrado a la no-vacuidad, el gate estaría diagnosticando «el extractor dejó de ver el
array» cuando el hecho es «faltan dos entradas», y el mensaje mentiría. No migró.

#### El PASS CIEGO de 3b

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (1 categoría declarada cubierta, 96 variantes)
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
Milestone gate PASS.
0
```

**`PASS (96/96)` — el bloque Artículos entero, 110 traducciones, desaparecido del total sin un solo
rojo.** El reporter vuelve exactamente a la cifra del piloto de la Phase 46 como si esta fase no
hubiera existido.

### Verde restaurado — 2026-08-14T17:51:13Z

```
$ cp <copia-de-la-foto-verde> scripts/run-validation-271.mjs
$ md5sum scripts/run-validation-271.mjs
37ae18c84377d8f4173b8ac0534323a7                     ← idéntico a la foto verde
$ git status --porcelain scripts/run-validation-271.mjs
(vacío)
$ sed -n '407,411p' scripts/run-validation-271.mjs
const TRANSLATION_COVERAGE = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: mcVariantCountOf('content/exercises/preposiciones.json') },
  { slug: 'partitivos',               file: 'content/exercises/partitivos.json',               expected: mcVariantCountOf('content/exercises/partitivos.json') },
  { slug: 'articoli',                 file: 'content/exercises/articoli.json',                 expected: mcVariantCountOf('content/exercises/articoli.json') },
];
$ node --test tests/count-arrays-lockstep.test.js ; echo $?
# tests 64
# pass 64
# fail 0
0
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

La restauración se verifica en **cuatro** planos: md5 byte a byte, `porcelain` vacío, **las tres
entradas leídas del fichero con su forma load-bearing intacta** (`slug` delante, `slug` y `file` en la
misma línea, `expected` derivado por `mcVariantCountOf`) y los **dos** gates en verde. El tercer plano
es el que cubre T-47-24: una entrada restaurada con la **forma rota** daría verde en el reporter y ciego
en el gate, así que hay que mirar las dos cosas y no solo el exit code del reporter.

---

## Tabla resumen de las tres mutaciones

| # | Qué se mutó | Exit code OBSERVADO | Aserciones en rojo | Atribución |
|---|---|---|---|---|
| **1** | `articoli-il-cons#0` → `passes: []`, `status: pending` (texto intacto) | **1** (reporter) | `TRAD-COV` | Umbral de cobertura: `205 !== 206`, `pending=1` |
| **2** | `articoli-gli-ps#0` → texto desacentuado + `passes: []` | **1** (reporter) | `TRAD-COV`, nombrando `articoli-gli-ps#0` | Quórum `[S4-acentos]` en los DOS vendors → `disputed` → `205 !== 206` |
| **3a** | Quitada la entrada `articoli` de `TRANSLATION_COVERAGE` | **1** (gate) · reporter en **0 con PASS CIEGO 144/144** | GATE-02 (`2 !== 3`) + guard de integridad del escáner | **Lista de ciegas** (`articoli`), NO la no-vacuidad |
| **3b** | Quitadas `articoli` **y** `partitivos` | **1** (gate) · reporter en **0 con PASS CIEGO 96/96** | GATE-02 (`1 !== 3`) + guard de integridad del escáner | **Lista de ciegas** (`articoli, partitivos`), NO la no-vacuidad |

**Ninguna de las tres resultó no discriminante.** Las cuatro corridas dieron rojo por la razón que se
buscaba y por ninguna otra, y en las dos del gate la cláusula de no-vacuidad se quedó verde, que es lo
que separa «el gate muerde» de «el gate está averiado». Si alguna hubiera salido verde por una razón
legítima, o su rojo lo hubiera producido también el código anterior, se declararía **no discriminante**
y no se presentaría como prueba de nada — que es lo que la Phase 46 hizo con la suya.

---

## Medición del texto más largo del bloque — derivado del disco, MEDIDO, no supuesto

Prepara los backstops heredados `WINDOWS` **21** y **22** (E1 y E2 · long-text), que la Phase 46 dejó
**ABSTENIDOS por ausencia de sujeto** y arrastró a las Phases 47-53. **Esta medición NO los cierra:**
es preparación para el ojo del autor, igual que la de la Phase 46.

### Lo derivado del disco (no elegido a ojo)

Recorrido de las 110 traducciones del bloque, ordenadas por longitud:

| # | Dirección compuesta | chars | Texto |
|---|---|---|---|
| **1** | **`partitivos-dello-scons#0`** | **65** | `Para hacer deporte también hace falta algo de espíritu de equipo.` |
| 2 | `articoli-lo-gn#1` | 58 | `En el restaurante he pedido el ñoqui de patata más grande.` |
| 3 | `partitivos-degli-z#1` | 53 | `Para la excursión hacen falta unas mochilas robustas.` |
| — | *(referencia Phase 46)* `preposiciones-sugli#1` | 57 | `Las fotos están sobre los estantes, encima de los libros.` |

**La más larga del bloque supera a la del piloto en 8 caracteres (65 vs 57).**

### Lo medido — Chrome headless sobre el CSS real y las fuentes reales

Ancestría DOM real de las dos superficies (`main > div > article.session > div > p.session-translation`
y `main > div > article > section.summary-errors > ul > li > div > p.summary-error-translation`), con
`styles.css` + `app.css` y las `@font-face` de `vendor/fonts/`.

| Nodo | chars | ancho de caja | **ancho del texto** | **líneas** | ¿desborda? | ¿truncado? |
|---|---|---|---|---|---|---|
| `.session-translation` (`partitivos-dello-scons#0`) | 65 | 1096 → 656 px | **462 px** | **1** | no | no |
| `.summary-error-translation` (`partitivos-dello-scons#0`) | 65 | 1062 → 622 px | **462 px** | **1** | no | no |
| `.session-translation` (`articoli-lo-gn#1`) | 58 | 1096 → 656 px | 418 px | **1** | no | no |
| `.session-translation` (**piloto 46**, `sugli#1`) | 57 | 1096 → 656 px | **390 px** | **1** | no | no |
| `.session-translation` (**sintético** 165 chars) | 165 | 1096 → 656 px | 944 → 485 px | **2 → 4** | no | no |
| `.summary-error-translation` (**sintético** 165 chars) | 165 | 1062 → 622 px | 944 → 485 px | **2 → 4** | no | no |

Medido a viewport **1400 / 1100 / 900 / 800 / 700 px**: `lineas: 1` en **los cinco** y en **las dos**
superficies. La caja más estrecha de todas es la de la superficie 2 a 700 px de viewport, **622 px** —el
ancho más angosto antes de que entre la capa móvil `@media (max-width: 640px)`, fuera de scope—, y
**462 px no envuelven dentro de 622 px**.

Estilo computado, verificado en la corrida: `font-family: Spectral, Georgia, serif` · `font-size: 16px`
· `font-weight: 400` · `max-width: none` · `overflow-wrap: normal` · `text-overflow: clip` ·
`margin 16px/16px` (superficie 1) y `8px/0px` (superficie 2). El **control positivo** de 165 caracteres
envuelve limpiamente en las dos superficies, por espacios, con **cero desborde** y **cero truncado**: la
mitad mecánica del enunciado está probada; lo que falta es el sujeto real.

### El error de medición que casi se certifica, y cómo se cazó

La **primera** corrida midió **414 px** para la frase de 65 caracteres, y era **falso**. `document.fonts.
ready` resuelve **antes** de que una `@font-face` que aún no se ha pedido se cargue, así que la medición
se hizo con la fallback **Georgia** y no con **Spectral**: 414 px en vez de 462 px, un **10 % de error**
en la magnitud que decide si el ítem se cierra o se abstiene.

Se cazó con un **control externo**: el arnés mide el texto del piloto de la Phase 46 (57 chars), cuyo
ancho está publicado en `46-05-MUTACIONES-EVIDENCIA.md` como **390 px**. Con la fallback el arnés daba
352 px —**no cuadraba**— y con `document.fonts.load('400 16px Spectral', …)` forzado antes de medir da
**390 px exactos**. El arnés no se declaró bueno porque pareciera razonable, sino porque **reprodujo una
cifra independiente publicada tres días antes**. Sin ese control, la tabla de arriba llevaría 414 px y
nadie lo habría notado.

### Consecuencia para los backstops 21 y 22

**La premisa de los dos enunciados —«una traducción que envuelve en 2+ líneas»— SIGUE SIN SUJETO en el
bloque Artículos.** La frase más larga de las 110 cabe en una línea en las dos superficies y a los cinco
anchos de escritorio.

**Los dos ítems siguen ABSTENIDOS y se arrastran a las Phases 48-53**, con la medida nueva escrita al
lado: `partitivos-dello-scons#0` · **65 caracteres** · **462 px** · **1 línea** · caja mínima 622 px.
**No se cierran, no se aprueban y no se reetiquetan como pasados.** Es el mismo tratamiento que la
Phase 46, por la misma razón: *ausencia de sujeto, no indulgencia*. Un backstop que el verificador no
puede confirmar con evidencia se abstiene; ablandar el gate porque su sujeto no aparece sería convertir
un test sin sujeto en un verde.

**Lo que esta medición SÍ aporta a las fases siguientes:** el umbral está ahora acotado por dos puntos
medidos. 65 caracteres = 462 px = 1 línea; 165 caracteres = 944 px = 2 líneas. La envoltura empieza en
algún punto entre ambos, y en la caja más estrecha (622 px) hará falta una traducción de en torno a
**88 caracteres** para verla. Ninguna categoría traducida hasta hoy se acerca.

---

## Estado del plan 04

| Task | Estado |
|---|---|
| Task 1 — Mutaciones 1 y 2 | **HECHA** · rojo observado exit 1 en las dos · restauradas y re-verificadas · commit `6ac7e9f` |
| Task 2 — Mutación 3 (3a y 3b) + este fichero | **HECHA** · rojo observado exit 1 en las dos formas · restaurada y re-verificada |
| Task 3 — `checkpoint:human-verify` `gate="blocking"` | **BLOQUEADA ESPERANDO AL AUTOR** |
| `backstop` E1 · long-text (`WINDOWS` 21) | **SIGUE ABSTENIDA** · medida nueva escrita: 65 ch / 462 px / 1 línea |
| `backstop` E2 · long-text (`WINDOWS` 22) | **SIGUE ABSTENIDA** · misma medida |
| `backstop` lectura de muestra (`WINDOWS` 23) | **ABSTENIDA** — es del autor, y el checkpoint está abierto |

**Ninguna mutación quedó committeada.** Los tres ficheros mutados vuelven byte a byte a su foto verde
(md5 idénticos, `porcelain` vacío) y no existe ningún commit de esta fase que introduzca una mutación:
los dos commits del plan tocan **solo** este fichero de evidencia. Es la mitigación de **T-47-21**
ejecutada, no prometida.
