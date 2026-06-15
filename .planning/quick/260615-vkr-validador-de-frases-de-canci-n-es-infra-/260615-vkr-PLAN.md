---
quick: 260615-vkr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/SONG-VALIDATION-PROMPT.md
  - scripts/validate-song-pass.mjs
  - src/data/schema-validator.js
  - tests/fixtures/song-golden.json
  - tests/song-validator.test.js
autonomous: true
requirements: [VKR-S1-S5, VKR-SCRIPT, VKR-SCHEMA, VKR-GOLDEN]

must_haves:
  truths:
    - "El prompt S1-S5 existe como documento self-contained con contrato de output (verdict/criteria/concerns) y exige sugerencia de traducción cuando S1/S2 falla."
    - "scripts/validate-song-pass.mjs emite un pase Gemini/DeepSeek sobre UNA frase de canción localizada por id en content/songs/*.json (data.phrases) y, con --write, INSERTA el bloque validation si la frase no lo tiene."
    - "validateSongs valida el campo validation opcional de cada frase reutilizando validateValidationShape; una frase con validation válida pasa y una mal formada falla."
    - "El golden-negative (traducción mala original de ti-dedico-006) y un golden-positive viven en tests/fixtures/, no en content/songs/."
    - "node --test tests/*.test.js no introduce fallos nuevos (el único fallo preexistente genero-numero 12→13 sigue igual)."
  artifacts:
    - path: "docs/SONG-VALIDATION-PROMPT.md"
      provides: "Prompt de reglas S1-S5 self-contained con contrato JSON"
      contains: "s1_"
    - path: "scripts/validate-song-pass.mjs"
      provides: "Pase cross-vendor por frase de canción con writePass que inserta validation"
      contains: "data.phrases"
    - path: "src/data/schema-validator.js"
      provides: "validateSongs valida validation opcional por frase"
      contains: "validateValidationShape(phrase"
    - path: "tests/fixtures/song-golden.json"
      provides: "Golden negative (ti-dedico-006 malo) + golden positive"
      contains: "ti-dedico-il-silenzio-006"
  key_links:
    - from: "scripts/validate-song-pass.mjs"
      to: "src/data/validation-state.js"
      via: "import { deriveStatus }"
      pattern: "deriveStatus"
    - from: "scripts/validate-song-pass.mjs"
      to: "docs/SONG-VALIDATION-PROMPT.md"
      via: "fs.readFileSync del prompt base"
      pattern: "SONG-VALIDATION-PROMPT"
    - from: "src/data/schema-validator.js (validateSongs)"
      to: "validateValidationShape"
      via: "llamada por frase tras validateSongPhrasePayload"
      pattern: "validateValidationShape\\(phrase"
---

<objective>
Construir la INFRAESTRUCTURA del validador de frases de canción (traducción italiano→español troceada): prompt S1-S5, script cross-vendor por frase, extensión de schema y fixture golden. Es el espejo de la infra de ejercicios (`validate-ai-pass.mjs` + `09-VALIDATION-PROMPT.md`) adaptado a canciones.

Purpose: Dar al autor un loop de validación de quórum multi-modelo para las traducciones de canciones, con reglas propias (naturalidad, fidelidad poética, troceado, acentos RAE, italiano fiel) y una prueba de fuego que demuestra que el validador caza la traducción mala que motivó la tarea.

Output: `docs/SONG-VALIDATION-PROMPT.md`, `scripts/validate-song-pass.mjs`, extensión de `validateSongs` en `src/data/schema-validator.js`, fixture `tests/fixtures/song-golden.json` y test de schema en `tests/song-validator.test.js`.

ALCANCE: NO la pasada masiva sobre las 83 frases (follow-up). NO requiere API keys para los tests de schema. La validación LLM real es manual/aceptación.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.planning/quick/260615-vkr-validador-de-frases-de-canci-n-es-infra-/260615-vkr-CONTEXT.md

# Referencia EXACTA a espejar (helpers, routing, writePass, fallback 429):
@scripts/validate-ai-pass.mjs

# Estructura del prompt de ejercicios (análogo, pero con C1-C5; el de canciones usa S1-S5):
@.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md

# Reusar tal cual:
@src/data/validation-state.js

<interfaces>
<!-- Contratos del codebase real. NO explorar — usar directo. -->

Estructura de un archivo de canción (content/songs/ti-dedico-il-silenzio.json):
- `{ "id": "<slug>", "title": "<str>", "phrases": [ { "id": "<slug-NNN>", "prompt": "<italiano>", "answer": ["tok", ...], "categoryIds": [] } ] }`
- IMPORTANTE: las frases están en `data.phrases` (NO `data.exercises`).
- La canción REAL ti-dedico-il-silenzio-006 ya está CORREGIDA en disco; su answer actual es:
  ["hace","tiempo","que","lo","sabes","pienso","que","ni","siquiera","el","tiempo","me","basta"] con prompt "È da tempo che sai penso che anche il tempo non mi basta".

De src/data/validation-state.js:
```
export function deriveStatus(passes): "pending" | "validated" | "disputed"
// incorrecta en cualquier pase → disputed (sticky); >=2 correcta con `by` distintos → validated; resto → pending
```

De src/data/schema-validator.js:
```
export function validateSongs({ songs, knownCategoryIds }): { ok, errors }
function validateValidationShape(ex, file, push)  // usa ex.id y ex.validation; back-compat: ausencia = OK
function validateSongPhrasePayload(phrase, file, push)
```
- validateValidationShape SOLO lee `ex.id` y `ex.validation` → funciona pasándole una FRASE de canción.
- Call site del bucle de frases en validateSongs (~L303-315): tras `validateSongPhrasePayload(phrase, file, push);` (L315) es donde se añade `validateValidationShape(phrase, file, push);`.

Helpers de scripts/validate-ai-pass.mjs a COPIAR (archivo nuevo, NO tocar el de ejercicios):
- loadEnv, providerFor (gemini-*/deepseek-*), keyFor, httpPost (timeout 120s), callModel (429 auto-fallback honra Retry-After + 5xx retriable), extractJsonBlock (último ```json, exige verdict+criteria), matchBraceEnd (string-aware), run() (cola de modelos con --fallback/--avoid).
- extractJsonBlock valida `verdict.verdict && verdict.criteria` genérico → sirve para criteria S1-S5 sin cambios.

Model ids REALES soportados (verificados en content/*.json y scripts): `gemini-2.5-flash`, `deepseek-chat`, `deepseek-reasoner`, `deepseek-v4-flash`, `deepseek-v4-pro`. `.env` tiene GEMINI_API_KEY y DEEPSEEK_API_KEY.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Prompt S1-S5 (docs/SONG-VALIDATION-PROMPT.md)</name>
  <files>docs/SONG-VALIDATION-PROMPT.md</files>
  <action>
Crear el prompt self-contained del validador de frases de canción, espejo estructural de `09-VALIDATION-PROMPT.md` pero con las reglas PROPIAS S1-S5 (per CONTEXT decisions):
- Rol del subagent: validar UNA frase de canción (traducción italiano→español troceada), nunca batched (VAL-03, fresh context).
- Las 5 reglas verbatim del CONTEXT: S1 español natural y con sentido (criterio que falló: "hace tiempo que sabes pienso que ni el tiempo me basta"); S2 fidelidad con licencia poética (aceptar lo figurado, rechazar contrasentidos/omisiones/añadidos que cambian el sentido); S3 troceado correcto (answer = array de palabras, una por token, sin puntuación salvo apóstrofo/guion interno, sin tokens vacíos); S4 ortografía/acentos RAE carácter a carácter (NO marcar falsos positivos sobre palabras ya bien acentuadas); S5 prompt italiano fiel y limpio (sin alucinaciones/erratas, normalizado, sin caracteres no-latinos espurios — cf. 'е' cirílica).
- Contrato de output (mismo shape genérico que ejercicios, parseable, ÚLTIMO bloque ```json gana): `verdict` ("correcta"|"incorrecta"), `criteria` con las 5 keys EXACTAS `s1_natural`, `s2_fidelidad`, `s3_troceado`, `s4_acentos`, `s5_italiano` (booleanas), `concerns` array de strings tagged `[S1-natural]`..`[S5-italiano]`. verdict correcta requiere las 5 en true; cualquier false ⇒ incorrecta + al menos 1 concern con su tag.
- EXTRA canciones (decisión bloqueada): si `s1_natural` o `s2_fidelidad` es false, el concern correspondiente DEBE incluir una **sugerencia de traducción mejor** (texto entre comillas) para corregir rápido. Documentar esto explícito en las reglas del shape.
- DATA: explicar que la frase bajo evaluación se anexa al final como bloque ```json con `{id, prompt, answer, ...}` (prompt = línea italiana, answer = tokens españoles).
- Incluir 2 few-shot SINTÉTICOS (1 PASS con las 5 true / concerns []; 1 FAIL con s1_natural false + concern con sugerencia de traducción), aclarando que son genéricos, no referencia del corpus.
- Guard anti prompt-injection (espejo de la sección 6 del prompt de ejercicios).
NO copiar las reglas C1-C5 de ejercicios; son reglas distintas. NO incluir versión "simplificada": las 5 reglas completas.
  </action>
  <verify>
    <automated>test -f docs/SONG-VALIDATION-PROMPT.md && grep -q 's1_natural' docs/SONG-VALIDATION-PROMPT.md && grep -q 's5_italiano' docs/SONG-VALIDATION-PROMPT.md && grep -qi 'sugerencia' docs/SONG-VALIDATION-PROMPT.md && grep -c '```json' docs/SONG-VALIDATION-PROMPT.md</automated>
  </verify>
  <done>El doc existe, contiene las 5 keys de criteria (s1_..s5_), exige sugerencia de traducción al fallar S1/S2, y tiene el contrato JSON + few-shots con bloques ```json.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Extender validateSongs (schema) + test de schema</name>
  <files>src/data/schema-validator.js, tests/fixtures/song-golden.json, tests/song-validator.test.js</files>
  <behavior>
    - Una frase de canción CON `validation` válido (status enum + passes[] bien formados) → validateSongs ok=true.
    - Una frase con `validation` mal formado (p.ej. status fuera del enum o passes no-array, o pass sin verdict válido) → ok=false con error que menciona "validation".
    - Una frase SIN `validation` sigue siendo válida (back-compat, ya cubierto por tests existentes — no romper).
    - tests/fixtures/song-golden.json valida contra validateSongs como documento de canción bien formado (golden-positive + golden-negative ambos con shape de frase válido; el "malo" del negative es semántico, no de schema).
  </behavior>
  <action>
1) En `src/data/schema-validator.js`, dentro del bucle de frases de `validateSongs` (~L303-315), añadir tras la línea `validateSongPhrasePayload(phrase, file, push);` la llamada `validateValidationShape(phrase, file, push);`. validateValidationShape ya lee `.id`/`.validation` y es back-compat (ausencia = OK), así que NO hay que tocar la función; solo invocarla por frase. NO cambiar la firma ni el orden de los otros checks.
2) Crear `tests/fixtures/song-golden.json` con shape de archivo de canción `{ "id": "song-golden", "title": "Golden fixtures", "phrases": [ ... ] }`:
   - golden-NEGATIVE: la frase con la traducción MALA ORIGINAL de ti-dedico-006: id `ti-dedico-il-silenzio-006`, prompt `"È da tempo che sai penso che anche il tempo non mi basta"`, answer = la mala `["hace","tiempo","que","sabes","pienso","que","ni","el","tiempo","me","basta"]` (la que falla S1/S2), categoryIds [].
   - golden-POSITIVE: 1 frase buena tomada de equilibrio-mentale (copiar prompt/answer reales de content/songs/equilibrio-mentale.json), categoryIds [].
   Este fixture NO va en content/songs/ (la canción real ya está corregida). Es la base de la aceptación LLM (Task 3) y del check de schema de validation.
3) En `tests/song-validator.test.js`, añadir 2-3 tests nuevos al describe existente:
   - "acepta una frase con validation bien formado": frase con `validation: {status:'pending', passes:[{by:'deepseek-chat', date:'2026-06-15', verdict:'correcta'}]}` → ok=true.
   - "rechaza una frase con validation mal formado": frase con `validation: {status:'malo', passes:'no'}` → ok=false y algún error matchea /validation/.
   - "el fixture tests/fixtures/song-golden.json valida como canción bien formada": leer el fixture con readFileSync (patrón de los tests de archivo real) y assert ok=true.
   Usar el patrón existente (knownCategoryIds Set, validateSongs({songs, knownCategoryIds})). NO tocar los tests existentes ni el fallo preexistente de genero-numero (ajeno a este archivo).
  </action>
  <verify>
    <automated>node --test tests/song-validator.test.js 2>&1 | tail -20</automated>
  </verify>
  <done>node --test tests/song-validator.test.js pasa (incluidos los 3 nuevos tests de validation/fixture); validateSongs llama validateValidationShape por frase; song-golden.json existe con la frase ti-dedico-006 mala + 1 positiva.</done>
</task>

<task type="auto">
  <name>Task 3: scripts/validate-song-pass.mjs (pase cross-vendor por frase, writePass que INSERTA validation)</name>
  <files>scripts/validate-song-pass.mjs</files>
  <action>
Crear `scripts/validate-song-pass.mjs` como ARCHIVO NUEVO (no tocar `validate-ai-pass.mjs` de ejercicios), copiando los helpers zero-deps de aquel (CLAUDE.md: solo node nativo, sin deps): loadEnv, providerFor, keyFor, httpPost (timeout 120s), callModel (429 auto-fallback honra Retry-After + 5xx retriable), extractJsonBlock, matchBraceEnd, parsing de args (--model, --fallback, --avoid, --write, --dry-run, --temp), y el bucle run() con cola de modelos. Importar `deriveStatus` de `../src/data/validation-state.js` (fuente única, no duplicar). DIFERENCIAS respecto al de ejercicios:
1) PROMPT_PATH = `docs/SONG-VALIDATION-PROMPT.md`.
2) findSongPhrase(id): recorrer `content/songs/*.json` y `tests/fixtures/*.json`; parsear cada archivo; buscar la frase en `data.phrases` (NO data.exercises); devolver `{ file, phrase }`. El golden-negative vive en tests/fixtures/song-golden.json, así que incluir tests/fixtures en los dirs escaneados.
3) composed prompt = basePrompt + bloque ```json con la frase (`JSON.stringify(found.phrase, null, 2)`) bajo un heading "## Frase de canción bajo evaluación (DATA)".
4) writePass que INSERTA validation si falta (CRÍTICO — el de ejercicios asume que existe): tras localizar el anchor `"id": "<id>"`, buscar `"validation":` DESPUÉS del anchor PERO antes de que empiece otra frase. Si NO existe el bloque validation para esa frase: insertar uno nuevo. Estrategia segura: localizar el objeto de la frase por su anchor de id, encontrar el `{` que abre ese objeto (el `{` inmediatamente anterior al anchor que contiene este id) y su `}` de cierre con matchBraceEnd; si el slice de ese objeto NO contiene `"validation"`, insertar `,\n      "validation": <body>` justo antes del `}` de cierre del objeto-frase (preservando indentación y el formato compacto de answer/categoryIds del resto del archivo). Si SÍ existe, comportarse como el de ejercicios (reemplazar el pase del mismo `by`, re-derivar status, reescribir el bloque). En ambos casos: filtrar passes por `by`, push del nuevo pase, status = deriveStatus(passes). PRESERVAR el resto del archivo intacto (escritura quirúrgica por slices de texto, no JSON.stringify del documento entero — igual que el de ejercicios para no aplanar el formato compacto de los arrays).
5) El pase Claude (Sonnet/Opus) NO se hace aquí (igual que ejercicios) — va por subagente Task como follow-up; documentarlo en el header del archivo junto al orden de disponibilidad del quórum DeepSeek→Gemini→Sonnet→Opus.
Header en español explicando uso, modelos soportados (gemini-2.5-flash / deepseek-chat / deepseek-reasoner / deepseek-v4-flash / deepseek-v4-pro) y la diferencia clave (inserta validation).
  </action>
  <verify>
    <automated>node --check scripts/validate-song-pass.mjs && node scripts/validate-song-pass.mjs ti-dedico-il-silenzio-006 --dry-run 2>&1 | grep -q 'È da tempo che sai' && node scripts/validate-song-pass.mjs ti-dedico-il-silenzio-006 --dry-run 2>&1 | grep -q 's1_natural'</automated>
  </verify>
  <done>node --check pasa; --dry-run localiza la frase (en tests/fixtures/song-golden.json) e imprime el prompt S1-S5 compuesto + la frase. La escritura real con LLM es aceptación manual con API keys (ver smoke abajo); no rompe validate-ai-pass.mjs.</done>
</task>

</tasks>

<verification>
- `node --test tests/*.test.js` no introduce fallos nuevos: el ÚNICO fallo permitido es el preexistente y ajeno de genero-numero (12→13). Los tests de song-validator (existentes + 3 nuevos) pasan.
- `node --check scripts/validate-song-pass.mjs` y `node --check scripts/validate-ai-pass.mjs` (no debe haberse roto el de ejercicios — sigue intacto, git diff vacío sobre ese archivo).
- Smoke de ACEPTACIÓN (manual, requiere GEMINI_API_KEY/DEEPSEEK_API_KEY en .env; NO bloquea el plan): correr 2 pases con `by` distintos sobre el golden-negative debe dar `incorrecta` (S1 y/o S2 con sugerencia), y sobre el golden-positive `correcta`. Esto materializa la "prueba de fuego" del autor. Es check de aceptación, no unit-test determinista (el quórum es LLM/red).
- Zero-deps: ningún `import` externo nuevo; `grep -rE "from '(node:|\\.\\.?/)" scripts/validate-song-pass.mjs` solo muestra node: builtins + import relativo de validation-state.js.
</verification>

<success_criteria>
- docs/SONG-VALIDATION-PROMPT.md existe, self-contained, con S1-S5, contrato JSON (criteria s1_..s5_, concerns tagged) y la regla EXTRA de sugerencia de traducción al fallar S1/S2.
- validateSongs valida `validation` opcional por frase reutilizando validateValidationShape; back-compat preservado.
- scripts/validate-song-pass.mjs localiza frases en data.phrases, compone el prompt S1-S5, hace fallback 429, y su writePass INSERTA validation cuando falta (preservando el resto del archivo).
- tests/fixtures/song-golden.json contiene la traducción mala original de ti-dedico-006 + 1 positiva, fuera de content/songs/.
- node --test tests/song-validator.test.js pasa; sin fallos nuevos en la suite global.
- validate-ai-pass.mjs (ejercicios) sin cambios.
</success_criteria>

<output>
Create `.planning/quick/260615-vkr-validador-de-frases-de-canci-n-es-infra-/260615-vkr-SUMMARY.md` when done
</output>
