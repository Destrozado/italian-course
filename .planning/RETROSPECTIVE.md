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

## Milestone: v1.6 — Conversión a slots: categorías restantes (CONV-01 cierre)

**Shipped:** 2026-06-09
**Phases:** 7 (21-27) | **Plans:** 19 | **Sessions:** ~4 días (2026-06-05 → 2026-06-09), 155 commits

### What Was Built
- Migración `8→9` con reset selectivo de SEIS categorías a la vez (predicado de 6 prefijos) — escalado del patrón de 2 prefijos de v1.5.
- Las 6 categorías legacy restantes convertidas a slot+variantes: Avere 23→19, Essere 39→26, Verbi di movimento 37→7 (regla de auxiliar), Genere e numero 40→12, Professioni 51→11, Sostantivi irregolari 31→5. ~99 superficies nuevas autoradas por quórum cross-vendor a lo largo del milestone.
- Las dos categorías léxicas (Professioni, Sostantivi irregolari) resueltas como **HÍBRIDAS**: bloque regla con variantes intercambiables reales + bloque léxico/contraste sin autoría — sin forzar variantes artificiales.
- Counts derivados re-sincronizados al conteo REAL del JSON en cada conversión (`TOTAL_EXPECTED` 323→…→183). **CONV-01 CERRADO: 9/9 categorías de gramática unificadas.**

### What Worked
- **La plantilla de 3 plans se mantuvo estable las 6 veces:** mapa+reescritura (checkpoint:decision) → variantes por quórum (checkpoint:human-verify) → sync de counts. Cero rework de motor en todo el milestone, 6 conversiones consecutivas.
- **El híbrido resolvió la open question sin forzar nada:** para las léxicas, documentar por bloque "dónde hay regla → variantes; dónde es léxico/lema → sin autoría" evitó inventar variantes artificiales y cumplió SOST-01/PROF-01 limpiamente.
- **Cross-vendor siguió cazando bugs reales:** en Phase 27 el quórum atrapó 4 dobles-validez R7 (cigli/sopraccigli/lenzuoli/migli — distractoras que eran plurales válidos en otro sentido) que un human-verify habría aprobado; quinto milestone consecutivo donde la verificación multi-capa paga.
- **Counts leídos del JSON, no estimados:** la lección de v1.4/v1.5 ya es reflejo — cada 27-03/26-03/… leyó `data.exercises.length` real.

### What Was Inefficient
- **Checkpoints de contenido vs --auto:** la cadena se lanzó con `--chain --auto`, pero los checkpoints de calidad de contenido (aprobar mapa + aprobar variantes) son decisiones del autor que NO deben auto-aprobarse; hubo que anular el auto-approve del workflow para pausar de verdad. La tensión entre "autónomo" y "curaduría de contenido" debería ser explícita en el plan.
- **Auto-extracción de accomplishments ruidosa:** `milestone.complete` extrajo bullets "Task 1 (commit …)" de los SUMMARY en vez de los one-liners reales; hubo que reescribir la entrada de MILESTONES.md a mano.
- **Detección UI falso-positivo:** el gate de UI saltó por "form" dentro de "formato" en una fase 100% contenido; se resolvió por precedente (las 5 fases previas sin UI-SPEC) pero el grep es frágil.

### Patterns Established
- **Conversión híbrida regla+léxica:** para categorías léxicas, trocear por bloque (regla con variantes / léxico-lema sin autoría / contraste sin engorde) y documentar la decisión por bloque — no toda categoría tiene "regla con variantes intercambiables".
- **Migración multi-categoría escala:** un `migrateNtoM` con predicado de N prefijos resetea 6 categorías igual de bien que 2.
- **Granularidad fina por sub-regla:** 1 slot por sub-regla (sufijo/terminación/sub-disparador) drillea la trampa A1 sin difuminar; el examen rota variantes dentro del slot.

### Key Lessons
1. El patrón pilot→escala llegó hasta el final: 9/9 categorías convertidas sin reconstruir el motor jamás, cada conversión reutilizando maquinaria verificada en v1.4.
2. El híbrido (regla + léxico) es la respuesta correcta para categorías que no son rule-rich puras — documentarlo por bloque evita forzar variantes y satisface los criterios "no se fuerzan variantes artificiales".
3. Los checkpoints de curaduría de contenido deben pausar para revisión humana incluso en cadenas `--auto` — el coste de meter mal contenido al canon permanente es alto y difícil de revertir.

### Cost Observations
- Model mix: opus (orchestrator + executors + planner) + sonnet (verifier + plan-checker); quórum cross-vendor (Opus 4.8 + Sonnet 4.6 base + Gemini/DeepSeek refuerzo, 1-por-1 aislado) para ~99 variantes nuevas.
- Sessions: ~4 días (2026-06-05 → 2026-06-09), 155 commits, 7 fases.
- Notable: milestone más grande del proyecto por fases (7) y commits (155); casi todo contenido (JSON) + tests + migración; 0 cambios de lógica de motor.

---

## Milestone: v1.7 — Presente regolare (10ª categoría de gramática)

**Shipped:** 2026-06-17
**Phases:** 3 (29-31) | **Plans:** 6 | **Sessions:** ~2 días (2026-06-16 → 2026-06-17)

### What Was Built
- Migración `10→11` con reset selectivo de UN solo prefijo (`presente-regolare`) — el caso mínimo del patrón multi-prefijo de v1.5/v1.6.
- Alta de la 10ª categoría `presente-regolare` nacida DIRECTAMENTE en slot+variantes (8 slots base: `-are`/`-ere`/`-ire`/`-isc-`/velar/palatal + 2 word-buttons; 18 variantes por quórum) — primera categoría que NO requiere conversión legacy→slot.
- 4 cruces multi-cat `presente-regolare`↔avere/essere (contraste presente vs passato prossimo, ambas direcciones, solo participios regulares) con cascada D-54 — en formato slot+variantes (no single-variant como el precedente avere-300..305).
- Integración lockstep con **conteo dinámico**: `TOTAL_EXPECTED` computado (`CATEGORIES.reduce`, 183→195) y `expected` derivado del JSON real vía `slotCountOf`/`readJson` — por primera vez ningún número mágico.

### What Worked
- **Conteo dinámico del JSON real:** la lección acumulada de v1.4-v1.6 ("leer, no estimar") se materializó en helpers que derivan el count del archivo — el milestone no hardcodeó un solo número de slots.
- **Cross-vendor siguió cazando bugs reales:** Phase 30 atrapó 3 bugs de ortografía italiana (università/caffè-tè/venerdì); Phase 31, 1 violación R4 real (meta-comentario de curador) — sexto milestone consecutivo donde la verificación multi-capa paga.
- **Slot+variantes aplicado también a los cruces:** en vez de copiar el single-variant de avere-300..305, los cruces se autoraron como slots con ≥2 variantes (verbo fresco al re-presentar) — coherente con el core anti-memorización.
- **Chequeo explícito del riesgo nuevo:** la concordancia participio↔sujeto con essere (è partito/partita/sono partiti/partite) se mandó verificar EXPLÍCITAMENTE en el quórum (D-31-08), no se delegó a que el modelo la cazara.

### What Was Inefficient
- **Deuda de conteo preexistente latente:** el reporter VAL-06 quedó en FAIL (197/195) por DOS discrepancias (genero-numero 13-vs-12, preposiciones) que llevaban rojas desde antes de v1.7 sin que ningún milestone lo notara — solo salió a la luz al recomputar `TOTAL_EXPECTED`. Una reconciliación periódica de counts lo habría cazado antes.
- **Fix asimétrico:** solo `presente-regolare` recibió conteo dinámico; los literales stale de genero-numero/preposiciones siguen hardcodeados en los mismos arrays (code review WR-03).
- **Regresión de robustez introducida:** el helper `slotCountOf` hace `JSON.parse` sin try/catch en module-init, fuera del defensivo `loadCategory` del reporter — un JSON corrupto ahora crashea el reporter entero (WR-01), violando su contrato "nunca throws".
- **Detección UI falso-positivo otra vez:** el gate de UI saltó por "ui"/"form" dentro de "suite"/"información" en una fase 100% contenido — mismo grep frágil que en v1.6.

### Patterns Established
- **Categoría nacida-en-slots:** dar de alta una categoría nueva directamente en slot+variantes (sin paso de conversión) — más simple que el regroup de v1.5/v1.6 porque no hay legacy que migrar.
- **Conteo dinámico + guard de coherencia:** derivar `expected` y `TOTAL_EXPECTED` del JSON real; el número mágico es deuda esperando a divergir.
- **Cruces multi-cat en formato slot+variantes:** los cruces también rotan variantes (no se congelan en una frase fija).

### Key Lessons
1. Una categoría nueva en el formato unificado (post-CONV-01) cuesta menos que convertir una legacy — el alta de v1.7 fue migración + autoría + lockstep, sin reescritura de shape.
2. La deuda de conteo se acumula en silencio: los `expected` hardcodeados de categorías AJENAS pueden estar rojos durante milestones hasta que un reporter recomputa el total. Vale una reconciliación periódica.
3. Conteo dinámico > número mágico, pero aplícalo UNIFORMEMENTE — un fix asimétrico deja la mitad del array todavía frágil.

### Cost Observations
- Model mix: opus (orchestrator + executors + planner) + sonnet (verifier + plan-checker); quórum cross-vendor para 22 superficies nuevas (18 base + 4 cruces): Opus author-oracle + DeepSeek real (Phase 31), Opus+Sonnet+Gemini/DeepSeek (Phase 30).
- Sessions: ~2 días (2026-06-16 → 2026-06-17), 3 fases, 6 plans.
- Notable: milestone más corto desde v1.3; casi todo contenido (JSON) + tests + migración; 0 cambios de lógica de motor (cascada D-54 intacta, 2 call-sites verificados por grep).

---

## Milestone: v1.8 — Rediseño visual "Editoriale"

**Shipped:** 2026-06-30
**Phases:** 3 (32-34) | **Plans:** 12 | **Tasks:** 15 | **Requirements:** 19/19

### What Was Built
El rediseño visual "Editoriale" aplicado a las 8 pantallas (papel cálido, serif Spectral/Hanken/Space Grotesk auto-hospedadas, acento verde/rojo, tricolore): cimientos de tokens + fuentes + `app.css` y Home/Categorías (32), pantallas de ejercicio con barra superior unificada (33), y canciones/reproducción/resultados/picker (34). Brownfield UI puro — el motor (cascada D-54, sampler, slot-engine, localStorage, schema) no se tocó.

### What Worked
- **Pipeline GSD completo por fase** (discuss → ui-phase → plan → execute → code-review → verify → secure) mantuvo cada pantalla verificada antes de avanzar; el audit de milestone solo re-confirmó (19/19 reqs, integración 47/47, 5/5 flows).
- **Cimientos primero** (tokens/getters en un plan wave-1 que las demás consumen) evitó re-derivar datos y redefinir tokens en cada pantalla.
- **UI-SPEC + locked decisions (D-01..D-16)** dejaron el repintado sin ambigüedad; el checker upgradeó a 6/6 tras anclar D-15/D-16 (escala/espaciado heredados del handoff) como decisiones explícitas.
- **Quórum de subagentes** (pattern-mapper, code-reviewer, verifier, integration-checker) cazó la inconsistencia cosmética del `correcta` toggle y confirmó cero `x-html`.

### What Was Inefficient
- **La eliminación de Pico (GAP-01) dejó un reset base sin migrar** (`<figure>`), que se manifestó como **bug grave de márgenes en móvil** descubierto post-cierre por el autor — no por la suite (los tests no renderizan CSS). Hotfix `13b5631`.
- **Bookkeeping de frontmatter:** los SUMMARY de Phase 33 no poblaron `requirements_completed`; el audit tuvo que verificar EX-01..05 por otras fuentes.
- v1.8 desktop-only por diseño dejó el responsive como deuda; el bug de móvil demuestra que "desktop-only" no exime de no-romper-móvil.

### Patterns Established
- **Repintado brownfield serializado por archivo compartido:** cuando N pantallas comparten `index.html`+`app.css`, una pantalla por wave (no paralelo) evita conflictos; cimientos (getters/tokens) en wave 1.
- **Locked-inherited deviations:** cuando los valores vienen verbatim de un handoff, anclarlos como decisiones explícitas (D-15/D-16) para que los checkers greenfield no los marquen.
- **CSS reset migration checklist:** al quitar un framework base (Pico), auditar TODOS los resets de elementos desnudos (`figure`, `figure`, `fieldset`, `table`…), no solo los que tienen estilo propio.

### Key Lessons
- **Los tests de estructura no cubren regresiones de layout/CSS.** Un "desktop-only" verificado puede esconder un bug grave de móvil. Añadido guard source-assert para el reset de `figure`; idealmente un harness headless (Playwright) para layout.
- **El audit formal valió:** aunque cada fase ya estaba verificada, el integration-checker dio la foto cross-phase (tokens→consumo, top-bar reuse, getter→template) que ninguna verificación de fase aislada da.

### Cost Observations
- Model mix: orquestación Opus; subagentes verify/review/integration en Sonnet (perfil quality). 
- Sesiones: 1 sesión larga (discuss→ship→hotfix), con loop autónomo entre gates esperando UAT humano.
- Notable: el bug más caro (márgenes móvil) lo encontró el humano en 30s de uso real — barato comparado con no encontrarlo; refuerza UAT humano + harness visual.

## Milestone: v1.9 — Determinantes + verbos A1/A2

**Shipped:** 2026-07-02
**Phases:** 5 (35-39) | **Plans:** 10

### What Was Built
4 categorías nuevas A1/A2 (Dimostrativi 8 slots, Possessivi 7, Verbi modali 6, Verbi riflessivi 7) autoradas desde cero por quórum cross-vendor R1-R7 en slot+variantes; marca de procedencia opcional `origen` (PROV-01) con las 4 nuevas estampadas; migración 11→12; lockstep de conteos de cierre. 14 categorías / 225 slots, suite 624/638 verde.

### What Worked
- El patrón "alta = clon del molde v1.7 (presente-regolare)" hizo cada categoría mecánica y de bajo riesgo (brownfield puro de contenido, motor intacto).
- Quórum cross-vendor (Opus 4.8 + Sonnet 4.6 + DeepSeek en magnets) cazó bugs reales de concordancia/ortografía; la ronda EXTRA DeepSeek en nodos de doble-validez fue clave.
- El caveat executor-no-puede-Task-quorum se resolvió partiendo la autoría (estructural en executor) del sello canónico Sonnet (top-level) — Phase 38.
- PROV-01 + lockstep como fase de cierre separada (mirror de Phase 31) mantuvo el conteo honesto y arregló un red preexistente (genero-numero 12→13).

### What Was Inefficient
- El literal magic 183 del baseline-guard y los 3 arrays hardcoded de conteo siguen siendo un touchpoint frágil (reframeado a suma dinámica en v1.9, debería evitar el problema a futuro).
- Backlog crónico de 19 quick_tasks 'missing' arrastrado desde mayo sin resolver (diferido otra vez).

### Patterns Established
- Categoría nueva SIEMPRE nace en slot+variantes (nunca legacy payload); 0-match documentado en notes cuando el pareo es mecánico.
- Cruces multi-cat con id estable -300/-301 reusando applyResultToSession (0 call-sites nuevos, D-54 = 2).
- `origen` opcional retrocompatible (absence=accepted); legacy sin etiquetar (procedencia mixta = no mentir).

### Key Lessons
- Verificar acentos italianos en las OPTIONS, no solo en explanation (bug `si e`→`si è` cazado en el sello Sonnet top-level de Phase 38).
- El baseline-guard es "lo más fácil de olvidar" en un cierre de conteo — reframear a suma dinámica lo elimina como clase de bug.

### Cost Observations
- Model mix: autoría/planning en Opus, verificación/checker en Sonnet, refuerzo cross-vendor DeepSeek.
- Timeline: 1 día intensivo (2026-07-01), 71 commits.

---

## Milestone: v2.0 — Paradigma completo de `fare`

**Shipped:** 2026-08-13
**Phases:** 6 (40-45) | **Plans:** 15 | **Tasks:** 47 | **Commits:** 224

### What Was Built
El paradigma entero de `fare` en 4 categorías por modo: `fare-indicativo` (8 slots / 48 variantes), `fare-congiuntivo` (5 / 30), `fare-cond-imperativo` (3 / 17), `fare-indefiniti` (6 / 18) = **22 slots / 113 variantes** autoradas desde cero por quórum cross-vendor R1-R7. Migración `12→13` con reset selectivo, integración lockstep y gate anti-ceguera. **18 categorías / 250 slots.** Y una sexta fase que no estaba en el plan: la Phase 45, añadida a raíz de la auditoría del propio milestone para pagar la deuda del **arnés de tests**. Suite 1182 (1178 pass / 4 skip), motor v1.4 byte-intacto.

### What Worked
- **La auditoría de milestone se ganó su coste por primera vez de forma inequívoca.** No confirmó que todo estuviera bien: encontró 28 hallazgos y produjo una fase entera de trabajo real (la 45). Una auditoría que solo dice «passed» no habría pagado su precio.
- **El quórum cross-vendor siguió cazando lo que el human-verify deja pasar**, y esta vez también al revés: en Phase 42 el flag C5 lo levantó *Sonnet*, la mitad de la base de aprobación que el plan daba por segura — y la incoherencia entre vendors *fue* el diagnóstico (la excepción vivía en un `notes` que el subagent nunca ve).
- **Verificación por mutación como estándar de aceptación**, no como ceremonia: 21 rojos observados, transcritos verbatim y revertidos a lo largo de la fase 45. Es lo que separó los gates que muerden de los que no.
- **El invariante «motor NO tocado» aguantó 10 días y 224 commits**, verificado con un `git diff` vacío al cierre. Declararlo por escrito en cada plan hizo que se sostuviera solo.

### What Was Inefficient
- **La Phase 44 costó dos ciclos de review-and-fix**, y el segundo encontró 4 blockers *dentro de los arreglos del primero*. Arreglar sin volver a mutar es arreglar a ciegas.
- **Dos de cuatro snippets propuestos por code review eran incorrectos, y uno era peor que el bug** (habría blanqueado el array `CATEGORIES` entero). Se repitió en la Phase 45: el fix propuesto para CR-01 se autodelataba dentro del fichero que arreglaba.
- **Colisión de IDs de decisión** entre plan-time y run-time (dos `D-45-05` vivos), y la propia propuesta de arreglo quedó inservible porque otro plan reclamó el ID antes de aplicarla. Se resolvió a mano en el cierre.
- **El extractor de `one_liner` devolvió basura en 6 de 15 SUMMARYs** — `MILESTONES.md` se pobló con líneas como `C5-leak.` y `ANTES` y hubo que reescribirlo a mano.

### Patterns Established
- **Verificación por mutación: mutar → correr → ver el ROJO → transcribir verbatim → revertir.** El criterio de aceptación exige el rojo *observado*, no que la suite siga verde.
- **Cláusula de no-vacuidad primero, con la referencia derivada del disco**, en todo gate que enumera. Sin ella, un reconocedor que deja de casar pasa en verde certificando nada.
- **Lockstep documental por conteo de ocurrencias, no por `includes()`** — un `includes` es ciego a la regresión parcial en ficheros con el contrato repetido.
- **Guard diferencial** (dos reconocedores + `deepEqual` sobre lo que ve cada uno) cuando un escáner puede desincronizarse parcialmente.
- **Redactar la prosa contra el identificador, no contra el número** (`COUNT_ARRAY_SOURCES`, no «las TRES fuentes»): el texto deja de envejecer con el alta siguiente.
- **Marca literal como escape hatch, nunca heurística sobre la prosa** — adivinar la intención del texto convierte cualquier reescritura en un falso verde.
- **Escribir la limitación del gate en la cabecera del propio gate**, y ajustar el título del test cuando promete de más: un título que promete de más es parte del defecto.

### Key Lessons
1. **Un artefacto que dice «gate cerrado» no es evidencia de que el gate muerda.** La Phase 45 encontró **cinco gates vacuos** —tres en sus propios planes, dos que el code review halló en trabajo firmado en cuatro SUMMARY— y los cinco se cazaron corriendo la mutación, ninguno leyendo.
2. **Un fix propuesto por un revisor es una hipótesis y merece la misma mutación que el código que arregla.** Tres confirmaciones independientes en este milestone.
3. **Un fallo de CARGA no es un gate poniéndose rojo.** Si el runner dice `# tests 1 / exit 1`, has roto el fichero; el rojo bueno reporta el total normal y *nombra la aserción*. Mordió tres veces, incluida una en el propio cierre del milestone.
4. **`git checkout -- <fichero>` sobre trabajo sin committear revierte la tarea, no la mutación.** Documentado en la ola 2 y volvió a morder en la ola 4.
5. **Fail-loud o fail-soft no es preferencia, es función de qué fracción queda inservible sin la referencia.** Tres decisiones opuestas en el mismo milestone, cada una con su motivo escrito en el código — y una cuarta descubierta al cerrar: la *ausencia legítima* de un fichero no es una avería y merece un skip visible, no un throw.
6. **Un requisito ausente de las DOS mitades de un documento lo deja internamente consistente.** El gate que cruza mitades entre sí no puede echar de menos lo que no aparece por ningún lado — medido, contra la afirmación contraria del plan y del revisor de planes.

### Cost Observations
- Model mix: autoría/planning/ejecución en Opus, verificación/checker en Sonnet, refuerzo cross-vendor DeepSeek en los MAGNETs de doble validez.
- Timeline: 10 días (2026-08-03 → 2026-08-13), 224 commits, 135 ficheros (+38.825/−259).
- **La calibración de estimaciones del proyecto salió `factor 0.5` con `clamped: true`** — es decir, la corrección real era aún más agresiva y el sistema la topó en el mínimo. Este proyecto estima consistentemente el doble de lo que tarda. Ejemplo del milestone: un plan registrado de memoria como «~35 min» duró 8.

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
| v1.5 | ~3 días | 3 | Pilot→escala: 2 categorías (Articoli + Partitivi) convertidas replicando el piloto; counts leídos del JSON (no estimados); migración multi-categoría (2 prefijos) |
| v1.6 | ~4 días | 7 | Cierre de CONV-01: las 6 categorías restantes convertidas en serie; migración de 6 prefijos; híbrido regla+léxica para las léxicas; 0 rework de motor |
| v1.7 | ~2 días | 3 | Alta de categoría nacida-en-slots (sin conversión); conteo dinámico del JSON (`TOTAL_EXPECTED` computado, no mágico); cruces multi-cat slot+variantes; deuda de conteo AJENA preexistente aflora al recomputar |
| v1.8 | 1 día | 3 | Rediseño visual brownfield UI puro: Pico eliminado, `app.css` base, lenguaje Editoriale en las 8 pantallas; motor intacto; hotfix post-cierre CSS reset `<figure>` |
| v1.9 | 1 día | 5 | 4 categorías nuevas nacidas-en-slots (Dimostrativi/Possessivi/Modali/Riflessivi) + PROV-01 origen + lockstep cierre; quórum con ronda EXTRA en magnets de doble-validez; baseline-guard reframeado dinámico |
| v2.0 | 10 días | 6 | Paradigma completo de un verbo (4 categorías por modo, 22 slots/113 variantes); 4 MAGNETs de doble validez resueltos con audit trail; **la auditoría del milestone generó una fase entera de trabajo real** (la 45, deuda del arnés); verificación por mutación como estándar de aceptación |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 209/209 | 271/271 ejercicios curados | engine, 3 tipos, backup, schema-validator |
| v1.1 | 261/261 | 272/272 validados por quórum | skills validación, reporter |
| v1.2 | 268/268 | 372/372 validados | `validate-ai-pass.mjs` multi-provider |
| v1.3 | 306/306 | 19/19 requirements | bloque Canciones, `validateSongs`, `migrate4to5` |
| v1.4 | 342/342 | 17/17 requirements · Preposiciones 49 slots por quórum | modelo slot+variantes, `pickVariantIndex`, `normalizeExerciseToSlot`, `migrate5to6`/`6to7`, smoke bifurcado por shape |
| v1.5 | 358/358 | 9/9 requirements · Articoli 34 + Partitivi 19 slots | `migrate7to8` reset selectivo de 2 categorías, 2 slots de huecos semiconsonánticos |
| v1.6 | 374/374 | 14/14 requirements · 9/9 categorías slot+variantes (CONV-01 cerrado) | `migrate8to9` reset de 6 categorías; híbrido regla+léxica (Professioni, Sostantivi irregolari) |
| v1.7 | 473/474 (483/484 strict) | 11/11 requirements · 10ª categoría `presente-regolare` (8 base + 4 cruces) | `migrate10to11` reset de 1 prefijo; conteo dinámico `slotCountOf`; cruces multi-cat slot+variantes |
| v1.8 | 574/575 | 19/19 requirements · 8 pantallas Editoriale | Pico eliminado → `app.css`; `migrate11to12` (pendiente en v1.9); fuentes auto-hospedadas |
| v1.9 | 624/624 (638/638 strict) | 25/25 requirements · 14 categorías / 225 slots · 4 categorías nuevas + PROV-01 | `migrate11to12` reset de 4 prefijos; `origen` opcional; baseline-guard dinámico; ronda EXTRA DeepSeek |
| v2.0 | 1182 (1178 pass / 4 skip; 1196 strict) | 26/26 requirements · 18 categorías / 250 slots · paradigma completo de `fare` | `migrate12to13` reset de 4 prefijos; gate anti-ceguera de 3 fuentes; invocación canónica con los DOS globs (+63 tests huérfanos enganchados); banner del reporter derivado del disco; gate de trazabilidad de requisitos |

### Top Lessons (Verified Across Milestones)
1. **Reutilizar un único call-site central paga** — `applyResultToSession` (v1.0) absorbió tanto los tipos nuevos de v1.0 como el modo canción de v1.3 sin duplicar la cascada.
2. **El human-verify deja pasar bugs que otra capa caza** — en v1.2 fue el cross-vendor (8 bugs en Articoli); en v1.3 fue el UAT de contenido real (`bankWithKeys`). La verificación de una sola capa no basta.
3. **Un gate solo está cerrado cuando se le ha visto el rojo** — v2.0 encontró cinco gates vacuos que cuatro SUMMARY daban por cerrados; los cinco se destaparon mutando, ninguno leyendo. Aplica igual a un fix propuesto por un revisor: es hipótesis hasta que se muta.
4. **Brownfield disciplinado mantiene los milestones pequeños** — declarar "NO reconstruir el motor" y sostenerlo deja que el coste sea de contenido, no de ingeniería (v1.2 y v1.3).
