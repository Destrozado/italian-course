# Requirements: Italian Course — Milestone v1.6 (Conversión a slots: categorías restantes)

**Defined:** 2026-06-05
**Core Value:** Que el sistema te obligue a no olvidar — re-verificación constante por categoría, un fallo te devuelve a repetir la categoría entera.

**Milestone goal:** Cerrar CONV-01 convirtiendo las 6 categorías que aún quedan en formato legacy `payload` al modelo slot+variantes (una fase por categoría), dejando las 9 categorías de gramática en un único formato unificado — replicando el patrón validado en Phases 17/19/20, sin tocar el motor.

## v1.6 Requirements

### Migración + datos (MIG)

- [ ] **MIG-03**: Migración `schemaVersion 8→9` (`migrate8to9` + `hydrateV9`) idempotente y con deep-clone defensivo; resetea el progreso SOLO de las 6 categorías a convertir (`avere`, `essere`, `verbos-movimiento`, `genero-numero`, `profesiones`, `sustantivos-irregulares` — categoryProgress + exerciseStats por prefijo + inFlightTest, racha a 0) mediante un predicado de 6 prefijos; las 3 ya convertidas (`preposiciones`, `articoli`, `partitivos`) conservan su progreso byte-intacto.
- [ ] **MIG-04**: `backup.js` extendido a round-trip v9 (export v9 reimportable); el import de un backup v8 migra a v9 reseteando las 6 categorías, y los `>9` se rechazan (forward-compat).

### Avere a slots (AVE) — 23 ejercicios

- [ ] **AVE-01**: Los 23 ejercicios de Avere se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke paramétrico con los hardcodes de count re-sincronizados al nº real de slots leído del JSON.
- [ ] **AVE-02**: Se autoran variantes nuevas (patrón D-85: Claude propone → autor revisa → quórum cross-vendor R1-R7) donde la regla admite reformulación; cada variante nueva pasa el quórum antes de entrar; los huecos de regla detectados → slots nuevos.

### Essere a slots (ESS) — 39 ejercicios

- [ ] **ESS-01**: Los 39 ejercicios de Essere se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke paramétrico con los counts re-sincronizados al nº real de slots.
- [ ] **ESS-02**: Se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) donde la regla admite reformulación; cada variante pasa el quórum antes de entrar; huecos → slots nuevos.

### Verbi di movimento a slots (MOV) — 37 ejercicios

- [ ] **MOV-01**: Los 37 ejercicios de Verbi di movimento se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke con los counts re-sincronizados al nº real de slots.
- [ ] **MOV-02**: Se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) donde la regla admite reformulación; cada variante pasa el quórum antes de entrar; huecos → slots nuevos.

### Genere e numero a slots (GEN) — 40 ejercicios

- [ ] **GEN-01**: Los 40 ejercicios de Genere e numero se reagrupan en slots por regla con explanation a nivel de slot; la estructura final pasa el validator y el smoke con los counts re-sincronizados al nº real de slots.
- [ ] **GEN-02**: Se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) donde la regla admite reformulación; cada variante pasa el quórum antes de entrar; huecos → slots nuevos.

### Professioni a slots (PROF) — 51 ejercicios (léxica)

- [ ] **PROF-01**: Los 51 ejercicios de Professioni se reagrupan en slots con explanation a nivel de slot. **Decisión de discuss/plan:** evaluar si hay regla-con-variantes natural (p.ej. femenino de profesiones por terminación) o si conviene dejarlos como slots-de-1 reagrupados — categoría léxica, no toda celda tiene variantes intercambiables. La estructura final pasa el validator y el smoke con los counts re-sincronizados.
- [ ] **PROF-02**: Donde exista regla-con-variantes, se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) que pasan el quórum antes de entrar; si la categoría queda como slots-de-1, se documenta explícitamente que no aplica autoría de variantes.

### Sostantivi irregolari a slots (SOST) — 31 ejercicios (léxica)

- [ ] **SOST-01**: Los 31 ejercicios de Sostantivi irregolari se reagrupan en slots con explanation a nivel de slot. **Decisión de discuss/plan:** evaluar si hay regla-con-variantes natural (p.ej. patrones de plural irregular) o si conviene dejarlos como slots-de-1 reagrupados. La estructura final pasa el validator y el smoke con los counts re-sincronizados.
- [ ] **SOST-02**: Donde exista regla-con-variantes, se autoran variantes nuevas (D-85 + quórum cross-vendor R1-R7) que pasan el quórum antes de entrar; si la categoría queda como slots-de-1, se documenta explícitamente que no aplica autoría de variantes.

## Future Requirements

Diferidos a milestones futuros. Reconocidos pero no en el roadmap actual.

### Autoría asistida (AUTHOR)

- **AUTHOR-01**: UI o proceso asistido para autorar/revisar variantes de un slot sin editar JSON a mano.

### Más contenido / tiempos verbales (TENSE)

- **TENSE-X1..X4**: Categorías nuevas conforme la profesora entregue material (Pretérito imperfetto / Futuro semplice / Condizionale / Congiuntivo).

### Bridges multi-categoría (BRIDGE)

- **PART-X1**: Bridges multi-categoría Partitivos ↔ género-número / sustantivos.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Forzar slot+variantes en categorías léxicas que no lo admiten | Para Professioni y Sostantivi irregolari, si no hay regla-con-variantes natural, quedan como slots-de-1 reagrupados (decisión por categoría en discuss/plan). El valor es el formato unificado, no inventar variantes artificiales. |
| Explicación propia por variante | Decisión de diseño v1.4 (SLOT-02): variantes intercambiables comparten regla y explicación a nivel de slot. |
| UI de autoría de variantes | JSON a mano + quórum sigue siendo suficiente; va a AUTHOR-01 (futuro). |
| Preservar/mapear progreso viejo al migrar | Reset selectivo es coherente con el Core Value y mucho más simple que mapear estado ejercicio→slot (mismo criterio que MIG-01 en v1.5 y PILOT-04 en v1.4). |
| Tocar el motor de examen, el sampler, la cascada D-54 o el loader | El motor slot-aware está DONE desde v1.4; v1.6 es puro contenido + migración sobre la maquinaria existente. |
| Convertir el bloque Canciones a slot+variantes | Canciones es un modo standalone (traducción frase a frase), fuera del modelo de categorías de gramática. |

## Traceability

_(Pendiente — la rellena el roadmapper al crear el roadmap. Mapeo esperado: MIG-03/04 → fase de migración; AVE/ESS/MOV/GEN/PROF/SOST → 1 fase de conversión por categoría.)_

---
*Requirements defined: 2026-06-05*
