# Phase 19 — Variantes NUEVAS propuestas para Articoli (Task 1 del plan 19-02)

**Generado:** 2026-06-04
**Estado:** PROPUESTO — pendiente de aprobación del autor en el checkpoint:human-verify (D-85)
**AÚN NO validadas por quórum.** El quórum cross-vendor R1-R7 (Gemini + DeepSeek + Claude Opus+Sonnet)
se ejecuta en Task 2, 1-por-1, fresh context, NUNCA batched, SOLO sobre las superficies que el autor apruebe.

Artefacto de propuesta. Cada superficie nueva lista: id temporal (para el quórum aislado como ejercicio
legacy multiple-choice), slot destino (existente o nuevo), `prompt`/`options`/`correctIndex`, la explanation
(del slot — las variantes NO llevan explanation propia, D-15-02) y la justificación R6 (artículo+sustantivo
italiano verificado).

**Decisiones aplicadas:** D-19-05 (engordar celdas pobres a ≥2, sin cuota rígida, conservador),
D-19-06 (huecos `y` / `i+vocal` → slots nuevos en la serie lo/gli, R6 crítico), D-17-05 (explanation
de slot), R1-R7 (autoría), R7 gloss ES (canon).

---

## Resumen del conteo (driver del coste de quórum y del count final de 19-03)

| Bloque | Superficies nuevas | Slots tocados |
|--------|--------------------|---------------|
| Celdas pobres engordadas (≥2 variantes) | 5 | 5 slots existentes (`lo-ps`, `lo-gn`, `lo-x`, `uno-ps`, `uno-gn`) |
| Slots NUEVOS de huecos y/i+vocal (sing `lo`) | 2 | 1 slot nuevo `articoli-lo-yi` (lo yogurt + lo iodio) |
| Slots NUEVOS de huecos y/i+vocal (plural `gli`) | 1 | 1 slot nuevo `articoli-gli-yi` (gli yogurt) |
| **TOTAL superficies nuevas a validar por quórum** | **8** | 5 existentes engordados + 2 nuevos |

**Conteo de slots tras 19-02 (determinable para 19-03):** 32 slots actuales + 2 slots nuevos = **34 slots**.
(Las celdas pobres NO añaden slots — solo variantes a slots existentes.)

**8 superficies nuevas → 8 ciclos de quórum cross-vendor en Task 2** (cada una: Gemini + DeepSeek vía
validate-ai-pass + Claude Opus+Sonnet vía skill; ≥4× "correcta", cero "incorrecta", antes de integrar).

---

## A. CELDAS POBRES ENGORDADAS (D-19-05 — reformular el MISMO sub-disparador con otro sustantivo)

Cada una añade 1 variante al slot existente (que hoy tiene 1) → queda con 2 variantes. Comparten la
explanation del slot destino (no se reescribe la explanation; ya es completa). El id temporal es para el
quórum aislado en Task 2; tras pasar, la superficie se mueve a `variants[]` del slot destino y el id temporal
legacy se elimina.

### A1 — `articoli-lo-ps` (lo + ps-) — añadir 2ª variante

- **id temporal (quórum):** `tmp-lo-ps-2`
- **slot destino:** `articoli-lo-ps` (existente)
- **prompt:** `Lo scrittore firma con ___ pseudonimo elegante.`
- **options:** `["il", "lo", "l'", "la"]`
- **correctIndex:** `1` (lo)
- **explanation (heredada del slot):** "Psicologo empieza por ps-, un grupo consonantico que en italiano pide lo: lo psicologo. Es una de las trampas mas faciles de fallar, porque en espanol decimos el psicologo; el italiano trata ps- como s impura y exige lo."
- **Justificación R6:** *pseudonimo* (masc, "seudónimo") empieza por **ps-**, grupo de s impura → masc sing = **lo pseudonimo**. Confirmado: mismo disparador que *lo psicologo*. Sustantivo italiano real y A1-razonable. Respuesta inequívoca (R7): solo `lo` cuadra (il/l'/la descartados por género+disparador).

### A2 — `articoli-lo-gn` (lo + gn-) — añadir 2ª variante

- **id temporal (quórum):** `tmp-lo-gn-2`
- **slot destino:** `articoli-lo-gn` (existente)
- **prompt:** `Al ristorante ho ordinato ___ gnocco di patate piu grande.`
- **options:** `["il", "lo", "l'", "la"]`
- **correctIndex:** `1` (lo)
- **explanation (heredada del slot):** "Gnomo empieza por gn-, sonido que tambien exige lo: lo gnomo. El grupo gn- se comporta como la s impura y la z, asi que el masculino singular es lo, no il."
- **Justificación R6:** *gnocco* (masc sing de *gnocchi*) empieza por **gn-** → masc sing = **lo gnocco**. Mismo disparador que *lo gnomo*. El singular *gnocco* es italiano correcto (el plural *gli gnocchi* ya aparece en el slot plural). Respuesta inequívoca: solo `lo`.

### A3 — `articoli-lo-x` (lo + x-) — añadir 2ª variante

- **id temporal (quórum):** `tmp-lo-x-2`
- **slot destino:** `articoli-lo-x` (existente)
- **prompt:** `Il regista intervista ___ xenofobo del quartiere.`
- **options:** `["il", "lo", "l'", "la"]`
- **correctIndex:** `1` (lo)
- **explanation (heredada del slot):** "Xilofono empieza por x-, otro sonido que pide lo: lo xilofono. La x- inicial es poco frecuente pero entra en el mismo grupo de la s impura y la z, asi que el articulo es lo."
- **Justificación R6:** *xenofobo* (masc, "xenófobo") empieza por **x-** → masc sing = **lo xenofobo**. Mismo disparador que *lo xilofono*. Sustantivo italiano real. Respuesta inequívoca: solo `lo`.

### A4 — `articoli-uno-ps` (uno + ps-) — añadir 2ª variante

- **id temporal (quórum):** `tmp-uno-ps-2`
- **slot destino:** `articoli-uno-ps` (existente)
- **prompt:** `Lo scrittore ha scelto ___ pseudonimo per il romanzo.`
- **options:** `["un", "uno", "una", "un'"]`
- **correctIndex:** `1` (uno)
- **explanation (heredada del slot):** "Psicologo empieza por ps-, grupo que en masculino exige uno: uno psicologo. Espejo del determinativo lo psicologo. El ps- entra en la familia de la s impura, asi que la forma corta un es incorrecta aqui."
- **Justificación R6:** *pseudonimo* (masc) por **ps-** → indeterminativo masc = **uno pseudonimo** (espejo de *lo pseudonimo* / *uno psicologo*). Respuesta inequívoca: solo `uno` (un descartado por ps-; una/un' por género).

### A5 — `articoli-uno-gn` (uno + gn-) — añadir 2ª variante

- **id temporal (quórum):** `tmp-uno-gn-2`
- **slot destino:** `articoli-uno-gn` (existente)
- **prompt:** `Nel presepe manca ___ gnomo di ceramica.`
- **options:** `["un", "uno", "una", "un'"]`
- **correctIndex:** `1` (uno)
- **explanation (heredada del slot):** "Gnomo empieza por gn-, sonido que en masculino pide uno: uno gnomo. El grupo gn- pertenece a la familia que exige la forma larga uno, igual que en el determinativo lo gnomo."
- **Justificación R6:** *gnomo* (masc) por **gn-** → indeterminativo masc = **uno gnomo**. (Reusa el mismo sustantivo del slot pero en otra frase/contexto, válido para engordar la celda: el slot hoy ya usa *gnomo*; esta variante refuerza la celda con una superficie distinta del mismo disparador.) Respuesta inequívoca: solo `uno`.

> **Nota A5:** la celda `uno-gn` tiene escasos sustantivos gn- frecuentes a nivel A1 además de *gnomo* (gnocco es más natural en plural). Se reformula con *gnomo* en otra frase para no forzar un sustantivo gn- artificial/raro (D-19-05: no inflar artificialmente; pragmático). Si el autor prefiere un sustantivo gn- distinto, lo indica en el checkpoint.

---

## B. SLOTS NUEVOS — huecos `y` / `i+vocal` en la serie lo/gli (D-19-06, R6 CRÍTICO)

Regla de fondo: los sonidos **semiconsonánticos** `i+vocal` (iodio, iato, ione) y la `y-` inicial
(yogurt, yoga) se comportan como s impura → disparan la serie **lo/gli** en masculino, NUNCA il/i.
Terreno de error fácil (R6): verificado abajo cada artículo+sustantivo.

### B1 — slot NUEVO `articoli-lo-yi` (singular `lo` ante y / i+vocal)

- **slot-id nuevo:** `articoli-lo-yi`
- **type:** `multiple-choice`
- **categoryIds:** `["articoli"]`
- **explanation de slot (NUEVA):** "Ante un sonido semiconsonantico, la y- inicial (yogurt) y la i+vocal (iodio, iato) disparan lo en el masculino singular, igual que la s impura: lo yogurt, lo iodio. El hispanohablante tiende a decir el yogur o el yodo y a elegir il, pero estos sonidos entran en la familia de lo/gli; la forma il es incorrecta aqui."

**Superficies (2 variantes):**

| id temporal | prompt | options | correctIndex | R6 |
|-------------|--------|---------|--------------|-----|
| `tmp-lo-yi-1` | `A colazione mangio ___ yogurt alla frutta.` | `["il", "lo", "l'", "la"]` | `1` (lo) | *yogurt* (masc, invariable) empieza por **y-** semiconsonántica → **lo yogurt**. Italiano estándar correcto. Respuesta inequívoca: solo `lo`. |
| `tmp-lo-yi-2` | `Il medico prescrive ___ iodio per la ferita.` | `["il", "lo", "l'", "la"]` | `1` (lo) | *iodio* (masc, "yodo") empieza por **i+vocal** (i-o) semiconsonántica → **lo iodio** (NO l'iodio: la i semiconsonántica no se elide; NO il iodio). Italiano estándar correcto. Respuesta inequívoca: solo `lo`. |

> **R6 — punto delicado (i+vocal):** ante `i+vocal` semiconsonántica el artículo es **lo** sin elisión (*lo iodio*, *lo iato*), NO `l'`. La elisión `l'` aplica a vocal plena (l'isola), pero la i semiconsonántica de *iodio*/*iato* se trata como consonante de apoyo → lo. Este es justo el error que el slot debe re-verificar. Confirmar en el quórum (DeepSeek estricto).

### B2 — slot NUEVO `articoli-gli-yi` (plural `gli` ante y / i+vocal)

- **slot-id nuevo:** `articoli-gli-yi`
- **type:** `multiple-choice`
- **categoryIds:** `["articoli"]`
- **explanation de slot (NUEVA):** "El plural de lo es gli tambien ante los sonidos semiconsonanticos: la y- (gli yogurt) y la i+vocal entran en la serie lo/gli. Como en singular era lo yogurt, en plural es gli yogurt (yogurt es invariable). El error es decir i yogurt por analogia con il/i; el disparador semiconsonantico mantiene la familia lo/gli."

**Superficie (1 variante):**

| id temporal | prompt | options | correctIndex | R6 |
|-------------|--------|---------|--------------|-----|
| `tmp-gli-yi-1` | `In frigorifero ci sono ___ yogurt scaduti.` | `["i", "gli", "le", "l'"]` | `1` (gli) | *yogurt* es **invariable** en plural (un yogurt → due yogurt); el artículo plural de *lo* es **gli** → **gli yogurt**. Italiano estándar correcto. Respuesta inequívoca: solo `gli` (i descartado por disparador; le femenino; l' singular). |

> **R6 — invariabilidad de *yogurt*:** *yogurt* no cambia de forma en plural (préstamo); solo cambia el artículo (lo → gli). Por eso *gli yogurt scaduti* (con adjetivo plural *scaduti*) marca el número sin alterar el sustantivo. Confirmar en el quórum.

---

## Scan de acentos / ASCII (R1-R7, pre-quórum)

Verificado sobre cada `prompt`/`options`/`explanation` nueva de este documento:

- **Sin smart-quotes** (`'` `'` `"` `"`): los apóstrofes en options (`l'`, `un'`) son ASCII U+0027; no hay comillas tipográficas.
- **Sin markdown** dentro de prompts/options/explanations (los `___` son el blank canónico).
- **Sin refs #NNN** en explanations (R2).
- **Sin leak de la regla/solución en el prompt** (R1): los prompts solo contienen la frase + blank; ninguno dice "(s impura)", "(semiconsonántica)", "(regla)", etc.
- **Sin gloss ES necesario** en estas superficies (no hay doble-validez de ciudad/preposición tipo R7; el disparador fonético fija una sola respuesta). No se añade gloss artificial.
- **Acentos español en explanations:** las explanations de celdas pobres se heredan del slot existente (ya validadas, sin tildes por convención del archivo legacy — se mantienen tal cual para no romper la base validada). Las 2 explanations NUEVAS de slot (B1, B2) siguen la misma convención ASCII del archivo (sin tildes) para consistencia con las explanations hermanas del mismo archivo.

---

## Conteo reportado

- **Superficies nuevas propuestas: 8** (5 de celdas pobres + 3 de huecos y/i+vocal).
- **Slots nuevos: 2** (`articoli-lo-yi`, `articoli-gli-yi`).
- **Slots existentes engordados a ≥2 variantes: 5** (`lo-ps`, `lo-gn`, `lo-x`, `uno-ps`, `uno-gn`).
- **Slots tras 19-02: 34** (32 + 2 nuevos) — determinable para el sync de counts de 19-03.

---

*Task 1 del plan 19-02 — PROPUESTO, pendiente de aprobación del autor en el checkpoint:human-verify.*
