---
phase: 19-articoli-a-slots-contenido
plan: 02
subsystem: content
tags: [articoli, slots, variants, quorum, cross-vendor, anti-memorizacion, suoni-speciali]

# Dependency graph
requires:
  - phase: 19-articoli-a-slots-contenido
    plan: 01
    provides: "articoli.json a slot+variantes (32 slots) + celdas pobres marcadas + 19-REAGRUPACION-MAP.md"
  - phase: 17-piloto-preposiciones-contenido
    provides: "patron quorum cross-vendor R1-R7 (validate-ai-pass.mjs + skill gsd-validate-exercise)"
provides:
  - "articoli.json con 34 slots: 5 celdas pobres engordadas a 2 variantes + 2 slots nuevos y/i+vocal (lo-yi, gli-yi)"
  - "8 superficies nuevas con validation.passes[] de 4x correcta (gemini+deepseek+opus+sonnet)"
  - "conteo final REAL de slots (34) determinable para el sync de counts de 19-03"
affects: [19-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "superficie nueva validada como ejercicio legacy aislado (payload) ANTES de moverla a variants[]"
    - "variante nueva lleva validation.passes[] propio (audit del quorum por superficie); la explanation sigue a nivel de slot"
    - "claude -p --model claude-opus-4-7/claude-sonnet-4-6 (headless) como mitad Claude del quorum cuando el skill Task no esta disponible al executor"

key-files:
  created: []
  modified:
    - content/exercises/articoli.json

key-decisions:
  - "explanations de slot reescritas rule-first + RAE-acentuadas (Rule 1): el quorum cazo las explanations ASCII heredadas de 19-01 como C4-incorrecta"
  - "uno-gn reusa gnomo en otra frase (no hay sust. gn- A1 mas natural; aprobado por el autor en el checkpoint)"
  - "gate D-17-07 aplicado por superficie: 4x correcta (by distintos), 0 incorrecta, status validated antes de integrar"

patterns-established:
  - "Quorum 1-por-1 fresh context NUNCA batched: 1 proceso claude -p por modelo por superficie; validate-ai-pass un ejercicio a la vez"
  - "Disputed-resolution 1x quality>tokens: rule-first explanation resolvio el C4 'ejemplo != noun del prompt'; re-run resolvio la alucinacion de tildes de deepseek"

requirements-completed: [ART-02]

# Metrics
duration: ~45min
completed: 2026-06-04
---

# Phase 19 Plan 02: Variantes nuevas + huecos y/i+vocal (Articoli) Summary

**Las 8 superficies nuevas aprobadas pasaron el quorum cross-vendor completo R1-R7 (gemini + deepseek + opus + sonnet, 4x correcta cero incorrecta) e integradas: 5 celdas pobres engordadas a 2 variantes (lo+ps/gn/x, uno+ps/gn) y 2 slots nuevos de huecos semiconsonanticos (articoli-lo-yi: lo yogurt + lo iodio; articoli-gli-yi: gli yogurt). articoli.json pasa de 32 a 34 slots, validateContent verde, conteo final determinable para 19-03.**

## Performance

- **Duration:** ~45 min (agente de continuacion; Task 1 heredado del agente previo, commit `90ea2aa`)
- **Completed:** 2026-06-04
- **Tasks:** 2/2 (Task 1 heredado + checkpoint:human-verify APROBADO por el autor; Task 2 ejecutado aqui)
- **Files modified:** 1 (`content/exercises/articoli.json`)

## Accomplishments

- **8/8 superficies validadas e integradas** — cada una por quorum 1-por-1, fresh context, NUNCA batched, con >=4x "correcta" (4 by distintos) y CERO "incorrecta" antes de tocar el slot.
- **5 celdas pobres engordadas (D-19-05):** `articoli-lo-ps`, `articoli-lo-gn`, `articoli-lo-x`, `articoli-uno-ps`, `articoli-uno-gn` pasan de 1 a 2 variantes cada una.
- **2 slots NUEVOS de huecos (D-19-06, R6 verificada):** `articoli-lo-yi` (lo yogurt + lo iodio, 2 variantes) y `articoli-gli-yi` (gli yogurt, 1 variante), cerrando la serie de suoni speciali semiconsonanticos. R6 confirmada por el quorum: `lo yogurt`, `lo iodio` (sin elision, NO l'iodio), `gli yogurt` (yogurt invariable).
- **Audit por superficie:** cada variante nueva lleva su `validation.passes[]` con los 4 pases (gemini-2.5-flash, deepseek-chat, claude-opus-4-7, claude-sonnet-4-6, todos correcta). La explanation sigue a nivel de slot (D-15-02).
- **Sin residuos:** 0 ids temporales legacy, 0 payload residual, 0 smart-quotes; validateContent exit 0 (34 slots).

## Task Commits

1. **Task 1: Proponer variantes nuevas** - `90ea2aa` (docs) — *heredado del agente previo, verificado presente*
2. **lo+ps "lo pseudonimo"** - `6163549` (feat)
3. **lo+gn "lo gnocco"** - `e6a4ff2` (feat)
4. **lo+x "lo xenofobo"** - `f4659e3` (feat)
5. **uno+ps "uno pseudonimo"** - `f9cee36` (feat)
6. **uno+gn "uno gnomo"** - `c25c6a7` (feat)
7. **slot NUEVO lo-yi "lo yogurt"** - `9411014` (feat)
8. **lo-yi "lo iodio"** - `7207d38` (feat)
9. **slot NUEVO gli-yi "gli yogurt"** - `5569763` (feat)

**Checkpoint:human-verify** (gate blocking-human, D-85) resuelto: el autor APROBO las 8 superficies propuestas as-is. No hubo mas checkpoints tras esa aprobacion.

## Quorum por superficie (passes[] final — gate D-17-07)

Todas: `gemini-2.5-flash` + `deepseek-chat` + `claude-opus-4-7` + `claude-sonnet-4-6`, los 4 `correcta`, 0 `incorrecta`, status `validated`.

| Superficie | slot destino | variantes tras integrar | by distintos correcta |
|------------|--------------|--------------------------|------------------------|
| lo pseudonimo | articoli-lo-ps (existente) | 2 | 4 |
| lo gnocco | articoli-lo-gn (existente) | 2 | 4 |
| lo xenofobo | articoli-lo-x (existente) | 2 | 4 |
| uno pseudonimo | articoli-uno-ps (existente) | 2 | 4 |
| uno gnomo | articoli-uno-gn (existente) | 2 | 4 |
| lo yogurt | articoli-lo-yi (NUEVO) | — | 4 |
| lo iodio | articoli-lo-yi (NUEVO) | 2 | 4 |
| gli yogurt | articoli-gli-yi (NUEVO) | 1 | 4 |

**Superficies excluidas: ninguna.** Las 8 aprobadas pasaron el gate.

## Files Created/Modified

- `content/exercises/articoli.json` - 8 variantes nuevas integradas (5 a slots existentes + 3 a 2 slots nuevos); explanations de los 7 slots tocados reescritas rule-first + RAE-acentuadas; cada variante nueva con `validation.passes[]` de 4 pases. 32 -> 34 slots.

## Decisions Made

- **explanations rule-first + RAE-acentuadas (Rule 1):** el quorum (gemini + deepseek, canon D-135/C4) cazo las explanations ASCII heredadas de 19-01 ("mas", "faciles", "espanol", "psicologo") como C4-incorrecta, y ademas el ejemplo `psicologo` no coincidia con el `pseudonimo` del prompt. Se reescribieron las 7 explanations de slot tocadas para (a) liderar con la REGLA (el disparador) en vez de un sustantivo concreto, (b) nombrar ambos sustantivos incluido el del prompt, y (c) usar tildes RAE correctas. Esto las alinea con el resto del corpus (preposiciones ya usa tildes correctas) y es exactamente el bug-catcher cross-vendor documentado. Las explanations de slot NO tocadas en este plan (las que no recibieron variante nueva) quedan como estaban — su sync ASCII->RAE queda fuera de alcance de 19-02.
- **uno-gn reusa gnomo:** no hay sustantivo gn- A1 mas natural que gnomo (gnocco es mas natural en plural, ya usado en lo-gn); el autor acepto la reformulacion con gnomo en otra frase en el checkpoint (D-19-05: no inflar artificialmente).
- **mitad Claude del quorum via `claude -p` headless:** el executor sequential no dispone de la herramienta Task ni de slash-commands, asi que la mitad Claude (que el skill gsd-validate-exercise corre via Task) se ejecuto con `claude -p --model claude-opus-4-7` y `--model claude-sonnet-4-6` (IDs literales D-VAL-02), 1 proceso fresh-context por modelo por superficie, con el 09-VALIDATION-PROMPT verbatim y el ejercicio sin el campo validation (para no sesgar al evaluador). Equivalente funcional 1-por-1 NUNCA batched.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Explanations ASCII heredadas de 19-01 cazadas como C4-incorrecta**
- **Found during:** quorum de las 8 superficies (1a corrida de lo-ps).
- **Issue:** las explanations heredadas de 19-01 son ASCII-only (sin tildes: "mas", "faciles", "espanol", "psicologo"), violando el canon D-135/C4 que exige acentuacion RAE correcta; ademas usaban un sustantivo-ejemplo (psicologo) distinto del noun del prompt (pseudonimo). Gemini y DeepSeek las marcaron `incorrecta`.
- **Fix:** reescritas las 7 explanations de slot tocadas a rule-first (lideran con el disparador, no con un sustantivo) + tildes RAE + nombran ambos sustantivos. El integrate del helper actualiza la explanation del slot destino a la version validada.
- **Files modified:** content/exercises/articoli.json (explanations de articoli-lo-ps/lo-gn/lo-x/uno-ps/uno-gn + las 2 nuevas lo-yi/gli-yi).
- **Commits:** 6163549 (y los demas feat por superficie).

**2. [Rule 1 - Bug] Acento italiano faltante en el prompt de lo gnocco**
- **Found during:** quorum de tmp-lo-gn-2 (1a corrida).
- **Issue:** el prompt decia "patate piu grande" — falta el acento italiano: debe ser "più". Cazado por gemini (C1) y deepseek (C1).
- **Fix:** corregido "piu" -> "più" (acento italiano valido, no smart-quote).
- **Files modified:** content/exercises/articoli.json (variant prompt de articoli-lo-gn).
- **Commit:** e6a4ff2.

### Disputed resuelto (1x, quality > tokens)

**lo iodio (tmp-lo-yi-2):** DeepSeek devolvio `incorrecta` en la 1a corrida con un concern C4 que ALUCINABA tildes inexistentes ("tíende", "elígir", "família", "incorrécta") sobre un texto que dice correctamente "tiende", "elegir", "familia", "incorrecta" — verificado caracter a caracter. Es el false-positive C4 que el propio VALIDATION-PROMPT advierte ("NO reportes como error una palabra que YA lleva su tilde correcta"). El MISMO texto de explanation ya habia pasado correcta en lo yogurt (tmp-lo-yi-1). Resolucion 1x: re-run de la pasada DeepSeek sobre el mismo texto -> `correcta`. No se altero contenido para "ganar" el pase (no override-atajo).

## Issues Encountered

**Rojo esperado en tests (NO un fallo):** `tests/exercise-types.test.js` sigue con el count hardcoded `expected: 56` (ahora `34 !== 56`). ESPERADO y documentado: 19-03 sincroniza el conteo REAL final (34) en los 3 sitios hardcoded (`exercise-types.test.js`, `slot-variants-integration.test.js`, `run-validation-271.mjs`). Resto de la suite: 127/128 pass.

**Tooling efimero:** se uso un helper `scripts/tmp-quorum-helper.mjs` (zero-deps) para materializar/integrar las superficies temporales legacy; NUNCA se comiteo y se elimino al terminar el plan. El JSON queda sin ids temporales (0).

## Verificacion (acceptance criteria Task 2)
- `validate-content-fixture articoli` -> exit 0, 34 slots
- yogurt presente: 4 menciones (slots lo-yi + gli-yi)
- con payload: 0 | ids tmp- residuales: 0 | smart-quotes: 0
- celdas pobres a 2 variantes: lo-ps/lo-gn/lo-x/uno-ps/uno-gn todas con 2
- slots nuevos: articoli-lo-yi (2 variantes) + articoli-gli-yi (1 variante), type multiple-choice, categoryIds ["articoli"], explanation a nivel de slot
- 8/8 variantes nuevas con validation.passes[] de >=4 correcta
- superficies movidas en 19-01 NO re-validadas (solo las 8 nuevas pasaron quorum)

## Next Phase Readiness
- **19-03:** conteo REAL final = **34 slots**. Sincronizar el hardcode `56` -> `34` en los 3 sitios (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`) y correr el smoke parametrico.
- Sin blockers. ART-02 completado (variantes nuevas + huecos por quorum). ART-04 (explanations a nivel de slot) reforzado en los 7 slots tocados.

## Known Stubs

Ninguno. Las 8 superficies estan completas, validadas e integradas; no hay placeholders ni datos mock.

## Self-Check: PASSED
- FOUND: content/exercises/articoli.json (34 slots, validateContent exit 0)
- FOUND commit: 6163549 (lo pseudonimo)
- FOUND commit: e6a4ff2 (lo gnocco)
- FOUND commit: f4659e3 (lo xenofobo)
- FOUND commit: f9cee36 (uno pseudonimo)
- FOUND commit: c25c6a7 (uno gnomo)
- FOUND commit: 9411014 (slot lo-yi / lo yogurt)
- FOUND commit: 7207d38 (lo iodio)
- FOUND commit: 5569763 (slot gli-yi / gli yogurt)
- FOUND commit: 90ea2aa (Task 1 heredado)

---
*Phase: 19-articoli-a-slots-contenido*
*Completed: 2026-06-04*
