// src/main.js
//
// Bootstrap del proyecto. Phase 1 completo (Plan 01 + Plan 02):
//   1. loadContent(REGISTRY) — descarga, NFC, valida.
//   2. loadState() — lee localStorage (o blankState).
//   3. Si OK: registra el componente Alpine `sessionScreen(content, state)` Y
//      expone `window.__appBoot = { content, state, ready: true }` (handoff
//      diagnóstico mantenido para DevTools).
//   4. Si KO: render banner DOM directo con `textContent` (jamás interpretar
//      HTML del contenido validado) y NO se llama a `Alpine.start()`
//      (D-10: all-or-nothing boot).
//
// Patrón dual de registro Alpine (RESEARCH.md Pattern 8):
//   - `document.addEventListener('alpine:init', ...)` cubre el caso en que
//     `bootstrap()` resuelve ANTES de que Alpine haya emitido `alpine:init`.
//   - `if (window.Alpine) { Alpine.data(...); Alpine.start(); }` cubre el caso
//     en que Alpine ya emitió `alpine:init` y auto-arrancó antes de que la
//     promesa de `loadContent` resolviera (race típica con `defer + module`).
//   - `Alpine.start()` doble es no-op en Alpine 3 (verificado por la lib),
//     pero el guard `window.Alpine` evita el TypeError si Alpine aún no cargó.

import { loadContent } from './data/content-loader.js';
import { loadState } from './data/storage.js';
import { sessionScreen } from './screens/session.js';

/** Phase 1: hard-coded. Phase 2 derivará esto de `categories.json`. */
const REGISTRY = ['avere'];

async function bootstrap() {
  try {
    const content = await loadContent(REGISTRY);
    const state = loadState();

    // Handoff diagnóstico — útil para DevTools (Plan 01 lo introdujo).
    window.__appBoot = { content, state, ready: true };

    // Quitamos el placeholder ANTES de registrar Alpine — si lo dejamos,
    // Alpine podría procesarlo como árbol vacío y dar un flash visual.
    const placeholder = document.getElementById('app-placeholder');
    if (placeholder) placeholder.remove();

    // --- Registro Alpine: patrón dual para manejar ambos órdenes de carga ---
    // Path A: Alpine aún no ha emitido `alpine:init` → el listener lo capturará.
    document.addEventListener('alpine:init', () => {
      window.Alpine.data('sessionScreen', () => sessionScreen(content, state));
    });
    // Path B: Alpine YA cargó (defer-vs-module race) → registramos en caliente
    // y arrancamos. `Alpine.start()` segunda llamada es no-op en Alpine 3.
    if (window.Alpine) {
      window.Alpine.data('sessionScreen', () => sessionScreen(content, state));
      window.Alpine.start();
    }
  } catch (err) {
    const errors = err?.errors ?? [{ file: '?', reason: String(err?.message ?? err) }];
    renderValidationBanner(errors);
    window.__appBoot = { ready: false, errors };
  }
}

/**
 * Renderiza el banner de errores de validación directamente con DOM API.
 *
 * Seguridad: usamos `document.createElement` + `textContent` para CADA campo
 * proveniente del JSON. Jamás insertamos contenido vía propiedades que
 * interpreten HTML — si el JSON contiene `<script>` o `<img onerror=...>`
 * en `prompt` o `options`, eso NO debe ejecutarse.
 *
 * @param {Array<{file: string, exerciseId?: string, reason: string}>} errors
 */
function renderValidationBanner(errors) {
  const placeholder = document.getElementById('app-placeholder');
  if (placeholder) placeholder.hidden = true;

  const banner = document.createElement('article');
  banner.setAttribute('role', 'alert');
  banner.id = 'validation-banner';
  // Borde rojizo via CSS var de Pico (con fallback hex).
  banner.style.borderColor = 'var(--pico-color-red-500, #d9534f)';

  const header = document.createElement('header');
  const strong = document.createElement('strong');
  strong.textContent = 'Error en el contenido';
  header.appendChild(strong);
  banner.appendChild(header);

  const intro = document.createElement('p');
  intro.textContent = 'No se ha podido cargar el contenido. Revisa los siguientes problemas y recarga la página:';
  banner.appendChild(intro);

  const list = document.createElement('ul');
  for (const e of errors) {
    const li = document.createElement('li');
    const fileLabel = e?.file ?? '?';
    const idSuffix = e?.exerciseId ? ` / ${e.exerciseId}` : '';
    const reason = e?.reason ?? '(sin descripción)';
    // textContent escapa CUALQUIER HTML del JSON — seguridad por defecto.
    li.textContent = `[${fileLabel}${idSuffix}] ${reason}`;
    list.appendChild(li);
  }
  banner.appendChild(list);

  const slot = document.getElementById('error-banner');
  if (slot) {
    slot.hidden = false;
    slot.appendChild(banner);
  } else {
    // Fallback: si por algún motivo no hay slot, prepend al body.
    document.body.prepend(banner);
  }
}

bootstrap();
