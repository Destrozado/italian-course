# Phase 41: `fare-indicativo` — 8 slots (el bloque grande) - Context

**Gathered:** 2026-08-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Autorar `content/exercises/fare-indicativo.json` — la categoría **`fare-indicativo`** con los **8 slots** del indicativo completo de `fare` (4 tiempos simples: presente · imperfetto · passato remoto · futuro semplice; 4 compuestos: passato prossimo · trapassato prossimo · trapassato remoto · futuro anteriore) naciendo **directamente en slot+variantes** (nunca legacy payload), con **48 variantes** (8 × 6 personas) validadas **1-por-1** por quórum cross-vendor R1-R7, y registrar la categoría en `content/categories.json` para que cargue en boot y aparezca genéricamente en home/picker/Repaso/Examen. Cubre IND-01..IND-06.

Es la fase más pesada del milestone: ≈48 variantes de quórum, casi la mitad del volumen total de v2.0.

**Dentro de scope:**
- `content/exercises/fare-indicativo.json` — 8 slots MC, 48 variantes, `notes` con los gates declarados, `validation` por variante.
- `content/categories.json` — **1 entrada nueva** (append): `{id:"fare-indicativo", name:"…", order:15, origen:"ia-quorum"}` (D-41-13).
- Tests: extender el array `CATEGORIES_WITH_EXPLANATIONS` del smoke paramétrico + los sub-tests que el patrón v1.9 añade por categoría nueva.

**Fuera de scope:**
- **Cruces multi-categoría** (`fare-indicativo-300`+, ↔`avere` / ↔`modali` / ↔`presente-regolare`) → **Phase 44, INT-03**. Phase 41 deja el espacio de ids `-300`+ libre y NO los autora.
- **Sync de counts** — los 3 arrays hardcoded + `TOTAL_EXPECTED` + la fórmula del baseline-guard → **Phase 44, INT-02**. Quedan en **rojo esperado** hasta entonces (patrón v1.6/v1.7/Phase 36-38). Sincronizar el count de `fare-indicativo` al final de Phase 41 es *aceptable pero no obligatorio*; NO es fallo si queda rojo.
- Las otras 3 categorías de `fare` (Phases 42/43).
- **El motor v1.4 NO se toca.** `git diff src/screens/app.js src/domain/ src/data/` debe quedar vacío al cierre. Si algo exigiera cambiar `session.js`, `applyResultToSession` o la cascada, el diseño del contenido está mal (Out of Scope explícito del milestone).
- **Un eje de variante nuevo** (variar por tiempo dentro de un slot) — Out of Scope explícito; el primitivo slot+variantes cubre lo pedido.
- **Perífrasis y modismos de `fare`** (`fare colazione`, `fare la spesa`, `fa freddo`, `farcela`, causativo `fare + infinito`) — Out of Scope del milestone; ver SCOPE-GATE D-41-06.

</domain>

<decisions>
## Implementation Decisions

### Volumen y eje de variante

- **D-41-01:** **48 variantes = 8 slots × 6 personas.** El eje de variante declarado es **la persona**, y sale íntegramente de `pickVariantIndex` (`src/domain/session.js:232`) — cero código nuevo, SC#5 satisfecho por construcción. Aplica **también a los 4 compuestos**: se rechazó explícitamente reducirlos a ~3 marcos (≈36 variantes) o el reparto mixto (≈39). Razón del autor: el objetivo declarado de FARE-X1 es "un ejercicio por cada casilla del paradigma" con persona distinta cada pasada, y recortar los compuestos dejaría 24 casillas persona×tiempo sin examinar nunca. — **Reversibility:** costly — bajar de 48 a 36 después exige borrar variantes ya validadas por quórum (trabajo tirado) y, si el autor ya las ha fallado, sus ids viven en `exerciseStats`.
- **D-41-02:** **Cada variante lleva su propio marco temporal inequívoco**, no solo en los compuestos sino en los 8 slots. En los compuestos es obligatorio por SC#2 (ninguna variante admite dos lecturas del marco); en los simples es lo que hace única la respuesta cuando la distractora es una forma real de otra persona o de otro tiempo. Consecuencia práctica: las 6 variantes de cada slot compuesto son 6 marcos distintos **y** 6 personas distintas a la vez — persona y marco covarían, sin que eso introduzca un eje nuevo (el eje sigue siendo uno: el índice de variante).

### Trapassato remoto (IND-06, SC#3)

- **D-41-03:** Las **6** variantes van SIEMPRE dentro de subordinada temporal con la principal en passato remoto, y los **3 conectores rotan 2+2+2**: `dopo che` · `quando` · `appena`. Se rechazó fijar un solo conector (`dopo che`): el autor tiene que reconocer el marco también cuando aparezca con `appena`. Riesgo asumido y trasladado al quórum: `quando` es el más ambiguo de los tres (admite también imperfetto y passato remoto simple) → **las 2 variantes con `quando` exigen verificación explícita de unicidad de lectura del marco** (R7), no basta el pase genérico.
- **D-41-04:** Las **6 explanations dicen explícitamente que fuera de ese marco la forma no se usa** (exigencia literal de SC#3). No es una nota opcional: es parte del criterio de éxito verificable.

### Gloss ES y leak R1 (canon propio de esta categoría)

- **D-41-05:** **0-gloss declarado.** CERO gloss `(en español: …)` en las 48 variantes. Razón: el español mapea casi 1:1 en 7 de las 8 casillas (`hacía` / `hice` / `haré` / `he hecho` / `había hecho` / `habré hecho`), así que un gloss sobre el verbo **regala el tiempo** — leak R1 directo en una categoría cuyo ejercicio *es* elegir el tiempo. El marco temporal del prompt es el único desambiguador. **Esto NO contradice el canon R7 del proyecto** (`[[gloss_es_desambiguacion_canon]]`): el gloss es el desambiguador legítimo *donde desambigua*; aquí no desambigua, filtra. Se documenta en `notes` que **el 0-gloss es decisión razonada, no omisión** — mirror literal de cómo `riflessivi` documenta su 0-match. — **Reversibility:** reversible — añadir gloss a una variante concreta después es una edición local + re-pase de quórum de esa variante.
- **D-41-06 (SCOPE-GATE HARD):** El objeto de `fare` en los prompts es **siempre literal y transparente** (`i compiti`, `un errore`, `il lavoro`, `una torta`, `il letto`, `tutto`, `una foto`). **CERO perífrasis**: `fare colazione`, `fare la spesa`, `fa freddo`, `farcela`, causativo `fare + infinito`. Es el Out of Scope del milestone materializado como gate de autoría, declarado en `notes` — mirror del SCOPE-GATE de recíprocos de `riflessivi` — y **ninguna de las 48 variantes lo cruza**. Efecto colateral buscado: sin perífrasis no queda léxico que glosar, lo que refuerza D-41-05.
- **D-41-07:** **Pronombre sujeto explícito** (`io` / `tu` / `lui`-`lei` / `noi` / `voi` / `loro`) en las 48 variantes. Se prefirió al precedente de cue por nombres propios de D-38-01 (`Marco`/`Maria`/`i ragazzi`/`le ragazze`) y al naturalismo sin sujeto: la persona **es** el eje de variante declarado, así que tiene que ser inequívoca sin que el quórum tenga que pelearlo 48 veces. Coste aceptado: 48 frases algo más artificiales de lo que sería el italiano real (que omite el pronombre). Un pronombre sujeto **no es leak R1** — es el sujeto de la frase, no la regla ni la desinencia objetivo.

### MAGNETs y política de distractoras

- **D-41-08 (blacklist de formas atestiguadas):** Las formas arcaicas/poéticas/dialectales **`fo`** (toscano-arcaico por `faccio`), **`fé`** (poético por `fece`), **`fenno`** (poético por `fecero`), **`facea`** (poético por `faceva`) y **`fan`** (truncamiento poético de `fanno`) **no aparecen ni como key ni como distractora** en ninguna de las 48 variantes. La blacklist se declara en `notes` **con audit trail**: qué forma, por qué está atestiguada, por qué no se usa. **Además**, las explanations de `presente` y `passato remoto` las mencionan como formas que el autor puede *encontrar leyendo* pero no debe *producir*. Coste: cero variantes extra, cero quórum extra.
  **Por qué importa:** el riesgo real no es que el autor las escriba, es que la autoría genere `fo` o `fé` como distractora "obviamente mala" siendo formas válidas — un ejercicio injusto que el quórum marcaría como doble validez variante a variante. Es el precedente `fa'`/`fai` de Phase 43 (INT-04) aplicado un modo antes, donde el milestone no lo había declarado.
- **D-41-09 (distractoras de los 4 slots SIMPLES):** Patrón **fijo cross-slot**: 2 distractoras = **la raíz equivocada aplicada a la persona correcta** (`*faco`/`*facio` por `faccio`, `*facerò` por `farò`, `*faci` por `feci`, `*fecesti` por `facesti`) + 1 distractora = **la forma REAL de otra persona** (segura porque el pronombre explícito de D-41-07 la excluye). Los 2 primeros materializan el error real del hispanohablante y la trampa de la alternancia (exigencia literal de SC#1: distractoras que materializan el error real, no ruido); el tercero obliga a leer el sujeto en vez de "reconocer la forma que existe".
- **D-41-10 (distractoras de los 4 slots COMPUESTOS):** Patrón **fijo cross-slot**: 2 distractoras = **el mismo participio con el auxiliar en otro tiempo** (`avevo fatto` / `avrò fatto` / `ho fatto` según el slot) — materializa el error de marco, que es exactamente lo que IND-05 examina — + 1 distractora = **forma mal construida** (`*sono fatto` por sobre-generalización de `essere` desde reflexivos/verbos de movimiento, o `*ho fare`). Patrón fijo, precedente Phase 5 (`essere`: patrón de distractoras pedagógico fijo en los 35 multi-choice). Se rechazó ofrecer el **tiempo simple correspondiente** (`facevo` frente a `avevo fatto`) como distractora: sube el riesgo de doble validez si el marco no la excluye limpiamente.
- **D-41-11 (passato remoto ↔ passato prossimo — riesgo regional neutralizado por diseño):** **Marcos disjuntos, sin contraste.** El slot de passato remoto usa SOLO marcos narrativos remotos (`Nel 1990…`, `Quell'estate…`, `Molti anni fa…`); el de passato prossimo SOLO marcos recientes o conectados con el presente (`stamattina`, `ieri`, `questa settimana`). **Nunca se ofrecen mutuamente como distractora** — ni bidireccional ni unidireccional. Razón: en el italiano real del norte el passato prossimo cubre lo que el sur expresa con passato remoto, así que una distractora cruzada sería válida para media Italia. El contraste de uso pr↔pp es **registro/variación regional, no casilla del paradigma** → fuera de esta fase por diseño, no por olvido. Se documenta en `notes`. — **Reversibility:** reversible — añadir un slot de contraste después sería contenido nuevo, no rework.
- **D-41-12 (ronda EXTRA de quórum):** Los **12 variantes de `passato remoto` + `trapassato remoto`** llevan **pase DeepSeek OBLIGATORIO** además del quórum base. Razones: (a) la alternancia `fec-`/`fac-` es la casilla donde una distractora mal escogida puede resultar ser una forma válida, y (b) el marco del trapassato remoto es el único requisito **sintáctico** de la fase (D-41-03, con el agravante de `quando`). Precedente: ronda extra DeepSeek en el MAGNET `riflessivi-pp-concordanza` (Phase 38); DeepSeek es el estricto en acentos y concordancia (`[[feedback_cross_vendor_catches_bugs]]`). Se rechazó extender la ronda extra a los 8 slots: dispararía el coste de validación en la fase que ya es la más pesada, sin señal que lo justifique en presente/imperfetto/futuro.

### Tipos de ejercicio, ids y estructura

- **D-41-13 (MC-only, con 0-match Y 0-wb declarados):** Los **8 slots son `multiple-choice`**. Precedente directo: `possessivi` (7 slots MC-only, Phase 36). El **0-match** es herencia de la DESIGN RULE D-04 (la conjugación es derivable por raíz; un pareo persona↔forma sería "arrastrar sin pensar"). El **0-word-buttons** es decisión de esta fase: lo que se examina siempre es *elegir una forma o un tiempo*, no construir orden de palabras. **Ambos se documentan en `notes` como decisión razonada, no omisión.** Se rechazaron los dos candidatos a word-buttons:
  - *trapassato remoto en wb* (construir `Dopo che ebbi fatto i compiti, uscii`): la subordinada + principal da un banco de ≈8 tokens + distractoras, demasiado largo, y el MC ya obliga a leer el marco.
  - *colocación adverbial en wb* (`non ho mai fatto` frente a `*non mai ho fatto`): pedagógicamente atractivo y error real del hispanohablante, pero **es sintaxis del compuesto, no una casilla del paradigma** → se leería como scope creep en la verificación. Va a Deferred.
- **D-41-14 (ids semánticos, mapa fijado aquí):** Los 8 ids son `fare-indicativo-presente`, `fare-indicativo-imperfetto`, `fare-indicativo-passato-remoto`, `fare-indicativo-futuro-semplice`, `fare-indicativo-passato-prossimo`, `fare-indicativo-trapassato-prossimo`, `fare-indicativo-trapassato-remoto`, `fare-indicativo-futuro-anteriore`. Convención de `riflessivi`/`modali`/`presente-regolare`. **NO hay `checkpoint:decision` de aprobación del mapa** (se rompe con el patrón D-38-03 a propósito): los 8 slots ya están fijados por FARE-X1 y el roadmap — son las 8 casillas del paradigma, no hay grados de libertad que aprobar. El espacio `-300`+ queda **libre para los cruces de Phase 44** (convención D-40-07: el cruce vive en el fichero de `fare`, id con prefijo de `fare`, `categoryIds` con el slug de `fare` PRIMERO). — **Reversibility:** costly — renombrar un id después de que el autor haya fallado ese slot deja estado huérfano en `exerciseStats` (el mismo argumento que D-40-01).
- **D-41-15 (2 plans + validación top-level):** **Plan 41-01 = los 4 tiempos simples (24 variantes)**; **Plan 41-02 = los 4 compuestos (24 variantes)** + la entrada en `categories.json` + los tests. La autoría corre vía `execute-phase`/`gsd-executor`; el **quórum base canónico Opus+Sonnet se estampa en una pasada TOP-LEVEL posterior**, porque el executor no puede spawnear los Task subagents del skill `gsd-validate-exercise` (`[[executor_cannot_run_task_quorum]]`) y caería a Opus-inline + DeepSeek. La ronda extra DeepSeek de D-41-12 entra en esa misma pasada top-level. **Invariante VAL-03 inviolable: 1 ejercicio por contexto, NUNCA batched.**
- **D-41-16 (registro en `categories.json`):** Phase 41 **SÍ** añade la entrada — append `{id:"fare-indicativo", name:"…", order:15, origen:"ia-quorum"}`. No es opcional: **SC#5 exige que la categoría aparezca en home/picker/Repaso/Examen**, y eso solo ocurre con la entrada (`categoriesForDisplay` itera `content.categories`). D-40-06 ya lo previó ("el registro operativo de cada categoría lo hace su fase de contenido cuando su JSON existe; INT-01 lo cierra y verifica en Phase 44"). `origen` se estampa **ya** — el campo existe en schema desde v1.9 (PROV-01/02, Phase 39), a diferencia de Phase 38 que tuvo que diferirlo a Phase 39. `order` es documental; el orden del array define el display. Hoy hay **14 entradas** (order 1-14, `riflessivi` la última).
- **D-41-17 (canon editorial heredado, locked):** Explanations en **español acentuado RAE** (`[[explanations_must_be_accented]]` — un flag C4-accent del quórum sobre español sin tildes es bug REAL, se arreglan los acentos, NO se hace override), **apóstrofes ASCII U+0027**, **plain text sin markdown**, italianismos citados en ortografía italiana (`faccio`, `feci`, `avrò fatto`, `Quell'estate`), **sin leak de regla / persona / desinencia objetivo en el prompt (R1)**, sin smart-quotes. Cada variante con `validation.status: "validated"` (≥2 passes `correcta`, ≥2 `by` distintos, cero `incorrecta`).

### Claude's Discretion

- Redacción concreta de los 48 prompts y de las 8 explanations (dentro de D-41-05..D-41-11 y D-41-17), incluida la elección de qué objeto literal lleva cada frase y el reparto exacto de los 3 conectores entre las 6 variantes del trapassato remoto.
- Profundidad y estructura de cada explanation (citar el paradigma completo de las 6 formas frente a solo la casilla) — el precedente de `riflessivi` cita el paradigma; tono D-127 (3ª impersonal + regla + ejemplo paralelo italiano-español).
- `name` exacto de la entrada de `categories.json` (siguiendo el patrón descriptivo de las 14 existentes, p. ej. `"Fare — indicativo (faccio/feci/ho fatto)"`).
- Nombres y estructura de los tests nuevos, siempre que cubran: (a) la entrada de `fare-indicativo` en `CATEGORIES_WITH_EXPLANATIONS` con su expected count, (b) validación de schema del fichero, (c) coverage 48/48 de explanations + ASCII + no-markdown, (d) los sub-tests que el smoke paramétrico añade por categoría nueva.
- Sincronizar o no el count de `fare-indicativo` al final de Phase 41 (rojo esperado hasta Phase 44 en cualquier caso).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El diseño del milestone (el ref más importante de esta fase)
- `.planning/todos/pending/fare-paradigma-completo.md` — documento de diseño **FARE-X1** acordado con el autor el 2026-07-27: la tabla de las 4 categorías con sus slots, el encaje en `pickVariantIndex`, la categoría como unidad de reset, el volumen estimado, y **las 6 trampas de contenido detectadas** (§Trampas). Phase 41 consume de él los 8 slots del indicativo y las trampas 5 (trapassato remoto solo en subordinada) y — por analogía — 4 (magnets de doble validez).

### El molde a clonar (v1.9 — patrón exacto de una categoría nacida en slot+variantes)
- `content/exercises/riflessivi.json` — molde estructural más cercano: top-level `{notes, exercises[]}`, ids semánticos con prefijo de categoría (`riflessivi-presente`, `riflessivi-pp-concordanza`), 7 slots, `validation.passes[]` por slot con 4 `by` distintos, y **`notes` documentando el 0-match y el SCOPE-GATE HARD como decisión razonada** — el patrón literal a replicar para el 0-gloss / 0-match / 0-wb / blacklist / gate léxico de Phase 41.
- `content/exercises/possessivi.json` — el precedente **MC-only** (7 slots, cero match, cero word-buttons) que justifica D-41-13.
- `content/exercises/presente-regolare.json` / `content/exercises/modali.json` / `content/exercises/dimostrativi.json` — categorías gemelas de v1.7/v1.9; mismo molde, mismo canon, mismo shape de `validation`.
- `content/exercises/essere.json` — el precedente del **patrón fijo de distractoras pedagógicas** (Phase 5: 1 forma de `avere` + 2 formas mal conjugadas + 1 correcta en los 35 MC) que D-41-09/D-41-10 replican.
- `.planning/milestones/v1.9-phases/38-verbi-riflessivi/38-CONTEXT.md` — el precedente inmediato de una fase de autoría con magnet: D-38-01 (cue de sujeto; Phase 41 se desvía a pronombre explícito, D-41-07), D-38-03 (checkpoint del slot-map; Phase 41 lo omite, D-41-14), D-38-04 (cruces; en v2.0 van a Phase 44), canon editorial, y el **caveat del quórum dentro del executor**.
- `.planning/milestones/v1.9-phases/38-verbi-riflessivi/38-PATTERNS.md` — mapeo de ficheros nuevos a sus análogos más cercanos, para una fase de contenido.

### El contrato de slugs (Phase 40 — INVIOLABLE)
- `.planning/phases/40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-/40-CONTEXT.md` — **D-40-01/02** (el slug es exactamente `fare-indicativo`, contrato transversal del milestone: id en `categories.json`, nombre de fichero, elemento de `RESET_PREFIXES_V13`, prefijo de los ids de slot y de cruce), **D-40-06** (el registro operativo lo hace la fase de contenido → base de D-41-16), **D-40-07** (convención de ids de cruce, vinculante para Phase 44 → Phase 41 deja libre `-300`+).
- `src/data/storage.js` — `CURRENT_SCHEMA_VERSION = 13`, `RESET_PREFIXES_V13` (incluye `'fare-indicativo'`). Phase 41 **no lo toca**; solo confirma que el slug del fichero coincide byte a byte con el prefijo del reset.

### Requisitos y criterios de éxito
- `.planning/REQUIREMENTS.md` — **IND-01..IND-06** (definición literal de las 8 casillas, líneas 21-26); §Out of Scope (motor v1.4, eje de variante nuevo, perífrasis y modismos → base de D-41-06); §Mapping rationale (por qué IND-05 cubre 3 slots de una y por qué IND-06 se aísla); **INT-01..INT-04** (lo que es de Phase 44: entradas de `categories.json` verificadas, counts, cruces, y los magnets con ronda extra declarados del milestone).
- `.planning/ROADMAP.md` §Phase 41 — Goal + los **5 Success Criteria** que la verificación va a comprobar literalmente. Ojo a SC#3 (explanation que diga que fuera del marco no se usa) y SC#5 (la categoría aparece sin una línea de motor nueva).

### Infra y canon de validación por quórum
- `docs/VALIDACION-QUORUM.md` — el invariante no negociable: `deriveStatus(passes)` exige **≥2 pases `correcta` con `by` DISTINTOS y cero `incorrecta`** para `validated`; cualquier `incorrecta` → `disputed` **sticky**; **VAL-03: 1 ejercicio por contexto, NUNCA batched**. Tabla de modelos disponibles y política de auto-fallback.
- Skill `gsd-validate-exercise` — la vía canónica (Opus + Sonnet, C1-C5, un subagent fresh por ejercicio). **No disponible dentro del executor** → ver D-41-15.
- `scripts/validate-ai-pass.mjs` — refuerzo cross-vendor (Gemini/DeepSeek, auto-fallback en 429, `--write`); claves en `.env`. **Pase DeepSeek obligatorio** en passato remoto + trapassato remoto (D-41-12).
- `src/data/validation-state.js` → `deriveStatus(passes)` — la función que decide `validated`/`disputed`/`pending`.
- `scripts/run-validation-271.mjs` — el reporter/gate VAL-04 y VAL-06 (discrepancias de conteo). Las discrepancias **preexistentes** de `genero-numero` y `preposiciones` siguen fuera de scope (D-35-08 / D-40-12).

### Investigación (v1.9 — aplicable por analogía; v2.0 NO tiene fase de research)
- `.planning/research/PITFALLS.md` — Pitfall 8 (leak R1), Pitfall 9 (gloss ES: mantener donde desambigua), Pitfall 10 (acentos = bug real, no falso positivo), y la nota de no saltarse DeepSeek en los slots delicados.
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (alta de categoría = clon del patrón v1.7), Pattern 3 (append de `order`; el `order` es documental, el array define el display), Pattern 5 (cruces multi-cat, cascada D-54 en 2 call-sites), §Count Sync (los touch-points que Phase 44 tendrá que sincronizar).

> **Nota de frescura:** `.planning/research/*` es de **2026-07-01 (v1.9)**. v2.0 no tiene fase de research — el autor la saltó a propósito porque el diseño FARE-X1 ya estaba cerrado. Valen como referencia de patrón, no como investigación de v2.0.

### Regla de proyecto
- `CLAUDE.md` — stack (web estática, ES modules, contenido en JSON editado a mano, interfaz en español).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`content/exercises/riflessivi.json`**: molde estructural completo. Copiar la forma de `notes` (que documenta gates y decisiones-de-omisión con audit trail), el shape de slot MC (`{id, type, categoryIds, explanation, variants[{prompt, options[4], correctIndex}], validation{status, passes[]}}`) y el shape de `validation.passes[]` (`{by, date, verdict, concerns[]}`).
- **`content/exercises/possessivi.json`**: la prueba de que una categoría MC-only de 7 slots es un patrón shipeado y verificado — respaldo directo de D-41-13.
- **`content/exercises/essere.json`**: el patrón fijo de distractoras pedagógicas (Phase 5) que D-41-09/D-41-10 replican con el eje raíz/marco.
- **`content/categories.json`**: hoy **14 entradas** (order 1-14; `{"id":"riflessivi","name":"Verbi riflessivi (mi chiamo/si alza)","order":14,"origen":"ia-quorum"}` es la última). Append de 1 entrada con `order: 15` + `origen: "ia-quorum"`. Las 4 keys de una entrada son exactamente `id`, `name`, `order`, `origen`.
- **Smoke paramétrico + `CATEGORIES_WITH_EXPLANATIONS`**: añadir una categoría es **1 línea en el array** (D-144 / EXPL-08, generalizado en Phase 7.1) — cero código nuevo de test.

### Established Patterns
- **Nace en slot+variantes, NUNCA legacy payload** (v1.7 / Phases 36-38). Slots rule-rich con ≥2 variantes; aquí 6 en los 8.
- **DESIGN RULE D-04:** `match` solo si el pareo NO es derivable/mecánico → 0-match aquí (conjugación derivable por raíz).
- **Decisión-de-omisión documentada en `notes`**: `riflessivi` documenta su 0-match y su SCOPE-GATE; Phase 41 documenta **0-gloss + 0-match + 0-wb + blacklist de arcaísmos + gate léxico**.
- **Canon editorial** (español acentuado RAE, apóstrofes ASCII, plain text, italianismos literales, sin leak R1) — invariante desde Phase 7.1.
- **Quórum 1-por-1 con fresh context, NUNCA batched** (VAL-03) + ronda extra en los bloques delicados.
- **`fare` es namespace virgen:** una única aparición incidental de `fare` en todo `content/` (un listado de infinitivos dentro de una explanation) → cero riesgo de colisión, de contradicción editorial o de tocar el invariante APPEND-ONLY de `avere` (D-88).

### Integration Points
- `content-loader.js` → `loadContent()`: fetch de `content/exercises/fare-indicativo.json` + NFC normalize + `validateContent` (permisivo, con banner) + `slotById` vía `normalizeExerciseToSlot`. **Se carga genéricamente en boot** — cero cableado nuevo.
- `src/screens/app.js` → `categoriesForDisplay`: itera `content.categories` en orden de array → la fila `fare-indicativo` aparece en home/picker/Repaso/Examen **sin código nuevo** (SC#5), en cuanto exista la entrada de D-41-16.
- `src/domain/session.js` → `pickVariantIndex` (línea 232): entrega "una persona distinta cada pasada" gratis (uniforme por sesión, mismo `rng` threaded). SC#5 se cumple por construcción.
- **Motor intacto.** Sampler, cascada D-54 (EXACTAMENTE 2 call-sites de `applyImmediateFailure`, grep-verificable), promociones, racha, migración, backup — nada se toca.

### Estado verificado del codebase (2026-08-03)
- `CURRENT_SCHEMA_VERSION` = **13** (`src/data/storage.js:35` y `src/data/backup.js:56`), con `'fare-indicativo'` ya en `RESET_PREFIXES_V13` (Phase 40 shippeada).
- **14 categorías** registradas / **225 slots** en disco. Suite baseline tras Phase 40: `node --test tests/*.test.js`. **Ojo (`[[test_command_node_glob]]`): el path desnudo falla en Node 22.20 — usar el glob.**

</code_context>

<specifics>
## Specific Ideas

- **El 0-gloss es la decisión más contraintuitiva de la fase y la más fácil de romper por inercia.** Todo el canon del proyecto empuja a poner gloss `(en español: …)`; aquí es leak. Escribirlo en `notes` de forma explícita y con el *por qué* (7 de 8 casillas mapean 1:1 al español) es lo que evita que una pasada futura lo "arregle" añadiendo glosses.
- **La blacklist de arcaísmos protege contra la autoría, no contra el autor.** El fallo esperable es que la generación de distractoras produzca `fo` o `fé` creyéndolas obviamente incorrectas. Que la blacklist esté en `notes` **antes** de escribir las variantes es lo que lo previene; el quórum es la red de seguridad, no el mecanismo.
- **Las 2 variantes de trapassato remoto con `quando`** son el punto exacto donde SC#2/R7 puede fallar (`quando` admite imperfetto y passato remoto simple). Verificación explícita de unicidad de lectura del marco en esas dos, dentro de la ronda extra DeepSeek.
- **Marcos disjuntos pr↔pp** (D-41-11): el slot de passato remoto solo con `Nel 1990` / `Quell'estate` / `Molti anni fa`; el de passato prossimo solo con `stamattina` / `ieri` / `questa settimana`. Grep-verificable como pre-commit: ningún marco reciente en el slot remoto y al revés.
- **Deja el espacio de ids `-300`+ libre.** Phase 44 autora ahí el cruce ↔`avere` de los compuestos, que es donde naturalmente cae (`ho fatto` toca `avere` de lleno). No pre-crear el slot, no reservar el hueco con un placeholder: solo no usar esos números.
- **`fatto` es invariable con `avere`** en los 4 compuestos de esta fase — la concordancia (`li ho fatti`) es el MAGNET de **Phase 43** (INDEF-04). Ninguna variante de Phase 41 debe presentar `fatto` concordado ni ofrecerlo como distractora, para no colisionar con ese magnet antes de que exista.
- **`fa` sin apóstrofe es la key de 3ª singular** en el slot de presente. Phase 43 tiene el magnet `fa'`/`fai`/`fa` del imperativo; Phase 41 no lo toca ni lo contrasta (sería adelantarse a otra fase), pero conviene que Phase 43 sepa que `fa` ya vive aquí como indicativo.

</specifics>

<deferred>
## Deferred Ideas

- **Word-buttons de colocación adverbial en el compuesto** (`non ho mai fatto` frente a `*non mai ho fatto`) — error real del hispanohablante ("nunca he hecho") y candidato pedagógico fuerte, pero es **sintaxis del compuesto, no una casilla del paradigma**: estiraría IND-05 y se leería como scope creep. Candidato a una fase/categoría de sintaxis del compuesto, o a `fare-modismi`.
- **Contraste de uso passato remoto ↔ passato prossimo** (variación regional norte/sur) — rechazado por diseño en D-41-11: es registro, no paradigma, y abriría doble validez regional. Si el autor lo echa en falta al usarlo, es un slot nuevo, no un rediseño.
- **Word-buttons del marco del trapassato remoto** (`Dopo che ebbi fatto i compiti, uscii`) — rechazado por longitud del banco (≈8 tokens + distractoras). Reconsiderable si el MC resulta demasiado blando en el uso real.
- **Perífrasis y modismos de `fare`** (`fare la spesa`, `fa freddo`, `farcela`, causativo `fare + infinito`) — Out of Scope del milestone, categoría propia (`fare-modismi`) si el autor lo echa en falta. Es la razón concreta por la que D-40-04 rechazó el prefijo paraguas `'fare-'` en el reset.
- **Partir `fare-indicativo` en semplici/composti** — riesgo asumido y documentado en REQUIREMENTS.md §Future: la categoría mezcla *presente* (diario) con *trapassato remoto* (extinto en el habla) en la misma unidad de reset. Con 48 variantes es la categoría más grande del proyecto, así que el riesgo de "nunca se pone verde" es el más alto. Barato de partir y con precedente (`260614-hxn`), pero exigiría su propio eslabón de migración. **Vigilarlo tras las primeras semanas de uso.**
- **Cruces multi-cat de `fare-indicativo`** (`-300`+: ↔`avere`, ↔`modali`, ↔`presente-regolare`) — Phase 44, INT-03.
- **Sync de counts + `TOTAL_EXPECTED` + baseline-guard + entrada verificada de `categories.json`** — Phase 44, INT-01/INT-02.
- **Mismo patrón para `andare` / `venire` / `dire`** — REQUIREMENTS.md §Future, candidatos a v2.1+.
- **Arreglar las discrepancias de conteo VAL-06 preexistentes** (`genero-numero`, `preposiciones`) — fuera de scope desde v1.9 (D-35-08), sigue fuera (D-40-12).

### Reviewed Todos (not folded)
- **"FARE-X1 — paradigma completo del verbo `fare`"** (`area: content`, feature, score 0.6) — es el documento de diseño del milestone **entero**, no un todo consumible por Phase 41. Registrado como **canonical ref principal** de esta fase; se cierra cuando cierre v2.0, no aquí. Mismo tratamiento que en Phase 40.
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, minor, score 0.9) — falso positivo del matcher (puntúa alto por palabras basura: `del`, `home`, `prompt`, `status`). Es CSS responsive, ajeno a una fase de contenido JSON. Descartado igual en Phases 35 y 40. Pertenece al backlog "responsive móvil".
- **"decoyBank.pos con varias categorías por token"** (`area: content-pipeline`, minor, score 0.6) — DECOY-X1, pipeline de canciones. Sin relación con la autoría de una categoría de ejercicios; el autor ya decidió aceptar el `disputed` (opción A, 2026-07-27) hasta que el patrón reaparezca.

</deferred>

---

*Phase: 41-`fare-indicativo` — 8 slots (el bloque grande)*
*Context gathered: 2026-08-03*
