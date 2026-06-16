# Roadmap: Italian Course — Ejercicios A1/A2

**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## Milestones

- ✅ **v1.0 — Motor re-verificación + 7 categorías + Modo Examen** — Phases 1-8 (shipped 2026-05-25). Ver [milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md).
- ✅ **v1.1 — Validación editorial** — Phases 9-10 (shipped 2026-05-27). 272/272 ejercicios validados por quórum multi-AI. Ver [milestones/v1.1-ROADMAP.md](./milestones/v1.1-ROADMAP.md).
- ✅ **v1.2 — Más contenido A1 (Articoli + Partitivos)** — Phases 11-12 (shipped 2026-05-28). 2 categorías nuevas (8ª y 9ª), 100 ejercicios nuevos validados por quórum cross-vendor. Ver [milestones/v1.2-ROADMAP.md](./milestones/v1.2-ROADMAP.md).
- ✅ **v1.3 — Canciones (bloque de traducción)** — Phases 13-14 (shipped 2026-06-02). Bloque nuevo "Canciones": traducir canciones italianas frase a frase (word-buttons inverso italiano→español), enganchadas al motor vía cascada D-54; 1ª canción real "Equilibrio mentale". 19/19 requirements, 306/306 tests. Brownfield: reutiliza el engine. Ver [milestones/v1.3-ROADMAP.md](./milestones/v1.3-ROADMAP.md).
- ✅ **v1.4 — Variantes de ejercicio (slots por regla)** — Phases 15-17 (shipped 2026-06-03). Motor slot+variantes (1 slot = 1 regla, 1..N variantes intercambiables; examen elige 1 variante aleatoria por slot) + piloto Preposiciones (52 ejercicios → 49 slots, 41 variantes nuevas por quórum, 2 slots locativos). 17/17 requirements, 342/342 tests, `schemaVersion 5→6→7`. Brownfield: reutiliza cascada D-54, sampler, schema-validator, patrón Test-completo. Ver [milestones/v1.4-ROADMAP.md](./milestones/v1.4-ROADMAP.md).
- ✅ **v1.5 — Conversión a slots: Bloque Artículos (CONV-01)** — Phases 18-20 (shipped 2026-06-05). Articoli (56→34 slots) + Partitivi (44→19 slots) convertidos al modelo slot+variantes reagrupando por regla + autorando 14 variantes nuevas por quórum cross-vendor; migración `schemaVersion 7→8` con reset selectivo de ambas categorías. 9/9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests. Brownfield: reutiliza toda la maquinaria v1.4 sin tocar el motor. Ver [milestones/v1.5-ROADMAP.md](./milestones/v1.5-ROADMAP.md).
- ✅ **v1.6 — Conversión a slots: categorías restantes (CONV-01 cierre)** — Phases 21-27 (shipped 2026-06-09). Las 6 categorías legacy restantes (Avere, Essere, Verbi di movimento + Genere e numero, Professioni, Sostantivi irregolari) convertidas al modelo slot+variantes + migración `8→9` con reset selectivo de las 6. **CONV-01 CERRADO: las 9 categorías de gramática en formato unificado.** 14/14 requirements (2 MIG + 6×2 conversión), 374/374 tests. Ver [milestones/v1.6-ROADMAP.md](./milestones/v1.6-ROADMAP.md).
- 🚧 **v1.7 — Presente regolare (10ª categoría de gramática)** — Phases 29-31 (ACTIVE). Alta de la categoría `presente-regolare` (conjugación del presente indicativo de verbos regulares) nacida directamente en formato slot+variantes: slots de regla `-are`/`-ere`/`-ire` simple/`-ire` con `-isc-`/ortográficos `-care-gare`/`-ciare-giare`, variantes nuevas por quórum cross-vendor R1-R7, cruces multi-cat con avere/essere (contraste passato prossimo), migración con reset selectivo SOLO de la categoría nueva + integración lockstep (counts/TOTAL_EXPECTED/smoke). Brownfield puro: motor v1.4 NO se toca. 11 requirements (7 PRES + 2 MIG + 2 INT). Numeración EMPIEZA en Phase 29 (Phase 28 ya existe — trabajo huérfano "responsive-mobile" archivado).

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

<details>
<summary>✅ v1.6 (Phases 21-27) — SHIPPED 2026-06-09 (CONV-01 CERRADO)</summary>

- [x] Phase 21: Migración `8→9` (reset selectivo de las 6 categorías) (1/1 plan) — completed 2026-06-05
- [x] Phase 22: Avere a slots (contenido) (3/3 plans) — completed 2026-06-05 (23→19 slots)
- [x] Phase 23: Essere a slots (contenido) (3/3 plans) — completed 2026-06-08 (39→26 slots, TOTAL_EXPECTED 320→307)
- [x] Phase 24: Verbi di movimento a slots (contenido) (3/3 plans) — completed 2026-06-08 (37→7 slots, regla de auxiliar)
- [x] Phase 25: Genere e numero a slots (contenido) (3/3 plans) — completed 2026-06-08 (40→12 slots)
- [x] Phase 26: Professioni a slots (contenido, léxica) (3/3 plans) — completed 2026-06-08 (51→11 slots, híbrida; 249→209)
- [x] Phase 27: Sostantivi irregolari a slots (contenido, léxica) (3/3 plans) — completed 2026-06-09 (31→5 slots, híbrida; 209→183; CONV-01 cerrado)

**Total:** 7 fases, 19 plans, 14/14 requirements (2 MIG + 6×2 conversión), 374/374 tests verdes (383/383 con `VAL_07_STRICT=1`). Las 6 categorías legacy restantes convertidas a slot+variantes (reagrupar por regla + autorar variantes nuevas por quórum cross-vendor R1-R7) + migración `8→9` con reset selectivo de las 6 (`schemaVersion 8→9`). Léxicas (Professioni, Sostantivi irregolari) resueltas como HÍBRIDAS (bloque regla con variantes + bloque léxico/contraste sin autoría). Brownfield puro contenido + migración: motor v1.4 NO tocado. **CONV-01 CERRADO: 9/9 categorías de gramática en formato slot+variantes unificado.** Detalles en `.planning/milestones/v1.6-ROADMAP.md`.

</details>

<details>
<summary>📦 Phase 28 — Responsive / mobile-friendly (huérfana, archivada)</summary>

Phase 28 fue trabajo huérfano de UI responsive (`@media (max-width: 640px)`, tabla→tarjetas, touch 44px) ejecutado fuera de milestone tras v1.6 y archivado en `.planning/milestones/orphan-phases/28-responsive-mobile/`. NO pertenece a v1.7. Por eso la numeración de v1.7 EMPIEZA en Phase 29 (NO reutiliza el 28).

</details>

### 🚧 v1.7 — Presente regolare (10ª categoría de gramática) — ACTIVE

Numeración EMPIEZA en **Phase 29** (NO en 28 — Phase 28 ya existe como trabajo huérfano "responsive-mobile" archivado; la numeración no se reutiliza). **Brownfield puro contenido + migración:** toda la maquinaria slot+variantes del motor v1.4 (`normalizeExerciseToSlot`, `pickVariantIndex`, getter slot-aware con `.payload` sintético, sampler por slot, cascada D-54 con 2 call-sites de `applyImmediateFailure`, smoke paramétrico bifurcado por shape) YA EXISTE y NO se toca. Diferencia clave vs v1.5/v1.6: aquí se da de ALTA una categoría NUEVA (no se convierte una existente), nacida directamente en formato slot+variantes (NO legacy de 1 variante). Patrón replicado: v1.2 (alta de Articoli/Partitivi: registrar categoría → autorar ejercicios → quórum → integración lockstep) + el patrón slot de v1.6 (regroup por regla → variantes por quórum → sync de counts). 3 fases coarse: migración primero (desbloquea el reset selectivo), luego alta de slots + autoría por quórum, luego cruces multi-cat + integración lockstep.

**NOTA DE NUMERACIÓN DE SCHEMA (discrepancia REQUIREMENTS vs codebase):** REQUIREMENTS.md (MIG-05/06) asume migración `9→10`, pero `CURRENT_SCHEMA_VERSION` YA está en **10** (un quick task posterior — `260615-nzi`, contador `vecesFallada` — introdujo un `migrate9to10`/`hydrateV10` nominal). Por tanto la migración de reset selectivo de v1.7 va realmente **`10→11`** (`migrate10to11`/`hydrateV11`/`CURRENT_SCHEMA_VERSION=11`). El roadmap usa la numeración REAL del codebase (`10→11`); los IDs de requisito (MIG-05/06) se mantienen.

- [x] **Phase 29: Migración `10→11` (reset selectivo SOLO de `presente-regolare`)** — `migrate10to11`/`hydrateV11` + `CURRENT_SCHEMA_VERSION=11` idempotentes + deep-clone anti-prototype-pollution; reset de progreso SOLO de `presente-regolare` (predicado de 1 prefijo); las 9 categorías existentes + canciones byte-intactas (verificado por fixture); `backup.js` round-trip v11 + import v10→v11 + rechazo `>11`. Va PRIMERA: deja el state listo para que la categoría nueva nazca limpia. (MIG-05, MIG-06) — ✅ COMPLETA 2026-06-16
- [ ] **Phase 30: Alta de `presente-regolare` (registro + slots de regla + variantes por quórum)** — Registrar la categoría en `categories.json` (order 10) + crear `content/exercises/presente-regolare.json` nacido en slot+variantes con los slots de regla (`-are`/`-ere`/`-ire` simple/`-ire` con `-isc-`/ortográficos `-care-gare`/`-ciare-giare`), ≥2 variantes intercambiables por slot, explanation a nivel de slot (canon español acentuado), tipos multi-choice + word-buttons + match (match SOLO si NO derivable por raíz, D-04); autorar TODAS las variantes y pasarlas por quórum cross-vendor R1-R7 (`status: validated`; disputed por autor-oráculo). (PRES-01, PRES-02, PRES-03, PRES-04, PRES-05, PRES-06)
- [ ] **Phase 31: Cruces multi-cat + integración lockstep (cierre v1.7)** — Cruces `presente-regolare`↔avere/essere (contraste presente vs passato prossimo) con cascada D-54 inmediata (patrón avere-300..305); re-sincronizar los counts hardcoded + `TOTAL_EXPECTED` (183 → 183 + N slots de la categoría nueva) + +1 entrada en el smoke paramétrico (`CATEGORIES_WITH_EXPLANATIONS` + validación de contenido); suite verde completa incluido `VAL_07_STRICT=1`. Cierra v1.7 (10ª categoría usable end-to-end). (PRES-07, INT-01, INT-02)

## Phase Details

### Phase 29: Migración `10→11` (reset selectivo SOLO de `presente-regolare`)

**Goal**: El state migra de `schemaVersion 10` a `11` reservando un slug de reset SOLO para `presente-regolare`, dejando las 9 categorías de gramática existentes + el bloque Canciones byte-intactos, y dejando el state listo para que la categoría nueva nazca limpia (no-hecha, racha 0) — replicando el patrón `migrate8to9`/`hydrateV9` de v1.6 pero con un predicado de UN solo prefijo. (NOTA: target real `10→11` porque el codebase ya está en schemaVersion 10 tras el quick task `260615-nzi`; REQUIREMENTS MIG-05 dice `9→10` asumiendo el estado pre-quick-task.)
**Depends on**: Phase 27 (último estado shipped v1.6) + el quick task `260615-nzi` (que ya bumpeó a schemaVersion 10). Verificar en plan-time el valor REAL de `CURRENT_SCHEMA_VERSION` antes de escribir el número de migración.
**Requirements**: MIG-05, MIG-06
**Success Criteria** (what must be TRUE):

  1. Tras la migración (`migrate10to11` + `hydrateV11`, idempotente + deep-clone defensivo anti-prototype-pollution, bump de `CURRENT_SCHEMA_VERSION` espejo en `storage.js` + `backup.js`) cualquier progreso bajo el prefijo `presente-regolare` queda reseteado a no-hecha con racha 0: `categoryProgress` borrado, `exerciseStats` filtrado por el prefijo, `inFlightTest` invalidado si lo contiene. (El reset es preventivo: en la práctica el state aún no tiene esa categoría, pero el round-trip de un backup futuro debe quedar cubierto.)
  2. Las 9 categorías de gramática existentes (`preposiciones`, `articoli`, `partitivos`, `avere`, `essere`, `verbos-movimiento`, `genero-numero`, `profesiones`, `sustantivos-irregulares`) y el bloque Canciones (`songProgress`) conservan su progreso byte-intacto tras migrar (verificable por test con fixture de las 9 categorías + canciones).
  3. `backup.js` exporta v11 reimportable round-trip; un backup v10 importado migra a v11 aplicando el reset selectivo de `presente-regolare`; los backups `>11` se rechazan (forward-compat).
  4. La app arranca limpia sobre el state migrado y los tests siguen verdes (los baseline + los nuevos de la cadena v11).

**Plans**: 1 plan
- [x] 29-01-PLAN.md — `migrate10to11`/`hydrateV11`/`RESET_PREFIXES_V11`/`CURRENT_SCHEMA_VERSION=11` espejo de migrate8to9 (1 prefijo) + bump backup.js round-trip v11/import v10→v11/reject >11 + tests de la cadena v11 (reset, byte-intacto de las 9 + songProgress, idempotencia, pureza, anti-prototype-pollution) — ✅ 2026-06-16 (96/96 storage + 44/44 backup verdes; +20 tests netos; 0 regresiones nuevas)

**UI hint**: no

### Phase 30: Alta de `presente-regolare` (registro + slots de regla + variantes por quórum)

**Goal**: La categoría `presente-regolare` se da de alta nacida directamente en formato slot+variantes — registrada en `categories.json` (order 10) y materializada en `content/exercises/presente-regolare.json` con los slots de regla que cubren los tres grupos verbales + la sub-regla trampa `-isc-` + los ortográficos, cada slot con ≥2 variantes intercambiables y explanation a nivel de slot; todas las variantes nuevas pasan el quórum cross-vendor R1-R7. Es el corazón del milestone (el cimiento verbal A1 que faltaba).
**Depends on**: Phase 29 (la migración deja reservado el reset de `presente-regolare`; la categoría nace sobre el state v11). Independiente de Phase 31 salvo que Phase 31 consume su estructura final.
**Requirements**: PRES-01, PRES-02, PRES-03, PRES-04, PRES-05, PRES-06
**Success Criteria** (what must be TRUE):

  1. La categoría `presente-regolare` aparece en `content/categories.json` con `order: 10`, carga en boot y es usable en home / picker / Repaso 20 / Examen exactamente como las otras 9 categorías (el autor puede lanzar un Examen de SOLO `presente-regolare` con 1 clic).
  2. Los slots de regla cubren los tres grupos + la sub-regla trampa + los ortográficos: `-are` · `-ere` · `-ire` simple (dormire/partire/aprire) · `-ire` con `-isc-` (finire/capire/preferire/pulire) · ortográficos `-care/-gare` (giochi/paghi) y `-ciare/-giare` (cominci/mangi). Cada slot de regla tiene ≥2 variantes intercambiables (multi-choice y/o word-buttons), de modo que re-hacer la categoría tras un fallo puede presentar una variante distinta del mismo slot (mata la memorización por palabra).
  3. Cada slot tiene `explanation` curada a nivel de slot en canon ortográfico español acentuado (regla + ejemplo paralelo italiano-español, plain text, apóstrofes ASCII), coherente con la cobertura editorial 100% de las 9 categorías existentes.
  4. Todas las variantes nuevas pasan el quórum cross-vendor R1-R7 (`status: validated`, ≥4× correcta 0 incorrecta, 1-por-1 NUNCA batched; los `disputed` se resuelven por el autor-oráculo con audit trail). Se incluyen ejercicios `match` SOLO si el pareo NO es derivable por raíz (DESIGN RULE D-04); si todo es derivable por raíz (io→parlo) la categoría queda en multi-choice + word-buttons con 0 match (como Avere/Essere) y se documenta explícitamente.

**Plans**: 3 plans (1 autoría + 1 quórum + 1 verificación)
- [x] 30-01-PLAN.md — registrar categoría (order 10) + autorar presente-regolare.json (6 slots de regla + variantes + explanations + notes 0-match)
- [ ] 30-02-PLAN.md — validar por quórum cross-vendor R1-R7 1-por-1 los 6 slots (status validated; disputed por autor-oráculo)
- [ ] 30-03-PLAN.md — boot/load + schema-validator + suite baseline verde; registrar N=6 para Phase 31

**UI hint**: no

### Phase 31: Cruces multi-cat + integración lockstep (cierre v1.7)

**Goal**: `presente-regolare` queda enganchada al motor de re-verificación mediante cruces multi-cat con avere/essere (contraste presente vs passato prossimo, cascada D-54 inmediata) y totalmente integrada en lockstep — counts hardcoded + `TOTAL_EXPECTED` re-sincronizados al nº real de slots + 1 entrada nueva en el smoke paramétrico — con la suite verde completa. Cierra el milestone v1.7 (10ª categoría usable end-to-end).
**Depends on**: Phase 30 (necesita la estructura final de slots de `presente-regolare` para contar slots, enganchar cruces y añadir la entrada al smoke). Phase 29 (state v11).
**Requirements**: PRES-07, INT-01, INT-02
**Success Criteria** (what must be TRUE):

  1. Existen cruces multi-cat `presente-regolare`↔avere/essere (contraste con el passato prossimo) con `categoryIds[]` de 2 categorías e id estable (patrón avere-300..305); fallar uno propaga la cascada D-54 inmediata reseteando las categorías cruzadas, y la cascada sigue con exactamente 2 call-sites de `applyImmediateFailure` (verificable por grep — el motor NO se toca).
  2. Los counts hardcoded + `TOTAL_EXPECTED` quedan re-sincronizados (183 → 183 + N slots de la categoría nueva) en los 3 hardcodes (`tests/exercise-types.test.js`, `tests/fixtures/slot-variants-integration.test.js`, `scripts/run-validation-271.mjs`) + `TOTAL_EXPECTED`, leídos del nº REAL de slots del JSON (no estimación).
  3. Hay +1 entrada en el smoke paramétrico (`CATEGORIES_WITH_EXPLANATIONS` + validación de contenido) cubriendo `presente-regolare`; la suite verde completa pasa, incluido `VAL_07_STRICT=1`, y el reporter VAL-06 cuenta la categoría nueva (todas las variantes `validated`, 0 disputed sin resolver).

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
| 21-27 | v1.6 | 19/19 | Complete | 2026-06-09 |
| 29. Migración `10→11` (reset `presente-regolare`) | v1.7 | 1/1 | Complete | 2026-06-16 |
| 30. Alta de `presente-regolare` (slots + variantes por quórum) | v1.7 | 1/3 | In Progress|  |
| 31. Cruces multi-cat + integración lockstep | v1.7 | 0/? | Not started | - |

## Backlog

### Tiempos verbales y categorías derivadas (post-v1.7)

**Status:** Backlog. v1.7 entrega el presente regular (`presente-regolare`). Diferidos a milestones futuros conforme la profesora entregue material: **TENSE-X1..X4** (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo), **REFLEX-01** (verbi riflessivi — chiamarsi/svegliarsi/alzarsi, apoyado sobre el presente regular de v1.7), **MODAL-01** (verbi modali potere/volere/dovere + infinitivo), **PASSPROX-01** (passato prossimo como categoría dedicada — elección de auxiliar + participio). Verbos IRREGULARES en presente (andare/fare/venire/dire…) son categoría aparte (out-of-scope explícito de v1.7).

### CONV-01 — ✅ CERRADO en v1.6

**Status:** ✅ COMPLETO (cerrado 2026-06-09). Las 9 categorías de gramática están en formato slot+variantes unificado. v1.7 da de alta la 10ª (`presente-regolare`) nacida directamente en ese formato (no requiere conversión). Las dos léxicas (Professioni, Sostantivi irregolari) se resolvieron como HÍBRIDAS. El motor v1.4 nunca se tocó.

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4/v1.5/v1.6/v1.7 las variantes se autoran a mano + quórum (patrón D-85).

### Categorización asistida de frases de canciones (CATPROC — diferido a milestone futuro)

**Status:** Backlog post-v1.3. CATPROC-01 (un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas) + CATPROC-02 (el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas). El modelo de datos v1.3 (LINK-03) YA soporta frases sin categoría para no bloquear esto.

### Más canciones (MUSIC-X1 — diferido)

**Status:** Backlog post-v1.3. Añadir más canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3. (Validador de frases ES por quórum S1-S5 ya disponible — quick task `260615-vkr`, 83/83 validated.)

### Bridges multi-cat Partitivos + responsive móvil

**Status:** Backlog. Bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2). Responsive móvil ya ejecutado parcialmente como trabajo huérfano (Phase 28, archivada) — re-evaluar si se reactiva como milestone formal.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — detalles en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — detalles en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 shipped 2026-05-28 — detalles en `.planning/milestones/v1.2-ROADMAP.md`.*
*Milestone v1.3 shipped 2026-06-02 — Phases 13-14 (numeración CONTINÚA desde Phase 12). Bloque Canciones: 19 requirements, 306/306 tests, brownfield sobre el engine v1.0. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.*
*Milestone v1.4 shipped 2026-06-03 — Phases 15-17 (numeración CONTINÚA desde Phase 14). Variantes de ejercicio (slots por regla): motor slot+variantes + piloto Preposiciones. 17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests. Detalles en `.planning/milestones/v1.4-ROADMAP.md`.*
*Milestone v1.5 shipped 2026-06-05 — Phases 18-20 (numeración CONTINÚA desde Phase 17). Conversión a slots: Bloque Artículos (CONV-01): Articoli (56→34 slots) + Partitivi (44→19 slots) a slots+variantes + migración 7→8 reset selectivo. 9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests, `schemaVersion 7→8`. Detalles en `.planning/milestones/v1.5-ROADMAP.md`.*
*Milestone v1.6 shipped 2026-06-09 — Phases 21-27 (numeración CONTINÚA desde Phase 20). Conversión a slots: categorías restantes (CONV-01 cierre): las 6 categorías legacy convertidas a slot+variantes, 1 fase por categoría + migración 8→9 reset selectivo de las 6. 14/14 requirements (2 MIG + 6×2 conversión), 374/374 tests (383/383 strict), `schemaVersion 8→9`. **CONV-01 CERRADO: 9/9 categorías de gramática en formato slot+variantes unificado.** Motor v1.4 NO tocado. Detalles en `.planning/milestones/v1.6-ROADMAP.md`.*
*Milestone v1.7 abierto 2026-06-16 — Phases 29-31 (numeración EMPIEZA en 29, NO en 28 — Phase 28 ya existe como trabajo huérfano "responsive-mobile" archivado en `.planning/milestones/orphan-phases/`; la numeración no se reutiliza). Presente regolare (10ª categoría de gramática): alta de `presente-regolare` nacida directamente en slot+variantes (slots de regla -are/-ere/-ire/-isc-/ortográficos, variantes por quórum cross-vendor R1-R7, cruces multi-cat con avere/essere) + migración con reset selectivo SOLO de la categoría nueva + integración lockstep. 11 requirements (7 PRES + 2 MIG + 2 INT), 11/11 mapped, 0 orphans. **Brownfield puro contenido + migración: motor v1.4 NO tocado.** Phase 29 (migración) → Phase 30 (alta + slots + variantes por quórum) → Phase 31 (cruces multi-cat + integración lockstep). DISCREPANCIA: la migración va `10→11` (no `9→10` como dice MIG-05) porque el codebase ya está en schemaVersion 10 tras el quick task `260615-nzi`; los stubs de backlog `999.1`/`999.2` en `.planning/phases/` quedan intactos (no son fases de este milestone).*
