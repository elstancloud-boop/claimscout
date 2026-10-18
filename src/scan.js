'use strict';
const { familyOf, normalize, isBurn } = require('./addresses');
const adapters = require('./adapters');
const config = require('./config');
const { ALLOWED_HOSTS } = require('./safety');
const { priceFindings } = require('./prices');
const { resolveEns } = require('./ens');

/** Resolves any *.eth names in the input into addresses, returning text with only 0x addresses plus unresolved names. */
async function expandEns(input) {
  const tokens = String(input || '').split(/[\s,;]+/).filter(Boolean);
  const out = [], unresolved = [];
  const names = tokens.filter(t => /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i.test(t)).slice(0, 10);
  const resolved = await Promise.all(names.map(resolveEns));
  names.forEach((n, i) => resolved[i] ? out.push(resolved[i]) : unresolved.push(n));
  for (const t of tokens) if (!names.includes(t)) out.push(t);
  return { text: out.join(' '), unresolved };
}

/** Parse free text (commas, spaces, newlines) into unique EVM (checksummed) and Solana addresses. Burn addresses are rejected. */
function parseWallets(input) {
  const tokens = String(input || '').split(/[\s,;]+/).filter(Boolean);
  const valid = [], invalid = [];
  for (const t of tokens) {
    if (!familyOf(t)) invalid.push(t);
    else if (isBurn(t)) invalid.push(`${t} (burn address, nothing here can be claimed)`);
    else valid.push(normalize(t));
  }
  return { wallets: [...new Set(valid)], invalid };
}

function withTimeout(p, ms) {
  let t;
  return Promise.race([p, new Promise((_, rej) => { t = setTimeout(() => rej(new Error('timeout')), ms); })])
    .finally(() => clearTimeout(t));
}

/** Runs every adapter for every wallet. One adapter failing never hides other results. */
async function scanWallets(wallets) {
  if (wallets.length > config.maxWallets) throw new Error(`Max ${config.maxWallets} wallets per scan`);
  const findings = [], errors = [];
  const jobs = [];
  for (const w of wallets) for (const a of adapters) {
    if (a.family !== familyOf(w)) continue;
    jobs.push(withTimeout(a.scan(w), config.requestTimeoutMs)
      .then(r => { for (const f of r) {
        if (!ALLOWED_HOSTS.includes(new URL(f.claimUrl).host)) throw new Error(`Blocked non-allow-listed claim URL: ${f.claimUrl}`);
        findings.push(f);
      } })
      .catch(e => errors.push({ adapter: a.id, wallet: w, error: String(e.message || e) })));
  }
  await Promise.all(jobs);
  await priceFindings(findings);
  findings.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1));
  const sum = st => Math.round(findings.filter(f => f.status === st).reduce((s, f) => s + (f.usd || 0), 0) * 100) / 100;
  const totalUsd = sum('claimable');            // only what you can claim yourself
  const otherUsd = Math.round((sum('needs-team') + sum('uncertain')) * 100) / 100;
  const unpriced = findings.filter(f => f.usd == null).length;
  return { wallets, findings, totalUsd, otherUsd, unpriced, errors, adaptersChecked: adapters.map(a => a.id), scannedAt: new Date().toISOString() };
}
module.exports = { parseWallets, scanWallets, expandEns };
