# Phase 11: Articoli - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar **Articoli** como 8ª categoría de contenido (una sola categoría que combina articoli determinativi + indeterminativi). Alcance: temario exhaustivo (primer entregable) → ejercicios que cubren cada celda → ~6 bridges multi-categoría → explanations curadas → validación por quórum ≥2 IAs.

El **motor está hecho** (re-verificación, sampler, cascada D-54, 3 tipos de ejercicio, schema validator, Modo Examen, infra editorial v1.1). Esta fase añade **solo contenido** (JSON + entry en categories.json + explanations); NO modifica engine, sampler, cascada, validador ni UI.

Capacidades nuevas (más cruces, casos A2, Partitivos) → otras fases.
</domain>

<decisions>
## Implementation Decisions

### Alcance del temario (ART-02, ART-03/04/05)
- **D-01:** Articoli = categoría **COMPLETA y autocontenida**. Cubre TODO el sistema: determinativi (`il/lo/l'/la/i/gli/le`) + indeterminativi (`un/uno/una/un'`), **incluyendo los básicos `il/la/l'`** aunque génnumero los toque de pasada — el solape es deseable (refuerza la re-verificación, core value).
- **D-02:** Disparadores fonéticos estándar en alcance: consonante simple (`il/la` → `i/le`), s+consonante, z, gn, ps, pn, x, y/semiconsonante, vocal (elisión `l'`/`un'`). Para masc: `il` vs `lo` vs `l'` (y plurales `i` vs `gli`); fem: `la` vs `l'` (plural `le` siempre); indet masc `un` vs `uno`, indet fem `una` vs `un'`.
- **D-03:** **FUERA de alcance** (deferred a A2 si emerge dolor): formas raras/literarias (`gli dei`, `lo iato`) y disparadores variables/discutibles (`lo pneumatico` vs `il pneumatico`, `lo yogurt`/`lo iogurt`).
- **D-04:** Trampas canónicas obligatorias (cada una ≥1 ejercicio): `lo zio`, `lo studente`/`uno studente`, `lo psicologo` (ps), `lo zaino`/`uno zaino` (z), `gli gnocchi` (gn plural), `l'amico`/`l'amica` (elisión en ambos géneros), `un'amica` (apóstrofo SOLO femenino) vs `un amico` (sin apóstrofo masculino).

### Mezcla de tipos (ART-03/04/05)
- **D-05:** **Columna vertebral = multiple-choice** (`Ho visto ___ studente.` → opciones `il/lo/l'/la`). Rápido, coherente con las demás categorías, grading por índice. La trampa está en el disparador fonético, no en la raíz.
- **D-06:** **Bloque de `match` articolo↔sustantivo** agrupando varios nombres bajo su disparador (duplicados textuales en columna derecha permitidos — D-66). Va **MÁS PROFUNDO que el match de génnumero**: incluye `lo/gli/uno` + plurales + trampas, NO re-hace el `il/la/l'` singular básico que génnumero ya cubre.
- **D-07:** **word-buttons mínimo o nulo** — montar el sintagma completo (artículo+nombre+adjetivo) solapa con la concordancia que ya ejercita génnumero. Si se usa, casos donde el artículo es claramente el foco.

### Bridges multi-categoría (ART-06)
- **D-08:** **~6 bridges**, todos `multiple-choice` con `categoryIds: ["articoli", X]`, patrón avere-300...
- **D-09:** **Dos categorías cruzadas** (las elegidas en init): `articoli↔genero-numero` (~3: artículo correcto + plural/género, p.ej. "le/i + sustantivo") y `articoli↔sustantivos-irregulares` (~3: artículo de un nombre irregular — `lo zio→gli zii`, `il braccio→le braccia`, `l'uovo→le uova`). Modelo concreto: avere-302 "Lui ha due braccia stanche".
- **D-10:** **NO abrir a más cruces** (profesiones `l'avvocato`/`lo psicologo`, preposiciones `nello zaino`) en v1.2 — aunque articoli combina naturalmente con casi todo, se acota a las 2 categorías. Más cruces → deferred.
- **D-11:** Fallar un bridge resetea **ambas** categorías al instante (cascada D-54 heredada), visible en el resumen post-sesión.

### Volumen / densidad (toda la fase)
- **D-12:** Categoría **DENSA (~45-55 ejercicios**, tipo Preposiciones/Profesiones). Cada disparador con varios contextos léxicos. Coherente con el alcance "completo".
- **D-13:** El número exacto lo **determina el temario** (ART-02): cada celda con ≥1 ejercicio, disparadores frecuentes con varios contextos. ~45-55 es target, no número fijo.

### Flujo de la fase (locked desde REQUIREMENTS/ROADMAP)
- **D-14:** **Temario exhaustivo = PRIMER entregable** (ART-02), ANTES de cualquier ejercicio — orden verificable en git. Documento con todas las celdas (forma × disparador × género/número × trampa) que sirve de checklist de cobertura para los ejercicios.
- **D-15:** Tras ejercicios → explanations curadas (canon español acentuado + italianismos preservados + apóstrofes ASCII U+0027 + plain text) → **validación por quórum ≥2 IAs** (`gsd-validate-batch`, R1-R7→C1-C5) → `status: validated` con ≥2 `by` distintos en `passes[]`.

### Claude's Discretion
- **Nombre/orden en categories.json:** sugerencia `{ id: "articoli", name: "Articoli (artículos)", order: 8 }` (patrón parentético de las demás categorías). A confirmar en ejecución.
- **Esquema de IDs:** `articoli-001..` para base + `articoli-300..` para bridges (espejo exacto de avere-300../essere-300..).
- **Estrategia de distractoras** en multiple-choice: las otras formas de artículo plausibles (`il/lo/l'/la` para masc sing; `i/gli` para masc plural; `un/uno` para indet masc). El disparador fonético es la dificultad real.
- **Reparto det vs indet** dentro de la categoría: los determinativi son más numerosos (tienen plurales `i/gli/le`); los indeterminativi (`un/uno/una/un'`) ~10-15 ejercicios. Claude reparte según el temario.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning (alcance, criterios, decisiones heredadas)
- `.planning/ROADMAP.md` §Phase 11 — goal + 5 success criteria (temario-antes-de-ejercicios, home row + Examen, cascada bridges, explanations, reporter exit 0)
- `.planning/REQUIREMENTS.md` §Articoli — ART-01..08 (la definición de "done")
- `.planning/PROJECT.md` §Key Decisions — DESIGN RULE de `match`, patrón multi-cat, canon de explanations, grading case-insensitive vs índice (decisiones LOCKED, no re-litigar)

### Patrones de contenido (modelos a imitar / diferenciar)
- `content/categories.json` — patrón de entry de categoría (id/name/order)
- `content/exercises/genero-numero.json` — YA tiene match `sustantivo↔artículo definido singular` (il/la/l') + toques de artículo: **diferenciar** (Articoli va más profundo: lo/gli/indet/plurales/trampas)
- `content/exercises/avere.json` §avere-300..305 — patrón de bridge multi-cat (multiple-choice, `categoryIds:[A,B]`); avere-302 = modelo para articoli↔sustantivos-irregulares

### Schema / validación / integración
- `src/data/schema-validator.js` — `PAYLOAD_VALIDATORS` dispatch por tipo (constraints de cada payload) + `validateValidationShape`
- `src/data/validation-state.js` — `deriveStatus(passes)` sticky-disputed
- `scripts/run-validation-271.mjs` §`CATEGORIES[]` (línea ~68) + `TOTAL_EXPECTED` (línea ~78) — **punto de integración**: añadir entry + bump del total
- `tests/exercise-types.test.js` §`CATEGORIES_WITH_EXPLANATIONS` (línea ~1265) — **punto de integración**: +1 línea {file, expected}

### Reglas editoriales
- `.claude/skills/gsd-validate-batch/SKILL.md` — orquestador de validación por categoría (4 caminos disputed)
- `.claude/skills/gsd-validate-exercise/SKILL.md` — validación 1-por-1 quórum Opus+Sonnet
- `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — R1-R7 → C1-C5 (operacionalización)
- Memoria `~/.claude/projects/-home-vcompanyb-italian-course/memory/exercise_authoring_rules.md` (R1-R7) + `feedback_disputed_resolution.md` (cómo resolver disputed)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **3 tipos de ejercicio listos** (multiple-choice / word-buttons / match) — cero código nuevo de tipo.
- **`match` soporta duplicados textuales en columna derecha** (D-66, grading por consumo de índice) — EXACTAMENTE lo que necesita articolo↔sustantivo (varios nombres comparten `lo`).
- **`categoriesForDisplay` (src/screens/app.js ~2141)** mapea `content.categories` → añadir la entry a categories.json **auto-surfacea** la fila del home + botón Examen (`examenEnabled = totalCount > 0`). **Cero código UI.**

### Established Patterns
- **Bridge** = `multiple-choice` con `categoryIds:[A,B]` (avere-300..305) — 6 ejemplos reales a imitar.
- **Canon explanations:** español acentuado + italianismos preservados (D-135/D-137) + apóstrofes ASCII + plain text (sin markdown).
- **Grading:** case-insensitive (`toLowerCase + NFC`) en word-buttons/match; por índice en multiple-choice.
- **DESIGN RULE:** `match` solo si el pareo NO es derivable por raíz compartida — `articolo↔sustantivo` cumple (el artículo depende de la fonética inicial del nombre, no de su raíz). singular↔plural / masc↔fem con raíz compartida → multiple-choice con distractoras.

### Integration Points (todo lo que toca un alta de categoría — sin engine)
1. `content/categories.json`: añadir `{ id:"articoli", name:"Articoli (artículos)", order:8 }`
2. `content/exercises/articoli.json`: archivo nuevo (base `articoli-001..` + bridges `articoli-300..`)
3. `scripts/run-validation-271.mjs`: añadir a `CATEGORIES[]` + subir `TOTAL_EXPECTED`
4. `tests/exercise-types.test.js`: +1 línea en `CATEGORIES_WITH_EXPLANATIONS`

</code_context>

<specifics>
## Specific Ideas

- **Match agrupado por disparador** (shape confirmado en génnumero): izquierda = nombres, derecha = artículos con duplicados (`studente→lo`, `zio→lo`, `psicologo→lo`, `libro→il`, `amico→l'`). Articoli amplía a `lo/gli/uno` + plurales.
- **Modelo de bridge irregular:** avere-302 "Lui ha due braccia stanche" → para articoli: "___ braccia sono stanche" cruzando articoli↔sustantivos-irregulares (le + plural irregular braccia).
- **Trampas obligatorias** (D-04): `lo zio`, `uno studente`, `lo psicologo`, `gli gnocchi`, `l'amico`/`l'amica`, `un'amica` vs `un amico`.
- Espejo pedagógico a explotar: `il→lo→l'` (det masc) refleja `un→uno→un'`... (indet) — mismo disparador, distinta serie. Un bloque de ejercicios puede contrastarlos.

</specifics>

<deferred>
## Deferred Ideas

- **Bridges Articoli↔profesiones / ↔preposiciones** (`l'avvocato`, `nello zaino`) — naturales pero fuera de v1.2 para acotar; candidatos a fase posterior.
- **Casos variables/raros A2:** `lo pneumatico` vs `il pneumatico`, `lo yogurt`/`lo iogurt`, `gli dei` (plural irregular de `il dio`), `lo iato` — añadir como trampas avanzadas si emerge dolor real en uso.
- **word-buttons pesado** (concordancia completa artículo+nombre+adjetivo) — solapa con génnumero; no en esta fase.
- **PART-X1** (bridges de Partitivos) — Phase 12+.
- **None de estas se pierde:** capturadas aquí + en PROJECT.md §Future / ROADMAP §Backlog Phase 13+.

</deferred>

---

*Phase: 11-articoli*
*Context gathered: 2026-05-27*
