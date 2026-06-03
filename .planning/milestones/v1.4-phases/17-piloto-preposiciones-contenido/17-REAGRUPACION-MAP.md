# Phase 17 — Mapa de Reagrupación de Preposiciones (id-fuente → slot)

**Producido:** 2026-06-03 (Plan 17-02, Task 1)
**Fuente de verdad:** los 52 ejercicios reales de `content/exercises/preposiciones.json` (leídos íntegros — campo `notes` declara la regla/forma de cada uno) + RESEARCH §Reagrupación Mapping + CONTEXT §decisions (D-17-01..05).
**Naturaleza:** artefacto de auditoría para revisión del autor (checkpoint:decision) ANTES de reescribir el JSON.

> **Alcance de ESTA reagrupación:** solo se reagrupan los **52 ejercicios existentes** a slots por regla/forma, fusionando los duplicados de forma confirmados (D-17-03). **NO** se autoran variantes nuevas (eso es 17-03, PILOT-02) ni se añaden los slots locativos nuevos `in spiaggia`/`al mare` (eso es 17-03, PILOT-03). Las superficies existentes se **mueven intactas** a `variants[]` (cambio de contenedor → NO re-validación, Claude's Discretion).

---

## Esquema de id de slot (Claude's Discretion, D-15-09)

Como el progreso de Preposiciones se resetea (D-17-08, ya ejecutado en Plan 17-01), la estabilidad de ids legacy **no importa**. Se elige un esquema **semántico limpio**: `preposiciones-{forma}` para articolate y formas simples con superficie clara, `preposiciones-{regla}` cuando la forma sola sería ambigua (di tiene 3 reglas distintas → `preposiciones-di-origen`, `preposiciones-di-posesso`, `preposiciones-di-materia`). Unicidad garantizada (sin colisiones).

---

## Bloque A — Preposiciones SEMPLICI (regla pedagógica = 1 slot, D-17-01)

| Slot-id propuesto | Regla / forma | Ids-fuente | ¿Fusión? | Explanation-base + matices a injertar (D-17-05) |
|-------------------|---------------|-----------|----------|--------------------------------------------------|
| `preposiciones-di-origen` | `di` = origen/identidad estable | 001 | singleton | Base = 001 (única). Conserva el contraste con Da (punto de partida) y A (ubicación actual) que ya trae. |
| `preposiciones-a-casa` | `a` = dirección con `casa` (excepción idiomática) | 002 | singleton | Base = 002 (única). Conserva el pitfall hispanohablante ("en casa"→In erróneo). |
| `preposiciones-da-provenienza` | `da` = provenienza del movimiento | 003 | singleton | Base = 003 (única). Conserva el contraste con Di (origen estable). |
| `preposiciones-in-paese` | `in` = luogo (paesi/regioni) | 004 | singleton | Base = 004 (única). Conserva contraste città (A) vs paese (In). |
| `preposiciones-con-compagnia` | `con` = compagnia | 005 | singleton | Base = 005 (única). |
| `preposiciones-per-scopo` | `per` = scopo/finalidad (+infinitivo) | 007 | singleton | Base = 007 (única). |
| `preposiciones-tra-futuro` | `tra`/`fra` = tempo futuro | **008 + 049** | **FUSIÓN (2)** — ⚠️ **PUNTO DE CONFIRMACIÓN DEL AUTOR (Open Q A1)** | Base = **049** (la más completa: explica "dentro de", descarta Da/In/Per, **y añade la nota eufónica tra/fra ante 'tr-'**). Injertar de 008: la afirmación explícita de que "Tra y Fra son sinónimos intercambiables". Variantes: `___ due giorni parto` (tra, de 008) + `___ tre giorni partiamo per Roma` (fra, de 049). **Ver nota tra/fra abajo.** |
| `preposiciones-per-durata` | `per` = durata ("per due ore") | 009 | singleton | Base = 009 (única). Conserva el ancla temporal "ieri" + descarte de "da due ore"/"in due ore". |
| `preposiciones-di-posesso` | `di` = posesso con nombre propio (sin contracción) | **010 + 012** | **FUSIÓN (2)** — confirmada D-17-03 (misma regla: di no se contrae ante nombre propio) | Base = **010** (más general: "Di indica posesso/pertenencia; ante nombre propio Di nunca se contrae"). Injertar de 012: el ejemplo del contraste con el español ("la Maria"/"della Maria" no existen) que refuerza el pitfall. Variantes: `Il libro ___ Marco` (010) + `La macchina ___ Maria è rossa` (012). |
| `preposiciones-a-ciudad` | `a` = direzione con ciudad | 016 | singleton | Base = 016 (única). Pareja pedagógica con `in-paese`; conserva el contraste città (A) vs paese (In). |
| `preposiciones-a-hora` | `a` = tempo (la hora) | 017 | singleton | Base = 017 (única). |
| `preposiciones-da-agente` | `da` = agente (pasiva) | 018 | singleton | Base = 018 (única). Conserva el gloss "por él" + descarte de Per. |
| `preposiciones-in-trasporto` | `in` = mezzo di trasporto cerrado | 019 | singleton | Base = 019 (única). Conserva el pitfall "con coche"→con erróneo. |
| `preposiciones-su-argomento` | `su` = argomento (sobre/tema) | 020 | singleton | Base = 020 (única). Conserva la nota di/su doble-validez + gloss "sobre". |
| `preposiciones-con-strumento` | `con` = mezzo/strumento (instrumental) | 050 | singleton | Base = 050 (única). Conserva la distinción con compagnia (005). |
| `preposiciones-di-materia` | `di` = materia en colocación fija ("esame di…") | 051 | singleton | Base = 051 (única). Conserva el contraste esame (solo di) vs libro (di/su). |
| `preposiciones-da-encasade` | `da` = "en/a casa de" con personas | 052 | singleton | Base = 052 (única). Conserva el gloss "por tu casa" + descarte de Per. |

**Subtotal Bloque A:** 19 ids-fuente → **17 slots** (2 fusiones: tra/fra −1 *sujeto a confirmación*, di-posesso −1).

### ⚠️ Nota TRA/FRA (008 + 049) — punto de confirmación del autor (Open Q A1)

- Ambos ejercicios entrenan la **misma regla pedagógica**: `tempo futuro` ("dentro de cuánto"). 008 usa la forma `tra` ("tra due giorni"), 049 usa la forma `fra` ("fra tre giorni", eufónica ante `tr-`).
- Las propias explanations de ambos ejercicios afirman que **tra y fra son sinónimos intercambiables** (008: "Tra y Fra son sinónimos intercambiables según el PDF"; 049: "Fra (sinónimo de Tra)…").
- **Lectura D-17-01 (regla pedagógica, recomendada):** son la MISMA regla → **1 slot, 2 variantes**. tra/fra NO son preposiciones articolate distintas (D-17-02 aplica a articolate), sino sinónimos eufónicos de la misma preposición simple. Esta es la opción del checkpoint **`tra-fra-fusion`** (recomendada por la investigación).
- **Lectura alternativa (por forma):** 2 slots de 1. Opción del checkpoint **`tra-fra-split`**.
- **Impacto en el conteo:** fusión → 1 slot menos (47 slots); split → 2 slots (48 slots). El mapa de abajo asume **fusión** salvo que el autor decida lo contrario en el checkpoint.

---

## Bloque B — Preposiciones ARTICOLATE (1 slot por forma, D-17-02; fusión de duplicados de forma, D-17-03)

| Slot-id propuesto | Forma | Ids-fuente | ¿Fusión? | Explanation-base + matices a injertar (D-17-05) |
|-------------------|-------|-----------|----------|--------------------------------------------------|
| `preposiciones-sul` | `su+il` = sul | **006 + 013 + 043** | **FUSIÓN (3)** — confirmada D-17-03 | Base = **006** (la más general: enuncia la regla "Su sobre/encima con contacto, Su+Il=Sul" + el patrón paralelo Su+La=Sulla, Su+Le=Sulle). Injertar de 013: el contraste **Sul (superficie) vs Nel (interior)** ("Nel implicaría dentro de"). De 043: el matiz de que la regla **se repite en contextos distintos** (mesa, pupitre). Variantes: `Il gatto è ___ tavolo` (006) + `Le chiavi sono ___ tavolo` (013) + `Il quaderno è ___ banco` (043). |
| `preposiciones-al` | `a+il` = al | **011 + 015** | **FUSIÓN (2)** — confirmada D-17-03 | Base = **011** (más general: "A+Il=Al, error A1 típico = usar A sola"). Injertar de 015: el matiz idiomático **"parlare al telefono"** (locución fija que también exige la contracción). Variantes: `Andiamo ___ cinema` (011) + `Parlo ___ telefono` (015). |
| `preposiciones-del` | `di+il` = del | 021 | singleton | Base = 021 (única). Conserva el paralelo con el español "del". |
| `preposiciones-dello` | `di+lo` = dello | 022 | singleton | Base = 022 (única). Conserva la regla del artículo Lo (s+cons/z/gn/ps/x). |
| `preposiciones-della` | `di+la` = della | 023 | singleton | Base = 023 (única). |
| `preposiciones-dei` | `di+i` = dei | 024 | singleton | Base = 024 (única). |
| `preposiciones-degli` | `di+gli` = degli | 025 | singleton | Base = 025 (única). |
| `preposiciones-delle` | `di+le` = delle | 026 | singleton | Base = 026 (única). |
| `preposiciones-nel` | `in+il` = nel | 027 | singleton | Base = 027 (única). Conserva el contraste Nel (interior) vs Sul (superficie) + gloss "dentro". |
| `preposiciones-nello` | `in+lo` = nello | 028 | singleton | Base = 028 (única). |
| `preposiciones-nella` | `in+la` = nella | 029 | singleton | Base = 029 (única). Conserva el contraste con In sin artículo para paesi. |
| `preposiciones-nei` | `in+i` = nei | 030 | singleton | Base = 030 (única). |
| `preposiciones-negli` | `in+gli` = negli | 031 | singleton | Base = 031 (única). Conserva el matiz contenedor (penne/astucci). |
| `preposiciones-nelle` | `in+le` = nelle | 032 | singleton | Base = 032 (única). Conserva el matiz contenedor (cornici) + nota Sulle pareti. |
| `preposiciones-allo` | `a+lo` = allo | 033 | singleton | Base = 033 (única). |
| `preposiciones-alla` | `a+la` = alla | 034 | singleton | Base = 034 (única). |
| `preposiciones-ai` | `a+i` = ai | 035 | singleton | Base = 035 (única). |
| `preposiciones-agli` | `a+gli` = agli | 036 | singleton | Base = 036 (única). |
| `preposiciones-alle` | `a+le` = alle | 037 | singleton | Base = 037 (única). Conserva el gloss "a mis amigas" + descarte de delle. |
| `preposiciones-dal` | `da+il` = dal | 038 | singleton | Base = 038 (única). |
| `preposiciones-dallo` | `da+lo` = dallo | 039 | singleton | Base = 039 (única). |
| `preposiciones-dai` | `da+i` = dai | 040 | singleton | Base = 040 (única). Conserva el matiz celda `i` (consonante normal) vs `gli`. |
| `preposiciones-dagli` | `da+gli` = dagli | 041 | singleton | Base = 041 (única). |
| `preposiciones-dalle` | `da+le` = dalle | 042 | singleton | Base = 042 (única). |
| `preposiciones-dalla` | `da+la` = dalla | 014 | singleton | Base = 014 (única). Conserva el gloss "desde la estación" + descarte de alla. |
| `preposiciones-sullo` | `su+lo` = sullo | 044 | singleton | Base = 044 (única). |
| `preposiciones-sulla` | `su+la` = sulla | 045 | singleton | Base = 045 (única). |
| `preposiciones-sui` | `su+i` = sui | 046 | singleton | Base = 046 (única). Conserva el matiz superficie vertical (cuadros/muros). |
| `preposiciones-sugli` | `su+gli` = sugli | 047 | singleton | Base = 047 (única). Conserva el matiz posarsi (su) vs cadere (da). |
| `preposiciones-sulle` | `su+le` = sulle | 048 | singleton | Base = 048 (única). |

**Subtotal Bloque B:** 33 ids-fuente → **30 slots** (2 fusiones: sul 3→1 = −2, al 2→1 = −1).

---

## Bloque C — Slots NUEVOS locativos (PILOT-03)

**OUT OF SCOPE de este plan (17-02).** Los slots `preposiciones-loc-in` (`in spiaggia`/`in montagna`/`in campagna`) y `preposiciones-al-mare` (`al mare`) se añaden en **17-03** (PILOT-03), porque requieren autoría de variantes nuevas que pasan el quórum cross-vendor (D-17-07). Se documentan aquí solo para constancia; **no entran en el conteo de este plan**.

---

## Cobertura de los 52 ids fuente (verificación 1:1, T-17-05)

Cada id 001-052 aparece **exactamente una vez** como id-fuente arriba:

- **Singletons (43):** 001,002,003,004,005,007,009,014,016,017,018,019,020,021,022,023,024,025,026,027,028,029,030,031,032,033,034,035,036,037,038,039,040,041,042,044,045,046,047,048,050,051,052.
- **Fusión SUL (3):** 006, 013, 043.
- **Fusión AL (2):** 011, 015.
- **Fusión DI-posesso (2):** 010, 012.
- **Fusión TRA/FRA (2) — sujeta a confirmación:** 008, 049.

Total: 43 + 3 + 2 + 2 + 2 = **52** ✓ (cobertura completa, sin pérdida ni duplicado).

---

## Conteo de slots resultante de ESTA reagrupación (sin slots nuevos ni variantes nuevas)

| Bloque | Ids-fuente | Slots |
|--------|-----------|-------|
| A (semplici) | 19 | 17 (con fusión tra/fra) / 18 (sin fusión tra/fra) |
| B (articolate) | 33 | 30 |
| **Total** | **52** | **47** (con tra/fra fusionado) / **48** (con tra/fra separado) |

**Reducción:** 52 → 47 slots = 5 fusiones (SUL −2, AL −1, DI-posesso −1, TRA/FRA −1), **si el autor aprueba la fusión tra/fra**. Si el autor elige `tra-fra-split`, el resultado es **48 slots** (4 fusiones).

> Los slots locativos nuevos (Bloque C, +2) y las variantes autoradas nuevas son de 17-03 → el conteo final del JSON tras 17-03 será **~49-50 slots**. Los 3 hardcodes `expected: 52` de los tests se sincronizan en 17-04 contra ese conteo final real, NO contra el de este plan.

---

## Decisiones que el autor debe confirmar en el checkpoint

1. **tra/fra (008 + 049):** ¿`tra-fra-fusion` (1 slot, 2 variantes — recomendado, D-17-01) o `tra-fra-split` (2 slots de 1)?
2. **Mapa de slots:** ¿Aprueba los 47 (o 48) slots con sus ids semánticos propuestos?
3. **Merges de explanation (D-17-05):** ¿Aprueba las bases elegidas + matices a injertar para los 4 slots fusionados (sul, al, di-posesso, tra/fra)?
