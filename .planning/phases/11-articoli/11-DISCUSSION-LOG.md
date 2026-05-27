# Phase 11: Articoli - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 11-articoli
**Areas discussed:** Alcance del temario, Mezcla de tipos, Diseño bridges, Densidad/volumen

---

## Gray-area selection

El usuario eligió discutir las **4** áreas presentadas (de 4 ofrecidas): Alcance del temario, Mezcla de tipos, Diseño bridges, Densidad/volumen.

---

## Alcance del temario

| Option | Description | Selected |
|--------|-------------|----------|
| Completo y autocontenido | Todo el sistema (il/la/l' básicos incl. + lo/gli + un/uno/una/un' + disparadores estándar + trampas); fuera raros/literarios y variables discutibles | ✓ |
| Diferenciado de génnumero | Solo lo que génnumero no cubre (lo/gli, indet, disparadores duros); asume básicos ya practicados | |
| Completo + casos variables | Como completo + disparadores debatibles/raros (lo pneumatico, lo yogurt, gli dei) como trampas A2 | |

**User's choice:** Completo y autocontenido
**Notes:** El solape con génnumero (que ya toca il/la/l') es deseable — refuerza la re-verificación (core value). Casos raros/variables → deferred a A2 si emerge dolor.

---

## Mezcla de tipos

| Option | Description | Selected |
|--------|-------------|----------|
| Mayoría multiple-choice + bloque match | MC columna vertebral ('___ studente' → il/lo/l'/la) + match articolo↔sustantivo agrupando por disparador; word-buttons mínimo/nulo | ✓ |
| Equilibrado 3 tipos | Reparto parejo MC / match / word-buttons (montar 'lo studente straniero') | |
| Solo multiple-choice | Toda la categoría en MC por velocidad y simplicidad | |

**User's choice:** Mayoría multiple-choice + bloque match
**Notes:** El match de Articoli va más profundo que el de génnumero (lo/gli/uno + plurales + trampas), no re-hace el il/la/l' singular básico. Word-buttons solapa con la concordancia de génnumero.

---

## Diseño bridges

| Option | Description | Selected |
|--------|-------------|----------|
| 2 categorías, ~4-6 bridges | articoli↔género-número + articoli↔sustantivos-irregulares (lo zio→gli zii, il braccio→le braccia); ~6 MC patrón avere-300.. | ✓ |
| Abrir a más cruces | + profesiones (l'avvocato) y preposiciones (nello zaino); ~8-10 bridges | |
| Solo género-número | 1 cruce; sustantivos-irregulares para fase posterior | |

**User's choice:** 2 categorías, ~4-6 bridges
**Notes:** Coherente con la elección del init (género/número + sustantivos). Más cruces (profesiones/preposiciones) → deferred para acotar v1.2.

---

## Densidad/volumen

| Option | Description | Selected |
|--------|-------------|----------|
| Densa (~45-55, tipo Preposiciones) | Cada disparador con varios contextos; coherente con "completo" | ✓ |
| Media (~30-35) | Cada disparador con 1-2 contextos | |
| Lean (~20-25, tipo Avere) | 1 ejercicio por celda esencial | |

**User's choice:** Densa (~45-55)
**Notes:** Articoli es fundamental y tiene muchos sub-casos de disparador (det+indet × sing/plural × 8 disparadores). El número exacto lo determina el temario (ART-02). Coste asumido: más ejercicios que curar + validar por quórum.

---

## Claude's Discretion

- Nombre/orden de la categoría en categories.json (sugerencia `Articoli (artículos)`, order 8).
- Esquema de IDs (`articoli-001..` base + `articoli-300..` bridges, espejo de avere).
- Estrategia de distractoras en multiple-choice (otras formas de artículo plausibles).
- Reparto exacto determinativi vs indeterminativi dentro de la categoría.

## Deferred Ideas

- Bridges Articoli↔profesiones / ↔preposiciones (l'avvocato, nello zaino) — fase posterior.
- Casos variables/raros A2 (lo pneumatico vs il, lo yogurt/iogurt, gli dei, lo iato) — si emerge dolor real.
- word-buttons pesado (concordancia completa artículo+nombre+adjetivo) — solapa con génnumero.
- PART-X1 (bridges de Partitivos) — Phase 12+.
