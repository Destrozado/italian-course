# Phase 17: Piloto Preposiciones (contenido) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-03
**Phase:** 17-piloto-preposiciones-contenido
**Areas discussed:** Estructura de slots, Explanation por slot, Autoría variantes, Reset de progreso

---

## Estructura de slots

### Criterio de agrupación

| Option | Description | Selected |
|--------|-------------|----------|
| Por regla pedagógica | Cada regla distinta = 1 slot; reformulaciones de la misma regla = variantes | ✓ |
| Por preposición base | di/a/da/in/su/con/per/tra = ~8 slots; todos los usos como variantes | |
| Híbrido propuesto | Claude propone mapeo concreto, autor revisa | |

**User's choice:** Por regla pedagógica
**Notes:** Literal lo que pide el roadmap ("misma regla reformulada = variantes"). Granular, máximo "no olvidar".

### Granularidad de las articolate

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot por base | in-articolata = 1 slot 6 variantes (nel/nello/nella/nei/negli/nelle) | |
| Por singular/plural | 2 slots por base (singular vs plural) | |
| 1 slot por forma | Cada forma (nel, nello, nella…) su slot | ✓ |

**User's choice:** 1 slot por forma
**Notes:** Identidad de slot = forma exacta; variantes nacen de reformular la misma forma con otro sustantivo. Caso confirmado: 006/013/043 (sul) → 1 slot 3 variantes.

### Slot locativo fijo in spiaggia (PILOT-03)

| Option | Description | Selected |
|--------|-------------|----------|
| 1 slot, 4 variantes | in spiaggia/montagna/al mare/campagna = 1 slot | |
| Separar por forma | slot in-locativo (3 variantes) + al mare slot de 1 | ✓ |

**User's choice:** Separar por forma
**Notes:** Coherente estricto con "1 slot por forma" — al mare usa 'al', se separa aunque rompa la unidad de la lista de excepciones.

---

## Explanation por slot

### Contenido de la explicación a nivel de slot

| Option | Description | Selected |
|--------|-------------|----------|
| Regla generalizada | Reescribir explicación a nivel de regla que cubra todas las variantes | |
| Elegir la más completa | Quedarse con la más general/completa existente, sin reescribir | ✓ |
| Tú decides por slot | Claude propone, autor revisa una a una | |

**User's choice:** Elegir la más completa
**Notes:** Cero trabajo de redacción de cero.

### Matiz único en explicación descartada

| Option | Description | Selected |
|--------|-------------|----------|
| Injertar el matiz | Base elegida + añadir matices únicos no cubiertos (merge ligero) | ✓ |
| Aceptar la pérdida | Quedarse estrictamente con la más completa | |

**User's choice:** Injertar el matiz
**Notes:** Preserva la cobertura de PILOT-05; pasa por revisión del autor.

---

## Autoría variantes

### Discrepancia 52 vs 57

| Option | Description | Selected |
|--------|-------------|----------|
| 57 es stale | El archivo tiene 52; corregir el número a 52 | ✓ |
| Faltan 5 | Recuperar/autorar 5 ejercicios perdidos | |
| No lo sé | Investigar git history | |

**User's choice:** 57 es stale
**Notes:** Trabajar sobre los 52 reales; corregir REQUIREMENTS/ROADMAP.

### Quórum de variante nueva

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-vendor completo | Gemini + DeepSeek + Claude, todos "correcta" (R1-R7) | ✓ |
| Solo skill Claude | gsd-validate-exercise (Opus+Sonnet, mismo vendor) | |
| Cross-vendor + scan acentos | Cross-vendor + scan explícito de acentos | |

**User's choice:** Cross-vendor completo
**Notes:** Lo que pide el roadmap; memoria registra que el cross-vendor caza bugs que el human-verify aprueba.

### Alcance de la autoría

| Option | Description | Selected |
|--------|-------------|----------|
| Donde tenga sentido | Solo slots con regla reformulable; excepciones idiomáticas = slot-de-1 | ✓ |
| Todos los slots ≥2 | Cada slot de 1 recibe ≥1 variante nueva | |
| Objetivo numérico | Fijar un target concreto (p. ej. ~3 slots a 3 variantes) | |

**User's choice:** Donde tenga sentido
**Notes:** Coincide literal con el roadmap; piloto pragmático sin inflar coste cross-vendor.

---

## Reset de progreso

### Trigger del reset idempotente

| Option | Description | Selected |
|--------|-------------|----------|
| Migración 6→7 | migrate6to7 poda categoryProgress['preposiciones'] + exerciseStats['preposiciones-*'] | ✓ |
| Derivado de ids | Confiar en que ids nuevos no casan con clearedExerciseIds viejos | |
| Botón manual | Autor pulsa reset de categoría | |

**User's choice:** Migración 6→7
**Notes:** Reusa la cadena de migración existente (idempotente by design); otras 8 categorías intactas; automático.

---

## Claude's Discretion

- Esquema de id del slot fusionado (el reset hace irrelevante la estabilidad de ids legacy).
- Firma/ubicación exacta de `migrate6to7`/`hydrateV7` y helper de poda por prefijo.
- Edge case del `inFlightTest` que toque Preposiciones durante la migración.
- Cobertura/parametrización del smoke test (PILOT-05).
- Re-validación cross-vendor solo si cambia la superficie de un ejercicio existente al reagrupar.

## Deferred Ideas

- Reescritura de explicaciones a regla generalizada (descartada por coste; revisable).
- Articolate como 1 slot por base (descartada a favor de 1-slot-por-forma; revisable).
- Conversión del resto de categorías a slots (CONV-01, backlog post-v1.4).
