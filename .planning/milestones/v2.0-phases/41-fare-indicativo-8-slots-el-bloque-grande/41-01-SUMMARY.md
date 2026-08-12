---
phase: 41-fare-indicativo-8-slots-el-bloque-grande
plan: 01
subsystem: content
tags: [json-content, slot-variants, multiple-choice, fare, indicativo, quorum-handoff]

# Dependency graph
requires:
  - phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
    provides: "CURRENT_SCHEMA_VERSION 13 y 'fare-indicativo' ya dentro de RESET_PREFIXES_V13 — el slug del fichero coincide byte a byte con el prefijo del reset"
  - phase: 38-verbi-riflessivi
    provides: "content/exercises/riflessivi.json — el molde de categoría nacida en slot+variantes, con notes que documenta decisiones-de-omisión con audit trail"
  - phase: 39-provenance
    provides: "campo origen en schema (PROV-01) — permite estampar origen: ia-quorum ya en el alta"
provides:
  - "content/exercises/fare-indicativo.json — categoría nueva con notes completo (8 declaraciones) y los 4 slots del indicativo SIMPLE: presente, imperfetto, futuro semplice, passato remoto"
  - "24 variantes = 24 casillas persona x tiempo, 6 personas por slot, eje de variante servido por pickVariantIndex sin una línea de motor nueva"
  - "content/categories.json — 15ª entrada fare-indicativo (order 15, origen ia-quorum): es lo que hace jugable la categoría en home, picker, Repaso y Examen"
  - "tests/exercise-types.test.js — la categoría entra en CATEGORIES_WITH_EXPLANATIONS con expected dinámico, así que los 5 sub-tests editoriales corren sobre el fichero desde el primer commit"
  - "notes con la blacklist de 16 formas atestiguadas (5 de D-41-08 + face/faci + 9 del passato remoto) y su audit trail — el mecanismo anti-inercia que 41-02 hereda"
  - "hand-off explícito al quórum top-level: los 4 slots en pending con passes vacío, y VAL_07_STRICT=1 en rojo como marcador visible"
affects: [41-02-compuestos, 42-congiuntivo, 43-condizionale-imperativo, 44-integracion-cruces-counts]

# Actuals (#2632)
actuals:
  tokens: 5707
  tasks: 4
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "categoría de contenido nacida directamente en slot+variantes, nunca legacy payload"
    - "0-gloss declarado: la ausencia del desambiguador R7 documentada como decisión razonada con su por qué, no como omisión"
    - "blacklist de formas atestiguadas en notes ANTES de escribir la primera distractora, con audit trail por forma"
    - "marcos temporales disjuntos entre slots que compiten semánticamente (passato remoto frente a passato prossimo)"

key-files:
  created:
    - content/exercises/fare-indicativo.json
  modified:
    - content/categories.json
    - tests/exercise-types.test.js

key-decisions:
  - "Los 4 slots simples cierran en validation.status pending con passes vacío: el quórum canónico Opus+Sonnet NO corre dentro del executor, y un pase fabricado destruiría el único audit trail que el autor tiene"
  - "La entrada de categories.json y la línea del smoke se movieron de 41-02 al tracer: sin la entrada, schema-validator rechaza el categoryIds y domain.test.js se pone rojo en el instante en que el fichero existe en disco"
  - "El reporter run-validation-271.mjs NO se sincroniza en esta fase: quedaría un estado parcial que Phase 44 tendría que detectar. Consecuencia documentada: el reporter queda CIEGO al fichero y sigue diciendo 225/225 PASS, que es peor que un rojo porque parece verde"
  - "Regla ratificada por el autor: una distractora candidata que resulte ser forma italiana atestiguada (arcaica, poética, dialectal u homógrafa) no entra en options, entra en la blacklist del notes con su audit trail"
  - "Donde la prosa del plan y la gramática italiana discrepan, gana la gramática, y la discrepancia se documenta"

patterns-established:
  - "Gate del tracer: un slot completo verificado en el navegador antes de replicar la forma 18 veces — si la forma está mal, está mal una vez y no cuatro"
  - "Escaneos de ausencia SIEMPRE por campo (prompt, options) y NUNCA sobre el fichero completo: el notes nombra a propósito las formas y las perífrasis excluidas, así que un grep de fichero entero se auto-invalidaría"
  - "Distractoras de los tiempos simples con molde fijo cross-slot: 2 de raíz equivocada sobre la persona correcta + 1 forma REAL de otra persona, excluida por el pronombre sujeto explícito"

requirements-completed: [IND-01, IND-02, IND-03, IND-04]

coverage:
  - id: D1
    description: "IND-01 presente: el autor es examinado sobre faccio/fai/fa/facciamo/fate/fanno con la trampa de la raíz doble facc- frente a fa-"
    requirement: IND-01
    verification:
      - kind: unit
        ref: "tests/exercise-types.test.js#content/exercises/fare-indicativo.json (coverage + apóstrofes + plain text + leak R1 + cross-refs R2)"
        status: pass
      - kind: other
        ref: "node -e: keys del slot == [faccio,fai,fa,facciamo,fate,fanno], una por persona, sin repetidos"
        status: pass
    human_judgment: false
  - id: D2
    description: "IND-02 imperfetto: facevo/facevi/faceva/facevamo/facevate/facevano sobre la raíz latina fac- que el infinitivo esconde"
    requirement: IND-02
    verification:
      - kind: other
        ref: "node -e: keys del slot == [facevo,facevi,faceva,facevamo,facevate,facevano]; 6 marcos habituales distintos"
        status: pass
    human_judgment: false
  - id: D3
    description: "IND-03 passato remoto: feci/facesti/fece/facemmo/faceste/fecero con la alternancia fec-/fac- repartida por persona y marcos exclusivamente remotos"
    requirement: IND-03
    verification:
      - kind: other
        ref: "node -e: keys == [feci,facesti,fece,facemmo,faceste,fecero]; 0 marcos recientes; 2 variantes por familia remota; 0 opciones con 'fatt'"
        status: pass
    human_judgment: false
  - id: D4
    description: "IND-04 futuro semplice: farò/farai/farà/faremo/farete/faranno con el calco de hacer (facer-) como distractora en las 6 variantes y nunca como key"
    requirement: IND-04
    verification:
      - kind: other
        ref: "node -e: keys == [farò,farai,farà,faremo,farete,faranno]; las 6 variantes tienen una opción facer* y ninguna es la key"
        status: pass
    human_judgment: false
  - id: D5
    description: "SC-5: la categoría carga en boot y aparece jugable en home, picker, Repaso y Examen sin una línea de motor nueva"
    verification:
      - kind: manual_procedural
        ref: "Task 2 checkpoint — el autor verificó en http://localhost:3000 la fila nueva, el Examen habilitado, la rotación de persona entre pasadas y la explicación; respondió 'aprobado'"
        status: pass
      - kind: other
        ref: "git diff --stat src/screens/app.js src/domain/ src/data/ — salida vacía"
        status: pass
    human_judgment: false
  - id: D6
    description: "Corrección lingüística de las 24 variantes: exactamente una opción gramatical por prompt, ninguna distractora atestiguada en italiano, cero doble validez"
    verification:
      - kind: other
        ref: "escaneos de ausencia por campo: 0 coincidencias con la blacklist de 5 formas, 0 con las 11 de otros modos y homógrafas, 0 con 'fatt'"
        status: pass
    human_judgment: true
    rationale: "La unicidad de lectura y la inexistencia de cada distractora son juicios lingüísticos que ninguna aserción mecánica cierra: los escaneos prueban la ausencia de una lista conocida, no la ausencia de una forma atestiguada que la autoría no haya pensado. Lo cierra el quórum top-level Opus+Sonnet (D-41-15) más la ronda EXTRA DeepSeek obligatoria en passato remoto (D-41-12)."

# Metrics
duration: 3h 27m (de los cuales ~3h son el gate humano de Task 2; la autoría de Tasks 3-4 fueron ~10 min)
completed: 2026-08-03
status: complete
---

# Phase 41 Plan 01: `fare-indicativo` — los 4 tiempos simples Summary

**Los 4 tiempos simples del indicativo de `fare` autorados como 4 slots multiple-choice de 6 personas cada uno (24 casillas persona×tiempo), con la categoría registrada y jugable en la app sin una línea de motor nueva, y los 4 slots en `pending` esperando el quórum top-level.**

## Performance

- **Duration:** 3h 27m wall clock (Task 1 → Task 4), de los cuales ~3h fueron el gate humano de Task 2
- **Started:** 2026-08-03T14:45:41Z (commit del tracer)
- **Completed:** 2026-08-03T18:12:13Z
- **Tasks:** 4 (1 tracer + 1 checkpoint aprobado + 2 de expansión)
- **Files modified:** 3

## Accomplishments

- **24 variantes = 24 casillas persona×tiempo.** `presente` (`facc-`/`fa-`), `imperfetto` (raíz latina `fac-`), `futuro semplice` (raíz contracta `far-`) y `passato remoto` (alternancia `fec-`/`fac-`), 6 personas cada uno, una key por casilla y sin repetir key dentro de un slot.
- **La categoría existe y es jugable.** La 15ª entrada de `content/categories.json` es lo que la hace aparecer en home, picker, Repaso y Examen; el autor lo verificó en el navegador en el gate de Task 2. `git diff --stat src/screens/app.js src/domain/ src/data/` sale vacío: cero motor.
- **El `notes` como mecanismo anti-inercia, escrito ANTES de la primera distractora.** 8 declaraciones: identidad y linaje, 0-gloss, 0-match, 0-word-buttons, blacklist con audit trail, SCOPE-GATE HARD de perífrasis, marcos disjuntos y la nota de count-sync. El fallo esperable de esta fase no era que el autor escribiera `fo`, era que la autoría lo generara creyéndolo obviamente malo.
- **La blacklist creció de 5 formas a 16, todas con audit trail y todas verificadas ausentes de `options`.** Las 5 de D-41-08 (`fo`, `fé`, `fenno`, `facea`, `fan`), más `face` y `faci` detectadas en el tracer, más 9 del passato remoto (`fei`, `festi`, `femmo`, `feste`, `fero`, `feciono`, `fici`, `facisti`, `facette`/`facettero`) y `facero` descartada por duda razonable.
- **El futuro cumple la exigencia literal de SC-1:** el calco de `hacer` (`facerò`, `facerai`, `facerà`, `faceremo`, `facerete`, `faceranno`) aparece en las 6 variantes y en ninguna es la key.
- **El passato remoto respeta los marcos disjuntos de D-41-11 en las dos direcciones:** solo marcos narrativos remotos, 2 por familia (`Nel 1990`/`Nel 1985`, `Quell'estate`/`Quell'inverno`, `Molti anni fa`/`Tanti anni fa`), y ninguna de sus 24 opciones es un compuesto — cero apariciones de `fatt`.
- **Hand-off honesto al quórum.** Los 4 slots en `status: "pending"` con `passes: []`. `VAL_07_STRICT=1 node --test tests/*.test.js` falla nombrando exactamente los 4 slots `(pending)`: ese rojo es el estado CORRECTO al cerrar el plan.

## Task Commits

1. **Task 1: Tracer — `fare-indicativo-presente` de punta a punta** — `7b909a1` (feat)
2. **Task 2: Gate del tracer (checkpoint:human-verify)** — sin commit; el autor respondió `aprobado` tras verificar en el navegador y ratificó las 2 desviaciones del tracer
3. **Task 3: Expansión — `imperfetto` y `futuro-semplice` (12 variantes)** — `97c0c97` (feat)
4. **Task 4: Expansión — `passato-remoto`, alternancia y marcos disjuntos (6 variantes)** — `b41209c` (feat)

## Files Created/Modified

- `content/exercises/fare-indicativo.json` (nuevo, 301 líneas) — `notes` con las 8 declaraciones + 4 slots MC + 24 variantes, todas en `pending`
- `content/categories.json` — 15ª entrada: `{id: "fare-indicativo", name: "Fare — indicativo (faccio/feci/ho fatto)", order: 15, origen: "ia-quorum"}`; las 14 anteriores intactas
- `tests/exercise-types.test.js` — 1 línea en `CATEGORIES_WITH_EXPLANATIONS` con `expected: slotCountOf(...)` dinámico, nunca número mágico

## Decisions Made

- **`validation` en `pending`, sin fabricar un solo pase.** El quórum canónico (Opus + Sonnet vía `gsd-validate-exercise`) spawnea Task subagents y no está disponible dentro de un `gsd-executor`. Un pase inventado destruiría la única evidencia que el autor tiene de que una variante fue revisada, y la falsificación es indetectable a ojo. Ver §Next Phase Readiness.
- **`facetti` como sustituto de la distractora `faci`.** La alternancia cruzada de la 1ª persona del passato remoto (`faci` frente a `feci`) es la distractora más natural de esa casilla, y está blacklisteada por ser el plural nominal atestiguado de `face`. Su hueco lo ocupa `facetti` — la desinencia débil de `credetti`/`stetti` aplicada a la raíz equivocada. Queda anotado en el `notes` y marcado para la ronda EXTRA DeepSeek de D-41-12.
- **`facero` descartada por duda razonable, no por certeza.** No se pudo confirmar si está atestiguada como variante arcaica de `fecero`; en la duda no se usa. La distractora de 3ª plural es `facerono`, inequívocamente inexistente. El criterio correcto ante una forma posiblemente atestiguada es no usarla.
- **Los objetos de las 24 frases salen solo del conjunto cerrado de D-41-06** (`i compiti`, `un errore`, `il lavoro`, `una torta`, `il letto`, `tutto`, `una foto`). Efecto colateral buscado: sin perífrasis no queda léxico que glosar, lo que refuerza el 0-gloss.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] `face` y `faci` descartadas como distractoras y añadidas a la blacklist**
- **Found during:** Task 1 (tracer, slot `presente`)
- **Issue:** El plan proponía `face` como distractora de raíz equivocada para `lui/lei` y `faci` para `tu`, por ser el calco más obvio del castellano *hace* y *haces*. Ambas son formas italianas atestiguadas: `face` es el 3º singular arcaico-poético de `fare` **y** un sustantivo literario ("antorcha"); `faci` es el plural de ese sustantivo. Son exactamente la misma categoría que `facea`, ya blacklisteada por D-41-08 — presentarlas como "obviamente malas" produciría el ejercicio injusto que esta herramienta existe para evitar.
- **Fix:** Las dos salen de `options` y entran en el `notes` con su audit trail. Sustitutos inexistentes en italiano para esas dos casillas.
- **Ratificado por el autor** el 2026-08-03, con instrucción explícita de aplicar la misma regla a los 3 slots simples restantes.
- **Files modified:** `content/exercises/fare-indicativo.json`
- **Verification:** escaneo por campo sobre `variants[].options[]` de los 4 slots — 0 coincidencias
- **Committed in:** `7b909a1`

**2. [Rule 1 - Bug] Corregido el reparto de raíces del presente que el plan enunciaba mal**
- **Found during:** Task 1 (tracer, explanation del `presente`)
- **Issue:** El plan pedía explicar que `facc-` aparece en `io`, `noi` **y** `loro`. Es falso: `fanno` no lleva la raíz larga, es la raíz corta `fa-` más una terminación en doble n que comparte con `hanno`, `danno` y `stanno`. Escribirlo como decía el plan le habría enseñado al autor una regla incorrecta.
- **Fix:** La explanation en disco dice el reparto correcto: `facc-` en `io faccio` y `noi facciamo`; `fa-` en `tu fai`, `lui/lei fa` y `voi fate`; y `fanno` como raíz corta con terminación en doble n.
- **Principio aplicado:** donde la prosa del plan y la gramática italiana discrepan, gana la gramática.
- **Ratificado por el autor** el 2026-08-03.
- **Files modified:** `content/exercises/fare-indicativo.json`
- **Verification:** verificado a ojo por el autor en el gate de Task 2 (paso 6, botón `¿Por qué?`)
- **Committed in:** `7b909a1`

**3. [Rule 2 - Missing Critical] 9 formas atestiguadas más descartadas al autorar el passato remoto**
- **Found during:** Task 4 (slot `passato-remoto`)
- **Issue:** Aplicando la regla que el autor ratificó, cada distractora candidata se comprobó una a una antes de fijarla. El passato remoto es la casilla con más variantes atestiguadas del paradigma: `fei` y `festi` (toscano-arcaicas por `feci` y `facesti`), `femmo` y `feste` (por `facemmo` y `faceste`), `fero` y `feciono` (por `fecero`), `fici` y `facisti` (sicilianas), `facette` y `facettero` (napolitanas). Varias de ellas son precisamente lo que la autoría tendería a generar como "obviamente malo".
- **Fix:** Ninguna entra en `options`; las 9 más `facero` (descartada por duda razonable) entran en el `notes` como 4º grupo de la blacklist, con audit trail por forma y con la regla del autor enunciada de forma explícita. La distractora de 1ª persona pasa a ser `facetti` porque `faci` está blacklisteada.
- **Files modified:** `content/exercises/fare-indicativo.json`
- **Verification:** escaneo por campo sobre `options[]` de los 4 slots; `node --test tests/*.test.js` en `fail 0`
- **Committed in:** `b41209c`

---

**Total deviations:** 3 auto-fixed (2 missing-critical de corrección del contenido, 1 bug de gramática). Las 2 del tracer están ratificadas por el autor; la 3ª es la aplicación literal de la regla que él ratificó.
**Impact on plan:** Ninguna toca el alcance. Las 3 protegen la corrección del contenido, que es el único valor que esta fase entrega. Cero scope creep, cero fichero fuera de `files_modified`.

## Issues Encountered

- **El primer escaneo de markdown dio 18 falsos positivos.** El regex canon del proyecto incluye `__` como marcador de negrita, y el hueco literal `___` de los prompts lo contiene. El sub-test real del repo solo escanea `explanation`, no `prompt`, así que el escaneo ad-hoc era más amplio que el canon. Corregido: markdown se comprueba sobre `notes` y las 4 `explanation`; los caracteres peligrosos (`<`, `>`, `&#`, `javascript:`, comillas tipográficas) sobre los 106 strings del fichero.
- **El reporter `run-validation-271.mjs` sigue diciendo `VAL-06 PASS (225/225)`** con 24 variantes nuevas en disco. No es un fallo: es la ceguera documentada en el `notes` y en el plan. Ambos lados del baseline-guard iteran el array `CATEGORIES`, que no incluye `fare-indicativo` hasta Phase 44 / INT-02, así que el reporter no ve el fichero y repite su total anterior. Es peor que un rojo porque parece verde — de ahí que el marcador honesto del trabajo pendiente sea `VAL_07_STRICT=1`.

## User Setup Required

None — no hay configuración de servicios externos. El proyecto es web estática de dependencias cero.

## Next Phase Readiness

**Listo para 41-02** (los 4 tiempos compuestos): el `notes` con las 8 declaraciones, el molde de slot y el shape de `validation` ya están en disco y son el patrón literal a clonar. La entrada de `categories.json` y la línea del smoke ya están hechas, así que 41-02 solo añade slots.

**Trabajo pendiente que NO es un fallo, y que hay que no olvidar:**

1. **El quórum base canónico no ha corrido.** Los 4 slots están en `pending`. Se corre en TOP-LEVEL tras `execute-phase`, con el skill `gsd-validate-exercise`, **un ejercicio por contexto y NUNCA batched (VAL-03)** — 4 invocaciones para este plan, 8 cuando 41-02 cierre.
2. **`fare-indicativo-passato-remoto` lleva ronda EXTRA DeepSeek obligatoria (D-41-12).** Es la casilla donde una distractora mal escogida puede resultar ser una forma válida, y hay dos puntos concretos que la ronda tiene que mirar con lupa: **`facetti`** (sustituta de la blacklisteada `faci`, ver Decisions) y la ausencia de doble validez regional en los 6 marcos remotos. `scripts/validate-ai-pass.mjs`, claves en `.env`.
3. **En esa misma pasada, el pase Opus de cada slot debe registrar en sus `concerns` la re-declaración local del 0-gloss**, mirror literal de `content/exercises/riflessivi.json:245`.
4. **Sync de counts diferido a Phase 44 / INT-02:** `CATEGORIES` de `scripts/run-validation-271.mjs` y `REAL_CATEGORIES` de `tests/fixtures/slot-variants-integration.test.js` siguen sin `fare-indicativo`, deliberadamente. Mientras falten, el reporter está ciego al fichero.

**Sin blockers.** `node --test tests/*.test.js` en 704 pass / 0 fail, motor intacto, y `git status --porcelain` sin un solo fichero fuera de los 3 de `files_modified`.

## Self-Check: PASSED

- `content/exercises/fare-indicativo.json` — FOUND (4 slots, 24 variantes, 4/4 en `pending` con `passes: []`)
- `content/categories.json` — FOUND (15 entradas, la 15ª `fare-indicativo` order 15 `origen: ia-quorum`)
- `tests/exercise-types.test.js` — FOUND (1 línea nueva, `expected` dinámico vía `slotCountOf`)
- Commit `7b909a1` — FOUND
- Commit `97c0c97` — FOUND
- Commit `b41209c` — FOUND
- `node --test tests/*.test.js` — 704 pass / 0 fail
- `VAL_07_STRICT=1 node --test tests/*.test.js` — falla nombrando los 4 slots `(pending)`, que es el estado correcto de cierre
- `git diff --stat src/screens/app.js src/domain/ src/data/` — salida vacía

---
*Phase: 41-fare-indicativo-8-slots-el-bloque-grande*
*Completed: 2026-08-03*
