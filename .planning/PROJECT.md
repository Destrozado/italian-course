# Italian Course — Ejercicios A1/A2

## What This Is

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Es una herramienta de auto-validación pura: repite, mezcla y obliga a re-verificar constantemente lo aprendido, garantizando que las reglas y excepciones de cada tema no se olvidan. Es para una sola persona (el autor), funciona local en su PC y desktop.

## Core Value

**Que el sistema te obligue a no olvidar.** El motor de repetición tiene que garantizar que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera. Sin ese loop, el resto no importa.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**Phase 1 — Loop mínimo end-to-end (2026-05-23):**
- ✓ Stack web estático con Alpine + Pico + ES modules + localStorage funciona en local con `npx serve`
- ✓ Schema validator hand-written rechaza JSON malformado y `categoryId` desconocido con banner visible
- ✓ Multiple-choice exercise type: render + grade + feedback verde/rojo + auto-avance 600ms
- ✓ Función pura `buildSession()` con sampler ponderado `1/(1+min(timesShown,10))` y reduce-a-disponibles
- ✓ Función pura `dates.todayLocal()` usa reloj local (no UTC)
- ✓ Contadores de ejercicio monotónicos en `localStorage` bajo `italianCourse.v1` con `schemaVersion`
- ✓ Persistencia única al final de sesión (no per-answer)
- ✓ NFC normalize on load
- ✓ Sesión abandonada se descarta (cerrar pestaña a medias → estado no se actualiza)
- ✓ 12 ejercicios seed de Avere (presente indicativo, 6 personas + variantes contextuales)
- ✓ 14 tests unitarios con `node --test` cubren dominio puro

**Phase 2 — Mecánica completa de re-verificación (2026-05-23):**
- ✓ Sistema soporta categorías arbitrarias (carga dinámica desde `categories.json`)
- ✓ Modelo de ejercicio multi-categoría (`categoryIds[]` con cascada al fallo)
- ✓ Estados de categoría: `no-hecha` → `hecha` (todos sus ejercicios completados sin fallar) → `dominada` (21 días seguidos de racha)
- ✓ Cascada de fallo INMEDIATA (refinement D-54 tras UAT): fallar un ejercicio que testea N categorías resetea las N al instante a `no-hecha` con racha 0 y `clearedExerciseIds` vacío, persistido a localStorage en ese momento — los aciertos siguen el patrón write-once-at-session-end
- ✓ Categoría `hecha`/`dominada` regresa automáticamente a `no-hecha` cuando se añade un ejercicio nuevo al JSON (DOMAIN-06 evaluado en boot vía `applyNewExerciseRegression`)
- ✓ Sesión Repaso 20 con picker: checkboxes por categoría, Seleccionar/Quitar todo, contador en label, GUARANTEE phase (mínimo 1 ejercicio por categoría elegida), FILL phase con sampler ponderado
- ✓ Modo Test completo: ejecuta TODOS los ejercicios de las categorías elegidas, aviso inline, persistencia in-flight per-answer (`inFlightTest` subkey), banner reanudar/descartar en home
- ✓ Pantalla resumen con delta neutral factústico por categoría (estado antes→después, racha antes→después, ejercicios pendientes para hecha) — botón único `Volver al home`
- ✓ Racha 21 días con `lastSuccessDate` guard (1 vez por día); display `N / 21 d` para visualizar objetivo (refinement D-55)
- ✓ Repaso abandonado descarta aciertos (excepción D-54: los fallos persisten siempre); Test completo abandonado se reanuda
- ✓ Smoke test integrado simulando ≥30 días reales — 58 tests verdes totales
- ✓ Home dashboard con tabla densa (5 columnas: Estado / Categoría / Racha / Ejercicios / Última vez), badges Unicode (`●`/`✓`/`★`) con colores Pico

### Active

<!-- Current scope. Building toward these. -->

- [ ] Tipo de ejercicio: traducción construyendo la frase con botones de palabras en orden (Phase 3)
- [ ] Tipo de ejercicio: emparejar columnas (match) (Phase 3)
- [ ] Atajos de teclado: 1-4 para multiple-choice, Enter para confirmar/avanzar, Space alias de Enter (Phase 3)
- [ ] Datos en `localStorage` con export/import a JSON (backup manual del progreso) (Phase 4)
- [ ] Recordatorio de backup tras 7 días sin export (Phase 4)
- [ ] Transcripción de los 6 PDFs reales a JSON (incluyendo ejercicios multi-categoría) (Phase 4)
- [ ] Stack: web estática (HTML/CSS/JS), abrible con `npx serve`, sin build step — VALIDADO end-to-end

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
| Web estática + localStorage, sin servidor | Máxima simplicidad, doble click y funciona, sin procesos arrancados | ✓ Validado Phase 1+2 (`npx serve` + Alpine/Pico CDN) |
| Una categoría = un PDF (granularidad gruesa) | Simplicidad inicial; refactorizar a sub-temas si se queda corto | ✓ Validado Phase 2 (Avere funcional; 6 PDFs en Phase 4) |
| Ejercicios pueden testear varias categorías a la vez | Permite consolidar conocimiento sin explosión de ejercicios separados | ✓ Validado Phase 2 (sampler GUARANTEE phase cubre multi-cat sin duplicar) |
| Si fallas un ejercicio, TODAS sus categorías se desmarcan | Más estricto, refuerza la re-verificación, fiel al espíritu del autor | ✓ Validado Phase 2 (cascada fail-wins absoluta) |
| Si fallas un ejercicio, el efecto es INMEDIATO (no esperar al fin de sesión) | Refinement Phase 2 UAT: previene exploit "fallo + cerrar pestaña → no consecuencia"; core value "te obliga a no olvidar" | ✓ Validado Phase 2 (D-54 `applyImmediateFailure`) |
| Priorización simple por "veces realizadas" (no ratio fallos/aciertos) | El autor pidió simplicidad explícita; SRS se puede añadir luego | ✓ Validado Phase 1+2 (weight cap=10 + GUARANTEE phase) |
| Racha de 21 días cuenta solo días practicados sin fallo | Más justo que "cada día calendario"; no penaliza saltos cortos | ✓ Validado Phase 2 (`lastSuccessDate` guard + display `N / 21 d`) |
| Contenido en JSON manual (no editor UI) en v1 | El autor edita JSON cómodamente; UI de edición es feature, no MVP | ✓ Validado Phase 1+2 (categorías + ejercicios hand-edited) |
| Solo feedback bien/mal, sin explicaciones | El autor pidió velocidad; teoría está en los PDFs | ✓ Validado Phase 1+2 (verde/rojo + auto-avance 600ms) |
| Test completo se reanuda; Repaso se descarta (excepto fallos) | Test completo es inversión grande; Repaso es desechable salvo el fallo individual (D-54) | ✓ Validado Phase 2 (`inFlightTest` subkey per-answer) |
| AppShell único factory plano con `currentScreen` switch | Más simple que router; deep-link no aporta en app local | ✓ Validado Phase 2 (D-24/D-25, 4 pantallas en `src/screens/app.js`) |
| Double-defense Alpine: getter null-safe + x-if guard | Anti-pattern recurrente; bindings se evalúan antes de `init()` | ✓ Validado Phase 2 (descubierto 2 veces en UAT 02-03 y 02-04; pendiente ADR) |

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
*Last updated: 2026-05-23 after Phase 2 completion (motor "te obliga a no olvidar" operativo end-to-end; verifier PASS, UAT 13/13)*
