'use strict';
// LIVE=1 only. Checks adapters against wallets/contracts with known on-chain state.
const test = require('node:test');
const assert = require('node:assert');
const matic = require('../src/adapters/matic');
const mkr = require('../src/adapters/mkr');
const lido = require('../src/adapters/lido');
const skip = !process.env.LIVE;
const ZERO = '0x000000000000000000000000000000000000dEaD';

test('MATIC adapter finds balance on a wallet holding MATIC (vitalik.eth)', { skip }, async () => {
  const r = await matic.scan('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  assert.strictEqual(r.length, 1); assert.strictEqual(r[0].symbol, 'MATIC'); assert.ok(parseFloat(r[0].amount) > 0);
});
test('MKR adapter finds MKR held by the MKR token contract itself or returns well-formed result', { skip }, async () => {
  const r = await mkr.scan('0x0A59649758aa4d66E25f08Dd01271e891fe52199'); // Maker PSM, expected to hold MKR? shape check only
  assert.ok(Array.isArray(r));
  for (const f of r) assert.strictEqual(f.symbol, 'MKR');
});
test('Lido adapter returns [] for a wallet with no requests', { skip }, async () => {
  assert.deepStrictEqual(await lido.scan('0x1111111111111111111111111111111111111111'), []);
});
test('Lido adapter finds a finalized unclaimed request (regression: read-only Result bug)', { skip }, async () => {
  const r = await lido.scan(ZERO); // 0x...dEaD owned request #35516 when this test was written; if it is claimed later, replace the address
  assert.ok(r.length >= 1); assert.strictEqual(r[0].status, 'claimable'); assert.ok(parseFloat(r[0].amount) > 0);
});
test('Lido adapter runs on a wallet with requests without throwing', { skip }, async () => {
  const r = await lido.scan('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  assert.ok(Array.isArray(r));
});
