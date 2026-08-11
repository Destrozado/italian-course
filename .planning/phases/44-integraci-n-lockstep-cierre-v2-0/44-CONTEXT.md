# Phase 44: Integración lockstep + cierre v2.0 - Context

**Gathered:** 2026-08-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Cerrar el milestone v2.0: **re-sincronizar los conteos que quedaron ciegos**, **autorar los 3 cruces multi-categoría de `fare`**, **corregir los documentos que ya no describen la realidad**, y **demostrar con gates que el motor v1.4 sigue byte-intacto**. Cubre INT-01..INT-04.

**El scout de esta discusión encontró que buena parte de INT-01/INT-02/INT-04 ya está hecha de facto** por las Phases 41/42/43 — el trabajo real de la fase es más pequeño y está más concentrado de lo que el roadmap sugiere. Estado verificado 2026-08-11:

| Touch-point | Estado real HOY | Qué falta |
|---|---|---|
| `content/categories.json` | 18 entradas, order 15-18 con `origen: "ia-quorum"` | **NADA** — solo verificar (INT-01) |
| `CATEGORIES_WITH_EXPLANATIONS` (`tests/exercise-types.test.js:1338`) | Ya tiene las 4 `fare-*` con `slotCountOf` dinámico | **NADA** |
| Smoke paramétrico `VAL_07_STRICT` (`tests/exercise-types.test.js:1503`) | Itera ese mismo array → ya cubre las 4 | **NADA** |
| `REAL_CATEGORIES` (`tests/fixtures/slot-variants-integration.test.js:168`) | 14 entradas | **+4** |
| `CATEGORIES` (`scripts/run-validation-271.mjs:173`) | 14 entradas → el reporter dice `225/225 PASS` **estando ciego a 22 slots** | **+4** |
| `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE` | Ya derivados (`Σ` sobre `CATEGORIES`) | **NADA** — se re-suman solos |
| Cruces `-300`+ en los 4 ficheros `fare` | Cero (espacio libre, D-43-22) | **3 slots / 9 variantes** |
| Quórum de los 4 magnets | Los 4 con ronda extra registrada, **incluido el 4º** (`fare-indefiniti-infinito-passato`, 3 pases con `deepseek-chat`) | **NADA** — solo verificar y declarar |
| Suite | `node --test tests/*.test.js` → **1026/1026** · `VAL_07_STRICT=1` → **1044/1044** | mantener verde |
| Motor | `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` → **2** | mantener |

**Dentro de scope:**
- `tests/fixtures/slot-variants-integration.test.js` — +4 entradas en `REAL_CATEGORIES` con `expected` dinámico.
- `scripts/run-validation-271.mjs` — +4 entradas en `CATEGORIES` con `slotCountOf`. Arrastra `TOTAL_EXPECTED` y el baseline-guard automáticamente.
- **Gate anti-ceguera NUEVO** (D-44-06) — test siempre activo que compara `content/categories.json` contra los arrays de conteo.
- `content/exercises/fare-indicativo.json` — **2 slots de cruce nuevos** (`-300`, `-301`), 3 variantes cada uno.
- `content/exercises/fare-indefiniti.json` — **1 slot de cruce nuevo** (`-300`), 3 variantes.
- **Corrección documental** de `.planning/ROADMAP.md` §Phase 44 (vía skill `gsd-phase`) y `.planning/REQUIREMENTS.md` (edición directa): 22 slots, 113 variantes, `TOTAL_EXPECTED` 250, **4 magnets**.
- `docs/09-VALIDATION-PROMPT.md` — declarar el 4º magnet y los gates G1-G3 de los cruces si el quórum los necesita para no dar falsos positivos.
- **Pasada de quórum TOP-LEVEL** sobre los 3 cruces (Opus + Sonnet, 1 ejercicio por contexto, VAL-03).
- **Gate de cierre** — reporter `250/250 PASS`, `VAL_07_STRICT=1` verde, `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` vacío, `grep -c` = 2.

**Fuera de scope:**
- **El motor v1.4 NO se toca.** Ni `src/screens/app.js` ni `src/domain/`. Sin call-sites nuevos de `applyImmediateFailure`.
- **Un 4º cruce imperativo ↔ congiuntivo** — la lista queda cerrada en 3 (D-44-05). Sigue diferido desde D-43-06.
- **Cruces para `fare-congiuntivo` y `fare-cond-imperativo`** — esas dos categorías se quedan sin cruce por decisión (D-44-01).
- **Slots o variantes nuevos del paradigma de `fare`** — los 22 slots están cerrados desde Phase 43.
- **Perífrasis y modismos de `fare`** — SCOPE-GATE HARD heredado de D-41-06, vigente en los 3 cruces sin excepción alguna (la de `facente` de D-43-18 es local al slot de participio presente y NO se extiende aquí).
- **Refactor de la infra de tests** para derivar los arrays de `categories.json` — evaluado y descartado (D-44-06).
- **Arreglar las discrepancias VAL-06 preexistentes** (`genero-numero`, `preposiciones`) — fuera de scope desde v1.9 (D-35-08 / D-40-12).
- **El archivado del milestone** (`/gsd-complete-milestone v2.0`) — es el paso siguiente a esta fase, no parte de ella.

</domain>

<decisions>
## Implementation Decisions

### Los cruces multi-categoría (INT-03)

- **D-44-01 (3 slots, alojados por contenido; 2 categorías `fare` se quedan sin cruce):** Exactamente los 3 que nombra el roadmap, cada uno en el fichero que el italiano pide:

  | id | `categoryIds` | Qué examina |
  |---|---|---|
  | `fare-indicativo-300` | `["fare-indicativo", "avere"]` | el auxiliar `avere` conjugado, con `fatto` escrito |
  | `fare-indicativo-301` | `["fare-indicativo", "presente-regolare"]` | el presente regular, con `faccio` escrito |
  | `fare-indefiniti-300` | `["fare-indefiniti", "modali"]` | el modal conjugado, con `fare` escrito |

  Queda `fare-indicativo` con 2 cruces, `fare-indefiniti` con 1, y **`fare-congiuntivo` y `fare-cond-imperativo` con cero**. Disco: **247 → 250 slots**. Se rechazó *4 slots (uno por categoría `fare`, repartiendo `↔avere` entre `abbia fatto`/`avrei fatto`)* porque la lista de INT-03 es cerrada y añadir un cruce solo para que cada unidad de reset toque a alguien es simetría, no contenido. Se rechazaron *6 slots en pares bidireccionales estilo Phase 31* (`presente-regolare-300/302`): duplica autoría y quórum en una fase que el roadmap describe como transversal y de bajo riesgo. — **Reversibility:** costly — quitar un cruce después exige borrar variantes ya validadas por quórum, y si el autor ya las ha fallado sus ids viven en `exerciseStats`.

- **D-44-02 (el cruce pregunta la casilla de la categoría VECINA; la forma de `fare` va escrita como contexto):** **Es la decisión que hace que el cruce valga algo.** El scout encontró que el sentido contrario duplicaría slots que ya existen:
  - `fare-indefiniti-infinito-presente` variante 3 ya es **literalmente `Io devo ___ il letto` → `fare`** (D-43-12 metió «tras modal» en su conjunto cerrado de contextos). Un cruce `↔modali` que pregunte `fare` es el mismo ejercicio otra vez con otra etiqueta.
  - `fare-indicativo-passato-prossimo` ya lleva `sono fatto` como distractora en 2 de 6 variantes → la elección de auxiliar ya se roza.
  - `fare-indicativo-presente` ya examina `faccio` con distractoras regularizadas inventadas (`faco`, `facio`).

  Invirtiendo el sentido (patrón `presente-regolare-302/303`, donde la forma compuesta va **escrita** y lo que se pregunta es la otra casilla) el solape es cero y **el segundo `categoryId` se gana de verdad**: el autor practica `avere`/`modali`/`presente-regolare` bajo la presión de un verbo irregular en el mismo enunciado. Forma de partida:

  ```
  fare-indicativo-300   "Io ___ fatto i compiti stamattina."       key: ho
  fare-indicativo-301   "Io faccio i compiti e tu ___ il lavoro."  key: el regular
  fare-indefiniti-300   "Io ___ fare il letto ogni mattina."       key: devo
  ```

  Se rechazó el sentido literal del roadmap («`fare ↔ avere` en los compuestos», key = forma de `fare`) por el solape de arriba, con riesgo de que el propio quórum lo marque redundante. Se rechazó el mixto (vecina en dos, `fare` en `↔presente-regolare`) porque el contraste irregular-vs-regular queda igual de examinado preguntando el regular con `faccio` delante. — **Reversibility:** costly — invertir el sentido reescribe las 3 explanations, los 3 pools de `options` y exige re-pase de quórum de los 3 slots.

- **D-44-03 (3 variantes por cruce = 9 variantes nuevas, eje = persona):** La media del proyecto (`modali-300` lleva 3, `presente-regolare-300` lleva 3). Los cruces son **bisagra, no bloque de paradigma** — el paradigma ya lo cubren los 22 slots del milestone, así que enumerar 6 personas aquí sería repetir. Cada slot muestrea 3 personas distintas. Se rechazaron 2 por cruce (el mínimo del motor, precedente `riflessivi-300`/`possessivi`/`dimostrativi`): con 3 el `pickVariantIndex` da más recorrido antes de repetir. Se rechazaron 6 por cruce: triplica el quórum de una fase de cierre.

- **D-44-04 (los 3 gates HARD, declarados en `notes` ANTES de autorar):** El riesgo de estos cruces no es doble validez *de forma* sino que la frase admita **otra respuesta defendible**, y eso se cierra con gates escritos antes de escribir, no con presupuesto de quórum (patrón D-42-06 / D-43-16).
  - **G1 — `fare-indicativo-300` ↔ `avere`:** `fatto` va escrito y es **SIEMPRE invariable** → **prohibido `lo`/`la`/`li`/`le`** en el enunciado (con pronombre objeto antepuesto la concordancia sería obligatoria y abriría segunda lectura; es D-43-16 aplicado al revés). Las 4 `options` son formas conjugadas de `avere` más `essere` como distractora de auxiliar; **ninguna forma de `fare` entra en `options`** (gate grep-verificable).
  - **G2 — `fare-indicativo-301` ↔ `presente-regolare`:** **sujeto pronominal explícito en las DOS cláusulas** (D-41-07) y **un solo verbo regular candidato**, fijado sin ambigüedad por el objeto literal del conjunto cerrado. Las 4 `options` son **4 personas del MISMO verbo regular**, nunca verbos distintos — si el pool mezcla verbos, más de uno es defendible.
  - **G3 — `fare-indefiniti-300` ↔ `modali` (el más delicado):** `devo`/`posso`/`voglio` son **intercambiables en frases genéricas**. El marco tiene que **excluir dos de los tres** con un complemento explícito (obligación / permiso / voluntad), igual que el vocativo de D-43-05 desambigua el destinatario. Las 4 `options` son formas conjugadas de modales; **ninguna forma de `fare`**.

  Los 3 heredan el **SCOPE-GATE HARD del objeto literal** (D-41-06: `i compiti` / `un errore` / `il lavoro` / `una torta` / `il letto` / `tutto` / `una foto`) sin excepción, el **gloss ES** donde desambigua sin filtrar la respuesta (D-42-13, `[[gloss_es_desambiguacion_canon]]`) y el **canon editorial** de D-43-21.

- **D-44-05 (la lista de cruces queda CERRADA en 3 — el imperativo ↔ congiuntivo no entra):** D-43-06 lo dejó como «candidato a cruce multi-categoría de Phase 44» y aquí se resuelve que **no**. El argumento de D-43-06 sigue intacto: `faccia`/`facciamo`/`facciano` son key de `fare-congiuntivo` **y** forma real del imperativo formal, así que si el marco no excluye limpiamente una de las dos lecturas la variante tiene dos respuestas defendibles → `disputed` **sticky** → reset de la categoría entera por la cascada D-54. Se rechazó *entrar con marco blindado* (vocativo obligatorio vs subordinada con `che`): el blindaje es exactamente el trabajo fino que D-43-06 evaluó y decidió no pagar, y meterlo en la fase de cierre es el peor momento. Se rechazó *reforzar solo la explanation*: la explanation del slot de imperativo **ya** enseña la homografía por D-43-06, así que no habría nada que añadir. Se queda en `Deferred` como candidato v2.1+.

### Sincronía de counts (INT-02)

- **D-44-06 (append de 4 + gate anti-ceguera NUEVO; sin refactor de la infra):** Los 2 arrays que faltan ganan sus 4 entradas con `expected` **dinámico** (`slotCountOf(file)` en el reporter, `readJson(...).exercises.length` en el back-compat) — D-31-06, nunca número mágico. `TOTAL_EXPECTED` y `TOTAL_EXPECTED_BASELINE` se re-suman solos porque ya son `Σ` sobre `CATEGORIES`.

  **Además, un gate nuevo:** el problema de fondo no es el append —son 8 líneas— sino que **el reporter lleva desde Phase 41 emitiendo `225/225 PASS` estando ciego a 22 slots, y nada lo detectó**. Es el mismo modo de fallo que v1.7 documentó con `presente-regolare` («ausente de los 3 count arrays hasta aquí, lockstep diferido por diseño»). El gate lee `content/categories.json` y **falla si alguna categoría registrada no aparece** en los arrays de conteo, haciendo estructuralmente imposible que v2.1 vuelva a quedarse ciega.

  Se rechazó *solo el append* (espejo literal de Phase 39): acepta que la próxima alta dependa de que alguien se acuerde, y ya falló dos veces. Se rechazó *derivar los arrays enteros de `categories.json` con tabla de overrides*: los 9 `expected` literales que quedan (`preposiciones` 50, `essere` 26, `articoli` 34…) **SÍ muerden** hoy —protegen contra ejercicios borrados o duplicados— y derivar todo los convertiría en tautología; además es un cambio de diseño de la infra de tests, más superficie de la que pide una fase «transversal y de bajo riesgo».

- **D-44-07 (el gate vive en la SUITE, siempre activo, y va por source-assert):** Fichero de test nuevo (o `describe` en `tests/exercise-types.test.js`) que corre en cada `node --test tests/*.test.js` **sin flag** — rompe la suite en rojo el día que alguien registre una categoría y no la enganche. Es donde el proyecto ya pone sus invariantes permanentes.

  **Restricción de implementación descubierta en el scout, no negociable:** los dos arrays **no son importables**. `REAL_CATEGORIES` es un `const` **dentro del callback de un `describe`** en `tests/fixtures/slot-variants-integration.test.js`; y `scripts/run-validation-271.mjs` hace `process.exit(1)` al cargarse si detecta incoherencia, así que importarlo desde un test es una bomba. → El gate lee el **texto fuente** de los dos ficheros y extrae los slugs por regex, que es el **patrón source-assert que el proyecto ya usa** en `tests/exercise-types.test.js` para `src/screens/app.js` (`const APP_SRC = readFileSync(...)`). Cero refactor, cero export nuevo, cero riesgo de romper la suite al cargar.

  Se rechazó *ponerlo en el reporter con `exit 1`*: el reporter es un gesto manual del autor, así que la ceguera podría durar meses (y duró tres fases). Se rechazó *ponerlo en los dos sitios*: redundancia que hay que mantener dos veces para el mismo criterio.

### Cierre honesto: los documentos describen la realidad (INT-04 y el gate del milestone)

- **D-44-08 (se CORRIGEN `ROADMAP.md` y `REQUIREMENTS.md` como parte de la fase):** Un criterio de éxito que miente no se puede verificar, y D-43-17 lo dejó escrito literalmente («Phase 44 tiene que recogerlo, o su SC#4 quedará describiendo un estado que no es el real»). Correcciones exactas:

  | Documento | Dice | Debe decir |
  |---|---|---|
  | ROADMAP §Phase 44 SC#2 | «225 → 225 + los 21 slots nuevos» | **22** slots nuevos; **247** en disco tras Phase 43; **250** con los 3 cruces |
  | ROADMAP §Phase 44 SC#4 | «≈107 variantes … los 3 magnets» | **113** variantes; **4** magnets |
  | ROADMAP §Phase 44 SC#3 | lista de 3 cruces sin ids | los ids concretos y el sentido de D-44-02 |
  | REQUIREMENTS INT-02 | «los 3 arrays hardcoded» | **2** arrays (los otros los engancharon 41/42/43) + el gate anti-ceguera |
  | REQUIREMENTS INT-03 | «↔ `verbi-modali`» | el slug real es **`modali`**, no `verbi-modali` |
  | REQUIREMENTS INT-04 | 3 magnets | **4** — añadir el par `aver fatto` / `avere fatto` (D-43-17) |
  | ROADMAP §v2.0 (cabecera y pie) | «21 slots ≈ 107 variantes» | **22 slots / 113 variantes** |

  **Aviso de proceso vinculante:** `ROADMAP.md` **NO se edita con Write/Edit** — anti-pattern #15 de GSD. Va por el skill **`gsd-phase`** (CRUD de fases del roadmap). `REQUIREMENTS.md` sí admite edición directa. Se rechazó *documentar la divergencia solo en VERIFICATION.md*: obliga al verifier a leer prosa en vez de comprobar un criterio. Se rechazó *corregir los números pero dejar los magnets en VERIFICATION*: el 4º magnet **ya tiene su ronda extra ejecutada y registrada** en disco, así que declararlo en INT-04 es describir lo que hay, no ampliar el requisito.

- **D-44-09 (el gate del motor se toma contra la BASE del milestone, con el scope acotado de SC#3):** **Verificado en vivo el 2026-08-11:**

  ```
  BASE = 0a9a2e5  "docs: create milestone v2.0 roadmap (5 phases)"   ← padre del 1er commit de Phase 40

  git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/      →  VACÍO  ✓
  grep -c 'applyImmediateFailure(this.state' src/screens/app.js  →  2      ✓
  ```

  Un diff contra `HEAD~1` sale vacío siempre y **no probaría nada** — sería un gate vacuo. El claim del milestone («motor v1.4 NO tocado») es sobre las 5 fases, así que la referencia tiene que ser la base de v2.0.

  **TRAMPA QUE EL PLANNER TIENE QUE EVITAR:** contra esa base **`src/data/` NO sale vacío, y es correcto**. Phase 40 metió `migrate12to13`/`hydrateV13` en `storage.js` (+189 líneas) y tocó `backup.js`; Phase 42 amplió `validation-state.js` con `by:"autor"` + `override:true`. **SC#3 nombra literalmente solo `src/screens/app.js` y `src/domain/`** — el scope está bien acotado. El `notes` de Phase 43 dice «`git diff src/screens/app.js src/domain/ src/data/` debe quedar vacío», que era cierto **por fase** y es **falso por milestone**: si alguien copia esa línea al gate de cierre, falla por diseño.

- **D-44-10 (2 plans secuenciales: counts+docs PRIMERO, cruces DESPUÉS):**

  ```
  44-01  counts + gate anti-ceguera + docs   →  reporter 247/247 PASS   (verde honesto)
  44-02  3 cruces (9 variantes, pending)     →  reporter 247/250 ROJO   (rojo honesto, esperado)
           ↓
  quórum TOP-LEVEL Opus+Sonnet — 3 ejercicios, 1 por contexto (VAL-03)
           ↓
  gate de cierre: reporter 250/250 PASS + VAL_07_STRICT verde + diff motor vacío + grep = 2
  ```

  El orden importa por **honestidad del marcador**: con los counts primero el reporter deja de mentir de inmediato, y el rojo que provocan los cruces `pending` es un rojo que **dice la verdad**. Con el orden inverso el reporter seguiría diciendo `225/225 PASS` durante todo el primer plan. El argumento del roadmap («los counts solo pueden derivarse del disco cuando los JSON son definitivos») **no aplica aquí** porque los `expected` son dinámicos: siguen al disco solos.

  **Waves distintas, no paralelo** — 44-02 añade slots que 44-01 tiene que contar. Se rechazó *1 plan único* (pese a `granularity: coarse`): mezcla trabajo mecánico con autoría de contenido en un solo commit atado, y el rojo intermedio dejaría de ser legible.

- **D-44-11 (el quórum base va en pasada TOP-LEVEL, no dentro del executor):** Invariante heredado de D-41-15 / D-42-04 / D-43-02 y de `[[executor_cannot_run_task_quorum]]`: `gsd-executor` no puede spawnear los Task subagents del skill `gsd-validate-exercise`, así que los 3 cruces cierran 44-02 en `validation.status: "pending"` y el quórum Opus+Sonnet se estampa después, **un ejercicio por contexto fresco, NUNCA batched (VAL-03)**. `deriveStatus` exige ≥2 pases `correcta` con `by` distintos y cero `incorrecta`. Sin ronda extra cross-vendor (D-44-04 pone la red en los gates).

- **D-44-12 (heredados de Phases 40-43, sin re-discutir):** slugs de D-40-01/02 inviolables · **convención de ids de cruce `-300`+** con prefijo byte a byte del slug (D-40-07, D-41-14; ojo a D-40-03: `fare-indicativo` y `fare-indefiniti` comparten el prefijo `fare-ind`, así que toda comprobación declara el slug completo, nunca truncado) · nacen en **slot+variantes**, nunca legacy payload · **MC-only** con 0-match y 0-word-buttons declarados como decisión-no-omisión (D-41-13, DESIGN RULE D-04) · **blacklist con audit trail y escaneo POR CAMPO** sobre `prompt` y `options`, nunca sobre el fichero completo (D-42-11) · **canon editorial**: español acentuado RAE (`[[explanations_must_be_accented]]` — un flag C4-accent sobre español sin tildes es bug REAL, se arreglan los acentos, NO se hace override), apóstrofes ASCII U+0027, plain text sin markdown, italianismos en ortografía italiana, sin leak R1, sin smart-quotes · **las 3 prohibiciones de una explanation** (`[[explanations_tres_prohibiciones]]`) y **no afirmar «agramatical»** (`[[explanations_no_afirmar_agramatical]]`) · toda excepción nueva a R1-R7 va escrita en `docs/09-VALIDATION-PROMPT.md`, **no solo en el `notes`** (`[[exception_belongs_in_validation_prompt]]`: el subagent del quórum no ve el `notes`).

### Claude's Discretion

- **Redacción concreta de las 9 variantes y de las 3 explanations**, dentro de D-44-02 y los gates G1-G3.
- **Qué 3 personas muestrea cada cruce** y qué objeto literal del conjunto cerrado lleva cada frase.
- **Qué verbo regular concreto** examina `fare-indicativo-301` (del paradigma de `presente-regolare`: `-are`/`-ere`/`-ire`/`-isc-`/velar/palatal) y qué complemento excluye dos de los tres modales en `fare-indefiniti-300`.
- **Si `fare-indicativo-300` usa el passato prossimo o algún otro compuesto** como marco — cualquiera sirve mientras `fatto` quede invariable (G1).
- **Ubicación exacta del gate anti-ceguera** (fichero propio vs `describe` en `tests/exercise-types.test.js`) y la forma del regex del source-assert.
- **Nombres y estructura de los gates de test** de los 3 cruces, clonando `tests/content-fare-indicativo.test.js` / `tests/content-fare-congiuntivo.test.js`, siempre que congelen como invariantes permanentes: `categoryIds.length === 2` con los ids exactos, 3 variantes por cruce, **ninguna forma de `fare` en `options`** (G1/G3), **4 personas del mismo verbo regular** (G2), **ausencia de `lo`/`la`/`li`/`le`** en los prompts de `-300` (G1), sujeto explícito en las dos cláusulas (G2), y SCOPE-GATE léxico.
- **Cómo se redacta el `notes`** de los dos ficheros para incorporar los 3 cruces sin reescribir lo que ya declaran (append de un bloque, no re-edición).
- **Si el gate de cierre se ejecuta como parte de 44-02 o como paso de verificación de fase.**

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos, criterios y el diseño del milestone
- `.planning/ROADMAP.md` §Phase 44 — Goal + los **4 Success Criteria** que la verificación comprueba literalmente. **Ojo: SC#2 y SC#4 contienen números desfasados que esta fase corrige (D-44-08).** También §Phase 43 (los knock-on que dejó) y §v2.0 (cabecera y pie del milestone).
- `.planning/REQUIREMENTS.md` — **INT-01..INT-04** (líneas 57-60) y §nota de mapeo (línea 118: por qué INT-01..04 van a Phase 44 y por qué INT-03 va al final). **INT-03 escribe `verbi-modali`; el slug real es `modali`.** **INT-04 declara 3 magnets; son 4.**
- `.planning/todos/pending/fare-paradigma-completo.md` — documento de diseño **FARE-X1** (2026-07-27): la tabla de las 4 categorías, la categoría como unidad de reset, y §Trampas. Se cierra cuando cierre v2.0.

### Los precedentes de fase de integración (los moldes directos)
- `.planning/milestones/v1.9-phases/39-prov-01-integraci-n-lockstep-cierre-v1-9/39-01-PLAN.md` y `39-02-PLAN.md` — **el espejo más cercano**: cómo Phase 39 hizo el append de 4 categorías + PROV-01. **No tiene CONTEXT.md** (esa fase se planificó sin discuss).
- `.planning/milestones/v1.9-phases/39-prov-01-integraci-n-lockstep-cierre-v1-9/39-VERIFICATION.md` — la forma del gate de cierre de un milestone en este proyecto.
- `content/exercises/presente-regolare.json` — **el molde LITERAL de los cruces de D-44-02.** `presente-regolare-300/301` (key en la categoría vecina) y `-302/-303` (key en la propia, con el compuesto ya escrito como contexto). Phase 44 usa la forma de `-302/-303` invertida. Ojo también al **gloss ES entre paréntesis** en los prompts.
- `content/exercises/modali.json` → `modali-300` (`["modali","presente-regolare"]`, 3 variantes) y `content/exercises/riflessivi.json` → `riflessivi-300/301` — los cruces baratos de v1.9.
- `content/exercises/avere.json` → `avere-300..305` y `content/exercises/essere.json` → `essere-300..305` — los cruces legacy de 1 variante (v1.0/v1.2); **NO son el molde**, la fase actual nace en slot+variantes.

### Los ficheros que esta fase modifica
- `scripts/run-validation-271.mjs` líneas **165-215** — `slotCountOf`, el array `CATEGORIES` (14 entradas, 9 con literal + 5 dinámicas), `TOTAL_EXPECTED` (`reduce`), y el bloque del `TOTAL_EXPECTED_BASELINE` con su `process.exit(1)`. **Ese `exit(1)` al cargarse es la razón de que el gate anti-ceguera vaya por source-assert (D-44-07).**
- `tests/fixtures/slot-variants-integration.test.js` líneas **160-225** — `REAL_CATEGORIES` (14 entradas) **dentro del callback de un `describe`** → no importable.
- `tests/exercise-types.test.js` líneas **1330-1345** (`CATEGORIES_WITH_EXPLANATIONS`, ya completo con las 4 `fare-*`), **1480-1522** (el smoke paramétrico `VAL_07_STRICT`, ya cubre las 4), y **~1535** (`const APP_SRC = readFileSync(...)`: el **patrón source-assert** a clonar para el gate anti-ceguera).
- `content/exercises/fare-indicativo.json` — 8 slots / 48 variantes, todas `validated`. Recibe `-300` y `-301`. Contiene ya `sono fatto` como distractora en `passato-prossimo` (relevante para G1) y `faco`/`facio` en `presente` (relevante para D-44-02).
- `content/exercises/fare-indefiniti.json` — 6 slots / 18 variantes. Recibe `-300`. **Contiene ya `Io devo ___ il letto`** en `infinito-presente` — el solape que motiva D-44-02.
- `content/categories.json` — 18 entradas verificadas (order 15-18 con `origen: "ia-quorum"`). **INT-01 ya está cumplido; esta fase solo verifica.**

### Las decisiones que esta fase hereda (contratos vivos)
- `.planning/phases/43-fare-cond-imperativo-fare-indefiniti-3-6-slots/43-CONTEXT.md` — **el ref más importante.** §`Deferred` nombra explícitamente los cuatro encargos para Phase 44 (el 4º magnet, los números cerrados, los cruces `-300`+, el sync de counts). D-43-16 (gate del pronombre → base de G1), D-43-17 (**el 4º magnet**), D-43-06 (por qué el imperativo↔congiuntivo no entra → D-44-05), D-43-21 (canon editorial), D-43-22 (los heredados).
- `.planning/phases/42-fare-congiuntivo-4-slots-hom-grafas-disparador/42-CONTEXT.md` — D-42-01 (la divergencia 21→22 slots que D-44-08 corrige), D-42-06 (gate HARD sistemático antes de escribir → base de G1-G3), D-42-11 (blacklist con escaneo por campo), D-42-13 (gloss léxico donde desambigua).
- `.planning/phases/41-fare-indicativo-8-slots-el-bloque-grande/41-CONTEXT.md` — **D-41-06** (SCOPE-GATE HARD del objeto literal, vigente en los 3 cruces sin excepción), **D-41-07** (pronombre sujeto explícito → base de G2), **D-41-09/10** (patrones fijos de distractoras), D-41-13 (MC-only), D-41-14 (ids semánticos), D-41-16 (registro en `categories.json`).
- `.planning/phases/40-migraci-n-12-13-reset-selectivo-preventivo-de-las-4-categor-/40-CONTEXT.md` — **D-40-01/02** (los 4 slugs, inviolables), **D-40-03** (gate de colisión de prefijo: `fare-ind` es ambiguo entre `fare-indicativo` y `fare-indefiniti` → declarar siempre el slug completo), **D-40-07** (convención de ids de cruce `-300`+, **vinculante para esta fase**).

### El motor que NO se toca (y cómo se demuestra)
- `src/screens/app.js` → `applyImmediateFailure` — **EXACTAMENTE 2 call-sites**, grep-verificable. `categoriesForDisplay` itera `content.categories` en orden de array → las 18 filas salen sin código nuevo.
- `src/domain/session.js` → `pickVariantIndex` (línea 232) — sirve los slots de cruce sin una línea nueva.
- `src/data/storage.js:1345` → `RESET_PREFIXES_V13 = ['fare-indicativo','fare-congiuntivo','fare-cond-imperativo','fare-indefiniti']` y el comentario de las líneas 1306-1312. **Esta fase no lo toca**; solo confirma que los ids de cruce llevan el prefijo correcto para que el reset los alcance.
- `schema-validator.js` — exige que todo valor de `categoryIds` referencie una categoría conocida. Los cruces referencian `avere`, `modali` y `presente-regolare`, las tres ya registradas → sin prerequisito nuevo.
- **Commit base del gate:** `0a9a2e5` (`docs: create milestone v2.0 roadmap (5 phases)`), padre de `639156f` (primer commit de Phase 40).

### Infra y canon de validación por quórum
- `docs/VALIDACION-QUORUM.md` — el invariante no negociable: `deriveStatus(passes)` exige **≥2 pases `correcta` con `by` DISTINTOS y cero `incorrecta`** para `validated`; cualquier `incorrecta` → `disputed` **sticky**; **VAL-03: 1 ejercicio por contexto, NUNCA batched**.
- `docs/09-VALIDATION-PROMPT.md` — criterios C1-C5 y **las excepciones declaradas a R1-R7**. Toda excepción o gate nuevo de esta fase va escrito aquí, no solo en el `notes`.
- Skill `gsd-validate-exercise` — la vía canónica (Opus + Sonnet, 1 subagent fresh por ejercicio). **No disponible dentro del executor** → D-44-11.
- `src/data/validation-state.js` → `deriveStatus(passes)`; admite `by:"autor"` + `override:true` (Phase 42).
- `scripts/validate-ai-pass.mjs` — refuerzo cross-vendor (Gemini/DeepSeek, auto-fallback en 429, `--write`); claves en `.env`. **No se usa en esta fase** (D-44-04), disponible si el quórum base deja algo `disputed`.

### Regla de proyecto y de workflow
- `CLAUDE.md` — stack (web estática, ES modules, contenido en JSON editado a mano, interfaz en español).
- **Anti-pattern #15 de GSD:** `ROADMAP.md` y `STATE.md` **no se mutan con Write/Edit**. El roadmap se edita por el skill **`gsd-phase`**; el state por los handlers de `gsd-tools query`. `REQUIREMENTS.md` sí admite edición directa.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`content/exercises/presente-regolare.json` (`-300`..`-303`)** — el molde literal de los cruces. `-302`/`-303` son la forma exacta que D-44-02 invierte: el compuesto va escrito en el enunciado (`Ieri ho parlato spagnolo, ma di solito io ___ italiano`) y lo que se pregunta es la otra casilla. Incluye el gloss ES entre paréntesis.
- **`content/exercises/modali.json` → `modali-300`** — cruce de 3 variantes con `categoryIds` de 2, el volumen que D-44-03 adopta.
- **`tests/content-fare-indicativo.test.js` y `tests/content-fare-congiuntivo.test.js`** — moldes de los gates de test, con el patrón de **escaneo por campo** (`prompt`/`options`, nunca el fichero entero).
- **`tests/exercise-types.test.js` ~1535** — `const APP_SRC = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8')` seguido de `assert.match(body, /…/)`: el **patrón source-assert** que el gate anti-ceguera clona para leer los dos arrays no importables.
- **`slotCountOf`** ya existe con implementaciones gemelas en `scripts/run-validation-271.mjs:171` y `tests/exercise-types.test.js:1335`; `readJson(...).exercises.length` es el equivalente en `slot-variants-integration.test.js`. Añadir una categoría es **1 línea por array**, cero código nuevo.

### Established Patterns
- **`expected` DINÁMICO, nunca número mágico** (D-31-06) — toda entrada nueva de un array de conteo deriva del JSON en disco.
- **Nace en slot+variantes, NUNCA legacy payload** (v1.7 / Phases 36-38, 41-43).
- **DESIGN RULE D-04:** `match` solo si el pareo NO es derivable → 0-match en los 3 cruces.
- **Decisión-de-omisión documentada en `notes`** — aquí: por qué `fare-congiuntivo` y `fare-cond-imperativo` no llevan cruce, y por qué el sentido del cruce está invertido.
- **Regla de las formas atestiguadas y de las LECTURAS** (ratificada 2026-08-03): si una distractora candidata es forma italiana atestiguada **o es defendible como correcta en ese contexto**, no entra en `options` — entra en la blacklist con su audit trail. En esta fase muerde en G3 (`devo`/`posso`/`voglio` intercambiables) y en G2 (verbos regulares distintos en el mismo pool).
- **Gate declarado ANTES de escribir, quórum como red y no como mecanismo** (D-42-06, D-43-16) — es todo D-44-04.
- **Quórum 1-por-1 con fresh context, NUNCA batched** (VAL-03), en pasada top-level.

### Integration Points
- `content-loader.js` → `loadContent()`: los 3 cruces se cargan con sus ficheros, sin cableado nuevo.
- `src/screens/app.js` → `categoriesForDisplay`: itera `content.categories` → las 18 filas ya aparecen en home/picker/Repaso/Examen **sin código nuevo** (INT-01 ya cumplido).
- `src/domain/session.js` → `pickVariantIndex`: sirve las 3 variantes de cada cruce gratis.
- **Cascada D-54:** con `categoryIds` de 2, fallar `fare-indicativo-300` resetea `fare-indicativo` **y `avere` entera (20 slots)**. Es el Core Value funcionando, igual que hoy con `presente-regolare-300`. **Sin call-sites nuevos** — `applyResultToSession` ya propaga sobre todos los `categoryIds`.
- **Motor intacto.** Sampler, cascada, promociones, racha, migración y backup: nada se toca.

### Estado verificado del codebase (2026-08-11)
- `CURRENT_SCHEMA_VERSION` = **13**; los 4 slugs ya en `RESET_PREFIXES_V13`.
- **18 categorías registradas / 247 slots en disco** (225 legacy + 8 + 5 + 3 + 6). 113 variantes nuevas del milestone (48 + 30 + 17 + 18).
- **Suite verde:** `node --test tests/*.test.js` → **1026 pass / 0 fail**. `VAL_07_STRICT=1` → **1044 pass / 0 fail**. (Ojo `[[test_command_node_glob]]`: el path desnudo falla en Node 22.20 — usar el glob.)
- **Reporter ciego:** `node scripts/run-validation-271.mjs` → `VAL-06 (225/225 validated) PASS`, `VAL-08 PASS`, `VAL-04 PASS`, `Milestone gate PASS` — **mintiendo sobre 22 slots**, y encima imprime «si OK: `/gsd:complete-milestone v1.1`».
- **Los 22 slots de `fare` están `validated`**, con los 4 magnets cubiertos por ronda extra: `fare-cond-imperativo-imperativo` (4 pases, `deepseek-chat` + `autor`), los 4 slots de `fare-congiuntivo` (3-4 pases con `deepseek-reasoner`), `fare-indefiniti-participio-passato` (**5 pases**: Opus, Sonnet, DeepSeek, Gemini, autor) y `fare-indefiniti-infinito-passato` (3 pases con `deepseek-chat`) — **el 4º magnet ya tiene su red puesta**.
- Cruces `-300`+ existentes en el corpus: `avere` 6, `essere` 6, `articoli` 6, `presente-regolare` 4, `possessivi` 2, `riflessivi` 2, `dimostrativi` 1, `modali` 1. **Cero en los 4 ficheros de `fare`.**
- `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` → **vacío**. `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` → **2**.

</code_context>

<specifics>
## Specific Ideas

- **El hallazgo que decide el diseño de los cruces: `Io devo ___ il letto` YA EXISTE.** Está en `fare-indefiniti-infinito-presente`, variante 3, byte a byte lo que sería un cruce `↔modali` ingenuo. D-43-12 metió «tras modal o verbo de percepción» en su conjunto cerrado de contextos y nadie lo conectó con INT-03. Si el planner escribe el cruce en el sentido literal del roadmap, produce un duplicado — y el quórum lo marcará, con razón.
- **El cruce solo se gana su segundo `categoryId` si la key vive en la categoría vecina.** Preguntar `fatto` en `fare-indicativo-300` sería `fare-indicativo-passato-prossimo` otra vez; preguntar `ho` es genuinamente `avere`. Es el mismo razonamiento con que Phase 31 escribió `-302`/`-303`.
- **G3 es el gate más delicado de la fase, y es fácil de subestimar.** `Io ___ fare il letto ogni mattina` admite `devo`, `posso` y `voglio` los tres — el complemento tiene que excluir dos. Es el análogo exacto del vocativo de D-43-05 y del pronombre de D-43-16: un fallo sistemático que la autoría cometería por inercia.
- **El reporter lleva TRES FASES emitiendo un PASS que miente.** No es un descuido de Phase 43: es el mismo lockstep-diferido que v1.7 ya documentó con `presente-regolare`. Por eso el gate anti-ceguera no es adorno — es la única pieza de esta fase que impide la tercera repetición.
- **El gate del motor tiene que apuntar a `0a9a2e5`, no a `HEAD~1`.** Un diff contra el commit anterior sale vacío siempre. Y el scope es **solo** `src/screens/app.js` + `src/domain/`: `src/data/` cambió legítimamente (migración de Phase 40, `by:"autor"` de Phase 42) y meterlo en el gate lo revienta.
- **La línea del `notes` de Phase 43 que dice «`git diff … src/data/` vacío» era cierta por fase y es falsa por milestone.** Copiarla al gate de cierre es el error más probable del planner.
- **`fare-indicativo` y `fare-indefiniti` comparten el prefijo `fare-ind`** (D-40-03). Los ids de cruce se declaran completos: `fare-indicativo-300`, nunca `fare-ind*`.
- **`INT-03` escribe `verbi-modali` pero el slug real es `modali`.** Si el `categoryIds` lo copia literal, `schema-validator.js` rechaza el fichero.
- **El 4º magnet ya está cubierto en disco.** `fare-indefiniti-infinito-passato` tiene 3 pases incluido `deepseek-chat`. INT-04 no pide trabajo nuevo de quórum sobre los 22 slots — pide **declarar** lo que ya se hizo.
- **Los cruces heredan el SCOPE-GATE de D-41-06 SIN excepción.** La excepción de `facente funzione` (D-43-18) es local al slot de participio presente y no se extiende a `-300`/`-301`.

</specifics>

<deferred>
## Deferred Ideas

- **Cruce imperativo ↔ congiuntivo** (`fare-cond-imperativo-300` con `categoryIds` `["fare-cond-imperativo","fare-congiuntivo"]`) — evaluado en D-44-05 y descartado por segunda vez (la primera fue D-43-06). Pedagógicamente es el contraste más valioso del milestone; exige un gate HARD de marco (vocativo obligatorio vs subordinada con `che`) y ronda extra de quórum. Candidato a v2.1+, no a la fase de cierre.
- **Cruces para `fare-congiuntivo` y `fare-cond-imperativo`** — las dos categorías se quedan sin cruce (D-44-01). Si el autor los echa en falta, son slots nuevos con el mismo patrón, no rediseño.
- **Pares bidireccionales estilo Phase 31** (`-302`/`-303`: un cruce que pregunte la forma de `fare` con la vecina de contexto) — descartados en D-44-01/02 por solape con los 22 slots existentes. Si el solape se resolviera con marcos suficientemente distintos, es contenido nuevo.
- **Derivar los arrays de conteo de `categories.json`** con tabla de overrides para los 9 `expected` literales — evaluado en D-44-06 y descartado por superficie. El gate anti-ceguera (D-44-07) cubre el modo de fallo real sin tocar la infra.
- **Unificar las tres implementaciones gemelas de `slotCountOf`** (reporter, `exercise-types`, `slot-variants-integration`) en un helper compartido — no es de esta fase; el proyecto convive con ellas desde v1.7.
- **`PROV-X1` — procedencia por-slot o por-variante** — diferido desde v1.9. Los cruces nuevos nacen dentro de ficheros con `origen: "ia-quorum"` a nivel de categoría, que basta.
- **Arreglar las discrepancias de conteo VAL-06 preexistentes** (`genero-numero`, `preposiciones`) — fuera de scope desde v1.9 (D-35-08), sigue fuera (D-40-12).
- **Partir `fare-indicativo` en semplici/composti** — riesgo asumido en REQUIREMENTS.md §Future; vigilarlo tras las primeras semanas de uso. **Los cruces `-300`/`-301` viven ahí, así que una partición futura tendría que decidir a qué mitad van.**
- **Mismo patrón para `andare` / `venire` / `dire`** — REQUIREMENTS.md §Future, candidatos a v2.1+.
- **Perífrasis y modismos de `fare`** (`fare la spesa`, `fa freddo`, `farcela`, causativo) — Out of Scope del milestone, categoría propia (`fare-modismi`) si el autor lo echa en falta.
- **Responsive móvil completo** — backlog propio desde v1.8.
- **El archivado del milestone** — `/gsd-complete-milestone v2.0` es el paso siguiente a esta fase. **El texto final del reporter dice «si OK: `/gsd:complete-milestone v1.1`»** (string obsoleto desde v1.1); actualizarlo es cosmético y opcional.

### Reviewed Todos (not folded)
- **"FARE-X1 — paradigma completo del verbo `fare`"** (`area: content`, feature, score 0.6) — es el documento de diseño del milestone **entero**, no un todo consumible por Phase 44. Registrado como canonical ref. **Se cierra al archivar v2.0**, no en esta fase. Mismo tratamiento que en Phases 40-43.
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, minor, score 0.9) — falso positivo del matcher (puntúa alto por palabras basura: `del`, `home`, `phase`). Es CSS responsive, ajeno a una fase de counts y contenido JSON. Descartado igual en Phases 35, 40, 41, 42 y 43.
- **"decoyBank.pos con varias categorías por token"** (`area: content-pipeline`, minor, score 0.6) — DECOY-X1, pipeline de canciones. Sin relación con los cruces de ejercicios; el autor ya decidió aceptar el `disputed` (opción A, 2026-07-27) hasta que el patrón reaparezca.

</deferred>

---

*Phase: 44-Integración lockstep + cierre v2.0*
*Context gathered: 2026-08-11*
