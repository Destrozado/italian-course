---
status: complete
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
source: [46-VERIFICATION.md]
started: 2026-08-14T00:12:00Z
updated: 2026-08-14T07:31:57Z
---

## Current Test

[testing complete]

## Tests

### 1. TRAD-01/encoding — lectura de muestra de 3-4 slots completos de Preposiciones
expected: Español natural y correcto, acentuado según la RAE, registro adecuado, sin deriva hacia explanation ni repetición del gloss.
result: pass
note: |
  Aprobado por el autor el 2026-08-14 sobre una muestra derivada del disco de 4 slots
  (preposiciones-di-origen, -dagli, -per-durata, -in-locativo; 9 traducciones en total),
  presentada con la frase italiana YA RESUELTA junto a su traducción.
  La autoridad mecánica ya había pasado y se verificó de forma independiente: quórum
  cross-vendor, 96/96 `validated`, 2 `by` distintos (deepseek-chat + gemini-3.5-flash-lite),
  cero overrides de autor.

## Summary

total: 1
passed: 1
issues: 0
pending: 0
skipped: 0
blocked: 0

## Carried Forward — no son tests de la fase 46

Dos ítems `verification: backstop` del `## UI Considerations` de `46-UI-SPEC.md` se
**retiraron de este UAT el 2026-08-14, por decisión explícita del autor**, porque su premisa no
tiene sujeto en el corpus de esta fase: no son tests de la 46, son ítems arrastrados.

| Ítem | Por qué no es test de esta fase | Dónde vive ahora |
|---|---|---|
| E1 · long-text — envoltura de 2+ líneas en `.session-translation` | La traducción más larga del piloto (`preposiciones-sugli#1`, 57 caracteres) mide 390 px y cabe en UNA línea a los 5 anchos de escritorio medidos (1400/1100/900/800/700 px). No existe una traducción de 2+ líneas que mirar | `WINDOWS.md` id 21 |
| E2 · long-text — la misma envoltura en la card de «Errores cometidos» | Misma ausencia de sujeto. Esta superficie no cambió con la enmienda de D-46-06/D-46-08 | `WINDOWS.md` id 22 |

**No se cierran ni se aprueban: siguen ABSTENIDOS.** Se re-prueban en la primera de las Phases
47-53 cuyo corpus produzca una traducción real de 2+ líneas. Un backstop que no se puede confirmar
con evidencia se abstiene, nunca pasa en silencio.

**Registro de la reclasificación, para que no parezca un ablandamiento del gate:** el predicado
`phase uat-passed --require-verification` bloqueaba con `46-UAT.md: test 1 (skipped)` y
`test 2 (skipped)`. La salida NO fue reetiquetarlos como pasados —fue reconocer que un test cuyo
sujeto no existe en la fase no es un test de la fase. Ambos siguen contabilizados en el ledger, así
que la deuda no desaparece: cambia de dueño, de la fase 46 a las 47-53.

## Gaps

Ninguno. Verificación automatizada: 15/15 requisitos con evidencia ejecutada. Seguridad:
`threats_open: 0` sobre 27 amenazas (26 cerradas por el auditor + T-46-14 cerrada con candado y
verificada por mutación).
