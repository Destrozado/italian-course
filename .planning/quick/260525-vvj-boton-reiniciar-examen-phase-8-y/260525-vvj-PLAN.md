---
quick_id: 260525-vvj
type: execute
wave: 1
depends_on: []
files_modified:
  - src/screens/app.js
  - index.html
  - tests/screen-examen.test.js
autonomous: true
requirements: [PHASE-8.Y-RESTART-EXAMEN]
must_haves:
  truths:
    - "El botón 'Reiniciar ejercicios' aparece visible en pantalla session cuando sessionMode === 'test-completo' (modo Examen)."
    - "El botón sigue apareciendo en pantalla session cuando sessionMode === 'repaso' (comportamiento Phase 6 intacto, regresión cero)."
    - "Click sobre el botón en modo Examen reinicia el Test completo de la MISMA categoría (re-llama buildFullTest con [catId]) sin volver al home."
    - "Click sobre el botón en modo Repaso re-llama buildSession con las MISMAS categoryIds (comportamiento Phase 6 D-100 intacto)."
    - "Reinicio en modo Examen re-persiste inFlightTest con el nuevo orden (D-182 slot único — coherente con _launchExamen)."
    - "Los 209 tests previos siguen verdes y se añade ≥1 test de presencia que ancla el dual-mode dispatch en restartRepaso (o nombre nuevo si el planner renombra)."
  artifacts:
    - path: "src/screens/app.js"
      provides: "Handler restart con dispatch test-completo vs repaso + guard extendido."
      contains: "buildFullTest"
    - path: "index.html"
      provides: "Botón 'Reiniciar ejercicios' con x-show extendido a 'repaso' || 'test-completo'."
      contains: "sessionMode === 'test-completo'"
    - path: "tests/screen-examen.test.js"
      provides: "Smoke test presence-check que ancla la extensión Phase 8.y."
      contains: "restartRepaso"
  key_links:
    - from: "index.html (button x-show)"
      to: "appShell.restartRepaso (src/screens/app.js)"
      via: "@click handler"
      pattern: "@click=\"restartRepaso\""
    - from: "appShell.restartRepaso"
      to: "buildFullTest (src/domain/session.js)"
      via: "import + dispatch when sessionMode === 'test-completo'"
      pattern: "buildFullTest\\(\\["
    - from: "appShell.restartRepaso"
      to: "this.persistInFlightTest"
      via: "post-rebuild en rama test-completo (D-182 slot único)"
      pattern: "this\\.persistInFlightTest\\(\\)"
---

<objective>
Quick task Phase 8.y (backlog post-v1.0): extender el botón "Reiniciar ejercicios" de la pantalla session para que funcione TAMBIÉN en modo Examen (sessionMode === 'test-completo'), no solo en Repaso. El usuario lo echa en falta cuando quiere repetir un Examen de la misma categoría sin volver al home.

Hoy:
- `restartRepaso()` en `src/screens/app.js` líneas 665-728 tiene guard `if (this.sessionMode !== 'repaso') return;` (D-100 Phase 6).
- El botón en `index.html` línea 491 tiene `x-show="sessionMode === 'repaso'"` — oculto en Examen.
- Examen (Phase 8) entra a session con `sessionMode = 'test-completo'` literal (D-189) y persiste `inFlightTest` (D-182).

Cambio quirúrgico:
1. Extender el guard de `restartRepaso()` para aceptar ambos modos.
2. Bifurcar la rebuild: si `sessionMode === 'test-completo'` → `buildFullTest([this.pickerCheckedCategoryIds[0]], allExercises)` + `persistInFlightTest()` (igual que `_launchExamen` líneas 370-424); si `'repaso'` → flujo existente `buildSession(...)` SIN tocar localStorage.
3. Extender el `x-show` del botón en `index.html`.
4. Añadir 1 test de presencia en `tests/screen-examen.test.js` que valida el dispatch dual.

Cero migración schemaVersion (coherente con D-192). Cero CSS nuevo. Cero estado nuevo en factory. Copy del botón se mantiene literal "Reiniciar ejercicios" (genérica, sirve para ambos modos — no se introduce x-text dinámico que activaría riesgo T-02-01 anti-XSS).

Purpose: pulir la ergonomía del modo Examen reutilizando 1:1 el patrón Phase 6 `restartRepaso` ya validado en producción + el helper `_launchExamen` Phase 8 ya validado.

Output: 1 commit atómico tocando 3 archivos. 210/210 tests verdes (209 baseline + 1 nuevo presence-check).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/PROJECT.md
@./CLAUDE.md

<!-- Backlog item Phase 8.y de ROADMAP — lockea el scope. -->
@.planning/milestones/v1.0-ROADMAP.md

<!-- Pattern source para el dispatch test-completo: _launchExamen Phase 8 -->
@src/screens/app.js

<!-- Test file Phase 8 al que añadiremos el presence-check nuevo -->
@tests/screen-examen.test.js

<!-- Botón actual en HTML con x-show repaso-only -->
@index.html

<!-- Signature buildFullTest -->
@src/domain/session.js

<interfaces>
<!-- Contratos que el executor necesita sin explorar el codebase. -->

From src/domain/session.js (líneas 173-188):
```
export function buildFullTest(categoryIds, allExercises, rng = Math.random)
  → { exerciseIds: string[], actualSize: number }
```
- `categoryIds` es array (Examen pasa `[catId]`).
- Sin tope, sin weighted, sin guarantee. Fisher-Yates sobre el pool entero.

From src/screens/app.js — `_launchExamen(catId)` líneas 370-424 (PATRÓN A CLONAR para la rama test-completo del nuevo dispatch en restartRepaso):
- `cancelAutoAdvance() + cancelMatchFlash()` ANTES de cualquier reset (Pattern S-2).
- `buildFullTest([catId], allExercises)`.
- `this.sessionMode = 'test-completo'` (en restart: NO se toca — ya está seteado).
- `this.pickerCheckedCategoryIds = [catId]` ANTES de `persistInFlightTest()` (pitfall PATTERNS.md §1 Analog 2). En restart: pickerCheckedCategoryIds ya contiene `[catId]` (lo seteó _launchExamen al lanzar Examen) — pero validar inline.
- Reset SUPERSET completo de todos los sub-estados (sessionExerciseIds, sessionCursor, sessionResults, sessionSelectedIndex, sessionFeedback, wordButtons*, match*, matchFlash*).
- `initSubStateForExercise(firstEx)` si `result.exerciseIds.length > 0`.
- `persistInFlightTest()` AL FINAL (D-182 slot único, SIEMPRE persiste en Examen).
- NO se toca `currentScreen` (ya estamos en 'session').

From src/screens/app.js — `restartRepaso()` líneas 665-728 (PATRÓN BASE — el dispatch se mete dentro tras la cancelación):
- Guard `if (this.sessionMode !== 'repaso') return;` — extender a aceptar 'test-completo'.
- `buildSession(this.pickerCheckedCategoryIds, allExercises, this.state, 20, 'repaso')`.
- Reset idéntico al de _launchExamen excepto que NO se llama persistInFlightTest (Repaso nunca persiste — SESSION-08).
- NO toca currentScreen.

From src/screens/app.js — `persistInFlightTest()` (lee `this.pickerCheckedCategoryIds` con fallback a `prev?.categoryIds`):
- Re-validar que `pickerCheckedCategoryIds` está poblado antes del call. En restart Examen ya está `[catId]` desde el _launchExamen previo — pero un reset defensivo inline `this.pickerCheckedCategoryIds = [this.pickerCheckedCategoryIds[0]]` es no-op si ya está bien y blindaje si algo lo nuló.

From index.html línea 488-494 (button-row a modificar):
```
<div class="button-row">
  <button type="button"
          class="secondary"
          x-show="sessionMode === 'repaso'"
          @click="restartRepaso">Reiniciar ejercicios</button>
  <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
</div>
```
- Cambiar `x-show="sessionMode === 'repaso'"` a `x-show="sessionMode === 'repaso' || sessionMode === 'test-completo'"`.
- Texto del botón se mantiene literal `Reiniciar ejercicios` (hardcoded, NO x-text — T-02-01 invariante anti-XSS).
- Sin cambios al binding `@click="restartRepaso"` (mismo nombre — el handler ahora dispatcha internamente).

From tests/screen-examen.test.js — patrón de tests presence-check (lectura textual de source + windowed slicing):
- `describe('appShell.startExamen — Phase 8 D-181..D-192', () => { ... })`.
- Lectura textual `readFileSync(appJsPath, 'utf8')` + búsqueda con regex `^\s+methodName\(...\)\s*\{` para localizar la DEFINICIÓN del método (no JSDoc ni call-sites).
- Windowed slicing `appSrc.slice(idx, idx + 3000)` para inspeccionar el cuerpo del método.
- Aserts con `assert.ok` / `assert.match`.

Tests baseline: 223/223 verdes según constraints (209 Phase 8 + 14 nuevos R1+R2 smoke). Tras el quick: ≥224 (1 nuevo presence-check). STATE.md menciona 209 — la baseline real al ejecutar es la que reporte `node --test tests/*.test.js` en el momento de la ejecución; el target es "baseline+1 verde, cero regresiones".
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Extender restartRepaso para dual-mode dispatch + extender x-show + añadir presence-check</name>
  <files>src/screens/app.js, index.html, tests/screen-examen.test.js</files>
  <behavior>
    El test nuevo en `tests/screen-examen.test.js` (añadido AL FINAL del archivo, fuera del describe block existente o dentro de un describe block nuevo `'appShell.restartRepaso — Phase 8.y dual-mode'`) debe verificar:

    1. `restartRepaso()` está definido en `src/screens/app.js` (regex `^\s+restartRepaso\(\)\s*\{`).
    2. El cuerpo del método (ventana 3000 chars desde la definición) contiene un guard que acepta `'test-completo'` (regex que matchea `sessionMode !== 'repaso' && sessionMode !== 'test-completo'` O equivalente: dos referencias literales a `'test-completo'` Y `'repaso'` dentro del cuerpo del método).
    3. El cuerpo contiene una invocación a `buildFullTest(` (la rama nueva test-completo).
    4. El cuerpo contiene una invocación a `buildSession(` (la rama existente repaso, regresión-guard).
    5. El cuerpo contiene una invocación a `this.persistInFlightTest()` (rama test-completo, D-182).
    6. `index.html` contiene literalmente la cadena `sessionMode === 'repaso' || sessionMode === 'test-completo'` en el `x-show` del botón Reiniciar (lectura textual via readFileSync).
    7. El texto del botón sigue siendo el literal hardcoded `>Reiniciar ejercicios<` en `index.html` (NO `x-text=` adyacente — T-02-01 invariante anti-XSS).

    Caso edge defensivo (NO obligatorio en este test, pero coherente con el patrón _launchExamen): si `pickerCheckedCategoryIds.length === 0` en rama test-completo, el handler debe ser no-op (return temprano) en vez de explotar con `[undefined]` a `buildFullTest`. Verificable opcionalmente con un assert.match adicional, pero NO bloqueante — el path normal del Examen siempre tiene `pickerCheckedCategoryIds = [catId]` poblado desde `_launchExamen`.

    Test 8 (opcional bonus): contar call-sites de `buildFullTest(` en `src/screens/app.js` y verificar `>= 2` (uno en `_launchExamen`, otro nuevo en `restartRepaso`).
  </behavior>
  <action>
Implementación en 3 archivos, 1 commit atómico. Orden RED→GREEN sugerido: escribir el test nuevo primero (que debe fallar contra el código actual), luego implementar el cambio en `app.js` + `index.html` para que pase.

**A) src/screens/app.js — extender restartRepaso (líneas 665-728):**

1. Mantener nombre del método `restartRepaso` (NO renombrar). Justificación: el binding `@click="restartRepaso"` en `index.html` y los 1+ existentes presence-checks (si los hubiera) se preservan; el nombre es histórico pero el JSDoc se actualizará para reflejar el dual-mode. Renombrar a `restartCurrentSession` introduce churn en HTML + tests por cero ganancia funcional en un quick task — diferir a un refactor futuro si emerge.

2. Actualizar el bloque JSDoc completo (líneas ~620-664) para documentar el dual-mode. Mencionar Phase 8.y, sessionMode === 'test-completo' añadido, dispatch interno a buildFullTest, persistInFlightTest D-182 invocado en rama Examen, sigue sin tocar localStorage en rama Repaso (SESSION-08 intacto). Eliminar la afirmación obsoleta "Pickeable solo cuando sessionMode === 'repaso' (D-100)" — reemplazar con la condición dual.

3. Reemplazar el guard de línea 667:
   - Antes: `if (this.sessionMode !== 'repaso') return;`
   - Después: `if (this.sessionMode !== 'repaso' && this.sessionMode !== 'test-completo') return;`

4. Tras `cancelAutoAdvance()` + `cancelMatchFlash()` (líneas 670-671) y el cómputo de `allExercises` (línea 674), introducir el dispatch:
   - Si `this.sessionMode === 'test-completo'`:
     - Defensiva: si `this.pickerCheckedCategoryIds.length === 0` → return (no-op). Justificación: Examen siempre setea `[catId]` en `_launchExamen`; un array vacío indicaría state corrupto.
     - `const catId = this.pickerCheckedCategoryIds[0];` (Examen es 1-cat por D-181/D-189).
     - `result = buildFullTest([catId], allExercises);` (NO se pasa rng — usa default Math.random, coherente con `_launchExamen` línea 379).
   - Si `this.sessionMode === 'repaso'`:
     - Mantener el call existente `result = buildSession(this.pickerCheckedCategoryIds, allExercises, this.state, 20, 'repaso');` (líneas 675-681).

5. El bloque de reset de sub-estado (líneas 690-718) NO cambia — es el mismo SUPERSET completo que ya cubre word-buttons + match + matchFlash. Sigue siendo reusable para ambos modos.

6. Tras `initSubStateForExercise(firstEx)` (líneas 724-727), AÑADIR la persistencia inFlightTest SOLO en rama Examen:
   - Si `this.sessionMode === 'test-completo'`: `this.persistInFlightTest();` (D-182 slot único — Examen SIEMPRE persiste; coherente con `_launchExamen` línea 420 que también persiste al final).
   - Si `this.sessionMode === 'repaso'`: NO se invoca persistInFlightTest (Repaso nunca persiste — SESSION-08 intacto).

7. NO tocar `currentScreen` (ya estamos en 'session' en ambos casos).

8. NO tocar `sessionMode` (preservado — el guard ya lo validó, el modo NO cambia tras el restart).

9. NO tocar `pickerCheckedCategoryIds` (preservado: en rama Examen ya tiene `[catId]` desde el `_launchExamen` previo; en rama Repaso ya tiene las cats originales del picker).

**B) index.html — extender x-show del botón Reiniciar (líneas 488-494):**

1. Cambiar literalmente:
   - Antes: `x-show="sessionMode === 'repaso'"`
   - Después: `x-show="sessionMode === 'repaso' || sessionMode === 'test-completo'"`

2. Actualizar el comentario HTML de líneas 470-486 para reflejar Phase 8.y: añadir una línea breve indicando que el botón también aparece en sessionMode === 'test-completo' (Examen) y que el handler restartRepaso dispatcha internamente. Mantener el resto del comentario (D-100/D-103 referencias intactas).

3. Texto del botón se mantiene literal `Reiniciar ejercicios` — NO introducir `x-text=` dinámico para cambiar copy entre Repaso/Examen (T-02-01 invariante anti-XSS prescrito en constraints). La copy genérica funciona para ambos modos.

**C) tests/screen-examen.test.js — añadir presence-check (al final del archivo):**

1. Añadir AL FINAL del archivo (después del cierre del `describe` existente en línea 123) un nuevo `describe` block:
   - `describe('appShell.restartRepaso — Phase 8.y dual-mode extension', () => { ... })`.

2. Reutilizar el patrón de lectura textual + windowed slicing del describe existente:
   - `const appJsPath = new URL('../src/screens/app.js', import.meta.url);`
   - `const indexHtmlPath = new URL('../index.html', import.meta.url);`
   - `const appSrc = readFileSync(appJsPath, 'utf8');`
   - `const indexSrc = readFileSync(indexHtmlPath, 'utf8');`
   - `const restartIdx = appSrc.search(/^\s+restartRepaso\(\)\s*\{/m);`
   - `const restartWindow = restartIdx > -1 ? appSrc.slice(restartIdx, restartIdx + 3000) : '';`

3. Añadir como mínimo estos tests (≥4 sub-tests, espejo del estilo del describe block Phase 8 existente):
   - **Test A** (`restartRepaso definido en src/screens/app.js`): `assert.ok(restartIdx > -1, ...)`.
   - **Test B** (`guard acepta sessionMode test-completo`): `assert.match(restartWindow, /sessionMode\s*!==\s*['"]test-completo['"]/, ...)` o equivalente que confirme literal `'test-completo'` dentro de la ventana.
   - **Test C** (`dispatch a buildFullTest para Examen + buildSession para Repaso`): `assert.match(restartWindow, /buildFullTest\(\[/)` AND `assert.match(restartWindow, /buildSession\(/)`.
   - **Test D** (`persistInFlightTest invocado en rama test-completo`): `assert.match(restartWindow, /this\.persistInFlightTest\(\)/, ...)`.
   - **Test E** (`x-show extendido en index.html`): `assert.ok(indexSrc.includes("sessionMode === 'repaso' || sessionMode === 'test-completo'"), ...)`.
   - **Test F** (`copy del botón sigue hardcoded — T-02-01`): `assert.ok(indexSrc.includes('>Reiniciar ejercicios<'), ...)` para validar que NO se introdujo `x-text` dinámico en el botón.

4. Mensajes de assert deben ser informativos en español (coherente con el resto del archivo), referenciando "Phase 8.y" y el item del ROADMAP.

**Restricciones (cero scope creep):**
- NO renombrar `restartRepaso` (preserva el binding @click + tests previos; refactor diferible).
- NO introducir `x-text` dinámico — texto del botón hardcoded "Reiniciar ejercicios" (T-02-01 anti-XSS invariante).
- NO añadir confirmación inline (D-102 — análogo al Phase 6 sin confirm; en Examen tampoco, coherencia).
- NO añadir animación / disabled / atajo de teclado (UI-SPEC Phase 6 §Visual cue / §Disabled / §Keyboard prescriben no-op para v1; Phase 8.y hereda).
- NO migrar schemaVersion (D-192 inherited — shape inFlightTest IDÉNTICO; el persistInFlightTest existente lo escribe directo).
- NO refactorizar `_launchExamen` para compartir helper con `restartRepaso` (duplicación de ~20 líneas aceptable v1 — coherente con D-104 Phase 6 "duplicación aceptable v1; refactor solo si emerge 3er call-site"; aquí seguimos en 2 call-sites del mismo bloque, no 3).
- NO tocar `tests/screen-examen.test.js` describe block existente (sus 7 sub-tests Phase 8 quedan intactos).
- NO tocar otros tests (`tests/domain.test.js` etc.) — el quick es purament UI/handler.

**Verificación pre-commit:**
- `node --test tests/*.test.js` → baseline+N verde (donde N ≥ 4 nuevos sub-tests; STATE.md reporta 209 baseline pero la baseline en la sesión real puede ser 223+ según menciona `constraints`; cualquier baseline+nuevos en verde es éxito).
- Verificación manual humana (opcional, no parte del task): abrir `npx serve` → lanzar Examen de cualquier categoría → en pantalla session click "Reiniciar ejercicios" → debe rehacer el orden de la MISMA categoría y persistir inFlightTest (verificable en DevTools → Application → Local Storage `italianCourse.v1` → `inFlightTest.exerciseIds` cambia).
  </action>
  <verify>
    <automated>node --test tests/*.test.js</automated>
  </verify>
  <done>
    - `src/screens/app.js`: `restartRepaso` guard acepta `'repaso'` y `'test-completo'`; dispatch interno a `buildFullTest([catId])` o `buildSession(...)` según `sessionMode`; `persistInFlightTest()` invocado SOLO en rama test-completo; JSDoc actualizado mencionando Phase 8.y.
    - `index.html`: `x-show` del botón "Reiniciar ejercicios" extendido a `sessionMode === 'repaso' || sessionMode === 'test-completo'`; texto del botón sigue hardcoded; comentario HTML actualizado breve.
    - `tests/screen-examen.test.js`: nuevo describe block `'appShell.restartRepaso — Phase 8.y dual-mode extension'` con ≥4 sub-tests presence-check verdes; describe Phase 8 existente intacto.
    - `node --test tests/*.test.js` → todos los tests verdes (baseline previo + nuevos sub-tests del describe Phase 8.y).
    - Cero cambios a otros archivos (categories.json, dominio puro, schema validator, CSS, otros tests).
  </done>
</task>

</tasks>

<verification>
1. `node --test tests/*.test.js` exit 0; el nuevo describe block `Phase 8.y dual-mode extension` aparece en stdout con todos los sub-tests verdes; el describe Phase 8 existente sigue verde sin cambios.
2. `grep -c "buildFullTest" src/screens/app.js` → ≥ 2 (uno en `_launchExamen` Phase 8, otro nuevo en `restartRepaso` Phase 8.y).
3. `grep -c "sessionMode === 'test-completo'" index.html` → ≥ 1 (en el x-show del botón Reiniciar; puede haber más matches preexistentes en banners/etc — el conteo mínimo es lo que importa).
4. `grep "x-text" index.html | grep -i "reiniciar"` → vacío (T-02-01 invariante: el botón sigue con texto hardcoded, NO x-text dinámico).
5. Verificación manual opcional (post-commit, sign-off del autor): `npx serve` → lanzar Examen de Avere → click "Reiniciar ejercicios" en pantalla session → la sesión rehace el orden de Avere sin volver al home; `inFlightTest.exerciseIds` en localStorage cambia.
</verification>

<success_criteria>
- El botón "Reiniciar ejercicios" aparece visible en pantalla session tanto en modo Repaso como en modo Examen (test-completo).
- Click sobre el botón en modo Examen re-llama `buildFullTest([catId])` con la categoría del inFlightTest persistido y re-persiste inFlightTest.
- Click sobre el botón en modo Repaso sigue re-llamando `buildSession(...)` SIN tocar localStorage (regresión cero Phase 6 D-100/SESSION-08).
- Tests verdes: baseline previo + ≥4 nuevos sub-tests presence-check añadidos al final de `tests/screen-examen.test.js`.
- Phase 8.y backlog item del ROADMAP cerrado.
- Cero migración schemaVersion. Cero CSS nuevo. Cero estado nuevo en factory. Cero refactor de naming.
</success_criteria>

<output>
Create `.planning/quick/260525-vvj-boton-reiniciar-examen-phase-8-y/260525-vvj-SUMMARY.md` when done con:
- Phase 8.y closure confirmation.
- Resumen del cambio en 3 archivos.
- Test count baseline → post-quick.
- Commit hash atómico.
- Audit trail: cita del item Phase 8.y del ROADMAP línea 327-329.
- Si el autor verificó manualmente en navegador: 1-line confirmation; si no: nota "verificación humana diferida — tests verdes suficientes para anclar el feature".

Update ROADMAP.md tras el quick: marcar Phase 8.y como "Status: Shipped (quick 260525-vvj)" preservando el resto del bullet como audit trail.
</output>
