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
  tokens: 32900
  tasks: 4
  commits: 8

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
    description: "Condizionale passato en las 6 personas, con el condizionale presente como distractora del calco espanol, >=2 marcos de futuro-nel-passato que gobiernan la clausula del hueco, cero protasis condicional, y el exclusor de la lectura anterior en las 6 (CR-01)"
    requirement: CI-02
    verification:
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#fare-cond-imperativo — distractoras del condizionale passato, el calco espanol (D-43-10, SC-1)"
        status: pass
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#GATE HARD (CR-01): toda variante con trapassato en options lleva su EXCLUSOR de la lectura anterior"
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
      - kind: unit
        ref: "tests/content-fare-cond-imperativo.test.js#las 5 del imperativo llevan su REFUERZO DE REGISTRO declarado, tambien las singulares (WR-10)"
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
5. **CR-01 del code review: doble validez del trapassato en el condizionale passato** — `32b2eab` (fix)
6. **WR-10 del UAT: refuerzo de registro en la variante de `Marco`** — `660fa9d` (fix)
7. **Los 3 hallazgos del quórum base top-level** — `877f3fc` (fix)
8. **2ª ronda de quórum: el inclusivo a la blacklist por contexto** — `6de4066` (fix)

**Plan metadata:** `f0e81b0` (docs: complete plan).

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

## Correccion post-review: CR-01 (`32b2eab`)

El code review de la fase (`43-REVIEW.md`, `ea10408`) encontro **1 critico real** en el slot de condizionale passato, verificado forma por forma antes de arreglarlo.

**El defecto.** El gate HARD que escribi para D-43-10 (cero `se` suelto) neutraliza la distractora de condizionale **presente** — la que el gate miraba — y **ninguna otra**. Con el trapassato prossimo de la misma persona en las 6 variantes, solo estaban blindadas las **2** que llevan cola adversativa de no realizacion, porque la cola contradice que la accion ocurriera. En las otras 4 la lectura anterior era defendible, y en dos era la lectura **por defecto**: `Sapevo che tu avevi fatto i compiti da solo` es italiano perfecto y significa otra cosa. Dos respuestas defendibles es `disputed` sticky, y por la cascada D-54 eso habria reseteado las 17 variantes — el dano exacto que la fase existe para evitar.

**La leccion transferible**, que es lo que hay que retener y no el arreglo puntual: **un gate de doble validez cubre la familia de distractoras que mira, y ninguna otra.** Cada familia necesita su propio exclusor declarado. Afirmar que un slot esta controlado porque una de sus familias lo esta es una promesa que un `notes` no puede hacer — y es exactamente lo que el mio hacia.

**Via elegida: la 1 (blindar el marco) en las 4 variantes**, no la 2 (sacar la distractora). La familia del auxiliar en otro tiempo es la que examina el error de marco; sacarla habria dejado el slot sin ese eje. Las 4 redacciones:

| # | persona | antes | ahora | exclusor |
|---|---------|-------|-------|----------|
| 1 | tu | `Sapevo che tu ___ i compiti da solo.` | `Sapevo che tu ___ i compiti il giorno dopo.` | adverbial prospectivo |
| 2 | lui | `Ha detto che lui ___ tutto entro venerdì.` | `Ha detto che lui ___ tutto la settimana successiva.` | adverbial prospectivo |
| 3 | noi | `A quanto pare noi ___ un errore nel conteggio.` | `Era sicuro che noi ___ un errore più tardi.` | marco (a) + adverbial prospectivo |
| 5 | loro | `Secondo il giornale loro ___ una foto proibita.` | `Mi ha promesso che loro ___ una foto al gruppo il giorno seguente.` | marco (a) + adverbial prospectivo |

Las variantes 0 y 4 no se tocaron: su cola adversativa ya era exclusor valido.

**El marco de diceria se RETIRA del conjunto cerrado de anclas.** Es la unica de las tres familias que no puede excluir la lectura anterior por ningun medio, porque el rumor lee igual de bien en condizionale passato y en trapassato. Dejarlo con una nota de cuidado habria sido una invitacion a reintroducir el fallo. Quedan dos grupos (futuro-nel-passato y no realizacion) y un gate congela que no vuelva un tercero.

**SC#1 no se sacrifico:** ahora son **4 de 6** con marco de futuro-nel-passato (antes 2, minimo exigido 2), y la distractora estrella del calco espanol sigue intacta en las 6.

**Sobre D-43-20 — declarado, no decidido por mi cuenta.** La frase del `notes` que justificaba dejar este slot fuera de la ronda extra ("su riesgo es de redaccion de marco, no de doble validez de forma") queda **falsada**: la redaccion del marco era justo lo que fallaba. Reescrita entera con audit trail. Pero el **presupuesto de quorum no se cambia aqui**: extender la ronda extra a este slot llevaria la fase a 18 de 35 variantes, que es exactamente la proporcion que D-42-08 y D-43-20 **rechazaron de forma explicita y razonada**, y una correccion de autoria no basta para revertir una decision cerrada con argumento. Queda escrito el disparador para el pase top-level: **si el quorum base marca cualquiera de las 6 variantes de este slot, el slot entra en la ronda extra y la decision se revisa con el dato delante.**

### Warnings del review resueltos en el mismo pase

- **WR-04** — `PERIPHRASIS` llevaba el literal `causativo`, una palabra **espanola de metalenguaje** que no puede aparecer dentro de una frase italiana: cobertura real **cero**, y un comentario que prometia un gate inexistente. Se retira, y se detecta el **patron real**: en esta categoria la forma de `fare` **es** el hueco, asi que un causativo solo puede materializarse como hueco seguido de infinitivo (`___ riparare il lavoro`). `far fare` se queda en la lista porque es el causativo lexicalizado, que si aparece como cadena.
- **WR-03** — `DEITTICI_FUTURO` era una lista de literales que dejaba fuera familias abiertas enteras (`entro X`, `tra/fra X`, `più tardi`, adjetivo pospuesto). Se anaden como **patrones**, porque enumerar complementos no termina nunca. La prueba de que importaba estaba en mi propio contenido: la redaccion original del slot 2 usaba `entro venerdì`. Queda escrita la simetria: en el slot 1 el adverbial prospectivo esta **prohibido** (haria defendible el futuro) y en el slot 2 es **obligatorio** (es lo unico que excluye la lectura anterior) — mismo fenomeno, signo opuesto.
- **WR-05 — NO corregido, y a proposito.** `CONCORD_CUES` con `includes()` crudo sobre bigramas de dos letras vive en `tests/content-fare-indefiniti.test.js`, que es **propiedad exclusiva del plan 43-02**; las prohibiciones de este plan lo declaran intocable. El hallazgo es real (`'le ha'` hace match dentro de `Michele ha`) y **queda transferido a 43-02**: el arreglo es usar el matcher con frontera de palabra que ese fichero ya tiene.

### Pruebas negativas del arreglo

10 mutaciones nuevas, **incluidas las dos regresiones literales** de los prompts que shipparon defectuosos, mas las 12 anteriores re-ejecutadas. Las 22 muerden y el JSON queda restaurado byte a byte.

| Mutacion | Resultado | Decision nombrada |
|---|---|---|
| **regresion**: el prompt exacto que shippeo defectuoso (`da solo`) | fail 1 | CR-01 |
| **regresion**: el segundo prompt defectuoso (`entro venerdì`) | fail 1 | CR-01 |
| quitar la cola adversativa de la variante que se apoyaba en ella | fail 3 | CR-01 |
| reintroducir el marco de diceria retirado | fail 3 | CR-01 |
| el adverbial prospectivo fuera de la clausula del hueco | fail 1 | CR-01 |
| causativo `fare + infinito` tras el hueco | fail 1 | WR-04 |
| `entro X` en un prompt del presente | fail 1 | D-43-09 |
| `tra X` en un prompt del presente | fail 1 | D-43-09 |
| `la settimana prossima` en un prompt del presente | fail 1 | D-43-09 |
| `più tardi` en un prompt del presente | fail 1 | D-43-09 |

Suite tras el arreglo: **998 pass / 0 fail**. `src/` byte-intacto.

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

## Correccion post-UAT: WR-10 (`660fa9d`)

El autor adjudicó WR-10 en el UAT de la fase: las dos variantes **plurales** del imperativo recibieron refuerzo explícito de registro (`noi due`, `Loro`) y las dos **singulares** no. Decisión: reforzar solo la de `Marco`, dejar `Signor Rossi` como está.

**Por qué solo una.** Las dos singulares no corren el mismo riesgo:

- **`Signor Rossi, ___ il lavoro con calma.` — no se toca.** El título de cortesía más apellido selecciona `Lei` de forma inequívoca en italiano estándar moderno. El `voi` de cortesía hacia un solo destinatario es meridional o arcaico, y esta categoría ya lo trata bajo RECONOCER, NO PRODUCIR; `facciano` hacia una sola persona no es lectura. **El título es el refuerzo.**
- **`Marco, ___ una foto al gruppo!` — sí se refuerza.** Un vocativo de nombre propio no fija nada por sí solo: en un entorno profesional italiano es corriente tratarse por el nombre de pila y seguir usando el usted, así que `Marco, faccia pure una foto` es italiano real y la variante admitía `faccia` como segunda lectura defendible. Es el modo de fallo de CR-01 en menor grado.

**Vía elegida: posesivo de 2ª singular.**

`Marco, ___ una foto al gruppo!` → **`Marco, ___ una foto con il tuo telefono!`**

Fija el registro por **concordancia** y no por glosa: en el trato de cortesía sería el posesivo de 3ª con mayúscula, así que `il tuo` excluye esa lectura **sin nombrar en ningún momento la persona gramatical ni la desinencia** — R1 intacto. Es el mecanismo del pronombre sujeto explícito de D-41-07 aplicado al posesivo.

Descartadas: el marcador de confianza `Dai` (ya encabeza el marcador de la variante de `noi`, y reusarlo enturbiaría el conjunto cerrado) y `per favore` (neutro entre los dos registros, no cierra nada). El objeto `una foto` se mantiene — el SCOPE-GATE no se relaja.

**Gate nuevo.** El review señaló la brecha exacta: el gate de `MARCADORES` comprobaba **presencia** de un vocativo del conjunto cerrado, no que ese vocativo **desambiguara**. `RINFORZO_DI_REGISTRO` declara por variante el literal que cierra el registro **y la vía por la que lo cierra**, y el bloque 3 exige que esté en el prompt. La tabla lleva la vía y no solo el literal precisamente para que la asimetría adjudicada sea legible y no se iguale por inercia.

**Notes actualizado:** el párrafo del gate de vocativo pasa de «DOS PRECISIONES» a «TRES», y la tercera declara la **asimetría deliberada** entre las dos singulares con su razonamiento entero. Sin esa línea escrita, un re-pase futuro «arreglaría» la asimetría y perdería la adjudicación del autor.

**5 mutaciones nuevas**, incluida la **regresión literal** del prompt que shippeó sin refuerzo y el caso invertido (posesivo de cortesía en la variante de tú, que es el registro al revés). Las 22 anteriores siguen mordiendo; el JSON queda restaurado byte a byte en las 27. Suite: **999 pass / 0 fail**.

## Correccion post-quorum: los 3 slots salieron `disputed` (`877f3fc`)

El quórum base top-level (Opus + Sonnet, 1 ejercicio por contexto fresco) marcó los **3 slots** como `disputed`. Los tres hallazgos son reales. Tras arreglar el contenido, los `validation.passes[]` quedaron **vaciados** (`status: "pending"`, `passes: []`): juzgaban contenido que ya no existe, y dejarlos habría sido un audit trail mentiroso.

### 1. El exhortativo INCLUSIVO — imperativo v1 y v3 (unánime: Opus y Sonnet por separado)

El hallazgo más profundo, y **reencuadra WR-10 entero**.

El vocativo y el refuerzo de registro cierran **quién** es el destinatario y con qué trato. Eso **no** cierra `facciamo`, porque el exhortativo es **inclusivo**: mete al hablante *dentro* del grupo del destinatario en vez de contraponerlo a él. Por construcción, **ningún vocativo puede excluirlo**, por inequívoco que sea. Hay **dos ejes de ambigüedad** en el slot —el del **trato** y el de la **inclusión**— y hasta esta corrección solo estaba cerrado el primero:

- `Signor Rossi, facciamo il lavoro con calma` — invitación normal.
- `Bambini, facciamo i compiti prima di cena!` — la fórmula parental de toda la vida.

| # | antes | ahora |
|---|-------|-------|
| 1 | `Signor Rossi, ___ il lavoro con calma.` | `Signor Rossi, ___ il lavoro con calma: io intanto aspetto qui.` |
| 3 | `Bambini, ___ i compiti prima di cena!` | `Bambini, ___ i compiti prima di cena: io intanto preparo la tavola.` |

**Mecanismo: excluir al hablante de la acción**, que es lo único que mata al inclusivo. La cláusula usa otro verbo y un complemento ajeno a `OBJECTS`, para no meter un segundo objeto en la casilla ni un segundo uso del verbo examinado.

**Lo incómodo:** la variante que reforcé en WR-10 (`Marco`) resultó ser **la única que no corría peligro por esta vía**, porque no ofrece `facciamo` entre sus opciones. El refuerzo de WR-10 sigue siendo correcto y necesario para su propio eje (el trato), pero el diagnóstico que lo motivó estaba incompleto — y yo lo acepté sin buscar el segundo eje.

### 2. La cola era un IMPEDIMENTO, no un cierre de evento — cond-passato v0 (Opus)

`ma non ho avuto tempo` es pretérito perfecto con lectura de **presente perfecto** («no he tenido tiempo», el trabajo sigue pendiente), y bajo esa lectura `Io farei il lavoro volentieri, ma non ho avuto tempo` es italiano corriente: el calco de condizionale **presente** seguía defendible.

`Io ___ il lavoro volentieri, ma non ho avuto tempo.` → **`Aveva giurato che io ___ il lavoro la settimana dopo.`**

Las colas de **impedimento** salen del conjunto cerrado; queda solo la que **cierra el evento** (`ma alla fine non è successo`, la de v4). Un hecho que ya no puede ocurrir no admite hipotetizarlo en presente; un impedimento abierto sí.

**Es la segunda corrección de esta misma familia, y por el mismo error.** CR-01 revisó el aux-swap sobre estas dos variantes y las dio por buenas «porque ya tenían cola adversativa», **sin revisar la otra familia sobre ellas** — que es exactamente la lección que CR-01 declaraba. Queda escrito en `notes` como nota de honestidad: *un gate cubre la familia que mira y ninguna otra, y eso vale también para el gate que uno acaba de escribir.*

### 3. `Al posto tuo` es doblemente válido — cond-presente v0 (Sonnet)

Además del sentido hipotético de consejo (que exige condizionale), tiene el de **sustitución literal** —ocupar el puesto de otro, `vado io al posto tuo`— y en esa lectura el futuro entra sin anomalía. Era la única de las 6 sin prótasis explícita: las otras cinco excluyen el futuro **gramaticalmente**.

`Al posto tuo, io ___ tutto in un altro modo.` → **`Se fossi in te, io ___ tutto in un altro modo.`**

Las locuciones salen del conjunto cerrado. **Los 6 disparadores son ahora prótasis con congiuntivo imperfetto**, y la uniformidad queda declarada en `notes` como decisión y no como falta de imaginación: lo que tiene que variar entre las 6 es la **persona**, que es el eje del slot. La lección es la de CR-01 por otra puerta: **un marco que excluye la distractora por idiomatismo no es un gate, porque el idiomatismo admite excepciones y la gramática no.**

### Gates nuevos

Los tres con mensaje que nombra el hallazgo:

- toda variante del imperativo que **ofrezca** el exhortativo sin serlo lleva su exclusor del hablante — la tabla declara `null` **con su razón** donde no aplica, para que la exención sea visible en vez de estar escondida en la ausencia de un assert;
- toda variante del passato cierra la lectura de condizionale presente, por principal en pasado que gobierne el hueco o por evento cerrado;
- los 6 disparadores del presente son prótasis del conjunto cerrado.

**10 mutaciones nuevas**, incluidas las **4 regresiones literales** de los prompts que salieron `disputed`. Las 27 anteriores siguen mordiendo — **37 en total**, JSON restaurado byte a byte en todas. Suite: **1004 pass / 0 fail**.

### Punto a vigilar — CONFIRMADO por el quorum, y ya resuelto

En esta ronda dejé escrito que no me convencía la variante de `Loro`, la única exenta del gate del inclusivo que se apoyaba en un mecanismo distinto (`come preferiscono Loro`) en vez de en la ausencia del problema. **La 2ª ronda de quórum la marcó, y las dos IAs a la vez** — fue la única en la que Opus y Sonnet coincidieron sin discusión. Queda resuelta por el cambio de pool: `facciamo` ya no está entre sus opciones. Registrado aquí porque la duda estaba escrita antes del veredicto y sirve de calibración: cuando un cierre descansa en un mecanismo distinto al del resto, conviene mirarlo dos veces.

## Correccion post-quorum, 2a ronda (`6de4066`)

`cond-passato` pasó a **`validated`** (Opus y Sonnet, ambos `correcta`, los dos verificando explícitamente que la cola cierra el evento) y no se tocó. Los otros dos siguieron `disputed`.

### 1. El mecanismo del inclusivo era inefectivo POR NATURALEZA

Opus marcó v1/v3/v4, Sonnet v4. Su diagnóstico es decisivo y me lo apunto:

> el «noi» exhortativo-paternal **se define precisamente por un hablante que NO ejecuta la acción**, de modo que declarar que el hablante hace otra cosa es **compatible** con esa lectura.

`Bambini, facciamo i compiti: io intanto preparo la tavola` se lee sin fricción como reparto de tareas. Es el mecanismo del español: «vamos a hacer los deberes» lo dice justo quien no piensa hacerlos. Mi cláusula **solo parecía cerrar**, que es peor que no cerrar — un re-pase futuro la habría leído como un gate.

**Resolución: `facciamo` a la blacklist POR CONTEXTO.** Fuera de `options` donde no es la key, legítima como key en la suya. Es el criterio operativo de la categoría al pie de la letra, y es la **primera forma del milestone vetada por ser inclusiva** y no por arcaica, dialectal o atestiguada en otro registro. El criterio general que queda escrito: *una forma que engloba al destinatario no puede excluirse con un marcador que apunta al destinatario, porque el marcador cae dentro de ella.*

Retiré los dos `io intanto`: ya no cierran nada, así que eran peso muerto en el prompt. Los prompts volvieron a su forma corta.

### 2. Los pools del imperativo, y una desviacion que hay que firmar

**La aritmética que me diste no cierra.** Contabas `fa'` entre las formas disponibles para rellenar, pero SC-2 la veta como distractora. Con `fa'` **y** `facciamo` vetadas, para las tres variantes cuya key es una de las tres restantes solo quedan **dos** distractoras reales:

| # | destinatario | key | opciones | n |
|---|---|---|---|---|
| 0 | tú informal | `fa'` | faccia, **fa'**, fate, facciano | 4 |
| 1 | Lei formal | `faccia` | fate, **faccia**, facciano | **3** |
| 2 | noi exhortativo | `facciamo` | **facciamo**, faccia, fate, facciano | 4 |
| 3 | voi informal | `fate` | facciano, faccia, **fate** | **3** |
| 4 | Loro formal | `facciano` | fate, **facciano**, faccia | **3** |

Los prompts: v1 `Signor Rossi, ___ il lavoro con calma.` · v3 `Bambini, ___ i compiti prima di cena!` · v0, v2 y v4 sin cambios.

**Esto desvía del must_have «options de longitud 4»** en 3 de las 17 variantes. Lo elegí frente a rellenar con una cuarta **inventada** porque el eje de este slot es el **registro**, no la morfología: una forma falsa convierte una de cada cuatro casillas en un ejercicio de otra cosa. Y las candidatas que examiné eran todas malas — `facete` es adjetivo real (femenino plural de `faceto`), `faccino` es sustantivo coloquial (diminutivo de `faccia`) y `facite` es dialectal napolitano. Tres opciones **reales** que contrastan destinatario examinan mejor lo que hay que examinar que cuatro con una falsa. `schema-validator.js` admite 3 o 4, así que el motor no se toca. **Necesita tu firma**: es desviación de un must_have escrito, forzada por un hallazgo posterior al plan.

### 3. La regla falsa de la explanation (Sonnet C4)

La frase afirmaba que con una locución de sustitución el italiano pide condizionale «y **nunca** el futuro». Quedó **huérfana** al retirar esa locución, y era peor que irrelevante: **reafirmaba como absoluto justo la generalización que causó el bug**. Reescrita anclando la regla en la **prótasis** —lo que las 6 variantes ejemplifican de verdad— y **con su condición** en vez de como absoluto.

### Gates nuevos

- el inclusivo solo aparece en `options` donde es la key, **más el positivo** de que sigue siendo la key de la suya (lo que distingue un veto por contexto de una forma prohibida);
- el pool de cada variante está **determinado** por el paradigma menos las dos vetadas, con `EXPECTED_OPTIONS` declarando 4/3/4/3/3;
- **ninguna explanation enseña una regla absoluta** sobre una forma italiana (`nunca el futuro`, `sustitución`, `es agramatical`, `nunca se usa`) — la regla de la fase, aprendida a base de corregirla tres veces, congelada como gate.

7 mutaciones nuevas, incluidas las **3 regresiones** de los pools que salieron `disputed` y una que prueba que rellenar con una inventada se pone rojo. Podé 4 mutaciones obsoletas que probaban el mecanismo retirado, con nota en el fichero. Suite: **1011 pass / 0 fail**.

**Transferido al plan 43-02:** WR-05 del code review (`CONCORD_CUES` con `includes()` crudo sobre bigramas de dos letras en `tests/content-fare-indefiniti.test.js`, que hace match dentro de `Michele ha`). Es un hallazgo real y barato, pero ese fichero es propiedad exclusiva de 43-02 y este plan lo tiene prohibido tocar. El arreglo es usar el matcher con frontera de palabra que el propio fichero ya declara en su cabecera.

## Self-Check: PASSED

Los 5 ficheros declarados existen en disco y los 3 hashes de commit existen en el historial:

- `content/exercises/fare-cond-imperativo.json`, `tests/content-fare-cond-imperativo.test.js`, `content/categories.json`, `tests/exercise-types.test.js`, `.planning/phases/43-fare-cond-imperativo-fare-indefiniti-3-6-slots/43-01-SUMMARY.md` — FOUND
- `5dbce8d`, `e0278ba`, `6c00cb5` — FOUND

---
*Phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots*
*Completed: 2026-08-07*
