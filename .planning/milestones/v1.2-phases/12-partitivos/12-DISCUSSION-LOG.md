# Phase 12: Partitivos - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 12-partitivos
**Areas discussed:** Trampas del partitivo, Partitivo vs preposición, Tipos y volumen, Pool de IAs del quórum

---

## Trampas del partitivo

### Eje estructural (incontable-singular vs contable-plural)

| Option | Description | Selected |
|--------|-------------|----------|
| Contraste como eje | Bloques paralelos incontable-sing vs contable-plural, con ejercicios que los contrastan; espejo tipo il→lo→l' de Articoli | ✓ |
| Por forma fonética | Organizar por forma (del/dello/della/...) calcado de Articoli; contable/incontable solo en explanations | |
| Tú decides | Claude elige el eje | |

**User's choice:** Contraste como eje
**Notes:** Es el corazón semántico del partitivo; el espejo refuerza la re-verificación (core value).

### Peso de la omisión (negativa omite, afirmativa opcional)

| Option | Description | Selected |
|--------|-------------|----------|
| Mini-bloque de contraste | Pocos ejercicios USAR (afirmativa) vs OMITIR (negativa) con opción '∅/sin partitivo' | ✓ |
| Solo en explanations | Cubrir la omisión solo mencionándola en explanations | |
| Tú decides | Claude elige el peso | |

**User's choice:** Mini-bloque de contraste
**Notes:** Para un hispanohablante la omisión en negativa es intuitiva (= español "no tengo pan"); lo ajeno es USAR el partitivo en afirmativa. La explanation debe insistir ahí.

### Alternativas (alcuni/qualche/un po' di) y doble-validez

| Option | Description | Selected |
|--------|-------------|----------|
| Trampa por restricción | Cada alternativa testea SU regla (qualche+singular, un po' di+incontable, alcuni solo plural) → una respuesta correcta por gramática | ✓ |
| Cobertura ligera | 1-2 ejercicios por alternativa, sin convertir cada restricción en trampa dedicada | |
| Tú decides | Claude elige la profundidad y el blindaje | |

**User's choice:** Trampa por restricción
**Notes:** Blinda la doble-validez de raíz (dei libri ≈ alcuni libri ≈ qualche libro serían varias respuestas correctas si se eligiera libremente).

---

## Partitivo vs preposición (PART-05)

### Formato de los ejercicios de distinción

| Option | Description | Selected |
|--------|-------------|----------|
| Clasificar la función | Multiple-choice meta: dada una frase con del/della, elegir '¿partitivo o preposición?' | ✓ |
| Contraste embebido | Ejercicios de producción normales; el contraste vive en explanation + distractora prepositiva | |
| Ambos | Bloque de clasificación + contraste en explanations del resto | |
| Tú decides | Claude elige el formato | |

**User's choice:** Clasificar la función
**Notes:** Restricciones derivadas (locked): solo formas di-based (del/della/dei/degli/delle); categoryIds:["partitivos"] sin bridge; la explanation remite a que la función prepositiva vive en Preposiciones (ROADMAP criterio 3).

---

## Tipos y volumen

### Mezcla de tipos de ejercicio

| Option | Description | Selected |
|--------|-------------|----------|
| Calcar Articoli | multiple-choice columna vertebral + 1 bloque match sustantivo↔forma + bloque clasificación; word-buttons casi nulo | ✓ |
| Solo multiple-choice | Todo multiple-choice, sin match | |
| Añadir word-buttons | multiple-choice + match + bloque word-buttons para alcuni/qualche/un po' di | |
| Tú decides | Claude elige la mezcla | |

**User's choice:** Calcar Articoli
**Notes:** El match sustantivo↔forma partitiva pasa la DESIGN RULE (depende de género+fonética, no de raíz).

### Densidad target

| Option | Description | Selected |
|--------|-------------|----------|
| ~30-40 (acotada) | Tamaño medio tipo sustantivos-irregulares(31)/verbos-movimiento(37); sin bridges, inventario menor | ✓ |
| ~45-55 (densa) | Misma densidad que Articoli/Preposiciones/Profesiones | |
| Lo fija el temario | Sin target numérico ahora; lo deriva el temario | |

**User's choice:** ~30-40 (acotada)
**Notes:** Sin bridges + inventario menor que Articoli. El conteo exacto lo deriva el temario (D-13 heredado).

---

## Pool de IAs del quórum (PART-07)

### Pool de validación

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-vendor (DeepSeek+Opus) | Mismo pool que Phase 11 | |
| Opus + Sonnet (canon v1.1) | El pool original de v1.1 | |
| Triple (DeepSeek+Opus+Sonnet) | Triple quórum | |
| Other (free text) | El autor propuso primero DeepSeek Flash + DeepSeek Pro; tras discutir el riesgo same-vendor, cambió a **DeepSeek Flash + Sonnet 4.6** | ✓ |

**User's choice:** DeepSeek Flash + Sonnet 4.6 (cross-vendor DeepSeek+Anthropic)
**Notes:** El autor quería experimentar con dos tiers DeepSeek (Flash+Pro), pero al señalarse que dos modelos del mismo vendor comparten puntos ciegos (el catch de 8 bugs en P11 vino de la diversidad de vendor), optó por cross-vendor real DeepSeek+Anthropic. Distinto del pool de P11 (DeepSeek+Opus) → sigue siendo experimental.

### Canon de acentos en la validación (clarificación del autor)

**User's input (free text):** "lo de los acentos entiendo que no debe ser un extra sino parte de las 'reglas' que se les pasan a verificar a las IAs, no es algo que deba quedar a su libre discreción, si se les recuerda ese detalle deberían darse cuenta siempre."
**Resolución:** El canon ortográfico de acentos (D-135) entra como REGLA EXPLÍCITA en el prompt de validación, que ambas IAs verifican siempre — no como scan posterior ni discreción de la IA. (Se mantiene el scan determinista como backstop barato, por los 2 acentos que en P11 escaparon a ambas IAs.)

### Granularidad del campo by[] (clarificación del autor)

**User's input (free text):** "Asegúrate de que en los 'by' se incluye la versión del modelo de IA, si usáramos Gemini flash y Gemini Pro o Deepseek Flash Deepseek Pro quiero que se guarden como validaciones diferentes, no bajo la misma clave."
**Resolución:** El `by[]` debe incluir versión/tier del modelo; dos tiers del mismo vendor se guardan como claves DISTINTAS (deepseek-v4-flash ≠ deepseek-v4-pro), nunca bajo una clave genérica. Invariante a verificar en plan-time para que el "≥2 by distintos" no se pueda burlar.

---

## Claude's Discretion

- Nombre/orden en categories.json (sugerencia `{ id:"partitivos", name:"Partitivos", order:9 }`).
- Esquema de IDs `partitivos-001..` (sin bridges).
- Estrategia de distractoras en multiple-choice (otras formas del partitivo plausibles).
- Reparto del-formas vs alternativas vs clasificación vs omisión para llegar a ~30-40.
- Ejemplos léxicos concretos (incontables: pane, acqua, zucchero, carne, vino; contables: libri, mele, studenti, amici).

## Deferred Ideas

- PART-X1 — bridges Partitivos↔género-número/sustantivos (v1.3+).
- Pool DeepSeek Flash + Pro (considerado y descartado; same-vendor blind spots).
- Formas/casos A2 raros (fuera de v1.2).
