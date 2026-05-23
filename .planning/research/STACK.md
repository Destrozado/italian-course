# Stack Research

**Domain:** Personal static web quiz app (Italian A1/A2 self-study), single-user, desktop-first, no backend, localStorage persistence, JSON-defined exercises
**Researched:** 2026-05-23
**Confidence:** HIGH

## Executive Summary

**Primary recommendation: Alpine.js 3.x + Pico CSS 2.x + vanilla ES modules, served via `npx serve` (one-line command), no build step, no `npm install`, no bundler.**

The "doble click y funciona" wish is partially incompatible with the rest of the requirements. Three browser security policies force a tiny concession:

1. **Firefox blocks `localStorage` under `file://`** with a `SecurityError`. Chrome allows it but treats every `file://` document as the same origin (cross-contamination risk between unrelated local HTML files).
2. **`fetch()` of local JSON files is blocked by CORS** in every modern browser under `file://`. You cannot load `categorias/avere.json` from a `file://` page.
3. **ES module `import` statements** are also blocked under `file://` (same-origin policy applied to module graph).

This means either (a) inline all JS and JSON into a single HTML file (loses JSON-edit-by-hand ergonomics), or (b) accept one terminal command. The recommended path is (b): the user runs `npx serve` once in the project folder. It downloads on first use (~5 seconds), then `npx serve` starts in <1 second every subsequent time. Bookmark `http://localhost:3000` and it's effectively as fast as a double-click. No `npm install`, no `package.json` required.

The framework choice **Alpine.js** wins because (a) it loads via a single `<script defer>` CDN tag with zero build, (b) its declarative `x-data`/`x-model`/`x-show` directives map perfectly to the 3 exercise types where most logic is "user clicks, UI changes", (c) it composes with hand-edited HTML so the user can read his own code, and (d) it can be removed later with minimal rewrite if needs change.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Alpine.js** | 3.15.x (latest 3.x) | Reactive UI directives (`x-data`, `x-model`, `x-show`, `x-for`) | Single `<script>` tag, no build, no `npm install`. Reactivity exactly at the level needed for quiz UIs (toggle states, render exercise lists, bind answers). 17 KB gzipped. Plays well with hand-written HTML — the user sees his own DOM, not a virtual one. |
| **Pico CSS** | 2.1.1 | Classless CSS framework, auto dark mode, sensible defaults | One `<link>` tag, no build. "Classless" means `<button>`, `<form>`, `<table>` look good without sprinkling utility classes everywhere. Perfect for a personal tool where every CSS minute is friction. ~10 KB gzipped. |
| **Vanilla ES modules** | n/a (browser-native) | Code organization (`import`/`export` between `.js` files) | Splits logic cleanly across `quiz.js`, `storage.js`, `exercises.js`, etc. Native to every modern browser. No bundler needed. Requires a local server (see below), but no toolchain. |
| **localStorage** (Web Storage API) | n/a (browser-native) | Persist progress, counters, streak data, exercise definitions overlay | ~5 MiB per origin in every modern browser (10 MiB total across local + session). More than enough for ~50–500 exercises × counters × 21-day activity log. Synchronous API, trivial to use. |
| **Native `<input type="file">` + Blob download** | n/a (browser-native) | JSON export/import for backup | Works on `file://` AND `http://localhost`. No File System Access API needed (Firefox/Safari don't support it). User picks a file to import, or clicks "Download backup" to save current state as a `.json`. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Alpine.js Persist plugin** | 3.15.x (same as core) | Auto-sync `x-data` properties to localStorage | If you want a property like `state.exercises[id].vecesRealizadas` to persist automatically without writing `localStorage.setItem` calls. Optional — manual `localStorage.setItem`/`getItem` in a single `storage.js` module is also fine and arguably clearer for this project. |
| **`npx serve`** | latest | One-command local HTTP server | The "doble click y funciona" replacement. After installing Node.js once, `npx serve` in the project folder starts a server in seconds with no config and no `npm install` step (npx caches it). |

**Deliberately NO validation library in v1.** The user authors JSON by hand and is the only consumer. A 30-line custom `validateExercise(obj)` function that throws human-readable errors at app load time is more useful than a 6 KB Zod/Valibot dependency. If validation grows complex later, add **Valibot 1.x** (~1.4 KB gzipped tree-shaken) over Zod or Ajv. See "What NOT to Use" below.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js** (any LTS, 20.x or 22.x) | Provides `npx` for `npx serve` | Install once from nodejs.org. No `package.json` or `npm install` needed for this project. |
| **VS Code** (or any editor) | Edit HTML, JS, JSON | The "Live Server" extension is a one-click alternative to `npx serve` that also gives auto-reload on file save. |
| **Browser DevTools** | Inspect localStorage, debug | Application tab → Local Storage shows all keys. Use `localStorage.clear()` in console to reset state during dev. |

## Installation

There is intentionally no `npm install` step. The entire setup is:

```bash
# One-time, system-wide
# 1. Install Node.js from https://nodejs.org (any LTS)

# Per project, one terminal command to start
cd italian-course
npx serve .
# → Opens http://localhost:3000 — bookmark it.
```

The HTML pulls Alpine and Pico from CDN with hardcoded versions:

```html
<!-- In index.html <head> -->
<link rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/[email protected]/css/pico.min.css">
<script defer
        src="https://cdn.jsdelivr.net/npm/[email protected]/dist/cdn.min.js"></script>
```

**Pin the versions** (`@2.1.1`, `@3.15.12`) instead of `@2`/`@3.x.x` so the app doesn't silently break when a maintainer ships a breaking change on the floating tag. Update deliberately, not automatically.

For fully-offline use (e.g. no internet), download both files once into `vendor/pico.min.css` and `vendor/alpine.min.js` and change the `href`/`src` to relative paths. The app then works with zero internet dependency.

## Component Model for the 3 Exercise Types

Recommended pattern: **one Alpine component per exercise type, dispatched by a top-level `<template x-if>`**. Each exercise object in JSON has a `tipo` field (`"choice" | "translate" | "match"`) and the renderer picks the right component.

Sketch:

```html
<div x-data="quizSession()">
  <template x-for="ej in ejerciciosActuales" :key="ej.id">

    <template x-if="ej.tipo === 'choice'">
      <div x-data="choiceExercise(ej)"> ... </div>
    </template>

    <template x-if="ej.tipo === 'translate'">
      <div x-data="translateExercise(ej)"> ... </div>
    </template>

    <template x-if="ej.tipo === 'match'">
      <div x-data="matchExercise(ej)"> ... </div>
    </template>

  </template>
</div>
```

Each `xxxExercise(ej)` function lives in `src/exercises/<tipo>.js` and returns `{ seleccion, verificar(), resultado, ... }`. The top-level `quizSession()` lives in `src/session.js` and owns the priority queue, the "fall back N categorias" logic, and the streak counter.

This keeps each exercise type in its own file, each ~50–150 LOC, with no framework magic.

## JSON Content Authoring

**Recommended structure: one JSON file per category, loaded eagerly at app boot.**

```
content/
  categorias.json           # index: list of categories with metadata
  ejercicios/
    avere.json
    genero-numero.json
    verbos-movimiento.json
    profesiones.json
    sustantivos-irregulares.json
    preposiciones.json
```

Why per-category files instead of one giant file:
- Editing one category doesn't risk corrupting others.
- Git diffs stay scoped (when you eventually version-control content).
- The user mentioned "cada PDF de la profesora = una categoría" — matching that 1:1 on disk is intuitive.
- Single-file approach hits friction around 1000+ lines of JSON; per-file scales further.

A single `content/categorias.json` declares the load order; the app `fetch()`-es each referenced file at startup. This works on `http://localhost` (the only mode you need) and gives the user one-file-at-a-time editing.

**Validation strategy for v1: a hand-written validator.** A function like:

```js
function validarEjercicio(ej, archivo) {
  if (!ej.id) throw new Error(`[${archivo}] ejercicio sin 'id'`);
  if (!['choice','translate','match'].includes(ej.tipo))
    throw new Error(`[${archivo}/${ej.id}] tipo invalido: ${ej.tipo}`);
  // ... 10–20 more lines, with helpful messages
}
```

Run it once at app boot and show a big red banner if anything fails. Total dependency cost: zero. Total maintenance cost: low because the user is the only author.

## Export / Import Backup Patterns

**Export (download backup):**

```js
const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = `italian-course-backup-${new Date().toISOString().slice(0,10)}.json`;
a.click();
URL.revokeObjectURL(a.href);
```

Works on every browser, file:// and http:// both.

**Import (restore backup):**

```html
<input type="file" accept=".json" @change="importarBackup($event.target.files[0])">
```

```js
async function importarBackup(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  // validar shape, luego sobreescribir state
  Object.assign(state, data);
  localStorage.setItem('italian-course-state', JSON.stringify(state));
}
```

No drag-drop in v1 — `<input type="file">` is one line and matches user expectations.

**Deliberately NOT using `showSaveFilePicker` / `showOpenFilePicker`** (File System Access API). Firefox and Safari don't support it. The Blob+anchor + `<input type="file">` pattern works everywhere with no fallback code.

## localStorage Best Practices for This Project

| Concern | Recommendation |
|---------|---------------|
| **Size** | localStorage limit is ~5 MiB per origin in Chrome/Firefox/Safari (10 MiB total Web Storage). Estimated need: 500 exercises × ~500 bytes counters + 21-day activity log + category states ≈ well under 500 KB. Comfortable margin. |
| **Key naming** | Single namespaced root key: `italian-course-state` containing JSON-serialized full state. Avoids polluting localStorage with dozens of keys and makes export/import trivial. |
| **Write frequency** | localStorage is synchronous and blocks the main thread. Don't write on every keystroke. Write on exercise completion (a few times per minute max). Use a debounced helper if needed. |
| **JSON.stringify cost** | Negligible at this data scale (<10 ms). No need to diff or write deltas. |
| **Migration** | Store a `schemaVersion` field at the root. On boot, if `state.schemaVersion < CURRENT`, run migration functions before mounting Alpine. Critical because the user will absolutely want to add fields in v2/v3. |

**When to escalate to IndexedDB:** never, for this app. The data shape (counters, flags, simple lists) and total volume (<500 KB) fit localStorage with room to spare. IndexedDB's async API, transactions, and object stores are overkill and would slow down development. Reconsider only if (a) raw audio/image content gets stored per exercise, or (b) the activity log grows to >1 MB.

## Progressive Upgrade Paths

The stack is chosen so that each future requirement adds layers, not rewrites.

| Future need | Effort | Path |
|-------------|--------|------|
| **Responsive mobile UI** | Low (~hours) | Pico CSS is responsive by default. Add a couple of media queries in a custom `app.css` for the few non-Pico pieces (exercise word-button grids, match columns). No framework swap needed. |
| **Tiny local Node/Express server** | Low (~hours) | Add a `server.js` that serves the static files AND exposes `POST /api/save` to persist state to disk instead of localStorage. The frontend swaps `localStorage.setItem` for `fetch('/api/save', ...)`. Alpine components don't change. |
| **Cloud sync** | Medium (~days) | Same swap as above, but the server runs on Vercel/Fly/Render. Add authentication only if you ever expose it publicly (the user said single-user, so a hardcoded API key in env vars is enough). |
| **Build step / TypeScript** | Medium (~days) | Drop in **Vite 5.x** (`npm create vite@latest`). Move JS to TS. Alpine has community type defs. Pico CSS unchanged. Worth it only if the app grows past ~2000 LOC of JS. |
| **Component testing** | Low (~hours) | **Vitest 2.x** + **happy-dom** or **jsdom**. Test the pure logic (priority queue, streak math, validators) without testing Alpine directives. The framework choice doesn't force a testing strategy. |
| **AI-generated exercises from PDFs** | High | Out of stack scope — it's a content-generation pipeline, not a runtime concern. Stack stays the same; you just produce more JSON. |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Alpine.js** | **Vanilla JS + light DOM helpers** (~200 LOC of `render(state)` style code) | If the user wants ZERO framework dependency and is comfortable writing manual DOM updates. Adds maybe 20–30% more code per exercise type. Honest option for someone who likes "no magic". |
| **Alpine.js** | **Preact 10.x + htm** (no JSX, no build) | If the user later wants component composition and props more like React. Preact is ~4 KB gzipped, `htm` lets you write JSX-like markup without a compiler. Worth considering only if Alpine's directive syntax starts feeling limiting. |
| **Alpine.js** | **Lit 3.x web components** | If standards purity is valued over ergonomics. Web Components have a steeper API surface (`customElements.define`, shadow DOM, attribute observers) and don't deliver more value for a personal quiz app. |
| **Alpine.js** | **htmx** | NOT a fit. htmx is designed around HTML-over-the-wire from a server. With no backend, you'd be working against the grain. |
| **Pico CSS** | **Vanilla CSS** (~300 lines hand-written) | If the user enjoys CSS and wants total control over visual identity. Pico saves time, not capability. |
| **Pico CSS** | **Tailwind CSS via CDN (Play CDN)** | Only if the user loves utility-first workflows. Tailwind Play CDN works no-build but ships ~3 MB of unused styles to the browser; fine for a personal tool, not great for principle. |
| **Pico CSS** | **simple.css** or **water.css** | Both are classless-and-minimal like Pico. Pico is better-maintained in 2025/2026 and has dark mode built in. |
| **Per-category JSON files** | **Single `ejercicios.json`** | Use only if the user prefers one-file authoring and exercise count stays under ~50 total. Above that, scrolling becomes painful and diff noise multiplies. |
| **Hand-written validator** | **Valibot 1.x** (~1.4 KB) | Use when (a) JSON authoring rules outgrow ~50 lines of validation code, or (b) the user wants type inference for an editor. Valibot beats Zod (~14 KB) on bundle, beats Ajv (~32 KB) on simplicity. |
| **`npx serve`** | **VS Code Live Server extension** | Same idea, one click instead of one command, plus auto-reload on save. Recommended secondary path for the user — pick whichever feels more natural. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **React / Vue / Svelte** | All require a build step (Vite/Webpack), `npm install`, and a `dev` process running. Directly violates "doble click y funciona". Massive over-engineering for a single-user personal tool with three exercise types. | Alpine.js (reactive enough, zero-build). |
| **Next.js / Nuxt / SvelteKit** | SSR frameworks designed for production web apps with routing, data fetching, deploys. None of those needs apply here. | Static HTML + Alpine. |
| **Webpack / Rollup / Parcel (as a bundler today)** | Adds a build step. ES modules + a local server give you the file-splitting benefit without a bundler. | Browser-native ES modules. If you ever need bundling later, jump straight to Vite, skip Webpack. |
| **Tailwind CSS with build pipeline** | Requires `tailwindcss --watch` running. Adds friction. | Pico CSS (classless, one link tag). If you want Tailwind specifically, use Play CDN. |
| **Ajv** | 32 KB gzipped. Designed for server-side JSON Schema enforcement. Massive overkill for hand-authored content. | Hand-written validator function. Or Valibot if it grows. |
| **Zod for client-side validation** | Famous but ~14 KB and primarily a TypeScript inference tool. Less value without TS. | Hand-written validator, or Valibot. |
| **IndexedDB** | Async, transactional, schema-ful — pays off only at >5 MB or with high write throughput. This app is well below both thresholds. | localStorage with a single namespaced JSON-blob key. |
| **File System Access API (`showOpenFilePicker`/`showSaveFilePicker`)** | Not supported in Firefox or Safari. Would force a fallback path anyway. | `<input type="file">` for import + Blob + anchor download for export. Universal support. |
| **localStorage under `file://`** | Firefox refuses entirely (SecurityError); Chrome treats all `file://` docs as the same origin (cross-contamination risk between unrelated local HTML files). Brittle. | Serve via `npx serve` or VS Code Live Server. One command, then it's effectively free. |
| **JSON5 / YAML for content** | Adds a parser dependency. Native `JSON.parse` is in every browser and the user is already comfortable with strict JSON. | Plain JSON files. If trailing-comma forgiveness becomes a pain point, then revisit. |
| **Floating CDN versions** (`@latest`, `@3`, `@2`) | A maintainer's accidental publish breaks the app overnight, with no error message. | Pin exact versions (`@3.15.12`, `@2.1.1`). Update deliberately. |

## Stack Patterns by Variant

**If the user wants ZERO framework whatsoever:**
- Replace Alpine.js with ~150 LOC of vanilla JS in a single `app.js` that hand-renders each exercise type into a `<div id="root">`.
- Keep everything else identical.
- Tradeoff: more boilerplate per exercise type, but zero magic. Defensible choice.

**If the user later wants a build step (e.g. for TypeScript, code-splitting, minification):**
- Add Vite 5.x with `npm create vite@latest . -- --template vanilla` (or `vanilla-ts`).
- Keep Alpine.js (works fine in Vite). Keep Pico CSS.
- Adds `npm install` + `npm run dev` but gains type safety and faster reloads.

**If the user wants the project to also run offline as a Progressive Web App:**
- Add a hand-written `service-worker.js` (~30 LOC) that caches `index.html`, the JS modules, the JSON files, and the CDN assets (or self-host them in `vendor/`).
- Add a `manifest.json`.
- Works alongside everything above. No framework swap.

**If exercise count balloons past ~500 and JSON editing becomes painful:**
- Build a minimal in-app editor view (still Alpine, ~200 LOC). Read JSON, edit, export the modified JSON for the user to commit.
- Still no backend, still localStorage.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `[email protected]` | All modern evergreen browsers (Chrome/Firefox/Safari/Edge, last 2 years) | Uses Proxy + MutationObserver — no IE/legacy support, which is irrelevant here. |
| `@picocss/[email protected]` | All modern browsers; auto dark mode via `prefers-color-scheme` | Class-based dark mode also available if user wants a manual toggle. |
| `npx serve` (current) | Node.js 14+ | Any LTS Node works. |
| Browser-native ES modules | Chrome 61+, Firefox 60+, Safari 11+ — universal in 2026 | Requires HTTP serving (works under `http://localhost`, blocked under `file://`). |
| `localStorage` | Chrome/Firefox/Safari/Edge | Works under `http://localhost` perfectly. Avoid `file://` (Firefox blocks). |

## Confidence Notes

- **HIGH confidence** on Alpine.js + Pico CSS + localStorage + `npx serve` — all are stable, mature, widely-used in 2026, with current versions verified directly against `alpinejs.dev` and `picocss.com` documentation pages.
- **HIGH confidence** on the `file://` constraints — verified across MDN, Mozilla bugzilla, and Chromium issue tracker. localStorage in Firefox under `file://` definitively returns SecurityError, and `fetch()` of local files is universally blocked under `file://`.
- **HIGH confidence** on validation-library choice (hand-written for v1) — straightforward analysis for a single-author personal tool with bounded exercise count.
- **MEDIUM confidence** on per-category JSON files being better than single file — this is a judgement call; the user's preference might flip after trying both. Easy to refactor either direction.
- **MEDIUM confidence** on Alpine being a better fit than vanilla JS for this specific user — depends on whether the user prefers declarative attribute syntax (`x-show`, `x-model`) or imperative DOM manipulation. Both work; the recommendation favors Alpine for development speed.

## Sources

- [Alpine.js Installation Docs](https://alpinejs.dev/essentials/installation) — verified current CDN URL and version recommendation (HIGH)
- [Alpine.js GitHub Releases](https://github.com/alpinejs/alpine/releases) — verified active maintenance through 2026 (HIGH)
- [Pico CSS Documentation](https://picocss.com/docs) — verified v2.1.1 and CDN URL (HIGH)
- [MDN: Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) — verified localStorage semantics and quota (HIGH)
- [Mozilla bug 507361: localStorage doesn't work in file:/// documents](https://bugzilla.mozilla.org/show_bug.cgi?id=507361) — verified Firefox behavior (HIGH)
- [MDN: showOpenFilePicker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker) — verified Firefox/Safari lack of File System Access API support (HIGH)
- [MDN: Storage quotas and eviction criteria](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — verified 5 MiB localStorage limit (HIGH)
- [whatwg/html issue 8121: module-scripts in file:// protocol](https://github.com/whatwg/html/issues/8121) — verified ES modules cannot load under `file://` (HIGH)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — verified IndexedDB is overkill for this data scale (HIGH)
- [Pico CSS: The Anti-Tailwind Framework](https://mfyz.com/pico-css-the-anti-tailwind-framework-i-actually-enjoy/) — context on classless framework value proposition (MEDIUM)
- [HTMX vs Alpine.js: When to Use Which (OpenReplay)](https://blog.openreplay.com/htmx-vs-alpine-when-use/) — confirmed htmx is server-coupled and Alpine fits client-only apps (MEDIUM)
- [Valibot vs Zod v4 (PkgPulse, 2026)](https://www.pkgpulse.com/guides/valibot-vs-zod-v4-typescript-validator-2026) — bundle-size comparison for future validation upgrade path (MEDIUM)
- [Storage for the web (web.dev)](https://web.dev/articles/storage-for-the-web) — browser storage best practices (HIGH)

---
*Stack research for: personal static web quiz app, single-user, desktop, localStorage*
*Researched: 2026-05-23*
