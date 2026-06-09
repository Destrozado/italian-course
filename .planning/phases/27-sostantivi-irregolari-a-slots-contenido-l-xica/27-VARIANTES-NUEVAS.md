# 27-VARIANTES-NUEVAS.md — Sostantivi irregolari: superficies nuevas propuestas (Task 1)

**Fase:** 27-sostantivi-irregolari-a-slots-contenido-l-xica · **Plan:** 27-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 26-VARIANTES-NUEVAS.md (Professioni — la otra lexica HIBRIDA) / 25-VARIANTES-NUEVAS.md (Genere e numero) — engorde de los slots del BLOQUE REGLA por los 3 EJES DE HUECOS PRIORIZADOS (D-27-03, el autor los marca/afina en el checkpoint).
**Decisiones aplicadas:** D-27-03 (ambicion GENEROSA, sin cuota fija; SOLO el bloque regla; VERIFICAR la forma plural real de cada palabra), D-27-04 (verificacion de forma plural real obligatoria; no inventar plurales ni invariabilidades), SOST-01/D-27-05 (el bloque lexico cambio-radice y el de contraste plurali-regolari NO reciben variantes), D-27-06 (explanations sin refs a las CATEGORIAS Genere e numero / Articoli por id ni prosa; el genero/numero como contenido del ejercicio es valido), D-27-10 (superficies movidas en 27-01 NO se re-validan), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots NUEVOS), D-27-11 (base de aprobacion = Claude Opus 4.8 + Sonnet 4.6), R1-R7 (sin leak en prompt, options 3+ valores distintos, una sola respuesta valida).

> Estado del JSON tras 27-01: **5 slots**. Los slots del BLOQUE REGLA (los unicos que reciben variantes nuevas en este plan) son: `sustantivos-irregulares-sovrabbondanti` (10 vars), `sustantivos-irregulares-invariabili-accentate` (3 vars), `sustantivos-irregulares-invariabili-straniere` (2 vars). El BLOQUE LEXICO PURO (`sustantivos-irregulares-cambio-radice`, 8 vars) y el de CONTRASTE (`sustantivos-irregulares-plurali-regolari`, 8 vars) NO reciben NINGUNA variante nueva (SOST-01/D-27-05).

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 13**
**Slots NUEVOS: 0** — los 3 ejes engordan los slots del bloque regla existentes de 27-01. NO se necesita ningun slot nuevo (ver seccion "Recomendacion: sin slots nuevos"). El count de 27-03 NO sube por este plan (las variantes no suben `data.exercises.length`; solo subirian los slots nuevos, y aqui no hay).

| Eje | Slot destino | Superficies | Palabras | Slot nuevo? |
|-----|--------------|-------------|----------|-------------|
| 1 — SOVRABBONDANTI -o sing -> -a plur fem | `sustantivos-irregulares-sovrabbondanti` (engorde) | 6 | ciglio->ciglia, sopracciglio->sopracciglia, paio->paia, lenzuolo->lenzuola, miglio->miglia (+1 inverso: ciglia->ciglio) | no |
| 2 — INVARIABILI-ACCENTATE (vocal tonica final) | `sustantivos-irregulares-invariabili-accentate` (engorde) | 4 | virtu, tribu, novita, eta | no |
| 3 — INVARIABILI-STRANIERE (extranjeras/consonante) | `sustantivos-irregulares-invariabili-straniere` (engorde) | 3 | bar, computer, autobus | no |

**Conteo por eje:** Eje 1 = 6 · Eje 2 = 4 · Eje 3 = 3 → **13 superficies nuevas, 0 slots nuevos.**

**Nota sobre la trampa (D-27-03):** la trampa A1 estrella se teje en las **distractoras** de cada superficie:
- Eje 1: el **plural regular masc en -i** (`*cigli`, `*paii`) donde el real es fem en -a (`ciglia`, `paia`) — el hispanohablante regulariza. La asimetria de genero masc sing -> fem plur es la trampa central. Mas el calco -s (`*ciglios`) y la flexion inventada (`*cigle`).
- Eje 2: el **calco flexionado** (`*virtudi`/`*virtu` con -i, `*tribi`, `*novitadi`/`*novite`, `*etadi`/`*ete`) donde la respuesta = la MISMA forma (invariable, vocal tonica final). Mata el calco `*cittadi`.
- Eje 3: el **calco -s ingles** (`*computers`, `*bars`, `*autobus(es)`) + flexion italiana inventada (`*bari`, `*autobussi`) donde la respuesta = la MISMA forma (invariable). Mata el calco `*films`.

Las explanations de los slots existentes NO se tocan (las variantes nuevas comparten la explanation del slot, sin explanation propia — D-27-03/D-27-04). Los prompts de este set espejan la mecanica de los slots destino de 27-01: `Un X, due ___.` (singular -> plural) y, para el inverso, `Due X, un ___.` (plural -> singular).

**Palabras DESCARTADAS / decisiones de scope (D-27-03/D-27-04, no inflar; verificar forma plural real):**
- **dito (eje 1):** YA esta en el legacy (`sovrabbondanti`) — NO duplicar. (Nota: dito tiene doble plural `le dita` [conjunto de la mano, fem] / `i diti` [dedos sueltos, masc]; ya cubierto por el legacy con `dita`.)
- **labbro/osso/braccio/uovo/ginocchio/orecchio (eje 1):** YA estan en el legacy `sovrabbondanti` — NO duplicar.
- **muro (eje 1, doble plural):** muro->`le mura` (las murallas de una ciudad, sobreabundante fem) / `i muri` (los muros sueltos, regular masc). Doble plural con MATIZ SEMANTICO -> ambigua para una variante A1 limpia (la respuesta dependeria del contexto: ciudad vs pared suelta). **DESCARTADA** del eje 1 para no introducir doble-validez (R7) sin gloss. El autor puede pedirla si quiere una variante con gloss ES que fije el sentido "murallas".
- **frutto (eje 1, doble plural):** frutto->`le frutta`/`la frutta` (la fruta como alimento, colectivo) / `i frutti` (los frutos, resultados). Doble plural con matiz semantico fuerte -> **DESCARTADA** (mismo motivo que muro; no es la trampa limpia masc->fem A1).
- **ditello/budello/cervello (eje 1):** sobreabundantes reales (`le budella`, `le cervella`) pero literarios/anatomicos, NO A1-A2 naturales -> **DESCARTADOS** (D-27-03: si no es A1-A2 natural, no se materializa).
- **citta/caffe/universita (eje 2):** YA estan en el legacy `invariabili-accentate` — NO duplicar.
- **liberta/qualita/possibilita (eje 2):** invariables validas en -tà, pero se priorizan virtu/tribu/novita/eta como las 4 acentuadas frescas mas A1-frecuentes (liberta/qualita/possibilita quedan documentadas como cubiertas por la regla -tà invariable; el autor puede pedir mas). te/re (rey) -> validas pero menos A1-claras como sustantivo de examen; documentadas como cubiertas.
- **film/sport (eje 3):** YA estan en el legacy `invariabili-straniere` — NO duplicar.
- **gas (eje 3):** invariable valida (il gas / i gas), pero se priorizan bar/computer/autobus como las 3 frescas mas A1-claras; gas queda documentada como cubierta por la regla (consonante final -> invariable). El autor puede pedir incluirla.

> **Verificacion de no-duplicacion (contra el JSON tras 27-01):**
> - `sovrabbondanti` legacy: braccio, uovo, dito, ginocchio, osso, labbro, orecchio (+ inversos braccia->braccio, uova->uovo). NUEVOS: ciglio, sopracciglio, paio, lenzuolo, miglio (+ inverso ciglia->ciglio). Ninguno duplica.
> - `invariabili-accentate` legacy: citta, caffe, universita. NUEVOS: virtu, tribu, novita, eta. Ninguno duplica.
> - `invariabili-straniere` legacy: film, sport. NUEVOS: bar, computer, autobus. Ninguno duplica.

---

## EJE 1 — SOVRABBONDANTI -o sing -> -a plur fem (slot existente `sustantivos-irregulares-sovrabbondanti`, D-27-03 eje (a) PRIORIZADO, la trampa A1 ESTRELLA: cambio masc->fem)

**HUECO:** el slot `sovrabbondanti` hoy drillea braccio/uovo/dito/ginocchio/osso/labbro/orecchio (mas inversos braccia->braccio, uova->uovo). FALTA mas variedad de sustantivos sobreabundantes A1-A2 que cambian de genero al pluralizar. El hueco es la **forma plural fem en -a** (no el regular masc en -i) + la **asimetria de genero** masc singular -> fem plural. Respuesta = el plural fem en -a. Distractora = el plural regular masc en -i (`*cigli` — la trampa central, lo que el hispanohablante regulariza), el calco -s, y la flexion inventada. Verificado R1 (el prompt fija el singular, no la regla) / R5 (4 options distintas) / R7 (una valida). **El plural sobreabundante real de cada palabra VERIFICADO (D-27-04).**

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION del plural real |
|-------------|--------------|-----------------|--------|---------|--------------|-----------------------------------------------|
| `tmp-sost-sovrab-ciglio` | `sustantivos-irregulares-sovrabbondanti` | ciglio -o masc -> ciglia -a fem | `Un ciglio, due ___.` | `["cigli", "ciglia", "ciglios", "cigle"]` | 1 | **VERIFICACION:** ciglio (pestaña) es masc -o singular; su plural anatomico (las pestañas) es `le ciglia` (-a, fem) — sobreabundante real. (`i cigli` existe SOLO con el sentido "bordes/orillas de camino", NO la pestaña; el ejercicio fija la pestaña por la familia del cuerpo del slot.) R1: el prompt fija el singular, no la regla. R5: `cigli`=plural regular masc (la trampa estrella), `ciglios`=calco -s, `cigle`=flexion inventada. 4 distintas. Respuesta = `ciglia`. Palabra NUEVA. |
| `tmp-sost-sovrab-sopracciglio` | `sustantivos-irregulares-sovrabbondanti` | sopracciglio -o masc -> sopracciglia -a fem | `Un sopracciglio, due ___.` | `["sopraccigli", "sopracciglia", "sopracciglios", "sopracciglie"]` | 1 | **VERIFICACION:** sopracciglio (ceja) es masc -o singular; su plural anatomico (las cejas) es `le sopracciglia` (-a, fem) — sobreabundante real, misma familia que ciglio. (`i sopraccigli` masc es marginal/regional; la forma estandar del cuerpo es `le sopracciglia`.) R1: sin leak. R5: `sopraccigli`=plural regular masc (trampa), `sopracciglios`=calco -s, `sopracciglie`=flexion inventada. 4 distintas. Respuesta = `sopracciglia`. Palabra NUEVA. |
| `tmp-sost-sovrab-paio` | `sustantivos-irregulares-sovrabbondanti` | paio -o masc -> paia -a fem | `Un paio, due ___.` | `["pai", "paii", "paia", "paios"]` | 2 | **VERIFICACION:** paio (par) es masc -o singular; su plural es `le paia` (-a, fem) — sobreabundante real y MUY A1 (un paio di scarpe -> due paia di scarpe). NO existe `*paii` ni `*pai` (la regularizacion tipica del hispanohablante). R1: sin leak. R5: `pai`=regularizacion truncada, `paii`=regularizacion doble-i (calco), `paios`=calco -s. 4 distintas. Respuesta = `paia`. Palabra NUEVA. (No es parte del cuerpo pero es el sobreabundante -o->-a mas frecuente A1; comparte la MISMA regla.) |
| `tmp-sost-sovrab-lenzuolo` | `sustantivos-irregulares-sovrabbondanti` | lenzuolo -o masc -> lenzuola -a fem | `Un lenzuolo, due ___.` | `["lenzuoli", "lenzuola", "lenzuolos", "lenzuole"]` | 1 | **VERIFICACION:** lenzuolo (sabana) es masc -o singular; su plural para las sabanas de una cama es `le lenzuola` (-a, fem) — sobreabundante real. (`i lenzuoli` masc existe para sabanas sueltas/individuales; el sentido A1 estandar "las sabanas de la cama" es `le lenzuola`.) R1: sin leak. R5: `lenzuoli`=plural regular masc (trampa), `lenzuolos`=calco -s, `lenzuole`=flexion inventada. 4 distintas. Respuesta = `lenzuola`. Palabra NUEVA. |
| `tmp-sost-sovrab-miglio` | `sustantivos-irregulares-sovrabbondanti` | miglio -o masc -> miglia -a fem | `Un miglio, due ___.` | `["migli", "miglia", "miglios", "miglie"]` | 1 | **VERIFICACION:** miglio (milla, unidad de distancia) es masc -o singular; su plural es `le miglia` (-a, fem) — sobreabundante real (tre miglia = tres millas). (OJO: `il miglio` = mijo [cereal] es palabra distinta sin plural sobreabundante; el sentido "milla/distancia" es el que toma `le miglia`. El prompt `due ___` con numeral fija el sentido de unidad de medida.) R1: sin leak. R5: `migli`=plural regular masc (trampa), `miglios`=calco -s, `miglie`=flexion inventada. 4 distintas. Respuesta = `miglia`. Palabra NUEVA. |
| `tmp-sost-sovrab-ciglio-inv` | `sustantivos-irregulares-sovrabbondanti` | INVERSO: ciglia -a fem plur -> ciglio -o masc sing | `Due ciglia, un ___.` | `["ciglia", "ciglio", "cigle", "ciglo"]` | 1 | **VERIFICACION (inverso):** el singular de `ciglia` (pestañas, fem -a) es `il ciglio` (masc -o) — recupera el lema masculino desde el plural femenino, la trampa central de genero (parece fem por la -a, pero el singular es masc). Espeja los inversos del legacy (braccia->braccio, uova->uovo). R1: sin leak. R5: `ciglia`=el mismo plural (no flexiona), `cigle`=flexion inventada, `ciglo`=calco sin -i. 4 distintas. Respuesta = `ciglio`. Palabra NUEVA (inverso de ciglio). |

**Verificacion italiana A1 (resumen Eje 1):**
- **ciglio->ciglia, sopracciglio->sopracciglia** (pestaña/ceja, partes del cuerpo pareadas, plural anatomico fem -a; los homofonos masc `i cigli`/`i sopraccigli` tienen sentido distinto [bordes] / son marginales).
- **paio->paia** (par, sobreabundante -o->-a MUY A1, `due paia di scarpe`).
- **lenzuolo->lenzuola** (sabanas de la cama, fem -a; `i lenzuoli` masc = sabanas sueltas).
- **miglio->miglia** (milla/distancia, fem -a; distinto de `il miglio` mijo).
- **ciglia->ciglio** (inverso: el singular es masc `il ciglio`).
La trampa central A1: el cambio de genero masc singular -> fem plural en -a (el hispanohablante regulariza a `*cigli`/`*paii`). Las distractoras materializan el plural regular masc en -i (la trampa estrella), el calco -s y la flexion inventada. El quorum cross-vendor confirma que cada palabra toma realmente el plural sobreabundante en -a (D-27-04) ANTES de entrar al slot. NINGUNA palabra duplica el legacy. Los dobles plurales con matiz semantico fuerte (muro/frutto) y los literarios (budello/cervello) DESCARTADOS para evitar doble-validez (R7) y mantener el nivel A1-A2.

---

## EJE 2 — INVARIABILI-ACCENTATE (vocal tonica final) (slot existente `sustantivos-irregulares-invariabili-accentate`, D-27-03 eje (b) PRIORIZADO, mata el calco *cittadi)

**HUECO:** el slot `invariabili-accentate` hoy drillea citta/caffe/universita (3 vars). FALTA mas variedad de acentuadas/truncas para reforzar que el calco flexionado (`*virtudi`/`*cittadi`) es SIEMPRE erroneo. El hueco es que la respuesta correcta = la MISMA forma del singular (invariable, la vocal tonica final bloquea la flexion); solo el articulo/numeral distingue el numero. Distractora = el calco flexionado en -i/-di (el calco español/regularizacion, la trampa A1 fuerte) + el plural inventado. Verificado R1 (el prompt fija el singular y pide el plural, mecanica del slot, no leak de la regla) y R5 (4 options distintas). **La invariabilidad y la tilde de cada palabra VERIFICADAS (D-27-04).**

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION de la invariabilidad |
|-------------|--------------|-----------------|--------|---------|--------------|----------------------------------------------------|
| `tmp-sost-acc-virtu` | `sustantivos-irregulares-invariabili-accentate` | virtu / vocal tonica final INVARIABLE | `Una virtù, due ___.` | `["virtudi", "virtù", "virtùe", "virti"]` | 1 | **VERIFICACION:** virtù (virtud) acaba en vocal tonica final acentuada (ù grave) -> INVARIABLE: `la virtù` / `le virtù` identicas. El calco español `*virtudi`/`*virtudes` es erroneo. R1: el prompt fija el singular y pide el plural (mecanica del slot, no leak). R5 (FIX APLICADO checkpoint): 4 valores distintos `virtudi`=calco español flexionado (la trampa), `virtù`=respuesta, `virtùe`=flexion inventada, `virti`=truncamiento sin tilde. correctIndex 1. Respuesta = la MISMA forma `virtù` (con tilde grave). Palabra NUEVA. **OJO TILDE: ù grave obligatoria.** |
| `tmp-sost-acc-tribu` | `sustantivos-irregulares-invariabili-accentate` | tribu / vocal tonica final INVARIABLE | `Una tribù, due ___.` | `["tribi", "tribù", "tribùe", "tribus"]` | 1 | **VERIFICACION:** tribù (tribu) acaba en vocal tonica final acentuada (ù grave) -> INVARIABLE: `la tribù` / `le tribù` identicas. R1: sin leak. R5: `tribi`=calco flexionado en -i (la trampa), `tribùe`=flexion inventada, `tribus`=calco -s/latinismo. 4 distintas. Respuesta = la MISMA forma `tribù` (con tilde grave). Palabra NUEVA. **OJO TILDE: ù grave obligatoria.** |
| `tmp-sost-acc-novita` | `sustantivos-irregulares-invariabili-accentate` | novita / vocal tonica final INVARIABLE (-tà) | `Una novità, due ___.` | `["novitadi", "novite", "novità", "novitàe"]` | 2 | **VERIFICACION:** novità (novedad) acaba en vocal tonica final acentuada (à grave, familia -tà) -> INVARIABLE: `la novità` / `le novità` identicas. La familia abstracta en -tà NUNCA flexiona. R1: sin leak. R5: `novitadi`=calco flexionado (la trampa -des/-di), `novite`=flexion inventada, `novitàe`=flexion inventada con tilde. 4 distintas. Respuesta = la MISMA forma `novità` (con tilde grave). Palabra NUEVA. **OJO TILDE: à grave obligatoria.** |
| `tmp-sost-acc-eta` | `sustantivos-irregulares-invariabili-accentate` | eta / vocal tonica final INVARIABLE (-tà) | `Un'età, due ___.` | `["età", "etadi", "ete", "etàe"]` | 0 | **VERIFICACION:** età (edad) acaba en vocal tonica final acentuada (à grave, familia -tà) -> INVARIABLE: `l'età` / `le età` identicas. R1: sin leak. R5: `etadi`=calco flexionado (la trampa), `ete`=flexion inventada, `etàe`=flexion inventada con tilde. 4 distintas. Respuesta = la MISMA forma `età` (con tilde grave). Palabra NUEVA. **OJO TILDE: à grave obligatoria.** (FIX APLICADO checkpoint: prompt cambiado a `Un'età, due ___.` con apostrofo ASCII U+0027 — elision italiana real `un'età`; correctIndex 0 apunta a `età`.) |

> **NOTA DE MATERIALIZACION (Eje 2) — para Task 2 / atencion del autor:**
> 1. **`virtu` (R5):** la fila propuesta tiene la respuesta duplicada en options ([virtù, virtù, ...]) — eso VIOLA R5 (4 valores distintos). **CORREGIR** en la materializacion del id temporal: options = `["virtudi", "virtù", "virtùe", "virti"]`, correctIndex = 1 (`virtudi`=calco flexionado trampa, `virtù`=respuesta, `virtùe`=flexion inventada, `virti`=truncamiento sin tilde). Se deja anotado aqui para que el autor lo apruebe; el quorum lo cazaria si no.
> 2. **`eta` (articulo):** en italiano real el singular elide: `un'età` (no `una età`). El prompt propuesto `Una età` espeja la mecanica `Una/Un X, due ___` del slot, pero podria sonar raro. Opciones para el autor: (a) usar `Un'età, due ___.` (apostrofo ASCII U+0027), (b) cambiar a un numeral neutro `Tante età diverse: la prima ___...` (mas complejo), o (c) mantener `Una età` como mecanica de slot. **Recomendacion:** (a) `Un'età, due ___.` con apostrofo U+0027. El autor decide en el checkpoint.

**Verificacion italiana A1 (resumen Eje 2):** virtù, tribù (vocal tonica ù grave), novità, età (familia -tà, à grave) — TODAS invariables (la vocal tonica final bloquea la flexion). La respuesta = la MISMA forma del singular; solo el articulo/numeral distingue el numero. El calco flexionado (`*virtudi`, `*tribi`, `*novitadi`, `*etadi`) es SIEMPRE erroneo: es justo la distractora-trampa A1 del hispanohablante (calco del plural español -des/-i). **TODAS llevan su tilde grave obligatoria en la vocal tonica final** (MEMORY: DeepSeek estricto en acentos). El quorum confirma la invariabilidad y la tilde de cada palabra (D-27-04). NINGUNA duplica el legacy.

---

## EJE 3 — INVARIABILI-STRANIERE (extranjeras/consonante final) (slot existente `sustantivos-irregulares-invariabili-straniere`, D-27-03 eje (c), mata el calco *films/*computers)

**HUECO:** el slot `invariabili-straniere` hoy drillea film/sport (2 vars). FALTA mas variedad de extranjerismos/consonante final para reforzar que el calco -s ingles (`*computers`/`*films`) es SIEMPRE erroneo en italiano. El hueco es que la respuesta correcta = la MISMA forma del singular (invariable, palabra no italiana / consonante final no flexiona); solo el articulo distingue el numero. Distractora = el calco -s ingles (la trampa A1 fuerte) + la flexion italiana inventada (`*bari`/`*computeri`). Verificado R1 / R5. **La invariabilidad real de cada palabra VERIFICADA (D-27-04).**

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION de la invariabilidad |
|-------------|--------------|-----------------|--------|---------|--------------|----------------------------------------------------|
| `tmp-sost-stra-bar` | `sustantivos-irregulares-invariabili-straniere` | bar / consonante final INVARIABLE | `Un bar, due ___.` | `["bari", "bar", "bars", "bare"]` | 1 | **VERIFICACION:** bar (bar, prestamo) acaba en consonante -> INVARIABLE en italiano: `il bar` / `i bar` identicos. R1: el prompt fija el singular, no la regla. R5: `bari`=flexion italiana inventada (la trampa; ademas `Bari` es una ciudad, refuerza el error), `bars`=calco -s ingles, `bare`=flexion inventada. 4 distintas. Respuesta = la MISMA forma `bar`. Palabra NUEVA. |
| `tmp-sost-stra-computer` | `sustantivos-irregulares-invariabili-straniere` | computer / extranjerismo consonante final INVARIABLE | `Un computer, due ___.` | `["computeri", "computers", "computer", "computere"]` | 2 | **VERIFICACION:** computer (ordenador, anglicismo) acaba en consonante -> INVARIABLE: `il computer` / `i computer` identicos. El italiano NO añade -s (`*computers` es el calco ingles/español). R1: sin leak. R5: `computeri`=flexion italiana inventada, `computers`=calco -s ingles (la trampa estrella), `computere`=flexion inventada. 4 distintas. Respuesta = la MISMA forma `computer`. Palabra NUEVA. |
| `tmp-sost-stra-autobus` | `sustantivos-irregulares-invariabili-straniere` | autobus / consonante final INVARIABLE | `Un autobus, due ___.` | `["autobusi", "autobus", "autobussi", "autobuses"]` | 1 | **VERIFICACION:** autobus (autobus) acaba en consonante (-s) -> INVARIABLE en italiano: `l'autobus` / `gli autobus` identicos. R1: sin leak. R5: `autobusi`=flexion italiana inventada, `autobussi`=flexion doble-s inventada, `autobuses`=calco -es español. 4 distintas. Respuesta = la MISMA forma `autobus`. Palabra NUEVA. |

**Verificacion italiana A1 (resumen Eje 3):** bar, computer, autobus — TODAS terminan en consonante / son extranjerismos -> INVARIABLES en italiano (la palabra no italiana / consonante final no flexiona). La respuesta = la MISMA forma del singular; solo el articulo (il/i, l'/gli) distingue el numero. El calco -s ingles (`*computers`, `*bars`) y la flexion italiana inventada (`*bari`, `*autobussi`) son SIEMPRE erroneos: son justo las distractoras-trampa A1 del hispanohablante/anglohablante. El quorum confirma la invariabilidad de cada palabra (D-27-04). NINGUNA duplica el legacy (film/sport ya estan).

---

## Bloque lexico (cambio-radice) y contraste (plurali-regolari): SIN autoria de variantes (SOST-01/D-27-05)

**El BLOQUE LEXICO PURO (cambio-radice) y el BLOQUE CONTRASTE (plurali-regolari) de Sostantivi irregolari NO reciben NINGUNA variante nueva en este plan.** Esto es cumplimiento EXPLICITO de SOST-01 (la fase prohibe forzar variantes artificiales) y de D-27-03/D-27-05 (documentado por bloque).

Los slots que NO reciben variantes nuevas y POR QUE:

| Slot (tras 27-01) | type | Por que NO admite autoria de variantes |
|-------------------|------|-----------------------------------------|
| `sustantivos-irregulares-cambio-radice` (uomo->uomini, dio->dei, bue->buoi, tempio->templi + inversos/adjetivo/duplicado) | multiple-choice | **BLOQUE LEXICO PURO.** uomo/dio/bue/tempio son lemas memorizables de **raiz impredecible** — comparten el meta-patron "raiz impredecible, memorizalo" pero NO son variantes intercambiables reales (no se puede sustituir una por otra siguiendo una regla productiva: uomo->uomini, dio->dei, bue->buoi, tempio->templi NO comparten una transformacion). SOST-01 lo PROHIBE explicitamente ("no toda celda tiene variantes intercambiables"). Engordarlo seria inventar plurales de cambio de raiz artificiales (no existen mas lemas A1 de esta clase trivialmente sustituibles). El slot queda EXACTAMENTE como en 27-01 (8 variantes). |
| `sustantivos-irregulares-plurali-regolari` (donna/padre/madre/fratello/sorella/marito/moglie + inverso) | multiple-choice | **BLOQUE CONTRASTE.** Son plurales REGULARES de parentesco que el autor metio como **foils deliberados** para contrastar con los irregulares (enseñan a PARAR y comprobar genero/terminacion antes de pluralizar). NO es el proposito de la categoria engordarlos (D-27-05): no son irregulares, son el contraste. Engordarlos diluiria el contraste y solaparia con Genere e numero (D-27-06). El slot queda EXACTAMENTE como en 27-01 (8 variantes). |

**Razon de fondo (SOST-01/D-27-03):** "no toda celda tiene variantes intercambiables". El bloque REGLA (sovrabbondanti -o->-a + invariabili acentuadas + invariabili extranjeras) ES un conjunto de reglas con variantes intercambiables (saber que la regla aplica = N palabras intercambiables que la siguen) -> SI se autora (ejes 1-3). El bloque LEXICO PURO (cambio de raiz impredecible) y el de CONTRASTE (foils regulares deliberados) NO son reglas reformulables con variantes -> NO se autoran. SOST-02 se cumple asi: hay autoria donde HAY regla (sovrabbondanti + invariabili), y se documenta que el lexico/cambio-de-raiz y el contraste NO la admiten (SOST-01).

---

## Recomendacion: SIN slots nuevos (surfaceada al autor)

**Recomendacion del planner/executor: NO crear ningun slot nuevo.** Los 3 ejes de huecos D-27-03 engordan limpiamente los slots del bloque regla existentes de 27-01:

- Eje 1 (sovrabbondanti -o->-a) -> `sustantivos-irregulares-sovrabbondanti` (misma regla: masc -o sing -> fem -a plur; ciglio/sopracciglio/paio/lenzuolo/miglio son mas instancias intercambiables de la MISMA regla; + 1 inverso espejando los del legacy).
- Eje 2 (invariabili-accentate) -> `sustantivos-irregulares-invariabili-accentate` (misma regla: vocal tonica final = invariable; virtu/tribu/novita/eta son mas instancias).
- Eje 3 (invariabili-straniere) -> `sustantivos-irregulares-invariabili-straniere` (misma regla: extranjerismo/consonante final = invariable; bar/computer/autobus son mas instancias).

Crear slots nuevos seria sobre-fragmentar reglas que ya tienen su slot. Cada slot del bloque regla existente ya tiene su `validation` top-level de 27-01 (de las superficies fuente, quorum limpio Opus 4.7 + Sonnet 4.6 2026-05-27), que cubre la gate VAL_07_STRICT a nivel de slot — NO se degrada al engordar. **El autor confirma en el checkpoint o pide algun slot nuevo** (lo cual subiria el count de 27-03 y requeriria validation top-level propia, D-19-09).

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Acentos italianos (CRITICO en el eje 2):** las 4 acentuadas del eje 2 llevan su **tilde grave obligatoria en la vocal tonica final**: `virtù` (ù grave), `tribù` (ù grave), `novità` (à grave), `età` (à grave). En las options del eje 2 las distractoras `virtùe`/`tribùe`/`novitàe`/`etàe` tambien llevan la tilde (flexion inventada SOBRE la forma acentuada); las distractoras de calco (`virtudi`/`tribi`/`novitadi`/`etadi`/`virti`/`novite`/`ete`) son sin tilde a proposito (calco español/regularizacion). Los ejes 1 y 3 NO llevan ninguna vocal acentuada (ciglio/sopracciglio/paio/lenzuolo/miglio/ciglia; bar/computer/autobus — todas grafia llana). **Verificacion final en Task 2: las 4 acentuadas con su tilde grave correcta.**
- **Apostrofes:** la unica posible elision es `Un'età` (recomendacion de materializacion del eje 2) con apostrofo **ASCII U+0027** (no smart-quote). El resto usa articulo/numeral entero (Un/Una/Due). Verificacion final en Task 2: solo U+0027.
- **Smart-quotes:** ninguna superficie usa comillas tipograficas U+2018/U+2019/U+201C/U+201D. Verificacion final en Task 2: `grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` = 0 sobre el JSON.
- **Markdown:** ningun prompt usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio.
- **Mecanica de prompt:** los prompts espejan los slots destino de 27-01: `Un X, due ___.` (sing->plur) y `Due X, un ___.` (inverso). NO usan flecha `→` (los slots destino de sovrabbondanti/invariabili de 27-01 usan la mecanica `Un X, due ___`, no flecha — CONSISTENCIA con el slot destino). Re-verificar en Task 2.
- **Gloss ES (R7 canon):** NINGUNA de las 13 superficies necesita gloss "(en español: ...)" — no hay doble-validez (cada plural/invariable tiene una sola forma correcta; el contexto `Un X, due ___` desambigua el numero). Las palabras con doble plural semantico (muro/frutto) fueron DESCARTADAS justamente para no necesitar gloss. No se usa gloss en este set. (Si el autor reintroduce muro/frutto, requeririan gloss ES para fijar el sentido.)
- **D-27-06:** las variantes nuevas NO llevan explanation propia (comparten la del slot), asi que NINGUNA referencia las categorias Genere e numero / Articoli por id ni prosa. Las superficies usan `Un`/`Una`/`Due`/`l'` como contenido del ejercicio (el numero/articulo del propio sustantivo, valido — NO remite a la categoria Genere e numero ni Articoli; es la mecanica del slot).
- **R1 (sin leak):** verificado superficie a superficie — ningun prompt contiene la regla (`-o→-a`, `(invariable)`, `(sobreabundante)`, etc.) ni la forma correcta. Los prompts son la frase `Un X, due ___` (o el inverso) — la mecanica del slot, sin meta-ayuda.
- **R5 (3+ valores distintos):** verificado — 12 de las 13 superficies tienen 4 options con 4 valores distintos. **EXCEPCION a corregir:** `tmp-sost-acc-virtu` se propuso con la respuesta duplicada en options ([virtù, virtù, ...]) — VIOLA R5; **CORREGIDO en la nota de materializacion del eje 2** (options = `["virtudi", "virtù", "virtùe", "virti"]`, correctIndex 1). Re-verificar en Task 2 al materializar.

---

## Resultados del quórum cross-vendor (Task 2 — 1-por-1, NUNCA batched)

**13/13 superficies VALIDADAS** (gate D-17-07: >=4x correcta, 0 incorrecta, >=2 externos `by` distintos). Base canónica Claude Opus 4.8 (`claude-opus-4-7`) + Sonnet 4.6 (`claude-sonnet-4-6`) vía `claude -p` headless (fallback D-19-08); refuerzo externos Gemini/DeepSeek vía `validate-ai-pass.mjs` (Gemini agotó cuota 429 en varias → cubierto con deepseek-chat + deepseek-reasoner como 2 `by` distintos).

| id temporal | slot destino | status | passes (by:verdict) | reformulado? |
|-------------|--------------|--------|---------------------|--------------|
| tmp-sost-sovrab-ciglio | sovrabbondanti | validated | opus✓ sonnet✓ gemini✓ deepseek-chat✓ | **SÍ** (R7 doble-validez `cigli`=bordes → contexto anatómico + gloss ES + concordancia `corte`) |
| tmp-sost-sovrab-sopracciglio | sovrabbondanti | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | **SÍ** (R7: `sopraccigli` masc marginal-válido → frame de concordancia `Le sue ___ folte` + gloss ES) |
| tmp-sost-sovrab-paio | sovrabbondanti | validated | opus✓ sonnet✓ gemini✓ deepseek-chat✓ | no |
| tmp-sost-sovrab-lenzuolo | sovrabbondanti | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | **SÍ** (R7: `lenzuoli` masc válido → contexto cama colectivo `Le ___ del letto matrimoniale` + gloss ES) |
| tmp-sost-sovrab-miglio | sovrabbondanti | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | **SÍ** (R7: `migli`=mijo válido → contexto de distancia `percorrere molte ___` + gloss ES) |
| tmp-sost-sovrab-ciglio-inv | sovrabbondanti | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |
| tmp-sost-acc-virtu | invariabili-accentate | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | (fix checkpoint R5: options 4 distintas, correctIndex 1) |
| tmp-sost-acc-tribu | invariabili-accentate | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |
| tmp-sost-acc-novita | invariabili-accentate | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |
| tmp-sost-acc-eta | invariabili-accentate | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | (fix checkpoint: prompt `Un'età` U+0027) |
| tmp-sost-stra-bar | invariabili-straniere | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |
| tmp-sost-stra-computer | invariabili-straniere | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |
| tmp-sost-stra-autobus | invariabili-straniere | validated | opus✓ sonnet✓ deepseek-chat✓ deepseek-reasoner✓ | no |

**Bugs reales cazados por el quórum (4, todos R7 doble-validez en el eje 1 sovrabbondanti):** ciglio (`cigli`=bordes), sopracciglio (`sopraccigli` masc marginal), lenzuolo (`lenzuoli` masc sueltas), miglio (`migli`=mijo). Todos resueltos por REFORMULACIÓN (calidad > tokens, NO override-atajo): contexto/concordancia que fija una sola lectura + gloss ES canon R7. Re-validados desde cero, 4x correcta. **0 superficies descartadas en validación** (las descartadas muro/frutto/budello fueron pre-quórum en Task 1). Las 2 invariables acentuadas con fix de checkpoint (virtù R5, età apóstrofo) pasaron limpias.

## Conteo final determinable (driver de 27-03)

- Slots actuales tras 27-01: **5** (5 MC: 3 bloque regla + 1 cambio-radice + 1 plurali-regolari).
- Slots nuevos en 27-02: **+0** (todos los ejes engordan slots existentes; recomendacion: sin slots nuevos).
- **Conteo final proyectado: 5 slots** (sin cambio; las 13 variantes nuevas NO suben `data.exercises.length`). Si el autor aprueba algun slot nuevo, subiria el count y requeriria validation top-level (D-19-09).
- Variantes nuevas totales: **13** (6 eje 1 sovrabbondanti [5 directas + 1 inverso] + 4 eje 2 invariabili-accentate + 3 eje 3 invariabili-straniere).
- De esas 13, **0 son de slots nuevos** (todas engordan slots del bloque regla existentes).
- Conteo de variantes por slot tras 27-02 (si se aprueban las 13): `sovrabbondanti` 10 -> **16**; `invariabili-accentate` 3 -> **7**; `invariabili-straniere` 2 -> **5**; `cambio-radice` 8 -> **8** (intacto); `plurali-regolari` 8 -> **8** (intacto).
- Coste de quorum: 13 superficies x 4 pases (opus + sonnet + 2 externos by distintos) = 52 invocaciones, 1-por-1, NUNCA batched.

> Set GENEROSO (D-27-03) pero sin cuota fija: SOLO el bloque regla (las reglas con variantes intercambiables); el bloque lexico (cambio-radice) y el de contraste (plurali-regolari) NO reciben variantes (SOST-01/D-27-05, documentado arriba). Palabras del legacy NO duplicadas (verificacion arriba: ciglio/sopracciglio/paio/lenzuolo/miglio frescos en sovrabbondanti; virtu/tribu/novita/eta frescos en acentuadas; bar/computer/autobus frescos en extranjeras). Dobles plurales con matiz semantico (muro/frutto) y literarios (budello/cervello) DESCARTADOS. Cada palabra lleva su VERIFICACION explicita de la forma plural real (D-27-04); el quorum cross-vendor caza cualquier plural inventado o invariabilidad erronea ANTES de entrar al slot (la trampa central: el plural sobreabundante en -a vs el regular masc en -i; la invariabilidad acentuada/extranjera vs el calco flexionado/-s). NO se crean cruces 300..305 (no existen para Sostantivi irregolari). El set sigue 100% MC. NO snapshot (avere-only, no aplica re-base D-88).
