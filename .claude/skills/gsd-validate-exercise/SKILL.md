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

<objective>
Workflow editorial 1-por-1 NUNCA batched para validar UN ejercicio JSON contra los 5 criterios C1-C5 (operacionalización de R1-R7) usando quórum de 2 modelos Claude distintos (Opus + Sonnet). Implementa VAL-02 (5 criterios documentados) + VAL-03 (workflow 1-por-1 con justificación).

Salida observable: el campo `validation.passes[]` del ejercicio queda populado con 2 entries (1 por modelo), `validation.status` derivado por `deriveStatus()`, y se hace 1 commit atómico (granularidad: 1 ejercicio = 1 commit, NO 1 commit por pase).
</objective>

<critical_constraints>

- **NUNCA batched: el subagent ve SOLO 1 ejercicio por spawn (VAL-03 — root cause de los 4 bugs motivadores cazados post-v1.0 fue batched-curation con ~17 ejercicios por contexto compartido).** Si el autor pide validar 30 ejercicios, este skill se ejecuta 30 veces — UN spawn por ejercicio, JAMÁS un spawn con 30 ejercicios en el prompt. Esta es la garantía arquitectónica que cierra el bug class.

- **Model IDs EXPLÍCITOS y literales: `claude-opus-4-7` para el Pase 1 y `claude-sonnet-4-6` para el Pase 2 (D-VAL-02).** NO usar `model: inherit`, NO usar aliases `opus` / `sonnet` / `haiku`. El audit trail en `passes[].by` debe ser estable a lo largo del tiempo — los aliases pueden remapearse silenciosamente, los model IDs completos NO. Coherente con CLAUDE.md "pinned versions" (D-VAL-02).

- **Subagent NO hereda contexto del padre.** El subagent spawneado por `Task()` arranca con context window vacío. NO ve `CLAUDE.md`, NO ve `.planning/`, NO ve las memorias persistentes del autor (`~/.claude/projects/.../memory/exercise_authoring_rules.md`), NO ve otros ejercicios. El `09-VALIDATION-PROMPT.md` es self-contained con R1-R7 inline literales — es la única fuente de reglas que el subagent ve. NO añadir referencias a archivos externos en el prompt enviado al Task().

- **Mensajes hacia el autor en español (FOUND-04).** Banners, errores, output del skill al stdout/stderr → todo en castellano. El propio `09-VALIDATION-PROMPT.md` también está en español. Los `concerns[]` emitidos por el subagent quedarán en español porque el prompt está en español.

- **Spawn SECUENCIAL Pase 1 → Pase 2, NO paralelo (D-VAL-04 lock; RESEARCH Open Q1).** Primero Task() con Opus, esperar su output, parsear su verdict; LUEGO Task() con Sonnet. La secuencialidad es la elección conservadora del piloto Phase 9 — el debug es más simple (1 output a la vez al log) y la latencia ~2x es aceptable porque Phase 9 es 3 ejercicios. Phase 10 plan-time podrá pivotar a paralelo si el piloto pasa limpio.

- **Retry budget = 1 (D-VAL-04 + RESEARCH §Example 3).** Si el output de un Task() no contiene un bloque fenced ```json parseable con `JSON.parse` strict, RE-spawnar EL MISMO modelo UNA VEZ con prompt extendido "Tu output anterior fue malformado, emite ÚNICAMENTE el bloque JSON sin razonamiento adicional, con el shape exacto de la sección 4". Si el 2º intento también falla → marcar ese pase con `verdict: null` + `concerns: ["[meta] parse failed twice — autor revisa manualmente"]` y dejar el ejercicio en status `pending`. Surface al autor mediante banner en español.

- **Commit granularity: 1 commit por ejercicio, NO 1 por pase (D-VAL-04 + RESEARCH §Pattern 2).** Los 2 pases del MISMO ejercicio son una unidad lógica; van en el MISMO commit. Phase 10 producirá ~271 commits, NO 542. Template del mensaje en `<execution>`.

- **Zero-deps invariant (CLAUDE.md).** El skill orquesta vía herramientas nativas Read/Write/Edit/Bash/Glob/Grep/Task. Cero gestores de paquetes, cero dependencias añadidas a `package.json` (que ni siquiera existe), cero `child_process` con Anthropic SDK. Si una operación requiere mutar JSON in-place, se hace con Edit tool o con `node -e` oneliner zero-deps.

- **`--dry-run`: imprime el prompt compuesto + el JSON del ejercicio que se pasaría al subagent SIN spawnear Task() ni mutar archivos.** Útil para debug del piloto y para que el autor revise el prompt antes de cada batch.

</critical_constraints>

<execution>

Pasos 1-9 del workflow (pseudocódigo + tools concretos):

**Paso 1 — Leer VALIDATION-PROMPT.md (la fuente de verdad del prompt)**

```
Read tool: .planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md
→ guarda el contenido completo en variable VALIDATION_PROMPT
```

**Paso 2 — Resolver `<exercise-id>` por SCAN exacto del campo `id`**

```
Glob: content/exercises/*.json + tests/fixtures/*.json
For each file:
  - Read tool con offset/limit suficiente (o node -e oneliner JSON.parse + .find)
  - Buscar match EXACTO (NO substring) sobre `exercises[].id`
Return: {file, index, exerciseObject}
```

Si el `<exercise-id>` no aparece en ningún archivo → exit con mensaje en español:

```
Error: el ejercicio '<exercise-id>' no se encuentra en content/exercises/*.json ni en tests/fixtures/*.json.
IDs disponibles (primeros 10): avere-001, avere-002, ..., pilot-disputed-c5-leak-001.
Verifica que el id está bien escrito (case-sensitive, sin espacios).
```

**Paso 3 — Extraer el JSON del ejercicio**

```
node -e "
const data = JSON.parse(require('fs').readFileSync('<file>','utf8'));
const ex = data.exercises.find(e => e.id === '<exercise-id>');
console.log(JSON.stringify(ex, null, 2));
"
→ guarda el JSON pretty-printed en variable EXERCISE_JSON
```

**Paso 4 — Componer prompt completo para el subagent**

```
COMPOSED_PROMPT = VALIDATION_PROMPT + "\n\n## Ejercicio bajo evaluación (DATA)\n\n```json\n" + EXERCISE_JSON + "\n```\n"
```

Si `--dry-run` está activo: imprimir `COMPOSED_PROMPT` por stdout y salir.

**Paso 5 — Spawn 2 Task() en SECUENCIAL (NO paralelo)**

Pase 1 — Opus:
```
Task(
  subagent_type: "general-purpose",
  model: "claude-opus-4-7",
  prompt: COMPOSED_PROMPT
)
→ guarda el output completo en variable OPUS_OUTPUT
```

Esperar a que termine. LUEGO Pase 2 — Sonnet:
```
Task(
  subagent_type: "general-purpose",
  model: "claude-sonnet-4-6",
  prompt: COMPOSED_PROMPT
)
→ guarda el output completo en variable SONNET_OUTPUT
```

**Paso 6 — Parsear el bloque fenced JSON de cada output (con retry 1×)**

Helper `extractJsonBlock(output)` — regex greedy + último match (alineado con la instrucción "emite al FINAL del razonamiento"):

```javascript
function extractJsonBlock(output) {
  const re = /```json\s*([\s\S]*?)\s*```/g;
  let match, lastJson;
  while ((match = re.exec(output)) !== null) lastJson = match[1];
  return lastJson || null;
}
```

Helper `parseVerdict(output)`:
- `raw = extractJsonBlock(output)` → si null, retry.
- `try { return JSON.parse(raw); } catch { retry; }`

Retry budget = 1: si el 1er intento falla a extraer o parsear, re-spawnar EL MISMO modelo con prompt extendido:

```
COMPOSED_PROMPT_RETRY = COMPOSED_PROMPT + "\n\n**IMPORTANTE:** tu output anterior fue malformado. Emite ÚNICAMENTE el bloque ```json con el shape de la sección 4. Sin razonamiento adicional, sin texto extra antes o después del bloque. Solo el JSON parseable.\n"
```

Si el 2º intento también falla → ese pase queda con `verdict: null` + `concerns: ["[meta] parse failed twice — autor revisa manualmente"]`. NO bloquea el otro pase (si Opus falla 2× pero Sonnet PASS, sigue habiendo 1 pase válido — el ejercicio quedará en `pending` y el autor decide).

**Paso 7 — Construir las 2 entries para `validation.passes[]`**

```javascript
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const opusEntry = {
  by: "claude-opus-4-7",
  date: today,
  verdict: opusParsed.verdict,        // "correcta" | "incorrecta" | null si parse failed
  concerns: opusParsed.concerns || [] // tagged [Cn-criterio]
};
const sonnetEntry = {
  by: "claude-sonnet-4-6",
  date: today,
  verdict: sonnetParsed.verdict,
  concerns: sonnetParsed.concerns || []
};
```

Importar `deriveStatus` de `src/data/validation-state.js` (módulo puro Plan 09-01, helper D-VAL-07 sticky disputed):

```javascript
// node -e oneliner zero-deps
import { deriveStatus } from './src/data/validation-state.js';
const status = deriveStatus([opusEntry, sonnetEntry]);
// "validated" si 2× correcta con by distintos
// "disputed"  si CUALQUIER incorrecta (sticky)
// "pending"   en cualquier otro caso (incl. null verdicts)
```

**Paso 8 — Mergear `validation = {status, passes}` al JSON del ejercicio (preserva resto)**

Usar el Edit tool sobre el archivo de categoría (`<file>` resuelto en Paso 2):

- Si el ejercicio NO tiene aún campo `validation`: Edit añade el campo al objeto.
- Si el ejercicio ya tiene `validation.passes[]` (re-validación): la decisión por defecto es APPEND (no reemplazar) — los pases nuevos se añaden al array existente, `deriveStatus` recalcula sobre el array completo. Si el autor quiere reemplazar pases existentes, lo hace manualmente antes de invocar el skill.

Verificar que el JSON resultante sigue validando contra `validateValidationShape` (Plan 09-01) — el script `validate-content-fixture.mjs` debe seguir exit 0.

**Paso 9 — Commit atómico 1-por-ejercicio (granularidad VAL-03 + Pattern 2 RESEARCH)**

Template del mensaje (Bash heredoc):

```bash
git add <file>
git commit -m "$(cat <<EOF
validate(<categoria>): <exercise-id> → <status> (Opus + Sonnet)

passes[0]: claude-opus-4-7 — <opus.verdict>
passes[1]: claude-sonnet-4-6 — <sonnet.verdict>
concerns: <count total>
EOF
)"
```

Ejemplos:
- Validated:  `validate(avere): avere-001 → validated (Opus + Sonnet)\n\npasses[0]: claude-opus-4-7 — correcta\npasses[1]: claude-sonnet-4-6 — correcta\nconcerns: 0`
- Disputed:   `validate(genero-numero): pilot-disputed-c5-leak-001 → disputed (Opus + Sonnet)\n\npasses[0]: claude-opus-4-7 — incorrecta\npasses[1]: claude-sonnet-4-6 — incorrecta\nconcerns: 2 ([C5-leak] ...)`

</execution>

<error_handling>

| Caso | Acción | Mensaje al autor (español) |
|------|--------|----------------------------|
| `<exercise-id>` no existe | Exit 1 sin spawnear Task() | "Error: el ejercicio '<id>' no se encuentra. IDs disponibles: [list scan]" |
| Subagent crashea (Task() lanza error) | Re-spawn 1×; si vuelve a crashear, exit 1 | "Error: el subagent {model} crasheó 2 veces — verifica el rate limit o la disponibilidad del modelo" |
| Parse JSON falla 2× | Marca el pase con `verdict: null` + `concerns: ["[meta] parse failed twice"]` | "Aviso: el pase {model} devolvió output malformado 2 veces. Ejercicio queda en `pending`; revisa el output manualmente." |
| `deriveStatus` retorna `pending` con 2 pases válidos (no debería pasar tras 2 modelos distintos correctas) | Continúa, comitea, surface alerta | "Aviso: status derivado = pending pese a 2 pases. Probable bug — revisa `passes[].by` por duplicados." |
| Git commit falla (pre-commit hook rechaza, etc.) | Exit 1, no mutar JSON | "Error: el commit falló. Inspecciona `git status` y resuelve manualmente." |
| `--dry-run` activo | Imprime prompt compuesto, NO spawnea Task(), NO modifica archivos | "Modo dry-run: prompt compuesto impreso por stdout. No se han ejecutado pases ni commits." |

</error_handling>

<workflow_justification_no_batched>

**Por qué NUNCA batched (justificación VAL-03 verbatim al autor):**

Los 4 bugs motivadores de v1.1 (preposiciones-040 `dai amici`, -032 `nelle pareti`, -047 `cadere sugli alberi`, -031 `libri/scaffali`) fueron cazados por el autor por CASUALIDAD en uso real durante post-ship v1.0. La causa raíz fue el workflow editorial de Phase 7: batched-curation con ~17 ejercicios por batch en un mismo contexto del LLM (Claude/Gemini) y revisión humana global del batch.

Bajo batched-curation, el LLM perdía atención sobre ejercicios individuales — el contexto compartido producía deriva entre ejercicios (un ejercicio influía sutilmente en cómo el LLM generaba el siguiente). La revisión humana del batch en global no detectaba los bugs sutiles porque el revisor también miraba 17 a la vez.

**1-por-1 con fresh context elimina la deriva por construcción:** cada Task() spawn arranca con context window vacío, NO ve los 270 ejercicios anteriores, NO ve los 270 siguientes. Solo ve `<este ejercicio>` + el prompt R1-R7 verbatim. La calidad de juicio por ejercicio sube; el coste (tokens) sube ~2x; el bug class queda cerrado arquitectónicamente, no por convención humana.

**Quórum multi-modelo:** además de aislar el contexto, validamos con 2 modelos distintos (Opus + Sonnet) — un único pase puede tener falsos positivos / negativos. El quórum requiere consenso ≥2 distintos para `validated`; cualquier disensión cae a `disputed` (sticky, no auto-resuelve).

**Coste aceptado:** Phase 9 (3 ejercicios × 2 pases = 6 invocaciones) es trivial. Phase 10 (~271 ejercicios × 2 = ~542 invocaciones) consume ~1.5-2M tokens — el autor lo acepta a cambio de garantía editorial para los 271 ejercicios del proyecto. NO se valida más de lo necesario.

</workflow_justification_no_batched>

<read_first_per_invocation>

Antes de cada invocación, este skill DEBE leer (con Read tool):

1. `.planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — el prompt R1-R7 + C1-C5 + contrato JSON output (D-VAL-09/10/11). Self-contained — es lo único que se manda al subagent.

2. `src/data/validation-state.js` — para usar `deriveStatus(passes[])` en el Paso 7 (regla D-VAL-07 sticky disputed).

NO necesita leer:
- `CLAUDE.md` ni `~/.claude/projects/.../memory/exercise_authoring_rules.md` — sus reglas están YA inline en el VALIDATION-PROMPT.md.
- `src/data/schema-validator.js` — el shape del campo `validation` solo se enforca al boot vía `content-loader`; el skill confía en escribir el shape correcto (status enum + passes[] schema).

</read_first_per_invocation>

<example_invocations>

Validar 1 ejercicio del piloto (E1 = preposiciones-040):
```
# Comando del autor:
/gsd-validate-exercise preposiciones-040

# Lo que hace el skill:
# 1. Lee 09-VALIDATION-PROMPT.md
# 2. Resuelve preposiciones-040 → content/exercises/preposiciones.json @ index 39 (o el que sea)
# 3. Extrae el JSON del ejercicio
# 4. Compone el prompt completo
# 5. Task(model: claude-opus-4-7, prompt: ...) → output
# 6. Espera. Task(model: claude-sonnet-4-6, prompt: ...) → output
# 7. Parsea ambos verdicts. Construye passes[]. deriveStatus()
# 8. Edit content/exercises/preposiciones.json (añade validation a ese ejercicio)
# 9. git commit "validate(preposiciones): preposiciones-040 → validated (Opus + Sonnet)"
```

Validar el fixture E3 (C5-leak):
```
/gsd-validate-exercise pilot-disputed-c5-leak-001

# Mismo flujo, resuelve a tests/fixtures/validation-pilot-disputed.json
# El JSON tiene (refuerzo regla §1 fem -a→-e) en el prompt — Opus y Sonnet deben detectar C5-leak
# Commit esperado: "validate(genero-numero): pilot-disputed-c5-leak-001 → disputed (Opus + Sonnet)"
```

Dry-run sin spawnear Tasks:
```
/gsd-validate-exercise avere-001 --dry-run
# Imprime el prompt + el JSON que se pasaría a los Tasks. No spawn, no commit.
```

</example_invocations>

<gate_reminder>

El skill es la MÁQUINA. La calidad del workflow se mide por el piloto Phase 9 Plan 09-03 (3 ejercicios — E1 validated + E2 validated + E3 disputed). Si el piloto no PASS las 4 must-haves del gate D-VAL-15, este skill se itera ANTES de autorizar Phase 10 (cobertura 271/271).

</gate_reminder>
