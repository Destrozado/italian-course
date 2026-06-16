---
created: 2026-06-15T00:00:00.000Z
title: Validador de frases ES para canciones (doble validación, reglas propias)
area: tooling
files:
  - scripts/
  - src/data/schema-validator.js
  - content/songs/
---

## Problem

Las canciones (italiano→español troceado) NO pasan por ninguna validación semántica — solo por el validador estructural (`validateSongs`). Resultado: traducciones que no se entienden en español se cuelan (UAT 2026-06-15: `ti-dedico-il-silenzio-006` "hace tiempo que sabes pienso que ni el tiempo me basta" — sin sentido). Los ejercicios sí tienen quórum multi-modelo (gsd-validate-exercise, C1-C5/R1-R7), pero esas reglas son de ejercicio (opciones/distractores/leak/explanation) y NO aplican a canciones.

Hace falta un validador de frases de canción con **doble validación** (quórum) y **reglas PROPIAS**, que tenga en cuenta que las letras toman **licencias poéticas** que en un aprendizaje estricto no se aplicarían — pero exigiendo que el español tenga sentido y sea fiel al italiano.

## Solution

TBD — diseñar y construir, mirror de `gsd-validate-exercise` pero para canciones. Propuesta de partida:

**Reglas propias (S1-S5):**
- **S1 — Español natural y con sentido**: la traducción es gramatical y SE ENTIENDE como frase en español (el fallo que motivó esto). No tiene que ser literaria, pero no puede ser sin sentido ni agramatical.
- **S2 — Fidelidad con licencia**: transmite el significado del italiano; se ACEPTAN licencias poéticas/figuradas razonables (las canciones no son literales), pero NO contrasentidos ni omisiones que cambien el sentido.
- **S3 — Troceado correcto**: `answer` array de palabras, sin puntuación dentro de los tokens (salvo apóstrofo/guion interno), una palabra por token.
- **S4 — Ortografía/acentos RAE**: tildes y ñ correctas.
- **S5 — Prompt italiano fiel a la fuente**: el italiano coincide con la letra real del autor (sin alucinaciones/erratas), normalizado (sin caracteres no-latinos espurios — cf. la 'е' cirílica de Solo).

**Mecánica (decisiones a confirmar con el autor):**
- Quórum: 2 modelos distintos (Opus + Sonnet, como los ejercicios; cross-vendor Gemini/DeepSeek como complemento opcional).
- Granularidad: ¿1-por-frase (como VAL-03 de ejercicios, fresh context, evita deriva — pero 17-34 spawns/canción) o 1-por-canción (un pase revisa todas las frases y marca las problemáticas — más barato, algo más de deriva)?
- Almacenamiento: añadir campo `validation` opcional a cada frase de canción (espejo del de ejercicios: `{status, passes[]}`), con extensión del schema en `validateSongs` (hoy solo valida prompt/answer/distractors/categoryIds).
- Salida útil: cuando una frase falla S1/S2, que el verdict incluya una SUGERENCIA de traducción mejor (concerns), para corregir rápido.
- Skill `gsd-validate-song` (mirror de gsd-validate-exercise) + correr sobre las 3 canciones existentes (equilibrio-mentale, solo, ti-dedico-il-silenzio).

Nota: revisar el resto de traducciones de `ti-dedico-il-silenzio` y `solo` con este validador una vez exista (puede haber otras frases flojas).
