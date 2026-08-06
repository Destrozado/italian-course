---
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
plan: 01
subsystem: content
tags: [json-content, italiano, condizionale, imperativo, quorum, node-test, categories-registry]

# Dependency graph
requires:
  - phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
    provides: "el slug `fare-cond-imperativo` ya en RESET_PREFIXES_V13 (src/data/storage.js:1345) y la convencion de ids de cruce (D-40-07)"
  - phase: 41-fare-indicativo-8-slots-el-bloque-grande
    provides: "las keys `fai`/`fa`/`fate` del presente de indicativo y las 6 del futuro semplice (familia de distractoras del slot 1), mas el SCOPE-GATE del objeto literal (D-41-06) y el pronombre sujeto explicito (D-41-07)"
  - phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
    provides: "el molde de forma de content/exercises/fare-congiuntivo.json, el molde de test de tests/content-fare-congiuntivo.test.js (13 describe, WR-01..WR-11, IN-03..IN-09) y las keys `faccia`/`facciamo`/`facciano` del congiuntivo presente"
provides:
  - "categoria `fare-cond-imperativo` registrada (order 17) y cargando en boot por el camino generico, como unidad de reset independiente"
  - "3 slots multiple-choice / 17 variantes: condizionale presente (6), condizionale passato (6), imperativo presente (5)"
  - "el MAGNET de la 2a singular resuelto con audit trail: key `fa'` (U+0027), `fai` y `fa` a blacklist declarada"
  - "tests/content-fare-cond-imperativo.test.js — 13 describe / 63 tests de invariantes permanentes, con 4 desviaciones declaradas y 12 pruebas negativas ejecutadas"
  - "el matcher con lookahead negativo del apostrofe ASCII, reusable por cualquier categoria futura con key apostrofada"
affects: [43-02-fare-indefiniti, 44-integracion-counts-cruces, INT-02, INT-03, INT-04, quorum-top-level]

# Actuals (#2632)
actuals:
  tokens: 24733
  tasks: 4
  commits: 4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "matcher de blacklist con lookahead negativo del apostrofe ASCII para keys apostrofadas"
    - "ancla declarada como par {lit, head} cuando el literal contiene un subordinante que CORTE_DE_CLAUSULA consume"
    - "tabla EXPECTED_VARIANTS por id para slots de conteo desigual"

key-files:
  created:
    - content/exercises/fare-cond-imperativo.json
    - tests/content-fare-cond-imperativo.test.js
  modified:
    - content/categories.json
    - tests/exercise-types.test.js

key-decisions:
  - "La distractora mal construida del condizionale passato es el auxiliar del condizionale con INFINITIVO (`avrei fare`), no el auxiliar de movimiento con participio (`sarei fatto`): la comprobacion obligatoria forma a forma tumbo la segunda familia porque `sarebbe fatto` es una PASIVA gramatical del italiano, y ofrecer una forma atestiguada como distractora incorrecta viola el criterio operativo de la blacklist de la propia categoria."
  - "El ancla de futuro-nel-passato se declara como par {lit, head}: `gobiernaElHueco` parte por CORTE_DE_CLAUSULA, que CONSUME el `che` subordinante, asi que comprobar el ambito con el literal completo (`Ha detto che`) daria siempre falso. El literal completo se comprueba por presencia y el `head` por ambito."
  - "El escaneo de blacklist se aplica a `options` por igualdad exacta Y por matcher, no solo por exacta como en el analogo: las opciones de esta categoria son multi-palabra (`avrei fatto`, `avrei fare`) y la igualdad exacta sola no las cubriria. Es seguro precisamente porque el matcher hermano ya excluye la key apostrofada."
  - "El invariante `variants.length === 5` va PRIMERO en el bloque 1 del test y con mensaje propio, para que una mutacion del conteo lea D-43-08 en el diff y no un aviso generico de conteo."
  - "La ADVERTENCIA DE ESCANEO se declara UNA sola vez en mayusculas (el analogo la repite en el bloque 6): la referencia cruzada se conserva en minusculas, para que el marcador siga siendo grep-unico."

patterns-established:
  - "Key con apostrofe: el matcher de blacklist necesita un hermano con lookahead negativo del apostrofe ASCII, y el escaneo positivo del `notes` se ancla con un literal distintivo (`la forma fa'`) en vez de envolver la forma entre comillas simples."
  - "Gate de doble validez resuelto por AUSENCIA grep-verificable (cero `se` suelto en el slot de condizionale passato, cero deicticos de futuro en el de presente) en vez de por matiz sintactico no comprobable."
  - "Vocativo inequivoco como analogo funcional del pronombre sujeto explicito, con desambiguador EXTRA obligatorio en los dos plurales (pronombre de cortesia `Loro`, sujeto inclusivo `noi due`)."
  - "Pruebas negativas por mutacion del JSON real ejecutadas y reportadas, con restauracion byte a byte verificada: demuestran que el gate muerde y no que existe."

requirements-completed: [CI-01, CI-02, CI-03]

coverage:
  - id: D1
    description: "Condizionale presente de `fare` en las 6 personas sobre la raiz contracta `far-`, con el futuro semplice de la misma persona como distractora en las 6 y cero deicticos de futuro en los prompts"
    requirement: CI-01
    verification:
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — distractoras del condizionale presente, el futuro en las 6 (D-43-09, SC-1)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — paradigma completo, 17 keys sin repeticion (CI-01, CI-02, CI-03)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Condizionale passato en las 6 personas, con el condizionale presente como distractora del calco espanol, >=2 marcos de futuro-nel-passato que gobiernan la clausula del hueco, y cero protasis condicional"
    requirement: CI-02
    verification:
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — distractoras del condizionale passato, el calco espanol (D-43-10, SC-1)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#la explanation del passato desarrolla el par explicito del futuro en el pasado (D-43-11, SC-1)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Imperativo presente con EXACTAMENTE 5 variantes (sin `io`), key `fa'` con apostrofe ASCII, `fai`/`fa` en blacklist y ninguna de las tres como distractora incorrecta, con el registro como eje examinado"
    requirement: CI-03
    verification:
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — slot del imperativo, 5 variantes y registro (D-43-04, D-43-05, D-43-08, SC-2)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — blacklist de formas atestiguadas y defendibles (D-43-04, D-43-07)"
        status: pass
      - kind: other
        ref: "12 pruebas negativas por mutacion del JSON real (conteo x2, MAGNET x3, audit trail x2, ronda EXTRA, protasis, deictico, vocativo, ambito): las 12 ponen el gate en rojo nombrando su decision"
        status: pass
    human_judgment: false
  - id: D4
    description: "Registro de la categoria: entrada order 17 en content/categories.json, carga en boot y aparicion en home/picker/Repaso/Examen por el camino generico, sin una linea de motor nueva"
    verification:
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — registro de la categoria (D-43-22, SC-5)"
        status: pass
      - kind: integration
        ref: "node --test tests/domain.test.js (schema-validator sobre el bundle auto-descubierto) + git diff --quiet src/screens/app.js src/domain/ src/data/ (exit 0)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Unicidad de lectura de cada una de las 17 variantes: que ninguna admita una segunda respuesta defendible (el futuro bajo la protasis, `farebbe` bajo el marco de pasado, `fate` bajo el vocativo de plural)"
    verification:
      - kind: manual_procedural
        ref: "checkpoint Task 2 (tracer) — aprobado 2026-08-07 con revision explicita del backstop por el orquestador; los 12 slots restantes quedan para el pase TOP-LEVEL de quorum"
        status: unknown
    human_judgment: true
    rationale: "Es un juicio linguistico que ninguna asercion mecanica puede cerrar: los gates automatizados (deictico, protasis, vocativo, ambito) acotan el riesgo pero no demuestran la unicidad. El plan lo marca `verification: backstop` y la red real es el quorum base Opus+Sonnet mas la ronda EXTRA DeepSeek del slot de imperativo, que corren en pasada top-level posterior."

# Metrics
duration: 24min
completed: 2026-08-07
status: complete
---

# Phase 43 Plan 01: `fare-cond-imperativo` Summary

**Categoria `fare-cond-imperativo` autorada de punta a punta — 3 slots multiple-choice / 17 variantes (condizionale presente 6, condizionale passato 6, imperativo presente 5) con el MAGNET de la 2a singular resuelto como `fa'` con audit trail, mas 13 bloques de invariantes permanentes cuyos gates se demostraron con 12 mutaciones.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-08-07T01:24:00Z
- **Completed:** 2026-08-07T01:48:39Z
- **Tasks:** 4 (3 de ejecucion + 1 checkpoint)
- **Files modified:** 4 (2 creados, 2 modificados)
- **Suite:** 842 pass / 0 fail (baseline) -> **912 pass / 0 fail**

## Accomplishments

- **CI-01** — `fare-cond-imperativo-cond-presente`: 6 variantes, keys `farei` / `faresti` / `farebbe` / `faremmo` / `fareste` / `farebbero` sobre la raiz contracta. El contraste futuro-frente-a-condizionale que SC-1 pide "en al menos una variante" se examina en **las 6**, y el par minimo `faremo` / `faremmo` tiene su linea propia en la explanation. Gate HARD nuevo, no previsto por D-43-09 y escrito en plan-time: **cero deicticos de futuro** en los 6 prompts, porque con la distractora de futuro en todas ellas un `domani` la haria defendible.
- **CI-02** — `fare-cond-imperativo-cond-passato`: 6 variantes, keys `avrei fatto` .. `avrebbero fatto`. La distractora estrella es el condizionale **presente** de la misma persona, que es el calco espanol exacto; la explanation desarrolla el par `ha detto che avrebbe fatto` frente a "dijo que haria". La doble lectura se cierra por **ausencia grep-verificable**: cero `se` suelto en los 6 prompts, mas 6 anclas distintas del conjunto cerrado y 2 de futuro-nel-passato verificadas por **ambito** (`gobiernaElHueco`), no por presencia.
- **CI-03** — `fare-cond-imperativo-imperativo`: **EXACTAMENTE 5** variantes, keys `fa'` / `faccia` / `facciamo` / `fate` / `facciano`. El universo de `options` esta cerrado al propio paradigma, asi que el eje examinado es el **registro** y no la morfologia; `fa'` aparece en `options` en una sola variante y alli es la key; `fai` y `fa` no aparecen en ningun campo de ninguna de las 17 variantes. La ausencia de `io` esta documentada en los tres sitios que SC-2 exige (notes, explanation y gate de test).
- **SC-5** — la categoria carga y se muestra por el camino generico: `git diff --quiet src/screens/app.js src/domain/ src/data/` sale con **exit 0**. Cero lineas de motor.
- **Hand-off correcto** — los 3 slots quedan en `status: "pending"` con `passes: []`. `VAL_07_STRICT=1` falla con exactamente 1 fail nombrando los 3 slots; el reporter sigue en `PASS (225/225)`. Los dos estados son los esperados.

## Task Commits

1. **Task 1 (tracer): registro order 17 + `notes` completo + condizionale presente** — `5dbce8d` (feat)
2. **Task 2: checkpoint del tracer** — sin commit; auto-aprobado por el orquestador en `--auto` (`gate="blocking"`, no `blocking-human`), con revision explicita del backstop
3. **Task 3: condizionale passato (CI-02) e imperativo con el MAGNET (CI-03)** — `e0278ba` (feat)
4. **Task 4: `tests/content-fare-cond-imperativo.test.js`, 13 describe / 63 tests** — `6c00cb5` (test)

**Plan metadata:** ver commit `docs(43-01)` al cierre.

## Files Created/Modified

- `content/exercises/fare-cond-imperativo.json` — **creado**, 217 lineas. 2 claves top-level; `notes` de 22.326 caracteres con las 14 declaraciones (identidad y volumen, ausencia de `io`, MAGNET con audit trail, blacklist de 26 formas, RECONOCER NO PRODUCIR, homografia, gate de vocativo, los 2 patrones de distractoras, los 2 gates de marco, SCOPE-GATE, decisiones de omision, nota de escaneo y de count-sync); 3 slots / 17 variantes en `pending`.
- `tests/content-fare-cond-imperativo.test.js` — **creado**, 1.102 lineas, 13 `describe` / 63 tests. Invariantes permanentes de la categoria, con las 4 desviaciones respecto del analogo declaradas en la cabecera.
- `content/categories.json` — **modificado**, 1 linea eliminada (la 16a reescrita con coma) y 2 anadidas. 17 entradas, `order` contiguos 1..17.
- `tests/exercise-types.test.js` — **modificado**, 1 linea + 1 comentario en `CATEGORIES_WITH_EXPLANATIONS`, con `expected` dinamico via `slotCountOf` (D-31-06).

## Decisions Made

Cinco decisiones de autoria dentro de la discrecion que 43-CONTEXT.md deja abierta. Ninguna cambia una decision locked.

1. **La distractora mal construida del condizionale passato es `avrei fare` y no `sarei fatto`.** D-43-10 admitia las dos familias, y el plan exigia comprobar forma a forma que la combinacion **no sea gramatical en ningun contexto**. Esa comprobacion tumbo la del auxiliar de movimiento: `sarebbe fatto` es una **pasiva** gramatical del italiano (`il lavoro sarebbe fatto da lui`), asi que en abstracto es forma real, y ofrecerla como distractora incorrecta habria violado el criterio operativo de la blacklist declarado en el `notes` de esta misma categoria — el error que la fase existe para evitar, cometido en el slot de al lado. El auxiliar del condizionale con infinitivo es agramatical en cualquier contexto y en cualquier persona, y ademas ejemplifica un error real: el de quien construye el compuesto sin haber interiorizado que el segundo elemento es el participio invariable. Queda escrito en el `notes` con su porque.

2. **El ancla de futuro-nel-passato se declara como par `{lit, head}`.** `gobiernaElHueco` parte el prompt por `CORTE_DE_CLAUSULA`, que **consume** el `che` subordinante; comprobar el ambito con el literal completo `Ha detto che` habria devuelto siempre falso y el gate de D-43-11 habria sido insatisfacible o, peor, se habria degradado a presencia sin que nadie lo notase. Se comprueba el literal completo por presencia y el `head` (`Ha detto`, `Sapevo`) por ambito. La razon va escrita junto a la constante.

3. **El escaneo de blacklist sobre `options` combina igualdad exacta Y matcher.** El analogo usa solo igualdad exacta porque sus opciones son de una palabra; aqui hay opciones multi-palabra (`avrei fatto`, `avevano fatto`, `avrei fare`) y la igualdad exacta sola dejaria pasar una forma vetada incrustada. Anadir el matcher es seguro **precisamente** porque el hermano con lookahead ya excluye la key apostrofada: sin esa desviacion, este refuerzo habria puesto roja la variante correcta.

4. **El invariante de las 5 variantes va primero en el bloque 1 y con mensaje propio.** Con el orden natural (tabla `EXPECTED_VARIANTS` primero) una mutacion del conteo fallaba nombrando `D-43-03`, un aviso generico de conteo, en vez de `D-43-08`, que es el hecho de la lengua. Verificado por mutacion en las dos direcciones (6 variantes y 4 variantes): ahora las dos nombran D-43-08.

5. **La ADVERTENCIA DE ESCANEO se declara una sola vez en mayusculas.** El analogo la repite en el bloque 6, lo que la vuelve no-unica como marcador grep. Se conserva la referencia cruzada, en minusculas, para que el criterio de aceptacion del plan (`grep -c` devuelve 1) siga siendo un gate real y no una coincidencia.

**Reparto concreto dentro de la discrecion de 43-CONTEXT.md** (redaccion de las 17 variantes, marcos, objetos y destinatarios): 6 disparadores distintos en el presente (5 protasis con congiuntivo imperfetto + 1 locucion de sustitucion), 6 anclas distintas en el passato (2 de futuro-nel-passato, 2 de accion no realizada, 2 de rumor), y los 5 marcadores italianos del imperativo. Los 6 objetos literales del presente son los 6 distintos del conjunto cerrado.

**Precision sobre D-43-05 aplicada tal como el plan la corrige (§Correcciones 3):** los destinatarios que 43-CONTEXT.md nombra en espanol (`a un amico`, `a un signore`, `ai bambini`, `a dei clienti`) se realizan como vocativos **italianos** (`Marco,`, `Signor Rossi,`, `Bambini,`, `Signori,`) — escribirlos literalmente habria metido espanol en el enunciado. Y son **cinco**, no cuatro: el exhortativo de nosotros no tiene destinatario, asi que su marcador es el sujeto inclusivo `Dai, noi due`.

## Deviations from Plan

**None — plan executed exactly as written.** Cero deviation rules disparadas: ningun bug, ninguna funcionalidad critica ausente, ningun bloqueo, ninguna decision arquitectonica. Las cinco decisiones de la seccion anterior son ejercicio de la discrecion que el plan y 43-CONTEXT.md delegan explicitamente, y la nº 1 es ademas el resultado exigido por una comprobacion obligatoria que el propio plan ordena hacer.

Un solo ajuste editorial menor, dentro de la Task 4 y antes de su commit: la referencia cruzada a la advertencia de escaneo del bloque 6 se paso a minusculas para que el criterio de aceptacion `grep -c "ADVERTENCIA DE ESCANEO" == 1` fuese exacto (el analogo da 2). No cambia ningun gate.

## Issues Encountered

- **`gobiernaElHueco` frente a un ancla con `che`.** Al disenar el gate de D-43-11 se detecto que el helper heredado nunca podria ver el literal completo, porque el split consume el subordinante. Resuelto con el par `{lit, head}` (decision 2) y verificado por mutacion: mover el marco fuera de la clausula del hueco pone el gate en rojo.
- **`grep -c "ADVERTENCIA DE ESCANEO"` daba 2.** El molde de Phase 42 repite el marcador. Resuelto en minusculas (ver arriba).
- **Nada mas.** El baseline se re-midio antes de tocar nada (842 pass / 0 fail, precondicion de la Task 1 cumplida) y la suite nunca estuvo en rojo entre commits.

## Pruebas negativas ejecutadas (Task 4)

Las 12 mutaciones del JSON real, con restauracion byte a byte verificada (`git diff` vacio al terminar):

| Mutacion | Resultado | Decision nombrada |
|---|---|---|
| imperativo con 6 variantes | fail 7 | D-43-08 |
| imperativo con 4 variantes | fail 5 | D-43-08 |
| la forma corta vetada en `options` de la variante de tu | fail 3 | D-43-04 |
| el imperativo vivo en -i en `options` de la variante de tu | fail 3 | D-43-04 |
| la key apostrofada ofrecida como distractora en otra variante | fail 3 | SC-2 |
| `status: validated` con `passes: []` | fail 3 | T-43-03 |
| `validated` con 2 `correcta` del mismo `by` | fail 3 | T-43-03 |
| imperativo `validated` con quorum real pero sin pase deepseek | fail 1 | D-43-20 |
| un `se` suelto en un prompt del condizionale passato | fail 3 | D-43-10 |
| `domani` en un prompt del condizionale presente | fail 1 | D-43-09 |
| la variante de Loro sin el pronombre de cortesia | fail 1 | D-43-05 |
| el marco de futuro-nel-passato fuera de la clausula del hueco | fail 1 | D-43-11 |

**Prueba positiva del matcher:** con el fichero real intacto el gate de blacklist **no** marca la variante cuya key es `fa'` (fail 0), y tres asserts dedicados congelan que la trampa existe con el matcher heredado, que el hermano no cae en ella, y que el hermano **sigue** mordiendo la forma corta suelta — es decir, que esta resuelta y no desactivada.

## Threat Flags

Ninguna. El escaneo de superficie no encontro endpoints, rutas de auth, accesos a fichero ni cambios de esquema en frontera de confianza que no estuvieran ya en el `<threat_model>` del plan. Las dos amenazas `high` quedan mitigadas y verificadas: **T-43-05** (slug byte a byte) por el `describe` 13 y por el gate del slug COMPLETO en los 3 ids, y **T-43-06** (doble validez / cascada D-54) por los 4 gates HARD, el checkpoint del tracer y la ronda EXTRA ya escrita en `EXTRA_ROUND_SLOTS`.

## Known Stubs

Ninguno. Las 17 variantes estan escritas, ninguna opcion es placeholder, ninguna explanation esta vacia y no hay ningun `TODO` ni valor hardcodeado que llegue a la UI.

El `validation.status: "pending"` de los 3 slots **no es un stub**: es el estado de hand-off que D-43-02 exige y que el plan declara como entregable visible. El executor no puede correr el quorum base canonico porque no puede spawnear los Task subagents del skill `gsd-validate-exercise`; fabricar `passes[]` habria destruido la unica evidencia de revision que el autor tiene (prohibicion explicita del plan, T-43-03).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

**Listo para el plan 43-02** (`fare-indefiniti`, 6 slots / 18 variantes, `order: 18`). Sin bloqueos. Lo que 43-02 hereda de aqui:

- `content/categories.json` tiene 17 entradas con `order` contiguos; 43-02 apendiza la 18a sobre la linea 19, que ya lleva coma pendiente de anadir.
- `tests/exercise-types.test.js` tiene la linea de `fare-cond-imperativo` puesta; la de `fare-indefiniti` sigue sin escribir (`grep -c 'fare-indefiniti'` devuelve 0), que es lo esperado.
- `09-VALIDATION-PROMPT.md` **no se ha tocado**: la edicion es de 43-02 Task 5 y tiene que ocurrir exactamente una vez.
- El matcher con lookahead y el par `{lit, head}` son reusables si 43-02 los necesita (`aver fatto` no lleva apostrofe, asi que probablemente no).

**Pendiente y explicito — el pase TOP-LEVEL de quorum**, que no corre dentro del executor:

1. Los 3 slots pasan de `pending` a `validated`, con `status === deriveStatus(passes)`.
2. La edicion de `09-VALIDATION-PROMPT.md` (43-02 Task 5) tiene que estar hecha **antes**: el subagent no ve el `notes` y sin la excepcion escrita marcara `fa'` como magnet sin resolver.
3. **Ronda EXTRA obligatoria** (D-43-20): pase DeepSeek sobre las 5 variantes del slot de imperativo, ademas del quorum base. El gate condicionado ya esta escrito y en verde; se pondra rojo si el slot llega a `validated` sin un `by` que empiece por `deepseek`.
4. `by` = el modelo realmente resuelto, no el ID pinneado de la skill.
5. Un flag C4-accent sobre espanol sin tildes es bug **REAL**: se arreglan los acentos, nunca override.

**Para Phase 44 / INT-02, numeros cerrados:** con esta categoria el milestone va por 20 slots / 95 variantes; con `fare-indefiniti` quedara en **22 slots / 113 variantes** y `TOTAL_EXPECTED` en **247**. El rojo de `VAL_07_STRICT=1` y la ceguera del reporter (`PASS (225/225)`) son el estado **esperado** al cerrar esta fase, no fallos que perseguir. **Para INT-04:** sigue vivo el hallazgo de 43-CONTEXT.md de que los magnets son **cuatro** y no tres — el cuarto (`aver fatto` frente a `avere fatto`) es de 43-02.

## Self-Check: PASSED

Los 5 ficheros declarados existen en disco y los 3 hashes de commit existen en el historial:

- `content/exercises/fare-cond-imperativo.json`, `tests/content-fare-cond-imperativo.test.js`, `content/categories.json`, `tests/exercise-types.test.js`, `.planning/phases/43-fare-cond-imperativo-fare-indefiniti-3-6-slots/43-01-SUMMARY.md` — FOUND
- `5dbce8d`, `e0278ba`, `6c00cb5` — FOUND

---
*Phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots*
*Completed: 2026-08-07*
