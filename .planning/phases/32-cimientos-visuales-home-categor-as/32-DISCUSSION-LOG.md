# Phase 32: Cimientos visuales + Home/Categorías - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-30
**Phase:** 32-Cimientos visuales + Home/Categorías
**Areas discussed:** Mapeo estado→punto, Subtítulo tema, Modo oscuro, CTA + botones

---

## Mapeo de estado de categoría → punto de color

| Option | Description | Selected |
|--------|-------------|----------|
| dominada→verde · hecha→ámbar · no-hecha→neutro | Encaje natural; bar de racha verde/ámbar según estado | ✓ |
| Otro mapeo / matizar | Tratar 'hecha' o 'no-hecha con fallos' de otra forma | |

**User's choice:** dominada→verde · hecha→ámbar · no-hecha→neutro
**Notes:** Encaje 1:1 con los 3 puntos del mock; `vecesFallada` sigue como indicador secundario en Racha, no cambia el color del punto.

---

## Subtítulo "tema" de categoría

| Option | Description | Selected |
|--------|-------------|----------|
| Partir el paréntesis: 'Avere' + cursiva 'presente indicativo' | Derivado en presentación, sin tocar datos | ✓ |
| Nombre completo, sin subtítulo | Mostrar el name tal cual | |
| Añadir campo 'topic' a categories.json | Dato explícito (toca contenido) | |

**User's choice:** Partir el paréntesis del `name` (derivado, sin tocar `categories.json`).
**Notes:** Categorías sin paréntesis → solo nombre.

---

## Paleta / modo oscuro

| Option | Description | Selected |
|--------|-------------|----------|
| Forzar papel siempre, desactivar dark auto | Fijar tema claro Editoriale, ignorar prefers-color-scheme | ✓ |
| Mantener variante oscura | Conservar dark auto de Pico + derivar paleta oscura | |

**User's choice:** Forzar la paleta papel siempre; desactivar el dark mode automático de Pico.
**Notes:** El handoff define una sola paleta; no se inventa variante oscura.

---

## CTA Repaso + reorganización de botones

| Option | Description | Selected |
|--------|-------------|----------|
| Seguir el diseño: CTA Repaso + ghost (Test·Canciones·Backup) | Canciones baja a fila ghost; CTA conserva comportamiento (picker) | ✓ |
| CTA Repaso + ghost pero Canciones protagonista | Respeta jerarquía actual (D-01) | |
| Matizar comportamiento del CTA | Lanzar directo sin picker / cambiar subtítulo | |

**User's choice:** Seguir el diseño — CTA Repaso grande + fila ghost de 3 con Canciones incluida.
**Notes:** El CTA conserva `openPicker('repaso')` (solo cambia aspecto). El subtítulo del mock es decorativo; el planner ajusta el texto si choca con el paso del picker, sin cambiar lógica.

## Claude's Discretion

- Estructura de la capa CSS (app.css nuevo vs ampliar styles.css), nombres de custom properties, técnica de tabla editorial en desktop, y cómo exponer la racha cruda.

## Deferred Ideas

- Arte de portada real y modo oscuro Editoriale (Future Requirements).
- Ejercicio/canciones/resultados/picker → Phases 33-34.
- Campo `topic` explícito por categoría → futura tarea de contenido.
