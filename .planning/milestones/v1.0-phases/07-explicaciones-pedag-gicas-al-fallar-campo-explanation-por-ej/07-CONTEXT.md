# Phase 7: Explicaciones pedagógicas al fallar — campo explanation por ejercicio + render en Errores cometidos - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 7 entrega **explicaciones pedagógicas breves al fallar** un ejercicio. Surge de un pivote post-uso-real: el autor, al fallar ejercicios de Preposiciones, va a Gemini cada vez para entender por qué (e.g., por qué "sui" y no "nei"). La fase añade un campo `explanation` opcional al payload de cada ejercicio + render UI tanto inline durante feedback rojo como en la sección "Errores cometidos" del summary (Phase 6).

**Capacidades entregadas:**
- **Schema extendido:** `payload.explanation: string` opcional en los 3 tipos de ejercicio (multi-choice / word-buttons / match). Schema validator añade regla "if present, must be non-empty string" en los 3 `validateXxxPayload`.
- **Render inline en feedback rojo:** los 3 sub-templates de session screen (index.html ~líneas 259/296/375) muestran un nuevo `<p>` con la explicación cuando `sessionFeedback === 'incorrect' && ex.payload.explanation`. Lectura directa del exercise actual, sin snapshot necesario (vive solo durante el momento del feedback).
- **Render en summary:** la sección `<section class="summary-errors">` de Phase 6 se extiende con un `<p class="summary-error-explanation">` bajo cada `<li>` cuando el exercise tiene `explanation`. Lee del snapshot `summarySessionResults` ya existente (Phase 6 D-107) → cero race conditions.
- **Seed inicial: 50 explanations para Preposiciones.** La categoría más urgente según el uso real del autor (los 4 ejemplos de Gemini que motivaron Phase 7 son todos sobre preposiciones: su/in/da/per). Patrón D-85 (Claude propone desde conocimiento A1 + autor revisa frase por frase + commit por bloque).

**Reapertura explícita de decisión:** PROJECT.md `## Out of Scope` línea ~84 dice "Explicaciones pedagógicas / mostrar la regla al fallar o acertar — solo bien/mal por velocidad; la teoría está en los PDFs". Phase 7 reabre esto. La motivación: el uso real (271 ejercicios funcionando) demostró que la teoría en los PDFs es insuficiente — el autor no quiere mirarlos cada vez que falla, prefiere una explicación destilada inline. Tras Phase 7, esta entrada se mueve de Out of Scope a una sección "Validated" o se elimina (PROJECT.md evolution paso del workflow).

**Requisitos cubiertos:** EXPL-01 (campo explanation en schema), EXPL-02 (render inline + summary), EXPL-03 (50 explanations seed Preposiciones). IDs concretos los crea el plan-phase.

**Fuera del scope:**
- `optionHints[]` array alineado con options (por qué cada distractora es incorrecta) — deferred. Si emerge necesidad real, fase incremental.
- Explanations en aciertos — preserva la velocidad bien/mal del flow. Solo se muestra al fallar.
- Markdown / HTML en explanation — viola T-02-01 (x-text exclusivo, anti-XSS desde Phase 1). Plain text obligatorio.
- Explanations para las otras 6 categorías (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) — quedan opcionales tras Phase 7. Retro-rellenar incremental si lo echas en falta.
- Pantalla nueva o sección "explicaciones consultables" sin asociación a fallo — el repaso post-error es el caso de uso real.
- Audio / TTS / pronunciación — fuera de scope v1.
- Localización del idioma de la explanation — siempre en español (FOUND-04).
- Test que valida el contenido pedagógico de las explanations (acepto-rechazo manual del autor es el oracle).
- Cualquier cambio al motor de re-verificación (cascada D-54, sampler, exerciseStats, racha).

</domain>

<decisions>
## Implementation Decisions

### Shape del JSON

- **D-113:** **`payload.explanation: string` opcional, uniforme cross-3-types.** Multi-choice, word-buttons y match comparten el mismo campo opcional dentro del payload. Si el ejercicio tiene explanation, se renderiza; si no, graceful degradation (cero ruido visual). La uniformidad cross-types simplifica el render UI (un único `x-if="ex.payload.explanation"`) y el schema validator (una sola regla replicada en los 3 validateXxxPayload).

- **D-114:** **NO `optionHints[]` ni estructura más rica en v1.** Decisión deliberada para minimizar coste editorial. La distinción semántica que `optionHints` aportaría ("Sui = Su + I (sobre + plural masculino)") puede incluirse dentro del texto plano de explanation cuando el autor lo considere relevante. Si en uso emerge que la falta de optionHints duele, fase incremental futura — el shape `explanation: string` es retro-compatible con extender a `explanation: {text, optionHints[]}` (sin migración necesaria mientras el render lee `typeof === 'string'` vs `typeof === 'object'`).

- **D-115:** **No estructura rica `{rule, examples, whyNotOthers}`.** Probablemente over-engineering para v1. La estructura libre del texto plano permite al autor encajar regla + ejemplo paralelo en 1-2 frases sin esquema rígido.

### Schema validator

- **D-116:** **Extensión mínima: añadir 1 regla en cada `validateXxxPayload` (Phase 3 dispatch table).** Pseudo-código:
  ```js
  // En src/data/schema-validator.js, dentro de cada validate{Type}Payload:
  if (payload.explanation !== undefined) {
    if (typeof payload.explanation !== 'string' || !payload.explanation.trim()) {
      push(file, ex.id, `"explanation" debe ser string no vacío si está presente`);
    }
  }
  ```
  - **Sin enforcement de longitud** — el límite 250-400 chars es recomendación editorial (D-121), no constraint del schema. Si quieres validación dura, fase incremental.
  - **Tests del validator** — añadir 3 tests pequeños en `tests/data-storage.test.js` o nuevo `tests/schema-explanation.test.js`: (a) explanation válida string aceptada, (b) explanation no-string rechazada, (c) explanation ausente aceptada (back-compat).
  - **Cero migración schemaVersion** — `payload.explanation` es contenido, no state localStorage. El state `italianCourse.v1` no cambia; CURRENT_SCHEMA_VERSION sigue siendo 4 (Phase 6).

### Render UI

- **D-117:** **Render dual: inline en feedback rojo + en sección "Errores cometidos" del summary.** El autor pidió explícitamente ambos durante discuss-phase para máximo refuerzo pedagógico (ves la explicación 2 veces: en el momento del fallo y al repasar agregado).

- **D-118:** **Render inline durante sesión.** En index.html, en cada uno de los 3 sub-templates (multi-choice ~línea 259-281, word-buttons ~línea 296-342, match ~línea 375-412), añadir:
  ```html
  <p x-show="sessionFeedback === 'incorrect' && sessionCurrentExercise.payload.explanation"
     class="session-explanation"
     x-text="sessionCurrentExercise.payload.explanation"></p>
  ```
  Posición: bajo el `<p>Respuesta correcta: ...</p>` existente, antes del botón "Siguiente". Visible solo cuando hay feedback rojo Y el ejercicio tiene explanation. `x-text` exclusivo (T-02-01 invariante, anti-XSS).

- **D-119:** **Render en summary.** En `<section class="summary-errors">`, dentro del `<li>` por error, tras la línea "Respuesta correcta", añadir:
  ```html
  <p x-show="content.exerciseById[result.exerciseId]?.payload?.explanation"
     class="summary-error-explanation"
     x-text="content.exerciseById[result.exerciseId].payload.explanation"></p>
  ```
  - Lee de `content.exerciseById[result.exerciseId]` (en memoria desde boot, cero penalización).
  - Optional chaining `?.payload?.explanation` por defensa contra `exerciseId` stale (CR-01 fix de Phase 6 ya garantiza el filter, pero defensivo).
  - Coherente con el snapshot `summarySessionResults` ya consolidado en Phase 6.

- **D-120:** **CSS: 2 clases separadas (`.session-explanation`, `.summary-error-explanation`) por contexto visual distinto.**
  - **`.session-explanation`** (durante feedback rojo): muted gris (Pico `--pico-muted-color`), `font-size` ligeramente más pequeño que el body (~`0.9em`), `font-style: italic`, padding/margin sobre múltiplos de 4px (`margin-top: 0.5rem` = 8px, alineado con UI-SPEC §Spacing Phase 6). NO `.incorrecta` rojo — la explicación es tono didáctico, no error.
  - **`.summary-error-explanation`** (en summary): mismas reglas visuales para coherencia cross-context (el autor ve el mismo estilo en sesión y en summary). Padding/margin idem.
  - **No nuevo token de color, no nueva fuente, no nuevo size discreto** — reutilizar Pico defaults + muted color. UI-SPEC §Color invariant (60/30/10) preservado.

- **D-121:** **Graceful degradation:** Si un ejercicio NO tiene `explanation`, el `<p>` simplemente no se renderiza (x-show=false). Cero mensaje "sin explicación disponible", cero placeholder. Los 221 ejercicios sin explanation tras Phase 7 simplemente no muestran el bloque — el autor sigue viendo el flow bien/mal sin ruido.

### Estrategia de contenido

- **D-122:** **Phase 7 entrega 50 explanations para Preposiciones como seed.** La categoría más urgente según el uso real del autor (los 4 ejemplos de Gemini que motivaron Phase 7 son todos preposiciones: sulle, da lui, dalle, sui). Cubrir las 50 entries de `content/exercises/preposiciones.json` con 1 explanation cada una.

- **D-123:** **Patrón D-85 (Claude propone + autor revisa).** Mismo workflow validado en Phase 5 con Essere (39 ejercicios) y Phase 4 con SEED-01 (5 categorías nuevas). Claude redacta las 50 explanations en uno o varios batches; el autor revisa frase por frase antes de commit. Si una explanation queda mal, el autor la edita en sitio o pide a Claude un re-redrafted.

- **D-124:** **Otros 221 ejercicios quedan sin explanation tras Phase 7** — opcionales para retro-rellenar en fases incrementales (Phase 7.1 Avere, Phase 7.2 Verbos de movimiento, etc.) si emerge necesidad real. NO obligar a Claude a rellenar todas las 271 en Phase 7 — coste editorial alto sin ROI demostrado fuera de Preposiciones.

- **D-125:** **Plan structure: probablemente 2 plans secuenciales.**
  - **Plan 07-01 — Infra + UI render:** schema validator extension + 3 sub-templates session + extensión summary-errors + CSS (.session-explanation + .summary-error-explanation) + tests dominio + 1-2 explanations seed mínimas (e.g., 2 ejercicios de Preposiciones) para que el UAT humano sea visible. Vertical slice: tras este plan el autor puede ver una explanation real en una sesión.
  - **Plan 07-02 — Seed Preposiciones (48 restantes):** 48 explanations adicionales para completar `content/exercises/preposiciones.json`. Patrón D-85: Claude propone en 2-3 batches, autor revisa, commit secuencial. Vertical slice: tras este plan, fallar cualquier ejercicio de Preposiciones muestra una explicación destilada.
  - Planner confirma o propone 1 plan combinado si el tamaño total queda manejable.

### Tono / formato / longitud

- **D-126:** **Plain text exclusivo. NO markdown, NO HTML, NO formato.** T-02-01 invariante de Phase 1: `x-text` exclusivo para renderizar texto del JSON; nunca `x-html` (anti-XSS). Por tanto las negritas, listas, headers que ves en respuestas de Gemini NO se renderizarán — la explanation se escribe como párrafo de texto plano. Si el autor escribe `**Su**` en el JSON, el browser mostrará literalmente `**Su**` con asteriscos.

- **D-127:** **Tono 3ª persona impersonal.** Patrón mental: 1 frase de regla + 1 frase de ejemplo paralelo. Ejemplos del autor (destilados de respuestas de Gemini):
  - `"Su significa 'sobre' o 'encima de' con contacto físico. Los libros se colocan encima de la superficie de la mesa. Por eso Su + Le (las) = Sulle."`
  - `"En italiano, cuando una acción la realiza un agente en una frase pasiva, la preposición obligatoria es Da. Significa 'por' en el sentido de autoría. Il libro è scritto da lui = El libro está escrito por él."`
  - `"Cuando te desplazas saliendo del lugar de alguien (su casa, por ejemplo), usas la preposición Da combinada con el artículo. Da + Le = Dalle. Vengo dalle mie zie."`
  Coherente con el tono de los campos `notes` existentes en avere.json y essere.json (que ya el autor curó).

- **D-128:** **Longitud sugerida 250-400 chars (~50-80 palabras).** Sin enforce en schema validator (D-116). El autor puede pasarse o quedarse corto — el límite es editorial, no técnico. Si emerge que algunas explanations son demasiado largas, refinar manualmente — no añadir constraint dura al schema.

### Compatibilidad con decisiones previas

- **D-129:** **CONT-06 NFC + apóstrofes ASCII** aplica idéntico al texto de explanation. Si una explanation menciona `un'amica` o `c'è`, usar `'` U+0027 (no smart quote `'`).
- **D-130:** **D-09 monotonicity** preservada — Phase 7 no toca exerciseStats.
- **D-131:** **D-54 cascada inmediata** preservada — Phase 7 no toca el motor de fallo.
- **D-132:** **Layer purity D-02** preservada — `payload.explanation` vive en `content/exercises/*.json`, NO en el state. Cero side effect en localStorage.
- **D-133:** **D-88 APPEND-ONLY avere.json** preservado — Phase 7 toca solo `content/exercises/preposiciones.json` para el seed, NO avere.json. (Si en una fase incremental futura se rellenan explanations en avere, ese cambio sí editaría avere.json — pero NO modifica los ejercicios originales, solo añade el campo opcional `explanation` a cada uno. El script `assert-avere-prefix-unchanged.mjs` compara el snapshot estructural — habrá que decidir si la adición de `explanation` rompe el assert o si se relaja para permitir extensiones aditivas. Out of scope Phase 7, decidir si y cuando se aborde Avere.)

### Reapertura Out of Scope (PROJECT.md)

- **D-134:** **Reabrir explícitamente la entrada Out of Scope.** PROJECT.md línea ~84: "Explicaciones pedagógicas / mostrar la regla al fallar o acertar — solo bien/mal por velocidad; la teoría está en los PDFs". Tras Phase 7 completado:
  1. Mover esta entrada de `## Out of Scope` a `### Validated`, con nota "Validado en Phase 7: explanation campo opcional + render inline + summary. Decisión inicial revisada post-uso-real (271 ejercicios mostraron que la teoría en los PDFs no es accesible mid-sesión)."
  2. Actualizar `## Active` si emerge un requisito nuevo (e.g., "EXPL-01: campo explanation opcional en payload de cada ejercicio").
  3. Añadir entrada a `## Key Decisions` documentando el pivote (e.g., "Pivote post-uso-real: explanaciones pedagógicas reabiertas porque el autor las pedía a Gemini cada fallo de Preposiciones — fricción real superó la decisión inicial 'velocidad over teoría'").
  Esta evolución es parte de `update_project_md` del workflow execute-phase (paso post-verifier), no de discuss-phase.

### Claude's Discretion

- **Texto literal de cada explanation:** Claude propone, autor revisa. Los ejemplos del autor (sulle / da lui / dalle / sui) sirven como template tonal. Las 50 explanations deben cubrir los 50 ejercicios sin sonar repetitivas — buscar variedad en construcción de frase mientras se mantiene el patrón "regla + ejemplo paralelo".
- **¿Cuántos batches de revisión?** Plan 07-02 decide — probablemente 2-3 batches de ~15-20 explanations cada uno para que el autor pueda revisar sin saturarse.
- **Tests:** validar la integridad estructural (el schema validator rechaza explanations no-string, acepta explanations string) + smoke test que carga preposiciones.json post-seed y verifica que 50/50 entries tienen `explanation`.
- **CSS exacto:** spacing + font-size + italic + color muted son recomendaciones; el planner refina dentro del UI-SPEC §Spacing/Color/Typography invariants ya establecidos. No introducir tokens nuevos.
- **Posición exacta del bloque dentro de cada sub-template:** después de "Respuesta correcta" / antes del botón "Siguiente" es lo natural en multi-choice y word-buttons. En match, después del `<div class="match-grid">` cuando matchHadFailure es true. Planner refina con UI-SPEC §Visual hierarchy.
- **¿Plan 07-01 incluye 2 explanations seed o solo infra sin contenido?** Plan 07-01 debería incluir 1-2 explanations en ejercicios reales para que el UAT humano sea visible y verificable. Sin seeds mínimas, UAT-humano queda en "vi que no aparece nada en summary" lo cual no demuestra que el render funcione.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope (reabriendo "Explicaciones pedagógicas"), Key Decisions Phase 1-6
- `.planning/REQUIREMENTS.md` — actualizar con EXPL-01..N en plan-phase
- `.planning/ROADMAP.md` §"Phase 7" — Goal por planear (TBD actualmente, el planner lo solidifica)
- `.planning/STATE.md` — schemaVersion: 4 (Phase 6), 271 ejercicios, 7 categorías, 166/166 tests

### Phase 1 (vigente — schema validator base + invariantes anti-XSS)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — **T-02-01** (x-text exclusivo), **CONT-06** (NFC + apóstrofes ASCII), **D-02** (layer purity)

### Phase 3 (vigente — dispatch table PAYLOAD_VALIDATORS + sub-templates 3 tipos)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` — **PAYLOAD_VALIDATORS dispatch table** (Phase 3), sub-templates word-buttons + match

### Phase 4 (vigente — patrón D-85 Claude propone + autor revisa)
- `.planning/phases/04-backup-robusto-contenido-completo/04-CONTEXT.md` — **D-85** (Claude propone JSON desde conocimiento + autor revisa + commit), **DESIGN RULE** (match solo si no derivable por raíz)

### Phase 5 (vigente — patrón seed de 1 categoría completa)
- `.planning/phases/05-essere-categoria-fundamental-que-faltaba/05-CONTEXT.md` — patrón "1 plan = 1 categoría completa" + 39 ejercicios seed Essere

### Phase 6 (vigente — antecedente directo: sección summary-errors)
- `.planning/phases/06-polish-ux-post-sesion-reiniciar-y-review-errores/06-CONTEXT.md` — **D-105** (sessionResults shape), **D-108** (lista plana cronológica), **D-109** (layout multi-línea con .incorrecta/.user-answer), **summarySessionResults** snapshot (CR-02 fix post-Phase 6)
- `.planning/phases/06-polish-ux-post-sesion-reiniciar-y-review-errores/06-UI-SPEC.md` — UI-SPEC §Spacing (multiples 4px), §Color (60/30/10 sin tokens nuevos), §Typography (2 sizes, 2 weights)
- `.planning/phases/06-polish-ux-post-sesion-reiniciar-y-review-errores/06-02-SUMMARY.md` — referencia render section summary-errors

### Code references (leer ANTES de planificar)
- `src/data/schema-validator.js` líneas 28-35 — **PAYLOAD_VALIDATORS dispatch table** (extender los 3 validators con la regla `explanation if present must be string`)
- `src/data/schema-validator.js` líneas 50-120 — patrón general de validación (push errors, no throw)
- `content/exercises/preposiciones.json` — los 50 ejercicios a rellenar con explanation seed
- `content/exercises/avere.json` — referencia visual del shape actual del payload (sin explanation)
- `index.html` líneas 259-281 — sub-template multi-choice (donde añadir render inline)
- `index.html` líneas 296-342 — sub-template word-buttons (donde añadir render inline)
- `index.html` líneas 375-412 — sub-template match (donde añadir render inline tras matchHadFailure)
- `index.html` líneas 529-575 (post-Phase 6) — sección `<section class="summary-errors">` (donde añadir render bajo cada `<li>`)
- `styles.css` — sección `.summary-errors` Phase 6 (referencia de patrón CSS para `.session-explanation` y `.summary-error-explanation`)
- `src/screens/app.js` — sin cambios estructurales. `sessionFeedback === 'incorrect'` ya existe + `summarySessionResults` snapshot ya existe (Phase 6).

### Tests references
- `tests/data-storage.test.js` — patrón de tests de schema validator
- `tests/exercise-types.test.js` — patrón de tests de grade() handlers (no afectado por explanation)
- Schema validator tests probablemente en `tests/data-storage.test.js` (o nuevo `tests/schema-explanation.test.js` si el planner prefiere)

### External docs
- No external docs requeridos. Phase 7 es UX + contenido + extensión opcional del schema validator. Cero dependencias nuevas, cero APIs nuevas, cero patrones de framework no usados.

### Bibliografía para Claude al redactar las 50 explanations (Plan 07-02)
- Los 4 ejemplos del autor destilados de Gemini (en el mensaje original que motivó Phase 7) sirven como template tonal:
  - Caso sulle: contacto físico sobre superficie
  - Caso "da lui" en pasiva: agente vs destinatario
  - Caso "dalle mie zie": persona = lugar (movimiento desde alguien)
  - Caso "sui muri": superficie vertical = igual que superficie horizontal
- Conjunto de reglas de preposiciones italianas A1: di / a / da / in / con / su / per / tra / fra + sus combinaciones con artículo definido (del, alla, dello, nello, sulla, etc.).
- Material-profesora/Preposizioni.pdf (el PDF original que generó los 50 ejercicios) — referencia si Claude necesita validar alguna regla concreta.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`PAYLOAD_VALIDATORS` dispatch table (Phase 3)** — 3 validators ya extraídos, extensión limpia: añadir 1 bloque if-typeof-string en cada uno.
- **`sessionFeedback === 'incorrect'`** ya existe en los 3 sub-templates (líneas 275, 326, 408) — el render inline cuelga directamente de este boolean.
- **`summarySessionResults` snapshot (Phase 6 CR-02 fix)** — el render en summary lee del snapshot, no de la sesión live. Cero race conditions garantizada arquitectónicamente.
- **`content.exerciseById[result.exerciseId]`** ya está en memoria desde el boot — el render en summary derefencia directamente con optional chaining defensivo (CR-01 Phase 6 ya estableció el patrón).
- **Pico CSS muted color** (`--pico-muted-color`) — token existente para texto secundario; reutilizar para `.session-explanation` y `.summary-error-explanation` sin token nuevo.
- **Clase Pico `.incorrecta`** existente — NO se reutiliza para explanation (la explicación NO es un mensaje de error, es didáctica; el tono visual debe diferenciarse).
- **Patrón D-85 batch revisión** validado 2x (Phase 4 SEED-01 + Phase 5 Essere) — la cadencia de Claude propone → autor revisa → commit por bloque escala bien.

### Established Patterns

- **T-02-01 (Phase 1)** — `x-text` exclusivamente. Phase 7 NO introduce `x-html` ni dependencia markdown.
- **CONT-06 (Phase 1)** — NFC normalize on boot + apóstrofes ASCII U+0027. Aplica al texto de explanation idéntico.
- **D-02 (Phase 1)** — layer purity. `payload.explanation` es contenido (en `content/`), NO state localStorage. Cero migración schemaVersion.
- **PAYLOAD_VALIDATORS dispatch table (Phase 3)** — 1 bloque if por validator, sin refactor.
- **D-85 (Phase 4)** — Claude propone JSON sin PDF, autor revisa, commit. **Aplica idéntico a Phase 7** con la diferencia de que el PDF Preposizioni SÍ existe (material-profesora/), pero el contenido pedagógico de las explanations es generic A1 + casos concretos derivados de los 50 ejercicios.
- **DESIGN RULE Phase 4** — explanation NO cambia la regla. Si un ejercicio era multi-choice porque su par no requiere regla no-derivable, sigue siendo multi-choice; añadirle explanation no lo convierte en match.
- **Phase 6 summary screen patterns** — sección summary-errors ya tiene los hooks (filter !correct, dispatch por type, snapshot summarySessionResults). Phase 7 SOLO añade un `<p>` dentro del `<li>` existente.

### Integration Points

- **Boot path**: schema validator se ejerce más al cargar (verifica explanation si presente). Banner CONT-05 muestra error si explanation es no-string. Cero impacto si todos los ejercicios cumplen el contrato.
- **Session screen render**: 3 sub-templates añaden 1 línea `<p x-show="...">` cada uno. Cero impacto en el flow bien/mal-velocidad: el `<p>` solo aparece tras feedback rojo, NO durante respuesta normal.
- **Summary screen render**: sección summary-errors gana 1 `<p>` adicional por `<li>` cuando el ejercicio tiene explanation. Si el ejercicio NO tiene explanation, el `<p>` no se renderiza (x-show=false) — coherente con D-121 graceful degradation.
- **Cascada D-54**: sin afectación. Phase 7 no toca el motor de fallo.
- **Backup export/import (Phase 4)**: sin cambios. El campo explanation vive en `content/exercises/*.json`, no en el state — los backups NO lo incluyen, el contenido es estático por archivo.
- **applyNewExerciseRegression (DOMAIN-06)**: NO se dispara por añadir solo el campo `explanation` a un ejercicio existente. La regla DOMAIN-06 detecta cuando un ejercicio NUEVO se añade al JSON (id no visto previamente). Añadir `explanation` a un id existente NO cuenta como ejercicio nuevo → la categoría no regresa a `no-hecha`.
  - **Caveat:** verificar que el smoke test `applyNewExerciseRegression` no se confunde por hashes/snapshots si los compara — debería leer solo `id`, no shape completo.

### Estructura final esperada (post-Phase 7)

```
content/
├── categories.json                  # SIN CAMBIOS
└── exercises/
    ├── avere.json                   # SIN CAMBIOS (D-88 blindado + 23 ejercicios sin explanation)
    ├── essere.json                  # SIN CAMBIOS (39 ejercicios sin explanation)
    ├── genero-numero.json           # SIN CAMBIOS (40 ejercicios sin explanation)
    ├── verbos-movimiento.json       # SIN CAMBIOS (37 ejercicios sin explanation)
    ├── profesiones.json             # SIN CAMBIOS (51 ejercicios sin explanation)
    ├── sustantivos-irregulares.json # SIN CAMBIOS (31 ejercicios sin explanation)
    └── preposiciones.json           # EXTENDIDO: 50 ejercicios ahora con `explanation: string` en payload

src/
├── data/
│   └── schema-validator.js          # EXTENDIDO: 3 validate{Type}Payload añaden 1 regla if-explanation-then-string
├── screens/
│   └── app.js                       # SIN CAMBIOS (sessionFeedback / summarySessionResults / content.exerciseById ya existen)
└── ...                              # SIN CAMBIOS

index.html                           # EXTENDIDO: 3 sub-templates session screen + 1 extensión summary-errors

styles.css                           # EXTENDIDO: 2 nuevas reglas .session-explanation + .summary-error-explanation

tests/
├── data-storage.test.js             # EXTENDIDO: 3 tests schema explanation (válida / inválida / ausente)
└── ...                              # SIN CAMBIOS (los tests existentes no se afectan)
```

Toda la complejidad nueva queda contenida en `src/data/schema-validator.js` + `index.html` + `styles.css` + `content/exercises/preposiciones.json` + tests. Cero churn fuera de esos archivos.

</code_context>

<specifics>
## Specific Ideas

- **El dolor es Preposiciones**: el autor capturó 4 ejemplos concretos de respuestas de Gemini sobre preposiciones (sulle, da lui, dalle, sui). Las 50 entries de `preposiciones.json` son el target principal de Phase 7. Cubrir otras categorías (Avere, Essere, etc.) puede esperar a fases incrementales si emerge dolor adicional.
- **Las explanations son repaso post-error**: no es un manual de italiano accesible siempre. El render condicional a `sessionFeedback === 'incorrect'` (inline) + `result.correct === false` (summary) refuerza esta semántica. NO crear una pantalla "Glosario" o "Reglas consultables" — out of scope.
- **El tono didáctico es 3ª impersonal + 1 frase regla + 1 frase ejemplo paralelo** — coherente con los 4 ejemplos destilados del autor. NO 2ª persona conversacional ("recuerda que tú..."), NO listas con bullets (T-02-01 no permite markdown).
- **Las explanations son patrón D-85 (Claude propone + autor revisa)** — mismo workflow validado en Phases 4 y 5. NO outsource a otra herramienta (Gemini, etc.); Claude tiene contexto del proyecto y del estilo de los notes existentes.
- **Plan 07-01 debe incluir 1-2 seeds mínimas** (e.g., los ejercicios sulle + da-lui de Preposiciones) para que el UAT humano sea visible. Sin seeds, el UAT del plan 07-01 sería "comprobé que no aparece nada porque ningún ejercicio tiene explanation" → no demuestra que el render funcione.
- **Cero migración schemaVersion** — explanation es contenido, no state. CURRENT_SCHEMA_VERSION sigue siendo 4. Los backups pre-Phase 7 importados post-Phase 7 funcionan idéntico — el state no cambia. Los backups exportados post-Phase 7 también funcionan idéntico — el state sigue siendo v4.
- **El smoke test multi-cat paramétrico Phase 5** (que itera todos los archivos de `content/exercises/`) NO se afecta por añadir `explanation`. Si el planner lo extiende, sería opcional: añadir un test paramétrico que cuente cuántos ejercicios tienen explanation por categoría (para tracking de progreso editorial, no para validación).
- **Reapertura de Out of Scope debe ser explícita en CONTEXT.md, no implícita** — esto es importante para la honestidad documental. El pivote post-uso-real es legítimo, pero deja un trail para futuras decisiones (e.g., si v3 reabre otras decisiones Out of Scope, el patrón está establecido).

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **`optionHints[]` array alineado con options** (por qué cada distractora es incorrecta) — descartado en v1 por coste editorial (3x el trabajo). Si emerge necesidad real durante uso, fase incremental futura sin migración (el shape `payload.explanation: string` es retro-compatible con extender).
- **Estructura rica `explanation: {rule, examples, whyNotOthers}`** — descartado por over-engineering. Mantener el shape `string` permite evolución incremental.
- **Explanations en aciertos** — descartado por preservar velocidad bien/mal del flow. Si emerge que "quiero refuerzo positivo cuando acierto", fase futura.
- **Pantalla nueva o sección "Reglas consultables"** sin asociación a fallo — out of scope. El uso es repaso post-error.
- **Markdown / HTML en explanation** — bloqueado arquitectónicamente por T-02-01 (anti-XSS, x-text exclusivo). Reabrir solo si se añade un parser markdown safe sandboxed (compleja, fuera de scope v1).
- **Click-to-expand "¿Por qué?"** durante feedback rojo — descartado a favor de render directo (D-117/D-118). Reconsiderar si UAT real muestra que la explanation siempre-visible interrumpe demasiado el flow.
- **Explanations para las otras 6 categorías** (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) — deferred a fases incrementales post-Phase 7 (Phase 7.1 Avere, 7.2 Verbos-movimiento, etc.) si emerge necesidad real. Phase 7 ancla en Preposiciones porque es el dolor demostrado.
- **Schema validator enforcement de longitud máxima** (e.g., 400 chars hard limit) — descartado por flexibilidad editorial. El límite 250-400 chars es recomendación, no constraint.
- **Localización del idioma de la explanation** — siempre en español (FOUND-04). Si en v2/v3 se internacionaliza la app, añadir `explanation: {es: '...', en: '...'}` requeriría migración del shape — out of scope v1.
- **Audio / TTS de la explanation** — fuera de scope v1 (Out of Scope global del proyecto: "Audio / pronunciación").
- **Test que valida el contenido pedagógico** de las explanations (e.g., LLM check que cada explanation menciona la regla correcta) — fuera de scope. El oracle es el autor durante el UAT humano y la revisión de cada batch.
- **Helper `assert-preposiciones-explanations-coverage.mjs`** que verifica que las 50 entries tienen explanation tras Phase 7 — opcional, decidir en plan-phase si añade valor o es overhead. Probablemente innecesario porque el test smoke paramétrico ya itera todos los archivos.
- **Renombrar `notes` campo existente a `internalNotes` para diferenciarlo de `explanation`** — los `notes` actuales son comentarios para el autor (e.g., "io sono, masc sing"), no para mostrar al usuario. Mantener nombres distintos: `notes` (autor-only), `explanation` (user-facing en feedback rojo + summary). NO cambiar el shape del JSON existente.
- **Aplicación de explanation cuando se reanuda un Test completo** — en sesiones Test completo reanudables (Phase 4), si fallaste un ejercicio pre-Phase 7 (sin explanation), al reanudar y completar el resumen muestra esos errores sin explanation (graceful degradation). Sin migración necesaria. Reconsiderar si UAT demuestra que da mal feel.
- **Highlight visual en home si una categoría tiene ≥50% de ejercicios sin explanation** (tracking de cobertura editorial) — out of scope v1, opcional v2 si emerge motivación para cubrir todas las categorías.

</deferred>

---

*Phase: 7-Explicaciones pedagógicas al fallar*
*Context gathered: 2026-05-25*
