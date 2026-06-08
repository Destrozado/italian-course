# Phase 27: Sostantivi irregolari a slots (contenido, léxica) - Context

**Gathered:** 2026-06-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir los **31 ejercicios de Sostantivi irregolari** (`content/exercises/sustantivos-irregulares.json`, categoryId **`sustantivos-irregulares`**, name "Sostantivi irregolari", order 5) del formato legacy `payload` al modelo **slot+variantes**, replicando el patrón LOCKED de Phases 22 (Avere) / 23 (Essere) / 24 (Verbi di movimento) / 25 (Genere e numero) / 26 (Professioni):

1. Reagrupar los ejercicios en slots, con `explanation` a nivel de slot.
2. Donde hay **regla-con-variantes** real, autorar **variantes nuevas** por quórum cross-vendor R1-R7 (4× correcta, 1-por-1).
3. Dejar la estructura final verde en **validator + smoke paramétrico**, con los **counts re-sincronizados** al nº real de slots.

**Tercera y ÚLTIMA categoría léxica del milestone** (genere-numero → Professioni → **Sostantivi irregolari**). **Última fase de v1.6 — cierra CONV-01 (las 9 categorías de gramática unificadas).** Cubre **SOST-01, SOST-02**.

**Resolución de la open question del roadmap ("regla-con-variantes O slots-de-1"):** el contenido demuestra que Sostantivi irregolari es **HÍBRIDA** (ver D-27-01). Hay 2 familias-regla reales (plurali sovrabbondanti `-o→-a`; invariabili) que admiten variantes intercambiables, más lemas de cambio de raíz que son léxica pura (slots con lemas memorizables, sin variantes forzadas).

**Composición legacy:** 31 ejercicios — **31 multiple-choice** (0 match, 0 word-buttons). Todos con `payload`, **0 con `variants`**. **SIN cruces multi-cat** (no hay ids `sustantivos-irregulares-3NN`; verificado). categoryId único `sustantivos-irregulares` → conversión simple: no hay ids legacy cross-cat estables que preservar, no hay re-base de snapshot D-88 (igual que Verbi di movimento Phase 24, Genere e numero Phase 25 y Professioni Phase 26). Todos `validation.status = validated`.

**Mapa léxico del contenido (insumo del REAGRUPACION-MAP):**
- **Plurali sovrabbondanti `-o` sing → `-a` plur fem (partes del cuerpo, regla rica):** uovo→uova (#002, inverso #030), braccio→braccia (#003, #006, inverso #029), dito→dita (#020), ginocchio→ginocchia (#021), labbro→labbra (#023), osso→ossa (#022). **Caso vecino con plural en `-e`:** orecchio→orecchie (#007) — discreción del mapa: micro-variante del bloque sovrabbondanti o anotación aparte.
- **Invariabili (plural = singular) — DIVIDIDA en dos sub-reglas (D-27-02):**
  - **Acentuadas / truncas (vocal tónica final):** città (#009), caffè (#010), università (#011).
  - **Extranjerismos / consonante final:** film (#012), sport (#013).
- **Cambio de raíz / lemas léxicos puros (1 slot, lemas = variantes — D-27-02):** uomo→uomini (#001, inverso #027, adjetivo #026 "giovani uomini"), dio→dei (#005, inverso #031), bue→buoi (#024), tempio→templi (#008 **==** #025, duplicado exacto).
- **Plurali regolari (parentesco — foils de contraste, NO irregulares):** donna→donne (#014, inverso #028), padre→padri (#015), madre→madri (#016), fratello→fratelli (#017), sorella→sorelle (#018), marito→mariti (#019). Caso casi-regular `-e→-i`: moglie→mogli (#004) — discreción del mapa (a este slot de contraste o aparte).

**Fuera de scope:** tocar motor/sampler/cascada/loader (shape ya bifurcado por validator+smoke desde v1.4); las otras conversiones (ya hechas Phases 22-26); añadir cruces multi-cat nuevos (no existen en el set legacy y crearlos sería capacidad nueva); re-trabajar Genere e numero / Articoli (ya convertidas, solapan); el bloque Canciones; los tiempos verbales futuros (TENSE-X1..X4, backlog); **forzar variantes artificiales** en el bloque léxico puro / lemas de cambio de raíz (SOST-01 lo prohíbe explícitamente).

</domain>

<decisions>
## Implementation Decisions

### Modelo de la categoría — HÍBRIDO (D-27-01) — resuelve la open question SOST-01
- **D-27-01:** Sostantivi irregolari se trata como **híbrida**, documentado por bloque:
  - **Bloque regla (sovrabbondanti `-o→-a` + invariabili):** rule-rich → slots **por sub-regla** CON autoría de variantes nuevas. Son reglas reales con variantes intercambiables, NO léxica pura.
  - **Bloque léxico puro (cambio de raíz: uomo/dio/bue/tempio):** 1 slot con los lemas como variantes existentes, **SIN variantes nuevas** — no se fuerzan variantes artificiales (SOST-01).
  - **Bloque de contraste (parentesco regular):** slot de plurales regulares como foils deliberados, **SIN engorde**.
  - La decisión "regla real O slots-de-1" queda **documentada explícitamente por bloque** (criterio SOST-01/SOST-02). SOST-02 se cumple así: hay autoría de variantes donde hay regla; se documenta que el bloque léxico/cambio-de-raíz NO la admite.

### Familias y granularidad — fina, 1 slot por sub-regla (D-27-02)
- **D-27-02:** Granularidad **fina** (hereda D-26-03/D-25-01): 1 slot por sub-regla; el examen elige 1 variante al azar dentro de cada slot → mata memorización por palabra sin mezclar reglas. Familias resultantes (rough; el mapa concreta el nº final):
  - **Sovrabbondanti `-o→-a` (cuerpo):** 1 slot (uovo/braccio/dito/ginocchio/labbro/osso + inversos asociados).
  - **Invariabili — DIVIDIDA en 2 slots:** (a) acentuadas/truncas (città/caffè/università); (b) extranjerismos/consonante final (film/sport). Son dos motivos distintos de invariabilidad y dos trampas A1 distintas.
  - **Cambio de raíz:** **1 slot** "plurale irregolare per cambio di radice" con los lemas (uomo, dio, bue, tempio) como **variantes** — comparten el meta-patrón "raíz impredecible, memorízalo", NO son variantes artificiales.
  - **Plurali regolari (contraste):** 1 slot con los parentesco regulares como foils.

### Ambición de variantes nuevas — generosa sin cuota, solo en el bloque regla (D-27-03)
- **D-27-03:** Ambición **generosa, sin cuota fija** (hereda D-26-04/D-25-04), SOLO en los slots de regla. El mapa concreta candidatas, el quórum valida 1-por-1 antes de entrar. Dónde se autora y dónde NO:
  - **SÍ — sovrabbondanti `-o→-a` (cuerpo):** familia rica y productiva; engordar con A1/A2 plausibles (p.ej. ciglio→ciglia, sopracciglio→sopracciglia, paio→paia…). Trampa fuerte del hispanohablante (cambio de género masc sing → fem plur).
  - **SÍ — invariabili (acentuadas + extranjeras):** más acentuadas (virtù, tribù…) y más extranjeras/consonante (bar, computer…). Mata el calco `*cittadi`/`*films`.
  - **NO — slot cambio de raíz (lemas):** uomo/dio/bue/tempio son lemas fijos memorizables, NO admiten variantes intercambiables reales → se documenta que NO se fuerzan (cumple SOST-01). Se quedan con las superficies existentes (incl. inversos/adjetivo).
  - **NO — slot plurali regolari (contraste):** sin engorde (no es el propósito de la categoría).
- **D-27-04 (verificación de regla obligatoria, R-MEMORY `exercise_authoring_rules`):** cada palabra asignada a una sub-regla debe tomar realmente esa forma plural en italiano (verificar la forma plural real); no inventar plurales inexistentes ni declarar invariable una palabra que sí flexiona.

### Ítems límite del set — sin perder contenido (D-27-05) — boundary fijo = 31
- **D-27-05:**
  - **Parentesco regulares (donna/padre/madre/fratello/sorella/marito):** → **1 slot de contraste "plurali regolari"** (foils deliberados que el autor metió para contrastar con los irregulares). SIN engorde. Sin remitir a Genere e numero (D-27-06).
  - **Duplicado exacto #008 == #025 (tempio→templi, solo difieren distractoras):** → **merge al slot cambio de raíz como 2 variantes** del lema tempio (mismo answer, distractoras distintas = superficies distintas válidas). Conserva ambas superficies sin redundancia de slot. Se mantiene el boundary de 31 superficies base.
  - **Inversos plural→singular (#027 uomini→uomo, #028 donne→donna, #029 braccia→braccio, #030 uova→uovo, #031 dei→dio) y adjetivo (#026 giovani uomini):** → **variantes del slot de su lema/regla** (uomini→uomo y "giovani uomini" al slot cambio-de-raíz; braccia→braccio y uova→uovo al slot sovrabbondanti; donne→donna al slot regulares; dei→dio al slot cambio-de-raíz). Drillan la misma regla en reversa / acuerdo de adjetivo.

### Solapes con otras categorías — restricción de no-referencia (D-27-06)
- **D-27-06:** Los sub-bloques que pisan otras categorías ya convertidas **se quedan** (boundary fijo = 31) y su contenido usa género/número con normalidad, PERO las `explanation` **NO referencian la otra categoría** por id ni por prosa (cero "ver Genere e numero/Articoli", cero ids `genero-numero-`/`articoli-`). Restricción **análoga a D-26-05 / D-25-02 / D-24-07 / D-159**. Afecta sobre todo al **slot de plurali regolari** y a los sovrabbondanti (solapan con la regla de plural/género de Genere e numero): la regla se explica en sitio.

### Precedente LOCKED de Phases 22/23/24/25/26 (no se re-discute — aplica idéntico)
- **D-27-07 (shape, hereda D-26-07):** Sin `payload`; todo a `variants[]` shallow. `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`. (No hay match ni WB en este set — todos MC.) Apóstrofes ASCII U+0027; 0 smart-quotes; plain text sin markdown.
- **D-27-08 (ids, hereda D-26-08):** Ids **semánticos** `{categoria}-{regla}` (p.ej. `sustantivos-irregulares-sovrabbondanti`, `sustantivos-irregulares-invariabili-accentate`, `sustantivos-irregulares-invariabili-straniere`, `sustantivos-irregulares-cambio-radice`, `sustantivos-irregulares-plurali-regolari`…). **NO hay excepción cross-cat** (no existen `sustantivos-irregulares-300..305`) → todos los ids pueden ser semánticos.
- **D-27-09 (merge de explanations, hereda D-26-09/D-25-07/D-17-05):** Al fusionar, elegir la explanation **más completa** + injertar los matices únicos de las descartadas.
- **D-27-10 (validación heredada, hereda D-26-10):** Mover superficies intactas a `variants[]` NO requiere re-validar; los `validation.passes[]` (incl. resoluciones disputed con override del autor) se mueven verbatim. Solo las **variantes nuevas** pasan quórum.
- **D-27-11 (base de aprobación quórum, hereda D-26-11):** Pase canónico = **Claude Opus 4.8 + Sonnet 4.6** (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo, auto-fallback a deepseek-reasoner si Gemini agota cuota (429/503). El C5-leak sobre el gloss ES "(en español: …)" es **falso-positivo de política** (canon R7 del autor) — mantener.
- **D-27-12 (SIN snapshot D-88, hereda D-26-12):** El blindaje APPEND-ONLY es **avere-only** (único snapshot existente = `scripts/.avere-prefix-snapshot.json`). NO se corre snapshot/assert ni se replica la re-base D-88.
- **D-27-13 (sync de counts, hereda D-26-13):** El rewrite cambia el nº de slots → re-sincronizar los **3 hardcodes** + `TOTAL_EXPECTED` contra el nº REAL de slots leído del JSON (`data.exercises.length`), en el mismo o último plan. Estado actual: `sustantivos-irregulares = 31` en los 3 sitios; `TOTAL_EXPECTED = 209` (post-Phase 26). Delta de esta fase = `−31 + (nº real de slots de sustantivos-irregulares)`.

### Claude's Discretion
- La asignación exacta ejercicio→slot (cuántos slots resultan en total, ~? rough) se resuelve en `27-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de las guías D-27-01..06.
- Dónde cae **orecchio→orecchie** (#007, plural en `-e` no `-a`): micro-variante del slot sovrabbondanti o anotación aparte — el mapa decide.
- Dónde cae **moglie→mogli** (#004, casi-regular `-e→-i`): al slot de plurali regolari (contraste) o aparte — el mapa decide.
- Número y forma concretos de variantes nuevas en sovrabbondanti e invariabili (sujeto a quórum 1-por-1).
- Redacción concreta de prompts/options/explanations de variantes nuevas.
- Esquema concreto de ids semánticos por sub-regla/eje.
- El número final de slots — se fija en el mapa **antes** del rewrite para planear el sync de counts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Precedente de conversión (Phases 22/23/24/25/26 — patrón EXACTO a replicar)
- `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-CONTEXT.md` — precedente inmediato y MÁS análogo: la otra categoría léxica que resolvió la misma open question como **híbrida** (D-26-01). Esta fase hereda casi 1:1 D-26-01..13 → D-27-01..13.
- `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-REAGRUPACION-MAP.md` — plantilla del mapa old-id→slot. Copiar formato para `27-REAGRUPACION-MAP.md`.
- `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-VARIANTES-NUEVAS.md` — proceso de propuesta/quórum de variantes. Plantilla para `27-VARIANTES-NUEVAS.md`.
- `.planning/phases/26-professioni-a-slots-contenido-l-xica/26-VERIFICATION.md` — formato de checks finales y counts. Plantilla para `27-VERIFICATION.md`.
- `.planning/phases/25-genere-e-numero-a-slots-contenido/25-CONTEXT.md` — origen de D-25-01..11; relevante porque Genere e numero es la categoría vecina que solapa con plural/género (D-27-06).
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md` — metodología de reagrupación + workflow de tasks (mapa → rewrite → variantes → sync).

### Contenido
- `content/exercises/sustantivos-irregulares.json` — **fuente** a convertir (31 ejercicios, todos multiple-choice, ids 001-031; categoryId único `sustantivos-irregulares`, sin multi-cat; 31 con `payload`, 0 con `variants`; todos `validated`).
- `content/exercises/profesiones.json` + `content/exercises/genero-numero.json` + `content/exercises/essere.json` + `content/exercises/avere.json` — **shape target** ya convertido (slot+variantes; ejemplos de MC en el modelo nuevo).
- `content/exercises/genero-numero.json` — categoría **vecina ya convertida** cuyo tema (plural/género) solapa con Sostantivi irregolari; consultar para coherencia SIN remitir a ella en las explanations (D-27-06).
- `content/categories.json` — confirma el slug EXACTO del categoryId (`sustantivos-irregulares`, name "Sostantivi irregolari", order 5) — ya verificado.

### Validator / smoke / counts (3 hardcodes a sincronizar tras el rewrite)
- `scripts/validate-content-fixture.mjs` — validator de shape (`node scripts/validate-content-fixture.mjs sustantivos-irregulares content/exercises/sustantivos-irregulares.json`). (Confirmar el nombre exacto del script de validación en el plan; en Phase 26 se citó este path.)
- `tests/exercise-types.test.js:1269` — count hardcode en el set paramétrico (smoke). Actual: `{ file: 'content/exercises/sustantivos-irregulares.json', expected: 31 }`.
- `tests/fixtures/slot-variants-integration.test.js:171` — `{ slug: 'sustantivos-irregulares', expected: 31 }`. Actual: `31`.
- `scripts/run-validation-271.mjs:152` — count de sustantivos-irregulares (`expected: 31`) + `TOTAL_EXPECTED` (línea 156, actual `209`) (reporter VAL-04/06/08).
- **Snapshot:** confirmado avere-only (único `scripts/.avere-prefix-snapshot.json`) → NO se corre snapshot/assert (D-27-12).

### Reglas de autoría y validación
- `MEMORY.md` → `exercise_authoring_rules` (R1-R6/R7), `multi_vendor_quorum_validator`, `feedback_disputed_resolution`, `feedback_cross_vendor_catches_bugs`, `gloss_es_desambiguacion_canon`, `test_command_node_glob`.
- `scripts/validate-ai-pass.mjs` — validador de quórum multi-vendor (Gemini/DeepSeek, `--write`, auto-fallback 429).
- Skill `gsd-validate-exercise` — valida 1-por-1 con quórum Opus+Sonnet (C1-C5), NUNCA batched (VAL-03).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Validator + smoke paramétrico:** ya bifurcados por shape desde v1.4 (`Array.isArray(ex.variants)`) — funcionan tal cual con el shape slot+variantes; no hay que tocar motor/sampler/cascada/loader.
- **Plantillas de artefactos Phase 26:** `26-REAGRUPACION-MAP.md` / `26-VARIANTES-NUEVAS.md` / `26-VERIFICATION.md` son copiables 1:1 cambiando categoría (Professioni es la léxica más análoga).
- **Precedente de MC-only en slot+variantes:** Essere (Phase 23) era MC casi entero — referencia directa; este set es 100% MC (sin match ni WB → conversión más simple que Professioni/Verbi).
- **`scripts/validate-ai-pass.mjs`** + skill `gsd-validate-exercise`: quórum multi-vendor reutilizable para las variantes nuevas.

### Established Patterns
- **Slot+variantes:** `explanation` top-level + `variants[]` shallow; ids semánticos (aquí TODOS semánticos — sin cruces cross-cat). Ver D-27-07/08.
- **"Drillear lo difícil"** aquí = **1 slot por sub-regla** (D-27-02): el cambio de género en plural de los sovrabbondanti (`il braccio → le braccia`) y el contraste invariabili-acentuadas vs invariabili-extranjeras son las trampas A1 más fuertes del hispanohablante (tendencia a regularizar el plural / a flexionar lo invariable).
- **Híbrido regla+léxica (D-27-01):** mismo patrón que Professioni (D-26-01) — donde el contenido es regla se autoran variantes; donde es léxico/cambio-de-raíz NO se fuerzan. Cierre de la open question SOST-01/02.
- **Write-once-at-session-end + cascada inmediata al fallo** (motor existente, no se toca; sin cruces multi-cat → cascada D-54 solo afecta a `sustantivos-irregulares`).
- **Test runner:** `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — ver `test_command_node_glob`).

### Integration Points
- `content/exercises/sustantivos-irregulares.json` reescrito → lo leen validator, smoke, run-validation-271, y el loader de la app en boot.
- Counts: el rewrite cambia el nº de slots → 3 hardcodes + `TOTAL_EXPECTED` (209) deben sincronizarse (patrón AVE-01/ESS-01/GEN-01/PROF-01). Delta = `−31 + (nº real de slots)`.
- **Cierre de milestone:** con este rewrite verde, CONV-01 queda cerrado (9/9 categorías en slot+variantes) → fin de v1.6.

</code_context>

<specifics>
## Specific Ideas

- **Híbrido deliberado (D-27-01):** el roadmap menciona los plurales irregulares (bue→buoi, uovo→uova) como posible regla-con-variantes. El análisis del contenido afina: **uovo→uova SÍ es regla** (familia sovrabbondanti `-o→-a` con ≥6 miembros productivos), pero **bue→buoi NO** (lema único de cambio de raíz). Por eso híbrida y no rule-rich entera.
- **Sovrabbondanti como trampa A1 estrella:** `il braccio → le braccia`, `l'uovo → le uova` — masc singular que pasa a fem plural; el hispanohablante tiende a regularizar (`*bracci`, `*uovi`). Slot dedicado con engorde generoso lo aísla.
- **Invariabili dividida (D-27-02):** acentuadas (città/caffè/università — vocal tónica final bloquea la flexión) vs extranjeras/consonante (film/sport — palabra no italiana). Dos porqués distintos = dos slots = dos trampas drilladas por separado.
- **Cambio de raíz como léxica pura (D-27-01/03):** uomo/dio/bue/tempio NO se engordan — son lemas memorizables, no reglas con variantes intercambiables. Cumplimiento explícito de SOST-01 ("no toda celda tiene variantes intercambiables").
- **Parentesco regulares como foils (D-27-05):** donna/padre/madre/fratello/sorella/marito NO son irregulares; el autor los puso para contrastar. Se conservan como slot de contraste, sin engorde, sin remitir a Genere e numero (D-27-06).
- **Duplicado tempio (#008==#025):** misma superficie con distractoras distintas → 2 variantes del lema tempio en el slot cambio-de-raíz, no un slot duplicado.

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de la fase. Esta es la **última conversión** del milestone v1.6: con ella CONV-01 queda cerrado (9/9 categorías de gramática en slot+variantes). Añadir cruces multi-cat nuevos a Sostantivi irregolari sería capacidad nueva (out of scope — el set legacy no los tiene). El bloque Canciones (modo standalone) y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog, fuera del boundary v1.6.

</deferred>

---

*Phase: 27-sostantivi-irregolari-a-slots-contenido-l-xica*
*Context gathered: 2026-06-09*
