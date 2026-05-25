# Roadmap: Italian Course — Ejercicios A1/A2

**Created:** 2026-05-23
**Granularity:** coarse (3-5 fases, 1-3 planes cada una)
**Mode:** MVP — vertical slices, cada fase entrega una capacidad usable end-to-end
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Phases

- [x] **Phase 1: Loop mínimo end-to-end** — La app arranca, carga JSON validado y permite hacer una sesión real de multiple-choice sobre Avere con persistencia básica (completed 2026-05-23)
- [x] **Phase 2: Mecánica completa de re-verificación** — Estados, cascada de fallo, racha, dashboard y resumen — el motor que "te obliga a no olvidar" está operativo (completed 2026-05-23)
- [x] **Phase 3: Variedad de ejercicios + ergonomía de teclado** — word-buttons y match completan los tres tipos; atajos 1-4/Enter/Space hacen la práctica diaria fluida (completed 2026-05-24)
- [x] **Phase 4: Backup robusto + contenido completo** — Export/import + recordatorio de backup + los 6 PDFs transcritos a JSON (incluyendo ejercicios multi-categoría para ejercitar la cascada en uso real) — 4/4 plans complete (pending verifier) (completed 2026-05-24)
- [x] **Phase 5: Essere — categoría fundamental que faltaba** — Detectado durante UAT post-Phase 4: tenemos Avere como categoría dedicada pero NO Essere, pese a ser igualmente fundamental para A1 (identidad, profesión, nacionalidad, estado, copula). Essere está exercitado indirectamente vía verbos-movimiento (auxiliar passato prossimo) pero no como verbo independiente. Esta fase añade `content/exercises/essere.json` siguiendo el patrón D-85 (Claude propone desde conocimiento A1 genérico — no hay PDF — autor revisa pedagógicamente y commitea). (completed 2026-05-24)
- [x] **Phase 6: Polish UX post-sesión — reiniciar + review errores** — Detectado durante UAT Phase 4/5: dos puntos de fricción ergonómica que valen lo que cuesta resolver antes de cerrar el milestone v1.0. (a) Botón "Reiniciar ejercicios" en la pantalla de sesión que rearranca con las mismas categorías en 1 clic (vs los 4 actuales). (b) Sección "Errores cometidos" en la pantalla de resumen final que muestra, para cada ejercicio fallado, qué respondió el autor + qué era correcto + sobre qué frase. Ambos son polish UX sobre flujos existentes (sin lógica de dominio nueva — el motor de re-verificación no cambia). Absorbe Phase 999.1 + 999.2 del backlog. (completed 2026-05-24)
- [x] **Phase 7: Explicaciones pedagógicas al fallar — campo explanation por ejercicio + render en Errores cometidos** — Pivote post-uso-real: tras 271 ejercicios funcionando, el autor consultaba Gemini cada vez que fallaba en Preposiciones (4 ejemplos: sulle, da lui, dalle, sui). Esta fase reabrió la decisión Phase 1 "solo bien/mal por velocidad; la teoría está en los PDFs" y añadió un campo `payload.explanation: string` opcional + render inline durante feedback rojo + render en summary "Errores cometidos". Seed entregado: 50/50 explanations curadas para Preposiciones (patrón D-85, 3 batches de 15+16+17). Las otras 6 categorías quedan opcionales para fases incrementales (7.1, 7.2, ...) si emerge dolor adicional. (completed 2026-05-25 — 181/181 tests verdes, UAT 13/13 PASS)
- [x] **Phase 7.1: Explicaciones pedagógicas Género-Número + canonicalización ortográfica** — Canon ortográfico nuevo (español correctamente escrito con acentos y ñ) aplicado retroactivamente a las 50 Preposiciones + 40 explanations Género-Número ingestadas del draft pre-revisado del autor + smoke test paramétrico CATEGORIES_WITH_EXPLANATIONS instalado para fases incrementales futuras 7.2..7.6. (completed 2026-05-25 — 184/184 tests verdes, UAT 6/6 PASS)

## Phase Details

### Phase 1: Loop mínimo end-to-end (Avere + multiple-choice)
**Goal**: El autor puede arrancar la app con `npx serve`, ver una categoría real (Avere) y completar una sesión de multiple-choice cuyo resultado persiste en localStorage al recargar
**Mode:** mvp
**Depends on**: Nada (primera fase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, EXTYPE-01, DOMAIN-01, DOMAIN-02, DOMAIN-09, SESSION-04, SESSION-05, BACK-01, BACK-02, BACK-03
**Success Criteria** (qué tiene que ser CIERTO):
  1. El autor ejecuta `npx serve` en la carpeta del proyecto, abre `http://localhost:3000` y la app arranca sin errores (Alpine + Pico cargados desde CDN con versiones pinned, textos en español)
  2. La app carga `categories.json` + `content/exercises/avere.json` con validación de schema; si hay un JSON inválido o un `categoryId` desconocido, aparece un banner de error visible en la UI con archivo + problema (no silencioso en consola)
  3. El autor puede lanzar una sesión de multiple-choice contra Avere, responder cada ejercicio con feedback verde/rojo (verde auto-avanza ~600ms, rojo muestra respuesta correcta y botón "Siguiente"), y ver el indicador "Ejercicio X / N" durante toda la sesión
  4. Al terminar la sesión, los contadores `timesShown`/`timesCorrect`/`timesFailed` por ejercicio se persisten una sola vez en localStorage bajo la clave `italianCourse.v1` (con `schemaVersion`), y al recargar la página los contadores reflejan exactamente la sesión anterior
  5. La función `dates.todayLocal()` devuelve `YYYY-MM-DD` en hora local (no UTC) y la función `session.buildSession()` genera sesiones que respetan el muestreo ponderado básico `1/(1+min(timesShown,10))` — verificable con un smoke test manual contra una semilla mínima de Avere
**Plans**: 2 plans
- [x] 01-01-PLAN.md — Esqueleto del proyecto: HTML+CDN(SRI), módulos src/{domain,data,exercise-types}, validador, storage wrapper, funciones puras testadas con node --test, seed Avere (10-12 ejercicios) — **completado 2026-05-23**, ver [01-01-SUMMARY.md](./phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-01-SUMMARY.md)
- [x] 01-02-PLAN.md — Pantalla de sesión Alpine: render multiple-choice, feedback verde/rojo, indicador Ejercicio X/N, auto-avance 600ms, persistencia única al final + verificación humana end-to-end — **completado 2026-05-23** (UAT 8/8 aprobado), ver [01-02-SUMMARY.md](./phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md)

### Phase 2: Mecánica completa de re-verificación (cascada + estados + dashboard)
**Goal**: El autor ve la home con todas las categorías (estado / racha / fecha) y experimenta la mecánica completa: fallar un ejercicio multi-categoría resetea todas sus categorías y la racha a 0; completar sin fallar promociona a `hecha`; 21 días seguidos promocionan a `dominada`; el resumen de fin de sesión hace visible el delta
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DOMAIN-03, DOMAIN-04, DOMAIN-05, DOMAIN-06, DOMAIN-07, DOMAIN-08, DOMAIN-10, SESSION-01, SESSION-02, SESSION-03, SESSION-07, SESSION-08, SESSION-09
**Success Criteria** (qué tiene que ser CIERTO):
  1. La pantalla home muestra TODAS las categorías cargadas con su estado (`no-hecha`/`hecha`/`dominada` con marcas visuales distintas), días de racha actuales, total de ejercicios y última fecha practicada
  2. El autor elige categorías con checkboxes (select-all / clear-all) y lanza "Repaso de 20" o "Test completo" (este último muestra advertencia con el número total de ejercicios antes de arrancar)
  3. Al fallar un ejercicio que toca N categorías, las N pasan inmediatamente a `no-hecha` con racha a 0 y `clearedExerciseIds` vacío; al completar todos los ejercicios de una categoría sin fallar pasa a `hecha`; tras 21 días distintos de práctica-sin-fallo (contando 1 vez por día via `lastSuccessDate`) pasa a `dominada` pero sigue apareciendo en sesiones igual
  4. Una categoría `hecha` o `dominada` vuelve automáticamente a `no-hecha` cuando se añade al JSON un ejercicio nuevo que no está en su `clearedExerciseIds`
  5. Al terminar cualquier sesión aparece una pantalla de resumen (no toast) con aciertos/fallos y, por cada categoría tocada, su estado antes→después, racha antes→después y ejercicios pendientes para `hecha`; una sesión Repaso abandonada (cerrar pestaña antes del resumen) se descarta sin afectar al estado; una sesión "Test completo" abandonada se ofrece reanudar al volver
  6. Existen smoke tests unitarios que simulan ≥30 días de actividad cubriendo cascada multi-categoría, racha-una-vez-por-día, promoción `no-hecha → hecha → dominada`, regresión `dominada → no-hecha`, sampler con categorías de 1-2 ejercicios, oversubscription y weight cap
**Plans**: 4 plans
- [x] 02-01-PLAN.md — Storage v2 + applySessionResult extendido con cascada + promociones + racha guard + dailyLog + tests dominio — **completado 2026-05-23**, ver [02-01-SUMMARY.md](./phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-01-SUMMARY.md)
- [x] 02-02-PLAN.md — Sampler GUARANTEE phase + buildFullTest + applyNewExerciseRegression (DOMAIN-06 boot) + tests sampler — **completado 2026-05-23**, ver [02-02-SUMMARY.md](./phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-02-SUMMARY.md)
- [x] 02-03-PLAN.md — appShell factory plano + home dashboard + picker compartido + sesión migrada + main.js refactor + UAT 7/7 — **completado 2026-05-23** (UAT 7/7 aprobado tras 2 rondas, includes D-54 fail inmediato + D-55 racha display refinements), ver [02-03-SUMMARY.md](./phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-03-SUMMARY.md)
- [x] 02-04-PLAN.md — Pantalla summary + inFlightTest persistence + banner home reanudar/descartar + confirmaciones D-43/D-44 + smoke test integrado 30 días + UAT 6/6 — **completado 2026-05-23** (UAT 6/6 aprobado tras 2 rondas), ver [02-04-SUMMARY.md](./phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-SUMMARY.md)
**UI hint**: yes

### Phase 3: Variedad de ejercicios + ergonomía de teclado
**Goal**: El autor puede practicar los tres tipos de ejercicio (multiple-choice, word-buttons, match) en una misma sesión y operar toda la práctica desde el teclado (1-4 / Enter / Space) sin tocar el ratón
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: EXTYPE-02, EXTYPE-03, SESSION-06
**Success Criteria** (qué tiene que ser CIERTO):
  1. Un ejercicio `word-buttons` muestra una frase en español, presenta botones con palabras italianas (más distractoras si las hay), permite construir la traducción pulsándolos en orden y validar con un botón "terminado"; la cascada de fallo y la actualización de contadores funcionan exactamente igual que para multiple-choice
  2. Un ejercicio `match` muestra dos columnas, el autor empareja con click-izquierda → click-derecha; al completar todas las parejas el ejercicio se valida y aplica los mismos efectos sobre estado/contadores
  3. Una sesión de Repaso o Test completo que mezcla los tres tipos corre de principio a fin sin saltos de UI ni fallos de grading, y el resumen final agrega correctamente aciertos/fallos por categoría
  4. Las teclas 1-4 seleccionan opciones de multiple-choice, Enter confirma / avanza tras un fallo, Space funciona como alias de Enter; el autor completa una sesión de 20 ejercicios sin necesidad de ratón (incluyendo word-buttons y match con foco visible y selección por teclado)
**Plans**: 3 plans
- [x] 03-01-PLAN.md — Slice vertical word-buttons: schema validator a dispatch table + grade() puro + sub-template Alpine + sub-estados appShell + helpers compartidos (applyResultToSession, initSubStateForExercise, handleSessionKey) + ergonomía teclado 1-4 multi-choice + 1-9 word-buttons + Enter/Space/Backspace + seed avere.json (2 word-buttons) + tests — **completado 2026-05-23** (81/81 tests verdes, 6 commits, helpers compartidos instalados), ver [03-01-SUMMARY.md](./phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-01-SUMMARY.md)
- [x] 03-02-PLAN.md — Slice vertical match: schema validator (reemplaza stub) + grade() con consumo de índices D-66 + sub-template Alpine 2 columnas + sub-estados match + handlers matchSelectLeft/matchPickRight + flashMatchPair + cascada D-61 inmediata idempotente + ergonomía teclado 1-9 izq + a-i der + seed avere.json (3 match incluyendo duplicados D-66) + tests — **completado 2026-05-23** (105/105 tests verdes, 2 commits, EXTYPE-03 cierra), ver [03-02-SUMMARY.md](./phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-02-SUMMARY.md)
- [x] 03-03-PLAN.md — Checkpoint UAT exhaustivo: 4 criterios ROADMAP + 8 pitfalls verificados + 2 exploit-proof checks (D-54 + D-61) + D-66 duplicados visuales + veredicto PASS/NEEDS-PATCH/FAIL
**UI hint**: yes

### Phase 4: Backup robusto + contenido completo
**Goal**: El autor tiene la app cargada con los 6 PDFs reales (Avere, Género y Número, Verbos de Movimiento, Profesiones, Sustantivos Irregulares, Preposiciones) incluyendo ejercicios multi-categoría que ejercitan la cascada, y puede exportar/importar su progreso en JSON con un recordatorio cuando lleva >7 días sin backup
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: BACK-04, BACK-05, BACK-06, SEED-01, SEED-02
**Success Criteria** (qué tiene que ser CIERTO):
  1. La pantalla "Backup" tiene un botón "Exportar progreso" que descarga el estado completo (`italianCourse.v1`) como un archivo JSON con fecha en el nombre
  2. La pantalla "Backup" tiene un botón "Importar progreso" que acepta un archivo JSON, pide confirmación al autor y reemplaza el estado actual; importar el archivo recién exportado deja la app exactamente en el mismo estado
  3. La home muestra un banner discreto recordando hacer backup cuando han pasado más de 7 días desde el último export (timestamp persistido junto al estado)
  4. Los 6 PDFs están transcritos a `content/exercises/{avere,genero-numero,verbos-movimiento,profesiones,sustantivos-irregulares,preposiciones}.json` con al menos 10 ejercicios por categoría, todos validados por el schema y normalizados a NFC al cargar
  5. Al menos 1-2 ejercicios por PDF son multi-categoría (tocan categorías relacionadas), y al fallar uno en una sesión real se observa la cascada propagándose a varias categorías a la vez en el resumen
**Plans**: 4 plans
- [x] 04-01-PLAN.md — Backup runtime (migrate2to3 + daysSinceISO + backup.js puro + pantalla Backup + banner home + 3er botón + firstUsedAt plumbing + ~21 tests). Vertical slice: el autor exporta/importa progreso desde el día 1 del plan. **completado 2026-05-24** (128/128 tests verdes, 2 commits + mini-UAT humano 5/5 PASS, BACK-04/-05/-06 cerrados), ver [04-01-SUMMARY.md](./phases/04-backup-robusto-contenido-completo/04-01-SUMMARY.md)
- [x] 04-02-PLAN.md — Categories.json a 6 entradas + Preposiciones (50 multi-choice cobertura PDF completa) + Verbos de movimiento (34 multi-choice + 3 word-buttons cobertura PDF completa) + 3 placeholders B-1 + helper validate-content-fixture.mjs B-4 fix. Cada categoría es un commit tras revisión humana D-85. **completado 2026-05-24** (128/128 tests verdes, 4 commits, 87 ejercicios nuevos = 104 totales en la app, SEED-01 parcial 2/5), ver [04-02-SUMMARY.md](./phases/04-backup-robusto-contenido-completo/04-02-SUMMARY.md)
- [x] 04-03-PLAN.md — Sustantivos Irregulares (31 mezcla post-design-rule) + Género y Número (40 mezcla rica) + Profesiones (51 mezcla 3 tipos: 43 mc + 5 word-buttons + 3 match). DESIGN RULE 'match-if-not-trivial-by-root' anclada + retro-patch. **completado 2026-05-24** (128/128 tests verdes, 4 commits, 122 ejercicios nuevos = ~221 totales en la app, SEED-01 6/6 categorías con contenido real pendiente UAT integral en 04-04), ver [04-03-SUMMARY.md](./phases/04-backup-robusto-contenido-completo/04-03-SUMMARY.md)
- [x] 04-04-PLAN.md — avere.json multi-cat extension (6 cruces avere-300..305) + smoke test cascada multi-cat real + UAT INTEGRAL 5/5 PASS de los 5 criterios ROADMAP §Phase 4. **completado 2026-05-24** (130/130 tests verdes, 3 commits + plan docs, +6 ejercicios multi-cat = 232 totales en la app, SEED-02 cerrado + revalidación cruzada BACK-04/05/06/SEED-01), ver [04-04-SUMMARY.md](./phases/04-backup-robusto-contenido-completo/04-04-SUMMARY.md)
**UI hint**: yes

### Phase 5: Essere — categoría fundamental que faltaba
**Goal**: La app tiene una categoría `essere` con cobertura A1 completa (conjugación presente + identidad + profesión + nacionalidad + estado + contraste con avere) que el autor puede practicar en sesiones reales, incluyendo al menos 1 ejercicio multi-categoría que cruza essere con otra categoría existente para ejercitar la cascada D-54.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: SEED-03 (definido en plan-phase — `essere` como 7ª categoría obligatoria con cobertura A1 mínima: conjugación presente + identidad + nacionalidad + profesión + estado/condición + cópula + participio `stato/stata/stati/state`, ≥1 cruce multi-categoría que ejercita la cascada D-54)
**Success Criteria** (qué tiene que ser CIERTO):
  1. `content/categories.json` incluye una 7ª entrada `essere` con nombre humano apropiado y `order: 2` (justo después de Avere para reflejar el peso pedagógico equivalente — alterando el orden actual del resto en 1).
  2. `content/exercises/essere.json` existe con al menos 30 ejercicios, validados por schema, normalizados a NFC al cargar, apóstrofes ASCII.
  3. La cobertura abarca: conjugación presente (io sono / tu sei / lui è / noi siamo / voi siete / loro sono — 6 personas), uso de identidad ("Io ___ Maria"), nacionalidad ("Noi ___ italiani"), profesión ("Lui ___ medico" — contraste con `avere` que se usaría para edad/posesión), estado/condición ("Maria ___ stanca"), copula clasificatoria, y participio (`stato`/`stata`/`stati`/`state`) si es viable A1.
  4. Aplica la DESIGN RULE codificada en Phase 4: `match` solo si pareo requiere regla NO derivable por raíz; mayoría multi-choice con distractoras plausibles (formas de avere que el hispanohablante confunde, otras formas de essere mal conjugadas).
  5. Al menos 1 ejercicio multi-categoría `categoryIds: ["essere", <otra>]` (e.g., essere + profesiones tipo `Lei ___ avvocata` o essere + verbos-movimiento tipo `Maria ___ andata al cinema`) que dispara cascada D-54 al fallar.
  6. UAT humano: el autor lanza un Repaso 20 incluyendo essere y completa la sesión sin errores de UX/grading; falla deliberadamente el ejercicio multi-cat y observa la cascada en el resumen.
**Plans**: 1 plan
- [x] 05-01-PLAN.md — categories.json shift (essere order:2) + essere.json ~39 ejercicios (33 base D-92 + 6 multi-cat D-94) commits secuenciales por bloque revisado pedagógicamente + extensión smoke multi-cat tests/domain.test.js + UAT INTEGRAL 6/6 Phase 5

### Phase 6: Polish UX post-sesión — reiniciar + review errores
**Goal**: El autor puede (a) reiniciar los ejercicios de la sesión actual en 1 clic desde la pantalla de sesión (con las mismas categorías seleccionadas) sin tener que volver al home + descartar + reseleccionar + empezar, y (b) ver una pantalla de resumen al final de cada sesión con una sección "Errores cometidos" que liste, para cada ejercicio fallado, qué respondió + qué era correcto + sobre qué frase, para repasar los errores de manera agregada (no solo según van fallando).
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: UX-01, UX-02 (definidos en plan-phase — botón reiniciar + review de errores en resumen final)
**Success Criteria** (qué tiene que ser CIERTO):
  1. La pantalla de sesión muestra un botón "Reiniciar ejercicios" (junto al "← Volver al home") que, al pulsar, rearranca la sesión actual con las MISMAS categorías seleccionadas — saltándose home/picker/empezar. El comportamiento de cascada D-54 ya persistida se mantiene (los fallos inmediatos no se deshacen al reiniciar — invariante "el sistema te obliga a no olvidar").
  2. Decidir en discuss-phase: ¿reiniciar es solo Repaso 20 (Test completo abandonado vuelve al home como hoy)? ¿confirma con requestConfirm() inline (4ª-5ª call-site del helper) o reset directo? ¿descarta aciertos no-comprometidos de la sesión actual o los suma al Repaso siguiente?
  3. La pantalla de resumen (existente, post-SESSION-07) incluye una sección "Errores cometidos" cuando hay ≥1 fallo en la sesión, con una fila por error: prompt original (frase con el hueco), `tu respuesta` (lo que clickó/escribió el autor), y `respuesta correcta`. Para los 3 tipos (multi-choice / word-buttons / match), la captura es distinta y deberá decidirse en discuss-phase.
  4. La forma del `sessionResults` (estado en memoria de la sesión) se extiende para almacenar `userAnswer` por respuesta, no solo `correct: boolean`. Migración del schema si afecta a localStorage (probablemente NO, porque sessionResults es in-memory hasta el resumen; pero el `inFlightTest` reanudable SÍ persiste, requiere check en discuss-phase).
  5. UAT humano: el autor lanza un Repaso 20, falla algunos ejercicios deliberadamente (mezcla de tipos), llega al resumen, ve la sección "Errores cometidos" con captura correcta para los 3 tipos, y comprueba que el botón "Reiniciar ejercicios" rearranca con las mismas categorías en 1 clic.
**Plans**: 2 plans
- [x] 06-01-PLAN.md — Botón "Reiniciar ejercicios" en pantalla session (UX-01): handler restartRepaso() en factory appShell + .button-row con 2 botones bajo <hr> + smoke tests buildSession con state post-cascada + UAT humano 5/5 truths
- [x] 06-02-PLAN.md — Sección "Errores cometidos" en summary (UX-02): migración schemaVersion 3→4 + matchFirstWrongPair sub-estado + applyResultToSession firma extendida (ex, correct, userAnswer) + 3 call-sites actualizadas + <section class="summary-errors"> con dispatch por tipo + CSS Phase 6 + tests v4 migration + tests sessionResults shape + UAT humano 6/6 truths

### Phase 7: Explicaciones pedagógicas al fallar — campo explanation por ejercicio + render en Errores cometidos
**Goal**: El autor ve, al fallar un ejercicio, una explicación pedagógica destilada (1 frase de regla + 1 frase de ejemplo paralelo) inline durante el feedback rojo y agregada en la sección "Errores cometidos" del summary. Las 50 entries de Preposiciones (la categoría que motivó la fase porque era donde el autor consultaba Gemini cada fallo) están cubiertas tras Plan 07-02; las otras 6 categorías quedan opcionales para fases incrementales si emerge necesidad.
**Mode:** standard
**Depends on**: Phase 6
**Requirements**: EXPL-01, EXPL-02, EXPL-03, EXPL-04, EXPL-05
**Success Criteria** (qué tiene que ser CIERTO):
  1. `content/exercises/preposiciones.json` tiene 50/50 entries con `payload.explanation` no vacío, validado por schema + smoke test paramétrico.
  2. Al fallar cualquiera de los 50 ejercicios de Preposiciones durante sesión real, el autor ve la explanation italic muted bajo "Respuesta correcta" inline + replicada en summary "Errores cometidos".
  3. Los 221 ejercicios de las otras 6 categorías siguen funcionando sin cambios (graceful degradation — `<p class="session-explanation">` no se renderiza cuando explanation está ausente).
  4. Cero migración schemaVersion (sigue 4 — explanation es contenido en `content/`, no state).
  5. T-02-01 anti-XSS preservado: todas las explanations se renderizan via `x-text` exclusivo; markdown literal (asteriscos, doble subrayado) no se interpreta.
  6. UAT humano: fallar deliberadamente 5+ ejercicios de Preposiciones en Repaso 20 + ver explanation curada en cada uno + repaso agregado en summary.
**Plans**: 2 plans
- [x] 07-01-PLAN.md — Schema validator extension (3 reglas if-explanation-string-no-vacío) + 3 sub-templates session render inline + summary-errors extensión + 2 reglas CSS muted/italic + 2 seed explanations (preposiciones-001/006) + 12 tests parametrizados (EXPL-01/02/03) — **completado 2026-05-25**, ver [07-01-SUMMARY.md](./phases/07-explicaciones-pedag-gicas-al-fallar-campo-explanation-por-ej/07-01-SUMMARY.md)
- [x] 07-02-PLAN.md — Batch A 15 + batch B 16 + batch C 17 explanations Preposiciones (patrón D-85 Claude propone + autor revisa por bloque, 50/50 coverage) + smoke test paramétrico (3 sub-tests: coverage + ASCII + no-markdown) + reapertura PROJECT.md Out of Scope (D-134) + REQUIREMENTS.md EXPL-01..05 + ROADMAP.md finalización (EXPL-04/05) — **completado 2026-05-25**

### Phase 7.1: Explicaciones pedagógicas Género-Número + canonicalización ortográfica
**Goal**: TODAS las explanations del proyecto están en español correctamente escrito con acentos (á/é/í/ó/ú) y ñ donde la RAE lo exige (canon nuevo, reemplaza el canon Phase 7 incidental). Italianismos preservan ortografía italiana. Las 40 entries de Género-Número tienen explanation curada (ingestadas del draft pre-revisado del autor). Smoke test paramétrico CATEGORIES_WITH_EXPLANATIONS extensible a fases incrementales futuras 7.2..7.6 (1 línea por categoría).
**Mode:** standard
**Depends on**: Phase 7
**Requirements**: EXPL-06, EXPL-07, EXPL-08
**Success Criteria** (qué tiene que ser CIERTO):
  1. `content/exercises/preposiciones.json` 50/50 explanations re-acentuadas al canon español; italianismos preservados; cero smart quotes / markdown markers introducidos.
  2. `content/exercises/genero-numero.json` 40/40 explanations ingestadas del draft del autor sin modificación (37 mc + 3 match); cero smart quotes / markdown markers.
  3. Bloque `CATEGORIES_WITH_EXPLANATIONS` operativo en `tests/exercise-types.test.js` con 2 entries (preposiciones + génnum), 3 sub-tests por entry, 6 tests paramétricos verdes.
  4. Tests count subió de 181 (post-Phase 7) → 184 (post-Phase 7.1) — delta +3 (3 sub-tests adicionales sobre génnum vía paramétrico).
  5. Cero migración schemaVersion (sigue 4) — explanation es contenido, no state.
  6. PROJECT.md `### Validated` extendido con Phase 7.1 entry; Key Decisions tabla extendida con fila del canon ortográfico. REQUIREMENTS.md subsección EXPL-06..08 + traceability tabla extendida. ROADMAP.md Phase 7.1 finalizada.
  7. UAT humano: fallar deliberadamente 5+ ejercicios de Género-Número en Repaso 20 + ver explanation curada inline + repaso agregado en summary + sanity check Preposiciones re-acentuadas funcionan idéntico + audit trail PROJECT/REQ/ROADMAP visible.
**Plans**: 2 plans
- [x] 7.1-01-PLAN.md — Re-acentuación canónica 50 Preposiciones (1 pasada Claude + diff review autor + 1 commit) + refactor smoke test a paramétrico CATEGORIES_WITH_EXPLANATIONS (EXPL-06, EXPL-08).
- [x] 7.1-02-PLAN.md — Ingest 40 explanations Género-Número del draft del autor (D-141 1 commit honesto) + 2ª entry al array paramétrico + audit trail PROJECT.md/REQUIREMENTS.md/ROADMAP.md + UAT humano 6/6 (EXPL-06, EXPL-07).

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Loop mínimo end-to-end | 2/2 | Complete    | 2026-05-23 |
| 2. Mecánica completa de re-verificación | 4/4 | Complete   | 2026-05-23 |
| 3. Variedad de ejercicios + ergonomía | 3/3 | Complete    | 2026-05-24 |
| 4. Backup robusto + contenido completo | 4/4 | Complete    | 2026-05-24 |
| 5. Essere — categoría fundamental que faltaba | 1/1 | Complete   | 2026-05-24 |
| 6. Polish UX post-sesión (reiniciar + review errores) | 2/2 | Complete    | 2026-05-25 |
| 7. Explicaciones pedagógicas al fallar | 2/2 | Complete   | 2026-05-25 |
| 7.1. Explicaciones Género-Número + canonicalización ortográfica | 2/2 | Complete    | 2026-05-25 |

## Coverage Summary

- **v1 requirements:** **51** total (48 originales/Phase 1..7 + 3 EXPL-06..08 Phase 7.1)
- **Mapped to phases:** 51 (100%)
- **Unmapped:** 0
- **Granularity:** coarse (8 fases — 5 core + 1 polish UX + 2 pivotes incrementales explanations)
- **Mode:** MVP (vertical slices) hasta Phase 6; standard a partir de Phase 7

## Dependency Graph

```
Phase 1 (loop mínimo: foundation + content + multiple-choice + persistencia mínima)
   │
   ▼
Phase 2 (mecánica completa: cascada + estados + dashboard + resumen)
   │
   ▼
Phase 3 (variedad: word-buttons + match + teclado)
   │
   ▼
Phase 4 (backup UI + contenido real de los 6 PDFs)
   │
   ▼
Phase 5 (essere como 7ª categoría — pivote post-UAT Phase 4)
   │
   ▼
Phase 6 (polish UX: reiniciar sesión + review errores)
   │
   ▼
Phase 7 (explicaciones pedagógicas al fallar — pivote post-uso-real)
```

Cada fase entrega valor usable independientemente:
- Después de Phase 1: el autor valida que el loop funciona con multiple-choice de Avere (contenido de scratch)
- Después de Phase 2: el motor "te obliga a no olvidar" está completo y observable
- Después de Phase 3: la app es funcionalmente completa para uso diario
- Después de Phase 4: la app es daily-driver con los 6 PDFs reales y backup seguro
- Después de Phase 5: Essere cubierta como 7ª categoría, milestone v1.0 funcionalmente completo
- Después de Phase 6: UX puede pulida (reiniciar 1-clic + review agregado errores)
- Después de Phase 7: explicaciones pedagógicas inline al fallar — Preposiciones cubierta (la cat que motivó la fase)

## Backlog

### Phase 999.1: Botón "Reiniciar ejercicios" en pantalla de sesión (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See §"Phase 6" above for active spec.

### Phase 999.2: Pantalla "Resultado" final con review de errores cometidos (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See §"Phase 6" above for active spec.

### Phase 7.x (futuro, opcional): Explanations para las otras 6 categorías

**Status:** Backlog. Si tras Phase 7 el autor echa de menos explanations en Avere/Essere/Verbos-movimiento/Profesiones/Sustantivos-irregulares/Género-número, abrir fases incrementales por categoría (Phase 7.1 Avere, Phase 7.2 Verbos-movimiento, ...). El shape `payload.explanation: string` ya está soportado en schema + render — solo es trabajo editorial puro (Claude propone + autor revisa por batch).

---
*Roadmap created: 2026-05-23*
*Last updated: 2026-05-25 after Phase 7.1 completion (2 plans ejecutados: 7.1-01 re-accent 50 Preposiciones + refactor smoke paramétrico + 7.1-02 ingest 40 Génnum + audit trail PROJECT/REQ/ROADMAP). 184/184 tests verdes (181 baseline + 3 sub-tests paramétricos sobre génnum). EXPL-06..08 cerrados; canon ortográfico canónico instalado universalmente; patrón paramétrico habilita fases incrementales 7.2..7.6.*
