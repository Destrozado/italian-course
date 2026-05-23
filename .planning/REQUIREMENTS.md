# Requirements: Italian Course — Ejercicios A1/A2

**Defined:** 2026-05-23
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## v1 Requirements

### Foundation (FOUND)

- [ ] **FOUND-01**: La app arranca con `npx serve` apuntando a la carpeta del proyecto (o equivalente local) y se accede via `http://localhost:3000`
- [ ] **FOUND-02**: Stack: HTML + CSS + JS vanilla con Alpine.js (CDN, versión pinned) y Pico CSS (CDN, versión pinned); cero build step
- [ ] **FOUND-03**: La app es responsive a nivel básico (no rota en desktop pequeño), pero el target primario es desktop
- [ ] **FOUND-04**: Idioma de UI: español (textos hardcoded en v1, sin sistema i18n)

### Content & Schema (CONT)

- [ ] **CONT-01**: El contenido (ejercicios) vive en archivos JSON dentro de `content/exercises/`, un archivo por categoría (`avere.json`, `genero-numero.json`, etc.)
- [ ] **CONT-02**: Existe `content/categories.json` como registro maestro de categorías (id slug ASCII, nombre humano, orden de carga)
- [ ] **CONT-03**: Cada ejercicio en JSON tiene: `id` único, `type` (`multiple-choice` | `word-buttons` | `match`), `categoryIds` (array de 1..N ids), `payload` (estructura según tipo), opcionalmente `notes`
- [ ] **CONT-04**: Existe un schema validator que se ejecuta al cargar y rechaza JSON malformado o referencias a `categoryId` desconocidas
- [ ] **CONT-05**: Si falla la carga/validación, la UI muestra un banner de error visible (no silencioso en consola) con el nombre del archivo y el problema
- [ ] **CONT-06**: Las strings se normalizan a NFC al cargarse (para evitar problemas con acentos copiados desde PDFs)

### Exercise Types (EXTYPE)

- [ ] **EXTYPE-01**: Tipo `multiple-choice`: muestra una frase con un hueco y 3-4 botones de opción; el usuario pulsa una; valida acertado/fallado
- [ ] **EXTYPE-02**: Tipo `word-buttons`: muestra una frase en español a traducir; presenta botones con palabras italianas (más algunas distractoras); el usuario las pulsa en orden para construir la traducción; valida cuando el usuario marca terminado
- [ ] **EXTYPE-03**: Tipo `match`: muestra dos columnas (ej. sustantivos ↔ artículos); el usuario hace click en un ítem de la izquierda y luego en su pareja a la derecha; valida cuando todos están emparejados

### Domain Core (DOMAIN)

- [ ] **DOMAIN-01**: Función pura `dates.todayLocal()` devuelve la fecha local en formato `YYYY-MM-DD` usando reloj local (no UTC)
- [ ] **DOMAIN-02**: Función pura `session.buildSession(categories, exercises, state, size, mode)` que genera una sesión: garantiza min 1 ejercicio por categoría elegida (set-cover greedy), rellena hasta `size` con muestreo aleatorio ponderado por `weight = 1/(1+min(timesShown, 10))`
- [ ] **DOMAIN-03**: Función pura `session.buildFullTest(categories, exercises)` devuelve TODOS los ejercicios que tocan al menos una categoría elegida (sin tope)
- [ ] **DOMAIN-04**: Función pura `progress.applySessionResult(state, sessionResults)` aplica los efectos al final de sesión: actualiza contadores por ejercicio, aplica cascada de fallo (todas las categorías de un ejercicio fallado pasan a `no-hecha`, racha a 0, vacía `clearedExerciseIds`), promociona a `hecha` cuando `clearedExerciseIds` cubre todos los ejercicios de la categoría
- [ ] **DOMAIN-05**: Estados de categoría: `no-hecha` → `hecha` → `dominada` (con 21 días de racha consecutivos)
- [ ] **DOMAIN-06**: Una categoría `hecha` o `dominada` vuelve a `no-hecha` automáticamente si se añade un ejercicio nuevo al JSON que no está en su `clearedExerciseIds`
- [ ] **DOMAIN-07**: La racha por categoría se incrementa solo cuando, en una sesión completada, esa categoría fue practicada y no tuvo ningún fallo, Y `lastSuccessDate !== todayLocal()` (sólo cuenta una vez por día)
- [ ] **DOMAIN-08**: Al alcanzar 21 días consecutivos de racha sin fallar, la categoría pasa a `dominada` (visible) pero sigue apareciendo en sesiones igual que el resto
- [ ] **DOMAIN-09**: Contadores por ejercicio (`timesShown`, `timesCorrect`, `timesFailed`) son monotónicos crecientes — nunca se resetean, ni siquiera cuando la categoría se desmarca
- [ ] **DOMAIN-10**: La lógica de dominio tiene tests unitarios (smoke tests) que simulan 30+ días de actividad cubriendo: cascada de fallo en ejercicios multi-categoría, racha contando una vez por día, promoción `no-hecha → hecha → dominada`, regresión `dominada → no-hecha`, sampler con categorías de 1-2 ejercicios, oversubscription, weight cap

### Session UI (SESSION)

- [ ] **SESSION-01**: Pantalla home muestra todas las categorías con: nombre, estado (`no-hecha` / `hecha` / `dominada` con marca visual distinta), días de racha actuales, total de ejercicios, última fecha practicada
- [ ] **SESSION-02**: Botón "Repaso de 20" abre una pantalla de selección de categorías con checkboxes (con select-all / clear-all)
- [ ] **SESSION-03**: Botón "Test completo" abre la misma pantalla de selección de categorías; al lanzar muestra advertencia con el número total de ejercicios incluidos
- [ ] **SESSION-04**: Durante la sesión, muestra indicador de progreso (ej. "Ejercicio 7 / 20" o "Ejercicio 7 / 152" para test completo)
- [ ] **SESSION-05**: Feedback binario: al acertar, el ejercicio se marca en verde y auto-avanza tras ~600ms; al fallar, se marca en rojo y muestra la respuesta correcta + botón "Siguiente" (no auto-avance)
- [ ] **SESSION-06**: Atajos de teclado: 1-4 para multiple-choice, Enter para confirmar/avanzar tras fallo, Space como alias de Enter
- [ ] **SESSION-07**: Al final de la sesión, pantalla de resumen (no toast) que muestra: ejercicios acertados/fallados, y por cada categoría tocada: estado antes → después, racha antes → después, ejercicios que faltan para `hecha`
- [ ] **SESSION-08**: Una sesión Repaso abandonada (cierre de pestaña / navegación atrás antes de terminar) **se descarta** completamente — los aciertos/fallos no afectan al estado ni a los contadores
- [ ] **SESSION-09**: Una sesión "Test completo" abandonada se puede reanudar al volver a abrir la app (se persiste el cursor y las respuestas hasta ese punto)

### Backup & Persistence (BACK)

- [ ] **BACK-01**: Todo el estado de usuario (estado de categorías, contadores de ejercicios, log de actividad diaria, rachas) se persiste en `localStorage` bajo una única clave `italianCourse.v1`
- [ ] **BACK-02**: El estado se escribe a localStorage solo al final de una sesión completada (no por respuesta individual)
- [ ] **BACK-03**: El estado incluye un campo `schemaVersion` para soportar migraciones futuras
- [ ] **BACK-04**: Pantalla "Backup" con botón "Exportar progreso" que descarga el estado actual como archivo JSON
- [ ] **BACK-05**: Pantalla "Backup" con botón "Importar progreso" que acepta un archivo JSON y reemplaza el estado actual (con confirmación)
- [ ] **BACK-06**: La home muestra un banner discreto si han pasado más de 7 días desde el último export (recordatorio de backup)

### Initial Content (SEED)

- [ ] **SEED-01**: Transcribir los 6 PDFs (Avere, Género y Número, Verbos de Movimiento, Profesiones, Sustantivos Irregulares, Preposiciones) a JSONs de ejercicios — al menos 10 ejercicios por categoría como semilla mínima
- [ ] **SEED-02**: Algunos ejercicios semilla son multi-categoría (al menos 1-2 por PDF que toquen categorías relacionadas) para validar la cascada de fallo en uso real

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

(Empty — populated by gsd-roadmapper)

| Requirement | Phase | Status |
|-------------|-------|--------|

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: 0
- Unmapped: 40 ⚠️ (pending roadmap)

---
*Requirements defined: 2026-05-23*
*Last updated: 2026-05-23 after initialization*
