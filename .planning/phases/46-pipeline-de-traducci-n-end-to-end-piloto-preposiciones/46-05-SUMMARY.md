---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
plan: 05
subsystem: testing
tags: [mutation-testing, gates, quorum, s4-acentos, backstop, abstencion, render, uat, checkpoint]

# Dependency graph
requires:
  - phase: 46-01
    provides: "las dos superficies de render (`.session-translation`, `.summary-error-translation`) y su regla CSS compartida"
  - phase: 46-02
    provides: "`scripts/validate-translation-pass.mjs` y `docs/TRANSLATION-VALIDATION-PROMPT.md` (criterio S4 = acentos RAE)"
  - phase: 46-03
    provides: "el sub-gate TRAD-COV del reporter y GATE-02; la mutación 3 de D-46-18 ya ejecutada allí"
  - phase: 46-04
    provides: "las 96 traducciones `validated` — sin ellas las mutaciones 1 y 2 no tienen sujeto"
provides:
  - "Las TRES mutaciones de D-46-18 EJECUTADAS con su rojo observado (la 3 en 46-03; la 1 y la 2 aquí), exit codes y líneas transcritas en `46-05-MUTACIONES-EVIDENCIA.md`"
  - "S4 (acentos RAE) PROBADO por primera vez con sujeto real: los DOS vendors devuelven `incorrecta` con el tag `[S4-acentos]`"
  - "El cambio de diseño del autor: la traducción vive FUERA de la caja de feedback, en sitio fijo justo encima del CTA (D-46-06/07 enmendadas)"
  - "V6 reescrita al invariante nuevo y verificada por mutación (M-A), y V5 (no-leak) re-verificada en el sitio nuevo (M-B)"
  - "REND-01..05 confirmados en pantalla por el autor el 2026-08-13"
  - "3 backstops ABSTENIDOS por escrito (E1/E2 long-text + TRAD-01/encoding), arrastrados a las Phases 47-53"
affects: [47-53-resto-de-categorias, 46-verificacion-de-fase]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
# Medido con estimateTokens (chars/4) sobre el diff REAL del rango `edd45d9..HEAD`
# ANTES de este SUMMARY: 80 873 caracteres añadidos → 20 218.
actuals:
  tokens: 20218
  tasks: 3
  commits: 7

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mutación con script que ABORTA si no localiza el nodo: una mutación que no muta y sale verde es el peor resultado posible"
    - "Restauración por COPIA de fichero con md5 verificado a los dos lados, nunca `git checkout`/`git stash`/`git clean`"
    - "Un gate REESCRITO se verifica con la misma mutación que verificaría el código que arregla (M-A prueba el invariante nuevo, M-B que el viejo sigue mordiendo tras mover el nodo)"
    - "Un `backstop` cuya PREMISA no tiene sujeto en el corpus se ABSTIENE (`human_needed`), no se convierte en `covered` porque el autor aprobó otra cosa"
    - "Dos fotos de verificación FECHADAS aparte en vez de sobreescribir la primera (CR-01 de la Phase 44)"

key-files:
  created:
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-05-MUTACIONES-EVIDENCIA.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-05-SUMMARY.md
  modified:
    - index.html
    - app.css
    - tests/screen-translation.test.js
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-UI-SPEC.md

key-decisions:
  - "D-46-06/07 ENMENDADAS a petición del autor viendo la app: la traducción sale de `.session-feedback` y se sitúa en sitio FIJO justo encima del CTA — el mismo sitio acertando y fallando"
  - "La razón de NO ponerla bajo el prompt italiano SIGUE VIGENTE aunque ya no sea el sitio elegido: post-corrección el hueco se rellena con la opción SELECCIONADA (`index.html:537`), así que la frase de arriba puede mostrar la palabra equivocada"
  - "D-46-08 pasa a significar «mismo CRITERIO DE ESTILO en las dos superficies», NO misma posición: en el resumen no hay CTA, así que el hueco equivalente no existe y la card sigue siendo el contenedor semántico de la traducción"
  - "El corpus NO se committea en este plan: las mutaciones 1 y 2 son destructivas-y-restauradas por diseño y commitear contenido habría materializado T-46-23"
  - "VAL-08 se queda en PASS durante la mutación 2 y el gate NO se toca: los `disputed` de nivel traducción los consume TRAD-COV, que es su sitio; lo que sobra es la expectativa escrita en el criterio de aceptación"
  - "Los 3 backstops se ABSTIENEN, no se cierran: la aprobación del autor cubre el render (REND-01..05), no una envoltura multilínea que este corpus no produce ni una lectura de muestra que no hizo"
  - "El fallo de `tests/requirements-traceability.test.js` queda ABIERTO y fuera de scope: arreglarlo aquí sería tocar un gate sin correr la mutación que verifica que sigue mordiendo"

patterns-established:
  - "La aprobación de un checkpoint se registra con la GRANULARIDAD de lo que el autor miró; una palabra («Perfecto») no se infla a cobertura de todo el plan"
  - "Un gate que cuenta literales sobre TODO el fichero cuenta también los COMENTARIOS: documentar la prohibición dentro del comentario pone el gate rojo (deuda #14 de la Phase 44, reaparecida)"
  - "El contenido se hace `fetch` UNA sola vez al arrancar la app: toda UAT de contenido empieza recargando la pestaña, no empezando un examen nuevo"

requirements-completed: [TVAL-04, GATE-01, GATE-02, TRAD-01]

coverage:
  - id: D1
    description: "MUTACIÓN 1 — una sola traducción en `pending` entre las 96 pone TRAD-COV en ROJO; los DOS lados del umbral ejecutados (95/96 → rojo, 96/96 → verde)"
    requirement: "TVAL-04"
    verification:
      - kind: integration
        ref: "`node scripts/run-validation-271.mjs` sobre `preposiciones-di-origen#0` con `passes: []` → exit 1, `TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=1, missing=0, disputed=0)`; restaurado → exit 0 y PASS (96/96). Registro literal en 46-05-MUTACIONES-EVIDENCIA.md §MUTACIÓN 1"
        status: pass
    human_judgment: false
  - id: D2
    description: "MUTACIÓN 2 — texto sin tildes → el quórum lo caza con `[S4-acentos]` → `deriveStatus` da `disputed` → TRAD-COV en ROJO nombrando la dirección compuesta"
    requirement: "GATE-01"
    verification:
      - kind: integration
        ref: "`preposiciones-sullo#0` («El azúcar está en la estantería.» → «El azucar esta en la estanteria.»): 2/2 `incorrecta` con `[S4-acentos]` (`deepseek-chat` y `gemini-3.5-flash-lite`), reporter exit 1 con `FAIL (95/96 — pending=0, missing=0, disputed=1)` y `→ Disputed: preposiciones-sullo#0`; restaurado → exit 0. 46-05-MUTACIONES-EVIDENCIA.md §MUTACIÓN 2"
        status: pass
    human_judgment: false
  - id: D3
    description: "El corpus vuelve byte a byte a la foto verde: ninguna mutación queda committeada (T-46-23)"
    requirement: "TRAD-01"
    verification:
      - kind: integration
        ref: "`md5sum content/exercises/preposiciones.json` = `54d278382195464a8adfed62f9a32c19` idéntico antes y después (y re-medido al escribir este SUMMARY); `git status --porcelain content/exercises/preposiciones.json` vacío"
        status: pass
    human_judgment: false
  - id: D4
    description: "V6 reescrita al invariante nuevo (traducción FUERA de la caja, encima del CTA) y verificada por MUTACIÓN, no leyéndola"
    verification:
      - kind: unit
        ref: "M-A (devolver el nodo dentro de `.session-feedback`) → `node --test tests/screen-translation.test.js` exit 1, 3 subtests rojos (47/50); restaurado → 50/50 exit 0. 46-05-MUTACIONES-EVIDENCIA.md §MUTACIÓN M-A"
        status: pass
    human_judgment: false
  - id: D5
    description: "El no-leak (V5 / R1 / D-46-11) sigue mordiendo con el nodo en su sitio NUEVO: el doble guard no quedó sin gate al mover la traducción"
    verification:
      - kind: unit
        ref: "M-B (quitar `sessionFeedback !== null &&` del `x-show`) → exit 1, 2 subtests rojos (48/50), el gate IMPRIME el nodo infractor; restaurado → 50/50 exit 0"
        status: pass
    human_judgment: false
  - id: D6
    description: "REND-01..05 confirmados EN PANTALLA por el autor tras la enmienda de D-46-06: misma posición acertando y fallando, no antes de contestar, «¿Por qué?» intacto, traducción en cada card de «Errores cometidos»"
    requirement: "REND-01"
    verification:
      - kind: manual_procedural
        ref: "checkpoint:human-verify del plan 46-05, 2026-08-13: el autor recarga `http://localhost:3000`, comprueba los cuatro puntos y responde «Perfecto»"
        status: pass
    human_judgment: true
    rationale: "Es una verificación visual: ningún test puede juzgar que la traducción «se vea claro» en el sitio nuevo. Lo confirmó el autor en pantalla, y se registra con la granularidad exacta de lo que miró — los cuatro puntos que se le pidieron comprobar, no el plan entero."
  - id: D7
    description: "E1 · long-text — envoltura multilínea de la traducción entre la caja y el CTA, sin desborde, sin truncado y sin desplazar el CTA"
    verification:
      - kind: manual_procedural
        ref: "ABSTENIDO. La traducción más larga del piloto (`preposiciones-sugli#1`, 57 caracteres = 390 px medidos en Chrome headless sobre el CSS real) cabe en UNA línea a 1400/1100/900/800/700 px de viewport. La prueba sintética (165 chars → 2 líneas limpias en las dos superficies) es PREPARACIÓN, no cierre"
        status: unknown
    human_judgment: true
    rationale: "La premisa «2+ líneas» NO TIENE SUJETO en el corpus del piloto, así que el autor no puede confirmarla mirando contenido real. Decisión explícita del autor el 2026-08-13 (commit `4291c8a`): ABSTENER por ausencia de sujeto. El cambio de sitio del 2026-08-13 no la revierte — mueve el nodo, no alarga el contenido. Se arrastra a las Phases 47-53. NO se convierte en `covered` por el «Perfecto» del autor: eso fue sobre el render, no sobre una envoltura que no existe aquí."
  - id: D8
    description: "E2 · long-text — la misma envoltura multilínea dentro de la card de «Errores cometidos»"
    verification:
      - kind: manual_procedural
        ref: "ABSTENIDO por la misma ausencia de sujeto; medido igual (57 chars = 390 px = 1 línea) en `.summary-error-translation`"
        status: unknown
    human_judgment: true
    rationale: "Misma razón que D7. La superficie 2 no cambió con la enmienda del 2026-08-13, así que la abstención se arrastra intacta a las Phases 47-53."
  - id: D9
    description: "TRAD-01/encoding — las 96 traducciones se leen como español natural, acentuado y con el registro adecuado"
    requirement: "TRAD-01"
    verification:
      - kind: integration
        ref: "autoridad mecánica: el quórum cross-vendor, 96/96 `validated` con 2 `by` distintos (plan 46-04)"
        status: pass
      - kind: manual_procedural
        ref: "ABSTENIDO en su mitad humana: la lectura de muestra de 3-4 slots completos del punto 7 del checkpoint no se realizó"
        status: unknown
    human_judgment: true
    rationale: "Su autoridad mecánica es el quórum y ESA mitad pasó. Lo que queda abstenido es el último lector humano: el autor aprobó los cuatro puntos de render, no una lectura de muestra que no hizo. Un backstop sin evidencia se abstiene, nunca pasa en silencio."

# Metrics
duration: 2h 01m
completed: 2026-08-13
status: complete
---

# Phase 46 Plan 05: Los gates muerden, y el autor movió la traducción de sitio Summary

**Las TRES mutaciones de D-46-18 están ejecutadas con su rojo observado y su exit code apuntado (ninguna leída), S4 quedó PROBADO por primera vez con sujeto real —los dos vendors cazan el texto sin tildes con el tag `[S4-acentos]`—, y el checkpoint produjo un CAMBIO DE DISEÑO que el autor pidió con la app delante: la traducción sale de la caja de feedback y vive en sitio fijo justo encima del CTA, con V6 reescrita y re-verificada por mutación.**

## Performance

- **Duration:** ~2h 01m (21:47 → 23:49 CEST del 2026-08-13, desde el commit de cierre de 46-04)
- **Tasks:** 3 (2 automáticas + 1 checkpoint bloqueante, cerrado por el autor)
- **Commits:** 7 (6 de ejecución + este de cierre)
- **Mutaciones ejecutadas en este plan:** 4 (las 2 del plan + M-A y M-B del cambio de diseño), las 4 con rojo observado en exit 1
- **Estimate vs actual:** el plan estimaba 40 000 tokens (`raw_tokens: 80 000`); el coste medido con `estimateTokens` (chars/4) sobre el diff real de `edd45d9..HEAD` es **20 218**. La mitad de lo estimado, y aun así el plan duró 2 horas: el trabajo caro fue el cambio de diseño no planificado y las 4 corridas de mutación, no la escritura.

## Cifras DERIVADAS del disco al escribir este SUMMARY (2026-08-13T21:49Z)

Ninguna de estas cifras se copió del plan, del prompt de la sesión ni del fichero de evidencia: todas se midieron ahora.

| Magnitud | Comando | Valor medido |
|---|---|---|
| Reporter de cierre | `node scripts/run-validation-271.mjs` | **exit 0** · `TRAD-COV (96/96 traducciones validated): PASS (96/96)` · VAL-04/06/08/09 PASS · `VAL-06 (250/250 validated): PASS (250/250)` · `Milestone gate PASS.` |
| Suite completa | `node --test tests/*.test.js tests/fixtures/*.test.js` | **exit 1** — 1308 tests · 224 suites · **1304 pass** · **4 fail** |
| Único rojo de la suite | `grep '^not ok'` sobre la misma corrida | `not ok 140 - trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)` (una sola entrada) |
| Gate de esta fase | `node --test tests/screen-translation.test.js` | **exit 0** — 50/50 |
| Corpus | script sobre `content/exercises/preposiciones.json` | 50 slots · **96 variantes `multiple-choice`** · 96 con `translationES` · **96 `validated`** · 0 `pending` · 0 `disputed` |
| `by` de los pases | ídem | `deepseek-chat`: 96 · `gemini-3.5-flash-lite`: 96 |
| Traducciones con el hueco | `grep -c '"text": "[^"]*___'` | **0** |
| md5 del corpus | `md5sum` | `54d278382195464a8adfed62f9a32c19` — **idéntico** a la foto verde del 2026-08-13T19:50:46Z |
| Traducción más larga | comando del checkpoint (derivado, no elegido a ojo) | `preposiciones-sugli#1` · **57 caracteres** · `"Las fotos están sobre los estantes, encima de los libros."` |
| Motor byte-intacto (V8) | `git diff --stat HEAD -- src/domain/ src/screens/app.js` | **vacío** |
| Glosas duplicadas | script sobre disco | 16 variantes con glosa de FRASE COMPLETA · **16 coinciden** con su traducción · 2 sin comillas (`preposiciones-col#0`, `#1`) |

### Una contradicción MEDIDA, y gana el disco

`46-05-MUTACIONES-EVIDENCIA.md` afirma que la deuda de trazabilidad «está roja en el baseline pre-fase `19f41a9` con las **mismas cifras exactas** (1299/1295/4)». **Eso es falso en las cifras.** Medido ahora extrayendo el árbol de `19f41a9` con `git archive` y corriendo la suite allí:

```
# tests 1182
# suites 204
# pass 1178
# fail 4
not ok 138 - trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)
```

**El baseline es 1182 / 1178 / 4, no 1299 / 1295 / 4.** Lo que SÍ es verdad —y es lo que importa— es el invariante: **el mismo único fichero rojo y los mismos 4 subtests fallando**, antes y después. Los totales difieren porque la fase 46 añadió tests (1182 → 1299 tras las mutaciones → 1308 tras el cambio de diseño). La frase «las mismas cifras exactas» era una afirmación en prosa sobre un número que nadie volvió a medir: exactamente el mecanismo del CR-01 de la Phase 44. Se retracta aquí por escrito en vez de corregirse en silencio en el fichero de evidencia, que se deja tal cual como foto fechada de su momento.

## Accomplishments

- **Las TRES mutaciones de D-46-18 están ejecutadas y ninguna se leyó** (la 3 en 46-03 Task 3; la 1 y la 2 aquí), y **más dos que no estaban en el plan** porque el cambio de diseño tampoco lo estaba. Las cuatro de este plan salieron en **exit 1** con su línea impresa transcrita. El registro literal vive en `46-05-MUTACIONES-EVIDENCIA.md`, ya commiteado (`de6293f`, `dac1dda`) — es el audit trail y la mitigación de T-46-24, y este SUMMARY lo resume sin duplicarlo.
- **S4 (acentos RAE) tiene sujeto por primera vez y MUERDE con los dos vendors.** El plan 46-04 cerró con **cero** flags `[S4-acentos]` en 192 respuestas y lo dejó declarado como criterio sin probar «por ausencia de sujeto». La mutación 2 le dio sujeto: los dos vendors devolvieron `incorrecta` nombrando las tres tildes exactas, y Gemini además citó la regla RAE de cada una. El camino del punto 5 del plan (reforzar el doc y re-validar) **no se activó**: el prompt no cambió, así que no hay nada que re-validar.
- **El cambio de diseño que el autor pidió con la app delante, hecho y con su gate re-verificado.** La traducción sale de `.session-feedback` y se sitúa entre la caja y el CTA. V6 se reescribió del invariante viejo al nuevo, y **la reescritura se probó con la misma mutación que probaría el código**: M-A devolvió el nodo a dentro de la caja → 3 subtests rojos; M-B quitó el guard de estado resuelto → V5 en rojo con el nodo infractor impreso. El no-leak sigue vivo en el sitio nuevo.
- **REND-01..05 confirmados en pantalla por el autor**, con su granularidad (abajo).
- **3 backstops ABSTENIDOS por escrito, no cerrados en silencio.**

## Task Commits

| # | Task / trabajo | Commit | Tipo |
|---|---|---|---|
| 1 y 2 | Las mutaciones 1 y 2 — evidencia con exit codes y líneas literales | `de6293f` | docs |
| 3 | Decisión del autor: los dos backstops `long-text` se ABSTIENEN | `4291c8a` | docs |
| 3 | Cambio de diseño: la traducción fuera de la caja, encima del CTA | `ad9097c` | feat |
| 3 | Enmiendas de D-46-06/07/08 y contrato UI actualizado al sitio nuevo | `bcb2ccd` | docs |
| 3 | M-A y M-B con el rojo observado y sus exit codes | `dac1dda` | docs |
| 3 | Las 16 glosas duplicadas anotadas en el ledger | `e97b495` | docs |

**Las Tasks 1 y 2 no tienen commit de producción, y es lo correcto.** Son destructivas-y-restauradas por diseño y el corpus vuelve byte a byte a la foto verde (md5 idéntico); commitear contenido aquí habría materializado **T-46-23** (una mutación que queda committeada). Su evidencia sí está commiteada, que es donde tiene valor.

## Las dos mutaciones del plan (resumen; el registro literal está en el fichero de evidencia)

| Mutación | Dirección compuesta | Qué se cambió | Exit | Línea observada |
|---|---|---|---|---|
| **1** | `preposiciones-di-origen#0` | `validation.passes` a `[]`, `status` a `pending`. **El texto NO se tocó** — prueba el umbral, no la calidad | **1** | `TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=1, missing=0, disputed=0)` |
| **2** | `preposiciones-sullo#0` | «El azúcar está en la estantería.» → «El azucar esta en la estanteria.» (3 tildes fuera) + `passes: []` | **1** | `TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=0, missing=0, disputed=1)` + `→ Disputed: preposiciones-sullo#0` |

Las dos cifras del FAIL las **interpola el reporter** desde valores computados (`totalTranslationValidated` y `TOTAL_TRANSLATION_EXPECTED`, derivado con `mcVariantCountOf` del propio fichero): ninguna la transcribió el ejecutor. Restauración por **copia de fichero** en los dos casos (no `git checkout`, no `git stash`, no `git clean`), con md5 verificado a los dos lados, y verde re-verificado con exit 0.

**Ningún escáner mecánico de acentos se creó** (T-46-25): `git status --porcelain scripts/ tests/ docs/` vacío durante la mutación 2. La autoridad sobre acentos es el quórum, como cerró D-46-12.

## Las dos mutaciones del cambio de diseño

| Mutación | Qué prueba | Exit | Rojo observado |
|---|---|---|---|
| **M-A** | El gate NUEVO muerde: devolver el nodo a DENTRO de `.session-feedback` | **1** | 3 subtests de V6 (47/50). Mensaje: `la traducción está DENTRO de la caja de feedback (índice 3845 en el rango [2790, 5014))`. Los tres índices los **deriva el extractor** del `index.html` de disco |
| **M-B** | El gate VIEJO más importante sigue mordiendo tras mover el nodo: quitar `sessionFeedback !== null &&` del `x-show` | **1** | 2 subtests de V5 (48/50). El gate **imprime el nodo infractor**, no un booleano |

M-A dejó la cláusula de no-vacuidad en VERDE mientras los tres subtests caían, que es lo correcto: la región se localizó bien y el rojo vino del hecho medido, no de un extractor que dejó de casar. `index.html` restaurado por copia, md5 `c8fc861125a8224be4b029525b1efc7c` idéntico, 50/50 después.

## La enmienda de D-46-06 / D-46-07, con la cita del autor

Durante el propio checkpoint, viendo la app funcionando con las 96 traducciones en pantalla, el autor pidió mover la traducción:

> «creo que en vez de meterlo en el cuadro del error, me gusta más que esté fuera, que se vea claro, […] o justo encima del botón de continuar para verlo siempre, se me hace difícil verlo dentro de la caja de error, cuando aciertas está perfecto»

El orden narrativo de la decisión original (**qué era → qué significa → por qué**, dentro de la caja) no era falso, pero perdía contra un hecho de uso que solo se ve con la app delante: al ACERTAR la caja tiene una línea y al FALLAR está tintada de rojo y densa, así que la traducción **cambiaba de sitio visual** entre los dos casos y en el de fallo se camuflaba dentro del recuadro de error. Fuera de la caja el sitio es siempre el mismo y siempre justo antes del gesto de avanzar.

**Lo que la enmienda NO cambia, y sigue vigente:**

- **La razón de NO ponerla bajo el prompt italiano.** Post-corrección el hueco del prompt se rellena con **la opción que el usuario SELECCIONÓ**, no con la correcta (`index.html:537`, `options?.[sessionSelectedIndex]`): al fallar, la frase italiana de arriba muestra la palabra equivocada tachada en rojo, y pegarle debajo la traducción de la frase CORRECTA dejaría dos frases contiguas que no se corresponden. Ese sitio se le planteó al autor junto con este y **lo descartó explícitamente por ese motivo**. La enmienda elige otro sitio; no absuelve al descartado.
- **El no-leak (R1 / D-46-11).** El doble guard `sessionFeedback !== null && …translationES?.text` se conserva VERBATIM. «Verlo siempre» significa **siempre en el mismo sitio, aciertes o falles**, nunca antes de responder. Y no se dio por hecho: M-B lo verificó por mutación en el sitio nuevo.
- **La distinción tipográfica de D-46-07.** Serif Spectral 16/400/1.5 ink, sin etiqueta y sin comillas envolventes. Lo único que la enmienda toca de esa decisión es el **margen** (`16px 0` en pantalla, porque `.session-cta` no declara `margin-top` y el hueco traducción→CTA era 0 px medidos).

### D-46-08 pasa a significar «mismo criterio de ESTILO», no «misma posición»

Antes esta decisión significaba *«misma anatomía en las dos superficies»*. Con D-46-06 enmendada significa **«mismo CRITERIO DE ESTILO (serif 16/400/1.5 ink, declarado UNA sola vez en el selector doble), posición distinta porque el contexto es distinto»**.

**La divergencia es correcta y no una incoherencia: en el resumen NO hay botón de avance**, así que el hueco equivalente —«justo encima del CTA»— simplemente no existe ahí. Repetir la posición nueva habría significado sacar la traducción de la card, y entonces dejaría de pertenecer al error que comenta: la card **es** su contenedor semántico. Lo que el autor pidió es que la traducción esté siempre en el mismo sitio **dentro de la pantalla de ejercicio**, que es donde estudia. Consecuencia práctica en el CSS: la tipografía sigue en una sola declaración (V2) y solo el margen se declara por superficie.

## La aprobación del autor, con la granularidad de lo que miró

**Respuesta literal del autor: «Perfecto».** Una palabra, el 2026-08-13, **después** de aplicarse el cambio de diseño y **después** de habérsele pedido que comprobara al recargar exactamente cuatro cosas:

1. que la traducción sale en el **MISMO sitio** acertando y fallando (debajo del recuadro, encima de «Continuar →»);
2. que **no sale antes de contestar**;
3. que **«¿Por qué?» sigue revelando solo la explicación**, sin mover la traducción;
4. que en **«Errores cometidos»** del resumen cada frase fallada lleva su traducción debajo.

**Quedan confirmados por el autor en pantalla: REND-01, REND-02, REND-03, REND-04 y REND-05.**

**Lo que ese «Perfecto» NO cubre**, y por tanto no se cierra:

- **Los dos backstops `long-text`** (E1 y E2 del §UI Considerations de `46-UI-SPEC.md`). El autor dijo perfecto sobre el RENDER, no sobre una envoltura multilínea que este corpus no produce. Siguen **ABSTENIDOS** (ver abajo).
- **El backstop de TRAD-01/encoding en su mitad humana**: la lectura de muestra de 3-4 slots completos (punto 7 del checkpoint) no se hizo. Su autoridad mecánica —el quórum— sí pasó.

## Los 3 backstops ABSTENIDOS (y por qué no son `covered`)

| Backstop | Estado | Razón |
|---|---|---|
| **E1 · long-text** (`.session-translation`) | **ABSTENIDO** → `human_needed` | La premisa «traducción de 2+ líneas» **no tiene sujeto**: la más larga del piloto (`preposiciones-sugli#1`, **57 caracteres = 390 px** medidos contra el CSS real en Chrome headless) cabe en **UNA** línea a 1400/1100/900/800/700 px de viewport; la caja conserva 624 px de contenido en el más estrecho de escritorio |
| **E2 · long-text** (`.summary-error-translation`) | **ABSTENIDO** → `human_needed` | Misma ausencia de sujeto, medida en la segunda superficie. Esta superficie **no cambió** con la enmienda |
| **TRAD-01/encoding** (lectura de muestra) | **ABSTENIDO** en su mitad humana | Autoridad mecánica = el quórum, y esa mitad **pasó** (96/96 `validated`, 2 `by` distintos). El último lector es el autor, y no leyó la muestra |

Decisión explícita del autor sobre los dos primeros, ya commiteada (`4291c8a`): **ABSTENER por ausencia de sujeto**. Se arrastran a las **Phases 47-53**, donde habrá frases más largas.

**El cambio de sitio del 2026-08-13 no revierte la abstención: mueve el nodo, no alarga el contenido.**

La prueba sintética existe y es limpia —una cadena de 165 caracteres envuelve por espacios en las dos superficies, 2 líneas, `overflow-wrap: normal`, `max-width: none`, cero desbordamiento y cero truncado— pero **una cadena sintética no es el contenido del piloto**, así que se registra como PREPARACIÓN y no como cierre. Ningún número de esa medición cierra una `backstop`. Mismo patrón que PRES-05 en el plan 46-04: **ausencia de sujeto, no indulgencia.**

## Hallazgos

### 1. V4 y V9 cuentan literales sobre TODO `index.html`, comentarios incluidos — y eso es un dato de diseño de gates

La primera redacción del comentario del nodo movido mencionaba los literales de copy y el nombre de la directiva de inyección de HTML crudo. **Dos gates existentes se pusieron rojos solos**, sin que nadie los mutara:

```
V4: index.html pasó de 9 a 10 usos de inyección de HTML crudo: T-02-01 prohíbe añadir ninguno
V9: el recuento del literal "Continuar →" cambió: esta fase no añade ni cambia copy de interfaz (3 !== 2)
```

Verificado en el código al escribir este SUMMARY: V4 compara `countOf(htmlSrc, /x-html/g)` contra el mismo recuento en `readHead('index.html')`, y V9 hace lo propio con los cuatro literales de copy contra `readPreFase46('index.html')`. **Las dos magnitudes se miden sobre el fichero ENTERO como texto**, así que un comentario que nombra el token que su propio gate cuenta pone el gate rojo. **Obligó a reescribir la prosa del comentario sin esos tokens.**

**Es la deuda #14 del ledger de la Phase 44 reapareciendo** —un comentario que menciona el token que su propio gate cuenta—, cazada esta vez **por el gate y no por un humano**. No es un incidente: es un dato de diseño para las Phases 47-53, que escribirán 17 tandas de comentarios sobre estas mismas superficies. Anotado en `46-UI-SPEC.md` §DOM Contract y en el ledger.

### 2. El criterio de aceptación de la Task 2 nombraba el sub-gate equivocado (y el gate NO se tocó)

El plan pedía «la línea de **VAL-08** en FAIL nombrando la dirección compuesta mutada». **VAL-08 se quedó en PASS.** No es que el gate no muerda: es que la Task 2 esperaba el rojo donde no le corresponde. Leído en `scripts/run-validation-271.mjs`: `val08Pass = totalDisputed === 0`, y `totalDisputed` se reduce sobre `perCategory`, el bucle de **SLOTS** — VAL-08 es por diseño un gate de nivel slot. Los `disputed` de nivel **traducción** viven en `perTranslationCategory` y los consume **TRAD-COV**, que es quien los imprime y quien nombró `preposiciones-sullo#0` dos veces.

**No queda vía de escape**, que es lo que importa: una traducción `disputed` no es `validated`, así que baja el recuento por debajo del esperado y TRAD-COV sale FAIL necesariamente. **El gate no se ensanchó**: cambiar la semántica de un sub-gate a final de fase, sin mandato del plan y con una redundancia que no compra nada, es el modo de fallo del CR-01. Se deja anotado para el autor, no arreglado en silencio.

### 3. Trampa de UAT para las Phases 47-53: el contenido se hace `fetch` UNA sola vez

Nos costó una ronda entera de diagnóstico en vivo y va a repetirse 17 veces, así que queda escrito. Verificado en el código:

- `src/main.js:74` — `const content = await loadContent(categoryIds)` dentro de `bootstrap()`, que corre **una vez** al arrancar la app y resuelve la promesa `appDataReady`.
- `src/screens/app.js:389` — `const { content, state } = await appDataReady` dentro de `init()`. El contenido queda en `this.content` para toda la vida de la pestaña.
- `grep -n "fetch(" src/screens/app.js` → **cero ocurrencias**: `startSession()` **NO** vuelve a leer el JSON.

**Consecuencia práctica: empezar un Examen nuevo NO recarga el contenido.** Una pestaña abierta desde antes de editar el JSON sigue sirviendo contenido viejo, y el síntoma se lee como un bug de render que no existe. **Toda UAT de contenido empieza recargando la pestaña (F5), nunca empezando una sesión nueva.**

> Nota: el prompt de esta sesión situaba el `await appDataReady` en `app.js:390`; el disco dice **389** (`init()` abre en 388). Gana el disco.

## Deviations from Plan

### 1. [DECLARADA — cambio de alcance pedido por el AUTOR durante el checkpoint] La traducción cambia de sitio

No es una desviación del ejecutor: es lo que el autor pidió **viendo la app**, que es exactamente para lo que existe un `checkpoint:human-verify`. Lo que la convierte en desviación registrable es que **reescribe una aserción** (V6, que congelaba el orden DENTRO de la caja) y **enmienda tres decisiones LOCKED** (D-46-06, D-46-07, D-46-08).

- **Tratamiento:** las tres decisiones se enmendaron **por escrito, con fecha, autoría, cita y motivo** en `46-CONTEXT.md`, conservando el cuerpo de la decisión original — nunca sobreescritas en silencio, porque un registro que miente certifica en verde (CR-01 de la Phase 44). Precedente de forma: D-46-01 también se corrigió en sesión y lo dice en su propio cuerpo.
- **Verificación:** M-A y M-B, con rojo observado en exit 1. Un invariante nuevo cuya mordida no se ha visto es prosa.
- **Files modified:** `index.html`, `app.css`, `tests/screen-translation.test.js`, `46-CONTEXT.md`, `46-UI-SPEC.md`. Cero contenido, motor byte-intacto.
- **Commits:** `ad9097c`, `bcb2ccd`, `dac1dda`.

### 2. [DECLARADA, heredada del plan 46-04 — no se re-litiga] La autoría fue por LOTES de ~5 slots por subagent (D-46-15)

Se arrastra tal cual y **no se reescribe como si hubiera sido limpia**: D-46-15 prescribía **1 slot por subagent** y la unidad real fue un **lote de ~5 slots por subagent (10 subagents)**. Cada slot se vio **entero** (su `explanation` + sus variantes hermanas), así que la coherencia entre hermanas —que es lo que D-46-15 protege— **se preserva**, y la independencia generador/validador queda **intacta** (autoría Claude, validación DeepSeek + Gemini; los `by` del corpus lo confirman por disco). Lo que se degradó es el **aislamiento de contexto**, no la independencia del quórum. Queda en el registro de la fase para que el cierre no lo redescubra.

### 3. [DECLARADA] La Task 2 esperaba el rojo en VAL-08 y salió en TRAD-COV

Ver §Hallazgos 2. La cobertura está completa; lo que sobra es la expectativa escrita en el criterio de aceptación. **No se tocó el gate.**

### 4. [DECLARADA] El criterio `node --test … exit 0` de las Tasks 1 y 2 NO se cumple, y no se silencia

La suite sale en **exit 1** por los 4 subtests de `tests/requirements-traceability.test.js`. Ver §Deferred Issues: es deuda pre-existente, ajena al corpus y fuera de scope. **Queda ABIERTO, no cerrado.**

---

**Total deviations:** 4 declaradas · **0 auto-arregladas** · 0 cambios de código de producción fuera del que el autor pidió.
**Impact:** el cambio de diseño es más trabajo del planificado y mejor diseño del planificado. Cero scope creep del ejecutor: no se inventó ningún gate, no se ensanchó ninguno y no se arregló nada pre-existente.

## Issues Encountered

- **La ronda de diagnóstico del `fetch` único.** Durante la UAT la traducción «no aparecía» en una pestaña que llevaba abierta desde antes de la autoría. No era un bug de render: era contenido viejo en memoria. Ver §Hallazgos 3 — anotado como nota de UAT precisamente para que las Phases 47-53 no la paguen otra vez.
- **La prosa del comentario puso dos gates rojos sin mutarlos.** Ver §Hallazgos 1.
- **El fichero de evidencia afirmaba una cifra de baseline que no era.** Ver §Una contradicción MEDIDA. Retractada por escrito, con la corrida real transcrita.

## Known Stubs

Ninguno. Las dos superficies pintan texto real, `validated`, y las 96 traducciones están en disco.

## Deferred Issues

- **`tests/requirements-traceability.test.js` — 4 subtests rojos, ABIERTO, y quiere su propio quick task verificado por mutación.** Medido: rojo en el baseline `19f41a9` (1182/1178/4) con el mismo único fichero y los mismos 4 subtests, y rojo hoy (1308/1304/4). Es la deuda de la transición a v2.1: `REQUIREMENTS.md` ya no lleva el ancla `**Coverage: N/N …**` a la que ese gate se engancha, y la tabla de trazabilidad no tiene las filas que espera. **Independencia respecto del corpus verificada:** ese fichero solo lee `.planning/REQUIREMENTS.md`, cero acoplamiento con `content/exercises/`. Fuera de scope por la regla de no auto-arreglar fallos pre-existentes ajenos a la tarea, y **arreglarlo aquí sería tocar un gate sin correr la mutación que verifica que sigue mordiendo**. Ya registrado en `.planning/WINDOWS.md` id **17** (y su hermana estructural, id 16 de la Phase 45).
- **Las 16 glosas duplicadas.** Decisión del autor: **se dejan**. Ya en el ledger, id **20**. Es dato para las Phases 47-53: si al usar la app molesta ver el español dos veces, la palanca es acortar la glosa del `prompt`, no la traducción — y tocar la traducción obligaría a re-validar (D-46-12).
- **VAL-08 no cubre los `disputed` de nivel traducción.** No es un agujero (TRAD-COV los caza necesariamente), pero es una asimetría que quien lea los sub-gates debe conocer. Anotado, no arreglado.

## Next Phase Readiness

**Para el cierre de la fase 46** (aggregate → code review → verify, que corre el orquestador): reporter en **exit 0**, gate de la fase (`tests/screen-translation.test.js`) en **50/50**, motor **byte-intacto**, corpus con md5 idéntico a la foto verde, `git status` sin mutaciones residuales, y las 3 mutaciones de D-46-18 ejecutadas con rojo observado. El único rojo de la suite es la deuda pre-existente de trazabilidad, declarada arriba. `ROADMAP.md` **no se tocó**: `update_roadmap` es del orquestador.

**Para las Phases 47-53:**

- **Los 3 backstops abstenidos viajan con la fase.** E1/E2 `long-text` necesitan una categoría con frases más largas; la primera que las produzca debe re-probarlas en pantalla. El backstop de lectura de muestra de TRAD-01/encoding también sigue esperando ojos humanos.
- **Empieza toda UAT recargando la pestaña.** El contenido se hace `fetch` una vez (`src/main.js:74` → `src/screens/app.js:389`); un Examen nuevo NO recarga el JSON.
- **Cuidado al comentar el HTML.** V4 y V9 cuentan literales sobre el fichero entero, comentarios incluidos. Documentar una prohibición nombrando el token prohibido pone el gate rojo.
- **S4 ya está probado y muerde con los dos vendors.** No hace falta volver a darle sujeto artificialmente; si aparece un flag `[S4-acentos]` sobre español real, es bug REAL (PRES-05) y se arregla el acento, no se overridea.
- **El sitio de la traducción es LOCKED-enmendado, no negociable por comodidad.** Cualquier superficie nueva que pinte `translationES` hereda el doble guard verbatim, o V5 la caza.

## Self-Check: PASSED

- Los 6 commits declarados existen en `git log`: `de6293f`, `4291c8a`, `ad9097c`, `bcb2ccd`, `dac1dda`, `e97b495`.
- `46-05-MUTACIONES-EVIDENCIA.md` existe en disco y está commiteado (`de6293f` + `dac1dda`).
- `node scripts/run-validation-271.mjs` → **exit 0**, `TRAD-COV: PASS (96/96)`, `Milestone gate PASS.` (medido al escribir).
- `node --test tests/*.test.js tests/fixtures/*.test.js` → **1308 / 1304 pass / 4 fail**, un único fichero rojo, el pre-existente. Cero regresiones nuevas.
- `node --test tests/screen-translation.test.js` → **exit 0**, 50/50.
- Baseline `19f41a9` re-medido con `git archive` en un árbol aparte: **1182 / 1178 / 4**, mismo fichero rojo. La cifra que el fichero de evidencia afirmaba (1299/1295/4) queda **retractada**.
- Corpus derivado del disco: 96 variantes `multiple-choice` · 96 `validated` · 0 `pending` · 0 `disputed` · 0 traducciones con `___` · md5 `54d278382195464a8adfed62f9a32c19`.
- `git diff --stat HEAD -- src/domain/ src/screens/app.js` → **vacío** (V8, D-46-01).
- `git status --porcelain content/exercises/preposiciones.json` → **vacío**: ninguna mutación residual (T-46-23).
- Los 3 backstops siguen **ABSTENIDOS** en este SUMMARY (`status: unknown`, `human_judgment: true`) y en `46-UI-SPEC.md`. Ninguno se convirtió en `covered`.
- `ROADMAP.md` **sin tocar**.

---
*Phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones*
*Completed: 2026-08-13*
