#!/usr/bin/env node
// scripts/bump-translation-lock.mjs — Phase 47, CR-02 del code review (T-47-27).
//
// EL GESTO EXPLÍCITO que re-emite `content/translation-coverage.lock.json`.
//
// POR QUÉ EXISTE ESTE FICHERO EN LUGAR DE DERIVARLO. `TRAD-COV` computa su
// `expected`, sus `surfaces` y sus `validated` recorriendo EL MISMO fichero en LA MISMA
// corrida. Si desaparece una variante `multiple-choice` ya traducida y validada, los
// tres sumandos bajan a la vez y las dos igualdades del veredicto siguen cuadrando:
// `PASS (205/205)`, exit 0, y la suite entera sin morder. El corpus perdió una
// traducción validada y todo salió verde con una cifra distinta.
//
// Un ancla que se derive del mismo fichero en la misma corrida vuelve a ser tautológica
// —es el caveat que el propio review anota sobre la salida (b), que parece la natural y
// no lo es—. Así que el ancla tiene que ser información que el borrado NO pueda mover:
// la marca de agua histórica, congelada en disco y fechada, en un fichero cuyo único
// motivo de cambio es un gesto deliberado del autor con su propio diff en git.
//
// ES UN SUELO (ratchet), NO UNA IGUALDAD, y la diferencia es load-bearing:
//   - disco < lock  → ROJO. Desapareció una variante. Es el vector de CR-02.
//   - disco > lock  → VERDE en el ancla. La categoría creció; el rojo, si toca, lo pone
//     la cobertura (`validated < expected`), que es su causa propia. Fundir las dos
//     causas en un solo rojo dejaría al autor sin saber si le falta traducir o si le
//     falta una variante.
//
// Uso:
//   node scripts/bump-translation-lock.mjs            # muestra el diff propuesto, no escribe
//   node scripts/bump-translation-lock.mjs --write    # re-emite el lock desde el disco

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = 'content/exercises';
export const LOCK_PATH = 'content/translation-coverage.lock.json';

/**
 * Las categorías DECLARADAS CUBIERTAS y su conteo de variantes `multiple-choice`, todo
 * derivado del disco con el mismo predicado que `categoriasDeclaradasCubiertas()` del
 * gate anti-ceguera: una categoría está cubierta en cuanto UNA de sus variantes declara
 * `translationES`. El conteo, en cambio, es de TODAS sus variantes multiple-choice —
 * porque ése es el denominador que `TRAD-COV` usa como `expected`.
 */
export function conteoDeCoberturaEnDisco(root = projectRoot) {
  const dir = resolve(root, DIR);
  const out = {};
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
    const data = JSON.parse(readFileSync(resolve(dir, f), 'utf8'));
    const mc = (data.exercises || []).filter((ex) => ex?.type === 'multiple-choice');
    const cubierta = mc.some((ex) => (ex.variants || []).some((v) => v && v.translationES));
    if (!cubierta) continue;
    out[f.replace(/\.json$/, '')] = mc.reduce((s, ex) => s + (Array.isArray(ex.variants) ? ex.variants.length : 0), 0);
  }
  return out;
}

/** Lee el lock. Devuelve `null` si no existe; LANZA si existe y es ilegible. */
export function leerLock(root = projectRoot) {
  const p = resolve(root, LOCK_PATH);
  if (!existsSync(p)) return null;
  const doc = JSON.parse(readFileSync(p, 'utf8'));
  if (!doc || typeof doc.categorias !== 'object' || doc.categorias === null) {
    throw new Error(`${LOCK_PATH} no declara un objeto "categorias": el ancla de TRAD-COV no existe`);
  }
  return doc;
}

function main() {
  const write = process.argv.includes('--write');
  const disco = conteoDeCoberturaEnDisco();
  const previo = leerLock();

  const slugs = [...new Set([...Object.keys(disco), ...Object.keys(previo?.categorias ?? {})])].sort();
  let cambios = 0;
  for (const slug of slugs) {
    const antes = previo?.categorias?.[slug];
    const ahora = disco[slug];
    if (antes === ahora) continue;
    cambios++;
    const flecha = antes === undefined ? 'ALTA' : ahora === undefined ? 'BAJA DE CATEGORÍA' : antes > ahora ? 'BAJA' : 'alta';
    console.log(`  ${slug}: ${antes ?? '—'} → ${ahora ?? '—'}   [${flecha}]`);
    if (antes !== undefined && ahora !== undefined && ahora < antes) {
      console.log(
        `      ⚠ el disco tiene MENOS variantes que el lock. Si no has borrado una variante a ` +
          `propósito, esto es exactamente el vector que el ancla existe para cazar.`
      );
    }
  }
  if (cambios === 0) {
    console.log(`${LOCK_PATH} ya está al día (${Object.keys(disco).length} categorías, ` +
      `${Object.values(disco).reduce((s, n) => s + n, 0)} variantes).`);
    return;
  }
  if (!write) {
    console.log(`\n(${cambios} cambio(s) — nada escrito. Re-invoca con --write para re-emitir el lock.)`);
    return;
  }
  const doc = {
    _doc:
      'ANCLA de TRAD-COV (CR-02 / T-47-27). Marca de agua del número de variantes multiple-choice ' +
      'por categoría CUBIERTA de traducción. El reporter la usa como SUELO: si el disco cae por ' +
      'debajo, desapareció una variante y sale ROJO. No se deriva del corpus en tiempo de corrida ' +
      'a propósito — un ancla derivada del mismo fichero se movería con el borrado y volvería a ser ' +
      'tautológica. Re-emitir SÓLO con `node scripts/bump-translation-lock.mjs --write`, que deja ' +
      'su propio diff en git.',
    emitido: new Date().toISOString(),
    categorias: Object.fromEntries(Object.keys(disco).sort().map((k) => [k, disco[k]])),
  };
  writeFileSync(resolve(projectRoot, LOCK_PATH), JSON.stringify(doc, null, 2) + '\n');
  console.log(`\n✔ ${LOCK_PATH} re-emitido.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
