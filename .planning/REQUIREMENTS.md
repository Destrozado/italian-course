# Milestone v1.1 Requirements — Validación editorial

**Created:** 2026-05-25
**Milestone:** v1.1 — Validación editorial
**Goal:** Validar 271/271 ejercicios individualmente con criterios estrictos R1-R7 y quórum multi-AI, eliminando bugs de batched-curation y garantizando que el autor aprende italiano correctamente.

## v1.1 Requirements

### VAL — Validación editorial

- [x] **VAL-01**: El schema de ejercicios soporta un campo opcional `validation` con estructura `{status: "pending"|"validated"|"disputed", passes: [{by, date, verdict, concerns?}]}`. Schema validator acepta ejercicios SIN el campo (backward-compat con los 271 actuales).
- [x] **VAL-02**: Existe un validation prompt documentado y aplicado de forma idéntica a cada ejercicio, con 5 criterios binarios verificables: (1) frase italiana natural a oídos de un nativo, (2) una y solo UNA opción válida entre las distractoras, (3) distractoras plausibles (errores típicos de hispanohablante), (4) explanation **enfocada al alumno** — coherente con prompt + respuesta correcta + sin contradicciones, sin notas de curador (e.g., "Cierra la serie de articolate...", "Completa el patrón...", "Cierra la familia X"), sin meta-staging de la categoría, sin referencias indexadas a otros ejercicios (#NNN — ya cubierto por R2), (5) cero leak de regla en el prompt (R1).
- [x] **VAL-03**: El workflow de validación procesa los ejercicios estrictamente 1-por-1 (NO batched). Cada ejercicio se valida en un agente fresco con SOLO ese ejercicio en contexto + el validation prompt. Está documentado por qué NO se batch (root cause del problema motivador).
- [ ] **VAL-04**: Cada ejercicio recibe ≥2 pases de AIs distintos para alcanzar `status: validated`. La AI que valida se registra explícitamente en `passes[].by` (ej. `claude-opus-4-7@2026-05-25`, `gemini-pro@2026-05-25`). Un solo pase deja `status: pending`. Cualquier verdict `incorrecta` cambia `status: disputed`.
- [x] **VAL-05**: Cada entry en `passes[]` registra `{by: string, date: ISO, verdict: "correcta"|"incorrecta", concerns?: string[]}`. Concerns es array de strings con descripciones específicas (ej. "ambiguous between negli/sugli", "leak in prompt").
- [ ] **VAL-06**: Cobertura final: 271/271 ejercicios con `validation.status === "validated"` antes de cerrar Phase 10 (o `disputed` resuelto manualmente por el autor → re-validado → validated).
- [x] **VAL-07**: Existe un smoke test paramétrico en `tests/exercise-types.test.js` que verifica todos los ejercicios tienen `validation.status === "validated"` (no `pending` ni `disputed`) — esto previene que un ejercicio nuevo o modificado se quede sin validar y se publique al alumno. Durante Phase 9 el test puede estar tras un feature flag (o assertion suave) para no bloquear desarrollo mientras los 271 siguen sin validar; al cierre de Phase 10 el test se activa con assertion estricta.
- [ ] **VAL-08**: Cuando un pase devuelve `verdict: incorrecta`, el workflow surface el caso al autor inline con: prompt original + verdict + concerns + sugerencia de fix. El autor decide: acepta el fix propuesto, rechaza (mantiene original + override del status), o reescribe manualmente. La decisión queda registrada en el ejercicio (override del status si rechaza).

## Future Requirements (post-v1.1)

- VAL-X1: Validación periódica re-aplicada al añadir categorías nuevas (Pretérito imperfetto, Futuro, etc.) — el workflow Phase 9 debe ser reutilizable.
- VAL-X2: Integración del validation gate en `/gsd-quick` flow editorial — cualquier nuevo ejercicio añadido vía /gsd-quick obligatoriamente pasa por validation antes de ship.

## Out of Scope (v1.1)

- Validación pedagógica de contenido (¿el ejemplo tiene valor didáctico? ¿es A1 apropiado?) — out of scope; el oracle pedagógico es el autor y la profesora.
- Validación de coherencia entre PDF de la profesora y el ejercicio JSON — out of scope; los ejercicios ya fueron diseñados a partir del PDF en v1.0.
- Validación automática del audio/pronunciación (no aplica — proyecto sin audio).
- LLM de uso continuo durante la sesión de práctica para validar respuestas libres — out of scope (FOUND-04 v1.0 lockea solo bien/mal por velocidad).
- Generación automática de nuevos ejercicios con IA — out of scope original PROJECT.md.
- Validación de exhaustividad del set (¿faltan reglas A1 no cubiertas?) — out of scope; el set actual es lo que la profesora dictó.

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| VAL-01 | Phase 9 | Complete |
| VAL-02 | Phase 9 | Complete |
| VAL-03 | Phase 9 | Complete |
| VAL-04 | Phase 10 | Pending |
| VAL-05 | Phase 9 | Complete |
| VAL-06 | Phase 10 | Pending |
| VAL-07 | Phase 9 | Complete |
| VAL-08 | Phase 10 | Pending |

**Coverage:** 8/8 v1.1 requirements mapped — 5 a Phase 9 (infraestructura) + 3 a Phase 10 (ejecución + escalada). 0 orphans, 0 duplicados.
