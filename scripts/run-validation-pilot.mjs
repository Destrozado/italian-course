#!/usr/bin/env node
// scripts/run-validation-pilot.mjs
//
// Reporter del piloto Phase 9 (Plan 09-03) — enforce del gate D-VAL-15.
// Lee los 3 ejercicios del piloto (que el skill `gsd-validate-exercise` YA
// debe haber mutado in-place con el campo `validation`), aplica `deriveStatus`
// del Plan 09-01 sobre cada uno, y verifica las 4 must-haves del gate.
//
// JUSTIFICACIÓN (D-VAL-15): antes de invertir ~1.5-2M tokens en Phase 10
// (271 ejercicios × 2 modelos), el piloto sobre 3 ejercicios reales+fixture
// debe demostrar que el workflow funciona end-to-end:
//   1. Happy path real (E1 = preposiciones-040) → validated.
//   2. Baseline sano (E2 = avere-001) → validated.
//   3. Fixture C5-leak deliberado (E3 = pilot-disputed-c5-leak-001) →
//      disputed con concerns[] tagged [C5-...].
//   4. Parsing limpio primer intento (cero retries — sin [meta] parse failed/retry).
//
// CONSTRAINT (arquitectónica): este script es POST-processing puro. NO invoca
// Task(), NO orquesta subagents, NO muta JSONs — solo lee los archivos que el
// skill YA mutó y verifica el gate. La orquestación es del skill (Plan 09-02).
//
// Uso:
//   node scripts/run-validation-pilot.mjs
//
// Exit codes:
//   0 — los 4 must-haves del gate D-VAL-15 PASS. Phase 10 autorizada.
//   1 — al menos 1 must-have FAIL. Itera Plan 09-01/09-02 antes de Phase 10.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ANSI colors zero-deps (RESEARCH §Recomendaciones #5).
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const ok = (txt) => `${GREEN}${txt}${RESET}`;
const fail = (txt) => `${RED}${txt}${RESET}`;
const warn = (txt) => `${YELLOW}${txt}${RESET}`;

// D-VAL-13: los 3 ejercicios del piloto end-to-end.
const PILOT_EXERCISES = [
  {
    label: 'E1',
    exerciseId: 'preposiciones-040',
    file: 'content/exercises/preposiciones.json',
    expectedStatus: 'validated',
  },
  {
    label: 'E2',
    exerciseId: 'avere-001',
    file: 'content/exercises/avere.json',
    expectedStatus: 'validated',
  },
  {
    label: 'E3',
    exerciseId: 'pilot-disputed-c5-leak-001',
    file: 'tests/fixtures/validation-pilot-disputed.json',
    expectedStatus: 'disputed',
    expectedConcernPrefix: '[C5-',
  },
];

// Carga + extracción defensiva de un ejercicio por id.
function loadExercise(file, exerciseId) {
  const absPath = resolve(projectRoot, file);
  let data;
  try {
    data = JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (err) {
    return { found: false, error: `Error al leer ${file}: ${err.message}` };
  }
  if (!data || !Array.isArray(data.exercises)) {
    return { found: false, error: `${file}: falta el campo "exercises"` };
  }
  const ex = data.exercises.find((e) => e?.id === exerciseId);
  if (!ex) {
    return { found: false, error: `Ejercicio '${exerciseId}' no encontrado en ${file}` };
  }
  return { found: true, ex };
}

// Resumen de un pase para la tabla: "modelo/verdict" o "MISSING".
function passSummary(p) {
  if (!p || typeof p !== 'object') return 'MISSING';
  const by = p.by ?? '?';
  const verdict = p.verdict ?? '?';
  // Acortar el model id para la tabla (sin el prefijo claude-).
  const shortBy = by.replace(/^claude-/, '');
  return `${shortBy}/${verdict}`;
}

// Detecta entries [meta] parse failed o parse retry en cualquier concern.
function hasParseMeta(concerns) {
  if (!Array.isArray(concerns)) return false;
  return concerns.some((c) => typeof c === 'string' && /parse failed|parse retry/.test(c));
}

// ─── Lectura del estado de cada ejercicio ──────────────────────────────────
const rows = [];
let anyParseRetry = false;

for (const item of PILOT_EXERCISES) {
  const { label, exerciseId, file, expectedStatus, expectedConcernPrefix } = item;
  const loaded = loadExercise(file, exerciseId);

  if (!loaded.found) {
    rows.push({
      label,
      exerciseId,
      pass1: 'MISSING',
      pass2: 'MISSING',
      derivedStatus: 'MISSING',
      expected: expectedStatus,
      gate: false,
      reason: loaded.error,
      missing: true,
    });
    continue;
  }

  const ex = loaded.ex;
  const validation = ex.validation;

  if (!validation || typeof validation !== 'object' || !Array.isArray(validation.passes)) {
    rows.push({
      label,
      exerciseId,
      pass1: 'NO validation',
      pass2: 'NO validation',
      derivedStatus: 'absent',
      expected: expectedStatus,
      gate: false,
      reason: `${exerciseId} no tiene campo validation o validation.passes no es array`,
      missing: true,
    });
    continue;
  }

  const passes = validation.passes;
  const derivedStatus = deriveStatus(passes);
  const writtenStatus = validation.status;
  const consistencyOk = writtenStatus === derivedStatus;

  // Gate D-VAL-15 #3 — E3 disputed + concern tagged [C5-...].
  let concernsOk = true;
  if (expectedConcernPrefix) {
    const hasIncorrecta = passes.some((p) => p?.verdict === 'incorrecta');
    const hasTaggedConcern = passes.some(
      (p) =>
        Array.isArray(p?.concerns) &&
        p.concerns.some(
          (c) => typeof c === 'string' && c.startsWith(expectedConcernPrefix),
        ),
    );
    concernsOk = hasIncorrecta && hasTaggedConcern;
  }

  // Gate D-VAL-15 #4 — sin [meta] parse failed/retry en NINGÚN pase.
  const hasParseRetry = passes.some((p) => hasParseMeta(p?.concerns));
  if (hasParseRetry) anyParseRetry = true;

  const statusOk = derivedStatus === expectedStatus;
  const gate = statusOk && consistencyOk && concernsOk && !hasParseRetry;

  rows.push({
    label,
    exerciseId,
    pass1: passSummary(passes[0]),
    pass2: passSummary(passes[1]),
    derivedStatus,
    expected: expectedStatus,
    writtenStatus,
    consistencyOk,
    concernsOk,
    hasParseRetry,
    gate,
    missing: false,
  });
}

// ─── Imprimir tabla colorizada ─────────────────────────────────────────────
console.log('');
console.log(`${BOLD}Piloto Phase 9 — gate D-VAL-15${RESET}`);
console.log('');

const colWidths = {
  label: 5,
  exerciseId: 32,
  pass1: 28,
  pass2: 28,
  derivedStatus: 12,
  expected: 12,
  gate: 6,
};

const headerRow =
  'Label'.padEnd(colWidths.label) +
  ' | ' +
  'Exercise ID'.padEnd(colWidths.exerciseId) +
  ' | ' +
  'pass1.by/verdict'.padEnd(colWidths.pass1) +
  ' | ' +
  'pass2.by/verdict'.padEnd(colWidths.pass2) +
  ' | ' +
  'Derived'.padEnd(colWidths.derivedStatus) +
  ' | ' +
  'Expected'.padEnd(colWidths.expected) +
  ' | ' +
  'Gate';

console.log(headerRow);
console.log('-'.repeat(headerRow.length));

for (const r of rows) {
  const gateCell = r.gate ? ok('PASS'.padEnd(colWidths.gate)) : fail('FAIL'.padEnd(colWidths.gate));
  console.log(
    r.label.padEnd(colWidths.label) +
      ' | ' +
      r.exerciseId.padEnd(colWidths.exerciseId) +
      ' | ' +
      r.pass1.padEnd(colWidths.pass1) +
      ' | ' +
      r.pass2.padEnd(colWidths.pass2) +
      ' | ' +
      String(r.derivedStatus).padEnd(colWidths.derivedStatus) +
      ' | ' +
      String(r.expected).padEnd(colWidths.expected) +
      ' | ' +
      gateCell,
  );
  if (r.reason) {
    console.log(`        ${warn('→ ' + r.reason)}`);
  }
  if (!r.missing && !r.consistencyOk) {
    console.log(
      `        ${warn(`→ inconsistencia: validation.status="${r.writtenStatus}" pero deriveStatus="${r.derivedStatus}"`)}`,
    );
  }
}

// ─── Gate D-VAL-15: 4 sub-gates ────────────────────────────────────────────
console.log('');
console.log(`${BOLD}Gate D-VAL-15 (4 must-haves):${RESET}`);

const subGates = [];

// 1. E1 validated.
const e1 = rows.find((r) => r.label === 'E1');
const e1Pass = e1 && !e1.missing && e1.derivedStatus === 'validated';
subGates.push({ id: 1, label: 'E1 (preposiciones-040) → validated', pass: e1Pass });

// 2. E2 validated.
const e2 = rows.find((r) => r.label === 'E2');
const e2Pass = e2 && !e2.missing && e2.derivedStatus === 'validated';
subGates.push({ id: 2, label: 'E2 (avere-001) → validated', pass: e2Pass });

// 3. E3 disputed + concerns [C5-...].
const e3 = rows.find((r) => r.label === 'E3');
const e3Pass = e3 && !e3.missing && e3.derivedStatus === 'disputed' && e3.concernsOk;
subGates.push({
  id: 3,
  label: 'E3 (pilot-disputed-c5-leak-001) → disputed con concerns [C5-...]',
  pass: e3Pass,
});

// 4. Parsing limpio primer intento (cero [meta] parse failed/retry).
const parseOk = !anyParseRetry;
subGates.push({ id: 4, label: 'Parsing limpio primer intento (cero retries)', pass: parseOk });

for (const g of subGates) {
  const mark = g.pass ? ok('PASS') : fail('FAIL');
  console.log(`  ${g.id}. ${g.label}: ${mark}`);
}

const gatePass = subGates.every((g) => g.pass);

console.log('');
if (gatePass) {
  console.log(ok(`${BOLD}Piloto PASS — Phase 10 autorizada.${RESET}`));
  console.log('');
  process.exit(0);
} else {
  console.log(fail(`${BOLD}Piloto FAIL — itera Plan 09-01 o Plan 09-02 antes de Phase 10.${RESET}`));
  console.log('');
  console.log('Acciones sugeridas según qué sub-gate falla:');
  console.log('  - Sub-gates 1 ó 2 (E1/E2 no validated): probablemente sesgo del prompt o bug en el ejercicio real. Inspecciona concerns[] de los pases.');
  console.log('  - Sub-gate 3 (E3 no disputed): el subagent no detecta el C5-leak. Revisa few-shot FAIL del VALIDATION-PROMPT.md.');
  console.log('  - Sub-gate 4 (parsing): el subagent emite JSON malformado. Revisa la sección 4 (contrato de output) del prompt.');
  console.log('');
  process.exit(1);
}
