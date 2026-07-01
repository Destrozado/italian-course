---
phase: 36-dimostrativi-possessivi-determinantes
plan: 04
subsystem: content
tags: [possessivi, suo, loro, cruce-multicat, cascada-d54, quorum, deepseek]

requires:
  - phase: 36-dimostrativi-possessivi-determinantes
    provides: "36-03 nucleo possessivi + registro categories.json order 12; 36-02 dimostrativi cerrado"
provides:
  - "possessivi.json completado: suo (his/her), loro (invariable), cruces possessivi-300 (↔articoli) y possessivi-301 (↔genero-numero)"
  - "POSS-05 cubierto; SC#4 de la fase cerrado (3 cruces: dimostrativi-300, possessivi-300, possessivi-301)"
affects: [39-prov-lockstep]

tech-stack:
  added: []
  patterns:
    - "loro posesivo invariable + articulo siempre (distractoras: drop articulo, flexion inexistente 'lori')"
    - "2 cruces multi-cat con categoryIds de 2 reusando el motor (0 call-sites)"

key-files:
  created: []
  modified:
    - content/exercises/possessivi.json

key-decisions:
  - "cruce possessivi-300: distractora 'gli miei' (i miei amici es correcto, NO gli miei) — cruce genuino articoli x possessivi verificado por opus+deepseek."
  - "Dispute possessivi-300 resuelto por TIEBREAKER cross-vendor: Sonnet dio 2 falsos-positivos por MISREAD del token 'suoi' (leido como sus/seus); hexdump confirmo el texto correcto; NO se toco el contenido (no era bug), se resolvio con DeepSeek (correcta) -> opus+deepseek = 2 by validated."

patterns-established:
  - "cruces possessivi-300/301 = clon presente-regolare-300 (id estable, categoryIds de 2, cascada D-54 sin call-site nuevo)"

requirements-completed: [POSS-05, POSS-01, POSS-02]

duration: ~40min
completed: 2026-07-01
---

# Phase 36 (Plan 04): Cierre de Possessivi (A2 + cruces)

**Diferenciadores A2 de possessivi (suo his/her que concuerda con lo poseído; loro invariable con artículo siempre) + cruces possessivi-300 (↔articoli) y possessivi-301 (↔genero-numero); possessivi queda completo con 7 slots y SC#4 de la fase cerrado.**

## Performance
- **Tasks:** 2 (Task 1 autoria A2+cruces; Task 2 registro categories.json — heredado de 36-03, verify-only)
- **Files modified:** 1 (possessivi.json: +4 slots -> 7 total)
- **Completed:** 2026-07-01

## Accomplishments
- `possessivi-suo`: his/her ambiguo que concuerda con la cosa poseída (Giulia/direttore->il suo, Paolo/macchina->la sua); pase DeepSeek (Pitfall 4).
- `possessivi-loro`: invariable, siempre con artículo (il/la/i/le loro); distractoras = drop de artículo y flexión inexistente 'lori'.
- `possessivi-300` (↔articoli): el posesivo lleva artículo; cruce genuino con la trampa 'i miei amici' NO 'gli miei'.
- `possessivi-301` (↔genero-numero): concordancia con género/número reales (le mie mani, mano fem irregular; le mie scarpe).
- MC-only mantenido (0 match). Motor v1.4 intacto: D-54 = 2 call-sites, diff vacío. Los 2 cruces cascadean sin call-site nuevo.
- **SC#4 de la fase cerrado:** los 3 cruces existen (dimostrativi-300 en 36-02; possessivi-300/301 aquí), categoryIds de 2, cascada D-54.

## Task Commits
1. **Task 1: A2 + cruces** — `<feat 36-04>` + pases DeepSeek (suo, y tiebreaker en 300) via validate-ai-pass.mjs.
2. **Task 2: registro categories.json** — heredado de 36-03 (verify-only, order 12 ya presente).

## Files Created/Modified
- `content/exercises/possessivi.json` — +4 slots (suo, loro, 300, 301), cada uno validated (opus-4-8 + sonnet-4-6; suo +deepseek; 300 = opus+deepseek).

## Decisions Made
Ver key-decisions en frontmatter.

## Deviations from Plan
None estructural. El registro en categories.json que el plan asignaba a Task 2 ya lo hizo 36-03 por necesidad del validador; aquí fue verify-only (no-op).

## Issues Encountered
- **Dispute possessivi-300 resuelto por tiebreaker cross-vendor (NO override de contenido correcto):** Sonnet marcó C4 incorrecta en 2 rondas alegando que la explanation escribía 'sus'/'seus' en vez de 'suoi'. El hexdump del archivo confirma que el texto real es 'miei/tuoi/suoi' (correcto) — Sonnet CONFABULÓ el token (misread de modelo, distinto error cada ronda). Opus leyó bien (correcta). Como el contenido NO tenía bug, no se reescribió; se resolvió con un pase DeepSeek (leyó 'suoi' correctamente, correcta), dejando possessivi-300 validated por opus+deepseek (2 by distintos). Anotado en concerns[] del slot. Es el caso inverso del dispute de 36-03 (allí el flag ERA real -> rewrite; aquí es falso-positivo por misread -> cross-vendor, sin tocar contenido).

## Next Phase Readiness
- **Phase 36 COMPLETA (4/4 plans).** dimostrativi (8 slots, DEMOS-01..05) + possessivi (7 slots, POSS-01..05) autoradas, validadas 1-por-1 por quorum cross-vendor, registradas order 11/12. 3 cruces multi-cat (SC#4). Motor v1.4 intacto.
- Phase 39 (lockstep) debe: sincronizar los 3 count arrays + TOTAL_EXPECTED + TOTAL_EXPECTED_BASELINE (+15 slots: dimostrativi 8 + possessivi 7), estampar `origen: "ia-quorum"` en las 2 entradas de categories.json, +2 entradas en el smoke paramétrico. Los counts hardcoded siguen ROJOS hasta entonces (esperado, patrón v1.6/v1.7).

---
*Phase: 36-dimostrativi-possessivi-determinantes*
*Completed: 2026-07-01*
