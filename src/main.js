// src/main.js
//
// Bootstrap del proyecto. Phase 1 completo (Plan 01 + Plan 02).
//
// Patrón de registro Alpine (la pieza clave que evita la race condition):
//   1. ESTE MÓDULO se declara en index.html ANTES del <script defer> de Alpine.
//   2. AL TOPE del módulo, de forma SÍNCRONA, registramos el listener
//      `alpine:init`. Para entonces Alpine aún no ha cargado (su script
//      defer corre después), así que el listener queda en su sitio antes
//      del evento.
//   3. Dentro del listener resolvemos `Alpine.data('sessionScreen', ...)`
//      pasándole una Promise que `bootstrap()` cumple cuando el contenido
//      JSON está cargado y validado.
//   4. `sessionScreen` espera esa Promise en su `init()` antes de construir
//      la sesión y poner `ready = true`. Eso permite que Alpine arranque
//      con el factory ya registrado pero sin bloquear su scan inicial.
//
// La capa del banner de error sigue siendo síncrona y vive aparte: si la
// validación falla, NUNCA resolvemos la Promise → el factory se queda
// esperando para siempre y `ready` permanece false (sale el template
// "no hay ejercicios", que en error path queda enmascarado por el banner).

import { loadContent } from './data/content-loader.js';
import { loadState } from './data/storage.js';
import { sessionScreen } from './screens/session.js';

/** Phase 1: hard-coded. Phase 2 derivará esto de `categories.json`. */
const REGISTRY = ['avere'];

/**
 * Promise que se resuelve con `{content, state}` cuando bootstrap completa
 * la carga + validación. Si bootstrap falla, esta Promise nunca resuelve
 * (intencionado — banner de error es el único output y Alpine queda en el
 * template "no ready").
 */
let resolveAppData;
const appDataReady = new Promise((resolve) => {
  resolveAppData = resolve;
});

// --- Registro SÍNCRONO del listener Alpine al cargar el módulo ---------
// Tiene que correr antes de que Alpine emita `alpine:init`. Como este
// <script type="module"> está declarado ANTES del <script defer> de Alpine
// en index.html, su cuerpo top-level corre primero y este addEventListener
// queda activo a tiempo.
document.addEventListener('alpine:init', () => {
  window.Alpine.data('sessionScreen', () => sessionScreen(appDataReady));
});

async function bootstrap() {
  try {
    const content = await loadContent(REGISTRY);
    const state = loadState();

    // Handoff diagnóstico — útil para DevTools.
    window.__appBoot = { content, state, ready: true };

    // Quitamos el placeholder. Para entonces Alpine ya puede haber arrancado
    // y mostrado el template (con `ready: false` mientras `init()` espera la
    // promise). Eliminamos el placeholder para no dejar "Cargando…" debajo.
    const placeholder = document.getElementById('app-placeholder');
    if (placeholder) placeholder.remove();

    // Cumplimos la promise — `sessionScreen.init()` (que la está esperando)
    // continúa, llama a buildSession, y pone `ready = true`. Alpine reactiva
    // y los templates condicionales muestran el ejercicio.
    resolveAppData({ content, state });
  } catch (err) {
    const errors = err?.errors ?? [{ file: '?', reason: String(err?.message ?? err) }];
    renderValidationBanner(errors);
    window.__appBoot = { ready: false, errors };
    // No resolvemos `appDataReady` — Alpine arrancará pero `sessionScreen.init()`
    // se queda esperando para siempre. `ready` permanece false. El banner queda
    // como único output (D-10: all-or-nothing boot).
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
