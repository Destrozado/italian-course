---
phase: quick-260715-1vm
plan: 01
subsystem: content-canciones
tags: [songs, content, quorum, S1-S6, disputed-resolution, brownfield]
status: complete
provides:
  - "Canción spari-sul-petto jugable con 51 phrases validadas por quórum cross-vendor"
affects:
  - "content/songs.json (índice) — nueva entrada spari-sul-petto (phraseCount 51)"
key-files:
  created:
    - content/songs/spari-sul-petto.json
  modified:
    - content/songs.json
decisions:
  - "51 phrases: estribillos repetidos incluidos verbatim cada vez (convención del corpus tipo cuore-di-plastica; las líneas idénticas repetidas se validan por separado, no se copia el bloque validation)."
  - "answer tokenizado sin puntuación por diseño (S3); español acentuado RAE (S4)."
  - "2 líneas del pegado normalizadas per PLAN: 033 'Resta e un punto nero…' → 'Resta un punto nero nel centro'; 039 'C'è una pittura astratta vedi si questa parete' → 'C'è una pittura astratta, vedi, su questa parete'."
  - "015 disputed resuelto por JUICIO HUMANO (calidad > tokens, sin override-atajo): Gemini marcó [S6-naturalidad] que 'respira de mi respiro' calca el italiano 'dal'. Se ADOPTÓ su sugerencia (de → con): 'respira con mi respiro'. La traducción se corrigió de verdad y se re-validó — no se forzó el flag."
  - "Ruta de vendors: DeepSeek primario; para las 11 frases que Gemini rate-limiteó (429) se usó deepseek-reasoner como 2º by distinto — patrón dominante del corpus (355 phrases usan deepseek-chat + deepseek-reasoner)."
  - "015 final: tras el fix de-→con y con la cuota diaria de Gemini agotada, se descartó el pase Gemini OBSOLETO (juzgaba el texto 'de' ya borrado) y la frase reposa sobre deepseek-chat + deepseek-reasoner (ambos correcta sobre el texto 'con') — mismo patrón 2-vendor que 355 frases del corpus. Decisión confirmada por el autor."
metrics:
  completed: "2026-07-15"
  tasks: 1
  files: 2
  phrases: 51
  disputed_resolved: 1
  api_passes: "~55 (DeepSeek chat/reasoner + Gemini, con fallback por rate-limit)"
---

# Spari sul petto — Ultimo (quick-260715-1vm)

Añadida la canción `spari-sul-petto` al bloque Canciones: **51 phrases**, prompt
italiano limpio + answer español tokenizado sin puntuación. Entrada en
`content/songs.json` (phraseCount 51). Reanudación de una quick task que quedó a
medias (18/51 validadas, 4 disputed, sin commitear).

## Validación — 51/51 `validated`

Quórum cross-vendor 1-por-1 (`scripts/validate-song-pass.mjs`), reglas S1-S6:

- **Coros no validados (22)** → DeepSeek + Gemini. Cierran `validated`.
- **Pending (7)** → 2º pase; los que Gemini rate-limiteó cerraron con
  `deepseek-reasoner`.
- **Disputed (4)** → re-pase del disidente (Gemini). 012/017/031 eran **ruido**
  (Gemini se retractó a `correcta` al re-evaluar). Solo **015** persistió.

## Resolución de 015 (juicio humano, sin atajo)

- Objeción real y repetida de Gemini: `[S6-naturalidad]` "respira **de** mi
  respiro" calca el italiano `dal`; sugerencia "respira **con** mi respiro".
- deepseek-chat y deepseek-reasoner daban `correcta` (2-vs-1).
- **Decisión del autor:** adoptar `de → con`. La traducción se **corrigió** y se
  re-validó; no fue un override del flag.
- Con la cuota diaria de Gemini agotada (429 persistente), 015 quedó `validated`
  sobre **deepseek-chat + deepseek-reasoner** (ambos `correcta` sobre el texto
  `con`) — el patrón 2-vendor dominante del corpus. El pase Gemini obsoleto
  (juzgaba el texto `de` ya borrado) se descartó.

## Verificación

- `node --test tests/*.test.js` → **649 pass / 0 fail**.
- Integridad `deriveStatus`: 51/51 stored == derived, **0 mismatches**.
- Registro `content/songs.json`: phraseCount 51 == phrases.length.

## Pendiente opcional (no bloqueante)

Si se quiere el estado 3-vendor "gold" en 015, re-correr Gemini tras el reset de
cuota (~medianoche PT): `node scripts/validate-song-pass.mjs spari-sul-petto-015
--model=gemini-2.5-flash --avoid=deepseek-chat,deepseek-reasoner --write`.
Confirmará `correcta` (fue su propia sugerencia) y añadirá el 3er by.
