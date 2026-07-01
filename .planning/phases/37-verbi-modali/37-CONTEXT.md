# Phase 37: Verbi modali - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Dar de alta **1 categoría nueva de examen** nacida en slot+variantes, autorada 1-por-1 por quórum cross-vendor R1-R7, y registrada en `categories.json`:

- **`modali`** (order 13): presente indicativo irregular de `potere / volere / dovere` en las **6 personas** (`posso/puoi/può/possiamo/potete/possono` y análogos de volere/dovere) + la construcción **modal + infinitivo** (`posso andare`, `voglio mangiare`, `devo studiare`), con el infinitivo invariable gobernado por el modal conjugado. Cubre MODAL-01 + MODAL-02.

**Slug contract (Phase 35, D-35-01/02 — INVIOLABLE):** el `id`/slug de la categoría es **`modali`** (italiano corto), NO `verbi-modali` (que es solo el nombre del directorio de la fase y el título de tema). Ese slug es el contrato transversal: (a) `id` en `categories.json`, (b) nombre de fichero `content/exercises/modali.json`, (c) prefijo de los ids de ejercicio (`modali-*`) y de cruce (`modali-300`), (d) prefijo ya presente en `RESET_PREFIXES_V12`. La fase DEBE usar exactamente `modali`.

Clon EXACTO del patrón v1.7 (`presente-regolare`, Phase 30) y de Phase 36 (`dimostrativi`/`possessivi`): categoría nueva nacida directamente en slot+variantes (nunca legacy payload), explanation a nivel de slot, `validation` por variante, cruce multi-cat con id estable + `categoryIds` de 2.

**Dentro de scope:** el archivo `content/exercises/modali.json` (slots + variantes por quórum + 1 cruce), su registro en `categories.json` (append, order 13), y el cruce `modali-300` (modali↔presente-regolare).

**Fuera de scope (HARD):**
- **Passato prossimo modal** (`ho dovuto` / `sono dovuto` + participio, auxiliar prestado del infinitivo) — scope-gate DURO documentado OUT-OF-SCOPE en las `notes` de la categoría; magnet de doble-validez diferido a PASSPROX-01 (backlog de tiempos pesados). NINGUNA variante puede contener modal + participio ni un `ho/sono/hai/sei…` + PP de modal (SC#3, Pitfall 5).
- `origen`/PROV-01 (Phase 39), la re-sincronización de los 3 arrays de conteo + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE` (Phase 39 lockstep), migración `11→12` (Phase 35, ya hecha), Riflessivi (Phase 38).
- `sapere` como 4º modal, modal + clítico (`voglio farlo`/`lo voglio fare`) — out (requieren clíticos como contenido; backlog).
- **NO se toca el motor v1.4** (cascada D-54 = EXACTAMENTE 2 call-sites; sampler; slot-engine; schema-validator; migración; backup).

**Nota de count-sync:** esta fase AÑADE contenido (categoría + cruce); los conteos hardcoded quedarán en rojo hasta que Phase 39 los sincronice. Es rojo esperado (mismo patrón v1.6/v1.7/Phase 36). El planner puede optar por sincronizar los counts de `modali` al final de Phase 37 O dejarlo a Phase 39 — decisión de plan, NO es un fallo si queda rojo hasta Phase 39.

</domain>

<decisions>
## Implementation Decisions

### Cruce multi-cat (D-37-01) — SÍ, 1 CRUCE
- **D-37-01:** Se autora **1 ejercicio-cruce** `modali-300` con `categoryIds: ["modali", "presente-regolare"]` — el modal conjugado gobernando un infinitivo de verbo regular (el infinitivo gobernado es exactamente el enganche que `FEATURES` marca: "modal+infinitive enhances presente-regolare"). Ninguna SC/INT de Phase 37 lo EXIGE (a diferencia de Phase 36 SC#4), pero mantiene simetría con Phase 36 y refuerza el loop cross-categoría.
- **Invariante D-54:** el cruce se autora como slot+variantes normal reusando `applyResultToSession`; **NO añade call-sites** de `applyImmediateFailure` (siguen EXACTAMENTE 2: `app.js:1642` decisión final, `app.js:1969` primer fallo de match). Verificable por grep + smoke paramétrico (readdir auto-cubre el cruce nuevo). El cruce depende de que `presente-regolare` exista (sí, order 10).

### Mapa de slots / granularidad (D-37-02) — GUÍA + CHECKPOINT DEL AUTOR
- **D-37-02:** El mapa exacto (nombres de id, nº final de slots, MC vs word-buttons por slot) lo aprueba el autor en **checkpoint:decision al inicio de la autoría** (patrón v1.6/v1.7/Phase 36 — D-36-01 aprobó el mapa de reagrupación). Aquí se fija solo la **cobertura mínima** que satisface MODAL-01/02 + las SC.
- **Cobertura table-stakes (guía research, no rígido):** FEATURES sugiere ~2 áreas (presente irregular de los 3 + modal+infinitivo), pero eso comprime 18 formas conjugadas — el autor decide si separa la conjugación por verbo (potere/volere/dovere como slots distintos con las 6 personas como variantes contrastantes) o consolida. El motor no impone; la decisión es de densidad pedagógica, aprobada en checkpoint.
- **0-match (D-04, heredado):** `match` NO justificado — person→form es derivable una vez conocido el paradigma irregular (mismo razonamiento que el 0-match explícito de `presente-regolare`). Solo MC + word-buttons. Documentar la decisión de 0-match en `notes` (mirror de `presente-regolare`).

### Diseño de distractoras del presente irregular (D-37-03) — 3 VECTORES
- **D-37-03:** Las "distractoras plausibles de conjugación" (SC#1) ejercen los **3 vectores reales de fallo A1**, mezclados según el slot:
  1. **Regularización falsa** — formas regularizadas esperables que el aprendiz produce por defecto (`*poto`/`*volo`/`*dovo`/`*potiamo`), contra la key irregular real.
  2. **Contaminación cross-verbo** — mezclar raíces/patrones entre los 3 modales (`voglio`/`*volio`, `devo`/`*dovo`, formas de un verbo aplicadas a otro).
  3. **Trampa del acento** — `può` (3ª sg, con acento grave) vs `puoi` (2ª sg) y análogos; el acento es parte de la key correcta (canon: acentuación italiana preservada literalmente en italianismos citados).
- Sigue R1: la distractora es plausible pero el prompt NO filtra la regla ni la persona objetivo. Cada distractora verificada por quórum.

### Profundidad modal + infinitivo (D-37-04) — PATRÓN ESTRUCTURAL
- **D-37-04:** La construcción modal+infinitivo (MODAL-02, SC#2) enseña el **patrón estructural** (modal conjugado + infinitivo INVARIABLE), no 3 frases memorizadas:
  - Los 3 modales gobernando **varios infinitivos distintos** (andare/mangiare/studiare/fare/… — variedad, no solo los 3 ejemplos canónicos del enunciado).
  - Ejercer la **posición** del infinitivo tras el modal con **≥1 slot word-buttons** donde el infinitivo sigue al modal conjugado (requisito duro SC#2).
  - Los ejemplos canónicos (`posso andare`/`voglio mangiare`/`devo studiare`) son el núcleo, no el techo.

### Canon editorial (locked por memoria del proyecto)
- Explanations en español acentuado (RAE) + apóstrofes ASCII U+0027 + plain text (sin markdown) + gloss `(en español: …)` canónico donde desambigua. Italianismos citados literalmente preservan ortografía italiana (`può`, `voglio`). Sin leak de regla/persona-objetivo en el prompt (R1: nada de `(irregular)`, `(2ª persona)`, forma-objetivo nombrada). Sin smart-quotes.
- `validation.status: validated` (≥2 passes correcta, ≥2 `by` distintos) en cada variante nueva; base canónica Claude Opus+Sonnet, refuerzo Gemini/DeepSeek vía `validate-ai-pass.mjs` (auto-fallback 429 → deepseek-reasoner como 2º `by`).

### Claude's Discretion
- Nombres exactos de los ids de slot (semánticos, con prefijo `modali-`), nº final de slots, y qué slots usan word-buttons vs MC (guía: MC para producción de forma conjugada; word-buttons para el patrón modal+infinitivo). El mapa se aprueba por el autor en checkpoint:decision (D-37-02).
- Estructura de plans de la fase (probable: 1 track — categoría única, más pequeña que Phase 36; mapa+autoría+cruce en secuencia) — decisión del planner.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El patrón a clonar (v1.7 + Phase 36 — precedente EXACTO de categoría nueva nacida en slots)
- `content/exercises/presente-regolare.json` — shape de referencia: top-level `{notes, exercises[]}`; cada slot `{id, type, categoryIds:[slug], explanation, variants:[≥2], validation}`; cruces `presente-regolare-300..303` con id estable + `categoryIds` de 2. El `notes` documenta el 0-match por decisión D-04 (modelo EXACTO para documentar el 0-match de `modali` y el scope-gate del passato prossimo modal).
- `content/exercises/dimostrativi.json` / `content/exercises/possessivi.json` — las 2 categorías gemelas recién nacidas (Phase 36); mismo molde, mismo canon, cruces `-300`.
- `.planning/phases/36-dimostrativi-possessivi-determinantes/36-CONTEXT.md` — el análogo directo (mismo milestone, mismo patrón); D-36-04 (cruce 1-por-par, id estable + categoryIds de 2, invariante D-54) es la plantilla del cruce `modali-300`.

### Contrato de slugs (Phase 35 — INVIOLABLE)
- `.planning/phases/35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-/35-CONTEXT.md` — D-35-01/02/03: el slug es **`modali`** (NO `verbi-modali`); ya en `RESET_PREFIXES_V12`; sin colisión `startsWith`. Phase 37 DEBE usar exactamente `modali`.
- `src/data/storage.js` — `RESET_PREFIXES_V12` (contiene `'modali'`); confirmar no-colisión del id elegido.

### Requisitos
- `.planning/REQUIREMENTS.md` — MODAL-01 (línea 33), MODAL-02 (línea 34); tabla de scope §Phase 37 (línea 130: "independiente; menor riesgo de quórum; scope gate duro → MODAL-PP-01 diferido").

### Investigación del milestone (LEER antes de autorar)
- `.planning/research/FEATURES.md` — inventario de reglas/slots candidatos (líneas 31-32: presente irregular + modal+infinitivo; línea 79-81: dependency graph modal→presente-regolare; líneas 107/118: **VERBI MODALI match NOT justified**, MC + word-buttons; línea 129 checklist; línea 152 P1). Confirma el 0-match y el enganche del cruce.
- `.planning/research/PITFALLS.md` — **Pitfall 5** (líneas 96-111): passato prossimo modal = scope creep + doble-validez swamp → HARD scope boundary (present + infinitivo SOLO; OOS note en `notes`). Pitfall 8 (R1 leak), Pitfall 9 (gloss ES R7), Pitfall 10 (acentos español = bug real). Línea 267: cautela prefix-collision `startsWith` (confirmar id `modali`).
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (alta = clon v1.7), Pattern 3 (append order 13; el `order` es documental, el array define el display), Pattern 5 (cruces multi-cat, D-54 en 2 call-sites). §Count Sync (touch-points exactos para Phase 39).

### Infra de quórum
- Skill `gsd-validate-exercise` (Opus + Sonnet, C1-C5, NUNCA batched, 1 subagent fresh por ejercicio) — la vía canónica de validación.
- `scripts/validate-ai-pass.mjs` (Gemini/DeepSeek, auto-fallback 429, `--write`) — refuerzo cross-vendor; claves en `.env`.
- `docs/` reglas R1-R7 (referenciadas por la skill y las memorias del proyecto).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`content/exercises/presente-regolare.json`**: copiar la ESTRUCTURA (top-level `{notes, exercises}`, slots con `variants[]` + `validation`, cruce 300+, `notes` documentando el 0-match). Molde de una categoría-verbo nacida en slots.
- **`content/exercises/dimostrativi.json`/`possessivi.json`**: precedente fresco del mismo milestone (Phase 36); mismo canon y shape.
- **`content/categories.json`**: hoy 12 entradas (order 1-12, con `dimostrativi`/`possessivi` ya añadidos en Phase 36). APPEND 1 entrada al final (`modali` order 13). El array define el orden de display; `order` es documental (no se lee para ordenar). El campo `origen` NO se estampa aquí (Phase 39, PROV-01).

### Established Patterns
- **Nace en slot+variantes (≥2 por slot rule-rich), NUNCA legacy payload** (Anti-Pattern 4 de ARCHITECTURE; establecido en v1.7, repetido en Phase 36).
- **DESIGN RULE (D-04):** `match` solo si el pareo NO es derivable por raíz. Aquí NO califica (person→form derivable por paradigma) → 0-match, solo MC + word-buttons (D-37-02).
- **Cruce multi-cat** con id estable (`modali-300`) + `categoryIds` de 2, reusando `applyResultToSession` — 0 nuevos call-sites de `applyImmediateFailure` (D-54 = 2 call-sites, `app.js:1642`/`app.js:1969`).
- **Canon editorial** (español acentuado RAE, ASCII apóstrofe, plain text, gloss ES, no R1 leak) + **quórum cross-vendor R1-R7**.

### Integration Points
- `content-loader.js loadContent()`: fetch de `content/exercises/modali.json` + NFC + `validateContent` (permisivo) + `exerciseById`/`slotById` via `normalizeExerciseToSlot`. La categoría nueva se carga genéricamente en boot.
- `app.js categoriesForDisplay`: itera `content.categories` en orden de array; deriva status/streak/count/examenEnabled genéricamente → la fila `modali` aparece en home/picker/Repaso/Examen sin código nuevo (SC#4).
- Motor: NO se toca. Sampler, cascada, promociones, racha, migración, backup — intactos.

</code_context>

<specifics>
## Specific Ideas

- **Scope-gate DURO del passato prossimo modal** — documentar OUT-OF-SCOPE en las `notes` de `modali` (mirror del 0-match de presente-regolare). NINGUNA variante con `ho/sono/hai/sei…` + participio de modal (grep-verificable). Es el magnet de doble-validez diferido a PASSPROX-01 (Pitfall 5).
- **Acento `può`** — la 3ª persona singular de potere lleva acento grave (`può`); es parte de la key correcta y también un vector de distractora (D-37-03). Preservar literalmente.
- **Cruce `modali-300`** = modal conjugado + infinitivo de verbo regular (enganche con `presente-regolare`); espejo exacto de la mecánica de cruce de Phase 36 (D-36-04) y `presente-regolare-300..303`.
- **word-buttons obligatorio** para la posición modal+infinitivo (SC#2): ≥1 slot donde el infinitivo invariable sigue al modal conjugado.

</specifics>

<deferred>
## Deferred Ideas

- **Passato prossimo modal (auxiliar prestado)** — `ho dovuto lavorare` / `sono dovuto andare`. Verified real pero A2+/B1 con doble-validez (colloquial acepta `avere` everywhere). HARD out-of-scope de v1.9; vive en el milestone de tiempos pesados (PASSPROX-01 / MODAL-PP-01). Nunca autorado en Phase 37.
- **Sincronización de counts + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE`** — Phase 39 (lockstep de cierre). Si el planner decide sincronizar los counts de `modali` al final de Phase 37 para dejar la suite verde antes, es aceptable; el sync completo del milestone (incl. Riflessivi) vive en Phase 39.
- **PROV-01 `origen: "ia-quorum"`** en la entrada de `categories.json` de `modali` — Phase 39 (transversal). El registro base (id/name/order 13) sí es de Phase 37; el campo `origen` se estampa en Phase 39.
- **`sapere` como 4º modal / modal + clítico (`voglio farlo`/`lo voglio fare`)** — out-of-scope (requieren clíticos como contenido; backlog de pronombres). `sapere` ≠ "can" limpiamente (skill vs ability).

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, score 0.9) — MISMO falso positivo que en Phases 35/36: el matcher puntúa alto por solapamiento de palabras genéricas (home/status/phase), pero es trabajo de CSS responsive móvil, ajeno a una fase de autoría de CONTENIDO JSON. Pertenece al backlog "responsive móvil", no a v1.9. No plegado.

</deferred>

---

*Phase: 37-Verbi modali*
*Context gathered: 2026-07-01*
