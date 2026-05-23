# Italian Course — Ejercicios A1/A2

## What This Is

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Es una herramienta de auto-validación pura: repite, mezcla y obliga a re-verificar constantemente lo aprendido, garantizando que las reglas y excepciones de cada tema no se olvidan. Es para una sola persona (el autor), funciona local en su PC y desktop.

## Core Value

**Que el sistema te obligue a no olvidar.** El motor de repetición tiene que garantizar que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera. Sin ese loop, el resto no importa.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Sistema soporta categorías arbitrarias; cada PDF de la profesora = una categoría (Avere, Género y Número, Verbos de Movimiento, Profesiones, Sustantivos Irregulares, Preposiciones)
- [ ] Modelo de ejercicio: cada ejercicio puede testear N categorías a la vez (multi-categoría)
- [ ] Tipo de ejercicio: completar frase con multiple choice (frase con hueco, 3-4 opciones)
- [ ] Tipo de ejercicio: traducción construyendo la frase con botones de palabras en orden
- [ ] Tipo de ejercicio: emparejar columnas (match)
- [ ] Cada ejercicio guarda contador de veces realizadas, veces acertadas y veces falladas
- [ ] Estados de categoría: `no hecha` → `hecha` (todos sus ejercicios completados sin fallar) → `dominada` (21 días seguidos de racha)
- [ ] Regla de fallo: si fallas un ejercicio que testea N categorías, las N pasan a `no hecha` y hay que repetir todas
- [ ] Sesión de repaso de 20 ejercicios: UI con checkboxes para elegir categorías, mínimo 1 ejercicio por categoría elegida, mezcla aleatoria, priorización por "veces realizadas" (menos hechas = más probabilidad)
- [ ] Modo "Test completo": ejecuta TODOS los ejercicios de las categorías elegidas (sin tope de 20)
- [ ] Feedback al responder: solo verde/rojo, sin explicación
- [ ] Racha de 21 días: cuenta solo los días en los que practicaste esa categoría y no fallaste. Al llegar a 21 → marca visual de "dominada" pero sigue apareciendo igual en sesiones
- [ ] Contenido (los ejercicios) se edita manualmente en JSON desde el día 1
- [ ] Datos en `localStorage` con export/import a JSON (backup manual del progreso)
- [ ] Stack: web estática (HTML/CSS/JS), abrible con doble click, sin servidor

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Multi-usuario / autenticación — es una app personal, una sola persona; añadirlo sería complicar sin valor
- Cloud sync / hosting en internet — el autor trabaja en local; si lo necesita en el móvil ya se verá
- Acceso desde móvil (responsive móvil-first) — desktop primero; responsive se evaluará cuando se eche en falta
- Generación de ejercicios con IA (a partir de los PDFs) — el contenido se mete a mano; la IA queda como exploración futura, no scope inicial
- Respuesta libre escribiendo texto — requiere normalización compleja (tildes, sinónimos, mayúsculas); no aporta vs los 3 tipos elegidos
- Explicaciones pedagógicas / mostrar la regla al fallar o acertar — solo bien/mal por velocidad; la teoría está en los PDFs
- UI de edición de ejercicios dentro de la web — JSON a mano es suficiente para v1; se reevaluará si el flujo manual escala mal
- SRS sofisticado (Anki-style, ratio fallos/aciertos ponderado) — priorización simple por "veces hechas" es suficiente al principio
- Frecuencia reducida o eliminación de categorías "dominadas" en sesiones — el autor quiere que sigan apareciendo igual para no perder forma

## Context

- **Material base disponible:** 7 archivos en `material-profesora/` (6 PDFs + 1 ODT grande). Son los temas trabajados en clase y definen las categorías iniciales.
- **Nivel objetivo:** A1 a corto plazo, A2 a medio plazo. Las categorías irán creciendo a medida que la profesora vaya entregando material.
- **Filosofía del autor:** "Nada muy sofisticado, es pura repetición y una gestión de los repasos automatizada." Prioriza simplicidad y la mecánica de re-verificación constante sobre features pedagógicas elegantes.
- **Patrón de uso esperado:** Sesiones diarias cortas de ~20 ejercicios + sesiones largas de "test completo" cuando quiera validar un bloque. La racha de 21 días incentiva la práctica diaria.

## Constraints

- **Tech stack**: web estática (HTML + CSS + JS, sin servidor) — el autor quiere doble click y que funcione, sin instalar nada ni arrancar procesos.
- **Persistencia**: `localStorage` del navegador + export/import a JSON para backup manual — sin base de datos ni backend.
- **Hosting**: local en la máquina del autor. Sin internet, sin cuentas, sin sincronización entre dispositivos.
- **Dispositivo**: desktop only en v1; responsive móvil se evaluará después si lo echa en falta.
- **Contenido**: los ejercicios viven en archivos JSON editados a mano por el autor; no hay UI de edición todavía.
- **Idioma de la interfaz**: español (autor hispanohablante aprendiendo italiano).

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web estática + localStorage, sin servidor | Máxima simplicidad, doble click y funciona, sin procesos arrancados | — Pending |
| Una categoría = un PDF (granularidad gruesa) | Simplicidad inicial; refactorizar a sub-temas si se queda corto | — Pending |
| Ejercicios pueden testear varias categorías a la vez | Permite consolidar conocimiento sin explosión de ejercicios separados | — Pending |
| Si fallas un ejercicio, TODAS sus categorías se desmarcan | Más estricto, refuerza la re-verificación, fiel al espíritu del autor | — Pending |
| Priorización simple por "veces realizadas" (no ratio fallos/aciertos) | El autor pidió simplicidad explícita; SRS se puede añadir luego | — Pending |
| Racha de 21 días cuenta solo días practicados sin fallo | Más justo que "cada día calendario"; no penaliza saltos cortos | — Pending |
| Contenido en JSON manual (no editor UI) en v1 | El autor edita JSON cómodamente; UI de edición es feature, no MVP | — Pending |
| Solo feedback bien/mal, sin explicaciones | El autor pidió velocidad; teoría está en los PDFs | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-23 after initialization*
