# Changelog
## 0.4.0 - 2026-10-18
- NEW `solana-stake` adapter: SOL in stake accounts that are inactive, never delegated, or locked (needs-team). Classification unit-tested; verified live against real accounts.
- NEW `polymarket-redeem` adapter (Polygon): resolved winning positions not redeemed, via Polymarket's public Data API. Users paste the address shown on their Polymarket profile (their proxy wallet).
- Address families (EVM / Solana): each wallet only runs the adapters for its own chain.
- Burn addresses (0x0, 0xdead, Solana incinerator/system program) are rejected with a reason.
- Totals split: `totalUsd` = claimable only; `otherUsd` = needs-team + uncertain.
- UI: status tags, long lists collapse after 5 cards, honest messaging.
- Tests: 38 (27 offline, 11 live).

## 0.3.1 - 2026-10-18
- FIX: Lido adapter crashed whenever a wallet had requests (ethers read-only Result passed as argument). Found by live test; regression test added.
- FIX: CoinGecko free tier rate-limits (HTTP 429). Prices now use DefiLlama first, CoinGecko fallback, 60s back-off on failure.
- MATIC is valued at the POL price (1:1 upgrade; POL is what the user receives).
- Added /healthz, render.yaml, server integration tests (CSP, traversal, rate limit, bad input, wallet cap).
- Tests: 16 offline + 7 live = 23 passing.

## 0.3.0 - 2026-10-18
- Full landing site: sticky nav, hero with scanner, what-we-find, how-it-works, safety, FAQ, footer. Honest Live/Coming tags. No invented stats.

## 0.2.0 - 2026-10-18
- Added `mkr-to-sky` adapter (token + bytes32 symbol verified on-chain; official link app.sky.money).
- USD pricing via CoinGecko (non-fatal on failure), results ranked by value, total shown.
- ENS names (*.eth) accepted; .txt/.csv upload in UI.
- Tests: 6 passing.

## 0.1.0 - 2026-10-18
- Initial MVP: wallet parsing, adapter system, Lido + MATIC adapters, web UI, CLI, rate limit, CSP headers, tests.
