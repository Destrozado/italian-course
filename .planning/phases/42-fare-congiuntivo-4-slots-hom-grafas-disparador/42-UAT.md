---
status: testing
phase: 42-fare-congiuntivo-4-slots-hom-grafas-disparador
source: [42-VERIFICATION.md]
started: 2026-08-06T10:00:00Z
updated: 2026-08-06T10:00:00Z
---

## Current Test

number: 1
name: Pasada TOP-LEVEL de quórum base + ronda EXTRA DeepSeek sobre las 10 homógrafas
expected: |
  Los 5 slots quedan `validation.status: "validated"` con >=2 passes `correcta` de `by` distintos
  y 0 `incorrecta`; en los 4 slots del paradigma al menos un `by` que empieza por `deepseek`;
  `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde;
  `tests/content-fare-congiuntivo.test.js` sigue verde con `status === deriveStatus(passes)`.
awaiting: user response

## Tests

### 1. Pasada TOP-LEVEL de quórum base (Opus+Sonnet) + ronda EXTRA DeepSeek

Correr el quórum base canónico vía el skill `gsd-validate-exercise` (Opus + Sonnet, criterios C1-C5,
**un subagent fresh por ejercicio — VAL-03, NUNCA batched**) sobre los 5 slots de
`content/exercises/fare-congiuntivo.json`, más la ronda EXTRA DeepSeek obligatoria (D-42-08) vía
`scripts/validate-ai-pass.mjs` sobre las **10 variantes homógrafas**:

| Slot | Variantes homógrafas | Forma |
|------|---------------------|-------|
| `fare-congiuntivo-presente` | io, tu, lui-lei | `faccia` |
| `fare-congiuntivo-imperfetto` | io, tu | `facessi` |
| `fare-congiuntivo-passato` | io, tu, lui-lei | `abbia fatto` |
| `fare-congiuntivo-trapassato` | io, tu | `avessi fatto` |

expected: los 5 slots en `validated`, `VAL_07_STRICT=1` en verde, gates de categoría sin romperse.
result: [pending]

**Aviso de falso positivo conocido:** Gemini y DeepSeek marcarán el gloss léxico de conjunción
(`Benché (aunque)`, `Prima che (antes de que)`) como C5-leak. Es **falso positivo de política**
(D-42-13): el gloss traduce la conjunción, no el verbo, y «aunque» rige los dos modos en español,
así que no filtra la respuesta. **No se arregla.** La base de aprobación es Claude Opus+Sonnet.
En cambio, un flag C4-accent sobre español sin tildes **sí sería bug real** → se arreglan los acentos.

### 2. Confirmación lingüística de unicidad (backstop)

Confirmar que ninguna de las 30 variantes admite una segunda lectura defendible del disparador o del
marco de concordancia. Marcado `verification: backstop` en los dos PLAN.md.

Foco, por orden de riesgo demostrado:
- **Las 6 variantes del slot `fare-congiuntivo-disparador`** — es el punto exacto donde el code review
  ya encontró 2 defectos reales (CR-01, CR-02: `faceva` y `facesse` eran defendibles bajo un `ogni
  giorno` pelado). Corregidos con ancla temporal `in questo momento` / `adesso`, pero el ancla es
  nueva y no ha pasado por quórum.
- **El blindaje de concordancia de `passato` y `trapassato`** — sus 3 distractoras son formas de
  subjuntivo de la misma persona, incluidas las dos simples (`faccia`, `facessi`), así que el marco de
  cada prompt tiene que excluirlas limpiamente o la distractora se vuelve defendible.

expected: el pase de quórum se pronuncia explícitamente sobre esos dos bloques; cero variantes con una
opción defendiblemente correcta además de la key.
result: [pending]

**Por qué es humano:** ninguna aserción mecánica lo cierra, y el code review ya demostró que el riesgo
no es hipotético. Dar esto por verificado sin la pasada de quórum sería un pase silencioso sobre
exactamente el daño que esta categoría existe para prevenir — con la cascada D-54, una variante con dos
respuestas válidas resetea la categoría entera.

### 3. Ojo humano sobre los 18 variantes de 42-02 (opcional pero recomendado)

Solo el slot `presente` pasó por el checkpoint humano de wave 1. Los 18 de `passato`, `trapassato` y
`disparador` se autoraron con `autonomous: true`, sin gate. Los dos juicios lingüísticos de arriba van
marcados `human_judgment: true` en `coverage.D1` y `coverage.D3` de los SUMMARY.

expected: jugar la categoría en http://localhost:3000 y confirmar que las 5 casillas se sienten como el
`presente` ya aprobado — rotación de variante entre pasadas, sujeto siempre presente en las homógrafas,
disparador que descarta el otro modo sin dudar.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
