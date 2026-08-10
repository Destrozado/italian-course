---
status: testing
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
source: [43-VERIFICATION.md]
started: 2026-08-07T00:00:00Z
updated: 2026-08-07T00:00:00Z
---

## Current Test

number: 1
name: Pase TOP-LEVEL de quórum base Opus+Sonnet sobre los 9 slots
expected: |
  Los 9 slots pasan a `validated` (>=2 passes `correcta`, `by` distintos, cero
  `incorrecta`; `status === deriveStatus(passes)`). Hoy los 9 están en
  `validation.status: "pending"` con `passes: []`.
awaiting: sesión nueva — decisión del autor 2026-08-07

<!--
ESTADO DE LA SESIÓN (para retomar sin releer nada más)

Tests 5 y 6 ADJUDICADOS por el autor y ya aplicados en disco (ver `decision:`
de cada uno). El CONTENIDO DE LA FASE ESTÁ CERRADO: ninguna variante, key,
option ni id cambia a partir de aquí. Suite en 1001 pass / 0 fail, `src/`
byte-intacto, árbol de git limpio.

Quedan los tests 1-4, y los cuatro se cierran con el MISMO pase de quórum:

  - Test 1 — quórum base Opus+Sonnet sobre los 9 slots (VAL-03: un subagent
    fresh context por ejercicio, NUNCA batched → 9 x 2 = 18 spawns).
  - Test 2 — ronda EXTRA DeepSeek sobre 12 de 35 variantes (D-43-20):
    `fare-cond-imperativo-imperativo` (5), `fare-indefiniti-participio-passato`
    (4), `fare-indefiniti-infinito-passato` (3). Vía
    `scripts/validate-ai-pass.mjs`, claves en `.env`.
  - Tests 3 y 4 — los dos backstops declarados. NO se resuelven a ojo: son la
    pregunta «¿hay una segunda lectura defendible?», que es literalmente lo que
    decide C2. El veredicto del quórum del test 1 los cierra.

POR QUÉ SE PUEDE CORRER AHORA Y NO SE PUDO EN EJECUCIÓN: el límite
`[[executor_cannot_run_task_quorum]]` es específico de `gsd-executor`, que no
puede spawnear los Task subagents del skill. Un orquestador top-level sí puede.
Además el skill apuntaba a una ruta muerta (`.planning/phases/09-...`), corregida
en 43-02 — hoy resuelve el `09-VALIDATION-PROMPT.md` real.

ANTES DE CORRER, comprobar que el prompt de validación lleva las CUATRO
excepciones (secciones 7.1 a 7.4). La 7.4 es la más reciente y la más frágil:
sin ella, Opus y Sonnet marcan las 2 variantes de objeto pospuesto del
participio como violación de C2 y producen un `disputed` FALSO — que por la
cascada D-54 resetea `fare-indefiniti` entera.

AL ESCRIBIR LOS PASES ([[top_level_quorum_mechanics.md]]):
  - un pase `correcta` SÍ admite `concerns[]` declarativas (audit trail);
  - en `by` va el modelo REAL resuelto, no el id pinneado de la skill;
  - los subagents devuelven solo el verdict y el orquestador escribe.

CUANDO LOS 9 ESTÉN `validated`: `VAL_07_STRICT=1 node --test tests/*.test.js`
pasa de 2 fails a 0 — ese es el marcador honesto de que SC#4 y SC#5 se cierran.
Entonces `/gsd-verify-work 43` marca los tests 1-4 y transiciona la fase.
-->


## Tests

### 1. Pase TOP-LEVEL de quórum base Opus+Sonnet (VAL-03, 1 ejercicio por contexto)
expected: Los 9 slots de `fare-cond-imperativo` y `fare-indefiniti` pasan a `validated` (>=2 passes `correcta` con `by` distintos, cero `incorrecta`). NUNCA batched — un subagent fresh context por ejercicio.
result: [pending]

### 2. Ronda EXTRA DeepSeek (D-43-20) sobre 12 de 35 variantes
expected: `fare-cond-imperativo-imperativo` (5), `fare-indefiniti-participio-passato` (4) y `fare-indefiniti-infinito-passato` (3) acaban con al menos un pase cuyo `by` empieza por `deepseek-`, además del quórum base. Vía `scripts/validate-ai-pass.mjs`, claves en `.env`.
result: [pending]

### 3. Backstop 43-01 — unicidad de lectura de las variantes PLURALES del imperativo
expected: El vocativo de cortesía `Loro` y el sujeto inclusivo `noi due` excluyen de forma cerrada la lectura de `voi` (`fate`). Ningún lector razonable admite una segunda respuesta defendible en esas 2 variantes.
result: [pending]

### 4. Backstop 43-02 — unicidad de lectura de la variante causal del gerundio passato
expected: En `fare-indefiniti-gerundio-passato` #1 (`aver fatto`), única variante donde el gerundio simple queda fuera de `options` y solo el adverbial de anterioridad lo excluye, ningún lector razonable admite el gerundio simple como alternativa válida.
result: [pending]

### 5. WR-01 (code review, ABIERTO) — concordancia con objeto POSPUESTO como distractora
expected: |
  Decidir si la forma concordada ofrecida como distractora incorrecta en las 2
  variantes invariables de `fare-indefiniti-participio-passato` es hoy
  "defendible como correcta" según el criterio operativo de la categoría.

  - #0 `Ieri io ho ___ i compiti con Anna.` — key `fatto`, distractora `fatti`
  - #1 `Maria ha ___ una torta per la festa.` — key `fatto`, distractora `fatta`

  La concordancia con objeto POSPUESTO es italiano literario/antiguo atestiguado,
  no agramatical. No lleva audit trail en `notes`, en la explanation ni en el
  prompt de validación — a diferencia del tratamiento completo que sí recibió
  `avere fatto` (magnet 4).

  Es la MISMA CLASE que CR-01 (que sí se corrigió), pero menos severa: en CR-01
  el trapassato era la lectura por DEFECTO en italiano moderno; aquí la
  concordancia pospuesta está claramente marcada como arcaica/literaria.

  Salidas posibles: (a) aceptar el riesgo y declararlo en `notes` con audit
  trail; (b) mandar las formas concordadas a la blacklist en esas 2 variantes y
  sustituirlas; (c) dejar que lo adjudique el quórum del test 1.
result: pass
adjudicated_by: autor
adjudicated_at: 2026-08-07
decision: |
  Salida (a) — DECLARARLO. El autor mantiene el pool tal cual y exige el audit
  trail en LOS DOS sitios: `notes` de `fare-indefiniti.json` Y la seccion 7 de
  `09-VALIDATION-PROMPT.md`.

  Constatacion que el enunciado original del test no recogia: la salida (b) es
  ESTRUCTURALMENTE IMPOSIBLE aqui. D-43-16 fija el pool de las 4 variantes en
  `fatto`/`fatta`/`fatti`/`fatte` como eje unico del slot; mandar las formas
  concordadas a la blacklist en las 2 variantes invariables dejaria el slot sin
  nada que ofrecer. La resolucion correcta era documental desde el principio.

  Verificado ademas que el hallazgo del review era exacto: `notes` menciona
  "objeto pospuesto" SOLO como tipo de contexto del conjunto cerrado de D-43-12
  (donde cae el hueco), y "arcaicas y literarias" se refiere a la blacklist de
  conjugadas de D-41-08 (`fo`, `fe`, `fenno`...). Ninguna de las dos dice que la
  forma concordada ofrecida como distractora sea ella misma atestiguada en
  registro literario. No habia audit trail.

  La edicion del prompt de validacion NO es opcional: el subagent del quorum
  nunca ve `notes` ([[exception_belongs_in_validation_prompt]]), asi que sin ella
  Opus y Sonnet marcarian estas 2 variantes como violacion de C2 y produzirian un
  `disputed` FALSO — que por la cascada D-54 resetea la categoria entera.

### 6. WR-10 (code review, ABIERTO) — refuerzo de registro en los vocativos SINGULARES
expected: |
  Decidir si el vocativo por sí solo basta para excluir la lectura alternativa
  de registro en las 2 variantes singulares del imperativo, o si necesitan el
  mismo refuerzo que ya se dio a las 2 plurales.

  - `Marco, ___ una foto al gruppo!` — key `fa'`, alternativa de registro `faccia`
  - `Signor Rossi, ___ il lavoro con calma.` — key `faccia`, alternativa `fate`

  Dudas concretas: uso profesional del `Lei` con nombre de pila; `voi` di
  cortesia regional/histórico hacia un solo destinatario. El gate existente solo
  verifica PRESENCIA de un marcador del conjunto cerrado, no que ese marcador
  DESAMBIGÜE el registro.
result: pass
adjudicated_by: autor
adjudicated_at: 2026-08-07
decision: |
  REFORZAR SOLO `Marco`. Asimetria deliberada, no olvido.

  - `Signor Rossi, ___ il lavoro con calma.` (key `faccia`) NO se toca: el titulo
    de cortesia selecciona `Lei` de forma inequivoca en italiano estandar
    moderno. `fate` (voi di cortesia a un solo destinatario) es meridional o
    arcaico y ya lo cubre el principio "reconocer, no producir" (D-43-19);
    `facciano` hacia una sola persona no es lectura.
  - `Marco, ___ una foto al gruppo!` (key `fa'`) SI se refuerza: `Marco, faccia
    pure` es italiano real en un entorno profesional donde uno se trata por
    nombre de pila pero con `Lei`. Ese registro existe, asi que la variante
    admitia `faccia` como segunda lectura defendible — mismo modo de fallo que
    CR-01, en menor grado.

  El `notes` debe dejar escrito POR QUE la asimetria es deliberada, o un re-pase
  futuro la "arreglara" por inercia. Y el gate nuevo tiene que comprobar que el
  marcador DESAMBIGUA el registro, no solo que este PRESENTE — esa era la brecha
  exacta que el review senalo.

## Summary

total: 6
passed: 2
issues: 0
pending: 4
skipped: 0
blocked: 0

## Desviaciones aceptadas

- deviation_id: DEV-43-01
  must_have: "Los 3 slots tienen `type: \"multiple-choice\"` con `options` de longitud 4 y sin duplicados dentro de una misma variante (43-01-PLAN.md, D-43-22)"
  slot: fare-cond-imperativo-imperativo
  alcance: 3 de las 17 variantes de fare-cond-imperativo (las de key `faccia`, `fate` y `facciano`)
  desviacion: "esas 3 variantes tienen 3 `options` en lugar de 4"
  aceptada_por: autor
  aceptada_el: 2026-08-09
  motivo: |
    El paradigma del imperativo de `fare` tiene 5 formas. Dos quedan vetadas como
    distractora: la apostrofada de 2a singular por SC#2 del ROADMAP («ninguna de
    `fa'`/`fai`/`fa` aparece como distractora incorrecta»), y la de 1a plural porque
    es un exhortativo INCLUSIVO que engloba al destinatario, de modo que ningun
    vocativo puede excluirla y seria defendible en cualquier hueco (hallazgo
    unanime del quorum, rondas 2 y 3).

    Con las dos fuera, a las 3 variantes cuya key es una de las 3 restantes solo
    les quedan DOS distractoras reales. La alternativa era rellenar con una cuarta
    forma inventada, y las candidatas obvias son palabras italianas reales:
    `facete` es adjetivo (femenino de `faceto`), `faccino` sustantivo coloquial,
    `facite` napolitano. Ofrecer una palabra real como respuesta «incorrecta» es
    la clase de defecto que esta fase corrigio cuatro veces.

    Rellenar con una forma de otro modo (p. ej. un futuro) seria seguro pero
    regalaria la opcion: no discrimina, solo infla el conteo. Con 3 opciones las
    dos distractoras que quedan fallan una por numero y otra por cortesia, asi que
    acertar sigue exigiendo fijar los dos ejes.
  coste_asumido: "la probabilidad de acierto por azar sube de 25% a 33% en esas 3 variantes"
  legalidad_tecnica: "`schema-validator.js` admite `options` de 3 o 4 (src/data/schema-validator.js:445), asi que el motor no se toca"
  declarada_en:
    - "`notes` de content/exercises/fare-cond-imperativo.json"
    - "tests/content-fare-cond-imperativo.test.js (gate)"
    - "43-01-SUMMARY.md"
    - "seccion 7.2 de 09-VALIDATION-PROMPT.md (commit 8d00b4a), para que el quorum no lo marque como carencia de C3"

## Gaps
