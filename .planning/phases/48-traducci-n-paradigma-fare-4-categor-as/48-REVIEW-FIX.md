---
phase: 48-traducci-n-paradigma-fare-4-categor-as
source: 48-REVIEW.md
applied: 2026-08-16
scope: critical + warning (9 de 12; los 3 Info fuera de alcance)
fixed: 7
refuted: 1
escalated: 1
out_of_scope: 3
commits: 9
status: applied
---

# Phase 48 — Aplicación de los hallazgos del code review

Alcance: Critical + Warning. Los 3 Info (IN-01, IN-02, IN-03) quedan fuera y siguen
abiertos en `48-REVIEW.md`.

**Los hallazgos originales NO se han borrado ni reescrito.** `48-REVIEW.md` se conserva
entero como historia, igual que se hizo con la id 42 del ledger; lo único que cambia allí
es el frontmatter, que ahora apunta a este documento y declara la disposición real.

Cada arreglo lleva **verificación por mutación** —romperlo a propósito, observar el rojo,
restaurar por copia y confirmar `md5sum` idéntico— y no la suite en verde. Este proyecto
tiene registrado un incidente (CR-01 de la Phase 44) de un test certificando en verde una
cifra obsoleta, y otro donde 2 de 4 snippets propuestos por un revisor eran incorrectos y
uno era peor que el bug.

---

## Resultado por hallazgo

| ID | Disposición | Commit | Evidencia de mutación |
|---|---|---|---|
| **CR-01** | fixed | `80f17f0` + `9ef1b9f` | Exploit del review end-to-end (lock `preposiciones` 96 a 95 **más** borrar `preposiciones-col#0`, traducida y validated). **ANTES:** `count-arrays-lockstep` 66 pass / 0 fail y reporter `PASS (327/327)` exit 0 — silencio total. **AHORA:** GATE-03 rojo nombrando el sujeto, y el **reporter** en `FAIL (EL SUELO DEL ANCLA BAJÓ)` exit 1. Neutralizar el ratchet devuelve el verde falso; restaurado con md5 idéntico |
| **CR-02** | fixed | `c0dfeed` | Cinco valores sobre `fare-indicativo` en el lock: `null`, `"cincuenta y cuatro"`, `true` (los tres de la tabla del review, medidos allí en 66/0 verde y exit 0) más `54.5` y `-3`. Los cinco dan ahora GATE-03 70 pass / 1 fail y reporter exit 1, nombrando clave y valor. Neutralizar la cláusula del reporter con `suelo=null` devuelve exit 0 |
| **WR-01** | fixed | `d7d7312` | `run()` con modelo simulado que emite `[S1-natural] "hacia" -- flecha -- "hacía"; ver b entre corchetes angulares`. **ANTES:** marcas prohibidas en el pase devuelto = true, en los caminos de éxito y de exit 4. **AHORA:** false en los dos. Neutralizar el saneo en `run` da 2 rojos; neutralizarlo en `applyPassToText` da 2 rojos **distintos** (conjuntos disjuntos) |
| **WR-02** | fixed | `3ba3405` | `applyPassToText` sobre documento sintético con `incorrecta` previo del mismo `by`. **ANTES:** artefacto `WINDOWS` id 45 escrito en disco = true. **AHORA:** lanza. Borrar el guard deja 71 pass / 2 fail; los tres tests de `--adjudicar` que ya existían siguen verdes con y sin el arreglo, que es justo por lo que no lo verificaban |
| **WR-03** | fixed | `42cd064` | Dos mutaciones separadas: borrar `if (pass.noEscrito) return 4;` da 75 pass / 1 fail; romper el `4` del doc-block da 75 pass / 1 fail. CLI real re-ejecutado: dirección inválida exit 2, sin dirección exit 2 |
| **WR-04** | fixed, **con la dirección del fix INVERTIDA** | `d76c4a0` | Re-quórum completo desde cero, `passes[]` reseteado. Rojo intermedio observado (`FAIL 327/328 pending=1`, exit 1) antes del verde. 2 llamadas, 2/2 `correcta`, 0 disputed, 0 overrides nuevos |
| **WR-05** | **REFUTADO — no es defecto** | `d05f1ab` (registro) | Barrido mecánico sobre las 328 del disco. Ver la sección propia más abajo |
| **WR-06** | fixed | `25e916e` | Prueba de dos condiciones del carve-out de 47-01. Sujeto medido = 2 (una tercera candidata era falso positivo del detector). Cumplimiento literal: 4 llamadas, 4/4 `correcta`, rojo intermedio `FAIL 326/328 pending=2` observado |
| **WR-07** | **escalado, NO arreglado** | — | Decisión expresa del autor. Sigue `open` en el ledger como id 53 |
| **IN-01** | fuera de alcance | — | Sigue abierto. NO converge del todo con WR-02: el guard nuevo rechaza `incorrecta` con motivo, pero un `--adjudicar` sobre una traducción virgen que devuelva `correcta` sigue grabando un motivo que no adjudica nada |
| **IN-02** | fuera de alcance, **medido** | — | Sus cifras se reprodujeron exactas al refutar WR-05. Ver abajo |
| **IN-03** | fuera de alcance | — | Sigue abierto |

---

## Dos de doce: donde el review se equivocó

Es la misma proporción que la Phase 44 registró (2 de 4 snippets incorrectos, uno peor que
el bug) y merece quedar contada, no diluida.

### WR-04 — la dirección propuesta era PEOR que el bug

El review proponía como candidato **corregir el GLOSS** a `esta mañana he hecho los deberes
antes de salir`. Esa hipótesis no se aplicó, y no por prudencia: por dos evidencias escritas
e independientes que la contradicen.

1. `docs/TRANSLATION-VALIDATION-PROMPT.md:422` dice literalmente que el gloss **es canon R7
   del proyecto y no se toca**, y las líneas 462-464 que **el gloss manda**: si el gloss dice
   X, la fiel es la que dice X.
2. Y sobre todo, el pase de quórum de **EJERCICIO** de ese mismo slot (`claude-opus-5`,
   Phase 44), que vive dentro del propio JSON, dejó escrita esta advertencia:

   > el hueco examina el AUXILIAR, y los tres glosses usan el pretérito simple castellano
   > (hice, hicimos, hicieron) en lugar del compuesto, así que no exhiben ningún auxiliar
   > español espejo de ho / abbiamo / hanno. **Si alguien reescribe un gloss con `he hecho`
   > o `hemos hecho`, el slot pasa a leak R1 inmediato.**

El hueco de `fare-indicativo-300` **es** el auxiliar (`ho`). Aplicar el fix propuesto habría
convertido una incoherencia cosmética en un **leak R1**: el ejercicio entregando su propia
respuesta.

**Lo que se hizo en su lugar:** alinear la TRADUCCIÓN al gloss —
`Esta mañana hice los deberes antes de salir.` — con cero caracteres del prompt tocados, de
modo que el quórum de ejercicio del slot sigue juzgando el texto que juzgó. Queda además
internamente coherente con las otras dos variantes del mismo slot, que ya coincidían con su
gloss verbatim.

### WR-05 — falso hallazgo

Ver la sección siguiente. **El review re-propuso un concern que el autor ya había rechazado
por decisión expresa.**

---

## WR-05 en detalle: refutado con el disco, y con el registro

Registrado como **`WINDOWS` id 60**, que nace `fixed` porque no es deuda.

### El dato decisivo, encontrado auditando el ledger

`WINDOWS` **id 41** (tercera enmienda del doc, plan 48-02) transcribe literalmente el pase
que se retiró de **esta misma variante**:

> `gemini-3.5-flash-lite` incorrecta — [S2-fidelidad] omite el sujeto pronominal explícito
> `lui` de la segunda proposición del original; **sugerencia: Hago una foto sin problemas,
> pero él comete un error cada vez.**

Esa sugerencia es, palabra por palabra, el frente (a) que WR-05 propone. Y su historia está
escrita: el autor la **rechazó** en un checkpoint bloqueante del plan 48-02, eligiendo la
tercera vía (opción C, enmendar el doc) y descartando expresamente las otras dos, una de las
cuales era «reescribir el español metiendo el pronombre». D-48-03 quedó **sin carve-out** y
el español **no se tocó**. La variante se re-validó desde cero bajo el doc enmendado y pasó
de `disputed` a `validated` sin tocar un carácter y sin override.

O sea: WR-05 no es sólo un criterio no escrito — **reabre una decisión de autor ya tomada,
documentada y ejecutada.**

### Y las tres razones independientes

1. **El criterio del revisor no existe en los criterios vigentes.** Los dos puntos que la
   aclaración de S2 declara NO absueltos son la PERSONA y el CONTRASTE, y los dos se cumplen:
   `Hago` es 1a singular y `comete` es 3a, así que la persona ni cambia ni queda
   indeterminada, y el contraste sigue oponiéndose por la morfología — que la propia
   aclaración nombra como una de las formas correctas de resolverlo. «Referente nuevo sin
   antecedente» no aparece en ninguna parte.
2. **D-48-19 escribe el pronombre sólo donde la forma española es SINCRÉTICA**, y `comete` no
   lo es (la 1a es `cometo`). La variante cae fuera del predicado de la regla por construcción.
3. **El barrido mecánico sobre las 328 del disco**, que es lo que decide:

   | | total | escriben el pronombre | lo omiten |
   |---|---|---|---|
   | italiano `lui`/`lei`/`loro`, corpus entero | 40 | 9 | 31 |

   Las 9 que lo escriben son **exactamente** las de forma sincrética (`él haría`,
   `él hiciera`, `él había hecho`, `él hacía`, `ella estaba`) más los 2 complementos
   **agentes** de `preposiciones-da-agente`, que no son sujetos. La convención está derivada
   del disco, no elegida a ojo. Y de las 31 que omiten, unas **29** comparten la propiedad
   exacta que el review atribuye en exclusiva a `301#1` — un tercer participante sin
   antecedente: `Ahora hace una foto`, `Parece que hace una foto todos los días`,
   `Haciendo todo deprisa, ha roto un plato` (con `lei` en el italiano)... La observación es
   cierta **dentro** del slot `-301` y falsa a nivel de corpus. **Arreglar 1 de 29 sería
   arbitrario.**

El frente (b) —nombrar el caso como CLASE en el doc— es un **endurecimiento**: falla la
condición 2 del carve-out de 47-01, y con la condición 1 fallando también obligaría a
cumplimiento literal sobre las 29. Es gobernanza con coste medido, no una corrección.

### Corrección a favor del review: IN-02 contaba bien

Al medir esto se reprodujo el recuento de **IN-02**, y es **exacto en el alcance que el
propio review declara** (los 4 ficheros `fare-*.json`, sólo `lui`/`lei`): **21 = 7 + 14**.
Las cifras 40 / 9 / 31 de arriba no lo corrigen: son un **superconjunto** (corpus entero,
incluyendo `loro` y los 2 complementos agentes). Se dice porque contar mal es el reproche
más fácil de hacer y aquí no aplica.

---

## Nota de método: dos cifras propias corregidas antes de publicarse

En esta ronda el fixer se equivocó dos veces y las dos quedan dichas, porque el registro es
parte del producto:

1. **Un mensaje de commit afirmaba «3 rojos» donde se habían medido 2.** Se re-midió, se
   capturaron los nombres literales de los tests y se **enmendó el commit** en vez de dejar
   una cifra plausible en la historia.
2. **El detector del sujeto de WR-06 devolvió 3 candidatas y una era falso positivo**
   (`fare-indicativo-300#1`: su `abbiamo` es indicativo, no congiuntivo — son homógrafos).
   Se cazó mirando los resultados uno a uno. Sujeto real: 2.

Y el barrido de WR-05 se escribió con lookarounds sobre no-letra en vez del límite de palabra
de JavaScript, precisamente porque ese límite sólo existe entre `[A-Za-z0-9_]` y el resto, así
que un patrón que lo ponga delante de una vocal acentuada nunca casa. Es el bug que mordió
**cuatro veces** en esta fase, y las cuatro dio una cifra plausible y **menor** de la real.

---

## Lo que queda abierto, y por decisión de quién

| Ledger | Qué es | Por qué sigue `open` |
|---|---|---|
| **id 53** | WR-07: `GATE-03` dice `disco 0` donde el `0` es el fallback de un `??`, y funde dos causas que el ancla sí distingue | **Decisión expresa del autor.** Arreglarlo exigiría su propia mutación y es cambio de gate, no cierre de fase |
| **id 59** | Mayúscula inicial perdida al renderizar los ejercicios que abren con el hueco: 36 ejercicios en 7 categorías, 33 sin capitalizar | **Decisión expresa del autor:** preexistente, ajeno al alcance de traducción, asignado a una fase posterior |
| **id 49** | El quórum no ejerce lo que el doc declara expresamente NO absuelto (tres falsos negativos de la misma familia) | **Sigue legítimamente abierta.** Su condición de cierre era que la fase convirtiera los barridos mecánicos en gates, y **no se hizo**. Además esta ronda añadió una enmienda más (WR-06) con sus propios puntos de vigilancia, o sea más superficie sin respaldo |

---

## Cambios en el ledger

- **id 60 nueva**, nace `fixed`: WR-05 como falso hallazgo refutado con evidencia del disco.
- **ids 43, 45, 47, 48, 50 y 51 pasan a `fixed`** tras auditarlas **contra el disco** y no
  contra el SUMMARY. Su historia se conserva íntegra, no se reescribe.
- **ids 44, 46 y 49 se quedan `open` a propósito**, y se dice por qué: las dos primeras son
  declaraciones permanentes que restringen trabajo futuro (misma clase que las ids 33, 34 y
  38), la tercera es deuda real sin cerrar.
- `open_count` **47 a 41**; `fixed_count` **12 a 19**; `total_count` **59 a 60**.

---

## Verificación de cierre

| Criterio | Resultado |
|---|---|
| Suite | **1389 tests / 1385 pass / 4 fail** — los mismos 4 preexistentes (`requirements-traceability`, ancla de Coverage y D-45-12) |
| Reporter | `VAL-04` / `VAL-06` / `VAL-08` / `VAL-09` / `TRAD-COV` / `ANCLA-RATCHET` los **seis** en PASS, `Milestone gate PASS`, exit **0** |
| Corpus | **328 traducciones, 328 `validated`, 0 `disputed`** |
| Overrides de autor | **8** — sin cambios |
| `schemaVersion` | **13** |
| Motor | `git diff --stat src/domain/ src/screens/app.js` **vacío** |
| Árbol | limpio salvo `.planning/config.json` (flag del orquestador, preexistente y no tocado) y el caché sin trackear |

Ficheros nuevos de esta ronda: `scripts/lib/ancla-ratchet.mjs`.

---

_Aplicado: 2026-08-16_
_Fixer: Claude (gsd-code-fixer)_
_Alcance: critical + warning, una sola pasada_
