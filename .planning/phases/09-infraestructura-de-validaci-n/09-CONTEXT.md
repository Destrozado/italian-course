# Phase 9: Infraestructura de validación - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Entregar la **maquinaria reutilizable** que hará posible validar los 271 ejercicios 1-por-1 con quórum multi-modelo en Phase 10, sin re-inventar el proceso cada vez:

1. Extensión de schema: campo `validation` opcional con backward-compat sobre los 271 actuales.
2. Validation prompt operacionalizando R1-R7 en 5 criterios binarios verbatim, copy-paste ready a un agente fresco.
3. Workflow 1-por-1 documentado (NUNCA batched — root cause de los 4 bugs motivadores).
4. Smoke test paramétrico tras feature flag (off durante Phase 9, on al cierre Phase 10).
5. Piloto end-to-end sobre 3 ejercicios reales+fixture probando los 3 estados terminales (validated × 2 + disputed × 1) como **gate** para autorizar Phase 10.

**Lo que NO entrega Phase 9:** validación de los 271 ejercicios reales (eso es Phase 10), UX de escalada disputed inline (VAL-08 → Phase 10), garantía de pase-rate del workflow sobre la población completa.

</domain>

<decisions>
## Implementation Decisions

### Mecanismo workflow (Área A)

- **D-VAL-01:** El workflow vive como **slash command / skill de Claude Code** que invoca subagent fresco vía `Task()` con prompt = validation prompt + JSON de SOLO ese ejercicio. NO es un `.mjs` standalone con `child_process` ni un fetch contra APIs externas — aprovecha la infra de Claude Code (subagents, context isolation, sin deps adicionales). Coherente con CLAUDE.md "doble click y funciona, sin instalar nada".
- **D-VAL-02:** Quórum operacionalmente = **2 modelos Claude distintos**: Pase 1 = subagent con `model: claude-opus-4-7`, Pase 2 = subagent con `model: claude-sonnet-4-6`. Ambos pases automatizados, cero copy-paste manual. VAL-04 "≥2 AIs distintos" se interpreta como "≥2 model IDs distintos" — pragmatismo (auto end-to-end) sobre purity multi-vendor.
- **D-VAL-03:** **Riesgo capturado explícito**: Opus + Sonnet comparten sesgos del mismo vendor; los 4 bugs motivadores fueron cazados por **Gemini**, no por Claude. Si el piloto Phase 9 muestra que Sonnet replica las correctas de Opus en ≥2 de los 3 ejercicios (sin desacuerdo en ninguno), considerar plan-time Phase 10 introducir un 3er pase manual con Gemini o re-evaluar la decisión D-VAL-02. Captured como `<concerns_during_pilot>` que el verifier comprobará.
- **D-VAL-04:** Detalles diferidos a plan-time: paralelo vs secuencial de los 2 pases, granularidad de commit (1 por ejercicio vs por categoría vs al final del piloto), ubicación exacta del slash command (`.claude/skills/gsd-validate-exercise/` vs `scripts/validate-exercise/`), retry budget si parseo JSON falla, recoverabilidad si crash mid-pase.

### Schema location + tipos (Área B)

- **D-VAL-05:** Campo `validation` vive **top-level del ejercicio** (junto a `id`, `type`, `categoryIds`, `payload`, `notes`). Es metadata del ejercicio como unidad, no del payload. Coherente con `notes` (también top-level autor-internal).
- **D-VAL-06:** Shape exacto:
  ```jsonc
  "validation": {
    "status": "pending" | "validated" | "disputed",
    "passes": [
      {
        "by": "claude-opus-4-7",      // solo modelo ID, sin @fecha
        "date": "2026-05-26",         // ISO date separado
        "verdict": "correcta" | "incorrecta",
        "concerns": ["[C5-leak] ..."] // opcional, tagged con prefix de criterio
      }
    ]
  }
  ```
- **D-VAL-07:** Reglas de transición de `status` **estrictas** y stickies:
  - `validated` requiere ≥2 entries en `passes[]` con `verdict === "correcta"` Y `by` distintos (model IDs diferentes).
  - CUALQUIER entry con `verdict === "incorrecta"` en `passes[]` → `disputed` **automático** y sticky (no se "limpia" con un 3er pase correcta posterior).
  - Solo el **autor** puede revertir `disputed → validated` manualmente; ese override se registra como una entry adicional en `passes[]` con `by: "autor"` y `verdict: "correcta"` (audit trail VAL-08, pero el flujo UX de escalada en sí es Phase 10).
  - `status === "pending"` cuando `passes[].length < 2` y no hay incorrectas.
- **D-VAL-08:** Schema validator hand-written (`src/data/schema-validator.js`) añade una rama nueva `if ('validation' in ex) validateValidationShape(ex.validation)`. Backward-compat trivial: ausencia del campo = aceptado, sin warnings, sin migración schemaVersion. Los 271 ejercicios actuales pasan sin tocar el JSON.

### Output del AI validator (Área C)

- **D-VAL-09:** El validation prompt **exige** al agente fresco que emita al final de su razonamiento un bloque fenced ```json EXACTAMENTE así:
  ```json
  {
    "verdict": "correcta" | "incorrecta",
    "criteria": {
      "c1_natural": true|false,
      "c2_una_opcion": true|false,
      "c3_distractoras": true|false,
      "c4_explanation": true|false,
      "c5_leak": true|false
    },
    "concerns": ["[C5-leak] ...", "[C2-una_opcion] ..."]
  }
  ```
  El razonamiento previo es libre (chain-of-thought visible al autor en el commit), pero el bloque JSON es el contrato parseable.
- **D-VAL-10:** Los **5 criterios binarios** mapean 1:1 con VAL-02 verbatim (R3 y R6 implícitos):
  - **C1 natural**: la frase italiana suena a nativo (R5 — verificable contra oracle externo si dudoso)
  - **C2 una_opcion**: UNA SOLA opción válida entre prompt + distractoras (R7 — el bug class de `Sono ___ Roma`)
  - **C3 distractoras**: distractoras plausibles, errores típicos hispanohablante (R3 en match implícito)
  - **C4 explanation**: enfocada al alumno, coherente con prompt+respuesta, sin meta-curador "Cierra la serie...", sin `#NNN` refs (R2 + R4)
  - **C5 leak**: cero leak de regla/solución en el prompt (R1)
- **D-VAL-11:** El campo `concerns[]` es **tagged con prefix de criterio violado**: `"[C5-leak] el prompt contiene '(refuerzo regla §3)'"`, `"[C2-una_opcion] 'di' y 'a' ambas válidas con 'Roma'"`. El agente emite el prefix directamente (instruido en el prompt) o el script lo añade automáticamente al detectar `criteria.cN_X === false`. Facilita: agrupar bugs por clase en Phase 10, generar banner VAL-08 con causa-raíz visible, detectar patrones epidémicos ("80% de los bugs son C2-una_opcion").
- **D-VAL-12:** El script extrae el bloque JSON con regex robusta (` ```json[\s\S]*?``` `) + `JSON.parse` con try/catch. Detalles de retry budget, manejo de timeouts, few-shot examples en el prompt, idioma del prompt (español al autor / inglés al subagent) → diferidos a plan-time.

### Diseño del piloto (Área D)

- **D-VAL-13:** Piloto = **3 ejercicios × 2 pases = 6 invocaciones Task()** cubriendo los 3 estados terminales determinísticamente:
  - **E1 = `preposiciones-040`** (`Torno ___ cugini domani.` — uno de los 4 motivadores YA fixed post-v1.0). Expected: `correcta` × 2 → `validated`. Prueba happy-path real.
  - **E2 = baseline sano** (`avere-001` u otro random verificado pedagógicamente). Expected: `correcta` × 2 → `validated`. Prueba control negativo.
  - **E3 = fixture sintético C5-leak** (ejercicio fabricado a propósito violando R1, ej. `"Una casa, due ___ (refuerzo regla §1 fem -a→-e)"`). Expected: al menos 1 `incorrecta` con `concerns: ["[C5-leak] ..."]` → `disputed`. Prueba detección + path disputed.
- **D-VAL-14:** Fixture sintético vive en **`tests/fixtures/validation-pilot-disputed.json`** — fuera de `content/`, fuera del runtime de la app (content-loader solo lee `content/exercises/*.json`). NO contamina los 271 reales, accesible al script del piloto y reutilizable como regression test del prompt si éste cambia en futuras fases.
- **D-VAL-15:** **Gate Phase 9 → Phase 10** = 4 must-haves observables:
  1. E1 (preposiciones-040) sale `validated` con 2 entries correctas de modelos distintos.
  2. E2 (baseline) sale `validated` igual que E1.
  3. E3 (fixture C5-leak) sale `disputed` con `concerns[]` populado con tag `[C5-leak]` o `[C5-...]`.
  4. Los 3 outputs JSON parsean limpio **en el primer intento, sin retries**.

  Si CUALQUIERA falla: iterar Phase 9 (ajustar prompt, parseo, o lógica de transición) antes de autorizar Phase 10. Si los 4 PASS: Phase 10 autorizada con confidence alta.
- **D-VAL-16:** El piloto **NO ejerce VAL-08 escalada UX** (eso es Phase 10) — solo verifica que el output del AI con `verdict: "incorrecta"` mapea a `status: "disputed"` en el JSON con `concerns[]` poblado. La UI inline del autor decidiendo accept/reject/rewrite es trabajo Phase 10.

### Smoke test paramétrico VAL-07

- **D-VAL-17:** Implementación concreta del feature flag → plan-time. **Constraint**: durante Phase 9 el test debe **NO romper** los 209/209 tests baseline. Aproximaciones aceptables: constante `VAL_07_STRICT = false` en el archivo de tests que el assertion comprueba antes de fallar, o un `describe.skip()` condicional. La activación al cierre Phase 10 = cambiar la constante / unskip. El planner elige la implementación más simple.
- **D-VAL-18:** El smoke test paramétrico reutiliza la lista `CATEGORIES_WITH_EXPLANATIONS` ya existente en `tests/exercise-types.test.js:966` (patrón D-144) — itera las 7 categorías + verifica `validation.status === "validated"` por ejercicio. Cero infra paralela.

### Claude's Discretion

Áreas donde el plan-time tiene libertad (capturadas como deferred):
- Paralelo vs secuencial de los 2 pases (D-VAL-04).
- Granularidad de commit (D-VAL-04).
- Ubicación exacta del slash command / script (`.claude/skills/` vs `scripts/`) — D-VAL-04.
- Retry budget cuando el agente devuelve JSON malformado (D-VAL-12).
- Idioma del validation prompt (español autor-friendly vs inglés subagent-optimal) — D-VAL-12.
- Few-shot examples en el validation prompt (ninguno vs 1 PASS + 1 FAIL) — D-VAL-12.
- Implementación exacta del feature flag VAL-07 (D-VAL-17).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level governance (always)
- `.planning/PROJECT.md` — "What This Is" + Constraints + Key Decisions (v1.0 + v1.1). El validation prompt opera sobre los 271 ejercicios curados aquí.
- `.planning/REQUIREMENTS.md` — 8 requirements VAL-01..08, distribuidos 5 a Phase 9 + 3 a Phase 10. **Lectura obligatoria** para el planner.
- `.planning/ROADMAP.md` §"Phase 9: Infraestructura de validación" — Goal + 5 success criteria + Depends on + Requirements mapping.
- `.planning/STATE.md` §"Decisions Pending" + §"Key Decisions (v1.1)" — 5 decisiones v1.1 already lockeadas (mode=standard, smoke test activación al cierre Phase 10, 5 criterios derivados de R1-R7).

### Editorial rules (lectura obligatoria del validator prompt)
- `~/.claude/projects/-home-vcompanyb-italian-course/memory/exercise_authoring_rules.md` — **Fuente de verdad R1-R7**. El validation prompt es la operacionalización verbatim de estas reglas. Cualquier ambigüedad en C1..C5 se resuelve consultando aquí.

### Schema + content
- `src/data/schema-validator.js` — Hand-written validator (D-08), patrón `PAYLOAD_VALIDATORS` dispatch table. Phase 9 añade rama `validateValidationShape` top-level.
- `content/exercises/preposiciones.json` — Categoría con más bugs cazados post-v1.0. Contiene `preposiciones-040` (E1 del piloto, motivador YA fixed) y los otros 3 motivadores también fixed (`-031`, `-032`, `-047`).
- `content/exercises/avere.json` — Categoría con APPEND-ONLY invariante D-88 blindada por `scripts/snapshot-avere-prefix.mjs` + `scripts/assert-avere-prefix-unchanged.mjs`. Si E2 baseline = `avere-001`, el validator NO puede mutar ese JSON sin que el assert script falle.
- `content/categories.json` — 7 categorías, slug ASCII enforced.

### Tests + scripts existentes (reutilización)
- `tests/exercise-types.test.js:966` — `CATEGORIES_WITH_EXPLANATIONS` array (patrón D-144). Phase 9 extiende este patrón para el smoke test VAL-07.
- `scripts/validate-content-fixture.mjs` — Helper existente que invoca `validateContent({categories, exercisesByFile})` con la firma real. Reutilizable para el script de validación si conviene.
- `scripts/assert-avere-prefix-unchanged.mjs` — Constraint: cualquier mutación al `validation` field de los primeros N ejercicios de avere.json debe coordinarse con el snapshot (D-178 opción A ya permite campos no-core como `explanation`/`notes` — `validation` necesita el mismo relax).

### Decisiones v1.0 que constrain Phase 9
- D-08 (hand-written validator, no Ajv/Zod) — extendemos, no swap.
- D-88 (APPEND-ONLY avere prefix blindado por scripts) — relax permite `validation` field si se documenta como no-core.
- D-144 (`CATEGORIES_WITH_EXPLANATIONS` array — 1 línea por categoría nueva).
- D-176 (cero migración schemaVersion para cambios de content) — `validation` es content-side, no state-side; sigue schemaVersion 4.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`src/data/schema-validator.js` `validateContent()`** — entry point que acumula errores y devuelve `{ok, errors}` sin throw. Extensible: añadir `validateValidationShape(ex.validation)` invocado desde el loop por-ejercicio cuando el campo existe.
- **`src/data/schema-validator.js` `PAYLOAD_VALIDATORS` dispatch table** — patrón D-08 ya establecido. NO meter `validation` aquí (no es payload), pero el shape de la validación auxiliar puede seguir el mismo estilo: función pura, errores acumulados, mensajes en español (FOUND-04).
- **`tests/exercise-types.test.js:966` `CATEGORIES_WITH_EXPLANATIONS` array** — patrón D-144. El smoke test paramétrico VAL-07 lo extiende: 1 sub-test nuevo por categoría que valida `validation.status === "validated"` cuando el feature flag está on.
- **`scripts/validate-content-fixture.mjs`** — patrón de CLI helper sobre `validateContent()`. El script de validación piloto puede seguir esta misma forma (lee JSON, invoca subagent, mergea, valida con `validateContent()` final).

### Established Patterns

- **Errores en español (FOUND-04)** — mensajes hacia el autor en castellano (UI + scripts + tests). El validation prompt es para subagents (puede estar en inglés si beneficia accuracy), pero los outputs hacia el autor (banner escalada VAL-08, mensajes de error del script) van en español.
- **Hand-written validators (D-08)** — Phase 9 NO introduce Ajv/Valibot/Zod. La extensión del schema sigue el estilo acumulador-de-errores existente.
- **JSON content por categoría, NO single file (D-176/PROJECT.md)** — el campo `validation` se añade in-line a cada exercise dentro de su archivo de categoría. Cero archivo paralelo.
- **APPEND-ONLY avere prefix (D-88)** — al añadir `validation` a `avere-001` (si es E2 del piloto), regenerar el snapshot o relajar el assert script (similar a D-178 opción A).
- **Cero migración schemaVersion para content-changes (D-176)** — `validation` es content metadata, NO state metadata. Stays en schemaVersion 4.

### Integration Points

- **`src/data/schema-validator.js`** — única integración con el motor runtime. La rama nueva `if ('validation' in ex)` se ejerce al boot por `content-loader.js`. Si la rama falla, el banner de schema-error de Phase 1 muestra el reason en español.
- **`tests/exercise-types.test.js`** — única integración con el test suite. El smoke test paramétrico VAL-07 va aquí, NO en archivo nuevo.
- **`scripts/assert-avere-prefix-unchanged.mjs`** — si E2 baseline = `avere-001`, este script debe permitir el campo `validation` igual que ya permite `explanation`/`notes` (relax D-178 opción A extendido).
- **NINGUNA integración runtime con el motor de re-verificación, sampler, cascada D-54, etc.** — el campo `validation` es invisible al alumno; solo lo lee el validator + el smoke test + scripts editoriales.

</code_context>

<specifics>
## Specific Ideas

- **Fixture sintético C5-leak literal sugerido (E3 del piloto):**
  ```json
  {
    "id": "pilot-disputed-c5-leak-001",
    "type": "multiple-choice",
    "categoryIds": ["genero-numero"],
    "payload": {
      "prompt": "Una casa, due ___ (refuerzo regla §1 fem -a→-e).",
      "options": ["casi", "case", "casa", "cases"],
      "correctIndex": 1,
      "explanation": "Plural femenino -a→-e."
    },
    "notes": "FIXTURE DE PILOTO Phase 9 — viola R1/C5 deliberadamente. NO usar en producción."
  }
  ```
  El AI debe detectarlo y emitir `criteria.c5_leak: false` + `concerns: ["[C5-leak] el prompt contiene '(refuerzo regla §1 fem -a→-e)'"]`.

- **E2 baseline candidato sugerido:** `avere-001` (`Io ___ una macchina.` correctIndex 1 → `ho`). Multi-choice clásico, sin ambigüedad conocida, sin meta-staging en explanation, R1-R7 todas cumplidas en lectura informal. Si plan-time prefiere otro, válido — basta uno random sin issues conocidos.

- **Idioma del validation prompt:** el autor lee español; el subagent procesa cualquier idioma. Plan-time decide. Hipótesis: prompt en español (autor lo entiende sin traducción cuando hay que iterar), con los 5 criterios en español ("C1 natural", "C2 una opción válida", etc.) y los tags también en español (`[C5-leak]` o `[C5-filtración]` — esto último diferido).

- **El prompt incluye R1-R7 verbatim?** Plan-time decide entre: (a) prompt referencia explícita "lee `~/.claude/projects/.../memory/exercise_authoring_rules.md`" (pero el subagent no tiene acceso al filesystem fuera de su workspace), (b) copia inline las definiciones de R1-R7 dentro del prompt (más largo, autosuficiente), (c) destila R1-R7 a los 5 criterios C1-C5 sin mencionar las reglas originales (más conciso, pierde la trazabilidad). Recomendación implícita: (b) — el prompt es el "contrato verbatim" de VAL-02, debe ser self-contained.

</specifics>

<deferred>
## Deferred Ideas

### Diferido a Phase 9 plan-time (out of scope de este CONTEXT, in scope de Phase 9 PLAN)

- Paralelo vs secuencial de los 2 pases Opus+Sonnet (D-VAL-04).
- Granularidad de commit del script — 1 por ejercicio vs por categoría vs al final del piloto (D-VAL-04).
- Ubicación exacta del slash command (`.claude/skills/gsd-validate-exercise/` vs `scripts/validate-exercise/` vs híbrido) — D-VAL-04.
- Retry budget cuando el agente devuelve JSON malformado (D-VAL-12).
- Idioma del validation prompt + tags (D-VAL-12 + specifics).
- Few-shot examples en el validation prompt — ninguno vs 1 PASS + 1 FAIL (D-VAL-12).
- Implementación exacta del feature flag VAL-07 (constante en código vs describe.skip condicional vs env var) — D-VAL-17.
- Si `assert-avere-prefix-unchanged.mjs` necesita relax explícito para el campo `validation` (D-178 opción A extensión).

### Diferido a Phase 10 (out of scope de Phase 9, in scope de Phase 10)

- Aplicar el workflow a las 271 ejercicios (VAL-04, VAL-06).
- UX inline de escalada para verdicts `incorrecta` (VAL-08) — autor decide accept/reject/rewrite, registro `passes[].by: "autor"`.
- Activación del smoke test paramétrico estricto (VAL-07 flag = on).
- Decisión sobre 3er pase Gemini si el piloto Phase 9 muestra que Opus+Sonnet replican demasiado (D-VAL-03 risk monitor).
- Resolución de `disputed` ejercicios del piloto Phase 9 — ¿cuentan para 271/271 Phase 10 o se re-validan con AIs distintos? (STATE.md decisión pendiente #3.)

### Diferido a milestones futuros (post-v1.1)

- Validación periódica re-aplicada al añadir categorías nuevas (VAL-X1).
- Integración del validation gate en `/gsd-quick` flow editorial (VAL-X2).
- Sustituir el quórum Opus+Sonnet por Opus+Sonnet+Gemini si el piloto Phase 9 detecta sesgos del mismo vendor.

</deferred>

---

*Phase: 9-Infraestructura de validación*
*Context gathered: 2026-05-26*
