# ClaimScout

Read-only scanner that finds crypto you can still claim (stuck withdrawals, un-upgraded tokens, and more) and links to the **official** claim page. Inspired by hiddenfunds.xyz; the goal is to go further (alerts, guided claims, net-of-gas ranking, open adapter system). See `docs/ROADMAP.md`.

## Quick start
```
npm install
npm test                      # offline tests (27)
LIVE=1 npm test               # also runs live on-chain tests (38 total)
npm run scan -- 0xYourAddress # CLI
npm start                     # web app on http://localhost:3000
```
Optional: `RPC_ETHEREUM` and `RPC_SOLANA` (private RPC URLs, recommended; the public Solana endpoint rate-limits heavy use). `PORT` sets the web port.

## What works today (v0.4.0)
| Adapter | What it finds | Official link |
|---|---|---|
| `lido-withdrawals` | Finalized Lido withdrawals not yet claimed | stake.lido.fi |
| `solana-stake` | SOL in stake accounts that finished cooling down, never delegated, or locked | solana.com/staking |
| `polymarket-redeem` | Resolved Polymarket wins never redeemed (Polygon) | polymarket.com/portfolio |
| `mkr-to-sky` | MKR not yet upgraded to SKY | app.sky.money |
| `matic-to-pol` | MATIC on Ethereum not yet upgraded to POL | portal.polygon.technology |

Also: USD totals (CoinGecko), ENS names, file upload. Chains: Ethereum, Polygon (Polymarket), Solana. Prices are indicative; SKY received for MKR is reduced by a delay penalty, so the MKR USD value is an upper-bound view. Everything else is on the roadmap, not claimed as done.

## Safety rules (non-negotiable)
Read-only. Never ask for wallet connection, signatures, seed phrases or keys. Never store or log addresses. Every claim link must be on the allow-list in `src/safety.js`. See `docs/SECURITY.md`.

## Docs
`docs/ARCHITECTURE.md`, `docs/ADDING_ADAPTERS.md`, `docs/SECURITY.md`, `docs/ROADMAP.md`, `docs/COMPETITOR_ANALYSIS.md`, `docs/DEPLOY_RENDER.md`, `PROJECT.md`, `CHANGELOG.md`.
