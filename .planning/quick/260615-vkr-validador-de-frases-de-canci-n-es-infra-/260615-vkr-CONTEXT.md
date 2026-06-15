# Quick Task 260615-vkr: Validador de frases de canción ES — INFRAESTRUCTURA - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Construir la INFRAESTRUCTURA de un validador de frases de canción (traducción italiano→español troceada) con quórum multi-modelo y reglas PROPIAS (S1-S5), espejo de la infra de ejercicios (`gsd-validate-exercise` + `scripts/validate-ai-pass.mjs`), pero adaptado a canciones.

ALCANCE DE ESTA TAREA = la infra + una prueba de fuego. NO incluye la pasada masiva sobre las 3 canciones (eso es un follow-up). Entregables:
1. Prompt de reglas S1-S5 (self-contained).
2. Script `scripts/validate-song-pass.mjs` (pase Gemini/DeepSeek sobre UNA frase de canción).
3. Extensión del schema (`validateSongs` acepta `validation` opcional en frases).
4. Fixture "golden" (1 frase mala conocida + 1 buena) para probar que el validador caza fallos.
5. Orquestación documentada del quórum (orden de disponibilidad DeepSeek→Gemini→Sonnet→Opus); el pase Claude (Sonnet/Opus) vía subagente Task como en ejercicios.
</domain>

<decisions>
## Implementation Decisions (LOCKED — del autor)

### Reglas propias S1-S5 (en el prompt del validador de canciones)
- **S1 — Español natural y con sentido**: la traducción es gramatical y SE ENTIENDE como frase en español. NO tiene que ser literaria, pero NO puede ser sin sentido ni agramatical. (Es el criterio que falló: "hace tiempo que sabes pienso que ni el tiempo me basta".)
- **S2 — Fidelidad con licencia poética**: transmite el significado del italiano; se ACEPTAN licencias poéticas/figuradas razonables (las canciones no son literales), pero NO contrasentidos ni omisiones/añadidos que cambien el sentido. Criterio explícito: las letras toman licencias que un aprendizaje estricto no aplicaría → no penalizar lo figurado, sí lo incomprensible o lo infiel.
- **S3 — Troceado correcto**: `answer` array de palabras; sin puntuación dentro de los tokens (salvo apóstrofo/guion interno); una palabra por token; sin tokens vacíos.
- **S4 — Ortografía/acentos RAE**: tildes y ñ correctas en el español (verificación carácter a carácter; no marcar falsos positivos sobre palabras YA bien acentuadas).
- **S5 — Prompt italiano fiel y limpio**: el italiano coincide con una letra plausible (sin alucinaciones evidentes ni erratas), normalizado (sin caracteres no-latinos espurios — cf. 'е' cirílica de Solo).
- Contrato de output: igual shape que ejercicios — bloque ```json con `verdict` ("correcta"|"incorrecta"), `criteria` (s1..s5 booleanas) y `concerns[]` tagged `[S1-...]`..`[S5-...]`. EXTRA para canciones: si S1/S2 falla, el concern DEBE incluir una **sugerencia de traducción mejor** (para corregir rápido).

### Quórum y modelos
- **1-por-frase** (estricto, fresh context — principio VAL-03). NUNCA batched.
- Quórum = 2 modelos DISTINTOS, elegidos por **orden de disponibilidad**: DeepSeek → Gemini → Sonnet → Opus. En la práctica: DeepSeek y Gemini (ambos vía el script `validate-song-pass.mjs`, con `--avoid` para garantizar 2 `by` distintos y `--fallback` por 429); Sonnet/Opus solo como fallback si los externos fallan (vía subagente Task, como `gsd-validate-exercise`).
- `deriveStatus` (reusar `src/data/validation-state.js`): 2× correcta con `by` distintos → validated; cualquier incorrecta → disputed (sticky).

### Almacenamiento
- Añadir campo `validation` OPCIONAL a cada frase de canción (`{status, passes[]}`), espejo de ejercicios. Las frases SIN `validation` siguen siendo válidas (back-compat, como ya pasa con ejercicios).
- Extender `validateSongs`: reutilizar `validateValidationShape(phrase, file, push)` (schema-validator.js L604, ya valida status enum + passes[] shape) llamándolo sobre cada frase si tiene `validation`.
- El script `validate-song-pass.mjs` debe INSERTAR el bloque `validation` en la frase si no existe (a diferencia de `validate-ai-pass.mjs`, que asume que ya existe); si existe, reemplazar el pase del mismo `by` y re-derivar status (igual que el de ejercicios).

### Prueba de fuego (golden negative — petición del autor)
- Preservar la traducción MALA original de `ti-dedico-il-silenzio-006` ("hace tiempo que sabes pienso que ni el tiempo me basta") como **fixture golden-negative** que el validador DEBE marcar incorrecta (S1 y/o S2). NO va en el contenido real (la canción ya está corregida) — va en `tests/fixtures/`.
- Incluir también 1 frase golden-positive (buena, p.ej. una de equilibrio-mentale) que el validador debe aprobar.
- Esto es la ACEPTACIÓN del validador: en la pasada real (follow-up) o en un smoke, el validador debe dar `incorrecta` a la mala y `correcta` a la buena. (No es unit-test determinista — el quórum es LLM/red; se documenta como check de aceptación con API keys.)

### Claude's Discretion
- Ubicación del prompt S1-S5 (sugerencia: `docs/SONG-VALIDATION-PROMPT.md`).
- Si `validate-song-pass.mjs` se hace como archivo nuevo (preferible, no romper el de ejercicios) reutilizando los helpers (httpPost, callModel, extractJsonBlock, matchBraceEnd, deriveStatus) — copiar o factorizar a un módulo común zero-deps.
- Forma exacta del fixture golden y si el "smoke de aceptación" es un script (`--check-golden`) o se hace manual en la pasada.
- Skill `gsd-validate-song` (mirror de gsd-validate-exercise) para orquestar el quórum por frase con el pase Claude por Task: puede quedar para el follow-up de la pasada; en esta tarea basta el script + prompt + schema + golden.
</decisions>

<specifics>
## Specific Ideas

- `scripts/validate-ai-pass.mjs` (referencia EXACTA a replicar): loadEnv, providerFor (gemini-*/deepseek-*), keyFor, httpPost (timeout 120s), callModel (429 auto-fallback honra Retry-After, 5xx retriable), extractJsonBlock (último ```json), writePass (anchor `"id": "<id>"` → `"validation":` → matchBraceEnd con conciencia de strings → JSON.parse → filtra by → push → deriveStatus → reescribe). El de canciones cambia: findSongPhrase en `content/songs/*.json` (estructura `{id, title, phrases:[{id,prompt,answer,categoryIds}]}` — buscar en `data.phrases`), prompt = SONG-VALIDATION-PROMPT.md, y writePass que INSERTA `validation` si falta.
- `src/data/validation-state.js` → `deriveStatus(passes)` (reusar).
- `src/data/schema-validator.js` → `validateValidationShape` (L604, reusar para frases); `validateSongPhrasePayload` (~L360, donde se valida prompt/answer/distractors/categoryIds — añadir la llamada a validateValidationShape).
- `.env`: GEMINI_API_KEY y DEEPSEEK_API_KEY presentes (verificado).
- Claves de modelo soportadas por el script: gemini-* (gemini-2.5-flash), deepseek-* (deepseek-v4-flash / -pro). Verificar los ids reales que usa el repo en run-validation-271.mjs.
- Tests: `node --test tests/*.test.js` (glob Node 22.20). Añadir test de SCHEMA: una frase de canción CON `validation` válida pasa; con `validation` mal formada falla (reusa el patrón de song-validator.test.js). El golden-negative del LLM NO es unit-test (no determinista). 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) — NO tocar.
</specifics>

<canonical_refs>
## Canonical References

- `scripts/validate-ai-pass.mjs` + `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` (la infra de ejercicios a espejar).
- Memorias: multi_vendor_quorum_validator, cross_vendor_catches_bugs, gloss_es_desambiguacion_canon (base Opus+Sonnet).
- Todo: `.planning/todos/pending/2026-06-15-validador-frases-canciones.md`.
</canonical_refs>
