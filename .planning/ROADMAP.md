# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md).
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md).
- ✅ **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (shipped 2026-05-28). 2 categorías nuevas (8ª y 9ª), 100 ejercicios nuevos validados por quórum cross-vendor. Ver [milestones/v1.2-ROADMAP.md](./milestones/v1.2-ROADMAP.md).
- ✅ **v1.3 — Canciones (bloque de traducción)** — Phases 13-14 (shipped 2026-06-02). Bloque nuevo "Canciones": traducir canciones italianas frase a frase (word-buttons inverso italiano→español), enganchadas al motor vía cascada D-54; 1ª canción real "Equilibrio mentale". 19/19 requirements, 306/306 tests. Brownfield: reutiliza el engine. Ver [milestones/v1.3-ROADMAP.md](./milestones/v1.3-ROADMAP.md).
- ✅ **v1.4 — Variantes de ejercicio (slots por regla)** — Phases 15-17 (shipped 2026-06-03). Motor slot+variantes (1 slot = 1 regla, 1..N variantes intercambiables; examen elige 1 variante aleatoria por slot) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum, 2 slots locativos). 17/17 requirements, 342/342 tests, `schemaVersion 5→6→7`. Brownfield: reutiliza cascada D-54, sampler, schema-validator, patrón Test-completo. Ver [milestones/v1.4-ROADMAP.md](./milestones/v1.4-ROADMAP.md).
- ✅ **v1.5 — Conversión a slots: Bloque Artículos (CONV-01)** — Phases 18-20 (shipped 2026-06-05). Articoli (56→34 slots) + Partitivi (44→19 slots) convertidos al modelo slot+variantes reagrupando por regla + autorando 14 variantes nuevas por quórum cross-vendor; migración `schemaVersion 7→8` con reset selectivo de ambas categorías. 9/9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests. Brownfield: reutiliza toda la maquinaria v1.4 sin tocar el motor. Ver [milestones/v1.5-ROADMAP.md](./milestones/v1.5-ROADMAP.md).
- 🚧 **v1.6 — Conversión a slots: categorías restantes (CONV-01 cierre)** — Phases 21-27 (ACTIVE). Convertir las 6 categorías legacy restantes (Avere, Essere, Verbi di movimento + Genere e numero, Professioni, Sostantivi irregolari) al modelo slot+variantes, 1 fase por categoría + 1 migración `8→9` con reset selectivo de las 6 — dejando las 9 categorías de gramática en un único formato unificado y cerrando CONV-01. Sin tocar el motor v1.4. 14 requirements (2 MIG + 6×2 conversión).

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

**Total:** 2 fases, 3 plans, 19/19 requirements, 306/306 tests verdes. Bloque Canciones standalone sobre el engine v1.0 (cascada D-54, word-buttons inverso, schema-validator, patrón Test completo) — sin reconstruir el motor; schemaVersion 4→5; 1ª canción real "Equilibrio mentale — Ultimo" (17 frases) con validación ligera autor-oráculo. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.4 (Phases 15-17) — SHIPPED 2026-06-03</summary>

- [x] Phase 15: Modelo de datos slot+variantes + schema + migración (3/3 plans) — completed 2026-06-03
- [x] Phase 16: Motor de examen por slots (2/2 plans) — completed 2026-06-03
- [x] Phase 17: Piloto Preposiciones (contenido) (4/4 plans) — completed 2026-06-03

**Total:** 3 fases, 9 plans, 17/17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests verdes. Motor slot+variantes sobre el engine v1.0 (cascada D-54 intacta, 2 call-sites) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum cross-vendor cazando 6 bugs, 2 slots locativos). `schemaVersion 5→6→7`. Las 8 categorías no-piloto = slots de 1 variante (backward-compat). Detalles en `.planning/milestones/v1.4-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.5 (Phases 18-20) — SHIPPED 2026-06-05</summary>

- [x] Phase 18: Migración `7→8` (reset selectivo articoli + partitivos) (1/1 plan) — completed 2026-06-03
- [x] Phase 19: Articoli a slots (contenido) (3/3 plans) — completed 2026-06-04
- [x] Phase 20: Partitivi a slots (contenido) (3/3 plans) — completed 2026-06-05

**Total:** 3 fases, 7 plans, 9/9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests verdes (367/367 con `VAL_07_STRICT=1`). Articoli (56→34 slots) + Partitivi (44→19 slots) convertidos a slot+variantes (14 superficies nuevas por quórum cross-vendor R1-R7) + migración `7→8` reset selectivo de ambas. `schemaVersion 7→8`. Brownfield puro contenido + migración: motor v1.4 NO tocado. 3/9 categorías en formato slot+variantes. Detalles en `.planning/milestones/v1.5-ROADMAP.md`.

</details>

### 🚧 v1.6 — Conversión a slots: categorías restantes (CONV-01 cierre) — ACTIVE

Numeración CONTINÚA desde Phase 20 → Phases 21-27 (NO reset — mismo criterio que v1.1/v1.2/v1.3/v1.4/v1.5). **Brownfield puro contenido + migración:** toda la maquinaria slot+variantes del motor v1.4 (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 con 2 call-sites de `applyImmediateFailure`, smoke paramétrico bifurcado por shape) YA EXISTE y NO se toca. Se replica EXACTAMENTE el patrón de Phases 17/19/20: migración con reset selectivo → reagrupar por regla con explanation a nivel de slot → autorar variantes por quórum cross-vendor R1-R7 → smoke + sync de counts. Diferencia clave vs v1.5: la migración `8→9` resetea SEIS categorías a la vez (predicado de 6 prefijos), y hay 6 conversiones (1 fase por categoría) en lugar de 2. Para las dos categorías léxicas (Professioni, Sostantivi irregolari) la decisión "regla-con-variantes real O slots-de-1 reagrupados" se resuelve en discuss/plan de cada una — no se fuerzan variantes artificiales.

- [x] **Phase 21: Migración `8→9` (reset selectivo de las 6 categorías)** — `migrate8to9`/`hydrateV9` idempotente + deep-clone defensivo; resetea el progreso SOLO de las 6 categorías a convertir (`avere`, `essere`, `verbos-movimiento`, `genero-numero`, `profesiones`, `sustantivos-irregulares`) vía un predicado de 6 prefijos; las 3 ya convertidas (`preposiciones`, `articoli`, `partitivos`) byte-intactas; `backup.js` round-trip v9 + import v8→v9 + rechazo `>9`. Va PRIMERA: bloquea la renumeración de ids de las 6 fases de contenido (no se renumera con progreso vivo). (completed 2026-06-05)
- [x] **Phase 22: Avere a slots (contenido)** — Reagrupar los 23 ejercicios de Avere en slots por regla (presente indicativo + idiomático + passato prossimo + cruces multi-cat), autorar variantes nuevas por quórum cross-vendor R1-R7, huecos→slots, validator + smoke + counts re-sincronizados + explanation a nivel de slot. (completed 2026-06-05)
- [x] **Phase 23: Essere a slots (contenido)** — Reagrupar los 39 ejercicios de Essere en slots por regla (presente indicativo + identidad/nacionalidad/profesión/estado/cópula + participio stato/stata/stati/state + cruces), autorar variantes nuevas por quórum, huecos→slots, validator + smoke + counts + explanation a nivel de slot. (completed 2026-06-08 — 39→26 slots, TOTAL_EXPECTED 320→307)
- [x] **Phase 24: Verbi di movimento a slots (contenido)** — Reagrupar los 37 ejercicios de Verbi di movimento en slots por regla, autorar variantes nuevas por quórum, huecos→slots, validator + smoke + counts + explanation a nivel de slot. (completed 2026-06-08)
- [x] **Phase 25: Genere e numero a slots (contenido)** — Reagrupar los 40 ejercicios de Genere e numero en slots por regla (terminaciones de género + formación de plural; match si requiere regla no derivable por raíz, D-04), autorar variantes nuevas por quórum, huecos→slots, validator + smoke + counts + explanation a nivel de slot. (completed 2026-06-08)
- [ ] **Phase 26: Professioni a slots (contenido, léxica)** — Reagrupar los 51 ejercicios de Professioni en slots. Decisión de discuss/plan: regla-con-variantes natural (p.ej. femenino por terminación) O slots-de-1 reagrupados si la categoría léxica no admite variantes intercambiables. Validator + smoke + counts + explanation a nivel de slot.
- [ ] **Phase 27: Sostantivi irregolari a slots (contenido, léxica)** — Reagrupar los 31 ejercicios de Sostantivi irregolari en slots. Decisión de discuss/plan: regla-con-variantes natural (p.ej. patrones de plural irregular) O slots-de-1 reagrupados. Validator + smoke + counts + explanation a nivel de slot. Cierra CONV-01 (9/9 categorías unificadas).

## Phase Details

### Phase 21: Migración `8→9` (reset selectivo de las 6 categorías)

**Goal**: El state migra de `schemaVersion 8` a `9` reseteando el progreso SOLO de las 6 categorías a convertir (Avere, Essere, Verbi di movimento, Genere e numero, Professioni, Sostantivi irregolari), dejando las 3 ya convertidas (Preposiciones, Articoli, Partitivos) byte-intactas, y liberando la renumeración de ids que harán las 6 fases de contenido — replicando el patrón de `migrate7to8`/`hydrateV8` de v1.5 pero con SEIS categorías reseteadas en una sola migración mediante un predicado de 6 prefijos.
**Depends on**: Phase 20 (último estado shipped v1.5, schemaVersion 8)
**Requirements**: MIG-03, MIG-04
**Success Criteria** (what must be TRUE):

  1. Tras la migración `8→9` (`migrate8to9` + `hydrateV9`, idempotente + deep-clone defensivo anti-prototype-pollution) el progreso de las 6 categorías (`avere`, `essere`, `verbos-movimiento`, `genero-numero`, `profesiones`, `sustantivos-irregulares`) queda reseteado a no-hecha con racha 0: `categoryProgress` borrado para las 6, `exerciseStats` filtrado por los 6 prefijos (cubre ids legacy y futuros de slot), `inFlightTest` invalidado si contiene ids de cualquiera de las 6.
  2. Las 3 categorías ya convertidas (`preposiciones`, `articoli`, `partitivos`) conservan su progreso byte-intacto tras migrar (verificable por test con fixture de las 9 categorías).
  3. `backup.js` exporta v9 reimportable round-trip; un backup v8 importado migra a v9 reseteando las 6 categorías; los backups `>9` se rechazan (forward-compat).
  4. La app arranca limpia sobre el state migrado y los tests siguen verdes (los 358 baseline + los nuevos de la cadena v9).

**Plans**: 1 plan
Plans:

- [x] 21-01-PLAN.md — migrate8to9 + hydrateV9 + bump CURRENT_SCHEMA_VERSION (storage.js, MIG-03) + backup.js round-trip v9 + import v8→v9 con reset (MIG-04); 2 tasks TDD, clon literal de 18-01 con predicado de 6 prefijos

**UI hint**: no

### Phase 22: Avere a slots (contenido)

**Goal**: Avere se convierte al modelo slot+variantes — los 23 ejercicios validados se reagrupan en slots por regla (presente indicativo por persona + usos idiomáticos + passato prossimo + cruces multi-cat avere-300..305), se autoran variantes nuevas que pasan el quórum cross-vendor R1-R7, y la estructura final pasa el validator y el smoke. Primera de las 3 categorías de verbos.
**Depends on**: Phase 21 (la migración 8→9 debe estar hecha antes de renumerar ids — no se renumera con progreso vivo). Independiente de Phases 23-27 una vez hecha la migración.
**Requirements**: AVE-01, AVE-02
**Success Criteria** (what must be TRUE):

  1. Los 23 ejercicios de Avere quedan reagrupados en slots por regla con explicación a nivel de slot; los que entrenan la misma regla reformulada son variantes del mismo slot. Los cruces multi-cat (avere-300..305) preservan id estable y sus `categoryIds[]`, y la cascada D-54 sigue funcionando (2 call-sites intactos, verificable por grep).
  2. Donde la regla admite reformulación se autoran variantes nuevas (patrón D-85: Claude propone → autor revisa → quórum cross-vendor R1-R7, 4× correcta 0 incorrecta, 1-por-1 NUNCA batched); los huecos de regla detectados se añaden como slots nuevos. El blindaje APPEND-ONLY D-88 de avere se respeta (relax mínimo D-178 si aplica).
  3. La estructura final de Avere pasa el validator y el smoke paramétrico, con los hardcodes de count re-sincronizados al nº real de slots leído del JSON y la cobertura de explanations a nivel de slot preservada.

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 22-01-PLAN.md — reagrupar los 23 ejercicios a slots por regla (presente por persona + sensaciones + passato prossimo + word-buttons/match + cruces 300..305) con explanation a nivel de slot; checkpoint:decision del mapa + re-base del blindaje APPEND-ONLY D-88 (D-178) — completed 2026-06-05 (23 ids → 19 slots; validator + D-88 re-base verdes)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 22-02-PLAN.md — autorar variantes nuevas por quórum cross-vendor R1-R7 (engorde de celdas pobres de presente + idiomatismos avere sete/freddo/sonno/ragione/anni + passato de otros verbos); checkpoint:human-verify D-85

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 22-03-PLAN.md — re-sincronizar los 3 hardcodes de count + TOTAL_EXPECTED al nº real de slots leído del JSON; smoke shape-agnostic + reporter verdes

**UI hint**: no

### Phase 23: Essere a slots (contenido)

**Goal**: Essere se convierte al modelo slot+variantes — los 39 ejercicios validados se reagrupan en slots por regla (presente indicativo + identidad/nacionalidad/profesión/estado/cópula + participio stato/stata/stati/state + cruces essere-300..305), se autoran variantes nuevas que pasan el quórum, y la estructura final pasa el validator y el smoke. Segunda de las 3 categorías de verbos.
**Depends on**: Phase 21 (migración 8→9). Independiente de las demás conversiones tras la migración.
**Requirements**: ESS-01, ESS-02
**Success Criteria** (what must be TRUE):

  1. Los 39 ejercicios de Essere quedan reagrupados en slots por regla con explicación a nivel de slot; el patrón distractoras essere/avere (refuerzo del contraste que confunde al hispanohablante) se preserva donde aplica; los cruces multi-cat (essere-300..305) preservan id estable y `categoryIds[]` con cascada D-54 intacta.
  2. Donde la regla admite reformulación se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1); los huecos detectados se añaden como slots nuevos.
  3. La estructura final de Essere pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada.

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 23-01-PLAN.md — reagrupar los 39 ejercicios a slots por regla (presente por persona + identidad/nacionalidad/profesión/estado/cópula + passato prossimo en 4 slots separados por concordancia stato/stata/stati/state D-23-03 + word-buttons 100..103 + cruces 300..305) con explanation a nivel de slot; checkpoint:decision del mapa; SIN snapshot (avere-only, no aplica re-base D-88) — completed 2026-06-08 (39 ids → 25 slots; validateContent verde)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 23-02-PLAN.md — autorar variantes nuevas por quórum cross-vendor R1-R7 (engorde de celdas pobres de presente + concordancia de nacionalidad italiano/italiana + localización con essere + slot NUEVO ser/estar D-23-07 + contraste essere/avere agresivo D-23-06); checkpoint:human-verify D-85 + decisión de model IDs (Open Q #1) — completed 2026-06-08 (14 superficies nuevas, todas >=4x correcta; localización absorbida sin slot; slot nuevo ser/estar con validation top-level; count 25 → 26)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 23-03-PLAN.md — re-sincronizar los 3 hardcodes de count (exercise-types:1271, slot-variants-integration:168, run-validation-271:103) + TOTAL_EXPECTED (:111, =320−39+n) al nº real de slots leído del JSON; smoke shape-agnostic + reporter verdes — completed 2026-06-08 (39→26 en los 3 sitios; TOTAL_EXPECTED 320→307; suite 374/374, strict 383/383, reporter VAL-06 307/307 PASS)
**UI hint**: no

### Phase 24: Verbi di movimento a slots (contenido)

**Goal**: Verbi di movimento se convierte al modelo slot+variantes — los 37 ejercicios validados se reagrupan en slots por regla, se autoran variantes nuevas que pasan el quórum, y la estructura final pasa el validator y el smoke. Tercera y última de las categorías de verbos.
**Depends on**: Phase 21 (migración 8→9). Independiente de las demás conversiones tras la migración.
**Requirements**: MOV-01, MOV-02
**Success Criteria** (what must be TRUE):

  1. Los 37 ejercicios de Verbi di movimento quedan reagrupados en slots por regla con explicación a nivel de slot; los que entrenan la misma regla reformulada son variantes del mismo slot. La restricción D-159 (cero referencias cruzadas a Essere por ID o prosa) se preserva en las explanations.
  2. Donde la regla admite reformulación se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1); los huecos detectados se añaden como slots nuevos.
  3. La estructura final de Verbi di movimento pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada.

**Plans**: 3 plans
- [x] 24-01-PLAN.md — Reagrupar los 37 ejercicios a slots por regla de auxiliar (slot essere, concordancia en 1 slot D-24-03, excepcioni->avere, correre propio D-24-04, 3 word-buttons); mapa auditado + checkpoint
- [x] 24-02-PLAN.md — Autorar variantes nuevas por quórum cross-vendor R1-R7 (4 ejes de huecos D-24-06: más verbos essere, más excepciones avere, más test-de-destino, matriz de concordancia)
- [x] 24-03-PLAN.md — Re-sincronizar los 3 hardcodes de count + TOTAL_EXPECTED contra el nº real de slots (D-24-15)
**UI hint**: no

### Phase 25: Genere e numero a slots (contenido)

**Goal**: Genere e numero se convierte al modelo slot+variantes — los 40 ejercicios validados se reagrupan en slots por regla (terminaciones de género masc/fem + formación de plural por terminación), se autoran variantes nuevas que pasan el quórum, y la estructura final pasa el validator y el smoke. Primera de las 3 categorías de morfología/léxico.
**Depends on**: Phase 21 (migración 8→9). Independiente de las demás conversiones tras la migración.
**Requirements**: GEN-01, GEN-02
**Success Criteria** (what must be TRUE):

  1. Los 40 ejercicios de Genere e numero quedan reagrupados en slots por regla (terminaciones de género + reglas de formación de plural) con explicación a nivel de slot; los 3 match preservan la DESIGN RULE D-04 (match solo si el pareo requiere regla NO derivable por raíz) y los que entrenan la misma regla reformulada son variantes del mismo slot.
  2. Donde la regla admite reformulación se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1); los huecos detectados se añaden como slots nuevos.
  3. La estructura final de Genere e numero pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada.

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 25-01-PLAN.md — Reagrupar los 40 ejercicios a 1 SLOT POR MICRO-REGLA (D-25-01, granularidad fina): plural -o/-i, -a/-e, -e/-i, sonido duro -co/-go, invariables, femenino -o/-a, -tore/-trice, -e/-essa, articulo por sonido; 6 duplicados colapsados a variantes; 3 match preservados (D-25-03/D-04); checkpoint:decision del mapa

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 25-02-PLAN.md — Autorar variantes nuevas por quorum cross-vendor R1-R7 (4 ejes de huecos D-25-04: invariables, sonido duro con excepcion amico->amici, genero -trice/-essa, plural base); checkpoint:human-verify D-85

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 25-03-PLAN.md — Re-sincronizar los 3 hardcodes de count + TOTAL_EXPECTED contra el nº real de slots (D-25-11)
**UI hint**: no

### Phase 26: Professioni a slots (contenido, léxica)

**Goal**: Professioni se convierte al modelo unificado — los 51 ejercicios validados se reagrupan en slots con explicación a nivel de slot. En discuss/plan se decide por categoría si hay regla-con-variantes natural (p.ej. femenino de profesiones por terminación) o si conviene dejarlos como slots-de-1 reagrupados (categoría léxica pura). La estructura final pasa el validator y el smoke. Segunda categoría léxica.
**Depends on**: Phase 21 (migración 8→9). Independiente de las demás conversiones tras la migración.
**Requirements**: PROF-01, PROF-02
**Success Criteria** (what must be TRUE):

  1. Los 51 ejercicios de Professioni quedan reagrupados en slots con explicación a nivel de slot, en formato unificado slot+variantes; los 3 match preservan la DESIGN RULE D-04 (profesión↔lugar/herramienta/acción, no derivable por raíz). La decisión "regla-con-variantes real O slots-de-1 reagrupados" queda documentada explícitamente para la categoría (no se fuerzan variantes artificiales).
  2. SI se identifica regla-con-variantes (p.ej. femenino por terminación -e/-essa/-trice), se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1) que pasan el quórum antes de entrar; SI la categoría queda como slots-de-1, se documenta que no aplica autoría de variantes.
  3. La estructura final de Professioni pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada.

**Plans**: TBD
**UI hint**: no

### Phase 27: Sostantivi irregolari a slots (contenido, léxica)

**Goal**: Sostantivi irregolari se convierte al modelo unificado — los 31 ejercicios validados se reagrupan en slots con explicación a nivel de slot. En discuss/plan se decide si hay regla-con-variantes natural (p.ej. patrones de plural irregular bue→buoi, uovo→uova) o si conviene dejarlos como slots-de-1 reagrupados. La estructura final pasa el validator y el smoke — cerrando CONV-01 (las 9 categorías de gramática unificadas). Tercera y última categoría léxica.
**Depends on**: Phase 21 (migración 8→9). Independiente de las demás conversiones tras la migración. Última fase del milestone (cierre de CONV-01).
**Requirements**: SOST-01, SOST-02
**Success Criteria** (what must be TRUE):

  1. Los 31 ejercicios de Sostantivi irregolari quedan reagrupados en slots con explicación a nivel de slot, en formato unificado slot+variantes (DESIGN RULE D-04 respetada: los plurales irregulares derivables por raíz van a multi-choice, no a match). La decisión "regla-con-variantes real O slots-de-1 reagrupados" queda documentada explícitamente (no se fuerzan variantes artificiales).
  2. SI se identifica regla-con-variantes (p.ej. patrones de plural irregular), se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7, 4× correcta, 1-por-1) que pasan el quórum antes de entrar; SI la categoría queda como slots-de-1, se documenta que no aplica autoría de variantes.
  3. La estructura final de Sostantivi irregolari pasa el validator y el smoke paramétrico, con los counts re-sincronizados al nº real de slots y la cobertura de explanations a nivel de slot preservada.
  4. Con esta fase, las 9 categorías de gramática quedan en formato slot+variantes unificado: CONV-01 cerrado.

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
| 18-20 | v1.5 | 7/7 | Complete | 2026-06-05 |
| 21. Migración 8→9 (reset 6 categorías) | v1.6 | 1/1 | Complete    | 2026-06-05 |
| 22. Avere a slots (contenido) | v1.6 | 3/3 | Complete    | 2026-06-05 |
| 23. Essere a slots (contenido) | v1.6 | 3/3 | Complete    | 2026-06-08 |
| 24. Verbi di movimento a slots (contenido) | v1.6 | 3/3 | Complete    | 2026-06-08 |
| 25. Genere e numero a slots (contenido) | v1.6 | 3/3 | Complete   | 2026-06-08 |
| 26. Professioni a slots (contenido, léxica) | v1.6 | 0/0 | Not started | - |
| 27. Sostantivi irregolari a slots (contenido, léxica) | v1.6 | 0/0 | Not started | - |

## Backlog

### Conversión del resto de categorías a slots (CONV-01 — EN CURSO en v1.6)

**Status:** Activo en v1.6 (Phases 21-27). Tras convertir Preposiciones (v1.4) + Articoli + Partitivi (v1.5), v1.6 convierte las 6 categorías restantes: verbos (Avere, Essere, Verbi di movimento) y morfología/léxico (Genere e numero, Professioni, Sostantivi irregolari), 1 fase por categoría siguiendo el patrón del piloto. Para las léxicas puras (Sostantivi irregolari, Professioni) se evalúa por categoría en discuss/plan si el modelo slot+variantes aporta valor o si quedan como slots-de-1 reagrupados. Al cerrar v1.6, CONV-01 queda completo (9/9 categorías de gramática unificadas).

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4/v1.5/v1.6 las variantes se autoran a mano + quórum (patrón D-85).

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
*Milestone v1.5 shipped 2026-06-05 — Phases 18-20 (numeración CONTINÚA desde Phase 17). Conversión a slots: Bloque Artículos (CONV-01): Articoli (56→34 slots) + Partitivi (44→19 slots) a slots+variantes + migración 7→8 reset selectivo. 9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests, `schemaVersion 7→8`. Detalles en `.planning/milestones/v1.5-ROADMAP.md`.*
*Milestone v1.6 abierto 2026-06-05 — Phases 21-27 (numeración CONTINÚA desde Phase 20). Conversión a slots: categorías restantes (CONV-01 cierre): convertir las 6 categorías legacy (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) a slots+variantes, 1 fase por categoría + migración 8→9 reset selectivo de las 6, dejando las 9 categorías en formato único. 14 requirements (2 MIG + 6×2 conversión), 14/14 mapped, 0 orphans. Brownfield puro contenido + migración: Phase 21 (migración 8→9) → Phases 22-27 (Avere, Essere, Verbi di movimento, Genere e numero, Professioni, Sostantivi irregolari); 22-27 independientes entre sí tras la migración. Para las léxicas (Professioni, Sostantivi irregolari) la decisión regla-con-variantes O slots-de-1 se resuelve en discuss/plan de cada una. El motor v1.4 NO se toca.*
