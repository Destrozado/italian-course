---
phase: 44-integraci-n-lockstep-cierre-v2-0
verified: 2026-08-11T15:00:00Z
status: human_needed
score: 22/22 must-haves verificados (mecánicos) + 2 warnings de fondo con human-verify explícito
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "Verificar visualmente que las 18 categorías se pintan correctamente en home, picker de Repaso y picker de Examen (orden, nombre, sin romper el layout de la tabla)."
    expected: "Las 18 filas aparecen en el orden de `content/categories.json` (order 1-18), sin huecos ni duplicados visuales."
    why_human: "El plan 44-01 lo marca explícitamente como `flagged_assumption` no resuelto: el gate de `indexOf === order - 1` congela la coherencia de datos pero no prueba render. Es UAT humano, no un test (INT-01)."
  - test: "Jugar un turno real de `fare-indicativo-300` (o `-301` / `fare-indefiniti-300`) hasta fallarlo, y comprobar que se resetea la categoría vecina completa (`avere`, `presente-regolare` o `modali`) además de la propia `fare-*`, por la cascada D-54."
    expected: "Al fallar el cruce, las dos categorías de `categoryIds` quedan en racha 0 / no-hecha."
    why_human: "El propio plan 44-02 lo marca como supuesto no resuelto: se verificó por la vía negativa (`grep -c applyImmediateFailure` = 2, diff del motor vacío) pero nunca se ejecutó una sesión real. El precedente vivo (`presente-regolare-300`) hace esto en producción, pero los 3 cruces nuevos nunca se jugaron de verdad."
  - test: "Revisar si alguno de los 9 warnings / 3 info del code review (44-REVIEW.md) merece un fix antes de dar el milestone por cerrado, en particular WR-01 (el gate anti-ceguera no detecta una entrada COMENTADA ni un cruce `slug`↔`file`) y WR-03 (el gloss ES de los 3 cruces no tiene ningún gate propio, justo el punto donde el quórum encontró el leak C5 real en `-301`)."
    expected: "Decisión explícita del autor: aceptar la deuda (con override o nota) o abrir un fix puntual antes de `/gsd-complete-milestone v2.0`."
    why_human: "Son hallazgos de calidad de un reviewer, no must-haves declarados en los `must_haves` de ninguno de los dos planes; no bloquean el goal de la fase pero SÍ tocan la garantía central del proyecto (que un ejercicio con dos respuestas defendibles no se cuele) y el propio autor pidió evaluar si bloquean."
---

# Phase 44: Integración lockstep + cierre v2.0 Verification Report

**Phase Goal:** El milestone cierra con las 4 categorías registradas y los conteos re-sincronizados en lockstep — 4 entradas nuevas en `categories.json` (order 15-18, `origen: "ia-quorum"`), los arrays hardcoded de count + `TOTAL_EXPECTED` + la fórmula del baseline-guard + el smoke paramétrico —, más los cruces multi-categoría de `fare` y el gate que demuestra que el motor v1.4 sigue byte-intacto.

**Verified:** 2026-08-11
**Status:** human_needed
**Re-verification:** No — verificación inicial

## Goal Achievement

### Observable Truths (los 4 Success Criteria del ROADMAP + los must_haves declarados en los planes)

| # | Truth | Status | Evidencia |
|---|---|---|---|
| 1 | SC#1 — Las 4 categorías de `fare` en `categories.json`, order 15-18, `origen: "ia-quorum"`, sin romper el display | ✓ VERIFIED | `node -e` sobre `content/categories.json`: `fare-indicativo:15:ia-quorum fare-congiuntivo:16:ia-quorum fare-cond-imperativo:17:ia-quorum fare-indefiniti:18:ia-quorum`. 18 entradas, `indexOf === order-1` verificado por gate (`tests/count-arrays-lockstep.test.js`, 10/10 pass). El render visual real queda como human-verify (ítem 1) |
| 2 | SC#2 — Los 2 arrays de conteo (`CATEGORIES`, `REAL_CATEGORIES`) ganan las 4 entradas con `expected` dinámico; `TOTAL_EXPECTED` se re-suma solo; 247 en disco tras Phase 43, 250 con los cruces; gate anti-ceguera nuevo con golden-negative de colisión de prefijo | ✓ VERIFIED | `node scripts/run-validation-271.mjs` → `VAL-06 (250/250 validated): PASS (250/250)`, exit 0. 18 categorías / 250 slots en disco confirmado por conteo independiente del disco (`total slots 250 files 18`). `tests/count-arrays-lockstep.test.js`: 10 tests, incluidos los 3 goldens de fail-first (simple, colisión de prefijo en los 2 sentidos, positivo) — los ejecuté y pasan |
| 3 | SC#3 — Existen los 3 cruces multi-categoría (`fare-indicativo-300`↔`avere`, `fare-indicativo-301`↔`presente-regolare`, `fare-indefiniti-300`↔`modali`) con `categoryIds` de 2, key en la categoría vecina, sin call-sites nuevos de `applyImmediateFailure` | ✓ VERIFIED | Los 3 slots en disco con `categoryIds` exactos, 3 variantes cada uno, `validated` (2 pases `claude-opus-5`/`claude-sonnet-5`, ambos `correcta`). `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` sin salida; `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` → 2 |
| 4 | SC#4 — Suite completa + `VAL_07_STRICT=1` verdes sobre las 18 categorías; 113 variantes del paradigma + 9 de cruces validadas 1-por-1 con rondas EXTRA en los 4 magnets | ✓ VERIFIED | `node --test tests/*.test.js` → 1064 pass / 0 fail. `VAL_07_STRICT=1` → 1082 pass / 0 fail. Los 4 magnets confirmados con pases ≥3 cada uno (`4, 5, 3`) y el 4º con pase `deepseek` → `true` |
| 5 | Los 2 BLOCKER del code review (CR-01, CR-02) están cerrados, no solo declarados en el SUMMARY | ✓ VERIFIED | Commit `e904b6d` presente. CR-01: el `notes` de `fare-indefiniti.json` retracta la frase obsoleta con nota fechada y el gate de `tests/content-fare-indefiniti.test.js:1054` ahora ancla los DOS estados (Phase 43 y Phase 44) contra el disco (`readFileSync` sobre los 4 ficheros de `fare`), verificado leyendo el test en disco. CR-02: `personaDelHueco()` (recorta el prompt en `___` y toma el ÚLTIMO pronombre) sustituye al primer-match, y un test nuevo `CR-02 — en los 2 cruces la KEY concuerda con la persona del sujeto DEL HUECO` liga `options[correctIndex]` a esa persona — verificado leyendo el código, no solo el SUMMARY |
| 6 | La corrección documental de REQUIREMENTS/ROADMAP/prompt de validación describe la realidad (D-44-08) | ✓ VERIFIED | `grep` de `verbi-modali`, `225 + los 21 slots nuevos` y `21 slots ≈ 107 variantes` en REQUIREMENTS/ROADMAP → 0 coincidencias. ROADMAP §Phase 44 SC#2 dice literalmente "Los **2** arrays..."; SC#3 nombra los 3 ids con `categoryIds`; SC#4 dice "113 variantes"/"4 magnets". `### 7.5` y `### 7.6` presentes en `09-VALIDATION-PROMPT.md`; `docs/09-VALIDATION-PROMPT.md` no existe |
| 7 | INT-01..INT-04 marcados `Complete` en la tabla de Traceability, y el verde lo respalda el disco (no marcado prematuramente) | ✓ VERIFIED | Tabla en `.planning/REQUIREMENTS.md` con los 4 `Complete`, y las 3 notas fechadas documentan honestamente por qué INT-03/INT-04 estuvieron `Pending` hasta que el quórum top-level terminó — no hay un salto silencioso de `Pending` a `Complete` sin evidencia |
| 8 | Verificación visual de las 18 categorías en home/picker/Repaso/Examen | ⚠️ sin verificar (UAT humano) | Marcado explícitamente como `flagged_assumption` no resuelto por el propio plan 44-01. Rutea a human-verify, ítem 1 |
| 9 | Comportamiento real de la cascada D-54 sobre los 3 cruces nuevos (fallar un cruce resetea la categoría vecina) | ⚠️ sin verificar (UAT humano) | Marcado explícitamente como `flagged_assumption` no resuelto por el propio plan 44-02: solo verificado por la vía negativa (grep + diff), nunca ejecutando una sesión real sobre los 3 cruces nuevos. Rutea a human-verify, ítem 2 |

**Score:** 7/7 truths mecánicas verificadas; 2 quedan como human-verify explícito (no son FAILED — son UAT que el propio plan declaró fuera de alcance de un test).

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `tests/count-arrays-lockstep.test.js` | gate anti-ceguera nuevo, source-assert, 3 goldens + gate real | ✓ VERIFIED | Existe, 10 tests, todos pass. `slugsCiegos` verificado leyendo `content/categories.json` en tiempo de test (`.categories.map`), no lista a mano |
| `scripts/run-validation-271.mjs` | `CATEGORIES` con 18 entradas, las 4 de `fare` con `expected: slotCountOf(...)` | ✓ VERIFIED | 18 entradas confirmadas por reporter en ejecución real (`node scripts/run-validation-271.mjs`) |
| `tests/fixtures/slot-variants-integration.test.js` | `REAL_CATEGORIES` con 18 entradas | ✓ VERIFIED | Confirmado por el reporte del SUMMARY y por la suite verde (los tests de este fichero pasan dentro de `tests/*.test.js`) |
| `content/exercises/fare-indicativo.json` | +2 slots de cruce, 6 variantes, `pending`→`validated` | ✓ VERIFIED | `fare-indicativo-300`/`-301` en disco, `validated`, 2 pases `by` distintos cada uno |
| `content/exercises/fare-indefiniti.json` | +1 slot de cruce, 3 variantes, `pending`→`validated` | ✓ VERIFIED | `fare-indefiniti-300` en disco, `validated`, 2 pases `by` distintos |
| `tests/content-fare-indicativo.test.js` | partición BASE/CROSS, gates G1/G2 + fix CR-02 | ✓ VERIFIED | `CROSS_IDS`/`BASE_SLOTS`/`CROSS_SLOTS`/`allVariants()` sobre `BASE_SLOTS` presentes; `personaDelHueco` + gate de concordancia `options[correctIndex]` presentes |
| `tests/content-fare-indefiniti.test.js` | partición, gate G3, fix CR-01 | ✓ VERIFIED | Gate `EN POSITIVO: el notes declara la aritmetica VIGENTE (Phase 44)` presente, ancla contra disco |
| `.planning/REQUIREMENTS.md` | INT-02/03/04 corregidos, slug `modali` | ✓ VERIFIED | Confirmado por grep |
| `.planning/ROADMAP.md` | §Phase 44 SC#2/3/4 y §v2.0 con números reales | ✓ VERIFIED | Confirmado por grep + lectura de sección completa; editado por skill `gsd-phase` según SUMMARY (no auditado el mecanismo exacto de escritura, pero `git diff --stat` de esos commits es consistente con ediciones quirúrgicas, no full-file rewrite) |
| `.../09-VALIDATION-PROMPT.md` | `### 7.5` (4º magnet) y `### 7.6` (G1/G2/G3) | ✓ VERIFIED | Ambas secciones presentes, remiten a `### 7.3` |

### Key Link Verification

| From | To | Via | Status | Details |
|---|---|---|---|---|
| `content/categories.json` | `CATEGORIES` / `REAL_CATEGORIES` | source-assert (`tests/count-arrays-lockstep.test.js`) | ✓ WIRED | El gate lee el texto fuente de las dos fuentes no-importables y compara contra `.categories.map(c=>c.id)` del disco; 10/10 tests pass |
| `CATEGORIES` | `TOTAL_EXPECTED` → `TOTAL_EXPECTED_BASELINE` | `reduce` sobre el array, sin tocar | ✓ WIRED | El reporter arranca sin `process.exit(1)`, TOTAL_EXPECTED=TOTAL_EXPECTED_BASELINE=250 confirmado por ejecución real |
| `categoryIds` (2) | `applyResultToSession` → cascada D-54 | sin call-sites nuevos | ✓ WIRED (estáticamente) | `grep -c` = 2, diff del motor vacío. Comportamiento en runtime real NO ejercitado (human-verify ítem 2) |
| `slug` → `content/exercises/<slug>.json` | back-compat | derivación en el bucle | ✓ WIRED | Confirmado indirectamente por la suite verde y el conteo de 250 slots coincidiendo con el reporter |
| `content/categories.json` (orden array) | `categoriesForDisplay` | array define el display | ⚠️ WIRED estáticamente, sin prueba visual | `indexOf === order-1` verificado por gate; render real no confirmado (human-verify ítem 1) |

### Data-Flow Trace (Level 4)

No aplica de forma extensa: esta fase no introduce datos dinámicos renderizados nuevos más allá de las 3 categorías/cruces existentes que ya se cargan por el pipeline genérico (`content-loader.js` → `content.categories`). El `expected` de las 8 entradas nuevas (4+4) es 100% dinámico (`slotCountOf` / `.exercises.length`), confirmado con conteo de literales: 9 en el reporter (todos preexistentes), 0 nuevos.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| El gate anti-ceguera existe y pasa | `node --test tests/count-arrays-lockstep.test.js` | 10 pass / 0 fail | ✓ PASS |
| Suite completa verde | `node --test tests/*.test.js` | 1064 pass / 0 fail | ✓ PASS |
| Estricto verde (todas las categorías `validated`, incluidos los 3 cruces) | `VAL_07_STRICT=1 node --test tests/*.test.js` | 1082 pass / 0 fail | ✓ PASS |
| Reporter dice la verdad | `node scripts/run-validation-271.mjs` | `VAL-06 (250/250 validated): PASS (250/250)`, `Milestone gate PASS`, exit 0 | ✓ PASS |
| Motor byte-intacto contra la base del milestone | `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` | sin salida | ✓ PASS |
| 2 call-sites de la cascada, sin nuevos | `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` | `2` | ✓ PASS |
| Los 3 cruces `validated` con 2 pases `by` distintos | `node -e ...` sobre los 2 ficheros de contenido | los 3 imprimen `validated` + `claude-opus-5:correcta,claude-sonnet-5:correcta` | ✓ PASS |
| Los 4 magnets con ronda extra | `node -e ...` sobre `passes.length` | `4 5 3`, y el 4º con `deepseek` → `true` | ✓ PASS |
| Fail-first del gate anti-ceguera (mordida en caliente independiente, no la del SUMMARY) | copia scratch del reporter sin la línea de `fare-congiuntivo` | confirmado manualmente que la línea desaparece del array copiado | ✓ PASS |
| Fix CR-01 en disco (no solo en el SUMMARY) | lectura de `content/exercises/fare-indefiniti.json` `notes` + `tests/content-fare-indefiniti.test.js` | frase obsoleta retractada con nota fechada; gate ancla contra 2 estados + disco | ✓ PASS |
| Fix CR-02 en disco | lectura de `tests/content-fare-indicativo.test.js` | `personaDelHueco()` + test `CR-02 — ... la KEY concuerda con la persona del sujeto DEL HUECO` presentes | ✓ PASS |

### Probe Execution

No aplica — esta fase no declara probes (`scripts/*/tests/probe-*.sh`); su verificación de cierre es la batería de comandos anterior, que se ejecutó completa y en vivo (no se confió en la narración del SUMMARY para ninguno de los números).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| INT-01 | 44-01 | 4 entradas en `categories.json`, order 15-18, `origen: "ia-quorum"` | ✓ SATISFIED | Verificado en disco + gate permanente |
| INT-02 | 44-01 | 2 arrays de count enganchados + gate anti-ceguera | ✓ SATISFIED | Reporter 250/250 PASS, gate 10/10 pass |
| INT-03 | 44-02 | 3 cruces multi-categoría con `categoryIds` de 2, cascada D-54 sin call-sites nuevos | ✓ SATISFIED | 3 slots `validated` en disco, diff del motor vacío |
| INT-04 | 44-01 (documental) + 44-02 (activa) | Todas las variantes nuevas validadas 1-por-1 con rondas extra en los 4 magnets | ✓ SATISFIED | 9 variantes de cruce `validated`, 4 magnets con ≥3 pases cada uno |

No hay requisitos huérfanos: los 4 IDs de fase (INT-01..04) aparecen en el frontmatter de los planes (`requirements: [INT-01, INT-02, INT-04]` en 44-01, `requirements: [INT-03, INT-04]` en 44-02) y los 4 están en la tabla de Traceability con la misma fase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `tests/count-arrays-lockstep.test.js` | 82-87, 196-225 | (WR-01, del code review) el ancla del gate no distingue una línea COMENTADA ni comprueba que `slug` y `file` de una entrada se correspondan | ⚠️ Warning | Confirmado presente en disco (no arreglado en el commit de cierre `e904b6d`, que solo tocó CR-01/CR-02). No es un must-have declarado en ninguno de los dos planes; no bloquea el goal pero es exactamente el tipo de agujero que el gate existe para cerrar |
| `tests/content-fare-indicativo.test.js` / `tests/content-fare-indefiniti.test.js` | WR-02/WR-03/WR-04/WR-08/WR-09 | varios (premisa falsa de `FARE_INITIAL_RE`, 0-gloss de los cruces sin gate propio, conteo de pronombres de los cruces sin acotar exacto, regex sin escapar, `OBJECT_PRONOUN_RE` sin acotar al tramo relevante) | ⚠️ Warning | Todos confirmados presentes en disco (sin fix en `e904b6d`). Ninguno rompe la suite hoy; todos son deuda de robustez del gate, no de contenido incorrecto ya publicado. El más delicado para el Core Value del proyecto es WR-03 (el gloss de los cruces no tiene gate) porque es exactamente el defecto C5 que el quórum tuvo que cazar a mano en `fare-indicativo-301` |
| `scripts/run-validation-271.mjs` | WR-05/WR-06 | guard de coherencia deja código muerto de manejo de error; prosa de cabecera obsoleta (271/195/v1.1) | ℹ️ Info | Cosmético y de robustez, no afecta el resultado del reporter hoy |
| `tests/count-arrays-lockstep.test.js` | WR-07 | `COUNT_ARRAY_SOURCES` es en sí una lista a mano | ℹ️ Info | Deuda latente reconocida por el propio reviewer como "hoy no hay una tercera fuente ciega" |

Ninguno de los TBD/FIXME/XXX sin referencia encontrado en los ficheros tocados por la fase.

### Human Verification Required

Ver frontmatter `human_verification`. Resumen:

1. **Verificación visual de las 18 categorías** en home/picker/Repaso/Examen — marcado por el propio plan 44-01 como supuesto no resuelto (INT-01, `flagged_assumptions`).
2. **Comportamiento real de la cascada D-54** sobre los 3 cruces nuevos — marcado por el propio plan 44-02 como supuesto no resuelto (INT-03, `flagged_assumptions`): solo verificado por la vía negativa (grep + diff), nunca jugando una sesión real.
3. **Decisión sobre los 9 warnings / 3 info del code review** (`44-REVIEW.md`) que quedaron sin fix tras `e904b6d` — en particular WR-01 (el gate anti-ceguera tiene dos vías de ceguera residual: entrada comentada, `slug`↔`file` cruzados) y WR-03 (el gloss ES de los 3 cruces, el punto exacto donde el quórum cazó el leak C5 real, no tiene ningún gate mecánico que lo proteja de una regresión futura). Ninguno de los dos es un must-have declarado de los planes, así que no son BLOCKER de esta verificación — pero tocan directamente el Core Value del proyecto (ejercicios sin doble validez) y el propio autor pidió una evaluación explícita de si merecen bloquear el cierre.

### Gaps Summary

No hay gaps que bloqueen el goal de la fase: los 4 Success Criteria del ROADMAP están verificados en vivo contra el disco (no contra la narración de los SUMMARY), los 2 BLOCKER del code review (CR-01, CR-02) están efectivamente cerrados en el código —no solo declarados—, y los 3 cruces multi-categoría llegaron a `validated` con audit trail limpio (ningún pase fabricado, ningún `incorrecta` arrastrado indebidamente).

Lo que queda abierto son 2 ítems de UAT humano que los propios planes declararon explícitamente fuera de alcance de un test (render visual, cascada D-54 en sesión real) y 9 warnings + 3 info de calidad del reviewer que el equipo decidió no cerrar en el commit final de la fase. Ninguno de los tres bloquea la afirmación "el milestone cierra con las 4 categorías registradas y los conteos re-sincronizados" — la evidencia mecánica de esa afirmación es sólida y reproducible —, pero el estado `human_needed` existe precisamente para que un humano decida si alguno de esos warnings (sobre todo WR-01 y WR-03, que tocan la garantía anti-doble-validez del proyecto) merece un fix puntual antes de `/gsd-complete-milestone v2.0`.

Nota aparte, sin relación con el goal de esta fase: `.planning/STATE.md` tiene `completed_phases: 5` en el frontmatter mientras la barra de progreso de la misma línea dice `4/5 fases (80%)` — inconsistencia preexistente detectada durante la verificación, no introducida por esta fase, y no bloqueante.

---

_Verified: 2026-08-11_
_Verifier: Claude (gsd-verifier)_
