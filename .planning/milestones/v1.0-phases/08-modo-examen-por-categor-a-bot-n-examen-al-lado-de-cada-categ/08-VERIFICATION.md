---
phase: 08-modo-examen-por-categoria
verified: 2026-05-25T21:30:00Z
status: passed
score: 9/9 must-haves verified + informal sign-off del autor sobre los 5 UAT humanos (durante cierre milestone v1.0)
overrides_applied: 1
override_notes: "HUMAN-UAT 5 items soft-accepted via informal author sign-off ('lo veo bastante bien') durante cierre milestone v1.0 el 2026-05-25. Items quedan documentados en 08-HUMAN-UAT.md como referencia futura para /gsd-debug si emerge bug en uso real."
human_verification:
  - test: "Click Examen en una categoría con ejercicios (ej. Avere) sin Test completo activo"
    expected: "Arranca directamente sesión Test completo — Ejercicio 1 / 23, sessionMode='test-completo', sin pasar por picker ni confirmación previa"
    why_human: "Requiere Alpine runtime + localStorage init — el factory appShell no es instanciable bajo node sin Alpine"
  - test: "Click Examen con state.inFlightTest activo (ej. arranca un Test completo, luego click Examen en otra cat)"
    expected: "Aparece panel .confirm-inline con texto 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?' — botón 'Descartar y empezar' arranca el Examen nuevo, 'Cancelar' deja state intacto"
    why_human: "Comportamiento del confirmDialog en Alpine runtime — no testable por grep/presence-check"
  - test: "Botón Examen en categoría con 0 ejercicios (crear cat vacía en categories.json o verificar con DevTools)"
    expected: "Botón aparece disabled (opacity ~0.5 Pico default) con tooltip nativo 'No hay ejercicios en esta categoría' al hover"
    why_human: "Visual CSS disabled state + tooltip HTML nativo — requiere browser"
  - test: "Abandonar Examen a mitad (cerrar tab) y reabrir la app"
    expected: "Banner home reanudar muestra copy genérica 'Tienes un Test completo a medias'. Reanudar reconstruye la sesión con los mismos categoryIds persistidos (1 cat)"
    why_human: "Comportamiento de persistencia inFlightTest + UI banner — requiere browser con localStorage activo"
  - test: "Completar un Examen sin fallar ningún ejercicio"
    expected: "Pantalla summary muestra delta de la categoría examinada. DOMAIN-04 promociona la cat a 'hecha' si corresponde"
    why_human: "Flujo completo de sesión + applySessionResult + render summary — requiere Alpine runtime y 23+ ejercicios reales"
---

# Phase 8: Modo Examen por categoría — Verification Report

**Phase Goal:** El autor puede examinar una categoría individual con 1 click desde la tabla home (botón `Examen` por fila como 6ª columna nueva) que arranca un Test Completo de SOLO esa categoría — sin pasar por el picker. Reutiliza `buildFullTest([catId])` (D-50), slot único `inFlightTest` compartido (D-182), y el patrón D-44 6ª call-site del helper `requestConfirm` para conflict con Test Completo activo. Cero migración schemaVersion (sigue 4 — D-192).
**Verified:** 2026-05-25T21:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Botón "Examen" en cada fila tabla home, 6ª columna | VERIFIED | `<th scope="col">Examen</th>` en línea 160 de index.html; `<td><button class="secondary outline" ... >Examen</button></td>` en líneas 175-181; 6 `<th scope="col">` en total confirmado por grep |
| 2 | Click sin Test activo → Test completo 1 cat directo (salta picker) | VERIFIED | `startExamen(categoryId)` línea 325 app.js; path normal `this._launchExamen(categoryId)` en línea 340 se ejecuta directamente cuando `!this.state.inFlightTest`; `buildFullTest([catId], allExercises)` en `_launchExamen` línea 379; `currentScreen = 'session'` línea 423 |
| 3 | Click con inFlightTest activo → panel confirm-inline 6ª call-site D-44 con copy literal | VERIFIED | Guard `if (this.state.inFlightTest)` en línea 327; `requestConfirm({message: 'Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?', confirmLabel: 'Descartar y empezar', cancelLabel: 'Cancelar', ...})` en líneas 328-336; orden inFlightTest check (pos 116) antes de `_launchExamen` call (pos 424) verificado programáticamente |
| 4 | Cat 0 ejercicios → disabled + tooltip | VERIFIED | `examenEnabled = totalCount > 0` en línea 2108; `:disabled="!cat.examenEnabled"` en index.html línea 178; `:title="cat.examenTooltip"` línea 179; `examenTooltip: examenEnabled ? '' : 'No hay ejercicios en esta categoría'` línea 2122 |
| 5 | Cat hecha/dominada → botón enabled normal (D-187) | VERIFIED | `examenEnabled` se deriva de `totalCount > 0` (NO de `cat.status`) — línea 2108 reutiliza `totalCount` independientemente de `progress?.status`; JSDoc en línea 2084-2085 documenta explícitamente la decisión |
| 6 | Examen abandonado → banner reanudar copy genérica; reanudar usa mismas categoryIds | VERIFIED | `this.pickerCheckedCategoryIds = [catId]` (línea 388) ANTES de `this.persistInFlightTest()` (línea 420) — pitfall PATTERNS.md §1 Analog 2 resuelto. Orden verificado programáticamente: picker idx 896 < persist idx 2236 |
| 7 | Summary tras Examen sin cambios al template (D-191) | VERIFIED | Los 4 commits de Phase 8 no tocan el render de summary. Git diff confirma: Task 1 modifica solo app.js (handler+helper+computed), Task 2 solo index.html (columna), Task 3 solo tests/screen-examen.test.js, Task 4 solo planning docs + SUMMARY.md |
| 8 | Examen completado → DOMAIN-04 aplica igual (D-190); con fallo → cascada D-54 | VERIFIED | `_launchExamen` usa `sessionMode = 'test-completo'` (línea 383), mismo modo que Test Completo regular — el motor `applySessionResult` (no modificado) aplica DOMAIN-04 y D-54 sobre cualquier sesión en ese modo sin distinción |
| 9 | Cero migración schemaVersion (sigue 4 — D-192) | VERIFIED | `CURRENT_SCHEMA_VERSION = 4` en storage.js (no modificado); git log confirma storage.js no aparece en ningún commit de Phase 8 (575178f, b7d7991, 704b744, f738f78) |

**Score:** 9/9 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/screens/app.js` | `startExamen(categoryId)` handler | VERIFIED | Línea 325; firma exacta `startExamen(categoryId)` |
| `src/screens/app.js` | `_launchExamen(catId)` helper privado | VERIFIED | Línea 370; 2 call-sites `this._launchExamen(` confirmadas por grep (`-c` = 2) |
| `src/screens/app.js` | `examenEnabled` en `categoriesForDisplay` | VERIFIED | Línea 2108 + 2121; 7 ocurrencias totales |
| `src/screens/app.js` | `examenTooltip` en `categoriesForDisplay` | VERIFIED | Línea 2122; 3 ocurrencias |
| `index.html` | 6ª columna `<th scope="col">Examen</th>` | VERIFIED | Línea 160; 6 `<th scope="col">` en total |
| `index.html` | `<button class="secondary outline">` con bindings | VERIFIED | Líneas 175-181: `type="button"`, `class="secondary outline"`, `:disabled="!cat.examenEnabled"`, `:title="cat.examenTooltip"`, `@click="startExamen(cat.id)"`, texto `Examen` LITERAL (no `x-text`) |
| `tests/screen-examen.test.js` | 7 smoke tests presence-check | VERIFIED | Archivo existe, sintaxis OK, 7 sub-tests pasan 7/7 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.html` botón Examen | `app.js` handler `startExamen` | `@click="startExamen(cat.id)"` | WIRED | Grep confirma `startExamen(cat.id)` en index.html línea 180; handler definido en app.js línea 325 |
| `startExamen` (conflict path) | `requestConfirm` + `_launchExamen` | `requestConfirm({..., onConfirm: () => { this.clearInFlightTest(); this._launchExamen(categoryId); }})` | WIRED | Copy literal D-44 verificada; `_launchExamen(categoryId)` dentro del onConfirm en línea 334 |
| `_launchExamen` | `buildFullTest` de domain/session.js | `buildFullTest([catId], allExercises)` | WIRED | Línea 379; `buildFullTest` ya importado en línea 60 (no modificado) |
| `_launchExamen` | `persistInFlightTest` (D-182 slot único) | `this.pickerCheckedCategoryIds = [catId]; this.persistInFlightTest();` | WIRED | Líneas 388 + 420; orden verificado programáticamente |
| `index.html` `:disabled` binding | `categoriesForDisplay.examenEnabled` | `:disabled="!cat.examenEnabled"` | WIRED | Línea 178 index.html; `examenEnabled` en getter línea 2108 + 2121 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|-------------------|--------|
| `index.html` botón Examen | `cat.examenEnabled`, `cat.examenTooltip` | `categoriesForDisplay` getter (app.js línea 2090) que lee `exercisesByCat[cat.id]` construido de `this.content.exerciseById` | Sí — datos reales del JSON de contenido cargado | FLOWING |
| `_launchExamen` | `result.exerciseIds` | `buildFullTest([catId], allExercises)` con `allExercises = Object.values(this.content.exerciseById)` | Sí — Fisher-Yates real sobre pool de ejercicios de la categoría | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Test suite completa pasa 209/209 | `node --test tests/*.test.js` | 209 pass, 0 fail, 0 skip | PASS |
| 7 smoke tests del screen-examen pasan | `node --test tests/screen-examen.test.js` | 7 pass, 0 fail | PASS |
| Sintaxis app.js válida | `node --check src/screens/app.js` | exit 0 | PASS |
| Sintaxis test file válida | `node --check tests/screen-examen.test.js` | exit 0 | PASS |
| schemaVersion sigue 4 en storage.js | `grep CURRENT_SCHEMA_VERSION src/data/storage.js` | `const CURRENT_SCHEMA_VERSION = 4;` | PASS |
| T-02-01: cero x-html en index.html | `grep -c 'x-html' index.html` | 0 | PASS |
| 6 `<th scope="col">` en tabla home | `grep -c '<th scope="col">' index.html` | 6 | PASS |
| Botón texto LITERAL (no x-text) | `grep '>Examen</button>' index.html` | match en línea 180 | PASS |

### Probe Execution

No probes declarados en el PLAN. Step 7c: no aplica (no hay `scripts/*/tests/probe-*.sh` en Phase 8).

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EXAM-01 | Plan 08-01 | 6ª columna Examen con `<th>` + botón `secondary outline` por fila | SATISFIED | index.html líneas 160 + 175-181; smoke test 7 |
| EXAM-02 | Plan 08-01 | Click Examen → `buildFullTest([catId])` + `sessionMode='test-completo'` + `persistInFlightTest()` + `currentScreen='session'` sin picker | SATISFIED | app.js líneas 325-341, 370-424; smoke tests 1 + 5 |
| EXAM-03 | Plan 08-01 | Click con inFlightTest activo → `requestConfirm` copy literal D-44 + `clearInFlightTest()` + `_launchExamen()` | SATISFIED | app.js líneas 327-337; smoke tests 3 + 4 |
| EXAM-04 | Plan 08-01 | Persistencia inFlightTest slot único; banner genérico; reanudar con MISMAS categoryIds; cero schemaVersion | SATISFIED | app.js líneas 388 + 420 (pitfall resuelto); storage.js sin modificar; smoke test 6 |
| EXAM-05 | Plan 08-01 | Cat 0 ejercicios → disabled + tooltip; `hecha`/`dominada` → enabled normal | SATISFIED | app.js línea 2108 (`examenEnabled = totalCount > 0`); index.html líneas 178-179; smoke test 7 |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No anti-patterns found en código modificado por Phase 8. Cero TBD/FIXME/XXX en los 3 archivos de código (app.js, index.html, screen-examen.test.js). Cero `x-html` introducidos. Cero stubs o retornos vacíos en el código nuevo. |

Nota: Las ocurrencias de "TODO" en index.html (líneas 56, 558) son pre-existentes ("TODO el contenido" como pronombre español), no markers de deuda técnica.

### Human Verification Required

Automated checks han verificado todos los artefactos y enlaces clave. Los siguientes comportamientos requieren Alpine runtime + browser con localStorage activo para validación completa end-to-end:

### 1. Flujo básico: click Examen sin conflict

**Test:** Arrancar `npx serve` en `/home/vcompanyb/italian-course`, abrir `http://localhost:3000`, hacer click en el botón "Examen" de la fila "Avere" sin ningún Test completo activo.
**Expected:** La sesión arranca directamente con "Ejercicio 1 / 23", sessionMode visible como Test completo, sin haber pasado por el picker ni por pantalla de confirmación previa.
**Why human:** Requiere Alpine runtime reactivo + contenido JSON cargado en memoria — no testable por presence-check.

### 2. Flujo conflict: click Examen con inFlightTest activo

**Test:** Lanzar un Test completo vía "Test completo" normal (picker), entrar a la sesión, volver al home (← Volver), y luego hacer click en "Examen" de cualquier categoría.
**Expected:** Aparece el panel `.confirm-inline` con el texto exacto "Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?". Botón "Descartar y empezar" inicia el Examen nuevo. Botón "Cancelar" cierra el panel sin cambios.
**Why human:** Comportamiento del confirmDialog en Alpine runtime con estado previo — no testable sin browser.

### 3. Botón disabled en categoría vacía

**Test:** Crear temporalmente una entrada en `content/categories.json` con un id sin JSON de ejercicios correspondiente (o usar DevTools para verificar el binding `:disabled`).
**Expected:** El botón Examen de esa fila aparece con opacity reducida (Pico default para `:disabled`) y tooltip "No hay ejercicios en esta categoría" al hover.
**Why human:** Visual CSS disabled state + tooltip HTML nativo — requiere browser.

### 4. Reanudar Examen abandonado

**Test:** Hacer click en "Examen" de una categoría, avanzar 3-4 ejercicios, cerrar la pestaña del navegador, reabrir `http://localhost:3000`.
**Expected:** El banner home muestra "Tienes un Test completo a medias — X/N ejercicios". Al hacer click en "Reanudar", la sesión continúa exactamente donde se dejó, con los mismos ejercicios de esa única categoría.
**Why human:** Comportamiento de persistencia inFlightTest + render banner + reconstrucción buildFullTest — requiere browser con localStorage activo.

### 5. Examen completo sin fallos → DOMAIN-04 promoción

**Test:** Seleccionar una categoría en estado `no-hecha`, hacer click en "Examen", completar todos los ejercicios sin fallar ninguno.
**Expected:** Pantalla summary muestra el delta de la categoría examinada (estado antes → después). Si todos los ejercicios quedan en `clearedExerciseIds`, la categoría pasa a `hecha`. Summary no muestra campos extra ni cambios de layout vs un Test completo regular.
**Why human:** Flujo completo de sesión end-to-end + `applySessionResult` + render summary — requiere Alpine runtime y 23+ respuestas reales.

### Gaps Summary

No se encontraron gaps técnicos. Todos los artefactos están presentes, son sustantivos (no stubs), y están correctamente conectados. Los 5 items de verificación humana son comportamientos runtime que requieren Alpine + browser y son coherentes con el patrón establecido en fases anteriores (Phase 3+, UAT post-merge).

---

_Verified: 2026-05-25T21:00:00Z_
_Verifier: Claude (gsd-verifier)_
