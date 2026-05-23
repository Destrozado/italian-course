// src/main.js
//
// Bootstrap del proyecto. Phase 1 mínimo:
//   1. loadContent(REGISTRY) — descarga, NFC, valida.
//   2. loadState() — lee localStorage (o blankState).
//   3. Si OK: expone `window.__appBoot = { content, state, ready: true }` para
//      que Plan 02 lo recoja y arranque la UI Alpine.
//   4. Si KO: render banner DOM directo con `textContent` (jamás interpretar
//      HTML del contenido validado) y NO se llama a `Alpine.start()`
//      (D-10: all-or-nothing boot).
//
// NOTA Phase 1: este archivo todavía no registra componentes Alpine ni llama
// `Alpine.start()`. Plan 02 lo extenderá para:
//   - registrar `Alpine.data('sessionScreen', ...)`
//   - disparar `Alpine.start()` desde dentro del listener `alpine:init`
//
// Hasta entonces, Alpine se carga vía `<script defer>` y auto-arranca, pero
// sin componentes registrados no toca el DOM más que para detectar
// `x-cloak`/`x-data` (que no usamos en este HTML mínimo).

import { loadContent } from './data/content-loader.js';
import { loadState } from './data/storage.js';

/** Phase 1: hard-coded. Phase 2 derivará esto de `categories.json`. */
const REGISTRY = ['avere'];

async function bootstrap() {
  try {
    const content = await loadContent(REGISTRY);
    const state = loadState();

    // Handoff para Plan 02 — el script de la pantalla de sesión leerá esto.
    window.__appBoot = { content, state, ready: true };

    const placeholder = document.getElementById('app-placeholder');
    if (placeholder) {
      placeholder.textContent = 'App cargada. La sesión arrancará en Plan 02.';
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
