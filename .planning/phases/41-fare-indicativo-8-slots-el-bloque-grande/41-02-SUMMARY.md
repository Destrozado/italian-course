---
phase: 41-fare-indicativo-8-slots-el-bloque-grande
plan: 02
subsystem: content
tags: [json-content, slot-variants, multiple-choice, fare, indicativo, tiempos-compuestos, quorum-handoff, test-invariantes]

# Dependency graph
requires:
  - phase: 41-fare-indicativo-8-slots-el-bloque-grande
    provides: "41-01 — content/exercises/fare-indicativo.json con notes de 8 declaraciones, 4 slots simples, 24 variantes en pending, la entrada de categories.json (order 15) y la linea de CATEGORIES_WITH_EXPLANATIONS con expected dinamico"
  - phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
    provides: "CURRENT_SCHEMA_VERSION 13 con 'fare-indicativo' en RESET_PREFIXES_V13"
  - phase: 9-validacion-quorum
    provides: "src/data/validation-state.js -> deriveStatus(passes), la funcion que el gate nuevo importa para que un validated no se pueda forjar"
provides:
  - "content/exercises/fare-indicativo.json completado a 8 slots y 48 variantes: los 4 compuestos (passato prossimo, trapassato prossimo, futuro anteriore, trapassato remoto) con avere + fatto invariable"
  - "24 variantes compuestas mas: el eje del ejercicio deja de ser la forma y pasa a ser el marco temporal, porque fatto no cambia nunca y lo unico que el autor decide es en que tiempo va avere"
  - "fare-indicativo-trapassato-remoto — el unico requisito SINTACTICO de la fase: 6 variantes dentro de subordinada temporal con la principal en passato remoto y los 3 conectores repartidos 2+2+2"
  - "tests/content-fare-indicativo.test.js — 14 bloques / 61 tests que convierten los gates de la categoria en invariantes permanentes, con prueba de fail-first sobre los 4 sabotajes mas probables"
  - "notes ampliado con 3 declaraciones nuevas: reparto de las 2 familias de distractora malformada, colocacion preverbal de gia, y la prohibicion del auxiliar en imperfetto en el trapassato remoto"
  - "hand-off honesto al quorum top-level: los 8 slots en pending con passes vacio y VAL_07_STRICT=1 en rojo nombrandolos"
affects: [42-congiuntivo, 43-condizionale-imperativo, 44-integracion-cruces-counts]

# Actuals (#2632)
actuals:
  tokens: 14159
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "invariante estructural de una sola forma que cierra dos prohibiciones a la vez: opciones de dos palabras con fatto o fare como segunda, que excluye por construccion el tiempo simple como distractora Y el participio concordado"
    - "gate de contenido por categoria en su propio fichero de test, con escaneos de ausencia SIEMPRE por campo y con el porque de cada decision escrito dentro del test"
    - "coherencia del audit trail como test: status === deriveStatus(passes) importando la funcion real, verde con passes vacio y rojo ante un validated escrito a mano"
    - "prueba de fail-first del gate sobre una copia fuera del repo: 4 sabotajes, 4 rojos, ninguna mutacion sobre el fichero real"

key-files:
  created:
    - tests/content-fare-indicativo.test.js
  modified:
    - content/exercises/fare-indicativo.json

key-decisions:
  - "Los 4 slots compuestos cierran en validation.status pending con passes vacio, igual que los 4 simples: el quorum canonico Opus+Sonnet no corre dentro del executor y un pase fabricado destruiria el unico audit trail que el autor tiene"
  - "La familia de essere como distractora malformada se usa SOLO donde el prompt lleva objeto directo explicito, y en el trapassato remoto NO se usa en ninguna variante: la secuencia fui fatto esta atestiguada como pasivo (fui fatto prigioniero), y el slot con mas exigencia de unicidad de lectura de la fase no es sitio para tentarla"
  - "El auxiliar en imperfetto queda prohibido como distractora en el trapassato remoto (desviacion declarada de D-41-10): el trapassato prossimo es el competidor casi sinonimo tras quando y dopo che, y ofrecerlo abriria exactamente la segunda lectura que SC-2 prohibe"
  - "El adverbio gia se coloca DELANTE del hueco, no entre auxiliar y participio: es consecuencia directa de la invariante de dos palabras, la colocacion preverbal es gramatical y marcada por foco, y se anota en el notes para que el quorum sepa que mira una eleccion deliberada"
  - "El orden del array de exercises se mantiene tal como lo dejo 41-01 (futuro semplice antes de passato remoto) en lugar del orden de paradigma que enunciaba el plan: el orden del array no tiene efecto funcional y reordenarlo reescribiria trabajo ya commiteado por cero ganancia"

patterns-established:
  - "Un prompt de passato prossimo lleva una consecuencia en PRESENTE (e adesso sono libero, e ora puo riposare) que bloquea la lectura de trapassato: sin ese cierre, avevo fatto seria defendible como fondo narrativo y la variante tendria dos respuestas"
  - "La unicidad de lectura de un conector permisivo se garantiza con DOS mecanismos simultaneos y verificables, nunca con uno: el tiempo de la oracion principal y la composicion de la lista de opciones"
  - "La regla del autor sobre formas atestiguadas se extiende de las palabras sueltas a las SECUENCIAS: fui fatto no es una forma de fare, pero es una secuencia italiana atestiguada, asi que se trata igual"

requirements-completed: [IND-05, IND-06]

coverage:
  - id: D1
    description: "IND-05 passato prossimo: el autor es examinado sobre ho/hai/ha/abbiamo/avete/hanno fatto eligiendo el TIEMPO DEL AUXILIAR por un marco reciente o conectado con el presente"
    requirement: IND-05
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#paradigma completo, 48 keys / patron de distractoras de los 4 compuestos / marcos disjuntos (4 sub-tests)"
        status: pass
      - kind: unit
        ref: "tests/exercise-types.test.js#content/exercises/fare-indicativo.json (coverage + apostrofes + plain text + leak R1 + cross-refs R2)"
        status: pass
    human_judgment: false
  - id: D2
    description: "IND-05 trapassato prossimo: avevo..avevano fatto con anterioridad respecto a otro evento pasado, segundo verbo en pasado + gia en los 6 prompts"
    requirement: IND-05
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#paradigma + marco temporal propio por variante (D-41-02)"
        status: pass
      - kind: other
        ref: "node -e: los 6 prompts contienen gia y uno de los 6 verbos en pasado declarados, ninguno de fare"
        status: pass
    human_judgment: false
  - id: D3
    description: "IND-05 futuro anteriore: avro..avranno fatto con subordinada en quando/appena + futuro semplice + gia, y los acentos de avro/avra correctos"
    requirement: IND-05
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#paradigma completo (igualdad ordenada byte a byte con las 6 formas acentuadas)"
        status: pass
    human_judgment: false
  - id: D4
    description: "IND-06 / SC-3 trapassato remoto: ebbi..ebbero fatto SIEMPRE dentro de subordinada temporal con la principal en passato remoto, conectores 2+2+2, y explanation que dice que fuera del marco la forma no se usa"
    requirement: IND-06
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#marco sintactico del trapassato remoto (4 sub-tests: conector unico, reparto 2+2+2, principal en passato remoto sin duplicar fare, negacion explicita)"
        status: pass
    human_judgment: false
  - id: D5
    description: "SC-2: ninguna variante compuesta admite dos lecturas del marco — las 2 distractoras de auxiliar van en la misma persona que la key, ninguna opcion es tiempo simple ni participio concordado, y el trapassato remoto no ofrece el auxiliar en imperfetto"
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#patron de distractoras de los 4 compuestos + trapassato remoto sin auxiliar en imperfetto"
        status: pass
      - kind: other
        ref: "las 96 opciones compuestas son de dos palabras con fatto o fare como segunda; 0 con fatta/fatti/fatte"
        status: pass
    human_judgment: true
    rationale: "Que ninguna de las 48 variantes admita una segunda lectura del marco es el backstop declarado del plan: un juicio linguistico que ninguna asercion mecanica cierra. Los tests prueban la composicion de la lista de opciones y la presencia del marco, no la ausencia de una lectura que la autoria no haya pensado. Lo cierra la pasada TOP-LEVEL de quorum (D-41-15) con la ronda EXTRA DeepSeek obligatoria sobre los 12 variantes de passato remoto y trapassato remoto (D-41-12), que debe pronunciarse explicitamente sobre las 2 variantes con quando."
  - id: D6
    description: "SC-4 (mitad mecanica): canon editorial verificado y coherencia del audit trail convertida en gate permanente, sin fabricar un solo pase"
    verification:
      - kind: unit
        ref: "tests/content-fare-indicativo.test.js#canon editorial e higiene del JSON + coherencia del audit trail de validacion (7 sub-tests)"
        status: pass
      - kind: other
        ref: "prueba de fail-first sobre copia fuera del repo: gloss (2 rojos), distractora fo (1), marco reciente en el remoto (2), validated con passes vacio (3)"
        status: pass
    human_judgment: false
  - id: D7
    description: "SC-5: los 8 slots cargan y se muestran por el camino generico, sin una linea de motor nueva"
    verification:
      - kind: other
        ref: "git diff --stat src/screens/app.js src/domain/ src/data/ — salida vacia; grep applyImmediateFailure(this.state = 2 (invariante D-54); test de regresion del registro de categories.json en verde"
        status: pass
    human_judgment: false

# Metrics
duration: 46m
completed: 2026-08-03
status: complete
---

# Phase 41 Plan 02: los 4 tiempos compuestos de `fare` Summary

**Los 4 tiempos compuestos del indicativo de `fare` autorados como 4 slots multiple-choice de 6 personas (24 casillas mas, hasta 48), con el trapassato remoto encerrado en su unico marco vivo y con los gates de toda la categoria convertidos en 61 tests permanentes que ya han demostrado tener dientes.**

## Performance

- **Duration:** 46m (Task 1 -> commit de Task 3)
- **Started:** 2026-08-03T17:45Z aprox.
- **Completed:** 2026-08-03T18:31Z
- **Tasks:** 3 (todas `type="auto"`, sin checkpoints)
- **Files modified:** 2 (1 modificado, 1 nuevo)

## Accomplishments

- **48 variantes = 48 casillas persona x tiempo, el paradigma cerrado.** Los 4 compuestos anaden `passato prossimo` (`ho fatto`), `trapassato prossimo` (`avevo fatto`), `futuro anteriore` (`avrò fatto`) y `trapassato remoto` (`ebbi fatto`), 6 personas cada uno, una key por casilla y sin repetir key dentro de un slot.
- **El eje del ejercicio cambia de naturaleza en los compuestos, y eso es el valor del bloque.** `fatto` es invariable con `avere`, asi que lo unico que el autor tiene que decidir es en que tiempo va el auxiliar. Las 2 distractoras de auxiliar de cada variante estan en la **misma persona** que la key: lo unico que las distingue es el tiempo, que es literalmente lo que IND-05 examina.
- **Una sola invariante estructural cierra dos prohibiciones a la vez.** Las 96 opciones compuestas son de dos palabras cuya segunda es `fatto` o `fare`. Esa forma unica excluye por construccion el tiempo simple como distractora (rechazado explicitamente por D-41-10) **y** el participio concordado (`fatta`/`fatti`/`fatte`), que es el MAGNET de Phase 43. Si se relajara, las dos prohibiciones se caerian juntas — y el test lo dice con esas palabras.
- **El trapassato remoto vive encerrado en su unico marco.** Las 6 variantes van dentro de una subordinada temporal cuya principal esta en passato remoto (`uscii di casa`, `tua madre tornò`, `telefonò a suo padre`, `arrivarono gli ospiti`, `il treno partì`, `uscirono dall'aula`), ninguna de ellas forma de `fare`. Los 3 conectores se reparten 2+2+2: `dopo che` en `io`/`noi`, `quando` en `tu`/`voi`, `appena` en `lui`/`loro`.
- **Las 2 variantes con `quando` tienen lectura unica por los DOS mecanismos, no por uno.** (i) La principal en passato remoto excluye el auxiliar en presente y en futuro; (ii) ninguna opcion del slot lleva el auxiliar en imperfetto ni es una forma simple, asi que las dos lecturas alternativas que `quando` admitiria — trapassato prossimo y passato remoto simple — **no estan en la lista de opciones** y no pueden competir. El gate verifica los dos por separado, de modo que quitar uno pone la suite roja.
- **La explanation del trapassato remoto dice con esas palabras lo que SC-3 exige:** "Fuera de ese marco la forma no se usa: no aparece en frase suelta, no se combina con una principal en presente ni en passato prossimo". Y es honesta sobre el registro — practicamente extinta en el habla, viva solo en la narracion escrita — con el paralelo castellano `hube hecho`, igual de marginal.
- **`tests/content-fare-indicativo.test.js`: 14 bloques, 61 tests, cero dependencias.** Cubre conteos y key set del schema, el paradigma completo de las 48 keys, el eje de persona con el pronombre coherente con el indice de variante, el 0-gloss, el SCOPE-GATE lexico, la blacklist, el patron de distractoras por familia, los marcos disjuntos **en las dos direcciones**, el reparto 2+2+2, la higiene anti-XSS y anti-prototype-pollution, la coherencia de `validation` con `deriveStatus` incluida la ronda extra, y el registro de `categories.json` como red de regresion.
- **La prueba de fail-first demuestra que el gate tiene dientes.** Sobre una copia fuera del repo, los 4 sabotajes mas probables ponen el fichero rojo: un gloss entre parentesis en un prompt (2 rojos), una distractora sustituida por `fo` (1), un marco reciente en el passato remoto (2), y `status: "validated"` con `passes: []` (3). Ninguna mutacion toco el fichero real.
- **Hand-off honesto.** Los 8 slots en `status: "pending"` con `passes: []`. `VAL_07_STRICT=1 node --test tests/*.test.js` falla nombrando exactamente los 8: ese rojo es el estado CORRECTO al cerrar la fase.

## Task Commits

1. **Task 1: los 3 compuestos vivos con `avere` + `fatto` (18 variantes, IND-05)** — `db25353` (feat)
2. **Task 2: `fare-indicativo-trapassato-remoto`, el unico requisito sintactico (6 variantes, IND-06)** — `dafaf34` (feat)
3. **Task 3: `tests/content-fare-indicativo.test.js`, los invariantes permanentes** — `e188049` (test)

## Files Created/Modified

- `content/exercises/fare-indicativo.json` — de 4 a 8 slots y de 24 a 48 variantes (+298 lineas); `notes` ampliado con 3 declaraciones nuevas; los 8 slots en `pending`
- `tests/content-fare-indicativo.test.js` (nuevo, 634 lineas) — 14 `describe` por decision, 61 tests, `deriveStatus` importado de su modulo real

**Ficheros deliberadamente NO tocados:** `src/` (0 lineas, SC-5), `content/categories.json` y la linea de `CATEGORIES_WITH_EXPLANATIONS` (ya hechas en 41-01), `scripts/run-validation-271.mjs` y `tests/fixtures/slot-variants-integration.test.js` (Phase 44 / INT-02), y el slot `fare-indicativo-passato-remoto` de 41-01 con sus dos formas marcadas como inciertas.

## Decisions Made

- **La familia de `essere` como distractora malformada, con dos limites.** El plan autoriza dos familias: `essere` + `fatto` sin flexionar (`sono fatto`, `ero fatto`, `sarò fatto`) o el auxiliar correcto + infinitivo (`ho fare`). La regla dura del plan es que la familia de `essere` solo vale cuando el prompt lleva objeto directo explicito, porque el objeto bloquea la lectura pasiva (`il lavoro è fatto` es correcto; `lui è fatto il lavoro` no lo es). Reparto fijo cross-slot en los 3 compuestos vivos: `essere` en `io`/`noi`/`loro`, infinitivo en `tu`/`lui`/`voi`.
- **En el trapassato remoto, la familia de `essere` NO se usa en ninguna de las 6.** `fui fatto` esta atestiguada como pasivo (`fui fatto prigioniero`, `fui fatto cavaliere`). Aunque el objeto directo la bloquee en el marco concreto del prompt, ofrecerla en el slot con mas exigencia de unicidad de lectura de toda la fase seria tentar exactamente el riesgo que SC-2 prohibe. **La regla que el autor ratifico en 41-01 sobre formas atestiguadas se extiende aqui de las palabras sueltas a las SECUENCIAS**, y queda escrita en el `notes` con su audit trail.
- **`già` va delante del hueco, no entre auxiliar y participio.** La invariante de dos palabras impide su posicion canonica, asi que los 12 prompts de trapassato prossimo y futuro anteriore dicen `io già ___ i compiti` (leido: `io già avevo fatto i compiti`). Las dos colocaciones son gramaticales y la preverbal es la marcada por foco (`io già lo sapevo`, italiano corriente). Se declara en el `notes` para que la pasada de quorum sepa que mira una eleccion deliberada y no un descuido.
- **Los 6 prompts del passato prossimo llevan una consecuencia en PRESENTE.** `Stamattina io ___ i compiti e adesso sono libero`. Sin ese cierre, la distractora `avevo fatto` seria defendible como fondo narrativo de un pasado implicito, y la variante tendria dos respuestas correctas — el dano exacto que la prohibicion principal del plan nombra. La consecuencia en presente es tambien la materializacion literal del marco "reciente o conectado con el presente" de D-41-11.
- **Los 6 objetos de cada slot salen del conjunto cerrado de D-41-06 y no se repiten dentro del slot.** Efecto colateral buscado, heredado de 41-01: sin perifrasis no queda lexico que glosar, lo que refuerza el 0-gloss.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] El orden del array de `exercises` que el plan enunciaba no es el que hay en disco**
- **Found during:** Task 2 (criterio de aceptacion del orden de los 8 ids)
- **Issue:** El criterio de aceptacion de la Task 2 exige los 8 ids en el orden `presente, imperfetto, passato remoto, futuro semplice, ...`, que es el orden de paradigma de D-41-14. Pero 41-01 escribio `futuro-semplice` **antes** de `passato-remoto`, y ese fichero esta commiteado (`97c0c97`, `b41209c`). Cumplir el criterio literal habria exigido reordenar el array, es decir reescribir trabajo de la Wave 1.
- **Fix:** Los 4 compuestos se anaden al final y el orden de 41-01 se preserva intacto. El orden del array **no tiene efecto funcional**: los slots se resuelven por id (`slotById`) y el orden de display sale de `content/categories.json`, no de este array. El gate de la Task 3 asserta el orden REAL de disco, con su comentario, para que un reordenado futuro sea una decision consciente y no un accidente.
- **Principio aplicado:** el mismo que 41-01 ratifico en la direccion de la gramatica — donde la prosa del plan y el estado real discrepan, gana el estado real y la discrepancia se documenta.
- **Files modified:** `content/exercises/fare-indicativo.json`, `tests/content-fare-indicativo.test.js`
- **Verification:** `node --test tests/*.test.js` en `fail 0`; el bloque 1 del gate nuevo asserta la igualdad exacta del array de ids
- **Committed in:** `dafaf34`, `e188049`

**2. [Rule 2 - Missing Critical] Consecuencia en presente anadida a los 6 prompts del passato prossimo**
- **Found during:** Task 1 (slot `passato-prossimo`)
- **Issue:** El plan pedia prompts con marco reciente del tipo "Stamattina io ___ i compiti". Con solo ese marco, la distractora `avevo fatto` es **defendiblemente correcta**: el trapassato prossimo admite un punto de anterioridad implicito por contexto, y un hablante nativo no la rechazaria de plano. Eso es una variante con dos respuestas, y la prohibicion principal del plan la nombra como el dano exacto que la herramienta existe para evitar.
- **Fix:** Cada uno de los 6 prompts cierra con una consecuencia en presente (`e adesso sono libero`, `e la stanza è ancora in ordine`, `e ora può riposare`, `e la mangiamo a cena`, `e ora la guardate insieme`, `e adesso lo pagano`). La unica clausula ademas del hueco esta en presente, asi que no hay ningun ancla pasada que licencie el trapassato, y el futuro queda excluido por el marco reciente.
- **Files modified:** `content/exercises/fare-indicativo.json`
- **Verification:** las 6 variantes revisadas una a una contra las 3 distractoras; escaneo de 0 marcos remotos; suite en `fail 0`
- **Committed in:** `db25353`

**3. [Rule 2 - Missing Critical] La familia de `essere` retirada de las 6 variantes del trapassato remoto**
- **Found during:** Task 2 (eleccion de la 3a distractora)
- **Issue:** Aplicando la regla del autor sobre formas atestiguadas, `fui fatto` / `fummo fatto` / `furono fatto` resultan ser secuencias italianas atestiguadas como pasivo (`fui fatto prigioniero`). El objeto directo del prompt las bloquea, y por eso el plan las autoriza; pero este es el slot donde SC-2 exige unicidad de lectura con mas dureza y el que lleva ronda EXTRA DeepSeek obligatoria.
- **Fix:** Las 6 variantes usan la familia del infinitivo (`ho fare`, `hai fare`, `ha fare`, `abbiamo fare`, `avete fare`, `hanno fare`), inequivocamente malformada y sin ninguna lectura atestiguada. Queda declarado en el `notes` con su porque, junto con la extension de la regla del autor de las palabras sueltas a las secuencias.
- **Files modified:** `content/exercises/fare-indicativo.json`
- **Verification:** el bloque 7 del gate exige exactamente 1 malformada por variante; ninguna de las 24 opciones del slot lleva una forma de `essere`
- **Committed in:** `dafaf34`

---

**Total deviations:** 3 auto-fixed (1 bug de discrepancia plan/disco, 2 missing-critical de correccion del contenido). Ninguna toca el alcance: cero ficheros fuera de `files_modified`, cero scope creep, cero lineas de motor.

## Known Stubs

Ninguno. No hay dato mockeado, ni componente sin fuente, ni valor placeholder: los 8 slots son contenido real y jugable. Lo que queda abierto no es un stub, es la **pasada de quorum**, y esta abierta por diseno y a la vista (ver §Next Phase Readiness y `.planning/WINDOWS.md`).

## Issues Encountered

- **`\b` no funciona contra caracteres acentuados en JS.** Los primeros escaneos ad-hoc de verificacion usaban `\b(è tornata)\b` y `\b(partirà)\b`, que no matchean porque `è` y `à` no son word chars sin el flag `u`. Era un bug del script de verificacion, no del contenido: corregido quitando los `\b` de los extremos acentuados. El fichero de test definitivo usa `includes` para los marcos y `\b` solo sobre los pronombres, que son ASCII puro.
- **El reporter `run-validation-271.mjs` sigue ciego al fichero.** Con 48 variantes en disco no cambia de total: ambos lados del baseline-guard iteran el array `CATEGORIES`, que no incluye `fare-indicativo` hasta Phase 44 / INT-02. Es la ceguera documentada en el `notes` y en 41-01, no un fallo — y es peor que un rojo porque parece verde. El marcador honesto sigue siendo `VAL_07_STRICT=1`.
- **`.planning/config.json` aparece modificado en el arbol** (`_auto_chain_active: true`). Es la bandera efimera del orquestador, no trabajo de este plan: no se ha commiteado en ninguno de los 3 commits de tarea.

## User Setup Required

None — no hay configuracion de servicios externos. El proyecto es web estatica de dependencias cero y los tests corren con el runner nativo de Node.

## Next Phase Readiness

**La fase 41 esta cerrada en cuanto a autoria: 8 slots, 48 variantes, motor intacto.** `node --test tests/*.test.js` en **765 pass / 0 fail** (704 de 41-01 + 61 del gate nuevo).

**Trabajo pendiente que NO es un fallo y que hay que no olvidar:**

1. **La pasada TOP-LEVEL de quorum, sin la cual SC-4 esta abierto.** Los 8 slots en `pending`. Se corre en top-level tras `execute-phase` con el skill `gsd-validate-exercise`, **un ejercicio por contexto y NUNCA batched (VAL-03)**: 8 invocaciones, una por id de slot, en el orden en que aparecen en el fichero. El executor no puede spawnear sus Task subagents, asi que no lo ha intentado ni ha escrito un solo pase.
2. **Ronda EXTRA DeepSeek obligatoria en `fare-indicativo-passato-remoto` y `fare-indicativo-trapassato-remoto`** (D-41-12, `scripts/validate-ai-pass.mjs`, claves en `.env`). Los puntos concretos que tiene que mirar con lupa:
   - **`facetti` y `facerono`** en el passato remoto — herencia de 41-01, marcadas como inciertas y no resueltas.
   - **Las 2 variantes con `quando` del trapassato remoto** (`Quando tu ___ il letto, tua madre tornò` y `Quando voi ___ una foto, il treno partì`): debe pronunciarse EXPLICITAMENTE sobre la unicidad de lectura del marco, verificando los dos mecanismos por separado.
   - **La colocacion preverbal de `già`** en los 12 prompts de trapassato prossimo y futuro anteriore: es deliberada y esta declarada en el `notes`; si el pase la marca como poco natural, la discusion es de estilo, no de gramatica.
   - **Las 3 secuencias de `essere` + `fatto`** que si se usan en los compuestos vivos (`sono fatto`, `ero fatto`, `sarò fatto` / `siamo fatto`, `eravamo fatto`, `saremo fatto` / `saranno fatto`): estan bloqueadas por el objeto directo del prompt, y conviene que un segundo vendor lo confirme variante a variante.
3. **En esa misma pasada, el pase Opus de cada slot debe registrar en sus `concerns` la re-declaracion local del 0-gloss**, mirror literal de `content/exercises/riflessivi.json:245`.
4. **Sync de counts diferido a Phase 44 / INT-02:** `CATEGORIES` de `scripts/run-validation-271.mjs` y `REAL_CATEGORIES` de `tests/fixtures/slot-variants-integration.test.js` siguen sin `fare-indicativo`, deliberadamente.
5. **Para Phase 43 (INDEF-04):** el MAGNET de la concordancia de `fatto` (`li ho fatti`) tiene el camino limpio. Ninguna de las 96 opciones compuestas de esta fase lleva `fatta`, `fatti` ni `fatte`, y el bloque 6 del gate nuevo lo mantiene asi para siempre. Phase 43 tambien debe saber que `fa` sin apostrofe ya vive aqui como indicativo de 3a singular.

**Sin blockers.** `git diff --stat src/screens/app.js src/domain/ src/data/` vacio, `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` sigue en `2` (invariante D-54), y `git status --porcelain` sin un solo fichero fuera de los 2 de `files_modified`.

## Self-Check: PASSED

- `content/exercises/fare-indicativo.json` — FOUND (8 slots, 48 variantes, 8/8 en `pending` con `passes: []`)
- `tests/content-fare-indicativo.test.js` — FOUND (14 `describe`, 61 tests, 1 sola linea que importa `deriveStatus` del modulo real)
- Commit `db25353` — FOUND
- Commit `dafaf34` — FOUND
- Commit `e188049` — FOUND
- `node --test tests/*.test.js` — 765 pass / 0 fail
- `node --test tests/content-fare-indicativo.test.js` — 61 pass / 0 fail
- Prueba de fail-first (4 sabotajes sobre copia fuera del repo) — 4/4 rojos
- `VAL_07_STRICT=1 node --test tests/*.test.js` — falla nombrando los 8 slots `(pending)`, que es el estado correcto de cierre
- `git diff --stat src/screens/app.js src/domain/ src/data/` — salida vacia
- `git diff --stat scripts/ content/categories.json` — salida vacia (arrays diferidos a Phase 44 intactos)

---
*Phase: 41-fare-indicativo-8-slots-el-bloque-grande*
*Completed: 2026-08-03*
