# Requirements: Italian Course — Milestone v1.4 (Variantes de ejercicio)

**Defined:** 2026-06-02
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, un fallo te devuelve a repetir la categoría entera.

**Milestone goal:** Matar la memorización por palabras introduciendo *slots* (1 por regla) con variantes intercambiables; un examen recorre N slots eligiendo 1 variante al azar en cada uno, manteniendo intacta la re-verificación D-54. Motor + piloto Preposiciones.

## v1.4 Requirements

### Modelo de datos slot+variantes (SLOT)

- [x] **SLOT-01**: El contenido define *slots*, donde cada slot representa una regla y contiene 1..N *variantes* intercambiables (cada variante = un payload jugable completo según el tipo: multiple-choice / word-buttons / match).
- [x] **SLOT-02**: La explicación pedagógica vive a nivel de slot (compartida por todas sus variantes), no por variante.
- [x] **SLOT-03**: Un slot puede tener exactamente 1 variante (excepciones concretas sin variante posible, p. ej. `in spiaggia`), y el sistema lo trata con normalidad.
- [x] **SLOT-04**: El schema validator valida la estructura slot+variantes y rechaza con banner visible el JSON malformado (slot sin variantes, variante sin payload válido, explicación ausente), coherente con el validator existente.
- [x] **SLOT-05**: Migración `schemaVersion 5→6` (`migrate5to6` + `hydrateV6`) idempotente con deep-clone defensivo; `backup.js` extendido a v6 para round-trip export/import.
- [x] **SLOT-06**: Las 8 categorías no-piloto siguen cargando y funcionando como slots de 1 variante sin re-autoría (backward-compat: cada ejercicio actual = 1 slot / 1 variante).

### Motor de examen por slots (EXAM)

- [x] **EXAM-01**: Al construir una sesión de una categoría, el motor recorre los N slots y selecciona 1 variante aleatoria por slot (nunca dos variantes del mismo slot en la misma sesión).
- [x] **EXAM-02**: "Categoría hecha" se redefine: pasar sin fallar 1 variante de cada uno de los N slots. El recuento "Ejercicios" del home refleja slots, no variantes.
- [x] **EXAM-03**: Fallar la variante de un slot dispara la cascada D-54 inmediata sobre las `categoryIds` del slot, reutilizando `applyResultToSession` sin nuevos call-sites de `applyImmediateFailure` (Pitfall #2).
- [x] **EXAM-04**: Al re-hacer una categoría tras fallo/reset, la selección aleatoria se reejecuta → pueden tocar variantes distintas a la pasada anterior (impide memorización por palabras).
- [x] **EXAM-05**: Racha de 21 días y promoción hecha→dominada operan sobre la categoría con la nueva definición de "hecha" por slots, sin cambiar la mecánica de racha.
- [x] **EXAM-06**: Repaso 20, Test completo y Modo Examen integran el muestreo por slot (GUARANTEE ≥1 slot por categoría elegida; sampler ponderado a nivel de slot).

### Piloto de contenido — Preposiciones (PILOT)

- [ ] **PILOT-01**: Los 57 ejercicios validados de Preposiciones se reagrupan en slots por regla (los que entrenan la misma regla reformulada pasan a ser variantes del mismo slot).
- [ ] **PILOT-02**: Se autoran variantes nuevas (patrón D-85: Claude propone → autor revisa → quórum R1-R7) donde tenga sentido; cada variante nueva pasa el quórum cross-vendor antes de entrar.
- [ ] **PILOT-03**: Se añade el slot de preposición locativa fija `in spiaggia / in montagna / al mare / in campagna` (hueco detectado: no estaba en ninguna categoría).
- [x] **PILOT-04**: Al migrar Preposiciones a slots, su progreso se resetea a no-hecha (racha 0); el resto de categorías conserva su progreso.
- [ ] **PILOT-05**: La estructura final de Preposiciones pasa el validator y el smoke test paramétrico (cobertura de explanations por slot preservada).

## Future Requirements

Diferidos a milestones futuros. Reconocidos pero no en el roadmap actual.

### Conversión del resto de categorías (CONV)

- **CONV-01**: Reestructurar las otras 8 categorías (Avere, Essere, Verbos-movimiento, Sustantivos-irregulares, Género-número, Profesiones, Articoli, Partitivos) a slots-por-regla + variantes, una por milestone incremental siguiendo el patrón validado en el piloto.

### Autoría asistida (AUTHOR)

- **AUTHOR-01**: UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Reestructurar las 8 categorías no-piloto en v1.4 | Acotar el milestone: validar el sistema con dolor real (Preposiciones) sin re-validar 372 ejercicios de golpe. Va a CONV-01 (futuro). |
| Explicación propia por variante | Decisión de diseño: variantes intercambiables comparten regla y explicación a nivel de slot (más simple de autorar/validar). |
| UI de autoría de variantes | JSON a mano sigue siendo suficiente; va a AUTHOR-01 (futuro). |
| Modo móvil responsive | Desktop primero, consistente con el resto del proyecto. |
| Preservar/mapear progreso viejo de Preposiciones al migrar | Reset es coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot. |

## Traceability

Qué fases cubren qué requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SLOT-01 | Phase 15 | Complete |
| SLOT-02 | Phase 15 | Complete |
| SLOT-03 | Phase 15 | Complete |
| SLOT-04 | Phase 15 | Complete |
| SLOT-05 | Phase 15 | Complete |
| SLOT-06 | Phase 15 | Complete |
| EXAM-01 | Phase 16 | Complete |
| EXAM-02 | Phase 16 | Complete |
| EXAM-03 | Phase 16 | Complete |
| EXAM-04 | Phase 16 | Complete |
| EXAM-05 | Phase 16 | Complete |
| EXAM-06 | Phase 16 | Complete |
| PILOT-01 | Phase 17 | Pending |
| PILOT-02 | Phase 17 | Pending |
| PILOT-03 | Phase 17 | Pending |
| PILOT-04 | Phase 17 | Complete |
| PILOT-05 | Phase 17 | Pending |

**Coverage:**
- v1.4 requirements: 17 total
- Mapped to phases: 17 (Phase 15: 6 SLOT · Phase 16: 6 EXAM · Phase 17: 5 PILOT)
- Unmapped: 0 ✓
- Orphans: 0 · Duplicados: 0 · Gaps: 0

---
*Requirements defined: 2026-06-02*
*Last updated: 2026-06-02 — roadmap creado (Phases 15-17). 17/17 mapped, 0 orphans.*
