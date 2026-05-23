<!-- GSD:project-start source:PROJECT.md -->
## Project

**Italian Course — Ejercicios A1/A2**

Web personal de ejercicios de italiano para preparar el A1 (y luego A2). Es una herramienta de auto-validación pura: repite, mezcla y obliga a re-verificar constantemente lo aprendido, garantizando que las reglas y excepciones de cada tema no se olvidan. Es para una sola persona (el autor), funciona local en su PC y desktop.

**Core Value:** **Que el sistema te obligue a no olvidar.** El motor de repetición tiene que garantizar que cada categoría se re-verifica constantemente, y que un solo fallo en cualquier ejercicio te devuelve a repetir esa categoría entera. Sin ese loop, el resto no importa.

### Constraints

- **Tech stack**: web estática (HTML + CSS + JS, sin servidor) — el autor quiere doble click y que funcione, sin instalar nada ni arrancar procesos.
- **Persistencia**: `localStorage` del navegador + export/import a JSON para backup manual — sin base de datos ni backend.
- **Hosting**: local en la máquina del autor. Sin internet, sin cuentas, sin sincronización entre dispositivos.
- **Dispositivo**: desktop only en v1; responsive móvil se evaluará después si lo echa en falta.
- **Contenido**: los ejercicios viven en archivos JSON editados a mano por el autor; no hay UI de edición todavía.
- **Idioma de la interfaz**: español (autor hispanohablante aprendiendo italiano).
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Executive Summary
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
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js** (any LTS, 20.x or 22.x) | Provides `npx` for `npx serve` | Install once from nodejs.org. No `package.json` or `npm install` needed for this project. |
| **VS Code** (or any editor) | Edit HTML, JS, JSON | The "Live Server" extension is a one-click alternative to `npx serve` that also gives auto-reload on file save. |
| **Browser DevTools** | Inspect localStorage, debug | Application tab → Local Storage shows all keys. Use `localStorage.clear()` in console to reset state during dev. |
## Installation
# One-time, system-wide
# 1. Install Node.js from https://nodejs.org (any LTS)
# Per project, one terminal command to start
# → Opens http://localhost:3000 — bookmark it.
## Component Model for the 3 Exercise Types
## JSON Content Authoring
- Editing one category doesn't risk corrupting others.
- Git diffs stay scoped (when you eventually version-control content).
- The user mentioned "cada PDF de la profesora = una categoría" — matching that 1:1 on disk is intuitive.
- Single-file approach hits friction around 1000+ lines of JSON; per-file scales further.
## Export / Import Backup Patterns
## localStorage Best Practices for This Project
| Concern | Recommendation |
|---------|---------------|
| **Size** | localStorage limit is ~5 MiB per origin in Chrome/Firefox/Safari (10 MiB total Web Storage). Estimated need: 500 exercises × ~500 bytes counters + 21-day activity log + category states ≈ well under 500 KB. Comfortable margin. |
| **Key naming** | Single namespaced root key: `italian-course-state` containing JSON-serialized full state. Avoids polluting localStorage with dozens of keys and makes export/import trivial. |
| **Write frequency** | localStorage is synchronous and blocks the main thread. Don't write on every keystroke. Write on exercise completion (a few times per minute max). Use a debounced helper if needed. |
| **JSON.stringify cost** | Negligible at this data scale (<10 ms). No need to diff or write deltas. |
| **Migration** | Store a `schemaVersion` field at the root. On boot, if `state.schemaVersion < CURRENT`, run migration functions before mounting Alpine. Critical because the user will absolutely want to add fields in v2/v3. |
## Progressive Upgrade Paths
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
- Replace Alpine.js with ~150 LOC of vanilla JS in a single `app.js` that hand-renders each exercise type into a `<div id="root">`.
- Keep everything else identical.
- Tradeoff: more boilerplate per exercise type, but zero magic. Defensible choice.
- Add Vite 5.x with `npm create vite@latest . -- --template vanilla` (or `vanilla-ts`).
- Keep Alpine.js (works fine in Vite). Keep Pico CSS.
- Adds `npm install` + `npm run dev` but gains type safety and faster reloads.
- Add a hand-written `service-worker.js` (~30 LOC) that caches `index.html`, the JS modules, the JSON files, and the CDN assets (or self-host them in `vendor/`).
- Add a `manifest.json`.
- Works alongside everything above. No framework swap.
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
