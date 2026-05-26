#!/usr/bin/env node
// scripts/run-validation-271.mjs
//
// Reporter del milestone v1.1 Phase 10 — gate VAL-04 + VAL-06 + VAL-08.
// Lee los 271 ejercicios distribuidos en los 7 archivos `content/exercises/*.json`
// (orden lockeado D-VAL-22), aplica `deriveStatus` de Plan 09-01 sobre cada
// `validation.passes[]`, y verifica los 3 sub-gates del milestone v1.1.
//
// SUB-GATES (RESEARCH §Q5 + PATTERNS.md §run-validation-271):
//   1. VAL-04 — todos los validated tienen passes con ≥2 entries `correcta`
//      con `by` DISTINTOS (Set size ≥2). El override del autor en path-B
//      D-VAL-25 cuenta como una entry `by:"autor"` válida.
//   2. VAL-06 — los 271 con `validation.status === "validated"` (vía el
//      helper `effectiveStatus()` que relaja sticky ante override del
//      autor — RESEARCH Open Q #1 opción c).
//   3. VAL-08 — cero ejercicios con `effectiveStatus === "disputed"`. La
//      cola D-VAL-25/26 procesa cada disputed hasta uno de los 3 caminos
//      cerrados (accept-fix / reject+override / rewrite manual).
//
// CONSTRAINT (arquitectónica): este script es POST-processing PURO. NO invoca
// Task(), NO orquesta subagents, NO muta JSONs, NO corre `node --test` (el
// smoke test estricto VAL-07 se activa como paso MANUAL separado tras el
// PASS — gesto consciente del autor al cierre del milestone, RESEARCH §Q5
// + §Q6). El reporter solo lee y reporta.
//
// JUSTIFICACIÓN de NO shellear `node --test` (RESEARCH §Q5 #2 + §TL;DR #4):
//   (a) Confunde exit-code semantics (test failure ≠ gate failure).
//   (b) Acopla dos responsabilidades (estado JSONs vs comportamiento código).
//   (c) El autor flippea VAL_07_STRICT=1 conscientemente como gesto de
//       milestone-close — debe ser acción separada y explícita, no efecto
//       secundario de correr el reporter.
//
// Uso:
//   node scripts/run-validation-271.mjs
//
// Exit codes:
//   0 — los 3 sub-gates VAL-04 + VAL-06 + VAL-08 PASS. Milestone gate PASS.
//       Autor procede al paso manual: `VAL_07_STRICT=1 node --test tests/*.test.js`
//       y luego `/gsd:complete-milestone v1.1`.
//   1 — al menos 1 sub-gate FAIL. Itera `/gsd-validate-batch` antes de cerrar.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { deriveStatus } from '../src/data/validation-state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// ANSI colors zero-deps (clonar literal de run-validation-pilot.mjs).
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

const ok = (txt) => `${GREEN}${txt}${RESET}`;
const fail = (txt) => `${RED}${txt}${RESET}`;
const warn = (txt) => `${YELLOW}${txt}${RESET}`;

// D-VAL-22 orden lockeado: riesgo-first (preposiciones) + alfabético resto.
// La suma de `expected` es 271 (cf. PROJECT.md §Phase 4-5 + REQUIREMENTS.md
// VAL-06). El reporter falla si la suma encontrada en disco no coincide con
// el expected — protege contra archivos JSON con ejercicios borrados/duplicados.
const CATEGORIES = [
  { slug: 'preposiciones',            file: 'content/exercises/preposiciones.json',            expected: 50 },
  { slug: 'avere',                    file: 'content/exercises/avere.json',                    expected: 23 },
  { slug: 'essere',                   file: 'content/exercises/essere.json',                   expected: 39 },
  { slug: 'genero-numero',            file: 'content/exercises/genero-numero.json',            expected: 40 },
  { slug: 'profesiones',              file: 'content/exercises/profesiones.json',              expected: 51 },
  { slug: 'sustantivos-irregulares',  file: 'content/exercises/sustantivos-irregulares.json',  expected: 31 },
  { slug: 'verbos-movimiento',        file: 'content/exercises/verbos-movimiento.json',        expected: 37 },
];

const TOTAL_EXPECTED = 271;

/**
 * Relax path-B (RESEARCH Open Q #1 opción c): si `deriveStatus` da `disputed`
 * pero existe entry `{by:"autor", verdict:"correcta"}` en `passes[]`, el
 * ejercicio se trata como `validated`. Esto materializa el override consciente
 * del autor (D-VAL-25 camino b) sin requerir whitelist externa ni BYPASS del
 * sticky D-VAL-07 que vive en el JSON escrito.
 *
 * Razón: D-VAL-25 camino b escribe `validation.status = "validated"` directo
 * en el JSON sin tocar `passes[]` (las dos entries `incorrecta` históricas
 * siguen presentes para audit trail). Sin este relax, `deriveStatus` vería
 * la `incorrecta` y devolvería `disputed` → inconsistencia ruidosa pero
 * legítima (override del autor = validated efectivo).
 */
function effectiveStatus(passes) {
  const derived = deriveStatus(passes);
  if (derived !== 'disputed') return derived;
  const hasAuthorOverride = Array.isArray(passes) && passes.some(
    (p) => p?.by === 'autor' && p?.verdict === 'correcta'
  );
  return hasAuthorOverride ? 'validated' : 'disputed';
}

/**
 * Carga defensiva de una categoría completa. Devuelve `{ok, exercises}` o
 * `{ok:false, error}`. NUNCA throws — el batch debe poder continuar reportando
 * el resto de categorías aunque una esté corrupta (defensa en profundidad
 * frente a T-10-02-02 del threat model).
 */
function loadCategory(file) {
  const absPath = resolve(projectRoot, file);
  let data;
  try {
    data = JSON.parse(readFileSync(absPath, 'utf8'));
  } catch (err) {
    return { ok: false, error: `Error al leer ${file}: ${err.message}` };
  }
  if (!data || !Array.isArray(data.exercises)) {
    return { ok: false, error: `${file}: falta el campo "exercises" o no es array` };
  }
  return { ok: true, exercises: data.exercises };
}

// ─── Iteración por categoría ──────────────────────────────────────────────
const perCategory = [];
let anyLoadError = false;

for (const { slug, file, expected } of CATEGORIES) {
  const loaded = loadCategory(file);
  if (!loaded.ok) {
    anyLoadError = true;
    perCategory.push({
      slug,
      file,
      expected,
      total: 0,
      validated: 0,
      disputed: 0,
      pending: 0,
      missing: 0,
      disputedIds: [],
      missingMultiPassIds: [],
      inconsistencyIds: [],
      loadError: loaded.error,
    });
    continue;
  }

  const exercises = loaded.exercises;
  let validated = 0;
  let disputed = 0;
  let pending = 0;
  let missing = 0;
  const disputedIds = [];
  const missingMultiPassIds = [];
  const inconsistencyIds = [];

  for (const ex of exercises) {
    const v = ex?.validation;
    // Rama defensive: ejercicio sin `validation` field o sin `passes` array.
    // Esto cubre el estado pre-batch (la mayoría de los 269 pendientes hoy)
    // y NO crashea el reporter — solo lo cuenta como missing.
    if (!v || typeof v !== 'object' || !Array.isArray(v.passes)) {
      missing++;
      continue;
    }

    const passes = v.passes;
    const eff = effectiveStatus(passes);

    if (eff === 'validated') {
      validated++;
      // VAL-04 enforcement: entre los validated, contar entries `correcta`
      // con `by` DISTINTOS. El override del autor (`by:"autor"`) cuenta
      // como una de las ≥2 distinct (D-VAL-25 camino b lo prevé).
      const distinctBy = new Set(
        passes
          .filter(p => p?.verdict === 'correcta')
          .map(p => p?.by)
          .filter(Boolean)
      );
      if (distinctBy.size < 2) {
        missingMultiPassIds.push(ex.id);
      }
    } else if (eff === 'disputed') {
      disputed++;
      disputedIds.push(ex.id);
    } else {
      pending++;
    }

    // Warning de consistencia: si el `status` escrito en el JSON difiere del
    // `effectiveStatus(passes)` derivado, hay desincronía (edición manual
    // descuidada, race condition, etc.). NO es FAIL — solo warning informativo.
    if (typeof v.status === 'string' && v.status !== eff) {
      inconsistencyIds.push(`${ex.id} (escrito="${v.status}", derivado="${eff}")`);
    }
  }

  perCategory.push({
    slug,
    file,
    expected,
    total: exercises.length,
    validated,
    disputed,
    pending,
    missing,
    disputedIds,
    missingMultiPassIds,
    inconsistencyIds,
  });
}

// ─── Imprimir tabla colorizada ────────────────────────────────────────────
console.log('');
console.log(`${BOLD}Milestone v1.1 — gate Phase 10 (VAL-04 + VAL-06 + VAL-08)${RESET}`);
console.log('');

const colWidths = {
  categoria: 24,
  total: 8,
  validated: 10,
  disputed: 9,
  pending: 8,
  missing: 8,
};

const headerRow =
  'Categoría'.padEnd(colWidths.categoria) +
  ' | ' +
  'Total'.padEnd(colWidths.total) +
  ' | ' +
  'Validated'.padEnd(colWidths.validated) +
  ' | ' +
  'Disputed'.padEnd(colWidths.disputed) +
  ' | ' +
  'Pending'.padEnd(colWidths.pending) +
  ' | ' +
  'Missing'.padEnd(colWidths.missing);

console.log(headerRow);
console.log('-'.repeat(headerRow.length));

for (const r of perCategory) {
  if (r.loadError) {
    console.log(
      r.slug.padEnd(colWidths.categoria) +
        ' | ' +
        fail('ERROR DE CARGA — el archivo no se pudo leer/parsear'),
    );
    console.log(`        ${warn('→ ' + r.loadError)}`);
    continue;
  }

  console.log(
    r.slug.padEnd(colWidths.categoria) +
      ' | ' +
      String(r.total).padEnd(colWidths.total) +
      ' | ' +
      String(r.validated).padEnd(colWidths.validated) +
      ' | ' +
      String(r.disputed).padEnd(colWidths.disputed) +
      ' | ' +
      String(r.pending).padEnd(colWidths.pending) +
      ' | ' +
      String(r.missing).padEnd(colWidths.missing),
  );

  if (r.disputed > 0) {
    console.log(`        ${warn('→ Disputed IDs: ' + r.disputedIds.join(', '))}`);
  }
  if (r.missing > 0) {
    console.log(`        ${warn('→ Missing validation: ' + r.missing + ' ejercicios sin campo validation o passes[]')}`);
  }
  if (r.inconsistencyIds.length > 0) {
    console.log(`        ${warn('→ Inconsistencia status escrito vs derivado: ' + r.inconsistencyIds.join('; '))}`);
  }
  if (r.total !== r.expected) {
    console.log(`        ${warn(`→ Total ${r.total} ≠ esperado ${r.expected} para ${r.slug}`)}`);
  }
}

// ─── Sub-gates VAL-04 + VAL-06 + VAL-08 ───────────────────────────────────
const totalValidated = perCategory.reduce((s, r) => s + r.validated, 0);
const totalDisputed  = perCategory.reduce((s, r) => s + r.disputed, 0);
const totalPending   = perCategory.reduce((s, r) => s + r.pending, 0);
const totalMissing   = perCategory.reduce((s, r) => s + r.missing, 0);
const totalActual    = perCategory.reduce((s, r) => s + r.total, 0);

console.log('');
console.log(`${BOLD}Sub-gates:${RESET}`);

// VAL-06: 271/271 con effectiveStatus === "validated" Y total real = 271.
const val06Pass =
  totalValidated === TOTAL_EXPECTED &&
  totalActual === TOTAL_EXPECTED &&
  !anyLoadError;
console.log(
  `  VAL-06 (271/271 validated): ${
    val06Pass
      ? ok(`PASS (${totalValidated}/${TOTAL_EXPECTED})`)
      : fail(`FAIL (${totalValidated}/${TOTAL_EXPECTED} — pending=${totalPending}, missing=${totalMissing}, disputed=${totalDisputed})`)
  }`
);

// VAL-08: cero disputed (todos los disputed resueltos por la cola D-VAL-25/26).
const allDisputedIds = perCategory.flatMap(r => r.disputedIds);
const val08Pass = totalDisputed === 0;
console.log(
  `  VAL-08 (cero disputed): ${
    val08Pass
      ? ok(`PASS`)
      : fail(`FAIL (${totalDisputed} disputed: ${allDisputedIds.join(', ')})`)
  }`
);

// VAL-04: entre los validated, todos con ≥2 entries `correcta` con `by` distintos.
const allMissingMultiPassIds = perCategory.flatMap(r => r.missingMultiPassIds);
const val04Pass = allMissingMultiPassIds.length === 0;
console.log(
  `  VAL-04 (≥2 distinct AIs por validated): ${
    val04Pass
      ? ok(`PASS`)
      : fail(`FAIL (${allMissingMultiPassIds.length} IDs sin ≥2 distinct by: ${allMissingMultiPassIds.join(', ')})`)
  }`
);

const gatePass = val06Pass && val08Pass && val04Pass;

// ─── Exit gate ────────────────────────────────────────────────────────────
console.log('');
if (gatePass) {
  console.log(ok(`${BOLD}Milestone gate PASS.${RESET}`));
  console.log('');
  console.log(`${BOLD}Siguiente paso (manual, gesto consciente del autor):${RESET}`);
  console.log('  VAL_07_STRICT=1 node --test tests/*.test.js');
  console.log('  → verifica smoke test paramétrico exit 0.');
  console.log('  → si OK: /gsd:complete-milestone v1.1');
  console.log('');
  process.exit(0);
} else {
  console.log(fail(`${BOLD}Milestone gate FAIL — itera /gsd-validate-batch antes de cerrar.${RESET}`));
  console.log('');
  console.log('Acciones sugeridas según qué sub-gate falla:');
  if (!val06Pass) {
    console.log('  - VAL-06: ejecuta /gsd-validate-batch --all-pending para procesar los pendientes/missing.');
  }
  if (!val08Pass) {
    console.log('  - VAL-08: ejecuta /gsd-validate-batch <id1,id2,...> sobre los IDs disputed listados arriba.');
  }
  if (!val04Pass) {
    console.log('  - VAL-04: investiga manualmente los IDs sin ≥2 distinct by (probable corrupción del JSON o passes[] con by duplicado).');
  }
  if (anyLoadError) {
    console.log('  - Carga: uno o más JSONs no se pudieron leer/parsear (ver warnings arriba). Repara el JSON corrupto antes de re-correr.');
  }
  console.log('');
  process.exit(1);
}
