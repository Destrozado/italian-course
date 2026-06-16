# Phase 30: Alta de `presente-regolare` (registro + slots de regla + variantes por quórum) - Context

**Gathered:** 2026-06-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Esta fase da de alta la **10ª categoría** `presente-regolare` (presente indicativo de verbos regulares) **nacida directamente en formato slot+variantes unificado (CONV-01)**:

1. Registro en `content/categories.json` con `order: 10` (PRES-01) → carga en boot y usable en home / picker / Repaso 20 / Examen exactamente como las otras 9 (Examen de SOLO `presente-regolare` con 1 clic).
2. Materialización de `content/exercises/presente-regolare.json` con los **slots de regla** que cubren los tres grupos + la sub-regla trampa `-isc-` + los ortográficos (PRES-02), cada slot con ≥2 variantes intercambiables (PRES-03) y `explanation` curada a nivel de slot en canon español acentuado plain-text (PRES-05).
3. Autoría + validación por **quórum cross-vendor R1-R7** de TODAS las variantes nuevas (`status: validated`; `disputed` → autor-oráculo) (PRES-04). Match condicional D-04 (PRES-06).

**Brownfield puro:** el motor v1.4 (cascada D-54, sampler por slot, slot-engine, render) NO se toca — solo contenido + registro. Análogo de referencia: v1.2 (alta Articoli/Partitivi) + patrón slot v1.5/v1.6 (Avere/Essere).

**FUERA de scope (es Phase 31):** cruces multi-cat `presente-regolare`↔avere/essere, sync de counts hardcoded + `TOTAL_EXPECTED` (`183 → 183 + 6`), +1 entrada en el smoke paramétrico. Esta fase debe DEJAR el JSON con el conteo de slots definitivo para que Phase 31 lo consuma.

</domain>

<decisions>
## Implementation Decisions

### A — Eje de variación dentro de cada slot de regla
- **D-30-01:** Las ≥2 variantes intercambiables de cada slot varían **verbo + persona simultáneamente** (var1: `io` + verbo A; var2: `tu` + verbo B; etc.). Re-hacer la categoría tras un fallo presenta léxico nuevo Y persona nueva del MISMO slot de regla → obliga a APLICAR la regla de terminación a un lexema fresco en vez de recordar una tabla memorizada. Es la implementación concreta de "matar la memorización por palabra" (PRES-03 / core value).

### B — Granularidad y conteo de slots
- **D-30-02:** **Exactamente 6 slots de regla** (N=6). Unidad de slot = UNA regla, no la persona:
  1. `-are` (parlare, lavorare, studiare…)
  2. `-ere` (temere, prendere, scrivere…)
  3. `-ire` simple (dormire, partire, aprire — verbos nombrados en ROADMAP SC-2)
  4. `-ire` con `-isc-` (finire, capire, preferire, pulire — verbos nombrados)
  5. ortográficos **velares** `-care/-gare` (giocare→giochi, pagare→paghi): UN slot, una sola regla (añadir `h` para conservar el sonido velar ante `-i`)
  6. ortográficos **palatales** `-ciare/-giare` (cominciare→cominci, mangiare→mangi): UN slot, una sola regla (perder la `i` átona ante `-i`)
  - `-care` y `-gare` NO se separan (regla idéntica); `-ciare`/`-giare` tampoco. **N=6 es el número que Phase 31 sincronizará a los 3 hardcodes + `TOTAL_EXPECTED` (`183 → 189`).** El conteo REAL se lee del JSON final, no de esta estimación.
- **D-30-03:** **Garantizar las 6 personas (io/tu/lui/noi/voi/loro) distribuidas** a lo largo de la categoría: entre el conjunto de variantes de los 6 slots (≥12 variantes), cada persona debe aparecer al menos una vez (típicamente las menos frecuentes — `voi`/`loro` — son las que hay que vigilar). Ningún slot tiene por qué contener las 6; la cobertura es a nivel de categoría. Verificable en plan/review.
- **D-30-04:** El slot **`-ire` con `-isc-` recibe refuerzo extra**: arranca con **≥3 variantes** (sobre el pool finire/capire/preferire/pulire) Y es uno de los slots que lleva `word-buttons` (ver D-30-06). Es la trampa A1 más caída (finire→finisco, NO "fino") → más munición que los slots uniformes de ≥2.

### C — Match (DESIGN RULE D-04)
- **D-30-05:** **0 ejercicios `match`** en esta categoría. La conjugación regular `io→parlo` es **derivable por raíz** (raíz `parl-` + desinencia), de modo que un match `io↔parlo` sería "arrastrar sin pensar" — exactamente lo que D-04/R3 prohíben. La categoría queda en **multi-choice + word-buttons con 0 match**, alineada con el SC-4 del ROADMAP. **Documentar explícitamente** en `notes` (autor-internal) del JSON el porqué del 0-match (decisión D-04, no omisión). Contraste con Avere/Essere: AQUELLAS sí tienen match porque sus formas (ho/hai/ha/abbiamo) NO son derivables por raíz; presente-regolare sí lo es.
  - *(El autor consideró y descartó match para los únicos pareos no-derivables que existirían — la inserción `-isc-` y la clasificación infinitivo↔grupo — prefiriendo mantener la categoría limpia en 2 tipos. Ver Deferred si en review se reconsidera.)*

### D — Mix de tipos por slot + framing word-buttons
- **D-30-06:** **multi-choice en TODOS los slots** (núcleo de la re-verificación rápida) + **word-buttons selectivo** donde aporta (construir la frase ejercita orden + elección de la forma correcta). El slot `-isc-` lleva word-buttons obligatorio (D-30-04); el resto de slots con word-buttons queda a discreción del planner/autor siguiendo el balance de Avere/Essere. NO usar solo-multi-choice (pierde la construcción activa) ni forzar ambos tipos en cada slot (carga de quórum innecesaria).
- **D-30-07:** Los word-buttons construyen la **frase completa** (`io` / `parlo` / `italiano` + distractores de forma verbal errónea como `parli`/`parla`), espejo EXACTO del patrón existente en avere/essere (`answer[]` + `distractors[]`). NO construir solo la forma conjugada con sílabas/letras: rompería el patrón actual (word-buttons arma frases, no palabras) y exigiría lógica de render distinta → tocaría el motor (prohibido en brownfield).

### Claude's Discretion
- Verbos concretos por slot más allá de los ya nombrados en ROADMAP/REQUIREMENTS (dormire/partire/aprire para `-ire` simple; finire/capire/preferire/pulire para `-isc-`; giocare/pagare y cominciare/mangiare para ortográficos): elegir verbos A1 de alta frecuencia, evitando irregulares y manteniendo R6 (una sola modificación pedagógica por ejercicio).
- Reparto exacto de qué slots (además del `-isc-`) reciben word-buttons, y nº de variantes por slot por encima del mínimo.
- Número, nombres de id de slot y orden de los ejercicios dentro del JSON (siguiendo el esquema de essere.json: `id` kebab `presente-regolare-…`, `type`, `categoryIds:["presente-regolare"]`, `explanation`, `variants[]`, `validation`).
- Texto pedagógico exacto de cada `explanation` (respetando R1-R7).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Formato slot+variantes (análogos directos — espejar el esquema, NO reinventar)
- `content/exercises/essere.json` — esquema slot+variantes de referencia: `multiple-choice` con `variants[]` (cada uno `prompt`/`options`/`correctIndex`), `explanation` a nivel de slot, bloque `validation.passes[]`.
- `content/exercises/avere.json` — incluye los 3 tipos: `multiple-choice`, `word-buttons` (`answer[]` + `distractors[]`, construye frase completa — patrón a copiar para D-30-07) y `match` (NO se usa aquí pero es la referencia de por qué avere SÍ lo tiene y presente-regolare NO — D-30-05).
- `content/categories.json` — dónde registrar la categoría con `order: 10` (PRES-01).
- `src/data/schema-validator.js` — el validador de shape de contenido que el JSON nuevo debe satisfacer.

### Reglas de autoría y validación (OBLIGATORIAS antes de autorar)
- **Memoria del agente `exercise-authoring-rules` (R1-R7)** — reglas estrictas: R1 prompt sin regla/solución, R2 sin refs `#NNN`, R3 match con ≥3 valores distintos (aplica solo si se reintrodujera match), R4 explanation enfocada al alumno (sin "cierra la serie"), R5 verificar grammar con oráculo, R6 una modificación pedagógica por ejercicio, R7 una sola opción válida + gloss ES "(en español: …)" canon. **No es un fichero del repo — vive en memoria; aplicarla íntegra.**
- `.claude/skills/gsd-validate-exercise/SKILL.md` — skill de validación 1-por-1 con quórum (Opus+Sonnet) que operacionaliza R1-R7 en criterios C1-C5; emite verdict + actualiza `validation.passes[]`. NUNCA batched (un subagent fresh-context por ejercicio).
- `scripts/validate-ai-pass.mjs` — validador multi-vendor cross-vendor (Gemini/DeepSeek, auto-fallback en 429, `--write`); claves en `.env`. Pool elegible por verificación.

### Requisitos y roadmap
- `.planning/REQUIREMENTS.md` §Contenido — Presente regolare (PRES-01..06) + tabla de mapeo Phase 30.
- `.planning/ROADMAP.md` §Phase 30 — goal + 4 success criteria (incluye el detalle de los slots y el D-04). §Phase 31 — consumidor del conteo de slots (`N=6` → `183+6`).
- `.planning/phases/29-…/29-CONTEXT.md` — la migración v11 que reserva el reset de `presente-regolare` (state donde nace la categoría).

### Integración lockstep (consumido en Phase 31 — NO tocar aquí, solo dejar el JSON consistente)
- `tests/exercise-types.test.js` (`CATEGORIES_WITH_EXPLANATIONS` smoke paramétrico) — el JSON nuevo debe satisfacer las invariantes de contenido (coverage / ASCII / no-markdown) aunque el alta de la entrada al smoke sea Phase 31.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Esquema de `essere.json`/`avere.json`**: estructura exacta a replicar — top-level `id`, `type`, `categoryIds:["presente-regolare"]`, `explanation` (nivel slot), `variants[]`, `validation`. `multiple-choice` → variante `{prompt, options[], correctIndex}`; `word-buttons` → variante `{prompt(ES), answer[], distractors[]}`.
- **Bloque `validation`**: `{status, passes:[{by, date, verdict, concerns}]}` — lo rellena el quórum (skill `gsd-validate-exercise` + `validate-ai-pass.mjs`), no a mano.
- **`content/categories.json`**: una línea `{ "id": "presente-regolare", "name": "Presente indicativo (verbi regolari)", "order": 10 }` (nombre exacto a discreción, italiano, espejo del estilo de las otras 9).

### Established Patterns
- **Slot = regla, variantes intercambiables** (CONV-01): el sampler por slot elige una variante al re-presentar → exige que las variantes de un slot sean equivalentes en dificultad/regla (D-30-01).
- **R1-R7 + gloss ES canon R7**: el gloss "(en español: …)" es canon del autor; los false-positives de política que marquen Gemini/DeepSeek sobre él NO bloquean (base de aprobación = Claude Opus+Sonnet). Ver memoria `gloss-es-desambiguacion-canon`.
- **Quórum 1-por-1 NUNCA batched** (VAL-03): un subagent fresh-context por ejercicio. `disputed` → autor-oráculo con audit trail (calidad > tokens; NO override-atajo — memoria `feedback-disputed-resolution`).
- **Cross-vendor caza bugs** que human-verify aprueba (memoria `feedback-cross-vendor-catches-bugs`): DeepSeek estricto en acentos, Opus indulgente → complementar con scan de acentos del canon español.
- **Test runner**: `node --test tests/*.test.js` (path desnudo falla en Node 22.20).

### Integration Points
- La aparición de la categoría nueva en el state (regresión hecha→no-hecha al detectar ejercicios nuevos) la maneja `applyNewExerciseRegression` en boot — NO es responsabilidad de esta fase.
- El reset preventivo de `presente-regolare` ya está en `migrate10to11`/`hydrateV11` (Phase 29) → la categoría nace limpia (no-hecha, racha 0).

</code_context>

<specifics>
## Specific Ideas

El autor prioriza la mecánica **anti-memorización aplicada a la regla** (verbo+persona varían juntos) por encima de cubrir la tabla de un verbo concreto: el objetivo A1 es interiorizar "qué desinencia toca según el grupo y la persona", no recitar la conjugación de un verbo dado. La trampa `-isc-` es el punto pedagógico de mayor riesgo y recibe munición extra (≥3 variantes + word-buttons). Se mantiene la categoría deliberadamente en 2 tipos (multi-choice + word-buttons) con 0 match para no introducir pareos triviales que violarían D-04.

</specifics>

<deferred>
## Deferred Ideas

- **Match no-derivable (`-isc-` finire↔finisce, o infinitivo↔grupo `-are`/`-ere`/`-ire`)**: considerado y descartado en discusión (D-30-05) a favor de mantener la categoría limpia en 2 tipos. Si en code-review/UAT se ve que el alumno necesita reforzar la clasificación de grupo, reconsiderar como adición puntual (sería el ÚNICO match que D-04 autorizaría aquí). No es scope creep de otra fase — es una variante descartada de ESTA, anotada por si se reabre.

</deferred>

---

*Phase: 30-alta-de-presente-regolare-registro-slots-de-regla-variantes-*
*Context gathered: 2026-06-17*
