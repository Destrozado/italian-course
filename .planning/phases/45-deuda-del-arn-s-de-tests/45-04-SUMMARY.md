---
phase: 45-deuda-del-arn-s-de-tests
plan: 04
subsystem: trazabilidad de requisitos / gate derivado del disco sobre REQUIREMENTS.md
tags: [deuda-01, deuda-02, deuda-03, trazabilidad, gate, source-assert, anti-cr-01, derivacion-de-disco, igualdad-exacta]
status: complete

requires:
  - ".planning/REQUIREMENTS.md como referencia de disco"
  - ".planning/v2.0-MILESTONE-AUDIT.md (WR-06 / WR-01 / WR-10 de Phase 44) como procedencia de los 3 requisitos"
  - "los SUMMARY de 45-01, 45-02 y 45-03 como evidencia del estado `Complete`"
  - "tests/count-arrays-lockstep.test.js bloque 6 (plan 45-01) — el gate que engancha este fichero nuevo sin declararlo"
provides:
  - "DEUDA-01/02/03 definidos Y mapeados a Phase 45: cero requisitos huerfanos"
  - "La linea de Coverage DERIVADA: 26/26 confrontada con las filas contadas del disco"
  - "Cruce definiciones ↔ mapeos en las DOS direcciones, por igualdad exacta de cadena"
affects:
  - ".planning/REQUIREMENTS.md (seccion DEUDA, 3 filas, Coverage, Mapping rationale)"
  - "la suite: 1176 -> 1179 tests"

tech-stack:
  added: []
  patterns:
    - "source-assert: leer el TEXTO del documento, nunca parsear un modelo intermedio"
    - "la referencia SIEMPRE del disco (Pattern B): ninguna cifra de requisitos como constante del test"
    - "clausula de no-vacuidad, y va PRIMERO (anti CR-01)"
    - "igualdad EXACTA de cadena via Array.prototype.includes, nunca inclusion de subcadena"
    - "lectura fail-LOUD de la referencia, a nivel de modulo (silueta de tests/content-fare-indefiniti.test.js)"
    - "anclas de forma reconocidas por patron y no por milestone (`## … Requirements`), para no envejecer en v2.1"

key-files:
  created:
    - tests/requirements-traceability.test.js
  modified:
    - .planning/REQUIREMENTS.md

decisions:
  - "D-45-12 — la linea de Coverage se DERIVA del disco; no se registra como deuda aceptada"
  - "D-45-13 — los 3 requisitos se abren dentro de v2.0, no como primer bloque de v2.1"
  - "D-45-14 — el gate vive en fichero propio, no dentro del gate anti-ceguera"
  - "D-45-15 (nueva, no prevista) — el gate NO caza un requisito ausente de las DOS mitades; caza la edicion a medias. La afirmacion contraria del plan es FALSA, y se midio"

requirements-completed: [DEUDA-01, DEUDA-02, DEUDA-03]

coverage:
  - deliverable: "DEUDA-01/02/03 definidos y mapeados a Phase 45, con procedencia y estado respaldado"
    verification:
      - kind: command
        ref: "grep -cE '^- \\[x\\] \\*\\*DEUDA-0[123]\\*\\*:' + grep -cE '^\\| DEUDA-0[123] \\| Phase 45' = 3 y 3"
        status: pass
      - kind: command
        ref: "gsd-tools query requirements.mark-complete DEUDA-01 DEUDA-02 DEUDA-03 -> already_complete 3/3, not_found []"
        status: pass
    human_judgment: false
  - deliverable: "La linea de Coverage se deriva del disco y su divergencia pone el gate rojo"
    verification:
      - kind: test
        ref: "tests/requirements-traceability.test.js#la cifra escrita en la linea de Coverage cuadra con el conteo real de filas"
        status: pass
      - kind: command
        ref: "mutacion 1 (fila de mas, cifra intacta) -> 26/26 vs 27 filas, exit=1"
        status: pass
    human_judgment: false
  - deliverable: "El cruce definiciones ↔ mapeos se pone rojo en las dos direcciones, con igualdad exacta de IDs"
    verification:
      - kind: test
        ref: "tests/requirements-traceability.test.js#cero huerfanos en las DOS direcciones"
        status: pass
      - kind: command
        ref: "mutaciones 2, 3 y 4 (definido-sin-mapear / mapeado-sin-definir / prefijo DEUDA-0) -> exit=1 nombrando el ID"
        status: pass
    human_judgment: false
  - deliverable: "El gate no puede quedar vacuo: la clausula de no-vacuidad falla en vez de pasar en verde"
    verification:
      - kind: command
        ref: "mutacion 5 (reconocimiento de filas a lista vacia) -> 2 tests rojos por no-vacuidad, exit=1"
        status: pass
    human_judgment: false
  - deliverable: "El fichero nuevo entra solo en la suite, sin declararlo en ningun sitio"
    verification:
      - kind: test
        ref: "node --test tests/*.test.js tests/fixtures/*.test.js -> 1179 pass; tests/count-arrays-lockstep.test.js bloque 6 verde (36/36)"
        status: pass
    human_judgment: false

metrics:
  duration: "~8 min"
  completed: 2026-08-13

actuals:
  tokens: 7300
  tasks: 2
  commits: 2
---

# Phase 45 Plan 04: Trazabilidad — DEUDA-01/02/03 dejan de ser huérfanos y la cobertura se deriva Summary

Los tres requisitos que vivían solo en el ROADMAP existen ya en `REQUIREMENTS.md` como definición
y como fila de trazabilidad, con su procedencia y su estado respaldado por el rojo que cada plan
anterior observó; y la línea de Coverage —el análogo exacto del anti-patrón que esta fase paga—
deja de ser una cifra escrita a mano: un gate nuevo la confronta con las filas contadas del disco
y cruza definiciones contra mapeos en las dos direcciones. Cinco rojos observados en terminal.

## El conteo, antes y después — fechado 2026-08-13

| Medida | Antes | Después |
|---|---|---|
| Filas de la tabla de trazabilidad (contadas del disco) | **23** | **26** |
| Definiciones de requisito (`- [x] **ID**:`) | **23** | **26** |
| Línea de Coverage | `23/23` | `26/26` |
| `grep -c DEUDA .planning/REQUIREMENTS.md` | **0** | 8 ocurrencias de `DEUDA-0` |
| Tests que vigilan la cobertura de requisitos | **0** | **3** |
| Suite canónica | 1176 pass / 0 fail | **1179 pass / 0 fail**, exit 0 |
| Idem con `VAL_07_STRICT=1` | 1194 | **1197** |

> Estas cifras viven **solo aquí**, fechadas y como medición. En el arnés no se assertó ningún
> conteo nuevo: el `26` aparece en el test únicamente dentro del mensaje de un rojo, nunca como
> constante. La referencia es el propio conteo del disco.

**Prueba independiente de que el hueco se cerró también a nivel de herramienta:** los tres planes
anteriores llamaron a `requirements.mark-complete` y recibieron `not_found`. Hoy:

```
$ gsd-tools query requirements.mark-complete DEUDA-01 DEUDA-02 DEUDA-03
  "already_complete": [ "DEUDA-01", "DEUDA-02", "DEUDA-03" ],
  "not_found": [],
```

## Qué se construyó

**1. La sección `### Deuda del arnés de tests (DEUDA)`** en `.planning/REQUIREMENTS.md`, con los
tres requisitos redactados **desde el criterio de éxito del ROADMAP** (el compromiso), no desde lo
que se acabó implementando. Cada bullet lleva debajo un comentario HTML en el registro de
INT-02/03/04 que dice **de qué hallazgo de la auditoría nace** (WR-06, WR-01 y WR-10 de la Phase
44 respectivamente) y **qué decisión de plan lo cerró** — incluido, deliberadamente, **lo que quedó
fuera**: WR-12 (D-45-06) y el `271` del nombre del reporter (D-45-09) constan como deuda aceptada,
no como asunto resuelto. Ese comentario es lo que evita que la próxima auditoría tenga que
reconstruirlo.

**2. Las tres filas de trazabilidad**, `Complete`, con una nota al pie que **justifica el verde
citando el rojo observado de cada plan** (abajo). El precedente del propio documento —las notas de
INT-03/INT-04, que se negaron a poner `Complete` sobre contenido sin revisar— exige esa
justificación, no la cortesía de venir de la última ola.

**3. La línea de Coverage a `26/26`, contada del disco**, con un comentario HTML que avisa de que
un gate la verifica y de que no se escriba de memoria. Y un bullet nuevo en `### Mapping rationale`
explicando por qué los tres caen en una fase transversal en vez de repartirse entre las fases que
generaron la deuda.

**4. `tests/requirements-traceability.test.js`** (D-45-14: fichero propio; meterlo en
`count-arrays-lockstep.test.js` habría mezclado dos contratos en un fichero que ya tiene siete
bloques). Tres tests sobre el TEXTO del documento: la forma sigue donde el gate la busca; la cifra
escrita cuadra con las filas contadas; cero huérfanos en las dos direcciones. Lectura de la
referencia **fail-LOUD**, con la razón escrita al lado de por qué aquí es la polaridad **opuesta**
a la del reporter (allí la lectura decora, aquí la lectura **es** el objeto del test).

## Verificación por mutación — los 5 rojos observados

Ninguno inferido. Salida transcrita de la terminal; los 5 revertidos. Las mutaciones sobre
`REQUIREMENTS.md` se revirtieron desde **copia en scratchpad**, no con `git checkout --`: la
desviación 1 del plan 45-02 dejó escrito que ese recipe destruye trabajo no committeado.

### 1. Una fila de más, sin tocar la cifra de Coverage

```
DEUDA / D-45-12: la linea de Coverage de .planning/REQUIREMENTS.md dice 26/26 y la tabla de
trazabilidad tiene 27 filas contadas DEL DISCO. El numero bueno es 27: se corrige LA CIFRA, no
la tabla. Esta divergencia es la razon exacta por la que este gate existe — la cifra estuvo
escrita a mano al lado de una tabla que nadie derivaba
not ok 1 - trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)
# tests 3
# pass 2
# fail 1
exit=1
```

La fila añadida duplica un ID **ya definido** a propósito: así el rojo aísla **solo** la
comprobación de conteo y no queda enmascarado por el de huérfanos. El mensaje dice **cuál de los
dos números es el derivado**, para que el rojo se arregle en la dirección correcta.

### 2. Una definición sin su fila (`XXX-99`)

```
not ok 3 - cero huerfanos en las DOS direcciones: lo definido esta mapeado y lo mapeado esta definido
    DEUDA: .planning/REQUIREMENTS.md tiene requisitos huerfanos, y un requisito que vive en una
    sola mitad del documento es trabajo que ninguna auditoria posterior puede cruzar:
    XXX-99: definido como requisito y SIN fila de trazabilidad
# tests 3
# pass 2
# fail 1
exit=1
```

### 3. Una fila sin su definición, con el Coverage ajustado a `27/27`

```
not ok 3 - cero huerfanos en las DOS direcciones: lo definido esta mapeado y lo mapeado esta definido
    DEUDA: … XXX-99: con fila de trazabilidad y SIN definir como requisito
# tests 3
# pass 2
# fail 1
exit=1
```

El ajuste del Coverage es deliberado y lo pedía el plan: **sin él, el primer test enmascararía al
segundo** y no se habría probado la segunda dirección del cruce. Con el ajuste, el test de la cifra
queda **verde** y el rojo es exclusivamente el del huérfano inverso.

### 4. Igualdad exacta — un ID que es PREFIJO de otro ya mapeado

Añadida la definición `DEUDA-0`, siendo `DEUDA-01` un ID que **sí** está en la tabla:

```
not ok 3 - cero huerfanos en las DOS direcciones: …
    DEUDA: … DEUDA-0: definido como requisito y SIN fila de trazabilidad
# pass 2 / # fail 1 / exit=1
```

Lo reporta como huérfano; **no lo da por mapeado** por coincidencia parcial. Es la misma trampa que
el prefijo ambiguo `fare-ind` puso en el gate anti-ceguera (T-45-04-02). La propiedad la sostiene
que `Array.prototype.includes` compara **elementos** por SameValueZero, no subcadenas como
`String.prototype.includes` — la distinción va escrita en el código, con un «no lo cambies por un
`.some(m => m.includes(id))`», porque es el edit plausible que rompería el gate en silencio.

### 5. No-vacuidad — el reconocimiento de filas devuelto a lista vacía

```
error: 'DEUDA / T-45-04-01: el reconocimiento de filas ve 0 filas de trazabilidad en
.planning/REQUIREMENTS.md. O la tabla se quedo vacia, o el ancla dejo de reconocer sus filas — y
con 0 filas la comprobacion de abajo compararia la cifra escrita contra la nada y pasaria en
verde sin haber contado ni una fila'

error: 'DEUDA / T-45-04-01: el cruce veria 26 definiciones contra 0 filas en
.planning/REQUIREMENTS.md, y con cualquiera de los dos conjuntos vacio no hay nada que cruzar: la
comprobacion de abajo pasaria en verde sin haber comparado un solo ID. O el documento se vacio, o
un ancla dejo de casar'
# tests 3
# pass 1
# fail 2
exit=1
```

Los **dos** tests que cruzan conjuntos fallan por su cláusula, no por el `deepEqual`. Sin ella, ese
mismo estado habría dado `[]` contra `[]` → **verde certificando nada**, que es CR-01 verbatim.

## El estado `Complete` de cada requisito, respaldado por su SUMMARY de origen

El plan exige que el verde escrito esté respaldado por lo que hay en disco, y que se transcriba la
línea que lo respalda. Los tres SUMMARY se leyeron antes de escribir `Complete`:

- **DEUDA-01** — `45-01-SUMMARY.md`, «Verificación por mutación», rojo 1: desincronizado un
  `expected` literal de `REAL_CATEGORIES`, la invocación canónica da
  `Conteo inesperado en content/exercises/avere.json: esperaba 21, encontré 20` / `# fail 1` /
  `exit=1`. Y el mismo SUMMARY transcribe que **la forma vieja sigue mintiendo** sobre esa
  mutación (`node --test tests/*.test.js` → `# fail 0`, `exit_vieja=0`): el bug, reproducido.
- **DEUDA-02** — `45-02-SUMMARY.md`, rojo 1: borrada UNA entrada,
  `INT-02 / D-44-06: tests/exercise-types.test.js quedaria CIEGO a estas categorias: fare-indefiniti`
  / `# fail 1` / `exit=1`, nombrando esa categoría y ninguna otra.
- **DEUDA-03** — `45-03-SUMMARY.md`, rojo 1: reintroducido un literal de versión en una línea de
  salida, el gate transcribe la línea culpable con su número (`467`) / `# fail 2` / `exit=1`; más
  el checkpoint humano `approved` (2026-08-13, sin cambios solicitados), que es la mitad que
  ningún test podía cubrir.

Ninguno de los tres se marcó sobre trabajo sin verificar.

## Desviaciones del plan

### 1. [Transparencia — afirmación del plan medida y refutada] El gate NO habría cazado a DEUDA-01/02/03

- **Encontrado en:** tarea 2, midiendo el gate contra el estado **real** anterior
  (`git show HEAD~1:.planning/REQUIREMENTS.md`) en vez de razonarlo.
- **La afirmación del plan** (y del revisor de planes) es que el cruce definiciones ↔ mapeos «es
  literalmente lo que habría cazado que DEUDA-01/02/03 no existieran». **Es falsa.** Medido:

```
$ git show HEAD~1:.planning/REQUIREMENTS.md > .planning/REQUIREMENTS.md
defs=23 filas=23 cifra=Coverage: 23/23
$ node --test tests/requirements-traceability.test.js
# tests 3
# pass 3
# fail 0
exit=0
```

- **Por qué:** un requisito ausente de las **dos** mitades deja el documento internamente
  **consistente**. El gate cruza las dos mitades entre sí; no puede echar de menos lo que no
  aparece por ningún lado. Contra la ausencia total la única defensa sería cruzar con `ROADMAP.md`,
  que está fuera del alcance de este plan.
- **Qué sí caza, y no es poco:** la edición **a medias** — definir sin mapear, mapear sin definir,
  o añadir filas sin tocar la cifra. Ése es el modo de fallo realista de quien edita este documento
  con prisa, y es el que convierte un olvido en una cifra que miente.
- **Arreglo:** no se cambió el gate (ampliarlo a `ROADMAP.md` es alcance nuevo, Regla 4). Se
  escribió la limitación **en la cabecera del propio test**, bajo el epígrafe «LO QUE ESTE GATE SI
  CAZA Y LO QUE NO», para que nadie le atribuya una garantía que no da. Registrado como **D-45-15**.
- Dejar la afirmación del plan sin refutar habría sido exactamente el pecado de la fase: prosa más
  confiada que el código.

### 2. [Rule 2 — criterio del plan incumplido] La procedencia tenía que ir bullet a bullet

- **Encontrado en:** tarea 1, verificando los criterios de aceptación.
- **Problema:** escribí la cita de `.planning/v2.0-MILESTONE-AUDIT.md` **una sola vez**, en el
  comentario de cabecera de la sección. El criterio exige `grep -c 'v2.0-MILESTONE-AUDIT' ≥ 3`
  (uno por bullet), y devolvía **1**.
- **Arreglo:** cada uno de los tres comentarios cita ahora su hallazgo concreto de la auditoría
  (**WR-06**, **WR-01** y **WR-10** de la Phase 44). No es burocracia de grep: un lector que
  aterriza en un bullet ya no tiene que reconstruir de dónde salió, y la trazabilidad queda contra
  el hallazgo exacto, no contra el informe entero. `grep -c` → **4**.

### 3. [Transparencia — cifra propia corregida antes de commitearla] `~35 min` → `~8 min`

Registré la métrica de ejecución como `~35 min` sin medirla. El reloj daba **8 min**
(`496 s` entre el inicio y el cierre). Corregido en `STATE.md` antes del commit. Inflar la duración
en la misma fase que existe para pagar cifras escritas a mano habría sido difícil de superar como
ironía; se anota aquí en vez de borrarse.

### 4. [Precisión] La lectura fail-loud va a nivel de MÓDULO, al revés que en el plan 45-03

El plan 45-03 movió su lectura **dentro** del test porque allí un fallo de carga tumbaba los 36
tests del fichero y «un fallo de carga no se lee como *este gate se puso rojo*» (desviación 2 del
45-02). Aquí se hace lo contrario, y con motivo escrito en el código: la referencia la necesitan
**los tres** tests del fichero, así que no hay nada que salvar tumbando solo uno. Es la silueta
literal de `tests/content-fare-indefiniti.test.js`, que es el precedente que el plan pedía copiar.

## Decisiones

Las tres del plan (D-45-12, D-45-13, D-45-14) se aplicaron tal cual. Una cuarta salió de una
medición:

**D-45-15 — el gate caza la edición a medias, no la ausencia total.** Ver desviación 1.
**ID elegido para no colisionar:** cuando se escribió esto la fase tenía dos `D-45-05` vivos
(45-01 y 45-02) con el renumerado pendiente, y `D-45-09` y `D-45-12` ya usados. `D-45-15` era
libre. El cierre de fase resolvió la colisión renumerando la de 45-01 a `D-45-16`.

## Criterios de aceptación

| Criterio | Resultado |
|---|---|
| `grep -cE '^- \[x\] \*\*DEUDA-0[123]\*\*:'` = 3 | OK — `3` |
| `grep -cE '^\| DEUDA-0[123] \| Phase 45'` = 3 | OK — `3` |
| 26 filas de datos en la tabla | OK — `26` |
| `Coverage: 26/26` = 1 y `Coverage: 23/23` = 0 | OK — `1` y `0` |
| `grep -c 'v2.0-MILESTONE-AUDIT'` ≥ 3 | OK — `4` (tras la desviación 2) |
| `### Mapping rationale` nombra `DEUDA` | OK |
| Estado `Complete` respaldado por los 3 SUMMARY | OK — línea de origen transcrita arriba para cada uno |
| `node --test tests/requirements-traceability.test.js` → `# fail 0`, `exit=0` | OK — `3 pass` |
| ROJO cifra desincronizada, con los dos números | OK — `26/26` vs `27 filas` |
| ROJO definido sin mapear, nombrando el ID | OK — `XXX-99` |
| ROJO mapeado sin definir, sin enmascarar | OK — `XXX-99`, con Coverage ajustado |
| ROJO de no-vacuidad, no verde | OK — 2 tests por la cláusula |
| Igualdad exacta, no por subcadena | OK — `DEUDA-0` reportado huérfano |
| El fichero entra solo en la suite | OK — 1176 → 1179; bloque 6 verde (36/36) sin declararlo |
| Suite canónica `# fail 0` | OK — **1179/1179**, exit 0 |
| `VAL_07_STRICT=1` | OK — **1197/1197** |
| Ninguna cifra de requisitos escrita a mano en el test | OK — el `26` solo aparece en mensajes de rojo |
| `git status --short` sin residuo de mutación | OK — solo los untracked heredados |
| Sin borrados de fichero en los 2 commits | OK — `git diff --diff-filter=D HEAD~2 HEAD` vacío |

## TDD Gate Compliance

El plan marca la Tarea 2 como `tdd="true"`. **La secuencia RED → GREEN canónica no aplica tal cual
aquí, y se declara en vez de simularse:** el entregable de la tarea **es el test**, y la
«implementación» que vigila (los tres requisitos y la cifra derivada) se entregó en la Tarea 1, que
es anterior por dependencia — la Tarea 2 no puede escribir su assert sobre una tabla que aún no
existe. Commits: `28e33c7` (`docs`, la implementación) y `deb61d9` (`test`, el gate). No hay un
commit `feat` posterior al `test`.

Lo que sustituye al gate RED, y con la misma fuerza probatoria, es la **verificación por mutación**:
los cinco rojos de arriba se observaron en terminal sobre el código ya escrito, cada uno revertido.
Fabricar un commit rojo intermedio para exhibir una `F` en el log habría sido teatro; medir cinco
rojos reales es lo que prueba que el gate muerde.

## Known Stubs

Ninguno. Nada quedó sin cablear, ningún test saltado, ningún `<verify>` sin correr.

## Deuda abierta

- **D-45-15 — el gate no cruza con `ROADMAP.md`.** Un requisito declarado en el roadmap y ausente
  de las dos mitades de `REQUIREMENTS.md` sigue sin tener gate. Es alcance nuevo (Regla 4), no
  olvido: queda escrito en la cabecera del test y aquí. Candidato natural a quick task.
- **La forma del documento queda congelada.** Cuando se abra v2.1 con un `REQUIREMENTS.md` nuevo,
  este gate se pondrá rojo si la forma cambia — y eso es **comportamiento deseado**, declarado en
  el plan y repetido en el mensaje del propio rojo: obliga a decidir conscientemente la forma nueva
  en vez de dejar que la cobertura deje de verificarse en silencio. La cabecera de sección se
  reconoce por patrón (`## … Requirements`), así que el cambio de número de milestone **no** la
  rompe; solo un cambio de plantilla.
- ~~la colisión de IDs **`D-45-05`** entre 45-01 y 45-02~~ — **RESUELTA** en el cierre de fase
  (la de 45-01 pasó a **D-45-16**). Heredados sin tocar: **WR-12** (D-45-06), el **`271`** del
  nombre del reporter (D-45-09), y `.planning/research/.cache/` sin ignorar más
  `.planning/phases/45-*/.gitkeep`.

## Self-Check: PASSED

- `tests/requirements-traceability.test.js` — FOUND
- `.planning/REQUIREMENTS.md` — FOUND (3 definiciones, 3 filas, `Coverage: 26/26`)
- commit `28e33c7` — FOUND
- commit `deb61d9` — FOUND
- `git diff --diff-filter=D HEAD~2 HEAD` — vacío (sin borrados)
