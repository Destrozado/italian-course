# Phase 5: Essere — categoría fundamental que faltaba - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 añade **Essere como 7ª categoría dedicada** (la que faltaba al cerrar el milestone v1.0): conjugación presente + identidad + nacionalidad + profesión + estado + cópula clasificatoria + participio `stato/stata/stati/state` (A1 viable), con ejercicios diseñados para forzar el contraste essere/avere que confunde al hispanohablante, y ≥1 cruce multi-categoría que ejercita la cascada D-54 sobre essere en uso real.

**Capacidades entregadas:**
- `content/categories.json` extendido a 7 entradas (Avere order:1 → Essere order:2 → resto de categorías existentes con `order` desplazado +1).
- `content/exercises/essere.json` nuevo con ~33 ejercicios base + 6 cruces multi-categoría (essere-300..305) = **~39 ejercicios totales**, validados por schema, NFC normalize on load, apóstrofes ASCII.
- Cobertura A1 completa: presente indicativo (6 personas + 2 variantes), identidad/presentación, nacionalidad, profesión (con contraste explícito contra avere), estado/condición, cópula clasificatoria, participio passato prossimo.
- 6 cruces multi-cat espejo del patrón Phase 4 (avere-300..305): essere×{avere, profesiones, verbos-movimiento, genero-numero, sustantivos-irregulares, preposiciones}.

**Requisitos cubiertos:** SEED-03 (a definir formalmente en plan-phase) — añade `essere` a la lista de categorías obligatorias con cobertura A1 mínima.

**Fuera del scope:**
- Imperfecto, futuro, condicional de essere — A2.
- Imperativo de essere (`sii`/`siate`) — A2.
- Concordancia exhaustiva en participio passato prossimo con verbos de movimiento (esa lógica vive en `verbos-movimiento.json`, aquí solo se ejercita essere como auxiliar).
- Sub-categoría "essere idiomático" (modismos `esserci`, `essere d'accordo`) — A2.
- Modificar avere.json u otras categorías existentes — APPEND-ONLY (D-88 blindado por `scripts/assert-avere-prefix-unchanged.mjs`).

</domain>

<decisions>
## Implementation Decisions

### Mezcla de tipos en essere.json

- **D-89:** **Mayoría multi-choice + 4 word-buttons (sin match).** Distribución global:
  - **~29 multi-choice** (conjugación pura, contrastes essere/avere, huecos sencillos).
  - **4 word-buttons** (1 por cada sub-área que requiere orden léxico no derivable): identidad/presentación, nacionalidad, profesión con essere, participio passato prossimo.
  - **0 match.** La conjugación de essere es derivable por raíz (`io ↔ sono`, `tu ↔ sei`, etc.) → viola DESIGN RULE Phase 4 ("match solo si pareo requiere regla NO derivable por raíz"). No se fuerza un match artificial.
  - **+6 multi-choice multi-categoría** (essere-300..305, ver D-92) — fuera del recuento "base 33" pero en el mismo archivo.

- **D-90:** **Las 4 word-buttons cubren una sub-área cada una.** Frases candidatas (planner refina al transcribir):
  - Identidad: `io sono Maria, sono di Roma` (sin distractoras o 1 distractora forma de `avere` infiltrada en el banco).
  - Nacionalidad: `noi siamo italiani di Milano` (concordancia plural masc + preposición `di` con origen — multi-cat candidato natural si se quiere reforzar genero-numero, pero queda como word-buttons mono-cat para mantener el ranking de cruces D-92 limpio).
  - Profesión: `lei è medico in un ospedale` (contraste implícito con `avere` — la profesión va con essere).
  - Participio passato prossimo: `siamo stati a Roma per una settimana` (auxiliar essere + participio plural masc `stati` + preposición `a` con ciudad + `per` con duración).

### Estrategia de distractoras

- **D-91:** **Patrón fijo de distractoras en CADA multi-choice de essere = 1 forma de avere + 2 formas de essere mal conjugadas + 1 correcta.** Sin excepciones por sub-área.
  - **Forma de avere** = la que un hispanohablante elegiría si confunde "ser/tener" (e.g., en `Io ___ Maria` opciones `[sono, ho, sei, è]` — `ho` es la trampa "yo tengo Maria"; en `Maria ___ stanca` opciones `[è, ha, sei, sono]` — `ha` es la trampa "Maria tiene cansada"). En conjugación pura sin contraste semántico explícito (e.g., `Tu ___ italiano?`), la distractora avere sigue siendo la forma de avere de la MISMA persona (`hai` aquí).
  - **2 formas de essere mal conjugadas** = formas de OTRAS personas (e.g., si la correcta es `sono` para `io`, las distractoras essere son `sei`/`è`/`siamo`/`siete` — eligir 2 que el hispanohablante pueda confundir).
  - **1 correcta**.
  - Orden visual de las opciones: aleatorio por ejercicio (no siempre la correcta en la misma posición). El `correctIndex` apunta a la posición real en el array `options`.
  - **Cobertura del patrón pedagógico:** cada fallo enseña o bien la conjugación correcta de essere, o bien el contraste essere/avere — las dos lecciones core de la categoría. Cero distractoras "rellenas" sin valor pedagógico.

### Cobertura cuantitativa por sub-área

- **D-92:** **Reparto equilibrado con participio A1, total ~33 base + 6 multi-cat = ~39 en essere.json:**

| Sub-área                              | Cantidad | Tipo                          | Notas |
|---------------------------------------|----------|-------------------------------|-------|
| Conjugación presente                  | 8        | 8 mc                          | 6 personas pura (`io sono`, `tu sei`, `lui/lei è`, `noi siamo`, `voi siete`, `loro sono`) + 2 variantes (interrogación `Tu ___ italiano?` + negación `Non ___ stanco`). |
| Identidad / presentación              | 5        | 4 mc + 1 wb                   | Nombre, parentesco, identificación (`Lui è mio fratello` / `Io sono Maria` / `Tu sei l'amico di Luca`). |
| Nacionalidad                          | 4        | 3 mc + 1 wb                   | `Noi siamo spagnoli` / `Lei è italiana di Milano` — ejercita concordancia género/número implícita. |
| Profesión con essere                  | 5        | 4 mc + 1 wb                   | Contraste explícito vs avere (`Lui ___ medico` con `ha` como distractora) + femenino (`Lei è avvocata`). |
| Estado / condición                    | 4        | 4 mc                          | `Maria è stanca` / `Siamo contenti` / `Sono felice` — contraste con falsos amigos español "estar" → italiano `essere`. |
| Cópula clasificatoria                 | 2        | 2 mc                          | `Roma è una città` / `Il gatto è un animale` — uso clasificatorio puro. |
| Participio passato prossimo           | 5        | 4 mc + 1 wb                   | `Sono stato a Roma` (masc sing) / `È stata bella` (fem sing) / `Siamo stati felici` (plural masc) / `Le ragazze sono state qui` (plural fem) — ejercita las 4 formas `stato/stata/stati/state` con concordancia. |
| **Subtotal base**                     | **33**   | **29 mc + 4 wb**              | Cumple ROADMAP §2 (≥30). |
| Multi-categoría (essere-300..305)     | 6        | 6 mc                          | Ver D-93. |
| **Total essere.json**                 | **~39**  | **35 mc + 4 wb**              | Margen cómodo sobre el mínimo ROADMAP. |

- **D-93:** **Participio `stato/stata/stati/state` SE INCLUYE.** ROADMAP §3 lo deja como "si es viable A1" — el equipo confirma que sí (pasado próximo de essere es A1 estándar en cualquier curso italiano para hispanohablantes). Las 4 formas con concordancia están cubiertas para inocular la regla desde el principio. Si en UAT humano se ve que confunde más de lo que enseña, se podría reducir a 2-3 ejercicios en v2 (pero la inversión inicial vale).

### Cruces multi-categoría (essere-300..305)

- **D-94:** **6 cruces espejo del patrón avere-300..305 — uno por cada otra categoría existente.** Coherente con D-87/D-88 de Phase 4 pero invertido (Phase 4 ancló a `avere` como "verbo central que cruza con todo"; Phase 5 ancla la misma propiedad a `essere`). Patrón concreto (planner refina prompts y opciones):

| ID            | categoryIds                                | Frase candidata                                          | Pedagogía |
|---------------|--------------------------------------------|----------------------------------------------------------|-----------|
| essere-300    | `["essere", "avere"]`                      | `Mio fratello ___ medico e ha 30 anni.`                  | Contraste directo essere/avere en la misma frase: la profesión va con essere, la edad con avere. Distractoras incluyen las 2 formas swap (`ha medico` falso amigo). |
| essere-301    | `["essere", "profesiones"]`                | `Lei ___ avvocata.`                                       | Profesión femenina (-o→-a regla profesiones.json) + essere — un hispanohablante eligiría "ha" mal. |
| essere-302    | `["essere", "verbos-movimiento"]`          | `Maria ___ andata al cinema.`                             | Auxiliar essere + participio fem sing — clásico A1, ejercita el "es-pasado" intransitivo. |
| essere-303    | `["essere", "genero-numero"]`              | `Noi ___ italiani di Milano.`                             | Plural masc + nacionalidad + concordancia esp/it (italiani, no italianos). |
| essere-304    | `["essere", "sustantivos-irregulares"]`    | `Le mie braccia ___ stanche.`                             | Plural irregular `braccia` (singular masc → plural fem) + concordancia `stanche` + 3ª plural essere. Mismo plural irregular que avere-302, ahora visto desde essere (el reverso pedagógico). |
| essere-305    | `["essere", "preposiciones"]`              | `Io ___ di Milano e parlo italiano.`                      | Preposición `di` con origen + essere de identificación. Caso canónico PDF Preposizioni. |

  - **Mismo patrón de distractoras D-91** aplica también a estos 6 cruces.
  - **IDs** siguen la convención D-87: `{slug}-{NNN}` con NNN ≥ 300 para multi-cat (espejo exacto de avere-300..305).
  - **Salto entre 304 y 305 NO se usa** — IDs 300..305 son consecutivos (300, 301, 302, 303, 304, 305). El planner asigna pares ID↔frase definitivos al transcribir.

- **D-95:** **Cascada D-54 verificable en UAT humano.** El UAT del ROADMAP §6 exige fallar deliberadamente un multi-cat. Se sugiere fallar `essere-302` (`Maria è andata al cinema`) en una sesión Repaso 20 que incluya essere + verbos-movimiento + alguna otra categoría — el resumen debe mostrar AMBAS categorías reseteadas a `no-hecha` con racha 0.

### Convenciones heredadas (aplican sin re-discusión)

- **D-96 (hereda D-85):** **Sin PDF — Claude propone JSON desde conocimiento A1 genérico → autor revisa pedagógicamente → commit.** No hay material-profesora/Essere.pdf. El reparto base D-92 y el patrón distractoras D-91 son la receta; Claude genera los 33+6 ejercicios concretos, el autor revisa frase por frase antes del commit (probablemente en 1-2 batches: base primero, multi-cat después, o un único batch monolítico — decisión del planner).
- **D-97 (hereda D-88 invertido):** **APPEND-ONLY también para essere.json post-Phase 5.** Una vez ancha y commiteado, los ejercicios iniciales no se modifican silenciosamente. Si se quieren extender en v2, AÑADIR nuevos IDs (essere-100+ por ejemplo). No se requiere helper `assert-essere-prefix-unchanged.mjs` en Phase 5 — el principio se aplica por convención. Si en v2 surge volumen suficiente, plantear el script.
- **D-98 (hereda CONT-06):** **NFC normalize on load + apóstrofes ASCII (`'` no `'`).** Los ejercicios con `un'amica`, `l'amico`, `c'è`, `d'accordo` deben usar `'` (U+0027) puro. El schema validator + NFC en boot ya garantizan la regla.
- **D-99 (categories.json shift):** **Avere mantiene order:1; Essere insertada como order:2; las 5 categorías existentes desplazan su `order` +1 (Preposiciones 2→3, Verbos-movimiento 3→4, Sustantivos-irregulares 4→5, Genero-numero 5→6, Profesiones 6→7).** Cero migración de datos en localStorage — el `order` solo afecta al render del dashboard. Cambio puramente cosmético en categories.json.

### Claude's Discretion

- **Texto exacto de cada frase candidata** dentro de las restricciones de la sub-área y el patrón D-91. El planner / executor refinan al transcribir, el autor revisa.
- **Notes** de cada ejercicio (campo `notes`): seguir el tono de avere.json original — una frase corta indicando la persona/regla/contraste pedagógico. Útil para el autor en revisión.
- **Orden de los ejercicios DENTRO de essere.json**: agrupar por sub-área (conjugación primero, luego identidad, etc., multi-cat al final como en avere.json). El sampler `buildSession` es agnóstico al orden — esto es solo para legibilidad humana en el JSON.
- **Smoke test multi-cat** existente (`tests/data/multi-cat-content.test.mjs` — Phase 4): el planner decide si extenderlo para cubrir esos 6 nuevos cruces essere o si el test actual (que opera sobre todos los multi-cat de `content/exercises/*.json`) los cubre automáticamente. Preferencia: extensión automática (el test debería detectar los essere-300..305 sin retoque si está bien diseñado).
- **Categoría legible en categories.json**: `"Essere (cópula)"` o `"Essere"` a secas — el planner decide siguiendo el patrón existente (`"Avere (auxiliar)"` sugiere paréntesis con función gramatical → propuesta default: `"Essere (cópula)"`).
- **¿Plan único o multi-plan?**: ROADMAP §"Plans: TBD" sugiere 1 plan único patrón Plan 04-02 Task 2. Confirmado por la ausencia de complejidad runtime nueva — solo es contenido + categories.json shift. 1 plan.
- **UAT humano final**: el planner añade un acceptance criterion concreto reusando el patrón ROADMAP §6 (Repaso 20 incluyendo essere, fallar deliberadamente essere-302 — o el cruce que esté en la sesión —, verificar cascada D-54 en el resumen sobre 2+ categorías).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope, Key Decisions Phase 1+2+3+4
- `.planning/REQUIREMENTS.md` — SEED-01 / SEED-02 (validados Phase 4), SEED-03 a añadir en plan-phase
- `.planning/ROADMAP.md` §"Phase 5" — Goal, 6 success criteria (categories.json 7ª entrada / essere.json ≥30 / cobertura 6 sub-áreas + participio / DESIGN RULE / ≥1 multi-cat / UAT humano)
- `.planning/STATE.md` — Decisiones acumuladas (schemaVersion: 3, 232 ejercicios totales, 6 categorías actuales)

### Phase 1 (vigente)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — D-01..D-23 (schema validator, NFC, layer purity, registry pattern)

### Phase 2 (vigente)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — D-24..D-55 (cascada D-54 inmediata, applyNewExerciseRegression DOMAIN-06 reactivo al añadir essere)

### Phase 3 (vigente)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` — D-56..D-72 (dispatch table 3 tipos, word-buttons grading + distractoras)

### Phase 4 (vigente — antecedente directo de este plan)
- `.planning/phases/04-backup-robusto-contenido-completo/04-CONTEXT.md` — **D-85** (Claude propone JSON sin PDF, autor revisa), **D-86** (tipo natural por categoría), **D-87** (multi-cat semánticos naturales), **D-88** (APPEND-ONLY avere.json + script de blindaje)
- `.planning/phases/04-backup-robusto-contenido-completo/04-04-SUMMARY.md` — patrón multi-cat real avere-300..305 + smoke test cascada
- `.planning/phases/04-backup-robusto-contenido-completo/04-02-SUMMARY.md` — patrón "1 plan = 1 categoría nueva commits secuenciales"

### Code references (leer antes de planificar)
- `content/categories.json` — EXTENDER de 6 a 7 entradas: insertar essere order:2, desplazar order +1 en las 5 existentes (preposiciones, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones). Avere mantiene order:1.
- `content/exercises/avere.json` — referencia visual de patrón (33 ejercicios verbo central + 6 multi-cat al final). NO MODIFICAR (D-88 blindado).
- `content/exercises/avere.json` líneas 200-266 — patrón exacto de los 6 cruces multi-cat (avere-300..305) a espejar como essere-300..305.
- `content/exercises/profesiones.json` — referencia para la mezcla mc + word-buttons (~43 mc + 5 wb + 3 match — Phase 5 será ~35 mc + 4 wb + 0 match).
- `src/data/schema-validator.js` — sin cambios. Los 3 tipos están cubiertos en dispatch table. Solo se ejercita más al validar 7 archivos en boot.
- `src/data/content-loader.js` — sin cambios. Itera dinámicamente `categories.json` — la 7ª categoría se carga automáticamente.
- `src/domain/progress.js` — sin cambios. `applyNewExerciseRegression` (DOMAIN-06) se activa al boot tras añadir essere: si el autor ya tiene `state.categoryProgress` cargado pre-Phase 5 (no existe `categoryProgress["essere"]`), la categoría aparece como `no-hecha` automáticamente. Ningún `categoryProgress` existente se ve afectado.
- `src/domain/session.js` — sin cambios. Sampler GUARANTEE+FILL agnóstico al número de categorías.
- `tests/data/multi-cat-content.test.mjs` — verificar si cubre automáticamente los essere-300..305 (debería; está parametrizado por archivo). Si no, extender.

### External docs (consulta puntual al transcribir)
- Conjugación essere presente A1: estándar — no requiere fuente externa, pero el autor puede contrastar con [Treccani](https://www.treccani.it/vocabolario/) en caso de duda en participio (`stato/stata/stati/state`).
- Concordancia género/número español→italiano: nada nuevo respecto a profesiones.json y genero-numero.json — patrones ya establecidos en Phase 4.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`content/categories.json` patrón**: array de 6 objetos `{id, name, order}`. Insertar el 7º es trivial. El loader itera, no hace lookup hardcoded.
- **`content/exercises/avere.json` patrón**: 17 base + 6 multi-cat al final (IDs 300+). Espejo directo para essere.json (33 base + 6 multi-cat 300..305).
- **Schema validator dispatch table (PAYLOAD_VALIDATORS)**: cubre los 3 tipos. essere.json solo usa multi-choice + word-buttons → cubierto.
- **Sampler GUARANTEE phase**: garantiza ≥1 ejercicio por categoría elegida en Repaso 20. Con 7 categorías × Repaso 20 → 7 ejercicios garantizados + 13 ponderados. Coherencia: matemáticamente sigue funcionando (GUARANTEE 7 ≤ 20).
- **Cascada D-54 inmediata**: aplica idénticamente a los multi-cat essere-300..305 al fallar — sin cambios estructurales.
- **applyNewExerciseRegression (DOMAIN-06)**: dispara al boot detectando los ~39 ejercicios nuevos. No afecta a categorías existentes con `categoryProgress["avere"].state="hecha"` etc. — solo crea `categoryProgress["essere"]` con `state="no-hecha"`.

### Established Patterns

- **D-85 (Phase 4)**: Claude propone JSON desde conocimiento → autor revisa → commit. **Aplica idéntico a Phase 5**, sin PDF.
- **D-86 (Phase 4)**: tipo natural por categoría. **Essere = verbo central → mayoría multi-choice + word-buttons puntuales**. No forzar match (DESIGN RULE).
- **D-87 (Phase 4) — multi-cat semánticos naturales**: 6 cruces essere-300..305 siguen el principio (cada cruce tiene sentido pedagógico real, no relleno).
- **D-88 (Phase 4) — APPEND-ONLY post-commit**: aplica también a essere.json una vez ancho — pero el script de blindaje no se replica en Phase 5 (ROI no justifica para una categoría que aún no acumula UAT).
- **Spanish UI / IDs ASCII**: `id: "essere"`, `name: "Essere (cópula)"` o similar.
- **Apóstrofes ASCII**: `c'è`, `un'amica`, `d'accordo` con `'` puro.

### Integration Points

- **Boot path**: `content-loader.js` lee `categories.json`, para cada categoría carga `content/exercises/{id}.json`. Tras Phase 5, son 7 fetches en lugar de 6. Banner de error CONT-05 actúa idénticamente si essere.json es malformado.
- **Home dashboard**: la tabla densa muestra 7 filas en vez de 6 — el factory `appShell` itera `content.categories` sin cambios. Visual: el dashboard crece 1 fila — Pico CSS responsive, sin overflow esperado.
- **Sampler `buildSession`** + **`buildFullTest`**: ambos agnósticos. Con 7 categorías × ejercicios totales ahora ~271 (232 actuales + ~39 nuevos), un Test completo de TODAS las categorías genera una sesión de 271 ejercicios. Aviso del Test completo D-44 muestra la cifra correcta automáticamente.
- **Picker en pre-sesión**: checkboxes por categoría — añadir la 7ª es trivial. Sub-estados `selectedCategoryIds` ya iteran sobre `content.categories`.
- **Backup export/import**: schemaVersion sigue siendo 3. essere.json y categories.json forman parte de `content/`, no del `state` → no afectan al archivo de backup. Backups pre-Phase 5 importados en post-Phase 5 conservan su `categoryProgress`, y al boot la nueva categoría `essere` se crea como `no-hecha` automáticamente vía DOMAIN-06.

### Estructura final esperada (post-Phase 5)

```
content/
├── categories.json                  # EXTENDIDO: 7 entries (avere order:1 + essere order:2 + resto +1)
└── exercises/
    ├── avere.json                   # SIN CAMBIOS (D-88 blindado)
    ├── essere.json                  # NUEVO: ~33 base (29 mc + 4 wb) + 6 multi-cat 300..305 = ~39 totales
    ├── genero-numero.json           # SIN CAMBIOS
    ├── verbos-movimiento.json       # SIN CAMBIOS
    ├── profesiones.json             # SIN CAMBIOS
    ├── sustantivos-irregulares.json # SIN CAMBIOS
    └── preposiciones.json           # SIN CAMBIOS
```

Cero cambios en `src/`, `index.html`, `tests/` salvo (opcional) extender `tests/data/multi-cat-content.test.mjs` para cubrir essere-300..305 si no lo hace automáticamente.

</code_context>

<specifics>
## Specific Ideas

- **El milestone v1.0 no se cierra hasta tener essere**: detectado durante UAT post-Phase 4 — la simetría con Avere es fundamental para A1. Phase 5 es el último ladrillo antes de `/gsd:complete-milestone v1.0`.
- **Contraste essere/avere = core pedagógico**: cada multi-choice de essere DEBE ejercitar el contraste (D-91). El hispanohablante usa "ser" donde el italiano usa `essere` y "tener" donde usa `avere`, pero hay zonas grises (edad: italiano `avere`, español "tener"; estado: italiano `essere`, español "estar" — falso amigo). El sistema "te obliga a no olvidar" funciona aquí ejercitando justamente esa frontera.
- **Participio `stato/stata/stati/state` SÍ A1**: cualquier curso italiano para hispanohablantes lo introduce desde la unidad 4-5. El roadmap dejó "si viable" como hedge — la respuesta es sí.
- **Cero cambios runtime**: Phase 5 es 100% contenido. Cero modificaciones a `src/*` o `index.html` esperadas. Esto baja el riesgo a "Claude genera italiano correcto / autor revisa". El planner debe destacar este punto al diseñar tests (probablemente cero tests nuevos salvo extensión auto del smoke multi-cat).
- **Commits secuenciales sugeridos (planner refina)**:
  1. `content(categories): añadir essere order:2 + desplazar +1 resto` (cambio cosmético atómico).
  2. `content(essere): ~33 ejercicios base con cobertura A1 completa` (29 mc + 4 wb).
  3. `content(essere): 6 cruces multi-cat essere-300..305` (espejo Phase 4).
  4. (Opcional) `test(multi-cat): extender smoke para cubrir essere-300..305`.
  - Cada commit revisable independientemente; el orden permite parar tras (1) si el autor quiere verificar el shift visual en el dashboard antes de invertir tiempo en el contenido.
- **El multi-cat essere+avere (essere-300)**: el cruce más interesante pedagógicamente — la misma frase obliga a usar `essere` para una cosa Y `avere` para otra. Probable que sea el ejercicio "estrella" de la categoría una vez ancho.
- **Ejercicios con `c'è` / `ci sono`** (constructor existencial): no se incluyen en Phase 5 — `esserci` es una categoría/sub-tema propio (out of scope D-83). Si el autor lo quiere, fase futura.

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **Match dentro de essere.json**: descartado en D-89 por DESIGN RULE Phase 4 (conjugación derivable por raíz). Reconsiderar solo si emerge una construcción no-derivable concreta (e.g., nacionalidad ↔ país irregular, profesión ↔ artículo específico).
- **Imperfecto / futuro / condicional de essere** (`ero/era/erano`, `sarò/sarà/saranno`, `sarei/sarebbe/sarebbero`): A2. Fase futura.
- **Imperativo de essere** (`sii`/`siate`): A2. Fase futura.
- **Constructor existencial `c'è` / `ci sono`** (esserci): merece su propia categoría/fase v2. Aparece tangencialmente en A1 pero como ítem aparte.
- **Modismos con essere** (`essere d'accordo`, `essere in ritardo`, `essere stanco morto`): pedagógicamente A1+, pero out of scope Phase 5 — se acumularían en una eventual "essere idiomático" sub-categoría.
- **Helper `assert-essere-prefix-unchanged.mjs`** (espejo del `assert-avere-prefix-unchanged.mjs` D-88): no se crea en Phase 5. El principio APPEND-ONLY se aplica por convención. Plantear si en v2 se acumulan suficientes essere ejercicios para justificar el blindaje estructural.
- **Cruces multi-cat adicionales** (essere×preposiciones lugar/tiempo, essere×otra futura categoría adjetivos): los 6 esperados D-94 cubren el espejo del patrón Phase 4. Más cruces pueden añadirse en fases v2 sin costo runtime.
- **Sub-categoría "essere con descrizione fisica"** (`Marco è alto, è biondo`): natural pero requiere PDF/material — out of scope hasta que llegue contenido de "adjetivos descriptivos".
- **UI específica para multi-cat en el resumen** (highlight visual cuando una sola fallo afecta 2+ categorías): Phase 2 ya lo cubre genéricamente — no requiere refuerzo en Phase 5. Reconsiderar si UAT muestra que el efecto pasa desapercibido en sesiones reales.

</deferred>

---

*Phase: 5-Essere — categoría fundamental que faltaba*
*Context gathered: 2026-05-24*
