# Phase 20: Partitivi a slots (contenido) - Context

**Gathered:** 2026-06-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Partitivi se convierte al modelo **slot+variantes** (Phase 15) explotado por el motor (Phase 16): los **44 ejercicios validados** se **reagrupan en slots por regla**, se **autoran variantes nuevas** que pasan el quórum cross-vendor R1-R7, se **añaden slots nuevos** para los huecos de disparador detectados, y la estructura final pasa el **validator** y el **smoke paramétrico** (counts re-sincronizados). Es el segundo (y último) caso del bloque Artículos de CONV-01, tras Articoli (Phase 19) y replicando el patrón del piloto Preposiciones (Phase 17). Cierra el milestone v1.5. Cubre PART-01..03.

**En scope:** reagrupación de los 44 ejercicios reales de Partitivi en slots por regla (del-formas por disparador fonético + eje contable/incontable + alternativas + omisión en negativa + partitivo-vs-preposizione articolata); autoría de variantes nuevas donde la regla lo admita (quórum cross-vendor); slots nuevos para huecos de disparador detectados; explicación a nivel de slot (elegir la más completa + injertar matices); validator + smoke paramétrico verdes con counts re-sincronizados.

**Fuera de scope:**
- **La migración / reset de progreso — YA HECHA en Phase 18** (`migrate7to8` + `hydrateV8` resetearon articoli+partitivos; `backup.js` ya round-trip v8). Esta fase NO toca `storage.js` ni la cadena de migración.
- El modelo de datos (Phase 15) y el motor de sampling/examen por slot (Phase 16) — ya entregados, no se tocan (v1.5 es puro contenido sobre la maquinaria existente).
- Articoli (Phase 19) — ya convertido. Las otras 6 categorías (CONV-01 backlog) siguen como slots de 1 variante, intactas.

**Hecho del contenido (verificado):** `content/exercises/partitivos.json` tiene **44 ejercicios, todos `validated`**: 42 `multiple-choice` + **2 `match`** (038 incontable sustantivo↔forma; 039 contable plural sustantivo↔forma). **0 cruces inter-categoría** (a diferencia de Articoli, que tenía 6) → la renumeración de ids es libre en TODA la categoría. Todos son legacy `payload` (0 `variants[]`). Las reglas cubiertas (por `notes`):
- **del-formas por disparador:** del (incontable masc cons, 001-004), dello (z 005-006 / s-impura 007), della (fem cons 008-010), dell' (vocal elisión 011-013), dei (contable masc pl cons 014-016), degli (s-impura 017 / vocal 018 / z 019), delle (fem pl invariable 020-022).
- **eje contable/incontable (pares de contraste D-01):** 023/024 (Ho comprato, incontable vs contable), 025/026 (Ho preso).
- **alternativas:** qualche +siempre singular (027-029), un po' di +solo incontable (030-031), alcune/alcuni +solo plural contable con concordancia de género (032/033).
- **omisión en negativa (D-02):** cara afirmativa usa partitivo (034 del, 036 degli) / cara negativa omite "∅ sin partitivo" (035, 037).
- **partitivo-vs-preposizione articolata (D-05/PART-05):** clasificación de la función de 'del' (040 PARTITIVA, 041 PREPOSITIVA, 042 PARTITIVA, 043 PREPOSITIVA, 044 PARTITIVA); el MC pide clasificar (`opciones: partitivo / preposición / artículo`).

</domain>

<decisions>
## Implementation Decisions

Esta fase es el **paralelo de Articoli (Phase 19)**: las decisiones del piloto (D-17-xx) y de Articoli (D-19-xx) **se arrastran** salvo donde Partitivi tiene reglas propias. Las decisiones nuevas (D-20-xx) cubren exactamente esas reglas propias.

### del-formas — estructura núcleo (PART-01)
- **D-20-01 (1 slot por forma + split por sub-disparador, espejo D-19-01/D-19-02):** Cada forma del partitivo (del / dello / della / dell' / dei / degli / delle) es la unidad de slot; singular y plural son slots distintos (arrastra D-19-01; en Partitivi la forma ya codifica el eje número/contabilidad: del=incontable masc sing, dei=contable masc pl). Donde un disparador fonético crea trampa distinta se hace **un slot por sub-disparador** (espeja D-19-02): `dello` → slots separados **z** / **s-impura**; `degli` → slots separados **s-impura** / **vocal** / **z**. Las formas invariables ante cualquier disparador (`delle` fem pl) aplican D-17-01 (una regla "el fem pl no cambia" = un slot con variantes). El planner resuelve los límites guiado por D-17-01.

### Alternativas al partitivo (PART-01)
- **D-20-02 (un slot por alternativa; alcuni/alcune juntos por género):** Las alternativas se modelan como **3 slots**, uno por restricción: **qualche** (+siempre singular), **un po' di** (+solo incontable), **alcuni/e** (+solo plural contable). `alcuni` (masc) y `alcune` (fem) van **en UN solo slot como variantes de género** — la regla "alcuni/e = solo plural contable" es la misma y el género es concordancia (espejo del trato de las formas invariables en D-17-01, NO split-por-forma D-19-01: aquí la forma cambia por concordancia, no por regla distinta). Descartado: alcuni≠alcune como slots separados; y un único slot "alternativas" (mezclaría restricciones distintas, contra D-17-01).

### Omisión en negativa (PART-01)
- **D-20-03 (slot de contraste afirmativa/negativa):** Un único slot **"uso vs omisión del partitivo en negativa"** (D-02) con las caras **afirmativa** (034 del, 036 degli → USAR partitivo) y **negativa** (035, 037 → "∅ sin partitivo") como **variantes del mismo slot**, compartiendo explicación. El contraste afirmativa/negativa ES la lección. Descartado: absorber las afirmativas en sus slots del-forma dejando un slot solo-∅; y slots afirmativa/negativa separados.

### Partitivo vs preposizione articolata (PART-01)
- **D-20-04 (un slot de clasificación):** Un único slot **"distinguir partitivo vs preposizione articolata"** (D-05) con las **5 frases de clasificación (040-044) como variantes**, mezclando ejemplos PARTITIVA y PREPOSITIVA. El skill es **clasificar la función** de 'del' — separar por función rompería el ejercicio (clasificar exige ver ambas mezcladas). Slot-de-1 conceptual que crece con variantes nuevas de ambos tipos. Descartado: split slot PARTITIVA + slot PREPOSITIVA.

### Pares de contraste contable/incontable (PART-01)
- **D-20-05 (absorbidos en sus slots del-forma):** Los pares D-01 (023/024 'Ho comprato…', 025/026 'Ho preso…') **NO forman un slot dedicado**: cada lado entra como variante de su slot por forma (023 del→slot del; 024 dei→slot dei; etc.). El contraste vive implícito en que comparten verbo. Más simple y coherente con el resto de del-formas. (Nota: difiere conscientemente de D-20-03 — la omisión sí merece slot de contraste porque la respuesta "∅" es un skill propio; el eje contable/incontable ya está representado por las formas distintas.)

### Ejercicios match (PART-01)
- **D-20-06 (match = slots-de-1 type:match, arrastra D-19-03):** Los 2 ejercicios `match` (038 incontable, 039 contable plural) quedan como **sus propios slots `type:match`, slot-de-1, sin variantes forzadas**. Entrenan agregación de la serie completa = regla/skill distinta del MC celda-a-celda (D-17-01). El shape slot+variantes soporta `type` a nivel de slot.

### Ids (PART-01)
- **D-20-07 (renumeración de ids libre — sin cruces):** Partitivi tiene **0 cruces inter-categoría**, así que **D-19-04 NO aplica**: el progreso de partitivos fue reseteado en Phase 18 y no hay ids compartidos con otras categorías. El esquema de id de los slots es **Claude's Discretion** (renumeración secuencial limpia o id semántico `partitivos-{forma|regla}` estilo D-15-09), respetando unicidad. No hay ids estables que reservar.

### Autoría de variantes nuevas (PART-02 — arrastrado)
- **D-19-05 (arrastrado): variantes solo donde la regla admite reformulación natural, sin cuota rígida, priorizando engordar celdas pobres** (las celdas de del-formas con 1 solo contexto tras el split por sub-disparador, p. ej. dello+s-impura, degli+vocal, degli+z) hasta ≥2 variantes.
- **D-19-06 (arrastrado): huecos de disparador → slots nuevos.** Detectar y cerrar huecos de la serie de suoni speciali en el partitivo masc (p. ej. **dello+gn / dello+ps / dello+x**, **degli+gn / degli+ps**) si la regla aplica y existe sustantivo natural, autorados por quórum. **R6 crítico:** verificar el sustantivo italiano, su género/número y la contracción correcta (di+articolo) antes de meter. El planner/autor decide qué huecos son naturales en plan-time.

### Explicación a nivel de slot (PART-03 — arrastrado)
- **D-17-05 (arrastrado): elegir la más completa + injertar matices.** La explicación del slot = la más completa de las variantes fusionadas + matices únicos de las descartadas (contrastes, pitfalls del hispanohablante: trampa de género de `latte`, calco del plural español en `qualche`, di+articolo). Merge ligero, NO reescritura total. Variantes sin explicación propia (D-15-02). Revisión del autor (D-85). **Canon editorial:** español acentuado RAE, italianismos preservados, plain text sin markdown, apóstrofes ASCII U+0027 (D-129/D-135/D-137); explanations rule-first (lideran con la regla/disparador, no con un sustantivo concreto) por consistencia con el corpus tras D-19-07.

### Validación (PART-02/PART-03 — arrastrado)
- **D-17-07 (arrastrado): quórum cross-vendor completo R1-R7** para cada superficie **nueva**: `scripts/validate-ai-pass.mjs` (Gemini + DeepSeek) **Y** una pasada Claude (skill `gsd-validate-exercise`, Opus+Sonnet, 1-por-1, fresh context, C1-C5). Todos deben dar "correcta"; `disputed` bloquea. NUNCA batched. Patrón D-85 (Claude propone → autor revisa → quórum). Los 44 existentes ya validados **NO se re-validan** salvo que cambie su **superficie** al reagrupar (mover texto intacto a `variants[]` NO requiere re-validación).
- **Gloss ES (R7 canon):** mantener "(en español: …)" donde desambigüe doble-validez; el C5-leak que marcan Gemini/DeepSeek es falso-positivo de política (base de aprobación = Claude Opus+Sonnet).
- **Nota cazada en Phase 19:** el quórum cross-vendor caza explanations heredadas sin tildes y errores ortográficos italianos (`piu`→`più`, `è` sin acento) que los pases human-verify aprueban. Complementar con scan de acentos sobre las superficies movidas también (no solo las nuevas), por si arrastran defectos legacy como pasó en Articoli (WR-01/WR-02).

### Claude's Discretion
- **Esquema de id de los slots de Partitivi** (D-20-07): sin cruces → renumeración libre; el planner elige.
- **Smoke paramétrico (PART-03):** re-sincronizar los hardcodes de count al nº real de slots (como D-17-04). Tras Phase 19, `TOTAL_EXPECTED` = 348 con Articoli=34; al convertir Partitivi cambia de 44 a su nº real de slots → recomputar `TOTAL_EXPECTED` y los 3 hardcodes (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`). El smoke ya es shape-agnostic (`Array.isArray(ex.variants)`); solo cambian counts. `node --test tests/*.test.js`. **Recordar elevar `validation.status` a nivel de slot en los slots nuevos** (D-19-09) para que el gate `VAL_07_STRICT` los vea.
- **Límite slot vs variante en `delle` invariable y en `alcuni/e`:** aplicar D-17-01 / D-20-02.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements y roadmap de esta fase
- `.planning/REQUIREMENTS.md` §Partitivi a slots (PART) — PART-01..03 + criterios de aceptación.
- `.planning/ROADMAP.md` §Phase 20 — goal + 3 success criteria (lista literal de las dimensiones de regla de Partitivi).

### Articoli (Phase 19) — el paralelo directo cuyas decisiones se arrastran
- `.planning/phases/19-articoli-a-slots-contenido/19-CONTEXT.md` — **D-19-01..09**: el patrón completo de conversión que esta fase replica (1-slot-por-forma D-19-01, split por sub-disparador D-19-02, match=slots-de-1 D-19-03, variantes+huecos D-19-05/06, explanations rule-first D-19-07, validation.status top-level D-19-09). D-19-04 (cruces id estable) NO aplica a Partitivi.
- `.planning/phases/19-articoli-a-slots-contenido/19-REVIEW.md` — WR-01/WR-02: defectos de acento heredados que el quórum solo cubre para superficies nuevas; aplicar scan de acentos a las superficies movidas de Partitivi.

### Piloto y contrato heredado (el patrón base)
- `.planning/milestones/v1.4-phases/17-piloto-preposiciones-contenido/17-CONTEXT.md` — **D-17-01..08**: regla=slot, explicación elegir+injertar (D-17-05), variantes donde tenga sentido (D-17-06), quórum cross-vendor (D-17-07), sync de counts (D-17-04).
- `.planning/milestones/v1.4-phases/15-modelo-de-datos-slot-variantes-schema-migraci-n/15-CONTEXT.md` — D-15-01..09: shape slot+variantes (`variants[]` planas, `type`/`categoryIds`/`explanation` a nivel de slot), legacy=slot-de-1, `exerciseStats` por id de slot.
- `.planning/milestones/v1.4-phases/16-motor-de-examen-por-slots/16-CONTEXT.md` — D-16-01..12: `variantIndex` fijado al construir sesión, "hecha"=cobertura por slot, cascada D-54 por slotId, `slotById` como contrato de entrada del motor.

### Migración ya entregada (contexto, NO se modifica)
- `.planning/phases/18-migraci-n-7-8-reset-selectivo-articoli-partitivos/18-CONTEXT.md` — el reset 7→8 de articoli+partitivos ya hecho. Phase 20 asume el progreso de partitivos reseteado y los ids libres de renumerar (sin cruces).

### Contenido y tooling de validación
- `content/exercises/partitivos.json` — los 44 ejercicios reales a reagrupar (campo `notes` describe la regla/celda de cada uno; `validation.passes[]` = historial de quórum). 42 MC + 2 match (038/039); 0 cruces.
- `content/content-loader.js` — normaliza legacy `payload` XOR `variants[]` → `slotById`; el contenido reagrupado fluye por el mismo path.
- `scripts/validate-ai-pass.mjs` — validador cross-vendor (Gemini/DeepSeek, auto-fallback 429, `--write`); claves en `.env`.
- skill `gsd-validate-exercise` — quórum Claude 1-por-1 (Opus+Sonnet, fresh context, C1-C5 = operacionalización de R1-R7); NUNCA batched.
- `content/validate-content-fixture.mjs` / smoke paramétrico — verifica estructura final; los hardcodes de count se re-sincronizan al nº real de slots (D-17-04). `tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs` portan los 3 hardcodes + `TOTAL_EXPECTED`.

### Reglas de autoría (memoria del proyecto)
- R1-R6 reglas estrictas de alta de ejercicios (no leak en prompt, no refs #NNN en explanations, match con 3+ valores distintos, verificar artículo/contracción/noun italiano — R6 crítico para los huecos de del-formas).
- R7: gloss "(en español: …)" es canon del autor (no es leak); base de aprobación = Claude Opus+Sonnet.
- Al resolver disputed: calidad > tokens, incluir traducción española en prompt para desambiguar doble-validez, ambas IAs deben dar correcta.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`slotById` + normalización legacy→slot (content-loader.js, Phase 15):** el loader acepta `payload` (legacy) XOR `variants[]`; el contenido reagrupado de Partitivi fluye por el mismo path sin tocar el loader.
- **`type` a nivel de slot (Phase 15/16):** soporta `type:match` → los 2 match slots (D-20-06) encajan sin cambios de motor.
- **`scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise`:** pipeline de quórum cross-vendor listo; el `--write` muta `validation.passes[]` in-place. Mismo flujo ejecutado con éxito en Phase 19 (8 superficies, 0 excluidas).
- **Smoke paramétrico shape-agnostic (`Array.isArray(ex.variants)`):** ya bifurca por shape; aquí solo se re-sincronizan los counts de Partitivi al nº real de slots. Patrón de sync replicado de Phase 19 (19-03).

### Established Patterns
- **Migración por schemaVersion — YA EJECUTADA en Phase 18.** Esta fase NO añade migraciones; opera sobre el state ya migrado a v8 con partitivos reseteado.
- **`exerciseStats` keyed por id de slot** (peso `1/(1+min(timesShown,10))`): partitivos reseteado → re-lazy-init de pesos al re-hacer la categoría.
- **"hecha" = cobertura total por id de slot** (`clearedExerciseIds.every`): sin cruces, no hay riesgo de romper cobertura de otra categoría al renumerar (D-20-07).
- **`validation.status` a nivel de slot lo lee el gate `VAL_07_STRICT`** (D-19-09): los slots nuevos deben portar el bloque `validation` top-level además del por-variante.
- **Validación cross-vendor 1-por-1, fresh context** (memoria): NUNCA batched; DeepSeek estricto en acentos, Opus indulgente → complementar con scan de acentos (también sobre superficies movidas, lección de Phase 19 WR-01/02).

### Integration Points
- `loadContent → slotById` es el borde donde el motor de Phase 16 consume Partitivi reagrupado. El shape producido debe ser válido para ese contrato (1 variante elegida por slot al construir sesión).
- Tras Phase 19, `TOTAL_EXPECTED = 348` con Articoli=34. Convertir Partitivi (44 → nº real de slots) recomputa `TOTAL_EXPECTED` de nuevo; cuidar la aritmética del total en los 3 hardcodes.

</code_context>

<specifics>
## Specific Ideas

- El autor mantiene la **línea purista-por-regla** del piloto/Articoli: identidad del slot = la regla/forma/disparador exacto; las variantes nacen de reformular esa MISMA regla con otro sustantivo. Lo aplicó a las 4 dimensiones propias de Partitivi de forma consistente (split por sub-disparador en dello/degli; un slot por restricción en alternativas; slot de contraste donde la respuesta "∅" es skill propio).
- **Matiz fino capturado:** la concordancia de género (alcuni/alcune) NO crea slots separados (D-20-02), pero la trampa fonética sí (D-20-01) — el autor distingue "cambio de forma por concordancia" (mismo slot) de "cambio de forma por regla/disparador distinto" (slots separados).
- **Asimetría deliberada contraste vs omisión:** el eje contable/incontable se absorbe en las formas (D-20-05) pero la omisión en negativa sí merece slot de contraste (D-20-03), porque la respuesta "∅ sin partitivo" es un skill que ninguna forma representa.
- Patrón consistente con el piloto/Articoli: rigor máximo en validación (quórum completo, sin atajos) + pragmatismo en alcance (variantes "donde tenga sentido", priorizar celdas pobres) + mínimo esfuerzo redaccional en explicaciones (elegir+injertar).

</specifics>

<deferred>
## Deferred Ideas

- **Conversión de las 6 categorías restantes a slots** (CONV-01 cont.) — backlog post-v1.5; siguen como slots de 1 variante.
- **Bridges Partitivos ↔ género-número / sustantivos** (PART-X1) — backlog (REQUIREMENTS §Future). Partitivi no tiene cruces hoy; los bridges serían contenido nuevo de otra fase.
- **Reescritura de explicaciones a regla generalizada** (independizar del ejemplo concreto) — descartada por coste, igual que en piloto/Articoli (D-17-05). Revisable si en uso real confunde.
- **Densidad mínima fija de variantes por slot** — descartada (arrastra D-19-05) a favor de "donde tenga sentido + priorizar celdas pobres".

### Reviewed Todos (not folded)
None — discusión dentro del scope de la fase.

</deferred>

---

*Phase: 20-partitivi-a-slots-contenido*
*Context gathered: 2026-06-05*
