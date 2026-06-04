# Phase 19: Articoli a slots (contenido) - Context

**Gathered:** 2026-06-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Articoli se convierte al modelo **slot+variantes** (Phase 15) explotado por el motor (Phase 16): los **56 ejercicios validados** se **reagrupan en slots por regla**, se **autoran variantes nuevas** que pasan el quórum cross-vendor R1-R7, se **añaden slots nuevos** para los huecos de disparador detectados, y la estructura final pasa el **validator** y el **smoke paramétrico** (counts re-sincronizados). Es el primer caso de mejor encaje tras el piloto Preposiciones (Phase 17). Cubre ART-01..04.

**En scope:** reagrupación de los 56 ejercicios reales de Articoli en slots por regla (determinativi por disparador fonético, indeterminativi como slots propios); autoría de variantes nuevas donde la regla lo admita (quórum cross-vendor); slots nuevos para huecos de disparador (y / i+vocal); explicación a nivel de slot (elegir la más completa + injertar matices); validator + smoke paramétrico verdes con counts re-sincronizados.

**Fuera de scope:**
- **La migración / reset de progreso — YA HECHA en Phase 18** (`migrate7to8` + `hydrateV8` resetearon articoli+partitivos; `backup.js` ya round-trip v8). Esta fase NO toca `storage.js` ni la cadena de migración.
- El modelo de datos (Phase 15) y el motor de sampling/examen por slot (Phase 16) — ya entregados, no se tocan (v1.5 es puro contenido sobre la maquinaria existente).
- La conversión de Partitivi (Phase 20) y de las otras 6 categorías (CONV-01 backlog) — siguen como slots de 1 variante, intactas.

**Hecho del contenido (verificado):** `content/exercises/articoli.json` tiene **56 ejercicios, todos `validated`**: 54 `multiple-choice` + **2 `match`** (049 serie determinativa lo/gli; 050 serie indeterminativa uno/un). **6 son cruces inter-categoría** (3 `articoli+genero-numero`, 3 `articoli+sustantivos-irregulares`). El disparador **`y` / `i+vocal`** (lo yogurt, lo iodio, gli yogurt) **NO está cubierto** — es un hueco. Las notas `status pending (D-15)` son stale: el campo `validation.status` real es `validated` en los 56.

</domain>

<decisions>
## Implementation Decisions

### Granularidad de los slots de determinativi (ART-01)
- **D-19-01 (slot por forma — sing/plural separados):** Singular y plural son **slots distintos** (`il` ≠ `i`, `lo` ≠ `gli`, etc.), extendiendo D-17-02 del piloto a Articoli. El texto del ROADMAP ("il/i; lo/gli…") describe las **familias por disparador**, NO prescribe que sing+plural compartan slot. La línea purista-por-forma del autor (consistente en todo el piloto) se mantiene: "i = plural de il" se trata como regla independiente. Descartado: agrupar sing+plural por disparador.
- **D-19-02 (un slot por sub-disparador en la serie lo/gli):** Los suoni speciali que disparan `lo/gli` (s+cons, z, gn, ps, x) se modelan como **un slot por sub-disparador**, NO un slot único "suoni speciali". Cada sub-sonido es una trampa distinta para el hispanohablante (z vs gn vs ps son confusiones diferentes) y el contenido ya tiene densidad por celda. Respeta D-17-01 (cada regla distinta = 1 slot) y maximiza re-verificación por celda. Las variantes nacen de reformular el **mismo sub-sonido con otro sustantivo**.
- **Nota de aplicación:** Donde la forma es **invariable ante cualquier disparador** (`la` femenino: la casa / la zia / la studentessa; `le` femenino plural), aplica D-17-01 → es **una regla** ("el fem no cambia") → un slot con variantes que refuerzan esa invariabilidad y el contraste con la serie masc. El split por sub-disparador (D-19-02) aplica solo donde el disparador **cambia la forma o crea una trampa** (serie lo/gli). El planner resuelve los límites guiado por D-17-01.

### Indeterminativi (ART-03 — locked por requirement)
- Los indeterminativi (`un`/`uno`/`una`/`un'`) quedan como **slots propios dentro de Articoli** con sus reglas de selección (uno ante s+cons/z/gn/ps/x; un' ante femenino+vocal) — sin crear categoría nueva. Misma granularidad por forma/disparador que los determinativi (D-19-01/D-19-02).

### Ejercicios match (ART-01)
- **D-19-03 (match = slots-de-1 type:match):** Los 2 ejercicios `match` (049, 050) quedan como **sus propios slots `type:match`, slot-de-1, sin variantes forzadas**. Entrenan agregación de la serie completa = regla/skill distinta del multiple-choice celda-a-celda (D-17-01); el shape slot+variantes soporta `type` a nivel de slot. Preserva el contenido validado y su valor pedagógico complementario. Coherente con D-17-06 (excepciones quedan slot-de-1).

### Cruces inter-categoría (ART-01)
- **D-19-04 (cruces = slots-de-1 con id ESTABLE):** Los 6 cruces (3 `articoli+genero-numero`, 3 `articoli+sustantivos-irregulares`) quedan como **slots-de-1 conservando su id actual (no renumerar)**. Cada uno es una regla distinta (plural irregular, concordancia número/género). La renumeración de ids es **libre solo para los slots articoli-only** (cuyo progreso sí reseteó Phase 18). Razón: `genero-numero` y `sustantivos-irregulares` **NO se resetearon** en Phase 18; renumerar esos ids les haría perder cobertura (`clearedExerciseIds` quedaría stale → regresión a no-hecha). Cambios mínimos.
- **Nota para el planner:** al renumerar los slots articoli-only, **reservar/excluir los ids estables de los 6 cruces** para evitar colisión de ids.

### Autoría de variantes nuevas (ART-02)
- **D-19-05 (arrastrar D-17-06 + priorizar celdas pobres):** Variantes nuevas solo donde la regla **admite reformulación natural** (otro sustantivo del mismo disparador), **sin cuota rígida** (arrastra D-17-06). Pero **priorizar engordar las celdas hoy con 1 ejercicio** (x, ps, gn) hasta ≥2 variantes para que el motor re-verifique con material variado. Pragmático como el piloto; rigor en valor pedagógico, no en exhaustividad uniforme. Descartado: densidad mínima fija ≥2-3 en todo slot (coste + variantes artificiales).
- **D-19-06 (huecos de disparador → slots nuevos):** Se **añaden slots nuevos para `y` / `i+vocal`** en la serie lo/gli (lo yogurt / gli yogurt; lo iodio / i+vocal donde aplique), autorados por quórum cross-vendor — cierra la serie de suoni speciali completa que lista el ROADMAP (ART-02 "huecos detectados → slots nuevos"). **Verificar que el sustantivo italiano y su artículo son correctos (R6)** antes de meter (los semiconsonánticos `y`/`i+vocal` son terreno de error fácil).

### Explicación a nivel de slot (ART-04 — arrastrado del piloto)
- **D-17-05 (elegir la más completa + injertar matices):** Cuando un slot fusiona varias variantes, la explicación del slot = elegir la más completa/general de las existentes + injertar los matices únicos de las descartadas (contrastes, pitfalls del hispanohablante). Merge **ligero**, NO reescritura total a regla generalizada, NI quedarse con una sola perdiendo matices. Las variantes NO llevan explicación propia (D-15-02): comparten la del slot. Revisión del autor (D-85).

### Validación (ART-02/ART-04 — arrastrado del piloto)
- **D-17-07 (quórum cross-vendor completo):** Cada variante/slot **nuevo** entra solo si pasa el quórum **cross-vendor R1-R7**: `scripts/validate-ai-pass.mjs` (Gemini + DeepSeek) **Y** una pasada de Claude (skill `gsd-validate-exercise`, Opus+Sonnet, 1-por-1, fresh context, C1-C5). **Todos** deben dar verdict "correcta". Patrón de autoría D-85: Claude propone → autor revisa → quórum. Los 56 existentes ya validados **NO se re-validan**, salvo que cambie su **superficie** al reagrupar.
- **Re-validación de superficie:** si al reagrupar/fusionar cambia el texto del prompt/options de un ejercicio existente, esa superficie cuenta como variante nueva → quórum. Si solo se mueve el texto a `variants[]` sin tocarlo, NO requiere re-validación (arrastra el criterio de Claude's Discretion del piloto).
- **Gloss ES (R7 canon):** mantener el gloss "(en español: …)" en prompts donde desambigüe doble-validez; el C5-leak que marcan Gemini/DeepSeek sobre él es falso-positivo de política (base de aprobación = Claude Opus+Sonnet).

### Claude's Discretion
- **Esquema de id de los slots articoli-only:** qué id gana al fusionar/renumerar (progreso de articoli reseteado en Phase 18 → estabilidad de ids legacy no importa para articoli-only). El planner elige (id más bajo del grupo, renumeración secuencial limpia), respetando unicidad y **reservando los ids estables de los 6 cruces** (D-19-04).
- **Smoke paramétrico (ART-04):** cómo re-sincronizar los hardcodes de count al nº real de slots (como en D-17-04) y parametrizar la verificación de estructura (1 variante elegida por slot al construir sesión, explanation por slot presente, validator verde). Respetar `node --test tests/*.test.js`.
- **Límite slot vs variante en formas invariables** (`la`, `le`): aplicar D-17-01 (ver nota en D-19-01/D-19-02).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements y roadmap de esta fase
- `.planning/REQUIREMENTS.md` §Articoli a slots (ART) — ART-01..04 + criterios de aceptación.
- `.planning/ROADMAP.md` §Phase 19 — goal + 4 success criteria (incluye la lista literal de disparadores fonéticos).

### Piloto y contrato heredado (el patrón que esta fase replica)
- `.planning/milestones/v1.4-phases/17-piloto-preposiciones-contenido/17-CONTEXT.md` — **D-17-01..08**: el patrón completo de conversión a slots (regla=slot, 1-slot-por-forma, explicación elegir+injertar, variantes donde tenga sentido, quórum cross-vendor). Phase 19 lo replica para Articoli; las decisiones D-17-01/05/06/07 se arrastran y D-17-02 se extiende como D-19-01.
- `.planning/milestones/v1.4-phases/15-modelo-de-datos-slot-variantes-schema-migraci-n/15-CONTEXT.md` — D-15-01..09: shape slot+variantes (`variants[]` planas, `type`/`categoryIds`/`explanation` a nivel de slot), legacy=slot-de-1, `exerciseStats` por id de slot.
- `.planning/milestones/v1.4-phases/16-motor-de-examen-por-slots/16-CONTEXT.md` — D-16-01..12: `variantIndex` fijado al construir sesión, default 0, "hecha"=cobertura por slot, cascada D-54 por slotId, `slotById` como contrato de entrada del motor.

### Migración ya entregada (contexto, NO se modifica en esta fase)
- `.planning/phases/18-migraci-n-7-8-reset-selectivo-articoli-partitivos/18-CONTEXT.md` — el reset 7→8 de articoli+partitivos ya hecho. Phase 19 asume el progreso de articoli reseteado y los ids libres de renumerar (excepto los cruces, D-19-04).

### Contenido y tooling de validación
- `content/exercises/articoli.json` — los 56 ejercicios reales a reagrupar (campo `notes` describe la regla/celda de cada uno; `validation.passes[]` = historial de quórum). 54 MC + 2 match (049/050) + 6 cruces.
- `content/content-loader.js` — normaliza legacy `payload` XOR `variants[]` → `slotById`; el contenido reagrupado fluye por el mismo path.
- `scripts/validate-ai-pass.mjs` — validador cross-vendor (Gemini/DeepSeek, auto-fallback 429, `--write`); claves en `.env`; pool elegible por verificación.
- skill `gsd-validate-exercise` — quórum Claude 1-por-1 (Opus+Sonnet, fresh context, C1-C5 = operacionalización de R1-R7); NUNCA batched.
- `content/validate-content-fixture.mjs` / smoke paramétrico — verifica estructura final; los hardcodes de count se re-sincronizan al nº real de slots (D-17-04).

### Reglas de autoría (memoria del proyecto)
- R1-R6 reglas estrictas de alta de ejercicios (no leak en prompt, no refs #NNN en explanations, match con 3+ valores distintos, verificar artículo/noun italiano — R6 crítico para los huecos y/i+vocal).
- R7: gloss "(en español: …)" es canon del autor (no es leak); base de aprobación = Claude Opus+Sonnet.
- Al resolver disputed: calidad > tokens, incluir traducción española en prompt para desambiguar doble-validez, ambas IAs deben dar correcta.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`slotById` + normalización legacy→slot (content-loader.js, Phase 15):** el loader ya acepta `payload` (legacy) XOR `variants[]`; los 6 cruces dejados legacy (D-19-04) se normalizan a slot-de-1 sin tocar el loader. El contenido reagrupado de Articoli fluye por el mismo path.
- **`type` a nivel de slot (Phase 15/16):** soporta `type:match` a nivel de slot → los 2 match slots (D-19-03) encajan sin cambios de motor.
- **`scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise`:** pipeline de quórum cross-vendor listo; el `--write` muta `validation.passes[]` in-place.
- **Patrón de smoke paramétrico (piloto):** ya parametriza la verificación de estructura por slot; aquí se re-sincronizan los counts al nº real de slots de Articoli.

### Established Patterns
- **Migración por schemaVersion — YA EJECUTADA en Phase 18.** Esta fase NO añade migraciones; opera sobre el state ya migrado a v8 con articoli reseteado.
- **`exerciseStats` keyed por id de slot** (peso `1/(1+min(timesShown,10))`): articoli reseteado → re-lazy-init de pesos al re-hacer la categoría. Los ids estables de los cruces (D-19-04) mantienen la cobertura de las categorías no reseteadas.
- **"hecha" = cobertura total por id de slot** (`clearedExerciseIds.every`): por eso renumerar los cruces rompería genero-numero/sustantivos-irregulares (D-19-04).
- **Validación cross-vendor 1-por-1, fresh context** (memoria): NUNCA batched; DeepSeek estricto en acentos, Opus indulgente → complementar con scan de acentos.

### Integration Points
- `loadContent → slotById` es el borde donde el motor de Phase 16 consume Articoli reagrupado. El shape producido debe ser válido para ese contrato (1 variante elegida por slot al construir sesión).
- Los slots multi-categoría (cruces) participan en la cobertura de DOS categorías; mantener id estable preserva la cobertura de la categoría no reseteada.

</code_context>

<specifics>
## Specific Ideas

- El autor mantiene la línea **purista-por-forma** del piloto: ante la ambigüedad del ROADMAP ("il/i"), eligió singular y plural en slots separados (D-19-01) y un slot por sub-disparador en la serie lo/gli (D-19-02) en vez de agrupar. La identidad del slot = la **regla/forma/disparador exacto**; las variantes nacen de reformular esa MISMA regla con otro sustantivo.
- Patrón consistente con el piloto: **rigor máximo en validación** (quórum cross-vendor completo, sin atajos) + **pragmatismo en alcance** (variantes "donde tenga sentido", priorizar celdas pobres en vez de cuota uniforme) + **mínimo esfuerzo redaccional** en explicaciones (elegir+injertar).
- Voluntad de **cerrar la serie de suoni speciali completa** (añadir y/i+vocal como huecos detectados) en vez de quedarse solo con lo presente — completitud de la regla por encima de acotar el alcance.

</specifics>

<deferred>
## Deferred Ideas

- **Conversión de Partitivi a slots** — Phase 20 (independiente de esta tras la migración de Phase 18).
- **Conversión de las 6 categorías restantes a slots** (CONV-01 cont.) — backlog post-v1.5; siguen como slots de 1 variante. La conversión real de los cruces (genero-numero, sustantivos-irregulares) que aquí quedan slots-de-1 con id estable (D-19-04) se completará cuando esas categorías se conviertan.
- **Reescritura de explicaciones a regla generalizada** (independizar del ejemplo concreto) — descartada por coste, igual que en el piloto (D-17-05). Revisable si en uso real una explicación anclada confunde.
- **Densidad mínima fija de variantes por slot** — considerada y descartada (D-19-05) a favor de "donde tenga sentido + priorizar celdas pobres". Revisable en un milestone futuro si el autor quiere endurecer.

### Reviewed Todos (not folded)
None — discusión dentro del scope de la fase.

</deferred>

---

*Phase: 19-articoli-a-slots-contenido*
*Context gathered: 2026-06-04*
