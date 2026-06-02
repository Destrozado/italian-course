# Temario exhaustivo de Partitivos (incontable + contable + alternativas)

**Fase:** 12-partitivos
**Entregable:** PRIMER entregable de la fase (D-13 / PART-02) — escrito y commiteado ANTES de que exista ningún ejercicio (`content/exercises/partitivos.json`). El orden temario→ejercicios es un hard requirement verificable en git (precedente Phase 11: temario `74cd086` precedió a `articoli.json` `d8fcad8`).
**Propósito:** Checklist de cobertura. Cada fila es una **celda** (forma del partitivo x disparador fonético x incontable/contable x alternativa x omisión x distinción función) que los planes 12-02 (base multiple-choice + alternativas + omisión) y 12-03 (match + clasificación PART-05) deben mapear a >=1 ejercicio. El número final de ejercicios (~30-40, D-09) se deriva de este documento: cada celda >=1 ejercicio; los disparadores frecuentes con varios contextos léxicos. El temario es la ÚNICA fuente del conteo.

**Convenciones de este documento:**
- Apostrofes ASCII U+0027 en todas las formas elididas (`l'`, `un'`) — nunca comillas tipograficas.
- Terminos italianos preservados con su ortografia (studente, zio, psicologo, gnocchi, ...).
- Texto explicativo en espanol acentuado (canon D-135).
- Markdown estandar permitido aqui (es un documento de planificacion, NO un payload de ejercicio).

---

## Regla nuclear (el partitivo determinativo = `di` + artículo, hereda el disparador fonético)

El partitivo determinativo italiano NO es una forma nueva que memorizar: es la preposición `di` fundida con el **artículo determinativo** que el autor ya domina (Articoli, Phase 11 — recién construido). De ahí que `del = di + il`, `dello = di + lo`, `della = di + la`, etc. Como el artículo se elige por el **sonido inicial del sustantivo (o del adjetivo que lo precede)**, el partitivo HEREDA exactamente los mismos disparadores fonéticos que Articoli (D-04). Esa es toda la dificultad estructural de la forma: la trampa está en el disparador fonético, igual que en Articoli.

Las 7 formas del partitivo determinativo EN ALCANCE (D-04) y su derivación:

| Forma | Derivación | Disparador fonético (heredado de Articoli) | Ejemplo |
|-------|------------|---------------------------------------------|---------|
| `del` | `di + il` | masc sing, consonante simple (b, c, d, f, l, m, n, p, r, t, v...) | del pane, del vino, del latte |
| `dello` | `di + lo` | masc sing, s+consonante ("s impura") / z / gn / ps / x | dello zucchero, dello sport |
| `della` | `di + la` | fem sing, consonante (incluida s+cualquier cosa) | della carne, della pasta |
| `dell'` | `di + l'` | sing (masc o fem), vocal (elisión) | dell'acqua, dell'olio |
| `dei` | `di + i` | masc plural, consonante simple (plural de `del`) | dei libri, dei ragazzi |
| `degli` | `di + gli` | masc plural, s+cons / z / gn / ps / x / vocal (plural de `dello` y `dell'`) | degli studenti, degli amici |
| `delle` | `di + le` | fem plural, SIEMPRE (sin variación fonética, sin elisión) | delle mele, delle case |

Puente pedagógico (D-04 / D-specifics): quien sabe que `lo zucchero` lleva `lo` (z → `lo`), ya sabe que el partitivo es `dello zucchero` (z → `di + lo`). El partitivo se "construye encima" de Articoli, no se memoriza de cero. La derivación `del = di + il` es el ancla.

---

## Incontable (singular)

La PRIMERA cara semántica del partitivo (D-01): cosas que NO se cuentan (líquidos, materias, alimentos en masa). El partitivo incontable singular = "algo de / una cantidad indeterminada de". Formas: `del/dello/della/dell'` (= `di` + artículo determinativo singular) + la alternativa `un po' di` (= "un poco de / algo de", ver §Alternativas).

| Forma | Disparador | Sustantivos incontables de ejemplo |
|-------|-----------|-------------------------------------|
| `del` | masc, consonante simple | del pane, del vino, del latte, del formaggio |
| `dello` | masc, s+cons / z / gn / ps / x | dello zucchero, dello zenzero, dello yogurt |
| `della` | fem, consonante | della carne, della pasta, della frutta |
| `dell'` | masc o fem, vocal (elisión) | dell'acqua, dell'olio, dell'aceto |
| `un po' di` | incontable (alternativa, invariable) | un po' di pane, un po' di acqua, un po' di zucchero |

Ejemplos de uso (afirmativa): "Compro del pane.", "Vorrei dell'acqua.", "Aggiungi dello zucchero.", "Mangio della carne.", "Bevo un po' di latte."

Nota semántica: el incontable NO admite plural en su sentido de masa (no se dice "dei pani" para "algo de pan"). La pluralización lleva al otro eje (contable). El contraste incontable↔contable es el corazón del temario (§Espejo).

---

## Contable (plural)

La SEGUNDA cara semántica del partitivo (D-01): cosas que SÍ se cuentan, en cantidad indeterminada. El partitivo contable plural = "unos / algunos / varios". Formas: `dei/degli/delle` (= `di` + artículo determinativo plural) + la alternativa `alcuni/alcune` (= "unos/algunos", ver §Alternativas).

| Forma | Disparador | Sustantivos contables (plural) de ejemplo |
|-------|-----------|--------------------------------------------|
| `dei` | masc plural, consonante simple | dei libri, dei ragazzi, dei cani |
| `degli` | masc plural, s+cons / z / gn / ps / x / vocal | degli studenti, degli amici, degli zii, degli gnocchi |
| `delle` | fem plural, SIEMPRE | delle mele, delle case, delle amiche |
| `alcuni` | masc plural (alternativa) | alcuni libri, alcuni studenti, alcuni amici |
| `alcune` | fem plural (alternativa) | alcune mele, alcune case |

Ejemplos de uso (afirmativa): "Ho comprato dei libri.", "Ci sono degli studenti.", "Vedo degli amici.", "Mangio delle mele.", "Conosco alcuni studenti.", "Ho alcune domande."

Nota: `degli` absorbe en plural TODO lo que en singular era `dello` (s+cons, z, gn, ps, x) o `dell'` (vocal) — la misma absorción que `gli` hace en Articoli. La trampa `degli amici` (vocal → `degli`, no `dei`) y `degli studenti` (s impura → `degli`, no `dei`) vive aquí.

---

## Alternativas (trampa por restricción gramatical, NO por sinonimia)

Reemplaza la sección Indeterminativi de Articoli (D-03). Las tres alternativas al partitivo determinativo (`alcuni/alcune`, `qualche`, `un po' di`) NO se ejercitan como sinónimos intercambiables, sino como **trampas por restricción gramatical**: cada una tiene SU regla estricta, y violar la restricción es el error.

| Alternativa | Restricción gramatical estricta | Correcto | INCORRECTO |
|-------------|----------------------------------|----------|------------|
| `qualche` | + SIEMPRE singular (aunque el sentido sea plural) | qualche libro, qualche amico, qualche domanda | qualche libri, qualche amici |
| `un po' di` | + SOLO incontable (masa, no contable) | un po' di pane, un po' di acqua, un po' di zucchero | un po' di libri, un po' di mele |
| `alcuni` / `alcune` | + SOLO plural (contable); concuerda en género | alcuni libri, alcune mele | alcuni pane, alcune acqua, alcun libro |

**Por qué la restricción blinda la doble-validez (D-03):** "dei libri ≈ alcuni libri ≈ qualche libro" son casi sinónimos en significado ("unos/algunos libros"). Si un ejercicio multiple-choice (grading por índice) dejara elegir libremente entre las tres, habría >1 respuesta correcta — mortal, porque el grading por índice exige exactamente UNA opción correcta. La solución NO es prohibir las alternativas, sino **forzar la restricción gramatical**: un prompt con un sustantivo singular contable ("___ libro") solo admite `qualche` (no `alcuni`, que exige plural; no `un po' di`, que exige incontable; no `dei`, que exige plural). Así la restricción gramatical selecciona una única respuesta válida. Cada celda de esta tabla → >=1 ejercicio que testea SU restricción.

Detalle de `qualche` (la más contraintuitiva para el hispanohablante): "qualche" significa "algunos/varios" pero rige SINGULAR en italiano ("qualche libro" = "algunos libros", literal "algún libro"). El error natural del español ("qualche libri", calcando la concordancia plural española) es justo lo que el ejercicio caza.

---

## Trampas canónicas (PART — obligatorias, cada una >=1 ejercicio)

Las trampas que el autor más confunde. Cada una etiquetada con la regla que ejercita. Los planes 12-02/12-03 DEBEN cubrirlas.

| # | Trampa | Regla que ejercita |
|---|--------|--------------------|
| 1 | `qualche libro` (no `qualche libri`) | `qualche` + SIEMPRE singular (D-03) |
| 2 | `un po' di pane` (no `un po' di libri`) | `un po' di` + SOLO incontable (D-03) |
| 3 | `alcuni libri` / `alcune mele` (no `alcuni pane`) | `alcuni/alcune` + SOLO plural contable, concordancia de género (D-03) |
| 4 | `dell'acqua` (no `della acqua`) | elisión `dell'` ante vocal en sing (masc o fem) |
| 5 | `degli studenti` / `degli amici` (no `dei studenti` / `dei amici`) | `degli` ante s+consonante y ante vocal en masc plural |
| 6 | `dello zucchero` (no `del zucchero`) | `dello` ante z / s impura en masc sing (hereda Articoli) |
| 7 | `Non compro pane` / opción `∅ / sin partitivo` (no `del pane`) | OMISIÓN del partitivo en negativa (D-02, ver §Omisión) |

El contraste explícito #7 (omisión en negativa) es el corazón del mini-bloque de omisión: en negativa el partitivo desaparece, y la opción de respuesta correcta es la ausencia (`∅`).

---

## Espejo incontable/contable (el corazón semántico — explotar en ejercicios de contraste)

El eje semántico del partitivo (D-01): el MISMO verbo y construcción, distinto sustantivo → distinta cara del partitivo. Es el espejo equivalente a `il→lo→l'` de Articoli, reorientado a incontable↔contable.

| Frase base | Sustantivo incontable → forma | Sustantivo contable → forma |
|------------|-------------------------------|------------------------------|
| "Ho comprato ___ ___" | pane → del / un po' di | mele → delle / alcune |
| "Vorrei ___ ___" | acqua → dell' / un po' di | mele → delle / alcune |
| "Ho preso ___ ___" | zucchero → dello / un po' di | libri → dei / alcuni |
| "Mangio ___ ___" | carne → della / un po' di | amici → (no aplica: amici no se "comen") |
| "Bevo ___ ___" | vino → del / un po' di | (incontable típico) |

El espejo fija la decisión PRIMERA (¿esto se cuenta o no?) ANTES de la decisión fonética (¿qué forma de del-?). Quien internaliza "pane = masa → del/un po' di" vs "mele = unidades → delle/alcune" ya tiene el 80% del partitivo. Los planes posteriores crean pares de contraste con el mismo verbo (Ho comprato del pane / Ho comprato delle mele) para re-verificar el eje.

---

## Omisión (afirmativa vs negativa)

Mini-bloque (D-02, PART-02): pocos ejercicios que contrastan USAR el partitivo en afirmativa vs OMITIRLO en negativa, con la opción de respuesta `∅ / sin partitivo`.

| Contexto | Construcción | Forma correcta |
|----------|--------------|----------------|
| Afirmativa | "Compro ___ pane." | del (USAR el partitivo) |
| Negativa | "Non compro ___ pane." | ∅ / sin partitivo (OMITIR — nunca "del pane") |
| Afirmativa | "Ho ___ amici a Roma." | degli (USAR el partitivo) |
| Negativa | "Non ho ___ amici a Roma." | ∅ / sin partitivo (OMITIR) |

Fija la asimetría afirmativa↔negativa: el partitivo se usa en afirmativa, desaparece en negativa.

**Matiz pedagógico CLAVE (para las explanations, D-02):** para un hispanohablante la omisión en negativa es INTUITIVA (= español "no compro pan", "no tengo amigos" — el español tampoco pone artículo ahí). Lo realmente ajeno es lo CONTRARIO: USAR el partitivo en AFIRMATIVA donde el español no pone nada ("compro pan" → "compro del pane"). El temario debe señalar que la dificultad real de este bloque está en la AFIRMATIVA (recordar poner el partitivo), no en la negativa (omitirlo, que sale solo). Las explanations deben insistir ahí, no en lo obvio.

---

## Distinción partitivo vs preposición (PART-05)

Ejercicios de clasificación de función (multiple-choice meta-lingüístico, D-05): dada una frase con `del/della/...`, el autor elige si la forma es **partitivo ("algo de")** o **preposición ("de el/de la")**. La misma forma, distinta función. Ataca de frente la confusión; grading por índice sobre `["partitivo", "preposición"]` (una sola respuesta correcta).

| Frase | Función | Por qué |
|-------|---------|---------|
| "Ho mangiato del pane." | partitivo | "del pane" = "algo de pan" (cantidad indeterminada de un incontable) |
| "Il sapore del caffè è forte." | preposición | "del caffè" = "del café" (`di` + `il` posesivo/relacional: el sabor DE EL café) |
| "Ho comprato delle mele." | partitivo | "delle mele" = "unas manzanas" (cantidad indeterminada de un contable) |
| "La casa del nonno è grande." | preposición | "del nonno" = "del abuelo" (relación de pertenencia: la casa DE EL abuelo) |
| "Bevo dell'acqua." | partitivo | "dell'acqua" = "algo de agua" |
| "Il colore dell'erba." | preposición | "dell'erba" = "de la hierba" (relación) |

**Restricción locked (D-06):** estos ejercicios usan SOLO formas `di`-based (`del/dello/della/dell'/dei/degli/delle`) — son las ÚNICAS que solapan en forma con la preposizione articolata y por tanto las únicas donde la ambigüedad existe. Las contracciones con otras preposiciones (`nel`, `sul`, `al`, `dal`, `col`...) NUNCA son partitivo y quedan FUERA de este bloque.

**La función prepositiva vive en Preposiciones, NO aquí (D-06 / ROADMAP criterio 3):** la categoría `preposiciones` (`content/exercises/preposiciones.json`) ya enseña la preposizione articolata `del/della` en su función prepositiva. Estos ejercicios de Partitivos NO re-enseñan la preposición: solo CLASIFICAN/CONTRASTAN para que el autor distinga las dos funciones de una forma idéntica. La explanation debe dejar claro que el uso prepositivo se estudia en Preposiciones, y que aquí solo se contrasta. `categoryIds: ["partitivos"]` (sin bridge a Preposiciones — D-06/D-14).

---

## Fuera de alcance (A2 / fuera de v1.2)

Por D-03 / D-deferred y REQUIREMENTS.md §Out of Scope, NO son celdas obligatorias del temario v1.2:

- Formas raras/literarias del partitivo: `degli dei` (partitivo del plural irregular y literario `gli dei`), usos literarios. A2.
- Disparadores variables/discutibles heredados de Articoli (`dello pneumatico` vs `del pneumatico`, `dello yogurt` vs `dello iogurt`). A2.
- La **función prepositiva** de `del/della/...` en sí misma — vive en la categoría Preposiciones (`content/exercises/preposiciones.json`), NO se duplica aquí (PART-05 solo clasifica/contrasta, no re-enseña).

Se añaden como trampas avanzadas en una fase A2 posterior solo si emerge dolor real en uso.

---

## Conteo derivado (orientativo — el conteo final lo fijan los planes 12-02/12-03)

| Bloque | Celdas obligatorias | Ejercicios estimados (con varios contextos) |
|--------|---------------------|---------------------------------------------|
| Incontable del-formas (`del/dello/della/dell'`) | del + dello + della + dell' (x disparador) | ~8-10 |
| Contable del-formas (`dei/degli/delle`) | dei + degli(s+cons/vocal) + delle | ~6-8 |
| Alternativas por restricción (`qualche/un po' di/alcuni/alcune`) | qualche(sing) + un po' di(incontable) + alcuni + alcune | ~6-8 |
| Omisión afirmativa↔negativa (`∅`) | afirmativa-usar + negativa-omitir | ~3-4 |
| Distinción partitivo/preposición (PART-05) | partitivo-vs-preposición (formas di-based) | ~5-6 |
| Match sustantivo↔forma partitiva (D-08) | pane→del, zucchero→dello, acqua→dell', studenti→degli, mele→delle, libri→dei | ~2 |

**Total orientativo: ~30-40 ejercicios** (D-09). El temario es la única fuente del conteo (D-13): cada celda de arriba >=1 ejercicio, los disparadores frecuentes con varios contextos léxicos. SIN fila de Bridges multi-categoría — Partitivos NO lleva bridges en v1.2 (D-14; a diferencia de Articoli, que sí tenía una fila de bridges en su tabla de conteo). PART-X1 (bridges Partitivos↔género-número/sustantivos) está diferido a v1.3+.
