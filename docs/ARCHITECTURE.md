# Architecture
```
Browser (public/) --POST /api/scan--> server.js --> scan.js --> adapters/*.js --> chain RPC / project APIs
```
- `config.js` chains and RPC URLs (env overridable: RPC_ETHEREUM, RPC_SOLANA), limits (25 wallets/scan, 20s per check, 10 scans/min/IP).
- `addresses.js` detects address family (EVM or Solana), checksums, rejects burn addresses.
- `scan.js` parses input (ENS names resolved first), runs each adapter only on wallets of its `family`, in parallel. A failing adapter is reported in `errors` and never hides other results. Every claim URL is checked against the allow-list. Results are priced, sorted by USD, and totalled: `totalUsd` = claimable only, `otherUsd` = needs-team + uncertain.
- `adapters/` one file per source: `{id, name, family, chains, scan(wallet) -> Finding[]}`. Finding shape in `src/types.js`.
- `prices.js` DefiLlama first, CoinGecko fallback, 60s back-off; USDC = $1; MATIC valued at POL price.
- `safety.js` allow-list of official claim hosts.
- UI renders with `textContent` only (no innerHTML) under a strict CSP; long result lists collapse after 5 cards.
## Chains and sources today
Ethereum (Lido, MATIC, MKR), Polygon (Polymarket via public API), Solana (stake accounts).
## Known limits
- Public RPCs rate-limit; use private RPCs in production. Solana `getProgramAccounts` is the heaviest call.
- Rate limiter is in-memory, per instance, and keyed on the first `x-forwarded-for` value, which a caller can spoof. Treat it as basic protection only; put a proper limiter or Cloudflare rules in front before heavy public traffic.
- Polymarket needs the proxy wallet address from the user's profile.
- Prices are indicative. MKR value ignores the Sky delay penalty (upper bound).
- No L2 withdrawal proofs, Pendle, Sablier, EigenLayer yet (see ROADMAP).
