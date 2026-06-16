# Phase 26: Professioni a slots (contenido, léxica) - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir los **51 ejercicios de Professioni** (`content/exercises/profesiones.json`, categoryId **`profesiones`**, name "Professioni", order 7) del formato legacy `payload` al modelo **slot+variantes**, replicando el patrón LOCKED de Phases 22 (Avere) / 23 (Essere) / 24 (Verbi di movimento) / 25 (Genere e numero):

1. Reagrupar los ejercicios en slots, con `explanation` a nivel de slot.
2. Donde hay **regla-con-variantes** real, autorar **variantes nuevas** por quórum cross-vendor R1-R7 (4× correcta, 1-por-1).
3. Dejar la estructura final verde en **validator + smoke paramétrico**, con los **counts re-sincronizados** al nº real de slots.

**Segunda categoría léxica del milestone** (genere-numero → **Professioni** → sostantivi irregolari). Cubre **PROF-01, PROF-02**.

**Resolución de la open question del roadmap ("regla-con-variantes O slots-de-1"):** el contenido demuestra que Professioni es **HÍBRIDA, no léxica pura** (ver D-26-01). El grueso es feminización masc→fem (regla rule-rich con sub-reglas intercambiables reales); una minoría es léxica pura (profesión↔lugar/herramienta/acción + comprensión).

**Composición legacy:** 51 ejercicios — **43 multiple-choice + 3 match + 5 word-buttons**. Todos con `payload`, **0 con `variants`**. **SIN cruces multi-cat** (no hay ids 3NN; verificado). categoryId único `profesiones` → conversión simple: no hay ids legacy cross-cat estables que preservar, no hay re-base de snapshot D-88 (igual que Verbi di movimento Phase 24 y Genere e numero Phase 25). **Tiene word-buttons** (5), como Verbi di movimento — precedente de WB en slot+variantes ya existe.

**Mapa léxico del contenido (insumo del REAGRUPACION-MAP):**
- **Feminización masc→fem (regla, 001-035):** `-o→-a` (cuoco→cuoca, poliziotto→poliziotta, chirurgo→chirurga, commesso→commessa, fotografo→fotografa, meccanico→meccanica, segretario→segretaria) · `-iere→-iera` (cameriere→cameriera, infermiere→infermiera, parrucchiere→parrucchiera, portiere→portiera) · `-tore→-trice` (attore→attrice, direttore→direttrice, programmatore→programmatrice, allenatore→allenatrice, pittore→pittrice, traduttore→traduttrice, ricercatore→ricercatrice) · `-e/-ore→-essa` (dottore→dottoressa, professore→professoressa, studente→studentessa) · **invariables** `-ista/-ante/otros` (dentista, pianista, farmacista, giornalista, tassista, cantante, insegnante, cliente, collega, pilota, manager → misma forma masc/fem; trampa "la dentista" NO *la dentistessa*).
- **Pares masc/fem MC (041-042)** y **identificación de invariable (043):** ligados a la feminización.
- **Artículo definido por sonido (036-038):** il/lo/l'/la + profesión (l'avvocato, lo studente, l'infermiera) — solapa con Articoli/Genere.
- **Léxica pura — match (200 lugar, 201 herramienta, 202 acción)** y **comprensión-MC (039 "usa bisturi→chirurgo", 040 "prepara piatti→cuoca")**: pista por significado, NO derivable por raíz.
- **Word-buttons (100-104):** essere + profesión ("io sono dottoressa", "noi siamo studenti") — solapa con Essere + feminización/plural.

**Fuera de scope:** tocar motor/sampler/cascada/loader (shape ya bifurcado por validator+smoke desde v1.4); las otras conversiones (Genere e numero ya hecha Phase 25; Sostantivi irregolari Phase 27); añadir cruces multi-cat nuevos (no existen en el set legacy y crearlos sería capacidad nueva); re-trabajar Articoli/Essere/Genere e numero (ya convertidas); el bloque Canciones; **forzar variantes artificiales** en el bloque léxico puro (PROF-01 lo prohíbe explícitamente).

</domain>

<decisions>
## Implementation Decisions

### Modelo de la categoría — HÍBRIDO (D-26-01) — resuelve la open question PROF-01
- **D-26-01:** Professioni se trata como **híbrida**, documentado por bloque:
  - **Bloque regla (feminización masc→fem):** rule-rich → slots **por sub-regla** CON autoría de variantes nuevas. Análogo a la familia femminile de Genere e numero (Phase 25): la "femenino por terminación" es una regla real con variantes intercambiables, NO léxica pura.
  - **Bloque léxico puro (match lugar/herramienta/acción + comprensión-MC 039-040):** slots reagrupados **SIN variantes nuevas** — no se fuerzan variantes artificiales (PROF-01). Solo reagrupar + `explanation` a nivel de slot.
  - La decisión "regla real O slots-de-1" queda **documentada explícitamente por bloque** (criterio PROF-01/PROF-02). PROF-02 se cumple así: hay autoría de variantes donde hay regla; se documenta que el bloque léxico NO la admite.

### Organización del bloque léxico puro — por eje semántico (D-26-02)
- **D-26-02:** Los 3 match → slots **por eje semántico**: profesión↔lugar (200), profesión↔herramienta (201), profesión↔acción (202). **Match preservado** — regla NO derivable por raíz (DESIGN RULE **D-04**, hereda D-25-03). Las comprensión-MC (039-040) → su propio slot léxico "inferir profesión por descripción". **Sin variantes nuevas** en todo este bloque. (Los que entrenan la misma regla reformulada PUEDEN ser variantes del mismo slot dentro de cada eje; el mapa lo decide — D-25-03 análogo.)

### Granularidad del bloque regla — 1 slot por sub-regla, granularidad fina (D-26-03)
- **D-26-03:** Feminización → **1 slot por sub-regla** (granularidad fina, hereda **D-25-01**): `-o→-a`, `-iere→-iera`, `-tore→-trice`, `-e/-ore→-essa`, **invariable** (`-ista/-ante`/otros). Razón: cada terminación es una trampa propia; mezclar `-tore→-trice` con `-e→-essa` difuminaría el contraste de sufijos que es justo la trampa A1. El examen elige 1 variante al azar dentro de cada sub-regla → mata memorización por palabra sin mezclar reglas. Predicción rough: ~5-7 slots de feminización + slots léxicos + slot(s) WB + slot artículo-por-sonido. **Los pares masc/fem (041-042) y la identificación de invariable (043)** se asignan al slot de feminización correspondiente (el mapa concreta).

### Ambición de variantes nuevas — generosa sin cuota (D-26-04)
- **D-26-04:** Ambición **generosa, sin cuota fija** (hereda **D-25-04/D-24-05**), SOLO en los slots de feminización (regla). El mapa concreta candidatas, el quórum valida 1-por-1 antes de entrar. Ejes prioritarios a engordar:
  1. **Contraste `-tore→-trice` vs `-e/-ore→-essa`:** cuándo cada sufijo (attore/scrittore/pittore→-trice vs dottore/professore/studente→-essa) — trampa de sufijo de feminización.
  2. **Invariables `-ista/-ante`:** más casos (artista, autista, regista, turista / cantante, comandante) → mata el calco "la dentistessa"/"la cantantessa". Trampa A1 fuerte del hispanohablante.
  3. **`-o→-a` regular** y **`-iere→-iera`:** variedad para que el examen no memorice por palabra.
  - **Verificación de regla obligatoria** (R-MEMORY `exercise_authoring_rules`): cada palabra asignada a una sub-regla debe tomar realmente esa forma femenina en italiano (verificar la forma fem real); no inventar feminizaciones inexistentes ni meter al bloque léxico variantes.
  - **Bloque léxico (D-26-02): NO se autora ninguna variante** — documentado como cumplimiento explícito de PROF-01 ("no toda celda tiene variantes intercambiables").

### Solapes con otras categorías — restricción de no-referencia (D-26-05)
- **D-26-05:** Los sub-bloques que pisan otras categorías ya convertidas **se quedan** (boundary fijo = 51) y su contenido usa artículo/essere/plural con normalidad, PERO las `explanation` **NO referencian la otra categoría** por id ni por prosa (cero "ver Articoli/Essere/Genere", cero ids `articoli-/essere-/genero-numero-`). Restricción **análoga a D-25-02 / D-24-07 / D-159**. Afecta a:
  - **Artículo-por-sonido (036-038):** no remitir a Articoli/Genere; la regla del artículo se explica en sitio.
  - **Word-buttons essere (100-104):** no remitir a Essere; el uso de essere predicativo se explica en sitio.
  - **Plurales en WB (studenti/professori):** no remitir a Genere e numero.

### Word-buttons — se conservan como slots WB (D-26-06)
- **D-26-06:** Los 5 word-buttons (100-104) **se conservan como ejercicios word-buttons** en su(s) slot(s) propio(s) (precedente Phase 24, que también tenía WB). Shape WB `{prompt, answer[], distractors[]}` movido a `variants[]` shallow, `explanation` a nivel de slot, agrupados por lo que entrenan (p.ej. "essere + profesión"). El mapa decide si es 1 slot WB único con los 5 como variantes o varios slots WB. Sin remitir a Essere (D-26-05).

### Precedente LOCKED de Phases 22/23/24/25 (no se re-discute — aplica idéntico)
- **D-26-07 (shape, hereda D-25-05):** Sin `payload`; todo a `variants[]` shallow. `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`; match = `{prompt, pairs[]}`; WB = `{prompt, answer[], distractors[]}`. Apóstrofes ASCII U+0027; 0 smart-quotes; plain text sin markdown.
- **D-26-08 (ids, hereda D-25-06):** Ids **semánticos** `{categoria}-{regla}` (p.ej. `profesiones-femminile-o-a`, `profesiones-femminile-iera`, `profesiones-femminile-trice`, `profesiones-femminile-essa`, `profesiones-invariabili`, `profesiones-luogo`, `profesiones-strumento`, `profesiones-azione`, `profesiones-comprensione`, `profesiones-articolo-suono`, `profesiones-essere-wb`…). **NO hay excepción cross-cat** (no existen `profesiones-300..305`) → todos los ids pueden ser semánticos.
- **D-26-09 (merge de explanations, hereda D-25-07/D-17-05):** Al fusionar, elegir la explanation **más completa** + injertar los matices únicos de las descartadas.
- **D-26-10 (validación heredada, hereda D-25-08):** Mover superficies intactas a `variants[]` NO requiere re-validar; los `validation.passes[]` (incl. resoluciones disputed con override del autor) se mueven verbatim. Solo las **variantes nuevas** pasan quórum.
- **D-26-11 (base de aprobación quórum, hereda D-25-09):** Pase canónico = **Claude Opus 4.8 + Sonnet 4.6** (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo, auto-fallback a deepseek-reasoner si Gemini agota cuota (429/503). El C5-leak sobre el gloss ES "(en español: …)" es **falso-positivo de política** (canon R7 del autor) — mantener.
- **D-26-12 (SIN snapshot D-88, hereda D-25-10):** El blindaje APPEND-ONLY es **avere-only** (único snapshot existente = `scripts/.avere-prefix-snapshot.json`; la ref a `profesiones` en `scripts/assert-multi-cat-cross.mjs:19` es solo un comentario de ejemplo de uso, no una aserción activa). NO se corre snapshot/assert ni se replica la re-base D-88.
- **D-26-13 (sync de counts, hereda D-25-11):** El rewrite cambia el nº de slots → re-sincronizar los **3 hardcodes** + `TOTAL_EXPECTED` contra el nº REAL de slots leído del JSON (`data.exercises.length`), en el mismo o último plan. Estado actual: `profesiones = 51` en los 3 sitios; `TOTAL_EXPECTED = 249` (post-Phase 25, con genero-numero ya en 12). Delta de esta fase = `−51 + (nº real de slots de profesiones)`.

### Claude's Discretion
- La asignación exacta ejercicio→slot (cuántos slots resultan en total, ~? rough) se resuelve en `26-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de las guías D-26-01..06.
- Placement exacto del slot artículo-por-sonido (036-038): slot propio "articolo + professione (per suono)", MC preservado, sin remitir a Articoli (D-26-05). El mapa decide si admite engorde o se deja como está.
- Si los 3 match léxicos se quedan como 3 slots-de-1 o cada uno agrupa reformulaciones de la misma regla como variantes (dentro de D-04/D-26-02 — sin variantes *nuevas*, solo reagrupar reformulaciones existentes si las hubiera).
- Si los 5 WB son 1 slot WB único o varios (D-26-06).
- El número final de slots — se fija en el mapa **antes** del rewrite para planear el sync de counts.
- Redacción concreta de prompts/options/explanations de variantes nuevas (sujeto a quórum).
- Esquema concreto de ids semánticos por sub-regla/eje.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Precedente de conversión (Phases 22/23/24/25 — patrón EXACTO a replicar)
- `.planning/phases/25-genere-e-numero-a-slots-contenido/25-CONTEXT.md` — precedente inmediato; misma estructura de decisiones (D-25-01..11) que esta fase hereda casi 1:1. La diferencia: aquí la open question SÍ se resuelve (híbrida) porque hay bloque léxico puro, mientras 25 era rule-rich entero.
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-CONTEXT.md` — precedente con **word-buttons** (igual que aquí); referencia para WB en slot+variantes (D-26-06).
- `.planning/phases/25-genere-e-numero-a-slots-contenido/25-REAGRUPACION-MAP.md` (si existe) / `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md` — formato del mapa old-id→slot. Plantilla para `26-REAGRUPACION-MAP.md`.
- `.planning/phases/25-genere-e-numero-a-slots-contenido/25-VARIANTES-NUEVAS.md` (si existe) / `.planning/phases/23-essere-a-slots-contenido/23-VARIANTES-NUEVAS.md` — proceso de propuesta/quórum de variantes. Plantilla para `26-VARIANTES-NUEVAS.md`.
- `.planning/phases/23-essere-a-slots-contenido/23-CONTEXT.md` — origen de la restricción de no-referencia a otra categoría (D-23 / D-159) que D-26-05 replica con Articoli/Essere/Genere.
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md` — metodología de reagrupación + workflow de tasks (mapa → rewrite → variantes → sync).
- `.planning/phases/25-genere-e-numero-a-slots-contenido/` (VERIFICATION si existe) / `.planning/phases/22-avere-a-slots-contenido/22-VERIFICATION.md` — formato de checks finales y counts. Plantilla para `26-VERIFICATION.md`.

### Contenido
- `content/exercises/profesiones.json` — **fuente** a convertir (51 ejercicios; 001-043 MC + 100-104 word-buttons + 200/201/202 match; categoryId único `profesiones`, sin multi-cat; 51 con `payload`, 0 con `variants`).
- `content/exercises/essere.json` + `content/exercises/avere.json` + `content/exercises/genero-numero.json` — **shape target** ya convertido (slot+variantes; ejemplos de MC, match y WB en el modelo nuevo).
- `content/exercises/articoli.json` + `content/exercises/genero-numero.json` — categorías **vecinas ya convertidas** cuyos temas (artículo por sonido, plural, género) solapan con sub-bloques de Professioni; consultar para coherencia SIN remitir a ellas en las explanations (D-26-05).
- `content/categories.json` — confirma el slug EXACTO del categoryId (`profesiones`, name "Professioni", order 7) — ya verificado.

### Validator / smoke / counts (3 hardcodes a sincronizar tras el rewrite)
- `scripts/validate-content-fixture.mjs` — validator de shape (`node scripts/validate-content-fixture.mjs profesiones content/exercises/profesiones.json`).
- `tests/exercise-types.test.js:1272` — count hardcode de profesiones en el set paramétrico (smoke). Actual: `expected: 51`.
- `tests/fixtures/slot-variants-integration.test.js:173` — `{ slug: 'profesiones', expected: 51 }`. Actual: `51`.
- `scripts/run-validation-271.mjs:140` — count de profesiones (`expected: 51`) + `TOTAL_EXPECTED` (línea 145, actual `249`) (reporter VAL-04/06/08).
- **Snapshot:** confirmado avere-only (único `scripts/.avere-prefix-snapshot.json`; la ref en `assert-multi-cat-cross.mjs:19` es comentario de uso) → NO se corre snapshot/assert (D-26-12).

### Reglas de autoría y validación
- `MEMORY.md` → `exercise_authoring_rules` (R1-R6/R7), `multi_vendor_quorum_validator`, `feedback_disputed_resolution`, `feedback_cross_vendor_catches_bugs`, `gloss_es_desambiguacion_canon`, `test_command_node_glob`.
- `scripts/validate-ai-pass.mjs` — validador de quórum multi-vendor (Gemini/DeepSeek, `--write`, auto-fallback 429).
- Skill `gsd-validate-exercise` — valida 1-por-1 con quórum Opus+Sonnet (C1-C5), NUNCA batched (VAL-03).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Validator + smoke paramétrico:** ya bifurcados por shape desde v1.4 (`Array.isArray(ex.variants)`) — funcionan tal cual con el shape slot+variantes; no hay que tocar motor/sampler/cascada/loader.
- **Plantillas de artefactos Phases 22/23/24/25:** REAGRUPACION-MAP / VARIANTES-NUEVAS / VERIFICATION son copiables 1:1 cambiando categoría.
- **Precedente de word-buttons en slot+variantes:** Verbi di movimento (Phase 24) — referencia directa para los 5 WB de profesiones (D-26-06).
- **Precedente de match en slot+variantes:** articoli/partitivos (Phases 18-20) + genero-numero (Phase 25) — referencia directa para los 3 match de profesiones (D-26-02).
- **`scripts/validate-ai-pass.mjs`** + skill `gsd-validate-exercise`: quórum multi-vendor reutilizable para las variantes nuevas.

### Established Patterns
- **Slot+variantes:** `explanation` top-level + `variants[]` shallow; ids semánticos (aquí TODOS semánticos — sin cruces cross-cat). Ver D-26-07/08.
- **"Drillear lo difícil"** aquí = **1 slot por sub-regla de feminización** (D-26-03): cada sufijo de feminización es una trampa propia; las invariables `-ista/-ante` y el contraste `-trice/-essa` son las trampas A1 más fuertes del hispanohablante.
- **Híbrido regla+léxica (D-26-01):** patrón nuevo de esta fase — donde el contenido es regla se autoran variantes; donde es léxico puro NO se fuerzan. Es el cierre de la open question PROF-01/02.
- **Write-once-at-session-end + cascada inmediata al fallo** (motor existente, no se toca; sin cruces multi-cat → cascada D-54 solo afecta a `profesiones`).
- **Test runner:** `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — ver `test_command_node_glob`).

### Integration Points
- `content/exercises/profesiones.json` reescrito → lo leen validator, smoke, run-validation-271, y el loader de la app en boot.
- Counts: el rewrite cambia el nº de slots → 3 hardcodes + `TOTAL_EXPECTED` (249) deben sincronizarse (patrón AVE-01/ESS-01/GEN-01). Delta = `−51 + (nº real de slots)`.

</code_context>

<specifics>
## Specific Ideas

- **Híbrido deliberado (D-26-01):** la "femenino de profesiones por terminación" que el roadmap menciona como ejemplo de regla-con-variantes ES real y rica (4 sufijos + invariable) → se modela como regla. Pero el match léxico (lugar/herramienta/acción) y la comprensión NO admiten variantes intercambiables → slots reagrupados sin variantes. No se fuerza nada (PROF-01).
- **Invariables `-ista/-ante` como trampa A1 estrella:** `la dentista` (NO *la dentistessa*), `la cantante` (NO *la cantantessa*) — el hispanohablante tiende a feminizar todo; un slot dedicado de invariables con engorde generoso lo aísla.
- **Contraste `-tore→-trice` vs `-ore/-e→-essa`:** attore→attrice vs dottore→dottoressa — saber qué sufijo toca es la trampa de feminización; slots separados lo drillean.
- **Match léxico preservado por D-04 (D-26-02):** profesión↔lugar/herramienta/acción NO es derivable por raíz → los 3 match siguen siendo match, no se convierten a multi-choice, y no se autoran variantes nuevas.
- **WB se conservan como WB (D-26-06):** precedente Phase 24; mezclan essere + profesión pero las explanation no remiten a Essere (D-26-05).

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de la fase. La conversión restante (Sostantivi irregolari Phase 27) ya está en el roadmap y cierra CONV-01; es ahí donde se resuelve la misma open question para los plurales irregulares. Los plurales irregulares puros (uomo/uomini, mano/mani, uovo/uova) pertenecen a Sostantivi irregolari (Phase 27) — no se tocan aquí. Añadir cruces multi-cat nuevos a Professioni sería capacidad nueva (out of scope — el set legacy no los tiene). El bloque Canciones y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog v1.6 boundary.

</deferred>

---

*Phase: 26-professioni-a-slots-contenido-l-xica*
*Context gathered: 2026-06-08*
