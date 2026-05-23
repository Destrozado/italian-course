// src/main.js
//
// Bootstrap del proyecto. Phase 1 + Phase 2 (Plans 02-01, 02-02, 02-03).
//
// Patrón de registro Alpine (la pieza clave que evita la race condition
// descubierta en UAT 01-02):
//   1. ESTE MÓDULO se declara en index.html ANTES del <script defer> de Alpine.
//   2. AL TOPE del módulo, de forma SÍNCRONA, registramos el listener
//      `alpine:init`. Para entonces Alpine aún no ha cargado (su script
//      defer corre después), así que el listener queda en su sitio antes
//      del evento.
//   3. Dentro del listener resolvemos `Alpine.data('appShell', ...)`
//      pasándole una Promise que `bootstrap()` cumple cuando el contenido
//      JSON está cargado y validado.
//   4. `appShell.init()` espera esa Promise antes de marcar `ready = true`
//      y de quedar en pantalla `home`. Eso permite que Alpine arranque
//      con el factory ya registrado pero sin bloquear su scan inicial.
//
// Boot pipeline (Phase 2 ampliado):
//   1. Lee `content/categories.json` para derivar `categoryIds` dinámicamente
//      (NO hard-coded `['avere']` — añadir categorías al JSON debe funcionar
//      sin tocar código).
//   2. `loadContent(categoryIds)` — fetch + NFC normalize + schema validate.
//   3. `loadState()` — devuelve v2 state (migrate1to2 corre transparente).
//   4. `applyNewExerciseRegression(state, content)` — DOMAIN-06 / D-40: las
//      categorías `hecha`/`dominada` con ejercicios nuevos regresan a
//      `no-hecha` ANTES de que la home las muestre. Si hubo regresión,
//      persistimos el state.
//   5. Resolvemos `appDataReady` con `{content, state}`.
//
// La capa del banner de error sigue siendo síncrona y vive aparte: si la
// validación falla, NUNCA resolvemos la Promise → el factory se queda
// esperando para siempre y `ready` permanece false (no se ve la app, solo
// el banner como output único — D-10 all-or-nothing).

import { loadContent } from './data/content-loader.js';
import { loadState, saveState } from './data/storage.js';
import { applyNewExerciseRegression } from './domain/progress.js';
import { appShell } from './screens/app.js';

/**
 * Promise que se resuelve con `{content, state}` cuando bootstrap completa
 * la carga + validación + boot regression. Si bootstrap falla, esta Promise
 * nunca resuelve (intencionado — banner de error es el único output y
 * Alpine queda en el placeholder removed pero sin contenido reactivo visible).
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
  window.Alpine.data('appShell', () => appShell(appDataReady));
});

async function bootstrap() {
  try {
    // 1. Derivar categoryIds desde categories.json (Phase 2: no hard-coded).
    //    `loadContent` luego volverá a fetchear el mismo archivo internamente;
    //    el cost es ~1 KB y no perceptible. Si emerge como problema, se puede
    //    refactorizar loadContent para devolver también categories.json.
    const categoriesIndex = await fetch('content/categories.json').then(r => {
      if (!r.ok) throw new Error(`No se pudo cargar content/categories.json: HTTP ${r.status}`);
      return r.json();
    });
    const categoryIds = (categoriesIndex?.categories ?? []).map(c => c.id);

    // 2. Load + validate content (NFC normalize, schema validate).
    const content = await loadContent(categoryIds);

    // 3. Load state (auto-migrate v1 → v2 vía storage.js).
    const state0 = loadState();

    // 4. DOMAIN-06 boot regression (D-40, Pitfall #10): categorías
    //    `hecha`/`dominada` con ejercicios nuevos regresan a `no-hecha`.
    //    `clearedExerciseIds` se PRESERVA — los aciertos previos siguen
    //    contando para futuras sesiones. Persistimos sólo si hubo cambio
    //    (evita writes innecesarios al boot — la función puede devolver el
    //    mismo objeto si no hubo regresión, comparable por identidad).
    const state = applyNewExerciseRegression(state0, content);
    if (state !== state0) {
      saveState(state);
    }

    // Handoff diagnóstico — útil para DevTools.
    window.__appBoot = { content, state, ready: true };

    // Quitamos el placeholder. Para entonces Alpine ya puede haber arrancado
    // y mostrado el template (con `ready: false` mientras `init()` espera la
    // promise). Eliminamos el placeholder para no dejar "Cargando…" debajo.
    const placeholder = document.getElementById('app-placeholder');
    if (placeholder) placeholder.remove();

    // 5. Cumplimos la promise — `appShell.init()` (que la está esperando)
    //    continúa: asigna content/state, `ready = true`, queda en `home`.
    //    Alpine reactiva y los templates condicionales muestran la home.
    resolveAppData({ content, state });
  } catch (err) {
    const errors = err?.errors ?? [{ file: '?', reason: String(err?.message ?? err) }];
    renderValidationBanner(errors);
    window.__appBoot = { ready: false, errors };
    // No resolvemos `appDataReady` — Alpine arrancará pero `appShell.init()`
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
