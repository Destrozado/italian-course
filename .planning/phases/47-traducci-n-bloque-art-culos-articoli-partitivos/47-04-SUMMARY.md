---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
plan: 04
subsystem: testing
tags: [mutation-testing, gates, pass-ciego, quorum-cross-vendor, s4-acentos, backstop, abstencion, checkpoint, uat]

# Dependency graph
requires:
  - phase: 46-05
    provides: "El molde del fichero de evidencia, el arnés de medición headless y los backstops 21/22 ya abstenidos que este plan re-prueba"
  - phase: 47-01
    provides: "El tracer y el enganche de `partitivos` al array de cobertura — la mutación 3 lo repite sobre el array final de TRES entradas"
  - phase: 47-02
    provides: "Las 48 de Partitivos `validated` — sin ellas la mutación 1 no tiene sujeto en el bloque"
  - phase: 47-03
    provides: "Las 62 de Articoli `validated` y el reporter en exit 0 con `TRAD-COV PASS (206/206)` — la foto verde de partida de este plan"
provides:
  - "Las TRES mutaciones de cierre EJECUTADAS en sus CUATRO formas, con exit code observado y línea literal transcrita en `47-MUTACIONES-EVIDENCIA.md` — ninguna leída"
  - "El Success Criterion 3 del ROADMAP verificado CORRIENDO la mutación: desenganchar las categorías pone ROJO el gate anti-ceguera"
  - "El PASS CIEGO observado en vivo: el reporter en exit 0 con `PASS (144/144)` y luego `PASS (96/96)` mientras 62 y 110 traducciones validadas desaparecen del total — el `225/225 PASS` de las Phases 41-43 reproducido sobre variantes"
  - "La verificación del autor del 2026-08-14 sobre el render, el caso sin traducir y la lectura de muestra"
  - "Los backstops 21 y 22 ARRASTRADOS a las Phases 48-53 con medida nueva (65 ch / 462 px / 1 línea), aceptado por el autor y NO reetiquetados como pasados"
  - "El hallazgo VAL-08 registrado como `WINDOWS` id 40, explícitamente NO arreglado"
affects: [48-53-resto-de-categorias, 47-verificacion-de-fase]

# Actuals (#2632) — pareja del `estimate` del plan, para calibrar futuras estimaciones.
# Medido con estimateTokens (chars/4) sobre el diff REAL de `829ee5c..HEAD`, este
# SUMMARY incluido: 97 201 caracteres → 24 300. No se redondea a la baja para
# parecerse al estimate: una cifra halagüeña corrompe toda proyección posterior.
actuals:
  tokens: 24300
  tasks: 3
  commits: 4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Un arnés de medición no se declara bueno por parecer razonable, sino por REPRODUCIR una cifra independiente ya publicada (el control externo de 390 px cazó un 10 % de error por `document.fonts.ready`)"
    - "Un rojo sin ATRIBUCIÓN no distingue «el gate muerde» de «el gate está averiado»: se registra QUÉ aserción mordió y cuál se quedó verde"
    - "Restauración por COPIA de fichero con md5 verificado a los dos lados, nunca `git checkout` / `git stash` / `git clean`"
    - "Un `backstop` cuya premisa no tiene sujeto se ABSTIENE y se arrastra con su medida escrita; la aprobación del autor puede cubrir el ARRASTRE sin cubrir el enunciado"
    - "Un criterio de aceptación que nombra el sub-gate equivocado se corrige en el PLAN, no ensanchando el gate"

key-files:
  created:
    - .planning/phases/47-traducci-n-bloque-art-culos-articoli-partitivos/47-04-SUMMARY.md
  modified:
    - .planning/phases/47-traducci-n-bloque-art-culos-articoli-partitivos/47-MUTACIONES-EVIDENCIA.md
    - .planning/WINDOWS.md

key-decisions:
  - "Los backstops 21 y 22 SIGUEN ABSTENIDOS y se arrastran a las Phases 48-53 con la medida nueva escrita: el autor aceptó el ARRASTRE, no aprobó la envoltura multilínea, que sigue sin sujeto en este bloque"
  - "VAL-08 NO se ensancha: es un gate de nivel SLOT por diseño y los `disputed` de traducción los consume TRAD-COV. Ensancharlo exigiría su propia mutación, y eso convertiría un cierre de fase en un cambio de gate sin verificar"
  - "El corpus NO se committea en este plan: las mutaciones son destructivas-y-restauradas por diseño y commitear contenido habría materializado T-47-21"
  - "El fallo de `tests/requirements-traceability.test.js` queda ABIERTO y fuera de scope (`WINDOWS` id 17): arreglarlo aquí sería tocar un gate sin correr la mutación que verifica que sigue mordiendo"
  - "El servidor estático del checkpoint se APAGA al cerrar: T-47-26 lo aceptó como corrida local «cerrada al terminar», así que dejarlo vivo habría violado una mitigación que el plan se comprometió a cumplir"

patterns-established:
  - "El PASS CIEGO se OBSERVA, no se argumenta: la mutación imprime el exit 0 con la cifra encogida al lado del rojo del gate que lo delata"
  - "La aprobación de un checkpoint se registra con la GRANULARIDAD de lo que el autor miró; una palabra («aprobado») no se infla a cobertura de lo que no se le enseñó"
  - "Un hallazgo que se reproduce IDÉNTICO dos fases seguidas es en sí mismo el dato: el criterio se copió de plan a plan sin corregirse"

requirements-completed: [TRAD-02]

coverage:
  - id: E1
    description: "MUTACIÓN 1 — una sola traducción sin validar entre las 206 pone TRAD-COV en ROJO; los DOS lados del umbral ejecutados (205/206 → rojo, 206/206 → verde)"
    requirement: "TRAD-02"
    verification:
      - kind: integration
        ref: "`node scripts/run-validation-271.mjs` sobre `articoli-il-cons#0` con `passes: []` y `status: pending` → **exit 1**, `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)`; restaurado → exit 0 y `PASS (206/206)`. Registro literal en `47-MUTACIONES-EVIDENCIA.md` §MUTACIÓN 1"
        status: pass
    human_judgment: false
  - id: E2
    description: "MUTACIÓN 2 — texto español sin tildes → el QUÓRUM lo caza con `[S4-acentos]` → `deriveStatus` da `disputed` → TRAD-COV en ROJO nombrando la dirección compuesta. Sin escáner mecánico en ningún eslabón"
    requirement: "TRAD-02"
    verification:
      - kind: integration
        ref: "`articoli-gli-ps#0` («…los psicólogos más conocidos.» → «…los psicologos mas conocidos.»): 2/2 `incorrecta` con el tag literal `[S4-acentos]` (`deepseek-reasoner` y `gemini-3.5-flash-lite`, los dos con `s4_acentos: false` y los otros cuatro criterios en `true`); reporter **exit 1** con `FAIL (205/206 — pending=0, missing=0, disputed=1)` y `→ Disputed: articoli-gli-ps#0`; restaurado → exit 0. `git status --porcelain scripts/ tests/ docs/` vacío durante la mutación (T-47-23)"
        status: pass
    human_judgment: false
  - id: E3
    description: "MUTACIÓN 3a/3b — desenganchar UNA y luego LAS DOS categorías pone ROJO el gate anti-ceguera, con la aserción que mordió ATRIBUIDA (Success Criterion 3 del ROADMAP)"
    requirement: "TRAD-02"
    verification:
      - kind: unit
        ref: "`node --test tests/count-arrays-lockstep.test.js` → **exit 1** las dos veces, 62/64. GATE-02 con `2 !== 3` nombrando `articoli` (3a) y `1 !== 3` nombrando `articoli, partitivos` (3b), más el guard de integridad del escáner como segunda aserción independiente. La cláusula de no-vacuidad se quedó VERDE en las dos: el rojo viene del hecho medido, no de un extractor averiado"
        status: pass
    human_judgment: false
  - id: E4
    description: "El PASS CIEGO que el gate anti-ceguera existe para delatar, OBSERVADO en vivo y no argumentado"
    requirement: "TRAD-02"
    verification:
      - kind: integration
        ref: "Con la entrada desenganchada, `node scripts/run-validation-271.mjs` → **exit 0** con `Milestone gate PASS` y `TRAD-COV (144/144): PASS (144/144)` (3a, 62 traducciones desaparecidas) y `PASS (96/96)` (3b, las 110 del bloque desaparecidas). El total encogió en silencio y nada se puso rojo"
        status: pass
    human_judgment: false
  - id: E5
    description: "Ninguna mutación queda committeada: los tres ficheros mutados vuelven byte a byte a su foto verde (T-47-21)"
    requirement: "TRAD-02"
    verification:
      - kind: integration
        ref: "`md5sum` re-medido al escribir este SUMMARY: `articoli.json` = `93625e94c8baaac24937b78956a72a0f`, `partitivos.json` = `39e7cac5531597d81c6bc23228cc400d`, `run-validation-271.mjs` = `37ae18c84377d8f4173b8ac0534323a7` — los TRES idénticos a la foto verde. `git status --porcelain` sin ningún fichero rastreado modificado"
        status: pass
    human_judgment: false
  - id: E6
    description: "Render del bloque en las DOS superficies y caso «sin traducción» — confirmados EN PANTALLA por el autor"
    requirement: "TRAD-02"
    verification:
      - kind: manual_procedural
        ref: "`checkpoint:human-verify` `gate=\"blocking\"` del plan 47-04, **2026-08-14**: el autor recarga la pestaña (F5), sirve la app por HTTP local, recorre los puntos 1-6 y 8 del checkpoint y responde «aprobado». Detalle de lo que cubre en §La verificación del autor"
        status: pass
    human_judgment: true
    rationale: "Es verificación visual y de lectura: ningún test puede juzgar que la traducción se lea como español natural ni que el caso sin traducir no deje hueco. Se registra con la granularidad exacta de lo que se le pidió mirar, no del plan entero."
  - id: E7
    description: "E1 · long-text — envoltura multilínea de `.session-translation` entre la caja de feedback y el CTA"
    verification:
      - kind: manual_procedural
        ref: "**ABSTENIDO**, arrastrado a las Phases 48-53 con medida nueva. La traducción más larga de las 110 (`partitivos-dello-scons#0`, **65 caracteres = 462 px** medidos en Chrome headless con las `@font-face` reales forzadas) cabe en **UNA** línea a 1400/1100/900/800/700 px de viewport. `WINDOWS` id 21, amendada y **sigue `open`**"
        status: unknown
    human_judgment: true
    rationale: "La premisa «2+ líneas» SIGUE SIN SUJETO: el bloque Artículos supera al piloto en 8 caracteres y sigue sin envolver. El autor aceptó el ARRASTRE con la medida escrita el 2026-08-14; no aprobó el enunciado, que no se le pudo enseñar porque no existe contenido que lo produzca. Ausencia de sujeto, no indulgencia."
  - id: E8
    description: "E2 · long-text — la misma envoltura dentro de la card de «Errores cometidos» (`.summary-error-translation`)"
    verification:
      - kind: manual_procedural
        ref: "**ABSTENIDO** por la misma ausencia de sujeto, medido en la segunda superficie: mismos 65 chars = 462 px = 1 línea, en la caja más estrecha de las dos (622 px). `WINDOWS` id 22, amendada y **sigue `open`**"
        status: unknown
    human_judgment: true
    rationale: "Misma razón que E7, y esta superficie es la que ANTES vería envolver porque su caja es 34 px más estrecha. No envuelve. Se arrastra intacta a las Phases 48-53."
  - id: E9
    description: "Lectura de muestra del autor sobre las traducciones del bloque, con atención a las 5 variantes metalingüísticas de `partitivos-clasificacion`"
    verification:
      - kind: integration
        ref: "autoridad mecánica: el quórum cross-vendor por script, 110/110 `validated` con `by` distintos de dos vendors (planes 47-02 y 47-03)"
        status: pass
      - kind: manual_procedural
        ref: "El autor leyó la muestra —incluidas las 5 metalingüísticas— dentro del checkpoint del 2026-08-14 y respondió «aprobado» **sin reportar ningún hallazgo**"
        status: pass
    human_judgment: true
    rationale: "Es la mitad HUMANA del backstop que la Phase 46 dejó abstenido en su `WINDOWS` id 23 por no haberse realizado. Aquí SÍ se realizó sobre el corpus de ESTE bloque, así que se registra `pass` para el bloque Artículos. La id 23 es de la Phase 46 y sigue `open`: la lectura de muestra de las 96 de preposiciones no se ha hecho y este «aprobado» no la cubre."

# Metrics
duration: 4h 09m (11m de ejecución de mutaciones + medición + espera del checkpoint bloqueante)
completed: 2026-08-14
status: complete
---

# Phase 47 Plan 04: Los gates muerden sobre el bloque completo, y el PASS CIEGO se ve en vivo Summary

**Las TRES mutaciones de cierre están ejecutadas en sus CUATRO formas con el rojo observado y el exit code apuntado (ninguna leída), el gate anti-ceguera muerde nombrando a las categorías desenganchadas —Success Criterion 3 del ROADMAP verificado CORRIENDO la mutación—, y lo que hace de esto una prueba y no una ceremonia es que el mismo desenganche deja al reporter emitiendo `PASS (144/144)` y luego `PASS (96/96)` en exit 0 mientras 62 y después 110 traducciones validadas desaparecen del total sin un solo rojo: el `225/225 PASS` de las Phases 41-43 reproducido literalmente sobre variantes.**

## Performance

- **Duration:** ~4h 09m (2026-08-14T17:45:39Z → 21:54Z), de los cuales **~11 minutos** son la ejecución de las cuatro corridas de mutación (17:45:39Z → 17:56Z). El resto es la medición headless, la preparación del checkpoint y la **espera al autor**, que es tiempo de calendario y no de trabajo.
- **Tasks:** 3 (2 automáticas + 1 `checkpoint:human-verify` `gate="blocking"`, cerrado por el autor)
- **Commits:** 4 (3 de ejecución + este de cierre)
- **Mutaciones ejecutadas:** 3 declaradas en **4 formas** (1, 2, 3a, 3b), las cuatro con rojo observado en **exit 1**
- **Estimate vs actual:** el plan estimaba **28 000** tokens (`raw_tokens: 80 000`); el coste medido con `estimateTokens` (chars/4) sobre el diff real de `829ee5c..HEAD` **más este SUMMARY** es **24 300** (97 201 caracteres). Dentro de lo estimado, con un 13 % de margen. Dato para calibrar: el trabajo caro **no fue escribir código** —este plan no cambia ni una línea de producción—, fueron las cuatro corridas de mutación, el arnés de medición que hubo que validar dos veces, y la **prosa de registro**, que es la mayor parte del diff porque el entregable de un plan de cierre *es* el registro.

## Cifras DERIVADAS del disco al escribir este SUMMARY (2026-08-14T21:54Z)

Ninguna de estas cifras se copió del plan, del fichero de evidencia ni del prompt de la sesión: **todas se re-midieron ahora**, después de la aprobación del autor.

| Magnitud | Comando | Valor medido |
|---|---|---|
| Reporter de cierre | `node scripts/run-validation-271.mjs` | **exit 0** · `TRAD-COV (206/206 traducciones validated): PASS (206/206)` · VAL-04/06/08/09 PASS · `VAL-06 (250/250 validated): PASS (250/250)` · `Milestone gate PASS.` |
| Sub-gate de cobertura por categoría | ídem | `preposiciones 96 \| 96`, `partitivos 48 \| 48`, `articoli 62 \| 62` — **3 categorías declaradas cubiertas, 206 variantes**, 0 disputed / 0 pending / 0 missing |
| Gate anti-ceguera | `node --test tests/count-arrays-lockstep.test.js` | **exit 0** — 64 tests · 15 suites · **64 pass** · 0 fail |
| Suite completa | `node --test tests/*.test.js tests/fixtures/*.test.js` | **exit 1** — 1343 tests · 229 suites · **1339 pass** · **4 fail** |
| Único rojo de la suite | `grep '^not ok'` sobre la misma corrida | `not ok 142 - trazabilidad de requisitos — la cobertura se DERIVA del disco (DEUDA, D-45-12)` — **una sola entrada**, la pre-existente |
| Corpus de traducción | script sobre los 3 ficheros | **206** traducciones · **206 `validated`** · 0 `pending` · 0 `disputed` |
| Overrides de autor en TODO el corpus | ídem | **2** — `articoli-lo-z#1` y `partitivos-qualche#2`. **Cero nuevos en este plan** |
| `by` distintos del corpus de traducción | ídem | `deepseek-chat`, `deepseek-reasoner`, `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `autor` |
| Traducción más larga del bloque | derivada, no elegida a ojo | `partitivos-dello-scons#0` · **65 caracteres** · `"Para hacer deporte también hace falta algo de espíritu de equipo."` |
| md5 de los 3 ficheros mutados | `md5sum` | `93625e94…`, `39e7cac5…`, `37ae18c8…` — **los tres idénticos** a la foto verde del 2026-08-14T17:45:39Z |
| Motor byte-intacto | `git diff --stat src/domain/ src/screens/app.js` | **vacío** |
| `schemaVersion` | `grep CURRENT_SCHEMA_VERSION src/` | **13** (`src/data/backup.js:61`) |
| Árbol | `git status --porcelain` | solo `?? .planning/research/.cache/` — untracked, ajeno a la fase, ya diferido en el cierre de v2.0 |

## Las TRES mutaciones, en sus CUATRO formas

El registro literal —con las fotos verdes fechadas, los `git diff --stat` de cada mutación y las corridas transcritas enteras— vive en **`47-MUTACIONES-EVIDENCIA.md`**, ya commiteado (`6ac7e9f`, `bad754e`). Es el audit trail y la mitigación de **T-47-22**; este SUMMARY lo resume sin duplicarlo.

| # | Qué se mutó | Exit OBSERVADO | Línea / mensaje literal | Atribución |
|---|---|---|---|---|
| **1** | `articoli-il-cons#0` → `passes: []`, `status: pending`. **El texto NO se tocó** — prueba el umbral, no la calidad | **1** (reporter) | `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)` | Umbral de cobertura: `205 !== 206`, y la fila `articoli 62 \| 61 \| 0 \| 1 \| 0` lo localiza |
| **2** | `articoli-gli-ps#0` → texto desacentuado (`psicólogos`→`psicologos`, `más`→`mas`) + `passes: []` | **1** (reporter) | `TRAD-COV (…): FAIL (205/206 — pending=0, missing=0, disputed=1)` + `→ Disputed: articoli-gli-ps#0` (nombrada dos veces) | Quórum `[S4-acentos]` en los **DOS** vendors → `deriveStatus` = `disputed` → `205 !== 206` |
| **3a** | Quitada la entrada `articoli` de `TRANSLATION_COVERAGE` | **1** (gate) · reporter en **0 con PASS CIEGO 144/144** | GATE-02: `el extractor ve 2 pares … y el disco declara 3 categorias cubiertas … quedarian CIEGAS: articoli` · `2 !== 3` | **Lista de ciegas**, NO la cláusula de no-vacuidad |
| **3b** | Quitadas `articoli` **y** `partitivos` | **1** (gate) · reporter en **0 con PASS CIEGO 96/96** | GATE-02 con las DOS nombradas: `quedarian CIEGAS: articoli, partitivos` · `1 !== 3` | **Lista de ciegas**, NO la no-vacuidad |

**Las dos cifras de cada FAIL las interpola el REPORTER** desde valores computados (`totalTranslationValidated` y `TOTAL_TRANSLATION_EXPECTED`, este último Σ de los `expected` que `mcVariantCountOf` deriva de cada fichero): ninguna la transcribió el ejecutor. **Ninguna de las cuatro resultó no discriminante.**

### El hallazgo que justifica el gate: el PASS CIEGO, observado y no argumentado

Esto es lo que el Success Criterion 3 compra, y se vio en vivo:

```
$ node scripts/run-validation-271.mjs ; echo $?          # con articoli desenganchada
Cobertura de traducción — unidad: VARIANTE multiple-choice (2 categorías declaradas cubiertas, 144 variantes)
  TRAD-COV (144/144 traducciones validated): PASS (144/144)
Milestone gate PASS.
0
```

```
$ node scripts/run-validation-271.mjs ; echo $?          # con las DOS desenganchadas
Cobertura de traducción — unidad: VARIANTE multiple-choice (1 categoría declarada cubierta, 96 variantes)
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
Milestone gate PASS.
0
```

**El reporter sale en `exit 0` con `Milestone gate PASS` mientras 62 —y luego las 110 del bloque entero— siguen en disco, `validated`, sin contarse.** `206` se convirtió en `144` y después en `96`, y **nada se puso rojo**: el total encogió en silencio y el gate de cierre certificó una cobertura que ignora categorías enteras. Es el **`225/225 PASS` de las Phases 41/42/43 trasladado a las variantes**, reproducido literalmente. En 3b el reporter vuelve **exactamente a la cifra del piloto de la Phase 46**, como si esta fase no hubiera existido.

**Sin el gate anti-ceguera esta mutación es indetectable.** Y es exactamente el bug que corrió tres fases seguidas.

### La atribución, que es lo que separa «el gate muerde» de «el gate está averiado»

En 3a y 3b **la cláusula de no-vacuidad se quedó VERDE**, y esa es la mitad importante del resultado: significa que el extractor **sí** encontró la región, **sí** leyó el disco y **sí** contó bien, así que el rojo viene del **hecho medido** (falta una entrada) y no de un reconocedor que dejó de casar. Un rojo por no-vacuidad habría sido un rojo inútil, y además habría hecho **mentir al mensaje** del gate. Que las dos formas de la mutación den la MISMA atribución es justamente lo que la segunda existe para comprobar: quitar las dos entradas no enmascara la segunda causa.

Además mordió una **segunda aserción independiente** —el guard de integridad del escáner, que vigila lo mismo por otro camino (líneas de entrada frente a categorías cubiertas en disco)—, así que el desenganche lo cazan **dos gates que no comparten mecanismo**.

### La restauración, verificada en tres y cuatro planos

Método: **copia de fichero desde la foto verde, fichero a fichero**, nunca `git checkout` / `git stash` / `git clean` (prohibición explícita del plan y de la casa). Verificado:

1. **md5 byte a byte** — los tres ficheros vuelven a su hash de partida, re-medido hoy al escribir este SUMMARY.
2. **`git status --porcelain`** vacío sobre cada fichero mutado.
3. **Lectura del dato concreto** — el texto acentuado con sus dos pases `correcta` de vuelta (mutación 2); las **tres entradas del array leídas con su forma load-bearing intacta** (`slug` delante, `slug` y `file` en la misma línea, `expected` derivado por `mcVariantCountOf`).
4. **Los dos gates en verde** (mutación 3).

El plano 3 es el que cubre **T-47-24**: una entrada restaurada con la **forma rota** daría verde en el reporter y ciego en el gate, así que hay que mirar las dos cosas y no solo el exit code.

**Ninguna mutación quedó committeada** (T-47-21): los dos commits de ejecución tocan **solo** el fichero de evidencia.

## La verificación del autor — con la granularidad de lo que miró

**Respuesta literal del autor: «aprobado».** Una palabra, el **2026-08-14**, dentro del `checkpoint:human-verify` `gate="blocking"` de la Task 3, y **después** de habérsele pedido que empezara **recargando la pestaña con F5** —criterio de aceptación explícito del checkpoint, y no una formalidad: el contenido se hace `fetch` una sola vez al arrancar la app (`WINDOWS` id 24), así que sin la recarga un «no veo la traducción» habría sido un **falso hallazgo**, y a la Phase 46 le costó una ronda de diagnóstico en vivo.

**Lo que el «aprobado» cubre, punto por punto:**

- **Superficie 1 — la caja de feedback.** La traducción aparece **solo en estado resuelto**, **fuera** de la caja tintada, en **serif** (la misma familia que la frase italiana), **sin etiqueta y sin comillas envolventes**; el `gloss` ES pre-respuesta del `prompt` sigue intacto; **no hay auto-avance**; y **«¿Por qué?» sigue revelando la explicación aparte**, sin que la traducción le robe el sitio. Confirmado tanto fallando como acertando: **mismo sitio en los dos casos**.
- **Superficie 2 — «Errores cometidos».** La traducción va en serif dentro de la card, entre la respuesta correcta y la explicación en itálica.
- **El caso «sin traducción».** Una categoría todavía sin traducir (Essere / Avere) se ve **exactamente como antes**: sin hueco, sin etiqueta, sin placeholder y sin guion.
- **La lectura de muestra**, incluidas **las 5 variantes metalingüísticas de `partitivos-clasificacion`**: su traducción es la de la frase italiana y no un comentario sobre la etiqueta gramatical.
- **La aceptación del arrastre** de los backstops 21 y 22 a las Phases 48-53 con la medida nueva escrita.

**El autor no reportó ningún hallazgo.** No se ha inventado ninguno.

**Lo que ese «aprobado» NO cubre, y por tanto no se cierra:**

- **Los backstops `long-text` 21 y 22.** El autor aceptó **el arrastre**; no aprobó la envoltura multilínea, que no se le pudo enseñar porque **no existe contenido que la produzca**. Siguen **ABSTENIDOS** (§ siguiente).
- **La lectura de muestra de las 96 de `preposiciones`** (`WINDOWS` id 23, de la Phase 46). Es de otro corpus y sigue `open`.

## Los backstops 21 y 22 — ABSTENIDOS, arrastrados, y con medida nueva

**La premisa —«una traducción que envuelve en 2+ líneas»— SIGUE SIN SUJETO en el bloque Artículos.**

| Backstop | Estado | Medida nueva, derivada del disco |
|---|---|---|
| **21 · E1 long-text** (`.session-translation`) | **ABSTENIDO** · `open` · arrastrado a 48-53 | `partitivos-dello-scons#0` · **65 chars** · **462 px** · **1 línea** a 1400/1100/900/800/700 px · caja 1096→656 px · sin desborde, sin truncado |
| **22 · E2 long-text** (`.summary-error-translation`) | **ABSTENIDO** · `open` · arrastrado a 48-53 | El mismo texto · **462 px** · **1 línea** · caja 1062→**622 px**, la **más estrecha** de las dos superficies |

La frase más larga del bloque **supera a la del piloto en 8 caracteres** (65 vs 57) y **sigue cabiendo en una línea**. La caja más angosta de escritorio son 622 px —justo antes de la capa móvil `@media (max-width: 640px)`, fuera de scope— y **462 px no envuelven dentro de 622 px**.

### El error de medición que casi se certifica, y el control externo que lo cazó

Hay que dejarlo escrito porque el número es el que decide si el ítem se cierra o se abstiene. **La primera corrida midió 414 px, y era falso.** `document.fonts.ready` resuelve **antes** de que una `@font-face` que aún no se ha pedido llegue a cargarse, así que se midió con la fallback **Georgia** en vez de con **Spectral**: un **10 % de error**.

Se cazó con un **control externo**, no con una revisión de plausibilidad: el arnés mide también el texto del piloto de la Phase 46, cuyo ancho está **publicado en `46-05-MUTACIONES-EVIDENCIA.md` como 390 px**. Con la fallback el arnés daba 352 px —**no cuadraba**— y con `document.fonts.load('400 16px Spectral', …)` forzado antes de medir da **390 px exactos**. **El arnés no se declaró bueno porque pareciera razonable, sino porque reprodujo una cifra independiente publicada un día antes.** Sin ese control, la tabla de arriba llevaría 414 px y nadie lo habría notado.

El **control positivo** existe y es limpio: una cadena sintética de 165 caracteres **sí** envuelve en las dos superficies (944 px, 2 líneas a 1400 px y 4 a 700 px), por espacios, con cero desborde y cero truncado. **La mitad MECÁNICA del enunciado está probada; lo que falta es el sujeto REAL.** Una cadena sintética no cierra una `backstop`.

**No se cierran, no se aprueban y no se reetiquetan como pasados.** Mismo tratamiento que la Phase 46 y por la misma razón: **ausencia de sujeto, no indulgencia.**

**Lo que esta medición SÍ aporta a las fases siguientes:** el umbral queda acotado por **dos** puntos medidos en vez de uno — 65 chars = 462 px = 1 línea; 165 chars = 944 px = 2 líneas. En la caja más estrecha (622 px) hará falta una traducción de en torno a **88 caracteres** para ver la envoltura. **Ninguna categoría traducida hasta hoy se acerca.**

## Naturaleza del quórum — declarada, no maquillada

**Todo el quórum de esta fase es el CROSS-VENDOR POR SCRIPT** (`scripts/validate-translation-pass.mjs`, DeepSeek + Gemini), que es lo que **D-46-13** establece para TRADUCCIONES. **NUNCA fue el quórum canónico Opus+Sonnet por subagent `Task` de VAL-03**, que gobierna el contenido de ejercicio (R1-R7) y que un `gsd-executor` no puede spawnear porque él mismo es un subagent.

Aplica a las **110 traducciones del bloque** (planes 47-01, 47-02 y 47-03) **y a los dos pases de la mutación 2 de este plan**. Cumple la barra estructural —2 `by` DISTINTOS, de dos vendors distintos, `deriveStatus` como fuente única— y por eso el `validated` derivado es legítimo; pero **se declara como lo que es y no se escribe como canónico**. Ya registrado en `WINDOWS` id 34; se repite aquí porque un SUMMARY que dijera solo «quórum» dejaría al lector suponer el otro.

Un dato que refuerza que no es un sucedáneo sino el mecanismo **decidido**: la mutación 2 confirmó que **S4 (acentos RAE) muerde con los dos vendors y también con el juez nuevo** (`deepseek-reasoner`, el cambio de juez a mitad de corpus de `WINDOWS` id 38). Los dos devolvieron `incorrecta` con `s4_acentos: false` y los otros cuatro criterios en `true`: **el rojo es atribuible al acento y a nada más**.

## Task Commits

| # | Task / trabajo | Commit | Tipo |
|---|---|---|---|
| 1 | Mutaciones 1 y 2 — evidencia con exit codes, veredictos literales y md5 | `6ac7e9f` | docs |
| 2 | Mutación 3 en sus dos formas — el gate muerde y el reporter emite el PASS CIEGO | `bad754e` | docs |
| 3 | El autor aprueba: 21/22 amendadas y abstenidas, hallazgo VAL-08 al ledger, servidor apagado | `74318ba` | docs |
| — | Cierre del plan (este SUMMARY, STATE, ROADMAP) | *(commit de cierre)* | docs |

**Las Tasks 1 y 2 no tienen commit de producción, y es lo correcto.** Son destructivas-y-restauradas por diseño y los tres ficheros vuelven byte a byte a la foto verde; commitear contenido aquí habría materializado **T-47-21**. Su evidencia sí está commiteada, que es donde tiene valor.

## Hallazgos

### 1. El criterio de aceptación de la mutación 2 nombraba el sub-gate equivocado — y es el MISMO hallazgo de la Phase 46, reproducido palabra por palabra

El plan 47-04 pedía, para la mutación 2, «la línea del sub-gate de cero `disputed` **también en FAIL**». **`VAL-08` se quedó en `PASS`.** No es que el gate no muerda: **es que el criterio espera el rojo en el sub-gate que no le corresponde.**

Leído en `scripts/run-validation-271.mjs`: `val08Pass = totalDisputed === 0`, y `totalDisputed` se reduce sobre `perCategory` —el bucle de **SLOTS**—. **VAL-08 es, por diseño, un gate de nivel slot.** Los `disputed` de nivel **traducción** viven en `perTranslationCategory` → `totalTranslationDisputed`, y los consume **TRAD-COV**, que es quien los imprime y quien nombró `articoli-gli-ps#0` dos veces.

**No queda ninguna vía de escape, que es lo que importa:** una traducción `disputed` no es `validated`, así que baja `totalTranslationValidated` por debajo de `TOTAL_TRANSLATION_EXPECTED` y TRAD-COV sale FAIL **necesariamente**. La cobertura está completa; lo que sobra es la expectativa escrita en el criterio.

**NO SE ARREGLA AQUÍ, y no por pereza sino por dos razones independientes:**

1. Ensanchar VAL-08 para incluir los `disputed` de traducción **cambiaría la semántica de un sub-gate a final de fase, sin mandato**.
2. La regla de la casa exige **verificar un fix que toca un gate con la MISMA mutación que verifica el código que arregla** (Phase 44: 2 de 4 fixes de revisor eran incorrectos y uno era peor que el bug). Ensanchar VAL-08 exigiría **su propia mutación** — convertiría un cierre de fase en un cambio de gate sin verificar.

**Que el hallazgo se reproduzca IDÉNTICO dos fases seguidas es en sí mismo el dato: el criterio se copió de plan a plan sin corregirse, y esta es la segunda vez que se paga leerlo.** Registrado como **`WINDOWS` id 40**, con lo que hay que hacer escrito: **corregir la expectativa en los planes de las Phases 48-53** (pedir el rojo en TRAD-COV, que es su sitio), **no ensanchar el gate**.

### 2. Un arnés de medición se valida contra un control externo, no contra la intuición

Ver §El error de medición. La lección generaliza más allá de esta fase: **la primera cifra parecía perfectamente razonable** (414 px para 65 caracteres en serif de 16 px no llama la atención de nadie), y solo reventó al compararla con una magnitud independiente ya publicada. Cuando una medición decide un veredicto —aquí, si un backstop se cierra o se abstiene—, necesita un punto de anclaje que no venga del mismo arnés.

### 3. El servidor estático del checkpoint estaba vivo, y el propio threat model obligaba a apagarlo

**T-47-26** acepta el servidor del checkpoint como riesgo `low` **con una condición escrita**: corrida local «escuchando solo en la interfaz local y **cerrada al terminar**». Dejarlo vivo habría violado una mitigación que el plan se comprometió a cumplir — una disposición `accept` con condición es una condición, no una absolución.

Apagado y **confirmado abajo, no supuesto**: dos servidores (`:3000`, el del checkpoint, y `:3999`, el del arnés de medición headless), los dos con `cwd` en el repo.

```
$ (ss -ltnp | grep -E ':3000|:3999')     → sin listener
$ curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3000/   → 000
$ curl -s -o /dev/null -w "%{http_code}" --max-time 3 http://localhost:3999/   → 000
```

## Deviations from Plan

### 1. [DECLARADA] La mutación 2 esperaba el rojo en VAL-08 y salió en TRAD-COV

Ver §Hallazgos 1. La cobertura está completa; lo que sobra es la expectativa del criterio. **El gate NO se tocó**, y el hallazgo queda en el ledger (`id 40`) con la corrección apuntada para las Phases 48-53. Es la misma desviación que la Phase 46 declaró en su plan 46-05, y se registra otra vez precisamente porque **repetirse es el hallazgo**.

### 2. [DECLARADA] El criterio `suite en exit 0` no se cumple, y no se silencia

La suite sale en **exit 1** por los 4 subtests de `tests/requirements-traceability.test.js`. Es **deuda pre-existente** (`WINDOWS` id 17, D-45-12), ajena al corpus —ese fichero solo lee `.planning/REQUIREMENTS.md`, cero acoplamiento con `content/exercises/`— y **fuera de scope**. Las cifras son idénticas a la línea base del plan 47-03: **1343 / 1339 / 4**, el mismo único fichero rojo. **Cero regresiones nuevas.** Arreglarlo aquí sería tocar un gate sin correr la mutación que verifica que sigue mordiendo, que es justo lo que esta fase existe para no hacer.

### 3. [DECLARADA — no es desviación del ejecutor] Los backstops 21 y 22 no se cierran

El plan contemplaba **las dos salidas** y esta es una de ellas, ejecutada según su letra: cerrar con evidencia **o** seguir abstenido con la medida escrita. Se registra como desviación solo porque el plan aspiraba a que este bloque diera sujeto y **no lo dio**. Ver §Los backstops.

---

**Total deviations:** 3 declaradas · **0 auto-arregladas** · **0 cambios de código de producción** · **0 overrides nuevos** · **0 caracteres de español modificados**.
**Impact:** ninguno sobre el entregable. Cero scope creep: no se inventó ningún gate, no se ensanchó ninguno y no se arregló nada pre-existente.

## Issues Encountered

- **La medición de 414 px que casi se certifica.** Ver §Hallazgos 2. Cazada por control externo antes de escribirse en ningún sitio; la cifra publicada es la correcta (462 px).
- **Dos servidores estáticos vivos al llegar al cierre.** Ver §Hallazgos 3. Apagados y confirmados abajo.

## Known Stubs

Ninguno. Las dos superficies pintan texto real y `validated`, y las 206 traducciones del corpus están en disco con `TRAD-COV` en PASS.

## Deferred Issues

- **`WINDOWS` id 40 — VAL-08 no cubre los `disputed` de nivel traducción.** No es un agujero (TRAD-COV los caza necesariamente), es una **asimetría** que quien lea los sub-gates debe conocer. **Anotado, no arreglado**, y con la corrección apuntada al sitio correcto: el criterio de los planes de las Phases 48-53.
- **`WINDOWS` ids 21 y 22 — los dos backstops `long-text`.** **ABSTENIDOS**, `open`, arrastrados a las Phases 48-53 con la medida nueva. La primera categoría que produzca una traducción de ~88+ caracteres es la que debe re-probarlos en pantalla.
- **`WINDOWS` id 17 — los 4 subtests de trazabilidad.** ABIERTO, fuera de scope, quiere su propio quick task verificado por mutación. Ver §Deviations 2.
- **`WINDOWS` id 23 — la lectura de muestra de las 96 de `preposiciones`.** Sigue `open`: el «aprobado» de hoy cubre la lectura del bloque **Artículos**, no la del piloto.
- **`WINDOWS` id 35 — el override de `partitivos-qualche#2`** que no cumple la barra estricta. Sigue `open` **a propósito**, para que el autor lo revise a sabiendas. Este plan no lo toca.

## Next Phase Readiness

**Para el cierre de la fase 47** (aggregate → code review → verify, que corre el orquestador): reporter en **exit 0** con `TRAD-COV PASS (206/206)`, gate anti-ceguera en **64/64**, motor **byte-intacto**, `schemaVersion` en **13**, corpus con los tres md5 idénticos a la foto verde, `git status` sin mutaciones residuales, y **las tres mutaciones ejecutadas en sus cuatro formas con rojo observado**. El único rojo de la suite es la deuda pre-existente de trazabilidad.

**Los 4 Success Criteria del ROADMAP para la Phase 47, contra el disco:**

| SC | Estado |
|---|---|
| 1 · Cobertura del bloque (110 traducciones de la frase resuelta, solo en estado resuelto) | **CUMPLIDO** — 62 + 48 en disco; el «solo en estado resuelto» confirmado por el autor en pantalla |
| 2 · Calidad validada por quórum cross-vendor, `disputed` resueltos con trabajo, acentos RAE | **CUMPLIDO** — 110/110 `validated`, 0 `disputed`, 2 overrides con motivo escrito (ninguno nuevo aquí), y S4 probado por mutación |
| 3 · **El gate crece con el bloque: desengancharlas pone ROJO el gate anti-ceguera, verificado corriendo la mutación al cerrar la fase** | **CUMPLIDO CORRIENDO LA MUTACIÓN** — exit 1 en 3a y 3b, con las categorías nombradas y la aserción atribuida |
| 4 · Brownfield intacto (`src/domain/`, `schemaVersion` 13, `gloss` ES vivo, reporter exit 0) | **CUMPLIDO** — `git diff` vacío, 13, `gloss` confirmado por el autor, reporter exit 0 |

**Para las Phases 48-53:**

- **Corregir el criterio de la mutación de acentos en el plan:** pedir el rojo en **TRAD-COV**, no en VAL-08. Ya ha costado dos fases leerlo (`WINDOWS` id 40).
- **Los backstops 21 y 22 viajan con la fase.** Umbral acotado: hará falta una traducción de ~**88 caracteres** en la caja de 622 px para ver la envoltura.
- **Empieza toda UAT recargando la pestaña.** El contenido se hace `fetch` una vez (`WINDOWS` id 24); un examen nuevo NO recarga el JSON.
- **El quórum de traducción es el cross-vendor POR SCRIPT** (D-46-13), y se declara como tal en cada SUMMARY. Nunca se escribe como canónico.
- **Un flag `[S4-acentos]` sobre español real es un bug REAL** (PRES-05): se arregla el acento, no se overridea. El criterio está probado y muerde con los dos vendors y con el juez nuevo.
- **Apagar el servidor del checkpoint al cerrar.** T-47-26 lo acepta con esa condición escrita.

## Self-Check: PASSED

- Los 3 commits de ejecución declarados existen en `git log`: **`6ac7e9f`**, **`bad754e`**, **`74318ba`**.
- `47-MUTACIONES-EVIDENCIA.md` existe en disco y está commiteado (`6ac7e9f` + `bad754e`).
- `node scripts/run-validation-271.mjs` → **exit 0**, `TRAD-COV: PASS (206/206)`, `VAL-06 (250/250)`, `Milestone gate PASS.` (medido al escribir este SUMMARY).
- `node --test tests/count-arrays-lockstep.test.js` → **exit 0**, 64/64.
- `node --test tests/*.test.js tests/fixtures/*.test.js` → **1343 / 1339 pass / 4 fail**, un único fichero rojo, el pre-existente. **Cero regresiones nuevas.**
- Corpus derivado del disco: **206** traducciones · **206 `validated`** · 0 `pending` · 0 `disputed` · overrides **2** (`articoli-lo-z#1`, `partitivos-qualche#2`), **ninguno nuevo**.
- `md5sum` de los tres ficheros mutados → **idénticos** a la foto verde (`93625e94…`, `39e7cac5…`, `37ae18c8…`).
- `git diff --stat src/domain/ src/screens/app.js` → **vacío**. `CURRENT_SCHEMA_VERSION` → **13**.
- `git status --porcelain` → solo `?? .planning/research/.cache/`, untracked y ajeno.
- `WINDOWS` ids **21** y **22** siguen **`open`** con `kind: unmet-truth` tras la enmienda — verificado parseando el bloque JSON del ledger. **Ninguna se reetiquetó como pasada.** id **40** creada, `open`.
- Servidores estáticos **apagados**: `:3000` y `:3999` sin listener, `curl` devuelve `000` en los dos.
- Los backstops E7 y E8 de este SUMMARY siguen con `status: unknown` y `human_judgment: true`. **Ninguno se convirtió en `pass`.**

---
*Phase: 47-traducci-n-bloque-art-culos-articoli-partitivos*
*Completed: 2026-08-14*
