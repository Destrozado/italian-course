---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
plan: 04
subsystem: content
tags: [traduccion, quorum, cross-vendor, deepseek, gemini, gloss-canon, mutation-testing, derived-gates]

# Dependency graph
requires:
  - phase: 46-01
    provides: "la forma `translationES: { text, validation }` en disco y la traducción canónica como molde byte a byte"
  - phase: 46-02
    provides: "`scripts/validate-translation-pass.mjs` (dirección compuesta `<slot-id>#<k>`, `--avoid`, auto-fallback 429) y `docs/TRANSLATION-VALIDATION-PROMPT.md`"
  - phase: 46-03
    provides: "el sub-gate TRAD-COV del reporter y el gate anti-ceguera GATE-02, deliberadamente ROJOS hasta este plan"
  - phase: 09-infraestructura-de-validaci-n
    provides: "`deriveStatus` como fuente única de status y la doctrina de quórum (VAL-03 1-por-1, ≥2 `by` distintos)"
provides:
  - "Las 96 traducciones españolas de Preposiciones, `validated` con quórum cross-vendor de dos vendors"
  - "Las DOS excepciones E1 (el gloss R7 dentro de `italianoResuelto`) y E2 (`da` + persona = «casa de X») escritas en `docs/TRANSLATION-VALIDATION-PROMPT.md`"
  - "Los 6 gates de los planes 46-01/46-02 reescritos con su población DERIVADA, no congelada"
  - "El camino HTTP real de DeepSeek y Gemini ejercitado 192 veces (cierra `unrun-verify` id 18)"
affects: [46-05-verificacion-visual, 47-53-resto-de-categorias]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 19304
  tasks: 2
  commits: 5

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Gate con POBLACIÓN derivada en vez de congelada: el invariante se assertea (partición completa, cota inferior derivada de otro invariante) y la CIFRA la mide el reporter"
    - "Direccionar un elemento de contenido por su identidad ESTABLE (el `prompt` italiano) y nunca por el artefacto que el test verifica"
    - "Assertear `status === deriveStatus(passes)` en vez de un status literal: el gate sobrevive a la promoción de estado que la propia fase provoca"
    - "El caso adversarial que producción ya no tiene vive en un FIXTURE; un test no dicta la forma del contenido"
    - "Driver de quórum que solo SECUENCIA invocaciones: un proceso por unidad validada (VAL-03), sin componer prompts ni derivar status"
    - "`--avoid` alimentado del `by` REAL del pase anterior (parseado de su stdout), nunca del modelo pinneado"

key-files:
  created:
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-04-SUMMARY.md
  modified:
    - content/exercises/preposiciones.json
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - tests/schema-translation.test.js
    - tests/screen-translation.test.js
    - tests/translation-validator.test.js

key-decisions:
  - "Los 6 gates rotos se reparan DERIVANDO del disco, nunca transcribiendo la cifra nueva: cambiar el `1` por `96` habría sido el D-31-06 que este repo ya pagó dos veces"
  - "Lo que el bloque de retrocompat vigila es el INVARIANTE (partición completa, SCH-02, traducciones bien formadas), no la POBLACIÓN; la cifra de cobertura la mide el sub-gate TRAD-COV del reporter, que es su sitio"
  - "La variante canónica se direcciona por su `prompt` italiano; el `find(v => v.translationES)` era correcto solo mientras existía una única traducción en todo el corpus"
  - "El test de `validation` assertea `status === deriveStatus(passes)` en vez de `{status:'pending'}`: el estado literal era el TRANSITORIO del tracer y habría muerto en esta misma fase"
  - "El caso «variante sin translationES» se muda al fixture `tests/fixtures/translation-pilot.json`; NO se reintroduce una variante sin traducir en el corpus para dar sujeto a un test"
  - "Las dos excepciones que el quórum destapó se escriben en el PROMPT DE VALIDACIÓN, no en este SUMMARY ni en un notes: es el único fichero que el evaluador lee"
  - "Cambiar los criterios obliga a re-validar todo lo ya `validated` (D-46-12): se descartaron los 75 `validated` de la primera corrida aunque las excepciones solo añadían carve-outs contra falsos positivos"
  - "EL GLOSS ES CANON, también cuando el autor cree tener mejor criterio: el quórum cazó una elección mía que contradecía el gloss de `alle#1`"
  - "Cero overrides de autor: los 11 `disputed` se cerraron reescribiendo el texto y re-corriendo el quórum desde cero sobre la variante"

patterns-established:
  - "Cuando un `disputed` reaparece con un concern NUEVO, la ronda cuenta como nueva ronda de trabajo, no como el mismo `disputed` sobreviviendo"
  - "Una excepción que dos vendors marcan por separado es un hueco del doc de criterios, no 2N falsos positivos que overridear uno a uno"
  - "Reparar un gate y verificarlo con la MISMA mutación que verificaría el código que arregla"

requirements-completed: [TRAD-01, TVAL-03]

coverage:
  - id: D1
    description: "Las 96 variantes `multiple-choice` de Preposiciones llevan `translationES.text` con la frase española de la frase italiana YA RESUELTA, sin el hueco"
    requirement: "TRAD-01"
    verification:
      - kind: integration
        ref: "derivado del disco: 96 variantes multiple-choice == 96 con `translationES.text` no vacío; `grep -c '\"text\": \"[^\"]*___'` = 0"
        status: pass
      - kind: unit
        ref: "tests/schema-translation.test.js#el corpus SÍ lleva traducciones y TODAS están bien formadas (no vacías, sin el hueco)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Las 96 tienen status derivado `validated`: ≥2 pases `correcta` de dos `by` DISTINTOS, con el `by` = el modelo que de verdad respondió"
    requirement: "TRAD-01"
    verification:
      - kind: integration
        ref: "`node scripts/run-validation-271.mjs` exit 0, TRAD-COV PASS (96/96); script sobre disco: 0 no-validated, 0 con <2 `by` correcta distintos, 0 incoherencias VAL-09"
        status: pass
      - kind: manual
        ref: "el `by` pinneado del segundo pase era `gemini-2.5-flash`; el auto-fallback por 429 escribió `gemini-3.5-flash-lite` en las 96, observado en el log de la corrida"
        status: pass
    human_judgment: false
  - id: D3
    description: "El `validation` a nivel de SLOT de los 50 slots queda byte-idéntico: la fase no re-valida gramática"
    requirement: "TRAD-01"
    verification:
      - kind: integration
        ref: "los 50 bloques comparados como DOS fotos distintas (disco vs `git show eaa0f7a:…`) → iguales; comprobado antes de cada escritura masiva y al final"
        status: pass
    human_judgment: false
  - id: D4
    description: "Ninguna cifra de cobertura vive transcrita en un test ni en el reporter: las tres magnitudes (variantes, traducidas, validated) se computan del disco"
    requirement: "TRAD-01"
    verification:
      - kind: unit
        ref: "el bloque de retrocompat de tests/schema-translation.test.js ya no contiene ningún literal de población; MUTACIÓN M4 (borrar las 96) → 5 tests ROJOS por la cláusula de no-vacuidad"
        status: pass
      - kind: integration
        ref: "tests/count-arrays-lockstep.test.js (GATE-02, plan 46-03) sigue verde con la referencia derivada del disco"
        status: pass
    human_judgment: false
  - id: D5
    description: "Un `disputed` no se cierra con override-atajo, y un flag de acento no se descarta como falso positivo"
    requirement: "TVAL-03"
    verification:
      - kind: integration
        ref: "script sobre disco: CERO entradas `by: \"autor\"` y CERO `override: true` en los 192 pases. Los 11 `disputed` se cerraron reescribiendo el texto y re-corriendo el quórum completo por variante"
        status: pass
      - kind: manual
        ref: "CERO concerns `[S4-acentos]` en las 192 respuestas: PRES-05 no se invocó por ausencia de sujeto, no por indulgencia"
        status: pass
    human_judgment: false
  - id: D6
    description: "El generador y el validador salen de pools distintos: autoría Claude, validación DeepSeek + Gemini"
    requirement: "TRAD-01"
    verification:
      - kind: manual
        ref: "los `by` del corpus son exactamente `deepseek-chat` (96) y `gemini-3.5-flash-lite` (96); ninguna traducción fue autorada por un modelo externo"
        status: pass
    human_judgment: false
  - id: D7
    description: "El camino HTTP real de los dos proveedores funciona end-to-end con clave, timeout y manejo de 429"
    verification:
      - kind: integration
        ref: "192 llamadas reales; 429 con `Retry-After` y auto-fallback observados; 12 pases perdidos por cola agotada NO escribieron nada y se recuperaron bajando la concurrencia a 1. Cierra `unrun-verify` id 18 de WINDOWS.md"
        status: pass
    human_judgment: false
  - id: D8
    description: "Los criterios del prompt son los correctos para juzgar una traducción real del corpus (cobertura de juicio declarada abierta por el plan 46-02)"
    verification:
      - kind: manual
        ref: "la primera corrida destapó DOS huecos con el síntoma exacto que el doc anticipaba (el modelo marca un patrón y aprueba otro idéntico); se escribieron como E1 y E2 en el doc y la segunda corrida los cerró"
        status: pass
    human_judgment: true
    rationale: "La corrección de los criterios se demostró por su FALLO: 12 de 21 `disputed` no eran fallos de traducción sino huecos del doc. Que la segunda corrida los cierre es evidencia de que las excepciones estaban bien escritas, no de que el doc esté ya completo — la fase 47 traducirá 110 variantes con léxico nuevo y puede destapar más."

# Metrics
duration: 32min
completed: 2026-08-13
status: complete
---

# Phase 46 Plan 04: El piloto de 96 traducciones, autoradas y validadas Summary

**Las 96 variantes `multiple-choice` de Preposiciones están traducidas y `validated` por quórum cross-vendor (`deepseek-chat` + `gemini-3.5-flash-lite`), con cero `disputed` y CERO overrides de autor — y el valor real del plan es lo que el quórum destapó: 12 de los 21 `disputed` de la primera corrida no eran fallos de traducción sino DOS huecos del doc de criterios, con el síntoma que el propio doc anticipaba (el modelo marca un patrón y aprueba otro idéntico).**

## Performance

- **Duration:** 32 min (21:12 → 21:44 CEST, desde el commit de autoría)
- **Tasks:** 2
- **Commits:** 5 (1 del orquestador + 4 de este executor)
- **Llamadas de red reales:** ~311 invocaciones del script (192 de la corrida final + las de la primera corrida descartada)
- **Estimate vs actual:** el plan estimaba 70 000 tokens; el coste medido sobre el diff real (chars/4 de las líneas añadidas en `eaa0f7a~1..HEAD`) es **19 304**. La sobreestimación viene de que el trabajo caro del plan lo hicieron procesos externos: el driver del quórum es ~90 líneas y las 192 respuestas de modelo nunca entraron en contexto.

## Accomplishments

- **96/96 traducciones `validated`.** Derivado del disco, no afirmado: 96 variantes `multiple-choice` · 96 con `translationES.text` no vacío · 96 con status derivado `validated` · 0 `disputed` · 0 `pending` · 0 incoherencias VAL-09 · 96 con ≥2 `by` DISTINTOS entre sus pases `correcta` · 0 traducciones con el hueco `___` dentro.
- **El gate que 46-03 dejó deliberadamente ROJO está VERDE.** `node scripts/run-validation-271.mjs` → **exit 0**, `TRAD-COV (96/96 traducciones validated): PASS (96/96)`, y los cuatro sub-gates de gramática (VAL-04/06/08/09) intactos en PASS.
- **Los 6 gates rotos se repararon DERIVANDO, no transcribiendo.** Y cada uno se verificó por MUTACIÓN con su rojo observado (tabla más abajo). El bloque de retrocompat ya no contiene ningún literal de población: vigila la partición completa del corpus, que toda traducción presente esté bien formada, que SÓLO las `multiple-choice` lleven el campo (aserción NUEVA, derivada) y que sigan existiendo variantes sin el campo, con una cota inferior derivada de SCH-02 en lugar de una cifra.
- **Dos excepciones escritas donde el evaluador SÍ las lee.** E1: el gloss R7 viaja dentro de `italianoResuelto` y eso no es contaminación del italiano — ni hay que reproducirlo en la traducción, ni un gloss de FRASE COMPLETA convierte la coincidencia en «repetir el gloss». E2: `da` + persona se traduce «(a/de) casa de X», y ese `casa` es la traducción del propio `da`, no contenido añadido.
- **El `by` es el modelo que respondió, demostrado por comportamiento.** El modelo pinneado del segundo pase era `gemini-2.5-flash`; su cuota se agotó y el auto-fallback aterrizó en `gemini-3.5-flash-lite`, que es el `by` escrito en las 96. Ni un campo editado a mano «para que quedara limpio».
- **Cierra `unrun-verify` id 18 de WINDOWS.md.** El camino HTTP real de los DOS proveedores queda ejercitado 192 veces, con 429, `Retry-After` y auto-fallback observados en vivo.

## Task Commits

| # | Task | Commit | Tipo |
|---|------|--------|------|
| 1 | Autoría de las 95 traducciones restantes (la hizo el ORQUESTADOR, ver desviación 1) | `eaa0f7a` | feat |
| 1 | Cierre de Task 1: los 6 gates que la autoría puso rojos | `0974958` | test |
| 2 | Las dos excepciones que la 1ª corrida del quórum destapó | `06f44df` | docs |
| 2 | 9 traducciones reescritas por concern válido + reset de las 96 (D-46-12) | `fc9a960` | fix |
| 2 | El quórum cross-vendor: 96/96 `validated` | `94d6790` | feat |

## Verificación por mutación (D-46-18 — leer el gate no cuenta)

Las ocho mutaciones se **ejecutaron**, se observó el resultado y el árbol se restauró **por copia de fichero** (sin `git clean`, sin `git stash`, sin `git checkout` en masa).

| # | Mutación | Exit | Resultado observado |
|---|----------|------|---------------------|
| M1 | vaciar un `translationES.text` (`preposiciones-in-paese#0`) | **1** | ROJO en 2: «bien formadas» + el bundle completo |
| M2 | reintroducir el hueco `___` dentro de una traducción | **1** | ROJO en 2: «bien formadas» + el bundle completo |
| M3 | añadir `translationES` a una variante `match` (`articoli-049#0`) | **1** | ROJO en 2: la aserción SCH-02 nueva + el bundle |
| M4 | borrar las 96 traducciones del corpus | **1** | ROJO en 5: **la CLÁUSULA DE NO-VACUIDAD muerde** (sin ella, el «todas bien formadas» sería verde sobre lista vacía) |
| M5 | escribir `status: "validated"` con `passes: []` | **1** | ROJO en **1 solo** test: el derivado VAL-09. La mutación es quirúrgica y el gate también |
| M6 | invertir las variantes del slot canónico | **0** | **VERDE** a propósito: el ancla por `prompt` es estable al orden |
| M7 | traducir `pilot-tr-mixta#0` en el fixture | **1** | ROJO en 4: desaparece el sujeto del fail-fast y la no-vacuidad lo caza |
| M8 | renombrar el `prompt` canónico | **1** | ROJO en 3: el ancla nueva es **load-bearing**, no decorativa |

**M6 se registra como NO discriminante y no se presenta como prueba de nada.** Con dos variantes, invertirlas deja la canónica en el índice 0, así que el `find(v => v.translationES)` viejo también acertaría. El discriminante real entre la redacción vieja y la nueva fue **el rojo observado en HEAD `eaa0f7a`**: allí la variante 0 lleva traducción y el `find` viejo devolvía `Maria viene da Pisa…` en lugar de la canónica. M8 es el que prueba que el ancla nueva muerde.

## Deviations from Plan

### 1. [DECLARADA por el orquestador, NO auto-arreglada] La autoría fue por LOTES de slots, no 1 slot por subagent (D-46-15)

Se arrastra tal cual del commit `eaa0f7a` y **no se reescribe como si hubiera sido limpia**: la unidad real fue un **lote de ~5 slots por subagent (10 subagents)** en lugar de 1 slot por subagent. Cada slot se vio **entero** (su `explanation` + sus variantes hermanas), así que la coherencia entre hermanas —que es lo que D-46-15 protege— se preserva. Lo que se degrada es el **aislamiento de contexto**, no la independencia generador/validador: el generador siguió siendo Claude y el validador DeepSeek + Gemini, que es lo que la prohibición del plan protege. Los `by` del corpus lo confirman por disco: `deepseek-chat` y `gemini-3.5-flash-lite`, ningún modelo externo autoró nada.

### 2. [Rule 1 - Bug] Los 6 gates de los planes 46-01/46-02 congelaban el estado TRANSITORIO del tracer

- **Found during:** cierre de Task 1 (la suite quedó roja en `eaa0f7a`, a propósito y anunciado).
- **Issue:** «exactamente UNA variante lleva `translationES`», «las sin traducir son `variantesTotales - 1`», «existe una variante SIN `translationES`» y un localizador `find(v => v.translationES)`. Las cuatro formas describían la POBLACIÓN del piloto de una frase. El propio mensaje del test de 46-01 lo anticipaba: *«La expansión a las 95 restantes es del plan 46-04 y actualizará esta cifra.»*
- **Fix:** se sustituye la población por el invariante, todo derivado del disco. **No** se cambió el `1` por `96` ni el `757` por `662`: eso es el D-31-06 que el CR-01 de la Phase 44 ya pagó (una suite firmando 247 con el reporter en 250).
- **Files modified:** `tests/schema-translation.test.js`, `tests/screen-translation.test.js`, `tests/translation-validator.test.js`
- **Commit:** `0974958`

### 3. [Rule 2 - Missing Critical] El doc de criterios no cubría el gloss R7 dentro de `italianoResuelto` ni `da` + persona

- **Found during:** Task 2, primera corrida del quórum (21 `disputed`).
- **Issue:** 12 de los 21 no eran fallos de traducción. Seis venían de `da` + persona (`dai#0/#1`, `dagli#0/#1`, `dalle#0/#1`), donde DeepSeek objetaba que «la traducción añade *casa*» y sugería español inexistente (`*Vuelvo de los abuelos`). Los otros seis venían del gloss: DOS vendors distintos marcaron `[S5-italiano]` «texto en español añadido por error» sobre el paréntesis del gloss (gemini-2.5-flash en `tra-futuro#1`, gemini-3.5-flash-lite en `per-durata#0`), y DeepSeek lo leyó al revés, **exigiendo que la traducción reprodujera el gloss** — contra la regla que ya estaba escrita.
- **Fix:** E1 y E2 escritas en `docs/TRANSLATION-VALIDATION-PROMPT.md`. Ninguna es un cheque en blanco: E2 deja explícito lo que sí hay que vigilar (la DIRECCIÓN: `tornare da X` es hacia, `uscire da X` es desde) y E1 mantiene la prohibición de quedarse EN el gloss.
- **Commit:** `06f44df`

### 4. [DECLARADA] Re-validación completa de las 96 tras cambiar los criterios (D-46-12)

Amendar el doc obligó a **descartar los 75 `validated` y los 21 `disputed` de la primera corrida** y volver a `pending` las 96. Las dos excepciones solo AÑADEN carve-outs contra falsos positivos, así que no podrían convertir una `correcta` en `incorrecta` y el atajo estaba a mano — pero D-46-12 se cumple **como está escrita, no como sale más barato**. Coste: ~190 llamadas tiradas. Calidad > tokens.

---

**Total deviations:** 1 heredada y declarada (autoría por lotes), 1 bug auto-arreglado (mis gates hermanos), 1 funcionalidad crítica ausente auto-añadida (las dos excepciones del doc), 1 re-trabajo declarado por decisión previa.

## Resolución de los `disputed` — CON TRABAJO, NUNCA CON ATAJO

**Cero overrides de autor en los 192 pases** (verificado por script sobre disco: ninguna entrada `by: "autor"`, ningún `override: true`). Once traducciones llegaron a `disputed` y las once se cerraron reescribiendo el TEXTO y re-corriendo el quórum **completo desde cero sobre la variante**, nunca parcheando un pase.

**Siete salieron del mismo principio, que ya estaba en la memoria del proyecto: EL GLOSS ES CANON** y manda sobre la preferencia de sinónimo del autor.

| Dirección | Antes | Después | Motivo |
|-----------|-------|---------|--------|
| `per-durata#0` | Ayer estudié dos horas. | Ayer estudié **durante** dos horas. | el gloss dice «durante dos horas» |
| `per-durata#1` | Ayer dormí ocho horas. | Ayer dormí **durante** ocho horas. | ídem |
| `nel#0` | …están **en** el cajón. | …están **dentro del** cajón. | el gloss dice «dentro del cajón» |
| `nel#1` | …está **en** el frigorífico. | …está **dentro del** frigorífico. | ídem |
| `tra-futuro#1` | …**nos vamos a** Roma. | …**salimos hacia** Roma. | el gloss dice «salimos hacia Roma» |
| `su-argomento#0` | …sobre **la antigua Roma**. | …sobre **la Roma antigua**. | gloss + orden de `Roma antica` |
| `alle#0` | **Les** escribo una carta a mis amigas. | Escribo una carta a mis amigas. | el gloss no lleva el clítico |

Y dos por razones propias:

- **`di-origen#0`**: «María viene **desde** Pisa» era un calco de `viene da Pisa` — un nativo dice «viene **de** Pisa». `[S6-naturalidad]` real, no una preferencia. → «María viene de Pisa, pero es de Roma de nacimiento.»
- **`alle#1`**: se quitó el «Les» redundante. **Y aquí el quórum cazó una decisión MÍA.** En `fc9a960` conservé «unas flores» argumentando el partitivo de `dei fiori`, y al hacerlo **contradije el gloss canon** («Regalo flores a mis primas»). `deepseek-chat` lo volvió a marcar en la segunda corrida. Corregido a «Regalo flores a mis primas.» → 2/2 `correcta`. La lección es exactamente la que ya está escrita en la memoria del proyecto y que volví a pagar: **el gloss es canon también cuando el autor cree tener mejor criterio.**

**`dalla#0` necesitó DOS rondas completas de trabajo** y merece el detalle, porque es donde el plan autorizaba el override y no se usó:

1. **Ronda 1** — concern de orden de palabras («Vengo *ahora* de la estación» desplaza el énfasis temporal). Reescrita a «Vengo de la estación ahora.» y quórum re-corrido desde cero.
2. **Ronda 2** — concern **NUEVO**: falta el «desde» que marca el alejamiento. Y resulta que **el gloss canon de ese propio `prompt` dice literalmente «Vengo desde la estación ahora»**. Alineada con el gloss verbatim y tercera corrida → **2/2 `correcta`**.

Se registra que el plan permitía detener y bloquear tras dos rondas, y que **no se usó el override**: la excepción E1 declara que coincidir con un gloss de frase completa es traducir bien, así que existía una salida por trabajo y se tomó esa. Nótese que E1 y el arreglo de `di-origen#0` no se contradicen: donde hay gloss, decide el gloss (`dalla#0` → «desde»); donde no lo hay, decide el español natural (`di-origen#0` → «de»).

**Cero flags `[S4-acentos]` en las 192 respuestas.** PRES-05 no se invocó por **ausencia de sujeto**, no por indulgencia: no hubo ni un aviso de tilde que descartar ni que arreglar.

## Issues Encountered

- **Los fallbacks de Gemini del primer intento estaban RETIRADOS.** `gemini-2.0-flash` devuelve HTTP 404 («no longer available»), así que 78 pases se leían como «sin pase» cuando en realidad la cola se agotaba por un 404, no por cuota. Se listaron los modelos reales contra `/v1beta/models` y se rehízo la cola con `gemini-2.5-flash-lite,gemini-3.5-flash-lite,gemini-3.5-flash`. **Un `--fallback` no verificado contra el proveedor es un auto-fallback decorativo.**
- **Los 429 son reales y la cuota se agota de verdad.** Con concurrencia 3, 12 pases perdieron toda la cola. El script **no escribió nada** en esos casos (no emite pase sin respuesta), y se recuperaron bajando la concurrencia a 1. **Ni un `passes[]` inventado**: las 192 entradas vienen de una respuesta real.
- **Los `by` finales son `deepseek-chat` y `gemini-3.5-flash-lite` en las 96**, no los pinneados. Eso NO es un defecto: es el auto-fallback funcionando y el registro de auditoría diciendo la verdad.
- **La cobertura de juicio D8 del plan 46-02 se cerró exactamente por donde su `rationale` predecía.** Decía: *«La prueba de verdad es la primera corrida del quórum sobre las 96: si el quórum marca un patrón y aprueba otro idéntico, la excepción hay que escribirla en este doc, no en un notes.»* Es literalmente lo que pasó, y es lo que se hizo.

## Threat Flags

Ninguno. Las 192 llamadas usan el camino ya modelado en el `<threat_model>` del plan: clave en header (nunca en URL ni log), `withFileLock` serializando cada read-modify-write, el objeto `pass` conteniendo solo `{ by, date, verdict, concerns }`. Verificado sobre disco: cero claves, cero headers y cero cuerpos crudos de respuesta en el JSON. T-46-20 (registro de auditoría que miente) se cierra por script: cero `by: "autor"`, cero `override: true`, y el `by` = el modelo que respondió.

## Known Stubs

Ninguno. Las 96 traducciones son texto real, validado, renderizable por las dos superficies que el plan 46-01 cableó.

## Deferred Issues

- **Los 4 subtests de `tests/requirements-traceability.test.js` siguen rojos** — deuda PRE-EXISTENTE en la línea base `19f41a9` (1178/1182), registrada en `.planning/WINDOWS.md` id 17. No se toca: es el registro de requisitos, no el pipeline de traducción, y tocar un gate sin correr la mutación que verifica que sigue mordiendo es el modo de fallo del CR-01 de la Phase 44.

## Next Phase Readiness

**Para el plan 46-05 (verificación visual):** las 96 traducciones están en disco y `validated`; las dos superficies de render ya existen desde 46-01. El piloto está listo para mirarse con los ojos.

**Para las fases 47-53 (las otras 17 categorías, 626 variantes):**

- **El pipeline está probado sobre contenido real y el derecho a escalar está comprado.** Lo que el piloto compró de verdad no fue «96 traducciones»: fue descubrir E1 y E2 en la variante 12 en lugar de en la 500. Ese era el modo de fallo caro que la fase existía para evitar.
- **La cola de fallbacks de Gemini hay que verificarla contra `/v1beta/models` antes de cada fase.** Los modelos se retiran; un fallback muerto convierte cada 429 en un pase perdido silencioso.
- **Concurrencia 1-2 para el quórum**, no 3: con 3 se agotan las cuotas y se pierden pases (recuperables, pero es tiempo tirado).
- **Cuidado con el gloss al autorar.** Siete de los once `disputed` fueron traducciones que ignoraban el gloss canon del propio `prompt`. Si el subagent que autora recibe el slot entero, el gloss va dentro del `prompt` y **hay que decirle explícitamente que el gloss manda**: ahorraría la mitad de los `disputed` de la próxima fase.
- **Cada categoría nueva puede destapar más excepciones.** E1 y E2 salieron del léxico de Preposiciones (`da` + persona, glosses de frase completa). Artículos y el paradigma `fare` traerán otras. La regla de gobernanza no cambia: se escriben en `docs/TRANSLATION-VALIDATION-PROMPT.md`, y hacerlo obliga a re-validar (D-46-12) — así que conviene amendar el doc **temprano en la fase**, no al final.

## Self-Check: PASSED

- Los 5 commits declarados existen en `git log`: `eaa0f7a`, `0974958`, `06f44df`, `fc9a960`, `94d6790`.
- Los 5 ficheros de `key-files.modified` existen en disco y aparecen en `git diff --numstat eaa0f7a~1..HEAD`.
- `node scripts/run-validation-271.mjs` → **exit 0**, TRAD-COV **PASS (96/96)**, VAL-04/06/08/09 en PASS.
- `node --test tests/*.test.js tests/fixtures/*.test.js` → 1299 tests / 1295 pass / **4 fail**, los mismos 4 pre-existentes de la línea base `19f41a9`. Cero regresiones nuevas.
- Script sobre disco: 96 traducciones · 0 no-`validated` · 0 incoherencias VAL-09 · 0 con <2 `by` distintos · 0 overrides de autor.
- `grep -c '"text": "[^"]*___' content/exercises/preposiciones.json` → **0**.
- Los 50 `validation` de nivel de SLOT byte-idénticos contra `eaa0f7a` (disco vs `git show`, dos fotos distintas del mismo dato).
- `git diff --stat HEAD -- src/domain/ src/screens/app.js` → **vacío** (motor byte-intacto, D-46-01).
- `.planning/WINDOWS.md` id 18 → `fixed`.
- Árbol de mutaciones restaurado: `git status --short` no lista `content/exercises/articoli.json` ni `tests/fixtures/translation-pilot.json`.

---
*Phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones*
*Completed: 2026-08-13*
