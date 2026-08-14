---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
plan: 02
subsystem: content
tags: [traduccion, quorum-cross-vendor, deepseek, gemini, override-autor, gates, partitivos]

requires:
  - phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
    provides: "El andamiaje entero: campo `translationES` (D-46-02), `docs/TRANSLATION-VALIDATION-PROMPT.md` (TVAL-01), `scripts/validate-translation-pass.mjs` (TVAL-02), `deriveStatus` como fuente única con override de autor de primera clase (TVAL-03 / D-46-14), el array `TRANSLATION_COVERAGE` del reporter (GATE-01) y el gate anti-ceguera (GATE-02)"
  - phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
    plan: 01
    provides: "`partitivos` enganchada a `TRANSLATION_COVERAGE` con el `expected` derivado; la excepción estructural del `prompt` metalingüístico en el doc; y la ENMIENDA de D-46-12 cuya prueba de dos condiciones este plan ha tenido que aplicar de verdad"
provides:
  - "Las 48 traducciones de Partitivos con status derivado `validated` — la mitad Partitivos del bloque, cerrada"
  - "La excepción léxica del PARTITIVO escrita en `docs/TRANSLATION-VALIDATION-PROMPT.md` §3, hermana de la de `da` + PERSONA"
  - "La SEGUNDA NOTA de D-46-12: la primera vez que el carve-out de 47-01 FALLA su prueba y obliga a cumplimiento literal — la enmienda demostrada con dientes"
  - "El primer override de autor de TRADUCCIÓN del corpus (`partitivos-qualche#2`), con motivo escrito y con su déficit estructural declarado"
  - "La aserción de quórum de `tests/screen-translation.test.js` implementando el override que su propio mensaje ya prometía"
  - "La DEUDA DE ALCANCE cerrada (seguimiento): las 32 con sujeto re-validadas desde cero — la condición 2 del carve-out CONFIRMADA POR MEDICIÓN, no solo argumentada"
  - "La excepción léxica del ADVERBIAL DE COMIDA en el doc de criterios — TERCERA hermana de `da` + PERSONA y del PARTITIVO, y SEGUNDA enmienda del mismo plan"
  - "La TERCERA y la CUARTA nota de D-46-12, con `WINDOWS` id 36 cerrada por decisión del autor e id 37 naciendo ya cerrada"
affects: [47-03, 47-04, 48, 49, 50, 51, 52, 53]

actuals:
  tokens: 30543
  tasks: 2
  commits: 16

tech-stack:
  added: []
  patterns:
    - "Una regla de criterios ABSOLVENTE se escribe declarando explícitamente que la construcción alternativa TAMBIÉN es fiel: así absuelve sin exigir, y no puede voltear ninguna `correcta` previa"
    - "Un test que reimplementa a propósito una invariante de la fuente única debe reimplementarla ENTERA, ramas de excepción incluidas: si no, su mensaje de fallo promete un carve-out que su código no aplica"
    - "Elegir el juez MÁS estricto —no el más indulgente— como pase adversarial extra antes de minar un override, y dejar escrito su veredicto aunque salga en contra"
    - "Una excepción que ABSUELVE se ancla en una frase que el criterio YA contenía: así nombra el caso donde aplicar el criterio al pie de la letra lo contradice, en vez de rebajarlo"
    - "Pagar el cumplimiento literal sobre TODO el sujeto no solo confirma la direccionalidad: destapa el defecto que vive en la parte del cuerpo que NO motivó la enmienda — 31 de 32 confirmaron, la 32.ª encontró el hueco siguiente"

key-files:
  created: []
  modified:
    - content/exercises/partitivos.json
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - tests/screen-translation.test.js
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/phases/47-traducci-n-bloque-art-culos-articoli-partitivos/deferred-items.md
    - .planning/WINDOWS.md

key-decisions:
  - "Checkpoint bloqueante resuelto por el AUTOR, decisión 1: `opción A` — escribir la regla del partitivo en el doc Y re-validar las 3 variantes de 47-01 que la llevan. La condición «ausencia de sujeto» del carve-out FALLA (35 con sujeto), luego cumplimiento literal de D-46-12"
  - "Checkpoint bloqueante resuelto por el AUTOR, decisión 2: `partitivos-qualche#2` conserva el singular «alguna chica simpática» con override de autor. Adjudicado a favor de la fidelidad estructural: `qualche` rige singular y es lo que el slot enseña"
  - "Las 32 variantes con sujeto del propio Task 2 NO se re-validaron AL CERRAR EL PLAN: decisión de alcance del autor cubierta por la condición 2, declarada como tal — no como sujeto inexistente. **ENMENDADO en el seguimiento del mismo día: el autor eligió cumplimiento literal y las 32 SÍ se re-validaron desde cero — 31 verdes, 1 escalada. `WINDOWS` id 36 pasa a `fixed`**"
  - "Seguimiento, decisión del AUTOR: `opción A` otra vez sobre la 32.ª (`partitivos-delle-invariable#0`) — escribir en el doc la excepción léxica del ADVERBIAL DE COMIDA y re-validar su sujeto entero (4 variantes, no solo la `disputed`). El español NO se toca"
  - "TRAD-02 NO se marca completo: 48 de las 110 traducciones del bloque existen. Lo cierra el plan 47-03 con Articoli"

patterns-established:
  - "Un `disputed` que reaparece con un concern NUEVO es ronda nueva, y ese contador puede no converger: `della-cons#2` encadenó TRES concerns distintos, cada uno abandonado por el siguiente. Se cierra con trabajo sobre los defectos REALES que las objeciones rozan, no persiguiendo la última objeción"
  - "Verificar por MUTACIÓN que la rama nueva de un test muerde, y decir cuál de las dos mutaciones aisló de verdad la lógica nueva y cuál chocó antes con una aserción previa"

requirements-completed: []

coverage:
  - id: D1
    description: "Las 48 variantes `multiple-choice` de `partitivos.json` tienen status derivado `validated`, con ≥2 `by` distintos de dos vendors, cero `disputed` y cero incoherencias entre status escrito y derivado"
    requirement: TRAD-02
    verification:
      - kind: integration
        ref: "node scripts/run-validation-271.mjs — TRAD-COV / VAL-04 / VAL-06 / VAL-08 / VAL-09, exit 0"
        status: pass
      - kind: unit
        ref: "tests/screen-translation.test.js · tests/schema-translation.test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "La excepción léxica del PARTITIVO escrita en el doc de criterios, absolvente y sin añadir ningún imperativo de marcar"
    verification: []
    human_judgment: true
    rationale: "Que una regla de criterios absuelva exactamente lo que debe y ni un milímetro más no lo certifica ningún test. Su evidencia mecánica —3 `disputed` pasando a verde sin tocar el español— demuestra que MUERDE, no que esté bien acotada"
  - id: D3
    description: "La segunda nota de D-46-12 en `46-CONTEXT.md`, con la prueba de dos condiciones aplicada, fallada y con el cumplimiento literal ejecutado"
    verification: []
    human_judgment: true
    rationale: "Es la ejecución escrita de una decisión del autor sobre una decisión LOCKED. Lo que hay que verificar es si el argumento se sostiene al rehacerlo, y eso solo lo puede hacer un lector"
  - id: D4
    description: "El override de autor de `partitivos-qualche#2` con motivo escrito, sin fabricar el `validated` a mano, y con su déficit estructural declarado en vez de disimulado"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js — rama de override, verificada por mutación"
        status: pass
    human_judgment: true
    rationale: "El override es una adjudicación del autor. Lo mecánico (que `deriveStatus` lo promueva, que el `incorrecta` siga en `passes[]`) está verificado; lo que ningún test puede juzgar es si la adjudicación era la correcta"
  - id: D5
    description: "Seguimiento: la deuda de alcance cerrada (32 re-validadas) y la excepción léxica del ADVERBIAL DE COMIDA escrita en el doc, con su propio cumplimiento literal sobre las 4 variantes con sujeto"
    requirement: TRAD-02
    verification:
      - kind: integration
        ref: "node scripts/run-validation-271.mjs — TRAD-COV PASS (144/144), disputed 0, exit 0"
        status: pass
      - kind: integration
        ref: "git diff content/exercises/partitivos.json — cero líneas de `text`/`prompt`/`options`; `preposiciones.json` y `articoli.json` con cero diff"
        status: pass
    human_judgment: true
    rationale: "Que la regla nueva absuelva EXACTAMENTE el flag del adverbial y ni un milímetro más —sin rebajar S2 en general, sin tocar S5— no lo certifica ningún test. Su evidencia mecánica (un `disputed` pasando a verde sin tocar el español, y 3 `validated` que siguen verdes) demuestra que MUERDE y que no voltea, no que esté bien acotada"

duration: 2h22m
completed: 2026-08-14
status: complete
---

# Phase 47 Plan 02: Traducción bloque Artículos — mitad Partitivos Summary

**Las 48 traducciones de Partitivos quedan `validated` y el gate de traducción se pone verde (144/144), pero lo que este plan deja de valor no son las traducciones: es la primera vez que el carve-out de alcance de 47-01 se aplica, FALLA su prueba y obliga a gastar llamadas — dos veces, con DOS enmiendas del doc de criterios, y sin dejar deuda de alcance detrás.**

## Performance

- **Duration:** 2h 22m de reloj entre el primer commit del plan y el último. Desglose: **41m 28s** el plan hasta su primer cierre (de los cuales **27m 07s** la continuación que descargó las dos decisiones del autor), y **1h 37m** el **seguimiento** que cerró la deuda de alcance y la segunda enmienda.
- **Started:** 2026-08-14 14:19:11 · **Completed:** 2026-08-14 16:41 (hora local)
- **Tasks:** 2 de 2, más las decisiones de DOS checkpoints bloqueantes (dos en el cierre, una en el seguimiento)
- **Commits:** 16 · **Files modified:** 6

## Continuación: las dos decisiones del autor, descargadas

Un executor anterior se detuvo en un `checkpoint` bloqueante con dos decisiones. **Las dos las tomó el AUTOR**; esta continuación solo las ejecutó, sin reabrirlas.

### Decisión 1 → `opción A`

Escribir la regla que faltaba en el doc de criterios **y** re-validar las 3 variantes ya `validated` de 47-01 que llevan el rendering partitivo.

**Lo que se escribió** (commit `29b54bf`): *«Excepción léxica: el PARTITIVO italiano se traduce «algo de» / «un poco de» / «unos-unas»»*, en `docs/TRANSLATION-VALIDATION-PROMPT.md` §3, con la **misma anatomía** que la excepción hermana de `da` + PERSONA:

| Parte | `da` + PERSONA (ya existía) | PARTITIVO (nueva) |
|---|---|---|
| Qué declara falso positivo | «añade *casa*, que no está en el italiano» | «añade *algo de*, que no está en el italiano» |
| Por qué no es añadido | el lugar va DENTRO de la preposición | la cantidad indeterminada va DENTRO del artículo partitivo |
| Qué SÍ se sigue vigilando | la **DIRECCIÓN** (`andare da` ≠ `uscire da`) | el **NÚMERO** (`del pane` → *algo de*; `dei libri` → *unos*) |

Se le añadió una viñeta que la de `da` + PERSONA no necesitaba y esta sí: **las dos soluciones son fieles y ninguna es obligatoria** —`He comprado pan.` y `He comprado algo de pan.` traducen igual de bien `Ho comprato del pane.`—. Sin esa viñeta la regla habría *exigido* el cuantificador, que es justo el imperativo que la volvería no-absolvente y le quitaría la condición 2.

**El motivo de que fuera hueco del doc y no 2N falsos positivos:** `deepseek-chat` marcó `[S2-fidelidad] añade "algo de"` sobre **4 variantes distintas** mientras `gemini-3.5-flash-lite` aprobaba la construcción **idéntica**. Es el síntoma canónico que el plan mandaba diagnosticar como doc, no como traducción.

### Decisión 2 → override de autor sobre `partitivos-qualche#2`

El texto singular **«Conozco a alguna chica simpática en clase.»** se queda, con `by: "autor"` + `override: true` y motivo escrito (commit `b7c1ddb`). Es el **único override del plan** y el **primer override de TRADUCCIÓN del corpus**.

## Cifras, TODAS recomputadas del disco

Ninguna cifra de este SUMMARY se transcribió del plan ni del prompt de continuación. El cuerpo «ya validado» se midió sobre el fichero **tal como estaba en el commit `1f46236`**, es decir antes de tocar nada.

### La prueba de dos condiciones del carve-out de 47-01

Sujeto buscado de forma ancha: presencia de `algo de`, `un poco de`, `unos` o `unas` en `translationES.text`.

| Categoría | Variantes `multiple-choice` | Con traducción | Con el rendering partitivo | `validated` bajo el prompt anterior Y con rendering |
|---|---|---|---|---|
| `preposiciones` (Phase 46, cerrada) | 96 | 96 | **0** | **0** |
| `articoli` (Phase 47, sin traducir aún) | 62 | 0 | **0** | **0** |
| `partitivos` (Phase 47) | 48 | 48 | **39** | **35** |

1. **Ausencia de sujeto: FALLA** — 35, y la condición exige cero.
2. **Direccionalidad absolutoria: SE MANTIENE** — la regla solo retira motivos-para-marcar y declara fiel al sustantivo escueto; su tercera parte reitera S2 sin añadir exigencia.

Falla una ⇒ **cumplimiento literal**, que es exactamente lo que la regla de 47-01 prescribe para este caso.

### El aviso importante: el prompt decía «3», y 3 es correcto — pero incompleto

El prompt de continuación hablaba de **3** variantes con sujeto. El disco confirma **3 dentro del cuerpo de 47-01** (`partitivos-clasificacion` #0, #2 y #4 de sus 5). Lo que el número no dice es que hay **32 más** con sujeto, las del Task 2 de este mismo plan. Total: **35**.

| Cuerpo | Variantes | Re-validadas | Resultado |
|---|---|---|---|
| 47-01 (cuerpo CONGELADO que el carve-out había eximido) | **3** | Sí, quórum completo desde cero | 6/6 `correcta`, texto intacto byte a byte |
| Los `disputed` que motivaron la enmienda | **4** | Sí, quórum completo desde cero | Las 4 en verde |
| Task 2 de este plan (cuerpo EN VUELO) | **32** | **Al cerrar: no.** En el seguimiento: **sí** | Ver «Seguimiento» más abajo |

**Las 32 se declararon DECISIÓN DE ALCANCE del autor, no sujeto inexistente.** Literalmente tienen sujeto igual que las 3; lo que las distinguía es la naturaleza del cuerpo, no el disco. Está escrito así en `46-CONTEXT.md` y en el ledger, en vez de disimulado dentro de un «3».

**Y esa deuda ya no existe: el autor la cerró el mismo día.** Lo que sigue en esta sección describe el estado del plan al cerrarse por primera vez y se conserva como historia; el estado final está en la sección **«Seguimiento del mismo día»**.

**Dato que acota el riesgo y que era el temor de 47-01:** `preposiciones` tiene **sujeto CERO** para esta enmienda. El cuerpo cerrado de la Phase 46 **no está tocado**, así que el cumplimiento literal no llegó a costar las 192 llamadas que hicieron inasumible la `opción A` en 47-01. Costó **14**.

## Resolución de los 5 `disputed`

| Variante | Cómo se cerró | ¿Texto tocado? |
|---|---|---|
| `del-cons#1` | La regla nueva lo absuelve | **No** |
| `del-cons#4` | La regla nueva lo absuelve | **No** |
| `della-cons#0` | La regla nueva lo absuelve | **No** |
| `della-cons#2` | 3 rondas MÁS de trabajo, sin override | **Sí, dos veces** |
| `qualche#2` | Override de autor | **No** |

**`della-cons#2` merece su párrafo.** No lo cerró la enmienda: encadenó **tres concerns NUEVOS** de `deepseek-chat`, cada uno sobre un objetivo distinto y **cada uno abandonado por el siguiente**:

1. `al pomodoro` → «con tomate» omite la preparación. *Sugerencia: «con salsa de tomate».*
2. Se le dio «con salsa de tomate» → **la dirección contraria**: «añade *salsa* que no está en el original». *Sugerencia: dejar `al pomodoro` sin traducir* — que es S2 `false` por el propio doc.
3. Se le dio «al tomate» (su propia sugerencia de la ronda 1) → abandona el tema y salta a `A pranzo`, con una sugerencia **agramatical en español** («Almuerzo cocino algo de pasta…»).

Se cerró **con trabajo y sin override**, arreglando los defectos **reales** que las objeciones rozaban sin nombrar bien: `al pomodoro` sí nombra la preparación (no el tomate crudo), y no se cocina *durante* la comida. Texto final: **«Para la comida cocino algo de pasta al tomate.»** — verde por los dos vendors.

Nada de esto se escribió como excepción en el doc: eran defectos de la traducción, no huecos de criterios. Meterlos allí habría forzado una tercera enmienda por un problema que no la necesitaba.

## El override, con su déficit DECLARADO

Antes de minar el override se pidió un **cuarto pase al juez más ESTRICTO disponible** —`deepseek-reasoner`, elegido por ser el más propenso a objetar y no el más indulgente—. **También dijo `incorrecta`**, coincidiendo con `deepseek-chat`. Ese pase se dejó escrito en `passes[]` en lugar de descartarse.

Resultado que **no se maquilla**:

| | Recuento |
|---|---|
| `correcta` de MODELO | **1** (`gemini-3.5-flash-lite`) |
| `incorrecta` de MODELO | **2** (`deepseek-chat`, `deepseek-reasoner`) |
| Override de autor | 1 |

- `deriveStatus` lo promueve **legítimamente**: su contrato pide ≥2 `correcta` con `by` distintos **y al menos una de un MODELO**, y `gemini` la aporta.
- **Pero el criterio de aceptación del plan pedía una barra MÁS ESTRICTA** —≥2 pases correctos de **modelos** distintos— **y esa barra NO se cumple**: este override **sí** aporta la segunda `correcta` que `deriveStatus` cuenta. El precedente contrario es `fare-congiuntivo-passato`, que tenía 2 `correcta` de modelo (Opus + Sonnet) más el override, y por eso allí el override no fabricaba quórum.
- Se declara como lo que es, **no como si la barra se hubiera cumplido**. Registrado en `WINDOWS.md` **id 35**.
- Lo que sostiene la decisión no es el recuento sino la **fidelidad estructural**: `qualche` rige singular en italiano y es exactamente lo que el slot enseña. Que la traducción dijera «algunas chicas» contradiría en español la regla que el ejercicio existe para enseñar.

## Seguimiento del mismo día: la deuda de alcance CERRADA y la SEGUNDA enmienda

Todo lo de arriba describe el plan tal como se cerró la primera vez. Después, el **AUTOR** decidió no quedarse con la deuda de alcance, y este seguimiento la cierra. **Dos enmiendas del doc de criterios en un solo plan**, que es lo bastante inusual como para decirlo en voz alta.

### Paso 1 — cumplimiento literal sobre el sujeto ENTERO de la enmienda del PARTITIVO

`N` **medido del disco, no transcrito**: 39 variantes con el rendering partitivo en el commit `1f46236`, menos las 3 de 47-01 y las 4 ex-`disputed` ya re-validadas ⇒ **N = 32**.

| Recuento sobre las 32 | |
|---|---|
| Re-validadas desde cero (2 pases cada una) | **32** |
| Cerradas en verde | **31** |
| Escaladas al autor como `disputed` | **1** (`partitivos-delle-invariable#0`) |
| Caracteres del español modificados | **0** |
| Overrides nuevos | **0** |
| Pases PRE-enmienda supervivientes | **0** |

**Lo que esto demuestra, y lo que no.** Demuestra la **direccionalidad absolutoria** por la vía cara: 31 de 32 `correcta` previas siguieron siendo `correcta` sin tocar un carácter. Eso convierte en **medición** lo que la condición 2 solo tenía **argumentado**. No demuestra que el argumento sobrara: lo confirma.

**Y destapó lo que un argumento no puede destapar.** La 32.ª volvió `disputed` con un concern **nuevo** que la enmienda del partitivo no cubría ni podía cubrir: `[S2-fidelidad] La traducción omite la preposición 'a' del original ('a merenda')`. El hallazgo estaba en el **resto** del cuerpo, no en la parte que había motivado la enmienda. Es el mejor argumento a favor de haber pagado las llamadas.

### Paso 2 — la SEGUNDA enmienda: el ADVERBIAL DE COMIDA

Decisión del **AUTOR**: `opción A` otra vez — escribir la regla que falta, no overridear la variante.

**Qué se escribió** (commit `b8fc351`): *«Excepción léxica: el adverbial de comida `a pranzo` / `a cena` se traduce TRANSPONIENDO la preposición»*, tercera hermana de las dos que ya vivían en el doc:

| Parte | `da` + PERSONA | PARTITIVO | ADVERBIAL DE COMIDA (nueva) |
|---|---|---|---|
| Qué declara falso positivo | «añade *casa*» | «añade *algo de*» | «**omite** la preposición *a*» |
| Por qué no es defecto | el lugar va DENTRO de la preposición | la cantidad va DENTRO del artículo | la preposición **no se omite: se TRANSPONE** (`de merienda`, `en la cena`) |
| Qué SÍ se sigue vigilando | la **DIRECCIÓN** | el **NÚMERO** | **QUÉ COMIDA** es, y que el adverbial **no desaparezca entero** |

Dos cosas de su redacción, deliberadas:

- **No rebaja S2 en general.** Se apoya en una frase que **S2 ya contenía** —«fidelidad estricta no significa palabra por palabra… las diferencias obligadas por la lengua son correctas y no se penalizan»—. La excepción no añade permiso: nombra el caso concreto en el que aplicar S2 al pie de la letra **contradice** a S2.
- **No toca S5 ni el italiano**, y lo dice explícitamente en su última línea. Sus dos puntos de vigilancia reiteran S2 sin añadir exigencia: omitir el adverbial entero ya era `false` antes de existir esta regla.

### La evidencia que justifica la enmienda, CONTADA DEL DISCO

En **todo el corpus** (758 variantes, 144 traducidas) solo **4** variantes traducidas llevan el adverbial de comida italiano con `a` — las 4 en `partitivos`. `deepseek-chat` aprobó **3** el mismo día y marcó la cuarta por la estructura **idéntica**:

| Variante | Italiano | Español | Veredicto |
|---|---|---|---|
| `della-cons#0` | `A pranzo mangio della carne…` | «**En** la comida como…» | `correcta` |
| `della-cons#2` | `A pranzo cucino della pasta…` | «**Para** la comida cocino…» | `correcta` |
| `clasificacion#4` | `A cena bevo dell'acqua.` | «**En** la cena siempre bebo…» | `correcta` |
| `delle-invariable#0` | `…delle mele **a merenda**.` | «**De** merienda» | **`incorrecta`** |

**Marcar un patrón y aprobar tres idénticos es la firma canónica de este proyecto para un hueco de criterios**, no para cuatro falsos positivos aislados: el mismo síntoma que ya obligó a escribir la excepción del gloss (Phase 42) y la del PARTITIVO (arriba). El trabajo adversarial fue al juez más estricto **y del mismo vendor que el objetor** —`deepseek-reasoner`—, que refutó el concern punto por punto. Con el objetor solo, del mismo pozo, y refutado por su hermano estricto, el diagnóstico no descansa en la comodidad de quien lo arregla.

### Cumplimiento literal, otra vez, sobre las 4

La prueba de dos condiciones falla la 1 (**4** con sujeto, la condición exige cero) y mantiene la 2. Luego se re-validaron **las 4 desde cero, no solo la `disputed`**:

| | Resultado |
|---|---|
| Llamadas | **8** (2 por variante, `deepseek-chat` + `gemini-3.5-flash-lite`) |
| Veredictos | **8 `correcta`** |
| `by` escrito == `by` pinneado | **8 de 8** — cero auto-fallbacks |
| Español modificado | **0 caracteres** |
| Overrides nuevos | **0** |

`partitivos-delle-invariable#0` pasa de `disputed` a `validated` **sin tocar el español y sin override**: «He comido unas manzanas de merienda.» se queda como estaba autorada. Es el mismo movimiento de `del-cons#1`, `del-cons#4` y `della-cons#0` con la enmienda anterior — **cuando el defecto está en los criterios, se arreglan los criterios y el texto se queda**.

La cola de fallbacks se verificó contra `/v1beta/models` **antes** de gastar la primera llamada (`gemini-3.5-flash-lite` → `gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-2.5-flash`, los cuatro vivos), por el aviso de `WINDOWS` id 33. Concurrencia **1**.

### Dato que hereda 47-03 y las Phases 48-53

Hay **5** variantes **sin traducir** que llevan el adverbial de comida: 3 en `articoli` (`articoli-gli-gn#0`, `articoli-305#0`, `articoli-lo-yi#0`), 1 en `fare-indicativo`, 1 en `possessivi`. **No son sujeto de re-validación** —nunca se validaron— y nacerán ya bajo el doc amendado. Se cuenta aquí para que 47-03 no lo redescubra.

## Deviations from Plan

### `[Rule 1 - Bug]` La aserción de quórum prometía un carve-out que no implementaba

- **Encontrado en:** la verificación final, tras el override. Suite en **5** fallos con línea base **4**.
- **Issue:** `tests/screen-translation.test.js:502` exigía **cero** `incorrecta` en toda traducción `validated`… con un mensaje de fallo que decía literalmente «validated con un pase incorrecta **y sin override del autor**». Describía una excepción que el código nunca aplicaba. Mientras el corpus no tuvo ni un override de traducción la promesa no se pudo cobrar; `qualche#2` fue el primero y la destapó en rojo. Un mensaje que describe un carve-out inexistente es peor que no tenerlo: le dice al que lee el rojo que su caso está contemplado cuando no lo está.
- **Fix:** implementar la misma regla que `deriveStatus` (G-42-3), **a propósito por separado y sin importarla**, para que el bloque siga siendo el juez independiente de la fuente única que declara ser. Con override se admite el `incorrecta` (audit trail) pero se sigue exigiendo ≥1 `correcta` de un MODELO (anti-falsificación T-42-03).
- **Commit:** `895a05b`

**Verificado por MUTACIÓN, y se dice cuál sirvió:**

| Mutación | Esperado | Qué pasó |
|---|---|---|
| `gemini` `correcta` → `incorrecta` | rojo | Rojo, **pero chocó antes** con la aserción de ≥2 `correcta`: **no aisló** la rama nueva |
| `override: true` → `false` | rojo por la rama `else` | Rojo **con su mensaje exacto**: la rama discrimina por el flag. **Esta es la que verifica** |

**Honestidad sobre la rama nueva:** la aserción «≥1 `correcta` de un modelo» que añadí es **inalcanzable** por una mutación, porque si todas las `correcta` fueran del autor la comprobación previa de ≥2 `by` distintos saltaría primero. Es defensiva y espeja a `deriveStatus`, pero **no es una aserción que pueda morder**, y se dice aquí en vez de contarla como verificada.

### Ninguna otra

Los `disputed` se resolvieron con trabajo. El único override es el que el autor autorizó.

## La tensión que NO se arregló, a propósito

La `explanation` de `partitivos-qualche` abre con «**Qualche significa algunos** pero en italiano rige siempre singular», y las **tres** traducciones del slot resuelven en singular («algún libro», «algún problema», «alguna chica»).

**No se tocó la `explanation`.** Una `explanation` es contenido de ejercicio gobernado por el **quórum R1-R7**, no por los S1-S6 de traducción: editarla aquí sería validar prosa de ejercicio **bajo el prompt equivocado**. Además su `validation` de slot está `validated` desde 2026-05-28 y tocarla lo invalidaría. Anotado en `deferred-items.md` como **D-47-B**, con el alcance de lo que costaría arreglarlo.

## Verificación en disco al cerrar

| Comprobación | Resultado |
|---|---|
| Reporter `node scripts/run-validation-271.mjs` | **exit 0** — verde entero por primera vez |
| `TRAD-COV` | **`PASS (144/144)`** |
| Línea de Partitivos (literal) | `partitivos               \| 48       \| 48         \| 0         \| 0        \| 0` |
| Línea de Preposiciones (literal) | `preposiciones            \| 96       \| 96         \| 0         \| 0        \| 0` — **intacta** |
| `VAL-04` · `VAL-06` · `VAL-08` · `VAL-09` | `PASS` · `PASS (250/250)` · `PASS` · `PASS` |
| Status derivado de las 48 | 48 `validated`, cero discrepancias escrito-vs-derivado |
| Conjunto de `by` del fichero | `deepseek-chat` (48), `gemini-3.5-flash-lite` (48), `deepseek-reasoner` (1), `autor` (1) — las dos familias presentes |
| Overrides en todo el fichero | **1**, `partitivos-qualche#2` |
| Traducciones que arrastran el hueco `___` | **0** |
| Suite `node --test tests/*.test.js tests/fixtures/*.test.js` | **1343 tests / 1339 pass / 4 fail** — los 4 pre-existentes de trazabilidad (`WINDOWS` id 17), ni uno más |
| Gate anti-ceguera | `tests/count-arrays-lockstep.test.js` **exit 0** |
| Brownfield | `git diff --stat 1f46236..HEAD -- src/domain/ src/screens/app.js` **vacío**; `CURRENT_SCHEMA_VERSION` sigue en **13** |

**Sobre el total de 1343 frente a los 1341 de 47-01:** los 2 tests nuevos son de `tests/translation-validator.test.js`, añadidos por los dos fixes de `fillGap` de este mismo plan (`5f10060`, `005e49c`). Diferencia atribuida, no inexplicada.

## Verificación en disco al cerrar el SEGUIMIENTO

| Comprobación | Resultado |
|---|---|
| Reporter `node scripts/run-validation-271.mjs` | **exit 0** |
| `TRAD-COV` | **`PASS (144/144)`** — `pending` 0, `missing` 0, **`disputed` 0** |
| `VAL-04` · `VAL-06` · `VAL-08` · `VAL-09` | `PASS` · `PASS (250/250)` · `PASS` · `PASS` |
| Línea de Partitivos (literal) | `partitivos               \| 48       \| 48         \| 0         \| 0        \| 0` |
| Línea de Preposiciones (literal) | `preposiciones            \| 96       \| 96         \| 0         \| 0        \| 0` — **intacta** |
| Diff de `content/exercises/partitivos.json` | **solo bloques `validation`**: cero líneas de `"text"`, `"prompt"`, `"options"`, `"correctIndex"` o `"explanation"` |
| `preposiciones.json` y `articoli.json` | **cero líneas de diff** en todo el seguimiento |
| Overrides en todo el corpus | 6 ficheros con **1** cada uno; en `partitivos` sigue siendo **1** (`qualche#2`), con su texto y su motivo intactos |
| Suite `node --test tests/*.test.js tests/fixtures/*.test.js` | **1343 / 1339 pass / 4 fail** — los mismos 4 pre-existentes de trazabilidad (`WINDOWS` id 17), **cero regresiones nuevas** |
| Gate anti-ceguera | `tests/count-arrays-lockstep.test.js` **exit 0** |
| Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `CURRENT_SCHEMA_VERSION` sigue en **13** |

## Cola de fallbacks verificada contra el proveedor

Listada contra `/v1beta/models` **antes** de gastar la primera llamada de la continuación:

- **Primario:** `gemini-3.5-flash-lite` — vivo y, esta vez, **invocable**: respondió las 12 llamadas sin caer al fallback.
- **Cola:** `gemini-3.5-flash` → `gemini-3.1-flash-lite` → `gemini-2.5-flash`, los tres presentes en el listado.
- **Cero auto-fallbacks** en esta continuación: el `by` escrito coincide con el pinneado en las 12. Se dice porque la Phase 46 perdió 78 pases por lo contrario, y porque `WINDOWS` id 33 advierte que listar un modelo **no** garantiza invocarlo.

Concurrencia **1** en todo momento.

## Task Commits

| # | Commit | Qué |
|---|---|---|
| 1 | `f1727a1` | feat — autorar las 43 traducciones restantes |
| — | `5f10060` | fix (Rule 1) — `fillGap` y el marcador nulo `∅` |
| — | `005e49c` | fix (Rule 1) — `fillGap` y la elisión |
| 2 | `52ef542` | feat — quórum cross-vendor, 43/48 `validated`, 5 `disputed` |
| — | `1f46236` | docs — hallazgo aplazado del render |
| 3 | `29b54bf` | docs — la excepción léxica del PARTITIVO en el doc |
| 4 | `94dee43` | fix — re-validar bajo el doc amendado: 3 de 47-01 + los 4 `disputed` |
| 5 | `b7c1ddb` | feat — override de autor sobre `qualche#2` |
| 6 | `5f8abe9` | docs — segunda nota de D-46-12 + deuda + tensión aplazada |
| 7 | `895a05b` | fix (Rule 1) — la aserción de quórum implementa su carve-out |
| — | `e07017f` | docs — cierre del plan (primera vez) |
| **S1** | `4afcdac` | fix — **seguimiento**: re-validar desde cero las **32** con rendering partitivo — 31 verdes, 1 `disputed` |
| **S2** | `b8fc351` | docs — **seguimiento**: la excepción léxica del ADVERBIAL DE COMIDA en el doc |
| **S3** | `a864399` | fix — **seguimiento**: re-validar desde cero las **4** con adverbial de comida — 8/8 verdes |
| **S4** | `124285a` | docs — **seguimiento**: 3.ª y 4.ª nota de D-46-12, `WINDOWS` id 36 `fixed` + id 37 |

## Decisions Made

- **`opción A` y el override, decididos por el AUTOR**, ejecutados sin reabrirlos.
- **TRAD-02 NO se marca completo.** El requisito cubre las 110 traducciones del bloque y hoy hay **48**. `requirements-completed` va vacío deliberadamente: marcarlo sería un verde que el disco no respalda —el modo de fallo del CR-01 de la Phase 44—. Lo cierra el plan 47-03 con Articoli.
- **Seguimiento, decidido por el AUTOR: cerrar la deuda de alcance en vez de convivir con ella.** Las 32 se re-validaron. La consecuencia práctica es que **el sujeto de la enmienda del PARTITIVO queda cubierto al 100 %** y `WINDOWS` id 36 pasa a `fixed`. La consecuencia de fondo es que la condición 2 del carve-out deja de ser solo un argumento: se midió, y aguantó 31 de 32.
- **Seguimiento, decidido por el AUTOR: la 32.ª se cierra con una SEGUNDA enmienda del doc, no con un override.** La regla del ADVERBIAL DE COMIDA absuelve la transposición de la preposición y **nada más**; el español de `delle-invariable#0` no se toca. Overrides nuevos: **0**.
- **Naturaleza del quórum, otra vez declarada y no maquillada:** cross-vendor POR SCRIPT (`deepseek-chat` + `gemini-3.5-flash-lite`), que es lo que D-46-13 establece para TRADUCCIONES. **No** es el canónico Opus+Sonnet por Task de VAL-03. Ya registrado en `WINDOWS` id 34.

## Known Stubs

Ninguno. Las 48 traducciones son frases españolas completas; cero provisionales, cero glosas de una palabra, cero huecos arrastrados.

## Issues Encountered

- **`deepseek-chat` oscilando sobre `della-cons#2`** — tres concerns contradictorios, uno de ellos con sugerencia agramatical. Resuelto con trabajo (arriba).
- **`deepseek-reasoner` confirmando la objeción sobre `qualche#2`** — el pase adversarial salió en contra del override. Se dejó escrito y se declaró el déficit en vez de descartarlo.
- **El test de quórum en rojo por el primer override de traducción** — Rule 1, arreglado y verificado por mutación.
- **Un SEGUNDO hueco del doc, destapado por el cumplimiento literal sobre las 32** — `deepseek-chat` marcando «omite la preposición *a*» sobre `a merenda` mientras aprobaba tres `A pranzo` / `A cena` idénticos. Cerrado con la segunda enmienda y su propio cumplimiento literal; cero overrides.

## Ledger

- **id 35** — el override de `qualche#2` que no cumple la barra estructural del plan. **Sigue `open` a propósito**: es lo único de este plan que el autor debe revisar a sabiendas, y cerrarlo lo haría invisible.
- **id 36** — la deuda de alcance: 32 variantes con sujeto no re-validadas. **`fixed` en el seguimiento**, por decisión del autor. La descripción original **se conserva entera** y el cierre se le **añade** detrás con su recuento: 31 verdes, 1 escalada, cero texto tocado, cero overrides nuevos. Historia amendada, no borrada.
- **id 37** (nueva) — la SEGUNDA enmienda del doc, la del ADVERBIAL DE COMIDA. **Nace ya `fixed`**: se registra por trazabilidad, no como deuda, porque su cumplimiento literal se ejecutó completo (4 de 4). Lleva escrito lo que forzaría re-validarla y el dato de las 5 variantes sin traducir que heredan 47-03 y siguientes.

## User Setup Required

Ninguno nuevo. `DEEPSEEK_API_KEY` y `GEMINI_API_KEY` ya estaban en `.env` desde la Phase 46.

## Self-Check: PASSED

Re-ejecutado al cerrar el **seguimiento**: los 5 ficheros tocados existen en disco; los 4 commits del seguimiento (`4afcdac`, `b8fc351`, `a864399`, `124285a`) existen en `git log`; la tercera y la cuarta nota están en `46-CONTEXT.md`; la sección *«Excepción léxica: el adverbial de comida…»* es la **tercera** de las cuatro excepciones del doc (líneas 199, 216, **245**, 328); el frontmatter de este SUMMARY sigue parseando.
