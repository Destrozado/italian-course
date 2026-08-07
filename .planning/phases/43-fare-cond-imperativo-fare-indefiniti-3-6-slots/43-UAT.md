---
status: testing
phase: 43-fare-cond-imperativo-fare-indefiniti-3-6-slots
source: [43-VERIFICATION.md]
started: 2026-08-07T00:00:00Z
updated: 2026-08-07T00:00:00Z
---

## Current Test

number: 1
name: Pase TOP-LEVEL de quórum base Opus+Sonnet sobre los 9 slots
expected: |
  Los 9 slots pasan a `validated` (>=2 passes `correcta`, `by` distintos, cero
  `incorrecta`; `status === deriveStatus(passes)`). Hoy los 9 están en
  `validation.status: "pending"` con `passes: []`.
awaiting: user response

## Tests

### 1. Pase TOP-LEVEL de quórum base Opus+Sonnet (VAL-03, 1 ejercicio por contexto)
expected: Los 9 slots de `fare-cond-imperativo` y `fare-indefiniti` pasan a `validated` (>=2 passes `correcta` con `by` distintos, cero `incorrecta`). NUNCA batched — un subagent fresh context por ejercicio.
result: [pending]

### 2. Ronda EXTRA DeepSeek (D-43-20) sobre 12 de 35 variantes
expected: `fare-cond-imperativo-imperativo` (5), `fare-indefiniti-participio-passato` (4) y `fare-indefiniti-infinito-passato` (3) acaban con al menos un pase cuyo `by` empieza por `deepseek-`, además del quórum base. Vía `scripts/validate-ai-pass.mjs`, claves en `.env`.
result: [pending]

### 3. Backstop 43-01 — unicidad de lectura de las variantes PLURALES del imperativo
expected: El vocativo de cortesía `Loro` y el sujeto inclusivo `noi due` excluyen de forma cerrada la lectura de `voi` (`fate`). Ningún lector razonable admite una segunda respuesta defendible en esas 2 variantes.
result: [pending]

### 4. Backstop 43-02 — unicidad de lectura de la variante causal del gerundio passato
expected: En `fare-indefiniti-gerundio-passato` #1 (`aver fatto`), única variante donde el gerundio simple queda fuera de `options` y solo el adverbial de anterioridad lo excluye, ningún lector razonable admite el gerundio simple como alternativa válida.
result: [pending]

### 5. WR-01 (code review, ABIERTO) — concordancia con objeto POSPUESTO como distractora
expected: |
  Decidir si la forma concordada ofrecida como distractora incorrecta en las 2
  variantes invariables de `fare-indefiniti-participio-passato` es hoy
  "defendible como correcta" según el criterio operativo de la categoría.

  - #0 `Ieri io ho ___ i compiti con Anna.` — key `fatto`, distractora `fatti`
  - #1 `Maria ha ___ una torta per la festa.` — key `fatto`, distractora `fatta`

  La concordancia con objeto POSPUESTO es italiano literario/antiguo atestiguado,
  no agramatical. No lleva audit trail en `notes`, en la explanation ni en el
  prompt de validación — a diferencia del tratamiento completo que sí recibió
  `avere fatto` (magnet 4).

  Es la MISMA CLASE que CR-01 (que sí se corrigió), pero menos severa: en CR-01
  el trapassato era la lectura por DEFECTO en italiano moderno; aquí la
  concordancia pospuesta está claramente marcada como arcaica/literaria.

  Salidas posibles: (a) aceptar el riesgo y declararlo en `notes` con audit
  trail; (b) mandar las formas concordadas a la blacklist en esas 2 variantes y
  sustituirlas; (c) dejar que lo adjudique el quórum del test 1.
result: [pending]

### 6. WR-10 (code review, ABIERTO) — refuerzo de registro en los vocativos SINGULARES
expected: |
  Decidir si el vocativo por sí solo basta para excluir la lectura alternativa
  de registro en las 2 variantes singulares del imperativo, o si necesitan el
  mismo refuerzo que ya se dio a las 2 plurales.

  - `Marco, ___ una foto al gruppo!` — key `fa'`, alternativa de registro `faccia`
  - `Signor Rossi, ___ il lavoro con calma.` — key `faccia`, alternativa `fate`

  Dudas concretas: uso profesional del `Lei` con nombre de pila; `voi` di
  cortesia regional/histórico hacia un solo destinatario. El gate existente solo
  verifica PRESENCIA de un marcador del conjunto cerrado, no que ese marcador
  DESAMBIGÜE el registro.
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
