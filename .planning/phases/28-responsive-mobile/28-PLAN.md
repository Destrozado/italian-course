---
phase: 28-responsive-mobile
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - styles.css
  - tests/screen-responsive.test.js
autonomous: true
requirements: [RESP-01, RESP-02]
must_haves:
  truths:
    - "En móvil (<=640px) la tabla de home colapsa a tarjetas verticales: cada categoría es una tarjeta con campos etiquetados y el botón 'Examen' visible y táctil (LOCKED #1)"
    - "En móvil la lista de Canciones colapsa al mismo patrón tarjetas con el botón 'Jugar' visible y táctil"
    - "En móvil la fila de 4 botones de home (.button-row) envuelve para que 'Backup' (4º botón) sea visible (LOCKED #2)"
    - "En móvil todos los controles tappables (.button-row button, word-buttons, match items, toggle, checkboxes) tienen >=44px de altura táctil"
    - "En móvil la match-grid mantiene 2 columnas (gap reducido), el cronómetro (barra+segundos) sigue visible sin romper la cabecera, y el panel .confirm-inline no se recorta"
    - "En escritorio (>=641px) todas las pantallas renderizan idénticas a hoy: no hay ninguna regla nueva fuera de @media (max-width: 640px) que altere el render (data-label no afecta a desktop)"
  artifacts:
    - path: "styles.css"
      provides: "Bloque @media (max-width: 640px) con table->cards, button-row wrap, touch 44px, match 2-col, timer, confirm-inline full-width"
      contains: "@media (max-width: 640px)"
    - path: "index.html"
      provides: "Atributos data-label en los <td> de la tabla de home y de la lista de canciones"
      contains: "data-label"
    - path: "tests/screen-responsive.test.js"
      provides: "Source-asserts: presencia del media query, data-label en celdas clave, y que no se tocó CSS desktop fuera del media query"
      exports: ["test"]
  key_links:
    - from: "styles.css @media (max-width:640px) table->cards"
      to: "index.html <td data-label=...>"
      via: "td::before { content: attr(data-label) }"
      pattern: "attr\\(data-label\\)"
    - from: "styles.css @media (max-width:640px) .button-row"
      to: "index.html .button-row (home/picker/banners/exercises/backup)"
      via: "flex-wrap: wrap + min-width"
      pattern: "flex-wrap:\\s*wrap"
---

<objective>
Hacer las 7 pantallas (home, canciones/picker, session, cancion, summary, cancion-summary, backup) usables en móvil en vertical, implementando EXACTAMENTE el contrato de diseño aprobado en `28-UI-SPEC.md`. Todo el responsive vive detrás de `@media (max-width: 640px)`; el escritorio (>=641px) queda byte-idéntico.

Purpose: Resuelve los 2 problemas LOCKED del autor (tabla de home que corta el botón "Examen"; fila de 4 botones que esconde "Backup") y materializa el upgrade path "Responsive mobile UI" de CLAUDE.md sin cambiar de framework ni añadir build.

Output: media queries nuevas en `styles.css`, `data-label` en los `<td>` de las dos tablas de `index.html`, y un test de source-assert que blinda las invariantes.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md

# CONTRATO DE DISEÑO — CANON. Implementar exactamente, no reinterpretar.
@.planning/phases/28-responsive-mobile/28-UI-SPEC.md
@.planning/phases/28-responsive-mobile/28-CONTEXT.md

# Markup y estilos reales
@index.html
@styles.css

<interfaces>
<!-- Selectores y ubicaciones VERIFICADAS contra el código (no explorar). -->

Selectores CSS existentes que el media query toca (styles.css):
- `.button-row` (L86-90): flex; gap:1rem; margin:1.5rem 0  →  hay que añadir flex-wrap + min-width en móvil
- `.button-row button` (L91-93): flex:1
- `.button-row-prominent button` (L94-97): font-size 1.1rem; padding 0.75rem 1.5rem
- `.confirm-inline` (L112-123): position:fixed; top:1rem; right:1rem; max-width:22rem  →  en móvil left:1rem; right:1rem; max-width:none
- `.match-grid` (L260-265): grid-template-columns:1fr 1fr; gap:1rem  →  en móvil gap:0.5rem (MANTENER 2 columnas)
- `.match-col` (L266-270): flex column; gap:0.5rem
- `.wb-bank` (L182-187): flex-wrap:wrap; gap:0.5rem (ya fluye)  →  asegurar chips >=44px en móvil
- `.wb-answer` (L192-202): min-height:3rem; flex-wrap:wrap (ya envuelve)
- `.session-timer` (L481-486): flex; align-items:center; gap:0.75rem
- `.session-timer-bar` (L487-491): flex:1; height:0.5rem
- `.session-timer-secs` (L494-500): min-width:2.5rem; text-align:right; tabular-nums
- `.session-context` (L465-470): font-size:1.25rem  →  cap ~1.15rem en móvil (NO tocar desktop)
- `.home-exam-timed`: NO existe regla hoy (confirmado: no está en styles.css) — sólo Pico defaults
- `.picker-timed` (L503-509), `.picker-warning` (L100-104)

Markup donde van los data-label (index.html):
- Tabla HOME `<tbody>` L179-205. Headers: Estado / Categoría / Racha / Ejercicios / Última vez / Examen.
  Celdas en orden: td(badge) L182, td(nombre) L187, td(racha+small "fallada xN") L190, td(totalCount) L195, td(lastPracticedLabel) L196, td(botón Examen) L197.
  data-label a añadir: "Estado", (Categoría sin label = título de tarjeta), "Racha", "Ejercicios", "Última vez", "Examen".
- Tabla CANCIONES `<tbody>` L243-261. Headers: Estado / Canción / Frases / Jugar.
  Celdas: td(badge+statusLabel) L245, td(título+small "fallada xN") L250, td(phraseCount) L255, td(botón Jugar) L256.
  data-label: "Estado", (Canción sin label), "Frases", "Jugar".

NOTA DE SCOPING: ambas tablas son `<figure><table>` directos dentro de su `<article>` (home y canciones). NO hay otra `<table>` en la app. El selector `figure table` (o `article figure table`) cubre ambas sin afectar nada más. Confirmar con grep que no aparecen otras `<table>` antes de elegir el selector.
</interfaces>

<patrón-de-test>
<!-- Patrón source-assert verificado en tests/screen-context-label.test.js -->
Los screen tests leen el archivo fuente con `readFileSync` y afirman presencia de strings/regex.
Imports: `import { test, describe } from 'node:test'`; `import assert from 'node:assert/strict'`; `import { readFileSync } from 'node:fs'`.
Path: `new URL('../styles.css', import.meta.url)` y `new URL('../index.html', import.meta.url)`.
La suite SE EJECUTA SOLO con glob: `node --test tests/*.test.js` (path desnudo falla en Node 22.20 — MEMORY.md).
Baseline actual: 432 pass / 1 fail (genero-numero 12->13, PREEXISTENTE y ajeno — NO tocar, NO arreglar).
</patrón-de-test>
</context>

<tasks>

<task type="auto">
  <name>Tarea 1: Añadir data-label a las celdas de las dos tablas (markup mínimo, desktop intacto)</name>
  <files>index.html</files>
  <action>
Añadir atributos `data-label` a los `<td>` de las dos tablas, copiando textualmente las cabeceras en español (Copywriting Contract del UI-SPEC: cero copy nueva). NO tocar `<thead>`, ni clases, ni `x-for`, ni handlers, ni estructura. `data-label` es inerte en escritorio (ningún selector desktop lo usa), por eso no altera el render >=641px.

Tabla HOME (`<tbody>` ~L179-205), por celda:
- td del badge (L182): `data-label="Estado"`
- td del nombre (L187): SIN data-label (será el título de la tarjeta)
- td de racha + `<small>fallada xN` (L190): `data-label="Racha"` (el small permanece dentro, adjunto al campo Racha — UI-SPEC §1)
- td totalCount (L195): `data-label="Ejercicios"`
- td lastPracticedLabel (L196): `data-label="Última vez"`
- td del botón Examen (L197): `data-label="Examen"`

Tabla CANCIONES (`<tbody>` ~L243-261), por celda:
- td del badge+statusLabel (L245): `data-label="Estado"`
- td del título + small (L250): SIN data-label (título de tarjeta)
- td phraseCount (L255): `data-label="Frases"`
- td del botón Jugar (L256): `data-label="Jugar"`

No añadas data-label a ninguna otra tabla — no existe ninguna otra. Verifica con grep antes y después que sólo hay 2 `<table>`.
  </action>
  <verify>
    <automated>grep -c 'data-label=' /home/vcompanyb/italian-course/index.html | grep -qx 8 && echo "OK 8 data-label" || (echo "FAIL: esperados 8 data-label"; exit 1)</automated>
  </verify>
  <done>Hay exactamente 8 atributos data-label (6 en tabla home + 2... corregir: 5 en home celdas con label [Estado/Racha/Ejercicios/Última vez/Examen] + 3 en canciones [Estado/Frases/Jugar] = 8). Las celdas de nombre/título no llevan label. thead, clases y handlers sin cambios. `node --test tests/*.test.js` sigue en 432 pass / 1 fail preexistente.</done>
</task>

<task type="auto">
  <name>Tarea 2: Añadir el bloque @media (max-width: 640px) en styles.css implementando el contrato (8 secciones)</name>
  <files>styles.css</files>
  <action>
Añadir UN bloque `@media (max-width: 640px) { ... }` al final de `styles.css`. TODA regla nueva va dentro de él. NO modificar ninguna declaración existente fuera del media query (no tocar Pico, no tocar reglas desktop). Implementar las 8 secciones del UI-SPEC "Responsive Component Contract" exactamente:

§1 Tabla->tarjetas (LOCKED #1): scope `figure table` (cubre home y canciones; confirmar por grep que sólo hay esas 2 tablas). Dentro del media query: `thead { display: none; }`; `tr { display: block; }` con separación de tarjeta (border-bottom muted + margin/padding); `td { display: flex; justify-content: space-between; gap: 0.5rem; }` con `td::before { content: attr(data-label); }` en muted semibold ~0.8em (label izq / valor der). Las celdas sin data-label (nombre/título) NO muestran ::before (attr vacío) — actúan como título de la tarjeta; dale al primer/segundo `td` un peso/tamaño de heading si hace falta para que el nombre lea como título. El `<td>` del botón "Examen"/"Jugar": el `button` interior a ancho cómodo y `min-height: 44px` para tap. Mantener color `secondary outline`/default — sin cambio de color.

§2 Button-row wrap (LOCKED #2): `.button-row { flex-wrap: wrap; }` y `.button-row button { min-width: <umbral> }` (p.ej. min-width que fuerce 2-por-fila en ~360px o 1-por-fila en muy estrecho) manteniendo `flex:1`. Esto arregla TODOS los `.button-row` (home 4 botones, picker, banners, word-buttons, match, summary, backup, confirm). `.button-row-prominent` conserva padding cómodo al apilar. `.button-row button { min-height: 44px; }`.

§3 Toggle home `.home-exam-timed`: fila tappable cómoda (>=44px) encima de la tabla; no apretar contra la button-row de arriba; preservar el orden vertical existente (banners -> button-row -> toggle -> tabla). NO existe regla previa para esta clase, así que aquí se crea (sólo dentro del media query).

§4 Picker: `fieldset label` (checkboxes de categoría) con >=44px de altura tappable y espaciado cómodo; `.picker-timed` y el botón "Empezar" a ancho completo y >=44px; `.picker-warning` envuelve (no overflow).

§5 Session header + cronómetro: `.session-context` cap ~1.15rem en móvil (NO bajar la regla desktop de 1.25rem). `.session-timer` mantiene barra (`flex:1`) + segundos en una fila a 320px; la barra nunca colapsa a 0; si a la mínima anchura aprieta, permitir que los segundos pasen a 2ª línea pero la barra SIEMPRE visible. Mantener tabular-nums y el tono alerta rojo (sin cambio de color).

§6 Tipos de ejercicio: multiple-choice cubierto por §2 (opciones en .button-row, >=44px, wrap). word-buttons: chips de `.wb-bank` con >=44px de tap (overflow-wrap:anywhere ya está); `.wb-answer` mantiene min-height 3rem sin overflow a 320px. match (Claude's Discretion DECIDIDO): MANTENER 2 columnas `.match-grid { gap: 0.5rem; }`; items con >=44px de tap y `overflow-wrap: anywhere` para palabras largas dentro de la columna estrecha; NO tocar `.match-selected`/`.match-consumed`/`.match-flash` (color/animación intactos — WCAG single-flash preservado).

§7 Summary / cancion-summary / backup: listas reflow natural; asegurar que `.user-answer` y los pares `↔` envuelven dentro del `<li>` (overflow-wrap ya en `.user-answer`); botón final "Volver al home"/"Volver a Canciones" con tap cómodo. backup export/import cubierto por §2.

§8 Confirm panel: `.confirm-inline { left: 1rem; right: 1rem; max-width: none; }` (o width:auto) para que no se recorte en 320-360px; su `.button-row` interna ya envuelve por §2.

CERO colores nuevos, CERO fuentes nuevas, CERO frameworks, CERO build. Reusar vars de Pico ya en uso (`--pico-muted-color`, `--pico-muted-border-color`). El bloque entero debe quedar comentado en español explicando que es la capa responsive Phase 28 detrás del breakpoint 640px.
  </action>
  <verify>
    <automated>grep -c '@media (max-width: 640px)' /home/vcompanyb/italian-course/styles.css | grep -qE '^[1-9]' && grep -q 'attr(data-label)' /home/vcompanyb/italian-course/styles.css && grep -q 'flex-wrap: wrap' /home/vcompanyb/italian-course/styles.css && echo OK || (echo "FAIL: falta media query / table-cards / button wrap"; exit 1)</automated>
  </verify>
  <done>styles.css contiene >=1 bloque `@media (max-width: 640px)` con: table->cards (`attr(data-label)`, `thead{display:none}`, `tr{display:block}`), `.button-row{flex-wrap:wrap}` + `min-height:44px`, `.match-grid{gap:0.5rem}` (2 cols mantenidas), reglas de `.session-timer`/`.session-context`/`.confirm-inline`/`.home-exam-timed`/`.picker-timed`. Ninguna declaración FUERA del media query fue modificada (las reglas desktop L1-509 quedan intactas salvo el bloque nuevo añadido al final). `node --test tests/*.test.js` sigue 432 pass / 1 fail preexistente (ningún fallo nuevo).</done>
</task>

<task type="auto" tdd="true">
  <name>Tarea 3: Test source-assert que blinda las invariantes responsive (sin romper la suite)</name>
  <files>tests/screen-responsive.test.js</files>
  <behavior>
    - styles.css contiene el media query `@media (max-width: 640px)` (capa responsive existe)
    - El cuerpo del media query incluye el patrón table->cards (`attr(data-label)`) y el wrap (`flex-wrap: wrap`)
    - El media query NO contiene `display: grid` que apile match a 1 columna (afirmar que `grid-template-columns` dentro del bloque, si aparece, NO es `1fr` solo — match mantiene 2 cols): asegurar que NO se redefine `.match-grid` a una sola columna
    - index.html tiene exactamente 8 atributos `data-label` (5 home + 3 canciones)
    - index.html tiene `data-label="Examen"` y `data-label="Jugar"` (los botones clave LOCKED quedan etiquetados)
    - DESKTOP INTACTO: todo `@media` nuevo en styles.css es `max-width: 640px` (no se introdujo ningún media query que afecte a >=641px, p.ej. min-width o max-width >640)
  </behavior>
  <action>
Crear `tests/screen-responsive.test.js` siguiendo el patrón source-assert de `tests/screen-context-label.test.js`: `readFileSync` de `../styles.css` y `../index.html` vía `new URL(..., import.meta.url)`, y aserciones `node:assert/strict`.

Asserts mínimos:
1. `cssSrc.includes('@media (max-width: 640px)')`.
2. Acotar el cuerpo del/los media query(s) (slice desde la primera aparición de `@media` hasta fin de archivo) y afirmar que contiene `attr(data-label)` y `flex-wrap: wrap`.
3. Afirmar que NINGÚN `@media` del archivo apunta a desktop: extraer todas las ocurrencias de `@media` con regex y comprobar que cada una es `(max-width: 640px)` (no `min-width`, no `max-width: <N>` con N>640). Esto blinda "desktop intacto".
4. `html.match(/data-label=/g).length === 8`.
5. `html.includes('data-label="Examen"')` y `html.includes('data-label="Jugar"')`.
6. (Defensa match 2-col) afirmar que el bloque media query NO contiene una redefinición de `.match-grid` con `grid-template-columns: 1fr;` (una sola columna) — si quieres, comprobar la ausencia del literal `grid-template-columns: 1fr;` dentro del slice del media query.

Reconocer en un comentario de cabecera que el grueso de esta fase es validación VISUAL (auditoría posterior a 320/360/390px y 1024px), no unit test; estos asserts sólo blindan las invariantes estructurales (existencia del breakpoint, etiquetas de celda, desktop sin tocar).
  </action>
  <verify>
    <automated>cd /home/vcompanyb/italian-course && node --test tests/screen-responsive.test.js 2>&1 | grep -qE '# fail 0' && echo "OK nuevo test verde" || (echo "FAIL: el nuevo test no pasa"; exit 1)</automated>
  </verify>
  <done>`tests/screen-responsive.test.js` existe y pasa en verde aislado. `node --test tests/*.test.js` (glob obligatorio) reporta `# fail 1` (sólo el genero-numero preexistente) y un total de tests incrementado por los nuevos asserts — CERO fallos nuevos introducidos.</done>
</task>

</tasks>

<verification>
- `cd /home/vcompanyb/italian-course && node --test tests/*.test.js` → `# fail 1` (sólo el preexistente genero-numero 12->13). Cero fallos nuevos.
- `grep -c '@media' styles.css` → todas las ocurrencias son `(max-width: 640px)`; ninguna `min-width` ni `max-width` >640 (desktop intacto).
- `grep -c 'data-label=' index.html` → 8.
- Reconocido: la validación de aspecto real es VISUAL (auditoría posterior). Comprobar manualmente a 320/360/390px que: el botón "Examen" de home es visible y tappable; los 4 botones de home se ven (Backup incluido); la match-grid mantiene 2 columnas; la barra del cronómetro se ve en la cabecera de session; el panel confirm no se recorta. Y a 1024px/escritorio: render idéntico a hoy.
</verification>

<success_criteria>
- LOCKED #1 resuelto: en <=640px la tabla de home colapsa a tarjetas con "Examen" visible y táctil (>=44px); misma transformación en la lista de Canciones con "Jugar".
- LOCKED #2 resuelto: `.button-row` envuelve en <=640px → los 4 botones de home (incl. "Backup") visibles.
- Las 7 pantallas usables en móvil vertical según el UI-SPEC (8 secciones implementadas).
- Escritorio (>=641px) byte-idéntico: ninguna regla nueva fuera de `@media (max-width: 640px)`; `data-label` inerte en desktop.
- Suite verde salvo el 1 fallo preexistente ajeno; nuevo test de invariantes en verde.
</success_criteria>

<output>
Create `.planning/phases/28-responsive-mobile/28-01-SUMMARY.md` when done
</output>
