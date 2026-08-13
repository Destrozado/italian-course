---
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
plan: 02
subsystem: validation
tags: [quorum, cross-vendor, deepseek, gemini, zero-deps, node-test, file-lock, surgical-json-write, prompt-engineering]

# Dependency graph
requires:
  - phase: 46-01
    provides: "la forma `translationES: { text, validation }` en disco, con la indentación estable (10/12/14) de la que depende la escritura quirúrgica"
  - phase: 09-infraestructura-de-validaci-n
    provides: "`deriveStatus` como fuente única de status y la doctrina de quórum (VAL-03 1-por-1, 2 `by` distintos)"
  - phase: quick-260615-vkr
    provides: "el par plantilla `docs/SONG-VALIDATION-PROMPT.md` + `scripts/validate-song-pass.mjs` (criterios S1-S6, CLI, auto-fallback 429, `--avoid`)"
  - phase: quick-260728-8pg
    provides: "`scripts/lib/file-lock.mjs` — exclusión mutua entre procesos del read-modify-write"
provides:
  - "`docs/TRANSLATION-VALIDATION-PROMPT.md` — los CINCO criterios de traducción (S1, S2 estricta, S4, S5 reformulado, S6), el contrato de output parseable, el few-shot FAIL por tilde ausente, el guard anti prompt-injection y las dos fronteras (explanation / gloss R7)"
  - "`scripts/validate-translation-pass.mjs` — quórum cross-vendor 1-por-1 con dirección compuesta `<slot-id>#<k>` y `writePass` re-estrechado a `variants[k].translationES`"
  - "`tests/fixtures/translation-pilot.json` — fixture adversarial de 4 slots (gemelas de texto idéntico, mixto, word-buttons, validation-de-slot-primero)"
  - "`tests/translation-validator.test.js` — 31 tests: matriz TVAL-01/02/03 probada por escritura real y diff de líneas"
  - "La dirección compuesta `<slot-id>#<k>` como convención de CLI del proyecto para direccionar sub-objetos de variante"
affects: [46-03-gates-de-cobertura, 46-04-expansion-96-variantes, 47-53-resto-de-categorias]

# Actuals (#2632) — pairs with the plan's `estimate` to calibrate future estimates.
actuals:
  tokens: 20995
  tasks: 3
  commits: 5

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Script de pase IMPORTABLE: el entrypoint CLI se guarda tras un check de invocación directa, y el escritor + las funciones puras se exportan para probarse sin red ni subproceso"
    - "Transformación pura `applyPassToText(text, …) → { text, status, mode }` separada del I/O, con el I/O envuelto en `withFileLock`"
    - "Re-estrechamiento del objetivo por niveles antes de ramificar UPDATE/INSERT: slot → array `variants` → k-ésimo objeto hijo → `translationES`"
    - "Acotado de objetos hijos de un array por escaneo string-aware (`childObjectRanges`), en lugar de contar `{` a ciegas"
    - "Inyección de un `caller` en el bucle de la cola de modelos para probar el auto-fallback por comportamiento, sin red"
    - "Aserción de containment en coordenadas de LÍNEA: la región cambiada debe caer dentro de la ventana de la variante objetivo, acotada por un ancla independiente del código bajo prueba"

key-files:
  created:
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - scripts/validate-translation-pass.mjs
    - tests/fixtures/translation-pilot.json
    - tests/translation-validator.test.js
  modified: []

key-decisions:
  - "La dirección compuesta es `<slot-id>#<k>` y el índice es OBLIGATORIO: adivinar la variante 0 cuando falta escribiría en la frase equivocada en silencio"
  - "El script se hace IMPORTABLE (entrypoint tras un guard de invocación directa) porque el analog de canciones no lo es y el plan exige probar el escritor con un `pass` construido a mano; sin eso, el punto de más riesgo de la fase solo podría probarse por subproceso y a ciegas"
  - "`applyPassToText` es una transformación pura de texto; `writeTranslationPass` es su envoltura con `withFileLock`. Así el diff de líneas se puede assertear sin depender del lock"
  - "`run()` devuelve el pase (o `null`) en vez de llamar a `process.exit`: el exit code lo pone el entrypoint, y así el auto-fallback se prueba por comportamiento"
  - "El fixture añade un CUARTO slot con el `validation` del SLOT declarado ANTES de `variants`: en la disposición real (validation al final) la mutación del branch de canciones aterrizaría en el `validation` de la variante 0, no en el del slot, y el caso del slot se quedaría sin probar"
  - "El payload enviado al evaluador NO incluye la `explanation` del slot: mandarla invitaría a fundir traducción y explicación, que es exactamente la frontera que el doc prohíbe cruzar"

patterns-established:
  - "Dirección compuesta `<id>#<k>` para direccionar un sub-objeto de variante desde la CLI, con fail-fast exit 2 y mensaje que nombra SIEMPRE el id y el índice"
  - "El índice de variante es dirección de ENTRADA, nunca almacenamiento: el pase vive DENTRO de `translationES`, así que reordenar `variants` mueve el pase con su frase"
  - "Mutación de gate ejecutada dos veces en un mismo plan: una por el branch del analog y otra por el campo `by`, cada una con su rojo observado y su restauración por copia de fichero"

requirements-completed: [TVAL-01, TVAL-02, TVAL-03]

coverage:
  - id: D1
    description: "El quórum juzga traducciones con criterios de TRADUCCIÓN (S1, S2 estricta, S4, S5 reformulado, S6), nunca con los R1-R7 de gramática de slot, y sin la clave de troceado de canciones"
    requirement: "TVAL-01"
    verification:
      - kind: unit
        ref: "aserciones de contenido sobre el doc: `s3_troceado` = 0 ocurrencias; exactamente 5 claves `sN_*`; 6 secciones `## N.`; `R1-R7` en frase de exclusión"
        status: pass
      - kind: manual
        ref: "el few-shot FAIL de la sección 5 falla por TILDE AUSENTE con el tag `[S4-acentos]`, y el guard de la sección 6 declara los campos de este payload como DATA"
        status: pass
    human_judgment: false
  - id: D2
    description: "Una sola invocación valida UNA traducción (VAL-03) y escribe su pase dentro de `variants[k].translationES.validation`, no en el `validation` del slot ni en el de una hermana"
    requirement: "TVAL-02"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#idempotencia · #aislamiento entre hermanas de texto IDÉNTICO · #no-falso-UPDATE"
        status: pass
      - kind: integration
        ref: "MUTACIÓN del branch por substring del script de canciones → exit 1, 5 tests en rojo; restaurado 31/31"
        status: pass
    human_judgment: false
  - id: D3
    description: "El status sale de `deriveStatus` importado; el script no declara derivación local y el override de autor sigue disponible sin que el script pueda fabricarlo"
    requirement: "TVAL-03"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#importa deriveStatus… · #dos pases del MISMO `by` NO forman quórum · #vacío → pending · #permutación · #pureza · #el override no fabrica quórum"
        status: pass
    human_judgment: false
  - id: D4
    description: "Una variante SIN `translationES` no se envía al quórum y no genera bloque `validation` vacío; el prompt no admite una traducción vacía como PASS"
    requirement: "TVAL-01"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#variante SIN translationES (CLI, exit 2) · #el escritor no escribe nada ni crea un bloque validation vacío"
        status: pass
      - kind: manual
        ref: "el doc §4 declara que una traducción vacía/ausente NUNCA es `correcta`"
        status: pass
    human_judgment: false
  - id: D5
    description: "El re-serializado preserva UTF-8 literal y no toca nada fuera del bloque de la variante objetivo"
    requirement: "TVAL-02"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#round-trip UTF-8 (dos fotos de líneas, antes y después, con containment en coordenadas de línea)"
        status: pass
    human_judgment: false
  - id: D6
    description: "`withFileLock` serializa el read-modify-write: dos escrituras simultáneas sobre el mismo fichero conservan ambos pases y el JSON sigue parseando"
    requirement: "TVAL-02"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#concurrencia: dos escrituras simultáneas sobre variantes distintas"
        status: pass
    human_judgment: false
  - id: D7
    description: "El `by` registrado es el modelo que DE VERDAD respondió, incluso tras el auto-fallback por 429"
    verification:
      - kind: unit
        ref: "tests/translation-validator.test.js#el `by` escrito es el modelo que DE VERDAD respondió (caller inyectado que simula el 429)"
        status: pass
      - kind: integration
        ref: "MUTACIÓN `by: MODEL_QUEUE[0]` → ROJO en ese test; restaurado"
        status: pass
    human_judgment: false
  - id: D8
    description: "Los criterios del prompt son los correctos para juzgar una traducción real del corpus: ni permiten que se convierta en una segunda explanation, ni la aprueban si solo repite el gloss R7"
    verification: []
    human_judgment: true
    rationale: "Las aserciones congelan que las dos fronteras están ESCRITAS y con encabezado propio, no que un modelo real las aplique como el autor espera. La prueba de verdad es la primera corrida del quórum sobre las 96 traducciones (plan 46-04): si el quórum marca un patrón y aprueba otro idéntico, la excepción hay que escribirla en este doc, no en un notes."
  - id: D9
    description: "El camino HTTP real (DeepSeek / Gemini) funciona end-to-end con clave, timeout y manejo de 429"
    verification: []
    human_judgment: true
    rationale: "Este plan no hizo ni una llamada de red: los tests cubren dry-run, fail-fast y `run()` con caller inyectado. Los bloques HTTP son copia verbatim del script de canciones, que sí está en producción, pero eso es herencia, no verificación. Registrado como `unrun-verify` en `.planning/WINDOWS.md` (id 18); se cierra en el plan 46-04."

# Metrics
duration: 25min
completed: 2026-08-13
status: complete
---

# Phase 46 Plan 02: Validador de traducciones Summary

**El quórum ya tiene con qué juzgar una traducción: un prompt propio de CINCO criterios (S2 endurecida a fidelidad estricta, S3 eliminada, S5 reformulada sobre la frase italiana con el hueco relleno) y un script zero-deps que direcciona `<slot-id>#<k>` y escribe el pase DENTRO de `variants[k].translationES` — re-estrechando el objetivo antes de ramificar, porque el branch por substring del script de canciones escribe en el bloque equivocado y la mutación lo demuestra en rojo.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-08-13T13:05:07Z
- **Completed:** 2026-08-13T13:30:18Z
- **Tasks:** 3
- **Files created:** 4 (cero modificados)
- **Estimate vs actual:** el plan estimaba 55 000 tokens; el coste real medido sobre el diff (chars/4 de los 4 ficheros nuevos) es **20 995**. La sobreestimación viene de que tres de los cuatro artefactos son espejo casi verbatim de un analog existente, y eso se lee una vez y se escribe una vez.

## Accomplishments

- **El prompt de traducciones existe y NO es el de gramática.** Los cinco criterios de D-46-12 están inline y literales: S1 (español natural) y S4 (acentos RAE, con el aviso PRES-05 de que un flag de acento es bug real) y S6 (anti-calco) se conservan; **S2 pasa a fidelidad ESTRICTA** con la licencia poética explícitamente retirada («los ejercicios son prosa didáctica, no letra»); **S3 desaparece** (cero ocurrencias de la clave de troceado, y el contrato de output declara cinco booleanas, no seis); **S5 se reformula** sobre `italianoResuelto`, es decir el `prompt` con el hueco relleno por `options[correctIndex]`. La cabecera declara en una línea que estos criterios NO son los R1-R7.
- **Las dos fronteras están escritas, cada una con encabezado propio.** La frontera con `explanation` enumera las tres prohibiciones (nada sobre el italiano fuera de lo que la frase dice, nada sobre la estructura del ejercicio, nada sobre por qué falla cada distractora) y declara `incorrecta` a la traducción que cruce cualquiera; y añade el corolario que faltaba: **tampoco el evaluador debe juzgar el ejercicio**. La frontera con el `gloss` R7 distingue PRE-respuesta de POST-respuesta en una tabla, marca `incorrecta` la traducción que se limite a repetir el gloss, y **evita el falso positivo simétrico**: coincidir con el gloss en esa palabra es traducir bien, no repetirlo.
- **El aviso de gobernanza está en el doc que el subagent SÍ lee.** «Toda excepción a estos criterios se escribe AQUÍ, nunca solo en el `notes` de un plan» — con el síntoma nombrado (el modelo marca un patrón y aprueba otro idéntico) para que se reconozca cuando vuelva a pasar.
- **El script es espejo bloque a bloque del de canciones**, zero-deps (solo `node:https`/`fs`/`path`/`url` + `deriveStatus` + `withFileLock`), con la CLI completa (`--model` / `--fallback` / `--avoid` / `--write` / `--dry-run` / `--temp`), el timeout de 120 s, la clave **en header y nunca impresa**, y la cabecera-doctrina reescrita — incluida la razón de `--avoid`, que ahora está explicada y no solo listada.
- **El `writePass` re-estrechado, PROBADO POR ESCRITURA REAL.** Baja slot → array `variants` → k-ésimo objeto hijo → `translationES`, y solo entonces ramifica UPDATE/INSERT. La indentación se **deriva del disco** (`match(/^\s*/)`), no se transcribe: el bloque insertado sale exactamente con la profundidad real del corpus (`translationES` a 10, `text`/`validation` a 12, `status`/`passes` a 14), tal como midió el plan 46-01.
- **31 tests nuevos, cero regresiones**: 1284 tests / 1280 pass / **los mismos 4 fallos pre-existentes** de `requirements-traceability`. Dos mutaciones ejecutadas con su rojo observado.

## Task Commits

1. **Task 1: el prompt de validación de traducciones** — `b159e4b` (docs)
2. **Task 2 (RED): matriz de la CLI en rojo** — `527f90b` (test)
3. **Task 2 (GREEN): el script con dirección compuesta y `writePass` re-estrechado** — `88f8344` (feat)
4. **Task 3: fixture adversarial + matriz TVAL-02/03 por escritura real** — `45718a8` (test)
5. **Task 2 (cierre de una cobertura declarada y no cubierta): el `by` tras auto-fallback** — `dce83ac` (test)

_No hubo commit de REFACTOR: los bloques copiados del analog ya estaban en su forma final y los dos adaptados nacieron con la forma que los tests exigen._

## Files Created

- `docs/TRANSLATION-VALIDATION-PROMPT.md` — **nuevo**, 6 secciones espejando el doc de canciones: rol, criterios (con S3 declarada inexistente y por qué), reglas EXTRA y fronteras, contrato de output de cinco booleanas, few-shot PASS/FAIL, guard anti prompt-injection. La frase canónica de la fase aparece como forma del payload, no como respuesta de referencia.
- `scripts/validate-translation-pass.mjs` — **nuevo**, zero-deps. Exporta `applyPassToText`, `writeTranslationPass`, `resolveTarget`, `parseAddress`, `fillGap`, `run` y los acotadores string-aware; el entrypoint CLI queda tras un guard de invocación directa.
- `tests/fixtures/translation-pilot.json` — **nuevo**, forma REAL de un fichero de contenido (indentación 2, `options` uno por línea) con cuatro slots deliberadamente adversariales, declarados en su propio `notes`.
- `tests/translation-validator.test.js` — **nuevo**, 31 tests en cuatro bloques: CLI de la dirección compuesta, invariantes de fuente, escritura quirúrgica y `deriveStatus`.

## Decisions Made

1. **La dirección compuesta es `<slot-id>#<k>` con el índice OBLIGATORIO.** `parseAddress` devuelve `null` si falta el `#k` o si no es numérico, y el entrypoint sale con 2. La alternativa (asumir la variante 0) es exactamente el fallo silencioso que esta fase quiere impedir: escribir un pase en la frase equivocada.
2. **El script se hizo importable, y esa fue la única desviación estructural respecto al analog.** `scripts/validate-song-pass.mjs` valida sus argumentos y llama a `process.exit(2)` en el cuerpo del módulo, así que importarlo mata al proceso que lo importe — por eso `tests/song-validator.test.js`, pese a llamarse así, no prueba el escritor de canciones: prueba `validateSongs`, el validador de schema. **El molde de test que el plan citaba no existía.** La opción sin exports habría dejado el punto de más riesgo de la fase probado solo por subproceso, sin poder inspeccionar el texto resultante. Se movió el parseo de args a `parseArgs(argv)`, la validación y el exit a `main()`, y el resto se exportó.
3. **`applyPassToText` es una transformación pura de texto y `writeTranslationPass` su envoltura con lock.** El criterio del plan (el `readFileSync` DENTRO del callback de `withFileLock`) se cumple, y además el diff de líneas se puede assertear sin depender del lock.
4. **`run()` devuelve el pase o `null` en vez de llamar a `process.exit(1)`.** Con el `exit` dentro, el test del auto-fallback habría matado al runner. El exit code lo pone el entrypoint.
5. **El fixture lleva un cuarto slot con el `validation` del SLOT declarado ANTES de `variants`.** En la disposición real del corpus (`validation` al final) el branch mutado del analog aterriza en el `validation` de la **variante 0**, no en el del slot — así que el caso «falso UPDATE sobre el bloque del slot» habría quedado sin probar. Con el cuarto slot la mutación lo alcanza.
6. **El payload del prompt no lleva la `explanation` del slot.** El plan lo pedía y la razón merece quedar escrita: mandarla es invitar al evaluador a juzgar la regla, que es justo la frontera que el doc prohíbe cruzar.
7. **El `--dry-run` imprime el doc COMPLETO antes del bloque DATA**, y un test asserta ese orden: el guard anti prompt-injection tiene que leerse antes que el contenido no confiable.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] La aserción de orden del bloque DATA casaba una MENCIÓN, no el encabezado**
- **Found during:** Task 2 (GREEN, primera ejecución)
- **Issue:** El test comparaba `indexOf('Traducción bajo evaluación (DATA)')` contra el índice de la sección 6. Pero la **sección 1 del doc cita el nombre de ese bloque** para decirle al evaluador dónde mirar, así que el `indexOf` casaba la cita (posición temprana) y el test salía rojo culpando a un script correcto.
- **Fix:** Buscar el encabezado real (`\n## Traducción bajo evaluación (DATA)`) y añadir cláusula de no-vacuidad para las DOS anclas antes de comparar. El bug estaba en el test.
- **Files modified:** `tests/translation-validator.test.js`
- **Committed in:** `88f8344`

**2. [Rule 2 - Missing Critical] Una cobertura declarada en el plan se estaba cerrando por juicio en vez de por test**
- **Found during:** revisión previa al SUMMARY
- **Issue:** El bloque `<behavior>` del Task 2 pedía «Test: el `by` escrito es el modelo que respondió, no el primero de la cola — simulado forzando el fallback», y las prohibiciones del plan declaran que un `by` que miente fabrica un quórum falso de dos entradas del mismo modelo real. Con `callModel` no inyectable, ese test no existía y la prohibición se quedaba en `verification: judgment` — es decir, sin gate.
- **Fix:** `run()` acepta un `caller` inyectable (default `callModel`) y devuelve el pase en vez de matar el proceso. Dos tests nuevos: uno simula el 429 del primario y asserta que **el `by` escrito en disco** es el del fallback (con no-vacuidad sobre la secuencia de llamadas), otro comprueba que la cola agotada devuelve `null` y no toca el corpus.
- **Verification:** mutación `by: MODEL_QUEUE[0]` → ROJO en ese test; restaurado, 31/31.
- **Files modified:** `scripts/validate-translation-pass.mjs`, `tests/translation-validator.test.js`
- **Committed in:** `dce83ac`

**3. [Rule 1 - Bug] La aserción de containment del test de idempotencia era vacua por construcción**
- **Found during:** Task 3 (escritura de la suite, antes de la primera ejecución)
- **Issue:** La primera redacción comparaba las fotos `tras1` y `tras2` para el containment. Pero la propiedad que el test celebra es justamente que esas dos son **byte-idénticas**, así que la región cambiada era vacía y la cláusula de no-vacuidad habría fallado — o, sin ella, el containment habría pasado en verde sin mirar nada.
- **Fix:** Tomar la foto `antes` de la PRIMERA escritura y assertear el containment sobre `antes → tras1`, dejando el byte-a-byte para `tras1 → tras2`. Con el comentario que explica por qué: si la primera pasada se hubiera desbordado, la segunda «idéntica» lo sería sobre un fichero ya corrupto y el byte-a-byte pasaría igual.
- **Files modified:** `tests/translation-validator.test.js`
- **Committed in:** `45718a8`

### Desviación de alcance declarada (NO auto-arreglada)

**4. La suite completa NO termina en exit 0 — deuda PRE-EXISTENTE, fuera de alcance**
- **Criterio afectado:** verificación 1 del plan (`node --test tests/*.test.js tests/fixtures/*.test.js` → exit 0).
- **Medición:** al empezar 1253/1249/**4 fail**; al terminar 1284/1280/**4 fail** — las mismas cuatro, mismo nombre de suite. Los 31 tests nuevos pasan todos.
- **Causa:** los 4 subtests de `tests/requirements-traceability.test.js` que la reescritura de `REQUIREMENTS.md` para v2.1 dejó sin su ancla `**Coverage: N/N …**`. Ya estaba registrado en `.planning/WINDOWS.md` (id 17) por el plan 46-01.
- **Por qué no se arregla aquí:** es el registro de requisitos, no el pipeline de traducción; y tocar un gate sin correr la mutación que verifica que sigue mordiendo es el modo de fallo del CR-01 de la Phase 44.

---

**Total deviations:** 3 auto-arregladas (2 bugs en mis propios tests, 1 cobertura crítica ausente) + 1 desviación de alcance declarada.
**Impact on plan:** cero scope creep — cuatro ficheros nuevos, ninguno modificado, y ni una línea fuera de los declarados en `files_modified`. Dos de los tres auto-arreglos eran bugs **en mis propios gates**, cazados por ejecutarlos y por mutarlos, no por leerlos.

## Verificación por mutación (D-46-18 — leer el gate no cuenta)

Las dos mutaciones se **ejecutaron**, se observó el rojo y el árbol se restauró **por copia de fichero** (sin `git stash`, sin `git clean`).

| # | Mutación | Exit | Resultado |
|---|---|---|---|
| M1 | `applyPassToText` ramifica UPDATE/INSERT por `objSlice.includes('"validation"')` sobre el OBJETO-SLOT, como el script de canciones | **1** | **ROJO en 5 tests**: idempotencia, aislamiento entre hermanas, no-falso-UPDATE, ordering y quórum de dos `by` |
| M2 | `by: MODEL_QUEUE[0]` en vez de `by: model` (el registro de auditoría miente tras el auto-fallback) | **1** | **ROJO en 1 test**: el `by` escrito en disco deja de ser el del modelo que respondió |

Tras restaurar: **31/31 verde** y `git diff --stat scripts/validate-translation-pass.mjs` vacío.

Lo que M1 demuestra en concreto, y que era el riesgo declarado de la fase: con el branch del analog, un `--write` sobre `pilot-tr-gemelas#1` escribe en el `validation` de **la variante 0** (el primer `"validation":` que aparece dentro del objeto-slot), dejando la variante objetivo con `passes: []` y contaminando a su hermana de texto idéntico; y sobre `pilot-tr-validation-primero#0` escribe en el `validation` **del SLOT**.

## Issues Encountered

- **El molde de test que el plan citaba no existe.** `tests/song-validator.test.js` prueba `validateSongs` (el validador de schema de canciones), no el escritor de pases; **ningún test del repo ejercita un `writePass`**. De ahí la decisión 2: hacer el script importable. Si se hubiera dado por bueno el molde citado, este plan habría probado el punto de más riesgo de la fase con el mismo rigor con el que el plan 45 probó sus cinco gates vacuos.
- **La disposición real del corpus enmascara a medias el bug del branch.** En `preposiciones.json` el `validation` del SLOT va DESPUÉS de `variants`, así que el primer `"validation":` dentro del objeto-slot es el de la **primera variante traducida**. Para el slot canónico (variante 1 traducida, variante 0 sin traducir) el branch del analog acertaría **por casualidad**. Es la clase de coincidencia que convierte un bug en una bomba de relojería: se dispara en la primera categoría donde la variante 0 esté traducida — o sea, en la variante 2 del piloto del plan 46-04.
- **Ningún `console.log` sobrevive dentro del escritor ni de `run()`**: el pase se imprime en el entrypoint y las trazas van a `stderr`, así que un `--write` en pipeline no contamina el stdout parseable.

## User Setup Required

Ninguno para este plan: los tests no llaman a la red. **Para el plan 46-04** hacen falta las claves en `.env` (`DEEPSEEK_API_KEY` y/o `GEMINI_API_KEY`), que ya existen en la máquina del autor y siguen fuera de git.

Uso previsto del quórum (1-por-1, dos `by` distintos):

```bash
node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' --write
node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' \
  --model=gemini-2.5-flash --avoid=deepseek-chat --write
```

## Next Phase Readiness

**Para el plan 46-03 (gates):** el status de cada traducción se lee de `variants[k].translationES.validation.passes` y se pasa por `deriveStatus` — la misma función que ya usa el reporter. La cobertura se mide en **variantes `multiple-choice`** (722 en el corpus, 96 en Preposiciones), no en slots ni sobre el total de 758 variantes. El fixture `tests/fixtures/translation-pilot.json` sirve de golden para un gate que quiera un caso `pending` real sin tocar contenido.

**Para el plan 46-04 (las 96):**
- La forma de invocación está arriba, y `--avoid` es **obligatorio** en el segundo pase: sin él, un auto-fallback puede aterrizar en el mismo modelo y `deriveStatus` devolverá `pending` con dos pases `correcta` en el fichero, que es el fallo más confuso de diagnosticar.
- **Ojo con la variante 0 del slot canónico:** está sin traducir y el script la salta con exit 2. La autoría (D-46-15, subagents Claude, 1 slot por subagent) tiene que ir ANTES del quórum.
- El camino HTTP real sigue sin ejecutarse (registrado como `unrun-verify` en `.planning/WINDOWS.md`, id 18). La primera corrida real cierra esa ventana; si el proveedor devuelve otra forma de respuesta, el fallo aparecerá ahí y no en este plan.

**Para el plan 46-05 (verificación visual):** sin cambios; este plan no toca render.

## Self-Check: PASSED

- Los 4 ficheros de `key-files.created` existen en disco.
- Los 5 commits declarados existen en `git log`: `b159e4b`, `527f90b`, `88f8344`, `45718a8`, `dce83ac`.
- `git diff --stat src/domain/ src/screens/app.js content/exercises/` → **vacío**; cero commits con scope `(46-NN)` sobre esas rutas (el motor sigue byte-intacto, D-46-01/D-46-11).
- `node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' --dry-run` → exit 0, imprime `Paolo è di Napoli di nascita.` y `git diff --stat` vacío.
- `node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#99' --dry-run` → exit 2, stderr nombra el slot y el índice.
- Aserciones de contenido del doc: `s3_troceado` = 0 · claves `sN_*` únicas = 5 · secciones `## N.` = 6 · `R1-R7` presente en exclusión · `[S4-acentos]` en la sección 5 · dos encabezados `### Frontera` · `Paolo` presente.
- `git diff --stat tests/fixtures/translation-pilot.json` vacío tras correr la suite (los tests trabajan sobre copias en `os.tmpdir()`, borradas en `after`).
- Suite completa: 1284 tests / 1280 pass / 4 fail — los mismos 4 pre-existentes de la línea base.

---
*Phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones*
*Completed: 2026-08-13*
