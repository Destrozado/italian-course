# Phase 41: `fare-indicativo` — 8 slots (el bloque grande) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-03
**Phase:** 41-`fare-indicativo` — 8 slots (el bloque grande)
**Areas discussed:** Eje de los 4 compuestos, Gloss ES vs leak R1, MAGNETs del indicativo, Tipos de ejercicio

---

## Eje de los 4 compuestos

### Cuántas variantes por slot compuesto, y con qué eje

| Option | Description | Selected |
|--------|-------------|----------|
| 6 personas, marco propio (48) | Eje declarado = persona (`pickVariantIndex`, SC#5 intacto); cada variante lleva además su propio marco temporal inequívoco. 8 × 6 = 48 variantes. Máximo volumen de quórum | ✓ |
| ~3 marcos (≈36) | En los compuestos el eje pasa a ser el MARCO (~3 frases/slot). Argumento: en un compuesto la persona es información de `avere`, no de `fare` | |
| Mixto (≈39) | Passato prossimo con 6 personas (compuesto diario) + los otros 3 con ~3 marcos | |

**User's choice:** 6 personas, marco propio (48)
**Notes:** El objetivo declarado de FARE-X1 es "un ejercicio por cada casilla del paradigma"; recortar los compuestos dejaría 24 casillas persona×tiempo sin examinar. El autor aceptó explícitamente el coste de quórum.

### Trapassato remoto: reparto de conectores

| Option | Description | Selected |
|--------|-------------|----------|
| Los 3 conectores rotando | `dopo che` / `quando` / `appena`, 2 variantes cada uno, principal en passato remoto | ✓ |
| Solo `dopo che` | Un único conector en las 6 — el más inequívoco y el que cita FARE-X1; más fácil de validar | |
| `dopo che` + `appena` | Dos conectores; se descarta `quando` por ser el más ambiguo (admite imperfetto y passato remoto simple) | |

**User's choice:** Los 3 conectores rotando
**Notes:** Riesgo de `quando` asumido y trasladado al quórum — las 2 variantes con `quando` exigen verificación explícita de unicidad de lectura del marco (R7).

### Patrón de distractoras en los 4 slots compuestos

| Option | Description | Selected |
|--------|-------------|----------|
| 3 marcos + 1 forma mal | 2 distractoras = mismo auxiliar en otro tiempo (error de marco, lo que IND-05 examina) + 1 de forma mal construida (`*sono fatto` / `*ho fare`). Patrón fijo cross-slot, precedente Phase 5 | ✓ |
| Solo tiempos del auxiliar | Las 3 distractoras = mismo participio con auxiliar en otro tiempo. Señal máxima sobre el marco, cero ruido | |
| Marco + simple correspondiente | 2 de otro tiempo del auxiliar + 1 que es el tiempo simple correspondiente (`facevo` vs `avevo fatto`) | |

**User's choice:** 3 marcos + 1 forma mal
**Notes:** La opción del simple correspondiente se descartó por riesgo de doble validez si el marco no la excluye limpiamente.

### Passato remoto vs passato prossimo — doble validez regional

| Option | Description | Selected |
|--------|-------------|----------|
| Marcos disjuntos, sin contraste | Passato remoto SOLO marcos narrativos remotos; passato prossimo SOLO marcos recientes. Nunca se ofrecen mutuamente como distractora | ✓ |
| Distractora unidireccional | Igual, pero `ho fatto` puede aparecer como distractora en el slot de passato remoto con marco que la excluya | |
| MAGNET declarado con ronda extra | Variantes de contraste explícito pr↔pp con ronda EXTRA de quórum sobre el bloque | |

**User's choice:** Marcos disjuntos, sin contraste
**Notes:** El contraste de uso pr↔pp es registro/variación regional, no casilla del paradigma. Queda fuera por diseño, no por olvido.

---

## Gloss ES vs leak R1

### Papel del gloss `(en español: …)`

| Option | Description | Selected |
|--------|-------------|----------|
| 0-gloss declarado | CERO gloss en las 48. El español mapea 1:1 en 7 de 8 casillas → cualquier gloss sobre el verbo regala el tiempo (leak R1). Documentado en `notes` como decisión, no omisión | ✓ |
| Gloss solo léxico | Prohibido sobre el tiempo, permitido sobre el significado de la construcción cuando `fare` no es 'hacer' | |
| Gloss en los de baja frecuencia | 0-gloss en simples + passato prossimo; permitido en trapassato prossimo / remoto / futuro anteriore | |

**User's choice:** 0-gloss declarado
**Notes:** No contradice el canon R7 del proyecto — el gloss es desambiguador legítimo *donde desambigua*; en una categoría de selección de tiempo, filtra.

### Cue de persona en el prompt

| Option | Description | Selected |
|--------|-------------|----------|
| Pron. sujeto explícito | `io/tu/lui-lei/noi/voi/loro` en la frase, siempre. Cero ambigüedad, cero coste de redacción | ✓ |
| Mixto: pron. + sujeto nominal | Pronombre en 1ª/2ª y sujeto nominal natural en 3ª (`Marco`, `le ragazze`) — técnica ya shipeada en `presente-regolare-301` y `riflessivi-pp-concordanza` (D-38-01) | |
| Solo contexto/desinencia | Sin pronombre ni sujeto explícito; el resto de la frase implica la persona | |

**User's choice:** Pron. sujeto explícito
**Notes:** Desviación deliberada del precedente D-38-01 (nombres propios). Razón: la persona es el eje de variante declarado, tiene que ser inequívoca sin que el quórum lo pelee 48 veces. Coste aceptado: frases algo más artificiales que el italiano real.

### Objeto de `fare` en los prompts

| Option | Description | Selected |
|--------|-------------|----------|
| Literal 'hacer', gate declarado | Objeto siempre literal (`i compiti`, `un errore`, `il lavoro`). CERO perífrasis. SCOPE-GATE HARD en `notes`, mirror del gate de recíprocos de `riflessivi` | ✓ |
| Literal + perífrasis muy frecuentes | Se permiten 2-3 perífrasis de altísima frecuencia (`fare colazione`, `fare una domanda`) | |

**User's choice:** Literal 'hacer', gate declarado
**Notes:** Materializa el Out of Scope del milestone como gate de autoría. Efecto colateral buscado: sin perífrasis no queda léxico que glosar → refuerza el 0-gloss.

---

## MAGNETs del indicativo

### Formas arcaicas y poéticas atestiguadas (`fo`, `fé`, `fenno`, `facea`, `fan`)

| Option | Description | Selected |
|--------|-------------|----------|
| Blacklist + mención en explanation | Ninguna como key ni como distractora; blacklist en `notes` con audit trail; mencionadas en las explanations de presente y passato remoto como formas de lectura, no de producción. Cero variantes/quórum extra | ✓ |
| Solo blacklist | Prohibidas con audit trail, sin mención en ninguna explanation | |
| Ignorar | Son literarias y no pertenecen a A1/A2; no se declaran ni se documentan | |

**User's choice:** Blacklist + mención en explanation
**Notes:** El riesgo real no es que el autor las escriba, es que la autoría las genere como distractora "obviamente mala" siendo válidas. Precedente `fa'`/`fai` de Phase 43 aplicado un modo antes, donde el milestone no lo había declarado.

### Patrón de distractoras en los 4 slots SIMPLES

| Option | Description | Selected |
|--------|-------------|----------|
| 2 raíz mal + 1 otra persona | 2 = raíz equivocada en la persona correcta (`*faco`, `*facerò`, `*faci`, `*fecesti`) + 1 = forma REAL de otra persona (segura por el pronombre explícito). Simetría con el patrón de los compuestos | ✓ |
| 3 raíz mal | Las 3 son regularizaciones o cruces de raíz. Señal máxima, cero riesgo de doble validez, pero no ejercita la lectura del sujeto | |
| 3 formas reales de otras personas | Ejercita a fondo el cue de sujeto, pero no muestra nunca el error real (`*facerò`) que exige SC#1 | |

**User's choice:** 2 raíz mal + 1 otra persona
**Notes:** —

### Ronda EXTRA de quórum

| Option | Description | Selected |
|--------|-------------|----------|
| Sí: passato remoto + trapassato remoto | Los 12 variantes de esos 2 slots con pase DeepSeek obligatorio además del quórum base. Precedente: ronda extra DeepSeek en el MAGNET de `riflessivi` | ✓ |
| Sí: los 8 slots | Pase DeepSeek obligatorio sobre las 48 variantes | |
| No: quórum base uniforme | Rondas extra reservadas a los magnets declarados de Phases 42/43, como dice INT-04 | |

**User's choice:** Sí: passato remoto + trapassato remoto
**Notes:** Las dos razones: la alternancia `fec-`/`fac-` puede convertir una distractora en forma válida, y el marco del trapassato remoto es el único requisito sintáctico de la fase (agravado por `quando`).

---

## Tipos de ejercicio

### MC-only o word-buttons

| Option | Description | Selected |
|--------|-------------|----------|
| MC-only, 0-match y 0-wb declarados | Los 8 slots multiple-choice. Precedente `possessivi` (7 slots MC-only). Ambas omisiones documentadas en `notes` como decisión razonada | ✓ |
| MC + wb en trapassato remoto | 7 MC + el trapassato remoto en word-buttons (construir el marco). SC#3 dice que el marco ES el ejercicio | |
| MC + wb de colocación adverbial | 7 MC + wb sobre `sempre`/`mai`/`già` dentro del compuesto (`non ho mai fatto`). Presentado CON aviso de que es sintaxis, no casilla del paradigma | |

**User's choice:** MC-only, 0-match y 0-wb declarados
**Notes:** El wb del trapassato remoto se descartó por longitud del banco (≈8 tokens + distractoras); el de colocación adverbial por scope (es sintaxis del compuesto, no casilla). Ambos a Deferred.

### Ids de slot y aprobación del mapa

| Option | Description | Selected |
|--------|-------------|----------|
| Ids semánticos, mapa fijado aquí | `fare-indicativo-presente`…`-futuro-anteriore`. Sin checkpoint de aprobación: los 8 slots ya están fijados por FARE-X1 y el roadmap. Espacio `-300`+ libre para Phase 44 | ✓ |
| Ids semánticos + checkpoint | Mismos ids con `checkpoint:decision` al inicio de la autoría (patrón D-38-03) | |
| Ids numéricos | `fare-indicativo-001`..`-008` | |

**User's choice:** Ids semánticos, mapa fijado aquí
**Notes:** Ruptura deliberada con el patrón D-38-03 de checkpoint del slot-map: no hay grados de libertad que aprobar cuando los slots son las 8 casillas del paradigma.

### Troceado del trabajo y sede del quórum canónico

| Option | Description | Selected |
|--------|-------------|----------|
| 2 plans autoría + validación top-level | 41-01 = 4 simples (24), 41-02 = 4 compuestos (24). Quórum base Opus+Sonnet en pasada TOP-LEVEL posterior (el executor no puede spawnear los Task subagents de `gsd-validate-exercise`) | ✓ |
| 3 plans por bloque | 41-01 simples / 41-02 compuestos vivos / 41-03 trapassato remoto aislado | |
| 1 plan autoría + 1 plan validación | Un plan escribe las 48 variantes, otro las valida 1-por-1 | |

**User's choice:** 2 plans autoría + validación top-level
**Notes:** VAL-03 inviolable — 1 ejercicio por contexto, NUNCA batched. La ronda extra DeepSeek entra en la misma pasada top-level.

---

## Claude's Discretion

- Redacción concreta de los 48 prompts y de las 8 explanations (dentro de los patrones fijados), incluido qué objeto literal lleva cada frase y el reparto exacto de los 3 conectores entre las 6 variantes del trapassato remoto.
- Profundidad y estructura de cada explanation (citar el paradigma completo de las 6 formas frente a solo la casilla); tono D-127.
- `name` exacto de la entrada de `categories.json`.
- Nombres y estructura de los tests nuevos, con la cobertura mínima listada en CONTEXT.md.
- Sincronizar o no el count de `fare-indicativo` al final de Phase 41 (rojo esperado hasta Phase 44 en cualquier caso).

## Supuestos presentados y no objetados por el autor

- **Phase 41 SÍ añade la entrada en `categories.json`** (`order: 15`, `origen: "ia-quorum"`) — SC#5 lo exige y D-40-06 lo previó. `origen` se estampa ya porque el campo existe en schema desde v1.9, a diferencia de Phase 38 que lo difirió a Phase 39.
- **Los counts quedan en rojo** hasta Phase 44 (arrays hardcoded + `TOTAL_EXPECTED` + baseline-guard). Rojo esperado, patrón v1.6/v1.7/v1.9.

## Deferred Ideas

- Word-buttons de colocación adverbial (`non ho mai fatto`) — sintaxis del compuesto, no casilla del paradigma.
- Word-buttons del marco del trapassato remoto — banco demasiado largo (≈8 tokens + distractoras).
- Contraste de uso passato remoto ↔ passato prossimo (variación regional) — registro, no paradigma.
- Perífrasis y modismos de `fare` — Out of Scope del milestone; candidata a `fare-modismi`.
- Partir `fare-indicativo` en semplici/composti si la categoría se atasca en el uso real.
- Cruces multi-cat `-300`+ y sync de counts → Phase 44 (INT-01/02/03).
- Mismo patrón para `andare` / `venire` / `dire` → v2.1+.
