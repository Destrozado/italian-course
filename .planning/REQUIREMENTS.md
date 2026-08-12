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

- [x] **IND-01**: El autor es examinado sobre el **presente** irregular de `fare` en todas las personas (`faccio / fai / fa / facciamo / fate / fanno`), incluida la trampa de la raíz doble `facc-` vs `fa-`.
- [x] **IND-02**: El autor es examinado sobre el **imperfetto** (`facevo / facevi / faceva / facevamo / facevate / facevano`), donde reaparece la raíz latina `fac-` que el infinitivo esconde.
- [x] **IND-03**: El autor es examinado sobre el **passato remoto** (`feci / facesti / fece / facemmo / faceste / fecero`), con su alternancia radical `fec-` / `fac-` en 1ª-3ª singular y 3ª plural frente al resto.
- [x] **IND-04**: El autor es examinado sobre el **futuro semplice** (`farò / farai / farà / faremo / farete / faranno`), con raíz contracta `far-` (nunca `*facerò`).
- [x] **IND-05**: El autor es examinado sobre los **tiempos compuestos con `avere` + `fatto`** — passato prossimo (`ho fatto`), trapassato prossimo (`avevo fatto`) y futuro anteriore (`avrò fatto`) — eligiendo el auxiliar y el tiempo del auxiliar según el marco temporal de la frase.
- [x] **IND-06**: El autor es examinado sobre el **trapassato remoto** (`ebbi fatto`) DENTRO de su único marco vivo: subordinada temporal (`dopo che / quando / appena`) con la principal en passato remoto. El marco es parte del ejercicio — sin él la frase es artificial.

### Fare — Congiuntivo (CONG) · categoría `fare-congiuntivo`, 4 slots

- [x] **CONG-01**: El autor es examinado sobre el **congiuntivo presente** (`faccia / faccia / faccia / facciamo / facciate / facciano`). Las tres primeras personas son homógrafas: el pronombre sujeto (o un sujeto explícito) DEBE estar en la frase o el ejercicio es irresoluble.
- [x] **CONG-02**: El autor es examinado sobre el **congiuntivo imperfetto** (`facessi / facessi / facesse / facessimo / faceste / facessero`), con la misma exigencia de sujeto explícito en `io`/`tu` (`facessi` homógrafa).
- [x] **CONG-03**: El autor es examinado sobre el **congiuntivo passato** (`abbia fatto`) y el **trapassato** (`avessi fatto`), incluida la elección del tiempo según la concordancia con la principal.
- [x] **CONG-04**: El autor es examinado sobre el disparador del subjuntivo — qué verbos y conjunciones (`penso che`, `benché`, `prima che`, `se` hipotético) lo exigen — para que la casilla no se responda por reconocimiento de forma sin entender el contexto.

### Fare — Condizionale + Imperativo (CI) · categoría `fare-cond-imperativo`, 3 slots

- [x] **CI-01**: El autor es examinado sobre el **condizionale presente** (`farei / faresti / farebbe / faremmo / fareste / farebbero`), con la misma raíz contracta `far-` del futuro.
- [x] **CI-02**: El autor es examinado sobre el **condizionale passato** (`avrei fatto`), incluido su uso italiano para el futuro en el pasado (`ha detto che avrebbe fatto`), que el español resuelve distinto.
- [x] **CI-03**: El autor es examinado sobre el **imperativo presente** (`fa' / faccia / facciamo / fate / facciano`) — **5 variantes, no 6: el imperativo no tiene `io`**. La 2ª singular es un MAGNET de doble validez (`fa'`, `fai` y `fa` están todas atestiguadas) y requiere rondas extra de quórum.

### Fare — Formas indefinidas (INDEF) · categoría `fare-indefiniti`, 6 slots

> En estos 6 slots las formas son fijas: el eje de variante es el **contexto** (~3 frases distintas por slot que exijan esa forma), no la persona.

- [x] **INDEF-01**: El autor es examinado sobre el **infinito presente** (`fare`) y el **infinito passato** (`aver(e) fatto`), incluida la elección entre ambos según la anterioridad respecto a la principal.
- [x] **INDEF-02**: El autor es examinado sobre el **participio passato** (`fatto`) como forma léxica y su comportamiento con `avere` (invariable) frente a la concordancia cuando la rige un pronombre objeto.
- [x] **INDEF-03**: El autor es examinado sobre el **participio presente** (`facente`) **con nota de registro explícita**: la explanation avisa de que es burocrático/fosilizado y vive sobre todo en compuestos (`facente funzione`). Entra para que el paradigma esté completo, sin mentir sobre su uso real.
- [x] **INDEF-04**: El autor es examinado sobre el **gerundio presente** (`facendo`) y el **gerundio passato** (`avendo fatto`), incluido `stare + gerundio` como progresivo.

### Migración (MIG)

- [x] **MIG-01**: `migrate12to13` + `hydrateV13` idempotentes con deep-clone anti-prototype-pollution y `CURRENT_SCHEMA_VERSION=13`, con reset selectivo del progreso por prefijo SOLO de las 4 categorías nuevas (efectivamente no-op al nacer sin progreso; mirror del patrón `migrate11to12` de v1.9).
- [x] **MIG-02**: `backup.js` hace round-trip v13 (export/import), migra import `v12→v13` y rechaza wrappers `> 13`.

### Integración lockstep (INT)

- [x] **INT-01**: 4 entradas nuevas en `categories.json` (append, order 15–18) con `origen: "ia-quorum"` (PROV-01, v1.9), sin romper el display de la tabla del home.
- [x] **INT-02**: Counts re-sincronizados — los **2** arrays hardcoded de count que quedaban ciegos (`CATEGORIES` de `scripts/run-validation-271.mjs` y `REAL_CATEGORIES` de `tests/fixtures/slot-variants-integration.test.js`) más el **gate anti-ceguera** (`tests/count-arrays-lockstep.test.js`), que pone rojo cualquier categoría registrada en `categories.json` y no enganchada. `TOTAL_EXPECTED` y la fórmula del baseline-guard ya eran `reduce` sobre `CATEGORIES`, así que se re-suman solos y NO se editan; el smoke paramétrico y `CATEGORIES_WITH_EXPLANATIONS` ya llevaban las 4 entradas desde las Phases 41/42/43. El dynamic-count mantiene la honestidad (nunca número mágico).
  <!-- v2.0 Phase 44 (D-44-08): el requisito decía «los 3 arrays hardcoded». Eran 3 en v1.9; para v2.0 solo 2 quedaron sin enganchar, porque el tercero (`CATEGORIES_WITH_EXPLANATIONS`) lo fueron ampliando las propias fases de contenido. Y el gate anti-ceguera no estaba en el requisito original: se añade porque el fallo se repitió tres fases seguidas sin que nada se pusiera rojo. -->
- [x] **INT-03**: Cruces multi-categoría de `fare` (`↔ avere` en los compuestos, `↔ modali` en `devo/posso/voglio fare`, `↔ presente-regolare` como contraste irregular-vs-regular) reusando `applyResultToSession` — la cascada D-54 permanece en EXACTAMENTE 2 call-sites de `applyImmediateFailure` (verificable por grep).
  <!-- v2.0 Phase 44 (D-44-08): el requisito escribía un slug con prefijo `verbi-` que NO existe en el registro — `src/data/schema-validator.js` rechazaría el fichero. El slug real registrado en content/categories.json es `modali`, y se sustituye en vez de anotarse al lado. -->
- [x] **INT-04**: Todas las variantes nuevas validadas 1-por-1 por quórum cross-vendor R1-R7, con **rondas EXTRA en los 4 magnets de doble validez**: imperativo `tu` (`fa'`/`fai`/`fa`), las homógrafas de congiuntivo, el par `fatto` invariable-vs-concordado, y el par `aver fatto` / `avere fatto` del infinito passato (apócope frente a forma plena, D-43-17).
  <!-- v2.0 Phase 44: cerrado al terminar la pasada TOP-LEVEL del checkpoint de la Tarea 4 de 44-02. Los 3 cruces quedan `validated` con 2 pases de `by` distintos cada uno (Opus + Sonnet), y las rondas EXTRA de los 4 magnets estaban ya ejecutadas en disco y declaradas en `### 7.5`. El quórum NO fue limpio: `-301` cayó `incorrecta` en la 1ª ronda (C5-leak en los 3 glosses + C4 en la explanation) y `fare-indefiniti-300` cayó `incorrecta` dos veces por C2 en su variante 1 (el complemento de G3 cumplía el gate por presencia y no por fuerza excluyente). Las 3 rondas fallidas están en el audit trail del `notes` y de los mensajes de commit. -->

### Deuda del arnés de tests (DEUDA)

<!-- v2.0 (D-45-13): los tres nacen de `.planning/v2.0-MILESTONE-AUDIT.md` — la auditoría de cierre de v2.0, que cerró en estado `tech_debt` con 24/24 requirements satisfechos y deuda real acumulada. Se abren DENTRO de v2.0 y no como primer bloque de v2.1 porque pagan deuda generada por las Phases 41-44 de ESTE milestone; abrirlos en v2.1 los desconectaría de la auditoría que los produjo. Redactados desde el criterio de éxito del ROADMAP (el compromiso), no desde lo que se acabó implementando. -->

- [x] **DEUDA-01**: Las aserciones de los ficheros de `tests/fixtures/` corren en la invocación canónica de la suite, de modo que desincronizar un `expected` de `REAL_CATEGORIES` respecto al disco pone la suite en ROJO. Antes no: `node --test tests/*.test.js` no globea ese subdirectorio, así que uno de los dos arrays de conteo que la Phase 44 existía para re-enganchar vivía sin gate automático.
  <!-- Nace de `.planning/v2.0-MILESTONE-AUDIT.md`, WR-06 de la Phase 44 (D-45-13). v2.0 Phase 45 (plan 45-01): cerrado eligiendo como forma canónica los DOS globs (`node --test tests/*.test.js tests/fixtures/*.test.js`, D-45-01) en vez de mover los ficheros a `tests/` (D-45-02), y congelándola por tres gates derivados del disco en vez de por prosa: cobertura por `readdirSync` recursivo, lockstep de los ficheros de contrato y regla de prefijo sobre las cabeceras de `tests/` (D-45-03). El requisito habla de «los ficheros» en plural porque el ROADMAP se quedaba corto: nombraba UN fichero huérfano y 44 aserciones, y son DOS ficheros y 63 aserciones. Ninguna cifra de conteo se transcribió al arnés — el invariante documentado es `# fail 0` + exit 0 (D-45-04). El lockstep tuvo que pasar de `includes()` a conteo de ocurrencias porque con `includes()` no se ponía rojo ante su propio caso de uso. -->
- [x] **DEUDA-02**: `CATEGORIES_WITH_EXPLANATIONS` entra en el gate anti-ceguera: el gate se pone ROJO ante una categoría registrada en `content/categories.json` y ausente de ESE array. Antes quedaba fuera porque no declaraba clave `slug:` y el extractor no podía parsearlo — estando en sync, pero con la misma forma del olvido que corrió tres fases seguidas.
  <!-- Nace de `.planning/v2.0-MILESTONE-AUDIT.md`, WR-01 de la Phase 44 (D-45-13). v2.0 Phase 45 (plan 45-02): de las dos salidas que el criterio de éxito admitía se eligió **reformar el array** (Opción A) y NO enseñar al extractor a leer su forma — cero regex nueva que mantener, cobertura por los DOS gates (`slugsCiegos` y `paresCruzados`) en vez de por uno, y las tres fuentes de conteo quedan estructuralmente idénticas, que es lo que hará que la cuarta se enganche sin pensar. WR-07 entró (el ancla `slug:\s*` cruzaba saltos de línea; pasó a `slug:[^\S\n]*`, con golden fail-first). **WR-12 quedó FUERA por decisión escrita** (D-45-06): es ortogonal a este requisito, la Opción A no lo agrava, y su fix cambiaría la semántica de un assert que hoy pasa. Se añadió además un guard de integridad del escáner que no estaba en el requisito. -->
- [x] **DEUDA-03**: El encabezado y el pie que `scripts/run-validation-271.mjs` imprime DERIVAN el milestone activo en vez de transcribirlo, y un test lo congela. Antes imprimía «Milestone v1.1 — gate Phase 10» y recomendaba `/gsd:complete-milestone v1.1` — cuatro milestones de retraso — en el fichero cuyo trabajo es precisamente que los números no engañen.
  <!-- Nace de `.planning/v2.0-MILESTONE-AUDIT.md`, WR-10 de la Phase 44 (D-45-13). v2.0 Phase 45 (plan 45-03): la fuente de derivación es el frontmatter de `.planning/STATE.md` y no `MILESTONES.md`, que solo registra los ya shipped (D-45-08). La lectura es **fail-soft** en el reporter (una etiqueta cosmética no puede convertirse en blocker que mate el proceso antes de imprimir una fila, lección WR-09) y **fail-loud** en el test que la congela; las dos polaridades van con su razón escrita al lado porque leídas juntas parecen inconsistentes. El banner dejó de nombrar una fase (D-45-10) y el pie imprime la forma con guion del comando (D-45-11). **El `271` del nombre del fichero NO se pagó**: sigue codificando un conteo obsoleto y queda como deuda ACEPTADA y viva, con la mitigación escrita en su cabecera (D-45-09). Cerrado de las dos maneras que exigía: por aserción (gate source-assert con su rojo observado) y por lectura humana (checkpoint aprobado 2026-08-13, sin cambios solicitados) — el modo de fallo original era un texto correcto en su sintaxis y falso en su contenido, que ningún test de entonces habría distinguido. -->

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
| MIG-01 | Phase 40 — Migración `12→13` | Complete |
| MIG-02 | Phase 40 — Migración `12→13` | Complete |
| IND-01 | Phase 41 — `fare-indicativo` | Complete |
| IND-02 | Phase 41 — `fare-indicativo` | Complete |
| IND-03 | Phase 41 — `fare-indicativo` | Complete |
| IND-04 | Phase 41 — `fare-indicativo` | Complete |
| IND-05 | Phase 41 — `fare-indicativo` | Complete |
| IND-06 | Phase 41 — `fare-indicativo` | Complete |
| CONG-01 | Phase 42 — `fare-congiuntivo` | Complete |
| CONG-02 | Phase 42 — `fare-congiuntivo` | Complete |
| CONG-03 | Phase 42 — `fare-congiuntivo` | Complete |
| CONG-04 | Phase 42 — `fare-congiuntivo` | Complete |
| CI-01 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| CI-02 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| CI-03 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| INDEF-01 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| INDEF-02 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| INDEF-03 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| INDEF-04 | Phase 43 — `fare-cond-imperativo` + `fare-indefiniti` | Complete |
| INT-01 | Phase 44 — Integración lockstep + cierre | Complete |
| INT-02 | Phase 44 — Integración lockstep + cierre | Complete |
| INT-03 | Phase 44 — Integración lockstep + cierre | Complete |
| INT-04 | Phase 44 — Integración lockstep + cierre | Complete |
| DEUDA-01 | Phase 45 — Deuda del arnés de tests | Complete |
| DEUDA-02 | Phase 45 — Deuda del arnés de tests | Complete |
| DEUDA-03 | Phase 45 — Deuda del arnés de tests | Complete |

> **INT-03 e INT-04 siguen `Pending` a propósito al cerrar el plan 44-01.** El plan 44-01 solo cubre la mitad mecánica y documental: INT-01 verificado y congelado por gate, INT-02 cerrado con los 2 arrays y el gate anti-ceguera, e INT-04 declarado (los 4 magnets verificados en disco y escritos en `### 7.5` del prompt de validación). Los 3 cruces multi-categoría de INT-03 nacen en 44-02 con `status: pending` y `passes: []`, y hasta que su quórum corra, INT-04 —«TODAS las variantes nuevas validadas»— sería falso en verde. Marcarlos completos aquí es exactamente la clase de mentira que el reporter llevaba tres fases contando.
>
> **Actualización al cerrar el plan 44-02.** Los 3 cruces YA están en disco: `fare-indicativo-300` (`↔ avere`), `fare-indicativo-301` (`↔ presente-regolare`) y `fare-indefiniti-300` (`↔ modali`), 9 variantes, `categoryIds` de 2 con el slug `modali`, y la cascada D-54 sigue en EXACTAMENTE 2 call-sites de `applyImmediateFailure` con el diff del motor vacío. Aun así **INT-03 se queda `Pending`, y por la misma razón que en 44-01**: las 9 variantes tienen `validation.status: "pending"` con `passes: []`, así que su contenido no está revisado y una sola de ellas puede resultar `disputed` en el quórum y tener que reescribirse. Poner `Complete` sobre contenido sin revisar es exactamente el verde que el disco no respalda. Los dos requisitos se cierran juntos cuando termine la pasada TOP-LEVEL (`/gsd-validate-exercise` sobre los 3, un contexto fresco cada uno, VAL-03) y el reporter pase de `VAL-06 (250/250): FAIL (247/250 — pending=3)` a `PASS`.
>
> **Cierre efectivo (2026-08-11, checkpoint de la Tarea 4 de 44-02 resuelto).** La pasada TOP-LEVEL corrió, un ejercicio por contexto fresco y nunca en lote (VAL-03), y los 3 cruces están `validated` con 2 pases de `by` distintos cada uno —`claude-opus-5` y `claude-sonnet-5`, los dos `correcta`—. El reporter pasó a `VAL-06 (250/250 validated): PASS` con `Milestone gate PASS` y exit 0, y `VAL_07_STRICT=1 node --test tests/*.test.js` a `1081 pass / 0 fail`. **INT-03 e INT-04 pasan a `Complete`, y el verde sí lo respalda el disco.** Lo que cuesta registrar y hay que registrar: el quórum tardó 6 rondas en total sobre 3 ejercicios. `fare-indicativo-301` fue `incorrecta` en la 1ª (C5-leak: los 3 glosses ES conjugaban el verbo del hueco y entregaban persona y tiempo, más C4 en la explanation), y `fare-indefiniti-300` fue `incorrecta` dos veces por C2 en la variante 1, porque su complemento cumplía el gate G3 por PRESENCIA del marcador de la lista cerrada sin ejercer fuerza excluyente. Ningún pase `incorrecta` se arrastró a `passes[]` —juzgaban textos que ya no existen y `disputed` es sticky—, y ninguno de los tres necesitó override de autor.

> **Los tres DEUDA se abren ya `Complete`, y el disco lo respalda (2026-08-13, al cerrar el plan 45-04).** No es un verde de cortesía por venir de la última ola: los tres planes que los cierran están commiteados con su SUMMARY escrito, y cada uno transcribe **el rojo que observó en terminal** sobre la mutación que define su requisito. DEUDA-01: desincronizado un `expected` literal de `REAL_CATEGORIES`, la invocación canónica da `# fail 1` / `exit=1` (y la forma vieja `node --test tests/*.test.js` sigue dando `exit=0` sobre la misma mutación — el bug, reproducido). DEUDA-02: borrada UNA entrada del array, el gate nombra `fare-indefiniti` y a nadie más, `# fail 1` / `exit=1`. DEUDA-03: reintroducido un literal de versión en una línea de salida, el gate transcribe la línea culpable con su número, `# fail 2` / `exit=1`, y además el autor leyó la salida real y la aprobó. Lo que **no** se cierra aquí queda escrito y vivo: WR-12 (D-45-06) y el `271` del nombre del reporter (D-45-09) son deuda aceptada, no asunto resuelto.

**Coverage: 26/26 requisitos mapeados — 0 huérfanos, 0 duplicados, 0 gaps.**
Cada requisito vive en EXACTAMENTE una fase; cada criterio de éxito del ROADMAP está respaldado por ≥1 requisito.

<!-- v2.0 Phase 45 (D-45-12, plan 45-04): esta cifra ya NO es una transcripción que envejezca en silencio. `tests/requirements-traceability.test.js` la confronta con el número de filas contadas de este documento y cruza el conjunto de IDs definidos con el de IDs mapeados en las DOS direcciones. Editar la tabla sin editar la cifra —o definir un requisito sin mapearlo, o mapearlo sin definirlo— pone la suite ROJA nombrando el ID. La cifra se cuenta del disco: no la escribas de memoria. -->


### Mapping rationale

- **MIG-01/02 → Phase 40 (PRIMERA).** Invariante del proyecto desde v1.5: la migración con reset selectivo va antes de dar de alta contenido, para que las categorías nuevas nazcan sin estado espurio y sin renumerar ids con progreso vivo. Espejo verbatim de `migrate11to12` (Phase 35, v1.9) una versión más arriba. Trampa de plan-time: `fare-indicativo` y `fare-indefiniti` comparten el prefijo `fare-ind` — los prefijos del predicado se declaran completos, nunca truncados.
- **IND-01..06 → Phase 41.** Una categoría = una fase: `fare-indicativo` es la unidad de reset más grande (8 slots ≈ 48 variantes, casi la mitad del volumen de quórum del milestone). IND-05 cubre 3 slots de una (los compuestos con `avere`, que comparten regla: el auxiliar se conjuga y `fatto` no cambia); IND-06 aísla el trapassato remoto porque su marco sintáctico es parte del ejercicio.
- **CONG-01..04 → Phase 42.** Categoría propia (unidad de reset separada del indicativo, decisión de diseño FARE-X1). ≈24 variantes. CONG-04 no es una casilla del paradigma sino el disparador — vive aquí porque sin él las casillas se responden por reconocimiento de forma.
- **CI-01..03 + INDEF-01..04 → Phase 43.** DOS categorías en una fase (siguen siendo dos unidades de reset independientes). Criterio: el cuello de botella real es la validación 1-por-1 por quórum con fresh context, y ≈17 + ≈18 = ≈35 variantes es del orden de `fare-congiuntivo` sola (≈24) y menor que `fare-indicativo` (≈48). Separarlas daría dos fases finas contra la granularidad `coarse` del proyecto; fundirlas en una categoría rompería la unidad de reset. Comparten además el hecho de ser "la cola del paradigma" (formas de baja frecuencia o fijas) y los dos magnets restantes.
- **DEUDA-01..03 → Phase 45 (transversal, posterior al cierre de contenido).** No se reparten entre las fases que generaron la deuda porque no son deuda de CONTENIDO sino de ARNÉS: los tres tocan solo `tests/`, `scripts/` y la documentación que registra la invocación canónica — cero ejercicios, cero motor. Repartirlos habría exigido reabrir tres fases ya verificadas para cambiar ficheros que no son suyos. Y van juntos porque comparten causa raíz, no tema: los tres son sitios donde el arnés **no vigila lo que su propia prosa dice que vigila**, y dos de los tres (DEUDA-01 y DEUDA-02) dejaban abierto el mismo camino por el que una categoría puede quedarse sin contar con todos los gates en verde — el bug que se repitió tres fases seguidas emitiendo `225/225 PASS` con 22 slots de `fare` en disco y sin contar. La fase es posterior al cierre de contenido por la misma razón que INT-01..04: un gate sobre los conteos solo puede escribirse cuando los conteos son definitivos.
- **INT-01..04 → Phase 44 (ÚLTIMA).** Los counts solo pueden derivarse del disco cuando los 4 JSON son definitivos (patrón Phase 31 de v1.7 y Phase 39 de v1.9). El registro operativo en `categories.json` puede ocurrir dentro de cada fase de contenido; INT-01 se cierra y verifica aquí. INT-03 (cruces multi-cat) va al final porque cruza con categorías que se autoran en 41/42/43. INT-04 es el gate de calidad transversal del milestone.

### Estado del codebase al fijar el roadmap (2026-07-28)

- `CURRENT_SCHEMA_VERSION` = **12** (`src/data/storage.js:35`, `src/data/backup.js:56`) → la migración de v2.0 es **`12→13`**.
- **14 categorías** registradas (orders 1-14) / **225 slots** en disco → las 4 nuevas van a **order 15-18** y `TOTAL_EXPECTED` pasa de 225 a 225 más los slots nuevos.

### Estado real al cerrar el plan 44-01 (2026-08-11)

Lo de arriba es la foto de plan-time y se conserva como tal. Lo que hay en disco hoy:

- **18 categorías** registradas (orders 1-18, las 4 de `fare` con `origen: "ia-quorum"`) / **247 slots** en disco = 225 previos + los **22 slots nuevos** del paradigma de `fare` (8 indicativo + 5 congiuntivo + 3 cond-imperativo + 6 indefiniti), **113 variantes** (48 + 30 + 17 + 18).
- El plan estimó 21 slots y salieron 22: `fare-congiuntivo` añadió el slot del disparador (CONG-04), que no es una casilla del paradigma.
- `node scripts/run-validation-271.mjs` → `VAL-06 (247/247 validated): PASS`. Antes de este plan decía `225/225 PASS` estando **ciego a los 22 slots de `fare`** durante tres fases.
- Con los 3 cruces multi-categoría del plan 44-02 el total pasará a **250**.
- `CURRENT_SCHEMA_VERSION` = **13** desde Phase 40 (MIG-01).
- `grep -c 'applyImmediateFailure(this.state' src/screens/app.js` = **2** — invariante D-54 verificable al cierre.
