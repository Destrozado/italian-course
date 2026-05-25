---
phase: 04-backup-robusto-contenido-completo
plan: 04
subsystem: content

tags: [content, italian, multi-category, smoke-test, uat, cascade, append-only, design-rule]

# Dependency graph
requires:
  - phase: 04-backup-robusto-contenido-completo
    provides: backup runtime operativo (04-01), 6 categorías con contenido real (04-02 + 04-03), helper único validate-content-fixture.mjs (04-02), DESIGN RULE 'match-if-not-trivial-by-root' anclada como normativa (04-03), 128 tests baseline verdes post-04-03
provides:
  - 6 ejercicios multi-categoría avere-300..305 en avere.json (APPEND-ONLY, los 17 originales INTACTOS por D-88 verificado estructuralmente via snapshot+assert)
  - Cobertura los 5 cruces obligatorios (avere↔preposiciones, avere↔verbos-movimiento, avere↔sustantivos-irregulares, avere↔genero-numero, avere↔profesiones) con al menos 1 cruce por categoría nueva
  - Smoke test cascada multi-cat real (2 tests nuevos en tests/domain.test.js — "Phase 4 — multi-categoría cascade with real content"): carga avere.json via readFileSync, encuentra el primer multi-cat dinámicamente, simula fallo, assertea cascada D-54 sobre las 2+ categorías afectadas + smoke validateContent post-extension
  - 3 helper scripts node-puros reusables (snapshot-avere-prefix.mjs + assert-avere-prefix-unchanged.mjs + assert-multi-cat-cross.mjs) que reemplazan checks fragiles (W-4 + W-7 + B-2 fixes anclados)
  - UAT INTEGRAL 5/5 PASS de los 5 criterios ROADMAP §Phase 4 confirmado por el autor (2026-05-24)
  - SEED-02 cerrado (cruces multi-cat reales en uso) + revalidación cruzada de BACK-04, BACK-05, BACK-06, SEED-01 via UAT integral
  - 232 ejercicios totales en la app (Avere 23 + Preposiciones 50 + Verbos Mov 37 + Sustantivos Irreg 31 + Género Núm 40 + Profesiones 51)
affects:
  - Phase 5 (futuro): UAT-derived backlog UX-1/UX-2/UX-3 capturado para captura en futuro polish UX dedicado
  - Milestone v1.0 close: tras verifier pass de Phase 4 + complete-milestone

# Tech tracking
tech-stack:
  added: []  # cero deps externas; solo contenido JSON + helpers node-pure + tests
  patterns:
    - "APPEND-ONLY content extension verificado estructuralmente (NO por git diff): scripts/snapshot-avere-prefix.mjs captura los primeros N ejercicios ANTES de editar, scripts/assert-avere-prefix-unchanged.mjs compara DESPUÉS via assert.deepStrictEqual. Patrón W-4 fix robusto vs `git diff` que requiere setup git previo. Reusable para cualquier archivo content/exercises/*.json con invariante append-only en el futuro."
    - "Cruce multi-cat verificado por JSON parsing programático: scripts/assert-multi-cat-cross.mjs <slug1> <slug2> filtra `categoryIds.includes(slug1) && categoryIds.includes(slug2)`. Reemplaza grep literal fragile ante formateo line-break (W-7 fix). Reusable para verificar cualquier par de slugs cruzados en cualquier archivo del corpus."
    - "Smoke test multi-cat real auto-actualizable: el test encuentra el PRIMER ejercicio con `categoryIds.length >= 2` dinámicamente (NO hardcode avere-300). Resistente a reordenamientos del JSON. Pattern reusable para futuros smoke tests sobre contenido evolutivo."
    - "B-2 fix anclado: TODOS los smoke checks del plan invocados como `node scripts/<helper>.mjs <args>` — cero `node -e` con apóstrofes anidados. Los helpers son node-puros usando solo `node:fs` y `node:assert/strict`. Patrón normativo para cualquier verificación compleja que exceda 1 línea simple."
    - "Design Rule 'match-if-not-trivial-by-root' (codificada en 04-03) aplicada también a multi-cat: los 6 cruces avere-300..305 son todos multi-choice porque pedagógicamente requieren conocer la conjugación de avere por persona — un match `Lui ha ↔ medico` sería trivialmente derivable. Patrón normativo confirmado: design rule aplica universalmente a contenido nuevo, incluyendo cruces."

key-files:
  created:
    - "scripts/snapshot-avere-prefix.mjs (helper node-pure 17 líneas reutilizables — captura primeros N ejercicios)"
    - "scripts/assert-avere-prefix-unchanged.mjs (helper node-pure — assert.deepStrictEqual post-edit, W-4 fix)"
    - "scripts/assert-multi-cat-cross.mjs (helper node-pure CLI <slug1> <slug2> — JSON parsing programático, W-7 fix)"
    - ".gitignore (entrada scripts/.avere-prefix-snapshot.json — snapshot temporal del proceso)"
    - ".planning/phases/04-backup-robusto-contenido-completo/04-04-SUMMARY.md (este archivo)"
  modified:
    - "content/exercises/avere.json (17 ejercicios → 23 ejercicios — APPEND-ONLY +6 multi-cat avere-300..305, los 17 originales preservados verificados por snapshot+assert)"
    - "tests/domain.test.js (+2 tests al final — describe block 'Phase 4 — multi-categoría cascade with real content': test 1 cascada D-54 multi-cat real, test 2 validateContent post-extension)"

key-decisions:
  - "D-85 aplicado 1/1: el autor revisó pedagógicamente los 6 ejercicios multi-cat propuestos por Claude (Task 1b checkpoint:human-verify) ANTES del commit. Approved sin pedir ediciones — la cobertura semántica era pedagógicamente sólida desde el primer draft (Lui ha un fratello medico = avere conjugación + sustantivo profesional crítico)."
  - "D-87 cruces naturales semánticos: 1 cruce por cada categoría nueva (5 categorías × 1 cruce mínimo) + 1 cruce extra para profesiones (avere-300 + avere-301 fem) por la riqueza semántica de la familia profesional. Distribución: avere-300/301 (profesiones), avere-302 (sustantivos-irregulares cuerpo `due braccia`), avere-303 (preposiciones `un amico a Roma`), avere-304 (genero-numero `due figli e una figlia`), avere-305 (verbos-movimiento `una bicicletta per andare`). Cada cruce ejercita conjugación de avere correcta + ejercita pedagogía de la categoría cruzada."
  - "D-88 APPEND-ONLY de avere.json verificado estructuralmente (no por git diff): snapshot pre-edit captura los 17 ejercicios originales (avere-001..012 + avere-100..101 + avere-200..202) en scripts/.avere-prefix-snapshot.json (gitignored); post-edit assert.deepStrictEqual confirma intactos. Robusto vs `git diff` (que requiere staging previo no garantizado). Exit 0 verificado en todos los puntos del plan."
  - "DESIGN RULE NEW 'match-if-not-trivial-by-root' (codificada en 04-03) aplicada universalmente a cruces multi-cat: los 6 ejercicios avere-300..305 son TODOS multi-choice porque la respuesta correcta es la conjugación de avere por persona — un match `Lui ha ↔ medico` sería pedagógicamente trivial (el alumno solo arrastra). Validación interna pre-checkpoint: cada cruce pasa el filtro 'la izq-der NO es derivable trivialmente desde la raíz'."

patterns-established:
  - "Pattern: APPEND-ONLY structural verification via snapshot+assert. Captura snapshot pre-edit con scripts/snapshot-avere-prefix.mjs, edita el archivo, ejecuta scripts/assert-avere-prefix-unchanged.mjs post-edit. Exit 0 si intacto, exit 1 + diff si difiere. Patrón normativo para extender CUALQUIER archivo de contenido que tenga invariante de no-modificación (D-88 generalizable)."
  - "Pattern: helper script CLI con args para verificación multi-archivo. scripts/assert-multi-cat-cross.mjs <slug1> <slug2> usa JSON.parse + filter programático en lugar de grep. Reusable para verificar cualquier par de slugs cruzados en cualquier categoría. Patrón aplicable a invariantes más complejas (e.g. assert-min-coverage.mjs <slug> <min-count>)."
  - "Pattern: smoke test dinámico sobre contenido (no hardcode IDs). `avere.exercises.find(ex => Array.isArray(ex.categoryIds) && ex.categoryIds.length >= 2)` encuentra el primer multi-cat sin hardcode. Resistente a reordenamientos. Patrón aplicable a CUALQUIER assertion sobre 'el primer X que cumpla Y' en contenido evolutivo."
  - "Pattern: UAT integral exhaustivo end-to-end como gate final de fase. Tasks 1a/1b/1c son automatización + checkpoint humano sobre el CONTENIDO; Task 2 es UAT integral sobre los 5 criterios ROADMAP completos (no solo del plan). Este pattern reusable: el último plan de una fase incluye un UAT integral de TODA la fase, no solo del plan, validando criterios ROADMAP de la fase en uso real."

# Quality marks
requirements-completed: [SEED-02, BACK-04, BACK-05, BACK-06, SEED-01]
# BACK-04/-05/-06 ya entregadas runtime en 04-01 (mini-UAT 5/5 PASS).
# Aquí REVALIDADAS en uso real con contenido completo (las 6 categorías cargadas) via UAT INTEGRAL.
# SEED-01 cierra formalmente aquí: 6/6 categorías con contenido real (~232 ejercicios) validadas
# por UAT-D (las 6 categorías cargan sin error CONT-05, schema validado, NFC).
# SEED-02 cierra aquí: 6 cruces multi-cat reales que ejercitan cascada D-54 inmediata,
# validados por UAT-E (cascada propaga inmediata en avere-3XX).

# Metrics
duration: ~30min (Task 1a helpers + multi-cat exercises + snapshot ~12min, Task 1b checkpoint human-verify + commit ~5min, Task 1c smoke test + commit ~8min, Task 2 UAT integral 5/5 ~5min concentrado humano)
completed: 2026-05-24
---

# Phase 4 Plan 04: avere.json multi-cat extension SEED-02 + smoke test cascada multi-cat real + UAT integral 5/5 PASS

**Cierre Phase 4 — SEED-02 multi-cat (6 cruces avere-300..305) + smoke test cascada real (130 tests verdes) + UAT integral 5/5 ROADMAP success criteria.**

## Performance

- **Duration:** ~30 min (Task 1a + Task 1b checkpoint + Task 1c commit + Task 2 UAT integral)
- **Started:** 2026-05-24 (tras Plan 04-03 completion)
- **Completed:** 2026-05-24 (post UAT INTEGRAL 5/5 PASS)
- **Tasks:** 4 sub-tasks: 1a auto (helpers + propuesta) + 1b checkpoint:human-verify (autor approved + commit) + 1c auto/TDD (smoke test + commit) + 2 checkpoint:human-verify (UAT integral)
- **Files created:** 5 (3 helper scripts + .gitignore + este SUMMARY)
- **Files modified:** 2 (avere.json APPEND-ONLY +6 ejercicios, tests/domain.test.js +2 tests)
- **Ejercicios añadidos a la app:** 6 multi-cat (avere-300..305) = 232 ejercicios totales (post-04-03 era 226 = 17 avere + 50 prep + 37 vm + 31 si + 40 gn + 51 prof; ahora 23 avere = 232 totales)

## Accomplishments

- **SEED-02 cerrado**: 6 ejercicios multi-categoría avere-300..305 añadidos a avere.json (APPEND-ONLY verificado estructuralmente por snapshot+assert sin depender de git). Cobertura: al menos 1 cruce por cada nueva categoría (5 categorías × 1 cruce mínimo + 1 extra en profesiones). Cada cruce ejercita conjugación de avere por persona + ejercita pedagogía de la categoría cruzada (fratello medico, due braccia, un amico a Roma, due figli e una figlia, bicicletta per andare).
- **Smoke test cascada multi-cat REAL**: 2 tests nuevos al final de tests/domain.test.js dentro del describe block "Phase 4 — multi-categoría cascade with real content":
  - Test 1: carga avere.json via readFileSync, encuentra dinámicamente el PRIMER multi-cat (no hardcode), simula fallo via applyImmediateFailure, assertea cascada D-54 sobre las 2+ categorías referenciadas (status='no-hecha', streakDays=0, clearedExerciseIds=[]).
  - Test 2: smoke validateContent sobre avere.json + categories.json post-extensión (result.ok === true).
- **3 helper scripts node-puros reutilizables**: snapshot-avere-prefix.mjs (W-4 fix captura), assert-avere-prefix-unchanged.mjs (W-4 fix assert), assert-multi-cat-cross.mjs (W-7 fix programático). Cero `node -e` con apóstrofes anidados — B-2 fix anclado.
- **D-88 invariante preservado y verificado estructuralmente**: los 17 ejercicios originales (avere-001..012, avere-100..101, avere-200..202) intactos en todas las etapas del plan. Verificado por scripts/assert-avere-prefix-unchanged.mjs (assert.deepStrictEqual) — robusto vs git diff que requiere setup git previo. Exit 0 en todos los gates.
- **UAT INTEGRAL 5/5 PASS** (autor 2026-05-24): cinco criterios ROADMAP §Phase 4 verificados end-to-end con contenido completo (las 6 categorías cargadas).
- **130 tests verdes**: 128 baseline post-04-03 + 2 nuevos del smoke test = 130/130. Cero regresiones.
- **232 ejercicios prácticables en la app**: Avere 23 (17 originales + 6 multi-cat) + Preposiciones 50 + Verbos de movimiento 37 + Sustantivos Irregulares 31 + Género y Número 40 + Profesiones 51 = 232 totales tras este plan.
- **Phase 4 lista para verifier**: los 5 requisitos pendientes (BACK-04, BACK-05, BACK-06, SEED-01, SEED-02) marcables Complete con evidencia documentada (Task 3 mini-UAT 04-01 + UAT INTEGRAL 04-04).

## Task Commits

1. **Task 1a: helpers snapshot/assert-prefix/assert-multi-cat + .gitignore + snapshot pre-edit** — `8ba64e7` (chore) — `chore(04-04): helpers snapshot/assert-prefix/assert-multi-cat + snapshot pre-edit + .gitignore`
2. **Task 1b: 6 ejercicios multi-cat avere-300..305 (autor approved en checkpoint:human-verify)** — `2f5c267` (feat) — `feat(04-04): añadir ejercicios multi-categoría a avere.json (cierre SEED-02 — cascada D-54 en uso real)`
3. **Task 1c: smoke test multi-cat real + schema validation roundtrip** — `840e628` (test) — `test(04-04): smoke test multi-cat real cascade (SEED-02) + schema validation roundtrip`
4. **Task 2: UAT INTEGRAL 5/5 PASS** — sin commit, 5/5 PASS por el autor (2026-05-24):
   - **UAT-A (BACK-04 export):** PASS — exportar progreso descarga `italian-course-backup-YYYY-MM-DD.json` con shape `{kind, exportedAt, schemaVersion, state}` correcto + mensaje verde + `lastBackupAt` actualizado.
   - **UAT-B (BACK-05 import idempotente + confirmación):** PASS — import con confirmación inline → Continuar reemplaza state → round-trip idéntico al exportado. Error handling en español para archivos JSON ajenos.
   - **UAT-C (BACK-06 banner 7 días reactivo):** PASS — banner home aparece >7 días + variantes correctas (null `firstUsedAt` fallback, fecha futura suprime banner T-04-04). Reactividad Alpine sobre spread immutable funcional.
   - **UAT-D (SEED-01 6 PDFs + sesión mezcla limpia):** PASS — 6 categorías visibles en home en orden D-87 (Avere → Preposiciones → Verbos Mov → Sustantivos Irreg → Género Núm → Profesiones), cada una con ≥10 ejercicios reales, NO banner CONT-05, sesión mezcla de los 3 tipos corre limpia.
   - **UAT-E (SEED-02 cascada multi-cat propaga inmediata):** PASS — fallar un ejercicio multi-cat real propaga cascada D-54 inmediata sobre las 2+ categorías referenciadas (status='no-hecha' + streakDays=0 + clearedExerciseIds=[] verificable en DevTools localStorage), visible en resumen final con transición hecha→no-hecha de las N categorías afectadas.

**Plan metadata commit:** (próximo, este commit) `docs(04-04): summary + complete plan (UAT integral PASS 5/5)`.

## Files Created/Modified

### Created
- `scripts/snapshot-avere-prefix.mjs` — Helper node-pure. Captura los primeros 17 ejercicios de avere.json y los escribe a scripts/.avere-prefix-snapshot.json (gitignored). Usado en Task 1a antes de editar (W-4 fix).
- `scripts/assert-avere-prefix-unchanged.mjs` — Helper node-pure. Lee el snapshot y compara con los primeros 17 ejercicios del avere.json actual via assert.deepStrictEqual. Exit 0 si idénticos, exit 1 + diff si difieren (W-4 fix — robusto vs git diff).
- `scripts/assert-multi-cat-cross.mjs` — Helper node-pure CLI `<slug1> <slug2>`. Parsea avere.json, busca al menos 1 ejercicio con `categoryIds.includes(slug1) && categoryIds.includes(slug2)`. Exit 0 si existe; exit 1 si no (W-7 fix — reemplaza grep literal fragile).
- `.gitignore` — Entrada `scripts/.avere-prefix-snapshot.json` (snapshot temporal del proceso, no debe commitearse).
- `.planning/phases/04-backup-robusto-contenido-completo/04-04-SUMMARY.md` — Este archivo.

### Modified
- `content/exercises/avere.json` — APPEND-ONLY 17 → 23 ejercicios. Añadidos al final: avere-300 (avere + profesiones — "Lui ___ un fratello medico"), avere-301 (avere + profesiones fem — "Io ___ una sorella avvocata"), avere-302 (avere + sustantivos-irregulares — "Lui ___ due braccia"), avere-303 (avere + preposiciones — "Ho un amico ___ Roma"), avere-304 (avere + genero-numero — "Lui ___ due figli e una figlia"), avere-305 (avere + verbos-movimiento — "Io ___ una bicicletta per andare al lavoro"). Los 17 originales (avere-001..012, avere-100..101, avere-200..202) INTACTOS verificado por scripts/assert-avere-prefix-unchanged.mjs exit 0.
- `tests/domain.test.js` — +2 tests al final dentro de nuevo describe block "Phase 4 — multi-categoría cascade with real content". Test 1: smoke cascada D-54 multi-cat real (carga avere.json, encuentra primer multi-cat dinámicamente, simula fallo, assertea cascada sobre las 2+ categoryIds). Test 2: smoke validateContent sobre avere extendido (result.ok === true). El bloque smoke 30 días existente NO modificado.

## Decisions Made

Decisiones materializadas en este plan, ya documentadas como `key-decisions` arriba en el frontmatter:

- **D-85 aplicado 1/1**: el autor revisó pedagógicamente los 6 ejercicios multi-cat ANTES del commit (Task 1b checkpoint:human-verify). Approved sin ediciones — el primer draft era pedagógicamente sólido.
- **D-87 cruces naturales semánticos**: 5 cruces obligatorios + 1 extra en profesiones (riqueza familiar). Cada cruce ejercita conjugación de avere + pedagogía de la categoría cruzada.
- **D-88 APPEND-ONLY estructuralmente verificable**: snapshot pre + assert post (W-4 fix). Robusto vs git diff. Exit 0 en todos los gates.
- **DESIGN RULE 'match-if-not-trivial-by-root' aplicada universalmente**: los 6 cruces multi-cat son TODOS multi-choice (la conjugación de avere por persona NO es trivialmente derivable + un match avere-conjugado ↔ sustantivo sería pedagógicamente vacío).

## Deviations from Plan

**Total deviations:** 0 — plan ejecutado exactamente como escrito.

**Impact on plan:** ninguno — el plan ya incorporaba los fixes del checker (W-3 checkpoint humano explícito antes del smoke test, W-4 snapshot+assert structural, W-7 helper JSON parsing, B-2 helper scripts en lugar de `node -e` con apóstrofes anidados, B-4 helper único validate-content-fixture.mjs heredado de 04-02). La ejecución consumió esas decisiones tal cual.

### Notes — no auth gates, ningún paquete instalado

Plan 04-04 NO involucra autenticación, instalación de paquetes (Phase 4 instala CERO paquetes externos per T-04-SC), ni decisiones arquitectónicas que requieran human-action. Ejecución 100% según `autonomous: false` con dos checkpoints humanos (Task 1b multi-cat review pedagógico + Task 2 UAT INTEGRAL). Ambos cumplieron su función protectora.

## Issues Encountered

Ninguno bloqueante.

## UAT Integral Result

**Veredicto final del autor (2026-05-24): PASS 5/5**

| UAT | Criterio ROADMAP | Verifica | Resultado |
|-----|------------------|----------|-----------|
| UAT-A | #1 BACK-04 export | Exportar progreso descarga JSON con shape correcto + nombre con fecha + mensaje verde + lastBackupAt updated | PASS |
| UAT-B | #2 BACK-05 import idempotente | Import con confirmación inline → Continuar reemplaza state → round-trip idéntico; error handling en español | PASS |
| UAT-C | #3 BACK-06 banner 7 días reactivo | Banner aparece >7d, desaparece tras export, variantes correctas (null fallback, fecha futura suprime) | PASS |
| UAT-D | #4 SEED-01 6 PDFs ≥10 cada | Las 6 categorías visibles en home en orden D-87, ≥10 ejercicios cada una, sesión mezcla limpia, sin banner CONT-05 | PASS |
| UAT-E | #5 SEED-02 cascada multi-cat propaga | Fallar un multi-cat real propaga cascada D-54 inmediata sobre N categorías visibles en resumen + verificable en DevTools | PASS |

Los 5 criterios ROADMAP §Phase 4 satisfechos end-to-end con contenido completo. Phase 4 cierra cuando verifier hace `phase.complete` tras VERIFICATION.md status:passed.

## Captured for Future Phase (UAT-derived backlog — consolidado de 04-02 + 04-03 + observaciones nuevas en UAT integral de 04-04)

Los items UAT-derived capturados a lo largo de Phase 4 se consolidan aquí para audit trail final. NO se incluyen en Phase 4 (scope creep). Deferred to Phase 5 (polish UX) o beyond:

- **UX-1: Botones multi-choice pegados/fusionados → miss-clicks** (Bug CSS posible regresión Phase 2 o 3). Los 3-4 botones de opción aparecen sin gap suficiente entre ellos, lo que provoca clicks accidentales en la opción adyacente cuando el autor practica rápido. Solución probable: ajustar `gap` en el contenedor flex de `.multi-choice-options` (revisar `styles.css`). Severidad: media (no rompe funcionalidad pero afecta core value "práctica fluida" de Phase 3 SESSION-06). **Status:** observado consistentemente a lo largo de 04-02/04-03/04-04 sin exacerbación; sigue siendo backlog Phase 5+.

- **UX-2: Botón "Reiniciar ejercicios" en pantalla sesión** (feature — 1 clic vs 4 actuales). Hoy reiniciar una sesión requiere: cerrar sesión → home → seleccionar categorías → Repaso/Test → arrancar. Con un botón "Reiniciar" en la propia pantalla de sesión, sería 1 clic. Severidad: baja (QoL, no bloquea uso). **Status:** sin cambios — sigue siendo backlog Phase 5+.

- **UX-3: Pantalla "Resultado" final con review de errores** (feature — extiende SESSION-07). Hoy el resumen muestra delta por categoría pero NO muestra "qué respondiste mal y cuál era la respuesta correcta sobre qué frase". El autor quiere poder revisar al final qué falló y por qué — esto refuerza el core value "que el sistema te obligue a no olvidar". Severidad: media (mejora pedagógica significativa). **Status:** sin cambios — sigue siendo backlog Phase 5+.

**Acción recomendada:** capturar estos 3 items en el backlog del usuario / un futuro Phase 5 dedicado a polish UX. Las opciones serían:
- Phase 5 dedicado polish UX (CSS gap fix + restart button + review de errores en resumen) — coherente con que Phase 4 termina la funcionalidad core de v1.
- O alternativamente, dejarlas pendientes hasta que el autor las pida tras uso real prolongado de v1.

## User Setup Required

Ninguno — Plan 04-04 instala CERO paquetes externos y no requiere configuración de servicios. Solo contenido JSON + helpers node-pure + 2 tests adicionales.

## Self-Check: PASSED

Files verified:

- ✅ `scripts/snapshot-avere-prefix.mjs` — FOUND (commit 8ba64e7).
- ✅ `scripts/assert-avere-prefix-unchanged.mjs` — FOUND (commit 8ba64e7).
- ✅ `scripts/assert-multi-cat-cross.mjs` — FOUND (commit 8ba64e7).
- ✅ `.gitignore` con entrada `scripts/.avere-prefix-snapshot.json` — FOUND (commit 8ba64e7).
- ✅ `content/exercises/avere.json` con 23 ejercicios (6 multi-cat avere-300..305) — MODIFIED (commit 2f5c267, APPEND-ONLY verified).
- ✅ `tests/domain.test.js` con 2 tests adicionales en describe block "Phase 4 — multi-categoría cascade with real content" — MODIFIED (commit 840e628).
- ✅ `.planning/phases/04-backup-robusto-contenido-completo/04-04-SUMMARY.md` — FOUND (este archivo).

Commits verified (`git log --oneline`):

- ✅ `8ba64e7` chore(04-04): helpers snapshot/assert-prefix/assert-multi-cat + .gitignore
- ✅ `2f5c267` feat(04-04): añadir ejercicios multi-categoría a avere.json (cierre SEED-02)
- ✅ `840e628` test(04-04): smoke test multi-cat real cascade (SEED-02) + schema validation roundtrip
- Final docs commit — pendiente (este commit).

Tests: **130/130 verdes** (128 baseline post-04-03 + 2 nuevos del smoke test multi-cat). 0 skipped, 0 failed. Verificado tras Task 1c commit `840e628`.

Schema validation:
- `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` exit 0 (23 ejercicios validados, schema acepta multi-cat sin cambios).

D-88 invariante:
- `node scripts/assert-avere-prefix-unchanged.mjs` exit 0 — los 17 ejercicios originales intactos verificado estructuralmente.

Cruces multi-cat:
- `node scripts/assert-multi-cat-cross.mjs avere preposiciones` exit 0 (1 cruce: avere-303).
- `node scripts/assert-multi-cat-cross.mjs avere verbos-movimiento` exit 0 (1 cruce: avere-305).
- `node scripts/assert-multi-cat-cross.mjs avere sustantivos-irregulares` exit 0 (1 cruce: avere-302).
- `node scripts/assert-multi-cat-cross.mjs avere genero-numero` exit 0 (1 cruce: avere-304).
- `node scripts/assert-multi-cat-cross.mjs avere profesiones` exit 0 (2 cruces: avere-300, avere-301).

UAT INTEGRAL:
- 5/5 PASS por el autor (2026-05-24). Phase 4 lista para verifier.

Decisiones cubiertas:
- D-85 (autor revisa multi-cat ANTES del commit) ✅
- D-87 (cruces naturales semánticos, ≥1 por categoría) ✅
- D-88 (APPEND-ONLY verificado estructuralmente W-4 fix) ✅
- DESIGN RULE 'match-if-not-trivial-by-root' aplicada universalmente ✅

Fixes del checker anclados:
- B-1 (placeholders obligatorios) — anclado en 04-02 Task 1, preservado.
- B-2 (no heredoc-incompatible commands) — anclado: TODOS los smoke checks usan helper scripts en scripts/.
- B-3 (mini-UAT antes de contenido) — anclado en 04-01 Task 3.
- B-4 (helper único validateContent firma real) — anclado en scripts/validate-content-fixture.mjs, reusado en este plan.
- B-5 (frontmatter coherente con action) — anclado en 04-01.
- W-1 (Task 2 04-01 grande) — aceptado (no se split; aceptable tras Task 3 mini-UAT como compensación).
- W-2 (backupLastMessage clear en requestReturnToHome) — anclado en 04-01 Task 2 step j.
- W-3 (multi-cat human-verify gate) — anclado en 04-04 Task 1b, ejecutado limpio.
- W-4 (snapshot+assert en lugar de git diff) — anclado en scripts/snapshot-avere-prefix.mjs + scripts/assert-avere-prefix-unchanged.mjs.
- W-5 (orden Avere=1) — anclado en 04-02 Task 1 categories.json, preservado.
- W-6 (node-based no-period check) — anclado en 04-02/04-03/04-04.
- W-7 (node-based JSON parsing para cruces) — anclado en scripts/assert-multi-cat-cross.mjs.

Requirements cubiertos en este plan:
- BACK-04 (export) ✅ REVALIDATED en UAT-A (entregada runtime en 04-01).
- BACK-05 (import + confirmación) ✅ REVALIDATED en UAT-B (entregada runtime en 04-01).
- BACK-06 (banner 7d) ✅ REVALIDATED en UAT-C (entregada runtime en 04-01).
- SEED-01 (6 PDFs ≥10 cada uno) ✅ CIERRA en UAT-D (6/6 categorías con contenido real validado en uso integral).
- SEED-02 (multi-cat cruces) ✅ CIERRA en UAT-E (6 cruces avere-300..305 propagan cascada inmediata verificada).

## Next Phase Readiness

**Phase 4 lista para verifier (`/gsd:complete-phase 4` o flujo equivalente):**
- 5 criterios ROADMAP §Phase 4 satisfechos end-to-end (UAT INTEGRAL 5/5 PASS).
- 5 requisitos cubiertos (BACK-04, BACK-05, BACK-06, SEED-01, SEED-02).
- 130 tests verdes baseline preservado.
- Plan 04-04 commit history limpio (3 commits task-level + 1 commit docs final).
- D-88 invariante mantenido y verificable.

**Milestone v1.0 listo para close (`/gsd:complete-milestone v1.0`):**
- 40/40 v1 requirements complete (todos los planes de las 4 fases ejecutados).
- 4/4 fases completed (pending Phase 4 verifier pass).
- App es daily driver con 232 ejercicios prácticables en 6 categorías + backup robusto + cascada multi-cat funcional.

**Open items globales (no bloqueantes para milestone close):**
- UX-1/UX-2/UX-3 backlog consolidado de UAT humano a lo largo de Phase 4 — capturados aquí para Phase 5+ polish UX si el autor lo pide tras uso prolongado de v1.

---

*Phase: 04-backup-robusto-contenido-completo*
*Plan: 04-04*
*Completed: 2026-05-24*
