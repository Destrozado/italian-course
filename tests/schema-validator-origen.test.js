// tests/schema-validator-origen.test.js
//
// PROV-01: campo OPCIONAL `origen` a nivel categoría, enum
// ['ia-quorum', 'apuntes-profesora']. Se ejecuta con:
//
//     node --test tests/schema-validator-origen.test.js
//
// Cubre los 5 casos del bloque <behavior> de 39-01-PLAN:
//   - origen:"ia-quorum"        → ok:true (aceptado)
//   - origen:"apuntes-profesora"→ ok:true (aceptado)
//   - SIN clave origen          → ok:true (retrocompatible, absence = accepted)
//   - origen:"ia-quorumm" (typo)→ ok:false (enum inválido)
//   - origen:"apuntes"    (typo)→ ok:false (enum inválido)

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { validateContent } from '../src/data/schema-validator.js';

/** Construye un input mínimo con una sola categoría (exercisesByFile vacío). */
function withCategory(cat) {
  return validateContent({ categories: [cat], exercisesByFile: {} });
}

describe('schema-validator — origen enum (PROV-01)', () => {
  test('acepta categoría con origen:"ia-quorum"', () => {
    const result = withCategory({ id: 'demo', name: 'Demo', order: 1, origen: 'ia-quorum' });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('acepta categoría con origen:"apuntes-profesora"', () => {
    const result = withCategory({ id: 'demo', name: 'Demo', order: 1, origen: 'apuntes-profesora' });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('acepta categoría SIN clave origen (retrocompatible, absence = accepted)', () => {
    const result = withCategory({ id: 'demo', name: 'Demo', order: 1 });
    assert.equal(result.ok, true, JSON.stringify(result.errors));
  });

  test('rechaza categoría con origen:"ia-quorumm" (typo)', () => {
    const result = withCategory({ id: 'demo', name: 'Demo', order: 1, origen: 'ia-quorumm' });
    assert.equal(result.ok, false);
    const err = result.errors.find(e => /origen/.test(e.reason));
    assert.ok(err, 'debe existir un error que mencione "origen"');
    assert.match(err.reason, /ia-quorum\|apuntes-profesora/);
  });

  test('rechaza categoría con origen:"apuntes" (typo)', () => {
    const result = withCategory({ id: 'demo', name: 'Demo', order: 1, origen: 'apuntes' });
    assert.equal(result.ok, false);
    assert.ok(result.errors.some(e => /origen/.test(e.reason)));
  });
});
