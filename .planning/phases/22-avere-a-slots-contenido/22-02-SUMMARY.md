---
phase: 22-avere-a-slots-contenido
plan: 02
subsystem: contenido-editorial
tags: [avere, slots, variantes-nuevas, quorum-cross-vendor, D-17-07, D-19-05, D-19-06, D-19-09, D-88]
requires:
  - 22-01 (avere.json en slot+variantes, 19 slots; celdas pobres de presente marcadas; blindaje D-88 re-basado)
  - quorum cross-vendor (validate-ai-pass.mjs Gemini/DeepSeek + skill gsd-validate-exercise Opus/Sonnet)
provides:
  - "content/exercises/avere.json con 14 variantes nuevas validadas integradas (20 slots: 6 presente a 2 var, sensazioni a 5 var, passato a 8 var, slot NUEVO avere-ragione)"
  - "slot NUEVO avere-ragione con validation top-level (D-19-09)"
  - "conteo final determinable para 22-03: 20 slots"
affects:
  - "22-03 (sync de los 3 hardcodes de count 23->20 + TOTAL_EXPECTED)"
tech-stack:
  added: []
  patterns:
    - "quorum cross-vendor 1-por-1 NUNCA batched: superficie aislada como legacy payload -> 4 pases (2 externos + 2 Claude) -> integrar al slot sin re-validacion"
    - "disputed resolution por reformulacion (calidad > tokens, NO override-atajo): re-run full quorum sobre el texto nuevo"
    - "engorde de celdas pobres comparte explanation de slot; slot nuevo eleva quorum del variante a validation top-level (D-19-09)"
key-files:
  modified:
    - content/exercises/avere.json (Task 2 — 14 variantes nuevas integradas; +1 slot nuevo avere-ragione; explanation de avere-ha generalizada)
    - scripts/.avere-prefix-snapshot.json (re-basado al nuevo estado; gitignored, no trackeado)
decisions:
  - "avere-ragione = SLOT NUEVO separado (D-85 autor) — estado/juicio, no sensacion fisica; lleva validation top-level (D-19-09)"
  - "sentire DESCARTADO del passato (riesgo doble-lectura pronominal sentirsi->essere)"
  - "edad (avere anni) NO duplicada (ya cubierta en avere-ha)"
  - "2 disputes resueltas por REFORMULACION (NO override): freddo (R7 ambiguo 'e freddo' impersonal -> sujeto 'io' explicito) y ragione (R1 leak 'Hai visto' -> opener 'Lo ammetto')"
  - "avere-ha: explanation generalizada de edad-only a posesion+edad (Rule 2: el slot ahora porta variante de posesion 'un gatto nero')"
  - "segundo by externo distinto = deepseek-reasoner cuando Gemini rate-limitea (429 persistente); quorum sobre by real"
metrics:
  duration: "~1 sesion (continuacion tras checkpoint D-85 aprobado)"
  completed: "2026-06-05"
  tasks_completed: 1
  variantes_nuevas: 14
  slots_resultantes: 20
  invocaciones_quorum: 64
---

# Phase 22 Plan 02: Avere variantes nuevas (engorde + idiomatismos + passato) Summary

Autoria de **14 superficies nuevas** validadas 1-por-1 por quorum cross-vendor R1-R7 (>=4x correcta, 0 incorrecta) e integradas a sus slots en avere.json: engorde de las 6 celdas pobres de presente a 2 variantes, avere-sensazioni a 5 variantes (sete/freddo/sonno), avere-passato-prossimo a 8 variantes (comprare/vedere/leggere/scrivere) y un slot NUEVO `avere-ragione` con validation top-level. Resultado: **20 slots**.

## Que se hizo

### Task 1 (ya completada antes del checkpoint — commit 17bd971)

`22-VARIANTES-NUEVAS.md`: propuesta de 14 superficies (6 presente + 3 sensaciones + 1 ragione + 4 passato). **Verificada, no rehecha.** Checkpoint human-verify (D-85) resuelto: el autor escribio "aprobado" con las decisiones (ragione=slot nuevo separado, sentire descartado, edad no duplicada).

### Task 2 (commits 5969deb..a402fbc, 14 commits) — quorum + integracion + re-base D-88

**(A) Quorum cross-vendor 1-por-1 (NUNCA batched):**

Cada superficie se materializo como ejercicio legacy aislado (`tmp-avere-*` con payload) en `tests/fixtures/22-02-tmp-surfaces.json` y paso el quorum completo:
- **Mitad externa:** `validate-ai-pass.mjs` con Gemini + DeepSeek. Gemini rate-limiteo (429 persistente token-based) en 5 superficies; se uso **deepseek-reasoner** como segundo `by` externo distinto (el quorum se computa sobre el `by` real).
- **Mitad Claude:** `claude -p --model claude-opus-4-7` y `--model claude-sonnet-4-6` headless (fallback D-19-08; Task slash-command no invocable por el executor), 1 proceso por modelo por superficie, con el 09-VALIDATION-PROMPT verbatim y el ejercicio SIN su campo validation (no sesgar).

**Gate D-17-07 final — las 14 superficies: >=4 pases distintos, todos "correcta", 0 "incorrecta":**

| Superficie | Slot destino | by del quorum (4 distintos) |
|-----------|--------------|------------------------------|
| Io ___ due fratelli. | avere-ho | gemini + deepseek-chat + opus + sonnet |
| Tu ___ un cane in casa? | avere-hai | gemini + deepseek-chat + opus + sonnet |
| Lei ___ un gatto nero. | avere-ha | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Noi ___ una bella casa in centro. | avere-abbiamo | gemini + deepseek-chat + opus + sonnet |
| Voi ___ una macchina grande? | avere-avete | gemini + deepseek-chat + opus + sonnet |
| Loro ___ due bambini piccoli. | avere-hanno | gemini + deepseek-chat + opus + sonnet |
| Dammi un bicchiere d'acqua: ___ sete. | avere-sensazioni | gemini + deepseek-chat + opus + sonnet |
| Mettiti il cappotto: io ___ freddo. | avere-sensazioni | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Vado a letto presto perche ___ sonno. | avere-sensazioni | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Lo ammetto: alla fine tu ___ ragione! | avere-ragione (NUEVO) | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Ieri io ___ comprato un libro nuovo. | avere-passato-prossimo | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Tu ___ visto il nuovo film di Sorrentino? | avere-passato-prossimo | deepseek-chat + deepseek-reasoner + opus + sonnet |
| Noi ___ letto tutto il giornale stamattina. | avere-passato-prossimo | gemini + deepseek-chat + opus + sonnet |
| Loro ___ scritto una lettera ai nonni. | avere-passato-prossimo | gemini + deepseek-chat + opus + sonnet |

**(B) Integracion (sin re-validacion tras pasar el quorum):**
- 6 celdas pobres de presente engordadas a 2 variantes; variantes comparten explanation de slot.
- `avere-sensazioni` a 5 variantes (fame, caldo + sete, freddo, sonno).
- `avere-passato-prossimo` a 8 variantes (mangiare, parlare, dormire, capire + comprare, vedere, leggere, scrivere).
- Slot NUEVO `avere-ragione` con `validation` top-level (status validated + 4 passes elevados del quorum del variante, D-19-09).
- Ids temporales legacy eliminados (payload=0, tmp-*=0 en avere.json).

**(C) Re-base del blindaje APPEND-ONLY D-88:** `node scripts/snapshot-avere-prefix.mjs` regenero el snapshot (engordar slots tempranos cambia su variants[]); `assert-avere-prefix-unchanged.mjs` exit 0. El snapshot esta gitignored (no trackeado), igual que en 22-01.

## Deviations from Plan

### Auto-fixed Issues (cazados por el quorum cross-vendor — el cazador de bugs documentado en MEMORY)

**1. [Rule 1 - Bug] tmp-avere-ha-2: explanation desalineada con el prompt**
- **Found during:** Task 2, mitad externa (Gemini + DeepSeek, AMBOS incorrecta — C4)
- **Issue:** la explanation copiada del slot avere-ha hablaba de EDAD, pero la superficie nueva es de POSESION ("Lei ha un gatto nero"). Mezcla ademas "ventidue años" (español) en texto italiano.
- **Fix:** explanation del slot generalizada a posesion+edad (cubre ambas variantes). Re-run full quorum -> 4x correcta. Tambien generalizada la explanation del slot real avere-ha (Rule 2).
- **Commit:** 4ca6463

**2. [Rule 1 - Bug] tmp-avere-freddo: doble-validez R7 ('e freddo' impersonal)**
- **Found during:** Task 2, mitad Claude (Sonnet incorrecta — C2)
- **Issue:** "Chiudi la porta: ___ freddo" admite tambien "e freddo" (impersonal, "hace frio"), violando R7 (una sola opcion valida).
- **Fix:** reformulado a "Mettiti il cappotto: io ___ freddo." — el sujeto "io" explicito ancla la 1a persona y descarta "e". Re-run full quorum sobre el texto nuevo -> 4x correcta. NO override (MEMORY: calidad > tokens).
- **Commit:** 216d8c7

**3. [Rule 1 - Bug] tmp-avere-ragione: leak R1 ('Hai visto' expone la forma)**
- **Found during:** Task 2, mitad Claude (Opus incorrecta — C5-leak)
- **Issue:** el opener "Hai visto?" expone la forma "Hai", identica a la respuesta "hai" — resoluble por copia visual sin recordar la conjugacion. Viola R1.
- **Fix:** reformulado a "Lo ammetto: alla fine tu ___ ragione!" — opener sin forma de avere conjugada. Re-run full quorum -> 4x correcta. NO override.
- **Commit:** 9eabef4 (slot nuevo)

**Nota de proceso (no deviation):** Gemini agoto su cuota per-minute (429 token-based) a mitad del lote; se uso deepseek-reasoner como segundo `by` externo distinto en 7 superficies. El quorum requiere >=2 by externos distintos correcta; deepseek-chat + deepseek-reasoner son `by` distintos, gate satisfecho. Precedente MEMORY (auto-fallback en 429).

## Verification

- `node scripts/validate-content-fixture.mjs avere content/exercises/avere.json` -> exit 0 ("OK validación: 20 ejercicio(s)")
- `node scripts/assert-avere-prefix-unchanged.mjs` -> exit 0 (D-88 re-basado, los 17 primeros intactos en CORE)
- payload=0, tmp-* en avere.json=0, slots con variants[] sin validation top-level=0, smart-quotes=0
- 6 slots de presente con variants=2; avere-sensazioni variants=5; avere-passato-prossimo variants=8; avere-ragione (nuevo) variants=1 + validation top-level validated
- `node --test tests/exercise-types.test.js` -> avere ROJO a proposito (encontró 20, esperaba 23 hardcode) — se sincroniza en 22-03

## Rojo esperado (NO arreglar aqui — es 22-03)

Los 3 hardcodes de count siguen rojos; el numero real ya es **20 slots** (era 19 tras 22-01, +1 por avere-ragione). 22-03 sincroniza `expected: 23 -> 20` en los 3 sitios + `TOTAL_EXPECTED`.

## Known Stubs

None — las 14 variantes llevan superficie real validada por quorum; el slot nuevo avere-ragione tiene explanation + validation top-level no vacios.

## Self-Check: PASSED
