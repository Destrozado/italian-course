---
status: testing
phase: 44-integraci-n-lockstep-cierre-v2-0
source: [44-VERIFICATION.md]
started: 2026-08-11T15:30:00Z
updated: 2026-08-11T15:30:00Z
---

## Current Test

number: 1
name: Las 18 categorías se pintan bien en home, picker de Repaso y picker de Examen
expected: |
  Las 18 filas aparecen en el orden de `content/categories.json` (order 1-18), sin
  huecos ni duplicados visuales, y sin romper el layout de la tabla del home ni de
  los dos pickers. Las 4 últimas son las de `fare`: `Fare — indicativo`,
  `Fare — congiuntivo`, `Fare — condizionale e imperativo`, `Fare — formas indefinidas`.
awaiting: user response

## Tests

### 1. Render de las 18 categorías (INT-01)
expected: Las 18 filas en el orden de `categories.json` (order 1-18), sin huecos ni duplicados, sin romper el layout de la tabla del home ni el picker de Repaso/Examen. Las 4 de `fare` cierran la lista.
result: [pending]

### 2. Cascada D-54 sobre los cruces nuevos, en sesión jugada de verdad (INT-03)
expected: Al fallar `fare-indicativo-300`, `fare-indicativo-301` o `fare-indefiniti-300`, se resetean LAS DOS categorías de su `categoryIds` — la propia `fare-*` y la vecina (`avere`, `presente-regolare` o `modali` respectivamente) — quedando ambas en racha 0 / no-hecha. Hoy solo está verificado por la vía negativa (`grep -c 'applyImmediateFailure(this.state'` = 2 y diff del motor vacío), nunca jugando.
result: [pending]

### 3. Decisión sobre los 9 warnings + 3 info del code review (44-REVIEW.md)
expected: Decisión explícita: aceptar la deuda con nota, o abrir un fix puntual antes de `/gsd-complete-milestone v2.0`. Los dos que el reviewer señaló como más relevantes, y que tocan el Core Value (que no se cuele un ejercicio con dos respuestas defendibles), son WR-01 — el gate anti-ceguera sigue verde ante una entrada COMENTADA del array y no comprueba la correspondencia `slug` ↔ `file`, así que un copy-paste de `fare-ind` doblaría un hermano y perdería el otro con el guard dinámico cuadrando — y WR-03 — los glosses ES de los 3 cruces no tienen ningún gate propio, que es justo donde el quórum cazó el leak C5 real de `fare-indicativo-301`, de modo que nada mecánico protege el 0-gloss de una regresión futura.
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
