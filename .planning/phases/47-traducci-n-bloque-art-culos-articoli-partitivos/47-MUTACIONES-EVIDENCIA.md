# Phase 47 · Plan 04 — Evidencia de las mutaciones de cierre

> **Contenido:** las **tres** mutaciones de cierre de la fase, ejecutadas sobre el bloque Artículos ya
> completo (110 traducciones, corpus 206). Las tres se EJECUTARON y en las tres se OBSERVÓ el rojo con
> su exit code apuntado y su línea literal transcrita de la corrida. **Ninguna se leyó.**

> **Este fichero NO es el SUMMARY del plan 04.** El plan 04 está **parcialmente ejecutado**: las Tasks
> 1 y 2 están hechas, y la **Task 3 (`checkpoint:human-verify`, `gate="blocking"`) está BLOQUEADA
> ESPERANDO AL AUTOR**. El SUMMARY se escribe cuando el autor cierre la Task 3, no antes: escribirlo
> ahora haría que el índice de planes leyera el plan como completo y se saltara el gate bloqueante.
> Es la misma disciplina que el fichero equivalente de la Phase 46.
>
> Existe porque el registro literal de los exit codes **es** la mitigación de T-47-22 (Repudiation:
> afirmar que el gate muerde sin haberlo observado). Si viviera solo en el contexto del ejecutor, se
> perdería al cerrarse la sesión y las mutaciones no contarían como ejecutadas.

- **Fecha de la corrida:** 2026-08-14
- **HEAD durante la corrida:** `829ee5c`
- **Ficheros mutados y restaurados:** `content/exercises/articoli.json` (mutaciones 1 y 2) ·
  `scripts/run-validation-271.mjs` (mutación 3, en sus dos formas)
- **md5 de la foto verde** — los tres, tomados ANTES de mutar nada:

| Fichero | md5 |
|---|---|
| `content/exercises/articoli.json` | `93625e94c8baaac24937b78956a72a0f` |
| `content/exercises/partitivos.json` | `39e7cac5531597d81c6bc23228cc400d` |
| `scripts/run-validation-271.mjs` | `37ae18c84377d8f4173b8ac0534323a7` |

**Método de restauración:** copia de fichero (`cp` desde la copia de la foto verde), **fichero a
fichero**, nunca `git checkout` / `git stash` / `git clean`. Es el idioma que la Phase 46 fijó
deliberadamente para no arrastrar pérdidas colaterales, y la prohibición explícita del plan 47-04. La
igualdad del md5 tras cada restauración es la prueba de que fue exacta, no aproximada.

**`content/exercises/partitivos.json` NO se mutó.** Su md5 está en la tabla porque forma parte de la
foto verde de partida y porque su intactidad es criterio de aceptación; las dos mutaciones de contenido
cayeron las dos sobre `articoli.json`, y se dice en lugar de dejarlo suponer.

---

## Foto verde de partida — 2026-08-14T17:45:39Z

```
$ git status --porcelain
?? .planning/research/.cache/          ← untracked, ajeno a la fase; ningún fichero rastreado modificado
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 62         | 0         | 0        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

```
$ node --test tests/count-arrays-lockstep.test.js ; echo $?     # 2026-08-14T17:45:43Z
# tests 64
# suites 15
# pass 64
# fail 0
0
```

**Los dos exit codes de partida son 0.** Sin esta foto ningún rojo de abajo sería atribuible a su
mutación — es la `<precondition>` del Task 1, verificada y no asumida.

---

## MUTACIÓN 1 — una sola traducción sin validar deja el gate de cobertura ROJO

**Dirección compuesta mutada: `articoli-il-cons#0`**

Estado antes (íntegro, impreso por el propio script de mutación antes de tocar nada):

```json
{
  "text": "Leo el libro en el jardín.",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "gemini-3.5-flash-lite", "date": "2026-08-14", "verdict": "correcta", "concerns": [] },
      { "by": "deepseek-reasoner",     "date": "2026-08-14", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

La mutación vació `validation.passes` a `[]` y dejó `validation.status` en `"pending"`. **El texto de la
traducción NO se tocó** —el script aborta si lo detecta cambiado—: esta mutación prueba el **umbral de
cobertura**, no la calidad. `git diff --stat` de la mutación:
`1 file changed, 2 insertions(+), 15 deletions(-)`.

El script de mutación aborta si el slot no existe, si la variante no tiene `translationES.validation`,
si los `passes` ya estaban vacíos, o si el fichero resultante es idéntico al de partida. **Una mutación
que no muta y sale verde sería el peor resultado posible**, así que no puede pasar en silencio.

### El rojo OBSERVADO — 2026-08-14T17:46:14Z

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 61         | 0         | 1        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal del sub-gate:**
  `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=1, missing=0, disputed=0)`
- Las dos cifras difieren en **exactamente una unidad** (205 vs 206) y las dos las **interpola el
  reporter** desde valores computados (`totalTranslationValidated` y `TOTAL_TRANSLATION_EXPECTED`, este
  último Σ de los `expected` que `mcVariantCountOf` deriva de cada fichero). **Ninguna la transcribió el
  ejecutor.**
- `pending=1` nombra exactamente la magnitud mutada, y la fila de `articoli` la localiza en su categoría
  (`62 | 61 | 0 | 1 | 0`).
- **UNA sola traducción no `validated` entre las 110 del bloque —206 del corpus— pone el gate rojo. No
  se promedia ni se tolera un umbral:** el veredicto es igualdad de enteros
  (`totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED`).

### El otro lado del umbral — verde restaurado, 2026-08-14T17:46:19Z

```
$ cp <copia-de-la-foto-verde> content/exercises/articoli.json
$ md5sum content/exercises/articoli.json
93625e94c8baaac24937b78956a72a0f          ← idéntico a la foto verde: restauración byte a byte
$ git status --porcelain content/exercises/articoli.json
(vacío)
$ node scripts/run-validation-271.mjs ; echo $?
articoli                 | 62       | 62         | 0         | 0        | 0
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

**Los DOS lados del umbral quedan ejecutados: 205/206 → ROJO, 206/206 → VERDE.**

---

## MUTACIÓN 2 — texto sin tildes → el QUÓRUM lo caza → `disputed` → gate ROJO

**Dirección compuesta mutada: `articoli-gli-ps#0`.**

**Cómo se eligió, y por qué no hay ninguna de 3 tildes.** El corpus del bloque se recorrió entero
contando tildes por traducción: **ninguna de las 110 llega a 3**, y **15** llevan exactamente 2 (9 en
`articoli`, 6 en `partitivos`). Se eligió esta de entre las de 2 porque sus dos tildes pertenecen a
**clases de regla distintas**, lo que hace la mutación inequívoca por partida doble:

| | |
|---|---|
| `prompt` italiano | `Al convegno parlano gli psicologi più noti.` |
| Respuesta correcta | `gli` |
| Texto ORIGINAL | `En el congreso hablan los psicólogos más conocidos.` |
| Texto MUTADO | `En el congreso hablan los psicologos mas conocidos.` |
| Tildes quitadas | `ó` (esdrújula: `psicólogos`) y `á` (**tilde diacrítica**: `más` adverbio vs. `mas` conjunción adversativa). 2 → 0. |
| Longitud | **idéntica** (51 chars): el script aborta si cambia, para que la mutación sea *solo* desacentuar |

Además se vació `validation.passes` a `[]`: los pases anteriores validaron el texto **anterior**, y
dejarlos habría sido un registro que miente sobre qué se validó. `git diff --stat`:
`1 file changed, 3 insertions(+), 16 deletions(-)`.

**La autoridad sobre acentos es el QUÓRUM (criterio S4), no un escáner mecánico de tildes.** No se creó
ninguno: el diff de esta mutación **no toca `scripts/` ni `tests/` ni `docs/`** —verificado con
`git status --porcelain scripts/ tests/ docs/` → **vacío**, transcrito abajo—. Inventarlo habría sido
re-litigar D-46-12/TRAD-01-encoding, que lo descartó a propósito por falsos positivos sobre nombres
propios y monosílabos.

### Los dos veredictos REALES del quórum cross-vendor

Dos invocaciones, una por vendor, con `--avoid` para garantizar `by` distintos. Los dos jueces son los
**mismos que gobiernan `articoli` en disco**, incluido el `deepseek-reasoner` del cambio de juez de
mitad de corpus (`WINDOWS` id 38): la mutación se juzga con el tribunal real de la categoría, no con uno
más blando ni más severo.

**Pase 1 — `deepseek-reasoner`, 2026-08-14T17:47:05Z** (pinneado `deepseek-reasoner`, respondió
`deepseek-reasoner` — **sin fallback**, el `by` escrito es el pinneado)

```
$ node scripts/validate-translation-pass.mjs 'articoli-gli-ps#0' --model=deepseek-reasoner --write
- **S4:** Faltan dos tildes obligatorias: `psicologos` debe ser `psicólogos` y `mas` debe ser `más`.
         Por tanto, S4 es `false`.
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan dos tildes en el español: 'psicologos' debe ser 'psicólogos' y 'mas' debe ser 'más'"
  ]
}
✔ actualizado pase deepseek-reasoner → articoli-gli-ps#0.translationES (status: disputed)
```

**Pase 2 — `gemini-3.5-flash-lite`, 2026-08-14T17:47:35Z** (pinneado `gemini-3.5-flash-lite`, respondió
`gemini-3.5-flash-lite` — **el fallback declarado no llegó a usarse**; se nombran los dos, el pinneado y
el que respondió, porque en esta fase hubo 4 auto-fallbacks reales y no se puede dar por supuesto)

```
$ node scripts/validate-translation-pass.mjs 'articoli-gli-ps#0' \
    --model=gemini-3.5-flash-lite \
    --fallback=gemini-3.5-flash,gemini-2.5-flash \
    --avoid=deepseek-reasoner --write
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tildes obligatorias en el español: 'psicologos' debe ser 'psicólogos' y 'mas' debe ser 'más'"
  ]
}
✔ actualizado pase gemini-3.5-flash-lite → articoli-gli-ps#0.translationES (status: disputed)
```

**Los DOS vendors devolvieron `incorrecta` con el tag literal `[S4-acentos]`, cada uno nombrando las dos
tildes exactas y los dos con `s4_acentos: false` y los otros cuatro criterios en `true`** — o sea, el
rojo es **atribuible al acento y a nada más**: ninguno de los dos aprovechó para objetar fidelidad,
naturalidad ni el italiano.

**S4 MUERDE sobre este bloque, y con el juez nuevo.** El camino del punto 5 del plan —los dos vendors
aprobando el texto sin tildes, que sería un HALLAZGO BLOQUEANTE— **NO se activó**. Por tanto **no hizo
falta reforzar `docs/TRANSLATION-VALIDATION-PROMPT.md`**, el prompt no cambió, y **no hay nada que
re-validar bajo un prompt nuevo**. Es también la confirmación de que el cambio de juez de la id 38 no
ablandó el criterio de acentos: `deepseek-reasoner` lo aplica igual de estricto que `deepseek-chat` en la
Phase 46.

### El rojo OBSERVADO — 2026-08-14T17:47:44Z

`deriveStatus(passes)` con dos `incorrecta` y cero override → `disputed` (sticky, D-VAL-07). El `status`
escrito en disco quedó también en `disputed`, así que **VAL-09 siguió en PASS**: no hubo desincronía y el
rojo no viene de un registro incoherente.

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 61         | 1         | 0        | 0
        → Traducciones disputed: articoli-gli-ps#0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=0, missing=0, disputed=1)
        → Disputed: articoli-gli-ps#0

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal:**
  `TRAD-COV (206/206 traducciones validated): FAIL (205/206 — pending=0, missing=0, disputed=1)`
- **Dirección compuesta nombrada, dos veces:** `→ Traducciones disputed: articoli-gli-ps#0` (en la tabla)
  y `→ Disputed: articoli-gli-ps#0` (bajo el sub-gate).
- La cadena completa quedó ejecutada de punta a punta:
  **texto sin tildes → quórum `incorrecta` con `[S4-acentos]` → `deriveStatus` = `disputed` → reporter
  exit 1.** Sin escáner mecánico en ninguno de los eslabones.

### Sobre `VAL-08`: el criterio de aceptación del plan nombra el sub-gate equivocado — y es el MISMO hallazgo de la Phase 46, reproducido

El criterio del plan 47-04 pide, para la mutación 2, «la línea del sub-gate de cero `disputed` **también
en FAIL**». **`VAL-08` se quedó en `PASS`**, exactamente igual que en la Phase 46 (allí quedó anotado
como «Hallazgo 1»). **No es que el gate no muerda: es que el criterio espera el rojo en el sub-gate que
no le corresponde.**

Leído en `scripts/run-validation-271.mjs`: `val08Pass = totalDisputed === 0`, y `totalDisputed` se reduce
sobre `perCategory` —el bucle de **SLOTS**—. VAL-08 es, por diseño, un gate de nivel slot. Los
`disputed` de nivel **traducción** viven en `perTranslationCategory` → `totalTranslationDisputed`, y los
consume **TRAD-COV**, que es quien los imprime y quien nombra la dirección compuesta.

**No queda ninguna vía de escape**, que es lo que importa: una traducción `disputed` no es `validated`,
así que baja `totalTranslationValidated` por debajo de `TOTAL_TRANSLATION_EXPECTED` y TRAD-COV sale FAIL
necesariamente. La cobertura está completa; lo que sobra es la expectativa escrita en el criterio.

**No se tocó el gate**, y aquí la regla de la casa es doblemente aplicable: ensanchar VAL-08 para
incluir los `disputed` de traducción cambiaría la semántica de un sub-gate a final de fase, sin mandato,
y —lo decisivo— **habría que verificar ese cambio con la misma mutación que verifica el código que
arregla**, lo que convertiría un cierre de fase en un cambio de gate sin verificar. Se deja **anotado
para el autor**, no arreglado en silencio. Que el hallazgo se reproduzca idéntico dos fases seguidas es
en sí mismo el dato: **el criterio se copió de plan a plan sin corregirse**, y esta es la segunda vez que
se paga leerlo.

### Verde restaurado — 2026-08-14T17:47:54Z

```
$ git status --porcelain scripts/ tests/ docs/          # T-47-23
(vacío)                                                 ← ningún escáner de acentos inventado
$ cp <copia-de-la-foto-verde> content/exercises/articoli.json
$ md5sum content/exercises/articoli.json
93625e94c8baaac24937b78956a72a0f                        ← idéntico a la foto verde
$ git status --porcelain content/exercises/articoli.json
(vacío)
$ node -e '<lee la variante del disco>'
"En el congreso hablan los psicólogos más conocidos." | status: validated |
  passes: gemini-3.5-flash-lite:correcta, deepseek-reasoner:correcta
$ node scripts/run-validation-271.mjs ; echo $?
articoli                 | 62       | 62         | 0         | 0        | 0
  VAL-08 (cero disputed): PASS
  TRAD-COV (206/206 traducciones validated): PASS (206/206)
Milestone gate PASS.
0
```

La restauración se comprueba en **tres** planos, no en uno: el md5 (byte a byte), el `porcelain` (git no
ve nada) y la **lectura del dato concreto** (el texto acentuado y sus dos pases `correcta` de vuelta). Un
md5 igual con un texto distinto es imposible, pero el tercer plano es el que se lee sin saber eso.

### Suite tras las mutaciones 1 y 2 restauradas — 2026-08-14T17:48:06Z

```
$ node --test tests/*.test.js tests/fixtures/*.test.js
# tests 1343
# suites 229
# pass 1339
# fail 4
```

Los **4** son los **mismos 4 pre-existentes** de `tests/requirements-traceability.test.js` (`WINDOWS`
id 17, deuda D-45-12), el mismo `not ok 142 - trazabilidad de requisitos — la cobertura se DERIVA del
disco (DEUDA, D-45-12)` y las **mismas cifras exactas** que la línea base del plan 47-03 (1343 / 1339 /
4). **Cero regresiones nuevas.** La suite **no** sale en exit 0 y **no debe salirlo**: arreglar la
trazabilidad aquí sería editar un gate sin correr su mutación, que es justo lo que esta fase existe para
no hacer.
