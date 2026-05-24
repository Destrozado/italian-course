#!/usr/bin/env node
// scripts/assert-avere-prefix-unchanged.mjs
//
// Verifica que los primeros 17 ejercicios de content/exercises/avere.json NO
// han cambiado respecto al snapshot capturado pre-edit por
// scripts/snapshot-avere-prefix.mjs. Aplica el invariante D-88 (APPEND-ONLY:
// los 17 originales avere-001..012, avere-100..101, avere-200..202 jamás se
// modifican; solo se AÑADEN nuevos al final del array).
//
// W-4 fix: reemplaza la inspección manual con `git diff` (fragile) por una
// comparación estructural via `assert.deepStrictEqual`. Exit 0 si idénticos,
// exit 1 + diff verbose si difieren.
//
// Uso:
//   node scripts/assert-avere-prefix-unchanged.mjs
//
// Exit codes:
//   0 — los 17 ejercicios originales están intactos (D-88 OK).
//   1 — snapshot no encontrado, o los primeros 17 han cambiado (D-88 violado).

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const snapshotPath = resolve(projectRoot, 'scripts/.avere-prefix-snapshot.json');
const avereSource = resolve(projectRoot, 'content/exercises/avere.json');

let before;
try {
  before = JSON.parse(readFileSync(snapshotPath, 'utf8'));
} catch (err) {
  console.error('Snapshot no encontrado. Ejecuta primero: node scripts/snapshot-avere-prefix.mjs');
  console.error(`Detalle: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(before) || before.length !== 17) {
  console.error(`Snapshot inválido: se esperaban 17 ejercicios, se encontraron ${Array.isArray(before) ? before.length : 'no-array'}.`);
  process.exit(1);
}

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
  console.error(`D-88 violado: avere.json tiene ${avere.exercises.length} ejercicios, menos de los 17 originales. Se han borrado ejercicios.`);
  process.exit(1);
}

const after = avere.exercises.slice(0, 17);

try {
  assert.deepStrictEqual(after, before);
} catch (err) {
  console.error('Los primeros 17 ejercicios de avere.json HAN CAMBIADO. D-88 invariante violado (APPEND-ONLY).');
  console.error('Diff structural:');
  console.error(err.message);
  process.exit(1);
}

console.log('OK: los 17 ejercicios originales de avere.json están intactos (D-88 APPEND-ONLY).');
console.log(`IDs verificados: ${after.map(e => e.id).join(', ')}`);
process.exit(0);
