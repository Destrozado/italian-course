---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
last_updated: "2026-05-24T13:30:00.000Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 13
  completed_plans: 12
  percent: 92
---

# Project State: Italian Course — Ejercicios A1/A2

## Project Reference

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

**Current Focus:** Phase 4 — Backup robusto + contenido completo

## Current Position

Phase: 4 (Backup robusto + contenido completo) — EXECUTING
Plan: 4 of 4 — Plan 04-03 **COMPLETED** (2026-05-24, ver [04-03-SUMMARY.md](./phases/04-backup-robusto-contenido-completo/04-03-SUMMARY.md))
Next: Plan 04-04 (avere.json multi-cat extension SEED-02 + smoke test cascada multi-cat real + UAT integral 5 criterios ROADMAP)

- **Phase:** 4
- **Plan:** 04-01 + 04-02 + 04-03 completed; 04-04 pending
- **Status:** Executing Phase 4
- **Progress:** [██████████████░] 92% (12/13 planes — 3 de 4 fases completadas + 3/4 planes de Phase 4)

## Performance Metrics

| Métrica | Valor |
|---------|-------|
| Fases completadas | 3/4 |
| Requisitos v1 completos | 36/40 (90% — Phase 1: 19 + Phase 2: 13 + Phase 3: 1 EXTYPE-03 + Phase 4 04-01: 3 BACK-04/-05/-06) — SEED-01 sigue In Progress 6/6 categorías con contenido real tras 04-03 (cierre formal pendiente UAT integral en 04-04); SEED-02 pending hasta 04-04 |
| Requisitos v1 mapeados | 40/40 (100%) |
| Tests dominio + UI smoke | 128 verdes (105 baseline + 23 nuevos en Phase 4 Task 1; sin cambios de tests en 04-02 ni 04-03 — solo contenido) |
| Granularidad | coarse |
| Mode | MVP (vertical slices) |
| Ejercicios totales en la app | ~221 (12 avere + 50 preposiciones + 37 verbos-movimiento + 31 sustantivos-irregulares + 40 genero-numero + 51 profesiones — tras 04-03 las 6 categorías tienen contenido real) |

## Accumulated Context

### Key Decisions

| Fecha | Decisión | Razón |
|-------|----------|-------|
| 2026-05-23 | Stack Alpine.js 3.15 + Pico CSS 2.1 + vanilla ES modules + localStorage | Cero build step, "doble click y funciona" (vía `npx serve`), todo en CDN con versiones pinned |
| 2026-05-23 | `npx serve` en vez de `file://` doble click puro | Firefox bloquea localStorage bajo `file://`, fetch de JSON local bloqueado en todos los navegadores |
| 2026-05-23 | Fallar resetea racha a 0 (estricto) | Fiel al espíritu "que te obligue a no olvidar" |
| 2026-05-23 | Añadir ejercicio nuevo a categoría `hecha` la devuelve a `no-hecha` | Coherente con la definición de `hecha` = "todos los ejercicios completados sin fallar" |
| 2026-05-23 | Test completo es reanudable; Repaso abandonado se descarta | Test completo es inversión grande; Repaso es desechable |
| 2026-05-23 | Weight cap = 10 en sampler ponderado: `1/(1+min(timesShown,10))` | Evita que ejercicios nuevos (timesShown=0) monopolicen el muestreo durante semanas |
| 2026-05-23 | Contadores por ejercicio son monotónicos — nunca se resetean | La historia es valiosa; lo que se resetea es `clearedExerciseIds` por categoría |
| 2026-05-23 | Roadmap COARSE = 4 fases vertical-slice | El autor priorizó simplicidad; 4 fases entregan valor observable cada una |
| 2026-05-23 | Layer-purity contract materializado en código (Plan 01-01) | `src/domain/*` y `src/data/schema-validator.js` no importan storage/fetch/DOM; testables con node --test sin browser |
| 2026-05-23 | Plan 01 `buildSession` es FILL-only (sin set-cover) | RESEARCH.md A5 — Phase 1 solo tiene 1 categoría, set-cover es no-op; Phase 2 añade la fase guarantee |
| 2026-05-23 | Plan 01 `applySessionResult` reducido — solo actualiza exerciseStats | Cascada y estados de categoría llegan en Phase 2; contadores monotónicos garantizados |
| 2026-05-23 | README invoca `node --test tests/*.test.js` (glob) en vez de `tests/` | Node 22.20 trata `tests/` como módulo y falla; el glob es portable entre versiones |
| 2026-05-23 | Avere seed = 12 ejercicios (top del rango 10-12) | Maximiza material disponible para el sampler; 6 presente indicativo + 2 idiomáticos + 4 passato prossimo del PDF |
| 2026-05-23 | Alpine init pattern: script-ordering (main.js antes que Alpine en `<head>`) + sync top-level `alpine:init` listener + factory acepta Promise<{content,state}> | Plan 02 descubrió en UAT que el patrón dual (`alpine:init` + `window.Alpine` guard) de `01-RESEARCH.md` Pattern 8 NO funciona cuando la registración ocurre después de `await loadContent`. El nuevo patrón es determinista (HTML script ordering spec) y desacopla el ciclo Alpine del fetch async vía Promise handoff |
| 2026-05-23 | `applySessionResult` solo escribe localStorage al final de sesión (no por respuesta) | D-20 materializada — verificado en UAT 4: la key `italianCourse.v1` no aparece hasta que se completa la última respuesta |
| 2026-05-23 | Plan 03-01 — Dispatch table `PAYLOAD_VALIDATORS` cerrada para los 3 tipos Phase 3 | Reemplaza el branch literal `ex.type !== 'multiple-choice'` por lookup; añadir un tipo nuevo se reduce a 1 línea + función validator. Stub match dentro de la tabla (no fuera) mantiene la promesa "dispatch table cerrada" |
| 2026-05-23 | Plan 03-01 — `applyResultToSession` como SINGLE call-site de `applyImmediateFailure` | Cascada D-54 inmediata se ejecuta desde un único punto del código (Pitfall #2 evitado arquitectónicamente, no por revisión manual). Plan 03-02 añadirá `matchPickRight` reusando el helper sin riesgo de duplicación |
| 2026-05-23 | Plan 03-01 — Stub mensaje validator estable sin plan ID (B3) | `'type "match" aún no soportado'` sin "en este plan" ni "03-02"; el mensaje es válido para producción aunque el plan se renombre. Lección: comentarios docs también cuentan como código — los grep ACs sobre código de producción son literales incluyendo comentarios |
| 2026-05-23 | Plan 03-01 — `fisherYates` exportable público desde `src/domain/session.js` | Un único algoritmo de shuffle determinista reusable por `buildSession`, `buildFullTest`, y `initSubStateForExercise` (banco word-buttons). Layer purity preservada — screen importa de domain, no al revés |
| 2026-05-23 | Plan 03-01 — `@keydown.window` dentro de outer `x-if="currentScreen === 'session'"` | Cleanup automático al desmontar (D-72 confirmado; A1 Assumptions Log no requirió fallback a addEventListener manual). Pattern reusable por 03-02 sin re-evaluar |
| 2026-05-23 | Plan 03-01 — Sub-estados de TODOS los tipos declarados desde el primer plan que los toca | Match sub-estados (matchLeft, matchRight, matchPairsConsumed, etc.) declarados en el factory en 03-01 aunque la lógica llega en 03-02 — permite limpieza universal en `initSubStateForExercise` sin tener que volver a tocar el factory |
| 2026-05-23 | Plan 03-02 — `applyImmediateFailure` tiene 2 call-sites EXACTOS (no 1) | El primero en `applyResultToSession` (decisión final, 3 tipos); el segundo directo en `matchPickRight` con guard `if (!this.matchHadFailure)` (D-61 primer fallo match, antes de que el ejercicio termine). Test W3 cuenta los call-sites para detectar regresiones arquitectónicas (3 = copy-paste mal hecho, 1 = refactor que centralizó incorrectamente) |
| 2026-05-23 | Plan 03-02 — Retorno enriquecido `{correct, pairIdx?}` de `match.grade()` justificado funcionalmente | Asimetría con multi-choice/word-buttons (booleano) NO es inconsistencia del registry — es necesidad D-66 (caller necesita el `pairIdx` consumido para marcar el pair). El JSDoc en `match.js` lo explicita; `index.js` también referencia la asimetría |
| 2026-05-23 | Plan 03-02 — `test.skip` condicional con detección runtime (matchPickRightExists) | Patrón reusable cuando un test añadido en Task N verifica código que llega en Task N+1. La función predicate desactiva el skip automáticamente al landed Task N+1 sin editar el archivo de tests. Auditable: el commit de Task N tiene exit 0 con skipped explicado; el commit de Task N+1 activa los tests sin cambiar tests |
| 2026-05-23 | Plan 03-02 — Forced last pair: NO auto-completar (UI-SPEC normativo) | Coherencia mecánica: todas las parejas siguen el mismo flujo, incluso la última. Implementación verificada por inspección: `applyResultToSession` se invoca SOLO cuando `matchPairsConsumed.length === pairs.length` (el último click es manual) |
| 2026-05-24 | Plan 04-01 — Schema v3 transparente con `lastBackupAt: null` + `firstUsedAt: null` añadidos via `migrate2to3` idempotente (D-77/D-78) | El motor de backup necesita dos timestamps separados: el del último export (banner trigger) y el del "primer state real" (fallback cuando nunca se exportó). `null` significa "aún no aplicable" en ambos; tipado defensivo permite re-runs sin destruir valores existentes |
| 2026-05-24 | Plan 04-01 — `daysSinceISO` puro DST-safe via local-noon anchor (D-79) | Comparar días locales completos entre dos fechas resiste DST (transiciones 23h/25h) porque el anchor 12:00 local hace que la diferencia siempre quede dentro de ~22-26h, redondeable a entero exacto. Puede devolver negativo (fecha futura) — `shouldShowBackupBanner` lo trata como "no mostrar" (T-04-04 + Pitfall #5) |
| 2026-05-24 | Plan 04-01 — Helper `setFirstUsedAtIfMissing` RECHAZADO; inline guard en 4 call-sites (B-5 checker fix) | Un helper requeriría que el caller invoque `this.setFirstUsedAtIfMissing()` ANTES de construir `newState`, cambiando el orden existente. Inline guard `?? new Date().toISOString()` con comentario `// Phase 4 D-78` en cada call-site mantiene auto-contención + rastreabilidad por grep + zero riesgo de regresión por olvido |
| 2026-05-24 | Plan 04-01 — `requestConfirm` 5ª call-site sin tocar el helper; `onCancel` no soportado documentado inline | Pre-Phase-4 había 4 call-sites (D-27 + D-43 + 2 × D-44). El nuevo (D-76 onFileSelected) usa el mismo shape `{message, confirmLabel, cancelLabel, onConfirm}`. Limitación aceptada: `backupPendingImport` queda cargado pero inerte al cancelar; se sobreescribe en el próximo import. Extender el helper sería over-engineering para 1 nuevo caller |
| 2026-05-24 | Plan 04-01 — Reactividad Alpine sobre spread immutable `this.state = { ...this.state, lastBackupAt: ... }` | Tras el export, el banner home desaparece sin recargar porque la referencia `this.state` cambió (Alpine NO observaría `this.state.lastBackupAt = ...` directo). Patrón consolidado desde Phase 2 D-54. Verificado en mini-UAT-2 |
| 2026-05-24 | Plan 04-01 — Mini-UAT (Task 3 checkpoint:human-verify) ANTES de aterrizar contenido (B-3 protección MVP slice property) | Si hubiera un bug en banner, reactividad, orden DOM del 3er botón, o flujo confirm→commitImport, lo capturamos ANTES de transcribir 5 PDFs encima. UAT 5/5 PASS confirma que el size de Task 2 (W-1 ~292 líneas en app.js) no introdujo regresiones |
| 2026-05-24 | Plan 04-02 — Cobertura PDF máxima por defecto (autor directiva durante Task 2) | Cuando el PDF tiene tabla exhaustiva (e.g., cuadro articolate 6×5), transcribir las N celdas + casos particulares en lugar de seleccionar 10-15 representativos. Aplicado: Preposiciones expandida de 15 → 50 ejercicios cubriendo 30/30 celdas del cuadro + 8 simples + 10 casos particulares + 2 excepciones fuera-de-PDF aprobadas (#049 fra eufónico, #050 con instrumental). Aplicado retroactivamente a Verbos de movimiento (37 ejercicios cubriendo 11 verbos × 7 personas + concordancia + §5 + excepciones §4) |
| 2026-05-24 | Plan 04-02 — Reinterpretación documentada de typos del PDF | El PDF de Verbos de movimiento §5 nº4 muestra `Io (uovo)` (semánticamente inválido — uovo = huevo). Reinterpretado a `Io (donna)` con nota explícita en el campo `notes` del ejercicio. Audit trail preservado dentro del JSON mismo para que un planner futuro re-leyendo el PDF entienda el diff |
| 2026-05-24 | Plan 04-02 — Patch B-1 (aebae24) ocurrió post-Task-1 antes de Task 2 (Rule 3 blocking) | Task 1 commit cc7481a olvidó crear placeholder verbos-movimiento.json (4 de 5 archivos del bloque OBLIGATORIO B-1). Resuelto con commit dedicado fix(04-02) aebae24 en lugar de --amend (preserva audit trail del olvido). Plan original enumeraba los 5 placeholders, no scope creep |
| 2026-05-24 | Plan 04-02 — IDs word-buttons range 035-037 (no 100-199) en verbos-movimiento.json | Plan línea 313 sugería range 100-199 para word-buttons (convención avere.json). Sin 3 word-buttons aislados rodeados de 34 multi-choice, mantener un gap 035 → 100 hace el archivo más difícil de leer manualmente. Layout aprobado por el autor en checkpoint Task 3. La convención avere.json era soft pattern, no schema requirement |
| 2026-05-24 | Plan 04-02 — correctIndex skew aceptable cuando hay justificación pedagógica | En verbos-movimiento 24/34 multi-choice tienen correctIndex en posición 1 — justificado por refuerzo del patrón essere-with-movement (essere conjugado casi siempre en posición 1 cuando los distractoras son avere/altri verbi). El criterio RESEARCH §E `≥3 valores distintos` cumplido (4 valores: 0, 1, 2, 3) |
| 2026-05-24 | Plan 04-03 — DESIGN RULE NEW 'match-if-not-trivial-by-root' anclada como patrón normativo desde este plan | Capturada durante UAT humano de Task 1 (Sustantivos Irregulares): los match para invariables (`città↔città`, `caffè↔caffè`) son pedagógicamente vacíos porque izq y der son idénticas — el alumno solo arrastra mecánicamente. Regla: match SOLO si el pareo izq-der requiere conocer una regla NO derivable trivialmente desde la raíz (singular↔plural irregular, profesión↔lugar/herramienta/acción). Si raíz revela la respuesta, convertir a multi-choice con distractoras plausibles. Aplicada retro a sustantivos-irregulares vía patch 9d21c88; aplicada por defecto a 04-03 Tasks 2 y 3. Normativa para 04-04+ contenido futuro |
| 2026-05-24 | Plan 04-03 — Errata pedagógica del PDF documentada inline (farmacista/giornalista invariables) | El PDF Professioni §1 lista farmacista/giornalista en la tabla regular -o→-a, pero el italiano real las hace invariables por la regla productiva -ista (paralelo a dentista/pianista/tassista). Mantenidas como invariables con nota explícita en `notes` que documenta la 'errata pedagógica' del PDF. Audit trail preservado dentro del JSON. Mismo principio que 04-02 (typo `Io (uovo)` → `Io (donna)`) |
| 2026-05-24 | Plan 04-03 — avvocata vs avvocatessa: avvocata respuesta correcta + nota lingüística | El PDF lista `avvocata` (PDF compliance + italiano contemporáneo neutro). En italiano moderno ambas formas son aceptables — `avvocatessa` es la tradicional con sufijo -essa (familia dottoressa/professoressa). Para coherencia con el resto de ejercicios PDF §1 (todas -o→-a sin -essa), el ejercicio fija `avvocata` como respuesta correcta y mantiene `avvocatessa` como distractora pedagógica fuerte. Documentado en notes del ejercicio profesiones-003 |
| 2026-05-24 | Plan 04-03 — Schema-compliance escape hatch para meta-rule mc prompts | El validator exige `___` en multi-choice (Phase 1 CONT-04). Cuando el prompt natural no lo tiene (ej. '¿Cuál es invariable?'), reformular con hueco preservando pedagogía: 'De estas cuatro profesiones, ___ es la única INVARIABLE...'. Documentar en `notes` con referencia al schema validator. Patrón reusable para futuros ejercicios meta-pedagógicos sin pedir flexión morfológica |
| 2026-05-24 | Plan 04-03 — Task 3 6 ediciones autor-aprobadas materializadas atómicamente en 1 commit | El autor respondió 6 preguntas pedagógicas durante checkpoint Task 3: (1) avvocata + nota, (2) farmacista/giornalista invariables + nota errata PDF, (3) elisión universal l'avvocato, (4) 5 word-buttons frases A1 essere×persona, (5) meta-rule -ista invariable, (6) 3rd match profesión↔acción. Todas DENTRO del scope del plan (D-86 tipo natural + cobertura PDF). Materializadas en commit 5436cfc atómico sin sub-commits — el checkpoint humano es el natural decision-point, no requiere multiple commits intermedios |
| 2026-05-24 | Plan 04-03 — 3rd match profesión↔acción (profesiones-202) ejercita reconocimiento del infinitivo italiano | 5 pares: insegnante↔insegnare, pittore↔dipingere, cantante↔cantare, traduttore↔tradurre, direttore↔dirigere. Aunque algunos pares comparten raíz (insegnante/insegnare), el infinitivo italiano requiere conocer la familia verbal correcta (-are/-ere/-ire) — no derivable trivialmente desde el sustantivo. El par paradigmático `pittore↔dipingere` es design-rule-válido inequívoco (no comparten raíz). 5 profesiones del PDF cubiertas: cantante §3, pittore §5, traduttore §5 mini-esercizio, direttore §3, insegnante §4 |

### Active Todos

- [x] Ejecutar `/gsd:plan-phase 1` para descomponer Fase 1 en planes ejecutables (hecho previo)
- [x] Ejecutar Plan 01-01 — esqueleto del proyecto + dominio + seed Avere
- [x] Ejecutar Plan 01-02 — Pantalla de sesión Alpine + persistencia end-to-end — UAT 8/8 aprobado
- [x] Ejecutar Plan 03-01 — word-buttons end-to-end + atajos teclado mínimos + helpers compartidos
- [x] Ejecutar Plan 03-02 — match end-to-end (reemplaza stub validator, añade matchPickRight + flashMatchPair, rama match en handleSessionKey/initSubStateForExercise) — 105/105 tests verdes, 2 commits
- [x] Ejecutar Plan 03-03 — UAT checkpoint (4 criterios ROADMAP + 8 pitfalls + 2 exploit-proof + W2 regression smoke Phase 2)
- [x] Ejecutar Plan 04-01 — Backup runtime end-to-end (migrate2to3 + daysSinceISO + backup.js puro + pantalla Backup + banner home + 3er botón + firstUsedAt plumbing) — 128/128 tests verdes, 2 commits + mini-UAT humano 5/5 PASS
- [x] Ejecutar Plan 04-02 — Categories.json 6 entradas + Preposiciones (50 multi-choice) + Verbos de movimiento (34 multi-choice + 3 word-buttons) + helper validate-content-fixture.mjs + 3 placeholders B-1 — 128/128 tests verdes, 4 commits (Task 1 cc7481a, B-1 patch aebae24, Task 2 74a5d42, Task 3 8094ef0)
- [x] Ejecutar Plan 04-03 — Sustantivos Irregulares (31 mezcla post-design-rule) + Género y Número (40 mezcla) + Profesiones (51 mezcla rica 3 tipos) + DESIGN RULE 'match-if-not-trivial-by-root' anclada + retro-patch — 128/128 tests verdes, 4 commits (Task 1 11974e5, design-rule patch 9d21c88, Task 2 0f2fd8f, Task 3 5436cfc)
- [ ] Ejecutar Plan 04-04 — avere.json multi-cat extension SEED-02 + smoke test cascada multi-cat real + UAT integral 5 criterios ROADMAP de Phase 4

### Blockers

(Ninguno)

### Decisions Pending

- ~~Distribución final del contenido: JSON via fetch o ES module exports~~ — **Resuelto en Plan 01-01:** JSON via `fetch()` con `npx serve` (decisión D-21 del CONTEXT.md materializada).

## Session Continuity

### Last Session

- **Fecha:** 2026-05-24 (Plan 04-03 completed — 122 ejercicios nuevos transcritos del PDF + DESIGN RULE 'match-if-not-trivial-by-root' anclada + retro-patch + 6 ediciones autor-aprobadas en Task 3)
- **Trabajo actual (Plan 04-03):** ejecución en 4 commits — Task 1 inicial 11974e5 (sustantivos-irregulares.json 22 ejercicios — cobertura PDF completa familia/cuerpo/casos especiales + 5 invariables), Task 1 design-rule patch 9d21c88 (refactor: 5 match trivial-por-raíz `città↔città`/`caffè↔caffè`/etc. convertidos a multi-choice con distractoras plausibles tras UAT humano detectó el patrón pedagógicamente vacío — DESIGN RULE NEW capturada como normativa), Task 2 0f2fd8f (genero-numero.json 40 ejercicios — cobertura PDF completa artículos definidos il/lo/la/l'/i/gli/le + sustantivo↔artículo match + reglas excepción multi-choice + D-66 duplicados intencionales), Task 3 5436cfc (profesiones.json 51 ejercicios — PDF más diverso 5 tablas, mezcla rica 3 tipos: 43 multi-choice + 5 word-buttons frases A1 español→italiano + 3 match design-rule-válidos profesión↔lugar/herramienta/acción; 6 ediciones autor-aprobadas materializadas atómicamente: avvocata + nota lingüística, farmacista/giornalista invariables + nota errata PDF §1, elisión universal l'avvocato, 5 word-buttons 100-104, 1 meta-rule -ista invariable 043, 3rd match profesión↔acción 202). Patrón PDF→JSON→checkpoint humano→commit validado 3/3 sin issues bloqueantes (1 design-rule patch post-UAT NO bloqueante). 128/128 tests verdes (sin cambios de tests — solo contenido). Schema validation via helper único exit 0 en los 3 archivos. Apostrofes ASCII U+0027 estrictos. 122 ejercicios nuevos = ~221 totales en la app. SEED-01 6/6 categorías con contenido real (cierre formal pendiente UAT integral en 04-04). UAT-derived backlog (UX-1/UX-2/UX-3 heredados de 04-02) sin cambios — NO se incluyen en 04-04 (scope creep).
- **Trabajo previo (Plan 04-02):** ejecución en 4 commits — Task 1 cc7481a (categories.json 6 entradas + 3 placeholders + scripts/validate-content-fixture.mjs), B-1 patch aebae24 (placeholder verbos-movimiento olvidado en Task 1), Task 2 74a5d42 (preposiciones.json 50 ejercicios — directiva del autor "cobertura máxima" expandió de 15 a 50 cubriendo 8 simples + 30/30 articolate + 10 casos particulares + 2 excepciones fuera-de-PDF #049 fra eufónico y #050 con instrumental), Task 3 8094ef0 (verbos-movimiento.json 37 ejercicios — 34 multi-choice + 3 word-buttons del §5 cubriendo 11 verbos × 7 personas + concordancia género/número + excepciones §4; typo del PDF §5 nº4 `Io (uovo)` reinterpretado a `Io (donna)` con nota documentada). Patrón PDF→JSON→checkpoint humano→commit validado 2/2 sin issues. 128/128 tests verdes (sin cambios de tests — solo contenido). Schema validation via helper único exit 0 en ambos archivos. Apostrofes ASCII U+0027 estrictos en todos los ejercicios (RESEARCH §D landmine). 87 ejercicios nuevos = 104 totales en la app.
- **Trabajo previo (Plan 04-01):** ejecución end-to-end en 2 commits (180168d Task 1, 33b0945 Task 2) + Task 3 mini-UAT humano 5/5 PASS. Task 1: migración v2→v3 idempotente + módulo puro `src/data/backup.js` (parseBackupFile + buildBackupWrapper con mensajes literales del UI-SPEC en español) + `daysSinceISO` puro DST-safe en `src/domain/dates.js` + 21 tests nuevos backup.test.js + 2 tests extra en data-storage.test.js. Task 2: 5 handlers nuevos en app.js (exportBackup/onFileSelected/commitImport/buildImportConfirmMessage + 3 getters reactivos) + 4 inline guards firstUsedAt (D-78 NO helper) + W-2 fix backupLastMessage cleanup + banner home + 3er botón Backup en `.button-row-prominent` + template pantalla Backup en index.html + 5 reglas CSS Phase 4. Layer purity D-02 verificada por grep (0 matches localStorage/DOM en backup.js y dates.js). 128/128 tests verdes (105 baseline + 23 nuevos). Mini-UAT (Task 3): autor verificó en navegador con `npx serve` los 5 escenarios — UAT-1 render, UAT-2 export descarga JSON correcto, UAT-3 import error path (mensaje rojo del UI-SPEC), UAT-4 import OK round-trip (confirmación inline → Continuar → state reemplazado), UAT-5 banner reactividad con DevTools sim de `lastBackupAt = 8d atrás`, `lastBackupAt = null + firstUsedAt = 8d`, y `lastBackupAt = mañana` (fecha futura defensa T-04-04). Cero bugs detectados. BACK-04/BACK-05/BACK-06 cierran formalmente aquí.
- **Trabajo previo (Plan 03-02):** ejecución end-to-end de 2 tasks en 2 commits (f9e400e, f4000b7) — match handler puro + validateMatchPayload impl real + registry final con 3 entradas + 2 call-sites EXACTOS de applyImmediateFailure (uno en applyResultToSession decisión final, otro en matchPickRight primer-fallo con guard matchHadFailure) + sub-template HTML match + 5 selectores CSS + 3 ejercicios match seed (incluyendo avere-202 con duplicados D-66) + W3 idempotencia tests (skipped en Task 1, activados automáticamente al landed Task 2 vía detección runtime de matchPickRight en source) + W5 smoke tests (presencia textual de handlers + ramas match en handleSessionKey + shuffle en initSubStateForExercise). 105/105 tests verdes (81 baseline + 24 nuevos). Comentarios placeholder '03-02' eliminados (grep `03-02` en src/screens/app.js retorna nada). Stub message `'aún no soportado'` completamente erradicado. EXTYPE-03 cierra; SESSION-06 contribuido por 03-01 + 03-02 pero closure formal en UAT 03-03.
- **Trabajo previo (Plan 03-01):** ejecución end-to-end de 3 tasks en 6 commits (cb17a97, dd45a0a, 9b1beac, 14ec6d4, 3be17c0, f12838a) — word-buttons handler + dispatch-table validator + 23 tests, refactor fisherYates exportable, refactor sessionSelectOption→applyResultToSession single call-site D-54, sub-estados word-buttons + match placeholders + handlers + handleSessionKey + initSubStateForExercise, 2 ejercicios word-buttons en avere.json, sub-template HTML + CSS .wb-*. 81/81 tests verdes (58 baseline Phase 1+2 + 23 nuevos). Phase 2 regression smoke (5 pasos UAT humano) NO ejecutado en wave sequential — mitigado por equivalencia algebraica del refactor + single call-site verificado por grep + 58 tests baseline siguen verdes. Recomendación 03-03: ejecutar el smoke regression Phase 2 ANTES de los pasos word-buttons/match en el UAT.
- **Trabajo previo (Phase 3 discuss):** `/gsd:discuss-phase 3` ejecutado. 4 áreas grises discutidas (UX word-buttons, UX match, ergonomía teclado, schema JSON + grading), 16 preguntas single-turn, 17 decisiones nuevas capturadas (D-56..D-72).
- **Trabajo (Phase 3 UI-SPEC):** `/gsd:ui-phase 3` ejecutado. `gsd-ui-researcher` (opus) generó `03-UI-SPEC.md` (352 líneas, 28 KB) resolviendo 5 puntos de Claude's discretion: superíndice Unicode `¹²³ᵃᵇᶜ` con `.kbd-hint` (vs `<kbd>`), outline 2px Pico primary para item izq seleccionado en match, `@keyframes match-flash-red` 300ms única WCAG §2.3.1 safe, placeholder vía `::before` italic muted, forced-last-pair NO auto-completar. `gsd-ui-checker` (sonnet) aprobó 6/6 dimensiones (copywriting, visuals, color, typography, spacing, registry safety) sin issues bloqueantes. 3 notas de calidad no bloqueantes para el planner: documentar inline el selector `.wb-answer.incorrecta`, garantizar cleanup del `setTimeout` de match-flash, aceptar `aria-live="polite"` sobre `.wb-answer`. Commit `47f2995`. Resumen:
  - Word-buttons: banco → área respuesta, distractoras opcionales, botón Comprobar + Enter, frase correcta literal al fallar.
  - Match: validación instantánea por pareja, cualquier intento erróneo → ejercicio fallado (cascada D-54 inmediata en el primer error), shuffle ambas columnas, tamaño 2..~10 variable.
  - Teclado: 1-9 dinámicos en word-buttons (Backspace quita última, Enter = Comprobar); 1-9 izq + a-i der en match; Enter/Space tras fallo dispara sessionAdvance (auto-avance 600ms intacto); foco al body con keydown listener global del session sub-template.
  - Schema: word-buttons `{prompt, answer[], distractors?[]}`; match `{prompt, pairs:[[izq,der]]}`; duplicados en derecha permitidos con grading textual + consumo por índice; case-insensitive global en grading (no en multi-choice).
- **Archivos generados:** `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` + `03-DISCUSSION-LOG.md` + `03-UI-SPEC.md`. Commits `53f0aba` (CONTEXT/LOG), `47f2995` (UI-SPEC).
- **Lección recurrente pendiente:** double-defense Alpine sigue sin ADR (heredado de Phase 2). Phase 3 lo aplica también a los nuevos sub-templates (`sessionCurrentExercise.payload.answer`, `.pairs`).
- **Siguiente paso:** `/clear` luego `/gsd:plan-phase 3` para descomponer Phase 3 en planes ejecutables. El planner verá CONTEXT.md (D-56..D-72) + UI-SPEC.md (6/6 dimensiones aprobadas) + RESEARCH.md (a generar). Plan probable: 03-01 schema validator + grade() de los 2 tipos + tests; 03-02 sub-templates en index.html + sub-estados en appShell + handlers UI; 03-03 keydown global + sufijos visibles + UAT.

### Files Generated

**Initialization:**

- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/research/SUMMARY.md`, `STACK.md`, `FEATURES.md`, `ARCHITECTURE.md`, `PITFALLS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/config.json`

**Plan 01-01 (Walking Skeleton):**

- `index.html`, `styles.css`, `README.md`
- `src/main.js`
- `src/domain/{dates,session,progress}.js`
- `src/data/{schema-validator,content-loader,storage}.js`
- `src/exercise-types/{index,multiple-choice}.js`
- `content/categories.json`, `content/exercises/avere.json`
- `tests/domain.test.js`, `tests/util/seeded-rng.js`
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-01-SUMMARY.md`

**Plan 01-02 (Session Screen Alpine):**

- `src/screens/session.js` (new)
- `src/main.js` (extended con sync top-level Alpine listener + Promise handoff)
- `index.html` (extended con markup Alpine; ordering main.js antes que Alpine defer)
- `styles.css` (extended con [x-cloak] + .correcta/.incorrecta)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-02-SUMMARY.md`

**Plan 04-02 (Categories + Preposiciones + Verbos de movimiento):**

- `content/categories.json` (modified — 1 entrada → 6 entradas, order 1..6, ID `avere` preservado)
- `content/exercises/preposiciones.json` (new, 50 ejercicios multi-choice, cobertura PDF completa)
- `content/exercises/verbos-movimiento.json` (new, 37 ejercicios — 34 multi-choice + 3 word-buttons)
- `content/exercises/sustantivos-irregulares.json` (placeholder `{"exercises":[]}`)
- `content/exercises/genero-numero.json` (placeholder `{"exercises":[]}`)
- `content/exercises/profesiones.json` (placeholder `{"exercises":[]}`)
- `scripts/validate-content-fixture.mjs` (new, helper único B-4 fix reusable 04-03/04-04)
- `.planning/phases/04-backup-robusto-contenido-completo/04-02-SUMMARY.md`

**Plan 04-03 (Sustantivos Irregulares + Género y Número + Profesiones):**

- `content/exercises/sustantivos-irregulares.json` (modified — placeholder → 31 ejercicios mezcla post-design-rule, 14 match singular↔plural irregular + 17 multi-choice incluyendo 5 invariables convertidas por design rule)
- `content/exercises/genero-numero.json` (modified — placeholder → 40 ejercicios mezcla, 24 match sustantivo↔artículo/singular↔plural regular agrupados temáticamente + 16 multi-choice excepciones, D-66 duplicados textuales intencionales)
- `content/exercises/profesiones.json` (modified — placeholder → 51 ejercicios mezcla rica 3 tipos: 43 multi-choice + 5 word-buttons frases A1 + 3 match design-rule-válidos)
- `.planning/phases/04-backup-robusto-contenido-completo/04-03-SUMMARY.md` (new, captures DESIGN RULE NEW como sección destacada + UAT-derived backlog heredado de 04-02)

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
|-------|------|----------|-------|-------|
| 1 | 01-01 | ~14 min | 3 | 16 |
| 1 | 01-02 | ~22 min | 3 (2 auto + 1 checkpoint) | 4 |
| 3 | 03-01 | ~38 min | 3 (Task 1 + Task 2a en 4 sub-commits + Task 2b) | 10 (3 created + 7 modified) |
| 3 | 03-02 | ~10 min | 2 (Task 1 TDD + Task 2 sub-template/handlers/seed/W5) | 9 (2 created + 7 modified) |
| 4 | 04-01 | ~16 min | 3 (Task 1 TDD data+domain + Task 2 UI vertical slice + Task 3 mini-UAT humano) | 10 (3 created + 7 modified) |
| 4 | 04-02 | ~75 min | 3 (Task 1 categories+placeholders+helper + B-1 patch + Task 2 preposiciones checkpoint + Task 3 verbos-movimiento checkpoint) | 7 (6 created + 1 modified) — 4 commits |
| 4 | 04-03 | ~120 min | 3 (Task 1 sustantivos-irregulares checkpoint + design-rule patch + Task 2 genero-numero checkpoint + Task 3 profesiones checkpoint con 6 ediciones autor) | 4 (3 modified + 1 created) — 4 commits |

### Next Action

```

# Plan 04-03 completado. Siguiente:

/gsd:execute-phase 4   # continuar con 04-04 (avere multi-cat extension SEED-02 + smoke test cascada multi-cat + UAT integral 5 criterios ROADMAP)
```

Plan 04-04 cierra Phase 4: extiende avere.json con ≥6 ejercicios multi-categoría (cruces avere × preposiciones / verbos-movimiento / profesiones / etc.) + smoke test simulando cascada multi-cat real + UAT integral de los 5 criterios ROADMAP de Phase 4. Patrón "PDF → JSON → checkpoint → commit" validado 5/5 (2/2 en 04-02 + 3/3 en 04-03). DESIGN RULE 'match-if-not-trivial-by-root' anclada — aplicar también a cruces multi-cat. Helper `scripts/validate-content-fixture.mjs` reusable. 128 tests verdes como baseline.

UAT-derived backlog (UX-1/UX-2/UX-3) sigue capturado en 04-02-SUMMARY.md + reforzado en 04-03-SUMMARY.md — NO incluir en 04-04 (scope creep). Considerar Phase 5 dedicado a polish UX si el autor lo pide tras finalizar Phase 4.

---
*State initialized: 2026-05-23*
*Last updated: 2026-05-24T13:30:00Z after Plan 04-03 completion (128/128 tests verdes, 4 commits, 122 ejercicios nuevos transcritos del PDF, DESIGN RULE 'match-if-not-trivial-by-root' anclada como normativa + retro-patch a sustantivos-irregulares, 6 ediciones autor-aprobadas en Task 3, SEED-01 6/6 categorías con contenido real pendiente UAT integral en 04-04)*
