# Phase 9: Infraestructura de validación - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 9-Infraestructura de validación
**Areas discussed:** Mecanismo workflow, Schema location + tipos, Output del AI validator, Diseño del piloto

---

## Mecanismo workflow

### Pregunta 1: ¿Cómo se ejecuta el workflow de validación 1-por-1?

| Option | Description | Selected |
|--------|-------------|----------|
| Script Node + Agent spawn | Script `.mjs` que extrae 1 ejercicio + spawn agente fresco + parsea verdict + mergea passes[]. Escala a 271 sin re-trabajo. | ✓ |
| Slash command manual | Autor copia-pega validation prompt + JSON en AIs web, copia verdicts de vuelta, edita manualmente. Cero infra, ~10h trabajo en Phase 10. | |
| Híbrido docs-first | Phase 9 entrega solo prompt + docs + smoke test + piloto manual. Phase 10 decide si automatizar. | |

**User's choice:** Script Node + Agent spawn
**Notes:** Decisión foundational. Trade-off aceptado: invertir 1 plan en automatización ahora para escalar Phase 10.

### Pregunta 2: ¿Cómo invoca el script un agente fresco con SOLO 1 ejercicio en contexto?

| Option | Description | Selected |
|--------|-------------|----------|
| Subagent vía Task() spawn | Slash command / skill de Claude Code que usa Task() para spawn subagent fresco. Aprovecha la infra de Claude Code, sin deps. | ✓ |
| CLI multi-proveedor vía stdin | `child_process.spawn('claude -p ...')` + `gemini -p ...` en paralelo. Máxima flexibilidad, añade deps externas. | |
| Llamada directa a APIs | `fetch` contra Anthropic + Google APIs con keys en `.env`. Viola "sin instalar nada", facturación. | |

**User's choice:** Subagent vía Task() spawn
**Notes:** Coherente con CLAUDE.md "doble click y funciona". El workflow vive como slash command/skill de Claude Code, no como `.mjs` standalone.

### Pregunta 3: VAL-04 «≥2 AIs distintos» dado que Task() solo spawnea Claude

| Option | Description | Selected |
|--------|-------------|----------|
| Pase 1 Task() + Pase 2 manual | Pase 1 auto (Claude), Pase 2 manual (autor copia a Gemini/ChatGPT). Auténticamente cross-model, 271 copy-pastes en Phase 10. | |
| Pase 1 Opus + Pase 2 Sonnet | Ambos pases vía Task() variando `model`. End-to-end auto. Mismo vendor → riesgo sesgos correlacionados. | ✓ |
| Pase 1 Task() + Pase 2 CLI | Pase 1 Claude, Pase 2 `gemini` CLI local. Compromiso intermedio, dep opcional. | |

**User's choice:** Pase 1 Opus + Pase 2 Sonnet
**Notes:** Pragmatismo (auto end-to-end) sobre purity multi-vendor. **Riesgo capturado explícito en CONTEXT D-VAL-03**: los 4 bugs motivadores fueron cazados por Gemini, no Claude. Si el piloto muestra que Sonnet replica las correctas de Opus sin desacuerdo, re-evaluar 3er pase Gemini en plan-time Phase 10.

---

## Schema location + tipos

### Pregunta 1: ¿Dónde vive `validation` en el JSON del ejercicio?

| Option | Description | Selected |
|--------|-------------|----------|
| Top-level del ejercicio | Junto a id/type/categoryIds/payload/notes. Metadata del ejercicio entero, coherente con `notes`. | ✓ |
| Dentro de payload | Co-locado con prompt/options/explanation. Mezcla payload con metadata operacional. | |
| Archivo paralelo | `content/validation/preposiciones.json` con map. Backward-compat máximo, 2 archivos por cat. | |

**User's choice:** Top-level del ejercicio
**Notes:** Coherente con D-08 hand-written validator — la rama nueva `if ('validation' in ex) validateValidationShape(ex.validation)` se añade al loop por-ejercicio.

### Pregunta 2: Formato exacto de `passes[].by`

| Option | Description | Selected |
|--------|-------------|----------|
| Solo modelo ID | `by: "claude-opus-4-7"` + `date` separado. Normalizado, parseable, queryable. | ✓ |
| Modelo@fecha combinados | `by: "claude-opus-4-7@2026-05-25"` como string único. Compacto, redundante con `date`. | |
| Modelo + versión semántica | `by: "claude-opus-4-7-20260501"` con snapshot timestamp oficial. Más ceremonia. | |

**User's choice:** Solo modelo ID
**Notes:** Separa identidad del modelo del momento de la validación. Permite queries como "¿cuántos ejercicios validó Opus?" sin parsear.

### Pregunta 3: Reglas de transición de `status` cuando llega un nuevo pase

| Option | Description | Selected |
|--------|-------------|----------|
| Estricto: 2 correctas distintos | `validated` requiere ≥2 correctas con `by` distintos. CUALQUIER `incorrecta` sticky → `disputed`. Override solo manual del autor. | ✓ |
| Mayoría simple | `validated` si #correctas ≥ #incorrectas y total ≥2. Permite sobrescribir incorrecta con 3er pase correcta. Riesgo: enmascara desacuerdos. | |
| Sin auto-transición | `status` se setea explícit por script tras evaluar `passes[]` con lógica fija. Sin override silencioso. | |

**User's choice:** Estricto: 2 correctas distintos
**Notes:** Sticky disputed honra el espíritu del milestone — un incorrecta merece atención, no auto-limpieza con un 3er pase. Override del autor se registra como pase adicional `by: "autor"`.

---

## Output del AI validator

### Pregunta 1: ¿Qué formato exige el validation prompt al agente fresco?

| Option | Description | Selected |
|--------|-------------|----------|
| JSON estructurado al final | Bloque ```json fenced parseable + razonamiento libre antes. Robusto al parsear, contrato claro. | ✓ |
| Markdown checklist binario | `- [C1] Natural italiana: ✅/❌`. Human-readable en commit, frágil al parsear. | |
| Texto libre + segundo parseo | Razonamiento libre + 2º agente extrae. Duplica costo + bugs. | |

**User's choice:** JSON estructurado al final
**Notes:** El razonamiento previo queda visible al autor en el commit (chain-of-thought auditable), pero el bloque JSON al final es el contrato parseable robusto.

### Pregunta 2: Mapping de los 5 criterios binarios C1..C5 a R1-R7

| Option | Description | Selected |
|--------|-------------|----------|
| 5 criterios = los de VAL-02 | C1 natural (R5), C2 una_opcion (R7), C3 distractoras, C4 explanation (R2+R4), C5 leak (R1). R3+R6 implícitos. | ✓ |
| 7 criterios = R1..R7 directos | 1 boolean por regla. Granular pero algunos no aplican (C3 solo match, C6 raro). | |
| 3 criterios = bug classes | Operacionaliza por bug class real post-v1.0. Más denso, menos diagnóstico. | |

**User's choice:** 5 criterios = los de VAL-02
**Notes:** Mapping 1:1 con VAL-02 verbatim — el validation prompt es la operacionalización de R1-R7. R3 (match ≥3 valores distintos) y R6 (1 modificación pedagógica) quedan documentados como verificación estructural fuera del prompt.

### Pregunta 3: Formato de `concerns[]`

| Option | Description | Selected |
|--------|-------------|----------|
| Tagged con prefix de criterio | `["[C5-leak] el prompt contiene '(refuerzo regla §3)'"]`. Agrupable por bug class. | ✓ |
| Free-form string array | Como VAL-05 verbatim. Sin estructura, difícil agregar. | |
| Objetos con criterio + mensaje | `[{criterion: "C5", message: "..."}]`. Queryable, rompe VAL-05 verbatim. | |

**User's choice:** Tagged con prefix de criterio
**Notes:** Compatible con VAL-05 verbatim ("array of strings") + ganamos estructura. Facilita Phase 10 escalada UX (banner con causa-raíz visible) + análisis epidemiológico ("80% de los bugs son C2-una_opcion").

---

## Diseño del piloto

### Pregunta 1: ¿Qué ejercicios usamos para el piloto?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 ejercicios cubriendo paths | E1 motivador fixed + E2 baseline + E3 force-disputed. 3 estados terminales determinísticos. | ✓ |
| Solo 1 ejercicio motivador | preposiciones-040 × 2 pases. Mínimo absoluto, no prueba disputed path. | |
| 1 categoría completa pequeña | Avere 23×2 = 46 invocaciones. Muestra estadística, diluye separación infra/ejecución. | |

**User's choice:** 3 ejercicios cubriendo paths
**Notes:** Phase 9 piloto debe **detectar bugs del pipeline antes de Phase 10** — los 3 estados terminales (validated puro, validated control, disputed) son must-haves.

### Pregunta 2 (sub-pregunta surgida): los 4 motivadores están fixed. ¿Cómo probamos disputed?

| Option | Description | Selected |
|--------|-------------|----------|
| Fixture sintético aparte | `tests/fixtures/validation-pilot-disputed.json` violando C5-leak deliberadamente. Determinístico, no toca content/. | ✓ |
| Buscar real disputed en content | Agente exploratorio sampling random buscando incorrecta. No determinístico, mezcla con Phase 10. | |
| Solo 2 paths, skip disputed | Piloto solo happy path. Disputed se descubre primero en Phase 10. | |

**User's choice:** Fixture sintético aparte
**Notes:** Hallazgo importante durante discusión: los 4 motivadores (preposiciones-031/-032/-040/-047) ya están fixed post-v1.0. El fixture sintético C5-leak es la única forma determinística de probar disputed path en Phase 9 sin diluir scope.

### Pregunta 3: Composición final del piloto

| Option | Description | Selected |
|--------|-------------|----------|
| 1+1+1 sintético, 2 pases c/u | E1 preposiciones-040 + E2 baseline + E3 fixture C5-leak. 6 invocaciones Task() total. | ✓ |
| 1 motivador + 1 sintético | Solo 2 ejercicios. Skip baseline control. | |
| Ampliado: 3 motivadores fixed + 1 sintético | 8 invocaciones. Confidence marginal +33%. | |

**User's choice:** 1+1+1 sintético, 2 pases c/u
**Notes:** 3 ejercicios × 2 pases (Opus + Sonnet) = 6 invocaciones Task() en Phase 9. Coste contenido, cobertura de los 3 estados terminales.

### Pregunta 4: Gate Phase 9 → Phase 10

| Option | Description | Selected |
|--------|-------------|----------|
| Los 3 estados + parsing robusto | E1 validated + E2 validated + E3 disputed + 3 JSONs parseando limpio en primer intento. Si cualquiera falla → iterar Phase 9. | ✓ |
| Solo verdicts coherentes | Phase 9 PASS si verdicts coinciden, sin auditar parseo. Fragility latente. | |
| Gate con UAT del autor | UAT humano sobre los 3 ejercicios. Más ceremonia. | |

**User's choice:** Los 3 estados + parsing robusto
**Notes:** 4 must-haves observables como gate determinístico. UAT humano implícito (autor revisa commits) pero el gate es objetivo, no subjetivo.

### Pregunta 5: ¿Dónde vive el fixture sintético C5-leak?

| Option | Description | Selected |
|--------|-------------|----------|
| tests/fixtures/ | Fuera de content/ y del runtime de la app. Accesible al script + smoke test. Reutilizable. | ✓ |
| Inline en el plan | JSON embebido en PLAN.md o script .mjs como const literal. Sin reutilización. | |
| .planning/pilot-fixtures/ | Carpeta nueva bajo planning. Añade location que no existe. | |

**User's choice:** tests/fixtures/
**Notes:** content-loader solo lee `content/exercises/*.json` — el fixture NO contamina los 271 reales. Reutilizable como regression test del prompt si éste cambia.

---

## Claude's Discretion

Áreas donde el autor delegó la decisión al plan-time:

- Paralelo vs secuencial de los 2 pases Opus+Sonnet.
- Granularidad de commit del script (1 por ejercicio / por categoría / al final del piloto).
- Ubicación exacta del slash command — `.claude/skills/gsd-validate-exercise/` vs `scripts/validate-exercise/`.
- Retry budget si el agente devuelve JSON malformado.
- Idioma del validation prompt (español autor-friendly vs inglés subagent-optimal).
- Few-shot examples en el validation prompt — ninguno vs 1 PASS + 1 FAIL.
- Implementación exacta del feature flag VAL-07 — constante en código vs describe.skip condicional vs env var.
- E2 baseline exacto (avere-001 sugerido pero plan-time puede escoger otro).
- Si `assert-avere-prefix-unchanged.mjs` necesita relax explícito para el campo `validation`.

## Deferred Ideas

### Diferido a Phase 9 plan-time
- Todas las "Claude's Discretion" arriba.

### Diferido a Phase 10
- Aplicar workflow a 271 ejercicios (VAL-04, VAL-06).
- UX inline de escalada para verdicts `incorrecta` (VAL-08).
- Activación del smoke test paramétrico estricto.
- Decisión sobre 3er pase Gemini si piloto muestra correlación Opus+Sonnet.
- Resolución de `disputed` ejercicios del piloto Phase 9 (¿cuentan para 271/271 o se re-validan?).

### Diferido a milestones futuros (post-v1.1)
- Validación periódica al añadir categorías nuevas (VAL-X1).
- Integración del validation gate en `/gsd-quick` flow editorial (VAL-X2).
- Sustituir quórum Opus+Sonnet por Opus+Sonnet+Gemini si emerge dolor.
