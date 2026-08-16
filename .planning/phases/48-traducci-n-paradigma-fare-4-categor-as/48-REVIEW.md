---
phase: 48-traducci-n-paradigma-fare-4-categor-as
reviewed: 2026-08-16T00:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - content/exercises/fare-cond-imperativo.json
  - content/exercises/fare-congiuntivo.json
  - content/exercises/fare-indefiniti.json
  - content/exercises/fare-indicativo.json
  - content/translation-coverage.lock.json
  - docs/TRANSLATION-VALIDATION-PROMPT.md
  - scripts/run-validation-271.mjs
  - scripts/validate-translation-pass.mjs
  - tests/content-fare-cond-imperativo.test.js
  - tests/content-fare-congiuntivo.test.js
  - tests/content-fare-indefiniti.test.js
  - tests/content-fare-indicativo.test.js
  - tests/translation-validator.test.js
findings:
  critical: 2
  warning: 7
  info: 3
  total: 12
status: fixes_applied
fix_report: 48-REVIEW-FIX.md
fixed_at: 2026-08-16
disposition:
  fixed: 7
  refuted: 1
  escalated: 1
  out_of_scope: 3
  ids:
    CR-01: fixed
    CR-02: fixed
    WR-01: fixed
    WR-02: fixed
    WR-03: fixed
    WR-04: fixed (dirección del fix propuesto INVERTIDA — la del review habría causado leak R1)
    WR-05: refuted (falso hallazgo; WINDOWS id 60)
    WR-06: fixed
    WR-07: escalated (decisión del autor; WINDOWS id 53)
    IN-01: out_of_scope
    IN-02: out_of_scope (cifras reproducidas exactas: 21 = 7 + 14 en su alcance)
    IN-03: out_of_scope
---

# Phase 48: Code Review Report

> **ESTADO ACTUALIZADO (2026-08-16).** Los hallazgos de abajo se conservan **tal y como se
> escribieron** — no se borra ni se reescribe ninguno. Su disposición posterior vive en
> **`48-REVIEW-FIX.md`**: 7 arreglados con evidencia de mutación, 1 refutado con evidencia
> derivada del disco (WR-05, `WINDOWS` id 60), 1 escalado por decisión del autor (WR-07,
> `WINDOWS` id 53) y 3 Info fuera de alcance. Dos matices que este documento no podía
> saber y que el arreglo midió: la **dirección** del fix propuesto para WR-04 era errónea y
> **peor que el bug** (habría convertido el slot en leak R1 inmediato), y WR-05 re-proponía
> un concern que el autor ya había **rechazado por decisión expresa** en el plan 48-02.

**Reviewed:** 2026-08-16
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found (al escribirse) → fixes_applied (ver `48-REVIEW-FIX.md`)

## Summary

122 traducciones nuevas en 4 categorías, dos arreglos de tubería de escritura y el
enganche de las 4 categorías a TRAD-COV. Baseline confirmada antes de tocar nada:
`node --test tests/*.test.js tests/fixtures/*.test.js` → **1369 tests, 1365 pass, 4 fail**
(los 4 preexistentes, anidados bajo `trazabilidad de requisitos`), y
`node scripts/run-validation-271.mjs` → `TRAD-COV PASS (328/328)`, `Milestone gate PASS`,
exit 0. Los 4 fallos preexistentes no se reportan.

**Lo que SÍ resiste el ataque (verificado, no leído):**

1. **Las 4 aserciones de key-set están genuinamente estrechas.** El filtro es
   `claves.filter((c) => c !== 'translationES')` contra el `deepEqual` de las 3 claves
   obligatorias, idéntico en los 4 ficheros. Mutación en `fare-indicativo.json`: clave
   intrusa `hint` → **1 fail**; clave obligatoria mal escrita (`promt`) → **7 fail**;
   restaurado → verde. La mordida se conserva entera y la delegación de la FORMA de
   `translationES` a otro gate es real: `tests/domain.test.js` corre `validateContent`
   sobre el bundle completo del disco, así que `src/data/schema-validator.js:490-515`
   sí juzga los 4 ficheros nuevos.
2. **`sanearParaCorpus` cubre lo que dice cubrir.** Fuzz de 300.000 cadenas sobre el
   alfabeto adversarial (`< > & # - = : j a v s c r i p t ' "` tipográficas): **0
   supervivientes** de las 4 marcas de T-41-01 y de las comillas de D-41-17. Casos
   dirigidos de re-creación (`javascript&#58;`, `&#&#`, `-->`, `<!--`, `&#x3c;`) todos
   limpios; la función es idempotente; ninguna sustitución posterior re-crea una marca
   anterior.
3. **Integridad estructural de los 4 JSON: limpia.** 122/122 variantes con
   `translationES` de key-set `{text, validation}`; 0 desincronías entre `status`
   escrito y `deriveStatus`; 0 `by` duplicados dentro de un mismo `passes[]`;
   0 `incorrecta` sin concern; 0 marcas de higiene; 0 traducciones duplicadas dentro de
   un slot ni entre slots; conteo RAW de claves (`grep -c '"translationES":'` etc.)
   idéntico al conteo parseado en los 4 ficheros → **no hay claves duplicadas que
   `JSON.parse` esté descartando en silencio**. El único override es el de
   `fare-indicativo-passato-remoto#4`, con motivo escrito y quórum previo de 2 modelos.

**Lo que NO resiste:** el ancla de TRAD-COV — el único término del veredicto que no se
deriva del corpus — se desarma con una sola edición del lock, y ni el reporter ni
GATE-03 dicen nada (CR-01, CR-02, ambos probados por mutación end-to-end). Los dos
arreglos de `validate-translation-pass.mjs` funcionan por el camino que los tests
recorren, pero cada uno deja abierta la puerta de al lado (WR-01, WR-02). Y tres
defectos de contenido/criterios se colaron con quórum 2/2 y cero concerns.

---

## Critical Issues

### CR-01: el suelo del ancla de TRAD-COV se puede bajar a mano y NINGÚN gate lo ve

**File:** `content/translation-coverage.lock.json:4-12` · `scripts/run-validation-271.mjs:449-496` · `tests/count-arrays-lockstep.test.js:2651-2662`

**Issue:**
El ancla es, por diseño, «lo único que el borrado no puede mover consigo». Pero su
contenido no se confronta NUNCA con el disco: los dos consumidores comparan
exclusivamente `disco < suelo` (reporter línea 481, GATE-03 línea 2652). Bajar un suelo
es por tanto un no-op silencioso, y a partir de ahí el vector CR-02 de la Phase 47 vuelve
a estar abierto.

Probado end-to-end, no argumentado:

```
# 1) bajar el suelo de fare-indicativo 54 -> 1 en el lock, y nada más:
node --test tests/count-arrays-lockstep.test.js   # 66 pass, 0 fail
node scripts/run-validation-271.mjs               # exit 0

# 2) el exploit completo, sobre una categoría sin test de conteo de variantes:
#    lock preposiciones 96 -> 95  +  borrar preposiciones-col#0 (traducida y validated)
node --test tests/*.test.js tests/fixtures/*.test.js
    # tests 1369 · pass 1365 · fail 4   <-- EXACTAMENTE la baseline
node scripts/run-validation-271.mjs
    # TRAD-COV (327/327 traducciones validated): PASS (327/327)
    # Milestone gate PASS.                          exit 0
```

El corpus perdió una traducción validada, la cifra bajó de 328 a 327 y todo salió verde
— que es literalmente el `PASS (205/205)` que el bloque de las líneas 421-448 dice haber
cerrado. (Nota metodológica: un primer intento borró `preposiciones-di-origen#0` y SÍ
salió un rojo, pero es incidental: ese slot es el `SLOT_CANONICO` que
`tests/translation-validator.test.js:60` ancla por índice. Borrando cualquier otra
variante, el silencio es total.)

Las 4 categorías de esta fase heredan el agujero con sus 4 suelos nuevos.

**Fix (hipótesis, NO verificada — mutarla antes de darla por buena):** añadir a GATE-03
un tercer término que confronte el ancla con el disco por IGUALDAD, no por suelo, y que
por tanto se ponga rojo tanto si el disco encogió como si el lock se editó a mano:

```js
const desalineadas = Object.entries(ancladas)
  .filter(([slug, suelo]) => disco[slug] !== undefined && disco[slug] !== suelo)
  .map(([slug, suelo]) => `${slug}: ancla ${suelo}, disco ${disco[slug]}`);
assert.deepEqual(desalineadas, [], `GATE-03: el ancla no es un punto fijo del emisor…`);
```

**Coste declarado del fix, que hay que decidir por escrito y no colar:** convierte
«crecer es verde» en «crecer obliga a re-emitir el lock». Eso contradice la doctrina
`ES UN SUELO, NO UNA IGUALDAD` escrita en `scripts/bump-translation-lock.mjs:20-25` y en
`run-validation-271.mjs:440-443`. Si esa doctrina se mantiene, el fix correcto es otro
(p. ej. que GATE-03 compare el lock contra `conteoDeCoberturaEnDisco()` sólo para
detectar suelos INFERIORES al disco, que es la señal de edición manual, sin tocar el
lado de crecimiento). No se ha verificado ninguna de las dos variantes.

---

### CR-02: un suelo NO numérico desactiva el ancla de esa categoría en los DOS gates, sin un solo diagnóstico

**File:** `scripts/run-validation-271.mjs:481-487` · `tests/count-arrays-lockstep.test.js:2651-2653`

**Issue:**
Ni el reporter ni GATE-03 validan el TIPO de los valores de `lock.categorias`. Ambos
hacen una comparación `<` cruda contra un valor que sale de un JSON editable:

```js
if (entrada.expected < suelo) { …anclaViolaciones.push(…) }          // reporter:481
.filter(([slug, suelo]) => (disco[slug] ?? 0) < suelo)               // GATE-03:2652
```

`54 < null` es `false`. `54 < "cincuenta y cuatro"` es `false` (NaN). `54 < true` es
`false`. En los tres casos el ancla de esa categoría queda **muda**, y ninguno de los dos
gates emite nada: ni un warning, ni una línea en el veredicto.

Probado (mutando sólo `content/translation-coverage.lock.json`, `fare-indicativo`):

| valor del suelo | `count-arrays-lockstep` | reporter |
|---|---|---|
| `null` | 66 pass / 0 fail | exit 0 |
| `"cincuenta y cuatro"` | 66 pass / 0 fail | exit 0 |
| `true` | 66 pass / 0 fail | exit 0 |

Esto contradice frontalmente la doctrina que ese mismo bloque predica dos pantallas más
arriba: el reporter SÍ comprueba que `lock.categorias` sea objeto y que no esté vacío
(líneas 462-470, «un ancla vacía es un gate vacuo con aspecto de vigilar»), y GATE-03 SÍ
lleva su cláusula de no-vacuidad (líneas 2641-2649). La no-vacuidad se comprueba a nivel
de mapa y se abandona a nivel de entrada, que es donde vive el dato que decide.

**Fix (hipótesis, no verificada):** rechazar fail-loud toda entrada que no sea entero no
negativo, en el mismo bucle que ya recorre las entradas, con el mismo idioma que el resto
de los diagnósticos del fichero:

```js
if (!Number.isInteger(suelo) || suelo < 0) {
  anclaViolaciones.push(
    `${slug}: el ancla declara ${JSON.stringify(suelo)}, que no es un entero: la comparación ` +
    `\`disco < suelo\` es FALSE contra cualquier no-número, así que esta categoría no está ` +
    `anclada. Re-emite con: node scripts/bump-translation-lock.mjs --write`
  );
  continue;
}
```

y su espejo en GATE-03. Verificar por mutación con los tres valores de la tabla antes de
darlo por cerrado.

---

## Warnings

### WR-01: el pase que se IMPRIME no es el pase que se ESCRIBE — el camino de recuperación reintroduce el defecto que el saneo cierra

**File:** `scripts/validate-translation-pass.mjs:531-536, 583-593, 807-814, 1039`

**Issue:**
El saneo se colocó deliberadamente en `applyPassToText` con este argumento textual
(líneas 808-813): *«es el ÚNICO sitio por el que pasa todo lo que llega al disco […]
ponerlo antes, en el compositor del pase, dejaría abierto el camino que los tests ya
usan»*. La consecuencia no declarada es que **`run()` devuelve, y `main()` imprime, el
pase SIN sanear**: `run` compone `pass`, se lo pasa a `writeTranslationPass`, ignora el
`out` que ésta devuelve y retorna el `pass` original.

Verificado ejecutando `run()` con un modelo simulado que emite
`[S1-natural] “hacia” -> “hacía”; ver <b>`:

```
>>> PASE DEVUELTO POR run() / IMPRESO POR main():
["[S1-natural] “hacia” -> “hacía”; ver <b>"]
>>> contiene marcas prohibidas por T-41-01/D-41-17: true
```

Escenario de fallo concreto, sobre el camino que el propio fichero documenta: el escritor
lanza (lockfile huérfano de un pid vivo — reproducido y citado en las líneas 573-582), se
imprime el pase y el mensaje dice *«aplícalo a mano o re-corre cuando la causa esté
resuelta»*. El autor lo pega en el JSON con su `->` y sus comillas tipográficas intactas,
y `tests/content-fare-*.test.js` se pone en rojo — que es **exactamente el incidente del
plan 48-02 que motivó `sanearParaCorpus`**, llegando por la única puerta que el arreglo
no tapó. Afecta a las tres salidas que imprimen el pase: éxito (`main:1039`), exit 3
(`run:584`) y exit 4 (`run:557`).

**Fix (hipótesis, no verificada):** imprimir y devolver el pase saneado, p. ej. exportando
`sanearPase` ya lo está y aplicándolo en `run` antes de imprimir/retornar —cuidando de que
`applyPassToText` siga saneando por su cuenta (es idempotente, comprobado), para no volver
a dejar el camino de los tests sin cubrir.

---

### WR-02: el guard de `--adjudicar` vive SOLO en `run()`; el escritor sigue componiendo el artefacto prohibido

**File:** `scripts/validate-translation-pass.mjs:556-571, 819-844` · `scripts/lib/pass-guard.mjs:52-56`

**Issue:**
`WINDOWS id 45` declara prohibido un pase `incorrecta` con una `adjudicacion` colgada
(status `disputed`, registro que «se lee como adjudicado sin estarlo»). El arreglo se
puso en el compositor `run()` — el mismo sitio que el saneo rechazó por dejar puertas
abiertas. `applyPassToText` / `writeTranslationPass` siguen aceptándolo:
`assertNoBorraIncorrectaEnSilencio` retorna en seco cuando el nuevo verdict es
`incorrecta` (`pass-guard.mjs:53`), y nada más lo mira.

Verificado ejecutando `applyPassToText` sobre un documento sintético con un `incorrecta`
previo del mismo `by`:

```
status: disputed
pase escrito: { "by":"m2", "verdict":"incorrecta",
                "concerns":["[S2] sigo sin verlo"],
                "adjudicacion":"el autor refuta el concern en cuatro puntos" }
>>> artefacto WINDOWS id 45 en disco: true
```

Y no hay red de seguridad aguas abajo: ningún gate del repo busca ese artefacto en el
corpus (ni `content-fare-*.test.js`, ni VAL-09, ni TRAD-COV — todos comparan
escrito-vs-derivado, y aquí los dos lados coinciden en `disputed`). O sea que si entra —
por un escritor futuro, por el análogo de canciones, o a mano desde el stdout del exit 4 —
se queda.

**Fix (hipótesis, no verificada):** mover (o duplicar) la negativa al escritor, junto al
`assertNoBorraIncorrectaEnSilencio` que ya está ahí:

```js
if (pass.verdict === 'incorrecta' && typeof pass.adjudicacion === 'string' && pass.adjudicacion.trim()) {
  throw new Error(`${slotId}#${k}: un pase \`incorrecta\` no puede llevar \`adjudicacion\`…`);
}
```

Cuidado con la regresión: el test
`tests/translation-validator.test.js:1335` invoca `run()` con `WRITE:true` sobre un
`target.file` inexistente (`no-se-toca.json`) y hoy pasa porque `run` corta antes; el
guard del escritor no lo alcanza, así que ese test seguiría verde y **no verificaría el
fix**. Hace falta un test nuevo a nivel de `applyPassToText`.

---

### WR-03: el exit code 4 no está en el contrato del fichero y ningún test lo ejercita

**File:** `scripts/validate-translation-pass.mjs:61-70, 1035-1038`

**Issue:**
El doc-block declara los exit codes `0 · 1 · 2 · 3` y razona por qué el 3 existe
separado del 1. El 4, introducido en esta fase, no aparece: el contrato que el propio
fichero se impone (*«el exit code deja de significar lo que el doc-block promete»*,
líneas 1044-1047) queda desactualizado en el mismo commit que lo amplía.

Peor: **el 4 no está cubierto**. Los tres tests de `--adjudicar`
(`tests/translation-validator.test.js:1316-1362`) invocan `run()` directamente y
assertean `pass.noEscrito`; ningún test recorre el CLI con `--adjudicar` (`runCli` corre
con las API keys vacías, así que ninguna invocación real llega al modelo). `grep -rn
"status, 4\|status === 4" tests/` → 0 resultados. Borrar la línea
`if (pass.noEscrito) process.exit(4);` deja la suite entera en verde y la adjudicación
rechazada saliendo con **exit 0**, que se lee como «adjudicado» — que es la mitad del
defecto que el arreglo dice cerrar.

**Fix:** (a) añadir el `4` a la lista de exit codes del doc-block con su razón (igual que
el 3 lleva la suya); (b) un test que ejercite el camino, inyectable como los demás — p. ej.
extrayendo `main` a una función exportada que devuelva el código en vez de llamar a
`process.exit`, o un test de CLI con un `caller` inyectado. Verificar por mutación
(borrar la línea → rojo).

---

### WR-04: `fare-indicativo-300#0` — la traducción CONTRADICE el gloss canónico R7 de su propio prompt, en el tiempo verbal que el slot enseña

**File:** `content/exercises/fare-indicativo.json` (slot `fare-indicativo-300`, variante 0)

**Issue:**

```
prompt : Stamattina io ho fatto i compiti prima di uscire.
         (en español: esta mañana hice los deberes antes de salir)
trad   : Esta mañana he hecho los deberes antes de salir.
```

El gloss dice `hice` (indefinido) y la traducción dice `he hecho` (perfecto), sobre el
passato prossimo, que es justamente la regla que el cruce `-300` existe para enseñar. El
autor ve una forma ANTES de contestar y la contraria DESPUÉS.

`docs/TRANSLATION-VALIDATION-PROMPT.md:462-464` es explícito: *«como el gloss es canon,
es la desambiguación autorizada del léxico […] El gloss manda sobre tu preferencia»*, y
las líneas 456-460 prevén exactamente este caso (gloss de FRASE COMPLETA: *«la traducción
coincidirá con el gloss casi palabra por palabra, y eso es correcto y esperable»*).

Barrido del disco sobre las 122 traducciones: hay **6 variantes con gloss**, y ésta es
la **única** que diverge. Las otras cinco (`fare-indicativo-300#1`, `#2`,
`fare-indefiniti-300#0..2`) contienen su gloss verbatim. O sea que es un descuido, no una
política. El quórum no lo vio: `deepseek-reasoner` + `gemini-3.5-flash-lite`, ambos
`correcta`, **cero concerns**.

**Fix:** decidir cuál de los dos es el bueno y alinear el otro. Lo defendible
lingüísticamente es `he hecho` (`stamattina` es marco temporal vigente), así que el
candidato es corregir el GLOSS a `esta mañana he hecho los deberes antes de salir` — pero
el gloss es canon R7 y su edición es una decisión editorial del autor, no del revisor. Lo
que no puede quedarse es la contradicción. Ninguna de las dos opciones está verificada
aquí.

---

### WR-05: `fare-indicativo-301#1` — la omisión del pronombre deja un participante SIN introducir, que es lo que la propia excepción nueva dice vigilar

**File:** `content/exercises/fare-indicativo.json` (slot `fare-indicativo-301`, variante 1) · `docs/TRANSLATION-VALIDATION-PROMPT.md:296-320`

**Issue:**

```
IT : Io faccio una foto senza problemi, ma lui commette un errore ogni volta.
ES : Hago una foto sin problemas, pero comete un error cada vez.
```

La excepción de pronombre escrita en esta fase absuelve la omisión, pero declara
vigilado *«que la PERSONA siga siendo recuperable»* y *«que no se pierda un CONTRASTE que
la frase afirma»*. Aquí la persona morfológica sí se recupera (1ª vs 3ª), pero el
REFERENTE no: el italiano introduce un tercer participante con `lui`, y el español lo
deja sin antecedente en toda la frase — «pero comete» no tiene sujeto recuperable
(él / ella / usted, y ninguno mencionado antes).

Es el único de los tres contrastes del slot con esta propiedad: `#0`
(`Haces… pero repasamos…`) opone 2ª sg y 1ª pl, y `#2` (`Hacemos… y controláis…`) opone
1ª pl y 2ª pl — en los dos casos los referentes son el hablante y el destinatario, que la
frase ya tiene. `#1` es el único que introduce a un tercero.

El quórum tampoco lo vio: `deepseek-reasoner` + `gemini-3.5-flash-lite`, ambos
`correcta`, cero concerns — lo cual es esperable, porque el texto de la excepción absuelve
la omisión sin distinguir el caso de referente nuevo.

**Fix (dos frentes, ninguno verificado):** (a) en el corpus, restituir el pronombre en esa
variante (`…, pero él comete un error cada vez.`), que la excepción permite explícitamente
(*«una traducción que sí ponga el pronombre está igual de bien»*); (b) en el doc, si el
caso se considera de CLASE, nombrarlo en el punto 1 de «qué se sigue vigilando»: la
omisión está absuelta salvo cuando el pronombre italiano introduce un referente que la
frase española no tiene de otro modo.

---

### WR-06: la cláusula de guarda de la excepción del congiuntivo contradice dos traducciones que esta misma fase escribió y validó

**File:** `docs/TRANSLATION-VALIDATION-PROMPT.md:352-360` · `content/exercises/fare-congiuntivo.json`

**Issue:**
La excepción del MODO cierra con: *«Que el TIEMPO y la PERSONA sigan siendo los del
original. Esta aclaración habla del MODO y de nada más. Una traducción que cambie el
tiempo verbal […] ya era `[S2-fidelidad]` false antes de esta aclaración y lo sigue
siendo exactamente igual.»*

Dos traducciones de la misma fase cambian el tiempo verbal (compuesto → simple):

| dirección | italiano | español |
|---|---|---|
| `fare-congiuntivo-passato#2` | `abbia fatto` (congiuntivo passato) | `hizo` (indefinido) |
| `fare-congiuntivo-passato#5` | `abbiano fatto` (congiuntivo passato) | `hicieron` (indefinido) |

Las dos son el español correcto (`la semana pasada`, `el mes pasado` piden indefinido en
peninsular), y las dos están `validated`. Pero leídas contra la cláusula que acaba de
escribirse, un evaluador tiene base literal para emitir `[S2-fidelidad] cambia el tiempo
verbal` y devolverlas a `disputed` en la primera re-validación — el mismo mecanismo que la
memoria del proyecto registra como «el modelo marca un patrón y aprueba otro idéntico».

Que el hueco es real lo demuestra la TERCERA excepción del mismo commit: la del
condizionale composto sí legisla explícitamente el compuesto→simple
(`avresti fatto` → `harías`, líneas 379-388). La del congiuntivo no lo hizo.

**Fix (hipótesis, no verificada):** en la excepción del congiuntivo, acotar la cláusula
del TIEMPO igual que se acotó la del condizionale — que lo vigilado es la RELACIÓN
temporal (anterioridad / simultaneidad / posterioridad respecto del verbo matriz), no la
forma simple-vs-compuesta cuando el marcador temporal español la impone. Redactarlo en el
doc, nunca en un `notes` ni en un SUMMARY (`§Gobernanza de excepciones`, línea 514).

---

### WR-07: CONFIRMADO — `disco 0` de GATE-03 es el fallback de un `??`, no una medida

**File:** `tests/count-arrays-lockstep.test.js:2651-2653`

**Issue:** confirmado tal como lo escala el contexto de fase; **no se reporta como
hallazgo nuevo**, se registra por trazabilidad.

```js
.filter(([slug, suelo]) => (disco[slug] ?? 0) < suelo)
.map(([slug, suelo]) => `${slug}: ancla ${suelo}, disco ${disco[slug] ?? 0}`);
```

`conteoMcDeCategoriasCubiertas()` OMITE del mapa toda categoría sin ninguna variante
traducida (línea 2621, `continue`). Así que una categoría que pierde TODAS sus
traducciones —pero conserva sus 54 variantes multiple-choice en disco— se reporta como
`disco 0`, y el autor lee «no quedan variantes» cuando lo que pasó es «no quedan
traducciones». El reporter SÍ distingue las dos causas con dos mensajes separados
(`run-validation-271.mjs:474-487`: *«YA NO está declarada cubierta»* vs *«en disco
quedan N»*); GATE-03 las funde. Deuda declarada y no arreglada en esta fase.

---

## Info

### IN-01: `--adjudicar` adjunta `adjudicacion` a CUALQUIER pase, aunque no haya nada que retirar

**File:** `scripts/validate-translation-pass.mjs:540`

`if (cfg.ADJUDICAR) pass.adjudicacion = cfg.ADJUDICAR;` corre antes de saber si existe un
`incorrecta` previo del mismo `by`. Invocar `--adjudicar` sobre una traducción virgen
graba en el corpus un motivo que no adjudica nada, indistinguible de uno que sí. **Fix:**
sólo adjuntar el motivo cuando el escritor confirme que hubo sustitución (lo cual exige
mover la decisión al escritor — converge con WR-02).

### IN-02: el pronombre de 3ª persona se autora de dos maneras dentro del mismo paradigma

**File:** los 4 `content/exercises/fare-*.json`

De las 21 variantes cuyo prompt italiano lleva `lui` / `lei`, 7 conservan `él`/`ella` en
español y 14 lo omiten — y la mezcla ocurre DENTRO de `fare-indicativo`, en la misma
casilla `#2` de cada slot (`imperfetto#2` → «él hacía», `presente#2` → «hace»). La
excepción nueva permite las dos formas explícitamente, así que no viola ningún criterio;
pero en un drill cuyo eje ES la persona, la traducción de la misma casilla cambia de
convención de un tiempo a otro. **Fix:** decisión editorial del autor; si se fija una
convención, el sitio es el doc de criterios, no un `notes`.

### IN-03: el lock se EMITE con claves de nombre-de-fichero y se CONSUME con claves de slug

**File:** `scripts/bump-translation-lock.mjs:53` · `scripts/run-validation-271.mjs:471`

`conteoDeCoberturaEnDisco()` indexa por `f.replace(/\.json$/, '')`; el reporter indexa
por `c.slug` de `TRANSLATION_COVERAGE`. Hoy coinciden en las 7 categorías cubiertas, y el
día que un slug deje de ser el basename el resultado sería rojo por «declarada cubierta y
SIN anclar» (fail-loud, no silencioso) — pero el acoplamiento no está escrito en ninguno
de los dos ficheros. **Fix:** una línea de comentario en cada lado, o derivar el slug del
mismo sitio en los dos.

---

_Reviewed: 2026-08-16_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
