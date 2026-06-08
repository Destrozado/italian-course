# Phase 25: Genere e numero a slots (contenido) - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir los **40 ejercicios de Genere e numero** del formato legacy `payload` al modelo **slot+variantes**, replicando el patrón de Phases 22 (Avere) / 23 (Essere) / 24 (Verbi di movimento):

1. Reagrupar los ejercicios en slots **por regla**, con `explanation` a nivel de slot.
2. Autorar **variantes nuevas** por quórum cross-vendor R1-R7 (4× correcta, 1-por-1) donde la regla admite reformulación; huecos → slots nuevos.
3. Dejar la estructura final verde en **validator + smoke paramétrico**, con los **counts re-sincronizados** al nº real de slots.

**Primera de las 3 categorías de morfología/léxico** (Genere e numero → Professioni → Sostantivi irregolari). Cubre **GEN-01, GEN-02**.

**Contenido legacy:** 40 ejercicios — **37 multiple-choice + 3 match** (genero-numero-207/208/209). **SIN word-buttons**, **SIN cruces multi-cat 300-305**, **categoryId único `genero-numero`** → conversión simple: no hay ids legacy estables que preservar, no hay re-base de snapshot D-88 (igual que Verbi di movimento Phase 24).

**Naturaleza de la categoría (a diferencia de Professioni/Sostantivi irregolari):** Genere e numero NO es léxica pura — es **rule-rich** con tres familias de regla en paralelo, cada una con variantes intercambiables reales. La "open question regla-con-variantes O slots-de-1" del milestone NO aplica aquí (se decide en Phases 26/27): aquí HAY regla con variantes y el modelo slot+variantes aporta valor directo.

**Fuera de scope:** tocar motor/sampler/cascada/loader (shape ya bifurcado por validator+smoke desde v1.4); las otras conversiones (Professioni, Sostantivi irregolari); el bloque Canciones; añadir cruces multi-cat nuevos (no existen en el set legacy y crearlos sería capacidad nueva); re-trabajar la categoría Articoli (ya convertida Phases 18-20).

</domain>

<decisions>
## Implementation Decisions

### Eje organizador de slots — 1 slot por micro-regla (D-25-01)
- **D-25-01:** Reagrupar a **1 slot por micro-regla**, granularidad fina (NO agrupado por familia gruesa). Razón: en morfología la trampa está en la regla *concreta*, no en una familia abstracta — mezclar `-o→-i` con `-co→-chi` en un mismo slot difuminaría dos reglas con trampa distinta. Predicción rough ~10-13 slots. El examen elige 1 variante al azar **dentro de cada micro-regla** → mata la memorización por palabra sin mezclar reglas. (Divergencia consciente vs el "pocos slots por sub-regla" de Verbi di movimento D-24-02: allí la regla era una sola decisión essere-vs-avere; aquí son varias reglas paralelas que merecen drilling independiente.)
- **Micro-reglas identificadas** (el `25-REAGRUPACION-MAP.md` las concreta y nombra):
  - **PLURAL:** masc `-o→-i`, fem `-a→-e`, ambos `-e→-i`, sonido duro `-co/-go→-chi/-ghi` (con la trampa amico→amici que PIERDE el sonido), **invariables** (acentuados città/caffè/università + extranjerismos film → no cambian).
  - **GÉNERO masc→fem:** `-o→-a`, `-tore→-trice`, `-e/-ore→-essa`.
  - **ARTÍCULO definido por sonido:** ver D-25-02.
- **Duplicados literales son variantes del mismo micro-slot:** 001≡011 (ragazzo→ragazzi), 002≡012 (casa→case), 003≡030 (cuoco→cuochi), 004≡031 (albergo→alberghi), 005≡032 (amica→amiche), 008≡035 (caffè) → se colapsan a variantes, no slots duplicados.

### Sub-bloque artículos + restricción de no-referencia a Articoli (D-25-02)
- **D-25-02:** Los artículos definidos por sonido (009 `l'amico`, 010 `lo zaino` MC + los 3 match 207/208/209: il/lo/l'/i/gli/le) **se quedan** (boundary fijo = 40 ejercicios) agrupados en su(s) slot(s) propio(s), PERO las `explanation` **NO referencian la categoría/ejercicios Articoli por id ni por prosa** (cero "ver Articoli", cero ids `articoli-0XX`) — restricción **análoga a D-24-07/D-159** (Essere). Usar los artículos como contenido del ejercicio es válido e inevitable (el artículo concuerda con género/número); la restricción es no remitir al alumno a *otra categoría*.
- **D-25-03 (match preservado, D-04):** "Artículo definido por sonido" es regla **NO derivable por raíz** (lo/l'/gli dependen del sonido inicial, no de la terminación) → los 3 match (207/208/209) **PRESERVAN el tipo match** (DESIGN RULE D-04). El mapa decide si son 3 match slots-de-1 o se agrupan; los que entrenan la MISMA regla reformulada pueden ser variantes del mismo slot (criterio GEN-01).

### Variantes nuevas (D-85 + quórum) — los 4 ejes de huecos priorizados (D-25-04)
- **D-25-04:** Ambición **generosa, sin cuota fija** (hereda D-24-05). El autor marcó **los 4 ejes** de huecos a engordar (el mapa concreta candidatas, el quórum valida 1-por-1 antes de entrar):
  1. **Invariables (trampa fuerte):** más acentuados (virtù, caffè, città, università) + extranjerismos (film, sport, bar, computer) → mata el calco `città s`/`films`. Trampa A1 directa del hispanohablante.
  2. **Plural `-co/-go` sonido duro:** más casos de conservación/pérdida del sonido duro — amico→amici (¡pierde!), greco→greci, nemico→nemici vs parco→parchi, medico→medici, lago→laghi. La excepción es trampa real.
  3. **Género `-tore→-trice` vs `-e→-essa`:** engordar el contraste de sufijos de feminización (attore/scrittore/pittore/lavoratore vs dottore/professore/studente) — cuándo cada uno.
  4. **Plural base `-o/-a/-e`:** más variantes de las reglas regulares para dar variedad y que el examen no memorice por palabra.
  - **Verificación de regla obligatoria:** cada palabra asignada a una micro-regla debe tomar realmente esa forma (verificar artículo/plural real del sustantivo italiano, R-MEMORY exercise_authoring_rules); no inventar excepciones ni meter irregulares puros (uomo/uomini, mano/mani → son de la categoría Sostantivi irregolari, Phase 27, OUT of scope aquí).

### Precedente LOCKED de Phases 22/23/24 (no se re-discute — aplica idéntico)
- **D-25-05 (shape, hereda D-24-08/D-23-08):** Sin `payload`; todo a `variants[]` shallow. `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`; match = `{prompt, pairs[]}`. Apóstrofes ASCII U+0027; 0 smart-quotes; plain text sin markdown.
- **D-25-06 (ids, hereda D-24-09):** Ids **semánticos** `{categoria}-{regla}` (p.ej. `genero-numero-plurale-o-i`, `genero-numero-plurale-co-chi`, `genero-numero-invariabili`, `genero-numero-femminile-trice`, `genero-numero-femminile-essa`, `genero-numero-articolo-suono`…). **NO hay excepción cross-cat** (no existen genero-numero-300..305) → todos los ids pueden ser semánticos.
- **D-25-07 (merge de explanations, hereda D-24-10/D-17-05):** Al fusionar, elegir la explanation **más completa** + injertar los matices únicos de las descartadas.
- **D-25-08 (validación heredada, hereda D-24-11):** Mover superficies intactas a `variants[]` NO requiere re-validar; los `validation.passes[]` (incl. resoluciones disputed con override del autor) se mueven verbatim. Solo las **variantes nuevas** pasan quórum.
- **D-25-09 (base de aprobación quórum, hereda D-24-13):** Pase canónico = **Claude Opus 4.8 + Sonnet 4.6** (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo, auto-fallback a deepseek-reasoner si Gemini agota cuota (429/503). El C5-leak sobre el gloss ES "(en español: …)" es **falso-positivo de política** (canon R7 del autor) — mantener.
- **D-25-10 (SIN snapshot D-88, hereda D-24-14):** El blindaje APPEND-ONLY es **avere-only** (scripts sin refs a genero-numero, verificado). NO se corre snapshot/assert ni se replica la re-base D-88.
- **D-25-11 (sync de counts, hereda D-24-15):** El rewrite cambia el nº de slots → re-sincronizar los **3 hardcodes** + `TOTAL_EXPECTED` contra el nº REAL de slots leído del JSON (`data.exercises.length`), en el mismo o último plan. Estado actual: `genero-numero = 40` en los 3 sitios; `TOTAL_EXPECTED = 277` (post-Phase 24). Delta de esta fase = `−40 + (nº real de slots de genero-numero)`.

### Claude's Discretion
- La asignación exacta ejercicio→micro-slot (cuántos slots resultan en total, ~10-13 rough) se resuelve en `25-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de las guías D-25-01..04.
- Si los 3 match se quedan como 3 slots-de-1 o se agrupan en menos slots de artículo (dentro de D-04/D-25-03).
- El número final de slots — se fija en el mapa **antes** del rewrite para planear el sync de counts.
- Redacción concreta de prompts/options/explanations de variantes nuevas (sujeto a quórum).
- Esquema concreto de ids semánticos por micro-regla.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Precedente de conversión (Phases 22/23/24 — patrón EXACTO a replicar)
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-CONTEXT.md` — precedente inmediato; la conversión más parecida (también sin word-buttons multi-cat… ojo: 24 sí tenía word-buttons; aquí hay match en su lugar). Decisiones D-24-01..15 que esta fase hereda o diverge explícitamente.
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-REAGRUPACION-MAP.md` — formato del mapa old-id→slot. Plantilla para `25-REAGRUPACION-MAP.md`.
- `.planning/phases/24-verbi-di-movimento-a-slots-contenido/24-VARIANTES-NUEVAS.md` (si existe) / `.planning/phases/23-essere-a-slots-contenido/23-VARIANTES-NUEVAS.md` — proceso de propuesta/quórum de variantes. Plantilla para `25-VARIANTES-NUEVAS.md`.
- `.planning/phases/23-essere-a-slots-contenido/23-CONTEXT.md` — origen de la restricción de no-referencia a otra categoría (D-23 / D-159) que D-25-02 replica con Articoli.
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md` — metodología de reagrupación + workflow de tasks (mapa → rewrite → variantes → sync).
- `.planning/phases/22-avere-a-slots-contenido/22-VERIFICATION.md` — formato de checks finales y counts. Plantilla para `25-VERIFICATION.md`.

### Contenido
- `content/exercises/genero-numero.json` — **fuente** a convertir (40 ejercicios; genero-numero-001..037 MC + 207/208/209 match; categoryId único `genero-numero`, sin multi-cat; 40 con `payload`, 0 con `variants`).
- `content/exercises/essere.json` + `content/exercises/avere.json` — **shape target** ya convertido (slot+variantes; ejemplos de referencia, incl. cómo quedó un slot con match si lo hubiera; ver también articoli/partitivos para match en slot+variantes).
- `content/exercises/articoli.json` — categoría **vecina ya convertida** cuyo tema (artículo por sonido) solapa con D-25-02; consultar para coherencia de la regla SIN remitir a ella en las explanations.
- `content/categories.json` — confirmar el slug EXACTO del categoryId (`genero-numero`, name "Genere e numero", order 6) antes de hardcodear nada.

### Validator / smoke / counts (3 hardcodes a sincronizar tras el rewrite)
- `scripts/validate-content-fixture.mjs` — validator de shape (`node scripts/validate-content-fixture.mjs genero-numero content/exercises/genero-numero.json`).
- `tests/exercise-types.test.js:1267` — count hardcode de genero-numero en `CATEGORIES_WITH_EXPLANATIONS` (smoke paramétrico). Actual: `expected: 40`.
- `tests/fixtures/slot-variants-integration.test.js:172` — `REAL_CATEGORIES['genero-numero'].expected`. Actual: `40`.
- `scripts/run-validation-271.mjs:125` — count de genero-numero (`expected: 40`) + `TOTAL_EXPECTED` (línea 132, actual `277`) (reporter VAL-04/06/08).
- **Snapshot:** confirmado avere-only (no hay `.genero-numero-prefix-snapshot.json`; los scripts no referencian genero-numero) → NO se corre snapshot/assert (D-25-10).

### Reglas de autoría y validación
- `MEMORY.md` → `exercise_authoring_rules` (R1-R6/R7), `multi_vendor_quorum_validator`, `feedback_disputed_resolution`, `feedback_cross_vendor_catches_bugs`, `gloss_es_desambiguacion_canon`, `test_command_node_glob`.
- `scripts/validate-ai-pass.mjs` — validador de quórum multi-vendor (Gemini/DeepSeek, `--write`, auto-fallback 429).
- Skill `gsd-validate-exercise` — valida 1-por-1 con quórum Opus+Sonnet (C1-C5), NUNCA batched (VAL-03).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Validator + smoke paramétrico:** ya bifurcados por shape desde v1.4 (`Array.isArray(ex.variants)`) — funcionan tal cual con el shape slot+variantes; no hay que tocar motor/sampler/cascada/loader.
- **Plantillas de artefactos Phases 22/23/24:** REAGRUPACION-MAP / VARIANTES-NUEVAS / VERIFICATION son copiables 1:1 cambiando categoría.
- **`scripts/validate-ai-pass.mjs`** + skill `gsd-validate-exercise`: quórum multi-vendor reutilizable para las variantes nuevas.
- **Precedente de match en slot+variantes:** articoli/partitivos (Phases 18-20) ya tienen match convertido a slot+variantes — referencia directa para los 3 match de genero-numero.

### Established Patterns
- **Slot+variantes:** `explanation` top-level + `variants[]` shallow; ids semánticos (aquí TODOS semánticos — sin cruces cross-cat). Ver D-25-05/06.
- **"Drillear lo difícil"** aquí = **1 slot por micro-regla** (D-25-01): cada terminación de plural/género es una trampa propia que merece su slot; las invariables y el `-co/-go` son las trampas A1 más fuertes del hispanohablante.
- **Write-once-at-session-end + cascada inmediata al fallo** (motor existente, no se toca; sin cruces multi-cat → cascada D-54 solo afecta a `genero-numero`).
- **Test runner:** `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — ver `test_command_node_glob`).

### Integration Points
- `content/exercises/genero-numero.json` reescrito → lo leen validator, smoke, run-validation-271, y el loader de la app en boot.
- Counts: el rewrite cambia el nº de slots → 3 hardcodes + `TOTAL_EXPECTED` (277) deben sincronizarse (patrón AVE-01/22-03, ESS-01/23-03). Delta = `−40 + (nº real de slots)`.

</code_context>

<specifics>
## Specific Ideas

- **Granularidad fina deliberada (D-25-01):** a diferencia de Verbi di movimento (pocos slots, una regla), Genere e numero tiene VARIAS reglas paralelas → 1 slot por micro-regla. No es incoherencia con D-24-02 — es que el nº de reglas distintas con trampa propia es mayor aquí.
- **Invariables como trampa A1 estrella:** `una città, due città` (NO `cittàs`), `un film, due film` (NO `films`) — el calco español del plural en -s es el error más persistente; merece su slot propio y engorde generoso.
- **Sonido duro -co/-go con su excepción:** parco→parchi CONSERVA el sonido duro, pero amico→amici lo PIERDE — el contraste es justo lo que hay que drillear; un slot dedicado lo aísla.
- **Artículos sin remitir a Articoli (D-25-02):** los artículos están en el set legacy de genero-numero y se quedan, pero las explanations tratan la regla en sitio sin mandar al alumno a la categoría Articoli (paralelo exacto a la restricción D-24-07 con Essere).
- **Match preservado por D-04 (D-25-03):** artículo-por-sonido NO es derivable por raíz → los 3 match siguen siendo match, no se convierten a multi-choice.

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de la fase. Las conversiones restantes (Professioni Phase 26, Sostantivi irregolari Phase 27) ya están en el roadmap, y es ahí donde se resuelve la open question "regla-con-variantes O slots-de-1" para las categorías léxicas puras (NO aplica a Genere e numero, que es rule-rich). Los plurales irregulares puros (uomo/uomini, mano/mani, uovo/uova) pertenecen a Sostantivi irregolari (Phase 27) — no se autoran como variantes de genero-numero. El bloque Canciones y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog v1.6 boundary. Añadir cruces multi-cat nuevos a Genere e numero sería capacidad nueva (out of scope — el set legacy no los tiene).

</deferred>

---

*Phase: 25-genere-e-numero-a-slots-contenido*
*Context gathered: 2026-06-08*
