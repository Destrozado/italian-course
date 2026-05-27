# 09-03 — Piloto end-to-end + gate D-VAL-15 — SUMMARY

**Status:** Complete (approved by autor in checkpoint:human-verify 2026-05-26)
**Wave:** 2
**Tasks:** 3/3 — reporter creado, piloto ejecutado 3 ejercicios × 2 pases secuenciales, gate D-VAL-15 PASS limpio, checkpoint cerrado con `approved`.
**Requirements covered:** VAL-01, VAL-02, VAL-03, VAL-05 (todas ya marcadas complete por Plans 09-01 + 09-02; el piloto las ejerce end-to-end)

---

## Self-Check

- [x] Los 3 ejercicios procesados con commits atómicos (1 por ejercicio per D-VAL-04, NO 1 por pase)
- [x] Los 6 outputs JSON del subagent parsearon limpio en el primer intento (retry budget = 0 consumido)
- [x] AVERE prefix assert OK tras mutar `avere-001` (relax `stripAdditive()` del Plan 09-02 funciona como diseñado)
- [x] Schema validator acepta los 3 ejercicios con campo `validation` populado
- [x] `node --test tests/*.test.js` exit 0 baseline + sin nuevos rompimientos
- [x] Gate D-VAL-15: los 4 must-haves observables PASS (reporter `scripts/run-validation-pilot.mjs` exit 0)
- [x] Checkpoint:human-verify cerrado por el autor con decisión `approved`

---

## Gate D-VAL-15 — resultado literal del reporter

```
Piloto Phase 9 — gate D-VAL-15

Label | Exercise ID                | pass1.by/verdict     | pass2.by/verdict      | Derived    | Expected   | Gate
------+----------------------------+----------------------+-----------------------+------------+------------+------
E1    | preposiciones-040          | opus-4-7/correcta    | sonnet-4-6/correcta   | validated  | validated  | PASS
E2    | avere-001                  | opus-4-7/correcta    | sonnet-4-6/correcta   | validated  | validated  | PASS
E3    | pilot-disputed-c5-leak-001 | opus-4-7/incorrecta  | sonnet-4-6/incorrecta | disputed   | disputed   | PASS

Gate D-VAL-15 (4 must-haves):
  1. E1 (preposiciones-040) → validated:                       PASS
  2. E2 (avere-001) → validated:                               PASS
  3. E3 (pilot-disputed-c5-leak-001) → disputed con [C5-...]:  PASS
  4. Parsing limpio primer intento (cero retries):             PASS

Piloto PASS — Phase 10 autorizada.
```

---

## Commits (4 atomic)

| Commit | Tipo | Descripción |
|--------|------|-------------|
| `fc62c26` | feat | `scripts/run-validation-pilot.mjs` — reporter colorizado gate D-VAL-15 (4 sub-gates) |
| `3248e0d` | validate | preposiciones-040 → validated (Opus + Sonnet, concerns 0) |
| `e4044b2` | validate | avere-001 → validated (Opus + Sonnet, concerns 0) — AVERE assert OK post-merge |
| `64caf29` | validate | pilot-disputed-c5-leak-001 → disputed (Opus + Sonnet, [C5-leak] × 2) |

---

## Files Modified / Created

**Created:**
- `scripts/run-validation-pilot.mjs` (301 LOC, zero-deps, ANSI colorizado, exit 0/1 por gate)

**Modified (validation field appended top-level):**
- `content/exercises/preposiciones.json` — `preposiciones-040` (8 insertions + 1 deletion, surgical Edit preservando formatting compacto del archivo)
- `content/exercises/avere.json` — `avere-001` (8 insertions + 1 deletion, AVERE prefix assert OK)
- `tests/fixtures/validation-pilot-disputed.json` — `pilot-disputed-c5-leak-001` (22 insertions + 1 deletion, concerns verbosos preservados)

---

## Observaciones para Phase 10

Concerns capturadas durante el piloto que informan plan-time Phase 10:

1. **Unanimidad Opus + Sonnet en los 3 ejercicios.** Ambos modelos coincidieron 100%: 2× correcta en E1, 2× correcta en E2, 2× incorrecta en E3. El piloto NO probó el path `pending` (1 correcta + 1 incorrecta sin sticky disputed, o 1 parse failure) — solo `validated` y `disputed`. Si Phase 10 encuentra desacuerdos Opus/Sonnet en algún ejercicio de los 271, será informativo para el risk D-VAL-03 (sesgos correlacionados del mismo vendor).
2. **Riesgo D-VAL-03 NO descartado.** Los 4 bugs motivadores fueron originalmente cazados por **Gemini**, no por Claude. El piloto confirma que el pipeline funciona, pero la unanimidad Opus+Sonnet sobre ejercicios fáciles (1 motivador YA fixed + 1 baseline trivial + 1 leak literal obvio) no es prueba de que Opus+Sonnet capturarán bugs sutiles que Gemini sí ve. Phase 10 debería monitorear si hay ejercicios en los 271 donde ambos digan `correcta` sin detectar bugs que Gemini reportaría — si emerge ese patrón, considerar añadir 3er pase Gemini (vía CLI o manual) como tiebreaker en Phase 10.
3. **Parsing JSON robusto.** 6/6 outputs parsearon en el primer intento (retry budget 0 consumido). El contrato fenced ```json + regex greedy de la sección 4 funciona con ambos modelos. NO se observó: smart quotes, trailing commas, output sin fence, múltiples bloques. El few-shot 2-shot del prompt (1 PASS + 1 FAIL) parece haber calibrado correctamente la salida.
4. **Latencia secuencial aceptable para Phase 9.** 6 spawns × ~15s promedio = ~90s wall-clock total. Phase 10 con 542 spawns secuenciales sería ~135 min wall-clock. Si emerge dolor, plan-time Phase 10 puede pivotar a paralelo (per D-VAL-04 deferred).
5. **Cero deviations Rules 1-4** durante la ejecución del piloto.

---

## Decisión del autor (checkpoint:human-verify cerrado)

`approved` — Phase 10 autorizada. Siguiente paso: `/gsd:plan-phase 10` para descomponer Phase 10 (aplicación del workflow a las 7 categorías hasta 271/271 `validated` + escalada UX para disputed VAL-08).

---

*Plan: 09-03 — Piloto end-to-end + gate D-VAL-15*
*Completed: 2026-05-26*
