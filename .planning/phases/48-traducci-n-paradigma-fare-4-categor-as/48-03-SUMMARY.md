---
phase: 48-traducci-n-paradigma-fare-4-categor-as
plan: "03"
subsystem: contenido/traducción
tags: [traduccion, quorum-cross-vendor, enmienda-criterios, D-46-12, TRAD-03, fare-congiuntivo, opcion-a]
status: complete
requires:
  - "48-01 (jueces declarados D-48-01, patrón de enganche y ancla, arreglo de la pared de contenido)"
  - "48-02 (fare-indicativo 54/54, aclaración de S2 sobre el pronombre sujeto vigente al nacer este contenido)"
  - "docs/TRANSLATION-VALIDATION-PROMPT.md + scripts/validate-translation-pass.mjs (Phase 46)"
provides:
  - "fare-congiuntivo 30/30 traducida y validated por quórum cross-vendor real"
  - "TRAD-COV en PASS (290/290) con cinco categorías"
  - "cuarta enmienda del doc de criterios: aclaración de S2 sobre el MODO obligado del congiuntivo"
  - "la medida literal del límite del Success Criterion 2, con las 11 variantes afectadas enumeradas"
  - "un punto ciego DEMOSTRADO del quórum, con el barrido mecánico que lo caza"
affects:
  - "plan 48-04 (mismo doc enmendado vigente al nacer su contenido), 48-05 (cierre, barrido perfecto/simple, TRAD-03)"
tech-stack:
  added: []
  patterns:
    - "quórum cross-vendor 1-por-1 (VAL-03)"
    - "enmienda absolutoria del doc verificada por grep"
    - "sujeto de re-validación medido ANCHO y refinado antes de gastar llamadas"
    - "barrido mecánico de dos regex como red bajo el quórum LLM"
key-files:
  created: []
  modified:
    - content/exercises/fare-congiuntivo.json
    - scripts/run-validation-271.mjs
    - content/translation-coverage.lock.json
    - tests/content-fare-congiuntivo.test.js
    - docs/TRANSLATION-VALIDATION-PROMPT.md
    - .planning/phases/46-pipeline-de-traducci-n-end-to-end-piloto-preposiciones/46-CONTEXT.md
    - .planning/WINDOWS.md
decisions:
  - "D-48-13: `opcion-a` — español natural siempre; el modo no se fuerza ni en las 6 duras ni en las 5 blandas, y la excepción se declara nombrada y contada. SC-2 se reporta CUMPLIDO CON EXCEPCIÓN"
  - "D-48-14: la `opcion-b` se descarta AUNQUE tenía margen aparente — «aunque hagamos» no es variante estilística de «aunque hacemos» sino lectura hipotética, y `benché` no porta ese matiz, así que espejarlo INYECTA contenido (defecto S2)"
  - "D-48-15: la `opcion-c` se descarta — enmendar el SC-2 a mitad de fase es mover la portería; si el texto del SC-2 promete lo que el español no puede dar, es hallazgo para 48-05 o para el verificador"
  - "D-48-16: CUARTA ENMIENDA del doc de criterios (aclaración de S2 sobre el MODO obligado del congiuntivo), decidida por el autor tras bloqueo escalado; los concerns de modo se cierran enmendando el doc, NO con override"
  - "D-48-17: el pronombre sujeto español SÍ se escribe en las 7 variantes donde la morfología española sincretiza 1ª y 3ª del singular. NO es carve-out de D-48-03: su premisa («la morfología basta») es falsa ahí, y S2 exige que la PERSONA siga siendo recuperable"
  - "D-48-18: passato#2 y passato#5 se reescriben (compuesto → simple) porque el concern era correcto en su mitad ajena al modo; la norma peninsular excluye el perfecto compuesto con marco temporal cerrado"
metrics:
  duration: "~115 min"
  completed: "2026-08-15"
actuals:
  tokens: 41000
  tasks: 3
  commits: 2
---

# Phase 48 Plan 03: `fare-congiuntivo` — 30/30 Summary

Las 30 variantes del subjuntivo quedan traducidas y `validated` por quórum cross-vendor real,
y **TRAD-COV pasa a 290/290 con cinco categorías**. Pero el resultado que importa no es la
cifra: es que el punto donde el Success Criterion 2 encuentra su **límite duro** dejó de ser
una hipótesis del plan y pasó a estar **medido, enumerado y declarado** — y que por el camino
apareció un **falso negativo del quórum** que ningún gate habría cazado.

## La medida que motivaba el plan: el contraste NO sobrevive

El par que el slot de disparadores existe para enseñar, comparado carácter a carácter:

| | `disparador#0` | `disparador#5` |
|---|---|---|
| Italiano resuelto | `Io penso che lui **faccia** il lavoro in questo momento.` | `Io so che lui **fa** il lavoro in questo momento.` |
| Modo italiano | congiuntivo presente | indicativo presente |
| Traducción | «**Pienso** que hace el trabajo en este momento.» | «**Sé** que hace el trabajo en este momento.» |

- Difieren en **una sola palabra**: `Pienso` / `Sé`.
- Sufijo común: **37 de 43 caracteres** = **86,0 %**.
- Las **subordinadas son BYTE-IDÉNTICAS**: `que hace el trabajo en este momento.`
- **El contraste NO sobrevive en español.** El italiano opone `faccia` / `fa`; el español da
  `hace` en las dos, porque `pensar que` y `saber que` rigen indicativo en afirmativa.

Cero diferencias artificiales introducidas, cero modos retorcidos, cero deduplicaciones.

## El recuento del alcance, derivado del disco

Las 122 variantes del bloque, clasificadas por el disparador extraído del `prompt` resuelto:

| Clase | N | Dónde |
|---|---|---|
| **Divergencia DURA** — italiano congiuntivo, español **obliga** indicativo | **6** | `presente#2`, `passato#2`, `trapassato#0`, `trapassato#1`, `trapassato#2`, `disparador#0` |
| **Divergencia BLANDA** — concesiva; el español admite los dos con lecturas distintas | **5** | `presente#3`, `imperfetto#3`, `passato#5`, `trapassato#5`, `disparador#1` |
| Convergen | 19 | resto de `fare-congiuntivo` |
| Sin verbo matriz subordinante | 92 | `fare-indicativo`, `fare-indefiniti`, `fare-cond-imperativo` |

**Las cifras que se reportan son 6 de 122 (duras) y 11 de 122 (incluyendo blandas)**, las dos,
sin elegir la que quede mejor. **Las 11 viven en `fare-congiuntivo`; las otras tres categorías
del bloque aportan cero.**

> **Nota de método, dicha en voz alta porque el clasificador falló dos veces antes de acertar.**
> `\b` en JavaScript solo existe entre `[A-Za-z0-9_]` y el resto, así que `\bBenché\b` y
> `\bÈ necessario che\b` **nunca casan** — la primera corrida dio 99 «sin verbo matriz» y se
> tragó 5 concesivas. Y `penso che` **contiene** `so che` como subcadena, así que `disparador#0`
> cayó en la clase equivocada por orden de reglas. Las dos se corrigieron **antes** de reportar
> nada. El mismo bug de acentos volvió a morder más tarde al medir el sujeto de la enmienda, y
> volvió a cazarse por inspección en vez de por confianza.

## La decisión del autor: `opcion-a`

Español natural siempre. El modo no se fuerza. La excepción se declara.

**Por qué se descartó la `opcion-b` teniendo margen aparente** — el argumento es del autor y
merece quedar escrito, porque yo había situado ahí un margen que **no era gratis**:

- «aunque **hacemos** el trabajo» → concesiva de hecho real, conocido.
- «aunque **hagamos** el trabajo» → hipotética.

`Benché` rige congiuntivo **siempre**, con hecho real o hipotético, así que el modo italiano
**no lleva esa información**. Espejarlo para conservar la señal **inyectaría una lectura
hipotética que el original no tiene**: eso es un defecto **S2 de fidelidad**, no una mejora. En
las 6 duras el margen es cero por agramaticalidad; en las 5 blandas se paga en fidelidad.

**Por qué se descartó la `opcion-c`:** tocar un Success Criterion a mitad de fase es mover la
portería. La `opcion-a` ya resuelve el reporte — **SC-2 cumplido CON excepción nombrada y
contada**. Si el texto del SC-2 promete literalmente algo que el español no puede dar, eso es
hallazgo para **48-05** o para el verificador, no una edición del executor.

**El apunte de fondo:** la traducción española es **ayuda de comprensión**, no el mecanismo de
enseñanza. El contraste de modo lo enseñan el italiano y la `explanation` del slot, que el
alumno lee en «¿Por qué?» y que **no forma parte del payload del evaluador**.

## El argumento empírico más fuerte a favor de `opcion-a`

**Las 6 divergencias DURAS pasaron 12/12**, sin una sola objeción de ningún juez.

Los jueces solo objetaron —y **de forma inconsistente**— en las **blandas**, que es donde el
español sí tiene elección:

| Concesiva | `deepseek-reasoner` | `gemini-3.5-flash-lite` |
|---|---|---|
| `presente#3` «Aunque hacemos todo…» | correcta | **correcta** |
| `imperfetto#3` «A pesar de que hacíamos…» | correcta | **correcta** |
| `trapassato#5` «A pesar de que habían cometido…» | correcta | **correcta** |
| `passato#5` «Aunque han hecho…» | correcta | **incorrecta** |
| `disparador#1` «Aunque haces…» | correcta | **incorrecta** |

**Marcar 2 y aprobar 3 idénticas es la firma canónica de la `WINDOWS` id 37**: hueco de
criterios, no defecto del texto ni ruido.

## La cuarta enmienda del doc de criterios

**Aclaración de S2: el MODO obligado del congiuntivo italiano no tiene que reaparecer en el
español** — quinta hermana de `da` + PERSONA, PARTITIVO, ADVERBIAL DE COMIDA y PRONOMBRE SUJETO.

Declara falso positivo el concern «traduce el subjuntivo italiano X por el indicativo español
Y» / «altera la modalidad concesiva» **y nada más**, cuando el disparador italiano rige
congiuntivo obligatoriamente (el modo no porta información) y el español o no lo admite o lo
admite cambiando el sentido.

**Prueba de dos condiciones del carve-out de 47-01:**

1. **Ausencia de sujeto: FALLA.** Medido **ancho primero y refinado después** sobre las 290
   traducciones del corpus. La medida ancha (disparador **o** morfología) dio **36, con 6
   fuera** de `fare-congiuntivo`. Las 6 se inspeccionaron una a una: **falsos positivos por
   homografía** —`facciamo`, `faceste`, `abbiamo fatto`, `aveste fatto` en oración principal,
   sin disparador subordinante, es decir indicativo puro—. Refinado por DISPARADOR:
   **N = 30, las 30 de `fare-congiuntivo`, cero fuera**. Los cuatro cuerpos cerrados
   (96 + 62 + 48 + 54 = **260**) tienen **cero** congiuntivo.
2. **Direccionalidad absolutoria: SE MANTIENE, verificada POR GREP.** Sobre las 49 líneas
   nuevas: **cero** coincidencias de los patrones de endurecimiento del veto de 47-01
   (`marca como incorrecta`, `marca sX false`, `exige que`, `debes`, `tienes que marcar/exigir`),
   frente a **6** marcas absolutorias. `git diff --numstat`: **48 inserciones, 0 borrados**.

Falla una ⇒ **cumplimiento literal**, ejecutado: **las 30 re-validadas desde cero**, `passes[]`
reseteado, **60 llamadas, 60 `correcta`, cero auto-fallbacks, cero pases pre-enmienda
supervivientes**.

**`disparador#1` cierra sin tocar un carácter del español y SIN override** — «Aunque haces los
deberes ahora, el profesor no está contento.» byte a byte idéntica antes y después. Mismo
movimiento que `301#1` (48-02) y `delle-invariable#0` (Phase 47).

## El hallazgo: un falso negativo DEMOSTRADO del quórum

`passato#5` trajo un concern **compuesto**. La primera mitad era la objeción de modo
(refutable). **La segunda no tenía nada que ver con el modo y era correcta:**

> «combina incorrectamente un pretérito perfecto con 'el mes pasado'»

La norma peninsular excluye el perfecto **compuesto** con marco temporal **cerrado**. Precedente
**derivado del disco**, no afirmado — en `fare-indicativo-passato-prossimo`, el único marco
cerrado es el único con forma simple:

```
#1 SIMPLE     :: Ayer hiciste la cama…                        <- marco CERRADO
#0,2,3,4,5 COMPUESTO :: Esta mañana / Esta semana / Hoy / Hace poco / Este mes
```

**Y al investigarlo apareció `passato#2` con el defecto IDÉNTICO, aprobada por LOS DOS jueces**
(«Me parece que **ha hecho** una foto **la semana pasada**»).

**Por qué cae justo ahí, que es lo que lo hace diagnóstico:** `passato#2` y `passato#5` son las
**dos únicas** variantes del bloque donde `opcion-a` baja a indicativo **dentro de un slot de
tiempo compuesto**. El subjuntivo español tolera el compuesto con marco cerrado, así que
mientras las hermanas se quedaron en subjuntivo la restricción estaba **tapada**; al soltar el
subjuntivo quedó al descubierto. Las otras 4 duras usan pluscuamperfecto, que no tiene esa
restricción. **Es un knock-on de una decisión del autor, no un error de ejecución suelto.**

**Diferencia con `a merenda` y `tanti anni fa`:** allí el hallazgo lo destapó el re-muestreo del
cumplimiento literal. Aquí lo destapó el **razonamiento sobre por qué el concern caía donde
caía**, antes de re-muestrear — `passato#2` nunca salió `disputed`, y el cumplimiento literal
posterior **tampoco la habría marcado**, porque los mismos dos jueces volvieron a aprobar la
versión ya arreglada. **Sin ese razonamiento el defecto se habría commiteado en verde.**

**Detalle sobre la calidad del concern:** el juez que sí detectó el problema propuso «Aunque
**hayan hecho** el trabajo el mes pasado», que **no resuelve su propia segunda objeción** —sigue
siendo compuesta con el mismo marco cerrado—. Detectar y proponer no son la misma competencia.

**Arreglo (decisión del autor), sin obedecer la parte de modo en ninguna:**

| Variante | Antes | Ahora |
|---|---|---|
| `passato#2` | Me parece que **ha hecho** una foto la semana pasada. | Me parece que **hizo** una foto la semana pasada. |
| `passato#5` | Aunque **han hecho** el trabajo el mes pasado… | Aunque **hicieron** el trabajo el mes pasado… |

**Barrido mecánico que prescribí para 48-05, corrido ya sobre mi propio trabajo:** marco cerrado
× compuesto de indicativo sobre las **290** traducciones del corpus → **0 coincidencias**. Dos
regex encuentran lo que dos LLM aprobaron.

## Las cuatro formas verbales, transcritas del disco

| Slot | io | tu | lui | noi | voi | loro |
|---|---|---|---|---|---|---|
| `presente` | haga | hagas | **hace** | **hacemos** | hagáis | cometan |
| `imperfetto` | hiciera | hicieras | hiciera | **hacíamos** | hicierais | cometieran |
| `passato` | haya hecho | hayas hecho | **hizo** | hayamos cometido | hayáis hecho | **hicieron** |
| `trapassato` | **había hecho** | **habías hecho** | **había hecho** | hubiéramos hecho | hubierais hecho | **habían cometido** |

**En negrita, las 11 casillas de la excepción declarada.** Coherencia intra-slot: `presente`
4/6 en presente de subjuntivo, `imperfetto` 5/6, `passato` 4/6, `trapassato` 2/6. La desviación
**es** la excepción, contada y no disimulada.

## Distinción inter-slot, CONTADA

**Para las 6 personas, los cuatro tiempos dan 4 formas españolas distintas: 6/6.**

Contraste de los compuestos con sus hermanos del indicativo cerrados en 48-02:

| | colapsos |
|---|---|
| `congiuntivo-passato` vs `indicativo-passato-prossimo` | **0/6** |
| `congiuntivo-trapassato` vs `indicativo-trapassato-prossimo` | **3/6** — `io`, `tu`, `lui`, las tres en `había/habías hecho` |

Los 3 colapsos son **exactamente** las tres divergencias duras de ese slot. **Motivo
lingüístico:** el español obliga indicativo tras `no sabía que` y `creía que`, y su
pluscuamperfecto de indicativo es idéntico al del slot hermano. **Declarado, no deduplicado y
sin diferencias artificiales.**

**Colisiones byte-idénticas en el bloque:** 84 traducciones escritas, **84 únicas, 0 pares**.

## Desviaciones del plan

### 1. [Rule 3 — Bloqueante] La pared de contenido, abierta y verificada por MUTACIÓN

`tests/content-fare-congiuntivo.test.js:448` congelaba el key set de variante en 3 claves.
Arreglo idéntico al de 48-01: descontar `translationES` **y esa clave sola**.

| Mutación | Esperado | Obtenido |
|---|---|---|
| clave intrusa `hint` | ROJO | ROJO (`key set de fare-congiuntivo-disparador#0`) |
| `prompt` → `promt` (obligatoria ausente) | ROJO | ROJO (13 fallos) |
| restaurado | VERDE + disco byte-idéntico | VERDE 64/64, `diff -q` IDÉNTICO |

`tests/content-fare-indefiniti.test.js` y `tests/content-fare-cond-imperativo.test.js`
**deliberadamente sin tocar** (48-04).

### 2. [Rule 2 — Correctitud] El pronombre sujeto en 7 variantes, y por qué NO es carve-out de D-48-03

D-48-03 omite el pronombre porque **«la morfología verbal basta»**. En el subjuntivo español esa
premisa **es falsa**: `haga`, `hiciera`, `haya hecho` y `había hecho` **sincretizan 1ª y 3ª del
singular**, exactamente como el italiano —por eso el `prompt` italiano lleva el pronombre—.

Omitirlo dejaría la persona **indeterminada**, y ese es el punto de vigilancia que la aclaración
de S2 de 48-02 declara **expresamente NO absuelto**: «si la frase se queda sin verbo que la
marque, eso ya era `[S2-fidelidad]` false». La misma aclaración dice que **escribir el pronombre
está igual de bien**. Así que el pronombre es aquí el recurso normal del español, no andamiaje.

**Las 7, enumeradas:** `presente#0`, `imperfetto#0`, `imperfetto#2`, `passato#0`,
`trapassato#0`, `trapassato#2`, `disparador#4`. Los 14 pases correspondientes salieron
`correcta`. **Se declara para que el autor pueda revertirlo: son 7 palabras.**

### 3. [Numeración] La nota de D-46-12 es la SÉPTIMA, no la quinta

El autor la encargó como «quinta nota». El seguimiento de 48-02 ya había añadido la quinta y la
sexta el día anterior. Se escribió como **SÉPTIMA** en vez de duplicar un ordinal existente, y
la corrección queda dicha dentro de la propia nota.

## Verificación

| # | Criterio | Resultado |
|---|---|---|
| 1 | Gate anti-ceguera VERDE | exit 0, 66/66; **5** pares ↔ **5** categorías cubiertas; 0 ciegas, 0 cruzadas |
| 2 | Ancla por gesto explícito | 5 claves; 62/54/48/96 **idénticos a `HEAD`**; diff = clave nueva + fecha |
| 3 | `expected` derivado | 0 literales, 0 prosa en la región del array |
| 4 | Rojo intencionado del Task 1 | TRAD-COV FAIL `fare-congiuntivo 2/30`; **VAL-08 en PASS**, que es lo correcto (id 40) |
| 5 | 30/30 status **derivado** | `deriveStatus` sobre el disco: **30 validated**, 0 disputed, 0 pending; 30/30 con ≥2 `by` de 2 vendors |
| 6 | Higiene del texto | huecos `___` **0**; metalenguaje **0**; smart quotes **0**; paréntesis del gloss **0**; `<` `>` `&#` **0** |
| 7 | Cuatro formas + distinción | transcritas arriba; **6/6** personas con 4 distintas |
| 8 | Colisiones byte-idénticas | **0** sobre 84 |
| 9 | TRAD-COV final | **PASS (290/290)**, exit 0, `Milestone gate PASS` |
| 10 | Violaciones de ancla | **0**; lock `git diff --stat` **vacío** en el Task 3 |
| 11 | Overrides | **8 en `HEAD` → 8 ahora.** Cero nuevos |
| 12 | `validation` de SLOT | **0/5 distintos a `HEAD`**; `notes` idéntico |
| 13 | Brownfield | `git diff --stat src/domain/ src/screens/app.js` **vacío**; `schemaVersion` **13** |
| 14 | Suite | **1297**/1293, **4 fallos** — los mismos pre-existentes |
| 15 | TRAD-03 | sigue **`Pending`** — solo 48-05 lo cierra |

### Las líneas del reporter, literales

```
fare-congiuntivo         | 30       | 30         | 0         | 0        | 0
  VAL-06 (250/250 validated): PASS (250/250)
  VAL-08 (cero disputed): PASS
  VAL-04 (≥2 distinct AIs por validated): PASS
  VAL-09 (status escrito == derivado): PASS
  TRAD-COV (290/290 traducciones validated): PASS (290/290)
```

Las cuatro categorías anteriores en sus cifras: 96, 48, 62, 54.

### Recuento de la operación

| Magnitud | Cifra, derivada |
|---|---|
| Traducciones autoradas | 30 (2 + 28) |
| Llamadas de quórum | **124** (4 del par + 56 del primer barrido + 60 del cumplimiento literal, 4 de ellas ya recontadas) |
| Auto-fallbacks | **0** |
| `disputed` encontrados / resueltos | 2 / 2 — **0 con override** |
| Overrides nuevos | **0** |
| Caracteres de español modificados tras validar | 2 variantes, por decisión expresa del autor |

## Amenazas

- **T-48-16** (falsear el corpus): cero diferencias artificiales, cero deduplicaciones. Las
  colisiones se contaron con un `Set` (0 byte-idénticas) y los 3 colapsos de forma verbal del
  `trapassato` se declaran con sus direcciones compuestas.
- **T-48-17** (dejar el gate ciego): anti-ceguera VERDE tras la edición, 5 ↔ 5, cero prosa en
  la región, `expected` derivado.
- **T-48-18** (invertir el ratchet): `bump-translation-lock.mjs` corrido primero SIN flag; único
  cambio `fare-congiuntivo: — → 30 [ALTA]`. Ningún suelo bajó.
- **T-48-19** (corrupción read-modify-write): `validation` de los 5 slots **idéntico a `HEAD`**,
  `notes` idéntico, `git diff` entre lotes de slot; los únicos borrados del diff de contenido
  fueron las 28 líneas `correctIndex` que ganaron una coma, verificado por grep.
- **T-48-20** (prompt injection): los 6 `prompt` con gloss entre paréntesis se ejercieron 124
  veces; ningún vendor los obedeció como directiva y ninguna traducción reprodujo paréntesis.
- **T-48-21** (fuga de claves): claves comprobadas por presencia y longitud, sin imprimir valor.
  Ninguna en el JSON ni aquí.
- **T-48-22** (audit trail que miente): cero `by` editados a mano, cero auto-fallbacks, cero
  overrides. Los 2 pases `incorrecta` retirados están **transcritos literal** en `WINDOWS` y en
  la séptima nota antes de retirarse.
- **T-48-23** (rate limits): concurrencia 1, cola verificada contra los dos proveedores antes de
  la primera llamada. **Se dice porque el listado de DeepSeek NO incluía `deepseek-reasoner`**
  (devolvió `deepseek-v4-flash` y `deepseek-v4-pro`) y aun así el modelo respondió: la
  verificación de cola es **necesaria y no suficiente**, exactamente como el plan advierte.

## Known Stubs

Ninguno. Las 30 traducciones son contenido definitivo y `validated`.

## Notas para 48-04 y 48-05

1. **La aclaración del MODO ya está vigente**: el contenido de `fare-indefiniti` y
   `fare-cond-imperativo` nace bajo el doc con las cinco excepciones y no es sujeto de
   re-validación.
2. **El barrido mecánico perfecto/simple** (`WINDOWS` id 47) es trabajo de **48-05**, y ya salió
   limpio sobre las 290 de hoy. Lo que queda es decidir si se convierte en gate.
3. **La excepción de `opcion-a`** (`WINDOWS` id 46) hay que reflejarla al reportar el SC-2.
4. **Los tests de contenido de `fare-indefiniti` y `fare-cond-imperativo`** siguen
   deliberadamente sin pre-arreglar.
5. **TRAD-03 sigue `Pending`**, verificado al terminar. Solo 48-05 lo cierra.
6. Siguen abiertos y asignados a 48-05: la colisión `hiciste`, el saneo de `concerns` (id 43) y
   el defecto de `--adjudicar` (id 45).

## Self-Check: PASSED

- `content/exercises/fare-congiuntivo.json` — FOUND (30 `translationES`, las 30 `validated`)
- `scripts/run-validation-271.mjs` — FOUND (entrada `fare-congiuntivo`, `expected` derivado)
- `content/translation-coverage.lock.json` — FOUND (5 claves)
- `tests/content-fare-congiuntivo.test.js` — FOUND (key set ensanchado y mutado)
- `docs/TRANSLATION-VALIDATION-PROMPT.md` — FOUND (sección nueva, 48 líneas insertadas)
- `.planning/phases/46-…/46-CONTEXT.md` — FOUND (SÉPTIMA NOTA de D-46-12)
- `.planning/WINDOWS.md` — FOUND (ids 46 y 47)
- Commit `33c1ef6` — FOUND
- Commit `81941c8` — FOUND
