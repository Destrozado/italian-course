---
phase: 48-traducci-n-paradigma-fare-4-categor-as
plan: "02"
subsystem: contenido/traducción
tags: [traduccion, quorum-cross-vendor, enmienda-criterios, D-46-12, TRAD-03, fare-indicativo]
status: complete
requires:
  - "48-01 (tracer, jueces declarados, enganche al array de cobertura, ancla re-emitida)"
  - "docs/TRANSLATION-VALIDATION-PROMPT.md + scripts/validate-translation-pass.mjs (Phase 46)"
  - "scripts/lib/pass-guard.mjs (CR-01 de Phase 47)"
provides:
  - "fare-indicativo 54/54 traducida y validated por quórum cross-vendor real"
  - "TRAD-COV en PASS (260/260) por primera vez con cuatro categorías"
  - "tercera enmienda del doc de criterios: aclaración de S2 sobre el pronombre sujeto explícito"
  - "los ocho tiempos del indicativo distinguidos en español, contados del disco"
affects:
  - "planes 48-03, 48-04 (misma aclaración vigente al nacer su contenido), 48-05 (cierre, colisión hiciste, riesgo de saneo)"
tech-stack:
  added: []
  patterns: ["quórum cross-vendor 1-por-1 (VAL-03)", "enmienda absolutoria del doc de criterios verificada por grep", "re-validación desde cero con passes[] reseteado"]
key-files:
  created: []
  modified:
    - content/exercises/fare-indicativo.json
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/WINDOWS.md
decisions:
  - "D-48-05: la objeción al pronombre sujeto omitido es HUECO DEL DOC, no defecto de la traducción ni límite del evaluador — decidido por el autor como tercera vía (opción C) frente a las dos que el executor propuso"
  - "D-48-06: el español de 301#1 NO se toca y D-48-03 sigue SIN carve-out; el arreglo va al doc de criterios, único fichero que el evaluador lee"
  - "D-48-07: el pase pre-enmienda se retira SIN --adjudicar y SIN override, reseteando passes[] a vacío, con su contenido literal transcrito en tres sitios"
  - "D-48-08: el alcance del cumplimiento literal de D-46-12 sobre las 53 queda ESCALADO al autor por volumen (53 > umbral declarado de 40)"
metrics:
  duration: "~75 min"
  completed: "2026-08-15"
actuals:
  tokens: 21500
  tasks: 2
  commits: 2
---

# Phase 48 Plan 02: Cerrar `fare-indicativo` — 54/54 Summary

Las 54 variantes de la categoría más grande del bloque quedan traducidas y `validated` por
quórum cross-vendor real, los ocho tiempos del indicativo se distinguen en español con una
colisión declarada, y **TRAD-COV pasa a verde por primera vez con las cuatro categorías**
(260/260) — con una enmienda del doc de criterios por medio que el plan había previsto como
posible y que la evidencia acabó exigiendo.

## Task 1 — la rama fue `no-aplica`, y la premisa se verificó contra el disco

**La línea de 48-01 que da el mandato, citada literalmente antes de describir nada:**

> «Task 3 (checkpoint:decision): **NO APLICABLE por ausencia de sujeto**» … «Con 10/10
> `correcta` y 10/10 `concerns: []` **no hay excepción candidata que evaluar**, así que no hay
> nada que decidir entre las opciones a/b/c/d.»

Ejecutada esa rama: **cero ficheros tocados, cero re-validación de las 206, cero nota de
enmienda**. `git diff --stat docs/TRANSLATION-VALIDATION-PROMPT.md` vacío al empezar. Task 1
**no produjo commit porque no produjo diff**, que es exactamente lo que la rama prescribe.

El plan listaba en su frontmatter `docs/TRANSLATION-VALIDATION-PROMPT.md` y el `46-CONTEXT.md`
entre los `files_modified`, asumiendo que la decisión de 48-01 sería amendar. **La asunción era
falsa y se comprobó contra el disco en vez de fabricar un diff para cumplirla.** Los dos
ficheros acabaron modificándose de todos modos, pero **por la vía del Task 2 y no por la del
Task 1**: no por la excepción que 48-01 no encontró, sino por una que apareció al validar las
49 traducciones nuevas. El matiz importa porque cambia quién decidió qué y cuándo.

## Task 2 — las 49 traducciones, autoradas slot por slot

Línea base recomputada del disco antes de escribir nada: **54 variantes `multiple-choice`, 5 ya
traducidas**. Cuadra con el plan; el disco no tuvo que ganar ninguna discrepancia.

Autoría por slot entero (`explanation` + las seis hermanas delante), no variante a variante.
Registro del bloque aplicado: **«los deberes»** (D-48-02) y **pronombre de sujeto omitido**
(D-48-03).

### Las ocho formas verbales, una por casilla — transcritas del disco

| Slot | Forma verbal española | io / tu / lui / noi / voi / loro |
|---|---|---|
| `presente` | presente | hago · haces · hace · hacemos · hacéis · cometen |
| `imperfetto` | pret. imperfecto | hacía · hacías · hacía · hacíamos · hacíais · cometían |
| `futuro-semplice` | futuro simple | haré · harás · hará · haremos · haréis · harán |
| `passato-remoto` | pret. perf. simple | cometí · hiciste · hizo · hicimos · hicisteis · hicieron |
| `passato-prossimo` | pret. perf. compuesto | he hecho · **hiciste** · ha hecho · hemos hecho · habéis hecho · han cometido |
| `trapassato-prossimo` | pluscuamperfecto | había hecho · habías hecho · había hecho · habíamos hecho · habíais hecho · habían hecho |
| `futuro-anteriore` | futuro compuesto | habré hecho · habrás hecho · habrá hecho · habremos hecho · habréis hecho · habrán hecho |
| `trapassato-remoto` | pret. anterior | hube hecho · hubiste hecho · hubo hecho · hubimos hecho · hubisteis hecho · hubieron hecho |

**Coherencia intra-slot: 7 de 8 slots coherentes.** La alternancia léxica `hacer` → `cometer`
donde el objeto es `un errore` no rompe la coherencia —el TIEMPO es el mismo en las seis
personas— y viene fijada desde el tracer («En 1990 cometí un error.»): en español se *comete* un
error, no se *hace*.

### La colisión, contada y NO deduplicada

**Distinción inter-slot: 5 de 6 personas dan las 8 formas distintas.** La sexta no:

> **`fare-indicativo-passato-remoto#1` ↔ `fare-indicativo-passato-prossimo#1`**, las dos en
> **`hiciste`**.

**Motivo lingüístico:** el marco de esa casilla es `Ieri`, y la norma peninsular excluye el
pretérito perfecto compuesto con `ayer`. El español tiene **un solo** pretérito simple donde el
italiano reparte passato remoto y passato prossimo según el marco, así que la casilla colapsa por
una propiedad de la lengua y no por un descuido de la traducción. Es también la única desviación
de coherencia intra-slot (5 compuestos + 1 simple en `passato-prossimo`). **Declarada como
hallazgo para el plan de cierre 48-05, no silenciada y no deduplicada.**

Sonda de bordes `adjacency`: **0 textos españoles byte-idénticos entre sí** en las 54, contados
del disco. Cada variante lleva su propio campo, sin compartir ni referenciar.

## Los dos `disputed`, resueltos por vías opuestas

### 1. `passato-remoto#4` — el juez se equivocó sobre el italiano

`gemini-3.5-flash-lite` marcó `[S5-italiano]` diciendo que el passato remoto de `fare` para `voi`
es `feceste`. **Es falso:** el paradigma es feci / facesti / fece / facemmo / **faceste** /
fecero, y `feceste` es justamente la distractora de alternancia cruzada que la `explanation` del
slot declara a propósito. El concern además juzga el EJERCICIO, cosa que la §3 del doc prohíbe
expresamente al evaluador.

Trabajo adversarial: (a) 2ª muestra independiente del mismo modelo → `correcta`, luego era ruido
de muestreo; (b) juez más estricto del mismo vendor, `gemini-2.5-flash` → `correcta`; (c) contado
del disco, el propio objetor había aprobado la estructura idéntica en `#1` (`facesti`) y `#3`
(`facemmo`); (d) el quórum R1-R7 de Phase 41 ya había ratificado la key.

Cerrado con **`--adjudicar` y motivo escrito grabado en el JSON**. Sin override.

### 2. `301#1` — el juez tenía razón sobre la rendija, y la rendija estaba en el doc

Aquí la 2ª muestra **reprodujo** el concern y un **segundo vendor** (`deepseek-chat`) llegó solo
a la misma objeción. El executor **paró y escaló**, como el plan manda tras dos rondas.

**El autor resolvió con una tercera vía que ninguna de las dos propuestas contemplaba** — se
registra porque es la que la doctrina del proyecto prescribía:

- El español **no se toca**. D-48-03 sigue **sin carve-out**.
- **Tampoco** se cierra con `--adjudicar` ni con override.
- El arreglo va **al doc de criterios**.

El diagnóstico decisivo lo dio el precedente de la `WINDOWS` id 37: *«marcar un patrón y aprobar
tres idénticos es la firma canónica de este proyecto para un hueco de criterios»*. El objetor
aprobó `301#0` y `301#2` —estructura idéntica, los dos pronombres omitidos— y marcó `301#1`.

## La tercera enmienda del doc de criterios

**Aclaración de S2: el PRONOMBRE SUJETO explícito del italiano no tiene que reaparecer en el
español** — cuarta hermana de `da` + PERSONA, PARTITIVO y ADVERBIAL DE COMIDA.

La rendija era estrecha y localizable: **S2 absolvía genéricamente «un pronombre sujeto que el
español omite», pero no decía nada del caso en que el ITALIANO lo lleva explícito** — que en una
lengua de sujeto nulo es una forma marcada. Por ahí entraron los dos concerns.

Y **NO vive en ningún otro sitio**: `git diff` muestra la regla añadida al doc, no a este SUMMARY
ni a un `notes` ni a un comentario.

**Su parte de «qué se sigue vigilando», que es lo que impide que sea un cheque en blanco:**
(1) que la **persona** siga siendo recuperable, (2) que no se pierda un **contraste** que la frase
afirma. Las dos lo dicen con estas palabras: *«ya era `[S2-fidelidad]` false antes de esta
aclaración»*. Reiteran S2 sin añadir exigencia.

## Prueba de dos condiciones del carve-out de 47-01

**Cifras recomputadas del disco el 2026-08-15**, derivando el status con `deriveStatus` sobre
`passes[]` (no leyendo el campo `status`), búsqueda ancha y **descontando el gloss R7** del
`italianoResuelto` como el propio doc manda:

| Categoría | Variantes mc | Con traducción | `validated` | CON SUJETO |
|---|---|---|---|---|
| `preposiciones` (Phase 46, cerrada) | 96 | 96 | 96 | **0** |
| `articoli` (Phase 47, cerrada) | 62 | 62 | 62 | **0** |
| `partitivos` (Phase 47, cerrada) | 48 | 48 | 48 | **0** |
| `fare-indicativo` (Phase 48, EN VUELO) | 54 | 54 | 53 | **53** |
| **TOTAL** | **260** | **260** | **259** | **53** |

La medida ancha daba **54**; el 54.º era `preposiciones-da-encasade#0`, descartado tras
inspeccionarlo: el `tu` que disparaba el match vive **dentro del gloss español** («Paso por **tu**
casa») y es un posesivo, no un sujeto italiano. Se dice porque es justo la clase de falso positivo
que una medida ancha sin refinar habría convertido en cifra falsa.

1. **Ausencia de sujeto: FALLA.** 53, y la condición exige cero.
2. **Direccionalidad absolutoria: SE MANTIENE, verificada y no declarada.** Grep de los patrones
   de endurecimiento que el veto de 47-01 nombra (`marca como incorrecta`, `marca sX false`,
   `exige que`, `debes`, `tienes que marcar/exigir`) sobre las 43 líneas de la sección nueva:
   **cero coincidencias**, frente a 4 marcas absolutorias. Además la regla **absuelve la omisión
   sin exigirla**, así que tampoco puede voltear a quien sí escriba el pronombre.

### La deuda de alcance queda ABIERTA y escalada — decisión pendiente del autor

Falla la condición 1 ⇒ **cumplimiento literal**. **No se ejecutó**, y esto es lo único que este
plan deja abierto:

- **53 supera el umbral de 40** que el coordinador declaró para devolver la decisión al autor.
  **Ese umbral es un supuesto declarado del coordinador, no una instrucción del autor**, y se dice
  así por petición expresa suya.
- **Pero la composición del sujeto no es la que el umbral anticipaba, y eso es lo que hace falta
  para decidir:** los **tres cuerpos cerrados de las Phases 46 y 47 tienen sujeto CERO**. Las 206
  traducciones que la rama `no-aplica` había evitado **no están tocadas**. Las 53 son trabajo **en
  vuelo del propio plan que está amendando** — literalmente la situación que la segunda nota de
  D-46-12 analizó para sus 32 y sobre la que actúa la condición 2.
- **Coste si el autor elige cumplimiento literal:** 53 × 2 = **106 llamadas**.
- **Precedente a favor de pagarlo:** la tercera nota de D-46-12, donde el cumplimiento literal
  sobre las 32 en vuelo destapó una variante con un concern NUEVO que la enmienda no cubría.

Registrado como `WINDOWS` **id 42**, y como **QUINTA NOTA de D-46-12** en `46-CONTEXT.md` con
fecha y firma.

### Corroboración empírica de la direccionalidad

`301#1` re-validado **desde cero** bajo el doc amendado, `passes[]` reseteado a vacío, los dos
jueces declarados: **2 llamadas, 2 `correcta`**. Pasa de `disputed` a `validated` **sin tocar un
carácter del español** («Hago una foto sin problemas, pero comete un error cada vez.», byte a byte
idéntica en `35bc8a4` y después) y **sin override**. Mismo movimiento que
`partitivos-delle-invariable#0` en la Phase 47.

**Pase retirado, transcrito literal** (el disenso no se borra en silencio):

```
{ "by": "gemini-3.5-flash-lite", "date": "2026-08-15", "verdict": "incorrecta",
  "concerns": ["[S2-fidelidad] omite el sujeto pronominal explícito \"lui\" de la segunda
    proposición del original (\"pero él comete un error cada vez\"); sugerencia:
    \"Hago una foto sin problemas, pero él comete un error cada vez.\""] }
```

Retirado **sin `--adjudicar` y sin override**, por decisión expresa del autor: juzgaba bajo
criterios que ya no rigen. El `deepseek-reasoner: correcta` que lo acompañaba se retiró con él
para que el quórum nuevo sea íntegramente post-enmienda — **cero pases pre-enmienda supervivientes
en esa variante**.

## Desviaciones del plan

### 1. [Rule 1 — Bug] El motivo de `--adjudicar` rompió el gate de higiene T-41-01

**Encontrado durante:** Task 2, corriendo la suite tras el commit del contenido.

**Problema:** el motivo que escribí para cerrar `passato-remoto#4` contenía `->` tres veces.
`tests/content-fare-indicativo.test.js:699` prohíbe `<`, `>` y `&#` en **cualquier** string del
fichero (invariante x-text-only, T-02-01), recorriendo el JSON entero — campos de validación
incluidos. La suite pasó de 4 fallos a **5**.

**Arreglo:** reescribir el motivo sin corchetes angulares, conservando `verdict`, `by`, `date` y
`concerns` intactos. Vuelta a 4.

**Detectado comparando el recuento contra la línea base, no leyendo el código.**

**El riesgo estructural NO se arregla aquí, por mandato del autor:** el campo `concerns[]` lo
escriben **los modelos** y entra al JSON **sin sanear**. Las cuatro categorías `fare` están
expuestas porque las cuatro tienen fichero de test con el mismo gate; `preposiciones`, `articoli`
y `partitivos` no lo tienen, y por eso las Phases 46-47 nunca chocaron con él. **En este plan no
ocurrió por suerte, no por diseño.** Cierre asignado al plan **48-05**. `WINDOWS` **id 43**.

### 2. [Alcance] Los dos ficheros del frontmatter se tocaron por otra vía

Explicado arriba en el Task 1. No es una desviación de contenido sino de **atribución**: el plan
los preveía como salida de una decisión tomada en 48-01, y acabaron siendo salida de una decisión
tomada **hoy**, sobre evidencia que 48-01 no tenía.

## Verificación

| # | Criterio | Resultado |
|---|---|---|
| 1 | Decisión de 48-01 citada literal y ejecutada | rama `no-aplica`, cero diff al empezar |
| 2 | 54/54 con status **derivado** `validated`, 2 vendors | **54/54**, `deriveStatus` sobre `passes[]` del disco |
| 3 | Cero `pending`, cero `disputed` residuales | 0 y 0 |
| 4 | Huecos `___` arrastrados | **0** |
| 5 | Metalenguaje gramatical en los 54 `text` | **0** coincidencias |
| 6 | Apóstrofes tipográficos / mayúscula y punto | 0 smart quotes; 54/54 bien formadas |
| 7 | Ocho formas transcritas y distinción contada | tabla arriba; **5/6** personas con las 8 distintas |
| 8 | TRAD-COV | ver transcripción abajo |
| 9 | Violaciones de ancla | **0**; `translation-coverage.lock.json` `git diff --stat` **vacío** |
| 10 | Overrides nuevos | **0** — corpus entero: **7** en `HEAD`, **7** ahora |
| 11 | `validation` de SLOT de los 10 slots | **idéntico a `HEAD`**, comparado como dos fotos; `notes` idéntico |
| 12 | Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío** |
| 13 | Suite | **1297**/1293, **4 fallos** — los mismos de la línea base; recursiva **1361**/1357, 4 |

### Las cinco líneas del reporter, literales

```
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (260/260 traducciones validated): PASS (260/260)

preposiciones            | 96       | 96         | 0         | 0        | 0
partitivos               | 48       | 48         | 0         | 0        | 0
articoli                 | 62       | 62         | 0         | 0        | 0
fare-indicativo          | 54       | 54         | 0         | 0        | 0
```

Las tres categorías anteriores **siguen en sus cifras de la línea base (96, 48, 62)**.

### Recuento de la operación

| Magnitud | Cifra, derivada |
|---|---|
| Traducciones autoradas | 49 |
| Llamadas de quórum | **108** (98 del quórum base + 6 adversariales + 2 de la re-validación + 2 rate-limited sin veredicto) |
| Auto-fallbacks | **0** — el `by` escrito es el juez pinneado en todas |
| Caracteres de español en disco | 2.341 |
| Caracteres de español modificados tras validar | **0** |
| Overrides nuevos | **0** |
| `disputed` encontrados / resueltos | 2 / 2 |

## Amenazas

- **T-48-09** (relajar el criterio para todo el corpus): la enmienda lleva su parte de vigilancia y
  se verificó absolutoria **por grep**, no por afirmación. Su alcance de re-validación **no se
  decidió aquí**: queda escalado al autor, que es exactamente lo que la amenaza pide.
- **T-48-10** (perder el disenso al re-validar): el `pass-guard` **lanzó de verdad** una vez y no se
  sorteó — se cerró con `--adjudicar` y motivo escrito en el JSON. El pase retirado de `301#1` está
  transcrito literal en tres sitios (esta SUMMARY, la quinta nota, `WINDOWS` id 41) antes de
  retirarse.
- **T-48-11** (corrupción en tanda larga): `git diff` entre lotes de slot; el `validation` de los 10
  slots y el `notes` quedan **idénticos a `HEAD`**.
- **T-48-12** (prompt injection): los 3 `prompt` de `-300` con gloss de frase completa se ejercieron
  108 veces; ningún vendor los obedeció como directiva.
- **T-48-13** (fuga de claves): claves comprobadas por presencia y longitud, sin imprimir valor.
  Ninguna en el JSON ni aquí.
- **T-48-14** (rate limits): concurrencia 1. `gemini-2.5-pro` devolvió 429 en los 3 reintentos de
  cada uno de sus 2 intentos — **se dice en vez de omitirlo**, y su ausencia de veredicto no se
  contó como apoyo a ninguna de las dos posturas.

## Known Stubs

Ninguno. Las 54 traducciones son contenido definitivo y `validated`.

## Notas para 48-03, 48-04 y 48-05

1. **La aclaración de S2 ya está vigente**: el contenido de las tres categorías restantes nace bajo
   el doc amendado y no es sujeto de re-validación.
2. **Sigue abierta la deuda de alcance de las 53** (`WINDOWS` id 42). Es la única decisión que este
   plan deja pendiente.
3. **El riesgo de saneo `->` es de 48-05** (`WINDOWS` id 43), con su mutación propia al arreglarlo.
4. **La colisión `hiciste`** va al análisis de cierre de 48-05.
5. **Los tres tests de contenido** de `fare-congiuntivo`, `fare-indefiniti` y `fare-cond-imperativo`
   siguen **deliberadamente sin pre-arreglar**.
6. **TRAD-03 sigue `Pending`** — solo 48-05 lo cierra.

## Self-Check: PASSED

- `content/exercises/fare-indicativo.json` — FOUND (54 `translationES`, las 54 `validated`)
- `docs/TRANSLATION-VALIDATION-PROMPT.md` — FOUND (sección nueva, 43 líneas)
- `.planning/phases/46-…/46-CONTEXT.md` — FOUND (QUINTA NOTA de D-46-12)
- `.planning/WINDOWS.md` — FOUND (ids 41, 42, 43; `open_count` 34)
- Commit `35bc8a4` — FOUND
- Commit `4d20e1b` — FOUND
