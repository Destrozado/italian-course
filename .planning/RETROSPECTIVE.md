# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.3 — Canciones (bloque de traducción)

**Shipped:** 2026-06-02
**Phases:** 2 (13-14) | **Plans:** 3 | **Sessions:** ~1 día (2026-06-02)

### What Was Built
- Bloque "Canciones" standalone (6º `currentScreen`) con listado + estado pasada/fallada por canción persistido en localStorage; pantallas dedicadas `cancion`/`cancion-summary`.
- Playthrough secuencial it→es reutilizando word-buttons en dirección inversa, feedback verde/rojo, resumen post-canción (frases falladas + impacto en categorías), cascada D-54 por frase reusando `applyResultToSession` (0 nuevos call-sites de `applyImmediateFailure`).
- Modelo de datos: schema de canción + `validateSongs` export separado, `migrate4to5`/`hydrateV5` deep-clone, `backup.js` extendido a v5; frases sin categoría soportadas (preparado para CATPROC).
- Primera canción real "Equilibrio mentale — Ultimo" (17 frases) autorada con validación ligera autor-oráculo (NO quórum R1-R7).

### What Worked
- **Brownfield disciplinado:** la decisión "reutilizar el engine, NO reconstruir" se mantuvo end-to-end — el playthrough cae sobre `applyResultToSession` con un único call-site, evitando duplicar la mecánica de cascada (Pitfall #2 prevenido arquitectónicamente).
- **Slice vertical temprano:** Phase 13 entregó "jugar una mini-canción" completa antes de cargar contenido real, dejando Phase 14 como puro contenido sobre maquinaria ya verificada.
- **UAT humano cazó un bug real:** verificar la canción real en navegador (Phase 14) reveló `bankWithKeys` vacío en modo canción — un bug del MOTOR pre-existente que los tests automáticos no cubrían porque ninguna canción se había jugado de verdad hasta entonces.

### What Was Inefficient
- **Verificación humana de Phase 13 quedó colgada:** los 5 escenarios de `13-HUMAN-UAT.md` (cascada desde frase, PLAY-05, LINK-04) nunca se cerraron formalmente; quedaron cubiertos por tests automáticos + el UAT de Phase 14, pero el estado `human_needed` persistió hasta el cierre del milestone (acknowledged como deferred).
- **El bug `bankWithKeys` se descubrió tarde:** apareció solo al jugar la canción real en Phase 14, no en la mini-canción de Phase 13 — señal de que un UAT de playthrough real debería haberse forzado antes del cierre de Phase 13.

### Patterns Established
- **Bloque nuevo sobre engine existente:** un modo de ejercicio completamente nuevo (traducción) reutiliza cascada D-54 + word-buttons `grade()` + schema-validator + patrón Test-completo sin tocar la mecánica de re-verificación. Validator del bloque como export SEPARADO (no extiende `PAYLOAD_VALIDATORS`) cuando el bloque es standalone.
- **Estado simple para contenido no-graduado:** `{status, lastPlayedAt}` plano para canciones vs el modelo dominada/racha/21-day de categorías — no todo el contenido necesita la maquinaria completa de re-verificación.
- **Validación ligera autor-oráculo:** para contenido "particular" por diseño (traducción artística), 1 pase IA + autor como oráculo, NO el quórum gramatical estricto que produciría falsos positivos.

### Key Lessons
1. Cuando un modo nuevo aísla un campo del engine (`sessionCurrentExercise=null` por LINK-04), auditar TODOS los call-sites que leían ese campo — `bankWithKeys` lo asumía non-null y rompía silenciosamente.
2. Un UAT de "jugar el contenido REAL de principio a fin" debe ser gate de cierre de la fase de maquinaria, no diferirse a la fase de contenido — ahí es donde aparecen los bugs de integración que los tests de unidad no ven.
3. Reutilizar un único call-site central (`applyResultToSession`) para acierto/fallo de cualquier modo paga: el milestone entero tuvo 0 bugs de cascada duplicada.

### Cost Observations
- Model mix: predominantemente opus (perfil `quality`).
- Sessions: ~1 día de trabajo concentrado (2026-06-02).
- Notable: brownfield + reuse mantuvo el milestone pequeño (3 plans, +1,101 LOC) — el coste fue editorial (autorar la canción) más que de ingeniería.

---

## Milestone: v1.4 — Variantes de ejercicio (slots por regla)

**Shipped:** 2026-06-03
**Phases:** 3 (15-17) | **Plans:** 9 | **Sessions:** ~2 días (2026-06-02 → 2026-06-03)

### What Was Built
- Modelo de datos slot+variantes: `validateContent` acepta `payload` XOR `variants[]`; `slotById` derivado vía `normalizeExerciseToSlot` (legacy→slot-de-1); explicación a nivel de slot; migración `5→6` + backup v6.
- Motor de examen por slots: `pickVariantIndex` + `variantIndices` paralelo fija 1 variante aleatoria por slot; "hecha" = pasar 1 variante de cada slot; getter slot-aware con `.payload` sintético; cascada D-54 con 2 call-sites; Repaso 20 / Test / Examen integran el muestreo.
- Piloto Preposiciones: 52 ejercicios → 49 slots por regla (4 fusiones + 2 slots locativos), 41 variantes nuevas por quórum cross-vendor; `migrate6to7` resetea SOLO Preposiciones; smoke paramétrico bifurcado por shape.

### What Worked
- **Engine-first, content-last:** Phase 16 dejó el motor exercisable end-to-end con las 9 categorías legacy como slots de 1 variante ANTES de tocar contenido real (Phase 17). El piloto cayó sobre maquinaria ya verificada — mismo patrón "slice vertical temprano" que pagó en v1.3.
- **Synthetic-payload re-wrap:** re-envolver `slotById[id].variants[i]` en un `.payload` sintético (truco heredado de `songCurrentPhrase`) dejó `initSubStateForExercise` y todos los bindings `.payload.*` intactos — la rework de motor más invasiva del proyecto se hizo sin reescribir el render.
- **Cross-vendor cazó 6 bugs otra vez:** el quórum DeepSeek + Opus + Sonnet sobre las 41 variantes nuevas atrapó 6 dobles-validez R7 que un human-verify habría aprobado; 2 se rechazaron de plano (slots quedaron de-1). Tercer milestone consecutivo donde la verificación multi-capa atrapa lo que una sola capa deja pasar.
- **`normalizeExerciseToSlot` como única costura back-compat:** una función pura legacy→slot-de-1 hizo que las 8 categorías no-piloto sobrevivieran sin re-autoría ni casos especiales visibles (SLOT-06).

### What Was Inefficient
- **Fact drift en el conteo de Preposiciones:** el roadmap arrastró "57 ejercicios" hasta Phase 17, donde se corrigió a 52 reales (fact correction 57→52) y luego se recalculó a 49 slots / TOTAL_EXPECTED 370 aritméticamente. Tres hardcodes de count tuvieron que sincronizarse a mano — señal de que los conteos derivados deberían leerse de `data.exercises.length`, no hardcodearse.
- **Gemini se rate-limiteó** (free tier) durante el quórum de Phase 17, dejando el gate efectivo en DeepSeek + Opus + Sonnet. Funcionó (es justo el combo que la memoria del proyecto registra como cazador de bugs) pero el 4º vendor quedó como bonus inconsistente.
- **6 items de UAT manual de Phase 16** quedaron pendientes de click-through en navegador al cierre de fase (cubiertos por 342/342 tests automáticos + verificación 5/5), repitiendo el patrón de v1.3 de UAT humano que se difiere.

### Patterns Established
- **Rework de motor + piloto de contenido:** un cambio estructural del modelo de datos (slot+variantes) se introduce sin reconstruir el engine — `normalizeExerciseToSlot` absorbe el legacy, el getter `.payload` sintético preserva el render, y una sola categoría (Preposiciones) valida el dolor real antes de convertir las demás (CONV-01 incremental).
- **Migración con poda quirúrgica:** `migrate6to7` clona el patrón deep-clone de `migrate5to6` + 3 desviaciones (delete clave, filtro por prefijo, invalidación condicional de inFlightTest) para resetear SOLO una categoría; `hydrateVN` queda como espejo sin poda.
- **Smoke bifurcado por shape:** `Array.isArray(ex.variants)` + accessors shape-agnostic (`getExplanation`/`getPrompts`) dejan un solo test cubrir slot y legacy — reutilizable sin reescribir cuando CONV-01 convierta las otras 8 categorías.

### Key Lessons
1. Los conteos de contenido deben **derivarse** (`data.exercises.length`), no hardcodearse en 3 sitios — el fact drift 57→52→49 costó re-sincronización manual y un recálculo aritmético de TOTAL_EXPECTED.
2. El truco de re-wrap en `.payload` sintético (de `songCurrentPhrase` en v1.3) generalizó: cuando un modo nuevo cambia la forma del dato, re-envolverlo en la forma que el render ya espera es más barato que tocar el render.
3. Validar el modelo nuevo con UNA categoría real (piloto) antes de convertir las 9 evita re-validar 372 ejercicios de golpe y deja que el dolor real (fusiones, dobles-validez, huecos como `in spiaggia`) emerja en escala pequeña.

### Cost Observations
- Model mix: predominantemente opus (perfil `quality`); quórum de validación vía workflow paralelo (Opus + Sonnet, 1-por-1 aislado VAL-03) + DeepSeek cross-vendor.
- Sessions: ~2 días (2026-06-02 → 2026-06-03).
- Notable: la rework de motor más invasiva del proyecto (modelo de datos nuevo) costó +10,310/−854 LOC pero 0 bugs de cascada — el "single call-site" (`applyResultToSession`) volvió a pagar.

---

## Milestone: v1.5 — Conversión a slots: Bloque Artículos (CONV-01)

**Shipped:** 2026-06-05
**Phases:** 3 (18-20) | **Plans:** 7 | **Sessions:** ~3 días (2026-06-03 → 2026-06-05)

### What Was Built
- Migración `7→8` con reset selectivo de DOS categorías a la vez (articoli + partitivos): `migrate7to8`/`hydrateV8` clon literal de `migrate6to7` con predicado de dos prefijos; backup round-trip v8 + import v7→v8.
- Articoli 56 ejercicios legacy → 34 slots (16 determinativi lo/gli split por sub-disparador fonético + 8 indeterminativi como slots propios + 2 match + 6 cruces); 8 variantes nuevas por quórum + 2 slots de huecos semiconsonánticos (`lo/gli-yi`).
- Partitivi 44 ejercicios legacy → 19 slots (del-formas split por sub-disparador + alternativas + negativa con `∅` como skill propio + clasificación partitivo-vs-prep MC de 3 + match); 6 variantes nuevas por quórum + 2 slots de huecos (`degli-gn/ps`).
- Counts derivados re-sincronizados al conteo REAL del JSON en ambas categorías (370→348→323); smoke shape-agnostic verde sin tocar validator/loader/motor.

### What Worked
- **El piloto v1.4 escaló sin sorpresas:** convertir Articoli + Partitivi fue replicar EXACTAMENTE el patrón de Preposiciones (Phase 17) sobre maquinaria ya verificada — migración con reset → reagrupar por regla → quórum → sync de counts. Cero rework de motor en todo el milestone.
- **Counts leídos del JSON, no estimados:** la lección clave de v1.4 (fact drift 57→52→49) se aplicó: 19-03 y 20-03 leyeron `data.exercises.length` real (34, 19) en vez de la estimación del plan — sin re-sincronización manual ni recálculo aritmético frágil.
- **Cross-vendor cazó disputed otra vez:** el quórum (Gemini + DeepSeek + Opus + Sonnet) sobre las 14 variantes nuevas volvió a atrapar falsos-positivos (alucinación de acento de DeepSeek en 'piden'/'lo iodio'), resueltos sin override-atajo. Cuarto milestone consecutivo donde la verificación multi-capa paga.
- **Split por sub-disparador como decisión de checkpoint:** dejar al autor aprobar la granularidad (dello→z/s-impura, degli→s-impura/vocal/z) antes de reescribir el JSON evitó re-trabajo — el checkpoint:decision cayó en el momento correcto (tras el mapa, antes de la reescritura).

### What Was Inefficient
- **Celdas pobres → engorde en 2 pasos:** el split por sub-disparador dejó 4-5 slots con 1 variante que hubo que engordar en una fase aparte (19-02/20-02). El split y el engorde podrían haberse planificado como un solo paso si el mapa hubiera anticipado los huecos.
- **Huecos singulares descartados tarde:** los huecos `dello+gn/ps/x` se propusieron y luego se descartaron en el checkpoint (exigen incontable sobre sustantivos contables) — un filtro R6 antes de proponer habría ahorrado el ida y vuelta.
- **v1.5 no se archivó al terminar la última fase:** execute-phase marcó la fase y el milestone completos pero `complete-milestone` quedó pendiente; al intentar abrir v1.6 directamente, su cleanup habría borrado las fases sin archivar (detectado y corregido reordenando: cerrar v1.5 primero).

### Patterns Established
- **Conversión de categoría = 3 plans:** reagrupar a slots (checkpoint:decision sobre granularidad) → autorar variantes nuevas + huecos por quórum (checkpoint:human-verify) → sincronizar counts derivados. Plantilla repetible para las 6 categorías restantes.
- **Migración multi-categoría:** un solo `migrateNtoM` puede resetear varias categorías con un predicado de N prefijos — no hace falta una migración por categoría.
- **Cerrar milestone antes de abrir el siguiente:** `complete-milestone` es prerrequisito de `new-milestone`, no alternativa — el cleanup de new-milestone asume las fases previas ya archivadas.

### Key Lessons
1. El patrón pilot→escala (validar con 1 categoría, luego convertir en serie) sigue pagando: 3/9 categorías convertidas sin tocar el motor, cada una reutilizando la maquinaria verificada.
2. Aplicar la lección de fact-drift de v1.4 (leer counts del JSON) eliminó por completo la re-sincronización manual frágil de este milestone.
3. Filtrar la viabilidad lingüística (R6: incontable vs contable) ANTES de proponer variantes evita ciclos de propuesta→descarte en el checkpoint del autor.

### Cost Observations
- Model mix: predominantemente opus (executor/orchestrator) + sonnet (verifier); quórum de validación cross-vendor (Gemini + DeepSeek + Opus + Sonnet, 1-por-1 aislado).
- Sessions: ~3 días (2026-06-03 → 2026-06-05), 69 commits.
- Notable: +8,245/−2,384 LOC casi todo contenido (JSON) + tests; 0 cambios de lógica de motor — el milestone más "puro contenido" desde v1.2.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | — | 10 | Walking skeleton → motor de re-verificación + 7 categorías + Modo Examen |
| v1.1 | — | 2 | Infra de validación editorial (quórum multi-AI, skills, reporter) |
| v1.2 | — | 2 | Patrón "categoría nueva" consolidado (temario→ejercicios→lockstep→quórum); cross-vendor caza bugs que human-verify deja pasar |
| v1.3 | ~1 día | 2 | Patrón "bloque nuevo sobre engine" — un modo de ejercicio nuevo reutiliza el motor sin reconstruirlo |
| v1.4 | ~2 días | 3 | Patrón "rework de motor + piloto de contenido" — modelo de datos nuevo (slots) sin reconstruir el engine; 1 categoría piloto valida el dolor antes de convertir las 9 |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 209/209 | 271/271 ejercicios curados | engine, 3 tipos, backup, schema-validator |
| v1.1 | 261/261 | 272/272 validados por quórum | skills validación, reporter |
| v1.2 | 268/268 | 372/372 validados | `validate-ai-pass.mjs` multi-provider |
| v1.3 | 306/306 | 19/19 requirements | bloque Canciones, `validateSongs`, `migrate4to5` |
| v1.4 | 342/342 | 17/17 requirements · Preposiciones 49 slots por quórum | modelo slot+variantes, `pickVariantIndex`, `normalizeExerciseToSlot`, `migrate5to6`/`6to7`, smoke bifurcado por shape |

### Top Lessons (Verified Across Milestones)
1. **Reutilizar un único call-site central paga** — `applyResultToSession` (v1.0) absorbió tanto los tipos nuevos de v1.0 como el modo canción de v1.3 sin duplicar la cascada.
2. **El human-verify deja pasar bugs que otra capa caza** — en v1.2 fue el cross-vendor (8 bugs en Articoli); en v1.3 fue el UAT de contenido real (`bankWithKeys`). La verificación de una sola capa no basta.
3. **Brownfield disciplinado mantiene los milestones pequeños** — declarar "NO reconstruir el motor" y sostenerlo deja que el coste sea de contenido, no de ingeniería (v1.2 y v1.3).
