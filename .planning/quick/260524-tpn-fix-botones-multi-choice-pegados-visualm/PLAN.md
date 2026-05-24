---
quick_id: 260524-tpn
description: Fix botones multi-choice pegados visualmente
created: 2026-05-24
files_modified:
  - index.html
---

<objective>
Eliminar el "fusionado visual" de los 4 botones de opciones en el sub-template `multiple-choice` de la pantalla `session`, reemplazando el contenedor `<div role="group">` (Pico classless button group — sin gap) por `<div class="button-row">` (la clase ya existente y canonizada en Phase 2/3 para exactamente este problema).

Purpose: Cerrar UX-1 (capturado en `04-02/03/04-SUMMARY.md` y reportado en UAT de Preposiciones). El usuario sufre miss-clicks porque los 4 botones de respuesta aparecen pegados sin separación visible.

Output: 1 línea modificada en `index.html` (línea 261). Sin cambios en `styles.css` (la clase `.button-row` con `gap: 1rem` ya existe, líneas 86-93). Sin cambios en lógica Alpine.

Scope guard: las otras 2 mecánicas (word-buttons y match) ya tienen gap correcto — `.wb-bank` con `gap: 0.5rem` (styles.css:182-187) y `.match-col` con `gap: 0.5rem` (styles.css:266-270). NO tocar esos templates. El audit con `grep -n 'role="group"' index.html` confirma que línea 261 es la ÚNICA instancia restante de `role="group"` — todas las demás filas de botones del proyecto ya usan `.button-row` (líneas 107, 144, 198, 332, 493, 529).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@CLAUDE.md
@.planning/todos/pending/2026-05-24-fix-botones-multi-choice-pegados-visualmente.md
@styles.css
@index.html

<interfaces>
<!-- Clase CSS ya existente en styles.css (líneas 86-97) — la fix solo consume esta clase, no la modifica. -->

.button-row (styles.css:86-93):
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
.button-row button { flex: 1; }  /* reparte el ancho entre las opciones */

.button-row-prominent (styles.css:94-97): variante con font-size/padding extra — NO aplica aquí (las
opciones de multi-choice son tamaño normal, no acción primaria).

<!-- Patrón de uso canonizado (index.html:144, 198, 332, etc.):
     <div class="button-row"> ... </div>
     reemplaza exactamente a:
     <div role="group"> ... </div>
     sin más cambios. -->
</interfaces>
</context>

<tasks>

<task id="1" type="auto">
  <name>Task 1: Reemplazar role="group" por class="button-row" en sub-template multiple-choice</name>
  <files>index.html</files>
  <read_first>
    - .planning/todos/pending/2026-05-24-fix-botones-multi-choice-pegados-visualmente.md (full)
    - styles.css (full — confirmar que `.button-row` ya existe con `gap: 1rem` y `flex: 1` en los botones interiores; NO modificar styles.css)
    - index.html (sección session screen, líneas ~255-281 — el `<template x-if="sessionCurrentExercise.type === 'multiple-choice'">`)
    - Antes de editar, ejecutar `grep -n 'role="group"' index.html` y verificar que SÓLO devuelve la línea 261. Si devuelve más líneas, parar y reportar — la suposición de "instancia única" no se sostendría.
  </read_first>
  <action>
    En `index.html`, dentro del bloque `<template x-if="sessionCurrentExercise.type === 'multiple-choice'">` (línea 259), localizar el `<div role="group">` de la línea 261 que envuelve el `<template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">`. Reemplazar ese atributo `role="group"` por `class="button-row"` — el resto del bloque (el `<template x-for>`, los `<button>` con sus `@click`, `:disabled`, `:class` con clases `correcta`/`incorrecta` y `x-text="opt"`) queda IDÉNTICO. NO añadir wrappers extra, NO mover el `<p x-show="sessionFeedback === 'incorrect'">` ni el botón Siguiente que viven fuera del contenedor de opciones. NO tocar `styles.css` (la clase `.button-row` ya provee `display: flex; gap: 1rem; margin: 1.5rem 0;` + `.button-row button { flex: 1; }`). NO tocar `src/screens/app.js` (no hay lógica que dependa del atributo `role`). Razonamiento: el comentario en styles.css líneas 62-75 documenta explícitamente que `role="group"` es el anti-patrón recurrente que `.button-row` reemplaza — esta línea 261 quedó como una regresión olvidada al migrar Phase 1 a Phase 2.
  </action>
  <verify>
    <automated>cd /home/vcompanyb/italian-course && grep -c 'role="group"' index.html | grep -qx 0 && grep -n 'class="button-row"' index.html | wc -l | awk '$1 >= 7 { exit 0 } { exit 1 }' && node --test tests/*.test.js 2>&1 | tail -5 | grep -qE 'pass [0-9]+'</automated>
    <human-check>
      Lanzar `npx serve` (o Live Server), abrir la app, seleccionar cualquier categoría con multi-choice (ej. Preposiciones), pulsar "Repaso 20", y verificar visualmente en la primera pregunta multi-choice que:
      1. Los 4 botones de opciones tienen separación clara entre ellos (gap ~1rem visible, no fusionados).
      2. El layout sigue siendo horizontal de 4 botones lado a lado (flex con `flex: 1` reparte el ancho).
      3. Tras click en una opción incorrecta, los estilos `.correcta` (verde) e `.incorrecta` (rojo) se siguen aplicando correctamente — no se ha roto el feedback visual.
      4. Tras click rápido alternando entre opciones (test de miss-click), cada botón es claramente distinguible y no hay áreas de click ambiguas en los bordes.
    </human-check>
  </verify>
  <done>
    - `index.html` línea 261 usa `<div class="button-row">` en lugar de `<div role="group">`.
    - `grep -c 'role="group"' index.html` retorna `0` (ningún `role="group"` queda en el archivo).
    - `node --test tests/*.test.js` sigue verde (130/130 o el total actual — los tests no tocan CSS pero verifican que no se rompió ningún módulo JS al cambiar el HTML).
    - Verificación humana confirma separación visual entre las 4 opciones en una sesión real de Repaso con multi-choice.
    - `styles.css` NO ha sido modificado.
    - `src/screens/app.js` NO ha sido modificado.
    - `content/*.json` NO ha sido modificado.
  </done>
</task>

</tasks>

<verification>
- Comando único de regresión: `grep -c 'role="group"' index.html` → debe ser `0`.
- Comando único de aplicación: `grep -c 'class="button-row"' index.html` → debe haber aumentado en 1 respecto al estado previo (de 6 a 7 instancias).
- Tests JS: `node --test tests/*.test.js` → pasa sin regresión (los tests no cubren CSS/HTML pero confirman que ningún módulo importable se rompió).
- Verificación humana funcional via `npx serve` y sesión real (no automatizable — Pico classless renderiza vía CSS del navegador, no hay snapshot test del layout en este repo).
</verification>

<success_criteria>
- UX-1 cerrado: las 4 opciones de multi-choice se renderizan con `gap: 1rem` visible (provisto por `.button-row` ya existente).
- Cero cambios en `styles.css`, `src/screens/app.js`, `content/`, `tests/`.
- Cero `role="group"` restante en `index.html`.
- Tests automáticos verdes.
- Coherencia visual con las otras 6 `.button-row` del proyecto (home actions, picker, banner in-flight, word-buttons Comprobar/Siguiente, etc.).
- D-88 / invariantes de Phase 4 preservados: no se introducen nuevos colores, fuentes, ni animaciones; solo se aplica una clase ya canonizada.
</success_criteria>

<output>
Crear `.planning/quick/260524-tpn-fix-botones-multi-choice-pegados-visualm/SUMMARY.md` cuando esté hecho, con: diff aplicado (1 línea), confirmación de comandos de verificación, y nota cerrando UX-1 con referencia a los SUMMARYs de Phase 4 donde se capturó originalmente.
</output>
