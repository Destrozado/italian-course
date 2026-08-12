# Phase 42: `fare-congiuntivo` — 4 slots (homógrafas + disparador) - Context

**Gathered:** 2026-08-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Autorar `content/exercises/fare-congiuntivo.json` — la categoría **`fare-congiuntivo`** con el subjuntivo completo de `fare` naciendo **directamente en slot+variantes** (nunca legacy payload), y registrarla en `content/categories.json` para que cargue en boot y aparezca genéricamente en home/picker/Repaso/Examen como **unidad de reset independiente** de las otras 3 categorías de `fare`. Cubre CONG-01..CONG-04.

**Volumen resultante de esta discusión: 5 slots × 6 variantes = 30 variantes** (no las ≈24 del roadmap — ver D-42-01), validadas **1-por-1** por quórum cross-vendor R1-R7, con **ronda EXTRA DeepSeek sobre 10 de ellas** (D-42-05/D-42-08).

**Dentro de scope:**
- `content/exercises/fare-congiuntivo.json` — **5 slots MC**, 30 variantes, `notes` con los gates declarados, `validation` por variante.
- `content/categories.json` — **1 entrada nueva** (append): `{id:"fare-congiuntivo", name:"…", order:16, origen:"ia-quorum"}`.
- Tests: 1 línea nueva en `CATEGORIES_WITH_EXPLANATIONS` (`tests/exercise-types.test.js:1273`) + `tests/content-fare-congiuntivo.test.js` con los gates de la categoría como invariantes permanentes (mirror de `tests/content-fare-indicativo.test.js`).

**Fuera de scope:**
- **Cruces multi-categoría** (`fare-congiuntivo-300`+) → **Phase 44, INT-03**. Phase 42 deja el espacio de ids `-300`+ libre y NO los autora. En particular el cruce congiuntivo↔indicativo **no existe** y no está en la lista de INT-03 (ver D-42-03 y Deferred).
- **Sync de counts** — los 3 arrays hardcoded + `TOTAL_EXPECTED` + la fórmula del baseline-guard → **Phase 44, INT-02**. Rojo/ciego esperado hasta entonces. El marcador honesto del trabajo de esta fase es `VAL_07_STRICT=1 node --test tests/*.test.js`, que sí ve el fichero gracias a la entrada nueva del smoke paramétrico.
- Las otras 3 categorías de `fare` (Phases 41 shippeada / 43).
- **El condizionale y el imperativo de `fare`** — casillas declaradas de **Phase 43**. Ninguna forma de esos dos modos entra en este fichero, ni como key ni como opción (ver D-42-11 y D-42-16).
- **El motor v1.4 NO se toca.** `git diff src/screens/app.js src/domain/ src/data/` debe quedar vacío al cierre. El slot nuevo del disparador tiene **un solo eje de variante** igual que los otros cuatro, así que `pickVariantIndex` lo sirve sin una línea nueva.
- **Perífrasis y modismos de `fare`** — SCOPE-GATE HARD heredado de D-41-06, sigue vigente aquí.

</domain>

<decisions>
## Implementation Decisions

### Estructura de slots y volumen

- **D-42-01 (5º slot dedicado al DISPARADOR):** El roadmap tiene una tensión interna — el título dice «4 slots» pero **SC#4 exige «al menos un slot»** para el disparador, con una variante donde **lo correcto es el indicativo**. Esa variante no cabe en el slot de presente: SC#1 fija sus 6 variantes como `faccia`×3 · `facciamo` · `facciate` · `facciano`, así que una séptima con key `fa` rompería la uniformidad del eje. Se resuelve con un **5º slot `fare-congiuntivo-disparador`, 6 variantes cuyo eje NO es la persona sino el DISPARADOR**: `penso che` · `benché` · `prima che` · `voglio che`/`è necessario che` · `se` hipotético · `so che`→indicativo. Sigue siendo **un único eje por slot** → cero motor nuevo (precedente de eje=contexto: los indefiniti de Phase 43, trampa 1 de FARE-X1). **Consecuencia para Phase 44: el milestone pasa de 21 slots / ≈107 variantes a 22 slots / ≈113 variantes.** — **Reversibility:** costly — quitar el slot después exige borrar 6 variantes ya validadas por quórum, y si el autor ya lo ha fallado sus ids viven en `exerciseStats`.
- **D-42-02 (eje de `passato` y `trapassato` = las 6 personas):** Mirror literal de D-41-01/D-41-02. 6 variantes por slot = las 6 personas del auxiliar (`abbia`×3 · `abbiamo` · `abbiate` · `abbiano`; `avessi`×2 · `avesse` · `avessimo` · `aveste` · `avessero`), con el **marco de concordancia con la principal covariando** sobre ese mismo eje único. Se rechazó el eje por contextos de concordancia (~3-4 variantes/slot, ≈24-26 total) con el mismo argumento con que D-41-01 rechazó reducir los compuestos: dejaría casillas persona×tiempo del auxiliar sin examinar nunca. Se rechazó también el marco fijo por slot: el autor aprendería el slot por la forma de la principal en vez de por la concordancia.
- **D-42-03 (`categoryIds` de 1, la variante de contraste NO es un cruce):** Los 5 slots llevan `categoryIds: ["fare-congiuntivo"]`. La variante `so che ___` → `fa` **no es un cruce multi-categoría**: es un test de reconocimiento de disparador *dentro* del congiuntivo, donde el indicativo aparece como respuesta y no como tema examinado. Mantiene la lista de cruces de **INT-03 cerrada** tal como Phase 44 la declara, evita que fallar el disparador arrastre `fare-indicativo` en la cascada D-54, y preserva SC#5 (categoría independiente como unidad de reset).
- **D-42-04 (2 plans, mirror de Phase 41):** **Plan 42-01** = alta de la categoría (`categories.json` order 16 + la línea del smoke paramétrico) + los 2 slots SIMPLES `presente` e `imperfetto` (12 variantes), con **tracer sobre el presente verificado antes de expandir**. **Plan 42-02** = los 2 COMPUESTOS `passato` y `trapassato` (12 variantes) + el slot del DISPARADOR (6) + `tests/content-fare-congiuntivo.test.js`. Espejo de 41-01/41-02. La autoría corre vía `execute-phase`/`gsd-executor`; el **quórum base canónico Opus+Sonnet se estampa en una pasada TOP-LEVEL posterior** porque el executor no puede spawnear los Task subagents del skill `gsd-validate-exercise` (`[[executor_cannot_run_task_quorum]]`). La ronda extra DeepSeek de D-42-08 entra en esa misma pasada. **Invariante VAL-03 inviolable: 1 ejercicio por contexto, NUNCA batched.**

### El bloque homógrafo (SC#2, MAGNET declarado)

- **D-42-05 (son 10 variantes, no 5):** El paréntesis de SC#2 nombra solo `faccia` io/tu/lui-lei y `facessi` io/tu, pero **es ilustrativo, no la lista cerrada** — se escribió antes de mirar el paradigma de `avere`. El auxiliar es homógrafo exactamente igual: `abbia` es io/tu/lui-lei y `avessi` es io/tu. El bloque real son **10 variantes de 30**: `faccia`×3 · `facessi`×2 · `abbia fatto`×3 · `avessi fatto`×2. La palabra vinculante de SC#2 es **«En TODAS las variantes homógrafas»**. Razón de no recortar a 5: `abbia fatto` io/tu/lui-lei tiene el mismo modo de fallo exacto, y una variante con dos respuestas válidas se paga con el reset de la categoría entera por la cascada D-54.
- **D-42-06 (gate HARD de no-correferencia, las 30 variantes):** En italiano estándar, cuando el sujeto de la principal **coincide** con el del subordinado, la construcción con `che` + subjuntivo es defectuosa: se exige `di` + infinitivo (`Penso di fare i compiti`, **no** `Penso che io faccia i compiti`). Y `penso che` es el primer disparador que nombra CONG-04, así que la variante de `io` escrita del modo obvio sale mal construida. Se declara en `notes` con audit trail: **el sujeto de la principal NUNCA coincide con el sujeto del hueco, en ninguna de las 30 variantes.** Se cumple con disparadores impersonales (`Bisogna che`, `È necessario che`, `Benché`, `Prima che`) o con un sujeto explícito distinto en la principal (`Lui pensa che io faccia…`). Mirror del SCOPE-GATE HARD de D-41-06: **gate de autoría declarado ANTES de escribir, con el quórum como red y no como mecanismo** — la coincidencia de sujetos es un patrón sistemático, no un fallo aislado, así que dejarlo al quórum se pagaría varias veces.
- **D-42-07 (qué diferencia a las variantes que comparten key):** Tres variantes del presente comparten la key `faccia` y tres del passato comparten `abbia fatto`. Para que no sean el mismo ejercicio tres veces, **covarían tres cosas sobre el mismo eje único de persona**: (a) **disparador distinto** por variante, (b) **distractoras específicas de ESA persona** (ver D-42-09/D-42-10), (c) **objeto literal distinto** del conjunto cerrado de D-41-06. Se rechazó el patrón fijo de distractoras cross-variante: con las cuatro opciones idénticas en las tres, la distractora de indicativo solo podría ser la de UNA persona y dos de las tres perderían su trampa más valiosa.
- **D-42-08 (ronda EXTRA = DeepSeek obligatorio sobre las 10):** Mirror literal de D-41-12 — pase DeepSeek obligatorio vía `scripts/validate-ai-pass.mjs` sobre las 10 variantes homógrafas, **además** del quórum base Opus+Sonnet top-level. DeepSeek es el estricto en acentos y concordancia y ya cazó bugs que los checkpoints human-verify aprobaron (`[[feedback_cross_vendor_catches_bugs]]`). Se rechazó DeepSeek+Gemini (dobla el coste y Gemini marca el gloss ES como leak, falso positivo de política en este proyecto — `[[gloss_es_desambiguacion_canon]]`) y se rechazó cambiar a Gemini solo (rompería la continuidad del precedente sin razón de contenido). Se rechazó extender la ronda extra al slot del disparador: 16 de 30 es demasiado para una fase de este tamaño.

### Política de distractoras

- **D-42-09 (`passato` y `trapassato` — SC#3 literal, cero indicativo):** Las 3 distractoras de cada variante son **formas de SUBJUNTIVO de esa misma persona**: el otro compuesto (`avessi fatto` frente a `abbia fatto`) más los dos simples (`faccia`, `facessi`). **Ningún indicativo en estos dos slots.** SC#3 dice literalmente «distractoras que son el OTRO tiempo del subjuntivo (**no otro modo**)» y es un criterio que la verificación va a comprobar al pie de la letra. Bonus pedagógico: el contraste simple-vs-compuesto enseña la anterioridad, que es exactamente lo que CONG-03 examina. Se rechazaron tanto la lectura permisiva (2 de subjuntivo + 1 de indicativo) como la desviación declarada con audit trail al estilo D-41-10 — aquí el «(no otro modo)» es explícito, no inferido.
  **Consecuencia de autoría:** el marco de cada prompt tiene que excluir limpiamente los dos simples, o `faccia`/`facessi` serían defendibles como correctas. Es el trabajo fino de estos dos slots.
- **D-42-10 (`presente` e `imperfetto` — patrón fijo cross-slot):** Híbrido de D-41-09 y del contraste de modo: (a) **el indicativo de ESA persona** (`faccio` frente a `faccia`; `facevo` frente a `facessi`) = el error de interferencia real del hispanohablante, (b) **una forma real de subjuntivo de OTRA persona** — solo se descarta leyendo el sujeto, que es la trampa que las homógrafas exigen, (c) **una raíz regularizada inexistente** (`facia`, `faciamo`, un `facessimo` mal formado). Los tres ejes de error que se cometen de verdad. Se rechazó doblar la carga de indicativo (quitaría la distractora que obliga a leer el sujeto) y se rechazó el mirror literal de D-41-09 sin indicativo (la categoría dejaría de examinar el contraste modo-a-modo salvo en el slot del disparador).
- **D-42-11 (blacklist — la misma regla, aplicada al CONTEXTO):** Phase 41 blacklisteó el cruce de modo como distractora, y aquí se usa a propósito. **No es una inversión de la regla, es su aplicación correcta:** la regla que el autor ratificó el 2026-08-03 prohíbe la distractora **defendible como correcta**, y una forma atestiguada solo lo es si el prompt la admite. Bajo un disparador de subjuntivo, `faccio` está atestiguada pero **no es defendible** — el disparador la excluye sin ambigüedad. Se declara así en `notes`, con el criterio operativo explícito (defendibilidad-en-contexto, no atestiguación-en-abstracto), y la blacklist:
  - **hereda** las arcaicas/poéticas/dialectales de D-41-08 y de la ampliación de la autoría de Phase 41 (`fo`, `fé`, `fenno`, `facea`, `fan`, `face`, `faci`, `fei`, `festi`, `femmo`, `feste`, `fero`, `feciono`, `fici`, `facisti`, `facette`, `facettero`, `facero`);
  - **añade las trampas nuevas de esta categoría**: `facci` (= imperativo `fa'` + `ci`, atestiguada y corriente en `facci sapere`), `facciam` (truncamiento poético de `facciamo`), y los **sustantivos homógrafos** `faccia` (cara), `facce` (plural) y `facciate` (fachadas) — los dos últimos relevantes porque `facciate` es además la key de `voi`;
  - **mantiene fuera de `options` el condizionale y el imperativo** (`farei` y familia, `fa'`), que son casillas declaradas de Phase 43.
  - **Nota de escaneo (heredada):** las comprobaciones de ausencia se hacen SIEMPRE **por campo**, sobre `prompt` y `options`, nunca sobre el fichero completo — este `notes` las nombra a propósito y un grep de fichero entero se auto-invalidaría.
- **D-42-12 (slot del DISPARADOR — 4 casillas reales, modo × tiempo):** Las 4 opciones son las cuatro casillas en juego para esa persona: congiuntivo presente `faccia` · indicativo presente `fa` · congiuntivo imperfetto `facesse` · indicativo imperfetto `faceva`. El autor decide **modo Y tiempo**, y solo el disparador más el marco determinan la casilla. **Ninguna opción es forma inventada.** La variante de contraste (`so che ___` → `fa`) usa el mismo patrón sin excepción. Se rechazó el slot de eje-modo-puro (`faccia` vs `fa` + dos formas mal construidas de relleno: con dos opciones reales y dos obviamente falsas es una moneda al aire de facto) y el de modo × persona (mezcla dos ejes en el slot cuyo propósito declarado es aislar uno).

### Gloss ES, explanations y canon editorial

- **D-42-13 (0-gloss del VERBO, gloss léxico del DISPARADOR):** Cero gloss `(en español: …)` sobre la forma verbal en las 30 variantes — heredado de D-41-05 con el por qué **reforzado**: el español también tiene subjuntivo, así que un gloss sobre el verbo regala **modo y tiempo a la vez** (doble leak R1 en una categoría cuyo ejercicio es justamente elegir modo y tiempo). **Pero sí gloss léxico sobre la conjunción** cuando está por encima de nivel: `Benché (aunque)`, `Purché (siempre que)`, `Prima che (antes de que)`, `Nonostante (a pesar de que)`. **No filtra nada**: «aunque» en español admite los dos modos, así que saber la traducción no dice qué rige el italiano. Es el canon R7 aplicado donde de verdad desambigua — léxico, no respuesta (`[[gloss_es_desambiguacion_canon]]`). Razón de no ir a 0-gloss total: el autor prepara el A1 y `benché`/`purché` están por encima de ese nivel; fallar por vocabulario resetea la categoría entera vía cascada D-54, que es exactamente el ejercicio injusto que esta herramienta existe para evitar. **Aviso para el quórum:** Gemini/DeepSeek marcarán este gloss como C5-leak — es **falso positivo de política**, se mantiene; la base de aprobación es Claude Opus+Sonnet. — **Reversibility:** reversible — quitar el gloss de una conjunción concreta es una edición local + re-pase de esa variante.
- **D-42-14 (el error de interferencia `penso che` / «pienso que»):** `penso che` rige subjuntivo en italiano mientras «pienso que» rige **indicativo** en español — el punto de interferencia más valioso de la categoría entera. La explanation del **slot del disparador lo desarrolla** con el par explícito (`penso che faccia` frente a «pienso que hace») y lista qué disparadores italianos exigen subjuntivo donde el español no; **`presente` e `imperfetto` llevan una línea de recordatorio** porque es donde el error muerde en la práctica; **`passato` y `trapassato` NO lo repiten** — ahí el eje es la anterioridad, no el modo. Razón de no dejarlo solo en el disparador: el motor sirve un slot por sesión, así que se puede pasar muchas veces por presente e imperfetto sin volver a leer la advertencia que explica por qué se falló. Tono D-127: 3ª impersonal, regla, ejemplo paralelo italiano-español.
- **D-42-15 (hand-off a Phase 43, documentado y sin mencionarlo):** `faccia`, `facciamo` y `facciano` son **idénticas a 3 de las 5 formas del imperativo de Phase 43**, y `fate` ya vive en `fare-indicativo` — así que **4 de las 5 formas del imperativo ya están en el corpus** y el magnet de Phase 43 es más grande que el `fa'`/`fai`/`fa` que INT-04 declara. Se registra en `notes` **y** en Deferred. Las explanations de Phase 42 **NO mencionan el imperativo**: sería adelantarse a otra fase. Precedente exacto: Phase 41 hizo esto mismo con `fa` (`41-CONTEXT.md` §specifics).
- **D-42-16 (`se` hipotético con la principal en otro verbo):** SC#4 nombra el `se` hipotético, que exige condizionale en la principal — y el condizionale de `fare` es casilla declarada de Phase 43. Se resuelve con una **principal en condizionale de un verbo que NO es `fare`**: `Se io facessi i compiti, mia madre sarebbe contenta`. El periodo ipotetico queda bien construido, el disparador se examina de verdad, y **ninguna casilla de Phase 43 entra en este fichero** — coherente con la blacklist de D-42-11, que ya excluye `farei` y familia. Se rechazó admitir `farei` en la principal (más natural pero mete la casilla de otra fase) y se rechazó quitar el `se` hipotético (SC#4 lo nombra explícitamente y el verificador va a buscarlo).
- **D-42-17 (canon editorial heredado, locked):** Explanations en **español acentuado RAE** (`[[explanations_must_be_accented]]` — un flag C4-accent del quórum sobre español sin tildes es bug **REAL**, se arreglan los acentos, NO se hace override), **apóstrofes ASCII U+0027**, **plain text sin markdown**, italianismos citados en ortografía italiana (`faccia`, `facessi`, `abbia fatto`, `benché`), **sin leak de regla / persona / desinencia objetivo en el prompt (R1)**, sin smart-quotes. Cada variante con `validation.status: "validated"` (≥2 passes `correcta`, ≥2 `by` distintos, cero `incorrecta`).
- **D-42-18 (heredados sin re-discutir, de Phases 40/41):** slug exacto **`fare-congiuntivo`** (D-40-01/02, ya en `RESET_PREFIXES_V13`); nace en **slot+variantes**, nunca legacy payload; **pronombre sujeto explícito** en las 30 variantes (D-41-07 — aquí además obligatorio por CONG-01/02); **MC-only con 0-match y 0-word-buttons** declarados en `notes` como decisión-no-omisión (D-41-13, DESIGN RULE D-04: el pareo persona↔forma es derivable por raíz); **SCOPE-GATE HARD** del objeto literal (conjunto cerrado `i compiti`/`un errore`/`il lavoro`/`una torta`/`il letto`/`tutto`/`una foto`, cero perífrasis); **ids semánticos** con prefijo de categoría y el espacio `-300`+ libre para Phase 44; **entrada en `categories.json` obligatoria** (no cosmética: `schema-validator.js` exige que todo `categoryIds` referencie una categoría conocida, así que el fichero de contenido no puede estar en disco sin ella).

### Claude's Discretion

- Redacción concreta de los 30 prompts y de las 5 explanations, dentro de D-42-06 y D-42-09..D-42-17.
- **Reparto de los 6 disparadores entre las 6 variantes del slot nuevo** — qué disparador va con qué persona, y cuál de los 6 es el de contraste `so che` (SC#4 exige al menos uno; puede ser exactamente uno).
- **Los marcos temporales concretos** de `passato` y `trapassato`, y cómo se blinda que el subjuntivo simple no sea también válido en esos prompts (el trabajo fino que D-42-09 deja abierto).
- Qué objeto literal del conjunto cerrado lleva cada frase, y el reparto de disparadores impersonales frente a sujeto-explícito-distinto para cumplir D-42-06.
- Profundidad y estructura de cada explanation (citar el paradigma completo de las 6 formas frente a solo la casilla) — el precedente de `riflessivi` y de `fare-indicativo` cita el paradigma.
- `name` exacto de la entrada de `categories.json`, siguiendo el patrón descriptivo de las 15 existentes (p. ej. `"Fare — congiuntivo (faccia/facessi/abbia fatto)"`).
- Nombres y estructura de los gates de `tests/content-fare-congiuntivo.test.js`, siempre que congelen como invariantes permanentes: estructura y conteos (5 slots / 30 variantes / MC-only / key set de schema / ningún id `-300`+), paradigma completo de las 30 keys, pronombre explícito por persona, **no-correferencia de sujetos (D-42-06)**, 0-gloss del verbo con la excepción del gloss de conjunción (D-42-13), SCOPE-GATE léxico, blacklist por campo (D-42-11), los tres patrones de distractoras (D-42-09/D-42-10/D-42-12), y ausencia de formas de condizionale e imperativo (D-42-16).
- Sincronizar o no el count de `fare-congiuntivo` al final de Phase 42 (ciego/rojo esperado hasta Phase 44 en cualquier caso).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El diseño del milestone
- `.planning/todos/pending/fare-paradigma-completo.md` — documento de diseño **FARE-X1** (2026-07-27): la tabla de las 4 categorías, el encaje en `pickVariantIndex`, la categoría como unidad de reset, el volumen estimado, y **las 6 trampas de contenido** (§Trampas). Phase 42 consume la **trampa 3** (celdas homógrafas — base de D-42-05) y por analogía la **trampa 1** (eje = contexto cuando la forma no conjuga por persona — base del eje del slot del disparador, D-42-01) y la **trampa 4** (MAGNET de doble validez → ronda extra, D-42-08).

### El precedente inmediato (Phase 41 — el molde más cercano, ya shippeado)
- `.planning/phases/41-fare-indicativo-8-slots-el-bloque-grande/41-CONTEXT.md` — **el ref más importante de esta fase**. D-41-01/02 (eje persona + marco covariando → base de D-42-02), D-41-05 (0-gloss razonado → base de D-42-13), D-41-06 (SCOPE-GATE HARD del objeto literal, vigente aquí), D-41-07 (pronombre explícito), D-41-08 (blacklist con audit trail → base de D-42-11), D-41-09/10 (patrones fijos de distractoras → base de D-42-10), D-41-12 (ronda extra DeepSeek → base de D-42-08), D-41-13 (MC-only, 0-match, 0-wb), D-41-14 (ids semánticos, `-300`+ libre), D-41-15 (2 plans + quórum top-level → base de D-42-04), D-41-16 (registro en `categories.json`), D-41-17 (canon editorial).
- `content/exercises/fare-indicativo.json` — **el molde a clonar byte a byte en forma**: top-level `{notes, exercises[]}`, shape de slot MC (`{id, type, categoryIds, explanation, variants[{prompt, options[4], correctIndex}], validation{status, passes[]}}`), y sobre todo el **estilo de `notes`**: cada gate y cada decisión-de-omisión declarada con su audit trail y su «por qué», incluidas las correcciones de autoría posteriores. Es el patrón literal a replicar.
- `tests/content-fare-congiuntivo.test.js` **← a crear**, clonando `tests/content-fare-indicativo.test.js` — 11 `describe` que congelan los gates de la categoría como invariantes permanentes. Ojo al patrón de **escaneo por campo** (`prompt`/`options`, nunca el fichero entero).

### El molde estructural de v1.9
- `content/exercises/riflessivi.json` — el patrón de `notes` documentando el 0-match y el SCOPE-GATE HARD como decisión razonada; `validation.passes[]` con 4 `by` distintos.
- `content/exercises/possessivi.json` — el precedente **MC-only** (7 slots, cero match, cero word-buttons).
- `content/exercises/essere.json` — el precedente del **patrón fijo de distractoras pedagógicas** (Phase 5).
- `.planning/milestones/v1.9-phases/38-verbi-riflessivi/38-CONTEXT.md` — fase de autoría con magnet; el caveat del quórum dentro del executor.
- `.planning/milestones/v1.9-phases/38-verbi-riflessivi/38-PATTERNS.md` — mapeo de ficheros nuevos a sus análogos, para una fase de contenido.

### El contrato de slugs (Phase 40 — INVIOLABLE)
- `.planning/phases/40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-/40-CONTEXT.md` — **D-40-01/02** (el slug es exactamente `fare-congiuntivo`: id en `categories.json`, nombre de fichero, elemento de `RESET_PREFIXES_V13`, prefijo de los ids de slot y de cruce), **D-40-06** (el registro operativo lo hace la fase de contenido), **D-40-07** (convención de ids de cruce, vinculante para Phase 44).
- `src/data/storage.js:1345` — `RESET_PREFIXES_V13` (incluye `'fare-congiuntivo'`) y el comentario de las líneas 1306-1312 que declara los 4 strings como vinculantes para Phases 41-44. Phase 42 **no lo toca**; solo confirma que el slug del fichero coincide byte a byte.

### Requisitos y criterios de éxito
- `.planning/REQUIREMENTS.md` — **CONG-01..CONG-04** (líneas 30-33: la exigencia literal de sujeto explícito en las homógrafas, y el disparador como requisito propio); §Mapping rationale línea 116 (por qué CONG-04 vive aquí y no es una casilla del paradigma); §Out of Scope (motor v1.4, eje de variante nuevo, perífrasis); **INT-01..INT-04** (lo que es de Phase 44).
- `.planning/ROADMAP.md` §Phase 42 (líneas 199-212) — Goal + los **5 Success Criteria** que la verificación comprueba literalmente. **Ojo a SC#2** («en TODAS las variantes homógrafas» → D-42-05), **SC#3** («distractoras que son el OTRO tiempo del subjuntivo, no otro modo» → D-42-09, es el criterio más restrictivo de la fase) y **SC#4** (el disparador + la variante de contraste en indicativo → D-42-01/D-42-12/D-42-16).
- `.planning/ROADMAP.md` §Phase 43 y §Phase 44 — para respetar las fronteras: el imperativo y el condizionale son de 43 (D-42-15/D-42-16), los cruces y los counts de 44 (D-42-03).

### Infra y canon de validación por quórum
- `docs/VALIDACION-QUORUM.md` — el invariante no negociable: `deriveStatus(passes)` exige **≥2 pases `correcta` con `by` DISTINTOS y cero `incorrecta`** para `validated`; cualquier `incorrecta` → `disputed` **sticky**; **VAL-03: 1 ejercicio por contexto, NUNCA batched**. Tabla de modelos y política de auto-fallback.
- Skill `gsd-validate-exercise` — la vía canónica (Opus + Sonnet, C1-C5, un subagent fresh por ejercicio). **No disponible dentro del executor** → ver D-42-04.
- `scripts/validate-ai-pass.mjs` — refuerzo cross-vendor (Gemini/DeepSeek, auto-fallback en 429, `--write`); claves en `.env`. **Pase DeepSeek obligatorio** sobre las 10 homógrafas (D-42-08).
- `src/data/validation-state.js` → `deriveStatus(passes)` — la función que decide `validated`/`disputed`/`pending`.
- `scripts/run-validation-271.mjs` — reporter/gate VAL-04 y VAL-06. Discrepancias preexistentes de `genero-numero` y `preposiciones` fuera de scope (D-35-08 / D-40-12).

### Investigación (v1.9 — aplicable por analogía; v2.0 no tiene fase de research)
- `.planning/research/PITFALLS.md` — Pitfall 8 (leak R1), Pitfall 9 (gloss ES: mantener donde desambigua → base de D-42-13), Pitfall 10 (acentos = bug real).
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (alta de categoría = clon del patrón v1.7), Pattern 3 (append de `order`, documental), §Count Sync (los touch-points de Phase 44).

> **Nota de frescura:** `.planning/research/*` es de **2026-07-01 (v1.9)**. v2.0 no tiene fase de research — el autor la saltó a propósito porque el diseño FARE-X1 ya estaba cerrado. Valen como referencia de patrón.

### Regla de proyecto
- `CLAUDE.md` — stack (web estática, ES modules, contenido en JSON editado a mano, interfaz en español).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`content/exercises/fare-indicativo.json`** (2026-08-04, 8 slots / 48 variantes, todas `validated`): el análogo más cercano que existe. Se clona la forma, el shape de `validation.passes[]` (`{by, date, verdict, concerns[]}`) y sobre todo el **estilo de `notes`** — un párrafo largo en prosa que declara cada gate con su audit trail, incluidas las correcciones de autoría descubiertas al escribir.
- **`tests/content-fare-indicativo.test.js`**: 11 `describe` que son el molde directo de los gates de Phase 42 — estructura y conteos, paradigma completo de keys, eje de persona con pronombre explícito, 0-gloss, SCOPE-GATE léxico, blacklist por campo, patrones de distractoras por familia de slot, y el gate de «ningún id lleva sufijo numérico de 3 cifras» que mantiene libre el espacio `-300`+.
- **`content/categories.json`**: hoy **15 entradas** (order 1-15; `{"id":"fare-indicativo","name":"Fare — indicativo (faccio/feci/ho fatto)","order":15,"origen":"ia-quorum"}` es la última). Append de 1 entrada con `order: 16` + `origen: "ia-quorum"`. Las 4 keys de una entrada son exactamente `id`, `name`, `order`, `origen`.
- **`CATEGORIES_WITH_EXPLANATIONS`** (`tests/exercise-types.test.js:1273`): añadir una categoría es **1 línea en el array** (D-144 / EXPL-08) — cero código nuevo de test; el array se reutiliza en el gate D-VAL-18 (línea 1429).
- **`content/exercises/riflessivi.json` / `possessivi.json` / `essere.json`**: molde de v1.9, precedente MC-only, y patrón fijo de distractoras pedagógicas.

### Established Patterns
- **Nace en slot+variantes, NUNCA legacy payload** (v1.7 / Phases 36-38, 41). Slots rule-rich con ≥2 variantes; aquí 6 en los 5.
- **DESIGN RULE D-04:** `match` solo si el pareo NO es derivable/mecánico → 0-match aquí.
- **Decisión-de-omisión documentada en `notes`**: Phase 42 documenta 0-match + 0-wb + 0-gloss-del-verbo + gate de no-correferencia + blacklist ampliada + SCOPE-GATE léxico heredado + el hand-off a Phase 43.
- **Regla de las formas atestiguadas y de las LECTURAS** (ratificada por el autor el 2026-08-03): si una distractora candidata es forma italiana atestiguada **o es defendible como correcta**, no entra en `options` — entra en la blacklist con su audit trail. D-42-11 la aplica al contexto en vez de en abstracto.
- **Canon editorial** (español acentuado RAE, apóstrofes ASCII, plain text, italianismos literales, sin leak R1) — invariante desde Phase 7.1.
- **Quórum 1-por-1 con fresh context, NUNCA batched** (VAL-03) + ronda extra en los bloques delicados.

### Integration Points
- `content-loader.js` → `loadContent()`: fetch de `content/exercises/fare-congiuntivo.json` + NFC normalize + `validateContent` + `slotById` vía `normalizeExerciseToSlot`. **Se carga genéricamente en boot** — cero cableado nuevo.
- `src/screens/app.js` → `categoriesForDisplay`: itera `content.categories` en orden de array → la fila `fare-congiuntivo` aparece en home/picker/Repaso/Examen **sin código nuevo** (SC#5), en cuanto exista la entrada de order 16.
- `src/domain/session.js` → `pickVariantIndex` (línea 232): entrega una variante distinta por sesión gratis, tanto para los 4 slots de eje-persona como para el slot de eje-disparador. SC#5 se cumple por construcción.
- `schema-validator.js`: exige que todo valor de `categoryIds` referencie una categoría conocida → la entrada de `categories.json` es **prerequisito de schema**, no cosmética.
- **Motor intacto.** Sampler, cascada D-54 (EXACTAMENTE 2 call-sites de `applyImmediateFailure`, grep-verificable), promociones, racha, migración, backup — nada se toca.

### Estado verificado del codebase (2026-08-05)
- `CURRENT_SCHEMA_VERSION` = **13**, con `'fare-congiuntivo'` ya en `RESET_PREFIXES_V13` (`src/data/storage.js:1345`, Phase 40 shippeada).
- **15 categorías** registradas / **233 slots** en disco (225 + los 8 de `fare-indicativo`).
- Suite: **`node --test tests/*.test.js`**. **Ojo (`[[test_command_node_glob]]`): el path desnudo falla en Node 22.20 — usar el glob.** El marcador honesto del trabajo de esta fase es `VAL_07_STRICT=1 node --test tests/*.test.js`.

</code_context>

<specifics>
## Specific Ideas

- **El bloque homógrafo real es de 10, no de 5, y el roadmap dice 5.** Es el hallazgo más importante de esta discusión: `abbia` es io/tu/lui-lei y `avessi` es io/tu, exactamente igual que `faccia` y `facessi`. Si el planner se queda con el paréntesis de SC#2, cinco variantes con el mismo modo de fallo se quedan sin la red — y una variante con dos respuestas válidas se paga con el reset de la categoría entera.
- **La coincidencia de sujetos es el fallo sistemático de esta categoría**, el análogo de lo que el 0-gloss fue en Phase 41. `Penso che io faccia i compiti` es la frase que la autoría va a escribir por inercia, y es defectuosa: el italiano exige `Penso di fare`. El gate de D-42-06 tiene que estar en `notes` **antes** de escribir las 30 variantes; el quórum es la red, no el mecanismo.
- **SC#3 es el criterio más restrictivo de la fase y el más fácil de incumplir sin darse cuenta.** «Distractoras que son el otro tiempo del subjuntivo (no otro modo)» significa que en `passato` y `trapassato` **no puede haber ni un solo indicativo**, justo donde `ha fatto` es la distractora más tentadora. El precio es que el marco de cada prompt tiene que excluir limpiamente `faccia` y `facessi`, y ese es el trabajo fino de esos dos slots.
- **El gloss de la conjunción es la desviación deliberada del 0-gloss de Phase 41.** No es una recaída por inercia: es el canon R7 aplicado al léxico. `Benché (aunque)` no filtra el modo porque «aunque» rige los dos en español. Escribir el *por qué* en `notes` es lo que evita que una pasada futura lo «arregle» en cualquiera de las dos direcciones.
- **`facci` es la trampa nueva más probable.** Es una forma corriente (`facci sapere` = imperativo `fa'` + `ci`), suena a error de conjugación y es el calco más obvio que la autoría generaría como distractora «obviamente mala» de `faccia`. Va a la blacklist antes de escribir, con audit trail.
- **`facciate` es la key de `voi` y a la vez el plural del sustantivo `facciata` (fachadas).** No es un problema de distractora, pero conviene que el quórum sepa que la homografía está vista y es deliberada.
- **4 de las 5 formas del imperativo de Phase 43 ya viven en el corpus** tras esta fase (`faccia`/`facciamo`/`facciano` aquí, `fate` en `fare-indicativo`). El magnet que INT-04 declara (`fa'`/`fai`/`fa`) es solo la punta: Phase 43 va a tener que decidir qué hace con tres formas que el autor ya habrá visto como subjuntivo. Registrado en `notes` y en Deferred.
- **Deja el espacio de ids `-300`+ libre.** No pre-crear, no reservar con placeholder: solo no usar esos números.
- **El slot del disparador tiene 6 variantes y una sola es de contraste indicativo.** SC#4 pide «al menos una»; una es suficiente y mantiene la categoría siendo lo que dice ser. Si el autor lo echa en falta, subir a dos es una edición local.

</specifics>

<deferred>
## Deferred Ideas

- **Cruce multi-categoría `fare-congiuntivo` ↔ `fare-indicativo`** (espacio `-300`+) — rechazado en D-42-03 por diseño: la lista de cruces de INT-03 (↔`avere`, ↔`modali`, ↔`presente-regolare`) está cerrada, y un cruce congiuntivo↔indicativo haría la categoría menos independiente como unidad de reset, en contra de SC#5. Pedagógicamente defendible (el error *es* confundir los dos modos). Candidato a Phase 44 o posterior si el autor lo echa en falta; hoy **no está contemplado en INT-03**.
- **Segunda variante de contraste en indicativo** en el slot del disparador — SC#4 exige «al menos una» y Phase 42 pone exactamente una. Subir a dos es una edición local + re-pase de quórum de esa variante.
- **El magnet ampliado del imperativo de Phase 43** — `faccia`/`facciamo`/`facciano` (esta fase) y `fate` (Phase 41) son 4 de las 5 formas del imperativo. Phase 43 tendrá que decidir si las contrasta, si las declara homógrafas en su `notes`, o si amplía el magnet de INT-04 más allá de `fa'`/`fai`/`fa`. **No es trabajo de Phase 42** — solo el hand-off.
- **Disparadores que Phase 42 no usa** (`affinché`, `sebbene`, `a meno che`, `qualunque`, el superlativo relativo, `il primo che`) — el slot tiene 6 variantes y el italiano tiene muchos más disparadores. Si el autor quiere más cobertura del eje disparador, son variantes nuevas del slot existente, no un rediseño.
- **Perífrasis y modismos de `fare`** (`fare la spesa`, `fa freddo`, `farcela`, causativo `fare + infinito`) — Out of Scope del milestone, categoría propia (`fare-modismi`) si el autor lo echa en falta.
- **Cruces multi-cat + sync de counts + `TOTAL_EXPECTED` + baseline-guard + entrada verificada de `categories.json`** — Phase 44, INT-01/INT-02/INT-03. **Nota para Phase 44: el total del milestone sube de 21 slots / ≈107 variantes a 22 slots / ≈113 variantes** por el 5º slot de D-42-01.
- **Mismo patrón para `andare` / `venire` / `dire`** — REQUIREMENTS.md §Future, candidatos a v2.1+.
- **Arreglar las discrepancias de conteo VAL-06 preexistentes** (`genero-numero`, `preposiciones`) — fuera de scope desde v1.9 (D-35-08), sigue fuera (D-40-12).

### Reviewed Todos (not folded)
- **"FARE-X1 — paradigma completo del verbo `fare`"** (`area: content`, feature, score 0.6) — es el documento de diseño del milestone **entero**, no un todo consumible por Phase 42. Registrado como canonical ref principal; se cierra cuando cierre v2.0. Mismo tratamiento que en Phases 40 y 41.
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, minor, score 0.9) — falso positivo del matcher (puntúa alto por palabras basura: `del`, `phase`). Es CSS responsive, ajeno a una fase de contenido JSON. Descartado igual en Phases 35, 40 y 41. Pertenece al backlog "responsive móvil".
- **"decoyBank.pos con varias categorías por token"** (`area: content-pipeline`, minor, score 0.6) — DECOY-X1, pipeline de canciones. Sin relación con la autoría de una categoría de ejercicios; el autor ya decidió aceptar el `disputed` (opción A, 2026-07-27) hasta que el patrón reaparezca.

</deferred>

---

*Phase: 42-`fare-congiuntivo` — 4 slots (homógrafas + disparador)*
*Context gathered: 2026-08-05*
