# Phase 1: Loop mínimo end-to-end (Avere + multiple-choice) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 1-Loop mínimo end-to-end (Avere + multiple-choice)
**Areas discussed:** Estructura de carpetas / módulos, Schema JSON de ejercicios, Test runner para el dominio, Edge case Avere con pocos ejercicios

---

## Estructura de carpetas y módulos

| Option | Description | Selected |
|--------|-------------|----------|
| Modular con `src/` y `screens/` | Separa dominio puro (src/domain/), UI (src/screens/), tipos de ejercicio (src/exercise-types/), contenido (content/), tests (tests/). Escala para 4 fases. | ✓ |
| Plano (todo en raíz) | Sin carpetas: index.html, app.js, dom.js, session.js, etc. en raíz. | |
| Solo `src/` sin subcarpetas | Punto medio: src/ con todo dentro. | |

**User's choice:** Modular con `src/` y `screens/`
**Notes:** Layout previsto incluye `src/domain/`, `src/data/`, `src/exercise-types/`, `src/screens/`, `content/`, `tests/`, `material-profesora/`. Separación estricta dominio-puro → datos → UI.

---

## Schema JSON de ejercicios

| Option | Description | Selected |
|--------|-------------|----------|
| Compacto y autocontenido | `id`, `type`, `categoryIds[]`, `payload` con `prompt`+`options`+`correctIndex`. | ✓ |
| Verbose con metadatos | Más campos opcionales: dificultad, tags, fuente del PDF. | |
| Frase como array | Prompt es array con texto y huecos; permite estilizar el hueco en UI. | |

**User's choice:** Compacto y autocontenido
**Notes:** Schema mínimo y legible. `notes` queda como campo opcional libre. Validador hand-written ~30-50 líneas, sin Zod ni Ajv en v1.

---

## Test runner para el dominio

| Option | Description | Selected |
|--------|-------------|----------|
| `node --test` integrado (Node 22) | Cero deps, built-in en Node 22, ergonomía OK. | ✓ |
| Página HTML de tests | tests.html con asserts en consola; no necesita Node. | |
| Vitest | El más ergonómico, pero requiere `npm install` y config. | |
| Sin runner: scripts JS con `node:assert` | Más primitivo que `--test`. | |

**User's choice:** `node --test` integrado
**Notes:** Refuerza el "cero install" — no `package.json` en Phase 1. Tests se ejecutan con `node --test tests/`.

---

## Edge case: Avere con pocos ejercicios

**Pregunta A:** Comportamiento del sampler cuando #disponibles < tamaño sesión

| Option | Description | Selected |
|--------|-------------|----------|
| Reduce tamaño a #disponibles | Sesión de 8 si hay 8 disponibles, sin repetir. Honesto. | ✓ |
| Repite hasta completar 20 | Muestra 8 + 12 repetidos ponderados. | |
| Reduce y luego rellena | Primera vuelta sin repetir, luego rellena. | |

**Pregunta B:** Cuántos ejercicios seed de Avere para Phase 1

| Option | Description | Selected |
|--------|-------------|----------|
| 10-12 ejercicios seed | Generados por el ejecutor desde el PDF de Avere. Permite ver el sampler en acción. | ✓ |
| 5 ejercicios mínimos | Solo lo justo para probar UI + persistencia. | |
| 20+ ejercicios para sesión completa | Transcribo todo el PDF; sesiones realistas día 1. | |
| Los meto yo a mano | Fixture mínimo de 3 ejercicios juguete. | |

**User's choice:** Reduce tamaño + 10-12 ejercicios seed
**Notes:** Los seed cubren las 6 personas del presente indicativo de "avere" + 4-6 ejercicios contextuales. El autor puede revisar/sustituir después. En Phase 1 todos los ejercicios usan SOLO `["avere"]` porque ninguna otra categoría existe todavía.

---

## Claude's Discretion

- Layout HTML exacto de la pantalla de sesión (componente Alpine, estructura de cards, etc.)
- Nombres internos de helpers (`render`/`grade`/`dispatch`)
- Orden exacto del bootstrap (cargar contenido → validar → arrancar Alpine si OK / banner si KO)
- Estilos visuales (Pico CSS classless por defecto)

## Deferred Ideas

- Refinar banner de error para "cargar lo válido y avisar de lo roto" — considerar en Phase 5
- Automatizar recálculo de `integrity` (SRI) hash al upgrade de Alpine/Pico — manual por ahora
- Mock del reloj más sofisticado para tests de racha de 21 días — entra en Phase 2
