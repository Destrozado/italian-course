---
status: partial
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
result: [pending]

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
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
