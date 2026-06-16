---
phase: 24-verbi-di-movimento-a-slots-contenido
plan: 02
subsystem: content
tags: [verbi-movimento, slot-variantes, quorum-cross-vendor, essere, avere, auxiliar, concordancia, test-destino, R1-R7]

# Dependency graph
requires:
  - phase: 24-01
    provides: "verbos-movimiento.json reagrupado a 7 slots+variantes (4 MC + 3 word-buttons), slots destino para las variantes nuevas"
  - phase: 21
    provides: "migración 8->9 + motor slot+variantes v1.4 (normalizeExerciseToSlot, pickVariantIndex)"
provides:
  - "20 superficies nuevas validadas por quórum cross-vendor R1-R7 (>=4x correcta, 0 incorrecta) e integradas a sus slots por regla de auxiliar"
  - "Eje 1 (mas verbos essere): scendere, salire, cadere, rimanere, restare, diventare, nascere -> slot essere (14->21 variantes)"
  - "Eje 2 (mas excepciones avere): passeggiare, sciare, viaggiare, nuotare -> slot excepcioni-avere (6->10 variantes)"
  - "Eje 3 (mas test-de-destino): correre/volare con y sin destino (5 pares) -> slot correre (2->7 variantes)"
  - "Eje 4 (matriz de concordancia): scendere/salire/venire/partire en las 4 celdas genero x numero -> slot concordanza (12->16 variantes)"
  - "Auxiliar real de cada verbo confirmado por el quórum (D-24-06): scendere/salire intransitivos=essere, cadere/rimanere/restare/diventare/nascere=essere; passeggiare/sciare/viaggiare/nuotare=avere; correre/volare alternan segun destino"
affects: [24-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Quórum cross-vendor 1-por-1 NUNCA batched: materializar superficie como legacy aislado (payload + validation pending) -> Opus + Sonnet (claude -p headless, D-19-08) -> 2 by externos distintos (validate-ai-pass.mjs --write) -> gate >=4x correcta 0 incorrecta -> mover a variants[] (sin explanation/validation propia) -> eliminar tmp"
    - "Fallback Gemini 429 -> deepseek-chat + deepseek-reasoner como 2 by externos distintos (precedente 22/23); ext-2 forzado a deepseek-reasoner garantiza 4 by distintos aunque Gemini caiga"
    - "Disputed (sticky) se resuelve por REFORMULACION del texto (calidad>tokens, NO override): fix de tilde RAE / +contexto (per=duracion) / sujeto explicito para excluir doble-validez R7; re-quorum fresco sobre el texto corregido"

key-files:
  created:
    - .planning/phases/24-verbi-di-movimento-a-slots-contenido/24-02-SUMMARY.md
  modified:
    - content/exercises/verbos-movimiento.json

key-decisions:
  - "0 slots nuevos: los 4 ejes engordan los 4 slots MC existentes de 24-01 (aprobado por el autor en checkpoint). Count de 24-03 NO sube por este plan (las variantes no suben data.exercises.length)."
  - "Scope del autor: saltare descartado (auxiliar fronterizo, riesgo R7); scendere/salire fuera del eje 3 (su sin-destino es transitivo B1); nascere materializado en lugar de morire (A1 mas frecuente, morto queda documentado en explanation del slot)"
  - "Model IDs del quórum: MANTENER los literales del skill (claude-opus-4-7 / claude-sonnet-4-6) por consistencia del audit trail con las superficies legacy (D-24-13)"
  - "Las 20 superficies aprobadas se enviaron al quórum; todas pasaron (>=4x correcta), ninguna descartada. 1 superficie (correre sin destino) requirio 2 reformulaciones por disputes legitimas."
  - "Concordancia sigue siendo UN solo slot (D-24-03, divergencia deliberada vs Essere). NO se crearon cruces 300..305. NO snapshot (avere-only, no aplica a Verbi di movimento)."

patterns-established:
  - "Pre-escribir las explanations temporales con acentos RAE completos (asi->asi que, 1a->1a) evita gastar un pase del quorum en un fallo trivial (Opus estricto en tildes cazo la 1a superficie)"
  - "Cuando un externo agota cuota (Gemini 429), el 2o by externo se cubre con deepseek-reasoner para mantener >=2 by externos distintos sin colision de by"

requirements-completed: [MOV-02]

# Metrics
duration: ~75min
completed: 2026-06-08
---

# Phase 24 Plan 02: Verbi di movimento variantes nuevas por quórum cross-vendor Summary

**20 superficies nuevas de Verbi di movimento autoradas y validadas 1-por-1 por quórum cross-vendor R1-R7 (Opus + Sonnet + 2 externos, todas >=4x correcta, 0 incorrecta) e integradas a sus 4 slots por regla de auxiliar: mas verbos essere + mas excepciones avere + mas test-de-destino + matriz de concordancia completa; 0 slots nuevos, concordancia sigue siendo 1 slot (D-24-03).**

## Performance

- **Duration:** ~75 min
- **Completed:** 2026-06-08
- **Tasks:** Task 2 (Task 1 ya estaba hecho y aprobado en el checkpoint previo, commit 3def9d4)
- **Files modified:** 1 (`content/exercises/verbos-movimiento.json`)

## Accomplishments

- **Eje 1 — mas verbos essere (slot `verbos-movimiento-essere`, 14 -> 21 variantes):** scendere (io), salire (Maria), cadere (il bambino), rimanere (noi), restare (loro), diventare (lui), nascere (io). Cada uno con su auxiliar essere confirmado por el quórum; scendere/salire usan contexto intransitivo inequivoco (dal treno / sull'autobus) para evitar el uso transitivo que tomaria avere.
- **Eje 2 — mas excepciones avere (slot `verbos-movimiento-excepcioni-avere`, 6 -> 10 variantes):** passeggiare (noi), sciare (tu), viaggiare (loro), nuotare (io). Todos actividades sin destino concreto -> avere + participio invariable, confirmado por el quórum (ninguno toma essere).
- **Eje 3 — mas test-de-destino (slot `verbos-movimiento-correre`, 2 -> 7 variantes):** pares contrastivos volare con destino (a Parigi) / sin destino (tutto il giorno), correre sin destino (per un'ora in palestra) / con destino (all'ospedale), volare plural con destino (sul tetto). Contraste destino->essere / sin-destino->avere confirmado por verbo.
- **Eje 4 — matriz de concordancia completa (slot `verbos-movimiento-concordanza`, 12 -> 16 variantes):** scendere masc sg (sceso), salire fem sg (salita), venire masc pl (venuti), partire fem pl (partite) — 4 verbos NUEVOS cubriendo las 4 celdas genero x numero, distractoras = las otras 3 concordancias del mismo verbo. Concordancia sigue siendo UN solo slot (D-24-03).
- **0 slots nuevos.** Los 4 ejes engordan los 4 slots MC existentes (aprobado por el autor en el checkpoint). Conteo final REAL para 24-03: **7 slots** (sin cambio; las 20 variantes no suben `data.exercises.length`).

## Quórum cross-vendor por superficie (gate D-17-07: >=4x correcta, 0 incorrecta)

Las 20 superficies pasaron el quórum 1-por-1, fresh context, NUNCA batched. Base canónica Opus + Sonnet vía `claude -p` headless (D-19-08, sin Task disponible al executor); refuerzo externos vía `validate-ai-pass.mjs --write`. `by` del quórum = los 4 modelos que respondieron, todos `correcta`.

| # | id temporal | eje / slot destino | `by` del quórum (todos correcta) | commit |
|---|-------------|--------------------|----------------------------------|--------|
| 1 | tmp-vm-essere-scendere | 1 / essere | opus, sonnet, gemini, deepseek-chat | b2ae6b3 |
| 2 | tmp-vm-essere-salire | 1 / essere | opus, sonnet, gemini, deepseek-chat | 8571393 |
| 3 | tmp-vm-essere-cadere | 1 / essere | opus, sonnet, deepseek-chat, deepseek-reasoner | a955b74 |
| 4 | tmp-vm-essere-rimanere | 1 / essere | opus, sonnet, deepseek-chat, deepseek-reasoner | a71b1fe |
| 5 | tmp-vm-essere-restare | 1 / essere | opus, sonnet, deepseek-chat, deepseek-reasoner | 80ea80f |
| 6 | tmp-vm-essere-diventare | 1 / essere | opus, sonnet, deepseek-chat, deepseek-reasoner | 67bee04 |
| 7 | tmp-vm-essere-nascere | 1 / essere | opus, sonnet, deepseek-chat, deepseek-reasoner | 3152c70 |
| 8 | tmp-vm-avere-passeggiare | 2 / excepcioni-avere | opus, sonnet, deepseek-chat, deepseek-reasoner | 4811f5b |
| 9 | tmp-vm-avere-sciare | 2 / excepcioni-avere | opus, sonnet, deepseek-chat, deepseek-reasoner | 3400915 |
| 10 | tmp-vm-avere-viaggiare | 2 / excepcioni-avere | opus, sonnet, deepseek-chat, deepseek-reasoner | 2f00e61 |
| 11 | tmp-vm-avere-nuotare | 2 / excepcioni-avere | opus, sonnet, deepseek-chat, deepseek-reasoner | 67f4a19 |
| 12 | tmp-vm-correre-volare-con | 3 / correre | opus, sonnet, deepseek-chat, deepseek-reasoner | 1009af1 |
| 13 | tmp-vm-correre-volare-sin | 3 / correre | opus, sonnet, deepseek-chat, deepseek-reasoner | b607029 |
| 14 | tmp-vm-correre-corso-sin | 3 / correre | opus, sonnet, deepseek-chat, deepseek-reasoner | 8a70c5f |
| 15 | tmp-vm-correre-corsa-con | 3 / correre | opus, sonnet, deepseek-chat, deepseek-reasoner | c0238f2 |
| 16 | tmp-vm-correre-volare-pl-con | 3 / correre | opus, sonnet, deepseek-chat, deepseek-reasoner | 18663e8 |
| 17 | tmp-vm-conc-sceso-m-sg | 4 / concordanza | opus, sonnet, deepseek-chat, deepseek-reasoner | 2fb4e65 |
| 18 | tmp-vm-conc-salita-f-sg | 4 / concordanza | opus, sonnet, deepseek-chat, deepseek-reasoner | f2f5a12 |
| 19 | tmp-vm-conc-venuti-m-pl | 4 / concordanza | opus, sonnet, deepseek-chat, deepseek-reasoner | a0300e5 |
| 20 | tmp-vm-conc-partite-f-pl | 4 / concordanza | opus, sonnet, deepseek-chat, deepseek-reasoner | 5b7b400 |

Desde la superficie 3 en adelante, Gemini agotó cuota (429) y el quórum externo se cubrió con `deepseek-chat` + `deepseek-reasoner` (2 by externos distintos), precedente 22-VERIFICATION / 23-02. Todas las superficies cierran con 4 `by` distintos y `verdict: correcta`, `status: validated`.

## Disputes y su resolución (por REFORMULACION, calidad > tokens)

| superficie | dispute (quien / criterio) | resolución |
|------------|---------------------------|------------|
| #1 scendere | Opus C4: tilde ausente `asi que` en la explanation temporal | Reformulado `asi que`->`así que` + `1a`->`1ª`; re-quorum fresco -> 4x correcta. (La variant final NO lleva esa explanation: comparte la del slot.) |
| #14 correre sin destino | (intento A) deepseek-chat C2/R7: `Stamattina ___ corso un'ora in palestra` ambiguo (ho vs sono). (intento B) deepseek-reasoner C2/R7: sin sujeto explicito, ho (1a) y è (3a) ambos validos. | Reformulado en 2 pasos: +`per` (enfatiza duracion, excluye lectura essere) y sujeto explicito `Io`; texto final `Io ___ corso per un'ora in palestra stamattina` -> re-quorum fresco -> 4x correcta. |

Ningún C5-leak sobre gloss ES aplicó (D-24-13): NINGUNA de las 20 superficies necesitó gloss "(en español: ...)" — sujeto + contexto desambiguan sin doble-validez. No hubo override-atajo; toda dispute se resolvió reformulando el texto y re-validando desde cero.

## Conteo final de variantes por slot

| slot | variantes tras 24-01 | variantes tras 24-02 | delta |
|------|----------------------|----------------------|-------|
| verbos-movimiento-essere | 14 | 21 | +7 (eje 1) |
| verbos-movimiento-excepcioni-avere | 6 | 10 | +4 (eje 2) |
| verbos-movimiento-correre | 2 | 7 | +5 (eje 3) |
| verbos-movimiento-concordanza | 12 | 16 | +4 (eje 4) |
| verbos-movimiento-wb-andare | 1 | 1 | 0 |
| verbos-movimiento-wb-viaggiare | 1 | 1 | 0 |
| verbos-movimiento-wb-uscire | 1 | 1 | 0 |
| **total slots** | **7** | **7** | **0 (sin slots nuevos)** |

## Task Commits

Cada superficie validada se commiteó atómicamente (1 commit por superficie, 20 commits):

1. **Surface 1 (essere scendere)** - `b2ae6b3` (feat)
2. **Surface 2 (essere salire)** - `8571393` (feat)
3. **Surface 3 (essere cadere)** - `a955b74` (feat)
4. **Surface 4 (essere rimanere)** - `a71b1fe` (feat)
5. **Surface 5 (essere restare)** - `80ea80f` (feat)
6. **Surface 6 (essere diventare)** - `67bee04` (feat)
7. **Surface 7 (essere nascere)** - `3152c70` (feat)
8. **Surface 8 (avere passeggiare)** - `4811f5b` (feat)
9. **Surface 9 (avere sciare)** - `3400915` (feat)
10. **Surface 10 (avere viaggiare)** - `2f00e61` (feat)
11. **Surface 11 (avere nuotare)** - `67f4a19` (feat)
12. **Surface 12 (correre volare con destino)** - `1009af1` (feat)
13. **Surface 13 (correre volare sin destino)** - `b607029` (feat)
14. **Surface 14 (correre sin destino, reformulado 2x)** - `8a70c5f` (feat)
15. **Surface 15 (correre con destino, Anna)** - `c0238f2` (feat)
16. **Surface 16 (correre volare pl con destino)** - `18663e8` (feat)
17. **Surface 17 (concordanza sceso masc sg)** - `2fb4e65` (feat)
18. **Surface 18 (concordanza salita fem sg)** - `f2f5a12` (feat)
19. **Surface 19 (concordanza venuti masc pl)** - `a0300e5` (feat)
20. **Surface 20 (concordanza partite fem pl)** - `5b7b400` (feat)

**Task 1 (propuesta, ya hecha):** `3def9d4` (docs)

## Files Created/Modified

- `content/exercises/verbos-movimiento.json` - 20 variantes nuevas integradas en los variants[] de sus 4 slots por regla de auxiliar; ningún id temporal residual; ningún payload residual; validation top-level de cada slot (de 24-01) intacta (no degradada). Las explanations de los slots NO se tocaron (las variantes comparten la del slot).
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-02-SUMMARY.md` - este resumen.

## Decisions Made

- **0 slots nuevos:** los 4 ejes engordan los 4 slots MC existentes; el autor aprobó la recomendación del planner en el checkpoint. Esto mantiene el count en 7 (las variantes no suben `data.exercises.length`).
- **Scope del autor (aprobado en checkpoint):** saltare descartado (auxiliar fronterizo essere/avere, riesgo R7 doble-validez); scendere/salire fuera del eje 3 (su uso "sin destino" requiere transitividad B1, no el contraste A1 actividad-vs-meta del slot correre); nascere materializado en lugar de morire (A1 mas frecuente y sin riesgo; morto queda documentado en la explanation del slot essere).
- **Auxiliar de cada verbo confirmado por el quórum (D-24-06):** ningún verbo entró al slot con el auxiliar equivocado; el quórum cross-vendor verificó cada asignación essere/avere y cada contraste destino/no-destino antes de integrar.
- **Model IDs literales del skill** (claude-opus-4-7 / claude-sonnet-4-6) mantenidos por consistencia del audit trail (D-24-13).

## Deviations from Plan

None - plan executed exactly as written. (Las 2 disputes resueltas por reformulación son el flujo esperado del quórum documentado en el plan, no desviaciones.)

## Issues Encountered

- **Opus estricto en acentos (MEMORY confirmado):** la superficie 1 recibió `incorrecta` de Opus por una tilde ausente (`asi que`) en la explanation temporal. Resuelto reformulando con acentos RAE; a partir de ahí todas las explanations temporales se pre-escribieron con tildes completas para no gastar pases en fallos triviales. La explanation temporal NO viaja a la variant final (comparte la del slot).
- **Gemini 429 desde la superficie 3:** Gemini agotó cuota; los 2 by externos se cubrieron con deepseek-chat + deepseek-reasoner (precedente 22/23). El driver forzó deepseek-reasoner como ext-2 para garantizar 4 by distintos sin colisión.
- **correre sin destino — 2 disputes legítimas (C2/R7):** primero ambigüedad ho/sono por falta de `per`, luego ho/è por falta de sujeto explícito. Ambas resueltas por reformulación (el quórum es el cazador de bugs documentado); texto final inequívoco.

## TDD / count tests

- **El count de Verbi di movimento sigue ROJO a propósito hasta 24-03 (documentado, NO arreglado aquí).** `tests/exercise-types.test.js:1270` asserta `expected: 37` ejercicios para `verbos-movimiento.json` pero encuentra **7** (los 37 legacy se colapsaron en 7 slots en 24-01). `node --test tests/*.test.js` -> `# tests 374 / # pass 373 / # fail 1` (el único fallo es ese count). El conteo final ya es determinable: **7 slots**. 24-03 actualizará el assert.

## Verification (acceptance criteria, todos verdes)

- `node scripts/validate-content-fixture.mjs verbos-movimiento content/exercises/verbos-movimiento.json` -> exit 0
- con payload: **0** (ningún id temporal legacy residual)
- slots variants sin validation top-level: **0** (D-19-09; validation de 24-01 no degradada)
- concordanza slots: **1** (D-24-03)
- cruces -30[0-5]: **0** (no se crearon)
- refs a la categoría Essere por id/prosa: **0** (D-24-07/D-159)
- smart-quotes: **0**
- slots con categoryId distinto de ["verbos-movimiento"]: **0**
- NO se ejecutó ni creó ningún script/archivo de snapshot para Verbi di movimento (avere-only, no aplica)

## Next Phase Readiness

- 24-03 listo: conteo final determinable = **7 slots**; debe actualizar `tests/exercise-types.test.js:1270` (`expected: 37` -> el conteo real de slots) para poner el test en verde. Smoke de 24-03 re-asertará sobre variants[].prompt + explanation.
- Sin blockers. Sin slots nuevos que requieran validation top-level adicional.

## Self-Check: PASSED

- 24-02-SUMMARY.md existe.
- Las 20 superficies committeadas existen en git (b2ae6b3 .. 5b7b400, todas FOUND).
- Sin scripts temporales residuales (_tmp-* eliminados).
- validateContent verde; payload residual 0; concordanza 1 slot; cruces 0; refs Essere 0; smart-quotes 0.

---
*Phase: 24-verbi-di-movimento-a-slots-contenido*
*Completed: 2026-06-08*
