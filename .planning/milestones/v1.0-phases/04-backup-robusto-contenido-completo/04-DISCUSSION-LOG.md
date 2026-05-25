# Phase 4: Backup robusto + contenido completo - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 4-Backup robusto + contenido completo
**Areas discussed:** Forma del JSON exportado + import, Recordatorio de backup (7 días), Entrada a pantalla Backup + navegación, Estrategia de transcripción de los 6 PDFs

---

## Forma del JSON exportado + import

### Estructura del JSON que se descarga al exportar

| Option | Description | Selected |
|--------|-------------|----------|
| Envoltura con metadata | `{ kind, exportedAt, schemaVersion, state }`. Permite identificar archivos del proyecto, mostrar fecha del export en confirmación al re-importar, separar metadata del estado. Coste: el import desenvuelve antes de validar. | ✓ |
| Raw blob idéntico a localStorage | Descarga EXACTAMENTE el contenido sin envoltura. Simple pero no distingue backups del proyecto de otros JSON, y no sabes cuándo se exportó. | |
| Raw blob + campo lastBackupAt dentro | El blob es raw pero contiene un campo extra. Más simple que la envoltura pero pierde el wrapper que valida 'esto es un backup'. | |

**User's choice:** Envoltura con metadata
**Notes:** Wrapper queda con `kind: 'italian-course-backup'` literal en D-73 — sirve también como guard al importar.

---

### Validación al importar JSON

| Option | Description | Selected |
|--------|-------------|----------|
| Validación estricta + migración automática | Rechaza si kind incorrecto, falta state, schemaVersion ausente. Acepta y migra si <= current. Rechaza visible si > current (backup del futuro). | ✓ |
| Solo schemaVersion exacto | Acepta SOLO si schemaVersion exacto. Más simple pero backups antiguos quedan inservibles desde la UI. | |
| Validación laxa (best-effort) | Acepta cualquier JSON con shape parecido. Útil para archivos dañados, arriesga corromper estado actual silenciosamente. | |

**User's choice:** Validación estricta + migración automática
**Notes:** Forward-compat con backups antiguos (importante porque BACK-03 ya estableció schemaVersion: 2 como contrato).

---

### Nombre del archivo descargado

| Option | Description | Selected |
|--------|-------------|----------|
| italian-course-backup-YYYY-MM-DD.json | Fecha local. Navegador deduplica con (1)(2) si exportas múltiples veces. | ✓ |
| italian-course-backup-YYYY-MM-DD-HHMM.json | Con hora-minuto. Más preciso si exportas varias veces al día. | |
| italianCourse-progreso-YYYY-MM-DD.json | Mezcla inglés/español. Menos estándar visualmente. | |

**User's choice:** italian-course-backup-YYYY-MM-DD.json
**Notes:** Usa `todayLocal()` para mantener coherencia con DOMAIN-01 (no UTC).

---

### Confirmación del import

| Option | Description | Selected |
|--------|-------------|----------|
| Resumen del archivo + warning | Fecha export, nº categorías con progreso, nº ejercicios con stats, warning irreversible. Usa requestConfirm() existente. | ✓ |
| Warning genérico simple | Solo "reemplazará tu progreso, ¿continuar?". Más simple, no distingues backups. | |
| Warning + offer pre-export defensivo | Ofrece pre-export antes de importar. Más seguro, añade un paso. | |

**User's choice:** Resumen del archivo + warning
**Notes:** Reusa el patrón `requestConfirm()` ya validado en Phase 2 (D-27/D-43/D-44). Este será su 4ª call-site.

---

## Recordatorio de backup (7 días)

### Ubicación del timestamp lastBackupAt

| Option | Description | Selected |
|--------|-------------|----------|
| Dentro del state (italianCourse.v1.lastBackupAt) | Campo nuevo en state raw, schemaVersion sube a 3 con migrate2to3. Importar trae el lastBackupAt del archivo. | ✓ |
| En localStorage aparte | Clave separada. Importar NO sobrescribe pero rompe atomicidad del blob. | |
| En el state pero NO migrado (lazy) | Campo opcional sin bump de schemaVersion. Rompe la regla 'shape change → migration'. | |

**User's choice:** Dentro del state (con migrate2to3)
**Notes:** Importar un backup viejo trae lastBackupAt del archivo intencionalmente — "restauré de hace 30d → banner debe volver a aparecer".

---

### Comportamiento si nunca exportaste (lastBackupAt === null)

| Option | Description | Selected |
|--------|-------------|----------|
| Banner aparece tras 7 días de USO real | Necesita segundo timestamp firstUsedAt. Banner si (lastBackupAt===null && firstUsedAt > 7d) OR (lastBackupAt > 7d). | ✓ |
| Banner aparece desde la primera carga | Si lastBackupAt es null → banner activo desde el día 1. Ruidoso al principio sin progreso. | |
| Banner nunca aparece si lastBackupAt es null | Solo tras primer export voluntario. Riesgo: pierdes localStorage sin warning previo. | |

**User's choice:** Tras 7 días de uso real (con firstUsedAt)
**Notes:** Balance entre no ser ruidoso en app fresca y avisar antes de pérdida real de progreso.

---

### Formato del timestamp y comparación 7d

| Option | Description | Selected |
|--------|-------------|----------|
| ISO timestamp UTC, compare por días locales | Date.toISOString() almacenado. Comparación por días locales completos con todayLocal(). | ✓ |
| YYYY-MM-DD local (coherente con todayLocal) | Solo fecha local. Pierdes hora exacta. | |
| epoch ms (Date.now()) | Número. Rompe convención YYYY-MM-DD usada en dailyLog. | |

**User's choice:** ISO timestamp UTC + compare por días locales
**Notes:** Preserva hora exacta para mostrar en UI (ej: "exportado el 2026-05-24 14:32"); comparación coherente con DOMAIN-07.

---

### Diseño del banner de recordatorio

| Option | Description | Selected |
|--------|-------------|----------|
| Banner persistente + link a Backup | Sin snooze. Desaparece al exportar. Coherente con 'el sistema te obliga'. | ✓ |
| Banner con snooze de 1 día | Botón 'Más tarde' que lo oculta hasta mañana. Menos ruidoso, añade campo y procrastinación. | |
| Banner solo al cargar + cerrar (sesión) | Dismiss in-memory, vuelve al recargar. | |

**User's choice:** Persistente sin snooze
**Notes:** El tono "el sistema te obliga" es central al Core Value; el banner refuerza esa filosofía.

---

## Entrada a pantalla Backup + navegación

### Punto de entrada desde home

| Option | Description | Selected |
|--------|-------------|----------|
| Botón secundario en la home | Tercer botón junto a Repaso 20 / Test completo, clase Pico 'secondary'. Visible siempre. | ✓ |
| Link discreto en footer/header | Texto-link. Coherente con "backup es ocasional". | |
| Botón + link en banner cuando >7d | Solo banner. Si estás al día no ves entrada visible. Demasiado oculto. | |

**User's choice:** Botón secundario en la home
**Notes:** Visible siempre, no depende del banner — coherente con D-32 (dos botones grandes principales) + un secundario para Backup.

---

### Vuelta de Backup a home

| Option | Description | Selected |
|--------|-------------|----------|
| Botón secundario "← Volver al home" | Reusa requestReturnToHome() existente del summary. Cero ambigüedad. | ✓ |
| Botón primario 'Hecho' tras exportar | Dos comportamientos según estado, más código UI. | |
| Breadcrumb 'Home / Backup' | Patrón web clásico. No encaja con appShell plano. | |

**User's choice:** Botón secundario "← Volver al home"
**Notes:** Reusa wording exacto del summary screen — consistencia visual con Phase 2.

---

### Contenido de la pantalla Backup

| Option | Description | Selected |
|--------|-------------|----------|
| Estado actual + dos botones + área de mensajes | "Último backup: {fecha} (hace N días)" + Exportar/Importar + feedback. | ✓ |
| Solo los dos botones (minimal) | Sin info contextual en la pantalla. | |
| Botones + lista de imports/exports anteriores | Log persistente. Complica migración, sin valor v1. | |

**User's choice:** Estado actual + dos botones + área de mensajes
**Notes:** Info contextual sin saturar; coherente con el dashboard denso de Phase 2.

---

### Implementación en appShell

| Option | Description | Selected |
|--------|-------------|----------|
| 5º valor 'backup' en currentScreen + sub-estados | Patrón idéntico a D-25 (factory plano). | ✓ |
| Modal overlay sobre home | <dialog> Pico nativo. Rompe convención 'una pantalla = un currentScreen'. | |
| Sub-vista dentro de home (acordeón) | El backup colapsa/expande dentro de home. Banner + mensajes mezclados con dashboard. | |

**User's choice:** 5º valor 'backup' + sub-estados (D-25)
**Notes:** Sub-estados nuevos: backupFileInputRef, backupLastMessage, backupPendingImport.

---

## Estrategia de transcripción de los 6 PDFs

### Quién transcribe y cómo se reparte

| Option | Description | Selected |
|--------|-------------|----------|
| Claude lee PDF → propone JSON → autor revisa | Claude hace el grueso mecánico, autor revisa pedagógicamente categoría por categoría. | ✓ |
| Autor transcribe a mano + Claude solo plantillas | Maximiza fidelidad, bulk manual. | |
| Autor elige ejercicios + Claude solo formato | Reparto intermedio. | |

**User's choice:** Claude lee PDF → propone JSON → autor revisa
**Notes:** Cada categoría termina en un commit propio para distribuir riesgo y permitir corrección antes de acumular errores.

---

### Tipos de ejercicio por PDF

| Option | Description | Selected |
|--------|-------------|----------|
| Tipo natural por PDF + variedad | Avere/Verbos/Preposiciones → multi-choice; Género/Sustantivos → match; Profesiones → mezcla. | ✓ |
| Tres tipos en cada PDF (~4 cada uno) | Garantiza variedad uniforme pero fuerza tipos poco naturales. | |
| Solo multiple-choice salvo imposible | Poca práctica de los nuevos tipos. Contradice Phase 3. | |

**User's choice:** Tipo natural por PDF
**Notes:** Cada tipo de ejercicio se aplica donde realmente aporta valor pedagógico. Apunta a ~12-15 por categoría (margen sobre los 10 mínimos).

---

### Cruces multi-categoría

| Option | Description | Selected |
|--------|-------------|----------|
| Cruces naturales semánticos | Claude propone donde la frase ejercita dos temas reales. Autor aprueba cada cruce. | ✓ |
| Solo obvios + uno fijo Avere+X | Garantiza cobertura. Avere queda sobre-representado. | |
| Mínimo absoluto: 1 por PDF | Cumple SEED-02 literal. Menos garantías sobre cruces que emergen. | |

**User's choice:** Cruces naturales semánticos
**Notes:** Ejemplos: "Lui ha un fratello medico" (Avere + Profesiones), "Vado a Roma" (Verbos Mov + Preposiciones).

---

### Qué hacer con avere.json actual

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener tal cual + añadir 1-2 multi-cat | Los 17 validados en UAT no se tocan. Solo se añaden cruces. | ✓ |
| Refactorizar avere.json + añadir multi-cat | Aprovechar para limpiar redundancias. Riesgo regresión. | |
| Dejar totalmente intacto, multi-cat solo en otros PDFs | Interpretación laxa de SEED-02. Avere sin multi-cat es raro semánticamente. | |

**User's choice:** Mantener intacto + añadir 1-2 multi-cat
**Notes:** Patrón "AÑADIR sobre MODIFICAR" generalizable a futuras fases — los IDs son persistentes y los contadores los referencian.

---

## Claude's Discretion

Áreas dejadas al planner/executor para resolver:

- Estilos visuales concretos de la pantalla Backup (layout, tamaño botones, color del banner)
- Texto exacto del banner cuando lastBackupAt === null vs > 7d
- Mecanismo del `<input type="file">` (estándar HTML; sin drag&drop en v1)
- Ubicación del helper `parseBackupFile()` (módulo nuevo `src/data/backup.js` o función en `storage.js`)
- Ubicación del helper `daysSinceISO()` (natural en `src/domain/dates.js`)
- Orden de transcripción de los 6 PDFs (Claude propone empezar por los más sencillos)
- Convención de IDs de ejercicios entre categorías (`{slug}-{NNN}`, multi-cat con rango alto)
- Tests del nuevo content (actualizar smoke test de 30 días con contenido real)

## Deferred Ideas

Surgidas durante la discusión, NO se implementan en Phase 4 — capturadas para no perderlas:

- Snooze del banner (botón "Más tarde" con `snoozedUntil`) — v2 si es molesto
- Pre-export defensivo antes de importar (paso extra) — si emerge fricción
- Log persistente de exports/imports — v2 si se necesita auditoría
- Drag&drop para importar JSON — si UAT muestra fricción con `<input type="file">`
- Indicador visual de carga durante import — solo si llega a notarse
- Confirmación al exportar si lleva días sin guardar — innecesario v1
- Campo `appVersion` en el wrapper backup (versionado semántico además de schemaVersion) — reconsiderar si cambia interpretación de campos sin cambiar shape
- UI de edición de ejercicios (FUTURE-01) — out of scope v1
- Sub-categorías más finas que '1 PDF = 1 categoría' (FUTURE-03) — out of scope v1
- Generación con IA como pipeline runtime (FUTURE-04) — out of scope v1
