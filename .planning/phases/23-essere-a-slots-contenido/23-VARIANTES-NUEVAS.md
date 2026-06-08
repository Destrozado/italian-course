# 23-VARIANTES-NUEVAS.md — Essere: superficies nuevas propuestas (Task 1)

**Fase:** 23-essere-a-slots-contenido · **Plan:** 23-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 22-VARIANTES-NUEVAS.md (Avere) / 19-02 / 20-02 (Articoli / Partitivi — engorde de celdas pobres + huecos de regla + slot nuevo).
**Decisiones aplicadas:** D-23-04 (ambicion GENEROSA), D-23-05 (sin cuota fija), D-23-06 (contraste essere/avere agresivo), D-23-07 (slot NUEVO ser/estar), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots nuevos), R1-R7 (sin leak en prompt, options 3+ valores distintos, una sola respuesta valida).

> Estado del JSON tras 23-01: **25 slots**. Las celdas pobres de presente con 1 variante son `essere-sono` (io), `essere-sei` (tu), `essere-siamo` (noi), `essere-siete` (voi), `essere-sono-loro` (loro). `essere-e` (lui/lei) ya tiene 2 variantes (opcional, NO se engorda). `essere-nacionalidad` tiene 3 variantes pero le falta la matriz sistematica de concordancia.

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 14**
**Slots NUEVOS: 1** (`essere-ser-estar`, D-23-07) — sube el count de 23-03 de 25 a **26**.

| Bloque | Superficies | Destino | Slot nuevo? |
|--------|-------------|---------|-------------|
| A — Engorde 5 celdas pobres de presente (io/tu/noi/voi/loro) | 5 | slots existentes `essere-sono/sei/siamo/siete/sono-loro` (engorde a 2 variantes) | no |
| B — Concordancia de nacionalidad sistematica (masc/fem x sing/pl) | 3 | slot existente `essere-nacionalidad` (engorde a 6 variantes) | no |
| C — Localizacion con essere (in ufficio, al mare) | 2 | slots existentes `essere-e` y `essere-sono-loro` (absorbida como localizacion) | no |
| D — SLOT NUEVO ser/estar (estado vs identidad, D-23-07) | 4 | slot NUEVO `essere-ser-estar` | **SI** |

**Nota sobre la edad / contraste essere/avere (D-23-06):** el contraste agresivo essere/avere se teje en las **distractoras** (cada superficie nueva lleva una forma de avere — ho/hai/ha/abbiamo/avete/hanno — como distractora) y en la **explanation del slot nuevo ser/estar** (que explicita: el italiano usa essere para ser y estar; la edad y las sensaciones fisicas se TIENEN con avere, no se SON con essere). NO se materializa una variante explicita de edad: el cruce `essere-300` ya contrasta "e medico + ha trent'anni" y el slot `essere-stato` ya menciona "ho fame / ho caldo" en su explanation. Duplicarlo seria redundante (conservador en lo ya cubierto, generoso en los huecos reales).

**Nota sobre la localizacion (Bloque C):** NO se crea un slot de localizacion separado. El autor mantuvo en 23-01 los slots de presente por persona; la localizacion con essere se absorbe como variante del slot de la persona que toca (D-23-04 menciona "como variantes de `essere-siamo`/`essere-e`/`essere-sono` o un slot de localizacion si el autor separa"). Recomendacion del planner: **absorber como variantes** (sin slot nuevo de localizacion) — el falso amigo estar->essere ya esta en la explanation de `essere-siamo` y `essere-sono-loro`. **El autor decide en el checkpoint si prefiere un slot de localizacion dedicado.**

---

## Bloque A — Engorde de las 5 celdas pobres de presente indicativo (D-23-04, D-23-05)

Cada slot de presente por persona (salvo `essere-e`, que ya tiene 2) tiene hoy 1 variante. Se anade 1 variante nueva por slot que reformula la **MISMA persona/forma** con otro sujeto/contexto A1 natural y respuesta inequivoca. La nueva variante comparte la explanation del slot (NO lleva explanation propia). Verificado R1 (el prompt no contiene la forma correcta de essere) y R5 (4 options, valores distintos, con una distractora de avere — D-23-06).

| id temporal | slot destino | persona/forma | prompt | options | correctIndex | justificacion (R1/R5/R7 + essere-no-avere) |
|-------------|--------------|---------------|--------|---------|--------------|---------------|
| `tmp-essere-sono-2` | `essere-sono` | io / sono | `Io ___ uno studente di italiano.` | `["sei","sono","ho","è"]` | 1 | io (1a sing) pide sono inequivocamente; identidad/rol con essere (no avere); contexto distinto al "Io sono Maria" de la variante 1 (estudiante vs nombre); distractora `ho`=avere (calco 'yo tengo estudiante'); las otras formas no concuerdan con io. Respuesta unica. |
| `tmp-essere-sei-2` | `essere-sei` | tu / sei | `Tu ___ molto gentile con tutti.` | `["sono","sei","hai","è"]` | 1 | tu (2a sing) pide sei; atributo de caracter con essere (gentile = amable), distinto de la nacionalidad de la variante 1; distractora `hai`=avere; ninguna otra forma encaja con tu. Concordancia `gentile` invariable en genero. Respuesta unica. |
| `tmp-essere-siamo-2` | `essere-siamo` | noi / siamo | `Noi ___ amici da molti anni.` | `["siete","siamo","abbiamo","sono"]` | 1 | noi (1a pl) pide siamo; identidad/relacion con essere (somos amigos), distinto de la localizacion "a casa" de la variante 1; `da molti anni` = desde hace muchos anos (duracion, no fuerza otra lectura); distractora `abbiamo`=avere. Respuesta unica. |
| `tmp-essere-siete-2` | `essere-siete` | voi / siete | `Voi ___ in ritardo per la lezione.` | `["siamo","siete","avete","sono"]` | 1 | voi (2a pl) pide siete; estado/localizacion temporal con essere (estar en retraso = essere in ritardo, idiomatico fijo), distinto del "pronti?" de la variante 1; distractora `avete`=avere; el calco 'tenéis retraso' no aplica en italiano A1 estandar. Respuesta unica. |
| `tmp-essere-sono-loro-2` | `essere-sono-loro` | loro / sono | `Loro ___ i miei migliori amici.` | `["siete","hanno","sono","siamo"]` | 2 | loro (3a pl) pide sono; identidad/relacion con essere (son mis mejores amigos), distinto de la localizacion "in vacanza" de la variante 1; distractora `hanno`=avere (calco 'ellos tienen mis amigos'); el contexto "i miei migliori amici" desambigua que es 3a pl loro, no 1a sing io. Respuesta unica. |

**Verificacion italiana A1:** las 5 frases son construcciones estandar A1 (identidad, atributo, relacion, estado). Cada una usa essere (no avere). Ninguna repite el contexto de la variante existente del slot. `essere in ritardo` (voi) es idiomatico fijo con essere; las demas son identidad/atributo/relacion puras. Concordancias adjetivales verificadas (gentile invariable; amici/migliori amici plural masc).

---

## Bloque B — Concordancia de nacionalidad sistematica (slot existente `essere-nacionalidad`, D-23-04)

**HUECO PEDAGOGICO PRIORITARIO.** El slot `essere-nacionalidad` tiene hoy 3 variantes (spagnolo masc sing, italiana fem sing + di, tedeschi masc pl), pero **falta la matriz sistematica de concordancia** masc/fem x sing/pl con la MISMA nacionalidad — el error de concordancia mas frecuente con essere para el hispanohablante. Se anaden 3 variantes que completan la matriz `italiano/italiana/italiani/italiane` (la fem sing `italiana` ya esta en la variante 2 existente "Lei e italiana di Milano"), cubriendo las celdas que faltan: **masc sing `italiano`**, **masc pl `italiani`**, **fem pl `italiane`**. La respuesta correcta es la **nacionalidad concordada** (no la forma de essere — aqui el hueco es la concordancia del adjetivo de nacionalidad). Comparten la explanation del slot. Distractoras = concordancias INCORRECTAS de la misma nacionalidad (R5: las distractoras son formas de la nacionalidad mal concordadas, mas — donde tiene sentido — una forma generica).

> **Decision de diseno de estas variantes (importante para el checkpoint):** a diferencia de las variantes existentes del slot (donde el hueco es la forma de essere `sono/è`), en estas 3 nuevas variantes la forma de essere se da explicita en el prompt (`sono`/`è`/`siamo`) y **el hueco es la concordancia de la nacionalidad** (`italiano` vs `italiana` vs `italiani` vs `italiane`). Esto entrena directamente el hueco anunciado en D-23-04. R1 verificado: el prompt fija sujeto+genero+numero pero NO leak la concordancia correcta. R5: 4 options, 4 valores distintos (las 4 formas de la nacionalidad). R7: una sola concuerda con el sujeto.

| id temporal | slot destino | celda matriz | prompt | options | correctIndex | justificacion (R1: prompt fija genero/numero sin leak; R5: 4 formas distintas; R7: una concuerda) |
|-------------|--------------|--------------|--------|---------|--------------|---------------|
| `tmp-essere-nac-italiano-m-sg` | `essere-nacionalidad` | masc sing `italiano` | `Marco è ___ di Firenze.` | `["italiana","italiano","italiani","italiane"]` | 1 | Marco = masc sing -> `italiano`; el prompt fija el sujeto masc sing (nombre propio masculino) y la forma `è`, pero NO dice como concuerda la nacionalidad (R1); las 4 options son las 4 formas de concordancia (R5); solo `italiano` concuerda masc sing (R7); `di Firenze` da origen, esperable con nacionalidad. |
| `tmp-essere-nac-italiani-m-pl` | `essere-nacionalidad` | masc pl `italiani` | `Marco e Luca sono ___.` | `["italiano","italiani","italiane","italiana"]` | 1 | Marco e Luca = masc pl (dos hombres) -> `italiani`; el prompt fija sujeto masc pl + `sono` pero no la concordancia (R1); 4 formas distintas (R5); solo `italiani` concuerda masc pl (R7); plural en -i (nunca -s). |
| `tmp-essere-nac-italiane-f-pl` | `essere-nacionalidad` | fem pl `italiane` | `Anna e Giulia sono ___.` | `["italiana","italiani","italiane","italiano"]` | 2 | Anna e Giulia = fem pl (dos mujeres) -> `italiane`; el prompt fija sujeto fem pl + `sono` pero no la concordancia (R1); 4 formas distintas (R5); solo `italiane` concuerda fem pl (R7); cierra la matriz masc/fem x sg/pl junto a la `italiana` fem sing ya existente en la variante 2. |

**Verificacion italiana A1:** la matriz `italiano` (m sg) / `italiana` (f sg, ya existente) / `italiani` (m pl) / `italiane` (f pl) es la concordancia estandar de adjetivo de nacionalidad en -o. Los sujetos (nombres propios + coordinaciones de nombres) fijan genero y numero sin ambiguedad. Las distractoras son las otras 3 formas de la MISMA nacionalidad — son concordancias incorrectas, no formas de otro verbo (el hueco es concordancia adjetival, no eleccion de verbo). Las nacionalidades NO se capitalizan en italiano (italiano, no Italiano). Respuesta unica en cada una.

---

## Bloque C — Localizacion con essere (slots existentes, absorbida como variantes, D-23-04)

**HUECO: falso amigo estar->essere en localizacion.** El espanol distingue "estar en un sitio" (estar), pero el italiano usa essere para la localizacion (no un verbo aparte). El slot `essere-siamo` ya tiene "Noi siamo a casa" (localizacion 1a pl). Se anaden 2 localizaciones mas en **otros slots de presente** para repartir el patron por persona: `è in ufficio` (3a sing -> slot `essere-e`) y `sono al mare` (3a pl -> slot `essere-sono-loro`). El hueco es la forma de essere; la localizacion (in ufficio / al mare) va en el prompt. Comparten la explanation del slot (que ya menciona el falso amigo estar->essere en siamo/sono-loro). Distractora de avere (D-23-06).

> **Nota:** estas 2 superficies engordan slots de presente (NO el bloque A, que ya cubrio io/tu/noi/voi/loro con identidad/atributo). Aqui el angulo es **localizacion** especificamente, complementario. `essere-e` pasaria de 2 a 3 variantes; `essere-sono-loro` de 1 (variante existente) + 1 (Bloque A) + 1 (este) = 3 variantes. Si el autor prefiere un slot de localizacion dedicado, lo indica en el checkpoint (afectaria el count: +1 slot).

| id temporal | slot destino | persona/forma | prompt | options | correctIndex | justificacion (localizacion = essere; R7 una sola valida) |
|-------------|--------------|---------------|--------|---------|--------------|---------------|
| `tmp-essere-localizacion-ufficio` | `essere-e` | lui/lei / è | `Il direttore ___ in ufficio adesso.` | `["ha","è","sei","sono"]` | 1 | il direttore = 3a sing -> `è`; localizacion con essere (estar en la oficina = essere in ufficio); `adesso` (ahora) refuerza ubicacion actual sin abrir doble-validez de verbo (la localizacion en italiano es essere, no hay alternativa A1); distractora `ha`=avere (calco 'tiene en oficina' sin sentido); respuesta unica. |
| `tmp-essere-localizacion-mare` | `essere-sono-loro` | loro / sono | `I bambini ___ al mare con i nonni.` | `["siamo","hanno","sono","siete"]` | 2 | i bambini = 3a pl -> `sono`; localizacion con essere (estar en el mar = essere al mare); contexto "con i nonni" desambigua 3a pl (no 1a sing io); distractora `hanno`=avere; las otras formas no concuerdan con i bambini (3a pl); respuesta unica. Distinto de "in vacanza" (variante 1) y "i miei migliori amici" (Bloque A). |

**Verificacion italiana A1:** `è in ufficio` / `sono al mare` son localizaciones estandar con essere. El italiano NO tiene un verbo "estar" separado: la ubicacion fisica se predica con essere (falso amigo critico para el hispanohablante). `in ufficio` (en la oficina, preposicion `in` para lugares cerrados/instituciones) y `al mare` (a + il = al, locucion fija para "en el mar/playa") son A1. Respuesta unica en ambas (solo la forma de essere que concuerda con el sujeto).

---

## Bloque D — SLOT NUEVO ser/estar (D-23-07) — `essere-ser-estar`

**EL HUECO PEDAGOGICO MAS GRANDE DE ESSERE PARA EL HISPANOHABLANTE.** El espanol parte en DOS verbos (ser = identidad/esencia; estar = estado/localizacion) lo que el italiano expresa con UN SOLO verbo: essere. Este slot NUEVO contrasta deliberadamente ambos usos — **estado** (Maria è stanca = Maria está cansada) vs **identidad** (Maria è medico = Maria es médica) — ambos con essere, para que el alumno interiorice que en italiano no hay que elegir entre dos verbos. La explanation explicita el calco. El slot NUEVO requiere `validation` top-level (D-19-09).

**Caracteristicas del slot:**
- `id`: `essere-ser-estar`
- `type`: `multiple-choice`
- `categoryIds`: `["essere"]`
- `explanation` (top-level, rule-first): ver abajo.
- `validation`: top-level `{status:"validated", passes:[...]}` reflejando el quorum aprobado de sus variantes (D-19-09 — elevar la aprobada, NO inventar).

**Diseno de las variantes:** en cada una, el hueco es la **forma de essere** (que es siempre essere, lo que demuestra el punto: ser y estar -> essere). El contraste estado/identidad es **conceptual** (lo lleva el prompt + la explanation), pero la **forma correcta de essere es inequivoca** (R7) — no se vuelve ambigua. Distractora de avere agresiva (D-23-06): incluir `ho/ha` para reforzar que ni el estado ni la identidad usan avere (a diferencia de la edad/sensaciones).

| id temporal | slot (NUEVO) | tipo de uso | prompt | options | correctIndex | justificacion (essere para ser Y estar; R7 forma inequivoca) |
|-------------|--------------|-------------|--------|---------|--------------|---------------|
| `tmp-essere-ser-estar-estado` | `essere-ser-estar` | ESTADO (estar) | `Oggi Maria ___ stanca e di cattivo umore.` | `["ha","è","sei","sono"]` | 1 | Maria = 3a sing, estado transitorio "cansada" (= español ESTÁ cansada) -> `è` (essere, no un "estar"); distractora `ha`=avere (el calco 'tiene cansada' es el error); R7: solo `è` concuerda 3a sing; el contraste estado lo lleva el prompt ("stanca" + "oggi"=hoy, transitorio). |
| `tmp-essere-ser-estar-identidad` | `essere-ser-estar` | IDENTIDAD (ser) | `Maria ___ medico in un grande ospedale.` | `["ha","sei","è","sono"]` | 2 | Maria = 3a sing, identidad profesional "médica" (= español ES médica) -> `è` (essere, mismo verbo que el estado); distractora `ha`=avere; R7: solo `è` concuerda 3a sing; el contraste identidad lo lleva el prompt ("medico" sin articulo = rol predicativo). Mismo sujeto Maria que el estado -> el alumno ve que ESTAR cansada y SER médica usan el MISMO verbo. |
| `tmp-essere-ser-estar-estado-pl` | `essere-ser-estar` | ESTADO (estar) | `I bambini ___ contenti dopo la festa.` | `["hanno","siamo","sono","siete"]` | 2 | i bambini = 3a pl, estado emocional "contentos" (= español ESTÁN contentos) -> `sono`; distractora `hanno`=avere (calco 'tienen contentos'); R7: solo `sono` concuerda 3a pl; "dopo la festa" (despues de la fiesta) refuerza estado transitorio; concordancia `contenti` masc pl. |
| `tmp-essere-ser-estar-identidad-pl` | `essere-ser-estar` | IDENTIDAD (ser) | `I miei genitori ___ professori di matematica.` | `["hanno","siete","siamo","sono"]` | 3 | i miei genitori = 3a pl, identidad profesional "profesores" (= español SON profesores) -> `sono`; distractora `hanno`=avere; R7: solo `sono` concuerda 3a pl; "professori di matematica" = rol predicativo sin articulo; paralelo al estado pl -> mismo verbo essere para estar contentos Y ser profesores. |

**Explanation propuesta para el slot `essere-ser-estar`** (rule-first, contraste del calco, apostrofes ASCII, espanol acentuado RAE):

> El español usa dos verbos distintos —ser para la identidad y la esencia, estar para el estado y la localización—, pero el italiano lo resuelve todo con un único verbo: essere. Por eso 'Maria è stanca' equivale a 'Maria está cansada' (estado) y 'Maria è medico' equivale a 'Maria es médica' (identidad): la misma forma 'è' cubre lo que el español parte en dos. No existe un verbo italiano separado para 'estar'; tanto el estado transitorio (estar cansado, estar contento) como la identidad permanente (ser médico, ser profesor) se predican con essere. Cuidado con el contraste essere/avere: el estado y la identidad van con essere, pero la edad y las sensaciones físicas momentáneas se TIENEN con avere (ho trent'anni = tengo treinta años; ho fame = tengo hambre), nunca con essere. El adjetivo de estado concuerda con el sujeto (stanca fem sing, contenti masc pl), y el rol profesional predicativo va sin artículo (è medico, sono professori).

**Verificacion italiana A1:** los 4 contrastes son A1 correctos, todos con essere (estado: stanca/contenti; identidad: medico/professori). La forma de essere es inequivoca en cada uno (è para 3a sing, sono para 3a pl). El contraste ser/estar es conceptual (en el prompt + explanation) sin volver ambigua la respuesta. Las distractoras de avere (ha/hanno) refuerzan que ni estado ni identidad usan avere. Respuesta unica en cada variante.

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Apostrofes:** ninguna superficie nueva usa apostrofe (no hay elisiones en los prompts propuestos). En la explanation del slot ser/estar, `trent'anni` usa apostrofe ASCII U+0027.
- **Smart-quotes:** ninguna superficie ni explanation usa comillas tipograficas U+2018/U+2019/U+201C/U+201D. Las comillas simples del .md (en 'Maria è stanca' etc. de la explanation) se materializaran como apostrofes ASCII U+0027 en el JSON.
- **Markdown:** ningun prompt/explanation usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio.
- **Tildes RAE en explanation espanola (slot `essere-ser-estar`):** "única", "identidad", "está", "médica", "edad", "años", "física", "artículo" se escribiran con tilde correcta en el JSON final (aqui en el .md ya van acentuadas). Las explanations de los slots existentes (que se engordan) NO se tocan — las variantes nuevas comparten la explanation existente del slot, ya limpia.
- **Italiano:** `è` (es) lleva acento grave en options y prompts donde corresponde; `però`, `perché` no aparecen en este set. Se autoran con la grafia italiana correcta en el JSON.

**Nota de implementacion para Task 2:** al materializar cada superficie en Task 2 se escribiran con la grafia correcta (italiano: `è`; espanol acentuado RAE) y se re-verificara el scan de smart-quotes (`grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` = 0) sobre el JSON.

---

## SECCION — Decision de model IDs del quorum (Open Q #1)

**Contexto:** D-23-13 nombra la base canonica como "Claude Opus + Sonnet" (el milestone v1.6 menciona "Opus 4.8 + Sonnet 4.6" en algunos sitios de STATE.md), pero:
- El skill `gsd-validate-exercise` emite **literalmente** los model IDs `claude-opus-4-7` y `claude-sonnet-4-6` (verificado en SKILL.md `<critical_constraints>`: "Model IDs EXPLICITOS y literales: `claude-opus-4-7` para el Pase 1 y `claude-sonnet-4-6` para el Pase 2").
- **Todo el contenido previo** usa esos IDs: `avere.json`, `essere.json` (las 25 superficies legacy ya validadas), articoli, partitivos — todos llevan `"by": "claude-opus-4-7"` / `"by": "claude-sonnet-4-6"` en sus `validation.passes[]`.

**Recomendacion del planner: MANTENER los IDs literales del skill (`claude-opus-4-7` / `claude-sonnet-4-6`).**

Razon: la consistencia del audit trail. Las 25 superficies legacy de essere.json (movidas intactas en 23-01) ya llevan `claude-opus-4-7`/`claude-sonnet-4-6`; mezclar IDs nuevos (`claude-opus-4-8`) en las variantes nuevas del MISMO archivo rompe la homogeneidad del `passes[].by` dentro de essere.json. Ademas, cambiar los IDs requeriria editar el skill (`gsd-validate-exercise`), que esta **fuera del scope de contenido** de esta fase (el skill se trata como interface, NO modificar — ver `<interfaces>` del plan). El `by` debe ser estable a lo largo del tiempo (los aliases pueden remapearse, los IDs completos no — constraint del propio skill).

**El autor confirma o corrige en el checkpoint.** Si el autor pide actualizar a `claude-opus-4-8`, eso seria un cambio al skill (fuera de scope aqui) — se surfacearia como tarea aparte.

---

## Conteo final determinable (driver de 23-03)

- Slots actuales tras 23-01: **25**
- Slots nuevos en 23-02: **+1** (`essere-ser-estar`, D-23-07; si el autor aprueba un slot de localizacion dedicado seria +2)
- **Conteo final proyectado: 26 slots** (25 + 1 ser/estar). Si el autor pide slot de localizacion separado: 27.
- Variantes nuevas totales: **14** (5 presente engorde + 3 nacionalidad concordancia + 2 localizacion + 4 ser/estar).
- De esas 14, **4 son las variantes del slot NUEVO** ser/estar (el resto engorda slots existentes).
- Coste de quorum: 14 superficies x 4 pases (opus + sonnet + 2 externos by distintos) = 56 invocaciones, 1-por-1, NUNCA batched.

> Set GENEROSO (D-23-04) pero sin cuota fija (D-23-05): no se inflan slots cuya regla no admite reformulacion (word-buttons, passato prossimo de-1, match, cruces multi-cat quedan intactos como slots-de-1). No se materializa edad explicita (ya cubierta en `essere-300` + explanation de `essere-stato`). El contraste essere/avere se teje agresivamente en distractoras (cada superficie nueva lleva una forma de avere) y en la explanation del slot ser/estar (edad/sensaciones con avere; estado/identidad con essere). Huecos materializados solo donde la construccion A1 italiana es natural y verificada (essere no avere para identidad/estado/localizacion).
