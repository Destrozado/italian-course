# Phase 15: Modelo de datos slot+variantes + schema + migración - Context

**Gathered:** 2026-06-02
**Status:** Ready for planning

<domain>
## Phase Boundary

El contenido y el state pasan a soportar un modelo **slot+variantes** — cada slot representa una regla y contiene 1..N variantes intercambiables con una explicación compartida a nivel de slot — con validator estricto, migración `schemaVersion 5→6` (`migrate5to6` + `hydrateV6` + `backup.js` v6) y backward-compat de las 8 categorías no-piloto.

**En scope:** definición del shape JSON slot+variantes, extensión del schema-validator, normalización en el loader, cadena de migración del state a v6, round-trip de backup. Cubre SLOT-01..06.

**Fuera de scope (otras fases):** el sampler/examen que elige 1 variante por slot y la redefinición de "hecha" (Phase 16, EXAM-*); la conversión real de Preposiciones a slots + autoría de variantes nuevas + slot `in spiaggia` + reset de progreso (Phase 17, PILOT-*). Esta fase solo entrega el MODELO; el motor que lo explota y el contenido que lo llena vienen después.

</domain>

<decisions>
## Implementation Decisions

### Forma del JSON de un slot (SLOT-01, SLOT-02, SLOT-03)
- **D-15-01:** Se MANTIENE la lista `exercises[]` existente (no se introduce `slots[]`). Cada ejercicio ES un slot. Un ejercicio gana un campo **`variants[]` opcional**. Diff mínimo, una sola lista, coherente con la filosofía "cambios mínimos" del autor (que edita el JSON a mano).
- **D-15-02:** En un ejercicio-slot con `variants[]`, los campos `type`, `categoryIds` y `explanation` viven a **nivel de slot** (top-level del ejercicio). Cada entrada de `variants[]` es un objeto **plano** que lleva SOLO la superficie del payload según el tipo: `multiple-choice` → `{prompt, options, correctIndex}`; `word-buttons` → `{prompt, answer, distractors?}`; `match` → `{prompt, pairs}`. Las variantes NO llevan `explanation` propia (la comparten del slot, decisión v1.4 locked) ni `type`/`categoryIds`.
- **D-15-03:** Un slot puede tener 1 sola variante (excepción concreta sin variante posible, p. ej. `in spiaggia`); se trata con normalidad, sin caso especial.
- **D-15-04 (legacy = slot de 1):** Un ejercicio SIN `variants[]` conserva su `payload` actual y se interpreta como un slot de 1 variante cuya única variante es ese `payload` (con su `payload.explanation` actual como explicación del slot). Esto es lo que mantiene los 8 archivos viejos intactos.

### Tipo por slot (SLOT-01)
- **D-15-05:** `type` se queda a nivel de slot. Un slot NO puede mezclar tipos entre variantes — todas las variantes de un slot comparten el `type` del slot. La variabilidad viene del TEXTO (otros nombres/sustantivos/frases), no del formato. Mantiene grading/atajos de teclado/render idénticos dentro de un slot y simplifica el motor de Phase 16. (Mezclar tipos por variante fue considerado y descartado por complejidad sin valor proporcional — la memorización por palabras ya muere variando el texto.)

### Backward-compat de las 8 categorías (SLOT-06)
- **D-15-06:** Los 8 archivos de categoría no-piloto (avere, essere, verbos-movimiento, sustantivos-irregulares, genero-numero, profesiones, articoli, partitivos) NO se tocan byte-a-byte. El validador acepta AMBAS formas en el mismo archivo (un ejercicio con `payload` legacy XOR un ejercicio con `variants[]`). El loader normaliza internamente cada ejercicio legacy a un slot de 1 variante.
- **D-15-07:** Consecuencia obligatoria: el snapshot append-only de avere (D-88, `scripts/assert-avere-prefix-unchanged.mjs`) DEBE seguir verde, y los 372 bloques `validation` existentes NO se re-tocan ni se re-validan en esta fase. Si el plan necesita relajar el assert de avere, hacerlo SOLO al estilo D-178 (campos core), nunca tocando contenido validado.

### Migración del state a v6 (SLOT-05)
- **D-15-08:** Se incrementa `CURRENT_SCHEMA_VERSION` a 6 y se añaden `migrate5to6` + `hydrateV6` siguiendo EXACTAMENTE el patrón de la cadena existente (`migrate()` dispatcher con fall-through por `schemaVersion`, deep-clone defensivo vía `JSON.parse(JSON.stringify())` por sub-dict, anti-prototype-pollution T-04-02/CR-03, idempotencia, pureza). `backup.js` se extiende a v6 para round-trip export/import.
- **D-15-09:** El bump 5→6 se espera **nominal a nivel del state root** (como fue 3→4): el modelo slot+variantes vive en `content/`, no en el state. `exerciseStats` (contador de `timesShown` para el peso del sampler) sigue keyed por el id del ejercicio-slot — que NO cambia para los slots legacy ni para los nuevos slots de Preposiciones (heredan `preposiciones-NNN`). NO se introduce un sub-árbol nuevo en el state en esta fase. El reset de progreso de Preposiciones es Phase 17 (PILOT-04), no aquí.

### Claude's Discretion
- **Validador (SLOT-04):** decidir la implementación exacta del check "payload XOR variants" dentro de `validateContent` reusando el dispatch `PAYLOAD_VALIDATORS` por tipo para validar la superficie de cada variante; mensajes en español (FOUND-04); acumular todos los errores sin early-return (D-08); banner visible vía el path `loadContent` → `.errors` existente (D-10). Casos a rechazar: slot con `variants[]` vacío, variante sin la superficie válida para su tipo, presencia simultánea de `payload` y `variants[]`, `explanation` ausente cuando hay `variants[]` (SLOT-02 exige explicación a nivel slot para los slots nuevos; legacy con `payload.explanation` opcional sigue back-compat).
- **Esquema de ids de variante:** si el motor de Phase 16 / el render necesita identificar la variante mostrada (para `sessionResults` / review de errores), elegir el esquema (índice dentro del slot, o id derivado tipo `slot-id#k`). Decisión diferible a Phase 16 si no es necesaria para el modelo puro.
- **NFC normalize:** `normalizeNfcInPlace` en el loader ya es recursivo → cubre `variants[]` automáticamente, sin cambios.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements y roadmap de esta fase
- `.planning/REQUIREMENTS.md` §Modelo de datos slot+variantes (SLOT) — SLOT-01..06, criterios de aceptación.
- `.planning/ROADMAP.md` §Phase 15 — goal + 5 success criteria.

### Código que esta fase modifica/extiende (scout realizado)
- `src/data/schema-validator.js` — `validateContent` + dispatch `PAYLOAD_VALIDATORS` (multiple-choice/word-buttons/match) + `validateValidationShape`. Patrón D-08 (acumular errores, sin throw mid-walk). Aquí se añade el soporte slot+variantes.
- `src/data/content-loader.js` — `loadContent` (fetch → NFC `normalizeNfcInPlace` en el borde D-09 → `validateContent` → `exerciseById`). Aquí se normaliza legacy→slot-de-1 y se indexa.
- `src/data/storage.js` — cadena de migración (`migrate1to2`…`migrate4to5`, `hydrateV2`…`hydrateV5`, dispatcher `migrate()`, `CURRENT_SCHEMA_VERSION`, `blankState`). Aquí se añade `migrate5to6` + `hydrateV6` + bump a 6.
- `src/data/backup.js` — `parseBackupFile` + `buildBackupWrapper` (envoltura `{kind, exportedAt, schemaVersion, state}`, migración en import). Aquí se extiende a v6.

### Decisiones de proyecto que constriñen esta fase (PROJECT.md §Key Decisions)
- D-08 validator hand-written acumulador · D-09/CONT-06 NFC en el borde · D-88/D-178 append-only avere (snapshot+assert) · D-110/D-111 patrón de bump nominal 3→4 · D-02/D-03 patrón `migrate4to5`/`hydrateV5` con deep-clone defensivo (T-04-02/CR-03) · D-73 envoltura de backup.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PAYLOAD_VALIDATORS` (schema-validator.js): dispatch tipo→validador de superficie. Reutilizable tal cual para validar cada variante de un slot (la superficie de una variante es exactamente lo que estos validadores ya comprueban, sin el wrapper `.payload`).
- `normalizeNfcInPlace` (content-loader.js): recursivo → ya normaliza `variants[]` sin tocarlo.
- Cadena `migrateNtoM` + `hydrateVN` (storage.js): plantilla literal a copiar para `migrate5to6`/`hydrateV6` (deep-clone defensivo, idempotencia, pureza, dispatcher fall-through).
- `buildBackupWrapper`/`parseBackupFile` (backup.js): patrón de versión en la envoltura — extender a v6.

### Established Patterns
- **Validación acumulativa D-08:** un solo recorrido, push de todos los errores, nunca throw mid-walk, mensajes en español. La extensión slot+variantes debe respetarlo.
- **Migración en cadena por schemaVersion:** `migrate()` aplica eslabones con fall-through; el último hidrata. Nunca perder estado del autor; versión desconocida → warn + blankState.
- **`exerciseStats` keyed por id de ejercicio** para el peso `1/(1+min(timesShown,10))` del sampler — el id del slot es el ancla de peso/cleared; mantenerlo estable preserva el state legacy.

### Integration Points
- `loadContent` → `exerciseById` es el punto donde el resto del código (sampler Phase 16, render) consume el contenido. El shape que exponga esta fase (slot con variantes resueltas o no) define el contrato para Phase 16.
- `main.js` captura el Error con `.errors` y pinta el banner — el nuevo validador slot+variantes fluye por ese mismo path sin cambios.

</code_context>

<specifics>
## Specific Ideas

- El autor seleccionó explícitamente el preview de la forma `exercises[] + variants[]` con variantes planas (solo superficie) — ese ejemplo concreto es el contrato de autoría a respetar:
  ```
  { "id": "preposiciones-001", "type": "multiple-choice",
    "categoryIds": ["preposiciones"], "explanation": "...",
    "variants": [ {prompt, options, correctIndex}, {prompt, options, correctIndex} ] }
  ```
  y un ejercicio legacy sin `variants[]` (con `payload`) = slot de 1.
- Ejemplo canónico de slot de 1 variante (sin variante posible) que llega en Phase 17: `in spiaggia / in montagna / al mare / in campagna` (preposición locativa fija).

</specifics>

<deferred>
## Deferred Ideas

- **Mezclar tipos por variante dentro de un slot** — considerado (máximo anti-memorización: no sabes si te toca multiple-choice o word-buttons), descartado para v1.4 por complejidad de motor sin valor proporcional. Revisable en un milestone futuro si emerge dolor.
- **Sub-árbol de state slot-aware** (p. ej. tracking por variante) — no necesario; `exerciseStats` por id de slot basta. Revisable si el SRS evoluciona.

### Reviewed Todos (not folded)
- `2026-06-02-articulos-indeterminados-partitivos.md` ("Categoría artículos indeterminados y partitivos") — match débil (0.6) por keywords. Es una CATEGORÍA DE CONTENIDO nueva (un/uno/una + del/della...), no el motor de slots. Diferido a un milestone futuro de contenido; queda en `pending/`.

</deferred>

---

*Phase: 15-modelo-de-datos-slot-variantes-schema-migraci-n*
*Context gathered: 2026-06-02*
