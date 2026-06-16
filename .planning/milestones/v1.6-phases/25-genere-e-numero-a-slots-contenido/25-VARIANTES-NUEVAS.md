# 25-VARIANTES-NUEVAS.md — Genere e numero: superficies nuevas propuestas (Task 1)

**Fase:** 25-genere-e-numero-a-slots-contenido · **Plan:** 25-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 24-VARIANTES-NUEVAS.md (Verbi di movimento) / 23-VARIANTES-NUEVAS.md (Essere) — engorde de slots por los 4 EJES DE HUECOS PRIORIZADOS (D-25-04, el autor marco los 4).
**Decisiones aplicadas:** D-25-04 (ambicion GENEROSA, sin cuota fija; VERIFICAR la forma real de plural/femenino de cada palabra), D-25-02 (explanations sin refs a la CATEGORIA Articoli por id ni prosa; el articulo como contenido del ejercicio es valido), D-25-08 (superficies movidas en 25-01 NO se re-validan), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots NUEVOS), R1-R7 (sin leak en prompt, options 3+ valores distintos, una sola respuesta valida).

> Estado del JSON tras 25-01: **12 slots** (10 MC + 2 match). Los slots MC que engordan los 4 ejes son: `genero-numero-invariabili` (5 vars), `genero-numero-plurale-co-chi` (7 vars), `genero-numero-femminile-trice` (4 vars), `genero-numero-femminile-essa` (4 vars), `genero-numero-plurale-o-i` (3), `genero-numero-plurale-a-e` (3), `genero-numero-plurale-e-i` (4). Los 4 ejes de huecos D-25-04 cierran huecos pedagogicos especificos sin tocar las explanations de slot.

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 17**
**Slots NUEVOS: 0** — los 4 ejes engordan los slots MC existentes de 25-01. NO se necesita ningun slot nuevo (ver seccion "Recomendacion: sin slots nuevos"). El count de 25-03 NO sube por este plan (las variantes no suben `data.exercises.length`; solo subirian los slots nuevos, y aqui no hay).

| Eje | Slot destino | Superficies | Palabras | Slot nuevo? |
|-----|--------------|-------------|----------|-------------|
| 1 — INVARIABLES (acentuados + extranjerismos) | `genero-numero-invariabili` (engorde) | 5 | virtu, liberta, qualita, sport, bar | no |
| 2 — PLURAL -co/-go sonido duro CON EXCEPCION | `genero-numero-plurale-co-chi` (engorde) | 5 | amico (EXCEPCION pierde), greco, nemico vs lago, gioco | no |
| 3 — GENERO -tore/-trice vs -e/-essa | `genero-numero-femminile-trice` (engorde) + `genero-numero-femminile-essa` (engorde) | 4 | direttore, pittore (-trice) · barone, conte (-essa) | no |
| 4 — PLURAL base -o/-a/-e | `genero-numero-plurale-o-i` + `-a-e` + `-e-i` (engorde) | 3 | gatto (-o), porta (-a), fiore (-e) | no |

**Conteo por eje:** Eje 1 = 5 · Eje 2 = 5 · Eje 3 = 4 · Eje 4 = 3 → **17 superficies nuevas, 0 slots nuevos.**

**Nota sobre la trampa (D-25-04):** la trampa A1 estrella se teje en las **distractoras** de cada superficie:
- Eje 1: el **calco espanol -s** (`virtus`/`sports`) + plurales inventados (`virtue`/`virtui`) como distractoras; respuesta = la MISMA forma.
- Eje 2: el **plural equivocado** (`amichi` cuando lo correcto es `amici`; `laghi` correcto vs `lagi`/`laghie` errones) — el contraste CONSERVA/PIERDE el sonido duro.
- Eje 3: la **feminizacion cruzada** (`-essa` donde va `-trice` y viceversa; `-a` generico).
- Eje 4: el **calco -s** + la regla cruzada (`gatte` fem cuando es masc, `porti` masc cuando es fem).

Las explanations de los slots existentes NO se tocan (las variantes nuevas comparten la explanation del slot, sin explanation propia — D-25-05).

**Palabras DESCARTADAS / decisiones de scope (D-25-04, no inflar; sin irregulares puros Phase 27):**
- **uomo/uomini, mano/mani, uovo/uova:** DESCARTADOS — son irregulares puros, pertenecen a Sostantivi irregolari (Phase 27), OUT of scope (D-25-04 explicito).
- **universita/citta/caffe (eje 1):** ya estan en el slot `invariabili` tras 25-01 (no se duplican); el engorde aporta acentuados NUEVOS (virtu, liberta, qualita) + extranjerismos NUEVOS (sport, bar).
- **computer/autobus (eje 1):** invariables validos, pero se materializan 2 extranjerismos (sport, bar) por A1-frecuencia; computer/autobus quedan documentados como cubiertos por la regla (extranjerismo en consonante = invariable) sin gastar quorum extra. Si el autor los quiere, el quorum los confirmaria.
- **medico (eje 2):** medico->medici PIERDE el sonido (correcto), pero se prioriza amico/greco/nemico como los 3 casos-perdida + lago/gioco como los 2 casos-conserva, para un contraste limpio CONSERVA-vs-PIERDE. medico queda documentado (pierde, como amico).
- **albergo/parco/cuoco (eje 2):** ya estan en el slot tras 25-01 como casos CONSERVA (con H). El engorde aporta la EXCEPCION amico->amici (PIERDE, sin H) que NO esta en el legacy + 2 conserva nuevos (lago, gioco) para que la excepcion contraste contra casos frescos.
- **studente/professore/dottore (eje 3):** ya estan en `femminile-essa` tras 25-01. attore/scrittore/lavoratore ya estan en `femminile-trice`. El engorde aporta -tore NUEVOS (direttore, pittore... ojo pittore YA esta en 25-01 -> se usa direttore + un -tore fresco) y -e/-ore NUEVOS (barone, conte).

> **Correccion de scope tras leer el JSON de 25-01:** `pittore->pittrice` y `lavoratore->lavoratrice` YA son variantes del slot `femminile-trice`; `professore`/`dottore`/`studente` YA estan en `femminile-essa`. Para NO duplicar, el eje 3 usa **direttore->direttrice** y **un -tore fresco** para -trice, y **barone->baronessa + conte->contessa** para -essa (palabras NO presentes en el legacy).

---

## EJE 1 — INVARIABLES (slot existente `genero-numero-invariabili`, D-25-04 eje a PRIORIZADO)

**HUECO:** el slot invariabili hoy drillea caffe/citta/universita/film. Faltan mas acentuados (-a/-u finales) y mas extranjerismos en consonante, todos invariables, para matar el calco -s del hispanohablante con mas variedad lexica. El hueco es que la respuesta correcta = la MISMA forma del singular (invariable). Distractoras = el calco -s + plurales inventados. Verificado R1 (el prompt NO contiene la respuesta — repite el sustantivo en singular tras "due", que es la mecanica del slot, no leak de la regla) y R5 (4 options, valores distintos).

| id temporal | slot destino | palabra | prompt | options | correctIndex | justificacion + VERIFICACION de la invariabilidad |
|-------------|--------------|---------|--------|---------|--------------|----------------------------------------------------|
| `tmp-gn-inv-virtu` | `genero-numero-invariabili` | virtu | `Una virtu, due ___.` | `["virtu","virtus","virtue","virtui"]` | 0 | **VERIFICACION:** virtu termina en vocal acentuada -u (virtu) -> INVARIABLE; plural = singular = `virtu`. R1: el prompt no leak (repite el patron "Una X, due ___" del slot). R5: distractora `virtus`=calco -s (la trampa A1), `virtue`/`virtui`=plurales inventados. Respuesta unica. |
| `tmp-gn-inv-liberta` | `genero-numero-invariabili` | liberta | `Una liberta, due ___.` | `["libertas","liberte","liberta","libertai"]` | 2 | **VERIFICACION:** liberta termina en -a acentuada (liberta) -> INVARIABLE; plural = `liberta`. R1: sin leak. R5: distractora `libertas`=calco -s, `liberte`=falso plural fem -a->-e (NO aplica: la -a esta acentuada), `libertai`=inventado. Respuesta unica. |
| `tmp-gn-inv-qualita` | `genero-numero-invariabili` | qualita | `Una qualita, due ___.` | `["qualita","qualitas","qualite","qualitadi"]` | 0 | **VERIFICACION:** qualita termina en -a acentuada (qualita) -> INVARIABLE; plural = `qualita`. R1: sin leak. R5: distractora `qualitas`=calco -s, `qualite`=falso -a->-e, `qualitadi`=inventado. Respuesta unica. |
| `tmp-gn-inv-sport` | `genero-numero-invariabili` | sport | `Uno sport, due ___.` | `["sporti","sport","sports","sporte"]` | 1 | **VERIFICACION:** sport es extranjerismo terminado en consonante -> INVARIABLE en italiano; plural = `sport`. R1: sin leak. R5: distractora `sports`=calco ingles/espanol -s (la trampa: en ingles SI es sports), `sporti`/`sporte`=plurales italianos inventados. Respuesta unica. `Uno sport` por s+cons. |
| `tmp-gn-inv-bar` | `genero-numero-invariabili` | bar | `Un bar, due ___.` | `["bari","bars","bar","bare"]` | 2 | **VERIFICACION:** bar es extranjerismo terminado en consonante -> INVARIABLE; plural = `bar`. R1: sin leak. R5: distractora `bars`=calco -s, `bari`/`bare`=plurales inventados (`bari` ademas es topónimo, refuerza que NO es el plural). Respuesta unica. |

**Verificacion italiana A1 (resumen Eje 1):** virtu (-u acentuada), liberta (-a acentuada), qualita (-a acentuada) = INVARIABLES (las vocales acentuadas finales nunca cambian); sport, bar = extranjerismos en consonante = INVARIABLES (a diferencia del ingles, el italiano NO toma -s). Las distractoras `-s` materializan el calco A1 estrella del hispanohablante. El quorum cross-vendor confirma la invariabilidad de cada palabra (D-25-04). NINGUNA palabra es irregular puro.

---

## EJE 2 — PLURAL -co/-go sonido duro CON SU EXCEPCION (slot existente `genero-numero-plurale-co-chi`, D-25-04 eje b PRIORIZADO)

**HUECO:** el slot sonido-duro hoy drillea cuoco/albergo/amica/parco — todos casos CONSERVA (insertan H: cuochi/alberghi/amiche/parchi). FALTA la EXCEPCION estrella **amico->amici** (PIERDE el sonido /k/, NO inserta H) + mas casos-perdida (greco->greci, nemico->nemici) contrastados con casos-conserva frescos (lago->laghi, gioco->giochi). El hueco es la **forma del plural**, que depende de si la palabra conserva o pierde el sonido duro (regla NO totalmente predecible). Distractora = el plural equivocado (amichi cuando es amici; lagi cuando es laghi). Verificado R1/R5; **el plural real de cada palabra VERIFICADO** (la trampa de la fase).

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION del plural real |
|-------------|--------------|-----------------|--------|---------|--------------|-----------------------------------------------|
| `tmp-gn-co-amico` | `genero-numero-plurale-co-chi` | amico / PIERDE (EXCEPCION) | `Un amico, due ___.` | `["amichi","amici","amicos","amice"]` | 1 | **VERIFICACION CRITICA:** amico PIERDE el sonido duro -> plural `amici` (SIN h, /tʃ/ suave). Es la EXCEPCION estrella, NO esta en el legacy. R1: sin leak. R5: distractora `amichi`=el plural CON h equivocado (lo que el alumno aplica por la regla general), `amicos`=calco -s, `amice`=inventado. Respuesta unica. La distractora `amichi` es justo la trampa (parece seguir la regla CON H pero amico es excepcion). |
| `tmp-gn-co-greco` | `genero-numero-plurale-co-chi` | greco / PIERDE | `Un greco, due ___.` | `["grechi","greci","grecos","grece"]` | 1 | **VERIFICACION:** greco (griego) PIERDE el sonido -> plural `greci` (SIN h). R1: sin leak. R5: distractora `grechi`=plural CON h equivocado, `grecos`=calco -s, `grece`=inventado. Respuesta unica. Caso-perdida como amico. |
| `tmp-gn-co-nemico` | `genero-numero-plurale-co-chi` | nemico / PIERDE | `Un nemico, due ___.` | `["nemici","nemichi","nemicos","nemice"]` | 0 | **VERIFICACION:** nemico (enemigo) PIERDE el sonido -> plural `nemici` (SIN h). R1: sin leak. R5: distractora `nemichi`=plural CON h equivocado, `nemicos`=calco -s, `nemice`=inventado. Respuesta unica. Tercer caso-perdida. |
| `tmp-gn-co-lago` | `genero-numero-plurale-co-chi` | lago / CONSERVA | `Un lago, due ___.` | `["lagi","laghi","lagos","laghe"]` | 1 | **VERIFICACION:** lago CONSERVA el sonido duro /g/ -> plural `laghi` (CON h). R1: sin leak. R5: distractora `lagi`=plural SIN h equivocado (sonaria /dʒ/ suave), `lagos`=calco -s, `laghe`=inventado fem. Respuesta unica. Caso-conserva en -go, contrasta con la perdida de amico/greco/nemico. |
| `tmp-gn-co-gioco` | `genero-numero-plurale-co-chi` | gioco / CONSERVA | `Un gioco, due ___.` | `["gioci","giochi","giocos","gioche"]` | 1 | **VERIFICACION:** gioco (juego) CONSERVA el sonido duro /k/ -> plural `giochi` (CON h). R1: sin leak. R5: distractora `gioci`=plural SIN h equivocado, `giocos`=calco -s, `gioche`=inventado. Respuesta unica. Caso-conserva en -co, contrasta con la excepcion amico->amici. |

**Verificacion italiana A1 (resumen Eje 2):** la regla del sonido duro NO es totalmente predecible — por eso se VERIFICA cada palabra (D-25-04):
- **PIERDEN el sonido (plural SIN h, -ci/-gi):** amico->amici, greco->greci, nemico->nemici (tambien medico->medici, porco->porci — documentados, no materializados).
- **CONSERVAN el sonido (plural CON h, -chi/-ghi):** lago->laghi, gioco->giochi (tambien parco->parchi, cuoco->cuochi, albergo->alberghi, fuoco->fuochi — ya en el slot o documentados).
La EXCEPCION amico->amici es la trampa estrella y entra explicitamente. Las distractoras `amichi`/`grechi`/`lagi` materializan el plural equivocado (aplicar la regla general donde hay excepcion, o quitar la h donde se conserva). El quorum cross-vendor confirma cada plural ANTES de entrar (DeepSeek estricto en acentos/formas; D-25-04). NINGUNA palabra es irregular puro.

---

## EJE 3 — GENERO -tore/-trice vs -e/-essa (slots existentes `femminile-trice` y `femminile-essa`, D-25-04 eje c PRIORIZADO)

**HUECO:** el slot trice hoy drillea attore/scrittore/pittore/lavoratore; el slot essa drillea dottore/professore/studente. FALTA mas contraste de cuando cada sufijo, con palabras NUEVAS (no duplicar las del legacy). El hueco es la **forma del femenino**; respuesta = el femenino correcto. Distractora = la feminizacion cruzada (-essa donde va -trice y viceversa) + el -a generico. Verificado R1 (el prompt fija el masculino sin leak del sufijo) / R5 (4 formas distintas) / R7 (una valida). **El sufijo real de cada palabra VERIFICADO.**

| id temporal | slot destino | palabra / sufijo | prompt | options | correctIndex | justificacion + VERIFICACION del sufijo real |
|-------------|--------------|------------------|--------|---------|--------------|-----------------------------------------------|
| `tmp-gn-trice-direttore` | `genero-numero-femminile-trice` | direttore / -tore->-trice | `Il direttore -> la ___.` | `["direttora","direttoressa","direttrice","direttora"]` | 2 | **VERIFICACION:** direttore termina en -tore -> femenino `direttrice` (-tore->-trice, patron productivo fijo). R1: el prompt fija el masculino, no el sufijo. R5: distractora `direttoressa`=cruce -essa (incorrecto, -tore NO usa -essa), `direttora`=-a generico antinatural. Respuesta unica. Palabra NUEVA (no en legacy). NOTA: dos distractoras `direttora` iguales -> CORREGIR a 3+ distintas en la materializacion (ver scan). |
| `tmp-gn-trice-pescatore` | `genero-numero-femminile-trice` | pescatore / -tore->-trice | `Il pescatore -> la ___.` | `["pescatora","pescatoressa","pescatrice","pescatora"]` | 2 | **VERIFICACION:** pescatore (pescador) termina en -tore -> femenino `pescatrice` (-tore->-trice). R1: sin leak. R5: distractora `pescatoressa`=cruce -essa, `pescatora`=-a generico. Respuesta unica. Palabra NUEVA. NOTA: dos `pescatora` iguales -> CORREGIR a 3+ distintas. |
| `tmp-gn-essa-barone` | `genero-numero-femminile-essa` | barone / -e->-essa | `Il barone -> la ___.` | `["barona","baronessa","baronessa","baronrice"]` | 1 | **VERIFICACION:** barone (baron) termina en -e (titulo) -> femenino `baronessa` (-e->-essa). R1: sin leak. R5: distractora `barona`=-a generico antinatural, `baronrice`/`baronessa-trice` cruce. NOTA: duplicado `baronessa` -> CORREGIR a 3+ distintas. Palabra NUEVA. |
| `tmp-gn-essa-conte` | `genero-numero-femminile-essa` | conte / -e->-essa | `Il conte -> la ___.` | `["conta","contrice","contessa","contessa"]` | 2 | **VERIFICACION:** conte (conde) termina en -e (titulo) -> femenino `contessa` (-e->-essa). R1: sin leak. R5: distractora `conta`=-a generico, `contrice`=cruce -trice incorrecto. NOTA: duplicado `contessa` -> CORREGIR a 3+ distintas. Palabra NUEVA. |

> **CORRECCION OBLIGATORIA EN LA MATERIALIZACION (Task 2):** las 4 superficies del eje 3 arriba tienen un option duplicado por error de redaccion en la propuesta. R5 exige **options con 3+ valores distintos**. En Task 2 se materializan con 4 options TODAS distintas, por ejemplo:
> - direttore: `["direttora","direttoressa","direttrice","direttoressae"]` o mejor `["direttora","direttoressa","direttrice","direttora-essa"]` -> usar `["direttora","direttoressa","direttrice","direttoria"]` (4 distintas).
> - pescatore: `["pescatora","pescatoressa","pescatrice","pescatora-trice"]` -> usar `["pescatora","pescatoressa","pescatrice","pescatoria"]`.
> - barone: `["barona","baronessa","baronrice","baronetta"]` (4 distintas; respuesta `baronessa` idx 1).
> - conte: `["conta","contrice","contessa","contina"]` (4 distintas; respuesta `contessa` idx 2).
> El autor revisa estas listas corregidas en el checkpoint; el quorum valida la forma FINAL con 4 options distintas.

**Verificacion italiana A1 (resumen Eje 3):** direttore->direttrice, pescatore->pescatrice (familia -tore->-trice, mecanica); barone->baronessa, conte->contessa (familia -e/titulo->-essa). El contraste es: -tore SIEMPRE -trice; -e/titulo->-essa. Las distractoras cruzan los sufijos (la trampa: aplicar -essa a un -tore o -trice a un -e). El quorum confirma cada sufijo (D-25-04). NINGUNA es irregular puro. Palabras NUEVAS (no duplican el legacy: attore/scrittore/pittore/lavoratore ya en trice; dottore/professore/studente ya en essa).

---

## EJE 4 — PLURAL base -o/-a/-e (slots existentes `plurale-o-i`, `plurale-a-e`, `plurale-e-i`, D-25-04 eje d)

**HUECO:** los slots de plural regular son ricos pero el autor pidio mas variedad lexica para que el examen no memorice por palabra. El hueco es la **forma del plural regular**; respuesta = el plural. Distractora = el calco -s + la regla cruzada (terminacion de otro genero). Verificado R1/R5; plural y genero VERIFICADOS.

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION del plural y genero |
|-------------|--------------|-----------------|--------|---------|--------------|---------------------------------------------------|
| `tmp-gn-oi-gatto` | `genero-numero-plurale-o-i` | gatto / masc -o->-i | `Un gatto, due ___.` | `["gatte","gatti","gattos","gatto"]` | 1 | **VERIFICACION:** gatto es masc en -o -> plural `gatti` (-o->-i). R1: sin leak. R5: distractora `gatte`=regla fem -e cruzada (gatto es masc, no fem), `gattos`=calco -s, `gatto`=sin cambiar. Respuesta unica. Palabra NUEVA (gatto/gatti; el slot tenia ragazzo/libro). |
| `tmp-gn-ae-porta` | `genero-numero-plurale-a-e` | porta / fem -a->-e | `Una porta, due ___.` | `["porti","porte","portas","porta"]` | 1 | **VERIFICACION:** porta es fem en -a -> plural `porte` (-a->-e). R1: sin leak. R5: distractora `porti`=regla masc -i cruzada (porta es fem; ademas `porti` existe como verbo, refuerza el error), `portas`=calco -s, `porta`=sin cambiar. Respuesta unica. Palabra NUEVA (el slot tenia casa/mela). |
| `tmp-gn-ei-fiore` | `genero-numero-plurale-e-i` | fiore / masc -e->-i | `Un fiore, due ___.` | `["fiore","fiori","fiores","fiora"]` | 1 | **VERIFICACION:** fiore es masc en -e -> plural `fiori` (-e->-i). R1: sin leak. R5: distractora `fiore`=sin cambiar, `fiores`=calco -s, `fiora`=falso fem -a (fiore no es fem). Respuesta unica. Palabra NUEVA (el slot tenia padre/madre/studente/cane). |

**Verificacion italiana A1 (resumen Eje 4):** gatto (masc -o) -> gatti; porta (fem -a) -> porte; fiore (masc -e) -> fiori. Reglas regulares puras. Las distractoras materializan el calco -s y la regla cruzada (aplicar la terminacion del otro genero). El quorum confirma plural y genero (D-25-04). Palabras NUEVAS que no duplican el legacy.

---

## Recomendacion: SIN slots nuevos (surfaceada al autor)

**Recomendacion del planner/executor: NO crear ningun slot nuevo.** Los 4 ejes de huecos D-25-04 engordan limpiamente los slots MC existentes de 25-01:

- Eje 1 (invariables) -> `genero-numero-invariabili` (misma regla: vocal acentuada final / extranjerismo en consonante -> invariable; virtu/liberta/qualita/sport/bar son mas instancias intercambiables).
- Eje 2 (sonido duro con excepcion) -> `genero-numero-plurale-co-chi` (misma regla: -co/-go con su comportamiento del sonido duro; la EXCEPCION amico->amici es justo el corazon de esa regla — pertenece al slot, no a uno nuevo). NO crear un slot aparte para la excepcion: difuminaria que es la MISMA familia -co con un comportamiento especial. La explanation del slot ya menciona el contraste amico->amici (SIN h) vs amica->amiche (CON h) — la variante amico->amici la materializa.
- Eje 3 (genero -tore/-trice vs -e/-essa) -> sus DOS slots existentes `femminile-trice` y `femminile-essa` (cada sufijo a su slot; direttore/pescatore->trice, barone/conte->essa).
- Eje 4 (plural base) -> los tres slots `plurale-o-i` / `plurale-a-e` / `plurale-e-i` (mas instancias de cada regla regular).

Crear slots nuevos seria sobre-fragmentar reglas que ya tienen su slot. Cada slot existente ya tiene su `validation` top-level de 25-01 (de las superficies fuente, quorum limpio 2026-05-27), que cubre la gate VAL_07_STRICT a nivel de slot — NO se degrada. **El autor confirma en el checkpoint o pide algun slot nuevo** (lo cual subiria el count de 25-03 y requeriria validation top-level propia, D-19-09).

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Acentos italianos:** virtu, liberta, qualita llevan **vocal acentuada final** (virtu = virtù con tilde grave; liberta = libertà; qualita = qualità). En la materializacion del JSON (Task 2) se escriben con la grafia italiana correcta acentuada: `virtù`, `libertà`, `qualità` en prompt Y en options (la respuesta correcta es la palabra acentuada identica al singular). Este es el punto donde DeepSeek es estricto — la respuesta correcta DEBE llevar el acento.
- **Apostrofes:** ninguna superficie de este set usa apostrofo (no hay elisiones tipo l'amico en estas superficies; "Un amico" del eje 2 usa articulo entero, no elision, porque el foco es el plural no el articulo). Si alguna materializacion necesitara apostrofo seria ASCII U+0027.
- **Smart-quotes:** ninguna superficie usa comillas tipograficas U+2018/U+2019/U+201C/U+201D. Verificacion final en Task 2: `grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` = 0 sobre el JSON.
- **Markdown:** ningun prompt usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio. La flecha `->` del eje 3 se materializa como la grafia del slot existente (`femminile-trice`/`-essa` usan `→` U+2192 en sus prompts legacy — p.ej. "L'attore → la ___"). **CONSISTENCIA:** el eje 3 usa el MISMO caracter flecha que el slot destino para no romper la homogeneidad visual; el `→` U+2192 NO es smart-quote (el grep de smart-quotes no lo captura) y ya esta presente en el slot validado de 25-01. (En esta propuesta .md se escribio `->` ASCII por legibilidad; en el JSON se usa `→` como el slot.)
- **Gloss ES (R7 canon):** NINGUNA de las 17 superficies necesita gloss "(en espanol: ...)" — no hay doble-validez (cada plural/femenino/invariable tiene una sola forma correcta; el contexto "Una X, due ___" o "Il X -> la ___" desambigua). No se usa gloss en este set.
- **D-25-02:** las variantes nuevas NO llevan explanation propia (comparten la del slot), asi que NINGUNA referencia la categoria Articoli por id ni prosa. Las superficies del eje 1/2/4 ni siquiera mencionan articulos; las del eje 3 usan `Il`/`la` como contenido del ejercicio (valido, es la concordancia de genero — NO remite a la categoria Articoli).
- **R1 (sin leak):** verificado superficie a superficie — ningun prompt contiene la regla (`-o→-i`, `(refuerzo regla...)`, `(invariable)`, etc.) ni la forma correcta. Los prompts son la frase + el blank.

**Nota de implementacion para Task 2:** al materializar cada superficie como id temporal legacy con `payload:{prompt,options,correctIndex,explanation}` para el quorum aislado, la `explanation` temporal del id legacy puede ser un placeholder minimo (el quorum valida prompt+options+correctIndex). Tras pasar el quorum, la superficie se mueve a `variants[]` del slot SIN explanation propia, compartiendo la del slot. **CORREGIR los 4 options duplicados del eje 3 a 4 valores distintos antes de validar** (ver seccion eje 3). Re-verificar el scan de smart-quotes sobre el JSON final.

---

## Conteo final determinable (driver de 25-03)

- Slots actuales tras 25-01: **12** (10 MC + 2 match).
- Slots nuevos en 25-02: **+0** (todos los ejes engordan slots existentes; recomendacion: sin slots nuevos).
- **Conteo final proyectado: 12 slots** (sin cambio; las 17 variantes nuevas NO suben `data.exercises.length`). Si el autor aprueba algun slot nuevo, subiria el count y requeriria validation top-level (D-19-09).
- Variantes nuevas totales: **17** (5 eje invariables + 5 eje sonido duro + 4 eje genero + 3 eje plural base).
- De esas 17, **0 son de slots nuevos** (todas engordan slots existentes).
- Coste de quorum: 17 superficies x 4 pases (opus + sonnet + 2 externos by distintos) = 68 invocaciones, 1-por-1, NUNCA batched.

> Set GENEROSO (D-25-04) pero sin cuota fija: no se inflan slots cuya regla no admite reformulacion (los 2 match y articolo-suono/articolo-plurale-logo quedan intactos — su engorde no era prioritario y el autor marco los 4 ejes morfologicos). Irregulares puros (uomo/mano/uovo) DESCARTADOS (Phase 27). Palabras del legacy NO duplicadas (citta/universita/caffe ya en invariabili; cuoco/albergo/parco/amica ya en sonido-duro; attore/scrittore/pittore/lavoratore ya en trice; dottore/professore/studente ya en essa). La EXCEPCION amico->amici (eje 2) es el aporte estrella (NO esta en el legacy). Cada palabra lleva su VERIFICACION explicita de la forma real (D-25-04); el quorum cross-vendor caza cualquier plural/femenino erroneo ANTES de entrar al slot (la regla del sonido duro -co/-go es la mas tramposa: amico PIERDE, lago CONSERVA). NO se crean cruces 300..305 (no existen para Genere e numero). NO se crean word-buttons. NO se convierte ningun match a MC. NO snapshot (avere-only, no aplica re-base D-88).
