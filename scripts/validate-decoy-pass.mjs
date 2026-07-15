// scripts/validate-decoy-pass.mjs — quick-260715-hf5
//
// Pase de validación de quórum cross-vendor para los DECORADORES (decoys) de
// una frase de canción: valida `decoyBank` (distractors + pos) contra las
// reglas D1-D5 de docs/DECOY-VALIDATION-PROMPT.md.
//
// Espejo de scripts/validate-song-pass.mjs (traducción), con dos diferencias:
//   - el prompt es docs/DECOY-VALIDATION-PROMPT.md,
//   - el pase se escribe en `phrase.decoyBank.validation` (NO en el
//     `phrase.validation` de la traducción, que queda intacto).
//
// La escritura re-serializa el archivo completo con `serializeSong` (formato
// del corpus), en lugar del parche quirúrgico del script de canciones — así el
// bloque anidado decoyBank.validation se maneja sin frágiles cuentas de llaves.
// `serializeSong` se EXPORTA para que el generador de contenido produzca el
// mismo formato (round-trip estable).
//
// Zero-deps runtime: https/fs/path nativos + deriveStatus (fuente única WR-01).
// Claves en .env (GEMINI_API_KEY, DEEPSEEK_API_KEY).
//
// Uso:
//   node scripts/validate-decoy-pass.mjs <phrase-id> [--model=] [--fallback=a,b] [--avoid=x] [--write] [--dry-run] [--temp=n]

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { deriveStatus } from '../src/data/validation-state.js';

const PROMPT_PATH = 'docs/DECOY-VALIDATION-PROMPT.md';

// ── serializador (formato corpus) — EXPORTADO ───────────────────────────────
function serPass(x) {
  const concerns = Array.isArray(x.concerns) ? x.concerns : [];
  const cser = concerns.length === 0
    ? '[]'
    : '[\n' + concerns.map((c) => '              ' + JSON.stringify(c)).join(',\n') + '\n            ]';
  return [
    '          {',
    `            "by": ${JSON.stringify(x.by)},`,
    `            "date": ${JSON.stringify(x.date)},`,
    `            "verdict": ${JSON.stringify(x.verdict)},`,
    `            "concerns": ${cser}`,
    '          }',
  ].join('\n');
}

function serValidation(v, indent) {
  // indent = espacios del `"validation"` (p.ej. 6 u 8). passes anidan +4/+6.
  const passes = (Array.isArray(v.passes) ? v.passes : []).map(serPass).join(',\n');
  const status = v.status;
  return [
    '{',
    `${' '.repeat(indent + 2)}"status": ${JSON.stringify(status)},`,
    `${' '.repeat(indent + 2)}"passes": [`,
    passes || '',
    `${' '.repeat(indent + 2)}]`,
    `${' '.repeat(indent)}}`,
  ].filter((l) => l !== '').join('\n');
}

function serDecoyBank(db) {
  const dist = '[' + (db.distractors ?? []).map((t) => JSON.stringify(t)).join(', ') + ']';
  const posEntries = Object.entries(db.pos ?? {});
  const posBody = posEntries.map(([k, v]) => `          ${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n');
  const lines = [
    '{',
    `        "distractors": ${dist},`,
    '        "pos": {',
    posBody,
    '        }',
  ];
  if (db.validation) {
    lines[lines.length - 1] = '        }' + ',';
    lines.push(`        "validation": ${serValidation(db.validation, 8)}`);
  }
  lines.push('      }');
  return lines.join('\n');
}

function serPhrase(p) {
  const ans = '[' + (p.answer ?? []).map((t) => JSON.stringify(t)).join(', ') + ']';
  const lines = [
    '    {',
    `      "id": ${JSON.stringify(p.id)},`,
    `      "prompt": ${JSON.stringify(p.prompt)},`,
    `      "answer": ${ans},`,
    `      "categoryIds": []`,
  ];
  if (p.validation) {
    lines[lines.length - 1] += ',';
    lines.push(`      "validation": ${serValidation(p.validation, 6)}`);
  }
  if (p.decoyBank) {
    lines[lines.length - 1] += ',';
    lines.push(`      "decoyBank": ${serDecoyBank(p.decoyBank)}`);
  }
  lines.push('    }');
  return lines.join('\n');
}

export function serializeSong(song) {
  const out = `{
  "id": ${JSON.stringify(song.id)},
  "title": ${JSON.stringify(song.title)},
  "phrases": [
${song.phrases.map(serPhrase).join(',\n')}
  ]
}
`;
  JSON.parse(out); // sanity
  return out;
}

// ── main (guarded) ───────────────────────────────────────────────────────────
function main() {
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
  const MODEL_QUEUE = [PRIMARY, ...FALLBACK].filter((m, i, a) => a.indexOf(m) === i && !AVOID.has(m));

  if (!phraseId) {
    console.error('Error: falta <phrase-id>. Uso: node scripts/validate-decoy-pass.mjs <id> [--model=] [--fallback=a,b] [--write]');
    process.exit(2);
  }

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

  function providerFor(model) {
    if (model.startsWith('gemini-')) return 'gemini';
    if (model.startsWith('deepseek-')) return 'deepseek';
    throw new Error(`modelo no soportado: ${model} (gemini-* o deepseek-*; Claude va por subagente Task)`);
  }
  const keyFor = (provider) => (provider === 'gemini' ? ENV.GEMINI_API_KEY : ENV.DEEPSEEK_API_KEY);

  function findSongPhrase(id) {
    for (const dir of ['content/songs', 'tests/fixtures']) {
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
        const full = path.join(dir, f);
        let data;
        try { data = JSON.parse(fs.readFileSync(full, 'utf8')); } catch { continue; }
        const arr = Array.isArray(data?.phrases) ? data.phrases : null;
        if (!arr) continue;
        const idx = arr.findIndex((p) => p && p.id === id);
        if (idx !== -1) return { file: full, data, idx, phrase: arr[idx] };
      }
    }
    return null;
  }
  const found = findSongPhrase(phraseId);
  if (!found) {
    console.error(`Error: frase '${phraseId}' no encontrada en content/songs/*.json ni tests/fixtures/*.json`);
    process.exit(1);
  }
  if (!found.phrase.decoyBank) {
    console.error(`Error: la frase '${phraseId}' no tiene decoyBank que validar.`);
    process.exit(1);
  }

  // Solo se adjunta lo relevante para D1-D5 (prompt, answer, decoyBank).
  const dataPayload = {
    id: found.phrase.id,
    prompt: found.phrase.prompt,
    answer: found.phrase.answer,
    decoyBank: { distractors: found.phrase.decoyBank.distractors, pos: found.phrase.decoyBank.pos },
  };
  const basePrompt = fs.readFileSync(PROMPT_PATH, 'utf8');
  const composed = basePrompt + '\n\n## Frase bajo evaluación (DATA)\n\n```json\n' +
    JSON.stringify(dataPayload, null, 2) + '\n```\n';

  if (DRY) { console.log(composed); process.exit(0); }

  const REQUEST_TIMEOUT_MS = 120000;
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
    if (!key) return { error: `falta API key para ${provider} (.env)` };
    let res;
    if (provider === 'gemini') {
      res = await httpPost({
        hostname: 'generativelanguage.googleapis.com',
        pathName: `/v1beta/models/${model}:generateContent`,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
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
      const hdr = parseInt(res.headers?.['retry-after'], 10);
      const m = res.body.match(/retry in ([\d.]+)s/i);
      const retryAfter = Number.isFinite(hdr) ? hdr + 1 : m ? Math.ceil(parseFloat(m[1])) + 1 : null;
      return { rateLimited: true, retryAfter, body: res.body };
    }
    if (res.status >= 500) return { retriable: true, error: `HTTP ${res.status}: ${res.body.slice(0, 200)}` };
    if (res.status !== 200) return { error: `HTTP ${res.status}: ${res.body.slice(0, 300)}` };
    let text;
    try {
      const j = JSON.parse(res.body);
      text = provider === 'gemini'
        ? (j.candidates?.[0]?.content?.parts || []).map((p) => p.text).join('')
        : j.choices?.[0]?.message?.content || '';
    } catch { return { error: 'respuesta no-JSON: ' + res.body.slice(0, 300) }; }
    return { text };
  }

  function extractJsonBlock(text) {
    const re = /```json\s*([\s\S]*?)\s*```/g;
    let m, last;
    while ((m = re.exec(text)) !== null) last = m[1];
    if (!last) return null;
    try { return JSON.parse(last); } catch { return null; }
  }

  function writePass(pass) {
    const { file, data, idx } = found;
    const phrase = data.phrases[idx];
    const cur = phrase.decoyBank.validation && Array.isArray(phrase.decoyBank.validation.passes)
      ? phrase.decoyBank.validation.passes : [];
    const passes = cur.filter((p) => p.by !== pass.by);
    passes.push(pass);
    const status = deriveStatus(passes);
    phrase.decoyBank.validation = { status, passes };
    fs.writeFileSync(file, serializeSong(data));
    console.error(`✔ decoyBank.validation ${pass.by} → ${phrase.id} (status: ${status})`);
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  (async function run() {
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
          if (WRITE) writePass(pass);
          console.log(JSON.stringify(pass, null, 2));
          return;
        }
        if (r.rateLimited) {
          const wait = r.retryAfter ?? Math.min(45, 5 * attempt);
          const hasFallback = qi < MODEL_QUEUE.length - 1;
          if (hasFallback) { console.error(`[${model}] 429 → AUTO-FALLBACK a '${MODEL_QUEUE[qi + 1]}'`); break; }
          console.error(`[${model}] 429 rate-limit, sin fallback — esperando ${wait}s (${attempt}/${maxRetries})`);
          if (attempt === maxRetries) break;
          await sleep(wait * 1000);
          continue;
        }
        if (r.retriable && attempt < maxRetries) {
          console.error(`[${model}] ${r.error} — reintento (${attempt}/${maxRetries})`);
          await sleep(Math.min(20, 3 * attempt) * 1000);
          continue;
        }
        console.error(`[${model}] error: ${r.error}`);
        break;
      }
    }
    console.error('Agotados todos los modelos de la cola. Pase no emitido.');
    process.exit(1);
  })();
}

// Ejecuta solo si se invoca directamente (no al importar serializeSong).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
