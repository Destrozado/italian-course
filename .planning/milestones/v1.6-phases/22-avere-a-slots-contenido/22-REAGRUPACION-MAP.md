# 22-REAGRUPACION-MAP.md — Avere → slot+variantes (mapa de auditoría)

**Fase:** 22-avere-a-slots-contenido · **Plan:** 22-01 · **Task 1 (artefacto de auditoría)**
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:decision.
**Patrón replicado:** 19-01 (Articoli) + 20-01 (Partitivi).
**Decisiones aplicadas:** D-19-01 (presente por persona), D-17-01 (misma regla reformulada = variantes del mismo slot), D-17-05 (merge elegir-la-más-completa + injertar matices), D-19-03 (match/word-buttons como slots-de-1), D-19-04 / D-87 (cruces id estable + 2 cats), D-66 (duplicados textuales preservados), D-15-09 (ids semánticos libres), D-19-07 (explanations rule-first), D-178 opción A + D-88 (re-base del snapshot).

---

## Resumen de cobertura

23 ids fuente → **19 slots**. Cada id 001-012, 100-101, 200-202, 300-305 aparece exactamente UNA vez como id-fuente. Sin slots nuevos ni variantes nuevas (eso es 22-02).

**Conteo de slots de esta reagrupación: 19** (6 presente por persona + 1 sensaciones + 1 passato prossimo + 2 word-buttons + 3 match + 6 cruces).

| Bloque | Slots | ids-fuente | type |
|--------|-------|-----------|------|
| Presente indicativo por persona (D-19-01) | 6 | 001, 002, 003, 004, 005, 006 | multiple-choice |
| Sensación física idiomática (D-17-01) | 1 | 007, 008 | multiple-choice |
| Passato prossimo con auxiliar avere (D-17-01) | 1 | 009, 010, 011, 012 | multiple-choice |
| Word-buttons (D-19-03) | 2 | 100, 101 | word-buttons |
| Match (D-19-03, D-66) | 3 | 200, 201, 202 | match |
| Cruces multi-cat (D-19-04 / D-87) | 6 | 300, 301, 302, 303, 304, 305 | multiple-choice |
| **TOTAL** | **19** | **23 ids** | |

---

## Tabla detallada por slot

Leyenda columnas: slot-id propuesto · regla/persona/uso · ids-fuente (→variantes) · type · categoryIds · explanation-base + matices a injertar (D-17-05) · ¿celda pobre candidata a 22-02?

### Bloque 1 — Presente indicativo por persona (6 slots-de-1, D-19-01)

Cada forma del presente es una trampa de conjugación distinta para el hispanohablante → un slot por forma; el motor re-verifica cada celda. Todos `categoryIds: ["avere"]`, 1 variante hoy (celda pobre).

| slot-id | regla/persona | id-fuente | type | explanation-base | celda pobre? |
|---------|---------------|-----------|------|------------------|--------------|
| `avere-ho` | presente 1ª sing (io), posesión | 001 → 1 var | MC | sube tal cual (explanation de 001) | **SÍ** → engordar en 22-02 |
| `avere-hai` | presente 2ª sing (tu) | 002 → 1 var | MC | sube tal cual (002); matiz: h muda inicial en toda la conjugación | **SÍ** |
| `avere-ha` | presente 3ª sing (lui/lei) | 003 → 1 var | MC | sube tal cual (003); matiz: **la edad se TIENE con avere, no se ES** (error A1 frecuente `è ventidue anni`) | **SÍ** |
| `avere-abbiamo` | presente 1ª pl (noi) | 004 → 1 var | MC | sube tal cual (004); matiz: **`abbiamo` rompe la raíz av-**, memorizar aparte | **SÍ** |
| `avere-avete` | presente 2ª pl (voi) | 005 → 1 var | MC | sube tal cual (005); matiz: **la h muda desaparece en avete/abbiamo y reaparece en hanno** | **SÍ** |
| `avere-hanno` | presente 3ª pl (loro) | 006 → 1 var | MC | sube tal cual (006); matiz: **no confundir `hanno` (verbo) con `anno` (año, sin h)** | **SÍ** |

> Como cada slot de presente es slot-de-1, la explanation existente sube a top-level **tal cual** (ya es rule-first y lleva su propio matiz). No hay merge entre variantes en este bloque; los matices listados arriba YA están dentro de la explanation de cada id fuente respectivo — se conservan al subir.

### Bloque 2 — Sensación física idiomática (1 slot de regla, D-17-01)

Misma regla reformulada ("las sensaciones físicas se expresan con avere, no essere") → 1 slot con 2 variantes. **A confirmar por el autor: ¿007 fame + 008 caldo juntos en un slot, o separados?** (recomendado: juntos — misma regla, variantes intercambiables; el motor re-verifica la regla con un ejemplo aleatorio cada vez).

| slot-id | regla | ids-fuente | type | explanation-base + matices | celda? |
|---------|-------|-----------|------|----------------------------|--------|
| `avere-sensazioni` | sensación física con avere (fame/caldo) | 007 (fame), 008 (caldo) → 2 vars | MC | **base = 008 (caldo)** — la más completa: explica el patrón general "sensación de calor/frío con avere siguiendo el mismo patrón que avere fame" + el matiz `sono caldo` ≠ sensación térmica. **Injertar de 007 (fame):** la lista de sensaciones (hambre, sed, frío), y el pitfall `estoy hambriento`→`sono affamato` vs construcción A1 `avere fame`. | regla con 2 vars — huecos a evaluar en 22-02: avere sete/freddo/sonno/ragione/anni (D-19-06) |

Variantes movidas intactas a `variants[]`: 007 `{prompt:"Non ho mangiato niente: ___ fame!", options:[ho,sono,hai,è], correctIndex:0}` y 008 `{prompt:"Apri la finestra, per favore: ___ caldo.", options:[sono,ho,è,siamo], correctIndex:1}`.

### Bloque 3 — Passato prossimo con auxiliar avere (1 slot de regla, D-17-01)

Misma regla reformulada ("estos verbos piden avere en el passato prossimo") → 1 slot con 4 variantes intercambiables (transitivo / comunicación / actividad física / cognitivo).

| slot-id | regla | ids-fuente | type | explanation-base + matices | celda? |
|---------|-------|-----------|------|----------------------------|--------|
| `avere-passato-prossimo` | passato prossimo con auxiliar avere | 009 (transitivo), 010 (comunicación), 011 (actividad física), 012 (cognitivo) → 4 vars | MC | **base = 009 (transitivo)** — la más general: define la regla "verbos transitivos → auxiliar avere" + la **regla pedagógica clave "si lleva qualcosa detrás, auxiliar avere"**. **Injertar:** de 010 — los verbos de comunicación (parlare/dire/rispondere) y que `con` no cambia la regla; de 011 — actividad física/corporal (dormire/ridere/piangere) aunque no sean transitivos, pitfall "el hispanohablante opta por essere por intuición"; de 012 — verbos cognitivos (capire/sapere/pensare) y que **el participio es invariable cuando el auxiliar es avere**. | regla con 4 vars — huecos a 22-02: más verbos (D-19-06) |

**CRÍTICO — validation del slot (009 disputed→override):** la fuente 009 lleva 3 passes: opus `correcta`, sonnet `incorrecta` ([C5-leak] falso positivo sobre explanation/notes), autor `correcta` ([override]). Las otras tres (010/011/012) llevan el quórum limpio opus+sonnet `correcta`. **Criterio de merge de validation:** el slot `avere-passato-prossimo` PRESERVA el `validation` top-level de **009 tal cual** (status `validated` + los 3 passes incl. el override del autor), porque 009 es la variante cuya explanation/superficie domina la base del slot. NO se re-valida ninguna superficie (se mueven intactas). El override autor es canon (D-02 / MEMORY.md: el C5-leak sobre explanation/notes es falso-positivo de política R1). Documentar este criterio en el SUMMARY.

### Bloque 4 — Word-buttons (2 slots-de-1, D-19-03)

No se fuerzan variantes (D-19-03). `categoryIds: ["avere"]`, explanation sube tal cual.

| slot-id | uso | id-fuente | type | explanation | celda? |
|---------|-----|-----------|------|-------------|--------|
| `avere-wb-posesion` | posesión simple "Yo tengo un coche" | 100 → 1 var | word-buttons | sube tal cual (100); matiz distractoras: `hai` 2ª sing ≠ io, `sono` essere ≠ posesión | slot-de-1 estable (no se fuerza) |
| `avere-wb-fame` | idiomático avere fame "Nosotros tenemos hambre" | 101 → 1 var | word-buttons | sube tal cual (101); matiz distractoras: `sete`=sed, `ho`=1ª sing ≠ plural | slot-de-1 estable |

### Bloque 5 — Match (3 slots-de-1, D-19-03, D-66)

Match como slot-de-1 (D-19-03). **Preservar los DUPLICADOS textuales 'ha' de 202 verbatim (D-66).** `categoryIds: ["avere"]`.

| slot-id | uso | id-fuente | type | explanation | nota |
|---------|-----|-----------|------|-------------|------|
| `avere-match-persone-1` | match sujeto↔forma (io/tu/lui/noi) | 200 → 1 var | match | sube tal cual (200) | 4 parejas sin duplicados |
| `avere-match-persone-2` | match persona↔forma (voi/loro/io/lei) | 201 → 1 var | match | sube tal cual (201) | 4 parejas sin duplicados |
| `avere-match-persone-3` | match sujeto↔forma con `ha` duplicado (lui/lei/noi/voi) | 202 → 1 var | match | sube tal cual (202) | **DOS `ha` preservados verbatim (D-66)** |

### Bloque 6 — Cruces multi-categoría (6 slots-de-1, D-19-04 / D-87)

**id ESTABLE intacto (avere-300..305)** + **categoryIds de 2 ids preservados**. Rango 300..305 RESERVADO/excluido de la renumeración de slots avere-only. No romper `clearedExerciseIds` de las categorías cruzadas ni la cascada D-54 (2 call-sites). Cada cruce → slot-de-1 (su payload MC → 1 variant + explanation top-level).

| slot-id (ESTABLE) | cruce | categoryIds | id-fuente | explanation |
|-------------------|-------|-------------|-----------|-------------|
| `avere-300` | avere + profesiones (medico, masc) | `["avere","profesiones"]` | 300 → 1 var | sube tal cual (300) |
| `avere-301` | avere + profesiones (avvocata, fem -o→-a) | `["avere","profesiones"]` | 301 → 1 var | sube tal cual (301) |
| `avere-302` | avere + sustantivos-irregulares (braccia) | `["avere","sustantivos-irregulares"]` | 302 → 1 var | sube tal cual (302) |
| `avere-303` | avere + preposiciones (a Milano) | `["avere","preposiciones"]` | 303 → 1 var | sube tal cual (303) |
| `avere-304` | avere + genero-numero (figli/figlia) | `["avere","genero-numero"]` | 304 → 1 var | sube tal cual (304) |
| `avere-305` | avere + verbos-movimiento (è andata / ha visto) | `["avere","verbos-movimiento"]` | 305 → 1 var | sube tal cual (305) |

---

## Sección crítica — Plan de RE-BASE del blindaje APPEND-ONLY D-88 (relax D-178 opción A)

**El problema:** `scripts/assert-avere-prefix-unchanged.mjs` compara los primeros 17 ejercicios de `avere.json` (campos CORE: id, type, categoryIds, prompt, options, correctIndex, pairs, answer, distractors — excluyendo explanation/notes/validation que son aditivos D-178/D-VAL-08) contra `scripts/.avere-prefix-snapshot.json` (ground truth de los 17 ejercicios legacy avere-001..012, 100..101, 200..202). La reagrupación a slots **renumera ids** (001→`avere-ho`, etc.), **reordena** y **mueve superficies a variants[]** → rompe ese invariante por diseño (FALLA exit 1). El assert NO corre en la suite (`node --test tests/*.test.js`) ni en `run-validation-271.mjs` — es un script standalone.

**La resolución (aprobada en el checkpoint, relax D-178 opción A):** RE-BASAR el snapshot al estado slot+variantes. Tras reescribir `avere.json` en Task 2, ejecutar:

```
node scripts/snapshot-avere-prefix.mjs        # regenera .avere-prefix-snapshot.json con los 17 PRIMEROS slots del array nuevo
node scripts/assert-avere-prefix-unchanged.mjs # debe volver a exit 0 contra el nuevo ground truth
```

**Justificación:** la conversión a slots **supersede** el invariante legacy de ids (Phase 21 ya reseteó el progreso de avere vía `migrate8to9` → renumeración libre). El invariante NO se ignora: se RE-BASA una sola vez como parte de esta conversión documentada. Su valor protector futuro pasa a ser "estos 17 primeros slots no cambian silenciosamente en el futuro". El SUMMARY registra el re-base con su commit.

> Nota: con 19 slots, los 17 primeros que captura el snapshot son: `avere-ho`, `avere-hai`, `avere-ha`, `avere-abbiamo`, `avere-avete`, `avere-hanno`, `avere-sensazioni`, `avere-passato-prossimo`, `avere-wb-posesion`, `avere-wb-fame`, `avere-match-persone-1`, `avere-match-persone-2`, `avere-match-persone-3`, `avere-300`, `avere-301`, `avere-302`, `avere-303` (los slots 18-19 `avere-304`/`avere-305` quedan fuera del prefijo de 17, pero el orden del array los pondrá al final; el snapshot protege los 17 primeros tal como hoy). El orden de emisión en el JSON sigue el orden de la tabla de cobertura (presente → sensaciones → passato → wb → match → cruces).

---

## Notas para 22-02 (NO ejecutar aquí)

- **Celdas pobres a engordar (6):** los 6 slots de presente por persona tienen 1 variante hoy → autorar variantes nuevas por quórum cross-vendor R1-R7.
- **Huecos de regla a evaluar:** más idiomatismos de sensación (avere sete/freddo/sonno/ragione/anni — D-19-06); más verbos de passato prossimo con auxiliar avere (otros transitivos/comunicación/cognitivos).
- **Counts de tests/scripts:** se sincronizan en 22-03 contra el conteo REAL final tras 22-02. NO se tocan aquí.

---
*Mapa propuesto por el planner/executor; refinado y aprobado por el autor en el checkpoint:decision de 22-01.*
