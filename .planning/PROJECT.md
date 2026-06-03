# Italian Course — Ejercicios A1/A2

## What This Is

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Es una herramienta de auto-validación pura: repite, mezcla y obliga a re-verificar constantemente lo aprendido, garantizando que las reglas y excepciones de cada tema no se olvidan. Es para una sola persona (el autor), funciona local en su PC y desktop.

## Core Value

**Que el sistema te obligue a no olvidar.** El motor de repetición tiene que garantizar que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera. Sin ese loop, el resto no importa.

## Current Milestone: v1.4 — Variantes de ejercicio (slots por regla)

**Goal:** Matar la memorización por palabras introduciendo "slots" (1 por regla) con variantes intercambiables; un examen recorre N slots eligiendo 1 variante al azar en cada uno, manteniendo intacta la re-verificación D-54.

**Target features:**
- **Modelo de datos slot+variantes** — cada slot tiene 1..N variantes intercambiables (misma regla, MISMA explicación a nivel de slot, distinta superficie: nombres/sustantivos/frase); slots de 1 variante para excepciones concretas sin variante posible (`in spiaggia`).
- **Motor de examen por slots** — el sampler/examen elige 1 variante aleatoria por slot; "hecha" = pasar los N slots de la categoría sin fallar; fallar uno = cascada D-54 (resetea la categoría a no-hecha); al re-hacer tras fallo tocan variantes distintas → muere la memorización por palabras.
- **Schema validator + migración** — esquema slot+variantes con validator extendido; migración `schemaVersion 5→6`; las 8 categorías no-piloto siguen funcionando como slots de 1 variante (backward-compat); reset del progreso de Preposiciones al migrar (coherente con Core Value).
- **Piloto Preposiciones** — reagrupar los 57 ejercicios validados en slots por regla; autorar variantes nuevas (patrón D-85: Claude propone → autor revisa → quórum R1-R7) hasta varias por slot donde tenga sentido; añadir el slot `in spiaggia / in montagna` (preposición locativa fija, hueco detectado: no estaba en ninguna categoría).

**Last shipped:** v1.3 — Canciones (bloque de traducción) (2026-06-02). Bloque nuevo "Canciones" separado del home: traducir canciones italianas frase a frase con word-buttons inverso (italiano→español), frases enganchadas al motor de re-verificación vía cascada D-54, recorrido secuencial tipo Test completo + resumen, estado simple pasada/fallada por canción. Primera canción real: "Equilibrio mentale (Home piano session) — Ultimo" (17 frases). Brownfield: reutiliza el engine v1.0 sin reconstruirlo. 19/19 requirements, 306/306 tests verdes.

Próximo paso: definir requirements (REQUIREMENTS.md) y roadmap (este flujo).

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**Phase 1 — Loop mínimo end-to-end (2026-05-23):**
- ✓ Stack web estático con Alpine + Pico + ES modules + localStorage funciona en local con `npx serve`
- ✓ Schema validator hand-written rechaza JSON malformado y `categoryId` desconocido con banner visible
- ✓ Multiple-choice exercise type: render + grade + feedback verde/rojo + auto-avance 600ms
- ✓ Función pura `buildSession()` con sampler ponderado `1/(1+min(timesShown,10))` y reduce-a-disponibles
- ✓ Función pura `dates.todayLocal()` usa reloj local (no UTC)
- ✓ Contadores de ejercicio monotónicos en `localStorage` bajo `italianCourse.v1` con `schemaVersion`
- ✓ Persistencia única al final de sesión (no per-answer)
- ✓ NFC normalize on load
- ✓ Sesión abandonada se descarta (cerrar pestaña a medias → estado no se actualiza)
- ✓ 12 ejercicios seed de Avere (presente indicativo, 6 personas + variantes contextuales)
- ✓ 14 tests unitarios con `node --test` cubren dominio puro

**Phase 2 — Mecánica completa de re-verificación (2026-05-23):**
- ✓ Sistema soporta categorías arbitrarias (carga dinámica desde `categories.json`)
- ✓ Modelo de ejercicio multi-categoría (`categoryIds[]` con cascada al fallo)
- ✓ Estados de categoría: `no-hecha` → `hecha` (todos sus ejercicios completados sin fallar) → `dominada` (21 días seguidos de racha)
- ✓ Cascada de fallo INMEDIATA (refinement D-54 tras UAT): fallar un ejercicio que testea N categorías resetea las N al instante a `no-hecha` con racha 0 y `clearedExerciseIds` vacío, persistido a localStorage en ese momento — los aciertos siguen el patrón write-once-at-session-end
- ✓ Categoría `hecha`/`dominada` regresa automáticamente a `no-hecha` cuando se añade un ejercicio nuevo al JSON (DOMAIN-06 evaluado en boot vía `applyNewExerciseRegression`)
- ✓ Sesión Repaso 20 con picker: checkboxes por categoría, Seleccionar/Quitar todo, contador en label, GUARANTEE phase (mínimo 1 ejercicio por categoría elegida), FILL phase con sampler ponderado
- ✓ Modo Test completo: ejecuta TODOS los ejercicios de las categorías elegidas, aviso inline, persistencia in-flight per-answer (`inFlightTest` subkey), banner reanudar/descartar en home
- ✓ Pantalla resumen con delta neutral factústico por categoría (estado antes→después, racha antes→después, ejercicios pendientes para hecha) — botón único `Volver al home`
- ✓ Racha 21 días con `lastSuccessDate` guard (1 vez por día); display `N / 21 d` para visualizar objetivo (refinement D-55)
- ✓ Repaso abandonado descarta aciertos (excepción D-54: los fallos persisten siempre); Test completo abandonado se reanuda
- ✓ Smoke test integrado simulando ≥30 días reales — 58 tests verdes totales
- ✓ Home dashboard con tabla densa (5 columnas: Estado / Categoría / Racha / Ejercicios / Última vez), badges Unicode (`●`/`✓`/`★`) con colores Pico

**Phase 3 — Variedad de ejercicios + ergonomía de teclado (2026-05-24):**
- ✓ Tipo `word-buttons`: banco → área respuesta (mover palabras), distractoras opcionales (`distractors[]`), botón "Comprobar" + Enter, frase correcta literal en rojo al fallar
- ✓ Tipo `match`: dos columnas con shuffle Fisher-Yates seedable, validación instantánea por pareja (correcta = verde fija + apagada / incorrecta = parpadeo rojo + deshecha), CUALQUIER intento erróneo → ejercicio fallado con cascada D-61 inmediata idempotente (un solo `applyImmediateFailure` por ejercicio fallado)
- ✓ Duplicados textuales en columna derecha de `match` permitidos (grading por consumo de pair por índice — D-66)
- ✓ Grading case-insensitive para los nuevos tipos (`toLowerCase() + NFC compare`); render mantiene capitalización
- ✓ Atajos de teclado completos sin ratón: `1-4` multiple-choice; `1-9` dinámicos word-buttons + `Backspace` + `Enter` = Comprobar; `1-9` izq + `a-i` der en match; `Enter`/`Space` tras fallo dispara `sessionAdvance`; tras acierto NO hacen nada (auto-avance 600ms intacto); `Space` con `preventDefault` (no scroll)
- ✓ Foco al body (sin elemento focado visualmente) con `@keydown.window` Alpine; cleanup automático al cambiar `currentScreen` via el lifecycle del template
- ✓ Sufijos visibles `¹²³ᵃᵇᶜ` (superíndice Unicode) en banco word-buttons y columnas match
- ✓ Helper `applyResultToSession(exercise, correct)` extraído — call-sites exactos de `applyImmediateFailure`: **2** (decisión final + primer fallo match) — Pitfall #2 prevenido arquitectónicamente
- ✓ Schema validator refactorizado a dispatch table `PAYLOAD_VALIDATORS` por tipo
- ✓ 105 tests verdes totales (58 baseline Phase 1+2 + 23 word-buttons + 24 match), UAT humano PASS (15 pasos cubriendo 4 criterios ROADMAP + 8 pitfalls + exploit-proof D-54/D-61 + D-66 duplicados visuales + Phase 2 regression smoke)

**Phase 4 — Backup robusto + contenido completo (2026-05-24):**
- ✓ Pantalla "Backup" (5º `currentScreen='backup'` en el factory plano) con botón "Exportar progreso" descarga `italian-course-backup-YYYY-MM-DD.json` (envoltura `{kind, exportedAt, schemaVersion:3, state}`)
- ✓ Botón "Importar progreso" con confirmación inline (4ª call-site de `requestConfirm()` D-27) mostrando fecha + nº categorías + nº ejercicios + warning irreversible; validación estricta (kind + schemaVersion ≤3 con migración automática, >3 rechaza)
- ✓ Banner home persistente >7 días sin export con texto "⚠ Han pasado N días desde tu último backup" (o "⚠ Aún no has exportado tu progreso" si nunca exportaste); desaparece reactivamente al exportar (Alpine sobre `state.lastBackupAt`)
- ✓ Migración `migrate2to3` añade `lastBackupAt: null` + `firstUsedAt: null` al state; `firstUsedAt` se setea inline en 4 call-sites (completeSession + applyResultToSession ×2 + persistInFlightTest) — sin helper
- ✓ Helper puro `daysSinceISO(iso, todayStr)` DST-safe vía local-noon anchor + ISO UTC almacenado, comparación por días locales completos
- ✓ Módulo puro `src/data/backup.js` (`parseBackupFile` + `buildBackupWrapper`) — layer purity D-02 invariante
- ✓ 6 PDFs reales transcritos: **232 ejercicios** totales (Avere 23 incl. 6 multi-cat + Preposiciones 50 + Verbos de movimiento 37 + Sustantivos Irregulares 31 + Género y Número 40 + Profesiones 51), cada categoría validada por schema, NFC normalize on boot
- ✓ **DESIGN RULE codificada**: `match` solo válido si pareo requiere regla NO derivable por raíz (artículo↔sustantivo, profesión↔lugar, profesión↔herramienta, profesión↔acción); singular↔plural y masc↔fem con raíz compartida → multi-choice con distractoras plausibles
- ✓ Multi-cat real avere-300..305: 1 cruce semántico por cada categoría nueva con Avere — fallar uno propaga cascada D-54 inmediata a las 2+ categorías visibles en el resumen
- ✓ APPEND-ONLY invariante D-88 blindado estructuralmente: `scripts/snapshot-avere-prefix.mjs` + `scripts/assert-avere-prefix-unchanged.mjs` (los 17 ejercicios originales de avere.json no pueden modificarse silenciosamente)
- ✓ 130 tests verdes totales (128 baseline Phase 1-3 + 2 nuevos: smoke multi-cat real cascade + schema validation roundtrip), UAT INTEGRAL 5/5 PASS (los 5 criterios ROADMAP §Phase 4 + mini-UAT 5/5 backup en Plan 04-01)

**Phase 5 — Essere como 7ª categoría dedicada (2026-05-24):**
- ✓ `content/categories.json` extendido a 7 entradas (Essere insertado order:2 tras Avere; resto desplazado +1)
- ✓ `content/exercises/essere.json` con 39 ejercicios (33 base — 29 multi-choice + 4 word-buttons cubriendo presente indicativo + identidad + nacionalidad + profesión + estado + cópula + participio `stato/stata/stati/state` — + 6 multi-cat essere-300..305 espejo del patrón avere-300..305)
- ✓ Patrón distractoras pedagógico fijo en los 35 multi-choice: 1 forma de avere + 2 formas mal conjugadas de essere + 1 correcta (refuerza el contraste essere/avere que confunde al hispanohablante)
- ✓ DESIGN RULE Phase 4 honrada: 0 match (conjugación essere derivable por raíz `io↔sono`, `tu↔sei`, etc.); regla aplica como condición arquitectónica
- ✓ Smoke test multi-cat paramétrico extendido a iterar TODOS los archivos de `content/exercises/` (los 6 nuevos cruces essere-300..305 cubiertos sin retoque)
- ✓ 145/145 tests verdes (130 baseline post-Phase 4 + 6 nuevos sub-tests smoke multi-cat paramétrico + 1 nuevo bundle test + 8 storage chain); UAT INTEGRAL 6/6 PASS (categories.json shift, essere.json validation, cobertura 7 sub-áreas, DESIGN RULE, cascada D-54 essere-302 propaga a essere + verbos-movimiento, Repaso 20 sin errores UX)

**Phase 6 — Polish UX post-sesión: reiniciar + review errores (2026-05-25):**
- ✓ Botón "Reiniciar ejercicios" en pantalla session (solo Repaso 20, `x-show sessionMode === 'repaso'`) en `.button-row` junto a `← Volver al home` — handler `restartRepaso()` en factory appShell descarta aciertos no-comprometidos, preserva fallos D-54 ya persistidos, re-llama `buildSession` con `pickerCheckedCategoryIds` intactas; resetea sub-estados de los 3 tipos incluyendo `matchFirstWrongPair`. Reset directo 1 clic, sin `requestConfirm()`.
- ✓ Sección `<section class="summary-errors">` en pantalla summary tras `<ul.summary-delta>`, antes de "Volver al home"; renderiza una `<li>` multi-línea por error con prompt en `<strong>`, "Tu respuesta" con `.user-answer` (rojo sólido + texto blanco), "Respuesta correcta" con `<strong>`. Dispatch por `ex.type` para los 3 tipos. Guard `x-if sessionResults.some(!correct)` evita renderizar sección vacía.
- ✓ Shape extendido `sessionResults.push({exerciseId, correct, userAnswer})` uniforme cross-3-types: multi-choice = texto literal, word-buttons = array de palabras, match = `{left, right, leftIdx}` del primer pareo erróneo bajo guard `!matchHadFailure` (simetría D-61). `applyResultToSession(ex, correct, userAnswer)` extendido como 3er argumento centralizado en 3 call-sites.
- ✓ Snapshot `summarySessionResults` dedicado en `completeSession()` (espejo del patrón `summaryDelta`) — el summary lee del snapshot, no de la sesión live; race contra `resetSession()` durante unmount eliminada arquitectónicamente.
- ✓ Migración `schemaVersion 3→4` con `migrate3to4` idempotente: backfillea `userAnswer: null` en `inFlightTest.answers` pre-Phase 6; deep-clones nested dicts (exerciseStats, categoryProgress, dailyLog) vía JSON round-trip para defensa-en-profundidad anti-prototype-pollution; normaliza `inFlightTest.answers = []` si la entrada es non-array (defensa contra corrupción). `hydrateV4` aplica el mismo deep-clone.
- ✓ Code review estándar sobre los 8 archivos de Phase 6: 11 findings (3 critical + 5 warning + 3 info); 8 fixed (todos critical+warning), 3 deferred como Info no-blockers; status REVIEW.md: `clean`.
- ✓ 166/166 tests verdes (145 baseline + 13 Phase 6 nuevos: 5 storage v4 chain + 5 sessionResults shape + 3 restartRepaso smoke); UAT INTEGRAL 11/11 PASS por el autor (5/5 UX-01 + 6/6 UX-02); milestone v1.0 funcionalmente completo con UX-01 + UX-02 cerrados.

**Phase 7 — Explicaciones pedagógicas al fallar (2026-05-25):**
- ✓ Campo opcional `payload.explanation: string` en schema (3 tipos: multi-choice / word-buttons / match) con regla "if present, must be non-empty string" (D-116 / EXPL-01). Cero migración schemaVersion (sigue v4 — explanation es contenido en `content/`, no state).
- ✓ Render inline durante feedback rojo en los 3 sub-templates session screen (D-118 / EXPL-02) — `<p class="session-explanation">` italic muted bajo "Respuesta correcta:" y antes del botón Siguiente. `x-text` exclusivo (T-02-01 anti-XSS preservado). Doble guard `x-show` con graceful degradation D-121 (sin placeholder cuando el ejercicio no tiene explanation).
- ✓ Render en summary-errors bajo cada fila de fallo (D-119 / EXPL-03) — lectura desde `content.exerciseById` con optional chaining defensivo. Mismo estilo visual `.summary-error-explanation` para coherencia cross-context (D-120, sin tokens nuevos).
- ✓ 50/50 explanations curadas en `content/exercises/preposiciones.json` — patrón D-85 (Claude propone + autor revisa por bloque) en 3 batches secuenciales × 15+16+17. Tono D-127 (3ª impersonal + regla + ejemplo paralelo italiano-español), longitud 228-369 chars, apóstrofes ASCII U+0027 (CONT-06 / D-129), plain text sin markdown (T-02-01 / D-126). Smoke test paramétrico (3 sub-tests) defiende coverage 50/50 + ASCII + no-markdown contra regresiones editoriales futuras (EXPL-04).
- ✓ Pivote post-uso-real documentado: la decisión Phase 1 "Solo bien/mal por velocidad; la teoría está en los PDFs" fue revisada porque tras 271 ejercicios funcionando el autor consultaba Gemini cada fallo de Preposiciones (4 ejemplos canónicos: sulle/da lui/dalle/sui) — fricción real superó la decisión inicial. Las otras 6 categorías (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) quedan opcionales para retro-rellenar en fases incrementales futuras si emerge dolor adicional (EXPL-05 / D-134).
- ✓ 181/181 tests verdes (166 baseline + 12 schema validator paramétricos D-116 + 3 smoke coverage preposiciones); UAT humano vertical slice 6/6 PASS (Plan 07-01) + UAT humano final 7/7 PASS (Plan 07-02).

**Phase 7.1 — Explicaciones Género-Número + canonicalización ortográfica (2026-05-25):**
- ✓ Canon ortográfico nuevo materializado: TODAS las explanations del proyecto están en español correctamente escrito con acentos (á/é/í/ó/ú) y ñ donde la RAE lo exige (D-135 / EXPL-06). Italianismos citados literalmente (`città`, `caffè`, `dalla`, `Sono di Roma`, etc.) preservan ortografía italiana (D-137).
- ✓ Re-acentuación retroactiva: las 50 explanations existentes de Preposiciones (Phase 7) se re-acentuaron en Plan 7.1-01 (1 pasada Claude + diff review autor + 1 commit; contenido pedagógico intacto, solo se añadieron caracteres acentuados); 3 fixes bonus aplicados con approval del autor (preposiciones-006 `e`→`è`, preposiciones-029 `citta`→`città`, preposiciones-018 `el`→`él`).
- ✓ 2ª categoría cubierta: 40/40 explanations curadas en `content/exercises/genero-numero.json` ingestadas del draft pre-revisado del autor en Plan 7.1-02 (D-141 — 1 commit grande honesto, NO patrón D-85 porque el draft YA era el resultado de la revisión del autor). 37 multi-choice + 3 match. Distractoras duras mantained (D-142), mc-037 modern usage acknowledgment mantained (D-143).
- ✓ Smoke test paramétrico generalizado: bloque hardcoded Phase 7 EXPL-04 reemplazado por loop sobre array `CATEGORIES_WITH_EXPLANATIONS = [{file, expected}]` (D-144 / EXPL-08). Añadir una futura categoría (Phase 7.2..7.6) es 1 línea en el array — cero código nuevo.
- ✓ Apóstrofes ASCII U+0027 preservados en las 90 explanations totales (50 prep + 40 génnum). Plain text — cero markdown markers introducidos.
- ✓ Patrón establecido para fases incrementales 7.2..7.6: si emerge dolor en otra categoría (Avere / Essere / Verbos-movimiento / Profesiones / Sustantivos-irregulares), 1 plan = ingest + 1 línea array + audit trail mínimo.
- ✓ 184/184 tests verdes (181 baseline post-Phase 7 + 3 sub-tests paramétricos sobre génnum); UAT humano final 6/6 PASS Plan 7.1-02 (5+ Génnum fallados con explanation inline + summary "Errores cometidos" replica + sanity check Preposiciones re-acentuadas + otras 5 categorías sin cambio + tests + boot limpios + audit trail PROJECT/REQ/ROADMAP visible).

**Phase 7.2 — Explicaciones pedagógicas 5 categorías restantes (cobertura 100% pre-ship) (2026-05-25):**
- ✓ 181 explanations curadas en las 5 categorías restantes: Avere 23/23 + Sustantivos-irregulares 31/31 + Verbos-movimiento 37/37 + Essere 39/39 + Profesiones 51/51 (EXPL-09..13).
- ✓ Patrón D-85 batches replicado en 5 plans (11 batches D-85 con checkpoint:human-verify) heredando canon Phase 7.1 (español acentuado + italianismos preservados + ASCII apóstrofes + plain text).
- ✓ 7 entries en `CATEGORIES_WITH_EXPLANATIONS` (las 7 categorías del proyecto) — smoke paramétrico ejerce ahora 7 archivos × 3 sub-tests = 21 tests.
- ✓ D-88 APPEND-ONLY de avere preservado vía relax mínimo en assert-avere-prefix-unchanged.mjs (D-178 opción A — campos core sin `explanation`/`notes`).
- ✓ Cobertura 100% editorial: 271/271 ejercicios con explanation curada. Milestone v1.0 ready to ship.
- ✓ Cero migración schemaVersion (sigue 4 — D-176). Cero modificación schema validator (D-171), render UI (D-172), motor re-verificación.

**Phase 13 — Bloque Canciones + modelo de datos + playthrough end-to-end (2026-06-02):**
- ✓ Bloque "Canciones" como 6º `currentScreen` (espejo de session/summary/backup en el factory plano de `src/screens/app.js`), separado de la tabla de categorías del home; listado con estado por canción (no hecha / pasada / fallada) + número de frases (SONG-01, SONG-02, SONG-03)
- ✓ Estado por canción plano `songProgress[songId] = {status, lastPlayedAt}` — NO dominada/racha/log 21-day; persiste en localStorage entre sesiones; `migrate4to5`/`hydrateV5` con deep-clone defensivo (schemaVersion 4→5), `backup.js` extendido a v5 para round-trip export/import (SONG-04, DATA-03)
- ✓ Playthrough secuencial it→es reutilizando word-buttons en dirección INVERSA (línea italiana = prompt → user construye tokens españoles): N frases en orden tipo Test completo sin reinicio a mitad, feedback verde/rojo con traducción correcta al fallar, auto-avance, pantallas DEDICADAS `cancion`/`cancion-summary` (getter `songCurrentPhrase` + mapa `songPhraseById`, no song-aware `sessionCurrentExercise`) (PLAY-01, PLAY-02, PLAY-03)
- ✓ Resumen post-canción: Block A frases falladas (tu respuesta vs correcta) + Block B categorías que bajaron de estado; abandonar a mitad descarta el progreso no comprometido y al re-entrar empieza de cero (sin slot `inFlightTest` para canciones) (PLAY-04, PLAY-05)
- ✓ Cascada D-54 por frase reutilizando `applyResultToSession` (0 nuevos call-sites de `applyImmediateFailure`, Pitfall #2): fallar una frase con `categoryIds` resetea esas categorías; frases sin categoría guardadas sin cascada (preparado para CATPROC); canciones standalone fuera del sampler Repaso 20 / Test / tabla de categorías (LINK-01, LINK-02, LINK-03, LINK-04)
- ✓ Schema de canción + `validateSongs` export SEPARADO (no extiende `PAYLOAD_VALIDATORS`, coherente con standalone) con banner visible coherente con el validator existente; `loadSongs` cableado en boot (`songsById` hermano de `exerciseById`) (DATA-01, DATA-02)
- ✓ 306/306 tests verdes (+19 en `screen-canciones.test.js`); 2 plans (13-01 modelo de datos + 13-02 slice jugable)

**Phase 14 — Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera (2026-06-02):**
- ✓ Primera canción real "Equilibrio mentale (Home piano session) — Ultimo" autorada como 17 frases it→es: limpieza de ruido no-lírico (créditos de directo, "You might also like") + segmentación por sentido completo + traducción española curada por bloques + enganche limpio (todas las frases `categoryIds: []` en esta canción) (CONT-01, CONT-02)
- ✓ Validación ligera autor-oráculo (1 pase IA: traducción defendible + enganche correcto), NO el quórum gramatical estricto R1-R7 — las traducciones de canciones son "particulares" por diseño; el autor es oráculo final sobre el fraseo artístico (CONT-03)
- ✓ Índice de canciones en lockstep + sub-test de presencia; bug del MOTOR cazado en UAT humano (`bankWithKeys` dejaba el banco vacío en modo canción, LINK-04) y arreglado en `02d6f4a` con tests de regresión; autor confirmó la canción jugable de principio a fin
- ✓ 1 plan (14-01)

**Phase 8 — Modo Examen por categoría (2026-05-25):**
- ✓ Botón "Examen" en cada fila de la tabla home (6ª columna nueva) que arranca un Test completo de SOLO esa categoría con 1 click directo (D-181). Resuelve el dolor canónico "5-6 Repasos para validar dominio de una sola categoría" capturado tras Phase 7.2.
- ✓ Handler `startExamen(categoryId)` + helper privado `_launchExamen(catId)` en `src/screens/app.js`. El helper extrae el cuerpo del lanzamiento puro para 2 call-sites (directo + onConfirm post-clearInFlightTest). Reset SUPERSET completo (heredado de restartRepaso Phase 6 D-104) — Examen puede venir de mid-match si el path conflict D-44 cancela un Test previo.
- ✓ Reutiliza `buildFullTest([catId])` (D-50), slot único `inFlightTest` compartido (D-182), patrón D-44 como 6ª call-site del helper `requestConfirm` con copy literal idéntica al openPicker (D-183 hereda copy genérica del banner reanudar) + confirmLabel `Descartar y empezar` (lockeado coherencia con análogo directo).
- ✓ Pitfall PATTERNS.md §1 Analog 2 resuelto: `pickerCheckedCategoryIds = [catId]` ANTES de `persistInFlightTest()` — sin él, el fallback `prev?.categoryIds` capturaría las cats del Test anterior.
- ✓ `categoriesForDisplay` extendido con `examenEnabled` (totalCount > 0) y `examenTooltip` ('' enabled | 'No hay ejercicios en esta categoría' disabled). Cats `hecha`/`dominada` siguen enabled normal (D-187 — el autor quiere re-examinar para reconfirmar dominio).
- ✓ 6ª columna en `index.html` con `<th>` + `<td>` + `<button class="secondary outline">Examen</button>` + bindings `:disabled` + `:title` + `@click`. Texto del botón LITERAL HTML (D-185, NO x-text — T-02-01 anti-XSS preservado).
- ✓ 7 smoke tests presence-check en `tests/screen-examen.test.js` (windowed slicing sobre source — coherente con patrón `tests/exercise-types.test.js:739-754`). Tests count 202 → 209 verdes (delta +7).
- ✓ Cero migración schemaVersion (sigue 4 — D-192). Cero CSS nuevo (UI-SPEC §CSS additions). Cero módulos nuevos. Cero modificación al motor de re-verificación (cascada D-54, sampler, promociones, racha).

### Active

<!-- Current scope: milestone v1.4 — Variantes de ejercicio (slots por regla). REQ-IDs en REQUIREMENTS.md. -->

**Milestone v1.4 — Variantes de ejercicio (slots por regla):**
- Modelo de datos slot+variantes (1 slot = 1 regla; 1..N variantes intercambiables; explicación a nivel de slot)
- Motor de examen por slots (1 variante aleatoria por slot; "hecha" = N slots; cascada D-54 intacta)
- Schema validator + migración `schemaVersion 5→6` (8 categorías no-piloto = slots de 1 variante; reset progreso Preposiciones)
- Piloto Preposiciones: reagrupar 57 ejercicios en slots + autorar variantes nuevas (quórum R1-R7) + slot `in spiaggia/in montagna`

_(Requirements detallados y trazabilidad en `.planning/REQUIREMENTS.md`.)_

### Recently Validated (v1.3 — shipped 2026-06-02)

- ✓ **Bloque Canciones** (Phase 13): pantalla nueva separada del home con listado + estado pasada/fallada por canción; playthrough secuencial it→es reutilizando word-buttons inverso; cascada D-54 por frase; standalone fuera del sampler; schema + `validateSongs` + `migrate4to5`. Brownfield puro — 0 reconstrucción del motor (16 requirements SONG/PLAY/LINK/DATA).
- ✓ **"Equilibrio mentale — Ultimo"** (Phase 14): primera canción real autorada (17 frases) con validación ligera autor-oráculo (NO quórum R1-R7). Un bug del motor (`bankWithKeys` en modo canción) cazado y arreglado durante UAT humano (3 requirements CONT).
- ✓ Patrón "bloque nuevo sobre engine existente" validado: el engine v1.0 (cascada D-54, word-buttons `grade()`, schema-validator, patrón Test-completo) soporta un modo de ejercicio completamente nuevo reutilizando call-sites existentes sin tocar la mecánica de re-verificación.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Multi-usuario / autenticación — es una app personal, una sola persona; añadirlo sería complicar sin valor
- Cloud sync / hosting en internet — el autor trabaja en local; si lo necesita en el móvil ya se verá
- Acceso desde móvil (responsive móvil-first) — desktop primero; responsive se evaluará cuando se eche en falta
- Generación de ejercicios con IA (a partir de los PDFs) — el contenido se mete a mano; la IA queda como exploración futura, no scope inicial
- Respuesta libre escribiendo texto — requiere normalización compleja (tildes, sinónimos, mayúsculas); no aporta vs los 3 tipos elegidos
- UI de edición de ejercicios dentro de la web — JSON a mano es suficiente para v1; se reevaluará si el flujo manual escala mal
- SRS sofisticado (Anki-style, ratio fallos/aciertos ponderado) — priorización simple por "veces hechas" es suficiente al principio
- Frecuencia reducida o eliminación de categorías "dominadas" en sesiones — el autor quiere que sigan apareciendo igual para no perder forma

## Current State

**v1.3 shipped 2026-06-02** — Bloque "Canciones": modo de ejercicio nuevo (traducción it→es frase a frase con word-buttons inverso) construido enteramente sobre el engine v1.0 sin reconstruirlo. Pantalla separada del home, estado simple pasada/fallada por canción, cascada D-54 por frase enganchada, standalone fuera del sampler. Primera canción real "Equilibrio mentale — Ultimo" (17 frases) autorada con validación ligera autor-oráculo (NO quórum R1-R7). schemaVersion 4→5 (`migrate4to5` + `backup.js` v5). Un bug del motor (`bankWithKeys` vacío en modo canción por LINK-04) cazado en UAT humano y arreglado (`02d6f4a`). 2 phases, 3 plans, 19/19 requirements, 306/306 tests verdes.

**v1.2 shipped 2026-05-28** — 2 categorías nuevas de gramática A1 diseñadas desde cero sin PDF: Articoli (56 ejercicios, 8ª categoría) + Partitivos (44 ejercicios, 9ª categoría). 100 ejercicios nuevos, todos validados por quórum cross-vendor (DeepSeek + Opus 4.7); el cross-vendor capturó 8 bugs en Articoli que el human-verify dejó pasar (contracciones prep+art, leak de triggers fonéticos, acentos graves c'è/più). 1 override autor en `partitivos-036` (D-02: el ejercicio entrena USO del partitivo afirmativo, ∅ válido pero no idiomático). Gate verde: reporter exit 0 (372/372 validated), smoke `VAL_07_STRICT=1` 137/137 PASS. Patrón "categoría nueva" consolidado: temario→ejercicios→integración lockstep→quórum.

**v1.1 shipped 2026-05-27** — Validación editorial. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos. Infra editorial reutilizable: skills `gsd-validate-exercise` + `gsd-validate-batch`, reporter, smoke paramétrico.

**v1.0 shipped 2026-05-25** — Motor de re-verificación + 7 categorías + Modo Examen. 26 plans, 271 ejercicios curados, 62/62 requirements.

**Stack actual:** Alpine.js 3.15.12 + Pico CSS 2.1.1 (CDN+SRI pinned), ES modules vanilla, **schemaVersion 5**. 9 archivos JSON de gramática (372 ejercicios validated) + bloque Canciones standalone (`validateSongs`, 1ª canción real "Equilibrio mentale" 17 frases + mini-canción de prueba). Infraestructura editorial: skills `gsd-validate-exercise` + `gsd-validate-batch`, `scripts/run-validation-271.mjs`, `scripts/validate-ai-pass.mjs` (multi-provider con auto-fallback 429, añadido en v1.2).

**Last activity:** 2026-06-02 — Milestone v1.3 archivado.

## Next Milestone Goals (post-v1.3)

> Backlog v1.4+ (capturado para que `/gsd-new-milestone` lo reactive):
>
> - **Categorización asistida de frases de canciones** (CATPROC-01/02): un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas; el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas. El modelo de datos v1.3 (LINK-03) ya lo soporta sin bloquearlo.
> - **Más canciones** (MUSIC-X1): añadir canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3.
> - **Categorías nuevas de tiempos verbales** (TENSE-X1..X4): Pretérito imperfetto, Futuro semplice, Condizionale, Congiuntivo — conforme la profesora entrega material
> - **Bridges multi-cat Partitivos** (PART-X1): cruces Partitivos↔género-número/sustantivos, diferidos en v1.2 para acotar
> - **Modo móvil responsive** si el autor lo echa en falta tras uso real
> - **Phase 8.x deferred**: Examen multi-cat (selección 2-3 cats), atajos de teclado (E + número de fila), copy especializada banner reanudar, refactor cosmético confirmLabel unificado en las 6 call-sites de `requestConfirm`

## Context

- **Material base disponible:** 7 archivos en `material-profesora/` (6 PDFs + 1 ODT grande). Son los temas trabajados en clase y definen las categorías iniciales.
- **Nivel objetivo:** A1 a corto plazo, A2 a medio plazo. Las categorías irán creciendo a medida que la profesora vaya entregando material.
- **Filosofía del autor:** "Nada muy sofisticado, es pura repetición y una gestión de los repasos automatizada." Prioriza simplicidad y la mecánica de re-verificación constante sobre features pedagógicas elegantes.
- **Patrón de uso esperado:** Sesiones diarias cortas de ~20 ejercicios + sesiones largas de "test completo" cuando quiera validar un bloque. La racha de 21 días incentiva la práctica diaria. Modo Examen (Phase 8) añade un atajo 1-click para validar dominio de 1 categoría sin hacer 5-6 Repasos seguidos.

## Constraints

- **Tech stack**: web estática (HTML + CSS + JS, sin servidor) — el autor quiere doble click y que funcione, sin instalar nada ni arrancar procesos.
- **Persistencia**: `localStorage` del navegador + export/import a JSON para backup manual — sin base de datos ni backend.
- **Hosting**: local en la máquina del autor. Sin internet, sin cuentas, sin sincronización entre dispositivos.
- **Dispositivo**: desktop only en v1; responsive móvil se evaluará después si lo echa en falta.
- **Contenido**: los ejercicios viven en archivos JSON editados a mano por el autor; no hay UI de edición todavía.
- **Idioma de la interfaz**: español (autor hispanohablante aprendiendo italiano).

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web estática + localStorage, sin servidor | Máxima simplicidad, doble click y funciona, sin procesos arrancados | ✓ Validado Phase 1+2 (`npx serve` + Alpine/Pico CDN) |
| Una categoría = un PDF (granularidad gruesa) | Simplicidad inicial; refactorizar a sub-temas si se queda corto | ✓ Validado Phase 2 (Avere funcional; 6 PDFs en Phase 4) |
| Ejercicios pueden testear varias categorías a la vez | Permite consolidar conocimiento sin explosión de ejercicios separados | ✓ Validado Phase 2 (sampler GUARANTEE phase cubre multi-cat sin duplicar) |
| Si fallas un ejercicio, TODAS sus categorías se desmarcan | Más estricto, refuerza la re-verificación, fiel al espíritu del autor | ✓ Validado Phase 2 (cascada fail-wins absoluta) |
| Si fallas un ejercicio, el efecto es INMEDIATO (no esperar al fin de sesión) | Refinement Phase 2 UAT: previene exploit "fallo + cerrar pestaña → no consecuencia"; core value "te obliga a no olvidar" | ✓ Validado Phase 2 (D-54 `applyImmediateFailure`) |
| Priorización simple por "veces realizadas" (no ratio fallos/aciertos) | El autor pidió simplicidad explícita; SRS se puede añadir luego | ✓ Validado Phase 1+2 (weight cap=10 + GUARANTEE phase) |
| Racha de 21 días cuenta solo días practicados sin fallo | Más justo que "cada día calendario"; no penaliza saltos cortos | ✓ Validado Phase 2 (`lastSuccessDate` guard + display `N / 21 d`) |
| Contenido en JSON manual (no editor UI) en v1 | El autor edita JSON cómodamente; UI de edición es feature, no MVP | ✓ Validado Phase 1+2 (categorías + ejercicios hand-edited) |
| Solo feedback bien/mal, sin explicaciones | El autor pidió velocidad; teoría está en los PDFs | ✓ Validado Phase 1+2 (verde/rojo + auto-avance 600ms) |
| Test completo se reanuda; Repaso se descarta (excepto fallos) | Test completo es inversión grande; Repaso es desechable salvo el fallo individual (D-54) | ✓ Validado Phase 2 (`inFlightTest` subkey per-answer) |
| AppShell único factory plano con `currentScreen` switch | Más simple que router; deep-link no aporta en app local | ✓ Validado Phase 2 (D-24/D-25, 4 pantallas en `src/screens/app.js`) |
| Double-defense Alpine: getter null-safe + x-if guard | Anti-pattern recurrente; bindings se evalúan antes de `init()` | ✓ Validado Phase 2 (descubierto 2 veces en UAT 02-03 y 02-04; pendiente ADR) |
| Helper `applyResultToSession` extraído — UN solo path arquitectónico para acierto/fallo de cualquier tipo | Pitfall #2 (duplicar `applyImmediateFailure` por tipo) prevenido al nivel de codebase, no de revisión humana; refactor de un solo método si cambia la mecánica de cascada | ✓ Validado Phase 3 (2 call-sites exactos en `src/screens/app.js` — verificable con grep) |
| `match` permite duplicados textuales en columna derecha; grading consume por índice de pair (no por texto) | Crítico para artículos italianos donde varios sustantivos comparten artículo (`la casa` + `la porta`); el grading textual con consumo evita ambigüedad | ✓ Validado Phase 3 (D-66, `avere-202` con dos "ha"; tests + UAT) |
| Grading case-insensitive para `word-buttons` y `match` (NO para multi-choice que va por índice) | Reduce fricción al autor transcribir PDFs (la profesora a veces empieza frases con mayúscula); trade-off aceptado vs "ocultar typos de mayúsculas" | ✓ Validado Phase 3 (D-67, `toLowerCase + NFC compare` en `grade()`) |
| `@keydown.window` Alpine para listener global de sesión (vs `addEventListener` manual con cleanup) | Cleanup automático con el lifecycle del `<template x-if>` — elimina clase entera de bugs por listener huérfano | ✓ Validado Phase 3 (D-72, una sola línea sobre el `<article>` del session screen) |
| Sufijos teclado visibles como superíndice Unicode `¹²³ᵃᵇᶜ` (vs `<kbd>` tags) | Mínimo ruido visual + sin doble borde de control en botones; el binding `tecla ↔ botón` es siempre obvio sin tabular | ✓ Validado Phase 3 (UI-SPEC resolution; `.kbd-hint` muted en styles.css) |
| Backup como envoltura con metadata `{kind, exportedAt, schemaVersion, state}` (vs raw blob) | `kind` permite distinguir backups del proyecto de otros JSON; `exportedAt` se muestra en confirm dialog para no confundir versiones antiguas | ✓ Validado Phase 4 (D-73, parseBackupFile + buildBackupWrapper en `src/data/backup.js`) |
| Banner backup persistente sin snooze, desaparece reactivamente al exportar | Coherente con Core Value "el sistema te obliga"; sin snooze evita procrastinación | ✓ Validado Phase 4 (D-80, getter `shouldShowBackupBanner` sobre `state.lastBackupAt`/`firstUsedAt`) |
| `firstUsedAt` inline guard en 4 call-sites (NO helper `setFirstUsedAtIfMissing`) | Helper introducía indirección sin valor; el guard de 1 línea es trivial repetir; revisión architectural más simple por tipo de operación | ✓ Validado Phase 4 (D-78, B-5 fix; verificable por grep de `firstUsedAt ??.*toISOString`) |
| D-88 APPEND-ONLY blindado por scripts/snapshot+assert (no por convención manual) | Convención "no toques avere.json" se rompe silenciosamente; snapshot+deepEqual estructural lo detecta automáticamente | ✓ Validado Phase 4 (`scripts/snapshot-avere-prefix.mjs` + `assert-avere-prefix-unchanged.mjs`) |
| Match solo válido si pareo requiere regla NO derivable por raíz; convertir a multi-choice con distractoras plausibles si no | Ejercicio que cualquiera resuelve por similitud visual de raíz NO demuestra conocimiento; UAT 04-03 lo identificó con `bue↔buoi/dio↔dei/uovo↔uova/tempio↔templi` (todos resolubles por root match) | ✓ Validado Phase 4 (Design Rule UAT, refactor `9d21c88` de sustantivos-irregulares y aplicación inicial en genero-numero + profesiones) |
| 2026-05-25: reabrir Out of Scope "Explicaciones pedagógicas al fallar/acertar" — limitado a fallos, opcional por ejercicio, seed en Preposiciones | Tras 271 ejercicios el autor consultaba Gemini cada fallo de Preposiciones (sulle/da lui/dalle/sui); la teoría en PDFs no era accesible mid-sesión. La explanation destilada inline (1 frase regla + 1 frase ejemplo paralelo) cierra el loop pedagógico sin romper la velocidad del flow porque solo se muestra al fallar (D-134) | ✓ Validado Phase 7 (50/50 explanations curadas Preposiciones + render inline + render summary-errors; campo opcional retro-compatible con 221 ejercicios sin explanation; UAT 13/13 PASS — 6/6 vertical slice Plan 07-01 + 7/7 cobertura Plan 07-02) |
| 2026-05-25: canon ortográfico español correcto (acentos + ñ) en TODAS las explanations del proyecto (D-135 / EXPL-06) | Si está escrito en español, debe estar bien escrito. El canon Phase 7 ("sin acentos") fue incidental del executor inicial, no decisión consciente. Italianismos citados preservan ortografía italiana (D-137) — solo el texto explicativo en español sigue el canon RAE | ✓ Validado Phase 7.1 (50 Preposiciones re-acentuadas Plan 7.1-01 + 40 Género-Número ingestadas con acentos correctos Plan 7.1-02 + smoke test paramétrico verifica ASCII apóstrofes preservados). Patrón heredado por fases incrementales 7.2..7.6 |
| 2026-05-25: Cobertura 100% editorial pre-ship — todas las 7 categorías con explanations curadas (EXPL-09..14) | No shipear a medias con solo Preposiciones + Génnum cubiertas; uso real demanda explanation en cualquier categoría que se falle. 11 batches D-85 secuenciales aceptables a cambio de cobertura completa pre-milestone v1.0 | ✓ Validado Phase 7.2 (181 explanations curadas + 7 entries en CATEGORIES_WITH_EXPLANATIONS + tests 199/199 verdes + UAT integral 7 categorías × Repaso 20 mixto post-Task-4) |
| 2026-05-25: Phase 8 — 6ª call-site `requestConfirm` con copy literal D-44 idéntica + confirmLabel `Descartar y empezar` lockeado | Patrón unificado de Phase 2 D-44 — coherencia textual entre las 6 call-sites del helper. UI-SPEC línea 222 sugería inicialmente `Continuar` (coherencia con D-27), pero análisis empírico de las 5 call-sites previas (commit d7a0e4b) reveló distribución `Descartar*` 4/5 + `Continuar` 1/5. Planner lockeó `Descartar y empezar` por proximidad semántica EXACTA con openPicker D-44 (mismo message + mismo intent: descartar Test completo activo + arrancar nuevo). Homogeneización general de las 6 call-sites diferida (out of scope Phase 8) | ✓ Validado Phase 8 (Plan 08-01 — 6ª call-site del helper con copy literal + confirmLabel verificable por grep + smoke test 4 del screen-examen.test.js) |
| 2026-06-02: v1.3 — Bloque Canciones brownfield, REUTILIZAR el engine, NO reconstruir | El motor de re-verificación (cascada D-54, word-buttons `grade()`, schema-validator, patrón Test-completo) está DONE; un modo de ejercicio nuevo (traducción it→es) se construye sobre call-sites existentes para minimizar superficie de bug y mantener una sola mecánica de cascada | ✓ Validado Phase 13+14 (playthrough reusa `applyResultToSession`, 0 nuevos `applyImmediateFailure`; 306/306 tests; el único bug del milestone fue del motor pre-existente, no de código nuevo) |
| 2026-06-02: Canciones standalone (LINK-04) — fuera del sampler Repaso 20 / Test / tabla de categorías; pantallas DEDICADAS `cancion`/`cancion-summary` con `songCurrentPhrase`/`songPhraseById` | El espíritu de re-verificación llega vía cascada a las categorías gramaticales reales enganchadas por frase, no convirtiendo la canción en categoría; mantenerlo aparte evita contaminar el modelo de categorías (dominada/racha/21-day) | ✓ Validado Phase 13 (canciones nunca aparecen en sampler ni home; bug `bankWithKeys` en Phase 14 confirmó que el aislamiento `sessionCurrentExercise=null` era correcto — el fix fue aceptar también `songCurrentPhrase`) |
| 2026-06-02: Estado por canción plano `{status, lastPlayedAt}` (pasada/fallada), NO dominada/racha/21-day; sin slot de reanudación (PLAY-05) | Las canciones no son material de re-verificación graduada como las categorías; el estado simple basta y el abandono-descarta-y-reempieza evita la complejidad de `inFlightTest` por canción | ✓ Validado Phase 13 (`songProgress` plano + `migrate4to5` + `backup.js` v5; abandonar a mitad reempieza de cero, fallos ya cascadeados persisten) |
| 2026-06-02: Validación de contenido de canciones LIGERA autor-oráculo (CONT-03), NO quórum estricto R1-R7 | Las traducciones de canciones son "particulares" por diseño (fraseo artístico); el quórum gramatical produciría falsos positivos sobre decisiones de estilo. Una IA verifica que la traducción sea defendible y el enganche correcto; el autor decide el fraseo | ✓ Validado Phase 14 ("Equilibrio mentale" 17 frases con 1 pase IA + autor oráculo; sin disputed gramatical) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-03 — Milestone v1.4 (Variantes de ejercicio / slots por regla), Phase 15 completa: modelo de datos slot+variantes (validator XOR payload/variants[], explicación a nivel de slot), migración `schemaVersion 5→6` (`migrate5to6`/`hydrateV6`) + backup round-trip v6, las 9 categorías reales cargan intactas como slots de 1 variante (SLOT-01..06, 367/367 tests, checkpoint humano aprobado). Siguiente: Phase 16 (motor de examen por slots).*
