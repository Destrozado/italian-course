---
phase: 45-deuda-del-arn-s-de-tests
plan: 03
subsystem: reporter de cierre de milestone / gate source-assert de la salida impresa
tags: [deuda-03, wr-06, wr-10, source-assert, gate, fail-soft, anti-cr-01, derivacion-de-disco]
status: complete

requires:
  - "tests/count-arrays-lockstep.test.js (bloques 1-6, Phases 44, 45-01 y 45-02)"
  - ".planning/STATE.md como fuente de derivacion del milestone activo"
  - "scripts/run-validation-271.mjs (CATEGORIES / TOTAL_EXPECTED ya computados)"
provides:
  - "STATE_PATH + milestoneActivo + etiquetaMilestone — derivacion fail-soft del milestone activo"
  - "Banner y pie interpolados: ninguna version escrita a mano en el reporter"
  - "Bloque 7 del gate: la salida impresa del reporter pasa de 0 tests a 5"
affects:
  - "la salida que el autor lee para decidir un cierre de milestone"
  - "tests/count-arrays-lockstep.test.js (31 -> 36 tests)"

tech-stack:
  added: []
  patterns:
    - "source-assert (D-44-07): leer el TEXTO del reporter, jamas ejecutarlo"
    - "la referencia SIEMPRE del disco (Pattern B): ni el milestone correcto de hoy se transcribe"
    - "clausula de no-vacuidad, y va PRIMERO (anti CR-01)"
    - "fail-soft en el reporter / fail-loud en el test — polaridades opuestas, con la razon escrita en los dos sitios"
    - "convencion de rutas por tier: resolve(projectRoot, …) en scripts/, new URL(…) en tests/"

key-files:
  created: []
  modified:
    - scripts/run-validation-271.mjs
    - tests/count-arrays-lockstep.test.js

decisions:
  - "D-45-08 — la fuente de derivacion es el frontmatter de .planning/STATE.md (NO MILESTONES.md, que solo registra shipped)"
  - "D-45-09 — el fichero NO se renombra; el `271` del nombre queda como deuda ACEPTADA y escrita"
  - "D-45-10 — el banner deja de nombrar una fase: se gatea el cierre del milestone, no una fase"
  - "D-45-11 — el pie imprime la forma con guion del comando"
  - "D-45-12 (nueva, no prevista) — el gate mira TODA linea no-comentario, no solo las que contienen el token `console.log`: el esqueleto del research dejaba fuera las lineas de continuacion"

metrics:
  duration: "~45 min"
  completed: 2026-08-12

actuals:
  tokens: 7100
  tasks: 2
  commits: 2
---

# Phase 45 Plan 03: DEUDA-03 — el reporter deja de mentir sobre su propio objeto Summary

El encabezado y el pie que el reporter IMPRIME derivan ahora el milestone activo del
frontmatter de `.planning/STATE.md` en vez de transcribirlo, y —lo que hace que no vuelva— la
derivacion queda congelada por un gate source-assert: la salida impresa del reporter pasa de
**cero** tests a cinco. Los cuatro rojos y las cinco mutaciones se observaron en terminal, se
transcriben literales abajo y se revirtieron.

## La foto de antes y la de despues, las dos fechadas — 2026-08-12

**ANTES** (verbatim de `git show HEAD~2:scripts/run-validation-271.mjs`, sin ANSI):

```
Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08 + VAL-09)
...
  → si OK: /gsd:complete-milestone v1.1
```

**DESPUES** (verbatim de `node scripts/run-validation-271.mjs`, sin ANSI, hoy):

```
Gate de cierre de v2.0 — VAL-04 + VAL-06 + VAL-08 + VAL-09 (18 categorías, 250 slots)
...
Milestone gate PASS.

Siguiente paso (manual, gesto consciente del autor):
  VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js
  → verifica smoke test paramétrico exit 0.
  → si OK: /gsd-complete-milestone v2.0
```

El `v2.0`, el `18` y el `250` **no estan escritos en ningun sitio del reporter**: el primero sale
de `.planning/STATE.md`, los otros dos de `CATEGORIES.length` y `TOTAL_EXPECTED`. La cifra `250`
confirma A1 del research (que la tomaba de la auditoria, no de una ejecucion) — pero da igual que
la confirme: el banner la interpola en runtime.

## Que se construyo

**1. La derivacion fail-soft (`scripts/run-validation-271.mjs`).** `STATE_PATH` es una ruta
CONSTANTE resuelta con `resolve(projectRoot, …)` —la convencion de `scripts/`, no la de `tests/`—
y `milestoneActivo` la lee en una IIFE `try/catch` con `?? null`. La regex
`/^milestone:[^\S\n]*(\S+)[^\S\n]*$/m` captura **un solo token**: whitespace horizontal en los dos
huecos, sin cuantificadores anidados (T-44-03-03), sin ninguna comilla (porque `sinComentarios` no
reconoce literales regex y una comilla suelta desalinearia su escaneo de esa linea), en su propia
linea y lejos de `CATEGORIES`.

**Por que fail-soft, escrito al lado del guard que hace lo contrario.** A quince lineas hay un
guard de coherencia que sí hace `process.exit(1)`, y leidos juntos parecen inconsistentes. La
diferencia va escrita en el codigo: aquel guard protege el **veredicto** del gate (si el conteo no
cuadra, el veredicto no vale); esto es una **etiqueta cosmetica**, y una lectura de modulo que
lanza mata el proceso sin imprimir una sola fila, convirtiendo la etiqueta en un blocker (WR-09).

**2. Banner y pie interpolados.** Fuera la fase (D-45-10). El pie usa la forma con guion (D-45-11)
y, cuando el milestone es desconocido, no deja un comando roto pegado: nombra las **dos** causas
posibles, porque las dos son reales y el diagnostico no puede elegir una.

**3. El gate que lo congela (bloque 7, `tests/count-arrays-lockstep.test.js`).** Dos tests sobre
el reporter real + tres goldens fail-first sobre literales del propio fichero. Vive **dentro** de
ese fichero y no en uno nuevo: verificado en esta sesion que importar `sinComentarios` desde otro
`.test.js` **re-registra sus 36 tests** (se vio la salida TAP duplicada al hacerlo en un script de
sondeo). Sin import, el problema no existe.

**4. Comentarios de comportamiento ACTUAL saneados, historial contable intacto.** Reescritos en
terminos de lo que el fichero **deriva**, nunca sustituyendo un numero obsoleto por otro nuevo. El
bloque de procedencia del total (10 entradas, de `373 = 272` a `→ 195 (v1.7 Phase 31)`) se conserva
**byte a byte** y se reencabeza declarando que es audit trail fechado y que el guard no lo consume.

## Verificacion por mutacion — las 5 del reporter

Ninguna inferida. Salida transcrita de la terminal; las 5 revertidas.

### 1. El dato mutado (la prueba de que DERIVA)

```
$ sed -i 's/^milestone: v2\.0$/milestone: v9.9/' .planning/STATE.md
$ node scripts/run-validation-271.mjs | sed -n '2p'
Gate de cierre de v9.9 — VAL-04 + VAL-06 + VAL-08 + VAL-09 (18 categorías, 250 slots)

$ git checkout -- .planning/STATE.md
$ node scripts/run-validation-271.mjs | sed -n '2p'
Gate de cierre de v2.0 — VAL-04 + VAL-06 + VAL-08 + VAL-09 (18 categorías, 250 slots)
```

### 2. Edge `boundary` — dos digitos y decena mayor

```
v2.10 → Gate de cierre de v2.10 …    /  → si OK: /gsd-complete-milestone v2.10
v10.0 → Gate de cierre de v10.0 …    /  → si OK: /gsd-complete-milestone v10.0
```

Impresos tal cual, sin truncar ni reformatear. Ningun formato de version esta hardcodeado.

### 3. Edge `encoding` — CRLF

```
$ sed -i 's/$/\r/' .planning/STATE.md
$ file .planning/STATE.md
.planning/STATE.md: Unicode text, UTF-8 text, … with CRLF line terminators
$ head -3 .planning/STATE.md | cat -A | tail -1
milestone: v2.0^M$

$ node scripts/run-validation-271.mjs | sed -n '2,4p' | cat -A
^[[1mGate de cierre de v2.0 M-bM-^@M-^T … (18 categorM-CM--as, 250 slots)^[[0m$
$
CategorM-CM--a                | Total    | Validated  | …$
```

`cat -A` es lo que hace la comprobacion real: la linea del banner cierra en `${RESET}$` **sin
ningun `^M` embebido**, y la linea siguiente sigue en blanco — no queda pisada por un retorno de
carro. El pie, igual: `→ si OK: /gsd-complete-milestone v2.0$`.

> **Nota tecnica, contra la hipotesis de partida.** El plan y el research avisaban de que un `\S+`
> goloso «se traga el retorno de carro». **No es asi**: `\r` ES whitespace, luego `\S` lo excluye
> por definicion, y `[^\S\n]` (whitespace menos el salto) lo absorbe limpiamente antes del `$`. La
> trampa CRLF real esta en las formas `(.+)$` o `(.*)$` — `.` no casa `\n` pero **sí** casa `\r`.
> La regex elegida es inmune por construccion y el `.trim()` es cinturon y tirantes. Se deja
> escrito para que la siguiente lectura no «arregle» algo que no esta roto.

### 4. Edge `empty`, fichero AUSENTE (leccion WR-09)

```
$ mv .planning/STATE.md /tmp/…/STATE.md.bak
$ node scripts/run-validation-271.mjs; echo "exit=$?"
Gate de cierre de milestone desconocido (no se pudo derivar de .planning/STATE.md) — VAL-04 + VAL-06 + VAL-08 + VAL-09 (18 categorías, 250 slots)
…
  → si OK: /gsd-complete-milestone <milestone>, con el que declare .planning/STATE.md. No se pudo
    derivar y las dos causas son reales: o falta el fichero, o no declara la clave milestone.
exit=0

filas de tabla impresas: 18
```

**Las 18 filas completas y `exit=0`.** No muere antes de imprimir una fila: la etiqueta cosmetica
no se convierte en blocker.

### 5. Edge `empty`, clave AUSENTE

Borrada solo la linea `milestone:` del frontmatter: comportamiento **identico** — 18 filas,
`exit=0`, misma etiqueta. `grep -c '^milestone:'` → `0` durante la mutacion.

## Verificacion por mutacion — los 4 rojos del gate

### 1. Literal de version reintroducido en una linea de salida

```
$ (anadido «— milestone v2.0» al final del banner)
$ node --test tests/count-arrays-lockstep.test.js; echo "exit=$?"
        DEUDA-03: estas lineas de scripts/run-validation-271.mjs escriben una version de
        milestone A MANO en vez de derivarla de .planning/STATE.md. Es exactamente la forma
        en que el banner acabo cuatro milestones desfasado sin que nada se pusiera rojo:
          467: `(${CATEGORIES.length} categorías, ${TOTAL_EXPECTED} slots) — milestone v2.0${RESET}`
        DEUDA-03: scripts/run-validation-271.mjs contiene el valor `v2.0` escrito a mano. Que
        hoy sea el milestone CORRECTO no lo salva: es un literal, y envejecera exactamente
        igual que el que esta fase acaba de quitar.
not ok 9 - DEUDA-03 — el reporter DERIVA el milestone de su banner y su pie, y no lo transcribe
# tests 36
# pass 34
# fail 2
exit=1
```

**Transcribe la linea culpable con su numero.** Muerden los dos tests, y el segundo demuestra la
propiedad que importa: **ni siquiera el milestone correcto de hoy** puede escribirse a mano.

### 2. Clausula de no-vacuidad

```
$ (el reconocimiento de lineas de salida sustituido por /ZZZ_EL_RECONOCIMIENTO_DEJO_DE_CASAR/)
      error: 'DEUDA-03 / T-45-03-06: tras pasar scripts/run-validation-271.mjs por
      sinComentarios no queda NI UNA linea que emita salida. O el reporter dejo de imprimir, o
      el escaner blanqueo el fichero entero (CR-01) — y con cero lineas la comprobacion de
      abajo pasaria en verde sin haber mirado nada'
# pass 33 / # fail 3 / exit=1
```

Es el modo de fallo catastrofico de CR-01 (un `/*` mal reconocido blanquea 200 lineas): sin la
clausula, el gate no encontraria ninguna version y pasaria **verde certificando nada**.

### 3. Fail-loud de la referencia — las dos causas

```
$ mv .planning/STATE.md /tmp/…
      error: "DEUDA-03: no se puede leer .planning/STATE.md (/home/…/.planning/STATE.md), que es
      la REFERENCIA de disco contra la que se comprueba que el banner del reporter DERIVA el
      milestone en vez de transcribirlo. Sin ella este gate no puede emitir ningun veredicto,
      asi que no puede pasar en verde. Causa: ENOENT: …"
# pass 35 / # fail 1 / exit=1

$ (fichero presente, clave borrada)
      error: 'DEUDA-03: .planning/STATE.md existe pero no declara ninguna clave `milestone:` en
      una linea propia, asi que no hay REFERENCIA contra la que comprobar la derivacion del
      banner del reporter.'
# fail 1
```

**Nombra el fichero y explica que es la referencia**, en las dos causas. Y cae **1** test, no 36:
ver Desviacion 2.

### 4. Golden fail-first, con el fix retirado

```
$ (versionesEscritasAMano vuelve a filtrar por el token console.log — la forma del research)
    not ok 1 - golden-NEGATIVO: un reporter que transcribe el milestone en su salida sale en la
    lista, banner Y pie
        DEUDA-03: las DOS lineas de salida transcriben y las dos tienen que salir; se
        encontraron 1: 2: console.log(`${BOLD}Milestone v1.1 — gate Phase 10${RESET}`)
# tests 36 / # pass 35 / # fail 1 / exit=1
```

`se encontraron 1` de 2 es el bug entero en una linea: el pie, que vive en una **linea de
continuacion**, se escapa. Ver Desviacion 1.

## SIN falso positivo — medido, no supuesto

El research marcaba el patron como hipotesis **no ejecutada** y avisaba de posibles falsos
positivos. Se midio sobre el reporter real **antes** de aceptarlo, con `sinComentarios` aplicado:

| Cadena impresa legitima | ¿Dispara `/\bv\d+\.\d+/`? |
|---|---|
| `VAL_07_STRICT=1 node --test tests/*.test.js tests/fixtures/*.test.js` | No — `V` mayuscula, sin punto decimal |
| `VAL-04 + VAL-06 + VAL-08 + VAL-09` (enumeracion de sub-gates) | No |
| `VAL-06 (${TOTAL_EXPECTED}/${TOTAL_EXPECTED} validated)` | No |
| `- VAL-09: … deriva src/data/validation-state.js.` (accion sugerida) | No — sin digitos tras la `v` |
| `- VAL-04: investiga manualmente los IDs sin ≥2 distinct by` | No |

**Las UNICAS 2 lineas del reporter que disparaban el patron eran las 2 stale** (el banner y el
pie). **No hubo que acotar el patron.** Lo que sí es deliberado es que sea **case-sensitive**: con
el flag `i`, un `VAL_07_STRICT` con un decimal al lado pasaria a ser candidato a falso rojo, y un
falso rojo es un defecto igual que un falso verde — ademas invita a relajar el gate. Los tres
goldens congelan las tres propiedades (transcribe / deriva / salida legitima).

## Mediciones, fechadas — 2026-08-12

| Medida | Al cerrar 45-02 | Tarea 1 | Tarea 2 |
|---|---|---|---|
| `node --test tests/count-arrays-lockstep.test.js` | 31 pass | 31 | **36** |
| Invocacion canonica | 1171 | 1171 | **1176** |
| Idem con `VAL_07_STRICT=1` | 1189 | — | **1194** |
| Tests que cubren la salida impresa del reporter | **0** | 0 | **5** |

La ultima fila es DEUDA-03 entera.

> Estas cifras viven **solo aqui**, fechadas y como medicion. En el arnes no se asserto ningun
> conteo nuevo; el invariante que documenta sigue siendo `# fail 0` + exit 0.

## Decisiones

Las cuatro del plan (D-45-08..11) se aplicaron tal cual. Una quinta salio de un rojo medido:

**D-45-12 — el gate mira TODA linea no-comentario, no solo las que contienen `console.log`.**
Ver Desviacion 1. **ID elegido para no colisionar**: la fase tiene dos `D-45-05` vivos (45-01 y
45-02) y el renumerado esta pendiente para el cierre; `D-45-12` no colisiona con ninguno.

## Desviaciones del plan

### 1. [Rule 2 — funcionalidad critica ausente] El esqueleto del research dejaba un agujero, y justo el de este plan

- **Encontrado en:** tarea 2, **antes** de escribir el gate (el research lo marcaba `[ASSUMED]`,
  no ejecutado, y la politica del proyecto exige verificarlo por mutacion).
- **Problema:** el esqueleto filtra `lineasImpresas = …filter(l => l.includes('console.log'))`.
  Las llamadas **multilinea** emiten salida en lineas de continuacion que **no contienen** ese
  token. Medido sobre un caso minimo: con el literal de version en la linea de continuacion, la
  forma del research devuelve `[]` → **VERDE**. Y no es hipotetico: **el pie que la Tarea 1
  escribe es exactamente esa forma** (`console.log(` y el template literal debajo, porque la
  rama ternaria del caso desconocido no cabe en una linea). El gate habria nacido **vacuo sobre
  el codigo que existe para vigilar** — la especie exacta de CR-01 que esta fase paga.
- **Arreglo:** se mira **toda linea no-comentario**. En un fichero que ya no debe nombrar ninguna
  version a mano, cualquier version fuera de un comentario es la infraccion. Es estrictamente mas
  ancho, no tiene el hueco, y los comentarios siguen exentos via `sinComentarios` para que el
  historial contable pueda nombrar milestones viejos.
- **Verificado:** el golden fail-first lo congela — con la forma del research encuentra **1 de 2**
  transcripciones. La clausula de no-vacuidad se re-anclo a lo que de verdad puede vaciarse (que
  `sinComentarios` no haya blanqueado el fichero entero), que es la unica via por la que esta
  forma podria pasar en verde certificando nada.
- **Commit:** `31df042`.

### 2. [Precision] La lectura de la referencia es fail-loud, pero se llama DENTRO del test

- El plan pide la silueta del repo: IIFE + `try/catch` + `throw`, que en
  `tests/content-fare-indefiniti.test.js` vive a **nivel de modulo**. Se conservo el cuerpo
  (mismo `throw` con contexto) pero se invoca **dentro** del test.
- **Motivo:** a nivel de modulo, mover `STATE.md` tumbaria los **36** tests del fichero con un
  fallo de **CARGA**, y la Desviacion 2 del plan 45-02 dejo escrito que un fallo de carga no se
  lee como «este gate se puso rojo» sino como «este fichero esta roto». Alli la referencia la
  necesitan todos los tests del fichero; aqui solo el bloque 7.
- **Verificado:** con `STATE.md` fuera cae **1** test con el mensaje que nombra el fichero, y los
  otros 35 siguen corriendo.

### 3. [Transparencia] Dos `v1.1` que yo mismo escribi, retirados

Mi primera redaccion de la cabecera citaba el banner viejo verbatim (`Milestone v1.1 — gate
Phase 10`) como evidencia historica. Son comentarios, asi que el gate no los veria — pero el
criterio de aceptacion (`grep -c 'v1\.1'` = 0 fuera del historial contable) es inequivoco y una
cita en el codigo no se distingue de un literal vivo al grepear. **Se retiraron los dos**; la foto
verbatim del «antes» vive arriba en este SUMMARY, fechada, que es su sitio.
`grep -c 'v1\.1' scripts/run-validation-271.mjs` → **0**, historial contable incluido.

### 4. [Transparencia] Diagnostico corregido: «no se pudo leer» era falso en un caso

La primera version del pie decia `(no se pudo leer)`. Con la **clave** ausente el fichero **sí**
se lee. Reescrito para nombrar las dos causas —«o falta el fichero, o no declara la clave»—,
siguiendo el precedente del bloque 3-ter: cuando las dos causas son reales, atribuir una sola es
un diagnostico plausible y falso.

## Criterios de aceptacion

| Criterio | Resultado |
|---|---|
| `node scripts/run-validation-271.mjs` exit 0, banner con `v2.0` + categorias + slots, sin fase | OK — `Gate de cierre de v2.0 … (18 categorías, 250 slots)` |
| ROJO/VERDE del dato mutado (`v9.9`) | OK — el banner lo sigue; revertido |
| Edge boundary (`v2.10`, `v10.0`) | OK — impresos tal cual |
| Edge encoding (CRLF) | OK — `v2.0` limpio, verificado con `cat -A`; sin `^M` |
| Edge empty, fichero ausente | OK — 18 filas + etiqueta que nombra el fichero, `exit=0` |
| Edge empty, clave ausente | OK — identico |
| `grep -c 'v1\.1'` = 0 | OK — `0`, historial incluido (ver Desviacion 3) |
| `grep -c '/gsd:complete-milestone'` = 0 | OK — `0` |
| Nota de D-45-09 en la cabecera | OK |
| Historial contable sin borrar | OK — 10/10 entradas, `373 = 272` incluida |
| Gate con tests nuevos, `# fail 0` | OK — 31 → **36** (el plan preveia +2; son +5 por los 3 goldens) |
| ROJO del literal reintroducido, transcribiendo la linea | OK — nombra la 467 |
| SIN falso positivo, medido y transcrito | OK — tabla arriba; no hubo que acotar el patron |
| ROJO de la no-vacuidad | OK |
| FAIL-LOUD de la referencia, nombrando el fichero | OK — en las dos causas |
| Golden fail-first visto rojo | OK — encuentra 1 de 2 con la forma del research |
| Canonica `# fail 0` | OK — **1176/1176**, exit 0 |
| `VAL_07_STRICT=1` | OK — **1194/1194** |
| `git status --short` sin residuo ni `.bak` | OK |

## Known Stubs

Ninguno. Nada quedo sin cablear, ningun test saltado, ningun `<verify>` sin correr.

## Deuda abierta

- **D-45-09 — el `271` del nombre del fichero.** Deuda **ACEPTADA y viva**, no asunto cerrado:
  sigue codificando un conteo obsoleto (hoy 250). Mitigacion entregada: la cabecera declara que es
  historico, donde vive el conteo real y por que no se paga aqui (17 call-sites load-bearing, dos
  dentro del propio gate). Si el autor lo quiere, va a quick task aparte.
- **Colision de IDs `D-45-05`** entre 45-01 y 45-02 — heredada, renumerado pendiente del cierre de
  fase. Este plan usa `D-45-08..12`, sin colisionar.
- Heredados sin tocar: `.planning/research/.cache/` sin ignorar y
  `.planning/phases/45-*/.gitkeep` (ya en `deferred-items.md` del plan 45-01).

## Assumption declarada como `unresolved`

El edge `precision` de DEUDA-03 sigue sin aplicar, con el motivo del plan: la derivacion es
extraccion de una cadena, y las unicas cifras del banner son enteros ya computados y ya cubiertos
por el guard de coherencia. No hay redondeo, desbordamiento ni desempate que especificar. No se
fabrica un criterio.

## Tarea 3 — checkpoint humano: PENDIENTE

El plan es `autonomous: false` y su ultima tarea es un `checkpoint:human-verify` sobre la salida
real. **No se auto-aprueba**: el codigo esta entregado y verificado, pero el criterio de esa tarea
—si el texto le dice la verdad **al autor** sobre que gate acaba de correr— no es asertable y
queda a la espera de su lectura. Es la unica parte de la fase que no puede verificarse por
asercion, y es precisamente el punto: la deuda era un banner que nadie miraba.

## Self-Check: PASSED

- `scripts/run-validation-271.mjs` — FOUND (`STATE_PATH`, `milestoneActivo`, `etiquetaMilestone`)
- `tests/count-arrays-lockstep.test.js` — FOUND (bloque 7, 36 tests)
- `.planning/phases/45-deuda-del-arn-s-de-tests/45-03-SUMMARY.md` — FOUND
- commit `1b107e2` — FOUND
- commit `31df042` — FOUND
</content>
</invoke>
