# Phase 38: Verbi riflessivi - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 38-Verbi riflessivi
**Areas discussed:** Cue de género/número (pp-agreement), Pares ES↔IT mismatch (REFLEX-05), Mapa de slots / granularidad, Diseño de las 2 cruces (SC#4)

---

## Cue de género/número (pp-agreement, REFLEX-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Nombres propios + sujetos explícitos | Marco→-o, Maria→-a, i ragazzi→-i, le ragazze→-e; R1-safe, sin gloss | ✓ |
| Etiqueta explícita (femenino)/(plural) | Paréntesis gramatical; roza R1-leak | |
| Adjetivo/contexto en la frase | Concordancia indirecta vía adjetivo; puede añadir ruido/doble-validez | |

**User's choice:** Nombres propios + sujetos explícitos (Marco/Maria/i ragazzi/le ragazze).
**Notes:** Mirror EXACTO de `presente-regolare-301` (shipeado). El gloss ES no ayuda aquí (el español no concuerda el participio con el sujeto). Cada una de las 4 terminaciones -o/-a/-i/-e con su cue de sujeto; cero `avere`.

---

## Pares ES↔IT mismatch (REFLEX-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Trío del research | ammalarsi / dimenticarsi (di) / salire | ✓ |
| Solo 2 pares | Reducir a 2 (ammalarsi + salire) | |
| Otros pares (los indico) | sposarsi/arrabbiarsi/accorgersi… | |

**User's choice:** Trío del research — ammalarsi, dimenticarsi (di), salire.
**Notes:** Gloss ES obligatorio donde la reflexividad difiere (Pitfall 6/9, no leak). Verificar cada verbo vs español en el pre-commit R5. No fabricar mismatch con verbos que sí coinciden (chiamarsi/svegliarsi/alzarsi/arrabbiarsi).

---

## Mapa de slots / granularidad

| Option | Description | Selected |
|--------|-------------|----------|
| Guía + checkpoint del autor | Cobertura mínima aquí (REFLEX-01..05 + 2 cruces); mapa exacto aprobado en checkpoint:decision | ✓ |
| Fijar el mapa ahora | Definir los ~6-7 ids/tipos en CONTEXT sin checkpoint | |

**User's choice:** Guía + checkpoint del autor (patrón Phase 36/37).
**Notes:** 0-match heredado (pronombre↔persona mecánico, D-04/R3 lo prohíben) → MC + word-buttons. word-buttons obligatorio para la colocación del pronombre (REFLEX-02).

---

## Diseño de las 2 cruces (SC#4)

| Option | Description | Selected |
|--------|-------------|----------|
| 300↔presente-regolare, 301↔essere | 300 = presente sobre regular; 301 = pp con essere+concordancia | ✓ |
| Numeración invertida | 300 = pp↔essere, 301 = presente↔pr | |
| Lo decide el autor | ids/mapeo a discreción dentro de SC#4 | |

**User's choice:** riflessivi-300 ↔ presente-regolare (presente reflexivo sobre terminación regular); riflessivi-301 ↔ essere (pp con essere + concordancia).
**Notes:** Ambos al final del array, categoryIds de 2, reusan applyResultToSession (D-54 = 2 call-sites). riflessivi-301 análogo directo del shipeado presente-regolare-301.

## Claude's Discretion

- Nombres exactos de ids de slot (prefijo `riflessivi-`), nº final de slots, MC vs word-buttons por slot — aprobado en checkpoint:decision del autor (D-38-03).
- Estructura de plans (probable 1 track; posible ronda extra por el magnet pp-agreement).

## Deferred Ideas

- Reflexivos recíprocos (si amano / ci scriviamo) — A2+/B1, backlog de pronombres.
- Clíticos como contenido / modal+clítico — fuera de v1.9.
- Count-sync + TOTAL_EXPECTED + PROV-01 `origen` — Phase 39 (lockstep).
- Re-validación con quórum base Opus+Sonnet si la autoría corre vía executor sin Task subagents (pasada top-level posterior).
- Reviewed (not folded): todo "Responsive móvil" (score 0.9) — falso positivo de matcher; trabajo CSS ajeno a autoría de contenido JSON.
