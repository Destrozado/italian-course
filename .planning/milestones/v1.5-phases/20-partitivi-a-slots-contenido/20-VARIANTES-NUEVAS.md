# Phase 20 — Variantes NUEVAS propuestas para Partitivi (Task 1 del plan 20-02)

**Generado:** 2026-06-05
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:human-verify (D-85)
**AÚN NO validadas por quórum.** El quórum cross-vendor R1-R7 (Gemini + DeepSeek + Claude Opus+Sonnet)
se ejecuta en Task 2, 1-por-1, fresh context, NUNCA batched, SOLO sobre las superficies que el autor apruebe.

Artefacto de propuesta. Espeja el formato de `19-VARIANTES-NUEVAS.md`. Cada superficie nueva lista:
id temporal (para el quórum aislado como ejercicio legacy multiple-choice), slot destino (existente o
nuevo), `prompt`/`options`/`correctIndex`, la explanation (del slot — las variantes NO llevan
explanation propia, D-15-02) y la justificación R6 (contracción di+artículo + sustantivo italiano
verificado: género, número, contabilidad).

**Decisiones aplicadas:** D-19-05 (engordar celdas pobres a ≥2, sin cuota rígida, conservador),
D-19-06 (huecos de suoni speciali → slots nuevos SOLO donde existe sustantivo A1 natural, R6 crítico),
D-17-05 (explanation de slot), D-19-09 (validation top-level en slots nuevos), R1-R7 (autoría),
R7 gloss ES (canon).

---

## Resumen del conteo (driver del coste de quórum y del count final de 20-03)

| Bloque | Superficies nuevas | Slots tocados |
|--------|--------------------|---------------|
| Celdas pobres engordadas (≥2 variantes) | 4 | 4 slots existentes (`dello-scons`, `degli-scons`, `degli-vocal`, `degli-z`) |
| Slot NUEVO hueco `degli + gn` (pl masc) | 1 | 1 slot nuevo `partitivos-degli-gn` (degli gnocchi) |
| Slot NUEVO hueco `degli + ps` (pl masc) | 1 | 1 slot nuevo `partitivos-degli-ps` (degli psicologi) |
| **TOTAL superficies nuevas a validar por quórum** | **6** | 4 existentes engordados + 2 nuevos |

**Conteo de slots tras 20-02 (determinable para 20-03):** 17 slots actuales + 2 slots nuevos = **19 slots**.
(Las celdas pobres NO añaden slots — solo variantes a slots existentes.)

**6 superficies nuevas → 6 ciclos de quórum cross-vendor en Task 2** (cada una: Gemini + DeepSeek vía
validate-ai-pass + Claude Opus+Sonnet vía skill; ≥4× "correcta", cero "incorrecta", antes de integrar).

---

## Decisión de alcance conservador sobre los huecos de suoni speciali (D-19-06, R6)

El mapa 20-REAGRUPACION-MAP.md anotó como huecos candidatos: **dello+gn/ps/x** (singular `dello`) y
**degli+gn/ps** (plural `degli`). Análisis R6 antes de materializar:

- **dello+gn / dello+ps / dello+x (singular masc):** el partitivo `dello` = "algo de" un **incontable
  masculino singular** (di+lo, masa que se mide, no se cuenta). Los sustantivos italianos A1 que empiezan
  por gn- / ps- / x- son todos **CONTABLES** (gnomo, gnocco, psicologo, xilofono → unidades que se
  cuentan), NO masas incontables. Forzar `dello gnomo`/`dello psicologo` como partitivo singular sería
  artificial (un partitivo incontable sobre un sustantivo contable). **NO se materializan** (alcance
  conservador D-19-05: no hay sustantivo A1 gn-/ps-/x- masc **incontable** natural que dispare la serie
  partitiva singular). Como artículo determinativo `lo gnomo`/`lo psicologo` sí existe (Articoli 19-02
  los cubrió), pero el **partitivo singular** exige masa incontable, que esos sustantivos no son.

- **degli+gn / degli+ps (plural masc contable):** aquí SÍ son naturales. El partitivo `degli` = "unos"
  sobre un **contable masculino plural** (di+gli). `gli gnocchi` (plural de gnocco, gn-) → `degli gnocchi`
  ("unos ñoquis", comida A1 totalmente natural). `gli psicologi` (plural de psicologo, ps-) →
  `degli psicologi` ("unos psicólogos", A1 razonable). Ambos disparan gli en plural masc por el suono
  speciale (gn-, ps-), exactamente como `degli studenti` (s-impura) y `degli zii` (z). **SÍ se
  materializan** como slots nuevos con R6 verificada abajo.

**Resultado:** 0 slots nuevos en singular (dello+gn/ps/x descartados, conservador) + 2 slots nuevos en
plural (degli+gn, degli+ps). Misma línea purista de Articoli pero pragmática: la completitud de la serie
se cierra SOLO donde hay sustantivo A1 natural que dispara el partitivo.

---

## A. CELDAS POBRES ENGORDADAS (D-19-05 — reformular el MISMO sub-disparador con otro sustantivo)

Cada una añade 1 variante al slot existente (que hoy tiene 1) → queda con 2 variantes. Comparten la
explanation del slot destino (no se reescribe; ya es completa, rule-first y RAE-acentuada). El id temporal
es para el quórum aislado en Task 2; tras pasar, la superficie se mueve a `variants[]` del slot destino y
el id temporal legacy se elimina.

### A1 — `partitivos-dello-scons` (dello + s impura, incontable masc sing) — añadir 2ª variante

- **id temporal (quórum):** `tmp-dello-scons-2`
- **slot destino:** `partitivos-dello-scons` (existente; hoy 1 variante: `dello spirito di squadra`)
- **prompt:** `Sento ___ stress per gli esami.`
- **options:** `["dello", "del", "della", "dell'"]`
- **correctIndex:** `0` (dello)
- **explanation (heredada del slot):** "Ante un incontable masculino que empieza por s impura (s + consonante), el partitivo es dello. La s seguida de consonante es uno de los sonidos que piden lo: lo spirito, lo studente, lo sport. Como el partitivo es di + el artículo, di + lo da dello: dello spirito. Del sería el calco erróneo de la forma por defecto sin atender a la s impura."
- **Justificación R6:** *stress* (masc, préstamo invariable, "estrés") empieza por **st-** = s impura → masc sing **incontable** (el estrés se siente como masa, no se cuenta) → artículo `lo stress` → di+lo = **dello stress**. Mismo sub-disparador (s impura) y misma contabilidad/número (incontable masc sing) que `dello spirito`. Respuesta inequívoca (R7): solo `dello` cuadra (del = calco erróneo ignorando la s impura; della = error de género; dell' = no hay vocal inicial).

### A2 — `partitivos-degli-scons` (degli + s impura, contable masc pl) — añadir 2ª variante

- **id temporal (quórum):** `tmp-degli-scons-2`
- **slot destino:** `partitivos-degli-scons` (existente; hoy 1 variante: `degli studenti stranieri`)
- **prompt:** `Per cena ho preparato ___ spaghetti.`
- **options:** `["degli", "dei", "delle", "del"]`
- **correctIndex:** `0` (degli)
- **explanation (heredada del slot):** "Ante un contable masculino en plural que empieza por s impura, el partitivo es degli. La s + consonante en plural pide gli, y di + gli da degli: degli studenti, unos estudiantes. En plural, degli absorbe lo que en singular era dello (lo studente da degli studenti). El error frecuente es dei studenti, calcando el plural normal sin atender a la s impura."
- **Justificación R6:** *spaghetti* (masc plural, s impura sp-, comida A1 natural) → en plural masc la s impura pide `gli spaghetti` → di+gli = **degli spaghetti** ("unos espaguetis", cantidad indeterminada contable plural). Mismo sub-disparador (s impura) y mismo número (contable masc pl) que `degli studenti`. Respuesta inequívoca: solo `degli` (dei = calco erróneo ignorando la s impura; delle = error de género; del = error de número).

### A3 — `partitivos-degli-vocal` (degli + vocal, contable masc pl) — añadir 2ª variante

- **id temporal (quórum):** `tmp-degli-vocal-2`
- **slot destino:** `partitivos-degli-vocal` (existente; hoy 1 variante: `degli amici al ristorante`)
- **prompt:** `In albergo ho conosciuto ___ uomini simpatici.`
- **options:** `["degli", "dei", "delle", "dell'"]`
- **correctIndex:** `0` (degli)
- **explanation (heredada del slot):** "Ante un contable masculino en plural que empieza por vocal, el partitivo es degli. Los masculinos en plural ante vocal piden gli, y di + gli da degli: degli amici, unos amigos. En plural NO hay elisión con apóstrofo como en el singular dell'; la vocal se resuelve con degli. El error típico es dei amici, calcando el plural ante consonante."
- **Justificación R6:** *uomini* (masc plural de *uomo*, empieza por vocal u-, A1 natural "hombres") → en plural masc ante vocal el artículo es `gli uomini` → di+gli = **degli uomini** ("unos hombres"). Mismo sub-disparador (vocal) y mismo número (contable masc pl) que `degli amici`. En plural NO hay elisión `dell'` (eso es singular). Respuesta inequívoca: solo `degli` (dei = calco ante consonante; delle = error de género; dell' = singular, no plural).

### A4 — `partitivos-degli-z` (degli + z-, contable masc pl) — añadir 2ª variante

- **id temporal (quórum):** `tmp-degli-z-2`
- **slot destino:** `partitivos-degli-z` (existente; hoy 1 variante: `degli zii dalla Sicilia`)
- **prompt:** `Per la gita servono ___ zaini robusti.`
- **options:** `["degli", "dei", "delle", "dello"]`
- **correctIndex:** `0` (degli)
- **explanation (heredada del slot):** "Ante un contable masculino en plural que empieza por z-, el partitivo es degli. Los masculinos con z piden gli en plural, y di + gli da degli: degli zii, unos tíos. Es el plural de lo zio: la z que en singular daba dello, en plural da degli. Dei zii sería el error de ignorar la z."
- **Justificación R6:** *zaini* (masc plural de *zaino*, empieza por z-, A1 natural "mochilas") → en plural masc la z- pide `gli zaini` → di+gli = **degli zaini** ("unas mochilas"). Mismo sub-disparador (z-) y mismo número (contable masc pl) que `degli zii`. La z que en singular daba `dello` (lo zaino), en plural da `degli`. Respuesta inequívoca: solo `degli` (dei = error de ignorar la z; delle = error de género; dello = singular).

---

## B. SLOTS NUEVOS — huecos de suoni speciali en la serie degli (D-19-06, R6 CRÍTICO)

Regla de fondo: en el plural masculino contable, los suoni speciali (s impura, z, gn, ps, x) disparan
`gli`, y di+gli da `degli` — igual que en singular disparaban `lo`/`dello`. Los huecos `gn` y `ps` de la
serie partitiva plural se cierran SOLO con sustantivos A1 naturales. R6 verificado abajo por cada uno.

### B1 — slot NUEVO `partitivos-degli-gn` (plural `degli` ante gn-)

- **slot-id nuevo:** `partitivos-degli-gn`
- **type:** `multiple-choice`
- **categoryIds:** `["partitivos"]`
- **explanation de slot (NUEVA, rule-first D-19-07):** "Ante un contable masculino en plural que empieza por gn-, el partitivo es degli. El grupo gn- es uno de los suoni speciali que en plural masculino piden gli, y di + gli da degli: degli gnocchi, unos ñoquis. En plural, degli absorbe lo que en singular era dello (lo gnocco da degli gnocchi), igual que con la s impura y la z. El error frecuente es dei gnocchi, calcando el plural normal sin atender al grupo gn-."

**Superficie (1 variante):**

| id temporal | prompt | options | correctIndex | R6 |
|-------------|--------|---------|--------------|-----|
| `tmp-degli-gn-1` | `Stasera mangiamo ___ gnocchi fatti in casa.` | `["degli", "dei", "delle", "dello"]` | `0` (degli) | *gnocchi* (masc plural de *gnocco*, empieza por **gn-**, comida A1 totalmente natural) → en plural masc el grupo gn- pide `gli gnocchi` → di+gli = **degli gnocchi** ("unos ñoquis", cantidad indeterminada contable plural). Mismo comportamiento que `degli studenti` (s impura) y `degli zii` (z). Respuesta inequívoca: solo `degli` (dei = calco ignorando gn-; delle = error de género; dello = singular). |

> **R6 — punto delicado (gn- en plural):** el grupo gn- pertenece a la familia de suoni speciali (s impura,
> z, gn, ps, x) que en masculino piden lo/gli. En singular sería `lo gnocco` / `dello gnocco`, pero el
> singular partitivo `dello` exige incontable y *gnocco* es contable → por eso NO se materializa el
> singular (ver §"Decisión de alcance"). En plural contable `degli gnocchi` es natural e inequívoco.
> Confirmar di+gli = degli en el quórum (DeepSeek estricto).

### B2 — slot NUEVO `partitivos-degli-ps` (plural `degli` ante ps-)

- **slot-id nuevo:** `partitivos-degli-ps`
- **type:** `multiple-choice`
- **categoryIds:** `["partitivos"]`
- **explanation de slot (NUEVA, rule-first D-19-07):** "Ante un contable masculino en plural que empieza por ps-, el partitivo es degli. El grupo ps- es uno de los suoni speciali que en plural masculino piden gli, y di + gli da degli: degli psicologi, unos psicólogos. En plural, degli absorbe lo que en singular era dello (lo psicologo da degli psicologi). El hispanohablante tiende a decir dei psicologi calcando el español los psicólogos, pero el grupo ps- exige gli."

**Superficie (1 variante):**

| id temporal | prompt | options | correctIndex | R6 |
|-------------|--------|---------|--------------|-----|
| `tmp-degli-ps-1` | `Nella clinica lavorano ___ psicologi esperti.` | `["degli", "dei", "delle", "dello"]` | `0` (degli) | *psicologi* (masc plural de *psicologo*, empieza por **ps-**, A1 razonable "psicólogos") → en plural masc el grupo ps- pide `gli psicologi` → di+gli = **degli psicologi** ("unos psicólogos", cantidad indeterminada contable plural). Mismo comportamiento que `degli studenti` (s impura). Respuesta inequívoca: solo `degli` (dei = calco del español ignorando ps-; delle = error de género; dello = singular). |

> **R6 — punto delicado (ps- en plural):** ps- es suono speciale (familia s impura). En singular sería
> `lo psicologo`, pero el partitivo singular `dello` exige incontable y *psicologo* es contable → NO se
> materializa el singular. En plural contable `degli psicologi` es natural e inequívoco. El error del
> hispanohablante (dei psicologi, por calco de "los psicólogos") es justo lo que el slot re-verifica.
> Confirmar di+gli = degli en el quórum.

---

## Scan de acentos / ASCII (R1-R7, pre-quórum)

Verificado sobre cada `prompt`/`options`/`explanation` nueva de este documento:

- **Sin smart-quotes** (`'` `'` `"` `"`): los apóstrofes en options (`dell'`) son ASCII U+0027; no hay
  comillas tipográficas. Verificable: `grep -P '[\x{2018}\x{2019}\x{201C}\x{201D}]'` da 0 sobre las
  superficies/explanations nuevas.
- **Sin markdown** dentro de prompts/options/explanations (los `___` son el blank canónico).
- **Sin refs #NNN** en explanations (R2).
- **Sin leak de la regla/solución en el prompt** (R1): los prompts solo contienen la frase + blank;
  ninguno dice "(s impura)", "(gn-)", "(plural)", "(regla)", etc.
- **Sin gloss ES necesario** en estas superficies (no hay doble-validez tipo R7 essere+ciudad; el
  disparador fonético + contabilidad/número fija una sola respuesta). No se añade gloss artificial.
- **Acentos español en explanations:** las explanations de celdas pobres se heredan del slot existente
  (ya RAE-acentuadas y rule-first en el JSON tras 20-01 — se mantienen tal cual). Las 2 explanations
  NUEVAS de slot (B1, B2) están RAE-acentuadas (rule-first, lideran con el disparador) consistentes con
  el resto del corpus de partitivos.json (D-19-07).

---

## Conteo reportado

- **Superficies nuevas propuestas: 6** (4 de celdas pobres + 2 de huecos de suoni speciali plural).
- **Slots nuevos: 2** (`partitivos-degli-gn`, `partitivos-degli-ps`).
- **Slots existentes engordados a ≥2 variantes: 4** (`dello-scons`, `degli-scons`, `degli-vocal`, `degli-z`).
- **Slots tras 20-02: 19** (17 + 2 nuevos) — determinable para el sync de counts de 20-03.
- **Huecos NO materializados (conservador D-19-05):** dello+gn, dello+ps, dello+x (singular: requieren
  incontable masc, sin sustantivo A1 natural gn-/ps-/x- que sea masa).

---

*Task 1 del plan 20-02 — PROPUESTO, pendiente de aprobación del autor en el checkpoint:human-verify.*
