# Milestones

## v2.0 Paradigma completo de `fare` (4 categorías por modo) (Shipped: 2026-08-13)

**Phases completed:** 6 phases (40-45), 15 plans, 47 tasks, 26/26 requirements (6 IND + 4 CONG + 3 CI + 4 INDEF + 2 MIG + 4 INT + 3 DEUDA)
**Stats:** 224 commits, 135 ficheros (+38.825/−259). **18 categorías / 250 slots.** Migración `schemaVersion 12→13` con reset selectivo. Suite **1182/1182** (1200 strict), reporter `Gate de cierre de v2.0` exit 0 con VAL-04/06/08/09 los cuatro PASS. Timeline 2026-08-03 → 2026-08-13 (10 días). Audit `tech_debt` (cero blockers, ~25 items). **Brownfield PURO: motor v1.4 byte-intacto — `git diff 0a9a2e5..HEAD -- src/screens/app.js src/domain/` vacío, cascada D-54 con exactamente 2 call-sites.**
**Closeout:** `override_closeout` — 6/6 fases verificadas y 26/26 requirements satisfechos, con 4 items de artefacto reconocidos y diferidos (ver `STATE.md` §Deferred Items). Known verification overrides: **0**.

**Key accomplishments:**

- **El paradigma entero de `fare` en 4 categorías por modo**, 22 slots / 113 variantes autoradas desde cero por quórum cross-vendor R1-R7 — `fare-indicativo` (8 slots, 48 variantes), `fare-congiuntivo` (5 slots, 30), `fare-cond-imperativo` (3 slots, 17), `fare-indefiniti` (6 slots, 18). La estimación de plan-time decía 21 slots / ≈107 variantes; el congiuntivo salió con un slot de más porque CONG-04 pidió uno para el DISPARADOR (D-42-01).
- **Cuatro MAGNETs de doble validez resueltos con audit trail**, no evitados: `fa'`/`fai` del imperativo, `aver fatto` vs `avere fatto`, y las 5 keys homógrafas del congiuntivo (`faccia` ×3, `facessi` ×2) que solo desambigua el pronombre sujeto explícito en la frase.
- **Migración `12→13` con reset selectivo por prefijo** (pura, idempotente, anti-prototype-pollution), espejada en `backup.js` con round-trip v13 e import `v12→v13`: las 14 categorías legacy y `songProgress` quedan byte-intactas.
- **El gate anti-ceguera** (`tests/count-arrays-lockstep.test.js`): pone rojo cualquier categoría registrada en `categories.json` y no enganchada a los arrays de conteo — el olvido que se repitió **tres fases seguidas** con el reporter emitiendo `225/225 PASS` mientras estaba ciego a 22 slots.
- **La Phase 45 pagó la deuda del propio arnés**, añadida a raíz de la auditoría de este mismo milestone: `tests/fixtures/` entra en la suite canónica (+63 tests que nunca habían corrido), un tercer array de conteo entra en el gate, y la cabecera del reporter deja de mentir sobre qué gatea (ahora derivada de `.planning/STATE.md`, fail-soft).
- **El motor v1.4 no se tocó en 10 días y 224 commits.** Es la afirmación estructural que el milestone repitió desde el primer plan, y la auditoría final la verificó con un diff vacío.

**La lección que merece sobrevivir al milestone:** la Phase 45 encontró **cinco gates vacuos** — tres en sus propios planes, dos que un code review halló en trabajo ya dado por cerrado y firmado en cuatro SUMMARY — y los cinco se cazaron **corriendo la mutación**, ninguno leyendo. Un artefacto que dice «gate cerrado» no es evidencia de que el gate muerda. Un fix propuesto por un revisor tampoco: en este milestone, 2 de 4 snippets de review eran incorrectos y uno era peor que el bug que arreglaba. Learnings completos en `.planning/milestones/v2.0-phases/45-deuda-del-arn-s-de-tests/45-LEARNINGS.md`.

---

## v1.9 Determinantes + verbos A1/A2 (Shipped: 2026-07-01)

**Phases completed:** 5 phases (35-39), 10 plans, 25/25 requirements (5 DEMOS + 5 POSS + 2 MODAL + 5 REFLEX + 2 PROV + 2 MIG + 4 INT)
**Stats:** 5 phases (35-39), 10 plans, 71 commits (+9,817/−1,743, 112 files). 14 categorías / 225 slots. Migración schemaVersion 11→12. Suite 624/624 (638/638 con VAL_07_STRICT=1), reporter exit 0. Timeline 2026-07-01 (1 día). Brownfield puro de contenido: motor v1.4 NO tocado (D-54 = 2 call-sites).
**Known deferred items at close:** 19 quick_tasks 'missing' (backlog crónico pre-v1.9: mayoría "añadir canción", varias ideas UX) + 1 todo. Ver STATE.md §Deferred Items.

**Key accomplishments:**

- **Dimostrativi** (order 11, 8 slots, Phase 36) — nacida en slot+variantes: questo concordancia, quest' elisión, quello 6-formas, match noun→forma, colapso ES 3-vías→IT 2-vías, + ciò neutro + formas pronominales + cruce dimostrativi-300 (↔articoli). Quórum Opus 4.8 + Sonnet 4.6 + pase DeepSeek en los 2 magnets quello.
- **Possessivi** (order 12, 7 slots, Phase 36) — MC-only: concordancia con lo poseído (incl. poseedor≠poseído), artículo obligatorio (distractora del calco), excepción de parentesco (4 carve-outs), suo his/her, loro invariable + cruces possessivi-300 (↔articoli) y possessivi-301 (↔genero-numero).
- **Verbi modali** (order 13, 6 slots, Phase 37) — potere/volere/dovere presente irregular + modal+infinitivo + cruce modali-300 (↔presente-regolare), validados por quórum.
- **Verbi riflessivi** (order 14, 7 slots, Phase 38) — presente reflexivo, colocación vía word-buttons (orden-distractor `sveglio mi`), reflexivo sobre terminación regular, MAGNET pp-concordanza -o/-a/-i/-e con essere (CERO avere), trío mismatch ES↔IT (ammalarsi/dimenticarsi(di)/salire), + 2 cruces (riflessivi-300 ↔presente-regolare, riflessivi-301 ↔essere). Sello canónico Opus+Sonnet + ronda EXTRA DeepSeek en los nodos de concordancia.
- **PROV-01/02** (Phase 39) — campo OPCIONAL `origen` (enum ia-quorum|apuntes-profesora) validado a nivel categoría vía TDD; las 4 cats nuevas estampadas `ia-quorum`; las 10 legacy honestamente AUSENTES (procedencia mixta).
- **INT-02 lockstep** (Phase 39) — los 3 arrays hardcoded de conteo re-sincronizados con expected DINÁMICO, baseline-guard reframeado sin el magic 183, y las 14 categorías verdes en suite + VAL_07_STRICT + reporter con el motor byte-intacto.

---

## v1.8 Rediseño visual Editoriale (Shipped: 2026-06-30)

**Phases completed:** 3 phases (32-34), 12 plans, 15 tasks, 19/19 requirements (4 FND + 6 HOME + 5 EX + 4 SRP)
**Stats:** suite 574/575 (único fail preexistente AJENO genero-numero). Timeline 2026-06-30 (1 día). **Pico ELIMINADO** (Phase 32) → `app.css` pasa a ser la base/reset. Motor (cascada D-54, sampler, slot-engine, localStorage, schema, migraciones) NO tocado.
**Audit:** `passed` — 19/19 requirements · integración cross-phase 47/47 · 5/5 E2E flows (`.planning/milestones/v1.8-MILESTONE-AUDIT.md`).
**Known deferred items at close:** responsive móvil (tamaño de prompt + breakpoints de las pantallas nuevas) — v1.8 es desktop-only por diseño; 17 quick_tasks "missing" (stale, pre-v1.8); 1 cosmético (`cancion` `.wb-answer` sin toggle `correcta`). Ver STATE.md §Deferred Items. **Hotfix post-cierre `13b5631` (2026-07-01):** reset base `figure { margin: 0 }` — el gutter UA de 40px de `<figure>` aplastaba la tabla de categorías en móvil (regresión de eliminar Pico); corregido y en `main`.

**Key accomplishments:**

- **Capa Editoriale (Phase 32):** tokens `--ed-*`, 3 fuentes auto-hospedadas en `vendor/fonts/` (cero peticiones a Google, offline-safe), **Pico eliminado** y `app.css` como base/reset (GAP-01), motivo tricolore — la base visual que consumen las 8 pantallas.
- **Home/Categorías (Phase 32):** cabecera serif (overline + título Spectral 38), CTA verde Repaso, fila ghost (Test/Canciones/Backup), switch Contrarreloj, filas de categoría (dot de estado + nombre/tema serif + barra streak/21 + píldora Examen) y tabla editorial en desktop — bindings Alpine intactos, único cambio JS = `streakDays` expuesto.
- **Pantallas de ejercicio (Phase 33):** barra superior unificada (atrás + progreso + contador + chip cronómetro), bloque de pregunta serif con hueco, y estados *comprobado* del handoff en opción múltiple / emparejar / word-buttons. Desviación consciente D-01/D-03: flujo 1-paso / por-pareja conservado.
- **Canciones · reproducción · Resultados · Picker (Phase 34):** lista con tarjeta Continuar/Empezar + tiles tintados + getters presentacionales (`songsForDisplay`/`summaryScore`/`pickerSelectedCount`); reproducción con barra heredada (sin cronómetro); Resultados con anillo `conic-gradient` + X/Y + cascada FALLÓ + errores; picker Editoriale (filas + tick + contador). UAT humano 7/7.
- **Brownfield UI puro:** las 8 pantallas repintadas sin tocar el motor (cascada D-54 con 2 call-sites intactos verificados, sampler, slot-engine, localStorage, schema, migraciones); invariante anti-XSS `x-text`-only mantenido; cada plan con `<threat_model>` (T-02-01) y phase 34 con SECURITY.md (threats_open 0).

---

## v1.7 Presente regolare (Shipped: 2026-06-17)

**Phases completed:** 3 phases (29-31), 6 plans, 11/11 requirements (7 PRES + 2 MIG + 2 INT)
**Stats:** suite 473/474 (483/484 con `VAL_07_STRICT=1`; único fail preexistente AJENO genero-numero). Timeline ~2 días (2026-06-16 → 2026-06-17). `schemaVersion 10→11`.
**Brownfield:** alta de la 10ª categoría `presente-regolare` + cruces multi-cat + migración — el motor v1.4 (cascada D-54, sampler, slot-engine) NO se tocó.
**Known deferred items at close:** 11 quick tasks con status 'missing' (todos PRE-v1.7, tracking-only; ver STATE.md §Deferred Items). Incluye la discrepancia AJENA de conteo genero-numero/preposiciones que deja el reporter VAL-06 en FAIL 197/195 — `presente-regolare` aporta 12=12 sin gap; reconciliación = quick task fuera de scope.

**Key accomplishments:**

- Eslabón 10→11 de la cadena de migración del state: `migrate10to11` resetea selectivamente por prefijo SOLO la categoría nueva `presente-regolare` (espejo de `migrate8to9` con 1 prefijo en vez de 6), `hydrateV11` garantiza shape sin re-podar, y `backup.js` bumpea a 11 con round-trip v11 + import v10→v11 + reject >11.
- 10ª categoría presente-regolare registrada (order 10) y materializada en slot+variantes: 8 objetos-ejercicio (6 multiple-choice cubriendo los 6 grupos de regla -are/-ere/-ire/-isc-/velar/palatal + 2 word-buttons incl. el -isc- reforzado), todas las variantes pending para el quórum, 0 match documentado en notes.
- Los 8 objetos-ejercicio de presente-regolare.json validados 1-por-1 (NUNCA batched, VAL-03) por quórum cross-vendor R1-R7; el quórum cazó 3 bugs reales de ortografía italiana (università / caffè-tè / venerdì) que se corrigieron y re-verificaron; los falsos-positivos de política (C4-accent ASCII + C5-gloss) resueltos por autor-oráculo con audit trail; 8 commits atómicos. PRES-04 cerrado.
- `presente-regolare` carga en boot y `validateContent` la acepta sin un solo error de shape (8 objetos, 18 variantes, todos `validated`); la suite baseline sigue verde (468/469, único fail = el preexistente AJENO genero-numero 12→13, NO regresión de esta fase); conteo DEFINITIVO `exercises.length=8` registrado para que Phase 31 sincronice `TOTAL_EXPECTED` (183→183+8). PRES-01 cerrado end-to-end, motor intacto.
- 4 cruces presente vs passato prossimo (slot+variantes, solo participios regulares, ambas direcciones) que cierran PRES-07, todos validados por quorum cross-vendor Opus+DeepSeek con chequeo explicito de concordancia participio<->sujeto y eleccion de auxiliar (D-31-08).
- presente-regolare (10ª categoria) enganchada al harness de regresion: aparece como entrada NUEVA en los 3 count arrays y en TOTAL_EXPECTED (183->195), con el expected derivado DINAMICAMENTE del JSON real (12 = 8 slots base + 4 cruces, D-31-06, nunca un numero magico); el smoke parametrico y el gate estricto D-VAL-18 corren y pasan sobre la categoria; suite verde salvo el unico fail preexistente AJENO (genero-numero 12->13). v1.7 cerrado end-to-end.

---

## v1.6 Conversión a slots: categorías restantes (CONV-01 cierre) (Shipped: 2026-06-09)

**Phases completed:** 7 phases (21-27), 19 plans, 14/14 requirements (2 MIG + 6×2 conversión)
**Stats:** 155 commits, 374/374 tests verdes (383/383 con `VAL_07_STRICT=1`), reporter VAL-06 183/183. Git range `fa6660b`→`dcdd777`. Timeline: ~4 días (2026-06-05 → 2026-06-09). `schemaVersion 8→9`.
**Brownfield:** reutiliza toda la maquinaria slot+variantes del motor v1.4 (getter slot-aware, sampler por slot, cascada D-54 con 2 call-sites, smoke bifurcado por shape) — el motor NO se tocó.
**Known deferred items at close:** 2 (quick tasks 260525-pwq + 260525-vvj, ya shipped en v1.0 con tracking huérfano — ver STATE.md §Deferred Items).

**Key accomplishments:**

- **Migración `8→9` reset selectivo de 6 categorías (MIG-03/04, Phase 21):** `migrate8to9`/`hydrateV9` idempotente + deep-clone anti-prototype-pollution; resetea el progreso SOLO de las 6 categorías a convertir vía un predicado de 6 prefijos; las 3 ya convertidas byte-intactas; `backup.js` round-trip v9 + import v8→v9 + rechazo `>9`. Va PRIMERA (desbloquea la renumeración de ids).
- **Avere → slots (AVE-01/02, Phase 22):** 23 ejercicios → **19 slots** por regla (presente por persona + sensaciones + idiomático `aver ragione` + passato prossimo + cruces multi-cat avere-300..305 con id estable y cascada D-54 intacta). 14 superficies nuevas por quórum cross-vendor R1-R7. Counts 23→19, TOTAL_EXPECTED 323→320.
- **Essere → slots (ESS-01/02, Phase 23):** 39 ejercicios → **26 slots** (presente + identidad/nacionalidad/profesión/estado/cópula + participio stato/stata/stati/state). 14 superficies nuevas + SLOT NUEVO ser/estar (D-23-07). Counts 39→26, TOTAL_EXPECTED 320→307.
- **Verbi di movimento → slots (MOV-01/02, Phase 24):** 37 ejercicios → **7 slots** por la REGLA DE AUXILIAR (essere-vs-avere en passato prossimo, concordancia en un solo slot, correre aislado). 20 superficies nuevas por quórum. Counts 37→7, TOTAL_EXPECTED 307→277.
- **Genere e numero → slots (GEN-01/02, Phase 25):** 40 ejercicios → **12 slots** de morfología género/plural (terminaciones + formación de plural; 3 match por D-04). 20 superficies nuevas por quórum. Counts 40→12, TOTAL_EXPECTED 277→249.
- **Professioni → slots HÍBRIDO (PROF-01/02, Phase 26):** 51 ejercicios → **11 slots** (bloque regla de feminización rule-rich CON variantes + bloque léxico puro SIN variantes: comprensión + 3 match + articolo-suono + word-buttons). 12 superficies nuevas SOLO en feminización. Resuelve la open question (híbrida, no léxica pura). Counts 51→11, TOTAL_EXPECTED 249→209.
- **Sostantivi irregolari → slots HÍBRIDO (SOST-01/02, Phase 27 — CIERRE):** 31 ejercicios (100% MC) → **5 slots** (bloque regla sovrabbondanti `-o→-a` + invariabili acentuadas/extranjeras CON variantes + bloque léxico cambio-radice + contraste plurali-regolari SIN autoría). 13 superficies nuevas por quórum; el cross-vendor cazó 4 bugs R7 de doble-validez (cigli/sopraccigli/lenzuoli/migli) reformulados. Counts 31→5, TOTAL_EXPECTED 209→183.
- **CONV-01 CERRADO:** las 9 categorías de gramática quedan en formato slot+variantes unificado. Las dos léxicas (Professioni, Sostantivi irregolari) resueltas como híbridas sin forzar variantes artificiales. El motor v1.4 nunca se reconstruyó — brownfield puro contenido + migración.

---

## v1.5 — Conversión a slots: Bloque Artículos (Shipped: 2026-06-05)

**Phases completed:** 3 phases (18-20), 7 plans, 9/9 requirements (4 ART + 3 PART + 2 MIG)
**Stats:** 91 files changed, +8,245/−2,384 LOC, 358/358 tests verdes (367/367 con `VAL_07_STRICT=1`). Git range `2fde105`→`1e2e30c` (69 commits). Timeline: 3 días (2026-06-03 → 2026-06-05).
**Brownfield:** reutiliza toda la maquinaria v1.4 (motor slot-aware, sampler, cascada D-54, schema-validator, smoke bifurcado por shape) — NO se toca el engine; `schemaVersion 7→8`.

**Key accomplishments:**

- **Migración `7→8` reset selectivo (MIG-01/02, Phase 18):** `migrate7to8`/`hydrateV8` + `CURRENT_SCHEMA_VERSION=8` (espejo en storage.js + backup.js) clonando el patrón `migrate6to7`/`hydrateV7`, reseteando el progreso SOLO de Articoli + Partitivos (las otras 7 categorías byte-intactas, verificado por fixture de 9 categorías). Backup round-trip v8 + import v7→v8 con reset + rechazo `>8`. 1 plan TDD.
- **Articoli → slots (ART-01..04, Phase 19):** `articoli.json` reescrito de 56 ejercicios legacy `payload` a **34 slots** `slot+variantes` (16 determinativi lo/gli split por sub-disparador fonético + 8 indeterminativi como slots propios + 2 match + 6 cruces con id estable, explanation top-level mergeada D-17-05).
- **Partitivi → slots (PART-01..03, Phase 20):** `partitivos.json` reescrito de 44 ejercicios legacy a **19 slots** (10 del-formas split por sub-disparador + 3 alternativas qualche/un po' di/alcuni-e + 1 contraste de negativa con `∅` como skill propio + 1 clasificación partitivo-vs-preposizione MC de 3 opciones + 2 match; pares contable/incontable absorbidos por `correctIndex` real).
- **Variantes nuevas por quórum cross-vendor (Phases 19+20):** 14 superficies nuevas (8 Articoli + 6 Partitivi) pasaron el quórum completo R1-R7 (Gemini + DeepSeek + Opus 4.7 + Sonnet 4.6, 4× correcta cero incorrecta, 1-por-1 NUNCA batched) — engorde de celdas pobres + slots nuevos de huecos de suoni speciali (semiconsonánticos `lo/gli-yi`, `degli-gn/ps`). El cross-vendor volvió a cazar disputed (falso-positivo de acento de DeepSeek en 'piden') resueltos sin override-atajo.
- **Counts re-sincronizados (ART-04 + PART-03):** los 3 hardcodes de count + `TOTAL_EXPECTED` sincronizados al conteo REAL leído del JSON (Articoli 370→348, Partitivi 348→323); smoke shape-agnostic y reporter verdes sin tocar validator/loader/motor. Verificación de fase 9/9 must-haves.
- **CONV-01 bloque Artículos cerrado:** 3 de 9 categorías ya en formato unificado slot+variantes (preposiciones piloto + articoli + partitivos); demuestra que el patrón pilot→escala funciona reutilizando la maquinaria sin reconstruir nada. Quedan las 6 categorías verbos+morfología para milestones futuros.

**Known deferred items at close:** 2 (acknowledged — see STATE.md §Deferred Items). Son los mismos 2 quick tasks heredados de v1.0 (`260525-pwq` shuffle multi-choice, `260525-vvj` botón reiniciar examen — ambos shipped, marcados "missing" por frontmatter sin status reconocible), ya acknowledged en los cierres de v1.3 y v1.4. Sin relación con el scope de contenido de v1.5.

---

## v1.4 — Variantes de ejercicio (slots por regla) (Shipped: 2026-06-03)

**Phases completed:** 3 phases (15-17), 9 plans, 17/17 requirements (6 SLOT + 6 EXAM + 5 PILOT)
**Stats:** 59 files changed, +10,310/−854 LOC, 342/342 tests verdes (+36 desde v1.3). Git range `dfa2695`→`2fde105`. Timeline: 2 días (2026-06-02 → 2026-06-03).
**Brownfield:** reutiliza la cascada D-54, el sampler ponderado, el schema-validator y el patrón Test-completo del engine v1.0 — NO reconstruye el motor; `schemaVersion 5→6→7`.

**Key accomplishments:**

- **Modelo de datos slot+variantes (SLOT-01..06):** `validateContent` acepta `payload` XOR `variants[]` reusando validadores de superficie por tipo; `loadContent` expone un `slotById` uniforme derivado vía la función pura `normalizeExerciseToSlot` (legacy→slot-de-1) sin tocar `exerciseById`. Explicación pedagógica a nivel de slot (compartida por sus variantes). Migración `5→6` (`migrate5to6`/`hydrateV6`) idempotente + deep-clone defensivo + `backup.js` round-trip v6.
- **Back-compat verificada (SLOT-06):** las 9 categorías reales siguen validando intactas con el validator extendido y se interpretan como slots de 1 variante; el autor confirmó en navegador que la app arranca con las 9 categorías como hoy, el state persiste en v6 sin reset y el backup round-trip funciona.
- **Motor de examen por slots (EXAM-01..06):** `pickVariantIndex` uniforme + `variantIndices` paralelo en `buildSession`/`buildFullTest` fija 1 variante aleatoria por slot; "categoría hecha" = pasar 1 variante de cada slot; render slot-aware vía getter con `.payload` sintético threaded por los 3 launch sites / inFlightTest / sessionResults / summary-errors. Cascada D-54 intacta con exactamente 2 call-sites de `applyImmediateFailure` (Pitfall #2 verificado por grep). Repaso 20 / Test / Examen integran el muestreo por slot.
- **Reset selectivo de Preposiciones (PILOT-04):** `migrate6to7`/`hydrateV7` resetean SOLO el progreso de Preposiciones (categoryProgress + exerciseStats por prefijo + inFlightTest) vía bump nominal de `schemaVersion 6→7`; las otras 8 categorías quedan byte-intactas; `backup.js` extendido a round-trip v7.
- **Piloto Preposiciones (PILOT-01..03, 05):** los 52 ejercicios validados reagrupados en 47 slots por regla/forma (4 slots fusionados con explanation mergeada: SUL 3v, AL 2v, DI-posesso 2v, TRA-futuro 2v) → 49 slots tras autorar 41 variantes nuevas vía quórum cross-vendor (DeepSeek + Opus + Sonnet, **6 bugs reales cazados, 2 variantes rechazadas por doble-validez**) + 2 slots locativos nuevos (`in spiaggia/montagna/campagna` + `al mare`, hueco que no estaba en ninguna categoría). Smoke paramétrico bifurcado por shape (slot/legacy) — reutilizable para CONV-01.

**Known deferred items at close:** 3 (acknowledged — see STATE.md §Deferred Items). 2 son quick tasks heredados de v1.0 (`260525-pwq` shuffle multi-choice, `260525-vvj` botón reiniciar examen — ambos shipped, marcados "missing" por frontmatter sin status reconocible); 1 es un todo de contenido futuro (`articulos-indeterminados-partitivos`) sin relación con el scope de motor de v1.4.

**Note:** Cerrado sin `/gsd:audit-milestone` previo (opcional) — readiness verificada manualmente: 17/17 requirements check, 3/3 fases con SUMMARY.md, 342/342 tests verdes.

---

## v1.3 — Canciones (bloque de traducción) (Shipped: 2026-06-02)

**Phases completed:** 2 phases (13-14), 3 plans, ~6 tasks
**Stats:** +1,101 LOC (`src/`, `content/`, `index.html`), 306/306 tests verdes, 19/19 requirements (4 SONG + 5 PLAY + 4 LINK + 3 DATA + 3 CONT). Git range `9d29e90`→`ea59cfe`. Timeline: 1 día (2026-06-02).
**Brownfield:** reutiliza el engine v1.0 (cascada D-54, word-buttons `grade()`, schema-validator `PAYLOAD_VALIDATORS`, patrón Test-completo) — NO reconstruye el motor.

**Key accomplishments:**

- Bloque "Canciones" separado del home (6º `currentScreen`): listado con estado por canción (no hecha / pasada / fallada) + número de frases; estado plano `{status, lastPlayedAt}` persistido en localStorage entre sesiones (NO dominada/racha/21-day) — SONG-01..04.
- Playthrough secuencial it→es reutilizando word-buttons en dirección INVERSA (línea italiana = prompt → user construye tokens españoles): N frases en orden tipo Test completo sin reinicio a mitad, feedback verde/rojo inmediato con traducción correcta al fallar, resumen post-canción (Block A frases falladas vs correcta + Block B impacto en categorías) — PLAY-01..05.
- Enganche al motor por frase vía cascada D-54: fallar una frase con `categoryIds` resetea esas categorías gramaticales (1 solo call-site, reusando `applyResultToSession`, 0 nuevos `applyImmediateFailure`); frases sin categoría guardadas sin cascada (LINK-03, preparado para CATPROC futuro); canciones standalone fuera del sampler Repaso 20 / Test / tabla de categorías (LINK-04) — LINK-01..04.
- Modelo de datos coherente con lo existente: schema de canción + `validateSongs` export separado (no extiende `PAYLOAD_VALIDATORS`) con banner visible, `migrate4to5`/`hydrateV5` deep-clone defensivo (schemaVersion 4→5), `backup.js` extendido a v5 para round-trip export/import — DATA-01..03.
- Primera canción real "Equilibrio mentale (Home piano session) — Ultimo" autorada como 17 frases it→es (limpieza de ruido no-lírico + segmentación por sentido + traducción curada por bloques + enganche limpio) con validación ligera autor-oráculo (1 pase IA, NO quórum estricto R1-R7) — CONT-01..03.
- Bug del MOTOR cazado durante UAT humano: `bankWithKeys` guardaba solo contra `sessionCurrentExercise` (null en modo canción por LINK-04), dejando el banco de palabras vacío en TODAS las canciones; arreglado en `02d6f4a` + tests de regresión. Tras el fix el autor confirmó la canción jugable de principio a fin.

**Known deferred items at close:** 4 (acknowledged — see STATE.md §Deferred Items). 2 son quick tasks heredados de v1.0 (`260525-pwq` shuffle multi-choice, `260525-vvj` botón reiniciar examen — ambos shipped, marcados "missing" por frontmatter sin status reconocible); 2 son escenarios human-UAT de Phase 13 (cascada D-54 desde frase de canción, PLAY-05 abandono/re-entrada, LINK-04 aislamiento) cubiertos por tests automáticos (306/306) y por la confirmación en navegador de Phase 14, pero nunca click-through manual formal.

---

## v1.2 Más contenido A1 (Articoli + Partitivos) (Shipped: 2026-05-28)

**Phases completed:** 4 phases, 10 plans, 21 tasks

**Key accomplishments:**

- Temario exhaustivo de Articoli (determinativi il/lo/l'/la/i/gli/le + indeterminativi un/uno/una/un') cruzado con cada disparador fonetico y las 6 trampas canonicas D-04, aprobado por el autor como checklist de cobertura previo a cualquier ejercicio.
- 1. [Rule 3 - Blocking] Registrar `articoli` en categories.json
- `content/exercises/articoli.json` = 56 ejercicios.
- N = 56
- 56/56 ejercicios de articoli validados por quórum cross-vendor (DeepSeek Flash + Opus 4.7); 8 bugs de autoría capturados y corregidos; gate verde cerrado (reporter exit 0 328/328, smoke estricto 268/0).
- Temario de cobertura del partitivo italiano estructurado sobre el eje incontable↔contable — 7 formas del/dello/della/dell'/dei/degli/delle × disparador fonético heredado de Articoli + 3 alternativas por restricción gramatical + omisión en negativa + distinción partitivo/preposizione (PART-05), commiteado ANTES de cualquier ejercicio (D-13).
- 37 ejercicios multiple-choice de Partitivos (del-formas incontable/contable 001-026 + alternativas por restricción gramatical 027-033 + mini-bloque omisión ∅ 034-037), todos pending para quórum, validando contra el schema.
- Cierra el contenido de Partitivos en N=44: bloque match sustantivo↔forma partitiva (D-08) + 5 ejercicios de clasificación partitivo-vs-preposizione articolata (PART-05), todos `status: pending` para el quórum de 12-05.
- Cablea la categoría partitivos en los 3 puntos de integración con los conteos en LOCKSTEP a N=44 (longitud real de partitivos.json): categories.json order 9 (verificada, ya presente), reporter CATEGORIES { slug, file, expected:44 } + TOTAL_EXPECTED 328->372, y test CATEGORIES_WITH_EXPLANATIONS expected:44 (sin slug). Cubre PART-01 sin tocar engine ni UI.
- Plan:

---

## v1.1 — Validación editorial (Shipped: 2026-05-27)

**Phases completed:** 2 phases (9-10), 8 plans

**Key accomplishments:**

- Infraestructura de validación (Phase 9): campo `validation` opcional en el schema con `deriveStatus()` sticky-disputed, `VALIDATION-PROMPT.md` self-contained que operacionaliza R1-R7 en 5 criterios binarios C1-C5, skill `gsd-validate-exercise` (quórum Opus 4.7 + Sonnet 4.6, 1-por-1 con context aislado), smoke test paramétrico VAL-07 tras feature flag, y piloto end-to-end de 3 ejercicios.
- Sub-skill `gsd-validate-batch` (Phase 10): orquestador inline que itera la validación por categoría con resume idempotente (estado de verdad en los JSON), checkpoints AskUserQuestion, y cola disputed con 4 caminos (accept-fix / reject+override / rewrite / skip) + reporter `run-validation-271.mjs` zero-deps con 3 sub-gates.
- 272/272 ejercicios validados por ≥2 IAs distintas en las 7 categorías (preposiciones 51, avere 23, essere 39, genero-numero 40, profesiones 51, sustantivos-irregulares 31, verbos-movimiento 37). 55 disputed resueltos, 0 deferred.
- Clases de bug editorial cazadas y corregidas: meta-staging del curador en explanations, doble-validez (formas con dos plurales/femeninos aceptados + género no fijado), errores factuales en explanations, y leak de regla en el prompt vía etiquetas. El autor como oráculo final en cada disputed (overrides registrados con `by:autor`).
- +1 ejercicio al corpus (`preposiciones-051`, par di/su) creado durante la resolución de disputed. Constantes 271→272 actualizadas en reporter y test. Gates de cierre verdes: reporter exit 0 (VAL-04+06+08) + smoke test estricto `VAL_07_STRICT=1 node --test tests/*.test.js` 261/261 PASS.
- Audit trail completo en git: 1 commit por ejercicio validado + commits fix/override POST-fix por cada disputed resuelto + STATE.md por categoría (~370 commits desde v1.0).

---

## v1.0 v1.0 — Italian Course A1/A2 (motor re-verificación + 7 categorías + Modo Examen) (Shipped: 2026-05-25)

**Phases completed:** 12 phases, 26 plans, 71 tasks

**Key accomplishments:**

- Walking Skeleton complete — Alpine 3.15.12 + Pico 2.1.1 (CDN+SRI), pure domain modules with 14-test node --test suite, hand-written schema validator with NFC normalization, localStorage wrapper keyed `italianCourse.v1`, and 12 Avere seed exercises ready for Plan 02 to wire the UI.
- End-to-end loop verified by user. La app arranca con `npx serve`, carga 10-12 ejercicios de Avere, responde clicks con feedback verde/rojo (verde auto-avanza 600ms, rojo requiere "Siguiente"), persiste contadores UNA sola vez al final, y al recargar refleja los contadores. 8/8 verificaciones manuales aprobadas. 14/14 tests del dominio siguen verdes.
- Máquina de estados pura del dominio v2: cascada fail-wins, promociones no-hecha→hecha→dominada (21 días), racha con `lastSuccessDate` guard, `dailyLog` idempotente, migración schemaVersion 1→2 transparente — 38 tests verdes (14 supervivientes Phase 1 + 8 nuevos de storage + 18 nuevos del state machine).
- Sampler completo (GUARANTEE + FILL + buildFullTest) + DOMAIN-06 implementado como `applyNewExerciseRegression` pura separada con preservación crítica de `clearedExerciseIds` (D-40) — 51 tests verdes (38 supervivientes Plan 02-01 + 8 sampler nuevos + 5 DOMAIN-06 nuevos).
- Domain tests:
- Domain tests:
- Tipo word-buttons funcional end-to-end (click + teclado 1-9 + Backspace + Enter), schema validator refactorizado a dispatch table cerrada con los 3 tipos Phase 3, y helper compartido applyResultToSession que centraliza la cascada D-54 en un único call-site para preparar 03-02 sin riesgo de duplicación.
- Tipo match operativo con click izq → click der (o teclado 1-9 + a-i), cascada D-61 inmediata + idempotente al primer fallo (guard `matchHadFailure` con 2 call-sites EXACTOS de `applyImmediateFailure` verificados por test), grading con duplicados textuales en columna derecha (D-66 consumo por índice), y dispatch table del validator cerrada con 3 impls reales (sin stubs intermedios).
- PASS
- State schema v3 + módulo puro `src/data/backup.js` con `parseBackupFile`/`buildBackupWrapper` (6 reject paths español verbatim del UI-SPEC) + helper `daysSinceISO` DST-safe + pantalla Backup completa (handlers export/import, banner home recordatorio >7d con reactividad sobre `state.lastBackupAt`, 3er botón en home, firstUsedAt plumbing inline en 4 call-sites) + 23 tests nuevos (128/128 verdes) — el autor puede exportar/importar progreso desde el día 1 del plan ANTES de transcribir los 6 PDFs.
- Setup de las 6 categorías + transcripción de Preposiciones (50 ejercicios cobertura PDF completa) y Verbos de movimiento (37 ejercicios cobertura PDF completa) + helper validate-content-fixture.mjs + placeholders B-1.
- Transcripción de los 3 PDFs restantes (Sustantivos Irregulares 31 + Género y Número 40 + Profesiones 51 = 122 ejercicios nuevos) + DESIGN RULE 'match-if-not-trivial-by-root' anclada como patrón normativo + retro-patch a sustantivos-irregulares + meta-rule -ista invariable + 3rd match profesión↔acción.
- Cierre Phase 4 — SEED-02 multi-cat (6 cruces avere-300..305) + smoke test cascada real (130 tests verdes) + UAT integral 5/5 ROADMAP success criteria.
- Essere cerrada como 7ª categoría con 39 ejercicios A1 (conjugación + identidad + nacionalidad + profesión + estado + cópula + participio) + 6 cruces multi-cat espejo del patrón Phase 4 — el milestone v1.0 queda funcionalmente simétrico (Avere ↔ Essere).
- Vertical slice MVP (UX-01) entregado end-to-end:
- Vertical slice MVP (UX-02) entregado end-to-end
- Optional `payload.explanation: string` field across 3 exercise types + dual render (inline feedback + summary-errors) + 2 seed explanations en preposiciones-001/006, todo en una vertical slice con UAT 6/6 PASS
- 50/50 explanations curadas para `content/exercises/preposiciones.json` via patrón D-85 (3 batches con review autor frase por frase) + smoke test paramétrico + reapertura PROJECT.md Out of Scope con audit trail del pivote post-uso-real
- 50 explanations Preposiciones re-acentuadas con español correcto (acentos + ñ) + smoke test refactorizado a array paramétrico extensible — tests 181/181 verdes en cada commit
- 40 explanations Género-Número ingestadas del draft pre-revisado del autor en 1 commit honesto + 2ª entry al array smoke paramétrico atómica (anti-rojo) + audit trail completo PROJECT/REQ/ROADMAP — tests 184/184 verdes, UAT humano 6/6 PASS
- 23/23 explanations Avere curadas en 2 batches D-85 (12 MC presente/idiomático/passato prossimo + 2 word-buttons + 3 match + 6 multi-cat) tras relajar el guard APPEND-ONLY con helper `stripAdditive` (D-178 opción A) + CLI `--path` para roundtrip dry-run. Tests 184 → 187/187 verdes.
- 31/31 explanations Sustantivos-irregulares curadas en 2 batches D-85 (17+14, todos multi-choice). Patrón Edit ancla larga aplicado preventivamente desde el primer ejercicio. Tests 187 → 190/190 verdes. Cobertura editorial total: 113/271 → 144/271 = 53.1%.
- 37/37 explanations Verbos-movimiento curadas en 2 batches D-85 (19+18, 34 multi-choice + 3 word-buttons). D-159 cross-ref constraint preservado con regex ampliada Warning 10 (cero referencias a Essere por ID o prosa). Patrón Edit ancla larga aplicado preventivamente — cero ocurrencias del bug 7.2-01 Batch A. Tests 190 → 193/193 verdes. Cobertura editorial total: 144/271 → 181/271 = 66.8%.
- 39/39 explanations Essere curadas en 2 batches D-85 (21+18, 35 multi-choice + 4 word-buttons). D-166 cross-refs útiles materializadas con holgura 8x sobre el mínimo (24 matches sobre ≥3 obligatorio — Warning 7). Patrón Edit ancla larga aplicado preventivamente — cero ocurrencias del bug 7.2-01 Batch A. Tests 193 → 196/196 verdes. Cobertura editorial total: 181/271 → 220/271 = 81.2%. Solo Profesiones (51) resta para cobertura 100%.
- 51/51 explanations Profesiones curadas en 3 batches D-85 (17+17+17, 43 multi-choice + 5 word-buttons + 3 match). Batch C ATÓMICO unificó ingest contenido + entry array `CATEGORIES_WITH_EXPLANATIONS` (7ª entry) + audit trail consolidado PROJECT.md/REQUIREMENTS.md/ROADMAP.md en UN SOLO COMMIT (Blocker 3 — D-162 + D-167 + D-169 unificados). Tests 196 → 199/199 verdes. Patrón Edit ancla larga aplicado preventivamente — cero recovery commits, notes preservados 51/51. Cobertura editorial total: 220/271 → 271/271 = 100%. EXPL-13 + EXPL-14 cerrados. Phase 7.2 ESTRUCTURALMENTE COMPLETA — milestone v1.0 pre-ship listo (autor decide cuándo ejecutar /gsd-complete-milestone v1.0 — D-180 closure separada).
- `.planning/PROJECT.md`

---
