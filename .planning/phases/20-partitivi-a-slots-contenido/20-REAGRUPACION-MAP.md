# Phase 20 — Mapa de reagrupación de Partitivi (id-fuente → slot)

**Generado:** 2026-06-05 (Task 1 del plan 20-01)
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint
**Fuente:** `content/exercises/partitivos.json` (44 ejercicios: partitivos-001..044; 42 multiple-choice + 2 match; 0 cruces inter-categoría)

Artefacto de auditoría. Cada slot resultante lista los ids-fuente que entran como variantes,
el id-slot propuesto, la regla/forma/disparador, type, categoryIds, la explanation-base elegida
(D-17-05) + los matices a injertar, y si la celda es pobre (candidata a engordar en 20-02, D-19-05).

NO se autoran variantes nuevas aquí (eso es 20-02). NO se incluyen los slots de huecos de
del-formas (dello+gn/ps/x, degli+gn/ps; eso es 20-02, D-19-06 arrastrado). Las superficies
existentes se MUEVEN intactas a `variants[]` → NO requieren re-validación (cambio de contenedor).

**Decisiones aplicadas:** D-20-01 (del-formas por forma + split por sub-disparador en dello/degli),
D-17-01 (formas invariables `delle` = un slot con variantes), D-20-02 (3 slots de alternativas;
alcuni/e juntos por concordancia de género), D-20-03 (slot de contraste afirmativa/negativa con "∅"),
D-20-04 (slot de clasificación partitivo-vs-preposizione, shape MC de 3 opciones), D-20-05 (pares
contable/incontable 023/024/025/026 absorbidos cada lado en su slot del-forma según su correctIndex
REAL), D-20-06 (038/039 = slots-de-1 type:match), D-20-07 (ids libres, 0 cruces, sin rango reservado).

---

## correctIndex REAL de los pares D-01 (leído del JSON — D-20-05)

Crítico verificar el correctIndex de cada par contable/incontable para absorberlo en el slot correcto:

| id | prompt | options[correctIndex] | respuesta REAL | → slot destino |
|----|--------|------------------------|----------------|----------------|
| 023 | "Ho comprato ___ pane." | options[0] = `del` | **del** (incontable masc cons) | `partitivos-del-cons` |
| 024 | "Ho comprato ___ mele." | options[0] = `delle` | **delle** (contable fem pl) | `partitivos-delle-invariable` |
| 025 | "Ho preso ___ zucchero." | options[0] = `dello` | **dello** (incontable masc z) | `partitivos-dello-z` |
| 026 | "Ho preso ___ libri." | options[0] = `dei` | **dei** (contable masc pl cons) | `partitivos-dei-cons` |

Los 4 se absorben como variantes adicionales de sus slots del-forma; el contraste contable/incontable
queda implícito en que comparten verbo (Ho comprato / Ho preso). NO crean slot dedicado (D-20-05).

---

## A. DEL-FORMAS (D-20-01 — 1 slot por forma + split por sub-disparador)

| # | slot-id propuesto | Regla / forma / disparador | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|----------------------------|--------------------------|------|-------------|----------------------------|--------------|
| 1 | `partitivos-del-cons` | incontable masc sing + consonante simple → `del` (di + il) | 001, 002, 003, 004, **023** (5) | multiple-choice | `["partitivos"]` | **Base: 001** (la más completa: partitivo = di+artículo determinativo, del=di+il, cantidad indeterminada + contrasta dello/della/dell'). **Injertar de 003**: trampa de género de `latte` (termina en -e pero es masculino → del, no della). **Injertar de 023**: lado incontable del par D-01 — `del pane` no salta a plural `dei`, no se cuenta el pan. | no (5) |
| 2 | `partitivos-dello-z` | incontable masc sing + z- → `dello` (di + lo) | 005, 006, **025** (3) | multiple-choice | `["partitivos"]` | **Base: 005** (más completa: z = uno de los sonidos s-impura/z/gn/ps/x que piden lo; di+lo=dello; error típico del hispanohablante `del zucchero` por calco). **Injertar de 006**: la z- siempre dispara lo (zaino/zucchero/zenzero). **Injertar de 025**: lado incontable del par D-01 (Ho preso) — `dello zucchero` no salta a plural; se mide, no se cuenta. | no (3) |
| 3 | `partitivos-dello-scons` | incontable masc sing + s impura (s+consonante) → `dello` (di + lo) | 007 (1) | multiple-choice | `["partitivos"]` | **Base: 007** (única — sube tal cual: s+consonante = s impura → lo → dello (di+lo); misma regla que `lo studente`/`lo sport`; `del` sería el calco erróneo). | **SÍ — celda pobre (1 variante)** → engordar en 20-02 |
| 4 | `partitivos-della-cons` | incontable fem sing + consonante → `della` (di + la) | 008, 009, 010 (3) | multiple-choice | `["partitivos"]` | **Base: 008** (más completa: fem + consonante → la → della; el fem sing ante consonante es SIEMPRE della, sin las variaciones del masculino; `del` = error de género). **Injertar de 009**: `frutta` como masa (incontable sing, no salta a plural `delle`). | no (3) |
| 5 | `partitivos-dell-vocal` | incontable sing + vocal (elisión, ambos géneros) → `dell'` (di + l') | 011, 012, 013 (3) | multiple-choice | `["partitivos"]` | **Base: 011** (más completa: ante vocal el artículo se elide en l' en ambos géneros; di+l'=dell'; error `della acqua` sin elidir). **Injertar de 012**: la elisión la comparten masculino (`olio`) y femenino (`acqua`); el género no importa para la elisión. | no (3) |
| 6 | `partitivos-dei-cons` | contable masc plural + consonante simple → `dei` (di + i) | 014, 015, 016, **026** (4) | multiple-choice | `["partitivos"]` | **Base: 014** (más completa: plural masc de il → i → dei; se cuentan unidades en cantidad indeterminada; `del` = error de número/singular). **Injertar de 015/016**: `degli` se reserva al plural masc ante vocal o s-impura, NO ante consonante simple. **Injertar de 026**: lado contable del par D-01 (Ho preso) — decide primero contar vs medir; eso fija el número antes que la fonética. | no (4) |
| 7 | `partitivos-degli-scons` | contable masc plural + s impura → `degli` (di + gli) | 017 (1) | multiple-choice | `["partitivos"]` | **Base: 017** (única — sube tal cual: plural masc s-impura → gli → degli; en plural degli absorbe lo que en singular era dello (`lo studente`→`degli studenti`); error `dei studenti`). | **SÍ — celda pobre (1 variante)** → engordar en 20-02 |
| 8 | `partitivos-degli-vocal` | contable masc plural + vocal → `degli` (di + gli) | 018 (1) | multiple-choice | `["partitivos"]` | **Base: 018** (única — sube tal cual: plural masc ante vocal → gli → degli; en plural NO hay elisión con apóstrofo como en singular dell', la vocal se resuelve con degli; error `dei amici`). | **SÍ — celda pobre (1 variante)** → engordar en 20-02 |
| 9 | `partitivos-degli-z` | contable masc plural + z- → `degli` (di + gli) | 019 (1) | multiple-choice | `["partitivos"]` | **Base: 019** (única — sube tal cual: plural masc con z- → gli → degli; plural de `lo zio`→`degli zii`; la z que en singular daba dello en plural da degli; error `dei zii`). | **SÍ — celda pobre (1 variante)** → engordar en 20-02 |
| 10 | `partitivos-delle-invariable` | contable fem plural invariable (D-17-01) → `delle` (di + le) | 020, 021, 022, **024** (4) | multiple-choice | `["partitivos"]` | **Base: 022** (la más completa: el fem plural NO cambia ni elide ante consonante/vocal/s-impura; siempre delle; contrasta `degli` masc ante vocal como error de género). **Injertar de 020**: delle = di+le, plural de la, sin variación fonética. **Injertar de 024**: lado contable del par D-01 (Ho comprato) — `mele` se cuenta → plural delle; la contabilidad decide singular vs plural antes que la fonética. | no (4) |

**Subtotal del-formas: 10 slots** (de los ids 001-026).

> **Nota delle (D-17-01):** `delle` es invariable ante cualquier disparador → un solo slot con
> variantes (NO split por sub-disparador como dello/degli), espejando el trato de `la`/`le`/`una`
> en Articoli. La variante 022 (`amiche`, fem pl ante vocal) demuestra que delle no elide ni cambia.

---

## B. ALTERNATIVAS (D-20-02 — 3 slots; alcuni/e juntos por concordancia de género)

| # | slot-id propuesto | Regla / restricción | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|---------------------|--------------------------|------|-------------|----------------------------|--------------|
| 11 | `partitivos-qualche` | `qualche` + SIEMPRE singular (algunos, pero rige singular) | 027, 028, 029 (3) | multiple-choice | `["partitivos"]` | **Base: 027** (más completa: qualche significa algunos pero rige singular `qualche libro`; alcuni/e exigen plural, un po' di exige incontable). **Injertar de 028**: el calco del plural español (`algunos problemas`) es el error natural del hispanohablante; qualche lo bloquea exigiendo singular. **Injertar de 029**: qualche es invariable en género (vale masc y fem), siempre singular. | no (3) |
| 12 | `partitivos-un-po-di` | `un po' di` + SOLO incontable (un poco de) | 030, 031 (2) | multiple-choice | `["partitivos"]` | **Base: 030** (más completa: un po' di reservado a incontables/masas `un po' di acqua`; alcuni/e exigen plural contable, qualche singular contable; la restricción deja una sola respuesta). **Injertar de 031**: explicitar la restricción negativa (`no un po' di libri`, porque los libros se cuentan). | no (2) |
| 13 | `partitivos-alcuni-alcune` | `alcuni`/`alcune` + SOLO plural contable, concordando en género (D-20-02: género = variantes, NO split) | 032, 033 (2) | multiple-choice | `["partitivos"]` | **Base: 032** (más completa: alcune = plural contable concordando en género `alcune mele`; restricción doble: solo plurales + concordancia de género; qualche exige singular, alcuna es singular). **Injertar de 033**: la cara masculina `alcuni libri`; la regla "solo plural contable" es la MISMA, el género es concordancia (mismo slot, D-20-02). **Nota:** el distractor `un po' di` se reemplazó tras quórum 2026-05-28 por doble-validez con plural contable coloquial (registrado en notes legacy). | no (2) |

**Subtotal alternativas: 3 slots** (de los ids 027-033).

> **Nota alcuni/alcune (D-20-02):** la concordancia de género NO crea slots separados — la regla
> "alcuni/e = solo plural contable" es única, el género es concordancia (espejo D-17-01, NO split
> D-20-01). Las dos caras (032 fem alcune / 033 masc alcuni) van como variantes del MISMO slot.

---

## C. OMISIÓN EN NEGATIVA (D-20-03 — 1 slot de contraste afirmativa/negativa; la respuesta "∅" es skill propio)

| # | slot-id propuesto | Regla / skill | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|---------------|--------------------------|------|-------------|----------------------------|--------------|
| 14 | `partitivos-negativa` | uso vs omisión del partitivo: afirmativa USA partitivo / negativa OMITE ("∅ / sin partitivo") (D-02) | 034 (afirm. del), 035 (neg. ∅), 036 (afirm. degli), 037 (neg. ∅) (4) | multiple-choice | `["partitivos"]` | **Base: 034** (la más completa: marca el matiz pedagógico clave — lo difícil para el hispanohablante es USAR el partitivo en afirmativa donde el español no pone nada; `compro del pane` vs español `compro pan`). **Injertar de 035**: la negativa omite (`non compro pane`, sin del), coincide con el español, la parte fácil. **Injertar de 036/037**: la asimetría aplica también al plural contable (`ho degli amici` afirmativa / `non ho amici` negativa); reservar la atención para la afirmativa. **Override 036 (D-02):** ∅ es gramaticalmente válida en italiano pero NO es la opción idiomática que D-02 enseña — degli se mantiene correcta para reforzar la regla pedagógica (registrado en validation legacy con pass `autor` override). | no (4) |

**Subtotal omisión en negativa: 1 slot** (de los ids 034-037).

> **GOTCHA ∅ (U+2205):** la opción `∅ / sin partitivo` (correcta en 035/037, distractora en 034/036)
> es un valor de opción LEGÍTIMO — NO es smart-quote y debe sobrevivir verbatim a la reescritura.
> **Asimetría deliberada vs D-20-05:** la omisión SÍ merece slot de contraste (la respuesta "∅" es
> un skill que ninguna forma representa) mientras el eje contable/incontable NO (ya está representado
> por las formas distintas → sus pares se absorben en los slots del-forma).

---

## D. CLASIFICACIÓN PARTITIVO-VS-PREPOSIZIONE (D-20-04 — 1 slot de clasificación; shape MC de 3 opciones, NO rellenar a 4)

| # | slot-id propuesto | Regla / skill | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|---------------|--------------------------|------|-------------|----------------------------|--------------|
| 15 | `partitivos-clasificacion` | clasificar la función de 'del'/'delle'/'dell'': partitivo vs preposizione articolata (D-05); mezcla PARTITIVA + PREPOSITIVA | 040 (PARTITIVA), 041 (PREPOSITIVA), 042 (PARTITIVA), 043 (PREPOSITIVA), 044 (PARTITIVA) (5) | multiple-choice | `["partitivos"]` | **Base: 040** (más completa para la cara partitiva: `del pane` = algo de pan, prueba de parafrasear como `un poco de pan`; misma forma del con función prepositiva se estudia en Preposiciones, aquí solo se contrasta). **Injertar de 041/043** (cara prepositiva): `del caffè`/`del nonno` = de el café / de el abuelo (preposizione articolata, di+il, relación/pertenencia), NO `algo de`. **Injertar de 042**: la cara partitiva contable plural `delle mele` = unas manzanas (= alcune mele). **Injertar de 044**: la cara partitiva con elisión `dell'acqua` = algo de agua (= un po' d'acqua). | no (5) |

**Subtotal clasificación: 1 slot** (de los ids 040-044).

> **GOTCHA shape MC de 3 opciones (D-20-04):** las variantes del slot de clasificación tienen
> `options: ["partitivo", "preposición", "artículo determinativo"]` (3 opciones, NO 4). NO rellenar
> a 4 — separar por función rompería el skill de clasificar. correctIndex apunta a la función real
> de cada frase (040/042/044 → partitivo; 041/043 → preposición). El orden de opciones por variante
> se preserva intacto del legacy (en 040/042/044 partitivo va primero; en 041/043 preposición primero).
> Apóstrofe ASCII U+0027 en `dell'` (044) preservado.

---

## E. MATCH (D-20-06 — slots-de-1 type:match, sin variantes forzadas)

| # | slot-id propuesto | Regla / skill | id-fuente | type | categoryIds | explanation | celda pobre? |
|---|-------------------|---------------|-----------|------|-------------|-------------|--------------|
| 16 | `partitivos-match-incontable` | agregación serie partitiva singular (sustantivo incontable ↔ forma; género + disparador fonético) | 038 (1) | **match** | `["partitivos"]` | Sube tal cual del payload (ya completa: la forma = di+artículo, hereda el disparador fonético; pane/vino=del cons, zucchero=dello z, acqua=dell' vocal, carne=della fem; género decide del/dello vs della, sonido inicial decide la elisión; trampa `del acqua`/`della acqua` en vez de dell'). Columna derecha del/dello/dell'/della = 4 valores distintos (R3); duplicado intencional `del` en pane+vino (D-66), grading por índice. | no (slot-de-1 por diseño, D-20-06) |
| 17 | `partitivos-match-contable-plural` | agregación serie partitiva plural (sustantivo contable plural ↔ forma; género + disparador fonético) | 039 (1) | **match** | `["partitivos"]` | Sube tal cual del payload (ya completa: plural = di+artículo plural; libri=dei cons, studenti/amici=degli s-impura/vocal, mele/case=delle fem; degli absorbe dello/dell' en plural masc, igual que gli absorbe lo/l'; trampa `dei studenti`/`dei amici` en vez de degli). Columna derecha dei/degli/delle = 3 valores distintos (R3); duplicados intencionales `degli`×2 (studenti/amici), `delle`×2 (mele/case) (D-66), grading por índice. | no (slot-de-1 por diseño, D-20-06) |

**Subtotal match: 2 slots** (de los ids 038, 039).

---

## Cobertura de los 44 ids fuente (1:1)

- **Del-formas:** 001-022 (22 ids) + pares D-01 absorbidos 023, 024, 025, 026 (4 ids) → 10 slots.
  - del-cons: 001, 002, 003, 004, 023
  - dello-z: 005, 006, 025
  - dello-scons: 007
  - della-cons: 008, 009, 010
  - dell-vocal: 011, 012, 013
  - dei-cons: 014, 015, 016, 026
  - degli-scons: 017
  - degli-vocal: 018
  - degli-z: 019
  - delle-invariable: 020, 021, 022, 024
- **Alternativas:** 027-033 (7 ids) → 3 slots (qualche 027-029; un-po-di 030-031; alcuni-alcune 032-033).
- **Omisión en negativa:** 034, 035, 036, 037 (4 ids) → 1 slot.
- **Clasificación:** 040, 041, 042, 043, 044 (5 ids) → 1 slot.
- **Match:** 038, 039 (2 ids) → 2 slots.

**Total ids fuente cubiertos: 26 + 7 + 4 + 5 + 2 = 44** (cada id 001-044 aparece exactamente una vez).

---

## CONTEO DE SLOTS DE ESTA REAGRUPACIÓN

| Bloque | Slots |
|--------|-------|
| Del-formas | 10 |
| Alternativas | 3 |
| Omisión en negativa | 1 |
| Clasificación | 1 |
| Match | 2 |
| **TOTAL** | **17 slots** |

**17 slots** resultan de SOLO esta reagrupación (sin slots nuevos ni variantes nuevas).

> Este conteo NO incluye los slots de huecos de del-formas (dello+gn/ps/x, degli+gn/ps; D-19-06)
> ni variantes nuevas (D-19-05), que se autoran en 20-02. El conteo final (que sincroniza 20-03)
> se determinará tras 20-02. Por ahora `partitivos.json` pasa de 44 ejercicios legacy a **17 slots**.

---

## Celdas pobres a engordar en 20-02 (D-19-05 arrastrado)

Slots con 1 sola variante hoy, candidatos prioritarios a engordar (≥2 variantes) por quórum
cross-vendor en 20-02:

- Del-formas: `partitivos-dello-scons` (007), `partitivos-degli-scons` (017),
  `partitivos-degli-vocal` (018), `partitivos-degli-z` (019).

Los slots-de-1 de match (038/039) NO son celdas pobres: son slots-de-1 por diseño (D-20-06), sin
engorde forzado. El slot de clasificación (5 variantes) y el de negativa (4 variantes) están densos.

**Huecos de disparador a materializar como slots NUEVOS en 20-02 (D-19-06 arrastrado):** la serie
de suoni speciali del partitivo masc tiene huecos análogos a Articoli — **dello+gn** (`dello gnocco`?),
**dello+ps** (`dello psicologo`?), **dello+x** (`dello xilofono`?) en singular; **degli+gn**
(`degli gnocchi`?), **degli+ps** (`degli psicologi`?) en plural. **R6 crítico:** verificar el
sustantivo italiano, su género/número y la contracción di+articolo antes de autorar. El planner/autor
decide en 20-02 qué huecos son naturales (existe sustantivo A1). NO se incluyen en este mapa.

---

## Superficies movidas vs nuevas (re-validación)

**TODAS las 44 superficies se MUEVEN intactas** a `variants[]` (cambio de contenedor: payload →
variante). NINGUNA superficie se reformula en este plan → NINGUNA requiere re-validación (D-17-07).
La `validation` top-level de cada slot se hereda de sus ejercicios fuente (todos comparten quórum
deepseek-v4-pro + claude-opus-4-7 / 2026-05-28; el slot de negativa además porta el pass `autor`
override de 036). El scan de acentos se aplica también a las superficies movidas (lección Phase 19
WR-01/WR-02) — cualquier defecto legacy de acento es corrección ortográfica, no cambio de superficie.

---

*Task 1 del plan 20-01 — PROPUESTO, pendiente de aprobación del autor en el checkpoint:decision.*
