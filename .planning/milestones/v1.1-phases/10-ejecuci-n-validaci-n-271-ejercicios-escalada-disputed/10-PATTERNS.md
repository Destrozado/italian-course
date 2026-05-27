# Phase 10: Ejecución validación 271 ejercicios + escalada disputed — Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 11 (2 NEW + 7 content JSON + STATE.md + README.md)
**Analogs found:** 11 / 11 (todos los archivos tienen analog exacto en el repo)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `.claude/skills/gsd-validate-batch/SKILL.md` | skill (orchestrator sub-skill, inline en main session) | event-driven + request-response (AskUserQuestion + Skill→Skill invoke) | `.claude/skills/gsd-validate-exercise/SKILL.md` | **exact** (mismo tipo: GSD skill, mismo proyecto, frontmatter + secciones idénticas) |
| `scripts/run-validation-271.mjs` | reporter (POST-processing puro) | batch read-only + transform + exit-code gate | `scripts/run-validation-pilot.mjs` | **exact** (mismo tipo: zero-deps Node reporter, ANSI tabla, sub-gates, exit 0/1) |
| `content/exercises/preposiciones.json` (mutate ×49) | content/data (JSON ejercicios) | CRUD-write (field-add) | `preposiciones-040` ya validated en piloto | **exact** (mismo archivo, ejercicio del mismo type validation field) |
| `content/exercises/avere.json` (mutate ×22) | content/data | CRUD-write (field-add) | `avere-001` ya validated en piloto | **exact** |
| `content/exercises/essere.json` (mutate ×39) | content/data | CRUD-write (field-add) | `avere-001` shape vigente | **role-match** (mismo type multiple-choice, sin pilot priors en essere) |
| `content/exercises/genero-numero.json` (mutate ×40) | content/data | CRUD-write (field-add) | `avere-001` shape vigente | **role-match** |
| `content/exercises/profesiones.json` (mutate ×51) | content/data | CRUD-write (field-add) | `avere-001` shape vigente | **role-match** |
| `content/exercises/sustantivos-irregulares.json` (mutate ×31) | content/data | CRUD-write (field-add) | `avere-001` shape vigente | **role-match** |
| `content/exercises/verbos-movimiento.json` (mutate ×37) | content/data | CRUD-write (field-add) | `avere-001` shape vigente | **role-match** |
| `.planning/STATE.md` (update progress) | planning state (markdown) | append-write checkpoint | sections existentes en STATE.md | **exact** |
| `README.md` (optional add `VAL_07_STRICT=1` doc) | docs | append-write | README existente | **exact** |

**No analog found:** ninguno. El proyecto Phase 9 entregó tanto el skill base como el reporter; Phase 10 es escala + cola disputed sobre patrones ya validados.

---

## Pattern Assignments

### `.claude/skills/gsd-validate-batch/SKILL.md` (skill, event-driven orchestration)

**Analog:** `.claude/skills/gsd-validate-exercise/SKILL.md` (Phase 9)
**Match quality:** exact — mismo proyecto, misma carpeta `.claude/skills/`, misma estructura GSD.

**Frontmatter pattern** (líneas 1-13):

```yaml
---
name: gsd-validate-exercise
description: "Valida un ejercicio JSON 1-por-1 con quórum multi-modelo (Opus + Sonnet) aplicando los 5 criterios C1-C5 (operacionalización de R1-R7). Emite verdict + concerns + actualiza el campo `validation.passes[]` del ejercicio. NUNCA batched — un subagent fresh context por ejercicio (VAL-03)."
argument-hint: "<exercise-id> [--dry-run]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---
```

**Adaptaciones para batch:**
- `name: gsd-validate-batch`.
- `argument-hint: "<category> | --all-pending | <id1,id2,...>"`.
- **`allowed-tools` añade `AskUserQuestion` y `Skill`** (RESEARCH Q1) — el batch necesita preguntar al autor (D-VAL-26) e invocar el skill hijo.
- Considerar `disable-model-invocation: true` para evitar auto-trigger (RESEARCH Q1) — sólo el autor con `/gsd-validate-batch <scope>`.
- **CRÍTICO:** NO añadir `context: fork` (RESEARCH Q1, Q2) — el batch DEBE correr inline en main session o AskUserQuestion y Task() rompen.

**Objective pattern** (líneas 15-19):

```markdown
<objective>
Workflow editorial 1-por-1 NUNCA batched para validar UN ejercicio JSON contra los 5 criterios C1-C5 (operacionalización de R1-R7) usando quórum de 2 modelos Claude distintos (Opus + Sonnet). Implementa VAL-02 (5 criterios documentados) + VAL-03 (workflow 1-por-1 con justificación).

Salida observable: el campo `validation.passes[]` del ejercicio queda populado con 2 entries (1 por modelo), `validation.status` derivado por `deriveStatus()`, y se hace 1 commit atómico (granularidad: 1 ejercicio = 1 commit, NO 1 commit por pase).
</objective>
```

**Critical constraints pattern** (líneas 21-41) — clonar estructura, sustituir contenido:

```markdown
<critical_constraints>

- **NUNCA batched: el subagent ve SOLO 1 ejercicio por spawn (VAL-03 — root cause de los 4 bugs motivadores cazados post-v1.0 fue batched-curation con ~17 ejercicios por contexto compartido).** Si el autor pide validar 30 ejercicios, este skill se ejecuta 30 veces — UN spawn por ejercicio, JAMÁS un spawn con 30 ejercicios en el prompt. Esta es la garantía arquitectónica que cierra el bug class.

- **Model IDs EXPLÍCITOS y literales: `claude-opus-4-7` para el Pase 1 y `claude-sonnet-4-6` para el Pase 2 (D-VAL-02).** NO usar `model: inherit`, NO usar aliases `opus` / `sonnet` / `haiku`. ...

- **Mensajes hacia el autor en español (FOUND-04).** Banners, errores, output del skill al stdout/stderr → todo en castellano. ...

- **Retry budget = 1 (D-VAL-04 + RESEARCH §Example 3).** ...

- **Commit granularity: 1 commit por ejercicio, NO 1 por pase (D-VAL-04 + RESEARCH §Pattern 2).** ...

- **Zero-deps invariant (CLAUDE.md).** ...

</critical_constraints>
```

**Para el batch — constraints específicas a añadir/sustituir:**
- "Sub-skill INLINE en main session — NUNCA `context: fork`" (RESEARCH Q1, invariante arquitectónico).
- "Sub-skill ITERA pero NUNCA compone N ejercicios en mismo Task() — el bucle inyecta UN id a cada invocación de gsd-validate-exercise (D-VAL-20)".
- "Resume idempotente: re-leer JSONs y filtrar ya-validated antes de iterar (D-VAL-19). Estado verdad vive en los JSONs, NO en manifest paralelo".
- "Una sola categoría procesada por invocación; --all-pending las encadena con checkpoints AskUserQuestion intermedios (D-VAL-22 + D-VAL-23)".

**Execution steps pattern** (líneas 43-196) — el skill base usa formato numerado **Paso 1**, **Paso 2**, ..., **Paso 9** con bloques de pseudocódigo + tools concretos. Replicar exactamente esa cadencia:

```markdown
<execution>

Pasos 1-9 del workflow (pseudocódigo + tools concretos):

**Paso 1 — Leer VALIDATION-PROMPT.md (la fuente de verdad del prompt)**

Read tool: .planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
→ guarda el contenido completo en variable VALIDATION_PROMPT

**Paso 2 — Resolver `<exercise-id>` por SCAN exacto del campo `id`**
...
```

**Para el batch — esqueleto de pasos (RESEARCH Q1 §execution):**
- Paso 1 — Resolver scope (`<category>` | `--all-pending` | CSV ids).
- Paso 2 — Para cada categoría en orden D-VAL-22: leer JSON, filtrar `status !== "validated"`, iterar invocando skill hijo via Skill tool.
- Paso 3 — Procesar cola disputed al final de la categoría (4 caminos D-VAL-25, banner D-VAL-26).
- Paso 4 — Tabla agregada al cierre del scope + sugerencia `node scripts/run-validation-271.mjs`.

**Error handling pattern** (líneas 198-209) — tabla markdown con `Caso | Acción | Mensaje al autor (español)`. Clonar.

**Read-first pattern** (líneas 227-239):

```markdown
<read_first_per_invocation>

Antes de cada invocación, este skill DEBE leer (con Read tool):

1. `.planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — el prompt R1-R7 + C1-C5 + contrato JSON output (D-VAL-09/10/11). Self-contained — es lo único que se manda al subagent.

2. `src/data/validation-state.js` — para usar `deriveStatus(passes[])` en el Paso 7 (regla D-VAL-07 sticky disputed).

NO necesita leer:
- `CLAUDE.md` ni `~/.claude/projects/.../memory/exercise_authoring_rules.md` — sus reglas están YA inline en el VALIDATION-PROMPT.md.

</read_first_per_invocation>
```

**Para el batch — read-first específicos:**
1. Los 7 JSONs categoría según scope (lectura para filtrar pendientes).
2. `src/data/validation-state.js` (para `deriveStatus` en path-A/C BYPASS sticky verify).
3. NO leer VALIDATION-PROMPT.md directamente — eso lo hace el skill hijo.

**Example invocations pattern** (líneas 241-275) — bloques con `# Comando del autor:` + `# Lo que hace el skill:`. Clonar formato.

**Para el batch — ejemplos a incluir:**
```
/gsd-validate-batch preposiciones      # 49 pendientes de la primera categoría
/gsd-validate-batch --all-pending      # 269 pendientes en orden D-VAL-22
/gsd-validate-batch preposiciones-031,preposiciones-032,preposiciones-047  # re-validar disputed resueltos
```

---

### `scripts/run-validation-271.mjs` (reporter, batch read-only + transform)

**Analog:** `scripts/run-validation-pilot.mjs` (Phase 9 Plan 09-03)
**Match quality:** exact — mismo patrón POST-processing puro, mismo proyecto.

**Header comment pattern** (líneas 1-27) — purpose + justificación + constraint + exit codes:

```javascript
#!/usr/bin/env node
// scripts/run-validation-pilot.mjs
//
// Reporter del piloto Phase 9 (Plan 09-03) — enforce del gate D-VAL-15.
// ...
// CONSTRAINT (arquitectónica): este script es POST-processing puro. NO invoca
// Task(), NO orquesta subagents, NO muta JSONs — solo lee los archivos que el
// skill YA mutó y verifica el gate. La orquestación es del skill (Plan 09-02).
//
// Uso:
//   node scripts/run-validation-pilot.mjs
//
// Exit codes:
//   0 — los 4 must-haves del gate D-VAL-15 PASS. Phase 10 autorizada.
//   1 — al menos 1 must-have FAIL. Itera Plan 09-01/09-02 antes de Phase 10.
```

**Imports pattern** (líneas 29-37) — zero-deps `node:fs`, `node:url`, `node:path` + `deriveStatus` desde el módulo puro:

```javascript
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
```

**ANSI colors pattern** (líneas 39-48) — zero-deps helpers:

```javascript
// ANSI colors zero-deps (RESEARCH §Recomendaciones #5).
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const ok = (txt) => `${GREEN}${txt}${RESET}`;
const fail = (txt) => `${RED}${txt}${RESET}`;
const warn = (txt) => `${YELLOW}${txt}${RESET}`;
```

**Defensive loader pattern** (líneas 73-90) — lectura JSON con catch + shape check (NO throws, devuelve `{found, ex}` o `{found, error}`):

```javascript
function loadExercise(file, exerciseId) {
  const absPath = resolve(projectRoot, file);
  let data;
  try {
    data = JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (err) {
    return { found: false, error: `Error al leer ${file}: ${err.message}` };
  }
  if (!data || !Array.isArray(data.exercises)) {
    return { found: false, error: `${file}: falta el campo "exercises"` };
  }
  const ex = data.exercises.find((e) => e?.id === exerciseId);
  if (!ex) {
    return { found: false, error: `Ejercicio '${exerciseId}' no encontrado en ${file}` };
  }
  return { found: true, ex };
}
```

**Defensive reads on passes pattern** (líneas 92-105) — `p?.verdict`, `Array.isArray()` checks, sin throws:

```javascript
function passSummary(p) {
  if (!p || typeof p !== 'object') return 'MISSING';
  const by = p.by ?? '?';
  const verdict = p.verdict ?? '?';
  const shortBy = by.replace(/^claude-/, '');
  return `${shortBy}/${verdict}`;
}

function hasParseMeta(concerns) {
  if (!Array.isArray(concerns)) return false;
  return concerns.some((c) => typeof c === 'string' && /parse failed|parse retry/.test(c));
}
```

**Tabla padded pattern** (líneas 191-249) — colWidths + headerRow + `'-'.repeat(headerRow.length)` + iteración + ANSI markers:

```javascript
const colWidths = {
  label: 5,
  exerciseId: 32,
  pass1: 28,
  pass2: 28,
  derivedStatus: 12,
  expected: 12,
  gate: 6,
};

const headerRow =
  'Label'.padEnd(colWidths.label) + ' | ' +
  'Exercise ID'.padEnd(colWidths.exerciseId) + ' | ' +
  /* ... */;

console.log(headerRow);
console.log('-'.repeat(headerRow.length));

for (const r of rows) {
  const gateCell = r.gate ? ok('PASS'.padEnd(colWidths.gate)) : fail('FAIL'.padEnd(colWidths.gate));
  console.log(/* ... */);
}
```

**Sub-gates aggregation pattern** (líneas 251-285):

```javascript
console.log(`${BOLD}Gate D-VAL-15 (4 must-haves):${RESET}`);

const subGates = [];

const e1 = rows.find((r) => r.label === 'E1');
const e1Pass = e1 && !e1.missing && e1.derivedStatus === 'validated';
subGates.push({ id: 1, label: 'E1 (preposiciones-040) → validated', pass: e1Pass });
// ... más sub-gates ...

for (const g of subGates) {
  const mark = g.pass ? ok('PASS') : fail('FAIL');
  console.log(`  ${g.id}. ${g.label}: ${mark}`);
}

const gatePass = subGates.every((g) => g.pass);
```

**Exit gate pattern** (líneas 287-301):

```javascript
console.log('');
if (gatePass) {
  console.log(ok(`${BOLD}Piloto PASS — Phase 10 autorizada.${RESET}`));
  console.log('');
  process.exit(0);
} else {
  console.log(fail(`${BOLD}Piloto FAIL — itera Plan 09-01 o Plan 09-02 antes de Phase 10.${RESET}`));
  console.log('');
  console.log('Acciones sugeridas según qué sub-gate falla:');
  console.log('  - Sub-gates 1 ó 2 (E1/E2 no validated): probablemente sesgo del prompt o bug en el ejercicio real. Inspecciona concerns[] de los pases.');
  /* ... */
  process.exit(1);
}
```

**Adaptaciones Phase 10:**
- Reemplazar `PILOT_EXERCISES` (3 IDs hardcoded) por `CATEGORIES` (7 entries: slug, file, expected count) — esqueleto en RESEARCH Q5 línea 394-402.
- Sub-gates: 3 en vez de 4 (RESEARCH Q5 + Q6 — VAL-07 smoke test es paso separado manual):
  1. **VAL-04** — `passes.length ≥ 2 && new Set(passes.filter(verdict=correcta).map(by)).size ≥ 2`.
  2. **VAL-06** — `totalValidated === 271`.
  3. **VAL-08** — `totalDisputed === 0`.
- **Override path-B relax (RESEARCH Open Q #1):** si `deriveStatus === "disputed"` PERO existe entry `{by:"autor", verdict:"correcta"}` → treat as validated. Implementar como helper:

```javascript
function effectiveStatus(passes) {
  const derived = deriveStatus(passes);
  if (derived !== 'disputed') return derived;
  const hasAuthorOverride = passes.some(
    (p) => p?.by === 'autor' && p?.verdict === 'correcta'
  );
  return hasAuthorOverride ? 'validated' : 'disputed';
}
```

- Exit PASS message: imprimir comando literal `VAL_07_STRICT=1 node --test tests/*.test.js` (RESEARCH Q5 líneas 480-484).

---

### `content/exercises/<categoria>.json` ×7 (content/data, CRUD-write field-add)

**Analog:** `preposiciones-040` y `avere-001` (ya mutados por el piloto Phase 9). Misma estructura para los 269 pendientes.

**Shape exacto del `validation` field** (ya en disco en `content/exercises/preposiciones.json` ejercicio `-040`):

```json
"validation": {
  "status": "validated",
  "passes": [
    {
      "by": "claude-opus-4-7",
      "date": "2026-05-26",
      "verdict": "correcta",
      "concerns": []
    },
    {
      "by": "claude-sonnet-4-6",
      "date": "2026-05-26",
      "verdict": "correcta",
      "concerns": []
    }
  ]
}
```

**Shape para disputed (futuro, generado por el skill hijo):**

```json
"validation": {
  "status": "disputed",
  "passes": [
    {
      "by": "claude-opus-4-7",
      "date": "2026-05-26",
      "verdict": "incorrecta",
      "concerns": ["[C5-leak] el prompt contiene '(refuerzo regla §1 ...)' — viola R1."]
    },
    {
      "by": "claude-sonnet-4-6",
      "date": "2026-05-26",
      "verdict": "incorrecta",
      "concerns": ["[C5-leak] ..."]
    }
  ]
}
```

**Shape para path-B override (RESEARCH Q4 §Path-B):**

```json
"validation": {
  "status": "validated",
  "passes": [
    {"by":"claude-opus-4-7", "date":"...", "verdict":"incorrecta", "concerns":["[C2-una_opcion] ..."]},
    {"by":"claude-sonnet-4-6", "date":"...", "verdict":"incorrecta", "concerns":["[C2-una_opcion] ..."]},
    {
      "by": "autor",
      "date": "2026-05-26",
      "verdict": "correcta",
      "concerns": ["[override] autor mantiene original tras revisión: <razón en una línea>"]
    }
  ]
}
```

**Schema enforcement** (`src/data/schema-validator.js::validateValidationShape` líneas 313-359):

```javascript
const VALID_STATUS = ['pending', 'validated', 'disputed'];
const VALID_VERDICT = ['correcta', 'incorrecta'];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

if (!VALID_STATUS.includes(v.status)) {
  push(file, ex.id, `"validation.status" inválido: ...`);
}
if (typeof p.by !== 'string' || !p.by.trim()) { /* error */ }
if (typeof p.date !== 'string' || !ISO_DATE.test(p.date)) { /* error */ }
if (!VALID_VERDICT.includes(p.verdict)) { /* error */ }
if (p.concerns !== undefined && (!Array.isArray(p.concerns) || ...)) { /* error */ }
```

**Pase entry path-B `{by:"autor", verdict:"correcta"}` cumple el schema** porque `by` es string no vacío, `verdict` está en whitelist, `concerns` es string array. **El schema NO requiere que `by` sea un model ID** — el `"autor"` literal pasa.

**Mutación rule (paths A/C reset):** cuando el batch ejecuta Edit tool tras un fix/rewrite (RESEARCH Q4 §Path-A / §Path-C), debe escribir:

```json
"validation": {
  "status": "pending",
  "passes": []
}
```

ANTES de invocar `gsd-validate-exercise <id>` — esto materializa el BYPASS sticky (D-VAL-25) sin tocar el skill base Phase 9.

---

### `.planning/STATE.md` (planning state, append-write checkpoint)

**Analog:** secciones existentes de STATE.md (no leído inline pero el patrón es consistente con resto del proyecto).

**Pattern:** al cerrar cada categoría, append a "Current Position":

```
Phase 10 — Categoría preposiciones cerrada (2026-MM-DD)
  - validated: 45/49 (preposiciones-001..038, -040..045)
  - disputed-resolved: 4 (-031 accept-fix, -032 reject+override, -047 rewrite, -049 accept-fix)
  - disputed-deferred: 0
```

Sección adicional `## Deferred-disputed` (RESEARCH Q1 §Paso 3.3) para path-d (skip):

```
## Deferred-disputed
- preposiciones-049 (2026-05-27): deferred por autor — razón: "necesito revisar PDF profesora"
```

---

### `README.md` (docs, append-write — opcional)

**Analog:** README existente del proyecto.

**Sección a añadir (RESEARCH Q6):**

```markdown
## Validación editorial (milestone v1.1)

Tras validar todos los 271 ejercicios y cerrar el milestone, activa el smoke
test estricto para prevenir regresiones:

```bash
# Linux/macOS
VAL_07_STRICT=1 node --test tests/*.test.js
```

Una vez activo, cualquier ejercicio nuevo sin `validation.status === "validated"`
romperá el test → previene merge accidental de contenido sin validar.
```

---

## Shared Patterns

### Mensajes en español al stdout (FOUND-04)

**Source:** `.claude/skills/gsd-validate-exercise/SKILL.md` críticos constraint #4 (línea 29) + `scripts/run-validation-pilot.mjs` líneas 297-298 + (cualquier output del piloto).

**Apply to:** banners del sub-skill batch (resumen por categoría, cola disputed, suggested fix), tabla del reporter `run-validation-271.mjs`, mensajes de error.

**Excerpt canónico:**

```javascript
console.log(ok(`${BOLD}Piloto PASS — Phase 10 autorizada.${RESET}`));
// ...
console.log('Acciones sugeridas según qué sub-gate falla:');
console.log('  - Sub-gates 1 ó 2 (E1/E2 no validated): probablemente sesgo del prompt...');
```

**Constraint:** el VALIDATION-PROMPT.md que viaja al subagent puede quedarse en español (ya lo está) — sólo aplica a output al autor.

### Defensive reads de `passes[]` (D-VAL-07 + zero-throws)

**Source:** `src/data/validation-state.js::deriveStatus` líneas 32-42 + `scripts/run-validation-pilot.mjs` líneas 156-170.

**Apply to:** cualquier código (batch skill, reporter) que lea `validation.passes[]`. Usar `p?.verdict`, `Array.isArray()` checks, sin throws.

**Excerpt:**

```javascript
// validation-state.js
const hasIncorrecta = passes.some(p => p?.verdict === 'incorrecta');
const correctas = passes.filter(p => p?.verdict === 'correcta');
const distinctBy = new Set(correctas.map(p => p?.by).filter(Boolean));

// run-validation-pilot.mjs
const hasIncorrecta = passes.some((p) => p?.verdict === 'incorrecta');
const hasTaggedConcern = passes.some(
  (p) =>
    Array.isArray(p?.concerns) &&
    p.concerns.some(
      (c) => typeof c === 'string' && c.startsWith(expectedConcernPrefix),
    ),
);
```

### Zero-deps invariant (CLAUDE.md + D-08)

**Source:** `.claude/skills/gsd-validate-exercise/SKILL.md` constraint zero-deps (línea 37) + el hecho de que ningún `package.json` existe en el proyecto.

**Apply to:** todo nuevo código Phase 10. Cero `npm install`, cero Ajv/Zod, cero `child_process` con Anthropic SDK. Solo herramientas nativas (Read/Write/Edit/Bash/Glob/Grep/Task/AskUserQuestion/Skill) y `node` builtin modules (`node:fs`, `node:url`, `node:path`, `node:assert/strict`).

### Commit atómico 1-por-ejercicio (D-VAL-04 + Pattern 2)

**Source:** `.claude/skills/gsd-validate-exercise/SKILL.md` Paso 9 (líneas 176-194).

**Apply to:** el sub-skill batch en path-A/B/C cuando hace commits propios (fix-snapshot, override, rewrite-snapshot). El skill hijo ya hace su commit de la re-validación (paths A/C).

**Templates por path** (RESEARCH Q8):

```bash
# Path-A (Accept fix): 2 commits
git commit -m "fix(<cat>): <id> — autor acepta sugerencia post-disputed ([Cn-...])"
# [invoca skill hijo, que hace su commit; luego el batch hace amend para sufijo]
git commit --amend -m "validate(<cat>): <id> → validated POST-fix (Opus + Sonnet, accept fix tras disputed)"

# Path-B (Reject + override): 1 commit
git commit -m "validate(<cat>): <id> → validated (override autor, post-disputed)"

# Path-C (Rewrite manualmente): 2 commits
git commit -m "rewrite(<cat>): <id> — autor reescribe post-disputed"
# [invoca skill hijo, amend]
git commit --amend -m "validate(<cat>): <id> → validated POST-rewrite (Opus + Sonnet)"
```

### AskUserQuestion para checkpoints + cola disputed (D-VAL-23 + D-VAL-26)

**Source:** convención del proyecto (anclado en `<task type="checkpoint:human-verify">` Phase 9 Plan 09-03 + el `gsd-validate-exercise` error_handling tabla).

**Apply to:** sub-skill batch en:
1. Checkpoint fin-de-categoría: `"Continuar" / "Pausar"`.
2. Cola disputed (4 opciones D-VAL-26): `"Accept fix" / "Reject + override" / "Rewrite manualmente" / "Skip (defer al final del milestone)"`.
3. Override path-B follow-up: prompt textual "¿Razón del override (una línea)?".
4. Rewrite path-C confirmación: `"Sí, ya guardé y re-validar" / "No, cancelar (saltar al siguiente disputed)"`.
5. Reconsider trigger preposiciones <5% dispute-rate: `"Continuar con avere" / "Pausar para reconsiderar"`.

**Constraint arquitectónico (RESEARCH Q2):** AskUserQuestion NO funciona dentro de Task() subagents. El batch DEBE correr inline en main session (sin `context: fork`). Documentar este invariante en `<critical_constraints>` del nuevo SKILL.md.

---

## Cross-Cutting Concerns

### Pre-flight check: `stripAdditive()` relax debe estar funcional ANTES de mutar avere

**Source:** `scripts/assert-avere-prefix-unchanged.mjs` líneas 26-31 (relax para `validation` field documentado).

**Apply to:** orden D-VAL-22 → cuando llegue el turno de `avere` (2ª categoría), verificar que Phase 9 Plan 09-02 ya está mergeado. El piloto Phase 9 P09-03 confirmó: `avere-001` ya validated con `validation` field y el assert pasó — la relax YA funciona.

**Pre-flight comando:**

```bash
node scripts/assert-avere-prefix-unchanged.mjs
echo "exit code: $?"  # debe ser 0 antes de empezar avere
```

**Si exit != 0 antes de empezar avere:** STOP, el invariante D-88 está roto pre-Phase-10. Investigar manualmente (no es problema de Phase 10).

**Si exit != 0 después de mutar avere (RESEARCH Q10):** banner pausa + AskUserQuestion al autor con 3 opciones:
1. Regenerar snapshot con `node scripts/snapshot-avere-prefix.mjs` (si las mutaciones son intencionales).
2. Revertir el último commit del path-A/C que tocó el prefix.
3. Pausar el batch para revisar manualmente.

### Schema validation post-mutation (defensive)

**Source:** `src/data/schema-validator.js::validateValidationShape` + `scripts/validate-content-fixture.mjs`.

**Apply to:** el sub-skill batch puede invocar `scripts/validate-content-fixture.mjs` POST-mutation al cierre de cada categoría (RESEARCH Open Q #3, recomendación: SÍ defensive). Si fail → surface al autor.

```bash
# Al cierre de cada categoría:
node scripts/validate-content-fixture.mjs
# Si exit != 0 → JSON corrompido por algún Edit, revertir último commit.
```

### Resume idempotente (D-VAL-19)

**Source:** D-VAL-19 + RESEARCH Q7.

**Apply to:** sub-skill batch en el Paso 2.1 (filtrar pendientes).

```javascript
// Pseudocódigo del filtro (a implementar via Read + node -e oneliner):
const data = JSON.parse(readFileSync(`content/exercises/${cat}.json`, 'utf8'));
const pending = data.exercises.filter(ex => ex.validation?.status !== 'validated');
// Iterate solo pending. Crash / Ctrl-C / re-invoke al día siguiente → re-arranca limpio.
```

---

## Blocking Order Note

**Phase 9 Plan 09-02 (`stripAdditive()` relax para `validation`) DEBE estar mergeado antes de empezar la categoría avere (D-VAL-22 #2).**

- ✅ Confirmado en Phase 9 P09-03 piloto: `avere-001` ya tiene `validation` field y `scripts/assert-avere-prefix-unchanged.mjs` exit 0.
- ✅ Confirmado en `scripts/assert-avere-prefix-unchanged.mjs` líneas 26-31 — relax `validation` documentado.
- ✅ Confirmado en lectura directa: el campo `validation` está presente en `avere-001` y el script ignora ese campo en su deepStrictEqual.

**Acción de plan-time:** incluir el comando `node scripts/assert-avere-prefix-unchanged.mjs` como pre-flight check **antes** del primer `gsd-validate-exercise avere-NNN` (e.g. en el Paso 2.1 del sub-skill cuando `cat === "avere"`). Si exit != 0 → STOP batch + alert autor (Phase 9 hipotéticamente revertida).

**Para categorías NO blindadas (preposiciones, essere, genero-numero, profesiones, sustantivos-irregulares, verbos-movimiento):** sin pre-flight assert. Solo el reporter final (`scripts/run-validation-271.mjs`) verifica consistencia global.

---

## Decision Tree para el Planner

| Pregunta del planner | Respuesta basada en patterns |
|----------------------|------------------------------|
| ¿Cómo estructurar el SKILL.md? | Copiar exacta estructura de `gsd-validate-exercise/SKILL.md` — `<objective>`, `<critical_constraints>`, `<execution>` con pasos numerados, `<error_handling>` tabla, `<read_first_per_invocation>`, `<example_invocations>`. |
| ¿Qué tools listar en `allowed-tools`? | Read, Write, Edit, Bash, Glob, Grep, Task, **AskUserQuestion**, **Skill** (los 2 últimos son nuevos vs skill base; RESEARCH Q1). |
| ¿`context: fork` en el frontmatter? | **NO.** Invariante arquitectónico (RESEARCH Q1 + Q2). Documentar en `<critical_constraints>`. |
| ¿Cómo iterar IDs sin batched-curation? | Loop pseudocódigo en `<execution>` instruye al LLM principal "para cada ID en pendientes, usa Skill tool: `gsd-validate-exercise <id>`". Cada invocación es independiente (D-VAL-20). |
| ¿Cómo escribir el reporter? | Copiar `scripts/run-validation-pilot.mjs` literal. Sustituir `PILOT_EXERCISES` (3) por `CATEGORIES` (7). 3 sub-gates en vez de 4. Helper `effectiveStatus()` para path-B relax. |
| ¿BYPASS sticky D-VAL-25 paths A/C? | Edit tool en el batch resetea `validation = {status:"pending", passes:[]}` ANTES de invocar el skill hijo. Cero cambios al skill base (RESEARCH Q4). |
| ¿Commit sufijo POST-fix/POST-rewrite? | `git commit --amend` con nuevo subject tras el commit del skill hijo. Posible porque el proyecto no tiene hooks (RESEARCH Q8). |
| ¿File-save detection en path-C rewrite? | AskUserQuestion `"¿Has guardado los cambios?"`, NO file-watcher / mtime poll (RESEARCH Q3). |
| ¿`VAL_07_STRICT=1` flip automático? | NO — README documenta, autor flippea manual al cierre (RESEARCH Q6 + CONTEXT Claude's Discretion). |

---

## Metadata

**Analog search scope:**
- `.claude/skills/` (1 skill existente: `gsd-validate-exercise`)
- `scripts/` (5 scripts existentes, todos zero-deps; el más cercano: `run-validation-pilot.mjs`)
- `content/exercises/` (7 categorías; 2 ejercicios ya con `validation` field: `preposiciones-040`, `avere-001`)
- `src/data/` (helpers puros: `validation-state.js::deriveStatus`, `schema-validator.js::validateValidationShape`)

**Files scanned:** 8 (todos leídos en su rango relevante, sin re-reads)
**Pattern extraction date:** 2026-05-26
**Phase 9 deliverables verified intact:** sí — `gsd-validate-exercise/SKILL.md` (282 líneas), `run-validation-pilot.mjs` (301 líneas), `validation-state.js` (42 líneas), `schema-validator.js::validateValidationShape` (47 líneas), `assert-avere-prefix-unchanged.mjs` (header confirma `validation` relax).
