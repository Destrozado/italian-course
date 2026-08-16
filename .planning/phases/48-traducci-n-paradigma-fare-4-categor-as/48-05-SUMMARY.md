---
phase: 48-traducci-n-paradigma-fare-4-categor-as
plan: 05
subsystem: validación y cierre de fase
tags: [mutación, gates, quórum, backstops, traducción, TRAD-03]
requires:
  - "48-04-SUMMARY.md (bloque fare cerrado: 122/122 validated, corpus 328/328)"
  - "scripts/run-validation-271.mjs (ancla de TRAD-COV, CR-02)"
  - "tests/count-arrays-lockstep.test.js (GATE-02 anti-ceguera, GATE-03)"
  - "content/translation-coverage.lock.json (el ancla, 7 claves)"
provides:
  - "48-MUTACIONES-EVIDENCIA.md — el registro literal de 4 mutaciones de gate y 3 permutaciones"
  - "sanearParaCorpus() / sanearPase() — saneo de la prosa de los modelos antes del disco"
  - "El guard de --adjudicar: rechaza escribir cuando el modelo no se deja adjudicar (exit 4)"
  - "La cuenta de colisiones españolas del bloque, en dos niveles, derivada del disco"
  - "La medida de anchura de las dos superficies con arnés validado contra control externo"
  - "TRAD-03 Complete, con 122/122 DERIVADAS del disco"
affects:
  - "content/exercises/fare-indicativo.json (4 variantes, desviación autorizada por el autor)"
  - "scripts/validate-translation-pass.mjs (dos arreglos de tubería de escritura)"
  - "tests/translation-validator.test.js (9 tests nuevos, todos mutados)"
  - ".planning/WINDOWS.md (2 items cerrados, 8 entradas nuevas)"
tech-stack:
  added: []
  patterns:
    - "Mutación de 5 partes: foto verde con md5 → mutar → rojo observado y transcrito → restaurar por copia → foto verde con md5 idéntico"
    - "Arnés de medida validado contra un control externo publicado ANTES de que su cifra valga"
    - "Saneo en el único paso obligatorio hacia el disco, no en el compositor"
key-files:
  created:
    - ".planning/phases/48-traducci-n-paradigma-fare-4-categor-as/48-MUTACIONES-EVIDENCIA.md"
    - ".planning/phases/48-traducci-n-paradigma-fare-4-categor-as/48-05-SUMMARY.md"
  modified:
    - "scripts/validate-translation-pass.mjs"
    - "tests/translation-validator.test.js"
    - "content/exercises/fare-indicativo.json"
    - ".planning/WINDOWS.md"
    - ".planning/REQUIREMENTS.md"
decisions:
  - "D-48-21: --adjudicar RECHAZA escribir cuando el veredicto devuelto sigue siendo incorrecta (exit 4). La segunda pregunta de la id 45 se responde NOMBRANDO el override de autor, no construyendo un mecanismo nuevo"
  - "D-48-22: el saneo de la prosa de los modelos va en applyPassToText (único paso obligatorio hacia el disco) y SUSTITUYE preservando el significado, en vez de rechazar el pase o ablandar el gate"
  - "D-48-23 (AUTOR): D-48-20 se cierra ARREGLANDO las 4, no aceptándolas, y el criterio de corpus byte-idéntico del plan se relaja EXPLÍCITAMENTE y sólo para esas 4"
  - "D-48-24 (AUTOR): los backstops long-text 21 y 22 se CIERRAN con evidencia combinada (arnés mecánico + confirmación visual) tras dos fases abstenidos"
  - "D-48-25 (AUTOR): el defecto de mayúscula inicial en 36 ejercicios de 7 categorías se REGISTRA y se asigna a una fase posterior; no se arregla desde el plan de cierre"
  - "D-48-26 (AUTOR): la lectura de muestra queda satisfecha POR DECISIÓN, no por ejecución, en 3 de sus 4 slots obligatorios"
metrics:
  duration: "~35 min"
  completed: 2026-08-16
actuals:
  tokens: 31616
  tasks: 3
  commits: 4
status: complete
---

# Phase 48 Plan 05: Cierre de fase por mutación observada Summary

Los cuatro gates de la fase se verificaron **rompiéndolos y mirando el rojo**, no leyéndolos; los seis
débitos enrutados quedan cerrados o aceptados por escrito; los dos backstops long-text que llevaban dos
fases abstenidos **se cierran con sujeto real medido y confirmado**; y TRAD-03 se marca con **122/122
derivadas del disco**, no declaradas.

## Qué se hizo

### Las cuatro mutaciones de gate, ejecutadas y observadas

Cada una con sus cinco partes obligatorias —foto verde fechada con `md5`, mutación, rojo literal con su
exit code, restauración **por copia**, foto verde con `md5` idéntico—. Registro completo en
`48-MUTACIONES-EVIDENCIA.md` (1.100+ líneas).

| # | Vector | Rojo observado | Sujeto nombrado |
|---|---|---|---|
| **1a** | Desenganchar `fare-indicativo` del array | GATE-02 `6 !== 7`, exit 1; reporter exit 1 | `fare-indicativo`; total **328 → 274** (Δ = 54) |
| **1b** | 1a **+** borrar su clave del ancla | **PASS CIEGO `274/274` exit 0** en el reporter; GATE-02 y GATE-03 en rojo | `fare-indicativo` en los tres |
| **2** | Borrar `fare-congiuntivo-disparador#5` (`validated`) | Ancla, rama «suelo incumplido», exit 1 | `fare-congiuntivo`: ancla **30**, disco **29**, faltan **1** |
| **3** | Quitar las 17 `translationES` **+** su entrada del array | GATE-02 **VERDE a propósito**; ancla rama «ya no declarada cubierta», exit 1 | `fare-cond-imperativo`, **17** fuera del denominador |
| **4** | Desacentuar un español `validated` | Quórum `incorrecta` ×2 → `disputed` → **TRAD-COV** FAIL `327/328`, exit 1 | `fare-indicativo-passato-prossimo#1` |

**Ninguna resultó no discriminante.** En 1a la cláusula de no-vacuidad se quedó verde —lo que separa «el
gate muerde» de «el gate está averiado»— y en 3 GATE-02 se puso verde **a propósito**, que es la
demostración del agujero que el ancla cubre.

**Las tres permutaciones de orden, ejecutadas y restauradas**: `passes[]` de una variante
(`deriveStatus` = `validated` antes y después), las 7 entradas de `TRANSLATION_COVERAGE` (total **328**
y veredicto invariantes, gate 66/66) y las 7 claves del ancla (0 violaciones antes y después). La fila
`ordering` de la sonda de bordes queda respondida **permutando**, no argumentando.

### Los seis débitos enrutados — ninguno cae en silencio

| # | Débito | Cierre |
|---|---|---|
| 1 | Saneo de `concerns[]` (id 43) | **ARREGLADO**, con su propia mutación en dos planos |
| 2 | `--adjudicar` no fija el veredicto (id 45) | **ARREGLADO** (decisión 1) + **RESPONDIDO sin construir nada** (decisión 2) |
| 3 | Colisión `hiciste` | **CONTADA del disco** con sus dos direcciones y su motivo |
| 4 | D-48-20 — 4 variantes de persona indeterminada | **ARREGLADAS** por decisión del autor, con re-quórum desde cero |
| 5 | Excepción `opcion-a` (SC-2) | **Reportado cumplido CON excepción nombrada y contada** |
| 6 | Los tres falsos negativos del quórum | **Hallazgo central de la fase**, ampliado a cuatro |

### Las dos deudas de herramienta, cada una verificada por su propia mutación

**id 43 — la prosa de los modelos entraba al JSON sin sanear.** El fallo se reprodujo **antes** de
escribir el arreglo: un solo concern del tipo que los modelos producen a diario puso en rojo **dos**
aserciones (`T-41-01` y `D-41-17`), exit 1. **El enunciado del ledger se quedaba corto**: nombraba `<`,
`>` y `&#`, y **las comillas tipográficas son un vector igual de real y más probable**, porque los
modelos las escriben solos. `sanearParaCorpus()` —pura, exportada— se aplica en `applyPassToText`, el
**único** paso obligatorio hacia el disco. Sustituye **preservando el significado y sin perder un solo
carácter** (`->`→`→`, `&#`→`& #`, comillas a ASCII…). No rechaza el pase (ya está pagado, WR-02) ni
ablanda el gate: **conforma el escritor**.

**id 45 — `--adjudicar` grababa el motivo aunque el modelo no se dejara adjudicar.** Decisión (1)
tomada: **rechaza la escritura**, imprime el pase, no toca el disco y sale con **exit 4** propio, con un
mensaje que nombra las tres salidas legítimas y dice que re-invocar no es una. Decisión (2) respondida
**sin construir nada**: el camino para refutar sin el modelo **ya existe** —el override de autor de
primera clase— y se **nombra** en el propio mensaje de error. Añadir un segundo camino habría
multiplicado las formas de retirar un disenso, que es lo que CR-01 existe para evitar.

Las dos mutaciones (neutralizar el saneador → 4 rojos; desactivar el guard → 1 rojo) y la restauración
con `diff -q` idéntico están transcritas. **9 tests nuevos, y uno de ellos deriva del fichero del gate
la lista de marcas prohibidas**: si mañana el gate añade una y el saneador no, el test lo dice.

### D-48-20 — las 4 variantes arregladas (decisión del autor)

El executor las puso delante del autor con su gradación y **no las tocó por su cuenta**, porque el
criterio de éxito del propio plan exige el corpus **byte-idéntico** a 48-04. **El autor relajó ese
criterio explícitamente y sólo para esas 4.**

**El argumento que lo decidió es una medida, no una opinión**, y la produjo la cuenta de colisiones de
este mismo plan: en el grupo «había hecho», las **dos** hermanas de `fare-congiuntivo` escribían el
pronombre y las **dos** de `fare-indicativo` no. Inconsistencia interna del mismo bloque.

`passes[]` reseteado, los 8 pases retirados transcritos antes de retirarse, **rojo intermedio observado**
(`FAIL 324/328 pending=4`, exit 1 — el corpus no pasó de un verde a otro sin pasar por el rojo), y
re-quórum **completo desde cero**: 8 llamadas, jueces declarados, **8/8 `correcta`**, `concerns` vacías,
**0 `disputed`, 0 auto-fallbacks, 0 overrides nuevos**. El barrido de D-48-19 sobre las 328 pasa de
`11 = 7 + 4` a **`15 = 15 + 0`**.

**La gradación no se aplana**: sigue siendo el dato que explica por qué el quórum no las marcó.

### Las colisiones españolas del bloque, en dos niveles

**Nivel 1 — texto completo: 0 de 122.** Set sobre los 122 textos normalizando **sólo espacios** (nunca
acentos ni mayúsculas). En el corpus entero hay **1** y está **fuera** del bloque (`preposiciones-col#0`
↔ `#1`).

**Nivel 2 — la forma verbal, que es donde la colisión declarada vive.** «Decir sólo 0» habría sido
engañoso: `hiciste` no colisiona como frase sino como **forma que renderiza el target**, que es lo que
el alumno ve. Restringido a las **98 de 122** cuyo target italiano es una forma de `fare`: **13 grupos,
33 variantes**. Los motivos no son 13 sino **cinco familias** —pretérito único peninsular, excepción
`opcion-a`, sincretismo de 1ª/3ª, condizionale composto, participio concordado—, **todas ya declaradas y
decididas por el autor**. La cuenta no descubre nada nuevo: lo **mide**.

**Nota de método:** la primera corrida daba **20 grupos y 57 variantes** y era una cifra **inflada por el
extractor** (el `hace` adverbial y el `hace falta` matriz). Se cazó mirando los resultados uno a uno.

### Los backstops long-text 21 y 22 — CERRADOS tras dos fases abstenidos

**El arnés se validó primero contra el control externo**, y sólo entonces valió su cifra: **cuatro cifras
independientes de dos fases distintas reproducidas exactas** — 390 px (piloto Phase 46), 462 px (sujeto
Phase 47), y las cajas más estrechas de 656 y 622 px. Se forzó `document.fonts.load('400 16px Spectral')`
antes de medir (`spectralCargada: true` en las cinco corridas), que es justo el error de 10 % que la
Phase 47 pagó.

**La premisa tiene sujeto por primera vez.** `fare-indefiniti-300#0` y `#2`, **108 caracteres**, envuelven
en **2 líneas** en las **dos** superficies a viewport 800 y 700 px. Envoltura **limpia**: `desborda: false`
en las 20 medidas, `text-overflow: clip`, `overflow-wrap: normal` (por espacios, sin partir palabras). Y
**no pisa el CTA**, medido aparte: el párrafo de 2 líneas mide 48 px y el hueco sigue siendo los 16 px
declarados, `solapa: false` — **empuja** el CTA, no lo invade.

**Las dos mitades, cada una con su autoría:** la **mecánica** es del executor; la **visual** es del autor,
que miró las dos traducciones con la ventana estrechada y confirmó la envoltura limpia. **Ninguna
bastaba sola**, y por eso el ítem estuvo abierto dos fases: en las Phases 46 y 47 la mecánica ya existía
(el control sintético envolvía limpio) y lo que faltaba era el **sujeto real**. El aprobado de esta fase
**sí** cubre la envoltura multilínea, a diferencia de los de 2026-08-13 y 2026-08-14.

## Decisiones

- **D-48-21 / D-48-22:** las dos deudas de tubería de escritura, resueltas conformando el escritor y
  nombrando el mecanismo que ya existe en vez de construir uno nuevo.
- **D-48-23 (autor):** arreglar D-48-20 y relajar el criterio de corpus byte-idéntico sólo para esas 4.
- **D-48-24 (autor):** cerrar los backstops 21 y 22 con evidencia combinada.
- **D-48-25 (autor):** registrar el defecto de mayúscula inicial y asignarlo a una fase posterior.
- **D-48-26 (autor):** la lectura de muestra queda satisfecha **por decisión**, no por ejecución.

## El hallazgo central de la fase: cuatro falsos negativos, y su forma

**Los tres primeros comparten una forma exacta: el criterio EXISTÍA, estaba ESCRITO y estaba EN EL
PAYLOAD que los jueces leyeron — y el quórum no lo ejerció.**

1. `a merenda` (Phase 47): la traducción omitía el adverbial entero; ambos jueces la aprobaron.
2. `fare-congiuntivo-passato#2` (48-03): perfecto compuesto con marco temporal cerrado, con el defecto
   **idéntico** que uno de esos mismos jueces sí marcó en `passato#5`.
3. Las 4 de D-48-20 (48-02): aprobadas por los dos jueces **pese a que la aclaración de S2 que ese mismo
   plan escribió** declara expresamente no absuelto que la persona se quede sin marcar.

**Los jueces son buenos detectando lo que el doc ABSUELVE** —por eso generan falsos positivos que han
obligado a escribir cinco enmiendas absolutorias— **y malos ejerciendo lo que el doc RESERVA.** Los
puntos de vigilancia de las enmiendas son justamente donde el quórum es más débil, que es el peor sitio
posible: son lo único que impide que una enmienda absolutoria sea un cheque en blanco.

**El corolario, acotado por 48-04 y confirmado aquí por segunda vez:** el cumplimiento literal **destapa
cuando el sujeto tiene historia y sólo confirma sobre trabajo en vuelo**. Las 8 llamadas del re-quórum de
D-48-20 volvieron limpias y no destaparon nada; el defecto lo encontró un **barrido mecánico, antes y sin
gastar una llamada**.

**CUARTO CASO, y el más extremo — el defecto de mayúscula inicial.** En los tres primeros el criterio
estaba en el payload y no se ejerció. En éste **el criterio no estaba en el payload en absoluto**: el
render inserta la opción cruda, así que `facendo tutto in fretta, lei ha rotto un piatto.` sale con
minúscula a principio de frase aunque el `italianoResuelto` del JSON diga `Facendo`. **Ninguna
comprobación automática de la fase podía verlo**, porque todas miran el JSON y **este defecto vive entre
el JSON y el render** — la propia comprobación WR-01 del executor miró el `italianoResuelto` del
validador, no la superficie renderizada. **Lo encontró una lectura humana de pantalla.**

Medido: **36 ejercicios** abren con el hueco, en **7 categorías**; **3 conjuntos capitalizan y 33 no**;
**nunca hay leak** (la capitalización es uniforme dentro de cada conjunto, así que no delata la
correcta); incoherencia interna visible (`Tra` frente a `fra`; `La mia` frente a `la mia mamma`).
**Registrado y asignado a una fase posterior por decisión del autor. No arreglado.**

Es también el **contraejemplo empírico, producido en la misma sesión**, de la premisa con la que el autor
dio por leídos tres de los cuatro slots («saldrá lo que ponga en el json; si el json está bien se verá
bien»): **el render no es transparente respecto del JSON.**

## Verificación del autor (Task 3, checkpoint bloqueante)

**Respuesta literal del autor: `aprobado`.**

**Qué cubre, punto por punto:**

| Punto | Estado |
|---|---|
| Render en las dos superficies y caso sin traducción | **Verificado** |
| Envoltura de la traducción larga | **Verificada LIMPIA** — cierra los backstops 21 y 22 |
| Lectura de muestra | **Parcialmente observada, resto por decisión** (ver abajo) |
| Arrastre de los backstops | **No aplica**: ya no se arrastran, se cierran |
| D-48-20 | **`arreglar`** las cuatro |
| Mayúscula inicial | **Registrar y asignar a fase posterior** |

**La lectura de muestra, con las dos cosas separadas y no fundidas:**

- **OBSERVADO DE VERDAD:** el autor leyó **`fare-indefiniti` entero, los 7 ejercicios**, y pegó la
  pantalla. Cubre **uno** de los cuatro slots obligatorios: **`fare-indefiniti-participio-presente`**
  (`facente` / `facenti funzione`, «El director en funciones ha firmado el documento hoy»). También se
  vieron el infinitivo, los modales, el gerundio simple y el compuesto, y el participio pasado concordado
  (`li ha fatti`, «Marco cogió los deberes y los hizo anoche»).
- **DADOS POR LEÍDOS POR DECISIÓN DEL AUTOR, NO POR OBSERVACIÓN:** el compuesto de indicativo con su
  hermano de congiuntivo, `fare-cond-imperativo-cond-passato`, y el par
  `fare-congiuntivo-disparador#0`/`#5`. Motivo textual del autor: *«son muchos, ahora no tengo tiempo, y
  saldrá lo que ponga en el json; si el json está bien se verá bien»*.

**El criterio de lectura de muestra queda satisfecho POR DECISIÓN DEL AUTOR, no por ejecución.** No se
leyeron y no se dice que se leyeran. **Y queda la constancia de que la premisa tiene un contraejemplo
producido en esta misma sesión**: el defecto de mayúscula inicial demuestra que el render **no** es
transparente respecto del JSON.

## Success Criteria

- **SC-2: CUMPLIDO CON EXCEPCIÓN NOMBRADA Y CONTADA**, nunca a secas. **6 de 122** con divergencia dura
  (el italiano obliga congiuntivo y el español obliga indicativo) y **5 más** blandas: **11 de 122**,
  **todas en `fare-congiuntivo`**. Las otras tres categorías aportan cero. La medida que lo demuestra: el
  par de contraste `disparador#0`/`#5` tiene las **subordinadas byte-idénticas** en español.
- **SC-4: los gates verificados por MUTACIÓN OBSERVADA EN ROJO**, que es lo que el ROADMAP pide. Cuatro
  mutaciones, cuatro rojos, cuatro sujetos nombrados.
- **Sonda de bordes:** `ordering` por permutación ejecutada, `adjacency` por recuento con `Set` en dos
  niveles, `empty` por los criterios del schema.

## Deviations from Plan

### 1. [Autorizada por el autor] El corpus NO queda byte-idéntico a 48-04

4 variantes de `fare-indicativo` cambian (D-48-23). El executor **lo detectó, se negó a tocarlas y lo
escaló**; el autor relajó el criterio explícitamente y sólo para esas 4. Diff: **12+/12−** — los 4 textos
y las 8 fechas de pase, **y nada más**, verificado por `uniq -c`. **Commit:** `2dab7d6`.

### 2. [Rule 2 — Crítico] Dos arreglos de tubería de escritura no listados en `<files>` del plan

Las ids 43 y 45 tenían el cierre **asignado a este plan** por decisión previa del autor, y «anotarlas y
seguir» es exactamente lo que el autor rechazó. Ambas verificadas por su propia mutación.
**Commit:** `a4f2a1a`.

### 3. [Hallazgo] La expectativa del plan sobre el pass ciego había envejecido — en la buena dirección

El plan pedía que desenganchar una categoría produjera un `PASS` con total menor. **No lo hace**: el
ancla del CR-02 lo pone en `FAIL` exit 1. El pass ciego existe pero exige **tres gates rotos a la vez**
(reproducido en 1b). Se registra en vez de reescribirse.

### 4. [Escalado, NO arreglado] Legibilidad de GATE-03

Dice `disco 0` donde el `0` es el fallback de un `??`, no un conteo, y funde las dos causas que el ancla
sí distingue. **No se arregla desde el plan de cierre**: exigiría su propia mutación.

### 5. [Escalado, NO arreglado] Mayúscula inicial en 36 ejercicios de 7 categorías

Preexistente y ajeno al alcance de traducción. Decisión del autor: registrar y asignar.

### 6. [Nota de método] Cuarta mordedura del bug de `\b` con acentos

`\b(yo|él|ella)\b` devolvió 5 en vez de 7 al listar el precedente de colocación del pronombre. Cazada
mirando el resultado. **Las cuatro veces el síntoma fue el mismo: una cifra plausible y menor de la
real**, cazada sólo porque alguien conocía el número esperado.

## Verificación de cierre

| Criterio | Resultado |
|---|---|
| Bloque `fare`, **derivado del disco** | **122 variantes / 122 traducciones / 122 `validated`** |
| Corpus | **`TRAD-COV: PASS (328/328)`**, `Milestone gate PASS`, exit **0** |
| `VAL-04` / `VAL-06` / `VAL-08` / `VAL-09` | **PASS** los cuatro |
| Overrides | **8** — sin cambios |
| `disputed` de traducción | **0** |
| Suite | **1369 / 1365 pass / 4 fail** — los mismos 4 pre-existentes (`WINDOWS` id 17, D-45-12) |
| Gates de contenido de las 4 categorías | **347/347** exit 0 |
| Anti-ceguera + ancla | **66/66** exit 0 |
| Motor | `git diff --stat src/domain/ src/screens/app.js` **vacío** |
| Schema | `CURRENT_SCHEMA_VERSION = 13` |
| Árbol | `git status --porcelain` limpio; cero residuos de mutación; el arnés de medida borrado |
| **TRAD-03** | **Complete**, marcado tras derivar 122/122 del disco en la misma corrida |

**TRAD-03 se marcó con las cifras DERIVADAS, no declaradas**, y se dice así porque es el requisito que
48-01 pilló marcándose con 5 de 122 en disco.

## Known Stubs

Ninguno. Las 122 traducciones son contenido definitivo y `validated`.

## Registro en el ledger

- **ids 21 y 22 CERRADAS** con evidencia combinada, conservando su historia entera.
- **8 entradas nuevas**: el saneo de `concerns[]`, el guard de `--adjudicar`, la legibilidad de GATE-03,
  la expectativa del pass ciego que envejeció a favor, la cuenta de colisiones, el cierre de D-48-20 con
  su desviación autorizada, la cuarta mordedura del bug de acentos, y el defecto de mayúscula inicial.

## Self-Check: PASSED

- `.planning/phases/48-…/48-MUTACIONES-EVIDENCIA.md` — FOUND
- `scripts/validate-translation-pass.mjs` — FOUND (`sanearParaCorpus`, `sanearPase`, guard de `--adjudicar`)
- `tests/translation-validator.test.js` — FOUND (9 tests nuevos, los dos bloques mutados)
- `content/exercises/fare-indicativo.json` — FOUND (las 4 con pronombre, `validated`)
- `.planning/WINDOWS.md` — FOUND (21 y 22 `fixed`, 8 entradas nuevas)
- `.planning/REQUIREMENTS.md` — FOUND (TRAD-03 `[x]` y `Complete`)
- Commit `6b800d1` — FOUND
- Commit `a4f2a1a` — FOUND
- Commit `2dab7d6` — FOUND
