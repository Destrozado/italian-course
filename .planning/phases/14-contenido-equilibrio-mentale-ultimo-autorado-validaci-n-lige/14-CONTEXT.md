# Phase 14: Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 14 es una fase de CONTENIDO. La maquinaria (schema de canción, `validateSongs`, `loadSongs`, playthrough, cascada, resumen) ya existe de Phase 13. Aquí se autora la primera canción real, **"Equilibrio mentale — Ultimo"**, dentro del formato existente:

- Índice: una entrada en `content/songs.json` (`{id, title, phraseCount}`).
- Documento: `content/songs/equilibrio-mentale.json` (o slug equivalente) = `{id, title, phrases: [{id, prompt, answer[], distractors?, categoryIds?}]}`.
- `prompt` = línea(s) italiana(s); `answer[]` = tokens españoles de la traducción; dirección it→es (reversed word-buttons).

El trabajo: (1) limpiar el ruido no-lírico de la letra pegada, (2) segmentar en frases con sentido completo y catalogables, (3) curar la traducción española de cada frase, (4) enganchar categorías gramaticales (o dejar sin categoría), (5) validar en modo ligero autor-oráculo.

Cubre: CONT-01, CONT-02, CONT-03 (3 requisitos). NO se toca el engine, el schema-validator, ni la UI (eso fue Phase 13).
</domain>

<decisions>
## Implementation Decisions

### Segmentación en frases (CONT-01)
- **D-01:** Segmentar por **unidad de sentido completa**, fusionando líneas encabalgadas que gramaticalmente forman una sola idea. Ej.: "Mi sento come questa goccia appesa a una ringhiera / Che casca e si concede a quest'asfalto, questa sera" → una frase (o como mucho dos) que cierran sentido, no dos fragmentos a medias. Traducción más natural; frases más largas; menos frases en total.
- Limpiar TODO el ruido no-lírico de la letra pegada antes de segmentar: créditos de directo ("See Ultimo Live", "Get tickets as low as $76"), bloque "You might also like" + títulos de otras canciones ("Non sapere mai dove si va", "Buon viaggio", "Supereroi") y las atribuciones "Ultimo". Los marcadores de sección ([Strofa 1], [Ritornello], etc.) NO son frases.

### Repeticiones — estribillo / coda (CONT-01)
- **D-02:** **Colapsar a frases únicas** (~35 frases estimadas). El Ritornello, que aparece 2 veces, y la Coda, que repite "Allora insegnami tu a vivere" 7 veces, se incluyen UNA sola vez cada frase única.
- **D-03:** De las dos variantes textuales reales del Ritornello ("Che sto crollando dentro **ai** miei perché" 1ª vez vs "dentro **i** miei perché" 2ª vez), se elige **una sola** (Claude's discretion — preferir la 1ª aparición "dentro ai miei perché" salvo razón pedagógica). No se conservan ambas como frases separadas (decisión del autor: colapsar, no "únicas + variantes").

### Enganche de categorías (CONT-02, LINK-01/03)
- **D-04:** **Enganche limpio**: etiquetar una frase con una categoría SOLO cuando la frase ejercita esa regla de forma **no trivial y deliberada** (coherente con la DESIGN RULE del proyecto "no enganchar por similitud/aparición incidental"). NO etiquetar por palabras de paso (un artículo o preposición incidental no convierte la frase en ejercicio de articoli/preposiciones).
- **D-05:** Las frases cuya estructura NO tiene categoría existente en el sistema (p.ej. passato prossimo "ho sudato", "ha cambiato", "hai lasciato"; futuro "non realizzerò"; otras construcciones A2) quedan **sin categoría** (`categoryIds: []` o ausente) — alimentan deliberadamente el futuro proceso CATPROC. Es correcto y esperado que una porción de las frases queden sin categoría.
- Las 9 categorías disponibles para enganche (de `content/categories.json`): avere, essere, preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones, articoli, partitivos.

### Estilo de traducción + proceso (CONT-02, CONT-03)
- **D-06:** Traducción **natural/idiomática** en español — que suene bien aunque se aleje del literal ("parte de la gracia" de las canciones). El autor es **oráculo final del fraseo**. `answer[]` = los tokens de esa versión natural.
- **D-07:** **Distractoras = ninguna** para esta primera canción (coherente con CONTEXT 13 D-05 "por defecto sin distractoras"); el reto es el orden + recordar la traducción. Se puede reevaluar por frase si alguna lo pide, pero el default es sin señuelos.
- **D-08:** Proceso de autoría = patrón **D-85**: Claude propone la segmentación + traducción + enganche por **bloques**, el autor revisa cada bloque (checkpoint human-verify) antes de fijar. No es un volcado de una sola pasada.
- **D-09:** Validación **ligera autor-oráculo** (CONT-03, NO quórum estricto R1-R7): **1 pase de IA** que verifica (a) que la traducción española sea defendible respecto a la línea italiana y (b) que el enganche de categorías por frase sea correcto/limpio. El autor resuelve cualquier disputa (oráculo del fraseo artístico). Reutiliza la infra de pase IA existente (`scripts/validate-ai-pass.mjs`) si encaja, o un subagente Claude — decisión de plan-time; el invariante es "1 verificación IA + autor oráculo", NO el quórum cross-vendor de v1.1/v1.2.

### Claude's Discretion
- Slug del archivo (`equilibrio-mentale` recomendado) e ids de frase (`equilibrio-mentale-001…`).
- Qué variante exacta del ritornello se conserva (D-03).
- Tokenización española exacta de cada `answer[]` (puntuación/mayúsculas se ignoran en el grading; tokens = palabras).
- Preservar ortografía italiana en `prompt` (apóstrofes tipográficos/ASCII, acentos graves `è/più/perché`) tal como en la letra original; el español de `answer` sigue el canon RAE acentuado del proyecto.
- Entry en `songs.json` con `phraseCount` igual al número real de frases (lockstep con el documento).
- Número final de frases (estimado ~35, lo fija la segmentación real).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Alcance y formato
- `.planning/ROADMAP.md` §Phase 14 — goal + 3 success criteria + depends-on Phase 13
- `.planning/REQUIREMENTS.md` §v1.3 — CONT-01, CONT-02, CONT-03 (texto exacto) + Out of Scope (quórum estricto NO aplica)
- `.planning/phases/13-.../13-CONTEXT.md` — decisiones del bloque Canciones que este contenido alimenta (it→es, distractors opcional, validación ligera, frases sin categoría)

### Schema y maquinaria existente (Phase 13 — NO modificar, solo alimentar)
- `src/data/schema-validator.js` — `validateSongs` + `validateSongPhrasePayload`: reglas que el JSON debe pasar (id slug ASCII único, title no vacío, phrases ≥1, cada frase id único + prompt no vacío + answer array de ≥1 token no vacío, distractors? array, categoryIds? array de categorías conocidas — opcional/[] válido)
- `content/songs/mini-prueba.json` — ejemplo canónico del shape a replicar (3 frases, 2 con categoría real avere/preposiciones, 1 sin categoría)
- `content/songs.json` — índice (entrada `{id, title, phraseCount}`)
- `content/categories.json` — las 9 categorías válidas para `categoryIds`
- `src/data/content-loader.js` — `loadSongs` (cómo se cargan y validan al boot; NFC normalize)

### Infra editorial reutilizable (validación ligera)
- `scripts/validate-ai-pass.mjs` — pase IA multi-proveedor (auto-fallback 429) por si encaja para el pase ligero (CONT-03)
- Memoria persistente `feedback_disputed_resolution.md` — cómo resolver disputas (autor oráculo)

### Letra fuente
- La letra de "Equilibrio mentale (Home piano session) — Ultimo" está en el cuerpo del milestone v1.3 (`.planning/PROJECT.md` / la invocación de `/gsd-new-milestone`); incluye el ruido no-lírico a limpiar (D-01).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `validateSongs`/`validateSongPhrasePayload` — el JSON autorado debe pasarlos; usarlos como checklist de forma (fixture validator) durante la autoría.
- `mini-prueba.json` — plantilla exacta del shape.
- `scripts/validate-ai-pass.mjs` — candidato para el pase IA ligero (CONT-03), si se adapta al modo "1 pase + autor oráculo" (sin el quórum estricto).
- `tests/song-validator.test.js` — ya defiende las reglas de forma; añadir un sub-test que cargue equilibrio-mentale.json y verifique que parsea + valida (forma), análogo a los smoke paramétricos de categorías.

### Established Patterns
- **D-85** (Claude propone por bloques + autor revisa en checkpoint human-verify) — patrón de autoría de contenido ya usado en todas las categorías v1.0-v1.2.
- **Canon ortográfico** — español acentuado RAE en lo que sea español; italianismos/letra italiana preservan su ortografía (apóstrofes, acentos graves). La letra italiana vive en `prompt`.
- **Lockstep de conteo** — `phraseCount` en songs.json == nº real de frases en el documento (mismo rigor que `TOTAL_EXPECTED`/`expected` de las categorías).

### Integration Points
- Solo se añaden 2 archivos de contenido (`content/songs/equilibrio-mentale.json` + entrada en `content/songs.json`). Cero cambios en engine/validator/UI.
- El loader `loadSongs` ya recoge automáticamente cualquier canción del índice — la nueva canción aparece en el bloque Canciones sin más cableado.

</code_context>

<specifics>
## Specific Ideas

- La canción concreta es "Equilibrio mentale (Home piano session)" de Ultimo. Su letra tiene encabalgamiento fuerte (D-01) y repetición fuerte (D-02: ritornello ×2, coda "Allora insegnami tu a vivere" ×7).
- Pasajes que probablemente quedan **sin categoría** (D-05, alimentan CATPROC): passato prossimo ("ho sudato", "ha cambiato direzione", "hai lasciato il tuo profumo"), futuro ("non realizzerò"), reflexivos/pronominales ("mi sento", "si concede", "si chiude", "si sgretola"), comparativo "come".
- Pasajes con **enganche limpio** probable (D-04): preposiciones simples y articuladas ("a una ringhiera", "alla stazione", "dentro ai miei perché", "nel mare", "in cantina"), articoli ("il tuo profumo", "la tua mano", "le luci", "quei binari"), essere/avere donde la cópula/posesión es el foco.
- El autor valora la "gracia" de la traducción particular sobre la fidelidad literal (D-06).
</specifics>

<deferred>
## Deferred Ideas

- **CATPROC** (proceso que procesa frases sin categoría y propone categorías nuevas) — milestone futuro; Phase 14 solo PRODUCE frases sin categoría, no las procesa.
- **Más canciones** (MUSIC-X1) — el patrón de alta queda consolidado tras esta primera; añadir más es contenido posterior.
- **Distractoras curadas por frase** — fuera por defecto (D-07); solo si emerge necesidad.
- **Quórum cross-vendor estricto R1-R7** sobre traducciones de canciones — fuera por CONT-03 (validación ligera).

None pendientes de todos (no había todos para esta fase).

</deferred>

---

*Phase: 14-Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera*
*Context gathered: 2026-06-02*
