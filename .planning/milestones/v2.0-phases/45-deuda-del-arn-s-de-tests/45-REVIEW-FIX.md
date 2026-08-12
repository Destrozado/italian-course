---
phase: 45-deuda-del-arn-s-de-tests
fixed_at: 2026-08-13T00:00:00Z
review_path: .planning/phases/45-deuda-del-arn-s-de-tests/45-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 45: Code Review Fix Report

**Fixed at:** 2026-08-13
**Source review:** `.planning/phases/45-deuda-del-arn-s-de-tests/45-REVIEW.md`
**Iteration:** 1
**Scope:** `critical_warning` (CR-01, CR-02, WR-01..WR-05). Los 4 INFO quedan fuera de alcance.

**Summary:**
- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Dónde se ejecutaron las verificaciones

**En el checkout principal, NO en un worktree aislado.** `.planning/config.json` declara
`workflow.use_worktrees: false`, que es el opt-out documentado, así que no se creó ningún
worktree: todas las ediciones, mutaciones y commits ocurrieron en `/home/vcompanyb/italian-course`
sobre `main`. Las cifras de abajo son por tanto reproducibles tal cual desde el árbol que el autor
tiene delante.

**Baseline de entrada:** `node --test tests/*.test.js tests/fixtures/*.test.js` →
`# tests 1179 / # pass 1179 / # fail 0`, exit 0.

**Baseline de salida:** `# tests 1182 / # suites 204 / # pass 1182 / # fail 0`, exit 0.
Estricto (`VAL_07_STRICT=1`): `# tests 1200 / # pass 1200 / # fail 0`, exit 0.
Reporter: `Milestone gate PASS`, exit 0, `→ si OK: /gsd-complete-milestone v2.0`.

Los 3 tests nuevos son el guard diferencial de CR-02, el de unicidad de WR-01 y el bloque 8 de
WR-02. Ningún test existente cambió de veredicto.

**Higiene de mutación:** cada arreglo se commiteó ANTES de mutar, y cada mutación se revirtió con
`git checkout -- <fichero>` sobre un árbol limpio. Ninguna mutación quedó en disco: `git status`
final solo muestra los dos untracked preexistentes (`.gitkeep`, `.planning/research/.cache/`).

## Fixed Issues

### CR-01: el lockstep se quedaba VERDE para la forma exacta de antes de la fase

**Files modified:** `tests/count-arrays-lockstep.test.js`, `README.md`, `tests/domain.test.js`,
`tests/word-groups.test.js`, `tests/song-validator.test.js`
**Commit:** `5e90f23`

**Applied fix.** El snippet del revisor se tomó como hipótesis y se cambió en tres puntos, todos
por medición previa:

1. **Nada se transcribe.** El reconocedor se construye desde `INVOCACION_CANONICA`
   (`CABECERA_COMANDO` = sus 2 primeros tokens), no con un `node --test` literal. El literal del
   revisor se autodelataba: la propia línea que lo declaraba producía una invocación no canónica y
   un falso rojo sobre el fichero del gate.
2. **Delimitadores medidos, no supuestos.** Se añadió `#` al conjunto de corte. Sin él,
   `it-add-song/SKILL.md:263` (`… tests/fixtures/*.test.js        # verde`) se clasificaba como NO
   canónica: falso rojo sobre un fichero correcto.
3. **La exención es una MARCA, no una heurística sobre la prosa.** El review sugería «saltar toda
   línea que contenga `PROHIBIDA` / `NO \`node --test`». Se descartó: adivinar la intención del
   texto es la misma fragilidad que la fase paga, y convierte cualquier reescritura del párrafo en
   un falso verde. Se declara con la marca literal `FORMA-PROHIBIDA`, que hoy llevan 10 líneas (el
   párrafo de `README.md`, los 3 avisos de cabecera, el catálogo de las 4 formas medidas y los 2
   goldens `SRC_TRAMPA`).

**Limitación DECLARADA, no prometida.** Una mención a pelo (`node --test` sin argumentos) no se
juzga. En este árbol hay 7 y las 7 son referencias en prosa al runner («no es testeable bajo
node --test»). Pero `node --test` a pelo es TAMBIÉN una de las 4 formas prohibidas por D-45-01, así
que esa forma queda fuera de la vigilancia del gate. Separarla de la referencia en prosa exigiría
una heurística sobre la prosa. Está escrito en el código, y el título del test se cambió a «en
TODAS sus **invocaciones con argumentos**» — el título anterior era parte del defecto.

**Verificación por mutación** (`node --test tests/count-arrays-lockstep.test.js`):

| Mutación | Antes | Después |
|---|---|---|
| MUT6: una de las dos canónicas de README → `node --test tests/` | `# pass 39 / # fail 0` | **`# tests 36 / # fail 1`, exit 1** — `README.md: invocacion(es) NO canonicas sin marcar → 30: node --test tests/` |
| MUT1: cabecera de test NUEVA con `node --test tests/` | `# fail 0` | **`# fail 1`, exit 1** — `tests/zz-mutante.test.js:4: node --test tests/` |
| MUT2: cabecera NUEVA con `node --test --recursive tests/` | `# fail 0` | **`# fail 1`, exit 1** — `tests/zz-mutante.test.js:4: node --test --recursive tests/` |
| Control: cabecera NUEVA con la canónica | verde | verde (`# pass 36`) — sin falso rojo |
| Control: la misma forma mala CON la marca en la línea | — | verde — el escape hatch funciona |
| MUT24: TODAS las de README degradadas | rojo por mudez | rojo por mudez **y** por forma (los dos diagnósticos) |

En los tres rojos el runner reporta `# tests 36`, no `# tests 1`: es la aserción nombrada la que
falla, no un fallo de carga.

### CR-02: el gate de DEUDA-03 era ciego a la COLA del reporter

**Files modified:** `tests/count-arrays-lockstep.test.js`
**Commit:** `6b7fe28`

**Applied fix.** Se adoptó el guard diferencial que el revisor propuso (`sinComentariosNaive` +
`deepEqual` de las versiones que ven los dos reconocedores), que es el que él mismo verificó por
mutación tras descartar su primer candidato. Se añadió además la limitación que la cabecera de
`sinComentarios` no nombraba: **las líneas de continuación de un template literal multilínea se
escanean como CÓDIGO**, así que el reset por línea no es solo una virtud — tiene un precio, y ese
precio es el segundo agujero. La cabecera lo presentaba solo como acotación del daño.

**La vulnerabilidad se reprodujo ANTES de arreglarla**, y el punto de inyección importó: con el
literal de regex inyectado justo tras `CATEGORIES` (línea 286) el test SÍ se ponía rojo — pero por
la cláusula de no-vacuidad, porque el primer `console.error` del reporter está en la 304 y no
sobrevivía ningún emisor. Es decir, ese punto no reproduce el bug. Inyectando tras el primer
`console.log` top-level (459), los emisores sobreviven, la no-vacuidad no dispara y sale
`# pass 36 / # fail 0`: ahí es donde el defecto vive.

**Verificación por mutación:**

| Mutación | Antes | Después |
|---|---|---|
| MUT20: `const RE_GLOB = /tests\/*.test.js/;` tras el primer emisor + `console.log('… milestone v1.1.')` en la cola | **`# tests 36 / # pass 36 / # fail 0`, exit 0** | **`# tests 37 / # fail 1`, exit 1** — `el escaner … y el reconocedor naive DISCREPAN` |
| MUT21: template literal multilínea con `https://example.test/x — … milestone v1.1` en la continuación | **`# pass 36 / # fail 0`, exit 0** | **`# tests 37 / # fail 1`, exit 1** — mismo guard |
| MUT11 (control): `v1.1` en una línea de salida normal | rojo | rojo — el gate base sigue mordiendo (`escriben una version de milestone A MANO`) |
| Árbol limpio | — | verde: los dos reconocedores coinciden, sin falso rojo |

**Alcance escrito en el propio test:** el guard compara lo que los dos reconocedores dicen sobre
las líneas QUE ESCRIBEN UNA VERSIÓN, no el fichero entero. Si el escáner blanquease una cola sin
ninguna versión, calla — y es correcto que calle: no hay nada escondido. Dispara el día que
aparezca una versión en la parte blanqueada, que es el día que importa.

### WR-01: el gate de trazabilidad certificaba «0 duplicados» sin comprobar duplicados

**Files modified:** `tests/requirements-traceability.test.js`
**Commit:** `e5c4430`

**Applied fix.** El snippet del revisor era correcto y se adoptó, con un cambio: va en su **propio
test** en vez de anexado al de la cifra. Motivo medido — la comprobación necesita `idsMapeados` Y
`idsDefinidos`, y la cláusula de no-vacuidad de `idsDefinidos` vive en el tercer test, no en el
segundo; colgarla del test de la cifra la habría dejado sin su propia no-vacuidad.

**Verificación por mutación:**

| Mutación | Antes | Después |
|---|---|---|
| MUT18: fila `DEUDA-03` DUPLICADA + `Coverage: 27/27` | `# pass 39 / # fail 0` | **`# tests 4 / # fail 1`, exit 1** — `DEUDA-03: fila de trazabilidad DUPLICADA` |
| Árbol limpio | verde | verde (`# tests 4 / # pass 4`) |

### WR-02: `gsd-validate-batch/SKILL.md` — artefacto EJECUTABLE con milestone, cifras y comando muertos

**Files modified:** `.claude/skills/gsd-validate-batch/SKILL.md`, `tests/count-arrays-lockstep.test.js`
**Commit:** `683c96f`

**Applied fix.** Las instrucciones (`:19`, `:21`, `:438`, `:477`, `:482`, `:626`) dejan de
transcribir «271 ejercicios», «7 archivos», «3 sub-gates» y el comando de cierre con milestone
pegado, y pasan a remitir a la salida del reporter, que sí deriva del disco. `:529` (el coste de
`Task()` cifrado en Phase 10) se **fecha como historia** en vez de reescribirse: era una decisión
de aquel momento, no una afirmación sobre el corpus de hoy.

**Sobre el gate que WR-02 sugería de paso — decisión y motivo, porque el prompt pedía registrarla.**

- **SÍ se gateó** la forma deprecada del comando (`/gsd:complete-milestone`, dos puntos, que
  D-45-11 sustituyó por la de guion): bloque 8 nuevo sobre los 4 artefactos ejecutables. Es una
  prohibición pura —no una cifra ni una versión—, sin ninguna excepción legítima en un artefacto
  que un agente copia y ejecuta. `.planning/` queda fuera a propósito: allí la forma vieja aparece
  en decenas de registros históricos y reescribir el pasado sería el defecto contrario.
- **NO se gateó** la versión de milestone en esos ficheros. Se midió el inventario después de
  limpiar: los `v1.1` que quedan en `gsd-validate-batch/SKILL.md` son (a) parte de una RUTA real
  del disco (`.planning/milestones/v1.1-phases/…/09-VALIDATION-PROMPT.md`), que tiene que quedarse
  verbatim o el documento manda a leer un fichero inexistente, y (b) prosa histórica fechada. Un
  gate del corte del bloque 7 exigiría una exención por cada una, y una exención por caso es un
  gate verde por construcción. El motivo queda escrito en el propio fichero de tests para que
  nadie lo lea como un olvido.

**El gate cazó una ocurrencia que la edición manual había dejado pasar** — y era mía: la nota
explicativa que añadí en `:633` citaba la forma deprecada verbatim. Se reescribió describiéndola
sin escribirla, en vez de añadirle una exención: la prohibición se queda absoluta.

**Verificación por mutación:**

| Mutación | Resultado |
|---|---|
| Reintroducir `/gsd:complete-milestone v1.1` en `it-add-song/SKILL.md` | **`# tests 38 / # fail 1`, exit 1** — `.claude/skills/it-add-song/SKILL.md:322` |
| Árbol limpio | verde (`# tests 38 / # pass 38`) |

### WR-03: el README seguía con la etiqueta «Phase 10» y un `271` que se contradecía

**Files modified:** `README.md`
**Commit:** `fbad0c8`

**Applied fix.** `:115` pasa a describir el reporter por lo que hace (deriva el milestone y los
conteos del disco y los imprime) en vez de por una fase que dejó de significar algo hace cuatro
milestones, y nombra el `271` del fichero como histórico. `:111`/`:113`/`:114` sueltan también sus
etiquetas «Phase 9/10». En `:92-94` se tomó **la primera de las dos opciones** que el review
ofrecía: fechar la sección como historia (`## Validación editorial (nació en el milestone v1.1)`),
que es el trato que el reporter da a su propio historial contable, y quitar el `271` que
contradecía a `:98` dos párrafos más abajo en la misma pantalla.

**Verificación:** `grep -n "Phase 10\|271 ejercicios\|Phase 9 skill" README.md` → sin resultados.
El README sigue siendo call-site del gate de lockstep y sus 2 invocaciones canónicas siguen
intactas (`# fail 0`).

### WR-04: el fail-soft afirmaba «las dos causas son reales» y hay una tercera

**Files modified:** `scripts/run-validation-271.mjs`, `tests/count-arrays-lockstep.test.js`
**Commit:** `8dc3a6f`

**Applied fix.** Se adoptó la estructura del revisor (dos lecturas: una para el dato, otra para el
diagnóstico) con dos añadidos propios:

1. **La línea diagnóstica se SANEA antes de imprimirse** (`replace(/[\x00-\x1F\x7F]/g, '')` +
   `slice(0, 80)`). El comentario del fichero ya razonaba que capturar el resto de la línea
   permitiría inyectar un banner arbitrario en la salida que el autor lee para decidir un cierre de
   milestone; el diagnóstico es justo el sitio donde ese resto de línea llega a pantalla, así que
   hereda la cautela. `[^\n]*` no cruza saltos de línea, pero una secuencia ANSI en `STATE.md`
   repintaría el banner.
2. **La misma distinción, réplicada en el `throw` de `milestoneEnDisco()`**, que tenía el mismo
   diagnóstico falso.

**Verificación por mutación** (las TRES causas, cada una con su mensaje):

| Causa | Reporter | Suite |
|---|---|---|
| **3 (la nueva)** `milestone: v2.0 final` | `No se pudo derivar: .planning/STATE.md declara \`milestone: v2.0 final\`, que no es un token único` — exit **0** | rojo: `…declara \`milestone: v2.0 final\`, y eso no es un token unico…` — exit 1 |
| 2 — sin clave | `…existe pero no declara ninguna clave milestone` — exit **0** | rojo con el mensaje de clave ausente |
| 1 — falta el fichero | `…falta el fichero .planning/STATE.md` — exit **0** | rojo (mensaje de lectura) |

**Antes del arreglo**, la causa 3 imprimía «las dos causas son reales: o falta el fichero, o no
declara la clave milestone» con la clave declarada delante, y la suite lanzaba «existe pero no
declara ninguna clave `milestone:`». Los dos mandaban al autor a buscar lo que tenía a la vista.

**Polaridad preservada y verificada:** el reporter sigue fail-soft (exit 0, tabla completa) en las
tres causas; la suite sigue fail-loud (exit 1).

### WR-05: la exención del propio fichero iba con una justificación falsa

**Files modified:** `tests/count-arrays-lockstep.test.js`
**Commit:** `23829ad`

**Applied fix.** Se tomó **la segunda de las dos vías** que el review ofrecía —meter
`tests/count-arrays-lockstep.test.js` en `CALL_SITES_INVOCACION`— y se **descartó la primera**, el
snippet `SIN_GOLDENS` que filtraba líneas por `/^\s*(const SRC_TRAMPA|\s+console\.log\('  VAL_07)/`.
Motivo: ese filtro es un reconocimiento de la forma textual de dos líneas concretas, y se rompe en
silencio en cuanto alguien reindenta o renombra el golden — sustituye una exención demasiado ancha
por una demasiado frágil. Con la marca `FORMA-PROHIBIDA` de CR-01 ya en su sitio, la exención
global de 1448 líneas se pudo **eliminar entera**: lo que legítimamente escribe formas malas lo
declara línea a línea.

Así la afirmación del comentario («el test de arriba ya exige que este fichero declare
`INVOCACION_CANONICA`») pasa a ser cierta, que es lo que WR-05 pedía.

**Verificación por mutación:**

| Mutación | Antes | Después |
|---|---|---|
| MUT22: la cabecera del PROPIO fichero (`:12`) degradada a `node --test tests/` | `# pass 36 / # fail 0` | **`# tests 36 / # fail 1`, exit 1** — `tests/count-arrays-lockstep.test.js: … → 12: node --test tests/` |

## Skipped Issues

Ninguna. Los 7 hallazgos en alcance se arreglaron y se verificaron por mutación en las dos
direcciones.

## Fuera de alcance (`fix_scope: critical_warning`)

Los 4 INFO del review siguen abiertos y sin tocar: **IN-01** (la no-vacuidad del bloque 3-ter es un
suelo de corpus, no por fuente), **IN-02** (la enumeración de tests solo mira `tests/`), **IN-03**
(8 de 29 ficheros no documentan la canónica y el gate solo prohíbe la forma mala — la regla no está
decidida), **IN-04** (la suite depende de dos documentos de `.planning/`, y `/gsd-cleanup` archiva
directorios de ahí).

Nota sobre IN-03: la regla de forma de este arreglo **sigue permitiendo el silencio** —solo castiga
la forma mala sin marcar—, así que IN-03 sigue describiendo el estado real. El título del test se
cambió para no prometer más de lo que hace, pero la decisión de fondo (¿toda cabecera de `tests/`
debe documentar la canónica, sí o no?) es del autor y no se tomó aquí.

---

_Fixed: 2026-08-13_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
