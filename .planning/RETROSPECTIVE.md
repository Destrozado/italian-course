# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.3 — Canciones (bloque de traducción)

**Shipped:** 2026-06-02
**Phases:** 2 (13-14) | **Plans:** 3 | **Sessions:** ~1 día (2026-06-02)

### What Was Built
- Bloque "Canciones" standalone (6º `currentScreen`) con listado + estado pasada/fallada por canción persistido en localStorage; pantallas dedicadas `cancion`/`cancion-summary`.
- Playthrough secuencial it→es reutilizando word-buttons en dirección inversa, feedback verde/rojo, resumen post-canción (frases falladas + impacto en categorías), cascada D-54 por frase reusando `applyResultToSession` (0 nuevos call-sites de `applyImmediateFailure`).
- Modelo de datos: schema de canción + `validateSongs` export separado, `migrate4to5`/`hydrateV5` deep-clone, `backup.js` extendido a v5; frases sin categoría soportadas (preparado para CATPROC).
- Primera canción real "Equilibrio mentale — Ultimo" (17 frases) autorada con validación ligera autor-oráculo (NO quórum R1-R7).

### What Worked
- **Brownfield disciplinado:** la decisión "reutilizar el engine, NO reconstruir" se mantuvo end-to-end — el playthrough cae sobre `applyResultToSession` con un único call-site, evitando duplicar la mecánica de cascada (Pitfall #2 prevenido arquitectónicamente).
- **Slice vertical temprano:** Phase 13 entregó "jugar una mini-canción" completa antes de cargar contenido real, dejando Phase 14 como puro contenido sobre maquinaria ya verificada.
- **UAT humano cazó un bug real:** verificar la canción real en navegador (Phase 14) reveló `bankWithKeys` vacío en modo canción — un bug del MOTOR pre-existente que los tests automáticos no cubrían porque ninguna canción se había jugado de verdad hasta entonces.

### What Was Inefficient
- **Verificación humana de Phase 13 quedó colgada:** los 5 escenarios de `13-HUMAN-UAT.md` (cascada desde frase, PLAY-05, LINK-04) nunca se cerraron formalmente; quedaron cubiertos por tests automáticos + el UAT de Phase 14, pero el estado `human_needed` persistió hasta el cierre del milestone (acknowledged como deferred).
- **El bug `bankWithKeys` se descubrió tarde:** apareció solo al jugar la canción real en Phase 14, no en la mini-canción de Phase 13 — señal de que un UAT de playthrough real debería haberse forzado antes del cierre de Phase 13.

### Patterns Established
- **Bloque nuevo sobre engine existente:** un modo de ejercicio completamente nuevo (traducción) reutiliza cascada D-54 + word-buttons `grade()` + schema-validator + patrón Test-completo sin tocar la mecánica de re-verificación. Validator del bloque como export SEPARADO (no extiende `PAYLOAD_VALIDATORS`) cuando el bloque es standalone.
- **Estado simple para contenido no-graduado:** `{status, lastPlayedAt}` plano para canciones vs el modelo dominada/racha/21-day de categorías — no todo el contenido necesita la maquinaria completa de re-verificación.
- **Validación ligera autor-oráculo:** para contenido "particular" por diseño (traducción artística), 1 pase IA + autor como oráculo, NO el quórum gramatical estricto que produciría falsos positivos.

### Key Lessons
1. Cuando un modo nuevo aísla un campo del engine (`sessionCurrentExercise=null` por LINK-04), auditar TODOS los call-sites que leían ese campo — `bankWithKeys` lo asumía non-null y rompía silenciosamente.
2. Un UAT de "jugar el contenido REAL de principio a fin" debe ser gate de cierre de la fase de maquinaria, no diferirse a la fase de contenido — ahí es donde aparecen los bugs de integración que los tests de unidad no ven.
3. Reutilizar un único call-site central (`applyResultToSession`) para acierto/fallo de cualquier modo paga: el milestone entero tuvo 0 bugs de cascada duplicada.

### Cost Observations
- Model mix: predominantemente opus (perfil `quality`).
- Sessions: ~1 día de trabajo concentrado (2026-06-02).
- Notable: brownfield + reuse mantuvo el milestone pequeño (3 plans, +1,101 LOC) — el coste fue editorial (autorar la canción) más que de ingeniería.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | — | 10 | Walking skeleton → motor de re-verificación + 7 categorías + Modo Examen |
| v1.1 | — | 2 | Infra de validación editorial (quórum multi-AI, skills, reporter) |
| v1.2 | — | 2 | Patrón "categoría nueva" consolidado (temario→ejercicios→lockstep→quórum); cross-vendor caza bugs que human-verify deja pasar |
| v1.3 | ~1 día | 2 | Patrón "bloque nuevo sobre engine" — un modo de ejercicio nuevo reutiliza el motor sin reconstruirlo |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|-------------------|
| v1.0 | 209/209 | 271/271 ejercicios curados | engine, 3 tipos, backup, schema-validator |
| v1.1 | 261/261 | 272/272 validados por quórum | skills validación, reporter |
| v1.2 | 268/268 | 372/372 validados | `validate-ai-pass.mjs` multi-provider |
| v1.3 | 306/306 | 19/19 requirements | bloque Canciones, `validateSongs`, `migrate4to5` |

### Top Lessons (Verified Across Milestones)
1. **Reutilizar un único call-site central paga** — `applyResultToSession` (v1.0) absorbió tanto los tipos nuevos de v1.0 como el modo canción de v1.3 sin duplicar la cascada.
2. **El human-verify deja pasar bugs que otra capa caza** — en v1.2 fue el cross-vendor (8 bugs en Articoli); en v1.3 fue el UAT de contenido real (`bankWithKeys`). La verificación de una sola capa no basta.
3. **Brownfield disciplinado mantiene los milestones pequeños** — declarar "NO reconstruir el motor" y sostenerlo deja que el coste sea de contenido, no de ingeniería (v1.2 y v1.3).
