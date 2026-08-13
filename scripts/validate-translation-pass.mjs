// scripts/validate-translation-pass.mjs
//
// Pase de validación de quórum multi-proveedor (cross-vendor) para TRADUCCIONES
// AL ESPAÑOL de variantes de ejercicio (`variants[k].translationES`). Espejo de
// `scripts/validate-song-pass.mjs` (canciones), adaptado a traducciones:
//   - busca el target en content/exercises/*.json y tests/fixtures/*.json sobre
//     `data.exercises` (NO `data.phrases`),
//   - compone el prompt con docs/TRANSLATION-VALIDATION-PROMPT.md (criterios de
//     TRADUCCIÓN S1/S2/S4/S5/S6 — NO los R1-R7 de gramática de slot),
//   - DIFERENCIA CLAVE (§Delta de 46-PATTERNS.md): el target NO es un elemento
//     top-level con `id`, es UNA VARIANTE dentro de un slot. Se direcciona con la
//     forma compuesta `<slot-id>#<k>` (k = índice de variante, base 0).
//   - DIFERENCIA CRÍTICA DE ESCRITURA: el bloque `validation` que se escribe es el
//     de `variants[k].translationES`, y el SLOT ya tiene un `"validation"` propio.
//     Decidir UPDATE-vs-INSERT por `objSlice.includes('"validation"')` sobre el
//     objeto-slot (como hace el analog de canciones) daría un FALSO UPDATE sobre el
//     bloque equivocado y corrompería el corpus. Por eso `applyPassToText` re-estrecha
//     el objetivo hasta `variants[k].translationES` ANTES de ramificar, y deriva la
//     indentación del DISCO (el literal de 6 espacios del analog no vale: aquí el
//     bloque está más profundo).
//
// Un pase lo emite UN modelo externo (DeepSeek / Gemini) sobre UNA traducción —
// NUNCA batched (VAL-03): cada invocación ve una sola traducción, fresh context.
//
// Zero-deps: sólo `https`/`fs`/`path`/`url` nativos. Lee claves de `.env`
// (GEMINI_API_KEY, DEEPSEEK_API_KEY). La clave viaja en HEADER, nunca en la URL
// ni en un log (WR-02 / T-46-07).
//
// AUTO-FALLBACK: si el modelo primario agota su límite (429) tras reintentos, se
// prueba con el siguiente modelo de `--fallback`. El `by` registrado es SIEMPRE el
// modelo que de verdad respondió — un `by` pinneado fabricaría un quórum falso de
// dos entradas del mismo modelo real, y `deriveStatus` no podría distinguirlo.
//
// POR QUÉ EXISTE `--avoid`: `deriveStatus` (fuente única, src/data/validation-state.js)
// exige >=2 pases `correcta` con `by` DISTINTOS. Dos pases del mismo modelo NO son
// quórum. Al lanzar el segundo pase se pasa `--avoid=<by del primero>` para que el
// auto-fallback no pueda aterrizar en el mismo modelo.
//
// Uso:
//   node scripts/validate-translation-pass.mjs <slot-id>#<k> [opciones]
//     --model=<id>        modelo primario (default deepseek-chat)
//     --fallback=a,b,c    modelos a probar si el primario rate-limitea (en orden)
//     --avoid=x,y         modelos a NO usar (p.ej. el `by` del otro pase del quórum)
//     --write             inserta/actualiza el pase en translationES.validation.passes[]
//     --dry-run           imprime el prompt compuesto y sale (no llama a la API)
//     --temp=<n>          temperature (default 0.2)
//
//   Ejemplos:
//     node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' --dry-run
//     node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' --write
//     node scripts/validate-translation-pass.mjs 'preposiciones-di-origen#1' \
//       --model=gemini-2.5-flash --avoid=deepseek-chat --write
//
// Modelos soportados (routing por prefijo):
//   gemini-*    → generativelanguage.googleapis.com   (GEMINI_API_KEY)
//   deepseek-*  → api.deepseek.com (OpenAI-compat)     (DEEPSEEK_API_KEY)
//
// El pase Claude (Sonnet/Opus) NO se hace aquí: corre vía subagente Task con el
// mismo doc de criterios, en la sesión principal.
//
// Exit codes: 0 ok · 1 la cola de modelos se agotó sin pase · 2 dirección o target
// inválidos (fail-fast: slot inexistente, k fuera de rango, type != multiple-choice,
// variante sin `translationES`).

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deriveStatus } from '../src/data/validation-state.js'; // fuente única (WR-01)
import { withFileLock } from './lib/file-lock.mjs'; // exclusión mutua del read-modify-write

export const PROMPT_PATH = 'docs/TRANSLATION-VALIDATION-PROMPT.md';
export const SCAN_DIRS = ['content/exercises', 'tests/fixtures'];
const USAGE =
  "Uso: node scripts/validate-translation-pass.mjs '<slot-id>#<k>' [--model=] [--fallback=a,b] [--avoid=x] [--write] [--dry-run] [--temp=]";

// ── args ──────────────────────────────────────────────────────────────────
export function parseArgs(argv) {
  const args = argv;
  const address = args.find((a) => !a.startsWith('--'));
  const getOpt = (name, def) => {
    const hit = args.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.split('=').slice(1).join('=') : def;
  };
  const PRIMARY = getOpt('model', 'deepseek-chat');
  const FALLBACK = getOpt('fallback', '').split(',').map((s) => s.trim()).filter(Boolean);
  const AVOID = new Set(getOpt('avoid', '').split(',').map((s) => s.trim()).filter(Boolean));
  const TEMP = parseFloat(getOpt('temp', '0.2'));
  const WRITE = args.includes('--write');
  const DRY = args.includes('--dry-run');
  // cola de modelos a intentar (primario + fallbacks), saltando los evitados
  const MODEL_QUEUE = [PRIMARY, ...FALLBACK].filter((m, i, a) => a.indexOf(m) === i && !AVOID.has(m));
  return { address, PRIMARY, FALLBACK, AVOID, TEMP, WRITE, DRY, MODEL_QUEUE };
}

/**
 * Parsea la dirección compuesta `<slot-id>#<k>`. Devuelve null si no encaja: el
 * índice es OBLIGATORIO (un slot puede tener varias variantes y adivinar la 0
 * escribiría en la frase equivocada en silencio).
 */
export function parseAddress(address) {
  if (typeof address !== 'string') return null;
  const hash = address.lastIndexOf('#');
  if (hash <= 0 || hash === address.length - 1) return null;
  const slotId = address.slice(0, hash);
  const raw = address.slice(hash + 1);
  if (!/^\d+$/.test(raw)) return null;
  return { slotId, k: Number(raw) };
}

// ── .env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const out = {};
  if (!fs.existsSync('.env')) return out;
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const ENV = { ...loadEnv(), ...process.env };

// ── provider routing ────────────────────────────────────────────────────────
export function providerFor(model) {
  if (model.startsWith('gemini-')) return 'gemini';
  if (model.startsWith('deepseek-')) return 'deepseek';
  throw new Error(`modelo no soportado por este script: ${model} (usa gemini-* o deepseek-*; Claude va por subagente Task)`);
}
function keyFor(provider) {
  const k = provider === 'gemini' ? ENV.GEMINI_API_KEY : ENV.DEEPSEEK_API_KEY;
  return k;
}

// ── localizar el target: una VARIANTE dentro de un SLOT (§Delta) ─────────────
// Los slots viven en `data.exercises` (NO `data.phrases`). Se escanea también
// tests/fixtures para que la suite pueda direccionar su propio fixture.
export function findSlot(slotId, dirs = SCAN_DIRS) {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const full = path.join(dir, f);
      let data;
      try { data = JSON.parse(fs.readFileSync(full, 'utf8')); } catch { continue; }
      const arr = Array.isArray(data?.exercises) ? data.exercises : null;
      if (!arr) continue;
      const slot = arr.find((e) => e && e.id === slotId);
      if (slot) return { file: full, slot };
    }
  }
  return null;
}

/**
 * Resuelve la dirección compuesta a un target validado, o devuelve `{ error }`.
 * Fail-fast con mensaje que nombra SIEMPRE el slot y el índice: un error mudo aquí
 * es un pase escrito en la frase equivocada.
 */
export function resolveTarget(slotId, k, dirs = SCAN_DIRS) {
  const found = findSlot(slotId, dirs);
  if (!found) {
    return { error: `slot '${slotId}' no encontrado en ${dirs.join('/*.json, ')}/*.json (data.exercises)` };
  }
  const { file, slot } = found;
  if (slot.type !== 'multiple-choice') {
    return { error: `slot '${slotId}' es de tipo "${slot.type}"; la traducción solo existe en variantes "multiple-choice" (SCH-02)` };
  }
  const variants = Array.isArray(slot.variants) ? slot.variants : [];
  if (!Number.isInteger(k) || k < 0 || k >= variants.length) {
    return { error: `índice de variante ${k} fuera de rango en el slot '${slotId}': tiene ${variants.length} variante(s) (índices 0..${variants.length - 1})` };
  }
  const variant = variants[k];
  const text = variant?.translationES?.text;
  if (typeof text !== 'string' || !text.trim()) {
    return { error: `la variante ${k} del slot '${slotId}' no tiene "translationES" con texto: se SALTA (no se envía al quórum y no se crea ningún bloque validation vacío)` };
  }
  return { file, slot, variant, k };
}

/** La frase italiana fuente: el `prompt` con el hueco RELLENO por la opción correcta. */
export function fillGap(prompt, options, correctIndex) {
  const opt = Array.isArray(options) ? options[correctIndex] : undefined;
  if (typeof prompt !== 'string' || typeof opt !== 'string') return null;
  if (!prompt.includes('___')) return null;
  return prompt.replace('___', opt);
}

/**
 * El payload que ve el evaluador: la variante MÁS el contexto que los criterios
 * necesitan. NO se envía el slot entero (ni su `explanation`): el prompt evalúa una
 * traducción, no una regla — y mandar la explicación invitaría a fundir las dos
 * cosas, que es justo la frontera que el doc de criterios prohíbe cruzar.
 */
export function buildDataBlock({ slot, variant, k }) {
  const italianoResuelto = fillGap(variant.prompt, variant.options, variant.correctIndex);
  return {
    id: slot.id,
    variantIndex: k,
    prompt: variant.prompt,
    options: variant.options,
    correctIndex: variant.correctIndex,
    italianoResuelto,
    translationES: { text: variant.translationES.text },
  };
}

export function composePrompt(target, promptPath = PROMPT_PATH) {
  const basePrompt = fs.readFileSync(promptPath, 'utf8');
  return (
    basePrompt +
    '\n\n## Traducción bajo evaluación (DATA)\n\n```json\n' +
    JSON.stringify(buildDataBlock(target), null, 2) +
    '\n```\n'
  );
}

// ── llamadas HTTP por proveedor ─────────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 120000; // WR-04: ningún socket cuelga la cola para siempre
function httpPost({ hostname, pathName, headers, body }) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path: pathName, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(body) } },
      (res) => { let d = ''; res.on('data', (c) => (d += c)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d })); }
    );
    req.on('error', reject);
    req.setTimeout(REQUEST_TIMEOUT_MS, () => req.destroy(new Error(`timeout tras ${REQUEST_TIMEOUT_MS}ms`)));
    req.write(body); req.end();
  });
}

async function callModel(model, composed, temp) {
  const provider = providerFor(model);
  const key = keyFor(provider);
  if (!key) return { rateLimited: false, error: `falta API key para ${provider} (.env)` };

  let res;
  if (provider === 'gemini') {
    res = await httpPost({
      hostname: 'generativelanguage.googleapis.com',
      pathName: `/v1beta/models/${model}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, // WR-02: clave en header, no en query
      body: JSON.stringify({ contents: [{ parts: [{ text: composed }] }], generationConfig: { temperature: temp } }),
    });
  } else {
    res = await httpPost({
      hostname: 'api.deepseek.com',
      pathName: '/chat/completions',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: composed }], temperature: temp, stream: false }),
    });
  }

  if (res.status === 429) {
    // WR-05: honra Retry-After (header, DeepSeek) o "retry in Ns" (body, Gemini)
    const hdr = parseInt(res.headers?.['retry-after'], 10);
    const m = res.body.match(/retry in ([\d.]+)s/i);
    const retryAfter = Number.isFinite(hdr) ? hdr + 1 : m ? Math.ceil(parseFloat(m[1])) + 1 : null;
    return { rateLimited: true, retryAfter, body: res.body };
  }
  // WR-03: 5xx transitorios son recuperables con reintento; otros no.
  if (res.status >= 500) return { rateLimited: false, retriable: true, error: `HTTP ${res.status}: ${res.body.slice(0, 200)}` };
  if (res.status !== 200) return { rateLimited: false, error: `HTTP ${res.status}: ${res.body.slice(0, 300)}` };

  let text;
  try {
    const j = JSON.parse(res.body);
    text = provider === 'gemini'
      ? (j.candidates?.[0]?.content?.parts || []).map((p) => p.text).join('')
      : j.choices?.[0]?.message?.content || '';
  } catch { return { rateLimited: false, error: 'respuesta no-JSON: ' + res.body.slice(0, 300) }; }
  return { text };
}

// ── el CONTRATO del §4, derivado del propio doc de criterios (CR-03) ────────
//
// POR QUÉ SE DERIVA Y NO SE TRANSCRIBE. El enum de `verdict` y los nombres de las
// 5 keys de `criteria` son el contrato que este mismo script acaba de ENVIAR en el
// prompt. Escribirlos otra vez aquí crea dos copias que envejecen por separado, y la
// doctrina del proyecto es justo la contraria: la regla vive en el doc de criterios,
// que es lo único que el evaluador llega a leer. Derivándolo, editar el §4 mueve la
// validación con él y no hay forma de que discrepen en silencio.
//
// FAIL-LOUD, NUNCA FALLBACK SILENCIOSO: si el §4 no se puede parsear, el contrato que
// se le está pidiendo al modelo es DESCONOCIDO, y gastar una llamada de pago contra un
// contrato desconocido es exactamente el agujero que este bloque cierra. Se lanza, y el
// entrypoint lo traduce a exit 2 (dirección/target inválidos = no se llamó a nadie).
export function parseContrato(docText) {
  const iSeccion = docText.search(/^##\s*4\.\s/m);
  if (iSeccion === -1) throw new Error('el doc de criterios no declara la sección "## 4." (contrato de output)');
  const resto = docText.slice(iSeccion);
  // La valla se ancla a PRINCIPIO DE LÍNEA. El §4 menciona la valla EN PROSA («emite
  // EXACTAMENTE un bloque fenced ```json con este shape:»), así que una regex sin
  // ancla casa desde esa mención hasta la apertura del bloque real y captura la prosa
  // en vez del shape. Lo delató la propia cláusula de no-vacuidad al fallar en ruidoso.
  const bloque = /^```json\s*\n([\s\S]*?)^```/m.exec(resto);
  if (!bloque) throw new Error('la sección §4 del doc de criterios no declara ningún bloque ```json con el shape');
  const shape = bloque[1];

  const lineaVerdict = /"verdict"\s*:\s*(.+)/.exec(shape);
  if (!lineaVerdict) throw new Error('el shape del §4 no declara la clave "verdict"');
  const verdicts = [...lineaVerdict[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

  const bloqueCriteria = /"criteria"\s*:\s*\{([\s\S]*?)\}/.exec(shape);
  if (!bloqueCriteria) throw new Error('el shape del §4 no declara el objeto "criteria"');
  const criteria = [...bloqueCriteria[1].matchAll(/"([^"]+)"\s*:/g)].map((m) => m[1]);

  // CLÁUSULA DE NO-VACUIDAD. Un extractor que deja de casar devuelve lista vacía, y
  // sobre la lista vacía `VERDICTS.has(x)` es false SIEMPRE (rechazaría todo) y
  // `CRITERIA.filter(...)` no comprueba nada (aceptaría todo). Las dos degradaciones
  // son inaceptables y ninguna se nota leyendo la salida.
  if (verdicts.length < 2) {
    throw new Error(`el §4 declara ${verdicts.length} valor(es) de "verdict"; el enum tiene que ser cerrado y tener al menos 2`);
  }
  if (criteria.length === 0) {
    throw new Error('el §4 no declara ninguna key dentro de "criteria"');
  }
  return { VERDICTS: new Set(verdicts), CRITERIA: criteria };
}

/** El contrato vigente, leído del doc que se envía en el prompt. */
export function contratoVigente(promptPath = PROMPT_PATH) {
  return parseContrato(fs.readFileSync(promptPath, 'utf8'));
}

/**
 * Comprueba UN veredicto contra el contrato del §4 y devuelve la lista de motivos
 * por los que NO es registrable. Lista vacía = registrable.
 *
 * Es deliberadamente una LISTA y no un booleano: el mensaje de reintento tiene que
 * poder nombrar qué está mal, porque el reintento va contra el mismo modelo y un
 * «formato inválido» a secas no le dice qué corregir.
 */
export function motivosNoRegistrable(verdict, contrato) {
  const motivos = [];
  if (!contrato.VERDICTS.has(verdict?.verdict)) {
    motivos.push(
      `"verdict" fuera del enum del §4: ${JSON.stringify(verdict?.verdict)} ` +
        `(los únicos válidos son ${[...contrato.VERDICTS].map((v) => `"${v}"`).join(' | ')}, en minúsculas y sin puntuación)`
    );
  }
  if (!Array.isArray(verdict?.concerns)) {
    // NO se coerciona a []. El `.filter(typeof === 'string')` que había aquí convertía
    // un `concerns` string en array vacío EN SILENCIO, y con él desaparecía el motivo
    // escrito — que en este proyecto es la evidencia de que una disidencia se resolvió
    // con trabajo. Un `incorrecta` con `concerns: []` es indistinguible de un bug de
    // registro.
    motivos.push(`"concerns" debe ser un ARRAY de strings (llegó ${typeof verdict?.concerns})`);
  } else if (verdict.concerns.some((c) => typeof c !== 'string')) {
    motivos.push('"concerns" contiene entradas que no son string');
  }
  const faltan = contrato.CRITERIA.filter((c) => typeof verdict?.criteria?.[c] !== 'boolean');
  if (faltan.length) {
    motivos.push(`faltan (o no son booleanas) las keys de "criteria": ${faltan.join(', ')}`);
  }
  // §4: «Si alguna criteria es false, DEBE existir al menos 1 concern». Un negativo sin
  // motivo escrito no es registrable: es la mitad del pase que hace falta para poder
  // resolver el disputed después.
  const hayNegativo =
    verdict?.verdict === 'incorrecta' ||
    contrato.CRITERIA.some((c) => verdict?.criteria?.[c] === false);
  if (hayNegativo && Array.isArray(verdict?.concerns) && verdict.concerns.length === 0) {
    motivos.push('un veredicto negativo sin NI UN concern: el §4 exige al menos uno con su tag de criterio');
  }
  return motivos;
}

export function extractJsonBlock(text) {
  const re = /```json\s*([\s\S]*?)\s*```/g;
  let m, last;
  while ((m = re.exec(text)) !== null) last = m[1];
  if (!last) return null;
  try { return JSON.parse(last); } catch { return null; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Recorre la cola de modelos y emite EL pase del primero que responde con un bloque
 * JSON válido. Devuelve el pase, o `null` si la cola se agotó (el exit code lo pone
 * el entrypoint: `run` no mata el proceso, para que sea testeable).
 *
 * `caller` se inyecta SOLO en tests: permite simular un 429 del primario y verificar
 * por comportamiento —no por lectura— que el `by` escrito es el modelo que DE VERDAD
 * respondió. Un `by` pinneado fabricaría un quórum falso de dos entradas del mismo
 * modelo real y `deriveStatus` no podría distinguirlo (T-46-10).
 */
export async function run(cfg, target, composed, caller = callModel, contrato = contratoVigente()) {
  const { MODEL_QUEUE, TEMP, WRITE } = cfg;
  for (let qi = 0; qi < MODEL_QUEUE.length; qi++) {
    const model = MODEL_QUEUE[qi];
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let r;
      try { r = await caller(model, composed, TEMP); } catch (e) { r = { error: e.message }; }

      if (r.text) {
        const verdict = extractJsonBlock(r.text);
        if (!verdict || !verdict.verdict || !verdict.criteria) {
          console.error(`[${model}] sin bloque JSON válido (intento ${attempt}). Reintentando…`);
          if (attempt === maxRetries) break;
          continue;
        }
        // EL VEREDICTO SE VALIDA CONTRA EL CONTRATO §4 ANTES DE REGISTRARLO (CR-03).
        // Antes solo se comprobaba que las claves EXISTIERAN y se escribía
        // `verdict.verdict` tal cual. `deriveStatus` compara por igualdad exacta y
        // case-sensitive, así que cualquier desviación se tragaba en silencio:
        // reproducido, un `"Incorrecta"` con mayúscula NO dispara el sticky-disputed
        // y la misma traducción pasa de `disputed` a `validated` a costa de otros dos
        // `correcta`. Es una `incorrecta` PERDIDA fabricando un quórum falso — el
        // mismo daño que el invariante del `by` real existe para impedir, por la otra
        // puerta. Se reutiliza el camino de reintento que ya existe para «sin bloque
        // JSON válido»: mismo comportamiento, ninguna rama nueva.
        const motivos = motivosNoRegistrable(verdict, contrato);
        if (motivos.length) {
          console.error(
            `[${model}] veredicto NO registrable (intento ${attempt}):\n` +
              motivos.map((m) => `  - ${m}`).join('\n') +
              '\nNo se escribe nada. Reintentando…'
          );
          if (attempt === maxRetries) break;
          continue;
        }
        console.error(`── Razonamiento (${model}) ──\n${r.text}\n──`);
        // `by` = el modelo que DE VERDAD respondió (no el pinneado de la cola): tras
        // un auto-fallback por 429 este `model` ya es el del proveedor que contestó.
        // `concerns` se copia TAL CUAL: ya se ha comprobado que es un array de strings,
        // así que no hay nada que coercionar — y coercionar aquí es lo que borraba el
        // motivo escrito.
        const pass = {
          by: model,
          date: new Date().toISOString().slice(0, 10),
          verdict: verdict.verdict,
          concerns: [...verdict.concerns],
        };
        if (WRITE) await writeTranslationPass(target.file, target.slot.id, target.k, pass);
        return pass;
      }

      if (r.rateLimited) {
        const wait = r.retryAfter ?? Math.min(45, 5 * attempt);
        const hasFallback = qi < MODEL_QUEUE.length - 1;
        if (hasFallback) {
          console.error(`[${model}] 429 rate-limit → AUTO-FALLBACK a '${MODEL_QUEUE[qi + 1]}'`);
          break; // pasa al siguiente modelo de la cola
        }
        console.error(`[${model}] 429 rate-limit, sin fallback restante — esperando ${wait}s (intento ${attempt}/${maxRetries})`);
        if (attempt === maxRetries) break;
        await sleep(wait * 1000);
        continue;
      }

      if (r.retriable && attempt < maxRetries) { // WR-03: 5xx transitorio
        console.error(`[${model}] ${r.error} — reintento (${attempt}/${maxRetries})`);
        await sleep(Math.min(20, 3 * attempt) * 1000);
        continue;
      }
      console.error(`[${model}] error: ${r.error}`);
      break; // error no recuperable con este modelo → probar fallback
    }
  }
  console.error('Agotados todos los modelos de la cola (rate-limit/errores). Pase no emitido.');
  return null;
}

// ── escritura quirúrgica del bloque validation (preserva formato compacto) ──
// deriveStatus se importa de src/data/validation-state.js (fuente única, WR-01).

// CR-01: recorre el bloque { ... } con conciencia de strings/escapes, para que
// llaves dentro de strings (concerns, prompt) no descuadren el contador.
export function matchBraceEnd(text, braceStart) {
  return matchDelimEnd(text, braceStart, '{', '}');
}

/** Igual que matchBraceEnd pero para el array `variants`: `[` … `]`. */
export function matchBracketEnd(text, bracketStart) {
  return matchDelimEnd(text, bracketStart, '[', ']');
}

function matchDelimEnd(text, start, open, close) {
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i; }
  }
  throw new Error(`bloque ${open} ${close} sin cierre balanceado`);
}

// Encuentra el `{` que abre el OBJETO que contiene el anchor dado: es el último `{`
// (string-aware) abierto y no cerrado antes del anchor.
export function findEnclosingBraceStart(text, anchorIdx) {
  let braceStart = -1, depthHelper = [];
  let inStr = false, esc = false;
  for (let i = 0; i < anchorIdx; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depthHelper.push(i);
    else if (c === '}') depthHelper.pop();
  }
  braceStart = depthHelper.length ? depthHelper[depthHelper.length - 1] : -1;
  if (braceStart === -1) throw new Error(`no se encontró el objeto que contiene el offset ${anchorIdx}`);
  return braceStart;
}

/** Rangos [inicio, fin] de los objetos hijos DIRECTOS de un array acotado. */
export function childObjectRanges(text, arrStart, arrEnd) {
  const ranges = [];
  let i = arrStart + 1;
  while (i < arrEnd) {
    const c = text[i];
    if (c === '"') { // saltar strings enteros (una clave o un valor no abre objeto)
      i++;
      let esc = false;
      while (i < arrEnd) {
        const d = text[i];
        if (esc) esc = false;
        else if (d === '\\') esc = true;
        else if (d === '"') { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '{') { const end = matchBraceEnd(text, i); ranges.push([i, end]); i = end + 1; continue; }
    i++;
  }
  return ranges;
}

/** La indentación literal de la línea en la que cae `idx` (derivada del DISCO). */
export function indentAtOffset(text, idx) {
  const lineStart = text.lastIndexOf('\n', idx) + 1;
  return text.slice(lineStart, idx).match(/^\s*/)[0];
}

/**
 * RE-ESTRECHAMIENTO DEL OBJETIVO — el punto de la fase con más riesgo de escribir
 * en el sitio equivocado. Baja del slot a `variants[k].translationES` y devuelve
 * los rangos de cada nivel. Ramificar UPDATE/INSERT sobre el objeto-slot (como el
 * analog de canciones) apuntaría al `validation` del SLOT o al de una variante
 * HERMANA, que en este corpus existen siempre.
 */
export function locateVariantTranslation(text, slotId, k) {
  // anchor con quote de cierre → "...-1" no colisiona con "...-10"
  const idIdx = text.indexOf(`"id": "${slotId}"`);
  if (idIdx === -1) throw new Error(`anchor de id no encontrado: ${slotId}`);
  const slotStart = findEnclosingBraceStart(text, idIdx);
  const slotEnd = matchBraceEnd(text, slotStart);

  const slotSlice = text.slice(slotStart, slotEnd + 1);
  const vRel = slotSlice.indexOf('"variants"');
  if (vRel === -1) throw new Error(`el slot '${slotId}' no declara "variants"`);
  const arrStart = text.indexOf('[', slotStart + vRel);
  if (arrStart === -1 || arrStart > slotEnd) throw new Error(`no se encontró el array "variants" del slot '${slotId}'`);
  const arrEnd = matchBracketEnd(text, arrStart);

  const variants = childObjectRanges(text, arrStart, arrEnd);
  if (k < 0 || k >= variants.length) {
    throw new Error(`índice de variante ${k} fuera de rango en el slot '${slotId}': el texto declara ${variants.length} variante(s)`);
  }
  const [variantStart, variantEnd] = variants[k];

  const variantSlice = text.slice(variantStart, variantEnd + 1);
  const tRel = variantSlice.indexOf('"translationES"');
  if (tRel === -1) throw new Error(`la variante ${k} del slot '${slotId}' no declara "translationES"`);
  const tStart = text.indexOf('{', variantStart + tRel);
  if (tStart === -1 || tStart > variantEnd) throw new Error(`"translationES" de ${slotId}#${k} no abre objeto`);
  const tEnd = matchBraceEnd(text, tStart);

  return { slotStart, slotEnd, arrStart, arrEnd, variantCount: variants.length, variantStart, variantEnd, tStart, tEnd };
}

function formatValidationBody(status, passes, ind) {
  return JSON.stringify({ status, passes }, null, 2)
    .split('\n').map((l, idx) => (idx === 0 ? l : ind + l)).join('\n');
}

/**
 * Transformación PURA del texto del fichero: devuelve el texto nuevo con el pase
 * escrito en `variants[k].translationES.validation`. Se separa del I/O para poder
 * probarla por escritura real y diff de líneas.
 */
export function applyPassToText(text, slotId, k, pass) {
  const loc = locateVariantTranslation(text, slotId, k);
  const tSlice = text.slice(loc.tStart, loc.tEnd + 1);
  const vRel = tSlice.indexOf('"validation"');

  if (vRel !== -1) {
    // UPDATE: el bloque ya existe DENTRO de translationES (nunca el del slot ni el
    // de una variante hermana: el slice está acotado a este sub-objeto).
    const keyIdx = loc.tStart + vRel;
    const braceStart = text.indexOf('{', keyIdx);
    const braceEnd = matchBraceEnd(text, braceStart);
    const cur = JSON.parse(text.slice(braceStart, braceEnd + 1));
    const passes = (Array.isArray(cur.passes) ? cur.passes : []).filter((p) => p.by !== pass.by);
    passes.push(pass);
    const status = deriveStatus(passes);
    const ind = indentAtOffset(text, keyIdx); // derivada del disco, NO transcrita
    const body = formatValidationBody(status, passes, ind);
    return {
      text: text.slice(0, keyIdx) + `"validation": ${body}` + text.slice(braceEnd + 1),
      status,
      mode: 'update',
      passCount: passes.length,
      // El array EXACTO que se serializó, para que la post-condición pueda confrontar
      // lo que quedó en el fichero con lo que esta función dice haber compuesto.
      passesEscritos: passes,
    };
  }

  // INSERT: translationES no tiene validation todavía. Se inserta justo antes del
  // `}` de cierre de translationES, derivando la indentación del disco.
  //
  // FAIL-LOUD ANTES DE COMPONER (CR-02): la rama INSERT asume que hay un campo
  // previo del que colgar la coma —`headTrimmed` acaba en `{` e `insertion` empieza
  // en `,`—, así que sobre un `translationES` SIN campos produce `"translationES": {,`
  // y deja el fichero de contenido con JSON inválido en disco. Reproducido ejecutando.
  // Por la CLI el caso es hoy inalcanzable (`resolveTarget` exige `translationES.text`
  // no vacío y sale con exit 2), pero esta función es un export PÚBLICO y los tests ya
  // la invocan saltándose `resolveTarget`: el escritor tiene que defenderse solo.
  const cuerpoTranslation = text.slice(loc.tStart + 1, loc.tEnd).trim();
  if (!cuerpoTranslation) {
    throw new Error(
      `"translationES" de ${slotId}#${k} no declara ningún campo: no hay traducción que validar, ` +
        `y colgar aquí un bloque validation dejaría el fichero con JSON inválido. No se compone nada.`
    );
  }
  const passes = [pass];
  const status = deriveStatus(passes);
  const before = text.slice(0, loc.tEnd);
  const closingIndent = before.slice(before.lastIndexOf('\n') + 1).match(/^\s*/)[0];
  const fieldIndent = closingIndent + '  ';
  const body = formatValidationBody(status, passes, fieldIndent);
  // El `,` que separa el último campo del nuevo debe quedar PEGADO al cierre de ese
  // último campo (no en línea propia).
  const headTrimmed = before.replace(/\s+$/, '');
  const insertion = `,\n${fieldIndent}"validation": ${body}\n${closingIndent}`;
  return {
    text: headTrimmed + insertion + text.slice(loc.tEnd),
    status,
    mode: 'insert',
    passCount: 1,
    passesEscritos: passes,
  };
}

/**
 * POST-CONDICIÓN DEL SPLICE (CR-02). `applyPassToText` es una transformación de
 * TEXTO, no una serialización: nada garantiza por construcción que su salida siga
 * siendo el mismo documento con un solo bloque cambiado. Esto lo comprueba ANTES de
 * que nada toque el disco, y lanza con el motivo si no se cumple.
 *
 * Verifica TRES cosas, de menos a más específica:
 *   1. que el resultado PARSEA (el modo de fallo reproducido en el review: la rama
 *      INSERT sobre un `translationES` vacío producía `"translationES": {,`);
 *   2. que el bloque escrito es exactamente el que la función dice haber escrito;
 *   3. que NO se tocó nada más — la propiedad de «cero contaminación» del
 *      re-estrechado (invariante 8 de la fase), que hasta ahora solo se había
 *      comprobado a mano en un barrido puntual. Este escritor va a correr cientos de
 *      veces sobre 722 traducciones en las fases 47-53; la comprobación cuesta un
 *      par de `JSON.parse` y convierte ese barrido en un invariante de cada escritura.
 */
function verificarPostcondicion(textoAntes, out, slotId, k) {
  let despues;
  try {
    despues = JSON.parse(out.text);
  } catch (e) {
    throw new Error(
      `el pase de ${slotId}#${k} habría dejado el fichero con JSON INVÁLIDO (${e.message}); ` +
        `no se ha escrito nada`
    );
  }
  const antes = JSON.parse(textoAntes);

  const localizar = (doc) => {
    const slot = (doc?.exercises || []).find((e) => e?.id === slotId);
    return slot?.variants?.[k]?.translationES;
  };
  const tDespues = localizar(despues);
  if (!tDespues || typeof tDespues !== 'object') {
    throw new Error(`tras el splice, ${slotId}#${k} ya no declara un "translationES" objeto; no se ha escrito nada`);
  }
  const escrito = JSON.stringify(tDespues.validation);
  const esperado = JSON.stringify({ status: out.status, passes: out.passesEscritos });
  if (escrito !== esperado) {
    throw new Error(
      `el bloque validation que quedó en ${slotId}#${k} no es el que se compuso ` +
        `(quedó ${escrito}, se compuso ${esperado}); no se ha escrito nada`
    );
  }

  // Cero contaminación: con el bloque objetivo neutralizado en AMBOS documentos, el
  // resto del fichero tiene que ser idéntico. Así se caza un splice que además haya
  // tocado el `validation` del SLOT, el de una variante HERMANA o cualquier otro campo.
  const neutralizar = (doc) => {
    const t = localizar(doc);
    if (t && typeof t === 'object') delete t.validation;
    return JSON.stringify(doc);
  };
  if (neutralizar(antes) !== neutralizar(despues)) {
    throw new Error(
      `el pase de ${slotId}#${k} habría cambiado algo MÁS que su propio bloque validation ` +
        `(contaminación del splice); no se ha escrito nada`
    );
  }
}

/**
 * La región crítica es el read-modify-write COMPLETO: el readFileSync inicial y la
 * escritura viven dentro del callback del lock (dos corridas simultáneas sobre el
 * mismo fichero perderían un pase si no).
 *
 * ESCRITURA ATÓMICA (CR-02): temp en el MISMO directorio + `rename`. Antes era un
 * `writeFileSync` sobre el fichero original, así que un proceso que muriese a mitad
 * —y muere, ver WR-02— dejaba el corpus TRUNCADO. `withFileLock` protege del *lost
 * update* entre procesos, no de esto. El temp no acaba en `.json`, así que `findSlot`
 * (que filtra por esa extensión) no puede llegar a verlo ni aunque quede huérfano.
 */
export async function writeTranslationPass(file, slotId, k, pass) {
  return withFileLock(file, () => {
    const text = fs.readFileSync(file, 'utf8');
    const out = applyPassToText(text, slotId, k, pass);
    verificarPostcondicion(text, out, slotId, k);

    const tmp = `${file}.tmp-${process.pid}`;
    try {
      fs.writeFileSync(tmp, out.text);
      fs.renameSync(tmp, file);
    } catch (e) {
      try { fs.unlinkSync(tmp); } catch { /* el temp puede no existir: no enmascarar el error real */ }
      throw e;
    }
    console.error(
      `✔ ${out.mode === 'update' ? 'actualizado' : 'INSERTADO'} pase ${pass.by} → ${slotId}#${k}.translationES (status: ${out.status})`
    );
    return out;
  });
}

// ── entrypoint CLI ──────────────────────────────────────────────────────────
async function main(argv) {
  const cfg = parseArgs(argv);
  const parsed = parseAddress(cfg.address);
  if (!parsed) {
    console.error(`Error: falta o es inválida la dirección compuesta '<slot-id>#<k>' (k = índice de variante, base 0).\n${USAGE}`);
    process.exit(2);
  }
  const target = resolveTarget(parsed.slotId, parsed.k);
  if (target.error) {
    console.error(`Error: ${target.error}`);
    process.exit(2);
  }
  const composed = composePrompt(target);
  if (composed.includes('"italianoResuelto": null')) {
    console.error(`Error: no se pudo rellenar el hueco de '${parsed.slotId}#${parsed.k}': el prompt no contiene "___" o correctIndex no apunta a una opción.`);
    process.exit(2);
  }
  if (cfg.DRY) { console.log(composed); process.exit(0); }

  // El contrato §4 se deriva ANTES de llamar a nadie (CR-03). Si el doc de criterios no
  // declara un shape parseable, el contrato que se le está pidiendo al modelo es
  // desconocido y no se gasta ni una llamada de pago: exit 2, la misma familia que
  // «dirección o target inválidos» — fallos de invocación, cero tokens quemados.
  let contrato;
  try {
    contrato = contratoVigente();
  } catch (e) {
    console.error(
      `Error: no se pudo derivar el contrato del §4 de ${PROMPT_PATH}: ${e.message}\n` +
        `Sin contrato no se puede comprobar el veredicto que devuelva el modelo, así que no se llama a nadie.`
    );
    process.exit(2);
  }

  const pass = await run(cfg, target, composed, callModel, contrato);
  if (!pass) process.exit(1);
  console.log(JSON.stringify(pass, null, 2));
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) main(process.argv.slice(2));
