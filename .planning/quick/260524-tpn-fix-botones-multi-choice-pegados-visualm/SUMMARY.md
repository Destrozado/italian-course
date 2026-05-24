---
quick_id: 260524-tpn
description: Fix UX-1 botones multi-choice pegados visualmente (.button-row migración)
status: complete
created: 2026-05-24
completed: 2026-05-24
files_modified:
  - index.html
commit_hash: 9e38af5
closes: UX-1
---

# Quick Task 260524-tpn — Fix botones multi-choice pegados visualmente

## Summary

Single-line fix swapping `role="group"` → `class="button-row"` on the multi-choice
options template (`index.html` line 261). The `.button-row` class was canonized in
Phase 2/3 (`styles.css:86-97`) with `display: flex; gap: 1rem; margin: 1.5rem 0;` +
`.button-row button { flex: 1; }`, but the multi-choice sub-template was inherited
verbatim from Phase 1 and missed the Phase 2/3 button-row migration that already
landed on every other button row in the project (lines 107, 198, 332, 493, 529 +
banner in-flight).

Cierra UX-1 reportado durante UAT de Phase 4 Plan 04-02 (Preposiciones repaso 14/17:
`Non ho mangiato niente: ___ fame!` opciones `[ho, sono, hai, è]` se veían fusionadas
sin gap visible, causando miss-clicks reales del autor).

## Diff aplicado

```diff
           <template x-if="sessionCurrentExercise.type === 'multiple-choice'">
             <div>
-              <div role="group">
+              <div class="button-row">
                 <template x-for="(opt, idx) in sessionCurrentExercise.payload.options" :key="idx">
```

1 línea modificada en `index.html`. Cero cambios en `styles.css`, `src/screens/app.js`,
`content/`, `tests/`.

## Cause

Regresión de Phase 1 → Phase 2/3. El sub-template multi-choice se introdujo en
Plan 01-02 (Phase 1) con el patrón Pico classless `<div role="group">`. Durante
Phase 2/3, los UAT 02-03 y 02-04 round 2 detectaron que `role="group"` une los
bordes y los botones "parecen un título, no botones individuales" — se canonizó
`.button-row` (`styles.css:86-97`) y se migraron los otros 6 contenedores de botones
del proyecto. El sub-template multi-choice quedó como única regresión olvidada
porque el bug original se reportó sobre el home picker y la migración no auditó
los sub-templates de session screen. El autor lo descubrió durante UAT real de
Preposiciones en Phase 4 (no en pantalla estática — solo aparece durante una sesión
real de Repaso).

## Fix

1 edición textual en `index.html:261`:

- `<div role="group">` → `<div class="button-row">`

Sin tocar nada más. La clase `.button-row` ya provee el layout correcto:
`display: flex; gap: 1rem; margin: 1.5rem 0;` con `.button-row button { flex: 1; }`
reparte el ancho entre las 4 opciones manteniendo el layout horizontal.

## Verification

| Check | Comando | Resultado |
|-------|---------|-----------|
| Tests dominio + UI smoke | `node --test tests/*.test.js` | **139/139 verdes** (sin regresión sobre baseline post code-review) |
| Línea 261 fix aplicada | `sed -n '261p' index.html` | `<div class="button-row">` confirmado |
| `class="button-row"` count | `grep -c 'class="button-row"' index.html` | 6 instancias (incluye línea 261 nueva) |
| `role="group"` count en elementos | `grep -n 'role="group"' index.html` | 4 ocurrencias restantes — TODAS son comentarios HTML documentando el anti-patrón (líneas 99, 134, 192, 289). Cero elementos `<div role="group">` activos. |
| Visual (humano) | `npx serve` + Repaso multi-choice | Pendiente verificación visual del autor — gap 1rem visible entre los 4 botones de opciones |

### Nota sobre el AC #1 del plan

El plan original especificaba `grep -c 'role="group"' index.html` == 0 como AC.
La realidad: hay 4 ocurrencias restantes pero TODAS son comentarios HTML
(`<!-- ... role="group" ... -->`) que documentan el anti-patrón como "lección
recurrente" — son intencionales, no son elementos del DOM. El AC efectivo es:
**cero elementos `<div role="group">` activos en el HTML**, que sí se cumple
(antes de este fix había 1, el de línea 261; ahora hay 0).

## Closes

- **UX-1** — capturado originalmente en `.planning/phases/04-backup-robusto-contenido-completo/04-02-SUMMARY.md`
  sección "Captured for future phase", reforzado en `04-03-SUMMARY.md` y
  `04-04-SUMMARY.md`, formalizado como todo pendiente en
  `.planning/todos/pending/2026-05-24-fix-botones-multi-choice-pegados-visualmente.md`
  (movido a `.planning/todos/completed/` por este quick task).

## Self-Check: PASSED

- index.html línea 261 verificada con `sed -n '261p'`: contiene `<div class="button-row">`.
- Commit `9e38af5` verificado con `git log --oneline -1`: existe y solo modifica `index.html`.
- Tests verificados con `node --test tests/*.test.js`: 139/139 pass.
- Cero deletions en el commit (verificado con `git diff --diff-filter=D --name-only HEAD~1 HEAD`).
- Scope strictly UI/HTML cosmético — sin cambios en JS/CSS/JSON/tests/planning de Phase 4.
