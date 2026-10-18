'use strict';
const config = require('../config');

// Native SOL sitting in stake accounts that are no longer delegated (cooled down) or were never delegated.
// Sources: https://solana.com/staking  (withdraw once "Inactive" / "Not Delegated"),
//          https://help.phantom.com/articles/4406374138771 (wallet steps).
// Data: Stake program accounts filtered by withdrawer authority (byte offset 44 in the stake account layout).
const STAKE_PROGRAM = 'Stake11111111111111111111111111111111111111';
const NEVER = '18446744073709551615';        // u64::MAX = not deactivating
const LAMPORTS = 1e9;

async function rpc(method, params) {
  const r = await fetch(config.solanaRpc, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(20000),
  });
  if (!r.ok) throw new Error(`Solana RPC HTTP ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(`Solana RPC: ${j.error.message}`);
  return j.result;
}

/** Pure classification so it can be unit-tested. Returns null when nothing is withdrawable. */
function classify(acct, epoch, nowSec) {
  const info = acct.account.data.parsed.info, type = acct.account.data.parsed.type;
  const lamports = acct.account.lamports;
  if (!lamports) return null;
  const lock = info.meta?.lockup || {};
  const lockedByTime = Number(lock.unixTimestamp) > nowSec, lockedByEpoch = Number(lock.epoch) > epoch;
  const locked = lockedByTime || lockedByEpoch;
  let state;
  if (type === 'initialized') state = 'ready';            // never delegated
  else if (type === 'delegated') {
    const d = info.stake?.delegation; if (!d) return null;
    if (d.deactivationEpoch === NEVER) return null;           // still active
    const gap = epoch - Number(d.deactivationEpoch);
    if (gap < 1) return null;                                 // still cooling down
    state = gap >= 2 ? 'ready' : 'maybe';                     // 1 epoch after deactivation: usually done, not guaranteed
  } else return null;                                         // 'uninitialized', 'rewardsPool' etc.
  const status = locked ? 'needs-team' : state === 'ready' ? 'claimable' : 'uncertain';
  return { status, lamports };
}

module.exports = {
  id: 'solana-stake', name: 'Solana stake never withdrawn', family: 'solana', chains: ['solana'],
  classify,
  async scan(wallet) {
    const [epochInfo, accounts] = await Promise.all([
      rpc('getEpochInfo', []),
      rpc('getProgramAccounts', [STAKE_PROGRAM, { encoding: 'jsonParsed', filters: [{ memcmp: { offset: 44, bytes: wallet } }] }]),
    ]);
    const now = Math.floor(Date.now() / 1000), out = [];
    for (const a of accounts) {
      const c = classify(a, epochInfo.epoch, now);
      if (!c) continue;
      const note = c.status === 'needs-team' ? ' (locked: only the lockup custodian or expiry can release it)'
                 : c.status === 'uncertain' ? ' (just finished cooling down: confirm it shows Inactive in your wallet)' : '';
      out.push({
        adapter: 'solana-stake', protocol: 'Solana staking', category: 'Staking', chain: 'Solana', wallet,
        title: `Stake account ${a.pubkey.slice(0, 4)}…${a.pubkey.slice(-4)} can be withdrawn${note}`,
        amount: (c.lamports / LAMPORTS).toString(), symbol: 'SOL', status: c.status,
        claimUrl: 'https://solana.com/staking',
        steps: [
          'Open your Solana wallet\'s staking screen (for example Phantom: Solana > Native Stakes > Other).',
          'Open the stake account that shows Inactive.',
          'Choose Withdraw Stake and confirm. The SOL returns to your wallet and the stake account closes.',
          `Stake account address: ${a.pubkey}`,
        ],
        source: 'https://solana.com/staking',
      });
    }
    return out;
  },
};
