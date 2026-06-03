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
