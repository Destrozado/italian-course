# Phase 8: Modo Examen por categoría - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 8-modo-examen-por-categoría
**Areas discussed:** Flujo de click, Persistencia + conflict + reanudar, Ubicación del botón, Copy + UI + edge cases

---

## Flujo de click

| Option | Description | Selected |
|--------|-------------|----------|
| Directo a session (1 click) | Click 'Examen de Avere' → buildFullTest(['avere']) → currentScreen='session'. Salta 'Empezar' completamente. | ✓ |
| Reset checkboxes + queda en picker (2 clicks) | Click 'Examen de Avere' → marca solo 'avere', desmarca el resto → user pulsa 'Empezar'. Permite añadir más checkboxes después. | |
| Directo + override del modo a 'test-completo' | Como 'Directo a session' pero si el picker estaba en modo Repaso, fuerza modo Test Completo internamente. | |

**User's choice:** Directo a session (1 click)
**Notes:** Resuelve el dolor máximo "5-6 Repasos para validar dominio". Cualquier fricción extra contradice el espíritu del feature. Codificado como D-181. Note implícita D-189: `sessionMode='test-completo'` siempre (Examen ES Test Completo de 1 cat).

---

## Persistencia + conflict + reanudar (Q1 — Conflict)

| Option | Description | Selected |
|--------|-------------|----------|
| Todo conflicta entre sí (más simple) | 1 solo 'inFlightTest' a la vez, independientemente de si es Test Completo regular o Examen. Cualquier nuevo Test/Examen con uno activo → D-44 confirma descartar. | ✓ |
| Examen de la MISMA cat NO confirma; el resto sí | Examen-mismo-cat reanuda silenciosamente; otra cat distinta o Test Completo regular → D-44 confirma. | |
| Examen NUNCA conflicta (paralelo) | Examen vive en slot separado del Test Completo regular. Requiere migración schemaVersion. | |

**User's choice:** Todo conflicta entre sí (más simple)
**Notes:** Codificado como D-182. Cero estado nuevo, cero migración schemaVersion 4→5. El semántico "Examen ES Test Completo de 1 cat" justifica reutilizar el mismo slot inFlightTest.

## Persistencia + conflict + reanudar (Q2 — Banner reanudar)

| Option | Description | Selected |
|--------|-------------|----------|
| Copy genérica (no diferencia) | Sigue diciendo 'Tienes un Test completo a medias — X/N ejercicios' independientemente. | ✓ |
| Copy especializada cuando es Examen | Si inFlightTest es Examen → 'Tienes un Examen de Avere a medias — X/N ejercicios'. Requiere distinguir Examen vs Test Completo. | |

**User's choice:** Copy genérica (no diferencia)
**Notes:** Codificado como D-183. Minimiza cambios; feature core es el atajo 1-click home, no la diferenciación cosmética del banner.

---

## Ubicación del botón

| Option | Description | Selected |
|--------|-------------|----------|
| Solo en el picker (ambos modos) | Click Repaso/Test completo → picker con checkboxes + botón Examen por cat. Fiel al título ROADMAP. 2 clicks home→Examen. | |
| En home (tabla de categorías) | Botón Examen en cada fila de la tabla home. 1 click desde home. Picker no cambia. Reinterpreta el título ROADMAP. | ✓ |
| En ambos sitios | Botón Examen tanto en home como en picker. Más redundancia. | |
| Solo en picker de Test Completo | Botón Examen visible solo cuando pickerMode==='test-completo'. | |

**User's choice:** En home (tabla de categorías)
**Notes:** Codificado como D-184. Reinterpretación explícita del título ROADMAP — el autor escribió "picker" loosely; la tabla home (que ya lista todas las cats con su estado) es el lugar natural. Picker queda intacto.

---

## Copy + UI + edge cases (Q1 — Etiqueta)

| Option | Description | Selected |
|--------|-------------|----------|
| 'Examen' | Texto plano consistente con resto de UI española. | ✓ |
| 'Examinar' | Forma verbal infinitivo, más acción. | |
| 'Examen (N)' con número de ejercicios | E.g., 'Examen (23)' para Avere. Hace explícito el tamaño antes de pulsar. | |

**User's choice:** 'Examen'
**Notes:** Codificado como D-185. Texto plano consistente con "Repaso 20", "Test completo", "Backup".

## Copy + UI + edge cases (Q2 — Aviso previo)

| Option | Description | Selected |
|--------|-------------|----------|
| Lanzamiento directo (sin aviso) | Click → session. Coherente con D-181 'directo a session'. Si pulsa por error, puede salir con 'Volver al home'. | ✓ |
| Confirmación inline (requestConfirm 6ª call-site) | 'Examen de Avere — N ejercicios. Si fallas uno, Avere vuelve a no-hecha. ¿Empezar?'. 1 click extra. | |

**User's choice:** Lanzamiento directo (sin aviso)
**Notes:** Codificado como D-186. El autor sabe lo que clickea. Si pulsa por error, Test Completo persiste vía inFlightTest (D-41) — nada se pierde.

## Copy + UI + edge cases (Q3 — Edge cats)

| Option | Description | Selected |
|--------|-------------|----------|
| 0 ej: disabled + tooltip; dominada: visible | 0 ejercicios → botón disabled con tooltip. 'dominada' → visible normal (re-examinar para reconfirmar). | ✓ |
| 0 ej: ocultar fila; dominada: visible | Si cat sin ejercicios, oculta fila entera. 'dominada' → visible. | |
| 0 ej: ocultar botón; dominada: ocultar botón | Si la cat ya está dominada, ocultar Examen. Más minimalista pero le quita flexibilidad. | |

**User's choice:** 0 ej: disabled + tooltip; dominada: visible
**Notes:** Codificado como D-187. Disabled mantiene consistencia visual de la fila. Re-examinar `dominada` sigue teniendo sentido (validación pre-A1).

## Copy + UI + edge cases (Q4 — Atajos)

| Option | Description | Selected |
|--------|-------------|----------|
| Sin atajos en v1 | Solo click ratón. Coherente con que la tabla home no expone atajos. | ✓ |
| Atajo genérico (e.g., E + número de fila) | E + 1 = examen primera cat, E + 2 = segunda, etc. Requiere mostrar números. | |

**User's choice:** Sin atajos en v1
**Notes:** Codificado como D-188. Si emerge dolor se añade en fase incremental futura.

---

## Claude's Discretion

- **Layout exacto del botón** en la fila — columna nueva (6ª) vs botón inline al final de la fila. Se decide en plan-phase / ui-phase con preview visual.
- **Estilo del botón** — `class="secondary"` vs primary. Probablemente secondary para no competir con Repaso 20 / Test Completo de home.
- **Tooltip exacto del disabled** — copy se afina en plan-phase.
- **Nombre del handler** — sugerido `startExamen(categoryId)` en `src/screens/app.js`. Plan-phase confirmará.
- **Tests count esperado** — plan-phase definirá los smoke tests específicos.

## Deferred Ideas

- Examen multi-cat (selección de 2-3 cats para examinar en bloque) — out of scope; si emerge demanda, fase incremental con UI distinta.
- Copy especializada en banner reanudar ("Examen de Avere a medias") — out of scope cosmético.
- Diferenciación visual en pantalla session (header "Examen: Avere") — out of scope.
- Aviso/confirmación previa antes de Examen — out of scope (D-186).
- Atajos de teclado (E + número fila) — out of scope v1 (D-188).
- Botón Examen también en el picker — out of scope; D-184 lo descartó.
- Slot inFlightTest separado para Examen — over-engineering, requiere migración schemaVersion.
- Tracking estadístico de Examenes realizados — out of scope.
- Ranking/leaderboard — out of scope (usuario único).
