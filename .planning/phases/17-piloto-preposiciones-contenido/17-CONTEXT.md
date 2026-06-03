# Phase 17: Piloto Preposiciones (contenido) - Context

**Gathered:** 2026-06-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Preposiciones se convierte en el **primer caso real** del modelo slot+variantes (Phase 15) explotado por el motor (Phase 16): los ejercicios validados se **reagrupan en slots por regla**, se **autoran variantes nuevas** que pasan el quórum cross-vendor R1-R7, se añade el slot locativo fijo (`in spiaggia`), y el **progreso de Preposiciones se resetea** a no-hecha/racha 0. Cubre PILOT-01..05.

**En scope:** reagrupación de los ejercicios reales de Preposiciones a slots (criterio: regla pedagógica, articolate por forma); autoría de variantes nuevas donde la regla lo admita (quórum cross-vendor); slot(s) locativo(s) fijo(s) nuevos; explicación a nivel de slot (elegir la más completa + injertar matices); reset de progreso de SOLO Preposiciones vía migración 6→7; pasar validator + smoke paramétrico.

**Fuera de scope:** el modelo de datos (Phase 15, ya entregado), el motor de sampling/examen por slot (Phase 16, ya entregado), y la conversión de las otras 8 categorías (CONV-01, backlog post-v1.4 — siguen como slots de 1 variante, intactas).

**⚠️ Corrección de hecho:** ROADMAP/REQUIREMENTS dicen "57 ejercicios"; el archivo `content/exercises/preposiciones.json` tiene **52** (todos `validated`, todos `multiple-choice`). Decisión: el 57 es **stale** → se trabaja sobre los 52 reales y se **corrige el número a 52** en REQUIREMENTS.md y ROADMAP.md como parte de esta fase.

</domain>

<decisions>
## Implementation Decisions

### Criterio de agrupación en slots (PILOT-01)
- **D-17-01 (regla pedagógica):** Cada **regla distinta** = 1 slot. Los ejercicios que reformulan la **misma regla** pasan a ser variantes del mismo slot. Ej: `di`=origen-estable, `di`=posesión y `di`=materia son **tres slots distintos** (tres reglas), NO un único slot "di". Es literal lo que pide el roadmap ("los que entrenan la misma regla reformulada son ahora variantes del mismo slot") y maximiza el "no olvidar" por regla. Descartado: agrupar por preposición base (mezclaría reglas distintas dentro de un slot → el motor no re-verificaría cada regla).

### Granularidad de las preposiciones articolate (PILOT-01)
- **D-17-02 (1 slot por forma):** Las formas articolate se mantienen **separadas por forma**: `nel`, `nello`, `nella`, `nei`, `negli`, `nelle`… cada forma es su propio slot (su regla específica). Las variantes de esos slots vienen de **reformular la misma forma con otro sustantivo** del mismo artículo (autoría PILOT-02), NO de colapsar formas distintas en un slot. Descartado: "1 slot por base" (in-articolata = 6 variantes) y "por singular/plural".
- **D-17-03 (fusión de duplicados de forma):** Donde ya existen varios ejercicios entrenando la **misma forma exacta**, se fusionan como variantes de un slot. Caso confirmado: **006/013/043** (los tres `sul = su+il`) → 1 slot con 3 variantes. Caso confirmado: **011/015** (`al = a+il`) → 1 slot 2 variantes. El resto de singletons quedan slot-de-1 a la espera de variantes autoradas.

### Slot locativo fijo (PILOT-03)
- **D-17-04 (separar por forma, coherente con D-17-02):** El roadmap lista `in spiaggia / in montagna / al mare / in campagna`. Se modela como **dos slots** (no uno), respetando "1 slot por forma":
  - Slot **`in`-locativo-fijo**: `in spiaggia`, `in montagna`, `in campagna` (3 variantes).
  - Slot **`al mare`**: slot de 1 variante (forma `al` distinta).
  Descartado: "1 slot, 4 variantes" (rompería la unidad por forma de D-17-02).

### Explicación a nivel de slot (PILOT-05)
- **D-17-05 (elegir la más completa + injertar matices):** Cuando un slot fusiona varias variantes (cada una con su explicación anclada a su ejemplo), la explicación del slot = se **elige la explicación más completa/general** de las existentes como base y se le **injertan los matices únicos** de las descartadas que no estuvieran ya cubiertos (un contraste tipo "distinto de Da", un pitfall del hispanohablante). Merge **ligero** — NO reescritura total a regla generalizada (descartada por coste), NI quedarse con una sola tal cual perdiendo matices (descartada porque PILOT-05 exige cobertura preservada). El resultado pasa por **revisión del autor** (D-85). Recordatorio de modelo (D-15-02): las variantes NO llevan explicación propia; comparten la del slot.

### Autoría de variantes nuevas (PILOT-02)
- **D-17-06 (alcance "donde tenga sentido"):** Solo se autoran variantes nuevas en slots cuya regla **admite reformulación natural** (di=posesión con otro poseedor, mezzo di trasporto con otro vehículo, articolata con otro sustantivo del mismo artículo, etc.). Las **excepciones idiomáticas únicas** (`vado a casa`, `al mare`) quedan como **slot-de-1** sin forzar variantes artificiales. Piloto pragmático: demuestra el modelo sin inflar el coste cross-vendor. Coincide literal con el roadmap ("donde tenga sentido"). Descartado: "todos los slots ≥2 variantes" (coste alto + variantes artificiales en excepciones).
- **D-17-07 (quórum cross-vendor completo):** Cada variante **nueva** entra solo si pasa el quórum **cross-vendor R1-R7**: `scripts/validate-ai-pass.mjs` (Gemini + DeepSeek) **Y** una pasada de Claude (skill `gsd-validate-exercise`, Opus+Sonnet, 1-por-1, fresh context, C1-C5). **Todos** deben dar verdict "correcta". Es lo que pide el roadmap y lo que la memoria del proyecto registra como cazador de bugs que el human-verify aprueba (DeepSeek estricto en acentos, Opus indulgente). Patrón de autoría D-85: Claude propone → autor revisa → quórum. Los 52 ejercicios **existentes** ya están validados y NO se re-validan (salvo que cambien de superficie al reagrupar — ver Claude's Discretion).

### Reset de progreso de Preposiciones (PILOT-04)
- **D-17-08 (migración idempotente 6→7):** El reset se hace vía **bump `schemaVersion` 6→7** con `migrate6to7` + `hydrateV7`, reusando la cadena de migración existente (patrón D-02/D-03: dispatcher con fall-through, deep-clone defensivo `JSON.parse(JSON.stringify())`, anti-prototype-pollution T-04-02/CR-03, idempotencia, pureza). `migrate6to7` hace **exactamente**: (1) borrar `categoryProgress['preposiciones']` (resetea racha/clearedExerciseIds/dominada/lastSuccessDate → la categoría re-lazy-inicializa como no-hecha, racha 0); (2) podar las claves `exerciseStats['preposiciones-*']`. Las otras 8 categorías quedan **intactas**. `backup.js` se extiende a v7 (round-trip export/import). Automático, cero acción del autor, fires exactamente una vez. Descartado: "derivado de ids" (deja racha/dominada stale → estado inconsistente) y "botón manual" (no es automático, añade UI inexistente).

### Claude's Discretion
- **Esquema de id del slot fusionado:** qué id gana cuando varios ejercicios se fusionan en un slot (p. ej. 006/013/043 → un único id). Como el progreso de Preposiciones se resetea (D-17-08), la estabilidad de ids legacy **no importa aquí** → el planner elige el esquema (id más bajo del grupo, renumeración secuencial limpia, etc.) respetando unicidad. Coherente con D-15-09 (`exerciseStats`/cobertura keyed por id de slot).
- **Forma exacta de `migrate6to7`/`hydrateV7`:** firma, ubicación en el dispatcher, y si conviene un helper de poda por prefijo. Respetar el patrón literal de la cadena existente y la idempotencia.
- **Edge case `inFlightTest` de Preposiciones:** evaluar si un test en vuelo que toque Preposiciones necesita invalidarse en `migrate6to7` (los ids cambian) o si el default/guard existente lo cubre. Preferencia: invalidar/limpiar el inFlightTest si referencia ids de Preposiciones obsoletos.
- **Cobertura del smoke paramétrico (PILOT-05):** cómo se extiende/parametriza el smoke test para verificar la estructura final de Preposiciones (1 variante por slot, explanation por slot presente, validator verde). Respetar el patrón `node --test tests/*.test.js`.
- **Re-validación de superficie reagrupada:** si al reagrupar/fusionar cambia la **superficie** de algún ejercicio existente (prompt/options reformulados), esa superficie cuenta como variante nueva y pasa el quórum cross-vendor (D-17-07). Si solo cambia de contenedor (mismo texto movido a `variants[]`), NO requiere re-validación.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements y roadmap de esta fase
- `.planning/REQUIREMENTS.md` §Piloto Preposiciones (PILOT) — PILOT-01..05 + criterios de aceptación. **Nota: corregir "57"→"52".**
- `.planning/ROADMAP.md` §Phase 17 — goal + 5 success criteria. **Nota: corregir "57"→"52".**

### Contrato heredado (el modelo y el motor que esta fase llena)
- `.planning/phases/15-modelo-de-datos-slot-variantes-schema-migraci-n/15-CONTEXT.md` — D-15-01..09: shape slot+variantes (`variants[]` planas, `type`/`categoryIds`/`explanation` a nivel de slot), legacy=slot-de-1, cadena de migración, `exerciseStats` por id de slot. **D-15-09 difirió el reset de Preposiciones a ESTA fase.**
- `.planning/phases/16-motor-de-examen-por-slots/16-CONTEXT.md` — D-16-01..12: `variantIndex` fijado al construir sesión, default 0, "hecha"=cobertura por slot, cascada D-54 por slotId, `slotById` como contrato de entrada del motor.

### Contenido y tooling de validación
- `content/exercises/preposiciones.json` — los 52 ejercicios reales a reagrupar (campo `notes` describe la regla de cada uno; campo `validation.passes[]` = historial de quórum).
- `scripts/validate-ai-pass.mjs` — validador cross-vendor (Gemini/DeepSeek, auto-fallback 429, `--write`); claves en `.env`; pool elegible por verificación.
- skill `gsd-validate-exercise` — quórum Claude 1-por-1 (Opus+Sonnet, fresh context, C1-C5 = operacionalización de R1-R7); NUNCA batched.
- `scripts/run-validation-pilot.mjs` / `scripts/run-validation-271.mjs` — reporters/enforcers de gate de validación (patrón post-processing, no orquestan subagents).
- `scripts/assert-avere-prefix-unchanged.mjs` — snapshot append-only de avere (D-88); debe seguir verde (no se toca Preposiciones aquí, pero confirma que la migración no afecta otras categorías).

### Código que esta fase modifica/extiende
- `src/data/storage.js` — cadena de migración (`migrateNtoM`/`hydrateVN`, dispatcher `migrate()`, `CURRENT_SCHEMA_VERSION`, `blankState`). Aquí se añade `migrate6to7` + `hydrateV7` + bump a 7. Estado: `categoryProgress[catId]` (racha/clearedExerciseIds/dominada/lastSuccessDate, lazy-init D-47), `exerciseStats[id]`.
- `src/data/backup.js` — extender envoltura a v7 (round-trip).
- `src/data/schema-validator.js` / `src/data/content-loader.js` — validan/normalizan el nuevo shape slot+variantes de Preposiciones (ya soportan slot+variantes desde Phase 15; aquí lo ejercita contenido real).

### Reglas de autoría (memoria del proyecto)
- R1-R7 reglas estrictas de alta de ejercicios (no leak en prompt, no refs #NNN en explanations, match con 3+ valores distintos, verificar artículo/noun italiano).
- Al resolver disputed: calidad > tokens, incluir traducción española en prompt para desambiguar doble-validez, ambas IAs deben dar correcta.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Cadena `migrateNtoM` + `hydrateVN` (storage.js):** plantilla literal a copiar para `migrate6to7`/`hydrateV7` (deep-clone defensivo, idempotencia, dispatcher fall-through). El reset de Preposiciones es una poda quirúrgica dentro de ese patrón.
- **`slotById` + normalización legacy→slot (content-loader.js, Phase 15):** el loader ya acepta `payload` (legacy) XOR `variants[]`; el contenido reagrupado de Preposiciones fluye por el mismo path sin cambios de loader.
- **`PAYLOAD_VALIDATORS` (schema-validator.js):** validan la superficie de cada variante (multiple-choice). El validador slot+variantes de Phase 15 ya cubre el shape; aquí lo ejercita contenido real.
- **`scripts/validate-ai-pass.mjs` + skill `gsd-validate-exercise`:** pipeline de quórum cross-vendor listo; el `--write` muta `validation.passes[]` in-place.

### Established Patterns
- **Migración en cadena por schemaVersion (idempotente, one-shot por versión):** la herramienta correcta para el reset PILOT-04. Nunca perder estado del autor de OTRAS categorías; versión desconocida → warn + blankState.
- **`exerciseStats` keyed por id de slot** (peso `1/(1+min(timesShown,10))`): al podar `preposiciones-*`, el sampler re-lazy-inicializa pesos al re-hacer la categoría.
- **"hecha" = cobertura total por id de slot** (`clearedExerciseIds.every`): tras borrar `categoryProgress['preposiciones']`, la categoría re-lazy-inicializa como no-hecha.
- **Validación cross-vendor 1-por-1, fresh context** (memoria): NUNCA batched; complementar con scan de acentos donde Opus es indulgente.

### Integration Points
- `loadContent → slotById` es el borde donde el motor de Phase 16 consume Preposiciones reagrupado. El shape que produzca esta fase debe ser válido para ese contrato (1 variante elegida por slot).
- `migrate()` corre al bootear el state; `migrate6to7` se engancha al final de la cadena, antes de `hydrateV7`.

</code_context>

<specifics>
## Specific Ideas

- El autor eligió de forma consistente la opción **purista por forma**: regla pedagógica como criterio (D-17-01), articolate y locativos separados por forma (D-17-02, D-17-04) incluso a costa de romper la agrupación "natural" de `in spiaggia/al mare`. La identidad del slot = la **regla/forma exacta**; las variantes nacen de reformular esa MISMA regla, no de colapsar reglas distintas.
- El autor priorizó **máxima garantía sobre coste** en validación (cross-vendor completo, D-17-07) pero **pragmatismo sobre exhaustividad** en alcance (variantes solo "donde tenga sentido", D-17-06) y en explicaciones (elegir+injertar en vez de reescribir, D-17-05). Patrón: rigor en la verificación, mínimo esfuerzo redaccional reusando lo validado.
- Reset vía la herramienta one-shot que YA existe (cadena de migración) en vez de inventar mecanismo nuevo — coherente con la filosofía "cambios mínimos" del autor.

</specifics>

<deferred>
## Deferred Ideas

- **Reescritura de explicaciones a regla generalizada** (independizar la explicación del ejemplo concreto de cada variante) — considerada y descartada para este piloto por coste de redacción; se opta por elegir-la-más-completa + injertar matices (D-17-05). Revisable si en uso real una explicación anclada a un ejemplo confunde al estudiar otra variante.
- **Articolate como 1 slot por base** (in-articolata = 6 variantes, máximo dolor anti-memorización) — descartada (D-17-02) a favor de 1-slot-por-forma. Revisable en un milestone futuro si el autor quiere endurecer.
- **Conversión del resto de categorías a slots** (CONV-01) — backlog post-v1.4; siguen como slots de 1 variante.

### Reviewed Todos (not folded)
None — discusión dentro del scope de la fase.

</deferred>

---

*Phase: 17-piloto-preposiciones-contenido*
*Context gathered: 2026-06-03*
