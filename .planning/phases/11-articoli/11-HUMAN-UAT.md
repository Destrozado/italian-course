---
status: partial
phase: 11-articoli
source: [11-VERIFICATION.md]
started: 2026-05-28
updated: 2026-05-28
---

## Current Test

[awaiting human testing in browser]

## Tests

### 1. Articoli aparece como 8ª fila en el home + Examen a 1 clic
expected: Al abrir la app (npx serve / Live Server), "Articoli" se ve como 8ª fila en la tabla del home (order 8), y un clic lanza un Examen de esa categoría. Verificado en código (categories.json order 8, categoriesForDisplay) pero el render + lanzamiento necesitan navegador.
result: [pending]

### 2. Cascada D-54 multi-categoría al fallar un bridge
expected: Fallar un ejercicio-bridge articoli-300..305 resetea AMBAS categorías (Articoli + género-número o + sustantivos-irregulares) a no-hecha con racha 0 al instante, y el resumen post-sesión muestra las 2+ categorías afectadas. Lógica verificada (flatMap(categoryIds) en src/domain/progress.js) pero el reset instantáneo + resumen visible necesitan navegador.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
