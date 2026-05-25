---
phase: 07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej
plan: 01
subsystem: ui
tags: [alpine-js, pico-css, schema-validator, content, anti-xss]

requires:
  - phase: 01-loop-m-nimo-end-to-end-avere-multiple-choice
    provides: T-02-01 (x-text exclusivo, anti-XSS), CONT-06 (NFC + apóstrofes ASCII), D-02 (layer purity)
  - phase: 03-variedad-de-ejercicios-ergonom-a-de-teclado
    provides: PAYLOAD_VALIDATORS dispatch table + 3 sub-templates session screen
  - phase: 06-polish-ux-post-sesion-reiniciar-y-review-errores
    provides: summary-errors section + summarySessionResults snapshot + content.exerciseById lookup
provides:
  - Campo opcional `payload.explanation: string` en los 3 tipos de ejercicio (multi-choice / word-buttons / match)
  - Render inline durante feedback rojo en sesión (3 sub-templates) via `<p class="session-explanation">`
  - Render en summary "Errores cometidos" (3 sub-templates) via `<p class="summary-error-explanation">`
  - 2 reglas CSS muted/italic alineadas con UI-SPEC Phase 6 — sin tokens nuevos
  - 2 seed explanations curadas en preposiciones-001 + preposiciones-006 (vertical slice visible)
  - 12 tests paramétricos schema validator (4 sub-cases × 3 tipos)
affects: [07-02-PLAN.md (entrega 48 explanations restantes + smoke coverage + reapertura PROJECT.md Out of Scope)]

tech-stack:
  added: []
  patterns:
    - "D-116: schema validator extension pattern — `if (ex.payload.X !== undefined) check type/shape` añade campos opcionales sin migración"
    - "D-117/D-118/D-119: doble-guard `x-show` (feedback state + payload presence) para render condicional sin placeholders"
    - "D-120: CSS shared selector para reglas visualmente idénticas con clases distintas (futuro-proofing customization)"

key-files:
  created: []
  modified:
    - src/data/schema-validator.js
    - index.html
    - styles.css
    - content/exercises/preposiciones.json
    - tests/exercise-types.test.js

key-decisions:
  - "D-116: extensión schema vía 1 bloque if-typeof-string en cada validateXxxPayload — sin refactor del dispatch table, sin migración schemaVersion"
  - "D-117/D-118: doble guard x-show (sessionFeedback==='incorrect' && payload.explanation) — graceful degradation D-121 sin placeholder"
  - "D-119: optional chaining `content.exerciseById[result.exerciseId]?.payload?.explanation` en summary — defensa contra exerciseId stale aunque CR-01 Phase 6 ya filtra"
  - "D-120: 2 clases CSS distintas con regla compartida — reutiliza --pico-muted-color, italic, font-size 0.9em, márgenes 4px múltiplos"
  - "Seed minimal en 07-01 (2 ejercicios) para UAT visible; 48 restantes en 07-02"

patterns-established:
  - "Pattern (Phase 7): Optional payload fields via `!== undefined` check — preserves back-compat across N existing entries, enables incremental seed"
  - "Pattern (Phase 7): Render dual (in-session + in-summary) con misma clase visual base — coherencia cross-context para repaso post-error"

requirements-completed: [EXPL-01, EXPL-02, EXPL-03]

duration: ~50min
completed: 2026-05-25
---

# Phase 07 Plan 01: Explanation infra + UI render + 2 seeds Summary

**Optional `payload.explanation: string` field across 3 exercise types + dual render (inline feedback + summary-errors) + 2 seed explanations en preposiciones-001/006, todo en una vertical slice con UAT 6/6 PASS**

## Performance

- **Duration:** ~50 min (executor + UAT humano)
- **Completed:** 2026-05-25
- **Tasks:** 3 (Task 1 + Task 2 auto, Task 3 checkpoint UAT)
- **Files modified:** 5 (src/data/schema-validator.js, index.html, styles.css, content/exercises/preposiciones.json, tests/exercise-types.test.js)
- **Lines:** +207 / -2

## Accomplishments

- **Schema validator extendido (D-116):** 3 reglas idénticas en validateMultipleChoicePayload, validateWordButtonsPayload, validateMatchPayload — patrón `if (ex.payload.explanation !== undefined) { if (typeof !== 'string' || !trim()) push(...) }`. Cero refactor del dispatch table, cero migración schemaVersion (sigue v4).
- **Render UI dual (D-117/D-118/D-119):** 3 bloques `<p class="session-explanation">` en sub-templates session + 3 bloques `<p class="summary-error-explanation">` en sub-templates summary-errors, todos con `x-text` exclusivo (T-02-01) + doble guard `x-show`.
- **CSS muted/italic (D-120):** 2 reglas compartiendo un único selector — `color: var(--pico-muted-color); font-style: italic; font-size: 0.9em; margin: 0.5rem 0` (8px = múltiplo 4 per UI-SPEC §Spacing Phase 6). Cero tokens nuevos.
- **2 seed explanations curadas y revisadas por el autor:** preposiciones-001 (Di con ciudades — diferenciación de Da) + preposiciones-006 (Sul = Su + Il preposizione articolata). Apóstrofes ASCII U+0027, plain text, 264-270 chars.
- **12 tests nuevos paramétricos:** 4 sub-cases (sin explanation back-compat / string aceptado / number rechazado / vacío rechazado) × 3 tipos = 12. Baseline 166 → 178 verdes.
- **UAT humano vertical slice 6/6 PASS:** autor confirmó render inline + graceful degradation + render summary + boot back-compat + tono visual didáctico + plain text sin markdown.

## Task Commits

1. **Task 1:** `c6b6483` feat(07-01): extend payload validators with optional explanation rule (EXPL-01)
2. **Task 2:** `66b83c6` feat(07-01): render explanation in session + summary-errors + 2 seed preposiciones (EXPL-02 EXPL-03)
3. **Task 3 (UAT):** documento sin commit propio — approval del autor, SUMMARY.md commit final cierra el plan.

## Files Modified

- `src/data/schema-validator.js` — 3 bloques `if (ex.payload.explanation !== undefined)` al final de validateMultipleChoicePayload (~líneas 162-171), validateWordButtonsPayload (~196-208), validateMatchPayload (~234-254).
- `index.html` — 3 `<p class="session-explanation">` en sub-templates session (multi-choice ~líneas 278-280, word-buttons ~líneas 329-331, match ~líneas 407-409) + 3 `<p class="summary-error-explanation">` en sub-templates summary-errors (multi-choice ~líneas 542-547, word-buttons ~líneas 549-554, match ~líneas 556-570).
- `styles.css` — 2 reglas nuevas al final del archivo: selector compartido `.session-explanation, .summary-error-explanation` con muted/italic/0.9em/4px-margins.
- `content/exercises/preposiciones.json` — campo `"explanation"` añadido a preposiciones-001 y preposiciones-006 (sin tocar prompt/options/correctIndex/categoryIds).
- `tests/exercise-types.test.js` — describe block paramétrico nuevo al final: `'data/schema-validator — payload.explanation (Phase 7 D-116)'` con 12 tests.

## Seed Explanations Finales (texto literal en JSON)

**preposiciones-001** ("Sono ___ Roma" → "di") — 270 chars / 49 palabras:
> La preposicion Di indica origen o procedencia: de donde viene alguien o algo de forma estable. Con nombres de ciudad va sin articulo: Sono di Roma significa 'soy de Roma'. Distinta de Da, que marca el punto de partida de un movimiento (Vengo da Roma = vengo desde Roma).

**preposiciones-006** ("Il gatto è ___ tavolo" → "sul") — 264 chars / 52 palabras:
> Su significa 'sobre' o 'encima de' con contacto fisico. Cuando va seguida del articulo definido se fusiona en una preposicion articolata: Su + Il (masc sing) = Sul. Il gatto e sul tavolo = el gato esta sobre la mesa. Mismo patron: Su + La = Sulla, Su + Le = Sulle.

## Decisions Made

- **Tests en `tests/exercise-types.test.js` (no archivo separado):** mantener convención existente del proyecto (los tests de validator ya viven ahí en describe blocks por tipo). NO crear `tests/schema-explanation.test.js` separado.
- **Selector CSS combinado:** una sola regla `.session-explanation, .summary-error-explanation` porque visualmente son idénticas (D-120). Si en el futuro el autor las quiere diferenciar, basta separarlas — las clases ya son distintas.
- **Texto canónico de explanations curado:** Claude propuso, autor revisó frase por frase (patrón D-85). Resultado: ambas explanations conservan el tono 3ª impersonal + regla + ejemplo paralelo, con contrastes contextuales (Di vs Da, Sul/Sulla/Sulle pattern) que reforzaron la mneumónica más allá del simple "regla + caso".

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration.

## Verification Outputs

- `node --test tests/*.test.js` → 178/178 verdes (baseline 166 + 12 nuevos).
- `grep -c "if (ex.payload.explanation !== undefined)" src/data/schema-validator.js` → 3.
- `grep -c 'class="session-explanation"' index.html` → 3.
- `grep -c 'class="summary-error-explanation"' index.html` → 3.
- `grep -c "x-html" index.html` → 0 (T-02-01 invariante preservado).
- `python3 -c "..."` preposiciones.json coverage → 2/50.
- Smart-quote scan → PASS (apóstrofes ASCII únicamente).
- UAT humano 6/6 PASS — autor confirmó: render inline visible, graceful degradation sin placeholder, render summary correcto, boot back-compat (banner CONT-05 silencioso), tono visual didáctico no error, plain text sin interpretar markdown.

## Next Phase Readiness

- **Plan 07-02 listo para arrancar.** Plan 07-01 entregó la infra completa — Plan 07-02 solo añade 48 explanations adicionales en `content/exercises/preposiciones.json` (3 batches D-85 ~16 cada uno), smoke test paramétrico de coverage 50/50, y la reapertura del PROJECT.md Out of Scope (D-134) + REQUIREMENTS.md EXPL-01..05 sección dedicada + ROADMAP.md Phase 7 finalización.
- **Sin blockers.** El render funciona, el schema valida, los 2 seeds son visibles end-to-end. Las 48 explanations restantes son trabajo editorial puro (sin infra adicional).
- **Invariantes preservados:** T-02-01 anti-XSS (cero x-html), CONT-06 NFC + ASCII apóstrofes, D-02 layer purity (explanation vive en content/, no en state), schemaVersion sigue 4 (cero migración).

---
*Phase: 07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej*
*Completed: 2026-05-25*
