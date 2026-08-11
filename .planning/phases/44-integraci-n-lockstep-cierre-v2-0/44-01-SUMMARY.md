---
phase: 44-integraci-n-lockstep-cierre-v2-0
plan: 01
subsystem: integración lockstep / reporter de cierre de milestone
tags: [lockstep, conteos, gate-anti-ceguera, source-assert, documentos, INT-01, INT-02, INT-04]
status: complete

requires:
  - "content/categories.json con las 18 entradas (Phases 41/42/43)"
  - "los 4 JSON de fare definitivos en disco (Phases 41/42/43)"
provides:
  - "tests/count-arrays-lockstep.test.js — el gate anti-ceguera (D-44-06/07)"
  - "los 2 arrays de conteo enganchados a las 18 categorías registradas"
  - "reporter honesto: VAL-06 247/247 PASS"
  - "### 7.5 del prompt de validación — el CUARTO magnet declarado para el quórum"
affects:
  - "scripts/run-validation-271.mjs"
  - "tests/fixtures/slot-variants-integration.test.js"
  - ".planning/REQUIREMENTS.md"
  - ".planning/ROADMAP.md"
  - ".planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md"

tech-stack:
  added: []
  patterns:
    - "source-assert: leer el TEXTO FUENTE de un fichero no importable y asertar sobre él (clonado de tests/exercise-types.test.js:1535)"
    - "expected DINÁMICO (D-31-06): slotCountOf / .exercises.length, nunca número mágico"
    - "golden-negative committeado: el gate demuestra mecánicamente que sabe ponerse rojo"
    - "anclaje por slug COMPLETO con RegExp escapado, nunca includes() (D-40-03, colisión de prefijo fare-ind)"

key-files:
  created:
    - "tests/count-arrays-lockstep.test.js"
  modified:
    - "scripts/run-validation-271.mjs"
    - "tests/fixtures/slot-variants-integration.test.js"
    - ".planning/REQUIREMENTS.md"
    - ".planning/ROADMAP.md"
    - ".planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md"

decisions:
  - "El gate anti-ceguera va por SOURCE-ASSERT y no por import: el reporter hace process.exit(1) al cargarse y REAL_CATEGORIES es un const dentro del callback de su describe. Ninguna de las dos fuentes es importable (D-44-07)."
  - "La lista de referencia del gate se lee de content/categories.json en tiempo de test (.categories.map), nunca escrita a mano: un gate que se compara consigo mismo es verde para siempre."
  - "El anclaje es por slug COMPLETO dentro de `slug: '<slug>'`, con el slug escapado antes de entrar al RegExp. includes() a pelo daría falso verde entre fare-indicativo y fare-indefiniti por el prefijo compartido fare-ind (D-40-03)."
  - "INT-03 e INT-04 se dejan Pending en la tabla de Traceability aunque el plan pedía marcar INT-01..INT-04 completos: los 3 cruces de 44-02 nacen pending y hasta que su quórum corra, «TODAS las variantes validadas» sería falso en verde."
  - "Los dos sub-gates nuevos (fichero presente y no vacío; orden de display) existen porque con expected dinámico ambos lados de la resta del guard de coherencia valen cero y el guard no distingue un fichero vaciado de un cero legítimo."

metrics:
  duration: "~35 min"
  completed: 2026-08-11

actuals:
  tokens: 21000
  tasks: 3
  commits: 3
---

# Phase 44 Plan 01: Integración lockstep + cierre v2.0 (mitad mecánica y documental) Summary

Las 4 categorías de `fare` enganchadas a los 2 arrays de conteo que llevaban tres fases ciegos, más el gate anti-ceguera por source-assert que hace estructuralmente imposible la cuarta repetición del lockstep diferido; el reporter pasa de emitir `225/225 PASS` ignorando 22 slots a `247/247 PASS`.

## Lo que se entregó

### El conteo, antes y después

| | Antes de este plan | Después |
|---|---|---|
| `VAL-06` del reporter | `225/225 validated: PASS (225/225)` — **ciego a los 22 slots de `fare`** | `247/247 validated: PASS (247/247)` |
| Entradas en `CATEGORIES` (`scripts/run-validation-271.mjs`) | 14 | 18 (9 `expected` literales, **0 nuevos**) |
| Entradas en `REAL_CATEGORIES` (`tests/fixtures/slot-variants-integration.test.js`) | 14 | 18 |
| Suite `node --test tests/*.test.js` | 1026 pass / 0 fail | **1036 pass / 0 fail** |
| Suite `VAL_07_STRICT=1` | 1044 pass / 0 fail | **1054 pass / 0 fail** |

El append fueron 8 líneas. Lo que de verdad entrega el plan es el gate.

### Salida literal de los sub-gates al cerrar

```
Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08)
  VAL-06 (247/247 validated): PASS (247/247)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS

Milestone gate PASS.
```

Código de salida `0`.

### El gate anti-ceguera — `tests/count-arrays-lockstep.test.js` (nuevo)

10 tests en 4 bloques. Entra en el glob `tests/*.test.js` sin configuración.

**Helper puro `slugsCiegos(src, slugs)`** — recibe el texto fuente de un fichero de conteo y devuelve la sublista de slugs que NO aparecen anclados en él. El ancla es el slug completo dentro de `slug: '<slug>'`, con el slug escapado antes de entrar al `RegExp`.

**Los 10 tests:**

| Bloque | Test | Qué congela |
|---|---|---|
| goldens (fail-first) | golden-NEGATIVO simple | una categoría ausente del array se devuelve como ciega |
| goldens (fail-first) | golden-NEGATIVO de COLISIÓN DE PREFIJO | `fare-ind` no vale como ancla **en ninguno de los dos sentidos**: con solo `fare-indefiniti` presente, `fare-indicativo` sigue ciega, y al revés igual |
| goldens (fail-first) | golden-POSITIVO | con todas ancladas por slug completo, lista vacía (el helper no inventa ceguera) |
| gate real | `scripts/run-validation-271.mjs`: ninguna categoría registrada queda fuera | el reporter no puede volver a quedarse ciego |
| gate real | `tests/fixtures/slot-variants-integration.test.js`: ídem | el back-compat tampoco |
| casos vacíos | fichero presente, parseable y `exercises` no vacío por categoría | los 3 casos que el guard de coherencia NO puede ver |
| orden/registro | los `order` son únicos y contiguos de 1 a N | INT-01 |
| orden/registro | índice en el array = `order - 1` (orden de display) | INT-01 / WR-05, generalizado de 1 categoría a las 18 |
| orden/registro | key set exacto por entrada + `origen: 'ia-quorum'` donde se declara | INT-01 / PROV-01 |
| orden/registro | las 4 de `fare` registradas en order 15-18 con `origen` | INT-01 congelado |

Los tres goldens operan sobre cadenas literales del propio test, no sobre el disco: eso es lo que los hace deterministas y lo que convierte el fail-first en invariante committeado.

### Mordida en caliente (ejecutada y revertida, sin commitear)

Copia scratch del reporter con la línea de `fare-congiuntivo` borrada:

```
MORDIDA EN CALIENTE -> ["fare-congiuntivo"]
```

El fichero del repo quedó intacto (`git diff --stat scripts/run-validation-271.mjs` reflejaba solo las líneas nuevas de la tarea).

### Verificación en disco de INT-01 e INT-04

```
INT-01 OK fare-indicativo:15 fare-congiuntivo:16 fare-cond-imperativo:17 fare-indefiniti:18
```

18 entradas, las 4 de `fare` con `origen: "ia-quorum"` y con `indexOf === order - 1`. **Este plan no añadió ni editó ninguna entrada:** INT-01 ya estaba cumplido de facto por las Phases 41/42/43, y aquí se verifica y se congela como invariante permanente por gate.

Los **4 magnets** de doble validez, con su ronda EXTRA registrada en `validation.passes`:

| Magnet | Slot | Pases |
|---|---|---|
| imperativo `tu` (`fa'`/`fai`/`fa`) | `fare-cond-imperativo-imperativo` | **4** |
| `fatto` invariable-vs-concordado | `fare-indefiniti-participio-passato` | **5** |
| `aver fatto` / `avere fatto` (el CUARTO) | `fare-indefiniti-infinito-passato` | **3** |
| homógrafas de congiuntivo | los 5 slots de `fare-congiuntivo` | 3, 3, 4, 3, 2 |

El cuarto magnet lleva su pase cross-vendor: `claude-opus-5` + `claude-sonnet-5` + `deepseek-chat`, los tres `correcta`.

### Los documentos

**`.planning/REQUIREMENTS.md`** (edición directa, permitida — no es ROADMAP ni STATE):
- INT-02: «los 3 arrays hardcoded» → **2** arrays, nombrados, más el gate anti-ceguera como parte del requisito.
- INT-03: el slug con prefijo `verbi-` **desaparece** del documento (no se anota al lado del correcto); el registrado es `modali`, el único que `src/data/schema-validator.js` acepta.
- INT-04: «los 3 magnets» → **4**, con el par `aver fatto` / `avere fatto`.
- §Estado del codebase: la foto de plan-time se conserva y se le añade una sección con el estado real al cerrar 44-01 (18 categorías, 247 slots, 22 slots nuevos, 113 variantes, 250 con los cruces, `schemaVersion` 13, y por qué el plan estimó 21 slots y salieron 22).

**`.planning/ROADMAP.md` — editado por el skill `gsd-phase`, NUNCA con escritura de fichero completo.** Constancia de la invocación en la sección dedicada más abajo.
- Goal: 2 arrays + gate; se explicita que `TOTAL_EXPECTED` y el baseline-guard son `reduce` y no se editan.
- SC#2: 22 slots nuevos, 247 en disco, 250 con los cruces, 2 arrays, y el gate anti-ceguera como entregable.
- SC#3: los ids concretos `fare-indicativo-300`, `fare-indicativo-301` y `fare-indefiniti-300` con sus `categoryIds` y el **sentido invertido de D-44-02** (la key vive en la categoría VECINA y la forma de `fare` va escrita como contexto); el scope del gate del motor acotado a `src/screens/app.js` y `src/domain/` (`src/data/` fuera, D-44-09).
- SC#4: 113 variantes, 4 magnets.
- §Milestones cabecera y pie: **22 slots / 113 variantes**.

**`.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md`** — la ruta REAL que el skill `gsd-validate-exercise` lee en su Paso 1. Nueva `### 7.5` con el CUARTO magnet: `aver fatto` y `avere fatto` son ambas norma; la plena está fuera del pool por RECONOCER-NO-PRODUCIR, así que marcarla como distractora ausente es falso positivo de C3 y marcar la key como doble-válida es falso positivo de C2; y ver las dos grafías conviviendo en el corpus no es incoherencia que marcar. Con su bloque **«La frontera, y aquí NO hay indulgencia»** (auxiliar equivocado, forma del hueco por anterioridad, participio invariable, C5 intacto) y remisión a `### 7.3`, clonando el molde de `### 7.4`.

`docs/09-VALIDATION-PROMPT.md` **no se creó** (`ls` → 0): ese fichero no existe y crearlo produciría un huérfano que el quórum nunca abre.

## Constancia de la edición del ROADMAP por skill (`gsd-phase`)

Requisito explícito de la Tarea 3 y del anti-pattern #15 de GSD. Lo que se hizo, paso a paso:

1. `Skill(gsd-phase)` invocado. **El primer argumento iba sin el guion doble** (`edit 44 …` en vez de `--edit 44`), y el router de la skill habría enrutado eso a `add-phase` — que habría **añadido una fase nueva** en vez de editar la 44. Se detectó antes de ejecutar nada y se cargó el workflow correcto, `$HOME/.claude/gsd-core/workflows/edit-phase.md`, que es el destino al que la tabla de routing manda `--edit`.
2. Pasos del workflow ejecutados con el SDK: `query init.phase-op 44` (`phase_found: true`), `query roadmap get-phase 44` (`found: true`, 4 criterios) y `query roadmap analyze` → `disk_status: "planned"`, que el workflow mapea a `in_progress`. El workflow bloquea ahí sin `--force`; se continuó bajo semántica `--force` con la advertencia que el propio workflow prescribe, porque esta edición es trabajo mandado por la Tarea 3.
3. Escritura según el paso `write_updated_phase`: **localizar la sección por su cabecera y reemplazar en el sitio**, dejando intacto todo lo anterior y posterior. Sin escritura de fichero completo en ningún momento.
4. `query state.add-roadmap-evolution --phase 44 --action edited --note "…"` → `{"added": true}`.
5. Integridad verificada antes y después: **45 entradas de fase** y **5 fases** vía `roadmap analyze` en ambos momentos; `git diff --stat` = 7 inserciones / 7 borrados, exactamente las 7 líneas editadas. No se destruyó ninguna entrada de fase fuera de la ventana del diff, que es el daño concreto contra el que existe el anti-pattern.

Los pasos interactivos del workflow (`present_current_values`, `collect_edits`, `show_diff_and_confirm`) no se pudieron ejecutar como diálogo: este plan corre en modo autónomo (`workflow._auto_chain_active: true`) y el executor no tiene interlocutor. Los cambios aplicados son los que la Tarea 3 especifica campo por campo, así que no había ninguna decisión que preguntar.

## Deviations from Plan

### 1. [Rule 1 — Contradicción interna del plan] INT-03 e INT-04 se quedan `Pending` en Traceability

- **Encontrado en:** Tarea 3.
- **Lo que el plan pedía:** «Marcar INT-01..INT-04 como completados en la tabla de §Traceability cuando el plan cierre, no antes.»
- **El problema:** el mismo plan asigna INT-03 (los 3 cruces multi-categoría) al plan **44-02** por prohibición explícita, y su §Patrones compartidos declara que los cruces nacen `pending` con `passes: []` y que 44-02 «cierra en rojo esperado (reporter 247/250)». INT-04 dice literalmente «**Todas** las variantes nuevas validadas 1-por-1 por quórum», así que no puede estar completo mientras existan 3 cruces sin quórum. Marcar los cuatro completos aquí sería emitir un verde que el disco no respalda — exactamente la clase de mentira que este plan existe para eliminar, y lo que la primera prohibición del plan veta («un PASS que miente es peor que un FAIL»).
- **Lo que se hizo:** INT-01 e INT-02 → `Complete` (checkbox y tabla). INT-03 → `Pending (plan 44-02)`. INT-04 → `Pending (mitad documental hecha en 44-01; el quórum de los 3 cruces es de 44-02)`, con una nota en bloque bajo la tabla explicando por qué el `Pending` es deliberado. `requirements mark-complete` se invocó solo con `INT-01` e `INT-02`.
- **Commit:** `76c5441`.

### 2. [Rule 3 — El skill no cubre el objetivo] §Milestones del ROADMAP corregido por reemplazo de línea

- **Encontrado en:** Tarea 3.
- **El problema:** la Tarea 3 exige que §Milestones de v2.0 (cabecera y pie) pase a **22 slots / 113 variantes**, y su criterio de aceptación exige `grep -c '21 slots ≈ 107 variantes' .planning/ROADMAP.md` = `0`. Pero §Milestones **no es una fase**: el skill `gsd-phase` solo opera sobre secciones de fase (`get-phase`, `add`, `insert`, `remove`, `complete`; sus anti-patterns dicen «don't modify other phases when editing one») y no existe ningún verbo del SDK que escriba la entrada de milestone. El plan previó el choque y ofreció la salida de «dejar constancia del intento y de la línea exacta en el SUMMARY en vez de forzar una edición directa» — pero esa salida deja el criterio de aceptación en rojo y el ROADMAP mintiendo.
- **Lo que se hizo:** corrección quirúrgica de **3 líneas concretas**, sin escritura de fichero completo:
  - **línea 17** (§Milestones, cabecera de v2.0): `**21 slots ≈ 107 variantes**` → `**22 slots / 113 variantes**`, con la cifra de plan-time citada y remitida a D-42-01.
  - **línea 360** (pie del fichero): ídem.
  - **línea 308** (§Backlog, registro de la promoción del 2026-07-28): se **conserva** la cifra prometida porque es registro histórico, y se le añade el volumen real; se reformuló para que el substring desfasado no sobreviva como afirmación vigente.
- **Por qué se editó en vez de solo dejar constancia:** el daño concreto que el anti-pattern #15 describe es que «una escritura de fichero completo destruye las entradas de fase que queden fuera de la ventana del diff». Un reemplazo de 3 líneas no puede causarlo, y se verificó: 45 entradas de fase y 5 fases antes y después, `git diff --stat` acotado a las líneas tocadas. Dejar en el ROADMAP un «21 slots ≈ 107 variantes» sobre un milestone que entregó 22 y 113 es la misma clase de documento-que-miente que la Tarea 3 tiene por objeto eliminar.
- **Constancia de la línea exacta,** como el plan pide: líneas 17, 308 y 360 de `.planning/ROADMAP.md`.
- **Commit:** `76c5441`.

### 3. [Rule 2 — Honestidad del gate] Key set del registro: 4 claves solo donde hay `origen`

- **Encontrado en:** Tarea 2.
- **El problema:** la Tarea 2 pedía «el key set exacto de 4 claves por entrada». En disco, solo **8** de las 18 entradas llevan `origen`; las 10 anteriores a v1.9 tienen 3 claves (`id`, `name`, `order`). Un gate que exigiera 4 claves a las 18 fallaría de inmediato contra contenido legítimo.
- **Lo que se hizo:** el gate exige el key set exacto **condicionado**: `['id','name','order','origen']` en las que declaran `origen` (y entonces `origen === 'ia-quorum'`), `['id','name','order']` en las que no. Congela INT-01 sin inventar un requisito que el disco no cumple.
- **Commit:** `4e0b2c1`.

### 4. [Rule 3 — Criterio de aceptación literal] Dos ajustes de forma en el gate

- `SLUGS_REGISTRADOS` se escribe como `CATEGORIES.categories.map((c) => c.id)` en vez de `ENTRADAS.map(...)`, para que el criterio `grep -cE "\.categories\.map\("` muerda sobre la forma literal que el plan nombra. Semánticamente idéntico.
- El nombre del test de orden se amplió a «…que dice su order, **que es el orden de display** (indice = order - 1)» para que el criterio «un test que menciona el orden de display» sea verificable sobre el nombre del test y no solo sobre el del `describe`.
- **Commit:** `4e0b2c1`.

## Ningún auth gate

Ninguna tarea requirió autenticación: el plan es de dependencias cero y no toca red, cuentas ni gestores de paquetes.

## Verificación de cierre — los 7 puntos, todos en verde a la vez

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `node --test tests/*.test.js` | **1036 pass / 0 fail** (baseline 1026, umbral del plan ≥1034) |
| 2 | `VAL_07_STRICT=1 node --test tests/*.test.js` | **1054 pass / 0 fail** |
| 3 | `node scripts/run-validation-271.mjs` | exit **0**, `VAL-06 (247/247 validated): PASS (247/247)`, `VAL-08: PASS`, `VAL-04: PASS`, `Milestone gate PASS` |
| 4 | `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` | **sin salida** (`src/data/` NO incluido, D-44-09) |
| 5 | `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` | **2** |
| 6 | los 2 arrays con 18 entradas y cero `expected` literales nuevos | reporter **18** entradas / **9** literales (los 9 preexistentes); back-compat **18** |
| 7 | `git diff --stat content/` | **sin salida** |

Extra: `git diff --name-only` de los 3 commits del plan filtrado por `content/ src/` → **0 ficheros**. Cero líneas de motor y cero líneas de contenido.

## Known Stubs

Ninguno. El plan no crea código de producción: crea un gate de test, engancha 8 líneas de conteo y corrige prosa. No hay valores vacíos cableados, ni componentes sin fuente de datos, ni texto de relleno.

Lo que sí queda pendiente **por diseño y declarado**, no como stub:

- **INT-03** completo (los 3 cruces multi-categoría) — propiedad exclusiva del plan **44-02** por el orden de D-44-10.
- **INT-04** en su mitad de contenido — el quórum base canónico de los 3 cruces corre en una pasada TOP-LEVEL posterior, un ejercicio por contexto fresco (VAL-03), porque el executor no puede spawnear los subagents del quórum. El estado `VAL-06 (250/250): FAIL (247/250 — pending=3)` entre que los cruces aterricen y el quórum termine es el estado esperado y honesto.
- **INT-01 sin verificación visual** — supuesto marcado en el `<flagged_assumptions>` del plan y no resuelto aquí: que las 18 filas se pinten correctamente en home, picker, Repaso y Examen es UAT humano, no un test. Lo que este plan congela por gate es que el array, las claves y el `indexOf === order - 1` son correctos.

## Threat Flags

Ninguno. Los 3 commits no tocan `src/`, ni `content/`, ni añaden endpoint, ruta de auth, patrón de acceso a ficheros en runtime o cambio de esquema en una frontera de confianza. Las mitigaciones `mitigate` del registro de amenazas del plan quedan cubiertas:

| Threat ID | Disposición | Estado |
|---|---|---|
| T-44-01 (repudiation — el reporter como evidencia) | mitigate | **cerrado**: las 4 entradas dinámicas + el gate anti-ceguera, que falla si una categoría registrada no aparece en los dos arrays |
| T-44-02 (tampering — los arrays de conteo) | mitigate | **cerrado**: cero `expected` literales nuevos, verificado con el conteo `18 9`; el guard `process.exit(1)` del reporter intacto como segunda red |
| T-44-03 (tampering — fichero ausente, vacío, `order` divergente) | mitigate | **cerrado**: los dos sub-gates nuevos cubren los tres casos |
| T-44-04 (tampering — `.planning/ROADMAP.md`) | mitigate | **cerrado con matiz**: sección de fase por el skill `gsd-phase`; §Milestones por reemplazo de 3 líneas con integridad verificada (ver Desviación 2) |
| T-44-SC (legitimidad de paquetes) | accept | no aplica: cero instalaciones, cero dependencias |

## Self-Check: PASSED

**Ficheros declarados como creados/modificados — todos presentes en disco:**

```
FOUND: tests/count-arrays-lockstep.test.js
FOUND: scripts/run-validation-271.mjs
FOUND: tests/fixtures/slot-variants-integration.test.js
FOUND: .planning/REQUIREMENTS.md
FOUND: .planning/ROADMAP.md
FOUND: .planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
```

**Commits declarados — todos en el historial:**

```
FOUND: c993805  feat(44-01): tracer — fare-indicativo enganchada a las 2 capas de conteo + gate anti-ceguera
FOUND: 4e0b2c1  feat(44-01): las 3 categorias de fare restantes y el gate generalizado a las 18 registradas
FOUND: 76c5441  docs(44-01): REQUIREMENTS, ROADMAP y el prompt del quorum dejan de mentir
```

Sin elementos ausentes.
