---
status: testing
phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
source: [46-VERIFICATION.md]
started: 2026-08-13T22:58:02Z
updated: 2026-08-13T22:58:02Z
---

## Current Test

number: 3
name: TRAD-01/encoding — lectura de muestra de 3-4 slots completos de Preposiciones
expected: |
  Las traducciones se leen como español natural y correcto, acentuado según la RAE, con registro
  adecuado, sin convertirse en explicación gramatical ni limitarse a repetir el gloss del prompt.
awaiting: user response

## Tests

### 1. E1 · long-text — envoltura multilínea en la pantalla de ejercicio
expected: Una traducción de 2+ líneas dentro de `.session-translation` (entre `.session-feedback` y el CTA) envuelve por espacios sin desbordar, sin truncarse y sin desplazar el botón «Continuar →».
result: [pending — ABSTENIDO por ausencia de sujeto]
note: |
  La premisa NO tiene sujeto en el corpus del piloto. La traducción más larga de Preposiciones
  (`preposiciones-sugli#1`, 57 caracteres) mide 390 px y cabe en UNA línea a los 5 anchos de
  escritorio medidos (1400/1100/900/800/700 px). Decisión explícita del autor el 2026-08-13:
  abstener, no cerrar. Se re-prueba en la primera de las Phases 47-53 cuyo corpus produzca una
  traducción real de 2+ líneas. Ledger: WINDOWS.md id 21.

### 2. E2 · long-text — la misma envoltura en la card de «Errores cometidos»
expected: Envuelve sin desbordar ni truncarse dentro de la card, igual que E1.
result: [pending — ABSTENIDO por ausencia de sujeto]
note: |
  Misma ausencia de sujeto que E1. Esta superficie no cambió con la enmienda de D-46-06/D-46-08:
  la traducción sigue DENTRO de la card, porque en el resumen no hay CTA. Ledger: WINDOWS.md id 22.

### 3. TRAD-01/encoding — lectura de muestra de 3-4 slots completos
expected: Español natural y correcto, acentuado según la RAE, registro adecuado, sin deriva hacia explanation ni repetición del gloss.
result: [pending]
note: |
  La autoridad MECÁNICA ya pasó y fue verificada de forma independiente: quórum cross-vendor,
  96/96 `validated`, 2 `by` distintos (deepseek-chat + gemini-3.5-flash-lite), cero overrides
  de autor. Lo que queda es el ÚLTIMO lector humano. El autor aprobó los 4 puntos de RENDER el
  2026-08-13 («Perfecto» → REND-01..05) pero el punto 7 del checkpoint —la lectura de muestra—
  no llegó a ejecutarse. Ledger: WINDOWS.md id 23.
  ESTE es el único de los tres que se puede cerrar hoy con el corpus actual.

## Summary

total: 3
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 2

## Gaps

Ninguno. La verificación automatizada dio 15/15 requisitos con evidencia ejecutada
(suite 1329/1325/4 con los 4 fallos pre-existentes confirmados idénticos en la baseline `19f41a9`,
reporter exit 0 con TRAD-COV 96/96, motor byte-intacto contra la baseline real). Los 3 ítems de
arriba son `verification: backstop` que se abstienen por diseño: un backstop que no se puede
confirmar con evidencia se abstiene → `human_needed`, nunca pasa en silencio.
