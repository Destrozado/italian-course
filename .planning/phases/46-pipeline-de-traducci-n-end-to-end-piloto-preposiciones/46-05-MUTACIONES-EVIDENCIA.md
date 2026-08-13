# Phase 46 · Plan 05 — Evidencia de las mutaciones 1 y 2 (D-46-18)

> **Este fichero NO es el SUMMARY del plan 05.** El plan 05 está **parcialmente ejecutado**:
> las Tasks 1 y 2 están hechas, y la **Task 3 (`checkpoint:human-verify`, `gate="blocking"`)
> está BLOQUEADA ESPERANDO AL AUTOR**. El SUMMARY se escribe cuando el autor cierre la Task 3,
> no antes: escribirlo ahora haría que `identify_plan` leyera el plan como completo y se saltara
> el checkpoint bloqueante.
>
> Existe porque el registro literal de los exit codes **es** la mitigación de T-46-24
> (Repudiation: afirmar que el gate muerde sin haberlo observado). Si viviera solo en el
> contexto del ejecutor, se perdería al cerrarse la sesión y la mutación no contaría como
> ejecutada.

- **Fecha de la corrida:** 2026-08-13
- **HEAD durante la corrida:** `edd45d9`
- **Fichero mutado y restaurado:** `content/exercises/preposiciones.json`
- **md5 del corpus antes y después:** `54d278382195464a8adfed62f9a32c19` (idéntico — restauración byte a byte)

---

## Foto verde de partida — 2026-08-13T19:50:46Z

```
$ git status --porcelain content/exercises/preposiciones.json
(vacío)
$ node scripts/run-validation-271.mjs ; echo $?
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
Milestone gate PASS.
0
```

**Método de restauración:** copia de fichero (`cp` desde una copia de la foto verde), **no**
`git checkout` / `git stash` / `git clean`. Las olas anteriores de la fase usaron copia-restaura
deliberadamente para no arrastrar pérdidas colaterales, y aquí se mantiene el mismo idioma.
La igualdad del md5 arriba es la prueba de que la restauración fue exacta, no aproximada.

---

## MUTACIÓN 1 — una traducción en `pending` deja el gate de cobertura ROJO

**Dirección compuesta mutada: `preposiciones-di-origen#0`**

Estado antes (íntegro):

```json
{
  "text": "María viene de Pisa, pero es de Roma de nacimiento.",
  "validation": {
    "status": "validated",
    "passes": [
      { "by": "deepseek-chat",         "date": "2026-08-13", "verdict": "correcta", "concerns": [] },
      { "by": "gemini-3.5-flash-lite", "date": "2026-08-13", "verdict": "correcta", "concerns": [] }
    ]
  }
}
```

La mutación vació `validation.passes` a `[]` y dejó `validation.status` en `"pending"`.
**El texto de la traducción NO se tocó** — esta mutación prueba el umbral de cobertura,
no la calidad. `git diff --stat` de la mutación: `1 file changed, 2 insertions(+), 15 deletions(-)`.

### El rojo OBSERVADO — 2026-08-13T19:51:19Z

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (1 categorías declaradas cubiertas, 96 variantes)

preposiciones            | 96       | 95         | 0         | 1        | 0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=1, missing=0, disputed=0)

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal del sub-gate:** `TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=1, missing=0, disputed=0)`
- Las dos cifras difieren en **exactamente una unidad** (95 vs 96) y las dos las interpola el
  reporter desde valores computados (`totalTranslationValidated` y `TOTAL_TRANSLATION_EXPECTED`,
  el segundo derivado con `mcVariantCountOf` del propio fichero). Ninguna la transcribió el ejecutor.
- `pending=1` nombra exactamente la magnitud mutada.
- **UNA sola traducción no-`validated` entre las 96 pone el gate rojo. No se promedia ni se tolera
  un umbral:** el veredicto es igualdad de enteros (`totalTranslationValidated === TOTAL_TRANSLATION_EXPECTED`).

### El otro lado del umbral — verde restaurado, 2026-08-13T19:51:28Z

```
$ cp <copia-de-la-foto-verde> content/exercises/preposiciones.json
$ git status --porcelain content/exercises/preposiciones.json
(vacío)
$ md5sum content/exercises/preposiciones.json
54d278382195464a8adfed62f9a32c19
$ node scripts/run-validation-271.mjs ; echo $?
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
Milestone gate PASS.
0
```

**Los DOS lados del umbral quedan ejecutados: 95/96 → ROJO, 96/96 → VERDE.**

---

## MUTACIÓN 2 — texto sin tildes → el quórum lo caza → `disputed` → gate ROJO

**Dirección compuesta mutada: `preposiciones-sullo#0`** (elegida por llevar **3 tildes**, para que
la mutación fuera inequívoca).

| | |
|---|---|
| `prompt` italiano | `Lo zucchero è ___ scaffale.` |
| Respuesta correcta | `sullo` |
| Texto ORIGINAL | `El azúcar está en la estantería.` |
| Texto MUTADO | `El azucar esta en la estanteria.` |
| Tildes quitadas | `ú`, `á`, `í` (3 → 0). La `ñ` no se tocó (no había). |

Además se vació `validation.passes` a `[]`: los pases anteriores validaron el texto **anterior**,
y dejarlos habría sido un registro que miente sobre qué se validó.

**La autoridad sobre acentos es el QUÓRUM (criterio S4), no un escáner mecánico de tildes.**
No se creó ningún escáner: el diff de esta mutación no toca `scripts/` ni `tests/` ni `docs/`
(verificado con `git status --porcelain scripts/ tests/ docs/` → vacío). Inventarlo habría sido
re-litigar D-46-12/TRAD-01-encoding, que lo descartó por falsos positivos sobre nombres propios
y monosílabos.

### Los dos veredictos REALES del quórum cross-vendor

**Pase 1 — `deepseek-chat`, 2026-08-13T19:52:24Z**

```
$ node scripts/validate-translation-pass.mjs 'preposiciones-sullo#0' --write
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tres tildes en el español: 'azucar' debe ser 'azúcar', 'esta' debe ser 'está' y 'estanteria' debe ser 'estantería'"
  ]
}
✔ actualizado pase deepseek-chat → preposiciones-sullo#0.translationES (status: disputed)
```

**Pase 2 — `gemini-3.5-flash-lite`, 2026-08-13T19:52:34Z**
(modelo pinneado `gemini-2.5-flash`; el auto-fallback por cuota aterrizó en `gemini-3.5-flash-lite`,
que es el `by` REAL escrito — el mismo comportamiento que documentó el plan 46-04, no un campo
editado a mano)

```
$ node scripts/validate-translation-pass.mjs 'preposiciones-sullo#0' \
    --model=gemini-2.5-flash \
    --fallback=gemini-2.5-flash-lite,gemini-3.5-flash-lite,gemini-3.5-flash \
    --avoid=deepseek-chat --write
{
  "verdict": "incorrecta",
  "criteria": { "s1_natural": true, "s2_fidelidad": true, "s4_acentos": false, "s5_italiano": true, "s6_naturalidad": true },
  "concerns": [
    "[S4-acentos] faltan tres tildes obligatorias en el español: 'azucar' debe ser 'azúcar', 'esta' debe ser 'está' y 'estanteria' debe ser 'estantería'"
  ]
}
✔ actualizado pase gemini-3.5-flash-lite → preposiciones-sullo#0.translationES (status: disputed)
```

**Los DOS vendors devolvieron `incorrecta` con el tag literal `[S4-acentos]`, cada uno nombrando
las tres tildes exactas.** El razonamiento de Gemini además citó la regla RAE de cada una (llana
terminada en consonante distinta de n/s; aguda terminada en vocal; hiato de vocal cerrada tónica).

**S4 MUERDE — el camino del punto 5 del plan (los dos vendors aprobando el texto sin tildes) NO se
activó.** Y esto responde el hueco que el propio plan 46-04 dejó abierto por escrito: allí hubo
**cero** flags `[S4-acentos]` en 192 respuestas, así que S4 estaba sin probar «por ausencia de
sujeto». Ahora tiene sujeto y muerde con los dos vendors. No hizo falta reforzar
`docs/TRANSLATION-VALIDATION-PROMPT.md`, y por tanto **no hay nada que re-validar bajo un prompt
nuevo**: el prompt no cambió.

### El rojo OBSERVADO — 2026-08-13T19:52:44Z

`deriveStatus(passes)` con dos `incorrecta` y cero override → `disputed` (sticky, D-VAL-07).
El `status` escrito en disco quedó también en `disputed`, así que no hubo desincronía.

```
$ node scripts/run-validation-271.mjs ; echo $?
Cobertura de traducción — unidad: VARIANTE multiple-choice (1 categorías declaradas cubiertas, 96 variantes)

preposiciones            | 96       | 95         | 1         | 0        | 0
        → Traducciones disputed: preposiciones-sullo#0

Sub-gates:
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=0, missing=0, disputed=1)
        → Disputed: preposiciones-sullo#0

Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.
1
```

- **Exit code observado: `1`.**
- **Línea literal:** `TRAD-COV (96/96 traducciones validated): FAIL (95/96 — pending=0, missing=0, disputed=1)`
- **Dirección compuesta nombrada, dos veces:** `→ Traducciones disputed: preposiciones-sullo#0`
  (en la tabla) y `→ Disputed: preposiciones-sullo#0` (bajo el sub-gate).
- La cadena completa quedó ejecutada de punta a punta:
  **texto sin tildes → quórum `incorrecta` con `[S4-acentos]` → `deriveStatus` = `disputed` → reporter exit 1.**

### Verde restaurado — 2026-08-13T19:53:04Z

```
$ cp <copia-de-la-foto-verde> content/exercises/preposiciones.json
$ git status --porcelain content/exercises/preposiciones.json
(vacío)
$ md5sum content/exercises/preposiciones.json
54d278382195464a8adfed62f9a32c19
$ node -e '<lee el corpus>'
"El azúcar está en la estantería." | status: validated | passes: deepseek-chat:correcta, gemini-3.5-flash-lite:correcta
$ node scripts/run-validation-271.mjs ; echo $?
  VAL-08 (cero disputed): PASS
  TRAD-COV (96/96 traducciones validated): PASS (96/96)
Milestone gate PASS.
0
```

---

## Hallazgo 1 — el criterio de aceptación del plan nombra el sub-gate equivocado (no es un agujero)

El plan pedía, para la mutación 2, «la línea de **VAL-08** en FAIL nombrando la dirección compuesta
mutada». **VAL-08 se quedó en PASS.** No es que el gate no muerda: es que la Task 2 esperaba el rojo
en el sub-gate que no le corresponde.

Leído en el código (`scripts/run-validation-271.mjs`):

- `val08Pass = totalDisputed === 0`, y `totalDisputed` se reduce sobre **`perCategory`** — el bucle
  de **SLOTS** (`validation` del ejercicio). VAL-08 es, por diseño, un gate de nivel slot.
- Los `disputed` de nivel **traducción** viven en `perTranslationCategory` → `totalTranslationDisputed`,
  y los consume **TRAD-COV**, que es quien los imprime y quien nombra la dirección compuesta.

**No queda ninguna vía de escape,** y eso es lo que importa: una traducción `disputed` no es
`validated`, así que baja `totalTranslationValidated` por debajo de `TOTAL_TRANSLATION_EXPECTED` y
TRAD-COV sale FAIL necesariamente. La cobertura está completa; lo que sobra es la expectativa escrita
en el criterio de aceptación.

**No se tocó el gate.** Ensanchar VAL-08 para incluir los `disputed` de traducción cambiaría la
semántica de un sub-gate a final de fase, sin mandato del plan, y con una redundancia que no compra
nada. El propio plan avisa de esto: «si un fix propuesto por el code review toca un gate, ese fix se
verifica con la MISMA mutación que el código que arregla» (2 de 4 fixes de revisor de la Phase 44
eran incorrectos y uno era peor que el bug). Se deja **anotado para el autor**, no arreglado en
silencio.

## Hallazgo 2 — la traducción más larga del piloto NO llega a 2 líneas: las dos `backstop` de long-text se ABSTIENEN

Derivado del disco (comando literal del plan):

```
$ node -e "...best por t.length..."
preposiciones-sugli#1 57 "Las fotos están sobre los estantes, encima de los libros."
```

Instrumentando el **CSS real** (`styles.css` + `app.css`, fuentes reales de `vendor/fonts/`) con la
ancestría DOM real de las dos superficies, medido en Chrome headless — **no estimado a ojo**:

| Nodo | chars | ancho de caja | ancho del texto | líneas | ¿desborda? | ¿truncado? |
|---|---|---|---|---|---|---|
| `.session-translation` (piloto, `sugli#1`) | 57 | 1064 px | **390 px** | **1** | no | no |
| `.summary-error-translation` (piloto, `sugli#1`) | 57 | 1064 px | **390 px** | **1** | no | no |
| `.session-translation` (**sintético** 165 chars) | 165 | 1064 px | 1036 px | **2** | no | no |
| `.summary-error-translation` (**sintético** 165 chars) | 165 | 1064 px | 1036 px | **2** | no | no |

Medido a viewport 1400 / 1100 / 900 / 800 / 700 px: **`lineCount: 1` en todos**. La caja de feedback
mide 624 px de contenido incluso a 700 px de viewport (el ancho más estrecho antes de que entre la
capa móvil `@media (max-width: 640px)`, que esta fase declara fuera de scope). Un texto de 390 px no
envuelve dentro de 624 px en ningún ancho de escritorio.

**Conclusión honesta: el enunciado de las dos `backstop` («la traducción de 2+ líneas…») NO TIENE
SUJETO en el corpus del piloto.** Es el mismo patrón que el plan 46-04 ya registró para PRES-05:
*ausencia de sujeto, no indulgencia.*

Lo que **sí** quedó verificado por medición del `getComputedStyle` real, y que es la mitad mecánica
de los dos enunciados:

- `font-family: Spectral` · `font-size: 16px` · `font-weight: 400` · `line-height: 24px` (= 1.5 × 16)
- `color: rgb(43, 39, 34)` = `#2b2722` = `var(--ed-ink)` · `margin-top: 8px`
- **`max-width: none`** · **`overflow-wrap: normal`** · `overflow: visible` · `text-overflow: clip`
- Con un texto que **sí** envuelve (el sintético de 165 chars): fluye por espacios, 2 líneas,
  **cero desborde horizontal** y **cero truncado**, en **las dos** superficies.

Lo que **no** puede cerrarse sin el autor: que la envoltura multilínea **observada en pantalla** sea
correcta sobre contenido REAL del piloto, más el CTA «Continuar →» sin desplazar, más la lectura de
muestra de TRAD-01/encoding. **Las dos `backstop` quedan ABSTENIDAS / pendientes de revisión humana.
No se cierran en silencio y no se dan por pasadas.** La decisión de qué hacer con ellas es del autor
(ver el checkpoint), no del ejecutor.

> La medición headless de arriba es **preparación**, no sustituto del ojo del autor. Ningún número de
> esta tabla cierra una `backstop`.

---

## Batería de verificación final — 2026-08-13

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `node scripts/run-validation-271.mjs` | **exit 0** — `TRAD-COV: PASS (96/96)`, `Milestone gate PASS.` |
| 2 | `node --test tests/*.test.js tests/fixtures/*.test.js` | exit 1 — **1299 tests / 1295 pass / 4 fail** |
| 3 | La misma suite **sin** `tests/requirements-traceability.test.js` | **1295 / 1295 pass / 0 fail** |
| 4 | `git diff --stat src/domain/ src/screens/app.js` (V8) | vacío — **motor byte-intacto** |
| 5 | `git status --porcelain scripts/ tests/ docs/` (T-46-25) | vacío — **ningún escáner de acentos inventado** |
| 6 | `md5sum content/exercises/preposiciones.json` | `54d278382195464a8adfed62f9a32c19` — idéntico a la foto verde |
| 7 | `git status --porcelain content/exercises/preposiciones.json` (T-46-23) | vacío — **ninguna mutación residual** |

**Sobre los 4 rojos de la fila 2 — criterio de aceptación NO cumplido, y no se silencia.** Las Tasks 1
y 2 exigían `node --test … exit 0` tras la restauración. La suite sale en **exit 1**, y no por las
mutaciones: los 4 fallos son los 4 casos de `tests/requirements-traceability.test.js`, que es deuda
**pre-existente y documentada** (D-45-12, el propio nombre del test dice `(DEUDA, D-45-12)`) y que
está roja en el baseline pre-fase `19f41a9` con las **mismas cifras exactas** (1299/1295/4). Prueba de
independencia respecto del corpus: ese fichero solo lee `.planning/REQUIREMENTS.md` (`REQUIREMENTS_URL`),
cero acoplamiento con `content/exercises/`; y la suite entera **sin** él da 1295/1295. Queda **fuera
del scope** de este plan (regla de scope: no auto-arreglar fallos pre-existentes ajenos a la tarea) y
por tanto **abierto**, no cerrado.

---

## Estado del plan 05

| Task | Estado |
|---|---|
| Task 1 — Mutación 1 (`pending` → gate rojo) | **HECHA** · rojo observado exit 1 · restaurada y re-verificada |
| Task 2 — Mutación 2 (sin tildes → quórum → `disputed` → gate rojo) | **HECHA** · rojo observado exit 1 · restaurada y re-verificada |
| Task 3 — `checkpoint:human-verify` `gate="blocking"` | **BLOQUEADA ESPERANDO AL AUTOR** |
| `backstop` E1 · long-text | **ABSTENIDA** — pendiente de revisión humana (sin sujeto en el piloto) |
| `backstop` E2 · long-text | **ABSTENIDA** — pendiente de revisión humana (sin sujeto en el piloto) |
| `backstop` TRAD-01/encoding (lectura de muestra) | **ABSTENIDA** — pendiente de revisión humana |

Las **tres** mutaciones de D-46-18 están ahora ejecutadas: la 3 en el plan 46-03 Task 3, y la 1 y la 2
aquí. Ninguna se leyó; las tres se corrieron y las tres dieron rojo con exit code apuntado.

**Sin commits de producción en este plan, y es lo correcto:** las dos mutaciones son
destructivas-y-restauradas por diseño, y el corpus vuelve byte a byte a la foto verde. Commitear
cualquier cosa del contenido aquí sería materializar T-46-23 (una mutación que queda committeada),
que es el único riesgo real del plan.

---

## Decisión del autor sobre los dos backstops `long-text` (2026-08-13)

**Pregunta planteada:** la traducción más larga del piloto (`preposiciones-sugli#1`, 57 caracteres,
390 px medidos contra el CSS real en Chrome headless) se pinta en **UNA sola línea** en las dos
superficies y a todos los anchos de escritorio (1400 / 1100 / 900 / 800 / 700 px; la caja conserva
624 px de contenido en el más estrecho). La premisa de los dos `statement` del UI-SPEC —«traducción de
2+ líneas»— **no tiene sujeto en este corpus**.

**Decisión: ABSTENER por ausencia de sujeto.** Los dos ítems `backstop` (E1 · long-text y E2 ·
long-text del §UI Considerations de `46-UI-SPEC.md`) quedan **abstenidos**, NO cerrados y NO
aprobados. Se arrastran para re-probarse cuando llegue una categoría con frases más largas
(Phases 47-53).

**Por qué esta es la lectura honesta:** un `backstop` que el verificador no puede confirmar con
evidencia explícita se abstiene → `human_needed`, nunca pasa en silencio (`references/honest-verifier.md`,
#1154). La prueba sintética existe y es limpia —una cadena de 165 caracteres envuelve por espacios en
las dos superficies, con `overflow-wrap: normal`, `max-width: none`, cero desbordamiento y cero
truncado— pero **una cadena sintética no es el contenido del piloto**, así que se registra como
preparación y no como cierre. Mismo patrón que PRES-05 en el plan 46-04: ausencia de sujeto, no
indulgencia.

**Lo que sigue abierto de la Task 3:** la confirmación visual del autor sobre las dos superficies
(REND-01/02/04/05 en el navegador) y la lectura de muestra de 3-4 slots. No se ha recibido «aprobado»
para esa parte, así que la Task 3 NO está cerrada y el plan 46-05 NO tiene SUMMARY todavía —
escribirlo haría que el índice de planes leyera el plan como completo y saltara este gate bloqueante.
