---
status: diagnosed
phase: 32-cimientos-visuales-home-categor-as
source: [32-VERIFICATION.md]
started: 2026-06-30T00:00:00Z
updated: 2026-06-30T00:00:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Renderizado visual del fondo papel y tipografía serif
expected: Abrir la app con `npx serve` y cargarla en el navegador. El fondo de toda la app es papel cálido (#f4f0e8), los títulos usan Spectral (serif), la interfaz no tiene azul Pico. Si el SO tiene dark mode activo, la paleta NO cambia (siempre papel).
result: ISSUE — el fondo `body` es correcto (papel), pero Pico sigue pintando sus superficies de componente encima: `<article>` usa `--pico-card-background-color` y `<header>/<footer>` usan `--pico-card-sectioning-background-color`, creando una "card" del color viejo sobre el papel. Además el banner ⚠ de export y los nombres de categoría (Avere/Essere…) quedan sin contraste (texto ≈ fondo). Ver GAP-01.

### 2. Tricolore verde/crema/rojo visible en la Home
expected: El motivo tricolore aparece sobre la cabecera "ITALIANO · A1 / A2 / Categorías" — barra horizontal ~56px de ancho, 4px de alto, tres segmentos iguales verde #2f7d56 / crema / rojo #b5412e, bordes redondeados.
result: [pending]

### 3. Responsive Home: columna móvil vs tabla editorial desktop
expected: Viewport <641px (móvil) → cada categoría en fila simple con dot + nombre/tema + streak bar + Examen en columna; capa Phase-28 (tarjetas vía data-label) intacta. Viewport >641px (desktop) → tabla editorial con 5 columnas (Estado · Categoría · Racha · Ejercicios · Examen), sin columna "Última vez", fondo papel, hairlines, serif.
result: [pending]

### 4. Fuentes cargan offline (sin red)
expected: Desconectar de internet, abrir la app, comprobar el panel Network de DevTools. Spectral, Hanken Grotesk y Space Grotesk se cargan desde vendor/fonts/ (requests locales). Cero requests a fonts.googleapis.com o fonts.gstatic.com.
result: [pending]

### 5. Colores de los dots de estado con datos reales
expected: Con categorías en distintos estados: dominada → dot verde, hecha → dot ámbar, no-hecha → dot neutro gris. La barra de racha se rellena en verde (dominada) o ámbar (hecha).
result: [pending]

## Summary

total: 5
passed: 0
issues: 1
pending: 4
skipped: 0
blocked: 0

## Gaps

### GAP-01 — Pico pinta superficies/colores de componente encima del papel (contraste roto)
status: failed
requirement: FND-03
symptom: El banner ⚠ de export ("Aún no has exportado tu progreso") y los nombres de categoría (Avere, Essere, …) no se leen — texto del mismo color que el fondo. El `<article class="home-editorial">` y sus `<header>/<footer>` muestran una card del color viejo de Pico sobre el papel.
root_cause: `app.css` fija `body { background: --ed-paper; color: --ed-ink }` pero NO remapea los custom properties de color de Pico. Pico sigue usando sus tokens de tema claro stock — `--pico-background-color`, `--pico-color`, `--pico-card-background-color`, `--pico-card-sectioning-background-color`, `--pico-muted-color`, etc. — en `<article>`, `<header>`, `<footer>`, formularios y tablas. El banner `.backup-banner` (estilado en `styles.css`) hereda colores que ya no contrastan con el papel.
fix_proposed: Añadir en `app.css` un bloque que remapee los `--pico-*` de color a la paleta Editoriale (`--ed-paper`/`--ed-ink`/`--ed-*`), de modo que toda superficie pintada por Pico herede papel/tinta. Auditar también `.backup-banner` y demás reglas heredadas de `styles.css` que asuman el tema viejo. Mantener Pico como reset/base (decisión bloqueada del UI-SPEC); NO eliminarlo salvo decisión explícita.
