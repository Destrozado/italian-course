---
status: complete
phase: 41-fare-indicativo-8-slots-el-bloque-grande
source: [41-VERIFICATION.md]
started: 2026-08-03T19:21:05Z
updated: 2026-08-04T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Pasada TOP-LEVEL de quórum base sobre los 8 slots + ronda EXTRA DeepSeek

expected: Los 8 slots quedan `validation.status: "validated"` con ≥2 passes `correcta` de `by` distintos y 0 `incorrecta`; `VAL_07_STRICT=1 node --test tests/*.test.js` pasa a verde; el gate file sigue verde con `status === deriveStatus(passes)`.
result: pass
reported: "Corrida top-level el 2026-08-04. 8/8 validated. VAL_07_STRICT: 781/781 verde, 0 fallos. `tests/content-fare-indicativo.test.js`: 62/62, con `status === deriveStatus(passes)` en los 8 slots. `passato-remoto` y `trapassato-remoto` llevan su ronda EXTRA deepseek-reasoner (D-41-12)."
pases: |
  claude-opus-5 + claude-sonnet-5, un subagent por ejercicio con contexto fresco y aislado
  (VAL-03 — nunca batched), más la ronda EXTRA deepseek-reasoner obligatoria (D-41-12) sobre
  passato-remoto y trapassato-remoto. Cada pase Opus re-declara localmente el 0-gloss
  (D-41-05), mirror de `content/exercises/riflessivi.json:245`.
recorrido: |
  No pasó a la primera. Tres rondas de accept-fix, 6 defectos editoriales reales corregidos:

  Ronda 1 (60453b7) — 5/8 validated, 3 disputed:
    - presente [C4] Opus: afirmación falsa ("la doble c sale en las dos personas donde el
      castellano también hace algo raro" — `hacemos` es regular, y el propio párrafo lo
      desmentía dos líneas después) + registro de curador.
    - passato-remoto [C4] deepseek-reasoner: mismo registro de curador. Opus y Sonnet lo
      habían dado correcta aquí; lo cazó la ronda EXTRA.
    - trapassato-remoto [C2] Sonnet: las 2 variantes con `quando`. Disputa 2-vs-1.
    Hallazgo sistémico del escaneo: el registro de curador estaba en 5 de las 8
    explanations, e `imperfetto` lo arrastraba con status validated — falso negativo de
    los 2 pases Claude sobre el defecto que otro vendor marcó en sus hermanos.

  Fix 1 (419f2e4) + ronda 2 (fd663a8) — 6/8 validated, 2 disputed NUEVOS, por unanimidad
  Opus+Sonnet (no disputas 1-vs-1):
    - passato-remoto [C4]: "el pretérito castellano reparte la raíz por personas" es falso
      (`hacer` tiene raíz única `hic-`); el atajo de la raíz corta era autocontradictorio;
      la taxonomía de dos trampas no cubría la distractora que es forma real de otra persona.
    - passato-prossimo [C4]: "y sono fatto no es italiano" es falso en absoluto — existe en
      lectura copulativa; lo que lo invalida es el objeto directo.
    La objeción C2 del `quando` NO reapareció: los tres modelos coinciden ahora en que
    C2/R7 se juega sobre las opciones ofrecidas. El override del autor quedó innecesario.

  Fix 2 (6437756) + fix 3 + ronda 3 (ef7bb4f) — 8/8 validated:
    - Última iteración sobre passato-remoto: la apertura afirmaba por exclusividad que era
      "la casilla donde la raíz alterna dentro de un mismo tiempo", pero el presente ya
      alterna `facc-`/`fa-`. Reformulado con un cross-ref sin ID (R2 lo permite).

### 2. Confirmar que ninguna de las 48 variantes admite una segunda lectura defendible del marco

expected: El pase de quórum se pronuncia explícitamente sobre esos puntos en `validation.passes[].concerns`, y ninguna variante queda con una opción defendiblemente correcta además de la key.
result: pass
reported: "Las 5 adjudicaciones quedan registradas como concerns declarativas en el pase Opus de los slots afectados (mirror de riflessivi.json:245: concern declarativa sobre verdict correcta). Ninguna variante quedó con una segunda opción defendible."
adjudicaciones: |
  - **2 variantes con `quando`** (trapassato remoto): es cierto que `quando` no fuerza
    anterioridad estricta como `dopo che`/`appena` y que el passato remoto simple
    completaría la frase igual de natural — pero esa forma no está entre las options, y
    C2/R7 se juega sobre el conjunto ofrecido. Sonnet lo marcó como violación en la ronda 1
    y lo retiró en la 2; Opus y deepseek-reasoner lo defendieron siempre. Se conserva el
    reparto deliberado 2 `dopo che` + 2 `appena` + 2 `quando`.
  - **`facetti` / `facerono`**: los tres pases coinciden en que NO son atestiguadas para
    esas personas. Las débiles meridionales reales son de la familia `facette`/`facettero`,
    ya blacklisteada en `notes`; las toscano-arcaicas tampoco coinciden. La autoría las
    había marcado como no descartadas con certeza — el quórum las descarta.
  - **Colocación de `già`** delante del hueco: uso atestiguado y frecuente con valor
    enfático (`io già lo sapevo`). El orden de manual sería `avevo già fatto`, pero el hueco
    absorbe el compuesto entero, así que la anteposición es estructuralmente necesaria.
    Matiz de registro, no violación.
  - **Secuencias `essere + fatto`**: bloqueadas por el objeto directo, con bloqueo doble en
    noi y loro por discordancia de número. Bloqueo estructural, no ambigüedad.
  - **CR-01 (retirada del auxiliar de futuro anteriore)**: ratificada. Ningún pase reabrió
    el tema, y en trapassato remoto el distractor de futuro anteriore no abre la doble
    validez epistémica porque las 6 principales van en passato remoto.
findings_code_review: |
  WR-01 / WR-04 / WR-05 siguen abiertos y NO los cierra este UAT — son juicios de diseño
  del ejercicio (colapso de discriminación efectiva, explanations que no nombran la familia
  de distractora), no de validez lingüística. La reescritura de passato-remoto pasó su
  taxonomía de 2 a 3 trampas, que mordisquea WR-04 pero no lo cierra.

## Summary

total: 2
passed: 2
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-41-1
  truth: "Los 8 slots de fare-indicativo.json quedan validation.status validated con >=2 passes correcta de by distintos y 0 incorrecta, y VAL_07_STRICT pasa a verde"
  status: resolved
  severity: major
  test: 1
  reason: "Pasada de quórum corrida top-level: 5/8 validated en la ronda 1. Cerrado tras 3 rondas de accept-fix sobre 6 defectos editoriales reales, todos en explanations, ninguno en las 48 variantes ni en las keys."
  resolved_by: "419f2e4 (fix C4 registro de curador) + 6437756 (fix C4 afirmaciones falsas) + ef7bb4f (fix C4 exclusividad, 8/8 validated)"
  resolved_at: 2026-08-04
