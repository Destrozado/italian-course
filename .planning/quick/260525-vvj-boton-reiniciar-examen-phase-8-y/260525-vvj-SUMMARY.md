---
quick_id: 260525-vvj
type: execute
status: complete
prior_status: shipped
completed: 2026-05-25
duration_min: ~15
files_modified:
  - src/screens/app.js
  - index.html
  - tests/screen-examen.test.js
requirements_completed:
  - PHASE-8.Y-RESTART-EXAMEN
tests_before: 223
tests_after: 230
tests_delta: +7
commits:
  - hash: TBD-orchestrator
    type: feat
    files: 3
roadmap_audit:
  source: .planning/milestones/v1.0-ROADMAP.md
  cite: "Phase 8.y backlog item (post-v1.0) — botón 'Reiniciar ejercicios' extendido a modo Examen"
human_verification: deferred
---

# Quick 260525-vvj: Botón "Reiniciar ejercicios" extendido a Modo Examen (Phase 8.y) — Summary

## One-liner

Dual-mode dispatch en `restartRepaso()`: el botón "Reiniciar ejercicios" de la pantalla session ahora funciona también en modo Examen (`sessionMode === 'test-completo'`), invocando `buildFullTest([catId]) + persistInFlightTest()` (D-182), preservando el comportamiento Phase 6 D-100 en rama Repaso intacto.

## Phase 8.y closure

- **Backlog item:** Phase 8.y del ROADMAP (post-v1.0) — "El botón Reiniciar ejercicios de la pantalla session aparece solo en Repaso; el autor lo echa en falta también cuando quiere repetir un Examen de la misma categoría sin volver al home".
- **Status:** Shipped via quick 260525-vvj (2026-05-25).
- **Cierre formal del backlog** — el ROADMAP se actualiza en el docs commit del orchestrator.

## Cambios (3 archivos, 1 commit atómico)

### A) `src/screens/app.js` — `restartRepaso()` líneas 685+ (extendido)

- **Guard extendido (línea 689):** `if (this.sessionMode !== 'repaso' && this.sessionMode !== 'test-completo') return;` (antes solo `!== 'repaso'`).
- **Dispatch dual-mode (líneas 696-718):**
  - Rama `'test-completo'`: guard defensivo `if (this.pickerCheckedCategoryIds.length === 0) return;` + `const catId = this.pickerCheckedCategoryIds[0]` + `result = buildFullTest([catId], allExercises);` (sin rng explícito — coherente con `_launchExamen` línea 379).
  - Rama `'repaso'`: `result = buildSession(...)` con los mismos parámetros que antes (regresión cero).
- **Reset SUPERSET de sub-estado intacto** (líneas 727-757) — reusable por ambas ramas sin cambios.
- **Persistencia condicional al final (líneas 768-777):** `if (this.sessionMode === 'test-completo') { this.persistInFlightTest(); }` (D-182 slot único — el nuevo orden de `exerciseIds` sobreescribe el `inFlightTest` anterior; Repaso nunca persiste — SESSION-08 intacto).
- **JSDoc completo actualizado (líneas 620-684)** documentando Phase 8.y dual-mode + por qué el método se mantiene como `restartRepaso` (nombre histórico — preserva el binding `@click` y los presence-checks Phase 6 sin churn).
- **NO renombrar el método.** NO confirmación inline (D-102 coherente). NO refactor a helper compartido con `_launchExamen` (CONTEXT D-104 "duplicación aceptable v1; refactor solo si emerge 3er call-site"; seguimos en 2 call-sites del patrón buildFullTest+reset+persist).

### B) `index.html` — botón "Reiniciar ejercicios" (línea ~488-494)

- **`x-show` extendido:** `x-show="sessionMode === 'repaso' || sessionMode === 'test-completo'"` (antes solo `=== 'repaso'`).
- **Comentario HTML (líneas 470-487) actualizado** mencionando Phase 8.y dual-mode + recordatorio T-02-01 anti-XSS (texto hardcoded).
- **Texto del botón se mantiene LITERAL hardcoded `Reiniciar ejercicios`** — NO se introduce `x-text=` dinámico (T-02-01 invariante anti-XSS preservado). La copy genérica funciona para ambos modos.

### C) `tests/screen-examen.test.js` — nuevo describe block (al final)

- Nuevo `describe('appShell.restartRepaso — Phase 8.y dual-mode extension', ...)` con **7 sub-tests presence-check** (A..G):
  - **A** — `restartRepaso` definido (anchor).
  - **B** — guard menciona literal `'test-completo'` Y `'repaso'`.
  - **C** — cuerpo invoca `buildFullTest([` Y `buildSession(`.
  - **D** — cuerpo invoca `this.persistInFlightTest()` (rama Examen, D-182).
  - **E** — `index.html` contiene literal `sessionMode === 'repaso' || sessionMode === 'test-completo'`.
  - **F** — botón sigue con texto literal `>Reiniciar ejercicios<` (T-02-01 invariante).
  - **G** — `buildFullTest(` aparece ≥2 veces en `app.js` (consolidación call-sites).
- **Patrón de slicing mejorado:** la ventana de inspección busca el siguiente `\n    /**` (JSDoc del método siguiente) para acotar el cuerpo, en vez de un fixed slice de 3000 chars (ajuste hecho porque el método extendido es ~100 líneas).
- **Describe block Phase 8 existente intacto** — sus 7 sub-tests baseline siguen verdes.

## Tests

| Estado | Count |
|--------|-------|
| Baseline (pre-quick) | 223 verdes |
| Post-quick (after Phase 8.y) | 230 verdes |
| Delta | +7 sub-tests nuevos (presence-check dual-mode) |
| Fallos | 0 |

Comando: `node --test tests/*.test.js` → exit 0, 230 pass, 0 fail, 0 skip.

## Verificación manual

- `grep -c "buildFullTest" src/screens/app.js` → **12** (≥2 — incluye JSDoc references + 3 call-sites reales: `_launchExamen`, `startSession`, `restartRepaso`).
- `grep -c "sessionMode === 'test-completo'" index.html` → **1** (el `x-show` del botón Reiniciar — no había otros usos en `index.html`).
- `grep "x-text" index.html | grep -i "reiniciar"` → **vacío** (T-02-01 invariante preservado).

## Verificación humana

**Diferida** — los 7 nuevos tests presence-check anclan el feature estructuralmente (guard, dispatch, persistInFlightTest, x-show, copy literal, count de call-sites). Verificación humana opcional sign-off del autor con `npx serve`:

1. Lanzar Examen de cualquier categoría desde la home.
2. En pantalla session, click "Reiniciar ejercicios".
3. La sesión rehace el orden de la MISMA categoría sin volver al home; `sessionMode` sigue siendo `'test-completo'`.
4. DevTools → Application → Local Storage `italianCourse.v1` → `inFlightTest.exerciseIds` cambia (D-182 re-persistencia).
5. Regresión Repaso: lanzar Repaso desde el picker, click "Reiniciar ejercicios" → rehace los 20 sin tocar `localStorage` (verificar `lastBackupAt` / `firstUsedAt` intactos).

## Audit trail — citas del ROADMAP

> *(.planning/milestones/v1.0-ROADMAP.md líneas 327-329, item Phase 8.y backlog)*
> El botón "Reiniciar ejercicios" de la pantalla session aparece solo cuando `sessionMode === 'repaso'` (Phase 6 D-100). En modo Examen está oculto. El autor lo echa en falta cuando quiere repetir un Examen de la misma categoría sin volver al home.

**Cerrado en este quick:** el botón ahora aparece en ambos modos y dispatcha internamente al sampler correcto + re-persiste `inFlightTest` cuando es Examen.

## Decisions tomadas (inline)

| ID | Decisión | Razón |
|----|----------|-------|
| D-8y-1 | Mantener nombre `restartRepaso` (no renombrar a `restartCurrentSession`) | Preservar binding `@click="restartRepaso"` + presence-checks Phase 6 sin churn. Nombre histórico, JSDoc clarifica el dual-mode. Refactor diferible. |
| D-8y-2 | Texto del botón hardcoded "Reiniciar ejercicios" genérico para ambos modos (NO `x-text` dinámico) | T-02-01 anti-XSS invariante. La copy es genérica y funciona en ambos modos sin generar fricción cognitiva. |
| D-8y-3 | `pickerCheckedCategoryIds.length === 0` → no-op temprano en rama Examen | Defensa contra state corrupto. El path normal del Examen siempre tiene `[catId]` desde `_launchExamen`; el guard inline evita `[undefined]` a `buildFullTest`. |
| D-8y-4 | `persistInFlightTest()` invocado SOLO en rama Examen | D-182 slot único — Examen siempre persiste; Repaso nunca (SESSION-08 intacto). Coherente con `_launchExamen` línea 420. |
| D-8y-5 | Cero migración schemaVersion | El shape de `inFlightTest` es idéntico (D-192 inherited). El `persistInFlightTest()` existente lo escribe directo sin transformación. |
| D-8y-6 | Cero refactor a helper compartido con `_launchExamen` | CONTEXT D-104 "duplicación aceptable v1; refactor solo si emerge 3er call-site". Seguimos en 2 call-sites del patrón buildFullTest+reset+persist. |

## Files

**Modified (3):**
- `src/screens/app.js` — `restartRepaso` extendido a dual-mode dispatch.
- `index.html` — `x-show` del botón Reiniciar extendido + comentario HTML actualizado.
- `tests/screen-examen.test.js` — nuevo describe block Phase 8.y con 7 sub-tests presence-check.

**Generated (1):**
- `.planning/quick/260525-vvj-boton-reiniciar-examen-phase-8-y/260525-vvj-SUMMARY.md` (este archivo).

## Self-Check: PASSED

- `src/screens/app.js` modified — guard, dispatch, persistInFlightTest verificado vía tests B/C/D verdes.
- `index.html` modified — x-show extendido verificado vía test E verde; texto hardcoded verificado vía test F verde.
- `tests/screen-examen.test.js` modified — nuevo describe block con 7 sub-tests verdes (A..G).
- `node --test tests/*.test.js` → 230/230 verdes, exit 0.
- Cero cambios a otros archivos (`content/`, `src/domain/`, `src/data/`, `styles.css`, otros tests).

## Commit (atómico, código)

El orchestrator hará el commit del código (`feat(quick-260525-vvj): extender restartRepaso a modo Examen — Phase 8.y dual-mode`) tocando los 3 archivos modificados. El docs commit (este SUMMARY + STATE.md + ROADMAP.md) se hace separado por el orchestrator.

---

*Generated 2026-05-25 — Phase 8.y backlog cerrado. 230/230 tests verdes. T-02-01 invariante preservado.*
