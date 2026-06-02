# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md).
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md).
- ✅ **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (shipped 2026-05-28). 2 categorías nuevas (8ª y 9ª), 100 ejercicios nuevos validados por quórum cross-vendor. Ver [milestones/v1.2-ROADMAP.md](./milestones/v1.2-ROADMAP.md).
- ✅ **v1.3 — Canciones (bloque de traducción)** — Phases 13-14 (shipped 2026-06-02). Bloque nuevo "Canciones": traducir canciones italianas frase a frase (word-buttons inverso italiano→español), enganchadas al motor vía cascada D-54; 1ª canción real "Equilibrio mentale". 19/19 requirements, 306/306 tests. Brownfield: reutiliza el engine. Ver [milestones/v1.3-ROADMAP.md](./milestones/v1.3-ROADMAP.md).
- 🚧 **v1.4 — Variantes de ejercicio (slots por regla)** — Phases 15-17 (ACTIVE). Motor slot+variantes (1 slot = 1 regla, 1..N variantes intercambiables; examen elige 1 variante aleatoria por slot) + piloto Preposiciones. Brownfield: reutiliza la cascada D-54, sampler, schema-validator, patrón Test-completo. 17 requirements (6 SLOT + 6 EXAM + 5 PILOT).

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

<details>
<summary>✅ v1.3 (Phases 13-14) — SHIPPED 2026-06-02</summary>

- [x] Phase 13: Bloque Canciones + modelo de datos + playthrough end-to-end (2/2 plans) — completed 2026-06-02
- [x] Phase 14: Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera (1/1 plan) — completed 2026-06-02

**Total:** 2 fases, 3 plans, 19/19 requirements (4 SONG + 5 PLAY + 4 LINK + 3 DATA + 3 CONT), 306/306 tests verdes. Bloque Canciones standalone sobre el engine v1.0 (cascada D-54, word-buttons inverso, schema-validator, patrón Test completo) — sin reconstruir el motor; schemaVersion 4→5; 1ª canción real "Equilibrio mentale — Ultimo" (17 frases) con validación ligera autor-oráculo. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.

</details>

### 🚧 v1.4 — Variantes de ejercicio (slots por regla) — ACTIVE

Numeración CONTINÚA desde Phase 14 → Phases 15-17 (NO reset — mismo criterio que v1.1/v1.2/v1.3).

- [ ] **Phase 15: Modelo de datos slot+variantes + schema + migración** — Slots (1 regla = 1 slot, 1..N variantes intercambiables), explicación a nivel de slot, validator extendido, migración `schemaVersion 5→6`, backward-compat de las 8 categorías no-piloto como slots de 1 variante.
- [ ] **Phase 16: Motor de examen por slots** — El sampler/examen elige 1 variante aleatoria por slot; "hecha" = pasar los N slots; cascada D-54 reusando `applyResultToSession` (0 nuevos call-sites); racha/dominada y Repaso 20 / Test / Examen integran el muestreo por slot. Engine exercisable end-to-end.
- [ ] **Phase 17: Piloto Preposiciones (contenido)** — Reagrupar los 57 ejercicios en slots por regla, autorar variantes nuevas (quórum R1-R7), añadir el slot `in spiaggia / in montagna`, reset de progreso de Preposiciones, pasar validator + smoke paramétrico.

## Phase Details

### Phase 15: Modelo de datos slot+variantes + schema + migración
**Goal**: El contenido y el state soportan un modelo slot+variantes — cada slot representa una regla con 1..N variantes intercambiables y una explicación compartida — con validator estricto, migración `5→6` y las 8 categorías no-piloto funcionando intactas como slots de 1 variante.
**Depends on**: Phase 14 (último estado shipped v1.3, schemaVersion 5)
**Requirements**: SLOT-01, SLOT-02, SLOT-03, SLOT-04, SLOT-05, SLOT-06
**Success Criteria** (what must be TRUE):
  1. Un archivo de categoría define slots, cada slot contiene 1..N variantes (cada variante = un payload jugable completo del tipo multiple-choice / word-buttons / match) y una explicación a nivel de slot compartida por todas sus variantes.
  2. Un slot con exactamente 1 variante carga y se trata con normalidad (sin caso especial visible).
  3. El validator rechaza con banner visible un JSON malformado: slot sin variantes, variante sin payload válido para su tipo, o explicación ausente — coherente con el banner del validator existente.
  4. Tras la migración `5→6` (`migrate5to6` + `hydrateV6`, idempotente + deep-clone defensivo) el state arranca limpio y `backup.js` exporta/importa round-trip en v6.
  5. Las 8 categorías no-piloto siguen cargando y funcionando sin re-autoría — cada ejercicio actual se interpreta como 1 slot de 1 variante (backward-compat verificable: la app arranca con las 9 categorías visibles como hoy).
**Plans**: 3 plans
  - [x] 15-01-PLAN.md — Validator slot+variantes (payload XOR variants[]) + loader slotById (SLOT-01/02/03/04/06)
  - [x] 15-02-PLAN.md — Migración schemaVersion 5→6 (migrate5to6/hydrateV6) + backup.js round-trip v6 (SLOT-05)
  - [ ] 15-03-PLAN.md — Integración end-to-end + back-compat de las 9 categorías + checkpoint booteo (SLOT-01/03/06)

### Phase 16: Motor de examen por slots
**Goal**: El motor de re-verificación recorre slots en vez de ejercicios sueltos — elige 1 variante aleatoria por slot, redefine "categoría hecha" como pasar los N slots, y mantiene la cascada D-54, la racha de 21 días y los 3 modos de sesión intactos. Engine exercisable end-to-end con slots de 1 variante antes de la rework de contenido.
**Depends on**: Phase 15
**Requirements**: EXAM-01, EXAM-02, EXAM-03, EXAM-04, EXAM-05, EXAM-06
**Success Criteria** (what must be TRUE):
  1. Una sesión de una categoría presenta como máximo 1 variante por slot — nunca dos variantes del mismo slot en la misma sesión.
  2. Una categoría se marca "hecha" solo al pasar sin fallar 1 variante de cada uno de sus N slots; el recuento "Ejercicios" del home muestra slots, no variantes.
  3. Fallar la variante de un slot resetea al instante las `categoryIds` del slot (cascada D-54), reusando `applyResultToSession` — el conteo de call-sites de `applyImmediateFailure` sigue siendo exactamente 2 (Pitfall #2 verificable por grep).
  4. Al re-hacer una categoría tras fallo/reset, la selección aleatoria se reejecuta y pueden tocar variantes distintas a la pasada anterior.
  5. Racha 21 días + promoción hecha→dominada operan sobre la nueva definición de "hecha" por slots, y Repaso 20 / Test completo / Modo Examen integran el muestreo por slot (GUARANTEE ≥1 slot por categoría elegida).
**Plans**: TBD
**UI hint**: yes

### Phase 17: Piloto Preposiciones (contenido)
**Goal**: Preposiciones se convierte en el primer caso real del modelo slot+variantes — los 57 ejercicios validados se reagrupan en slots por regla, se autoran variantes nuevas que pasan el quórum, se añade el slot locativo fijo `in spiaggia`, y su progreso se resetea — demostrando que el motor mata la memorización por palabras con dolor real.
**Depends on**: Phase 16 (el motor de slots debe estar exercisable antes de la rework de contenido)
**Requirements**: PILOT-01, PILOT-02, PILOT-03, PILOT-04, PILOT-05
**Success Criteria** (what must be TRUE):
  1. Los 57 ejercicios validados de Preposiciones quedan reagrupados en slots por regla — los que entrenan la misma regla reformulada son ahora variantes del mismo slot.
  2. Las variantes nuevas autoradas (patrón D-85: Claude propone → autor revisa) pasan el quórum cross-vendor R1-R7 antes de entrar.
  3. Existe un slot de preposición locativa fija `in spiaggia / in montagna / al mare / in campagna` que antes no estaba en ninguna categoría.
  4. Al migrar Preposiciones a slots su progreso se resetea a no-hecha (racha 0); el resto de categorías conserva su progreso.
  5. La estructura final de Preposiciones pasa el validator y el smoke test paramétrico, con la cobertura de explanations preservada a nivel de slot.
**Plans**: TBD
**UI hint**: no

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8 | v1.0 | 26/26 | Complete | 2026-05-25 |
| 9-10 | v1.1 | 8/8 | Complete | 2026-05-27 |
| 11-12 | v1.2 | 10/10 | Complete | 2026-05-28 |
| 13-14 | v1.3 | 3/3 | Complete | 2026-06-02 |
| 15. Modelo de datos slot+variantes | v1.4 | 2/3 | In Progress|  |
| 16. Motor de examen por slots | v1.4 | 0/? | Not started | - |
| 17. Piloto Preposiciones (contenido) | v1.4 | 0/? | Not started | - |

## Backlog

### Conversión del resto de categorías a slots (CONV-01 — diferido a milestone futuro)

**Status:** Backlog post-v1.4. Reestructurar las otras 8 categorías (Avere, Essere, Verbos-movimiento, Sustantivos-irregulares, Género-número, Profesiones, Articoli, Partitivos) a slots-por-regla + variantes, una por milestone incremental siguiendo el patrón validado en el piloto Preposiciones (Phase 17). En v1.4 estas 8 categorías funcionan como slots de 1 variante (backward-compat, SLOT-06).

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4 las variantes se autoran a mano + quórum (patrón D-85).

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

**Status:** Backlog v1.4+. Items capturados en PROJECT.md §"Next Milestone Goals": categorías nuevas conforme la profesora entrega material (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — TENSE-X1..X4), bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2), responsive móvil si emerge dolor, refactor cosmético confirmLabel unificado en las 6 call-sites.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — detalles en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — detalles en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 shipped 2026-05-28 — detalles en `.planning/milestones/v1.2-ROADMAP.md`.*
*Milestone v1.3 shipped 2026-06-02 — Phases 13-14 (numeración CONTINÚA desde Phase 12). Bloque Canciones: 19 requirements, 306/306 tests, brownfield sobre el engine v1.0. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.*
*Milestone v1.4 abierto 2026-06-02 — Phases 15-17 (numeración CONTINÚA desde Phase 14). Variantes de ejercicio (slots por regla): motor slot+variantes + piloto Preposiciones. 17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 17/17 mapped, 0 orphans. Brownfield: reutiliza cascada D-54, sampler, schema-validator, patrón Test-completo.*
