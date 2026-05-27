# Validación por quórum — selección de pool por verificación

Cómo validar ejercicios nuevos con un **quórum de ≥2 IAs distintas**, eligiendo el
pool de modelos **en cada verificación** según disponibilidad de las APIs.

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

| `by` (model id)        | Cómo se invoca                          | Notas |
|------------------------|------------------------------------------|-------|
| `claude-opus-4-7`      | skill `gsd-validate-exercise` (Task)     | Canon v1.1, pase 1 |
| `claude-sonnet-4-6`    | skill `gsd-validate-exercise` (Task)     | Canon v1.1, pase 2 |
| `gemini-2.5-flash`     | `scripts/validate-with-gemini.mjs`       | Free tier OK |
| `gemini-2.5-pro`       | `scripts/validate-with-gemini.mjs --model=gemini-2.5-pro` | **Requiere billing** (free tier = limit 0) |

Pools válidos = cualquier combinación de 2 model ids distintos, p.ej.:
`opus+sonnet` (canon), `gemini-flash+opus`, `gemini-flash+sonnet`,
`gemini-flash+gemini-pro` (si hay billing). Se **elige por verificación**.

## El pase Claude

Vía el skill `gsd-validate-exercise <id>` (corre Opus y Sonnet vía `Task()`), o,
para un solo modelo Claude, un `Task(model=…, prompt=<09-VALIDATION-PROMPT.md> + ejercicio)`.
Debe correr **inline en la sesión principal** (usa `AskUserQuestion` para disputed);
un executor spawneado NO puede invocarlo.

## El pase Gemini

```bash
# Clave: copiar .env.example a .env y poner GEMINI_API_KEY (git-ignored).
node scripts/validate-with-gemini.mjs <exercise-id>                 # gemini-2.5-flash
node scripts/validate-with-gemini.mjs <exercise-id> --model=gemini-2.5-pro
node scripts/validate-with-gemini.mjs <exercise-id> --dry-run       # ver prompt, no llama API
node scripts/validate-with-gemini.mjs <exercise-id> --write         # inserta el pase en passes[]
```

- Reutiliza el **mismo** `09-VALIDATION-PROMPT.md` (R1-R7 → C1-C5) que el pase Claude.
- Salida (stdout): el pase `{by,date,verdict,concerns}`. Razonamiento → stderr.
- `--write` hace **cirugía de texto** sobre el bloque `"validation"` del ejercicio:
  preserva el formato compacto del JSON, añade el pase (de-duplica por `by`) y
  re-deriva `status`. NO reformatea el resto del archivo.
- Maneja `429` con backoff (respeta el `retry in Ns` de la API).

## Flujo de una verificación completa (ejemplo: Gemini Flash + Opus)

1. Elegir el pool para esta verificación (según qué APIs estén disponibles).
2. Para cada ejercicio nuevo, **1 por 1** (VAL-03):
   - Pase A (Gemini): `node scripts/validate-with-gemini.mjs <id> --write`
   - Pase B (Claude): `Task(model="claude-opus-4-7", prompt=…)` → insertar el pase en `passes[]`.
3. Si ambos `correcta` → el ejercicio queda `validated`.
4. Si alguno `incorrecta` → `disputed`: resolver con `quality > tokens`, **sin
   atajo de override**; corregir el ejercicio e idealmente revalidar hasta que
   ambas IAs den `correcta` (ver memoria `feedback_disputed_resolution.md`).
5. Cerrar el gate:
   ```bash
   node scripts/run-validation-271.mjs            # exit 0
   VAL_07_STRICT=1 node --test tests/*.test.js    # verde
   ```

## Seguridad

- La clave de Gemini vive sólo en `.env` (git-ignored). Nunca commitearla.
- Si se expone, rotarla en https://aistudio.google.com/apikey
- El pase Gemini envía el ejercicio a Google. Para una app de italiano A1/A2 es
  contenido no sensible, pero tenlo presente.
