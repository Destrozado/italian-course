# Walking Skeleton — Italian Course (Ejercicios A1/A2)

**Phase:** 1 — Loop mínimo end-to-end (Avere + multiple-choice)
**Generated:** 2026-05-23

## Capability Proven End-to-End

El autor ejecuta `npx serve` en la carpeta del proyecto, abre `http://localhost:3000`, completa una sesión real de multiple-choice sobre Avere (10-12 ejercicios) con feedback verde/rojo y, al recargar la página, los contadores `timesShown`/`timesCorrect`/`timesFailed` por ejercicio persisten exactamente como quedaron al terminar la sesión.

Esta es la línea mínima que toca **todas** las capas que el resto del proyecto va a usar: bootstrap (CDN + SRI + módulos ES), carga de contenido (`fetch` + validación + NFC), dominio puro (`buildSession` + `applySessionResult` + `todayLocal`), UI reactiva (Alpine), y persistencia (`localStorage` con `schemaVersion`). Si esto funciona, el resto de las fases son extensiones — no cambia ninguna decisión arquitectónica.

## Architectural Decisions

| Decisión | Elección | Justificación |
|----------|----------|--------------|
| Framework UI | Alpine.js 3.15.12 vía CDN (jsDelivr) con SRI | D-22 / FOUND-02. Una sola etiqueta `<script defer>`, cero build step. Reactividad justo al nivel necesario para quiz click-driven. |
| CSS | Pico CSS 2.1.1 (classless) vía CDN con SRI | D-22. Una `<link>`, classless por defecto, dark mode automático vía `prefers-color-scheme`. Discrecionalidad del planner por CONTEXT.md. |
| Servidor local | `npx serve` (sin install, sin `package.json`) | D-21 / D-23. Doble click no es viable (Firefox bloquea `localStorage` bajo `file://`, ES modules no cargan, fetch local bloqueado). Un comando + bookmark. |
| Persistencia | `localStorage` clave única `italianCourse.v1` con `schemaVersion: 1` | D-19 / BACK-01 / BACK-03. Single-user, ~5 MiB disponibles, sobra. Migración futura vía `schemaVersion`. |
| Frecuencia de escritura | Única al final de la sesión (no por respuesta) | D-20 / BACK-02. Sesión abandonada = se descarta. Coherente con SESSION-08 (Phase 2). |
| Módulos | ES modules nativos (`<script type="module">`), sin bundler | D-03 / D-23. Requiere HTTP serving (alineado con `npx serve`). |
| Layout de carpetas | `src/{domain,data,exercise-types,screens}/`, `content/`, `tests/` | D-01. Separación estricta: dominio puro no importa de `data/` ni `screens/`. Habilita unit tests con `node --test`. |
| Test runner | `node --test` (Node 22 LTS built-in) con `node:assert/strict` | D-11 / D-12. Zero-dep, sin `package.json`. Mock de Date nativo (`t.mock.timers.enable({apis:['Date']})`). |
| Content authoring | Un archivo JSON por categoría en `content/exercises/<slug>.json` + `content/categories.json` como registro maestro | D-04 / D-05 / CONT-01 / CONT-02. Diff git claros, edición segura, escala bien. |
| Validación de contenido | Validador hand-written (~40 líneas) acumulador de errores + banner UI visible | D-08 / D-10 / CONT-04 / CONT-05. Sin Ajv / Zod / Valibot. Todos los errores se muestran a la vez (no falla en el primero). |
| Normalización Unicode | NFC en la frontera (`content-loader.js`) inmediatamente tras `JSON.parse`, antes de validar | D-09 / CONT-06. Los PDFs pueden inyectar NFD; el resto del código asume NFC. |
| Tipo de ejercicio Phase 1 | Solo `multiple-choice` | EXTYPE-01. `word-buttons` y `match` entran en Phase 3 vía el registry `src/exercise-types/index.js`. |
| Patrón de extensión exercise-types | Registry pattern: cada tipo exporta `{ grade(exercise, response) → boolean }` | Establecido en Phase 1, ampliado en Phase 3 sin tocar el resto del código. |
| Auto-avance feedback | 600ms en verde (auto-advance), rojo requiere clic en "Siguiente" | SESSION-05. Constante única en `sessionScreen`. Cancelable vía `clearTimeout` antes de cada `advance()`. |

## Stack Touched in Phase 1

- [x] Project scaffold (no framework de build; HTML estático + ES modules + Node 22 test runner)
- [x] Routing — solo una "ruta" en Phase 1: la pantalla de sesión. Router de hash entra en Phase 2.
- [x] Persistencia — `loadState()` y `saveState()` ejercidos end-to-end (read en boot, write al terminar sesión)
- [x] UI — botones de respuesta cableados a `grade()`, feedback verde/rojo, indicador "Ejercicio X / N"
- [x] Despliegue / arranque — README documenta `npx serve` + bookmark `http://localhost:3000`; `node --test tests/` para tests del dominio

## Out of Scope (Deferred to Later Slices)

Todo lo siguiente NO está en Phase 1 y queda explícitamente fuera del skeleton — para evitar re-litigarlo en cada fase posterior:

- **Home dashboard / picker de categorías / select-all / clear-all** → Phase 2 (SESSION-01, SESSION-02, SESSION-03)
- **Estados de categoría `no-hecha` / `hecha` / `dominada`** → Phase 2 (DOMAIN-05, DOMAIN-06, DOMAIN-08)
- **Cascada de fallo multi-categoría** → Phase 2 (DOMAIN-04). Phase 1 ejecuta solo el subset "counters monotónicos" de `applySessionResult`.
- **Racha de 21 días** → Phase 2 (DOMAIN-07, DOMAIN-08)
- **Pantalla de resumen al final de la sesión** → Phase 2 (SESSION-07)
- **Modo "Test completo" / `buildFullTest()`** → Phase 2 (DOMAIN-03, SESSION-03)
- **Reanudar Test completo abandonado** → Phase 2 (SESSION-09)
- **Tipos `word-buttons` y `match`** → Phase 3 (EXTYPE-02, EXTYPE-03)
- **Atajos de teclado 1-4 / Enter / Space** → Phase 3 (SESSION-06)
- **Backup export/import + banner de >7 días sin backup** → Phase 4 (BACK-04, BACK-05, BACK-06)
- **Contenido de las otras 5 categorías (Género y Número, Verbos de Movimiento, etc.)** → Phase 4 (SEED-01, SEED-02). Phase 1 solo carga Avere.
- **Ejercicios multi-categoría reales** → Phase 4 (D-17). Phase 1 fuerza `categoryIds: ["avere"]` único en todos los seeds (D-17 lo explicita).
- **Mock de Date sofisticado para tests de racha** → Phase 2
- **Refinamiento del banner "cargar lo válido y avisar de lo roto"** → Phase 5 (todo o nada en Phase 1 por D-10)
- **Multi-tab guard, dark mode toggle, calendar heatmap** → Phase 5 / v2

## Subsequent Slice Plan

Cada fase añade una capa vertical sobre este skeleton **sin alterar las decisiones arquitectónicas de arriba**:

- **Phase 2 — Mecánica completa:** añade `categoryProgress` al estado (con `clearedExerciseIds`, `streakDays`, `lastSuccessDate`), extiende `applySessionResult` con cascada de fallo + promoción `no-hecha → hecha → dominada`, añade `home.js` + `picker.js` + `summary.js` como nuevas screens, añade `buildFullTest()` en `domain/session.js`. La forma de localStorage gana campos; `schemaVersion` sube a 2 y `migrate()` añade una rama.
- **Phase 3 — Variedad + teclado:** añade `exercise-types/word-buttons.js` y `exercise-types/match.js` al registry sin tocar `multiple-choice.js`. Añade handler de teclado en `screens/session.js` (1-4 / Enter / Space).
- **Phase 4 — Backup + contenido completo:** añade `screens/backup.js` con export/import; añade los 5 archivos `content/exercises/*.json` restantes + entradas en `categories.json`; algunos ejercicios pasan a tener `categoryIds` con ≥2 categorías (el validador ya las permite desde Phase 1).
- **Phase 5 (deferred):** polish — multi-tab, dark mode toggle, banner quota, refinement del validator banner.

Ninguna fase posterior introduce build step, dependencias npm runtime, ni servidor backend. El skeleton es la silueta definitiva del proyecto.
