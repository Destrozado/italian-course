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
// D-178 (Phase 7.2-01): relax mínimo — la comparación deepStrictEqual se hace
// sobre los CAMPOS CORE de cada ejercicio (id, type, categoryIds, prompt,
// options, correctIndex, pairs, answer, distractors). Se EXCLUYEN del compare:
//   - `payload.explanation` — campo aditivo introducido en Phase 7.2 para
//     mostrar explicación pedagógica al alumno cuando falla. No modifica la
//     semántica del ejercicio (mismo prompt, mismas opciones, misma respuesta
//     correcta), solo añade material educativo. El relax permite la adición
//     sin tener que re-snapshotear (preserva el snapshot original como
//     ground truth de los campos core).
//   - `notes` — campo autor-internal (anotaciones del autor sobre el PDF de
//     origen, distractoras pedagógicas, etc.). No se lee en runtime; ya era
//     conceptualmente aditivo, ahora se documenta como tal.
//   - `validation` — metadata de quórum AI introducido en Phase 9 D-VAL-08
//     (campo top-level con `{status, passes[]}`). No altera prompt/options/
//     correctIndex/explanation/notes de los 17 originales, solo añade
//     trazabilidad editorial (verdicts Opus + Sonnet + concerns tagged).
//     El relax permite que Plan 09-03 añada `validation` a `avere-001` (E2
//     baseline del piloto) sin re-snapshotear.
//
// El invariante D-88 sigue vigente sobre los campos core: si alguien modifica
// un prompt, cambia el correctIndex, reordena options, o inserta un ejercicio
// nuevo en posiciones 1..17, el assert FALLA (exit 1) como antes.
//
// Uso:
//   node scripts/assert-avere-prefix-unchanged.mjs
//   node scripts/assert-avere-prefix-unchanged.mjs --path /tmp/avere-copia.json
//   AVERE_PATH=/tmp/avere-copia.json node scripts/assert-avere-prefix-unchanged.mjs
//
// El flag `--path <file>` (CLI) o la env var `AVERE_PATH` permiten ejecutar
// el assert sobre una copia alternativa del JSON (útil para tests de roundtrip
// y verificación dry-run del relax). Si ambos están presentes, `--path` gana.
// Si ninguno, fallback al path canónico content/exercises/avere.json.
//
// Exit codes:
//   0 — los 17 ejercicios originales están intactos en sus campos core
//       (D-88 APPEND-ONLY preserved + D-178 explanation/notes son aditivos).
//   1 — snapshot no encontrado, o los primeros 17 han cambiado en sus campos
//       core (D-88 violado).

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// CLI flag o env var para roundtrip dry-run (Warning 9 + D-178 testing).
const argPathIdx = process.argv.indexOf('--path');
const overridePath = argPathIdx > -1 ? process.argv[argPathIdx + 1] : process.env.AVERE_PATH;
const avereSource = overridePath
  ? resolve(overridePath)
  : resolve(projectRoot, 'content/exercises/avere.json');

const snapshotPath = resolve(projectRoot, 'scripts/.avere-prefix-snapshot.json');

/**
 * Devuelve una copia del ejercicio sin los campos puramente aditivos
 * (`payload.explanation` introducido en Phase 7.2, `notes` autor-internal, y
 * `validation` introducido en Phase 9 D-VAL-08 — metadata de quórum AI).
 * D-178 opción A + Phase 9 D-VAL-08: permite adiciones aditivas como
 * explanation/validation sin romper el invariante D-88 sobre los campos
 * semánticos (prompt/options/correctIndex/pairs/answer/distractors).
 *
 * Symmetric: se aplica al snapshot (before) y al estado actual (after) para
 * que el deepStrictEqual ignore esos campos en ambos lados (un snapshot que
 * incluía `notes` sigue funcionando idéntico tras añadir `explanation` y
 * después `validation`).
 */
function stripAdditive(ex) {
  // D-178 opción A + Phase 9 D-VAL-08: campos puramente aditivos que no
  // alteran la semántica del ejercicio. `payload.explanation` (Phase 7.2),
  // `notes` (autor-internal), `validation` (Phase 9 — metadata de quórum AI).
  const { payload, notes, validation, ...rest } = ex;
  if (!payload || typeof payload !== 'object') {
    return { ...rest, payload };
  }
  const { explanation, ...payloadCore } = payload;
  return { ...rest, payload: payloadCore };
}

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
  console.error(`Error al leer ${avereSource}: ${err.message}`);
  process.exit(1);
}

if (!avere || !Array.isArray(avere.exercises)) {
  console.error(`${avereSource}: falta el campo "exercises" o no es un array`);
  process.exit(1);
}

if (avere.exercises.length < 17) {
  console.error(`D-88 violado: ${avereSource} tiene ${avere.exercises.length} ejercicios, menos de los 17 originales. Se han borrado ejercicios.`);
  process.exit(1);
}

const afterCore = avere.exercises.slice(0, 17).map(stripAdditive);
const beforeCore = before.map(stripAdditive);

try {
  assert.deepStrictEqual(afterCore, beforeCore);
} catch (err) {
  console.error('Los primeros 17 ejercicios de avere.json HAN CAMBIADO en sus campos CORE. D-88 invariante violado (APPEND-ONLY de campos semánticos).');
  console.error('Diff structural (excluyendo payload.explanation, notes y validation que son aditivos D-178 + D-VAL-08):');
  console.error(err.message);
  process.exit(1);
}

console.log('OK: los 17 ejercicios originales de avere.json están intactos en sus campos CORE (D-88 APPEND-ONLY preserved + D-178 explanation/notes + D-VAL-08 validation son aditivos).');
console.log(`IDs verificados: ${afterCore.map(e => e.id).join(', ')}`);
if (overridePath) {
  console.log(`(Ejecutado contra path alternativo: ${avereSource})`);
}
process.exit(0);
