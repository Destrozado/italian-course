# 22-VARIANTES-NUEVAS.md — Avere: superficies nuevas propuestas (Task 1)

**Fase:** 22-avere-a-slots-contenido · **Plan:** 22-02 · **Task 1 (propuesta — AUN NO validada por quorum)**
**Patron replicado:** 19-02 / 20-02 (Articoli / Partitivi — engorde de celdas pobres + huecos de regla).
**Decisiones aplicadas:** D-19-05 (engorde conservador de celdas pobres, sin cuota rigida), D-19-06 (huecos de regla solo donde hay construccion A1 natural), D-17-07 (quorum >=4x correcta), D-19-09 (validation top-level en slots nuevos), R1-R7 (sin leak en prompt, options 3+ distintas, una sola respuesta valida).

---

## Resumen del set propuesto

**Total superficies nuevas propuestas: 14**

| Bloque | Superficies | Destino |
|--------|-------------|---------|
| A — Engorde celdas pobres de presente (ho/hai/ha/abbiamo/avete/hanno) | 6 | slots existentes `avere-ho/hai/ha/abbiamo/avete/hanno` (engorde a 2 variantes) |
| B — Idiomatismos de sensacion/estado con avere (sete/freddo/sonno) | 3 | slot existente `avere-sensazioni` (engorde a 5 variantes) |
| C — Estado idiomatico "avere ragione" (slot nuevo) | 1 | slot NUEVO `avere-ragione` |
| D — Passato prossimo con avere, otros verbos A1 (comprare/vedere/leggere/scrivere/sentire) | 4 | slot existente `avere-passato-prossimo` (engorde a 8 variantes) |

**Nota sobre `avere anni` (edad):** YA esta cubierto por el slot `avere-ha` (variante "Lui ha ventidue anni") con explanation rule-first "la edad se TIENE con avere, no se ES". NO se materializa un slot/variante nuevo de edad (seria duplicado del matiz ya presente). Conservador.

---

## Bloque A — Engorde de las 6 celdas pobres de presente indicativo (D-19-05)

Cada slot de presente por persona tiene hoy 1 variante. Se anade 1 variante nueva por slot que reformula la **MISMA persona/forma** con otro sujeto/contexto A1 natural y respuesta inequivoca. La nueva variante comparte la explanation del slot (no lleva explanation propia). Verificado R1 (el prompt no contiene la forma correcta) y R5 (4 options, valores distintos).

| id temporal | slot destino | persona/forma | prompt | options | correctIndex | justificacion |
|-------------|--------------|---------------|--------|---------|--------------|---------------|
| `tmp-avere-ho-2` | `avere-ho` | io / ho | `Io ___ due fratelli.` | `["ho","hai","ha","hanno"]` | 0 | io pide ho inequivocamente; posesion (hermanos), distinto del coche de la variante 1; ninguna otra forma encaja con io. |
| `tmp-avere-hai-2` | `avere-hai` | tu / hai | `Tu ___ un cane in casa?` | `["ho","hai","abbiamo","hanno"]` | 1 | tu pide hai; pregunta de posesion (perro), distinta de la hermana de la variante 1; respuesta unica. |
| `tmp-avere-ha-2` | `avere-ha` | lui/lei / ha | `Lei ___ un gatto nero.` | `["hai","ha","abbiamo","hanno"]` | 1 | lei (3a sing) pide ha; posesion (gato), evita el matiz edad de la variante 1 (D-19-05 explicito); respuesta unica. |
| `tmp-avere-abbiamo-2` | `avere-abbiamo` | noi / abbiamo | `Noi ___ una bella casa in centro.` | `["abbiamo","avete","hanno","ho"]` | 0 | noi pide abbiamo (raiz av- rota); posesion (casa), distinta de los amigos de la variante 1; respuesta unica. |
| `tmp-avere-avete-2` | `avere-avete` | voi / avete | `Voi ___ una macchina grande?` | `["abbiamo","avete","hanno","hai"]` | 1 | voi pide avete; pregunta de posesion (coche), distinta del tiempo/cafe de la variante 1; respuesta unica. |
| `tmp-avere-hanno-2` | `avere-hanno` | loro / hanno | `Loro ___ due bambini piccoli.` | `["abbiamo","avete","hanno","ha"]` | 2 | loro pide hanno (h muda reaparece, doble n); posesion (ninos), distinta de la casa al mare de la variante 1; respuesta unica. |

**Verificacion italiana A1:** las 6 frases son posesion estandar (avere = tener), naturales para A1, sin doble-validez (essere no encaja en posesion, las otras formas de avere no concuerdan con el sujeto explicito). No se repite el contexto de la variante existente en ningun slot.

---

## Bloque B — Idiomatismos de sensacion/estado con avere (slot existente `avere-sensazioni`, D-19-06)

El slot `avere-sensazioni` tiene hoy 2 variantes (fame, caldo). La regla "las sensaciones fisicas se expresan con avere, no essere" admite mas variantes intercambiables. Se anaden 3 sensaciones de la misma familia: **sete** (sed), **freddo** (frio), **sonno** (sueno). Comparten la explanation del slot (que ya lista hambre/sed/frio y el pitfall del calco con essere). El distractor `sono`/`e` (essere) refuerza el error tipico del hispanohablante sin volver ambigua la respuesta.

| id temporal | slot destino | sensacion | prompt | options | correctIndex | justificacion (R6: una sola modificacion = avere vs essere en sensacion) |
|-------------|--------------|-----------|--------|---------|--------------|---------------|
| `tmp-avere-sete` | `avere-sensazioni` | sete (sed) | `Dammi un bicchiere d'acqua: ___ sete.` | `["ho","sono","sei","e"]` | 0 | "avere sete" = tener sed, construccion A1 con avere; io pide ho; el distractor "sono" calca el error espanol "estoy sediento"; respuesta unica. Apostrofe ASCII en "d'acqua". |
| `tmp-avere-freddo` | `avere-sensazioni` | freddo (frio) | `Chiudi la porta, per favore: ___ freddo.` | `["sono","ho","e","siamo"]` | 1 | "avere freddo" = tener frio (sensacion termica), con avere; io pide ho; "sono freddo" calca el error (significa otra cosa); respuesta unica. Paralelo a la variante caldo existente. |
| `tmp-avere-sonno` | `avere-sensazioni` | sonno (sueno) | `Vado a letto presto perche ___ sonno.` | `["sono","ho","e","hai"]` | 1 | "avere sonno" = tener sueno, estado fisico con avere; io pide ho; "sono" calca el error; "perche" (causa) hace natural la frase A1; respuesta unica. |

**Verificacion italiana A1:** `ho sete` / `ho freddo` / `ho sonno` son las construcciones estandar A1; todas usan avere (no essere). Las tres son sensaciones/estados del cuerpo, misma familia que fame/caldo del slot. La explanation del slot ya las cubre conceptualmente (menciona hambre/sed/frio).

---

## Bloque C — Estado idiomatico "avere ragione" (slot NUEVO `avere-ragione`)

**"Avere ragione" (tener razon)** es un idiomatismo de avere que el hispanohablante calca correctamente desde "tener razon", pero que en italiano contrasta con el frecuente error de usar essere ("essere ragione" no existe; el alumno A1 a veces duda). NO es una sensacion fisica (no encaja con fame/sete/freddo del slot sensazioni), por eso se propone como **slot nuevo separado por familia** (estado/juicio, no sensacion corporal). Decision a confirmar por el autor: slot propio vs absorberlo en sensazioni.

| id temporal | slot (NUEVO) | prompt | options | correctIndex | explanation (rule-first, top-level del slot nuevo) |
|-------------|--------------|--------|---------|--------------|-----------------------------------------------------|
| `tmp-avere-ragione` | `avere-ragione` (nuevo) | `Hai visto? Alla fine tu ___ ragione!` | `["sei","hai","e","sono"]` | 1 | ver abajo |

**Explanation propuesta para el slot `avere-ragione`:**
> Para decir que alguien tiene razon, el italiano usa el verbo avere, no essere: "avere ragione" equivale al espanol "tener razon". La frase "Tu hai ragione" se traduce como "Tu tienes razon". Cuidado: el hispanohablante a veces duda y prueba con essere ("sei ragione"), pero esa construccion no existe en italiano; igual que las sensaciones fisicas, este estado se TIENE con avere. La forma "hai" es la segunda persona singular del presente de avere.

**Verificacion italiana A1:** `avere ragione` es construccion fija estandar; `tu hai ragione` correcto; `tu sei ragione` agramatical (distractor que refuerza la regla). Una sola respuesta valida (R7). categoryIds=["avere"]. Slot nuevo => llevara validation top-level (D-19-09).

---

## Bloque D — Passato prossimo con avere, otros verbos A1 (slot existente `avere-passato-prossimo`, D-19-06)

El slot `avere-passato-prossimo` tiene hoy 4 variantes (mangiare-transitivo, parlare-comunicacion, dormire-actividad, capire-cognitivo). La regla "estos verbos piden avere en el passato prossimo" admite mas variantes intercambiables. Se anaden 4 verbos transitivos A1 muy frecuentes, todos los cuales PIDEN avere (son transitivos directos, llevan complemento directo). Comparten la explanation del slot. El distractor essere refuerza el error de seleccion de auxiliar.

| id temporal | slot destino | verbo (participio) | prompt | options | correctIndex | justificacion (verbo PIDE avere) |
|-------------|--------------|--------------------|--------|---------|--------------|---------------|
| `tmp-avere-pp-comprare` | `avere-passato-prossimo` | comprare → comprato | `Ieri io ___ comprato un libro nuovo.` | `["sono","ho","abbiamo","hanno"]` | 1 | comprare es transitivo (compras qualcosa) => auxiliar avere; io pide ho; participio comprato invariable con avere. |
| `tmp-avere-pp-vedere` | `avere-passato-prossimo` | vedere → visto | `Tu ___ visto il nuovo film di Sorrentino?` | `["sei","hai","ha","avete"]` | 1 | vedere es transitivo (ves qualcosa) => avere; tu pide hai; participio irregular visto, invariable con avere. |
| `tmp-avere-pp-leggere` | `avere-passato-prossimo` | leggere → letto | `Noi ___ letto tutto il giornale stamattina.` | `["siamo","avete","abbiamo","hanno"]` | 2 | leggere es transitivo (lees qualcosa) => avere; noi pide abbiamo; participio irregular letto, invariable. |
| `tmp-avere-pp-scrivere` | `avere-passato-prossimo` | scrivere → scritto | `Loro ___ scritto una lettera ai nonni.` | `["sono","hanno","abbiamo","ha"]` | 1 | scrivere es transitivo (escribes qualcosa) => avere; loro pide hanno; participio irregular scritto, invariable. |

**Verificacion italiana A1:** comprare/vedere/leggere/scrivere son los cuatro transitivos directos mas frecuentes A1, todos con auxiliar avere en el passato prossimo (llevan complemento directo: un libro, il film, il giornale, una lettera). Participios verificados: comprato (regular), visto / letto / scritto (irregulares correctos). El sujeto explicito hace inequivoca la forma del auxiliar. Una sola respuesta valida.

**Sobre `sentire`:** descartado del set conservador. "Sentire" en passato prossimo con avere es correcto ("ho sentito la musica"), pero "sentirsi" (pronominal, esp. sensaciones "mi sono sentito male") pide essere, lo que puede inducir doble-lectura/confusion A1. Para no arriesgar doble-validez (R7), se prefiere los 4 transitivos directos limpios. Si el autor lo quiere, se redacta con contexto que fuerce el transitivo no-pronominal.

---

## Scan de acentos / ASCII (pre-quorum, MEMORY: DeepSeek estricto en acentos)

- **Apostrofes:** unico apostrofe en `tmp-avere-sete` ("d'acqua") es ASCII U+0027. Sin smart-quotes.
- **Smart-quotes:** ninguna superficie ni explanation usa comillas tipograficas U+2018/U+2019/U+201C/U+201D.
- **Markdown:** ningun prompt/explanation usa markdown markers (`*`, `_`, `#`, backticks) dentro del texto del ejercicio.
- **Tildes RAE en explanation espanola (slot `avere-ragione`):** "razon" se escribira con tilde correcta ("razón") en el JSON final; aqui en el .md se mantiene ASCII por consistencia del documento de propuesta. Las explanations italianas (sensaciones) ya existen en el slot y estan limpias.
- **Italiano:** `perche` llevara acento grave (`perché`) en el JSON final del prompt de sonno; `e` (es) llevara acento (`è`) en los distractores de options donde corresponda — se autoran con la grafia italiana correcta en el JSON.

**Nota de implementacion para Task 2:** en este documento de propuesta los acentos van en ASCII para legibilidad/diff; al materializar cada superficie en Task 2 se escribiran con la grafia correcta (italiano: `è`, `perché`; espanol: `razón`) y se re-verificara el scan de smart-quotes sobre el JSON.

---

## Conteo final determinable (driver de 22-03)

- Slots actuales tras 22-01: **19**
- Slots nuevos en 22-02: **+1** (`avere-ragione`, si el autor aprueba el bloque C como slot separado)
- **Conteo final proyectado: 20 slots** (si C entra como slot nuevo) o **19 slots** (si C se absorbe en `avere-sensazioni` o se descarta).
- Variantes nuevas totales: **14** (6 presente + 3 sensaciones + 1 ragione + 4 passato).
- Coste de quorum: 14 superficies x 4 pases (gemini+deepseek+opus+sonnet) = 56 invocaciones, 1-por-1, NUNCA batched.

> Set CONSERVADOR (D-19-05): no se inflan slots cuya regla no admite reformulacion (word-buttons, match, cruces multi-cat quedan intactos como slots-de-1). No se materializa edad (ya cubierta en avere-ha). `sentire` descartado por riesgo de doble-lectura pronominal. Huecos materializados solo donde la construccion A1 italiana es natural y verificada (avere no essere).
