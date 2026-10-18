# Architecture
```
Browser (public/) --POST /api/scan--> server.js --> scan.js --> adapters/*.js --> rpc.js --> chain RPC
```
- `config.js` chains, RPC (env overridable), limits (25 wallets/scan, 20s timeout, 10 scans/min/IP).
- `scan.js` parses addresses (checksum, dedupe), runs every adapter x wallet in parallel; a failing adapter is reported in `errors` and never hides other results; every claim URL is checked against the allow-list.
- `adapters/` one file per source. Contract: `{id, name, chains, scan(wallet) -> Finding[]}`; Finding shape in `src/types.js`.
- `safety.js` allow-list of official hosts.
- UI renders with `textContent` only (no innerHTML) and a strict CSP.
## Known limits
Ethereum only; no USD pricing yet; public RPC may rate-limit; in-memory rate limiter resets on restart and is per-instance.
