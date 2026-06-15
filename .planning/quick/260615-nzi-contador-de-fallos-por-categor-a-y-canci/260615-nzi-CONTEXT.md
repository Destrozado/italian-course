# Quick Task 260615-nzi: Contador de fallos por categoría y canción - Context

**Gathered:** 2026-06-15
**Status:** Ready for planning

<domain>
## Task Boundary

Añadir un contador persistente de "veces fallada" por categoría y por canción, que se incrementa cuando un fallo resetea la racha/progreso. Sirve para ver qué categorías/canciones cuestan más. Toca ESTADO PERSISTIDO (localStorage) → requiere bump de `schemaVersion` (actualmente 9) + migración.

Sugerencia de nombre de campo: `vecesFallada` (entero), en `categoryProgress[catId]` y en `songProgress[songId]`. Leer SIEMPRE defensivamente con `?? 0` (lazy init, patrón D-47).
</domain>

<decisions>
## Implementation Decisions

### 1. Categorías: +1 "al perder progreso real"
- Incrementar `vecesFallada` SOLO cuando un fallo resetea progreso real: la categoría tenía progreso y cae a cero.
- Definición precisa de "tenía progreso" (hadProgress) ANTES del reset:
  `status === 'hecha' || status === 'dominada' || (streakDays ?? 0) > 0 || (Array.isArray(clearedExerciseIds) && clearedExerciseIds.length > 0)`
- Si `hadProgress` → `vecesFallada = (vecesFallada ?? 0) + 1`, y LUEGO se aplica el reset existente.
- Si la categoría ya estaba a cero (no-hecha, sin progreso) → NO incrementa. Un 2º fallo seguido en la misma categoría tampoco recuenta (ya está reseteada → hadProgress false).
- **Punto de incremento:** dentro de `applyImmediateFailure` (cascada inmediata del click — el call-site canónico de TODO fallo, D-54), con el guard hadProgress. Esto preserva la idempotencia ya documentada de `applyImmediateFailure` (el guard hace que re-invocar sea no-op también para el contador) y evita el DOBLE CONTEO con `applySessionResult`: al final de sesión la categoría ya está reseteada → hadProgress false → no incrementa.
- El executor DEBE verificar contra el código real que `applyImmediateFailure` es el único call-site por fallo, y que `applySessionResult` (cascada de fin de sesión) NO recuente (su rama FAIL-WINS corre sobre estado ya reseteado). Si encuentra un camino de fallo que NO pasa por `applyImmediateFailure`, replicar el guard ahí — nunca contar dos veces el mismo reset.

### 2. Canciones: +1 por playthrough con ≥1 frase fallada
- Al terminar (o salir de) un playthrough de canción en el que se falló AL MENOS una frase: `songProgress[songId].vecesFallada = (… ?? 0) + 1`. Una sola vez por playthrough (no por frase).
- 0 frases falladas → +0.
- El executor DEBE verificar cómo se cuentan las frases falladas del playthrough (p.ej. `songSummaryDelta`, un tally de la sesión, o `sessionResults`) y en qué punto cerrar el playthrough (`completeSong` / `cancion-summary` / `returnToSongList`), incrementando UNA sola vez y sin recuento si se reentra al resumen.

### 3. Dónde mostrar
- Tabla de categorías de home Y lista de canciones: junto a cada ítem, un indicador discreto (p.ej. "fallada ×N" o badge), SOLO si N>0.

### Migración (schemaVersion)
- Bump `CURRENT_SCHEMA_VERSION` 9 → 10.
- `migrate9to10` NOMINAL: preserva TODO el estado tal cual (no se puede reconstruir el histórico de fallos), solo cambia `schemaVersion: 10`. Patrón de bump nominal (como el 6→7 nominal). Los campos `vecesFallada` se lazy-init a 0 al leer/incrementar (no hace falta hidratarlos retroactivamente).
- Añadir `hydrateV10` (espejo de `hydrateV9`), y actualizar la cadena `migrate()` (`if (s.schemaVersion === 9) s = migrate9to10(s)` + cambiar el retorno a `=== 10 → hydrateV10`). `newState`/`blankState` → `schemaVersion: 10`.
- Verificar que el deep-clone de hydrate preserva los sub-campos nuevos (`vecesFallada`) — `JSON.parse(JSON.stringify(...))` ya lo hace.

### Claude's Discretion
- Nombre exacto del campo (`vecesFallada` sugerido) y del helper si hace falta.
- Markup/estilo del indicador (Pico CSS, discreto), reutilizando el getter de filas existente (`categoryRows` ~L2602 en app.js) y el de canciones.
- Si el incremento de categoría se implementa como helper compartido para mantener una sola definición de hadProgress.
</decisions>

<specifics>
## Specific Ideas

- `src/data/storage.js`: `CURRENT_SCHEMA_VERSION` (L35), cadena `migrate()` (L149-160), patrón `migrate8to9` + `hydrateV9` como plantilla; `newState`/blank (L70).
- `src/domain/progress.js`: `applyImmediateFailure` (L296) — aquí va el incremento guardado de categoría; `applySessionResult` (L69, rama FAIL-WINS L114-117) — verificar que NO recuente. Idempotencia documentada en L280-283 (preservarla).
- `src/screens/app.js`: cierre del playthrough de canción (busca `completeSong`, `songSummaryDelta`, `returnToSongList`, `cancion-summary`); getter `categoryRows` (~L2602) para añadir `vecesFallada` a cada fila; getter de la lista de canciones.
- `index.html`: tabla de categorías home (~L65-210) y lista de canciones (~L212+).
- Backup/import: el campo viaja solito en el JSON de export/import (serializa el estado completo) — verificar que el roundtrip lo preserva; si hay validación de shape de backup, contemplarlo.
- Tests: hay tests de migración (busca los de `migrate8to9`/`hydrateV9`) y de `progress.js` (cascada). Añadir: migrate9to10 preserva estado + bump; incremento de categoría solo con hadProgress (y no doble conteo immediate+session); incremento de canción una vez por playthrough con ≥1 fallo. Correr con `node --test tests/*.test.js` (glob obligatorio en Node 22.20). Hay 1 fallo PREEXISTENTE ajeno (genero-numero 12→13) — NO tocar; no introducir fallos nuevos.
</specifics>

<canonical_refs>
## Canonical References

Todo `.planning/todos/pending/2026-06-15-contador-de-fallos-por-categoria-o-cancion.md`. Constraint del proyecto (CLAUDE.md): bump `schemaVersion` + migración al añadir campos al estado.
</canonical_refs>
