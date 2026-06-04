# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md).
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md).
- ✅ **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (shipped 2026-05-28). 2 categorías nuevas (8ª y 9ª), 100 ejercicios nuevos validados por quórum cross-vendor. Ver [milestones/v1.2-ROADMAP.md](./milestones/v1.2-ROADMAP.md).
- ✅ **v1.3 — Canciones (bloque de traducción)** — Phases 13-14 (shipped 2026-06-02). Bloque nuevo "Canciones": traducir canciones italianas frase a frase (word-buttons inverso italiano→español), enganchadas al motor vía cascada D-54; 1ª canción real "Equilibrio mentale". 19/19 requirements, 306/306 tests. Brownfield: reutiliza el engine. Ver [milestones/v1.3-ROADMAP.md](./milestones/v1.3-ROADMAP.md).
- ✅ **v1.4 — Variantes de ejercicio (slots por regla)** — Phases 15-17 (shipped 2026-06-03). Motor slot+variantes (1 slot = 1 regla, 1..N variantes intercambiables; examen elige 1 variante aleatoria por slot) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum, 2 slots locativos). 17/17 requirements, 342/342 tests, `schemaVersion 5→6→7`. Brownfield: reutiliza cascada D-54, sampler, schema-validator, patrón Test-completo. Ver [milestones/v1.4-ROADMAP.md](./milestones/v1.4-ROADMAP.md).
- 🚧 **v1.5 — Conversión a slots: Bloque Artículos (CONV-01)** — Phases 18-20 (ACTIVE). Convertir Articoli + Partitivi al modelo slot+variantes (reagrupar por regla + autorar variantes nuevas por quórum), demostrando que el patrón del piloto Preposiciones escala a las categorías de mejor encaje — sin tocar el motor v1.4. `schemaVersion 7→8` (reset selectivo de ambas categorías). 9 requirements (4 ART + 3 PART + 2 MIG).

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

<details>
<summary>✅ v1.4 (Phases 15-17) — SHIPPED 2026-06-03</summary>

- [x] Phase 15: Modelo de datos slot+variantes + schema + migración (3/3 plans) — completed 2026-06-03
- [x] Phase 16: Motor de examen por slots (2/2 plans) — completed 2026-06-03
- [x] Phase 17: Piloto Preposiciones (contenido) (4/4 plans) — completed 2026-06-03

**Total:** 3 fases, 9 plans, 17/17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests verdes. Motor slot+variantes sobre el engine v1.0 (cascada D-54 intacta, 2 call-sites) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum cross-vendor cazando 6 bugs, 2 slots locativos). `schemaVersion 5→6→7`. Las 8 categorías no-piloto = slots de 1 variante (backward-compat). Detalles en `.planning/milestones/v1.4-ROADMAP.md`.

</details>

### 🚧 v1.5 — Conversión a slots: Bloque Artículos (CONV-01) — ACTIVE

Numeración CONTINÚA desde Phase 17 → Phases 18-20 (NO reset — mismo criterio que v1.1/v1.2/v1.3/v1.4). **Brownfield puro contenido + migración:** toda la maquinaria slot+variantes del motor v1.4 (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 con 2 call-sites de `applyImmediateFailure`, smoke paramétrico bifurcado por shape) YA EXISTE y NO se toca. Se replica EXACTAMENTE el patrón del piloto Preposiciones (Phase 17): migración con reset selectivo → reagrupar por regla con explanation a nivel de slot → autorar variantes por quórum cross-vendor R1-R7 → smoke + sync de counts. Diferencia clave vs v1.4: la migración `7→8` resetea DOS categorías (articoli + partitivos) a la vez.

- [x] **Phase 18: Migración `7→8` (reset selectivo articoli + partitivos)** — `migrate7to8`/`hydrateV8` idempotente + deep-clone defensivo; resetea el progreso SOLO de `articoli` + `partitivos` (categoryProgress + exerciseStats por prefijo + inFlightTest, racha 0); las otras 7 categorías byte-intactas; `backup.js` round-trip v8 + import v7→v8. Va PRIMERA: bloquea la renumeración de ids de las dos fases de contenido (no se puede renumerar con progreso vivo). (completed 2026-06-03)
- [ ] **Phase 19: Articoli a slots (contenido)** — Reagrupar los 56 ejercicios en slots por regla (determinativi por disparador fonético + indeterminativi como slots propios, ART-03), autorar variantes nuevas por quórum cross-vendor R1-R7, slots nuevos para huecos detectados, validator + smoke paramétrico verdes con counts re-sincronizados.
- [ ] **Phase 20: Partitivi a slots (contenido)** — Reagrupar los 44 ejercicios en slots por regla (del-formas + contable/incontable + alternativas + omisión en negativa + partitivo-vs-preposizione), autorar variantes nuevas por quórum cross-vendor R1-R7, validator + smoke paramétrico verdes con counts re-sincronizados.

## Phase Details

### Phase 18: Migración `7→8` (reset selectivo articoli + partitivos)
**Goal**: El state migra de `schemaVersion 7` a `8` reseteando el progreso SOLO de Articoli y Partitivi (las otras 7 categorías conservan su progreso byte-intacto), dejando libre la renumeración de ids que harán las dos fases de contenido — replicando el patrón de `migrate6to7`/`hydrateV7` del piloto pero con DOS categorías reseteadas a la vez en una sola migración.
**Depends on**: Phase 17 (último estado shipped v1.4, schemaVersion 7)
**Requirements**: MIG-01, MIG-02
**Success Criteria** (what must be TRUE):
  1. Tras la migración `7→8` (`migrate7to8` + `hydrateV8`, idempotente + deep-clone defensivo anti-prototype-pollution) el progreso de `articoli` Y `partitivos` queda reseteado a no-hecha con racha 0: `categoryProgress` borrado para ambas, `exerciseStats` filtrado por prefijo de ambas (cubre ids legacy y futuros de slot), `inFlightTest` invalidado si contiene ids de cualquiera de las dos.
  2. Las otras 7 categorías (Avere, Essere, Verbos-movimiento, Sustantivos-irregulares, Género-número, Profesiones, Preposiciones) conservan su progreso byte-intacto tras migrar (verificable por test).
  3. `backup.js` exporta v8 reimportable round-trip; un backup v7 importado migra a v8 reseteando articoli+partitivos; los backups `>8` se rechazan (forward-compat).
  4. La app arranca limpia sobre el state migrado y los tests siguen verdes (los 342 baseline + los nuevos de la cadena v8).
**Plans**: 1 plan
- [x] 18-01-PLAN.md — migrate7to8 + hydrateV8 (reset selectivo articoli+partitivos, MIG-01) + backup.js round-trip v8 (MIG-02); clon literal del patrón 17-01 con 2 prefijos; 2 tasks TDD
**UI hint**: no

### Phase 19: Articoli a slots (contenido)
**Goal**: Articoli se convierte al modelo slot+variantes — los 56 ejercicios validados se reagrupan en slots por regla (determinativi por disparador fonético + indeterminativi como slots propios dentro de la misma categoría), se autoran variantes nuevas que pasan el quórum cross-vendor, y la estructura final pasa el validator y el smoke — demostrando que el patrón del piloto escala a la primera categoría de mejor encaje.
**Depends on**: Phase 18 (la migración 7→8 debe estar hecha antes de renumerar ids — no se renumera con progreso vivo, mismo criterio que el piloto)
**Requirements**: ART-01, ART-02, ART-03, ART-04
**Success Criteria** (what must be TRUE):
  1. Los 56 ejercicios de Articoli quedan reagrupados en slots por regla — determinativi por disparador fonético (il/i; lo/gli ante s+cons/z/gn/ps/x/y/i+vocal; l'/gli ante vocal; la/le) y los que entrenan la misma regla reformulada son ahora variantes del mismo slot, con explicación a nivel de slot.
  2. Los indeterminativi (un/uno/una/un') quedan como slots propios dentro de Articoli con sus reglas de selección (uno ante s+cons/z/gn/ps/x/y/i+vocal; un' ante femenino+vocal) — sin crear categoría nueva.
  3. Las variantes nuevas autoradas (patrón D-85: Claude propone → autor revisa) pasan el quórum cross-vendor R1-R7 antes de entrar; los huecos de regla detectados durante la autoría se añaden como slots nuevos.
  4. La estructura final de Articoli pasa el validator y el smoke paramétrico (con los hardcodes de count re-sincronizados al nº real de slots, como en D-17-04), con la cobertura de explanations a nivel de slot preservada.
**Plans**: 3 plans
- [ ] 19-01-PLAN.md — reagrupar los 56 ejercicios en slots por forma/sub-disparador (lo/gli split, formas invariables agrupadas, indeterminativi slots propios, match + cruces slots-de-1 con id estable), explanation a nivel de slot (ART-01, ART-03)
- [ ] 19-02-PLAN.md — autorar variantes nuevas (engordar celdas pobres) + slots de huecos y/i+vocal, cada superficie por quórum cross-vendor R1-R7 (ART-02, ART-03)
- [ ] 19-03-PLAN.md — re-sincronizar los 3 hardcodes de count + TOTAL_EXPECTED al nº real de slots; validator + smoke paramétrico verdes (ART-04)
**UI hint**: no

### Phase 20: Partitivi a slots (contenido)
**Goal**: Partitivi se convierte al modelo slot+variantes — los 44 ejercicios validados se reagrupan en slots por regla (del-formas por disparador + eje contable/incontable + alternativas + omisión + partitivo-vs-preposizione), se autoran variantes nuevas que pasan el quórum, y la estructura final pasa el validator y el smoke — cerrando el bloque Artículos de CONV-01.
**Depends on**: Phase 18 (migración 7→8). Independiente de Phase 19 una vez hecha la migración — Articoli y Partitivi pueden autorarse en cualquier orden o en paralelo.
**Requirements**: PART-01, PART-02, PART-03
**Success Criteria** (what must be TRUE):
  1. Los 44 ejercicios de Partitivi quedan reagrupados en slots por regla — del-formas por disparador fonético + eje contable/incontable + alternativas (qualche/alcuni/un po' di) + omisión en negativa + distinción partitivo-vs-preposizione articolata; los que entrenan la misma regla reformulada son variantes del mismo slot, con explicación a nivel de slot.
  2. Las variantes nuevas autoradas (patrón D-85 + quórum cross-vendor R1-R7) pasan el quórum antes de entrar; los huecos detectados durante la autoría se añaden como slots nuevos.
  3. La estructura final de Partitivi pasa el validator y el smoke paramétrico (counts re-sincronizados al nº real de slots), con la cobertura de explanations a nivel de slot preservada.
**Plans**: TBD
**UI hint**: no

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-8 | v1.0 | 26/26 | Complete | 2026-05-25 |
| 9-10 | v1.1 | 8/8 | Complete | 2026-05-27 |
| 11-12 | v1.2 | 10/10 | Complete | 2026-05-28 |
| 13-14 | v1.3 | 3/3 | Complete | 2026-06-02 |
| 15-17 | v1.4 | 9/9 | Complete | 2026-06-03 |
| 18. Migración 7→8 (reset articoli+partitivos) | v1.5 | 1/1 | Complete    | 2026-06-03 |
| 19. Articoli a slots (contenido) | v1.5 | 0/3 | Planned | - |
| 20. Partitivi a slots (contenido) | v1.5 | 0/? | Not started | - |

## Backlog

### Conversión del resto de categorías a slots (CONV-01 cont. — diferido a milestone futuro)

**Status:** Backlog post-v1.5. Tras convertir Preposiciones (v1.4) + Articoli + Partitivi (v1.5), quedan las 6 categorías restantes: verbos (Avere, Essere, Verbi di movimento) y morfología (Sostantivi irregolari, Genere e numero, Professioni), una por milestone incremental siguiendo el patrón del piloto. Para las léxicas puras (Sostantivi irregolari, Professioni) se evaluará entonces si el modelo slot+variantes aporta valor o si quedan como slots-de-1 reagrupados. En v1.4/v1.5 estas 6 categorías funcionan como slots de 1 variante (backward-compat, SLOT-06).

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4/v1.5 las variantes se autoran a mano + quórum (patrón D-85).

### Categorización asistida de frases de canciones (CATPROC — diferido a milestone futuro)

**Status:** Backlog post-v1.3. CATPROC-01 (un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas) + CATPROC-02 (el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas). El modelo de datos v1.3 (LINK-03) YA soporta frases sin categoría para no bloquear esto.

### Más canciones (MUSIC-X1 — diferido)

**Status:** Backlog post-v1.3. Añadir más canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3.

### Phase 13+ (post-v1.2, futuro): Más categorías de tiempos verbales, modo móvil, bridges Partitivos

**Status:** Backlog v1.5+. Items capturados en PROJECT.md §"Next Milestone Goals": categorías nuevas conforme la profesora entrega material (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — TENSE-X1..X4), bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2), responsive móvil si emerge dolor, refactor cosmético confirmLabel unificado en las 6 call-sites.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — detalles en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — detalles en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 shipped 2026-05-28 — detalles en `.planning/milestones/v1.2-ROADMAP.md`.*
*Milestone v1.3 shipped 2026-06-02 — Phases 13-14 (numeración CONTINÚA desde Phase 12). Bloque Canciones: 19 requirements, 306/306 tests, brownfield sobre el engine v1.0. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.*
*Milestone v1.4 shipped 2026-06-03 — Phases 15-17 (numeración CONTINÚA desde Phase 14). Variantes de ejercicio (slots por regla): motor slot+variantes + piloto Preposiciones. 17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests. Detalles en `.planning/milestones/v1.4-ROADMAP.md`.*
*Milestone v1.5 abierto 2026-06-04 — Phases 18-20 (numeración CONTINÚA desde Phase 17). Conversión a slots: Bloque Artículos (CONV-01): convertir Articoli + Partitivi a slots+variantes reutilizando toda la maquinaria v1.4 (motor, sampler, cascada, smoke bifurcado por shape — NO se tocan). 9 requirements (4 ART + 3 PART + 2 MIG), 9/9 mapped, 0 orphans. Brownfield puro contenido + migración: Phase 18 (migración 7→8 reset selectivo de ambas categorías) → Phase 19 (Articoli) → Phase 20 (Partitivi); 19 y 20 independientes entre sí tras la migración.*
