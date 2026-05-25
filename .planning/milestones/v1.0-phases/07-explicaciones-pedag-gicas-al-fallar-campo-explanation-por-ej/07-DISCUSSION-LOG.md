# Phase 7: Explicaciones pedagógicas al fallar - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 07-explicaciones-pedagogicas-al-fallar
**Areas discussed:** Shape del JSON, Dónde se renderiza, Estrategia de rollout, Tono/formato/longitud

---

## Área 1 — Shape del JSON (explanation + optionHints)

### Pregunta 1.1: ¿Qué campos añadimos al payload?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo `explanation: string` opcional uniforme cross-3-types (Recommended) | Mínimo. 1 párrafo por ejercicio. Schema validator añade 1 regla. Distinción de tipos puede ir dentro del texto plano. | ✓ |
| `explanation` + `optionHints[]` para multi-choice; solo `explanation` para los otros 2 tipos | 3x trabajo editorial en multi-choice. Schema más complejo por tipo. | |
| Estructura rica `{rule, examples, whyNotOthers}` | Over-engineering. Decisión irreversible (cambiar shape rompe migraciones). | |

**User's choice:** Solo `explanation: string` opcional uniforme.
**Notes:** Shape mínimo permite evolución incremental. La distinción de tipos (e.g., "Sui = Su + I = sobre + plural masculino") puede encajar dentro del propio texto plano. Si emerge necesidad de optionHints, se añade en fase incremental sin migración.

---

## Área 2 — Dónde se renderiza

### Pregunta 2.1: ¿Dónde se renderiza la explanation?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo en "Errores cometidos" del summary (Recommended) | Consolida con UX-02. Preserva flow bien/mal-velocidad. Cero cambios session screen. | |
| Inline durante feedback rojo en sesión | Contexto inmediato pero interrumpe ritmo. 3 sub-templates a modificar. | |
| Ambos: inline + summary | Máximo refuerzo pedagógico (2 veces). Implica los 2 sets de cambios. | ✓ |
| Click-to-expand "¿Por qué?" durante feedback rojo | Opt-in colapsable. Patrón nuevo no existente en app. Más código. | |

**User's choice:** Ambos: inline + summary.
**Notes:** El refuerzo pedagógico justifica el render duplicado. Ver la explicación 2 veces (momento del fallo + summary post-sesión) aumenta retención. La carga de modificar 3 sub-templates + summary es lineal, no exponencial.

---

## Área 3 — Estrategia de rollout / coste editorial

### Pregunta 3.1: ¿Cómo rellenas las explanations?

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 7 = infra + Preposiciones como seed (Recommended) | Schema + UI + 50 explanations Preposiciones. Categoría más urgente (4 ejemplos Gemini del autor). Patrón D-85. | ✓ |
| Phase 7 = solo infra; contenido en fases incrementales 7.1/7.2/... | Cero contenido upfront. Más incremental. Riesgo: UAT humano sin nada visible. | |
| Phase 7 = infra + 6 categorías (271 con explanation) | Batch grande. Milestone v1.0 "completo". Coste editorial muy alto, muchas horas revisión. | |
| Phase 7 = infra + on-demand desde uso | Solo schema + UI. Sin seed. Phase 7 cerraría rápido pero feature 100% latente. | |

**User's choice:** Phase 7 = infra + Preposiciones como seed.
**Notes:** Patrón D-85 (Claude propone + autor revisa) validado en Phases 4 y 5. 50 explanations Preposiciones es alcance mensurable. Otras 6 categorías quedan opcionales para retro-rellenar en fases incrementales si emerge dolor.

---

## Área 4 — Tono / formato / longitud

### Pregunta 4.1: ¿Qué contrato editorial fijamos para explanation?

| Option | Description | Selected |
|--------|-------------|----------|
| Plain text + 3ª impersonal + ~250-400 chars libre (Recommended) | T-02-01 anti-XSS preservado. Patrón mental: 1 frase regla + 1 frase ejemplo paralelo. Sin enforce de longitud en schema. | ✓ |
| Plain text + 2ª persona + límite 300 chars schema enforce | Más conversacional pero potencialmente ruidoso. 1 char de más rompería el load. | |
| Markdown básico (**negrita** + listas) | Requeriría x-html → viola T-02-01 anti-XSS. Bloqueador arquitectónico. | |

**User's choice:** Plain text + 3ª impersonal + ~250-400 chars libre.
**Notes:** Coherente con el tono de los campos `notes` existentes (avere.json, essere.json). T-02-01 (x-text exclusivo) preservado sin dependencias nuevas. Longitud sugerida (250-400 chars) es recomendación editorial, no constraint dura.

---

## Claude's Discretion

Items delegados al planner / executor en CONTEXT.md §"Claude's Discretion":

- Texto literal de cada una de las 50 explanations (Claude propone, autor revisa en 2-3 batches).
- Cuántos batches de revisión para Plan 07-02 (probablemente 2-3 con ~15-20 explanations cada uno).
- CSS exacto de `.session-explanation` y `.summary-error-explanation` (spacing/font-size/italic/muted dentro de UI-SPEC invariants).
- Posición exacta del bloque dentro de cada sub-template (después de "Respuesta correcta" / antes de "Siguiente" en multi-choice y word-buttons; tras el grid en match cuando matchHadFailure).
- ¿Plan 07-01 incluye 1-2 explanations seed o solo infra? Recomendación: 1-2 mínimas para UAT humano visible.
- Tests específicos a añadir (esquema validator pasa-rechaza + opcional smoke count de coverage por categoría).

## Deferred Ideas

Capturadas en CONTEXT.md §"Deferred Ideas":

- optionHints[] array (3x trabajo editorial).
- Estructura rica {rule, examples, whyNotOthers}.
- Explanations en aciertos.
- Pantalla "Reglas consultables" / glosario standalone.
- Markdown/HTML en explanation (bloqueado por T-02-01).
- Click-to-expand "¿Por qué?".
- Explanations para las 6 categorías restantes (Avere, Essere, Verbos-movimiento, Profesiones, Sustantivos-irregulares, Género-número) — fases incrementales 7.1+.
- Schema validator enforcement de longitud máxima dura.
- Localización i18n del texto de explanation.
- Audio/TTS.
- Test LLM-check del contenido pedagógico.
- Helper `assert-preposiciones-explanations-coverage.mjs`.
- Renombrar `notes` existente a `internalNotes` (mantener nombres distintos).
- Highlight visual home de cobertura editorial.
