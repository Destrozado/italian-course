# Phase 12: Partitivos - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar **Partitivos** como 9ª categoría de contenido. Alcance: temario exhaustivo del partitivo (primer entregable, PART-02) → ejercicios que cubren cada forma y alternativa → ejercicios de distinción función partitiva vs preposizione articolata (PART-05) → explanations curadas → validación por quórum ≥2 IAs distintas.

El **motor está hecho** (re-verificación, sampler, cascada D-54, 3 tipos de ejercicio, schema validator, Modo Examen, infra editorial v1.1 + infra cross-vendor de Phase 11). Esta fase añade **solo contenido** (JSON + entry en categories.json + explanations); NO modifica engine, sampler, cascada, validador de schema ni UI.

A diferencia de Articoli (Phase 11), **Partitivos NO lleva bridges multi-categoría** — PART-X1 está diferido a v1.3+ para acotar v1.2. Capacidades nuevas (bridges, casos A2, más categorías) → otras fases.
</domain>

<decisions>
## Implementation Decisions

### Eje semántico y alcance del temario (PART-02/03/04)
- **D-01:** El eje estructural del temario es el **contraste de las dos caras semánticas del partitivo**: INCONTABLE singular (`del/dello/della/dell'` + `un po' di` = "algo de") vs CONTABLE plural (`dei/degli/delle` + `alcuni/alcune` = "unos/algunos"). Bloques paralelos con ejercicios que los contrastan ("Ho comprato ___ pane" vs "Ho comprato ___ mele"). Es el corazón semántico del partitivo; el espejo refuerza la re-verificación (mismo espíritu que `il→lo→l'` en Articoli, D-01 de Phase 11).
- **D-02:** **Mini-bloque de omisión** (PART-02): pocos ejercicios que contrastan USAR el partitivo (afirmativa: "Compro del pane") vs OMITIRLO (negativa: "Non compro pane", nunca "del pane"), con opción de respuesta `∅ / sin partitivo`. Fija la asimetría afirmativa↔negativa. **Matiz pedagógico clave:** para un hispanohablante la omisión en negativa es intuitiva (= español "no tengo pan"); lo realmente ajeno es USAR el partitivo en afirmativa donde el español no pone nada — la explanation debe insistir ahí.
- **D-03:** Las alternativas (`alcuni/alcune`, `qualche`, `un po' di`) se tratan como **trampa por restricción gramatical**, no por sinonimia: cada una con ejercicios que testean SU regla — `qualche` + SIEMPRE singular ("qualche libro", nunca "qualche libri"), `un po' di` + SOLO incontable ("un po' di pane", no "un po' di libri"), `alcuni/alcune` SOLO plural. **Esto blinda la doble-validez de raíz**: como "dei libri ≈ alcuni libri ≈ qualche libro" son casi sinónimos, dejar elegir libremente entre ellos daría >1 respuesta correcta (mortal para multiple-choice por índice). Forzar la restricción gramatical garantiza una sola respuesta correcta.
- **D-04:** Formas en alcance (PART-03): determinativas del partitivo `del/dello/della/dell'/dei/degli/delle` (= `di` + artículo determinativo, así que **heredan los mismos disparadores fonéticos que Articoli**: `del` cons, `dello` s+cons/z/gn/ps/x, `della` fem cons, `dell'` vocal, `dei` masc plural cons, `degli` masc plural s+cons/z/vocal, `delle` fem plural) + alternativas `alcuni/alcune/qualche/un po' di` (PART-04). Explotar la derivación `del = di + il` como puente pedagógico con Articoli (recién construido).

### Distinción partitivo vs preposizione articolata (PART-05)
- **D-05:** Se ejercita con **ejercicios de clasificación de función** (multiple-choice meta-lingüístico): dada una frase con `del/della/...`, el autor elige "¿partitivo (algo de) o preposición (de el)?". Ataca de frente la confusión, grading por índice (una sola respuesta). Modelos: "Ho mangiato del pane" → partitivo; "Il sapore del caffè" → preposición.
- **D-06:** Restricciones derivadas de D-05 (locked):
  - Solo formas **`di`-based** (`del/dello/della/dell'/dei/degli/delle`) — son las únicas que solapan en forma con la preposizione articolata. `nel/sul/al/dal/col...` NUNCA son partitivo y quedan fuera de estos ejercicios.
  - `categoryIds: ["partitivos"]` — **sin bridge** a Preposiciones (PART-X1 diferido). El ejercicio referencia el uso prepositivo como contraste pero NO resetea la categoría Preposiciones.
  - La **explanation deja claro que la función prepositiva vive en la categoría Preposiciones, no aquí** (ROADMAP criterio 3). Diferenciar de lo que ya cubre `content/exercises/preposiciones.json` (preposizioni articolate) — no duplicar.

### Tipos y volumen de ejercicios
- **D-07:** Mezcla de tipos = **calcar el patrón de Articoli**: `multiple-choice` como columna vertebral (elegir `del/dello/della/dell'/dei/degli/delle` por disparador fonético + las alternativas por restricción) + 1 bloque `match` + el bloque de clasificación PART-05. `word-buttons` casi nulo (montar la frase completa solaparía con la concordancia que ya ejercita género-número; usar solo si el partitivo es claramente el foco).
- **D-08:** El bloque `match` es **sustantivo↔forma partitiva** (`pane→del`, `zucchero→dello`, `acqua→dell'`, `studenti→degli`, `mele→delle`, `libri→dei`). **Cumple la DESIGN RULE** (el pareo depende del género + disparador fonético + número del sustantivo, NO de su raíz compartida → no derivable por root match). Duplicados textuales en columna derecha permitidos (D-66, varios sustantivos comparten `del`/`degli`).
- **D-09:** Densidad target **~30-40 ejercicios** (categoría acotada, tipo `sustantivos-irregulares` 31 / `verbos-movimiento` 37). Razón: NO hay bridges + el inventario de formas (7 del-formas + 3-4 alternativas) es menor que el sistema det+indet completo de Articoli (56). El **conteo exacto lo deriva el temario** (D-13 heredado de Phase 11): cada celda del temario ≥1 ejercicio, disparadores frecuentes con varios contextos léxicos.

### Validación por quórum (PART-07)
- **D-10:** Pool del quórum = **DeepSeek Flash + Sonnet 4.6** (cross-vendor real: DeepSeek + Anthropic). Decisión del autor tras descartar DeepSeek Flash + DeepSeek Pro: dos modelos del MISMO vendor comparten linaje/tokenizer → puntos ciegos compartidos, y el catch de 8 bugs en Articoli (Phase 11) vino precisamente de la **diversidad de vendor** (DeepSeek estricto ↔ Opus indulgente). Distinto del pool de P11 (DeepSeek Flash + Opus 4.7) → sigue siendo experimental pero conserva la diversidad de criterio. `by` esperados: `deepseek-v4-flash` + `claude-sonnet-4-6`.
- **D-11:** El **canon ortográfico de acentos entra como REGLA EXPLÍCITA en el prompt de validación**, NO como un scan posterior ni a discreción de la IA. Ambas IAs verifican siempre que las explanations cumplen D-135 (español acentuado á/é/í/ó/ú + ñ RAE; italianismos citados preservan ortografía italiana). Refina la nota previa de memoria "complementar con scan de acentos": el detalle de acentos se recuerda en las reglas, así no se les escapa.
- **D-12:** **Invariante del campo `by[]`:** debe incluir la **versión/tier del modelo**. Dos tiers del mismo vendor (DeepSeek Flash vs Pro, Gemini Flash vs Pro) se guardan como claves DISTINTAS, NUNCA bajo una clave genérica de vendor (`"deepseek"`). Así el invariante "≥2 `by` distintos" no se puede burlar con dos tiers del mismo modelo bajo una sola clave. La convención actual ya cumple (`deepseek-v4-flash`, `claude-opus-4-7`); plan-time debe verificarlo. Para Phase 12 (Flash + Sonnet) se cumple naturalmente (vendors y claves distintas).

### Flujo de la fase (locked desde REQUIREMENTS/ROADMAP + precedente Phase 11)
- **D-13:** **Temario exhaustivo = PRIMER entregable** (PART-02), ANTES de cualquier ejercicio — orden verificable en git (no debe existir `content/exercises/partitivos.json` cuando se commitea el temario). Materializado como fichero markdown en la carpeta de la fase → `12-TEMARIO-PARTITIVOS.md` (precedente: `11-TEMARIO-ARTICOLI.md`). El temario es el checklist de cobertura: cada celda (forma × disparador × contable/incontable × alternativa × omisión × distinción) mapea a ≥1 ejercicio.
- **D-14:** **SIN bridges multi-categoría** (PART-X1 diferido). IDs `partitivos-001..` sin serie `-300..` (a diferencia de `articoli-300..`). Esto acota v1.2.
- **D-15:** Tras ejercicios → explanations curadas (canon heredado: español acentuado + italianismos preservados + apóstrofes ASCII U+0027 + plain text sin markdown) → **validación por quórum** (D-10/D-11/D-12) → `status: validated` con ≥2 `by` distintos en `passes[]`.

### Claude's Discretion
- **Nombre/orden en categories.json:** sugerencia `{ id: "partitivos", name: "Partitivos", order: 9 }` (o con gloss parentético tipo `"Partitivos (partitivo)"` siguiendo el patrón de las demás). A confirmar en ejecución.
- **Esquema de IDs:** `partitivos-001..` (sin serie de bridges).
- **Estrategia de distractoras** en multiple-choice de formas: las otras formas del partitivo plausibles (`del/dello/della` para incontable masc/fem; `dei/degli/delle` para contable plural). El disparador fonético + la distinción contable/incontable son la dificultad real.
- **Reparto** del-formas vs alternativas vs clasificación PART-05 vs mini-bloque omisión: Claude reparte según el temario para llegar a ~30-40 cubriendo cada celda.
- **Ejemplos léxicos concretos** (pane, acqua, zucchero, carne, vino, latte para incontables; libri, mele, studenti, amici, case para contables): Claude elige, preservando ortografía italiana.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Planning (alcance, criterios, decisiones heredadas)
- `.planning/ROADMAP.md` §Phase 12 — goal + 5 success criteria (temario-antes-de-ejercicios, home row + Examen, distinción partitivo/preposición, explanations, reporter exit 0)
- `.planning/REQUIREMENTS.md` §Partitivos — PART-01..07 (la definición de "done") + §Out of Scope (no duplicar función prepositiva; no formas ultra-raras A2)
- `.planning/PROJECT.md` §Key Decisions — DESIGN RULE de `match`, canon de explanations, grading case-insensitive vs índice, distinción partitivo/preposición (decisiones LOCKED, no re-litigar)
- `.planning/phases/11-articoli/11-CONTEXT.md` — **el patrón a calcar**: estructura de decisiones de una categoría nueva (temario→ejercicios→explanations→validación), discreciones equivalentes
- `.planning/phases/11-articoli/11-TEMARIO-ARTICOLI.md` — **modelo del documento de temario** (tablas forma×disparador, trampas canónicas, conteo derivado); el temario de Partitivos imita esta estructura

### Patrones de contenido (modelos a imitar / diferenciar)
- `content/categories.json` — patrón de entry de categoría (id/name/order); añadir `partitivos` order 9
- `content/exercises/articoli.json` — analog más reciente: formas elegidas por disparador fonético, shape de `validation` (`{status, passes:[{by}]}`), bloque match, explanations curadas. **El partitivo hereda exactamente los mismos disparadores** (del=di+il, etc.)
- `content/exercises/preposiciones.json` — contiene las preposizioni articolate (`del/della` función prepositiva). **DIFERENCIAR** (PART-05): Partitivos clasifica/contrasta esa función pero NO la re-enseña ni la resetea
- `content/exercises/avere.json` §avere-300..305 — patrón de bridge multi-cat. **NO aplicar en Partitivos** (sin bridges, D-14) — referencia solo para entender qué NO se hace aquí

### Schema / validación / integración (sin engine)
- `src/data/schema-validator.js` — `PAYLOAD_VALIDATORS` dispatch por tipo + `validateValidationShape`
- `src/data/validation-state.js` — `deriveStatus(passes)` sticky-disputed
- `scripts/run-validation-271.mjs` §`CATEGORIES[]` + `TOTAL_EXPECTED` (=328 actual) — **punto de integración**: añadir entry `partitivos` + subir `TOTAL_EXPECTED` 328→328+N
- `tests/exercise-types.test.js` §`CATEGORIES_WITH_EXPLANATIONS` (línea ~1265) — **punto de integración**: +1 línea `{file:'content/exercises/partitivos.json', expected:N}`

### Reglas editoriales y quórum
- `scripts/validate-ai-pass.mjs` — validador multi-provider de Phase 11 (DeepSeek/Gemini, auto-fallback en 429, `--write`). El pase DeepSeek Flash sale de aquí; verificar que el `by[]` registra el model-id completo (D-12)
- `docs/VALIDACION-QUORUM.md` — doc del flujo cross-vendor introducido en Phase 11
- `.claude/skills/gsd-validate-batch/SKILL.md` — orquestador de validación por categoría (4 caminos disputed); el pase Sonnet va por Task subagent (`model: sonnet`)
- `.claude/skills/gsd-validate-exercise/SKILL.md` — validación 1-por-1 por quórum
- `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — R1-R7 → C1-C5. **El canon de acentos (D-135) debe figurar como regla explícita aquí/en el prompt** (D-11)
- Memoria `~/.claude/projects/-home-vcompanyb-italian-course/memory/`: `exercise_authoring_rules.md` (R1-R7), `feedback_disputed_resolution.md` (cómo resolver disputed), `multi_vendor_quorum_validator.md` (uso de validate-ai-pass.mjs), `feedback_cross_vendor_catches_bugs.md` (por qué cross-vendor)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **3 tipos de ejercicio listos** (multiple-choice / word-buttons / match) — cero código nuevo de tipo. La clasificación PART-05 es un multiple-choice normal (prompt = frase, opciones = "partitivo"/"preposición", grading por índice).
- **`match` soporta duplicados textuales en columna derecha** (D-66, grading por consumo de índice) — exactamente lo que necesita sustantivo↔forma partitiva (varios nombres comparten `del`/`degli`/`delle`).
- **`categoriesForDisplay` (src/screens/app.js ~2141)** mapea `content.categories` → añadir la entry a `categories.json` **auto-surfacea** la fila del home + botón Examen (`examenEnabled = totalCount > 0`). **Cero código UI** (PART-01 se satisface con el alta en categories.json).
- **Infra cross-vendor de Phase 11** (`scripts/validate-ai-pass.mjs` + `docs/VALIDACION-QUORUM.md`) reutilizable para el pase DeepSeek Flash.

### Established Patterns
- **Canon explanations:** español acentuado + italianismos preservados (D-135/D-137) + apóstrofes ASCII U+0027 + plain text (sin markdown).
- **Grading:** case-insensitive (`toLowerCase + NFC`) en word-buttons/match; por índice en multiple-choice.
- **DESIGN RULE:** `match` solo si el pareo NO es derivable por raíz compartida — `sustantivo↔forma partitiva` cumple (depende de género + disparador fonético + número, no de raíz).
- **Validation shape:** `{ status, passes: [{ by, ... }] }`; `deriveStatus` → `validated` con ≥2 `by` distintos.
- **Temario-como-doc-markdown** en la carpeta de la fase (precedente `11-TEMARIO-ARTICOLI.md`), commiteado ANTES del JSON de ejercicios.

### Integration Points (todo lo que toca un alta de categoría — sin engine)
1. `content/categories.json`: añadir `{ id:"partitivos", name:"Partitivos", order:9 }`
2. `content/exercises/partitivos.json`: archivo nuevo (base `partitivos-001..`, sin bridges)
3. `scripts/run-validation-271.mjs`: añadir a `CATEGORIES[]` + subir `TOTAL_EXPECTED` 328→328+N (lockstep con el conteo real)
4. `tests/exercise-types.test.js`: +1 línea en `CATEGORIES_WITH_EXPLANATIONS`
5. `scripts/validate-ai-pass.mjs`: verificar registro de `by[]` con model-id completo (D-12); el pase Sonnet va por Task subagent, no por este script

</code_context>

<specifics>
## Specific Ideas

- **Derivación `del = di + il`** como puente con Articoli (recién construido): el partitivo NO es una forma nueva que memorizar, es `di` + el artículo determinativo que el autor ya domina. Explotar en explanations y quizá en un ejercicio-ancla.
- **Pares mínimos de clasificación** (PART-05): "Ho mangiato del pane" [partitivo] vs "Il sapore del caffè" / "La casa del nonno" [preposición]. Misma forma, distinta función.
- **Contraste eje incontable/contable:** "Vorrei ___ acqua" (dell' / un po' di) vs "Vorrei ___ mele" (delle / alcune).
- **Trampas obligatorias del temario:** `qualche` + singular (qualche libro, NUNCA libri); `un po' di` + incontable (no "un po' di libri"); `alcuni/alcune` solo plural; elisión `dell'` ante vocal (dell'acqua) y `degli` ante vocal/s+cons (degli studenti, degli amici); omisión en negativa (Non ho pane).
- **Opción `∅ / sin partitivo`** como respuesta válida en el mini-bloque de omisión (negativas).

</specifics>

<deferred>
## Deferred Ideas

- **PART-X1 — bridges Partitivos↔género-número / ↔sustantivos-irregulares** — diferido a v1.3+ para acotar v1.2 (REQUIREMENTS.md §Future, STATE.md). Partitivos cruza naturalmente con género/número, pero esta fase queda sin bridges.
- **Pool DeepSeek Flash + DeepSeek Pro** — considerado y descartado en esta discusión: dos tiers del mismo vendor comparten puntos ciegos; el valor del quórum está en la diversidad de vendor. Si en el futuro se quiere probar capability-diversity same-vendor, el invariante D-12 (`by` con tier) lo permite registrar correctamente.
- **Formas/casos A2 raros** (`degli dei`, literarios) — fuera de v1.2 (REQUIREMENTS.md §Out of Scope), como en Articoli D-03.
- **Ninguna de estas se pierde:** capturadas aquí + en PROJECT.md §Future / ROADMAP §Backlog Phase 13+.

</deferred>

---

*Phase: 12-partitivos*
*Context gathered: 2026-05-28*
