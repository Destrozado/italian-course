---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
plan: 01
subsystem: content
tags: [traduccion, quorum-cross-vendor, deepseek, gemini, validacion, gates, partitivos]

requires:
  - phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
    provides: "Todo el andamiaje: campo `translationES` (D-46-02), `docs/TRANSLATION-VALIDATION-PROMPT.md` (TVAL-01), `scripts/validate-translation-pass.mjs` (TVAL-02), `deriveStatus` como fuente única (TVAL-03), el array `TRANSLATION_COVERAGE` del reporter (GATE-01) y el gate anti-ceguera (GATE-02)"
provides:
  - "Las 5 traducciones del slot metalingüístico `partitivos-clasificacion`, las 5 `validated` con 2 `by` distintos"
  - "`partitivos` enganchada a `TRANSLATION_COVERAGE` con el `expected` DERIVADO del disco por `mcVariantCountOf`"
  - "La excepción estructural del `prompt` metalingüístico escrita en `docs/TRANSLATION-VALIDATION-PROMPT.md` §3, con sus tres partes"
  - "D-46-12 ENMENDADA: la obligación de re-validar se mantiene DONDE LA ENMIENDA TIENE SUJETO, con dos condiciones y su argumento"
  - "El camino entero de la fase demostrado de punta a punta sobre contenido real antes de escalar a las 110"
affects: [47-02, 47-03, 47-04, 48, 49, 50, 51, 52, 53]

actuals:
  tokens: 7273
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Carve-out de ALCANCE sobre una decisión LOCKED: se enmienda por escrito con fecha y firma, exigiendo ausencia de sujeto MÁS direccionalidad absolutoria, ambas derivadas del disco y escritas en el momento"
    - "Argumento de direccionalidad de un criterio: un veredicto negativo exige al menos un motivo-para-marcar, así que una enmienda que solo RETIRA motivos no puede voltear un veredicto positivo"

key-files:
  created: []
  modified:
    - content/exercises/partitivos.json
    - scripts/run-validation-271.mjs
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/WINDOWS.md

key-decisions:
  - "Task 3 (checkpoint:decision bloqueante) resuelto por el AUTOR: `opcion-b` — re-validar solo el bloque de esta fase y declarar la deuda por escrito. NO se re-validaron las 96 de Preposiciones"
  - "D-46-12 enmendada, no erosionada: el texto original se conserva íntegro y se le añade debajo un bloque de enmienda fechado y firmado que acota el ALCANCE de la re-validación, nunca los criterios"
  - "El quórum de este plan es CROSS-VENDOR POR SCRIPT (D-46-13), NO el canónico Opus+Sonnet por Task de VAL-03: un `gsd-executor` es él mismo un subagent y no puede spawnear Task subagents"
  - "TRAD-02 NO se marca completo: 5 de 110 traducciones del bloque existen. Marcarlo sería un verde que el disco no respalda"

patterns-established:
  - "Ausencia de sujeto se DEMUESTRA con una búsqueda ANCHA, no con la estrecha que conviene: la anatomía metalingüística se buscó por flecha (`->`, `=>`, flechas unicode) Y por etiqueta gramatical española en `options`, y las dos vías dieron 0 en Preposiciones y Articoli"
  - "Listar un modelo contra el proveedor es necesario pero NO suficiente para darlo por invocable"

requirements-completed: []

coverage:
  - id: D1
    description: "Las 5 variantes de `partitivos-clasificacion` tienen traducción con status derivado `validated` y 2 `by` distintos de dos vendors distintos, cero `disputed`, cero overrides de autor"
    requirement: TRAD-02
    verification:
      - kind: integration
        ref: "node scripts/run-validation-271.mjs — sub-gates VAL-04 / VAL-06 / VAL-08 / VAL-09"
        status: pass
      - kind: unit
        ref: "tests/schema-translation.test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "`partitivos` enganchada a `TRANSLATION_COVERAGE` con `expected` derivado del disco; el gate anti-ceguera sigue verde con las dos categorías cubiertas"
    requirement: TRAD-02
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js"
        status: pass
    human_judgment: false
  - id: D3
    description: "La excepción estructural del `prompt` metalingüístico escrita en `docs/TRANSLATION-VALIDATION-PROMPT.md`, con su parte de «qué SÍ se sigue vigilando»"
    verification: []
    human_judgment: true
    rationale: "La calidad de una regla de criterios no la certifica ningún test: lo que hay que juzgar es si absuelve exactamente lo que debe y ni un milímetro más. Su única evidencia mecánica —que `deepseek-chat` pasara de `incorrecta` a `correcta` sin tocar el texto— demuestra que la regla MUERDE, no que esté bien acotada"
  - id: D4
    description: "D-46-12 enmendada con el alcance de la re-validación, con el argumento de por qué el carve-out no puede voltear una `correcta`, más las tres entradas de `WINDOWS.md`"
    verification: []
    human_judgment: true
    rationale: "Es la ejecución escrita de una decisión del autor sobre una decisión LOCKED. Lo que hay que verificar es si el argumento se sostiene al rehacerlo, y eso solo lo puede hacer un lector"

duration: 3h27m
completed: 2026-08-14
status: complete
---

# Phase 47 Plan 01: Tracer del bloque Artículos Summary

**Una variante metalingüística de Partitivos atraviesa las cinco capas del pipeline de punta a punta, destapa un hueco real en el doc de criterios, y la enmienda que lo tapa obliga a acotar por escrito el alcance de una decisión LOCKED — decidido por el autor como `opcion-b`.**

## Performance

- **Duration:** 3h 27m de reloj entre el commit del tracer y el cierre, de los cuales la inmensa mayoría fue el **checkpoint bloqueante esperando la decisión del autor**. La ejecución de la continuación (Task 3) fueron ~12 min.
- **Started:** 2026-08-14T08:41:53Z (commit del tracer)
- **Completed:** 2026-08-14T12:08:28Z
- **Tasks:** 3 de 3
- **Files modified:** 5

## Accomplishments

- **El camino entero de la fase queda demostrado sobre contenido real antes de escalar.** `partitivos-clasificacion#0` fue autorada, validada por dos vendors distintos, derivada a `validated`, contada por el gate y enganchada al array de cobertura. Ninguna capa quedó simulada.
- **La forma metalingüística se resolvió en la variante 1, no en la 110** — que es exactamente para lo que existe un tracer. `deepseek-chat` marcó `[S2-fidelidad]` sobre la cola metalingüística y `gemini-3.5-flash-lite` aprobó la forma IDÉNTICA: el síntoma canónico de un hueco del doc, no de 2N falsos positivos que overridear uno a uno.
- **La excepción se escribió donde el evaluador la lee**, con sus tres partes obligatorias, incluida la tercera —«qué SÍ se sigue vigilando»— sin la cual una excepción es un cheque en blanco.
- **D-46-12 quedó enmendada por escrito y no erosionada en silencio**, con las cifras recomputadas del disco y un argumento de direccionalidad que un lector futuro puede REHACER, no solo creer.

## Task Commits

1. **Task 1: El tracer — una variante metalingüística atraviesa las cinco capas** — `da06087` (feat)
2. **Task 2: Cerrar el slot metalingüístico + escribir en el doc la excepción** — `dc661e0` (feat)
3. **Task 3: Alcance de la re-validación (checkpoint:decision) — RESUELTO `opcion-b`** — `e669817` (docs)

## El checkpoint: RESUELTO

| Campo | Valor |
|---|---|
| **Tipo** | `checkpoint:decision`, `gate="blocking"` |
| **Estado** | **RESUELTO** |
| **Opción elegida** | **`opcion-b`** — «Re-validar solo el bloque de esta fase, y declarar la deuda por escrito» |
| **Quién decidió** | **EL AUTOR**. No fue auto-seleccionada por auto-mode, ni inferida, ni asumida por el executor |
| **Ejecutado por** | El executor de continuación, que solo descargó las obligaciones de la opción — no reabrió la decisión |

### Por qué el autor eligió B

1. **La enmienda tiene sujeto CERO en el contenido ya validado.** Recomputado del disco al ejecutar el Task 3, buscando la anatomía metalingüística de forma ANCHA (flecha `->` / `=>` / `→` / `⇒` en el `prompt`, **o** alguna `option` que sea etiqueta gramatical española):

   | Categoría | Variantes `multiple-choice` | Con anatomía metalingüística | `validated` bajo el prompt anterior |
   |---|---|---|---|
   | `preposiciones` | 96 | **0** | 96 |
   | `articoli` | 62 | **0** | 0 |
   | `partitivos` | 48 | **5** | 5, y las 5 bajo el doc YA amendado |

2. **El carve-out es ABSOLVENTE, no restrictivo:** solo puede convertir `incorrecta` en `correcta`, nunca al revés. Demostrado empíricamente además de argumentado: `partitivos-clasificacion#0` se re-validó bajo el doc amendado **sin cambiar un solo carácter** de su `text` (`"He comido algo de pan."`, idéntico en `da06087` y en `dc661e0`) y **sin override**, y `deepseek-chat` pasó de `incorrecta` a `correcta`.

3. **Re-validar 192 llamadas sobre contenido que la enmienda no puede tocar tiene un riesgo que en la Phase 46 NO existía:** el quórum es **no determinista**, así que re-validar 96 entradas verdes puede acuñar `disputed` NUEVOS por ruido y romper el `TRAD-COV: PASS (96/96)` que hoy respalda un gate de milestone cerrado. La `opcion-a` no era «lo mismo pero más caro»: era gastar para arriesgar un verde legítimo.

### Las tres obligaciones de la opción B, descargadas

| # | Obligación | Dónde quedó | Estado |
|---|---|---|---|
| 1 | Enmienda fechada y firmada de D-46-12 | `46-CONTEXT.md`, bloque «ENMIENDA DEL REGISTRO (2026-08-14 — Phase 47, plan 47-01, Task 3)» debajo del texto original, **que no se tocó** | Hecho |
| 2 | Argumento escrito de por qué el carve-out no puede voltear una `correcta` | Dentro de la misma enmienda, redactado para ser REHECHO | Hecho |
| 3 | Entrada en `WINDOWS.md` con la deuda aceptada | `WINDOWS.md` id **32** | Hecho |

**Regla tal como queda enmendada:** amendar el doc de criterios sigue obligando a re-validar todo lo `validated` bajo el prompt anterior, **salvo** que la enmienda sea demostrablemente inerte sobre ese cuerpo, lo que exige las **dos** condiciones a la vez —ausencia de sujeto **y** direccionalidad absolutoria—, ambas derivadas del disco y escritas en el momento. Si falta una, o si la enmienda **endurece** en vez de absolver, se vuelve al cumplimiento literal.

**El argumento, en corto:** un veredicto `incorrecta` se emite cuando el evaluador encuentra **al menos un** motivo-para-marcar; `correcta` es el caso en que ese conjunto queda **vacío**. Las tres viñetas de la excepción o bien **retiran** motivos («NO marques…», «NO exijas…») o bien **reiteran** criterios ya vigentes sin añadir exigencia. Quitar elementos de un conjunto vacío lo deja vacío. El criterio queda operativo para el futuro: **si una enmienda posterior introduce un imperativo del tipo «marca como incorrecta si…» o «exige que…», este argumento NO le aplica.** La enmienda nombra además el **único** camino de volteo que sí existe (una traducción que hubiera reproducido la cola metalingüística podría leerse como que **añade** contenido bajo el doc nuevo) y muestra que tampoco tiene sujeto en Preposiciones.

## Naturaleza del quórum — declarada, no maquillada

Las 5 variantes se validaron con el **quórum CROSS-VENDOR POR SCRIPT**: `deepseek-chat` + `gemini-3.5-flash-lite` vía `scripts/validate-translation-pass.mjs`. **NO es el quórum canónico Opus+Sonnet por Task subagent de VAL-03**, y no se escribe como si lo fuera.

- Un `gsd-executor` es él mismo un subagent y **no puede spawnear los Task subagents** que VAL-03 exige; ese camino solo existe en una pasada TOP-LEVEL posterior.
- Cumple la barra ESTRUCTURAL —2 `by` distintos, de dos vendors distintos, `deriveStatus` como fuente única, cero overrides— y por eso el `validated` derivado es legítimo.
- Diferencia que no hay que confundir: **para TRADUCCIONES el quórum por script no es un sucedáneo, es el mecanismo DECIDIDO** (D-46-13), porque DeepSeek es el estricto en acentos y S4/RAE es el criterio que más pesa aquí. Lo que sí sería un sucedáneo es usarlo para el quórum de EJERCICIOS (R1-R7).
- Registrado en `WINDOWS.md` id **34**.

## Hallazgo operativo: listar un modelo no basta

`gemini-2.5-flash-lite` aparece **VIVO** en el listado `/v1beta/models` de Gemini y devuelve **HTTP 404** al invocarlo («no longer available to new users»). Verificar un modelo LISTÁNDOLO contra el proveedor es **necesario pero NO suficiente**: descarta los ya retirados del listado, no garantiza que la cola de fallbacks funcione. Lo que salvó la corrida fue el **auto-fallback**, que aterrizó en `gemini-3.5-flash-lite`, y el campo **`by`**, que registra el modelo que de verdad respondió y no el pinneado — por eso el auto-fallback queda VISIBLE en el corpus en lugar de disimulado (mitigación T-47-05). Registrado en `WINDOWS.md` id **33**.

## Files Created/Modified

- `content/exercises/partitivos.json` — las 5 traducciones de `partitivos-clasificacion` con su bloque `translationES` (`text` + `validation`), las 5 `validated`
- `scripts/run-validation-271.mjs` — la entrada de `partitivos` en `TRANSLATION_COVERAGE`, con el `expected` derivado por `mcVariantCountOf`, en una sola línea con el `slug` delante
- `docs/TRANSLATION-VALIDATION-PROMPT.md` — §3, la excepción estructural del `prompt` metalingüístico
- `.planning/phases/46-…/46-CONTEXT.md` — la enmienda de D-46-12 (Task 3)
- `.planning/WINDOWS.md` — ids 32, 33 y 34

## Verificación en disco al cerrar

| Comprobación | Resultado |
|---|---|
| Suite `node --test tests/*.test.js tests/fixtures/*.test.js` | **1341 tests / 1337 pass / 4 fail** — la línea base EXACTA, cero regresiones nuevas |
| Identidad de los 4 rojos | Los 4 subtests de `tests/requirements-traceability.test.js` (`la forma del documento…`, `la cifra escrita en la linea de Coverage…`, `cero DUPLICADOS…`, `cero huerfanos…`) — deuda PRE-EXISTENTE, `WINDOWS.md` id 17 |
| Reporter `node scripts/run-validation-271.mjs` | **exit 1** — rojo INTENCIONADO y atribuido |
| `TRAD-COV` | `FAIL (101/144 — pending=0, missing=43, disputed=0)`; en la tabla por categoría, `partitivos 48 / 5 / 0 / 0 / 43` y `preposiciones 96 / 96 / 0 / 0 / 0` |
| `VAL-04` · `VAL-06` · `VAL-08` · `VAL-09` | `PASS` · `PASS (250/250)` · `PASS` · `PASS` — el rojo es SOLO de cobertura |
| Gate anti-ceguera | `tests/count-arrays-lockstep.test.js` verde |
| Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `CURRENT_SCHEMA_VERSION` sigue en **13** |

**El rojo del reporter está ATRIBUIDO:** `partitivos` tiene 5 de sus 48 traducidas y lo cierra el plan 47-02. Un rojo intencionado solo vale si se distingue de un rojo por avería, y aquí se distingue por dos hechos: la línea nombra la cobertura parcial con su `43 missing`, y los otros cuatro sub-gates siguen en PASS.

## Decisions Made

- **`opcion-b`, decidida por el autor** (arriba, con su motivo completo).
- **TRAD-02 NO se marca completo.** El requisito cubre las 110 traducciones del bloque y hoy hay **5**. `requirements-completed` va vacío deliberadamente: marcarlo sería un verde que el disco no respalda, que es el modo de fallo del CR-01 de la Phase 44 y el precedente de la id 9 del ledger. Lo cierran los planes 47-02 y 47-03.
- **Ninguna cifra de este SUMMARY se transcribió del plan ni del prompt de continuación:** las de cobertura y sujeto se recomputaron del disco al ejecutar el Task 3, y las del reporter y la suite se copiaron de su salida.

## Deviations from Plan

Ninguna en el Task 3. La ruta que el plan preveía como condicional —«si el quórum la marcó, se escribe la excepción», y entonces el checkpoint tiene sujeto— es la que ocurrió, así que el plan se ejecutó por la rama que él mismo había previsto.

**Cero overrides de autor.** Ninguna variante los necesitó: el único `incorrecta` de la fase se disolvió arreglando el DOC, que es donde estaba el hueco, no la traducción.

## Issues Encountered

- **`gemini-2.5-flash-lite` listado pero no invocable (404).** Resuelto por el auto-fallback del script hacia `gemini-3.5-flash-lite`; el `by` escrito registra el modelo real. Documentado arriba y en el ledger.
- **Un `disputed` en `partitivos-clasificacion#0`.** Resuelto CON TRABAJO y sin atajo: se diagnosticó como hueco del doc de criterios y se re-validó desde cero bajo el doc amendado. La traducción no se tocó para complacer al evaluador, que era justo la trampa que el plan prohibía.

## User Setup Required

Ninguno. `DEEPSEEK_API_KEY` y `GEMINI_API_KEY` ya estaban en `.env` desde la Phase 46; aquí solo se consumen.

## Next Phase Readiness

- **El alcance queda resuelto POR ESCRITO antes de que arranque 47-02**, que es justo lo que el criterio de aceptación del Task 3 exigía: los planes siguientes no heredan la decisión implícita.
- **47-02** (cerrar las 43 restantes de `partitivos`) y **47-03** (las 62 de `articoli`) pueden arrancar. `articoli` todavía debe engancharse al array de cobertura en 47-03, en el mismo commit que reciba su primera traducción.
- **Aviso para 47-02/03:** el doc de criterios YA está amendado. Toda traducción nueva del bloque nace bajo el doc vigente y no arrastra deuda de alcance. Si algún plan posterior necesitara amendarlo OTRA VEZ, la regla enmendada obliga a rehacer las dos condiciones del carve-out desde cero: no se hereda.
- **Backstop que sigue abierto:** los long-text de las ids 21 y 22 del ledger se arrastran a esta fase. Las traducciones de este plan son cortas y no le dan sujeto; `articoli` traerá frases más largas en 47-03.

## Self-Check: PASSED

- `content/exercises/partitivos.json` — FOUND · `scripts/run-validation-271.mjs` — FOUND · `docs/TRANSLATION-VALIDATION-PROMPT.md` — FOUND · `46-CONTEXT.md` — FOUND · `.planning/WINDOWS.md` — FOUND
- Commits `da06087`, `dc661e0`, `e669817` — los tres FOUND en `git log`
- Cifras del reporter y de la suite copiadas de su salida real; cifras de cobertura y sujeto recomputadas del disco

---
*Phase: 47-traducci-n-bloque-art-culos-articoli-partitivos*
*Completed: 2026-08-14*
