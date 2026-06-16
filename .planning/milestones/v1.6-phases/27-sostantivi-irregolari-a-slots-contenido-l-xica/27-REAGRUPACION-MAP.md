# 27-REAGRUPACION-MAP.md — Sostantivi irregolari → slot+variantes HIBRIDO (mapa de auditoría)

**Fase:** 27-sostantivi-irregolari-a-slots-contenido-l-xica · **Plan:** 27-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 26-01 (Professioni — el precedente DIRECTO y MÁS análogo: la otra léxica resuelta como HIBRIDA con bloque regla CON variantes + bloque léxico SIN variantes) + 25-01 (Genere e numero, granularidad fina por micro-regla de plural/género) + 22-01 (Avere, metodología mapa→rewrite), con el **eje organizador propio HIBRIDO** de esta categoría (D-27-01).
**DIVERGENCIA CLAVE vs Professioni:** este set es **100% MC** (31 MC, 0 match, 0 word-buttons) → conversión MÁS SIMPLE, sin ramas match/WB que preservar. **DIVERGENCIA vs Avere:** NO hay snapshot APPEND-ONLY (avere-only) ni cruces multi-cat (no existen `sustantivos-irregulares-300..305`) ni disputed→override en el set fuente (verificado: 0) → NO se replica la re-base D-88, NO se crean cruces, el move de validation es trivial verbatim.
**Decisiones aplicadas:** D-27-01 (modelo HIBRIDO documentado por bloque), D-27-02 (1 slot por sub-regla en el bloque regla, granularidad FINA, hereda D-26-03/D-25-01; invariabili DIVIDIDA en acentuadas vs extranjeras), D-27-03 (ejes de huecos PRIORIZADOS solo en el bloque regla; bloque léxico/contraste SIN huecos), D-27-04 (verificación de forma plural real obligatoria, R-MEMORY), D-27-05 (boundary fijo = 31; inversos/adjetivo/duplicado a variantes de su lema; contraste sin engorde), D-27-06 (explanations SIN refs a las CATEGORÍAS Genere e numero / Articoli por id ni prosa; el género/número como contenido del ejercicio es válido), D-27-08 (ids TODOS semánticos — sin cruces → sin rango reservado), D-27-09 (merge elegir-la-más-completa + injertar matices), D-27-10 (mover superficies intactas = no re-validar; passes[] verbatim), D-27-12 (SIN snapshot APPEND-ONLY — avere-only).

---

## Resumen de cobertura

31 ids fuente (31 MC, 0 match, 0 word-buttons) → **5 slots**. Cada id 001-031 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 27-02).

**Conteo de slots de esta reagrupación: 5** (es el número base que 27-03 sincronizará — se LEERÁ de `data.exercises.length` real tras Task 2; delta de fase base = −31 + 5 = **−26**, antes de que 27-02 añada variantes nuevas, que NO suben el count). Estado actual de los counts: `sustantivos-irregulares = 31` en los 3 hardcodes; `TOTAL_EXPECTED = 209` → tras el sync, `sustantivos-irregulares = 5` y `TOTAL_EXPECTED = 183` (= 209 − 31 + 5).

| # | Bloque | Slot-id | ids-fuente (→variantes) | nº vars | type |
|---|--------|---------|-------------------------|---------|------|
| 1 | REGLA — sovrabbondanti `-o` sing → `-a` plur fem (cuerpo) | `sustantivos-irregulares-sovrabbondanti` | 002, 003, 006, 007, 020, 021, 022, 023, 029, 030 | 10 | multiple-choice |
| 2 | REGLA — invariabili acentuadas/truncas (vocal tónica final) | `sustantivos-irregulares-invariabili-accentate` | 009, 010, 011 | 3 | multiple-choice |
| 3 | REGLA — invariabili extranjerismos/consonante final | `sustantivos-irregulares-invariabili-straniere` | 012, 013 | 2 | multiple-choice |
| 4 | LEXICO PURO — cambio de raíz (lemas memorizables) | `sustantivos-irregulares-cambio-radice` | 001, 005, 008, 024, 025, 026, 027, 031 | 8 | multiple-choice |
| 5 | CONTRASTE — plurali regolari (parentesco regular, foils) | `sustantivos-irregulares-plurali-regolari` | 004, 014, 015, 016, 017, 018, 019, 028 | 8 | multiple-choice |
| | **TOTAL** | **5 slots** | **31 ids** | **31** | |

**Recuento canónico = 5 slots:** 3 del bloque REGLA (sovrabbondanti + invariabili-accentate + invariabili-straniere) + 1 del bloque LEXICO PURO (cambio-radice) + 1 del bloque CONTRASTE (plurali-regolari) = **5 slots**.

---

## Decision hibrida por bloque (SOST-01 / SOST-02)

**Esta es la resolución EXPLÍCITA de la open question del roadmap ("regla-con-variantes O slots-de-1") — D-27-01.** Sostantivi irregolari NO es léxica pura entera ni rule-rich entera: es HIBRIDA, documentado por bloque:

### BLOQUE REGLA — sovrabbondanti `-o→-a` + invariabili (slots 1-3): regla-con-variantes REAL
- Hay 2 familias-regla reales con variantes intercambiables:
  - **Sovrabbondanti `-o` sing → `-a` plur fem** (partes del cuerpo): familia rica y productiva con ≥6 miembros (uovo/braccio/dito/ginocchio/labbro/osso) — cada palabra es una instancia de la MISMA sub-regla.
  - **Invariabili** (plural = singular): regla real con variantes intercambiables, **DIVIDIDA en dos slots** (D-27-02) porque son DOS motivos distintos de invariabilidad y DOS trampas A1 distintas:
    - **acentuadas/truncas** (città/caffè/università — vocal tónica final bloquea la flexión, calco `*cittadi`/`*caffi`);
    - **extranjeras/consonante** (film/sport — palabra no italiana no flexiona, calco `*films`/`*sports`).
- **SE autoran variantes nuevas en 27-02** (D-27-03). Cada sub-regla lleva huecos marcados.
- Granularidad FINA (D-27-02, hereda D-26-03/D-25-01): 1 slot POR SUB-REGLA. NO un único slot "regla" ni un único slot "invariabili". Razón: mezclar sovrabbondanti `-o/-a` con invariabili difuminaría las trampas A1 distintas; mezclar acentuadas con extranjeras difuminaría los dos porqués distintos de invariabilidad. El examen elige 1 variante al azar DENTRO de cada sub-regla → mata la memorización por palabra sin mezclar reglas.
- **La trampa A1 estrella** = sovrabbondanti masc sing → fem plural (el hispanohablante regulariza `*bracci`, `*uovi`) → engorde generoso en 27-02.
- **SOST-02 se cumple aquí:** hay autoría de variantes donde HAY regla.

### BLOQUE LEXICO PURO — cambio de raíz (slot 4): SIN variantes nuevas
- uomo/dio/bue/tempio son **lemas memorizables, raíz impredecible** (uomo→uomini, dio→dei, bue→buoi, tempio→templi). Comparten el meta-patrón "raíz impredecible, memorízalo", **NO son variantes intercambiables reales** (no se puede sustituir una por otra siguiendo una regla productiva).
- **NO se autora ninguna variante nueva** (SOST-01 lo PROHIBE explícitamente: "no toda celda tiene variantes intercambiables"). Solo reagrupar + explanation a nivel de slot.
- **NO se marcan huecos** en este bloque.
- **SOST-01 se cumple aquí:** se documenta que el bloque léxico/cambio-de-raíz NO admite variantes y no se fuerzan artificiales. Se queda con las superficies existentes (incl. inversos #027/#031, adjetivo #026, duplicado #008==#025).

### BLOQUE CONTRASTE — plurali regolari (slot 5): foils deliberados, SIN engorde
- donna/padre/madre/fratello/sorella/marito NO son irregulares; el autor los puso para **contrastar** con los irregulares (foils deliberados que enseñan a parar y comprobar género/terminación antes de pluralizar).
- **NO se engorda** (D-27-05): no es el propósito de la categoría.
- **NO se marcan huecos.**
- **SIN remitir a Genere e numero** (D-27-06): la regla de plural regular se explica EN SITIO.

---

## Tabla detallada por slot

Leyenda columnas: slot-id · sub-regla/eje/uso · ids-fuente (→variantes) · type · explanation-base elegida + matices a injertar (D-27-09) · bloque · ¿celda candidata a 27-02?

`categoryIds: ["sustantivos-irregulares"]` en TODOS los slots (categoryId único verificado en los 31 ids fuente; no hay cruces multi-cat). `type: "multiple-choice"` en TODOS los slots (el set fuente es 100% MC).

### Bloque REGLA — sovrabbondanti + invariabili (3 sub-reglas SEPARADAS, granularidad FINA D-27-02)

| slot-id | sub-regla | ids-fuente | type | explanation-base + matices | bloque | celda candidata 27-02? |
|---------|-----------|-----------|------|----------------------------|--------|------------------------|
| `sustantivos-irregulares-sovrabbondanti` | masc `-o` sing → fem `-a` plur (partes del cuerpo pareadas) + inversos + orecchio en `-e` | 003 (braccio→braccia), 002 (uovo→uova), 020 (dito→dita), 021 (ginocchio→ginocchia), 022 (osso→ossa), 023 (labbro→labbra), 006 (le braccia lunghe — acuerdo fem del artículo), 007 (orecchio→orecchie EN -e), 029 (braccia→braccio INVERSO), 030 (uova→uovo INVERSO) → **10 vars** | MC | **base = 003** (la más completa, rule-first con la familia explícita: "los sustantivos del cuerpo humano que designan partes pareadas forman el plural en -a y CAMBIAN a género femenino: il braccio (masc) → le braccia (fem); por eso le braccia stanche con concordancia femenina entera; misma familia: dito→dita, osso→ossa, labbro→labbra, uovo→uova"). **Injertar de 002:** la concordancia exige artículo y adjetivo femeninos en plural (le uova fresche, no i uovi freschi); NO *uovi *bracci. **Injertar de 006:** la pareja artículo+sustantivo revela el género del plural irregular: `le` obliga a `braccia` (fem), no `bracci` (masc). **Injertar de 007 (orecchio EN -e, micro-excepción):** orecchio hace `le orecchie` (plural fem en **-e**, NO en -a como braccia); es la excepción dentro de la familia — la concordancia del contexto (le ... grandi) fija la forma femenina. **Injertar de 022 (osso):** para el esqueleto humano `le ossa` (fem); `gli ossi` (masc) se reserva para huesos sueltos/de animales. **Injertar de 023 (labbro):** `le labbra` para los labios del rostro; `i labbri` (masc) designa bordes/orillas. **Injertar de 029/030 (INVERSOS):** trampa central — `braccia`/`uova` terminan en -a y PARECEN femeninas, pero el lema base es masculino (`braccio`/`uovo`); la asimetría de género sing↔plur es la dificultad central. Rule-first: "masc -o sing → fem -a plur (le braccia)". | REGLA | **HUECO D-27-03 eje (a) PRIORIZADO — engorde GENEROSO:** más partes del cuerpo / sobreabundantes A1-A2 (ciglio→ciglia, sopracciglio→sopracciglia, paio→paia, miglio→miglia). **VERIFICAR la forma plural real de cada una; NO plurales inventados (D-27-04).** Trampa A1 estrella (cambio masc→fem). |
| `sustantivos-irregulares-invariabili-accentate` | acentuadas/truncas: vocal tónica final bloquea la flexión (plural = singular) | 009 (città), 010 (caffè), 011 (università) → **3 vars** | MC | **base = 009** (la más completa con la familia explícita: "los sustantivos terminados en vocal acentuada son INVARIABLES: tienen la misma forma en singular y plural; la città / le città se escriben igual, solo el artículo señala el número; misma regla para caffè, virtù, università, tè"). **Injertar de 010:** la vocal final acentuada bloquea CUALQUIER flexión (il caffè / i caffè idénticos); el acento grave sobre la è no se altera ni se elimina al pluralizar; NO *caffi. **Injertar de 011:** toda la familia abstracta en **-tà** (libertà, possibilità, qualità, università) es invariable; NUNCA se pluralizan con -des (calco español incorrecto); NO *universite *cittadi. Rule-first: "vocal tónica final → no flexiona (la città → le città)". | REGLA | **HUECO D-27-03 eje (b):** más acentuadas (virtù, tribù, novità, libertà, qualità...). **VERIFICAR la forma real (D-27-04).** Mata el calco *cittadi/*caffi. |
| `sustantivos-irregulares-invariabili-straniere` | extranjerismos / consonante final: palabra no italiana no flexiona (plural = singular) | 012 (film), 013 (sport) → **2 vars** | MC | **base = 012** (la más completa con la familia explícita: "los anglicismos terminados en consonante son INVARIABLES en italiano: il film / i film idénticos, igual que sport, bar, computer; el italiano NO añade -s al pluralizar (calco del inglés/español); el artículo es lo único que marca el número"). **Injertar de 013 (sport + nota de artículo):** los préstamos del inglés conservan su forma original también en plural (uno sport / gli sport); NOTA de artículo: `uno sport` (no `un sport`) porque empieza por s+consonante, y en plural `gli` (no `i`); NO *films *sports. Rule-first: "extranjerismo / consonante final → no flexiona (il film → i film)". | REGLA | **HUECO D-27-03 eje (c):** más extranjeras / consonante final (bar, computer, autobus, sport-tipo). **VERIFICAR la forma real (D-27-04).** Mata el calco *films/*sports. |

### Bloque LEXICO PURO — cambio de raíz (D-27-01/03, SIN variantes nuevas — SOST-01)

**NO lleva huecos marcados.** SOST-01 prohíbe forzar variantes artificiales: uomo/dio/bue/tempio son lemas memorizables de raíz impredecible, NO variantes intercambiables reales.

| slot-id | uso | ids-fuente | type | explanation-base + matices | bloque | huecos? |
|---------|-----|-----------|------|----------------------------|--------|---------|
| `sustantivos-irregulares-cambio-radice` | plural por cambio de raíz, impredecible: lemas memorizables + inversos + adjetivo + duplicado tempio | 001 (uomo→uomini), 005 (dio→dei), 024 (bue→buoi), 008 (tempio→templi), 025 (tempio→templi DUPLICADO, distractoras distintas), 026 (giovani uomini — ADJETIVO/concordancia), 027 (uomini→uomo INVERSO), 031 (dei→dio INVERSO) → **8 vars** | MC | **base = 001** (rule-first con el meta-patrón: "algunos sustantivos forman el plural por CAMBIO DE RAÍZ, impredecible: hay que aprender el lema como par memorizable; uomo → uomini (no *uomi), dio → dei, bue → buoi, tempio → templi"). **Injertar de 005 (dio):** el artículo plural es `gli dei` (no `i`); no sigue la regla -o→-i (por eso *dii suena mal). **Injertar de 008/025 (tempio, DUPLICADO):** tempio inserta una -l- → i templi; ATENCIÓN a la trampa homófona: `i tempi` (sin -l-) es el plural de `tempo` (los tiempos), lema distinto. Las dos superficies 008 y 025 entran como **2 variantes del lema tempio** (mismo answer `templi`, distractoras distintas = superficies distintas válidas, D-27-05). **Injertar de 024 (bue):** bue inserta una -o- antes de la -i → i buoi (no la regla directa -e→-i que daría *bui). **Injertar de 026 (ADJETIVO):** adjetivo y sustantivo concuerdan SIEMPRE en número/género: un giovane uomo → due giovani uomini (AMBAS flexionadas; giovane -e → giovani -i). **Injertar de 027/031 (INVERSOS):** el lema base de `uomini` es `uomo` (no un falso *uomine); el de `dei` es `dio` (no *deo regularizado) — los plurales con cambio de raíz NO son simétricos, hay que conocer el lema, no derivarlo. Rule-first: "plural por cambio de raíz, impredecible, memorízalo". | LEXICO | **NO** (SOST-01/D-27-03: lemas memorizables, raíz impredecible → no admiten variantes intercambiables; no se fuerzan artificiales) |

### Bloque CONTRASTE — plurali regolari (D-27-05, foils deliberados SIN engorde)

**NO lleva huecos marcados.** Foils deliberados que el autor metió para contrastar con los irregulares. SIN engorde (D-27-05). SIN remitir a Genere e numero (D-27-06).

| slot-id | uso | ids-fuente | type | explanation-base + matices | bloque | huecos? |
|---------|-----|-----------|------|----------------------------|--------|---------|
| `sustantivos-irregulares-plurali-regolari` | plurales REGULARES de parentesco como foils de contraste: -o→-i, -a→-e, -e→-i + inverso + moglie casi-regular | 014 (donna→donne), 015 (padre→padri), 016 (madre→madri), 017 (fratello→fratelli), 018 (sorella→sorelle), 019 (marito→mariti), 028 (donne→donna INVERSO), 004 (moglie→mogli, -e→-i casi-regular) → **8 vars** | MC | **base = 018** (la más completa con el CONTRASTE de reglas por género explícito: "los plurales REGULARES de contraste: femenino -a → -e (la sorella → le sorelle, la donna → le donne); masculino -o → -i (il fratello → i fratelli, il marito → i mariti); hay que PARAR a comprobar el género antes de pluralizar — masc -o→-i, fem -a→-e"). **Injertar de 015/016 (padre/madre, grupo mixto -e→-i):** los terminados en -e (masc o fem) hacen el plural en -i: il padre → i padri, la madre → le madri; el género NO se ve en la -e, solo en el artículo; la -e ya gastó su turno y exige -i (no -e como donna). **Injertar de 017 (fratello):** el plural masc fratelli también designa el grupo mixto hermanos+hermanas. **Injertar de 019 (marito vs moglie):** marito (-o→-i) y moglie (-e→-i) son pareja semántica pero NO comparten regla — la terminación del singular dicta el plural, no el significado. **Injertar de 004 (moglie, casi-regular -e→-i):** la moglie → le mogli; la -e final NO se duplica, se sustituye por -i (no *moglii); mismo patrón que madre/padre. **Injertar de 028 (INVERSO):** el singular de donne es donna (-e plur ↔ -a sing, simetría perfecta fem); donno/donni no existen. Rule-first: "plurales regulares de contraste: -o→-i, -a→-e, -e→-i". **SIN refs a la categoría Genere e numero (D-27-06)** — la regla de plural regular se explica EN SITIO. | CONTRASTE | **NO** (D-27-05: foils deliberados, no es el propósito de la categoría; sin engorde) |

> **UBICACIÓN DE orecchio→orecchie [#007] — DECISIÓN (Claude's Discretion, para confirmación del autor):** **al slot `sustantivos-irregulares-sovrabbondanti`** con la nota del plural en **-e** (no -a) injertada en la explanation. **Recomendación del planner [opción elegida]:** es la misma familia de plural irregular del cuerpo (parte pareada, oído), y la micro-excepción "orecchio hace orecchie en -e, no orecchia" se explica como matiz dentro del slot; no merece slot propio (1 sola palabra fragmentaría). Forma real verificada: `le orecchie` (fem plural en -e) es la forma femenina del contexto; `gli orecchi` (masc plural en -i) es la otra forma admitida pero el ejercicio fuente pide `orecchie` por el artículo+adjetivo femeninos (le ... grandi). **Alternativa:** slot propio o anotación aparte (NO recomendado). **El autor confirma en el checkpoint.**

> **UBICACIÓN DE moglie→mogli [#004] — DECISIÓN (Claude's Discretion, para confirmación del autor):** **al slot `sustantivos-irregulares-plurali-regolari`** como foil casi-regular con la nota "moglie → mogli, -e→-i regular (la -e se sustituye, no se duplica)". **Recomendación del planner [opción elegida]:** moglie→mogli es un plural REGULAR del grupo mixto -e→-i (idéntico a madre→madri), encaja en el bloque de contraste como otro foil regular; no es irregular. **Alternativa:** slot propio (NO recomendado — es plenamente regular). **El autor confirma en el checkpoint.**

> **RESOLUCIÓN DEL DUPLICADO #008 == #025 (tempio→templi):** ambas superficies tienen el MISMO answer (`templi`) y solo difieren en las distractoras (008: `tempi/templi/tempios/tempie`; 025: `tempi/templi/tempios/templios`) → entran como **2 variantes del lema tempio** en el slot `cambio-radice` (D-27-05): mismo answer, distractoras distintas = superficies distintas válidas, sin redundancia de slot. NO se crea un slot duplicado. Boundary fijo = 31 superficies base preservadas.

---

## Asignación de inversos / adjetivo (D-27-05)

| id | superficie | dirección | slot destino | razón |
|----|-----------|-----------|--------------|-------|
| 026 | giovani uomini | adjetivo/concordancia | `cambio-radice` | drilla la concordancia adjetivo+sustantivo sobre el lema uomo→uomini |
| 027 | uomini → uomo | inverso plural→singular | `cambio-radice` | recupera el lema base uomo (no *uomine) |
| 029 | braccia → braccio | inverso plural→singular | `sovrabbondanti` | recupera el masc braccio desde el fem braccia (trampa central de género) |
| 030 | uova → uovo | inverso plural→singular | `sovrabbondanti` | recupera el masc uovo desde el fem uova |
| 031 | dei → dio | inverso plural→singular | `cambio-radice` | recupera el lema dio (no *deo regularizado) |
| 028 | donne → donna | inverso plural→singular | `plurali-regolari` | recupera el sing donna (simetría fem -e↔-a) |

Todos drillan la misma regla EN REVERSA / el acuerdo de adjetivo → van a `variants[]` del slot de su lema/regla.

---

## Criterio de merge de `validation` (D-27-10)

**Los 31 ejercicios fuente llevan quórum LIMPIO** `claude-opus-4-7` + `claude-sonnet-4-6` **ambas `correcta`, 0 concerns**. **NO hay disputed→override en el set fuente (verificado: 0)** → el move de validation es trivial verbatim (DIVERGENCIA vs Professioni, que tenía el override de 020 collega).

- **Slots multi-variante** (criterio = `validation` de la BASE elegida en cada tabla; las superficies se mueven INTACTAS, D-27-10 → no se re-valida):
  - `sustantivos-irregulares-sovrabbondanti` → base 003 (quórum limpio)
  - `sustantivos-irregulares-invariabili-accentate` → base 009 (quórum limpio)
  - `sustantivos-irregulares-invariabili-straniere` → base 012 (quórum limpio)
  - `sustantivos-irregulares-cambio-radice` → base 001 (quórum limpio)
  - `sustantivos-irregulares-plurali-regolari` → base 018 (quórum limpio)
- **Criterio elegido = validation de la base.** Como TODAS las superficies fuente tienen el mismo quórum limpio Opus 4.7 + Sonnet 4.6 ambas `correcta`, el resultado es idéntico independientemente de la base elegida. Alternativa (fusionar passes[] de todas las variantes) descartada por simplicidad. Se registrará en el SUMMARY. El autor puede pedir la fusión en el checkpoint.

---

## Sección EXPLÍCITA — Sin cruces multi-cat: no existen sustantivos-irregulares-300..305

**Igual que Professioni (Phase 26), Genere e numero (Phase 25) y Verbi di movimento (Phase 24).** Sostantivi irregolari **NO tiene cruces multi-cat**:

- El set legacy tiene **31 MC (001-031)**, **TODOS con `categoryId` único `sustantivos-irregulares`** (verificado en el JSON: 0 ids con 2+ categorías, 0 ids en rango 300..305, 0 match, 0 word-buttons).
- Essere/Avere tenían 6 cruces cada uno (essere-300..305 / avere-300..305). **AQUÍ NO existen.**

→ El ejecutor de Task 2 **NO debe**: crear ningún id `sustantivos-irregulares-30[0-5]`; copiar la columna de cruces de Essere/Avere; reservar ningún rango. **TODOS los ids son semánticos** (D-27-08: sin cruces → sin rango reservado): `sustantivos-irregulares-sovrabbondanti`, `-invariabili-accentate`, `-invariabili-straniere`, `-cambio-radice`, `-plurali-regolari`. **TODOS los slots `categoryIds: ["sustantivos-irregulares"]`** (1 sola categoría). Crear cruces sería capacidad nueva fuera de scope.

---

## Sección EXPLÍCITA — Set 100% MC: sin slots match / word-buttons

**DIVERGENCIA vs Professioni (que tenía 3 match + 5 word-buttons) y vs Genere e numero (2-3 match).** El set fuente de Sostantivi irregolari es **100% multiple-choice** (31 MC, 0 match, 0 word-buttons, verificado).

→ El ejecutor de Task 2 **NO debe**: emitir ningún slot `type: "match"` ni `type: "word-buttons"`; copiar las ramas match/WB de los planes 26-01/25-01. **TODOS los slots `type: "multiple-choice"`** con variantes `{prompt, options, correctIndex}`. Conversión MÁS SIMPLE que Professioni/Genere e numero.

---

## Sección EXPLÍCITA — Snapshot / re-base D-88: **NO APLICA a Sostantivi irregolari**

**Igual que Professioni, Essere, Verbi di movimento y Genere e numero (vs Avere Phase 22).** Sostantivi irregolari **NO tiene** blindaje APPEND-ONLY ni snapshot:

- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs` y `scripts/.avere-prefix-snapshot.json` están **hardcodeados a `content/exercises/avere.json`** (avere-only, **0 refs activas a sustantivos**).
- **NO existe** `.sustantivos-irregulares-prefix-snapshot.json` (no se busca ni se crea).
- Sostantivi irregolari **nunca tuvo** invariante D-88 (el blindaje se creó solo para los 17 ejercicios legacy de Avere en Phase 4).

→ El ejecutor de Task 2 **NO debe**: ejecutar `snapshot-avere-prefix.mjs` ni `assert-avere-prefix-unchanged.mjs`; buscar o crear `.sustantivos-irregulares-prefix-snapshot.json`; replicar la tarea de re-base D-88. Documentar en el SUMMARY: "Sostantivi irregolari no tiene snapshot APPEND-ONLY ni cruces multi-cat ni disputed→override (verificado 0) — no aplica re-base D-88".

---

## Notas para 27-02 (NO ejecutar aquí) — ejes de huecos PRIORIZADOS (D-27-03, ambición generosa, sin cuota fija) — SOLO en el BLOQUE REGLA

1. **(a) sovrabbondanti `-o→-a` (cuerpo) — engorde GENEROSO (trampa A1 estrella, cambio masc→fem):** más partes del cuerpo / sobreabundantes A1-A2 plausibles (ciglio→ciglia, sopracciglio→sopracciglia, paio→paia, miglio→miglia). Al slot `sustantivos-irregulares-sovrabbondanti`.
2. **(b) invariabili-accentate (vocal tónica final) — variedad:** más acentuadas (virtù, tribù, novità, libertà, qualità). Al slot `sustantivos-irregulares-invariabili-accentate`. Mata el calco *cittadi/*caffi.
3. **(c) invariabili-straniere (extranjerismos/consonante) — variedad:** más extranjeras/consonante final (bar, computer, autobus). Al slot `sustantivos-irregulares-invariabili-straniere`. Mata el calco *films/*sports.

> **VERIFICACIÓN DE REGLA OBLIGATORIA (D-27-04, R-MEMORY exercise_authoring_rules):** cada palabra asignada a una sub-regla debe VERIFICARSE que toma realmente esa forma plural en italiano (verificar la forma plural real). **NO inventar plurales inexistentes** ni declarar invariable una palabra que sí flexiona, ni meter al bloque léxico/contraste variantes. Cada candidata la concreta el mapa de 27-02 y la valida el quórum cross-vendor R1-R7 (≥4× correcta, 0 incorrecta, 1-por-1) antes de entrar.

> **EL BLOQUE LEXICO (cambio-radice) Y EL DE CONTRASTE (plurali-regolari) NO LLEVAN HUECOS MARCADOS** (D-27-03/SOST-01/D-27-05: no se fuerzan variantes artificiales en lemas de raíz impredecible; no se engorda el contraste — no es el propósito de la categoría). SOLO los 3 slots del bloque regla (sovrabbondanti + invariabili-accentate + invariabili-straniere) llevan huecos.

- **Counts de tests/scripts:** se sincronizan en 27-03 contra el conteo REAL final tras 27-02 (`data.exercises.length`). NO se tocan aquí ni se estiman. (Esta reagrupación da **5 slots**; 27-02 puede subir el count solo si materializa slots NUEVOS de huecos — las variantes nuevas NO suben el count. Delta base de fase = −31 + 5 = **−26**; TOTAL_EXPECTED 209 → 183.)

---

*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 27-01.*
