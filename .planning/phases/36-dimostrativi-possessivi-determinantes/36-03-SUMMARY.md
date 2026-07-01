---
phase: 36-dimostrativi-possessivi-determinantes
plan: 03
subsystem: content
tags: [possessivi, concordanza, parentela, calco, slot-variantes, quorum, deepseek]

requires:
  - phase: 35-migracion-11-12
    provides: "state v12 + RESET_PREFIXES_V12 con el slug 'possessivi'"
provides:
  - "content/exercises/possessivi.json: 3 slots MC del nucleo (concordanza, articolo, parentela), todos validated"
  - "Registro de la categoria possessivi en categories.json (order 12)"
affects: [36-04, 39-prov-lockstep]

tech-stack:
  added: []
  patterns:
    - "Categoria nueva MC-only (D-36-03): forma derivable por raiz -> multiple-choice, sin match"
    - "Excepcion de parentesco en 1 slot con 4 carve-outs contrastantes (drop + 3 retornos)"

key-files:
  created:
    - content/exercises/possessivi.json
  modified:
    - content/categories.json

key-decisions:
  - "Registro de possessivi en categories.json adelantado a 36-03 (misma desviacion que 36-01): el fixture-validator exige la categoria registrada. 36-04 hereda el registro."
  - "Dispute de possessivi-concordanza (Sonnet C4: nota de curador sobre distractoras en la explanation) resuelto por REESCRITURA (no override): eliminada la frase meta, re-validado correcta por opus+sonnet. Memoria feedback_disputed_resolution."

patterns-established:
  - "possessivi MC-only con distractora del calco 'mi casa'->*mia casa (opciones antepuestas; casa mia pospuesto no se ofrece para evitar doble-validez R7)"
  - "concordanza con >=1 variante poseedor!=poseido (Marco/macchina -> la sua) para ejercer la trampa Pitfall 4"

requirements-completed: [POSS-01, POSS-02, POSS-03, POSS-04]

duration: ~35min
completed: 2026-07-01
---

# Phase 36 (Plan 03): Alta del nucleo Possessivi

**Categoria `possessivi` MC-only con 3 slots (concordancia con la cosa poseida incl. poseedor!=poseido, articulo obligatorio con distractora del calco, excepcion de parentesco con las 4 carve-outs), validados por quorum Opus 4.8 + Sonnet 4.6 y pase DeepSeek en concordanza + parentela.**

## Performance
- **Tasks:** 2 (Task 1 checkpoint:decision aprobado 3-slots; Task 2 autoria+quorum)
- **Files modified:** 2 (possessivi.json creado, categories.json +1 entrada)
- **Completed:** 2026-07-01

## Accomplishments
- 3 slots MC cubriendo POSS-01..04, nacidos en `variants[]`.
- `possessivi-concordanza`: incluye 2 variantes poseedor!=poseido (Marco/macchina->la sua; Anna/libri->i suoi) que ejercen la trampa real (Pitfall 4).
- `possessivi-articolo`: distractora del calco 'mi casa'->*mia casa con opciones ANTEPUESTAS (el quorum confirmo que 'casa mia' pospuesto no aplica, sin doble-validez).
- `possessivi-parentela` (MAGNET #2): 4 carve-outs contrastantes verificadas noun-por-noun por Opus+Sonnet+DeepSeek, con verbo (viene/prepara sing, vivono pl, lavora sing) cuadrando el numero.
- MC-only (D-36-03): 0 slots match.
- Motor v1.4 intacto: D-54 = 2 call-sites, diff vacio.

## Task Commits
1. **Task 1: checkpoint:decision** — aprobado por el autor ("Aprobado (3 slots)").
2. **Task 2: autoria + quorum** — `6084afe` (feat) + pases DeepSeek via validate-ai-pass.mjs.

## Files Created/Modified
- `content/exercises/possessivi.json` — 3 slots MC, cada uno validated (opus-4-8 + sonnet-4-6; concordanza + parentela +deepseek-reasoner).
- `content/categories.json` — +1 entrada `{ id: possessivi, name: "Possessivi (il mio/la tua)", order: 12 }` (sin origen; PROV-01 es Phase 39).

## Decisions Made
Ver key-decisions en frontmatter.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Registro de la categoria adelantado a 36-03**
- **Found during:** Task 2 (verify `validate-content-fixture.mjs possessivi`)
- **Issue:** Igual que en 36-01: el validador/loader rechazan `categoryId: "possessivi"` sin registro en categories.json; la acceptance de 36-03 lo exige.
- **Fix:** Anadida la entrada `possessivi` (order 12, id/name/order) a categories.json. 36-04 hereda el registro.
- **Verification:** `validate-content-fixture.mjs possessivi` exit 0.
- **Committed in:** 6084afe

---

**Total deviations:** 1 auto-fixed (Rule-3: plan self-blocking, identica a 36-01).
**Impact on plan:** Necesaria para la acceptance del propio plan. Sin scope creep.

## Issues Encountered
- **Dispute resuelto por reescritura (proceso, no bug de plan):** en la 1a ronda de quorum, Sonnet marco `possessivi-concordanza` C4 incorrecta — la frase final de la explanation ("Las distractoras concuerdan con el poseedor o cambian el numero") es una nota de curador sobre el diseno del ejercicio (R4: va en `notes`, no en la explanation del alumno). Opus la habia aprobado. Resuelto por REESCRITURA de la explanation (eliminada la frase meta, sustituida por "revisa el genero y el numero del sustantivo antes de elegir") y RE-VALIDACION: opus+sonnet -> correcta. Sin override-atajo (memoria feedback_disputed_resolution / calidad>tokens). Anotado en concerns[] del slot para el audit trail.

## Next Phase Readiness
- 36-04 puede: autorar los A2 (suo his/her ambiguo, loro invariable), NO re-registrar la categoria (ya esta), y autorar los cruces possessivi-300 (↔articoli) + possessivi-301 (↔genero-numero). El campo `origen` lo pone Phase 39.
- Counts hardcoded siguen ROJOS hasta Phase 39 (esperado).

---
*Phase: 36-dimostrativi-possessivi-determinantes*
*Completed: 2026-07-01*
