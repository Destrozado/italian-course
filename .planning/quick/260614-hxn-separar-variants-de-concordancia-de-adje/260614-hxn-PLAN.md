---
phase: quick-260614-hxn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - content/exercises/essere.json
  - content/exercises/genero-numero.json
autonomous: true
requirements: [QUICK-260614-hxn]
must_haves:
  truths:
    - "El bloque essere-nacionalidad contiene SOLO las 3 variants de verbo (sono/è/sono); ninguna variant pregunta por el adjetivo de nacionalidad."
    - "genero-numero.json contiene un bloque nuevo con categoryIds [\"genero-numero\"] y las 3 variants de concordancia de adjetivo (italiano/italiani/italiane), preservadas verbatim."
    - "Ningún fallo de concordancia de adjetivo puede ya resetear la categoría essere (la atribución va por categoryIds del bloque)."
    - "Ambos bloques tocados quedan marcados para re-validación (status pending, passes vacío)."
    - "Ambos JSON parsean sin error (sin comas finales)."
  artifacts:
    - path: "content/exercises/essere.json"
      provides: "Bloque essere-nacionalidad reducido a 3 variants de verbo + explanation re-enfocada en essere predicativo"
      contains: "essere-nacionalidad"
    - path: "content/exercises/genero-numero.json"
      provides: "Bloque nuevo de concordancia de adjetivo de nacionalidad (3 variants)"
      contains: "genero-numero"
  key_links:
    - from: "content/exercises/genero-numero.json (bloque nuevo)"
      to: "categoría genero-numero"
      via: "campo categoryIds"
      pattern: "categoryIds.*genero-numero"
---

<objective>
Desacoplar la concordancia de adjetivo de la conjugación de essere. Hoy el bloque `essere-nacionalidad` (en `content/exercises/essere.json`) agrupa 6 variants bajo `categoryIds: ["essere"]`: 3 prueban el VERBO (hueco en essere) y 3 prueban la CONCORDANCIA del adjetivo de nacionalidad (hueco en el adjetivo). Por la cascada "fail-wins" (D-39/D-54), un fallo en cualquier variant resetea TODA la categoría atribuida vía `categoryIds`. Así, equivocarse en `italiani`/`italiane` borra todo el progreso de `essere` aunque el verbo `sono` venga dado.

Purpose: que el skill del HUECO determine la categoría — hueco en verbo → essere; hueco en adjetivo → género/número. El fallo de concordancia debe resetear género/número, no essere.

Output: `essere-nacionalidad` queda con 3 variants de verbo; un bloque nuevo en `genero-numero.json` recibe las 3 de concordancia. Ambos quedan marcados para re-validación. NO se corre la re-validación (quórum) en este task — solo se marcan.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md

# Bloque fuente (essere-nacionalidad) — lo verás completo al editar:
@content/exercises/essere.json

# Archivo destino — el bloque nuevo DEBE replicar el schema exacto de sus vecinos:
@content/exercises/genero-numero.json

<interfaces>
<!-- Convención de re-validación (verificado en src/data/validation-state.js + src/data/schema-validator.js): -->
<!-- deriveStatus([]) === "pending". status válido ∈ {pending, validated, disputed}. -->
<!-- "Marcar para re-validar" = poner status:"pending" y passes:[] (vaciar los pases viejos, -->
<!-- porque el contenido del bloque cambió y la validación anterior ya no aplica). -->
<!-- El schema acepta passes:[] vacío y status:"pending"; validate-content-fixture NO exige validated. -->

<!-- Shape de bloque multiple-choice en genero-numero.json (copiar EXACTO, formato compacto del archivo): -->
{
  "id": "genero-numero-...",
  "type": "multiple-choice",
  "categoryIds": ["genero-numero"],
  "explanation": "...",
  "variants": [ { "prompt": "...", "options": ["a","b","c","d"], "correctIndex": N } ],
  "validation": { "status": "pending", "passes": [] }
}

<!-- Las 3 variants de concordancia a MOVER (preservar prompt/options/correctIndex VERBATIM): -->
{ "prompt": "Marco è ___ di Firenze.",      "options": ["italiana","italiano","italiani","italiane"], "correctIndex": 1 }
{ "prompt": "Marco e Luca sono ___.",       "options": ["italiano","italiani","italiane","italiana"], "correctIndex": 1 }
{ "prompt": "Anna e Giulia sono ___.",      "options": ["italiana","italiani","italiane","italiano"], "correctIndex": 2 }

<!-- IDs existentes en genero-numero.json (el nuevo id debe ser único y semántico, p.ej. genero-numero-nazionalita): -->
<!-- genero-numero-plurale-o-i, -plurale-a-e, -plurale-e-i, -plurale-co-chi, -invariabili, -->
<!-- -femminile-o-a, -femminile-trice, -femminile-essa, -articolo-suono, -articolo-plurale-logo, -->
<!-- -match-articolo-singolare, -match-articolo-plurale -->
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Reducir essere-nacionalidad a las 3 variants de verbo y marcar para re-validar</name>
  <files>content/exercises/essere.json</files>
  <action>
En el bloque `id: "essere-nacionalidad"` (`categoryIds: ["essere"]`):

1. Eliminar del array `variants` las 3 entradas de concordancia de adjetivo (las que tienen prompts "Marco è ___ di Firenze.", "Marco e Luca sono ___." y "Anna e Giulia sono ___."). Conservar SOLO las 3 de verbo: "Io ___ spagnolo." (sono), "Lei ___ italiana di Milano." (è), "Loro ___ tedeschi." (sono), con sus options/correctIndex intactos.

2. Reescribir `explanation` para que se enfoque SOLO en essere como predicado de nacionalidad (Io sono / Lei è / Loro sono; contraste essere vs avere como trampa A1 del hispanohablante; el verbo concuerda en persona/número con el sujeto). RETIRAR todo el material de ortografía/concordancia del ADJETIVO (no-capitalización de nacionalidades, género spagnolo/spagnola, di + ciudad, plural -co→-chi tedesco/tedeschi, nunca -s) — ese material viaja con las variants de adjetivo al bloque nuevo (Task 2). Canon editorial heredado: español acentuado correcto, plain text sin markdown, apóstrofes ASCII U+0027, italianismos preservados, rule-first (liderar con el disparador "La nacionalidad se predica con essere..."). Respetar R1 (sin leak de la respuesta: no nombrar sono/è/è en prosa de forma que delate el hueco) y NO incluir refs #NNN.

3. Marcar el bloque para re-validación: `validation.status` → "pending" y `validation.passes` → [] (array vacío). El contenido cambió, así que los pases Opus 4.7 + Sonnet 4.6 previos ya no aplican.
  </action>
  <verify>
    <automated>node -e "const d=JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8'));const b=d.exercises.find(e=>e.id==='essere-nacionalidad');if(!b)throw new Error('bloque no encontrado');if(b.variants.length!==3)throw new Error('esperaba 3 variants, hay '+b.variants.length);if(b.variants.some(v=>/Marco|Anna|Giulia/.test(v.prompt)))throw new Error('quedan variants de adjetivo');if(b.validation.status!=='pending'||b.validation.passes.length!==0)throw new Error('no marcado para re-validar');if(/spagnola|tedeschi|capitaliz|-co|chi/i.test(b.explanation))throw new Error('explanation aun tiene material de concordancia de adjetivo');console.log('OK essere.json: 3 variants verbo, pending, explanation re-enfocada')"</automated>
  </verify>
  <done>essere-nacionalidad tiene exactamente las 3 variants de verbo, explanation centrada en essere predicativo (sin material de concordancia de adjetivo), status pending + passes []. essere.json parsea sin error.</done>
</task>

<task type="auto">
  <name>Task 2: Añadir bloque de concordancia de nacionalidad en genero-numero.json y verificar ambos JSON</name>
  <files>content/exercises/genero-numero.json</files>
  <action>
Añadir al array `exercises` de `content/exercises/genero-numero.json` un bloque NUEVO (insertarlo de forma consistente con los demás bloques de género/número, p.ej. junto a los bloques `femminile-*` de concordancia). Usar el formato compacto del archivo (options en una línea, passes en una línea cuando vacío). Contenido del bloque:

- `id`: "genero-numero-nazionalita" (único; verificar que no choca con los 12 ids existentes listados en <interfaces>).
- `type`: "multiple-choice".
- `categoryIds`: ["genero-numero"]  ← clave: la atribución del fallo va aquí, NO a essere.
- `variants`: las 3 de concordancia de adjetivo, preservadas VERBATIM (prompt/options/correctIndex exactos de <interfaces>): "Marco è ___ di Firenze." correctIndex 1; "Marco e Luca sono ___." correctIndex 1; "Anna e Giulia sono ___." correctIndex 2.
- `explanation`: heredar el material de concordancia + ortografía que sale de essere: el adjetivo de nacionalidad concuerda en género y número con el sustantivo (italiano/italiana/italiani/italiane, patrón -o/-a/-i/-e); las nacionalidades en italiano NO se capitalizan (a diferencia del inglés); "di" + ciudad para el origen ciudadano (di Firenze); en plural masculino, grafía -co→-chi para preservar el sonido duro (tedesco→tedeschi) y el plural italiano nunca cierra en -s. Canon editorial: español acentuado, plain text sin markdown, apóstrofes ASCII U+0027, rule-first. R1: sin leak de la respuesta en prosa; no incluir refs #NNN. Gloss ES "(en español: ...)" permitido si desambigua. Comprobar R5: cada variant ya trae 4 distractores genuinamente distintos (las 4 formas italiano/a/i/e) — preservados al mover.
- `validation`: { "status": "pending", "passes": [] }  ← marcar para re-validar.

NO ejecutar el quórum de re-validación (gsd-validate-exercise) — eso es trabajo aparte; este task solo marca los dos bloques como pending para que el autor sepa re-validarlos.
  </action>
  <verify>
    <automated>node -e "const fs=require('fs');const g=JSON.parse(fs.readFileSync('content/exercises/genero-numero.json','utf8'));const b=g.exercises.find(e=>e.id==='genero-numero-nazionalita');if(!b)throw new Error('bloque nuevo no encontrado');if(b.categoryIds.join()!=='genero-numero')throw new Error('categoryIds mal');if(b.type!=='multiple-choice')throw new Error('type mal');if(b.variants.length!==3)throw new Error('esperaba 3 variants');const want=[['Marco è ___ di Firenze.',1],['Marco e Luca sono ___.',1],['Anna e Giulia sono ___.',2]];want.forEach(([p,ci],i)=>{const v=b.variants.find(x=>x.prompt===p);if(!v)throw new Error('falta variant '+p);if(v.correctIndex!==ci)throw new Error('correctIndex mal en '+p);if(v.options.length!==4)throw new Error('options!=4 en '+p)});if(b.validation.status!=='pending'||b.validation.passes.length!==0)throw new Error('no marcado para re-validar');const e=JSON.parse(fs.readFileSync('content/exercises/essere.json','utf8'));console.log('OK ambos JSON parsean; bloque nazionalita correcto (3 variants verbatim, pending)')"</automated>
  </verify>
  <done>genero-numero.json tiene el bloque genero-numero-nazionalita con categoryIds ["genero-numero"], las 3 variants de concordancia verbatim, explanation con el material de concordancia/ortografía, status pending + passes []. Ambos archivos (essere.json y genero-numero.json) parsean sin error y sin comas finales.</done>
</task>

</tasks>

<verification>
- `node -e "JSON.parse(require('fs').readFileSync('content/exercises/essere.json','utf8'))"` sin error.
- `node -e "JSON.parse(require('fs').readFileSync('content/exercises/genero-numero.json','utf8'))"` sin error.
- Si existe el fixture validator de contenido, opcional: `node scripts/validate-content-fixture.mjs essere` y `... genero-numero` exit 0 (no exige validated; pending es shape-válido).
- essere-nacionalidad: 3 variants de verbo, 0 de adjetivo.
- genero-numero-nazionalita: 3 variants de adjetivo, categoryIds ["genero-numero"].
- Ambos bloques: status "pending", passes [].
</verification>

<success_criteria>
- La concordancia de adjetivo de nacionalidad ya no vive bajo categoryIds essere; un fallo de género/número resetea género/número, no essere.
- Las 3 variants movidas conservan prompt/options/correctIndex exactos (sin re-autoría).
- Las explanations quedan repartidas: essere predicativo en essere-nacionalidad; concordancia + ortografía del adjetivo en genero-numero-nazionalita.
- Ambos bloques marcados para re-validación (pending); la re-validación por quórum NO se ejecuta en este task.
- Ambos JSON válidos.
</success_criteria>

<output>
Create `.planning/quick/260614-hxn-separar-variants-de-concordancia-de-adje/260614-hxn-SUMMARY.md` when done
</output>
