// scripts/validate-with-gemini.mjs
//
// Pase de validación de quórum vía Gemini (cross-vendor). Complementa al skill
// `gsd-validate-exercise` (que corre los pases Claude vía Task). Aquí UN pase lo
// emite un modelo Gemini sobre UN ejercicio — NUNCA batched (VAL-03): cada
// invocación ve un solo ejercicio, igual que un subagent fresh-context.
//
// Zero-deps: sólo `https`/`fs` nativos. Lee la clave de `.env` (GEMINI_API_KEY).
//
// Uso:
//   node scripts/validate-with-gemini.mjs <exercise-id> [opciones]
//     --model=<id>   modelo Gemini (default gemini-2.5-flash). Pro requiere billing.
//     --write        inserta el pase en passes[] del ejercicio y re-deriva status
//                    (cirugía de texto: respeta el formato compacto del JSON).
//     --dry-run      imprime el prompt compuesto y sale (no llama a la API).
//     --temp=<n>     temperature (default 0.2).
//
// Salida (stdout): el pase JSON {by,date,verdict,concerns} listo para passes[].
//   El razonamiento (chain-of-thought) del modelo va a stderr.
//
// Pool de quórum: ver docs/VALIDACION-QUORUM.md. El invariante (deriveStatus +
// reporter VAL-04) es >=2 pases `correcta` con `by` DISTINTOS y cero `incorrecta`.

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const PROMPT_PATH =
  '.planning/milestones/v1.1-phases/09-infraestructura-de-validaci-n/09-VALIDATION-PROMPT.md';

// ── args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const exId = args.find((a) => !a.startsWith('--'));
const getOpt = (name, def) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : def;
};
const MODEL = getOpt('model', 'gemini-2.5-flash');
const TEMP = parseFloat(getOpt('temp', '0.2'));
const WRITE = args.includes('--write');
const DRY = args.includes('--dry-run');

if (!exId) {
  console.error('Error: falta <exercise-id>. Uso: node scripts/validate-with-gemini.mjs <id> [--model=] [--write] [--dry-run]');
  process.exit(2);
}

// ── .env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const out = {};
  if (!fs.existsSync('.env')) return out;
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const KEY = process.env.GEMINI_API_KEY || loadEnv().GEMINI_API_KEY;
if (!KEY && !DRY) {
  console.error('Error: GEMINI_API_KEY no encontrada (.env o entorno). Copia .env.example a .env.');
  process.exit(2);
}

// ── localizar ejercicio ─────────────────────────────────────────────────────
function findExercise(id) {
  const dirs = ['content/exercises', 'tests/fixtures'];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const full = path.join(dir, f);
      let data;
      try { data = JSON.parse(fs.readFileSync(full, 'utf8')); } catch { continue; }
      const arr = Array.isArray(data) ? data : data.exercises;
      if (!Array.isArray(arr)) continue;
      const ex = arr.find((e) => e && e.id === id);
      if (ex) return { file: full, ex };
    }
  }
  return null;
}
const found = findExercise(exId);
if (!found) {
  console.error(`Error: ejercicio '${exId}' no encontrado en content/exercises/*.json ni tests/fixtures/*.json`);
  process.exit(1);
}

// ── componer prompt ─────────────────────────────────────────────────────────
const basePrompt = fs.readFileSync(PROMPT_PATH, 'utf8');
const composed =
  basePrompt +
  '\n\n## Ejercicio bajo evaluación (DATA)\n\n```json\n' +
  JSON.stringify(found.ex, null, 2) +
  '\n```\n';

if (DRY) { console.log(composed); process.exit(0); }

// ── llamada a Gemini con retry/backoff (429) ────────────────────────────────
function callGemini(model) {
  const body = JSON.stringify({
    contents: [{ parts: [{ text: composed }] }],
    generationConfig: { temperature: TEMP },
  });
  const opts = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${KEY}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
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
  let attempt = 0;
  const maxAttempts = 6;
  while (attempt < maxAttempts) {
    attempt++;
    const res = await callGemini(MODEL);
    if (res.status === 200) {
      let j;
      try { j = JSON.parse(res.body); } catch { console.error('Respuesta no-JSON de Gemini:', res.body.slice(0, 400)); process.exit(1); }
      const text = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text).join('');
      const verdict = extractJsonBlock(text);
      if (!verdict || !verdict.verdict || !verdict.criteria) {
        console.error('No se pudo extraer bloque ```json válido del output. Razonamiento:\n' + text.slice(0, 800));
        process.exit(1);
      }
      console.error('── Razonamiento (' + MODEL + ') ──\n' + text + '\n──');
      const pass = {
        by: MODEL,
        date: new Date().toISOString().slice(0, 10),
        verdict: verdict.verdict,
        concerns: Array.isArray(verdict.concerns) ? verdict.concerns : [],
      };
      if (WRITE) writePass(found.file, exId, pass);
      console.log(JSON.stringify(pass, null, 2));
      return;
    }
    if (res.status === 429) {
      const m = res.body.match(/retry in ([\d.]+)s/i);
      const wait = m ? Math.ceil(parseFloat(m[1])) + 1 : Math.min(60, 5 * attempt);
      console.error(`429 rate-limit (intento ${attempt}/${maxAttempts}) — esperando ${wait}s…`);
      await sleep(wait * 1000);
      continue;
    }
    console.error(`HTTP ${res.status}: ${res.body.slice(0, 400)}`);
    process.exit(1);
  }
  console.error('Agotados los reintentos por rate-limit.');
  process.exit(1);
}

// ── escritura quirúrgica del bloque validation (preserva formato compacto) ──
function deriveStatus(passes) {
  if (passes.some((p) => p?.verdict === 'incorrecta')) return 'disputed';
  const correctas = passes.filter((p) => p?.verdict === 'correcta');
  const distinct = new Set(correctas.map((p) => p?.by).filter(Boolean));
  return correctas.length >= 2 && distinct.size >= 2 ? 'validated' : 'pending';
}

function writePass(file, id, pass) {
  const text = fs.readFileSync(file, 'utf8');
  const idAnchor = `"id": "${id}"`;
  const idIdx = text.indexOf(idAnchor);
  if (idIdx === -1) throw new Error(`anchor de id no encontrado: ${id}`);
  const vKey = '"validation":';
  const vIdx = text.indexOf(vKey, idIdx);
  if (vIdx === -1) throw new Error(`bloque validation no encontrado para ${id}`);
  // localizar { ... } balanceado tras "validation":
  const braceStart = text.indexOf('{', vIdx);
  let depth = 0, i = braceStart;
  for (; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) break; }
  }
  const braceEnd = i; // índice del '}' de cierre
  const oldBlock = text.slice(vIdx, braceEnd + 1);
  // parsear passes actuales del bloque viejo
  const cur = JSON.parse(oldBlock.slice(oldBlock.indexOf('{')));
  const passes = Array.isArray(cur.passes) ? cur.passes.slice() : [];
  // evitar duplicar el mismo `by`
  const filtered = passes.filter((p) => p.by !== pass.by);
  filtered.push(pass);
  const status = deriveStatus(filtered);
  // re-serializar expandido a 6 espacios (formato canónico avere.json)
  const ind = '      '; // 6 espacios = nivel "validation"
  const obj = { status, passes: filtered };
  const body = JSON.stringify(obj, null, 2)
    .split('\n')
    .map((l, idx) => (idx === 0 ? l : ind + l))
    .join('\n');
  const newBlock = `"validation": ${body}`;
  fs.writeFileSync(file, text.slice(0, vIdx) + newBlock + text.slice(braceEnd + 1));
  console.error(`✔ escrito pase ${pass.by} → ${id} (status: ${status})`);
}

run();
