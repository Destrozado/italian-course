# Phase 4: Backup robusto + contenido completo - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 cierra el MVP entregando **(a) un sistema de backup manual (export/import JSON + recordatorio >7 días) sobre el storage existente, y (b) los 6 PDFs reales transcritos a JSON con ejercicios multi-categoría que ejercitan la cascada D-54 en uso diario real**.

**Capacidades entregadas:**
- Pantalla `backup` (5ª en el `appShell` plano) con dos botones: Exportar progreso (descarga JSON con envoltura de metadata) e Importar progreso (acepta JSON, valida, pide confirmación, reemplaza state).
- Recordatorio en home (banner persistente) cuando han pasado >7 días desde el último export. Lógica defendida contra el caso "nunca exportaste" via `firstUsedAt`.
- Migración `migrate2to3` que añade `lastBackupAt: null` y `firstUsedAt: null` al state. Sin romper ningún backup pre-existente.
- `content/categories.json` con los 6 PDFs como categorías (Avere ya existente + 5 nuevas).
- 6 archivos `content/exercises/{slug}.json` con ≥ 10 ejercicios cada uno, tipos asignados según naturaleza pedagógica del PDF, ≥ 1-2 ejercicios multi-categoría por archivo.

**Requisitos cubiertos:** BACK-04 (export), BACK-05 (import + confirmación), BACK-06 (banner 7d), SEED-01 (transcripción 6 PDFs ≥10 ejercicios), SEED-02 (multi-cat ≥1-2 por PDF).

**Fuera del scope:**
- UI de edición de ejercicios (FUTURE-01) — los JSON se editan a mano.
- Sync cloud / multi-device (out of scope v1).
- Sub-categorías dentro de un PDF (out of scope v1).
- Generación con IA a partir de PDFs (FUTURE-04) — Claude propone JSON en este chat, no es un pipeline runtime.
- Log persistente de exports/imports (descartado en discusión — no aporta v1).

</domain>

<decisions>
## Implementation Decisions

### Backup JSON shape + import flow

- **D-73:** **Envoltura con metadata al exportar.** El archivo descargado tiene shape:
  ```json
  {
    "kind": "italian-course-backup",
    "exportedAt": "2026-05-24T14:32:11.000Z",
    "schemaVersion": 3,
    "state": { ...italianCourse.v1 raw blob completo... }
  }
  ```
  El campo `kind` permite distinguir backups de la app de otros JSON al re-importar. `exportedAt` se muestra en la confirmación del import. `schemaVersion` del nivel raíz es el del `state` en el momento del export (redundante con `state.schemaVersion` pero más visible).

- **D-74:** **Validación de import estricta + migración automática.** El flujo de import:
  1. Lee el archivo, intenta `JSON.parse`. Si falla → banner de error.
  2. Rechaza si: `kind !== 'italian-course-backup'`, `state` ausente, `state.schemaVersion` ausente.
  3. Si `state.schemaVersion <= CURRENT_SCHEMA_VERSION` (= 3): acepta y corre la cadena de migraciones existente (`migrate1to2`, `migrate2to3`) sobre `state` antes de hacer `saveState`. Forward-compat con backups antiguos.
  4. Si `state.schemaVersion > 3`: rechaza con banner ("Este backup viene de una versión más nueva de la app").

- **D-75:** **Nombre del archivo descargado:** `italian-course-backup-YYYY-MM-DD.json` usando `todayLocal()`. El navegador deduplica con `(1)`, `(2)` si exportas múltiples veces el mismo día — no se añade hora al nombre.

- **D-76:** **Confirmación del import reusa `requestConfirm()` inline (D-27).** El cuerpo del confirm muestra:
  - Fecha del export (parseada de `exportedAt` y formateada local).
  - Nº de categorías con progreso en el archivo (`Object.keys(state.categoryProgress).length`).
  - Nº de ejercicios con stats (`Object.keys(state.exerciseStats).length`).
  - Warning "Esto REEMPLAZARÁ tu progreso actual y no se puede deshacer".
  - Botones: `Continuar` (primario rojo destructivo) / `Cancelar` (secundario).

### Recordatorio de backup (banner 7 días)

- **D-77:** **`lastBackupAt` vive DENTRO del state** (clave `italianCourse.v1.lastBackupAt`). Migración `migrate2to3` añade el campo como `null`. Importar un backup viejo trae el `lastBackupAt` del archivo (intencional: "restauré de hace 30 días → banner debe volver a aparecer").

- **D-78:** **Necesita un segundo timestamp `firstUsedAt`** para gestionar el caso "nunca exportaste". `migrate2to3` añade `firstUsedAt: null`. Se setea en el primer `saveState` real (cuando una sesión completada cambia el estado y `firstUsedAt` aún es `null`). Lógica del banner:
  ```
  bannerVisible =
    (lastBackupAt === null && firstUsedAt !== null && daysSince(firstUsedAt) > 7)
    || (lastBackupAt !== null && daysSince(lastBackupAt) > 7)
  ```
  App recién instalada sin sesión completada → sin banner. Tras 7 días de uso real sin export → banner. Tras un export → desaparece. Tras 7 días sin nuevo export → reaparece.

- **D-79:** **Formato del timestamp = ISO UTC** (`new Date().toISOString()`). La comparación "han pasado N días" usa `todayLocal()` y aritmética de días locales completos (coherente con DOMAIN-07 `lastSuccessDate` y `dailyLog`). Helper sugerido `daysSinceISO(iso, todayStr) → number` puro en `src/domain/dates.js` (extiende el módulo dates).

- **D-80:** **Banner persistente en la home, sin snooze.** Texto: "⚠ Han pasado N días desde tu último backup" (o "⚠ Aún no has exportado tu progreso" si `lastBackupAt === null`) + botón/link "Ir a Backup". Aparece arriba de la tabla densa de categorías. Desaparece automáticamente al exportar (`lastBackupAt` se resetea). Coherente con el tono "el sistema te obliga" — no se puede silenciar.

### Navegación a pantalla Backup

- **D-81:** **Botón secundario "Backup" en home** junto a los dos botones principales (Repaso 20 / Test completo). Clase Pico `secondary` para distinguirlo visualmente — no compite con los protagonistas. Visible siempre, descubrible sin depender del banner.

- **D-82:** **Vuelta a home con "← Volver al home"** reusando el handler `requestReturnToHome()` existente del summary screen. Mismo wording que Phase 2.

- **D-83:** **Pantalla Backup muestra estado actual + dos botones + área de mensajes.** Layout:
  - Cabecera con título "Backup".
  - Línea de estado: "Último backup: {fecha local} (hace N días)" o "Aún no has exportado tu progreso" si `lastBackupAt === null`.
  - Botón primario "Exportar progreso" (dispara descarga directa, muestra mensaje de éxito).
  - Botón secundario "Importar progreso" (abre el `<input type="file">`, tras seleccionar dispara el flujo de validación + confirmación D-76).
  - Área de mensajes (`backupLastMessage`): éxito/error tras última operación. Se limpia al volver a la pantalla.
  - Botón "← Volver al home" abajo.

- **D-84:** **5º valor `'backup'` en `currentScreen` + sub-estados en el factory plano** (patrón idéntico a D-25). Sub-estados nuevos:
  - `backupFileInputRef`: ref del `<input type="file">` (Alpine `$refs`).
  - `backupLastMessage`: `{ kind: 'success'|'error', text: string } | null`.
  - `backupPendingImport`: `{ exportedAt, state, summary: { categories, exercises } } | null` — payload validado pendiente de confirmación inline.

### Estrategia de transcripción de los 6 PDFs

- **D-85:** **Claude lee cada PDF con Read tool → propone JSON candidato → autor revisa y corrige.** Reparto: Claude hace el grueso del trabajo mecánico (parsing PDF, identificar ejercicios candidatos, formatear schema, asignar IDs, generar distractoras para `word-buttons`, proponer pairs para `match`). El autor revisa pedagógicamente categoría por categoría (cada una termina en un commit propio).
  - Riesgo: Claude inventa o malinterpreta italiano → mitigado por (a) la revisión humana antes del commit, (b) el schema validator existente, (c) NFC normalize on load (CONT-06).
  - Si un ejercicio propuesto no cuadra con el PDF, el autor edita el JSON directamente.

- **D-86:** **Tipo natural por PDF** (no uniformidad forzada). Asignación inicial:
  - **Avere** (existente): mantener tal cual (12 multi-choice + 2 word-buttons + 3 match). Añadir 1-2 multi-categoría nuevos (Avere + Profesiones / Avere + Sustantivos).
  - **Verbos de Movimiento**: mayoría multiple-choice (conjugación + huecos), algún word-buttons si surge una frase clara.
  - **Preposiciones**: mayoría multiple-choice (hueco con preposición correcta: `Vado ___ Roma`).
  - **Género y Número**: mayoría match (sustantivo ↔ artículo, singular ↔ plural). Si el PDF tiene cuadros de excepciones, multi-choice de "cuál es el plural de X".
  - **Sustantivos Irregulares**: mayoría match (singular ↔ plural irregular). Multi-choice para casos límite.
  - **Profesiones**: mezcla — multi-choice para masculino/femenino (`Lui è ___ medico`), word-buttons para frases completas (`Yo soy abogada` → `io sono avvocata`).
  - Cantidad: ≥10 por categoría (SEED-01); apuntar a ~12-15 para dar espacio al sampler.

- **D-87:** **Cruces multi-categoría = cruces naturales semánticos** (no forzados). Ejemplos a buscar:
  - `Lui ha un fratello medico` → Avere + Profesiones.
  - `Vado a Roma` → Verbos Movimiento + Preposiciones.
  - `Le case sono belle` → Género/Número (potencialmente + Sustantivos Irregulares).
  - `Io ho una sorella avvocata` → Avere + Profesiones (femenino).
  - ≥1-2 por PDF (SEED-02 literal). El autor aprueba cada cruce — algunos pueden descartarse si pedagógicamente no aportan.

- **D-88:** **avere.json intacto + añadir 1-2 multi-categoría nuevos.** Los 17 ejercicios actuales han pasado UAT humano en Phase 1+3; no se refactorizan. Solo se añaden ejercicios nuevos (IDs `avere-300+` por ejemplo) que crucen Avere con las nuevas categorías. Cero riesgo de regresión sobre los tests existentes.

### Claude's Discretion

- **Estilos visuales concretos de la pantalla Backup:** layout exacto, tamaño de los botones, color del banner (ámbar `warning` Pico class), tipografía del área de mensajes. Coherente con la sobriedad de Phase 2 (sin emojis decorativos salvo el `⚠` del banner).
- **Texto exacto** del banner cuando `lastBackupAt === null` vs `lastBackupAt > 7d`. Coherencia: prefijo `⚠`, una sola frase, link/botón "Ir a Backup".
- **Mecanismo del `<input type="file">`**: estándar HTML `<input type="file" accept=".json" @change="...">` con `accept` para sugerir filtro al usuario. Si el usuario cancela el file picker, no pasa nada (no se ofrecen alternativas exóticas tipo drag&drop).
- **Forma exacta del JSON parsing/validation helper**: archivo nuevo `src/data/backup.js` o función dentro de `storage.js`. Layer purity D-02 invariante (sin DOM ni storage — recibe string, devuelve `{ ok: true, state } | { ok: false, reason }`). Planner decide la ubicación.
- **Helper `daysSinceISO(iso, todayStr)`**: ubicación natural `src/domain/dates.js`. Pura, testable, sin dependencias.
- **Orden de transcripción de los 6 PDFs**: Claude propone el orden más eficiente (e.g., empezar por las categorías más simples) o el autor pide uno específico al planificar.
- **IDs de ejercicios entre categorías**: convención sugerida `{slug}-{NNN}` (`profesiones-001`, `verbos-mov-001`, etc.). Multi-categoría: ID lleva el slug de la categoría "principal" + range alto (e.g., `avere-300+` para los cruces). Planner ajusta.
- **Tests del nuevo content**: actualizar el smoke test integrado de 30 días para cubrir cascada multi-categoría real (ya cubierto en Phase 2 conceptualmente, ahora con contenido real). Schema validator probablemente no necesita cambios (los 3 tipos ya cubiertos en Phase 3).
- **Forced last pair / animaciones del banner**: ninguna animación nueva. El banner aparece/desaparece sin transición.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning o implementing.**

### Project-level
- `.planning/PROJECT.md` — Core Value, Out of Scope, Key Decisions Phase 1+2+3 (especialmente "Datos en localStorage con export/import a JSON" como Active)
- `.planning/REQUIREMENTS.md` — BACK-04, BACK-05, BACK-06, SEED-01, SEED-02 (los 5 requisitos de Phase 4); también BACK-01..03 ya cumplidos (storage shape)
- `.planning/ROADMAP.md` §"Phase 4" — Goal, 5 success criteria
- `.planning/STATE.md` — Decisiones acumuladas (schemaVersion: 2, lastBackupAt no existe aún, contenidos: solo Avere)

### Phase 1 (mantienen vigencia)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-CONTEXT.md` — D-01..D-23 (registry pattern, schema validator, NFC, layer purity, schemaVersion, CDN SRI)
- `.planning/phases/01-loop-m-nimo-end-to-end-avere-multiple-choice/01-VERIFICATION.md` — patrón Alpine boot

### Phase 2 (mantienen vigencia)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-CONTEXT.md` — D-24..D-55 (appShell plano, D-27/D-43/D-44 confirmaciones inline, D-46 migración 1→2, D-54 cascada inmediata, schemaVersion=2)
- `.planning/phases/02-mec-nica-completa-de-re-verificaci-n-cascada-estados-dashboa/02-04-SUMMARY.md` — patrones confirmación inline + button-row + banner reanudar

### Phase 3 (mantienen vigencia)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-CONTEXT.md` — D-56..D-72 (3 tipos de ejercicio operativos, grading case-insensitive D-67, schema validator dispatch table)
- `.planning/phases/03-variedad-de-ejercicios-ergonom-a-de-teclado/03-03-SUMMARY.md` — UAT 4/4 ROADMAP + 8 pitfalls validados

### Code references (leer antes de planificar)
- `src/data/storage.js` — KEY = `'italianCourse.v1'`, `CURRENT_SCHEMA_VERSION = 2` (subir a 3), `migrate1to2`, `hydrateV2`, `blankState`. EXTENDER con `migrate2to3` que añade `lastBackupAt:null` + `firstUsedAt:null`.
- `src/screens/app.js` — `appShell` factory plano. EXTENDER con `currentScreen='backup'` + sub-estados (`backupLastMessage`, `backupPendingImport`, `backupFileInputRef`). Helper `requestConfirm()` existente reusable para D-76.
- `src/screens/app.js` `requestConfirm()` (línea ~289) — patrón a reusar para la confirmación del import D-76.
- `src/domain/dates.js` — `todayLocal()` existente. AÑADIR helper `daysSinceISO(iso, todayStr)` puro.
- `src/data/schema-validator.js` — sin cambios estructurales (los 3 tipos ya validados desde Phase 3).
- `src/data/content-loader.js` — sin cambios estructurales; carga los 6 archivos dinámicamente vía `categories.json`.
- `content/categories.json` — actualizar de 1 categoría a 6 (Avere + 5 nuevas con id slug ASCII).
- `content/exercises/avere.json` — añadir 1-2 ejercicios multi-cat (NO modificar los 17 existentes).
- `content/exercises/{genero-numero,verbos-movimiento,profesiones,sustantivos-irregulares,preposiciones}.json` — NUEVOS, ≥10 ejercicios cada uno con tipo natural + 1-2 multi-cat.
- `index.html` — añadir `<template x-if="currentScreen === 'backup'">` con la pantalla nueva. Banner condicional `<template x-if="currentScreen === 'home' && shouldShowBackupBanner">` arriba de la tabla.
- `tests/domain.test.js` / `tests/exercise-types.test.js` — añadir tests para `migrate2to3`, `daysSinceISO`, parser de backup JSON (kind check, schemaVersion validation), banner logic (`shouldShowBackupBanner`).

### Source PDFs (Claude lee con Read tool para transcribir)
- `material-profesora/Clase_Italiano_Auxiliar_Avere.pdf` — referencia para los multi-cat nuevos en avere.json
- `material-profesora/Clase_Italiano_Genero_y_Numero.pdf` — categoría `genero-numero`
- `material-profesora/Clase_Italiano_Verbos_Movimiento.pdf` — categoría `verbos-movimiento`
- `material-profesora/Professioni_Italiano_Facile.pdf` — categoría `profesiones`
- `material-profesora/Sustantivos Irregulares.pdf` — categoría `sustantivos-irregulares`
- `material-profesora/preposizioni_italiano.pdf` — categoría `preposiciones`

### External docs (read once when implementing)
- MDN `<input type="file">` accept attribute: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
- MDN Blob + URL.createObjectURL (para descargar JSON): https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
- MDN FileReader API (para leer el archivo importado): https://developer.mozilla.org/en-US/docs/Web/API/FileReader
- Pico CSS Buttons (variants primary/secondary, color contextual): https://picocss.com/docs/buttons

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`src/data/storage.js`** — `saveState(state)` y `loadState()` ya manejan la persistencia. `migrate1to2` y `hydrateV2` ya implementan el patrón de migración en cadena. Phase 4 añade `migrate2to3` siguiendo el patrón existente: idempotente, sin pérdida de datos previos, retorna el state actualizado.
- **`requestConfirm(opts)` en `src/screens/app.js`** (~línea 289) — patrón inline para confirmaciones (no `window.confirm`). Reusable para D-76 (confirmación del import). Las 3 call-sites existentes son: abandono de Repaso (D-27), descarte de inFlightTest (D-43), conflict de Repaso vs inFlightTest (D-44). Este será el 4º.
- **`todayLocal()` en `src/domain/dates.js`** — devuelve `YYYY-MM-DD` local. Reusable para el nombre del archivo descargado D-75 y para la comparación de días en `daysSinceISO`.
- **`appShell` factory plano** — pattern D-25 establecido. Añadir un 5º valor de `currentScreen` y sus sub-estados es trivial siguiendo lo de Phase 2.
- **Schema validator `PAYLOAD_VALIDATORS` dispatch table** (Phase 3 plan 01) — sin cambios necesarios; los 3 tipos están cerrados. Solo se ejercita más al cargar los 6 archivos en boot.
- **Sampler `buildSession` GUARANTEE + FILL phase** — agnóstico al nº de categorías. Va a recibir 6 categorías en vez de 1. Smoke test integrado de 30 días de Phase 2 sigue siendo válido conceptualmente; actualizar con contenido real es Claude's discretion del planner.
- **NFC normalize on load** (CONT-06) — invariante para los nuevos JSONs. No requiere cambios.

### Established Patterns

- **Layer purity D-02** — `src/data/backup.js` (si se crea) NO importa DOM ni storage. Recibe string, devuelve objeto. `storage.js` sigue siendo la única puerta de localStorage.
- **Spanish UI (FOUND-04)** — "Backup", "Exportar progreso", "Importar progreso", "Han pasado N días desde tu último backup", "Aún no has exportado tu progreso", "Continuar"/"Cancelar". IDs/slugs en ASCII.
- **Banner pattern** (D-43/D-44 establecido en Phase 2) — `inFlightTest` ya genera un banner condicional en home. El banner de backup sigue el mismo patrón visual (Pico `[role=alert]` o equivalente classless).
- **schemaVersion migration chain** (D-46 establecido) — `loadState` aplica migraciones en cadena: `migrate1to2(s) → migrate2to3(s)`. Idempotente: si el state ya está en v3, no se toca.
- **`<template x-if="...">` con getter null-safe** (double-defense Alpine) — aplicar a la pantalla `backup` y al banner condicional.
- **Tests con `node --test`** — `tests/exercise-types.test.js` o nuevo `tests/backup.test.js`. Cobertura mínima: migrate2to3 + daysSinceISO + parser kind-validation + banner logic.

### Integration Points

- **`loadState()` boot path** — añadir `migrate2to3` al pipeline después de `migrate1to2`. Sin esto, usuarios con estado v2 (= cualquiera que ya ha completado Phase 2) no se migran al actualizar.
- **`saveState(state)` primera escritura** — necesita setear `state.firstUsedAt = new Date().toISOString()` si es `null` al momento de guardar. Plumbing: `saveState` recibe un objeto opcional `{ updatedAt }` o se hace en el caller (`applySessionResult`). Planner decide la mejor ubicación; preferencia "en el caller" para mantener storage.js puro de lógica de dominio.
- **`exportBackup()` handler en `appShell`** — construye el wrapper `{kind, exportedAt, schemaVersion, state}`, hace `JSON.stringify` con indent, crea Blob, dispara `<a download>`. Después actualiza `state.lastBackupAt = new Date().toISOString()` y `saveState(state)`. UI actualiza al instante (Alpine reactivity).
- **`importBackup(file)` handler en `appShell`** — `FileReader` lee, `JSON.parse`, validación D-74, si OK setea `backupPendingImport` y dispara `requestConfirm()`. Tras confirmación, `saveState(parsed.state migrado)` y reload del state in-memory (reuse del Promise-handoff sin recargar la página — la app refleja el nuevo state inmediatamente).
- **`shouldShowBackupBanner` getter computado en `appShell`** — lee `state.lastBackupAt`, `state.firstUsedAt`, llama `daysSinceISO`, retorna boolean. Reactivo: cuando `state.lastBackupAt` cambia tras export, el banner desaparece automáticamente.
- **`categories.json`** — pasa de 1 entrada a 6. `content-loader.js` ya itera el array; cero cambio estructural. Asegurar que el orden refleja una progresión sensata (Avere primero como categoría más madura).
- **Nuevos JSONs `content/exercises/*.json`** — el schema validator los rechaza si malformados con banner visible (CONT-05). La transcripción se valida fase a fase: cargar el JSON nuevo en local antes del commit es la verificación más rápida.

### Estructura final esperada (post-Phase 4)

```
src/
├── main.js                       # sin cambios estructurales
├── domain/
│   ├── dates.js                  # EXTENDIDO: daysSinceISO helper
│   ├── session.js                # sin cambios
│   └── progress.js               # sin cambios
├── data/
│   ├── content-loader.js         # sin cambios (carga 6 archivos vía iteración)
│   ├── schema-validator.js       # sin cambios (los 3 tipos cubiertos en Phase 3)
│   ├── storage.js                # EXTENDIDO: CURRENT_SCHEMA_VERSION=3, migrate2to3, blankState añade lastBackupAt+firstUsedAt
│   └── backup.js                 # NUEVO (opcional): parseBackupFile(rawStr) → {ok,state|reason} puro
├── exercise-types/               # sin cambios
└── screens/
    └── app.js                    # EXTENDIDO: currentScreen='backup' + sub-estados + exportBackup/importBackup + shouldShowBackupBanner
content/
├── categories.json               # EXTENDIDO: 6 entries (avere + 5 nuevas)
└── exercises/
    ├── avere.json                # EXTENDIDO: +1-2 ejercicios multi-cat (no tocar los 17 existentes)
    ├── genero-numero.json        # NUEVO: ≥10 ejercicios, mayoría match + algún multi-choice
    ├── verbos-movimiento.json    # NUEVO: ≥10 multi-choice + algún word-buttons
    ├── profesiones.json          # NUEVO: ≥10 mezcla multi-choice + word-buttons
    ├── sustantivos-irregulares.json  # NUEVO: ≥10 mayoría match
    └── preposiciones.json        # NUEVO: ≥10 multi-choice
index.html                        # EXTENDIDO: template backup + banner condicional en home
tests/
├── domain.test.js                # EXTENDIDO: tests daysSinceISO, banner logic
├── exercise-types.test.js        # sin cambios
└── backup.test.js                # NUEVO (opcional): migrate2to3, parser kind-validation, schemaVersion bounds
```

</code_context>

<specifics>
## Specific Ideas

- **El autor revisa cada categoría por separado** — la transcripción de los 6 PDFs es un commit-por-categoría. Tras el JSON de `genero-numero`, el autor lo prueba en local (carga la app, ve las nuevas categorías en home, lanza un Repaso) antes de pasar al siguiente. Esto distribuye el riesgo de Claude inventar italiano malo y permite parar/corregir antes de acumular.
- **`schemaVersion = 3` salto** — coherente con la convención D-46 (bump por shape cambiada). Los backups exportados pre-Phase 4 tendrán `schemaVersion: 2` y al re-importarlos en post-Phase 4 se les aplica `migrate2to3` automáticamente (D-74). Forward-compat preservado.
- **Banner "el sistema te obliga"** — sin snooze ni dismiss persistente. El autor pidió desde Phase 1 que la app le obligue. El recordatorio de backup encaja en esa filosofía: si no exportas, te recuerda todos los días.
- **`firstUsedAt` set una vez por instalación** — semánticamente representa "cuándo empecé a usar esta instalación". Si el autor limpia localStorage manualmente (DevTools) o cambia de máquina, se resetea naturalmente. Si importa un backup, viene el `firstUsedAt` del archivo (intencional — "el momento real en que empecé").
- **Multi-categoría real ejercita el core value** — Phase 2 validó cascada con un solo ejercicio multi-cat sintético. Phase 4 lo lleva a 6 categorías × 1-2 multi-cat = ≥6-12 ejercicios reales que dispararán la cascada en uso diario. UAT humano = fallar uno de esos y ver el resumen mostrando 2-3 categorías reseteadas simultáneamente.
- **`avere.json` intacto = patrón general**: cuando se actualice contenido en futuras fases (v2, A2 material), preferir AÑADIR ejercicios nuevos sobre modificar los existentes. Los IDs son persistentes y los contadores `exerciseStats` los referencian — cambiar un ID rompe la historia del usuario.
- **El planner debería decidir orden de transcripción** propuesta: empezar por el PDF más sencillo (e.g., Preposiciones cortas) para validar el flujo de transcripción + revisión antes de atacar los grandes (e.g., Profesiones que mezcla tipos).

</specifics>

<deferred>
## Deferred Ideas

(Surgidas durante la discusión, capturadas para no perderlas.)

- **Snooze del banner de backup** (botón "Más tarde" que lo oculta 1 día con `snoozedUntil` persistido): descartado en D-80 por coherencia con el tono "el sistema te obliga". Reconsiderar en v2 si en uso diario el banner resulta molesto durante exámenes intensivos.
- **Pre-export defensivo antes de importar** ("¿Quieres respaldar tu progreso actual antes?"): descartado en D-76 por añadir un paso extra. Reconsiderar si el autor se pierde un backup importante por importar uno viejo por error.
- **Log persistente de exports/imports** (últimos 5 con fecha): descartado en D-83 por no aportar valor v1 y por complicar la migración. v2 si emerge necesidad de auditoría.
- **Drag&drop para importar JSON**: descartado en Claude's Discretion (estándar `<input type="file">` es suficiente). Reconsiderar si UAT muestra fricción.
- **UI de edición de ejercicios dentro de la web** (FUTURE-01): out of scope v1, no reabrir aquí. Phase 4 mantiene "JSON a mano + Claude propone".
- **Sub-categorías más finas que '1 PDF = 1 categoría'** (FUTURE-03): out of scope v1.
- **Generación con IA a partir de los PDFs como pipeline runtime** (FUTURE-04): out of scope v1. En Phase 4 Claude propone JSON en este chat con el autor revisando — no es un runtime feature, es transcripción asistida.
- **Categoría "Avere" sobre-representada en multi-cat**: en D-87 se asume que cada PDF tendrá ≥1 cruce, varios con Avere (porque Avere combina con todo). Si en UAT el sampler resulta desbalanceado, ajustar pesos en v2.
- **Indicador visual de carga durante import** (spinner mientras `FileReader` lee): los archivos JSON pequeños (KB) leen instantáneamente. Si llega a notarse en archivos grandes futuros, añadir feedback.
- **Confirmación al exportar si lleva muchas horas/días sin guardar** (e.g., "Vas a exportar progreso de hace 5 días sin sesiones nuevas — ¿seguro?"): descartado por innecesario en v1. El export es siempre seguro (no destructivo).
- **Versionado del archivo backup con campo `appVersion`**: descartado por ahora — `schemaVersion` ya cubre la compat. Reconsiderar si se introduce un cambio que no es de shape (e.g., interpretación distinta de un campo) y necesita versioning aparte.

</deferred>

---

*Phase: 4-Backup robusto + contenido completo*
*Context gathered: 2026-05-24*
