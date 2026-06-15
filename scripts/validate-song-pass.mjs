// scripts/validate-song-pass.mjs
//
// Pase de validación de quórum multi-proveedor (cross-vendor) para FRASES DE
// CANCIÓN (traducción italiano→español troceada). Espejo de
// `scripts/validate-ai-pass.mjs` (ejercicios), adaptado a canciones:
//   - busca la frase en content/songs/*.json y tests/fixtures/*.json → `data.phrases`
//     (NO `data.exercises`),
//   - compone el prompt con docs/SONG-VALIDATION-PROMPT.md (reglas S1-S5),
//   - DIFERENCIA CLAVE: su writePass INSERTA el bloque `validation` en la frase
//     si NO existe (el de ejercicios asume que ya existe). Si existe, reemplaza
//     el pase del mismo `by` y re-deriva el status.
//
// Un pase lo emite UN modelo externo (Gemini / DeepSeek) sobre UNA frase —
// NUNCA batched (VAL-03): cada invocación ve una sola frase, fresh context.
//
// Zero-deps: sólo `https`/`fs`/`path` nativos. Lee claves de `.env`
// (GEMINI_API_KEY, DEEPSEEK_API_KEY).
//
// AUTO-FALLBACK: si el modelo primario agota su límite (429) tras reintentos,
// se prueba con el siguiente modelo de `--fallback`. El `by` registrado es
// SIEMPRE el modelo que de verdad respondió — el quórum se computa sobre el
// `by` real (deriveStatus).
//
// Uso:
//   node scripts/validate-song-pass.mjs <phrase-id> [opciones]
//     --model=<id>        modelo primario (default deepseek-chat)
//     --fallback=a,b,c    modelos a probar si el primario rate-limitea (en orden)
//     --avoid=x,y         modelos a NO usar (p.ej. el `by` del otro pase del quórum)
//     --write             inserta/actualiza el pase en validation.passes[] y re-deriva status
//     --dry-run           imprime el prompt compuesto y sale
//     --temp=<n>          temperature (default 0.2)
//
// Modelos soportados (routing por prefijo):
//   gemini-*    → generativelanguage.googleapis.com   (GEMINI_API_KEY)
//   deepseek-*  → api.deepseek.com (OpenAI-compat)     (DEEPSEEK_API_KEY)
//   ids reales: gemini-2.5-flash, deepseek-chat, deepseek-reasoner,
//               deepseek-v4-flash, deepseek-v4-pro
//
// QUÓRUM (orden de disponibilidad): DeepSeek → Gemini → Sonnet → Opus.
// En la práctica: DeepSeek primario + Gemini fallback (este script, con --avoid
// para garantizar 2 `by` distintos). El pase Claude (Sonnet/Opus) NO se hace
// aquí: corre vía subagente Task como fallback si los externos fallan.

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { deriveStatus } from '../src/data/validation-state.js'; // fuente única (WR-01)

const PROMPT_PATH = 'docs/SONG-VALIDATION-PROMPT.md';

// ── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const phraseId = args.find((a) => !a.startsWith('--'));
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

if (!phraseId) {
  console.error('Error: falta <phrase-id>. Uso: node scripts/validate-song-pass.mjs <id> [--model=] [--fallback=a,b] [--write]');
  process.exit(2);
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
function providerFor(model) {
  if (model.startsWith('gemini-')) return 'gemini';
  if (model.startsWith('deepseek-')) return 'deepseek';
  throw new Error(`modelo no soportado por este script: ${model} (usa gemini-* o deepseek-*; Claude va por subagente Task)`);
}
function keyFor(provider) {
  const k = provider === 'gemini' ? ENV.GEMINI_API_KEY : ENV.DEEPSEEK_API_KEY;
  return k;
}

// ── localizar frase de canción ──────────────────────────────────────────────
// Las frases viven en `data.phrases` (NO `data.exercises`). El golden-negative
// vive en tests/fixtures/song-golden.json → incluir tests/fixtures en el escaneo.
function findSongPhrase(id) {
  for (const dir of ['content/songs', 'tests/fixtures']) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const full = path.join(dir, f);
      let data;
      try { data = JSON.parse(fs.readFileSync(full, 'utf8')); } catch { continue; }
      const arr = Array.isArray(data?.phrases) ? data.phrases : null;
      if (!arr) continue;
      const phrase = arr.find((p) => p && p.id === id);
      if (phrase) return { file: full, phrase };
    }
  }
  return null;
}
const found = findSongPhrase(phraseId);
if (!found) {
  console.error(`Error: frase '${phraseId}' no encontrada en content/songs/*.json ni tests/fixtures/*.json (data.phrases)`);
  process.exit(1);
}

const basePrompt = fs.readFileSync(PROMPT_PATH, 'utf8');
const composed =
  basePrompt + '\n\n## Frase de canción bajo evaluación (DATA)\n\n```json\n' +
  JSON.stringify(found.phrase, null, 2) + '\n```\n';

if (DRY) { console.log(composed); process.exit(0); }

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

async function callModel(model) {
  const provider = providerFor(model);
  const key = keyFor(provider);
  if (!key) return { rateLimited: false, error: `falta API key para ${provider} (.env)` };

  let res;
  if (provider === 'gemini') {
    res = await httpPost({
      hostname: 'generativelanguage.googleapis.com',
      pathName: `/v1beta/models/${model}:generateContent`,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, // WR-02: clave en header, no en query
      body: JSON.stringify({ contents: [{ parts: [{ text: composed }] }], generationConfig: { temperature: TEMP } }),
    });
  } else {
    res = await httpPost({
      hostname: 'api.deepseek.com',
      pathName: '/chat/completions',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages: [{ role: 'user', content: composed }], temperature: TEMP, stream: false }),
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

function extractJsonBlock(text) {
  const re = /```json\s*([\s\S]*?)\s*```/g;
  let m, last;
  while ((m = re.exec(text)) !== null) last = m[1];
  if (!last) return null;
  try { return JSON.parse(last); } catch { return null; }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  for (let qi = 0; qi < MODEL_QUEUE.length; qi++) {
    const model = MODEL_QUEUE[qi];
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let r;
      try { r = await callModel(model); } catch (e) { r = { error: e.message }; }

      if (r.text) {
        const verdict = extractJsonBlock(r.text);
        if (!verdict || !verdict.verdict || !verdict.criteria) {
          console.error(`[${model}] sin bloque JSON válido (intento ${attempt}). Reintentando…`);
          if (attempt === maxRetries) break;
          continue;
        }
        console.error(`── Razonamiento (${model}) ──\n${r.text}\n──`);
        const pass = {
          by: model,
          date: new Date().toISOString().slice(0, 10),
          verdict: verdict.verdict,
          concerns: Array.isArray(verdict.concerns) ? verdict.concerns : [],
        };
        if (WRITE) writePass(found.file, phraseId, pass);
        console.log(JSON.stringify(pass, null, 2));
        return;
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
  process.exit(1);
}

// ── escritura quirúrgica del bloque validation (preserva formato compacto) ──
// deriveStatus se importa de src/data/validation-state.js (fuente única, WR-01).

// CR-01: recorre el bloque { ... } con conciencia de strings/escapes, para que
// llaves dentro de strings (concerns, prompt) no descuadren el contador.
function matchBraceEnd(text, braceStart) {
  let depth = 0, inStr = false, esc = false;
  for (let i = braceStart; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return i; }
  }
  throw new Error('bloque { } sin cierre balanceado');
}

// Encuentra el `{` que abre el OBJETO-FRASE que contiene el anchor de id dado:
// es el último `{` (string-aware) antes del anchor.
function findEnclosingBraceStart(text, anchorIdx) {
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
  if (braceStart === -1) throw new Error(`no se encontró el objeto-frase que contiene ${anchorIdx}`);
  return braceStart;
}

function writePass(file, id, pass) {
  const text = fs.readFileSync(file, 'utf8');
  // anchor con quote de cierre → "...-1" no colisiona con "...-10"
  const idIdx = text.indexOf(`"id": "${id}"`);
  if (idIdx === -1) throw new Error(`anchor de id no encontrado: ${id}`);

  // Acotar el OBJETO-FRASE que contiene este id, para distinguir su `validation`
  // del de otras frases del mismo archivo.
  const objStart = findEnclosingBraceStart(text, idIdx);
  const objEnd = matchBraceEnd(text, objStart);
  const objSlice = text.slice(objStart, objEnd + 1);

  if (objSlice.includes('"validation"')) {
    // CASO EXISTE: comportarse como el de ejercicios (reemplazar pase del mismo by).
    const vRel = objSlice.indexOf('"validation":');
    const vIdx = objStart + vRel;
    const braceStart = text.indexOf('{', vIdx);
    const braceEnd = matchBraceEnd(text, braceStart);
    const cur = JSON.parse(text.slice(braceStart, braceEnd + 1));
    const passes = (Array.isArray(cur.passes) ? cur.passes : []).filter((p) => p.by !== pass.by);
    passes.push(pass);
    const status = deriveStatus(passes);
    const ind = '      ';
    const body = JSON.stringify({ status, passes }, null, 2)
      .split('\n').map((l, idx) => (idx === 0 ? l : ind + l)).join('\n');
    fs.writeFileSync(file, text.slice(0, vIdx) + `"validation": ${body}` + text.slice(braceEnd + 1));
    console.error(`✔ actualizado pase ${pass.by} → ${id} (status: ${status})`);
    return;
  }

  // CASO INSERT: la frase no tiene validation. Insertar el bloque justo antes
  // del `}` de cierre del objeto-frase, preservando el resto del archivo.
  const passes = [pass];
  const status = deriveStatus(passes);
  const ind = '      ';
  const body = JSON.stringify({ status, passes }, null, 2)
    .split('\n').map((l, idx) => (idx === 0 ? l : ind + l)).join('\n');
  // detectar la indentación del cierre (espacios antes del `}` final)
  const before = text.slice(0, objEnd);
  const lastNl = before.lastIndexOf('\n');
  const closingIndent = before.slice(lastNl + 1).match(/^\s*/)[0];
  const fieldIndent = closingIndent + '  ';
  // El `,` que separa el último campo del nuevo debe quedar PEGADO al cierre de
  // ese último campo (no en línea propia). Recortamos el whitespace/newline que
  // precede al `}` de cierre y reinsertamos: <último-campo>,\n<field>"validation"…
  const headTrimmed = before.replace(/\s+$/, '');
  const insertion = `,\n${fieldIndent}"validation": ${body}\n${closingIndent}`;
  fs.writeFileSync(file, headTrimmed + insertion + text.slice(objEnd));
  console.error(`✔ INSERTADO bloque validation (pase ${pass.by}) → ${id} (status: ${status})`);
}

run();
