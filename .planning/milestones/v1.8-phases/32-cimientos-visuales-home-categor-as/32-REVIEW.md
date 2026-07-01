---
phase: 32-cimientos-visuales-home-categor-as
reviewed: 2026-06-30T00:00:00Z
depth: standard
files_reviewed: 7
files_reviewed_list:
  - app.css
  - index.html
  - src/screens/app.js
  - styles.css
  - tests/screen-canciones.test.js
  - tests/screen-examen.test.js
  - tests/screen-home-editorial.test.js
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Fase 32: Informe de Revisión de Código

**Revisado:** 2026-06-30
**Profundidad:** standard
**Archivos revisados:** 7
**Estado:** issues_found

## Resumen

Fase de rediseño visual ("Editoriale") sobre Pico CSS, brownfield. El cambio
es genuinamente acotado y disciplinado: una capa CSS nueva (`app.css`), la
reescritura del markup de Home/Categorías en `index.html`, y un único cambio
JS aditivo (campo presentacional `streakDays` en `categoriesForDisplay`).

Verificaciones del mandato de la fase, todas correctas:

- **Anti-XSS:** CERO `x-html=` en `index.html` (grep limpio). Todo el contenido
  de JSON se renderiza vía `x-text`. El nuevo subtítulo "tema" de categoría
  (`cat-topic`) y el nombre (`cat-name`) usan `x-text` con expresiones
  `split`/`slice` derivadas — no inyectan markup.
- **Fuentes offline:** las 14 declaraciones `@font-face` apuntan a rutas
  relativas `./vendor/fonts/*.woff2`; los 14 ficheros existen en disco
  (verificado). CERO referencias a `fonts.googleapis.com` / `fonts.gstatic.com`
  ni ningún `@import http`/`url(https://...)` en `app.css` ni `styles.css`.
- **Motor intacto:** el diff de `src/screens/app.js` es exactamente
  `+streakDays: streak` en el return del getter. No toca la cascada D-54
  (sigue en 2 call-sites de `applyImmediateFailure`), ni schema, ni
  migraciones, ni el sampler.
- **CDN/SRI:** los `integrity`/`crossorigin` de Pico y Alpine en `index.html`
  NO se modificaron.
- **Cascada CSS:** `app.css` se enlaza después de `styles.css`; los `badge-*`
  viven solo en `styles.css` (sin duplicación/pelea entre hojas). Los
  `var(--ed-*)` resuelven en use-time, así que el orden de parseo no rompe la
  resolución de custom properties.
- **Tests:** los 3 ficheros de test (62 asserts) pasan en verde
  (`node --test`).

No se encontraron bloqueantes. Dos warnings de robustez de bajo riesgo y dos
notas informativas.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Asimetría de robustez entre la etiqueta de racha y el ancho de la barra

**Archivo:** `src/screens/app.js:2979,3003` + `index.html:235`
**Issue:** El campo crudo `streakDays` se expone como `streak = progress?.streakDays ?? 0`. El `?? 0` solo protege contra `null`/`undefined`, NO contra valores no numéricos. La etiqueta `streakLabel` SÍ está endurecida vía `formatStreak()` (línea 3104), que clampa `NaN`/negativo/no-número a 0. La barra de racha, en cambio, consume el valor crudo:

```html
:style="`width: ${Math.min(cat.streakDays / 21 * 100, 100)}%`"
```

Si `state.categoryProgress[id].streakDays` llegara como un valor corrupto no numérico (p.ej. de un backup importado/editado a mano), `streakLabel` mostraría coherentemente "0 / 21 d", pero la barra evaluaría `NaN / 21 * 100` → `Math.min(NaN, 100)` → `NaN`, produciendo `width: NaN%` (declaración inválida, ignorada por el navegador → barra en estado indefinido). El dominio actual garantiza `streakDays >= 0` entero (`progress.js`), por eso el riesgo es latente, no activo — pero la incoherencia entre las dos rutas de render del MISMO dato es un foco de bug futuro.
**Fix:** Reusar el mismo saneo que `formatStreak` para el valor que alimenta la barra, o sanear una sola vez en el getter:
```js
const rawStreak = progress?.streakDays;
const streak = (typeof rawStreak === 'number' && rawStreak >= 0 && !Number.isNaN(rawStreak)) ? rawStreak : 0;
// ... streakDays: streak  (ya saneado → barra y label comparten fuente)
```
Así la barra y la etiqueta derivan del mismo número saneado y nunca divergen.

### WR-02: El subtítulo "tema" se trunca con nombres de categoría con `(` sin `)` de cierre

**Archivo:** `index.html:222-224`
**Issue:** El subtítulo en cursiva extrae el texto del paréntesis:
```html
x-text="cat.name.includes('(') ? cat.name.slice(cat.name.indexOf('(') + 1, cat.name.lastIndexOf(')')).trim() : ''"
```
Si el nombre contiene `(` pero NO `)` (p.ej. un nombre mal tecleado a mano en el JSON: `"Verbos (presente"`), `lastIndexOf(')')` devuelve `-1`, y `slice(indexOf+1, -1)` recorta el ÚLTIMO carácter en lugar de mostrar el resto, produciendo un subtítulo silenciosamente cortado ("present" en vez de "presente"). No crashea ni es XSS (sigue siendo `x-text`), pero degrada el contenido sin señal. El contenido es JSON editado a mano (constraint del proyecto), así que la entrada malformada es plausible.
**Fix:** Guardar la presencia del cierre antes de hacer slice, o derivar el subtítulo en el getter `categoriesForDisplay` (donde ya hay JS imperativo y es testeable):
```js
// en categoriesForDisplay, junto a name:
const open = cat.name.indexOf('(');
const close = cat.name.lastIndexOf(')');
const catTopic = (open !== -1 && close > open) ? cat.name.slice(open + 1, close).trim() : '';
const catTitle = open !== -1 ? cat.name.slice(0, open).trim() : cat.name.trim();
```
Mover la lógica al getter también saca expresiones complejas del template (más fácil de testear unitariamente) y mantiene `index.html` declarativo.

## Info

### IN-01: Mención huérfana de `.home-actions` en comentario de `styles.css`

**Archivo:** `styles.css:72`
**Issue:** El bloque de comentario de `.button-row` referencia `.home-actions` como el "fix inicial" histórico, pero esa clase ya no existe en ninguna hoja ni en el markup (verificado: única aparición es el comentario). Es ruido documental que puede confundir a un lector futuro buscando el selector.
**Fix:** Reformular el comentario para dejar claro que `.home-actions` fue reemplazado por `.button-row` y ya no existe (o eliminar la referencia al nombre concreto).

### IN-02: Comentarios "verbatim" extensos describen valores que la fase no puede verificar automáticamente

**Archivo:** `app.css:11-13,131,170,236,etc.`
**Issue:** Numerosos comentarios afirman fidelidad "verbatim" / "medidas EXACTAS" del handoff (off-grid 22px, sombra `.26` vs `.28`, gap 13px, padding 7px 15px, etc.). Son correctos como intención de diseño, pero ningún test los blinda — un cambio accidental de `.26` a `.28` o de `22px` a `24px` no rompería ningún assert. No es un defecto del código actual; es una nota de mantenibilidad: la "fuente de verdad" vive en un comentario, no en un test ni en un token nombrado validable.
**Fix:** Opcional — si estas medidas son contractuales, considerar un test de presencia mínimo (p.ej. assert de que `--ed-shadow-cta` contiene `.26` y `--ed-space-screen` es `22px`), análogo a los presence-checks ya existentes en `screen-home-editorial.test.js`. Bajo coste, cierra la regresión silenciosa de tokens.

---

_Revisado: 2026-06-30_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: standard_
