# Italian Course — Ejercicios A1/A2

## What This Is

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Es una herramienta de auto-validación pura: repite, mezcla y obliga a re-verificar constantemente lo aprendido, garantizando que las reglas y excepciones de cada tema no se olvidan. Es para una sola persona (el autor), funciona local en su PC y desktop.

## Core Value

**Que el sistema te obligue a no olvidar.** El motor de repetición tiene que garantizar que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera. Sin ese loop, el resto no importa.

## Current Milestone: entre milestones (v1.6 shipped — planificar el siguiente)

**v1.6 — Conversión a slots: categorías restantes (CONV-01 cierre) — SHIPPED 2026-06-09.** Las 6 categorías legacy restantes (Avere 23→19, Essere 39→26, Verbi di movimento 37→7, Genere e numero 40→12, Professioni 51→11, Sostantivi irregolari 31→5) convertidas al modelo slot+variantes (reagrupar por regla con explanation a nivel de slot + autorar variantes nuevas por quórum cross-vendor R1-R7) + migración `schemaVersion 8→9` con reset selectivo de las 6. Las dos léxicas (Professioni, Sostantivi irregolari) se resolvieron como **HÍBRIDAS** (bloque regla con variantes intercambiables + bloque léxico/contraste sin autoría — no se forzaron variantes artificiales, resolviendo la open question del roadmap). 7 fases (21-27), 19 plans, 14/14 requirements, 374/374 tests (383/383 strict). Brownfield puro: el motor v1.4 nunca se tocó. **CONV-01 CERRADO: las 9 categorías de gramática quedan en formato slot+variantes unificado.** Detalles en `.planning/milestones/v1.6-ROADMAP.md`.

**Next:** arrancar el próximo milestone con `/gsd:new-milestone`. Candidatos del backlog: nuevas categorías de tiempos verbales conforme entregue material la profesora (Imperfetto / Futuro semplice / Condizionale / Congiuntivo — TENSE-X1..X4), autoría asistida de variantes (AUTHOR-01), categorización asistida de frases de canciones (CATPROC), más canciones (MUSIC-X1), responsive móvil si emerge dolor.

**Scope boundary (cumplido):** v1.6 cerró CONV-01. El bloque Canciones sigue como modo standalone aparte (no aplica slot+variantes). Tiempos verbales futuros y bridges multi-categoría siguen en backlog.

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

<!-- No hay milestone activo. v1.6 shipped 2026-06-09 (CONV-01 cerrado). Próximo milestone vía /gsd:new-milestone — candidatos en §"Next Milestone Goals". -->

_Sin requisitos activos — entre milestones. Los candidatos del backlog (TENSE-X1..X4, AUTHOR-01, CATPROC, MUSIC-X1, responsive móvil) se reactivarán con `/gsd:new-milestone`._

### Recently Validated (v1.6 — shipped 2026-06-09, CONV-01 CERRADO)

- ✓ **Migración `8→9` reset selectivo de 6 categorías** (Phase 21, MIG-03/04): `migrate8to9`/`hydrateV9` idempotente + deep-clone anti-prototype-pollution; reset SOLO de las 6 a convertir (predicado de 6 prefijos); las 3 ya convertidas byte-intactas; `backup.js` round-trip v9 + import v8→v9 + rechazo `>9`.
- ✓ **Avere → slots** (Phase 22, AVE-01/02): 23 → 19 slots por regla (presente + sensaciones + idiomático + passato prossimo + cruces multi-cat 300..305 con cascada D-54 intacta); 14 superficies nuevas por quórum; counts 323→320.
- ✓ **Essere → slots** (Phase 23, ESS-01/02): 39 → 26 slots; 14 superficies nuevas + slot ser/estar (D-23-07); counts 320→307.
- ✓ **Verbi di movimento → slots** (Phase 24, MOV-01/02): 37 → 7 slots por la REGLA DE AUXILIAR (essere-vs-avere; concordancia en 1 slot; correre aislado); 20 superficies nuevas; counts 307→277.
- ✓ **Genere e numero → slots** (Phase 25, GEN-01/02): 40 → 12 slots de morfología género/plural (3 match por D-04); 20 superficies nuevas; counts 277→249.
- ✓ **Professioni → slots HÍBRIDO** (Phase 26, PROF-01/02): 51 → 11 slots (feminización rule-rich CON variantes + bloque léxico SIN variantes); 12 superficies nuevas; resuelve la open question (híbrida); counts 249→209.
- ✓ **Sostantivi irregolari → slots HÍBRIDO** (Phase 27, SOST-01/02): 31 → 5 slots (sovrabbondanti + invariabili CON variantes + cambio-radice/plurali-regolari SIN autoría); 13 superficies nuevas, 4 bugs R7 de doble-validez cazados por el quórum; counts 209→183.
- ✓ **CONV-01 CERRADO:** las 9 categorías de gramática en formato slot+variantes unificado. Las dos léxicas resueltas como híbridas sin forzar variantes artificiales. Motor v1.4 nunca tocado (brownfield puro contenido + migración).

### Recently Validated (v1.5 — shipped 2026-06-05)

- ✓ **Migración `7→8` reset selectivo** (Phase 18, MIG-01/02): `migrate7to8`/`hydrateV8` + `CURRENT_SCHEMA_VERSION=8` clonando el patrón `migrate6to7`/`hydrateV7`, reseteando el progreso SOLO de Articoli + Partitivos (las otras 7 byte-intactas, verificado por fixture); `backup.js` round-trip v8 + import v7→v8 + rechazo `>8`.
- ✓ **Articoli → slots** (Phase 19, ART-01..04): `articoli.json` de 56 ejercicios legacy `payload` a 34 slots (16 determinativi lo/gli split por sub-disparador + 8 indeterminativi como slots propios + 2 match + 6 cruces); 8 variantes nuevas por quórum + 2 slots de huecos semiconsonánticos (`lo/gli-yi`); counts re-sincronizados (370→348).
- ✓ **Partitivi → slots** (Phase 20, PART-01..03): `partitivos.json` de 44 ejercicios legacy a 19 slots (del-formas split por sub-disparador + alternativas + negativa con `∅` + clasificación partitivo-vs-prep MC de 3 + match); 6 variantes nuevas por quórum + 2 slots de huecos (`degli-gn/ps`); counts re-sincronizados (348→323).
- ✓ **CONV-01 bloque Artículos cerrado:** 3 de 9 categorías ya en formato unificado slot+variantes (preposiciones piloto + articoli + partitivos); el patrón pilot→escala demostrado reutilizando la maquinaria v1.4 sin reconstruir motor/sampler/cascada/smoke. Quedan 6 categorías (verbos + morfología) para milestones futuros.

### Recently Validated (v1.4 — shipped 2026-06-03)

- ✓ **Modelo de datos slot+variantes** (Phase 15): `validateContent` acepta `payload` XOR `variants[]` reusando validadores de superficie por tipo; `slotById` uniforme derivado vía la función pura `normalizeExerciseToSlot` (legacy→slot-de-1); explicación a nivel de slot; migración `5→6` idempotente + `backup.js` round-trip v6; las 9 categorías legacy validan intactas como slots de 1 variante (SLOT-01..06).
- ✓ **Motor de examen por slots** (Phase 16): `pickVariantIndex` uniforme + `variantIndices` paralelo en `buildSession`/`buildFullTest` fija 1 variante aleatoria por slot; "categoría hecha" = pasar 1 variante de cada slot; render slot-aware vía getter con `.payload` sintético; cascada D-54 intacta (2 call-sites verificados por grep); Repaso 20 / Test / Examen integran el muestreo por slot (EXAM-01..06).
- ✓ **Piloto Preposiciones** (Phase 17): 52 ejercicios → 49 slots por regla (4 fusiones + 2 slots locativos nuevos), 41 variantes nuevas autoradas por quórum cross-vendor (DeepSeek + Opus + Sonnet, 6 bugs reales cazados, 2 rechazadas por doble-validez); `migrate6to7` resetea SOLO Preposiciones; smoke paramétrico bifurcado por shape reutilizable para CONV-01 (PILOT-01..05).
- ✓ Patrón "rework de motor + piloto de contenido" validado: el modelo slot+variantes se añade sin reconstruir el engine (cascada D-54, sampler, schema-validator, patrón Test-completo intactos), las 8 categorías no-piloto sobreviven como slots de 1 variante, y el quórum cross-vendor sigue cazando bugs que un human-verify aprobaría.

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

**v1.6 — Phase 27 completada 2026-06-09 (7/7 fases — ÚLTIMA, CONV-01 CERRADO)** — Sostantivi irregolari convertida al modelo slot+variantes en formato **HÍBRIDO** (SOST-01 + SOST-02, tercera y última categoría léxica): los 31 ejercicios (100% multiple-choice, sin match/word-buttons) reagrupados en **5 slots** — BLOQUE REGLA con autoría de variantes (`sovrabbondanti` `-o`sing→`-a`plur fem del cuerpo · `invariabili-accentate` città/caffè/università · `invariabili-straniere` film/sport, dividida en 2 sub-reglas por las 2 trampas A1 distintas) + BLOQUE LÉXICO PURO `cambio-radice` (uomo/dio/bue/tempio como lemas memorizables, duplicado #008==#025 como 2 variantes) + BLOQUE CONTRASTE `plurali-regolari` (parentesco regular como foils), estos dos SIN variantes nuevas (SOST-01 documentado explícitamente, no se fuerzan artificiales). 13 superficies nuevas autoradas SOLO en el bloque regla y pasadas por quórum cross-vendor R1-R7 (≥4× correcta, 1-por-1; el quórum cazó **4 bugs reales de doble-validez R7** — cigli=bordes, sopraccigli, lenzuoli, migli=mijo — resueltos por reformulación con gloss ES). Sin cruces multi-cat ni snapshot APPEND-ONLY (avere-only). 3 hardcodes de count + `TOTAL_EXPECTED` re-sincronizados (31→5, 209→183). Suite 374/374 (383/383 con `VAL_07_STRICT=1`), reporter VAL-06 183/183; verificación 10/10 must-haves; code review 0 blockers (1 warning de calidad de foil en el duplicado tempio). **CONV-01 CERRADO: las 9 categorías de gramática quedan en formato slot+variantes unificado — fin del milestone v1.6** (pendiente `/gsd:complete-milestone v1.6` para archivar).

**v1.6 — Phase 26 completada 2026-06-08 (6/7 fases)** — Professioni convertida al modelo slot+variantes en formato **HÍBRIDO** (PROF-01 + PROF-02, segunda categoría léxica): los 51 ejercicios reagrupados en **11 slots** combinando un BLOQUE REGLA de feminización rule-rich por sub-regla (`femminile-o-a`/`-iera`/`-trice`/`-essa`/`invariabili`) con un BLOQUE LÉXICO PURO sin variantes (comprensión + 3 match preservando D-04 profesión↔lugar/herramienta/acción + articolo-suono + word-buttons). 12 superficies nuevas autoradas SOLO en feminización (contraste -trice/-essa, invariables -ista/-ante anti-calco *la-dentistessa*, -o/-a y -iere/-iera) y pasadas por quórum cross-vendor R1-R7 (≥4× correcta, 1 bug cazado y resuelto por reformulación: *poeta→poetessa* con gloss ES; eroe descartado por irregular); el bloque léxico documenta explícitamente "SIN autoría de variantes" (PROF-01/D-26-02), sin forzar variantes artificiales. Sin cruces multi-cat ni snapshot APPEND-ONLY (avere-only). 3 hardcodes de count + `TOTAL_EXPECTED` re-sincronizados (51→11, 249→209). Suite 374/374 (383/383 con `VAL_07_STRICT=1`), reporter VAL-06 209/209; verificación 3/3 must-haves. Phases 21-26 hechas; pendiente solo 27 (Sostantivi irregolari). **8/9 categorías en formato slot+variantes.** (Phase 25 — Genere e numero, GEN-01/02 — completada 2026-06-08: 40 ejercicios → 12 slots de morfología género/plural, 20 superficies nuevas, 3 match D-04.)

**v1.6 — Phase 24 completada 2026-06-08 (4/7 fases)** — Verbi di movimento convertida al modelo slot+variantes (MOV-01 + MOV-02, tercera y última categoría de verbos): los 37 ejercicios reagrupados en **7 slots** por la REGLA DE AUXILIAR (essere-vs-avere en passato prossimo, la trampa A1 propia): slot `essere` (selección de auxiliar, variantes intercambiables, anti-calco "io ho andato"), `concordanza` en UN solo slot (D-24-03, divergencia deliberada vs Essere que separó en 4), `excepcioni-avere` (movimiento sin destino → avere + participio invariable), `correre` propio ("¿hay destino?"), 3 word-buttons. 20 superficies nuevas (4 ejes de huecos D-24-06: más verbos essere scendere/salire/cadere/rimanere/restare/diventare/nascere, más excepciones avere, test-de-destino correre/volare, matriz de concordancia) autoradas y pasadas por quórum cross-vendor R1-R7 (≥4× correcta, 0 incorrecta; 2 disputes resueltas por reformulación). Sin cruces multi-cat ni snapshot APPEND-ONLY (avere-only). 3 hardcodes de count + `TOTAL_EXPECTED` re-sincronizados (37→7, 307→277). Suite 374/374 (383/383 con `VAL_07_STRICT=1`); verificación 7/7 must-haves. Phases 21 (migración 8→9) + 22 (Avere) + 23 (Essere) + 24 (Verbi di movimento) hechas; pendientes 25 (Genere e numero), 26 (Professioni), 27 (Sostantivi irregolari). 6/9 categorías en formato slot+variantes.

**v1.5 — Phase 20 completada 2026-06-05 (última fase del milestone)** — Partitivi convertida al modelo slot+variantes: los 44 ejercicios validados reagrupados en **19 slots** por regla (10 del-formas split por sub-disparador fonético + 3 alternativas qualche/un po' di/alcuni-e + 1 contraste de negativa con `∅` + 1 clasificación partitivo-vs-preposizione MC de 3 opciones + 2 match), con pares contable/incontable absorbidos en su slot del-forma por `correctIndex` real. 6 superficies nuevas autoradas y pasadas por quórum cross-vendor R1-R7 (4 celdas pobres engordadas + 2 slots nuevos de suoni speciali `degli-gn`/`degli-ps`; los huecos singulares dello+gn/ps/x descartados por exigir incontable sobre sustantivos contables). 3 hardcodes de count re-sincronizados (44→19) + `TOTAL_EXPECTED` (348→323). Suite 358/358 (367/367 con `VAL_07_STRICT=1`). PART-01..03 validados; verificación 9/9 must-haves. Con Phase 19 (Articoli) ya completada, **todas las fases de v1.5 (18-20) están hechas** — pendiente `/gsd:complete-milestone v1.5` para archivar.

**v1.4 shipped 2026-06-03** — Variantes de ejercicio (slots por regla). El contenido pasa de "ejercicios sueltos" a un modelo slot+variantes: cada slot = 1 regla con 1..N variantes intercambiables y explicación compartida; el examen elige 1 variante al azar por slot, "hecha" = pasar los N slots, y re-hacer tras fallo puede tocar variantes distintas → mata la memorización por palabras. Motor reescrito sobre el engine v1.0 sin tocar la cascada D-54 (2 call-sites de `applyImmediateFailure`, verificados por grep). Las 8 categorías no-piloto siguen como slots de 1 variante (backward-compat). Piloto Preposiciones: 52 ejercicios → 49 slots, 41 variantes nuevas por quórum cross-vendor (6 bugs cazados, 2 rechazadas), 2 slots locativos nuevos (`in spiaggia`/`al mare`). `schemaVersion 5→6→7` (`migrate5to6`/`6to7`, reset selectivo de Preposiciones). 3 phases, 9 plans, 17/17 requirements, 342/342 tests verdes.

**v1.3 shipped 2026-06-02** — Bloque "Canciones": modo de ejercicio nuevo (traducción it→es frase a frase con word-buttons inverso) construido enteramente sobre el engine v1.0 sin reconstruirlo. Pantalla separada del home, estado simple pasada/fallada por canción, cascada D-54 por frase enganchada, standalone fuera del sampler. Primera canción real "Equilibrio mentale — Ultimo" (17 frases) autorada con validación ligera autor-oráculo (NO quórum R1-R7). schemaVersion 4→5 (`migrate4to5` + `backup.js` v5). Un bug del motor (`bankWithKeys` vacío en modo canción por LINK-04) cazado en UAT humano y arreglado (`02d6f4a`). 2 phases, 3 plans, 19/19 requirements, 306/306 tests verdes.

**v1.2 shipped 2026-05-28** — 2 categorías nuevas de gramática A1 diseñadas desde cero sin PDF: Articoli (56 ejercicios, 8ª categoría) + Partitivos (44 ejercicios, 9ª categoría). 100 ejercicios nuevos, todos validados por quórum cross-vendor (DeepSeek + Opus 4.7); el cross-vendor capturó 8 bugs en Articoli que el human-verify dejó pasar (contracciones prep+art, leak de triggers fonéticos, acentos graves c'è/più). 1 override autor en `partitivos-036` (D-02: el ejercicio entrena USO del partitivo afirmativo, ∅ válido pero no idiomático). Gate verde: reporter exit 0 (372/372 validated), smoke `VAL_07_STRICT=1` 137/137 PASS. Patrón "categoría nueva" consolidado: temario→ejercicios→integración lockstep→quórum.

**v1.1 shipped 2026-05-27** — Validación editorial. 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6 contra R1-R7→C1-C5. 55 disputed resueltos. Infra editorial reutilizable: skills `gsd-validate-exercise` + `gsd-validate-batch`, reporter, smoke paramétrico.

**v1.0 shipped 2026-05-25** — Motor de re-verificación + 7 categorías + Modo Examen. 26 plans, 271 ejercicios curados, 62/62 requirements.

**Stack actual:** Alpine.js 3.15.12 + Pico CSS 2.1.1 (CDN+SRI pinned), ES modules vanilla, **schemaVersion 9**. **Las 9 categorías de gramática en formato slot+variantes unificado** (CONV-01 cerrado): Preposiciones 49 · Articoli 34 · Partitivi 19 · Avere 19 · Essere 26 · Verbi di movimento 7 · Genere e numero 12 · Professioni 11 · Sostantivi irregolari 5 slots; `TOTAL_EXPECTED = 183`. + bloque Canciones standalone (`validateSongs`, 1ª canción real "Equilibrio mentale" 17 frases + mini-canción de prueba). Engine slot-aware: `pickVariantIndex` + `variantIndices`, getter `.payload` sintético, `normalizeExerciseToSlot`. Infraestructura editorial: skills `gsd-validate-exercise` + `gsd-validate-batch`, `scripts/run-validation-271.mjs`, `scripts/validate-ai-pass.mjs` (multi-provider con auto-fallback 429), smoke paramétrico bifurcado por shape (slot/legacy). Suite 374/374 (383/383 con `VAL_07_STRICT=1`).

**Last activity:** 2026-06-09 — Milestone v1.6 shipped (CONV-01 cerrado, 9/9 categorías unificadas); archivado. Entre milestones — próximo vía `/gsd:new-milestone`.

## Next Milestone Goals (post-v1.4)

> Backlog v1.5+ (capturado para que `/gsd-new-milestone` lo reactive):
>
> - **Conversión del resto de categorías a slots** (CONV-01): reestructurar las otras 8 categorías (Avere, Essere, Verbos-movimiento, Sustantivos-irregulares, Género-número, Profesiones, Articoli, Partitivos) a slots-por-regla + variantes, una por milestone incremental siguiendo el patrón validado en el piloto Preposiciones (Phase 17). En v1.4 funcionan como slots de 1 variante (backward-compat). **Candidato natural al próximo milestone.**
> - **Autoría asistida de variantes** (AUTHOR-01): UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano; en v1.4 se autoran a mano + quórum (patrón D-85).
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
| 2026-06-03: v1.4 — Slot+variantes con explicación a nivel de slot (no por variante) y render vía `.payload` sintético | Variantes intercambiables comparten regla → comparten explicación (más simple de autorar/validar); un getter slot-aware que re-envuelve `slotById[id].variants[i]` en un `.payload` sintético (análogo `songCurrentPhrase`) deja sobrevivir `initSubStateForExercise` y todos los bindings `.payload.*` sin tocarlos, y `normalizeExerciseToSlot` hace que las 9 categorías legacy sean slots de 1 variante sin re-autoría | ✓ Validado Phase 15-17 (`pickVariantIndex` + `variantIndices` paralelo; cascada D-54 con 2 call-sites verificados por grep; 342/342 tests; piloto Preposiciones 49 slots con quórum cazando 6 bugs) |
| 2026-06-03: v1.4 — Reset selectivo de progreso al migrar contenido a slots (`migrate6to7` solo toca Preposiciones) | Mapear el progreso viejo ejercicio→slot es complejo y de poco valor; resetear solo la categoría reworkeada (categoryProgress + exerciseStats por prefijo + inFlightTest) es coherente con el Core Value ("te obliga a no olvidar") y deja las otras 8 categorías byte-intactas | ✓ Validado Phase 17 (`migrate6to7`/`hydrateV7`, schemaVersion 6→7, backup round-trip v7; las 8 no-piloto conservan progreso) |
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
*Last updated: 2026-06-09 after v1.6 milestone — Milestone v1.6 (Conversión a slots: categorías restantes / cierre CONV-01) SHIPPED y archivado: 7 fases (21-27), 19 plans, 14/14 requirements, 374/374 tests, `schemaVersion 8→9`; las 9 categorías de gramática quedan en formato slot+variantes unificado (CONV-01 CERRADO). Las dos léxicas (Professioni, Sostantivi irregolari) resueltas como híbridas. Entre milestones — próximo vía `/gsd:new-milestone`. — Phase 27 (Sostantivi irregolari → slots, SOST-01/SOST-02) COMPLETADA, ÚLTIMA fase de v1.6: `sustantivos-irregulares.json` reescrita de 31 ejercicios legacy a **5 slots** en formato HÍBRIDO (bloque regla con 13 variantes nuevas por quórum cross-vendor — 4 bugs R7 de doble-validez cazados y reformulados — + bloque léxico cambio-radice + bloque contraste plurali-regolari, ambos sin autoría, SOST-01 documentado), 3 hardcodes de count + `TOTAL_EXPECTED` re-sincronizados (31→5, 209→183), suite 374/374 (383/383 strict), reporter 183/183, verificación 10/10. **CONV-01 CERRADO: 9/9 categorías de gramática en formato slot+variantes unificado → milestone v1.6 funcionalmente completo (7/7 fases, 19/19 plans); siguiente `/gsd:complete-milestone v1.6`.** — Milestone v1.6 (Conversión a slots: categorías restantes / cierre CONV-01) ABIERTO: convertir las 6 categorías legacy (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) a slot+variantes, 1 fase por categoría + migración `8→9` con reset selectivo, dejando las 9 categorías en formato único. Numeración CONTINÚA desde Phase 20. — v1.5 milestone shipped & archivado (Conversión a slots: Bloque Artículos, Phases 18-20, 9/9 requirements, 358/358 tests; 3/9 categorías ya en formato slot+variantes). — Phase 20 (Partitivi → slots, PART-01..03) COMPLETADA: `partitivos.json` reescrita de 44 ejercicios legacy a 19 slots+variantes (split por sub-disparador fonético en del-formas; negativa con `∅` como skill propio; clasificación partitivo-vs-prep MC de 3), 6 superficies nuevas por quórum cross-vendor R1-R7, 3 hardcodes de count + `TOTAL_EXPECTED` re-sincronizados (suite 358/358, 367/367 strict), verificación 9/9. Con Phase 19 (Articoli) ya hecha, las 3 fases de v1.5 (18-20) están completas → siguiente `/gsd:complete-milestone v1.5`. — Phase 18 (Migración `7→8`, reset selectivo articoli + partitivos / MIG-01 + MIG-02) COMPLETADA: `migrate7to8`/`hydrateV8` + `CURRENT_SCHEMA_VERSION=8` (storage.js + backup.js espejo) clonando el patrón `migrate6to7`/`hydrateV7`, con reset de progreso SOLO de articoli + partitivos (las otras 7 byte-intactas, verificado por fixture de 9 categorías); backup.js round-trip v8 + import v7→v8 con reset + rechazo `>8`. 1 plan TDD, 358/358 tests verdes (342 baseline + 16 v8). Quedan Phases 19 (Articoli→slots) y 20 (Partitivi→slots) en v1.5. — Milestone v1.5 (Conversión a slots: Bloque Artículos / CONV-01) INICIADO: convertir Articoli + Partitivi a slots+variantes (reagrupar por regla + autorar variantes nuevas por quórum), migración 7→8 con reset selectivo de ambas categorías, reutilizando toda la maquinaria v1.4. Las 6 categorías restantes (verbos + morfología) continúan CONV-01 en milestones futuros. Numeración de fases CONTINÚA desde Phase 17. — v1.4 (Variantes de ejercicio / slots por regla) ARCHIVADO. 3 phases (15-17), 9 plans, 17/17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests verdes, `schemaVersion 5→6→7`. Motor slot+variantes sobre el engine v1.0 (cascada D-54 intacta, 2 call-sites) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum cross-vendor cazando 6 bugs, 2 slots locativos). Las 8 categorías no-piloto = slots de 1 variante (backward-compat, CONV-01 difiere su conversión). Entre milestones — próximo: `/gsd-new-milestone` (candidato: CONV-01).*
