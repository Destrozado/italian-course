# Roadmap: Italian Course — Ejercicios A1/A2

**Created:** 2026-05-23
**Granularity:** coarse (3-5 fases, 1-3 planes cada una)
**Mode:** MVP — vertical slices, cada fase entrega una capacidad usable end-to-end
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Phases

- [x] **Phase 1: Loop mínimo end-to-end** — La app arranca, carga JSON validado y permite hacer una sesión real de multiple-choice sobre Avere con persistencia básica (completed 2026-05-23)
- [x] **Phase 2: Mecánica completa de re-verificación** — Estados, cascada de fallo, racha, dashboard y resumen — el motor que "te obliga a no olvidar" está operativo (completed 2026-05-23)
- [x] **Phase 3: Variedad de ejercicios + ergonomía de teclado** — word-buttons y match completan los tres tipos; atajos 1-4/Enter/Space hacen la práctica diaria fluida (completed 2026-05-24)
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
- [ ] 04-02-PLAN.md — Categories.json a 6 entradas + Preposiciones (multi-choice) + Verbos de movimiento (multi-choice + word-buttons). Cada categoría es un commit tras revisión humana D-85.
- [ ] 04-03-PLAN.md — Sustantivos Irregulares (match) + Género y Número (match + multi-choice) + Profesiones (mezcla 3 tipos). Cada categoría es un commit tras revisión humana D-85.
- [ ] 04-04-PLAN.md — avere.json multi-cat extension (≥6 cruces) + smoke test cascada multi-cat real + UAT integral de los 5 criterios ROADMAP.
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Loop mínimo end-to-end | 2/2 | Complete    | 2026-05-23 |
| 2. Mecánica completa de re-verificación | 4/4 | Complete   | 2026-05-23 |
| 3. Variedad de ejercicios + ergonomía | 3/3 | Complete    | 2026-05-24 |
| 4. Backup robusto + contenido completo | 1/4 | In progress | - |

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
*Last updated: 2026-05-24 after Plan 04-01 completion (128/128 tests verdes, 2 commits + mini-UAT humano 5/5 PASS, BACK-04/-05/-06 cerrados; Phase 4 1/4 in progress)*
