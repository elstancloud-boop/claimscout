'use strict';
// USD prices. Primary: DefiLlama (free, no key). Fallback: CoinGecko free API (rate-limits often).
// MATIC is valued at the POL price because the upgrade is 1:1 and POL is what the user receives.
// Failure is non-fatal: usd becomes null and the UI says so.
const IDS = { ETH: 'ethereum', MATIC: 'polygon-ecosystem-token', MKR: 'maker', SOL: 'solana' };
const STABLE = { USDC: 1 }; // USDC treated as $1
let cache = { at: 0, data: {} };
const TTL_OK = 5 * 60 * 1000, TTL_FAIL = 60 * 1000;

async function fromLlama() {
  const keys = Object.values(IDS).map(i => `coingecko:${i}`).join(',');
  const r = await fetch(`https://coins.llama.fi/prices/current/${keys}`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`llama HTTP ${r.status}`);
  const j = (await r.json()).coins || {};
  const data = {};
  for (const [sym, id] of Object.entries(IDS)) { const p = j[`coingecko:${id}`]?.price; if (typeof p === 'number') data[sym] = p; }
  return data;
}
async function fromCoinGecko() {
  const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(IDS).join(',')}&vs_currencies=usd`, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`coingecko HTTP ${r.status}`);
  const j = await r.json();
  const data = {};
  for (const [sym, id] of Object.entries(IDS)) if (typeof j[id]?.usd === 'number') data[sym] = j[id].usd;
  return data;
}
async function getPrices() {
  const age = Date.now() - cache.at;
  if (age < (Object.keys(cache.data).length ? TTL_OK : TTL_FAIL)) return cache.data;
  let data = {};
  for (const src of [fromLlama, fromCoinGecko]) {
    try { const d = await src(); data = { ...d, ...data }; if (Object.keys(IDS).every(s => s in data)) break; } catch { /* try next */ }
  }
  if (Object.keys(data).length) cache = { at: Date.now(), data };
  else cache = { at: Date.now(), data: cache.data }; // keep stale prices if any; back off 60s only when empty
  return cache.data;
}
/** Adds `usd` (number|null) to each finding. Never throws. */
async function priceFindings(findings) {
  const p = await getPrices();
  const px = { ...p, ...STABLE };
  for (const f of findings) f.usd = px[f.symbol] != null ? Math.round(parseFloat(f.amount) * px[f.symbol] * 100) / 100 : null;
  return findings;
}
module.exports = { priceFindings, getPrices };
