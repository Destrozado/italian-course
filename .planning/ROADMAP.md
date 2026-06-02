# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md).
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md).
- ✅ **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (shipped 2026-05-28). 2 categorías nuevas (8ª y 9ª), 100 ejercicios nuevos validados por quórum cross-vendor. Ver [milestones/v1.2-ROADMAP.md](./milestones/v1.2-ROADMAP.md).
- 🚧 **v1.3 — Canciones (bloque de traducción)** — Phases 13-14 (planning). Bloque nuevo "Canciones": traducir canciones italianas frase a frase (word-buttons inverso italiano→español), frases enganchadas al motor vía cascada D-54. Reutiliza engine + word-buttons + schema-validator + patrón Test completo.

## Phases

<details>
<summary>✅ v1.0 (Phases 1-8) — SHIPPED 2026-05-25</summary>

- [x] Phase 1: Loop mínimo end-to-end (2/2 plans) — completed 2026-05-23
- [x] Phase 2: Mecánica completa de re-verificación (4/4 plans) — completed 2026-05-23
- [x] Phase 3: Variedad de ejercicios + ergonomía de teclado (3/3 plans) — completed 2026-05-24
- [x] Phase 4: Backup robusto + contenido completo (4/4 plans) — completed 2026-05-24
- [x] Phase 5: Essere — categoría fundamental que faltaba (1/1 plan) — completed 2026-05-24
- [x] Phase 6: Polish UX post-sesión — reiniciar + review errores (2/2 plans) — completed 2026-05-24
- [x] Phase 7: Explicaciones pedagógicas al fallar — Preposiciones (2/2 plans) — completed 2026-05-25
- [x] Phase 7.1: Explicaciones Género-Número + canon ortográfico (2/2 plans) — completed 2026-05-25
- [x] Phase 7.2: Explicaciones 5 categorías restantes (cobertura 100%) (5/5 plans) — completed 2026-05-25
- [x] Phase 8: Modo Examen por categoría (1/1 plan) — completed 2026-05-25

**Total:** 10 fases, 26 plans, 71 tasks, 271/271 ejercicios curados (7 categorías), 62/62 v1 requirements, 209/209 tests verdes.

</details>

<details>
<summary>✅ v1.1 (Phases 9-10) — SHIPPED 2026-05-27</summary>

- [x] Phase 9: Infraestructura de validación (3/3 plans) — completed 2026-05-26
- [x] Phase 10: Ejecución validación 271 ejercicios + escalada disputed (5/5 plans) — completed 2026-05-27

**Total:** 2 fases, 8 plans, 272/272 ejercicios validados por quórum Opus 4.7 + Sonnet 4.6, 55 disputed resueltos, 8/8 requirements VAL-01..08. Detalles en `.planning/milestones/v1.1-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.2 (Phases 11-12) — SHIPPED 2026-05-28</summary>

- [x] Phase 11: Articoli — 8ª categoría (5/5 plans) — completed 2026-05-27
- [x] Phase 12: Partitivos — 9ª categoría (5/5 plans) — completed 2026-05-28

**Total:** 2 fases, 10 plans, 100 ejercicios nuevos (56 articoli + 44 partitivos), 372/372 validated por quórum cross-vendor (DeepSeek + Opus 4.7), 15/15 requirements (8 ART + 7 PART). Detalles en `.planning/milestones/v1.2-ROADMAP.md`.

</details>

### v1.3 — Canciones (bloque de traducción) — ACTIVE (Planning)

- [ ] **Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end** — Pantalla Canciones con listado/estado, schema de canción + validator + migración, reproducción secuencial con word-buttons inverso (italiano→español), feedback + resumen, frases enganchadas con cascada D-54, standalone fuera del sampler
- [ ] **Phase 14: Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera** — Letra dividida en frases con sentido (limpiando ruido no-lírico), traducción española curada + distractoras + enganche de categorías por frase, validación ligera autor-oráculo (NO quórum estricto R1-R7)

## Phase Details

### Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end
**Goal**: El usuario puede abrir un bloque "Canciones" separado del home, ver el listado con estado por canción, y jugar una canción completa traduciéndola frase a frase (italiano→español) con feedback, resumen de errores y cascada D-54 a las categorías enganchadas — todo reutilizando el engine, el tipo word-buttons, el schema-validator y el patrón Test completo existentes, SIN reconstruir el motor.
**Depends on**: Nothing nuevo (brownfield sobre engine v1.0 DONE: cascada D-54 `applyImmediateFailure`/`applyResultToSession`, word-buttons `grade()`, schema-validator `PAYLOAD_VALIDATORS`, patrón Test-completo/summary-errors, schemaVersion 4)
**Requirements**: SONG-01, SONG-02, SONG-03, SONG-04, PLAY-01, PLAY-02, PLAY-03, PLAY-04, PLAY-05, LINK-01, LINK-02, LINK-03, LINK-04, DATA-01, DATA-02, DATA-03
**Success Criteria** (what must be TRUE):
  1. El usuario abre el bloque "Canciones" desde el home (separado de la tabla de categorías) y ve un listado donde cada canción muestra su estado (no hecha / pasada / fallada) y su número de frases; el estado pasada/fallada persiste en localStorage y sobrevive a recargar la página (SONG-01, SONG-02, SONG-04)
  2. Con 1 clic el usuario inicia una canción y recorre sus N frases en orden secuencial hasta el final sin reinicio a mitad (patrón Test completo); cada frase muestra la línea en italiano y se construye la traducción española eligiendo palabras (word-buttons en dirección inversa), con feedback inmediato verde/rojo que al fallar muestra la traducción correcta (SONG-03, PLAY-01, PLAY-02, PLAY-03)
  3. Al terminar la canción el usuario ve un resumen con las frases falladas (su respuesta vs la correcta); abandonar a mitad descarta el progreso no comprometido y al re-entrar la canción empieza de cero (sin slot de reanudación) (PLAY-04, PLAY-05)
  4. Fallar una frase enganchada a categorías gramaticales dispara la cascada D-54 inmediata sobre esas categorías (reset de estado + racha), visible al volver al home; las frases sin categoría se guardan y juegan sin disparar cascada; ninguna frase de canción entra en el sampler de Repaso 20 / Test completo ni en la tabla de categorías del home (LINK-01, LINK-02, LINK-03, LINK-04)
  5. El contenido de canciones vive en JSON editado a mano contra un schema definido (canción → frases ordenadas con metadatos); el schema-validator rechaza JSON de canción malformado con banner visible coherente con el validator existente; si el state de canciones requiere campos nuevos hay migración `schemaVersion` coherente con el patrón `migrateNtoM` (DATA-01, DATA-02, DATA-03)
**Plans**: 2 plans
- [x] 13-01-PLAN.md — Modelo de datos: schema de canción + validateSongs + loadSongs standalone + migrate4to5/songProgress + mini-canción de prueba
- [ ] 13-02-PLAN.md — Slice jugable: botón Canciones + listado con estado + playthrough secuencial it→es con cascada D-54 + resumen post-canción
**UI hint**: yes

### Phase 14: Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera
**Goal**: La primera canción real, "Equilibrio mentale — Ultimo", queda dividida en frases con sentido completo (limpiando ruido no-lírico), cada frase con su traducción española curada y su enganche de categorías (o marcada sin categoría), validada en modo ligero autor-oráculo — de modo que el autor puede jugarla de principio a fin como ejercicio real.
**Depends on**: Phase 13 (necesita el schema de canción, el validator y el playthrough para verificar el contenido end-to-end)
**Requirements**: CONT-01, CONT-02, CONT-03
**Success Criteria** (what must be TRUE):
  1. "Equilibrio mentale — Ultimo" aparece en el listado de Canciones dividida en frases con sentido completo, sin ruido no-lírico (créditos de directo, "You might also like", etc.), y el autor la juega de principio a fin (CONT-01)
  2. Cada frase tiene su traducción española curada como answer tokens, distractoras opcionales, y un enganche de categorías gramaticales existentes (o está marcada explícitamente sin categoría); fallar una frase enganchada cascada D-54 a las categorías declaradas (CONT-02)
  3. El contenido pasa la validación ligera autor-oráculo (una IA verifica que la traducción española sea defendible y que el enganche de categorías por frase sea correcto; el autor es oráculo final sobre el fraseo artístico), SIN exigir el quórum gramatical estricto R1-R7 (CONT-03)
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8 | v1.0 | 26/26 | Complete | 2026-05-25 |
| 9-10 | v1.1 | 8/8 | Complete | 2026-05-27 |
| 11-12 | v1.2 | 10/10 | Complete | 2026-05-28 |
| 13. Bloque Canciones + playthrough | v1.3 | 1/2 | In Progress|  |
| 14. Contenido "Equilibrio mentale" | v1.3 | 0/? | Not started | - |

## Backlog

### Phase 999.1: Botón "Reiniciar ejercicios" en pantalla de sesión (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See archived milestone for active spec.

### Phase 999.2: Pantalla "Resultado" final con review de errores cometidos (PROMOTED → Phase 6)

**Status:** Promoted to active roadmap as part of Phase 6 (Polish UX post-sesión). See archived milestone for active spec.

### Phase 7.x (futuro, opcional): Explanations para las otras 6 categorías (CLOSED → Phase 7.1 + 7.2)

**Status:** Cerrado durante Phase 7.2 — todas las 7 categorías tienen explanations 100% (271/271 ejercicios).

### Phase 8.x (futuro, opcional): Modo Examen multi-cat / atajos teclado / copy especializada banner reanudar

**Status:** Backlog. Items deferred del CONTEXT.md §`<deferred>` de Phase 8 — capturados para no perderlos pero out-of-scope Phase 8: (a) Examen multi-cat (selección de 2-3 cats para examinar en bloque); (b) atajos de teclado (E + número de fila); (c) copy especializada en banner reanudar ("Examen de Avere a medias" vs "Test completo a medias"); (d) diferenciación visual en pantalla session entre Examen y Test completo regular; (e) homogeneización de las 6 call-sites del helper `requestConfirm` con confirmLabel unificado (`'Continuar'` vs `'Descartar y empezar'`).

### Phase 8.y (post-v1.0, opcional): Botón "Reiniciar examen" en pantalla session

**Status:** Cerrado vía quick task `260525-vvj` (commit `7eaf5a2`) — `restartRepaso()` extendido a dual-mode `'repaso'` + `'test-completo'`, x-show del botón actualizado, 223→230 tests verdes (+7 presence-check). Deja de ser backlog.

### Categorización asistida de frases de canciones (CATPROC — diferido a milestone futuro)

**Status:** Backlog post-v1.3. CATPROC-01 (un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas) + CATPROC-02 (el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas). El modelo de datos v1.3 (LINK-03) YA soporta frases sin categoría para no bloquear esto.

### Más canciones (MUSIC-X1 — diferido)

**Status:** Backlog post-v1.3. Añadir más canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3.

### Phase 13+ (post-v1.2, futuro): Más categorías de tiempos verbales, modo móvil, bridges Partitivos

**Status:** Backlog v1.3+. Items capturados en PROJECT.md §"Next Milestone Goals": categorías nuevas conforme la profesora entrega material (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — TENSE-X1..X4), bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2), responsive móvil si emerge dolor, refactor cosmético confirmLabel unificado en las 6 call-sites.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — detalles en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — detalles en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 shipped 2026-05-28 — 2 categorías nuevas (Articoli + Partitivos), 100 ejercicios validados por quórum cross-vendor (DeepSeek + Opus 4.7), 15/15 requirements. Detalles en `.planning/milestones/v1.2-ROADMAP.md`.*
*Milestone v1.3 abierto 2026-06-02 — Phases 13-14 (numeración CONTINÚA desde Phase 12, NO reset). Bloque Canciones: 19 requirements (4 SONG + 5 PLAY + 4 LINK + 3 DATA + 3 CONT), 19/19 mapped, 0 orphans. Brownfield: reutiliza engine + word-buttons + schema-validator + patrón Test completo; NO reconstruye el motor de re-verificación.*
