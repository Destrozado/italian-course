# Phase 5: Essere — Discussion Log

**Date:** 2026-05-24
**Phase:** 05-essere-categoria-fundamental-que-faltaba
**Mode:** discuss (default — 4 single-question turns)

This log is human-reference only. Downstream agents (researcher, planner, executor) read CONTEXT.md, not this file.

---

## Areas Selected for Discussion

Question: *"Fase 5 — Essere. La ROADMAP ya bloquea: 7ª categoría con order:2, ≥30 ejercicios, cobertura fija (presente 6 personas + identidad + nacionalidad + profesión + estado + cópula + participio si viable), DESIGN RULE de Phase 4 (mayoría multi-choice, match solo si no derivable por raíz), ≥1 multi-cat con cascada D-54. Quedan estas decisiones HOW. ¿Cuáles quieres discutir?"*

**User selection (multiselect):**
- ✅ Mezcla de tipos en essere.json
- ✅ Estrategia de distractoras
- ✅ Cobertura cuantitativa por sub-área
- ✅ Cuántos cruces multi-categoría y con cuáles

---

## Area 1: Mezcla de tipos en essere.json

### Q1.1 — ¿Qué tipos de ejercicio incluyes?

**Options presented:**
1. 100% multi-choice (~30+)
2. Mayoría multi-choice + 3-5 word-buttons (Recommended)
3. Multi-choice + word-buttons + 1-2 match

**User selection:** *Mayoría multi-choice + 3-5 word-buttons*

**Rationale:**
- Coherente con D-86 (Phase 4) "tipo natural por categoría" — verbo central admite word-buttons para frases de orden léxico no derivable.
- Match descartado (DESIGN RULE Phase 4 — conjugación de essere es derivable por raíz).
- Coherencia con `profesiones.json` (mezcla mc + wb + match).

### Q1.2 — Word-buttons (3-5) — ¿sobre qué sub-áreas?

**Options presented (multiselect):**
1. Identidad / presentación
2. Nacionalidad
3. Profesión con essere
4. Participio passato prossimo

**User selection:** *Las 4* → 4 word-buttons total, 1 por sub-área.

**Rationale:** ranking pedagógico claro — son las 4 sub-áreas donde la frase completa requiere reconstrucción, no solo elección de forma verbal.

→ **Captured as D-89, D-90.**

---

## Area 2: Estrategia de distractoras

### Q2.1 — ¿Cómo se construyen las 4 opciones de cada multi-choice?

**Options presented:**
1. Siempre 1 forma de avere + 2 essere mal conjugadas + 1 correcta (Recommended)
2. Distractora avere solo en áreas de contraste semántico
3. Mezcla libre — Claude decide caso por caso

**User selection:** *Patrón fijo 1 avere + 2 essere mal + 1 correcta*

**Rationale:**
- El contraste essere/avere ES el core pedagógico para hispanohablantes.
- Cada fallo enseña O conjugación O contraste — cero distractoras "rellenas".
- Patrón verificable mecánicamente (validación opcional en plan-phase: cada `payload.options` debería tener exactamente 1 forma de avere identificable).

→ **Captured as D-91.**

---

## Area 3: Cobertura cuantitativa por sub-área

### Q3.1 — Reparto cuantitativo dentro de los ≥30 ejercicios

**Options presented:**
1. Reparto equilibrado con participio (~32-34 total, A1 viable) (Recommended)
2. Reparto mínimo sin participio (~30 — más seguro A1)
3. Reparto cargado en conjugación + contraste avere (~32)

**User selection:** *Reparto equilibrado con participio (~33 base)*

**Rationale:**
- Cobertura A1 completa per ROADMAP §3 incluyendo `stato/stata/stati/state`.
- Margen sobre el mínimo ROADMAP (≥30) sin sobrecargar.
- Participio es A1 estándar en cursos italianos para hispanohablantes — la hedge "si viable" del roadmap se resuelve afirmativamente.

**Reparto final (D-92):**

| Sub-área                     | Cantidad | Tipos        |
|------------------------------|----------|--------------|
| Conjugación presente         | 8        | 8 mc         |
| Identidad / presentación     | 5        | 4 mc + 1 wb  |
| Nacionalidad                 | 4        | 3 mc + 1 wb  |
| Profesión con essere         | 5        | 4 mc + 1 wb  |
| Estado / condición           | 4        | 4 mc         |
| Cópula clasificatoria        | 2        | 2 mc         |
| Participio passato prossimo  | 5        | 4 mc + 1 wb  |
| **Base subtotal**            | **33**   | **29mc + 4wb** |

→ **Captured as D-92, D-93.**

---

## Area 4: Cuántos cruces multi-categoría y con cuáles

### Q4.1 — Multi-cat crosses con essere

**Options presented:**
1. Replicar patrón avere-300..305 con essere-300..305 (6 cruces, 1 por categoría) (Recommended)
2. Solo 2-3 cruces (mínimo + esenciales)
3. 1 cruce mínimo + dejarlo crecer orgánicamente

**User selection:** *Replicar patrón completo essere-300..305 (6 cruces)*

**Rationale:**
- Espejo exacto del patrón Phase 4 (avere-300..305) — coherencia arquitectónica.
- Maximiza la ejercitación de la cascada D-54 sobre essere desde el día 1 de uso real.
- Cada cruce tiene un razonamiento pedagógico distinto (contraste avere, profesión, auxiliar passato prossimo, concordancia, plural irregular, preposición de origen).

**Cruces locked:**
- essere-300: essere + avere ("Mio fratello è medico e ha 30 anni")
- essere-301: essere + profesiones ("Lei è avvocata")
- essere-302: essere + verbos-movimiento ("Maria è andata al cinema")
- essere-303: essere + genero-numero ("Noi siamo italiani di Milano")
- essere-304: essere + sustantivos-irregulares ("Le mie braccia sono stanche")
- essere-305: essere + preposiciones ("Io sono di Milano e parlo italiano")

→ **Captured as D-94, D-95.**

---

## Convenciones heredadas (no re-discutidas — flujo automático)

- **D-96 (← D-85):** Claude propone JSON desde conocimiento A1 → autor revisa pedagógicamente → commit. Sin PDF.
- **D-97 (← D-88 invertido):** APPEND-ONLY post-commit para essere.json (sin script de blindaje en Phase 5).
- **D-98 (← CONT-06):** NFC normalize on load + apóstrofes ASCII.
- **D-99:** categories.json shift — avere order:1 mantiene, essere insertada order:2, las 5 existentes desplazan +1.

---

## Scope creep redirigido

(Ninguno surgido durante la discusión — la fase está muy delimitada por ROADMAP.)

---

## Deferred ideas capturadas

(Listadas en CONTEXT.md sección `<deferred>` — match dentro de essere, imperfecto/futuro/condicional, imperativo, esserci, modismos, helper assert-essere, cruces multi-cat adicionales, sub-categoría "descrizione fisica", UI multi-cat en resumen.)

---

## Claude's discretion (delegado al planner)

- Texto exacto de cada frase candidata.
- Notes por ejercicio (tono avere.json original).
- Orden interno del JSON (probablemente por sub-área, multi-cat al final).
- Smoke test multi-cat — extensión automática vs explícita.
- Nombre legible "Essere" o "Essere (cópula)" en categories.json.
- Plan único vs multi-plan (ROADMAP sugiere único; CONTEXT confirma).
- UAT humano final concreto (qué frase fallar para verificar cascada).

---

*Discussion completed: 2026-05-24*
