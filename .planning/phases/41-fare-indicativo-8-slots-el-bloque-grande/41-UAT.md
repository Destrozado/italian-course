---
status: testing
phase: 41-fare-indicativo-8-slots-el-bloque-grande
source: [41-VERIFICATION.md]
started: 2026-08-03T19:21:05Z
updated: 2026-08-04T00:00:00Z
---

## Current Test

number: 2
name: Confirmar que ninguna de las 48 variantes admite una segunda lectura defendible del marco
expected: |
  El pase de quórum se pronuncia explícitamente sobre esos puntos en
  `validation.passes[].concerns`, y ninguna variante queda con una opción defendiblemente
  correcta además de la key.
awaiting: user response

## Tests

### 1. Pasada TOP-LEVEL de quórum base sobre los 8 slots + ronda EXTRA DeepSeek

expected: Los 8 slots quedan `validation.status: "validated"` con ≥2 passes `correcta` de `by` distintos y 0 `incorrecta`; `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde; el gate file sigue verde con `status === deriveStatus(passes)`.
result: issue
reported: "Pasada corrida top-level el 2026-08-04 (commit 60453b7): 5/8 validated, 3/8 disputed. VAL-07 sigue rojo. `tests/content-fare-indicativo.test.js` 62/62 verde."
severity: major
pases: |
  claude-opus-5 + claude-sonnet-5 sobre los 8 slots (1 subagent por ejercicio, contexto
  fresco, VAL-03) + ronda EXTRA deepseek-reasoner (D-41-12) sobre passato-remoto y
  trapassato-remoto. Cada pase Opus re-declara el 0-gloss local (D-41-05).
disputed:
  - fare-indicativo-presente — [C4-explanation] ×2 (Opus): (a) la explanation afirma que la
    doble c sale "en las dos personas donde el castellano también hace algo raro", pero
    `hacemos` es regular y el propio párrafo lo desmiente dos líneas después; (b) registro de
    curador ("el autor puede ENCONTRAR", "no aparecen nunca entre las opciones de este
    ejercicio").
  - fare-indicativo-passato-remoto — [C4-explanation] (deepseek-reasoner): mismo registro de
    curador. Opus y Sonnet lo dieron correcta aquí; la ronda EXTRA lo cazó.
  - fare-indicativo-trapassato-remoto — [C2-una_opcion] (Sonnet): las variantes 2 y 5 usan
    `quando`, que no fuerza anterioridad estricta como `dopo che` / `appena`; el passato remoto
    simple completaría la frase igual de natural. Opus y deepseek-reasoner defienden el
    ejercicio (la forma alternativa no está entre las options, así que no hay ambigüedad
    dentro del MC). Disputa genuina 2-vs-1.
hallazgo_sistemico: |
  El registro de curador NO está solo en los slots marcados. Escaneo de los 8 `explanation`:
  `presente`, `imperfetto`, `passato-remoto` llevan los 4 patrones ("el autor", "de este
  ejercicio", "entre las opciones", "las distractoras de aquí"); `passato-prossimo` y
  `trapassato-remoto` llevan "de este ejercicio". `imperfetto` salió validated con ese
  texto — falso negativo de los 2 pases Claude sobre el mismo defecto que otro vendor
  marcó en sus hermanos.

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
issues: 1
pending: 1
skipped: 0
blocked: 0

## Gaps

- gap_id: G-41-1
  truth: "Los 8 slots de fare-indicativo.json quedan validation.status validated con >=2 passes correcta de by distintos y 0 incorrecta, y VAL_07_STRICT pasa a verde"
  status: failed
  reason: "Pasada de quórum corrida top-level (commit 60453b7): 5/8 validated, 3/8 disputed. presente y passato-remoto por [C4-explanation] (registro de curador + una afirmación falsa sobre el castellano); trapassato-remoto por [C2-una_opcion] sobre las 2 variantes con quando (2-vs-1: Opus y deepseek-reasoner defienden, Sonnet objeta)."
  severity: major
  test: 1
  artifacts:
    - path: "content/exercises/fare-indicativo.json"
      issue: "4 de las 8 explanations contienen registro de curador ('el autor', 'de este ejercicio', 'entre las opciones', 'las distractoras de aquí') — viola R4/C4. imperfetto lo lleva y salió validated (falso negativo del quórum Claude)."
    - path: "content/exercises/fare-indicativo.json"
      issue: "La explanation de presente afirma que la doble c aparece 'en las dos personas donde el castellano también hace algo raro'; 'hacemos' es regular y el propio párrafo lo desmiente después."
    - path: "content/exercises/fare-indicativo.json"
      issue: "trapassato-remoto variantes 2 y 5 usan 'quando' en vez de 'dopo che' / 'appena' — no fuerza anterioridad estricta. Disputa abierta, decisión del autor."
  missing:
    - "Reescribir las explanations afectadas quitando el registro de curador (el rationale editorial va a notes) y corregir la afirmación falsa sobre el castellano en presente"
    - "Decidir la disputa C2 de trapassato-remoto: sustituir quando por dopo che/appena en las variantes 2 y 5, u override razonado del autor"
    - "Re-pasar el quórum sobre los slots tocados (reset de passes[] antes del re-pase) incluido imperfetto, que arrastra el mismo defecto con status validated"
