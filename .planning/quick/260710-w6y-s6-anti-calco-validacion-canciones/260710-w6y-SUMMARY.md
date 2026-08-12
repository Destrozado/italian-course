---
phase: quick-260710-w6y
plan: 01
subsystem: validation
tags: [song-validation, prompt-engineering, anti-calco, idiomatic-naturalness]
status: complete
prior_status: shipped
requires: []
provides:
  - "Criterio S6 (anti-calco) en el contrato de validación de canciones"
affects:
  - docs/SONG-VALIDATION-PROMPT.md
tech-stack:
  added: []
  patterns:
    - "Prompt de validación self-contained con guardia de fidelidad explícita"
key-files:
  created: []
  modified:
    - docs/SONG-VALIDATION-PROMPT.md
decisions:
  - "S6 marca false SOLO por calco no idiomático; la guardia de fidelidad impide que la sugerencia natural derive el significado"
  - "El FAIL few-shot mantiene s6_naturalidad=true (su fallo es de palabra, S1/S2) para no confundir S6 con S1/S2"
  - "scripts/validate-song-pass.mjs NO tocado: su check solo exige verdict+criteria; una 6ª clave es transparente"
metrics:
  duration: ~5 min
  completed: 2026-07-10
requirements:
  - S6-anti-calco-naturalidad-idiomatica
---

# Quick 260710-w6y: Criterio S6 anti-calco en validación de canciones — Summary

Se añadió un sexto criterio S6 (naturalidad idiomática / anti-calco, con guardia de fidelidad) al contrato de validación de canciones `docs/SONG-VALIDATION-PROMPT.md`, cerrando el hueco "gramatical pero calco no idiomático" que S1 dejaba pasar.

## Qué se hizo

- **§2 nueva regla S6** "Naturalidad idiomática / anti-calco": prohíbe el calco literal de construcciones italianas que un nativo hispanohablante no usaría (aunque cada palabra sea correcta), con **guardia de fidelidad** explícita (ejemplo "Mi vedo sbagliata" → "me siento equivocada", no "me veo mal") y su relación con S1 (S1 = palabra; S6 = calco idiomático).
- **§3 sugerencia obligatoria** extendida a `s6_naturalidad` además de S1/S2, con la guardia de fidelidad aplicada a la sugerencia.
- **§4 contrato de output** ahora exige las 6 booleanas en `true` para `verdict: "correcta"`; añadida clave exacta `s6_naturalidad`, tag literal `[S6-naturalidad]`, y regla de sugerencia para S6.
- **§5 few-shot** PASS y FAIL actualizados con línea S6 en el chain-of-thought y `s6_naturalidad` en el bloque `criteria` (ambos siguen sintéticos genéricos; el FAIL mantiene `s6_naturalidad=true` porque su fallo es de palabra, no calco).
- **Rango S1-S5 → S1-S6** actualizado en título, nota operativa, §1, §2, §6 (incluido el ejemplo de payload de injection y la directiva del guard).

## Deviations from Plan

None - plan executed exactly as written.

## Verificación

- Comando `<verify>` del plan: **OK** — "S6 anadido, rangos actualizados, 2 bloques JSON de output parseables".
- Sin referencias de rango obsoletas (S1-S5 / 5 booleanas / 5 criterios / las 5 keys).
- Ambos bloques de output JSON (PASS/FAIL) parseables con `JSON.parse` strict.
- `scripts/validate-song-pass.mjs` intacto (fuera de scope; solo se modificó `docs/SONG-VALIDATION-PROMPT.md`).

## Self-Check: PASSED

- FOUND: docs/SONG-VALIDATION-PROMPT.md
- FOUND: commit 083df62
