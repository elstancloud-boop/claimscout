'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { familyOf, isBurn, b58decode, isSolanaAddress } = require('../src/addresses');
const { parseWallets, scanWallets } = require('../src/scan');
const solana = require('../src/adapters/solana-stake');
const polymarket = require('../src/adapters/polymarket');

const SOL = '3vEj5wQ7pxW5uJxLCKwZUWzQQnh6Sg781kQuovTudMvH';
const EVM = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

test('address families', () => {
  assert.strictEqual(familyOf(SOL), 'solana'); assert.strictEqual(familyOf(EVM), 'evm');
  assert.strictEqual(familyOf('hello'), null); assert.strictEqual(familyOf('0x123'), null);
  assert.strictEqual(familyOf('3vEj5wQ7pxW5uJxLCKwZUWzQQnh6Sg781kQuovTudMv0'), null); // 0 not in base58
});
test('base58 decodes a Solana key to 32 bytes; system program to 32 zero bytes', () => {
  assert.strictEqual(b58decode(SOL).length, 32);
  assert.deepStrictEqual([...b58decode('11111111111111111111111111111111')], new Array(32).fill(0));
  assert.strictEqual(isSolanaAddress('Stake11111111111111111111111111111111111111'), true);
});
test('burn addresses are rejected with a reason', () => {
  assert.ok(isBurn('0x000000000000000000000000000000000000dEaD'));
  const r = parseWallets('0x000000000000000000000000000000000000dEaD 1nc1nerator11111111111111111111111111111111');
  assert.strictEqual(r.wallets.length, 0); assert.strictEqual(r.invalid.length, 2);
});
test('parseWallets mixes EVM and Solana', () => {
  assert.deepStrictEqual(parseWallets(`${SOL} ${EVM.toLowerCase()}`).wallets, [SOL, EVM]);
});

const stake = (type, lamports, deact, lock = { epoch: 0, unixTimestamp: 0 }) => ({
  pubkey: 'X', account: { lamports, data: { parsed: { type, info: { meta: { lockup: lock }, stake: { delegation: { deactivationEpoch: deact } } } } } },
});
const NEVER = '18446744073709551615', NOW = 1_800_000_000;
test('solana classify: active stake is not withdrawable', () => assert.strictEqual(solana.classify(stake('delegated', 5, NEVER), 1061, NOW), null));
test('solana classify: still cooling down (deactivated this epoch)', () => assert.strictEqual(solana.classify(stake('delegated', 5, '1061'), 1061, NOW), null));
test('solana classify: 1 epoch after => uncertain', () => assert.strictEqual(solana.classify(stake('delegated', 5, '1060'), 1061, NOW).status, 'uncertain'));
test('solana classify: 2+ epochs after => claimable', () => assert.deepStrictEqual(solana.classify(stake('delegated', 5, '1055'), 1061, NOW), { status: 'claimable', lamports: 5 }));
test('solana classify: initialized (never delegated) => claimable', () => assert.strictEqual(solana.classify(stake('initialized', 5, NEVER), 1061, NOW).status, 'claimable'));
test('solana classify: lockup in force => needs-team', () => {
  assert.strictEqual(solana.classify(stake('delegated', 5, '1055', { epoch: 0, unixTimestamp: NOW + 100 }), 1061, NOW).status, 'needs-team');
  assert.strictEqual(solana.classify(stake('delegated', 5, '1055', { epoch: 2000, unixTimestamp: 0 }), 1061, NOW).status, 'needs-team');
});
test('solana classify: empty account ignored', () => assert.strictEqual(solana.classify(stake('delegated', 0, '1055'), 1061, NOW), null));

const live = { skip: !process.env.LIVE };
test('LIVE solana: known operator wallet has claimable stake accounts', live, async () => {
  const r = await solana.scan(SOL); // operator wallet with many cooled-down stake accounts when written; replace if emptied
  assert.ok(r.length > 0); assert.ok(r.every(f => f.chain === 'Solana' && parseFloat(f.amount) > 0));
});
test('LIVE solana: random wallet returns []', live, async () => {
  assert.deepStrictEqual(await solana.scan('11111111111111111111111111111112'), []);
});
test('LIVE polymarket: known wallet has redeemable wins; unknown has none', live, async () => {
  const r = await polymarket.scan('0x0346afae2603313d2bbee96b628536c8cbe352a5');
  assert.ok(r.length > 0 && r.every(f => f.symbol === 'USDC' && parseFloat(f.amount) > 0));
  assert.deepStrictEqual(await polymarket.scan('0x1111111111111111111111111111111111111111'), []);
});
test('LIVE end-to-end: mixed wallets route to the right adapters, no errors, totals add up', live, async () => {
  const r = await scanWallets([SOL, '0x0346afae2603313d2bbee96b628536c8cbe352a5']);
  assert.deepStrictEqual(r.errors, []);
  assert.ok(r.findings.some(f => f.chain === 'Solana') && r.findings.some(f => f.chain === 'Polygon'));
  assert.ok(r.findings.filter(f => f.chain === 'Solana').every(f => f.wallet === SOL)); // Solana adapter never ran on the EVM wallet
  assert.ok(r.totalUsd > 0);
});
