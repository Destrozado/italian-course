# Validación por quórum — selección de pool por verificación

Cómo validar ejercicios nuevos con un **quórum de ≥2 IAs distintas**, eligiendo el
pool de modelos **en cada verificación** según disponibilidad de las APIs, con
**auto-fallback** si un modelo agota su límite.

## El invariante (no negociable)

`src/data/validation-state.js → deriveStatus(passes)` y el reporter
`scripts/run-validation-271.mjs` (gate VAL-04) exigen:

- **≥2 pases `correcta` con `by` DISTINTOS** y **cero `incorrecta`** → `status: "validated"`.
- Cualquier pase `incorrecta` → `status: "disputed"` (sticky; no se auto-cura).
- Menos de eso → `status: "pending"`.

El campo `by` es una **string libre** (el reporter sólo cuenta distinción, no exige
modelos concretos). Por eso el pool es flexible: lo que importa es que sean 2 `by`
distintos. VAL-03 sigue vigente: **1 ejercicio por contexto, NUNCA batched.**

## Modelos disponibles

| `by` (model id)      | Invocación                                  | Notas |
|----------------------|---------------------------------------------|-------|
| `claude-opus-4-7`    | skill `gsd-validate-exercise` (Task)        | Canon v1.1 |
| `claude-sonnet-4-6`  | skill `gsd-validate-exercise` (Task)        | Canon v1.1 |
| `gemini-2.5-flash`   | `scripts/validate-ai-pass.mjs`              | Free tier OK |
| `gemini-2.5-pro`     | `scripts/validate-ai-pass.mjs --model=gemini-2.5-pro` | **Requiere billing** (free tier = limit 0) |
| `deepseek-v4-flash`  | `scripts/validate-ai-pass.mjs --model=deepseek-v4-flash` | OpenAI-compat |
| `deepseek-v4-pro`    | `scripts/validate-ai-pass.mjs --model=deepseek-v4-pro`   | OpenAI-compat |

Pool válido = cualquier combinación de **2 model ids distintos**. Se **elige por
verificación** según qué APIs estén disponibles, p.ej. `gemini-flash + deepseek-pro`,
`gemini-flash + opus`, `deepseek-flash + sonnet`, etc.

## El pase Claude

Vía el skill `gsd-validate-exercise <id>` (corre Opus y Sonnet vía `Task()`), o un
`Task(model=…, prompt=<09-VALIDATION-PROMPT.md> + ejercicio)`. Debe correr **inline
en la sesión principal** (usa `AskUserQuestion` para disputed); un executor spawneado
NO puede invocarlo.

## El pase externo (Gemini / DeepSeek) — `scripts/validate-ai-pass.mjs`

```bash
node scripts/validate-ai-pass.mjs <id>                              # gemini-2.5-flash (default)
node scripts/validate-ai-pass.mjs <id> --model=deepseek-v4-pro
node scripts/validate-ai-pass.mjs <id> --write                     # inserta el pase en passes[]
node scripts/validate-ai-pass.mjs <id> --dry-run                   # ver prompt, no llama API
node scripts/validate-ai-pass.mjs <id> --avoid=gemini-2.5-flash    # no usar este modelo (es el otro pase)

# AUTO-FALLBACK: si el primario rate-limitea (429), prueba el siguiente en orden.
node scripts/validate-ai-pass.mjs <id> --model=gemini-2.5-flash \
     --fallback=deepseek-v4-flash,deepseek-v4-pro --write
```

- Routing por prefijo: `gemini-*` → Google API (GEMINI_API_KEY); `deepseek-*` →
  api.deepseek.com OpenAI-compat (DEEPSEEK_API_KEY).
- Reutiliza el **mismo** `09-VALIDATION-PROMPT.md` (R1-R7 → C1-C5) que el pase Claude.
- Salida (stdout): el pase `{by,date,verdict,concerns}`. Razonamiento → stderr.
- `--write` hace **cirugía de texto** sobre el bloque `"validation"`: preserva el
  formato compacto del JSON, de-duplica por `by`, re-deriva `status`.
- **Auto-fallback (`--fallback`)**: ante `429`, salta al siguiente modelo SIN parar.
  El `by` registrado es el modelo que de verdad respondió, así que el quórum sigue
  computándose sobre el `by` real. Esto evita tener que vigilar y reanudar a mano.

## Flujo de una verificación completa (ejemplo: Gemini Flash + DeepSeek, con fallback)

1. Elegir el pool (2 model ids distintos) según disponibilidad.
2. Para cada ejercicio nuevo, **1 por 1** (VAL-03):
   - Pase A: `node scripts/validate-ai-pass.mjs <id> --model=gemini-2.5-flash --fallback=deepseek-v4-flash --write`
   - Pase B: `node scripts/validate-ai-pass.mjs <id> --model=deepseek-v4-pro --avoid=gemini-2.5-flash --fallback=deepseek-v4-flash --write`
     (o un pase Claude vía skill)
3. Si ambos `correcta` y `by` distintos → `validated`.
4. Si alguno `incorrecta` → `disputed`: resolver con `quality > tokens`, **sin
   atajo de override**; corregir el ejercicio e idealmente revalidar hasta que ambas
   IAs den `correcta` (memoria `feedback_disputed_resolution.md`).
5. Cerrar el gate:
   ```bash
   node scripts/run-validation-271.mjs            # exit 0
   VAL_07_STRICT=1 node --test tests/*.test.js    # verde
   ```

## Seguridad

- Las claves viven sólo en `.env` (git-ignored). Nunca commitearlas.
- Rotar si se exponen: Gemini en https://aistudio.google.com/apikey ,
  DeepSeek en https://platform.deepseek.com/api_keys
- Los pases externos envían el ejercicio a Google/DeepSeek. Contenido A1/A2 no
  sensible, pero tenlo presente.
