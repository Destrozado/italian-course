# Phase 17 Plan 03 — Estado de PAUSA del quórum (round 1) + cómo reanudar

**Pausado:** 2026-06-03
**Motivo de la pausa:** (1) Gemini se rate-limiteó (429) tras ~16 pases → la mitad externa quedó incompleta para 24 variantes; (2) decisiones editoriales del autor tomadas (abajo) que el resume debe honrar. La mitad Claude (Opus+Sonnet vía skill) NO se ha ejecutado para ninguna variante.

> **17-03 está EN PROGRESO, no completo.** NO se ha creado `17-03-SUMMARY.md`. NO se ha tocado `content/exercises/preposiciones.json` (las variantes nuevas aún NO están integradas). 17-04 NO debe ejecutarse hasta que 17-03 cierre (el conteo final de slots = 49 depende de crear los 2 slots locativos al integrar).

## Artefactos de estado (no borrar hasta cerrar 17-03)
- `tests/fixtures/_nuevas-pilot-17.json` — las 43 variantes como ejercicios legacy aislados (payload), con `validation.passes[]` de la round 1. **Fuente de verdad del progreso del quórum.**
- `scripts/_build-nuevas-pilot-17.mjs` — regenera la fixture desde las superficies (idempotente).
- `scripts/_run-external-quorum-17.sh` — corre la mitad externa (Gemini+DeepSeek) sobre toda la fixture.
- `.planning/phases/17-piloto-preposiciones-contenido/17-VARIANTES-NUEVAS.md` — superficies propuestas (Task 1).

## Decisiones del autor (HONRAR en el resume)
1. **Gloss `(en español: ...)` = MANTENER (canon manda).** El C5-leak que Gemini/DeepSeek marcan sobre el gloss es un falso-positivo de política: el gloss es la desambiguación R7 intencional, ya validada en Phase 10 (9 superficies existentes lo usan idéntico, validadas por Claude Opus+Sonnet). Las variantes con gloss NO se descartan por el gloss. Ver memoria [[gloss_es_desambiguacion_canon]].
2. **Alcance: las 43 completas**, quórum cross-vendor completo (Gemini+DeepSeek+Opus+Sonnet, 4× correcta). Reanudar cuando reabra la cuota de Gemini.
3. **NV-43 (`al mare`)** aceptada como propuesta (contexto "quest'estate + in Sicilia" desambigua al mare vs in mare). Gemini ya la dio `correcta`.

## Conteo objetivo
- 43 variantes nuevas → al integrar: 47 slots actuales + 2 locativos nuevos (`preposiciones-in-locativo` 3v, `preposiciones-al-mare` 1v) = **49 slots** (driver del count de 17-04).

## Estado por variante (round 1) y acción de resume

### A — Limpias en externos (≥2 vendors correcta, 0 incorrecta) → solo falta la mitad Claude (10)
`nv-di-origen, nv-da-provenienza, nv-in-paese, nv-per-scopo, nv-a-ciudad, nv-a-hora, nv-con-strumento, nv-allo, nv-nelle, nv-dai`
**Resume:** correr `/gsd-validate-exercise <id>` (Opus+Sonnet, 1-por-1) por cada una. Si 4× correcta → integrar al slot.

### B — Gemini rate-limiteado (solo DeepSeek correcta) → falta pase Gemini + mitad Claude (24)
`nv-in-trasporto, nv-dello, nv-della, nv-dei, nv-delle, nv-alla, nv-ai, nv-agli, nv-alle, nv-nello, nv-nella, nv-nei, nv-dal, nv-dallo, nv-dalla, nv-dagli, nv-dalle, nv-sullo, nv-sui, nv-sulle, nv-in-spiaggia, nv-in-montagna, nv-in-campagna, nv-al-mare`
**Resume (cuota Gemini reabierta):** `node scripts/validate-ai-pass.mjs <id> --model=gemini-2.5-flash --avoid=deepseek-chat --write` (solo el pase que falta) + luego `/gsd-validate-exercise <id>`.

### C — R7 reformuladas en round 1 (passes reseteados) → re-validación COMPLETA (4)
`nv-con-compagnia, nv-negli, nv-sulla, nv-sugli`
Superficies nuevas (contexto apretado para excluir el distractor válido que cazó el cross-vendor):
- `nv-con-compagnia`: "Vado al cinema ___ mia sorella, non da solo." (excluye per=beneficio)
- `nv-negli`: "I documenti sono archiviati ___ uffici." (archiviati→in, excluye sugli=encima)
- `nv-sulla`: "Il libro è ___ scrivania, sopra i fogli." (sopra→on, excluye alla=junto a)
- `nv-sugli`: "Le foto sono ___ scaffali, sopra i libri." (sopra→on, excluye negli=dentro)
**Resume:** regenerar NO (ya están en la fixture); correr el quórum completo (Gemini+DeepSeek+Opus+Sonnet) sobre estas 4.

### D — Gloss C5-leak, política "mantener gloss" (3)
`nv-per-durata, nv-da-agente, nv-nel`
Gemini/DeepSeek dieron `incorrecta` SOLO por el gloss (C5). Por decisión 1, el gloss se mantiene.
**Resume:** correr la mitad Claude (`/gsd-validate-exercise`); si Opus+Sonnet dan correcta (esperado — Phase 10 validó el mismo patrón), integrar registrando en `passes[].concerns` la divergencia externa aceptada ("[C5-gloss] gloss = desambiguación R7 canon, aceptado por el autor"). NO descartar por el C5-leak externo. (Resolución disputed por calidad, sin override-atajo: la base es que ambas Claude den correcta.)

### E — Falso-positivo de acento `fusióna` (2)
`nv-del, nv-degli`
Gemini (y DeepSeek en degli) dieron `incorrecta` alucinando "fusióna" con tilde; **verificado: el JSON dice "fusiona" sin tilde** (`grep -c fusióna` = 0). Ruido del modelo.
**Resume:** resetear sus `passes[]` y re-correr el quórum (el falso-positivo no debería recurrir de forma consistente); o aceptar con `passes[].concerns` documentando que el flag de acento es falso (verificado contra el JSON).

## Procedimiento de cierre (cuando todas pasen)
1. Cada variante con 4× "correcta" (o resolución documentada D/E): mover su superficie a `variants[]` del slot destino en `content/exercises/preposiciones.json` (SIN explanation propia — la lleva el slot). Crear los 2 slots locativos `preposiciones-in-locativo` (3v) + `preposiciones-al-mare` (1v) con su explanation nueva (del 17-VARIANTES-NUEVAS.md Bloque C).
2. Borrar los ids temporales `nv-*` y los artefactos temp (`_nuevas-pilot-17.json`, `_build-nuevas-pilot-17.mjs`, `_run-external-quorum-17.sh`).
3. `node scripts/validate-content-fixture.mjs preposiciones content/exercises/preposiciones.json` → exit 0; confirmar `con payload: 0`.
4. 1 commit por variante integrada (granularidad del skill). Crear `17-03-SUMMARY.md` con el passes[] de cada variante.
5. `roadmap update-plan-progress 17 17-03 complete`; entonces ya se puede correr 17-04 (count final = 49 slots).
