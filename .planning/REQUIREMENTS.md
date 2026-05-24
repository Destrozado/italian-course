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
| UX-01   | Fase 6 | Not started (botón reiniciar ejercicios) |
| UX-02   | Fase 6 | Not started (pantalla "Resultado" con review de errores cometidos) |

**Coverage:**
- v1 requirements: 43 total (40 originales + SEED-03 Phase 5 + UX-01/UX-02 Phase 6)
- Mapped to phases: 43 (100%)
- Unmapped: 0
- **Completed: 41/43 (95%)** tras Phase 5 cierre. Falta Phase 6 (UX-01 + UX-02 — polish UX post-sesión absorbiendo backlog 999.1+999.2).

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-24 after Phase 5 completion + Phase 6 promote (UX-01 + UX-02 absorbidos del backlog 999.1 + 999.2). 41/43 v1 requirements complete; 2 pendientes (UX-01 + UX-02) en Phase 6 para cerrar milestone v1.0 con polish UX completo.*
