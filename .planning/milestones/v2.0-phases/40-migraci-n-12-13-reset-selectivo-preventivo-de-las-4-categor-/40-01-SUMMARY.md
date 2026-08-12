---
phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-
plan: 01
subsystem: database
tags: [localstorage, schema-migration, json, backup, node-test, es-modules]

# Dependency graph
requires:
  - phase: 35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-
    provides: "`migrate11to12` / `hydrateV12` / `RESET_PREFIXES_V12` — el eslabón v1.9 que esta fase espeja una versión más arriba, y `CURRENT_SCHEMA_VERSION = 12` como punto de partida"
provides:
  - "`CURRENT_SCHEMA_VERSION = 13` espejado en `src/data/storage.js` y `src/data/backup.js`"
  - "`migrate12to13` — eslabón puro, idempotente y anti-prototype-pollution que resetea selectivamente por prefijo el progreso de las 4 categorías de `fare`"
  - "`hydrateV13` — hidratación shape-only del state v13 (sin poda), cola de la cadena de migración"
  - "`RESET_PREFIXES_V13` — el contrato de slugs del milestone v2.0 congelado en código, con el gate de no-colisión, el solape `fare-ind` y la convención de ids de cruce D-40-07 documentados en su comentario de bloque"
  - "Cadena de import de backup extendida a v12→v13 con rechazo de wrappers > 13"
  - "25 tests nuevos (bloques v13 en `tests/data-storage.test.js` y `tests/backup.test.js`) — suite en 697 pass / 0 fail"
affects: [41-fare-indicativo, 42-fare-congiuntivo, 43-fare-cond-imperativo-indefiniti, 44-integracion-categories-json-cruces]

actuals:
  tokens: 14891
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Reset selectivo por prefijo `startsWith` en el eslabón de migración, aplicado ANTES de dar de alta contenido"
    - "Deep-clone defensivo por sub-dict (`JSON.parse(JSON.stringify(x))` con type-guard) + root literal fresco"
    - "`CURRENT_SCHEMA_VERSION` espejado en `storage.js` y `backup.js`, nunca desincronizado"
    - "Comentario de bloque acumulativo: se APENDIZA una frase por fase, nunca se reescribe la historia"

key-files:
  created: []
  modified:
    - src/data/storage.js
    - src/data/backup.js
    - tests/data-storage.test.js
    - tests/backup.test.js

key-decisions:
  - "D-40-01 confirmado por el autor sin enmienda: los 4 slugs quedan verbatim (`fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti`), con la abreviatura `cond` intencional"
  - "El fixture de no-regresión cubre 14 categorías legacy (`CATORCE_LEGACY`), no 10 — las 4 de v1.9 ya son legacy para v2.0"
  - "El fixture `stateV12()` del bloque de Phase 35 se deja declarado en 12 (y su aserción de `wrapper.schemaVersion` en 12), siguiendo la convención del codebase para bloques de versión intermedia; solo bumpean las aserciones de fin-de-cadena"
  - "`NaN` como `schemaVersion` se verifica en el guard de tipo, no en el de entero: `JSON.stringify(NaN)` emite `null`, así que NaN no sobrevive a JSON. El no-finito alcanzable por JSON (`1e999` → Infinity) sí se verifica contra el guard de entero"

patterns-established:
  - "Contrato de slugs del milestone escrito en el comentario de `RESET_PREFIXES_V13`: es el sitio donde Phase 44 lo verá cuando le importe por qué"
  - "Test tracer end-to-end (`parseBackupFile` de un wrapper v12) como primer eslabón verificado antes de expandir la cobertura"

requirements-completed: [MIG-01, MIG-02]

coverage:
  - id: D1
    description: "`migrate12to13` resetea selectivamente por prefijo el progreso de las 4 categorías de `fare` (categoryProgress + exerciseStats + inFlightTest), dejándolas `no-hecha` con racha 0"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 borra categoryProgress de los 4 slugs nuevos y deja las 14 legacy intactas"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 poda exerciseStats con los 4 prefijos nuevos y preserva las 14 legacy"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 invalida inFlightTest que referencia un id de slug nuevo mezclado con uno legacy"
        status: pass
    human_judgment: false
  - id: D2
    description: "El solape textual `fare-ind` entre `fare-indicativo` y `fare-indefiniti` es inocuo: ambos se resetean y ninguna legacy se borra como efecto colateral"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 resetea AMBOS slugs del solape `fare-ind` (fare-indicativo y fare-indefiniti) sin tocar ninguna legacy"
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#tracer: import de un wrapper v12 con progreso de fare-indicativo y fare-indefiniti sale en v13 reseteado, con las legacy intactas"
        status: pass
    human_judgment: false
  - id: D3
    description: "Las 14 categorías legacy y `songProgress` quedan byte-intactas tras migrar (snapshot deepEqual pre/post por categoría)"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "tests/data-storage.test.js#no-regresión: las 14 legacy + songProgress quedan byte-idénticas, los 4 slugs nuevos ausentes"
        status: pass
    human_judgment: false
  - id: D4
    description: "`migrate12to13` y `hydrateV13` son puros, idempotentes y anti-prototype-pollution; los sub-dicts corruptos caen a `{}`"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 es idempotente (re-ejecutar sobre un v13 ya migrado da la misma shape)"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 es puro (no muta el input — los 4 slugs siguen presentes en el v12 original)"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 anti-prototype-pollution: __proto__ own-property no contamina el global"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#hydrateV13 anti-prototype-pollution: __proto__ own-property no contamina el global"
        status: pass
      - kind: unit
        ref: "tests/data-storage.test.js#migrate12to13 con sub-dict no-objeto (corrupto) cae a {}"
        status: pass
    human_judgment: false
  - id: D5
    description: "`hydrateV13` es shape-only: preserva un slug de `fare` si llega ya v13-shaped y deep-clona cada sub-dict"
    requirement: MIG-01
    verification:
      - kind: unit
        ref: "tests/data-storage.test.js#hydrateV13 es espejo de hydrateV12 (versión 13) SIN poda — preserva un slug nuevo si está presente"
        status: pass
    human_judgment: false
  - id: D6
    description: "`backup.js` hace round-trip v13 (export → import) preservando el progreso legacy, e importa un wrapper v12 aplicando el reset de `fare`"
    requirement: MIG-02
    verification:
      - kind: integration
        ref: "tests/backup.test.js#round-trip v13: export (buildBackupWrapper) → import (parseBackupFile) sin \"versión más nueva\""
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#round-trip v13 preserva el progreso de las categorías legacy intacto"
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#import de backup v12 → state v13 con fare-indicativo/fare-indefiniti reseteadas (D-40-11 / MIG-02)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Fronteras de versión: wrappers 12 y 13 se aceptan (salen en 13), 14 se rechaza con \"versión más nueva\"; los guards de `schemaVersion` ausente / no numérico / no entero siguen disparando tras el bump"
    requirement: MIG-02
    verification:
      - kind: integration
        ref: "tests/backup.test.js#frontera de versión: wrappers 12 y 13 se aceptan (salen en 13), 14 se rechaza con \"versión más nueva\""
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#rejects future schemaVersion > 13 (menciona \"versión más nueva\")"
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#schemaVersion ausente, null, cadena o NaN → \"falta o no es número\""
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#schemaVersion no entero o < 1 (12.5, 13.5, 0, -1) → \"schemaVersion inválido\", nunca alcanza el dispatcher"
        status: pass
      - kind: integration
        ref: "tests/backup.test.js#schemaVersion no finito (1e999 → Infinity) → \"schemaVersion inválido\""
        status: pass
    human_judgment: false
  - id: D8
    description: "El comentario de bloque de `RESET_PREFIXES_V13` documenta el contrato transversal (D-40-02), el gate de no-colisión con las 14 legacy (D-40-03), el solape `fare-ind` (D-40-05) y la convención de ids de cruce vinculante para Phase 44 (D-40-07)"
    verification: []
    human_judgment: true
    rationale: "Es prosa técnica destinada a que un humano (o el planner de la Phase 44) la lea y la obedezca. Ningún test puede comprobar que dice lo correcto ni que resulta comprensible; solo se puede verificar por lectura."

# Metrics
duration: 24min
completed: 2026-08-03
status: complete
---

# Phase 40 Plan 01: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) Summary

**`schemaVersion` sube a 13 con `migrate12to13` + `hydrateV13`: reset selectivo por prefijo de las 4 categorías de `fare` (puro, idempotente, anti-prototype-pollution), espejado en `backup.js` con round-trip v13, import `v12→v13` y rechazo de wrappers > 13 — las 14 categorías legacy y `songProgress` quedan byte-intactas.**

## Performance

- **Duration:** ~24 min
- **Started:** 2026-08-03T10:21:00Z (checkpoint de Task 1 resuelto → reanudación en Task 2)
- **Completed:** 2026-08-03T10:44:32Z
- **Tasks:** 3 de 4 ejecutadas por este agente (Task 1 era el checkpoint de decisión, resuelto por el autor con `confirmar`)
- **Files modified:** 4

## Accomplishments

- **`CURRENT_SCHEMA_VERSION` a 13**, espejado sin deriva en `src/data/storage.js` y `src/data/backup.js`, con el dispatcher de `migrate()` extendido (`… === 12 → migrate12to13`, `… === 13 → hydrateV13`) y el `console.warn` de versión desconocida intacto como cola.
- **`RESET_PREFIXES_V13` congela el contrato de slugs del milestone v2.0** (los 4 slugs completos, nunca truncados), con un comentario de bloque que documenta los cuatro puntos exigidos: contrato transversal (D-40-02), gate de no-colisión con las 14 categorías registradas (D-40-03), el solape interno `fare-ind` y por qué es inocuo (D-40-05), y la convención de ids de cruce multi-categoría vinculante para Phase 44 (D-40-07).
- **`migrate12to13`**: los 3 pasos del patrón (delete en bracket notation de los 4 slugs en `categoryProgress`, poda por prefijo de `exerciseStats`, invalidación condicional de `inFlightTest`), cada uno tras deep-clone defensivo por sub-dict, devolviendo un root literal fresco. **`hydrateV13`** shape-only, sin poda, con guard de root.
- **`backup.js`**: import de los dos símbolos nuevos, frase de Phase 40 apendizada al comentario acumulativo, cadena de import extendida a `v12→v13` y cola `hydrateV13`. El rechazo de versión futura no necesitó edición — es genérico contra la constante y empezó a rechazar `> 13` solo con el bump.
- **25 tests nuevos** repartidos en tres bloques: el tracer end-to-end en `tests/backup.test.js`, el bloque v13 de la cadena de migración en `tests/data-storage.test.js` (14 tests, incluido el de no-regresión con snapshot `deepEqual` de las 14 legacy y `songProgress`) y el bloque v13 de backup (7 tests: round-trip, import cross-version, fronteras 12/13/14 y los guards de `schemaVersion`).
- **Suite: 697 pass / 0 fail** (baseline 672). El motor queda sin tocar: `git diff --stat src/screens/app.js src/domain/` vacío.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: Congelar el contrato de slugs de `fare` (D-40-01)** — checkpoint de decisión, sin ficheros ni commit. El autor respondió `confirmar`: los 4 slugs quedan verbatim, sin enmienda, y ROADMAP.md / REQUIREMENTS.md no se tocan.
2. **Task 2: Eslabón `12→13` end-to-end — `storage.js` + `backup.js` + test tracer** — `bf57840` (feat)
3. **Task 3: Bloque de tests v13 de la cadena de migración en `tests/data-storage.test.js`** — `c520806` (test)
4. **Task 4: Bloque de tests v13 de backup — round-trip, import `v12→v13` y fronteras de versión** — `91d9cd6` (test)

## Files Created/Modified

- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION = 13`, dos líneas nuevas en el dispatcher `migrate()`, y al final del fichero `RESET_PREFIXES_V13` con su comentario de bloque, `migrate12to13` y `hydrateV13` con sus JSDoc.
- `src/data/backup.js` — import de `migrate12to13` / `hydrateV13`, frase de Phase 40 apendizada al comentario acumulativo, `CURRENT_SCHEMA_VERSION = 13`, y el eslabón `v12→v13` + cola `hydrateV13` en la cadena de import.
- `tests/data-storage.test.js` — import ampliado, 6 aserciones de fin-de-cadena / `blankState()` re-apuntadas a 13, y el bloque `describe` v13 completo (14 tests) con `RESET_NEW_V13`, `CATORCE_LEGACY` y la factory `v12WithNewFour()`.
- `tests/backup.test.js` — 16 aserciones de fin-de-cadena re-apuntadas a 13, la frontera de versión futura movida a `> 13` / `14`, el `describe` del tracer, y el `describe` v13 con `stateV13()`, `stateV12WithFare()`, fronteras y guards.

## Decisions Made

- **Los 4 slugs quedan verbatim** (`fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti`). El autor confirmó D-40-01 en el checkpoint de Task 1 sin enmienda; la abreviatura `cond` del tercero es intencional para que no haya deriva entre ROADMAP.md / REQUIREMENTS.md y el código. Consecuencia: la valla de scope de D-40-06 se mantiene en exactamente 4 ficheros.
- **El fixture `stateV12()` del bloque de Phase 35 se deja en 12.** Ver deviación 1: la convención del codebase para bloques de versión intermedia es que el fixture y la aserción de `wrapper.schemaVersion` conserven SU versión, y solo bumpee la aserción de fin-de-cadena. Así el bloque de Phase 35 pasa a ser un test genuino de import cross-version `v12→v13`, y el round-trip real de v13 lo cubre el bloque nuevo de Task 4.
- **`NaN` se verifica en el guard de tipo, no en el de entero.** `JSON.stringify(NaN)` emite `null`, así que un `schemaVersion: NaN` nunca llega al guard `Number.isInteger`: lo caza antes `typeof state.schemaVersion !== 'number'`. Para no dejar el caso no-finito sin cubrir se añadió un test con JSON crudo `1e999`, que sí parsea a `Infinity` y sí alcanza el guard de entero.
- **El comentario de bloque de `backup.js` se apendiza, no se reescribe** (D-40-05): la frase de Phase 40 va al final de la cadena histórica, en la misma voz que la de Phase 35.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] El plan pedía declarar el fixture `stateV12()` en 13 y bumpear `assert.equal(wrapper.schemaVersion, 12)` a 13 — habría roto el test y contradicho la prohibición del propio plan**

- **Found during:** Task 2 (re-apuntado mecánico de `tests/backup.test.js`)
- **Issue:** El punto 11 del `<action>` de Task 2 enumeraba las líneas 645 (fixture `schemaVersion: 12` de `stateV12()`) y 668 (`assert.equal(wrapper.schemaVersion, 12, 'el wrapper espeja state.schemaVersion=12')`) entre las que debían pasar a 13. Pero `buildBackupWrapper` copia `state.schemaVersion` tal cual: si el fixture se declara en 13 y la aserción se bumpea, el test deja de comprobar lo que su nombre dice (`round-trip v12`) y duplica el round-trip v13 que Task 4 añade. Además, la propia `must_haves.prohibitions` del plan dice: *"No se modifican las aserciones de los `describe` de versiones intermedias que comprueban su PROPIA versión — solo bumpean las de fin-de-cadena"*. Verificado contra el precedente en disco: el bloque análogo de Phase 29 conserva `stateV11()` en 11 y su `assert.equal(wrapper.schemaVersion, 11)`, con solo la aserción de fin-de-cadena bumpeada.
- **Fix:** Se dejaron las líneas 645 y 668 en 12 y se bumpearon solo las 16 aserciones de fin-de-cadena (`r.state.schemaVersion` / `result.state.schemaVersion` / el `blankState()` de la línea 93). El bloque de Phase 35 queda así como un test real de import cross-version `v12 → v13`, en línea con lo que Phase 35 hizo con el bloque de Phase 29.
- **Files modified:** `tests/backup.test.js`
- **Verification:** `node --test tests/backup.test.js` → 0 fails; suite completa 697 pass / 0 fail.
- **Committed in:** `bf57840` (commit de Task 2)

**2. [Rule 1 - Bug] El caso `NaN` del edge probe de precisión es inalcanzable a través de JSON**

- **Found during:** Task 4 (tests de guards de `schemaVersion`)
- **Issue:** Un `must_haves.truth` y el `<behavior>` de Task 4 pedían que `schemaVersion: NaN` devolviera `reason` casando `/schemaVersion inválido/`. Es falso por construcción: `parseBackupFile` recibe un string y `JSON.stringify(NaN)` produce `null`, de modo que tras el `JSON.parse` el valor es `null` y dispara un guard anterior (`typeof … !== 'number'` → *"falta o no es número"*). `NaN` tampoco es un literal JSON válido, así que no hay forma de escribirlo en un fichero de backup real.
- **Fix:** `NaN` se movió al test del guard de tipo (documentando en comentario POR QUÉ cae ahí), el bucle de precisión quedó en `[12.5, 13.5, 0, -1]`, y se añadió un test extra con JSON crudo `"schemaVersion":1e999` — que sí parsea a `Infinity`, sí es JSON válido y sí alcanza el guard `Number.isInteger`. La intención del edge probe (un `schemaVersion` no finito no debe hidratarse silenciosamente a 13) queda cubierta con un caso alcanzable.
- **Files modified:** `tests/backup.test.js`
- **Verification:** los dos tests pasan; el de precisión asserta además `r.state === undefined` para probar que no alcanza el dispatcher.
- **Committed in:** `91d9cd6` (commit de Task 4)

**3. [Rule 1 - Bug] Criterio de aceptación `grep -c "migrate12to13" src/data/backup.js` = 2 — el valor correcto es 3**

- **Found during:** Task 2 (verificación de criterios de aceptación)
- **Issue:** El criterio esperaba 2 apariciones (import + despacho). Pero el punto 7 del mismo `<action>` obliga a apendizar al comentario de bloque acumulativo una frase que NOMBRA `migrate12to13`, lo que suma una tercera línea. El criterio y la acción se contradicen entre sí.
- **Fix:** Ninguno en el código — se verificó contra el analog: `grep -c "migrate11to12" src/data/backup.js` también devuelve 3, por la misma razón (comentario + import + despacho). El valor observado (3) es el correcto y coherente con el precedente; el criterio del plan estaba desfasado en uno.
- **Files modified:** ninguno
- **Verification:** `grep -c 'migrate11to12' src/data/backup.js` → 3; `grep -c 'migrate12to13' src/data/backup.js` → 3.
- **Committed in:** n/a (no requirió cambio de código)

---

**Total deviations:** 3 auto-fixed (3 de Rule 1 — bugs de plan-time detectados contra el código real).
**Impact on plan:** Ninguna deriva de alcance. Las tres desviaciones son correcciones de instrucciones del plan que, aplicadas literalmente, habrían dejado un test rojo (1), un test imposible de escribir (2) o un criterio de aceptación imposible de cumplir (3). Los objetivos, requisitos y success criteria del plan se cumplen íntegros.

## Issues Encountered

- **La trampa anunciada se materializó exactamente como estaba previsto:** el test `rejects future schemaVersion > 12` usaba un fixture en 13, que dejó de ser "futuro" en cuanto la constante subió. Se movió a `> 13` / `14` dentro del mismo commit del bump, así que la suite nunca pasó por rojo entre commits.
- **`hydrateV12` queda importado pero sin usar en `src/data/backup.js`** tras cambiar la cola de la cadena a `hydrateV13`. Es el comportamiento establecido del fichero (`hydrateV7`, `hydrateV8`, `hydrateV9`, `hydrateV11` están igual): el import plano conserva la cadena histórica completa. No se tocó.

## User Setup Required

None — no external service configuration required. El proyecto es web estática de dependencias cero; los tests corren con el runner nativo de Node (`node --test tests/*.test.js`).

## Next Phase Readiness

- **Phases 41-43 (contenido) desbloqueadas.** El terreno está limpio: las 4 categorías de `fare` nacerán sin progreso espurio, y sus slugs están congelados en código. Las Phases 41-44 DEBEN usar exactamente los strings `fare-indicativo`, `fare-congiuntivo`, `fare-cond-imperativo`, `fare-indefiniti` como nombre de fichero (`content/exercises/<slug>.json`), `id` en `categories.json` y prefijo de ids de slot.
- **Phase 44 tiene su contrato escrito donde lo va a ver:** la convención de ids de cruce multi-categoría (D-40-07) está en el comentario de `RESET_PREFIXES_V13` — cruces en el fichero de la categoría de `fare`, id con prefijo de `fare`, `categoryIds` con el slug de `fare` PRIMERO. Un cruce autorado bajo el prefijo legacy quedaría fuera del reset.
- **Sin blockers.** `content/categories.json` sigue con 14 entradas (D-40-06: registrar las 4 nuevas es trabajo de Phase 44), y las discrepancias de conteo VAL-06 preexistentes de `genero-numero` y `preposiciones` siguen fuera de scope (D-40-12).

## Self-Check: PASSED

- Ficheros verificados en disco: `src/data/storage.js`, `src/data/backup.js`, `tests/data-storage.test.js`, `tests/backup.test.js`, `40-01-SUMMARY.md` — los 5 presentes.
- Commits verificados en `git log`: `bf57840`, `c520806`, `91d9cd6` — los 3 presentes.
- `node --test tests/*.test.js` → 697 pass / 0 fail.
- `git diff --stat src/screens/app.js src/domain/` → vacío.
- Sin stubs, sin tests skipped, sin `<verify>` sin ejecutar.

---
*Phase: 40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-*
*Completed: 2026-08-03*
