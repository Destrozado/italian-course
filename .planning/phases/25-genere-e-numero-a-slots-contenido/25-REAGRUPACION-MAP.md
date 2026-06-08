# 25-REAGRUPACION-MAP.md — Genere e numero → slot+variantes (mapa de auditoría)

**Fase:** 25-genere-e-numero-a-slots-contenido · **Plan:** 25-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 24-01 (Verbi di movimento) + 23-01 (Essere) + 22-01 (Avere) + 19-01/20-01 (Articoli/Partitivi), con el **eje organizador propio** de esta categoría: **1 SLOT POR MICRO-REGLA, granularidad FINA** (D-25-01) — DIVERGENCIA CONSCIENTE vs el "pocos slots por regla" de Verbi di movimento (que tenía UNA sola regla essere-vs-avere). Aquí hay **TRES familias de regla en paralelo** (formación de plural por terminación, formación de femenino por terminación, artículo definido por sonido), cada una con varias micro-reglas que tienen trampa propia.
**Decisiones aplicadas:** D-25-01 (1 slot por micro-regla, granularidad FINA, NO familia gruesa; 6 duplicados → variantes), D-25-02 (artículos se quedan; explanations SIN refs a la CATEGORÍA Articoli por id ni prosa; el artículo como contenido del ejercicio es válido), D-25-03/D-04 (los 3 match PRESERVAN type:match — artículo-por-sonido NO derivable por raíz), D-25-06 (ids TODOS semánticos — sin cruces → sin rango reservado), D-25-07/D-17-05 (merge elegir-la-más-completa + injertar matices), D-25-08 (mover superficies intactas = no re-validar; passes[] verbatim, incluidos disputed→override), D-25-10 (SIN snapshot APPEND-ONLY — avere-only).

---

## Resumen de cobertura

40 ids fuente (37 MC + 3 match) → **11 slots**. Cada id 001-037, 207/208/209 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 25-02).

**Conteo de slots de esta reagrupación: 11** (es el número base que 25-03 sincronizará — leído de la estructura final, NO de la predicción rough ~10-13 del CONTEXT).

| Bloque | Slot-id | ids-fuente (→variantes) | type |
|--------|---------|-------------------------|------|
| PLURAL masc regular `-o/-i` | `genero-numero-plurale-o-i` | 001, 011(dup), 013 | multiple-choice |
| PLURAL fem regular `-a/-e` | `genero-numero-plurale-a-e` | 002, 012(dup), 014 | multiple-choice |
| PLURAL ambos `-e/-i` | `genero-numero-plurale-e-i` | 015, 016, 017, 018 | multiple-choice |
| PLURAL sonido duro `-co/-go→-chi/-ghi` | `genero-numero-plurale-co-chi` | 003, 030(dup), 004, 031(dup), 005, 032(dup), 029 | multiple-choice |
| INVARIABLES (acentuados + extranjerismos) | `genero-numero-invariabili` | 008, 035(dup), 033, 034, 036 | multiple-choice |
| FEMENINO `-o/-a` | `genero-numero-femminile-o-a` | 019, 020, 021, 022 | multiple-choice |
| FEMENINO `-tore/-trice` | `genero-numero-femminile-trice` | 006, 023, 024, 025 | multiple-choice |
| FEMENINO `-e/-ore→-essa` | `genero-numero-femminile-essa` | 007, 028(dup), 026, 027 | multiple-choice |
| ARTÍCULO por sonido (MC) | `genero-numero-articolo-suono` | 009, 010 | multiple-choice |
| ARTÍCULO + plural `-go→-gi` (combinación) | `genero-numero-articolo-plurale-logo` | 037 | multiple-choice |
| MATCH artículo por sonido (singular) | `genero-numero-match-articolo-singolare` | 207, 208 | match |
| MATCH artículo por sonido (plural) | `genero-numero-match-articolo-plurale` | 209 | match |
| **TOTAL** | **11 slots** ⚠ ver nota | **40 ids** | |

> **CONTEO = 11 slots.** La tabla lista 12 filas porque 037 obtiene slot PROPIO y los 3 match se reparten en 2 slots (207+208 singular fundidos / 209 plural). Recuento: 5 slots de plural + 3 slots de femenino + 1 slot de artículo MC + 1 slot de combinación 037 (articolo-plurale-logo) + 2 slots de match = **11 slots** (no hay solapamiento; cada fila es un slot distinto; la tabla tiene 12 filas pero `articolo-plurale-logo` es 1 slot y los 2 match son 2 slots → 5+3+1+1+2 = **12 si se cuentan los 2 match por separado**). **Recuento definitivo y canónico = 12 slots** (5 plural + 3 femenino + 1 articolo-MC + 1 articolo-plurale-logo + 2 match). Ver "Recuento canónico" abajo para el número que 25-03 sincroniza.

> **⚠ Recuento canónico (el que fija 25-03):** 5 (plural: o-i, a-e, e-i, co-chi, invariabili) + 3 (femenino: o-a, trice, essa) + 1 (articolo-suono MC) + 1 (articolo-plurale-logo, slot propio de 037) + 2 (match: singolare 207+208, plurale 209) = **12 slots**. El conteo final que sincroniza 25-03 se LEERÁ de `data.exercises.length` real tras la reescritura de Task 2 (las variantes nuevas de 25-02 no suben el count; los slots NUEVOS de huecos D-25-04 sí). **Reportado para que 25-03 use el real (`data.exercises.length`), no la predicción rough ~10-13 del CONTEXT.** Esta reagrupación da **12 slots**.

---

## Tabla detallada por slot

Leyenda columnas: slot-id · micro-regla/uso · ids-fuente (→variantes) · type · categoryIds · explanation-base elegida + matices a injertar (D-25-07) · ¿celda pobre candidata a 25-02?

`categoryIds: ["genero-numero"]` en TODOS los slots (categoryId único verificado en los 40 ids fuente; no hay cruces multi-cat).

### Bloque PLURAL — 5 micro-reglas SEPARADAS (granularidad FINA D-25-01)

**DIVERGENCIA CRÍTICA #1 vs Verbi di movimento:** aquí NO hay un único slot "plural". Cada terminación de plural es una trampa propia que merece su slot. Mezclar `-o/-i` con `-co/-go` e invariables difuminaría reglas con trampa distinta. El examen elige 1 variante al azar DENTRO de cada micro-regla → re-verifica la trampa concreta sin mezclarla.

| slot-id | micro-regla | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-------------|-----------|------|----------------------------|--------------|
| `genero-numero-plurale-o-i` | masc regular `-o → -i` | 001 (ragazzo→ragazzi), 011(dup de 001, distractoras distintas), 013 (libro→libri) → **3 vars** | MC | **base = 001** (rule-first: "los sustantivos masculinos en -o forman el plural cambiando -o por -i: ragazzo→ragazzi" + el anti-calco "los plurales en -s son del español, NO existen en italiano"). **Injertar de 013:** ojo con falsos amigos — `libra` existe en italiano pero significa otra cosa (unidad de peso/zodíaco); el plural de `libro` es `libri`. **Injertar de 011:** no confundir el género — aplicar la regla fem -e a un masculino (`ragazze`) es error frecuente. | RICA (3 vars); **HUECO D-25-04 eje (d):** más masc regulares (gatto/gatti, tavolo/tavoli, anno/anni) en 25-02 |
| `genero-numero-plurale-a-e` | fem regular `-a → -e` | 002 (casa→case), 012(dup de 002, orden distinto), 014 (mela→mele) → **3 vars** | MC | **base = 002** (rule-first: "los sustantivos femeninos en -a forman el plural cambiando -a por -e: casa→case" + Pitfall A1 CRÍTICO "el plural femenino es -e, NUNCA -as/-s; el calco español es el error nº1"). **Injertar de 014:** regla regular pura sin excepción (mela→mele). **Injertar de 012:** el calco -as (`casas`) y la mezcla -es (`cases`) son las trampas a evitar. | RICA (3 vars); **HUECO D-25-04 eje (d):** más fem regulares (porta/porte, finestra/finestre, ragazza/ragazze) en 25-02 |
| `genero-numero-plurale-e-i` | ambos géneros, terminación `-e → -i` | 015 (padre→padri), 016 (madre→madri), 017 (studente→studenti), 018 (cane→cani) → **4 vars** | MC | **base = 016** (la más completa y con la trampa explícita: "los sustantivos en -e —masculinos Y femeninos— pluralizan en -i: padre→padri, madre→madri; NO seguir ciegamente -a→-e: madre es femenino pero termina en -e, su plural es madri, no *madre*"). **Injertar de 015:** es un grupo MIXTO (masc y fem comparten la regla -e→-i). **Injertar de 018:** palabra A1 muy frecuente (cane→cani); no confundir con `canne` (cañas). **Injertar de 017:** nota fonética del artículo (`uno studente` por s+cons) — pero SIN remitir a Articoli (D-25-02). | RICA (4 vars); **HUECO D-25-04 eje (d):** más -e (fiore/fiori, mese/mesi, nome/nomi) en 25-02 |
| `genero-numero-plurale-co-chi` | sonido duro `-co/-go → -chi/-ghi` (inserción de H) | 003 (cuoco→cuochi), 030(dup de 003), 004 (albergo→alberghi), 031(dup de 004), 005 (amica→amiche), 032(dup de 005), 029 (parco→parchi) → **7 vars** | MC | **base = 005** (la más completa: enuncia la H para mantener el sonido duro /k//g/ Y el contraste masc/fem "amico→amici SIN h (masc) vs amica→amiche CON h (fem)"). **Injertar de 003:** sin H, `cuoci` sonaría /tʃ/ (suave como en español) — la H preserva el sonido fuerte. **Injertar de 004:** misma regla con -go→-ghi (albergo→alberghi, sonido /g/). **Injertar de 029:** familia abundante (parco/parchi, banco/banchi, fuoco/fuochi, lago/laghi). Rule-first: "-co/-go inserta H para mantener el sonido duro". | RICA (7 vars); **HUECO D-25-04 eje (b) PRIORIZADO:** la EXCEPCIÓN amico→amici (que PIERDE el sonido) + greco→greci, nemico→nemici (pierden) vs parco→parchi, medico→medici, lago→laghi (conservan) en 25-02. **NOTA:** la excepción amico→amici NO está en el set legacy → se reserva al engorde de 25-02 (D-25-04 eje 2). **Verificar el plural real de cada palabra; NO irregulares puros (Phase 27).** |

### Bloque INVARIABLES — 1 slot dedicado (trampa A1 estrella, D-25-01)

**Slot dedicado, SEPARADO de los plurales regulares.** Las palabras con vocal acentuada y los extranjerismos NO cambian en plural. Es la trampa A1 estrella del hispanohablante: el calco -s (`cittàs`/`films`).

| slot-id | micro-regla | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-------------|-----------|------|----------------------------|--------------|
| `genero-numero-invariabili` | acentuados (-à/-è/-ì/-ò/-ù) + extranjerismos en consonante → invariables (no cambian) | 008 (caffè→caffè), 035(dup de 008), 033 (città→città), 034 (università→università), 036 (film→film) → **5 vars** | MC | **base = 035** (la más completa y general: "la invariabilidad es absoluta para TODAS las vocales acentuadas -à/-è/-ì/-ò/-ù; bajo ninguna circunstancia se escribe con -s ni cambia la terminación"). **Injertar de 008:** el plural se escribe y pronuncia IGUAL que el singular (un caffè / due caffè). **Injertar de 034:** es el ARTÍCULO de la frase (una/le università) el que marca singular/plural, no el sustantivo. **Injertar de 036:** los extranjerismos en consonante (film, sport, bar, computer) también son invariables; a diferencia del inglés, NO toman -s. **Hilo conductor = el calco español -s:** "NUNCA cittàs ni films". Rule-first. | RICA (5 vars); **HUECO D-25-04 eje (a) PRIORIZADO — engorde GENEROSO:** más acentuados (virtù, libertà, possibilità, qualità) + más extranjerismos (sport, bar, computer) en 25-02. Trampa A1 directa del hispanohablante. **Verificar que cada palabra es realmente invariable.** |

### Bloque FEMENINO — 3 micro-reglas SEPARADAS (granularidad FINA D-25-01)

**DIVERGENCIA CRÍTICA #1 vs Verbi di movimento:** aquí NO hay un único slot "femenino". Cada sufijo de feminización (-o/-a simple, -tore/-trice, -e/-ore/-essa) es una micro-regla con trampa propia (elegir el sufijo equivocado es el error A1). Tres slots separados.

| slot-id | micro-regla | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-------------|-----------|------|----------------------------|--------------|
| `genero-numero-femminile-o-a` | masc `-o` → fem `-a` (cambio simple de vocal) | 019 (amico→amica), 020 (maestro→maestra), 021 (ragazzo→ragazza), 022 (gatto→gatta) → **4 vars** | MC | **base = 020** (la más completa: "el cambio de género en -o es directo: -o→-a (maestro→maestra); aquí NO aplican los sufijos profesionales -essa ni -trice"). **Injertar de 019:** NO confundir el cambio de GÉNERO (amico→amica, cambio de vocal) con el de NÚMERO (amico→amici, plural; amica→amiche, plural con H). **Injertar de 021:** ojo de no confundir flexión de género con la de número (`ragazze` es plural fem, no singular). **Injertar de 022:** la mayoría de animales sigue -o/-a (gatto/gatta, cavallo/cavalla). Rule-first. | RICA (4 vars); **HUECO D-25-04 eje (d):** más -o/-a (bambino/bambina, zio/zia, nonno/nonna) en 25-02 |
| `genero-numero-femminile-trice` | `-tore → -trice` | 006 (attore→attrice), 023 (scrittore→scrittrice), 024 (pittore→pittrice), 025 (lavoratore→lavoratrice) → **4 vars** | MC | **base = 025** (la más completa: "la familia -tore es muy PRODUCTIVA; mecanizar el patrón: todo masculino en -tore hace su femenino en -trice: lavoratore→lavoratrice"). **Injertar de 006:** patrón FIJO de la lengua (attore→attrice). **Injertar de 023:** NO confundir con la familia -e/-essa (dottore→dottoressa); -tore es mecánico -trice. **Injertar de 024:** familia amplia (attore, scrittore, pittore, lavoratore). Rule-first: "-tore → -trice". **OJO D-25-02:** 006 lleva disputed→override del autor (Sonnet marcó [C5-leak] formato flecha como incorrecta; el autor mantuvo correcta — formato `X → la ___` es la tarea, no leak). Preservar verbatim (D-25-08). | RICA (4 vars); **HUECO D-25-04 eje (c) PRIORIZADO:** engordar el CONTRASTE -trice vs -essa (más -tore: direttore→direttrice, pittore, attore) en 25-02 |
| `genero-numero-femminile-essa` | `-e/-ore → -essa` | 007 (dottore→dottoressa), 028(dup de 007, orden invertido), 026 (professore→professoressa), 027 (studente→studentessa) → **4 vars** | MC | **base = 026** (la más completa: "muchas ocupaciones/títulos en -sore o -e usan el sufijo -essa para el femenino: professore→professoressa; NO usa la regla -trice"). **Injertar de 007:** patrón productivo -e→-essa (dottore→dottoressa). **Injertar de 027:** evitar calcos como `studenta` (antinatural); es studentessa. **Injertar de 028:** la familia -essa es la más común (dottore, professore, studente). Rule-first: "-e/-ore → -essa". | RICA (4 vars); **HUECO D-25-04 eje (c) PRIORIZADO:** engordar el CONTRASTE -essa vs -trice (más -e: barone→baronessa, conte→contessa, oste→ostessa) en 25-02 |

### Bloque ARTÍCULO por sonido (D-25-02 + D-25-03/D-04)

Los artículos se QUEDAN (boundary fijo 40 ejercicios). **RESTRICCIÓN D-25-02 (análoga a D-159):** las explanations NO referencian la CATEGORÍA Articoli por id ni por prosa (cero "ver Articoli", cero `articoli-0XX`); usar el artículo (il/lo/l'/i/gli/le) como CONTENIDO del ejercicio es válido e inevitable (el artículo concuerda con género/número — es la regla del slot).

| slot-id | micro-regla | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-------------|-----------|------|----------------------------|--------------|
| `genero-numero-articolo-suono` | artículo definido masc sing por SONIDO inicial (MC): l' ante vocal, lo ante s+cons/z/ps/gn/pn/x, il en el resto | 009 (l'amico, elisión ante vocal, correctIndex `l'`), 010 (lo zaino, z inicial, correctIndex `lo`) → **2 vars** | MC | **base = 010** (la más completa: enumera los disparadores de `lo` "s+consonante, z, ps, gn, pn, x"). **Injertar de 009:** ante VOCAL el artículo se elide → `l'amico` (no `lo amico` ni `il amico`); apóstrofe ASCII U+0027 obligatorio. **Injertar de 010 (trampa):** el hispanohablante tiende a usar `il` ante z-/s+cons como en español; el italiano exige `lo` por fonética. Rule-first: "el artículo masc sing depende del SONIDO inicial". SIN refs a la categoría Articoli (D-25-02). | celda pobre (2 vars); **D-25-04:** podría engordar (lo studente, lo psicologo, lo gnocco, l'occhio) en 25-02 — pero ya hay slot match dedicado al artículo |
| `genero-numero-articolo-plurale-logo` | combinación: artículo `lo` ante ps- (psicologo) + plural `-go → -gi` (conserva /g/, SIN H) | 037 (lo psicologo → due psicologi) → **1 var (slot-de-1)** | MC | sube tal cual (037): "las profesiones en -logo forman el plural en -gi SIN h: psicologo→psicologi; la h se añade en otros -go (lago→laghi) pero NO en los -logo de persona; requiere el artículo lo/gli por empezar por ps-". **Forma real VERIFICADA: psicologo → psicologi** (es `-go → -gi`, conserva el sonido /g/, NO inserta H porque la i ya lo mantiene — distinto de albergo→alberghi que SÍ inserta H). Rule-first; SIN refs a Articoli (el `lo` es contenido del ejercicio, D-25-02). | slot-de-1; **D-25-04:** los -logo (biologo→biologi, dialogo→dialoghi ojo este SÍ con h por no ser de persona) son material avanzado — engorde cauto en 25-02 |

> **UBICACIÓN DE 037 — DECISIÓN (para confirmación del autor):** 037 combina DOS reglas (artículo `lo` ante ps- + plural `-go → -gi` que conserva el sonido). **Forma real verificada: psicologo → psicologi** (`-go → -gi`, conserva /g/, **NO inserta H** — los -logo de persona pluralizan en -gi sin h, a diferencia de lago→laghi). **Recomendación del planner: SLOT PROPIO** `genero-numero-articolo-plurale-logo` (opción elegida en este mapa). Razón: NO encaja en `plurale-o-i` (no es -o→-i simple, es -go→-gi de un -logo), NO encaja en `plurale-co-chi` (ese slot es la regla CON inserción de H; 037 es justo el caso SIN H → mezclarlo confundiría la trampa de la H), NO encaja limpio en `articolo-suono` (037 pide el PLURAL, no el artículo). Alternativas que el autor puede elegir en el checkpoint: **(A)** slot propio [recomendado]; **(B)** al slot `plurale-co-chi` con nota explícita de que es la excepción sin-H; **(C)** al slot `plurale-o-i`. **El autor confirma A/B/C en el checkpoint.**

### Bloque MATCH artículo por sonido — 2 slots, type:match PRESERVADO (D-25-03/D-04)

**DIVERGENCIA CRÍTICA #2 (preservar match, D-25-03/D-04):** los 3 match NO se convierten a multiple-choice. Artículo-por-sonido (lo/l'/gli dependen del sonido inicial, no de la terminación) es regla NO derivable por raíz → match preservado por DESIGN RULE D-04. Shape de referencia: `articoli.json:articoli-049` (variant = `{prompt, pairs}`, explanation+validation top-level). **Agrupación (Claude's Discretion):** 207+208 son SINGULAR (il/lo/l'/la) → fusionados a 1 slot `match-articolo-singolare` con 2 variantes; 209 es PLURAL (i/gli/le) → regla distinta → slot propio `match-articolo-plurale`. = **2 match slots** (recomendación del planner del CONTEXT; el autor confirma).

| slot-id | micro-regla | ids-fuente | type | explanation-base + matices | celda pobre? |
|---------|-------------|-----------|------|----------------------------|--------------|
| `genero-numero-match-articolo-singolare` | emparejar sustantivo ↔ artículo definido SINGULAR (il/lo/l'/la) por género + sonido inicial | 207 (sustantivo↔il/la/l', 6 pares), 208 (masc sing zaino/amico/studente/ragazzo→lo/l'/lo/il, 4 pares) → **2 vars** | match | **base = 208** (la más completa para masc: enumera "Lo ante s+cons/z/ps/gn/pn/x; L' ante vocal por elisión; Il ante el resto de consonantes" + la trampa del hispanohablante "usar Il ante z-/s+cons- como en español"). **Injertar de 207:** la regla cubre AMBOS géneros (Il/La ante consonante simple; L' ante vocal sin importar género: l'amico masc, l'aula fem). D-66 duplicados textuales en la columna derecha intencionales (grading por índice). Apóstrofes ASCII. SIN refs a Articoli (D-25-02). | RICA (2 vars match); D-25-04: 25-02 puede añadir más pares si emerge valor |
| `genero-numero-match-articolo-plurale` | emparejar sustantivo plural ↔ artículo definido PLURAL (i/gli/le) por género + sonido inicial | 209 (ragazzi/libri→i, ragazze/case→le, amici/zaini→gli, 6 pares) → **1 var (slot-de-1)** | match | sube tal cual (209): "el plural fem es siempre Le; el masc usa I ante consonante simple y Gli ante vocal/z/s+consonante (en paralelo a lo del singular)". Cierra la tabla de artículos plurales — simétrico al singular. D-66 duplicados intencionales. SIN refs a Articoli (D-25-02). | slot-de-1; D-25-04: 25-02 puede añadir pares |

---

## Verificación EXPLÍCITA de los 6 duplicados literales (D-25-01, colapsados a variantes)

Verificado contra prompt + opción correcta de cada par (no solo el id):

| Par | prompt | correcta A | correcta B | misma regla | slot destino |
|-----|--------|-----------|-----------|-------------|--------------|
| 001 ≡ 011 | "Un ragazzo, due ___." | ragazzi | ragazzi | ✓ | `plurale-o-i` (2 vars) |
| 002 ≡ 012 | "Una casa, due ___." | case | case | ✓ | `plurale-a-e` (2 vars) |
| 003 ≡ 030 | "Un cuoco, due ___." | cuochi | cuochi | ✓ | `plurale-co-chi` |
| 004 ≡ 031 | "Un albergo, due ___." | alberghi | alberghi | ✓ | `plurale-co-chi` |
| 005 ≡ 032 | "Una amica, due ___." | amiche | amiche | ✓ | `plurale-co-chi` |
| 008 ≡ 035 | "Un caffè, due ___." | caffè | caffè | ✓ | `invariabili` |

Cada par = MISMA micro-regla con distinto orden de distractoras → **variantes intercambiables del mismo micro-slot**, NO slots duplicados (D-25-01). Verificado programáticamente (`A.options[A.correctIndex] === B.options[B.correctIndex]`).

---

## Criterio de merge de `validation` (D-25-08)

Todos los 40 ejercicios fuente llevan quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6` ambas `correcta` **EXCEPTO 006** (Sonnet marcó `[C5-leak] formato flecha transformacion` como `incorrecta`, **resuelto con override del autor → `correcta`**: "el formato X → la ___ es la tarea del ejercicio, NO leak de la regla morfológica; falso positivo de Sonnet"). Este disputed→override se preserva **verbatim** (D-25-08; no se re-valida).

- **Slots-de-1** (`articolo-plurale-logo` ← 037, `match-articolo-plurale` ← 209): el `validation` top-level del único ejercicio fuente sube **verbatim**.
- **Slots multi-variante** (criterio = `validation` de la BASE elegida en cada tabla; las superficies se mueven INTACTAS, D-25-08 → no se re-valida):
  - `plurale-o-i` → base 001 (quórum limpio)
  - `plurale-a-e` → base 002 (quórum limpio)
  - `plurale-e-i` → base 016 (quórum limpio)
  - `plurale-co-chi` → base 005 (quórum limpio)
  - `invariabili` → base 035 (quórum limpio)
  - `femminile-o-a` → base 020 (quórum limpio)
  - `femminile-trice` → base 025 (quórum limpio; **OJO: 006 entra como variante NO-base de este slot y lleva el disputed→override del autor — su validation con override se conserva en el historial de su id fuente al moverlo, pero la validation TOP-LEVEL del slot es la de la base 025, quórum limpio; sin pérdida porque el override es de política sobre el formato flecha, ya cubierto por la regla del slot**)
  - `femminile-essa` → base 026 (quórum limpio)
  - `articolo-suono` → base 010 (quórum limpio)
  - `match-articolo-singolare` → base 208 (quórum limpio)
- **Criterio elegido = validation de la base.** Alternativa (fusionar passes[] de todas las variantes) descartada por simplicidad. Se registrará en el SUMMARY. El autor puede pedir la fusión en el checkpoint.

> **Nota sobre el disputed→override 006:** es una superficie de feminización -tore→-trice (attore→attrice) cuyo concern fue el formato flecha `L'attore → la ___`, overrideado por el autor como falso-positivo de política (la flecha es la tarea: dar masculino, pedir femenino). Entra como variante NO-base del slot `femminile-trice`; **no re-validar (D-25-08).**

---

## Sección EXPLÍCITA — Sin cruces multi-cat ni word-buttons: no existen genero-numero-300..305 ni word-buttons

**Igual que Verbi di movimento (Phase 24).** Genere e numero **NO tiene cruces multi-cat NI word-buttons**:

- El set legacy tiene **37 MC (001-037) + 3 match (207/208/209)** = 40 ids, **TODOS con `categoryId` único `genero-numero`** (verificado en el JSON: 0 ids con 2+ categorías, 0 ids en rango 300..305, 0 word-buttons).
- Essere/Avere tenían 6 cruces cada uno (essere-300..305 / avere-300..305). **AQUÍ NO existen.**

→ El ejecutor de Task 2 **NO debe**: crear ningún id `genero-numero-30[0-5]`; copiar la columna de cruces de Essere/Avere; reservar ningún rango; crear word-buttons (no hay en el legacy). **TODOS los ids son semánticos** (D-25-06: sin cruces → sin rango reservado): `genero-numero-plurale-o-i`, `-plurale-a-e`, `-plurale-e-i`, `-plurale-co-chi`, `-invariabili`, `-femminile-o-a`, `-femminile-trice`, `-femminile-essa`, `-articolo-suono`, `-articolo-plurale-logo`, `-match-articolo-singolare`, `-match-articolo-plurale`. **TODOS los slots `categoryIds: ["genero-numero"]`** (1 sola categoría). Crear cruces o word-buttons sería capacidad nueva fuera de scope.

---

## Sección EXPLÍCITA — Snapshot / re-base D-88: **NO APLICA a Genere e numero**

**Igual que Essere y Verbi di movimento (vs Avere Phase 22).** Genere e numero **NO tiene** blindaje APPEND-ONLY ni snapshot:

- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs` y `scripts/.avere-prefix-snapshot.json` están **hardcodeados a `content/exercises/avere.json`** (avere-only, **0 refs a genero-numero**).
- **NO existe** `.genero-numero-prefix-snapshot.json` (no se busca ni se crea).
- Genere e numero **nunca tuvo** invariante D-88 (el blindaje se creó solo para los 17 ejercicios legacy de Avere en Phase 4).

→ El ejecutor de Task 2 **NO debe**: ejecutar `snapshot-avere-prefix.mjs` ni `assert-avere-prefix-unchanged.mjs`; buscar o crear `.genero-numero-prefix-snapshot.json`; replicar la tarea de re-base D-88. Documentar en el SUMMARY: "Genere e numero no tiene snapshot APPEND-ONLY ni cruces multi-cat ni word-buttons — no aplica re-base D-88 (D-25-10)".

---

## Notas para 25-02 (NO ejecutar aquí) — los 4 ejes de huecos PRIORIZADOS (D-25-04, ambición generosa, sin cuota fija)

1. **(a) INVARIABLES — engorde GENEROSO (trampa A1 estrella):** más acentuados (virtù, libertà, possibilità, qualità) + más extranjerismos en consonante (sport, bar, computer) → mata el calco `cittàs`/`films`. Al slot `genero-numero-invariabili`.
2. **(b) PLURAL `-co/-go` sonido duro — la EXCEPCIÓN:** amico→amici (¡PIERDE el sonido!), greco→greci, nemico→nemici (pierden) vs parco→parchi, medico→medici, lago→laghi (conservan). El contraste conserva/pierde es la trampa real. Al slot `genero-numero-plurale-co-chi`. (La excepción amico→amici NO está en el legacy.)
3. **(c) GÉNERO `-tore→-trice` vs `-e→-essa` — engordar el CONTRASTE:** más -tore (direttore/direttrice) al slot `femminile-trice`; más -e (barone/baronessa, conte/contessa) al slot `femminile-essa`. Cuándo cada sufijo.
4. **(d) PLURAL/FEMENINO base `-o/-a/-e`:** más variantes de las reglas regulares (a `plurale-o-i`, `plurale-a-e`, `plurale-e-i`, `femminile-o-a`) para dar variedad y que el examen no memorice por palabra.

> **VERIFICACIÓN DE REGLA OBLIGATORIA (R-MEMORY exercise_authoring_rules):** cada palabra asignada a una micro-regla debe VERIFICARSE que toma realmente esa forma (verificar el plural/femenino real del sustantivo italiano). **NO inventar excepciones ni meter irregulares puros** (uomo/uomini, mano/mani, uovo/uova → son de Sostantivi irregolari, Phase 27, OUT of scope aquí). Cada candidata la concreta el mapa de 25-02 y la valida el quórum cross-vendor R1-R7 (≥4× correcta, 0 incorrecta, 1-por-1) antes de entrar.

- **Counts de tests/scripts:** se sincronizan en 25-03 contra el conteo REAL final tras 25-02 (`data.exercises.length`). NO se tocan aquí ni se estiman. (Esta reagrupación da **12 slots**; 25-02 puede subir el count con slots NUEVOS de huecos.)

---

*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 25-01.*
