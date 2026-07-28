# Requirements: Italian Course — Milestone v2.0 (Paradigma completo de `fare`)

**Defined:** 2026-07-28
**Core Value:** Que el sistema te obligue a no olvidar — cada categoría se re-verifica constantemente; un solo fallo devuelve la categoría entera a repetir.

> **Naturaleza del milestone:** brownfield PURO DE CONTENIDO. El motor v1.4 (cascada D-54 con 2 call-sites, sampler, slot-engine, promociones/racha, localStorage) NO se toca. Las 4 categorías nuevas nacen en formato **slot+variantes**, autoradas desde cero y validadas 1-por-1 por **quórum cross-vendor R1-R7** (patrón D-85, v1.6/v1.7/v1.9). Integración lockstep: migración `12→13` + reset selectivo + sync de counts + smoke paramétrico. Numeración de fases CONTINÚA desde Phase 39.
>
> **Eje slot/variante (FARE-X1):** **slot** = una casilla del paradigma (p. ej. *congiuntivo imperfetto*); **variante** = la persona (io / tu / lui-lei / noi / voi / loro). `pickVariantIndex` (`src/domain/session.js:232`) elige una variante por slot y sesión, así que "una persona distinta cada pasada" sale gratis del primitivo existente. **Excepción:** en las formas indefinidas el eje de variante NO es la persona (son formas fijas) sino el **contexto** — frases distintas que exijan esa forma, ~3 por slot.
>
> **La categoría es la unidad de reset.** La agrupación en 4 (por modo) es decisión de diseño, no estética — precedente `260614-hxn`. Riesgo asumido y aceptado: `fare-indicativo` mete *presente* (diario) y *trapassato remoto* (extinto en el habla) en la misma unidad de reset; si la categoría se atasca y nunca se pone verde, **partirla en semplici/composti** (barato, con precedente).
>
> **DESIGN RULE (heredada):** `match` solo válido cuando el pareo exige una regla NO derivable por raíz compartida; si no, multiple-choice con distractoras plausibles.
> **Canon de explanations (heredado):** español acentuado (RAE), italianismos citados en ortografía italiana, gloss `(en español: …)` canónico (R7), plain text, apóstrofe ASCII.

## v2.0 Requirements

Requisitos comprometidos para este milestone. Cada uno mapea a una fase del roadmap.

### Fare — Indicativo (IND) · categoría `fare-indicativo`, 8 slots

- [ ] **IND-01**: El autor es examinado sobre el **presente** irregular de `fare` en todas las personas (`faccio / fai / fa / facciamo / fate / fanno`), incluida la trampa de la raíz doble `facc-` vs `fa-`.
- [ ] **IND-02**: El autor es examinado sobre el **imperfetto** (`facevo / facevi / faceva / facevamo / facevate / facevano`), donde reaparece la raíz latina `fac-` que el infinitivo esconde.
- [ ] **IND-03**: El autor es examinado sobre el **passato remoto** (`feci / facesti / fece / facemmo / faceste / fecero`), con su alternancia radical `fec-` / `fac-` en 1ª-3ª singular y 3ª plural frente al resto.
- [ ] **IND-04**: El autor es examinado sobre el **futuro semplice** (`farò / farai / farà / faremo / farete / faranno`), con raíz contracta `far-` (nunca `*facerò`).
- [ ] **IND-05**: El autor es examinado sobre los **tiempos compuestos con `avere` + `fatto`** — passato prossimo (`ho fatto`), trapassato prossimo (`avevo fatto`) y futuro anteriore (`avrò fatto`) — eligiendo el auxiliar y el tiempo del auxiliar según el marco temporal de la frase.
- [ ] **IND-06**: El autor es examinado sobre el **trapassato remoto** (`ebbi fatto`) DENTRO de su único marco vivo: subordinada temporal (`dopo che / quando / appena`) con la principal en passato remoto. El marco es parte del ejercicio — sin él la frase es artificial.

### Fare — Congiuntivo (CONG) · categoría `fare-congiuntivo`, 4 slots

- [ ] **CONG-01**: El autor es examinado sobre el **congiuntivo presente** (`faccia / faccia / faccia / facciamo / facciate / facciano`). Las tres primeras personas son homógrafas: el pronombre sujeto (o un sujeto explícito) DEBE estar en la frase o el ejercicio es irresoluble.
- [ ] **CONG-02**: El autor es examinado sobre el **congiuntivo imperfetto** (`facessi / facessi / facesse / facessimo / faceste / facessero`), con la misma exigencia de sujeto explícito en `io`/`tu` (`facessi` homógrafa).
- [ ] **CONG-03**: El autor es examinado sobre el **congiuntivo passato** (`abbia fatto`) y el **trapassato** (`avessi fatto`), incluida la elección del tiempo según la concordancia con la principal.
- [ ] **CONG-04**: El autor es examinado sobre el disparador del subjuntivo — qué verbos y conjunciones (`penso che`, `benché`, `prima che`, `se` hipotético) lo exigen — para que la casilla no se responda por reconocimiento de forma sin entender el contexto.

### Fare — Condizionale + Imperativo (CI) · categoría `fare-cond-imperativo`, 3 slots

- [ ] **CI-01**: El autor es examinado sobre el **condizionale presente** (`farei / faresti / farebbe / faremmo / fareste / farebbero`), con la misma raíz contracta `far-` del futuro.
- [ ] **CI-02**: El autor es examinado sobre el **condizionale passato** (`avrei fatto`), incluido su uso italiano para el futuro en el pasado (`ha detto che avrebbe fatto`), que el español resuelve distinto.
- [ ] **CI-03**: El autor es examinado sobre el **imperativo presente** (`fa' / faccia / facciamo / fate / facciano`) — **5 variantes, no 6: el imperativo no tiene `io`**. La 2ª singular es un MAGNET de doble validez (`fa'`, `fai` y `fa` están todas atestiguadas) y requiere rondas extra de quórum.

### Fare — Formas indefinidas (INDEF) · categoría `fare-indefiniti`, 6 slots

> En estos 6 slots las formas son fijas: el eje de variante es el **contexto** (~3 frases distintas por slot que exijan esa forma), no la persona.

- [ ] **INDEF-01**: El autor es examinado sobre el **infinito presente** (`fare`) y el **infinito passato** (`aver(e) fatto`), incluida la elección entre ambos según la anterioridad respecto a la principal.
- [ ] **INDEF-02**: El autor es examinado sobre el **participio passato** (`fatto`) como forma léxica y su comportamiento con `avere` (invariable) frente a la concordancia cuando la rige un pronombre objeto.
- [ ] **INDEF-03**: El autor es examinado sobre el **participio presente** (`facente`) **con nota de registro explícita**: la explanation avisa de que es burocrático/fosilizado y vive sobre todo en compuestos (`facente funzione`). Entra para que el paradigma esté completo, sin mentir sobre su uso real.
- [ ] **INDEF-04**: El autor es examinado sobre el **gerundio presente** (`facendo`) y el **gerundio passato** (`avendo fatto`), incluido `stare + gerundio` como progresivo.

### Migración (MIG)

- [ ] **MIG-01**: `migrate12to13` + `hydrateV13` idempotentes con deep-clone anti-prototype-pollution y `CURRENT_SCHEMA_VERSION=13`, con reset selectivo del progreso por prefijo SOLO de las 4 categorías nuevas (efectivamente no-op al nacer sin progreso; mirror del patrón `migrate11to12` de v1.9).
- [ ] **MIG-02**: `backup.js` hace round-trip v13 (export/import), migra import `v12→v13` y rechaza wrappers `> 13`.

### Integración lockstep (INT)

- [ ] **INT-01**: 4 entradas nuevas en `categories.json` (append, order 15–18) con `origen: "ia-quorum"` (PROV-01, v1.9), sin romper el display de la tabla del home.
- [ ] **INT-02**: Counts re-sincronizados — los 3 arrays hardcoded de count + `TOTAL_EXPECTED` + la fórmula del baseline-guard + 4 entradas nuevas en el smoke paramétrico; el dynamic-count mantiene la honestidad (nunca número mágico).
- [ ] **INT-03**: Cruces multi-categoría de `fare` (`↔ avere` en los compuestos, `↔ verbi-modali` en `devo/posso/voglio fare`, `↔ presente-regolare` como contraste irregular-vs-regular) reusando `applyResultToSession` — la cascada D-54 permanece en EXACTAMENTE 2 call-sites de `applyImmediateFailure` (verificable por grep).
- [ ] **INT-04**: Todas las variantes nuevas validadas 1-por-1 por quórum cross-vendor R1-R7, con **rondas EXTRA en los magnets de doble validez**: imperativo `tu` (`fa'`/`fai`/`fa`), las homógrafas de congiuntivo, y el par `fatto` invariable-vs-concordado.

## Future Requirements

<!-- Reconocidos como valiosos, fuera del alcance de v2.0. -->

- **Mismo patrón para los otros irregulares de alta frecuencia:** `andare`, `venire`, `dire` — el backlog de v1.7 ya los marcaba como categoría aparte. Candidatos directos a v2.1+ reutilizando todo lo aprendido aquí.
- **Partir `fare-indicativo` en semplici/composti** si la categoría se atasca en el uso real (riesgo asumido arriba; barato y con precedente `260614-hxn`).
- **Responsive móvil** — diferido desde v1.8, sigue pendiente.

## Out of Scope

<!-- Exclusiones explícitas con razón, para evitar re-añadirlas. -->

- **Tocar el motor v1.4** — este milestone es contenido + migración + counts. Si algo exige cambiar `session.js`, `applyResultToSession` o la cascada, es señal de que el diseño del contenido está mal, no el motor.
- **Un eje de variante nuevo (p. ej. variar por tiempo dentro de un slot)** — el primitivo slot+variantes ya cubre lo pedido; añadir ejes sería rework de motor disfrazado de contenido.
- **`fare` en perífrasis y modismos** (`fare la spesa`, `fa freddo`, `farcela`, causativo `fare + infinito`) — es vocabulario/sintaxis, no paradigma. Categoría propia si el autor lo echa en falta.
- **Passato remoto de otros verbos** — aquí entra solo como casilla del paradigma de `fare`.

## Traceability

<!-- Rellenado por el roadmapper 2026-07-28: REQ-ID → fase. Numeración CONTINÚA desde Phase 39 (v1.9). -->

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIG-01 | Phase 40 — Migración `12→13` | Pending |
| MIG-02 | Phase 40 — Migración `12→13` | Pending |
| IND-01 | Phase 41 — `fare-indicativo` | Pending |
| IND-02 | Phase 41 — `fare-indicativo` | Pending |
| IND-03 | Phase 41 — `fare-indicativo` | Pending |
| IND-04 | Phase 41 — `fare-indicativo` | Pending |
| IND-05 | Phase 41 — `fare-indicativo` | Pending |
| IND-06 | Phase 41 — `fare-indicativo` | Pending |
| CONG-01 | Phase 42 — `fare-congiuntivo` | Pending |
| CONG-02 | Phase 42 — `fare-congiuntivo` | Pending |
| CONG-03 | Phase 42 — `fare-congiuntivo` | Pending |
| CONG-04 | Phase 42 — `fare-congiuntivo` | Pending |
| CI-01 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| CI-02 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| CI-03 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| INDEF-01 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| INDEF-02 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| INDEF-03 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| INDEF-04 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Pending |
| INT-01 | Phase 44 — Integración lockstep + cierre | Pending |
| INT-02 | Phase 44 — Integración lockstep + cierre | Pending |
| INT-03 | Phase 44 — Integración lockstep + cierre | Pending |
| INT-04 | Phase 44 — Integración lockstep + cierre | Pending |

**Coverage: 23/23 requisitos mapeados — 0 huérfanos, 0 duplicados, 0 gaps.**
Cada requisito vive en EXACTAMENTE una fase; cada criterio de éxito del ROADMAP está respaldado por ≥1 requisito.

### Mapping rationale

- **MIG-01/02 → Phase 40 (PRIMERA).** Invariante del proyecto desde v1.5: la migración con reset selectivo va antes de dar de alta contenido, para que las categorías nuevas nazcan sin estado espurio y sin renumerar ids con progreso vivo. Espejo verbatim de `migrate11to12` (Phase 35, v1.9) una versión más arriba. Trampa de plan-time: `fare-indicativo` y `fare-indefiniti` comparten el prefijo `fare-ind` — los prefijos del predicado se declaran completos, nunca truncados.
- **IND-01..06 → Phase 41.** Una categoría = una fase: `fare-indicativo` es la unidad de reset más grande (8 slots ≈ 48 variantes, casi la mitad del volumen de quórum del milestone). IND-05 cubre 3 slots de una (los compuestos con `avere`, que comparten regla: el auxiliar se conjuga y `fatto` no cambia); IND-06 aísla el trapassato remoto porque su marco sintáctico es parte del ejercicio.
- **CONG-01..04 → Phase 42.** Categoría propia (unidad de reset separada del indicativo, decisión de diseño FARE-X1). ≈24 variantes. CONG-04 no es una casilla del paradigma sino el disparador — vive aquí porque sin él las casillas se responden por reconocimiento de forma.
- **CI-01..03 + INDEF-01..04 → Phase 43.** DOS categorías en una fase (siguen siendo dos unidades de reset independientes). Criterio: el cuello de botella real es la validación 1-por-1 por quórum con fresh context, y ≈17 + ≈18 = ≈35 variantes es del orden de `fare-congiuntivo` sola (≈24) y menor que `fare-indicativo` (≈48). Separarlas daría dos fases finas contra la granularidad `coarse` del proyecto; fundirlas en una categoría rompería la unidad de reset. Comparten además el hecho de ser "la cola del paradigma" (formas de baja frecuencia o fijas) y los dos magnets restantes.
- **INT-01..04 → Phase 44 (ÚLTIMA).** Los counts solo pueden derivarse del disco cuando los 4 JSON son definitivos (patrón Phase 31 de v1.7 y Phase 39 de v1.9). El registro operativo en `categories.json` puede ocurrir dentro de cada fase de contenido; INT-01 se cierra y verifica aquí. INT-03 (cruces multi-cat) va al final porque cruza con categorías que se autoran en 41/42/43. INT-04 es el gate de calidad transversal del milestone.

### Estado del codebase al fijar el roadmap (2026-07-28)

- `CURRENT_SCHEMA_VERSION` = **12** (`src/data/storage.js:35`, `src/data/backup.js:56`) → la migración de v2.0 es **`12→13`**.
- **14 categorías** registradas (orders 1-14) / **225 slots** en disco → las 4 nuevas van a **order 15-18** y `TOTAL_EXPECTED` pasa de 225 a 225 + los 21 slots nuevos.
- `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` = **2** — invariante D-54 verificable al cierre.
