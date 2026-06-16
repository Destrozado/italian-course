# 26-REAGRUPACION-MAP.md — Professioni → slot+variantes HIBRIDO (mapa de auditoría)

**Fase:** 26-professioni-a-slots-contenido-l-xica · **Plan:** 26-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 25-01 (Genere e numero) + 24-01 (Verbi di movimento, word-buttons) + 23-01 (Essere) + 22-01 (Avere), con el **eje organizador propio HIBRIDO** de esta categoría (D-26-01): el grueso es **feminización masc→fem** (regla rule-rich, granularidad FINA por sub-regla, análoga a la familia femminile de Genere e numero Phase 25, CON huecos a engordar en 26-02) y una minoría es **léxico puro** (comprensión + match lugar/herramienta/acción) que NO admite variantes intercambiables (PROF-01) → se reagrupa SIN huecos.
**Decisiones aplicadas:** D-26-01 (modelo HIBRIDO documentado por bloque), D-26-02 (bloque léxico SIN variantes; los 3 match preservan type:match D-04), D-26-03 (1 slot por sub-regla de feminización, granularidad FINA, hereda D-25-01), D-26-04 (ejes de huecos PRIORIZADOS solo en feminización), D-26-05 (explanations SIN refs a las CATEGORÍAS Articoli/Essere/Genere por id ni prosa; el artículo/essere/plural como contenido del ejercicio es válido), D-26-06 (word-buttons preservados como type:word-buttons), D-26-08 (ids TODOS semánticos — sin cruces → sin rango reservado), D-26-09 (merge elegir-la-más-completa + injertar matices), D-26-10 (mover superficies intactas = no re-validar; passes[] verbatim, incluido el disputed→override del autor de 020 collega), D-26-12 (SIN snapshot APPEND-ONLY — avere-only).

---

## Resumen de cobertura

51 ids fuente (43 MC + 3 match + 5 word-buttons) → **11 slots**. Cada id 001-043, 100-104, 200/201/202 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 26-02).

**Conteo de slots de esta reagrupación: 11** (es el número base que 26-03 sincronizará — se LEERÁ de `data.exercises.length` real tras Task 2; delta de fase base = −51 + 11 = −40, antes de que 26-02 añada variantes nuevas, que NO suben el count).

| # | Bloque | Slot-id | ids-fuente (→variantes) | type |
|---|--------|---------|-------------------------|------|
| 1 | REGLA — feminización `-o/-a` (+ chirurgo irregular) | `profesiones-femminile-o-a` | 001, 002, 003, 004, 005, 006, 007, 008, 034, 035 | multiple-choice |
| 2 | REGLA — feminización `-iere/-iera` | `profesiones-femminile-iera` | 009, 010, 011, 012 | multiple-choice |
| 3 | REGLA — feminización `-tore/-trice` | `profesiones-femminile-trice` | 013, 014, 029, 030, 031, 032, 033, 042 | multiple-choice |
| 4 | REGLA — feminización `-e/-ore→-essa` | `profesiones-femminile-essa` | 015, 016, 017, 041 | multiple-choice |
| 5 | REGLA — invariables `-ista/-ante/-nte`/griego/anglicismo | `profesiones-invariabili` | 018, 019, 020, 021, 022, 023, 024, 025, 026, 027, 028, 043 | multiple-choice |
| 6 | LEXICO — comprensión (inferir profesión por descripción) | `profesiones-comprensione` | 039, 040 | multiple-choice |
| 7 | LEXICO — match profesión↔lugar | `profesiones-luogo` | 200 | match |
| 8 | LEXICO — match profesión↔herramienta | `profesiones-strumento` | 201 | match |
| 9 | LEXICO — match profesión↔acción/verbo | `profesiones-azione` | 202 | match |
| 10 | SOLAPE — artículo por sonido (MC) | `profesiones-articolo-suono` | 036, 037, 038 | multiple-choice |
| 11 | SOLAPE — word-buttons essere + profesión | `profesiones-essere-wb` | 100, 101, 102, 103, 104 | word-buttons |
| | **TOTAL** | **11 slots** | **51 ids** | |

**Recuento canónico = 11 slots:** 5 feminización (o-a, iera, trice, essa, invariabili) + 1 comprensión MC + 3 match (luogo, strumento, azione, slots-de-1 cada uno) + 1 articolo-suono MC + 1 word-buttons = **11 slots**.

---

## Decision hibrida por bloque (PROF-01 / PROF-02)

**Esta es la resolución EXPLÍCITA de la open question del roadmap ("regla-con-variantes O slots-de-1") — D-26-01.** Professioni NO es léxica pura: es HIBRIDA, documentado por bloque:

### BLOQUE REGLA — feminización masc→fem (slots 1-5): regla-con-variantes REAL
- La feminización por terminación es una regla rica con variantes intercambiables reales (cada palabra que toma `-a`/`-iera`/`-trice`/`-essa` o que es invariable es una instancia de la misma sub-regla). Análoga 1:1 a la familia femminile de Genere e numero (Phase 25, slots `femminile-o-a`/`-trice`/`-essa`).
- **SE autoran variantes nuevas en 26-02** (D-26-04). Cada sub-regla lleva huecos marcados.
- Granularidad FINA (D-26-03, hereda D-25-01): 1 slot POR SUB-REGLA. NO un único slot "feminización". Razón: mezclar `-tore/-trice` con `-e/-essa` difuminaría el CONTRASTE de sufijos que es la trampa A1 estrella (attore→attrice vs dottore→dottoressa). El examen elige 1 variante al azar DENTRO de cada sub-regla → mata la memorización por palabra sin mezclar reglas.
- **Las invariables van a UN slot dedicado** (slot 5): mata el calco hispanohablante "la dentistessa"/"la cantantessa" aislándolo.
- **PROF-02 se cumple aquí:** hay autoría de variantes donde HAY regla.

### BLOQUE LEXICO PURO — comprensión + 3 match (slots 6-9): SIN variantes nuevas
- La comprensión (039/040: bisturí→cirujano, prepara platos→cocinera) y los 3 match (profesión↔lugar/herramienta/acción) NO admiten variantes intercambiables: la pista es por SIGNIFICADO/campo léxico, NO derivable por raíz (DESIGN RULE D-04).
- **NO se autora ninguna variante nueva** (PROF-01 lo PROHIBE explícitamente: "no toda celda tiene variantes intercambiables"). Solo reagrupar + explanation a nivel de slot.
- **NO se marcan huecos** en este bloque.
- Los 3 match PRESERVAN type:match (D-26-02/D-04): profesión↔lugar/herramienta/acción no es derivable por raíz → no se convierten a multiple-choice.
- **PROF-01 se cumple aquí:** se documenta que el bloque léxico NO admite variantes y no se fuerzan artificiales.

### BLOQUE SOLAPE — articolo-suono + word-buttons (slots 10-11)
- Slot 10 (articolo-suono, MC): la regla del artículo por sonido SÍ admite variedad pero ya tiene 3 superficies; engorde cauto opcional en 26-02. La explanation explica la regla EN SITIO sin remitir a Articoli (D-26-05).
- Slot 11 (word-buttons, D-26-06): se conserva como type:word-buttons (precedente Phase 24). La explanation explica essere predicativo + concordancia/plural EN SITIO sin remitir a Essere ni a Genere e numero (D-26-05).

---

## Tabla detallada por slot

Leyenda columnas: slot-id · sub-regla/eje/uso · ids-fuente (→variantes) · type · explanation-base elegida + matices a injertar (D-26-09) · bloque · ¿celda pobre candidata a 26-02?

`categoryIds: ["profesiones"]` en TODOS los slots (categoryId único verificado en los 51 ids fuente; no hay cruces multi-cat).

### Bloque REGLA — feminización masc→fem (5 sub-reglas SEPARADAS, granularidad FINA D-26-03)

| slot-id | sub-regla | ids-fuente | type | explanation-base + matices | bloque | celda pobre? |
|---------|-----------|-----------|------|----------------------------|--------|--------------|
| `profesiones-femminile-o-a` | masc `-o` → fem `-a` (regular) + chirurgo IRREGULAR (-o→-a SIN h) | 001 (cuoco→cuoca), 002 (impiegato→impiegata), 003 (avvocato→avvocata), 004 (segretario→segretaria), 005 (poliziotto→poliziotta), 006 (fotografo→fotografa), 007 (architetto→architetta), 008 (meccanico→meccanica), 034 (chirurgo→chirurga IRREGULAR), 035 (commesso→commessa) → **10 vars** | MC | **base = 001** (rule-first: "el femenino regular más productivo cambia la -o final por -a: cuoco→cuoca, impiegato→impiegata"). **Injertar de 002:** los sufijos -essa y -trice NO son comodines (pertenecen a otras familias); -o→-a no los toma. **Injertar de 034 (chirurgo IRREGULAR):** chirurgo→chirurga conserva el -o→-a SIN insertar la H pese a terminar en -go; cuidado con el falso amigo léxico "la chirurgia" = la cirugía (disciplina), NO la cirujana. **Injertar de 006:** falso amigo "la fotografia" = la foto, NO la fotógrafa (es fotografa). **Injertar de 008:** "la meccanica" también es la disciplina (ambigüedad léxica). Rule-first. | REGLA | RICA (10 vars); **HUECO D-26-04 eje (c):** más -o/-a y la peculiaridad chirurgo en 26-02 |
| `profesiones-femminile-iera` | `-iere` → `-iera` (productiva, profesiones de servicio) | 009 (cameriere→cameriera), 010 (infermiere→infermiera), 011 (parrucchiere→parrucchiera), 012 (portiere→portiera) → **4 vars** | MC | **base = 009** (la más completa: "la familia -iere/-iera es productiva en profesiones de servicio: cameriere→cameriera; el patrón cubre infermiere/parrucchiere/portiere, estable y predecible"). **Injertar de 010:** elisión del artículo ante vocal (l'infermiere/l'infermiera); NO es invariable como cantante. **Injertar de 012:** ambigüedad léxica "la portiera" = la puerta del coche; el contexto fija la lectura profesional. Rule-first: "-iere → -iera". | REGLA | RICA (4 vars); **HUECO D-26-04 eje (c):** más -iere/-iera en 26-02 |
| `profesiones-femminile-trice` | `-tore` → `-trice` (agente derivado pierde -o, toma -ice) | 013 (attore→attrice), 014 (direttore→direttrice), 029 (programmatore→programmatrice), 030 (allenatore→allenatrice), 031 (pittore→pittrice), 032 (traduttore→traduttrice), 033 (ricercatore→ricercatrice), 042 (par MC attore/attrice por contexto "recita in film/teatro") → **8 vars** | MC | **base = 013** (la más completa: "la familia -tore/-trice: el masculino -tore pierde la O y añade -ice: attore→attrice; mismo patrón en scrittore→scrittrice"). **Injertar de 014 (CONTRASTE A1 central):** distinguir -tore/-trice (attore, direttore → -trice) de -e/-essa (dottore, professore → -essa); el alumno confunde direttore con dottore por el -ore final, pero direttore es agente derivado (→ -trice) y dottore no (→ -essa). **Injertar de 042:** quien "recita in un film/teatro" es attore/attrice (no cantante/pittore/regista) — refuerzo por contexto de la pareja masc/fem. Rule-first: "-tore → -trice". | REGLA | RICA (8 vars); **HUECO D-26-04 eje (a) PRIORIZADO:** engordar el CONTRASTE -trice vs -essa (más -tore: scrittore→scrittrice, lettore→lettrice) en 26-02 |
| `profesiones-femminile-essa` | `-e/-ore` → `-essa` (sufijo prestigioso) | 015 (dottore→dottoressa), 016 (professore→professoressa), 017 (studente→studentessa), 041 (par MC professore/professoressa por contexto "insegna a scuola") → **4 vars** | MC | **base = 015** (la más completa con el CONTRASTE explícito: "la familia -e/-essa: el masculino -e añade el sufijo -essa: dottore→dottoressa; OJO: aunque dottore termina en -ore, NO es agente derivado tipo att-ore/diret-tore, por eso NO toma -trice; el calco dottora también falla"). **Injertar de 016:** el español calca "profesora" (regla -a simple) pero el italiano A1 exige el sufijo -essa completo. **Injertar de 017:** NO todas las -e flexionan; algunas son invariables (cantante/insegnante), pero studente SÍ → studentessa. **Injertar de 041:** quien "insegna a scuola" es professore/professoressa (no studente, que aprende; no direttore, que dirige) — refuerzo por contexto de la pareja masc/fem. Rule-first: "-e/-ore → -essa". | REGLA | RICA (4 vars); **HUECO D-26-04 eje (a) PRIORIZADO:** engordar el CONTRASTE -essa vs -trice (más -e: barone→baronessa, conte→contessa, oste→ostessa) en 26-02 |
| `profesiones-invariabili` | invariables: `-ista`/`-ante`/`-nte`/griego-en-a/anglicismo NO cambian; solo el artículo distingue | 018 (cantante), 019 (insegnante), 020 (collega — DISPUTED→override del autor), 021 (cliente), 022 (dentista), 023 (pianista), 024 (farmacista), 025 (giornalista), 026 (tassista), 027 (pilota), 028 (manager), 043 (identificación-MC "la única invariable es dentista") → **12 vars** | MC | **base = 022** (la más completa para la familia -ista: "TODAS las profesiones en -ista son INVARIABLES: dentista, pianista, giornalista, farmacista, tassista; el sustantivo no cambia, solo el artículo distingue: il dentista / la dentista"). **Injertar de 018 (-nte invariable):** los participios presentes en -nte (cantante, insegnante, dirigente) son invariables; NUNCA "la cantantessa". **Injertar de 020 (collega):** collega termina en -a pero NO viene de -o→-a; es invariable, solo cambia el artículo (il collega / la collega); plural i colleghi / le colleghe con H. **Injertar de 027 (pilota, griego en -a):** pilota ya termina en -a en masculino (nunca "il piloto"); familia con poeta/atleta. **Injertar de 028 (anglicismo):** los préstamos del inglés (manager, designer, freelance) son invariables; NO italianizan ni toman -s. **Injertar de 043:** meta-regla — identificar la propiedad estructural invariable vs flexionable. **Hilo conductor = anti-calco "la dentistessa"/"la cantantessa".** Rule-first. | REGLA | RICA (12 vars); **HUECO D-26-04 eje (b) PRIORIZADO — engorde GENEROSO:** más -ista (artista, autista, regista, turista) + más -ante/-nte (comandante) → mata el calco la-dentistessa/la-cantantessa, la trampa A1 estrella del hispanohablante, en 26-02 |

### Bloque LEXICO PURO — comprensión + 3 match (D-26-02/D-04, SIN variantes nuevas — PROF-01)

**NO lleva huecos marcados.** PROF-01 prohíbe forzar variantes artificiales: la pista es por significado/campo léxico, NO derivable por raíz (D-04).

| slot-id | uso | ids-fuente | type | explanation-base + matices | bloque | huecos? |
|---------|-----|-----------|------|----------------------------|--------|---------|
| `profesiones-comprensione` | inferir la profesión por la acción/contexto (MC) — NO por la morfología | 039 (bisturi+ospedali → chirurgo), 040 (prepara piatti in ristorante → cuoca) → **2 vars** | MC | **base = 040** (la más completa y con la trampa explícita: "infiere la profesión por la ACCIÓN del verbo, no solo por el lugar; quien prepara piatti es la cuoca, no la cameriera que sirve — ambas en el ristorante, pero la acción distingue: la cocinera prepara, la camarera sirve"). **Injertar de 039:** el campo léxico clínico (bisturi, ospedali) fija al chirurgo; el significado de la frase importa tanto como la gramática. Rule-first: "inferir la profesión por la acción/contexto". | LEXICO | NO (PROF-01: sin variantes nuevas) |
| `profesiones-luogo` | emparejar profesión ↔ lugar de trabajo (match) | 200 (cuoco↔cucina, chirurgo↔ospedale, professore↔scuola, commesso↔negozio, cameriere↔ristorante; 5 pares) → **1 var (slot-de-1)** | match | sube tal cual (200): "cada profesión se asocia a su lugar de trabajo característico por campo léxico: cuoco↔cucina, chirurgo↔ospedale, professore↔scuola, commesso↔negozio, cameriere↔ristorante; la pista es el vocabulario del lugar, NO la raíz de la palabra (D-04)". | LEXICO | NO (PROF-01) |
| `profesiones-strumento` | emparejar profesión ↔ herramienta característica (match) | 201 (cuoco↔padella, chirurgo↔bisturi, infermiere↔siringa, pittore↔pennello, meccanico↔chiave; 5 pares) → **1 var (slot-de-1)** | match | sube tal cual (201): "cada profesión se asocia a una herramienta característica: cuoco↔padella, chirurgo↔bisturi, infermiere↔siringa, pittore↔pennello, meccanico↔chiave; ambigüedad léxica chiave = también llave de casa, el contexto del mecánico fija el sentido". | LEXICO | NO (PROF-01) |
| `profesiones-azione` | emparejar profesión ↔ acción/verbo del oficio (match) | 202 (insegnante↔insegnare, pittore↔dipingere, cantante↔cantare, traduttore↔tradurre, direttore↔dirigere; 5 pares) → **1 var (slot-de-1)** | match | sube tal cual (202): "cada profesión se asocia a un infinitivo verbal; algunas transparentes (cantante↔cantare, insegnante↔insegnare) y otras exigen saber el verbo etimológico no derivable de la raíz: pittore↔dipingere, direttore↔dirigere, traduttore↔tradurre (-re irregular)". | LEXICO | NO (PROF-01) |

> **AGRUPACIÓN DE LOS 3 MATCH — DECISIÓN (Claude's Discretion, para confirmación del autor):** **3 slots-de-1 type:match separados** (`profesiones-luogo`, `profesiones-strumento`, `profesiones-azione`). Recomendación del planner [opción elegida en este mapa]: cada eje es una REGLA distinta (lugar / herramienta / acción son inferencias léxicas independientes); fundirlos en un solo slot mezclaría tres reglas léxicas distintas. Alternativa que el autor puede elegir: agruparlos en 1 slot `profesiones-lexico-match` con 3 variantes (NO recomendado — son ejes semánticos distintos). SIN variantes nuevas en ninguno (D-26-02). **El autor confirma 3-slots vs agrupado en el checkpoint.**

> **COMPRENSIÓN 039/040 — DECISIÓN (Claude's Discretion, para confirmación del autor):** **1 slot `profesiones-comprensione` con 2 variantes.** Recomendación del planner [opción elegida]: misma regla "inferir la profesión por la acción/contexto, no por la morfología"; 039 (bisturí→cirujano) y 040 (prepara platos→cocinera) son dos instancias de la misma regla de comprensión léxica → variantes intercambiables del mismo slot. Alternativa: 2 slots-de-1. SIN variantes nuevas (D-26-02). **El autor confirma 1-slot vs 2-slots en el checkpoint.**

### Bloque SOLAPE — articolo-suono + word-buttons (D-26-05/D-26-06)

**RESTRICCIÓN D-26-05 (análoga a D-25-02/D-24-07/D-159):** las explanations NO referencian las CATEGORÍAS Articoli/Essere/Genere por id ni por prosa (cero "ver Articoli/Essere/Genere", cero `articoli-`/`essere-`/`genero-numero-` ids). Usar el artículo (il/lo/l'), essere (sono/sei/è/siamo/siete) y el plural (studenti/professori) como CONTENIDO del ejercicio SÍ es válido e inevitable (es la regla del slot).

| slot-id | regla | ids-fuente | type | explanation-base + matices | bloque | celda pobre? |
|---------|-------|-----------|------|----------------------------|--------|--------------|
| `profesiones-articolo-suono` | el artículo definido depende del SONIDO inicial: l' ante vocal, lo ante s+cons/z/ps/gn, il en el resto | 036 (l'avvocato, elisión masc ante vocal, correctIndex `l'`), 037 (lo studente, lo ante s+cons, correctIndex `lo`), 038 (l'infermiera, elisión fem ante vocal, correctIndex `l'`) → **3 vars** | MC | **base = 037** (la más completa: enumera los disparadores de `lo` "s+consonante, z, ps, gn"). **Injertar de 036:** ante VOCAL el artículo masc se elide → l'avvocato (no il avvocato ni lo avvocato); apóstrofe ASCII U+0027 obligatorio. **Injertar de 038:** la elisión femenina también opera ante vocal → l'infermiera (no la infermiera). **Trampa A1:** el hispanohablante calca "il studente" porque la s- inicial no le suena anómala, pero el italiano exige "lo". Rule-first: "el artículo depende del SONIDO inicial". **SIN refs a la categoría Articoli (D-26-05)** — la regla del artículo se explica EN SITIO. | SOLAPE | celda OK (3 vars); **D-26-04:** engorde cauto opcional en 26-02 (lo psicologo, lo zaino, l'attore) |
| `profesiones-essere-wb` | essere + profesión: la profesión predicativa va con essere y concuerda en género/número con el sujeto | 100 (io sono dottoressa), 101 (lei è avvocata), 102 (noi siamo studenti), 103 (tu sei infermiere), 104 (voi siete professori) → **5 vars** | word-buttons | **base = 100** (la más completa para la mecánica essere + femenino: "essere + profesión: la profesión predicativa va con essere y concuerda en género/número con el sujeto; io→sono + dottoressa, NO io→sei"). **Injertar de 101:** la profesión predicativa exige essere, NO avere (el calco "ella ha de abogada" no existe; distractora `ho`); concordancia de género con sujeto femenino (avvocata, no avvocato). **Injertar de 102:** un grupo mixto se concuerda en masculino plural (studenti cubre hombres y mujeres). **Injertar de 103:** sujeto masculino tu → infermiere (no infermiera); tu→sei (no è). **Injertar de 104:** voi→siete; essere no avere (distractora abbiamo). Rule-first: "essere + profesión concuerda en género/número". **SIN refs a las categorías Essere ni Genere e numero (D-26-05)** — el uso de essere predicativo y el plural se explican EN SITIO. | SOLAPE | RICA (5 vars); D-26-06: word-buttons preservados |

> **WORD-BUTTONS 100-104 — DECISIÓN (Claude's Discretion, D-26-06, para confirmación del autor):** **1 slot WB único `profesiones-essere-wb` con los 5 como variantes.** Recomendación del planner [opción elegida]: los 5 entrenan la misma regla "essere + profesión concuerda en género/número"; modelarlos como 1 slot WB con 5 variantes `{prompt, answer, distractors}` (precedente Phase 24). Alternativa: varios slots WB. **El autor confirma 1-slot vs varios en el checkpoint.**

> **ARTICOLO-SUONO 036/037/038 — DECISIÓN (Claude's Discretion, para confirmación del autor):** **1 slot `profesiones-articolo-suono` con 3 variantes.** Recomendación del planner [opción elegida]: la regla es única "el artículo depende del sonido inicial"; las 3 superficies (l'avvocato, lo studente, l'infermiera) son instancias → variantes del mismo slot. Alternativa: varios slots. **El autor confirma 1-slot vs varios en el checkpoint.**

---

## Ubicación de los casos especiales (para confirmación del autor con forma real verificada)

| caso | ubicación propuesta | forma real verificada | razón |
|------|---------------------|----------------------|-------|
| **034 chirurgo (-o→-a IRREGULAR sin H)** | slot `profesiones-femminile-o-a` (con la nota de la NO-inserción-de-H injertada en la explanation) | chirurgo → **chirurga** (es -o→-a, conserva la peculiaridad de NO insertar H pese a -go) | es esencialmente -o→-a; la peculiaridad (no-H) se explica como matiz dentro del slot, no merece slot propio. **Recomendado por el planner.** Alternativa: slot propio (NO recomendado — fragmentaría por 1 sola palabra). |
| **042 par MC attore/attrice** ("recita in film/teatro") | slot `profesiones-femminile-trice` | attore → **attrice** (-tore→-trice) | refuerza la familia -tore/-trice por contexto. **Recomendado.** |
| **041 par MC professore/professoressa** ("insegna a scuola") | slot `profesiones-femminile-essa` | professore → **professoressa** (-e→-essa) | refuerza la familia -e/-essa por contexto. **Recomendado.** |
| **043 identificación-MC** ("la única invariable es dentista") | slot `profesiones-invariabili` | dentista = invariable (-ista) | refuerza la familia invariable. **Recomendado.** |

---

## Criterio de merge de `validation` (D-26-10)

Todos los 51 ejercicios fuente llevan quórum limpio `claude-opus-4-7` + `claude-sonnet-4-6` ambas `correcta` **EXCEPTO 020 collega** (Sonnet marcó `[C5-leak] collega aparece en el prompt (es invariable)` como `incorrecta`, **resuelto con override del autor → `correcta`**: "mostrar el masculino y pedir el femenino es el mecanismo para testear invariabilidad — elegir collega frente a colleghessa/colleghe; coherente con las demás invariables validadas cantante/dentista/pianista/tassista/pilota"). Este disputed→override se preserva **verbatim** (D-26-10; no se re-valida).

- **Slots-de-1** (`profesiones-luogo` ← 200, `profesiones-strumento` ← 201, `profesiones-azione` ← 202): el `validation` top-level del único ejercicio fuente sube **verbatim**.
- **Slots multi-variante** (criterio = `validation` de la BASE elegida en cada tabla; las superficies se mueven INTACTAS, D-26-10 → no se re-valida):
  - `profesiones-femminile-o-a` → base 001 (quórum limpio)
  - `profesiones-femminile-iera` → base 009 (quórum limpio)
  - `profesiones-femminile-trice` → base 013 (quórum limpio)
  - `profesiones-femminile-essa` → base 015 (quórum limpio)
  - `profesiones-invariabili` → base 022 (quórum limpio). **OJO:** 020 (collega) entra como variante NO-base de este slot y lleva el disputed→override del autor; su validation con override se conserva en el JSON tras moverlo (la validation top-level del slot es la de la base 022, quórum limpio; el override es de política sobre el formato "mostrar masc / pedir fem", ya cubierto por la regla del slot invariabili). El acceptance del plan asserta que el override del autor sigue presente en el JSON.
  - `profesiones-comprensione` → base 040 (quórum limpio)
  - `profesiones-articolo-suono` → base 037 (quórum limpio)
  - `profesiones-essere-wb` → base 100 (quórum limpio)
- **Criterio elegido = validation de la base.** Alternativa (fusionar passes[] de todas las variantes) descartada por simplicidad. Se registrará en el SUMMARY. El autor puede pedir la fusión en el checkpoint.

> **Preservación del override 020 collega (D-26-10):** verbatim, no re-validar. El acceptance del plan verifica programáticamente que algún slot del JSON contiene un `validation` con `override` del `by: "autor"`.

---

## Sección EXPLÍCITA — Sin cruces multi-cat: no existen profesiones-300..305

**Igual que Genere e numero (Phase 25) y Verbi di movimento (Phase 24).** Professioni **NO tiene cruces multi-cat**:

- El set legacy tiene **43 MC (001-043) + 5 word-buttons (100-104) + 3 match (200/201/202)** = 51 ids, **TODOS con `categoryId` único `profesiones`** (verificado en el JSON: 0 ids con 2+ categorías, 0 ids en rango 300..305).
- Essere/Avere tenían 6 cruces cada uno (essere-300..305 / avere-300..305). **AQUÍ NO existen.**

→ El ejecutor de Task 2 **NO debe**: crear ningún id `profesiones-30[0-5]`; copiar la columna de cruces de Essere/Avere; reservar ningún rango. **TODOS los ids son semánticos** (D-26-08: sin cruces → sin rango reservado): `profesiones-femminile-o-a`, `-femminile-iera`, `-femminile-trice`, `-femminile-essa`, `-invariabili`, `-comprensione`, `-luogo`, `-strumento`, `-azione`, `-articolo-suono`, `-essere-wb`. **TODOS los slots `categoryIds: ["profesiones"]`** (1 sola categoría). Crear cruces sería capacidad nueva fuera de scope.

---

## Sección EXPLÍCITA — Snapshot / re-base D-88: **NO APLICA a Professioni**

**Igual que Essere, Verbi di movimento y Genere e numero (vs Avere Phase 22).** Professioni **NO tiene** blindaje APPEND-ONLY ni snapshot:

- `scripts/snapshot-avere-prefix.mjs`, `scripts/assert-avere-prefix-unchanged.mjs` y `scripts/.avere-prefix-snapshot.json` están **hardcodeados a `content/exercises/avere.json`** (avere-only, **0 refs activas a profesiones**).
- La mención a `profesiones` en `scripts/assert-multi-cat-cross.mjs:19` es un **comentario de ejemplo de uso, NO una aserción activa** (D-26-12).
- **NO existe** `.profesiones-prefix-snapshot.json` (no se busca ni se crea).
- Professioni **nunca tuvo** invariante D-88 (el blindaje se creó solo para los 17 ejercicios legacy de Avere en Phase 4).

→ El ejecutor de Task 2 **NO debe**: ejecutar `snapshot-avere-prefix.mjs` ni `assert-avere-prefix-unchanged.mjs`; buscar o crear `.profesiones-prefix-snapshot.json`; replicar la tarea de re-base D-88. Documentar en el SUMMARY: "Professioni no tiene snapshot APPEND-ONLY ni cruces multi-cat — no aplica re-base D-88; la mención en assert-multi-cat-cross.mjs:19 es comentario de ejemplo (D-26-12)".

---

## Notas para 26-02 (NO ejecutar aquí) — los ejes de huecos PRIORIZADOS (D-26-04, ambición generosa, sin cuota fija) — SOLO en el BLOQUE REGLA

1. **(a) CONTRASTE `-tore→-trice` vs `-e/-ore→-essa` — engordar el CONTRASTE (trampa A1 central):** más -tore (scrittore→scrittrice, lettore→lettrice, pescatore→pescatrice) al slot `femminile-trice`; más -e (barone→baronessa, conte→contessa, oste→ostessa) al slot `femminile-essa`. Cuándo cada sufijo.
2. **(b) INVARIABLES `-ista`/`-ante` — engorde GENEROSO (trampa A1 estrella del hispanohablante):** más -ista (artista, autista, regista, turista) + más -ante/-nte (comandante) → mata el calco "la dentistessa"/"la cantantessa". Al slot `profesiones-invariabili`.
3. **(c) `-o/-a` regular y `-iere/-iera` — variedad:** más -o/-a (cantante de profesiones regulares) y más -iere/-iera para que el examen no memorice por palabra. A los slots `femminile-o-a` y `femminile-iera`.

> **VERIFICACIÓN DE REGLA OBLIGATORIA (R-MEMORY exercise_authoring_rules):** cada palabra asignada a una sub-regla debe VERIFICARSE que toma realmente esa forma femenina en italiano (verificar la forma fem real). **NO inventar feminizaciones inexistentes** ni meter al bloque léxico variantes. Cada candidata la concreta el mapa de 26-02 y la valida el quórum cross-vendor R1-R7 (≥4× correcta, 0 incorrecta, 1-por-1) antes de entrar.

> **EL BLOQUE LEXICO (comprensión + 3 match) NO LLEVA HUECOS MARCADOS** (D-26-02/PROF-01: no se fuerzan variantes artificiales; la pista es por significado/campo léxico no derivable por raíz, D-04). SOLO los slots de feminización (1-5) y opcionalmente articolo-suono (cauto) llevan huecos.

- **Counts de tests/scripts:** se sincronizan en 26-03 contra el conteo REAL final tras 26-02 (`data.exercises.length`). NO se tocan aquí ni se estiman. (Esta reagrupación da **11 slots**; 26-02 puede subir el count solo si materializa slots NUEVOS de huecos — las variantes nuevas NO suben el count.)

---

*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 26-01.*
