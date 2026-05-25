---
status: partial
phase: 08-modo-examen-por-categoria
source: [08-VERIFICATION.md]
started: 2026-05-25T21:00:00Z
updated: 2026-05-25T21:00:00Z
---

# Phase 8: Modo Examen por categoría — Human UAT

> Verificación automática completa (9/9 truths). Estas 5 pruebas requieren browser + Alpine runtime + localStorage activo para validar el comportamiento end-to-end de la UI reactiva.

**Cómo correr:** `npx serve` en `/home/vcompanyb/italian-course`, abrir `http://localhost:3000`, ejecutar cada prueba marcando el resultado. Para reset entre pruebas: DevTools → Application → Local Storage → `localStorage.clear()` + recarga.

## Current Test

[awaiting human testing]

## Tests

### UAT-08-01 — Flujo básico Examen sin conflicto

- **status:** pending
- **test:** Desde home, click `Examen` en una categoría con ejercicios (ej. Avere — 23 ejercicios) sin Test completo activo.
- **expected:** Arranca directamente sesión Test completo de Avere — pantalla `Ejercicio 1 / 23`, sessionMode='test-completo'. NO pasa por picker, NO muestra confirmación previa.
- **why_human:** Requiere Alpine runtime + localStorage init — el factory `appShell` no es instanciable bajo node sin Alpine.

### UAT-08-02 — Flujo conflict con Test Completo activo (6ª call-site D-44)

- **status:** pending
- **test:** Arrancar un Test Completo regular (Repaso 20 NO, debe ser Test completo desde home). En cualquier momento mid-sesión, volver al home (← Volver al home). Desde home, click `Examen` en otra categoría distinta.
- **expected:** Aparece panel `.confirm-inline` (top-right) con el mensaje literal:
  - **Mensaje:** `Ya hay un Test completo en curso. ¿Descartarlo y empezar uno nuevo?`
  - **Botón Confirm:** `Descartar y empezar` (al click → descarta el inFlightTest previo + arranca el Examen nuevo)
  - **Botón Cancel:** `Cancelar` (al click → cierra panel + state intacto, el Test previo sigue persistido)
- **why_human:** Comportamiento del `confirmDialog` reactivo de Alpine — no testable por grep/presence-check.

### UAT-08-03 — Botón disabled en cat con 0 ejercicios

- **status:** pending
- **test:** Crear temporalmente una categoría vacía en `content/categories.json` (ej. añadir `{"id":"prueba","name":"Prueba","order":99}`) SIN crear `content/exercises/prueba.json`, o usar DevTools para forzar `categoriesForDisplay` con una cat de `totalCount: 0`. Recargar la página.
- **expected:**
  1. La fila de la cat aparece con el botón `Examen` en estado disabled (opacity ~0.5 Pico default).
  2. Hover sobre el botón muestra tooltip nativo: `No hay ejercicios en esta categoría`.
  3. El botón NO es clickeable.
  4. Tras la prueba: revertir el cambio en `categories.json`.
- **why_human:** Estado visual disabled de Pico + tooltip HTML nativo — requiere browser.

### UAT-08-04 — Reanudar Examen abandonado

- **status:** pending
- **test:** Click `Examen` en Avere → arranca sesión. Cerrar la pestaña/ventana sin terminar (a mitad de algún ejercicio). Reabrir `http://localhost:3000`.
- **expected:**
  1. Home muestra el banner generic: `⚠ Tienes un Test completo a medias — X/23 ejercicios` (copy genérica D-183, NO "Examen de Avere a medias").
  2. Click `Reanudar` → reconstruye la sesión con los MISMOS ejercicios persistidos (1 cat: Avere).
  3. La sesión retoma el cursor donde se dejó.
  4. Click `Descartar` (en el banner) → limpia inFlightTest, banner desaparece.
- **why_human:** Persistencia inFlightTest + UI banner reanudar + reconstrucción de sesión desde state — requiere browser con localStorage activo.

### UAT-08-05 — Completar Examen sin fallar (promoción DOMAIN-04)

- **status:** pending
- **test:** Click `Examen` en una cat pequeña (Avere 23 ejercicios es manejable) → completar TODOS los ejercicios sin fallar ninguno.
- **expected:**
  1. Al final, aparece pantalla summary con delta de la 1 cat examinada (sin cambios visuales vs Test Completo regular — D-191).
  2. Si Avere no estaba ya en estado `dominada`, pasa a estado `hecha` (DOMAIN-04 promoción aplica igual — D-190).
  3. Si fallas deliberadamente 1 ejercicio durante el Examen → al final cat vuelve a `no-hecha` + racha 0 (cascada D-54 aplica igual).
  4. Botón `Reiniciar ejercicios` está visible solo si fue Repaso; en Examen (test-completo) el botón Reiniciar NO debe aparecer (mismo comportamiento que Test Completo regular).
- **why_human:** Flujo completo de sesión + applySessionResult + render summary + promoción + Reset-Repaso conditional render — requiere Alpine runtime y 23+ ejercicios reales.

## Gaps

(No gaps from automated verification — 9/9 truths verified. Si alguna UAT falla, registrar aquí.)
