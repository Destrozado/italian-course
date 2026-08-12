---
title: "VOCAB-X1 — Aprendizaje de vocabulario (ES→IT / IT→ES / mezclado, fácil y difícil)"
area: feature
created: 2026-08-13
source: conversación con el autor 2026-08-13 (cierre de v2.0)
severity: feature
status: pending
target: milestone candidato (post-v2.0, DESPUÉS de TRAD-X1)
depends_on: traduccion-es-por-ejercicio.md
---

## Qué

Modo de vocabulario con modalidades y dificultades.

**Modalidades:** ES→IT · IT→ES · mezclado

**Dificultades:**
- **Fácil** — varias palabras destino y eliges (la pista está en las opciones)
- **Difícil** — hueco libre, escribes la traducción

## Puntos de diseño — decidir en plan-time

- **El modo difícil es motor nuevo de verdad.** Todo el engine actual es de **selección**
  (word-buttons / opciones). Texto libre obliga a decidir **normalización**: acentos, mayúsculas,
  artículo (`il`/`la`/`lo`), apóstrofo, y **sinónimos o respuestas múltiples válidas** — que en
  italiano son constantes. **Es donde vive el riesgo del milestone.**
- **¿Cuál es la unidad de reset?** El core value es «un fallo te devuelve a repetir la categoría
  entera». Con vocabulario eso puede ser brutal o puede ser justo lo que quieres — hay que
  **decidirlo a propósito, no heredarlo por defecto**.
- **¿De dónde sale el léxico?** Lo natural es cosecharlo de los ejercicios existentes — y eso
  **depende de TRAD-X1**: las traducciones que produce son exactamente los pares ES↔IT que esto
  necesita. **TRAD-X1 primero, esto después.**
- **El modo fácil ya tiene motor.** Las opciones son la misma forma que los ejercicios actuales; el
  `decoyBank` de canciones es **precedente directo** para generar distractoras. Fácil podría salir
  casi gratis; **difícil no**.
