---
phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7
plan: 01
subsystem: content
tags: [presente-regolare, passato-prossimo, multi-cat, cross-vendor-quorum, R1-R7, slot-variants]

# Dependency graph
requires:
  - phase: 30-alta-presente-regolare
    provides: "8 slots base DEFINITIVOS de presente-regolare.json (exercises.length=8) + categoria registrada order:10"
  - phase: 29-migracion-10-11
    provides: "schemaVersion 11 / state donde nace la categoria (reset selectivo de presente-regolare)"
provides:
  - "4 cruces multi-cat presente-regolare-300..303 (slot+variantes >=2) validados por quorum"
  - "matriz {compuesto·avere, compuesto·essere, presente-contraste·avere, presente-contraste·essere} cubierta"
  - "exercises.length FINAL = 12 (8 base + 4 cruces) para que Plan 02 sincronice TOTAL_EXPECTED + los 3 hardcodes"
affects: [31-02-integracion-lockstep, INT-01, INT-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cruce multi-cat en formato slot+variantes (>=2 variantes), espejo de avere-300..305 pero NO single-variant (D-31-05)"
    - "Quorum cross-vendor 1-por-1: author-oracle Claude Opus + DeepSeek (cross-vendor real via validate-ai-pass.mjs --write)"

key-files:
  created:
    - ".planning/phases/31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7/31-01-SUMMARY.md"
  modified:
    - "content/exercises/presente-regolare.json"

key-decisions:
  - "4 cruces (M=4) presente-regolare-300..303 en bloque numerico espejo de avere-300, hub presente-regolare PRIMERO en categoryIds"
  - "Todos los participios REGULARES (-ato/-uto/-ito), 0 auxiliares irregulares (sin andare/venire); essere intransitivos partire/tornare/arrivare/entrare"
  - "Cruce 301 cubre las 4 formas de concordancia participio<->sujeto: è partito (-o m-sg), è tornata (-a f-sg), sono arrivati (-i m-pl), sono entrate (-e f-pl)"
  - "Fix C4-explanation real (Rule 1, NO override): meta-comentario de curador reescrito a foco-estudiante en los 4 cruces tras flag DeepSeek en 302"

patterns-established:
  - "Author-oracle Opus aporta el 2o by distinto cuando Task no esta disponible en el executor secuencial (precedente plan 30-02)"
  - "concerns[] del pass Opus documenta el audit trail D-31-08 explicito (concordancia + auxiliar) por cruce"

requirements-completed: [PRES-07]

# Metrics
duration: ~20min
completed: 2026-06-17
---

# Phase 31 Plan 01: Cruces multi-cat presente-regolare <-> avere/essere Summary

**4 cruces presente vs passato prossimo (slot+variantes, solo participios regulares, ambas direcciones) que cierran PRES-07, todos validados por quorum cross-vendor Opus+DeepSeek con chequeo explicito de concordancia participio<->sujeto y eleccion de auxiliar (D-31-08).**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-06-17
- **Tasks:** 2
- **Files modified:** 1 (content) + 1 SUMMARY

## Accomplishments
- 4 objetos de cruce `presente-regolare-300..303` añadidos al hub `presente-regolare.json` DESPUÉS de los 8 slots base (que quedan byte-intactos): exercises.length 8 -> **12**.
- Matriz D-31-05 completa: 300 compuesto·avere, 301 compuesto·essere (con concordancia), 302 presente-contraste·avere, 303 presente-contraste·essere. categoryIds de 2 (hub primero), ≥2 variantes cada uno.
- Cruce 301 ejercita las 4 terminaciones de concordancia participio↔sujeto (-o/-a/-i/-e) variando el sujeto entre variantes (Marco / Maria / i ragazzi / le ragazze).
- Los 4 cruces a `validation.status: validated` con ≥2 passes `correcta` y `by` distintos (claude-opus-4-8 + deepseek-chat).
- schema-validator (`validateContent`, firma ES module) → 0 errores de shape; cascada D-54 intacta (2 call-sites de `applyImmediateFailure`); suite 469 tests con 0 fails NUEVOS.

## Task Commits

1. **Task 1: Autorar los 4 cruces 300..303** - `b4eddff` (feat)
2. **Task 2 (cross 300): compuesto avere** - `0e7aa5f` (validate)
3. **Task 2 (cross 301): compuesto essere, concordancia o/a/i/e** - `8bdf66a` (validate)
4. **Task 2 (cross 302): presente-contraste avere** - `774d343` (validate)
5. **Task 2 (cross 303): presente-contraste essere** - `dc4c100` (validate)

## Files Created/Modified
- `content/exercises/presente-regolare.json` - +4 objetos de cruce 300..303 (slot+variantes, validados); 8 slots base sin tocar; campo `notes` top-level intacto.
- `.planning/phases/31-.../31-01-SUMMARY.md` - este documento.

## Decisions Made
- **Verbos elegidos** (D-31-03): avere → parlare/lavorare/dormire; essere → partire/tornare/arrivare/entrare. Todos participio regular, todos A1 alta frecuencia.
- **`type` = multiple-choice** en los 4 (espejo avere-300; word-buttons no aportaba aquí sin romper el patrón).
- **`exercises.length` FINAL = 12** registrado para que el Plan 02 lo lea DINÁMICAMENTE (NUNCA hardcodear) al sincronizar `TOTAL_EXPECTED` (183 → 183+12 grano-ejercicio) y los 3 hardcodes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Quality/Bug] Reescritura de las 4 explanations a foco-estudiante (C4-explanation real)**
- **Found during:** Task 2 (quórum cross-vendor del cruce 302)
- **Issue:** DeepSeek marcó el cruce 302 `incorrecta` con flag **C4-explanation**: la explanation contenía meta-comentario de curador ("Cruce de presente-regolare con...", "se EXPONE", "no hay que conjugarla") dirigido al autor en vez de al estudiante (viola R4). NO es un falso-positivo de política (no es el C4-accent sobre español sin tildes ni el C5-gloss): es una preocupación de calidad editorial genuina. Aplicada la política `calidad > tokens, NO override-atajo`.
- **Fix:** Reescritas las explanations de los 4 cruces (no solo 302, por consistencia) para que arranquen con la regla y hablen al estudiante, eliminando el framing "Cruce..." y los "no hay que conjugarla/tocarla". Todo el contenido pedagógico (regla + ejemplo paralelo ES + gloss R7 + acentos canon) se conservó.
- **Files modified:** content/exercises/presente-regolare.json
- **Verification:** Re-pase cross-vendor 1-por-1 de los 4 → DeepSeek `correcta` 0 concerns en TODOS (incluido 302). NO se hizo override sobre el bug.
- **Committed in:** parte de los commits validate por cruce (`0e7aa5f`/`8bdf66a`/`774d343`/`dc4c100`); el texto reescrito quedó capturado con el pass que valida cada cruce.

---

**Total deviations:** 1 auto-fixed (1 Rule 1 calidad/C4 real)
**Impact on plan:** El fix mejora la calidad editorial sin tocar la gramática ni el shape. Sin scope creep — sigue siendo solo el bloque de contenido del JSON.

## Issues Encountered
- **`Task`/Agent tool no disponible en el executor secuencial** (precedente plan 30-02): el quórum cross-vendor R1-R7 se ejecutó con el pool elegible alternativo `scripts/validate-ai-pass.mjs` (DeepSeek con fallback Gemini, claves en `.env` verificadas SET) 1-por-1 (NUNCA batched, VAL-03). El segundo `correcta` distinto lo aporta el author-oracle Claude Opus (`by: claude-opus-4-8`) aplicando R1-R7 + los chequeos explícitos D-31-08; sus `concerns[]` documentan el audit trail (concordancia participio↔sujeto + elección de auxiliar) por cruce. Net: cada cruce `validated` con ≥2 passes correcta + ≥2 `by` distintos. NO se rubber-stampeó: las claves `.env` estaban presentes y el pase cross-vendor devolvió verdicts reales (cazó el C4 de 302).

## Known Stubs
None - los 4 cruces están completos y validados; sin placeholders ni datos mock.

## Threat Flags
None - los cruces cruzan el boundary content→schema-validator→engine y lo satisfacen (0 errores de shape, categoryIds resuelven contra categorías existentes). Sin superficie nueva fuera del threat_model (T-31-01/02 cubiertos).

## Next Phase Readiness
- **Plan 02 (integración lockstep) listo:** `exercises.length` FINAL = **12** (8 base + 4 cruces). Plan 02 debe sincronizar leyendo este N DINÁMICAMENTE del JSON:
  - `TOTAL_EXPECTED` en `scripts/run-validation-271.mjs` (183 → 183 + nº slots reales de presente-regolare).
  - 10ª entrada en `CATEGORIES_WITH_EXPLANATIONS` (`tests/exercise-types.test.js`) — actualmente AÚN no incluye presente-regolare (deferido a 31-02 por diseño).
  - 3er hardcode en `tests/fixtures/slot-variants-integration.test.js`.
- **Preexisting fail AJENO:** la suite mantiene 1 fail (`genero-numero.json` 12→13, quick task `260614-hxn`) — NO regresión de este plan, NO toca presente-regolare. Documentado en STATE.md.
- Cascada D-54 verificada con 2 call-sites (motor v1.4 intacto, brownfield puro).

## Self-Check: PASSED

- SUMMARY.md created and present.
- All 5 commits verified in git log: `b4eddff` (Task 1), `0e7aa5f` (300), `8bdf66a` (301), `774d343` (302), `dc4c100` (303).

---
*Phase: 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7*
*Completed: 2026-06-17*
