# Phase 10: Ejecución validación 271 ejercicios + escalada disputed - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Aplicar la maquinaria entregada en Phase 9 (skill `gsd-validate-exercise` + `VALIDATION-PROMPT.md` + `deriveStatus` + `validateValidationShape` + smoke test paramétrico VAL-07 con feature flag OFF) a los **269 ejercicios pendientes** (271 totales − 2 ya validados en el piloto: `preposiciones-040` + `avere-001`) hasta `validation.status === "validated"` para los 271. Construir el **flujo VAL-08 disputed→resolved** por categoría con audit trail completo. Activar el smoke test estricto al cierre del milestone.

**Distribución del trabajo pendiente (269 ejercicios, 7 categorías):**

| Categoría | Pendientes | Notas |
|-----------|------------|-------|
| preposiciones | 49/50 | Categoría riesgo-first: aquí estaban los 4 bugs motivadores hist. `-040` ya validated; `-031/-032/-047` aún sin validar |
| profesiones | 51/51 | |
| genero-numero | 40/40 | Contiene fixture `pilot-disputed-c5-leak-001` en tests/fixtures (NO en content/, NO cuenta para los 271 reales) |
| essere | 39/39 | |
| verbos-movimiento | 37/37 | |
| sustantivos-irregulares | 31/31 | |
| avere | 22/23 | `avere-001` ya validated en piloto |

**Lo que NO entrega Phase 10:**
- Nuevos requirements editoriales (R8+) — sigue R1-R7.
- Cambios al `VALIDATION-PROMPT.md` Phase 9 salvo iteración si emerge un bug sistémico mid-run.
- 3er pase Gemini (D-VAL-03 risk monitor — descartado en discusión, ver D-VAL-21).
- UI runtime del usuario aprendiendo italiano (campo `validation` sigue invisible al alumno — D-VAL-08 invariante).
- Validación pedagógica/exhaustividad (out of scope explícito en REQUIREMENTS.md).

</domain>

<decisions>
## Implementation Decisions

### Orquestación bulk (Área A)

- **D-VAL-19:** Nuevo skill **`gsd-validate-batch <scope>`** (vive en `.claude/skills/gsd-validate-batch/SKILL.md`) corre en SU PROPIO subagent — context aislado del main del autor. Acepta scope:
  - `<category>` (e.g. `preposiciones`) — itera todos los ejercicios pendientes de esa categoría.
  - `--all-pending` — itera todas las categorías en orden lockeado (ver D-VAL-22).
  - `<id1,id2,...>` — lista explícita de IDs (caso de re-validación de disputed resuelto).

  El batch skill internamente: (1) lee los JSONs de la categoría, (2) filtra los que **ya** tienen `validation.status === "validated"` (idempotencia / resume), (3) por cada pendiente invoca el skill existente `gsd-validate-exercise <id>` (que ya spawnea Opus+Sonnet, parsea, mergea, commitea — Phase 9 D-VAL-04 vigente).

  **Resume semantics:** crash, Ctrl-C, o re-invocación al día siguiente → el batch skill vuelve a leer el JSON y autoskippa los ya validated. **El estado verdad vive en los JSONs de `content/exercises/`, no en un manifest paralelo.** Cero acoplamiento entre runs.

- **D-VAL-20:** El sub-skill mantiene la garantía arquitectónica **NUNCA batched** (VAL-03 + Phase 9 `<workflow_justification_no_batched>`): él itera N veces pero el skill `gsd-validate-exercise` que invoca **sigue siendo single-exercise con context aislado por Task() spawn**. El batch NO compone N ejercicios en un mismo subagent — sería un regreso al bug class de los 4 motivadores. Phase 10 escala el bucle, NO afloja el aislamiento.

### Quórum (Área D)

- **D-VAL-21:** **Stick con Opus + Sonnet** (D-VAL-02 reconfirmado). El piloto Phase 9 demostró detección limpia del C5-leak (E3 → disputed con `[C5-leak]` tag) sin falsos negativos en los 2 sanos. La paridad Opus+Sonnet en ejercicios correctos es esperada y no señal de sesgo per se. **Reconsider trigger:** si Phase 10 sobre Preposiciones (la categoría con todos los bugs históricos, ejecutada primero por D-VAL-22) sale con dispute-rate < 5% — es decir, falla en detectar al menos 2-3 de los issues conocidos (ej. los 3 motivadores -031/-032/-047 pasan como `validated` cuando deberían surface concerns), pausar el batch y reconsiderar añadir Gemini antes de gastar 220 spawns en las 6 categorías restantes. **Coste evitado vs riesgo aceptado:** ~270k tokens de Gemini × 269 frente a confiar en la evidencia del piloto.

### Orden + estrategia (Área B)

- **D-VAL-22:** **Orden de categorías lockeado (riesgo-first + alfabético):**
  1. **preposiciones** (49 pendientes) — máximo riesgo, detecta bugs sistémicos del prompt si los hay.
  2. avere (22)
  3. essere (39)
  4. genero-numero (40)
  5. profesiones (51)
  6. sustantivos-irregulares (31)
  7. verbos-movimiento (37)

  **Por qué:** Preposiciones primero porque los 4 motivadores históricos (y los 3 restantes sin validar) están ahí — si el VALIDATION-PROMPT tiene bias, sale en la categoría con más probabilidad de exponerlo, con margen para iterar prompt o spawn 3er AI ANTES de gastar 220 spawns en las 6 sanas. Tras Preposiciones, las 6 restantes en orden alfabético (predecible, sin lógica oculta, fácil mental model "voy por la N-ésima de 7").

- **D-VAL-23:** **Checkpoint por categoría:** el sub-skill procesa UNA categoría entera y pausa. Al terminar emite un **resumen tabla por consola en español** con conteos: `Preposiciones: 45 validated / 4 disputed / 0 pending`. Si hay disputed (>0), entra a la cola VAL-08 (D-VAL-24..26) ANTES de pasar a la siguiente categoría. Si no, banner "Categoría limpia, sigues con avere?" + AskUserQuestion: continuar / pausar. **7 categorías = 7 checkpoints naturales, cada uno con commits atómicos por ejercicio (D-VAL-04 vigente).**

### Flujo VAL-08 disputed (Área C)

- **D-VAL-24:** **Cola al final de cada categoría, NO inline interrupt durante el batch.** Cuando una AI emite `verdict: incorrecta` durante el procesamiento de una categoría, el skill `gsd-validate-exercise` ya termina su trabajo: append entries a `passes[]`, `deriveStatus` returns `"disputed"` (sticky D-VAL-07), commit atómico con mensaje `validate(<cat>): <id> → disputed (Opus + Sonnet)`. El ejercicio queda persistido en estado disputed en su JSON. El sub-skill batch (D-VAL-19) acumula la lista de IDs disputed mientras itera, y al terminar la categoría emite el banner de resumen — entonces ofrece la cola al autor.

  **Por qué cola y NO inline:** la decisión editorial (accept/reject/rewrite) es trabajo cognitivo distinto del mecánico de validation. Romper el batch 5-15 veces por categoría fragmenta el flow; resolverlas en bloque permite al autor encarar las 4-8 disputed de Preposiciones con la cabeza en modo "editor decisivo" en vez de "stop-go".

- **D-VAL-25:** **Política de re-validación post-resolución (estricta):**

  Por cada disputed en la cola, 4 caminos terminales:

  | Camino | Acción del autor | Mutación al JSON | Re-validación obligatoria |
  |--------|------------------|------------------|---------------------------|
  | **(a) Accept fix** | Acepta el suggested fix derivado del `[Cn-...]` tag | Aplicar fix al `prompt`/`options`/`explanation` según el tag | **SÍ — re-invoca `gsd-validate-exercise <id>`** → 2 pases frescos Opus+Sonnet (passes[] crece a 4 entries: las 2 originales con incorrecta + las 2 nuevas con correcta). Sticky D-VAL-07 ya no aplica porque deriveStatus ve la incorrecta histórica → seguiría `disputed`. **Solución:** el sub-skill BYPASS sticky resetea `passes[]` a las 2 entries nuevas SOLO en este camino, conservando audit trail en mensaje commit (`validate(<cat>): <id> → validated POST-fix (Opus + Sonnet, accept fix tras disputed)`). |
  | **(b) Reject + override** | Mantiene original, decide que las AIs están equivocadas | NO mutar `prompt`/`options`/`explanation`. Append entry `{by: "autor", date: ISO, verdict: "correcta", concerns: ["override: autor mantiene original tras revisión"]}` a `passes[]` Y setear `validation.status = "validated"` directamente (BYPASS deriveStatus). | **NO — el autor ES el oracle final, re-validar sería ritual sin valor (mismo input → mismo `incorrecta`).** Audit trail en `passes[]` deja evidencia eterna del override. |
  | **(c) Rewrite manualmente** | Edita prompt/answer/distractors a su criterio | El sub-skill abre el JSON del ejercicio para edición (Edit tool sobre `content/exercises/<cat>.json` con jump al ejercicio) y espera al autor. Tras guardar, el JSON queda con ejercicio nuevo + `passes[]` = vacío o conservado-as-history (el sub-skill resetea a vacío con audit en commit). | **SÍ — re-invoca `gsd-validate-exercise <id>`** → 2 pases frescos. Si el rewrite sigue saliendo disputed, vuelve a la cola del ciclo siguiente (no se cierra hasta validated). |
  | **(d) Skip / defer** | No resolver ahora | Sin mutación. El ejercicio queda con `status: disputed` persistido. El sub-skill loggea en STATE.md `<deferred-disputed>` con ID + razón. | **N/A** — VAL-06 (271/271 validated) impide cerrar el milestone con deferred. La opción Skip existe para permitir que el autor continue con otras categorías y vuelva en otra sesión, NO para descomitar. |

  **Por qué estricto (rewrite + accept-fix re-validan):** la garantía editorial del milestone es "validated ⇔ ≥2 AIs distintas correctas O override consciente del autor". Si accept-fix solo aplicara el fix sin re-validar, perderíamos esa garantía para los exercises tocados — quedaría un asterisco silencioso en el audit trail.

  **Por qué reject NO re-valida:** el reject es explícitamente "el autor sabe más que las AIs". Re-pasar Opus+Sonnet sobre el mismo input deterministico daría `incorrecta` de nuevo (la deriva entre invocaciones es mínima para inputs idénticos). El override directo del autor con audit trail completo es la solución limpia.

- **D-VAL-26:** **UX del banner por cada disputed (pretty-print + AskUserQuestion):**

  Para cada ID en la cola, el sub-skill imprime:

  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISPUTED — preposiciones-031 (Preposiciones, ejercicio 31/50)
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Prompt:    "Metto i libri ___ scaffali."
   Opciones:  [a] sui  [b] negli  [c] dei  [d] dai
   Correcta:  [a] sui   (según el ejercicio actual)
   Explicación: "..."

   Verdict Opus    (claude-opus-4-7):    incorrecta
   Concerns Opus:  ["[C2-una_opcion] ambiguo entre 'sui scaffali' y 'negli scaffali' — ambas natural en italiano según contexto"]

   Verdict Sonnet  (claude-sonnet-4-6):  incorrecta
   Concerns Sonnet: ["[C2-una_opcion] tanto 'sui' como 'negli' son naturales — preposición depende del matiz semántico"]

   Suggested fix:  cambiar `correctIndex` a aceptar [a] y [b] (no soportado por schema multiple-choice → debe rewrite),
                   O reformular prompt para forzar UNA preposición (e.g. añadir contexto explícito).
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```

  Después invoca AskUserQuestion con **4 opciones literales en español:**
  - `Accept fix` — Aplica el suggested fix tal cual + re-valida (D-VAL-25 camino a)
  - `Reject + override` — Mantiene original + override del autor (D-VAL-25 camino b)
  - `Rewrite manualmente` — Abre el JSON para edición + re-valida (D-VAL-25 camino c)
  - `Skip (defer al final del milestone)` — No mutar, sigue con siguiente disputed (D-VAL-25 camino d)

  **Suggested fix sourcing:** el sub-skill deriva el fix del `[Cn-criterio]` tag más prominente en `concerns[]`:
  - `[C1-natural]` → "reescribir prompt para italiano más natural" (sin propuesta concreta)
  - `[C2-una_opcion]` → "reformular prompt para forzar UNA opción" o "cambiar correctIndex" (si schema lo permite)
  - `[C3-distractoras]` → "reemplazar distractoras con errores típicos hispanohablante"
  - `[C4-explanation]` → "reescribir explanation enfocada al alumno (sin meta-staging, sin `#NNN` refs)"
  - `[C5-leak]` → "eliminar la frase/marca que contiene la regla del prompt" (más concreto cuando el concern cita literal el leak)

  Sin AI suggestion-engine adicional — el tag YA lleva la dirección.

### Claude's Discretion

Áreas dejadas explícitamente al plan-time (con tradeoffs):

- **Activación del smoke test estricto VAL-07:** D-VAL-17 (Phase 9) ya orientó hacia env var `VAL_07_STRICT=1`. Plan-time decide si: (i) documentar en README + autor lo flippea manualmente al cerrar la 7ª categoría, (ii) el sub-skill al terminar la última categoría auto-escribe `.env` con el flag y corre `node --test`, (iii) configuración persistente en `.planning/config.json`. Recomendación implícita: **(i)** — auto-activar mete mutación de configuración silenciosa al final de un batch que ya fue agotador para el autor; mejor que el autor decida conscientemente el momento del flip como gate del milestone.

- **Paralelo vs secuencial Opus+Sonnet por ejercicio:** Phase 9 piloto fue secuencial (D-VAL-04 lock para piloto). Phase 10 plan-time puede pivotar a `Promise.all` o equivalente (~2x throughput por ejercicio, 1.0x debug clarity). Recomendación implícita: **secuencial** — el bottleneck del batch no es la latencia Opus→Sonnet sino el throughput agregado de 269 ejercicios; paralelizar dentro del ejercicio gana minutos, no horas. Mantener secuencial conserva el debug-friendly flow ya validado por el piloto.

- **Reporter final estilo `scripts/run-validation-pilot.mjs` generalizado a 271:** el actual hardcoded de 3 IDs. Phase 10 necesita su equivalente — `scripts/run-validation-271.mjs` (o nombre similar) que genere tabla por las 7 categorías + 4 sub-gates: VAL-04 (todos los 271 con ≥2 pases AIs distintos), VAL-06 (271/271 `status === "validated"`), VAL-08 (cero IDs en estado disputed sin override del autor), y exit code = 0 sólo si los 4 PASS. Plan-time decide nombre y si reutiliza `deriveStatus` directamente o no. **Constraint:** debe ser POST-processing puro (NO invoca Task(), NO orquesta) — paralelo al patrón del reporter piloto.

- **Manejo de rate-limits / fallos de red durante el batch:** el skill base `gsd-validate-exercise` ya tiene retry budget = 1 (D-VAL-04). El sub-skill batch: si una invocación del skill base sale con `pending` (ambos pases parse-failed 2× o crash), ¿continuar con el siguiente o pausar? Recomendación implícita: **continuar y loggear** — el ejercicio queda en `pending` (NO disputed, NO validated), el resumen tabla lo refleja al final de la categoría, el autor decide si re-invoca o investiga. NO bloquea el batch entero por un parse-failed.

- **Granularidad del banner cuando muchos disputed (>10 en una cat):** plan-time decide si presentar todos secuencialmente con AskUserQuestion separado por cada uno, o agrupar en una vista de resumen y dejar al autor expandir 1 por 1. Recomendación implícita: **secuencial 1 por 1 sin agrupar** — la decisión editorial por ejercicio es trabajo aislado; agruparlas tienta al autor a procesar superficialmente.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level governance (siempre)
- `.planning/PROJECT.md` — Constraints + Key Decisions (v1.0 + v1.1). El core value "el sistema te obliga a no olvidar" se extiende a la garantía editorial en v1.1.
- `.planning/REQUIREMENTS.md` — 8 requirements VAL-01..08. Phase 10 cierra VAL-04 + VAL-06 + VAL-08; los 5 restantes ya completados en Phase 9.
- `.planning/ROADMAP.md` §"Phase 10: Ejecución validación 271 ejercicios + escalada disputed" — Goal + 5 success criteria + Depends on Phase 9.
- `.planning/STATE.md` §"Decisions Pending" + §"Key Decisions (v1.1)" — el contexto del piloto Phase 9 PASS limpio que autorizó este Phase 10.

### Phase 9 artefactos (ESENCIAL — Phase 10 construye DIRECTO sobre estos)
- `.planning/phases/09-infraestructura-de-validaci-n/09-CONTEXT.md` — D-VAL-01..18 lockeadas en Phase 9 que se respetan en Phase 10 (especialmente D-VAL-02 Opus+Sonnet, D-VAL-03 Gemini risk monitor, D-VAL-04 commit granularity + retry budget, D-VAL-07 sticky disputed, D-VAL-08 schema validator branch).
- `.planning/phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — el prompt R1-R7 + C1-C5 + contrato JSON output que el skill `gsd-validate-exercise` ya consume. Phase 10 NO modifica este archivo salvo iteración tras bug sistémico mid-run.
- `.planning/phases/09-infraestructura-de-validaci-n/09-RESEARCH.md` §"Open Questions" — 5 preguntas resueltas en Phase 9 cuyas decisiones persisten (especialmente Open Q1 sobre paralelo vs secuencial, ahora reabierta como Claude's Discretion).
- `.planning/phases/09-infraestructura-de-validaci-n/09-03-SUMMARY.md` — gate D-VAL-15 resultado literal del piloto (E1+E2+E3 PASS limpio); evidencia que justifica D-VAL-21 stick con Opus+Sonnet.
- `.claude/skills/gsd-validate-exercise/SKILL.md` — orquestador single-exercise Opus+Sonnet que Phase 10 invoca 269× desde el nuevo sub-skill batch (D-VAL-19).

### Editorial rules (subagent context)
- `~/.claude/projects/-home-vcompanyb-italian-course/memory/exercise_authoring_rules.md` — fuente de verdad R1-R7. El VALIDATION-PROMPT.md ya las lleva inline literales (Phase 9 D-VAL-02 / Plan 09-02), así que Phase 10 NO necesita re-inyectarlas al subagent — solo el autor las lee cuando edita ejercicios en el camino (c) rewrite.

### Schema + state + content
- `src/data/schema-validator.js` — `validateValidationShape` ya enforça shape del campo `validation`. Phase 10 NO modifica.
- `src/data/validation-state.js` — `deriveStatus(passes)` con sticky D-VAL-07. Phase 10 lo CONSUME tal cual desde el sub-skill batch + el reporter final. El BYPASS sticky para reject+override (D-VAL-25 camino b) NO se hace via `deriveStatus` sino con asignación directa `validation.status = "validated"` desde el sub-skill.
- `content/exercises/{avere,essere,genero-numero,preposiciones,profesiones,sustantivos-irregulares,verbos-movimiento}.json` — los 7 archivos donde viven los 269 ejercicios pendientes. **Mutados in-place** por el skill `gsd-validate-exercise` (D-VAL-04 commit 1-por-ejercicio).
- `content/categories.json` — referenciado para el orden lockeado D-VAL-22 (slugs ASCII enforced).
- `tests/exercise-types.test.js` — contiene el bloque paramétrico VAL-07 con feature flag `VAL_07_STRICT=1`. Phase 10 close = flip env var (Claude's Discretion sobre el cómo).

### Tests + scripts existentes (reutilización vs nuevo)
- `scripts/run-validation-pilot.mjs` — reporter hardcoded de 3 IDs. **Plantilla** del nuevo reporter Phase 10 (`scripts/run-validation-271.mjs` o equivalente) — patrón POST-processing puro confirmado.
- `scripts/validate-content-fixture.mjs` — invocable como helper si el sub-skill batch quiere verificar que el JSON tras mutación sigue válido contra el schema.
- `scripts/assert-avere-prefix-unchanged.mjs` — D-88 APPEND-ONLY de avere prefix. `stripAdditive()` ya relaja el campo `validation` (Phase 9 Plan 09-02). Phase 10 NO debe romper este invariante cuando muta los 22 pendientes de avere.

### Phase 9 decisiones que constrain Phase 10
- D-VAL-01 (skill + Task() subagents, no scripts node + child_process).
- D-VAL-02 (Opus + Sonnet model IDs literales — D-VAL-21 reconfirma).
- D-VAL-03 (Gemini risk monitor — D-VAL-21 resuelve a NO añadir, con trigger de reconsideración explícito).
- D-VAL-04 (retry budget = 1, commit 1-por-ejercicio).
- D-VAL-07 (sticky disputed — D-VAL-25 camino b BYPASS sticky explícito con audit trail).
- D-VAL-08 (validator hand-written, no Ajv/Zod).
- D-VAL-13/14/15 (gate Phase 9 PASS — autoriza Phase 10).
- D-176 (cero migración schemaVersion para content-changes — Phase 10 muta `validation` en cada JSON sin tocar schemaVersion 4).
- D-88 + D-178 (APPEND-ONLY avere prefix + stripAdditive() relax para `validation`).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`.claude/skills/gsd-validate-exercise/SKILL.md`** — el orquestador single-exercise ya cubre 100% del flow per-ejercicio: Read VALIDATION-PROMPT.md → resolver ID → spawn Opus → spawn Sonnet → parsear → deriveStatus → Edit JSON → commit atómico. **Phase 10 NO modifica este skill**; solo lo invoca desde el nuevo sub-skill batch (D-VAL-19). Cualquier mejora al per-ejercicio (e.g. paralelo Opus+Sonnet — Claude's Discretion) afecta ESTE skill, no el batch.
- **`src/data/validation-state.js::deriveStatus(passes)`** — pure helper importable. Sub-skill batch lo invoca al final de cada ejercicio (vía el skill base) y el reporter final lo invoca por ejercicio para verificar coherencia `written status === derived status`.
- **`scripts/run-validation-pilot.mjs`** — patrón POST-processing del reporter: lee JSONs, agrupa, computa sub-gates, exit 0/1. **Plantilla** del nuevo reporter Phase 10 sobre 271 con la diferencia de scope (categoría completa vs IDs hardcoded). ANSI colors + tabla padded zero-deps reutilizables.
- **`scripts/validate-content-fixture.mjs`** — helper para invocar `validateContent({categories, exercisesByFile})` con la firma real. Sub-skill batch puede llamarlo POST-mutation por categoría para garantizar que los JSONs siguen pasando schema.
- **`src/data/schema-validator.js::validateValidationShape`** — enforça whitelist `status ∈ {pending,validated,disputed}` + ISO date + verdict ∈ {correcta,incorrecta} + `by` string + concerns string[]. **Toda mutación del sub-skill o del autor en rewrite tiene que respetar este shape** o el smoke test paramétrico Phase 9 va a romper baseline.
- **AskUserQuestion (tooling de Claude Code)** — Phase 10 sub-skill batch lo usa intensivo para: (i) checkpoint por categoría (continuar/pausar), (ii) cola de disputed (4 opciones literales D-VAL-26), (iii) confirmación de rewrite (post-edit → re-validar?).

### Established Patterns

- **Subagent context isolation NUNCA batched** (Phase 9 D-VAL-01 + workflow_justification_no_batched) — el sub-skill batch ITERA pero NO compone N ejercicios en mismo contexto. Garantía arquitectónica del bug class. **D-VAL-20 lo reconfirma para Phase 10.**
- **Commit-per-ejercicio atómico** (Phase 9 D-VAL-04 + Pattern 2 RESEARCH) — Phase 10 a escala produce ~269 commits adicionales (más los de re-validación tras disputed). `git log` queda con audit trail completo por ejercicio. Mensaje template: `validate(<cat>): <id> → <status> (Opus + Sonnet)` o variant con sufijo POST-fix / POST-rewrite / POST-override.
- **Mensajes hacia el autor en español (FOUND-04)** — banners del sub-skill batch (resumen por categoría, cola disputed, suggested fix) en castellano. El VALIDATION-PROMPT.md sigue siendo input al subagent (puede ser cualquier idioma) pero la output del sub-skill al autor es español.
- **Hand-written validators (D-08)** — Phase 10 NO introduce Ajv/Zod ni para el batch ni para el reporter. Sigue el estilo acumulador-de-errores existente.
- **JSON content por categoría, NO single file (D-176)** — el sub-skill itera por archivo de categoría. Cero archivo consolidado.
- **`tests/fixtures/` para fixtures editoriales fuera del runtime** (Phase 9 Plan 09-02 establecido) — Phase 10 NO crea nuevos fixtures salvo necesidad excepcional (e.g. si emerge un bug class nuevo durante el run).

### Integration Points

- **`.claude/skills/gsd-validate-batch/SKILL.md`** (NUEVO Phase 10) — orquesta `gsd-validate-exercise` (Phase 9) en bucle. Vive junto a éste en `.claude/skills/`.
- **`content/exercises/*.json`** — única fuente de verdad de estado (D-VAL-19 idempotencia/resume). NO hay manifest paralelo. El sub-skill lee, filtra ya-validated, itera pendientes.
- **`scripts/run-validation-271.mjs`** (NUEVO Phase 10, nombre tentativo) — reporter final del milestone. Invocado al cierre de la 7ª categoría o ad-hoc para auditar progreso. Exit 0 = milestone gate PASS.
- **`tests/exercise-types.test.js` bloque VAL-07** — flippeado al cierre vía env var `VAL_07_STRICT=1` (Claude's Discretion sobre el cómo). Una vez ON, cualquier ejercicio sin `validation.status === "validated"` rompe el test → previene regresión editorial.
- **NINGUNA integración runtime con el motor del alumno** — el campo `validation` sigue invisible al usuario (D-VAL-08 invariante, vigente desde Phase 9).
- **STATE.md** — al final de cada categoría el sub-skill (o el orchestrator que lo invoca) actualiza la sección "Current Position" con `Categoría N/7 cerrada — X validated / Y disputed-deferred`. Audit trail de progreso para el autor entre sesiones.

</code_context>

<specifics>
## Specific Ideas

- **Nombre tentativo del nuevo sub-skill:** `gsd-validate-batch`. Argument hint: `<scope>` donde scope ∈ {nombre de categoría, `--all-pending`, lista de IDs CSV}. Plan-time confirma o ajusta.

- **Suggested fix sourcing del banner disputed (D-VAL-26):** el sub-skill ES determinístico — deriva el fix textual del primer `[Cn-...]` tag más prominente en `concerns[]`, NO invoca otra AI. Mapping verbatim ya documentado en D-VAL-26. Si los concerns no tienen tag parseable (degradado), el banner emite `"Sin suggested fix automatizable — revisa concerns manualmente"`.

- **Para el camino (c) rewrite del autor:** el sub-skill abre el JSON con Edit tool apuntando al objeto del ejercicio dentro del archivo de categoría. El autor edita en su editor preferido (no impuesto — el invariante "doble click y funciona" se respeta) y guarda. El sub-skill detecta el cambio (e.g. re-leyendo el archivo y comparando) y procede a re-validar. Detalles de la detección → plan-time.

- **Para el camino (b) reject + override:** el `passes[]` entry literal sugerido:
  ```jsonc
  {
    "by": "autor",
    "date": "2026-MM-DD",   // ISO al momento del override
    "verdict": "correcta",
    "concerns": [
      "[override] autor mantiene original tras revisión de disputed - <razón en una línea>"
    ]
  }
  ```
  El sub-skill pide la razón en un AskUserQuestion follow-up para mantener audit trail no-vacío. Setea `validation.status = "validated"` directamente. Commit message: `validate(<cat>): <id> → validated (override autor, post-disputed)`.

- **Reporter final `scripts/run-validation-271.mjs` esqueleto sugerido (plan-time confirma o pivota):** itera las 7 categorías, por cada una emite tabla con `validated / disputed / pending` counts + lista de IDs disputed (si los hay). Al final 4 sub-gates:
  1. **VAL-04** — los 271 con `passes[].length ≥ 2` Y `passes[].by` con al menos 2 distintos.
  2. **VAL-06** — los 271 con `validation.status === "validated"`.
  3. **VAL-08** — cero IDs con `validation.status === "disputed"` (o si los hay, lista los IDs problemáticos).
  4. **Smoke test** — `node --test tests/*.test.js` exit 0 con `VAL_07_STRICT=1`.

  Exit 0 = los 4 PASS, milestone gate.

- **Reconsider trigger para D-VAL-21 (Gemini risk monitor):** el sub-skill al terminar Preposiciones imprime stat extra al banner de resumen: `Dispute-rate Preposiciones: X/49 (Y%)`. Si `Y < 5%` Y los 3 motivadores históricos (-031, -032, -047) pasaron como `validated` sin surface concerns, banner alerta en amarillo: `⚠ Dispute-rate inusualmente bajo en la categoría con más bugs históricos. ¿Pausar y reconsiderar añadir Gemini antes de las 6 categorías restantes?` con AskUserQuestion (continuar / pausar para reconsiderar).

</specifics>

<deferred>
## Deferred Ideas

### Diferido a Phase 10 plan-time (out of scope de este CONTEXT, in scope del PLAN.md)

- Activación exacta del feature flag `VAL_07_STRICT=1` al cierre (manual via README docs vs auto via `.env` write vs setting persistente en `.planning/config.json`).
- Paralelo vs secuencial Opus+Sonnet POR EJERCICIO — afecta al skill `gsd-validate-exercise` Phase 9, no al batch. Plan-time decide si re-abrir esa decisión o conservar el secuencial validado por el piloto.
- Nombre exacto del sub-skill (D-VAL-19) y el reporter (`scripts/run-validation-271.mjs` o variante).
- Mecanismo de detección de "guardado" tras el rewrite del autor (re-read del archivo + diff vs file-watcher vs prompt explícito al autor "ya guardé").
- Manejo de rate-limits del API de Anthropic durante el batch (exponential backoff vs pausa + reintento manual del autor vs failover a otro modelo).
- Granularidad del banner disputed cuando una categoría tiene >10 disputed (secuencial 1-por-1 vs agrupado con expand).
- Si el reporter final escribe a algún archivo de audit (e.g. `.planning/phases/10-.../10-VALIDATION-REPORT.md`) además de stdout, para preservar evidencia escrita del cierre.
- Si el sub-skill batch debería verificar `scripts/assert-avere-prefix-unchanged.mjs` exit 0 tras mutar la categoría avere (auto-gate antes de pasar a essere).
- Política de commits para los caminos (a) (b) (c) — actualmente templates en D-VAL-25 dejan abierto si se hacen 1 commit por evento (mutación-fix + re-validation = 1 commit cada uno = 3 commits) o 1 commit consolidado por resolución. Recomendación intuitiva: 1 commit por mutación de archivo (granularidad existente Phase 9), peo plan-time decide.

### Diferido a Phase 10 EJECUCIÓN (out of scope de planning, in scope del run real)

- Cuántos disputed reales emergerán de los 269 — proyección con base en el piloto: ~5-15% pero la categoría Preposiciones probablemente más cercana al 15-20% (bias histórico).
- Si los 3 motivadores pendientes (`preposiciones-031`, `-032`, `-047`) saldrán disputed automáticamente. Hipótesis: sí, porque Opus+Sonnet detectaron el C5-leak fixture en el piloto y los 4 motivadores son C1-natural / C2-una_opcion / C4-explanation issues — todos cubiertos por los 5 criterios.
- Tiempo total real del milestone — proyección con base en el piloto: ~3-5 min por ejercicio × 269 = ~14-22h de subagent time, posiblemente distribuido en varias sesiones del autor con resume entre días.

### Diferido a milestones futuros (post-v1.1)

- VAL-X1: Validación periódica re-aplicada al añadir categorías nuevas (Pretérito imperfetto, Futuro, etc.) — el sub-skill `gsd-validate-batch <category>` por diseño es reutilizable: nuevas categorías invocadas como cualquier otra.
- VAL-X2: Integración del validation gate en `/gsd-quick` flow editorial — futura.
- Si el feedback empírico de v1.1 sugiere añadir Gemini al quórum default, hacerlo en v1.2 ajustando D-VAL-02 y el skill base.
- Generación automatizada de "suggested fix" más sofisticada (e.g. invocando otra AI para proponer el fix textual concreto en vez de derivar del tag) — out of scope.

</deferred>

---

*Phase: 10-Ejecución validación 271 ejercicios + escalada disputed*
*Context gathered: 2026-05-26*
