---
quick_id: 260727-dcy
type: execute
wave: 1
depends_on: []
autonomous: true
files_modified:
  - content/songs/equilibrio-mentale.json
  - content/songs/ti-dedico-il-silenzio.json
  - content/songs/cuore-di-plastica.json
  - content/songs/solo.json
  - content/songs/22-settembre.json
  - content/songs/bella-davvero.json
  - content/songs/sul-finale.json
  - content/songs/la-stella-piu-fragile.json
  - content/songs/buongiorno-vita.json
  - content/songs/sogni-appesi.json
  - .planning/STATE.md
must_haves:
  truths:
    - "Las 14 canciones del corpus tienen decoyBank en TODAS sus frases: el modo 'decoradores agrupados' queda disponible en todo el bloque Canciones (hoy solo en 4 de 14)."
    - "Cada frase única lleva decoyBank = { distractors: string[3-4], pos: {token: posKey} } con POS de TODO token de answer y de TODO decoy (D1), POS lingüísticamente correcta (D2), decoys inequívocamente incorrectos y NO sinónimos válidos (D3), plausibles/tentadores (D4) y con ortografía RAE (D5)."
    - "decoyBank.validation.status === 'validated' en las 441 frases: quórum de 2 pases con `by` DISTINTOS, ambos `correcta`, cero `incorrecta` (deriveStatus sticky)."
    - "El bloque `validation` de la TRADUCCIÓN (phrase.validation) queda intacto y validated en las 441 frases — este task no toca traducciones."
    - "Los duplicados (estribillos verbatim) reciben el decoyBank del representante por propagación, no por re-validación."
    - "node --test tests/*.test.js verde; regresión cero en modo clásico y en las 4 canciones ya convertidas."
  artifacts:
    - path: "content/songs/sogni-appesi.json"
      provides: "decoyBank validado en las 84 frases (56 únicas) — la canción más larga."
      contains: "decoyBank"
    - path: "content/songs/equilibrio-mentale.json"
      provides: "decoyBank validado en las 17 frases (17 únicas)."
      contains: "decoyBank"
---

# Quick Task 260727-dcy: decoyBank para las 10 canciones restantes

## Objetivo
Convertir al **modo decoradores agrupados** las 10 canciones que hoy solo tienen modo
clásico, autorando y validando su `decoyBank`. Es el **Paso 8** del skill `it-add-song`
aplicado retroactivamente al corpus previo al modo agrupado (quick-260715-hf5).

## Alcance

| Canción | Frases | Únicas |
|---|---|---|
| equilibrio-mentale | 17 | 17 |
| ti-dedico-il-silenzio | 32 | 23 |
| cuore-di-plastica | 50 | 24 |
| solo | 34 | 26 |
| 22-settembre | 37 | 27 |
| bella-davvero | 37 | 30 |
| sul-finale | 49 | 32 |
| la-stella-piu-fragile | 49 | 37 |
| buongiorno-vita | 52 | 39 |
| sogni-appesi | 84 | 56 |
| **TOTAL** | **441** | **311** |

Fuera de alcance: las 4 ya convertidas (niente, piccola-stella, spari-sul-petto,
stasera) y cualquier cambio en `phrase.answer` / `phrase.validation`.

## Decisiones (usuario, 2026-07-27)
- Las 10 de corrido, sin checkpoint por canción; solo interrumpir si un `disputed`
  necesita juicio humano.
- Quórum completo (2 pases, `by` distintos) — calidad > tokens, misma barra que las
  4 canciones ya convertidas.

## Pasos (un commit por canción)
Por canción, de la más corta a la más larga:
1. **Dedup** — agrupar frases por `prompt|answer`; quedarse con el representante.
2. **Autoría** — `decoyBank` por representante: mapa POS completo + 3-4 decoys
   plausibles-pero-incorrectos (D1-D5). Escritura con `serializeSong` (round-trip
   estable, exportado por `scripts/validate-decoy-pass.mjs`).
3. **Quórum** — loop SECUENCIAL por canción, 2 pases:
   `--model=deepseek-chat --fallback=deepseek-reasoner --write` y
   `--model=gemini-2.5-flash --avoid=deepseek-chat,deepseek-reasoner --write`
   (fallback a `deepseek-reasoner` como 2º `by` si Gemini 429 persistente).
   Canciones en paralelo SÍ (fichero distinto por canción); dos loops sobre el
   MISMO fichero NUNCA.
4. **Disputes** — arreglar el decoy/POS señalado y re-pasar. Sin override-atajo.
5. **Propagación** — copiar `decoyBank` (con su validation) del representante a sus
   duplicados y re-derivar status.
6. **Commit** `feat(quick-260727-dcy): decoyBank validado en "<title>" — N frases`.

## Cierre
- `node --test tests/*.test.js` verde.
- Fila en "Quick Tasks Completed" de `.planning/STATE.md` + `last_activity`.
- SUMMARY.md del quick task.

## Fuentes de verdad
- `docs/DECOY-VALIDATION-PROMPT.md` (D1-D5)
- `src/domain/word-groups.js` (claves POS válidas)
- `src/data/validation-state.js` (`deriveStatus`, sticky)
- `.claude/skills/it-add-song/SKILL.md` (Paso 8)
