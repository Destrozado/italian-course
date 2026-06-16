# 26-VARIANTES-NUEVAS.md — Professioni: superficies nuevas propuestas (Task 1)

**Fase:** 26-professioni-a-slots-contenido-l-xica · **Plan:** 26-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 25-VARIANTES-NUEVAS.md (Genere e numero) / 23-VARIANTES-NUEVAS.md (Essere) — engorde de los slots de FEMINIZACION por los 3 EJES DE HUECOS PRIORIZADOS (D-26-04, el autor los marca/afina en el checkpoint).
**Decisiones aplicadas:** D-26-04 (ambicion GENEROSA, sin cuota fija; SOLO feminizacion; VERIFICAR la forma femenina real de cada palabra), D-26-02/PROF-01 (el bloque lexico puro NO recibe variantes), D-26-05 (explanations sin refs a las CATEGORIAS Articoli/Essere/Genere por id ni prosa; el articulo/essere/plural como contenido del ejercicio es valido), D-26-10 (superficies movidas en 26-01 NO se re-validan), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots NUEVOS), D-26-11 (base de aprobacion = Claude Opus+Sonnet), R1-R7 (sin leak en prompt, options 3+ valores distintos, una sola respuesta valida).

> Estado del JSON tras 26-01: **11 slots**. Los slots de FEMINIZACION (los unicos que reciben variantes nuevas en este plan) son: `profesiones-femminile-o-a` (10 vars), `profesiones-femminile-iera` (4 vars), `profesiones-femminile-trice` (8 vars), `profesiones-femminile-essa` (4 vars), `profesiones-invariabili` (12 vars). El BLOQUE LEXICO PURO (`profesiones-comprensione`, `profesiones-luogo`, `profesiones-strumento`, `profesiones-azione`) y los demas (`profesiones-articolo-suono`, `profesiones-essere-wb`) NO reciben NINGUNA variante nueva (PROF-01/D-26-02/D-26-06).

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 13**
**Slots NUEVOS: 0** — los 3 ejes engordan los slots de feminizacion existentes de 26-01. NO se necesita ningun slot nuevo (ver seccion "Recomendacion: sin slots nuevos"). El count de 26-03 NO sube por este plan (las variantes no suben `data.exercises.length`; solo subirian los slots nuevos, y aqui no hay).

| Eje | Slot(s) destino | Superficies | Palabras | Slot nuevo? |
|-----|-----------------|-------------|----------|-------------|
| 1 — CONTRASTE -tore/-trice vs -e/-essa | `profesiones-femminile-trice` (engorde) + `profesiones-femminile-essa` (engorde) | 6 | scrittore, lettore, lavoratore (-trice) · poeta, principe, eroe (-essa) | no |
| 2 — INVARIABLES -ista/-ante | `profesiones-invariabili` (engorde) | 4 | artista, regista (-ista) · comandante, agente (-ante/-nte) | no |
| 3 — -o/-a regular y -iere/-iera | `profesiones-femminile-o-a` (engorde) + `profesiones-femminile-iera` (engorde) | 3 | maestro, operaio (-o/-a) · giardiniere (-iere/-iera) | no |

**Conteo por eje:** Eje 1 = 6 (3 trice + 3 essa) · Eje 2 = 4 · Eje 3 = 3 (2 o-a + 1 iera) → **13 superficies nuevas, 0 slots nuevos.**

**Nota sobre la trampa (D-26-04):** la trampa A1 estrella se teje en las **distractoras** de cada superficie:
- Eje 1: la **feminizacion cruzada** (`-essa` donde va `-trice` y viceversa) + el `-a` generico (scrittora) + el sufijo inventado (scrittoressa). El contraste de sufijos es la trampa A1 central: saber QUE sufijo toca.
- Eje 2: el **calco -istessa/-antessa** (artistessa, comandantessa) + feminizacion inventada (artisto) + el `-a`/`-essa` mal aplicado; respuesta = la MISMA forma (la artista).
- Eje 3: la **feminizacion prestigiosa mal aplicada** (-essa/-trice donde va el -o->-a regular o el -iere->-iera) + el plural cruzado.

Las explanations de los slots existentes NO se tocan (las variantes nuevas comparten la explanation del slot, sin explanation propia — D-26-04/D-26-05).

**Palabras DESCARTADAS / decisiones de scope (D-26-04, no inflar; verificar forma femenina real):**
- **eroe (eje 1):** eroe (heroe) -> femenino `eroina` (NO `eroessa` ni `eroatrice`). OJO: el objetivo del slot `femminile-essa` es la familia -e/-ore->-essa; `eroe` termina en -e pero su femenino es IRREGULAR `eroina`, NO -essa. **DESCARTADO del eje 1 -essa** para no contaminar la regla del slot con una irregularidad lexica (eroe->eroina no es la regla -e->-essa). Documentado aqui como descarte deliberado: si entrara, su distractora `eroessa` seria la trampa, pero la RESPUESTA `eroina` rompe la homogeneidad de la regla del slot -essa. El autor puede pedir incluirlo si quiere un slot/variante de feminizacion irregular, pero NO es la regla -e->-essa.
- **scrittore/cantautore (eje 1 -trice):** scrittore->scrittrice es -tore->-trice (correcto, A1, NO en legacy). cantautore->cantautrice tambien valido pero menos A1-frecuente; se prioriza scrittore + lettore + lavoratore (3 -tore frescos, no en legacy). cantautore documentado como cubierto por la regla.
- **autista/turista/barista (eje 2 -ista):** invariables validos (la autista, la turista, la barista), pero se priorizan artista + regista como los 2 -ista frescos mas A1-frecuentes (autista/turista/barista quedan documentados como cubiertos por la regla -ista invariable; el autor puede pedir mas). dentista/pianista/farmacista/giornalista/tassista YA estan en el legacy -> NO duplicar.
- **dirigente (eje 2 -ante/-nte):** invariable valido (il/la dirigente), pero se priorizan comandante + agente como los 2 -ante/-nte frescos. cantante/insegnante/cliente YA estan en el legacy -> NO duplicar. dirigente documentado como cubierto por la regla.
- **infermiere (eje 3 -iere):** YA esta en el legacy (`femminile-iera`) -> NO duplicar. banchiere->banchiera y pasticciere->pasticciera son validos pero menos A1-frecuentes; se prioriza giardiniere->giardiniera (1 -iere fresco A1-claro). banchiere/pasticciere documentados como cubiertos por la regla -iere->-iera.
- **cuoco/impiegato/avvocato/segretario/poliziotto/fotografo/architetto/meccanico/chirurgo/commesso (eje 3 -o/-a):** YA estan en el legacy `femminile-o-a` -> NO duplicar. Nuevos -o/-a: maestro->maestra, operaio->operaia (NO en legacy, A1-frecuentes).

> **Verificacion de no-duplicacion (contra el JSON tras 26-01):**
> - `femminile-trice` legacy: attore, direttore, programmatore, allenatore, pittore, traduttore, ricercatore. NUEVOS: scrittore, lettore, lavoratore (ninguno duplica).
> - `femminile-essa` legacy: dottore, professore, studente. NUEVOS: poeta, principe (ninguno duplica).
> - `invariabili` legacy: cantante, insegnante, collega, cliente, dentista, pianista, farmacista, giornalista, tassista, pilota, manager. NUEVOS: artista, regista, comandante, agente (ninguno duplica).
> - `femminile-o-a` legacy: cuoco, impiegato, avvocato, segretario, poliziotto, fotografo, architetto, meccanico, chirurgo, commesso. NUEVOS: maestro, operaio (ninguno duplica).
> - `femminile-iera` legacy: cameriere, infermiere, parrucchiere, portiere. NUEVOS: giardiniere (no duplica).

---

## EJE 1 — CONTRASTE -tore/-trice vs -e/-essa (slots existentes `femminile-trice` y `femminile-essa`, D-26-04 eje 1 PRIORIZADO, la trampa A1 ESTRELLA)

**HUECO:** el slot `femminile-trice` hoy drillea attore/direttore/programmatore/allenatore/pittore/traduttore/ricercatore (agentes -tore->-trice). El slot `femminile-essa` drillea dottore/professore/studente (-e/-ore->-essa). FALTA mas contraste de cuando cada sufijo, con palabras NUEVAS. El hueco es la **forma del femenino + saber QUE sufijo toca** (la trampa A1 central). Respuesta = el femenino correcto. Distractora = la feminizacion cruzada (-essa donde va -trice y viceversa) + el -a generico + el sufijo inventado. Verificado R1 (el prompt fija el masculino, no el sufijo) / R5 (4 options distintas) / R7 (una valida). **El sufijo real de cada palabra VERIFICADO.**

### Sub-eje 1a — -tore->-trice (slot `profesiones-femminile-trice`)

| id temporal | slot destino | palabra / sufijo | prompt | options | correctIndex | justificacion + VERIFICACION del sufijo real |
|-------------|--------------|------------------|--------|---------|--------------|-----------------------------------------------|
| `tmp-prof-trice-scrittore` | `profesiones-femminile-trice` | scrittore / -tore->-trice | `Lo scrittore → la ___.` | `["scrittora","scrittoressa","scrittrice","scrittora-trice"]` | 2 | **VERIFICACION:** scrittore (escritor) termina en -tore (agente derivado de scrivere) -> femenino `scrittrice` (-tore->-trice, productivo). R1: el prompt fija el masculino, no el sufijo. R5: `scrittora`=-a generico (calco), `scrittoressa`=cruce -essa (incorrecto, -tore NO usa -essa), `scrittora-trice`=inventado hibrido. 4 distintas. Respuesta unica. Palabra NUEVA (no en legacy). `Lo scrittore` por s+cons. |
| `tmp-prof-trice-lettore` | `profesiones-femminile-trice` | lettore / -tore->-trice | `Il lettore → la ___.` | `["lettora","lettoressa","lettrice","lettoria"]` | 2 | **VERIFICACION:** lettore (lector) termina en -tore -> femenino `lettrice` (-tore->-trice). R1: sin leak. R5: `lettora`=-a generico, `lettoressa`=cruce -essa, `lettoria`=inventado. 4 distintas. Respuesta unica. Palabra NUEVA. |
| `tmp-prof-trice-lavoratore` | `profesiones-femminile-trice` | lavoratore / -tore->-trice | `Il lavoratore → la ___.` | `["lavoratora","lavoratoressa","lavoratrice","lavoratoria"]` | 2 | **VERIFICACION:** lavoratore (trabajador) termina en -tore -> femenino `lavoratrice` (-tore->-trice). R1: sin leak. R5: `lavoratora`=-a generico, `lavoratoressa`=cruce -essa, `lavoratoria`=inventado. 4 distintas. Respuesta unica. Palabra NUEVA. |

### Sub-eje 1b — -e/-ore->-essa (slot `profesiones-femminile-essa`)

| id temporal | slot destino | palabra / sufijo | prompt | options | correctIndex | justificacion + VERIFICACION del sufijo real |
|-------------|--------------|------------------|--------|---------|--------------|-----------------------------------------------|
| `tmp-prof-essa-poeta` | `profesiones-femminile-essa` | poeta / -a (masc) ->-essa | `Il poeta → la ___.` | `["poeta","poetatrice","poetessa","poeti"]` | 2 | **VERIFICACION:** poeta (poeta) es masc terminado en -a (familia atleta/pilota) PERO su femenino profesional es `poetessa` (-essa, sufijo prestigioso); NO es invariable (poetessa es la forma fem estandar A1). R1: sin leak. R5: `poeta`=invariable equivocado (la trampa: parece invariable como pilota/atleta, pero poeta SI tiene fem -essa), `poetatrice`=cruce -trice inventado, `poeti`=plural masc cruzado. 4 distintas. Respuesta unica. Palabra NUEVA. **Trampa doble: distingue poeta (->poetessa) de pilota/collega (invariables).** |
| `tmp-prof-essa-principe` | `profesiones-femminile-essa` | principe / -e->-essa | `Il principe → la ___.` | `["principa","principessa","principerice","principe"]` | 1 | **VERIFICACION:** principe (principe) termina en -e -> femenino `principessa` (-e->-essa, titulo). R1: sin leak. R5: `principa`=-a generico, `principerice`=cruce -trice inventado, `principe`=invariable equivocado. 4 distintas. Respuesta unica. Palabra NUEVA. (Titulo/dignidad, A1-claro por los cuentos.) |

> **DESCARTE eroe (documentado arriba):** eroe->eroina es IRREGULAR (NO -essa), rompe la regla del slot -essa. No se materializa como variante del slot -essa. Si el autor lo quiere, requiere decision aparte (no es la regla -e->-essa).

**Verificacion italiana A1 (resumen Eje 1):**
- **-tore->-trice (slot trice):** scrittore->scrittrice, lettore->lettrice, lavoratore->lavoratrice (agentes derivados, sufijo -trice fijo y productivo). NO usan -essa.
- **-e/-ore->-essa (slot essa):** poeta->poetessa (masc -a pero fem -essa, NO invariable), principe->principessa (-e/titulo->-essa). NO usan -trice.
El contraste central A1: saber que -tore SIEMPRE da -trice y que -e/titulo da -essa, y que poeta (pese a su -a) toma -essa (NO es invariable como pilota). Las distractoras cruzan los sufijos. El quorum cross-vendor confirma cada sufijo ANTES de entrar (D-26-04). NINGUNA palabra duplica el legacy.

---

## EJE 2 — INVARIABLES -ista/-ante (slot existente `profesiones-invariabili`, D-26-04 eje 2 PRIORIZADO, mata el calco la-dentistessa)

**HUECO:** el slot `invariabili` hoy drillea cantante/insegnante/collega/cliente/dentista/pianista/farmacista/giornalista/tassista/pilota/manager. FALTA mas variedad de -ista y -ante/-nte para reforzar que el calco -istessa/-antessa es SIEMPRE erroneo. El hueco es que la respuesta correcta = la MISMA forma del masculino (invariable); solo el articulo distingue il/la. Distractora = el calco -istessa/-antessa (la trampa A1 fuerte del hispanohablante) + feminizacion inventada (-a/-essa mal aplicado). Verificado R1 (el prompt muestra el masculino y pide el femenino, mecanica del slot, no leak de la regla) y R5 (4 options distintas). **La invariabilidad de cada palabra VERIFICADA.**

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION de la invariabilidad |
|-------------|--------------|-----------------|--------|---------|--------------|----------------------------------------------------|
| `tmp-prof-inv-artista` | `profesiones-invariabili` | artista / -ista INVARIABLE | `L'artista (masc) → l'___ (fem).` | `["artistessa","artista","artiste","artistra"]` | 1 | **VERIFICACION:** artista termina en -ista -> INVARIABLE (il artista / l'artista masc, la artista fem); el sustantivo NO cambia. R1: el prompt muestra el masculino y pide el fem (mecanica del slot, no leak). R5: `artistessa`=el calco -istessa (la trampa A1 estrella), `artiste`=falso plural/fem, `artistra`=inventado. 4 distintas. Respuesta = la MISMA forma `artista`. Palabra NUEVA. Etiqueta (masc)/(fem) por elision l' en ambos generos (R1 permite etiqueta neutra estructural). |
| `tmp-prof-inv-regista` | `profesiones-invariabili` | regista / -ista INVARIABLE | `Il regista → la ___.` | `["registessa","registe","regista","registra"]` | 2 | **VERIFICACION:** regista (director de cine/teatro) termina en -ista -> INVARIABLE (il regista / la regista). R1: sin leak. R5: `registessa`=calco -istessa, `registe`=falso plural/fem, `registra`=inventado (ademas `registra` es verbo, refuerza el error). 4 distintas. Respuesta = `regista`. Palabra NUEVA. |
| `tmp-prof-inv-comandante` | `profesiones-invariabili` | comandante / -nte INVARIABLE | `Il comandante → la ___.` | `["comandantessa","comandanta","comandante","comandatrice"]` | 2 | **VERIFICACION:** comandante (participio presente en -nte) -> INVARIABLE (il/la comandante). R1: sin leak. R5: `comandantessa`=calco -antessa, `comandanta`=-a inventado, `comandatrice`=cruce -trice inventado. 4 distintas. Respuesta = `comandante`. Palabra NUEVA. |
| `tmp-prof-inv-agente` | `profesiones-invariabili` | agente / -nte INVARIABLE | `L'agente (masc) → l'___ (fem).` | `["agentessa","agenta","agente","agentrice"]` | 2 | **VERIFICACION:** agente (participio presente en -nte) -> INVARIABLE (l'agente masc/fem). R1: el prompt muestra el masc y pide el fem (mecanica, elision l' en ambos generos justifica la etiqueta neutra). R5: `agentessa`=calco -antessa, `agenta`=-a inventado, `agentrice`=cruce -trice. 4 distintas. Respuesta = `agente`. Palabra NUEVA. |

**Verificacion italiana A1 (resumen Eje 2):** artista, regista (familia -ista, TODAS invariables) + comandante, agente (participios presentes en -nte, invariables). Solo el articulo distingue il/la (o la elision l' ante vocal). El calco -istessa/-antessa (artistessa, comandantessa) es SIEMPRE erroneo: es justo la distractora-trampa A1 del hispanohablante. El quorum confirma la invariabilidad de cada palabra (D-26-04). NINGUNA duplica el legacy.

---

## EJE 3 — -o/-a REGULAR y -iere/-iera (slots existentes `femminile-o-a` y `femminile-iera`, D-26-04 eje 3)

**HUECO:** los slots `femminile-o-a` y `femminile-iera` son ricos pero el autor pidio mas variedad lexica para que el examen no memorice por palabra. El hueco es la **forma del femenino regular**; respuesta = el femenino. Distractora = el sufijo prestigioso mal aplicado (-essa/-trice donde va el -o->-a regular o el -iere->-iera) + el plural cruzado. Verificado R1/R5; **el femenino real VERIFICADO.**

### Sub-eje 3a — -o->-a regular (slot `profesiones-femminile-o-a`)

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION del femenino real |
|-------------|--------------|-----------------|--------|---------|--------------|-------------------------------------------------|
| `tmp-prof-oa-maestro` | `profesiones-femminile-o-a` | maestro / -o->-a | `Il maestro → la ___.` | `["maestra","maestre","maestressa","maestrice"]` | 0 | **VERIFICACION:** maestro (maestro de primaria) es -o -> femenino `maestra` (-o->-a regular). R1: sin leak. R5: `maestre`=plural fem cruzado, `maestressa`=-essa mal aplicado (no es -e ni -ore), `maestrice`=-trice mal aplicado (no es -tore). 4 distintas. Respuesta unica. Palabra NUEVA. |
| `tmp-prof-oa-operaio` | `profesiones-femminile-o-a` | operaio / -o->-a | `L'operaio (masc) → l'___ (fem).` | `["operaie","operaia","operaiessa","operaitrice"]` | 1 | **VERIFICACION:** operaio (obrero) es -o (con -i- previa: opera-io) -> femenino `operaia` (-o->-a, manteniendo la i: operaia). R1: el prompt muestra el masc y pide el fem (elision l' ante vocal en ambos generos justifica la etiqueta neutra). R5: `operaie`=plural fem cruzado, `operaiessa`=-essa mal aplicado, `operaitrice`=-trice mal aplicado. 4 distintas. Respuesta unica. Palabra NUEVA. |

### Sub-eje 3b — -iere->-iera (slot `profesiones-femminile-iera`)

| id temporal | slot destino | palabra / regla | prompt | options | correctIndex | justificacion + VERIFICACION del femenino real |
|-------------|--------------|-----------------|--------|---------|--------------|-------------------------------------------------|
| `tmp-prof-iera-giardiniere` | `profesiones-femminile-iera` | giardiniere / -iere->-iera | `Il giardiniere → la ___.` | `["giardiniere","giardiniera","giardinieressa","giardinietrice"]` | 1 | **VERIFICACION:** giardiniere (jardinero) termina en -iere -> femenino `giardiniera` (-iere->-iera, como cameriere->cameriera). R1: sin leak. R5: `giardiniere`=invariable equivocado (la -iere SI flexiona), `giardinieressa`=-essa mal aplicado, `giardinietrice`=-trice inventado. 4 distintas. Respuesta unica. Palabra NUEVA. |

**Verificacion italiana A1 (resumen Eje 3):** maestro->maestra, operaio->operaia (familia -o->-a regular, la mas frecuente); giardiniere->giardiniera (familia -iere->-iera, servicio, flexiona como cameriere->cameriera). Las distractoras materializan el sufijo prestigioso mal aplicado (-essa/-trice donde toca la regla regular) y el plural cruzado. El quorum confirma cada femenino (D-26-04). NINGUNA duplica el legacy.

---

## Bloque lexico puro: SIN autoria de variantes (PROF-01/D-26-02)

**El BLOQUE LEXICO PURO de Professioni NO recibe NINGUNA variante nueva en este plan.** Esto es cumplimiento EXPLICITO de PROF-01 (la fase prohibe forzar variantes artificiales) y de D-26-02 (documentado por bloque).

Los slots que NO reciben variantes nuevas y POR QUE:

| Slot (tras 26-01) | type | Por que NO admite autoria de variantes |
|-------------------|------|-----------------------------------------|
| `profesiones-comprensione` (039/040) | multiple-choice | La pista es por SIGNIFICADO/campo lexico ("prepara piatti -> cuoca", "usa i bisturi -> chirurgo"), NO derivable por raiz ni por una regla con variantes intercambiables. Cada item es una inferencia lexica unica; "engordar" seria inventar profesiones-descripcion artificiales (PROF-01 lo prohibe). |
| `profesiones-luogo` (200) | match | Profesion <-> lugar de trabajo: asociacion lexica por campo semantico (cuoco<->cucina), NO derivable por raiz (D-04/D-26-02). El match se preserva intacto. |
| `profesiones-strumento` (201) | match | Profesion <-> herramienta: asociacion lexica (chirurgo<->bisturi), NO derivable por raiz (D-04). Match preservado. |
| `profesiones-azione` (202) | match | Profesion <-> accion/verbo: algunas etimologicas no triviales (pittore<->dipingere, direttore<->dirigere), NO derivable por raiz (D-04). Match preservado. |

**Razon de fondo (PROF-01):** "no toda celda tiene variantes intercambiables". La feminizacion ES una regla con variantes (saber que sufijo toca = una regla con N palabras intercambiables que la aplican) -> SI se autora (ejes 1-3). El lexico puro (que lugar/herramienta/accion/significado corresponde a cada profesion) NO es una regla reformulable -> NO se autora. PROF-02 se cumple asi: hay autoria donde hay regla (feminizacion), y se documenta que el lexico no la admite.

**Tampoco reciben variantes (D-26-02/D-26-05/D-26-06):**
- `profesiones-articolo-suono` (036-038, MC): articulo por sonido; queda como en 26-01 (no era prioritario; el autor no marco este eje; engordarlo pisaria la categoria Articoli/Genere, D-26-05).
- `profesiones-essere-wb` (100-104, word-buttons): los 5 WB se preservan intactos (D-26-06); no se tocan ni reciben variantes nuevas.

---

## Recomendacion: SIN slots nuevos (surfaceada al autor)

**Recomendacion del planner/executor: NO crear ningun slot nuevo.** Los 3 ejes de huecos D-26-04 engordan limpiamente los slots de feminizacion existentes de 26-01:

- Eje 1 (contraste -tore/-trice vs -e/-essa) -> sus DOS slots existentes `femminile-trice` (scrittore/lettore/lavoratore->-trice) y `femminile-essa` (poeta/principe->-essa). Cada sufijo a su slot; mas instancias intercambiables de la MISMA regla.
- Eje 2 (invariables -ista/-ante) -> `profesiones-invariabili` (misma regla: -ista/-nte = invariable; artista/regista/comandante/agente son mas instancias).
- Eje 3 (-o/-a y -iere/-iera) -> sus dos slots `femminile-o-a` (maestro/operaio) y `femminile-iera` (giardiniere).

Crear slots nuevos seria sobre-fragmentar reglas que ya tienen su slot. Cada slot de feminizacion existente ya tiene su `validation` top-level de 26-01 (de las superficies fuente, quorum limpio 2026-05-27; el slot `invariabili` ademas conserva el disputed->override del autor de collega verbatim), que cubre la gate VAL_07_STRICT a nivel de slot — NO se degrada al engordar. **El autor confirma en el checkpoint o pide algun slot nuevo** (lo cual subiria el count de 26-03 y requeriria validation top-level propia, D-19-09).

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Acentos italianos:** ninguna de las 13 superficies de este set lleva vocal acentuada final ni acento grave/agudo en la respuesta correcta (scrittrice, lettrice, lavoratrice, poetessa, principessa, artista, regista, comandante, agente, maestra, operaia, giardiniera — todas grafia llana sin tilde). NO hay punto de fallo de acento como en virtu/liberta (Genere e numero). Si alguna materializacion lo necesitara, se escribiria con la grafia italiana correcta.
- **Apostrofes:** los prompts de artista/agente/operaio usan elision `L'artista`/`L'agente`/`L'operaio` con apostrofo **ASCII U+0027** (no smart-quote). El resto usa articulo entero (Il/Lo/la). Verificacion final en Task 2: solo U+0027.
- **Smart-quotes:** ninguna superficie usa comillas tipograficas U+2018/U+2019/U+201C/U+201D. Verificacion final en Task 2: `grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` = 0 sobre el JSON.
- **Flecha:** los prompts de feminizacion usan `→` (U+2192) como los slots destino de 26-01 (p.ej. "Il cuoco → la ___", "L'attore → l'___"). **CONSISTENCIA:** este set usa el MISMO caracter flecha que el slot destino para homogeneidad visual; `→` U+2192 NO es smart-quote (el grep no lo captura) y ya esta presente en los slots validados de 26-01. (En esta propuesta .md se escribio `→` igual que el JSON.)
- **Markdown:** ningun prompt usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio.
- **Gloss ES (R7 canon):** NINGUNA de las 13 superficies necesita gloss "(en espanol: ...)" — no hay doble-validez (cada femenino/invariable tiene una sola forma correcta; el contexto "Il X → la ___" o "muestra masc, pide fem" desambigua). No se usa gloss en este set.
- **D-26-05:** las variantes nuevas NO llevan explanation propia (comparten la del slot), asi que NINGUNA referencia las categorias Articoli/Essere/Genere por id ni prosa. Las superficies usan `Il`/`Lo`/`La`/`l'` como contenido del ejercicio (la concordancia de genero del articulo, valido — NO remite a la categoria Articoli; es el articulo del propio sustantivo profesional).
- **R1 (sin leak):** verificado superficie a superficie — ningun prompt contiene la regla (`-tore→-trice`, `(invariable)`, `(regla §N)`, etc.) ni la forma correcta. Los prompts son la frase + el blank, o "muestra masc -> pide fem". Las etiquetas `(masc)`/`(fem)` solo aparecen donde la elision `l'` ante vocal hace ambiguos ambos generos (artista, agente, operaio) — etiqueta neutra estructuralmente necesaria (R1 lo permite).
- **R5 (3+ valores distintos):** verificado — TODAS las 13 superficies tienen 4 options con 4 valores distintos (a diferencia del eje 3 de Genere e numero que tuvo que corregirse). Re-verificar en Task 2 al materializar.

**Nota de implementacion para Task 2:** al materializar cada superficie como id temporal legacy con `payload:{prompt,options,correctIndex,explanation}` para el quorum aislado, la `explanation` temporal del id legacy puede ser un placeholder minimo (el quorum valida prompt+options+correctIndex). Tras pasar el quorum, la superficie se mueve a `variants[]` del slot SIN explanation propia, compartiendo la del slot. Re-verificar el scan de smart-quotes sobre el JSON final.

---

## Conteo final determinable (driver de 26-03)

- Slots actuales tras 26-01: **11** (6 MC + 3 match + 1 articolo-suono MC + 1 word-buttons; en total 7 MC + 3 match + 1 WB).
- Slots nuevos en 26-02: **+0** (todos los ejes engordan slots existentes; recomendacion: sin slots nuevos).
- **Conteo final proyectado: 11 slots** (sin cambio; las 13 variantes nuevas NO suben `data.exercises.length`). Si el autor aprueba algun slot nuevo, subiria el count y requeriria validation top-level (D-19-09).
- Variantes nuevas totales: **13** (6 eje 1 contraste [3 trice + 3 essa] + 4 eje 2 invariables + 3 eje 3 [2 o-a + 1 iera]).
- De esas 13, **0 son de slots nuevos** (todas engordan slots de feminizacion existentes).
- Coste de quorum: 13 superficies x 4 pases (opus + sonnet + 2 externos by distintos) = 52 invocaciones, 1-por-1, NUNCA batched.

> Set GENEROSO (D-26-04) pero sin cuota fija: SOLO feminizacion (la regla con variantes intercambiables); el bloque lexico puro NO recibe variantes (PROF-01, documentado arriba). No se inflan los match ni articolo-suono ni word-buttons (quedan intactos de 26-01). Palabras del legacy NO duplicadas (verificacion arriba: scrittore/lettore/lavoratore frescos en -trice; poeta/principe frescos en -essa; artista/regista/comandante/agente frescos en invariabili; maestro/operaio frescos en -o-a; giardiniere fresco en -iera). eroe DESCARTADO (eroe->eroina es irregular, no -essa). Cada palabra lleva su VERIFICACION explicita de la forma femenina real (D-26-04); el quorum cross-vendor caza cualquier feminizacion erronea ANTES de entrar al slot (la trampa central: -trice vs -essa, y el calco -istessa en invariables). NO se crean cruces 300..305 (no existen para Professioni). NO se tocan los 5 word-buttons ni los 3 match. NO snapshot (avere-only, no aplica re-base D-88).
