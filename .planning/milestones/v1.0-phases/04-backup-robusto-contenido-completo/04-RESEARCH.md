# Phase 4: Backup robusto + contenido completo - Research

**Researched:** 2026-05-24
**Domain:** Browser Blob/FileReader APIs + JSON schema migration chains + Alpine reactivity + Italian A1 PDF-to-JSON transcription
**Confidence:** HIGH (Web APIs verified MDN 2026, code patterns verified against existing Phase 1+2+3 codebase, PDF content read directly)

---

## Summary

Phase 4 has two distinct work streams:

1. **Backup runtime feature** (small surface, well-known browser APIs): export JSON wrapper via `Blob` + `URL.createObjectURL` + anchor download; import via `<input type="file">` + `Blob.text()` (modern) or `FileReader.readAsText()` (legacy fallback); banner getter driven by Alpine reactivity over `state.lastBackupAt` / `state.firstUsedAt`; `migrate2to3` extending the existing chain in `storage.js`. All APIs are Baseline widely-available since 2015–2021. Zero new dependencies — Phase 4 stays within the locked stack (Alpine 3.15 + Pico 2.1 + vanilla ES modules + localStorage).

2. **Content transcription** (large surface, mechanical work): read each of 6 PDFs with the Read tool, propose JSON candidates matching the existing schema, validate via `npx serve` + reload in browser, commit per category. The schema validator's `PAYLOAD_VALIDATORS` dispatch table from Phase 3 is **closed and reusable as-is** — no validator changes needed. The risk surface is linguistic correctness, mitigated by per-category author review before commit.

**Primary recommendation:** Implement the backup feature as one vertical slice (one plan), then transcribe the 6 PDFs as a second plan with 6 commits (one per category, author review gate between commits). The backup feature has no dependency on the content work and can be implemented and tested against the current single-Avere content first.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Backup JSON shape + import flow:**
- **D-73:** Envoltura JSON al exportar: `{ kind: 'italian-course-backup', exportedAt, schemaVersion, state }`. El `kind` distingue backups del app de otros JSON. `exportedAt` se muestra en la confirmación. `schemaVersion` raíz redundante con `state.schemaVersion` (más visible).
- **D-74:** Validación import estricta + migración automática: (1) `JSON.parse` → error banner si falla; (2) rechaza si `kind !== 'italian-course-backup'`, `state` ausente, o `state.schemaVersion` ausente; (3) `state.schemaVersion ≤ 3` → corre cadena de migraciones (`migrate1to2`, `migrate2to3`) sobre `state` y luego `saveState`; (4) `state.schemaVersion > 3` → rechaza con banner "Este backup viene de una versión más nueva de la app".
- **D-75:** Nombre del archivo descargado: `italian-course-backup-YYYY-MM-DD.json` usando `todayLocal()`. Navegador deduplica con `(1)`, `(2)` el mismo día.
- **D-76:** Confirmación import reusa `requestConfirm()` inline (D-27) con cuerpo: fecha export local, nº categorías con progreso, nº ejercicios con stats, warning "Esto REEMPLAZARÁ tu progreso actual y no se puede deshacer", botones `Continuar` (primario) / `Cancelar`.

**Recordatorio de backup (banner 7 días):**
- **D-77:** `lastBackupAt` DENTRO del state (`italianCourse.v1.lastBackupAt`). `migrate2to3` añade el campo como `null`. Importar un backup viejo trae su `lastBackupAt`.
- **D-78:** Segundo timestamp `firstUsedAt` para gestionar "nunca exportaste". `migrate2to3` lo añade como `null`. Se setea en el primer `saveState` real (sesión completada). Lógica:
  ```
  bannerVisible =
    (lastBackupAt === null && firstUsedAt !== null && daysSince(firstUsedAt) > 7)
    || (lastBackupAt !== null && daysSince(lastBackupAt) > 7)
  ```
- **D-79:** Timestamp en ISO UTC (`new Date().toISOString()`). Comparación "han pasado N días" usa `todayLocal()` + aritmética días locales (coherente con DOMAIN-07 `lastSuccessDate` + `dailyLog`). Helper `daysSinceISO(iso, todayStr)` puro en `src/domain/dates.js`.
- **D-80:** Banner persistente en home, sin snooze. Texto: "⚠ Han pasado N días desde tu último backup" (o "⚠ Aún no has exportado tu progreso" si null) + link/botón "Ir a Backup". Arriba de la tabla. Desaparece al exportar.

**Navegación pantalla Backup:**
- **D-81:** Botón secundario "Backup" en home junto a los dos botones principales. Clase Pico `secondary`. Visible siempre.
- **D-82:** Volver al home con "← Volver al home" reusando `requestReturnToHome()`.
- **D-83:** Layout pantalla Backup: cabecera "Backup" + línea de estado "Último backup: {fecha} (hace N días)" o "Aún no has exportado tu progreso" + botón primario "Exportar progreso" + botón secundario "Importar progreso" + área de mensajes (`backupLastMessage`: éxito/error) + botón "← Volver al home" abajo.
- **D-84:** 5º valor `'backup'` en `currentScreen` + sub-estados en el factory plano: `backupFileInputRef` (Alpine `$refs`), `backupLastMessage: { kind: 'success'|'error', text } | null`, `backupPendingImport: { exportedAt, state, summary } | null`.

**Estrategia de transcripción de los 6 PDFs:**
- **D-85:** Claude lee cada PDF con Read tool → propone JSON candidato → autor revisa pedagógicamente categoría por categoría → commit per categoría. Riesgo "Claude inventa italiano malo" mitigado por revisión humana + schema validator + NFC normalize.
- **D-86:** Tipo natural por PDF:
  - **Avere** (existente): intacto + 1-2 multi-cat nuevos.
  - **Verbos de Movimiento**: mayoría multiple-choice (conjugación + huecos), algún word-buttons.
  - **Preposiciones**: mayoría multiple-choice (hueco con preposición correcta).
  - **Género y Número**: mayoría match (sustantivo ↔ artículo, singular ↔ plural). Multi-choice para excepciones.
  - **Sustantivos Irregulares**: mayoría match (singular ↔ plural irregular). Multi-choice casos límite.
  - **Profesiones**: mezcla — multi-choice masc/fem, word-buttons frases completas.
  - Cantidad: ≥10 por categoría (SEED-01), apuntar ~12-15.
- **D-87:** Cruces multi-categoría = cruces naturales semánticos (no forzados). ≥1-2 por PDF (SEED-02). Ejemplos: `Lui ha un fratello medico` (Avere + Profesiones), `Vado a Roma` (Verbos + Preposiciones), `Le case sono belle` (Género + Sustantivos).
- **D-88:** `avere.json` intacto + añadir 1-2 multi-categoría nuevos. Los 17 existentes han pasado UAT — cero riesgo de regresión.

### Claude's Discretion

- Estilos visuales pantalla Backup: layout exacto, tamaño botones, color del banner (ámbar `warning` Pico class).
- Texto exacto banner (null vs >7d). Prefijo `⚠`, una frase, link "Ir a Backup".
- Mecanismo `<input type="file">`: estándar HTML + `accept=".json"`. Cancelar = no-op.
- Ubicación helper `parseBackupFile(rawStr)`: nuevo `src/data/backup.js` o función en `storage.js`. Layer purity D-02 invariante (sin DOM ni storage — recibe string, devuelve `{ ok, state | reason }`). **Recomendación del researcher**: módulo nuevo `src/data/backup.js` (justificado en Architecture Patterns sección).
- Helper `daysSinceISO(iso, todayStr)`: en `src/domain/dates.js`. Pura, testable.
- Orden transcripción 6 PDFs: Claude propone más eficiente (más simples primero) o autor pide específico. **Recomendación del researcher**: Preposiciones → Verbos de Movimiento → Sustantivos Irregulares → Género y Número → Profesiones → Avere (multi-cat). Justificado en "PDF Transcription Strategy".
- IDs ejercicios: `{slug}-{NNN}` (`profesiones-001`, `verbos-mov-001`). Multi-categoría: ID lleva slug de categoría "principal" + range alto (`avere-300+`).
- Tests nuevos: actualizar smoke test 30 días para multi-cat real. Schema validator NO requiere cambios.
- Banner sin animación.

### Deferred Ideas (OUT OF SCOPE)

- Snooze del banner (descartado D-80 por coherencia "el sistema te obliga").
- Pre-export defensivo antes de importar.
- Log persistente de exports/imports.
- Drag&drop para importar JSON (estándar `<input type="file">` suficiente).
- UI de edición de ejercicios (FUTURE-01).
- Sub-categorías más finas (FUTURE-03).
- Generación IA runtime de los PDFs (FUTURE-04 — Phase 4 hace transcripción asistida, no pipeline).
- Confirmación al exportar si lleva tiempo sin guardar.
- Indicador de carga durante import (archivos JSON pequeños leen instantáneamente).
- Versionado de archivo backup con campo `appVersion` separado.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BACK-04 | Pantalla "Backup" con botón "Exportar progreso" que descarga el estado actual como archivo JSON | Architecture Pattern #1 (Blob + URL.createObjectURL + anchor download); Code Examples §1 |
| BACK-05 | Pantalla "Backup" con botón "Importar progreso" que acepta un archivo JSON y reemplaza el estado actual (con confirmación) | Architecture Pattern #2 (`<input type="file">` + `Blob.text()` + parser); Code Examples §2 |
| BACK-06 | La home muestra un banner discreto si han pasado más de 7 días desde el último export | Architecture Pattern #3 (banner reactivo Alpine) + helper `daysSinceISO`; Code Examples §3 |
| SEED-01 | Transcribir los 6 PDFs a JSONs de ejercicios — al menos 10 ejercicios por categoría | PDF Transcription Strategy §A; PDFs leídos directamente: contenido catalogado por categoría |
| SEED-02 | Algunos ejercicios semilla son multi-categoría (≥1-2 por PDF) | Multi-Category Crosses §B (cruces semánticos validados con material real) |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Export blob construction + download trigger | `src/screens/app.js` (screen) | `src/data/storage.js` (lee state) | Toca DOM (crea `<a>` + click). Screen layer. Storage layer expone `getStateForBackup()` opcional o el screen lee `this.state` directamente. |
| Import file read + JSON.parse + wrapper validation | `src/data/backup.js` NUEVO (data layer, puro) | `src/screens/app.js` (handler) | Función pura `parseBackupFile(rawStr) → {ok, state} \| {ok:false, reason}`. Sin DOM, sin storage — recibe string, devuelve objeto. Layer purity D-02 invariante. |
| Migration chain extension (v2 → v3) | `src/data/storage.js` (data layer) | — | El módulo `storage.js` es la ÚNICA puerta de migraciones (D-46 patrón establecido Phase 2). |
| `daysSinceISO` helper pure date arithmetic | `src/domain/dates.js` (domain) | — | Función pura sin side-effects. Extiende `todayLocal()`. Testable con node --test. |
| Banner getter `shouldShowBackupBanner` | `src/screens/app.js` (screen) | `src/domain/dates.js` (delega cálculo) | Lee `state.lastBackupAt` + `state.firstUsedAt`, llama `daysSinceISO`. Reactivo over `this.state` proxy de Alpine. |
| Banner condicional + pantalla Backup template | `index.html` (markup Alpine) | — | `<template x-if>` + bindings declarativos. Sin lógica imperativa. |
| `firstUsedAt` set on first session save | `src/screens/app.js` `completeSession` o `applyResultToSession` (Test completo) | `src/data/storage.js` (escritura final) | El "primer saveState real" semánticamente lo determina el caller (sesión completada), no `saveState` que es agnostic. **Recomendación**: en `completeSession()` antes del `saveState`, y en `persistInFlightTest` mid-Test completo. Plumbing canónico documentado en Architecture Patterns §3. |
| PDF reading + JSON proposal | Off-runtime (chat con Claude usando Read tool) | — | NO es runtime — es transcripción asistida en chat. El JSON resultante vive en `content/exercises/*.json`. |
| NFC normalize de los nuevos JSONs | `src/data/content-loader.js` (existente, sin cambios) | — | CONT-06 ya cubre — el loader normaliza on load (Phase 1). |
| Schema validation de los nuevos JSONs | `src/data/schema-validator.js` (existente, sin cambios) | — | Dispatch table cerrada en Phase 3. Los 3 tipos cubiertos. No requiere expansión. |

---

## Standard Stack

### Core (sin cambios)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Alpine.js | 3.15.12 (pinned, SRI ya en index.html) | Reactividad sobre `state.lastBackupAt` → banner re-evaluado automáticamente | LOCKED en CLAUDE.md tech stack; ya operativo Phase 1-3 |
| Pico CSS | 2.1.1 (classless, pinned, SRI ya en index.html) | `<article role="alert">` clasless para banner; `class="secondary"` para botón Backup en home | LOCKED en CLAUDE.md tech stack; ya operativo Phase 1-3 |
| Vanilla ES modules | browser-native | Módulo nuevo `src/data/backup.js` y extensión `src/domain/dates.js` | LOCKED |
| localStorage | browser-native | `state.lastBackupAt` + `state.firstUsedAt` persisten en el blob v3 existente | LOCKED |
| Browser Blob API | browser-native (Baseline since 2015) | Construir el archivo JSON descargable | Universal, sin polyfill |
| Browser `URL.createObjectURL` / `revokeObjectURL` | browser-native (Baseline since 2015) | Convertir Blob a URL temporal para `<a download>` | Universal, sin polyfill |
| Browser `<input type="file">` + `Blob.text()` | browser-native (Blob.text() Baseline since April 2021) | Leer archivo importado | Universal en Chrome 76+/Firefox 69+/Safari 14+ — más que suficiente para uso 2026 |

### Supporting (sin cambios)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node:test + node:assert/strict | Node 22.x (project pinned) | Tests puros de `migrate2to3`, `daysSinceISO`, `parseBackupFile` | Mismo patrón que `tests/data-storage.test.js` + `tests/domain.test.js` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `Blob.text()` (Promise-based, UTF-8 only) | `FileReader.readAsText(file, 'UTF-8')` | Legacy event-based. UTF-8 default ya cubre Italian accents. `Blob.text()` es más limpio; ambos válidos. **Recomendación**: `Blob.text()` — promesa, 3 líneas vs 8, encoding UTF-8 explícito por especificación. [VERIFIED: MDN 2026] |
| `<input type="file">` standard | File System Access API (`showSaveFilePicker`) | Locked NO en CLAUDE.md tech stack — Firefox/Safari no lo soportan. |
| Módulo nuevo `src/data/backup.js` | Inline en `src/data/storage.js` | `backup.js` separa concerns: storage = persistencia, backup = serialización/validación de un wrapper externo. Layer purity sigue intacta. **Recomendación**: nuevo `src/data/backup.js` — ~60 líneas, testable independiente. |
| ISO UTC string (`toISOString()`) | Epoch ms numérico | LOCKED D-79 ISO UTC. Coherente con `dailyLog` keys (también texto). |
| Helper `daysSinceISO(iso, todayStr)` puro | Inline en el getter de screen | Puro + testable + reusable. **Recomendación**: helper en `dates.js`. |

**Installation:** Cero `npm install`. Stack 100% LOCKED — los CDN URLs de Alpine + Pico ya están pinned con SRI en `index.html`.

**Version verification:**

```bash
# No external packages to install for Phase 4 runtime.
# Test runner verified:
node --version   # v22.20.0 (project pinned)
```

[VERIFIED: existing index.html CDN pins, node --version output]

---

## Package Legitimacy Audit

> **Not applicable.** Phase 4 installs ZERO new external packages. All capabilities use:
> - Already-pinned CDN scripts (Alpine 3.15.12 + Pico 2.1.1) loaded from `index.html` with SRI integrity hashes (verified Phase 1).
> - Browser-native APIs (Blob, FileReader, URL, localStorage).
> - Node 22 `node:test` + `node:assert/strict` (project standard since Phase 1).
> - Reading PDFs uses Claude Code's built-in Read tool — no npm package.

No `npm install`, `pip install`, or `cargo add` action surfaces in any plan-task of Phase 4. The Package Legitimacy Gate is therefore a no-op for this phase. [VERIFIED: codebase inspection of CLAUDE.md "zero build step" constraint + existing index.html]

---

## Architecture Patterns

### System Architecture Diagram

```
                                BACKUP EXPORT FLOW
                                ──────────────────

  user clicks "Exportar progreso"
            │
            ▼
   exportBackup() in src/screens/app.js
            │
            ├──> read this.state (in-memory)
            │
            ├──> build wrapper:
            │      { kind: 'italian-course-backup',
            │        exportedAt: new Date().toISOString(),
            │        schemaVersion: 3,
            │        state: this.state }
            │
            ├──> JSON.stringify(wrapper, null, 2)
            │
            ├──> new Blob([str], { type: 'application/json' })
            │
            ├──> URL.createObjectURL(blob)  ──> objectURL
            │
            ├──> create <a href={objectURL} download="italian-course-backup-YYYY-MM-DD.json">
            ├──> a.click()  ──> browser saves file to Downloads
            ├──> URL.revokeObjectURL(objectURL)  ──> free memory
            │
            ├──> update state.lastBackupAt = new Date().toISOString()
            ├──> saveState(this.state)  ──> localStorage (single key italianCourse.v1)
            │
            └──> set this.backupLastMessage = { kind: 'success', text: '...' }
                 (banner disappears on home automatically via Alpine reactivity)


                                BACKUP IMPORT FLOW
                                ──────────────────

  user clicks "Importar progreso"
            │
            ▼
   trigger this.$refs.backupFileInput.click()
            │
            ▼
   (file picker opens; user selects .json OR cancels)
            │
            ▼  (on change event with files.length === 1)
   onFileSelected(event) in src/screens/app.js
            │
            ├──> file = event.target.files[0]
            ├──> rawText = await file.text()   [Blob.text(), Promise-based, UTF-8]
            │
            ├──> result = parseBackupFile(rawText)   [PURE — src/data/backup.js]
            │              │
            │              ├─ try JSON.parse  ── fail ─> { ok: false, reason: 'JSON inválido: ...' }
            │              ├─ check kind === 'italian-course-backup'
            │              ├─ check state object present
            │              ├─ check state.schemaVersion number present
            │              ├─ check state.schemaVersion ≤ CURRENT (3)
            │              ├─ run migration chain on state copy:
            │              │     migrate1to2 (if v1) → migrate2to3 (if v1 or v2)
            │              └─ return { ok: true, state: migratedState, summary: { exportedAt, categories, exercises } }
            │
            ├──> if !result.ok:
            │      backupLastMessage = { kind: 'error', text: result.reason }
            │      [reset file input value to '' for re-tries]
            │      return
            │
            ├──> backupPendingImport = result   (cache for confirm dialog body)
            │
            └──> requestConfirm({                                 [reuses D-27 helper]
                   message: built from summary (fecha, #cat, #ex, warning),
                   confirmLabel: 'Continuar',
                   cancelLabel: 'Cancelar',
                   onConfirm: () => commitImport()
                 })

   commitImport()
            │
            ├──> this.state = backupPendingImport.state
            ├──> saveState(this.state)
            ├──> backupPendingImport = null
            ├──> backupLastMessage = { kind: 'success', text: 'Progreso importado correctamente.' }
            │
            └──> (UI re-renders home/banner/categorías inmediatamente; Alpine reactivity)


                              7-DAY BACKUP BANNER FLOW
                              ────────────────────────

  Home screen renders, Alpine evaluates getter on each render:
            │
            ▼
   get shouldShowBackupBanner() {
     if (!this.state) return false                           // double-defense
     const last = this.state.lastBackupAt
     const first = this.state.firstUsedAt
     const today = todayLocal()
     if (last !== null) return daysSinceISO(last, today) > 7
     if (first !== null) return daysSinceISO(first, today) > 7
     return false                                            // app fresh, no session yet
   }
            │
            ▼
   <template x-if="currentScreen === 'home' && shouldShowBackupBanner">
     <div role="alert" class="backup-banner">⚠ ...</div>
   </template>
```

### Recommended Project Structure (additions to existing tree)

```
src/
├── domain/
│   ├── dates.js                  # EXTEND: + daysSinceISO(iso, todayStr) helper
│   └── ... (existing unchanged)
├── data/
│   ├── storage.js                # EXTEND: CURRENT_SCHEMA_VERSION=3, + migrate2to3,
│   │                             #         blankState añade lastBackupAt+firstUsedAt
│   ├── backup.js                 # NEW: parseBackupFile(rawStr) — puro
│   └── ... (existing unchanged)
└── screens/
    └── app.js                    # EXTEND: + currentScreen='backup' + sub-estados
                                  #         + exportBackup() + onFileSelected() + commitImport()
                                  #         + shouldShowBackupBanner getter
                                  #         + setFirstUsedAtIfMissing() helper
content/
├── categories.json               # EXTEND: 6 entries (avere + 5 nuevas) en orden:
│                                 #         preposiciones, verbos-mov, sustantivos-irreg,
│                                 #         genero-numero, profesiones, avere
└── exercises/
    ├── avere.json                # EXTEND: añadir 1-2 ejercicios multi-cat NO modificar 17 existentes
    ├── preposiciones.json        # NEW: ~12 multi-choice
    ├── verbos-movimiento.json    # NEW: ~12 multi-choice + 2 word-buttons
    ├── sustantivos-irregulares.json  # NEW: ~12 match
    ├── genero-numero.json        # NEW: ~12 match + 2 multi-choice
    └── profesiones.json          # NEW: ~12 mezcla match + multi-choice + word-buttons
index.html                        # EXTEND: + template backup screen
                                  #         + template banner condicional en home
                                  #         + botón secundario "Backup" en home button-row
tests/
├── domain.test.js                # EXTEND: tests daysSinceISO (cubre 4-6 casos)
├── data-storage.test.js          # EXTEND: tests migrate2to3, blankState v3
└── data-backup.test.js           # NEW: tests parseBackupFile (kind check, schemaVersion bounds,
                                  #      migration chain, JSON inválido, todos los errores en español)
```

---

### Pattern 1: Blob + URL.createObjectURL + Anchor Download (Export)

**What:** Convertir un objeto JS a un archivo descargable sin servidor.
**When to use:** Botón "Exportar progreso" en pantalla Backup.

**Key insight:** `URL.revokeObjectURL` ES NECESARIO — los object URLs no se garbage-collectan hasta que la página se descarga; sin revoke creas un leak (verificado MDN 2026: "Each call to createObjectURL() creates a reference that consumes memory" + "this feature is not available in Service Workers due to its potential to create memory leaks"). Revocar inmediatamente tras el click es seguro porque el navegador ya capturó la descarga.

**Example:** ver Code Examples §1.

[VERIFIED: MDN URL/createObjectURL_static, 2026]

---

### Pattern 2: `<input type="file">` + `Blob.text()` + Pure Parser (Import)

**What:** Leer un archivo JSON local, validarlo, aplicarlo al state.
**When to use:** Botón "Importar progreso" en pantalla Backup.

**Key insights:**
1. **`Blob.text()` returns a Promise resolving to a UTF-8 string** [VERIFIED: MDN 2026]. Las tildes italianas (`è`, `città`, `caffè`) llegan correctamente porque la spec garantiza UTF-8. `FileReader.readAsText(file)` también devuelve UTF-8 por defecto (legacy event-based). Recomendado `Blob.text()` por simplicidad.
2. **`accept=".json"` es un HINT, no un filtro duro** [VERIFIED: MDN 2026]. El usuario puede seleccionar cualquier archivo. La validación real se hace en el parser. OK porque ya hacemos `JSON.parse` + kind check.
3. **`<input type="file">` y reset de value:** después de procesar (éxito o error), hay que hacer `input.value = ''` para permitir re-seleccionar el MISMO archivo (caso típico: el primer intento falló, el usuario quiere reintentar con el mismo). Sin reset, el `change` event NO se dispara al re-seleccionar el mismo nombre [VERIFIED: MDN 2026].
4. **Cancelar el file picker NO dispara `change`** [VERIFIED: MDN 2026]: dispara `cancel` (no se necesita handler — no-op natural). Defensivo: si el handler de `change` se ejecuta con `event.target.files.length === 0`, salir silenciosamente.
5. **`event.target.files[0]` es un objeto `File` (extends `Blob`)** — métodos de Blob como `.text()` funcionan directamente.

**Example:** ver Code Examples §2.

[VERIFIED: MDN HTML/Element/input/file, MDN Blob/text, 2026]

---

### Pattern 3: Migration Chain Extension (v2 → v3)

**What:** Añadir `migrate2to3` al pipeline existente en `src/data/storage.js`.
**When to use:** Al hacer `loadState()` al boot Y al importar un backup pre-v3.

**Key insights:**
1. **El patrón existente (Phase 2) es:** `migrate(parsed)` dispatcha por `parsed.schemaVersion` y llama `migrate1to2` o `hydrateV2` directamente. La forma idiomática de extenderlo es:
   ```
   migrate(parsed):
     if v1 → migrate1to2(parsed) → ENTONCES llamar migrate2to3(result) → return hydrateV3(result)
     if v2 → migrate2to3(parsed) → return hydrateV3(result)
     if v3 → return hydrateV3(parsed)
     if > 3 → blankState() + warn
   ```
   La **cadena**: cada paso solo se preocupa de N → N+1; el dispatcher las encadena.
2. **`migrate2to3(v2)` es IDEMPOTENTE** y mínima: clona el objeto, añade `lastBackupAt: null` + `firstUsedAt: null` si faltan, bump `schemaVersion: 3`. Preserva todo lo demás.
3. **`hydrateV3` reemplaza `hydrateV2`** como hydratador final: añade defaults defensivos para `lastBackupAt`/`firstUsedAt` (puede ser null o string ISO).
4. **`blankState()` ahora retorna v3** con los dos campos a `null`.
5. **`firstUsedAt` set strategy:** se setea en el CALLER (no en `saveState`). Justificación: `saveState` es agnóstico — recibe cualquier state. El "primer saveState real" semánticamente lo decide la lógica de dominio (sesión completada). Plumbing canónico:
   ```javascript
   // En completeSession() ANTES de this.state = newState; saveState:
   if (this.state.firstUsedAt === null) {
     this.state.firstUsedAt = new Date().toISOString()
   }
   // En applyResultToSession() rama D-54 fallo inmediato:
   //   misma guard antes del saveState(newState).
   // En persistInFlightTest() (Test completo per-answer write):
   //   misma guard.
   ```
   **Alternativa rechazada:** setear en `saveState` con guard `if (state.firstUsedAt === null) state.firstUsedAt = ...`. Aparentemente más simple, pero ROMPE la layer purity (storage.js no debe modificar el shape del state — solo persistirlo). Mantener la lógica de dominio en el caller también deja el invariante "saveState es side-effect-only" intacto.

**Example:** ver Code Examples §4.

---

### Pattern 4: Alpine Reactive Banner Getter

**What:** Banner que aparece/desaparece automáticamente al cambiar `state.lastBackupAt`.
**When to use:** Banner condicional sobre la home cuando >7 días sin backup.

**Key insights:**
1. **Alpine track reactivity sobre `this.state.X`** automáticamente porque `this.state` está envuelto en un Proxy reactivo desde que se hace `this.state = X` en `init()` o en handlers. Asignaciones inmutables (`this.state = { ...this.state, lastBackupAt: ... }`) son seguras y disparan re-render. Asignación in-place (`this.state.lastBackupAt = ...`) TAMBIÉN funciona en Alpine 3 — el Proxy intercepta la asignación de propiedad. **Patrón usado en el codebase actual:** ambas formas conviven (`completeSession` usa spread, `persistInFlightTest` también, pero `flashMatchPair` muta `this.matchFlashIdx` in-place). Para `lastBackupAt`/`firstUsedAt`: **usar spread por consistencia con el patrón D-54** (`this.state = { ...this.state, lastBackupAt: ... }; saveState(this.state)`).
2. **`<template x-if>` con guard double-defense**: el patrón canónico Phase 2/3 es:
   ```html
   <template x-if="currentScreen === 'home' && shouldShowBackupBanner">
     <div role="alert" class="backup-banner">
       ⚠ <span x-text="backupBannerText"></span>
       <button type="button" @click="currentScreen = 'backup'">Ir a Backup</button>
     </div>
   </template>
   ```
   El getter `shouldShowBackupBanner` devuelve false si `state` es null (boot pre-init).
3. **Getter NO debe llamar funciones pesadas en cada render.** `daysSinceISO` es pura y barata (~10 lineas, sin allocations). OK. Alpine no memoiza getters — los re-evalúa en cada render — pero a esta escala (1 banner, 1 cálculo por render) es no-op.
4. **Texto del banner** se computa en otro getter `backupBannerText` que devuelve la frase ya completa para evitar lógica condicional en el template Alpine (más legible, más testable):
   ```javascript
   get backupBannerText() {
     if (this.state?.lastBackupAt === null) return 'Aún no has exportado tu progreso.'
     const days = daysSinceISO(this.state.lastBackupAt, todayLocal())
     return `Han pasado ${days} días desde tu último backup.`
   }
   ```

**Example:** ver Code Examples §3.

---

### Pattern 5: Pico CSS Classless Banner Styling

**What:** Estilo visual del banner de backup, coherente con el banner in-flight existente.
**When to use:** Styles para el banner sobre la tabla home.

**Key insights:**
1. **Reusar el patrón de `.inflight-banner`** de styles.css (Phase 2): `<div role="alert">` con un border + background ámbar sutil. Esto ya pasó UAT como "alerta clara pero sin alarmismo".
2. **NUEVA clase `.backup-banner`** o reusar `.inflight-banner` directamente. **Recomendación**: nueva clase con MISMOS estilos (DRY violado mínimamente para permitir tonalidad distinta si el autor lo pide en UAT). Color sugerido: amber (`var(--pico-color-amber-500, #f59e0b)` con background `rgba(245, 158, 11, 0.08)`).
3. **`role="alert"`** estándar de Pico classless — comunica al lector de pantalla que es una notificación urgente. NO hay role contextual mejor para "el sistema te recuerda algo".
4. **Sin transición/animación** (D-80 + Claude's discretion). El banner aparece/desaparece sin fade — coherente con la sobriedad de Phase 2.

---

### Anti-Patterns to Avoid

- **NO usar `window.confirm` para D-76.** El patrón inline `requestConfirm` (D-27, ya existente, 4ª call-site para esta fase) es el canónico. Coherencia visual + tono "sistema te obliga" + ya tested.
- **NO usar `alert()` para el banner de error.** El patrón `backupLastMessage = { kind: 'error', text: ... }` renderizado declarativamente en la pantalla Backup respeta el resto del UI.
- **NO escribir a localStorage desde un módulo que no sea `src/data/storage.js`.** Layer purity D-02 invariante. `src/data/backup.js` propuesto NO toca localStorage; recibe un string raw y devuelve un objeto.
- **NO usar `JSON.parse` sin `try/catch`.** El parser tiene que ser tolerante a archivos malformados y devolver `{ ok: false, reason }`, NO lanzar.
- **NO usar `toISOString().slice(0,10)` para "fecha de hoy".** Eso es UTC y rompe la racha local — pitfall ya conocido en `src/domain/dates.js`. Usar `todayLocal()`.
- **NO depender de File System Access API** (`showOpenFilePicker`/`showSaveFilePicker`). Firefox/Safari no la soportan en 2026 (verificado en CLAUDE.md tech stack research previo Phase 1).
- **NO añadir un campo `appVersion` separado** al wrapper (deferred D-deferred). `schemaVersion` ya cubre forward-compat.
- **NO setear `firstUsedAt` dentro de `saveState`** — violaría layer purity (storage.js no debe modificar shape del state). Setearlo en el caller (`completeSession`/`applyResultToSession`/`persistInFlightTest`) antes del `saveState`.
- **NO modificar `avere.json` los 17 existentes** (D-88). Solo APPEND nuevos IDs `avere-300+`. Romper un ID rompe la historia del usuario (exerciseStats lo referencia).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Convertir objeto JS a archivo descargable | Custom mecanismo con data URLs (`data:application/json;base64,...`) | `new Blob([str], {type})` + `URL.createObjectURL` + anchor download | data URLs tienen límites de tamaño en algunos navegadores; Blob es ilimitado y eficiente memoria-wise. |
| Leer archivo local seleccionado por usuario | `XMLHttpRequest` contra `file://` | `<input type="file">` + `Blob.text()` | Bloqueado por CORS bajo `file://` y `npx serve`; los input file están diseñados exactamente para este caso. |
| Encoding UTF-8 para acentos italianos | Detección manual de BOM + conversión | `Blob.text()` (UTF-8 default por spec) o `FileReader.readAsText(file, 'UTF-8')` | Spec garantiza UTF-8; tildes (`è`, `città`, `caffè`) llegan correctamente sin intervención. |
| Migration chain v2 → v3 | Detección por reflection del shape | Patrón establecido Phase 2 `migrate(parsed)` con dispatch por `schemaVersion` | Ya operativo, ya testeado, ya documentado en CONTEXT Phase 2. |
| Schema validation del state importado | Custom validador "shape de v3" | Reusar la cadena de `migrate` + el `hydrateV3` defensivo | Las funciones de migración ya tienen type-guards (`typeof === 'object'`, etc.). |
| Inline confirmación modal | Custom modal con backdrop | `requestConfirm()` (D-27 helper existente) | 3 call-sites previos, patrón establecido, mismo estilo visual. |

**Key insight:** Phase 4 backup es 100% APIs nativas del navegador + extensión del patrón de migración existente. Cero librerías nuevas. La complejidad real está en (a) plumbing reactivo de Alpine y (b) la transcripción de los PDFs.

---

## Runtime State Inventory

> Phase 4 NO es un rename/refactor/migration phase puro — es feature work + content. PERO tiene una dimensión de migración (schemaVersion 2→3). Aplico el inventario para esa dimensión.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `italianCourse.v1` blob en localStorage con `schemaVersion: 2` (todos los usuarios post-Phase 2). Al cargar post-Phase 4, `migrate2to3` añade `lastBackupAt: null` y `firstUsedAt: null` transparentemente. | Code edit: extender `migrate()` dispatcher en `src/data/storage.js`. NO requiere migración de datos del usuario — la migración transparente en boot lo cubre. |
| Live service config | None. App 100% local, sin servicios externos. | None. |
| OS-registered state | None. No hay tareas programadas, daemons, o servicios. | None. |
| Secrets / env vars | None. App single-user local, sin secrets. | None. |
| Build artifacts | None. Sin build step. | None. |
| Backup files exportados pre-Phase 4 | Si el autor exportó un backup en Phase 3 (no debería — BACK-04 estaba pending), el archivo tendría `schemaVersion: 2`. **Pero BACK-04 estaba unimplemented antes de Phase 4** — no hay backups históricos a recuperar. Defensivo: `migrate2to3` aplicado en el import path soporta el caso si emerge (D-74 paso 3). | None active; defensa cubierta por D-74. |

**Nothing found in categories:** Live service config (None — app local), OS-registered state (None — npx serve user-launched), Secrets (None — no auth), Build artifacts (None — zero build step).

---

## Common Pitfalls

### Pitfall 1: Olvidar `URL.revokeObjectURL` tras la descarga

**What goes wrong:** Memory leak. Cada export crea un object URL que mantiene viva la Blob hasta que la página se descarga.
**Why it happens:** El navegador no auto-revoca por seguridad; URLs siguen siendo accesibles desde cualquier código JS hasta revoke explícito.
**How to avoid:** Revocar inmediatamente tras `a.click()`. Para archivos pequeños (~50 KB del state actual + ~500 KB con 6 PDFs llenos) el leak por export individual es despreciable, pero la disciplina previene problemas futuros.
**Warning signs:** Performance tab → Memory → tras 100 clicks de export, memoria crece sin liberar. [VERIFIED: MDN 2026 explicit warning]

### Pitfall 2: No resetear `input.value` tras procesar

**What goes wrong:** Si el primer import falla, el usuario corrige el archivo y lo re-selecciona con el mismo nombre — el `change` event NO se dispara porque la selección no "cambió".
**Why it happens:** El input file usa el nombre del archivo como identidad. Mismo nombre = "no change".
**How to avoid:** En el handler de `change`, después de procesar (éxito o error), hacer `event.target.value = ''`. Esto resetea el input sin perder la referencia al file ya procesado.
**Warning signs:** Re-seleccionar el mismo .json en el picker no hace nada visible. [VERIFIED: MDN 2026]

### Pitfall 3: `JSON.parse` lanzando uncaught exception

**What goes wrong:** Usuario importa un archivo .txt renombrado a .json o un JSON corrupto → la pantalla se rompe.
**Why it happens:** `JSON.parse` lanza `SyntaxError` ante input inválido.
**How to avoid:** Envolver siempre en `try/catch`. Función pura `parseBackupFile(rawStr)` retorna `{ ok: false, reason: 'JSON inválido: ' + err.message }` en lugar de lanzar.
**Warning signs:** Click "Importar" + seleccionar PDF como JSON → crash en consola. **Test:** unit test en `tests/data-backup.test.js`.

### Pitfall 4: Comparación de fechas que cruza DST

**What goes wrong:** Calcular `daysSinceISO` simplemente como `(today - iso) / 86400000` falla en transiciones DST porque algunos días tienen 23 o 25 horas.
**Why it happens:** UTC no tiene DST, pero el helper compara contra `todayLocal()` que es local.
**How to avoid:** Pattern ya en `formatRelativeDate` (línea 1438 app.js): construir Dates al MEDIODÍA local del año/mes/día (evita DST shifts) y comparar con `Math.round((bMs - aMs) / 86400000)`. Esto es robusto a DST por ±2h holgura.
**Warning signs:** El día de cambio DST de octubre/marzo, el banner aparece/desaparece un día antes/después de lo esperado.

### Pitfall 5: Future-dated `lastBackupAt` por import o clock skew

**What goes wrong:** Usuario importa un backup con `lastBackupAt` futuro (fecha del sistema mal configurada, o backup exportado en otra máquina con clock skew). `daysSinceISO` devuelve negativo → el banner queda permanentemente oculto.
**Why it happens:** `Math.round((today - future) / day)` = número negativo.
**How to avoid:** En el getter `shouldShowBackupBanner`, tratar `daysSinceISO < 0` como "no mostrar banner" (NO es estrictamente bug — si el backup fue hoy/futuro, no hace falta recordar). En el helper `daysSinceISO`, retornar el valor REAL (puede ser negativo) — la decisión de UI vive en el getter, no en el helper.
**Warning signs:** El banner nunca aparece para usuario que sí lleva muchos días sin backup. **Test:** unit test cubriendo futuro/negativo.

### Pitfall 6: Confundir `schemaVersion` raíz con `state.schemaVersion`

**What goes wrong:** El wrapper de backup tiene `schemaVersion` en raíz (D-73), Y el `state` interno tiene también `state.schemaVersion`. Si el código usa uno cuando debería usar el otro, la validación pasa cuando no debería (o viceversa).
**Why it happens:** Redundancia intencional D-73 ("más visible") es un trade-off legible/seguro.
**How to avoid:** `parseBackupFile` chequea AMBOS y devuelve error si difieren — esto convierte el error en un test fail visible, no en estado corrupto. Alternativa: chequear SOLO `state.schemaVersion` (la fuente de verdad para la migración) y dejar el raíz como informativo (no validado). **Recomendación**: chequear ambos al import — coherencia interna del archivo es un assert.

### Pitfall 7: `setTimeout` en flujo de export (race condition)

**What goes wrong:** Si el código hace `a.click()` y luego `URL.revokeObjectURL(url)` en líneas adyacentes pero el navegador es perezoso, el click puede ejecutarse después del revoke → download falla.
**Why it happens:** Algunos navegadores procesan el download async.
**How to avoid:** Llamar `revokeObjectURL` después de un `setTimeout(fn, 0)` o `requestAnimationFrame` — pero en práctica con Chrome/Firefox/Safari modernos, llamarlo síncronamente justo tras `a.click()` funciona (verificado en MDN ejemplo canónico). Defensivo: `setTimeout(() => URL.revokeObjectURL(url), 0)` añade margen. **Recomendación**: usar `setTimeout(0)` para defensa con coste cero.
**Warning signs:** El usuario reporta "se descarga vacío" en algunos navegadores.

### Pitfall 8: NFC normalization NO aplicada al state importado

**What goes wrong:** El state importado contiene strings con composiciones distintas (NFC vs NFD) — los `clearedExerciseIds` no matchean los IDs de los ejercicios en memoria.
**Why it happens:** El backup se exportó en un sistema donde el state contenía NFD (raro pero posible si llegó vía import previo de archivo NFD). `content-loader.js` normaliza el CONTENT al cargar, pero `loadState` NO normaliza el state.
**How to avoid:** `state` es propio del runtime; sus strings (IDs como `avere-100`, fechas ISO, `categoryProgress` keys que son slugs ASCII) son **ASCII por diseño** — los IDs son `slug-NNN`, las fechas son ISO `YYYY-MM-DD`, slugs son ASCII (D-04). NFC no aplica aquí. **Conclusión**: NO requiere normalize on import del state. El loader sí normaliza el `content/`. Documentar esto en el JSDoc del parser para evitar que el planner añada normalize innecesario.

### Pitfall 9: `JSON.stringify` y `undefined` en el wrapper

**What goes wrong:** Si el state tiene un campo opcional `undefined` (como `inFlightTest` cuando no hay test), `JSON.stringify` lo elide silenciosamente. Bien para `inFlightTest`. **Pero**: si por error el código asigna `state.lastBackupAt = undefined`, el campo se elide y `migrate2to3` lo rehidrata como `null` la próxima carga. **Comportamiento aceptable** porque la lógica es coherente — pero el invariante "lastBackupAt es siempre null o string ISO, jamás undefined" debe documentarse.
**How to avoid:** Usar `null` explícito (no `undefined`) en el shape. JSDoc del state shape lo documenta.

### Pitfall 10: Cascada D-54 aplicada accidentalmente sobre el state importado

**What goes wrong:** Importar un backup mientras hay una sesión inFlight — la sesión sigue corriendo y aplica cascada sobre el nuevo state, mezclando aciertos viejos con state nuevo.
**Why it happens:** El factory plano no resetea `sessionExerciseIds`/etc. al cambiar `state`.
**How to avoid:** El import path debe forzar a estar en pantalla `backup` (no `session` — coherente con el confirmDialog UX). Tras importar, `currentScreen = 'home'` automáticamente (sesión queda descartada limpia). **Defensa adicional**: en `commitImport`, llamar `this.resetSession()` antes del `currentScreen = 'home'`.

---

## Code Examples

Verified patterns adapted from existing codebase + MDN 2026.

### §1. Export Blob + Anchor Download

```javascript
// src/screens/app.js — método exportBackup() en el factory appShell

import { todayLocal } from '../domain/dates.js'
import { saveState } from '../data/storage.js'

// ... dentro del factory:

exportBackup() {
  try {
    // 1. Build wrapper (D-73)
    const wrapper = {
      kind: 'italian-course-backup',
      exportedAt: new Date().toISOString(),
      schemaVersion: this.state.schemaVersion,   // == 3 post-Phase 4
      state: this.state
    }

    // 2. Stringify with indent for human-readability of the file
    const jsonStr = JSON.stringify(wrapper, null, 2)

    // 3. Blob + object URL (Pattern 1 — verified MDN)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    // 4. Trigger download via anchor + filename (D-75)
    const a = document.createElement('a')
    a.href = url
    a.download = `italian-course-backup-${todayLocal()}.json`
    // No need to append to DOM — modern browsers accept detached anchors
    a.click()

    // 5. Revoke URL — Pitfall #1 + #7 (defensive setTimeout)
    setTimeout(() => URL.revokeObjectURL(url), 0)

    // 6. Update state.lastBackupAt + persist (Pattern 4 — reactive update)
    this.state = { ...this.state, lastBackupAt: new Date().toISOString() }
    saveState(this.state)

    // 7. UI feedback (D-83 área de mensajes)
    this.backupLastMessage = {
      kind: 'success',
      text: 'Progreso exportado. Guarda el archivo en lugar seguro.'
    }
  } catch (err) {
    // Defensive — JSON.stringify can throw on circular refs (no debería pasar
    // con el shape del state, pero defensivo).
    this.backupLastMessage = {
      kind: 'error',
      text: `Error al exportar: ${String(err?.message ?? err)}`
    }
  }
}
```

[VERIFIED: MDN URL/createObjectURL_static 2026; pattern aligns with existing Phase 2 saveState reactive update D-54]

### §2. Import via `<input type="file">` + Blob.text() + Pure Parser

```html
<!-- index.html — dentro del template currentScreen === 'backup' -->

<input type="file"
       x-ref="backupFileInput"
       accept=".json,application/json"
       @change="onFileSelected($event)"
       style="display: none">
<button type="button" class="secondary" @click="$refs.backupFileInput.click()">
  Importar progreso
</button>
```

```javascript
// src/screens/app.js — handler de import

import { parseBackupFile } from '../data/backup.js'

// ... dentro del factory:

async onFileSelected(event) {
  const input = event.target
  const file = input.files?.[0]
  if (!file) {
    // Pitfall #2 — cancel fires nothing; defensive return.
    return
  }

  let rawText
  try {
    rawText = await file.text()   // Blob.text() — Promise, UTF-8 [VERIFIED MDN]
  } catch (err) {
    this.backupLastMessage = {
      kind: 'error',
      text: `No se pudo leer el archivo: ${String(err?.message ?? err)}`
    }
    input.value = ''   // Pitfall #2 reset
    return
  }

  const result = parseBackupFile(rawText)
  if (!result.ok) {
    this.backupLastMessage = { kind: 'error', text: result.reason }
    input.value = ''
    return
  }

  // Cache pending for the confirm dialog body
  this.backupPendingImport = {
    state: result.state,
    summary: result.summary
  }

  // D-76: reuses existing requestConfirm helper (4th call-site)
  this.requestConfirm({
    message: this.buildImportConfirmMessage(result.summary),
    confirmLabel: 'Continuar',
    cancelLabel: 'Cancelar',
    onConfirm: () => this.commitImport()
  })
  input.value = ''   // reset BEFORE confirm — UX consistent across cancel/confirm
},

buildImportConfirmMessage(summary) {
  // summary.exportedAt is ISO; format as local human date
  const exportedDate = new Date(summary.exportedAt).toLocaleString('es-ES')
  return (
    `Vas a importar un backup del ${exportedDate}.\n` +
    `Categorías con progreso: ${summary.categories}\n` +
    `Ejercicios con stats: ${summary.exercises}\n\n` +
    `Esto REEMPLAZARÁ tu progreso actual y no se puede deshacer.`
  )
},

commitImport() {
  if (!this.backupPendingImport) return   // defensive
  this.resetSession()                      // Pitfall #10 — descarta cualquier sesión en curso
  this.state = this.backupPendingImport.state
  saveState(this.state)
  this.backupPendingImport = null
  this.backupLastMessage = {
    kind: 'success',
    text: 'Progreso importado correctamente.'
  }
  this.currentScreen = 'home'   // mostrar el resultado inmediato
}
```

```javascript
// src/data/backup.js — NUEVO módulo puro
//
// Layer purity D-02 invariante — sin DOM, sin localStorage, sin fetch.
// Recibe string, devuelve objeto. Testable con node --test.

import { migrate1to2, hydrateV3, migrate2to3 } from './storage.js'

const CURRENT_SCHEMA_VERSION = 3

/**
 * Parser del archivo de backup (D-73, D-74).
 *
 * @param {string} rawStr - Contenido textual del archivo.
 * @returns {{ok: true, state: object, summary: {exportedAt: string, categories: number, exercises: number}} | {ok: false, reason: string}}
 */
export function parseBackupFile(rawStr) {
  // 1. JSON.parse defensivo — Pitfall #3
  let wrapper
  try {
    wrapper = JSON.parse(rawStr)
  } catch (err) {
    return { ok: false, reason: `JSON inválido: ${err.message}` }
  }

  // 2. Type guards
  if (!wrapper || typeof wrapper !== 'object') {
    return { ok: false, reason: 'El archivo no contiene un objeto JSON.' }
  }

  // 3. kind check (D-74 paso 2)
  if (wrapper.kind !== 'italian-course-backup') {
    return {
      ok: false,
      reason: 'Este archivo no es un backup de Italian Course (falta o difiere el campo "kind").'
    }
  }

  // 4. state present + has schemaVersion
  const state = wrapper.state
  if (!state || typeof state !== 'object') {
    return { ok: false, reason: 'El archivo no contiene el campo "state" o no es un objeto.' }
  }
  if (typeof state.schemaVersion !== 'number') {
    return { ok: false, reason: 'El campo "state.schemaVersion" falta o no es número.' }
  }

  // 5. Pitfall #6 — coherencia interna (informativo, no bloqueante; warn defensivo)
  if (wrapper.schemaVersion !== state.schemaVersion) {
    return {
      ok: false,
      reason: `Versión inconsistente en el archivo (wrapper.schemaVersion=${wrapper.schemaVersion}, state.schemaVersion=${state.schemaVersion}).`
    }
  }

  // 6. Future-version reject (D-74 paso 4)
  if (state.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      reason: `Este backup viene de una versión más nueva de la app (schemaVersion=${state.schemaVersion}; esta app soporta hasta ${CURRENT_SCHEMA_VERSION}).`
    }
  }

  // 7. Run migration chain (D-74 paso 3) — IDÉNTICO al pipeline de loadState
  let migrated = state
  if (migrated.schemaVersion === 1) migrated = migrate1to2(migrated)
  if (migrated.schemaVersion === 2) migrated = migrate2to3(migrated)
  migrated = hydrateV3(migrated)

  // 8. Build summary for the confirm dialog body
  const summary = {
    exportedAt: typeof wrapper.exportedAt === 'string' ? wrapper.exportedAt : 'desconocido',
    categories: Object.keys(migrated.categoryProgress ?? {}).length,
    exercises: Object.keys(migrated.exerciseStats ?? {}).length
  }

  return { ok: true, state: migrated, summary }
}
```

### §3. Banner Reactive Getter + Banner Text

```javascript
// src/screens/app.js — añadir al factory appShell

import { todayLocal, daysSinceISO } from '../domain/dates.js'

// ... entre los getters al final del factory:

/**
 * Banner de backup en la home (D-78 / D-80).
 *
 * Double-defense Alpine: devuelve false si state aún no cargó (boot pre-init).
 * Reactivo: Alpine re-evalúa cuando state.lastBackupAt o state.firstUsedAt cambian.
 *
 * Lógica D-78:
 *   bannerVisible =
 *     (lastBackupAt === null && firstUsedAt !== null && daysSince(firstUsedAt) > 7)
 *     || (lastBackupAt !== null && daysSince(lastBackupAt) > 7)
 *
 * Pitfall #5: si lastBackupAt es futuro (clock skew o backup importado con fecha
 * futura), daysSinceISO devuelve negativo → no mostramos banner.
 *
 * @returns {boolean}
 */
get shouldShowBackupBanner() {
  if (!this.state) return false
  const today = todayLocal()
  const last = this.state.lastBackupAt
  const first = this.state.firstUsedAt
  if (last !== null && typeof last === 'string') {
    return daysSinceISO(last, today) > 7
  }
  if (first !== null && typeof first === 'string') {
    return daysSinceISO(first, today) > 7
  }
  return false
},

/**
 * Texto del banner — getter separado para legibilidad del template.
 *
 * @returns {string}
 */
get backupBannerText() {
  if (!this.state) return ''
  const today = todayLocal()
  const last = this.state.lastBackupAt
  if (last === null) {
    return 'Aún no has exportado tu progreso.'
  }
  const days = daysSinceISO(last, today)
  return `Han pasado ${days} días desde tu último backup.`
}
```

```html
<!-- index.html — dentro del template currentScreen === 'home', ARRIBA de la tabla -->

<template x-if="shouldShowBackupBanner">
  <div role="alert" class="backup-banner">
    ⚠ <span x-text="backupBannerText"></span>
    <button type="button" class="secondary" @click="currentScreen = 'backup'">
      Ir a Backup
    </button>
  </div>
</template>
```

### §4. Migration Chain Extension (migrate2to3)

```javascript
// src/data/storage.js — extensión

const KEY = 'italianCourse.v1'
const CURRENT_SCHEMA_VERSION = 3   // bumped from 2

/**
 * V3 blank state — añade lastBackupAt + firstUsedAt como null (D-77, D-78).
 */
export function blankState() {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exerciseStats: {},
    categoryProgress: {},
    dailyLog: {},
    lastBackupAt: null,
    firstUsedAt: null
    // inFlightTest omitido (undefined)
  }
}

// migrate() dispatcher — encadena migraciones por schemaVersion
function migrate(parsed) {
  if (!parsed || typeof parsed !== 'object') return blankState()
  let s = parsed
  if (s.schemaVersion === 1) s = migrate1to2(s)
  if (s.schemaVersion === 2) s = migrate2to3(s)
  if (s.schemaVersion === 3) return hydrateV3(s)
  console.warn('schemaVersion desconocido:', s.schemaVersion, '— iniciando estado en blanco')
  return blankState()
}

/**
 * Migra un estado v2 a v3 (D-77, D-78). Idempotente: añade
 * lastBackupAt + firstUsedAt como null si faltan, bump schemaVersion.
 * Preserva exerciseStats, categoryProgress, dailyLog, inFlightTest intactos.
 *
 * @param {object} v2
 * @returns {object} Estado v3
 */
export function migrate2to3(v2) {
  return {
    schemaVersion: 3,
    exerciseStats: (typeof v2.exerciseStats === 'object' && v2.exerciseStats !== null) ? v2.exerciseStats : {},
    categoryProgress: (typeof v2.categoryProgress === 'object' && v2.categoryProgress !== null) ? v2.categoryProgress : {},
    dailyLog: (typeof v2.dailyLog === 'object' && v2.dailyLog !== null) ? v2.dailyLog : {},
    lastBackupAt: typeof v2.lastBackupAt === 'string' ? v2.lastBackupAt : null,
    firstUsedAt: typeof v2.firstUsedAt === 'string' ? v2.firstUsedAt : null,
    inFlightTest: v2.inFlightTest   // preservar (puede ser undefined u objeto)
  }
}

/**
 * Hidrata un estado v3 ya en disco. Reemplaza hydrateV2.
 *
 * @param {object} parsed
 * @returns {object} Estado v3 hidratado
 */
export function hydrateV3(parsed) {
  return {
    schemaVersion: 3,
    exerciseStats: (typeof parsed.exerciseStats === 'object' && parsed.exerciseStats !== null) ? parsed.exerciseStats : {},
    categoryProgress: (typeof parsed.categoryProgress === 'object' && parsed.categoryProgress !== null) ? parsed.categoryProgress : {},
    dailyLog: (typeof parsed.dailyLog === 'object' && parsed.dailyLog !== null) ? parsed.dailyLog : {},
    lastBackupAt: typeof parsed.lastBackupAt === 'string' ? parsed.lastBackupAt : null,
    firstUsedAt: typeof parsed.firstUsedAt === 'string' ? parsed.firstUsedAt : null,
    inFlightTest: parsed.inFlightTest
  }
}
```

### §5. `daysSinceISO` helper

```javascript
// src/domain/dates.js — añadir

/**
 * Days elapsed from an ISO UTC timestamp to a local-date `YYYY-MM-DD` reference.
 *
 * Comparison strategy (DST-safe, Pitfall #4):
 *   1. Parse iso → Date (UTC instant).
 *   2. Format that Date to its LOCAL day in YYYY-MM-DD (via todayLocal(date)).
 *   3. Construct both Dates at LOCAL NOON (mediodía) — evita DST shifts ±1h.
 *   4. Compute (today_ms - iso_local_noon_ms) / 86400000 + Math.round.
 *
 * Can return negative values for future timestamps (clock skew, imported backups
 * from another timezone). Callers decide whether to treat negative as "0 days"
 * or use it as a clock-skew signal (Pitfall #5).
 *
 * @param {string} iso - ISO 8601 UTC timestamp (e.g. '2026-05-24T14:32:11.000Z').
 * @param {string} todayStr - Local date in 'YYYY-MM-DD' (typically from todayLocal()).
 * @returns {number} Integer days. Negative if iso is in the future relative to todayStr.
 */
export function daysSinceISO(iso, todayStr) {
  if (typeof iso !== 'string' || typeof todayStr !== 'string') return 0
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 0
  // Format d to its LOCAL YYYY-MM-DD (mismo método que todayLocal()).
  const isoLocal = todayLocal(d)
  // Both dates at local noon — DST-safe.
  const a = parseIsoLocalNoon(isoLocal)
  const b = parseIsoLocalNoon(todayStr)
  if (!a || !b) return 0
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}

function parseIsoLocalNoon(isoDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0)
}
```

### §6. Pico classless banner style

```css
/* styles.css — añadir tras .inflight-banner (que ya existe) */

/*
 * Banner de backup en la home (D-80). Mismos tonos ámbar/warning que
 * .inflight-banner para coherencia visual ("alerta clara sin alarmismo"),
 * pero clase separada para permitir tonalidad distinta si el autor lo pide
 * en UAT. Banner persistente, sin transición — coherente con D-80.
 */
.backup-banner {
  border: 1px solid var(--pico-color-amber-500, #f59e0b);
  background: rgba(245, 158, 11, 0.08);
  padding: 0.75rem 1rem;
  border-radius: var(--pico-border-radius, 0.25rem);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.backup-banner button {
  margin-left: auto;
  flex-shrink: 0;
}

/*
 * Pantalla Backup — área de mensajes (D-83). Verde sutil en éxito, rojo sutil
 * en error. Sin animación.
 */
.backup-message-success {
  color: var(--pico-color-green-500, #2e7d32);
  font-weight: 600;
  margin: 1rem 0;
}
.backup-message-error {
  color: var(--pico-color-red-500, #d32f2f);
  font-weight: 600;
  margin: 1rem 0;
}

.backup-status {
  color: var(--pico-muted-color, #6c757d);
  font-size: 0.95em;
  margin: 0.5rem 0 1.5rem 0;
}
```

### §7. Pantalla Backup template

```html
<!-- index.html — añadir tras el template currentScreen === 'summary' -->

<template x-if="currentScreen === 'backup'">
  <article>
    <header><h2>Backup</h2></header>

    <p class="backup-status" x-text="backupStatusLine"></p>

    <div class="button-row">
      <button type="button" @click="exportBackup">Exportar progreso</button>
      <button type="button" class="secondary" @click="$refs.backupFileInput.click()">
        Importar progreso
      </button>
    </div>

    <!-- Input file oculto, disparado programáticamente desde el botón anterior. -->
    <input type="file"
           x-ref="backupFileInput"
           accept=".json,application/json"
           @change="onFileSelected($event)"
           style="display: none">

    <template x-if="backupLastMessage">
      <p :class="backupLastMessage.kind === 'success' ? 'backup-message-success' : 'backup-message-error'"
         x-text="backupLastMessage.text"></p>
    </template>

    <hr>
    <button type="button" class="secondary" @click="requestReturnToHome">← Volver al home</button>
  </article>
</template>
```

```javascript
// Getter complementario en appShell:
get backupStatusLine() {
  if (!this.state) return ''
  const last = this.state.lastBackupAt
  if (last === null) {
    return 'Aún no has exportado tu progreso.'
  }
  const days = daysSinceISO(last, todayLocal())
  const date = new Date(last).toLocaleDateString('es-ES')
  return `Último backup: ${date} (hace ${days} días).`
}
```

### §8. Botón secundario "Backup" en la home button-row

```html
<!-- index.html — modificar .button-row.button-row-prominent en la home -->

<div class="button-row button-row-prominent">
  <button type="button" @click="openPicker('repaso')">Repaso 20</button>
  <button type="button" @click="openPicker('test-completo')">Test completo</button>
</div>
<!-- D-81: botón secundario "Backup" SEPARADO de los dos prominentes. -->
<div class="button-row">
  <button type="button" class="secondary" @click="currentScreen = 'backup'">Backup</button>
</div>
```

### §9. `firstUsedAt` setting in caller (single-source pattern)

```javascript
// src/screens/app.js — helper privado dentro del factory

/**
 * Setea state.firstUsedAt al timestamp ISO actual si aún es null.
 * Llamado desde completeSession() y persistInFlightTest() ANTES de saveState.
 * Idempotente — segundo invocación es no-op porque firstUsedAt ya != null.
 */
setFirstUsedAtIfMissing() {
  if (this.state.firstUsedAt === null) {
    this.state = { ...this.state, firstUsedAt: new Date().toISOString() }
  }
}
```

Llamadas:
- En `completeSession()` ANTES del `applySessionResult` + `saveState` ya existente.
- En `applyResultToSession()` rama D-54 fallo inmediato, ANTES del `saveState(newState)`. **Nota**: el state pre-fallo es `this.state` (no `newState`), así que setear `this.state.firstUsedAt` antes de la llamada a `applyImmediateFailure`. Alternativa más limpia: aplicar el setter al `newState` antes de `saveState(newState)`.
- En `persistInFlightTest()` ANTES del `saveState`. Mismo patrón.

[VERIFIED: aligns with existing D-54 saveState reactive update pattern in src/screens/app.js]

---

## PDF Transcription Strategy

> Sección extendida — Phase 4 dedica un plan entero (1 plan, 6 commits) a esta transcripción asistida. Esta es la fuente de verdad para la metodología.

### §A. Methodology per PDF

**Step 1 — Claude reads the PDF.** Usar la Read tool de Claude Code sobre `material-profesora/{file}.pdf`. Claude Code es multimodal, ve las tablas y headings directamente.

**Step 2 — Claude extracts vocabulary + grammar rules.** Catalogar:
- Tablas (conjugaciones, pares masc/fem, sing/plur).
- Listas (preposiciones simples, profesiones).
- Ejercicios prácticos del PDF (los blanks "______" sugieren multi-choice o word-buttons).
- Excepciones y notas en banners ("Atención:", "Regla de oro:").

**Step 3 — Claude propone JSON candidato.** Para cada PDF, generar `~12-15` ejercicios distribuidos según D-86. Bocetar IDs `{slug}-001` ... `{slug}-NNN`. Multi-categoría IDs en range alto (`{slug}-300+`).

**Step 4 — Autor revisa pedagógicamente.** El autor lee cada ejercicio, valida (a) que el italiano es correcto, (b) que las distractoras son distractoras válidas pedagógicamente (no triviales ni absurdas), (c) que el cruce multi-categoría aporta valor.

**Step 5 — Validación en runtime.** Antes del commit, cargar el JSON en `npx serve`, recargar `http://localhost:3000` y verificar:
- Schema validator no lanza errores (no debería — los 3 tipos están cerrados).
- La categoría nueva aparece en la home.
- Una sesión Repaso de la categoría arranca correctamente.
- Los acentos italianos (`è`, `ò`, `à`) se renderean bien.

**Step 6 — Commit por categoría.** Mensaje `content: add {category} exercises (Phase 4 SEED-01)`.

**Iteración.** Si el autor encuentra un ejercicio mal en review, edita el JSON directamente. Claude no defiende su propuesta — la autoridad pedagógica es del autor.

### §B. Recommended Transcription Order (Claude's Discretion)

| Order | Category | Justification |
|-------|----------|---------------|
| 1 | **preposiciones** | PDF más corto (2.7 KB, 1 página). Material claro: 8 preposiciones simples + tabla articolate 6×6. Multi-choice obvio: "Vado ___ Roma". Pocos casos límite. Bajo riesgo, valida el flujo. |
| 2 | **verbos-movimiento** | PDF mediano (24 KB, 3 páginas). Conjugación essere/avere clara + lista de verbos. Ejercicios del PDF ya tienen formato multi-choice. Lui è andato / Lei è andata permite work-buttons natural. |
| 3 | **sustantivos-irregulares** | PDF largo (220 KB, 2 páginas). Cuatro tablas tematizadas (familia, cuerpo, casos especiales) — match natural sing→plur. Riesgo menor: vocabulario cerrado. |
| 4 | **genero-numero** | PDF mediano (22 KB, 2 páginas). Reglas + excepciones. Match (sustantivo → artículo) + multi-choice de plurales. Los blanks del PDF dan ejercicios listos. |
| 5 | **profesiones** | PDF mediano (20 KB, 3 páginas). Cinco tablas amplias (~50 profesiones). Mezcla más rica de tipos: match masc↔fem, multi-choice articolo (`il`/`la`/`l'`), word-buttons para frases. **Más sensible a errores** porque hay más variedad. |
| 6 | **avere (multi-cat añadidos)** | Avere existe ya con 17 ejercicios. Los 1-2 multi-cat nuevos crucen con las categorías ya transcritas — orden 6 garantiza que las cinco categorías existen para los cruces. |

### §C. Specific Multi-Category Crosses (real material verified)

Cruces semánticos naturales con sentido pedagógico (D-87), basados en contenido real de los PDFs:

| Cross | Example Exercise (type) | Justification |
|-------|-------------------------|---------------|
| **Avere + Profesiones** | `Lui ___ un fratello medico.` (multi-choice: `ho`/`hai`/`ha`/`abbiamo`, correct: `ha`) | Avere tiene "fratello/sorella" en Phase 1; añade "medico" → cruza naturalmente. |
| **Avere + Profesiones (fem)** | `Io ___ una sorella avvocata.` (multi-choice: correct `ho`) | Reforza el femenino "avvocata" (PDF profesiones §1) + io ho. |
| **Verbos Movimiento + Preposiciones** | `Vado ___ Roma.` (multi-choice: `a`/`in`/`da`/`per`, correct: `a`) | PDF preposiciones tiene `Vado a casa` literal; PDF verbos-movimiento tiene `andare`. Cruce literal del PDF. |
| **Verbos Movimiento + Preposiciones (in)** | `Vivo ___ Italia.` (multi-choice: correct `in`) | Preposiciones PDF: "in → luogo (paesi, regioni)". Vivere es estático, pero el cruce con "lugar" lo hace pedagógicamente válido. |
| **Género/Número + Sustantivos Irregulares** | `Il braccio (singular) → ___` (multi-choice: `bracci`/`braccia`/`bracce`/`bracco`, correct: `braccia`) | Sustantivos irregulares PDF: braccio → braccia (masc→fem en plural). Refuerza ambas reglas. |
| **Género/Número + Profesiones** | `Il dottore (femenino) → ___` (multi-choice: `dottora`/`dottoressa`/`dotrice`/`dottore`, correct: `dottoressa`) | Génère y Número PDF tiene `-e → -essa: Dottore → Dottoressa`; Profesiones PDF tiene `il dottore / la dottoressa`. Refuerza ambas. |
| **Preposiciones + Profesiones** | `Vado dal ___.` (multi-choice: `dottore`/`medico`/`avvocato`/`infermiere`) | `dal` (da+il) en preposizioni articolate; profesión en complement. Pedagógicamente sólido. |
| **Avere + Sustantivos Irregulares (cuerpo)** | `Lui ___ due braccia.` (multi-choice: correct `ha`) | Cuerpo + posesión con avere. Cruza tres reglas. |

### §D. Italian-language Landmines

- **NFC normalize on load** ya cubre acentos (CONT-06 + content-loader.js). Pero el editor de texto puede componer `é` como `e` + `́` (NFD). Test: cargar el JSON, abrir DevTools → `JSON.parse(localStorage.getItem('italianCourse.v1')).clearedExerciseIds` y verificar que no hay strings con secuencias raras. **En la práctica**: Claude genera strings NFC por defecto cuando proponen italianos — bajo riesgo.
- **Artículos con apóstrofe** (`l'amico`, `l'attore`, `l'avvocata`): el apóstrofe UTF-8 estándar es `'` (U+0027 APOSTROPHE). PDFs a veces usan `'` (U+2019 RIGHT SINGLE QUOTATION MARK) por estilo tipográfico. **Test**: grep `'` en los JSONs antes de commit. Si aparece, decidir si normalizar a `'` (recomendado, más simple grading case-insensitive). Documentar la convención.
- **Mayúsculas al inicio**: PDFs italianos a veces empiezan frases con mayúscula. Phase 3 grading es case-insensitive para word-buttons + match (D-67) → no es un problema funcional. Render preserva capitalización — quedará feo si una opción es "Roma" y otra "andare". **Recomendación**: capitalización consistente per tipo: prompts con mayúscula inicial; `options[]` y `answer[]` en minúscula (excepto nombres propios).
- **Plurales que no cambian** (`caffè`, `città`, `università` — terminan en vocal acentuada): los PDFs sí lo mencionan. Los ejercicios match deben evitar caer en "trampa fácil" — incluirlos como casos pedagógicos explícitos.
- **`Lui/Lei` vs `Egli/Ella`**: a nivel A1 solo se usa `Lui/Lei` (PDF avere lo confirma). Mantener.
- **Verbos pronominales** (no aplican en estos PDFs, no preocupación v1).
- **Concordancia de género en passato prossimo con essere**: `Lui è andato` vs `Lei è andata`. PDF verbos-movimiento lo aclara. Multi-choice puede explotar este caso: `Maria ___ andat__ al cinema` → un blank dual (auxiliar + concordancia). Para schema actual (un solo `___` por prompt), separar en dos ejercicios o aceptar simplificación.

### §E. Distractoras Strategy (multi-choice)

- **3-4 opciones por ejercicio** (schema D-07 lo enforced).
- **Distractoras pedagógicamente útiles**: otras formas conjugadas del MISMO verbo (avere `hai` distractor para `ha`), o preposiciones del mismo grupo (`in` distractor para `a`), o profesiones del mismo género en singular distractor para el plural.
- **Evitar distractoras absurdas** (`xyz`, palabras inventadas) — no aportan.
- **Variar la posición de la respuesta correcta** (0/1/2/3) entre ejercicios — sino el autor memoriza "siempre es la 2ª opción".

### §F. Word-buttons strategy

- **Solo cuando hay una frase clara para construir**, no para listas o tablas.
- **Span de palabras 3-6 tokens** (más se vuelve tedioso al escribir).
- **Distractoras opcionales**: 1-2 palabras del MISMO grupo gramatical que NO entran en la respuesta (e.g., `hai` cuando la respuesta es `ho`).
- **NO punctuation tokens** — el grading es por tokens; puntos finales rompen el match. PDFs siempre llevan punto final en el prompt; en el array `answer`/`distractors` NO incluir punto.

### §G. Match strategy

- **2-10 pares (schema enforced).** Sweet spot 4-7 pares.
- **Duplicados textuales en derecha permitidos** (D-66) — útil para "todas estas tienen el artículo `la`": `["donna","la"], ["casa","la"], ["porta","la"]` con un único item `"la"` no funciona, pero `["donna","la"], ["casa","la"]` con DOS items `"la"` en derecha SÍ funciona (Phase 3 verificado).
- **Sing↔Plur match** para sustantivos irregulares: `[["uomo","uomini"], ["braccio","braccia"], ["uovo","uova"]]` — patrón canónico.
- **Articolo + sustantivo match** para género y número: `[["il", "ragazzo"], ["la", "ragazza"], ["lo", "studente"], ["l'", "amico"]]` — atención al apóstrofe.

---

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|------------------------|--------------|--------|
| `FileReader.readAsText(file)` event-based | `await file.text()` Promise-based | April 2021 Baseline | Más limpio. Ambos válidos. |
| `<a href={dataUrl}>` (data URL) | `<a href={URL.createObjectURL(blob)}>` (object URL) | Hace años; ya canónico | Mejor para archivos grandes; menos memory pressure. |
| `showSaveFilePicker` File System Access API | `<a download>` + Blob (universal) | API no soportada por Firefox/Safari | LOCKED en CLAUDE.md tech stack — NO usar FS Access API. |
| `JSON.parse` con `JSON.parse.reviver` para escapado | Trust + post-parse validation con type-guards puros | Estabilizado años ago | El parser puro `parseBackupFile` ya hace type-guards de cada campo. |
| `window.confirm` modal nativo | Inline `<dialog>` o custom panel `requestConfirm` | Modernización UX | LOCKED en Phase 2 D-27 — usar `requestConfirm` existente. |

**Deprecated/outdated:**
- `webkitDirectory` / `mozGetAsFile` — vendor-specific antes de spec; ya no se usan.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | El navegador soporta `<a download>` attribute en 2026 | Code Examples §1 | [VERIFIED MDN 2026: Baseline since 2015]. Imposible que esté mal. |
| A2 | `URL.revokeObjectURL` inmediato tras `a.click()` no rompe el download | Code Examples §1 (Pitfall #7) | LOW: con `setTimeout(0)` defensivo, el riesgo es despreciable. Pattern canónico MDN. |
| A3 | El autor tendrá tiempo para revisar pedagógicamente 60-90 ejercicios nuevos en una sola sesión de Phase 4 | PDF Transcription Strategy | MEDIUM: si el autor se distrae o se cansa, podría aceptar errores. Mitigado por commit-por-categoría (D-85) que permite parar entre categorías. |
| A4 | El schema validator dispatch table (Phase 3) cubre 100% los casos de los 6 PDFs sin necesidad de expansión | Standard Stack | HIGH: los 3 tipos cierran el catálogo. Confirmar empíricamente que cualquier ejercicio razonable de los PDFs cabe en {multi-choice, word-buttons, match}. |
| A5 | `firstUsedAt` set en el caller (completeSession) es estrategia preferida vs en saveState | Architecture Pattern #3 | LOW: alternativa funciona pero rompe layer purity. Mantener guard en caller. |
| A6 | NFC normalize NO se aplica a `state` importado (solo a content) | Common Pitfalls #8 | LOW: state es ASCII por diseño (IDs ASCII, fechas ISO, slugs ASCII). |
| A7 | `setTimeout(0)` post revoke es suficiente defensa contra Pitfall #7 | Code Examples §1 | LOW: MDN canonical pattern hace revoke síncrono; defensivo con setTimeout 0 ms añade margen sin coste. |
| A8 | La forma de los wrappers `kind === 'italian-course-backup'` es suficiente para distinguir de otros JSONs | Architecture Pattern #2 | LOW: string distintivo + chequeo type → bajo riesgo de false positive con otros archivos del autor. |
| A9 | El autor NO importará nunca un backup futuro / desde otra timezone con clock skew significativo (>1 día) | Common Pitfalls #5 | LOW: app personal local, una sola máquina, pero defensa con "future date → no banner" es trivial añadir. |
| A10 | `migrate2to3` aplicado idempotentemente sobre un state ya v3 NO corrompe (gracias a `hydrateV3` que normaliza todo) | Architecture Pattern #3 | LOW: las migraciones encadenan only-if-needed (`if (s.schemaVersion === 2)`); v3 va directo a hydrateV3. |
| A11 | El user en uso normal NO tiene un `inFlightTest` ABIERTO cuando importa un backup (no es flujo natural) | Common Pitfalls #10 | LOW: defensa con `resetSession()` antes del state replace cubre el caso edge. |
| A12 | El orden recomendado de transcripción (preposiciones primero) maximiza eficiencia | PDF Transcription Strategy §B | LOW: justificación basada en tamaño/complejidad; el autor puede pedir otro orden si prefiere. Claude's Discretion. |

---

## Open Questions

1. **¿`firstUsedAt` debería setearse en boot al PRIMER `loadState` que retorne v3 con `firstUsedAt: null`, o solo en la primera sesión completada?**
   - **CONTEXT.md dice:** "Se setea en el primer `saveState` real (cuando una sesión completada cambia el estado)" (D-78).
   - **What we know:** Setear en boot tendría el inconveniente de que un usuario que abre la app pero nunca completa una sesión tendría el banner al día 8 sin haber usado realmente la app. Setear en la primera sesión completada deja la semántica "te empiezas a usar realmente cuando completas algo" — más coherente con el core value.
   - **Recommendation:** Setear en el primer `saveState` post-`completeSession` (no en boot). Pattern Code Example §9. **Decisión locked en CONTEXT.md — no requiere user confirm.**

2. **¿El cruce multi-categoría Avere + Profesiones (en `avere.json`) debe llevar el slug `avere-` o un slug nuevo `multi-`?**
   - **CONTEXT.md dice:** "ID lleva el slug de la categoría 'principal' + range alto (e.g., `avere-300+`)" (Claude's discretion).
   - **What we know:** El concepto "categoría principal" puede ser ambiguo en cruce. Para el ejercicio `Lui ha un fratello medico`, ¿es principal Avere (foco gramatical) o Profesiones (vocabulario novedoso)? El autor probablemente prefiere Avere como principal porque conceptualmente "ejercicio de avere con vocabulario extra de profesiones".
   - **Recommendation:** Convención simple: el slug = categoría más simple / más común; las otras se añaden en `categoryIds[]`. Para `Lui ha un fratello medico`: `id: "avere-301"`, `categoryIds: ["avere", "profesiones"]`. Decidible por el planner. No bloquea research.

3. **¿El banner debería tener un click-to-dismiss que oculta SOLO hasta el próximo refresh?**
   - **CONTEXT.md dice:** "Sin snooze, sin dismiss persistente" (D-80).
   - **What we know:** D-80 lock es claro. Si en UAT humano el autor descubre que es muy molesto, se reconsidera en v2 (deferred).
   - **Recommendation:** Implementar sin dismiss. Locked.

4. **¿Hay riesgo de que un usuario abra el `.json` exportado en un editor de texto y modifique a mano un `exerciseStats.timesShown` (rompiendo monotonicidad DOMAIN-09)?**
   - **What we know:** Sí es físicamente posible. Es una app personal — el autor TIENE acceso al JSON. La defensa actual en `hydrateV3` es type-only (`typeof === 'object'`), no value-range. Si edita y queda con `timesShown: -5`, importa OK y el state se corrompe.
   - **Recommendation:** **Deferred** — no protección extra en v1. Documentar como invariante de confianza ("el autor es el adversario solo si quiere; la app no es un adversary-resistant store"). El daño es solo a sí mismo.

5. **El smoke test integrado de 30 días de Phase 2 — ¿necesita actualizar con 6 categorías reales o sigue siendo sintético?**
   - **CONTEXT.md dice:** "Actualizar con contenido real es Claude's discretion del planner" (sección Claude's Discretion).
   - **What we know:** El test conceptualmente cubre cascada multi-cat. Phase 4 lleva eso a contenido real (6-12 multi-cat exercises). Si el smoke test usa fixtures sintéticas, sigue valiendo conceptualmente. **Plus**: añadir UN ejercicio multi-cat REAL al smoke test (e.g., `Lui ha un fratello medico`) confirma end-to-end que el pipeline content-loader + schema-validator + cascada D-54 sigue verde con multi-cat real.
   - **Recommendation:** Mantener el smoke test sintético existente + AÑADIR un mini-test de cascada multi-cat usando contenido real fixtured (carga `content/exercises/avere.json` desde fixture, escoge el ejercicio multi-cat, simula fallo, asserta cascada sobre las dos categorías). Decisión del planner.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js LTS | `node --test` (test runner) + `npx serve` (dev) | ✓ | v22.20.0 | — |
| Modern browser (Chrome/Firefox/Safari/Edge) | Runtime — Blob, FileReader, localStorage, URL.createObjectURL | ✓ (assumed) | Last 2 years | — |
| PDF Read tool (Claude Code multimodal) | PDF transcription | ✓ verified | — | Manual transcription by author (much slower) |
| File system writable (`content/exercises/*.json`) | Append nuevos JSONs | ✓ | — | — |
| `npx serve` cached | Runtime local | ✓ verified Phase 1 | — | VS Code Live Server (FOUND-01 alternative) |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

---

## Test Strategy (Phase 4)

> **Nota:** `nyquist_validation: false` en config.json — la Validation Architecture sección detallada se omite por config. Sin embargo, esta sección documenta cobertura mínima recomendada porque Phase 4 toca migración de schema (alto riesgo si rota).

### Test Surface (puro, ejecutable con `node --test tests/*.test.js`)

| Test target | File | Purpose |
|-------------|------|---------|
| `daysSinceISO(iso, todayStr)` | `tests/domain.test.js` (extend) | Días positivos, día 0 (hoy), negativos (futuro), boundary 7 días, boundary DST (oct/mar), input inválido (no string, NaN date). |
| `migrate2to3(v2)` | `tests/data-storage.test.js` (extend) | Añade lastBackupAt+firstUsedAt null si faltan; preserva si ya hay valores; preserva exerciseStats/categoryProgress/dailyLog/inFlightTest intactos; bump schemaVersion=3. |
| `blankState()` v3 shape | `tests/data-storage.test.js` (extend) | Retorna schemaVersion=3, lastBackupAt=null, firstUsedAt=null, otros campos vacíos. |
| `hydrateV3(parsed)` defensivo | `tests/data-storage.test.js` (extend) | parsed con campos faltantes / null / wrong type → coerce a defaults seguros. |
| `parseBackupFile(rawStr)` | `tests/data-backup.test.js` NUEVO | JSON inválido → error con mensaje en español. kind faltante → error. state faltante → error. schemaVersion>3 → error future. schemaVersion=1 → migra a v3 OK. schemaVersion=2 → migra a v3 OK. schemaVersion=3 → pasa derecho. Wrapper inconsistente (wrapper.schemaVersion != state.schemaVersion) → error. summary correcto (categories count, exercises count, exportedAt preservado). |
| Smoke test integrado 30 días (extend) | `tests/domain.test.js` or `tests/exercise-types.test.js` | Mismo escenario Phase 2 + un cruce multi-cat REAL del nuevo content (verifica que la cascada llega a 2 categorías de los nuevos JSONs). |
| Schema validator regression (verify) | `tests/exercise-types.test.js` (verify, no extend) | Cargar fixture con los 6 archivos nuevos → ningún error. (No es estrictamente "test nuevo" — es smoke de regresión validando que los JSONs reales pasan.) |

### Estimated test count

- ~6 tests para `daysSinceISO`.
- ~5 tests para `migrate2to3` + `blankState v3` + `hydrateV3`.
- ~10 tests para `parseBackupFile`.
- ~1 test extendido del smoke de 30 días.

**Total:** ~22 nuevos tests + 105 baseline = ~127 tests verdes esperados tras Phase 4.

### Tests fuera de scope

- Tests del UI (banner aparecer/desaparecer): UAT humano. La lógica subyacente (`shouldShowBackupBanner`, `daysSinceISO`) sí tiene tests unitarios.
- Tests del flujo de export/import end-to-end: no factibles en node --test sin browser (Blob/URL/FileReader no existen). UAT humano.

---

## Project Constraints (from CLAUDE.md)

| Constraint | Source | Phase 4 Implication |
|------------|--------|---------------------|
| Web estática (HTML+CSS+JS, sin servidor) | CLAUDE.md "Tech stack" | Phase 4 mantiene — todas las nuevas capabilities son browser-native APIs o módulos vanilla. |
| Cero build step ("doble click y funciona") | CLAUDE.md "Recommended Stack" | Phase 4 no añade build pipelines. Cero `npm install`. |
| `localStorage` + export/import JSON | CLAUDE.md "Persistencia" | Phase 4 cierra esta capability con BACK-04/05. |
| Pinned versions Alpine 3.15 + Pico 2.1 | CLAUDE.md "Recommended Stack" + index.html SRI | Phase 4 NO actualiza estas dependencias. |
| Idioma UI español | CLAUDE.md "Idioma" + FOUND-04 | Todos los nuevos textos en español: "Backup", "Exportar progreso", "Importar progreso", "Continuar", "Cancelar", banner "Han pasado N días", error "JSON inválido", éxito "Progreso importado". |
| Single-user, sin auth | CLAUDE.md "Constraints" | No requiere checks de autenticación. Documentar invariante "trust the user" (Open Question #4). |
| Desktop only v1 | CLAUDE.md "Dispositivo" | Pantalla Backup no requiere mobile responsive en v1. |
| `<input type="file">` (universal) NO File System Access API | CLAUDE.md "What NOT to Use" | Phase 4 cumple — usar `<input type="file">` + Blob.text() exclusivamente. |
| Tests con `node --test tests/*.test.js` | README + STATE.md | Tests nuevos siguen este patrón (no introducir Vitest u otra). |
| GSD workflow enforcement | CLAUDE.md | Phase 4 plans deben pasar por `/gsd:plan-phase 4` y luego `/gsd:execute-phase 4`. |

---

## Sources

### Primary (HIGH confidence)

- **MDN Web Docs (2026):** Verified directly via WebFetch — current published documentation
  - `URL.createObjectURL_static` — pattern + revokeObjectURL necessity + memory leak warning [HIGH]
  - `Blob/text` — Promise-based UTF-8 reading [HIGH]
  - `HTML/Element/input/file` — accept attribute hint behavior + value reset for re-selection + cancel event [HIGH]
  - `FileReader/readAsText` — legacy event-based fallback if needed [HIGH]
- **Existing codebase Phase 1+2+3 source files** (read directly):
  - `src/data/storage.js` — migration chain pattern, schemaVersion=2 establecido [HIGH]
  - `src/screens/app.js` — appShell factory plano, requestConfirm helper, double-defense Alpine pattern, D-54 reactive saveState [HIGH]
  - `src/domain/dates.js` — todayLocal pattern, DST-safe date parsing [HIGH]
  - `src/data/schema-validator.js` — dispatch table closed Phase 3 (no expand) [HIGH]
  - `src/main.js` — boot pipeline + Alpine init pattern [HIGH]
  - `index.html` — existing template patterns + banner classes [HIGH]
  - `styles.css` — .inflight-banner reusable style [HIGH]
  - `content/exercises/avere.json` — existing exercise shape (17 exercises) [HIGH]
- **PDFs in `material-profesora/`** (read directly via Claude Code multimodal):
  - `Clase_Italiano_Auxiliar_Avere.pdf` (referenced for avere multi-cat additions)
  - `Clase_Italiano_Genero_y_Numero.pdf` — confirmed tables + apostrophe convention [HIGH]
  - `Clase_Italiano_Verbos_Movimiento.pdf` — confirmed conjugation table + essere/avere rules [HIGH]
  - `Professioni_Italiano_Facile.pdf` — confirmed five tables + apostrophe style [HIGH]
  - `Sustantivos Irregulares.pdf` — confirmed irregular plurals categorized [HIGH]
  - `preposizioni_italiano.pdf` — confirmed 8 simple + 30 articulate prepositions [HIGH]
- **CONTEXT.md decisions D-73 through D-88 (locked):** Source of truth for Phase 4 decisions [HIGH]
- **Phase 1+2+3 CONTEXT.md + SUMMARY files:** Source of truth for established patterns referenced [HIGH]

### Secondary (MEDIUM confidence)

- Linguistics rationale for multi-categoría crosses based on the actual PDF content + Claude's training data for Italian A1 pedagogy. Verifiable by the author on review.

### Tertiary (LOW confidence)

- None required — all critical claims verified against authoritative sources.

---

## Metadata

**Confidence breakdown:**

- Standard stack: **HIGH** — Locked, zero new packages, all browser-native APIs verified MDN 2026.
- Architecture patterns: **HIGH** — All patterns extend existing established patterns from Phase 1-3 (requestConfirm, double-defense Alpine, migration chain, reactive getter). No novel paradigm.
- Pitfalls: **HIGH** — Catalogued from MDN warnings + cross-referenced with existing codebase pitfalls Phase 1-3.
- PDF transcription strategy: **MEDIUM** — Methodology is sound (Claude reads PDF → proposes JSON → author reviews → commits); pedagogical quality depends on author review iteration, which is variable.
- Multi-category crosses: **HIGH** — Examples verified against actual PDF content (preposiciones, verbi movimento, profesiones, sostantivi irregolari, genere e numero).
- Test strategy: **HIGH** — Aligns with established `node --test tests/*.test.js` pattern.

**Research date:** 2026-05-24
**Valid until:** 2026-06-24 estimate (stable APIs, no fast-moving dependencies). Codebase references valid until next refactor of `src/screens/app.js` or `src/data/storage.js`.
