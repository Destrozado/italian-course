# Phase 46 · Plan 05 — Evidencia de las mutaciones (D-46-18)

> **Contenido:** las mutaciones **1 y 2** del plan (contenido → quórum → reporter), y las mutaciones
> **M-A y M-B** del cambio de diseño que el autor pidió el 2026-08-13 durante el propio checkpoint
> (traducción fuera de la caja de feedback). Las cuatro se EJECUTARON y en las cuatro se OBSERVÓ el
> rojo con su exit code apuntado; ninguna se leyó.

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

# Mutaciones M-A y M-B — el gate del sitio NUEVO de la traducción (2026-08-13)

> **Por qué existen.** Durante este mismo checkpoint el autor pidió mover la traducción **fuera** de la
> caja `.session-feedback`, a justo encima del CTA de avance (enmienda de D-46-06/07/08). Ese cambio
> **reescribe una aserción**, la V6, que hasta entonces congelaba el orden DENTRO de la caja. Y la regla
> de la casa es que **un arreglo que toca un gate se verifica con la MISMA mutación que el código que
> arregla**: si la aserción nueva no muerde, el «invariante» es prosa. Se ejecutan las dos direcciones
> —la que prueba el gate nuevo (M-A) y la que prueba que el gate viejo más importante sigue mordiendo
> después de mover el nodo (M-B)—.

- **Fecha de la corrida:** 2026-08-13
- **HEAD durante la corrida:** `4291c8a` (el cambio de diseño aún sin committear)
- **Fichero mutado y restaurado:** `index.html`
- **md5 antes y después:** `c8fc861125a8224be4b029525b1efc7c` (idéntico — restauración byte a byte)
- **Método de restauración:** copia de fichero desde la foto verde (`cp`), **no** `git checkout` /
  `git stash` / `git clean` — el mismo idioma que las mutaciones 1 y 2.

## Foto verde de partida — 2026-08-13T21:25:31Z

```
$ md5sum index.html
c8fc861125a8224be4b029525b1efc7c  index.html
$ node --test tests/screen-translation.test.js ; echo $?
# tests 50
# pass 50
# fail 0
0
```

## MUTACIÓN M-A — devolver el nodo a DENTRO de `.session-feedback` deja V6 en ROJO

Mutación aplicada con un script que **aborta si no localiza el nodo** (una mutación que no muta y sale
verde sería el peor resultado posible): saca el `<p class="session-translation">` de entre la caja y el
CTA y lo reinserta dentro de la caja, delante del comentario de la `explanation` — exactamente el sitio
que la decisión ORIGINAL prescribía. `git diff --stat`: `1 file changed, 22 insertions(+), 9 deletions(-)`.

### El rojo OBSERVADO — 2026-08-13T21:25:38Z

```
$ node --test tests/screen-translation.test.js ; echo $?
    not ok 2 - EL INVARIANTE NUEVO: el nodo NO está dentro del bloque .session-feedback
    not ok 3 - va DESPUÉS del cierre de la caja y ANTES del CTA "Continuar →"
    not ok 4 - está JUSTO encima del CTA: entre los dos no se cuela ningún otro elemento
not ok 5 - V6 — la traducción vive FUERA de la caja y encima del CTA (D-46-06 enmendada / D-46-08)
# tests 50
# pass 47
# fail 3
1
```

- **Exit code observado: `1`.**
- **Mensaje literal del subtest 2:** `la traducción está DENTRO de la caja de feedback (índice 3845 en el
  rango [2790, 5014)): el autor la quiere FUERA, en sitio fijo, acertando y fallando`.
- Los tres índices del mensaje los **deriva el propio extractor** del `index.html` de disco (el rango de
  la caja se acota contando anidamiento de `<div>`); ninguno está transcrito en el test.
- Muerden **tres** subtests, que son las tres mitades del invariante nuevo: fuera de la caja, antes del
  CTA, y sin markup intermedio.
- La cláusula de no-vacuidad siguió en VERDE durante la mutación, que es lo correcto: la región se
  localizó bien, el control positivo encontró la `explanation` y el título italiano dentro de la caja, y
  el rojo vino del hecho medido, no de un extractor que dejó de casar.

### Verde restaurado — 2026-08-13T21:25:50Z

```
$ cp <copia-de-la-foto-verde> index.html
$ md5sum index.html
c8fc861125a8224be4b029525b1efc7c
$ node --test tests/screen-translation.test.js ; echo $?
# pass 50 / # fail 0
0
```

**Los dos lados del umbral quedan ejecutados: dentro de la caja → ROJO, fuera → VERDE.**

## MUTACIÓN M-B — sin el guard `sessionFeedback !== null`, V5 sigue en ROJO tras el cambio de sitio

Esta mutación no prueba el gate nuevo: prueba que **el invariante R1 de la fase sigue vivo después de
mover el nodo**. El no-leak (D-46-11) es la razón por la que «verla siempre» significa siempre en el
mismo sitio y **no** antes de responder; si al cambiar de sitio el guard hubiera quedado sin gate, el
cambio de diseño habría abierto la puerta a filtrar la respuesta correcta pre-respuesta.

Mutación: quitar `sessionFeedback !== null && ` del `x-show` de la superficie 1, dejando solo el guard de
presencia del dato. El script aborta si no localiza el doble guard literal.

### El rojo OBSERVADO — 2026-08-13T21:25:59Z

```
$ node --test tests/screen-translation.test.js ; echo $?
    not ok 3 - todos los nodos llevan guard de estado resuelto (explícito o estructural)
    not ok 4 - el guard de la superficie 1 exige TAMBIÉN la presencia del dato (doble guard, D-46-09)
not ok 7 - V5 — no-leak: ningún template pinta translationES sin guard (R1 / D-46-11)
# tests 50
# pass 48
# fail 2
1
```

- **Exit code observado: `1`.**
- **Mensaje literal:** `un nodo pinta translationES sin guard de estado resuelto: <p
  x-show="sessionCurrentExercise.payload.translationES?.text" class="session-translation" …>` — el gate
  **imprime el nodo infractor**, no solo un booleano.
- Muerden dos subtests: el de «todos los nodos llevan guard» y el que exige el doble guard EXACTO del
  UI-SPEC. **V5 sigue mordiendo con el nodo en su sitio nuevo.**

### Verde restaurado — 2026-08-13T21:26:05Z

```
$ cp <copia-de-la-foto-verde> index.html
$ md5sum index.html
c8fc861125a8224be4b029525b1efc7c
$ node --test tests/screen-translation.test.js ; echo $?
# pass 50 / # fail 0
0
```

## Lo que NO se verificó por mutación, y se dice

El **margen** de 16 px arriba y abajo se verificó por **medición** (Chrome headless sobre el CSS real, con
la ancestría DOM real: tabla en `46-UI-SPEC.md` §Spacing Scale) y por **gate derivado** (V1 compara el
margen de las dos superficies entre sí y exige `bottom > 0`, y ancla la premisa asserteando que
`.session-cta` sigue sin declarar `margin-top`). No se mutó el valor del margen: un `margin` distinto es
una decisión de espaciado, no un invariante de corrección, y el juez de que 16 px se ve bien es el ojo del
autor en el checkpoint, no un número en un test.

## Los dos gates que cazaron la PROSA del comentario (no estaban planeados, y valen la pena)

La primera redacción del comentario del nodo movido mencionaba los literales de copy y el nombre de la
directiva de inyección de HTML crudo. **Dos gates existentes se pusieron rojos solos**, sin mutación:

```
V4: index.html pasó de 9 a 10 usos de inyección de HTML crudo: T-02-01 prohíbe añadir ninguno
V9: el recuento del literal "Continuar →" cambió: esta fase no añade ni cambia copy de interfaz (3 !== 2)
```

Los dos comparan el recuento del disco contra el estado **pre-fase**, comentarios incluidos. El comentario
se reescribió sin esos tokens. Es exactamente la deuda #14 del ledger de la Phase 44 —un comentario que
menciona el token que su propio gate cuenta—, cazada esta vez por el gate y no por un humano, y queda
anotada en `46-UI-SPEC.md` §DOM Contract para quien redacte el siguiente comentario.

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

## Batería de verificación del cambio de diseño — 2026-08-13T21:35:46Z (SEGUNDA foto, fechada aparte)

La tabla de arriba es la foto de las mutaciones 1 y 2 y **se deja intacta con sus cifras de entonces**
(1299 / 1295 / 4). Esta es una foto distinta, de después del cambio de diseño: las dos se fechan por
separado en vez de sobreescribir la primera, que es la lección de CR-01 de la Phase 44 —una suite firmando
una cifra vieja pasa en verde—.

| # | Comprobación | Resultado |
|---|---|---|
| 1 | `node --test tests/*.test.js tests/fixtures/*.test.js` | exit 1 — **1308 tests / 1304 pass / 4 fail**. Los 4 son los mismos de siempre (`tests/requirements-traceability.test.js`, deuda D-45-12 roja desde la baseline `19f41a9`); **cero fallos nuevos**. El total sube de 1299 a 1308 porque V1/V2/V6 aportan 9 subtests más. |
| 2 | `node --test tests/screen-translation.test.js` | **exit 0** — 50 / 50 |
| 3 | `node scripts/run-validation-271.mjs` | **exit 0** — `TRAD-COV: PASS (96/96)`, `Milestone gate PASS.` El cambio no toca contenido; un rojo aquí habría significado haber roto algo. |
| 4 | `git diff --stat src/domain/ src/screens/app.js` (V8) | vacío — **motor byte-intacto** |
| 5 | `md5sum index.html` frente a la foto verde de las mutaciones | `c8fc861125a8224be4b029525b1efc7c` — idéntico **inmediatamente tras M-A y M-B**, que es lo que prueba la restauración byte a byte. El fichero de disco de esta segunda batería es `3e50f31052a84c07f506a9f77ab3921e`, distinto **por un cambio posterior y committeado**: la reescritura del comentario de la superficie 2 (commit `bcb2ccd`, decía «misma anatomía» y dejó de ser verdad con la enmienda de D-46-08). No hay mutación residual: `git status --porcelain index.html` sale vacío. |

---

## Estado del plan 05

| Task | Estado |
|---|---|
| Task 1 — Mutación 1 (`pending` → gate rojo) | **HECHA** · rojo observado exit 1 · restaurada y re-verificada |
| Task 2 — Mutación 2 (sin tildes → quórum → `disputed` → gate rojo) | **HECHA** · rojo observado exit 1 · restaurada y re-verificada |
| Task 3 — `checkpoint:human-verify` `gate="blocking"` | **BLOQUEADA ESPERANDO AL AUTOR** — sigue abierta: REND-02/03/04 no están confirmados en el navegador |
| Cambio de diseño del checkpoint (traducción fuera de la caja) | **HECHO** · M-A y M-B con rojo observado exit 1 · commits `ad9097c` (código + gate) y `bcb2ccd` (enmiendas y contrato) |
| `backstop` E1 · long-text | **ABSTENIDA** — pendiente de revisión humana (sin sujeto en el piloto). El cambio de sitio no la revierte: mueve el nodo, no alarga el contenido |
| `backstop` E2 · long-text | **ABSTENIDA** — pendiente de revisión humana (sin sujeto en el piloto) |
| `backstop` TRAD-01/encoding (lectura de muestra) | **ABSTENIDA** — pendiente de revisión humana |

Las **tres** mutaciones de D-46-18 están ahora ejecutadas: la 3 en el plan 46-03 Task 3, y la 1 y la 2
aquí. Ninguna se leyó; las tres se corrieron y las tres dieron rojo con exit code apuntado. **Más las dos
del cambio de diseño (M-A y M-B), que no estaban en el plan porque el cambio tampoco lo estaba**, y que se
corrieron por la misma regla: un arreglo que toca un gate se verifica con la misma mutación que el código
que arregla.

**Sobre los commits de este plan.** Las mutaciones 1 y 2 son destructivas-y-restauradas por diseño y el
corpus vuelve byte a byte a la foto verde: commitear contenido aquí habría materializado T-46-23 (una
mutación que queda committeada). El cambio de diseño **sí** tiene commits, y es lo correcto: no es una
mutación, es lo que el autor pidió viendo la app, y es HTML + CSS + tests + documentación — cero
contenido, motor byte-intacto. **Este fichero sigue NO siendo el SUMMARY del plan 05, y el plan 05 sigue
sin SUMMARY**, porque el checkpoint no está cerrado.

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

---

## Decisión del autor sobre las glosas duplicadas (2026-08-13)

**Lo observado, derivado del disco** (`content/exercises/preposiciones.json`, no transcrito de ningún
sitio): de las **96** variantes con traducción, **16** llevan en el `prompt` una glosa española de FRASE
COMPLETA con la forma `(en español: '…')`, y en **las 16** la glosa coincide con la traducción palabra por
palabra salvo el punto final. Consecuencia en pantalla: al resolver, el mismo español aparece dos veces —
una en el prompt (pre-respuesta, para desambiguar) y otra como traducción (post-respuesta). Detalle de
formato que conviene saber al re-derivarlo: **14 de las 16 glosas van entre comillas y 2 van sin ellas**
(`preposiciones-col#0` y `#1`), así que un regex que exija comillas cuenta 14 y se deja 2 fuera.

**Decisión del autor: SE DEJAN, y se anotan.** No se reescriben aquí.

**Por qué es defendible y no deuda silenciada:** el quórum ya las aprobó razonando la excepción **E1** de
`docs/TRANSLATION-VALIDATION-PROMPT.md` — si la glosa **es** la frase completa, que la traducción coincida
con ella significa que la traducción es correcta, no que sea redundante. La glosa y la traducción tienen
funciones distintas (canon R7: la glosa es PRE-respuesta y desambigua; la traducción es POST-respuesta y
enseña vocabulario) y aquí, por construcción del prompt, sus textos convergen. Cambiar una de las dos por
estética tocaría contenido ya `validated` y obligaría a re-validarlo.

**Queda anotado como OBSERVACIÓN para las Phases 47-53** en `.planning/WINDOWS.md`: es dato para el autor
—si al usar la app le molesta ver el español dos veces, la palanca es acortar la glosa del prompt, no la
traducción—, no una tarea de esta fase.
