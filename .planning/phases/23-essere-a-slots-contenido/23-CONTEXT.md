# Phase 23: Essere a slots (contenido) - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Convertir los **39 ejercicios de Essere** del formato legacy `payload` al modelo **slot+variantes**, replicando el patrón exacto de Phase 22 (Avere) / Phases 19-20:

1. Reagrupar los ejercicios en slots **por regla**, con `explanation` a nivel de slot.
2. Autorar **variantes nuevas** por quórum cross-vendor R1-R7 (4× correcta, 1-por-1) donde la regla admite reformulación; huecos → slots nuevos.
3. Dejar la estructura final verde en **validator + smoke paramétrico**, con los **counts re-sincronizados** al nº real de slots.

Segunda de las 3 categorías de verbos (Avere ✓ Phase 22 → **Essere** → Verbi di movimento Phase 24). Cubre **ESS-01, ESS-02**.

**Fuera de scope:** tocar motor/sampler/cascada/loader (shape ya bifurcado por validator+smoke desde v1.4); las otras 5 conversiones; el bloque Canciones.

</domain>

<decisions>
## Implementation Decisions

### Granularidad de slots (identidad / estado / cópula)
- **D-23-01:** Agrupar **por regla, pocos slots** — identidad (nombre/profesión/nacionalidad/parentesco), estado (stanca/felice/tristi) y cópula/clasificación (Roma è una città) se reagrupan en slots por regla gramatical, no se parten por campo semántico fino. Filosofía: **agrupar lo fácil**. (Espíritu paralelo a Avere D-19-01: presente por persona = 1 slot por forma; resto por regla.)
- **D-23-02:** El presente indicativo sigue el precedente de Avere — **1 slot por persona/forma** (sono/sei/è/siamo/siete/sono), porque cada forma es una trampa de conjugación distinta para el hispanohablante.

### Passato prossimo — participio (concordancia)
- **D-23-03:** Los ejercicios essere-026..029 (stato/stata/stati/state) se modelan como **slots separados por forma de concordancia** (masc sing / fem sing / masc pl / fem pl), NO como un único slot con 4 variantes. Razón: la concordancia del participio con el sujeto es **la regla distintiva de Essere frente a Avere** (cuyo participio es invariable) y el punto difícil para el hispanohablante → el loop de re-verificación debe **obligar a acertar cada forma por separado** (drilling explícito). Filosofía: **drillear lo difícil**.
- La `explanation` de estos slots enfatiza la regla de concordancia (el participio de essere concuerda en género/número con el sujeto — único lugar donde el participio italiano concuerda visiblemente de forma no arcaica).

### Variantes nuevas (D-85 + quórum)
- **D-23-04:** Ambición **generosa** — autorar variantes nuevas abundantes por quórum cross-vendor R1-R7, sobre todo en los huecos pedagógicos de Essere (concordancia de nacionalidad italiano/italiana, localización con essere, ser-vs-estar). No es una conversión mínima de solo-reagrupar.
- **D-23-05:** **Sin cuota fija de densidad** — el `23-REAGRUPACION-MAP.md` propone variantes donde la regla lo pida y el autor aprueba en checkpoint. Evita variantes artificiales por cumplir cuota; no se fuerza un mínimo por slot.

### Contraste essere / avere
- **D-23-06:** **Reforzar agresivamente** el contraste essere/avere (criterio de éxito ESS: "preservar el patrón distractoras essere/avere donde aplica" → ampliarlo). Distractoras avere (ho/hai/ha…) en los slots donde tenga sentido + explicaciones que avisan del calco español:
  - edad con **avere** (ho trent'anni), no essere;
  - **ser/estar → essere** (italiano usa un solo verbo para los dos);
  - posesión (avere) vs identidad/estado/localización (essere).

### Hueco ser/estar
- **D-23-07:** Crear un **slot nuevo dedicado** a ser-vs-estar (el hueco pedagógico más grande de Essere para el autor): variantes que contrastan los dos usos (p.ej. "Maria è stanca" [estado/estar] vs "Maria è medico" [identidad/ser]) con `explanation` explícita del calco. Se re-verifica como tema propio en el loop, no solo tejido en explanations de otros slots.

### Precedente LOCKED de Phase 22 (no se re-discute — aplica idéntico)
- **D-23-08 (shape):** Sin `payload`; todo el contenido a `variants[]` (shallow). `explanation` siempre top-level, una por slot. MC = `{prompt, options[], correctIndex}`; word-buttons = `{prompt, answer[], distractors[]}`.
- **D-23-09 (ids):** Ids **semánticos** (`essere-sono`, `essere-passato-prossimo-stato`, `essere-ser-estar`…). **Excepción cross-cat:** `essere-300..305` conservan **id legacy** + sus `categoryIds[]` (cascada D-54) — sin renumerar, porque `clearedExerciseIds` de las otras categorías depende de esos ids.
- **D-23-10 (merge de explanations, D-17-05):** Al fusionar slots, elegir la explanation **más completa** + **injertar los matices únicos** de las descartadas.
- **D-23-11 (validación heredada):** Mover superficies intactas a `variants[]` NO requiere re-validar (cambio cosmético). Los `validation.passes[]` (incluidas resoluciones disputed con override del autor) se mueven verbatim. Solo las **variantes nuevas** pasan quórum.
- **D-23-12 (word-buttons):** Los 4 word-buttons de Essere (essere-100..103) = **slots-de-1**, sin forzar variantes (D-19-03). Essere **no tiene match** en el set legacy (no se inventa).
- **D-23-13 (base de aprobación quórum):** Pase de aprobación canónico = **Claude Opus 4.8 + Sonnet 4.6** (ambas `correcta`); quórum multi-vendor (Gemini/DeepSeek vía `scripts/validate-ai-pass.mjs`) como refuerzo. El C5-leak sobre el gloss ES "(en español: …)" es **falso-positivo de política** (canon R7 del autor) — mantener. Ver `gloss_es_desambiguacion_canon`, `multi_vendor_quorum_validator`.

### Claude's Discretion
- La asignación exacta ejercicio→slot de los grupos identidad/estado/cópula (cuántos slots resultan) se resuelve en `23-REAGRUPACION-MAP.md` con checkpoint del autor, dentro de la guía D-23-01.
- El número final de slots (Avere fue 39→… ; Avere terminó 23→20). Predicción rough Essere: ~19-24 slots. Se fija en el mapa **antes** del rewrite para planear el sync de counts.
- Redacción concreta de prompts/options/explanations de variantes nuevas (sujeto a quórum).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Precedente de conversión (Phase 22 — Avere, patrón EXACTO a replicar)
- `.planning/phases/22-avere-a-slots-contenido/22-01-PLAN.md` — metodología de reagrupación (slots por regla, merge de explanations, workflow de tasks).
- `.planning/phases/22-avere-a-slots-contenido/22-REAGRUPACION-MAP.md` — formato del mapa old-id→slot + cómo se documentan decisiones de agrupación. Plantilla para `23-REAGRUPACION-MAP.md`.
- `.planning/phases/22-avere-a-slots-contenido/22-VARIANTES-NUEVAS.md` — cómo se proponen/autoran variantes y el proceso de quórum. Plantilla para `23-VARIANTES-NUEVAS.md`.
- `.planning/phases/22-avere-a-slots-contenido/22-VERIFICATION.md` — counts finales (23→20) y checks corridos. Plantilla para `23-VERIFICATION.md`.

### Contenido
- `content/exercises/essere.json` — **fuente** a convertir (39 ejercicios; essere-001..029, essere-100..103 word-buttons, essere-300..305 cross-cat).
- `content/exercises/avere.json` — **shape target** ya convertido (slot+variantes; ejemplo de referencia).
- `content/exercises/articoli.json` — referencia secundaria de agrupación multi-semántica (34 slots).

### Validator / smoke / counts (3 hardcodes a sincronizar tras el rewrite)
- `scripts/validate-content-fixture.mjs` — validator de shape (`node scripts/validate-content-fixture.mjs essere content/exercises/essere.json`).
- `tests/exercise-types.test.js` — count hardcode de essere (smoke paramétrico).
- `tests/fixtures/slot-variants-integration.test.js` — `REAL_CATEGORIES.essere.expected`.
- `scripts/run-validation-271.mjs` — count de essere + `TOTAL_EXPECTED` (reporter VAL-04/06/08).
- **Snapshot:** verificar si Essere tiene/necesita análogo de `scripts/.avere-prefix-snapshot.json` + `snapshot-*.mjs` / `assert-*.mjs` (Avere hizo re-base deliberado tras renumerar). El planner debe confirmar si el snapshot es Avere-only o hay uno para Essere.

### Reglas de autoría y validación
- `MEMORY.md` → `exercise_authoring_rules` (R1-R6/R7), `multi_vendor_quorum_validator`, `feedback_disputed_resolution`, `feedback_cross_vendor_catches_bugs`, `gloss_es_desambiguacion_canon`.
- `scripts/validate-ai-pass.mjs` — validador de quórum multi-vendor (Gemini/DeepSeek, `--write`, auto-fallback 429).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Validator + smoke paramétrico:** ya bifurcados por shape desde v1.4 — funcionan tal cual con el shape slot+variantes; no hay que tocar motor/sampler/cascada/loader.
- **Plantillas de artefactos Phase 22:** REAGRUPACION-MAP / VARIANTES-NUEVAS / VERIFICATION son copiables 1:1 cambiando categoría.
- **`scripts/validate-ai-pass.mjs`:** quórum multi-vendor reutilizable para las variantes nuevas.
- **Skill `gsd-validate-exercise`:** valida 1-por-1 con quórum Opus+Sonnet (C1-C5), nunca batched (VAL-03).

### Established Patterns
- **Slot+variantes:** `explanation` top-level + `variants[]` shallow; ids semánticos salvo cross-cat (id legacy estable). Ver D-23-08/09.
- **Cross-cat cascada D-54:** essere-300..305 mantienen `categoryIds[]` multi → fallo resetea las N categorías.
- **Write-once-at-session-end + cascada inmediata al fallo** (motor existente, no se toca).
- **Test runner:** `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — ver `test_command_node_glob`).

### Integration Points
- `content/exercises/essere.json` reescrito → lo leen validator, smoke, run-validation-271, y el loader de la app en boot.
- Counts: el rewrite cambia el nº de ejercicios/slots → 3 hardcodes + `TOTAL_EXPECTED` deben sincronizarse en el mismo o siguiente plan (patrón AVE-01 / 22-03).

</code_context>

<specifics>
## Specific Ideas

- **"Agrupa lo fácil, drillea lo difícil":** la combinación D-23-01 (pocos slots por regla) + D-23-03 (participio en slots separados por forma) es deliberada y coherente, no contradictoria — la concordancia del participio es lo bastante dura para merecer aislamiento en el loop.
- **Slot ser/estar dedicado (D-23-07):** ejemplo de contraste que quiere el autor — "Maria è stanca" (estado) vs "Maria è medico" (identidad), ambos con essere, explanation del calco español.
- **Distractoras avere agresivas:** edad (ho trent'anni), ser/estar, posesión vs identidad — maximizar el valor anti-confusión del hispanohablante.

</specifics>

<deferred>
## Deferred Ideas

None — la discusión se mantuvo dentro del scope de la fase. Las otras 5 conversiones (Verbi di movimento, Genere e numero, Professioni, Sostantivi irregolari) ya están como fases 24-27 en el roadmap; el bloque Canciones y los tiempos verbales futuros (TENSE-X1..X4) siguen en backlog v1.6 boundary.

</deferred>

---

*Phase: 23-essere-a-slots-contenido*
*Context gathered: 2026-06-06*
