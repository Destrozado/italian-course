---
status: complete
phase: 16-motor-de-examen-por-slots
source: [16-VERIFICATION.md]
started: 2026-06-03
updated: 2026-06-03
---

## Current Test

[testing complete]

## Tests

### 1. Home — recuento de slots
expected: Arranca el server local (`npx serve` o Live Server) y abre `http://localhost:PORT` (NO `file://`). Las 9 categorías son visibles y la columna "Ejercicios" muestra el mismo número que antes de esta fase.
result: pass

### 2. Repaso 20 — "hecha" por slots
expected: Haz un Repaso 20 sobre 1-2 categorías sin fallar → la categoría se marca "hecha"; el indicador "Ejercicio X / N" cuenta slots.
result: pass

### 3. Cascada D-54 en navegador
expected: Falla un ejercicio a propósito → cascada D-54 inmediata (las categorías del slot se desmarcan al instante) + explicación pedagógica como antes.
result: pass

### 4. Test completo — reanudar con la MISMA variante
expected: Avanza unos ejercicios en Test completo, recarga (F5), pulsa "Reanudar" → reanuda en el mismo punto con el mismo ejercicio/variante (no se re-sortea).
result: pass

### 5. Resumen — review del error con la variante exacta
expected: Tras una sesión con fallos, la pantalla de resumen → "Errores cometidos" muestra prompt/respuesta correcta/explicación del ejercicio EXACTO fallado (la variante mostrada, no la variante 0).
result: pass

### 6. localStorage — schemaVersion 6 sin reset
expected: DevTools → Application → Local Storage → `schemaVersion: 6` y el progreso previo NO reseteado; sin banner de validación.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
