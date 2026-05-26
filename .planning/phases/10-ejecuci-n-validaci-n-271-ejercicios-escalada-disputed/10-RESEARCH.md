# Phase 10: Ejecución validación 271 ejercicios + escalada disputed — Research

**Researched:** 2026-05-26
**Domain:** Claude Code skills + subagent orchestration (autoría editorial) + reporter zero-deps
**Confidence:** HIGH — la mayoría de hallazgos se cruzan contra docs oficiales `code.claude.com/docs/en/skills` y `code.claude.com/docs/en/sub-agents` y contra la implementación real del skill `gsd-validate-exercise` de Phase 9. Áreas LOW marcadas inline (file-save detection, granularidad de commit en path-c).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions (D-VAL-19..26 — NO research alternatives, investigate implementation)

- **D-VAL-19** — Nuevo skill `gsd-validate-batch <scope>` en `.claude/skills/gsd-validate-batch/SKILL.md`. Scope: `<category>` | `--all-pending` | `<id1,id2,...>`. Itera `gsd-validate-exercise <id>` por cada pendiente. Resume idempotente leyendo `validation.status` en los JSONs (NO manifest paralelo).
- **D-VAL-20** — Sub-skill ITERA pero NUNCA compone N ejercicios en mismo subagent context. Garantía arquitectónica NUNCA-batched preservada.
- **D-VAL-21** — Stick con Opus + Sonnet. NO añadir Gemini. Reconsider trigger: si Preposiciones dispute-rate <5% Y los 3 motivadores -031/-032/-047 pasan como `validated` sin concerns → banner alerta para reconsiderar.
- **D-VAL-22** — Orden lockeado: preposiciones → avere → essere → genero-numero → profesiones → sustantivos-irregulares → verbos-movimiento.
- **D-VAL-23** — Checkpoint por categoría. Sub-skill procesa UNA categoría a la vez, emite tabla en español, pausa.
- **D-VAL-24** — Cola disputed al FINAL de la categoría (NO inline interrupt).
- **D-VAL-25** — 4 caminos terminales (estricto):
  - (a) Accept fix → aplica fix + re-valida con 2 pases frescos. BYPASS sticky D-VAL-07 reseteando `passes[]`.
  - (b) Reject + override → append entry `{by:"autor", verdict:"correcta", concerns:["[override] ..."]}` + setear `validation.status = "validated"` directamente.
  - (c) Rewrite manualmente → abre JSON para edición, re-valida con 2 pases frescos. Reset `passes[]`.
  - (d) Skip/defer → sin mutación, ejercicio queda disputed.
- **D-VAL-26** — Banner pretty-print + AskUserQuestion con 4 opciones literales en español: "Accept fix" / "Reject + override" / "Rewrite manualmente" / "Skip (defer al final del milestone)". Suggested-fix derivado DETERMINÍSTICAMENTE del `[Cn-criterio]` tag.

### Claude's Discretion (research recommendations)

- Activación del feature flag `VAL_07_STRICT=1` al cierre.
- Paralelo vs secuencial Opus+Sonnet por ejercicio (afecta a `gsd-validate-exercise` Phase 9, NO al batch).
- Nombre exacto del sub-skill y del reporter.
- Mecanismo de detección de "guardado" tras rewrite manual del autor.
- Manejo de rate-limits API durante batch (~538 spawns Phase 10).
- Granularidad del banner cuando una categoría tiene >10 disputed.
- Si el reporter final escribe un archivo de audit además de stdout.
- Si el sub-skill verifica `assert-avere-prefix-unchanged.mjs` exit 0 tras mutar avere (inline o end-of-category).
- Política exacta de commits para caminos (a)/(b)/(c) — 1 commit por mutación vs consolidado por resolución.

### Deferred Ideas (OUT OF SCOPE — ignore completely)

- Nuevos requirements editoriales R8+ — fuera de scope, sigue R1-R7.
- Cambios al `VALIDATION-PROMPT.md` salvo iteración si emerge bug sistémico mid-run.
- 3er pase Gemini (D-VAL-03 risk monitor — descartado en D-VAL-21).
- UI runtime del usuario aprendiendo italiano — `validation` invisible al alumno (D-VAL-08 invariante).
- Validación pedagógica / exhaustividad — out of scope explícito en REQUIREMENTS.md.
- VAL-X1 (validación periódica re-aplicable a categorías nuevas) — diferido post-v1.1.
- VAL-X2 (integración con `/gsd-quick`) — diferido post-v1.1.
- Generación automatizada de suggested-fix con IA — out of scope; el tag YA lleva la dirección.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VAL-04 | Cada ejercicio recibe ≥2 pases de AIs distintos para alcanzar `status: validated`. Se registra `passes[].by`. Un solo pase deja `pending`. Cualquier `incorrecta` → `disputed`. | El skill `gsd-validate-exercise` (Phase 9, ya entregado) hace exactamente esto por ejercicio. Phase 10 lo invoca 269×. `deriveStatus()` aplica la regla sticky (Q4). El reporter `run-validation-271.mjs` verifica `passes.length ≥ 2 && distinct(passes[].by).size ≥ 2` por ejercicio (Q5). |
| VAL-06 | 271/271 con `validation.status === "validated"` antes de cerrar Phase 10. | Resume idempotente lee `validation.status` y filtra ya-validated (D-VAL-19). El reporter (Q5 §VAL-06 sub-gate) computa contadores por categoría — exit 0 sólo si todos 271. Disputed resueltos vía cola D-VAL-25 caminos (a)/(b)/(c) → re-validated. |
| VAL-08 | Cuando un pase devuelve `incorrecta`, surface al autor con prompt + verdict + concerns + suggested fix. Decisión del autor (accept/reject/rewrite) queda registrada en el JSON. | Cola D-VAL-24 al final de cada categoría. Banner pretty-print + AskUserQuestion (D-VAL-26). Suggested fix derivado del tag `[Cn-criterio]` (Q9). Override del autor en path-b deja entry `{by:"autor", concerns:["[override] ..."]}` con BYPASS sticky directo. |
</phase_requirements>

## TL;DR

1. **`gsd-validate-batch` debe correr INLINE en la sesión principal del autor, NO en un subagent (NO `context: fork`).** Es la única manera de cumplir las 3 decisiones simultáneamente: (a) AskUserQuestion (D-VAL-26) sólo funciona desde el thread principal — está documentado como **no disponible en subagents** (anthropics/claude-code#18721); (b) `gsd-validate-exercise` (Phase 9) ya spawnea 2 Task() Opus+Sonnet — un subagent batch NO puede spawnear nested subagents ("Subagents cannot spawn other subagents", `/en/sub-agents`); (c) D-VAL-23 checkpoint por categoría requiere AskUserQuestion para "continuar/pausar". El "subagent" mencionado en D-VAL-19 es el context-isolation natural de un Skill cuyo body se inyecta al contexto cuando se invoca — NO un Task() forked.

2. **Skill→skill invocation funciona vía orquestación del LLM, no via API directa.** El body del `gsd-validate-batch` SKILL.md instruye al LLM principal "para cada ID pendiente, invoca el skill `gsd-validate-exercise <id>`". El LLM principal lee esa instrucción y usa la tool `Skill` (o equivalente — la doc lo llama "Skill tool"; en Claude Code 2.1.63+ el Agent tool maneja esto) para ejecutar el skill hijo. No hay API JSON-RPC entre skills. **Implicación práctica para el plan:** el skill batch es PROMPT, no orquestación programática; el LLM principal interpreta el bucle.

3. **El BYPASS sticky para D-VAL-25 caminos (a) y (c) debe vivir en el batch, NO añadir flag `--reset-passes` a `gsd-validate-exercise`.** El skill base es agnóstico al estado previo (Phase 9 SKILL.md `<execution>` Paso 8: APPEND es default). En path-a/c, el batch hace 3 operaciones explícitas: (i) muta el JSON con el fix/rewrite, (ii) BORRA `passes: []` con Edit tool, (iii) invoca `gsd-validate-exercise <id>` — que ya añade los 2 nuevos pases sobre un array vacío. Cero cambios al skill Phase 9; preserva audit trail vía `git log` (los pases originales viven en commits anteriores). Si el autor quiere recuperar la historia: `git log --all -p <archivo>`.

4. **Reporter `run-validation-271.mjs` NO debe shellear `node --test`.** Mantén separación de responsabilidades: el reporter verifica el ESTADO de los JSONs (3 sub-gates: VAL-04 ≥2 distinct by, VAL-06 todos validated, VAL-08 cero disputed); el smoke test VAL-07 ejecuta como paso separado del milestone-close. Razones: (a) consistencia con `run-validation-pilot.mjs` que también es post-processing puro, (b) ejecutar tests desde el reporter complica el exit-code semantics, (c) el autor flippea `VAL_07_STRICT=1` como gesto consciente al cierre — no debería ser efecto secundario de correr el reporter.

5. **`VAL_07_STRICT=1` se documenta en README, NO se auto-flippea.** El autor lo enciende cuando el reporter exit 0 — es el gesto consciente que cierra el milestone. Auto-escritura a `.env` o `.planning/config.json` introduce mutación silenciosa al final de un batch agotador. La doc en README dice literalmente `VAL_07_STRICT=1 node --test tests/*.test.js` y queda al autor decidir el momento.

---

## Architecture Decisions

### Q1 — Arquitectura del `gsd-validate-batch` SKILL.md

**Decisión: skill INLINE en sesión principal (NO `context: fork`) cuyo body instruye al LLM principal a iterar `gsd-validate-exercise <id>` por cada pendiente.**

**Evidencia (HIGH confidence):**

- Docs oficiales `code.claude.com/docs/en/skills`: "When you or Claude invoke a skill, the rendered SKILL.md content enters the conversation as a single message and stays there for the rest of the session." Sin `context: fork`, el contenido se ejecuta en la sesión principal.
- `code.claude.com/docs/en/sub-agents` línea decisiva: *"Subagents cannot spawn other subagents. If your workflow requires nested delegation, use Skills or chain subagents from the main conversation."*
- El skill existente `gsd-validate-exercise` (Phase 9) tampoco tiene `context: fork` — corre inline. Internamente spawnea 2 Task() (Opus + Sonnet). Funciona porque el thread principal puede usar Task; un subagent NO podría re-spawnear Task.
- Confirmado en frontmatter actual:
  ```
  name: gsd-validate-exercise
  description: ...
  argument-hint: "<exercise-id> [--dry-run]"
  allowed-tools: [Read, Write, Edit, Bash, Glob, Grep, Task]
  ```
  No hay `context: fork`, no hay `agent: ...`.

**Resolviendo aparente contradicción con D-VAL-19** ("corre en SU PROPIO subagent — context aislado del main del autor"):

- La D-VAL-19 usa "subagent" en sentido **arquitectónico/conceptual** ("context aislado" porque el SKILL.md body es un bloque autocontenido que el LLM lee de una vez), NO en el sentido técnico de Claude Code (`Task()` spawn con context window separado).
- El aislamiento de contexto que protege la garantía NUNCA-batched (D-VAL-20) viene del skill `gsd-validate-exercise` invocando 2 `Task()` por ejercicio — esos sí son subagents técnicos. El batch sólo orquesta esos spawns inline.
- **Si el plan-time lee D-VAL-19 literalmente como "fork mode"**, el sub-skill no podría usar AskUserQuestion (D-VAL-26 banner) ni Task (Opus+Sonnet) — el diseño se rompe. La única interpretación coherente con las otras 7 decisiones es: skill inline.

**Frontmatter recomendado para el nuevo skill:**

```yaml
---
name: gsd-validate-batch
description: "Valida en bucle todos los ejercicios pendientes de una categoría (o todas las categorías en orden lockeado D-VAL-22) invocando gsd-validate-exercise por cada ID. Procesa UNA categoría a la vez (checkpoint D-VAL-23), emite tabla en español al final, ofrece cola disputed VAL-08 (D-VAL-24/25/26)."
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
```

**Notas:**
- `disable-model-invocation: true` previene que Claude lo dispare automáticamente — sólo el autor con `/gsd-validate-batch <scope>`.
- `Skill` en `allowed-tools` permite invocar el skill hijo `gsd-validate-exercise` sin permiso por cada llamada. Confirmado en docs: *"To prevent a subagent from invoking skills entirely, omit Skill from the tools list"* — la inversa también vale: incluir `Skill` permite la invocación.
- `AskUserQuestion` listado explícitamente — aunque siempre disponible en thread principal, ser explícito documenta el contrato.
- `Task` listado para coherencia: el skill HIJO (`gsd-validate-exercise`) usa Task, y ejecutarse "inline" significa que el thread principal usa Task — el batch hereda esa necesidad por construcción.

**Body structure (esqueleto sugerido — el plan-time concreta wording):**

```markdown
<objective>
Iterar gsd-validate-exercise sobre todos los ejercicios pendientes del scope dado.
Procesar UNA categoría a la vez (D-VAL-23), pausar tras cada una para checkpoint
+ cola disputed VAL-08 (D-VAL-24..26).
</objective>

<critical_constraints>
- NUNCA componer N ejercicios en un mismo Task() — el bucle inyecta UN id a
  cada invocación de gsd-validate-exercise (D-VAL-20).
- Resume idempotente: re-leer JSONs y filtrar ya-validated antes de iterar.
- Mensajes al autor en español (FOUND-04).
- Orden de categorías lockeado D-VAL-22.
- Una sola categoría procesada por invocación del skill (--all-pending las
  encadena con checkpoints intermedios).
</critical_constraints>

<execution>
Paso 1 — Resolver scope:
  - Si <category>: cargar content/exercises/<category>.json.
  - Si --all-pending: iterar el orden D-VAL-22 (preposiciones → avere → essere → ...).
  - Si <id1,id2,...>: cargar cada JSON, agrupar por categoría.

Paso 2 — Para cada categoría en scope:
  Paso 2.1 — Leer JSON, filtrar pendientes (status !== "validated").
  Paso 2.2 — Si lista vacía: imprimir "Categoría <cat> ya completa (X/X validated)" y pasar.
  Paso 2.3 — Para cada ID pendiente:
    Paso 2.3.1 — Invocar el skill gsd-validate-exercise <id>.
                 (Internamente Phase 9 SKILL.md hace todo: 2 Task() Opus+Sonnet,
                 parsea, mergea passes[], deriveStatus, Edit JSON, commit atómico.)
    Paso 2.3.2 — Re-leer el JSON para conocer el status resultante.
                 Si status === "disputed": empujar a la cola local disputedQueue[cat].
                 Si status === "pending" (parse-failed): empujar a pendingQueue[cat]
                 (NO bloquea — sigue iterando).
                 Si status === "validated": continúa.
  Paso 2.4 — Emitir tabla resumen en español:
    """
    Categoría preposiciones cerrada: 45/49 validated • 4 disputed • 0 pending
    Validated:  preposiciones-001..038, 040..045 (omitido detalle por brevedad)
    Disputed:   preposiciones-031, -032, -047, -049 — entra cola VAL-08
    """
  Paso 2.5 — Si categoría == preposiciones (la primera D-VAL-22):
    Computar dispute-rate = disputed_count / total_pending.
    Si dispute-rate < 5% AND los 3 motivadores históricos (-031, -032, -047)
    fueron validated:
      Banner amarillo: "Dispute-rate inusualmente bajo en la categoría con más
      bugs históricos. ¿Pausar y reconsiderar añadir Gemini antes de las 6
      categorías restantes?"
      AskUserQuestion (2 opciones: "Continuar con avere" / "Pausar para reconsiderar")
  Paso 2.6 — Si disputedQueue[cat].length > 0:
    Procesar cola D-VAL-24..26 (ver Paso 3).
  Paso 2.7 — AskUserQuestion al autor:
    "Categoría <cat> cerrada (X validated, Y disputed resueltos, Z pendientes).
     ¿Continuar con la siguiente categoría <next-cat>?"
    Opciones: "Continuar" / "Pausar"

Paso 3 — Procesar cola disputed (al final de la categoría):
  Para cada ID en disputedQueue[cat]:
    Paso 3.1 — Imprimir banner pretty-print (D-VAL-26):
      Prompt + opciones + correctIndex + explanation + 2 verdicts + 2 concerns
      + suggested fix derivado del [Cn-criterio] tag más prominente (ver Q9).
    Paso 3.2 — AskUserQuestion con 4 opciones literales en español:
      "Accept fix" / "Reject + override" / "Rewrite manualmente" / "Skip (defer al final del milestone)"
    Paso 3.3 — Según respuesta:
      (a) Accept fix → ver Q4 §Path-A
      (b) Reject + override → ver Q4 §Path-B
      (c) Rewrite manualmente → ver Q3 + Q4 §Path-C
      (d) Skip/defer → escribir el ID a STATE.md ## Deferred-disputed, continuar.

Paso 4 — Al terminar el scope:
  Imprimir tabla agregada: 7 filas (1 por categoría), columnas:
  validated_count, disputed_resolved_count, disputed_deferred_count, total.
  Sugerir al autor:
    Si todos validated y deferred==0: "node scripts/run-validation-271.mjs"
    para gate final + flippear VAL_07_STRICT=1.
</execution>
```

### Q2 — `AskUserQuestion` dentro del subagent context

**Decisión: AskUserQuestion funciona en el thread principal (donde el `gsd-validate-batch` corre inline). NO funciona dentro de los Task() Opus/Sonnet que spawnea el skill hijo `gsd-validate-exercise` — pero NO se necesita ahí.**

**Evidencia (HIGH confidence):**

- anthropics/claude-code#18721 (issue oficial): *"AskUserQuestion is not currently available in subagents spawned via the Task tool."*
- Workaround documentado: *"Create an escalation mechanism where subagents return structured results indicating clarification is needed, then the main agent handles user interaction."*
- En la arquitectura del Plan 09 + Phase 10:
  - Los Task() de Opus/Sonnet sólo emiten JSON validado contra el shape D-VAL-09 — JAMÁS necesitan preguntar nada al autor. El validation prompt es self-contained.
  - El batch corre en thread principal → AskUserQuestion funciona normalmente.
  - El skill hijo `gsd-validate-exercise` también corre en thread principal (inline, sin `context: fork`); usa AskUserQuestion sólo en su sección `<error_handling>` para casos como "subagent crasheó" — funciona porque está en thread principal.

**Implicación práctica:** D-VAL-26 banner + AskUserQuestion 4 opciones funciona out-of-the-box. Cero fallback necesario.

**Cuando NO funciona (información defensiva para el plan):** si en el futuro alguien añadiera `context: fork` al `gsd-validate-batch` (por ejemplo "para no contaminar la sesión principal"), todos los AskUserQuestion fallarían y el flujo VAL-08 colapsaría. **El plan debe documentar explícitamente que el skill batch NO debe nunca tener `context: fork`** — es contrato arquitectónico.

### Q3 — Edit-tool flow para el rewrite manual del autor (path-c D-VAL-25)

**Decisión: NO usar file-watcher ni polling. Usar prompt explícito al autor "Cuando hayas guardado, responde `listo`" + AskUserQuestion como signal.**

**Razonamiento (MEDIUM confidence — área Claude's Discretion):**

- File-watcher / mtime polling tiene problemas conocidos:
  - Windows actualiza access-time al leer → falsos positivos.
  - El propio Edit tool de Claude Code mantiene su mtime cache y suele racear (anthropics/claude-code#3513, #48390, #12891).
  - mtime checks dentro del SKILL.md requieren un bucle Bash con `until [[ ... ]]` — añade complejidad sin valor.
- File-pickers / file system access API → out of scope (sin frontend).
- **El patrón limpio es el patrón ya usado por Phase 9 Plan 09-03:** `<task type="checkpoint:human-verify">` con `resume-signal` esperando texto literal (`approved`, `iterate prompt: ...`, etc.). El batch hace lo mismo en path-c:

```markdown
Path-C (Rewrite manualmente) — secuencia:

1. Sub-skill imprime: "Abre content/exercises/<cat>.json y edita el ejercicio
   <id>. Modifica payload.prompt, options, correctIndex o explanation a tu
   criterio. NO toques el campo validation (el sub-skill lo resetea después)."

2. Sub-skill (opcionalmente, Claude's Discretion) usa Edit tool para hacer un
   "abrir" virtual: jump al ejercicio mostrando el bloque actual con un
   placeholder // EDITA-AQUÍ // al final de explanation. El autor edita en su
   editor preferido (VS Code, Vim, lo que sea — el archivo está en disco).

3. AskUserQuestion: "¿Has guardado los cambios?" con opciones:
   - "Sí, ya guardé y re-validar"
   - "No, cancelar (saltar al siguiente disputed)"

4. Si respuesta == "Sí": el sub-skill (a) Edit tool resetea
   exercise.validation.passes = [] y .status = "pending", (b) commit
   "rewrite(<cat>): <id> — autor reescribe post-disputed" (snapshot del rewrite
   ANTES de re-validar — preserva auditoría aun si las 2 nuevas pases
   crashean), (c) invoca gsd-validate-exercise <id> normal (que ahora ve
   passes:[] vacío → deriveStatus saldrá validated si Opus+Sonnet dicen
   correcta, disputed sticky en otro caso).

5. Si re-validate sale disputed otra vez: el ID vuelve a la cola del ciclo
   siguiente — NO se cierra hasta validated o skip/defer.
```

**Por qué NO file-mtime polling:**
- Latencia humana variable (autor puede tardar 30s o 30 min) — el sub-skill tendría que sostener un `until` loop o un `sleep`-poll, ambos antipatterns.
- El autor a veces SAVE varias veces antes del save final (autocomplete reverts, etc.) — un detector mtime se dispararía prematuro.
- AskUserQuestion es preciso, predecible, y consistente con el resto de checkpoints del proyecto (FOUND-04 español).

**Alternativa Claude's Discretion (LOW confidence — sólo si el autor lo pide):** introducir un comando `--watch` que el sub-skill abre con `Bash(node -e "fs.watchFile(...))"` en background. Coste: complejidad alta para ~10-30 disputeds totales del milestone. **No recomendado para Phase 10.**

### Q4 — BYPASS sticky para paths (a) y (c)

**Decisión: El reset de `passes[]` ocurre EN EL BATCH, NO en `gsd-validate-exercise`. Cero cambios al skill Phase 9.**

**Razonamiento (HIGH confidence):**

- Phase 9 SKILL.md `<execution>` Paso 8 establece: *"Si el ejercicio ya tiene `validation.passes[]` (re-validación): la decisión por defecto es APPEND (no reemplazar) — los pases nuevos se añaden al array existente, deriveStatus recalcula sobre el array completo. Si el autor quiere reemplazar pases existentes, lo hace manualmente antes de invocar el skill."*
- El último renglón es la **API contractual** que Phase 9 ya prevé: el caller responsable es quien limpia `passes[]`. Phase 10 batch ES ese caller en paths (a) y (c).
- Añadir un flag `--reset-passes` al skill Phase 9 violaría la regla "Phase 10 NO modifica `gsd-validate-exercise`" (CONTEXT.md domain section).

**Implementación paso-a-paso:**

**Path-A (Accept fix):**
```
1. Sub-skill computa el fix a aplicar según [Cn-criterio] tag (ver Q9).
2. Edit tool aplica el fix al payload del ejercicio (prompt/options/explanation).
3. Edit tool resetea: exercise.validation.passes = [] y .status = "pending".
4. git commit -m "fix(<cat>): <id> — autor acepta sugerencia post-disputed ([Cn-...])"
   (Q8 explora granularidad — este commit captura el fix; el siguiente captura la re-validación.)
5. Invocar gsd-validate-exercise <id>.
   → Skill Phase 9 corre normal: 2 Task() Opus+Sonnet, parsea, APPEND a passes
   (que está vacío), deriveStatus sobre passes nuevos. Si ambos correcta:
   validated. Si alguno incorrecta: disputed sticky de nuevo (vuelve a cola
   del ciclo siguiente — y el ciclo siguiente reabre con nuevo banner).
6. git commit (lo hace el propio gsd-validate-exercise) con sufijo POST-fix
   en su template:
   "validate(<cat>): <id> → validated POST-fix (Opus + Sonnet, accept fix tras disputed)"
   (El skill Phase 9 NO sabe que viene de un fix — el batch debería pasar
   contexto extra en el prompt, o modificar el commit message tras el commit
   con `git commit --amend`. Ver Q8.)
```

**Path-B (Reject + override) — NO reset, NO re-validation:**
```
1. AskUserQuestion follow-up: "¿Razón del override (una línea)?" — captura
   string del autor para audit trail.
2. Edit tool añade entry al passes[]:
     {
       "by": "autor",
       "date": "<ISO de hoy>",
       "verdict": "correcta",
       "concerns": ["[override] autor mantiene original tras revisión: <razón>"]
     }
3. Edit tool setea: exercise.validation.status = "validated" DIRECTAMENTE
   (BYPASS deriveStatus — porque la regla sticky impediría validated).
4. git commit:
   "validate(<cat>): <id> → validated (override autor, post-disputed)"
5. Verificar consistencia con schema (validateValidationShape): el `by:"autor"`
   pasa (es string), el `verdict:"correcta"` pasa (whitelist), el concerns
   string pasa. Schema OK.

   NOTA: el reporter run-validation-271.mjs (Q5) sub-gate VAL-04 cuenta
   distinct by-values — la entry "autor" cuenta como una de las ≥2 distinct.
   El ejercicio quedará con 3 entries (Opus incorrecta + Sonnet incorrecta +
   autor correcta) o 4 (si ya tenía 2 previas).
```

**Path-C (Rewrite manualmente):**
```
1-2. Ver Q3 (autor edita el JSON manualmente).
3. Cuando autor confirma "Sí, ya guardé": Edit tool resetea passes:[] y status:"pending".
4. git commit "rewrite(<cat>): <id> — autor reescribe post-disputed" (snapshot).
5. Invocar gsd-validate-exercise <id> normal (idéntico a Path-A pasos 5-6).
```

**Audit trail completo del milestone preservado:**
- `git log` muestra: `validate(...) → disputed` (commit original) → `fix(...)` o `rewrite(...)` (mutación) → `validate(...) → validated POST-fix/rewrite/override` (resolución).
- Los `passes[]` originales con `incorrecta` viven en el commit anterior; `git show <commit-disputed>` los recupera.
- Para path-B (override): los `passes[]` originales se preservan en la entry actual (sólo se appendea la del autor) — audit trail eterno en el JSON.

### Q5 — Diseño del reporter `scripts/run-validation-271.mjs`

**Decisión: post-processing puro sobre los 271 JSONs (NO shellear `node --test`). 3 sub-gates en el reporter; smoke test VAL-07 es paso separado del milestone-close.**

**Razonamiento (HIGH confidence):**

- `scripts/run-validation-pilot.mjs` establece el patrón: lee JSONs → computa derived status → exit 0/1 sobre 4 sub-gates. Mismo patrón, scope diferente (271 vs 3 IDs hardcoded).
- Ejecutar `node --test` desde dentro del reporter:
  - Confunde el exit-code semantics (test failure vs gate failure son razones distintas).
  - Mayor latencia (corre 254 tests baseline + 7 VAL-07 = ~5-15s extra).
  - Acopla dos responsabilidades.
- El autor flippea `VAL_07_STRICT=1` conscientemente al cierre como gesto de milestone-close → mejor que sea acción separada y explícita.

**Esqueleto sugerido (basado verbatim en patrón `run-validation-pilot.mjs`):**

```javascript
#!/usr/bin/env node
// scripts/run-validation-271.mjs
//
// Reporter del milestone v1.1 Phase 10 — gate VAL-04 + VAL-06 + VAL-08.
// Lee los 271 ejercicios de los 7 archivos categoría, aplica deriveStatus,
// verifica los 3 sub-gates del milestone. Post-processing puro: NO invoca
// Task(), NO muta JSONs, NO corre tests.
//
// Sub-gates:
//   1. VAL-04 — todos 271 con passes.length ≥ 2 Y new Set(passes.map(p=>p.by)).size ≥ 2
//   2. VAL-06 — todos 271 con validation.status === "validated"
//   3. VAL-08 — cero IDs con status === "disputed" (cola Phase 10 procesada hasta vaciado)
//
// Exit 0 → milestone gate PASS. Autor procede a flippear VAL_07_STRICT=1
//   manualmente para el smoke test estricto (paso separado, Q6).
// Exit 1 → al menos un sub-gate FAIL. La tabla muestra qué categoría tiene
//   los problemáticos.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ANSI zero-deps (reutilizar de run-validation-pilot.mjs).
const GREEN = '\x1b[32m', RED = '\x1b[31m', YELLOW = '\x1b[33m', BOLD = '\x1b[1m', RESET = '\x1b[0m';
const ok = (t) => `${GREEN}${t}${RESET}`;
const fail = (t) => `${RED}${t}${RESET}`;
const warn = (t) => `${YELLOW}${t}${RESET}`;

// D-VAL-22 orden lockeado.
const CATEGORIES = [
  { slug: 'preposiciones', file: 'content/exercises/preposiciones.json', expected: 50 },
  { slug: 'avere', file: 'content/exercises/avere.json', expected: 23 },
  { slug: 'essere', file: 'content/exercises/essere.json', expected: 39 },
  { slug: 'genero-numero', file: 'content/exercises/genero-numero.json', expected: 40 },
  { slug: 'profesiones', file: 'content/exercises/profesiones.json', expected: 51 },
  { slug: 'sustantivos-irregulares', file: 'content/exercises/sustantivos-irregulares.json', expected: 31 },
  { slug: 'verbos-movimiento', file: 'content/exercises/verbos-movimiento.json', expected: 37 }
];

// Verificación por categoría.
const perCategory = CATEGORIES.map(({ slug, file, expected }) => {
  const data = JSON.parse(readFileSync(resolve(projectRoot, file), 'utf8'));
  const exercises = data.exercises || [];
  const counts = { validated: 0, disputed: 0, pending: 0, missing: 0 };
  const disputedIds = [];
  const missingMultiPassIds = [];

  for (const ex of exercises) {
    const v = ex.validation;
    if (!v || !Array.isArray(v.passes)) {
      counts.missing++;
      continue;
    }
    const derived = deriveStatus(v.passes);
    if (derived === 'validated') counts.validated++;
    else if (derived === 'disputed') { counts.disputed++; disputedIds.push(ex.id); }
    else counts.pending++;

    // VAL-04 enforcement: ≥2 distinct by.
    const distinctBy = new Set(v.passes.filter(p => p?.verdict === 'correcta').map(p => p?.by).filter(Boolean));
    if (derived === 'validated' && distinctBy.size < 2) missingMultiPassIds.push(ex.id);
  }

  const totalAccountedFor = counts.validated + counts.disputed + counts.pending + counts.missing;
  return { slug, expected, total: exercises.length, ...counts, disputedIds, missingMultiPassIds, totalAccountedFor };
});

// Imprimir tabla.
console.log('');
console.log(`${BOLD}Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08)${RESET}`);
console.log('');
const headers = ['Categoría', 'Total', 'Validated', 'Disputed', 'Pending', 'Missing'];
console.log(headers.map(h => h.padEnd(16)).join(' | '));
console.log('-'.repeat(headers.length * 18));
for (const r of perCategory) {
  console.log([
    r.slug.padEnd(16),
    String(r.total).padEnd(16),
    String(r.validated).padEnd(16),
    String(r.disputed).padEnd(16),
    String(r.pending).padEnd(16),
    String(r.missing).padEnd(16)
  ].join(' | '));
}

// Sub-gates.
const totalValidated = perCategory.reduce((s, r) => s + r.validated, 0);
const totalDisputed = perCategory.reduce((s, r) => s + r.disputed, 0);
const totalMissing = perCategory.reduce((s, r) => s + r.missing, 0);
const totalPending = perCategory.reduce((s, r) => s + r.pending, 0);
const totalExpected = 271;
const totalActual = perCategory.reduce((s, r) => s + r.total, 0);

console.log('');
console.log(`${BOLD}Sub-gates:${RESET}`);

// VAL-06: 271/271 validated.
const val06Pass = totalValidated === totalExpected && totalActual === totalExpected;
console.log(`  VAL-06 (271/271 validated): ${val06Pass ? ok(`PASS (${totalValidated}/${totalExpected})`) : fail(`FAIL (${totalValidated}/${totalExpected})`)}`);

// VAL-08: cero disputed.
const val08Pass = totalDisputed === 0;
console.log(`  VAL-08 (cero disputed): ${val08Pass ? ok(`PASS`) : fail(`FAIL (${totalDisputed} disputed: ${perCategory.flatMap(r => r.disputedIds).join(', ')})`)}`);

// VAL-04: passes ≥2 distinct by para todos validated.
const val04Issues = perCategory.flatMap(r => r.missingMultiPassIds);
const val04Pass = val04Issues.length === 0;
console.log(`  VAL-04 (≥2 distinct AIs por validated): ${val04Pass ? ok(`PASS`) : fail(`FAIL (${val04Issues.length} IDs sin ≥2 distinct by: ${val04Issues.join(', ')})`)}`);

const gatePass = val06Pass && val08Pass && val04Pass;

console.log('');
if (gatePass) {
  console.log(ok(`${BOLD}Milestone gate PASS.${RESET}`));
  console.log('');
  console.log('Siguiente paso (manual, gesto consciente del autor):');
  console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');
  console.log('  → verifica smoke test paramétrico exit 0.');
  console.log('  → si OK: /gsd:complete-milestone v1.1');
  console.log('');
  process.exit(0);
} else {
  console.log(fail(`${BOLD}Milestone gate FAIL — itera Phase 10 sub-skill antes de cerrar.${RESET}`));
  console.log('');
  console.log('Acciones sugeridas según qué sub-gate falla:');
  console.log('  - VAL-06: ejecutar /gsd-validate-batch --all-pending para procesar los pendientes/missing.');
  console.log('  - VAL-08: ejecutar /gsd-validate-batch <id1,id2,...> sobre los IDs disputed listados.');
  console.log('  - VAL-04: investigar manualmente los IDs sin ≥2 distinct by (probable corrupción del JSON).');
  console.log('');
  process.exit(1);
}
```

**Decisiones importantes del esqueleto:**
- **Cero deps añadidas** — mismo patrón que `run-validation-pilot.mjs`.
- **`deriveStatus` re-aplicada** — verifica que el `validation.status` escrito en el JSON coincide con el derived (catches manual hand-edits desincronizados; en path-B BYPASS sticky devuelve `disputed` derived pero escrito es `validated` — el reporter detecta esa divergencia. **El plan-time decide si tratar la divergencia path-B como expected o como warning** — recomendación: añadir lista white-listed de IDs con override del autor desde STATE.md y excluirlos del consistency check; o relax: si el derived = "disputed" pero existe entry `by:"autor", verdict:"correcta"`, treat as validated. Detalles al plan).
- **Lista de IDs disputed visible al autor** — facilita `/gsd-validate-batch <id1,id2,...>` para procesar la cola.
- **Sugerencia post-PASS del paso manual VAL-07** — separación clara de responsabilidades.

### Q6 — Activación del feature flag `VAL_07_STRICT`

**Decisión: documentación en README (autor flippea manualmente).** NO auto-write `.env`, NO setting persistente en `.planning/config.json`, NO escritura por el sub-skill al cerrar la 7ª categoría.

**Razonamiento (MEDIUM confidence — área Claude's Discretion, captured como recomendación implícita en CONTEXT.md):**

- **Pros del manual:** zero-magic, autor decide el momento, ningún archivo de configuración cambia silenciosamente al final de un batch agotador (~14-22h proyectados según Phase 9 P09-03 §Observaciones #4).
- **Contras del manual:** depende de que el autor recuerde el último paso. Mitigation: el reporter (Q5) imprime el comando literal al PASS → cero ambigüedad sobre qué hacer.
- **Pros del auto-write:** garantiza que el smoke test queda activo (previene regresión silenciosa si autor olvida el step).
- **Contras del auto-write:**
  - Mutación silenciosa al final de un workflow ya intenso.
  - `.env` no está en git (`.gitignore` lo cubre típicamente) → no audit trail.
  - `.planning/config.json` SÍ está en git pero introduce dependencia inversa entre tests y `.planning/`.
  - `setting persistente` en otro JSON requiere descubrir donde lo lee → friction.

**Mejor enfoque (recomendación):**

1. README añade sección:

   ```markdown
   ## Validación editorial (milestone v1.1)

   Tras validar todos los 271 ejercicios y cerrar el milestone, activa el smoke
   test estricto para prevenir regresiones:

   ```bash
   # Linux/macOS
   VAL_07_STRICT=1 node --test tests/*.test.js

   # Si todo verde: opcional, hazlo permanente añadiendo a tu shell:
   export VAL_07_STRICT=1
   ```

   Una vez activo, cualquier ejercicio nuevo sin `validation.status === "validated"`
   romperá el test → previene merge accidental de contenido sin validar.
   ```

2. El reporter `run-validation-271.mjs` (Q5) imprime el comando literal en PASS.

3. **Opcional (consideración fuerte para el plan):** añadir al `package.json` (que NO existe en este proyecto zero-deps — pero **si en el futuro hay uno**) una script `test:strict` que setea el env var. Por ahora, README es suficiente.

**Anti-pattern descartado:**
- Hooks de git que auto-flippean el env var → introducen mutaciones invisibles.

### Q7 — Manejo de rate-limits durante ~538 Task() spawns

**Decisión: APROVECHAR el retry automático built-in de Claude Code (hasta 10× con exponential backoff). NO añadir retry custom al sub-skill. Resume idempotente por re-invocación del autor cubre cualquier failure que escape.**

**Evidencia (HIGH confidence):**

- Docs oficiales (sitepoint, claude-api, code.claude.com/docs/en/errors): *"Claude Code automatically retries server errors, overloaded responses, request timeouts, temporary 429 throttles, and dropped connections up to 10 times with exponential backoff. While retrying, the spinner shows a 'Retrying in Ns · attempt x/y' countdown."*
- Phase 9 piloto confirmó: 6/6 Task() spawns sin retries necesarios (Phase 9 P09-03 §Observaciones #3).
- Sesiones de suscripción tienen rolling allowances con reset time — si el límite por sesión se golpea, Claude Code bloquea con mensaje claro.

**Comportamiento esperado en Phase 10 (~538 spawns):**

- **Caso 1 — Transient 429 (1 spawn):** Claude Code retry automático 1-10× con backoff. Probable resolución sin intervención.
- **Caso 2 — Session limit (autor agotó cuota):** Claude Code muestra "You've hit your session limit" y bloquea. El sub-skill espera (UI lo refleja). Autor espera al reset (ej. 5h) y re-invoca `/gsd-validate-batch <category>` — gracias al resume idempotente (D-VAL-19), el sub-skill filtra ya-validated y arranca desde donde paró.
- **Caso 3 — Parse failure persistente (subagent emite JSON malformado 2×):** Ya manejado por Phase 9 `gsd-validate-exercise` retry budget = 1 + el ejercicio queda `pending`. El sub-skill batch DETECTA el `pending` (Paso 2.3.2 del Q1 esqueleto) y lo loguea sin bloquear el batch. Autor revisa manualmente al final.

**Anti-patterns descartados:**

- Custom exponential backoff en el sub-skill → duplica la lógica de Claude Code, mal mantenido, complica el SKILL.md.
- Pausa explícita cada N spawns → arbitrario, sin evidencia que la necesite.
- Failover a otro modelo (Sonnet → Haiku) → rompe la garantía editorial D-VAL-02 ("model IDs explícitos y literales").

**Recomendación para el plan-time:** el SKILL.md del batch documenta en `<critical_constraints>` el comportamiento esperado para el autor:

```markdown
- **Resume idempotente:** si Claude Code golpea un session-limit o el autor pulsa Ctrl-C
  mid-batch, NO hay daño — el estado verdad vive en los JSONs (D-VAL-19). Re-invocar
  /gsd-validate-batch <scope> reanuda desde el primer pendiente automáticamente.
  Cero manifest paralelo que recuperar.
```

### Q8 — Granularidad de commits para paths (a)/(b)/(c)

**Decisión: 1 commit por mutación atómica (NO consolidado). Resolución de un disputed produce 2-3 commits en `git log`. Path-B (override): 1 commit.**

**Razonamiento (MEDIUM confidence — área Claude's Discretion):**

| Path | Commits producidos | Mensaje template |
|------|-------------------|------------------|
| (a) Accept fix | 2 commits | (i) `fix(<cat>): <id> — autor acepta sugerencia post-disputed ([Cn-...])` + (ii) `validate(<cat>): <id> → <status> POST-fix (Opus + Sonnet, accept fix tras disputed)` |
| (b) Reject + override | 1 commit | `validate(<cat>): <id> → validated (override autor, post-disputed)` |
| (c) Rewrite manualmente | 2 commits | (i) `rewrite(<cat>): <id> — autor reescribe post-disputed` + (ii) `validate(<cat>): <id> → <status> POST-rewrite (Opus + Sonnet)` |
| (d) Skip/defer | 0 commits (sin mutación) | — (STATE.md update vive en el batch-close commit final, no aquí) |

**Por qué granular:**

- Coherente con Phase 9 D-VAL-04 (commit 1-por-ejercicio para batch validation).
- Cada commit es revertible aisladamente — si el rewrite fue erróneo pero la re-validation no, autor puede `git revert` selectivo.
- `git log` produce historial educativo: "primero hubo disputed, luego autor decidió X, luego se re-validó".
- Audit trail completo: cada decisión humana queda como commit independiente con timestamp.

**Phase 9 SKILL.md ya hace (ii) — `git commit` está en su Paso 9.** El batch sólo necesita hacer (i) explícitamente antes de invocar el skill hijo.

**Sufijo `POST-fix` / `POST-rewrite` en el commit del skill hijo:** Phase 9 SKILL.md NO conoce el contexto del batch — su template genérico es `validate(<cat>): <id> → <status> (Opus + Sonnet)`. Dos opciones para añadir el sufijo:

1. **`git commit --amend` después** que el skill hijo termina: el batch lee el último commit con `git log -1 --format='%s'`, modifica el subject, hace `git commit --amend -m <new-subject>`. **Riesgo:** amend re-firma el commit (puede romper hooks que validan firmas). **Mitigación:** el proyecto no tiene hooks (cf. T-09-03-T2 en Phase 9 Plan 09-03 threat model). **Recomendación:** OK.
2. **Pasar contexto al skill hijo** (e.g. via env var o argumento extra) — el skill Phase 9 NO acepta argumentos extra (`argument-hint: "<exercise-id> [--dry-run]"`). Modificar `argument-hint` viola el constraint "Phase 10 NO modifica gsd-validate-exercise". **Descartado.**

**Recomendación final:** opción 1 (`git commit --amend`) — añadir sufijo post-hoc al commit del skill hijo en paths (a)/(c).

### Q9 — Suggested-fix derivation del `[Cn-criterio]` tag

**Decisión: Mapping determinístico ya documentado en D-VAL-26. Sub-skill parsea el PRIMER tag en `concerns[]` del PRIMER pase con `verdict:"incorrecta"`. Sin AI suggestion-engine.**

**Evidencia desde Phase 9 piloto + fixture (HIGH confidence):**

Concerns observados en `tests/fixtures/validation-pilot-disputed.json` (los 2 pases del fixture E3):

```json
"concerns": [
  "[C5-leak] el prompt contiene '(refuerzo regla §1 fem -a→-e)' — incluye referencia a regla numerada (§1), la transformación literal (-a→-e) y el patrón prohibido 'refuerzo regla'; la solución y la regla están explícitas en el enunciado, viola R1."
]
```

```json
"concerns": [
  "[C5-leak] el prompt contiene '(refuerzo regla §1 fem -a→-e)': incluye la referencia explícita '§1' (patrón §\\d+ prohibido), el label meta 'refuerzo regla', y la transformación literal '-a→-e' que es exactamente la solución — viola R1 de forma completa y directa."
]
```

**Patrones confirmados:**

- Cada concern empieza con `[Cn-criterio]` literal (Phase 9 VALIDATION-PROMPT.md sección "Tags" + few-shot FAIL example).
- Los 5 tags estables: `[C1-natural]`, `[C2-una_opcion]`, `[C3-distractoras]`, `[C4-explanation]`, `[C5-leak]`.
- Después del tag, prosa libre en español describiendo el bug.

**Regex de parseo (zero-deps):**

```javascript
function extractTag(concernString) {
  // Match [C1-natural], [C2-una_opcion], [C3-distractoras], [C4-explanation], [C5-leak]
  const m = /^\[(C[1-5]-[a-z_]+)\]/.exec(concernString);
  return m ? m[1] : null;
}

function suggestFix(concerns, exerciseId, payload) {
  for (const c of concerns) {
    const tag = extractTag(c);
    if (!tag) continue;
    switch (tag) {
      case 'C1-natural':
        return 'Reescribir el prompt para italiano más natural — sin propuesta concreta (revisión manual del autor).';
      case 'C2-una_opcion':
        return `Reformular el prompt para forzar UNA preposición/respuesta. (Alternativa: cambiar correctIndex — pero el schema multiple-choice acepta UN solo índice, así que cualquier ambigüedad real requiere reformular prompt.)`;
      case 'C3-distractoras':
        return 'Reemplazar distractoras con errores típicos del hispanohablante (e.g. falsos amigos, cognates con género distinto, conjugaciones de español).';
      case 'C4-explanation':
        return 'Reescribir explanation enfocada al alumno: sin meta-staging ("Cierra la serie..."), sin refs `#NNN`, coherente con prompt + respuesta correcta.';
      case 'C5-leak':
        return `Eliminar la frase/marca que contiene la regla del prompt. Concern literal: ${c.slice(0, 200)}...`;
    }
  }
  return 'Sin suggested fix automatizable — revisa concerns[] manualmente y decide rewrite.';
}
```

**Nota sobre `[C2-una_opcion]`:** la mención de "cambiar correctIndex" en D-VAL-26 es engañosa — el schema multiple-choice (`validateMultipleChoicePayload`) acepta UN entero `correctIndex` (no array). Si dos opciones son ambas válidas en italiano natural, la solución correcta SIEMPRE es reformular el prompt para forzar una sola, no añadir aceptación múltiple. El suggested fix de Q9 lo refleja explícitamente.

**Fallback "Sin suggested fix automatizable":** si los concerns no tienen tag parseable (degraded — el subagent emitió prosa libre sin tag), el banner muestra el fallback. AskUserQuestion sigue ofreciendo las 4 opciones; el autor decide informado por el concern literal.

### Q10 — AVERE prefix invariant durante batch de avere

**Decisión: ejecutar `node scripts/assert-avere-prefix-unchanged.mjs` exit 0 AL FINAL de la categoría avere, NO entre cada mutación.**

**Razonamiento (HIGH confidence):**

- Phase 9 Plan 09-02 ya relajó `stripAdditive()` para aceptar el campo `validation` (cf. D-178 opción A extendida, D-VAL-08).
- El piloto Phase 9 P09-03 §Self-Check punto 3 confirmó: "AVERE prefix assert OK tras mutar `avere-001` (relax `stripAdditive()` del Plan 09-02 funciona como diseñado)".
- Por construcción: si el campo `validation` es la ÚNICA mutación en cada ejercicio avere (lo que el skill hijo `gsd-validate-exercise` garantiza — Phase 9 SKILL.md Paso 8: "Mergea `validation = {status, passes}` al JSON del ejercicio (preserva resto)"), el assert pasará para los 22 pendientes de avere.
- Riesgo de assert-fail: NULO si el sub-skill batch sólo invoca `gsd-validate-exercise` (que muta sólo validation field). Riesgo NO NULO en path-A (Accept fix) y path-C (Rewrite) cuando el FIX cambia `payload.prompt/options/correctIndex/explanation` de un ejercicio del prefix avere (primeros N de `avere.json` blindados).

**Mitigación granular para paths (a)/(c) sobre ejercicios del prefix avere:**

- Plan-time recomendación: el sub-skill DESPUÉS de cada path-A/path-C sobre cualquier ID que matche `^avere-0?0?[1-9]$` o esté en los primeros N (donde N viene del snapshot `assert-avere-prefix-unchanged.mjs` source), ejecuta el assert ANTES del commit. Si exit≠0: rollback el Edit, surface al autor con "este fix toca el prefix avere blindado por D-88 — necesitas regenerar el snapshot con `node scripts/snapshot-avere-prefix.mjs` antes de continuar".
- Para evitar la complejidad: **assert al final de la categoría avere** (como recomendación principal). El autor recibe el error de assert en una sola tabla post-procesamiento, no en medio del flow.

**Plan-time decisión definitiva:** assert al final de la categoría avere (D-VAL-22 segunda categoría). Si el assert falla:
- Banner pause + AskUserQuestion: "El assert AVERE prefix falló. Opciones:
  (1) Regenerar snapshot con `node scripts/snapshot-avere-prefix.mjs` (si las mutaciones son intencionales y aprobadas)
  (2) Revertir el último commit del path-A/C que tocó el prefix (`git revert`) e investigar
  (3) Pausar el batch para revisar manualmente"

**Para preposiciones/essere/etc. (NO blindados):** sin assert intermedio. Solo el reporter final (Q5) verifica consistencia global.

---

## Open Questions

1. **Consistency check del reporter ante override del autor (path-B):** el JSON tras path-B tiene `status:"validated"` escrito pero `deriveStatus(passes)` retorna `"disputed"` (sticky). ¿El reporter:
   - (a) Lista la divergencia como "warning de override" (no FAIL),
   - (b) Mantiene una whitelist de IDs con override desde STATE.md y los excluye del consistency check,
   - (c) Relaja la regla: "si derived == disputed PERO existe entry con `by:'autor'` y `verdict:'correcta'`, treat as validated".

   **Recomendación implícita:** (c) — semánticamente más limpio, no requiere whitelist externa. Plan-time confirma.

2. **Sufijo POST-fix vía `git commit --amend`:** ¿el plan-time es comfortable con amend post-hoc al commit del skill hijo? Alternativa: añadir un argumento opcional `--context-suffix <text>` al `gsd-validate-exercise` (violaría "Phase 10 NO modifica gsd-validate-exercise" — pero el cambio sería puramente cosmético al commit message, no a la lógica). **Sugerencia:** mantener Phase 9 intocable + usar `--amend` (cf. Q8).

3. **¿El sub-skill llama también a `scripts/validate-content-fixture.mjs` post-mutación por categoría?** Para garantizar que el JSON sigue válido contra schema tras cada `Edit` del validation field. CONTEXT.md §Reusable Assets lo menciona como helper invocable. Recomendación implícita: SÍ, al final de cada categoría — defensa en profundidad contra Edits que corrompan el JSON formatting (raras pero no imposibles).

4. **Inactividad del autor durante checkpoint:** si el autor responde a un AskUserQuestion 6 horas después, ¿el contexto del batch sigue válido? Claude Code session timeouts no están claros — el plan-time podría documentar "el batch tolera pausas de hasta 24h gracias al resume idempotente; tras una pausa larga, recomendado re-invocar `/gsd-validate-batch <category>` para refrescar contexto en lugar de continuar el AskUserQuestion stale".

5. **Banner con >10 disputed:** CONTEXT.md (D-VAL-26 + deferred) deja al plan-time decidir entre secuencial 1-por-1 vs agrupado expand. Recomendación implícita: secuencial sin agrupar — la decisión editorial por ejercicio es trabajo aislado, agruparlas tienta a procesar superficialmente. Plan-time confirma o pivota.

---

## Code Examples

### Skeleton `gsd-validate-batch/SKILL.md` (drop-in para plan task)

Ver Q1 — el esqueleto está completo allí (pasos 1-4 + paso 3 cola disputed).

### Helper para extraer tag determinístico del concern

```javascript
// Inline dentro del SKILL.md body, ejecutable via `node -e` o como Bash heredoc.
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
  'C1-natural': 'Reescribir prompt para italiano más natural.',
  'C2-una_opcion': 'Reformular prompt para forzar UNA opción (el schema multiple-choice no acepta múltiples correctIndex).',
  'C3-distractoras': 'Reemplazar distractoras con errores típicos hispanohablante.',
  'C4-explanation': 'Reescribir explanation enfocada al alumno (sin meta-staging, sin #NNN refs).',
  'C5-leak': 'Eliminar la frase/marca que contiene la regla del prompt.'
};
```

### Path-A inline workflow (concrete commands)

```bash
# Después de AskUserQuestion respuesta == "Accept fix":

# 1. Aplicar el fix (ejemplo C5-leak: eliminar el leak del prompt):
#    Usar Edit tool sobre content/exercises/<cat>.json apuntando al ejercicio.

# 2. Resetear passes[] y status:
#    Edit tool: cambia "validation": {"status":"disputed","passes":[...]}
#              por  "validation": {"status":"pending","passes":[]}

# 3. Commit del fix:
git add content/exercises/<cat>.json
git commit -m "fix(<cat>): <id> — autor acepta sugerencia post-disputed ([C5-leak])"

# 4. Re-validar invocando el skill hijo:
#    (Esto es una invocación del Skill tool desde el SKILL.md body —
#    en el flujo real Claude lo escribirá como `/gsd-validate-exercise <id>`
#    o el equivalente Skill(gsd-validate-exercise <id>).)

# 5. Tras el commit del skill hijo, modificar su mensaje:
PREV_SUBJECT=$(git log -1 --format='%s')
NEW_SUBJECT="$PREV_SUBJECT — POST-fix (accept fix tras disputed)"
git commit --amend -m "$NEW_SUBJECT"
```

### Path-B inline workflow

```bash
# Después de AskUserQuestion respuesta == "Reject + override":

# 1. AskUserQuestion follow-up: capturar razón del override.
RAZON="<lo que respondió el autor>"

# 2. Edit tool sobre el JSON:
#    Antes:
#      "validation": {
#        "status": "disputed",
#        "passes": [
#          {"by":"claude-opus-4-7", ..., "verdict":"incorrecta", ...},
#          {"by":"claude-sonnet-4-6", ..., "verdict":"incorrecta", ...}
#        ]
#      }
#    Después:
#      "validation": {
#        "status": "validated",
#        "passes": [
#          {"by":"claude-opus-4-7", ..., "verdict":"incorrecta", ...},
#          {"by":"claude-sonnet-4-6", ..., "verdict":"incorrecta", ...},
#          {"by":"autor","date":"2026-MM-DD","verdict":"correcta","concerns":["[override] autor mantiene original tras revisión: $RAZON"]}
#        ]
#      }

# 3. Commit:
git add content/exercises/<cat>.json
git commit -m "validate(<cat>): <id> → validated (override autor, post-disputed)"
```

### Reporter skeleton (post-processing puro)

Ver Q5 — el reporter completo está allí (~120 LOC, ANSI colors, 3 sub-gates, exit 0/1).

---

## Recommendations (ranked by confidence)

### HIGH confidence — implementar como recomendado

1. **Skill batch INLINE en sesión principal (NO `context: fork`).** El plan-time documenta esto como invariante en `<critical_constraints>` del nuevo SKILL.md. Q1.

2. **Reset de `passes[]` vive en el batch (Edit tool), NO en `gsd-validate-exercise`.** Skill Phase 9 intocable. Q4.

3. **Reporter post-processing puro — NO shellea `node --test`.** Mantén separación de responsabilidades. Q5.

4. **Suggested-fix determinístico via regex sobre `[Cn-criterio]` tag.** Cero AI extra. Mapping ya en D-VAL-26 y Q9.

5. **Aprovechar el retry automático built-in de Claude Code para rate-limits.** No añadir custom backoff. Resume idempotente cubre el resto. Q7.

6. **AVERE assert ejecutado AL FINAL de la categoría avere, no por cada mutación.** Q10.

### MEDIUM confidence — recomendaciones plan-time confirma o pivota

7. **`VAL_07_STRICT=1` documentado en README, autor flippea manualmente.** Q6 (Claude's Discretion).

8. **Granularidad de commits: 1 por mutación atómica (paths a/c producen 2 commits, b produce 1).** Q8 (Claude's Discretion).

9. **File-save detection en path-C vía AskUserQuestion "¿ya guardaste?", NO file-watcher / mtime poll.** Q3 (Claude's Discretion).

10. **Consistency check del reporter relaxa ante override del autor (Open Q #1, recomendación (c)):** si derived disputed PERO existe `by:"autor", verdict:"correcta"` → treat as validated.

### LOW confidence — área de discreción plan-time

11. **Banner secuencial 1-por-1 sin agrupar incluso si una categoría tiene >10 disputed.** D-VAL-26 deferred. Q ítem #5 Open Questions.

12. **`git commit --amend` para añadir sufijo POST-fix/POST-rewrite.** Q8 alternativa principal. Si el plan-time pivota a no-amend, el sufijo se pierde — los commits del skill hijo conservarán el template genérico, que sigue siendo legible.

13. **Invocar `validate-content-fixture.mjs` post-mutación por categoría como defensa en profundidad.** Open Q #3.

---

## Sources

### Primary (HIGH confidence)

- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills) — frontmatter reference, lifecycle, `context: fork`, `allowed-tools` incl. `Skill`, dynamic context injection, skill content lifecycle.
- [Claude Code — Create custom subagents](https://code.claude.com/docs/en/sub-agents) — *"Subagents cannot spawn other subagents"* (línea 760 + sec. Built-in Plan subagent), Skill tool availability from subagents, preload skills field, what loads at startup.
- [anthropics/claude-code#18721 — AskUserQuestion limitation in subagents (docs issue)](https://github.com/anthropics/claude-code/issues/18721) — limitación confirmada por la documentación oficial; workaround "escalation pattern".
- [Claude Code — Error reference](https://code.claude.com/docs/en/errors) — *"Automatically retries server errors, overloaded responses, request timeouts, temporary 429 throttles, and dropped connections up to 10 times with exponential backoff"*.
- `.claude/skills/gsd-validate-exercise/SKILL.md` (Phase 9 deliverable) — frontmatter sin `context: fork` confirma orquestación inline; `<execution>` Paso 8 documenta APPEND default + responsabilidad del caller para reset.
- `scripts/run-validation-pilot.mjs` (Phase 9 deliverable) — patrón canónico del reporter post-processing puro: ANSI colors zero-deps, `deriveStatus` import, exit 0/1 sobre sub-gates.
- `src/data/validation-state.js` — `deriveStatus(passes)` con sticky disputed D-VAL-07. Comportamiento confirmado en piloto P09-03.
- `src/data/schema-validator.js::validateValidationShape` — enforça shape del `validation` field; pasa `by:"autor"` como string válido (path-B compatible).
- `tests/exercise-types.test.js` líneas 1395-1413 — VAL-07 paramétrico con `process.env.VAL_07_STRICT === '1'` + `{skip: condition}` option.
- `tests/fixtures/validation-pilot-disputed.json` — concerns reales con tag `[C5-leak]` confirma formato del tag para Q9 regex.
- `.planning/phases/09-infraestructura-de-validaci-n/09-03-SUMMARY.md` — gate D-VAL-15 PASS limpio + observaciones que informan Phase 10 (paridad Opus+Sonnet, parsing robusto, latencia ~15s/spawn).

### Secondary (MEDIUM confidence)

- [SitePoint — Claude Code Rate Limits Explained 2026](https://www.sitepoint.com/claude-code-rate-limits-explained/) — confirma backoff automático y session-limit messaging.
- [anthropics/claude-code#3513, #48390, #12891](https://github.com/anthropics/claude-code/issues/3513) — issues conocidos del Edit-tool mtime cache; informan Q3 decision (no usar file-watcher).
- [AI Free API — How to Fix Claude API 429 Rate Limit Error](https://www.aifreeapi.com/en/posts/claude-api-429-error-fix) — exponential backoff + retry-after headers (Q7 context).

### Tertiary (LOW confidence — secundarias, no críticas)

- [Toolradar — Best Claude Code Skills in 2026](https://toolradar.com/blog/best-claude-code-skills-2026) — patrón community sobre orquestación slash-command → subagent.
- [batsov.com — Essential Claude Code Skills and Commands](https://batsov.com/articles/2026/03/11/essential-claude-code-skills-and-commands/) — ejemplo de slash-commands invocando otros.

---

## Metadata

**Confidence breakdown:**
- Architecture (skill structure, no nested subagents, AskUserQuestion availability): HIGH — verificado contra 2 doc pages oficiales + 1 GitHub issue oficial + frontmatter del skill Phase 9 actual.
- Reset passes[] in batch (BYPASS sticky): HIGH — Phase 9 SKILL.md Paso 8 lo predice explícitamente.
- Reporter design: HIGH — patrón ya establecido por `run-validation-pilot.mjs`; Q5 sólo escala scope.
- Suggested-fix regex: HIGH — fixture real del piloto confirma formato literal del tag.
- AVERE assert timing: HIGH — D-178 relax + piloto P09-03 confirma comportamiento.
- File-save detection path-C: MEDIUM — recomendación basada en analogía con Plan 09-03 checkpoint pattern; sin evidencia empírica de file-watcher en este proyecto.
- Commit granularity: MEDIUM — extensión razonable de Phase 9 D-VAL-04 pero el plan-time tiene libertad.
- VAL_07_STRICT activation: MEDIUM — Claude's Discretion explícita en CONTEXT.md; recomendación implícita coincide.
- `--amend` para sufijo POST-fix: LOW — funciona en repos sin hooks (este proyecto), pero el plan-time podría pivotar.

**Research date:** 2026-05-26
**Valid until:** 2026-06-25 (30 días — el stack es estable, Claude Code docs no esperan cambios bruscos en skills/subagents API).
