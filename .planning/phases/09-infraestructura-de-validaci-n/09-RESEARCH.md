# Phase 9: Infraestructura de validación - Research

**Researched:** 2026-05-26
**Domain:** AI-as-judge / Claude Code subagent orchestration / schema extension / zero-deps Node `node:test` patterns
**Confidence:** HIGH (Task() / SKILL.md semantics y schema extension verificados); MEDIUM (commit granularity, idioma del prompt — son trade-offs, no hechos)

## Summary

Phase 9 entrega la maquinaria reutilizable para validar los 271 ejercicios 1-por-1 con quórum multi-Claude (Opus + Sonnet) ANTES de gastar ~1.5-2M tokens en Phase 10. La research confirma que **todas las piezas técnicas son factibles sin añadir dependencias** — Claude Code soporta nativamente el patrón vía SKILL.md + Task() spawn con `model` override en YAML frontmatter (`claude-opus-4-7` y `claude-sonnet-4-6` aceptados como model IDs completos `[VERIFIED: code.claude.com/docs/en/sub-agents]`). El proyecto NO tiene aún `.claude/` directory — Phase 9 lo crea como entrega.

Las 9 áreas "Claude's Discretion" diferidas a plan-time tienen ahora datos concretos: paralelo de los 2 pases es factible (Task tool acepta múltiples invocations en un solo turn, unordered, concurrencia limitada por rate limits) `[VERIFIED: platform.claude.com/docs]`; commit-per-ejercicio es la práctica recomendada para codemods/bulk-refactors (smaller atomic commits, mejor recoverability) `[CITED: martinfowler.com/articles/codemods-api-refactoring.html]`; prompt en español funciona razonablemente bien para tareas de juicio en idiomas próximos al inglés (Cohen's Kappa 0.30-0.61 para español en tareas multilingual judge) `[CITED: arxiv.org/html/2505.12201v1]`; few-shot 2-ejemplos (1 PASS + 1 FAIL) sube consistency +25-30% vs zero-shot `[CITED: eugeneyan.com/writing/llm-evaluators]`; `node:test` soporta skip via env var con dos patrones idiomáticos (`{skip: condition}` en opciones o `t.skip()` runtime) `[VERIFIED: nodejs.org/api/test]`.

**Primary recommendation:** Implementar Phase 9 como **1 plan único 09-01 con 5 tareas secuenciales** (schema extension + validation prompt + skill + smoke test paramétrico + piloto end-to-end) — el alcance es coherente (~6h trabajo) y la separación en plans no añade valor porque las 5 piezas comparten archivos y se validan juntas en el piloto.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Schema validation del campo `validation` | Pure domain (`src/data/schema-validator.js`) | — | Hand-written D-08; la rama nueva `validateValidationShape` es función pura sin DOM/fetch. |
| Validation prompt (R1-R7 → C1-C5) | Documentación markdown estática | Skill subagent prompt | El prompt vive en `VALIDATION-PROMPT.md` (copy-paste-ready para humano) Y dentro de `SKILL.md` como template del subagent. |
| Orquestación de pases multi-modelo | Claude Code skill (`.claude/skills/`) | — | Aprovecha Task() spawn nativo; cero deps Node. |
| Lectura/escritura de JSON de contenido | Skill bash + Node oneliner | — | El skill lee el JSON, extrae 1 ejercicio, lo inyecta en el prompt del subagent, parsea verdict, mergea `passes[]`. |
| Smoke test paramétrico VAL-07 | Test domain (`tests/exercise-types.test.js`) | — | Extiende patrón D-144 `CATEGORIES_WITH_EXPLANATIONS`. Cero infra paralela. |
| Pilot fixture (E3 C5-leak) | Test fixture (`tests/fixtures/`) | — | Vive fuera de `content/` para no contaminar runtime; lo lee solo el skill durante el piloto. |
| Derivación de `status` desde `passes[]` | Pure helper (`src/data/validation-state.js`) | Skill bash helper | Función pura importada por (a) el validator runtime y (b) el script post-spawn del skill. |

**Por qué importa:** la maquinaria de Phase 9 NO es runtime del alumno — es operacional/editorial. El schema validator extendido sí corre en boot (`content-loader.js`), pero el campo `validation` es invisible a la UI. Phase 10 tampoco añade runtime — solo aplica el workflow Phase 9 a 271 archivos.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Code Skills | (native) | Slash-command + auto-invocation slot para el workflow | YAML frontmatter + markdown body; `.claude/skills/<name>/SKILL.md`; soporta `model` field con full model IDs `claude-opus-4-7`/`claude-sonnet-4-6` `[VERIFIED: code.claude.com/docs/en/sub-agents]` |
| Task() tool | (native) | Spawn subagent con contexto aislado | Cada subagent arranca con fresh context window — NO ve historial del padre ni system prompts del padre `[VERIFIED: code.claude.com/docs/en/sub-agents]` |
| `node:test` (built-in) | Node 20+ LTS | Smoke test paramétrico VAL-07 | Ya usado en 209/209 tests baseline. Soporta `{skip: condition}` y `t.skip()` runtime `[VERIFIED: nodejs.org/api/test]` |
| Hand-written validator (D-08) | n/a | Extender `validateContent()` con rama `validation` | Patrón ya establecido — añadimos función `validateValidationShape(ex.validation)` invocada por el loop por-ejercicio. |
| Native `JSON.parse` + regex robusta | n/a | Extraer fenced ```json block del subagent output | Cero deps; el proyecto es zero-deps. Regex `/```json\s*([\s\S]*?)\s*```/` + `try/catch JSON.parse`. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Bash heredoc + `node -e` oneliner | n/a (Node 20+) | Mergear `passes[]` de vuelta al JSON desde el skill | Evita escribir un script Node dedicado para la mutación — el skill puede ejecutar `node -e '...'` inline. Alternativa: módulo dedicado `src/data/validation-state.js` que el oneliner importa. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Skill + Task() spawn | Script Node `.mjs` con `child_process` invocando Anthropic API REST directa | Requeriría `npm install @anthropic-ai/sdk` (rompe zero-deps), API key gestión, cero context-isolation guarantees, manual rate-limit handling. D-VAL-01 ya descartó esto explícitamente. |
| Skill + Task() spawn | Manual copy-paste 271×2 veces a Gemini/ChatGPT en navegador | Imposibilidad práctica en Phase 10. Phase 9 piloto sí lo permitiría (3 ejercicios × 2 = 6 copy-pastes), pero rompe la promesa de "infraestructura reutilizable" de Phase 9. |
| Native regex JSON parse | `json-repair` / `ai-json-safe-parse` npm packages | `[ASSUMED]` ai-json-safe-parse es zero-deps TS; instalarlo rompe el principio "doble click y funciona". Hand-rolled regex + retry es defendible para volumen 271×2 = 542 invocaciones con tasa esperada de malformed <5%. `[CITED: ard.ninja/blog/2026-03-22-ai-json-safe-parse]` |
| Per-categoría JSON | Estado validación en archivo paralelo `validation/<cat>.json` | Rompe coherencia con D-176 ("content lives where content lives"). El campo top-level `validation` ya está decidido D-VAL-05. |

**Installation:**

```bash
# Phase 9 NO instala nada nuevo. Cero npm install. Solo crea archivos.
# Requisito previo: Claude Code instalado (ya disponible — el autor lo usa).
mkdir -p .claude/skills/gsd-validate-exercise
mkdir -p tests/fixtures
```

**Version verification:** No aplica — Phase 9 no instala packages. La única "dependencia" externa es Claude Code (versión usada por el autor en su workflow GSD) y Node LTS (ya en uso para `node --test`).

## Package Legitimacy Audit

Phase 9 NO instala packages externos. **Esta sección NO aplica.** Disposición: N/A.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| — | — | — | — | — | — | Cero packages — Phase 9 es código nuevo + markdown + JSON, sin deps. |

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     EDITORIAL WORKFLOW (Phase 9)                 │
└─────────────────────────────────────────────────────────────────┘

  Autor invoca slash command
       │
       │ /gsd-validate-exercise <exercise-id>
       ▼
  ┌──────────────────────────────────────────────────────────────┐
  │ .claude/skills/gsd-validate-exercise/SKILL.md                 │
  │                                                                │
  │ 1. Lee JSON del ejercicio                                     │
  │    (resuelve exercise-id → file + index)                      │
  │ 2. Compone prompt = VALIDATION-PROMPT.md + JSON 1 ejercicio   │
  │ 3. Spawn 2 subagents en paralelo via Task():                  │
  │                                                                │
  │      Task(model: "claude-opus-4-7",   prompt: <prompt>)       │
  │      Task(model: "claude-sonnet-4-6", prompt: <prompt>)       │
  │                                                                │
  │ 4. Recibe 2 outputs string                                    │
  │ 5. Extrae fenced ```json block de cada uno                    │
  │ 6. Parsea verdict + criteria + concerns                       │
  │ 7. Construye 2 entries para passes[]                          │
  │ 8. Lee status pre-existente del JSON                          │
  │ 9. Aplica deriveStatus(passes[]) → "validated"|"disputed"     │
  │ 10. Mergea passes[] + status de vuelta al JSON                │
  │ 11. Commit (granularidad: 1 por ejercicio — ver §Pattern 2)   │
  └──────────────────────────────────────────────────────────────┘
       │
       ▼
  ┌────────────────────────────────────────────────────────────┐
  │ Subagent A (Opus) — fresh context                          │
  │   • Ve: SOLO el prompt + el JSON de 1 ejercicio            │
  │   • NO ve: CLAUDE.md, sistema prompt del padre, otros     │
  │           ejercicios, REQUIREMENTS.md, etc.                │
  │   • Emite: chain-of-thought + ```json {verdict, ...} ```   │
  └────────────────────────────────────────────────────────────┘
       │
       │ (mismo patrón aislado)
       ▼
  ┌────────────────────────────────────────────────────────────┐
  │ Subagent B (Sonnet) — fresh context                        │
  └────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────────┐
  │ RUNTIME (alumno usa la app) — Phase 9 NO toca esto:        │
  │                                                              │
  │   index.html → content-loader.js → schema-validator.js     │
  │     └─ NUEVO: rama validateValidationShape() acepta o      │
  │        rechaza el campo. NO altera UI, NO altera motor.    │
  └────────────────────────────────────────────────────────────┘
```

**Entrada:** comando del autor (slash command o explicit Task invocation desde un wrapper script).
**Salida:** JSON modificado in-place con `validation.passes[]` poblado + status derivado.
**Aislamiento:** cada subagent ve SOLO 1 ejercicio (clave para evitar contamination cruzada — root cause de los 4 bugs motivadores).

### Recommended Project Structure

```
.planning/phases/09-infraestructura-de-validaci-n/
├── 09-CONTEXT.md                     (existe — 18 D-VAL-* decisiones)
├── 09-DISCUSSION-LOG.md              (existe)
├── 09-RESEARCH.md                    (este archivo)
├── 09-VALIDATION-PROMPT.md           (NUEVO — el prompt verbatim copy-paste-ready)
└── 09-PLAN.md                        (creado por planner tras este research)

.claude/                              (NUEVO — directorio no existe aún)
└── skills/
    └── gsd-validate-exercise/
        └── SKILL.md                  (NUEVO — YAML frontmatter + markdown body)

src/data/
├── schema-validator.js               (MODIFICAR — add validateValidationShape)
└── validation-state.js               (NUEVO — pure helper deriveStatus(passes[]))

tests/
├── exercise-types.test.js            (MODIFICAR — add VAL_07 paramétrico skipped)
└── fixtures/                         (NUEVO — directorio no existe)
    └── validation-pilot-disputed.json (NUEVO — E3 fixture C5-leak)

scripts/
└── assert-avere-prefix-unchanged.mjs (MODIFICAR — añadir `validation` a stripAdditive())

content/exercises/
├── preposiciones.json                (MODIFICAR — añadir validation a preposiciones-040)
└── avere.json                        (MODIFICAR — añadir validation a avere-001 si E2)
```

### Pattern 1: SKILL.md YAML frontmatter con full model ID

**What:** El subagent del Task() spawn acepta un campo `model` en el frontmatter que puede ser un alias (`sonnet`/`opus`/`haiku`) o un model ID completo (`claude-opus-4-7`).
**When to use:** Phase 9 requiere model IDs específicos para registrar el `by` en `passes[]`. Aliases NO sirven porque cambian con el tiempo (el autor quiere audit trail estable).
**Example:**

```markdown
---
name: gsd-validate-exercise-opus
description: Valida un ejercicio JSON aplicando los 5 criterios C1-C5 (R1-R7 operacionalizados). Emite verdict {correcta|incorrecta} + concerns[] tagged.
model: claude-opus-4-7
tools: Read
---

[Body = el VALIDATION-PROMPT.md verbatim, copy-paste]
```

```markdown
---
name: gsd-validate-exercise-sonnet
description: (idem, modelo Sonnet)
model: claude-sonnet-4-6
tools: Read
---
[mismo body]
```

`[VERIFIED: code.claude.com/docs/en/sub-agents#choose-a-model — "Full model ID: Use a full model ID such as claude-opus-4-7 or claude-sonnet-4-6. Accepts the same values as the --model flag"]`

**Alternativa (recomendada para evitar duplicación):** un único `SKILL.md` cuyo body invoca Task() DOS veces con `model` distinto:

```
1. Task(subagent_type: general-purpose, model: claude-opus-4-7,    prompt: <validation-prompt + JSON>)
2. Task(subagent_type: general-purpose, model: claude-sonnet-4-6, prompt: <mismo prompt>)
```

Esta forma evita mantener 2 archivos SKILL.md sincronizados.

### Pattern 2: Commit granularity = 1 por ejercicio (atomic)

**What:** Cada vez que el skill termina la validación de 1 ejercicio, hace 1 commit con los 2 pases registrados.
**When to use:** Phase 10 producirá ~271 commits (1 por ejercicio validado, no 542 — los 2 pases del MISMO ejercicio van en el MISMO commit porque son una unidad lógica).
**Why:** Atomic commits dan recoverability mid-batch (si pase #143 crashea, los 142 anteriores ya están commiteados); revert quirúrgico si un ejercicio sale `disputed` por bug del prompt; bisect efectivo. Trade-off: git log ruidoso, pero el autor puede squash al cierre de Phase 10 si lo prefiere. `[CITED: martinfowler.com/articles/codemods-api-refactoring.html, kennyballou.com/blog/2021/03/commit-granularity]`

**Commit message template:**

```
validate(<categoria>): <exercise-id> → <status> (Opus + Sonnet)

passes[0]: claude-opus-4-7 — <verdict>
passes[1]: claude-sonnet-4-6 — <verdict>
concerns: <count o lista corta si disputed>
```

### Pattern 3: Subagent context isolation guarantees

**What:** Cada Task() spawn arranca con context window vacío.
**Why importante:** El root cause de los 4 bugs motivadores fue batched-curation con ~17 ejercicios por batch en el mismo contexto — el LLM perdía atención sobre ejercicios individuales y cometía errores que la revisión humana del batch global no veía. El aislamiento garantizado por el Task() tool es exactamente la solución arquitectónica al bug class.

**Verified guarantees** `[VERIFIED: code.claude.com/docs/en/sub-agents — "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions"]`:
- NO ve historial de la conversación del padre
- NO ve el system prompt del padre (project CLAUDE.md NO se hereda por defecto)
- NO ve los archivos que el padre haya leído
- NO ve memorias persistentes del padre (exercise_authoring_rules.md está OUT por defecto)

**Consecuencia para el prompt:** el VALIDATION-PROMPT.md DEBE incluir las definiciones de R1-R7 inline (opción b de §specifics CONTEXT.md), porque el subagent no tiene acceso a la memoria del autor.

### Pattern 4: deriveStatus(passes[]) como pure helper compartido

**What:** Función pura que toma `passes[]` y devuelve `"pending" | "validated" | "disputed"` aplicando las reglas estrictas D-VAL-07.

**Where:** `src/data/validation-state.js` — NUEVO módulo de ~30 líneas. Importado por:
1. El smoke test paramétrico VAL-07 (verifica determinismo de la transición).
2. El skill workflow (post-merge de passes[]).
3. Opcionalmente el schema validator si queremos validar que `status` derivado de `passes[]` es consistente con el `status` escrito (defensa contra mutación manual del JSON).

**Example:**

```javascript
// src/data/validation-state.js
// Pure — sin DOM, sin localStorage, sin fetch. D-08 estilo.
//
// Reglas estrictas D-VAL-07 (sticky disputed):
//   - CUALQUIER pase con verdict === 'incorrecta' → 'disputed' (sticky)
//   - ≥2 pases correctas con `by` distintos AND cero incorrectas → 'validated'
//   - cualquier otro caso → 'pending'

export function deriveStatus(passes) {
  if (!Array.isArray(passes)) return 'pending';
  const hasIncorrecta = passes.some(p => p?.verdict === 'incorrecta');
  if (hasIncorrecta) return 'disputed';
  const correctas = passes.filter(p => p?.verdict === 'correcta');
  const distinctBy = new Set(correctas.map(p => p?.by).filter(Boolean));
  if (correctas.length >= 2 && distinctBy.size >= 2) return 'validated';
  return 'pending';
}
```

### Anti-Patterns to Avoid

- **Batched validation en un solo contexto** — root cause de los 4 bugs motivadores; literalmente prohibido por VAL-03. El skill DEBE spawnar un Task() por ejercicio aunque el autor quiera validar 30.
- **Re-spawn fresh agent al recibir JSON malformado** — pierde el chain-of-thought que el autor quiere ver en el commit. Mejor: 1 retry con "tu output anterior fue malformado, emite SOLO el JSON" (ver §Pattern Retry).
- **Lenient JSON parsers que aceptan trailing commas/smart quotes silenciosamente** — el contrato D-VAL-09 es estricto. Mejor fallar visible y forzar al subagent a corregir.
- **Configurar `model: inherit`** (default) en el subagent — heredaría el modelo del padre (que el autor está usando interactivamente). Phase 9 EXIGE control explícito del modelo para el audit trail `passes[].by`.
- **Modificar los 17 ejercicios originales de avere.json sin extender stripAdditive()** — `assert-avere-prefix-unchanged.mjs` fallará. Si E2 baseline = `avere-001`, MUST extender la lista de campos aditivos para incluir `validation`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Subagent spawn + context isolation | Custom HTTP cliente contra Anthropic API + lifecycle manual | Claude Code `Task()` tool nativo | El Task tool ya garantiza fresh context, model override, rate-limit handling, error surfacing. Construir esto a mano requeriría @anthropic-ai/sdk + API key management + secret storage — todo prohibido por el principio zero-deps. |
| Slash command registry | `~/.bashrc` aliases o `package.json scripts` | `.claude/skills/<name>/SKILL.md` | Claude Code escanea recursivamente `.claude/skills/` y `~/.claude/skills/`. Auto-invocación cuando Claude detecta intent matching la `description`. `[VERIFIED: code.claude.com/docs/en/sub-agents]` |
| Schema validation con Ajv/Zod | `npm install ajv` (~32 KB) | Extender el hand-written validator D-08 | La extensión es ~20 líneas. Ajv aporta JSON Schema declarativo, pero el proyecto YA tiene 4 validators hand-written (`PAYLOAD_VALIDATORS`); añadir uno más mantiene coherencia D-08. Mensajes de error en español custom-built mejores que strings genéricos de Ajv. |
| JSON repair lenient | `npm install ai-json-safe-parse` o `json-repair` | Regex extraction + strict `JSON.parse` + 1 retry | Volumen 271×2 = 542 invocaciones; tasa esperada malformed <5% (Opus + Sonnet con fenced block explícito en el prompt). Retry-on-strict-fail es más simple que repair-and-pray. |
| Date stamps | `npm install date-fns` | `new Date().toISOString().slice(0, 10)` | Phase 4 ya tiene `dates.todayLocal()` puro. La fecha en `passes[].date` es ISO string — `toISOString().slice(0,10)` da `2026-05-26` directamente. |

**Key insight:** la disciplina zero-deps del proyecto NO es ideología — es la materialización del principio "doble click y funciona, sin instalar nada". Cualquier `npm install` rompería este principio y debe rechazarse salvo justificación ROADMAP-level.

## Runtime State Inventory

Phase 9 NO es un rename/refactor/migración de runtime state. Esta sección NO aplica strictly, pero documentamos los items para evitar sorpresas:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | localStorage: cero cambios. El campo `validation` es metadata de CONTENT, no de STATE del alumno. | Ninguna. |
| Live service config | Cero servicios externos. El skill corre localmente. | Ninguna. |
| OS-registered state | Ninguna registration OS. | Ninguna. |
| Secrets/env vars | Posible env var `VAL_07_STRICT=1` para activar el smoke test estricto (Phase 10 cierre). | Documentar en CLAUDE.md o en el header del test. |
| Build artifacts | Cero build step. `scripts/.avere-prefix-snapshot.json` ya gitignored — la regeneración será triggered por Phase 10 si los 17 primeros avere reciben `validation` field. | Documentar relax en `stripAdditive()` ANTES de añadir `validation` a avere-001 (E2 si se elige). |

**Specifically not found in any category:** este es un trabajo editorial — el state del alumno (localStorage `italianCourse.v1`) NO se toca. schemaVersion sigue 4 (D-176).

## Common Pitfalls

### Pitfall 1: Subagent NO ve la memoria del autor

**What goes wrong:** El validation prompt asume que el subagent puede leer `~/.claude/projects/.../memory/exercise_authoring_rules.md` para consultar R1-R7. Pero el subagent arranca con contexto vacío.

**Why it happens:** Los Task() subagents tienen "fresh context window" y NO heredan memorias persistentes del padre `[VERIFIED: code.claude.com/docs/en/sub-agents]`.

**How to avoid:** Copiar R1-R7 verbatim INLINE en el VALIDATION-PROMPT.md (opción b de §specifics CONTEXT.md). El prompt es self-contained — el subagent solo necesita el prompt + el JSON del ejercicio.

**Warning signs:** Si el subagent emite `"verdict": "correcta"` pero el ejercicio claramente viola R1 (caso E3 piloto), revisar que el prompt incluye R1 textualmente.

### Pitfall 2: Few-shot examples con ejemplos del MISMO ejercicio bajo test

**What goes wrong:** Incluir como few-shot un ejercicio que casualmente parece al ejercicio bajo test — el subagent "copia" la decisión del shot en lugar de evaluar.

**Why it happens:** Few-shot examples calibran el LLM, pero también biasean cuando el example overlaps con el target. `[CITED: eugeneyan.com/writing/llm-evaluators — "Few-shot prompts show performance instability when changing the label, example order, and number of examples"]`

**How to avoid:** Los 2 few-shot examples (1 PASS + 1 FAIL) son sintéticos GENÉRICOS, no extraídos del corpus de 271. Ejemplo PASS = `"Lui ___ ventidue anni"` → `ha` (avere clásico, sin amibgüedad); ejemplo FAIL = `"Una casa, due ___ (refuerzo regla §1 fem -a→-e)"` (el bug literal del autor — leak C5 explícito). Si Phase 10 muestra que esto sigue introduciendo bias, plan-time puede pivotar a zero-shot.

**Warning signs:** Si todos los 271 ejercicios salen `correcta` con cero `concerns[]` poblados, sospechar bias hacia "OK". Si todos salen `disputed`, sospechar bias hacia "fail".

### Pitfall 3: Slash command path-dependent vs schema-dependent

**What goes wrong:** El skill resuelve `<exercise-id>` a `<file>` + `<index>` por convención de nombre (`avere-001` → `content/exercises/avere.json` → index donde `id === 'avere-001'`). Si el autor añade ejercicios con IDs que NO siguen el patrón `<slug>-NNN`, el skill rompe.

**Why it happens:** Los 271 ejercicios siguen la convención, pero no está enforced por schema. Phase 9 introduce dependencia a esta convención.

**How to avoid:** El skill busca `<exercise-id>` por SCAN de los 7 archivos `content/exercises/*.json` y matching exacto del campo `id`, NO por substring del id. Tarda <100ms y es robusta a IDs custom futuros.

**Warning signs:** Error "ejercicio no encontrado" → debug imprimiendo los IDs scanned.

### Pitfall 4: Race condition entre 2 pases en paralelo escribiendo el mismo JSON

**What goes wrong:** Si Pase 1 (Opus) y Pase 2 (Sonnet) corren en paralelo y AMBOS escriben `passes.push(entry)` al archivo JSON, uno sobrescribe al otro.

**Why it happens:** `fs.writeFileSync` no es atómico cross-process. Pero en el patrón Phase 9 los subagents NO escriben — emiten un string que el orquestador (parent) parsea y escribe. El parent es single-threaded.

**How to avoid:** El skill spawnea los 2 Task() en paralelo (recibe 2 strings independientes), PARSEAR ambos verdicts, construir las 2 entries, y mergear AL FINAL en una sola operación `fs.writeFileSync`. Cero race.

**Warning signs:** Si `passes[]` queda con 1 entry tras un piloto run en lugar de 2, sospechar bug en el orquestador (no en los subagents).

### Pitfall 5: `assert-avere-prefix-unchanged.mjs` falla tras añadir `validation` a avere-001

**What goes wrong:** Si E2 baseline = `avere-001`, añadir `"validation": {...}` modifica el ejercicio. El assert script compara con deepStrictEqual contra el snapshot de los 17 originales → falla.

**Why it happens:** D-178 opción A ya relaja `payload.explanation` y `notes`, pero NO `validation`.

**How to avoid:** Extender `stripAdditive(ex)` en `scripts/assert-avere-prefix-unchanged.mjs` para excluir TAMBIÉN el campo top-level `validation`. Diff mínimo (~2 líneas):

```javascript
function stripAdditive(ex) {
  const { payload, notes, validation, ...rest } = ex;  // ← añadir `validation`
  if (!payload || typeof payload !== 'object') {
    return { ...rest, payload };
  }
  const { explanation, ...payloadCore } = payload;
  return { ...rest, payload: payloadCore };
}
```

**Warning signs:** Tras commitear validation en avere-001, `node scripts/assert-avere-prefix-unchanged.mjs` → exit 1 con diff verbose. Si esto pasa, el plan se ejecutó fuera de orden — el relax debe IR antes que la mutación.

### Pitfall 6: `process.env.VAL_07_STRICT` leído ANTES de que el test runner lo inyecte

**What goes wrong:** Si la constante `VAL_07_STRICT` se lee a top-level del archivo de tests, pero el autor invoca `VAL_07_STRICT=1 node --test`, el valor está disponible. Si el autor invoca via `npm script` que setea la var en otro proceso, podría no propagarse.

**Why it happens:** `node:test` ejecuta los archivos directamente; las env vars del proceso padre se heredan.

**How to avoid:** Patrón idiomático (en este proyecto): lectura top-level + `describe` condicional anidado `{skip}`. Ver §Code Examples §Pattern 5.

**Warning signs:** Smoke test salta en CI pero no en local — confirmar que la env var llega al runner.

## Code Examples

### Example 1: validateValidationShape (extensión hand-written validator)

```javascript
// src/data/schema-validator.js — añadir tras los PAYLOAD_VALIDATORS

/**
 * Phase 9 (VAL-01, D-VAL-06, D-VAL-08): valida el campo top-level opcional
 * `validation` de un ejercicio. Acumula errores (D-08 estilo).
 *
 * Shape esperado:
 *   {
 *     "status": "pending" | "validated" | "disputed",
 *     "passes": [
 *       { "by": string, "date": "YYYY-MM-DD", "verdict": "correcta"|"incorrecta", "concerns": string[] }
 *     ]
 *   }
 *
 * Backward-compat: ausencia del campo = aceptado sin warning (los 271
 * ejercicios actuales no lo tienen y no se rompen).
 */
function validateValidationShape(ex, file, push) {
  if (!('validation' in ex)) return; // back-compat
  const v = ex.validation;
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    push(file, ex.id, '"validation" debe ser objeto si está presente');
    return;
  }
  const VALID_STATUS = ['pending', 'validated', 'disputed'];
  if (!VALID_STATUS.includes(v.status)) {
    push(file, ex.id, `"validation.status" inválido: ${JSON.stringify(v.status)} (esperado: pending|validated|disputed)`);
  }
  if (!Array.isArray(v.passes)) {
    push(file, ex.id, '"validation.passes" debe ser array');
    return;
  }
  const VALID_VERDICT = ['correcta', 'incorrecta'];
  const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
  v.passes.forEach((p, idx) => {
    if (!p || typeof p !== 'object') {
      push(file, ex.id, `"validation.passes[${idx}]" debe ser objeto`);
      return;
    }
    if (typeof p.by !== 'string' || !p.by.trim()) {
      push(file, ex.id, `"validation.passes[${idx}].by" debe ser string no vacío`);
    }
    if (typeof p.date !== 'string' || !ISO_DATE.test(p.date)) {
      push(file, ex.id, `"validation.passes[${idx}].date" debe ser ISO YYYY-MM-DD`);
    }
    if (!VALID_VERDICT.includes(p.verdict)) {
      push(file, ex.id, `"validation.passes[${idx}].verdict" inválido (esperado: correcta|incorrecta)`);
    }
    if (p.concerns !== undefined) {
      if (!Array.isArray(p.concerns) || p.concerns.some(c => typeof c !== 'string')) {
        push(file, ex.id, `"validation.passes[${idx}].concerns" debe ser array de strings si está presente`);
      }
    }
  });
}

// En el loop existente de validateContent(), añadir tras validator(ex, file, push):
//   validateValidationShape(ex, file, push);
```

### Example 2: deriveStatus(passes[]) — pure helper

```javascript
// src/data/validation-state.js (NUEVO)

/**
 * Phase 9 (D-VAL-07): deriva el `status` desde `passes[]` aplicando las reglas
 * estrictas y stickies. Sticky disputed: CUALQUIER incorrecta gana, sin self-heal.
 *
 * @param {Array<{by:string, date:string, verdict:string, concerns?:string[]}>} passes
 * @returns {"pending" | "validated" | "disputed"}
 */
export function deriveStatus(passes) {
  if (!Array.isArray(passes)) return 'pending';
  const hasIncorrecta = passes.some(p => p?.verdict === 'incorrecta');
  if (hasIncorrecta) return 'disputed';
  const correctas = passes.filter(p => p?.verdict === 'correcta');
  const distinctBy = new Set(correctas.map(p => p?.by).filter(Boolean));
  if (correctas.length >= 2 && distinctBy.size >= 2) return 'validated';
  return 'pending';
}
```

### Example 3: Regex JSON extraction + retry pattern

```javascript
/**
 * Phase 9 (D-VAL-12): extrae fenced ```json block de output del subagent.
 *
 * Estrategia 3-step (1 happy + 1 fallback + 1 retry):
 *   1. Regex greedy: ```json ... ``` (último block, por si el subagent emite
 *      varios y el último es el oficial — alineado con el prompt que dice
 *      "emite al FINAL del razonamiento").
 *   2. Si no encuentra, regex sin "json" fence: ``` ... ```.
 *   3. Si JSON.parse falla: ese es el signal de retry. NO repair lenient.
 *
 * El retry budget es 1 (single re-spawn con prompt "tu output anterior fue
 * malformado, emite SOLO el JSON sin chain-of-thought"). Si el 2º intento
 * también falla → el ejercicio queda en 'pending' con concerns[] sintético
 * `["[meta] parse failed twice"]` y el autor revisa manualmente.
 */
function extractJsonBlock(output) {
  // Greedy: último block fenced con "json" tag
  const re1 = /```json\s*([\s\S]*?)\s*```/g;
  let match, lastJson;
  while ((match = re1.exec(output)) !== null) lastJson = match[1];
  if (lastJson) return lastJson;
  // Fallback: último block fenced sin tag
  const re2 = /```\s*([\s\S]*?)\s*```/g;
  while ((match = re2.exec(output)) !== null) lastJson = match[1];
  return lastJson || null;
}

function parseVerdict(output) {
  const raw = extractJsonBlock(output);
  if (!raw) throw new Error('No fenced JSON block found in subagent output');
  return JSON.parse(raw); // throws SyntaxError si malformado
}
```

`[CITED: medium.com/@mtdevworks2025/5-ways-llms-break-json — common LLM JSON breakage modes; ard.ninja/blog/2026-03-22-ai-json-safe-parse]`

### Example 4: Smoke test paramétrico VAL-07 con feature flag

```javascript
// tests/exercise-types.test.js — añadir TRAS el bloque CATEGORIES_WITH_EXPLANATIONS

// ─── Phase 9 VAL-07: smoke test paramétrico tras feature flag ──────────────
//
// D-VAL-17: durante Phase 9 el flag está OFF (los 271 sin validar no rompen
// tests). Al cierre de Phase 10 el autor invoca:
//
//   VAL_07_STRICT=1 node --test tests/*.test.js
//
// y el test debe pasar con 271/271 `status === "validated"`.
//
// Patrón idiomático node:test 2026: lectura top-level de la env var + describe
// condicional con {skip} option (no `t.skip()` runtime — más imperativo, peor
// DX). `[VERIFIED: nodejs.org/api/test — programmatic skips]`

const VAL_07_STRICT = process.env.VAL_07_STRICT === '1';

describe('VAL-07 — todos los ejercicios validated (Phase 10 close gate)', {
  skip: VAL_07_STRICT ? false : 'feature flag VAL_07_STRICT=1 no activado (esperado durante Phase 9)'
}, () => {
  for (const { file, expected } of CATEGORIES_WITH_EXPLANATIONS) {
    test(`${file} — todos los ejercicios con validation.status === "validated"`, () => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const data = JSON.parse(readFileSync(resolve(__dirname, '..', file), 'utf-8'));
      const notValidated = data.exercises.filter(ex => ex.validation?.status !== 'validated');
      assert.equal(
        notValidated.length,
        0,
        `${notValidated.length} ejercicios sin status "validated" en ${file}: ${notValidated.map(ex => `${ex.id}(${ex.validation?.status ?? 'absent'})`).join(', ')}`
      );
    });
  }
});
```

### Example 5: assert-avere-prefix-unchanged.mjs relax (mínimo diff)

```javascript
// scripts/assert-avere-prefix-unchanged.mjs línea 75 — sustituir stripAdditive()
function stripAdditive(ex) {
  // D-178 opción A + Phase 9 extension: campos puramente aditivos que no
  // alteran la semántica del ejercicio. `payload.explanation` (Phase 7.2),
  // `notes` (autor-internal), `validation` (Phase 9 — metadata de quórum AI).
  const { payload, notes, validation, ...rest } = ex;
  if (!payload || typeof payload !== 'object') {
    return { ...rest, payload };
  }
  const { explanation, ...payloadCore } = payload;
  return { ...rest, payload: payloadCore };
}
```

### Example 6: E3 fixture C5-leak (tests/fixtures/validation-pilot-disputed.json)

```json
{
  "exercises": [
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
      "notes": "FIXTURE DE PILOTO Phase 9 — viola R1/C5 deliberadamente. NO usar en producción. NO cargar via content-loader."
    }
  ]
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Batched curation (~17 ejercicios por batch) | 1 ejercicio = 1 subagent fresco = 1 contexto aislado | Phase 9 (this) | Root cause fix de los 4 bugs motivadores. Coste: ~2x tokens vs batched (cada subagent reprocesa el prompt completo). |
| Single-AI review | Quórum ≥2 modelos distintos | Phase 9 D-VAL-02 | Detección de bugs sutiles que un solo modelo perdería. Riesgo aceptado: Opus + Sonnet same-vendor bias (D-VAL-03). |
| Validation prompt en inglés genérico | Validation prompt en español + R1-R7 inline | Phase 9 plan-time | Hipotesis: español lo lee el autor sin friction (revisable). Trade-off vs English-optimal: pequeño (~5-10% peor consistency para low-resource languages, pero español NO es low-resource). `[CITED: arxiv.org/html/2505.12201v1 — Cohen's Kappa español 0.30-0.61 vs English >0.6]` |
| Feature flag = constante module-level | Feature flag = env var `VAL_07_STRICT=1` + `{skip}` option | Phase 9 plan-time | Idiomático node:test 2026; activación zero-code-change al cierre Phase 10. |

**Deprecated/outdated:**
- "Use `{regex}` JSON.parse without try/catch" — Phase 9 NO hace esto; siempre try/catch + retry 1×.
- "Trust that subagent inherits parent context" — Phase 9 EXIGE assumption opuesta: subagent ve SOLO el prompt + el ejercicio.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Few-shot 2-ejemplos sintéticos (1 PASS + 1 FAIL) sube consistency vs zero-shot SIN sesgar hacia "todo OK" o "todo FAIL" | Pitfall 2, State of the Art | Si bias hacia "OK": Phase 10 con todos los ejercicios `validated` sin caza-bugs efectiva (regresión silenciosa). Si bias hacia "FAIL": Phase 10 con 271 disputed → autor revisa 271 manualmente → fricción inviable. Mitigación: el piloto Phase 9 detecta esto en los 3 ejercicios (E1 must `validated`, E2 must `validated`, E3 must `disputed` — si cualquiera sale al revés, ajustar prompt). |
| A2 | Idioma del prompt en español NO degrada accuracy en >5-10% para tareas de juicio sobre italiano | Pattern, State of the Art | El paper Cohen's Kappa 0.30-0.61 español es sobre tareas multilingual en general; nuestro caso particular (juicio sobre italiano con prompt español) NO está cubierto directamente. Mitigación: el piloto valida sobre 3 ejercicios reales — si la accuracy es visible bad, plan-time pivota a inglés en una iteración. |
| A3 | Tasa esperada de malformed JSON output <5% para Opus + Sonnet con fenced block explícito en prompt | Pattern Retry | Si tasa real >20%: 271×2×0.20 = 108 retries; aceptable. Si tasa >50%: prompt mal diseñado, replantear. El piloto Phase 9 con D-VAL-15 gate "los 3 outputs parsean limpio en primer intento" detecta esto. |
| A4 | Spawnar 2 Task() en el mismo turn ejecuta en paralelo (no secuencial) | Pattern 1 / Architecture Diagram | `[CITED: platform.claude.com/docs — tool calls in single assistant turn are unordered, can run concurrently]`. Si en práctica Claude Code los ejecuta secuencialmente, el coste es ~2x latencia pero NO afecta correctness. Riesgo: bajo. |
| A5 | El skill puede leer `tests/fixtures/validation-pilot-disputed.json` aunque el path esté fuera de `content/exercises/` | Specifics CONTEXT.md / Architecture | El skill usa `tools: Read` que tiene acceso al filesystem completo del proyecto. El runtime de la app NO carga `tests/fixtures/` (content-loader solo lee `content/exercises/*.json`). Riesgo: bajo. |
| A6 | `avere-001` cumple R1-R7 informalmente sin issues conocidos | Specifics CONTEXT.md / Phase Requirements VAL-X | Lectura informal: prompt `"Io ___ una macchina nuova."`, options `["ho", "hai", "ha", "abbiamo"]`, correctIndex 0. R1: cero leak ✓. R7: `ho` es la única forma válida con `Io` ✓. R4: explanation enfocada al alumno (regla + traducción + gotcha-h-muda) ✓. R3 no aplica (multi-choice). R5: gramaticalmente y semánticamente natural ✓. R6: 1 modificación (conjugación) ✓. **Confidence:** alta. Si el piloto Phase 9 muestra que avere-001 sale `disputed`, plan-time pivota a otro baseline (ej. essere-001, profesiones-001). |
| A7 | El comando `model: claude-opus-4-7` y `model: claude-sonnet-4-6` son los IDs correctos a fecha 2026-05-26 | Standard Stack / Pattern 1 | `[VERIFIED: code.claude.com/docs/en/sub-agents]` lista estos IDs como ejemplos válidos. Si Anthropic publica IDs nuevos antes de Phase 10, plan-time actualiza. |

**Risk roll-up:** A1 + A2 son los más importantes — los gateemos en el piloto Phase 9 D-VAL-15. Si el piloto pasa los 4 must-haves, A1+A2 son OK para Phase 10. A3-A7 son operacionales con mitigación clara.

## Open Questions

1. **¿Spawnar los 2 pases en serie o en paralelo en el SKILL.md?**
   - What we know: Task() acepta múltiples invocations en un solo turn; concurrent execution es posible pero unordered `[VERIFIED]`.
   - What's unclear: la versión actual del CLI de Claude Code del autor — ¿soporta correctly la emisión de 2 Task() calls en el mismo turn? Issue #29181 reporta que "sometimes only 1 Task call is emitted with other results hallucinated".
   - Recommendation: empezar en SERIE (más conservador, debug más simple, latencia ~2x). Si el piloto funciona limpio en serie, plan-time Phase 10 puede pivotar a paralelo para reducir wall-clock.

2. **¿Few-shot examples in-prompt o zero-shot?**
   - What we know: few-shot 2-ejemplos sube consistency +25-30% but introduces example-order bias `[CITED: eugeneyan.com/writing/llm-evaluators]`.
   - What's unclear: el bias específico de Opus/Sonnet 2026 sobre validation tasks — ningún paper publicado los ha medido.
   - Recommendation: **2-shot (1 PASS sintético + 1 FAIL sintético)** en el VALIDATION-PROMPT.md. El FAIL example es literalmente el bug motivador `(refuerzo regla §1 fem -a→-e)` que el autor cazó — máxima signal para el subagent sobre qué buscar. Si el piloto detecta sobre-bias hacia "OK" en E2 baseline, plan-time pivota a zero-shot o cambia los ejemplos.

3. **¿`SKILL.md` único con 2 Task() calls vs 2 archivos SKILL.md separados (uno por modelo)?**
   - What we know: ambos patrones son válidos en Claude Code.
   - What's unclear: cuál es más mantenible si el VALIDATION-PROMPT.md cambia.
   - Recommendation: **1 SKILL.md único** + el VALIDATION-PROMPT.md vive en `.planning/phases/09-.../09-VALIDATION-PROMPT.md` y el skill lo lee con Read tool antes de spawnear. Esto da:
     - 1 archivo de prompt (cero risk de drift entre Opus/Sonnet versions)
     - El prompt está versioned junto al CONTEXT/PLAN de Phase 9 (audit trail)
     - El skill es la capa orquestadora pura

4. **Ubicación slash command: `.claude/skills/gsd-validate-exercise/` vs `scripts/validate-exercise/`?**
   - What we know: el proyecto NO tiene `.claude/` aún. Skills es el mecanismo soportado por Claude Code para auto-discovery y slash invocation `[VERIFIED]`.
   - What's unclear: si el autor quiere también poder invocar desde shell (no solo desde Claude Code).
   - Recommendation: **solo `.claude/skills/gsd-validate-exercise/SKILL.md`**. La invocación desde shell requeriría un script Node con Anthropic SDK (prohibido — zero-deps + sin API key gestión). El autor SIEMPRE invoca via Claude Code en este workflow.

5. **¿Granularidad de commit del piloto Phase 9 (no Phase 10)?**
   - What we know: el piloto son 3 ejercicios × 2 pases = 3 ejercicios modificados.
   - What's unclear: ¿1 commit por los 3 o 3 commits separados?
   - Recommendation: **1 commit por ejercicio** (3 commits) — replica el patrón que Phase 10 usará a escala (271 commits). El piloto ES el ensayo del workflow, debe usar la misma granularidad.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Claude Code CLI | Skill invocation + Task() spawn | ✓ (autor lo usa) | (current) | Ninguno — sin Claude Code el patrón no se sostiene. |
| Node.js LTS | `node --test`, schema validator, scripts | ✓ | 20+ (asumido, 209/209 tests verdes con `node:test`) | Ninguno — el proyecto entero depende de Node para tests. |
| `claude-opus-4-7` model availability | Pase 1 quórum | ✓ `[VERIFIED: code.claude.com/docs]` | (current) | Si rate-limited: serial fallback con 1 pase Opus + 1 pase Sonnet espaciados. |
| `claude-sonnet-4-6` model availability | Pase 2 quórum | ✓ `[VERIFIED: code.claude.com/docs]` | (current) | Mismo fallback. |
| Filesystem `.claude/` directory | Skill registration | ✗ — Phase 9 lo crea | n/a | n/a — la creación es parte del plan. |
| Filesystem `tests/fixtures/` directory | E3 fixture | ✗ — Phase 9 lo crea | n/a | n/a. |

**Missing dependencies with no fallback:** ninguna que bloquee.
**Missing dependencies with fallback:** ninguna pendiente — todo está disponible o se crea como parte del plan.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in Node 20+) |
| Config file | none — `node --test tests/*.test.js` invocación directa |
| Quick run command | `node --test tests/exercise-types.test.js` |
| Full suite command | `node --test tests/*.test.js` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VAL-01 | Schema validator acepta ejercicios sin `validation` y rechaza shapes inválidos | unit | `node --test tests/exercise-types.test.js` (añadir suite "data/schema-validator — validation field") | ❌ Wave 0: añadir suite |
| VAL-02 | Existe `09-VALIDATION-PROMPT.md` con los 5 criterios + few-shot | manual + grep | `grep -E "C1|C2|C3|C4|C5" .planning/phases/09-*/09-VALIDATION-PROMPT.md` | ❌ Wave 0: crear archivo |
| VAL-03 | Workflow 1-por-1 documentado en `SKILL.md` con justificación NO-batched | manual + grep | `grep -E "NUNCA batched|1 por 1|fresh context" .claude/skills/gsd-validate-exercise/SKILL.md` | ❌ Wave 0: crear archivo |
| VAL-05 | `passes[]` entries tienen `{by, date, verdict, concerns?}` enforced por validator | unit | añadir test en suite "data/schema-validator — validation field" | ❌ Wave 0: añadir suite |
| VAL-07 | Smoke test paramétrico VAL-07 existe y está OFF durante Phase 9 | unit | `node --test tests/exercise-types.test.js` (verifica que el flag OFF NO rompe tests baseline) | ❌ Wave 0: añadir bloque |
| `deriveStatus()` correctness | Pure helper transitions deterministic | unit | `node --test tests/validation-state.test.js` (NUEVO archivo o añadir a domain.test.js) | ❌ Wave 0: crear o añadir |
| Pilot E1 (preposiciones-040) `validated` | end-to-end manual | manual | autor invoca `/gsd-validate-exercise preposiciones-040` → inspecciona JSON | ❌ Wave 0: workflow run |
| Pilot E2 (baseline) `validated` | end-to-end manual | manual | autor invoca `/gsd-validate-exercise avere-001` → inspecciona JSON | ❌ Wave 0: workflow run |
| Pilot E3 (C5-leak fixture) `disputed` | end-to-end manual | manual | autor invoca `/gsd-validate-exercise pilot-disputed-c5-leak-001` → inspecciona JSON | ❌ Wave 0: workflow run |

### Sampling Rate
- **Per task commit:** `node --test tests/exercise-types.test.js` (el archivo más afectado en Phase 9)
- **Per wave merge:** `node --test tests/*.test.js` (full suite — actualmente 209/209)
- **Phase gate:** Full suite verde + 3 pilot runs PASS (D-VAL-15 gate)

### Wave 0 Gaps
- [ ] `.claude/skills/gsd-validate-exercise/SKILL.md` — directorio NO existe, archivo NO existe
- [ ] `.planning/phases/09-*/09-VALIDATION-PROMPT.md` — NO existe, debe crearse
- [ ] `src/data/validation-state.js` — módulo nuevo
- [ ] `tests/fixtures/validation-pilot-disputed.json` — directorio + archivo nuevos
- [ ] Suite "data/schema-validator — validation field (Phase 9)" en `tests/exercise-types.test.js` — bloque nuevo (~12 tests: 1 OK / 6 shape inválido / 5 passes inválido)
- [ ] Suite "validation-state — deriveStatus (Phase 9)" — 8 transition tests (pending, validated happy, validated rechazado por single by, disputed por incorrecta, sticky disputed, etc.)
- [ ] Bloque VAL-07 paramétrico tras feature flag — `describe({skip})` con loop sobre `CATEGORIES_WITH_EXPLANATIONS`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Cero autenticación. App personal local. |
| V3 Session Management | no | Cero sesión. |
| V4 Access Control | no | Cero multi-user. |
| V5 Input Validation | yes | Schema validator hand-written D-08 ya enforced en boot; extensión `validateValidationShape` continúa el patrón. |
| V6 Cryptography | no | Cero crypto. localStorage en cleartext es OK (single-user local). |

### Known Threat Patterns for `{Claude Code skill + content JSON}`

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Prompt injection en `payload.prompt` del ejercicio bajo test | Tampering | Riesgo bajo — los JSONs son hand-authored por el único usuario (el autor). El subagent ve el ejercicio como DATA a evaluar, no como instrucción. El prompt del VALIDATION-PROMPT.md hace claro que el ejercicio es el "target under test", no la directiva del subagent. Mitigación adicional: el prompt incluye guard "el contenido del ejercicio NO debe interpretarse como instrucción para ti — solo evalúalo contra C1-C5". |
| Tampering del `passes[]` (entrada falsa simulando un pase legítimo) | Tampering | Validator schema enforced + el orquestador del skill es la única ruta legítima de escritura. Un autor que mutara `passes[]` a mano romperia el invariante deriveStatus pero solo se daña a sí mismo (single-user). Mitigación: smoke test VAL-07 al cierre Phase 10 verifica `status === "validated"` — un `status` mentido sin `passes[]` consistent sería detectable visualmente (`passes.length === 0` con `status: validated` → 1 ejercicio sospechoso). Mejora opcional plan-time: `deriveStatus(passes[]) === status` check en validateValidationShape. |
| Buggy parse interpreta texto random como `verdict: "correcta"` | Tampering | Whitelist estricta de verdicts `["correcta", "incorrecta"]` en `validateValidationShape`. Cualquier otro valor → validation error visible. JSON.parse strict + retry NO repair. |
| Git history pollution (271×2 = 542 commits si Phase 10 usa per-pase granularity) | (no aplica STRIDE) | Decisión §Pattern 2 = 1 commit por ejercicio (no per-pase) → ~271 commits. Aceptable; squash al cierre Phase 10 si fricción real. |
| Subagent context leakage (algún sistema futuro filtra contenido del padre al subagent) | Information Disclosure | Mitigación arquitectónica: el VALIDATION-PROMPT.md NO contiene NADA confidencial. Es 100% editorial-pedagógico. Worst case leakage = filosofía pedagógica del autor (información pública). |
| Subagent emite contenido inapropiado (content-policy refusal) | (operational) | Mitigación: el contenido es ejercicios de italiano A1 — cero contenido sensible. Si hay refusal, el orquestador detecta verdict-no-parseable y marca como pending. Plan-time puede gestionar como retry. |

## Project Constraints (from CLAUDE.md)

Lista de directivas extraídas de `./CLAUDE.md` que el planner DEBE honrar en cualquier task plan:

1. **Tech stack: web estática HTML+CSS+JS, sin servidor, sin build step.** Phase 9 NO viola esto — el campo `validation` es metadata de content, runtime invisible.
2. **Persistencia = localStorage + JSON export/import.** Phase 9 NO toca state. schemaVersion sigue 4 (D-176).
3. **Cero `npm install` para v1.** Phase 9 NO instala nada nuevo. Es código + markdown + JSON.
4. **Idioma de la interfaz = español (autor hispanohablante).** Aplica: mensajes de error del validator extension en español; output autor-facing del skill (banners, summaries) en español. NO aplica al VALIDATION-PROMPT.md interno (puede ser español o inglés — decisión plan-time, recomendado español por reviewability del autor).
5. **Pinned versions (no `@latest`).** No aplica directamente — Phase 9 no usa CDN. Pero los IDs de modelo (`claude-opus-4-7`, `claude-sonnet-4-6`) están explícitos en el SKILL.md, NO `model: opus` (que seguiría siempre al "current Opus" — bad audit trail).
6. **Hand-written validator (D-08), no Ajv/Zod/Valibot.** Phase 9 extiende, no swap. ✓
7. **APPEND-ONLY avere prefix blindado por scripts (D-88).** Phase 9 debe extender `stripAdditive()` en `assert-avere-prefix-unchanged.mjs` ANTES de añadir `validation` a `avere-001`. ✓
8. **JSON files por categoría, no single file (D-176).** Phase 9 mantiene esta convención — el campo `validation` se añade in-line a cada ejercicio dentro de su archivo de categoría. ✓
9. **GSD workflow enforcement.** Phase 9 viene de `/gsd:plan-phase 9` — ya respetado. El planner debe descomponer Phase 9 en plans + tasks ejecutables vía `/gsd-execute-phase`.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VAL-01 | Schema soporta campo opcional `validation` con shape `{status, passes[]}`; back-compat con 271 actuales | §Example 1 (`validateValidationShape`), §Code Examples §Pattern 4 (back-compat es trivial — `if (!('validation' in ex)) return;`); D-VAL-08 |
| VAL-02 | Validation prompt documentado, 5 criterios binarios, R1-R7 operacionalizados | §Architecture §Pattern 3 (R1-R7 inline en el prompt — context isolation requiere self-contained); §Open Questions Q2 (few-shot 2-ejemplos); D-VAL-09/10/11 |
| VAL-03 | Workflow 1-por-1 documentado, justificación NO-batched explícita | §Architecture Diagram (Task() spawn por ejercicio); §Anti-Patterns "Batched validation"; D-VAL-01 |
| VAL-05 | Cada `passes[]` entry registra `{by, date, verdict, concerns?}` | §Example 1 enforces shape; §Example 2 deriveStatus reads `by` y `verdict`; D-VAL-06 |
| VAL-07 | Smoke test paramétrico tras feature flag (OFF durante Phase 9, ON al cierre Phase 10) | §Example 4 (`VAL_07_STRICT=1` env var + `{skip}` option); §Pitfall 6 (env var lifecycle); D-VAL-17/18 |

## Sources

### Primary (HIGH confidence)
- `code.claude.com/docs/en/sub-agents` — subagent YAML frontmatter, model field semantics (`claude-opus-4-7` como full ID válido), context isolation guarantees, parallel execution. **Fetched 2026-05-26.**
- `code.claude.com/docs/en/agent-sdk/slash-commands` — Skills file structure `.claude/skills/<name>/SKILL.md`, auto-invocation via description matching.
- `platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use` — tool calls in single assistant turn are unordered, concurrent execution supported.
- `nodejs.org/api/test` — `node:test` programmatic skip patterns, `{skip}` option, `t.skip()` runtime.
- `src/data/schema-validator.js` (codebase) — hand-written validator pattern D-08, dispatch table style.
- `scripts/assert-avere-prefix-unchanged.mjs` (codebase) — `stripAdditive()` D-178 relax pattern, exact diff for extension.
- `tests/exercise-types.test.js:966` (codebase) — `CATEGORIES_WITH_EXPLANATIONS` pattern D-144.
- `content/exercises/avere.json` y `preposiciones.json` (codebase) — JSON shape de los 271 ejercicios actuales.
- `.planning/phases/09-*/09-CONTEXT.md` — 18 D-VAL-* decisiones lockeadas + 9 items "Claude's Discretion".
- `~/.claude/projects/.../memory/exercise_authoring_rules.md` — R1-R7 verbatim, source of truth del validation prompt.

### Secondary (MEDIUM confidence)
- `arxiv.org/html/2505.12201v1` — "How Reliable is Multilingual LLM-as-a-Judge?" — Cohen's Kappa values for Spanish (0.30-0.61), evidence that prompt language affects judge consistency.
- `eugeneyan.com/writing/llm-evaluators` — few-shot +25-30% consistency improvement, prompt format sensitivity.
- `medium.com/@mtdevworks2025/5-ways-llms-break-json` — LLM JSON failure modes (trailing commas, smart quotes, unfenced output).
- `martinfowler.com/articles/codemods-api-refactoring.html` — commit granularity guidance for bulk refactors (small atomic commits preferred).
- `kennyballou.com/blog/2021/03/commit-granularity/` — general atomic commit best practices.
- `mikhail.io/2025/10/claude-code-skills/` — Claude Code skill structure exploration.

### Tertiary (LOW confidence — for awareness, not load-bearing)
- `dev.to/harsh_verma_b9e42904b2398/stop-using-regex-to-fix-llm-json` — argument for middleware over regex; not adopted because zero-deps.
- `ard.ninja/blog/2026-03-22-ai-json-safe-parse-npm-package-for-parsing-llm-json/` — zero-dep TS package; not adopted, same reason.
- `cameronrwolfe.substack.com/p/llm-as-a-judge` — broader LLM-as-judge survey.

## Metadata

**Confidence breakdown:**
- **Standard stack (HIGH):** Claude Code Task() + Skill semantics verificadas en docs oficiales actualizadas. Schema extension pattern ya establecido en el codebase. Zero-deps preservation enforced.
- **Architecture (HIGH):** El flujo skill → Task() × 2 → parse → merge → commit es directo. Context isolation es garantía explícita del Task tool. Single point de mutación del JSON evita race conditions.
- **Pitfalls (MEDIUM-HIGH):** los 6 pitfalls listados están bien establecidos. Lo único no probado en este proyecto: tasa real de malformed JSON (asunción A3 <5%) — se mide en el piloto.
- **Decisions diferidas (MEDIUM):** las recomendaciones para los 9 items "Claude's Discretion" son educated guesses guiados por la literatura (LLM-as-judge, codemods, node:test patterns) pero NO probadas en este caso específico. El piloto Phase 9 es exactamente el gate que prueba el agregado.

**Research date:** 2026-05-26
**Valid until:** 2026-06-25 (30 días — el stack Claude Code se mueve, pero los model IDs `claude-opus-4-7` y `claude-sonnet-4-6` deberían persistir; si llegan modelos nuevos antes de Phase 10, plan-time actualiza el SKILL.md).

---

## Recomendaciones de cierre para el planner

El planner debería:

1. **Estructurar Phase 9 como 1 plan único 09-01** con 5 tareas secuenciales (no 3 plans separados). Las 5 piezas comparten archivos y se validan juntas en el piloto — separarlas crearía sync overhead sin valor.
2. **Lockear las 9 decisiones de Claude's Discretion** según las recomendaciones de §Open Questions (paralelo: empezar serie; commit: 1 por ejercicio; ubicación: solo `.claude/skills/`; retry budget: 1×; idioma del prompt: español + R1-R7 inline; few-shot: 2-shot 1PASS+1FAIL; feature flag: env var + `{skip}`; E2 baseline: `avere-001`; relax avere-prefix-assert: extender `stripAdditive()`).
3. **Orden de tareas crítico:** (1) Extender `stripAdditive()` en `assert-avere-prefix-unchanged.mjs` ANTES de tocar avere-001; (2) Crear schema-validator extension + tests; (3) Crear `deriveStatus()` + tests; (4) Crear VALIDATION-PROMPT.md + SKILL.md + fixture; (5) Pilot run × 3 ejercicios con gate D-VAL-15.
4. **No descender al nivel de wording exacto del VALIDATION-PROMPT.md en el PLAN.md** — el wording es ejercicio iterativo del piloto. El plan debe especificar las 5 secciones obligatorias (role, R1-R7 inline, C1-C5 mapping, contract JSON output, 2 few-shot) y dejar el texto exacto al task de escritura.
5. **UAT del piloto:** un script `scripts/pilot-report.mjs` (~40 LOC) que imprime tabla colorizada `(exercise, pass1.by/verdict, pass2.by/verdict, derived status, expected status, PASS/FAIL)` — el autor inspecciona 1 pantalla en lugar de 3 JSONs. NO bloqueante para Phase 9 close si no se hace, pero recomendado.
