# Requirements: Italian Course — Milestone v1.5 (Conversión a slots: Bloque Artículos)

**Defined:** 2026-06-04
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, un fallo te devuelve a repetir la categoría entera.

**Milestone goal:** Continuar CONV-01 de forma incremental: convertir Articoli y Partitivi al modelo slot+variantes (reagrupar por regla + autorar variantes nuevas por quórum cross-vendor), demostrando que el patrón del piloto Preposiciones (Phase 17 / v1.4) escala a las categorías de mejor encaje, sin tocar el motor v1.4.

## v1.5 Requirements

### Articoli a slots (ART)

- [ ] **ART-01**: Los 56 ejercicios de Articoli se reagrupan en slots por regla — determinativi por disparador fonético (il/i; lo/gli ante s+cons/z/gn/ps/x/y/i+vocal; l'/gli ante vocal; la/le) e indeterminativi como slots propios; los ejercicios que entrenan la misma regla reformulada pasan a ser variantes del mismo slot.
- [ ] **ART-02**: Se autoran variantes nuevas (patrón D-85: Claude propone → autor revisa → quórum cross-vendor R1-R7) en los slots de Articoli cuya regla admite reformulación; cada variante nueva pasa el quórum antes de entrar. Los huecos de regla detectados durante la autoría se añaden como slots nuevos.
- [ ] **ART-03**: Los indeterminativi (un/uno/una/un') quedan como slots propios dentro de Articoli con sus reglas de selección (uno ante s+cons/z/gn/ps/x/y/i+vocal; un' ante femenino+vocal) — recoge el espíritu del todo cerrado el 2026-06-03, sin crear categoría nueva.
- [ ] **ART-04**: La estructura final de Articoli pasa el validator y el smoke paramétrico (con los hardcodes de count re-sincronizados al nº real de slots, como en D-17-04), con la cobertura de explanations a nivel de slot preservada.

### Partitivi a slots (PART)

- [ ] **PART-01**: Los 44 ejercicios de Partitivi se reagrupan en slots por regla — del-formas por disparador fonético + eje contable/incontable + alternativas (qualche/alcuni/un po' di) + omisión en negativa + distinción partitivo-vs-preposizione articolata.
- [ ] **PART-02**: Se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) en los slots de Partitivi cuya regla admite reformulación; cada variante nueva pasa el quórum antes de entrar. Los huecos detectados durante la autoría se añaden como slots nuevos.
- [ ] **PART-03**: La estructura final de Partitivi pasa el validator y el smoke paramétrico (counts re-sincronizados), con la cobertura de explanations a nivel de slot preservada.

### Migración + datos (MIG)

- [ ] **MIG-01**: Migración `schemaVersion 7→8` (`migrate7to8` + `hydrateV8`) idempotente y con deep-clone defensivo; resetea el progreso SOLO de `articoli` + `partitivos` (categoryProgress + exerciseStats por prefijo + inFlightTest), racha a 0; las otras 7 categorías conservan su progreso byte-intacto.
- [ ] **MIG-02**: `backup.js` extendido a round-trip v8 (export v8 reimportable); el import de un backup v7 migra a v8 reseteando articoli+partitivos, y los >8 se rechazan (forward-compat).

## Future Requirements

Diferidos a milestones futuros. Reconocidos pero no en el roadmap actual.

### Conversión del resto de categorías (CONV)

- **CONV-01 (cont.)**: Convertir las 6 categorías restantes a slots+variantes en milestones incrementales: verbos (Avere, Essere, Verbi di movimento) y morfología (Sostantivi irregolari, Genere e numero, Professioni). Para las léxicas puras (Sostantivi irregolari, Professioni) se evaluará entonces si el modelo slot+variantes aporta valor o si quedan como slots-de-1 reagrupados.

### Autoría asistida (AUTHOR)

- **AUTHOR-01**: UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Convertir las 6 categorías restantes en v1.5 | Acotar el milestone y mantener la conversión incremental (un bloque por milestone), como validó el piloto. Va a CONV-01 cont. (futuro). |
| Explicación propia por variante | Decisión de diseño v1.4 (SLOT-02): variantes intercambiables comparten regla y explicación a nivel de slot. |
| UI de autoría de variantes | JSON a mano + quórum sigue siendo suficiente; va a AUTHOR-01 (futuro). |
| Crear una categoría "indeterminados" separada | Los indeterminativi quedan como slots propios dentro de Articoli (ART-03); no hace falta categoría nueva (todo cerrado 2026-06-03). |
| Preservar/mapear progreso viejo de articoli/partitivos al migrar | Reset es coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot (mismo criterio que PILOT-04 en v1.4). |
| Tocar el motor de examen, el sampler o la cascada D-54 | El motor slot-aware está DONE en v1.4; v1.5 es puro contenido + migración sobre la maquinaria existente. |

## Traceability

Qué fases cubren qué requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIG-01 | Phase 18 | Pending |
| MIG-02 | Phase 18 | Pending |
| ART-01 | Phase 19 | Pending |
| ART-02 | Phase 19 | Pending |
| ART-03 | Phase 19 | Pending |
| ART-04 | Phase 19 | Pending |
| PART-01 | Phase 20 | Pending |
| PART-02 | Phase 20 | Pending |
| PART-03 | Phase 20 | Pending |

**Coverage:**
- v1.5 requirements: 9 total (4 ART + 3 PART + 2 MIG)
- Mapped to phases: 9/9 (100%) — MIG→Phase 18 (2); ART→Phase 19 (4); PART→Phase 20 (3)
- Unmapped: 0 (0 orphans, 0 duplicados, 0 gaps)

**Mapping rationale:**
- **Phase 18 (Migración 7→8)** ← MIG-01 (migrate7to8/hydrateV8 reset selectivo articoli+partitivos), MIG-02 (backup.js round-trip v8). Va PRIMERA porque la renumeración de ids de las fases de contenido no se puede hacer con progreso vivo (mismo criterio que el plan 17-01 del piloto).
- **Phase 19 (Articoli a slots)** ← ART-01 (reagrupar 56 ejercicios por regla), ART-02 (variantes nuevas por quórum + huecos → slots), ART-03 (indeterminativi como slots propios), ART-04 (validator + smoke + counts + explanations a nivel de slot). Depende de Phase 18.
- **Phase 20 (Partitivi a slots)** ← PART-01 (reagrupar 44 ejercicios por regla), PART-02 (variantes nuevas por quórum + huecos → slots), PART-03 (validator + smoke + counts + explanations a nivel de slot). Depende de Phase 18; independiente de Phase 19 tras la migración.

---
*Requirements defined: 2026-06-04*
*Traceability mapped: 2026-06-04 — 9/9 requirements mapped to Phases 18-20, 0 orphans.*
