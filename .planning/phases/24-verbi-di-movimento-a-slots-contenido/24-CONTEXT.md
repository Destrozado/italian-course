# Phase 24: Verbi di movimento a slots (contenido) - Context

**Gathered:** 2026-06-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir los **37 ejercicios de Verbi di movimento** del formato legacy `payload` al modelo **slot+variantes**, replicando el patrón exacto de Phase 22 (Avere) / Phase 23 (Essere) / Phases 19-20:

1. Reagrupar los ejercicios en slots **por regla**, con `explanation` a nivel de slot.
2. Autorar **variantes nuevas** por quórum cross-vendor R1-R7 (4× correcta, 1-por-1) donde la regla admite reformulación; huecos → slots nuevos.
3. Dejar la estructura final verde en **validator + smoke paramétrico**, con los **counts re-sincronizados** al nº real de slots.

Tercera y **última** de las 3 categorías de verbos (Avere ✓ Phase 22 → Essere ✓ Phase 23 → **Verbi di movimento**). Cubre **MOV-01, MOV-02**.

**Contenido legacy:** 37 ejercicios — **34 multiple-choice + 3 word-buttons** (verbos-movimiento-100/101/102). **SIN match** y **SIN cruces multi-cat 300-305** (a diferencia de Avere/Essere, que sí tenían 6 cruces cada uno) → conversión más simple: no hay ids legacy estables que preservar, no hay re-base de snapshot D-88.

**Regla distintiva de la categoría:** la **selección del auxiliar `essere` vs `avere`** en passato prossimo (el calco "haber → ho/ha" es el error A1 más persistente del hispanohablante). Subreglas: mayoría de verbos de movimiento → essere; excepciones sin destino concreto (viaggiare/nuotare/camminare/ballare) → avere; correre alterna según haya destino. Concordancia del participio con essere (andato/a/i/e) compartida con Essere.

**Fuera de scope:** tocar motor/sampler/cascada/loader (shape ya bifurcado por validator+smoke desde v1.4); las otras conversiones (Genere e numero, Professioni, Sostantivi irregolari); el bloque Canciones; añadir cruces multi-cat nuevos (no existen en el set legacy y crearlos sería capacidad nueva).

</domain>

<decisions>
## Implementation Decisions

### Eje organizador de slots (regla de auxiliar)
- **D-24-01:** Reagrupar **por regla de auxiliar**, NO por persona ni por verbo. La trampa A1 que entrena la categoría es la *decisión* essere-vs-avere, no la conjugación de persona (que aquí es passato prossimo, no presente — NO aplica el precedente "1 slot por persona" de Avere D-19-01 / Essere D-23-02 porque no hay presente indicativo en este set).
- **D-24-02:** Dentro de `movimiento→essere` (la sub-regla mayoritaria: andare/venire/partire/tornare/uscire/entrare/arrivare en distintas personas), **pocos slots por sub-regla** — las distintas personas/verbos son **variantes intercambiables del mismo slot** (la decisión ho/sono es la misma regla). El examen elige 1 variante al azar → mata la memorización por palabra. Concordancia y excepciones van en sus propios slots (D-24-03/04). Filosofía paralela a "agrupar lo fácil" (D-23-01).

### Concordancia del participio (andato/andata/andati/andate)
- **D-24-03:** La concordancia se modela como **UN slot con las 4 formas como variantes**, NO como 4 slots separados. **DIVERGENCIA DELIBERADA vs Essere D-23-03** (donde stato/stata/stati/state SÍ se separaron en 4 slots). Razón: la concordancia del participio con essere **ya se drillea forma-por-forma en la categoría Essere**; duplicar ese drilling aquí restaría foco a la regla propia de Verbi di movimento, que es la **selección del auxiliar essere-vs-avere**. Aquí el drilling fuerte se reserva para el auxiliar; la concordancia se agrupa.
- La `explanation` del slot de concordancia cubre la regla género×número del participio con essere, con varios verbos (no solo andare) para completar la matriz.

### Excepciones que piden avere + correre
- **D-24-04:** Crear **un slot dedicado `excepciones→avere`** (viaggiare/nuotare/camminare/ballare como variantes — todas la misma regla: movimiento sin destino concreto → avere + participio invariable) **+ un slot PROPIO para el test de destino de correre** (`Marco è corso a casa` [destino→essere] vs `ha corso` [sin destino→avere]). Razón para aislar correre: NO es una excepción fija — alterna según destino; mezclarlo con las excepciones puras (que SIEMPRE piden avere) difuminaría dos reglas distintas. El loop drillea ambas trampas como temas propios.

### Variantes nuevas (D-85 + quórum) y huecos
- **D-24-05:** Ambición **generosa, sin cuota fija** (mismo criterio que Essere D-23-04/05). Engordar celdas pobres + materializar huecos pedagógicos donde la regla lo pida; el `24-REAGRUPACION-MAP.md` / `24-VARIANTES-NUEVAS.md` propone y el autor aprueba en checkpoint. Sin mínimo artificial por slot (evita variantes de relleno).
- **D-24-06:** **Los 4 ejes de huecos están priorizados** (el autor los marcó todos):
  1. **Más verbos essere (engorde):** scendere, salire, cadere, rimanere/restare, diventare/nascere/morire (verbos de estado/cambio que también piden essere) → ampliar el slot `movimiento→essere`.
  2. **Más excepciones avere:** passeggiare, sciare, saltare, viaggiare en más personas → ampliar el slot de excepciones.
  3. **Más test-de-destino:** correre/volare/saltare/salire/scendere con y sin destino → ampliar el slot de auxiliar condicional (drillea la regla "¿hay destino?").
  4. **Matriz de concordancia completa:** las 4 formas andato/a/i/e con varios verbos como variantes del slot de concordancia.
  - Cada candidata la concreta el mapa y la valida el quórum cross-vendor R1-R7 antes de entrar. Verificar que cada verbo asignado a "essere" o "avere" tome realmente ese auxiliar (no inventar excepciones).

### Restricción específica de la fase (LOCKED)
- **D-24-07 (D-159):** Las `explanation` de Verbi di movimento **NO referencian la categoría Essere por id ni por prosa** (cero "ver Essere", cero "essere-0XX"). Usar **"essere" como nombre del verbo auxiliar** sí es inevitable y válido (es LA regla: el auxiliar de los verbos de movimiento es essere) — la restricción es no remitir al alumno a la *categoría/ejercicios* de Essere. Las explanations existentes ya cumplen esto; preservarlo al fusionar/reescribir.

### Precedente LOCKED de Phases 22/23 (no se re-discute — aplica idéntico)
- **D-24-08 (shape):** Sin `payload`; todo el contenido a `variants[]` (shallow). `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`; word-buttons = `{prompt, answer[], distractors[]}`. (Hereda D-23-08.)
- **D-24-09 (ids):** Ids **semánticos** (p.ej. `verbos-movimiento-essere`, `verbos-movimiento-excepcioni-avere`, `verbos-movimiento-correre`, `verbos-movimiento-concordanza`…). **NO hay excepción cross-cat** en esta categoría (no existen verbos-movimiento-300..305) → todos los ids pueden ser semánticos. Reusar el patrón `{categoria}-{regla}` (D-15-09). (Hereda el espíritu de D-23-09 sin la salvedad de cruces.)
- **D-24-10 (merge de explanations, D-17-05):** Al fusionar slots, elegir la explanation **más completa** + **injertar los matices únicos** de las descartadas.
- **D-24-11 (validación heredada):** Mover superficies intactas a `variants[]` NO requiere re-validar (cambio cosmético). Los `validation.passes[]` (incluidas resoluciones disputed con override del autor) se mueven verbatim. Solo las **variantes nuevas** pasan quórum.
- **D-24-12 (word-buttons):** Los 3 word-buttons (verbos-movimiento-100/101/102) = **slots-de-1** salvo que el quórum apruebe variantes naturales; no se fuerzan variantes artificiales (D-19-03). Verbi di movimento **no tiene match** en el set legacy (no se inventa).
- **D-24-13 (base de aprobación quórum):** Pase de aprobación canónico = **Claude Opus 4.8 + Sonnet 4.6** (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo, con auto-fallback a deepseek-reasoner si Gemini agota cuota (429/503). El C5-leak sobre el gloss ES "(en español: …)" es **falso-positivo de política** (canon R7 del autor) — mantener.
- **D-24-14 (SIN snapshot D-88):** El blindaje APPEND-ONLY es **avere-only** (scripts sin refs a verbos-movimiento). NO se corre ningún script de snapshot/assert ni se replica la re-base D-88 (igual que Essere — DIVERGENCIA vs Avere Phase 22).
- **D-24-15 (sync de counts):** El rewrite cambia el nº de slots → re-sincronizar los **3 hardcodes** (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`) + `TOTAL_EXPECTED` contra el nº REAL de slots leído del JSON (`data.exercises.length`), en el mismo o último plan (patrón AVE-01/22-03, ESS-01/23-03).

### Claude's Discretion
- La asignación exacta ejercicio→slot (cuántos slots resultan en total) se resuelve en `24-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de las guías D-24-01..04.
- **Tratamiento de los pares aux-vs-participio (011/012, 013/014, 015/016):** son ejercicios que sobre la MISMA frase piden ora el auxiliar ora el participio. Asignación natural: la superficie "elige auxiliar" va al slot de auxiliar (`movimiento→essere`); la superficie "elige participio" va al slot de concordancia. El mapa lo concreta.
- El número final de slots. Predicción rough (Avere 23→20, Essere 39→26): Verbi di movimento ~16-22 slots. Se fija en el mapa **antes** del rewrite para planear el sync de counts.
- Redacción concreta de prompts/options/explanations de variantes nuevas (sujeto a quórum).
- Esquema concreto de ids semánticos.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Precedente de conversión (Phases 22/23 — patrón EXACTO a replicar)
- `.planning/phases/23-essere-a-slots-contenido/23-CONTEXT.md` — precedente inmediato (verbo, segundo de los 3); decisiones D-23-01..13 que esta fase hereda o diverge explícitamente.
- `.planning/phases/23-essere-a-slots-contenido/23-REAGRUPACION-MAP.md` — formato del mapa old-id→slot. Plantilla para `24-REAGRUPACION-MAP.md`.
- `.planning/phases/23-essere-a-slots-contenido/23-VARIANTES-NUEVAS.md` — proceso de propuesta/quórum de variantes. Plantilla para `24-VARIANTES-NUEVAS.md`.
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md` — metodología de reagrupación + workflow de tasks (mapa → rewrite → variantes → sync).
- `.planning/phases/22-avere-a-slots-contenido/22-VERIFICATION.md` — formato de checks finales y counts. Plantilla para `24-VERIFICATION.md`.

### Contenido
- `content/exercises/verbos-movimiento.json` — **fuente** a convertir (37 ejercicios; verbos-movimiento-001..034 MC + 100/101/102 word-buttons; categoryId único `verbos-movimiento`, sin multi-cat).
- `content/exercises/essere.json` + `content/exercises/avere.json` — **shape target** ya convertido (slot+variantes; ejemplos de referencia).
- `content/categories.json` — confirmar el slug EXACTO del categoryId (`verbos-movimiento`) antes de hardcodear nada.

### Validator / smoke / counts (3 hardcodes a sincronizar tras el rewrite)
- `scripts/validate-content-fixture.mjs` — validator de shape (`node scripts/validate-content-fixture.mjs verbos-movimiento content/exercises/verbos-movimiento.json`).
- `tests/exercise-types.test.js` — count hardcode de verbos-movimiento en `CATEGORIES_WITH_EXPLANATIONS` (smoke paramétrico).
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES['verbos-movimiento'].expected`.
- `scripts/run-validation-271.mjs` — count de verbos-movimiento + `TOTAL_EXPECTED` (reporter VAL-04/06/08).
- **Snapshot:** confirmar que el snapshot APPEND-ONLY es avere-only (no hay `.verbos-movimiento-prefix-snapshot.json`) → NO se corre snapshot/assert (D-24-14).

### Reglas de autoría y validación
- `MEMORY.md` → `exercise_authoring_rules` (R1-R6/R7), `multi_vendor_quorum_validator`, `feedback_disputed_resolution`, `feedback_cross_vendor_catches_bugs`, `gloss_es_desambiguacion_canon`, `test_command_node_glob`.
- `scripts/validate-ai-pass.mjs` — validador de quórum multi-vendor (Gemini/DeepSeek, `--write`, auto-fallback 429).
- Skill `gsd-validate-exercise` — valida 1-por-1 con quórum Opus+Sonnet (C1-C5), NUNCA batched (VAL-03).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Validator + smoke paramétrico:** ya bifurcados por shape desde v1.4 (`Array.isArray(ex.variants)`) — funcionan tal cual con el shape slot+variantes; no hay que tocar motor/sampler/cascada/loader.
- **Plantillas de artefactos Phases 22/23:** REAGRUPACION-MAP / VARIANTES-NUEVAS / VERIFICATION son copiables 1:1 cambiando categoría.
- **`scripts/validate-ai-pass.mjs`** + skill `gsd-validate-exercise`: quórum multi-vendor reutilizable para las variantes nuevas.

### Established Patterns
- **Slot+variantes:** `explanation` top-level + `variants[]` shallow; ids semánticos (aquí TODOS semánticos — sin cruces cross-cat). Ver D-24-08/09.
- **"Agrupar lo fácil, drillear lo difícil"** (heredado D-23): aquí lo difícil = selección de auxiliar essere-vs-avere + test de destino de correre (se aíslan); la concordancia se agrupa (ya se drillea en Essere).
- **Write-once-at-session-end + cascada inmediata al fallo** (motor existente, no se toca; sin cruces multi-cat en esta categoría → cascada D-54 solo afecta a `verbos-movimiento`).
- **Test runner:** `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — ver `test_command_node_glob`).

### Integration Points
- `content/exercises/verbos-movimiento.json` reescrito → lo leen validator, smoke, run-validation-271, y el loader de la app en boot.
- Counts: el rewrite cambia el nº de slots → 3 hardcodes + `TOTAL_EXPECTED` deben sincronizarse (patrón AVE-01/22-03, ESS-01/23-03). Tras Essere, `TOTAL_EXPECTED = 307`; el delta de esta fase = `−37 + (nº real de slots de verbos-movimiento)`.

</code_context>

<specifics>
## Specific Ideas

- **Divergencia consciente vs Essere en concordancia (D-24-03):** stato/stata/stati/state se separaron en Essere; andato/a/i/e se AGRUPAN aquí. No es incoherencia — es que la regla distintiva de cada categoría es distinta (concordancia en Essere; selección de auxiliar en Verbi di movimento). El loop ya cubre la concordancia forma-por-forma en Essere.
- **Slot propio para correre (D-24-04):** ejemplo del contraste que se quiere drillear — `Vedendo il pericolo, Marco è corso a casa` (con destino → essere) vs un `ha corso` sin destino. La pregunta clave de la explanation: "¿hay un destino? Con destino, essere; sin destino, avere."
- **Anti-calco como hilo conductor:** la explanation del auxiliar avisa del error "io ho andato" (calco de "yo he ido") → el reflejo correcto es essere con todos los verbos de movimiento (salvo las excepciones sin destino).
- **Pares aux-vs-participio (011-016):** ejercicios gemelos sobre la misma frase que aíslan las dos decisiones (auxiliar / participio) — se reparten a los slots de auxiliar y de concordancia respectivamente.

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de la fase. Las conversiones restantes (Genere e numero, Professioni, Sostantivi irregolari) ya están como Phases 25-27 en el roadmap; el bloque Canciones y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog v1.6 boundary. Añadir cruces multi-cat nuevos a Verbi di movimento sería capacidad nueva (out of scope — el set legacy no los tiene).

</deferred>

---

*Phase: 24-verbi-di-movimento-a-slots-contenido*
*Context gathered: 2026-06-08*
