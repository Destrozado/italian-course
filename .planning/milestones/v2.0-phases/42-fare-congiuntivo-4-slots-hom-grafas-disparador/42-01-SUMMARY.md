---
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
plan: 01
subsystem: content
tags: [json-content, congiuntivo, homografia, multiple-choice, schema-validator, categories-registry]

# Dependency graph
requires:
  - phase: 40-fare-split-4-categorias
    provides: "el slug `fare-congiuntivo` ya presente en `RESET_PREFIXES_V13` (`src/data/storage.js:1345`), que esta fase NO edita y con el que la categoría casa byte a byte"
  - phase: 41-fare-indicativo-8-slots-el-bloque-grande
    provides: "el molde de autoría v1.9 (2 claves top-level, `notes` en prosa con audit trail, slot MC con `explanation` + `variants` + `validation`), la blacklist heredada de 18 formas atestiguadas, el SCOPE-GATE del objeto literal y las 6 formas del imperfetto y del passato remoto de indicativo que aquí son distractoras"
provides:
  - "categoría `fare-congiuntivo` dada de alta en disco y en el registro: `content/exercises/fare-congiuntivo.json` + entrada 16 de `content/categories.json`, unidad de reset independiente de las otras 3 de `fare`"
  - "slot `fare-congiuntivo-presente` — 6 variantes, keys `faccia`x3 / `facciamo` / `facciate` / `facciano` (CONG-01)"
  - "slot `fare-congiuntivo-imperfetto` — 6 variantes, keys `facessi`x2 / `facesse` / `facessimo` / `faceste` / `facessero` (CONG-02)"
  - "el `notes` de la categoría con las 12 declaraciones de autoría (gate de no-correferencia, 0-gloss del verbo con excepción léxica, blacklist ampliada, las 4 homografías deliberadas, los 3 patrones de distractoras, hand-off a Phase 43) — es el contrato que 42-02 hereda literalmente"
  - "línea de `fare-congiuntivo` en `CATEGORIES_WITH_EXPLANATIONS` con `expected` dinámico vía `slotCountOf`, que activa los sub-tests editoriales sobre el fichero nuevo"
affects: [42-02, 43-fare-condizionale-imperativo, 44-integracion-counts]

actuals:
  tokens: 6667
  tasks: 3
  commits: 2

tech-stack:
  added: []
  patterns:
    - "gate de no-correferencia de sujetos declarado en `notes` ANTES de la primera variante (D-42-06)"
    - "gloss léxico de conjunción como excepción acotada al 0-gloss del verbo (D-42-13)"
    - "sustitución de eje de distractora documentada en `notes` cuando el eje canónico colisiona con la key (`facciamo` indicativo == congiuntivo en `noi`)"

key-files:
  created:
    - content/exercises/fare-congiuntivo.json
  modified:
    - content/categories.json
    - tests/exercise-types.test.js
    - tests/content-fare-indicativo.test.js

key-decisions:
  - "El `notes` completo de los 5 slots se escribe en 42-01 aunque 3 de ellos los autore 42-02: es el mecanismo anti-inercia de la fase y llegar tarde lo vuelve inútil."
  - "En la variante de `noi` del presente el eje (a) de D-42-10 (indicativo de esa persona) se sustituye por una segunda forma real de congiuntivo de otra persona, porque `facciamo` es la misma cadena en los dos modos y ofrecerla duplicaría la key. Se cambia el eje, no la letra de D-42-10, que fija tres ejes de error y no tres cadenas."
  - "Las distractoras regularizadas del imperfetto se eligieron comprobando forma a forma que ninguna coincide con el passato remoto real (`facesti`, `facemmo`, `faceste`) ni con el condizionale de Phase 43: se descartó `fareste` como regularizada de `voi` por ser condizionale, y se usó `facaste`."
  - "Los 2 slots cierran en `validation.status: \"pending\"` con `passes: []`. El executor no fabrica pases: el quórum base Opus+Sonnet corre en pasada top-level (D-42-04, VAL-03)."

patterns-established:
  - "Homógrafa resuelta por pronombre sujeto explícito: cuando la key se repite dentro de un slot, la unicidad la da EXCLUSIVAMENTE el pronombre del hueco, y el conjunto de `options` cambia entre las variantes que comparten key porque la distractora de indicativo es específica de la persona (D-42-05, D-42-07)."
  - "Verificación de ausencia SIEMPRE por campo (`variants[].prompt`, `variants[].options[]`) y por coincidencia EXACTA, nunca por grep de fichero completo (el `notes` nombra a propósito las formas prohibidas) ni por subcadena (`face` es prefijo de `facesse`, `faceste` y `faceva`)."

requirements-completed: [CONG-01, CONG-02]

coverage:
  - id: D1
    description: "La categoría `fare-congiuntivo` existe como unidad de reset independiente: fichero de contenido en disco, entrada 16 en `content/categories.json` con `order: 16` y `origen: \"ia-quorum\"`, y carga en boot apareciendo en home, picker, Repaso y Examen por el camino genérico, sin una línea de motor nueva."
    verification:
      - kind: unit
        ref: "tests/domain.test.js — validación del bundle auto-descubierto con `result.errors` vacío"
        status: pass
      - kind: unit
        ref: "tests/schema-validator-origen.test.js — enum PROV-01 sobre la entrada nueva"
        status: pass
      - kind: manual_procedural
        ref: "Task 2 checkpoint:human-verify (gate=blocking) — el autor abrió http://localhost:3000, jugó la categoría y respondió `aprobado`"
        status: pass
      - kind: other
        ref: "git diff --quiet src/screens/app.js src/domain/ src/data/ → exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Slot `fare-congiuntivo-presente` con 6 variantes y las keys `faccia`/`faccia`/`faccia`/`facciamo`/`facciate`/`facciano` en orden de persona, con las tres homógrafas de singular resueltas por pronombre sujeto explícito (CONG-01)."
    requirement: CONG-01
    verification:
      - kind: unit
        ref: "tests/exercise-types.test.js — sub-tests editoriales activados por la entrada nueva de CATEGORIES_WITH_EXPLANATIONS (explanation no vacía, 0 smart-quotes, 0 markdown, 0 leak R1, 0 cross-refs R2)"
        status: pass
      - kind: other
        ref: "scan de aceptación por campo (107 checks, 0 fails) — keys en orden, distractoras D-42-10, blacklist exacta, pronombre por persona, gloss del conjunto cerrado"
        status: pass
      - kind: manual_procedural
        ref: "Task 2 checkpoint:human-verify — la homógrafa se comprobó resoluble a ojo, aprobado sin incidencias"
        status: pass
    human_judgment: false
  - id: D3
    description: "Slot `fare-congiuntivo-imperfetto` con 6 variantes y las keys `facessi`/`facessi`/`facesse`/`facessimo`/`faceste`/`facessero` en orden de persona, con `facessi` homógrafa en io y tu resuelta por pronombre sujeto explícito (CONG-02)."
    requirement: CONG-02
    verification:
      - kind: unit
        ref: "tests/exercise-types.test.js — sub-tests editoriales sobre el slot nuevo"
        status: pass
      - kind: other
        ref: "scan de aceptación por campo (107 checks, 0 fails) — keys, 1 indicativo de SU persona por variante, 1 congiuntivo real de otra, 1 regularizada inexistente, option sets distintos entre las dos `facessi`"
        status: pass
    human_judgment: true
    rationale: "El `must_haves` de este plan marca como `verification: backstop` la unicidad de lectura del disparador y del marco — que ninguna variante admita una segunda forma defendible es un juicio lingüístico que ninguna aserción mecánica cierra. Este slot se autoró DESPUÉS del checkpoint humano de Task 2, así que sus 6 variantes no han pasado por ojo humano ni por el quórum base, que corre en la pasada top-level de D-42-04."
  - id: D4
    description: "Estado de hand-off correcto al quórum: los 2 slots en `validation.status: \"pending\"` con `passes: []`, y el rojo de VAL_07_STRICT como marcador visible de que el quórum base todavía no ha corrido."
    verification:
      - kind: other
        ref: "VAL_07_STRICT=1 node --test tests/*.test.js → fail 1, nombrando `fare-congiuntivo-presente(pending), fare-congiuntivo-imperfetto(pending)` y ninguna otra categoría"
        status: pass
      - kind: unit
        ref: "node --test tests/*.test.js → 773 pass / 0 fail"
        status: pass
    human_judgment: false

# Metrics
duration: 8h 32m (wall-clock; ~8h son el gate humano nocturno de Task 2)
completed: 2026-08-06
status: complete
---

# Phase 42 Plan 01: Alta de `fare-congiuntivo` y los 2 tiempos simples Summary

**La categoría `fare-congiuntivo` nace en disco y en el registro con sus dos tiempos simples autorados — 12 variantes multiple-choice en las que 5 keys son homógrafas (`faccia` x3, `facessi` x2) y la respuesta la desambigua únicamente el pronombre sujeto explícito — sin tocar una sola línea del motor v1.4.**

## Performance

- **Duration:** 8h 32m wall-clock, de los que unas 8h son el gate humano nocturno de Task 2
- **Started:** 2026-08-05T22:47:48Z (commit del tracer)
- **Completed:** 2026-08-06T07:19:57Z (commit de la expansión)
- **Tasks:** 3 de 3 (1 tracer, 1 checkpoint aprobado, 1 auto)
- **Files modified:** 4 (3 de `files_modified` + 1 desviación aceptada)

## Accomplishments

- **La categoría existe y es una unidad de reset independiente.** `content/exercises/fare-congiuntivo.json` en disco + entrada 16 en `content/categories.json` (`order: 16`, `origen: "ia-quorum"`, raya em U+2014). Carga en boot y aparece en home, picker, Repaso y Examen por el camino genérico. `git diff --quiet src/screens/app.js src/domain/ src/data/` sale con código 0: cero motor.
- **CONG-01 cubierto.** `fare-congiuntivo-presente`, 6 variantes, keys `faccia` / `faccia` / `faccia` / `facciamo` / `facciate` / `facciano`. Las tres del singular comparten cadena a propósito y la unicidad la da el pronombre.
- **CONG-02 cubierto.** `fare-congiuntivo-imperfetto`, 6 variantes, keys `facessi` / `facessi` / `facesse` / `facessimo` / `faceste` / `facessero`, con `facessi` repetida en io y tu.
- **El `notes` anti-inercia escrito completo antes de la primera variante**, incluido el gate HARD de no-correferencia con su pareja explícita (`Penso di fare i compiti` correcta frente a `Penso che io faccia i compiti` mal construida) — que es el fallo sistemático que esta categoría genera si se autora del modo obvio.
- **Suite en verde en cada commit:** 773 pass / 0 fail, el mismo número que el baseline porque el `expected` del smoke es dinámico y los sub-tests editoriales son por categoría, no por slot.

## Task Commits

1. **Task 1: Tracer — `fare-congiuntivo-presente` de punta a punta (fichero + `notes` + `categories.json` + línea del smoke)** — `7673400` (feat)
2. **Task 2: Gate del tracer (`checkpoint:human-verify`, `gate="blocking"`)** — sin commit; el autor abrió `http://localhost:3000`, jugó la categoría y respondió `aprobado` sin incidencias
3. **Task 3: Expansión — `fare-congiuntivo-imperfetto`, 6 variantes (CONG-02)** — `f7ef0ef` (feat)

## Files Created/Modified

- `content/exercises/fare-congiuntivo.json` — **creado.** 2 claves top-level (`notes`, `exercises`), 2 slots MC, 12 variantes, los 2 en `validation.status: "pending"` con `passes: []`.
- `content/categories.json` — entrada 16 `fare-congiuntivo` con las 4 claves del schema. No es cosmética: `src/data/schema-validator.js:133-146` rechaza un `categoryIds` que referencie una categoría desconocida, así que el fichero de contenido no puede estar en disco sin ella.
- `tests/exercise-types.test.js` — 1 línea en `CATEGORIES_WITH_EXPLANATIONS` con `expected: slotCountOf(...)` dinámico, que activa los sub-tests editoriales sobre el fichero nuevo.
- `tests/content-fare-indicativo.test.js` — desviación Rule 3 aceptada, ver abajo.

## Decisions Made

- **El `notes` cubre los 5 slots aunque 3 los autore 42-02.** Es el mecanismo anti-inercia de la fase entera; declararlo tarde lo vuelve decorativo.
- **Sustitución de eje en la distractora de `noi` del presente.** `facciamo` es la MISMA cadena en indicativo y en congiuntivo, así que el eje (a) de D-42-10 duplicaría la key dentro de la variante y rompería la regla de `options` sin duplicados. Se sustituye por una segunda forma real de congiuntivo de otra persona y queda declarado en `notes` con fecha. Se comprobó forma a forma que no hay más colisiones: en el presente `facciate`/`fate` y `facciano`/`fanno` no colisionan, y en el imperfetto no colisiona ninguna.
- **Las regularizadas del imperfetto se validaron contra el passato remoto real.** `facesti`, `facemmo` y `faceste` son formas REALES de indicativo y `faceste` es además una key de este slot, así que ninguna "inventada" podía caer ahí. Se descartó `fareste` como regularizada de `voi` por ser condizionale (casilla de Phase 43) y se usó `facaste`. Las 6 finales son `facassi`, `faressi`, `faresse`, `facassimo`, `facaste`, `faressero`.
- **Hand-off intacto:** los 2 slots cierran en `pending` con `passes: []`. No se fabricó ningún pase.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Assert de `fare-indicativo` acoplado a "ser la última entrada de `categories.json`"**

- **Found during:** Task 1 (tracer), antes del checkpoint
- **Issue:** `tests/content-fare-indicativo.test.js` afirmaba que `fare-indicativo` era la ÚLTIMA entrada de `content/categories.json`. Añadir la 16ª entrada ponía ese assert en rojo, lo que habría dejado la suite roja en el commit del tracer y habría bloqueado el resto del plan.
- **Fix:** el assert se reescribió a `índice === 14` (order 15 menos 1). "Ser la última" nunca fue el invariante real — el invariante es la posición de `fare-indicativo` en el array, que sí es estable; "ser la última" solo era cierto por accidente de que ninguna categoría se había añadido después.
- **Files modified:** `tests/content-fare-indicativo.test.js` (4º fichero, fuera de los 3 de `files_modified`)
- **Verification:** `node --test tests/*.test.js` → 773 pass / 0 fail
- **Committed in:** `7673400` (dentro del commit del tracer)
- **Estado:** presentado al autor en el checkpoint de Task 2 y **aceptado explícitamente**. No se revierte.

---

**Total deviations:** 1 auto-fixed (1x Rule 3 - blocking), aprobada por el autor en el gate de Task 2.
**Impact on plan:** ninguno sobre el alcance. Toca un 4º fichero fuera de `files_modified`, que es la razón por la que el gate de scope del plan (`git status --porcelain src/ scripts/ content/categories.json tests/` vacío en Task 3) se verificó solo sobre la Task 3, donde sí se cumple literalmente: la Task 3 tocó UN solo fichero.

## Issues Encountered

- **El scan de aceptación tuvo que salir del one-liner de bash.** La blacklist de Phase 43 incluye `fa'` con apóstrofo final, que rompía el entrecomillado de `node -e '...'`. Se movió el scan a un `.mjs` en el scratchpad; los 107 checks corren en 0 fails. No es un cambio de criterio, solo de vehículo.
- **`VAL_07_STRICT=1` en rojo es el estado correcto al cerrar**, no un fallo: `fail 1`, nombrando exactamente los 2 slots `pending` y ninguna otra categoría.
- **`node scripts/run-validation-271.mjs` sigue en PASS y no ve la categoría.** Es la ceguera documentada en §Correcciones 5 del plan, no un fallo: el reporter no verá `fare-congiuntivo` hasta que Phase 44 / INT-02 sincronice los arrays de conteo. Por eso el marcador honesto del trabajo pendiente es `VAL_07_STRICT`, no el reporter.

## Nota de calibración sobre `actuals.tokens`

`actuals.tokens: 6667` es `chars/4` sobre el diff realizado (26.669 caracteres en `content/` y `tests/`), que es la escala que el protocolo exige. El `estimate.tokens: 78000` del plan está claramente en una escala distinta — consumo de contexto, no tamaño de diff —, así que **el par no es comparable y no debe leerse como un 12x de sobreestimación**. Lo útil para calibrar futuras fases es el dato crudo: un plan de autoría de 12 variantes MC más un `notes` largo produce del orden de 27 KB de diff.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Listo para 42-02.** El `notes` ya declara los 5 slots, los 3 patrones de distractoras y las 4 homografías, así que 42-02 autora `passato`, `trapassato` y el slot del disparador sobre un contrato ya escrito, y añade `tests/content-fare-congiuntivo.test.js` con sus 13 bloques de gates.

**Pendiente explícito, y es un entregable visible de la fase, no un supuesto:**

1. **El quórum base canónico (Opus + Sonnet) NO ha corrido** y no puede correr dentro del executor: el skill `gsd-validate-exercise` spawnea Task subagents y un `gsd-executor` no puede hacerlo. Se corre en top-level tras `execute-phase`, **un ejercicio por contexto, NUNCA batched (VAL-03)**.
2. **Ronda EXTRA obligatoria de DeepSeek (D-42-08)** sobre las 10 variantes homógrafas de la fase — 5 de ellas viven ya en este plan (`faccia` io/tu/lui-lei, `facessi` io/tu).
3. **Falso positivo de política esperado:** Gemini y DeepSeek marcarán el gloss `Benché (aunque)` / `Nonostante (a pesar de que)` como C5-leak. NO se arregla (D-42-13). En cambio un flag **C4-accent** sobre español sin tildes sería bug REAL y se arregla poniendo los acentos.
4. **El slot `imperfetto` no ha pasado por ojo humano** (se autoró después del checkpoint de Task 2) — ver `coverage.D3`, marcado `human_judgment: true`.

**Sin blockers.** La suite está en `fail 0`, el motor sin tocar y el árbol limpio.

## Self-Check: PASSED

- Ficheros verificados en disco: `content/exercises/fare-congiuntivo.json`, `content/categories.json`, `tests/exercise-types.test.js`, `tests/content-fare-indicativo.test.js`, `42-01-SUMMARY.md` — 5/5 FOUND.
- Commits verificados en `git log --all`: `7673400`, `f7ef0ef` — 2/2 FOUND.
- Sin stubs, sin tests skipped, sin `<verify>` sin correr.

---
*Phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador*
*Completed: 2026-08-06*
