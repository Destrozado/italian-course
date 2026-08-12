---
phase: 45
phase_name: "Deuda del arnés de tests"
project: "Italian Course — Ejercicios A1/A2"
generated: "2026-08-13"
counts:
  decisions: 11
  lessons: 12
  patterns: 10
  surprises: 8
missing_artifacts:
  - "45-UAT.md"
---

# Phase 45 Learnings: Deuda del arnés de tests

> **La lección que resume la fase.** El patrón que venía a pagar —un arnés que no vigila lo que su
> propia prosa dice que vigila— se reprodujo **cinco veces dentro de la propia fase**, y las cinco
> se cazaron corriendo la mutación, nunca leyendo. Un SUMMARY que dice «gate cerrado» no es
> evidencia de que el gate muerda.

## Decisions

### D-45-01 — La invocación canónica lleva los DOS globs, explícitos

`node --test tests/*.test.js tests/fixtures/*.test.js`. Ni `tests/`, ni `--recursive`, ni `**` sin
comillas.

**Rationale:** medido en las cuatro combinaciones de shell y comillado. `node --test --recursive
tests/` **no existe** en v22.20.0 (`node: bad option`), y `node --test "tests/**/*.test.js"` sin
`globstar` degrada a `*` y corre 63 de 1164 tests con **exit 0** — verde silencioso. La forma de
dos globs explícitos es la única correcta bajo los cuatro regímenes.
**Source:** 45-RESEARCH.md, 45-01-PLAN.md

---

### D-45-03 — Las ~20 cabeceras de `tests/` entran en el lockstep, no se declaran no-contractuales

**Rationale:** dejar 19 cabeceras documentando la forma ciega es el patrón que la fase paga, al
revés. Y las tres que decían `node --test tests/` no eran prosa obsoleta sino una instrucción que
**falla** en Node 22.20. El coste es mecánico y una regla de prefijo derivada de
`INVOCACION_CANONICA` lo congela sin trabajo humano futuro.
**Source:** 45-01-PLAN.md

---

### D-45-04 — Ninguna cifra de conteo se transcribe; el invariante documentado es `# fail 0` + exit 0

**Rationale:** la alternativa —escribir `1167` en el README— es literalmente el CR-01 de la Phase 44
reencarnado. Las cifras viven solo en los SUMMARY, fechadas y como medición. El arnés no assertó
ningún conteo nuevo.
**Source:** 45-01-SUMMARY.md (Desviación 3)

---

### D-45-05 — DEUDA-02 por Opción A (reformar el array), no por Opción B (enseñar al extractor)

`CATEGORIES_WITH_EXPLANATIONS` declara par `slug:` + `file:` en la misma línea y en ese orden.

**Rationale:** cero regex nueva que mantener, cobertura por los **dos** gates en vez de por uno
(entra por la rama de pares, así que el cruce `fare-ind` queda cazado gratis), y las tres fuentes
quedan estructuralmente idénticas — que es lo que hará que la cuarta se enganche sin pensar. Ambas
opciones se prototiparon, corrieron y mutaron en research antes de elegir.
**Source:** 45-02-SUMMARY.md, 45-RESEARCH.md

---

### D-45-06 — WR-07 sí, WR-12 no

**Rationale:** WR-07 (el ancla `slug:\s*` cruzando saltos de línea) era obligatorio aquí porque la
Opción A pone ese ancla a gobernar tres fuentes. WR-12 es ortogonal a DEUDA-02, la Opción A no lo
agrava, y su fix cambiaría la semántica de un assert que hoy pasa: riesgo sin criterio de éxito que
lo pida. Queda como deuda viva **por escrito**, no por olvido.
**Source:** 45-02-SUMMARY.md

---

### D-45-07 — La prosa se redacta en términos de `COUNT_ARRAY_SOURCES`, no enumerando un número

**Rationale:** el plan pedía sustituir «las DOS fuentes» por «las TRES». Escribir «tres» se queda
corto el día de la cuarta. Redactarlo contra el identificador hace que el texto **no envejezca** —
incluidos los nombres de los `describe` y de los tests.
**Source:** 45-02-SUMMARY.md

---

### D-45-08 / D-45-11 — El milestone activo se deriva de `.planning/STATE.md` frontmatter

**Rationale:** `.planning/MILESTONES.md` parece la fuente pero registra solo milestones
**shipped** (el último, v1.9): derivar de ahí cambiaría un retraso de 4 milestones por uno de 1.
`STATE.md` lleva `milestone: v2.0`, está en git y es la única fuente viva.
**Source:** 45-RESEARCH.md, 45-03-SUMMARY.md

---

### D-45-09 — El `271` del nombre `run-validation-271.mjs` es deuda ACEPTADA, no rename

**Rationale:** 17 call-sites load-bearing, dos de ellos dentro del propio gate; y el historial
dejaría de ser grepeable. El ROADMAP acota DEUDA-03 a «encabezado y pie». Mitigación entregada: la
cabecera del fichero declara que el número es histórico, dónde vive el conteo real y por qué no se
paga aquí. Registrado en `.planning/WINDOWS.md`.
**Source:** 45-03-SUMMARY.md, 45-VERIFICATION.md

---

### D-45-12 — El gate de versión mira TODA línea no-comentario, no solo las que contienen `console.log`

**Rationale:** en un fichero que ya no debe nombrar ninguna versión a mano, cualquier versión fuera
de un comentario es la infracción. Estrictamente más ancho, sin el hueco de las llamadas multilínea,
y los comentarios siguen exentos para que el historial contable pueda nombrar milestones viejos.
**Source:** 45-03-SUMMARY.md (Desviación 1)

---

### D-45-15 — El gate de trazabilidad caza la edición a medias, no la ausencia total; la limitación va en la cabecera del test

**Rationale:** ampliarlo a `ROADMAP.md` es alcance nuevo. Pero atribuirle una garantía que no da
sería prosa más confiada que el código — el pecado exacto de la fase. Se escribió bajo el epígrafe
«LO QUE ESTE GATE SÍ CAZA Y LO QUE NO».
**Source:** 45-04-SUMMARY.md (Desviación 1)

---

### D-45-16 — El lockstep documental CUENTA ocurrencias, no hace `includes()`

`menciones(texto)` → `{canonicas, cortas}` por resta de prefijos. Exige `canonicas ≥ 1` (no-vacuidad
por fichero) **y** `cortas === 0`.

**Rationale:** con `includes()`, un fichero con dos invocaciones y una sola actualizada pasaba en
verde — la otra ocurrencia seguía conteniendo la cadena. Ver Lessons.
**Source:** 45-01-SUMMARY.md (Desviación 1)

---

## Lessons

### Un gate que no puede ponerse rojo ante su propio caso de uso es la especie de CR-01 que se está pagando

Ocurrió **cinco veces** en esta fase, cada una encontrada por mutación y ninguna por lectura:
el lockstep con `includes()` (ola 1), el esqueleto de test del research (ola 3), el cruce
definiciones ↔ mapeos (ola 4), y los **dos** gates críticos que el code review halló vacuos y que
los cuatro SUMMARY daban por cerrados.

**Context:** la moraleja operativa es que la afirmación «este gate vigila X» solo vale acompañada
del rojo observado. En cuatro de los cinco casos la prosa era sincera y el código no la cumplía.
**Source:** 45-01-SUMMARY.md, 45-03-SUMMARY.md, 45-04-SUMMARY.md, 45-REVIEW.md

---

### `git checkout -- <fichero>` como recipe de revert destruye la tarea, no la mutación

Con el trabajo de la tarea **sin committear**, el checkout revierte la mutación *y* la tarea,
dejando el fichero en el estado de HEAD. Detectado con `grep -c "^  { slug: '"` → `0`.

**Context:** el arreglo es copia de trabajo en scratchpad antes de cada mutación, o committear
antes de mutar. `git checkout` solo es seguro sobre ficheros limpios en HEAD. Volvió a morder en la
ola 4 pese a estar escrito.
**Source:** 45-02-SUMMARY.md (Desviación 1)

---

### Un fallo de CARGA no es un gate poniéndose rojo

Una sustitución con `perl` se comió el escape de un backtick y rompió el template literal. El runner
devolvió `not ok 1 - <fichero>` / `# tests 1` / `exit=1`. Es rojo, y no vale.

**Context:** aceptarlo habría sido el vicio exacto de la fase — un rojo plausible en vez del rojo
real. El discriminante barato: si el runner reporta `# tests 1`, has roto el fichero; el rojo bueno
reporta el total normal con `# fail 1` y **nombra la aserción**.
**Source:** 45-02-SUMMARY.md (Desviación 2)

---

### La hipótesis CRLF sobre `\S+` era falsa, y se dejó escrito para que nadie «arregle» lo que no está roto

`\r` **es** whitespace, luego `\S` lo excluye por definición y `[^\S\n]` lo absorbe antes del `$`.
La trampa CRLF real vive en `(.+)$` / `(.*)$`, porque `.` no casa `\n` pero **sí** casa `\r`.

**Context:** el plan y el research la daban por cierta. Verificado con `cat -A` sobre un `STATE.md`
convertido a CRLF: el banner cierra sin `^M` embebido.
**Source:** 45-03-SUMMARY.md (edge `encoding`)

---

### Fail-loud a nivel de módulo o dentro del test: depende de cuántos tests necesitan la referencia

En el plan 45-03 la lectura se movió **dentro** del test (a nivel de módulo, mover `STATE.md`
tumbaba los 36 tests del fichero con un fallo de carga). En el 45-04 se hizo lo contrario, a nivel
de módulo, porque la referencia la necesitan **los tres** tests del fichero y no hay nada que salvar
tumbando solo uno.

**Context:** la regla no es «siempre módulo» ni «siempre dentro»; es *qué fracción del fichero
queda inservible sin la referencia*. En ambos casos el motivo va escrito en el código.
**Source:** 45-03-SUMMARY.md (Desviación 2), 45-04-SUMMARY.md (Desviación 4)

---

### El punto de inyección de una mutación decide si reproduce el bug o un rojo por otra causa

Inyectando el literal regex justo tras `CATEGORIES` (línea 286) el test **sí** se ponía rojo — pero
por la cláusula de no-vacuidad, porque el primer `console.error` está en la 304 y no sobrevivía
ningún emisor. Ese punto no reproduce el defecto. Tras el primer `console.log` top-level (459) los
emisores sobreviven, la no-vacuidad no dispara, y sale `# pass 36 / # fail 0`: ahí vive el bug.

**Context:** un rojo por la causa equivocada certifica que el gate funciona cuando no lo has
probado. Hay que leer **qué** aserción falló, no solo que algo falló.
**Source:** 45-REVIEW-FIX.md (CR-02)

---

### Un snippet propuesto por un revisor puede autodelatarse dentro del fichero que arregla

El reconocedor que proponía el review contenía un `node --test` **literal**: la propia línea que lo
declaraba producía una invocación no canónica y un falso rojo sobre el fichero del gate. Se
reconstruyó derivándolo de `INVOCACION_CANONICA`.

**Context:** tercera confirmación en este repo de que un fix de code review es hipótesis, no
evidencia (Phase 44: 2 de 4 snippets incorrectos, uno peor que el bug). El propio revisor de esta
fase descartó su primer candidato para CR-02 tras medirlo.
**Source:** 45-REVIEW-FIX.md (CR-01)

---

### Los delimitadores de un reconocedor se miden, no se suponen

Sin añadir `#` al conjunto de corte, `it-add-song/SKILL.md:263`
(`… tests/fixtures/*.test.js        # verde`) se clasificaba como NO canónica: falso rojo sobre un
fichero correcto.
**Source:** 45-REVIEW-FIX.md (CR-01)

---

### Adivinar la intención desde la prosa es la fragilidad que se está pagando; usa una marca literal

El review sugería «saltar toda línea que contenga `PROHIBIDA` / `NO \`node --test`». Se descartó:
cualquier reescritura del párrafo se convierte en un falso verde. Se declaró con la marca literal
`FORMA-PROHIBIDA`, que hoy llevan 10 líneas.
**Source:** 45-REVIEW-FIX.md (CR-01)

---

### Un requisito ausente de las DOS mitades de un documento lo deja internamente consistente

El plan y el revisor de planes afirmaban que el cruce definiciones ↔ mapeos «es literalmente lo que
habría cazado que DEUDA-01/02/03 no existieran». Medido contra el estado real anterior
(`git show HEAD~1:.planning/REQUIREMENTS.md`, 23/23): `# pass 3 / # fail 0 / exit=0`.

**Context:** un gate que cruza dos mitades entre sí no puede echar de menos lo que no aparece por
ningún lado. Lo que sí caza —y es el modo de fallo realista— es la **edición a medias**.
**Source:** 45-04-SUMMARY.md (Desviación 1), confirmado independientemente en 45-VERIFICATION.md

---

### `state.record-metric` AÑADE, no actualiza

Una continuación que re-registra una métrica deja **dos filas** de la misma fase/plan en silencio.
Pasó al reanudar el plan 45-03 tras el checkpoint humano.
**Source:** 45-03-SUMMARY.md

---

### Los IDs de decisión colisionan cuando plan-time y run-time los asignan en paralelo

`45-02-PLAN.md` reservó `D-45-05` al planificar; el plan 45-01, al descubrir en ejecución que su
lockstep era vacuo, registró su decisión improvisada con el mismo ID. Peor: la propuesta de arreglo
(renumerar a `D-45-08`) quedó **inservible** porque el plan 45-03 reclamó `D-45-08` antes de que
nadie la aplicase.

**Context:** un ejecutor no debe tocar SUMMARY ajenos, así que la colisión solo puede resolverse en
el cierre de fase — y para entonces el espacio de IDs ya se ha movido. Resuelto renumerando la
improvisada a `D-45-16` (primer ID libre).
**Source:** 45-02-SUMMARY.md (Desviación 4), 45-VERIFICATION.md

---

## Patterns

### Verificación por mutación: mutar → correr → ver el ROJO → transcribir verbatim → revertir

El criterio de aceptación exige el rojo **observado y transcrito** (mensaje + exit code), no que la
suite siga verde. 21 rojos observados en la fase (5 + 7 + 9 en las tres primeras olas, 5 en la
cuarta), todos revertidos con `git status` limpio después.

**When to use:** siempre que se afirme que un gate vigila algo. Es el único estándar de prueba que
distinguió los cinco gates vacuos de los que muerden.
**Source:** los 4 SUMMARY, 45-VERIFICATION.md

---

### Cláusula de no-vacuidad primero, con la referencia derivada del disco

Todo gate que enumera empieza comprobando que la enumeración **no está vacía**, y la cifra de
referencia se lee del disco (`content/categories.json`, el árbol de ficheros), nunca se escribe.

**When to use:** en cualquier gate basado en enumeración o regex. Sin ella, un reconocedor que deja
de casar pasa en verde certificando nada.
**Source:** 45-01-SUMMARY.md, 45-02-SUMMARY.md, 45-03-SUMMARY.md

---

### Lockstep documental por conteo de ocurrencias, no por `includes()`

Como la forma canónica **empieza** por el prefijo, cada canónica aporta exactamente una ocurrencia
de prefijo; la resta deja las que se quedaron cortas. Se expresa como un `includes` **positivo**
sobre la cadena completa, sin ningún negative-grep.

**When to use:** cuando un fichero puede contener el mismo contrato más de una vez. Un `includes()`
es ciego a la regresión parcial.
**Source:** 45-01-SUMMARY.md (D-45-16)

---

### Guard diferencial: dos reconocedores y un `deepEqual` entre lo que ven

`sinComentarios` vs `sinComentariosNaive`; si discrepan sobre las líneas que escriben una versión,
rojo. No compara el fichero entero: dispara el día que aparezca una versión en la parte blanqueada,
que es el día que importa.

**When to use:** cuando un escáner puede desincronizarse de la realidad de forma parcial (estado de
bloque abierto por un literal regex, continuaciones de template literal escaneadas como código).
**Source:** 45-REVIEW-FIX.md (CR-02)

---

### Redactar la prosa contra el identificador, no contra el número

«las fuentes declaradas en `COUNT_ARRAY_SOURCES`» en vez de «las TRES fuentes» — nombres de test
incluidos.

**When to use:** en cualquier comentario o título que enumere. Es la diferencia entre prosa que
envejece con la siguiente alta y prosa que no.
**Source:** 45-02-SUMMARY.md (D-45-07)

---

### Convergencia de forma entre fuentes hermanas

Las tres fuentes de conteo declaran par `slug` + `file` **en la misma línea y en ese orden**, con la
silueta de `CATEGORIES` en el reporter.

**When to use:** cuando un extractor común tiene que parsear varias fuentes. Hacer converger la
forma cuesta menos que enseñarle una segunda forma, y la cuarta fuente se engancha sin pensar.
**Source:** 45-02-SUMMARY.md, 45-PATTERNS.md

---

### Marca literal como escape hatch, nunca heurística sobre la prosa

`FORMA-PROHIBIDA` en la línea exime; ninguna palabra del párrafo lo hace.

**When to use:** siempre que un gate necesite excepciones. Una heurística de prosa convierte
cualquier reescritura en un falso verde.
**Source:** 45-REVIEW-FIX.md (CR-01)

---

### Mutar sobre copia en scratchpad, no sobre el árbol con trabajo sin committear

**When to use:** siempre que la tarea aún no esté committeada. `git checkout --` revierte la tarea,
no la mutación.
**Source:** 45-02-SUMMARY.md

---

### Escribir la limitación del gate en la cabecera del propio gate

Epígrafes tipo «LO QUE ESTE GATE SÍ CAZA Y LO QUE NO», y ajustar el **título del test** cuando
promete de más («en TODAS sus menciones» → «en TODAS sus invocaciones con argumentos»).

**When to use:** cuando un gate tiene un hueco conocido. El título que promete de más es parte del
defecto, no una etiqueta inocente.
**Source:** 45-04-SUMMARY.md, 45-REVIEW-FIX.md

---

### Fail-soft para la etiqueta cosmética, fail-loud para la referencia estructural

Con `.planning/STATE.md` ausente el reporter imprime «milestone desconocido», las **18 filas
completas** y `exit=0`. La etiqueta cosmética no se convierte en blocker. El diagnóstico nombra las
**dos** causas reales (falta el fichero / no declara la clave), porque atribuir una sola es un
diagnóstico plausible y falso.

**When to use:** cuando un script de reporte lee un fichero de planning. Que muera porque un fichero
se movió es peor que degradar.
**Source:** 45-03-SUMMARY.md (WR-09, Desviación 4)

---

## Surprises

### El patrón que la fase venía a pagar se reprodujo cinco veces dentro de ella misma

**Impact:** define el valor real de la fase. Ninguno se detectó leyendo; los cinco por mutación. Dos
de ellos (los críticos del code review) ya estaban dados por cerrados en cuatro SUMMARY, y habrían
pasado a producción con la fase en verde.
**Source:** 45-01-SUMMARY.md, 45-03-SUMMARY.md, 45-04-SUMMARY.md, 45-REVIEW.md

---

### DEUDA-01 eran DOS ficheros huérfanos, no uno

`tests/fixtures/slot-variants.test.js` (19 tests) estaba huérfano junto al que el ROADMAP nombra (44).
El delta real es **+63 → 1164**, no +44.

**Impact:** sin declararlo, el salto de conteo habría parecido inexplicado en ejecución.
**Source:** 45-RESEARCH.md

---

### El fix que `44-REVIEW.md` proponía para WR-06 no existe

`node --test --recursive tests/` → `node: bad option: --recursive` en v22.20.0.

**Impact:** planificar desde ese review como si fuera spec habría quemado una tarea entera. Lo cazó
correr el comando, no razonarlo.
**Source:** 45-RESEARCH.md

---

### `node --test "tests/**/*.test.js"` es una trampa de verde silencioso

Sin `globstar` (el default de este shell), bash *y* `sh` degradan `**` a `*`: expande a los dos
ficheros de `tests/fixtures/` y corre **63 de 1164 tests con exit 0**.

**Impact:** la forma más obvia de arreglar DEUDA-01 era la peor — habría «cerrado» el gate dejando
1101 tests fuera, en verde.
**Source:** 45-RESEARCH.md

---

### El gate nuevo cazó una ocurrencia que el propio fixer acababa de introducir

Al explicar el comando deprecado lo citó verbatim. El gate de bloque 8 se puso rojo sobre su propio
autor. Lo reescribió en vez de exentarlo.

**Impact:** confirmación en vivo de que el gate muerde, en el peor momento posible para su autor —
que es el mejor momento posible para el proyecto. Mismo caso en la ola 3, donde dos `v1.1` escritos
por el propio ejecutor como «evidencia histórica» se retiraron.
**Source:** 45-REVIEW-FIX.md, 45-03-SUMMARY.md (Desviación 3)

---

### Las líneas de continuación de un template literal multilínea se escanean como CÓDIGO

El reset por línea de `sinComentarios` no es solo una virtud acotadora: tiene un precio, y ese
precio era el segundo agujero de CR-02. La cabecera lo presentaba solo como acotación del daño.

**Impact:** un `//` dentro de una URL en una continuación blanquea el resto de la línea y esconde un
literal de versión en salida impresa, con `# fail 0`.
**Source:** 45-REVIEW-FIX.md (CR-02)

---

### El plan 45-04 duró 8 minutos, no los ~35 que su ejecutor registró de memoria

Corregido antes de commitear (`496 s` de reloj).

**Impact:** anotado y no borrado, porque inflar una cifra en la fase que existe para pagar cifras
escritas a mano habría sido difícil de superar como ironía. Alimenta la calibración de estimaciones.
**Source:** 45-04-SUMMARY.md (Desviación 3)

---

### El esqueleto de test que el research entregó era vacuo sobre el código del plan que lo consumía

Filtraba por el token `console.log`; las llamadas **multilínea** emiten en líneas de continuación que
no lo contienen — y el pie que la tarea 1 escribe es exactamente esa forma.

**Impact:** el gate habría nacido ciego al código que existe para vigilar. Lo salvó que el research
lo marcó `[ASSUMED]` (no ejecutado) y la política del proyecto exige verificar por mutación antes de
adoptar.
**Source:** 45-03-SUMMARY.md (Desviación 1), 45-RESEARCH.md
