---
phase: 12-partitivos
plan: 02
subsystem: content
tags: [partitivos, multiple-choice, italian-a1, exercises, json-content, del-formas, omision]

# Dependency graph
requires:
  - phase: 12-01
    provides: "Temario exhaustivo del partitivo (12-TEMARIO-PARTITIVOS.md) sobre el eje incontable/contable; 7 formas + 3 alternativas por restricción + omisión + distinción PART-05"
  - phase: 11
    provides: "Patrón de categoría nueva (shape multiple-choice, canon de explanations D-15, disparadores fonéticos del=di+il heredados de Articoli, deviation Rule-3 de categories.json)"
provides:
  - "content/exercises/partitivos.json con 37 ejercicios multiple-choice (partitivos-001..037), todos validation.status pending, categoryIds=[partitivos], ids únicos, JSON parsea"
  - "Bloque del-formas 001-026 (incontable del/dello/della/dell' + contable dei/degli/delle, cada forma respuesta correcta en >=1 ejercicio, contraste incontable/contable)"
  - "Bloque alternativas 027-033 por restricción gramatical (qualche+singular / un po' di+incontable / alcuni-alcune+plural)"
  - "Mini-bloque omisión 034-037 (afirmativa usa partitivo vs negativa omite, opción literal ∅ / sin partitivo)"
affects: [12-03, 12-04, 12-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ejercicios multiple-choice por índice (D-07) reorganizados sobre el eje incontable/contable en vez del eje det/indet de Articoli"
    - "Alternativas como TRAMPA POR RESTRICCIÓN GRAMATICAL (D-03) — una sola opción correcta inequívoca por restricción, no sinonimia"
    - "Opción literal '∅ / sin partitivo' (U+2205) renderizada por x-text como texto plano"

key-files:
  created:
    - "content/exercises/partitivos.json"
  modified:
    - "content/categories.json (entry partitivos order 9 — deviation Rule-3, ver abajo)"

key-decisions:
  - "Conteo parcial tras 12-02 = 37 ejercicios (techo de verify N<=44 ya casi alcanzado; 12-03 fija N final con adiciones modestas)"
  - "partitivos-010 reformulado por el revisor (bug double-di: voglia di + della) → 'A pranzo cucino ___ pasta al pomodoro.'"
  - "categories.json entry partitivos order 9 añadida en c415487 como deviation Rule-3 (desbloquea el fixture validator); 12-04 verifica, NO re-añade"

patterns-established:
  - "Densidad de cobertura del-formas: ~3 contextos léxicos por forma + 2 pares de contraste verbo-constante incontable/contable"
  - "doble-validez tension flag: afirmativa omisión (034/036) marca ∅ como wrong aunque el partitivo afirmativo es OPCIONAL en italiano — D-02 by design, autor es el oráculo en 12-05"

requirements-completed: [PART-03, PART-04, PART-06]

# Metrics
duration: 7min
completed: 2026-05-28
---

# Phase 12 Plan 02: Bloque base multiple-choice de Partitivos Summary

**37 ejercicios multiple-choice de Partitivos (del-formas incontable/contable 001-026 + alternativas por restricción gramatical 027-033 + mini-bloque omisión ∅ 034-037), todos pending para quórum, validando contra el schema.**

## Performance

- **Duration:** ~7 min (autoría Task 1+2 + corrección del revisor; finalización por agente de continuación)
- **Started:** 2026-05-28T00:44:02Z (commit Task 1)
- **Completed:** 2026-05-28T00:51:49Z
- **Tasks:** 3 (2 auto + 1 checkpoint human-verify APROBADO)
- **Files modified:** 2 (partitivos.json creado, categories.json deviation Rule-3)

## Accomplishments

- **Bloque del-formas (partitivos-001..026):** cubre las 7 formas del partitivo determinativo en su disparador fonético — incontable singular `del`/`dello`/`della`/`dell'` y contable plural `dei`/`degli`/`delle`. Cada forma es la RESPUESTA CORRECTA (`options[correctIndex]`) en >=1 ejercicio (no solo distractora). Densidad ~3 contextos léxicos por forma + 2 pares de contraste verbo-constante que explotan el eje incontable/contable (D-01).
- **Bloque alternativas (partitivos-027..033):** `qualche`+SIEMPRE singular, `un po' di`+SOLO incontable, `alcuni/alcune`+SOLO plural — cada una tratada como TRAMPA POR RESTRICCIÓN GRAMATICAL (D-03), con explanation que enseña la restricción (no sinonimia) y exactamente UNA opción correcta inequívoca.
- **Mini-bloque omisión (partitivos-034..037):** contraste afirmativa (usa el partitivo: `Compro del pane`, `Ho degli amici`) vs negativa (omite: `Non compro pane`, `Non ho amici`), con la opción literal `∅ / sin partitivo`. Las explanations insisten en el matiz pedagógico D-02 (lo difícil para el hispanohablante es USAR el partitivo en afirmativa, no omitirlo en negativa).
- **Verificación:** `node scripts/validate-content-fixture.mjs partitivos content/exercises/partitivos.json` exit 0. 37/37 ids únicos (partitivos-001..037), 37/37 categoryIds=["partitivos"] (sin bridges D-14), 37/37 validation `{status:"pending", passes:[]}`. JSON parsea. Cero comillas tipográficas (apóstrofes ASCII U+0027).

## Conteo parcial y techo de verify (carry-forward a 12-03)

- **Conteo tras 12-02 = 37 ejercicios multiple-choice.** Reparto: del-formas 001-026 (thorough a 26: ~3 contextos léxicos por forma + 2 pares de contraste verbo-constante incontable/contable); alternativas 027-033; omisión 034-037.
- **12-02 ya está en 37**, por lo que **12-03 debe mantener sus adiciones MODESTAS — target FINAL N <= 44** (el techo del verify). Ejemplos de adición acotada: ~1-2 ejercicios `match` + ~4-5 de clasificación PART-05. **12-03 fija el conteo final N** que luego propagan en lockstep 12-04 (categories.json — ya presente, ver deviation — + reporter `TOTAL_EXPECTED` 328+N + test `CATEGORIES_WITH_EXPLANATIONS` con la cuenta exacta) y valida 12-05.

## Task Commits

Tareas committeadas atómicamente (autoría previa al handoff de continuación):

1. **Task 1: del-formas multiple-choice (incontable + contable)** — `c415487` (feat) — también añadió el entry de categories.json (deviation Rule-3)
2. **Task 2: alternativas por restricción + mini-bloque omisión (∅)** — `780bf64` (feat)
3. **Task 3: Checkpoint human-verify (revisión por bloques del autor)** — APROBADO

**Corrección del revisor (commit separado):** `e30e225` (fix) — reformulación de partitivos-010.

**Plan metadata:** este commit (docs: complete plan).

## Files Created/Modified

- `content/exercises/partitivos.json` — 37 ejercicios multiple-choice de la categoría Partitivos (del-formas incontable/contable + alternativas por restricción + omisión) con explanations curadas; envelope `{ "exercises": [...] }`.
- `content/categories.json` — entry `{id:"partitivos",name:"Partitivos",order:9}` (deviation Rule-3, ver abajo).

## Decisions Made

- **Conteo parcial 37 con densidad thorough en del-formas (26).** El temario tiene muchas celdas incontable/contable × disparador; se cubrió cada una con varios contextos léxicos para fijar el disparador fonético. Esto deja a 12-03 con poco margen hasta el techo N<=44 — adiciones deliberadamente modestas.
- **partitivos-010 reformulado por el autor-proxy** (ver deviaciones).
- **Alternativas blindadas por restricción gramatical (D-03)** en vez de presentarse como sinónimos, para garantizar UNA sola correcta por índice y minimizar disputas de doble-validez en el quórum.

## Deviations from Plan

### Auto-fixed Issues / Deviaciones registradas

**1. [Rule 1 - Bug] Reformulación de partitivos-010 (double-`di`)**
- **Found during:** Task 3 (revisión por bloques del autor-proxy de las 37 explanations)
- **Issue:** El prompt original `"Ho voglia di ___ pasta"` producía el agramatical doble-`di` `"Ho voglia di della pasta"` — la locución `voglia di` ya lleva su `di`, así que insertar `della` (= di + la) duplica la preposición.
- **Fix:** Prompt reframeado a `"A pranzo cucino ___ pasta al pomodoro."` (verbo `cucinare` que admite el partitivo directo `della pasta` sin `di` previo). La forma correcta (`della`) y la pedagogía incontable femenino se conservan.
- **Files modified:** content/exercises/partitivos.json (solo partitivos-010)
- **Verification:** fixture validator exit 0; prompt confirmado `"A pranzo cucino ___ pasta al pomodoro."`
- **Committed in:** `e30e225` (commit separado de revisión)

**2. [Rule 3 - Blocking, igual que Phase 11] Entry de categories.json para desbloquear el fixture validator**
- **Found during:** Task 1 (creación de partitivos.json)
- **Issue:** El fixture validator hace cross-check de `categoryIds` contra `content/categories.json`; sin un entry `partitivos`, los 37 ejercicios con `categoryIds:["partitivos"]` fallarían el cross-check, bloqueando el verify del propio plan.
- **Fix:** Añadido `{id:"partitivos",name:"Partitivos",order:9}` a categories.json (mismo patrón Rule-3 que articoli order 8 en Phase 11, donde el entry se añadió en 11-02 y 11-04 lo verificó sin re-añadir).
- **Files modified:** content/categories.json
- **Verification:** `node scripts/validate-content-fixture.mjs partitivos ...` exit 0; entry confirmado `{"id":"partitivos","name":"Partitivos","order":9}`.
- **Committed in:** `c415487` (commit de Task 1)
- **IMPORTANTE para 12-04:** el entry de categories.json YA ESTÁ PRESENTE. 12-04 debe **verificarlo, NO re-añadirlo**, y aun así hacer el bump del reporter (`TOTAL_EXPECTED` 328 → 328+N) + la línea de test `CATEGORIES_WITH_EXPLANATIONS` una vez 12-03 fije el N final. (No duplicar el entry — calcaría el bug que evitó Phase 11.)

---

**Total deviations:** 2 (1 bug auto-fix del revisor, 1 blocking Rule-3 esperada por patrón Phase 11)
**Impact on plan:** Ambas necesarias para correctness/desbloqueo. Sin scope creep — el conteo y la cobertura siguen dentro del diseño del plan.

## KNOWN doble-validez tension (FLAG para el quórum 12-05 + autor)

> **Banderazo explícito para 12-05.** Las dos disputas de quórum más probables de esta categoría.

Los ejercicios de OMISIÓN afirmativa **partitivos-034 y partitivos-036** marcan `∅ / sin partitivo` como **respuesta incorrecta**, pero el partitivo afirmativo es **OPCIONAL** en italiano:

| id | prompt | correcta marcada | opción ∅ | tensión |
|----|--------|------------------|----------|---------|
| partitivos-034 | `Compro ___ pane.` | `del` | distractora (wrong) | `"Compro pane"` también es válido → ∅ no es estrictamente incorrecta |
| partitivos-036 | `Ho ___ amici a Roma.` | `degli` | distractora (wrong) | `"Ho amici a Roma"` también es válido → ∅ no es estrictamente incorrecta |

- Implementan la decisión LOCKED **D-02** TAL CUAL fue diseñada (el matiz pedagógico es que el hispanohablante DEBE aprender a USAR el partitivo en afirmativa, donde el español no pone nada). Por eso ∅ se marca wrong **a propósito**.
- **El autor es el oráculo** cuando el quórum las dispute en 12-05: puede (a) hacer override para CONSERVAR la pedagogía (mantener `del`/`degli` como única correcta), o (b) reformular el prompt para eliminar la ambigüedad. NO resolver por atajo-override sin criterio del autor (regla de memoria: calidad > tokens en disputed).
- **Las negativas son inequívocas** y NO deben generar disputa: partitivos-035 (`Non compro ___ pane.` → ∅ correcta) y partitivos-037 (`Non ho ___ amici a Roma.` → ∅ correcta) — el italiano omite el partitivo en negativa sin excepción a este nivel.

## Issues Encountered

- Ninguno durante la finalización. La autoría (Tasks 1-2) y la revisión (Task 3) se completaron antes del handoff de continuación; este agente solo finaliza (no re-autoriza ejercicios).

## User Setup Required

None — sin configuración de servicios externos (proyecto zero-deps, web estática, CLAUDE.md).

## Next Phase Readiness

- **12-03 (match + clasificación PART-05):** archivo listo para append. **Restricción dura: target FINAL N <= 44** (techo de verify); 12-02 ya aporta 37, así que adiciones modestas (~1-2 match + ~4-5 PART-05). 12-03 fija el N canónico.
- **12-04 (integración 3-count lockstep):** categories.json YA tiene el entry partitivos order 9 (verificar, NO re-añadir); pendiente el bump del reporter `TOTAL_EXPECTED` + línea de test `CATEGORIES_WITH_EXPLANATIONS` con la cuenta exacta (la fija 12-03).
- **12-05 (validación por quórum cross-vendor):** los 37 ejercicios están en `validation.status: "pending"`. Atención prioritaria a partitivos-034 y partitivos-036 (doble-validez D-02, autor es oráculo). Negativas 035/037 inequívocas.

## Self-Check: PASSED

- FOUND: `.planning/phases/12-partitivos/12-02-SUMMARY.md`
- FOUND: `content/exercises/partitivos.json`
- FOUND commit c415487 (Task 1 + categories.json deviation)
- FOUND commit 780bf64 (Task 2)
- FOUND commit e30e225 (reviewer fix partitivos-010)

---
*Phase: 12-partitivos*
*Completed: 2026-05-28*
