'use strict';
const test = require('node:test');
const assert = require('node:assert');
const server = require('../src/server');

let base;
test.before(() => new Promise(r => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); })));
test.after(() => server.close());

const post = (body, ip) => fetch(`${base}/api/scan`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body), headers: ip ? { 'x-forwarded-for': ip } : {} });

test('GET / serves page with CSP header', async () => {
  const r = await fetch(base + '/');
  assert.strictEqual(r.status, 200);
  assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(await r.text(), /Find the crypto/);
});
test('static assets served', async () => {
  for (const f of ['/app.js', '/style.css']) assert.strictEqual((await fetch(base + f)).status, 200);
});
test('healthz', async () => { assert.deepStrictEqual(await (await fetch(base + '/healthz')).json(), { ok: true }); });
test('path traversal blocked', async () => {
  assert.strictEqual((await fetch(base + '/..%2fpackage.json')).status, 404);
  assert.strictEqual((await fetch(base + '/../package.json')).status, 404);
});
test('src files are not exposed', async () => { assert.strictEqual((await fetch(base + '/src/server.js')).status, 404); });
test('POST with no valid address returns 400', async () => {
  const r = await post({ wallets: 'hello 0x123' }, '9.9.9.1');
  assert.strictEqual(r.status, 400);
  assert.deepStrictEqual((await r.json()).invalid, ['hello', '0x123']);
});
test('malformed JSON returns 400 not crash', async () => { assert.strictEqual((await post('{bad', '9.9.9.2')).status, 400); });
test('unsupported method 405', async () => { assert.strictEqual((await fetch(base + '/x', { method: 'DELETE' })).status, 405); });
test('rate limit kicks in after 10 scans/min/IP', async () => {
  let last;
  for (let i = 0; i < 11; i++) last = await post({ wallets: 'x' }, '9.9.9.3');
  assert.strictEqual(last.status, 429);
});
test('too many wallets rejected', async () => {
  const many = Array.from({ length: 26 }, (_, i) => '0x' + (i + 1).toString(16).padStart(40, '0')).join(' ');
  const r = await post({ wallets: many }, '9.9.9.4');
  assert.strictEqual(r.status, 400);
  assert.match((await r.json()).error, /Max 25/);
});
