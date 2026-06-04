# Phase 19 — Mapa de reagrupación de Articoli (id-fuente → slot)

**Generado:** 2026-06-04 (Task 1 del plan 19-01)
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint
**Fuente:** `content/exercises/articoli.json` (56 ejercicios: articoli-001..050 + articoli-300..305)

Artefacto de auditoría. Cada slot resultante lista los ids-fuente que entran como variantes,
el id-slot propuesto, la regla/forma/disparador, type, categoryIds, la explanation-base elegida
(D-17-05) + los matices a injertar, y si la celda es pobre (candidata a engordar en 19-02, D-19-05).

NO se autoran variantes nuevas aquí (eso es 19-02). NO se incluyen los slots de huecos `y` /
`i+vocal` (eso es 19-02, D-19-06). Las superficies existentes se MUEVEN intactas a `variants[]`
→ NO requieren re-validación.

**Decisiones aplicadas:** D-19-01 (sing/plural slots separados), D-19-02 (un slot por
sub-disparador en la serie lo/gli), D-17-01 (formas invariables la/le/una = un slot con variantes),
ART-03 (indeterminativi = slots propios con `categoryIds=["articoli"]`), D-19-03 (049/050 =
slots-de-1 type:match), D-19-04 (cruces 300..305 = slots-de-1 con id ESTABLE + 2 categoryIds).

---

## A. DETERMINATIVI

| # | slot-id propuesto | Regla / forma / disparador | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|----------------------------|--------------------------|------|-------------|----------------------------|--------------|
| 1 | `articoli-il-cons` | masc sing `il` ante consonante simple | 001, 002, 003, 004 (4) | multiple-choice | `["articoli"]` | **Base: 001** (la más completa: explica il default + contrasta lo/l'). **Injertar de 004**: lista de consonantes que cubre il (b, c, d, f, l, m, n, p, r, t, v...). | no (4) |
| 2 | `articoli-lo-scons` | masc sing `lo` ante s+consonante (s impura) | 005, 006, 007 (3) | multiple-choice | `["articoli"]` | **Base: 005** (más completa: regla + error típico calco del español il studente). **Injertar de 006**: enumeración de grupos de s impura (st-, sp-, sc-, sg-, sl-, sm-, sn-...). | no (3) |
| 3 | `articoli-lo-z` | masc sing `lo` ante z- | 008, 009, 010 (3) | multiple-choice | `["articoli"]` | **Base: 008** (más completa: regla z + error típico il zio + agrupa z con s impura). **Injertar de 009/010**: la z- *siempre* dispara lo (nunca il), patrón confirmado en zaino/zucchero. | no (3) |
| 4 | `articoli-lo-ps` | masc sing `lo` ante ps- | 011 (1) | multiple-choice | `["articoli"]` | **Base: 011** (única — sube tal cual: ps- = s impura, trampa fácil porque español dice el psicólogo). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 5 | `articoli-lo-gn` | masc sing `lo` ante gn- | 012 (1) | multiple-choice | `["articoli"]` | **Base: 012** (única — sube tal cual: gn- se comporta como s impura y z). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 6 | `articoli-lo-x` | masc sing `lo` ante x- | 013 (1) | multiple-choice | `["articoli"]` | **Base: 013** (única — sube tal cual: x- poco frecuente pero en el grupo de s impura/z). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 7 | `articoli-l-masc-vocal` | masc sing `l'` ante vocal (elisión) | 014, 015, 016, 017 (4) | multiple-choice | `["articoli"]` | **Base: 014** (más completa: elisión en ambos géneros ante vocal + error il/lo amico sin elidir). **Injertar de 016**: la elisión aplica a las cinco vocales (a, e, i, o, u). | no (4) |
| 8 | `articoli-la-invariable` | fem sing `la` invariable ante cualquier consonante (D-17-01) | 018, 019, 020 (3) | multiple-choice | `["articoli"]` | **Base: 018** (más general: la fem casi no cambia, solo l' ante vocal). **Injertar contrastes de 019 (la zia vs lo zio) y 020 (la studentessa vs lo studente)**: el fem NO cambia ante z ni s impura, a diferencia del masc. | no (3) |
| 9 | `articoli-l-fem-vocal` | fem sing `l'` ante vocal (elisión) | 021, 022, 023 (3) | multiple-choice | `["articoli"]` | **Base: 021** (más completa: elisión fem = masc, única situación en que fem pasa de la a l'; espejo l'amico/l'amica). **Injertar de 023**: la elisión solo ocurre en singular (plural fem → le isole, sin apóstrofo). | no (3) |
| 10 | `articoli-i-plural` | masc plural `i` (plural de il) | 024, 025 (2) | multiple-choice | `["articoli"]` | **Base: 024** (más completa: i = plural de il; gli reservado al plural de lo y l'). **Injertar de 025**: regla nemotécnica si sing=il→plur=i; si sing=lo/l'→plur=gli. | no (2) |
| 11 | `articoli-gli-scons` | masc plural `gli` ante s+consonante (plural de lo s-impura) | 026 (1) | multiple-choice | `["articoli"]` | **Base: 026** (única — sube tal cual: gli = plural de lo studente; error i studenti). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 12 | `articoli-gli-z` | masc plural `gli` ante z- (plural de lo z-) | 027 (1) | multiple-choice | `["articoli"]` | **Base: 027** (única — sube tal cual: gli zii; la z- mantiene la familia lo/gli en plural). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 13 | `articoli-gli-ps` | masc plural `gli` ante ps- (plural de lo ps-) | 028 (1) | multiple-choice | `["articoli"]` | **Base: 028** (única — sube tal cual: gli psicologi; el grupo ps- en la familia lo/gli). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 14 | `articoli-gli-gn` | masc plural `gli` ante gn- (plural de lo gn-) | 029 (1) | multiple-choice | `["articoli"]` | **Base: 029** (única — sube tal cual: gli gnocchi; trampa clásica i gnocchi). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 15 | `articoli-gli-vocal` | masc plural `gli` ante vocal (plural de l') | 030, 031 (2) | multiple-choice | `["articoli"]` | **Base: 030** (más completa: gli = plural de l'; gli absorbe el plural de lo y de l'). **Injertar de 031**: en plural no hay elisión, se escribe gli completo (no g'). | no (2) |
| 16 | `articoli-le-invariable` | fem plural `le` invariable (D-17-01) | 032, 033, 034 (3) | multiple-choice | `["articoli"]` | **Base: 032** (más general: le fem plural siempre, sin variación fonética ni elisión). **Injertar de 033**: el plural fem nunca se elide (le amiche, no l'amiche; la elisión solo en singular). | no (3) |

**Subtotal determinativi: 16 slots** (de los ids 001..034).

---

## B. INDETERMINATIVI (slots propios dentro de Articoli — `categoryIds=["articoli"]`, ART-03)

| # | slot-id propuesto | Regla / forma / disparador | ids-fuente (→ variantes) | type | categoryIds | explanation-base (D-17-05) | celda pobre? |
|---|-------------------|----------------------------|--------------------------|------|-------------|----------------------------|--------------|
| 17 | `articoli-un-cons` | masc `un` ante consonante simple | 035, 036 (2) | multiple-choice | `["articoli"]` | **Base: 035** (más completa: un cubre consonantes simples Y vocales en masc; uno reservado a s impura/z/gn/ps/x). **Injertar de 036**: un = forma por defecto, solo cambia a uno ante sonidos difíciles. | no (2) |
| 18 | `articoli-un-masc-vocal` | masc `un` ante vocal SIN apóstrofo | 037, 038 (2) | multiple-choice | `["articoli"]` | **Base: 037** (más completa: el apóstrofo un' es marca EXCLUSIVA del femenino; un'amico es incorrecto). **Injertar de 038**: contraste con el determinativo (l'occhio elide, un occhio no). | no (2) |
| 19 | `articoli-uno-scons` | masc `uno` ante s+consonante | 039 (1) | multiple-choice | `["articoli"]` | **Base: 039** (única — sube tal cual: espejo de lo studente; mismo disparador fonético; calco un studente a evitar). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 20 | `articoli-uno-z` | masc `uno` ante z- | 040 (1) | multiple-choice | `["articoli"]` | **Base: 040** (única — sube tal cual: espejo de lo zaino; z- obliga a la forma larga uno). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 21 | `articoli-uno-ps` | masc `uno` ante ps- | 041 (1) | multiple-choice | `["articoli"]` | **Base: 041** (única — sube tal cual: espejo de lo psicologo; ps- en la familia de s impura). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 22 | `articoli-uno-gn` | masc `uno` ante gn- | 042 (1) | multiple-choice | `["articoli"]` | **Base: 042** (única — sube tal cual: espejo de lo gnomo; gn- exige la forma larga uno). | **SÍ — celda pobre (1 variante)** → engordar en 19-02 |
| 23 | `articoli-una-invariable` | fem `una` invariable ante consonante (D-17-01) | 043, 044, 045 (3) | multiple-choice | `["articoli"]` | **Base: 043** (más general: una ante cualquier consonante incl. s impura; solo un' ante vocal). **Injertar contrastes de 044 (una zia vs uno zio) y 045 (una studentessa vs uno studente)**: el fem no cambia ante z ni s impura. | no (3) |
| 24 | `articoli-un-fem-vocal` | fem `un'` ante vocal CON apóstrofo | 046, 047, 048 (3) | multiple-choice | `["articoli"]` | **Base: 046** (más completa: corazón de la trampa — un amico masc SIN apóstrofo vs un'amica fem CON apóstrofo, misma vocal). **Injertar de 047**: la elisión a un' solo ocurre en fem ante vocal. **Injertar de 048**: caso frecuente un'ora (= una hora). | no (3) |

**Subtotal indeterminativi: 8 slots** (de los ids 035..048).

---

## C. MATCH (D-19-03 — slots-de-1 type:match, sin variantes forzadas)

| # | slot-id (ESTABLE) | Regla / skill | id-fuente | type | categoryIds | explanation | celda pobre? |
|---|-------------------|---------------|-----------|------|-------------|-------------|--------------|
| 25 | `articoli-049` | Agregación serie determinativa lo/gli/i | 049 (1) | **match** | `["articoli"]` | Sube tal cual del payload (ya completa: agrupa lo singular + gli plural + i; trampa il ante z-/s+cons). | no (slot-de-1 por diseño, D-19-03) |
| 26 | `articoli-050` | Agregación serie indeterminativa uno/un/un'/una | 050 (1) | **match** | `["articoli"]` | Sube tal cual del payload (ya completa: uno masc s-impura/z + un consonante/vocal + un' fem vocal + una fem consonante). | no (slot-de-1 por diseño, D-19-03) |

**Nota:** los ids 049/050 se MANTIENEN como id-slot (no se renumeran a id semántico) por claridad
de trazabilidad; son slot-de-1 `type:match`. Sus 3+ valores distintos en columna derecha (R3) ya
cumplen — superficie movida intacta, sin re-validación.

**Subtotal match: 2 slots.**

---

## D. CRUCES INTER-CATEGORÍA (D-19-04 — slots-de-1 con id ESTABLE + 2 categoryIds; NO renumerar)

| # | slot-id (ESTABLE, intacto) | Regla / cruce | id-fuente | type | categoryIds (2 ids, intactos) | explanation | celda pobre? |
|---|----------------------------|---------------|-----------|------|-------------------------------|-------------|--------------|
| 27 | `articoli-300` | plural fem ragazze → le (artículo × género-número) | 300 (1) | multiple-choice | `["articoli","genero-numero"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |
| 28 | `articoli-301` | plural masc gli studenti (s impura × número) | 301 (1) | multiple-choice | `["articoli","genero-numero"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |
| 29 | `articoli-302` | plural masc i libri (il→i × número) | 302 (1) | multiple-choice | `["articoli","genero-numero"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |
| 30 | `articoli-303` | plural irregular le braccia (artículo × sust. irregular) | 303 (1) | multiple-choice | `["articoli","sustantivos-irregulares"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |
| 31 | `articoli-304` | plural irregular le uova (l'uovo→le uova) | 304 (1) | multiple-choice | `["articoli","sustantivos-irregulares"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |
| 32 | `articoli-305` | plural gli zii (z- × plural del sustantivo) | 305 (1) | multiple-choice | `["articoli","sustantivos-irregulares"]` | Sube tal cual del payload. | no (slot-de-1, id estable D-19-04) |

**CRÍTICO (D-19-04 / T-19-01):** los ids `articoli-300..305` NO se renumeran. Renumerarlos haría
stale el `clearedExerciseIds` de `genero-numero` y `sustantivos-irregulares` (categorías NO reseteadas
en Phase 18) → regresión a no-hecha. El rango 300..305 queda **RESERVADO/excluido** de la renumeración
de los slots articoli-only (todos los ids articoli-only propuestos son semánticos `articoli-{regla}`,
sin colisión con el rango numérico).

**Subtotal cruces: 6 slots.**

---

## Cobertura de los 56 ids fuente (1:1)

- **Determinativi:** 001-034 (34 ids) → 16 slots.
- **Indeterminativi:** 035-048 (14 ids) → 8 slots.
- **Match:** 049, 050 (2 ids) → 2 slots.
- **Cruces:** 300-305 (6 ids) → 6 slots.

**Total ids fuente cubiertos: 34 + 14 + 2 + 6 = 56** (cada id aparece exactamente una vez).

---

## CONTEO DE SLOTS DE ESTA REAGRUPACIÓN

| Bloque | Slots |
|--------|-------|
| Determinativi | 16 |
| Indeterminativi | 8 |
| Match | 2 |
| Cruces | 6 |
| **TOTAL** | **32 slots** |

**32 slots** resultan de SOLO esta reagrupación (sin slots nuevos ni variantes nuevas).

> Este conteo NO incluye los slots de huecos `y` / `i+vocal` (D-19-06) ni variantes nuevas
> (D-19-05), que se autoran en 19-02. El conteo final (que sincroniza 19-03) se determinará tras
> 19-02. Por ahora `articoli.json` pasa de 56 ejercicios legacy a **32 slots**.

---

## Celdas pobres a engordar en 19-02 (D-19-05)

Slots con 1 sola variante hoy, candidatos prioritarios a engordar (≥2 variantes) por quórum
cross-vendor en 19-02:

- Determinativi: `articoli-lo-ps` (011), `articoli-lo-gn` (012), `articoli-lo-x` (013),
  `articoli-gli-scons` (026), `articoli-gli-z` (027), `articoli-gli-ps` (028), `articoli-gli-gn` (029).
- Indeterminativi: `articoli-uno-scons` (039), `articoli-uno-z` (040), `articoli-uno-ps` (041),
  `articoli-uno-gn` (042).

Los slots-de-1 de match (049/050) y cruces (300..305) NO son celdas pobres: son slots-de-1 por
diseño (D-19-03 / D-19-04), sin engorde forzado.

**Huecos de disparador a materializar como slots NUEVOS en 19-02 (D-19-06):** `y` / `i+vocal` en
la serie lo/gli (lo yogurt / gli yogurt; lo iodio). Verificar artículo+sustantivo italiano (R6).
NO se incluyen en este mapa.

---

*Task 1 del plan 19-01 — PROPUESTO, pendiente de aprobación del autor en el checkpoint:decision.*
