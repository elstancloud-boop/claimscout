'use strict';
// Live on-chain smoke test. Skipped unless LIVE=1 (needs network).
const test = require('node:test');
const assert = require('node:assert');
const { scanWallets } = require('../src/scan');
test('live scan runs without adapter errors', { skip: !process.env.LIVE }, async () => {
  const r = await scanWallets(['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045']);
  assert.deepStrictEqual(r.errors, []);
  assert.ok(Array.isArray(r.findings));
});
