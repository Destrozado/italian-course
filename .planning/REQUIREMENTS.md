# Requirements: Italian Course — Ejercicios A1/A2

**Defined:** 2026-06-02
**Milestone:** v1.3 — Canciones (bloque de traducción)
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría; fallar un ejercicio desmarca todas las categorías que toca.

## v1.3 Requirements

Requisitos del milestone v1.3. Cada uno mapea a una fase del roadmap.

### Bloque Canciones (SONG)

- [ ] **SONG-01**: El usuario puede abrir un bloque "Canciones" desde el home con un listado de las canciones disponibles
- [ ] **SONG-02**: Cada canción del listado muestra su estado (no hecha / pasada / fallada) y el número de frases
- [ ] **SONG-03**: El usuario puede iniciar una canción con 1 clic desde el listado
- [ ] **SONG-04**: El estado pasada/fallada de cada canción persiste en localStorage entre sesiones

### Reproducción y traducción (PLAY)

- [ ] **PLAY-01**: Al reproducir una canción, el usuario recorre sus N frases en orden secuencial hasta el final (patrón Test completo, sin reinicio a mitad)
- [ ] **PLAY-02**: Cada frase muestra la línea en italiano y el usuario construye la traducción al español eligiendo palabras (mecánica word-buttons en dirección italiano→español)
- [ ] **PLAY-03**: Cada frase da feedback inmediato verde/rojo; al fallar muestra la traducción correcta
- [ ] **PLAY-04**: Al terminar la canción, el usuario ve un resumen con las frases falladas (su respuesta vs la correcta)
- [ ] **PLAY-05**: Abandonar una canción a mitad descarta el progreso no comprometido (los fallos ya persistidos por cascada D-54 quedan); al re-entrar la canción empieza de cero

### Enganche con categorías (LINK)

- [ ] **LINK-01**: Cada frase de una canción puede declarar las categorías gramaticales que toca (`categoryIds[]`)
- [ ] **LINK-02**: Fallar una frase enganchada dispara la cascada D-54 inmediata sobre sus categorías gramaticales (reset de estado + racha)
- [ ] **LINK-03**: El modelo de datos soporta frases sin categoría (etiquetadas y guardadas, sin cascada) — preparado para el proceso de propuesta futuro
- [ ] **LINK-04**: Las frases de canciones NO entran en el sampler de Repaso 20 / Test completo ni en la tabla de categorías del home (canciones standalone)

### Datos y persistencia (DATA)

- [ ] **DATA-01**: El contenido de canciones vive en JSON editado a mano con un schema definido (canción → frases ordenadas con metadatos)
- [ ] **DATA-02**: El schema-validator rechaza JSON de canción malformado con banner visible (coherente con el validator existente)
- [ ] **DATA-03**: Migración de `schemaVersion` si el state de canciones requiere campos nuevos (coherente con el patrón `migrateNtoM` existente)

### Contenido inicial (CONT)

- [ ] **CONT-01**: "Equilibrio mentale — Ultimo" dividida en frases con sentido completo y catalogables (limpiando ruido no-lírico: créditos de directo, "You might also like", etc.)
- [ ] **CONT-02**: Cada frase con su traducción española curada (answer tokens) + distractoras opcionales + enganche de categorías (o marcada explícitamente sin categoría)
- [ ] **CONT-03**: El contenido de la canción se valida en modo ligero autor-oráculo (IA verifica que la traducción española sea defendible y que el enganche de categorías por frase sea correcto; el autor es oráculo final sobre el fraseo artístico) — NO se exige el quórum gramatical estricto R1-R7

## Future Requirements

Reconocidos pero diferidos a milestones posteriores.

### Categorización asistida (CATPROC)

- **CATPROC-01**: Un proceso recorre las frases sin categoría de las canciones y propone categorías candidatas que podrían encajar
- **CATPROC-02**: El autor puede crear una categoría nueva a partir de una propuesta y re-enganchar las frases huérfanas, completando el material de estudio

### Contenido (más canciones)

- **MUSIC-X1**: Añadir más canciones al bloque conforme el autor las quiera trabajar (el patrón de alta queda consolidado en v1.3)

## Out of Scope

Excluido explícitamente de v1.3, con razón para evitar scope creep.

| Feature | Reason |
|---------|--------|
| Proceso que propone categorías nuevas para frases sin categoría | Diferido a milestone futuro (CATPROC); el modelo de datos v1.3 ya soporta frases sin categoría para no bloquearlo |
| Audio / reproducción musical / sincronización con la música (karaoke) | Es un ejercicio de traducción textual, no un reproductor; añade complejidad sin valor para el core value |
| Mezclar frases de canciones en Repaso 20 / Test completo | Canciones standalone por decisión (LINK-04); el sampler ponderado es para categorías gramaticales |
| Canción como categoría del home con estado dominada / racha 21 días | Bloque aparte con estado simple pasada/fallada; el espíritu de re-verificación llega vía cascada a categorías reales |
| Modo Examen de canciones | No aplica al bloque aparte; el Examen es atajo de validación de categorías gramaticales |
| Reanudar una canción a mitad (slot `inFlightTest` para canciones) | Descartado por simplicidad (PLAY-05); abandonar descarta y se reempieza de cero |
| Quórum gramatical estricto R1-R7 sobre traducciones de canciones | Las traducciones de canciones son "particulares" por diseño; validación ligera autor-oráculo (CONT-03) evita falsos positivos sobre decisiones artísticas |

## Traceability

Mapeo requisito → fase. Phase 13 = Bloque Canciones + modelo de datos + playthrough end-to-end. Phase 14 = Contenido "Equilibrio mentale — Ultimo" autorado + validación ligera.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SONG-01 | Phase 13 | Pending |
| SONG-02 | Phase 13 | Pending |
| SONG-03 | Phase 13 | Pending |
| SONG-04 | Phase 13 | Pending |
| PLAY-01 | Phase 13 | Pending |
| PLAY-02 | Phase 13 | Pending |
| PLAY-03 | Phase 13 | Pending |
| PLAY-04 | Phase 13 | Pending |
| PLAY-05 | Phase 13 | Pending |
| LINK-01 | Phase 13 | Pending |
| LINK-02 | Phase 13 | Pending |
| LINK-03 | Phase 13 | Pending |
| LINK-04 | Phase 13 | Pending |
| DATA-01 | Phase 13 | Pending |
| DATA-02 | Phase 13 | Pending |
| DATA-03 | Phase 13 | Pending |
| CONT-01 | Phase 14 | Pending |
| CONT-02 | Phase 14 | Pending |
| CONT-03 | Phase 14 | Pending |

**Coverage:**
- v1.3 requirements: 19 total
- Mapped to phases: 19/19 (100%) — Phase 13: 16 (SONG-01..04 + PLAY-01..05 + LINK-01..04 + DATA-01..03); Phase 14: 3 (CONT-01..03)
- Unmapped (orphans): 0
- Duplicados (un requisito en >1 fase): 0
- Gaps (success criterion sin requisito que lo soporte): 0

---
*Requirements defined: 2026-06-02*
*Last updated: 2026-06-02 — Traceability completada por el roadmapper (19/19 mapped, 0 orphans, 0 duplicados, 0 gaps). Phases 13-14 (numeración CONTINÚA desde Phase 12).*
