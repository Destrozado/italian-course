# Phase 10: Ejecución validación 271 ejercicios + escalada disputed - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 10-Ejecución validación 271 ejercicios + escalada disputed
**Areas discussed:** Orquestación bulk (A), Orden + estrategia (B), Flujo VAL-08 disputed (C), Quórum Gemini reconsider (D), Cierre operacional (E)

---

## Área A — Orquestación bulk (cómo invocar el skill 269 veces)

### Sub-pregunta A.1: ¿Quién maneja el bucle de los 269?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Sub-skill orquestador `gsd-validate-batch` | Crea skill que corre en su propio subagent aislado del main context. Acepta scope = `<category>` / `--all-pending` / lista IDs. Itera pendientes, invoca `gsd-validate-exercise` por cada uno. Resume idempotente porque ya-validados se autoskipean leyendo el JSON. | ✓ |
| Orchestrator loop en el main context | Claude main invoca el skill 269 veces directamente. Simple sin nuevo skill pero satura el main context tras ~50-80 ejercicios. | |
| Script + slash command híbrido | `scripts/list-pending-validation.mjs` imprime IDs; el autor copia bloques. Más fricción, viola el principio "el sistema te obliga a no olvidar". | |

**User's choice:** Sub-skill orquestador (Recommended).
**Notes:** Locked en D-VAL-19 + D-VAL-20. El sub-skill mantiene la garantía NUNCA-batched de Phase 9 — ITERA pero NO compone N ejercicios en mismo contexto.

### Sub-pregunta A.2: ¿Qué unidad de checkpoint?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Por categoría | UNA categoría completa por run del sub-skill, banner resumen al final, autor decide continuar. 7 categorías = 7 checkpoints naturales. | ✓ |
| Por lote fijo de N (e.g. 25) | Granularidad uniforme pero parte categorías por la mitad, complica el reporting y no respeta los PDFs 1:1. | |
| All-at-once | Procesa los 269 sin pausar. Velocidad máxima pero sin oportunidad de iterar mid-run. | |
| Pausa automática si dispute-rate > umbral | Procesa fluido hasta detectar >X% disputed en una categoría. Complementa pero no reemplaza el checkpoint por categoría. | |

**User's choice:** Por categoría (Recommended).
**Notes:** Locked en D-VAL-23. El reconsider trigger para Gemini (sub-pregunta D.1 + D-VAL-21) reutiliza la lógica de "dispute-rate alerta" pero sólo tras Preposiciones.

---

## Área B — Orden + estrategia de batching

### Sub-pregunta B.1: ¿Qué categoría primero?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Preposiciones (riesgo-first) | 49 pendientes, los 4 bugs históricos están aquí. Detecta bias del prompt en la categoría más probable, con margen para iterar antes de gastar 220 spawns en las 6 sanas. | ✓ |
| Avere primero (pequeño + bajo riesgo) | 22 pendientes — warm-up real, descubre bugs operacionales del bulk-orquestador con 44 spawns. Pero no ejercita disputed con datos reales. | |
| Alfabético predecible | avere → essere → genero-numero → preposiciones → profesiones → sustantivos-irregulares → verbos-movimiento. Máximo determinismo, sin señal de prioridad. | |

**User's choice:** Preposiciones (riesgo-first) (Recommended).
**Notes:** Locked en D-VAL-22.

### Sub-pregunta B.2: ¿Orden de las 6 categorías restantes?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Resto alfabético | avere → essere → genero-numero → profesiones → sustantivos-irregulares → verbos-movimiento. Predecible, fácil status. | ✓ |
| Más pequeño primero | avere (22) → sustantivos-irregulares (31) → verbos-movimiento (37) → essere (39) → genero-numero (40) → profesiones (51). Wins rápidos. | |
| Aleatorio / autor decide en cada checkpoint | Máxima flexibilidad pero overhead mental por categoría. | |

**User's choice:** Resto alfabético (Recommended).
**Notes:** Orden final lockeado D-VAL-22: preposiciones → avere → essere → genero-numero → profesiones → sustantivos-irregulares → verbos-movimiento.

---

## Área C — Flujo VAL-08 disputed (UX + política de re-validación)

### Sub-pregunta C.1: ¿Cuándo se surface el disputed al autor?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Cola al final de la categoría | Sub-skill termina los N ejercicios sin interrupciones, disputed quedan persistidos en JSONs con status correcto. Al cierre de categoría, banner ofrece la cola — autor decide resolver ahora o diferir. | ✓ |
| Inline interrupt inmediato | Pausa el batch en cuanto sale `incorrecta`, muestra banner, espera decisión, continúa. Cero deuda al final pero rompe el flow 5-15 veces por categoría. | |
| Inline pero con opción "posponer todos" | Default inline + toggle al primer banner para defer al final. Mejor de ambos pero más código. | |

**User's choice:** Cola al final de la categoría (Recommended).
**Notes:** Locked en D-VAL-24. La decisión editorial (accept/reject/rewrite) es trabajo cognitivo distinto del mecánico — resolverlas en bloque permite encarar las disputed con cabeza de "editor decisivo" en vez de "stop-go".

### Sub-pregunta C.2: ¿Política de re-validación post-resolución?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Estricto: rewrite y accept-fix re-validan; reject solo override | (a) accept fix → re-validar con 2 pases frescos. (b) reject+override → entry `by:"autor"` + status="validated" directo, NO re-validar. (c) rewrite → re-validar obligatorio. Garantía máxima editorial. | ✓ |
| Permisivo: solo rewrite re-valida | accept-fix y reject NO re-validan, solo añaden override entry. Más rápido pero pierde la garantía "validated ⇔ 2 AIs distintas correctas". | |
| Máximo rígido: los 3 caminos re-validan | También reject+override re-valida. Re-validar reject es ritual sin valor — mismo input → mismo `incorrecta` deterministico. | |

**User's choice:** Estricto: rewrite y accept-fix re-validan; reject solo override (Recommended).
**Notes:** Locked en D-VAL-25 con table detallada de los 4 caminos (a/b/c/d donde d = skip/defer). El BYPASS sticky D-VAL-07 en el camino (a) accept-fix requiere reset de `passes[]` a las 2 entries nuevas con audit trail en commit message.

### Sub-pregunta C.3: ¿Formato exacto del banner disputed?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Pretty-print + AskUserQuestion | Banner imprime ID + categoría + prompt + verdicts + concerns + suggested-fix derivado del tag. AskUserQuestion con 4 opciones literales: Accept fix / Reject+override / Rewrite / Skip. Para Rewrite el sub-skill abre el JSON para edición y reanuda al guardar. | ✓ |
| Banner + prompt de texto libre | Misma info pero input por consola. Peor UX en Claude Code. | |
| Modal markdown que autor edita | Genera `phase-10/disputed-queue/<id>.md` con campo `decision: ___`. Más asincrónico, más ceremonia. | |

**User's choice:** Pretty-print + AskUserQuestion (Recommended).
**Notes:** Locked en D-VAL-26 con mockup literal del banner + mapping de suggested-fix por tag (`[C1-natural]` → reescribir prompt, `[C5-leak]` → eliminar la frase con leak, etc.). El sourcing del suggested-fix es determinístico desde el tag — sin invocar otra AI.

---

## Área D — Quórum: ¿añadir Gemini tras el piloto?

### Sub-pregunta D.1: ¿Stick con Opus+Sonnet o añadir Gemini?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Stick con Opus+Sonnet — confiar el piloto | Piloto detectó C5-leak sin falsos negativos. Paridad en sanos es esperada. Reconsider trigger: si Preposiciones sale con dispute-rate <5%, pausar y reconsiderar antes de las 6 restantes. | ✓ |
| Gemini como 3er pase SOLO en Preposiciones | Aplicar diversidad multi-vendor donde históricamente la necesitábamos. | |
| Gemini como tiebreaker SOLO cuando Opus discrepa de Sonnet | Reduce cola del autor pero introduce dependency externa (Gemini API). | |
| Gemini como 3er pase para los 269 | Máxima diversidad. ~270k tokens extra. Garantía editorial fuerte. | |

**User's choice:** Stick con Opus+Sonnet — confiar el piloto (Recommended).
**Notes:** Locked en D-VAL-21 con trigger explícito de reconsideración: si Preposiciones dispute-rate <5% Y los 3 motivadores pendientes (-031, -032, -047) pasan como validated sin surface concerns, banner alerta + AskUserQuestion (continuar / pausar para reconsiderar).

---

## Área E — Cierre operacional (3 micro-decisiones)

### Sub-pregunta E.1: ¿Activación VAL_07_STRICT + paralelo Opus+Sonnet + reporter final?

| Opción | Descripción | Selected |
|--------|-------------|----------|
| Dejar al planner | Las 3 son detalles de implementación con tradeoffs técnicos puros: activación del env var, paralelo vs secuencial, reporter format. Capturadas como Claude's Discretion en CONTEXT.md con recommendation implícita. | ✓ |
| Lockear: env var manual + secuencial + reporter por categoría | Pre-lock conservador. | |
| Lockear: auto-activar + paralelo + reporter unificado | Pre-lock optimizado por velocidad. | |

**User's choice:** Dejar al planner (Recommended).
**Notes:** Las 3 entran a la sección Claude's Discretion en CONTEXT.md con recommendation implícita: env var manual flippeado por autor al cierre, secuencial Opus→Sonnet por defecto, reporter como `scripts/run-validation-271.mjs` con 4 sub-gates.

---

## Claude's Discretion

Áreas dejadas explícitamente al plan-time con tradeoffs documentados en CONTEXT.md `<decisions>`:

1. **Activación del feature flag VAL_07_STRICT** al cierre — env var documentada en README (recomendado) vs auto-write `.env` vs config persistente.
2. **Paralelo vs secuencial Opus+Sonnet por ejercicio** — secuencial validado por el piloto Phase 9 (recomendado conservar) vs `Promise.all` ~2x throughput.
3. **Reporter final** — `scripts/run-validation-271.mjs` o variante, formato tabla por categoría, 4 sub-gates (VAL-04 + VAL-06 + VAL-08 + smoke test exit 0 con flag on).
4. **Manejo de rate-limits / fallos de red** durante el batch — continuar y loggear vs pausar al primer parse-failed.
5. **Granularidad del banner cuando >10 disputed en una categoría** — secuencial 1-por-1 vs agrupado con expand.
6. **Mecanismo de detección de "guardado" tras rewrite del autor** — re-read + diff vs file-watcher vs prompt explícito.
7. **Nombre exacto del sub-skill** (`gsd-validate-batch` tentativo) y del reporter (`run-validation-271.mjs` tentativo).
8. **Política de commits para caminos (a)/(b)/(c) de la cola disputed** — 1 commit por evento vs consolidado.
9. **Pre-flight `scripts/assert-avere-prefix-unchanged.mjs` exit 0** antes de pasar de avere a la siguiente categoría — auto-gate o manual.
10. **Si el reporter final también escribe `.planning/phases/10-.../10-VALIDATION-REPORT.md`** como evidencia escrita del cierre del milestone.

---

## Deferred Ideas

### A Phase 10 EJECUCIÓN (out of scope de planning)
- Proyección de disputed reales (~5-15% en sanas, posiblemente 15-20% en Preposiciones).
- Predicción de si los 3 motivadores pendientes saldrán disputed automáticamente (hipótesis: sí — los 5 criterios C1-C5 cubren todas las clases de bug detectadas hist.).
- Tiempo total real estimado: ~3-5 min por ejercicio × 269 = ~14-22h de subagent time, posiblemente en varias sesiones.

### A milestones futuros (post-v1.1)
- VAL-X1: Validación periódica al añadir categorías nuevas (Pretérito imperfetto, Futuro). El sub-skill `gsd-validate-batch <category>` es reutilizable.
- VAL-X2: Integración del validation gate en `/gsd-quick` flow editorial.
- Si feedback empírico v1.1 sugiere añadir Gemini al quórum default, ajustar D-VAL-02 en v1.2.
- Suggested-fix generation más sofisticada (invocando otra AI en vez de derivar del tag) — out of scope.
