---
phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
plan: 03
subsystem: content
tags: [traduccion, quorum-cross-vendor, deepseek, gemini, cambio-de-juez, override-autor, gates, articoli]

requires:
  - phase: 46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones
    provides: "El andamiaje entero: campo `translationES` (D-46-02), `docs/TRANSLATION-VALIDATION-PROMPT.md` (TVAL-01), `scripts/validate-translation-pass.mjs` (TVAL-02), `deriveStatus` como fuente única con override de autor de primera clase (TVAL-03 / D-46-14), el array `TRANSLATION_COVERAGE` del reporter (GATE-01) y el gate anti-ceguera (GATE-02)"
  - phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
    plan: 01
    provides: "`partitivos` enganchada a `TRANSLATION_COVERAGE` con el `expected` derivado; la excepción estructural del `prompt` metalingüístico; y la enmienda de D-46-12 con su prueba de dos condiciones"
  - phase: 47-traducci-n-bloque-art-culos-articoli-partitivos
    plan: 02
    provides: "Las 48 de Partitivos `validated`; las excepciones léxicas del PARTITIVO y del ADVERBIAL DE COMIDA en el doc de criterios; el primer override de traducción del corpus y su déficit estructural declarado (`WINDOWS` id 35); la aserción de quórum del test implementando su carve-out"
provides:
  - "Las 62 traducciones de Articoli con status derivado `validated` — la mitad Articoli, cerrada"
  - "La TERCERA entrada de `TRANSLATION_COVERAGE` (`articoli`), con el `expected` derivado del disco por `mcVariantCountOf` — el bloque contado al completo"
  - "TRAD-02 CUBIERTO: 110 de 110 traducciones del bloque Artículos (62 Articoli + 48 Partitivos), cifra recomputada del disco"
  - "El reporter de vuelta en **exit 0** con `TRAD-COV PASS (206/206)`, `disputed` 0"
  - "El primer CAMBIO DE JUEZ a mitad de corpus del proyecto (`deepseek-reasoner` sobre la categoría entera) y su registro para que el corpus no se lea como uniformemente juzgado — `WINDOWS` id 38"
  - "El SEGUNDO override de traducción del corpus (`articoli-lo-z#1`) y el PRIMERO que CUMPLE la barra estricta del plan: no fabrica quórum"
affects: [47-04, 48, 49, 50, 51, 52, 53]

actuals:
  tokens: 96000
  tasks: 2
  commits: 5

tech-stack:
  added: []
  patterns:
    - "Cuando el defecto está en el EVALUADOR y no en los criterios, cambiar el juez sobre la CATEGORÍA ENTERA y no solo sobre las que fallaron: re-juzgar únicamente los fallos es re-tirar los dados con un dado distinto hasta que pasen"
    - "Retirar los pases del juez sustituido es obligatorio cuando `deriveStatus` hace sticky el `incorrecta`: un juez retirado con objeciones vivas bloquea el `disputed` para siempre salvo override, y el contrato era cero overrides"
    - "Un override que NO fabrica quórum se distingue de uno que SÍ en el recuento de MODELOS previo, y esa diferencia se escribe en el motivo, en el ledger y en el SUMMARY — no se deja implícita en que ambos digan `override: true`"
    - "Un alias AUSENTE del listado `/models` de un proveedor puede seguir siendo invocable — corolario inverso de la id 33, que advertía lo contrario (presente ≠ invocable)"

key-files:
  created:
    - .planning/phases/47-traducci-n-bloque-art-culos-articoli-partitivos/47-03-SUMMARY.md
  modified:
    - content/exercises/articoli.json
    - scripts/run-validation-271.mjs
    - .planning/WINDOWS.md

key-decisions:
  - "Los 9 `disputed` del primer quórum se diagnosticaron como LÍMITE DEL EVALUADOR, no como hueco de criterios: la regla que los gobierna YA existe en S2. `docs/TRANSLATION-VALIDATION-PROMPT.md` queda con CERO líneas de diff — la primera vez en la fase que un `disputed` masivo NO produce enmienda"
  - "Checkpoint bloqueante resuelto por el AUTOR: `opción B+` — cambiar el juez del lado DeepSeek a `deepseek-reasoner` sobre las 62, no sobre las 9"
  - "Checkpoint bloqueante resuelto por el AUTOR: `opción A` sobre `articoli-lo-z#1` — override de autor. El español NO se toca, el doc NO se toca, el juez del lado Gemini NO se cambia"
  - "TRAD-02 SÍ se marca completo: 110 de 110 del bloque, cifra derivada del disco y confirmada por el reporter en exit 0. Es la diferencia con 47-01 y 47-02, donde marcarlo habría sido un verde sin respaldo"

patterns-established:
  - "Un `disputed` se escala al autor cuando las TRES salidas posibles son decisiones de gobernanza y no trabajo: el executor anterior hizo el trabajo adversarial completo y paró, en vez de inventarse el permiso"
  - "Un plan NO se firma en verde mientras el disco esté en 205/206: el executor anterior se negó a escribir este SUMMARY y esa negativa fue correcta"

requirements-completed: [TRAD-02]

coverage:
  - id: D1
    description: "Las 62 variantes `multiple-choice` de `articoli.json` llevan `translationES.text` en español acentuado, sin el hueco, y la categoría está enganchada a `TRANSLATION_COVERAGE` con el `expected` DERIVADO por `mcVariantCountOf`"
    requirement: TRAD-02
    verification:
      - kind: unit
        ref: "tests/count-arrays-lockstep.test.js — gate anti-ceguera, 64/64, exit 0"
        status: pass
      - kind: unit
        ref: "tests/schema-translation.test.js · tests/screen-translation.test.js"
        status: pass
    human_judgment: false
  - id: D2
    description: "Las 62 tienen status derivado `validated` con ≥2 `by` distintos de dos vendors; el bloque suma 110 y el corpus 206, todas las cifras recomputadas del disco"
    requirement: TRAD-02
    verification:
      - kind: integration
        ref: "node scripts/run-validation-271.mjs — TRAD-COV PASS (206/206), VAL-04/06/08/09 PASS, exit 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "El cambio de juez a `deepseek-reasoner` aplicado a la categoría ENTERA, con los pases del juez retirado eliminados y su contenido conservado en `f080fe3`"
    verification:
      - kind: integration
        ref: "git show f080fe3 — los 62 pases de deepseek-chat y sus 8 concerns literales"
        status: pass
    human_judgment: true
    rationale: "Que cambiar el juez sobre las 62 y no sobre las 9 elimine el sesgo de selección es un argumento de método, no un resultado medible. Lo mecánico (62 pases, 62 `correcta`, `by` escrito == pinneado) está verificado; lo que ningún test juzga es si el diagnóstico «límite del evaluador» era el correcto frente a «hueco de criterios»"
  - id: D4
    description: "El override de autor sobre `articoli-lo-z#1` con motivo escrito, sin tocar el español, y CUMPLIENDO la barra estricta del plan: no fabrica quórum"
    verification:
      - kind: unit
        ref: "tests/screen-translation.test.js — rama de override (implementada en 47-02, verificada allí por mutación)"
        status: pass
      - kind: integration
        ref: "recuento del disco: 2 `correcta` de 2 MODELOS de 2 VENDORS ANTES del override"
        status: pass
    human_judgment: true
    rationale: "El override es una adjudicación del autor. Lo mecánico está verificado; lo que ningún test puede juzgar es si la adjudicación era la correcta — aunque aquí, a diferencia de la id 35, el recuento estructural SÍ la respalda"

duration: 2h46m
completed: 2026-08-14
status: complete
---

# Phase 47 Plan 03: Traducción bloque Artículos — mitad Articoli Summary

**Las 62 traducciones de Articoli quedan `validated`, el bloque cierra en 110/110 y el reporter vuelve a exit 0 con `TRAD-COV PASS (206/206)` — pero lo que este plan deja de valor es la primera vez que un `disputed` masivo NO produce enmienda del doc: los 9 se diagnosticaron como límite del EVALUADOR y se cerraron cambiando el juez, dejando `docs/TRANSLATION-VALIDATION-PROMPT.md` con cero líneas de diff.**

## Performance

- **Duration:** 2h 46m 54s de reloj entre el primer commit del plan (`d85b60d`, 16:52:50) y el último (`a4398b6`, 19:39:44). Dentro de esa ventana, esta **continuación de cierre** ocupó los últimos ~9 minutos.
- **Tasks:** 2 de 2, más las decisiones de **DOS** checkpoints bloqueantes, las dos tomadas por el AUTOR
- **Commits:** 5 · **Files modified:** 3

## Naturaleza del quórum — declarada, no maquillada

**El quórum de este plan es el CROSS-VENDOR POR SCRIPT** (`scripts/validate-translation-pass.mjs`, DeepSeek + Gemini), que es lo que D-46-13 establece para TRADUCCIONES. **NO es el quórum canónico Opus+Sonnet por subagent `Task` de VAL-03**, que gobierna el contenido de ejercicio (R1-R7) y que un `gsd-executor` no puede spawnear. Ya registrado en `WINDOWS` id 34; se repite aquí porque un SUMMARY que dijera solo «quórum» dejaría al lector suponer el canónico.

**La autoría fue INLINE**, no por subagent-por-slot (D-46-15): el plan declaraba de antemano esa restricción y su fallback, y se ejecutó el fallback. Se degradó el aislamiento de contexto, **no** la independencia generador/validador: autoría de Claude, validación DeepSeek + Gemini, que es la separación que el plan protege.

## Cifras, TODAS recomputadas del disco

Ninguna cifra de esta sección se transcribió del plan ni del prompt de continuación.

| Categoría | Variantes `multiple-choice` | Con `translationES.text` | Status derivado `validated` | Con ≥2 `by` `correcta` |
|---|---|---|---|---|
| `preposiciones` (Phase 46) | 96 | 96 | 96 | 96 |
| `partitivos` (plan 47-02) | 48 | 48 | 48 | 48 |
| `articoli` (**este plan**) | **62** | **62** | **62** | **62** |
| **Bloque Artículos** | — | — | **110** | — |
| **Corpus traducido** | — | — | **206** | — |

- Variantes NO `multiple-choice` con `translationES`: **0** — los 2 slots `match` (`articoli-049`, `articoli-050`) siguen sin el campo **por construcción**, no por olvido: el schema lo rechaza (SCH-02) y `mcVariantCountOf` filtra por tipo antes de contar.
- Traducciones que arrastran el hueco `___`: **0**.
- `validation` a nivel de SLOT de los 34 slots: **idéntico** al de `HEAD` en la continuación, comparado como dos fotos del mismo dato. Esta fase añade traducciones, **no** re-valida gramática.

## Task 1 — las 62 autoradas y la categoría enganchada (`d85b60d`)

Autoría **inline por lotes**, cada slot visto ENTERO con su `explanation` y sus hermanas delante.

**El riesgo propio de este bloque, gestionado:** lo que Articoli enseña es una distinción **fonológica del italiano** —qué forma toma el artículo masculino según el sonido inicial de la palabra siguiente— y el español **no la reproduce en absoluto**. Traducidas, muchas hermanas quedan con el mismo artículo español, y **eso es correcto**: la traducción traduce la frase, no comenta la regla. Ninguna traducción intenta hacer visible la elección del artículo italiano; una que lo hiciera sería una `explanation` disfrazada.

**El enganche, en el MISMO commit** que la primera traducción, porque el gate anti-ceguera exige que el número de pares del array iguale al de categorías que el disco declara cubiertas — traducir sin enganchar y enganchar sin traducir son ambos ROJOS:

```js
{ slug: 'articoli', file: 'content/exercises/articoli.json', expected: mcVariantCountOf('content/exercises/articoli.json') },
```

El `expected` **no es un literal**: sale de la llamada al helper, como las dos entradas hermanas. La forma load-bearing se respeta (`slug` delante, `slug` y `file` en la misma línea, cero prosa nueva dentro de la región).

## Task 2 — el quórum, y el diagnóstico que NO produjo enmienda

### Primera vuelta (`f080fe3`): 53 `validated`, 9 `disputed`

`deepseek-chat` + `gemini-3.5-flash-lite`, un pase por variante y vendor, concurrencia 1. De los 9 `disputed`, **8 eran de `deepseek-chat`** y **1 de `gemini-3.5-flash-lite`**:

| Variante | Objetor | Concern (inicio literal) |
|---|---|---|
| `lo-scons#0` | `deepseek-chat` | `[S2-fidelidad] La traducción añade la preposición 'a' en 'al estudiante nuevo'…` |
| `lo-ps#0` | `deepseek-chat` | `[S2-fidelidad] La traducción añade la preposición 'a' ('al' = 'a el')…` |
| `lo-gn#1` | `deepseek-chat` | `[S2-fidelidad] La traducción omite el partitivo 'lo' del italiano…` |
| `lo-x#0` | `deepseek-chat` | `[S2-fidelidad] La traducción cambia el significado del verbo: 'c'è' significa 'hay'…` |
| `l-fem-vocal#0` | `deepseek-chat` | `[S6-naturalidad] La traducción es un calco literal del italiano: 'l'amica'…` |
| `uno-scons#0` | `deepseek-chat` | `[S2-fidelidad] La traducción omite el adverbial de comida 'Per cena'…` |
| `uno-z#0` | `deepseek-chat` | `[S2-fidelidad] La traducción cambia el artículo indeterminado del italiano: 'uno zaino'…` |
| `gli-yi#0` | `deepseek-chat` | `[S2-fidelidad] La traducción cambia el verbo: 'ci sono' (hay) se traduce como 'están'…` |
| **`lo-z#1`** | **`gemini-3.5-flash-lite`** | `[S2-fidelidad] el artículo italiano es masculino ('lo zaino'…), pero la traducción utiliza el femenino 'la mochila'…` |

### El diagnóstico: EVALUADOR, no criterios

La fase ya había escrito **tres** enmiendas del doc (el `prompt` metalingüístico en 47-01, el PARTITIVO y el ADVERBIAL DE COMIDA en 47-02), y la tentación era escribir la cuarta. **No se escribió**, y el motivo importa:

> La regla que gobierna estos concerns **YA existe en S2** — «las diferencias obligadas por la lengua son correctas y no se penalizan», líneas 104-105 del doc — y `deepseek-reasoner` **la aplica bien donde `deepseek-chat` la aplica mal**.

Restar S2 como quinta excepción habría **hinchado el doc para arreglar un modelo**. `docs/TRANSLATION-VALIDATION-PROMPT.md` queda con **cero líneas de diff en todo el plan**, y es la primera vez en la fase que un `disputed` masivo no cuesta una enmienda.

### `opción B+`, decidida por el AUTOR (`264dd19`): el juez cambia sobre las 62, no sobre las 9

| | |
|---|---|
| Juez nuevo del lado DeepSeek | `deepseek-reasoner` (el **más estricto** del mismo vendor que el objetor) |
| Alcance | **las 62**, no las 9 |
| Pases emitidos | **62** |
| Veredictos | **62 `correcta`**, cero `incorrecta` |
| `by` escrito == `by` pinneado | **62 de 62** (se corrió **sin** `--fallback` a propósito: caer a otro modelo dejaría la categoría con dos jueces) |
| Español modificado | **0 caracteres** |
| Overrides nuevos en este paso | **0** |
| Líneas de diff en el doc de criterios | **0** |

**Por qué las 62 y no las 9.** Re-juzgar solo las que fallaron es **re-tirar los dados sobre los fallos con un dado distinto hasta que pasen**. Cambiar el juez sobre la categoría entera elimina el sesgo de selección: las 53 ya `validated` recibieron el pase nuevo exactamente igual que las 9.

**Severidad, nunca indulgencia.** `deepseek-reasoner` es el mismo juez que 47-02 usó **dos veces** como pase adversarial, y que una de esas veces falló **EN CONTRA del autor** (`qualche#2`, `WINDOWS` id 35). No se eligió por indulgente.

**Los 62 pases de `deepseek-chat` se RETIRARON.** No es maquillaje: `deriveStatus` hace **sticky** cualquier `incorrecta`, así que un juez retirado con 8 objeciones vivas bloquearía el `disputed` para siempre **salvo override**, y el contrato era cero overrides nuevos. Su contenido literal se conserva en `f080fe3` y está transcrito en la tabla de arriba.

**Registrado en `WINDOWS` id 38** para que el lector sepa, **sin leer este SUMMARY**, que el corpus **no está juzgado de forma uniforme**: `preposiciones` y `partitivos` bajo `deepseek-chat`, `articoli` bajo `deepseek-reasoner`.

### El lado Gemini y sus 4 auto-fallbacks

Cola verificada contra `/v1beta/models` antes de gastar la primera llamada (aviso de `WINDOWS` id 33). Conjunto de `by` del fichero, contado del disco:

| `by` | Pases |
|---|---|
| `deepseek-reasoner` | 62 |
| `gemini-3.5-flash-lite` | 58 |
| `gemini-3.5-flash` | 5 |
| `autor` | 1 |

De los 5 pases de `gemini-3.5-flash`, **4 son auto-fallbacks** del pinneado `gemini-3.5-flash-lite` (`lo-x#1`, `gli-vocal#0`, `gli-vocal#1`, `un-fem-vocal#1`) y **el quinto es el pase adversarial deliberado** sobre `lo-z#1`. Se nombran el pinneado y el que respondió, como manda el criterio de aceptación.

**Hallazgo operativo reusable en las Phases 48-53** (en la id 38): `deepseek-reasoner` y `deepseek-chat` sirven hoy sobre la **misma base** `deepseek-v4-flash` —comprobado por el campo `model` de la respuesta—; lo que los separa es el **modo de razonamiento**, no el peso. Y el listado `/models` de DeepSeek ya **no publica** ninguno de los dos alias aunque ambos responden 200: **corolario inverso de la id 33** —un alias ausente del listado puede seguir siendo invocable, igual que uno presente puede no serlo.

## El override de `articoli-lo-z#1` — `opción A` del AUTOR (`a4398b6`)

Tras B+, **una sola variante** seguía `disputed`, y no cerraba porque su objetor está en el lado que B+ **no toca**: el Gemini.

> `Ho perso lo zaino in palestra.` → **«He perdido la mochila en el gimnasio.»**

El texto **se queda exactamente como fue autorado**. Cero caracteres del español modificados, cero líneas del doc, cero cambios en el juez del lado Gemini.

### El motivo, escrito en el propio `passes[]`

**El concern es un ERROR DE CATEGORÍA, no un defecto.** Exigir que el sustantivo español conserve el **género gramatical** del italiano confunde el género **léxico** —propiedad de cada lengua— con la **fidelidad**, y S2 ya cubre ese caso en su última viñeta.

**Las propias sugerencias del objetor lo delatan:** «el bolso» y «el morral» son **objetos distintos** de una mochila, así que aceptarlas **empeoraría** la traducción y la haría **falsa**. (Una tercera propuesta, «el mochilón», no es registro utilizable.)

**Y el objetor se contradice a sí mismo, contado del disco:** `gemini-3.5-flash-lite` aprobó el **mismo par de sustantivos el mismo día** en `articoli-uno-z#0` (`Mi serve uno zaino per la gita` → «Necesito una mochila para la excursión») y marcó este. Idéntico par, idéntica relación de género, veredictos opuestos, mismo juez, mismo día.

Marcar un patrón y aprobar el idéntico es la firma canónica de este proyecto para un **hueco de criterios** — pero **aquí no puede serlo**: un hueco de criterios habría marcado **los dos**. Apunta al **evaluador**. El autor adjudica **a favor del texto**.

### Trabajo adversarial previo (ejecutado por el executor anterior ANTES de escalar)

1. **Segunda muestra independiente del mismo modelo, desde cero** → **reprodujo** el concern. Luego no es ruido de muestreo.
2. **Juez más ESTRICTO del MISMO vendor que el objetor** (`gemini-3.5-flash`) → lo **refutó punto por punto** y dio `correcta`. Mismo movimiento que 47-02 hizo con `deepseek-reasoner`.
3. **Lado cross-vendor** (`deepseek-reasoner`) → `correcta`.
4. **La inconsistencia del propio objetor**, contada del disco (`articoli-uno-z#0`).

### Este override NO fabrica quórum — y es lo que lo distingue de la id 35

Es el dato estructural que separa este override del de `partitivos-qualche#2`, y por eso se dice en el motivo, aquí y en el ledger:

| | `partitivos-qualche#2` (id 35) | **`articoli-lo-z#1` (este)** |
|---|---|---|
| `correcta` de MODELO **antes** del override | **1** (`gemini-3.5-flash-lite`) | **2** (`deepseek-reasoner`, `gemini-3.5-flash`) |
| Vendors distintos entre esas `correcta` | 1 | **2** |
| `incorrecta` de MODELO | 2 | 1 (`gemini-3.5-flash-lite`) |
| ¿El override aporta la 2.ª `correcta` que `deriveStatus` cuenta? | **SÍ** | **NO** |
| ¿Cumple la barra estricta del plan (≥2 `correcta` de MODELOS distintos)? | **NO** | **SÍ** |
| Estado en `WINDOWS` | **`open` a propósito** | id 39, **`fixed`** |

Este override **resuelve una disidencia sobre un quórum de modelos que ya estaba en pie**, que es exactamente el caso de primera clase para el que se extendió `deriveStatus` en G-42-3. El pase `incorrecta` de `gemini-3.5-flash-lite` **se queda en `passes[]`**: el disenso sigue legible.

Estado final en disco de la variante — `status: validated`, `passes[]` en este orden:

`deepseek-reasoner: correcta` · `gemini-3.5-flash-lite: incorrecta` · `gemini-3.5-flash: correcta` · `autor: correcta (override)`

### Overrides en TODO el corpus de traducción: exactamente 2

Contados del disco, recorriendo `content/exercises/*.json`:

1. `partitivos.json` → `partitivos-qualche#2` (plan 47-02)
2. `articoli.json` → `articoli-lo-z#1` (este plan)

Ni uno más en toda la fase.

## Por qué este SUMMARY no existía antes

El executor anterior **se negó deliberadamente a escribirlo**. El disco estaba en **205/206** con el reporter en `FAIL`, y firmar en verde un plan que el disco deja en rojo es exactamente el modo de fallo del **CR-01 de la Phase 44** (una suite certificando en verde una cifra obsoleta). **La negativa fue correcta** y se registra como tal, no como un descuido que esta continuación viene a subsanar.

## Deviations from Plan

**Ninguna.** Los `disputed` se resolvieron con trabajo y con la decisión de gobernanza del autor; el único override nuevo es el que el autor autorizó; el doc de criterios no se tocó; el motor no se tocó.

Lo que sí es una **desviación del método por defecto de la fase**, declarada y no disimulada: los `disputed` de 47-01 y 47-02 se cerraron **enmendando el doc**, y los de este plan se cerraron **cambiando el juez**. La diferencia no es de conveniencia: en aquellos la regla **faltaba**; en este la regla **ya estaba** y el modelo la aplicaba mal.

## Verificación en disco al cerrar

| Comprobación | Resultado |
|---|---|
| Reporter `node scripts/run-validation-271.mjs` | **exit 0** |
| `TRAD-COV` | **`PASS (206/206)`** — `pending` 0, `missing` 0, **`disputed` 0** |
| `VAL-04` · `VAL-06` · `VAL-08` · `VAL-09` | `PASS` · `PASS (250/250)` · `PASS` · `PASS` |
| Línea de Articoli (literal) | `articoli                 \| 62       \| 62         \| 0         \| 0        \| 0` |
| Línea de Partitivos (literal) | `partitivos               \| 48       \| 48         \| 0         \| 0        \| 0` — **intacta** |
| Línea de Preposiciones (literal) | `preposiciones            \| 96       \| 96         \| 0         \| 0        \| 0` — **intacta** |
| Cabecera de cobertura (literal) | `Cobertura de traducción — unidad: VARIANTE multiple-choice (3 categorías declaradas cubiertas, 206 variantes)` |
| Veredicto final (literal) | `Milestone gate PASS.` |
| Gate anti-ceguera | `node --test tests/count-arrays-lockstep.test.js` **exit 0**, 64/64, las **TRES** categorías enganchadas |
| Suma del bloque, recomputada | **110** (62 + 48) |
| Overrides de traducción en el corpus | **2** — `partitivos-qualche#2`, `articoli-lo-z#1` |
| `git diff --stat` de `docs/TRANSLATION-VALIDATION-PROMPT.md`, `partitivos.json`, `preposiciones.json` | **vacío en los tres** |
| Español de `articoli.json` tocado | **0 líneas** de `"text"`, `"prompt"`, `"options"`, `"correctIndex"` o `"explanation"` en el diff de la continuación |
| Suite `node --test tests/*.test.js tests/fixtures/*.test.js` | **1343 tests / 1339 pass / 4 fail** — los **mismos 4** pre-existentes de trazabilidad (`WINDOWS` id 17), **cero regresiones nuevas**. NO es exit 0, y no debe serlo |
| Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `CURRENT_SCHEMA_VERSION` sigue en **13** |

## Requisitos

**TRAD-02 se marca COMPLETO**, y esta vez el disco lo respalda:

> *«Bloque Artículos traducido y validado al 100%: Articoli (62) + Partitivos (48) = 110 variantes.»*

Las tres cifras se recomputaron del fichero **antes** de marcarlo: 62 `validated` en `articoli`, 48 en `partitivos`, 110 de suma, y el reporter en **exit 0**. Es la diferencia con 47-01 y 47-02, donde `requirements-completed` se dejó vacío **a propósito** porque marcarlo habría sido un verde sin respaldo.

## Task Commits

| # | Commit | Qué |
|---|---|---|
| 1 | `d85b60d` | feat — autorar las 62 traducciones de Articoli y enganchar la categoría al array de cobertura |
| 2a | `f080fe3` | feat — quórum cross-vendor sobre las 62: 53 `validated`, 9 `disputed` |
| 2b | `264dd19` | fix — `opción B+`: el juez del lado DeepSeek pasa a `deepseek-reasoner` en TODA la categoría |
| 2c | `0a2885c` | docs — ledger: cambio de juez (id 38) + `disputed` escalado (id 39) |
| **3** | `a4398b6` | **feat — `opción A`: override de autor sobre `articoli-lo-z#1`; id 39 cerrada con su historia conservada** |

## Decisions Made

- **`opción B+` y `opción A`, decididas por el AUTOR**, ejecutadas sin reabrirlas.
- **Los 9 `disputed` NO produjeron enmienda del doc.** Diagnóstico: límite del evaluador. La regla ya existía en S2 y `deepseek-reasoner` la aplica bien. Cero líneas de diff en `docs/TRANSLATION-VALIDATION-PROMPT.md` — el doc de criterios sale de este plan **byte-intacto**.
- **El cambio de juez se aplicó a las 62, no a las 9**, para no reintroducir el sesgo de selección que el propio cambio existe para eliminar. Registrado en `WINDOWS` id 38 para que el corpus no se lea como uniformemente juzgado.
- **El override de `lo-z#1` CUMPLE la barra estructural del plan** — es el primero de la fase que lo hace. La id 35 sigue `open` a propósito y **esta entrada no la toca**.
- **TRAD-02 marcado completo**, respaldado por el disco.
- **Naturaleza del quórum, otra vez declarada:** cross-vendor **POR SCRIPT**, no el canónico Opus+Sonnet por `Task` de VAL-03 (`WINDOWS` id 34).

## Known Stubs

Ninguno. Las 62 traducciones son frases españolas completas y acentuadas; cero provisionales, cero glosas de una palabra, cero huecos arrastrados.

## Issues Encountered

- **9 `disputed` en la primera vuelta, 8 de ellos del mismo juez.** Cerrados cambiando el juez sobre la categoría entera, sin tocar el doc ni el español.
- **`gemini-3.5-flash-lite` marcando `lo-z#1` y aprobando `uno-z#0` el mismo día**, con el mismo par de sustantivos. Es la inconsistencia que sostiene el diagnóstico de «límite del evaluador» y, con él, el override.
- **4 auto-fallbacks en el lado Gemini** (`gemini-3.5-flash-lite` → `gemini-3.5-flash`). Nombrados variante a variante en lugar de agregados.
- **El alias `deepseek-reasoner` ya no aparece en `/models` de DeepSeek y sin embargo responde 200.** Corolario inverso de la id 33; anotado para las Phases 48-53.

## Ledger

- **id 38** — el cambio de juez a mitad de corpus. **Sigue `open`**: es un dato de gobernanza que el autor debe tener presente si alguna vez compara categorías asumiendo un juez único, o decide re-validar `preposiciones`/`partitivos` bajo el juez nuevo para homogeneizar.
- **id 39** — el `disputed` escalado. **Pasa a `fixed`** con la decisión del autor. La descripción original **se conserva entera** —describe con exactitud por qué el executor anterior escaló en vez de cerrar— y el cierre se le **añade detrás**, con el motivo, el recuento que demuestra que el override no fabrica quórum, y las cifras finales. Historia amendada, no borrada.
- **id 35** — **intacta y `open` a propósito**. Este plan la cita como contraste; no la cierra ni la modifica.

## User Setup Required

Ninguno nuevo. `DEEPSEEK_API_KEY` y `GEMINI_API_KEY` ya estaban en `.env` desde la Phase 46.

## Self-Check: PASSED

Los 4 ficheros citados existen en disco; los 5 commits del plan (`d85b60d`, `f080fe3`, `264dd19`, `0a2885c`, `a4398b6`) más el de cierre existen en `git log`; el frontmatter de este SUMMARY parsea; `WINDOWS.md` sigue siendo JSON válido tras el cierre de la id 39, con la id 35 en `open` y la 39 en `fixed`.
