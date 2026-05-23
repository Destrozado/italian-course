# Phase 3: Variedad de ejercicios + ergonomía de teclado - Research

**Researched:** 2026-05-23
**Domain:** Alpine.js sub-templates + grading logic puro + keyboard event handling sobre app local estática
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Word-buttons — UX**
- **D-56:** Modelo de selección "Mover al área de respuesta". Banco arriba (botones) + área respuesta abajo. Click en banco MUEVE la palabra al área (desaparece del banco). Click en área devuelve al banco. Frase leíble izquierda→derecha.
- **D-57:** Distractoras opcionales en JSON (`payload.distractors[]`). Banco al iniciar = `shuffle(answer ∪ (distractors ?? []))`. Grading exige secuencia exacta = `payload.answer` (lowercase + NFC).
- **D-58:** Validación con botón **"Comprobar"** (siempre visible bajo área respuesta) DESHABILITADO mientras área vacía. Enter dispara mismo handler. NO auto-validación al alcanzar N.
- **D-59:** Feedback al fallar = frase correcta literal debajo del intento (intento tintado rojo). Botón "Siguiente" debajo de la frase correcta (como multiple-choice SESSION-05).

**Match — UX**
- **D-60:** **Validación instantánea por pareja**. Pareja correcta → verde fijo + items apagados (no clickeables, no deshacer). Pareja incorrecta → parpadeo rojo breve + deshace la pareja, items vuelven a seleccionable. **Cualquier intento erróneo en el ejercicio → ejercicio FALLADO** (flag `matchHadFailure`).
- **D-61:** **Cascada D-54 INMEDIATA en el PRIMER intento erróneo** del ejercicio (NO al final del ejercicio, NO al final de la sesión). Primer click incorrecto → `applyImmediateFailure(state, exercise, content, today)` + persist. Intentos erróneos posteriores en mismo ejercicio son idempotentes. El ejercicio CONTINÚA hasta completar todas las parejas; al final `applySessionResult` recibe el ejercicio marcado `correct: false`. Exploit-proof.
- **D-62:** Shuffle ambas columnas en cada render con Fisher-Yates seedable (mismo RNG que sampler). Se baraja UNA VEZ al cargar el ejercicio en `sessionCurrentExercise` y se cachea en `matchLeft`/`matchRight`.
- **D-63:** Tamaño variable N parejas, 2 ≤ N ≤ 10. Layout responsive dos columnas verticales lado a lado. **Forced last pair** queda como Claude's discretion (resuelto en UI-SPEC: **NO auto-completar**).

**Schema JSON + grading**
- **D-64:** Payload `word-buttons` = `{prompt: string, answer: string[], distractors?: string[]}`. Tokens no vacíos. Distractors opcional (default `[]`).
- **D-65:** Payload `match` = `{prompt: string, pairs: Array<[string, string]>}`. Cada tuple exactamente 2 strings no vacíos. 2 ≤ N ≤ 10. Columna izquierda render = `shuffle(pairs.map(p => p[0]))`, derecha = `shuffle(pairs.map(p => p[1]))`.
- **D-66:** **Duplicados en columna derecha permitidos**. Grading textual: pareja {izq, der} CORRECTA si existe pair en payload con `pair[0].toLowerCase() === izq.toLowerCase()` Y `pair[1].toLowerCase() === der.toLowerCase()` Y esa pair (por índice) NO ha sido consumida ya. Tracking interno: array de índices de pairs consumidos.
- **D-67:** **Grading case-insensitive** (solo word-buttons y match; multiple-choice sigue por índice). `wordButtons.grade`: array lowercase deep-equal. `match.grade`: lowercase + consume pair matching del payload. Strings ya NFC-normalizadas (CONT-06 al cargar).

**Ergonomía teclado (SESSION-06 + extensión a los 3 tipos)**
- **D-68:** Multiple-choice teclas: `1-4` → `sessionSelectOption(idx-1)`. Teclas > N opciones ignoradas silenciosamente. NO 5-9 (schema limita a 4 opciones).
- **D-69:** Word-buttons teclas: `1-9` dinámicos sobre palabras VISIBLES del banco. Posición 1 visible siempre `1`, etc. Cada botón lleva sufijo numérico (`ho ¹`, `hai ²`). Re-numera al menguar/crecer. `Backspace` → quita última palabra colocada. `Enter` → `wordButtonsCheck()`. Banco >9 visibles: 10+ no son alcanzables por número.
- **D-70:** Match teclas: izquierda números **1-9**, derecha letras **a-i**. Cada item con sufijo visible (`casa ¹`, `la ᵃ`). Flujo: número → selecciona item izq (`matchSelectedLeftIdx`). Letra sin número previo → ignorado. Letra con número activo → forma pareja {izq, der[letra]}, evalúa, aplica D-60. Otro número antes de letra → reemplaza selección. Cap natural 9×9 = 81, esperado 5-8.
- **D-71:** Enter/Space tras fallo → `sessionAdvance()` en los TRES tipos. Tras acierto, Enter/Space **no hacen nada** (auto-avance 600ms gestiona SESSION-05 intacto). Handler hace `e.preventDefault()` para `Space` (evita scroll).
- **D-72:** Foco al body al montar/avanzar sesión: ningún botón recibe focus visualmente. Listener registrado a nivel del componente sesión (**`@keydown.window` Alpine recomendado** porque se monta/desmonta automáticamente con el sub-template `<template x-if="currentScreen === 'session'">`). Cleanup obligatorio al cambiar `currentScreen` o desmontar.

### Claude's Discretion

- Estilos visuales concretos (borde área respuesta vacía, padding banco, color exacto item izq seleccionado en match, animación parpadeo rojo, tipografía sufijo numérico/alfabético). Pico color vars + sin emojis decorativos, coherente con tono sobrio Phase 2. **NOTA:** Mayoría resuelta en UI-SPEC (superíndice Unicode `¹²³ᵃᵇᶜ` con `.kbd-hint`, outline 2px Pico primary para item izq seleccionado, `@keyframes match-flash-red 300ms`, placeholder vía `::before` italic muted).
- Comportamiento "forced last pair" en match. **Resuelto en UI-SPEC: NO auto-completar** (coherencia mecánica).
- Estructura interna de `src/exercise-types/word-buttons.js` y `match.js`: objeto con `grade(exercise, response)` exportado, registrado en `index.js`. Layer purity D-02 invariante.
- Nomenclatura de propiedades del `appShell` para sub-estados (ej. `wordButtonsAnswer`, `matchSelectedLeftIdx`). D-25 fija factory plano; nombres del planner.
- Helper privado `applyResultToSession(exercise, correct)` (recomendado) o duplicación inline en los 3 handlers — planner elige. **CRÍTICO:** garantizar que `applyImmediateFailure` se llama exactamente UNA vez por ejercicio fallado.
- Estrategia `@keydown.window` vs addEventListener manual: recomendación `@keydown.window` por simplicidad cleanup; alternativa válida con control explícito.
- Tests del registry: archivo nuevo `tests/exercise-types.test.js` o extensión de `tests/domain.test.js`. Cobertura mínima: distractoras en word-buttons, duplicados en match, case-insensitivity, ordering, schema validator rechaza payloads malformados.

### Deferred Ideas (OUT OF SCOPE)

- **Auto-completar el "forced last pair" en match** — Si en UAT se siente lento, reconsiderar en Phase 5 polish.
- **Letras a-z para palabras del banco word-buttons** (alternativa a 1-9) — Reconsiderar si emerge un ejercicio A2 con frase muy larga (>9 tokens).
- **Tab + Enter como fallback de teclado** — Descartado en favor de números/letras directas.
- **Flag opcional `caseSensitive: true` por ejercicio** — Descartado (D-67 case-insensitive global).
- **Cancelar auto-avance 600ms con Enter tras acierto** — Descartado en D-71 (rompe SESSION-05).
- **Indicador visual del item izq seleccionado en match** (animación, ring, color) — Claude's discretion; ajuste post-Phase 3 si UAT lo pide.
- **Permitir distractoras en match** (items extra que NO emparejan con nada) — No contemplado en D-65.
- **Warning del schema validator** cuando un word-buttons tiene >9 palabras visibles — Claude's discretion del planner. Recomendado warning suave (no bloquea carga).
- **Sub-categorías más finas que "1 PDF = 1 categoría"** — Out of scope v1.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **EXTYPE-02** | Tipo `word-buttons`: muestra frase ES; presenta botones italianos (+ distractoras); usuario las pulsa en orden para construir la traducción; valida con botón "terminado". | Patrón canónico §"Pattern 1: Sub-template Alpine por tipo" + §"Pattern 4: Sub-estados en factory plano". Grade function pura §"Pattern 5: grade() puro tipo word-buttons". Schema validator extendido §"Pattern 6: Validator delegado por tipo". |
| **EXTYPE-03** | Tipo `match`: dos columnas; click izq→click der; valida al emparejar todas. | Same as EXTYPE-02 + §"Pattern 7: Match con duplicados textuales (algoritmo de consumo por índice)". Cascada inmediata D-61 §"Pattern 8: applyImmediateFailure idempotente para match". |
| **SESSION-06** | Atajos 1-4 multiple-choice + Enter + Space (extendido a los 3 tipos por D-68..D-72). | §"Pattern 9: Handler global de teclado con @keydown.window". Renumeración dinámica §"Pattern 10: bankWithKeys re-derivado en cada render". Cleanup §"Pattern 11: Cleanup setTimeout match-flash + listener teclado". |

</phase_requirements>

## Summary

Phase 3 NO es una fase greenfield ni de nuevas pantallas: **extiende el motor existente de Phase 2** (registry de exercise-types, schema validator, `appShell` plano con sub-estados, cascada inmediata `applyImmediateFailure`) con 2 nuevos tipos de ejercicio + ergonomía de teclado completa. El stack queda intacto (Alpine 3.15.12 + Pico CSS 2.1.1 + ES modules + localStorage; sin nuevas dependencias). El riesgo arquitectónico real está en (a) preservar el patrón "double-defense Alpine" en los nuevos sub-templates (lección recurrente Phase 1+2), (b) garantizar que `applyImmediateFailure` se llama exactamente UNA VEZ por ejercicio fallado (D-61 + D-54 → idempotencia crítica), y (c) ejecutar bien el cleanup del setTimeout de match-flash y del listener `@keydown.window` cuando el usuario abandona la sesión.

Los hallazgos clave: Alpine `@keydown.window` adjunta el listener al `window` global pero lo limpia automáticamente cuando el elemento que tiene la directiva se desmonta (incluyendo desmonte por `x-if` toggling) — esto resuelve D-72 de forma idiomática sin código de cleanup manual. Alpine soporta key modifiers de letras/dígitos directos (`@keydown.1`, `@keydown.a`) pero para 18 teclas distintas (1-9 + a-i + Enter + Space + Backspace) es más simple un solo `@keydown.window="handleSessionKey($event)"` con un switch interno sobre `event.key`. La renumeración dinámica del banco word-buttons se resuelve con un getter computado (`bankWithKeys`) que re-deriva en cada render — la reactividad de Alpine garantiza re-render correcto cuando el array mengua/crece, siempre que se use `:key` sobre el WORD (no sobre el índice). El algoritmo de grading de match con duplicados es trivial: un `consumedPairIdx: Set<number>` + búsqueda lineal del primer pair no-consumido que coincide textualmente.

**Primary recommendation:** Plan 03-01 = schema validator extendido (refactor a switch por tipo) + `grade()` puros + tests. Plan 03-02 = sub-templates Alpine + sub-estados en `appShell` + helper `applyResultToSession()` + handler de teclado global. Tres entregas en un solo plan grande también es viable dado que el alcance es acotado (~600 LOC totales).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `wordButtons.grade()` / `match.grade()` (lógica de calificación pura) | Domain (`src/exercise-types/*`) | — | Layer purity D-02: las funciones de grading NO tocan DOM, storage ni fetch. Testables con `node --test`. Mismo tier que `multiple-choice.js`. |
| Validación de payloads `word-buttons` / `match` en schema validator | Domain (`src/data/schema-validator.js`) | — | Mismo patrón D-08: validator puro, hand-written, acumula errores, devuelve `{ok, errors}`. Refactor del branch literal de tipo a un switch/lookup. |
| Sub-templates de UI por tipo (banco, área respuesta, columnas match, parpadeo rojo) | Browser / Client (`index.html` Alpine directives) | — | Alpine declarative: `<template x-if="sessionCurrentExercise.type === 'word-buttons'">`. Coloca los bindings exactamente donde se renderizan. |
| Sub-estados `wordButtons*` / `match*` en `appShell` | Browser / Client (`src/screens/app.js`) | — | D-25 fija factory plano. Los sub-estados son propiedades reactivas de Alpine, viven en el mismo objeto. |
| `applyImmediateFailure(state, ex, content, today)` invocado en mid-sesión | Domain (función pura, ya existe) | Browser / Client (caller en `app.js`) | Reuso directo del helper de Phase 2 D-54. Caller orquesta el momento exacto del fail. |
| Handler global de teclado `@keydown.window` | Browser / Client | — | Listener atado al window por simplicidad; cleanup automático al desmontar el sub-template `currentScreen === 'session'`. |
| Persistencia inmediata a localStorage tras `applyImmediateFailure` | Browser / Client (caller invoca `saveState`) | Database / Storage (`src/data/storage.js`) | Mismo flujo Phase 2 D-54 — sin cambios estructurales. |
| Cascada al final de sesión con `applySessionResult` (idempotente sobre state ya reseteado) | Domain (función pura, ya existe) | — | Reuso sin modificación de la firma. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Alpine.js | 3.15.12 | Reactive UI directives (`x-data`, `x-for`, `x-if`, `@keydown.window`) | [CITED: alpinejs.dev/directives/on] Ya pinned vía CDN con SRI en `index.html` líneas 27-30. Soporta `@keydown.window` con modifier (atacha listener al `window` con cleanup automático en unmount del template). Soporta key modifiers `.enter`, `.space`, `.backspace`, dígitos `.1`-`.9`, letras `.a`-`.z` (verificado en [CITED: akbargherbal.github.io/alpinejs-basics .12.092]). |
| Pico CSS | 2.1.1 (classless) | Visual base (auto dark mode, `<button>` styling, color vars) | Ya pinned vía CDN con SRI en `index.html` líneas 10-13. Las clases nuevas del UI-SPEC (`.wb-bank`, `.wb-answer`, `.match-grid`, `.match-selected`, `.match-consumed`, `.match-flash`, `.kbd-hint`) son overrides locales en `styles.css` y NO requieren ningún paquete adicional. |
| Vanilla ES modules | n/a (browser-native) | Code organization (`import`/`export` entre `src/exercise-types/*`, `src/data/`, `src/screens/app.js`) | Patrón establecido Phase 1 D-03. Sin bundler. |
| `node --test` (Node 22) | n/a (built-in) | Test runner para `grade()` puros + schema validator | Patrón establecido Phase 1 D-11. Sin dependencias externas. Se ejecuta `node --test tests/*.test.js`. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `localStorage` (Web Storage API) | n/a (browser-native) | Persistir state tras `applyImmediateFailure` mid-match (D-61) | Sin cambios — reusa `saveState()` de `src/data/storage.js`. `schemaVersion` permanece en 2 (sin migración). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@keydown.window` Alpine modifier (declarativo) | `addEventListener('keydown', ...)` manual en `init()` + `removeEventListener` en `destroy()` | Funciona, pero requiere cleanup manual robusto y `this` binding cuidadoso. `@keydown.window` se desmonta automáticamente cuando el `<template x-if="currentScreen === 'session'">` cambia — eliminando una clase entera de bugs por listener huérfano. [CITED: alpinejs.dev/essentials/events — "Alpine cleanup function within directives automatically removes event listeners when the element is removed itself"]. |
| Modifiers de Alpine para cada tecla (`@keydown.window.1`, `@keydown.window.2`, ...) | UN solo `@keydown.window="handleSessionKey($event)"` con switch interno sobre `event.key` | Modifiers son convenientes para 1-3 teclas, pero 18 teclas (1-9 + a-i + Enter + Space + Backspace) generan 18 atributos en el HTML — ruidoso y dificil de mantener. Un solo handler con switch es más legible Y permite la lógica condicional (acierto vs fallo, tipo de ejercicio actual). |
| Helper `applyResultToSession()` extraído | Duplicar inline la lógica en `sessionSelectOption`, `wordButtonsCheck`, `matchPickRight` | El CONTEXT.md lo recomienda explícitamente. Sin extracción, una refactor futura puede romper la cascada en uno de los tres tipos. El helper es ~15 LOC; vale la pena. |
| Sub-objeto `wb: {bank, answer, ...}` / `mt: {selectedLeftIdx, ...}` | Propiedades planas `wordButtonsBank`, `matchSelectedLeftIdx`, etc. | D-25 fija factory plano. Las propiedades planas con prefijo (`session*`, `wordButtons*`, `match*`) son consistentes con el patrón establecido en Phase 2 y se ven mejor en `$data` de DevTools. |

**Installation:**
```bash
# No new packages. Alpine + Pico ya pinned en index.html con SRI.
# Verificación opcional:
node --version  # 22.20.0 OK
```

**Version verification:** Stack no cambia respecto a Phase 1+2 (Alpine 3.15.12 + Pico 2.1.1). Sin nuevos paquetes a instalar — no se requiere `npm view` ni audit de slopcheck.

## Package Legitimacy Audit

> **N/A** — Phase 3 NO instala paquetes externos. El stack queda idéntico a Phase 1+2 (Alpine 3.15.12 + Pico 2.1.1 ambos CDN con SRI pinned en `index.html`). Las extensiones son puramente código de aplicación.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none) | — | — | — | — | — | No packages installed |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Project Constraints (from CLAUDE.md)

Extraídas de `./CLAUDE.md` — todas son directivas vinculantes con la misma autoridad que las locked decisions de CONTEXT.md.

- **Stack obligatorio:** Web estática (HTML + CSS + JS, sin servidor); doble click y funciona; sin instalar nada ni arrancar procesos. Phase 3 mantiene esto.
- **Persistencia:** `localStorage` del navegador + export/import a JSON. Sin DB ni backend.
- **Hosting:** Local; sin internet, sin cuentas, sin sync entre dispositivos.
- **Dispositivo:** Desktop only v1. Responsive móvil se evalúa después si emerge la necesidad.
- **Contenido:** JSON editado a mano por el autor; sin UI de edición todavía.
- **Idioma UI:** Español (autor hispanohablante aprendiendo italiano). FOUND-04.
- **Stack pinned:** Alpine.js 3.15.x + Pico CSS 2.1.1 + vanilla ES modules + localStorage; CDN con SRI; **NO añadir dependencias en Phase 3**.
- **NO build step:** ES modules nativos. No bundler.
- **NO inventar variables CSS nuevas para spacing** (UI-SPEC línea 47). Reusar Pico vars + px literales en selectores específicos.
- **NO `role="group"` para filas de botones** (UAT 02-03/02-04). Usar `.button-row` reusable (gap visible).
- **NO `x-html` jamás. Solo `x-text`** (T-02-01 textContent escapa por defecto).
- **GSD workflow obligatorio:** Entrar por un GSD command antes de editar. Phase 3 ya está en flujo `/gsd:plan-phase 3`.

## Architecture Patterns

### System Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│   Browser (file://localhost:3000 served por `npx serve`)              │
│                                                                       │
│   ┌─ DOM / Alpine sub-templates (index.html) ────────────────────┐    │
│   │                                                              │    │
│   │   <section @keydown.window="handleSessionKey">               │    │
│   │     ┌──────────────────────────────────────────────────┐    │    │
│   │     │ <template x-if=                                  │    │    │
│   │     │   "currentScreen === 'session' &&                │    │    │
│   │     │    sessionCurrentExercise">                      │    │    │
│   │     │                                                  │    │    │
│   │     │   <template x-if="...type==='multiple-choice'">  │    │    │
│   │     │     [existing markup, sin cambios]               │    │    │
│   │     │   </template>                                    │    │    │
│   │     │                                                  │    │    │
│   │     │   <template x-if="...type==='word-buttons'">     │    │    │
│   │     │     [banco + área respuesta + Comprobar]         │    │    │
│   │     │   </template>                                    │    │    │
│   │     │                                                  │    │    │
│   │     │   <template x-if="...type==='match'">            │    │    │
│   │     │     [match-grid con 2 columnas]                  │    │    │
│   │     │   </template>                                    │    │    │
│   │     └──────────────────────────────────────────────────┘    │    │
│   │                                                              │    │
│   │   handleSessionKey(event)  ──►  switch sobre event.key       │    │
│   │     - '1'..'9' → sessionSelectOption / wordButtonsAddByKey   │    │
│   │                    / matchSelectLeftByKey                    │    │
│   │     - 'a'..'i' → matchPickRightByKey                         │    │
│   │     - 'Backspace' → wordButtonsRemoveLast                    │    │
│   │     - 'Enter'/' ' → wordButtonsCheck / sessionAdvance        │    │
│   └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│   ┌─ appShell factory plano (src/screens/app.js) ──────────────┐      │
│   │   - currentScreen, ready, content, state                   │      │
│   │   - sessionMode, sessionExerciseIds, sessionCursor,        │      │
│   │     sessionResults, sessionFeedback, sessionAutoAdvanceHandle    │
│   │   - NEW: wordButtonsBank, wordButtonsAnswer                │      │
│   │   - NEW: matchLeft, matchRight, matchSelectedLeftIdx,      │      │
│   │     matchPairsConsumed, matchHadFailure,                   │      │
│   │     matchFlashHandle                                       │      │
│   │   - sessionSelectOption(idx)                               │      │
│   │   - NEW: wordButtonsAddWord, wordButtonsRemoveWord,        │      │
│   │     wordButtonsCheck                                       │      │
│   │   - NEW: matchSelectLeft, matchPickRight                   │      │
│   │   - NEW (helper): applyResultToSession(ex, correct)        │      │
│   │   - NEW (helper): initSubStateForExercise(ex)              │      │
│   │   - NEW (handler): handleSessionKey(event)                 │      │
│   │   - sessionAdvance, completeSession                        │      │
│   └────────────────────────────────────────────────────────────┘      │
│                                                                       │
│   ┌─ exercise-types/ (registry, src/exercise-types/) ──────────┐      │
│   │   registry = {                                              │      │
│   │     'multiple-choice': multipleChoice,                      │      │
│   │     NEW 'word-buttons': wordButtons,                        │      │
│   │     NEW 'match': match                                      │      │
│   │   }                                                         │      │
│   │   Cada handler: { grade(exercise, response) → boolean }     │      │
│   └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│   ┌─ domain/ (puro, sin DOM/storage) ───────────────────────────┐     │
│   │   applyImmediateFailure(state, ex, content, today)          │     │
│   │   applySessionResult(state, results, content, today)        │     │
│   │   (sin cambios respecto a Phase 2)                          │     │
│   └─────────────────────────────────────────────────────────────┘     │
│                                                                       │
│   ┌─ data/ (storage + validator) ───────────────────────────────┐     │
│   │   schema-validator.js — EXTENDIDO con switch por tipo       │     │
│   │     - multiple-choice (sin cambios)                         │     │
│   │     - NEW word-buttons: {prompt, answer[], distractors?[]}  │     │
│   │     - NEW match: {prompt, pairs:[[izq,der]]}                │     │
│   │   storage.js — sin cambios (schemaVersion sigue 2)          │     │
│   └─────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | File | Responsibility | Phase 3 Change |
|-----------|------|----------------|----------------|
| `multiple-choice` handler | `src/exercise-types/multiple-choice.js` | `grade(ex, {index}) → bool` por índice | Ninguno |
| `word-buttons` handler | `src/exercise-types/word-buttons.js` | NEW: `grade(ex, {tokens}) → bool` con deep-equal case-insensitive sobre arrays | Crear archivo |
| `match` handler | `src/exercise-types/match.js` | NEW: `grade(ex, {pairs, consumedPairIdx}) → bool` para 1 pareja propuesta consumiendo el primer pair libre que coincide textualmente | Crear archivo |
| Exercise registry | `src/exercise-types/index.js` | Mapeo `type → handler` | Añadir 2 entradas |
| Schema validator | `src/data/schema-validator.js` | Validar payloads por tipo | Refactor branch línea 84 → switch/lookup por tipo + añadir validación de payloads `word-buttons` y `match` |
| Domain progress | `src/domain/progress.js` | `applyImmediateFailure`, `applySessionResult` | **Ninguno** (reuso directo) |
| `appShell` factory | `src/screens/app.js` | Sub-estados, handlers, navegación | Extender con sub-estados de los 2 tipos nuevos + helper `applyResultToSession` + helper `initSubStateForExercise` + handler global teclado `handleSessionKey` |
| HTML templates | `index.html` | Markup Alpine | Añadir 2 sub-templates dentro del `currentScreen==='session'` + atributo `@keydown.window` |
| Estilos | `styles.css` | CSS classless overrides | Añadir clases del UI-SPEC: `.wb-bank`, `.wb-answer` (+ variant `.wb-answer-empty`/`.incorrecta`), `.wb-correct-answer`, `.kbd-hint`, `.match-grid`, `.match-col`, `.match-selected`, `.match-consumed`, `.match-flash`, `@keyframes match-flash-red` |
| Tests | `tests/exercise-types.test.js` | NEW: cobertura grade + validator | Crear archivo |

### Recommended Project Structure (post-Phase 3)

```
src/
├── main.js                       # sin cambios
├── domain/                       # sin cambios (reuso aplicación de cascada inmediata)
│   ├── dates.js
│   ├── progress.js               # applyImmediateFailure ya existe
│   └── session.js
├── data/
│   ├── content-loader.js         # sin cambios
│   ├── schema-validator.js       # EXTENDIDO con switch por tipo
│   └── storage.js                # sin cambios
├── exercise-types/
│   ├── index.js                  # EXTENDIDO (3 entradas en registry)
│   ├── multiple-choice.js        # sin cambios
│   ├── word-buttons.js           # NUEVO
│   └── match.js                  # NUEVO
└── screens/
    └── app.js                    # EXTENDIDO con sub-estados + handlers + helpers
content/
├── categories.json               # sin cambios
└── exercises/avere.json          # sin cambios (Phase 4 añade resto)
index.html                        # EXTENDIDO con sub-templates Alpine + @keydown.window
styles.css                        # EXTENDIDO con clases UI-SPEC
tests/
├── domain.test.js                # sin cambios
├── domain-progress.test.js       # sin cambios
├── domain-session.test.js        # sin cambios
├── data-storage.test.js          # sin cambios
└── exercise-types.test.js        # NUEVO
```

### Pattern 1: Sub-template Alpine por tipo (double-defense)

**What:** Cada nuevo tipo de ejercicio se renderiza con un `<template x-if="sessionCurrentExercise.type === 'word-buttons'">` anidado dentro del `<template x-if="currentScreen === 'session' && sessionCurrentExercise">` existente. La double-defense del Phase 2 (`&& sessionCurrentExercise` en el outer x-if) cubre los nuevos sub-templates igual que cubre el de multiple-choice.

**When to use:** Cada vez que añadas un tipo nuevo.

**Example:**
```html
<!-- Source: extender index.html líneas 226-256 (patrón Phase 2 ya validado) -->
<template x-if="currentScreen === 'session' && sessionCurrentExercise">
  <section @keydown.window="handleSessionKey($event)">
    <header x-text="sessionProgressLabel"></header>
    <p x-text="sessionCurrentExercise.payload.prompt"></p>

    <!-- multiple-choice (existing, sin cambios) -->
    <template x-if="sessionCurrentExercise.type === 'multiple-choice'">
      <div role="group">
        <template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">
          <button type="button" @click="sessionSelectOption(idx)"
                  :disabled="sessionFeedback !== null"
                  :class="{
                    'correcta': sessionFeedback !== null && idx === sessionCurrentExercise.payload.correctIndex,
                    'incorrecta': sessionFeedback === 'incorrect' && idx === sessionSelectedIndex
                  }"
                  x-text="opt"></button>
        </template>
      </div>
    </template>

    <!-- word-buttons (NEW) -->
    <template x-if="sessionCurrentExercise.type === 'word-buttons'">
      <div>
        <!-- Banco -->
        <div class="wb-bank">
          <template x-for="(entry, idx) in bankWithKeys" :key="entry.word + '_' + idx">
            <button type="button"
                    @click="wordButtonsAddWord(idx)"
                    :disabled="sessionFeedback !== null"
                    :aria-label="`Palabra ${entry.key}: ${entry.word}`">
              <span x-text="entry.word"></span><sup class="kbd-hint" x-text="entry.key"></sup>
            </button>
          </template>
        </div>
        <!-- Área respuesta -->
        <div class="wb-answer"
             :class="{
               'wb-answer-empty': wordButtonsAnswer.length === 0 && sessionFeedback === null,
               'incorrecta': sessionFeedback === 'incorrect'
             }"
             aria-live="polite">
          <template x-for="(word, idx) in wordButtonsAnswer" :key="word + '_' + idx">
            <button type="button"
                    @click="wordButtonsRemoveWord(idx)"
                    :disabled="sessionFeedback !== null"
                    x-text="word"></button>
          </template>
        </div>
        <p x-show="sessionFeedback === 'incorrect'" class="wb-correct-answer">
          Respuesta correcta:
          <strong x-text="sessionCurrentExercise.payload.answer.join(' ')"></strong>
        </p>
        <div class="button-row">
          <button type="button"
                  x-show="sessionFeedback === null"
                  @click="wordButtonsCheck"
                  :disabled="!wordButtonsCanCheck">Comprobar</button>
          <button type="button"
                  x-show="sessionFeedback === 'incorrect'"
                  @click="sessionAdvance">Siguiente</button>
        </div>
      </div>
    </template>

    <!-- match (NEW) -->
    <template x-if="sessionCurrentExercise.type === 'match'">
      <div class="match-grid">
        <div class="match-col">
          <template x-for="(item, idx) in matchLeft" :key="'L_' + idx + '_' + item">
            <button type="button"
                    @click="matchSelectLeft(idx)"
                    :disabled="matchLeftIsConsumed(idx) || sessionFeedback !== null"
                    :class="{
                      'match-selected': matchSelectedLeftIdx === idx && !matchLeftIsConsumed(idx),
                      'match-consumed': matchLeftIsConsumed(idx),
                      'match-flash': matchFlashIdx?.left === idx
                    }"
                    :aria-label="`Sustantivo ${idx+1}: ${item}`">
              <span x-text="item"></span><sup class="kbd-hint" x-text="idx+1 <= 9 ? idx+1 : ''"></sup>
            </button>
          </template>
        </div>
        <div class="match-col">
          <template x-for="(item, idx) in matchRight" :key="'R_' + idx + '_' + item">
            <button type="button"
                    @click="matchPickRight(idx)"
                    :disabled="matchRightIsConsumed(idx) || sessionFeedback !== null"
                    :class="{
                      'match-consumed': matchRightIsConsumed(idx),
                      'match-flash': matchFlashIdx?.right === idx
                    }"
                    :aria-label="`Letra ${letterFor(idx)}: ${item}`">
              <span x-text="item"></span><sup class="kbd-hint" x-text="idx <= 8 ? letterFor(idx) : ''"></sup>
            </button>
          </template>
        </div>
      </div>
      <button type="button"
              x-show="sessionFeedback === 'incorrect'"
              @click="sessionAdvance">Siguiente</button>
    </template>

    <hr>
    <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
  </section>
</template>
```

**Reglas críticas (double-defense Alpine, lección recurrente Phase 1+2):**
1. Los getters (`bankWithKeys`, `matchLeft`, `matchRight`, etc.) DEBEN ser null-safe: cuando `sessionCurrentExercise === null` (tick de unmount), devolver array vacío o sentinel, NO acceder a `.payload`.
2. El outer x-if `&& sessionCurrentExercise` ya guarda contra null, pero los getters de sub-estado SE EVALÚAN igualmente durante el tick — la defensa en el getter es el segundo cinturón.
3. Cualquier expresión dentro de `<template x-if="sessionCurrentExercise.type === 'X'">` puede asumir que `sessionCurrentExercise !== null` PERO debe usar `?.` defensivamente al traversar payloads (`sessionCurrentExercise?.payload?.pairs`).

### Pattern 2: Sub-estados del `appShell` (D-25 factory plano)

**What:** Las propiedades reactivas de los 2 tipos nuevos se añaden como propiedades planas del objeto que retorna `appShell()`, con prefijo (`wordButtons*` / `match*`) consistente con `session*` ya existente.

**Recomendación nomenclatura (Claude's discretion del CONTEXT.md, planner decide final):**
```js
// Word-buttons
wordButtonsBank: [],          // string[]  — palabras visibles en banco actual (mengua al añadir, crece al quitar)
wordButtonsAnswer: [],         // string[]  — palabras colocadas en el área respuesta, en orden

// Match
matchLeft: [],                  // string[]  — columna izquierda barajada (no muta durante el ejercicio)
matchRight: [],                 // string[]  — columna derecha barajada
matchSelectedLeftIdx: null,    // number | null — índice visible de la columna izq seleccionada
matchPairsConsumed: [],        // Array<{leftIdx, rightIdx, pairIdx}> — parejas correctas ya formadas
matchHadFailure: false,        // boolean — flag D-60/D-61: cualquier fallo marca el ejercicio fallado
matchFlashIdx: null,           // {left, right} | null — par de índices con clase .match-flash activa (300ms)
matchFlashHandle: null,        // number | null — setTimeout handle del parpadeo rojo (cleanup obligatorio)
```

**Getter computado `bankWithKeys`** (renumeración dinámica D-69, Pattern 10):
```js
// dentro del objeto retornado por appShell()
get bankWithKeys() {
  return this.wordButtonsBank.map((word, idx) => ({
    word,
    key: idx < 9 ? String(idx + 1) : ''   // posiciones 10+ sin sufijo (D-69)
  }));
},

get wordButtonsCanCheck() {
  return this.wordButtonsAnswer.length > 0 && this.sessionFeedback === null;
},
```

**Helper `letterFor(idx)`** (mapeo idx → letra para match D-70):
```js
// método del appShell o helper privado del módulo
letterFor(idx) {
  return idx < 9 ? String.fromCharCode(97 + idx) : '';  // 'a'..'i', luego ''
}
```

**Helpers `matchLeftIsConsumed(idx)` / `matchRightIsConsumed(idx)`**:
```js
matchLeftIsConsumed(idx) {
  return this.matchPairsConsumed.some(p => p.leftIdx === idx);
},
matchRightIsConsumed(idx) {
  return this.matchPairsConsumed.some(p => p.rightIdx === idx);
},
```

### Pattern 3: Helper `applyResultToSession(exercise, correct)` (D-25 + CONTEXT recomendación)

**What:** Extracción del flujo común que `sessionSelectOption`, `wordButtonsCheck` y la rama final de `match` comparten: push al `sessionResults`, marcar `sessionFeedback`, llamar `applyImmediateFailure` + persist en fail, schedule auto-advance 600ms en correct.

**Why crítico:** Sin este helper, hay TRES sitios donde `applyImmediateFailure` se podría omitir/duplicar por error. CONTEXT.md lo recomienda explícitamente como solución a "garantizar que applyImmediateFailure se llama exactamente UNA vez".

**Example:**
```js
// dentro del objeto retornado por appShell() (D-25 factory plano)
applyResultToSession(exercise, correct) {
  this.sessionFeedback = correct ? 'correct' : 'incorrect';
  this.sessionResults.push({ exerciseId: exercise.id, correct });

  if (correct) {
    this.sessionAutoAdvanceHandle = setTimeout(() => this.sessionAdvance(), 600);
  } else {
    // D-54 / D-61: cascada inmediata + persist
    const newState = applyImmediateFailure(this.state, exercise, this.content, todayLocal());
    saveState(newState);
    this.state = newState;
    // No schedule: el HTML expone "Siguiente" que llamará sessionAdvance() cuando el usuario decida
  }

  // D-42: Test completo per-answer write
  if (this.sessionMode === 'test-completo') {
    this.persistInFlightTest();
  }
},

// Refactor de sessionSelectOption (multiple-choice):
sessionSelectOption(idx) {
  if (this.sessionFeedback !== null) return;            // T-02-02 double-click guard
  this.sessionSelectedIndex = idx;
  const ex = this.sessionCurrentExercise;
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { index: idx });
  this.applyResultToSession(ex, correct);
},

// Word-buttons handler:
wordButtonsCheck() {
  if (this.sessionFeedback !== null) return;
  if (!this.wordButtonsCanCheck) return;
  const ex = this.sessionCurrentExercise;
  const handler = registry[ex.type];
  const correct = handler.grade(ex, { tokens: this.wordButtonsAnswer });
  this.applyResultToSession(ex, correct);
},
```

**CRÍTICO para match (D-61 idempotencia):** El primer click incorrecto en match dispara `applyImmediateFailure` Y `matchHadFailure = true`. Los clicks erróneos posteriores en el MISMO ejercicio NO deben re-disparar `applyImmediateFailure` (ya no haría daño — es idempotente — pero sí re-escribiría a localStorage innecesariamente). Solución: guard `if (!this.matchHadFailure) { applyImmediateFailure(...); this.matchHadFailure = true; }`.

```js
matchPickRight(rightIdx) {
  if (this.sessionFeedback !== null) return;
  if (this.matchSelectedLeftIdx === null) return;       // no izq seleccionado
  if (this.matchRightIsConsumed(rightIdx)) return;      // ya consumida

  const ex = this.sessionCurrentExercise;
  const leftIdx = this.matchSelectedLeftIdx;
  const leftWord = this.matchLeft[leftIdx];
  const rightWord = this.matchRight[rightIdx];

  const handler = registry['match'];
  const result = handler.grade(ex, {
    leftWord,
    rightWord,
    consumedPairIdx: this.matchPairsConsumed.map(p => p.pairIdx)
  });

  if (result.correct) {
    // Pareja válida: fijar como consumed, item apagado
    this.matchPairsConsumed.push({ leftIdx, rightIdx, pairIdx: result.pairIdx });
    this.matchSelectedLeftIdx = null;

    // ¿Completado el ejercicio?
    if (this.matchPairsConsumed.length === ex.payload.pairs.length) {
      this.applyResultToSession(ex, !this.matchHadFailure);
      // si matchHadFailure: applyResultToSession con correct=false → cascada idempotente (state ya reseteado)
    }
  } else {
    // Pareja incorrecta: parpadeo + cascada inmediata SOLO en el primer fallo
    if (!this.matchHadFailure) {
      const newState = applyImmediateFailure(this.state, ex, this.content, todayLocal());
      saveState(newState);
      this.state = newState;
      this.matchHadFailure = true;
    }
    this.flashMatchPair(leftIdx, rightIdx);
    this.matchSelectedLeftIdx = null;
  }
},
```

### Pattern 4: `initSubStateForExercise(exercise)` (CONTEXT.md "Integration Points")

**What:** Helper invocado al cargar un ejercicio nuevo (en `startSession`, en `sessionAdvance` antes del siguiente). Resetea los sub-estados de los 2 tipos nuevos a su estado inicial — barajando para match/word-buttons, limpiando flags.

**Why crítico:** Sin esto, los sub-estados del ejercicio anterior persisten al siguiente — el banco de un word-buttons previo se mezcla con un match, etc. Race condition Alpine: el cursor avanza, el sub-template del tipo anterior se desmonta, el del siguiente se monta con sub-estado del anterior.

**Example:**
```js
initSubStateForExercise(exercise) {
  // Limpia siempre estado de TODOS los tipos para evitar leak entre tipos
  this.wordButtonsBank = [];
  this.wordButtonsAnswer = [];
  this.matchLeft = [];
  this.matchRight = [];
  this.matchSelectedLeftIdx = null;
  this.matchPairsConsumed = [];
  this.matchHadFailure = false;
  this.cancelMatchFlash();    // cleanup setTimeout previo

  if (!exercise) return;

  if (exercise.type === 'word-buttons') {
    const all = [...(exercise.payload.answer ?? []), ...(exercise.payload.distractors ?? [])];
    this.wordButtonsBank = fisherYates(all, Math.random);  // o RNG seedable
    this.wordButtonsAnswer = [];
  } else if (exercise.type === 'match') {
    this.matchLeft = fisherYates(exercise.payload.pairs.map(p => p[0]), Math.random);
    this.matchRight = fisherYates(exercise.payload.pairs.map(p => p[1]), Math.random);
    this.matchSelectedLeftIdx = null;
    this.matchPairsConsumed = [];
    this.matchHadFailure = false;
  }
  // multiple-choice: no sub-estado adicional necesario
}
```

**Cuándo invocarlo:**
- En `startSession()` tras setear `sessionCursor = 0`, antes de transicionar a `currentScreen = 'session'`: `this.initSubStateForExercise(this.content.exerciseById[this.sessionExerciseIds[0]])`.
- En `sessionAdvance()` tras incrementar `sessionCursor`, antes de invocar `completeSession()` o renderizar el siguiente:
```js
sessionAdvance() {
  this.cancelAutoAdvance();
  this.sessionCursor += 1;
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;
  if (this.sessionCursor >= this.sessionExerciseIds.length) {
    this.completeSession();
  } else {
    const nextEx = this.content.exerciseById[this.sessionExerciseIds[this.sessionCursor]];
    this.initSubStateForExercise(nextEx);    // ← NEW
    if (this.sessionMode === 'test-completo') {
      this.persistInFlightTest();
    }
  }
}
```

**Helper `fisherYates(arr, rng)`** — función pura, puede vivir en `src/screens/app.js` como helper privado del módulo o en `src/domain/session.js` exportada. Mismo RNG que el sampler para consistencia (D-62 explícito).

### Pattern 5: `grade()` puro tipo word-buttons

**What:** Compara `response.tokens` (lowercase) deep-equal con `exercise.payload.answer` (lowercase). Layer purity invariante.

**Example:**
```js
// src/exercise-types/word-buttons.js
//
// Decisiones aplicadas:
//   - D-64: payload {prompt, answer[], distractors?[]}
//   - D-67: grading case-insensitive (.toLowerCase() en ambos lados)
//   - CONT-06: strings ya NFC-normalizadas al cargar — NO normalizar aquí (sería trabajo redundante)
//   - Layer purity D-02: sin DOM, sin storage.

export const wordButtons = {
  /**
   * @param {{payload: {answer: string[]}}} exercise
   * @param {{tokens: string[]}} response
   * @returns {boolean}
   */
  grade(exercise, response) {
    const expected = exercise.payload.answer;
    const actual = response.tokens ?? [];
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (actual[i].toLowerCase() !== expected[i].toLowerCase()) return false;
    }
    return true;
  }
};
```

### Pattern 6: Validator delegado por tipo (refactor schema-validator.js)

**What:** Reemplazar la rama `if (ex.type !== 'multiple-choice')` (línea 84) por un dispatch table que valida según el tipo. Cada validador de payload acumula errores en el mismo array externo (`push(file, ex.id, reason)`), preservando el contrato D-08 de "devolver todos los errores".

**Why:** El branch literal actual hardcodea el tipo en una negación, lo cual no escala. Un dispatch table escala a N tipos sin modificar el código de iteración.

**Example refactor:**
```js
// src/data/schema-validator.js (extracto)

const PAYLOAD_VALIDATORS = {
  'multiple-choice': validateMultipleChoicePayload,
  'word-buttons': validateWordButtonsPayload,
  'match': validateMatchPayload
};

// dentro del bucle de ejercicios:
for (const ex of exercises) {
  // ... (id, categoryIds, payload existence — sin cambios)

  const validator = PAYLOAD_VALIDATORS[ex.type];
  if (!validator) {
    push(file, ex.id, `type "${ex.type}" no soportado (esperado: ${Object.keys(PAYLOAD_VALIDATORS).join(', ')})`);
    continue;
  }
  validator(ex, file, push);   // mutación a través de `push` callback
}

function validateMultipleChoicePayload(ex, file, push) {
  const { prompt, options, correctIndex } = ex.payload;
  if (typeof prompt !== 'string' || !prompt.includes('___')) {
    push(file, ex.id, '"payload.prompt" debe ser string y contener el hueco "___"');
  }
  if (!Array.isArray(options) || options.length < 3 || options.length > 4) {
    push(file, ex.id, `"payload.options" debe ser array de 3 o 4 strings`);
  } else if (options.some(o => typeof o !== 'string' || !o.trim())) {
    push(file, ex.id, '"payload.options" contiene entradas vacías o no-string');
  }
  const optsLen = Array.isArray(options) ? options.length : 0;
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= optsLen) {
    push(file, ex.id, `"payload.correctIndex" inválido: ${correctIndex} (rango [0, ${optsLen}))`);
  }
}

function validateWordButtonsPayload(ex, file, push) {
  const { prompt, answer, distractors } = ex.payload;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, ex.id, '"payload.prompt" debe ser string no vacío');
  }
  if (!Array.isArray(answer) || answer.length === 0) {
    push(file, ex.id, '"payload.answer" debe ser array de strings no vacío');
  } else if (answer.some(t => typeof t !== 'string' || !t.trim())) {
    push(file, ex.id, '"payload.answer" contiene tokens vacíos o no-string');
  }
  if (distractors !== undefined) {
    if (!Array.isArray(distractors)) {
      push(file, ex.id, '"payload.distractors" si está presente debe ser array');
    } else if (distractors.some(t => typeof t !== 'string' || !t.trim())) {
      push(file, ex.id, '"payload.distractors" contiene entradas vacías o no-string');
    }
  }
}

function validateMatchPayload(ex, file, push) {
  const { prompt, pairs } = ex.payload;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    push(file, ex.id, '"payload.prompt" debe ser string no vacío');
  }
  if (!Array.isArray(pairs)) {
    push(file, ex.id, '"payload.pairs" debe ser array de tuples [izq, der]');
    return;
  }
  if (pairs.length < 2 || pairs.length > 10) {
    push(file, ex.id, `"payload.pairs" debe tener entre 2 y 10 entradas (encontrado: ${pairs.length})`);
  }
  pairs.forEach((p, idx) => {
    if (!Array.isArray(p) || p.length !== 2) {
      push(file, ex.id, `"payload.pairs[${idx}]" debe ser tuple de exactamente 2 strings`);
      return;
    }
    if (typeof p[0] !== 'string' || !p[0].trim()) {
      push(file, ex.id, `"payload.pairs[${idx}][0]" debe ser string no vacío`);
    }
    if (typeof p[1] !== 'string' || !p[1].trim()) {
      push(file, ex.id, `"payload.pairs[${idx}][1]" debe ser string no vacío`);
    }
  });
}
```

### Pattern 7: Match con duplicados textuales (algoritmo de consumo por índice)

**What:** El grading de match permite duplicados en la columna derecha (D-66 explícito). El algoritmo busca, dentro de `payload.pairs`, el PRIMER pair (por índice) que (a) coincide textualmente (lowercase) con la pareja propuesta, Y (b) NO está en `consumedPairIdx`. Si lo encuentra: pareja válida + devolver `pairIdx` para que el caller lo marque consumed. Si no: pareja inválida.

**Why elegante:** El usuario que empareja el "segundo `la`" antes que el primero NO encuentra ningún problema mecánico — el algoritmo encuentra cualquier pair libre que coincida textualmente, y consume EL PRIMERO. Cualquier orden de emparejamiento entre duplicados textuales es válido.

**Example:**
```js
// src/exercise-types/match.js
//
// Decisiones aplicadas:
//   - D-65: payload {prompt, pairs:[[izq,der]]}
//   - D-66: duplicados en columna derecha permitidos; consumo por índice
//   - D-67: grading case-insensitive
//   - Layer purity D-02

export const match = {
  /**
   * Grade UNA pareja propuesta {leftWord, rightWord} contra payload.pairs,
   * consumiendo el primer pair (por índice) no-consumido que coincide
   * textualmente (case-insensitive).
   *
   * @param {{payload: {pairs: Array<[string, string]>}}} exercise
   * @param {{leftWord: string, rightWord: string, consumedPairIdx: number[]}} response
   * @returns {{correct: boolean, pairIdx: number | null}}
   *   - correct: true si encontró un pair libre que coincide; pairIdx = índice del pair encontrado
   *   - correct: false si ningún pair libre coincide; pairIdx = null
   */
  grade(exercise, response) {
    const { pairs } = exercise.payload;
    const consumed = new Set(response.consumedPairIdx ?? []);
    const lwLower = (response.leftWord ?? '').toLowerCase();
    const rwLower = (response.rightWord ?? '').toLowerCase();
    for (let i = 0; i < pairs.length; i++) {
      if (consumed.has(i)) continue;
      const [pl, pr] = pairs[i];
      if (pl.toLowerCase() === lwLower && pr.toLowerCase() === rwLower) {
        return { correct: true, pairIdx: i };
      }
    }
    return { correct: false, pairIdx: null };
  }
};
```

**Complexity:** O(N) por intento de pareja, N = número de pairs. Cap N ≤ 10 (D-63) → trivial.

### Pattern 8: `applyImmediateFailure` idempotente para match (D-61)

**What:** En match, el PRIMER intento erróneo dispara `applyImmediateFailure`. Los intentos erróneos posteriores en el MISMO ejercicio NO deben re-disparar el helper (ya es idempotente sobre el state — `clearedExerciseIds = []` ya está vacío — pero re-escribir `saveState` es ruido innecesario y dispara writes que la app no necesita).

**Guard:** Flag `matchHadFailure: boolean` por ejercicio. Se setea a `true` la primera vez que se invoca `applyImmediateFailure` en match. `initSubStateForExercise` lo resetea a `false` al cargar el siguiente ejercicio.

**Example:** Ver Pattern 3 (`matchPickRight`) más arriba — el guard `if (!this.matchHadFailure)` lo aplica.

**Idempotencia con `applySessionResult`:** Cuando el match se completa con `matchHadFailure === true`, `applyResultToSession(exercise, correct=false)` pushea al `sessionResults` con `correct: false`. Al final de sesión, `applySessionResult` aplica la rama FAIL-WINS sobre el state ya reseteado (no-op para `categoryProgress`) Y bumpea `exerciseStats[ex.id]` una sola vez (`timesShown += 1`, `timesFailed += 1`). El ejercicio NO se cuenta como pasado en `exerciseStats.timesCorrect`. Esta es la semántica explícita en D-61: "al final, `applySessionResult` recibe el ejercicio marcado correct: false y la cascada es idempotente."

### Pattern 9: Handler global de teclado con `@keydown.window`

**What:** Un único atributo `@keydown.window="handleSessionKey($event)"` sobre el `<section>` que envuelve el contenido del session screen. Alpine atacha el listener al `window` global (alcanza teclas pulsadas en cualquier foco) PERO desmonta el listener automáticamente cuando el elemento que tiene la directiva desaparece del DOM (cambio de `currentScreen` provoca el desmonte del `<template x-if="currentScreen === 'session'">` y eso desmonta también el `<section>` con el atributo).

**Why declarativo > manual:** [CITED: alpinejs.dev/essentials/events] — "Alpine cleanup function within directives automatically removes event listeners when the element is removed itself". No riesgo de listener huérfano capturando teclas en home/picker/summary (bug latente que D-72 explicita prevenir).

**Cuándo NO usar `@keydown.window`:** Si Alpine no soporta `.window` en este contexto específico (improbable — verificado en docs), el fallback es addEventListener manual en `init()` + removeEventListener en `destroy()` con guard `if (this.currentScreen !== 'session') return;` al inicio del handler. Pero la primera opción es estrictamente más simple y robusta.

**Implementación del handler:**
```js
handleSessionKey(event) {
  // Modifiers: ignorar combos con Ctrl/Meta/Alt (deja pasar Ctrl+R, Cmd+L, etc.)
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  // No procesar nada si no hay ejercicio activo (defensa adicional al unmount)
  if (!this.sessionCurrentExercise) return;

  const ex = this.sessionCurrentExercise;
  const key = event.key;

  // ── Enter / Space (tras fallo dispara sessionAdvance; tras acierto no hace nada) ──
  if (key === 'Enter' || key === ' ') {
    if (key === ' ') event.preventDefault();   // evita scroll de página
    if (this.sessionFeedback === 'incorrect') {
      this.sessionAdvance();
      return;
    }
    // word-buttons: Enter sin feedback dispara Comprobar (D-69)
    if (ex.type === 'word-buttons' && this.sessionFeedback === null && this.wordButtonsCanCheck) {
      this.wordButtonsCheck();
      return;
    }
    // Tras acierto, Enter/Space NO hacen nada (D-71). Auto-avance 600ms gestiona.
    return;
  }

  // ── Backspace (word-buttons: quita última colocada; ignorado en otros) ──
  if (key === 'Backspace') {
    if (ex.type === 'word-buttons' && this.sessionFeedback === null && this.wordButtonsAnswer.length > 0) {
      event.preventDefault();   // evita "navegar atrás" del navegador (Chrome legacy + lectura por algunos plugins)
      this.wordButtonsRemoveWord(this.wordButtonsAnswer.length - 1);
    }
    return;
  }

  // ── Digit '1'..'9' ──
  if (key >= '1' && key <= '9') {
    if (this.sessionFeedback !== null) return;     // tras feedback, ignorar selección
    const idx = parseInt(key, 10) - 1;
    if (ex.type === 'multiple-choice') {
      // D-68: 1-4 mapean a opciones; teclas que excedan opciones reales se ignoran
      if (idx < ex.payload.options.length) {
        this.sessionSelectOption(idx);
      }
    } else if (ex.type === 'word-buttons') {
      // D-69: 1-9 sobre palabras VISIBLES del banco; >9 ignorado
      if (idx < this.wordButtonsBank.length && idx < 9) {
        this.wordButtonsAddWord(idx);
      }
    } else if (ex.type === 'match') {
      // D-70: 1-9 sobre items izq visibles; >9 ignorado
      if (idx < this.matchLeft.length && idx < 9 && !this.matchLeftIsConsumed(idx)) {
        this.matchSelectLeft(idx);
      }
    }
    return;
  }

  // ── Letter 'a'..'i' ──
  if (key >= 'a' && key <= 'i') {
    if (this.sessionFeedback !== null) return;
    if (ex.type !== 'match') return;               // solo match usa letras
    const idx = key.charCodeAt(0) - 97;           // 'a' = 0, 'i' = 8
    if (this.matchSelectedLeftIdx === null) return; // letra sin número previo: ignorar
    if (idx < this.matchRight.length && idx < 9 && !this.matchRightIsConsumed(idx)) {
      this.matchPickRight(idx);
    }
    return;
  }

  // Cualquier otra tecla: dejar al navegador (Tab, F12, etc.)
}
```

**Foco al body (D-72):** Por defecto, tras montar el sub-template session, ningún elemento concreto recibe focus. El listener vive en `window`, así que las teclas se capturan independientemente del focus interno. Si el usuario hace Tab por error (residual a11y), Pico aplica `outline` de focus-visible por defecto sobre los botones — NO desactivar. Pulsar la tecla relevante sigue funcionando vía el listener global.

### Pattern 10: `bankWithKeys` re-derivado en cada render (renumeración dinámica D-69)

**What:** En lugar de mantener un array paralelo con índices, derivar las claves visuales al render desde el estado canónico `wordButtonsBank`. Cada render recomputa `bankWithKeys = wordButtonsBank.map((w, i) => ({word: w, key: i < 9 ? String(i+1) : ''}))`.

**Why reactive correcto:** Alpine recomputa getters cuando sus dependencias cambian. Cuando `wordButtonsBank` mengua (palabra movida al área respuesta) o crece (palabra devuelta del área al banco), el getter se re-evalúa y los sufijos visuales se renumeran automáticamente. [CITED: alpinejs.dev/directives/for] — "x-for handles dynamic array shrinking/growing properly when you use stable, unique keys on your x-for iterations".

**:key crítico:** Usar `:key="entry.word + '_' + idx"` (word + idx) en el `x-for` evita problemas con palabras duplicadas en el banco (ej. dos ocurrencias de "la") — el word solo no es único, idx solo no es estable al menguar/crecer; word+idx es estable y único en cada render coherente.

**Anti-pattern:** Mantener `bankIndices: number[]` paralelo o asignar IDs sintéticos a cada palabra del banco. Innecesario; el getter computado es la solución idiomática.

### Pattern 11: Cleanup `setTimeout` match-flash + listener teclado

**What:** El parpadeo rojo de match (`@keyframes match-flash-red 300ms`) se aplica con `setTimeout` para quitar la clase tras la animación + deshacer la pareja. Mismo patrón cleanup que `sessionAutoAdvanceHandle` (Pitfall #5 heredado Phase 2): guardar el handle, cancelarlo en `cancelMatchFlash()`, invocarlo desde `resetSession()` y `destroy()`.

**Why crítico:** El UI-SPEC línea 171 marca esto explícitamente. Sin cleanup, si el usuario pulsa "← Volver al home" durante un parpadeo activo, el setTimeout dispara 200ms después en una sesión ya desmontada — provocaría intentos de mutar sub-estados que ya están vacíos y posibles TypeErrors.

**Example:**
```js
// Sub-estado adicional en el factory:
matchFlashIdx: null,     // {left: number, right: number} | null
matchFlashHandle: null,  // setTimeout handle

flashMatchPair(leftIdx, rightIdx) {
  this.cancelMatchFlash();   // por si hay uno previo (improbable pero defensivo)
  this.matchFlashIdx = { left: leftIdx, right: rightIdx };
  this.matchFlashHandle = setTimeout(() => {
    this.matchFlashIdx = null;
    this.matchFlashHandle = null;
  }, 300);
},

cancelMatchFlash() {
  if (this.matchFlashHandle !== null) {
    clearTimeout(this.matchFlashHandle);
    this.matchFlashHandle = null;
  }
  this.matchFlashIdx = null;
},

// Extender resetSession (existente) para incluir el cleanup:
resetSession() {
  this.cancelAutoAdvance();
  this.cancelMatchFlash();            // ← NEW
  this.sessionMode = null;
  this.sessionExerciseIds = [];
  this.sessionCursor = 0;
  this.sessionResults = [];
  this.sessionSelectedIndex = null;
  this.sessionFeedback = null;
  // Sub-estados de los nuevos tipos
  this.wordButtonsBank = [];
  this.wordButtonsAnswer = [];
  this.matchLeft = [];
  this.matchRight = [];
  this.matchSelectedLeftIdx = null;
  this.matchPairsConsumed = [];
  this.matchHadFailure = false;
},

// destroy() ya existe; extender:
destroy() {
  this.cancelAutoAdvance();
  this.cancelMatchFlash();            // ← NEW
}
```

**Listener `@keydown.window` cleanup:** Manejado AUTOMÁTICAMENTE por Alpine cuando el elemento con la directiva se desmonta. NO requiere código de cleanup manual. Verificado con búsqueda Alpine docs ([CITED: alpinejs.dev/essentials/events] + [CITED: github.com/alpinejs/alpine/discussions/1217 — "destroy method is called on cleanup; the inverse of init"]).

### Anti-Patterns to Avoid

- **UI grades the answer:** Calcular correctness en el click handler del botón. Phase 1 estableció el patrón "domain grades, UI dispatches". Phase 3 lo mantiene: el `wordButtonsCheck` y `matchPickRight` invocan `registry[ex.type].grade(...)` y NUNCA hardcodean reglas de calificación.
- **`x-html` con contenido del payload:** Renderizar `payload.answer.join(' ')` con `x-html` permitiría XSS si un autor copia/pega texto malicioso. Usar SIEMPRE `x-text` (T-02-01).
- **Listener `addEventListener` manual sin cleanup:** Si por alguna razón el planner descarta `@keydown.window`, el cleanup manual en `destroy()` es OBLIGATORIO Y el caller debe garantizar que `destroy()` se invoca al cambiar `currentScreen` (Alpine lo hace por defecto al desmontar el x-data; verificar). El riesgo de olvido es alto — preferir `@keydown.window`.
- **`role="group"` para filas de botones:** Pico's button group une los bordes (parecen un solo control). Reusar `.button-row` (gap visible) que ya existe en `styles.css` (líneas 86-97). UI-SPEC línea 46 lo refuerza.
- **Auto-completar la última pareja en match:** Resuelto en UI-SPEC: NO auto-completar. Si el planner cae en la tentación de "es mejor UX", recordar la decisión.
- **Race condition Alpine al cambiar de exercise type mid-session:** Si el cursor avanza pero `initSubStateForExercise` NO se invoca antes del próximo render, el sub-template del tipo anterior puede intentar leer sub-estados del nuevo tipo (banco vacío vs match incompleto). Fix: invocar `initSubStateForExercise(nextEx)` SIEMPRE antes de transicionar al siguiente.
- **Doble llamada a `applyImmediateFailure` en match:** El segundo+ click incorrecto en el mismo ejercicio debe ser silencioso (no re-persistir). Guard `if (!this.matchHadFailure)` en `matchPickRight`.
- **Sufijos numéricos como string sin caps:** Si un word-buttons tiene 12 palabras visibles, intentar `key = String(i+1)` para todos genera `10`, `11`, `12` que confunden visualmente (¿es "uno-cero" o "diez"?). Solución D-69 explícita: posiciones 10+ se renderizan SIN sufijo (`key === ''`).
- **Captura keydown global SIN desregistro al salir de la session screen:** Bug latente que D-72 explicita prevenir. Resuelto con `@keydown.window` que se desmonta automáticamente con el sub-template.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listener teclado global con cleanup | `addEventListener` manual + `destroy()` con cleanup explícito | `@keydown.window` directive de Alpine | Alpine ya implementa cleanup automático al desmontar el elemento; código manual introduce un punto de fallo (olvidar el cleanup). |
| Reactivity para banco que mengua/crece | Array de `{word, key, visible}` con updates manuales + diff | Getter computado `bankWithKeys` que re-deriva en cada render | Alpine ya recomputa por reactividad; la versión manual desincroniza fácilmente. |
| Shuffle determinista para match | Implementar Fisher-Yates a mano | Reusar el helper existente del sampler (`src/domain/session.js` lo tiene en `fisherYates(arr, rng)`) | Phase 2 ya lo usa; un solo helper centralizado evita drift. Si no está exportado, exportarlo. |
| Mapeo letra → índice en match (`a → 0`, `b → 1`...) | Lookup table hardcoded `{a:0, b:1, ...}` | `key.charCodeAt(0) - 97` | Trivial, sin estructura adicional. |
| Validación JSON exhaustiva del schema | Library como Ajv (32 KB), Zod (14 KB) | Hand-written validator extendido (~30 LOC adicionales por tipo) | Pattern establecido Phase 1 D-08. Para 3 tipos con ~5 campos cada uno, hand-written es trivial y NO añade dependencia. |
| Confirmación inline para "fallo en match" | Toast/banner "Ejercicio fallado" tras el primer parpadeo | Sin confirmación — el parpadeo rojo + persistencia silenciosa son suficientes | UI-SPEC línea 264 explícito: "NO añadir toast/banner tras el primer parpadeo. Rompería la promesa 'tono sobrio sin gamificación'". |

**Key insight:** Phase 3 es un ejercicio de extensión PURA — todo lo necesario (registry pattern, validator, factory plano, cascada inmediata) ya está en sitio. La tentación de "vamos a refactorizar X mientras tocamos esto" debe rechazarse — el alcance es estrictamente añadir los 2 tipos + ergonomía teclado. Cualquier refactor mayor del schema validator (más allá del switch por tipo) debe ser deferred a Phase 5 polish.

## Common Pitfalls

### Pitfall 1: Listener `@keydown.window` huérfano capturando teclas en home/picker/summary

**What goes wrong:** Si el planner usa `addEventListener('keydown', this.handleSessionKey)` en `init()` SIN cleanup en `destroy()` (o con cleanup mal hecho), el listener sigue activo cuando el usuario vuelve a home. Pulsa `1` en home esperando seleccionar una opción de un ejercicio que ya no existe → TypeError sobre `sessionCurrentExercise.payload.options` (que es null).

**Why it happens:** addEventListener manual no se asocia al lifecycle del x-data; sobrevive al unmount.

**How to avoid:** Usar `@keydown.window` Alpine modifier sobre el `<section>` dentro de `<template x-if="currentScreen === 'session'">`. Alpine lo desmonta automáticamente al cambiar `currentScreen`. Si el handler tiene que registrarse manualmente por alguna razón, AÑADIR un guard `if (this.currentScreen !== 'session' || !this.sessionCurrentExercise) return;` AL INICIO del handler como defensa adicional.

**Warning signs:**
- Pulsar `1` en home produce un error en la consola.
- Pulsar Space en picker hace scroll de la página (esperaríamos que `event.preventDefault()` no se aplicara fuera de sesión).
- Cambiar de session screen a home y volver duplica los listeners (cada visita acumula uno más).

### Pitfall 2: `applyImmediateFailure` se invoca múltiples veces en match → writes redundantes a localStorage

**What goes wrong:** El usuario hace 5 emparejamientos incorrectos en el mismo ejercicio. Si NO hay guard, `applyImmediateFailure` se invoca 5 veces; `saveState` escribe 5 veces. El state final es funcionalmente idéntico (idempotente sobre `categoryProgress`), pero el dailyLog acumula 5 entradas idénticas en `categoriesWithFailure` (dedupead por `uniqueStrings`, no es bug real, solo ruido).

**Why it happens:** Sin el flag `matchHadFailure`, no hay forma de distinguir "primer fallo en este ejercicio" de "fallo N-ésimo en el mismo ejercicio".

**How to avoid:** Flag `matchHadFailure: false` inicializado en `initSubStateForExercise`. Guard en `matchPickRight`: `if (!this.matchHadFailure) { applyImmediateFailure(...); this.matchHadFailure = true; }`. Reset a `false` al cargar siguiente ejercicio.

**Warning signs:**
- DevTools storage panel muestra writes en cada click incorrecto consecutivo.
- `state.dailyLog[today].categoriesWithFailure` crece con duplicados (deduplicados al final, pero observable durante el ejercicio).

### Pitfall 3: Race condition `initSubStateForExercise` no invocado tras cursor advance

**What goes wrong:** `sessionAdvance` incrementa el cursor pero NO resetea los sub-estados de los nuevos tipos. El siguiente ejercicio es un word-buttons que reusa el `wordButtonsBank` del ejercicio anterior (con palabras de otra frase, ya parcialmente vaciado). El render del banco se ve roto y el usuario no entiende qué hacer.

**Why it happens:** Olvido del planner al extender `sessionAdvance` con la inicialización del siguiente sub-estado.

**How to avoid:** En `sessionAdvance`, tras incrementar `sessionCursor` y antes de cualquier render del siguiente ejercicio, invocar `this.initSubStateForExercise(nextEx)`. También en `startSession` para el primer ejercicio. También en `resumeInFlightTest` (Test completo reanudado).

**Warning signs:**
- El segundo ejercicio word-buttons del mismo Repaso muestra palabras del primer ejercicio.
- El segundo ejercicio match muestra `matchPairsConsumed` no vacío al arrancar (consumed visual de la pareja correcta del anterior).
- Cursor de Test completo reanudado muestra banco/match con datos del momento del cierre.

### Pitfall 4: `cancelMatchFlash` no invocado al cancelar la sesión

**What goes wrong:** Usuario activa un parpadeo rojo (clica pareja incorrecta), pulsa "← Volver al home" durante los 300ms. El setTimeout del parpadeo dispara después con la sesión ya desmontada → intenta mutar `matchFlashIdx` y `matchFlashHandle` en un objeto cuyo binding Alpine ya está cleanup. En el mejor caso, no-op (Alpine handles gracefully); en el peor caso, TypeError visible.

**Why it happens:** El cleanup de setTimeout se centraliza en `cancelAutoAdvance()` pero el nuevo `matchFlashHandle` es un timer separado que el planner puede olvidar de cancelar.

**How to avoid:** Helper `cancelMatchFlash()` paralelo a `cancelAutoAdvance()`. Invocarlo en `resetSession`, `destroy`, y `sessionAdvance` (cleanup defensivo aunque no estrictamente necesario).

**Warning signs:**
- TypeError en consola tras pulsar "Volver al home" durante un parpadeo rojo.
- Item de match queda con la clase `.match-flash` aplicada tras volver al home (no observable hasta que el ejercicio se vuelva a renderizar, pero ruido en el state).

### Pitfall 5: Renumeración `bankWithKeys` rompe los sufijos visibles cuando el banco crece más allá de 9

**What goes wrong:** Word-buttons con `answer.length === 4` + `distractors.length === 8` = banco inicial de 12 palabras visibles. Si `bankWithKeys` asigna `key: String(i+1)` para todas, las posiciones 10/11/12 muestran sufijos `10`/`11`/`12` que confunden al usuario (¿es "diez" o "uno+cero"?). Pero la tecla `1` solo apunta a la posición 0.

**Why it happens:** Olvido del cap en 9 al implementar el getter.

**How to avoid:** Cap explícito: `key: idx < 9 ? String(idx + 1) : ''`. Las posiciones 10+ se renderizan sin sufijo (no son alcanzables por teclado, pero sí clickeables por mouse). Si emerge fricción, el deferred "letras a-z para banco" es el upgrade path.

**Warning signs:**
- Sufijo `10`, `11`, `12` visible en botones del banco.
- Usuario reporta "pulso 1 y se selecciona la palabra equivocada" (confusión visual con sufijos de 2 dígitos).

### Pitfall 6: Schema validator NO rechaza payloads malformados de los nuevos tipos

**What goes wrong:** Autor escribe un `payload.pairs: [["casa", "la"], "amico"]` (segundo elemento string en vez de tuple). El validator actual (Phase 2) tiene un branch literal `if (ex.type !== 'multiple-choice')` que rechaza CUALQUIER tipo no-multi-choice con mensaje "no soportado". Si el refactor a switch/lookup se hace mal (ej. olvidar validar `pairs[i]` shape), un payload basura llega al runtime y crashea Alpine al intentar renderizar `matchLeft.map(p => p[0])` con `p[0] === undefined`.

**Why it happens:** El validator es la única defensa entre el autor y el runtime. Cualquier hueco en la validación rompe la promesa "banner visible si JSON inválido".

**How to avoid:** Tests exhaustivos del validator extendido (cobertura en Pattern 6 — al menos un negative test por cada campo requerido: `prompt` no string, `answer` no array, `answer` con token vacío, `distractors` con entrada no-string, `pairs` no array, `pairs` con tuple corto, `pairs` con string en lugar de tuple, `pairs` con N=1 (< 2), `pairs` con N=11 (> 10), etc.).

**Warning signs:**
- Recargar la app con JSON malformado no muestra banner — la app crashea con TypeError oscuro.
- El banner muestra un error genérico ("type no soportado") en vez del problema real ("pairs[1] no es tuple de 2 strings").

### Pitfall 7: Lectura de `payload.answer.join(' ')` sin null-check en feedback fallo

**What goes wrong:** El template muestra `Respuesta correcta: <strong x-text="sessionCurrentExercise.payload.answer.join(' ')"></strong>` con `x-show="sessionFeedback === 'incorrect'"`. Durante el tick de unmount tras `sessionAdvance`, Alpine evalúa `sessionFeedback` (es 'incorrect' brevemente) y intenta leer `payload.answer.join(' ')` en un ejercicio ya cambiado.

**Why it happens:** Double-defense Alpine es lección recurrente. La guard `&& sessionCurrentExercise` en el outer x-if cubre el caso `null`, pero un ejercicio del tipo equivocado (multi-choice) tiene `payload.answer === undefined`.

**How to avoid:** Mantener cada sub-template (`type === 'word-buttons'`) bien encapsulado dentro de su `<template x-if>` interior — los bindings que asumen `payload.answer` viven SOLO dentro del template del tipo correspondiente. Y SIEMPRE usar `?.`: `sessionCurrentExercise.payload?.answer?.join(' ')`.

**Warning signs:**
- TypeError "Cannot read properties of undefined (reading 'join')" en consola tras pasar de un word-buttons fallido al siguiente ejercicio.

### Pitfall 8: Foco visible NO al body — botones del banco roban focus tras click

**What goes wrong:** Tras un click con ratón en un botón del banco word-buttons, el botón conserva el focus. Si el siguiente ejercicio es del mismo tipo, el primer botón del nuevo banco hereda el focus visible. Si el usuario pulsa Space para algún propósito, no pasa lo esperado.

**Why it happens:** Comportamiento estándar del navegador con `<button>` — tras click, retiene focus hasta el siguiente Tab.

**How to avoid:** Tras cada interacción dentro del sub-template, hacer `event.currentTarget.blur()` opcional (no es estrictamente obligatorio; el listener global vive en window, así que las teclas se capturan independientemente del focus). Sin embargo, D-72 explícita "foco al body al montar/avanzar sesión" — implementación pragmática: tras `initSubStateForExercise`, ejecutar `document.activeElement?.blur()` (pero esto requiere acceso a `document` — anti layer purity). Alternativa: dejar el focus donde caiga; el handler global no depende del focus.

**Recomendación final:** NO intentar manipular focus programáticamente. El `@keydown.window` captura las teclas independientemente del focus. Si la a11y de Tab residual rompe algo en UAT, ajustar entonces.

**Warning signs:**
- Tras click en un botón del banco, Tab brinca a un sitio inesperado.
- El usuario reporta "pulsé Space y se activó un botón que no era el que veía".

## Code Examples

Verified patterns from official sources:

### Example 1: `@keydown.window` con switch sobre `event.key`

```html
<!-- Source: alpinejs.dev/directives/on (verified pattern) -->
<section x-data="{ onKey(e) { console.log(e.key); } }"
         @keydown.window="onKey($event)">
  Press any key
</section>
```

Aplicado a Phase 3:

```html
<template x-if="currentScreen === 'session' && sessionCurrentExercise">
  <section @keydown.window="handleSessionKey($event)">
    [contenido del session screen]
  </section>
</template>
```

### Example 2: `x-for` reactivo con array que mengua/crece

```html
<!-- Source: alpinejs.dev/directives/for -->
<div x-data="{ items: ['a', 'b', 'c'] }">
  <template x-for="(item, idx) in items" :key="item + '_' + idx">
    <button @click="items = items.filter((_, i) => i !== idx)" x-text="item"></button>
  </template>
</div>
```

Aplicado al banco word-buttons:

```html
<template x-for="(entry, idx) in bankWithKeys" :key="entry.word + '_' + idx">
  <button @click="wordButtonsAddWord(idx)" :aria-label="`Palabra ${entry.key}: ${entry.word}`">
    <span x-text="entry.word"></span><sup class="kbd-hint" x-text="entry.key"></sup>
  </button>
</template>
```

### Example 3: `@keyframes` CSS para parpadeo único (no loop) sin riesgo de seizure WCAG 2.3.1

```css
/* Source: UI-SPEC líneas 160-166 — verified WCAG-safe */
@keyframes match-flash-red {
  0%, 100% { background-color: transparent; }
  50%      { background-color: var(--pico-color-red-500, #d32f2f);
             border-color: var(--pico-color-red-600, #b71c1c);
             color: white; }
}
.match-flash {
  animation: match-flash-red 300ms ease-out 1;   /* "1" iteración única, NO loop */
}
```

Aplicado: la clase `.match-flash` se añade a los dos items (izq + der) durante 300ms; `setTimeout` la remueve y deshace la pareja.

### Example 4: `grade()` puro para match con consumo por índice

```js
// Source: pattern derivado de D-66 + algoritmo de búsqueda lineal con set de consumed
export const match = {
  grade(exercise, response) {
    const { pairs } = exercise.payload;
    const consumed = new Set(response.consumedPairIdx ?? []);
    const lwLower = (response.leftWord ?? '').toLowerCase();
    const rwLower = (response.rightWord ?? '').toLowerCase();
    for (let i = 0; i < pairs.length; i++) {
      if (consumed.has(i)) continue;
      const [pl, pr] = pairs[i];
      if (pl.toLowerCase() === lwLower && pr.toLowerCase() === rwLower) {
        return { correct: true, pairIdx: i };
      }
    }
    return { correct: false, pairIdx: null };
  }
};
```

## State of the Art

Phase 3 no introduce stack nuevo — extiende patrones de Phase 1+2. No hay "state of the art" relevante a flaggear porque todas las decisiones técnicas heredan de versiones pinned de Alpine y Pico.

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Validador con branch literal de tipo (`if (ex.type !== 'multiple-choice')`) | Dispatch table `PAYLOAD_VALIDATORS` por tipo | Phase 3 refactor (este plan) | Escala a 3 tipos sin tocar código de iteración; útil para Phase 5+ si añade un 4º tipo |
| Listener teclado manual con cleanup explícito (anti-pattern hipotético) | `@keydown.window` con cleanup automático Alpine | Phase 3 introducción | Sin riesgo de listener huérfano; menos código manual |
| Sub-templates por tipo en un mega-switch hardcoded | `<template x-if="type==='word-buttons'">` paralelos | Phase 3 introducción | Cada tipo es autocontenido; futuras adiciones (Phase 5+ tipo nuevo) no tocan los otros |

**Deprecated/outdated:** ninguno.

## Runtime State Inventory

**N/A** — Phase 3 NO es rename/refactor/migration. Es feature addition pura.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Alpine.js 3.15.12 implementa cleanup automático del listener `@keydown.window` al desmontar el elemento contenedor (incluyendo desmonte por `x-if` cambio de condición) | Pattern 9, Pattern 11 | Si falla, el listener sobrevive a la sesión y captura teclas en home/picker — bug visible en UAT inmediatamente. Mitigation: fallback a addEventListener manual con cleanup explícito en `destroy()`. |
| A2 | Alpine.js soporta key modifiers para dígitos (`@keydown.1`) y letras (`@keydown.a`) directamente | Standard Stack (alternativas consideradas) | Si falla, el patrón "un solo handler con switch sobre event.key" sigue funcionando; sólo perdemos la conveniencia opcional. NO bloquea Phase 3. |
| A3 | El usuario realmente quiere ergonomía agresiva de teclado (goal "sin ratón") y no objetará a usar 1-9/a-i en lugar de Tab+Enter | CONTEXT D-68..D-72 | Si tras UAT el autor encuentra los atajos incómodos, el deferred "letras a-z" o "Tab+Enter fallback" están listos. Riesgo BAJO — D-68..D-72 fueron decididas explícitamente en discuss. |
| A4 | El cap "Banco con >9 palabras visibles NO emite warning del schema validator (queda como recomendación Claude's discretion)" no genera fricción en Avere seed (12 ejercicios actuales) ni en Phase 4 (transcripción de 6 PDFs A1/A2 — frases típicamente cortas <8 tokens) | Claude's Discretion + deferred | Si emerge un ejercicio con 12+ palabras (frase larga A2), las posiciones 10+ son alcanzables solo por mouse — degradación graceful, no bloqueante. |
| A5 | `fisherYates(arr, rng)` ya está disponible o trivial de añadir en `src/domain/session.js` | Pattern 4 | Si no está, añadir el helper es ~6 LOC. Riesgo MINIMAL. |

**If this table is empty:** N/A — sí hay assumptions tagged. Todas son LOW risk salvo A1, que es el supuesto que más afecta a la implementación. A1 está respaldado por dos fuentes oficiales/comunidad (alpinejs.dev/essentials/events + GitHub discussion #1217) y el comportamiento ha sido reportado consistentemente.

## Open Questions

1. **¿`fisherYates` exportada de `src/domain/session.js`?**
   - **What we know:** Phase 2 implementa el shuffle del sampler con un Fisher-Yates seedable interno; no se sabe si está exportada como helper público o vive como función interna.
   - **What's unclear:** Si el planner quiere reusar el mismo RNG (D-62 explícito) para los shuffles de match (`matchLeft`/`matchRight`) y word-buttons banco, necesita acceso a `fisherYates(arr, rng)` desde `src/screens/app.js`.
   - **Recommendation:** El planner puede (a) exportar `fisherYates` desde `src/domain/session.js` si está allí, o (b) crear un helper privado en `src/screens/app.js` que delegue a `Math.random` (no determinista en runtime real — solo importa para tests). Para Phase 3 (no test crítico de shuffle determinista), `Math.random` directo es aceptable. La opción (a) es más limpia y testeable.

2. **¿`aria-live="polite"` sobre `.wb-answer` o no?**
   - **What we know:** UI-SPEC línea 318 lo recomienda como a11y nueva no cubierta por Phase 1/2.
   - **What's unclear:** Si el planner lo añade, los screen readers anuncian cada palabra añadida/quitada del área respuesta — útil para a11y total, pero costo bajo de implementación.
   - **Recommendation:** Añadir `aria-live="polite"` al `<div class="wb-answer">` — coste 0, beneficio a11y.

3. **¿Warning soft del schema validator cuando word-buttons tiene >9 palabras visibles?**
   - **What we know:** Claude's discretion + deferred. UI-SPEC línea 70/332 lo deja al planner como "recomendación no bloqueante".
   - **What's unclear:** Si añadir el warning ahora vs deferred a Phase 5.
   - **Recommendation:** NO añadir en Phase 3 (out of scope; el cap en 9 ya cubre el caso normal A1). Si Phase 4 transcribe un ejercicio A2 con frase larga, el banner del validator mostrará la advertencia de forma natural sin código extra (ej. añadiendo el warning a `validateWordButtonsPayload`).

## Environment Availability

> Skip — Phase 3 NO depende de nuevas herramientas/servicios externos. Stack idéntico a Phase 1+2 (Node 22.20 confirmado, Alpine + Pico vía CDN ya pinned, sin nuevas instalaciones).

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Tests con `node --test` | ✓ | v22.20.0 | — |
| `npx serve` | Dev local | ✓ (heredado Phase 1) | latest | VS Code Live Server |
| Navegador desktop (Chrome/Firefox) | UAT del autor | ✓ | n/a | — |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** none

## Security Domain

> `security_enforcement` no se ha configurado explícitamente como `false` en `.planning/config.json`; se trata como enabled por defecto. Sin embargo, Phase 3 es una app personal, local, sin red, sin auth, sin multi-usuario — la mayoría de ASVS no aplica. Solo V5 input validation es relevante.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | App personal sin login (PROJECT.md Out of Scope) |
| V3 Session Management | no | Sin sesión de usuario; "session" del proyecto es la ronda de ejercicios |
| V4 Access Control | no | Single user, single machine |
| V5 Input Validation | yes | **Hand-written validator** ya en sitio (Phase 1 D-08); Phase 3 extiende para los 2 nuevos tipos. Pattern 6 detalla la extensión |
| V6 Cryptography | no | Sin secretos, sin tokens, sin datos sensibles |

### Known Threat Patterns for vanilla Alpine + JSON content

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via JSON payload con HTML/script | Tampering (autor o JSON importado) | **`x-text` exclusivamente, jamás `x-html`** (T-02-01 ya en `index.html` líneas 56-58). Phase 3 mantiene la regla en los nuevos sub-templates. Render de `payload.answer.join(' ')` usa `x-text` con `<strong>` envolvente — el `<strong>` es markup ESTÁTICO del HTML, NO viene del JSON. Si el JSON contiene `<script>alert(1)</script>`, se renderiza como texto literal. |
| JSON malformado que corrompe state | Tampering | Schema validator extendido en `validateWordButtonsPayload` + `validateMatchPayload` rechaza con banner visible (CONT-05) ANTES de inicializar Alpine. Pattern 6 + Pitfall 6. |
| Self-XSS via copy-paste de JSON malicioso | Tampering (futuro: cuando exista import — Phase 4 BACK-05) | Phase 3 NO toca import. La defensa BACK-05 vivirá en Phase 4 (revalidar el JSON importado con el mismo validator). |
| Doble emisión accidental de eventos por listener huérfano | Repudiation (state mutado sin sesión activa) | `@keydown.window` cleanup automático Alpine (Pattern 11). Sin esto, las teclas pulsadas en home podrían disparar `sessionSelectOption` sobre un ejercicio que ya no existe. |

## Sources

### Primary (HIGH confidence)

- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` — D-56..D-72 locked decisions, integration points, code references
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-UI-SPEC.md` — design tokens, 5 estados word-buttons + 4 estados match, keyboard table, CSS classes (`.wb-bank`, `.wb-answer`, `.match-grid`, `.match-selected`, `.match-consumed`, `.match-flash`, `@keyframes match-flash-red`)
- `.planning/REQUIREMENTS.md` — EXTYPE-02, EXTYPE-03, SESSION-06
- `.planning/STATE.md` — Phase 2 lessons (Promise-handoff Alpine init, x-if double-defense, layer purity)
- `.planning/research/ARCHITECTURE.md` — registry pattern, layer purity contracts, write-once-at-session-end
- `.planning/research/PITFALLS.md` — UI-grades-the-answer anti-pattern, NFC normalization, JSON schema gotchas
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — D-01..D-23 schema, registry, validator
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — D-24..D-55 appShell plano, D-54 cascada inmediata
- `src/exercise-types/index.js`, `src/exercise-types/multiple-choice.js` — patrón canónico `grade()`
- `src/data/schema-validator.js` líneas 84-127 — punto exacto del refactor
- `src/screens/app.js` líneas 60-805 — factory plano completo, helper `applyImmediateFailure` invocation, `cancelAutoAdvance` pattern
- `src/domain/progress.js` líneas 296-334 — `applyImmediateFailure` ya implementado, sin cambios necesarios
- `index.html` líneas 226-256 — sub-template session screen existente (patrón a extender)
- `styles.css` líneas 86-97 — `.button-row` patrón a reusar; clases `.correcta`/`.incorrecta` reusables literal

### Secondary (MEDIUM confidence)

- [Alpine.js Events docs](https://alpinejs.dev/essentials/events) — `.window` modifier behavior, cleanup automation
- [Alpine.js On directive docs](https://alpinejs.dev/directives/on) — keyboard modifier syntax (`.enter`, `.space`, `.backspace`, dígitos, letras)
- [Alpine.js For directive docs](https://alpinejs.dev/directives/for) — `x-for` reactividad con arrays que menguan/crecen, `:key` mejores prácticas
- [Alpine.js Lifecycle docs](https://alpinejs.dev/essentials/lifecycle) — `init()` y `destroy()` hooks
- [Alpine.js Keyboard Modifiers community guide](https://akbargherbal.github.io/alpinejs-basics/pages/03/12/092/index.html) — lista exhaustiva de modifiers de teclado incluyendo digit y letter keys directos

### Tertiary (LOW confidence — verificadas con sources oficiales para subir a MEDIUM)

- [GitHub Discussion #1217 — alpinejs/alpine "Anything like x-unmount"](https://github.com/alpinejs/alpine/discussions/1217) — confirmación de `destroy()` método como inverso de `init()` para cleanup de event listeners
- [GitHub Discussion #4392 — alpinejs/alpine "keydown with window not working"](https://github.com/alpinejs/alpine/discussions/4392) — confirmación de que `@keydown.window` requiere `x-data` en el elemento (no hay riesgo para Phase 3, el `<section>` está dentro del `appShell` x-data)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — sin cambios respecto a Phase 1+2 ya validados (Alpine 3.15.12 + Pico 2.1.1 + ES modules + localStorage + Node 22 test runner). Verificado vía `index.html` líneas 9-30 y `package.json` ausente (D-23 explícito).
- Architecture patterns: HIGH — derivados de Phase 1+2 patterns ya operativos (registry, factory plano, double-defense Alpine, cascada inmediata D-54). Los nuevos sub-templates extienden el patrón existente sin alterar la arquitectura.
- Pitfalls: HIGH — heredados de Phase 1+2 (UI grades, double-defense, write-once-at-session-end, NFC) + 3 pitfalls específicos de Phase 3 (`@keydown.window` huérfano si NO usar Alpine, `applyImmediateFailure` doble en match, `cancelMatchFlash` olvidado).
- Code examples: HIGH — los snippets están alineados con código existente verificado (`src/exercise-types/multiple-choice.js`, `src/screens/app.js`).
- Keyboard handling: MEDIUM-HIGH — el comportamiento `@keydown.window` está documentado en sources oficiales Y testeable trivialmente en el UAT (basta con un test manual de "pulsa 1 en home tras sesión, no debe pasar nada").

**Research date:** 2026-05-23
**Valid until:** 2026-06-22 (30 días — stack estable, Alpine/Pico pinned, sin previstos breaking changes)
