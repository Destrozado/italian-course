---
phase: 23-essere-a-slots-contenido
plan: 02
subsystem: content
tags: [essere, slot-variantes, quorum-cross-vendor, ser-estar, nacionalidad, localizacion, R1-R7]

# Dependency graph
requires:
  - phase: 23-01
    provides: "essere.json reagrupado a 25 slots+variantes (slots destino para las variantes nuevas)"
  - phase: 21
    provides: "migración 8->9 + motor slot+variantes v1.4 (normalizeExerciseToSlot, pickVariantIndex)"
provides:
  - "14 superficies nuevas validadas por quórum cross-vendor R1-R7 (>=4x correcta, 0 incorrecta) e integradas a slots"
  - "5 celdas pobres de presente engordadas a >=2 variantes (sono/sei/siamo/siete/sono-loro)"
  - "matriz de concordancia de nacionalidad completa (italiano/italiana/italiani/italiane) en essere-nacionalidad (6 variantes)"
  - "localización con essere absorbida como variantes (in ufficio en essere-e, al mare en essere-sono-loro) — sin slot dedicado"
  - "SLOT NUEVO essere-ser-estar (D-23-07) con validation top-level (D-19-09) — count 25 -> 26"
affects: [23-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Quórum cross-vendor 1-por-1 NUNCA batched: materializar superficie como legacy aislado (payload + validation pending) -> Opus + Sonnet (claude -p headless, D-19-08) -> 2 externos by distintos (validate-ai-pass.mjs --write) -> gate >=4x correcta 0 incorrecta -> mover a variants[] -> eliminar tmp"
    - "Fallback Gemini 429/503 -> deepseek-chat + deepseek-reasoner como 2 by externos distintos (precedente 22-VERIFICATION)"
    - "Slot NUEVO porta validation top-level elevada del quórum aprobado de sus variantes (D-19-09)"

key-files:
  created:
    - .planning/phases/23-essere-a-slots-contenido/23-02-SUMMARY.md
  modified:
    - content/exercises/essere.json

key-decisions:
  - "Model IDs del quórum: MANTENER los literales del skill (claude-opus-4-7 / claude-sonnet-4-6) por consistencia del audit trail con las superficies legacy (decisión del autor en checkpoint, Open Q #1)"
  - "Bloque C (localización): ABSORBER como variantes dentro de essere-e / essere-sono-loro — NO crear slot de localización dedicado (decisión del autor)"
  - "Las 14 superficies aprobadas se enviaron al quórum; todas pasaron (>=4x correcta), ninguna descartada"
  - "Conteo final REAL = 26 slots (25 tras 23-01 + 1 slot nuevo ser/estar). Las variantes no suben el count; el slot nuevo sí."

patterns-established:
  - "Pre-scan de acentos RAE antes del quórum evita gastar un pase en un fallo trivial (Opus cazó tildes faltantes en la 1a superficie)"
  - "Cuando una variante nueva amplía el dominio de un slot (cualidad, relación, localización), la explanation del slot se amplía para cubrir ambos usos (las variantes comparten la explanation del slot)"

requirements-completed: [ESS-02]

# Metrics
duration: ~95min
completed: 2026-06-08
---

# Phase 23 Plan 02: Essere variantes nuevas por quórum cross-vendor Summary

**14 superficies nuevas de Essere autoradas y validadas 1-por-1 por quórum cross-vendor R1-R7 (Opus + Sonnet + 2 externos, todas >=4x correcta) e integradas: 5 celdas pobres de presente engordadas, matriz de concordancia de nacionalidad completada, localización con essere absorbida como variantes, y el SLOT NUEVO ser/estar (D-23-07) con validation top-level — count 25 -> 26.**

## Performance

- **Duration:** ~95 min
- **Completed:** 2026-06-08
- **Tasks:** Task 2 (Task 1 ya estaba hecho y aprobado en el checkpoint previo)
- **Files modified:** 1 (`content/exercises/essere.json`)

## Accomplishments

- **Bloque A — 5 celdas pobres de presente engordadas a >=2 variantes:** `essere-sono` (io, "uno studente"), `essere-sei` (tu, "molto gentile" — cualidad), `essere-siamo` (noi, "amici da molti anni" — relación), `essere-siete` (voi, "in ritardo" — estado idiomático), `essere-sono-loro` (loro, "i miei migliori amici" — relación).
- **Bloque B — matriz de concordancia de nacionalidad completada:** `essere-nacionalidad` pasa de 3 a 6 variantes con italiano (masc sg) + italiani (masc pl) + italiane (fem pl), cerrando la matriz junto a la italiana (fem sg) ya existente.
- **Bloque C — localización con essere absorbida como variantes (sin slot dedicado, decisión del autor):** `essere-e` (+`è in ufficio`) y `essere-sono-loro` (+`sono al mare`), ambas con la nota del falso amigo estar->essere en la explanation del slot.
- **Bloque D — SLOT NUEVO `essere-ser-estar` (D-23-07):** 4 variantes que contrastan estado (Maria è stanca, i bambini sono contenti) vs identidad (Maria è medico, i miei genitori sono professori), todas con essere; explanation top-level del calco español; validation top-level (D-19-09) elevada del quórum aprobado de sus variantes.
- **Conteo final REAL determinable para 23-03: 26 slots** (25 tras 23-01 + 1 ser/estar).

## Quórum cross-vendor por superficie (gate D-17-07: >=4x correcta, 0 incorrecta)

Las 14 superficies pasaron el quórum 1-por-1, fresh context, NUNCA batched. Base canónica Opus + Sonnet vía `claude -p` headless (D-19-08, sin Task disponible al executor); refuerzo externos vía `validate-ai-pass.mjs --write`.

| # | id temporal | slot destino | `by` del quórum (todos correcta) |
|---|-------------|--------------|----------------------------------|
| 1 | tmp-essere-sono-2 | essere-sono | opus, sonnet, gemini, deepseek-chat |
| 2 | tmp-essere-sei-2 | essere-sei | opus, sonnet, deepseek-chat, deepseek-reasoner |
| 3 | tmp-essere-siamo-2 | essere-siamo | opus, sonnet, gemini, deepseek-chat |
| 4 | tmp-essere-siete-2 | essere-siete | opus, sonnet, gemini, deepseek-chat |
| 5 | tmp-essere-sono-loro-2 | essere-sono-loro | opus, sonnet, gemini, deepseek-chat |
| 6 | tmp-essere-nac-italiano-m-sg | essere-nacionalidad | opus, sonnet, gemini, deepseek-chat |
| 7 | tmp-essere-nac-italiani-m-pl | essere-nacionalidad | opus, sonnet, gemini, deepseek-chat |
| 8 | tmp-essere-nac-italiane-f-pl | essere-nacionalidad | opus, sonnet, gemini, deepseek-chat |
| 9 | tmp-essere-localizacion-ufficio | essere-e | opus, sonnet, gemini, deepseek-chat |
| 10 | tmp-essere-localizacion-mare | essere-sono-loro | opus, sonnet, gemini, deepseek-chat |
| 11 | tmp-essere-ser-estar-estado | essere-ser-estar (NUEVO) | opus, sonnet, gemini, deepseek-chat |
| 12 | tmp-essere-ser-estar-identidad | essere-ser-estar (NUEVO) | opus, sonnet, gemini, deepseek-chat |
| 13 | tmp-essere-ser-estar-estado-pl | essere-ser-estar (NUEVO) | opus, sonnet, gemini, deepseek-chat |
| 14 | tmp-essere-ser-estar-identidad-pl | essere-ser-estar (NUEVO) | opus, sonnet, deepseek-chat, deepseek-reasoner |

En las superficies 2 y 14, Gemini agotó cuota (503 / 429) y el 2º by externo se cubrió con `deepseek-reasoner` (precedente 22-VERIFICATION) para mantener >=2 by externos distintos.

## Task Commits

1. **Surface 1 (essere-sono io)** - `f879c77` (feat)
2. **Surface 2 (essere-sei tu cualidad)** - `7a47fbc` (feat)
3. **Surface 3 (essere-siamo noi relación)** - `d9efc28` (feat)
4. **Surface 4 (essere-siete voi estado idiomático)** - `aa912c9` (feat)
5. **Surface 5 (essere-sono-loro loro relación)** - `d483971` (feat)
6. **Surface 6 (essere-nacionalidad italiano masc sg)** - `8c5d352` (feat)
7. **Surface 7 (essere-nacionalidad italiani masc pl)** - `773ba03` (feat)
8. **Surface 8 (essere-nacionalidad italiane fem pl)** - `877fe0f` (feat)
9. **Surface 9 (essere-e localización in ufficio)** - `a08eff4` (feat)
10. **Surface 10 (essere-sono-loro localización al mare)** - `7dedba2` (feat)
11. **SLOT NUEVO essere-ser-estar (4 variantes + validation top-level)** - `3b97b43` (feat)

_Surfaces 11-14 (las 4 variantes del slot ser/estar) se validaron 1-por-1 y se integraron juntas al crear el slot nuevo en `3b97b43`._

## Files Created/Modified

- `content/exercises/essere.json` - 14 variantes nuevas integradas en sus slots; slot nuevo `essere-ser-estar` con validation top-level; explanations de slots ampliadas donde la variante amplió el dominio (essere-sei cualidad, essere-siamo/sono-loro relación, essere-e/sono-loro localización).
- `.planning/phases/23-essere-a-slots-contenido/23-02-SUMMARY.md` - este resumen.

## Decisions Made

- **Model IDs del quórum:** se mantuvieron los IDs literales del skill (`claude-opus-4-7` / `claude-sonnet-4-6`) por consistencia del audit trail con las 25 superficies legacy de essere.json (decisión del autor en el checkpoint, Open Q #1).
- **Localización (Bloque C):** absorbida como variantes dentro de `essere-e` y `essere-sono-loro`; NO se creó slot de localización dedicado (decisión del autor). Esto mantiene el count en 26 (no 27).
- **Slot nuevo único:** solo `essere-ser-estar` es slot nuevo (D-23-07); las otras 13 superficies engordan slots existentes. Count 25 -> 26.
- **Edad/contraste essere-avere agresivo (D-23-06):** tejido en las distractoras (cada superficie nueva lleva una forma de avere) y en la explanation top-level del slot ser/estar (edad/sensaciones con avere; estado/identidad con essere). No se materializó una variante explícita de edad (ya cubierta por `essere-300` + explanation del slot ser/estar).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tildes RAE faltantes en la explanation de la 1a superficie (essere-sono)**
- **Found during:** Surface 1 (tmp-essere-sono-2)
- **Issue:** La explanation copiada del slot perdió las tildes `posesión`/`también` (las escribí sin acento). Opus marcó `incorrecta` (C4-explanation, canon D-135). Es el patrón MEMORY documentado (Opus/DeepSeek estrictos en acentos).
- **Fix:** Re-acentuado a `posesión`/`también`, reset de validation, re-corrido el quórum (4x correcta).
- **Files modified:** content/exercises/essere.json
- **Verification:** quórum 4x correcta tras la corrección.
- **Committed in:** `f879c77`

**2. [Rule 1 - Bug] Explanation desalineada con la superficie en essere-sei (R4 mismatch)**
- **Found during:** Surface 2 (tmp-essere-sei-2)
- **Issue:** Reutilicé la explanation del slot (nacionalidad), pero la superficie nueva es sobre cualidad/carácter (`gentile`). Opus marcó `incorrecta` (C4/R4: explanation reciclada de otro dominio).
- **Fix:** Reformulada la explanation de la superficie para que case con `gentile` (cualidad con essere, no avere); además se amplió la explanation del slot `essere-sei` para cubrir cualidad + nacionalidad (las variantes comparten la explanation del slot). Re-corrido el quórum (4x correcta).
- **Files modified:** content/exercises/essere.json
- **Verification:** quórum 4x correcta tras la reformulación.
- **Committed in:** `7a47fbc`

**3. [Rule 3 - Blocking] Gemini 429/503 → 2º by externo con deepseek-reasoner**
- **Found during:** Surfaces 2 y 14
- **Issue:** Gemini devolvió 503 (surface 2) y agotó cuota 429 (surface 14); sin un 2º by externo distinto el quórum se quedaba en 3 by (fallaba el >=4 distinct correcta).
- **Fix:** Se corrió `deepseek-reasoner` como 2º by externo distinto (precedente 22-VERIFICATION; el quórum se computa sobre el `by` real).
- **Files modified:** content/exercises/essere.json
- **Verification:** 4 by distintos, todos correcta, en ambas superficies.
- **Committed in:** `7a47fbc`, `3b97b43`

**4. [Rule 2 - Missing critical] Ampliación de explanations de slot cuando la variante amplía el dominio**
- **Found during:** Surfaces 3, 4, 5, 9
- **Issue:** Varias variantes nuevas introducen un uso no cubierto por la explanation existente del slot (relación en siamo/sono-loro, `essere in ritardo` en siete, localización en essere-e). Como las variantes comparten la explanation del slot (SLOT-02), dejarla sin ampliar produciría una explanation incompleta para esas variantes.
- **Fix:** Se amplió la explanation top-level de `essere-siamo`, `essere-siete`, `essere-sono-loro` y `essere-e` para cubrir los usos nuevos sin re-validar las superficies legacy ya movidas (D-23-11; la explanation del slot no es contenido validado por superficie).
- **Files modified:** content/exercises/essere.json
- **Verification:** validate-content-fixture exit 0; smart-quotes 0.
- **Committed in:** `d9efc28`, `aa912c9`, `d483971`, `a08eff4`

---

**Total deviations:** 4 auto-fixed (2 bugs cazados por el quórum, 1 blocking de rate-limit, 1 missing-critical de coherencia de explanations).
**Impact on plan:** todas necesarias para la correctitud editorial y el gate del quórum. Sin scope creep — las 14 superficies aprobadas se validaron e integraron exactamente como se aprobó en el checkpoint.

## Issues Encountered

- El quórum cazó 2 bugs reales (tildes faltantes + explanation reciclada) que un human-verify probablemente habría aprobado — confirma el valor del cross-vendor documentado en MEMORY.
- Ningún `disputed` persistente: las 2 superficies marcadas `incorrecta` se resolvieron por REFORMULACIÓN (calidad > tokens, NO override-atajo) y re-pasaron el quórum.

## Known Stubs

Ninguno. Las 14 superficies están completas, validadas e integradas en `variants[]`; 0 ids temporales legacy residuales (`con payload: 0`); 0 placeholders.

## Snapshot APPEND-ONLY

Essere NO tiene snapshot APPEND-ONLY (scripts avere-only, 0 refs a essere; no existe `.essere-prefix-snapshot.json`). NO se ejecutó ni creó ningún script de snapshot/assert — no aplica re-base D-88 a esta categoría (a diferencia de 22-02).

## Verification

- `node scripts/validate-content-fixture.mjs essere content/exercises/essere.json` → exit 0 (26 ejercicios).
- `ser-estar ok: true`; `slots variants sin validation top-level: 0`; `con payload: 0`; `tmp residual: 0`.
- `cruces: 6 con 2 cats: 6` (essere-300..305 intactos, validation 2026-05-27 sin tocar — no re-validados, D-23-11).
- `grep -nP '[\x{2018}\x{2019}\x{201C}\x{201D}]' content/exercises/essere.json` → 0 matches.
- Celdas pobres de presente >=2 variantes (sono/sei/siamo/siete=2, e/sono-loro=3); nacionalidad=6 variantes.
- `node --test tests/*.test.js` → 373 pass / 1 fail. El único rojo es el hardcode de count de Essere (`Esperaba 39, encontré 26`) — esperado, lo sincroniza 23-03 contra el conteo REAL (26).

## Next Phase Readiness

- **Conteo final REAL = 26 slots** — driver determinístico para 23-03 (sincronizar los 3 hardcodes de count 39 -> 26).
- Todas las superficies nuevas validadas e integradas; slot ser/estar con validation top-level (gate VAL_07_STRICT cubierto).
- Sin blockers.

## Self-Check: PASSED

- Files: SUMMARY.md + content/exercises/essere.json presentes.
- Commits: f879c77, 7a47fbc, d9efc28, aa912c9, d483971, 8c5d352, 773ba03, 877fe0f, a08eff4, 7dedba2, 3b97b43 — todos presentes en git.

---
*Phase: 23-essere-a-slots-contenido*
*Completed: 2026-06-08*
