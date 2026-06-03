# Phase 17 Plan 03 — Set propuesto de variantes NUEVAS (Task 1)

**Generado:** 2026-06-03
**Estado:** PROPUESTO — pendiente de revisión del autor (checkpoint:human-verify) ANTES del quórum cross-vendor (Task 2).
**Alcance:** Conservador (D-17-06). Solo se autoran variantes nuevas en slots cuya regla admite reformulación natural; las excepciones idiomáticas únicas quedan slot-de-1; los slots ya fusionados (con su tope natural alcanzado) NO se inflan.

> IMPORTANTE: estas variantes AÚN NO están validadas. Cada una se materializa como ejercicio multiple-choice legacy AISLADO (id temporal con `payload:{prompt,options,correctIndex,explanation}`) y pasa el quórum cross-vendor (Gemini + DeepSeek + Opus + Sonnet, 4× "correcta", cero "incorrecta") ANTES de moverse al `variants[]` del slot destino. La `explanation` de cada bloque abajo es la explanation DEL SLOT (no por variante, D-15-02); en el id temporal de validación se usa la misma para que el VALIDATION-PROMPT vea el shape legacy que espera (Pitfall 2 / A2). Al integrarse, la superficie nueva entra a `variants[]` SIN explanation propia.

---

## Resumen del conteo

| Categoría | Slots | Variantes nuevas propuestas |
|-----------|-------|------------------------------|
| Slots semplici que admiten reformulación (+1v c/u) | 11 | 11 |
| Slots articolate que admiten reformulación (+1v c/u) | 25 | 25 |
| Slot locativo nuevo S-LOC-IN (in spiaggia/montagna/campagna) | 1 (nuevo) | 3 |
| Slot locativo nuevo S-AL-MARE (al mare) | 1 (nuevo) | 1 |
| **TOTAL VARIANTES NUEVAS PROPUESTAS** | | **40** |

**Slots EXCLUIDOS del alcance (sin variante nueva):**

| Slot | Motivo |
|------|--------|
| `preposiciones-a-casa` | Excepción idiomática única (`vado a casa`) → slot-de-1 (D-17-06). |
| `preposiciones-da-encasade` | Excepción idiomática única (`da te` = "a/en casa de") → slot-de-1 (D-17-06). |
| `preposiciones-di-posesso` | Ya fusionado (2v: Marco / Maria). Tope natural alcanzado; no inflar. |
| `preposiciones-al` | Ya fusionado (2v: cinema / telefono). Tope natural alcanzado; no inflar. |
| `preposiciones-sul` | Ya fusionado (3v: tavolo×2 / banco). Tope natural alcanzado; no inflar. |
| `preposiciones-tra-futuro` | Ya fusionado (2v: tra due giorni / fra tre giorni). Tope natural alcanzado; no inflar. |

Conteo final de slots tras integrar (driver de 17-04): 47 slots actuales + 2 locativos nuevos = **49 slots**. Variantes nuevas que pasan quórum: **40**.

---

## Bloque A — Slots SEMPLICI (reformulación natural, +1 variante)

### NV-01 → slot destino `preposiciones-di-origen`
- **id temporal:** `nv-di-origen`
- **Regla:** `di` = origen estable / identidad permanente.
- **prompt:** `Paolo è ___ Napoli di nascita.`
- **options:** `["di", "a", "da", "in"]`
- **correctIndex:** `0` (di)
- **explanation (slot):** *(se mantiene la del slot existente)* "La preposición Di indica origen estable: de dónde es alguien por nacimiento o identidad permanente. La locución fija 'di nascita' (de nacimiento) refuerza que se trata del origen y no de la ubicación actual. Distinta de Da, que marca el punto de partida de un movimiento concreto, y de A, que indicaría ubicación actual."
- **Justificación:** la regla admite otra persona + otra ciudad de nacimiento (Maria/Roma → Paolo/Napoli). El ancla "di nascita" desambigua R7 (descarta `a` ubicación, `da` movimiento).

### NV-02 → slot destino `preposiciones-da-provenienza`
- **id temporal:** `nv-da-provenienza`
- **Regla:** `da` = punto de partida de un movimiento concreto.
- **prompt:** `Arrivo a Napoli ___ Firenze stasera.`
- **options:** `["di", "a", "da", "in"]`
- **correctIndex:** `2` (da)
- **explanation (slot):** se mantiene la del slot existente (da = procedencia del movimiento; destino ya marcado con `a`).
- **Justificación:** mismo patrón que el existente (destino explícito con `a` + adverbio temporal "stasera" ancla el viaje concreto → solo `da` cuadra para el origen). El destino "a Napoli" ya ocupa la lectura de destino, eliminando la doble-validez R7.

### NV-03 → slot destino `preposiciones-in-paese`
- **id temporal:** `nv-in-paese`
- **Regla:** `in` con paesi/regioni.
- **prompt:** `Vivo ___ Francia da tre anni.`
- **options:** `["a", "in", "da", "su"]`
- **correctIndex:** `1` (in)
- **explanation (slot):** se mantiene (paesi/regioni → In; contrasta con ciudades → A).
- **Justificación:** otro país (Italia → Francia). Verbo `vivere` + país exige `in` inequívoco; "da tre anni" no introduce ambigüedad de preposición en el hueco.

### NV-04 → slot destino `preposiciones-con-compagnia`
- **id temporal:** `nv-con-compagnia`
- **Regla:** `con` = compagnia.
- **prompt:** `Vado al cinema ___ mia sorella.`
- **options:** `["di", "per", "con", "tra"]`
- **correctIndex:** `2` (con)
- **explanation (slot):** se mantiene (con = compagnia, transparente para el hispanohablante).
- **Justificación:** otra compañía (gli amici → mia sorella). "con mia sorella" = compañía, sin lectura instrumental alternativa.

### NV-05 → slot destino `preposiciones-per-scopo`
- **id temporal:** `nv-per-scopo`
- **Regla:** `per` = scopo/finalidad + infinitivo.
- **prompt:** `Lavoro ___ guadagnare bene.`
- **options:** `["di", "a", "per", "con"]`
- **correctIndex:** `2` (per)
- **explanation (slot):** se mantiene (per + infinitivo = finalidad, igual que español 'para + infinitivo').
- **Justificación:** otro objetivo + infinitivo (imparare l'italiano → guadagnare bene). `per` + infinitivo de finalidad es inequívoco.

### NV-06 → slot destino `preposiciones-per-durata`
- **id temporal:** `nv-per-durata`
- **Regla:** `per` = durata (periodo cuantificado en pasado cerrado).
- **prompt:** `Ieri ho dormito ___ otto ore. (en español: 'Ayer dormí durante ocho horas')`
- **options:** `["a", "per", "in", "da"]`
- **correctIndex:** `1` (per)
- **explanation (slot):** se mantiene (per = durata; 'ieri' ancla el pasado cerrado y descarta 'da' = desde hace).
- **Justificación:** otra duración cuantificada (per due ore → per otto ore). El adverbio "ieri" + gloss español "durante" ancla el periodo cerrado y descarta `da` (desde hace, hasta el presente). Gloss incluido para desambiguar R7.

### NV-07 → slot destino `preposiciones-a-ciudad`
- **id temporal:** `nv-a-ciudad`
- **Regla:** `a` = direzione con nombre de ciudad.
- **prompt:** `Quest'inverno vado ___ Milano per lavoro.`
- **options:** `["in", "a", "da", "per"]`
- **correctIndex:** `1` (a)
- **explanation (slot):** se mantiene (ciudades → A; contraste con paesi → In).
- **Justificación:** otra ciudad (Roma → Milano). Verbo `andare` + ciudad como destino exige `a`. El segundo `per lavoro` (finalidad) no compite con el hueco. Cuidado R7: con `andare` la ciudad solo admite `a` (destino), no hay lectura de origen.

### NV-08 → slot destino `preposiciones-a-hora`
- **id temporal:** `nv-a-hora`
- **Regla:** `a` = tempo (hora concreta del día).
- **prompt:** `Ceniamo ___ mezzanotte.`
- **options:** `["in", "per", "a", "tra"]`
- **correctIndex:** `2` (a)
- **explanation (slot):** se mantiene (A fija la hora: a mezzogiorno, a mezzanotte, alle otto; igual que español 'a las').
- **Justificación:** otra hora (a mezzogiorno → a mezzanotte). `a` para fijar la hora es inequívoco; `tra mezzanotte` no es italiano natural ("dentro de medianoche" no tiene sentido), `in/per` descartados.

### NV-09 → slot destino `preposiciones-da-agente`
- **id temporal:** `nv-da-agente`
- **Regla:** `da` = agente en frase pasiva.
- **prompt:** `La cena è preparata ___ lei. (en español: 'La cena está preparada por ella')`
- **options:** `["da", "di", "per", "con"]`
- **correctIndex:** `0` (da)
- **explanation (slot):** se mantiene (Da = agente en pasiva; 'por ella' = quien ejecuta, descarta 'per lei' = 'para ella' destinatario).
- **Justificación:** otra frase pasiva (è scritto da lui → è preparata da lei). El gloss español "por ella" fija la lectura de agente y descarta `per` (= "para ella", destinatario). Gloss incluido para desambiguar R7 agente vs destinatario.

### NV-10 → slot destino `preposiciones-in-trasporto`
- **id temporal:** `nv-in-trasporto`
- **Regla:** `in` = mezzo di trasporto cerrado, sin artículo.
- **prompt:** `Vado a scuola ___ treno.`
- **options:** `["con", "a", "in", "per"]`
- **correctIndex:** `2` (in)
- **explanation (slot):** se mantiene (medios cerrados → In sin artículo: in macchina, in treno, in autobus; a piedi usa A).
- **Justificación:** otro vehículo cerrado (in macchina → in treno). `in treno` es la forma idiomática fija; `con il treno` existiría con artículo pero aquí sin artículo solo `in` cuadra. Cuidado R7: sin artículo, `in` es la única natural (no "a treno" ni "con treno").

### NV-11 → slot destino `preposiciones-con-strumento`
- **id temporal:** `nv-con-strumento`
- **Regla:** `con` = mezzo/strumento (instrumental).
- **prompt:** `Taglio il pane ___ il coltello.`
- **options:** `["a", "con", "di", "per"]`
- **correctIndex:** `1` (con)
- **explanation (slot):** se mantiene (con = instrumento usado para la acción; mismo principio que español).
- **Justificación:** otro instrumento (la forchetta → il coltello). `con` instrumental inequívoco.

> **NOTA sobre `preposiciones-di-materia` y `preposiciones-su-argomento`:** ambos slots tienen riesgo ALTO de doble-validez R7 (di vs su para tema/materia: "libro di storia" / "libro su Roma"). Sus explanations existentes ya neutralizan la ambigüedad omitiendo la opción rival de las options. Para NO arriesgar una variante disputed en el quórum, en el alcance CONSERVADOR estos dos quedan SIN variante nueva en esta tanda (se autorarían más adelante con gloss español muy explícito si el autor lo pide). **Flag de ambigüedad declarado abajo.**

---

## Bloque B — Slots ARTICOLATE (reformulación con otro sustantivo del mismo artículo, +1 variante)

> Regla R5 aplicada a cada par artículo/noun: `il`/`i` consonante normal; `lo`/`gli` vocal, s+cons, z, gn, ps, x; `la`/`le` femenino. Cada variante elige un noun nuevo que cuadra con la celda de la forma.

### Familia DI (genitivo)

#### NV-12 → `preposiciones-del` (di+il)
- **id temporal:** `nv-del`
- **prompt:** `Il tetto ___ palazzo è rosso.`
- **options:** `["del", "al", "dal", "nel"]`
- **correctIndex:** `0` (del)
- **explanation (slot):** se mantiene (Di + Il = Del, masc sing regular; paralelo a 'del' español).
- **Justificación:** otro masc sing regular (cielo → palazzo). `il palazzo` → del palazzo.

#### NV-13 → `preposiciones-dello` (di+lo)
- **id temporal:** `nv-dello`
- **prompt:** `La fine ___ spettacolo è triste.`
- **options:** `["del", "dello", "della", "dei"]`
- **correctIndex:** `1` (dello)
- **explanation (slot):** se mantiene (s+cons/z/gn/ps/x → Lo → Dello).
- **Justificación:** otro s+cons (studente → spettacolo, `lo spettacolo` → dello spettacolo).

#### NV-14 → `preposiciones-della` (di+la)
- **id temporal:** `nv-della`
- **prompt:** `Il colore ___ macchina è rosso.`
- **options:** `["del", "dello", "della", "dalla"]`
- **correctIndex:** `2` (della)
- **explanation (slot):** se mantiene (Di + La = Della, fem sing; paralelo a 'de la').
- **Justificación:** otro fem sing (casa → macchina, `la macchina` → della macchina).

#### NV-15 → `preposiciones-dei` (di+i)
- **id temporal:** `nv-dei`
- **prompt:** `Le voci ___ ragazzi sono allegre.`
- **options:** `["dei", "degli", "delle", "del"]`
- **correctIndex:** `0` (dei)
- **explanation (slot):** se mantiene (masc plur regular → I → Dei).
- **Justificación:** otro masc plur regular (bambini → ragazzi, `i ragazzi` → dei ragazzi).

#### NV-16 → `preposiciones-degli` (di+gli)
- **id temporal:** `nv-degli`
- **prompt:** `Il rumore ___ aerei è forte.`
- **options:** `["dei", "degli", "delle", "dello"]`
- **correctIndex:** `1` (degli)
- **explanation (slot):** se mantiene (masc plur vocal/s+cons → Gli → Degli).
- **Justificación:** masc plur por vocal (studenti → aerei, `gli aerei` → degli aerei).

#### NV-17 → `preposiciones-delle` (di+le)
- **id temporal:** `nv-delle`
- **prompt:** `Le pagine ___ riviste sono colorate.`
- **options:** `["dei", "degli", "delle", "della"]`
- **correctIndex:** `2` (delle)
- **explanation (slot):** se mantiene (fem plur → Le → Delle).
- **Justificación:** otro fem plur (ragazze → riviste, `le riviste` → delle riviste).

### Familia A (dativo / dirección)

#### NV-18 → `preposiciones-allo` (a+lo)
- **id temporal:** `nv-allo`
- **prompt:** `Porto i bambini ___ zoo.`
- **options:** `["al", "allo", "alla", "agli"]`
- **correctIndex:** `1` (allo)
- **explanation (slot):** se mantiene (s+cons/z/gn/ps/x → Lo → Allo).
- **Justificación:** otro masc sing con z (stadio → zoo, `lo zoo` → allo zoo).

#### NV-19 → `preposiciones-alla` (a+la)
- **id temporal:** `nv-alla`
- **prompt:** `Andiamo ___ festa insieme.`
- **options:** `["al", "allo", "alla", "alle"]`
- **correctIndex:** `2` (alla)
- **explanation (slot):** se mantiene (A + La = Alla, fem sing).
- **Justificación:** otra fem sing (stazione → festa, `la festa` → alla festa).

#### NV-20 → `preposiciones-ai` (a+i)
- **id temporal:** `nv-ai`
- **prompt:** `Scrivo una mail ___ colleghi.`
- **options:** `["ai", "agli", "alle", "dei"]`
- **correctIndex:** `0` (ai)
- **explanation (slot):** se mantiene (masc plur regular → I → Ai; paralelo a Dei pero con A).
- **Justificación:** otro masc plur regular (bambini → colleghi, `i colleghi` → ai colleghi). Destinatario ("a los colegas") fija `ai` vs `dei`.

#### NV-21 → `preposiciones-agli` (a+gli)
- **id temporal:** `nv-agli`
- **prompt:** `Do da mangiare ___ uccelli.`
- **options:** `["ai", "agli", "alle", "allo"]`
- **correctIndex:** `1` (agli)
- **explanation (slot):** se mantiene (masc plur vocal/s+cons → Gli → Agli).
- **Justificación:** masc plur por vocal (studenti → uccelli, `gli uccelli` → agli uccelli).

#### NV-22 → `preposiciones-alle` (a+le)
- **id temporal:** `nv-alle`
- **prompt:** `Regalo dei fiori ___ mie cugine. (en español: 'Regalo flores a mis primas')`
- **options:** `["ai", "agli", "alle", "delle"]`
- **correctIndex:** `2` (alle)
- **explanation (slot):** se mantiene (fem plur → Le → Alle; 'a mis primas' destinatario, descarta 'delle' = posesión).
- **Justificación:** otra fem plur (amiche → cugine). Gloss "a mis primas" fija destinatario y descarta `delle` (posesión). Gloss incluido para desambiguar R7.

### Familia IN (locativo articulado)

#### NV-23 → `preposiciones-nel` (in+il)
- **id temporal:** `nv-nel`
- **prompt:** `Il latte è ___ frigorifero. (en español: 'La leche está dentro del frigorífico')`
- **options:** `["sul", "nel", "al", "dal"]`
- **correctIndex:** `1` (nel)
- **explanation (slot):** se mantiene (In + Il = Nel, interior; 'dentro' descarta 'sul' = encima).
- **Justificación:** otro masc sing, contexto "dentro de" (cassetto → frigorifero). Gloss "dentro del" fija interior y descarta `sul`. Gloss incluido para desambiguar R7.

#### NV-24 → `preposiciones-nello` (in+lo)
- **id temporal:** `nv-nello`
- **prompt:** `Le penne sono ___ astuccio.`
- **options:** `["nel", "nello", "nella", "negli"]`
- **correctIndex:** `1` (nello)
- **explanation (slot):** se mantiene (s+cons → Lo → Nello).
- **Justificación:** otro s+cons (zaino → astuccio, `lo astuccio`... cuidado: astuccio empieza por vocal → `lo` correcto, `nello astuccio`). El astuccio es contenedor → `in`.

> **REVISAR NV-24:** `astuccio` empieza por VOCAL, su artículo es `lo` (elidido `l'`) y la articolata In+lo = `nell'astuccio` (elisión), NO `nello astuccio`. Para evitar el problema de elisión, reformulo a un s+cons limpio: `studio`.

#### NV-24 (reformulado) → `preposiciones-nello` (in+lo)
- **id temporal:** `nv-nello`
- **prompt:** `Lavoro ___ studio del dentista.`
- **options:** `["nel", "nello", "nella", "negli"]`
- **correctIndex:** `1` (nello)
- **explanation (slot):** se mantiene (s+cons → Lo → Nello).
- **Justificación:** otro s+cons (zaino → studio, `lo studio` → nello studio, sin elisión). Lugar cerrado → `in`.

#### NV-25 → `preposiciones-nella` (in+la)
- **id temporal:** `nv-nella`
- **prompt:** `I bambini giocano ___ stanza.`
- **options:** `["nel", "nella", "alla", "dalla"]`
- **correctIndex:** `1` (nella)
- **explanation (slot):** se mantiene (In + La = Nella, fem sing con artículo).
- **Justificación:** otra fem sing (città → stanza, `la stanza` → nella stanza, interior).

#### NV-26 → `preposiciones-nei` (in+i)
- **id temporal:** `nv-nei`
- **prompt:** `I libri sono ___ cassetti.`
- **options:** `["nei", "negli", "nelle", "dei"]`
- **correctIndex:** `0` (nei)
- **explanation (slot):** se mantiene (In + I = Nei, masc plur regular, interior).
- **Justificación:** otro masc plur regular (giardini → cassetti, `i cassetti` → nei cassetti, interior).

#### NV-27 → `preposiciones-negli` (in+gli)
- **id temporal:** `nv-negli`
- **prompt:** `I documenti sono ___ uffici.`
- **options:** `["nei", "negli", "nelle", "sugli"]`
- **correctIndex:** `1` (negli)
- **explanation (slot):** se mantiene (masc plur vocal/s+cons → Gli → Negli; contenedor → In).
- **Justificación:** masc plur por vocal (astucci → uffici, `gli uffici` → negli uffici). El ufficio contiene los documentos → `in`, no `su`.

#### NV-28 → `preposiciones-nelle` (in+le)
- **id temporal:** `nv-nelle`
- **prompt:** `I biscotti sono ___ scatole.`
- **options:** `["nei", "negli", "nelle", "sulle"]`
- **correctIndex:** `2` (nelle)
- **explanation (slot):** se mantiene (In + Le = Nelle, fem plur; contenedor → In, no Su).
- **Justificación:** otra fem plur contenedor (cornici → scatole, `le scatole` → nelle scatole). La scatola contiene los biscotti → `in`, no `su`.

### Familia DA (origen articulado / "casa de")

#### NV-29 → `preposiciones-dal` (da+il)
- **id temporal:** `nv-dal`
- **prompt:** `Torno ___ mercato adesso.`
- **options:** `["dal", "dallo", "dalla", "dai"]`
- **correctIndex:** `0` (dal)
- **explanation (slot):** se mantiene (Da + Il = Dal, masc sing, origen del movimiento).
- **Justificación:** otro masc sing (lavoro → mercato, `il mercato` → dal mercato). "torno dal mercato" = vuelvo del mercado.

#### NV-30 → `preposiciones-dallo` (da+lo)
- **id temporal:** `nv-dallo`
- **prompt:** `Esco ___ stadio dopo la partita.`
- **options:** `["dal", "dallo", "dalla", "dai"]`
- **correctIndex:** `1` (dallo)
- **explanation (slot):** se mantiene (s+cons → Lo → Dallo).
- **Justificación:** otro s+cons (studio → stadio, `lo stadio` → dallo stadio).

#### NV-31 → `preposiciones-dalla` (da+la)
- **id temporal:** `nv-dalla`
- **prompt:** `Esco ___ banca alle cinque. (en español: 'Salgo del banco a las cinco')`
- **options:** `["dalla", "alla", "nella", "sulla"]`
- **correctIndex:** `0` (dalla)
- **explanation (slot):** se mantiene (Da + La = Dalla, fem sing, origen; 'del/desde' descarta 'alla' destino).
- **Justificación:** otra fem sing (stazione → banca). El verbo `uscire` + gloss "salgo del" fija origen y descarta `alla` (destino). Gloss incluido para desambiguar R7. (`la banca` = el banco/entidad, fem.)

#### NV-32 → `preposiciones-dai` (da+i)
- **id temporal:** `nv-dai`
- **prompt:** `Torno ___ nonni stasera.`
- **options:** `["dai", "dagli", "dalle", "degli"]`
- **correctIndex:** `0` (dai)
- **explanation (slot):** se mantiene (Da + I = Dai, masc plur regular consonante; con personas = 'a/de casa de').
- **Justificación:** otro masc plur regular CONSONANTE (cugini → nonni, `i nonni` → dai nonni; R5: nonni empieza por consonante → `i`, NO `gli`).

#### NV-33 → `preposiciones-dagli` (da+gli)
- **id temporal:** `nv-dagli`
- **prompt:** `Vengo ___ zii in campagna.`
- **options:** `["dai", "dagli", "dalle", "degli"]`
- **correctIndex:** `1` (dagli)
- **explanation (slot):** se mantiene (masc plur vocal/s+cons → Gli → Dagli).
- **Justificación:** masc plur con z (studenti → zii, `gli zii` → dagli zii; R5: z → `gli`). Con personas = de casa de.

#### NV-34 → `preposiciones-dalle` (da+le)
- **id temporal:** `nv-dalle`
- **prompt:** `Torno ___ nonne domani.`
- **options:** `["dai", "dagli", "dalle", "delle"]`
- **correctIndex:** `2` (dalle)
- **explanation (slot):** se mantiene (Da + Le = Dalle, fem plur; con personas = de casa de).
- **Justificación:** otra fem plur persona (zie → nonne, `le nonne` → dalle nonne).

### Familia SU (sobre articulado)

#### NV-35 → `preposiciones-sullo` (su+lo)
- **id temporal:** `nv-sullo`
- **prompt:** `Il quaderno è ___ scaffale in alto.`
- **options:** `["sul", "sullo", "sulla", "sui"]`
- **correctIndex:** `1` (sullo)
- **explanation (slot):** se mantiene (s+cons → Lo → Sullo).
- **Justificación:** otro s+cons (scaffale ya usado en el slot — uso otro: `lo scaffale` ya estaba; reformulo a `scatolone`? mejor mantengo `scaffale` con otro objeto encima).

> **REVISAR NV-35:** el slot existente `preposiciones-sullo` ya usa "Lo zucchero è sullo scaffale". Para que la variante sea NUEVA (no duplicar el noun de la celda), cambio el sustantivo s+cons a `specchio` no (espejo cuelga). Uso `straccio` (trapo) sobre el cual no se pone algo. Mejor: mantengo `scaffale` pero es duplicar celda. Reformulo a otro s+cons limpio: `sgabello` (taburete) — `lo sgabello`, su+lo = sullo.

#### NV-35 (reformulado) → `preposiciones-sullo` (su+lo)
- **id temporal:** `nv-sullo`
- **prompt:** `La giacca è ___ sgabello.`
- **options:** `["sul", "sullo", "sulla", "sui"]`
- **correctIndex:** `1` (sullo)
- **explanation (slot):** se mantiene (s+cons → Lo → Sullo).
- **Justificación:** otro s+cons (scaffale → sgabello, `lo sgabello` → sullo sgabello; sgabello empieza por sg = s+cons → `lo`). La chaqueta está encima del taburete → `su`.

#### NV-36 → `preposiciones-sulla` (su+la)
- **id temporal:** `nv-sulla`
- **prompt:** `Il libro è ___ scrivania.`
- **options:** `["sul", "sullo", "sulla", "alla"]`
- **correctIndex:** `2` (sulla)
- **explanation (slot):** se mantiene (Su + La = Sulla, fem sing superficie).
- **Justificación:** otra fem sing (sedia → scrivania, `la scrivania` → sulla scrivania). Contacto sobre superficie.

#### NV-37 → `preposiciones-sui` (su+i)
- **id temporal:** `nv-sui`
- **prompt:** `I piatti sono ___ tavoli.`
- **options:** `["sui", "sugli", "sulle", "nei"]`
- **correctIndex:** `0` (sui)
- **explanation (slot):** se mantiene (Su + I = Sui, masc plur regular superficie).
- **Justificación:** otro masc plur regular (muri → tavoli, `i tavoli` → sui tavoli; contacto sobre superficie horizontal).

#### NV-38 → `preposiciones-sugli` (su+gli)
- **id temporal:** `nv-sugli`
- **prompt:** `Le foto sono ___ scaffali.`
- **options:** `["sui", "sugli", "sulle", "negli"]`
- **correctIndex:** `1` (sugli)
- **explanation (slot):** se mantiene (masc plur vocal/s+cons → Gli → Sugli).
- **Justificación:** masc plur s+cons (alberi → scaffali, `gli scaffali` → sugli scaffali; sc = s+cons → `gli`). Las fotos apoyadas sobre las estanterías → `su`.

#### NV-39 → `preposiciones-sulle` (su+le)
- **id temporal:** `nv-sulle`
- **prompt:** `I bicchieri sono ___ mensole.`
- **options:** `["sui", "sugli", "sulle", "nelle"]`
- **correctIndex:** `2` (sulle)
- **explanation (slot):** se mantiene (Su + Le = Sulle, fem plur superficie).
- **Justificación:** otra fem plur (scrivanie → mensole, `le mensole` → sulle mensole; vasos sobre repisas → `su`).

---

## Bloque C — Slots locativos NUEVOS (PILOT-03, D-17-04)

### Slot S-LOC-IN — `in` locativo fijo SIN artículo (3 variantes nuevas)

- **id de slot destino:** `preposiciones-in-locativo`
- **type:** `multiple-choice`
- **categoryIds:** `["preposiciones"]`
- **explanation (slot, NUEVA):** "Con ciertos lugares geográficos abiertos el italiano usa In SIN artículo como locución fija para indicar dónde se está o adónde se va: in spiaggia, in montagna, in campagna, in città. Vado in spiaggia equivale a 'voy a la playa'. Cuidado: el hispanohablante calca 'a la playa' y se inclina por A, pero estos lugares piden In sin artículo. Excepción dentro del grupo: el mar usa Al (al mare), no In."

#### NV-40 → variante 1 del slot `preposiciones-in-locativo`
- **id temporal:** `nv-in-spiaggia`
- **prompt:** `D'estate andiamo ___ spiaggia ogni giorno.`
- **options:** `["a", "in", "su", "da"]`
- **correctIndex:** `1` (in)
- **Justificación:** `in spiaggia` es locución locativa fija sin artículo. El contexto "ogni giorno" no introduce otra preposición en el hueco. Cuidado R7: aunque "alla spiaggia" existe coloquialmente, la forma estándar A1 de la profesora y la regla fija enseñada es `in spiaggia`; las options NO incluyen una articolata `alla` para mantener una sola respuesta limpia (solo `a` simple, que es agramatical sin artículo aquí → "a spiaggia" no es italiano).

#### NV-41 → variante 2 del slot `preposiciones-in-locativo`
- **id temporal:** `nv-in-montagna`
- **prompt:** `Quest'inverno vado ___ montagna a sciare.`
- **options:** `["a", "in", "su", "da"]`
- **correctIndex:** `1` (in)
- **Justificación:** `in montagna` locución fija sin artículo. "a sciare" (finalidad) no compite con el hueco. `a montagna`/`su montagna` agramaticales.

#### NV-42 → variante 3 del slot `preposiciones-in-locativo`
- **id temporal:** `nv-in-campagna`
- **prompt:** `I nonni vivono ___ campagna.`
- **options:** `["a", "in", "su", "da"]`
- **correctIndex:** `1` (in)
- **Justificación:** `in campagna` locución fija sin artículo. `vivere in campagna` inequívoco; `a campagna`/`su campagna` agramaticales.

### Slot S-AL-MARE — `al mare` locativo fijo (slot-de-1, D-17-04/D-17-06)

- **id de slot destino:** `preposiciones-al-mare`
- **type:** `multiple-choice`
- **categoryIds:** `["preposiciones"]`
- **explanation (slot, NUEVA):** "Para el mar el italiano usa Al (a + il) como excepción dentro de los locativos geográficos: andare al mare = 'ir a la playa / al mar'. Contrasta con in spiaggia, in montagna, in campagna, que van con In sin artículo. El mar es el caso especial que rompe la serie In: se dice al mare, nunca 'in mare' (que significaría 'dentro del agua') ni 'a mare'."

#### NV-43 → variante única del slot `preposiciones-al-mare`
- **id temporal:** `nv-al-mare`
- **prompt:** `Quest'estate andiamo ___ mare in Sicilia.`
- **options:** `["a", "al", "in", "su"]`
- **correctIndex:** `1` (al)
- **Justificación:** `al mare` (a+il) es la forma locativa fija para ir a la costa, excepción frente a la serie `in`. El segundo `in Sicilia` (región) no compite con el hueco. Cuidado R7: `in mare` también es italiano pero significa "dentro del agua/en alta mar", lectura distinta; el contexto "andare al mare quest'estate + in Sicilia" (ir a la costa de vacaciones) fija inequívocamente `al`. **Flag de ambigüedad declarado abajo** (al mare vs in mare).

---

## Scan de acentos / ASCII (R1-R7 + canon editorial)

Aplicado a TODAS las superficies y explanations nuevas de este documento:

- **Smart-quotes (`U+2018 U+2019 U+201C U+201D`):** ninguna. Todos los apóstrofes en italiano (`D'estate`, `Quest'inverno`, `Quest'estate`, `l'italiano`) usan U+0027 ASCII recto.
- **Markdown en prompts/explanations:** ninguno (sin `*`, `_`, `#`, backticks dentro del contenido del ejercicio).
- **Refs `#NNN` / `mc-NNN` en explanations (R2):** ninguna.
- **Leak de regla/solución en prompt (R1):** ninguno. Ningún prompt contiene `(§N`, `(regla`, `(refuerzo`, `→` con transformación, ni meta-ayuda. Los glosses españoles `(en español: '...')` son contexto de desambiguación R7 (patrón ya usado en el JSON existente: `da-agente`, `per-durata`, `dalla`, etc.), NO leak de la preposición correcta.
- **Tildes RAE en explanations españolas:** correctas (preposición, está, artículo, según, número, geográficos, equivale, etc.).
- **Artículo/noun italiano (R5):** verificado celda por celda. Atención a las correcciones inline NV-24 (astuccio→studio por elisión vocal) y NV-35 (scaffale→sgabello por duplicado de celda); ambas reformuladas a s+cons limpios sin elisión.
- **Options con 3+ valores distintos:** todas las superficies multiple-choice tienen 4 options distintas.

---

## Flags de ambigüedad (riesgo R7) para revisión del autor

| Variante | Riesgo R7 | Mitigación aplicada |
|----------|-----------|---------------------|
| NV-43 (`al mare`) | `al mare` (ir a la costa) vs `in mare` (dentro del agua). Ambas italiano. | Contexto "andare quest'estate + in Sicilia" fija ir a la costa. Si el autor lo ve flojo, descartar o reforzar gloss "ir a la playa". |
| Slots `di-materia` / `su-argomento` | di vs su para tema/materia (libro di / libro su). | EXCLUIDOS de esta tanda conservadora (sin variante nueva). Se autorarían aparte con gloss muy explícito si el autor lo pide. |
| NV-40 (`in spiaggia`) | "alla spiaggia" existe coloquialmente. | Options sin articolata `alla`; solo `a` simple (agramatical sin artículo) como distractor. La forma fija enseñada es `in spiaggia`. |
| NV-07 (`a Milano`) / NV-02 (`da Firenze`) | essere/venire+ciudad doble-validez. | Verbos de MOVIMIENTO con destino: `andare a Milano` (destino, solo `a`); `arrivare a Napoli da Firenze` (destino ya marcado → hueco solo origen). Sin lectura rival. |

Total de variantes con flag para confirmación explícita del autor: **NV-43** (la única con doble-validez residual real); el resto están mitigadas o excluidas.

---

## Conteo reportado

- **40 variantes nuevas propuestas** que pasarán el quórum cross-vendor (Task 2):
  - 11 en slots semplici (NV-01..NV-11)
  - 25 en slots articolate (NV-12..NV-39, contando los reformulados NV-24 y NV-35 una sola vez cada uno)
  - 3 en el slot locativo nuevo `preposiciones-in-locativo` (NV-40..NV-42)
  - 1 en el slot locativo nuevo `preposiciones-al-mare` (NV-43)
- **2 slots nuevos** a crear en Task 2: `preposiciones-in-locativo` (3v) + `preposiciones-al-mare` (1v).
- **Conteo final de slots tras 17-03:** 47 + 2 = **49 slots** (driver del hardcode `expected` de 17-04).
- **6 slots excluidos** del alcance conservador (2 idiomáticos + 4 ya en su tope de fusión).
