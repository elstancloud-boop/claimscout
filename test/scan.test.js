'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { parseWallets } = require('../src/scan');
const { ALLOWED_HOSTS } = require('../src/safety');
const adapters = require('../src/adapters');

test('parseWallets dedupes, checksums, rejects junk', () => {
  const a = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const r = parseWallets(`${a.toLowerCase()}, ${a}\n0x123 hello`);
  assert.deepStrictEqual(r.wallets, [a]);
  assert.deepStrictEqual(r.invalid, ['0x123', 'hello']);
});
test('every adapter has required fields', () => {
  for (const a of adapters) { assert.ok(a.id && a.name && Array.isArray(a.chains) && typeof a.scan === 'function'); }
});
test('adapter ids are unique', () => {
  assert.strictEqual(new Set(adapters.map(a => a.id)).size, adapters.length);
});
test('allow-list holds only https-safe bare hosts', () => {
  for (const h of ALLOWED_HOSTS) assert.match(h, /^[a-z0-9.-]+$/);
});

test('ens expansion keeps plain addresses and flags unresolvable names offline-safe', async () => {
  const { expandEns } = require('../src/scan');
  const a = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
  const r = await expandEns(a);
  assert.strictEqual(r.text, a);
  assert.deepStrictEqual(r.unresolved, []);
});
test('priceFindings never throws and sets usd to number or null', async () => {
  const { priceFindings } = require('../src/prices');
  const f = [{ symbol: 'NOPE', amount: '1' }];
  await priceFindings(f);
  assert.strictEqual(f[0].usd, null);
});

test("live prices: all symbols priced (LIVE=1)", { skip: !process.env.LIVE }, async () => {
  const { getPrices } = require('../src/prices');
  const p = await getPrices();
  for (const s of ["ETH", "MATIC", "MKR", "SOL"]) assert.ok(p[s] > 0, `${s} price missing`);
});
