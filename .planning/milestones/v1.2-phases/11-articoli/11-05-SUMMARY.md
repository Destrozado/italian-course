---
phase: 11-articoli
plan: 05
subsystem: testing
tags: [validation, quorum, multi-vendor, deepseek, opus, gate, articoli]

# Dependency graph
requires:
  - phase: 11-04
    provides: "articoli cableado en los 3 puntos de integración (categories.json + reporter + test) con conteos en lockstep N=56; reporter exit 1 solo por status pending"
  - phase: 11-03
    provides: "content/exercises/articoli.json con 56 ejercicios finales (48 base + 2 match + 6 bridges)"
provides:
  - "56/56 ejercicios de articoli.json en validation.status=validated, cada uno con >=2 by distintos (quorum cross-vendor)"
  - "GATE VERDE Phase 11: reporter exit 0 (328/328 validated) + smoke estricto VAL_07_STRICT=1 verde (268/0)"
  - "Infra de validación multi-proveedor reutilizable: scripts/validate-ai-pass.mjs (gemini-*/deepseek-* con auto-fallback 429) + docs/VALIDACION-QUORUM.md"
affects: [12-partitivos, verify-phase-11, complete-milestone-v1.2]

# Tech tracking
tech-stack:
  added: ["DeepSeek Flash + Opus 4.7 como pool de quorum cross-vendor (deviation del canon Opus+Sonnet de v1.1)", "scripts/validate-ai-pass.mjs (multi-provider, auto-fallback en 429)"]
  patterns: ["Quorum multi-vendor (>=2 by distintos de vendors diferentes) como refuerzo del invariante de quorum", "Guía de selección de pool por verificación en docs/VALIDACION-QUORUM.md"]

key-files:
  created:
    - "scripts/validate-ai-pass.mjs"
    - "docs/VALIDACION-QUORUM.md"
    - ".env.example"
  modified:
    - "content/exercises/articoli.json"

key-decisions:
  - "Pool de quorum cross-vendor (DeepSeek Flash + Opus 4.7) en vez del canon v1.1 (Opus+Sonnet), a petición explícita del autor para probar validación multi-vendor. Invariante >=2 by distintos preservado."
  - "El quorum cross-vendor capturó 8 bugs reales de autoría que habían pasado los checkpoints human-verify de 11-02/11-03: las dos contracciones preposición+artículo, un leak de triggers fonéticos en match, y 5 acentos graves faltantes."

patterns-established:
  - "Quorum multi-vendor: usar vendors distintos (no solo modelos distintos del mismo vendor) endurece la detección — DeepSeek fue estricto en acentos donde Opus fue lenient."
  - "Validador multi-proveedor con auto-fallback en 429 (scripts/validate-ai-pass.mjs) reutilizable para Phase 12."

requirements-completed: [ART-08]

# Metrics
duration: ~40min
completed: 2026-05-28
---

# Phase 11 Plan 05: Validación por Quórum + Gate Verde Summary

**56/56 ejercicios de articoli validados por quórum cross-vendor (DeepSeek Flash + Opus 4.7); 8 bugs de autoría capturados y corregidos; gate verde cerrado (reporter exit 0 328/328, smoke estricto 268/0).**

## Performance

- **Duration:** ~40 min (sesión interactiva del operador)
- **Completed:** 2026-05-28
- **Tasks:** 2 (Task 1 checkpoint:human-action ejecutado interactivamente por el operador; Task 2 verificación de gate)
- **Files modified:** 1 contenido (articoli.json) + 3 infra creados (validate-ai-pass.mjs, VALIDACION-QUORUM.md, .env.example)

## Accomplishments
- Todos los 56 ejercicios de `content/exercises/articoli.json` flipados de `pending` a `validated`, cada uno con `passes[]` de >=2 `by` distintos (pool cross-vendor claude-opus-4-7 + deepseek-v4-flash), todas verdict `correcta`.
- GATE VERDE de Phase 11 cerrado: `node scripts/run-validation-271.mjs` → exit 0 (328/328 validated, sub-gates VAL-04/VAL-06/VAL-08 PASS). `VAL_07_STRICT=1 node --test tests/*.test.js` → 268 pass / 0 fail.
- Infra de validación multi-proveedor añadida y reutilizable para Phase 12: `scripts/validate-ai-pass.mjs` (providers gemini-*/deepseek-* con auto-fallback en 429) y `docs/VALIDACION-QUORUM.md` (guía de selección de pool por verificación). `.env` (git-ignored) con GEMINI_API_KEY + DEEPSEEK_API_KEY; `.env.example` los documenta.
- 8 bugs reales de autoría capturados por el quórum (habían pasado los checkpoints human-verify de 11-02/11-03), todos corregidos y re-validados.

## Task Commits

Infra y validación se commitearon durante la sesión:

1. **Infra quorum multi-provider** - `ae95d42` (feat: Gemini cross-vendor quorum validator + pool docs), `41999b9` (feat: generalize a multi-provider + auto-fallback)
2. **Primera tanda de fixes** - `d61a574` (fix: 4 bugs de articoli detectados por quórum cross-vendor)
3. **Quorum pass + segunda tanda** - `730e9d6` (test: quorum pass DeepSeek-flash + Opus 4.7 sobre 56 articoli), `9a8cf49` (fix: 8 bugs del quórum), `263767d` (test: revalidar los 8 → 56/56 validated)

**Plan metadata:** (este commit — docs: complete plan)

## Files Created/Modified
- `content/exercises/articoli.json` - 56 ejercicios flipados a validation.status=validated con passes[] cross-vendor; 8 correcciones de autoría aplicadas
- `scripts/validate-ai-pass.mjs` - validador multi-proveedor (gemini-*/deepseek-*) para pass de quorum con auto-fallback en 429
- `docs/VALIDACION-QUORUM.md` - guía de selección de pool de IAs por verificación
- `.env.example` - documenta GEMINI_API_KEY + DEEPSEEK_API_KEY (el .env real es git-ignored)

## Decisions Made
- **Pool de quórum cross-vendor (DeepSeek Flash + Opus 4.7)** en vez del canon v1.1 (Opus 4.7 + Sonnet 4.6). Decisión explícita del autor para probar validación multi-vendor. El invariante editorial (>=2 `by` distintos, todas `correcta`) se mantiene; lo que cambia es que los dos validadores son de vendors diferentes, lo que endureció la detección (DeepSeek estricto en acentos graves donde Opus fue lenient).

## Deviations from Plan

### Pool de validación cross-vendor (deviation del canon v1.1)

El plan (Task 1, paso 2) deja la elección de pool como decisión del operador antes de lanzar, con el canon v1.1 (Opus+Sonnet) como default y el invariante "> =2 by distintos". El operador eligió un pool NUEVO cross-vendor: **claude-opus-4-7 + deepseek-v4-flash**. Esto NO viola ningún invariante (>=2 by distintos, todas correcta, 0 disputed, 0 deferred) — es una variación consciente del pool, registrada aquí como feedback para Phase 12: el cross-vendor capturó bugs que un pool single-vendor (Opus+Sonnet) había dejado pasar en los human-verify de 11-02/11-03.

### Bugs de autoría capturados por el quórum (Rule 1 - corrección de contenido, fuera del alcance de re-autoría pero necesarios para cerrar el gate)

El quórum capturó 8 bugs reales en el bloque base — todos en ejercicios que ya habían pasado los checkpoints human-verify de 11-02/11-03. Corregidos y re-validados:

- **008** (`a`+`lo`→`allo`) y **011** (`su`+`lo`→`sullo`): contracción preposición+artículo — consenso de ambas IAs.
- **049**: la instrucción del match leakeaba triggers fonéticos (violación R1/C5) — consenso de ambas IAs.
- **013 / 028 / 038 / 042 / 043**: acentos graves faltantes (`c'è` / `più`). DeepSeek estricto en acentos, Opus lenient; **038/043** los falló ambos y se capturaron por escaneo sistemático.

Las correcciones se commitearon en `d61a574` (4 fixes) y `9a8cf49` (8 fixes), con re-validación en `263767d`.

---

**Total deviations:** Pool cross-vendor (variación consciente del default, invariantes preservados) + 8 correcciones de autoría (Rule 1, necesarias para el gate verde).
**Impact on plan:** Ninguna desviación de scope. La validación es justamente la red de seguridad que el plan pide; el pool cross-vendor la endureció. ART-08 satisfecho exactamente como exige el plan.

## Issues Encountered
- Algunos pases de DeepSeek devolvieron 429 (rate limit); el validador `validate-ai-pass.mjs` los maneja con auto-fallback, sin intervención manual.

## TDD Gate Compliance
No aplica como ciclo TDD de software — los commits `test(11-05)` son pases de quórum y revalidación de contenido editorial, no RED/GREEN de código.

## User Setup Required
None - el `.env` con las API keys ya está configurado localmente (git-ignored); `.env.example` documenta las variables requeridas para reproducir.

## Next Phase Readiness
- Phase 11 lista para `/gsd:verify-phase 11`: 5/5 planes completos, gate verde, ART-01..08 cubiertos en conjunto, 0 disputed, 0 deferred.
- Infra multi-proveedor (`validate-ai-pass.mjs` + `VALIDACION-QUORUM.md`) disponible para reutilizar en Phase 12 (Partitivos). Feedback: el cross-vendor detecta bugs que el single-vendor deja pasar — considerar pool cross-vendor por defecto en v1.2.

## Self-Check: PASSED

- SUMMARY.md exists.
- Commits ae95d42, 41999b9, d61a574, 730e9d6, 9a8cf49, 263767d all present in git.
- Infra files scripts/validate-ai-pass.mjs + docs/VALIDACION-QUORUM.md exist.

---
*Phase: 11-articoli*
*Completed: 2026-05-28*
