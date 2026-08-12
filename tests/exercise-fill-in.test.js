// tests/exercise-fill-in.test.js
//
// GUARD DE SUSTITUCIÓN (surface fill-in check).
//
// Comprueba, de forma DETERMINISTA (sin IA), que al sustituir la opción correcta
// de un ejercicio multiple-choice en el hueco `___` de su prompt, la frase italiana
// resultante NO contiene una palabra duplicada adyacente (p.ej. `di di`).
//
// Motivación: el quórum cross-vendor (Opus/Sonnet/DeepSeek) razona sobre la gramática
// del verbo en abstracto, pero puede NO "montar la frase" — así se coló en v1.9 el
// bug `riflessivi-mismatch` v1 ("Spesso tu ___ di comprare il pane" con KEY
// "ti dimentichi di" → "ti dimentichi di di comprare"). Los tests de estructura
// tampoco leen la frase final. Este guard cierra ese punto ciego: barato, cero deps,
// cero coste de IA. Complementa (no sustituye) al quórum.
//
// Auto-descubre TODAS las categorías vía readdir → cada categoría nueva queda cubierta
// sin editar este archivo.
//
// Se ejecuta con:
//     node --test tests/*.test.js tests/fixtures/*.test.js
//
// Requiere Node 22 LTS o superior.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { readFileSync, readdirSync } from 'node:fs';

const EXERCISES_DIR = new URL('../content/exercises/', import.meta.url);

// Reduplicaciones italianas legítimas (adyacentes) que NO son bug.
// Se comparan en minúsculas. Ampliar si aparece contenido nuevo que las use.
const LEGIT_REDUP = new Set(['piano', 'pian', 'così', 'cosi', 'quasi', 'appena']);

// Quita el gloss canónico "(en español: ...)" del prompt antes de montar la frase.
function stripGloss(prompt) {
  return prompt.replace(/\s*\(en espa[nñ]ol:[^)]*\)/gi, '').trim();
}

// Tokeniza la frase montada (ignora puntuación de cierre; conserva apóstrofes de elisión).
function tokenize(sentence) {
  return sentence
    .replace(/[.,;:!?«»"“”]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Devuelve el primer par de palabras adyacentes duplicadas (case-insensitive), o null.
function firstAdjacentDup(tokens) {
  for (let i = 1; i < tokens.length; i++) {
    const a = tokens[i - 1].toLowerCase();
    const b = tokens[i].toLowerCase();
    if (a === b && !LEGIT_REDUP.has(a)) {
      return `${tokens[i - 1]} ${tokens[i]}`;
    }
  }
  return null;
}

const files = readdirSync(EXERCISES_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort();

describe('exercise fill-in surface check (no adjacent duplicate words)', () => {
  for (const file of files) {
    test(`content/exercises/${file} — KEY substituted into prompt has no duplicated adjacent word`, () => {
      const data = JSON.parse(readFileSync(new URL(file, EXERCISES_DIR), 'utf8'));
      const violations = [];

      for (const ex of data.exercises || []) {
        if (ex.type !== 'multiple-choice') continue;
        for (let vi = 0; vi < (ex.variants || []).length; vi++) {
          const v = ex.variants[vi];
          if (!v || typeof v.prompt !== 'string' || !v.prompt.includes('___')) continue;
          if (!Array.isArray(v.options) || typeof v.correctIndex !== 'number') continue;
          const key = v.options[v.correctIndex];
          if (typeof key !== 'string') continue;

          const filled = stripGloss(v.prompt).replace('___', key);
          const dup = firstAdjacentDup(tokenize(filled));
          if (dup) {
            violations.push(`${ex.id} v${vi}: "${dup}" -> ${filled}`);
          }
        }
      }

      assert.deepEqual(
        violations,
        [],
        `Frase(s) con palabra duplicada adyacente tras sustituir la KEY en el hueco ` +
          `(revisa que la opción correcta no repita una palabra ya presente en el prompt):\n` +
          violations.map((x) => `  - ${x}`).join('\n')
      );
    });
  }
});
