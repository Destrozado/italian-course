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
- 🚧 **v1.8 — Rediseño visual "Editoriale"** — Phases 32-34 (in progress, iniciado 2026-06-30). Aplica la dirección visual Editoriale (papel cálido, serif Spectral, acento tricolore verde/blanco/rojo, mucho aire) del handoff `design_handoff_italiano_redesign/` a las 8 pantallas de la app, recreada con fidelidad alta en el stack real (vanilla + Alpine + Pico, sin build). Capa de tokens + fuentes auto-hospedadas + `app.css` sobre Pico, Home/Categorías, pantallas de ejercicio, canciones/resultados/picker. **Brownfield UI puro: motor (cascada D-54, sampler, slot-engine, localStorage, schema, migraciones) NO se toca.** 19 requirements (4 FND + 6 HOME + 5 EX + 4 SRP).

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

### 🚧 v1.8 — Rediseño visual "Editoriale" (In Progress)

**Milestone Goal:** Aplicar la dirección visual **Editoriale** (papel cálido `#f4f0e8`, tipografía serif Spectral, acento tricolore verde/blanco/rojo, mucho aire) del handoff `design_handoff_italiano_redesign/` a las **8 pantallas** de la app, recreada con **fidelidad alta** en el stack real (vanilla + Alpine.js + Pico CSS + ES modules, sin build, **NO React**). Brownfield **UI puro**: solo capa de presentación (markup + CSS, y a lo sumo bindings de presentación). El motor (cascada D-54, sampler, slot-engine, localStorage, schema, migraciones) **NO se toca**. `support.js` y el `.dc.html` son referencia, **no van a producción**.

**Numeración:** v1.7 terminó en Phase 31; Phase 28 es trabajo huérfano archivado. v1.8 **CONTINÚA en Phase 32** (no reinicia).

#### Phase 32: Cimientos visuales + Home/Categorías
**Goal**: La app entera adopta el lenguaje Editoriale (tokens + fuentes offline + capa `app.css` sobre Pico + motivo tricolore) y la Home/Categorías queda rediseñada como pantalla principal editorial, en columna móvil y como tabla editorial en desktop, sin perder funcionalidad.
**Depends on**: Nothing (primera fase de v1.8; debe ir PRIMERA porque toda fase posterior consume tokens/fuentes/`app.css`)
**Requirements**: FND-01, FND-02, FND-03, FND-04, HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06
**Success Criteria** (what must be TRUE):
  1. Al abrir la app con `npx serve`, la Home se renderiza sobre **papel cálido** con título serif **Categorías** (Spectral 38) y la cabecera overline `ITALIANO · A1 / A2` — la estética azul/blanca anterior ha desaparecido.
  2. Las 3 familias (Spectral, Hanken Grotesk, Space Grotesk) cargan vía `@font-face` desde `vendor/fonts/` con **cero peticiones a `fonts.googleapis.com`** (verificable en la pestaña Network y funcionando offline).
  3. El **CTA verde Repaso 20** (ancho completo, título + subtítulo + flecha, sombra verde), la fila de 3 botones **ghost** (Test completo · Canciones · Backup) y el **switch Contrarreloj** se ven en estilo Editoriale y lanzan/conmutan exactamente el mismo comportamiento que hoy.
  4. Cada categoría se muestra en estilo editorial — punto de estado (verde dominado / ámbar en progreso / neutro sin empezar), nombre serif + tema en cursiva, barra de racha `streak/21` con meta "N/21 d · M ejercicios", y píldora **Examen** — con los datos reales del state.
  5. En **desktop** la Home se presenta como **tabla editorial** (Estado · Categoría · Racha · Ejercicios · Examen) con papel/serif/hairlines, conservando toda la funcionalidad (lanzar práctica de categoría, Examen 1-clic).
**Plans**: TBD
**UI hint**: yes

#### Phase 33: Pantallas de ejercicio
**Goal**: Las pantallas de práctica/examen (opción múltiple, emparejar, word-buttons) adoptan el lenguaje Editoriale con barra superior unificada, recreando los estados de selección/comprobado del handoff sobre el motor intacto.
**Depends on**: Phase 32 (consume tokens, fuentes y `app.css`)
**Requirements**: EX-01, EX-02, EX-03, EX-04, EX-05
**Success Criteria** (what must be TRUE):
  1. Toda pantalla de ejercicio muestra la **barra superior** Editoriale: botón atrás circular, barra de progreso verde (% del set), contador `NN/NN` en Space Grotesk y **chip de cronómetro** cuando Contrarreloj está activo.
  2. El **bloque de pregunta** muestra overline de categoría + frase serif (30px) con el hueco y la sugerencia en cursiva.
  3. **Opción múltiple** reproduce los estados del handoff: selección (borde verde + `green-selection` + hueco rellenado), comprobado (correcta `green-tint` ✓ / elegida-incorrecta `red-tint` ✗ / resto opacadas), caja de feedback verde/rojo con título serif + explicación, y CTA **Comprobar → Continuar** — grading y cascada D-54 inalterados.
  4. **Emparejar** muestra dos columnas de píldoras con **badge numérico** por par y estados activa / candidata (borde discontinuo) / emparejada (`green-tint`), nota "N de M emparejadas" y CTA deshabilitado hasta completar.
  5. **Word-buttons** (no especificado en el handoff) se ve coherente con el lenguaje Editoriale (banco de palabras, huecos estables, feedback verde/rojo consistente con opción múltiple).
**Plans**: TBD
**UI hint**: yes

#### Phase 34: Canciones · Resultados · Picker
**Goal**: El bloque Canciones, la reproducción de canción, los Resultados de examen y el picker de Repaso/Examen adoptan el lenguaje Editoriale, cerrando las 8 pantallas del rediseño con datos reales de sesión.
**Depends on**: Phase 32 (tokens/fuentes/`app.css`); reutiliza la barra superior de Phase 33 para la reproducción de canción
**Requirements**: SRP-01, SRP-02, SRP-03, SRP-04
**Success Criteria** (what must be TRUE):
  1. La pantalla **Canciones** muestra la tarjeta destacada **Continuar** (portada + overline verde + progreso) y la lista con **tiles tintados** (inicial serif), título serif, meta en cursiva y punto de estado — sin arte de portada real (placeholders tintados).
  2. La **reproducción de canción** (rellenar huecos) se ve con el lenguaje Editoriale y la misma barra superior que las pantallas de ejercicio.
  3. **Resultados de examen** muestra el **anillo de score** (`conic-gradient`) + "X/Y correctos", la sección **categorías afectadas** (cascada, etiqueta `FALLÓ`) y los **errores** (frase resuelta, "Tu: ~~x~~ / Correcta: y", explicación), todo con los datos reales de la sesión terminada.
  4. El **picker** de Repaso/Examen se ve en estilo Editoriale (checkboxes/selección, Seleccionar/Quitar todo, contador) conservando su comportamiento de selección de categorías.
**Plans**: TBD
**UI hint**: yes

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
| 32. Cimientos visuales + Home/Categorías | v1.8 | 0/TBD | Not started | - |
| 33. Pantallas de ejercicio | v1.8 | 0/TBD | Not started | - |
| 34. Canciones · Resultados · Picker | v1.8 | 0/TBD | Not started | - |

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
*Milestone v1.7 shipped 2026-06-17 — Phases 29-31 (numeración EMPIEZA en 29, NO en 28 — Phase 28 ya existe como trabajo huérfano "responsive-mobile" archivado en `.planning/milestones/orphan-phases/`; la numeración no se reutiliza). Presente regolare (10ª categoría de gramática): alta de `presente-regolare` nacida directamente en slot+variantes (slots de regla -are/-ere/-ire/-isc-/ortográficos, variantes por quórum cross-vendor R1-R7, cruces multi-cat con avere/essere) + migración con reset selectivo SOLO de la categoría nueva + integración lockstep. 11 requirements (7 PRES + 2 MIG + 2 INT), 11/11 mapped, 0 orphans. **Brownfield puro contenido + migración: motor v1.4 NO tocado.** Phase 29 (migración) → Phase 30 (alta + slots + variantes por quórum) → Phase 31 (cruces multi-cat + integración lockstep). DISCREPANCIA: la migración va `10→11` (no `9→10` como dice MIG-05) porque el codebase ya está en schemaVersion 10 tras el quick task `260615-nzi`; los stubs de backlog `999.1`/`999.2` en `.planning/phases/` quedan intactos (no son fases de este milestone).*
*Milestone v1.8 en progreso desde 2026-06-30 — Phases 32-34 (numeración CONTINÚA desde Phase 31; Phase 28 es trabajo huérfano archivado, no se reutiliza). Rediseño visual "Editoriale": brownfield UI puro que aplica la dirección visual del handoff `design_handoff_italiano_redesign/` a las 8 pantallas en el stack real (vanilla + Alpine + Pico, NO React). Phase 32 (cimientos visuales: tokens + fuentes auto-hospedadas + `app.css` sobre Pico + tricolore, debe ir PRIMERA porque toda fase posterior la consume + Home/Categorías) → Phase 33 (pantallas de ejercicio) → Phase 34 (canciones/resultados/picker). 19 requirements (4 FND + 6 HOME + 5 EX + 4 SRP), 19/19 mapped, 0 orphans. **Motor (cascada D-54, sampler, slot-engine, localStorage, schema, migraciones) NO se toca; `support.js` no se integra.***
