# Phase 31: Cruces multi-cat + integración lockstep (cierre v1.7) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-17
**Phase:** 31-cruces-multi-cat-integraci-n-lockstep-cierre-v1-7
**Areas discussed:** Diseño pedagógico del cruce, Reparto avere vs essere + nº/verbos, Ubicación + id + forma variante, Quórum de los cruces nuevos

---

## Diseño pedagógico del cruce (qué evalúa)

| Option | Description | Selected |
|--------|-------------|----------|
| Elegir el auxiliar/forma de passato prossimo | El hueco pide la forma compuesta (ho parlato / è partito). Evalúa auxiliar + participio; introduce passato prossimo activamente. | |
| Elegir el PRESENTE, con el passato como contraste en el prompt | El hueco pide el presente regular; el passato aparece ya escrito como contraste. Más conservador con PASSPROX-01 diferido. | |
| Mezcla deliberada de ambos | Algunos cruces piden la forma compuesta, otros el presente con contraste. Cubre las dos direcciones. Más munición, más carga. | ✓ |

**User's choice:** Mezcla deliberada de ambos.
**Notes:** Cubrir AMBAS direcciones del contraste presente↔passato prossimo es deliberado, asumiendo la mayor carga de diseño/quórum. (D-31-01)

---

## Reparto avere vs essere + participios

| Option | Description | Selected |
|--------|-------------|----------|
| Ambos auxiliares, SOLO participios regulares | avere (parlato/temuto/dormito) + essere (partito/arrivato/tornato), solo participios -ato/-uto/-ito. Nada irregular. Territorio A1 regular. | ✓ |
| Ambos auxiliares, participios irregulares permitidos | Incluir ho fatto / ho preso por realismo. Fuera de alcance regular, roza R6. | |
| Solo avere (mayoría regular) | Limitar a avere. Más simple pero pierde el contraste avere/essere. | |

**User's choice:** Ambos auxiliares, SOLO participios regulares.
**Notes:** Prohibido participios irregulares (preso/fatto/detto/messo) y auxiliares irregulares (andare/venire). Coherente con el alcance de presente-regolare y R6. (D-31-02)

---

## Ubicación + id + forma de variante

| Option | Description | Selected |
|--------|-------------|----------|
| En presente-regolare.json (la categoría nueva es el hub) | Cruces en el JSON nuevo; sube solo su count (8→8+M); avere/essere intactos. Análogo fiel a avere-300..305. INT-01 toca 1 entrada del smoke. | ✓ |
| En avere.json y essere.json (patrón literal avere-300..305) | Reparte el cruce en 2 ficheros existentes; sube avere(20)/essere(26). | |

**User's choice (ubicación):** En presente-regolare.json (la categoría nueva es el hub). (D-31-04)

| Option | Description | Selected |
|--------|-------------|----------|
| slot+variantes (≥2 c/u), ~4 objetos cubriendo la matriz | Verbo fresco al re-presentar; coherente con D-30-01 anti-memorización. ~8 variantes, más carga de quórum. | ✓ |
| single-variant, ~6 objetos (patrón literal avere-300..305) | 1 frase fija por objeto; menos quórum pero memorizable al re-presentar. | |
| single-variant, ~4 objetos (matriz mínima) | Máximo bounded; mismo trade-off de memorización. | |

**User's choice (forma):** slot+variantes (≥2 c/u), ~4 objetos cubriendo la matriz. (D-31-05/D-31-06)
**Notes:** exercises.length 8→8+M (≈12); TOTAL_EXPECTED 183→≈195, leído dinámico del JSON real (nunca hardcodear). Matriz: compuesto·avere, compuesto·essere, presente-con-contraste·avere, presente-con-contraste·essere.

---

## Quórum de los cruces nuevos

| Option | Description | Selected |
|--------|-------------|----------|
| Quórum completo R1-R7 + chequeo explícito de concordancia essere | Mismo quórum 1-por-1 (Opus+Sonnet base, disputed→autor-oráculo, sin override-atajo) + verificación EXPLÍCITA de concordancia participio↔sujeto con essere + elección de auxiliar + scan de acentos. VAL_07_STRICT=1. | ✓ |
| Quórum completo R1-R7 estándar (sin énfasis añadido) | Quórum habitual confiando en que Opus+Sonnet capturen la concordancia sin instrucción. Riesgo de disputed tardío. | |

**User's choice:** Quórum completo R1-R7 + chequeo explícito de concordancia essere.
**Notes:** La concordancia del participio con essere (è partito/partita/partiti/partite) es el riesgo de corrección NUEVO del milestone → chequeo explícito, no delegado. (D-31-07/D-31-08)

---

## Claude's Discretion

- Esquema exacto de `id` de los cruces (sugerido `presente-regolare-300..`) y orden en el JSON.
- `type` por objeto (multi-choice por defecto; word-buttons solo si aporta sin romper D-30-07).
- Verbos concretos por cruce (A1 alta frecuencia, participio regular) y nº de variantes por slot ≥2.
- Texto pedagógico exacto de cada `explanation` (R1-R7, canon español acentuado).
- Mecánica de leer el N real del JSON en los 3 hardcodes sin tocar el motor.

## Deferred Ideas

- Passato prossimo como categoría dedicada (PASSPROX-01) — backlog futuro; los cruces solo lo exponen como contraste con participios regulares.
- Cruces con participio irregular (ho fatto / ho preso) — descartado a favor de territorio A1 regular; reconsiderar con la categoría dedicada.
- Cruces single-variant tipo avere-300..305 — descartado a favor de slot+variantes por coherencia anti-memorización.
