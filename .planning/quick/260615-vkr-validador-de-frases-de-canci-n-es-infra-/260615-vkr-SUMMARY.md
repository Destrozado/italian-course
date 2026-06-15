---
quick: 260615-vkr
plan: 01
subsystem: validacion-canciones
tags: [validacion, quorum, cross-vendor, canciones, schema, zero-deps]
dependency_graph:
  requires:
    - src/data/validation-state.js (deriveStatus)
    - src/data/schema-validator.js (validateValidationShape, validateSongs)
    - scripts/validate-ai-pass.mjs (referencia de helpers)
  provides:
    - docs/SONG-VALIDATION-PROMPT.md (prompt S1-S5)
    - scripts/validate-song-pass.mjs (pase cross-vendor por frase, writePass-insert)
    - validateSongs valida `validation` opcional por frase
    - tests/fixtures/song-golden.json (golden negative + positive)
  affects:
    - content/songs/*.json (futuro: pasada masiva escribirá `validation` por frase)
tech_stack:
  added: []
  patterns:
    - escritura quirúrgica por slices (preserva formato compacto, no JSON.stringify del documento)
    - quórum multi-modelo cross-vendor con auto-fallback 429
    - prompt self-contained 1-por-frase (fresh context, VAL-03)
key_files:
  created:
    - docs/SONG-VALIDATION-PROMPT.md
    - scripts/validate-song-pass.mjs
    - tests/fixtures/song-golden.json
  modified:
    - src/data/schema-validator.js
    - tests/song-validator.test.js
decisions:
  - "Reglas propias S1-S5 (no C1-C5 de ejercicios); S1/S2 fallidos exigen sugerencia de traducción"
  - "writePass INSERTA validation cuando falta (diferencia clave vs el de ejercicios)"
  - "Golden fixtures en tests/fixtures/, NO en content/songs/ (la canción real ya está corregida)"
  - "DeepSeek primario, Gemini fallback; Claude (Sonnet/Opus) por subagente Task como follow-up"
metrics:
  duration: ~5 min
  completed: 2026-06-15
  tasks: 3
  files: 5
---

# Quick 260615-vkr: Validador de frases de canción ES — INFRAESTRUCTURA Summary

Infraestructura de quórum multi-modelo para validar traducciones italiano→español troceadas de canciones: prompt S1-S5 self-contained, script cross-vendor por frase con writePass que INSERTA el bloque `validation`, extensión de `validateSongs` para validar `validation` opcional, y fixture golden (la traducción mala original de ti-dedico-006 + una buena) como prueba de fuego del validador.

## Qué se construyó

1. **`docs/SONG-VALIDATION-PROMPT.md`** — Prompt self-contained con reglas propias S1-S5:
   - S1 español natural y con sentido, S2 fidelidad con licencia poética, S3 troceado correcto, S4 acentos RAE carácter a carácter, S5 prompt italiano fiel y limpio.
   - Contrato JSON: `verdict`, `criteria` (`s1_natural`..`s5_italiano`), `concerns` tagged `[S1-natural]`..`[S5-italiano]`.
   - Regla EXTRA: si S1 o S2 fallan, el concern DEBE incluir una sugerencia de traducción mejor entre comillas.
   - Few-shots sintéticos PASS/FAIL + guard anti prompt-injection.

2. **`scripts/validate-song-pass.mjs`** — Pase cross-vendor por frase (archivo nuevo, NO toca `validate-ai-pass.mjs`):
   - Helpers zero-deps espejo del de ejercicios: loadEnv, providerFor, keyFor, httpPost (timeout 120s), callModel (429 auto-fallback honra Retry-After + 5xx retriable), extractJsonBlock, matchBraceEnd, run() con cola de modelos `--fallback`/`--avoid`.
   - `findSongPhrase` busca en `content/songs/*.json` + `tests/fixtures/*.json` por `data.phrases` (NO `data.exercises`).
   - **writePass INSERTA** el bloque `validation` cuando la frase no lo tiene (acota el objeto-frase por su anchor de id con `findEnclosingBraceStart` + `matchBraceEnd` string-aware, inserta antes del `}` de cierre preservando formato compacto); si ya existe, reemplaza el pase del mismo `by` y re-deriva status. `deriveStatus` reusado de `validation-state.js`.

3. **`src/data/schema-validator.js`** — `validateSongs` invoca `validateValidationShape(phrase, file, push)` por frase tras `validateSongPhrasePayload`. Back-compat: frase sin `validation` sigue válida.

4. **`tests/fixtures/song-golden.json`** — golden-negative (`ti-dedico-il-silenzio-006` con la traducción MALA original) + golden-positive (`equilibrio-mentale-001` buena). Fuera de content/songs/.

5. **`tests/song-validator.test.js`** — 3 tests nuevos: acepta validation bien formado, rechaza validation mal formado (status/passes inválidos), el fixture golden valida como canción.

## Deviations from Plan

None — plan ejecutado exactamente como estaba escrito. Una mejora menor de calidad dentro del alcance de la Task 3 (Rule 1): la primera versión del insert dejaba el `,` separador en línea propia (`[]\n    ,`) — JSON válido pero feo; se ajustó (`headTrimmed`) para que el `,` quede pegado al último campo, produciendo el formato compacto idéntico al resto del archivo. Verificado offline con `node` (sin red): el insert produce JSON válido, schema-válido, y deja intactas las demás frases.

## Verificación

- `node --test tests/song-validator.test.js` → **20/20 pass** (17 baseline + 3 nuevos).
- `node --test tests/*.test.js` → **448/449 pass, 1 fail**. El ÚNICO fallo es el PREEXISTENTE y ajeno: `genero-numero` (12/12 ejercicios con explanation, espera 13) — NO introducido por este trabajo, NO tocado.
- `node --check scripts/validate-song-pass.mjs` OK; `node --check scripts/validate-ai-pass.mjs` OK y `git diff` vacío sobre el de ejercicios (intacto).
- `--dry-run` localiza `ti-dedico-il-silenzio-006` (en tests/fixtures/song-golden.json) e imprime el prompt S1-S5 compuesto.
- Zero-deps: `validate-song-pass.mjs` solo importa `node:https`, `node:fs`, `node:path` y el relativo `../src/data/validation-state.js`.

## Comandos para la pasada (follow-up, no incluido en esta tarea)

Requiere `GEMINI_API_KEY` / `DEEPSEEK_API_KEY` en `.env`. Quórum = 2 `by` distintos (DeepSeek primario, Gemini fallback/avoid):

```bash
# Pase 1 (DeepSeek primario, Gemini de fallback si 429):
node scripts/validate-song-pass.mjs <phrase-id> --model=deepseek-chat --fallback=gemini-2.5-flash --write

# Pase 2 (Gemini, evitando el modelo del pase 1 para garantizar 2 by distintos):
node scripts/validate-song-pass.mjs <phrase-id> --model=gemini-2.5-flash --avoid=deepseek-chat --write
```

Smoke de ACEPTACIÓN (prueba de fuego del autor, manual): correr 2 pases con `by` distintos sobre `ti-dedico-il-silenzio-006` (golden-negative) debe dar `incorrecta` (S1/S2 con sugerencia de traducción), y sobre `equilibrio-mentale-001` (golden-positive) `correcta`. El pase Claude (Sonnet/Opus) va por subagente Task como fallback si los externos fallan.

## Self-Check: PASSED

- FOUND: docs/SONG-VALIDATION-PROMPT.md
- FOUND: scripts/validate-song-pass.mjs
- FOUND: tests/fixtures/song-golden.json
- FOUND commit 0a0f50e (docs prompt S1-S5)
- FOUND commit 534d05d (test RED + fixture)
- FOUND commit f05f972 (feat schema)
- FOUND commit 3b4e8ad (feat script)
