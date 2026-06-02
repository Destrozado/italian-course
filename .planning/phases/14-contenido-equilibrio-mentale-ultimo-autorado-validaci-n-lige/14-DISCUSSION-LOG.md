# Phase 14: Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-02
**Phase:** 14-Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera
**Areas discussed:** Segmentación en frases, Repeticiones (estribillo/coda), Enganche de categorías, Estilo de traducción + proceso

---

## Segmentación en frases

| Option | Description | Selected |
|--------|-------------|----------|
| Unidad de sentido (fusiona encabalgamiento) | Fusiona líneas que forman una sola idea; traducción más natural, menos frases | ✓ |
| Una línea = una frase | Cada línea independiente; más frases, más mecánico | |
| Híbrido conservador | Mayormente línea-a-línea, fusionar solo donde una línea suelta no tiene sentido | |

**User's choice:** Unidad de sentido (fusiona encabalgamiento)
**Notes:** Coherente con el requisito CONT-01 "frases con sentido completo". Limpiar ruido no-lírico antes de segmentar.

---

## Repeticiones (estribillo/coda)

| Option | Description | Selected |
|--------|-------------|----------|
| Colapsar a frases únicas | Cada frase única una vez (~35); ritornello/coda no repetidos | ✓ |
| Incluir todas las repeticiones | Recorrido tal cual se canta (~60); más reps pero retraduce idénticas | |
| Únicas + variantes reales | Colapsar idénticas pero conservar las 2 variantes 'ai/i miei perché' | |

**User's choice:** Colapsar a frases únicas
**Notes:** ~35 frases. De las 2 variantes del ritornello se elige una (Claude discretion, preferir 1ª aparición). Coda 'insegnami' una vez.

---

## Enganche de categorías

| Option | Description | Selected |
|--------|-------------|----------|
| Enganche limpio donde se ejercita de verdad | Solo etiquetar donde la frase ejercita la regla no trivialmente; pasado/sin-categoría → CATPROC | ✓ |
| Denso: todas las que toca | Etiquetar toda categoría aplicable; maximiza cascada pero falsos reset por palabras incidentales | |
| Conservador: 1 dominante | Solo la categoría más clara por frase | |

**User's choice:** Enganche limpio donde se ejercita de verdad
**Notes:** Coherente con la DESIGN RULE del proyecto. Estructuras sin categoría existente (passato prossimo, futuro, reflexivos) quedan sin categoría deliberadamente, alimentando CATPROC.

---

## Estilo de traducción + proceso

| Option | Description | Selected |
|--------|-------------|----------|
| Natural/idiomática | Suena bien en español aunque se aleje del literal (la gracia); autor oráculo | ✓ |
| Literal cercana | Lo más pegada al italiano; más fácil de adivinar, menos gracia | |
| Mixta por frase | Natural donde el literal suena raro, literal donde fluye | |

**User's choice:** Natural/idiomática
**Notes:** Autor = oráculo final del fraseo. Proceso aceptado: Claude propone por bloques (D-85) + autor revisa; 1 pase IA ligero (traducción defendible + enganche correcto), NO quórum estricto R1-R7. Distractoras = ninguna por defecto.

---

## Claude's Discretion

Slug del archivo (`equilibrio-mentale`) e ids de frase; qué variante del ritornello se conserva; tokenización exacta de cada answer[]; preservar ortografía italiana en prompt + canon RAE en español; entry songs.json con phraseCount lockstep; número final de frases (~35, lo fija la segmentación real); si el pase IA ligero reutiliza scripts/validate-ai-pass.mjs o un subagente Claude.

## Deferred Ideas

- CATPROC (procesar frases sin categoría → proponer categorías) — milestone futuro
- Más canciones (MUSIC-X1) — contenido posterior
- Distractoras curadas por frase — fuera por defecto
- Quórum cross-vendor estricto R1-R7 sobre canciones — fuera (CONT-03 validación ligera)
