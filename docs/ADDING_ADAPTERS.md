# Adding an adapter
1. Find the official docs for the contract/API. Record the URL.
2. Copy `src/adapters/matic.js`. Set `id`, `name`, `family` (`'evm'` or `'solana'`, decides which wallets it runs on) and `chains`.
3. Use `getProvider(chain)` for reads. Never use a signer or private key.
4. Verify addresses on-chain (e.g. `symbol()`), throw if unexpected.
5. Return Findings with `status`: `claimable` (user can do it), `needs-team` (only project can release), `uncertain`.
6. Add the claim host to `src/safety.js` with a comment citing where the project publishes it.
7. Register in `src/adapters/index.js`.
8. Test with a real wallet that holds a position; update README table and CHANGELOG.
## Backlog candidates (each needs verification first)
MKR to SKY, RNDR to RENDER, Arbitrum/OP/Base withdrawals (need SDK proofs), Polygon bridge exits, EigenLayer queue, Pendle matured PT, Sablier ended streams, Polymarket redeemable, Solana stake accounts, shut-down chains.
