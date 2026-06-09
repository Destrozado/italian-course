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

## Phase Details

_Las fases del milestone v1.6 (shipped) están archivadas en `.planning/milestones/v1.6-ROADMAP.md`. No hay fases activas — próximo milestone vía `/gsd:new-milestone`._

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
| 26. Professioni a slots (contenido, léxica) | v1.6 | 3/3 | Complete    | 2026-06-08 |
| 27. Sostantivi irregolari a slots (contenido, léxica) | v1.6 | 3/3 | Complete    | 2026-06-09 |

## Backlog

### Conversión del resto de categorías a slots (CONV-01 — ✅ CERRADO en v1.6)

**Status:** ✅ COMPLETO (cerrado 2026-06-09). Las 9 categorías de gramática están en formato slot+variantes unificado: Preposiciones (v1.4) + Articoli + Partitivi (v1.5) + Avere, Essere, Verbi di movimento, Genere e numero, Professioni, Sostantivi irregolari (v1.6, Phases 22-27). Las dos léxicas (Professioni, Sostantivi irregolari) se resolvieron como HÍBRIDAS (bloque regla con variantes + bloque léxico/contraste sin autoría — no se forzaron variantes artificiales). Migraciones de reset selectivo `6→7→8→9`. El motor v1.4 nunca se tocó.

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
*Milestone v1.6 shipped 2026-06-09 — Phases 21-27 (numeración CONTINÚA desde Phase 20). Conversión a slots: categorías restantes (CONV-01 cierre): las 6 categorías legacy (avere, essere, verbos-movimiento, genero-numero, profesiones, sustantivos-irregulares) convertidas a slot+variantes, 1 fase por categoría + migración 8→9 reset selectivo de las 6. 14/14 requirements (2 MIG + 6×2 conversión), 374/374 tests (383/383 strict), `schemaVersion 8→9`. Léxicas (Professioni, Sostantivi irregolari) resueltas como HÍBRIDAS. **CONV-01 CERRADO: 9/9 categorías de gramática en formato slot+variantes unificado.** Motor v1.4 NO tocado. Detalles en `.planning/milestones/v1.6-ROADMAP.md`.*
