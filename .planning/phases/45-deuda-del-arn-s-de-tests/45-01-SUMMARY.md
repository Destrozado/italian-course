---
phase: 45-deuda-del-arn-s-de-tests
plan: 01
subsystem: arnés de tests / contrato de invocación
tags: [deuda-01, source-assert, gate, node-test, lockstep, anti-cr-01]
status: complete

requires:
  - "tests/count-arrays-lockstep.test.js (bloques 1-5, Phase 44)"
  - "content/categories.json como referencia de disco"
provides:
  - "INVOCACION_CANONICA — la única transcripción de la forma de correr la suite en todo el árbol de tests"
  - "Gate de cobertura derivado del disco: ningún *.test.js queda fuera de los globs canónicos"
  - "Lockstep contable de los 4 ficheros de contrato + regla de prefijo sobre tests/"
affects:
  - "README.md, los 2 SKILL.md, scripts/run-validation-271.mjs (pie impreso)"
  - "las 20 cabeceras de tests/*.test.js"
  - "memoria del proyecto test_command_node_glob.md"

tech-stack:
  added: []
  patterns:
    - "source-assert (D-44-07): leer el TEXTO, nunca importar"
    - "la referencia SIEMPRE del disco (Pattern B) — readdirSync recursive"
    - "cláusula de no-vacuidad por anclas, y va PRIMERO (anti CR-01)"
    - "conteo de ocurrencias en vez de includes() para el lockstep documental"

key-files:
  created:
    - .planning/phases/45-deuda-del-arn-s-de-tests/deferred-items.md
  modified:
    - tests/count-arrays-lockstep.test.js
    - README.md
    - scripts/run-validation-271.mjs
    - .claude/skills/gsd-validate-batch/SKILL.md
    - .claude/skills/it-add-song/SKILL.md
    - "tests/*.test.js (20 cabeceras)"
    - "$HOME/.claude/projects/-home-vcompanyb-italian-course/memory/test_command_node_glob.md"

decisions:
  - "D-45-01 — forma canónica: `node --test tests/*.test.js tests/fixtures/*.test.js` (los DOS globs)"
  - "D-45-02 — NO se mueven los ficheros de tests/fixtures/ a tests/"
  - "D-45-03 — las cabeceras de tests/ entran en el lockstep, no se declaran prosa no-contractual"
  - "D-45-04 — ninguna cifra de conteo nueva se transcribe: el invariante documentado es `# fail 0` + exit 0"
  - "D-45-05 (nueva, no prevista) — el lockstep documental CUENTA ocurrencias en vez de hacer includes()"

metrics:
  duration: "~50 min"
  completed: 2026-08-12

actuals:
  tokens: 21000
  tasks: 2
  commits: 2
---

# Phase 45 Plan 01: Deuda del arnés de tests — DEUDA-01 Summary

Los 2 ficheros de `tests/fixtures/` (63 aserciones) entran en la invocación canónica, y el
hecho de que entren queda congelado por 3 gates derivados del disco en vez de por prosa —
verificados los cinco por mutación, con el rojo observado y transcrito.

## Qué se construyó

**Bloque 6 nuevo en `tests/count-arrays-lockstep.test.js`.** `INVOCACION_CANONICA` es la única
transcripción de la forma en todo el árbol de tests; `GLOBS_CANONICOS`, `PREFIJO_SUITE` y las
regex de glob se **derivan** de ella. Tres tests:

1. **Cobertura derivada del disco** — `readdirSync(recursive)` sobre `tests/`, cada fichero
   confrontado con los globs traducidos a regex (`*` → `[^/]*`, que NO cruza `/`). Con cláusula
   de no-vacuidad por anclas, y va primero.
2. **Lockstep de los 4 ficheros de contrato** — cada uno debe documentar la invocación completa
   en **todas** sus menciones, y al menos una.
3. **Regla de prefijo sobre `tests/`** — ninguna cabecera puede documentar la corrida de la
   suite en la forma corta. Es lo que hace que la cabecera número 21 nazca correcta.

**Contrato actualizado** en README (×2), los 2 SKILL.md (×2 cada uno), el comentario de exit-code
y el **pie impreso** del reporter, las 20 cabeceras de `tests/*.test.js` y la memoria del proyecto.

## Mediciones, fechadas — 2026-08-12

| Medida | Antes | Después |
|---|---|---|
| Invocación de hoy (`tests/*.test.js`) | 1101 pass / 0 fail / exit 0 | — |
| `tests/fixtures/*.test.js` aparte | 63 pass (44 + 19) | — |
| **Invocación canónica** | — | **1167 pass / 0 fail / exit 0** |
| Idem con `VAL_07_STRICT=1` | 1119 | **1185** |
| Tramo 1 / tramo 2 al cierre | — | 1104 + 63 = 1167 (exacto) |

**El delta se descompone así, y la descomposición importa:** 1101 → 1164 son las **+63
aserciones huérfanas** que se enganchan (el número que el ROADMAP y el plan predijeron); 1164 →
1167 son los **+3 tests nuevos** del gate que este plan escribe. El plan transcribió `1164` como
criterio de aceptación y esa cifra estaba computada **sin contar sus propios tests nuevos** — ver
Desviaciones. El delta comprometido (+63, no +44) se cumple.

## Verificación por mutación — los 5 rojos observados

Ninguno inferido. Salida transcrita de la terminal; los 5 revertidos.

### 1. Desincronizar un `expected` LITERAL de `REAL_CATEGORIES` (el rojo que define DEUDA-01)

```
$ perl -0pi -e "s/\{ slug: 'avere', expected: 20 \}/{ slug: 'avere', expected: 21 }/" \
    tests/fixtures/slot-variants-integration.test.js

$ node --test tests/*.test.js tests/fixtures/*.test.js; echo "exit=$?"
        Conteo inesperado en content/exercises/avere.json: esperaba 21, encontré 20
# tests 1166
# pass 1165
# fail 1
exit=1
```

Y **la forma vieja sigue mintiendo** sobre exactamente la misma mutación — el bug, reproducido:

```
$ node --test tests/*.test.js; echo "exit_vieja=$?"
# tests 1103
# pass 1103
# fail 0
exit_vieja=0
```

Revertido con `git checkout --`; `git status --short` sin entradas bajo `tests/fixtures/`, y la
canónica de vuelta en verde.

### 2. Gate de cobertura, edge `boundary` — un test un nivel más hondo

```
$ mkdir -p tests/fixtures/sub && printf '...' > tests/fixtures/sub/tmp.test.js
$ node --test tests/count-arrays-lockstep.test.js; echo "exit=$?"
        DEUDA-01: estos ficheros de test existen en disco y `node --test tests/*.test.js
        tests/fixtures/*.test.js` NO los corre, asi que sus aserciones no vigilan nada:
        tests/fixtures/sub/tmp.test.js. O se mueven a un directorio que los globs cubran,
        o se anade su glob a INVOCACION_CANONICA
not ok 7 - invocacion canonica — ningun fichero de test queda fuera de la suite, ...
# tests 26
# pass 25
# fail 1
exit=1
```

`rm -rf tests/fixtures/sub` → `exit=0`.

### 3. Cláusula de no-vacuidad — la enumeración rota NO pasa en verde

Sustituida la enumeración por `[]`:

```
        DEUDA-01 / T-45-01-03: la enumeracion del disco no ve
        tests/count-arrays-lockstep.test.js, tests/fixtures/slot-variants-integration.test.js,
        asi que la lista de 0 ficheros no es de fiar y la comprobacion de cobertura de abajo
        pasaria en verde sin haber mirado nada
# tests 26
# pass 25
# fail 1
exit=1
```

Sin la cláusula, ese mismo estado habría dado `deepEqual([], [])` → **verde certificando nada**,
que es CR-01 verbatim. Revertido.

### 4. Lockstep — un call-site que se queda en la forma corta

Retirado el segundo glob de UNA de las dos invocaciones de `README.md`:

```
        DEUDA-01: estos ficheros de contrato le dicen al autor una forma de correr la suite
        que no es `node --test tests/*.test.js tests/fixtures/*.test.js`:
        README.md: 1 mencion(es) se quedaron en la forma corta
# tests 26
# pass 25
# fail 1
exit=1
```

**Este rojo NO se produjo al primer intento** — ver Desviaciones, D-45-05. Revertido.

### 5. Regla de prefijo — una cabecera devuelta a la forma corta (tarea 2)

```
        DEUDA-01: estas suites documentan una corrida de la suite en una forma que NO corre
        tests/fixtures/ (`node --test tests/*.test.js` a secas): tests/screen-examen.test.js
not ok 7 - invocacion canonica — ...
# tests 27
# pass 26
# fail 1
exit=1
```

Restaurada → `exit=0`.

### Extra: call-site renombrado (mitigación T-45-01-04)

Añadido `README-RENOMBRADO.md` a `CALL_SITES_INVOCACION`:
`README-RENOMBRADO.md: NO EXISTE`, `# fail 1`, `exit=1`. Revertido. Un call-site renombrado no
puede vaciar el gate en silencio.

## Edge cases — medidos, no razonados

**`empty` (backstop del plan).** Renombrados los dos ficheros de `tests/fixtures/` a `.bak`, la
invocación canónica da:

```
# tests 1102
# suites 195
# pass 1099
# fail 2
# cancelled 1
exit=1

not ok 74 - gate anti-ceguera — las dos fuentes de conteo enganchan las categorias registradas
  error: "ENOENT: no such file or directory, open '.../tests/fixtures/slot-variants-integration.test.js'"
not ok 78 - invocacion canonica — ...
        DEUDA-01 / T-45-01-03: la enumeracion del disco no ve
        tests/fixtures/slot-variants-integration.test.js, asi que la lista de 27 ficheros
        no es de fiar ...
```

**Esto NO es un verde silencioso, y por escrito:** un glob canónico que deja de casar ficheros
sale con `exit 1` por dos vías independientes — el `readSrc` de `COUNT_ARRAY_SOURCES` (ENOENT) y
la cláusula de no-vacuidad del gate de cobertura, que nombra el ancla ausente. El shell deja el
glob sin expandir (`nullglob` off) y Node no lo trata como cero-ficheros-todo-bien. La defensa
real es la del apartado (a)-1, que corre **dentro** de la suite. Restaurados; `git status` sin
ningún `.bak`.

**`adjacency` — globs disjuntos.** `ls tests/*.test.js` expande a 27 ficheros, `ls
tests/fixtures/*.test.js` a 2, **intersección 0**. Los tramos suman exacto: 1104 + 63 = 1167. El
suite de nivel superior del fichero huérfano aparece **1** vez, no 2.

> El criterio del plan usaba `grep -c '^ok .*slot-variants-integration.test.js'` esperando `1`;
> devuelve **0**. No es un fallo de la propiedad: Node 22 nombra los suites TAP de nivel superior
> por su etiqueta de `describe`, no por la ruta del fichero, así que ese patrón no puede casar
> nunca. La propiedad se verificó por las dos vías de arriba (intersección de la expansión + suma
> exacta de tramos), que además son derivadas y no dependen del formato del reporter.

**`ordering` / `idempotency`.** Dos ejecuciones consecutivas: `# tests 1167 / # pass 1167` las
dos. `git status --short` byte-idéntico antes y después.

**`concurrency`.** `grep -cE 'writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync'` sobre los
dos ficheros de `tests/fixtures/` → **0** en ambos. Solo leen; seguros bajo la ejecución
concurrente por fichero que `node --test` hace por defecto.

**`precision`.** Declarado `unresolved` con motivo en el plan (no hay aritmética de coma flotante
en un conteo entero de ficheros). Se mantiene.

## Decisiones

Las cuatro del plan (D-45-01..04) se aplicaron tal cual. Una quinta surgió de un rojo que no se
produjo:

**D-45-05 — el lockstep documental CUENTA ocurrencias, no hace `includes()`.** Ver Desviaciones.

## Desviaciones del plan

### 1. [Rule 2 — funcionalidad crítica ausente] El lockstep con `includes()` era vacuo ante regresión parcial

- **Encontrado en:** tarea 1, ejecutando el rojo obligatorio #4.
- **Problema:** el plan especifica el lockstep como «si `readSrc(ruta)` no contiene
  `INVOCACION_CANONICA`, acumúlalo». Retirando el segundo glob de UNA de las **dos** invocaciones
  de `README.md`, el gate se quedó **verde** (`# pass 26 / # fail 0 / exit 0`): la **otra**
  ocurrencia seguía conteniendo la cadena. Un fichero de contrato con dos invocaciones y una sola
  actualizada es exactamente la desincronización que el gate existe para delatar, y el `includes`
  la certificaba. Un gate que no puede ponerse rojo ante su propio caso de uso es la especie de
  CR-01 que esta fase paga.
- **Arreglo:** helper `cuentaOcurrencias` + `menciones(texto)`, que devuelve
  `{canonicas, cortas}`. Como la canónica **empieza** por el prefijo, cada canónica aporta
  exactamente una ocurrencia de prefijo; la resta deja las que se quedaron cortas. El gate exige
  `canonicas ≥ 1` (no-vacuidad por fichero: un contrato mudo no está «en lockstep») **y**
  `cortas === 0`. La misma regla gobierna el test 3.
- **Verificado:** repetida la mutación → `README.md: 1 mencion(es) se quedaron en la forma corta`,
  `# fail 1`, `exit=1`. El rojo del apartado 4 de arriba es el de **después** del arreglo.
- **Commit:** `bdf858b`.

### 2. [Rule 3 — bloqueo] El test 3 se commiteó con la tarea 2, no con la 1

- **Problema:** el plan pide los 3 tests en la tarea 1 **y** que la tarea 1 cierre en
  `# fail 0`. Son incompatibles: en el momento en que existe la regla de prefijo, 17 ficheros de
  `tests/` están todavía en la forma corta (es literalmente el trabajo de la tarea 2), así que el
  commit de la tarea 1 habría sido **rojo**.
- **Decisión:** los 4 `const` del contrato (incluido `PREFIJO_SUITE`) y los tests 1 y 2 van en el
  commit de la tarea 1; el test 3 va en el de la tarea 2, **junto con** las cabeceras que lo ponen
  en verde. Cada commit queda verde y atómico, y las fronteras de fichero que declara el plan se
  respetan exactamente (la tarea 1 no toca ninguno de los 20 ficheros de tests de la tarea 2).
- **Coste:** ninguno de los 4 rojos obligatorios de la tarea 1 dependía del test 3; los 4 se
  observaron dentro de la tarea 1.

### 3. [Transparencia — cifra del plan corregida, no re-transcrita] 1164 → 1167

- El criterio de aceptación transcribe `# tests 1164` / `# pass 1182 (strict)`. Los valores
  reales al cierre son **1167** y **1185**. La diferencia son los **3 tests que este mismo plan
  añade**: la cifra del plan se computó en research-time sobre el árbol **sin** el gate nuevo.
- **No se sustituye una cifra transcrita por otra:** las cifras de arriba viven **solo aquí**, en
  el SUMMARY, fechadas y como medición. No hay ninguna en README, ni en el gate, ni en la memoria
  del proyecto. El invariante que el arnés documenta y asserta es `# fail 0` + exit 0.
- El compromiso del ROADMAP (delta **+63**, no +44) se cumple: 1101 → 1164 por enganche.

### 4. [Precisión — exención escrita] La regla de prefijo exime a un fichero, y solo a uno

`tests/count-arrays-lockstep.test.js` queda exento del test 3, con el motivo escrito en el
código: sus goldens `SRC_TRAMPA` contienen la forma corta como **dato** — reproducen el `/*` de
`tests/*.test.js` viviendo dentro de una CADENA, que es justo lo que prueba que `sinComentarios`
no lo trata como comentario. Cambiarlos destruiría el caso que congelan (el plan lo prohíbe
explícitamente). La exención no es un pase libre: el test 2 ya exige que ese fichero declare
`INVOCACION_CANONICA`, y su cabecera la lleva completa. Verificado: `git diff` no muestra ningún
cambio dentro de `SRC_TRAMPA`.

## Criterios de aceptación

| Criterio | Resultado |
|---|---|
| Canónica en verde, exit 0 | ✅ 1167/1167, `# fail 0` (el plan predecía 1164 — ver Desviación 3) |
| `VAL_07_STRICT=1` en verde | ✅ 1185/1185 (plan: 1182) |
| ROJO de la mutación de `REAL_CATEGORIES` | ✅ mensaje y exit code verbatim arriba |
| ROJO del gate de cobertura (boundary) | ✅ nombra `tests/fixtures/sub/tmp.test.js` |
| ROJO de la cláusula de no-vacuidad | ✅ mensaje de ancla ausente, no verde |
| ROJO del lockstep | ✅ tras D-45-05; con el diseño del plan salía verde |
| ROJO de la regla de prefijo (tarea 2) | ✅ nombra `tests/screen-examen.test.js` |
| `grep -c` canónica en README / los 2 SKILL.md | ✅ `2` en los tres |
| `grep -n 'pass 14' README.md` vacío; `grep -c '1164'` = 0 | ✅ |
| `grep -c '# fail 0' README.md` ≥ 1 | ✅ `1` |
| Las 3 formas rotas (`node --test tests/`) desaparecidas | ✅ `grep -n 'node --test tests/$' tests/*.test.js` sin resultados |
| Invocaciones individuales intactas | ✅ `domain-session`, `schema-validator-origen`, `domain-progress` = 1 cada una |
| Goldens `SRC_TRAMPA` intactos | ✅ sin cambios en el diff |
| Memoria: canónica sí, cifra `327` no | ✅ 2 ocurrencias / 0 |
| `git status` sin residuo de mutación ni `.bak` | ✅ |
| Diff de los 20 ficheros de tests solo en comentarios | ✅ 0 líneas no-comentario cambiadas |
| Sin borrados de fichero en los 2 commits | ✅ `git diff --diff-filter=D HEAD~2 HEAD` vacío |
| Reporter sigue corriendo e imprime la canónica | ✅ smoke ejecutado |

## Known Stubs

Ninguno. No se dejó código sin cablear ni test saltado; los 3 gates nuevos corren en la suite y
los 5 se probaron en rojo.

## Deferred Issues

Registrados en `.planning/phases/45-deuda-del-arn-s-de-tests/deferred-items.md`:
`.planning/research/.cache/` sin ignorar, los comentarios stale del reporter (son **DEUDA-03**,
plan 45-03) y el `271` del nombre del fichero (fuera de alcance por decisión del research).

## Self-Check: PASSED

- `tests/count-arrays-lockstep.test.js` — FOUND (bloque 6, `INVOCACION_CANONICA` presente)
- `.planning/phases/45-deuda-del-arn-s-de-tests/deferred-items.md` — FOUND
- commit `bdf858b` — FOUND
- commit `5dab078` — FOUND
