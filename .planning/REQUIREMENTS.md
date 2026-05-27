# Requirements: Italian Course — Ejercicios A1/A2

**Defined:** 2026-05-27
**Milestone:** v1.2 — Más contenido A1 (Articoli + Partitivos)
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría; fallar un ejercicio desmarca todos los temas que toca.

## v1.2 Requirements

Requisitos de este milestone. Cada uno mapea a una fase del roadmap.

### Articoli (ART) — Phase 11

- [x] **ART-01**: La categoría "Articoli" existe en `content/categories.json` y carga en la app como 8ª categoría
- [x] **ART-02**: Temario exhaustivo de Articoli documentado ANTES de redactar ejercicios — todas las formas determinativas (`il/lo/l'/la/i/gli/le`) e indeterminativas (`un/uno/una/un'`) × disparadores fonéticos (s+cons, z, gn, ps, pn, x, y, vocal) × trampas canónicas
- [x] **ART-03**: Ejercicios cubren cada forma del artículo determinativo en su contexto fonético disparador (incl. plurales `i/gli/le`)
- [x] **ART-04**: Ejercicios cubren cada forma del artículo indeterminativo (`un/uno/una/un'`) con su disparador
- [x] **ART-05**: Ejercicios cubren las trampas canónicas (`lo zio`, `gli gnocchi`, `lo psicologo`, `uno studente`, `l'amico`/`l'amica`, `un'amica` vs `un amico`)
- [ ] **ART-06**: Ejercicios multi-categoría cruzan Articoli con género-número y con sustantivos-irregulares (bridges patrón avere-300..; fallar un cruce resetea ambas categorías vía cascada D-54)
- [x] **ART-07**: Cada ejercicio de Articoli tiene explanation pedagógica curada (canon español acentuado + italianismos preservados, plain text, apóstrofes ASCII U+0027)
- [x] **ART-08**: Todos los ejercicios de Articoli validados por quórum ≥2 IAs distintas (`status: validated` con ≥2 `by` distintos en `passes[]`)

### Partitivos (PART) — Phase 12

- [ ] **PART-01**: La categoría "Partitivos" existe en `content/categories.json` y carga en la app como 9ª categoría
- [ ] **PART-02**: Temario exhaustivo del partitivo documentado ANTES de redactar ejercicios — formas `del/dello/della/dell'/dei/degli/delle` + alternativas `alcuni/qualche/un po' di` + omisión en negativas
- [ ] **PART-03**: Ejercicios cubren cada forma del partitivo (singular `del/dello/della/dell'` y plural `dei/degli/delle`)
- [ ] **PART-04**: Ejercicios cubren las alternativas partitivas (`alcuni/alcune`, `qualche` + singular, `un po' di` con incontables)
- [ ] **PART-05**: Ejercicios ejercitan la distinción función partitiva ("algo de") vs preposizione articolata ("de el") — comparten forma `del/della`, distinto uso
- [ ] **PART-06**: Cada ejercicio de Partitivos tiene explanation pedagógica curada (mismo canon que ART-07)
- [ ] **PART-07**: Todos los ejercicios de Partitivos validados por quórum ≥2 IAs distintas (`status: validated` con ≥2 `by` distintos en `passes[]`)

## Future Requirements (deferred)

Reconocidos pero fuera del roadmap actual. Trasladados al backlog.

### Contenido (tiempos verbales)

- **TENSE-X1**: Categoría Pretérito imperfetto conforme la profesora entregue material
- **TENSE-X2**: Categoría Futuro semplice
- **TENSE-X3**: Categoría Condizionale
- **TENSE-X4**: Categoría Congiuntivo

### Otros

- **PART-X1**: Bridges multi-categoría Partitivos ↔ género-número / sustantivos (diferido a fase posterior si emerge dolor; v1.2 deja Partitivos sin bridges para acotar)

## Out of Scope

Excluido explícitamente para prevenir scope creep.

| Feature | Razón |
|---------|-------|
| Generación de ejercicios con IA a partir de PDFs | Se mantiene fuera (consistente con v1.0/v1.1); el contenido se diseña/edita a mano |
| Articoli determinativi e indeterminativi como 2 categorías separadas | Decidido en init v1.2: 1 categoría — comparten regla fonética; indet solo sería demasiado fina y rompe el espejo il/lo↔un/uno |
| Duplicar la función prepositiva de `del/della` en Partitivos | Esa función ya está en la categoría Preposiciones (preposizioni articolate); Partitivos cubre SOLO la función partitiva "algo de" |
| Formas ultra-raras / literarias (`gli dei`, `lo iato`, `lo pneumatico` discutido) más allá del A1/A2 estándar | El temario cubre el estándar A1/A2 práctico, no exhaustividad académica; las trampas canónicas sí entran (ART-05) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ART-01 | Phase 11 | Complete |
| ART-02 | Phase 11 | Complete |
| ART-03 | Phase 11 | Complete |
| ART-04 | Phase 11 | Complete |
| ART-05 | Phase 11 | Complete |
| ART-06 | Phase 11 | Pending |
| ART-07 | Phase 11 | Complete |
| ART-08 | Phase 11 | Complete |
| PART-01 | Phase 12 | Pending |
| PART-02 | Phase 12 | Pending |
| PART-03 | Phase 12 | Pending |
| PART-04 | Phase 12 | Pending |
| PART-05 | Phase 12 | Pending |
| PART-06 | Phase 12 | Pending |
| PART-07 | Phase 12 | Pending |

**Coverage:**
- v1.2 requirements: 15 total (8 ART + 7 PART)
- Mapped to phases: 15 (CONFIRMADO por el roadmapper — ART-01..08 → Phase 11; PART-01..07 → Phase 12)
- Unmapped: 0
- Orphans: 0
- Duplicados (un requisito en 2 fases): 0

---
*Requirements defined: 2026-05-27*
*Last updated: 2026-05-27 after roadmap v1.2 — traceability confirmada (15/15 mapped, 0 orphans), Phase 11 = Articoli, Phase 12 = Partitivos*
