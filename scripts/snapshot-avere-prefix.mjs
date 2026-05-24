#!/usr/bin/env node
// scripts/snapshot-avere-prefix.mjs
//
// Captura los primeros 17 ejercicios de content/exercises/avere.json antes de
// extender el archivo con ejercicios multi-categoría (Plan 04-04 Task 1a). El
// snapshot se compara post-edit via scripts/assert-avere-prefix-unchanged.mjs
// para garantizar el invariante D-88 (APPEND-ONLY: los 17 ejercicios originales
// avere-001..012, avere-100..101, avere-200..202 jamás se modifican).
//
// W-4 fix: reemplaza la inspección manual con `git diff` (fragile en repos sin
// commit previo o con cambios sin stage) por una comparación estructural via
// `assert.deepStrictEqual` sobre el JSON parseado.
//
// El archivo de snapshot resultante (scripts/.avere-prefix-snapshot.json) es
// temporal del proceso y debe estar gitignored.
//
// Uso:
//   node scripts/snapshot-avere-prefix.mjs
//
// Exit codes:
//   0 — snapshot escrito con éxito (17 ejercicios capturados).
//   1 — error de lectura/parse de avere.json o de escritura del snapshot.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const avereSource = resolve(projectRoot, 'content/exercises/avere.json');
const snapshotPath = resolve(projectRoot, 'scripts/.avere-prefix-snapshot.json');

let avere;
try {
  avere = JSON.parse(readFileSync(avereSource, 'utf8'));
} catch (err) {
  console.error(`Error al leer content/exercises/avere.json: ${err.message}`);
  process.exit(1);
}

if (!avere || !Array.isArray(avere.exercises)) {
  console.error('avere.json: falta el campo "exercises" o no es un array');
  process.exit(1);
}

if (avere.exercises.length < 17) {
  console.error(`avere.json tiene solo ${avere.exercises.length} ejercicios; se esperaban al menos 17 originales (avere-001..012, avere-100..101, avere-200..202).`);
  process.exit(1);
}

const prefix = avere.exercises.slice(0, 17);

try {
  writeFileSync(snapshotPath, JSON.stringify(prefix, null, 2) + '\n', 'utf8');
} catch (err) {
  console.error(`Error al escribir el snapshot ${snapshotPath}: ${err.message}`);
  process.exit(1);
}

console.log(`Snapshot escrito: ${prefix.length} ejercicios → scripts/.avere-prefix-snapshot.json`);
console.log(`IDs capturados: ${prefix.map(e => e.id).join(', ')}`);
process.exit(0);
