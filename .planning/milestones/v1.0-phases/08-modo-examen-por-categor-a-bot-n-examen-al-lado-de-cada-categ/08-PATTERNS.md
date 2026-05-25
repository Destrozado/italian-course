# Phase 8: Modo Examen por categoría - Pattern Map

**Mapped:** 2026-05-25
**Files analyzed:** 4 source files + 2 audit-trail files
**Analogs found:** 4 / 4 (100% — todos los cambios son extensiones de patrones existentes)

> **Pattern reuse posture:** Phase 8 es UX puro sobre estructuras existentes — cero migración, cero módulos nuevos, cero clases CSS nuevas. Todos los cambios son extensiones inline de patrones consolidados en Phase 2 (`openPicker`/`requestConfirm`/`startSession`/`persistInFlightTest`/`categoriesForDisplay`) y Phase 6 (`restartRepaso` — precedente canónico de duplicación de bloque de reset desde `startSession`). El planner copia patrones LITERALES de las líneas referenciadas — no inventa.

---

## File Classification

| Archivo a modificar / crear | Role | Data flow | Analog más cercano | Quality |
|-----------------------------|------|-----------|--------------------|---------|
| `/home/vcompanyb/italian-course/src/screens/app.js` (modificar) | screen-controller (handler + computed) | event-driven (click → state mutation → screen transition) | `openPicker(mode)` + `startSession()` + `restartRepaso()` (mismo archivo) | exact |
| `/home/vcompanyb/italian-course/index.html` (modificar tabla home) | view template (Alpine bindings) | declarative render (`x-for` sobre `categoriesForDisplay`) | tabla home actual `<thead>/<tbody>` líneas 152-178 (mismo archivo) + botones `.button-row-prominent` líneas 144-148 | exact |
| `/home/vcompanyb/italian-course/styles.css` (PROBABLEMENTE sin cambios) | styling | n/a | UI-SPEC prescribe CERO CSS nuevo (Pico `secondary outline` cubre el botón); follow-up opcional post-UAT (~4 líneas comentadas) | n/a — no se toca |
| `/home/vcompanyb/italian-course/tests/screen-examen.test.js` (NUEVO, sugerido) o append a `screen-multi-choice-shuffle.test.js` | test (smoke + presence-check) | textual source inspection + domain unit test | `tests/exercise-types.test.js` líneas 736-793 (presence-check pattern) + `tests/domain-session.test.js` líneas 134-178 (`buildFullTest` unit tests) | exact |
| `/home/vcompanyb/italian-course/.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md` (audit-trail) | documentation | n/a | precedente: cierre Phase 7.2 (último plan/task de cada fase añade EXAM-01..05 + STATE.md bump) | exact (proceso interno) |

**Reusable assets (cero modificación):**
- `/home/vcompanyb/italian-course/src/domain/session.js` líneas 173-188 (`buildFullTest`) — invocado tal cual con `categoryIds=[catId]`.
- `/home/vcompanyb/italian-course/src/data/storage.js` (`saveState`) — invocado indirectamente vía `persistInFlightTest`/`clearInFlightTest`.

---

## Pattern Assignments

### 1. `src/screens/app.js` — añadir handler `startExamen(categoryId)` + extender `categoriesForDisplay`

**Analog 1 — conflict D-44 pattern from `openPicker`** (`src/screens/app.js:271-290`):

Clonar EXACTAMENTE este patrón en `startExamen` para el chequeo de `state.inFlightTest`:

```javascript
    openPicker(mode) {
      // D-44: conflicto si pulsa Test completo con uno in-flight pendiente.
      if (mode === 'test-completo' && this.state.inFlightTest) {
        this.requestConfirm({
          message: 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?',
          confirmLabel: 'Descartar y empezar',
          cancelLabel: 'Cancelar',
          onConfirm: () => {
            this.clearInFlightTest();
            this.pickerMode = mode;
            this.pickerCheckedCategoryIds = [];
            this.currentScreen = 'picker';
          }
        });
        return;
      }
      this.pickerMode = mode;
      this.pickerCheckedCategoryIds = []; // D-34
      this.currentScreen = 'picker';
    },
```

**Diferencias para `startExamen`:**
- El guard NO chequea `mode === 'test-completo'` — siempre chequea `this.state.inFlightTest` (porque Examen ES Test completo de 1 cat — D-189).
- El `onConfirm` NO va al picker — invoca directamente el bloque de lanzamiento (extracted helper `_launchExamen(catId)` o duplicado inline). El parámetro `catId` se captura por closure.
- **UI-SPEC literal copy del confirm (línea 221 del 08-UI-SPEC.md):** `'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?'` — IDÉNTICO al de `openPicker`. **No reinventar** la copy; reusarla 1:1 (consistencia textual entre las 6 call-sites).
- **confirmLabel:** el `openPicker` original usa `'Descartar y empezar'`. El UI-SPEC línea 222 prescribe `'Continuar'`. **Decisión del planner:** el patrón unificado de Phase 2 (D-27/D-43/D-44/D-76) usa `'Continuar'` o `'Descartar'`. Si la consistencia con `openPicker` mide más que el UI-SPEC strict, usar `'Descartar y empezar'`. Si la consistencia con D-27 mide más, usar `'Continuar'`. **PATTERNS.md no decide — el planner lo lockea.**

---

**Analog 2 — bloque de reset sub-estado from `startSession`** (`src/screens/app.js:439-484`):

Patrón canónico de construcción de sesión Test completo. Replicar en `_launchExamen(catId)` (o inline en `startExamen` post-confirm):

```javascript
    startSession() {
      const allExercises = Object.values(this.content.exerciseById);
      let result;
      if (this.pickerMode === 'repaso') {
        result = buildSession(...);
      } else if (this.pickerMode === 'test-completo') {
        result = buildFullTest(this.pickerCheckedCategoryIds, allExercises);
      } else {
        return;
      }

      // Reset session sub-estado.
      this.cancelAutoAdvance();
      this.sessionMode = this.pickerMode;
      this.sessionExerciseIds = result.exerciseIds;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;

      // Phase 3 plan 01: inicializar sub-estado del PRIMER ejercicio (si
      // hay alguno). En pool vacío `result.exerciseIds = []` y el getter
      // sessionCurrentExercise devuelve null defensivamente.
      if (result.exerciseIds.length > 0) {
        const firstEx = this.content.exerciseById[result.exerciseIds[0]];
        this.initSubStateForExercise(firstEx);
      }

      // D-41 / D-42 (Plan 02-04): primer write de inFlightTest para Test
      // completo. A partir de aquí cada respuesta y cada advance lo
      // re-escribirán. [...]
      if (this.pickerMode === 'test-completo') {
        this.persistInFlightTest();
      }

      this.currentScreen = 'session';
    },
```

**Diferencias para `startExamen` / `_launchExamen(catId)`:**
- NO consulta `pickerMode` (Examen salta el picker). Llama directamente `buildFullTest([catId], allExercises)`.
- `sessionMode` se setea a `'test-completo'` LITERAL (D-189), NO `this.pickerMode`.
- **Crítico — preservar `pickerCheckedCategoryIds`:** `persistInFlightTest` lee `this.pickerCheckedCategoryIds` para los `categoryIds`. Si `pickerCheckedCategoryIds` está vacío, cae al fallback `prev?.categoryIds` (línea 627-629). **Para Examen el planner DEBE setear `this.pickerCheckedCategoryIds = [catId]` ANTES de invocar `persistInFlightTest()`** — de lo contrario el reanudar del banner Test completo a medias usaría las cats del Test anterior. Este es un **pitfall sutil**: replicar línea por línea sin entender esta dependencia puede romper resume.
- `persistInFlightTest()` se invoca SIEMPRE (Examen siempre persiste — D-182 slot único compartido). No es condicional como en `startSession` (que solo persiste cuando `pickerMode === 'test-completo'`).

---

**Analog 3 — duplicación de reset desde `startSession` ya establecida by `restartRepaso`** (`src/screens/app.js:531-594`):

Precedente Phase 6 D-104 — el patrón "duplicar el bloque de reset sin refactor a helper común" YA está aceptado. Excerpta del bloque completo de reset que `restartRepaso` duplica:

```javascript
    restartRepaso() {
      // D-100 / D-104: guard defensivo — solo aplica a Repaso 20.
      if (this.sessionMode !== 'repaso') return;

      // Pattern S-2: cancelar timeouts antes de cualquier reset.
      this.cancelAutoAdvance();
      this.cancelMatchFlash();

      // Re-llamar buildSession con MISMAS categorías + state actual (post-D-54).
      const allExercises = Object.values(this.content.exerciseById);
      const result = buildSession(...);

      // Reset sub-estado de sesión (idéntico al patrón de startSession).
      // [...]
      this.sessionExerciseIds = result.exerciseIds;
      this.sessionCursor = 0;
      this.sessionResults = [];
      this.sessionSelectedIndex = null;
      this.sessionFeedback = null;
      // Sub-estados word-buttons (Phase 3).
      this.wordButtonsBank = [];
      this.wordButtonsAnswer = [];
      // Sub-estados match (Phase 3).
      this.matchLeft = [];
      this.matchRight = [];
      this.matchSelectedLeftIdx = null;
      this.matchPairsConsumed = [];
      this.matchHadFailure = false;
      // Phase 6 plan 02 (D-107 + D-112): [...] reset matchFirstWrongPair
      this.matchFirstWrongPair = null;
      // WR-02 defensa explícita: [...]
      this.matchFlashIdx = null;
      this.matchFlashHandle = null;

      // Inicializar sub-estado del PRIMER ejercicio del nuevo sample.
      if (result.exerciseIds.length > 0) {
        const firstEx = this.content.exerciseById[result.exerciseIds[0]];
        this.initSubStateForExercise(firstEx);
      }
    },
```

**Por qué `restartRepaso` es el mejor analog (no solo `startSession`):**
- `restartRepaso` muestra el **superset completo** de sub-estados que deben resetearse (incluyendo todos los `match*` y `wordButtons*` y `matchFlash*`). El bloque de `startSession` (líneas 458-465) es más corto — está incompleto porque `startSession` corre antes de que `initSubStateForExercise` haya tocado los sub-estados de word-buttons/match. **Para `startExamen` lanzado desde home (donde puede venir de cualquier estado previo, incluso un `resumeInFlightTest` abandonado mid-match), el reset completo es necesario** — usar el set de `restartRepaso` línea-por-línea, no el set de `startSession` (sub-completo).
- Precedente D-104 explícito: "duplicación aceptable v1; refactor solo si emerge 3er-4to call-site". `startExamen` sería el 3er call-site del patrón. **El planner decide** si extrae helper `_resetSessionSubState()` AHORA (3er site) o difiere AL 4to. CONTEXT.md sugiere diferir; el PATTERNS.md respeta esa sugerencia.

---

**Analog 4 — extender `categoriesForDisplay` computed** (`src/screens/app.js:1949-1977`):

Patrón de enriquecimiento del `.map()` que la tabla home consume vía `x-for`. Aquí está el bloque íntegro:

```javascript
    get categoriesForDisplay() {
      if (!this.content || !this.state) return [];
      const today = todayLocal();
      const exercisesByCat = {};
      for (const ex of Object.values(this.content.exerciseById ?? {})) {
        for (const cid of ex.categoryIds ?? []) {
          (exercisesByCat[cid] ??= []).push(ex.id);
        }
      }

      return this.content.categories.map(cat => {
        const progress = this.state.categoryProgress?.[cat.id];
        const status = progress?.status ?? 'no-hecha';
        const streak = progress?.streakDays ?? 0;
        const lastPracticedDate = progress?.lastPracticedDate;
        return {
          id: cat.id,
          name: cat.name,
          status,
          badgeGlyph: badgeGlyphFor(status),
          statusLabel: statusLabelFor(status),
          streakLabel: formatStreak(streak, status),
          totalCount: (exercisesByCat[cat.id] ?? []).length,
          lastPracticedLabel: formatRelativeDate(lastPracticedDate, today)
        };
      });
    }
```

**Extensión Phase 8:** añadir 2 campos derivados al objeto retornado por `.map()` — sin recomputar `exercisesByCat` (ya construido líneas 1952-1957):

```javascript
        // [...] dentro del .map((cat) => {...})
        const totalCount = (exercisesByCat[cat.id] ?? []).length;
        const examenEnabled = totalCount > 0;
        return {
          id: cat.id,
          name: cat.name,
          status,
          badgeGlyph: badgeGlyphFor(status),
          statusLabel: statusLabelFor(status),
          streakLabel: formatStreak(streak, status),
          totalCount,
          lastPracticedLabel: formatRelativeDate(lastPracticedDate, today),
          examenEnabled,
          examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría'
        };
```

**Detalles críticos:**
- `examenEnabled` se deriva de `totalCount > 0`, NO de `cat.status` — UI-SPEC línea 100: cats `hecha`/`dominada` siguen enabled normal (D-187).
- `examenTooltip` es string vacío cuando enabled (UI-SPEC línea 141: "sin tooltip cuando enabled").
- Mantener reactividad: el getter ya es reactivo sobre `this.content` + `this.state`; los 2 campos nuevos heredan reactividad automáticamente.

---

**Analog 5 — imports** (`src/screens/app.js:60-65`):

`buildFullTest` ya está importado en línea 60:

```javascript
import { buildSession, buildFullTest, fisherYates } from '../domain/session.js';
```

**Cero cambios al import block** — `buildFullTest` se reusa sin tocar.

---

### 2. `index.html` — añadir 6ª columna `Examen` a la tabla home

**Analog 1 — estructura actual de la tabla home** (`index.html:151-178`):

```html
          <!-- Tabla densa (D-29) con 5 columnas exactas. -->
          <figure>
            <table>
              <thead>
                <tr>
                  <th scope="col">Estado</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">Racha</th>
                  <th scope="col">Ejercicios</th>
                  <th scope="col">Última vez</th>
                </tr>
              </thead>
              <tbody>
                <template x-for="cat in categoriesForDisplay" :key="cat.id">
                  <tr>
                    <td>
                      <span :class="`badge-${cat.status}`"
                            :aria-label="cat.statusLabel"
                            x-text="cat.badgeGlyph"></span>
                    </td>
                    <td x-text="cat.name"></td>
                    <td x-text="cat.streakLabel"></td>
                    <td x-text="cat.totalCount"></td>
                    <td x-text="cat.lastPracticedLabel"></td>
                  </tr>
                </template>
              </tbody>
            </table>
          </figure>
```

**Cambios prescritos (UI-SPEC §Component Inventory + Visual Wireframes):**

Insertar como 6ª columna al final del `<tr>` del `<thead>`:

```html
                  <th scope="col">Examen</th>
```

Insertar como 6ª `<td>` al final del `<tr>` dentro del `<template x-for>`:

```html
                    <td>
                      <button type="button"
                              class="secondary outline"
                              :disabled="!cat.examenEnabled"
                              :title="cat.examenTooltip"
                              @click="startExamen(cat.id)">Examen</button>
                    </td>
```

**Detalles críticos:**
- **El comentario `<!-- Tabla densa (D-29) con 5 columnas exactas. -->` línea 150 DEBE actualizarse** a "6 columnas exactas" para coherencia con el nuevo header (D-184). Pitfall: dejarlo en "5 columnas" cuando hay 6 deja un trap textual para futuros refactors.
- `scope="col"` es OBLIGATORIO en el nuevo `<th>` (igual que los 5 existentes — accesibilidad screen reader).
- `class="secondary outline"` (no `class="secondary"`) — UI-SPEC línea 115 lockea: nivel 3 de jerarquía visual.
- `type="button"` explícito — patrón consistente con todos los demás `<button>` del archivo (no auto-submit dentro de `<form>`, defensivo).
- `:disabled="!cat.examenEnabled"` y `:title="cat.examenTooltip"` son bindings reactivos Alpine — re-renderizan automáticamente cuando `categoriesForDisplay` recompute.
- `Examen` es texto literal HTML (T-02-01 invariante — NO `x-text` sobre contenido del JSON; el botón muestra label fijo).

---

**Analog 2 — patrón de botón `secondary` heredado** (`index.html:147` y `index.html:109`):

```html
            <button type="button" class="secondary" @click="currentScreen = 'backup'">Backup</button>
```

```html
                <button type="button" class="secondary" @click="discardInFlightTestWithConfirm">Descartar</button>
```

**Diferencia con el botón Examen:** estos usan `class="secondary"` sólido. El botón Examen usa `class="secondary outline"` — nivel 3 (más muted). UI-SPEC línea 115-127 justifica la diferencia (repetición × 7 filas — necesita densidad más baja).

---

### 3. `tests/screen-examen.test.js` (o append a archivo existente) — smoke tests del handler

**Decisión de archivo (Claude's discretion del planner):**
- **Opción A — archivo nuevo `tests/screen-examen.test.js`** (preferido). Coherente con la estructura: `tests/screen-multi-choice-shuffle.test.js` es per-feature. Phase 8 introduce su propio feature aislado.
- **Opción B — append a `tests/screen-multi-choice-shuffle.test.js`** (rechazado: ese archivo es estrictamente sobre el shuffle de multi-choice options, no sobre handlers de screen genéricos).

**Analog 1 — presence-check pattern** (`tests/exercise-types.test.js:736-793`):

```javascript
describe('appShell.matchPickRight — D-61 idempotencia (W3)', () => {
  function matchPickRightExists() {
    try {
      const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
      return src.includes('matchPickRight(');
    } catch {
      return false;
    }
  }

  const skipReason = matchPickRightExists()
    ? false
    : 'matchPickRight aún no existe en src/screens/app.js — [...]';

  test('guard `if (!this.matchHadFailure)` está presente antes del call-site de applyImmediateFailure en matchPickRight', { skip: skipReason }, () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    const mprIdx = src.indexOf('matchPickRight(');
    assert.ok(mprIdx > -1, 'matchPickRight debe existir en app.js');
    const tail = src.slice(mprIdx);
    const window = tail.slice(0, 4000);
    assert.match(window, /if \(!this\.matchHadFailure\)\s*\{/, /* [...] */);
    assert.match(window, /applyImmediateFailure\(this\.state/, /* [...] */);
  });

  test('el archivo src/screens/app.js contiene EXACTAMENTE 2 call-sites de applyImmediateFailure', { skip: skipReason }, () => {
    const src = readFileSync(new URL('../src/screens/app.js', import.meta.url), 'utf8');
    const matches = src.match(/applyImmediateFailure\(this\.state/g) || [];
    assert.equal(matches.length, 2, /* [...] */);
  });
});
```

**Aplicación a Phase 8** — tests que el planner debe escribir:

1. **Smoke presence: `startExamen` existe en `src/screens/app.js`.**
   - `assert.match(src, /startExamen\(/)`.

2. **Smoke presence: el handler invoca `buildFullTest`.**
   - Slice 3000-char window desde `src.indexOf('startExamen(')`; assert `/buildFullTest\(\[/` (o `/buildFullTest\(.*categoryId/`).

3. **Smoke presence: el handler chequea `state.inFlightTest` antes de lanzar (conflict D-44).**
   - Misma window; assert `/this\.state\.inFlightTest/` aparece ANTES de `buildFullTest`.

4. **Smoke presence: el handler invoca `requestConfirm` con la copy literal D-44 (6ª call-site).**
   - Misma window; assert `/Ya hay un Test completo en curso/`.

5. **Smoke presence: el handler setea `sessionMode = 'test-completo'`** (D-189):
   - Misma window; assert `/sessionMode\s*=\s*['"]test-completo['"]/`.

6. **Smoke presence: el handler invoca `persistInFlightTest()`** (D-182 slot único):
   - Misma window; assert `/persistInFlightTest\(\)/`.

7. **Smoke presence: el handler transiciona a `currentScreen = 'session'`:**
   - Misma window; assert `/currentScreen\s*=\s*['"]session['"]/`.

**Justificación del patrón presence-check (no behavioural):** `tests/exercise-types.test.js:739-754` lo documenta literalmente — "el factory `appShell` no es trivialmente instanciable bajo node sin Alpine (depende de getters reactivos y referencias al `content`/`state` ya cargados via Promise-handoff)". El gap residual lo cierra UAT humano. Phase 8 NO cambia este trade-off.

---

**Analog 2 — domain unit test (opcional, ya cubierto por D-53.4b)** (`tests/domain-session.test.js:134-178`):

```javascript
describe('domain/session — D-53.4b buildFullTest', () => {
  test('pool de 12 ejercicios en 2 categorías → devuelve los 12, todos únicos, determinista por seed', () => {
    /* [...] */
    const result = buildFullTest(['avere', 'genero'], exercises, seededLcg(42));
    assert.equal(result.actualSize, 12);
    /* [...] */
  });

  test('pool vacío (categoría sin ejercicios) → devuelve {exerciseIds:[], actualSize:0} sin throw', () => {
    const result = buildFullTest(['avere'], [], seededLcg(1));
    assert.equal(result.actualSize, 0);
    assert.deepEqual(result.exerciseIds, []);
  });

  test('buildFullTest filtra por categoryIds (excluye ejercicios de categorías ajenas)', () => {
    /* [...] */
    const result = buildFullTest(['avere'], exercises, seededLcg(123));
    assert.equal(result.actualSize, 2);
    assert.deepEqual([...result.exerciseIds].sort(), ['a1', 'a2']);
  });
});
```

**Aplicación a Phase 8:** `buildFullTest(['avere'], allExercises, rng)` con `categoryIds.length === 1` YA está cubierto por el test "filtra por categoryIds" (línea 167). **Cero tests nuevos a nivel dominio necesarios** — CONTEXT.md §Reusable Assets explícito.

---

**Analog 3 — imports + helpers de testing** (`tests/exercise-types.test.js:14-19`):

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
```

**Aplicación al nuevo `tests/screen-examen.test.js`:** imports idénticos. NO se necesita Alpine ni el factory `appShell` instanciado — todos los tests son presence-check sobre el source code.

---

### 4. `styles.css` — sin cambios (UI-SPEC línea 523 lockea: CERO CSS prescrito)

**Analog:** ninguno necesario. Pico CSS 2.1.1 cubre `<button class="secondary outline">` por defecto.

**Follow-up opcional post-UAT (UI-SPEC línea 534-551):** si emerge desalineación visual en la columna `Examen`, ~4 líneas dentro de un selector específico. **Diferido** — fuera del scope estricto del plan.

---

### 5. Audit trail — `.planning/PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`

**Patrón heredado de cierres de fase previas** (Phase 7.2 / Phase 6 — el último plan/task añade):
- `.planning/PROJECT.md`: nueva entrada `## Phase 8 — Modo Examen por categoría` con summary + D-181..D-192 + accept date.
- `.planning/REQUIREMENTS.md`: nueva subsección `### EXAM-01..05` con los 5 requisitos del CONTEXT §Phase Boundary.
- `.planning/ROADMAP.md`: marcar Phase 8 `✅ done`.
- `.planning/STATE.md`: actualizar test count baseline (199 → 199+N donde N es el count de smoke tests añadidos en `tests/screen-examen.test.js`).

**Sin analog específico de código** — proceso interno del workflow GSD. El planner lo localiza al último task.

---

## Shared Patterns (cross-cutting)

### Pattern S-A — Cancelaciones defensivas antes de reset (Pattern S-2 Phase 3)

**Source:** `src/screens/app.js:339-341` (`resetSession`), `src/screens/app.js:536-537` (`restartRepaso`), `src/screens/app.js:458` (`startSession`).

**Excerpt canónico:**
```javascript
      // Pattern S-2: cancelar timeouts antes de cualquier reset.
      this.cancelAutoAdvance();
      this.cancelMatchFlash();
```

**Apply to:** El bloque de `startExamen` / `_launchExamen(catId)` ANTES del reset de sub-estados. **Pitfall #5 del CONTEXT** — un `setTimeout` pendiente puede disparar `sessionAdvance` sobre state ya reseteado y crashear. `restartRepaso` lo aplica (línea 536-537); `startSession` solo aplica `cancelAutoAdvance` (línea 458) — el match flash no se cancela en `startSession` porque viene del picker (sin match activo previo). **Para `startExamen`** lanzado desde home con un Test completo en curso (path conflict D-44), el match flash PUEDE estar activo si el Test previo era mid-match. **Usar el set completo de `restartRepaso`** (`cancelAutoAdvance` + `cancelMatchFlash`), no el subset de `startSession`.

---

### Pattern S-B — `requestConfirm` 6ª call-site (D-44 pattern unificado)

**Source:** `src/screens/app.js:388-396` (`requestConfirm`); 5 call-sites previas: líneas 274 (`openPicker` D-44), 309 (`requestReturnToHome` D-27), 667 (`resumeInFlightTest`), 718 (`discardInFlightTestWithConfirm` D-43), 854 (`importBackup` D-76).

**Excerpt del helper (sin cambios):**
```javascript
    requestConfirm(opts) {
      this.confirmDialog = {
        message: opts.message,
        confirmLabel: opts.confirmLabel,
        cancelLabel: opts.cancelLabel ?? 'Cancelar',
        onConfirm: opts.onConfirm,
        onCancel: opts.onCancel ?? null
      };
    },
```

**Apply to:** `startExamen` cuando `this.state.inFlightTest !== null`. La firma del helper NO se toca. Las 6 call-sites comparten copy patrón "¿[Verbo]?":
- D-27: `'¿Descartar esta sesión de repaso? Tus respuestas no se guardarán.'`
- D-43: `'¿Descartar el test? Los aciertos hasta ahora no se guardarán.'`
- D-44 (openPicker): `'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?'`
- D-44 (resumeInFlightTest stale): `'El test que tenías a medias ya no es válido [...] ¿Descartarlo?'`
- D-76 (import backup): copy más larga, multi-párrafo.
- **Phase 8 / Examen (6ª):** UI-SPEC línea 221 — `'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?'` — **literal idéntico al openPicker D-44** (D-183 hereda la copy genérica; el usuario no necesita saber si el inFlightTest activo era Examen o Test regular).

**ConfirmLabel — divergencia detectada:**
- `openPicker` (línea 276): `'Descartar y empezar'`.
- UI-SPEC línea 222 prescribe: `'Continuar'`.
- **Planner debe lockear una opción.** PATTERNS.md sugiere `'Descartar y empezar'` por consistencia con el call-site D-44 más cercano (openPicker), pero el planner pesa contra UI-SPEC y decide. Si elige `'Continuar'`, **considerar abrir el follow-up de homogeneizar las 6 call-sites** (out of scope Phase 8 — capturado en deferred).

---

### Pattern S-C — Persistencia `inFlightTest` (D-41/D-42/D-182 slot único)

**Source:** `src/screens/app.js:625-646` (`persistInFlightTest`), `src/screens/app.js:708-711` (`clearInFlightTest`).

**Excerpt clave:**
```javascript
    persistInFlightTest() {
      const prev = this.state.inFlightTest;
      const categoryIds = this.pickerCheckedCategoryIds.length > 0
        ? [...this.pickerCheckedCategoryIds]
        : (prev?.categoryIds ?? []);
      // [...]
      this.state = {
        ...this.state,
        firstUsedAt: this.state.firstUsedAt ?? new Date().toISOString(),
        inFlightTest: {
          categoryIds,
          exerciseIds: [...this.sessionExerciseIds],
          cursor: this.sessionCursor,
          answers: [...this.sessionResults],
          startedAt: prev?.startedAt ?? Date.now()
        }
      };
      saveState(this.state);
    },
```

**Apply to:** `startExamen` después de setear `sessionExerciseIds`, `sessionCursor=0`, `sessionResults=[]`. **CRÍTICO — D-192 cero migración schemaVersion:** el shape de `inFlightTest` NO cambia. Examen escribe el mismo shape que un Test completo regular. El banner reanudar (`inFlightTestProgress` getter, líneas 1801+) NO distingue.

**Pitfall sutil** (ver Pattern Assignments §1 Analog 2): el planner DEBE setear `this.pickerCheckedCategoryIds = [catId]` ANTES de llamar `persistInFlightTest()`. Si no lo hace, la rama del fallback `prev?.categoryIds` capturaría las cats del Test anterior — el reanudar lanzaría buildFullTest sobre las cats incorrectas.

---

### Pattern S-D — Reactividad Alpine sobre computed getter (D-29)

**Source:** `src/screens/app.js:1949` (`categoriesForDisplay` getter).

**Pattern:** un getter reactivo `get categoriesForDisplay()` que itera `this.content.categories` y enriquece cada item con campos derivados de `this.state.categoryProgress`. Cualquier mutación de `this.content` o `this.state` triggerea recompute automático (Alpine MutationObserver + Proxy).

**Apply to:** los nuevos campos `examenEnabled` + `examenTooltip` se añaden DENTRO del `.map()` existente. **No crear un computed separado** (`get examenEnabledByCatId()` etc.) — sobre-engineering; consistency con el patrón establecido.

---

## No Analog Found

| Archivo | Razón |
|---------|-------|
| (ninguno) | Phase 8 NO introduce módulos nuevos, clases CSS nuevas, schema migrations, ni patrones arquitectónicos nuevos. Cero gaps. |

---

## Metadata

**Analog search scope:**
- `/home/vcompanyb/italian-course/src/screens/app.js` (líneas 60-65, 271-484, 531-594, 600-711, 1781-1804, 1949-1977 — secciones no solapadas).
- `/home/vcompanyb/italian-course/src/domain/session.js` (líneas 160-188).
- `/home/vcompanyb/italian-course/index.html` (líneas 85-178, 700-724).
- `/home/vcompanyb/italian-course/tests/screen-multi-choice-shuffle.test.js` (integral).
- `/home/vcompanyb/italian-course/tests/domain-session.test.js` (líneas 131-179).
- `/home/vcompanyb/italian-course/tests/exercise-types.test.js` (líneas 736-855).

**Files scanned:** 6 source + 3 test = 9 total. Total LOC scanned: ~700.

**Pattern extraction date:** 2026-05-25.

**Key cross-cutting decisions surfaced for planner:**
1. **`startExamen` vs `_launchExamen(catId)` separation** — UI-SPEC línea 277 deja la decisión al planner. PATTERNS.md sugiere extraer `_launchExamen(catId)` privado porque hay 2 call-sites (directo + onConfirm post-clearInFlightTest), pero el planner decide.
2. **ConfirmLabel: `'Descartar y empezar'` vs `'Continuar'`** — divergencia entre `openPicker` y UI-SPEC. Planner lockea.
3. **Reset set: usar el de `restartRepaso` completo (~12 campos), NO el de `startSession` (~5 campos)** — `startExamen` puede venir de mid-match (path conflict D-44 abandonado).
4. **`pickerCheckedCategoryIds = [catId]` ANTES de `persistInFlightTest`** — pitfall sutil del fallback `prev?.categoryIds`.
5. **Test file: nuevo `tests/screen-examen.test.js`** (preferido) vs append. Planner decide.
