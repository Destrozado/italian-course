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
- ✅ **v1.7 — Presente regolare (10ª categoría de gramática)** — Phases 29-31 (shipped 2026-06-17). Alta de la 10ª categoría `presente-regolare` (presente indicativo de verbos regulares) nacida directamente en slot+variantes + cruces multi-cat ↔ avere/essere (contraste passato prossimo, cascada D-54) + migración `10→11` reset selectivo + integración lockstep. 11/11 requirements (7 PRES + 2 MIG + 2 INT), suite 473/474 (483/484 strict). Brownfield: motor v1.4 NO tocado. Ver [milestones/v1.7-ROADMAP.md](./milestones/v1.7-ROADMAP.md).
- ✅ **v1.8 — Rediseño visual "Editoriale"** — Phases 32-34 (shipped 2026-06-30). Lenguaje Editoriale (papel cálido, serif Spectral, acento verde/rojo, fuentes auto-hospedadas) aplicado a las 8 pantallas sobre el stack real (vanilla + Alpine; Pico ELIMINADO en Phase 32, `app.css` es la base). Brownfield UI puro: motor NO tocado. 19/19 requirements. Ver [milestones/v1.8-ROADMAP.md](./milestones/v1.8-ROADMAP.md).
- ✅ **v1.9 — Determinantes + verbos A1/A2 (4 categorías nuevas + procedencia)** — Phases 35-39 (shipped 2026-07-01). 4 categorías nuevas A1/A2 (Dimostrativi, Possessivi, Verbi modali, Verbi riflessivi) autoradas por quórum cross-vendor R1-R7 + PROV-01 marca de procedencia + migración 11→12 + lockstep de conteos; 14 categorías verdes (suite 624, strict 638). Motor v1.4 NO tocado. Ver [milestones/v1.9-ROADMAP.md](./milestones/v1.9-ROADMAP.md).

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

<details>
<summary>✅ v1.7 (Phases 29-31) — SHIPPED 2026-06-17 (10ª categoría presente-regolare)</summary>

- [x] Phase 29: Migración `10→11` (reset selectivo de `presente-regolare`) (1/1 plan) — completed 2026-06-16
- [x] Phase 30: Alta de `presente-regolare` (registro + slots + variantes por quórum) (3/3 plans) — completed 2026-06-17 (8 objetos / 18 variantes / 8 validated)
- [x] Phase 31: Cruces multi-cat + integración lockstep (cierre) (2/2 plans) — completed 2026-06-17 (4 cruces ↔ avere/essere; TOTAL_EXPECTED 183→195)

**Total:** 3 fases, 6 plans, 11/11 requirements (7 PRES + 2 MIG + 2 INT), suite 473/474 (483/484 con `VAL_07_STRICT=1`; único fail preexistente AJENO genero-numero). Alta de la 10ª categoría `presente-regolare` (presente indicativo de verbos regulares) nacida directamente en slot+variantes (slots `-are`/`-ere`/`-ire`/`-isc-`/ortográficos) + cruces multi-cat ↔ avere/essere (contraste passato prossimo, cascada D-54) + migración `10→11` reset selectivo + integración lockstep. Brownfield puro: motor v1.4 NO tocado. NOTA: reporter VAL-06 global en FAIL (197/195) por 2 discrepancias de conteo PREEXISTENTES AJENAS (genero-numero, preposiciones); presente-regolare aporta 12=12 sin discrepancia. Detalles en `.planning/milestones/v1.7-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.8 (Phases 32-34) — SHIPPED 2026-06-30 (Rediseño visual "Editoriale")</summary>

- [x] Phase 32: Cimientos visuales + Home/Categorías (3/3 plans) — completed 2026-06-30
- [x] Phase 33: Pantallas de ejercicio (4/4 plans) — completed 2026-06-30
- [x] Phase 34: Canciones · Resultados · Picker (5/5 plans) — completed 2026-06-30

**Total:** 3 fases, 12 plans, 19/19 requirements (4 FND + 6 HOME + 5 EX + 4 SRP), suite 574/575 (único fail preexistente AJENO genero-numero). Lenguaje **Editoriale** aplicado a las 8 pantallas (papel cálido `#f4f0e8` + serif Spectral/Hanken/Space Grotesk auto-hospedadas + acento verde `#2f7d56`/rojo `#b5412e`) sobre el stack real (vanilla + Alpine; **Pico ELIMINADO en Phase 32**, `app.css` es la base). Brownfield UI puro: motor (cascada D-54, sampler, slot-engine, localStorage, schema, migraciones) NO tocado. Desviaciones conscientes: flujo 1-paso / por-pareja conservado (D-01/D-03); sin fracción de huecos ni "Nivel" en canciones (D-02/D-06, sin dato fuente). Audit `passed` (19/19 reqs · integración 47/47 · 5/5 E2E flows). Detalles en `.planning/milestones/v1.8-ROADMAP.md`.

</details>

<details>
<summary>✅ v1.9 (Phases 35-39) — SHIPPED 2026-07-01</summary>

- [x] Phase 35: Migración 11→12 (reset selectivo preventivo) (1/1 plans) — completed 2026-07-01
- [x] Phase 36: Dimostrativi + Possessivi (4/4 plans) — completed 2026-07-01
- [x] Phase 37: Verbi modali (1/1 plan) — completed 2026-07-01
- [x] Phase 38: Verbi riflessivi (2/2 plans) — completed 2026-07-01
- [x] Phase 39: PROV-01 + integración lockstep (2/2 plans) — completed 2026-07-02

**Total:** 5 fases, 10 plans, 14 categorías / 225 slots, 25/25 requirements (5 DEMOS + 5 POSS + 2 MODAL + 5 REFLEX + 2 PROV + 2 MIG + 4 INT), suite 624/624 (638 strict).
</details>

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
| 29-31 | v1.7 | 6/6 | Complete | 2026-06-17 |
| 32-34 | v1.8 | 12/12 | Complete | 2026-06-30 |
| 35. Migración `11→12` | v1.9 | 1/1 | Complete    | 2026-07-01 |
| 36. Dimostrativi + Possessivi | v1.9 | 4/4 | Complete   | 2026-07-01 |
| 37. Verbi modali | v1.9 | 1/1 | Complete   | 2026-07-01 |
| 38. Verbi riflessivi | v1.9 | 2/2 | Complete   | 2026-07-01 |
| 39. PROV-01 + integración lockstep | v1.9 | 2/2 | Complete   | 2026-07-02 |

## Backlog

### 🎯 Determinantes + verbos A1/A2 — ✅ PROMOVIDO a v1.9 (ACTIVE)

**Status:** ✅ PROMOVIDO 2026-07-01 → milestone **v1.9 ACTIVE** (Phases 35-39, ver §🚧 v1.9 — ACTIVE). Este candidato (acordado 2026-07-01) es ahora el milestone en curso. Las 4 categorías nuevas A1/A2 (Dimostrativi, Possessivi, Verbi modali, Verbi riflessivi) autoradas por quórum R1-R7 en slot+variantes + PROV-01 marca de procedencia transversal. **Scope decidido en requirements:** MODAL passato prossimo DIFERIDO (ver "Tiempos verbales" abajo); REFLEX passato prossimo con essere+concordancia INCLUIDO; PROV legacy `origen` AUSENTE (procedencia mixta, no se etiqueta en grueso). Motor v1.4 intacto (brownfield puro de contenido). Numeración de fases CONTINÚA desde Phase 34.

### Tiempos verbales y categorías derivadas (post-v1.7)

**Status:** Backlog. v1.7 entregó el presente regular (`presente-regolare`); v1.9 entrega Modali + Riflessivi. Diferidos a milestones futuros conforme la profesora entregue material:

- **MODAL-PP-01** (NUEVO, diferido por decisión en v1.9): passato prossimo de los modales con auxiliar PRESTADO del infinitivo (`ho dovuto lavorare` vs `sono dovuto andare`) — A2 sutil, pantano de doble-validez; va al milestone de tiempos pesados, NO a v1.9.
- **TENSE-X1..X4**: Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — milestone SEPARADO conforme la profesora entregue material.
- **PASSPROX-01**: passato prossimo como categoría dedicada (elección de auxiliar + participio).

Verbos IRREGULARES en presente (andare/fare/venire/dire…) son categoría aparte (out-of-scope explícito de v1.7). Reflexivos recíprocos (`si amano`, `ci scriviamo` "el uno al otro") y modal + clítico (`voglio farlo`/`lo voglio fare`) diferidos a un milestone posterior de pronombres (out-of-scope de v1.9).

### Procedencia — granularidad fina (PROV-X1 — diferido)

**Status:** Backlog post-v1.9. **PROV-X1**: marca de procedencia por-slot o por-variante para representar con honestidad la mezcla del legado (aumentos por quórum sobre base de PDF de la profesora en v1.4-v1.7). v1.9 estampa `origen` solo a nivel de categoría en las 4 nuevas (nacidas `ia-quorum` puras) y deja las 10 legacy con `origen` AUSENTE (etiquetarlas en grueso mentiría, ver PROV-02). La granularidad fina es diferida: coste de validador + etiquetado retroactivo alto; category-level absente basta para v1.9.

### CONV-01 — ✅ CERRADO en v1.6

**Status:** ✅ COMPLETO (cerrado 2026-06-09). Las 9 categorías de gramática están en formato slot+variantes unificado. v1.7 dio de alta la 10ª (`presente-regolare`); v1.9 da de alta la 11ª-14ª (Dimostrativi/Possessivi/Modali/Riflessivi), todas nacidas directamente en ese formato (no requieren conversión). Las dos léxicas (Professioni, Sostantivi irregolari) se resolvieron como HÍBRIDAS. El motor v1.4 nunca se tocó.

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4/v1.5/v1.6/v1.7 (y v1.9) las variantes se autoran a mano + quórum (patrón D-85).

### Categorización asistida de frases de canciones (CATPROC — diferido a milestone futuro)

**Status:** Backlog post-v1.3. CATPROC-01 (un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas) + CATPROC-02 (el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas). El modelo de datos v1.3 (LINK-03) YA soporta frases sin categoría para no bloquear esto.

### Más canciones (MUSIC-X1 — diferido)

**Status:** Backlog post-v1.3. Añadir más canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3. (Validador de frases ES por quórum S1-S5 ya disponible — quick task `260615-vkr`, 83/83 validated; 10 canciones reales ya en el bloque a 2026-06-30.)

### decoyBank.pos multi-categoría por token (DECOY-X1 — diferido)

**Status:** Backlog post-`260727-dcy`. **DECOY-X1**: `decoyBank.pos` está indexado por TEXTO de palabra, así que un token repetido en `answer` con función distinta solo admite UNA etiqueta POS (caso real y único del corpus: `22-settembre-009`, "Io la vita la prendo com'è" → `la` artículo + `la` pronombre). El autor decidió (2026-07-27) **aceptar el `disputed`** (opción A): la frase es jugable igual —el modo agrupado no lee `decoyBank.validation`— y es 1 de 311 frases únicas convertidas. La opción B (`pos` acepta `string | string[]`, `groupTokens` reparte por índice, D1 reescrita, round-trip de `serDecoyBank`) queda **diferida hasta que el patrón reaparezca** en una canción nueva. Detalle y plan de ataque en `.planning/todos/pending/decoybank-pos-multi-categoria.md`.

### Bridges multi-cat Partitivos + responsive móvil

**Status:** Backlog. Bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2). Responsive móvil ya ejecutado parcialmente como trabajo huérfano (Phase 28, archivada) + capa `@media (max-width: 640px)` shippeada como quick tasks; el responsive completo de las pantallas Editoriale (tamaño de prompt + breakpoints) queda diferido de v1.8 (desktop-only por diseño) — re-evaluar si se reactiva como milestone formal.

---
*Roadmap created: 2026-05-23*
*Milestone v1.0 shipped 2026-05-25 — detalles en `.planning/milestones/v1.0-ROADMAP.md`.*
*Milestone v1.1 shipped 2026-05-27 — detalles en `.planning/milestones/v1.1-ROADMAP.md`.*
*Milestone v1.2 shipped 2026-05-28 — detalles en `.planning/milestones/v1.2-ROADMAP.md`.*
*Milestone v1.3 shipped 2026-06-02 — Phases 13-14 (numeración CONTINÚA desde Phase 12). Bloque Canciones: 19 requirements, 306/306 tests, brownfield sobre el engine v1.0. Detalles en `.planning/milestones/v1.3-ROADMAP.md`.*
*Milestone v1.4 shipped 2026-06-03 — Phases 15-17 (numeración CONTINÚA desde Phase 14). Variantes de ejercicio (slots por regla): motor slot+variantes + piloto Preposiciones. 17 requirements (6 SLOT + 6 EXAM + 5 PILOT), 342/342 tests. Detalles en `.planning/milestones/v1.4-ROADMAP.md`.*
*Milestone v1.5 shipped 2026-06-05 — Phases 18-20 (numeración CONTINÚA desde Phase 17). Conversión a slots: Bloque Artículos (CONV-01): Articoli (56→34 slots) + Partitivi (44→19 slots) a slots+variantes + migración 7→8 reset selectivo. 9 requirements (4 ART + 3 PART + 2 MIG), 358/358 tests, `schemaVersion 7→8`. Detalles en `.planning/milestones/v1.5-ROADMAP.md`.*
*Milestone v1.6 shipped 2026-06-09 — Phases 21-27 (numeración CONTINÚA desde Phase 20). Conversión a slots: categorías restantes (CONV-01 cierre): las 6 categorías legacy convertidas a slot+variantes, 1 fase por categoría + migración 8→9 reset selectivo de las 6. 14/14 requirements (2 MIG + 6×2 conversión), 374/374 tests (383/383 strict), `schemaVersion 8→9`. **CONV-01 CERRADO: 9/9 categorías de gramática en formato slot+variantes unificado.** Motor v1.4 NO tocado. Detalles en `.planning/milestones/v1.6-ROADMAP.md`.*
*Milestone v1.7 shipped 2026-06-17 — Phases 29-31 (numeración EMPIEZA en 29, NO en 28 — Phase 28 ya existe como trabajo huérfano "responsive-mobile" archivado en `.planning/milestones/orphan-phases/`; la numeración no se reutiliza). Presente regolare (10ª categoría de gramática): alta nacida directamente en slot+variantes + migración con reset selectivo + integración lockstep. 11 requirements (7 PRES + 2 MIG + 2 INT), 11/11 mapped, 0 orphans. **Brownfield puro contenido + migración: motor v1.4 NO tocado.** La migración fue `10→11` (codebase ya en schemaVersion 10 tras el quick `260615-nzi`).*
*Milestone v1.8 SHIPPED 2026-06-30 — Phases 32-34 (numeración CONTINÚA desde Phase 31). Rediseño visual "Editoriale": brownfield UI puro que aplicó la dirección visual del handoff a las 8 pantallas en el stack real (vanilla + Alpine; Pico eliminado, `app.css` base). 19/19 requirements, audit passed. Motor NO tocado. Detalles archivados en `.planning/milestones/v1.8-ROADMAP.md`.*
*Milestone v1.9 SHIPPED 2026-07-01 — Phases 35-39 (numeración CONTINÚA desde Phase 34). Determinantes + verbos A1/A2: 4 categorías nuevas (Dimostrativi/Possessivi/Modali/Riflessivi) autoradas desde cero por quórum cross-vendor R1-R7 en slot+variantes + PROV-01 marca de procedencia transversal + migración `11→12` + integración lockstep. 25 requirements (5 DEMOS + 5 POSS + 2 MODAL + 5 REFLEX + 2 PROV + 2 MIG + 4 INT). 14 categorías / 225 slots. Suite 624/624 (638 strict). **Brownfield PURO DE CONTENIDO: motor v1.4 NO tocado (cascada D-54 con EXACTAMENTE 2 call-sites).** Detalles archivados en `.planning/milestones/v1.9-ROADMAP.md`.*
