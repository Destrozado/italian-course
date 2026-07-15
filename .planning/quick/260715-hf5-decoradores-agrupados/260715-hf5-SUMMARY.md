---
quick_id: 260715-hf5
status: complete
date: 2026-07-15
---

# Quick Task 260715-hf5 — Modo "decoradores agrupados" en canciones (piloto)

## Qué se hizo

Feature de tamaño-fase entregada como piloto sobre la canción **spari-sul-petto**:
un **doble modo** de banco de palabras en canciones, conmutable por canción con
un checkbox:

- **Clásico** — banco = solo `answer` barajado (comportamiento histórico intacto).
- **Agrupado** — banco = `answer ∪ decoys`, agrupado por **categoría sintáctica**
  (POS) con etiqueta visible y **grupos colapsables** (acordeón mobile-first).
  Los decoys son plausibles-pero-incorrectos → ya no se resuelve por descarte y
  reconocer la categoría refuerza la sintaxis.

## Decisiones del autor (2026-07-15)
- Doble modo por canción, conmutable con checkbox; si una canción solo tiene un
  modo, entra en ese directamente.
- Decoys por IA + quórum (como las traducciones).
- Grupos con etiqueta visible; acordeón colapsable; **mobile-first**.
- Piloto en spari-sul-petto (validar aprendizaje + layout móvil antes de escalar).

## Commits (atómicos)
1. `f597999` — `src/domain/word-groups.js` (taxonomía POS + `groupTokens` puro) + 8 tests.
2. `c60cccc` — pipeline decoys: `docs/DECOY-VALIDATION-PROMPT.md` (D1-D5) + `scripts/validate-decoy-pass.mjs`.
3. `334db80` — UI dual-mode: toggle + acordeón (app.js/index.html/app.css) + 7 tests.
4. `580b904` — `content/songs/spari-sul-petto.json`: decoyBank validado (51/51).

## Diseño (clave)
- **`decoyBank` aditivo y opcional** por frase: `{ distractors: string[], pos: {token: posKey} }`.
  Separado de `distractors` a nivel de frase → el modo clásico NUNCA inyecta
  decoys. Las 10 canciones sin decoyBank quedan idénticas (regresión cero).
- **Agrupación = vista de solo-lectura** sobre el banco plano (`bankWithKeys`):
  preserva idx/placed/teclas 1..9 → grading y colocación intactos.
- **`serializeSong`** (exportado por el script) con round-trip verificado sin
  pérdida de datos → escritura del `decoyBank.validation` sin parche quirúrgico.

## Validación
- **decoyBank 51/51 `validated`** por quórum cross-vendor (D1-D5): deepseek-chat +
  deepseek-reasoner (+ gemini donde entró antes del rate-limit).
- 4 disputas resueltas por juicio humano (calidad > tokens, sin override-atajo):
  - 016: `guardado`≈encerrado, `para`≈por, `cada`≈toda/ogni (alternativas
    válidas) → `olvidado` / `sin` / `esta`.
  - 013: `subí`≈llevé (portare in alto) → `subiste` (persona incorrecta).
  - 038: `mía` en "parte mía" (posesivo postnominal) → POS `determinante`→`adjetivo`.
- Traducción (bloque `validation`) intacta: 51/51.
- `node --test tests/*.test.js` → **664 pass / 0 fail** (15 tests nuevos).
- Render verificado headless (google-chrome CDP) en viewport móvil 390px: grupos
  etiquetados y colapsables, decoys mezclados por POS, layout ordenado (hay
  scroll vertical, previsto y mitigable con el colapso).

## Pendiente / siguiente (si se decide escalar)
- Extender decoyBank a las otras 10 canciones (mismo pipeline).
- Opcional: completar los pases cross-vendor con Gemini donde quedó rate-limited
  (hoy validadas con par DeepSeek, patrón ya aceptado en el corpus).
- Evaluar en uso real si el modo agrupado se convierte en el único (entonces se
  autora directamente al crear canciones nuevas).
