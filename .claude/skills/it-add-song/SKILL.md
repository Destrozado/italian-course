---
name: it-add-song
description: "Añade una canción nueva al corpus de ejercicios (bloque Canciones), traducida italiano→español troceada por palabras y VALIDADA por quórum cross-vendor (S1-S6). Por defecto incluye el modo 'decoradores agrupados' (decoyBank, D1-D5); con --no-decoys se da de alta sin agrupar (solo answer). Un solo autor, calidad > tokens, sin override-atajo."
argument-hint: "\"<Título> — <Artista>\"  (luego pega la letra italiana; flags: --no-repeats  --no-decoys  --dry-run)"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Dar de alta UNA canción en el corpus, dejándola jugable en el bloque Canciones y
con cada frase `validated` por quórum multi-modelo. La canción es un ejercicio
word-buttons inverso italiano→español: el alumno ve la línea italiana (`prompt`)
y reconstruye la traducción arrastrando palabras (`answer`, troceada por tokens).

**Salida observable:**
- `content/songs/<id>.json` con `phrases[]` (letra completa, estribillos verbatim)
  y un bloque `validation` por frase con `status: "validated"`.
- Registro en `content/songs.json` con `{id, title, phraseCount}` y `phraseCount`
  = `phrases.length`.
- `node --test tests/*.test.js tests/fixtures/*.test.js` en verde (los DOS globs).
- Commits atómicos (feat de contenido + docs de STATE) y fila en la tabla
  "Quick Tasks Completed" de `.planning/STATE.md`.
- `decoyBank` por frase validado por su propio quórum (D1-D5) para el modo
  "decoradores agrupados" — POR DEFECTO; el flag `--no-decoys` da de alta la
  canción sin agrupar (solo `answer`, modo clásico).
</objective>

<critical_constraints>

- **`answer` SIN puntuación, un token por palabra (S3).** Es un array de strings;
  comas/puntos/comillas/dos-puntos de la letra se OMITEN siempre. `"Lo apprezzo"`
  → `["lo","aprecio"]`, nunca `["lo,","aprecio"]`. Apóstrofes ASCII U+0027.

- **NO filtrar la respuesta en el `prompt`.** El `prompt` es la línea ITALIANA
  original limpia; nunca contiene la traducción española.

- **Acentos RAE obligatorios en `answer` (S4).** `vacío`, `corazón`, `tú` (pronombre),
  `mí`, `sé`, `así`… Un flag de acento del quórum sobre español sin tilde es un bug
  REAL, no un falso-positivo: se ARREGLA el acento, no se hace override. (Memoria
  `explanations_must_be_accented`.) `tu`/`mi`/`el` (determinante/artículo) van SIN
  tilde; `tú`/`mí`/`él` (pronombre) CON tilde — cuidado con el par.

- **Fidelidad con licencia poética + anti-calco (S2/S6).** La traducción transmite
  el sentido; se aceptan metáforas, NO contrasentidos ni calcos que un nativo no
  diría. Al desambiguar dobles-válidos, la traducción correcta es la que ambas IAs
  aceptan (memoria `feedback_disputed_resolution`).

- **Quórum = 2 `by` DISTINTOS, ambos `correcta`, cero `incorrecta` → `validated`.**
  `deriveStatus` (src/data/validation-state.js) es sticky: cualquier `incorrecta`
  deja la frase `disputed` para siempre (no auto-sana). Preferir CROSS-VENDOR
  (DeepSeek + Gemini). Si Gemini rate-limitea (429), usar `deepseek-reasoner` como
  2º `by` distinto — patrón ya aceptado en el corpus (memoria `song_quorum_validator`).

- **El quórum se ejecuta en TOP-LEVEL, no dentro de un subagent.** El pase Claude
  (Opus/Sonnet) va por Task y un executor/subagent NO puede spawnearlo (memoria
  `executor_cannot_run_task_quorum`); por eso este skill usa el script
  `scripts/validate-song-pass.mjs` (DeepSeek/Gemini vía HTTP), que sí corre desde
  aquí. Claves en `.env` (GEMINI_API_KEY, DEEPSEEK_API_KEY).

- **Claude SOLO evalúa lo que no ha autorado.** Si la traducción viene de una
  FUENTE EXTERNA (borrador del autor, letras.com…) y Claude se limitó a revisarla,
  un pase Claude vía Task cuenta como `by` distinto y **refuerza** el quórum como
  3er evaluador (decisión del autor 2026-07-27). Si Claude autoró la traducción
  desde cero, NO puede ser evaluador: sería autoevaluación. Ojo al matiz: si al
  revisar el borrador Claude acaba reescribiendo la frase, vuelve a ser autor de
  ESA frase y pierde la independencia — el 3er pase solo vale en las que entraron
  casi verbatim. En ningún caso sustituye al cross-vendor: lo añade.

- **S1 IGNORA la puntuación.** El evaluador reconstruye la frase con la puntuación
  implícita; NO penalizar "run-on" por faltar comas — solo error a nivel de palabra.

- **Estribillos repetidos VERBATIM.** Convención del corpus (p.ej. `cuore-di-plastica`
  repite el estribillo ×4): la letra se incluye completa y en orden, con las
  repeticiones como frases separadas. Validar solo el REPRESENTANTE de cada
  contenido único y PROPAGAR el bloque `validation` a sus duplicados idénticos
  (ahorra ~mitad de llamadas). Flag `--no-repeats` para desduplicar (raro).

- **Normalizar el italiano (S5).** Sin caracteres no-latinos espurios (p.ej. `е`
  cirílica U+0435 por `e` latina), sin dobles espacios, sin basura de copia-pega.
  Si la letra pegada trae artefactos de transcripción, limpiar el `prompt` y
  REPORTAR la normalización al autor.

- **NUNCA dos escritores concurrentes sobre el mismo JSON.** El script re-escribe
  el archivo por frase; si se paraleliza mal, se corrompe. Los pases del quórum se
  lanzan en un loop SECUENCIAL (background OK, pero un solo loop).

- **Mensajes y prosa en español (FOUND-04).**

</critical_constraints>

<inputs>

Del argumento y del autor:
1. **Título y artista** — del argumento `"<Título> — <Artista>"`. `id` = kebab-case
   del título (sin artista, sin acentos/apóstrofes: "La stella più fragile" →
   `la-stella-piu-fragile`). `title` = `"<Título> — <Artista>"`.
2. **Letra italiana completa** — pegada por el autor. Es la fuente de verdad del
   texto; NO inventar líneas.
2-bis. **(Opcional) Traducción española de partida** — si el autor pega también una
   traducción (letras.com o similar), se usa como BORRADOR y se aplica el Paso 1-bis.
   Habilita el 3er pase Claude en el quórum (ver `<critical_constraints>`).
3. Flags: `--no-repeats` (desduplicar estribillos), `--no-decoys` (OMITIR el
   decoyBank, que por defecto SÍ se añade), `--dry-run` (autorar JSON + registro
   pero NO validar ni commitear).

Preguntar con AskUserQuestion SOLO si hay ambigüedad real (p.ej. líneas con
artefactos de transcripción que cambian el sentido, o si el autor no pasó la letra).
No preguntar lo que la convención ya resuelve (estribillos verbatim, formato).

</inputs>

<execution>

**Paso 0 — Leer las fuentes de verdad**
```
Read: docs/SONG-VALIDATION-PROMPT.md         (reglas S1-S6, self-contained)
Read: src/data/validation-state.js           (deriveStatus)
Read: un song existente, p.ej. content/songs/equilibrio-mentale.json  (formato)
```

**Paso 1 — Trocear + traducir la letra**
- Una línea de letra = una frase (uniendo sub-líneas con coma interna como hace el
  corpus). Estribillos repetidos → frases separadas, en orden.
- Por frase: `prompt` = italiano limpio; `answer` = tokens español (una palabra por
  token, SIN puntuación), traducción natural/fiel/anti-calco con acentos RAE.
- Ids secuenciales `"<id>-001"`, `"<id>-002"`, … (3 dígitos).

**Paso 1-bis — Si el autor aporta una traducción de partida (borrador externo)**
Aceptada como **borrador, nunca como fuente** (precedente `260727-isl`, Islanda).
Ahorra la pasada desde cero y ancla el sentido, pero las traducciones de sitios de
letras son de usuario y NO cumplen la barra del corpus. Revisar SIEMPRE, en este
orden, antes de validar:
1. **Registro peninsular.** El autor es de España. Comprobar contra el corpus antes
   de aceptar un término: `coche` (no *auto*/*carro*), `bonito` (no *lindo*),
   `billetes` (no *boletos*), `estudio` (no *monoambiente*). Grep de control:
   `grep -roh '"<palabra>"' content/songs/*.json | wc -l`.
   **El quórum NO detecta esto** — "boletos" es español correcto y pasa S1-S6; la
   deriva de registro solo la ve un humano (o esta checklist).
2. **Topónimos y nombres**: traducir el topónimo (`Islanda`→`Islandia`); los nombres
   propios y títulos se dejan como en el original salvo criterio explícito.
3. **Errores del borrador**: agramaticalidades, sujetos elididos que en español hay
   que recuperar, idioms calcados.
4. **Consistencia intra-canción**: el MISMO verso italiano debe traducirse igual en
   todas sus apariciones. El quórum evalúa frase a frase y no ve la incoherencia.
- Riesgo medido en `260727-isl`: 36/42 pasaron a la primera y **4 de las 6 disputas
  fueron errores de la revisión, no heredados del borrador**. El borrador no baja la
  calidad; revisarlo con prisa sí.
- **NO** construir scrapers de sitios de letras (ToS + copyright + fragilidad): el
  autor pega el texto.

**Paso 2 — Escribir content/songs/<id>.json (generador, formato corpus)**
Usar un generador `node` (zero-deps) para garantizar JSON válido y formato del
corpus (array `answer` en UNA línea). Cada frase: `{id, prompt, answer, categoryIds: []}`
SIN bloque `validation` (lo INSERTA el script de validación). Ejemplo de serialización
(answer inline):
```
node --input-type=module -e '
import fs from "node:fs";
const phrases = [ /* {id,prompt,answer} autorados */ ];
const body = phrases.map(p => [
  "    {",
  `      "id": ${JSON.stringify(p.id)},`,
  `      "prompt": ${JSON.stringify(p.prompt)},`,
  `      "answer": [${p.answer.map(t=>JSON.stringify(t)).join(", ")}],`,
  `      "categoryIds": []`,
  "    }"
].join("\n")).join(",\n");
fs.writeFileSync("content/songs/<id>.json",
  `{\n  "id": "<id>",\n  "title": "<title>",\n  "phrases": [\n${body}\n  ]\n}\n`);
JSON.parse(fs.readFileSync("content/songs/<id>.json","utf8")); // sanity
'
```

**Paso 3 — Registrar en content/songs.json**
Edit: añadir `{"id":"<id>","title":"<title>","phraseCount":<N>}` al array `songs`
(coma en la fila anterior). `phraseCount` = nº total de frases (con repeticiones).

Si `--dry-run`: parar aquí y reportar. No validar, no commitear.

**Paso 4 — Dedup: representantes únicos**
```
node --input-type=module -e '
import fs from "node:fs";
const s=JSON.parse(fs.readFileSync("content/songs/<id>.json","utf8"));
const g=new Map();
for(const p of s.phrases){const k=p.prompt+"|"+p.answer.join(" ");(g.get(k)??g.set(k,[]).get(k)).push(p.id);}
for(const ids of g.values()) console.log(ids[0], ids.length>1?("dups: "+ids.slice(1).join(",")):"");
'
```
Validar SOLO el primer id de cada grupo; propagar a los demás en el Paso 7.

**Paso 5 — Quórum cross-vendor (loop SECUENCIAL, background OK)**
Por cada representante único, DOS pases con `by` distintos:
```
# Pase 1 — familia DeepSeek (chat, fallback reasoner):
node scripts/validate-song-pass.mjs <phrase-id> --model=deepseek-chat --fallback=deepseek-reasoner --write
# Pase 2 — Gemini (evitando DeepSeek para garantizar 2º by distinto):
node scripts/validate-song-pass.mjs <phrase-id> --model=gemini-2.5-flash --avoid=deepseek-chat,deepseek-reasoner --write
```
- **Pase 3 (SOLO si la traducción vino de fuente externa, Paso 1-bis):** subagent
  Claude vía Task con `docs/SONG-VALIDATION-PROMPT.md` verbatim + la frase, como
  `by: "claude-<modelo>"`. Refuerza el quórum; NO sustituye a los dos anteriores.
  Sáltalo en las frases que Claude acabó reescribiendo en la revisión (ahí es autor).
- Gemini rate-limitea con frecuencia (429). Si el Pase 2 no entra tras reintentos,
  usar `deepseek-reasoner` como 2º `by`:
  `--model=deepseek-reasoner --avoid=gemini-2.5-flash --write` (2 `by` DeepSeek
  distintos = `validated`; patrón aceptado). Cada pase escribe/inserta en
  `validation.passes[]` y re-deriva `status`.
- Envolver el loop en un `.sh` y lanzarlo en background; es largo. NO lanzar dos
  loops a la vez (corromperían el JSON).

**Paso 6 — Resolver `disputed` (juicio humano, calidad > tokens)**
Para cada frase con una `incorrecta`:
- Si el concern señala un error REAL (calco S6, acento S4, sinsentido S1, infidelidad
  S2): ARREGLAR el `answer` y RE-VALIDAR ambos pases (el `writePass` reemplaza el
  pase del mismo `by`). NO override-atajo.
- Si es ruido del modelo en algo sutil (poético): re-pasar; los LLM se retractan a
  menudo. Si persiste y la traducción es defendible, buscar un 2º `by` que también
  la dé `correcta` (cross-vendor o deepseek-reasoner). El objetivo: **ambas IAs
  `correcta`**.
- Al desambiguar dobles-válidos, elegir la traducción que respeta el sentido del
  italiano (guardia de fidelidad S6).

**Paso 7 — Propagar `validation` a duplicados + re-derivar**
```
node --input-type=module -e '
import fs from "node:fs";
import { deriveStatus } from "./src/data/validation-state.js";
const F="content/songs/<id>.json"; const s=JSON.parse(fs.readFileSync(F,"utf8"));
const g=new Map(); for(const p of s.phrases){const k=p.prompt+"|"+p.answer.join(" ");(g.get(k)??g.set(k,[]).get(k)).push(p);}
for(const arr of g.values()){const rep=arr.find(p=>p.validation); if(!rep)continue; for(const p of arr){ if(p!==rep) p.validation=JSON.parse(JSON.stringify(rep.validation)); }}
for(const p of s.phrases){ if(p.validation) p.validation.status=deriveStatus(p.validation.passes); }
// re-serializar con formato corpus (answer inline; ver Paso 2 + bloque validation)
'
```
Verificar: TODAS las frases con `validation.status === "validated"`.

**Paso 8 — decoyBank / modo agrupado (POR DEFECTO; saltar solo si `--no-decoys`)**
Mismo patrón con la otra tubería:
```
Read: docs/DECOY-VALIDATION-PROMPT.md   (reglas D1-D5)
```
- Autorar por frase única un `decoyBank = { distractors:[...], pos:{token:posKey} }`:
  POS de cada token de `answer` + 2-4 decoys plausibles-pero-incorrectos por frase
  (mismo campo semántico o morfológicamente confundibles; NUNCA sinónimos válidos
  ni palabras de `answer` — eso viola D3). Claves POS válidas: articulo,
  determinante, pronombre, preposicion, conjuncion, verbo, sustantivo, adjetivo,
  adverbio, otros (ver src/domain/word-groups.js).
- Escribir con `serializeSong` (exportado por `scripts/validate-decoy-pass.mjs`;
  round-trip sin pérdida) para no reformatear a mano.
- Validar por quórum: `node scripts/validate-decoy-pass.mjs <phrase-id> --model=... --write`
  (misma rotación de vendors). Resolver disputes (calidad > tokens) y propagar a
  duplicados.

**Paso 9 — Tests + commits + STATE**
```
node --test tests/*.test.js tests/fixtures/*.test.js        # verde
```
- Commit atómico de contenido: `feat(quick-<qid>): añadir canción "<title>" — N frases it→es`.
- (Si hay decoyBank, el caso por defecto) commit separado del decoyBank.
- Actualizar `.planning/STATE.md`: fila en "Quick Tasks Completed" + "Last activity".
- Commit docs.

</execution>

<error_handling>

| Caso | Acción | Mensaje (español) |
|------|--------|-------------------|
| Falta la letra | Preguntar por ella (AskUserQuestion / pedir pegado) | "Pégame la letra italiana completa para trocearla." |
| `id` ya existe en songs.json | Abortar | "Ya existe una canción con id '<id>'. Elige otro título o edita la existente." |
| Falta API key (.env) | Abortar antes de validar | "Falta GEMINI_API_KEY / DEEPSEEK_API_KEY en .env — el quórum no puede correr." |
| Gemini 429 persistente | Fallback a deepseek-reasoner como 2º by | "Gemini rate-limitado; uso deepseek-reasoner como 2º evaluador (2 by distintos)." |
| Frase `disputed` tras re-pasar | Resolver por juicio (Paso 6); NO forzar validated | "Frase <id> disputed: <concern>. La resuelvo por calidad (arreglo/re-paso), sin atajo." |
| Artefacto de transcripción en la letra | Normalizar `prompt` + reportar | "Normalicé la línea NNN: '<orig>' → '<limpia>' (artefacto de pegado). Dime si no coincide con la letra oficial." |
| `--dry-run` | Autorar JSON + registro, NO validar/commitear | "Dry-run: JSON y registro creados; sin validación ni commit." |

</error_handling>

<example_invocations>

Alta estándar (con letra pegada a continuación; incluye decoyBank por defecto):
```
/it-add-song "Spari sul petto — Ultimo"
# → id spari-sul-petto; trocea+traduce; content/songs/spari-sul-petto.json +
#   registro; quórum DeepSeek+Gemini por representante único; resuelve disputes;
#   propaga a duplicados; decoyBank D1-D5 con su propio quórum; tests; commits; STATE.
```

Alta SIN modo agrupado (solo answer, modo clásico):
```
/it-add-song "Spari sul petto — Ultimo" --no-decoys
```

Solo autorar sin validar (para revisar antes):
```
/it-add-song "22 settembre — Ultimo" --dry-run
```

</example_invocations>

<read_first_per_invocation>

1. `docs/SONG-VALIDATION-PROMPT.md` — reglas S1-S6 (fuente del prompt del quórum).
2. `src/data/validation-state.js` — `deriveStatus` (regla sticky del status).
3. Un song existente (p.ej. `content/songs/equilibrio-mentale.json`) — formato exacto.
4. (Salvo `--no-decoys`) `docs/DECOY-VALIDATION-PROMPT.md` + `src/domain/word-groups.js`.

Memorias relevantes del autor (ya destiladas en `<critical_constraints>`):
`exercise_authoring_rules`, `feedback_disputed_resolution`, `song_quorum_validator`,
`explanations_must_be_accented`, `executor_cannot_run_task_quorum`,
`multi_vendor_quorum_validator`.

</read_first_per_invocation>
