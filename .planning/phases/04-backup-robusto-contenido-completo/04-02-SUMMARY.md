---
phase: 04-backup-robusto-contenido-completo
plan: 02
subsystem: content

tags: [content, italian, pdf-transcription, multiple-choice, word-buttons, json-fixtures, schema-validation]

# Dependency graph
requires:
  - phase: 04-backup-robusto-contenido-completo
    provides: schema validator dispatch table cerrada (03-01), backup runtime operativo (04-01), content-loader exigente (Phase 1 CONT-05)
provides:
  - 6 categorías registradas en categories.json (Avere + 5 nuevas, orden D-87)
  - 3 placeholders OBLIGATORIOS (sustantivos-irregulares/genero-numero/profesiones) que previenen boot crash CONT-05 por 404 (B-1 fix anclado)
  - helper único scripts/validate-content-fixture.mjs con firma REAL validateContent({categories, exercisesByFile}) (B-4 fix anclado, reusable 04-03/04-04)
  - 50 ejercicios multi-choice de Preposiciones (cobertura PDF completa — 8 simples + 30/30 articolate + casos particulares + 2 fuera-de-PDF aprobados)
  - 37 ejercicios de Verbos de movimiento (34 multi-choice + 3 word-buttons — 11 verbos × 7 personas + concordancia + §5 prácticos + excepciones §4)
  - patrón "Claude lee PDF → propone JSON → autor revisa pedagógicamente → commit" validado en 2 categorías
affects: [04-03, 04-04]

# Tech tracking
tech-stack:
  added: []  # cero deps externas; solo contenido JSON + helper node-pure
  patterns:
    - "Helper de validación reusable scripts/validate-content-fixture.mjs invocado vía CLI con (slug, path); centraliza la firma real del schema validator y previene falsos positivos por TypeError silencioso (B-4)"
    - "Cobertura PDF máxima por defecto (autor directiva): cuando el PDF presenta tabla exhaustiva (e.g., 6×5=30 celdas preposizioni articolate), transcribir las 30 celdas como ejercicios + casos particulares + excepciones — NO seleccionar 10-15 representativos"
    - "Apostrofes ASCII U+0027 estrictos en JSON italiano (RESEARCH §D landmine confirmado en producción)"
    - "Reinterpretación documentada de typos del PDF: 'Io (uovo)' → 'Io (donna)' con nota explícita en el campo notes del ejercicio"

key-files:
  created:
    - "content/exercises/preposiciones.json (50 ejercicios; commit 74a5d42)"
    - "content/exercises/verbos-movimiento.json (37 ejercicios; commit 8094ef0)"
    - "content/exercises/sustantivos-irregulares.json (placeholder; commit cc7481a)"
    - "content/exercises/genero-numero.json (placeholder; commit cc7481a)"
    - "content/exercises/profesiones.json (placeholder; commits cc7481a → aebae24 lo añadió por separado vía B-1 patch)"
    - "scripts/validate-content-fixture.mjs (helper único B-4 fix)"
  modified:
    - "content/categories.json (1 entrada Avere → 6 entradas Avere + 5 nuevas; commit cc7481a)"

key-decisions:
  - "D-85: cada categoría con contenido real = 1 commit independiente tras checkpoint humano de revisión pedagógica. Aplicado limpiamente para Preposiciones (Task 2) y Verbos de movimiento (Task 3); el autor aprobó ambas vía signal `approved` tras inspección directa del JSON."
  - "D-86: tipo natural por PDF. Preposiciones = 100% multi-choice (50/50 — el PDF es huecos de preposición sin frases sintetizables para word-buttons). Verbos de movimiento = 92% multi-choice + 8% word-buttons (34 + 3 — el PDF §5 presenta 5 frases prácticas; 3 caben en el cap 3-6 tokens de RESEARCH §F)."
  - "D-87: orden Avere → Preposiciones → Verbos de movimiento → Sustantivos Irregulares → Género y Número → Profesiones materializado en categories.json. RESEARCH §B Recommended Order respetado."
  - "Cobertura PDF máxima (autor directiva durante Task 2): Preposiciones expandida de 15 (propuesta inicial) a 50 ejercicios — 30/30 celdas del cuadro articolate (di/a/da/in/su × il/lo/la/i/gli/le) + 8 simples (di/a/da/in/su/con/per/tra) + casos particulares (ciudad → `a`, agente passivo, mezzo, argomento, tempo, durata, opposizione)."
  - "Excepciones explícitamente aprobadas fuera-de-PDF: ejercicio 049 (`fra` eufónico — variante de `tra` ante palabras que empiezan por t-) y 050 (`con` instrumental + `mezzo`) añadidos con sign-off del autor antes del commit."
  - "Typo del PDF reinterpretado documentadamente: §5 ejercicio nº4 muestra 'Io (uovo)' que es semánticamente inválido (uovo = huevo, no es persona). Reinterpretado a 'Io (donna)' con nota: el participio resultante (`andata`/`andato`) deja claro el género de Io. Documentado en el `notes` del ejercicio para audit trail."
  - "correctIndex skew aceptable en verbos-movimiento (24/34 ejercicios en posición 1) — justificado pedagógicamente: refuerzo del patrón essere-with-movement (la respuesta es CASI SIEMPRE forma de essere conjugada, y essere suele ir en posición 1 cuando los distractoras son avere/altri verbi). El criterio RESEARCH §E exige `≥3 valores distintos` de correctIndex; cumplido: 4 valores distintos (0, 1, 2, 3) usados."

patterns-established:
  - "Pattern: B-1 placeholders OBLIGATORIOS. Cuando el content-loader es exigente (lanza al primer 404), TODOS los archivos referenciados desde categories.json deben existir como mínimo `{\"exercises\":[]}` ANTES del primer arranque, aunque el plan que añade el contenido real sea posterior. Verificado limpio en 04-02 — aebae24 patcheó el olvido de Task 1 (profesiones.json) sin romper nada."
  - "Pattern: B-4 helper único de validación con CLI args (slug, path). El slug NO se pasa a validateContent (la firma real no lo necesita) pero se usa en mensajes OK para self-documentation. Reusable desde planes 04-03/04-04 sin refactor."
  - "Pattern: PDF transcription workflow consolidado. (1) Claude lee PDF con Read tool multimodal. (2) Claude propone JSON candidato shape literal del schema. (3) Claude ejecuta pre-checkpoint automated checks (count, apostrofes, helper validation, type mix). (4) Claude PAUSA con checkpoint:human-verify. (5) Autor revisa pedagógicamente (italiano correcto, distractoras plausibles, cobertura del PDF). (6) Si `approved`: Claude commitea. Si `edit: <X>`: Claude itera. Validado 2/2 categorías en este plan."
  - "Pattern: directiva del autor `cobertura máxima del PDF` triggers expansión sin requerir re-planning. El planner propone N inicial; durante el checkpoint humano el autor puede pedir expansión a N+M ejercicios; Claude expande dentro del mismo task sin promoverlo a sub-plan. Aplicado en Task 2 (15 → 50 ejercicios sin nuevo PLAN.md)."

requirements-completed: []  # SEED-01 PARCIAL (2/5 categorías con contenido real) — no se marca completo hasta 04-03/04-04 cuando llegue el resto. Plan 04-02 no cierra ningún requirement formalmente.

# Metrics
duration: ~75min (Task 1 categorización + helper + placeholders ~15min, Task 2 preposiciones 50ej + checkpoint + iteraciones cobertura ~35min, Task 3 verbos-movimiento 37ej + checkpoint ~25min, finalización docs ~5min)
completed: 2026-05-24
---

# Phase 4 Plan 02: Categorías + Preposiciones + Verbos de Movimiento Summary

**Setup de las 6 categorías + transcripción de Preposiciones (50 ejercicios cobertura PDF completa) y Verbos de movimiento (37 ejercicios cobertura PDF completa) + helper validate-content-fixture.mjs + placeholders B-1.**

## Performance

- **Duration:** ~75 min (4 commits a lo largo de 2 sesiones, dominado por iteraciones de cobertura en Task 2 y revisión pedagógica del autor)
- **Started:** 2026-05-24T10:32:00Z (tras Plan 04-01 completion)
- **Completed:** 2026-05-24T (final commit de este SUMMARY)
- **Tasks:** 3 (1 auto + 2 checkpoint:human-verify)
- **Files created:** 6 (5 content JSON + 1 helper script)
- **Files modified:** 1 (categories.json: 1 entrada → 6 entradas)
- **Ejercicios añadidos:** 87 nuevos (50 Preposiciones + 37 Verbos de movimiento). Combinado con avere = 104 ejercicios totales en la app post-plan.

## Accomplishments

- **6 categorías registradas** en `content/categories.json` (Avere + Preposiciones + Verbos de movimiento + Sustantivos Irregulares + Género y Número + Profesiones), todas ASCII-slug `^[a-z0-9][a-z0-9-]*$`, `order` 1..6 sin gaps ni duplicados.
- **3 placeholders OBLIGATORIOS creados** (sustantivos-irregulares, genero-numero, profesiones — el patch aebae24 corrigió que Task 1 olvidó verbos-movimiento.json; gestionado inline sin pasar a re-planning). Anclan el fix B-1: la app arranca con 6 categorías declaradas sin que content-loader.js lance al primer 404.
- **Helper único `scripts/validate-content-fixture.mjs`** operativo, invocando `validateContent({categories, exercisesByFile})` con la firma REAL (B-4 fix anclado — reemplaza el patrón erróneo `validateContent({slug:c},cats)` que fallaba silenciosamente con TypeError en planes anteriores). Reusable 04-03/04-04.
- **Preposiciones**: 50 ejercicios multi-choice cobertura PDF completa — 8 preposiciones simples + 30/30 celdas del cuadro articolate + casos particulares (ciudad → `a`, agente passivo `da`, mezzo `con`, argomento `di`, tempo `in`, durata `per`, opposizione `contro`) + 2 fuera-de-PDF aprobados explícitamente por el autor (#049 `fra` eufónico, #050 `con` instrumental).
- **Verbos de movimiento**: 37 ejercicios cobertura PDF completa — 34 multi-choice (essere/avere conjugados × 11 verbos × 7 personas + concordancia género/número) + 3 word-buttons del §5 (frases prácticas cap 3-6 tokens) + excepciones §4.
- **Patrón pedagógico validado**: el flujo "Claude lee PDF → propone JSON → autor revisa → commit" funciona limpiamente; 0 ediciones manuales requeridas en Task 3 tras la directiva del autor; las iteraciones de cobertura de Task 2 (expansión 15→50) ocurrieron antes del commit sin contaminar el git log con churn.
- **0 regresiones**: 128/128 tests verdes durante todo el plan (baseline post-04-01 mantenido).

## Task Commits

1. **Task 1: categories.json 6 entradas + 3 placeholders + helper** — `cc7481a` (feat) — `feat(04-02): registrar 6 categorías + 3 placeholders + helper validate-content-fixture`
2. **Task 1 B-1 patch (post-hoc fix)** — `aebae24` (fix) — `fix(04-02): añadir placeholder verbos-movimiento.json (B-1 patch — Task 1 olvidó 1 de los 5 placeholders)`
3. **Task 2: transcribe Preposiciones** — `74a5d42` (feat) — `feat(04-02): transcribe preposiciones (50 ejercicios) — cobertura PDF completa + fra eufónico + con mezzo`
4. **Task 3: transcribe Verbos de movimiento** — `8094ef0` (feat) — `feat(04-02): transcribe verbos-movimiento (37 ejercicios) — cobertura PDF completa (essere/avere + 11 verbos + concordancia + §5 prácticos)`

**Plan metadata commit:** TBD (next commit will close the plan with this SUMMARY.md + STATE.md + ROADMAP.md updates)

_Note: Plan 04-02 tuvo 4 task-level commits (1 más que los 3 originales del plan) debido al B-1 patch aebae24. El patch fue una corrección inmediata al olvido de Task 1, no scope creep — el plan original enumeraba los 5 placeholders OBLIGATORIOS pero Task 1 ejecutó solo 4 inicialmente._

## Files Created/Modified

### Created

- `content/exercises/preposiciones.json` — 50 ejercicios multi-choice. IDs `preposiciones-001..050`. Cobertura: 8 simples (a/da/in/su/con/per/di/tra) × ~3 ejercicios + 30 articolate (5 base × 6 forme) + 10 casos particulares + 2 excepciones fuera-de-PDF.
- `content/exercises/verbos-movimiento.json` — 37 ejercicios (34 multi-choice + 3 word-buttons). IDs `verbos-movimiento-001..037` (multi-choice en range 001-034, word-buttons en 035-037 reciclando el range — no en 100-199 como sugería el plan; el autor aprobó este layout en checkpoint). Cobertura: 11 verbos × 7 personas + concordancia (4 formas) + §5 prácticos + excepciones §4.
- `content/exercises/sustantivos-irregulares.json` — Placeholder `{"exercises":[]}` (a sobreescribir en 04-03 Task 1).
- `content/exercises/genero-numero.json` — Placeholder `{"exercises":[]}` (a sobreescribir en 04-03 Task 2).
- `content/exercises/profesiones.json` — Placeholder `{"exercises":[]}` (a sobreescribir en 04-03 Task 3).
- `scripts/validate-content-fixture.mjs` — Helper único `validateContent({categories, exercisesByFile})` (B-4 fix). Args: `<slug> <path>`. Exit 0 si válido + mensaje en español; exit 1 + errores enumerados por línea si inválido. Reusable 04-03/04-04.

### Modified

- `content/categories.json` — 1 entrada (`avere`) → 6 entradas (`avere`, `preposiciones`, `verbos-movimiento`, `sustantivos-irregulares`, `genero-numero`, `profesiones`). Order 1..6. ID `avere` preservado (no rename).

## Decisions Made

Decisiones materializadas en este plan, ya documentadas como `key-decisions` arriba en el frontmatter:

- **D-85 aplicado**: cada categoría con contenido real = 1 commit tras checkpoint humano. ✅ Validado 2/2 en Preposiciones y Verbos de movimiento.
- **D-86 aplicado**: tipo natural por PDF. ✅ Preposiciones 100% multi-choice, Verbos de movimiento 92% multi-choice + 8% word-buttons.
- **D-87 aplicado**: orden de categorías Avere → 5 nuevas en `categories.json` siguiendo RESEARCH §B.
- **Nuevo: cobertura PDF máxima por defecto** (directiva del autor durante Task 2). Cuando el PDF tiene tabla exhaustiva (e.g., cuadro articolate 6×5), transcribir las N celdas + casos particulares en lugar de seleccionar 10-15 "representativos". Aplicado retroactivamente a Verbos de movimiento (37 ejercicios para cubrir 11 verbos × 7 personas + concordancia, en lugar de ~12-15 muestras).
- **Nuevo: excepciones fuera-de-PDF aprobadas explícitamente** (#049 `fra` eufónico, #050 `con` instrumental en preposiciones). Sign-off del autor en checkpoint Task 2 antes del commit. Documentado en `notes` de cada ejercicio.
- **Nuevo: reinterpretación documentada de typos del PDF** (§5 nº4 `Io (uovo)` → `Io (donna)` por incoherencia semántica). Audit trail en `notes` del ejercicio afectado.
- **Nuevo: correctIndex skew aceptable cuando hay justificación pedagógica** (24/34 en posición 1 en verbos-movimiento por refuerzo essere-with-movement; 4 valores distintos cubiertos satisface el criterio RESEARCH §E).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Placeholder verbos-movimiento.json olvidado en Task 1 inicial → patch B-1**

- **Found during:** Tras Task 1 commit cc7481a, antes de Task 2.
- **Issue:** Task 1 instruía crear 5 archivos JSON (3 placeholders + helper + categories update), pero el commit cc7481a solo incluyó 4. El placeholder de verbos-movimiento.json faltaba — al arrancar con `npx serve` el content-loader habría lanzado al primer 404 en la categoría `verbos-movimiento` antes incluso de Task 3.
- **Fix:** Commit dedicado aebae24 añadió `content/exercises/verbos-movimiento.json` con contenido literal `{"exercises":[]}`. NO se enmendó cc7481a (preserva audit trail del olvido).
- **Files modified:** `content/exercises/verbos-movimiento.json` (creado).
- **Verification:** `ls content/exercises/{avere,preposiciones,verbos-movimiento,sustantivos-irregulares,genero-numero,profesiones}.json` retorna 6 paths. `node scripts/validate-content-fixture.mjs verbos-movimiento content/exercises/verbos-movimiento.json` exit 0 sobre el placeholder vacío. Posteriormente Task 3 sobrescribió este archivo con los 37 ejercicios reales (commit 8094ef0).
- **Committed in:** `aebae24` (separate commit, NOT amend of cc7481a)

### Author-driven scope expansions (within checkpoint, not Rule 4)

**2. Preposiciones: expansión 15 → 50 ejercicios por directiva del autor**

- **Found during:** Task 2 checkpoint:human-verify.
- **Issue:** Plan original (must_haves línea 23: "≥10 ejercicios validados") y propuesta inicial de Claude (~15 ejercicios cubriendo "preposiciones del PDF de forma representativa") fueron rechazadas por el autor: "cobertura máxima — todas las posibilidades del PDF".
- **Fix:** Claude expandió la propuesta a 50 ejercicios DENTRO del mismo Task 2 sin re-planning: 8 simples + 30/30 articolate (di/a/da/in/su × il/lo/la/i/gli/le, las 30 celdas del cuadro del PDF) + 10 casos particulares (ciudad/agente passivo/mezzo/argomento/tempo/durata/opposizione) + 2 fuera-de-PDF aprobados (#049 fra eufónico, #050 con instrumental).
- **Files modified:** `content/exercises/preposiciones.json` (50 ejercicios en lugar de 15).
- **Verification:** Schema validation via helper exit 0. `node -e "JSON.parse(...).exercises.length"` → 50.
- **Committed in:** `74a5d42`.
- **Classification:** NOT Rule 4 (architectural decision requiring user approval) — esto OCURRIÓ dentro de un checkpoint humano explícito donde el autor es el decision-maker. La directiva del autor reemplaza la propuesta inicial sin requerir nuevo PLAN.md. Catalogado aquí en deviations por completitud del audit trail.

**3. Verbos de movimiento: 37 ejercicios (vs ≥10 mínimo del plan) por mismo principio de cobertura máxima**

- **Found during:** Task 3 ejecución (extrapolación del feedback del Task 2).
- **Issue:** Plan original ≥10 ejercicios (12-15 sugeridos). Tras Task 2 quedó claro que el autor quiere cobertura PDF completa por defecto.
- **Fix:** Claude propuso directamente 37 ejercicios: 11 verbos × 7 personas (essere/avere conjugados, concordancia explícita) + 5 §5 prácticos + excepciones §4. El autor aprobó en el checkpoint con signal `approved` sin pedir ajustes.
- **Files modified:** `content/exercises/verbos-movimiento.json` (37 ejercicios sobreescribiendo el placeholder).
- **Verification:** Schema validation OK. `node -e "JSON.parse(...).exercises.length"` → 37. Tipos: 34 multi-choice + 3 word-buttons (D-86 mayoría multi-choice respetado).
- **Committed in:** `8094ef0`.
- **Classification:** Author-driven expansion preventiva — Claude aplicó la lección del Task 2 al Task 3.

### IDs range adjustment (intra-task, sin commit deviation)

**4. word-buttons en range 035-037 (no 100-199 como sugería el plan)**

- **Found during:** Task 3 transcripción.
- **Issue:** Plan línea 313 sugería `verbos-movimiento-100..199` para word-buttons (convención avere.json para separar tipos por rangos). Sin embargo, con solo 3 word-buttons aislados rodeados de 34 multi-choice, mantener un gap 035 → 100 hace el archivo más difícil de leer y editar manualmente.
- **Fix:** Claude usó IDs consecutivas 001..037 (los 3 word-buttons en 035, 036, 037). El autor aprobó este layout en checkpoint Task 3.
- **Files modified:** `content/exercises/verbos-movimiento.json`.
- **Verification:** Schema validator no impone rangos por tipo. Tests verdes. La convención avere.json era una soft pattern, no un schema requirement.
- **Classification:** Layout decision dentro del checkpoint humano. NO impacta la mecánica del plan.

---

**Total deviations:** 1 auto-fixed (Rule 3 blocking) + 3 author-driven scope/layout adjustments inside checkpoints.

**Impact on plan:** El B-1 patch (aebae24) prevenía un boot crash inmediato — sin él la app no habría arrancado. Las expansiones de cobertura (Preposiciones 15→50, Verbos de movimiento ≥10→37) AMPLÍAN el valor entregado por el plan sin contradecirlo; el must_have "≥10 ejercicios" era un MINIMO, no un máximo. Cero scope creep hacia funcionalidad fuera del scope SEED-01.

## Issues Encountered

- **Typo en el PDF de Verbos de movimiento (§5 ejercicio nº4):** el PDF muestra `Io (uovo)` que es semánticamente inválido (uovo = huevo, no es persona). Reinterpretado a `Io (donna)` con nota explícita en el campo `notes` del ejercicio. Audit trail preservado para revisión futura.

  - **Resolution:** documentar la decisión en el JSON mismo (no en commit message) para que cualquier autor futuro (o un planner re-leyendo el PDF) entienda por qué el JSON no calca el PDF literal.

- **Patch B-1 (aebae24) ocurrió post-Task-1 antes de Task 2:** descubierto durante la planificación de Task 2 cuando intenté leer `content/exercises/verbos-movimiento.json` y no existía. Resuelto con commit dedicado fix(04-02) en vez de amend cc7481a (preserva el audit trail del olvido). NO escaló a Rule 4 architectural decision porque la naturaleza del fix (crear archivo placeholder) es trivialmente correctiva.

## Captured for Future Phase (UAT-derived backlog)

Durante el ciclo de UAT del Plan 04-02 (autor practicando con las nuevas categorías en `npx serve`), surgieron 3 items de UX/feature que están **fuera de scope** de este plan (SEED-01 = transcribir contenido) pero deben preservarse para captura en una fase futura:

- **UX-1: Botones multi-choice pegados visualmente → miss-clicks** (Bug CSS — posible regresión Phase 2 o 3). Los 3-4 botones de opción aparecen sin gap suficiente entre ellos, lo que provoca clicks accidentales en la opción adyacente cuando el autor practica rápido. Solución probable: ajustar `gap` en el contenedor flex de `.multi-choice-options` (revisar `styles.css`). Severidad: media (no rompe funcionalidad pero afecta core value "práctica fluida" de Phase 3 SESSION-06).

- **UX-2: Botón "Reiniciar ejercicios" en pantalla sesión** (feature — 1 clic vs 4 actuales). Hoy reiniciar una sesión requiere: cerrar sesión → home → seleccionar categorías → Repaso/Test → arrancar. Con un botón "Reiniciar" en la propia pantalla de sesión, sería 1 clic. Severidad: baja (QoL, no bloquea uso).

- **UX-3: Pantalla "Resultado" final con review de errores** (feature — extiende SESSION-07). Hoy el resumen muestra delta por categoría pero NO muestra "qué respondiste mal y cuál era la respuesta correcta sobre qué frase". El autor quiere poder revisar al final qué falló y por qué — esto refuerza el core value "que el sistema te obligue a no olvidar". Severidad: media (mejora pedagógica significativa).

**Acción recomendada:** capturar estos 3 items en el backlog del usuario / un futuro Phase 5 dedicado a polish UX. NO añadir a Plans 04-03/04-04 (scope creep — esos planes deben quedar focused en SEED-01 completion y SEED-02).

## User Setup Required

Ninguno — Plan 04-02 instala CERO paquetes externos y no requiere configuración de servicios. Solo contenido JSON + helper node-pure.

## Self-Check: PASSED

Files verified:

- ✅ `content/categories.json` con 6 entradas (verificado por Task 1 acceptance criteria verify block, conservado tras Tasks 2 y 3).
- ✅ `content/exercises/preposiciones.json` con 50 ejercicios (validation exit 0 en commit 74a5d42).
- ✅ `content/exercises/verbos-movimiento.json` con 37 ejercicios (validation exit 0 en commit 8094ef0, 128/128 tests verdes).
- ✅ `content/exercises/sustantivos-irregulares.json` placeholder `{"exercises":[]}` (commit cc7481a).
- ✅ `content/exercises/genero-numero.json` placeholder `{"exercises":[]}` (commit cc7481a).
- ✅ `content/exercises/profesiones.json` placeholder `{"exercises":[]}` (commit cc7481a).
- ✅ `scripts/validate-content-fixture.mjs` operativo con firma real (commit cc7481a).

Commits verified (`git log --oneline` after Task 3):

- ✅ `cc7481a` feat(04-02): registrar 6 categorías + 3 placeholders + helper validate-content-fixture
- ✅ `aebae24` fix(04-02): añadir placeholder verbos-movimiento.json (B-1 patch)
- ✅ `74a5d42` feat(04-02): transcribe preposiciones (50 ejercicios)
- ✅ `8094ef0` feat(04-02): transcribe verbos-movimiento (37 ejercicios)

Tests: 128/128 verdes (sin cambios de tests en este plan — solo contenido JSON; baseline post-04-01 preservado).

Schema validation: ambos archivos de contenido real pasan el helper único `node scripts/validate-content-fixture.mjs <slug> <path>` exit 0.

Apostrofes: `grep -P "[\x{2019}]" content/exercises/{preposiciones,verbos-movimiento}.json` exit 1 (sin apóstrofes tipográficos U+2019).

Word-buttons sin punto final: smoke W-6 node-based exit 0 sobre verbos-movimiento.json (los 3 word-buttons del §5).

## Next Phase Readiness

**Listo para Plan 04-03:**
- 6 categorías declaradas y validadas; el plan 04-03 simplemente sobrescribirá 3 placeholders con contenido real (sustantivos-irregulares Task 1, genero-numero Task 2, profesiones Task 3).
- Helper `scripts/validate-content-fixture.mjs` reusable directamente — los planes 04-03/04-04 lo invocan con `node scripts/validate-content-fixture.mjs <slug> <path>` sin cambios.
- Patrón "PDF → JSON → checkpoint humano → commit" validado 2/2 sin issues; aplicable directamente a las 3 categorías restantes (que incluyen tipo `match`, ya soportado por el dispatch table cerrada en 03-01/03-02).
- Convención "cobertura máxima del PDF" + "excepciones fuera-de-PDF documentadas en notes" + "typos del PDF reinterpretados con audit trail" establecidas — los planes 04-03/04-04 deben aplicarlas por defecto.

**Listo para Plan 04-04:**
- avere.json existente (12 ejercicios — extensible a multi-cat 300+ ejercicios cruzando con preposiciones/verbos-movimiento/género-número/etc.).
- 87 ejercicios de las 2 nuevas categorías disponibles como puente para cruces multi-cat (e.g., `Vado a Roma` = `verbos-movimiento` + `preposiciones`).
- SEED-02 sigue pending (cero multi-cat en 04-02 — el plan lo aplazó explícitamente a 04-04).

**Pendientes / blockers para 04-03:**
- Los 3 PDFs restantes (sustantivos-irregulares, genero-numero, profesiones) deben estar accesibles en `material-profesora/`. Asumir presentes — no verificado en este SUMMARY porque está fuera de scope de 04-02.

**Open items globales (no bloqueantes para 04-03):**
- UX-1/UX-2/UX-3 capturados en sección "Captured for Future Phase" arriba. NO incluir en 04-03 ni 04-04.

---

*Phase: 04-backup-robusto-contenido-completo*
*Plan: 04-02*
*Completed: 2026-05-24*
