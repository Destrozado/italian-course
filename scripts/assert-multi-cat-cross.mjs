#!/usr/bin/env node
// scripts/assert-multi-cat-cross.mjs
//
// Verifica que existe al menos un ejercicio en content/exercises/avere.json
// cuyo `categoryIds` incluye AMBOS slugs dados como argumento. Aplica D-87
// (cruces naturales semánticos pre-identificados: al menos 1 cruce por
// categoría nueva con avere).
//
// W-7 fix: reemplaza el grep literal por categoría (que era fragile ante
// formateo line-break distinto entre archivos) por JSON parsing + check
// programático con `categoryIds.includes()`. El orden de los slugs en
// categoryIds es irrelevante — solo cuenta que ambos estén presentes.
//
// Uso:
//   node scripts/assert-multi-cat-cross.mjs <slug1> <slug2>
//
// Ejemplos:
//   node scripts/assert-multi-cat-cross.mjs avere preposiciones
//   node scripts/assert-multi-cat-cross.mjs avere profesiones
//
// Exit codes:
//   0 — al menos 1 ejercicio con AMBOS slugs encontrado (cruce verificado).
//   1 — ningún ejercicio cruza ambas categorías, o uso incorrecto del comando.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const slug1 = process.argv[2];
const slug2 = process.argv[3];

if (!slug1 || !slug2) {
  console.error('Uso: node scripts/assert-multi-cat-cross.mjs <slug1> <slug2>');
  console.error('Ejemplo: node scripts/assert-multi-cat-cross.mjs avere preposiciones');
  process.exit(1);
}

const avereSource = resolve(projectRoot, 'content/exercises/avere.json');

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

const crosses = avere.exercises.filter(e =>
  Array.isArray(e.categoryIds)
  && e.categoryIds.includes(slug1)
  && e.categoryIds.includes(slug2)
);

if (crosses.length === 0) {
  console.error(`No se encontró ningún ejercicio en avere.json con categoryIds que incluyan tanto "${slug1}" como "${slug2}".`);
  console.error('Cruces multi-cat actuales en avere.json:');
  const multiCat = avere.exercises.filter(e => Array.isArray(e.categoryIds) && e.categoryIds.length >= 2);
  if (multiCat.length === 0) {
    console.error('  (ninguno — avere.json no tiene ejercicios multi-cat todavía)');
  } else {
    for (const ex of multiCat) {
      console.error(`  - ${ex.id}: [${ex.categoryIds.join(', ')}]`);
    }
  }
  process.exit(1);
}

console.log(`OK: ${crosses.length} cruce(s) "${slug1}" <-> "${slug2}": ${crosses.map(e => e.id).join(', ')}`);
process.exit(0);
