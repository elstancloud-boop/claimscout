'use strict';
// Resolved Polymarket positions that were never redeemed (Polygon, USDC).
// Data: Polymarket public Data API GET /positions?user=<proxy wallet>&redeemable=true. Fields verified live:
// redeemable, currentValue (USD), size, curPrice, title, outcome, conditionId.
// NOTE: Polymarket holds positions in a proxy wallet. Users must paste the address shown on their Polymarket profile.
const API = 'https://data-api.polymarket.com/positions';

async function fetchRedeemable(wallet) {
  const out = [];
  for (let offset = 0; offset < 1500; offset += 500) {
    const url = `${API}?user=${wallet.toLowerCase()}&redeemable=true&sizeThreshold=0.01&limit=500&offset=${offset}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'ClaimScout/0.4' } });
    if (!r.ok) throw new Error(`Polymarket API HTTP ${r.status}`);
    const page = await r.json();
    if (!Array.isArray(page)) throw new Error('Polymarket API: unexpected response');
    out.push(...page);
    if (page.length < 500) break;
  }
  return out;
}
module.exports = {
  id: 'polymarket-redeem', name: 'Polymarket winnings never redeemed', family: 'evm', chains: ['polygon'],
  async scan(wallet) {
    const rows = await fetchRedeemable(wallet);
    return rows.filter(p => p.redeemable === true && Number(p.currentValue) > 0).map(p => ({
      adapter: 'polymarket-redeem', protocol: 'Polymarket', category: 'Ended positions', chain: 'Polygon', wallet,
      title: `${p.title} (${p.outcome}) has resolved and can be redeemed`,
      amount: Number(p.currentValue).toFixed(2), symbol: 'USDC', status: 'claimable',
      claimUrl: 'https://polymarket.com/portfolio',
      steps: [
        'Open Polymarket and sign in with the account that owns this position.',
        'Go to Portfolio and find the resolved market.',
        'Press Redeem / Claim and confirm. Polymarket is not available in every region; follow its rules.',
      ],
      source: 'https://docs.polymarket.com/developers/misc-endpoints/data-api-get-positions',
    }));
  },
};
