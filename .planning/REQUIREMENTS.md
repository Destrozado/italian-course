# Requirements: Italian Course — Ejercicios A1/A2

**Defined:** 2026-05-23
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## v1 Requirements

### Foundation (FOUND)

- [x] **FOUND-01**: La app arranca con `npx serve` apuntando a la carpeta del proyecto (o equivalente local) y se accede via `http://localhost:3000`
- [x] **FOUND-02**: Stack: HTML + CSS + JS vanilla con Alpine.js (CDN, versión pinned) y Pico CSS (CDN, versión pinned); cero build step
- [x] **FOUND-03**: La app es responsive a nivel básico (no rota en desktop pequeño), pero el target primario es desktop
- [x] **FOUND-04**: Idioma de UI: español (textos hardcoded en v1, sin sistema i18n)

### Content & Schema (CONT)

- [x] **CONT-01**: El contenido (ejercicios) vive en archivos JSON dentro de `content/exercises/`, un archivo por categoría (`avere.json`, `genero-numero.json`, etc.)
- [x] **CONT-02**: Existe `content/categories.json` como registro maestro de categorías (id slug ASCII, nombre humano, orden de carga)
- [x] **CONT-03**: Cada ejercicio en JSON tiene: `id` único, `type` (`multiple-choice` | `word-buttons` | `match`), `categoryIds` (array de 1..N ids), `payload` (estructura según tipo), opcionalmente `notes`
- [x] **CONT-04**: Existe un schema validator que se ejecuta al cargar y rechaza JSON malformado o referencias a `categoryId` desconocidas
- [x] **CONT-05**: Si falla la carga/validación, la UI muestra un banner de error visible (no silencioso en consola) con el nombre del archivo y el problema
- [x] **CONT-06**: Las strings se normalizan a NFC al cargarse (para evitar problemas con acentos copiados desde PDFs)

### Exercise Types (EXTYPE)

- [x] **EXTYPE-01**: Tipo `multiple-choice`: muestra una frase con un hueco y 3-4 botones de opción; el usuario pulsa una; valida acertado/fallado
- [x] **EXTYPE-02**: Tipo `word-buttons`: muestra una frase en español a traducir; presenta botones con palabras italianas (más algunas distractoras); el usuario las pulsa en orden para construir la traducción; valida cuando el usuario marca terminado
- [x] **EXTYPE-03**: Tipo `match`: muestra dos columnas (ej. sustantivos ↔ artículos); el usuario hace click en un ítem de la izquierda y luego en su pareja a la derecha; valida cuando todos están emparejados (completado Phase 3 plan 02 — handler `match.grade` puro + sub-template Alpine 2 columnas + cascada D-61 inmediata idempotente + teclado 1-9 + a-i + seed avere-200..202 incluyendo duplicados D-66; ver 03-02-SUMMARY.md)

### Domain Core (DOMAIN)

- [x] **DOMAIN-01**: Función pura `dates.todayLocal()` devuelve la fecha local en formato `YYYY-MM-DD` usando reloj local (no UTC)
- [x] **DOMAIN-02**: Función pura `session.buildSession(categories, exercises, state, size, mode)` que genera una sesión: garantiza min 1 ejercicio por categoría elegida (set-cover greedy), rellena hasta `size` con muestreo aleatorio ponderado por `weight = 1/(1+min(timesShown, 10))`
- [x] **DOMAIN-03**: Función pura `session.buildFullTest(categories, exercises)` devuelve TODOS los ejercicios que tocan al menos una categoría elegida (sin tope)
- [x] **DOMAIN-04**: Función pura `progress.applySessionResult(state, sessionResults)` aplica los efectos al final de sesión: actualiza contadores por ejercicio, aplica cascada de fallo (todas las categorías de un ejercicio fallado pasan a `no-hecha`, racha a 0, vacía `clearedExerciseIds`), promociona a `hecha` cuando `clearedExerciseIds` cubre todos los ejercicios de la categoría
  > **Excepción tras Plan 02-03 UAT round 2 (D-54):** los **fallos individuales** de un ejercicio se persisten inmediatamente vía `applyImmediateFailure` — el core value "te obliga a no olvidar" prevalece sobre la promesa "abandono descarta". Solo los aciertos de un Repaso abandonado se descartan. La cascada al final de sesión sigue corriendo idempotente sobre el state ya reseteado; los `exerciseStats` se bumpean una sola vez ahí (preserva DOMAIN-09 monotonicidad).
- [x] **DOMAIN-05**: Estados de categoría: `no-hecha` → `hecha` → `dominada` (con 21 días de racha consecutivos)
- [x] **DOMAIN-06**: Una categoría `hecha` o `dominada` vuelve a `no-hecha` automáticamente si se añade un ejercicio nuevo al JSON que no está en su `clearedExerciseIds`
- [x] **DOMAIN-07**: La racha por categoría se incrementa solo cuando, en una sesión completada, esa categoría fue practicada y no tuvo ningún fallo, Y `lastSuccessDate !== todayLocal()` (sólo cuenta una vez por día)
- [x] **DOMAIN-08**: Al alcanzar 21 días consecutivos de racha sin fallar, la categoría pasa a `dominada` (visible) pero sigue apareciendo en sesiones igual que el resto
- [x] **DOMAIN-09**: Contadores por ejercicio (`timesShown`, `timesCorrect`, `timesFailed`) son monotónicos crecientes — nunca se resetean, ni siquiera cuando la categoría se desmarca
- [x] **DOMAIN-10**: La lógica de dominio tiene tests unitarios (smoke tests) que simulan 30+ días de actividad cubriendo: cascada de fallo en ejercicios multi-categoría, racha contando una vez por día, promoción `no-hecha → hecha → dominada`, regresión `dominada → no-hecha`, sampler con categorías de 1-2 ejercicios, oversubscription, weight cap

### Session UI (SESSION)

- [x] **SESSION-01**: Pantalla home muestra todas las categorías con: nombre, estado (`no-hecha` / `hecha` / `dominada` con marca visual distinta), días de racha actuales, total de ejercicios, última fecha practicada
- [x] **SESSION-02**: Botón "Repaso de 20" abre una pantalla de selección de categorías con checkboxes (con select-all / clear-all)
- [x] **SESSION-03**: Botón "Test completo" abre la misma pantalla de selección de categorías; al lanzar muestra advertencia con el número total de ejercicios incluidos
- [x] **SESSION-04**: Durante la sesión, muestra indicador de progreso (ej. "Ejercicio 7 / 20" o "Ejercicio 7 / 152" para test completo)
- [x] **SESSION-05**: Feedback binario: al acertar, el ejercicio se marca en verde y auto-avanza tras ~600ms; al fallar, se marca en rojo y muestra la respuesta correcta + botón "Siguiente" (no auto-avance)
- [x] **SESSION-06**: Atajos de teclado: 1-4 para multiple-choice, Enter para confirmar/avanzar tras fallo, Space como alias de Enter
- [x] **SESSION-07**: Al final de la sesión, pantalla de resumen (no toast) que muestra: ejercicios acertados/fallados, y por cada categoría tocada: estado antes → después, racha antes → después, ejercicios que faltan para `hecha`
- [x] **SESSION-08**: Una sesión Repaso abandonada (cierre de pestaña / navegación atrás antes de terminar) **se descarta** completamente — los aciertos/fallos no afectan al estado ni a los contadores
  > **Excepción tras Plan 02-03 UAT round 2 (D-54):** los **fallos individuales** de un ejercicio se persisten inmediatamente — el core value "te obliga a no olvidar" prevalece sobre la promesa "abandono descarta". Solo los **aciertos** de un Repaso abandonado se descartan; los fallos quedan registrados (cascada de categoría + entrada en `dailyLog`).
- [x] **SESSION-09**: Una sesión "Test completo" abandonada se puede reanudar al volver a abrir la app (se persiste el cursor y las respuestas hasta ese punto)

### Backup & Persistence (BACK)

- [x] **BACK-01**: Todo el estado de usuario (estado de categorías, contadores de ejercicios, log de actividad diaria, rachas) se persiste en `localStorage` bajo una única clave `italianCourse.v1`
- [x] **BACK-02**: El estado se escribe a localStorage solo al final de una sesión completada (no por respuesta individual)
- [x] **BACK-03**: El estado incluye un campo `schemaVersion` para soportar migraciones futuras
- [x] **BACK-04**: Pantalla "Backup" con botón "Exportar progreso" que descarga el estado actual como archivo JSON (completed Phase 4 — runtime entregado en Plan 04-01 mini-UAT 5/5 PASS + REVALIDADO en Plan 04-04 UAT INTEGRAL UAT-A sobre contenido completo)
- [x] **BACK-05**: Pantalla "Backup" con botón "Importar progreso" que acepta un archivo JSON y reemplaza el estado actual (con confirmación) (completed Phase 4 — runtime entregado en Plan 04-01 mini-UAT 5/5 PASS + REVALIDADO en Plan 04-04 UAT INTEGRAL UAT-B sobre contenido completo)
- [x] **BACK-06**: La home muestra un banner discreto si han pasado más de 7 días desde el último export (recordatorio de backup) (completed Phase 4 — runtime entregado en Plan 04-01 mini-UAT 5/5 PASS + REVALIDADO en Plan 04-04 UAT INTEGRAL UAT-C sobre contenido completo)

### Initial Content (SEED)

- [x] **SEED-01**: Transcribir los 6 PDFs (Avere, Género y Número, Verbos de Movimiento, Profesiones, Sustantivos Irregulares, Preposiciones) a JSONs de ejercicios — al menos 10 ejercicios por categoría como semilla mínima (completed Phase 4 — 6/6 categorías con contenido real: Avere 23 (17 originales Phase 1 + 6 multi-cat 04-04), Preposiciones 50 (04-02), Verbos de movimiento 37 (04-02), Sustantivos Irregulares 31 (04-03 + design-rule patch), Género y Número 40 (04-03), Profesiones 51 (04-03). Total 232 ejercicios. Validado por UAT INTEGRAL UAT-D en Plan 04-04 — las 6 categorías cargan sin error CONT-05, schema validado, NFC.)
- [x] **SEED-02**: Algunos ejercicios semilla son multi-categoría (al menos 1-2 por PDF que toquen categorías relacionadas) para validar la cascada de fallo en uso real (completed Phase 4 — Plan 04-04 añadió 6 cruces multi-cat avere-300..305 cubriendo las 5 nuevas categorías + el avere base: avere-300/301 profesiones, avere-302 sustantivos-irregulares, avere-303 preposiciones, avere-304 genero-numero, avere-305 verbos-movimiento. Validado por UAT INTEGRAL UAT-E en Plan 04-04 — cascada D-54 propaga inmediata sobre las 2+ categorías al fallar un multi-cat, verificable en DevTools localStorage + visible en resumen final.)
- [x] **SEED-03**: Añadir Essere como 7ª categoría dedicada con cobertura A1 mínima — conjugación presente (6 personas + 2 variantes interrogación/negación) + identidad + nacionalidad + profesión (contraste avere) + estado/condición + cópula clasificatoria + participio passato prossimo (`stato/stata/stati/state` con concordancia masc/fem × sing/pl). ≥30 ejercicios base + ≥1 cruce multi-categoría que ejercita la cascada D-54. Completed Phase 5 — Plan 05-01: 39 ejercicios essere (33 base + 6 multi-cat essere-300..305 espejo del patrón avere-300..305) + DESIGN RULE Phase 4 aplicada (35 mc + 4 wb + 0 match) + patrón D-91 distractoras (1 avere + 2 essere mal + 1 correcta) en los 35 multi-choice + smoke test paramétrico extendido a iterar TODOS los archivos de `content/exercises/`. UAT INTEGRAL 6/6 PASS por el autor (UAT-A categories.json shift / UAT-B essere.json validado / UAT-C cobertura 7 sub-áreas / UAT-D DESIGN RULE / UAT-E cascada D-54 fallando essere-302 propaga essere + verbos-movimiento / UAT-F Repaso 20 sin errores UX). 145/145 tests verdes.

### Polish UX post-sesión (UX) — Phase 6

- [x] **UX-01**: Botón "Reiniciar ejercicios" en la pantalla de sesión que rearranca la sesión actual con las MISMAS categorías seleccionadas en 1 clic (vs los 4 actuales: Volver al home → Descartar → Repaso 20 → Empezar). Semántica concreta a clarificar en `/gsd:discuss-phase 6`: alcance (solo Repaso 20 o también Test completo abandonable), confirmación (requestConfirm inline o reset directo), tratamiento de aciertos no-comprometidos de la sesión actual. Invariante: los fallos D-54 ya persistidos NO se deshacen al reiniciar — "el sistema te obliga a no olvidar" se mantiene. Captura UAT Phase 4: el autor comenta "muchas veces, fallas a mitad y tienes que darle a 'Volver al home' luego a 'Descartar' luego a 'Repaso 20' luego seleccionar la sección y luego a 'Empezar', son 4 clicks con 2 pantallas, por 1 solo click que reinicie los ejercicios con los que estas."

- [x] **UX-02**: Sección "Errores cometidos" en la pantalla de resumen final (post-SESSION-07) que muestra, para cada ejercicio fallado durante la sesión, qué respondió el autor + qué era correcto + sobre qué frase (prompt original). Aplica a los 3 tipos (multi-choice / word-buttons / match) — la captura es distinta en cada uno y se decidirá en `/gsd:discuss-phase 6`. Implica extender `sessionResults` con `userAnswer` (hoy solo guarda `correct: boolean`). Layout (lista plana vs agrupada por categoría) y persistencia (in-memory vs localStorage para consulta posterior) a clarificar en discuss. Captura UAT Phase 4: *"al terminar, estaria ver bien una pantalla de 'Resultado' donde veas sobretodo los errores que has cometido, que dijiste y que era sobre que frase, por si quieres al final del todo repasar todos los errores en vez de repasarlos segun vas fallando."*

### Explicaciones pedagógicas (EXPL) — Phase 7

- [x] **EXPL-01**: El schema validator acepta `payload.explanation: string` como campo opcional uniforme en los 3 tipos de ejercicio (multi-choice / word-buttons / match). Si presente, debe ser string no vacío (whitespace puro rechazado). Si ausente, el ejercicio sigue siendo válido (back-compat con 221 ejercicios pre-Phase 7). Cero migración schemaVersion (sigue 4 — explanation es contenido, no state). Completed Phase 7 — Plan 07-01 Task 1: 3 bloques `if (ex.payload.explanation !== undefined)` añadidos a validateMultipleChoicePayload + validateWordButtonsPayload + validateMatchPayload + 12 tests paramétricos (4 sub-cases × 3 tipos).

- [x] **EXPL-02**: Durante una sesión, si un ejercicio fallado tiene `payload.explanation`, el feedback rojo muestra un párrafo italic muted (`<p class="session-explanation">`) bajo la línea "Respuesta correcta:" y antes del botón Siguiente, en los 3 sub-templates (multi-choice / word-buttons / match). Render vía `x-text` exclusivo (T-02-01 anti-XSS preservado). Si el ejercicio no tiene explanation, no se renderiza placeholder (D-121 graceful degradation con doble guard `x-show`). Completed Phase 7 — Plan 07-01 Task 2: 3 bloques `<p>` añadidos en index.html con 2 reglas CSS muted/italic (sin tokens nuevos, reuso `--pico-muted-color`).

- [x] **EXPL-03**: Al final de sesión, la sección "Errores cometidos" del summary muestra la `explanation` (cuando existe) bajo la línea "Respuesta correcta" de cada `<li>` con la misma clase visual `.summary-error-explanation` (italic muted, coherencia cross-context). Lectura desde `content.exerciseById[result.exerciseId]?.payload?.explanation` con optional chaining defensivo (CR-01 Phase 6 ya garantiza el filter de exerciseIds stale, defensa-en-profundidad). Completed Phase 7 — Plan 07-01 Task 2: 3 bloques `<p>` añadidos en los 3 sub-templates de summary-errors (multi-choice / word-buttons / match).

- [x] **EXPL-04**: Las 50 entries de `content/exercises/preposiciones.json` tienen `payload.explanation` curada por Claude + revisada por el autor en 3 batches secuenciales (patrón D-85). Tono D-127 (3ª impersonal + regla + ejemplo paralelo italiano-español), longitud 228-369 chars, apóstrofes ASCII U+0027 (CONT-06 / D-129), plain text sin markdown (T-02-01 / D-126). Smoke test paramétrico (3 sub-tests: coverage 50/50, ASCII apóstrofes, no markdown markers) defiende contra regresiones editoriales futuras. Las otras 6 categorías (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) quedan opcionales para retro-rellenar en fases incrementales futuras si emerge dolor adicional (Phase 7.1, 7.2, ...). Completed Phase 7 — Plan 07-01 (2 seed) + Plan 07-02 batches A/B/C (15+16+17).

- [x] **EXPL-05**: PROJECT.md `## Out of Scope` reabrió la entrada "Explicaciones pedagógicas / mostrar la regla al fallar o acertar — solo bien/mal por velocidad; la teoría está en los PDFs" — movida a `### Validated` con audit trail del pivote post-uso-real (271 ejercicios funcionando + autor consultaba Gemini cada fallo de Preposiciones). Key Decisions tabla extendida con fila nueva (fecha 2026-05-25) documentando la razón del pivote. El loop pedagógico cierra sin romper la velocidad del flow porque explanation solo se muestra al fallar. Completed Phase 7 — Plan 07-02 Task 4.

### Explicaciones Género-Número + canonicalización ortográfica (EXPL-06..08) — Phase 7.1

- [x] **EXPL-06**: Canon ortográfico nuevo: TODAS las explanations del proyecto siguen el español correctamente escrito con acentos (á/é/í/ó/ú) y ñ donde la RAE lo exige. Reemplaza el canon Phase 7 incidental ("español sin acentos") aplicándose retroactivamente a las 50 explanations de Preposiciones (re-acentuadas en Plan 7.1-01 sin alterar contenido pedagógico) y prospectivamente a TODAS las futuras (Phase 7.1+ del proyecto). Italianismos citados literalmente (`città`, `caffè`, `dalla`, `Sono di Roma`, etc.) preservan ortografía italiana — solo el texto explicativo en español sigue el canon RAE. Apóstrofes ASCII U+0027 preservados (CONT-06 / D-129). Validado: Plan 7.1-01 (re-accent 50 Preposiciones diff-reviewed + commit + 3 fixes bonus aprobados — `e`→`è`, `citta`→`città`, `el`→`él`) + Plan 7.1-02 (40 Génnum acentuadas correctamente del draft del autor).

- [x] **EXPL-07**: Las 40 entries de `content/exercises/genero-numero.json` tienen `payload.explanation` ingestada desde un draft pre-redactado y revisado conceptualmente por el autor antes del ingest (D-141 — patrón "1 commit grande honesto" en vez de patrón D-85 Claude-propone-batch porque el draft ya era el resultado del trabajo del autor; re-proponer sería negar ese trabajo). 37 multi-choice + 3 match. Distractoras duras mantained (D-142 — el autor quiere que el alumno demuestre saber TODO, no solo lo fácil). mc-037 (psicologi/psicologhi) honra realidad lingüística moderna además de regla A1 estricta (D-143). Plain text + apóstrofes ASCII verificados por smoke test paramétrico. Completed Phase 7.1 — Plan 7.1-02 Task 1.

- [x] **EXPL-08**: El smoke test que verificaba "Preposiciones 50/50 explanations" hardcoded (Phase 7 EXPL-04) se generalizó a un loop paramétrico sobre `CATEGORIES_WITH_EXPLANATIONS = [{file, expected}]` (D-144). Tras Phase 7.1 el array tiene 2 entries (preposiciones + génnum) — 6 tests paramétricos en total (2 archivos × 3 sub-tests: coverage, ASCII apóstrofes, no markdown markers). Añadir una futura categoría en Phase 7.2..7.6 es 1 línea en el array — cero código nuevo. Patrón reusable para todas las fases incrementales de explanations. Validado: Plan 7.1-01 (instaló bloque paramétrico con 1 entry) + Plan 7.1-02 (añadió 2ª entry y verificó 184/184 tests verdes).

### Explicaciones 5 categorías restantes (EXPL-09..14) — Phase 7.2

- [x] **EXPL-09**: Las 23 entries de `content/exercises/avere.json` tienen `payload.explanation` curada (patrón D-85 Claude propone + autor revisa por batches 2×~12+11; D-177/D-178 APPEND-ONLY preservado via relax assert-avere-prefix-unchanged.mjs). Validado: Plan 7.2-01.

- [x] **EXPL-10**: Las 31 entries de `content/exercises/sustantivos-irregulares.json` tienen `payload.explanation` curada (patrón D-85, 2 batches ~16+15). Patrones excepcionales (uovo/uova, dito/dita, braccio/braccia) explicados con sus reglas concretas. Validado: Plan 7.2-02.

- [x] **EXPL-11**: Las 37 entries de `content/exercises/verbos-movimiento.json` tienen `payload.explanation` curada (patrón D-85, 2 batches ~19+18). Cross-ref D-159 preserved (cero referencias a IDs essere-NNN porque V-mov se planifica antes que Essere). Validado: Plan 7.2-03.

- [x] **EXPL-12**: Las 39 entries de `content/exercises/essere.json` tienen `payload.explanation` curada (patrón D-85, 2 batches ~20+19). Beneficiado de Avere y V-mov ya curados para contraste pedagógico (Essere vs Avere D-91; participio essere como auxiliar V-mov). ≥3 cross-refs útiles materializadas. Validado: Plan 7.2-04.

- [x] **EXPL-13**: Las 51 entries de `content/exercises/profesiones.json` tienen `payload.explanation` curada (patrón D-85, 3 batches ~17+17+17). Cross-refs útiles a Génnum #006/#023..#028 (familias -tore/-trice y -e/-essa). Erratas pedagógicas del PDF documentadas en notes preservadas (farmacista/giornalista invariables, avvocata vs avvocatessa, elisión universal l'avvocato). Validado: Plan 7.2-05 (Task 3 ATÓMICA).

- [x] **EXPL-14**: Smoke test paramétrico extendido a las 7 categorías del proyecto (CATEGORIES_WITH_EXPLANATIONS con 7 entries). Tests count subió de 184 → 199 verdes (delta +15 = 5 categorías × 3 sub-tests). Cobertura editorial 100% — milestone v1.0 ready to ship. Validado: Plan 7.2-05 Task 3 ATÓMICA.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Quality of life (QOL)

- **QOL-01**: Calendar heatmap de actividad diaria
- **QOL-02**: Vista por ejercicio del histórico de aciertos/fallos
- **QOL-03**: Stats agregadas por categoría (% acierto, ejercicios pendientes, días desde última práctica)
- **QOL-04**: Dark mode automático via `prefers-color-scheme`
- **QOL-05**: Multi-tab guard (alerta si se abre la app en otra pestaña simultáneamente)

### Beyond v1 scope (FUTURE)

- **FUTURE-01**: Editor de ejercicios dentro de la web (sin tener que editar JSON a mano)
- **FUTURE-02**: Versión responsive optimizada para móvil
- **FUTURE-03**: Sub-categorías (granularidad más fina dentro de un PDF)
- **FUTURE-04**: Generación asistida con IA a partir de los PDFs (con revisión manual)

## Out of Scope

Explicitly excluded for v1. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Login / multi-usuario | App personal, un solo usuario, complejidad innecesaria |
| Cloud sync / hosting en internet | Todo local; si se necesita móvil, ya se evaluará |
| Hosting móvil-first / acceso desde móvil | Desktop only v1, ver en v2+ |
| SRS algorítmico tipo Anki (intervalos, easiness factor) | El usuario pidió "nada muy sofisticado"; priorización simple por veces realizadas es suficiente |
| Respuesta libre escribiendo texto | Requiere normalización (tildes, sinónimos, mayúsculas) y aporta poco vs los 3 tipos elegidos |
| Explicaciones pedagógicas en aciertos / fallos | Solo feedback bien/mal; la teoría está en los PDFs de la profesora |
| Audio / pronunciación | Fuera de scope; el objetivo es escrito A1/A2 |
| Badges / XP / gamificación adicional | Solo la marca de "dominada" tras 21 días; el resto es ruido |
| Reducir frecuencia o esconder categorías "dominadas" | El usuario explícitamente quiere que sigan apareciendo igual |
| Undo de última respuesta | Suaviza la mecánica de fallo-cascada, contradice el core value |
| Skip de ejercicio | Igual que el anterior — debilita la verificación constante |
| Hints / pistas | Igual — no se contemplan |
| Generación de ejercicios con IA en v1 | El usuario edita JSON a mano; IA queda como exploración futura |
| Editor de ejercicios UI en v1 | JSON a mano es suficiente; UI se reevaluará si el flujo manual escala mal |
| Sub-categorías más finas que "1 PDF = 1 categoría" en v1 | Granularidad gruesa por simplicidad; refactor a sub-categorías si se queda corto |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Fase 1 | In Progress (awaiting verifier) |
| FOUND-02 | Fase 1 | In Progress (awaiting verifier) |
| FOUND-03 | Fase 1 | In Progress (awaiting verifier) |
| FOUND-04 | Fase 1 | In Progress (awaiting verifier) |
| CONT-01 | Fase 1 | In Progress (awaiting verifier) |
| CONT-02 | Fase 1 | In Progress (awaiting verifier) |
| CONT-03 | Fase 1 | In Progress (awaiting verifier) |
| CONT-04 | Fase 1 | In Progress (awaiting verifier) |
| CONT-05 | Fase 1 | In Progress (awaiting verifier) |
| CONT-06 | Fase 1 | In Progress (awaiting verifier) |
| EXTYPE-01 | Fase 1 | In Progress (awaiting verifier) |
| EXTYPE-02 | Fase 3 | Complete |
| EXTYPE-03 | Fase 3 | Complete (Plan 03-02) |
| DOMAIN-01 | Fase 1 | In Progress (awaiting verifier) |
| DOMAIN-02 | Fase 1 | In Progress (awaiting verifier) |
| DOMAIN-03 | Fase 2 | Complete |
| DOMAIN-04 | Fase 2 | Complete |
| DOMAIN-05 | Fase 2 | Complete |
| DOMAIN-06 | Fase 2 | Complete |
| DOMAIN-07 | Fase 2 | Complete |
| DOMAIN-08 | Fase 2 | Complete |
| DOMAIN-09 | Fase 1 | In Progress (awaiting verifier) |
| DOMAIN-10 | Fase 2 | Complete |
| SESSION-01 | Fase 2 | Complete |
| SESSION-02 | Fase 2 | Complete |
| SESSION-03 | Fase 2 | Complete |
| SESSION-04 | Fase 1 | In Progress (awaiting verifier) |
| SESSION-05 | Fase 1 | In Progress (awaiting verifier) |
| SESSION-06 | Fase 3 | Complete |
| SESSION-07 | Fase 2 | Complete |
| SESSION-08 | Fase 2 | Complete |
| SESSION-09 | Fase 2 | Complete |
| BACK-01 | Fase 1 | In Progress (awaiting verifier) |
| BACK-02 | Fase 1 | In Progress (awaiting verifier) |
| BACK-03 | Fase 1 | In Progress (awaiting verifier) |
| BACK-04 | Fase 4 | Complete (Plan 04-01 runtime + Plan 04-04 UAT INTEGRAL UAT-A) |
| BACK-05 | Fase 4 | Complete (Plan 04-01 runtime + Plan 04-04 UAT INTEGRAL UAT-B) |
| BACK-06 | Fase 4 | Complete (Plan 04-01 runtime + Plan 04-04 UAT INTEGRAL UAT-C) |
| SEED-01 | Fase 4 | Complete (6/6 categorías con contenido real — 232 ejercicios totales — validado por Plan 04-04 UAT INTEGRAL UAT-D) |
| SEED-02 | Fase 4 | Complete (Plan 04-04 — 6 cruces avere-300..305 + UAT INTEGRAL UAT-E cascada multi-cat propaga inmediata) |
| SEED-03 | Fase 5 | Complete (Plan 05-01 — 39 ejercicios essere = 33 base + 6 multi-cat essere-300..305 + UAT INTEGRAL 6/6 PASS) |
| UX-01   | Fase 6 | Complete (Plan 06-01 runtime + Plan 06-02 UAT INTEGRAL 5/5 PASS — botón reiniciar ejercicios) |
| UX-02   | Fase 6 | Complete (Plan 06-01 runtime + Plan 06-02 UAT INTEGRAL 6/6 PASS — sección "Errores cometidos" en summary) |
| EXPL-01 | Fase 7 | Complete (Plan 07-01 — schema validator extension, 3 reglas if-explanation-string-no-vacío + 12 tests paramétricos) |
| EXPL-02 | Fase 7 | Complete (Plan 07-01 — 3 sub-templates session render inline `<p class="session-explanation">` durante feedback rojo) |
| EXPL-03 | Fase 7 | Complete (Plan 07-01 — 3 sub-templates summary-errors render `<p class="summary-error-explanation">`) |
| EXPL-04 | Fase 7 | Complete (Plan 07-01 + Plan 07-02 — 50/50 explanations curadas Preposiciones via patrón D-85 + smoke test paramétrico coverage/ASCII/no-markdown) |
| EXPL-05 | Fase 7 | Complete (Plan 07-02 — reapertura PROJECT.md Out of Scope a Validated + Key Decision audit trail del pivote post-uso-real) |
| EXPL-06 | Fase 7.1 | Complete (Plan 7.1-01 — 50 Preposiciones re-acentuadas + 3 fixes bonus aprobados + Plan 7.1-02 — 40 Génnum ingestadas con acentos correctos) |
| EXPL-07 | Fase 7.1 | Complete (Plan 7.1-02 — ingest 40 explanations Género-Número del draft del autor, 1 commit honesto, D-141) |
| EXPL-08 | Fase 7.1 | Complete (Plan 7.1-01 — bloque paramétrico CATEGORIES_WITH_EXPLANATIONS + Plan 7.1-02 — 2ª entry añadida, tests 184/184 verdes) |
| EXPL-09 | Fase 7.2 | Complete (Plan 7.2-01) |
| EXPL-10 | Fase 7.2 | Complete (Plan 7.2-02) |
| EXPL-11 | Fase 7.2 | Complete (Plan 7.2-03) |
| EXPL-12 | Fase 7.2 | Complete (Plan 7.2-04) |
| EXPL-13 | Fase 7.2 | Complete (Plan 7.2-05) |
| EXPL-14 | Fase 7.2 | Complete (Plan 7.2-05 Task 3 ATÓMICA) |

**Coverage:**
- v1 requirements: **57** total (51 post-Phase 7.1 + 6 EXPL-09..14 Phase 7.2)
- Mapped to phases: 57 (100%)
- Unmapped: 0
- **Completed: 57/57 (100%)** tras Phase 7.2 cierre. Milestone v1.0 pre-ship listo (cobertura editorial 100%: 271/271 ejercicios con explanation curada en las 7 categorías). Patrón paramétrico instalado, audit trail completo.

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-25 after Phase 7.2 completion (EXPL-09..14 cerrados — 181 explanations en las 5 categorías restantes + smoke paramétrico 7 categorías). 57/57 v1 requirements complete; milestone v1.0 ampliado con cobertura 100% editorial — 271/271 ejercicios con explanation curada. Milestone v1.0 pre-ship listo.*
