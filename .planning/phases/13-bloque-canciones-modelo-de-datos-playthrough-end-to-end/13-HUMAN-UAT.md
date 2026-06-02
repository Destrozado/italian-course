---
status: partial
phase: 13-bloque-canciones-modelo-de-datos-playthrough-end-to-end
source: [13-VERIFICATION.md]
started: 2026-06-02T00:00:00Z
updated: 2026-06-02T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Playthrough completo sin errores
expected: Abrir el home → pulsar Canciones → Jugar en mini-prueba → responder correctamente las 3 frases en orden. Las frases avanzan secuencialmente (1→2→3) con auto-avance 600ms; al terminar el resumen muestra 0 frases falladas y el bloque "Categorías que bajaron de estado" vacío; al volver al listado el badge muestra "Pasada".
result: [pending]

### 2. Cascada D-54 con categoría enganchada
expected: Jugar la mini-prueba y fallar la frase 1 (mini-prueba-001, categoryIds=['avere']). Feedback rojo con la traducción correcta + botón Siguiente; al terminar, el resumen lista la frase 1 en "Frases falladas" (tu respuesta vs correcta) y la categoría avere en "Categorías que bajaron de estado"; en DevTools localStorage categoryProgress.avere.status pasa a 'no-hecha'; el estado de la canción en el listado es "Fallada".
result: [pending]

### 3. Frase sin categoría no cascadea
expected: Jugar la mini-prueba y fallar solo la frase 3 (mini-prueba-003, categoryIds=[]). Feedback rojo; el resumen lista la frase 3 en "Frases falladas" pero el bloque "Categorías que bajaron de estado" está VACÍO (sin cascada por categoryIds vacío); localStorage songProgress.mini-prueba.status='fallada' y categoryProgress sin cambios.
result: [pending]

### 4. Abandono a mitad y re-inicio de cero (PLAY-05)
expected: Iniciar la mini-prueba, fallar la frase 1 (la cascada D-54 persiste), pulsar "Volver a Canciones" antes de terminar, re-entrar a la misma canción. El progreso no comprometido se descarta (la canción NO queda marcada pasada/fallada por el abandono); al re-entrar empieza desde la frase 1; en localStorage la cascada D-54 de la frase 1 (categoryProgress.avere reseteada) SIGUE aplicada.
result: [pending]

### 5. Aislamiento LINK-04 en UI
expected: En el home, la tabla de categorías gramaticales NO muestra mini-prueba ni ninguna canción; iniciar una sesión de Repaso 20 (o Test completo) NO incluye frases de mini-prueba.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
