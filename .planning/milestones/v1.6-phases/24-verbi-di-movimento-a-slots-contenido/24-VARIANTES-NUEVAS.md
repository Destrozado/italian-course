# 24-VARIANTES-NUEVAS.md — Verbi di movimento: superficies nuevas propuestas (Task 1)

**Fase:** 24-verbi-di-movimento-a-slots-contenido · **Plan:** 24-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 23-VARIANTES-NUEVAS.md (Essere) / 22-VARIANTES-NUEVAS.md (Avere) — engorde de celdas por los 4 ejes de huecos PRIORIZADOS.
**Decisiones aplicadas:** D-24-05 (ambicion GENEROSA, sin cuota fija), D-24-06 (los 4 ejes priorizados + VERIFICAR el auxiliar real de cada verbo), D-24-07/D-159 (explanations sin refs a la CATEGORIA Essere por id ni prosa; "essere" como nombre del auxiliar es valido), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots nuevos), R1-R7 (sin leak en prompt, options 3+ valores distintos, una sola respuesta valida).

> Estado del JSON tras 24-01: **7 slots** (4 multi-variante MC + 3 word-buttons). Los 4 slots MC que engordan los 4 ejes son: `verbos-movimiento-essere` (14 vars), `verbos-movimiento-concordanza` (12 vars), `verbos-movimiento-excepcioni-avere` (6 vars), `verbos-movimiento-correre` (2 vars). Todos son ya RICOS, pero los 4 ejes de huecos D-24-06 cierran huecos pedagogicos especificos (mas verbos essere, mas excepciones avere, mas test-de-destino, matriz de concordancia con varios verbos).

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 20**
**Slots NUEVOS: 0** — los 4 ejes engordan los 4 slots MC existentes de 24-01. NO se necesita ningun slot nuevo (ver seccion "Recomendacion: sin slots nuevos"). El count de 24-03 NO sube por este plan (las variantes no suben `data.exercises.length`; solo subirian los slots nuevos, y aqui no hay).

| Eje | Slot destino | Superficies | Verbos | Slot nuevo? |
|-----|--------------|-------------|--------|-------------|
| 1 — Mas verbos essere | `verbos-movimiento-essere` (engorde) | 7 | scendere, salire, cadere, rimanere, restare, diventare, nascere, morire | no |
| 2 — Mas excepciones avere | `verbos-movimiento-excepcioni-avere` (engorde) | 4 | passeggiare, sciare, viaggiare, nuotare | no |
| 3 — Mas test-de-destino | `verbos-movimiento-correre` (engorde) | 5 | correre, volare | no |
| 4 — Matriz de concordancia completa | `verbos-movimiento-concordanza` (engorde) | 4 | scendere, salire, venire, partire | no |

**Conteo por eje:** Eje 1 = 7 · Eje 2 = 4 · Eje 3 = 5 · Eje 4 = 4 → **20 superficies nuevas, 0 slots nuevos.**

**Nota sobre el contraste essere/avere (D-24-06):** el contraste se teje en las **distractoras** de cada superficie (cada variante del eje essere lleva una forma de avere — ho/hai/ha/abbiamo/avete/hanno — como distractora; cada variante del eje avere lleva una forma de essere como distractora) y en el **par contrastivo** del eje 3 (mismo verbo con destino -> essere, sin destino -> avere). Las explanations de los slots existentes NO se tocan (las variantes nuevas comparten la explanation del slot).

**Verbos DESCARTADOS / decisiones de scope (D-24-05, no inflar):**
- **saltare** (eje 1/2/3): DESCARTADO en este set. `saltare` es ambiguo: como actividad sin destino toma avere ("ho saltato per gioia"), pero con destino/direccion ("e saltato giu dal muro") puede tomar essere, y muchos hablantes usan avere incluso ahi. Para un A1 sin contexto rico el auxiliar no es inequivoco (riesgo R7 doble-validez). Se omite para no gastar quorum en un caso fronterizo; si el autor lo quiere, el quorum confirmaria el contexto exacto.
- **scendere/salire EN EL EJE 3 (test-de-destino):** se mantienen en el eje 1 (essere intransitivo de movimiento) y en el eje 4 (concordancia), pero NO se proponen como par contrastivo del eje 3. Razon: su uso "sin destino -> avere" requiere el uso transitivo ("ha sceso le scale" = bajar las escaleras como complemento directo), que es un matiz B1, no el contraste "actividad vs meta" del slot correre. El eje 3 se materializa con los dos verbos canonicos correre y volare, donde el contraste destino/no-destino es limpio y A1. (D-24-05: no forzar variantes artificiales.)
- **rimanere vs restare:** se incluyen AMBOS (son sinonimos, ambos essere) en 2 superficies distintas del eje 1, para que el alumno vea que los dos piden essere.

---

## EJE 1 — Mas verbos essere (slot existente `verbos-movimiento-essere`, D-24-06 a)

**HUECO:** el slot essere hoy solo drillea andare/venire/partire/tornare/uscire/entrare. Faltan los verbos de movimiento/estado/cambio que TAMBIEN piden essere: scendere (bajar), salire (subir), cadere (caer), rimanere/restare (quedarse), diventare (convertirse en), nascere (nacer), morire (morir). El hueco de cada superficie es la **forma del auxiliar essere**; la respuesta correcta es essere. Distractora de avere (D-24-06). Verificado R1 (el prompt NO contiene la forma del auxiliar) y R5 (4 options, valores distintos, con distractora avere).

| id temporal | slot destino | verbo / persona | prompt | options | correctIndex | justificacion + VERIFICACION del auxiliar |
|-------------|--------------|-----------------|--------|---------|--------------|-------------------------------------------|
| `tmp-vm-essere-scendere` | `verbos-movimiento-essere` | scendere / io | `Io ___ sceso dal treno alla stazione.` | `["ho","sono","ha","è"]` | 1 | io (1a sing) -> sono. **VERIFICACION:** scendere intransitivo de movimiento ("bajar del tren") toma essere -> "sono sceso" (correcto). El uso transitivo "ha sceso le scale" toma avere, pero aqui el contexto es intransitivo (dal treno = del tren, origen, no complemento directo). R1: el prompt no leak el auxiliar; R5: distractora `ho`=avere (el calco). Respuesta unica. |
| `tmp-vm-essere-salire` | `verbos-movimiento-essere` | salire / lei | `Maria ___ salita sull'autobus in fretta.` | `["ha","è","hanno","sono"]` | 1 | Maria (3a sing) -> e. **VERIFICACION:** salire intransitivo ("subir al autobus") toma essere -> "e salita" (correcto, participio concordado fem). Uso transitivo "ha salito le scale" = avere, pero aqui sull'autobus es intransitivo de movimiento. R1: sin leak; R5: distractora `ha`=avere. Respuesta unica. |
| `tmp-vm-essere-cadere` | `verbos-movimiento-essere` | cadere / il bambino | `Il bambino ___ caduto mentre giocava.` | `["ha","è","hanno","avete"]` | 1 | il bambino (3a sing) -> e. **VERIFICACION:** cadere SIEMPRE toma essere -> "e caduto" (correcto, no hay uso transitivo). R1: sin leak; R5: distractora `ha`=avere (calco 'ha caido'). Respuesta unica. |
| `tmp-vm-essere-rimanere` | `verbos-movimiento-essere` | rimanere / noi | `Noi ___ rimasti a casa tutto il giorno.` | `["abbiamo","siamo","avete","sono"]` | 1 | noi (1a pl) -> siamo. **VERIFICACION:** rimanere toma essere -> "siamo rimasti" (correcto, participio irregular rimasto concordado masc pl). R1: sin leak; R5: distractora `abbiamo`=avere. Respuesta unica. |
| `tmp-vm-essere-restare` | `verbos-movimiento-essere` | restare / loro | `Loro ___ restate in ufficio fino a tardi.` | `["hanno","sono","siete","abbiamo"]` | 1 | loro (3a pl fem) -> sono. **VERIFICACION:** restare (sinonimo de rimanere) toma essere -> "sono restate" (correcto, participio concordado fem pl). R1: sin leak; R5: distractora `hanno`=avere. Respuesta unica. Muestra que restare = rimanere (ambos essere). |
| `tmp-vm-essere-diventare` | `verbos-movimiento-essere` | diventare / lui | `Lui ___ diventato un bravo medico.` | `["ha","è","hanno","avete"]` | 1 | lui (3a sing) -> e. **VERIFICACION:** diventare (convertirse en, verbo de cambio) toma essere -> "e diventato" (correcto). R1: sin leak; R5: distractora `ha`=avere (calco). Respuesta unica. `un bravo medico` = rol predicativo. |
| `tmp-vm-essere-nascere-morire` | `verbos-movimiento-essere` | nascere / io | `Io ___ nato a Roma nel 1990.` | `["ho","sono","ha","è"]` | 1 | io (1a sing) -> sono. **VERIFICACION:** nascere (nacer) toma essere -> "sono nato" (correcto). R1: sin leak; R5: distractora `ho`=avere (calco 'he nacido'... en italiano essere). Respuesta unica. (morire se cubre conceptualmente con nascere como par vida/muerte en la explanation del slot, pero se materializa nascere por ser A1 mas frecuente y sin riesgo; morire -> "e morto" tambien essere, queda documentado.) |

**Verificacion italiana A1 (resumen Eje 1):** scendere (intransitivo)=essere, salire (intransitivo)=essere, cadere=essere, rimanere=essere (part. rimasto), restare=essere (part. restato), diventare=essere, nascere=essere (part. nato), morire=essere (part. morto). Todos son verbos de movimiento/estado/cambio del grupo essere. Los unicos con riesgo transitivo (scendere/salire) usan contextos intransitivos inequivocos (dal treno / sull'autobus). El quorum cross-vendor confirma cada auxiliar (D-24-06).

---

## EJE 2 — Mas excepciones avere (slot existente `verbos-movimiento-excepcioni-avere`, D-24-06 b)

**HUECO:** el slot avere hoy drillea viaggiare/nuotare/camminare/ballare. Faltan mas excepciones de "actividad sin destino -> avere + participio invariable": passeggiare (pasear), sciare (esquiar) y mas personas de viaggiare/nuotare. El hueco es la **forma del auxiliar avere**; respuesta = avere. Distractora de essere (el contraste que entrena la trampa). Verificado R1/R5.

| id temporal | slot destino | verbo / persona | prompt | options | correctIndex | justificacion + VERIFICACION del auxiliar |
|-------------|--------------|-----------------|--------|---------|--------------|-------------------------------------------|
| `tmp-vm-avere-passeggiare` | `verbos-movimiento-excepcioni-avere` | passeggiare / noi | `Noi ___ passeggiato nel centro storico.` | `["siamo","abbiamo","avete","sono"]` | 1 | noi (1a pl) -> abbiamo. **VERIFICACION:** passeggiare (pasear, actividad sin destino) toma avere -> "abbiamo passeggiato" (correcto, participio invariable). R1: sin leak; R5: distractora `siamo`=essere (la trampa: parece movimiento -> tentacion essere). Respuesta unica. `nel centro storico` = lugar de la actividad, no destino. |
| `tmp-vm-avere-sciare` | `verbos-movimiento-excepcioni-avere` | sciare / tu | `Tu ___ sciato sulle Alpi l'inverno scorso?` | `["sei","hai","ha","avete"]` | 1 | tu (2a sing) -> hai. **VERIFICACION:** sciare (esquiar, actividad/deporte sin destino) toma avere -> "hai sciato" (correcto, participio invariable). R1: sin leak; R5: distractora `sei`=essere. Respuesta unica. `sulle Alpi` = lugar de la actividad. |
| `tmp-vm-avere-viaggiare-loro` | `verbos-movimiento-excepcioni-avere` | viaggiare / loro | `Loro ___ viaggiato in treno per tutta l'Europa.` | `["sono","hanno","siete","abbiamo"]` | 1 | loro (3a pl) -> hanno. **VERIFICACION:** viaggiare (viajar, sin destino concreto) toma avere -> "hanno viaggiato" (correcto, invariable). R1: sin leak; R5: distractora `sono`=essere. Respuesta unica. Mas persona del viaggiare ya presente en el slot (era 1a pl). |
| `tmp-vm-avere-nuotare-io` | `verbos-movimiento-excepcioni-avere` | nuotare / io | `Io ___ nuotato per un'ora in piscina.` | `["sono","ho","è","siamo"]` | 1 | io (1a sing) -> ho. **VERIFICACION:** nuotare (nadar, actividad sin destino) toma avere -> "ho nuotato" (correcto, invariable). R1: sin leak; R5: distractora `sono`=essere. Respuesta unica. `per un'ora` = duracion (no destino), el complemento que delata la excepcion. |

**Verificacion italiana A1 (resumen Eje 2):** passeggiare=avere, sciare=avere, viaggiare=avere, nuotare=avere. Todos son actividades sin destino concreto -> auxiliar avere + participio invariable (-o fijo). Las distractoras essere refuerzan la trampa del hispanohablante (parece movimiento, pero no apunta a destino). El quorum confirma que NINGUNO toma essere (D-24-06).

---

## EJE 3 — Mas test-de-destino (slot existente `verbos-movimiento-correre`, D-24-06 c)

**HUECO:** el slot correre hoy tiene solo 2 variantes (correre con/sin destino). Faltan mas pares contrastivos que drilleen la regla "hay un destino? con destino essere, sin destino avere" con los verbos canonicos correre y volare. El hueco es la **forma del auxiliar**, que cambia segun el prompt tenga destino o no. Pares contrastivos del MISMO verbo (con destino -> essere; sin destino -> avere). Verificado R1/R5/R7.

| id temporal | slot destino | verbo / destino? | prompt | options | correctIndex | justificacion + VERIFICACION del contraste |
|-------------|--------------|------------------|--------|---------|--------------|--------------------------------------------|
| `tmp-vm-correre-volare-con` | `verbos-movimiento-correre` | volare / CON destino | `L'aereo ___ volato a Parigi stamattina.` | `["ha","è","hanno","avete"]` | 1 | l'aereo (3a sing) + destino "a Parigi" -> e (essere). **VERIFICACION:** volare con destino explicito toma essere -> "e volato a Parigi" (correcto, movimiento direccional). R1: sin leak; R5: distractora `ha`=avere (que seria la lectura sin destino). Respuesta unica por el destino. |
| `tmp-vm-correre-volare-sin` | `verbos-movimiento-correre` | volare / SIN destino | `Gli uccelli ___ volato tutto il giorno.` | `["sono","hanno","è","siamo"]` | 1 | gli uccelli (3a pl) + sin destino (actividad "tutto il giorno") -> hanno (avere). **VERIFICACION:** volare sin destino, como actividad, toma avere -> "hanno volato" (correcto). R1: sin leak; R5: distractora `sono`=essere (la lectura con destino). Respuesta unica por la ausencia de destino + "tutto il giorno" (duracion). Par contrastivo de la anterior (mismo verbo volare, distinto auxiliar segun destino). |
| `tmp-vm-correre-corso-sin` | `verbos-movimiento-correre` | correre / SIN destino | `Stamattina ___ corso un'ora in palestra.` | `["sono","ho","è","siamo"]` | 1 | (io implicito 1a sing) + sin destino (actividad "in palestra per un'ora") -> ho (avere). **VERIFICACION:** correre como ejercicio sin meta toma avere -> "ho corso" (correcto). R1: sin leak; R5: distractora `sono`=essere. Respuesta unica por ausencia de destino. (Refuerza la variante 1 existente del slot con otro contexto.) |
| `tmp-vm-correre-corsa-con` | `verbos-movimiento-correre` | correre / CON destino | `Anna ___ corsa subito all'ospedale.` | `["ha","è","hanno","avete"]` | 1 | Anna (3a sing) + destino "all'ospedale" -> e (essere). **VERIFICACION:** correre con destino direccional toma essere -> "e corsa all'ospedale" (correcto, participio concordado fem). R1: sin leak; R5: distractora `ha`=avere (lectura sin destino). Respuesta unica por el destino. Par contrastivo: misma raiz corso/corsa, distinto auxiliar segun destino. |
| `tmp-vm-correre-volare-pl-con` | `verbos-movimiento-correre` | volare / CON destino pl | `I piccioni ___ volati sul tetto della chiesa.` | `["hanno","sono","avete","è"]` | 1 | i piccioni (3a pl) + destino "sul tetto" -> sono (essere). **VERIFICACION:** volare con destino (movimiento hacia un punto) toma essere -> "sono volati sul tetto" (correcto, concordado masc pl). R1: sin leak; R5: distractora `hanno`=avere (lectura actividad). Respuesta unica por el destino. Cierra el test con plural + destino. |

**Verificacion italiana A1 (resumen Eje 3):** correre y volare son los dos verbos CANONICOS que alternan auxiliar segun destino. Con destino explicito (a Parigi, all'ospedale, sul tetto) -> essere + participio concordado. Sin destino, como actividad (tutto il giorno, in palestra) -> avere + participio invariable. El contraste es real y A1 para ambos verbos. Los pares (volare con/sin, correre con/sin) drillean exactamente la pregunta "hay destino?". El quorum confirma el auxiliar de cada caso (D-24-06). saltare/salire/scendere se OMITEN del eje 3 (ver "Verbos descartados": su uso sin-destino requiere transitividad B1, no el contraste A1 actividad-vs-meta).

---

## EJE 4 — Matriz de concordancia completa con varios verbos (slot existente `verbos-movimiento-concordanza`, D-24-06 d)

**HUECO:** el slot concordanza hoy cubre la matriz -o/-a/-i/-e mayormente con andare (+ algunos uscire/tornare/entrare). Falta completar la matriz genero x numero con MAS verbos para que el alumno vea que las 4 terminaciones se aplican a TODOS los participios, no solo a andare. El prompt fija sujeto + genero + numero + auxiliar (essere dado); el hueco es el **participio concordado**. Distractoras = las otras 3 concordancias incorrectas del MISMO verbo. Verificado R1 (el prompt fija genero/numero pero no leak la terminacion correcta), R5 (4 formas distintas), R7 (una concuerda).

| id temporal | slot destino | celda matriz / verbo | prompt | options | correctIndex | justificacion (R1 fija genero/numero sin leak; R5 4 formas; R7 una concuerda) |
|-------------|--------------|----------------------|--------|---------|--------------|--------------------------------------------------------------------------------|
| `tmp-vm-conc-sceso-m-sg` | `verbos-movimiento-concordanza` | masc sing `sceso` / scendere | `Marco è ___ dal treno alla stazione.` | `["scesa","sceso","scesi","scese"]` | 1 | Marco = masc sing -> `sceso`; el prompt fija sujeto masc sing + `è` pero NO la terminacion (R1); 4 formas del participio scendere (R5); solo `sceso` concuerda masc sing (R7). scendere intransitivo (dal treno) = essere, concordancia obligatoria. |
| `tmp-vm-conc-salita-f-sg` | `verbos-movimiento-concordanza` | fem sing `salita` / salire | `Giulia è ___ sull'autobus di corsa.` | `["salito","salita","saliti","salite"]` | 1 | Giulia = fem sing -> `salita`; prompt fija fem sing + `è` sin leak (R1); 4 formas de salire (R5); solo `salita` concuerda fem sing (R7). salire intransitivo (sull'autobus) = essere. |
| `tmp-vm-conc-venuti-m-pl` | `verbos-movimiento-concordanza` | masc pl `venuti` / venire | `I ragazzi sono ___ alla festa insieme.` | `["venuto","venuta","venuti","venute"]` | 2 | i ragazzi = masc pl -> `venuti`; prompt fija masc pl + `sono` sin leak (R1); 4 formas de venire (R5); solo `venuti` concuerda masc pl (R7). venire = essere. |
| `tmp-vm-conc-partite-f-pl` | `verbos-movimiento-concordanza` | fem pl `partite` / partire | `Le mie sorelle sono ___ per Milano ieri.` | `["partito","partita","partiti","partite"]` | 3 | le mie sorelle = fem pl -> `partite`; prompt fija fem pl + `sono` sin leak (R1); 4 formas de partire (R5); solo `partite` concuerda fem pl (R7). partire = essere. Cierra la matriz masc/fem x sg/pl con un 4o verbo nuevo. |

**Verificacion italiana A1 (resumen Eje 4):** la matriz se completa con 4 verbos NUEVOS al slot de concordancia (scendere -> sceso/a/i/e; salire -> salito/a/i/e; venire -> venuto/a/i/e; partire -> partito/a/i/e), cubriendo las 4 celdas masc sg / fem sg / masc pl / fem pl. Todos toman essere (concordancia obligatoria del participio con el sujeto). Las distractoras son las otras 3 formas del MISMO verbo (concordancias incorrectas), no formas de otro verbo (R5/R7). Los sujetos fijan genero+numero sin ambiguedad (nombres propios + coordinaciones + posesivos). El quorum confirma cada concordancia.

---

## Recomendacion: SIN slots nuevos (surfaceada al autor)

**Recomendacion del planner/executor: NO crear ningun slot nuevo.** Los 4 ejes de huecos D-24-06 engordan limpiamente los 4 slots MC existentes de 24-01:

- Eje 1 (mas verbos essere) -> `verbos-movimiento-essere` (la regla es la misma: verbos de movimiento -> auxiliar essere; scendere/salire/cadere/rimanere/restare/diventare/nascere son mas instancias de esa regla, intercambiables como variantes).
- Eje 2 (mas excepciones avere) -> `verbos-movimiento-excepcioni-avere` (misma regla: actividad sin destino -> avere invariable).
- Eje 3 (mas test-de-destino) -> `verbos-movimiento-correre` (misma regla: hay destino? con destino essere, sin destino avere; correre y volare comparten exactamente ese patron — el slot ya se llama "correre" pero su regla es el test-de-destino, asi que volare encaja como variante del mismo concepto).
- Eje 4 (matriz de concordancia) -> `verbos-movimiento-concordanza` (misma regla: el participio con essere concuerda; mas verbos = mas instancias de la matriz, como variantes). **NO dividir la concordancia en slots por forma** (D-24-03: concordancia en UN solo slot, divergencia deliberada vs Essere).

Crear slots nuevos seria sobre-fragmentar reglas que ya tienen su slot. Cada slot existente ya tiene su `validation` top-level de 24-01 (de las superficies fuente), que cubre la gate VAL_07_STRICT a nivel de slot — NO se degrada. **El autor confirma en el checkpoint o pide algun slot nuevo** (lo cual subiria el count de 24-03 y requeriria validation top-level propia, D-19-09).

> **Sobre el nombre del slot `verbos-movimiento-correre`:** aunque se llama "correre", su regla es el test-de-destino (con destino essere / sin destino avere). volare encaja perfectamente como variante (mismo patron). Si el autor prefiere renombrar el slot a algo como `verbos-movimiento-test-destino`, es una decision suya en el checkpoint (cambiar el id de slot afectaria los counts/refs — recomendacion: mantener el id `verbos-movimiento-correre` por consistencia del audit trail, las variantes de volare conviven sin problema). Recomendacion: NO renombrar.

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Apostrofes:** las superficies usan apostrofes en `sull'autobus`, `un'ora`, `all'ospedale`, `l'aereo`, `tutta l'Europa` — todas se materializaran con apostrofe ASCII U+0027 en el JSON (NO smart-quote U+2019).
- **Smart-quotes:** ninguna superficie usa comillas tipograficas U+2018/U+2019/U+201C/U+201D. Verificacion final en Task 2: `grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` = 0 sobre el JSON.
- **Markdown:** ningun prompt usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio.
- **Italiano:** `è` (es/esta) lleva acento grave en options y prompts donde corresponde. Los participios irregulares (rimasto, sceso, salito, nato, morto, venuto) se escriben con la grafia italiana correcta. NO se añaden explanations nuevas (las variantes comparten la del slot existente, ya limpia de 24-01).
- **Gloss ES (R7 canon):** NINGUNA de las 20 superficies necesita gloss "(en español: ...)" — el sujeto + contexto desambigua el auxiliar/concordancia sin ambiguedad de doble-validez. No se usa gloss en este set.
- **D-24-07/D-159:** las variantes nuevas NO llevan explanation propia (comparten la del slot), asi que NINGUNA referencia la categoria Essere por id ni prosa. "essere" como nombre del auxiliar es valido (y solo aparece en las explanations existentes de los slots, no tocadas).

**Nota de implementacion para Task 2:** al materializar cada superficie como id temporal legacy con `payload:{prompt,options,correctIndex,explanation}` para el quorum aislado, la `explanation` temporal del id legacy puede ser un placeholder minimo (el quorum valida prompt+options+correctIndex; tras pasar, la superficie se mueve a `variants[]` SIN explanation propia, compartiendo la del slot). Re-verificar el scan de smart-quotes sobre el JSON final.

---

## Conteo final determinable (driver de 24-03)

- Slots actuales tras 24-01: **7** (4 MC + 3 word-buttons).
- Slots nuevos en 24-02: **+0** (todos los ejes engordan slots existentes; recomendacion: sin slots nuevos).
- **Conteo final proyectado: 7 slots** (sin cambio; las 20 variantes nuevas NO suben `data.exercises.length`). Si el autor aprueba algun slot nuevo, subiria el count y requeriria validation top-level (D-19-09).
- Variantes nuevas totales: **20** (7 eje essere + 4 eje avere + 5 eje test-destino + 4 eje concordancia).
- De esas 20, **0 son de slots nuevos** (todas engordan slots existentes).
- Coste de quorum: 20 superficies x 4 pases (opus + sonnet + 2 externos by distintos) = 80 invocaciones, 1-por-1, NUNCA batched.

> Set GENEROSO (D-24-05) pero sin cuota fija: no se inflan slots cuya regla no admite reformulacion (word-buttons slots-de-1 quedan intactos). saltare descartado (auxiliar fronterizo, riesgo R7); scendere/salire fuera del eje 3 (su sin-destino es transitivo B1, no A1). Huecos materializados solo donde la construccion A1 italiana es natural y el auxiliar es inequivoco. Cada verbo asignado a essere/avere lleva su VERIFICACION explicita (D-24-06); el quorum cross-vendor caza cualquier auxiliar erroneo ANTES de entrar al slot. NO se crean cruces 300..305 (no existen para Verbi di movimento). NO snapshot (avere-only, no aplica re-base D-88).
