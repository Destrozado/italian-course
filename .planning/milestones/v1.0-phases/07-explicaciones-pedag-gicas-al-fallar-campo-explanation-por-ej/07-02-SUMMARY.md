---
phase: 07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej
plan: 02
subsystem: content
tags: [seed-content, schema-validator, project-evolution, audit-trail, smoke-tests]

requires:
  - phase: 07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej (Plan 07-01)
    provides: schema validator extension + render UI dual (session+summary) + 2 seed explanations + 12 tests paramétricos
provides:
  - 48 explanations curadas adicionales en content/exercises/preposiciones.json (Batch A 15 + B 16 + C 17) — total 50/50 coverage
  - Smoke test paramétrico "Preposiciones explanation coverage" con 3 sub-tests (coverage 50/50, ASCII apóstrofes, no markdown markers) — defensa contra regresiones editoriales futuras
  - PROJECT.md Out-of-Scope reapertura — entrada "Explicaciones pedagógicas" movida a Validated con audit trail del pivote post-uso-real
  - PROJECT.md Key Decisions fila nueva (2026-05-25) documentando la razón del pivote (271 ejercicios → autor consultaba Gemini cada fallo Preposiciones)
  - REQUIREMENTS.md sección Explicaciones pedagógicas (EXPL) con EXPL-01..05 + traceability tabla extendida + UX-01/UX-02 status corregido (Not started → Complete) + Coverage 48/48 (100%)
  - ROADMAP.md Phase 7 finalizada — Goal + 6 Success Criteria + 2 Plans con check + Progress tabla actualizada
affects: [Phase 7.x (futuro opcional — explanations para las otras 6 categorías si emerge dolor adicional)]

tech-stack:
  added: []
  patterns:
    - "Patrón D-85 (Claude propone + autor revisa por bloque + commit incremental) validado por 3ª vez (Phase 4 SEED-01 + Phase 5 Essere + Phase 7 Preposiciones)"
    - "Smoke test paramétrico paramétrico Phase 5 extendido — lectura del filesystem real vs fixture in-memory para validar contenido"
    - "PROJECT.md evolution explícita — Out of Scope → Validated con audit trail es ahora un patrón establecido (D-134)"

key-files:
  created:
    - .planning/phases/07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej/07-02-SUMMARY.md
  modified:
    - content/exercises/preposiciones.json
    - tests/exercise-types.test.js
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md

key-decisions:
  - "Markers en español natural (Cuidado/¡Atencion!/Ojo/Importante) reemplazaron jerga curricular 'Pitfall A1' tras refine del autor en Batch A — feedback que iteró el tono editorial hacia un registro accesible para el target real (autor hispanohablante aprendiendo, no docente certificando)"
  - "Format preservation: writeback con string-insertion targeted en vez de json.dump (que expandía arrays compactos a multi-línea, generando 365 líneas de diff cosmético sin valor). Convention: avere.json/essere.json usan inline arrays — preposiciones.json mantiene la coherencia"
  - "Batch sizes 15+16+17 = 48 (no 16+16+16) — el plan original sugería 3 batches de 16 pero el conteo real excluye preposiciones-006 ya seedeado en Plan 07-01. El executor ajustó la distribución para llegar a 50/50 exactos"
  - "UX-01/UX-02 traceability status corregido (Not started → Complete) como side-effect del Phase 7 closure — resolvía el warning MEDIUM del plan-checker pre-execution sobre matemática inconsistente de Coverage 48/48"

patterns-established:
  - "Pattern (Phase 7): Smoke test paramétrico de coverage editorial — defiende contra eliminaciones accidentales + cambios silenciosos en archivos JSON authored manualmente. Aplicable a cualquier categoría futura donde se espere coverage completo"
  - "Pattern (Phase 7): Auditable PROJECT.md evolution — entrada Out of Scope movida con audit trail (motivación + UAT evidencia + fecha + Key Decision) en vez de simple deletion. Setup para futuras reaperturas de decisiones iniciales si la realidad del uso lo demuestra"
  - "Pattern (Phase 7): Pedagogical tone refinement loop — author marks 'Pitfall A1' as jargon → executor proposes natural Spanish alternatives (Cuidado/¡Atencion!/Ojo/Importante) → author approves. Tone iteration por checkpoint preserva la velocidad sin sacrificar accuracy"

requirements-completed: [EXPL-04, EXPL-05]

duration: ~60min
completed: 2026-05-25
---

# Phase 07 Plan 02: 48 explanations Preposiciones + audit trail Summary

**50/50 explanations curadas para `content/exercises/preposiciones.json` via patrón D-85 (3 batches con review autor frase por frase) + smoke test paramétrico + reapertura PROJECT.md Out of Scope con audit trail del pivote post-uso-real**

## Performance

- **Duration:** ~60 min (executor + 3 batch reviews + UAT humano)
- **Completed:** 2026-05-25
- **Tasks:** 5 (3 batch checkpoints + 1 auto docs/smoke + 1 UAT final)
- **Files modified:** 5 (content/exercises/preposiciones.json, tests/exercise-types.test.js, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md)
- **Commits:** 4 (3 batches + 1 docs/smoke + SUMMARY.md final)

## Accomplishments

- **48 explanations curadas adicionales** en `preposiciones.json` cubriendo todas las áreas del PDF de la profesora:
  - **Batch A (15)**: simples + casos idiomáticos (Di origen, A casa/ciudad/hora, In paese, Da provenienza, Con compagnia, Per scopo/durata, Tra tempo futuro) + primeras articolate (Al, Sul, Dalla).
  - **Batch B (16)**: tabla completa de articolate Di+articolo (del/dello/della/dei/degli/delle) y In+articolo (nel/nello/nella/nei/negli/nelle) + 3 usos especializados (Da agente en pasiva, In medios de transporte cerrados, Su argomento).
  - **Batch C (17)**: cierre de articolate A (alla/ai/agli/alle) + Da (dal/dallo/dai/dagli/dalle) + Su (sullo/sulla/sui/sugli/sulle) + 2 casos especiales (fra eufónico, con instrumental).
- **Smoke test paramétrico** (3 sub-tests) defiende contra regresiones editoriales futuras: coverage 50/50, ASCII apóstrofes (CONT-06/D-129), no markdown markers (D-126). Lee del filesystem real, no fixture.
- **PROJECT.md reapertura ejecutada (D-134)**: entrada "Explicaciones pedagógicas / mostrar la regla al fallar o acertar — solo bien/mal por velocidad; la teoría está en los PDFs" REMOVIDA de Out of Scope. Nueva sección "Phase 7 — Explicaciones pedagógicas al fallar (2026-05-25)" añadida en Validated con 6 checkmarks. Key Decisions tabla extendida con fila documentando la razón del pivote post-uso-real (271 ejercicios + autor consultaba Gemini).
- **REQUIREMENTS.md sección EXPL-01..05** añadida con detalles completos por requisito + traceability tabla extendida con 5 filas nuevas. UX-01/UX-02 status flipped de "Not started" a "Complete (Plan 06-01 + 06-02 UAT)" — resuelve el warning MEDIUM del plan-checker pre-execution sobre la matemática inconsistente del Coverage. Final: 48/48 (100%).
- **ROADMAP.md Phase 7 finalizado**: marcada `[x] complete`, Plans 07-01/07-02 `[x]` con links a SUMMARYs, Progress tabla actualizada (Phase 7: 2/2 Complete).
- **181/181 tests verdes**: 166 baseline + 12 schema validator paramétricos D-116 (Plan 07-01) + 3 smoke coverage Preposiciones (Plan 07-02).
- **UAT humano 7/7 PASS**: autor confirmó render inline en 5+ fallos + render summary + cobertura completa 50/50 + graceful degradation en otras 6 categorías + tests verdes + backup roundtrip + audit trail PROJECT.md.

## Task Commits

1. **Task 1 (Batch A):** `31cedbc` feat(07-02): batch A — 15 explanations preposiciones (002-005, 007-017 — author-reviewed) (EXPL-04 parcial)
2. **Task 2 (Batch B):** `152691c` feat(07-02): batch B — 16 explanations preposiciones (018-033 — author-reviewed) (EXPL-04 parcial)
3. **Task 3 (Batch C):** `5db504f` feat(07-02): batch C — explanations finales preposiciones (034-050 — author-reviewed) — 50/50 coverage (EXPL-04 done)
4. **Task 4 (Smoke + docs):** `e929feb` feat(07-02): smoke coverage + PROJECT.md Out-of-Scope reapertura + REQUIREMENTS.md EXPL-01..05 + ROADMAP.md Phase 7 finalizada (EXPL-05)
5. **Task 5 (UAT):** documento sin commit propio — approval del autor; SUMMARY.md commit final cierra el plan.

## Files Modified

- `content/exercises/preposiciones.json` — 48 entries (preposiciones-002..005, 007-050 menos 006) ahora tienen `payload.explanation` curada. Coverage 2 → 50/50. Format compacto preservado (arrays inline coherentes con avere.json/essere.json).
- `tests/exercise-types.test.js` — nuevos imports `fileURLToPath/dirname/resolve` + describe block "Preposiciones explanation coverage" con 3 sub-tests.
- `.planning/PROJECT.md` — Out of Scope entry removida + Validated section Phase 7 con 6 checkmarks + Key Decisions fila 2026-05-25.
- `.planning/REQUIREMENTS.md` — subsección EXPL-01..05 + 5 filas nuevas en Traceability + UX-01/UX-02 status corregido + Coverage 48/48 (100%) + nota Last updated 2026-05-25.
- `.planning/ROADMAP.md` — Phase 7 line marcada `[x]`, Phase Details actualizada con plans completados + Progress tabla + Coverage Summary + Last updated.

## Decisions Made

- **Markers naturales en español vs "Pitfall A1"** (refine en Batch A): el autor pidió reemplazar jerga curricular ("Pitfall A1 frecuente") por markers naturales en español (Cuidado:, ¡Atencion!:, Ojo:, Importante:). Decisión: usar variedad en lugar de un único marker para evitar repetición cuando el autor lea múltiples explanations en una sesión.
- **Format preservation con string-insertion targeted** (técnico durante Batch A commit): el primer intento usaba `json.dump(indent=2)` que expandió los arrays inline (`["preposiciones"]`) a multi-línea, generando 365 líneas de diff cosmético. Solución: regex `("correctIndex":\s*\d+)(\s*\n\s*\})` localiza el cierre del payload y inserta `,\n        "explanation": "..."` preservando todo el resto del formato. Aplicado igual a Batches B y C.
- **Batch sizes 15+16+17 = 48 vs plan original 16+16+16 = 48**: el plan asumió 16 por batch pero el conteo real excluye preposiciones-006 ya seedeado en Plan 07-01. El executor verificó el orden del JSON y redistribuyó para llegar a 50/50 exactos.
- **UX-01/UX-02 status fix como side-effect**: el plan-checker MEDIUM warning sobre matemática inconsistente del Coverage 48/48 — REQUIREMENTS.md líneas 164-165 marcaban UX-01/UX-02 como "Not started" cuando el cuerpo (líneas 74, 76) los tenía como `[x]` Phase 6 completed. Plan 07-02 Task 4 los flipped a "Complete" con referencias a los UATs Phase 6 — resuelve la inconsistencia pre-existente.

## Deviations from Plan

### Auto-fixed Issues

**1. [Diff hygiene] JSON format expansion en primer commit Batch A**
- **Found during:** Task 1 commit
- **Issue:** `json.dump(indent=2)` expandió arrays inline a multi-línea (370 líneas de diff cosmético sin valor).
- **Fix:** `git reset --soft HEAD~1` para descartar commit, restore desde HEAD, reescribir con string-insertion targeted via regex que preserva format compacto del proyecto.
- **Files modified:** content/exercises/preposiciones.json
- **Verification:** `git diff --stat` muestra 30 insertions / 15 deletions (puro contenido nuevo, cero noise).
- **Committed in:** `31cedbc` (Task 1 re-commit)

**2. [Plan accuracy] Batch sizes ajustados de 16+16+16 a 15+16+17**
- **Found during:** Task 1 read del JSON
- **Issue:** El plan asumía 16 por batch pero el conteo real excluye preposiciones-006 ya seedeado en Plan 07-01.
- **Fix:** Executor redistribuyó: Batch A 002..017 menos 006 = 15, Batch B 018..033 = 16, Batch C 034..050 = 17. Coverage final exacto 50/50.
- **Files modified:** ninguno (ajuste de planning solo).
- **Verification:** `python3 -c "import json; d=json.load(open('content/exercises/preposiciones.json')); print(sum(1 for x in d['exercises'] if x['payload'].get('explanation')), '/', len(d['exercises']))"` → `50 / 50`.

---

**Total deviations:** 2 auto-fixed (1 diff hygiene, 1 plan accuracy)
**Impact on plan:** Cero impacto en deliverables; ambos fixes alinean la ejecución con la intención del plan + convenciones del proyecto. Sin scope creep.

## Issues Encountered

- **"Pitfall A1" jargon** detectado por el autor en Batch A review — refine aplicado a 4 explanations (preposiciones-002, -004, -015, -016) usando markers naturales en español. Patrón pedagógico mejorado para todas las explanations subsequentes (Batches B y C no usaron jargon académico).

## User Setup Required

None — no external service configuration.

## Verification Outputs

- `node --test tests/*.test.js` → **181/181 verdes** (166 baseline + 12 schema D-116 Plan 07-01 + 3 smoke coverage Plan 07-02).
- `python3 -c "import json; d=json.load(open('content/exercises/preposiciones.json')); print(sum(1 for x in d['exercises'] if x['payload'].get('explanation')), '/', len(d['exercises']))"` → `50 / 50`.
- Smart quote scan → 0 violations.
- Markdown markers scan → 0 violations.
- `grep -c "EXPL-0" .planning/REQUIREMENTS.md` → 12 (5 IDs × ~2 ocurrencias entre sección + traceability + coverage).
- `grep -c "EXPL-0" .planning/ROADMAP.md` → 4 (Phase 7 requirements line + 2 plan lines + Last updated note).
- `grep -A1 "### Out of Scope" .planning/PROJECT.md | grep -i "explicaciones pedag"` → empty (entrada removida correctamente).
- `grep -c "Explicaciones pedag" .planning/PROJECT.md` → 2 (Validated + Key Decisions, ya no en Out of Scope).
- UAT humano 7/7 PASS — autor confirmó: 5+ fallos Preposiciones con explanation inline (incluye los 4 ejemplos canónicos que motivaron Phase 7: sulle/dalle/sui patrón + da lui), summary "Errores cometidos" muestra las mismas explanations, otras 6 categorías sin afectación (graceful degradation), tests verdes, backup roundtrip preserva state v4 sin explanations, audit trail PROJECT.md/REQUIREMENTS.md/ROADMAP.md visible.

## Phase 7 Closure Summary

**Phase 7 cierra con todos los Success Criteria del ROADMAP cumplidos:**

1. ✓ `content/exercises/preposiciones.json` tiene 50/50 entries con `payload.explanation` no vacío, validado por schema + smoke test paramétrico.
2. ✓ Al fallar cualquiera de los 50 ejercicios de Preposiciones durante sesión real, el autor ve la explanation italic muted bajo "Respuesta correcta" inline + replicada en summary "Errores cometidos".
3. ✓ Los 221 ejercicios de las otras 6 categorías siguen funcionando sin cambios (graceful degradation — `<p class="session-explanation">` no se renderiza cuando explanation está ausente).
4. ✓ Cero migración schemaVersion (sigue 4 — explanation es contenido en `content/`, no state).
5. ✓ T-02-01 anti-XSS preservado: todas las explanations se renderizan via `x-text` exclusivo; markdown literal no se interpreta.
6. ✓ UAT humano: autor falló deliberadamente 5+ ejercicios de Preposiciones en Repaso 20 + vio explanation curada en cada uno + repaso agregado en summary.

**Tests delta:** 166 baseline → 181 verdes (delta +15: 12 schema D-116 + 3 smoke coverage Preposiciones).

**Milestone v1.0 ampliado**: con explicaciones pedagógicas opcionales — Preposiciones cubierta como seed completo (50/50); las otras 6 categorías (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) quedan opcionales para fases incrementales futuras (Phase 7.1, 7.2, ...) si emerge dolor adicional durante uso.

## Next Phase Readiness

- **Phase 7 cierra completamente.** Verifier pass (gsd-verifier) confirmará goal-backward que el codebase entrega lo prometido. Esperado: phase.complete=true.
- **Milestone v1.0 funcionalmente completo + extendido.** Considerar `/gsd:complete-milestone v1.0` para archivar la milestone con todos los phases (1-7) cerrados.
- **Sin blockers para próximas iteraciones.** Si emerge dolor adicional sobre las otras 6 categorías, Phase 7.1+ puede arrancar replicando el patrón D-85 sobre cada categoría individual sin modificar infraestructura (el schema validator extension de Plan 07-01 ya cubre los 3 tipos).
- **Patrón D-85 validado por 3ª vez** (Phase 4 SEED-01 + Phase 5 Essere + Phase 7 Preposiciones) — el flujo "Claude propone batch + autor revisa frase por frase + commit incremental" es ahora un canon del proyecto para trabajo editorial.

---
*Phase: 07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej*
*Completed: 2026-05-25*
