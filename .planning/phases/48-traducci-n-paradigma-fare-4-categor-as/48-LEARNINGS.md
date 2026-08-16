---
phase: 48
phase_name: "Traducción — paradigma `fare` (4 categorías)"
project: "Italian Course — Ejercicios A1/A2"
generated: "2026-08-16"
counts:
  decisions: 12
  lessons: 9
  patterns: 8
  surprises: 7
missing_artifacts:
  - "48-UAT.md"
---

# Phase 48 Learnings: Traducción — paradigma `fare` (4 categorías)

## Decisions

### D-48-13 — `opcion-a`: el español natural manda sobre la métrica

El contraste congiuntivo/indicativo que el italiano opone **no sobrevive al español** en 6 variantes
duras (+5 blandas) de `fare-congiuntivo`. Se decidió no forzar nunca el modo español, y declarar la
divergencia nombrada y contada. `SC-2` se reporta **cumplido CON excepción**, jamás a secas.

**Rationale:** el español obliga indicativo tras esos verbos matrices en afirmativa; la pérdida del
modo es diferencia obligada por la lengua, no defecto de traducción. La traducción es ayuda de
comprensión, no el mecanismo de enseñanza — el contraste lo enseñan el italiano y la `explanation`.
**Source:** 48-03-SUMMARY.md

### D-48-14 — la `opcion-b` se descarta AUNQUE tenía margen aparente

Conservar la señal en las 5 concesivas con «aunque hagamos» en vez de «aunque hacemos» parecía
gratis y no lo era.

**Rationale:** en español esos dos no son variantes estilísticas del mismo contenido — el segundo es
hipotético. `Benché` rige congiuntivo **siempre**, con hecho real o hipotético, así que el modo
italiano no porta ese matiz; espejarlo **inyecta** contenido ausente del original y es un defecto S2,
no una mejora. **Source:** 48-03-SUMMARY.md

### D-48-15 — enmendar el criterio de éxito a mitad de fase es mover la portería

La `opcion-c` (reescribir `SC-2` en el ROADMAP para excluir las variantes problemáticas) se descartó.

**Rationale:** si el texto del `SC-2` promete literalmente lo que el español no puede dar, eso es un
hallazgo para el plan de cierre o para el verificador, no una edición que haga el plan que tropieza
con él. **Source:** 48-03-SUMMARY.md

### D-48-05 / D-48-16 / D-48-21 — los concerns se cierran enmendando el doc, no con override

Tres veces en la misma fase, un concern sostenido se resolvió **escribiendo una aclaración
absolutoria en `docs/TRANSLATION-VALIDATION-PROMPT.md`** en lugar de reescribir el español, adjudicar
o forzar un override: el pronombre sujeto explícito (48-02), el modo obligado del congiuntivo
(48-03) y el condizionale composto como futuro del pasado (48-04).

**Rationale:** la firma de la `WINDOWS` id 37 — *marcar uno y aprobar idénticos* — identifica un
**hueco de criterios**, no ruido ni defecto del texto. El doc es el único fichero que el evaluador
lee, así que el arreglo tiene que vivir ahí. Las tres veces cerró en verde sin tocar un carácter del
español y sin un solo override. **Source:** 48-02-SUMMARY.md, 48-03-SUMMARY.md, 48-04-SUMMARY.md

### D-48-22 — donde el plan y la doctrina discrepan, manda la doctrina

El plan 48-04 escribió su propio disparador de escalada («DOS vendors marcando estructuras
idénticas»), **más estricto** que la doctrina de la id 37 («marcar uno y aprobar idénticos»). El
ejecutor aplicó su plan y recomendó override; el autor aplicó la doctrina y enmendó el doc.

**Rationale:** un disparador local más estricto que la doctrina del proyecto deja huecos abiertos que
la doctrina sí cierra. Y el fenómeno era **sistemático**: reaparecerá en las categorías restantes del
milestone, así que la enmienda cierra la clase entera y no la casilla. **Source:** 48-04-SUMMARY.md

### D-48-19 — precisión de D-48-03: el pronombre se omite *cuando la morfología identifica la persona*

La regla original («el español omite el pronombre; la morfología basta») se precisó: donde la forma
es **sincrética** para 1ª/3ª del singular, el pronombre **se escribe**. La lista no se restringe al
subjuntivo — incluye `hacía` (imperfecto de indicativo), `había hecho` (pluscuamperfecto) y `haría`
(condicional).

**Rationale:** una regla no se aplica donde su premisa no se cumple. Omitir el pronombre en una forma
sincrética deja la persona indeterminada, que es justo lo que la aclaración de S2 declara **no**
absuelto. **Source:** 48-03-SUMMARY.md

### D-48-20 / D-48-23 — la precisión tenía sujeto retroactivo, y se arregla en vez de aceptarse

4 variantes de `fare-indicativo` ya `validated` quedaron fuera del cumplimiento inmediato y
asignadas al plan de cierre con una exigencia escrita: **arreglarlas o aceptarlas formalmente; anotarlas
y seguir no cuenta como cierre.** El autor eligió arreglarlas, relajando **explícitamente y solo para
esas 4** el criterio de corpus byte-idéntico del propio plan 48-05.

**Rationale:** la cuenta de colisiones lo hizo visible mecánicamente — en el grupo «había hecho», las
dos hermanas de `fare-congiuntivo` escribían el pronombre y las dos de indicativo no. Eso no es
ambigüedad tolerable, es **inconsistencia interna del mismo bloque**. **Source:** 48-03-SUMMARY.md,
48-05-SUMMARY.md

### D-48-11 — el override de autor llega DESPUÉS del quórum, nunca en su lugar

`passato-remoto#4` se cerró invocando primero un tercer juez fresco y pinneado bajo el doc enmendado,
y **solo entonces** escribiendo el override. `passes[]` quedó con dos `correcta` de dos modelos y dos
vendors **antes** del override, con el `incorrecta` disidente vivo.

**Rationale:** es la barra estricta de la id 39 y no la débil de la id 35 — el override **resuelve**
una disidencia sobre un quórum que ya existe, en vez de fabricarlo. **Source:** 48-02-SUMMARY.md

### D-48-08 / D-48-09 — el cumplimiento literal de D-46-12, y el umbral que erró

El autor eligió **cumplimiento literal** sobre las 53 traducciones certificadas bajo el doc
pre-enmienda (106 llamadas), en vez de apoyarse en la direccionalidad absolutoria.

**Rationale:** el precedente de la tercera nota de D-46-12 dice que pagarlo destapa lo que un
argumento no destapa. El umbral de 40 que motivó la escalada era **un supuesto del coordinador, no
una instrucción del autor**, y erró el blanco por composición del sujeto: 206 con sujeto cero en los
cuerpos cerrados, 53 en vuelo. **Source:** 48-02-SUMMARY.md

### D-48-25 — las 6 hermanas del condizionale passato NO se uniforman

5 de futuro del pasado con condicional simple + 1 contrafactual con el compuesto.

**Rationale:** la coherencia intra-slot está subordinada a la fidelidad, por escrito. Uniformarlas
para que una heurística de calidad saliera verde era la amenaza `T-48-25` del propio registro.
**Source:** 48-04-SUMMARY.md

### D-48-26 (48-04) — `SC-2` se reporta NO CUMPLIDO para el participio de presente

El participio de presente italiano se rinde con la construcción que el español sí tiene (`en
funciones`, `que forman parte`), y para esas dos variantes el criterio se declara **no cumplido por
imposibilidad de la lengua**.

**Rationale:** declarar el incumplimiento es más barato que fabricar una forma española que no existe.
**Source:** 48-04-SUMMARY.md

### D-48-25 (48-05) / AR-48-02 — lo preexistente y ajeno se registra, no se arregla desde el cierre

Tres defectos se escalaron **sin arreglar** desde el plan de cierre: `GATE-03` con `disco 0` como
fallback de un `??`, la mayúscula inicial perdida en 36 ejercicios de 7 categorías, y la condición de
arranque seguro del servidor del checkpoint.

**Rationale:** arreglar un gate desde el plan que cierra la fase exige su propia mutación, y convertir
un cierre en un cambio de gate sin verificar es el modo de fallo documentado del proyecto (`T-48-39`).
**Source:** 48-05-SUMMARY.md, 48-SECURITY.md

---

## Lessons

### El quórum no ejerce lo que el doc RESERVA — solo lo que ABSUELVE

Tres falsos negativos de la fase (`a merenda` heredado de la 47, `passato#2`, y las 4 de persona
indeterminada) comparten una forma exacta: **el criterio existía, estaba escrito y estaba en el
payload — y el quórum no lo ejerció.** Los jueces reaccionan bien a lo que el doc absuelve (de ahí
los falsos positivos que obligaron a escribir cinco enmiendas absolutorias) y mal a lo que reserva.

**Context:** eso pone la debilidad justo en los **puntos de vigilancia**, que son lo único que impide
que una enmienda absolutoria sea un cheque en blanco. **Source:** 48-03-SUMMARY.md, 48-05-SUMMARY.md,
48-SECURITY.md

### El cumplimiento literal destapa cuando el sujeto tiene historia; sobre trabajo en vuelo, confirma

El precedente del proyecto —«pagarlo destapa lo que un argumento no destapa»— se cumplió en 48-02
(destapó el calco de `passato-remoto#5`) y **no** en 48-04, cuyas 10 llamadas volvieron limpias.

**Context:** no es fallo del método. El sujeto de 48-04 eran 5 variantes recién autoradas bajo las
enmiendas ya vigentes, no un cuerpo cerrado bajo un doc anterior. El corolario acota el precedente en
vez de contradecirlo: destapa *concerns que un modelo emite*, no *silencios que ningún modelo emite*.
**Source:** 48-04-SUMMARY.md

### Una mitigación procedimental que aguantó no es una amenaza cerrada

La auditoría partió las 37 amenazas `mitigate` en **29 code-enforced** y **8 procedural-only**. Las 8
se cumplieron porque el ejecutor fue diligente, no porque nada vaya a detener a quien venga después.

**Context:** `T-48-06`/`18`/`26` («invertir el ratchet del ancla») se apoyaban en un procedimiento
manual y `CR-01` demostró end-to-end que **ningún gate lo hacía cumplir**. Una clasificación a
profundidad grep habría certificado esa amenaza en verde leyendo su propio texto de mitigación.
**Source:** 48-SECURITY.md, 48-REVIEW.md

### `\b` de JavaScript no toca letras acentuadas — y falló cuatro veces con el mismo síntoma

`\bBenché\b` nunca casa; `\b(yo|él|ella)\b` devolvió 5 donde había 7. Ocurrió cuatro veces en la fase.

**Context:** las cuatro veces el síntoma fue idéntico — **una cifra plausible y MENOR que la real**,
cazada solo porque alguien conocía el número esperado. Los barridos usan ya lookarounds sobre
no-letra. **Source:** 48-03-SUMMARY.md, 48-05-SUMMARY.md

### `--adjudicar` permitía sobrescribir, pero no fijaba el veredicto

Escribía lo que devolviera el modelo, de modo que un motivo de refutación podía quedar colgando **de
la misma pasada que levanta el concern**, y el registro se leía como adjudicado sin estarlo.

**Context:** se descubrió al intentar cerrar `passato-remoto#4` y negarse a re-invocar al mismo juez
—que es re-tirar el dado sobre el fallo, lo que el `pass-guard` existe para impedir—. Cerrado en
48-05 con exit 4 propio. **Source:** 48-02-SUMMARY.md, 48-05-SUMMARY.md

### Un gate que se calcula, se imprime y no se cablea al veredicto es un gate que no existe

La prueba que más valió del arreglo de `CR-01` no fue que pasara, sino que **quitar
`&& anclaRatchetPass` de `gatePass` devolvía el verde falso** y ponía 2 tests en rojo.

**Context:** es la forma exacta del CR-03 de la Phase 44 sobre VAL-09. **Source:** 48-REVIEW-FIX.md

### El fix propuesto por un revisor es hipótesis, y a veces es peor que el bug

La dirección propuesta para `WR-04` (corregir el gloss) habría convertido el slot en **leak R1
inmediato**, porque el hueco de `-300` examina justamente el auxiliar. Y `WR-05` resultó ser un falso
hallazgo.

**Context:** dos de doce, la misma proporción que la Phase 44 registró. El dato decisivo salió
auditando el ledger: la sugerencia de `WR-05` es, palabra por palabra, la del pase que el autor
**rechazó** en el checkpoint de 48-02. **Source:** 48-REVIEW-FIX.md

### `.gitignore` impide que un secreto se commitee; no impide que se sirva

Un `npx serve` con raíz en el repositorio y bind wildcard expuso `.env` por HTTP durante ~3 h, dentro
de la ventana de ejecución del plan de cierre.

**Context:** la mitigación declarada cubría cabecera, URL, log y git — cuatro canales — y el canal
HTTP no estaba declarado como frontera. La Phase 47 **sí** lo tenía resuelto (`T-47-26`, aceptación
condicional con verificación de «sin listener» al cerrar) y el registro de la 48 se dejó la condición.
Causa próxima: el checkpoint pidió abrir la app sin decir cómo arrancarla de forma segura.
**Source:** 48-SECURITY.md

### Los IDs de decisión colisionaron entre dos planes

`48-04-SUMMARY.md` y `48-05-SUMMARY.md` usan ambos `D-48-21` … `D-48-26` para **decisiones
distintas** — seis colisiones. Nada las detecta.

**Context:** citar «D-48-23» en una fase futura es ahora ambiguo. Los IDs se asignan por plan sin
registro compartido, y el defecto es de la misma familia que el resto de la fase: un dato que nadie
deriva del disco. **Source:** 48-04-SUMMARY.md, 48-05-SUMMARY.md

---

## Patterns

### Enmienda absolutoria del doc en vez de override

Cuando un concern sostenido choca con una decisión del autor, escribir en el doc de criterios una
aclaración **estrictamente absolutoria** —que solo retire motivos-para-marcar, con cero imperativos
del tipo «marca como incorrecta si…»— y re-validar desde cero.

**When to use:** cuando aparece la firma de la id 37 (un modelo marca una variante y aprueba otras
estructuralmente idénticas). Cierra la clase entera, no la casilla, y no consume overrides. Cinco
`disputed` de esta fase se cerraron así.
**Source:** 48-02-SUMMARY.md, 48-03-SUMMARY.md, 48-04-SUMMARY.md

### La prueba de dos condiciones antes de re-validar

Ante una enmienda del doc: (1) **ausencia de sujeto** — contar del disco cuántas ya `validated` caen
bajo el criterio nuevo; (2) **direccionalidad absolutoria** — verificar **por grep** de los patrones
de endurecimiento que la enmienda solo retira motivos, nunca añade.

**When to use:** en toda enmienda de `docs/TRANSLATION-VALIDATION-PROMPT.md`. Decide si hace falta
cumplimiento literal de D-46-12 y con qué alcance. Verificar la condición 2, no declararla.
**Source:** 48-02-SUMMARY.md, 48-03-SUMMARY.md, 48-04-SUMMARY.md

### Barridos mecánicos propios ANTES del quórum

Correr comprobaciones mecánicas sobre el material propio antes de someterlo a los jueces: persona
indeterminada en formas sincréticas, y marco temporal cerrado con perfecto compuesto.

**When to use:** siempre, dado que el quórum tiene punto ciego demostrado en lo que el doc reserva.
En 48-04 el primero **cazó un defecto real mientras se autoraba**, sin gastar una llamada.
**Source:** 48-04-SUMMARY.md

### Verificar el barrido por mutación, no por que salga limpio

Un barrido que devuelve 0 hits es indistinguible de un barrido roto. Se le inyecta un defecto
conocido, se observa el rojo, se restaura y se observa el verde.

**When to use:** en todo barrido, gate o arnés de medida cuyo resultado se vaya a citar como
evidencia. Es la misma disciplina que el CR-01 de la Phase 44 impuso a los tests.
**Source:** 48-04-SUMMARY.md, 48-MUTACIONES-EVIDENCIA.md

### Trabajo adversarial con cero llamadas

Antes de gastar llamadas nuevas sobre un `disputed`, leer **lo que el propio objetor votó** en las
estructuras idénticas del mismo slot.

**When to use:** en cada `disputed`. En 48-04 resolvió la escalada entera sin una sola llamada: el
objetor había marcado 1 y aprobado 4. **Source:** 48-04-SUMMARY.md

### Observar el rojo intermedio al re-validar

Al resetear `passes[]` para re-validar, comprobar que el reporter pasa por `FAIL` antes de volver a
`PASS`.

**When to use:** en toda re-validación desde cero. Es la única prueba de que los pases se retiraron
de verdad; sin ella, el corpus podría ir de un verde a otro sin haber cambiado nada.
**Source:** 48-05-SUMMARY.md

### Ratchet histórico contra `HEAD` en vez de igualdad contra el disco

Para blindar un suelo que debe poder crecer pero nunca bajar, comparar cada valor contra **su valor
commiteado en `HEAD`**, no contra el disco.

**When to use:** cuando la doctrina dice «es un suelo, no una igualdad». Preserva el crecimiento en
verde, caza la edición a la baja, y no depende del disco — así el exploit de bajar el suelo *y*
borrar el dato (que deja `suelo == disco`) sí se detecta. **Source:** 48-REVIEW-FIX.md

### Separar las causas en sub-gates distintos en vez de fundirlas

`ANCLA-RATCHET` se emitió como sub-gate propio con su propia lista de violaciones y su propio bloque
de remedio, en vez de plegarse dentro de `TRAD-COV`.

**When to use:** cuando dos fallos tienen causas y remedios distintos. Bajo el exploit, `TRAD-COV`
sigue diciendo `PASS (327/327)` —correcto— y el rojo lo pone el ratchet: el corpus puede estar
intacto y lo que se movió es el vigilante. **Source:** 48-REVIEW-FIX.md

---

## Surprises

### La predicción del plan sobre el trapassato remoto no se materializó — y eso ahorró trabajo

El plan 48-01 apostaba a que el quórum marcaría `[S6-naturalidad]` sobre «hube hecho». Los dos
vendors lo pasaron limpio y `deepseek-reasoner` razonó por su cuenta que corresponde al trapassato
remoto.

**Impact:** el Task 3 quedó **no aplicable por ausencia de sujeto**, el doc tuvo cero diff y **D-46-12
no se disparó** — no hubo que re-validar las 206 de las Phases 46-47. **Source:** 48-01-SUMMARY.md

### El plan declaraba seis capas y había siete

Cada categoría `fare` tiene un test de contenido que congela el key set de variante en tres claves.
`preposiciones`/`articoli`/`partitivos` no lo tienen, por eso las Phases 46-47 nunca chocaron.

**Impact:** la primera traducción puso el test en rojo al instante. Se abrió bajo Rule 3 descontando
`translationES` y nada más, verificado por mutación, y las otras tres paredes se dejaron
deliberadamente para sus planes. **Source:** 48-01-SUMMARY.md

### El defecto que más valió lo destapó preguntarse *por qué*, no una corrida de validación

`passato#2` («ha hecho … la semana pasada») la aprobaron **los dos jueces**, con el defecto idéntico
que uno de ellos sí marcó en `passato#5`.

**Impact:** salió de razonar por qué el concern caía justo ahí — esas dos son las únicas variantes
donde `opcion-a` baja a indicativo dentro de un slot compuesto, destapando la restricción peninsular
que el subjuntivo tapaba. Es un knock-on de una decisión del autor que nadie anticipó, y **el
cumplimiento literal posterior no lo habría cazado**: los mismos jueces aprobaron la versión ya
arreglada. **Source:** 48-03-SUMMARY.md

### Una expectativa del plan envejeció en la buena dirección

El plan 48-05 esperaba que desenganchar `fare-indicativo` produjera un `PASS` ciego. Ya no: el ancla
del CR-02 lo pone en `FAIL` exit 1.

**Impact:** el pass ciego sigue existiendo, pero exige romper **tres** gates a la vez. Una expectativa
obsoleta y a favor, registrada como tal en vez de corregida en silencio.
**Source:** 48-05-SUMMARY.md, 48-MUTACIONES-EVIDENCIA.md

### El enunciado de una deuda subestimaba su propio alcance

La `WINDOWS` id 43 describía el vector de saneo como `<`, `>` y `&#`. Al cerrarla apareció que **las
comillas tipográficas son un vector igual de real**.

**Impact:** la deuda escrita era más estrecha que el problema escrito. Un fuzz de 300.000 casos sobre
el alfabeto adversarial confirmó después que el saneo cubre ambos. **Source:** 48-05-SUMMARY.md,
48-REVIEW.md

### El defecto más extremo vive entre el JSON y el render

La mayúscula inicial perdida —36 ejercicios en 7 categorías— la cazó **una lectura humana de
pantalla**. Ningún gate de la fase podía verla: todos miran el JSON, y el `italianoResuelto` sí tiene
la mayúscula. La comprobación `WR-01` del propio plan miró la salida del validador, no la superficie
renderizada.

**Impact:** cuarto caso de la familia ampliada de falsos negativos, y el único donde el criterio **no
estaba en el payload en absoluto**. Desmiente la premisa «si el JSON está bien, se verá bien».
**Source:** 48-05-SUMMARY.md

### La auditoría de seguridad encontró una exposición viva, no una hipótesis

`GET http://*:3000/.env` → HTTP 200, 500 bytes, con las claves de los dos vendors, servidas por el
`npx serve` que el propio checkpoint pidió arrancar.

**Impact:** falsificó además la premisa literal del `accept` de cinco amenazas de Spoofing/EoP
(«sin servidor, sin sesiones, sin roles»). Remediada con `kill` verificado; sin rotación de claves por
decisión del autor sobre el alcance medido, registrada con su ventana temporal exacta.
**Source:** 48-SECURITY.md
