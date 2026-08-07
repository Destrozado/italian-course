---
name: gsd-validate-batch
description: "Itera ejercicios pendientes de una categoría (o las 7 en orden lockeado D-VAL-22) invocando `gsd-validate-exercise` por cada ID. Procesa UNA categoría a la vez (checkpoint D-VAL-23), emite tabla resumen en español al cierre, ofrece la cola disputed VAL-08 (D-VAL-24/D-VAL-25/D-VAL-26) con 4 caminos terminales accept/reject/rewrite/skip. NUNCA batched — el sub-skill ITERA pero el skill hijo sigue siendo single-exercise con context aislado por Task() spawn (D-VAL-20)."
argument-hint: "<category> | --all-pending | <id1,id2,...>"
disable-model-invocation: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
  - Skill
---

<objective>
Orquestador inline en la sesión principal del autor para validar los 269 ejercicios pendientes del proyecto (271 totales − 2 piloto Phase 9) hasta llegar a `validation.status === "validated"` en los 7 archivos `content/exercises/<cat>.json`, salvo los que el autor difiera conscientemente vía camino (d) skip/defer (D-VAL-25). Cubre los requirements VAL-04 (≥2 pases AIs distintos por ejercicio), VAL-06 (271/271 validated) y VAL-08 (escalada disputed con UX inline accept/reject/rewrite/skip).

Salida observable: tras un run completo de `--all-pending` con la cola disputed resuelta (0 deferred), los 7 archivos `content/exercises/*.json` tienen `validation.status === "validated"` en todos sus ejercicios, con audit trail completo en `git log` (1 commit por ejercicio en el path normal + 1-2 commits adicionales por cada disputed resuelto vía paths a/b/c) y la sección `## Deferred-disputed` de `.planning/STATE.md` vacía o ausente. El reporter `scripts/run-validation-271.mjs` cierra el gate del milestone con exit 0.
</objective>

<critical_constraints>

- **Sub-skill INLINE en main session — NUNCA en modo fork del contexto.** Invariante arquitectónico (RESEARCH Q1/Q2). El frontmatter de este skill NO contiene el setting `context` con valor `fork` y NO debe añadirse jamás. Razón: (a) `AskUserQuestion` no está disponible en subagents spawneados vía `Task()` (anthropics/claude-code#18721) — sin él, el banner D-VAL-26 + checkpoint D-VAL-23 fallan. (b) Los subagents no pueden spawnear otros subagents (Claude Code docs `/en/sub-agents` "Subagents cannot spawn other subagents") — si este sub-skill corriera forkeado, no podría invocar `gsd-validate-exercise` que internamente usa 2 `Task()`. La "D-VAL-19 corre en su propio subagent" se entiende en sentido arquitectónico/conceptual (cuerpo del SKILL.md autocontenido), NO técnico (Task spawn aislado).

- **Sub-skill ITERA pero NUNCA compone N ejercicios en mismo `Task()` — el bucle inyecta UN id por invocación de `gsd-validate-exercise` (D-VAL-20).** Esta es la garantía arquitectónica que cierra el bug class de los 4 motivadores (preposiciones-040/-032/-047/-031). El sub-skill escala el bucle, NO afloja el aislamiento. Si en algún paso el LLM principal interpreta "agrupar 2 IDs en un solo prompt al skill hijo" como optimización válida, eso es violación directa de D-VAL-20 y debe rechazarse.

- **Resume idempotente: re-leer JSONs y filtrar `validation.status === "validated"` antes de iterar (D-VAL-19).** El estado de verdad vive en los JSONs de `content/exercises/`, NO en un manifest paralelo. Crash, Ctrl-C, session-limit del API, o re-invoke al día siguiente → el batch arranca limpio, autoskippa los ya-validated, retoma desde el primer pendiente. Cero acoplamiento entre runs.

- **Una sola categoría procesada por invocación; `--all-pending` encadena las 7 con `AskUserQuestion` intermedios (D-VAL-22 orden lockeado + D-VAL-23 checkpoint por categoría).** El sub-skill NO atraviesa límites de categoría sin pausa explícita del autor. 7 categorías = 7 checkpoints naturales con tabla resumen en español + opción "Continuar / Pausar".

- **Mensajes al autor en español (FOUND-04).** Banners de resumen por categoría, cola disputed, suggested fix derivado del tag `[Cn-criterio]`, tabla agregada al cierre, errores del sub-skill → todo en castellano. El `VALIDATION-PROMPT.md` que viaja al subagent sigue siendo el de Phase 9 (también en español) — este skill NO lo modifica.

- **Zero-deps invariant (CLAUDE.md + D-08).** Solo herramientas nativas (Read/Write/Edit/Bash/Glob/Grep/Task/AskUserQuestion/Skill) + Node builtins (`node:fs`, `node:path`, `node:url`). Cero gestores de paquetes, cero Ajv/Zod, cero `child_process` con SDKs externos. Cualquier oneliner Bash dentro del skill usa `node -e "..."` con builtins.

- **Commit granularity (D-VAL-04 extendido por D-VAL-25):** 1 commit por ejercicio en el path normal (lo hace el skill hijo `gsd-validate-exercise`). Paths a/c añaden 1 commit propio del batch (fix-snapshot o rewrite-snapshot) ANTES del re-validate, más un `git commit --amend` post-hoc al commit del skill hijo para añadir sufijo `POST-fix` / `POST-rewrite`. Path-b produce 1 commit propio (override + status directo). Path-d no produce commit (sólo append a STATE.md `## Deferred-disputed`, comiteado al cierre del scope).

- **El skill base `gsd-validate-exercise` (Phase 9) es INTOCABLE.** Este batch NO modifica `.claude/skills/gsd-validate-exercise/SKILL.md`, NO le pasa flags extra (su `argument-hint` es `<exercise-id> [--dry-run]` y se respeta), NO le inyecta contexto vía variables. Si emerge un bug sistémico del prompt durante el run, el autor itera `09-VALIDATION-PROMPT.md` (también de Phase 9) — pero el orquestador per-ejercicio queda igual.

</critical_constraints>

<execution>

Pasos 1-4 del workflow (pseudocódigo + tools concretos):

**Paso 1 — Resolver `<scope>` y normalizar la lista de categorías a procesar**

```
ARG = primer argumento literal de la invocación.

Si ARG es uno de los 7 slugs ASCII conocidos (preposiciones | avere | essere | genero-numero | profesiones | sustantivos-irregulares | verbos-movimiento):
  CATEGORIES = [ARG]

Si ARG === "--all-pending":
  CATEGORIES = ["preposiciones", "avere", "essere", "genero-numero", "profesiones", "sustantivos-irregulares", "verbos-movimiento"]
  # Orden lockeado D-VAL-22 — riesgo-first + alfabético.

Si ARG es lista CSV de IDs (contiene `,` o matchea `^<slug>-\d+$`):
  Glob: content/exercises/*.json
  Para cada ID en la lista CSV:
    - Read tool sobre los 7 JSONs hasta encontrar el `id` exacto.
    - Agrupar por archivo de categoría.
  CATEGORIES_BY_ID = {<cat>: [ids...], ...}
  El bucle de Paso 2 sólo procesa los IDs explícitos, NO la categoría completa.

Cualquier otro scope (slug no reconocido, archivo inexistente) → exit 1 con mensaje en español:
  "Error: scope '<arg>' no reconocido.
   Slugs válidos D-VAL-22: preposiciones, avere, essere, genero-numero, profesiones, sustantivos-irregulares, verbos-movimiento.
   Modo lote: --all-pending.
   Modo IDs: lista CSV de exercise IDs (ej. preposiciones-031,preposiciones-032)."
```

**Paso 2 — Para cada categoría en `CATEGORIES` (orden D-VAL-22):**

**Paso 2.1 — Pre-flight AVERE assert (solo si `cat === "avere"`):**

```bash
# Comando exacto que ejecuta el sub-skill antes de tocar avere:
node scripts/assert-avere-prefix-unchanged.mjs
echo "exit: $?"
```

Si exit != 0 → STOP batch con mensaje en español: `"El invariante D-88 AVERE prefix está roto pre-batch — investigar manualmente antes de continuar. Probable: Phase 9 Plan 09-02 stripAdditive() relax revertido. NO toques avere.json hasta restaurar el snapshot o aplicar stripAdditive()."` y exit 1. Si exit 0 → continuar.

**Paso 2.2 — Leer el JSON de la categoría:**

```
Read tool: content/exercises/<cat>.json
# O equivalente vía node -e oneliner para parsear:
node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/<cat>.json','utf8')); console.log(d.exercises.length);"
```

**Paso 2.3 — Filtrar pendientes (resume idempotente D-VAL-19):**

```javascript
// Aplicado conceptualmente en el LLM principal a partir del JSON leído:
const pending = data.exercises.filter(ex => ex.validation?.status !== "validated");
// pending.length === N a procesar.
// Crash a mitad del batch → al re-invocar, los ya-validated quedan filtrados out automáticamente.
```

Si `pending.length === 0` → imprimir `"Categoría <cat> ya completa (X/X validated). Pasando a la siguiente."` y `continue` al siguiente cat de CATEGORIES.

**Paso 2.4 — Inicializar contadores para el resumen de fin de categoría:**

```
disputedQueue[cat] = []   # IDs con status === "disputed" tras la pasada del skill hijo
pendingQueue[cat] = []    # IDs con status === "pending" (parse-failed double)
validatedCount = (data.exercises.length) - pending.length   # ya validated antes del run
```

**Paso 2.5 — Iterar `pending`, invocando el skill hijo por cada ID:**

Para cada `id` en `pending` (orden de aparición en el JSON):

**Paso 2.5.1 — Invocar el skill hijo `gsd-validate-exercise`:**

```
Skill(gsd-validate-exercise <id>)
# O, equivalentemente, instruir al LLM: "invoca el skill gsd-validate-exercise con argumento <id>"
# El skill hijo internamente:
#   - Lee 09-VALIDATION-PROMPT.md
#   - Spawn Task() Opus (claude-opus-4-7) sequential → parse JSON output
#   - Spawn Task() Sonnet (claude-sonnet-4-6) sequential → parse JSON output
#   - Construye las 2 entries con `deriveStatus()`
#   - Edit content/exercises/<cat>.json (APPEND a passes[] o crear validation field)
#   - git commit "validate(<cat>): <id> → <status> (Opus + Sonnet)"
```

**Paso 2.5.2 — Re-leer el JSON del ejercicio para conocer el `status` resultante:**

```
node -e "
const d = JSON.parse(require('fs').readFileSync('content/exercises/<cat>.json','utf8'));
const ex = d.exercises.find(e => e.id === '<id>');
console.log(ex.validation.status);
"
```

Según el output:
- **`"validated"`** → incrementar `validatedCount`; continuar con el siguiente id.
- **`"disputed"`** → empujar a `disputedQueue[cat]`. NO procesar la cola ahora (la cola se procesa al final de la categoría — D-VAL-24).
- **`"pending"`** (parse-failed double del skill hijo) → empujar a `pendingQueue[cat]`. NO bloquear el batch — el autor revisa al final de la categoría. NO incrementa `validatedCount`.

**Paso 2.6 — AVERE assert al cierre de la categoría avere (solo si `cat === "avere"`):**

```bash
node scripts/assert-avere-prefix-unchanged.mjs
echo "exit: $?"
```

Si exit != 0 → banner amarillo + AskUserQuestion con 3 opciones literales:

```
AskUserQuestion("El assert AVERE prefix falló tras procesar la categoría avere.
Probable causa: un path-A/C aceptado mutó payload de los 17 ejercicios blindados por D-88.
¿Cómo proceder?", [
  "Regenerar snapshot con `node scripts/snapshot-avere-prefix.mjs` (las mutaciones son intencionales y aprobadas)",
  "Revertir el último commit que tocó el prefix (`git revert HEAD`)",
  "Pausar el batch para revisar manualmente"
])
```

Según respuesta → ejecutar la acción correspondiente o pausar.

**Paso 2.7 — Schema validation defensive (todas las categorías, post-mutation):**

```bash
node scripts/validate-content-fixture.mjs
echo "exit: $?"
```

Si exit != 0 → banner amarillo en español: `"El smoke-test de validación de contenido falló post-categoría <cat> — probable Edit corrompió el JSON. Revisa el último commit con git diff HEAD~N."` + AskUserQuestion 2 opciones:

```
AskUserQuestion("¿Cómo continuar?", [
  "Continuar (el autor revisará el JSON después)",
  "Pausar el batch para investigar inmediatamente"
])
```

**Paso 2.8 — Emitir tabla resumen en español:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Categoría <cat> cerrada
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Validated:   <validatedCount>/<total>
 Disputed:    <disputedQueue[cat].length>   <list-of-ids if >0>
 Pending:     <pendingQueue[cat].length>    <list-of-ids if >0>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Paso 2.9 — Reconsider trigger D-VAL-21 (solo si `cat === "preposiciones"`):**

```
disputeRate = disputedQueue["preposiciones"].length / pending.length
motivadores = ["preposiciones-031", "preposiciones-032", "preposiciones-047"]
motivadoresValidated = motivadores.every(id => disputedQueue["preposiciones"].indexOf(id) === -1 && pendingQueue["preposiciones"].indexOf(id) === -1)
# motivadoresValidated === true significa que los 3 IDs salieron "validated" (no entraron en disputed ni pending)

Si disputeRate < 0.05 AND motivadoresValidated:
  banner amarillo:
    "⚠ Dispute-rate inusualmente bajo (< 5%) en la categoría con más bugs históricos.
     Los 3 motivadores históricos (-031/-032/-047) salieron validated sin surface concerns.
     ¿Pausar y reconsiderar añadir Gemini al quórum antes de las 6 categorías restantes?"
  AskUserQuestion 2 opciones:
    - "Continuar con avere (confío en Opus+Sonnet)"
    - "Pausar para reconsiderar añadir Gemini"
```

**Paso 2.10 — Si `disputedQueue[cat].length > 0` → procesar la cola (Paso 3).**

**Paso 2.11 — Checkpoint fin-de-categoría (D-VAL-23):**

```
AskUserQuestion("Categoría <cat> cerrada (X validated, Y disputed resueltos, Z pendientes/deferred).
¿Continuar con la siguiente categoría <next-cat>?", [
  "Continuar",
  "Pausar"
])
```

Si "Pausar" → exit limpio con mensaje:
```
"Re-invoca `/gsd-validate-batch <next-cat>` o `/gsd-validate-batch --all-pending` para continuar.
 Resume idempotente garantizado por D-VAL-19 — los ya-validated se filtran out automáticamente."
```

**Paso 3 — Procesar la cola disputed (D-VAL-24..26):**

Para cada `id` en `disputedQueue[cat]`, secuencial 1-por-1 (NO agrupado, sin importar el conteo — Open Q #5 resolved):

**Paso 3.1 — Construir el banner pretty-print en español:**

Re-leer el JSON del ejercicio para conocer su shape actual (prompt + opciones + correctIndex + explanation + passes[]). Extraer el primer tag `[Cn-criterio]` del PRIMER pase con `verdict === "incorrecta"`:

```javascript
function extractTagFromConcerns(concerns) {
  if (!Array.isArray(concerns)) return null;
  for (const c of concerns) {
    if (typeof c !== 'string') continue;
    const m = /^\[(C[1-5]-[a-z_]+)\]/.exec(c);
    if (m) return m[1];
  }
  return null;
}

const SUGGESTED_FIX_MAP = {
  'C1-natural':     'Reescribir el prompt para italiano más natural (sin propuesta concreta — revisión manual).',
  'C2-una_opcion':  'Reformular el prompt para forzar UNA opción (el schema multiple-choice no acepta múltiples correctIndex).',
  'C3-distractoras': 'Reemplazar distractoras con errores típicos del hispanohablante.',
  'C4-explanation': 'Reescribir explanation enfocada al alumno (sin meta-staging, sin #NNN refs).',
  'C5-leak':        'Eliminar la frase/marca que contiene la regla del prompt.'
};

const firstIncorrectaPass = exercise.validation.passes.find(p => p?.verdict === "incorrecta");
const tag = firstIncorrectaPass ? extractTagFromConcerns(firstIncorrectaPass.concerns) : null;
const suggestedFix = tag ? SUGGESTED_FIX_MAP[tag] : "Sin suggested fix automatizable — revisa concerns manualmente.";
```

Imprimir el banner literal en español:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 DISPUTED — <id> (<cat>, ejercicio <pos>/<total>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Prompt:      "<payload.prompt>"
 Opciones:    [a] <option[0]>  [b] <option[1]>  [c] <option[2]>  [d] <option[3]>
 Correcta:    [<letra>] <option[correctIndex]>   (según el ejercicio actual)
 Explicación: "<payload.explanation>"

 Verdict Opus   (claude-opus-4-7):   <passes[0].verdict>
 Concerns Opus: <passes[0].concerns join " | ">

 Verdict Sonnet (claude-sonnet-4-6): <passes[1].verdict>
 Concerns Sonnet: <passes[1].concerns join " | ">

 Suggested fix [<tag>]: <suggestedFix>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Paso 3.2 — AskUserQuestion con 4 opciones literales en español (texto EXACTO D-VAL-26):**

```
AskUserQuestion("¿Cómo resolver el disputed?", [
  "Accept fix",
  "Reject + override",
  "Rewrite manualmente",
  "Skip (defer al final del milestone)"
])
```

**Paso 3.3 — Según la respuesta, ejecutar el camino correspondiente (D-VAL-25):**

---

**Camino (a) Accept fix:**

```
(i) Aplicar el fix al payload del ejercicio según el tag [Cn-criterio]:
    - Edit tool sobre content/exercises/<cat>.json apuntando al ejercicio <id>.
    - Mutar payload.prompt / payload.options / payload.correctIndex / payload.explanation
      según el SUGGESTED_FIX_MAP. Para C5-leak: eliminar la frase identificada en concerns.
      Para C2-una_opcion: añadir contexto al prompt que fuerce una sola opción.
      Para C1/C3/C4: el sub-skill imprime la directriz del SUGGESTED_FIX_MAP y aplica
      la edición concreta basándose en los concerns literales (el autor verá el diff antes del commit).

(ii) BYPASS sticky D-VAL-07 — resetear validation a estado limpio:
    - Edit tool: cambiar
        "validation": {"status":"disputed","passes":[<...entries históricas...>]}
      por
        "validation": {"status":"pending","passes":[]}
    - El skill hijo Phase 9 SKILL.md Paso 8 documenta APPEND como default y deja la
      responsabilidad del reset al CALLER (este sub-skill ES el caller — RESEARCH Q4).
    - Audit trail histórico se preserva en el commit anterior `validate(...) → disputed`
      del que `git show <commit-hash>` recupera las entries originales.

(iii) Commit del fix (snapshot ANTES de re-validar — preserva auditoría aun si la
      re-validación crashea):
    git add content/exercises/<cat>.json
    git commit -m "fix(<cat>): <id> — autor acepta sugerencia post-disputed ([<tag>])"

(iv) Invocar el skill hijo para re-validar con 2 pases frescos:
    Skill(gsd-validate-exercise <id>)
    # El skill hijo ve passes:[] vacío → APPEND añade las 2 nuevas entries sobre array
    # vacío → deriveStatus calcula sobre passes nuevos sin contaminación sticky.
    # El skill hijo hace su propio commit "validate(<cat>): <id> → <status> (Opus + Sonnet)".

(v) git commit --amend para añadir sufijo POST-fix al commit del skill hijo:
    PREV_SUBJECT=$(git log -1 --format='%s')
    NEW_SUBJECT="$PREV_SUBJECT — POST-fix (accept fix tras disputed)"
    git commit --amend -m "$NEW_SUBJECT"
    # Posible porque el proyecto no tiene hooks de git (CLAUDE.md zero-deps).

Si la re-validación vuelve a salir disputed → el ID vuelve a disputedQueue[cat] para
el siguiente ciclo de la cola (NO se cierra hasta validated o skip/defer).
Si sale validated → continuar con el siguiente disputed.
```

---

**Camino (b) Reject + override:**

```
(i) AskUserQuestion follow-up (OBLIGATORIO para audit trail no-vacío):
    AskUserQuestion("¿Razón del override (una línea)?", ["[el autor responde texto libre]"])
    # Capturar la string RAZON.
    # Si el autor responde vacío, usar literal "(sin razón)" — el threat T-10-01-02
    #   queda mitigado porque la entry queda registrada con timestamp ISO de todas formas.

(ii) Edit tool — APPEND entry override al passes[]:
    Nueva entry literal:
      {
        "by": "autor",
        "date": "<ISO de hoy YYYY-MM-DD>",
        "verdict": "correcta",
        "concerns": ["[override] autor mantiene original tras revisión: <RAZON>"]
      }
    Edit tool añade esta entry al array existente (junto a las 2 con `incorrecta`).

(iii) Edit tool — setear `validation.status = "validated"` DIRECTAMENTE:
    BYPASS deriveStatus (la regla sticky D-VAL-07 daría "disputed" por la incorrecta
    histórica — pero el autor ES el oracle final). Cambiar el campo status a "validated"
    sin invocar deriveStatus.

(iv) Commit:
    git add content/exercises/<cat>.json
    git commit -m "validate(<cat>): <id> → validated (override autor, post-disputed)"

(v) NO re-validar. La entry "by":"autor" cuenta como una de las ≥2 distinct by para
    el reporter run-validation-271.mjs (VAL-04 sub-gate), y el helper effectiveStatus()
    del reporter relaja la regla sticky cuando detecta override del autor (RESEARCH Q5
    + Open Q #1 resolved).
```

---

**Camino (c) Rewrite manualmente:**

```
(i) Imprimir instrucciones literales al autor (en español):
    "Abre content/exercises/<cat>.json y edita el ejercicio <id>.
     Modifica payload.prompt, payload.options, payload.correctIndex o payload.explanation
     a tu criterio. NO toques el campo validation — el sub-skill lo resetea después de
     que confirmes que has guardado los cambios.
     Cuando termines, vuelve aquí y responde la siguiente pregunta."

(ii) AskUserQuestion para confirmar:
    AskUserQuestion("¿Has guardado los cambios?", [
      "Sí, ya guardé y re-validar",
      "No, cancelar (saltar al siguiente disputed)"
    ])

(iii) Si respuesta == "No, cancelar":
    El ID queda con status "disputed" persistido. NO mutar. Sigue con el siguiente
    disputed (NO cuenta como deferred — el autor explícitamente cancela el rewrite
    pero no lo difiere; volverá a la cola del próximo ciclo).

(iv) Si respuesta == "Sí, ya guardé y re-validar":
    Edit tool — BYPASS sticky resetear validation:
      "validation": {"status":"pending","passes":[]}

(v) Commit del rewrite (snapshot ANTES de re-validar):
    git add content/exercises/<cat>.json
    git commit -m "rewrite(<cat>): <id> — autor reescribe post-disputed"

(vi) Invocar el skill hijo para re-validar con 2 pases frescos:
    Skill(gsd-validate-exercise <id>)

(vii) git commit --amend para añadir sufijo POST-rewrite:
    PREV_SUBJECT=$(git log -1 --format='%s')
    NEW_SUBJECT="$PREV_SUBJECT — POST-rewrite"
    git commit --amend -m "$NEW_SUBJECT"

Si la re-validación vuelve a salir disputed → el ID vuelve a disputedQueue[cat] para
el siguiente ciclo (no se cierra hasta validated o skip/defer).
```

---

**Camino (d) Skip / defer al final del milestone:**

```
(i) SIN mutación al JSON. El ejercicio queda con `validation.status === "disputed"`
    persistido en su archivo.

(ii) AskUserQuestion opcional para capturar razón (no obligatorio):
    AskUserQuestion("¿Razón opcional del defer?", ["[el autor responde texto libre o vacío]"])
    # Capturar RAZON_DEFER (puede ser string vacía).

(iii) Append a .planning/STATE.md sección `## Deferred-disputed` (crear sección si no existe):
    Línea exacta del append:
      "- <id> (<ISO hoy YYYY-MM-DD>): deferred por autor — razón: \"<RAZON_DEFER si no vacía, si vacía '(sin razón)'>\""

(iv) NOTA al autor: VAL-06 (271/271 validated) impide cerrar el milestone con deferred.
     El reporter `scripts/run-validation-271.mjs` listará este ID en su tabla de sub-gates.
     El autor puede re-invocar `/gsd-validate-batch <id>` en otra sesión para resolverlo
     vía paths a/b/c.

(v) NO commit por este camino — el append a STATE.md se comitea al cierre del scope
    (Paso 4) junto con otros updates del milestone.
```

---

**Paso 4 — Al terminar el `<scope>`:**

**Paso 4.1 — Tabla agregada en español:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Resumen del scope <scope>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Categoría                  | Validated | Disputed resueltos | Deferred | Pending | Total
 ---------------------------|-----------|--------------------|----------|---------|-------
 preposiciones              |     X     |         Y          |    Z     |    W    |   T
 avere                      |     ...   |        ...         |   ...    |   ...   |  ...
 essere                     |     ...   |        ...         |   ...    |   ...   |  ...
 genero-numero              |     ...   |        ...         |   ...    |   ...   |  ...
 profesiones                |     ...   |        ...         |   ...    |   ...   |  ...
 sustantivos-irregulares    |     ...   |        ...         |   ...    |   ...   |  ...
 verbos-movimiento          |     ...   |        ...         |   ...    |   ...   |  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Paso 4.2 — Sugerencias siguientes pasos:**

```
Si TODAS las categorías procesadas son validated AND deferred==0 AND pending==0:
  Imprimir literalmente:
    "Scope <scope> completo. Siguientes pasos sugeridos (gesto consciente del autor):

       node scripts/run-validation-271.mjs
       # Gate final del milestone — verifica VAL-04 + VAL-06 + VAL-08.

       VAL_07_STRICT=1 node --test tests/*.test.js
       # Smoke test paramétrico estricto — previene regresiones editoriales futuras.

     Si ambos exit 0: el milestone v1.1 está listo para `/gsd:complete-milestone v1.1`."

Si hay disputed deferred o pending:
  Imprimir lista de IDs problemáticos + comandos de remediación:
    "Para procesar los deferred/pending: /gsd-validate-batch <id1>,<id2>,..."
```

**Paso 4.3 — Append a `.planning/STATE.md` sección `## Current Position`:**

```
Edit tool sobre .planning/STATE.md, añadir línea al final de la sección "Current Position":
  "Phase 10 — Categoría <cat> cerrada (<ISO hoy>): X/Y validated, Z disputed resueltos,
   W deferred, V pending."
# Una línea por cada categoría procesada en el scope.
```

</execution>

<error_handling>

| Caso | Acción | Mensaje al autor (español) |
|------|--------|----------------------------|
| Slug de categoría desconocido en `<scope>` | Exit 1 sin iniciar batch | "Error: scope '<arg>' no reconocido. Slugs válidos D-VAL-22: preposiciones, avere, essere, genero-numero, profesiones, sustantivos-irregulares, verbos-movimiento." |
| `scripts/assert-avere-prefix-unchanged.mjs` exit != 0 PRE-batch (al entrar a avere) | STOP batch, exit 1 | "El invariante D-88 AVERE prefix está roto pre-batch — investigar manualmente. Probable: Phase 9 Plan 09-02 stripAdditive() relax revertido. NO toques avere.json hasta restaurar el snapshot." |
| `scripts/assert-avere-prefix-unchanged.mjs` exit != 0 POST-categoría avere | Banner amarillo + AskUserQuestion 3 opciones | "El assert AVERE prefix falló tras procesar avere. Probable un path-A/C aceptado mutó payload de los 17 blindados. ¿Regenerar snapshot / Revertir último commit / Pausar?" |
| Skill hijo `gsd-validate-exercise` crashea sobre un ID | Log al stdout + continuar con siguiente ID (NO bloquea batch) | "Aviso: el skill hijo crasheó sobre <id>. Continúo con el siguiente — revisa manualmente al final de la categoría." |
| Resultado del skill hijo es `pending` (parse-failed double — el subagent emitió output malformado 2 veces) | Empuja a pendingQueue[cat], sigue iterando | "Aviso: <id> quedó en pending tras parse-fail. El autor revisa al final de la categoría." |
| `scripts/validate-content-fixture.mjs` exit != 0 POST-categoría | Banner amarillo + AskUserQuestion 2 opciones | "El smoke-test de validación de contenido falló post-categoría <cat> — probable Edit corrompió el JSON. ¿Continuar / Pausar para investigar?" |
| Path-B follow-up "razón del override" recibe respuesta vacía | Usar literal `"(sin razón)"` en el concerns | "Aviso: override sin razón explícita. La entry queda registrada con timestamp ISO igualmente." |
| Path-C confirmación "¿Has guardado?" responde "No, cancelar" | NO mutar el JSON. NO commit. Continuar con siguiente disputed (el ID NO va a deferred) | "Rewrite cancelado — <id> queda con status disputed. Volverá a la cola del próximo ciclo si re-invocas." |
| Autor responde "Pausar" en checkpoint fin-de-categoría o reconsider trigger | Exit limpio (NO error) | "Re-invoca `/gsd-validate-batch <next-cat>` o `/gsd-validate-batch --all-pending` para continuar. Resume idempotente garantizado por D-VAL-19." |
| Re-validation tras path-A/C vuelve a disputed | Re-empuja al disputedQueue[cat] para siguiente ciclo de la cola | "Aviso: <id> sigue disputed tras accept-fix/rewrite. Vuelve a la cola para nueva decisión." |
| Session-limit del API durante batch (Claude Code bloquea) | Sin acción del sub-skill — Claude Code maneja UI; el autor espera reset y re-invoca | (Mensaje de Claude Code: "You've hit your session limit"). Tras el reset, `/gsd-validate-batch <scope>` reanuda automáticamente. |
| Git commit falla (write lock, permisos, hook futuro) | Exit 1, no continuar | "Error: el commit falló. Inspecciona `git status` y resuelve manualmente antes de re-invocar." |

</error_handling>

<workflow_justification_no_batched>

**Por qué este sub-skill ITERA pero NO compone N ejercicios en mismo subagent (justificación arquitectónica al autor):**

El bug class motivador de v1.1 (los 4 ambigüedades semánticas cazadas en uso real post-v1.0: preposiciones-040 `dai amici`, -032 `nelle pareti`, -047 `cadere sugli alberi`, -031 `libri/scaffali`) tuvo como causa raíz el workflow editorial de Phase 7: batched-curation con ~17 ejercicios por batch en un mismo contexto del LLM + revisión humana global del batch. Bajo batched-curation, el LLM perdía atención sobre ejercicios individuales y la revisión humana del batch en global no detectaba los bugs sutiles.

Phase 9 cerró el bug class arquitectónicamente vía `gsd-validate-exercise`: cada `Task()` spawn arranca con context window vacío, ve UN solo ejercicio + el prompt R1-R7 verbatim, y emite verdict + concerns. Cero deriva por construcción.

**Phase 10 escala el bucle, NO afloja el aislamiento.** Este sub-skill batch ITERA N veces, pero el skill hijo `gsd-validate-exercise` que invoca SIGUE siendo single-exercise con context aislado por `Task()` spawn. El batch NO compone N ejercicios en mismo subagent — sería un regreso al bug class de los 4 motivadores. La iteración vive en el LLM principal (que sí ve los 269 IDs pero NO los emite a un Task compartido); cada llamada al skill hijo es independiente.

**Coste aceptado:** ~269 ejercicios × 2 pases = ~538 invocaciones de `Task()` durante Phase 10. ~1.5-2M tokens proyectados. ~14-22h de subagent time distribuidos en varias sesiones del autor con resume idempotente entre días. El autor lo acepta a cambio de garantía editorial duradera para los 271 ejercicios del proyecto.

</workflow_justification_no_batched>

<read_first_per_invocation>

Antes de cada invocación, este sub-skill DEBE leer (con Read tool o equivalente):

1. **El archivo JSON de la categoría del scope actual** (e.g. `content/exercises/preposiciones.json`). Necesario para filtrar pendientes (D-VAL-19 idempotencia) y para construir el banner pretty-print del Paso 3.1 (prompt + options + correctIndex + explanation + passes[] del ejercicio disputed).

2. **`src/data/validation-state.js`** — para entender el comportamiento de `deriveStatus()` (D-VAL-07 sticky disputed) y verificar la consistencia tras BYPASS en paths a/c. Aunque el sub-skill no invoca la función directamente (lo hace el skill hijo en su Paso 7), entender la semántica es necesario para razonar sobre cuándo aplicar reset de `passes[]`.

3. **`.planning/STATE.md`** — para el append a `## Current Position` y `## Deferred-disputed` (Paso 2/3/4). Read para conocer la estructura actual antes de editar.

NO leer:

- **`.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md`** — eso lo hace el skill hijo `gsd-validate-exercise` internamente. El batch NO necesita ver el prompt; sólo orquesta invocaciones.
- **`~/.claude/projects/.../memory/exercise_authoring_rules.md`** — las reglas R1-R7 viven inline en el VALIDATION-PROMPT.md que el skill hijo ya consume.
- **`src/data/schema-validator.js`** — el shape del `validation` field se enforça al boot vía content-loader. El sub-skill confía en que los Edits que aplica (paths a/b/c) respetan el shape; el smoke-test post-categoría (Paso 2.7) defiende contra corrupción.

</read_first_per_invocation>

<example_invocations>

**Ejemplo 1 — Categoría completa (primera del orden D-VAL-22):**

```
# Comando del autor:
/gsd-validate-batch preposiciones

# Lo que hace el sub-skill:
# 1. Resuelve scope → CATEGORIES = ["preposiciones"].
# 2. Lee content/exercises/preposiciones.json, filtra pending (49 — preposiciones-040 ya validated).
# 3. Itera 49 IDs invocando Skill(gsd-validate-exercise <id>) por cada uno.
# 4. Acumula disputedQueue["preposiciones"] (típicamente 5-15% ≈ 3-7 IDs según hipótesis CONTEXT.md).
# 5. Emite tabla resumen: "Preposiciones cerrada: 45/49 validated • 4 disputed • 0 pending".
# 6. Reconsider trigger D-VAL-21: si dispute-rate < 5% AND -031/-032/-047 validated → banner amarillo + AskUserQuestion.
# 7. Procesa cola disputed (banner D-VAL-26 + AskUserQuestion 4 opciones por cada uno).
# 8. Schema-validation defensive (validate-content-fixture.mjs).
# 9. Checkpoint fin-de-categoría: "¿Continuar con avere?" (no aplica en --all-pending; aquí termina el scope).
# 10. Tabla agregada del scope + append STATE.md.
```

**Ejemplo 2 — Modo lote (las 7 categorías en orden lockeado):**

```
# Comando del autor:
/gsd-validate-batch --all-pending

# Lo que hace el sub-skill:
# Encadena las 7 categorías en orden D-VAL-22:
#   preposiciones → avere → essere → genero-numero → profesiones → sustantivos-irregulares → verbos-movimiento
# Entre cada par, AskUserQuestion checkpoint "Continuar / Pausar".
# Pre-flight AVERE assert antes de empezar avere (Paso 2.1).
# AVERE assert al cierre de avere (Paso 2.6).
# Schema-validation defensive al cierre de cada categoría (Paso 2.7).
# Si el autor pausa en cualquier checkpoint → exit limpio. Re-invocar /gsd-validate-batch <next-cat>
# para retomar (resume idempotente filtra los ya-validated automáticamente).
```

**Ejemplo 3 — Re-validar IDs específicos (post path-A/C):**

```
# Comando del autor:
/gsd-validate-batch preposiciones-031,preposiciones-032,preposiciones-047

# Lo que hace el sub-skill:
# 1. Resuelve cada ID a su archivo de categoría (Glob + JSON.parse).
# 2. Agrupa por categoría — los 3 IDs son de preposiciones → procesa 1 categoría con 3 IDs.
# 3. Para cada ID: skip el filtro de "ya validated" si el autor lo invoca explícitamente
#    (uso típico: re-validar tras path-A/C que dejó passes:[] reset, o auditar un ID concreto).
# 4. Invoca Skill(gsd-validate-exercise <id>) por cada uno.
# 5. Cola disputed si emerge.
# 6. Tabla resumen del scope.
```

**Ejemplo 4 — Categoría avere (incluye pre-flight + cierre AVERE assert):**

```
# Comando del autor:
/gsd-validate-batch avere

# Lo que hace el sub-skill:
# 1. Paso 2.1 — Pre-flight: node scripts/assert-avere-prefix-unchanged.mjs (exit 0 esperado).
# 2. Lee avere.json, filtra pending (22 — avere-001 ya validated en Phase 9).
# 3. Itera 22 IDs invocando Skill(gsd-validate-exercise <id>).
# 4. Paso 2.6 — Post-categoría: node scripts/assert-avere-prefix-unchanged.mjs otra vez.
#    Si exit != 0 → banner amarillo + AskUserQuestion 3 opciones (regenerar snapshot /
#    revertir último commit / pausar manualmente).
# 5. Paso 2.7 — Schema-validation defensive.
# 6. Tabla resumen + checkpoint.
```

</example_invocations>

<gate_reminder>

Este sub-skill es la MÁQUINA del bucle Phase 10. La calidad del milestone v1.1 se cierra con el reporter `scripts/run-validation-271.mjs` (Plan 10-02 wave 1, paralelo a este plan) — verifica los 3 sub-gates VAL-04 + VAL-06 + VAL-08 sobre los 271 ejercicios. Si el reporter exit 0, el autor flippea conscientemente `VAL_07_STRICT=1 node --test tests/*.test.js` como gesto de milestone-close. Solo entonces procede `/gsd:complete-milestone v1.1`.

Este sub-skill NO invoca el reporter ni flippea el feature flag — son pasos manuales del autor al cierre del scope `--all-pending`, sugeridos literalmente en el Paso 4.2 al final del run.

</gate_reminder>
