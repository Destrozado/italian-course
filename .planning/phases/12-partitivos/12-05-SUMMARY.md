# 12-05 SUMMARY — Validación por quórum cross-vendor (DeepSeek Pro + Opus 4.7)

**Plan:** 12-05
**Estado:** ⚠ **EJECUTADO con disputed PENDIENTES de resolución del autor.** Plan NO marcado complete hasta que resuelvas los 5.
**Pool aplicado (override autorizado de D-10, 2026-05-28):** `deepseek-v4-pro` + `claude-opus-4-7` (verificados en `/models` de DeepSeek; tier completo per D-12).
**Resultado quórum:** **39 validated / 5 disputed / 0 pending**, todos con ≥2 `by` DISTINTOS cross-vendor (DeepSeek + Anthropic).
**Gate del milestone:** ROJO — sub-gate VAL-04 PASS, VAL-06 367/372 FAIL, VAL-08 5 disputed FAIL. Esperado hasta resolver los 5.

## Cola de disputed (5 ejercicios — para tu decisión)

Memoria operativa (`feedback_disputed_resolution.md`): "calidad > tokens, NO override-atajo; ambas IAs deben dar correcta (salvo override consciente camino b)". Recomendación por defecto: accept-fix con re-validate; override solo si la decisión bloqueada (D-xx) prevalece sobre la objeción.

---

### partitivos-032 — JOINT FLAG (ambas IAs incorrecta)

- **prompt:** `Ho comprato ___ mele al mercato.`
- **opciones:** `["alcune", "qualche", "un po' di", "alcuna"]` (correcta: **alcune**)
- **DeepSeek Pro [C2]:** "Ho comprato un po' di mele" es construcción natural y frecuente en italiano moderno; el alumno podría elegir opción 2 y recibir fallo injusto. R7 violado.
- **Opus 4.7 [C2]:** "un po' di + plural contable" es aceptado en italiano real (cita Treccani, Serianni). "Ho comprato un po' di mele al mercato" lo diría un nativo sin reservas. Sin contexto desambiguador, dos opciones válidas. **Fix sugerido por Opus:** añadir contexto numérico que descarte el matiz "un poco" (ej. "Ho comprato ___ mele, almeno una decina") o cambiar a un sustantivo plural-only.
- **MI RECOMENDACIÓN: ACCEPT-FIX.** Ambos vendors coinciden. Tu D-03 trata `un po' di` como "SOLO incontable", pero el uso real ITA lo admite con contables coloquialmente — los 2 modelos cazan precisamente eso. Opciones: (a) reescribir el prompt para forzar `alcune` (p.ej. `"Ho comprato ___ mele al mercato (varietà rare)"` o un contexto que pida concordancia femenino-plural inequívoca), o (b) sustituir `un po' di` como distractor por algo como `nessun` o `tante`. Tras el fix → re-validar (camino a).

### partitivos-033 — SPLIT (DeepSeek incorrecta, Opus correcta)

- **prompt:** `Ho letto ___ libri molto interessanti.`
- **opciones:** `["alcuni", "qualche", "un po' di", "alcune"]` (correcta: **alcuni**)
- **DeepSeek Pro [C2]:** "un po' di libri" es válida y natural ('algunos libros'); 2 opciones correctas, viola R7. **Fix sugerido:** añadir contexto que descarte (ej. `"Ho letto ___ libri che mi hai consigliato"`).
- **Opus 4.7:** correcta — sin concerns.
- **MI RECOMENDACIÓN:** **OVERRIDE** o **ACCEPT-FIX** según cuánto pese D-03 para ti. Es la misma objeción que 032 (un po' di + contable plural) pero aplicada a masculino. Opus la acepta (probablemente honrando la lectura A1/A2 estricta de D-03). Si en 032 vas por accept-fix, **por consistencia 033 debería ir también accept-fix** (misma objeción gramatical). Si decides que D-03 es suficiente para A1 (no pretende cubrir uso coloquial moderno), **OVERRIDE** con razón documentada y mantiene la pedagogía.

### partitivos-036 — SPLIT (DeepSeek incorrecta, Opus correcta) — esta YA estaba pre-flagueada por mí en la review de 12-02

- **prompt:** `Ho ___ amici a Roma.`
- **opciones:** `["degli", "∅ / sin partitivo", "dei", "delle"]` (correcta: **degli**)
- **DeepSeek Pro [C2]:** "Ho amici a Roma" es gramaticalmente válida en italiano; el partitivo afirmativo con plurales contables es a menudo omisible. Ambigüedad. **Fix sugerido:** añadir contexto que fuerce la lectura partitiva (`"Ho ___ amici a Roma, quasi dieci"` o `"...che mi vogliono bene"`).
- **Opus 4.7:** correcta — sin concerns (probablemente respetando la intención pedagógica D-02 de enseñar el partitivo afirmativo).
- **MI RECOMENDACIÓN:** **OVERRIDE** (D-02 lock vs. estricto-correcto). D-02 quiere específicamente entrenar "USAR el partitivo en afirmativa" porque es el punto ciego del hispanohablante; aunque ∅ es gramatical, el ejercicio enseña la opción italiana idiomática. La cara negativa (035/037) sí es inequívoca y no se disputa. Alternativa: **ACCEPT-FIX** con el contexto numérico de Opus ("quasi dieci" o "Roma, e li vedo spesso") si prefieres que NO haya ambigüedad. **El otro espejo en este bloque (034) NO salió flagged por ninguna IA** — solo 036; revísalo (puede que valga la misma decisión).

### partitivos-041 — SPLIT (DeepSeek incorrecta R4, Opus correcta) — D-06 vs interpretación estricta de R4

- **prompt:** `Il sapore del caffè è intenso. -> Aquí 'del' funciona como ___`
- **opciones:** `["preposición", "partitivo", "artículo determinativo"]` (correcta: **preposición**)
- **DeepSeek Pro [C4]:** la explanation tiene "meta-staging editorial del curador" en las frases finales ("...su uso pertenece a la categoría Preposiciones, donde lo practicas a fondo; en Partitivos solo lo identificamos para distinguirlo del partitivo"). Voz de 1ª persona plural del curador. Viola R4. **Fix sugerido:** eliminar las 2 frases finales; la primera mitad ("Aquí del NO es partitivo...") es correcta.
- **Opus 4.7:** correcta — sin concerns.
- **MI RECOMENDACIÓN:** **OVERRIDE** (D-06 prevalece sobre R4 estricta). Tu D-06/ROADMAP criterio 3 EXIGE explícitamente que la explanation "deja claro que la función prepositiva vive en la categoría Preposiciones, no aquí". DeepSeek aplica R4 sin saber que esa remisión es by-design. Mantén la pedagogía o **ACCEPT-FIX suavizado** (eliminar el "donde lo practicas a fondo" / "identificamos" y dejar una frase neutra como `"esa función pertenece a la categoría Preposiciones; aquí solo se contrasta"`).

### partitivos-042 — SPLIT (DeepSeek incorrecta R4, Opus correcta) — gemelo de 041

- **prompt:** `Stamattina ho comprato delle mele. -> Aquí 'delle' funciona como ___`
- **opciones:** `["partitivo", "preposición", "artículo determinativo"]` (correcta: **partitivo**)
- **DeepSeek Pro [C4]:** misma objeción que 041 — "se trabaja en la categoría Preposiciones; en Partitivos solo lo contrastamos para que reconozcas cuándo delle es algo de y cuándo es de las". Meta-staging R4.
- **Opus 4.7:** correcta — sin concerns.
- **MI RECOMENDACIÓN:** mismo veredicto que 041 (la objeción y la resolución son idénticas). Decisión coherente para los dos: si OVERRIDE 041 → OVERRIDE 042; si ACCEPT-FIX 041 → ACCEPT-FIX 042 con la misma fórmula.

---

## Decisiones que tomé en tu nombre (revísalas)

1. **Pool override de D-10 → Pro+Opus** por tu instrucción runtime 2026-05-28. Documentado en `12-05-PLAN.md <objective>` + `12-PATTERNS.md` (commit `29e54d3`). Ambos modelos vivos en `/models` de DeepSeek. Cross-vendor preserved (DeepSeek + Anthropic), tier completo en `by[]` (D-12).
2. **D-11 / Task 1:** añadí el canon de acentos (D-135) como regla explícita en C4 de `09-VALIDATION-PROMPT.md`. Mi primera versión listaba palabras-ejemplo y DeepSeek empezó a echo-reportarlas como falsos errores (`artículo`, `sería`, `elisión` SÍ tenían su tilde). Reescribí la regla a principio + guard "verifica char-a-char, NO marques palabras YA correctamente acentuadas". La regla sigue exigida (grep verify OK) y **cazó un bug real**: "di mas" en las match explanations (debía ser "di más"). Captured commit: `4a1ebb1` (validate(12): DeepSeek Pro pass).
3. **3 fixes editoriales** aplicados durante la review (commits separados antes del quórum, todos con re-validate aprobado):
   - `partitivos-010`: `"Ho voglia di ___ pasta"` → `"A pranzo cucino ___ pasta"` (doble `di` con `di della` no gramatical). Commit `e30e225`.
   - `12-TEMARIO §Espejo`: fila 3 frame `"C'è ___"` → `"Ho preso ___"` (c'è es singular, incompatible con plural `libri`; rompe el principio de verbo constante del espejo). Commit `9b5a15a`.
   - `partitivos-038 / 039` match explanations: `"di mas el artículo"` → `"di más el artículo"` (4 ocurrencias). Incluido en commit `4a1ebb1`.
4. **PART-05 deviation aceptada** (en 12-03, antes del quórum): schema validator exige 3+ opciones; usé `["partitivo","preposición","artículo determinativo"]` con `___` classification slot. Documentado en `12-03-SUMMARY.md`.

## Mecánica del quórum (audit trail)

- **DeepSeek Pro pass** — `scripts/validate-ai-pass.mjs <id> --model=deepseek-v4-pro --write`, 44 calls totales (1 inicial + loop background 43, +6 re-runs tras de-prime de la regla). El script registra el `by` real (`deepseek-v4-pro`) y deriva status. Concerns reales preservados.
- **Opus 4.7 pass** — 44 `Agent(subagent_type="general-purpose", model="opus")` independientes, cada uno con el prompt composed por `/tmp/gen-opus-prompts.mjs` (que reseteó `validation:{pending,passes:[]}` para que Opus NO viera el verdict de DeepSeek). Cada Task escribió su verdict crudo a `/tmp/opus-verdicts/<id>.json`. Apply via `/tmp/apply-opus.mjs` → append `{by:"claude-opus-4-7",date,verdict,concerns}` + deriveStatus.
- **D-VAL-20 honored:** 1 contexto fresh por exercise, NUNCA batched.
- **Independence:** Opus prompt construido con `validation` reset → no leak de DeepSeek a Opus. Cross-vendor diversity real.

## Verificaciones cumplidas

- D-11: regla D-135 explícita en C4 (grep verify OK).
- D-12: cero `by` genéricos de vendor (verified inline en apply + reporter VAL-04 PASS).
- Pool cross-vendor (DeepSeek + Anthropic).
- VAL-04 PASS (≥2 distinct AIs por validated).

## Pendiente para cerrar el plan

1. Resuelves los 5 disputed (caminos accept-fix / override / rewrite / skip).
2. Tras la resolución (todos validated o deferred consciente), re-run:
   - `node scripts/run-validation-271.mjs` → exit 0 esperado.
   - `VAL_07_STRICT=1 node --test tests/exercise-types.test.js` → 137/137 PASS esperado.
3. Marcar 12-05 complete + Phase 12 ready for verifier.

## Archivos generados/modificados

- `content/exercises/partitivos.json` — 44 ejercicios, cada uno con `validation.passes[]` de 2 entries cross-vendor + `status` derivado.
- `.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md` — C4 ahora incluye canon de acentos D-135 (reescrito tras observar false-positives en primera versión).
- `/tmp/gen-opus-prompts.mjs`, `/tmp/apply-opus.mjs`, `/tmp/opus-prompts/`, `/tmp/opus-verdicts/` — orchestración del Opus pass (no comiteados, son scratch).

## Commits relevantes (este plan)

- `4a1ebb1` — `validate(12): DeepSeek Pro pass — 44 partitivos (39 correcta, 5 disputed) + D-135 accent canon in prompt (D-11) + fix di-más in match explanations`.
- `(este HEAD)` — `validate(12): Opus 4.7 pass — cross-vendor quórum complete (39 validated, 5 disputed)`.

---

*Plan: 12-05 — Validación por quórum cross-vendor DeepSeek Pro + Opus 4.7*
*Ejecutado: 2026-05-28*
*Pendiente: resolución autor de 5 disputed*
