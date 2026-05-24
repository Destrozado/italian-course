#!/usr/bin/env node
// scripts/validate-content-fixture.mjs
//
// Helper único reutilizable por planes 04-02/04-03/04-04 — invoca
// validateContent({categories, exercisesByFile}) con la firma REAL de
// src/data/schema-validator.js:50. Reemplaza invocaciones erróneas
// `validateContent({slug:c},cats)` que fallaban silenciosamente con TypeError
// (B-4 checker fix). FOUND-04: mensajes en español.
//
// Uso:
//   node scripts/validate-content-fixture.mjs <slug> <path-al-json>
//
// Ejemplos:
//   node scripts/validate-content-fixture.mjs avere content/exercises/avere.json
//   node scripts/validate-content-fixture.mjs preposiciones content/exercises/preposiciones.json
//
// Exit codes:
//   0 — JSON válido contra el schema (todos los ejercicios pasan).
//   1 — JSON inválido o uso incorrecto del comando. Detalle en stderr (español).
//
// NOTA: el <slug> arg se ACEPTA pero NO se usa para la invocación de
// validateContent (la firma real no toma slug). Sólo aparece en el mensaje OK
// para hacer self-documenting cada llamada desde los planes.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { validateContent } from '../src/data/schema-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const slug = process.argv[2];
const path = process.argv[3];

if (!slug || !path) {
  console.error('Uso: node scripts/validate-content-fixture.mjs <slug> <path-al-json>');
  process.exit(1);
}

// 1. Cargar categories.json
let categoriesRaw;
try {
  const categoriesPath = resolve(projectRoot, 'content/categories.json');
  categoriesRaw = JSON.parse(readFileSync(categoriesPath, 'utf8'));
} catch (err) {
  console.error(`Error al leer content/categories.json: ${err.message}`);
  process.exit(1);
}

if (!categoriesRaw || !Array.isArray(categoriesRaw.categories)) {
  console.error('categories.json: falta campo "categories"');
  process.exit(1);
}
const categories = categoriesRaw.categories;

// 2. Cargar el archivo de fixture
let fixtureRaw;
try {
  const fixturePath = resolve(projectRoot, path);
  fixtureRaw = JSON.parse(readFileSync(fixturePath, 'utf8'));
} catch (err) {
  console.error(`Error al leer ${path}: ${err.message}`);
  process.exit(1);
}

const exercises = Array.isArray(fixtureRaw?.exercises) ? fixtureRaw.exercises : [];

// 3. Construir exercisesByFile con clave = path literal del CLI arg
const exercisesByFile = { [path]: exercises };

// 4. Invocar el validador con la firma REAL
const result = validateContent({ categories, exercisesByFile });

if (result.ok) {
  console.log(`OK validación: ${exercises.length} ejercicio(s) en ${path} (slug=${slug})`);
  process.exit(0);
}

// 5. Reportar errores en español, uno por línea
for (const err of result.errors) {
  const exId = err.exerciseId ?? '(global)';
  console.error(`[${err.file}] ${exId}: ${err.reason}`);
}
process.exit(1);
