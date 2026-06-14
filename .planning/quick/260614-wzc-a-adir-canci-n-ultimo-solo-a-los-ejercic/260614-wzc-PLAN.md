---
phase: quick-260614-wzc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - content/songs/solo.json
  - content/songs.json
autonomous: true
requirements: [QUICK-260614-wzc]
must_haves:
  truths:
    - "La canción 'Solo — Ultimo' aparece en el índice de canciones"
    - "Cada frase de la letra tiene prompt italiano y answer en español troceado por palabras"
    - "El validador de canciones pasa sin errores con el nuevo JSON"
    - "phraseCount en songs.json coincide exactamente con phrases.length en solo.json"
  artifacts:
    - path: "content/songs/solo.json"
      provides: "Documento de canción 'solo' con todas las frases"
      contains: "\"id\": \"solo\""
    - path: "content/songs.json"
      provides: "Entrada de índice para la canción solo"
      contains: "\"id\": \"solo\""
  key_links:
    - from: "content/songs.json"
      to: "content/songs/solo.json"
      via: "lockstep id + phraseCount + title"
      pattern: "\"id\": \"solo\""
---

<objective>
Añadir la canción "Solo" de Ultimo a los ejercicios de canciones, replicando exactamente el
formato de `content/songs/equilibrio-mentale.json`.

Purpose: Ampliar el banco de ejercicios de traducción italiano→español con una canción nueva.
Output: `content/songs/solo.json` (canción nueva) + entrada en `content/songs.json` (índice).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md

<!-- FORMATO DE REFERENCIA EXACTO a replicar -->
@content/songs/equilibrio-mentale.json
<!-- Índice donde registrar la canción -->
@content/songs.json
<!-- Reglas que el JSON debe cumplir (validador) -->
@tests/song-validator.test.js

<interfaces>
<!-- Forma exacta de cada frase, según equilibrio-mentale.json y validateSongs -->
Documento de canción (content/songs/<id>.json):
{
  "id": "<slug-minusculas-con-guiones>",
  "title": "<string no vacío>",
  "phrases": [
    {
      "id": "<song-id>-NNN",        // NNN zero-padded: 001, 002, ...
      "prompt": "<línea(s) en italiano, string no vacío>",
      "answer": ["palabra1", "palabra2", ...],  // traducción ES troceada, tokens no vacíos
      "categoryIds": []             // array vacío para canciones
    }
  ]
}

Entrada de índice (content/songs.json -> songs[]):
{ "id": "solo", "title": "<idéntico al title del documento>", "phraseCount": <N === phrases.length> }

Reglas duras (validateSongs + tests lockstep):
- id de canción = slug en minúsculas (sin espacios ni mayúsculas).
- title NO vacío; debe ser IDÉNTICO en el índice y en el documento.
- phrases con >= 1 frase (no se admite []).
- Cada frase: id único dentro de la canción, prompt string no vacío, answer array no vacío
  con tokens string no vacíos. categoryIds vacío [] es válido.
- songs.json: phraseCount DEBE igualar phrases.length del documento (test de lockstep).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Crear content/songs/solo.json con la letra troceada y traducida</name>
  <files>content/songs/solo.json</files>
  <action>
Crear `content/songs/solo.json` replicando EXACTAMENTE la estructura de
`content/songs/equilibrio-mentale.json` (mismas claves, mismo orden, indentación 2 espacios,
`answer` y `categoryIds` en una sola línea como en la referencia).

Campos raíz:
- `id`: "solo"
- `title`: "Solo — Ultimo"
- `phrases`: array de frases.

Tomar la LETRA OFICIAL italiana que aparece en el bloque task_detail del PLAN (la copia el
executor desde la especificación de la tarea; NO inventar versos). Trocear la letra en frases
COHERENTES igual que equilibrio-mentale agrupa ~2 versos por frase, o un estribillo/grupo
lógico en una frase. Mantener el ORDEN de la canción de principio a fin (incluyendo los dos
estribillos repetidos y sus variantes finales — no deduplicar, la letra los repite).

Para cada frase:
- `id`: patrón "solo-NNN" con NNN zero-padded secuencial empezando en 001.
- `prompt`: la(s) línea(s) italianas de esa frase. Conservar puntuación y apóstrofos/acentos
  italianos tal cual ('sto, c'è, è, perché, sì, ...). Si una frase agrupa 2 versos, unirlos
  con coma como hace equilibrio-mentale (ver sus prompts de 2 versos).
- `answer`: la traducción al ESPAÑOL de ese prompt, troceada palabra por palabra en un array.
  Sin signos de puntuación dentro de los tokens (sin comas, puntos, comillas), salvo apóstrofos
  o guiones internos de la propia palabra. Cada token es una palabra no vacía. Conservar
  acentos españoles correctos (sé, está, sí, simétrico al estilo de equilibrio-mentale).
- `categoryIds`: [] (array vacío).

NORMALIZACIÓN OBLIGATORIA: la letra contiene una 'е' CIRÍLICA (U+0435) en la línea
"Non ci riеsco". Sustituirla por la 'e' LATINA (U+0065) de modo que el prompt quede
"Non ci riesco". Antes de guardar, verificar que NINGÚN carácter del archivo esté fuera del
rango latino esperado (sin cirílicos ni homóglifos): ejecutar
`grep -nP '[\x{0400}-\x{04FF}]' content/songs/solo.json` y confirmar que devuelve 0 líneas.
  </action>
  <verify>
    <automated>test -f content/songs/solo.json && node -e "const d=require('./content/songs/solo.json'); if(d.id!=='solo')throw new Error('id'); if(!d.title)throw new Error('title'); if(!Array.isArray(d.phrases)||d.phrases.length<1)throw new Error('phrases'); d.phrases.forEach((p,i)=>{const n=String(i+1).padStart(3,'0'); if(p.id!=='solo-'+n)throw new Error('id frase '+p.id); if(typeof p.prompt!=='string'||!p.prompt.trim())throw new Error('prompt '+p.id); if(!Array.isArray(p.answer)||p.answer.length<1||p.answer.some(t=>typeof t!=='string'||!t.trim()))throw new Error('answer '+p.id); if(!Array.isArray(p.categoryIds)||p.categoryIds.length!==0)throw new Error('categoryIds '+p.id);}); console.log('OK', d.phrases.length, 'frases');" && ! grep -qP '[\x{0400}-\x{04FF}]' content/songs/solo.json && echo "SIN CIRILICOS"</automated>
  </verify>
  <done>
content/songs/solo.json existe, parsea como JSON, tiene id "solo", title "Solo — Ultimo",
>=1 frase con ids secuenciales solo-001.., cada frase con prompt italiano no vacío, answer
array de palabras no vacías y categoryIds []. No quedan caracteres cirílicos en el archivo.
  </done>
</task>

<task type="auto">
  <name>Task 2: Registrar la canción en el índice y validar el conjunto</name>
  <files>content/songs.json</files>
  <action>
Añadir al array `songs` de `content/songs.json` una nueva entrada:
{ "id": "solo", "title": "Solo — Ultimo", "phraseCount": N }

donde:
- `title` DEBE ser idéntico (carácter por carácter, incluido el guion largo "—") al title del
  documento solo.json creado en la Task 1.
- `phraseCount` DEBE igualar exactamente `phrases.length` de solo.json (test de lockstep
  "phraseCount === phrases.length" lo verifica). Contar las frases reales del documento, no
  asumir un número.

Mantener el formato existente del índice (mismas líneas one-liner por entrada, indentación).
Añadir la entrada al final del array, después de equilibrio-mentale.
  </action>
  <verify>
    <automated>node -e "const idx=require('./content/songs.json'); const doc=require('./content/songs/solo.json'); const e=idx.songs.find(s=>s.id==='solo'); if(!e)throw new Error('falta entrada solo'); if(e.title!==doc.title)throw new Error('title no coincide'); if(e.phraseCount!==doc.phrases.length)throw new Error('phraseCount '+e.phraseCount+' != '+doc.phrases.length); console.log('lockstep OK', e.phraseCount);" && node --test tests/song-validator.test.js</automated>
  </verify>
  <done>
content/songs.json contiene la entrada {id:"solo", title igual al documento, phraseCount ===
phrases.length}. `node --test tests/song-validator.test.js` pasa sin fallos (incluye el test
de lockstep y la validación real de todas las canciones del repo, ahora con solo incluida).
  </done>
</task>

</tasks>

<verification>
- `node --test tests/song-validator.test.js` pasa con 0 fallos.
- `content/songs/solo.json` parsea y cumple el esquema de canción.
- `content/songs.json` está en lockstep (phraseCount === phrases.length, title idéntico).
- No hay caracteres cirílicos en solo.json (la 'е' cirílica fue normalizada a 'e' latina).
</verification>

<success_criteria>
La canción "Solo — Ultimo" está disponible en los ejercicios: registrada en el índice,
con su documento bien formado, traducciones ES por palabras, y el validador en verde.
</success_criteria>

<output>
Create `.planning/quick/260614-wzc-a-adir-canci-n-ultimo-solo-a-los-ejercic/260614-wzc-SUMMARY.md` when done
</output>
