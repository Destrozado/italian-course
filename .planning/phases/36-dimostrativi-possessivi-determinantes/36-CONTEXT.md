# Phase 36: Dimostrativi + Possessivi (determinantes) - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Dar de alta **2 categorías nuevas de examen** nacidas en slot+variantes, autoradas 1-por-1 por quórum cross-vendor R1-R7, y registradas en `categories.json`:

- **`dimostrativi`** (order 11): `questo/questa/questi/queste` (vicino) con elisión `quest'` ante vocal + formas tipo-artículo de `quello` (`quel/quello/quell'/quei/quegli/quelle`) según disparador fonético + colapso de calco ES 3-vías (este/ese/aquel) → IT 2-vías (`questo`/`quello`) + pronombre neutro `ciò` y formas pronominales. Enganche fuerte con `articoli` (quello espeja lo/gli).
- **`possessivi`** (order 12): concordancia de la forma posesiva con la COSA POSEÍDA (no el poseedor) + artículo determinado OBLIGATORIO (`la mia casa` vs español `mi casa`) + excepción de parentesco singular sin modificar que ELIMINA el artículo (`mia madre`) + retorno del artículo con plural/`loro`/alteración (`le mie sorelle`, `il loro padre`, `la mia mamma`) + ambigüedad de `suo` (his/her) y `loro` posesivo INVARIABLE. Enganche con `articoli` y `genero-numero`.

Clon EXACTO del patrón v1.7 (`presente-regolare`, Phase 30): categoría nueva nacida directamente en slot+variantes (nunca legacy payload), explanation a nivel de slot, cruces multi-cat con id estable + `categoryIds` de 2. Cubre DEMOS-01..05 + POSS-01..05.

**Dentro de scope:** los 2 archivos `content/exercises/dimostrativi.json` y `content/exercises/possessivi.json` (slots + variantes por quórum), su registro en `categories.json` (order 11/12), y los cruces multi-cat de esta fase.

**Fuera de scope:** migración `11→12` (ya hecha en Phase 35), `origen`/PROV-01 (Phase 39), la re-sincronización de los 3 arrays de conteo + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE` (Phase 39 lockstep), Modali (Phase 37), Riflessivi (Phase 38). **NO se toca el motor v1.4** (cascada D-54 = EXACTAMENTE 2 call-sites; sampler; slot-engine; schema-validator; migración).

**Nota de count-sync:** esta fase AÑADE contenido; los conteos hardcoded quedarán en rojo hasta que Phase 39 los sincronice. Es rojo esperado (mismo patrón que v1.6/v1.7 dejaban el sync para la fase de cierre). El planner puede optar por sincronizar los counts de estas 2 categorías al final de Phase 36 O dejarlo a Phase 39 — decisión de plan, pero NO es un fallo si queda rojo hasta Phase 39.

</domain>

<decisions>
## Implementation Decisions

### Granularidad de slots (D-36-01) — CONSOLIDADO
- **D-36-01:** Las 6 formas tipo-artículo de `quello` van en **1 slot MC** (`dimostrativi-quello`) con las formas como **variantes contrastantes por disparador fonético** (`quel`/`quello`/`quell'`/`quei`/`quegli`/`quelle`) + **1 slot `match`** sustantivo→forma (`dimostrativi-match-quello`, análogo `articoli-049`). NO se hace el split fino por clase fonética que hizo `articoli` en Phase 19 — pocos slots densos, coherente con `presente-regolare`. El magnet `quei/quegli` se cubre con variantes contrastantes dentro del slot + el match.
- **Magnet #1 (quei/quegli):** cada variante-nombre debe pasar por la tabla fonética (R5 checklist) ANTES de escribir la key; **ronda EXTRA de quórum con pase DeepSeek obligatorio** sobre los slots de `quello` (INT-04). DeepSeek es estricto exactamente en esta clase (precedente v1.2: cazó 8 bugs de articoli que human-verify aprobó).

### Inventario de slots table-stakes (guía research, no rígido)
- **dimostrativi (~4 table-stakes + diferenciadores):** `questo` concordancia (género/número) · `quest'` elisión ante vocal · formas de `quello` (1 MC + 1 match, D-36-01) · colapso ES 3-vías→IT 2-vías con anclas de distancia.
- **possessivi (~4 table-stakes + diferenciadores):** concordancia `mio/tuo/suo`×`la/il/i/le` con la cosa poseída · artículo obligatorio · excepción parentesco singular (drop) · retorno del artículo (plural/`loro`/alterado).
- El mapa exacto de slots (nombres de id, nº final) lo fija el planner/executor con checkpoint:decision del autor (patrón v1.6/v1.7 de aprobar el mapa de reagrupación). Esta guía es la cobertura mínima que satisface los requisitos + SC.

### Profundidad A2/diferenciadores (D-36-02) — HÍBRIDO
- **D-36-02:** DEMOS-05 y POSS-05 son requisitos obligatorios; se cubren con el **patrón híbrido PROF-01/SOST-01** (no forzar variantes sintéticas sobre puntos léxicos):
  - **`ciò`** (pronombre neutro) → **slot léxico single-variant DOCUMENTADO** "sin autoría de variantes" en `notes` (forma esencialmente única; forzar `ciò che`/`per ciò`/`è ciò che` como variantes = padding low-value, Pitfall 7).
  - **formas pronominales `questo`/`quello`** (questo/questa/questi/queste, quello/quella/quelli/quelle) → 1 slot con variantes (más simples que el `quello` adjetival).
  - **`suo` his/her** → 1 slot con variantes donde **género del poseedor ≠ género de lo poseído** (`Marco lava ___ macchina` → `la sua`), para forzar el modelo correcto (Pitfall 4). NO apoyarse en el gloss ES para enseñar esto (el español no lo expone).
  - **`loro` invariable** → 1 slot (`il loro`/`la loro`/`i loro`/`le loro`, siempre con artículo).

### Excepción de parentesco possessivi (magnet #2)
- **Slot dedicado** con variantes que abarcan DELIBERADAMENTE ambos lados de la frontera: `mia madre` (drop) vs `la mia mamma` (alterado→keep) vs `le mie sorelle` (plural→keep) vs `il loro padre` (`loro`→keep). El slot enseña la frontera vía variantes contrastantes (R6: 1 punto por ejercicio, pero el SLOT enseña el límite).
- **Ronda EXTRA de quórum con pase DeepSeek** sobre este slot (INT-04). Verificar las 4 carve-outs antes del quórum: `le mie sorelle`, `il loro padre`, `la mia mamma`, `mia madre`.

### Match en Possessivi (D-36-03) — MC-ONLY
- **D-36-03:** El **único** slot `match` de la fase es el de `dimostrativi` (`quello`, D-36-01). En `possessivi` NO se añade el match familia-vs-común: la selección de forma posesiva es derivable por raíz (género/número del sustantivo) → **MC con distractora del calco** `mi casa` → `*mia casa` (sin artículo). Safe default de la research. La ausencia/presencia de artículo se enseña con MC + la distractora, no con match.

### Cruces multi-cat (D-36-04) — 1 POR PAR
- **D-36-04:** 3 ejercicios-cruce, 1 por cada par exigido por SC#4, espejo exacto de `presente-regolare-300..303` (id estable + `categoryIds` de 2):
  - `dimostrativi-300` → `categoryIds: ["dimostrativi", "articoli"]` (quello espeja lo/gli).
  - `possessivi-300` → `categoryIds: ["possessivi", "articoli"]` (el posesivo lleva artículo).
  - `possessivi-301` → `categoryIds: ["possessivi", "genero-numero"]` (concordancia con la cosa poseída).
- **Invariante D-54:** los cruces se autoran como slots+variantes normales reusando `applyResultToSession`; **NO añaden call-sites** de `applyImmediateFailure` (siguen EXACTAMENTE 2: `app.js:1642` decisión final, `app.js:1969` primer fallo de match). Verificable por grep + smoke paramétrico (readdir auto-cubre los cruces nuevos).

### Scope-gate dimostrativi (SC#2)
- **`codesto`** documentado OUT-OF-SCOPE en `notes` de `dimostrativi` (near-archaic/toscano-regional, refuerza el modelo ES 3-vías equivocado). NUNCA autorado como key ni distractora (Pitfall 2).
- El colapso ES→IT usa **anclas de distancia** (`qui`/`là`, cerca/lejos) en cada fill-in para forzar una sola lectura (sin doble-validez `questo`-vs-`quello`). Gloss ES `(en español: …)` donde dos respuestas serían defendibles (R7).

### Canon editorial (locked por memoria del proyecto)
- Explanations en español acentuado (RAE) + apóstrofes ASCII U+0027 + plain text (sin markdown) + gloss `(en español: …)` canónico donde desambigua. Italianismos citados literalmente preservan ortografía italiana (`quegli`, `mia madre`, `città`). Sin leak de regla/disparador en el prompt (R1: nada de `(s impura → quello)`, `(parentesco)`, forma-objetivo nombrada). Sin smart-quotes.
- `validation.status: validated` (≥2 passes correcta, ≥2 `by` distintos) en cada variante nueva; base canónica Claude Opus+Sonnet, refuerzo Gemini/DeepSeek vía `validate-ai-pass.mjs` (auto-fallback 429 → deepseek-reasoner como 2º `by`).

### Claude's Discretion
- Nombres exactos de los ids de slot (semánticos, con prefijo `dimostrativi-`/`possessivi-`), nº final de slots por categoría, y qué slots usan word-buttons vs MC (guía research: MC para producción de forma; word-buttons donde aporte). El mapa de slots se aprueba por el autor en checkpoint:decision al inicio de la autoría (patrón v1.6/v1.7).
- Estructura de plans de la fase (probable: 1 track dimostrativi + 1 track possessivi, o mapa+autoría+cruces por categoría) — decisión del planner; las 2 categorías son independientes entre sí.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### El patrón a clonar (v1.7 — precedente EXACTO de categoría nueva nacida en slots)
- `content/exercises/presente-regolare.json` — shape de referencia: top-level `{notes, exercises[]}`; cada slot `{id, type, categoryIds:[slug], explanation, variants:[≥2], validation}`; cruces `presente-regolare-300..303` con id estable + `categoryIds` de 2 (avere/essere). El `notes` documenta el 0-match por decisión D-04 (modelo para documentar `ciò` sin-autoría y `codesto` OOS).
- `.planning/milestones/v1.7-ROADMAP.md` — Phase 30 (alta de categoría) + Phase 31 (cruces + lockstep). El análogo directo.

### El análogo del match de quello
- `content/exercises/articoli.json` — `articoli-049`/`articoli-050` (slots `match`): plantilla EXACTA del match sustantivo→forma de `quello` (disparador fonético lo/gli no derivable por raíz). También la familia lo/gli/uno para verificar las clases fonéticas de `quel/quello/quell'/quei/quegli/quelle`.

### Requisitos
- `.planning/REQUIREMENTS.md` — DEMOS-01..05 (líneas 17-21) y POSS-01..05 (líneas 25-29). INT-03/INT-04 (cruces + quórum con rondas extra en magnets) para el contexto del cierre.

### Investigación del milestone (LEER antes de autorar)
- `.planning/research/FEATURES.md` — **el inventario de reglas/slots candidatos** por categoría (§Per-category slot summary línea ~103, §match justification línea ~114). Da la cobertura table-stakes/diferenciador y la justificación match por la DESIGN RULE. DEMOS ~4+2 slots, POSS ~4+2 slots.
- `.planning/research/PITFALLS.md` — **los 2 magnets de esta fase**: Pitfall 1 (quello `quei/quegli` split, DeepSeek pass), Pitfall 2 (ES 3-vías→IT 2-vías, anclas + codesto OOS), Pitfall 3 (excepción parentesco carve-outs), Pitfall 4 (concordancia con la cosa poseída). Pitfall 7 (no forzar variantes sobre léxico → `ciò`), Pitfall 8 (R1 leak), Pitfall 9 (gloss ES R7), Pitfall 10 (acentos español = bug real, no override).
- `.planning/research/ARCHITECTURE.md` — Pattern 1 (alta = clon v1.7), Pattern 3 (append order 11/12, el `order` es documental, el array define el display), Pattern 5 (cruces multi-cat, D-54 en 2 call-sites). §Count Sync (touch-points exactos para Phase 39).

### Contrato de slugs (Phase 35)
- `.planning/phases/35-migraci-n-11-12-reset-selectivo-preventivo-de-las-4-categor-/35-CONTEXT.md` — D-35-01/02: los slugs `dimostrativi`/`possessivi` son el contrato transversal (id en categories.json + nombre de fichero + prefijo de id de ejercicios + prefijo de RESET_PREFIXES_V12). Phase 36 DEBE usar exactamente estos slugs.

### Infra de quórum
- Skill `gsd-validate-exercise` (Opus + Sonnet, C1-C5, NUNCA batched, 1 subagent fresh por ejercicio) — la vía canónica de validación.
- `scripts/validate-ai-pass.mjs` (Gemini/DeepSeek, auto-fallback 429, `--write`) — refuerzo cross-vendor; claves en `.env`.
- `docs/` reglas R1-R7 (referenciadas por la skill y las memorias del proyecto).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`content/exercises/presente-regolare.json`**: copiar la ESTRUCTURA (top-level `{notes, exercises}`, slots con `variants[]` + `validation`, cruces 300+). Es el molde de una categoría nueva nacida en slots.
- **`articoli-049`/`articoli-050`**: copiar la estructura del slot `match` verbatim para el match de `quello`.
- **`categories.json`**: 10 entradas hoy (order 1-10); APPEND 2 entradas al final (`dimostrativi` order 11, `possessivi` order 12). El array define el orden de display; `order` es documental (no se lee para ordenar).

### Established Patterns
- **Nace en slot+variantes (≥2 por slot rule-rich), NUNCA legacy payload** (Anti-Pattern 4 de ARCHITECTURE; establecido en v1.7). Excepción híbrida documentada: slots léxicos single-variant (`ciò`) con `notes` "sin autoría" (patrón PROF-01/SOST-01, D-36-02).
- **DESIGN RULE (D-04):** `match` solo si el pareo NO es derivable por raíz. Aquí: dimostrativi `quello` (disparador fonético) SÍ califica (1 match); possessivi core NO (derivable por género/número → MC), D-36-03.
- **Cruces multi-cat** con id estable + `categoryIds` de 2, reusando `applyResultToSession` — 0 nuevos call-sites de `applyImmediateFailure` (D-54 = 2 call-sites, `app.js:1642`/`app.js:1969`).
- **Canon editorial** (español acentuado RAE, ASCII apóstrofe, plain text, gloss ES, no R1 leak) + **quórum cross-vendor con ronda extra en magnets**.

### Integration Points
- `content-loader.js loadContent()`: fetch de cada `content/exercises/<slug>.json` + NFC + `validateContent` (permisivo, ignora campos extra) + `exerciseById`/`slotById` via `normalizeExerciseToSlot`. Las 2 categorías nuevas se cargan genéricamente en boot.
- `app.js categoriesForDisplay`: itera `content.categories` en orden de array; deriva status/streak/count/examenEnabled genéricamente → las 2 filas nuevas aparecen en el home sin código nuevo.
- Motor: NO se toca. Sampler, cascada, promociones, racha, migración, backup — intactos.

</code_context>

<specifics>
## Specific Ideas

- **Magnets marcados para ronda extra + pase DeepSeek** (INT-04): (1) las variantes de `quello` (`quei/quegli` split), (2) el slot de excepción de parentesco (carve-outs `le mie sorelle`/`il loro padre`/`la mia mamma`). Verificar cada key contra la tabla fonética / las 4 carve-outs ANTES del quórum.
- **`ciò` es lexical single-variant**, documentado en `notes` — que un reviewer futuro no lo marque como slot incompleto.
- **Anclas de distancia (`qui`/`là`)** en cada fill-in del colapso ES→IT para matar la doble-validez `questo`-vs-`quello`.
- **`suo`**: autorar al menos una variante con género del poseedor ≠ género de lo poseído (`Marco lava la sua macchina`) para ejercer la trampa real; el gloss ES no la expone.

</specifics>

<deferred>
## Deferred Ideas

- **Sincronización de counts + `TOTAL_EXPECTED` + `TOTAL_EXPECTED_BASELINE`** — es Phase 39 (lockstep de cierre). Si el planner decide sincronizar los counts de estas 2 categorías al final de Phase 36 para dejar la suite verde antes, es aceptable, pero el sync completo del milestone (incl. Modali/Riflessivi) vive en Phase 39.
- **PROV-01 `origen: "ia-quorum"`** en las entradas de `categories.json` de estas 2 categorías — es Phase 39 (transversal). El registro base (id/name/order) sí es de Phase 36; el campo `origen` se estampa en Phase 39.
- **Match familia-vs-común en possessivi** — considerado y DESCARTADO (D-36-03): MC con distractora del calco es el safe default. No fabricar el match salvo que emerja dolor real.
- **Modal + clítico / reflexivos recíprocos / codesto** — out-of-scope de v1.9 (backlog milestone de pronombres / tiempos pesados).

### Reviewed Todos (not folded)
- **"Responsive móvil — gutters del figure (Home) + tamaño del prompt en ejercicios"** (`area: ui`, score 0.9) — MISMO falso positivo que en Phase 35: el matcher puntúa alto por solapamiento de palabras genéricas (home/prompt/ejercicios), pero es trabajo de CSS responsive móvil, ajeno a una fase de autoría de CONTENIDO JSON. Pertenece al backlog "responsive móvil", no a v1.9. No plegado.

</deferred>

---

*Phase: 36-Dimostrativi + Possessivi (determinantes)*
*Context gathered: 2026-07-01*
