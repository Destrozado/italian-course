# Requirements: Italian Course — Milestone v1.9 (Determinantes + verbos A1/A2)

**Defined:** 2026-07-01
**Core Value:** Que el sistema te obligue a no olvidar — cada categoría se re-verifica constantemente; un solo fallo devuelve la categoría entera a repetir.

> **Naturaleza del milestone:** brownfield PURO DE CONTENIDO. El motor v1.4 (cascada D-54 con 2 call-sites, sampler, slot-engine, promociones/racha, localStorage) NO se toca. Las 4 categorías nuevas nacen en formato **slot+variantes**, autoradas desde cero (no hay PDF de la profesora) y validadas 1-por-1 por **quórum cross-vendor R1-R7** (patrón D-85, v1.6/v1.7). Integración lockstep: migración `11→12` + reset selectivo + sync de counts + smoke paramétrico. Numeración de fases CONTINÚA desde Phase 34.
>
> **DESIGN RULE (heredada):** `match` solo válido cuando el pareo exige una regla NO derivable por raíz compartida; si no, multiple-choice con distractoras plausibles.
> **Canon de explanations (heredado):** español acentuado (RAE), italianismos citados en ortografía italiana, gloss `(en español: …)` canónico (R7), plain text, apóstrofe ASCII.

## v1.9 Requirements

Requisitos comprometidos para este milestone. Cada uno mapea a una fase del roadmap.

### Dimostrativi (DEMOS)

- [ ] **DEMOS-01**: El autor es examinado sobre la concordancia de `questo/questa/questi/queste` (vicino) en género y número.
- [ ] **DEMOS-02**: El autor es examinado sobre la elisión `quest'` ante vocal (`quest'anno`, `quest'amica`).
- [ ] **DEMOS-03**: El autor es examinado sobre las formas tipo-artículo de `quello` (`quel/quello/quell'/quei/quegli/quelle`) según el disparador fonético, incluyendo 1 slot `match` sustantivo→forma (engancha con `articoli`, análogo `articoli-049`).
- [ ] **DEMOS-04**: El autor es examinado sobre el colapso de calco ES 3-vías → IT 2-vías (este/ese/aquel → `questo`/`quello`), con anclas de distancia (`qui`/`là`) para desambiguar.
- [ ] **DEMOS-05** *(A2/diferenciador)*: El autor es examinado sobre el pronombre neutro `ciò` y las formas pronominales de `questo`/`quello`.

### Possessivi (POSS)

- [ ] **POSS-01**: El autor es examinado sobre la concordancia de la forma posesiva (`il mio / la mia / i miei / le mie`, ×`tuo`/`suo`) con la COSA POSEÍDA, no con el poseedor.
- [ ] **POSS-02**: El autor es examinado sobre que el posesivo EXIGE artículo determinado (`la mia casa`, nunca `*mia casa`) — contraste directo con el español (`mi casa`).
- [ ] **POSS-03**: El autor es examinado sobre la excepción de parentesco singular sin modificar que ELIMINA el artículo (`mia madre`, `tuo fratello`).
- [ ] **POSS-04**: El autor es examinado sobre el RETORNO del artículo con plural o alteración (`i miei fratelli`, `la mia mamma`).
- [ ] **POSS-05** *(A2/diferenciador)*: El autor es examinado sobre la ambigüedad de `suo` (his/her, concuerda con lo poseído) y sobre `loro` posesivo INVARIABLE que conserva artículo (`il loro / la loro / i loro / le loro`).

### Verbi modali (MODAL)

- [ ] **MODAL-01**: El autor es examinado sobre el presente irregular de `potere / volere / dovere` en todas las personas.
- [ ] **MODAL-02**: El autor es examinado sobre la construcción modal + infinitivo (`posso andare`, `voglio mangiare`, `devo studiare`).

### Verbi riflessivi (REFLEX)

- [ ] **REFLEX-01**: El autor es examinado sobre el presente reflexivo (`mi chiamo / ti chiami / si chiama`) en todas las personas.
- [ ] **REFLEX-02**: El autor es examinado sobre la colocación del pronombre reflexivo ANTES del verbo conjugado (`mi sveglio`, nunca `*sveglio mi`) — tipo `word-buttons` con banco que incluye el orden-distractor.
- [ ] **REFLEX-03**: El autor es examinado sobre el reflexivo construido sobre terminaciones regulares (`si alza`, `ci laviamo`, `vi vestite`) — engancha directamente con `presente-regolare` (v1.7).
- [ ] **REFLEX-04**: El autor es examinado sobre el passato prossimo reflexivo con `essere` + concordancia del participio -o/-a/-i/-e (`mi sono svegliato/a`, `si sono alzati/e`) — engancha con `essere` (análogo del slot ya shipeado `presente-regolare-301`).
- [ ] **REFLEX-05** *(A2/diferenciador)*: El autor es examinado sobre 2-3 desajustes reflexivos ES↔IT genuinos (p.ej. `ammalarsi`, `dimenticarsi (di)`, `salire`) — slot pequeño y de alta señal, sin fabricar trampas falsas.

### Procedencia del contenido (PROV)

- [ ] **PROV-01**: El schema-validator acepta un campo OPCIONAL `origen` (enum `ia-quorum` | `apuntes-profesora`) a nivel de categoría en `categories.json`, retrocompatible (las 10 categorías legacy sin el campo siguen validando); valida el enum para cazar typos.
- [ ] **PROV-02**: Las 4 categorías nuevas nacen con `origen: "ia-quorum"`; las 10 categorías legacy quedan con `origen` AUSENTE (su procedencia es mixta — transcritas de PDF y luego aumentadas por quórum — y no se etiqueta a nivel categoría para no mentir).

### Migración (MIG)

- [ ] **MIG-01**: `migrate11to12` + `hydrateV12` idempotentes con deep-clone anti-prototype-pollution y `CURRENT_SCHEMA_VERSION=12`, con reset selectivo del progreso por prefijo SOLO de las 4 categorías nuevas (efectivamente no-op al nacer sin progreso; mirror del patrón `migrate10to11` de v1.7).
- [ ] **MIG-02**: `backup.js` hace round-trip v12 (export/import), migra import `v11→v12` y rechaza wrappers `> 12`.

### Integración lockstep (INT)

- [ ] **INT-01**: 4 entradas nuevas en `categories.json` (append, order 11–14) sin romper el display de la tabla del home (order documental, no usado para ordenar).
- [ ] **INT-02**: Counts re-sincronizados — los 3 arrays hardcoded de count + `TOTAL_EXPECTED` + la fórmula del baseline-guard + `+4` entradas en el smoke paramétrico; el dynamic-count mantiene la honestidad (nunca número mágico).
- [ ] **INT-03**: Cruces multi-cat (`dimostrativi`↔`articoli`, `possessivi`↔`genero-numero`/`articoli`, `riflessivi`↔`presente-regolare`/`essere`) reusando `applyResultToSession` — la cascada D-54 permanece en EXACTAMENTE 2 call-sites de `applyImmediateFailure` (verificable por grep).
- [ ] **INT-04**: Todas las variantes nuevas validadas 1-por-1 por quórum cross-vendor R1-R7 con rondas EXTRA en los 3 magnets de doble-validez (formas `quei/quegli` de `quello`; excepción de parentesco de possessivi; concordancia essere del PP reflexivo).

## Future Requirements

Diferidos a milestones futuros. Reconocidos pero fuera del roadmap actual.

### Tiempos verbales pesados (TENSE / PASSPROX)

- **MODAL-PP-01**: Passato prossimo de los modales con auxiliar PRESTADO del infinitivo (`ho dovuto lavorare` vs `sono dovuto andare`) — DIFERIDO por decisión (A2 sutil, pantano de doble-validez); va al milestone de tiempos pesados.
- **TENSE-X1..X4**: Imperfetto / Futuro semplice / Condizionale / Congiuntivo — milestone SEPARADO conforme la profesora entregue material.
- **PASSPROX-01**: Passato prossimo como categoría dedicada (elección de auxiliar + participio).

### Procedencia — granularidad fina (PROV-X)

- **PROV-X1**: Marca de procedencia por-slot o por-variante para representar con honestidad la mezcla del legado (aumentos por quórum sobre base de PDF). Diferido: coste de validador + etiquetado retroactivo alto; category-level absente basta para v1.9.

## Out of Scope

Excluidos explícitamente. Documentado para evitar scope creep.

| Feature | Razón |
|---------|-------|
| `codesto` (3er demostrativo) | Arcaico/toscano-regional, NO A1/A2; refuerza el modelo mental equivocado. Se enseña el colapso 2-vías explícito. |
| Reflexivos recíprocos (`si amano`, `ci scriviamo` "el uno al otro") | Matiz A2+/B1 con semántica distinta; a un milestone posterior de pronombres. |
| `stesso`/`medesimo` como demostrativo-adyacente | No es demostrativo; tema aparte de adjetivo enfático. |
| Modal + pronombre clítico (`voglio farlo` / `lo voglio fare`) | Requiere clíticos, que no son categoría todavía. |
| `sapere` como 4º modal | El scope son los TRES modales nombrados; `sapere` ≠ "poder" limpiamente (destreza vs capacidad). |
| Pronombre posesivo standalone (`il mio è rosso`) | El uso adjetival es table-stakes; el pronominal es un add A2 fino, no prioritario. |
| Respuesta libre escribiendo texto | OUT-OF-SCOPE del proyecto (normalización de tildes/sinónimos); los 3 tipos bastan. |
| Etiquetar legacy como procedencia única a nivel categoría | Su procedencia es MIXTA; etiquetarla en grueso mentiría (ver PROV-02, decisión del autor). |

## Traceability

Qué fases cubren qué requisitos. **Poblada por el roadmapper.**

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEMOS-01 | Phase 36 | Pending |
| DEMOS-02 | Phase 36 | Pending |
| DEMOS-03 | Phase 36 | Pending |
| DEMOS-04 | Phase 36 | Pending |
| DEMOS-05 | Phase 36 | Pending |
| POSS-01 | Phase 36 | Pending |
| POSS-02 | Phase 36 | Pending |
| POSS-03 | Phase 36 | Pending |
| POSS-04 | Phase 36 | Pending |
| POSS-05 | Phase 36 | Pending |
| MODAL-01 | Phase 37 | Pending |
| MODAL-02 | Phase 37 | Pending |
| REFLEX-01 | Phase 38 | Pending |
| REFLEX-02 | Phase 38 | Pending |
| REFLEX-03 | Phase 38 | Pending |
| REFLEX-04 | Phase 38 | Pending |
| REFLEX-05 | Phase 38 | Pending |
| PROV-01 | Phase 39 | Pending |
| PROV-02 | Phase 39 | Pending |
| MIG-01 | Phase 35 | Pending |
| MIG-02 | Phase 35 | Pending |
| INT-01 | Phase 39 | Pending |
| INT-02 | Phase 39 | Pending |
| INT-03 | Phase 39 | Pending |
| INT-04 | Phase 39 | Pending |

**Coverage:**
- v1.9 requirements: 25 total
- Mapped to phases: 25 (100%) ✓
- Unmapped: 0 (0 orphans, 0 duplicados)

**Mapping rationale:**
- **Phase 35 — Migración `11→12`** (MIG-01, MIG-02): va PRIMERA (invariante v1.5/v1.6/v1.7); el reset selectivo debe pre-existir antes de autorar contenido nuevo. Mirror de `migrate10to11`.
- **Phase 36 — Dimostrativi + Possessivi** (DEMOS-01..05, POSS-01..05): agrupadas como "determinantes" por su dependencia compartida de `articoli`/`genero-numero`; 2 magnets de doble-validez (quello `quei/quegli`; excepción de parentesco possessivi) → rondas extra de quórum.
- **Phase 37 — Verbi modali** (MODAL-01, MODAL-02): independiente; menor riesgo de quórum; scope gate duro (modal passato prossimo → MODAL-PP-01 diferido).
- **Phase 38 — Verbi riflessivi** (REFLEX-01..05): última de las altas (la más layered); apoya en `presente-regolare`/`essere`; REFLEX-04 (PP con essere+concordancia) IN scope → 1 magnet, ronda extra.
- **Phase 39 — PROV-01 + lockstep** (PROV-01, PROV-02, INT-01..04): transversal metadata + sync de counts/cruces/smoke en una fase de cierre; mirror de Phase 31 (v1.7). PROV-01 = ~5 líneas opcionales retrocompatibles; legacy `origen` AUSENTE.

---
*Requirements defined: 2026-07-01*
*Traceability poblada: 2026-07-01 (roadmapper — 25/25 mapped a Phases 35-39, 0 orphans, 0 duplicados)*
*Last updated: 2026-07-01 after initial definition (scope decisions: MODAL passato prossimo DIFERIDO · REFLEX passato prossimo INCLUIDO · PROV legacy `origen` AUSENTE)*
