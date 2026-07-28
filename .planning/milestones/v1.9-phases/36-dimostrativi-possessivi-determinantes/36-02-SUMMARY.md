---
phase: 36-dimostrativi-possessivi-determinantes
plan: 02
subsystem: content
tags: [dimostrativi, cio, pronominali, cruce-multicat, cascada-d54, quorum]

requires:
  - phase: 36-dimostrativi-possessivi-determinantes
    provides: "36-01 nucleo dimostrativi + registro categories.json order 11"
provides:
  - "dimostrativi.json completado: cio (single-variant), pronominali, cruce dimostrativi-300 (categoryIds [dimostrativi,articoli])"
  - "DEMOS-05 cubierto; categoria dimostrativi aparece en home/picker/Repaso/Examen"
affects: [39-prov-lockstep]

tech-stack:
  added: []
  patterns:
    - "Slot lexico single-variant hibrido (cio) documentado sin autoria (PROF-01/SOST-01)"
    - "Cruce multi-cat con categoryIds de 2 reusando el motor (0 call-sites nuevos)"

key-files:
  created: []
  modified:
    - content/exercises/dimostrativi.json

key-decisions:
  - "cio como slot MC single-variant (D-36-02): NO forzar variantes sinteticas (Pitfall 7). Distractoras = formas con genero que no encajan con referente abstracto (ciò no contrasta con quello para evitar doble-validez R7 ciò che = quello che)."
  - "pronominali contrasta la forma PRONOMINAL quelli/quello con las adjetivales quegli/quei/quel (distractoras) — el punto A2."
  - "cruce dimostrativi-300 NO se registro categoria de nuevo (36-01 ya la puso)."

patterns-established:
  - "cruce dimostrativi-300 = clon presente-regolare-300: id estable + categoryIds de 2, cascada D-54 sin call-site nuevo"

requirements-completed: [DEMOS-05, DEMOS-03]

duration: ~25min
completed: 2026-07-01
---

# Phase 36 (Plan 02): Cierre de Dimostrativi (A2 + cruce)

**Diferenciadores A2 de dimostrativi (ciò neutro single-variant + formas pronominales questo/quello) y cruce multi-cat dimostrativi-300 (↔articoli), validados por quorum; dimostrativi queda completo con 8 slots.**

## Performance
- **Tasks:** 1 (auto)
- **Files modified:** 1 (dimostrativi.json: +3 slots -> 8 total)
- **Completed:** 2026-07-01

## Accomplishments
- `dimostrativi-cio`: slot MC single-variant sobre el pronombre neutro invariable (DEMOS-05); distractoras con género que no encajan con referente abstracto (ciò excluido de contraste con quello para no crear doble-validez, ya que ciò che = quello che).
- `dimostrativi-pronominali`: contraste forma pronominal (quelli/quella/quello) vs adjetival (quegli/quei/quel) — el punto A2; el quorum confirmó que las adjetivales son inválidas como pronombre standalone.
- `dimostrativi-300`: cruce `categoryIds: ["dimostrativi","articoli"]`, paralelismo quello<->artículo (quell'attore/l'attore; quei quaderni/i quaderni). Toca el magnet quei/quegli -> pase DeepSeek.
- Motor v1.4 intacto: D-54 = 2 call-sites, diff vacío. El cruce cascadea a ambas categorías sin call-site nuevo.

## Task Commits
1. **Task 1: A2 + cruce** — `<feat 36-02>` + pase DeepSeek via validate-ai-pass.mjs sobre dimostrativi-300.

## Files Created/Modified
- `content/exercises/dimostrativi.json` — +3 slots (cio, pronominali, 300), cada uno validated (opus-4-8 + sonnet-4-6; el cruce +deepseek-reasoner).

## Decisions Made
Ver key-decisions en frontmatter.

## Deviations from Plan
None - plan executed as written (el registro en categories.json que el plan asignaba a 36-02 ya lo hizo 36-01 por necesidad del validador; aquí fue no-op).

## Issues Encountered
None. Quorum limpio: los 3 slots correcta por opus+sonnet a la primera; sin disputes.

## Next Phase Readiness
- Dimostrativi COMPLETO (8 slots: questo, quest', quello MC, match-quello, colapso-es, cio, pronominali, cruce-300). Cubre DEMOS-01..05.
- 36-04 (Wave 3) puede autorar possessivi A2 (suo/loro) + cruces 300/301 + (el registro possessivi ya lo hizo 36-03).
- Counts hardcoded siguen ROJOS hasta Phase 39 (esperado).

---
*Phase: 36-dimostrativi-possessivi-determinantes*
*Completed: 2026-07-01*
