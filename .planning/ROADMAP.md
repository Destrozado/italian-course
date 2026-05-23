# Roadmap: Italian Course — Ejercicios A1/A2

**Created:** 2026-05-23
**Granularity:** coarse (3-5 fases, 1-3 planes cada una)
**Mode:** MVP — vertical slices, cada fase entrega una capacidad usable end-to-end
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Phases

- [ ] **Phase 1: Loop mínimo end-to-end** — La app arranca, carga JSON validado y permite hacer una sesión real de multiple-choice sobre Avere con persistencia básica
- [ ] **Phase 2: Mecánica completa de re-verificación** — Estados, cascada de fallo, racha, dashboard y resumen — el motor que "te obliga a no olvidar" está operativo
- [ ] **Phase 3: Variedad de ejercicios + ergonomía de teclado** — word-buttons y match completan los tres tipos; atajos 1-4/Enter/Space hacen la práctica diaria fluida
- [ ] **Phase 4: Backup robusto + contenido completo** — Export/import + recordatorio de backup + los 6 PDFs transcritos a JSON (incluyendo ejercicios multi-categoría para ejercitar la cascada en uso real)

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
**Plans**: TBD

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
**Plans**: TBD
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
**Plans**: TBD
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
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Loop mínimo end-to-end | 0/? | Not started | - |
| 2. Mecánica completa de re-verificación | 0/? | Not started | - |
| 3. Variedad de ejercicios + ergonomía | 0/? | Not started | - |
| 4. Backup robusto + contenido completo | 0/? | Not started | - |

## Coverage Summary

- **v1 requirements:** 40 total
- **Mapped to phases:** 40 (100%)
- **Unmapped:** 0
- **Granularity:** coarse (4 fases)
- **Mode:** MVP (vertical slices)

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
```

Cada fase entrega valor usable independientemente:
- Después de Phase 1: el autor valida que el loop funciona con multiple-choice de Avere (contenido de scratch)
- Después de Phase 2: el motor "te obliga a no olvidar" está completo y observable
- Después de Phase 3: la app es funcionalmente completa para uso diario
- Después de Phase 4: la app es daily-driver con los 6 PDFs reales y backup seguro

---
*Roadmap created: 2026-05-23*
*Last updated: 2026-05-23 after initialization*
