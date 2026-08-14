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
- ✅ **v2.0 — Paradigma completo de `fare` (4 categorías por modo)** — Phases 40-45 (shipped 2026-08-13). El paradigma entero del verbo más frecuente e irregular con un ejercicio por casilla: `fare-indicativo` (8 slots) · `fare-congiuntivo` (5) · `fare-cond-imperativo` (3) · `fare-indefiniti` (6) = **22 slots / 113 variantes** por quórum cross-vendor R1-R7 + migración `12→13` con reset selectivo + integración lockstep, y la Phase 45 pagando la deuda del propio arnés de tests. **18 categorías / 250 slots.** 26/26 requirements, suite 1182/1182 (1200 strict). Motor v1.4 byte-intacto. Ver [milestones/v2.0-ROADMAP.md](./milestones/v2.0-ROADMAP.md).
- 🚧 **v2.1 — Traducción al español por variante (TRAD-X1)** — Phases 46-53 (ACTIVE desde 2026-08-13). Cada variante `multiple-choice` muestra la traducción española de su frase YA RESUELTA al responder — se acierte o se falle — separada de la `explanation`. Campo OPCIONAL en schema (sin migración `13→14`), render en las dos superficies con el motor byte-intacto, validador propio derivado de S1-S6 (NO R1-R7) y **cobertura 100%: 18 categorías / 722 variantes**, atacada por fases de bloques. 22 requirements (3 SCH + 5 REND + 4 TVAL + 7 TRAD + 3 GATE).

**Estado:** v2.1 ACTIVE. La numeración de fases **CONTINÚA desde Phase 45** → **Phases 46-53, sin reset**. Sin fase de research: el diseño quedó cerrado por el autor el 2026-08-13 y todos los precedentes son in-repo (Phases 7 / 7.1 / 7.2 para el patrón campo-opcional-a-todo-el-corpus; `260615-vkr` para el validador de traducción). El candidato hermano **VOCAB-X1** (vocabulario ES↔IT) queda en backlog: se alimenta de los pares ES↔IT que produce este milestone, por eso va después.

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

<details>
<summary>✅ v2.0 (Phases 40-45) — SHIPPED 2026-08-13 (Paradigma completo de `fare`)</summary>

- [x] Phase 40: Migración `12→13` (reset selectivo preventivo de las 4 categorías de `fare`) (1/1 plan) — completed 2026-08-03
- [x] Phase 41: `fare-indicativo` — 8 slots / 48 variantes (2/2 plans) — completed 2026-08-04
- [x] Phase 42: `fare-congiuntivo` — 5 slots / 30 variantes (2/2 plans) — completed 2026-08-06
- [x] Phase 43: `fare-cond-imperativo` + `fare-indefiniti` — 3+6 slots / 35 variantes (2/2 plans) — completed 2026-08-10
- [x] Phase 44: Integración lockstep + cierre v2.0 (4/4 plans) — completed 2026-08-12
- [x] Phase 45: Deuda del arnés de tests (4/4 plans) — completed 2026-08-13

**Total:** 6 fases, 15 plans, 47 tasks, 26/26 requirements, 224 commits. 18 categorías / 250 slots, `schemaVersion 13`. Suite 1182/1182 (1200 strict), reporter exit 0. Motor v1.4 byte-intacto. Audit `tech_debt` (cero blockers). Detalles en `.planning/milestones/v2.0-ROADMAP.md` (incluye el detalle completo de la Phase 45, que esta sección ya no repite).

</details>

### 🚧 v2.1 (Phases 46-53) — ACTIVE desde 2026-08-13

- [x] **Phase 46: Pipeline de traducción end-to-end (piloto Preposiciones)** - Campo opcional + render en acierto y fallo + validador propio + gates verificados por mutación, todo probado sobre las 96 variantes reales de Preposiciones (completed 2026-08-14)
- [ ] **Phase 47: Traducción — bloque Artículos** - Articoli (62) + Partitivos (48) = 110 traducciones autoradas y validadas por quórum
- [ ] **Phase 48: Traducción — paradigma `fare`** - fare-indicativo (54) + congiuntivo (30) + indefiniti (21) + cond-imperativo (17) = 122 traducciones donde el tiempo verbal se reconoce en español
- [ ] **Phase 49: Traducción — morfología** - Genero e numero (60) + Sostantivi irregolari (44) = 104 traducciones sin degenerar en glosa de una palabra
- [ ] **Phase 50: Traducción — léxico y movimiento** - Professioni (55) + Verbi di movimento (54) = 109 traducciones; el bloque más léxico, materia prima directa de VOCAB-X1
- [ ] **Phase 51: Traducción — auxiliares y presente** - Essere (46) + Avere (32) + Presente regolare (25) = 103 traducciones con ser/estar y los idiomáticos de `avere` resueltos sin calco
- [ ] **Phase 52: Traducción — determinantes y verbos A1/A2** - Dimostrativi (22) + Possessivi (21) + Riflessivi (18) + Modali (17) = 78 traducciones que cierran la cobertura del corpus
- [ ] **Phase 53: Cierre v2.1 — cobertura 722/722, gates verdes y motor intacto** - 18/18 categorías validated, suite verde, reporter exit 0 y el motor con el ÚNICO cambio declarado

## Phase Details

### Phase 46: Pipeline de traducción end-to-end (piloto Preposiciones)

**Goal**: Que el autor resuelva un ejercicio de Preposiciones — acertando o fallando — y vea la traducción española de la frase ya resuelta, con el campo, el render, el validador propio y los gates ya montados y demostrados sobre las 96 variantes reales de la categoría piloto. Es la fase que compra el derecho a escalar: un prompt de validación malo o un gate ciego descubierto en la variante 500 es el modo de fallo caro que este proyecto ya ha pagado.

**Depends on**: Nothing (primera fase del milestone; parte del corpus v2.0 intacto — 18 categorías / 250 slots / 722 variantes `multiple-choice`, `schemaVersion 13`)

**Requirements**: SCH-01, SCH-02, SCH-03, REND-01, REND-02, REND-03, REND-04, REND-05, TVAL-01, TVAL-02, TVAL-03, TVAL-04, GATE-01, GATE-02, TRAD-01

**Success Criteria** (what must be TRUE):

  1. **Al fallar, la traducción está ahí y no se confunde con la teoría.** El autor falla un `multiple-choice` con traducción y la ve junto al feedback rojo, visualmente distinguible de la `explanation`; la misma traducción reaparece bajo esa fila en "Errores cometidos" del resumen. Un ejercicio SIN traducción no deja hueco, etiqueta ni placeholder en ninguna de las dos superficies (graceful degradation D-121), y el render es `x-text` — nunca `x-html` (T-02-01).
  2. **Al acertar, la traducción se lee de verdad.** El autor acierta y ve la traducción con tiempo real de leerla. *(Corregido en la discusión de la fase, 2026-08-13: la redacción original hablaba de subir `SESSION_AUTO_ADVANCE_MS` desde 600 ms, pero en los modos de ejercicio **no hay auto-avance** — se eliminó en el quick `260615-r3b`; el avance es manual con «Continuar →» y esa constante solo gobierna el modo canción, fuera de scope. El tiempo de lectura ya es ilimitado, incluido el modo contrarreloj, donde el cronómetro se cancela al responder. El motor queda **byte-intacto**.)* El botón "¿Por qué?" / tecla `e` sigue revelando la `explanation` bajo demanda: la traducción no le roba el sitio ni cambia su comportamiento.
  3. **El schema deja autorar la traducción exactamente donde aporta.** El validator la acepta como string no vacío en variantes `multiple-choice` y la RECHAZA en `match` y `word-buttons`; las 250 slots existentes siguen validando sin ella; `schemaVersion` sigue en 13 y el progreso del autor no se resetea — verificado por test explícito, no por afirmación en un SUMMARY.
  4. **El quórum juzga traducciones con criterios de traducción.** Existe un prompt propio con criterios derivados de los S1-S6 de canciones (fidelidad it→es, acentos RAE según PRES-05, naturalidad, registro) y explícitamente NO R1-R7, más un script hermano de `scripts/validate-song-pass.mjs` que corre el quórum cross-vendor y escribe el pase; cada traducción lleva su `validation.passes[]` y su status sale de `deriveStatus` — misma fuente única que ejercicios y canciones, con el override de autor de primera clase (`override: true`) disponible y sin reimplementaciones locales.
  5. **Preposiciones al 100% y los gates mordiendo, probados por mutación.** Las 96 variantes `multiple-choice` de Preposiciones están traducidas y `validated`. Romper una a propósito (dejarla `pending`, quitarle los acentos) pone ROJO el gate de traducción; declarar la categoría cubierta y NO engancharla al array de cobertura pone ROJO el gate anti-ceguera; el `expected` de cobertura se DERIVA del disco y no está transcrito como número mágico en ningún sitio. Las tres mutaciones se ejecutan y se observa el rojo — leer el código del gate no cuenta como verificación (lección de la Phase 45: cinco gates vacuos, los cinco cazados corriendo la mutación).

**Plans**: 4/5 plans executed en 5 waves (tracer-first: el camino de producto se demuestra sobre UNA frase antes de expandir a las 96)

- [x] 46-01-PLAN.md
- [x] 46-02-PLAN.md
- [x] 46-03-PLAN.md
- [x] 46-04-PLAN.md
- [x] 46-05-PLAN.md

- [ ] `46-01-PLAN.md` — Tracer: la frase canónica atraviesa schema y las DOS superficies (SCH-01..03, REND-01..05)
- [ ] `46-02-PLAN.md` — El validador propio: prompt de traducción + script de quórum con `writePass` re-estrechado (TVAL-01..03)
- [ ] `46-03-PLAN.md` — Gates que muerden: cobertura derivada del disco + anti-ceguera, mutación 3 ejecutada (TVAL-04, GATE-01, GATE-02)
- [ ] `46-04-PLAN.md` — El piloto: 96 traducciones autoradas por subagent-por-slot y validadas por quórum cross-vendor (TRAD-01)
- [ ] `46-05-PLAN.md` — Cierre por mutación: mutaciones 1 y 2 ejecutadas con el rojo observado + verificación visual del autor

**UI hint**: yes

---

### Phase 47: Traducción — bloque Artículos (Articoli + Partitivos)

**Goal**: Que las dos categorías del bloque Artículos muestren la traducción de su frase al resolverse, con las 110 traducciones autoradas y validadas por el quórum y enganchadas al gate de cobertura.

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx; lo único compartido es el array de cobertura, que cada fase engancha en lockstep dentro de su propio commit)

**Requirements**: TRAD-02

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 62 variantes `multiple-choice` de Articoli y las 48 de Partitivos (110) llevan la traducción de la frase COMPLETA YA RESUELTA — con el hueco relleno por la opción correcta, nunca la frase con el hueco — y el campo solo se pinta en estado resuelto (jamás antes de responder: sería regalar la respuesta, R1).
  2. **Calidad validada:** las 110 traducciones están `validated` por el quórum cross-vendor con el prompt de traducción (nunca R1-R7); los `disputed` se resuelven con trabajo y motivo escrito, no con override-atajo, y un flag de acento sobre el español se trata como bug REAL y se arregla en el texto (RAE / PRES-05).
  3. **El gate crece con el bloque:** las dos categorías entran en el array de cobertura con el `expected` derivado del disco; desengancharlas pone ROJO el gate anti-ceguera, verificado corriendo la mutación al cerrar la fase.
  4. **Brownfield intacto:** `src/domain/` sin tocar, `schemaVersion` sigue en 13, el `gloss` ES del `prompt` sobrevive intacto (es pre-respuesta y desambigua; la traducción es post-respuesta y enseña vocabulario), y la suite queda verde con el reporter en exit 0.

**Plans**: 4 plans en 4 waves (tracer-first: el camino entero se demuestra sobre la variante de forma NUEVA del bloque antes de expandir a las 110)

- [ ] `47-01-PLAN.md` — Tracer: una variante metalingüística atraviesa autoría, quórum real, enganche al array de cobertura y gate anti-ceguera (TRAD-02)
- [ ] `47-02-PLAN.md` — Partitivos 48/48 autoradas y validadas por quórum cross-vendor (TRAD-02)
- [ ] `47-03-PLAN.md` — Articoli 62/62 + enganche de la categoría; el bloque de 110 cerrado y el reporter en exit 0 (TRAD-02)
- [ ] `47-04-PLAN.md` — Cierre por mutación: las tres mutaciones ejecutadas con su rojo observado + verificación del autor y backstops heredados

---

### Phase 48: Traducción — paradigma `fare` (4 categorías)

**Goal**: Que las 4 categorías del paradigma de `fare` muestren la traducción de su frase al resolverse, con las 122 traducciones validadas — el bloque donde el objetivo declarado del milestone ("reconocer el tiempo verbal en contexto") se juega de verdad, porque cada casilla es un tiempo o modo distinto del mismo verbo.

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx salvo el lockstep del array de cobertura)

**Requirements**: TRAD-03

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 122 variantes `multiple-choice` (fare-indicativo 54 + fare-congiuntivo 30 + fare-indefiniti 21 + fare-cond-imperativo 17) llevan traducción de la frase ya resuelta.
  2. **El tiempo verbal se reconoce en español:** la traducción de cada casilla deja ver qué tiempo/modo es (imperfetto vs passato remoto vs congiuntivo vs condizionale) sin convertirse en una explicación gramatical — la `explanation` tiene sus tres prohibiciones y una traducción no es una explicación; fundirlas re-engendraría la deuda de prosa de las Phases 41-44.
  3. **Calidad validada:** las 122 están `validated` por el quórum con el prompt de traducción; `disputed` resueltos con trabajo, español acentuado RAE.
  4. **Gate y brownfield:** las 4 categorías entran en el array de cobertura con `expected` derivado del disco (mutación observada en rojo), `src/domain/` sin tocar, `schemaVersion` en 13, suite verde y reporter exit 0.

**Plans**: TBD

---

### Phase 49: Traducción — morfología (Genero e numero + Sostantivi irregolari)

**Goal**: Que las dos categorías de morfología muestren la traducción de su frase al resolverse, con las 104 traducciones validadas, resolviendo el riesgo propio del bloque: frases mínimas donde una traducción perezosa degenera en glosa de una sola palabra.

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx salvo el lockstep del array de cobertura)

**Requirements**: TRAD-04

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 60 variantes `multiple-choice` de Genero e numero y las 44 de Sostantivi irregolari (104) llevan traducción de la frase ya resuelta.
  2. **Traducción de frase, no glosa:** en las frases cortas la traducción sigue siendo la frase española completa y natural, y no se limita a repetir el `gloss` ES que ya vive dentro del `prompt` (funciones y momentos distintos: el gloss desambigua antes de responder, la traducción enseña vocabulario después).
  3. **Calidad validada:** las 104 están `validated` por el quórum con el prompt de traducción; `disputed` resueltos con trabajo, español acentuado RAE.
  4. **Gate y brownfield:** las dos categorías entran en el array de cobertura con `expected` derivado del disco (mutación observada en rojo), `src/domain/` sin tocar, `schemaVersion` en 13, suite verde y reporter exit 0.

**Plans**: TBD

---

### Phase 50: Traducción — léxico y movimiento (Professioni + Verbi di movimento)

**Goal**: Que las dos categorías léxicas muestren la traducción de su frase al resolverse, con las 109 traducciones validadas. Es el bloque de mayor densidad de vocabulario nuevo — el que más materia prima aporta al milestone siguiente (VOCAB-X1).

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx salvo el lockstep del array de cobertura)

**Requirements**: TRAD-05

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 55 variantes `multiple-choice` de Professioni y las 54 de Verbi di movimento (109) llevan traducción de la frase ya resuelta.
  2. **El passato prossimo se traduce sin calco:** las frases que juegan la regla de auxiliar (`essere` vs `avere`) y la concordancia del participio se traducen al español natural, sin arrastrar la estructura italiana a un español que ningún hispanohablante diría.
  3. **Calidad validada:** las 109 están `validated` por el quórum con el prompt de traducción; `disputed` resueltos con trabajo, español acentuado RAE.
  4. **Gate y brownfield:** las dos categorías entran en el array de cobertura con `expected` derivado del disco (mutación observada en rojo), `src/domain/` sin tocar, `schemaVersion` en 13, suite verde y reporter exit 0.

**Plans**: TBD

---

### Phase 51: Traducción — auxiliares y presente (Essere + Avere + Presente regolare)

**Goal**: Que las tres categorías de auxiliares y presente muestren la traducción de su frase al resolverse, con las 103 traducciones validadas, incluido el terreno donde el español y el italiano dejan de solaparse: ser/estar y los idiomáticos de `avere`.

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx salvo el lockstep del array de cobertura)

**Requirements**: TRAD-06

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 46 variantes `multiple-choice` de Essere, las 32 de Avere y las 25 de Presente regolare (103) llevan traducción de la frase ya resuelta.
  2. **Ser/estar e idiomáticos resueltos:** el colapso italiano `essere` → las dos cópulas españolas se traduce con la que corresponde en cada frase, y los idiomáticos de `avere` van al equivalente español real (`ho fame` → «tengo hambre»), nunca palabra por palabra.
  3. **Calidad validada:** las 103 están `validated` por el quórum con el prompt de traducción; `disputed` resueltos con trabajo, español acentuado RAE.
  4. **Gate y brownfield:** las tres categorías entran en el array de cobertura con `expected` derivado del disco (mutación observada en rojo), `src/domain/` sin tocar, `schemaVersion` en 13, suite verde y reporter exit 0.

**Plans**: TBD

---

### Phase 52: Traducción — determinantes y verbos A1/A2 (Dimostrativi + Possessivi + Riflessivi + Modali)

**Goal**: Que las cuatro categorías de determinantes y verbos A1/A2 muestren la traducción de su frase al resolverse, con las 78 traducciones validadas — el bloque que cierra la cobertura del corpus.

**Depends on**: Phase 46 (independiente de los otros bloques TRAD-xx salvo el lockstep del array de cobertura)

**Requirements**: TRAD-07

**Success Criteria** (what must be TRUE):

  1. **Cobertura del bloque:** las 22 variantes `multiple-choice` de Dimostrativi, 21 de Possessivi, 18 de Riflessivi y 17 de Modali (78) llevan traducción de la frase ya resuelta.
  2. **Los desajustes ES↔IT del bloque se traducen, no se calcan:** el artículo obligatorio del posesivo italiano (`il mio libro` → «mi libro»), el sistema demostrativo de 2 vías frente al español de 3, y los reflexivos donde el clítico no se corresponde uno-a-uno, salen en español natural.
  3. **Calidad validada:** las 78 están `validated` por el quórum con el prompt de traducción; `disputed` resueltos con trabajo, español acentuado RAE.
  4. **Gate y brownfield:** las cuatro categorías entran en el array de cobertura con `expected` derivado del disco (mutación observada en rojo), `src/domain/` sin tocar, `schemaVersion` en 13, suite verde y reporter exit 0.

**Plans**: TBD

---

### Phase 53: Cierre v2.1 — cobertura 722/722, gates verdes y motor intacto

**Goal**: Cerrar el milestone con la afirmación verificada, no declarada: las 18 categorías y las 722 traducciones cubiertas y `validated`, el arnés verde de punta a punta, y el motor v1.4 demostrablemente intacto salvo el ÚNICO cambio declarado del milestone.

**Depends on**: Phases 47, 48, 49, 50, 51, 52 (necesita los seis bloques de contenido cerrados; Phase 46 aporta el pipeline y el piloto)

**Requirements**: GATE-03

**Success Criteria** (what must be TRUE):

  1. **Cobertura total y derivada:** 18/18 categorías y 722/722 variantes `multiple-choice` con traducción presente y `validated`, con el total DERIVADO del disco por el gate y por el reporter — ninguna de las dos cifras transcrita a mano en ningún fichero (el precedente CR-01 de la Phase 44: un test que congela una cifra escrita en un `notes` certifica en verde un número obsoleto).
  2. **Arnés verde:** la suite pasa en su invocación canónica (incluido `tests/fixtures/`, enganchado en la Phase 45) y el reporter sale con exit 0 con el gate de traducción en PASS.
  3. **Motor byte-intacto:** `src/domain/` sin cambios frente al arranque del milestone y `SESSION_AUTO_ADVANCE_MS` sin tocar (ya no hay «excepción declarada» — ver la corrección en la Phase 46); la cascada D-54 sigue con EXACTAMENTE 2 call-sites de `applyImmediateFailure`, verificado por `git diff` + grep + test, no por afirmación.
  4. **El gate de cierre muerde, comprobado por mutación:** dejar una traducción `pending`, desacentuar una frase española, o declarar una categoría cubierta sin engancharla al array, ponen el reporter en ROJO al ejecutarlo — cada mutación se corre y se revierte, y si un fix propuesto por el code review de la fase toca un gate, ese fix se verifica con la misma mutación que el código que arregla (2 de 4 fixes de revisor en la Phase 44 eran incorrectos y uno era peor que el bug).

**Plans**: TBD

---

## Progress

| Milestone | Phases | Plans | Status | Completed |
|-----------|--------|-------|--------|-----------|
| v1.0 | 1-8 | 26/26 | Complete | 2026-05-25 |
| v1.1 | 9-10 | 8/8 | Complete | 2026-05-27 |
| v1.2 | 11-12 | 10/10 | Complete | 2026-05-28 |
| v1.3 | 13-14 | 3/3 | Complete | 2026-06-02 |
| v1.4 | 15-17 | 9/9 | Complete | 2026-06-03 |
| v1.5 | 18-20 | 7/7 | Complete | 2026-06-05 |
| v1.6 | 21-27 | 19/19 | Complete | 2026-06-09 |
| v1.7 | 29-31 | 6/6 | Complete | 2026-06-17 |
| v1.8 | 32-34 | 12/12 | Complete | 2026-06-30 |
| v1.9 | 35-39 | 10/10 | Complete | 2026-07-02 |
| v2.0 | 40-45 | 15/15 | Complete | 2026-08-13 |
| **v2.1** | **46-53** | **0/TBD** | **In progress** | **—** |

*Phase 28 quedó huérfana (trabajo "responsive-mobile" archivado); la numeración no se reutiliza.*

### v2.1 — detalle por fase

| Phase | Variantes | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 46. Pipeline de traducción end-to-end (piloto Preposiciones) | 96 | 0/TBD | Not started | - |
| 47. Traducción — bloque Artículos | 110 | 0/4 | Planned | - |
| 48. Traducción — paradigma `fare` | 122 | 0/TBD | Not started | - |
| 49. Traducción — morfología | 104 | 0/TBD | Not started | - |
| 50. Traducción — léxico y movimiento | 109 | 0/TBD | Not started | - |
| 51. Traducción — auxiliares y presente | 103 | 0/TBD | Not started | - |
| 52. Traducción — determinantes y verbos A1/A2 | 78 | 0/TBD | Not started | - |
| 53. Cierre v2.1 (cobertura, gates, motor) | — (722 acumuladas) | 0/TBD | Not started | - |

**Suma de contenido:** 96 + 110 + 122 + 104 + 109 + 103 + 78 = **722** variantes `multiple-choice` (verificado contra `content/exercises/` el 2026-08-13: 250 slots / 758 variantes totales, de las que 22 son `word-buttons` y 14 `match` — ambas fuera de scope).

## Backlog

### 🎯 Traducción al español por variante (TRAD-X1) — ✅ PROMOVIDO a v2.1 (ACTIVE)

**Status:** ✅ **PROMOVIDO** — el 2026-08-13 pasó de candidato redactado por el autor a milestone **v2.1** (Phases 46-53). Diseño cerrado sin fase de research: todos los precedentes son in-repo. El patrón estructural es el de las Phases **7 / 7.1 / 7.2** de v1.0 (campo opcional nuevo aplicado a TODO el corpus: primero una fase que baja schema + render + una categoría end-to-end, después fases incrementales de contenido); el validador se deriva de **`260615-vkr`** (`docs/SONG-VALIDATION-PROMPT.md` + `scripts/validate-song-pass.mjs`, criterios S1-S6), NO de R1-R7. **Fuera de scope explícito:** `word-buttons` (22 variantes — su `prompt` ya es español), `match` (14 — no hay frase), el bloque Canciones (ya es traducción validada), reducir el `gloss` ES del `prompt` (canon R7: pre-respuesta y desambigua), fundir traducción con `explanation`, migración `13→14` y mostrar la traducción antes de responder.

### 🎯 Vocabulario ES↔IT (VOCAB-X1) — candidato al milestone siguiente

**Status:** Backlog, **dependiente de v2.1**. Modo de vocabulario con modalidades ES→IT / IT→ES / mezclado (VOCAB-01), dificultad fácil por selección de opciones reutilizando el motor existente — el `decoyBank` de canciones es precedente directo para generar distractoras (VOCAB-02), dificultad difícil por texto libre, que sí es motor nuevo de verdad: normalización de acentos, mayúsculas, artículo (`il`/`la`/`lo`), apóstrofo y respuestas múltiples válidas (VOCAB-03), y decidir A PROPÓSITO cuál es la unidad de reset del vocabulario en vez de heredar por defecto «un fallo re-arrastra la categoría entera» (VOCAB-04). **Va después de v2.1 porque se alimenta de los pares ES↔IT que v2.1 produce.**

### 🎯 Determinantes + verbos A1/A2 — ✅ ENTREGADO en v1.9 (SHIPPED 2026-07-01)

**Status:** ✅ ENTREGADO — shipped 2026-07-01 como milestone **v1.9** (Phases 35-39; detalles en `.planning/milestones/v1.9-ROADMAP.md`). Las 4 categorías nuevas A1/A2 (Dimostrativi, Possessivi, Verbi modali, Verbi riflessivi) autoradas por quórum R1-R7 en slot+variantes + PROV-01 marca de procedencia transversal. **Scope decidido en requirements:** MODAL passato prossimo DIFERIDO (ver "Tiempos verbales" abajo); REFLEX passato prossimo con essere+concordancia INCLUIDO; PROV legacy `origen` AUSENTE (procedencia mixta, no se etiqueta en grueso). Motor v1.4 intacto (brownfield puro de contenido). Numeración de fases CONTINÚA desde Phase 34.

### 🎯 Paradigma completo de `fare` (FARE-X1) — ✅ ENTREGADO en v2.0

**Status:** ✅ **ENTREGADO** — promovido 2026-07-28 a milestone **v2.0**, shipped 2026-08-13 (Phases 40-**45**; detalles en `.planning/milestones/v2.0-ROADMAP.md`). El rango que esta línea decía al promoverlo era 40-44; la Phase 45 se añadió el 2026-08-12 a raíz de la auditoría del propio milestone. Diseño cerrado con el autor el 2026-07-27; **sin fase de research** (el autor la saltó: el diseño ya estaba decidido). 4 categorías por MODO (`fare-indicativo` 8 slots · `fare-congiuntivo` 4 · `fare-cond-imperativo` 3 · `fare-indefiniti` 6) = 21 slots y ≈107 variantes por quórum **según la estimación de esta promoción**; el volumen real resultó **22 slots / 113 variantes** (D-42-01, el slot del DISPARADOR de CONG-04). La cifra de arriba se conserva porque es el registro de lo que se prometió el 2026-07-28, no de lo que se entregó. **La categoría es la unidad de reset** — la agrupación es decisión de diseño, no estética (precedente `260614-hxn`). **Riesgo asumido:** `fare-indicativo` mezcla *presente* (diario) con *trapassato remoto* (extinto en el habla) en la misma unidad de reset; si se atasca y nunca se pone verde, partirla en semplici/composti (barato, con precedente). **Out of scope explícito:** tocar el motor v1.4, ejes de variante nuevos, `fare` en perifrasis/modismos (`fare la spesa`, `fa freddo`, `farcela`, causativo) y el passato remoto de otros verbos. `andare`/`venire`/`dire` quedan como candidatos a v2.2+ con el mismo patrón.

### Tiempos verbales y categorías derivadas (post-v1.7)

**Status:** Backlog. v1.7 entregó el presente regular (`presente-regolare`); v1.9 entrega Modali + Riflessivi. Diferidos a milestones futuros conforme la profesora entregue material:

- **MODAL-PP-01** (NUEVO, diferido por decisión en v1.9): passato prossimo de los modales con auxiliar PRESTADO del infinitivo (`ho dovuto lavorare` vs `sono dovuto andare`) — A2 sutil, pantano de doble-validez; va al milestone de tiempos pesados, NO a v1.9.
- **TENSE-X1..X4**: Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo — milestone SEPARADO conforme la profesora entregue material.
- **PASSPROX-01**: passato prossimo como categoría dedicada (elección de auxiliar + participio).

Verbos IRREGULARES en presente (andare/fare/venire/dire…) son categoría aparte (out-of-scope explícito de v1.7). **v2.0 cubre `fare` ENTERO** (paradigma completo en 4 categorías); `andare`, `venire` y `dire` siguen abiertos como candidatos v2.2+. **Nota:** los tiempos que v2.0 dio de alta (imperfetto, passato remoto, futuro, condizionale, congiuntivo…) entraron SOLO como casillas del paradigma de `fare`; TENSE-X1..X4 sigue abierto como cobertura general del tiempo verbal sobre verbos regulares. Reflexivos recíprocos (`si amano`, `ci scriviamo` "el uno al otro") y modal + clítico (`voglio farlo`/`lo voglio fare`) diferidos a un milestone posterior de pronombres (out-of-scope de v1.9).

### Procedencia — granularidad fina (PROV-X1 — diferido)

**Status:** Backlog post-v1.9. **PROV-X1**: marca de procedencia por-slot o por-variante para representar con honestidad la mezcla del legado (aumentos por quórum sobre base de PDF de la profesora en v1.4-v1.7). v1.9 estampa `origen` solo a nivel de categoría en las 4 nuevas (nacidas `ia-quorum` puras) y deja las 10 legacy con `origen` AUSENTE (etiquetarlas en grueso mentiría, ver PROV-02). La granularidad fina es diferida: coste de validador + etiquetado retroactivo alto; category-level ausente basta.

### CONV-01 — ✅ CERRADO en v1.6

**Status:** ✅ COMPLETO (cerrado 2026-06-09). Las 9 categorías de gramática están en formato slot+variantes unificado. v1.7 dio de alta la 10ª (`presente-regolare`); v1.9 da de alta la 11ª-14ª (Dimostrativi/Possessivi/Modali/Riflessivi), todas nacidas directamente en ese formato (no requieren conversión). Las dos léxicas (Professioni, Sostantivi irregolari) se resolvieron como HÍBRIDAS. El motor v1.4 nunca se tocó.

### Autoría asistida de variantes (AUTHOR-01 — diferido)

**Status:** Backlog post-v1.4. UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano. En v1.4/v1.5/v1.6/v1.7 (y v1.9/v2.0) las variantes se autoran a mano + quórum (patrón D-85).

### Categorización asistida de frases de canciones (CATPROC — diferido a milestone futuro)

**Status:** Backlog post-v1.3. CATPROC-01 (un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas) + CATPROC-02 (el autor crea una categoría nueva desde una propuesta y re-engancha las frases huérfanas). El modelo de datos v1.3 (LINK-03) YA soporta frases sin categoría para no bloquear esto.

### Más canciones (MUSIC-X1 — diferido)

**Status:** Backlog post-v1.3. Añadir más canciones al bloque conforme el autor las quiera trabajar; el patrón de alta queda consolidado en v1.3. (Validador de frases ES por quórum S1-S5 ya disponible — quick task `260615-vkr`, 83/83 validated; 10 canciones reales ya en el bloque a 2026-06-30.)

### decoyBank.pos multi-categoría por token (DECOY-X1 — diferido)

**Status:** Backlog post-`260727-dcy`. **DECOY-X1**: `decoyBank.pos` está indexado por TEXTO de palabra, así que un token repetido en `answer` con función distinta solo admite UNA etiqueta POS (caso real y único del corpus: `22-settembre-009`, "Io la vita la prendo com'è" → `la` artículo + `la` pronombre). El autor decidió (2026-07-27) **aceptar el `disputed`** (opción A): la frase es jugable igual —el modo agrupado no lee `decoyBank.validation`— y es 1 de 311 frases únicas convertidas. La opción B (`pos` acepta `string | string[]`, `groupTokens` reparte por índice, D1 reescrita, round-trip de `serDecoyBank`) queda **diferida hasta que el patrón reaparezca** en una canción nueva. Detalle y plan de ataque en `.planning/todos/pending/decoybank-pos-multi-categoria.md`.

### Bridges multi-cat Partitivos + responsive móvil

**Status:** Backlog. Bridges multi-categoría Partitivos↔género-número/sustantivos (PART-X1, diferido para acotar v1.2). Responsive móvil (MOBILE-01) ya ejecutado parcialmente como trabajo huérfano (Phase 28, archivada) + capa `@media (max-width: 640px)` shippeada como quick tasks; el responsive completo de las pantallas Editoriale (tamaño de prompt + breakpoints) queda diferido desde v1.8 (desktop-only por diseño) — re-evaluar si se reactiva como milestone formal.

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
*Milestone v2.0 SHIPPED 2026-08-13 — Phases 40-45 (numeración CONTINÚA desde Phase 39). Paradigma completo de `fare`: 4 categorías por modo = **22 slots / 113 variantes** por quórum cross-vendor R1-R7 + migración `12→13` con reset selectivo + integración lockstep + Phase 45 (deuda del arnés de tests, añadida a raíz de la auditoría del propio milestone). 26/26 requirements. 18 categorías / 250 slots. Suite 1182/1182 (1200 strict), reporter exit 0. **Motor v1.4 byte-intacto.** Detalles archivados en `.planning/milestones/v2.0-ROADMAP.md`.*
*Milestone v2.1 ACTIVE desde 2026-08-13 — Phases 46-53 (numeración CONTINÚA desde Phase 45, sin reset). Traducción al español por variante (TRAD-X1): campo OPCIONAL de traducción por variante `multiple-choice` (sin migración `13→14` — es contenido en `content/`, no state) + render en acierto Y fallo con `SESSION_AUTO_ADVANCE_MS` subido + validador propio derivado de S1-S6 (NO R1-R7) + gates de cobertura y anti-ceguera + **722 traducciones en 18 categorías**. 22 requirements (3 SCH + 5 REND + 4 TVAL + 7 TRAD + 3 GATE), 22/22 mapped, 0 orphans, 0 duplicados. Estructura: **Phase 46** baja el pipeline entero y lo prueba end-to-end sobre el piloto Preposiciones (patrón Phases 7/7.1/7.2 de v1.0), **Phases 47-52** son bloques de contenido independientes entre sí (solo comparten el array de cobertura, enganchado en lockstep), **Phase 53** cierra con cobertura, gates y motor. Los gates (GATE-01/02) van en la PRIMERA fase, no en la última — la lección de v2.0: un array de conteo añadido tarde emitió `225/225 PASS` con una categoría entera desenganchada. **Brownfield con el motor BYTE-INTACTO: `src/domain/` no se toca, `SESSION_AUTO_ADVANCE_MS` no se toca (la «excepción declarada» de la redacción original se retiró en la discusión de la Phase 46, 2026-08-13: en ejercicios no existe auto-avance que alargar), y la cascada D-54 sigue con EXACTAMENTE 2 call-sites.***
