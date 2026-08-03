---
status: testing
phase: 41-fare-indicativo-8-slots-el-bloque-grande
source: [41-VERIFICATION.md]
started: 2026-08-03T19:21:05Z
updated: 2026-08-03T19:21:05Z
---

## Current Test

number: 1
name: Pasada TOP-LEVEL de quórum base sobre los 8 slots + ronda EXTRA DeepSeek
expected: |
  Los 8 slots quedan `validation.status: "validated"` con ≥2 passes `correcta` de `by`
  distintos y 0 `incorrecta`; `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde;
  `tests/content-fare-indicativo.test.js` sigue verde con `status === deriveStatus(passes)`.
awaiting: user response

## Tests

### 1. Pasada TOP-LEVEL de quórum base sobre los 8 slots + ronda EXTRA DeepSeek

expected: Los 8 slots quedan `validation.status: "validated"` con ≥2 passes `correcta` de `by` distintos y 0 `incorrecta`; `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde; el gate file sigue verde con `status === deriveStatus(passes)`.
result: [pending]

Correr el quórum base canónico (Opus + Sonnet vía el skill `gsd-validate-exercise`) sobre los
8 slots de `content/exercises/fare-indicativo.json`, **1 ejercicio por contexto — NUNCA batched**
(VAL-03), más la ronda **EXTRA DeepSeek obligatoria** (D-41-12) sobre
`fare-indicativo-passato-remoto` y `fare-indicativo-trapassato-remoto`, y la re-declaración
local del 0-gloss en los `concerns` de cada pase Opus.

**Por qué es humano:** el quórum canónico Opus+Sonnet spawnea Task subagents y no está
disponible dentro de un subagent `gsd-executor` ni dentro del verificador (D-41-15). Es la
mitad mecánica de SC-4 que la fase deliberadamente no cierra en 41-01/41-02 — el `pending`
en disco es honesto, no un olvido.

### 2. Confirmar que ninguna de las 48 variantes admite una segunda lectura defendible del marco

expected: El pase de quórum se pronuncia explícitamente sobre esos puntos en `validation.passes[].concerns`, y ninguna variante queda con una opción defendiblemente correcta además de la key.
result: [pending]

Con el mismo rigor que ya se aplicó a las variantes del futuro anteriore (CR-01, corregido en
`a613252` / `cc212ff`), confirmar que ninguna de las 48 variantes admite una segunda lectura
defendible del marco temporal — es el `verification: backstop` declarado en ambos PLAN.md.
Atención especial a:

- Las **2 variantes con `quando`** del trapassato remoto (`quando` admite también imperfetto
  y passato remoto simple).
- `facetti` y `facerono` en `passato-remoto` — las dos formas que la autoría marcó como
  **no descartadas con certeza** (podrían estar atestiguadas en alguna variedad meridional).
- La colocación marcada de `già` delante del hueco (`io già ___ i compiti`), declarada en
  `notes` como elección deliberada.
- Las secuencias `essere + fatto` que solo el objeto directo bloquea.
- Los findings abiertos WR-01 / WR-04 / WR-05 del code review (colapso de discriminación a
  2 opciones efectivas, explanations que no nombran la familia de distractora que ofrecen).

**Por qué es humano:** es un juicio lingüístico marcado `verification: backstop` porque ninguna
aserción mecánica puede cerrarlo. El code review ya encontró y corrigió una instancia real
(CR-01) actuando exactamente como esta red de seguridad — el riesgo está demostrado, no es
hipotético.

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
