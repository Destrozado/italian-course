# Requirements: Italian Course — Ejercicios A1/A2

**Defined:** 2026-06-16
**Milestone:** v1.7 — Presente regolare (10ª categoría de gramática)
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, fallar uno desmarca todos los temas que toca.

## v1.7 Requirements

Alta de la categoría `presente-regolare` (conjugación del presente indicativo de verbos regulares), nacida directamente en el formato slot+variantes unificado (CONV-01) y validada por quórum cross-vendor. Brownfield puro: el motor v1.4 (cascada D-54, sampler, slot-engine) NO se toca — solo contenido + migración + counts, igual que cada categoría de v1.5/v1.6. Análogo de referencia: v1.2 (alta de Articoli/Partitivi) + el patrón slot de v1.6.

### Contenido — Presente regolare (PRES)

- [ ] **PRES-01**: La categoría `presente-regolare` aparece en `content/categories.json` (order 10), carga en boot y es usable en home/picker/Examen exactamente como las otras 9 categorías
- [ ] **PRES-02**: Los slots de regla cubren los tres grupos + la sub-regla trampa + los ortográficos: `-are` · `-ere` · `-ire` simple (dormire/partire/aprire) · `-ire` con `-isc-` (finire/capire/preferire/pulire) · ortográficos `-care/-gare` (giochi/paghi) y `-ciare/-giare` (cominci/mangi)
- [ ] **PRES-03**: Cada slot de regla tiene ≥2 variantes intercambiables (multi-choice y/o word-buttons), de modo que re-hacer la categoría tras un fallo puede presentar una variante distinta del mismo slot (mata la memorización por palabra)
- [ ] **PRES-04**: Todas las variantes nuevas pasan el quórum cross-vendor R1-R7 (`status: validated`; los `disputed` se resuelven por el autor-oráculo con audit trail)
- [ ] **PRES-05**: Cada slot tiene `explanation` curada a nivel de slot (canon ortográfico español acentuado: regla + ejemplo paralelo italiano-español), coherente con la cobertura editorial 100% de las 9 categorías existentes
- [ ] **PRES-06**: Se incluyen ejercicios tipo `match` SOLO si el pareo NO es derivable por raíz (DESIGN RULE Phase 4 — p. ej. infinitivo↔grupo, verbo↔desinencia atípica); si todo el contenido es derivable por raíz (io→parlo), la categoría queda en multi-choice + word-buttons con 0 match (como Avere/Essere)
- [ ] **PRES-07**: Existen cruces multi-cat `presente-regolare` ↔ avere/essere (contraste con el passato prossimo) con cascada D-54 inmediata — fallar uno propaga el reset a las categorías cruzadas (patrón avere-300..305)

### Migración (MIG)

- [ ] **MIG-05**: `migrate9to10` + `hydrateV10` + `CURRENT_SCHEMA_VERSION=10` idempotentes (deep-clone anti-prototype-pollution), con reset selectivo SOLO del progreso de `presente-regolare`; las 9 categorías existentes quedan byte-intactas (verificado por fixture)
- [ ] **MIG-06**: `backup.js` soporta round-trip v10 + import v9→v10 con el reset selectivo aplicado + rechazo de wrappers con `schemaVersion > 10`

### Integración lockstep (INT)

- [ ] **INT-01**: Los counts hardcoded + `TOTAL_EXPECTED` quedan re-sincronizados (183 → 183 + N slots de la categoría nueva) en el reporter y en los tests
- [ ] **INT-02**: +1 entrada en el smoke paramétrico (validación de contenido + `CATEGORIES_WITH_EXPLANATIONS`) cubriendo la categoría nueva; suite verde completa, incluido `VAL_07_STRICT=1`

## Future Requirements

Diferidos a milestones futuros (no en este roadmap).

### Tiempos verbales (TENSE)

- **TENSE-X1..X4**: Pretérito imperfetto, Futuro semplice, Condizionale, Congiuntivo — conforme la profesora entregue material
- **REFLEX-01**: Verbi riflessivi (chiamarsi, svegliarsi, alzarsi…) — apoyado sobre el presente regular ya entregado en v1.7
- **MODAL-01**: Verbi modali (potere/volere/dovere + infinitivo)
- **PASSPROX-01**: Passato prossimo como categoría dedicada (elección de auxiliar + participio)

### Otros (backlog)

- **AUTHOR-01**: Autoría asistida de variantes (UI/proceso sin editar JSON a mano)
- **CATPROC-01/02**: Categorización asistida de frases de canciones
- **MUSIC-X1**: Más canciones
- Responsive móvil (si emerge dolor tras uso real)

## Out of Scope

Explícitamente excluido de v1.7. Documentado para evitar scope creep.

| Feature | Reason |
|---------|--------|
| Tocar el motor v1.4 (cascada D-54, sampler, slot-engine, render) | Brownfield puro: la categoría nueva se monta sobre la maquinaria existente sin reconstruir; cualquier cambio de motor sería un milestone aparte |
| Verbos irregulares en presente (andare, fare, venire, dire…) | v1.7 es SOLO regulares + la sub-regla -isc- + ortográficos; los irregulares son una categoría/milestone distinta |
| Otros tiempos (imperfetto, futuro, passato prossimo dedicado) | Diferidos a TENSE-X1..X4 / PASSPROX-01; v1.7 acota a presente indicativo regular |
| Verbi riflessivi y modali | Diferidos (REFLEX-01 / MODAL-01); se apoyan en el presente regular de v1.7 pero son categorías propias |
| Respuesta libre escribiendo la conjugación | Mantiene la decisión v1: los 3 tipos (multi-choice/word-buttons/match) bastan; la respuesta libre exige normalización compleja |

## Traceability

Qué fases cubren qué requisitos. Se rellena durante la creación del roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PRES-01 | TBD | Pending |
| PRES-02 | TBD | Pending |
| PRES-03 | TBD | Pending |
| PRES-04 | TBD | Pending |
| PRES-05 | TBD | Pending |
| PRES-06 | TBD | Pending |
| PRES-07 | TBD | Pending |
| MIG-05 | TBD | Pending |
| MIG-06 | TBD | Pending |
| INT-01 | TBD | Pending |
| INT-02 | TBD | Pending |
